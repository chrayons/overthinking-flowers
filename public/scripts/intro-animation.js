/**
 * Intro Animation System
 * Handles the three-phase intro sequence with session management
 */

class IntroAnimation {
  constructor() {
    this.overlay = document.getElementById('intro-overlay');
    this.textContainer = document.querySelector('.intro-text-container');
    this.touchSvg = document.querySelector('.intro-touch-svg');
    this.video = document.querySelector('.intro-video');
    this.videoSource = document.querySelector('.intro-video-source');

    this.currentPhase = 1;
    this.skipTimeout = null;
    this.isPlaying = false;

    // Debug element selection
    console.log('Intro elements:', {
      overlay: !!this.overlay,
      textContainer: !!this.textContainer,
      touchSvg: !!this.touchSvg,
      video: !!this.video,
      videoSource: !!this.videoSource
    });

    this.init();
  }

  init() {
    // Add intro-active class to body for header styling
    document.body.classList.add('intro-active');

    // Check session storage - skip intro if already seen
    if (this.shouldSkipIntro()) {
      this.hideIntro();
      return;
    }

    // Set up video source based on device
    this.setupVideoSource();

    // Force disable video controls (especially important for mobile)
    this.disableVideoControls();

    // Set up event listeners
    this.setupEventListeners();

    // Start the intro sequence
    this.startIntroSequence();
  }

  shouldSkipIntro() {
    // Check session storage to see if intro was already seen
    return sessionStorage.getItem('intro-seen') === 'true';
  }

  setupVideoSource() {
    const isMobile = window.innerWidth <= 775;
    const videoPath = isMobile ? 'videos/intro-mobile.mp4' : 'videos/intro-desktop.mp4';
    this.videoSource.src = videoPath;
    this.video.load(); // Reload video with new source
  }

  disableVideoControls() {
    if (!this.video) return;

    // Programmatically ensure no controls
    this.video.controls = false;
    this.video.removeAttribute('controls');

    // Set mobile-specific attributes
    this.video.setAttribute('playsinline', 'true');
    this.video.setAttribute('webkit-playsinline', 'true');
    this.video.setAttribute('x-webkit-airplay', 'deny');

    // Disable context menu and selection
    this.video.style.pointerEvents = 'none';
    this.video.style.webkitUserSelect = 'none';
    this.video.style.userSelect = 'none';

    // Mobile-specific: force no controls on load
    this.video.addEventListener('loadstart', () => {
      this.video.controls = false;
    });

    this.video.addEventListener('loadedmetadata', () => {
      this.video.controls = false;
    });

    console.log('Video controls forcibly disabled');
  }

  setupEventListeners() {
    // Touch/click on SVG to start video
    this.touchSvg.addEventListener('click', (e) => {
      console.log('SVG clicked!');
      e.preventDefault();
      this.startVideoPhase();
    });
    this.touchSvg.addEventListener('touchend', (e) => {
      console.log('SVG touch ended!');
      e.preventDefault();
      this.startVideoPhase();
    });

    // Fallback: click on the entire touch container
    const touchContainer = document.querySelector('.intro-touch-container');
    if (touchContainer) {
      touchContainer.addEventListener('click', (e) => {
        console.log('Touch container clicked!');
        e.preventDefault();
        this.startVideoPhase();
      });
    }


    // Video ended event
    this.video.addEventListener('ended', () => this.completeIntro());

    // Handle window resize for responsive video switching
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (!this.isPlaying) {
          this.setupVideoSource();
        }
      }, 250);
    });

  }

  startIntroSequence() {
    // Phase 1: Text and SVG animations are handled by CSS
    // No skip button needed since intro only plays once per session
  }

  startVideoPhase() {
    console.log('Starting video phase, current phase:', this.currentPhase);

    if (this.currentPhase !== 1) {
      console.log('Not in phase 1, ignoring video start');
      return;
    }

    this.currentPhase = 2;
    this.isPlaying = true;

    console.log('Video source:', this.videoSource.src);
    console.log('Video element:', this.video);

    // Trigger ripple animation
    this.touchSvg.classList.add('clicked');

    // Add video phase class to maintain blue background
    this.overlay.classList.add('video-phase');

    // Start video after ripple animation (0.8s)
    setTimeout(() => {
      // Hide text and SVG
      this.textContainer.style.opacity = '0';

      // Fade out headers
      document.body.classList.add('headers-faded');

      // Start video after short delay
      setTimeout(() => {
        this.video.classList.add('playing');
        console.log('Attempting to play video...');
        this.video.play().then(() => {
          console.log('Video started playing successfully');
        }).catch(error => {
          console.error('Video autoplay failed:', error);
          console.log('Video ready state:', this.video.readyState);
          console.log('Video can play type:', this.video.canPlayType('video/mp4'));
          // If autoplay fails, skip to completion
          setTimeout(() => this.completeIntro(), 500);
        });
      }, 300);
    }, 800); // Wait for ripple animation to complete
  }

  completeIntro() {
    this.currentPhase = 3;
    this.isPlaying = false;

    // Mark intro as seen
    sessionStorage.setItem('intro-seen', 'true');

    // Transition background to normal color before revealing garden
    this.overlay.classList.remove('video-phase');
    this.overlay.classList.add('completing');

    // Fade headers back in
    document.body.classList.remove('headers-faded');

    // Hide the entire overlay after background transition
    setTimeout(() => {
      this.hideIntro();
    }, 300); // Wait for background transition to complete
  }


  hideIntro() {
    this.overlay.classList.add('hidden');

    // Remove intro-active class from body to restore normal header styling
    document.body.classList.remove('intro-active');

    // Temporarily disable flower interactions to prevent hover from interfering with grow animations
    this.disableFlowerInteractions();

    // Trigger flower animations after intro completes
    setTimeout(() => {
      if (window.triggerFlowerAnimations) {
        console.log('Triggering flower animations after intro completion');
        window.triggerFlowerAnimations();
      }
    }, 300); // Small delay to let intro transition finish

    // Remove from DOM after transition
    setTimeout(() => {
      if (this.overlay && this.overlay.parentNode) {
        this.overlay.style.display = 'none';
      }
    }, 500);
  }

  disableFlowerInteractions() {
    // Disable pointer events on all interactive flower elements temporarily
    const flowerSectors = document.querySelectorAll('.mg-sector');
    const categoryLabels = document.querySelectorAll('.category-label');
    const categoryCells = document.querySelectorAll('.category-cell');

    // Store original pointer-events values for restoration
    const originalPointerEvents = new Map();

    [...flowerSectors, ...categoryLabels, ...categoryCells].forEach(element => {
      originalPointerEvents.set(element, element.style.pointerEvents || 'auto');
      element.style.pointerEvents = 'none';
    });

    console.log('Flower interactions disabled during grow animations');

    // Re-enable interactions after grow animations complete
    setTimeout(() => {
      [...flowerSectors, ...categoryLabels, ...categoryCells].forEach(element => {
        const originalValue = originalPointerEvents.get(element);
        element.style.pointerEvents = originalValue;
      });
      console.log('Flower interactions re-enabled after grow animations');
    }, 1500); // 1500ms = 300ms intro delay + 800ms animation + 400ms buffer
  }

  // Public method to reset intro (for testing or admin purposes)
  resetIntro() {
    sessionStorage.removeItem('intro-seen');
    location.reload();
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, checking for intro overlay...');
  const overlayElement = document.getElementById('intro-overlay');
  console.log('Intro overlay element found:', !!overlayElement);

  // Only initialize if we're on the main garden page (not category pages)
  if (overlayElement) {
    console.log('Initializing IntroAnimation...');
    window.introAnimation = new IntroAnimation();
    console.log('IntroAnimation initialized:', !!window.introAnimation);
  } else {
    console.log('No intro overlay found, skipping initialization');
    // If no intro overlay exists, trigger flower animations directly after page load
    setTimeout(() => {
      if (window.triggerFlowerAnimations) {
        console.log('Triggering flower animations (no intro system)');
        window.triggerFlowerAnimations();
      }
    }, 1000); // Wait for page load to complete
  }
});

// Expose reset function globally for debugging
window.resetIntro = () => {
  if (window.introAnimation) {
    window.introAnimation.resetIntro();
  }
};