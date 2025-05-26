using System;

namespace StudentCounsellingApp.Models
{
    /// <summary>
    /// Enhanced model for client-side error logging and tracking
    /// </summary>
    public class ClientErrorModel
    {
        public string Message { get; set; }
        public string Source { get; set; }
        public int Line { get; set; }
        public int Column { get; set; }
        public string Stack { get; set; }
        public string UserAgent { get; set; }
        public string Timestamp { get; set; }
    }
}
