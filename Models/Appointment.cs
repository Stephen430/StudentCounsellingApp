using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudentCounsellingApp.Models
{
    public class Appointment
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public DateTime AppointmentDate { get; set; }

        [Required]
        public TimeSpan StartTime { get; set; }

        [Required]
        public TimeSpan EndTime { get; set; }

        [StringLength(100)]
        public string Subject { get; set; }

        [StringLength(500)]
        public string Description { get; set; }

        [Required]
        public string Status { get; set; } // "Scheduled", "Completed", "Cancelled"

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Foreign keys
        public int StudentId { get; set; }
        public int CounsellorId { get; set; }
        
        // Navigation properties
        public Student Student { get; set; }
        public Counsellor Counsellor { get; set; }
        public ICollection<SessionNote> SessionNotes { get; set; }
    }
}
