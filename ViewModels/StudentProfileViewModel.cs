using System;
using System.ComponentModel.DataAnnotations;

namespace StudentCounsellingApp.ViewModels
{
    public class StudentProfileViewModel
    {
        [Required]
        [Display(Name = "First Name")]
        public string FirstName { get; set; }

        [Required]
        [Display(Name = "Last Name")]
        public string LastName { get; set; }

        [Display(Name = "Student ID")]
        public string StudentId { get; set; }

        [Display(Name = "Department")]
        public string Department { get; set; }

        [Display(Name = "Year of Study")]
        [Range(1, 10)]
        public int YearOfStudy { get; set; }

        [Display(Name = "Phone Number")]
        [Phone]
        public string PhoneNumber { get; set; }

        [Display(Name = "Date of Birth")]
        [DataType(DataType.Date)]
        public DateTime DateOfBirth { get; set; }
    }
}
