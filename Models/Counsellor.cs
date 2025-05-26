using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudentCounsellingApp.Models
{
    public class Counsellor
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string FirstName { get; set; }

        [Required]
        [StringLength(50)]
        public string LastName { get; set; }

        [StringLength(100)]
        public string Specialization { get; set; }

        [StringLength(15)]
        public string PhoneNumber { get; set; }

        [StringLength(500)]
        public string Biography { get; set; }

        public int YearsOfExperience { get; set; }

        [StringLength(200)]
        public string ProfileImageUrl { get; set; }

        public bool IsAvailable { get; set; } = true;

        // Foreign key
        public int UserId { get; set; }
        
        // Navigation properties
        public User User { get; set; }
        public ICollection<Appointment> Appointments { get; set; }
    }
}
