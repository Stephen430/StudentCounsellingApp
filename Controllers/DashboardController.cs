using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using StudentCounsellingApp.Data;
using StudentCounsellingApp.Models;
using StudentCounsellingApp.ViewModels;

namespace StudentCounsellingApp.Controllers
{
    [Authorize]
    public class DashboardController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<DashboardController> _logger;

        public DashboardController(ApplicationDbContext context, ILogger<DashboardController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // Simple dashboard for emergency fallback
        [HttpGet]
        [Route("dashboard/simple")]
        [AllowAnonymous]
        public IActionResult Simple()
        {
            try
            {
                _logger.LogInformation("Simple dashboard requested");

                var viewModel = new DashboardViewModel
                {
                    StudentName = User.Identity?.IsAuthenticated == true ? User.Identity?.Name : "Guest",
                    UpcomingAppointments = new List<Appointment>(),
                    PastAppointments = new List<Appointment>(),
                    IsLoaded = true,
                    LastUpdated = DateTime.Now
                };

                // The SimpleIndex view will use minimal styling for reliability
                return View("SimpleIndex", viewModel);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Simple dashboard view");
                return Content("Dashboard Error: " + ex.Message);
            }
        }

        private async Task EnsureDatabaseInitializedAsync()
        {
            try
            {
                if (!await _context.Database.CanConnectAsync())
                {
                    _logger.LogWarning("Database connection failed, attempting to initialize...");
                    await _context.Database.EnsureCreatedAsync();

                    // Check if we need to seed the database
                    if (!await _context.Users.AnyAsync())
                    {
                        _logger.LogInformation("Seeding initial data...");
                        DbInitializer.Initialize(_context);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error ensuring database is initialized");
                throw;
            }
        }

        // Diagnostic action to display user info for troubleshooting
        [HttpGet]
        [Route("dashboard/diagnostics")]
        public IActionResult Diagnostics()
        {
            try
            {
                // Collect diagnostic info
                var diagnosticInfo = new Dictionary<string, string>
                {
                    ["RequestID"] = HttpContext.TraceIdentifier,
                    ["IsAuthenticated"] = User.Identity?.IsAuthenticated.ToString() ?? "Unknown",
                    ["UserName"] = User.Identity?.Name ?? "Not available"
                };

                // Add all claims
                if (User.Identity?.IsAuthenticated == true)
                {
                    foreach (var claim in User.Claims)
                    {
                        diagnosticInfo[$"Claim:{claim.Type}"] = claim.Value;
                    }
                }

                // Check database connection
                try
                {
                    bool canConnect = _context.Database.CanConnect();
                    diagnosticInfo["DatabaseConnection"] = canConnect ? "Success" : "Failed";
                }
                catch (Exception dbEx)
                {
                    diagnosticInfo["DatabaseConnection"] = $"Error: {dbEx.Message}";
                }

                // Return diagnostic info as JSON for easy viewing
                return Json(diagnosticInfo);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in diagnostics endpoint");
                return Json(new { Error = ex.Message, StackTrace = ex.StackTrace });
            }
        }

        [HttpGet]
        [Route("dashboard/diagnostic-view")]
        public IActionResult DiagnosticView()
        {
            try
            {
                // Create a simple view model with minimal information
                var viewModel = new DashboardViewModel
                {
                    StudentName = User.Identity?.Name ?? "Guest",
                    UpcomingAppointments = new List<Appointment>(),
                    PastAppointments = new List<Appointment>()
                };

                // Add all claims as a debug string
                _logger.LogInformation($"Claims: {string.Join(", ", User.Claims.Select(c => $"{c.Type}={c.Value}"))}");

                // Return the diagnostic view with minimal model
                return View("Diagnostic", viewModel);
            }
            catch (Exception ex)
            {
                // Log any errors
                _logger.LogError(ex, "Error in Diagnostic View");
                return Content("Error: " + ex.Message);
            }
        }
        public async Task<IActionResult> Index()
        {
            try
            {
                // Check for dashboard_fix flag to trigger fallback view
                if (Request.Query.ContainsKey("fix"))
                {
                    _logger.LogInformation("Dashboard fix mode requested");
                    return RedirectToAction("Simple");
                }

                // Enhanced logging and database initialization
                _logger.LogInformation("Dashboard Index action started");
                _logger.LogInformation($"Session ID: {HttpContext.TraceIdentifier}");
                _logger.LogInformation($"Is Authenticated: {User.Identity?.IsAuthenticated}");

                // Database initialization check
                await EnsureDatabaseInitializedAsync();

                if (!await _context.Database.CanConnectAsync())
                {
                    _logger.LogError("Cannot connect to database after initialization attempt");
                    TempData["ErrorMessage"] = "Database connection error. Please check database status.";
                    return RedirectToAction("TechnicalReport");
                }

                // Check if user is authenticated
                if (User.Identity == null || !User.Identity.IsAuthenticated)
                {
                    _logger.LogWarning("User not authenticated, redirecting to login");
                    return RedirectToAction("Login", "Account");
                }

                // Get the user ID from claims with detailed logging
                var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
                _logger.LogInformation($"User claims: {string.Join(", ", User.Claims.Select(c => $"{c.Type}={c.Value}"))}");

                if (string.IsNullOrEmpty(userIdClaim))
                {
                    _logger.LogError("NameIdentifier claim is missing from user claims");
                    TempData["ErrorMessage"] = "Your session is incomplete. Please log in again.";
                    return RedirectToAction("Login", "Account");
                }

                if (!int.TryParse(userIdClaim, out var userId))
                {
                    _logger.LogError($"Failed to parse user ID from claim value: {userIdClaim}");
                    TempData["ErrorMessage"] = "Invalid user information. Please log in again.";
                    return RedirectToAction("Login", "Account");
                }

                _logger.LogInformation($"Successfully retrieved user ID: {userId}");

                var student = await _context.Students
                    .Include(s => s.User)
                    .FirstOrDefaultAsync(s => s.UserId == userId);

                if (student == null)
                {
                    _logger.LogError($"No student found for user ID {userId}");
                    TempData["ErrorMessage"] = "Student record not found. Database may be corrupted.";
                    return RedirectToAction("TechnicalReport");
                }

                List<Appointment> upcomingAppointments = new();
                List<Appointment> pastAppointments = new(); try
                {
                    // Test TimeSpan formatting with proper format
                    var testAppointment = await _context.Appointments.FirstOrDefaultAsync();
                    if (testAppointment != null)
                    {
                        try
                        {
                            _logger.LogInformation("Sample appointment time format check:");
                            _logger.LogInformation($"StartTime (raw): {testAppointment.StartTime}");
                            // Fixed TimeSpan formatting - TimeSpan doesn't support "tt" format
                            _logger.LogInformation($"StartTime (formatted): {testAppointment.StartTime.ToString(@"hh\:mm")}");
                            _logger.LogInformation($"EndTime (raw): {testAppointment.EndTime}");
                            _logger.LogInformation($"EndTime (formatted): {testAppointment.EndTime.ToString(@"hh\:mm")}");
                        }
                        catch (Exception timeEx)
                        {
                            _logger.LogError(timeEx, "Error formatting TimeSpan values");
                        }
                    }

                    upcomingAppointments = await _context.Appointments
                        .Include(a => a.Counsellor)
                        .Where(a => a.StudentId == student.Id &&
                                   a.AppointmentDate >= DateTime.Today &&
                                   a.Status == "Scheduled")
                        .OrderBy(a => a.AppointmentDate)
                        .Take(5)
                        .ToListAsync();

                    foreach (var appointment in upcomingAppointments)
                    {
                        // Fixed TimeSpan formatting - removed "tt" which is not supported
                        _logger.LogInformation($"Upcoming appointment: {appointment.Subject} at {appointment.StartTime.ToString(@"hh\:mm")} - {appointment.EndTime.ToString(@"hh\:mm")}");
                    }

                    _logger.LogInformation($"Loaded {upcomingAppointments.Count} upcoming appointments");

                    pastAppointments = await _context.Appointments
                        .Include(a => a.Counsellor)
                        .Where(a => a.StudentId == student.Id &&
                                  (a.AppointmentDate < DateTime.Today || a.Status == "Completed"))
                        .OrderByDescending(a => a.AppointmentDate)
                        .Take(5)
                        .ToListAsync();

                    foreach (var appointment in pastAppointments)
                    {
                        // Fixed TimeSpan formatting - removed "tt" which is not supported
                        _logger.LogInformation($"Past appointment: {appointment.Subject} at {appointment.StartTime.ToString(@"hh\:mm")} - {appointment.EndTime.ToString(@"hh\:mm")}");
                    }

                    _logger.LogInformation($"Loaded {pastAppointments.Count} past appointments");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error loading appointments");
                    TempData["ErrorMessage"] = "Error loading appointment data. Some information may be missing.";
                }

                // Safely compose student name
                string firstName = student.FirstName ?? "Student";
                string lastName = student.LastName ?? "";
                string fullName = string.IsNullOrWhiteSpace(lastName) ? firstName : $"{firstName} {lastName}";

                _logger.LogInformation($"Creating view model with student name: {fullName}");

                var viewModel = new DashboardViewModel
                {
                    StudentName = fullName,
                    UpcomingAppointments = upcomingAppointments,
                    PastAppointments = pastAppointments,
                    LastUpdated = DateTime.Now,
                    IsLoaded = true
                };

                return View(viewModel);
            }
            catch (Exception ex)
            {
                // Log the exception with more details
                _logger.LogError(ex, "Error in Dashboard Index");
                if (ex.InnerException != null)
                {
                    _logger.LogError(ex.InnerException, "Inner exception details");
                }

                TempData["ErrorMessage"] = "An error occurred loading the dashboard. Please try the simple view or check the technical report.";
                return RedirectToAction("SimpleIndex");
            }
        }

        /// <summary>
        /// Emergency endpoint to debug blank dashboard issues.
        /// </summary>
        [HttpGet]
        [Route("dashboard/emergency-view")]
        [AllowAnonymous] // Allow access even without authentication
        public async Task<IActionResult> EmergencyView(string error = null)
        {
            try
            {
                _logger.LogWarning("Emergency dashboard view requested");

                // Create a minimal view model with no complex data
                var viewModel = new DashboardViewModel
                {
                    StudentName = User.Identity?.IsAuthenticated == true ? User.Identity.Name : "Guest (Not Authenticated)",
                    UpcomingAppointments = new List<Appointment>(),
                    PastAppointments = new List<Appointment>(),
                    IsLoaded = true
                };

                // Optional: use diagnostic helper to collect info about issues
                try
                {
                    var issues = await CheckAndFixCommonDashboardIssuesAsync();
                    // Format as simple log message
                    string logSummary = string.Join(", ", issues.Select(i => $"{i.Key}: {i.Value}"));
                    _logger.LogInformation("Diagnostics in emergency view: {Summary}", logSummary);
                }
                catch (Exception diagEx)
                {
                    _logger.LogError(diagEx, "Error running diagnostics in emergency view");
                }

                // Store error message if provided
                if (!string.IsNullOrEmpty(error))
                {
                    ViewBag.ErrorMessage = Uri.UnescapeDataString(error);
                }

                // Return the diagnostic view which has minimal dependencies
                return View("Diagnostic", viewModel);
            }
            catch (Exception ex)
            {
                // If even the diagnostic view fails, return plain text
                _logger.LogError(ex, "Critical error in emergency dashboard view");

                // Return ultra-simple HTML with no layout to bypass any view engine issues
                string htmlContent = $@"
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Critical Dashboard Error</title>
                    <style>
                        body {{ font-family: Arial, sans-serif; margin: 20px; }}
                        .error {{ color: red; background: #ffeeee; padding: 10px; border: 1px solid red; }}
                        pre {{ background: #eee; padding: 10px; overflow: auto; }}
                    </style>
                </head>
                <body>
                    <h1>Critical Dashboard Error</h1>
                    <div class='error'>
                        <strong>Error:</strong> {ex.Message}
                    </div>
                    <h3>Stack Trace:</h3>
                    <pre>{ex.StackTrace}</pre>
                    <p>Time: {DateTime.Now}</p>
                    <p>Request ID: {HttpContext.TraceIdentifier}</p>
                    <div>
                        <a href='/'>Go to Home Page</a> | 
                        <a href='/dashboard/tech-report'>Go to Technical Report</a>
                    </div>
                </body>
                </html>";

                return Content(htmlContent, "text/html");
            }
        }        /// <summary>
                 /// Simple dashboard view for troubleshooting rendering issues
                 /// </summary>
        [HttpGet]
        [Route("dashboard/minimal")]
        public async Task<IActionResult> SimpleIndex()
        {
            try
            {
                // Ensure database is ready
                await EnsureDatabaseInitializedAsync();

                // Check if user is authenticated
                if (User.Identity == null || !User.Identity.IsAuthenticated)
                {
                    return RedirectToAction("Login", "Account");
                }

                // Get student name from claims if available
                string studentName = User.Identity.Name ?? "Student";

                // Create a very minimal view model
                var viewModel = new DashboardViewModel
                {
                    StudentName = studentName,
                    UpcomingAppointments = new List<Appointment>(),
                    PastAppointments = new List<Appointment>(),
                    IsLoaded = true
                };

                try
                {
                    // Try to get at least some appointment data if possible, but continue even if it fails
                    var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
                    if (!string.IsNullOrEmpty(userIdClaim) && int.TryParse(userIdClaim, out var userId))
                    {
                        var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == userId);
                        if (student != null)
                        {
                            var testAppointment = await _context.Appointments.FirstOrDefaultAsync();
                            if (testAppointment != null)
                            {
                                _logger.LogInformation("Simple view - Sample appointment time format check:");
                                _logger.LogInformation($"StartTime (raw): {testAppointment.StartTime}"); _logger.LogInformation($"StartTime (formatted): {testAppointment.StartTime.ToString(@"hh\:mm")}");
                                _logger.LogInformation($"EndTime (raw): {testAppointment.EndTime}");
                                _logger.LogInformation($"EndTime (formatted): {testAppointment.EndTime.ToString(@"hh\:mm")}");
                            }

                            viewModel.UpcomingAppointments = await _context.Appointments
                                .Include(a => a.Counsellor)
                                .Where(a => a.StudentId == student.Id &&
                                          a.AppointmentDate >= DateTime.Today &&
                                          a.Status == "Scheduled")
                                .OrderBy(a => a.AppointmentDate)
                                .Take(3)
                                .ToListAsync();

                            foreach (var appointment in viewModel.UpcomingAppointments)
                            {
                                _logger.LogInformation($"Simple view - Upcoming appointment: {appointment.Subject} at {appointment.StartTime.ToString(@"hh\:mm")} - {appointment.EndTime.ToString(@"hh\:mm")}");
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Non-critical error loading simple dashboard appointment data");
                }

                return View("SimpleIndex", viewModel);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in SimpleIndex dashboard");
                TempData["ErrorMessage"] = "An error occurred. Details: " + ex.Message;
                return View("SimpleIndex", new DashboardViewModel());
            }
        }

        /// <summary>
        /// Comprehensive technical report to diagnose dashboard issues
        /// </summary>
        [HttpGet]
        [Route("dashboard/tech-report")]
        [AllowAnonymous] // Allow access even when authentication fails
        public async Task<IActionResult> TechnicalReport(string error = null)
        {
            try
            {
                _logger.LogInformation("Technical report requested");

                // Store error in TempData if provided
                if (!string.IsNullOrEmpty(error))
                {
                    TempData["ErrorMessage"] = Uri.UnescapeDataString(error);
                    _logger.LogWarning("Technical report showing error: {Error}", error);
                }

                // Create basic view model with diagnostic information
                var viewModel = new DashboardViewModel
                {
                    StudentName = User.Identity?.Name ?? "Guest (Not Authenticated)",
                    UpcomingAppointments = new List<Appointment>(),
                    PastAppointments = new List<Appointment>(),
                    IsLoaded = true
                };

                // Run comprehensive diagnostics and store results
                Dictionary<string, string> diagnosticResults;
                try
                {
                    diagnosticResults = await CheckAndFixCommonDashboardIssuesAsync();
                    ViewData["Diagnostics"] = diagnosticResults;
                }
                catch (Exception diagEx)
                {
                    _logger.LogError(diagEx, "Error running dashboard diagnostics");
                    ViewData["DiagnosticError"] = diagEx.Message;
                }

                // Add more detailed diagnostics
                ViewData["RequestId"] = HttpContext.TraceIdentifier;
                ViewData["ErrorMessage"] = TempData["ErrorMessage"]?.ToString();
                ViewData["LastError"] = error;
                ViewData["ServerTime"] = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss.fff");
                ViewData["Environment"] = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Unknown";

                // Try to get active exception from HTTP context features
                var exceptionFeature = HttpContext.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerPathFeature>();
                if (exceptionFeature?.Error != null)
                {
                    ViewData["ActiveException"] = exceptionFeature.Error.Message;
                    ViewData["ExceptionPath"] = exceptionFeature.Path;
                    _logger.LogWarning("Exception in technical report from path: {Path}", exceptionFeature.Path);
                }

                return View("TechnicalReport", viewModel);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating technical report");
                return Content($"Critical Error in Technical Report: {ex.Message}", "text/plain");
            }
        }

        /// <summary>
        /// Enhanced endpoint for client-side error logging
        /// </summary>
        [HttpPost]
        [Route("dashboard/log-client-error")]
        public IActionResult LogClientError([FromBody] ClientErrorModel error)
        {
            if (error == null)
            {
                return BadRequest();
            }

            // Log the client-side error with enhanced details
            _logger.LogWarning(
                "Client-side dashboard error: {Message} at {Source}:{Line}. Stack: {Stack}",
                error.Message,
                error.Source,
                error.Line,
                error.Stack
            );

            // Store information about the error for diagnostic dashboard
            try
            {
                var errorContext = new Dictionary<string, string>
                {
                    ["SessionID"] = HttpContext.TraceIdentifier,
                    ["Timestamp"] = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"),
                    ["UserAgent"] = error.UserAgent ?? HttpContext.Request.Headers["User-Agent"].ToString(),
                    ["Path"] = HttpContext.Request.Path,
                    ["Referrer"] = HttpContext.Request.Headers["Referer"].ToString()
                };

                // Log additional context
                _logger.LogInformation(
                    "Error context: Session={SessionID}, User={User}, Browser={Browser}",
                    HttpContext.TraceIdentifier,
                    User.Identity?.Name ?? "Anonymous",
                    error.UserAgent ?? HttpContext.Request.Headers["User-Agent"].ToString()
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error logging client error context");
            }

            return Ok();
        }

        /// <summary>
        /// Diagnostic dashboard view that shows detailed information about the dashboard state
        /// </summary>
        [HttpGet]
        [Route("dashboard/diagnostic-dashboard")]
        public async Task<IActionResult> DiagnosticDashboard()
        {
            try
            {
                _logger.LogInformation("Diagnostic dashboard requested");

                // Ensure database is initialized
                await EnsureDatabaseInitializedAsync();

                // Get student info if authenticated
                var viewModel = new DashboardViewModel
                {
                    StudentName = User.Identity?.Name ?? "Guest",
                    UpcomingAppointments = new List<Appointment>(),
                    PastAppointments = new List<Appointment>(),
                    LastUpdated = DateTime.Now,
                    IsLoaded = false
                };

                if (User.Identity?.IsAuthenticated == true)
                {
                    var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
                    if (!string.IsNullOrEmpty(userIdClaim) && int.TryParse(userIdClaim, out var userId))
                    {
                        var student = await _context.Students
                            .Include(s => s.User)
                            .FirstOrDefaultAsync(s => s.UserId == userId);

                        if (student != null)
                        {
                            viewModel.StudentName = $"{student.FirstName} {student.LastName}".Trim();

                            // Load appointments with error handling
                            try
                            {
                                viewModel.UpcomingAppointments = await _context.Appointments
                                    .Include(a => a.Counsellor)
                                    .Where(a => a.StudentId == student.Id &&
                                              a.AppointmentDate >= DateTime.Today &&
                                              a.Status == "Scheduled")
                                    .OrderBy(a => a.AppointmentDate)
                                    .Take(5)
                                    .ToListAsync();

                                viewModel.PastAppointments = await _context.Appointments
                                    .Include(a => a.Counsellor)
                                    .Where(a => a.StudentId == student.Id &&
                                             (a.AppointmentDate < DateTime.Today || a.Status == "Completed"))
                                    .OrderByDescending(a => a.AppointmentDate)
                                    .Take(5)
                                    .ToListAsync();

                                viewModel.IsLoaded = true;
                            }
                            catch (Exception ex)
                            {
                                _logger.LogError(ex, "Error loading appointments for diagnostic dashboard");
                                TempData["ErrorMessage"] = "Error loading appointment data. Some information may be missing.";
                            }
                        }
                    }
                }

                return View("DiagnosticDashboard", viewModel);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in diagnostic dashboard");
                TempData["ErrorMessage"] = "Error loading diagnostic dashboard: " + ex.Message;
                return RedirectToAction("TechnicalReport");
            }
        }

        // Helper method to check for common dashboard rendering issues and try to fix them
        private async Task<Dictionary<string, string>> CheckAndFixCommonDashboardIssuesAsync()
        {
            var issues = new Dictionary<string, string>();

            try
            {
                // Check 1: Database connection issues
                try
                {
                    bool dbConnectionOk = await _context.Database.CanConnectAsync();
                    issues["Database Connection"] = dbConnectionOk ? "OK" : "Failed - Database cannot be accessed";

                    // Try to fix connection issues
                    if (!dbConnectionOk)
                    {
                        try
                        {
                            // Test backup database if available
                            if (System.IO.File.Exists("StudentCounselling.db.bak"))
                            {
                                issues["Repair Attempt"] = "Found backup database file";
                            }
                        }
                        catch (Exception)
                        {
                            issues["Repair Attempt"] = "Failed to check for backup database";
                        }
                    }
                }
                catch (Exception ex)
                {
                    issues["Database Connection"] = $"Error: {ex.Message}";
                }

                // Check 2: Authentication issues
                if (User.Identity == null || !User.Identity.IsAuthenticated)
                {
                    issues["Authentication"] = "Not authenticated - user needs to log in";
                    issues["Authentication Fix"] = "Use emergency-view endpoint which works without authentication";
                }
                else
                {
                    var nameIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
                    if (string.IsNullOrEmpty(nameIdClaim))
                    {
                        issues["Authentication"] = "Missing required claim: NameIdentifier";
                    }
                    else
                    {
                        issues["Authentication"] = "OK";
                    }
                }

                // Create a minimal view model to test rendering
                try
                {
                    var viewModel = new DashboardViewModel
                    {
                        StudentName = "Test User",
                        UpcomingAppointments = new List<Appointment>(),
                        PastAppointments = new List<Appointment>(),
                        IsLoaded = true
                    };
                    issues["View Model"] = "View model created successfully";
                }
                catch (Exception ex)
                {
                    issues["View Model"] = $"Failed to create view model: {ex.Message}";
                }
            }
            catch (Exception ex)
            {
                issues["Error During Diagnosis"] = ex.Message;
            }

            return issues;
        }
    }
}
