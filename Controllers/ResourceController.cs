using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentCounsellingApp.Data;
using StudentCounsellingApp.Models;

namespace StudentCounsellingApp.Controllers
{
    public class ResourceController : Controller
    {
        private readonly ApplicationDbContext _context;

        public ResourceController(ApplicationDbContext context)
        {
            _context = context;
        }

        public IActionResult Index()
        {
            // In a real application, you would have a Resources table
            // For now, we'll just return a view with static resources
            return View();
        }

        public IActionResult MentalHealth()
        {
            return View();
        }

        public IActionResult AcademicSupport()
        {
            return View();
        }

        public IActionResult CareerGuidance()
        {
            return View();
        }
    }
}
