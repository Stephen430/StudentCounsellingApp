/**
 * Enhanced Dashboard Functionality
 * Provides improved user experience with animations and interactive elements
 */

document.addEventListener('DOMContentLoaded', function() {
    // Enhance stat cards with animations
    const statCards = document.querySelectorAll('.stat-card');
    if (statCards.length > 0) {
        // Use Intersection Observer for scroll-based animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('stat-card-animated');
                    setTimeout(() => {
                        const number = entry.target.querySelector('.stat-number');
                        if (number) {
                            const finalValue = parseInt(number.textContent);
                            animateCounter(number, 0, finalValue);
                        }
                    }, 300);
                }
            });
        }, { threshold: 0.3 });
        
        statCards.forEach(card => {
            observer.observe(card);
        });
    }

    // Add appointment item hover effects
    const appointmentItems = document.querySelectorAll('.appointment-item');
    appointmentItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.classList.add('appointment-item-hover');
        });
        
        item.addEventListener('mouseleave', function() {
            this.classList.remove('appointment-item-hover');
        });
    });

    // Error tracking and reporting
    setupErrorTracking();

    // Mobile optimizations
    handleMobileOptimizations();
});

/**
 * Animates a counter from start to end value
 */
function animateCounter(element, start, end) {
    if (!element) return;
    
    const duration = 1000;
    const frameDuration = 1000/60;
    const totalFrames = Math.round(duration / frameDuration);
    const easeOutQuad = t => t * (2 - t);
    
    let frame = 0;
    const counter = setInterval(() => {
        frame++;
        
        const progress = easeOutQuad(frame / totalFrames);
        const currentCount = Math.round(start + (end - start) * progress);
        
        element.textContent = currentCount;
        
        if (frame === totalFrames) {
            clearInterval(counter);
        }
    }, frameDuration);
}

/**
 * Sets up error tracking to report client-side issues
 */
function setupErrorTracking() {
    window.onerror = function(msg, url, line, col, error) {
        // Only log actual errors, not from extensions or third parties
        if (!url || url.indexOf(window.location.origin) === -1) return;
        
        const errorData = {
            message: msg,
            source: url,
            line: line,
            column: col || 0,
            stack: error && error.stack ? error.stack : "Not available",
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        };
        
        // Send error report to server
        fetch('/dashboard/log-client-error', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(errorData)
        }).catch(err => {
            console.log('Error reporting failed:', err);
        });
        
        return false;
    };
    
    // Also handle promise rejections
    window.addEventListener('unhandledrejection', function(event) {
        const error = event.reason;
        const errorData = {
            message: error.message || "Unhandled Promise Rejection",
            source: "Promise",
            stack: error.stack || "Stack not available",
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        };
        
        fetch('/dashboard/log-client-error', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(errorData)
        }).catch(() => {});
    });
}

/**
 * Handles mobile-specific optimizations
 */
function handleMobileOptimizations() {
    // Force viewport refresh on orientation change
    window.addEventListener('orientationchange', function() {
        const meta = document.querySelector('meta[name="viewport"]');
        if (meta) {
            meta.setAttribute('content', 'width=device-width, initial-scale=1.0');
        }
        
        // Adjust elements after orientation change
        setTimeout(() => {
            const statCards = document.querySelectorAll('.stat-card');
            statCards.forEach(card => {
                card.style.height = 'auto';
            });
        }, 300);
    });
    
    // Touch interactions for mobile
    if ('ontouchstart' in window) {
        const quickLinks = document.querySelectorAll('.quick-link-item');
        quickLinks.forEach(link => {
            link.addEventListener('touchstart', function() {
                this.classList.add('quick-link-touch');
            });
            
            link.addEventListener('touchend', function() {
                this.classList.remove('quick-link-touch');
            });
        });
    }
}
