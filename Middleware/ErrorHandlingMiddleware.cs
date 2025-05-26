using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace StudentCounsellingApp.Middleware
{
    public class ErrorHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ErrorHandlingMiddleware> _logger;

        public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
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
                _logger.LogError(ex, "Unhandled exception occurred during request processing: {Message}", ex.Message);

                // Save all relevant error information
                context.Items["ErrorMessage"] = ex.Message;
                context.Items["ErrorStackTrace"] = ex.StackTrace;
                context.Items["ErrorSource"] = ex.Source;
                if (ex.InnerException != null)
                {
                    context.Items["InnerErrorMessage"] = ex.InnerException.Message;
                    _logger.LogError(ex.InnerException, "Inner exception: {Message}", ex.InnerException.Message);
                }

                // If the response hasn't started, we can redirect
                if (!context.Response.HasStarted)
                {
                    // Clear any partial response
                    context.Response.Clear();

                    // Handle dashboard errors specially
                    if (IsDashboardRequest(context))
                    {
                        await HandleDashboardError(context, ex);
                    }
                    else
                    {
                        // For other errors, redirect to the standard error page
                        context.Response.Redirect($"/Home/Error?errorMessage={Uri.EscapeDataString(ex.Message)}");
                    }
                }
                else
                {
                    _logger.LogWarning("Response already started - could not redirect to error page");
                }
            }
        }

        private bool IsDashboardRequest(HttpContext context)
        {
            return context.Request.Path.StartsWithSegments("/Dashboard") &&
                   !context.Request.Path.StartsWithSegments("/Dashboard/emergency-view") &&
                   !context.Request.Path.StartsWithSegments("/Dashboard/tech-report");
        }
        private Task HandleDashboardError(HttpContext context, Exception ex)
        {
            _logger.LogWarning("Dashboard error detected. Analyzing...");

            var errorType = CategorizeDashboardError(ex);
            switch (errorType)
            {
                case DashboardErrorType.Authentication:
                    _logger.LogWarning("Authentication error detected in dashboard");
                    context.Response.Redirect("/Account/Login?returnUrl=" + Uri.EscapeDataString(context.Request.Path));
                    break;

                case DashboardErrorType.DataAccess:
                    _logger.LogWarning("Data access error detected in dashboard");
                    context.Response.Redirect("/Dashboard/simple");
                    break;

                case DashboardErrorType.Rendering:
                    _logger.LogWarning("Rendering error detected in dashboard");
                    context.Response.Redirect("/Dashboard/emergency-view");
                    break;

                default:
                    // For unknown errors, show the technical report
                    _logger.LogWarning("Unknown dashboard error, showing technical report");
                    context.Response.Redirect($"/Dashboard/tech-report?error={Uri.EscapeDataString(ex.Message)}");
                    break;
            }

            return Task.CompletedTask;
        }

        private DashboardErrorType CategorizeDashboardError(Exception ex)
        {
            // Check the exception and its inner exceptions for specific error types
            var message = ex.Message.ToLowerInvariant();
            var stackTrace = ex.StackTrace?.ToLowerInvariant() ?? "";

            if (message.Contains("unauthorized") || message.Contains("authentication") ||
                message.Contains("not logged in") || message.Contains("unauthenticated"))
            {
                return DashboardErrorType.Authentication;
            }

            if (message.Contains("database") || message.Contains("sql") || message.Contains("entity") ||
                message.Contains("data source") || stackTrace.Contains("entityframeworkcore"))
            {
                return DashboardErrorType.DataAccess;
            }

            if (message.Contains("view") || message.Contains("render") || message.Contains("parse") ||
                message.Contains("null reference") || stackTrace.Contains("razor"))
            {
                return DashboardErrorType.Rendering;
            }

            return DashboardErrorType.Unknown;
        }

        private enum DashboardErrorType
        {
            Authentication,
            DataAccess,
            Rendering,
            Unknown
        }
    }
}
