using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudentCounsellingApp.Models
{
    public class SessionNote
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public DateTime NoteDate { get; set; } = DateTime.UtcNow;

        [Required]
        [StringLength(1000)]
        public string Content { get; set; }

        [StringLength(100)]
        public string Diagnosis { get; set; }

        [StringLength(500)]
        public string Recommendations { get; set; }

        public bool IsPrivate { get; set; } = true;

        // Foreign key
        public int AppointmentId { get; set; }
        
        // Navigation property
        public Appointment Appointment { get; set; }
    }
}
