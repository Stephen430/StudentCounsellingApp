// Advanced Counsellor Page Interactions
class CounsellorPage {
    constructor() {
        this.init();
        this.setupIntersectionObserver();
        this.setupParallaxEffect();
        this.setupSmoothAnimations();
        this.setupAdvancedFeatures();
    }

    init() {
        this.setupEventListeners();
        this.initializeFilters();
        this.setupLazyLoading();
        this.setupRealTimeSearch();
        this.setupCardAnimations();
    }

    setupEventListeners() {
        // Advanced search with debouncing
        let searchTimeout;
        $('#counsellorSearch').on('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.performSearch(e.target.value);
            }, 200);
        });

        // Enhanced card hover effects
        $('.counsellor-card').on('mouseenter', this.onCardHover.bind(this));
        $('.counsellor-card').on('mouseleave', this.onCardLeave.bind(this));

        // Advanced booking with loading states
        $('.btn-book').on('click', this.handleAdvancedBooking.bind(this));

        // Interactive filter animations
        $('.filter-chip').on('click', this.animateFilter.bind(this));

        // Real-time availability updates
        this.setupAvailabilityUpdates();
    }

    setupAdvancedFeatures() {
        // Add card micro-interactions
        this.setupMicroInteractions();
        
        // Initialize progressive loading
        this.setupProgressiveLoading();
        
        // Setup real-time counters
        this.animateCounters();
        
        // Add scroll-triggered animations
        this.setupScrollAnimations();
    }

    setupMicroInteractions() {
        // Profile image hover effects
        $('.counsellor-avatar').on('mouseenter', function() {
            $(this).find('img, .counsellor-placeholder-img').addClass('hover-zoom');
        }).on('mouseleave', function() {
            $(this).find('img, .counsellor-placeholder-img').removeClass('hover-zoom');
        });

        // Stats animation on hover
        $('.stat-item').on('mouseenter', function() {
            $(this).addClass('stat-highlight');
        }).on('mouseleave', function() {
            $(this).removeClass('stat-highlight');
        });

        // Specialization tag interactions
        $('.specialization-tag').on('click', function() {
            const specialty = $(this).text().toLowerCase();
            $('#counsellorSearch').val(specialty).trigger('input');
        });
    }    setupProgressiveLoading() {
        // Simulate loading states for better UX
        const cards = $('.counsellor-card');
        cards.each(function(index) {
            $(this).css('opacity', '0');
            setTimeout(() => {
                $(this).animate({ opacity: 1 }, 300);
            }, index * 100);
        });
    }

    animateCounters() {
        // Animate the stats counters
        $('.stat-number').each(function() {
            const $this = $(this);
            const target = parseInt($this.text().replace(/[^\d]/g, ''));
            const duration = 2000;
            const steps = 60;
            const increment = target / steps;
            let current = 0;
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    $this.text($this.text().replace(/\d+/, target));
                    clearInterval(timer);
                } else {
                    $this.text($this.text().replace(/\d+/, Math.floor(current)));
                }
            }, duration / steps);
        });
    }

    setupScrollAnimations() {
        // Advanced scroll-triggered animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in-view');
                    
                    // Stagger animation for children
                    const children = entry.target.querySelectorAll('.stat-item, .specialization-tag');
                    children.forEach((child, index) => {
                        setTimeout(() => {
                            child.classList.add('fade-in-up');
                        }, index * 100);
                    });
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '50px'
        });

        $('.counsellor-card').each(function() {
            observer.observe(this);
        });
    }

    setupAvailabilityUpdates() {
        // Simulate real-time availability updates
        setInterval(() => {
            $('.online-indicator').each(function() {
                // Random availability simulation
                if (Math.random() > 0.95) {
                    $(this).toggleClass('away');
                }
            });
        }, 10000);
    }

    handleAdvancedBooking(e) {
        e.preventDefault();
        const $btn = $(e.currentTarget);
        const originalText = $btn.html();
        
        // Show loading state
        $btn.html('<i class="bi bi-clock"></i> Processing...');
        $btn.prop('disabled', true);
        $btn.addClass('loading');
        
        // Simulate booking process
        setTimeout(() => {
            $btn.html('<i class="bi bi-check-circle"></i> Booking...');
            
            setTimeout(() => {
                // Redirect to booking page
                window.location.href = $btn.attr('href');
            }, 1000);
        }, 1500);
    }

    onCardHover(e) {
        const $card = $(e.currentTarget);
        $card.addClass('card-focused');
        
        // Add ripple effect
        const ripple = $('<div class="card-ripple"></div>');
        $card.append(ripple);
        
        setTimeout(() => ripple.remove(), 1000);
    }

    onCardLeave(e) {
        const $card = $(e.currentTarget);
        $card.removeClass('card-focused');
    }

    animateFilter(e) {
        const $chip = $(e.currentTarget);
        
        // Add click animation
        $chip.addClass('filter-clicked');
        setTimeout(() => $chip.removeClass('filter-clicked'), 300);
    }

    performSearch(query) {
        // Enhanced search with highlighting
        const $cards = $('.counsellor-card');
        const searchTerms = query.toLowerCase().split(' ');
        
        $cards.each(function() {
            const $card = $(this);
            const name = $card.data('name').toLowerCase();
            const specialization = $card.data('specialization');
            
            const matches = searchTerms.every(term => 
                name.includes(term) || specialization.includes(term)
            );
            
            if (matches || query === '') {
                $card.show().addClass('search-match');
            } else {
                $card.hide().removeClass('search-match');
            }
        });
        
        this.updateResultsCount();
    }

    updateResultsCount() {
        const visibleCards = $('.counsellor-card:visible').length;
        $('#counsellorCount').text(`${visibleCards} Available`);
        
        if (visibleCards === 0) {
            $('#noResults').removeClass('d-none');
        } else {
            $('#noResults').addClass('d-none');
        }
    }

    setupParallaxEffect() {
        $(window).on('scroll', () => {
            const scrolled = $(window).scrollTop();
            const heroContent = $('.counsellor-hero-content');
            
            // Parallax effect for hero content
            heroContent.css('transform', `translateY(${scrolled * 0.3}px)`);
            
            // Update hero background
            $('.counsellor-hero').css('background-position-y', `${scrolled * 0.5}px`);
        });
    }    setupSmoothAnimations() {
        // Add CSS for smooth animations
        const style = document.createElement('style');
        style.textContent = `
            .animate-in {
                animation: slideInUp 0.8s ease-out forwards;
            }
            
            .animate-in-view {
                animation: fadeInScale 0.6s ease-out forwards;
            }
            
            .fade-in-up {
                animation: fadeInUp 0.5s ease-out forwards;
            }
            
            .hover-zoom {
                transform: scale(1.1) !important;
                transition: transform 0.3s ease;
            }
            
            .stat-highlight {
                background: rgba(79, 70, 229, 0.15) !important;
                transform: scale(1.05);
            }
            
            .card-focused {
                z-index: 10;
                transform: translateY(-15px) scale(1.03) !important;
            }
            
            .card-ripple {
                position: absolute;
                top: 50%;
                left: 50%;
                width: 0;
                height: 0;
                border-radius: 50%;
                background: rgba(79, 70, 229, 0.1);
                transform: translate(-50%, -50%);
                animation: rippleEffect 1s ease-out;
            }
            
            .filter-clicked {
                transform: scale(0.95) !important;
            }
            
            .loading {
                position: relative;
                overflow: hidden;
            }
            
            .loading::after {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
                animation: shimmer 1.5s infinite;
            }
            
            @keyframes slideInUp {
                from {
                    opacity: 0;
                    transform: translateY(40px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes fadeInScale {
                from {
                    opacity: 0;
                    transform: scale(0.9);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }
            
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes rippleEffect {
                to {
                    width: 200px;
                    height: 200px;
                    opacity: 0;
                }
            }
            
            @keyframes shimmer {
                0% { left: -100%; }
                100% { left: 100%; }
            }
            
            .card-pulse {
                animation: cardPulse 0.4s ease-in-out;
            }
            
            @keyframes cardPulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.02); }
                100% { transform: scale(1); }
            }
            
            .search-match {
                animation: highlightMatch 0.5s ease-in-out;
            }
            
            @keyframes highlightMatch {
                0% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.7); }
                70% { box-shadow: 0 0 0 10px rgba(79, 70, 229, 0); }
                100% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0); }
            }
            
            .online-indicator.away {
                background: #f59e0b !important;
            }
            
            /* Enhanced mobile responsiveness */
            @media (max-width: 768px) {
                .counsellor-grid {
                    grid-template-columns: 1fr;
                    gap: 1.5rem;
                }
                
                .counsellor-hero h1 {
                    font-size: 2.5rem;
                }
                
                .filter-group {
                    justify-content: center;
                }
                
                .counsellor-stats {
                    grid-template-columns: repeat(3, 1fr);
                    gap: 0.5rem;
                }
                
                .stat-number {
                    font-size: 1.4rem;
                }
            }
        `;
        document.head.appendChild(style);
    }

    onCardHover(e) {
        const $card = $(e.currentTarget);
        $card.addClass('card-pulse');
        
        // Add subtle glow effect
        $card.css({
            'box-shadow': '0 25px 50px rgba(37, 99, 235, 0.2)',
            'z-index': '10'
        });

        // Animate avatar
        $card.find('.counsellor-avatar img, .counsellor-placeholder-img').css({
            'transform': 'scale(1.1) rotate(2deg)'
        });
    }

    onCardLeave(e) {
        const $card = $(e.currentTarget);
        $card.removeClass('card-pulse');
        
        // Remove glow effect
        $card.css({
            'box-shadow': '',
            'z-index': ''
        });

        // Reset avatar
        $card.find('.counsellor-avatar img, .counsellor-placeholder-img').css({
            'transform': ''
        });
    }

    handleQuickBook(e) {
        e.preventDefault();
        const $btn = $(e.currentTarget);
        const counsellorName = $btn.closest('.counsellor-card').find('.counsellor-name').text();
        
        // Show confirmation modal (you can replace this with a proper modal)
        if (confirm(`Book a session with ${counsellorName}?`)) {
            // Add loading state
            $btn.html('<i class="bi bi-clock"></i> Booking...');
            $btn.prop('disabled', true);
            
            // Simulate booking process
            setTimeout(() => {
                window.location.href = $btn.attr('href');
            }, 1000);
        }
    }

    animateFilter(e) {
        const $chip = $(e.currentTarget);
        
        // Ripple effect
        const ripple = $('<span class="ripple"></span>');
        $chip.append(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    performSearch(query) {
        const $cards = $('.counsellor-card');
        let visibleCount = 0;

        $cards.each(function() {
            const $card = $(this);
            const name = $card.data('name').toLowerCase();
            const specialization = $card.data('specialization');
            
            const matches = query === '' || 
                name.includes(query.toLowerCase()) || 
                specialization.includes(query.toLowerCase().replace(/\s+/g, ''));

            if (matches) {
                $card.fadeIn(300);
                visibleCount++;
            } else {
                $card.fadeOut(300);
            }
        });

        // Update results count with animation
        $('#counsellorCount').fadeOut(200, function() {
            $(this).text(`${visibleCount} Available`).fadeIn(200);
        });

        // Show/hide no results
        if (visibleCount === 0) {
            $('#noResults').fadeIn(300);
            $('#counsellorsGrid').fadeOut(300);
        } else {
            $('#noResults').fadeOut(300);
            $('#counsellorsGrid').fadeIn(300);
        }
    }

    setupLazyLoading() {
        // Lazy load images for better performance
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    initializeFilters() {
        // Initialize filter state
        this.activeFilters = new Set(['all']);
        this.sortOrder = 'name';
        
        // Add filter change animations
        $('.filter-chip').on('click', () => {
            setTimeout(() => {
                this.reorderCards();
            }, 300);
        });
    }

    reorderCards() {
        const $container = $('#counsellorsGrid');
        const $cards = $('.counsellor-card:visible');
        
        // Animate out
        $cards.css('opacity', '0.5');
        
        setTimeout(() => {
            // Reorder based on current sort
            const sortedCards = $cards.sort((a, b) => {
                const $a = $(a);
                const $b = $(b);
                
                switch(this.sortOrder) {
                    case 'experience':
                        return $b.data('experience') - $a.data('experience');
                    case 'specialization':
                        return $a.data('specialization').localeCompare($b.data('specialization'));
                    default:
                        return $a.data('name').localeCompare($b.data('name'));
                }
            });
            
            // Re-append in new order
            $container.append(sortedCards);
            
            // Animate in
            $cards.css('opacity', '1');
        }, 300);
    }
}

// Initialize when DOM is ready
$(document).ready(() => {
    new CounsellorPage();
    
    // Add some extra responsive behavior
    $(window).on('resize', () => {
        // Adjust layout for mobile
        if ($(window).width() < 768) {
            $('.counsellor-stats').addClass('mobile-layout');
        } else {
            $('.counsellor-stats').removeClass('mobile-layout');
        }
    });
});
