// Mobile Header Dropdown Functionality
const MobileHeader = {
  init: function() {
    this.toggle = document.querySelector('.mobile-header-toggle');
    this.menu = document.querySelector('.mobile-header-menu');

    if (!this.toggle || !this.menu) return;

    this.bindEvents();
  },

  bindEvents: function() {
    // Toggle menu on button click
    this.toggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggleMenu();
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (this.isMenuOpen() && !this.toggle.contains(e.target) && !this.menu.contains(e.target)) {
        this.closeMenu();
      }
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isMenuOpen()) {
        this.closeMenu();
        this.toggle.focus(); // Return focus to toggle button
      }
    });

    // Close menu when clicking menu items
    const menuItems = this.menu.querySelectorAll('.mobile-header-menu-item');
    menuItems.forEach(item => {
      if (item.tagName === 'A') {
        item.addEventListener('click', () => {
          this.closeMenu();
        });
      }
    });

    // Handle window resize - close menu if screen gets larger
    window.addEventListener('resize', () => {
      if (window.innerWidth > 400 && this.isMenuOpen()) {
        this.closeMenu();
      }
    });
  },

  toggleMenu: function() {
    if (this.isMenuOpen()) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  },

  openMenu: function() {
    this.toggle.classList.add('active');
    this.menu.classList.add('active');
    this.toggle.setAttribute('aria-expanded', 'true');

    // Prevent body scrolling when menu is open
    document.body.style.overflow = 'hidden';
  },

  closeMenu: function() {
    this.toggle.classList.remove('active');
    this.menu.classList.remove('active');
    this.toggle.setAttribute('aria-expanded', 'false');

    // Restore body scrolling
    document.body.style.overflow = '';
  },

  isMenuOpen: function() {
    return this.menu.classList.contains('active');
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => MobileHeader.init());
} else {
  MobileHeader.init();
}

// Make MobileHeader available globally for debugging
window.MobileHeader = MobileHeader;