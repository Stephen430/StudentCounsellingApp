using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentCounsellingApp.Data;
using StudentCounsellingApp.Models;

namespace StudentCounsellingApp.Controllers
{
    public class CounsellorController : Controller
    {
        private readonly ApplicationDbContext _context;

        public CounsellorController(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Index()
        {
            var counsellors = await _context.Counsellors
                .Where(c => c.IsAvailable)
                .ToListAsync();

            return View(counsellors);
        }

        public async Task<IActionResult> Details(int id)
        {
            var counsellor = await _context.Counsellors
                .FirstOrDefaultAsync(c => c.Id == id);

            if (counsellor == null)
            {
                return NotFound();
            }

            return View(counsellor);
        }
    }
}
