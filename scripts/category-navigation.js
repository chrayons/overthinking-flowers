// category-navigation.js
// Category navigation system for category pages

console.log('Category navigation loading...');

// Category order matching home page
const CATEGORY_ORDER = [
  { id: 'loss-of-agency', name: 'Loss of<br>Agency', file: 'loss-of-agency.html' },
  { id: 'perceptual-barriers', name: 'Perceptual<br>Barriers', file: 'perceptual-barriers.html' },
  { id: 'thought-entanglement', name: 'Thought<br>Entanglement', file: 'thought-entanglement.html' },
  { id: 'sensory-overwhelm', name: 'Sensory<br>Overwhelm', file: 'sensory-overwhelm.html' },
  { id: 'perpetual-looping', name: 'Perpetual<br>Looping', file: 'perpetual-looping.html' },
  { id: 'temporal-disconnection', name: 'Temporal<br>Disconnection', file: 'temporal-disconnection.html' },
  { id: 'emotional-dysregulation', name: 'Emotional<br>Dysregulation', file: 'emotional-dysregulation.html' }
];

const CategoryNavigation = {
  currentCategoryIndex: -1,

  init: function() {
    // Determine current category from URL
    const currentFile = window.location.pathname.split('/').pop();
    this.currentCategoryIndex = CATEGORY_ORDER.findIndex(cat => cat.file === currentFile);

    if (this.currentCategoryIndex === -1) {
      console.warn('Current category not found in navigation order');
      return;
    }

    console.log(`Current category: ${CATEGORY_ORDER[this.currentCategoryIndex].name.replace('<br>', ' ')}`);

    // Initialize navigation elements
    this.setupNavigationDots();
    this.setupNavigationButtons();
  },

  setupNavigationDots: function() {
    const dotsContainer = document.querySelector('.category-nav-dots');
    if (!dotsContainer) return;

    // Clear existing dots
    dotsContainer.innerHTML = '';

    // Create dots for each category
    CATEGORY_ORDER.forEach((category, index) => {
      const dot = document.createElement('div');
      dot.className = 'category-nav-dot';
      if (index === this.currentCategoryIndex) {
        dot.classList.add('active');
      }

      // Add click handler for dot navigation
      dot.addEventListener('click', () => {
        this.navigateToCategory(index);
      });

      dotsContainer.appendChild(dot);
    });
  },

  setupNavigationButtons: function() {
    const prevButton = document.querySelector('.category-prev');
    const nextButton = document.querySelector('.category-next');

    if (prevButton) {
      prevButton.addEventListener('click', () => {
        this.navigatePrevious();
      });
    }

    if (nextButton) {
      nextButton.addEventListener('click', () => {
        this.navigateNext();
      });
    }

    // Update button states
    this.updateButtonStates();
  },

  updateButtonStates: function() {
    const prevButton = document.querySelector('.category-prev');
    const nextButton = document.querySelector('.category-next');

    // Always enable buttons for circular navigation
    if (prevButton) {
      prevButton.style.opacity = '0.7';
      prevButton.style.cursor = 'pointer';
    }

    if (nextButton) {
      nextButton.style.opacity = '0.7';
      nextButton.style.cursor = 'pointer';
    }
  },

  navigatePrevious: function() {
    // Circular navigation: if at first category, go to last
    if (this.currentCategoryIndex === 0) {
      this.navigateToCategory(CATEGORY_ORDER.length - 1);
    } else {
      this.navigateToCategory(this.currentCategoryIndex - 1);
    }
  },

  navigateNext: function() {
    // Circular navigation: if at last category, go to first
    if (this.currentCategoryIndex === CATEGORY_ORDER.length - 1) {
      this.navigateToCategory(0);
    } else {
      this.navigateToCategory(this.currentCategoryIndex + 1);
    }
  },

  navigateToCategory: function(targetIndex) {
    if (targetIndex < 0 || targetIndex >= CATEGORY_ORDER.length) {
      console.warn('Invalid category index:', targetIndex);
      return;
    }

    if (targetIndex === this.currentCategoryIndex) {
      return; // Already on this category
    }

    const targetCategory = CATEGORY_ORDER[targetIndex];
    console.log(`Navigating to: ${targetCategory.name.replace('<br>', ' ')}`);

    // Navigate to the new category page
    window.location.href = targetCategory.file;
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  CategoryNavigation.init();
});

// Also initialize if DOM is already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    CategoryNavigation.init();
  });
} else {
  CategoryNavigation.init();
}