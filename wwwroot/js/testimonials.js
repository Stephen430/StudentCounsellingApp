/**
 * Enhanced Testimonials JavaScript for Student Counselling App
 * Smooth animations and interactions
 */

document.addEventListener('DOMContentLoaded', function() {
    initTestimonialCarousel();
    initTestimonialHoverEffects();
});

/**
 * Initialize the testimonial carousel with enhanced features
 */
function initTestimonialCarousel() {
    const testimonialCarousel = document.getElementById('testimonialCarousel');
    
    // Only proceed if the carousel element exists
    if (testimonialCarousel) {
        // Initialize Bootstrap carousel with custom options
        const carousel = new bootstrap.Carousel(testimonialCarousel, {
            interval: 5000,  // Change slide every 5 seconds
            wrap: true,      // Loop through slides
            touch: true,     // Enable touch swiping on mobile
            pause: 'hover'   // Pause on mouse hover
        });
        
        // Add swipe support for touch devices
        addSwipeSupport(testimonialCarousel, carousel);
        
        // Add fade transition effect to the carousel items
        const carouselItems = testimonialCarousel.querySelectorAll('.carousel-item');
        carouselItems.forEach(item => {
            item.addEventListener('transitionstart', function() {
                this.style.opacity = '0';
                setTimeout(() => {
                    this.style.opacity = '1';
                }, 100);
            });
        });
        
        // Pause/resume carousel on testimonial card hover
        const testimonialCards = document.querySelectorAll('.testimonial-card');
        testimonialCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                carousel.pause();
            });
            
            card.addEventListener('mouseleave', function() {
                carousel.cycle();
            });
        });
    }
}

/**
 * Add touch swipe support for mobile devices
 */
function addSwipeSupport(element, carousel) {
    let touchStartX = 0;
    let touchEndX = 0;
    
    element.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, false);
    
    element.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, false);
    
    function handleSwipe() {
        const threshold = 50; // Minimum distance to be considered a swipe
        
        if (touchEndX < touchStartX - threshold) {
            // Swipe left - next slide
            carousel.next();
        }
        
        if (touchEndX > touchStartX + threshold) {
            // Swipe right - previous slide
            carousel.prev();
        }
    }
}

/**
 * Initialize hover effects for testimonial cards
 */
function initTestimonialHoverEffects() {
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    
    testimonialCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            // Highlight the current card
            this.classList.add('testimonial-card-active');
            
            // Slightly dim the other cards
            testimonialCards.forEach(otherCard => {
                if (otherCard !== this && !otherCard.classList.contains('testimonial-card-featured')) {
                    otherCard.style.opacity = '0.7';
                    otherCard.style.transform = 'scale(0.98)';
                }
            });
        });
        
        card.addEventListener('mouseleave', function() {
            // Remove highlight from current card
            this.classList.remove('testimonial-card-active');
            
            // Restore other cards
            testimonialCards.forEach(otherCard => {
                otherCard.style.opacity = '1';
                if (!otherCard.classList.contains('testimonial-card-featured')) {
                    otherCard.style.transform = '';
                }
            });
        });
    });
}

// If we're using AOS for animations, make sure the testimonial section looks good
if (typeof AOS !== 'undefined') {
    AOS.refresh();
}
