using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentCounsellingApp.Data;
using StudentCounsellingApp.Models;
using StudentCounsellingApp.ViewModels;

namespace StudentCounsellingApp.Controllers
{
    [Authorize]
    public class StudentController : Controller
    {
        private readonly ApplicationDbContext _context;

        public StudentController(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Profile()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var student = await _context.Students
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (student == null)
            {
                return NotFound();
            }

            return View(student);
        }

        [HttpGet]
        public async Task<IActionResult> Edit()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var student = await _context.Students
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (student == null)
            {
                return NotFound();
            }

            var viewModel = new StudentProfileViewModel
            {
                FirstName = student.FirstName,
                LastName = student.LastName,
                StudentId = student.StudentId,
                Department = student.Department,
                YearOfStudy = student.YearOfStudy,
                PhoneNumber = student.PhoneNumber,
                DateOfBirth = student.DateOfBirth
            };

            return View(viewModel);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(StudentProfileViewModel model)
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

                student.FirstName = model.FirstName;
                student.LastName = model.LastName;
                student.StudentId = model.StudentId;
                student.Department = model.Department;
                student.YearOfStudy = model.YearOfStudy;
                student.PhoneNumber = model.PhoneNumber;
                student.DateOfBirth = model.DateOfBirth;

                _context.Update(student);
                await _context.SaveChangesAsync();

                return RedirectToAction(nameof(Profile));
            }

            return View(model);
        }
    }
}
