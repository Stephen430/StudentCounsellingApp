using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using StudentCounsellingApp.Data;
using StudentCounsellingApp.Models;
using StudentCounsellingApp.ViewModels;

namespace StudentCounsellingApp.Controllers
{
    [Authorize]
    public class AppointmentController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<AppointmentController> _logger;

        public AppointmentController(ApplicationDbContext context, ILogger<AppointmentController> logger)
        {
            _context = context;
            _logger = logger;
        }
        public async Task<IActionResult> Index()
        {
            try
            {
                // Safely parse user ID with proper error handling
                if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
                {
                    TempData["ErrorMessage"] = "Unable to identify your account. Please log in again.";
                    return RedirectToAction("Login", "Account");
                }

                var student = await _context.Students
                    .FirstOrDefaultAsync(s => s.UserId == userId);

                if (student == null)
                {
                    TempData["ErrorMessage"] = "Student record not found.";
                    return NotFound();
                }

                // Use AsSplitQuery for better performance and error prevention
                var appointments = await _context.Appointments
                    .Include(a => a.Counsellor)
                    .Where(a => a.StudentId == student.Id)
                    .OrderByDescending(a => a.AppointmentDate)
                    .AsSplitQuery()
                    .ToListAsync();

                // Add success message if redirected from another action
                if (TempData["SuccessMessage"] != null)
                {
                    ViewBag.SuccessMessage = TempData["SuccessMessage"];
                }

                return View(appointments);
            }
            catch (Exception ex)
            {
                // Provide a friendly error message while logging the actual exception details
                TempData["ErrorMessage"] = "There was a problem loading your appointments. Please try again.";
                // Log the exception (would typically use ILogger here, but adding a simple comment for now)
                System.Diagnostics.Debug.WriteLine($"Error in AppointmentController.Index: {ex.Message}");
                return View(new List<Appointment>()); // Return empty list to avoid null reference exceptions
            }
        }

        [HttpGet]
        public async Task<IActionResult> Create()
        {
            var counsellors = await _context.Counsellors
                .Where(c => c.IsAvailable)
                .Select(c => new { c.Id, FullName = $"{c.FirstName} {c.LastName}" })
                .ToListAsync();

            ViewBag.Counsellors = new SelectList(counsellors, "Id", "FullName");

            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(AppointmentViewModel model)
        {
            if (ModelState.IsValid)
            {
                var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
                var student = await _context.Students
                    .FirstOrDefaultAsync(s => s.UserId == userId);

                if (student == null)
                {
                    return NotFound();
                }

                var appointment = new Appointment
                {
                    StudentId = student.Id,
                    CounsellorId = model.CounsellorId,
                    AppointmentDate = model.AppointmentDate,
                    StartTime = model.StartTime,
                    EndTime = model.StartTime.Add(TimeSpan.FromHours(1)), // Default 1 hour appointment
                    Subject = model.Subject,
                    Description = model.Description,
                    Status = "Scheduled",
                    CreatedAt = DateTime.UtcNow
                };

                _context.Appointments.Add(appointment);
                await _context.SaveChangesAsync();

                return RedirectToAction(nameof(Index));
            }

            var counsellors = await _context.Counsellors
                .Where(c => c.IsAvailable)
                .Select(c => new { c.Id, FullName = $"{c.FirstName} {c.LastName}" })
                .ToListAsync();

            ViewBag.Counsellors = new SelectList(counsellors, "Id", "FullName");

            return View(model);
        }
        public async Task<IActionResult> Details(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var student = await _context.Students
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (student == null)
            {
                return NotFound();
            }            // First fetch the appointment without SessionNotes to avoid any issues
            var appointment = await _context.Appointments
                .Include(a => a.Counsellor)
                .FirstOrDefaultAsync(a => a.Id == id && a.StudentId == student.Id);

            if (appointment == null)
            {
                return NotFound();
            }

            // Then try to load session notes separately with proper error handling
            try
            {
                // Load session notes separately to avoid issues
                var sessionNotes = await _context.SessionNotes
                    .Where(n => n.AppointmentId == id && !n.IsPrivate)
                    .ToListAsync();

                // Manually assign to avoid null reference exceptions
                if (appointment.SessionNotes == null)
                {
                    appointment.SessionNotes = sessionNotes;
                }
            }
            catch (Exception ex)
            {
                // Log the error but continue - don't let session notes break the whole page
                // This prevents errors from affecting the main appointment details view
                System.Diagnostics.Debug.WriteLine($"Error loading session notes: {ex.Message}");
                appointment.SessionNotes = new List<SessionNote>();
                ModelState.AddModelError(string.Empty, "Session notes could not be loaded.");
            }

            return View(appointment);
        }
        [HttpPost]
        [ActionName("Cancel")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> CancelConfirmed(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var student = await _context.Students
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (student == null)
            {
                return NotFound();
            }

            var appointment = await _context.Appointments
                .FirstOrDefaultAsync(a => a.Id == id && a.StudentId == student.Id);

            if (appointment == null)
            {
                return NotFound();
            }

            appointment.Status = "Cancelled";
            appointment.UpdatedAt = DateTime.UtcNow;

            _context.Update(appointment);
            await _context.SaveChangesAsync();

            return RedirectToAction(nameof(Index));
        }

        [HttpGet]
        public async Task<IActionResult> Cancel(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var student = await _context.Students
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (student == null)
            {
                return NotFound();
            }

            var appointment = await _context.Appointments
                .Include(a => a.Counsellor)
                .FirstOrDefaultAsync(a => a.Id == id && a.StudentId == student.Id);

            if (appointment == null)
            {
                return NotFound();
            }

            // Only allow cancelling future scheduled appointments
            if (appointment.AppointmentDate < DateTime.Today || appointment.Status != "Scheduled")
            {
                TempData["ErrorMessage"] = "Only upcoming scheduled appointments can be cancelled.";
                return RedirectToAction(nameof(Index));
            }

            return View(appointment);
        }

        [HttpGet]
        public async Task<IActionResult> Edit(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var student = await _context.Students
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (student == null)
            {
                return NotFound();
            }

            var appointment = await _context.Appointments
                .FirstOrDefaultAsync(a => a.Id == id && a.StudentId == student.Id);

            if (appointment == null)
            {
                return NotFound();
            }

            // Only allow editing future scheduled appointments
            if (appointment.AppointmentDate < DateTime.Today || appointment.Status != "Scheduled")
            {
                TempData["ErrorMessage"] = "Only upcoming scheduled appointments can be edited.";
                return RedirectToAction(nameof(Index));
            }

            var model = new AppointmentViewModel
            {
                CounsellorId = appointment.CounsellorId,
                AppointmentDate = appointment.AppointmentDate,
                StartTime = appointment.StartTime,
                Subject = appointment.Subject,
                Description = appointment.Description
            };

            var counsellors = await _context.Counsellors
                .Where(c => c.IsAvailable)
                .Select(c => new { c.Id, FullName = $"{c.FirstName} {c.LastName}" })
                .ToListAsync();

            ViewBag.Counsellors = new SelectList(counsellors, "Id", "FullName");
            ViewBag.AppointmentId = id;

            return View(model);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, AppointmentViewModel model)
        {
            if (ModelState.IsValid)
            {
                var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
                var student = await _context.Students
                    .FirstOrDefaultAsync(s => s.UserId == userId);

                if (student == null)
                {
                    return NotFound();
                }

                var appointment = await _context.Appointments
                    .FirstOrDefaultAsync(a => a.Id == id && a.StudentId == student.Id);

                if (appointment == null)
                {
                    return NotFound();
                }

                // Only allow editing future scheduled appointments
                if (appointment.AppointmentDate < DateTime.Today || appointment.Status != "Scheduled")
                {
                    TempData["ErrorMessage"] = "Only upcoming scheduled appointments can be edited.";
                    return RedirectToAction(nameof(Index));
                }

                // Update appointment details
                appointment.CounsellorId = model.CounsellorId;
                appointment.AppointmentDate = model.AppointmentDate;
                appointment.StartTime = model.StartTime;
                appointment.EndTime = model.StartTime.Add(TimeSpan.FromHours(1)); // Keep 1 hour duration
                appointment.Subject = model.Subject;
                appointment.Description = model.Description;
                appointment.UpdatedAt = DateTime.UtcNow;

                _context.Update(appointment);
                await _context.SaveChangesAsync();

                return RedirectToAction(nameof(Details), new { id = appointment.Id });
            }

            var counsellors = await _context.Counsellors
                .Where(c => c.IsAvailable)
                .Select(c => new { c.Id, FullName = $"{c.FirstName} {c.LastName}" })
                .ToListAsync();

            ViewBag.Counsellors = new SelectList(counsellors, "Id", "FullName");
            ViewBag.AppointmentId = id;

            return View(model);
        }
    }
}
