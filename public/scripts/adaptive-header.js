/**
 * Adaptive Header System
 * Provides transparent-to-frosted-glass header transitions based on scroll position
 */

// Only define if not already defined (prevent duplicate script loading errors)
if (typeof AdaptiveHeader === 'undefined') {
  class AdaptiveHeader {
  constructor() {
    // Use smaller threshold on mobile for faster header activation
    this.scrollThreshold = window.innerWidth <= 775 ? 20 : 50; // Earlier on mobile
    this.isScrolled = false;
    this.ticking = false;

    // Bind methods to maintain context
    this.handleScroll = this.handleScroll.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.updateHeaderState = this.updateHeaderState.bind(this);

    this.init();
  }

  init() {
    // Add scroll listener with passive flag for better performance
    window.addEventListener('scroll', this.handleScroll, { passive: true });

    // Handle resize events to recalculate if needed
    window.addEventListener('resize', this.handleResize, { passive: true });

    // Initial check in case page loads with scroll
    this.updateHeaderState();

    console.log('AdaptiveHeader initialized with threshold:', this.scrollThreshold);
  }

  handleScroll() {
    // Use requestAnimationFrame to throttle scroll events for better performance
    if (!this.ticking) {
      requestAnimationFrame(() => {
        this.updateHeaderState();
        this.ticking = false;
      });
      this.ticking = true;
    }
  }

  handleResize() {
    // Debounce resize events and recheck state
    if (!this.ticking) {
      requestAnimationFrame(() => {
        this.updateHeaderState();
        this.ticking = false;
      });
      this.ticking = true;
    }
  }

  updateHeaderState() {
    // Get current scroll position (cross-browser compatible)
    const scrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    const shouldBeScrolled = scrollY > this.scrollThreshold;

    // Only update if state actually changed to avoid unnecessary DOM manipulation
    if (shouldBeScrolled !== this.isScrolled) {
      this.isScrolled = shouldBeScrolled;

      // Toggle the body class that triggers CSS transitions for the header bar
      document.body.classList.toggle('header-scrolled', this.isScrolled);

      console.log('Header bar state changed:', this.isScrolled ? 'frosted glass active' : 'transparent');
    }
  }

  // Public method to force update (useful for programmatic scroll changes)
  forceUpdate() {
    this.updateHeaderState();
  }

  // Public method to change threshold (useful for different pages)
  setThreshold(newThreshold) {
    this.scrollThreshold = newThreshold;
    this.updateHeaderState();
  }

  // Cleanup method for proper disposal
  destroy() {
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('resize', this.handleResize);
    document.body.classList.remove('header-scrolled');
    console.log('AdaptiveHeader destroyed');
  }
}

// Initialize immediately when script loads for faster header appearance
function initializeAdaptiveHeader() {
  const introOverlay = document.getElementById('intro-overlay');

  if (!introOverlay || introOverlay.classList.contains('hidden')) {
    // Initialize immediately if no intro
    window.adaptiveHeader = new AdaptiveHeader();
  } else {
    // Wait for intro to complete before initializing
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          if (introOverlay.classList.contains('hidden')) {
            // Intro finished, initialize adaptive header with minimal delay
            setTimeout(() => {
              window.adaptiveHeader = new AdaptiveHeader();
            }, 100); // Reduced delay for faster header
            observer.disconnect();
          }
        }
      });
    });

    observer.observe(introOverlay, { attributes: true });
  }
}

// Try to initialize immediately if DOM is already ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAdaptiveHeader);
} else {
  // DOM is already ready, initialize immediately
  initializeAdaptiveHeader();
}

// Expose class globally for potential external use
window.AdaptiveHeader = AdaptiveHeader;