// Dashboard diagnostic JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard diagnostics loaded');
    
    // Log information about the page state
    console.log('Document ready state:', document.readyState);
    console.log('Dashboard view elements loaded:', document.querySelectorAll('.dashboard-header').length > 0);
    
    // Check if the main containers are present
    const dashboardHeader = document.querySelector('.dashboard-header');
    const statsRow = document.querySelector('.row.mb-4'); // Stats row
    const appointmentsRow = document.querySelector('.appointment-list'); // Appointments list
    
    console.log('Dashboard structure check:');
    console.log('- Header present:', !!dashboardHeader);
    console.log('- Stats row present:', !!statsRow);
    console.log('- Appointments list present:', !!appointmentsRow);
    
    // Try to detect model binding issues
    const modelBindingIssues = document.querySelectorAll('*:contains("@Model")');
    if (modelBindingIssues.length > 0) {
        console.error('Potential model binding issues detected');
    }
    
    // Check for script errors
    window.onerror = function(message, source, lineno, colno, error) {
        console.error('JavaScript error:', message, 'at', source, lineno, colno);
        return false;
    };
    
    // Add a visible message for diagnosing on the page
    const diagnosticInfo = document.createElement('div');
    diagnosticInfo.className = 'alert alert-info mt-3';
    diagnosticInfo.innerHTML = `
        <h4>Dashboard Diagnostics (Client-Side)</h4>
        <p>Page loaded at: ${new Date().toLocaleString()}</p>
        <p>Check browser console for detailed diagnostics</p>
        <button id="runDiagnostics" class="btn btn-primary">Run Visual Diagnostics</button>
    `;
    
    // Insert at the top of the main container
    const mainContainer = document.querySelector('main.pb-3');
    if (mainContainer && mainContainer.firstChild) {
        mainContainer.insertBefore(diagnosticInfo, mainContainer.firstChild);
    }
    
    // Add a diagnostic button function
    document.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'runDiagnostics') {
            runVisualDiagnostics();
        }
    });
    
    function runVisualDiagnostics() {
        // Highlight all main dashboard components with colored borders to see what's loaded
        const components = {
            '.dashboard-header': 'red',
            '.dashboard-stat': 'blue',
            '.appointment-list': 'green',
            '.quick-links': 'orange'
        };
        
        let report = '<div class="mt-3 p-3 bg-light"><h5>Visual Diagnostic Results</h5><ul>';
        
        for (const [selector, color] of Object.entries(components)) {
            const elements = document.querySelectorAll(selector);
            const count = elements.length;
            
            report += `<li>${selector}: ${count} found</li>`;
            
            elements.forEach(el => {
                el.style.border = `3px solid ${color}`;
                el.style.position = 'relative';
                
                // Add label
                const label = document.createElement('div');
                label.style.position = 'absolute';
                label.style.top = '0';
                label.style.left = '0';
                label.style.backgroundColor = color;
                label.style.color = 'white';
                label.style.padding = '2px 5px';
                label.style.fontSize = '10px';
                label.textContent = selector;
                
                el.appendChild(label);
            });
        }
        
        report += '</ul><p>Elements have been highlighted with colored borders</p></div>';
        
        // Add the report to the page
        const reportEl = document.createElement('div');
        reportEl.innerHTML = report;
        diagnosticInfo.appendChild(reportEl);
    }
});
