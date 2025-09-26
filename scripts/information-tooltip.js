/**
 * Information Tooltip - ES Module
 * Framework-agnostic responsive tooltip component
 */

export class InformationTooltip {
  static globalInstance = null;

  constructor(options = {}) {
    this.options = {
      triggerSelector: '.info-tip-trigger',
      mobileWidthEl: '.modal__lower-right',
      offset: 10,
      breakpoint: 1160,
      mobileTimeout: 1000, // 1 second auto-close on mobile
      ...options
    };

    this.activeTooltip = null;
    this.activeTrigger = null;
    this.triggers = new Set();
    this.mobileWidth = null;
    this.autoCloseTimer = null;
    this.isTouchInteraction = false;

    // Bind methods
    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.handleFocusIn = this.handleFocusIn.bind(this);
    this.handleFocusOut = this.handleFocusOut.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
    this.handleOutsideClick = this.handleOutsideClick.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.handleScroll = this.handleScroll.bind(this);

    this.resizeObserver = null;
    this.scrollElements = new Set();
  }

  static init(options = {}) {
    const instance = new InformationTooltip(options);
    instance.initialize();
    return instance;
  }

  static autoFromData() {
    const triggers = document.querySelectorAll('[data-info-tip]');

    triggers.forEach(trigger => {
      const content = trigger.getAttribute('data-info-tip');
      if (!content) return;

      // Create tooltip element
      const tooltipId = `tooltip-${Math.random().toString(36).substr(2, 9)}`;
      const tooltip = document.createElement('div');
      tooltip.id = tooltipId;
      tooltip.className = 'information-tooltip';
      tooltip.setAttribute('role', 'tooltip');
      tooltip.innerHTML = `
        ${content}
        <span class="information-tooltip__arrow" aria-hidden="true"></span>
      `;

      // Portal: append to the modal overlay so transforms on the modal don't affect us
      (document.getElementById('mg-modal-overlay') || document.body).appendChild(tooltip);

      // Set aria relationship
      trigger.setAttribute('aria-describedby', tooltipId);

      // Remove data attribute to prevent double-processing
      trigger.removeAttribute('data-info-tip');
    });
  }

  /**
   * Simple API: Attach a tooltip to any element
   * Usage: InformationTooltip.attach(button, "Tooltip content")
   */
  static attach(triggerElement, content) {
    // Auto-initialize global instance if needed
    if (!this.globalInstance) {
      this.globalInstance = new InformationTooltip();
      this.globalInstance.initialize();
    }

    // Create tooltip element
    const tooltipId = `tooltip-${Math.random().toString(36).substr(2, 9)}`;
    const tooltip = document.createElement('div');
    tooltip.id = tooltipId;
    tooltip.className = 'information-tooltip';
    tooltip.setAttribute('role', 'tooltip');
    tooltip.innerHTML = `
      ${content}
      <span class="information-tooltip__arrow" aria-hidden="true"></span>
    `;

    // Portal: append to the modal overlay (or body fallback)
    (document.getElementById('mg-modal-overlay') || document.body).appendChild(tooltip);

    // Set aria relationship
    triggerElement.setAttribute('aria-describedby', tooltipId);

    // Add trigger class if not present
    if (!triggerElement.classList.contains('info-tip-trigger')) {
      triggerElement.classList.add('info-tip-trigger');
    }

    // Bind events to this single trigger
    this.globalInstance.bindSingleTrigger(triggerElement);

    return { trigger: triggerElement, tooltip, tooltipId };
  }

  initialize() {
    this.calculateMobileWidth();
    this.bindTriggers();
    this.setupEventListeners();
    this.setupResizeObserver();
  }

  calculateMobileWidth() {
    if (this.options.mobileWidthEl === null) {
      // Explicitly set to null - let CSS handle width
      this.mobileWidth = null;
      return;
    }

    if (this.options.mobileWidthEl) {
      try {
        const el = document.querySelector(this.options.mobileWidthEl);
        if (el) {
          this.mobileWidth = el.getBoundingClientRect().width;
          return;
        }
      } catch (e) {
        // Invalid selector, fall back
      }
    }

    // Fallback: max(240px, min(90vw, 360px))
    const vw90 = window.innerWidth * 0.9;
    this.mobileWidth = Math.max(240, Math.min(vw90, 360));
  }

  bindTriggers() {
    const triggers = document.querySelectorAll(this.options.triggerSelector);

    triggers.forEach(trigger => {
      if (this.triggers.has(trigger)) return;

      trigger.addEventListener('mouseenter', this.handleMouseEnter);
      trigger.addEventListener('mouseleave', this.handleMouseLeave);
      trigger.addEventListener('focusin', this.handleFocusIn);
      trigger.addEventListener('focusout', this.handleFocusOut);
      trigger.addEventListener('touchstart', this.handleTouchStart, { passive: false });

      this.triggers.add(trigger);
    });
  }

  /**
   * Bind events to a single trigger element
   */
  bindSingleTrigger(trigger) {
    if (this.triggers.has(trigger)) {
      return; // Already bound
    }

    trigger.addEventListener('mouseenter', this.handleMouseEnter);
    trigger.addEventListener('mouseleave', this.handleMouseLeave);
    trigger.addEventListener('focusin', this.handleFocusIn);
    trigger.addEventListener('focusout', this.handleFocusOut);
    trigger.addEventListener('touchstart', this.handleTouchStart, { passive: false });

    this.triggers.add(trigger);
  }

  setupEventListeners() {
    document.addEventListener('keydown', this.handleKeydown);
    document.addEventListener('click', this.handleOutsideClick);
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('wheel', this.handleScroll, { passive: true });
    window.addEventListener('touchmove', this.handleScroll, { passive: true });
  }

  setupResizeObserver() {
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        if (this.activeTooltip) {
          this.positionTooltip(this.activeTooltip, this.activeTrigger);
        }
      });
    }
  }

  setupScrollListeners(tooltip) {
    // Remove existing scroll listeners
    this.removeScrollListeners();

    // Add scroll listeners to all scrollable ancestors
    let element = tooltip.parentElement;
    while (element && element !== document.body) {
      const computedStyle = window.getComputedStyle(element);
      const overflow = computedStyle.overflow + computedStyle.overflowX + computedStyle.overflowY;

      if (overflow.includes('auto') || overflow.includes('scroll')) {
        element.addEventListener('scroll', this.handleScroll, true);
        this.scrollElements.add(element);
      }
      element = element.parentElement;
    }

    // Also listen to window scroll
    window.addEventListener('scroll', this.handleScroll, true);
    this.scrollElements.add(window);
  }

  removeScrollListeners() {
    this.scrollElements.forEach(element => {
      element.removeEventListener('scroll', this.handleScroll, true);
    });
    this.scrollElements.clear();
  }

  handleMouseEnter(e) {
    // Skip mouse events if we just had a touch interaction
    if (this.isTouchInteraction) return;

    const trigger = e.currentTarget;
    this.showTooltip(trigger);
  }

  handleMouseLeave(e) {
    // Skip mouse events if we just had a touch interaction
    if (this.isTouchInteraction) return;

    const trigger = e.currentTarget;
    const tooltip = this.getTooltipForTrigger(trigger);

    if (tooltip) {
      // Small delay to allow mouse to move to tooltip
      setTimeout(() => {
        if (!tooltip.matches(':hover') && !trigger.matches(':hover')) {
          this.hideTooltip();
        }
      }, 50);
    }
  }

  handleFocusIn(e) {
    const trigger = e.currentTarget;
    this.showTooltip(trigger);
  }

  handleFocusOut(e) {
    const trigger = e.currentTarget;
    const tooltip = this.getTooltipForTrigger(trigger);

    // Check if focus moved to tooltip or its descendants
    setTimeout(() => {
      if (tooltip && !tooltip.contains(document.activeElement) &&
          document.activeElement !== trigger) {
        this.hideTooltip();
      }
    }, 10);
  }

  handleTouchStart(e) {
    // Set touch interaction flag to prevent mouse events
    this.isTouchInteraction = true;
    setTimeout(() => { this.isTouchInteraction = false; }, 300);

    // Prevent mouse events from also firing
    e.preventDefault();

    const trigger = e.currentTarget;
    const isMobile = window.innerWidth < this.options.breakpoint;

    if (isMobile) {
      // Show tooltip with auto-close timer on mobile
      this.showTooltip(trigger, true);
    } else {
      // Use regular behavior on desktop
      this.showTooltip(trigger);
    }
  }

  handleKeydown(e) {
    if (e.key === 'Escape' && this.activeTooltip) {
      this.hideTooltip();
      if (this.activeTrigger) {
        this.activeTrigger.focus();
      }
    }
  }

  handleOutsideClick(e) {
    if (this.activeTooltip &&
        !this.activeTooltip.contains(e.target) &&
        !this.activeTrigger?.contains(e.target)) {
      this.hideTooltip();
    }
  }

  handleResize() {
    this.calculateMobileWidth();

    // Rebind triggers in case DOM changed
    this.bindTriggers();

    if (this.activeTooltip && this.activeTrigger) {
      this.positionTooltip(this.activeTooltip, this.activeTrigger);
    }
  }

  handleScroll() {
    // First, reposition the tooltip to follow the icon
    if (this.activeTooltip && this.activeTrigger) {
      this.positionTooltip(this.activeTooltip, this.activeTrigger);
    }

    // Then check if we should close it due to lost hover
    if (this.activeTrigger && !this.activeTrigger.matches(':hover')) {
      this.hideTooltip();
      return;
    }
  }

  getTooltipForTrigger(trigger) {
    const tooltipId = trigger.getAttribute('aria-describedby');
    return tooltipId ? document.getElementById(tooltipId) : null;
  }

  showTooltip(trigger, withAutoClose = false) {
    if (!trigger) return;

    const tooltip = this.getTooltipForTrigger(trigger);
    if (!tooltip) return;

    // Hide any existing tooltip
    this.hideTooltip();

    this.activeTooltip = tooltip;
    this.activeTrigger = trigger;

    // Add to resize observer
    if (this.resizeObserver) {
      this.resizeObserver.observe(tooltip);
    }

    // Setup scroll listeners
    this.setupScrollListeners(tooltip);

    // Show tooltip
    tooltip.classList.add('information-tooltip--open');
    this.positionTooltip(tooltip, trigger);

    // Set auto-close timer for mobile if requested
    if (withAutoClose && this.options.mobileTimeout > 0) {
      this.autoCloseTimer = setTimeout(() => {
        this.hideTooltip();
      }, this.options.mobileTimeout);
    }
  }

  hideTooltip() {
    // Clear any active auto-close timer
    if (this.autoCloseTimer) {
      clearTimeout(this.autoCloseTimer);
      this.autoCloseTimer = null;
    }

    if (this.activeTooltip) {
      this.activeTooltip.classList.remove('information-tooltip--open');

      // Remove from resize observer
      if (this.resizeObserver) {
        this.resizeObserver.unobserve(this.activeTooltip);
      }

      // Remove scroll listeners
      this.removeScrollListeners();

      this.activeTooltip = null;
      this.activeTrigger = null;
    }
  }

  positionTooltip(tooltip, trigger) {
    const isMobile = window.innerWidth < this.options.breakpoint;
    const triggerRect = trigger.getBoundingClientRect();

    // Set placement data attribute
    const placement = isMobile ? 'top' : 'right';
    tooltip.setAttribute('data-placement', placement);

    // Reset width and let CSS handle max-width constraints
    tooltip.style.width = '';
    tooltip.style.maxWidth = '';

    // Only apply specific mobile width if mobileWidthEl is configured
    if (isMobile && this.mobileWidth) {
      tooltip.style.width = `${this.mobileWidth}px`;
      tooltip.style.maxWidth = 'none';
    }

    // Get tooltip dimensions after width is set
    const tooltipRect = tooltip.getBoundingClientRect();

    let left, top;

    if (isMobile) {
      // Where is the center of the trigger (icon) in the viewport?
      const triggerCenterX = triggerRect.left + (triggerRect.width / 2);

      // Read arrow size (in px) from CSS variable; fallback to 8
      const styles = getComputedStyle(document.documentElement);
      const arrowSize = parseFloat(styles.getPropertyValue('--info-tip-arrow-size')) || 8;

      // Our arrow is bottom-right, inset 8px from the right,
      // and its "tip" sits arrowSize/2 outside the box.
      const arrowInsetRight = 8; // keep in sync with CSS

      // X position (inside the tooltip) where the arrow sits
      const anchorXInsideTooltip = tooltipRect.width - arrowInsetRight - (arrowSize / 2);

      // Place tooltip so that this anchor point lines up with the icon center
      left = triggerCenterX - anchorXInsideTooltip;

      // Y position: box above the icon with your configured offset
      top = triggerRect.top - tooltipRect.height - this.options.offset;
    } else {
      // Position to the right, vertically centered (viewport coordinates)
      left = triggerRect.right + this.options.offset;
      top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2);
    }

    // No need to add scroll offsets since we're using position: fixed

    // Clamp inside viewport with 8px padding
    const padding = 8;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Horizontal clamping
    if (left < padding) {
      left = padding;
    } else if (left + tooltipRect.width > viewportWidth - padding) {
      left = viewportWidth - tooltipRect.width - padding;
    }

    // Vertical clamping
    if (top < padding) {
      top = padding;
    } else if (top + tooltipRect.height > viewportHeight - padding) {
      top = viewportHeight - tooltipRect.height - padding;
    }

    // Apply position
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }

  destroy() {
    // Remove event listeners
    this.triggers.forEach(trigger => {
      trigger.removeEventListener('mouseenter', this.handleMouseEnter);
      trigger.removeEventListener('mouseleave', this.handleMouseLeave);
      trigger.removeEventListener('focusin', this.handleFocusIn);
      trigger.removeEventListener('focusout', this.handleFocusOut);
      trigger.removeEventListener('touchstart', this.handleTouchStart);
    });

    document.removeEventListener('keydown', this.handleKeydown);
    document.removeEventListener('click', this.handleOutsideClick);
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('wheel', this.handleScroll);
    window.removeEventListener('touchmove', this.handleScroll);

    this.removeScrollListeners();

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    this.hideTooltip();
    this.triggers.clear();
  }
}

// Export both named and default
export default InformationTooltip;