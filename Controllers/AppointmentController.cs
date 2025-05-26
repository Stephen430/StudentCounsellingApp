using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using StudentCounsellingApp.Data;
using StudentCounsellingApp.Models;
using StudentCounsellingApp.ViewModels;

namespace StudentCounsellingApp.Controllers
{
    [Authorize]
    public class AppointmentController : Controller
    {
        private readonly ApplicationDbContext _context;

        public AppointmentController(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Index()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var student = await _context.Students
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (student == null)
            {
                return NotFound();
            }

            var appointments = await _context.Appointments
                .Include(a => a.Counsellor)
                .Where(a => a.StudentId == student.Id)
                .OrderByDescending(a => a.AppointmentDate)
                .ToListAsync();

            return View(appointments);
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
            }

            var appointment = await _context.Appointments
                .Include(a => a.Counsellor)
                .Include(a => a.SessionNotes.Where(n => !n.IsPrivate))
                .FirstOrDefaultAsync(a => a.Id == id && a.StudentId == student.Id);

            if (appointment == null)
            {
                return NotFound();
            }

            return View(appointment);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
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
    }
}
