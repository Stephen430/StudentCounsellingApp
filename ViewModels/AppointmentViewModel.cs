using System;
using System.ComponentModel.DataAnnotations;

namespace StudentCounsellingApp.ViewModels
{
    public class AppointmentViewModel
    {
        [Required]
        [Display(Name = "Counsellor")]
        public int CounsellorId { get; set; }

        [Required]
        [Display(Name = "Date")]
        [DataType(DataType.Date)]
        public DateTime AppointmentDate { get; set; }

        [Required]
        [Display(Name = "Time")]
        [DataType(DataType.Time)]
        public TimeSpan StartTime { get; set; }

        [Required]
        [StringLength(100)]
        [Display(Name = "Subject")]
        public string Subject { get; set; }

        [StringLength(500)]
        [Display(Name = "Description")]
        public string Description { get; set; }
    }
}
