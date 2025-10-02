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
    this.skipBtn = document.querySelector('.intro-skip-btn');

    this.currentPhase = 1;
    this.skipTimeout = null;
    this.isPlaying = false;

    // Debug element selection
    console.log('Intro elements:', {
      overlay: !!this.overlay,
      textContainer: !!this.textContainer,
      touchSvg: !!this.touchSvg,
      video: !!this.video,
      videoSource: !!this.videoSource,
      skipBtn: !!this.skipBtn
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

    // Skip button functionality
    this.skipBtn.addEventListener('click', () => this.skipIntro());

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

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.overlay.classList.contains('hidden')) {
        this.skipIntro();
      }
    });
  }

  startIntroSequence() {
    // Phase 1: Text and SVG animations are handled by CSS
    // Show skip button after 2.5 seconds
    this.skipTimeout = setTimeout(() => {
      this.skipBtn.classList.add('visible');
    }, 2500);
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

  skipIntro() {
    // Clear any timeouts
    if (this.skipTimeout) {
      clearTimeout(this.skipTimeout);
    }

    // Stop video if playing
    if (this.video && !this.video.paused) {
      this.video.pause();
    }

    // Remove video-related classes if we're in video phase
    this.overlay.classList.remove('video-phase');

    // Mark as completed and hide
    this.completeIntro();
  }

  hideIntro() {
    this.overlay.classList.add('hidden');

    // Remove intro-active class from body to restore normal header styling
    document.body.classList.remove('intro-active');

    // Remove from DOM after transition
    setTimeout(() => {
      if (this.overlay && this.overlay.parentNode) {
        this.overlay.style.display = 'none';
      }
    }, 500);
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
  }
});

// Expose reset function globally for debugging
window.resetIntro = () => {
  if (window.introAnimation) {
    window.introAnimation.resetIntro();
  }
};