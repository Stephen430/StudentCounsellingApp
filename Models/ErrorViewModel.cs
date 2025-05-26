using System;

namespace StudentCounsellingApp.Models
{
    public class ErrorViewModel
    {
        public string RequestId { get; set; }
        public string RequestPath { get; set; }
        public string ErrorMessage { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.Now;

        public bool ShowRequestId => !string.IsNullOrEmpty(RequestId);
    }
}
