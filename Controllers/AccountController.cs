using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentCounsellingApp.Data;
using StudentCounsellingApp.Models;
using StudentCounsellingApp.ViewModels;
using System.Security.Cryptography;
using System.Text;

namespace StudentCounsellingApp.Controllers
{
    public class AccountController : Controller
    {
        private readonly ApplicationDbContext _context;

        public AccountController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult Register()
        {
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Register(RegisterViewModel model)
        {
            if (ModelState.IsValid)
            {
                // Check if user already exists
                var existingUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == model.Email || u.Username == model.Username);

                if (existingUser != null)
                {
                    ModelState.AddModelError(string.Empty, "Username or Email already exists.");
                    return View(model);
                }

                // Create new user
                var user = new User
                {
                    Username = model.Username,
                    Email = model.Email,
                    PasswordHash = HashPassword(model.Password),
                    Role = "Student", // Default role
                    CreatedAt = DateTime.UtcNow
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                // Create student profile
                var student = new Student
                {
                    FirstName = model.FirstName,
                    LastName = model.LastName,
                    UserId = user.Id
                };

                _context.Students.Add(student);
                await _context.SaveChangesAsync();

                // Automatically sign in the user
                await SignInUserAsync(user);

                return RedirectToAction("Index", "Home");
            }

            return View(model);
        }

        [HttpGet]
        public IActionResult Login(string returnUrl = null)
        {
            ViewData["ReturnUrl"] = returnUrl;
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Login(LoginViewModel model, string returnUrl = null)
        {
            ViewData["ReturnUrl"] = returnUrl;
            if (ModelState.IsValid)
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Username == model.Username);

                if (user != null && VerifyPassword(model.Password, user.PasswordHash))
                {
                    // Update last login
                    user.LastLogin = DateTime.UtcNow;
                    _context.Update(user);
                    await _context.SaveChangesAsync();

                    // Sign in the user
                    await SignInUserAsync(user);

                    // Redirect to returnUrl if provided and local
                    if (!string.IsNullOrEmpty(returnUrl) && Url.IsLocalUrl(returnUrl))
                    {
                        return Redirect(returnUrl);
                    }
                    return RedirectToAction("Index", "Dashboard");
                }

                ModelState.AddModelError(string.Empty, "Invalid login attempt.");
            }

            return View(model);
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync("Cookies");
            return RedirectToAction("Index", "Home");
        }

        private async Task SignInUserAsync(User user)
        {
            try
            {
                // Validate user data before creating claims
                if (user == null)
                {
                    throw new ArgumentNullException(nameof(user), "User cannot be null when signing in");
                }

                if (user.Id <= 0)
                {
                    throw new InvalidOperationException($"User ID {user.Id} is invalid");
                }

                // Create claims
                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.Name, user.Username ?? "Unknown"),
                    new Claim(ClaimTypes.Email, user.Email ?? "unknown@example.com"),
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Role, user.Role ?? "Student"),
                    new Claim("LoginTimestamp", DateTime.UtcNow.ToString("o"))
                };

                // Set up authentication
                var identity = new ClaimsIdentity(claims, "Cookies");
                var principal = new ClaimsPrincipal(identity);

                var authProperties = new AuthenticationProperties
                {
                    IsPersistent = true,
                    ExpiresUtc = DateTimeOffset.UtcNow.AddHours(24),
                    AllowRefresh = true
                };

                // Sign in the user
                await HttpContext.SignInAsync(
                    "Cookies",
                    principal,
                    authProperties
                );
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException("Failed to sign in user", ex);
            }
        }

        private string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return Convert.ToBase64String(hashedBytes);
            }
        }

        private bool VerifyPassword(string password, string hash)
        {
            return HashPassword(password) == hash;
        }
    }
}
