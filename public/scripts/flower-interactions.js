// flower-interactions.js
// Optimized flower interaction system - all functionality preserved

const FlowerInteractions = {
  // Store all flower data for global hover detection
  flowers: [],
  currentHoveredFlower: null,
  tooltip: null,
  globalHandlersAdded: false,
  pageLoadTime: Date.now(),
  modalCloseTime: 0,

  // Constants for optimized interactions
  EMOTION_ANGLES: {
    fear: 12, anger: 36, disgust: 60, pessimism: 84, sadness: 108,
    anticipation: 150, surprise: 210,
    optimism: 255, joy: 285, love: 315, trust: 345
  },

  CONFIG: {
    THROTTLE_DELAY: 16,
    TOUCH_TIMEOUT: 4000,
    DOUBLE_TAP_WINDOW: 800,  // Reduced from 1000ms for faster response
    MOBILE_BREAKPOINT: 1160,
    NAVIGATION_COOLDOWN: 200,   // Reduced from 300ms to 200ms
    MODAL_CLOSE_COOLDOWN: 150   // Reduced from 200ms to 150ms
  },

  // Utility functions
  isMobile: function() {
    return window.innerWidth <= this.CONFIG.MOBILE_BREAKPOINT;
  },

  isModalOpen: function() {
    const modalOverlay = document.getElementById('mg-modal-overlay');
    return modalOverlay && modalOverlay.classList.contains('open');
  },

  isNavigationCooldownActive: function() {
    return (Date.now() - this.pageLoadTime) < this.CONFIG.NAVIGATION_COOLDOWN;
  },

  isModalCloseCooldownActive: function() {
    return (Date.now() - this.modalCloseTime) < this.CONFIG.MODAL_CLOSE_COOLDOWN;
  },

  setModalCloseTime: function() {
    this.modalCloseTime = Date.now();
  },

  getDeviceConfig: function() {
    const mobile = this.isMobile();
    return {
      isMobile: mobile,
      minInteractionSize: mobile ? 80 : 60,
      padding: mobile ? 25 : 15,
      tooltipOffset: mobile ? 15 : 10,
      edgeBuffer: mobile ? 20 : 10
    };
  },

  // Clear all flower data (call this when layout changes)
  clearAll: function() {
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
    this.globalHandlersAdded = false;
    // Reset page load time to prevent interactions immediately after layout change
    this.pageLoadTime = Date.now();
  },

  // Add interactive behavior to a flower element
  addBehavior: function(flowerElement, flowerData) {
    if (!flowerElement || !flowerData) return;

    // Calculate bounds and setup hover areas
    const bounds = this.calculateFlowerBounds(flowerElement, flowerData);
    if (!bounds) return;

    // Create hover area
    this.createHoverArea(flowerElement, bounds);

    // Check if this flower already exists and update it
    const existingIndex = this.flowers.findIndex(f => f.data.id === flowerData.id);
    if (existingIndex >= 0) {
      console.log(`Updating interaction for flower ${flowerData.id}`);
      this.flowers[existingIndex] = {
        element: flowerElement,
        data: flowerData,
        bounds: bounds
      };
    } else {
      console.log(`Adding interaction for flower ${flowerData.id}`);
      this.flowers.push({
        element: flowerElement,
        data: flowerData,
        bounds: bounds
      });
    }

    // Add global mouse handlers once
    if (!this.globalHandlersAdded) {
      setTimeout(() => {
        if (!this.globalHandlersAdded) {
          this.addGlobalMouseHandlers();
          this.globalHandlersAdded = true;
        }
      }, 100);
    }
  },

  // Calculate flower bounds based on visible petals
  calculateFlowerBounds: function(flowerElement, flowerData) {
    const svg = flowerElement.tagName === 'svg' ? flowerElement : flowerElement.querySelector('svg');
    if (!svg) return null;

    // Use viewBox dimensions first, then getBoundingClientRect, then attributes as fallback
    const vb = svg.viewBox && svg.viewBox.baseVal;
    const rect = svg.getBoundingClientRect();
    const width = (vb && vb.width) || rect.width || parseInt(svg.getAttribute('width')) || 350;
    const height = (vb && vb.height) || rect.height || parseInt(svg.getAttribute('height')) || 350;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = width / 2.2;

    let minX = centerX, maxX = centerX, minY = centerY, maxY = centerY;

    // Calculate actual bounds based on visible petals
    Object.keys(flowerData.emotions).forEach(emotion => {
      const intensity = flowerData.emotions[emotion] / 100;
      if (intensity <= 0.01) return;

      const angle = this.EMOTION_ANGLES[emotion];
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

    const config = this.getDeviceConfig();

    // Add padding
    minX -= config.padding;
    maxX += config.padding;
    minY -= config.padding;
    maxY += config.padding;

    // Ensure minimum interaction area
    const currentWidth = maxX - minX;
    const currentHeight = maxY - minY;

    if (currentWidth < config.minInteractionSize) {
      const extraWidth = (config.minInteractionSize - currentWidth) / 2;
      minX -= extraWidth;
      maxX += extraWidth;
    }

    if (currentHeight < config.minInteractionSize) {
      const extraHeight = (config.minInteractionSize - currentHeight) / 2;
      minY -= extraHeight;
      maxY += extraHeight;
    }

    return { minX, minY, maxX, maxY };
  },

  // Create hover area for the flower
  createHoverArea: function(flowerElement, bounds) {
    const svg = flowerElement.tagName === 'svg' ? flowerElement : flowerElement.querySelector('svg');
    if (!svg) return;

    // Remove existing sectors and disable hover on petals
    const existingSectors = svg.querySelectorAll('.mg-sector');
    existingSectors.forEach(sector => sector.remove());

    // Disable pointer events on SVG elements
    svg.style.pointerEvents = 'none';
    const petals = svg.querySelectorAll('.mg-petal, path, g');
    petals.forEach(petal => {
      petal.style.pointerEvents = 'none';
    });

    // Create invisible hover area
    const hoverRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    hoverRect.setAttribute("x", bounds.minX);
    hoverRect.setAttribute("y", bounds.minY);
    hoverRect.setAttribute("width", bounds.maxX - bounds.minX);
    hoverRect.setAttribute("height", bounds.maxY - bounds.minY);
    hoverRect.setAttribute("fill", "rgba(0,0,0,0)");
    hoverRect.setAttribute("stroke", "none");
    hoverRect.setAttribute("pointer-events", "auto");
    hoverRect.classList.add("mg-sector");

    // Add flower ID for efficient event delegation
    const flowerId = flowerElement.getAttribute("data-id");
    if (flowerId) {
      hoverRect.setAttribute("data-flower-id", flowerId);
    }

    svg.insertBefore(hoverRect, svg.firstChild);
  },

  // Check if point is within flower bounds
  isPointInBounds: function(event, flower) {
    const svg = flower.element.tagName === 'svg' ? flower.element : flower.element.querySelector('svg');
    if (!svg) return false;

    try {
      const rect = svg.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return false;

      const screenCTM = svg.getScreenCTM();
      if (!screenCTM) return false;

      const pt = svg.createSVGPoint();
      pt.x = event.clientX;
      pt.y = event.clientY;
      const local = pt.matrixTransform(screenCTM.inverse());

      const x = local.x;
      const y = local.y;
      if (isNaN(x) || isNaN(y)) return false;

      return x >= flower.bounds.minX && x <= flower.bounds.maxX &&
             y >= flower.bounds.minY && y <= flower.bounds.maxY;
    } catch (error) {
      return false;
    }
  },

  // Find flower at position
  getFlowerAtPosition: function(e) {
    for (let flower of this.flowers) {
      if (this.isPointInBounds(e, flower)) {
        return flower;
      }
    }
    return null;
  },

  // Add global mouse handlers that check all flowers
  addGlobalMouseHandlers: function() {
    const container = document.getElementById('flower-container');
    if (!container) {
      console.log('No flower-container found!');
      return;
    }

    container.style.pointerEvents = 'auto';

    // Touch state
    let touchTimeout = null;
    let lastTouchTime = 0;
    let lastTouchedFlower = null;
    let isTouchDevice = false;
    let recentTouchEvent = false;
    
    // Detect touch device
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      isTouchDevice = true;
    }

    // Throttled mousemove
    let throttleTimeout = null;
    const onMouseMove = (e) => {
      if (throttleTimeout) return;
      throttleTimeout = setTimeout(() => {
        throttleTimeout = null;

        // Don't interact with flowers when modal is open
        if (this.isModalOpen()) {
          return;
        }

        const hoveredFlower = this.getFlowerAtPosition(e);

        if (hoveredFlower !== this.currentHoveredFlower) {
          // Exit previous
          if (this.currentHoveredFlower) {
            this.currentHoveredFlower.element.style.cursor = '';
            if (this.tooltip) {
              document.body.removeChild(this.tooltip);
              this.tooltip = null;
            }
            this.restoreOtherFlowers();
          }

          // Enter new
          if (hoveredFlower) {
            hoveredFlower.element.style.cursor = 'pointer';
            this.tooltip = this.createTooltip(hoveredFlower.data.text, e);
            document.body.appendChild(this.tooltip);
            this.fadeOtherFlowers(hoveredFlower.element);
          }

          this.currentHoveredFlower = hoveredFlower;
        } else if (hoveredFlower && this.tooltip) {
          this.updateTooltipPosition(this.tooltip, e);
        }
      }, this.CONFIG.THROTTLE_DELAY);
    };

    // Click handler (desktop only - mobile uses two-tap flow)
    const onClick = (e) => {
      // Skip click handler on touch devices - let touch handlers manage the flow
      if (isTouchDevice && recentTouchEvent) {
        recentTouchEvent = false;
        return;
      }
      
      if (e.target.matches('a, button, .btn-return-home, .btn-return-home-white')) {
        return;
      }

      // Don't interact with flowers when modal is open
      if (this.isModalOpen()) {
        return;
      }

      // Don't interact with flowers during navigation cooldown
      if (this.isNavigationCooldownActive()) {
        return;
      }

      // Don't interact with flowers right after modal close
      if (this.isModalCloseCooldownActive()) {
        return;
      }

      // Only use click handler on desktop (non-touch devices)
      if (isTouchDevice) {
        return;
      }

      const clickedFlower = this.getFlowerAtPosition(e);
      if (clickedFlower) {
        e.preventDefault();
        e.stopPropagation();
        if (window.Modal && typeof window.Modal.openById === 'function') {
          window.Modal.openById(clickedFlower.data.id);
        }
      }
    };

    // Touch handlers
    const onTouchStart = (e) => {
      // Mark that we just had a touch event to prevent click handler from firing
      recentTouchEvent = true;
      // Clear the flag after a short delay to allow subsequent mouse clicks
      setTimeout(() => {
        recentTouchEvent = false;
      }, 300);
      
      // Skip if touching navigation or interactive elements
      if (e.target.matches('a, button, .btn-return-home, .btn-return-home-white, .category-nav-arrow, .carousel-arrow, .carousel-dot, .dot')) {
        return;
      }

      // Don't interact with flowers when modal is open
      if (this.isModalOpen()) {
        return;
      }

      // Don't interact with flowers during navigation cooldown
      if (this.isNavigationCooldownActive()) {
        return;
      }

      // Don't interact with flowers right after modal close
      if (this.isModalCloseCooldownActive()) {
        return;
      }

      const touch = e.touches[0];
      if (!touch) return;
      
      const touchEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY,
        pageX: touch.pageX,
        pageY: touch.pageY
      };

      const touchedFlower = this.getFlowerAtPosition(touchEvent);
      const now = Date.now();


      if (touchedFlower) {
        // Second tap within window => open modal
        if (touchedFlower === lastTouchedFlower &&
            touchedFlower === this.currentHoveredFlower &&
            now - lastTouchTime < this.CONFIG.DOUBLE_TAP_WINDOW) {

          e.preventDefault();
          e.stopPropagation();
          
          // Prevent click event from firing after this touch
          recentTouchEvent = true;
          setTimeout(() => {
            recentTouchEvent = false;
          }, 300);

          if (touchTimeout) {
            clearTimeout(touchTimeout);
            touchTimeout = null;
          }

          if (window.Modal && typeof window.Modal.openById === 'function') {
            window.Modal.openById(touchedFlower.data.id);
          }

          // Clear hover state
          this.currentHoveredFlower.element.style.cursor = '';
          if (this.tooltip) {
            document.body.removeChild(this.tooltip);
            this.tooltip = null;
          }
          this.restoreOtherFlowers();
          this.currentHoveredFlower = null;
          lastTouchedFlower = null;

        } else {
          // First tap — show tooltip & fade others
          e.preventDefault();
          e.stopPropagation();
          
          // Prevent click event from firing after this touch
          recentTouchEvent = true;
          setTimeout(() => {
            recentTouchEvent = false;
          }, 300);
          
          if (touchTimeout) {
            clearTimeout(touchTimeout);
            touchTimeout = null;
          }

          if (this.currentHoveredFlower && this.currentHoveredFlower !== touchedFlower) {
            this.currentHoveredFlower.element.style.cursor = '';
            if (this.tooltip) {
              document.body.removeChild(this.tooltip);
              this.tooltip = null;
            }
            this.restoreOtherFlowers();
          }

          touchedFlower.element.style.cursor = 'pointer';
          if (this.tooltip) {
            document.body.removeChild(this.tooltip);
          }
          this.tooltip = this.createTooltip(touchedFlower.data.text, touchEvent);
          document.body.appendChild(this.tooltip);
          this.fadeOtherFlowers(touchedFlower.element);
          this.currentHoveredFlower = touchedFlower;

          // Hide after timeout
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
          }, this.CONFIG.TOUCH_TIMEOUT);

          lastTouchedFlower = touchedFlower;
          lastTouchTime = now;
        }
      } else {
        // Touch outside flower
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
      }
    };

    const onTouchEnd = (e) => {
      if (e.target.matches('a, button, .btn-return-home, .btn-return-home-white')) {
        return;
      }
      
      // Prevent click event from firing after touch on mobile
      // This ensures the two-tap flow works correctly
      if (this.currentHoveredFlower || lastTouchedFlower) {
        e.preventDefault();
        // Keep the flag set to prevent click handler
        recentTouchEvent = true;
        setTimeout(() => {
          recentTouchEvent = false;
        }, 300);
      }
    };

    const onTouchCancel = () => {
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
    };

    // Attach event listeners
    // Use capture phase for touch events to handle them before other handlers
    document.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('click', onClick, { passive: false });
    document.addEventListener('touchstart', onTouchStart, { passive: false, capture: true });
    document.addEventListener('touchend', onTouchEnd, { passive: false, capture: true });
    document.addEventListener('touchcancel', onTouchCancel, { passive: true, capture: true });
  },

  // Create tooltip element
  createTooltip: function(text, mouseEvent) {
    const tooltip = document.createElement('div');
    tooltip.className = 'flower-tooltip';
    tooltip.textContent = `"${text}"`;

    // Style tooltip
    tooltip.style.position = 'absolute';
    tooltip.style.zIndex = '9999';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.background = 'rgba(255, 255, 255, 0.6)';
    tooltip.style.backdropFilter = 'blur(20px)';
    tooltip.style.webkitBackdropFilter = 'blur(20px)';
    tooltip.style.willChange = 'backdrop-filter';
    tooltip.style.isolation = 'isolate';
    tooltip.style.border = '0.5px solid #F8F8FF';
    tooltip.style.borderRadius = '5px';
    tooltip.style.padding = '8px 16px';
    tooltip.style.fontFamily = '"Satoshi-Italic", system-ui';
    tooltip.style.fontSize = '12px';
    tooltip.style.fontWeight = '400';
    tooltip.style.fontStyle = 'italic';
    tooltip.style.color = 'var(--text-primary)';
    tooltip.style.userSelect = 'none';
    tooltip.style.width = '160px';
    tooltip.style.minWidth = '160px';
    tooltip.style.maxWidth = '160px';
    tooltip.style.whiteSpace = 'normal';
    tooltip.style.overflowWrap = 'break-word';
    tooltip.style.lineHeight = '1.3';
    
    // Hide initially to prevent font flash
    tooltip.style.opacity = '0';
    tooltip.style.transition = 'opacity 0.2s ease-out';

    this.updateTooltipPosition(tooltip, mouseEvent);
    
    // Wait for font to load before showing tooltip
    this.waitForTooltipFont(tooltip);
    
    return tooltip;
  },
  
  // Wait for tooltip font to load before showing
  waitForTooltipFont: async function(tooltip) {
    try {
      // Use Font Loading API if available
      if ('fonts' in document) {
        await document.fonts.load('italic 12px "Satoshi-Italic"').catch(() => {});
      } else {
        // Fallback: wait a short time for fonts to load
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (e) {
      // Ignore errors, still show tooltip
    }
    
    // Show tooltip after font is loaded
    tooltip.style.opacity = '1';
  },

  // Update tooltip position with smart viewport-aware positioning
  updateTooltipPosition: function(tooltip, mouseEvent) {
    const config = this.getDeviceConfig();
    const tooltipWidth = 160;
    const tooltipHeight = tooltip.offsetHeight || 60;

    // Get viewport dimensions and scroll position
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    // Convert page coordinates to viewport coordinates
    const clientX = mouseEvent.pageX - scrollX;
    const clientY = mouseEvent.pageY - scrollY;

    // Calculate preferred position
    let left = clientX + config.tooltipOffset;
    let top = clientY + config.tooltipOffset;

    // On mobile, prefer centering above the touch point
    if (config.isMobile) {
      left = clientX - (tooltipWidth / 2);
      top = clientY - tooltipHeight - config.tooltipOffset;
    }

    // Check horizontal bounds and adjust
    if (left + tooltipWidth > viewportWidth - config.edgeBuffer) {
      left = clientX - tooltipWidth - config.tooltipOffset;
      if (left < config.edgeBuffer) {
        left = config.edgeBuffer;
      }
    } else if (left < config.edgeBuffer) {
      left = clientX + config.tooltipOffset;
      if (left + tooltipWidth > viewportWidth - config.edgeBuffer) {
        left = viewportWidth - tooltipWidth - config.edgeBuffer;
      }
    }

    // Check vertical bounds and adjust
    if (top + tooltipHeight > viewportHeight - config.edgeBuffer) {
      top = clientY - tooltipHeight - config.tooltipOffset;
    }

    if (top < config.edgeBuffer) {
      top = clientY + config.tooltipOffset;
      if (top + tooltipHeight > viewportHeight - config.edgeBuffer) {
        top = viewportHeight - tooltipHeight - config.edgeBuffer;
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
        flower.style.filter = 'brightness(1.5) contrast(0.7)';
        flower.style.opacity = '0.4';
        flower.style.transition = 'all 0.3s ease';
      }
    });

    // Also fade labels and buttons to background (opacity only, no filter effects)
    const labelsAndButtons = document.querySelectorAll('.category-title, .header-link, .header-label, .btn-return-home, .btn-return-home-white, #shuffle-btn, .carousel-arrow, .mobile-category-item, .category-label, .mobile-header-toggle, .mobile-header-menu, .category-overlay .category-name, .category-title-section, .category-nav-arrow, .category-nav-dots, .category-nav-dot, .category-overlay .btn-return-home');
    labelsAndButtons.forEach(element => {
      element.style.opacity = '0.3';
      element.style.transition = 'all 0.3s ease';
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

    // Also restore labels and buttons to normal state
    const labelsAndButtons = document.querySelectorAll('.category-title, .header-link, .header-label, .btn-return-home, .btn-return-home-white, #shuffle-btn, .carousel-arrow, .mobile-category-item, .category-label, .mobile-header-toggle, .mobile-header-menu, .category-overlay .category-name, .category-title-section, .category-nav-arrow, .category-nav-dots, .category-nav-dot, .category-overlay .btn-return-home');
    labelsAndButtons.forEach(element => {
      element.style.opacity = '';
      element.style.transition = 'all 0.3s ease';
    });
  }
};

// Make FlowerInteractions available globally
window.FlowerInteractions = FlowerInteractions;