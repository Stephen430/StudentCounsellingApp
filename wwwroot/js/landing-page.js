/**
 * Modern Landing Page JavaScript for Student Counselling App
 * Advanced animations and interactive features
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize any animations and interactive elements
    initScrollAnimations();
    initCounterAnimations();
    initSmoothScroll();
    initParallaxEffect();

    // For browsers that don't support smooth scrolling natively
    function initSmoothScroll() {
        const scrollDownBtn = document.querySelector('.hero-scroll-down');
        if (scrollDownBtn) {
            scrollDownBtn.addEventListener('click', function() {
                const servicesSection = document.querySelector('.services-section');
                if (servicesSection) {
                    window.scrollTo({
                        top: servicesSection.offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        }

        // Smooth scroll for all internal links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                if (targetId !== '#') {
                    const target = document.querySelector(targetId);
                    if (target) {
                        window.scrollTo({
                            top: target.offsetTop,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });
    }

    // Add scroll reveal animations
    function initScrollAnimations() {
        const animatedElements = document.querySelectorAll('.service-card, .testimonial-card, .stat-item');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate__animated', 'animate__fadeInUp');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });
        
        animatedElements.forEach(el => {
            observer.observe(el);
        });
    }

    // Initialize counter animations for stats
    function initCounterAnimations() {
        const counters = document.querySelectorAll('.counter');
        const speed = 200;

        counters.forEach(counter => {
            const updateCount = () => {
                const target = +counter.getAttribute('data-target');
                const count = +counter.innerText;
                const inc = target / speed;

                if (count < target) {
                    counter.innerText = Math.ceil(count + inc);
                    setTimeout(updateCount, 1);
                } else {
                    counter.innerText = target;
                }
            };

            // Set data-target attribute if not present
            if (!counter.getAttribute('data-target')) {
                counter.setAttribute('data-target', counter.innerText);
            }
            
            counter.innerText = '0';
            
            // Start counting when element is in view
            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    updateCount();
                    observer.disconnect();
                }
            }, { threshold: 0.5 });
            
            observer.observe(counter);
        });
    }

    // Parallax effect for hero section
    function initParallaxEffect() {
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            window.addEventListener('scroll', function() {
                const scrollPosition = window.pageYOffset;
                // Apply parallax effect to hero background
                heroSection.style.backgroundPositionY = (scrollPosition * 0.5) + 'px';
            });
        }
    }
});

// Typing animation for hero heading
class TypeWriter {
    constructor(txtElement, words, wait = 3000) {
        this.txtElement = txtElement;
        this.words = words;
        this.txt = '';
        this.wordIndex = 0;
        this.wait = parseInt(wait, 10);
        this.type();
        this.isDeleting = false;
    }

    type() {
        // Current index of word
        const current = this.wordIndex % this.words.length;
        // Get full text of current word
        const fullTxt = this.words[current];

        // Check if deleting
        if (this.isDeleting) {
            // Remove char
            this.txt = fullTxt.substring(0, this.txt.length - 1);
        } else {
            // Add char
            this.txt = fullTxt.substring(0, this.txt.length + 1);
        }

        // Insert txt into element
        this.txtElement.innerHTML = `<span class="txt">${this.txt}</span>`;

        // Initial Type Speed
        let typeSpeed = 150;

        if (this.isDeleting) {
            typeSpeed /= 2;
        }

        // If word is complete
        if (!this.isDeleting && this.txt === fullTxt) {
            // Make pause at end
            typeSpeed = this.wait;
            // Set delete to true
            this.isDeleting = true;
        } else if (this.isDeleting && this.txt === '') {
            this.isDeleting = false;
            // Move to next word
            this.wordIndex++;
            // Pause before start typing
            typeSpeed = 500;
        }

        setTimeout(() => this.type(), typeSpeed);
    }
}

// Init On DOM Load
document.addEventListener('DOMContentLoaded', init);

// Init App
function init() {
    const txtElement = document.querySelector('.txt-type');
    if (txtElement) {
        const words = JSON.parse(txtElement.getAttribute('data-words'));
        const wait = txtElement.getAttribute('data-wait');
        // Init TypeWriter
        new TypeWriter(txtElement, words, wait);
    }
}
