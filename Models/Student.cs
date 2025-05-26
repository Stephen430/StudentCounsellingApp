using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudentCounsellingApp.Models
{
    public class Student
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string FirstName { get; set; }

        [Required]
        [StringLength(50)]
        public string LastName { get; set; }

        [StringLength(20)]
        public string StudentId { get; set; }

        [StringLength(100)]
        public string Department { get; set; }

        public int YearOfStudy { get; set; }

        [StringLength(15)]
        public string PhoneNumber { get; set; }

        [DataType(DataType.Date)]
        public DateTime DateOfBirth { get; set; }

        // Foreign key
        public int UserId { get; set; }
        
        // Navigation properties
        public User User { get; set; }
        public ICollection<Appointment> Appointments { get; set; }
    }
}
