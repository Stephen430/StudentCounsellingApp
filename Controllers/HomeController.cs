using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using StudentCounsellingApp.Models;

namespace StudentCounsellingApp.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;

        public HomeController(ILogger<HomeController> logger = null)
        {
            _logger = logger;
        }

        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Privacy()
        {
            return View();
        }

        public IActionResult AccessDenied()
        {
            _logger?.LogWarning($"Access denied page accessed by user: {User.Identity?.Name ?? "anonymous"}");
            return View(new ErrorViewModel
            {
                RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier,
                RequestPath = HttpContext.Request.Path,
                ErrorMessage = "You do not have permission to access the requested resource."
            });
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error(string errorMessage = null)
        {
            var requestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier;
            _logger?.LogError($"Error page accessed with RequestId: {requestId}");

            // Get error information from multiple sources
            string finalErrorMessage = errorMessage;

            // Check if there's an exception to log
            var exceptionFeature = HttpContext.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerPathFeature>();
            if (exceptionFeature != null && exceptionFeature.Error != null)
            {
                var exception = exceptionFeature.Error;
                var path = exceptionFeature.Path;

                _logger?.LogError(exception, $"Exception caught in Error action from path: {path}");

                // Use the exception message if we don't already have one
                if (string.IsNullOrEmpty(finalErrorMessage))
                {
                    finalErrorMessage = exception.Message;
                }
            }

            // Check TempData as a fallback
            if (string.IsNullOrEmpty(finalErrorMessage) && TempData["ErrorMessage"] != null)
            {
                finalErrorMessage = TempData["ErrorMessage"].ToString();
            }

            // Check HttpContext.Items as a last resort (set by our middleware)
            if (string.IsNullOrEmpty(finalErrorMessage) && HttpContext.Items["ErrorMessage"] != null)
            {
                finalErrorMessage = HttpContext.Items["ErrorMessage"].ToString();
            }

            return View(new ErrorViewModel
            {
                RequestId = requestId,
                RequestPath = HttpContext.Request.Path,
                ErrorMessage = finalErrorMessage
            });
        }
    }
}
