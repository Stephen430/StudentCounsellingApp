using System;
using System.Collections.Generic;
using StudentCounsellingApp.Models;

namespace StudentCounsellingApp.ViewModels
{
    public class DashboardViewModel
    {
        // Constructor to ensure proper initialization
        public DashboardViewModel()
        {
            StudentName = "Student"; // Default value if not set
            UpcomingAppointments = new List<Appointment>();
            PastAppointments = new List<Appointment>();
            LastUpdated = DateTime.Now; // Track when this view model was created
            IsLoaded = false; // Default to not loaded until data is properly fetched
        }

        public string StudentName { get; set; }
        public IEnumerable<Appointment> UpcomingAppointments { get; set; }
        public IEnumerable<Appointment> PastAppointments { get; set; }
        public DateTime LastUpdated { get; set; } // Property to track when data was last fetched
        public bool IsLoaded { get; set; } // Property to indicate if data was successfully loaded
    }
}
