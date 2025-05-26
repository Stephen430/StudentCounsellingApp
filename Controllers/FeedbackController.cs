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
    public class FeedbackController : Controller
    {
        private readonly ApplicationDbContext _context;

        public FeedbackController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> Create(int appointmentId)
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
                .FirstOrDefaultAsync(a => a.Id == appointmentId && a.StudentId == student.Id);

            if (appointment == null)
            {
                return NotFound();
            }

            var viewModel = new FeedbackViewModel
            {
                AppointmentId = appointmentId,
                CounsellorName = $"{appointment.Counsellor.FirstName} {appointment.Counsellor.LastName}"
            };

            return View(viewModel);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(FeedbackViewModel model)
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
                    .FirstOrDefaultAsync(a => a.Id == model.AppointmentId && a.StudentId == student.Id);

                if (appointment == null)
                {
                    return NotFound();
                }

                // In a real application, you would have a Feedback table
                // For now, we'll just redirect to the appointments page
                TempData["SuccessMessage"] = "Thank you for your feedback!";
                return RedirectToAction("Details", "Appointment", new { id = model.AppointmentId });
            }

            return View(model);
        }
    }
}
