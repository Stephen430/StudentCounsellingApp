using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using StudentCounsellingApp.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllersWithViews();
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddScoped<StudentCounsellingApp.Services.UserService>();

builder.Services.AddAuthentication("Cookies")
    .AddCookie("Cookies", options =>
    {
        options.LoginPath = "/Account/Login";
        options.LogoutPath = "/Account/Logout";
        options.AccessDeniedPath = "/Home/AccessDenied";
        options.Cookie.Name = "StudentCounselling.Auth"; // Use a specific cookie name
        options.Cookie.HttpOnly = true;
        options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
        options.ExpireTimeSpan = TimeSpan.FromHours(24);
        options.SlidingExpiration = true;
        options.Events.OnRedirectToLogin = context =>
        {
            // Custom logic for debugging authentication redirect issues
            var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
            logger.LogWarning($"Authentication redirect to login from: {context.Request.Path}");
            return Task.CompletedTask;
        };
    });
builder.Services.AddAuthorization();

var app = builder.Build();

// Initialize the database
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();

        // Ensure database is created
        context.Database.EnsureCreated();

        // Initialize with seed data
        DbInitializer.Initialize(context);

        // Log success
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger?.LogInformation("Database initialized successfully.");
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        if (logger != null)
        {
            logger.LogError(ex, "An error occurred while seeding the database.");
        }
        else
        {
            // Fallback if logger service is not available
            Console.WriteLine($"ERROR: Database initialization failed: {ex.Message}");
        }
    }
}

// Configure the HTTP request pipeline
if (!app.Environment.IsDevelopment())
{
    // In production, use the standard exception handler middleware
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}
else
{
    // In development, use our custom middlewares for detailed error information
    app.UseMiddleware<StudentCounsellingApp.Middleware.ErrorHandlingMiddleware>();
    app.UseMiddleware<StudentCounsellingApp.Middleware.ViewRenderExceptionMiddleware>();

    // Enable developer exception page to see detailed error information
    app.UseDeveloperExceptionPage();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
