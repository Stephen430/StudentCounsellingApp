using Microsoft.EntityFrameworkCore;
using StudentCounsellingApp.Models;

namespace StudentCounsellingApp.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Student> Students { get; set; }
        public DbSet<Counsellor> Counsellors { get; set; }
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<SessionNote> SessionNotes { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Configure relationships
            modelBuilder.Entity<Student>()
                .HasOne(s => s.User)
                .WithOne(u => u.Student)
                .HasForeignKey<Student>(s => s.UserId);

            modelBuilder.Entity<Counsellor>()
                .HasOne(c => c.User)
                .WithOne(u => u.Counsellor)
                .HasForeignKey<Counsellor>(c => c.UserId);

            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Student)
                .WithMany(s => s.Appointments)
                .HasForeignKey(a => a.StudentId);

            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Counsellor)
                .WithMany(c => c.Appointments)
                .HasForeignKey(a => a.CounsellorId);

            modelBuilder.Entity<SessionNote>()
                .HasOne(n => n.Appointment)
                .WithMany(a => a.SessionNotes)
                .HasForeignKey(n => n.AppointmentId);
        }
    }
}
