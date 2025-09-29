(function() {
    'use strict';

    const STORAGE_KEY = 'instructional_banner_shown';
    const SWIPE_THRESHOLD = 40; // pixels

    // Device and session detection
    function shouldShowBanner() {
        // Check if already shown this session
        if (sessionStorage.getItem(STORAGE_KEY)) {
            return false;
        }

        // Check screen width
        if (window.innerWidth > 1160) {
            return false;
        }

        // Check touch support
        const hasTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        if (!hasTouch) {
            return false;
        }

        return true;
    }

    // Animation and interaction management
    class InstructionalBanner {
        constructor() {
            this.banner = document.getElementById('instructional-banner');
            this.isVisible = false;
            this.touchStartY = 0;
            this.isDismissing = false;

            this.init();
        }

        init() {
            if (!this.banner || !shouldShowBanner()) {
                return;
            }

            this.setupEventListeners();
            this.show();
        }

        setupEventListeners() {
            // Click to dismiss
            this.banner.addEventListener('click', (e) => {
                console.log('Banner clicked');
                e.preventDefault();
                e.stopPropagation();
                this.dismiss();
            });

            // Touch events for swipe detection
            this.banner.addEventListener('touchstart', (e) => {
                console.log('Banner touchstart');
                e.stopPropagation();
                this.touchStartY = e.touches[0].clientY;
            }, { passive: false });

            this.banner.addEventListener('touchmove', (e) => {
                if (this.isDismissing) return;

                e.stopPropagation();
                const touchY = e.touches[0].clientY;
                const deltaY = touchY - this.touchStartY;

                console.log('Banner touchmove, deltaY:', deltaY);

                // Swipe down detection
                if (deltaY > SWIPE_THRESHOLD) {
                    console.log('Swipe down detected, dismissing banner');
                    e.preventDefault();
                    this.dismiss();
                }
            }, { passive: false });

            this.banner.addEventListener('touchend', (e) => {
                e.stopPropagation();
            }, { passive: false });

            // Keyboard accessibility (ESC to dismiss)
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isVisible && !this.isDismissing) {
                    this.dismiss();
                }
            });

            // Handle resize to hide/show appropriately
            window.addEventListener('resize', () => {
                if (window.innerWidth > 1160 && this.isVisible) {
                    this.hide();
                }
            });
        }

        show() {
            console.log('Showing instructional banner');

            // Mark as shown in session storage immediately
            sessionStorage.setItem(STORAGE_KEY, 'true');

            // Show the banner
            this.banner.style.display = 'block';
            this.isVisible = true;

            // Delay entrance animation
            setTimeout(() => {
                this.banner.classList.add('show');

                // Add bounce animation if motion not reduced
                const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                if (!prefersReducedMotion) {
                    setTimeout(() => {
                        this.banner.classList.add('bounce');
                    }, 400); // Start bounce after entrance animation
                }
            }, 600);
        }

        dismiss() {
            if (this.isDismissing) return;

            this.isDismissing = true;
            this.banner.classList.remove('bounce');
            this.banner.classList.add('dismissing');

            // Hide after animation completes
            setTimeout(() => {
                this.hide();
            }, 300);
        }

        hide() {
            this.banner.style.display = 'none';
            this.isVisible = false;
            this.isDismissing = false;
            this.banner.classList.remove('show', 'bounce', 'dismissing');
        }
    }

    // Global helper for QA testing
    window.resetCoachmarkSession = function() {
        sessionStorage.removeItem(STORAGE_KEY);
        console.log('Instructional banner session reset. Reload the page to see the banner again.');
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            new InstructionalBanner();
        });
    } else {
        new InstructionalBanner();
    }

})();