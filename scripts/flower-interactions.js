// flower-interactions.js
// Handles hover effects, tooltips, and click behavior for flowers on category pages

const FlowerInteractions = {
  // Store all flower data for global hover detection
  flowers: [],
  currentHoveredFlower: null,
  tooltip: null,
  globalHandlersAdded: false,

  // Add interactive behavior to a flower element
  addBehavior: function(flowerElement, flowerData) {
    if (!flowerElement || !flowerData) return;

    // Replace default hover areas with custom ones that match petal shapes
    const bounds = this.replaceHoverAreas(flowerElement, flowerData);

    // Store flower data for global handling
    this.flowers.push({
      element: flowerElement,
      data: flowerData,
      bounds: bounds
    });

    // Add global mouse handlers once, but delay to ensure all flowers are loaded
    if (!this.globalHandlersAdded) {
      // Use setTimeout to wait until all flowers are processed
      setTimeout(() => {
        if (!this.globalHandlersAdded) {
          this.addGlobalMouseHandlers();
          this.globalHandlersAdded = true;
        }
      }, 100);
    }
  },

  // Replace default hover areas with ones that match actual petal shapes
  replaceHoverAreas: function(flowerElement, flowerData) {
    // flowerElement might be the SVG itself, or contain an SVG
    const svg = flowerElement.tagName === 'svg' ? flowerElement : flowerElement.querySelector('svg');
    if (!svg) return;

    // Remove existing sectors and disable hover on petals
    const existingSectors = svg.querySelectorAll('.mg-sector');
    existingSectors.forEach(sector => sector.remove());

    // Disable pointer events on the entire SVG first
    svg.style.pointerEvents = 'none';

    // Disable pointer events on all petal elements so only our custom hover area works
    const petals = svg.querySelectorAll('.mg-petal, path, g');
    petals.forEach(petal => {
      petal.style.pointerEvents = 'none';
    });

    // Calculate the actual bounding box of the visible flower
    const width = parseInt(svg.getAttribute('width')) || 350;
    const height = parseInt(svg.getAttribute('height')) || 350;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = width / 2.2;

    // Find the actual bounds of visible petals
    const emotionAngles = {
      fear: 12, anger: 36, disgust: 60, pessimism: 84, sadness: 108,
      anticipation: 150, surprise: 210,
      optimism: 255, joy: 285, love: 315, trust: 345
    };

    let minX = centerX, maxX = centerX, minY = centerY, maxY = centerY;

    // Calculate actual bounds based on visible petals
    Object.keys(flowerData.emotions).forEach(emotion => {
      const intensity = flowerData.emotions[emotion] / 100;
      if (intensity <= 0.01) return; // Skip tiny emotions

      const angle = emotionAngles[emotion];
      const petalLength = intensity * maxRadius;

      // Calculate end point of this petal
      const radians = (angle - 90) * Math.PI / 180;
      const x = centerX + petalLength * Math.cos(radians);
      const y = centerY + petalLength * Math.sin(radians);

      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    });

    // Add padding around the actual flower shape
    const padding = 15;
    minX -= padding;
    maxX += padding;
    minY -= padding;
    maxY += padding;

    // Create invisible hover area (no visual debugging, but still functional)
    const hoverRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    hoverRect.setAttribute("x", minX);
    hoverRect.setAttribute("y", minY);
    hoverRect.setAttribute("width", maxX - minX);
    hoverRect.setAttribute("height", maxY - minY);
    hoverRect.setAttribute("fill", "rgba(0,0,0,0)"); // Invisible
    hoverRect.setAttribute("stroke", "none");
    hoverRect.setAttribute("pointer-events", "none"); // Let global handler manage this
    hoverRect.classList.add("mg-sector");

    // Insert at beginning so it's behind petals
    svg.insertBefore(hoverRect, svg.firstChild);

    // Return the bounds for use in hover detection
    return { minX, minY, maxX, maxY };
  },

  // Add global mouse handlers that check all flowers
  addGlobalMouseHandlers: function() {
    const container = document.getElementById('flower-container');
    if (!container) {
      console.log('No flower-container found!');
      return;
    }

    // Enable pointer events on container so it can receive mouse events
    container.style.pointerEvents = 'auto';

    // Helper function to check if mouse is within a flower's bounds
    const getFlowerAtPosition = (e) => {
      for (let i = 0; i < this.flowers.length; i++) {
        const flower = this.flowers[i];
        const svg = flower.element.tagName === 'svg' ? flower.element : flower.element.querySelector('svg');
        if (!svg) continue;

        const rect = svg.getBoundingClientRect();
        // Convert mouse to SVG local coordinates
        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const local = pt.matrixTransform(svg.getScreenCTM().inverse());

        const x = local.x;
        const y = local.y;

        if (x >= flower.bounds.minX && x <= flower.bounds.maxX &&
            y >= flower.bounds.minY && y <= flower.bounds.maxY) {
          return flower;
        }

      }
      return null;
    };

    // Throttled mouse move handler for better performance
    let throttleTimeout = null;
    container.addEventListener('mousemove', (e) => {
      // Throttle to ~30fps max for better performance
      if (throttleTimeout) return;

      throttleTimeout = setTimeout(() => {
        throttleTimeout = null;
        const hoveredFlower = getFlowerAtPosition(e);

        if (hoveredFlower !== this.currentHoveredFlower) {
          // Flower changed - handle exit and enter
          if (this.currentHoveredFlower) {
            // Exit previous flower
            this.currentHoveredFlower.element.style.cursor = '';
            if (this.tooltip) {
              document.body.removeChild(this.tooltip);
              this.tooltip = null;
            }
            this.restoreOtherFlowers();
          }

          if (hoveredFlower) {
            // Enter new flower
            hoveredFlower.element.style.cursor = 'pointer';
            this.tooltip = this.createTooltip(hoveredFlower.data.text, e);
            document.body.appendChild(this.tooltip);
            this.fadeOtherFlowers(hoveredFlower.element);
          }

          this.currentHoveredFlower = hoveredFlower;
        } else if (hoveredFlower && this.tooltip) {
          // Still on same flower - update tooltip position
          this.updateTooltipPosition(this.tooltip, e);
        }
      }, 16); // ~60fps max
    });

    // Global click handler
    container.addEventListener('click', (e) => {
      // Don't intercept clicks on buttons or links
      if (e.target.matches('a, button, .btn-return-home')) {
        return; // Let the default behavior happen
      }

      const clickedFlower = getFlowerAtPosition(e);
      if (clickedFlower) {
        e.preventDefault();
        e.stopPropagation();

        if (window.Modal && typeof window.Modal.openById === 'function') {
          console.log('Opening modal for flower ID:', clickedFlower.data.id);
          window.Modal.openById(clickedFlower.data.id);
        }
      }
    });

    // Clean up when mouse leaves container
    container.addEventListener('mouseleave', () => {
      if (this.currentHoveredFlower) {
        this.currentHoveredFlower.element.style.cursor = '';
        if (this.tooltip) {
          document.body.removeChild(this.tooltip);
          this.tooltip = null;
        }
        this.restoreOtherFlowers();
        this.currentHoveredFlower = null;
      }
    });
  },

  // Add custom hover effects that only trigger within bounds
  addCustomHoverEffects: function(flowerElement, flowerData, bounds) {
    let tooltip = null;
    let isHovering = false;

    // Helper function to check if mouse is within bounds
    const isWithinBounds = (e) => {
      const svg = flowerElement.tagName === 'svg' ? flowerElement : flowerElement.querySelector('svg');
      if (!svg) return false;

      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const local = pt.matrixTransform(svg.getScreenCTM().inverse());

      const x = local.x;
      const y = local.y;

      return x >= bounds.minX && x <= bounds.maxX && y >= bounds.minY && y <= bounds.maxY;
    };

    // Mouse move: check if we're entering or leaving the bounds
    flowerElement.addEventListener('mousemove', (e) => {
      const withinBounds = isWithinBounds(e);

      if (withinBounds && !isHovering) {
        // Entering bounds - show tooltip and fade other flowers
        isHovering = true;
        flowerElement.style.cursor = 'pointer';
        tooltip = this.createTooltip(flowerData.text, e);
        document.body.appendChild(tooltip);
        this.fadeOtherFlowers(flowerElement);
      } else if (!withinBounds && isHovering) {
        // Leaving bounds - hide tooltip and restore other flowers
        isHovering = false;
        flowerElement.style.cursor = '';
        if (tooltip) {
          document.body.removeChild(tooltip);
          tooltip = null;
        }
        this.restoreOtherFlowers();
      } else if (withinBounds && tooltip) {
        // Still within bounds - update tooltip position
        this.updateTooltipPosition(tooltip, e);
      }
    });

    // Mouse leave: clean up if we leave the entire element
    flowerElement.addEventListener('mouseleave', () => {
      if (isHovering) {
        isHovering = false;
        flowerElement.style.cursor = '';
        if (tooltip) {
          document.body.removeChild(tooltip);
          tooltip = null;
        }
        this.restoreOtherFlowers();
      }
    });
  },

  // Add custom click handler that only triggers within bounds
  addCustomClickHandler: function(flowerElement, flowerData, bounds) {
    // Helper function to check if mouse is within bounds
    const isWithinBounds = (e) => {
      // Get SVG element bounds
      const svg = flowerElement.tagName === 'svg' ? flowerElement : flowerElement.querySelector('svg');
      if (!svg) return false;

      const rect = svg.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      return x >= bounds.minX && x <= bounds.maxX && y >= bounds.minY && y <= bounds.maxY;
    };

    flowerElement.addEventListener('click', (e) => {
      if (!isWithinBounds(e)) return; // Only handle clicks within bounds

      e.preventDefault();
      e.stopPropagation();

      // Use existing Modal system
      if (window.Modal && typeof window.Modal.openById === 'function') {
        console.log('Opening modal for flower ID:', flowerData.id, 'text:', flowerData.text);
        window.Modal.openById(flowerData.id);
      } else {
        console.warn('Modal system not available');
      }
    });
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
    tooltip.textContent = `"${text}"`;

    // Style tooltip with fixed 160px width and text wrapping (matching original mg-tooltip)
    tooltip.style.position = 'absolute';
    tooltip.style.zIndex = '9999';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.background = 'rgba(255, 255, 255, 0.5)'; // More transparent like original
    tooltip.style.border = '0.5px solid #F8F8FF';
    tooltip.style.borderRadius = '5px';
    tooltip.style.padding = '8px 16px';
    tooltip.style.fontFamily = '"Satoshi Variable", system-ui';
    tooltip.style.fontSize = '12px';
    tooltip.style.fontWeight = '400'; // Regular weight
    tooltip.style.fontStyle = 'italic'; // Italic style
    tooltip.style.color = 'var(--text-primary)';
    tooltip.style.userSelect = 'none';
    tooltip.style.width = '160px';
    tooltip.style.minWidth = '160px';
    tooltip.style.maxWidth = '160px';
    tooltip.style.whiteSpace = 'normal';
    tooltip.style.overflowWrap = 'break-word';
    tooltip.style.lineHeight = '1.3';

    // Position tooltip
    this.updateTooltipPosition(tooltip, mouseEvent);

    return tooltip;
  },

  // Update tooltip position with smart viewport-aware positioning
  updateTooltipPosition: function(tooltip, mouseEvent) {
    const offset = 10;
    const tooltipWidth = 160; // Fixed width
    const tooltipHeight = tooltip.offsetHeight || 60; // Estimate if not yet rendered

    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calculate preferred position (below and to the right of cursor)
    let left = mouseEvent.pageX + offset;
    let top = mouseEvent.pageY + offset;

    // Check if tooltip would go off the right edge
    if (left + tooltipWidth > viewportWidth) {
      left = mouseEvent.pageX - tooltipWidth - offset; // Position to the left of cursor
    }

    // Check if tooltip would go off the bottom edge
    if (top + tooltipHeight > viewportHeight) {
      top = mouseEvent.pageY - tooltipHeight - offset; // Position above cursor
    }

    // Ensure tooltip doesn't go off the left edge
    if (left < 0) {
      left = offset;
    }

    // Ensure tooltip doesn't go off the top edge
    if (top < 0) {
      top = offset;
    }

    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
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