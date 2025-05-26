// Dashboard emergency fix script
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard fix script loaded at', new Date().toISOString());
    
    try {
        // Add global error handler to prevent the dashboard from crashing
        window.addEventListener('error', function(event) {
            console.error('Caught global error:', event.error || event.message);
            
            // Log error to server
            logErrorToServer({
                message: event.message,
                source: event.filename,
                line: event.lineno,
                column: event.colno,
                stack: event.error?.stack
            });
            
            // Show user-friendly error in the UI
            const errorDiv = document.createElement('div');
            errorDiv.className = 'alert alert-danger mt-3';
            errorDiv.innerHTML = `
                <h4>Something went wrong</h4>
                <p>An error occurred while loading the dashboard: ${event.error?.message || event.message}</p>
                <p>Please try the following:</p>
                <ul>
                    <li><a href="/dashboard/tech-report">View Technical Report</a></li>
                    <li><a href="/dashboard/simple">View Simple Dashboard</a></li>
                    <li><a href="/">Return to Home</a></li>
                </ul>
                <button class="btn btn-sm btn-primary retry-dashboard">Retry Loading Dashboard</button>
            `;
            
            // Insert at the top of the main container
            const mainContainer = document.querySelector('main.pb-3') || document.body;
            if (mainContainer && mainContainer.firstChild) {
                mainContainer.insertBefore(errorDiv, mainContainer.firstChild);
            } else {
                document.body.prepend(errorDiv);
            }
            
            return true; // Prevent the default error handler
        });
        
        // Add retry button functionality
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('retry-dashboard')) {
                window.location.reload();
            }
        });
        
        // Defensive programming: wrap dashboard data rendering in try/catch
        function safeBind(selector, attribute, value) {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    if (attribute === 'text') {
                        el.textContent = value || 'N/A';
                    } else {
                        el.setAttribute(attribute, value || '');
                    }
                });
            } catch (err) {
                console.error(`Error binding ${selector}.${attribute}:`, err);
            }
        }
        
        // If appointments are missing critical data, try to fix them
        const appointmentItems = document.querySelectorAll('.appointment-item');
        appointmentItems.forEach(item => {
            try {
                // Make sure dates are displayed correctly
                const dateDay = item.querySelector('.date-day');
                if (dateDay && (!dateDay.textContent || dateDay.textContent === 'NaN')) {
                    dateDay.textContent = '--';
                }
                
                const dateMonth = item.querySelector('.date-month');
                if (dateMonth && (!dateMonth.textContent || dateMonth.textContent === 'NaN')) {
                    dateMonth.textContent = '--';
                }
                
                // Check for null appointments
                if (!item.href || item.href === 'javascript:void(0)') {
                    item.href = '/Appointment';
                }
            } catch (err) {
                console.error('Error fixing appointment item:', err);
            }
        });
        
        // Dashboard error detection and recovery
        initializeDashboardErrorHandling();
        
        console.log('Dashboard fix script completed successfully');
    } catch (err) {
        console.error('Critical error in fix script:', err);
    }
});

function initializeDashboardErrorHandling() {
    // Global error handler
    window.addEventListener('error', handleDashboardError);
    
    // Monitor for blank content
    checkDashboardContent();
    
    // Add error recovery options
    addErrorRecoveryUI();
}

function handleDashboardError(event) {
    console.error('Dashboard Error:', event.message);
    
    // Log error to server
    logErrorToServer({
        message: event.message,
        source: event.filename,
        line: event.lineno,
        column: event.colno,
        stack: event.error?.stack
    });
    
    // Show error recovery UI
    showErrorRecoveryUI();
}

function checkDashboardContent() {
    // Check if the dashboard content is empty or minimal
    setTimeout(() => {
        const mainContent = document.querySelector('.dashboard-content');
        if (!mainContent || mainContent.children.length === 0 || mainContent.innerText.trim().length < 50) {
            console.warn('Dashboard appears to be empty or minimal');
            showErrorRecoveryUI();
        }
    }, 2000); // Check after 2 seconds to allow for dynamic content loading
}

function showErrorRecoveryUI() {
    // Only add if not already present
    if (document.querySelector('.dashboard-error-recovery')) {
        return;
    }

    const errorUI = document.createElement('div');
    errorUI.className = 'alert alert-warning dashboard-error-recovery mt-3';
    errorUI.innerHTML = `
        <h4>Dashboard Issue Detected</h4>
        <p>We've detected an issue loading your dashboard. Please try one of these options:</p>
        <div class="btn-group">
            <a href="/Dashboard/simple" class="btn btn-primary">Simple View</a>
            <a href="/Dashboard/emergency-view" class="btn btn-warning">Emergency View</a>
            <a href="/Dashboard/tech-report" class="btn btn-info">Technical Report</a>
            <button onclick="location.reload()" class="btn btn-secondary">Reload Page</button>
        </div>
    `;
    
    // Insert at the top of the content area
    const container = document.querySelector('.container') || document.body;
    container.insertBefore(errorUI, container.firstChild);
}

async function logErrorToServer(errorDetails) {
    try {
        await fetch('/Dashboard/LogClientError', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(errorDetails)
        });
    } catch (err) {
        console.error('Failed to log error to server:', err);
    }
}

function addErrorRecoveryUI() {
    // Only add if not already present
    if (document.querySelector('.dashboard-recovery-btn')) {
        return;
    }

    // Add a minimal error recovery button that's always available
    const recoveryButton = document.createElement('button');
    recoveryButton.className = 'btn btn-sm btn-outline-danger dashboard-recovery-btn';
    recoveryButton.innerHTML = '⚕️ Dashboard Help';
    recoveryButton.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 9999; opacity: 0.7;';
    recoveryButton.onclick = showErrorRecoveryUI;
    
    document.body.appendChild(recoveryButton);
}
