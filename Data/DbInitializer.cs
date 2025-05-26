using Microsoft.EntityFrameworkCore;
using StudentCounsellingApp.Models;
using System;
using System.Linq;
using System.Security.Cryptography;
using System.Text;

namespace StudentCounsellingApp.Data
{
    public static class DbInitializer
    {
        public static void Initialize(ApplicationDbContext context)
        {
            context.Database.EnsureCreated();            // Look for any users
            if (context.Users.Any())
            {
                return;   // DB has been seeded
            }

            // Add admin user
            var adminUser = new User
            {
                Username = "admin",
                Email = "admin@example.com",
                PasswordHash = HashPassword("admin123"),
                Role = "Admin",
                CreatedAt = DateTime.Now,
                LastLogin = DateTime.Now
            };

            context.Users.Add(adminUser);
            context.SaveChanges();

            // Add a counselor
            var counsellorUser = new User
            {
                Username = "counsellor",
                Email = "counsellor@example.com",
                PasswordHash = HashPassword("counsellor123"),
                Role = "Counsellor",
                CreatedAt = DateTime.Now,
                LastLogin = DateTime.Now
            };

            context.Users.Add(counsellorUser);
            context.SaveChanges();

            var counsellor = new Counsellor
            {
                UserId = counsellorUser.Id,
                FirstName = "Jane",
                LastName = "Smith",
                Specialization = "Academic Counselling",
                PhoneNumber = "555-1234",
                Biography = "PhD in Psychology with 10 years of experience in academic counselling",
                YearsOfExperience = 10,
                IsAvailable = true
            };

            context.Counsellors.Add(counsellor);
            context.SaveChanges();

            // Add a student
            var studentUser = new User
            {
                Username = "student",
                Email = "student@example.com",
                PasswordHash = HashPassword("student123"),
                Role = "Student",
                CreatedAt = DateTime.Now,
                LastLogin = DateTime.Now
            };

            context.Users.Add(studentUser);
            context.SaveChanges();

            var student = new Student
            {
                UserId = studentUser.Id,
                FirstName = "John",
                LastName = "Doe",
                StudentId = "ST12345",
                Department = "Computer Science",
                YearOfStudy = 2,
                PhoneNumber = "555-5678",
                DateOfBirth = new DateTime(2000, 1, 1)
            }; context.Students.Add(student);
            context.SaveChanges();

            // Add some sample appointments
            var today = DateTime.Today;

            // Upcoming appointment
            var upcomingAppointment = new Appointment
            {
                StudentId = student.Id,
                CounsellorId = counsellor.Id,
                AppointmentDate = today.AddDays(3),
                StartTime = new TimeSpan(10, 0, 0),
                EndTime = new TimeSpan(11, 0, 0),
                Subject = "Academic Performance Discussion",
                Description = "Meeting to discuss recent academic performance and strategies for improvement.",
                Status = "Scheduled",
                CreatedAt = DateTime.Now
            };

            // Past appointment 
            var pastAppointment = new Appointment
            {
                StudentId = student.Id,
                CounsellorId = counsellor.Id,
                AppointmentDate = today.AddDays(-7),
                StartTime = new TimeSpan(14, 0, 0),
                EndTime = new TimeSpan(15, 0, 0),
                Subject = "Initial Consultation",
                Description = "First meeting to discuss student needs and concerns.",
                Status = "Completed",
                CreatedAt = DateTime.Now.AddDays(-10)
            };

            context.Appointments.AddRange(upcomingAppointment, pastAppointment);
            context.SaveChanges();
        }

        private static string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return Convert.ToBase64String(hashedBytes);
            }
        }
    }
}
