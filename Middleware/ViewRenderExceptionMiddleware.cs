using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace StudentCounsellingApp.Middleware
{
    public class ViewRenderExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ViewRenderExceptionMiddleware> _logger;

        public ViewRenderExceptionMiddleware(RequestDelegate next, ILogger<ViewRenderExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An unhandled exception occurred during view rendering");                // Only intercept for dashboard requests
                if (context.Request.Path.StartsWithSegments("/Dashboard") &&
                    !context.Request.Path.StartsWithSegments("/Dashboard/emergency-view") &&
                    !context.Request.Path.StartsWithSegments("/Dashboard/diagnostic-view") &&
                    !context.Request.Path.StartsWithSegments("/Dashboard/tech-report") &&
                    !context.Request.Path.StartsWithSegments("/Dashboard/simple"))
                {
                    _logger.LogWarning("Dashboard rendering exception detected: {Message}", ex.Message);

                    // If possible, get more detailed diagnostics from the inner exception
                    string detailedError = ex.Message;
                    if (ex.InnerException != null)
                    {
                        detailedError += " | Inner Exception: " + ex.InnerException.Message;
                        _logger.LogError(ex.InnerException, "Inner exception details for dashboard error");
                    }

                    // Include stack trace for critical rendering errors
                    if (ex.Message.Contains("null reference") ||
                        ex.Message.Contains("object reference") ||
                        ex.Message.Contains("render"))
                    {
                        detailedError += " | Stack: " + ex.StackTrace?.Split('\n')[0];
                    }

                    // Redirect to the technical report page which is more robust
                    context.Response.Redirect("/Dashboard/tech-report?error=" + Uri.EscapeDataString(detailedError));
                    return;
                }

                // For other paths, let the normal error handling take over
                throw;
            }
        }
    }
}
