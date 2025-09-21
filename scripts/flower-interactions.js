// flower-interactions.js
// Handles hover effects, tooltips, and click behavior for flowers on category pages

const FlowerInteractions = {
  // Add interactive behavior to a flower element
  addBehavior: function(flowerElement, flowerData) {
    if (!flowerElement || !flowerData) return;

    // Make flower clickable
    flowerElement.style.cursor = 'pointer';
    flowerElement.style.pointerEvents = 'auto'; // Override any pointer-events: none

    // Add hover effects
    this.addHoverEffects(flowerElement, flowerData);

    // Add click handler
    this.addClickHandler(flowerElement, flowerData);
  },

  // Handle hover effects: tooltip + receding background for other flowers
  addHoverEffects: function(flowerElement, flowerData) {
    let tooltip = null;

    // Mouse enter: show tooltip and fade other flowers
    flowerElement.addEventListener('mouseenter', (e) => {
      // Create and show tooltip
      tooltip = this.createTooltip(flowerData.text, e);
      document.body.appendChild(tooltip);

      // Add white overlay to all OTHER flowers (receding effect)
      this.fadeOtherFlowers(flowerElement);
    });

    // Mouse move: update tooltip position
    flowerElement.addEventListener('mousemove', (e) => {
      if (tooltip) {
        this.updateTooltipPosition(tooltip, e);
      }
    });

    // Mouse leave: hide tooltip and restore other flowers
    flowerElement.addEventListener('mouseleave', () => {
      // Remove tooltip
      if (tooltip) {
        document.body.removeChild(tooltip);
        tooltip = null;
      }

      // Restore other flowers
      this.restoreOtherFlowers();
    });
  },

  // Add click handler to open modal
  addClickHandler: function(flowerElement, flowerData) {
    flowerElement.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Debug Modal availability
      console.log('Click detected. Checking Modal system:');
      console.log('window.Modal exists:', !!window.Modal);
      console.log('Modal object:', window.Modal);
      console.log('Modal.open exists:', !!(window.Modal && typeof window.Modal.open === 'function'));

      // Use existing Modal system (same as shuffle.js)
      if (window.Modal && typeof window.Modal.openById === 'function') {
        console.log('Opening modal for flower ID:', flowerData.id, 'text:', flowerData.text);
        window.Modal.openById(flowerData.id);
      } else {
        console.warn('Modal system not available or not properly initialized');
        console.warn('Available window properties:', Object.keys(window).filter(k => k.toLowerCase().includes('modal')));
        console.warn('window.Modal:', window.Modal);
      }
    });
  },

  // Create tooltip element
  createTooltip: function(text, mouseEvent) {
    const tooltip = document.createElement('div');
    tooltip.className = 'flower-tooltip';
    tooltip.textContent = text;

    // Style tooltip (similar to existing mg-tooltip)
    tooltip.style.position = 'absolute';
    tooltip.style.zIndex = '9999';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.background = 'rgba(255, 255, 255, 0.9)';
    tooltip.style.border = '0.5px solid #F8F8FF';
    tooltip.style.borderRadius = '5px';
    tooltip.style.padding = '8px 16px';
    tooltip.style.fontFamily = '"Satoshi Variable", system-ui';
    tooltip.style.fontSize = '13px';
    tooltip.style.fontWeight = '700';
    tooltip.style.color = 'var(--text-primary)';
    tooltip.style.whiteSpace = 'nowrap';
    tooltip.style.maxWidth = '300px';
    tooltip.style.wordWrap = 'break-word';
    tooltip.style.whiteSpace = 'normal';

    // Position tooltip
    this.updateTooltipPosition(tooltip, mouseEvent);

    return tooltip;
  },

  // Update tooltip position based on mouse
  updateTooltipPosition: function(tooltip, mouseEvent) {
    const offset = 10;
    tooltip.style.left = (mouseEvent.pageX + offset) + 'px';
    tooltip.style.top = (mouseEvent.pageY + offset) + 'px';
  },

  // Add white overlay to all flowers except the hovered one
  fadeOtherFlowers: function(hoveredFlower) {
    const allFlowers = document.querySelectorAll('.flower');
    allFlowers.forEach(flower => {
      if (flower !== hoveredFlower) {
        // Add white overlay effect
        flower.style.filter = 'brightness(1.5) contrast(0.7)';
        flower.style.opacity = '0.4';
        flower.style.transition = 'all 0.3s ease';
      }
    });
  },

  // Restore all flowers to normal state
  restoreOtherFlowers: function() {
    const allFlowers = document.querySelectorAll('.flower');
    allFlowers.forEach(flower => {
      flower.style.filter = '';
      flower.style.opacity = '';
      flower.style.transition = 'all 0.3s ease';
    });
  }
};

// Make FlowerInteractions available globally
window.FlowerInteractions = FlowerInteractions;