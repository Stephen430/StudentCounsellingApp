using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using StudentCounsellingApp.Data;

namespace StudentCounsellingApp.Services
{
    public class UserService
    {
        private readonly ApplicationDbContext _context;

        public UserService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<string> GetUserFullNameAsync(ClaimsPrincipal user)
        {
            if (!user.Identity.IsAuthenticated)
            {
                return string.Empty;
            }

            var userId = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier));
            var userName = user.Identity.Name;

            // Try to get the student or counsellor details
            var student = await _context.Students
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (student != null)
            {
                return $"{student.FirstName} {student.LastName}";
            }

            var counsellor = await _context.Counsellors
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (counsellor != null)
            {
                return $"{counsellor.FirstName} {counsellor.LastName}";
            }

            // Fallback to username if no additional info is available
            return userName;
        }
    }
}
