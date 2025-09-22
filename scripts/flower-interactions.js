// flower-interactions.js
// Handles hover effects, tooltips, and click behavior for flowers on category pages

const FlowerInteractions = {
  // Store all flower data for global hover detection
  flowers: [],
  currentHoveredFlower: null,
  tooltip: null,
  globalHandlersAdded: false,

  // Clear all flower data (call this when layout changes)
  clearAll: function() {
    // Clean up existing state
    this.flowers = [];
    this.currentHoveredFlower = null;
    if (this.tooltip) {
      try {
        document.body.removeChild(this.tooltip);
      } catch(e) {
        // Tooltip might already be removed
      }
      this.tooltip = null;
    }
    this.restoreOtherFlowers();

    // Force reset of global handlers by clearing the flag
    // This ensures fresh mouse tracking for new layout
    this.globalHandlersAdded = false;
  },

  // Add interactive behavior to a flower element
  addBehavior: function(flowerElement, flowerData) {
    if (!flowerElement || !flowerData) return;

    // Replace default hover areas with custom ones that match petal shapes
    const bounds = this.replaceHoverAreas(flowerElement, flowerData);

    // Check if this flower already exists and update it instead of adding duplicate
    const existingIndex = this.flowers.findIndex(f => f.data.id === flowerData.id);
    if (existingIndex >= 0) {
      // Update existing flower
      console.log(`Updating interaction for flower ${flowerData.id}`);
      this.flowers[existingIndex] = {
        element: flowerElement,
        data: flowerData,
        bounds: bounds
      };
    } else {
      // Add new flower
      console.log(`Adding interaction for flower ${flowerData.id}`);
      this.flowers.push({
        element: flowerElement,
        data: flowerData,
        bounds: bounds
      });
    }

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

    // Mobile-aware padding and minimum touch targets
    const isMobile = window.innerWidth <= 1160;
    const padding = isMobile ? 25 : 15; // Larger padding on mobile

    minX -= padding;
    maxX += padding;
    minY -= padding;
    maxY += padding;

    // Ensure minimum interaction area - larger for mobile touch
    const currentWidth = maxX - minX;
    const currentHeight = maxY - minY;
    const minInteractionSize = isMobile ? 80 : 60; // 80px minimum on mobile, 60px on desktop

    if (currentWidth < minInteractionSize) {
      const extraWidth = (minInteractionSize - currentWidth) / 2;
      minX -= extraWidth;
      maxX += extraWidth;
    }

    if (currentHeight < minInteractionSize) {
      const extraHeight = (minInteractionSize - currentHeight) / 2;
      minY -= extraHeight;
      maxY += extraHeight;
    }


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


        try {
          // Check if SVG is still in DOM and visible
          const rect = svg.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) continue;

          // Convert mouse to SVG local coordinates with error handling
          const screenCTM = svg.getScreenCTM();
          if (!screenCTM) continue; // Skip if transformation matrix is invalid

          const pt = svg.createSVGPoint();
          pt.x = e.clientX;
          pt.y = e.clientY;
          const local = pt.matrixTransform(screenCTM.inverse());

          const x = local.x;
          const y = local.y;

          // Additional validation for edge cases
          if (isNaN(x) || isNaN(y)) continue;

          if (x >= flower.bounds.minX && x <= flower.bounds.maxX &&
              y >= flower.bounds.minY && y <= flower.bounds.maxY) {
            return flower;
          }
        } catch (error) {
          // Skip flowers with transformation errors (often happens with edge-positioned elements)
          continue;
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

    // Touch event handlers for mobile support - two-tap system
    let touchTimeout = null;
    let lastTouchTime = 0;
    let lastTouchedFlower = null;

    // Handle touch start - show tooltip (first tap) or open modal (second tap)
    container.addEventListener('touchstart', (e) => {
      // Don't intercept touches on buttons or links
      if (e.target.matches('a, button, .btn-return-home')) {
        return;
      }

      // Use first touch point
      const touch = e.touches[0];
      const touchEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY,
        pageX: touch.pageX,
        pageY: touch.pageY
      };

      const touchedFlower = getFlowerAtPosition(touchEvent);
      const currentTime = Date.now();

      if (touchedFlower) {
        // Check if this is a second tap on the same flower within 1 second
        if (touchedFlower === lastTouchedFlower &&
            touchedFlower === this.currentHoveredFlower &&
            currentTime - lastTouchTime < 1000) {

          // Second tap - open modal
          e.preventDefault();
          e.stopPropagation();

          if (touchTimeout) {
            clearTimeout(touchTimeout);
            touchTimeout = null;
          }

          if (window.Modal && typeof window.Modal.openById === 'function') {
            console.log('Opening modal for flower ID (second tap):', touchedFlower.data.id);
            window.Modal.openById(touchedFlower.data.id);
          }

          // Clean up hover state
          this.currentHoveredFlower.element.style.cursor = '';
          if (this.tooltip) {
            document.body.removeChild(this.tooltip);
            this.tooltip = null;
          }
          this.restoreOtherFlowers();
          this.currentHoveredFlower = null;
          lastTouchedFlower = null;

        } else {
          // First tap - show tooltip and hover effects

          // Clear any existing timeout
          if (touchTimeout) {
            clearTimeout(touchTimeout);
            touchTimeout = null;
          }

          // Clean up previous hover state if different flower
          if (this.currentHoveredFlower && this.currentHoveredFlower !== touchedFlower) {
            this.currentHoveredFlower.element.style.cursor = '';
            if (this.tooltip) {
              document.body.removeChild(this.tooltip);
              this.tooltip = null;
            }
            this.restoreOtherFlowers();
          }

          // Show new hover state (or refresh current one)
          touchedFlower.element.style.cursor = 'pointer';
          if (this.tooltip) {
            document.body.removeChild(this.tooltip);
          }
          this.tooltip = this.createTooltip(touchedFlower.data.text, touchEvent);
          document.body.appendChild(this.tooltip);
          this.fadeOtherFlowers(touchedFlower.element);
          this.currentHoveredFlower = touchedFlower;

          // Set timeout to hide tooltip after 4 seconds (gives time for second tap)
          touchTimeout = setTimeout(() => {
            if (this.currentHoveredFlower) {
              this.currentHoveredFlower.element.style.cursor = '';
              if (this.tooltip) {
                document.body.removeChild(this.tooltip);
                this.tooltip = null;
              }
              this.restoreOtherFlowers();
              this.currentHoveredFlower = null;
            }
            lastTouchedFlower = null;
            touchTimeout = null;
          }, 4000);

          lastTouchedFlower = touchedFlower;
          lastTouchTime = currentTime;
        }
      } else {
        // Touched outside any flower - check if should return to category view
        const isMobile = window.innerWidth <= 1160;

        // Clear everything first
        if (touchTimeout) {
          clearTimeout(touchTimeout);
          touchTimeout = null;
        }

        if (this.currentHoveredFlower) {
          this.currentHoveredFlower.element.style.cursor = '';
          if (this.tooltip) {
            document.body.removeChild(this.tooltip);
            this.tooltip = null;
          }
          this.restoreOtherFlowers();
          this.currentHoveredFlower = null;
        }

        lastTouchedFlower = null;

        // On mobile, tapping outside returns to category view smoothly
        if (isMobile) {
          // Add a small delay to ensure the touch was intentional (not accidental scroll)
          setTimeout(() => {
            // Navigate back to home with smooth transition
            window.location.href = 'index.html';
          }, 100);
        }
      }
    });

    // Handle touch end - prevent default only if we handled the touch
    container.addEventListener('touchend', (e) => {
      // Don't intercept touches on buttons or links
      if (e.target.matches('a, button, .btn-return-home')) {
        return;
      }

      // If we have a current hovered flower, prevent default behavior
      if (this.currentHoveredFlower) {
        e.preventDefault();
      }
    });

    // Handle touch cancel - clean up
    container.addEventListener('touchcancel', () => {
      if (touchTimeout) {
        clearTimeout(touchTimeout);
        touchTimeout = null;
      }

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
    const isMobile = window.innerWidth <= 1160;
    const offset = isMobile ? 15 : 10; // Larger offset on mobile for touch
    const tooltipWidth = 160; // Fixed width
    const tooltipHeight = tooltip.offsetHeight || 60; // Estimate if not yet rendered
    const edgeBuffer = isMobile ? 20 : 10; // Extra buffer from edges on mobile

    // Get viewport dimensions and scroll position
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    // Convert page coordinates to viewport coordinates
    const clientX = mouseEvent.pageX - scrollX;
    const clientY = mouseEvent.pageY - scrollY;

    // Calculate preferred position (below and to the right of cursor)
    let left = clientX + offset;
    let top = clientY + offset;

    // On mobile, prefer centering above the touch point for better UX
    if (isMobile) {
      left = clientX - (tooltipWidth / 2); // Center horizontally on touch point
      top = clientY - tooltipHeight - offset; // Position above touch point
    }

    // Check horizontal bounds and adjust
    if (left + tooltipWidth > viewportWidth - edgeBuffer) {
      // Would go off right edge - position to the left
      left = clientX - tooltipWidth - offset;

      // If still off left edge, clamp to edge buffer
      if (left < edgeBuffer) {
        left = edgeBuffer;
      }
    } else if (left < edgeBuffer) {
      // Would go off left edge - position to the right
      left = clientX + offset;

      // If still off right edge, clamp to available space
      if (left + tooltipWidth > viewportWidth - edgeBuffer) {
        left = viewportWidth - tooltipWidth - edgeBuffer;
      }
    }

    // Check vertical bounds and adjust
    if (top + tooltipHeight > viewportHeight - edgeBuffer) {
      // Would go off bottom edge - position above cursor
      top = clientY - tooltipHeight - offset;
    }

    if (top < edgeBuffer) {
      // Would go off top edge - position below cursor
      top = clientY + offset;

      // If still off bottom edge, clamp to available space
      if (top + tooltipHeight > viewportHeight - edgeBuffer) {
        top = viewportHeight - tooltipHeight - edgeBuffer;
      }
    }

    // Convert back to page coordinates for positioning
    const finalLeft = left + scrollX;
    const finalTop = top + scrollY;

    tooltip.style.left = finalLeft + 'px';
    tooltip.style.top = finalTop + 'px';
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