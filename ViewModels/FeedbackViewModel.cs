using System.ComponentModel.DataAnnotations;

namespace StudentCounsellingApp.ViewModels
{
    public class FeedbackViewModel
    {
        public int AppointmentId { get; set; }

        public string CounsellorName { get; set; }

        [Required]
        [Range(1, 5)]
        [Display(Name = "Rating (1-5)")]
        public int Rating { get; set; }

        [Required]
        [StringLength(500)]
        [Display(Name = "Comments")]
        public string Comments { get; set; }

        [Display(Name = "Was this session helpful?")]
        public bool WasHelpful { get; set; }

        [Display(Name = "Would you recommend this counsellor?")]
        public bool WouldRecommend { get; set; }
    }
}
