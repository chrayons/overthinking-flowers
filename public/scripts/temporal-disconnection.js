// temporal-disconnection.js
// Displays flowers for the "Temporal Disconnection" category with fixed positioning

console.log("Temporal Disconnection page loading...");

// Fixed flower positions - captured from working layout
const FLOWER_POSITIONS = {
  desktop: {
    'ID1': { x: 18, y: 69 },   // World is moving but I'm not moving along with it
    'ID31': { x: 72, y: 42 },  // Trains, cars, moving objects moving past me in a blur
    'ID60': { x: 28, y: 16 },  // Wouldn't say I'm much of an overthinker, rather I feel like a rusty tap...
    'ID73': { x: 82, y: 45 }   // Moments of particular events that happened in the past
  },
  mobile: {
    'ID1': { x: 18, y: 64 },   // World is moving but I'm not moving along with it
    'ID31': { x: 70, y: 35 },  // Trains, cars, moving objects moving past me in a blur
    'ID60': { x: 28, y: 26 },  // Wouldn't say I'm much of an overthinker, rather I feel like a rusty tap...
    'ID73': { x: 78, y: 70 }   // Moments of particular events that happened in the past
  }
};

// Simple layout storage - one layout for all devices
const TD_LAYOUT_KEY = 'td-simple-layout-v4';

// Mobile detection and performance optimization
function isMobileDevice() {
  return window.innerWidth <= 1160 ||
         /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function getOptimalStaggerDelay() {
  return isMobileDevice() ? 25 : 50; // Faster stagger on mobile for better perceived performance
}
// Set to true to ignore cache and always use fresh positions (for experimentation)
const IGNORE_CACHE = false;

function saveLayout(placed, isMobile) {
  try {
    const deviceKey = isMobile ? TD_LAYOUT_KEY + '-mobile' : TD_LAYOUT_KEY + '-desktop';
    sessionStorage.setItem(deviceKey, JSON.stringify(placed));
  } catch {}
}

function restoreLayout(isMobile) {
  try {
    const deviceKey = isMobile ? TD_LAYOUT_KEY + '-mobile' : TD_LAYOUT_KEY + '-desktop';
    return JSON.parse(sessionStorage.getItem(deviceKey) || 'null');
  } catch {
    return null;
  }
}

// FLIP guard utility to prevent CSS transition conflicts
async function withFlipGuard(run) {
  const page = document.querySelector('.category-page');
  page?.classList.add('is-flipping');
  try {
    await run();
  } finally {
    page?.classList.remove('is-flipping');
  }
}

// Normalize flower graphics to scale with wrapper
function normalizeFlowerGraphic(el) {
  const inner = el.querySelector('.flower-inner');
  if (!inner) return;

  const svg = inner.querySelector('svg');
  if (!svg) return;

  // If the SVG lacks a viewBox, infer it from existing width/height before removing them
  if (!svg.hasAttribute('viewBox')) {
    const w = svg.getAttribute('width');
    const h = svg.getAttribute('height');
    const bw = parseFloat(w) || svg.viewBox?.baseVal?.width || svg.getBoundingClientRect().width || 300;
    const bh = parseFloat(h) || svg.viewBox?.baseVal?.height || svg.getBoundingClientRect().height || 150;
    svg.setAttribute('viewBox', `0 0 ${bw} ${bh}`);
  }

  // Remove hardcoded pixel attributes that fight CSS scaling
  svg.removeAttribute('width');
  svg.removeAttribute('height');

  // Ensure SVG scales properly within its container
  if (!svg.getAttribute('preserveAspectRatio')) {
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  }
}

// Progressive dissolve animation helper
function triggerDissolveAnimation(flowerElement, delay = 0) {
  requestAnimationFrame(() => {
    setTimeout(() => {
      flowerElement.classList.add('flower-dissolve-in');
    }, delay);
  });
}

// Hardened FLIP utilities for clean measurements and asset settling
const nextFrame = () => new Promise(r => requestAnimationFrame(() => r()));

async function settleLayout(el) {
  // Wait for fonts that affect flower sizing
  if (document.fonts?.ready) await document.fonts.ready;

  // Decode any images that might affect layout
  const imgs = el?.querySelectorAll?.('img') || [];
  await Promise.all([...imgs].map(img => (img.decode?.() ?? Promise.resolve()).catch(() => {})));

  // Double-RAF to let style & layout fully commit
  await nextFrame();
  await nextFrame();
}

// Measure layout box without any transforms currently applied
function measurePureBox(el) {
  const prevTransition = el.style.transition;
  const prevTransform = el.style.transform;
  el.style.transition = 'none';
  el.style.transform = 'none';
  const rect = el.getBoundingClientRect();
  el.style.transform = prevTransform;
  el.style.transition = prevTransition;
  return rect;
}

// Hardened FLIP with scale compensation and clean measurements
async function flipWithScale(el, flowerData, {
  duration = 420,
  easing = 'cubic-bezier(.22, .61, .36, 1)'
} = {}) {
  if (!el) return;

  // Kill any in-flight animations
  el.getAnimations?.().forEach(a => a.cancel());

  // FIRST - measure pure layout box without transform pollution
  const first = measurePureBox(el);

  // Apply new layout without transitions
  const isMobile = window.innerWidth <= 1160;
  const positions = isMobile ? FLOWER_POSITIONS.mobile : FLOWER_POSITIONS.desktop;
  let position = positions[flowerData.id];

  if (!position) {
    console.warn(`No position found for flower ${flowerData.id}, using fallback`);
    position = { x: 50, y: 50 };
  }

  // Calculate new size using same logic as createTemporalDisconnectionLayout
  const intensity = (flowerData.emotionalIntensity || 35) / 100;
  const tSize = Math.max(0.35, Math.min(1, intensity));
  const baseMin = 100;
  const baseMax = 300;
  let flowerSize = Math.round(baseMin + (baseMax - baseMin) * tSize);

  if (!isMobile) {
    const scaleFactor = Math.min(2.0, window.innerWidth / 720);
    flowerSize = Math.round(flowerSize * scaleFactor);
  }

  // Apply final position and size
  el.style.transition = 'none';
  el.style.left = `${position.x}%`;
  el.style.top = `${position.y}%`;
  el.style.width = `${flowerSize}px`;
  el.style.height = `${flowerSize}px`;

  // Normalize inner SVG to scale with wrapper
  normalizeFlowerGraphic(el);

  // Let layout and assets settle completely
  await settleLayout(el);

  // LAST - measure settled layout
  const last = measurePureBox(el);

  // Calculate INVERT deltas
  const dx = first.left - last.left;
  const dy = first.top - last.top;
  const sx = first.width / (last.width || 1);
  const sy = first.height / (last.height || 1);

  // Only animate if there's meaningful change
  if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1 || Math.abs(sx - 1) > 0.01 || Math.abs(sy - 1) > 0.01) {
    // Set inverted state instantly
    el.style.willChange = 'transform';
    el.style.transformOrigin = 'top left';
    el.style.transition = 'none';
    el.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;

    await nextFrame(); // ensure inverted state paints

    // PLAY to identity with correct translate-then-scale order
    const anim = el.animate([
      {
        transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`,
        transformOrigin: 'top left'
      },
      {
        transform: 'translate(0, 0) scale(1, 1)',
        transformOrigin: 'top left'
      }
    ], {
      duration,
      easing,
      fill: 'forwards'
    });

    anim.addEventListener?.('finish', () => {
      el.style.transform = '';
      el.style.willChange = '';
      el.style.transition = ''; // restore CSS transitions
    });
  }
}

async function flipFlowers(flowers) {
  const container = document.getElementById('flower-container');
  if (!container) return;

  const categoryFlowers = flowers.filter(f => f.category === "Temporal Disconnection");
  const byId = new Map(categoryFlowers.map(f => [f.id, f]));
  const existingFlowers = container.querySelectorAll('.flower');

  const flipPromises = Array.from(existingFlowers).map(async (el) => {
    const id = el.getAttribute('data-id');
    const data = byId.get(id);
    if (!data) return;
    await flipWithScale(el, data);
  });

  await Promise.all(flipPromises);
}

// Simple, universal layout calculation
async function createTemporalDisconnectionLayout(flowers, isResize = false) {
  const container = document.getElementById('flower-container');
  if (!container) return;

  const categoryFlowers = flowers.filter(f => f.category === "Temporal Disconnection");

  // Skip clearing and recreation if this is a resize operation
  if (isResize) {
    await withFlipGuard(() => flipFlowers(flowers));
    return;
  }

  container.innerHTML = '';

  // Clear flower interactions to prevent stale positioning
  if (window.FlowerInteractions) {
    console.log('Clearing flower interactions before layout');
    window.FlowerInteractions.clearAll();
  }

  // Determine device type FIRST before any cache operations
  const isMobile = window.innerWidth <= 1160;

  // Check for existing layout first (unless experimenting)
  const restored = IGNORE_CACHE ? null : restoreLayout(isMobile);
  if (restored && restored.length === categoryFlowers.length) {
    // Use existing layout
    restored.forEach((layoutData, index) => {
      if (index >= categoryFlowers.length) return;

      const flowerData = categoryFlowers[index];
      const { xPct, yPct, size } = layoutData;

      // Create flower with wrapper/inner pattern
      const inner = FlowerRenderer.createFlower(flowerData, {
        width: size,
        height: size,
        maxRadius: size * 0.45
      });

      // Outer wrapper for FLIP animations (no centering transform)
      const el = document.createElement('div');
      el.classList.add('flower');
      el.setAttribute('data-id', flowerData.id);
      el.style.position = 'absolute';
      el.style.left = `${xPct}%`;
      el.style.top = `${yPct}%`;
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;

      // Inner element with centering transform (CSS handles this)
      inner.classList.add('flower-inner');
      inner.style.width = '100%';
      inner.style.height = '100%';

      el.appendChild(inner);

      // Add interactions
      if (window.FlowerInteractions) {
        FlowerInteractions.addBehavior(el, flowerData);
      }

      container.appendChild(el);
      triggerDissolveAnimation(el, index * getOptimalStaggerDelay()); // Optimized stagger timing
    });
    return;
  }

  // Fixed positioning - no complex calculations needed
  const placedFlowers = [];
  const resultsForPersist = [];

  // Use device state determined earlier and select positions
  const positions = isMobile ? FLOWER_POSITIONS.mobile : FLOWER_POSITIONS.desktop;

  categoryFlowers.forEach((flowerData, index) => {
    // Simple fixed positioning - no complex algorithms
    let position = positions[flowerData.id];

    // Fallback position if flower ID not found
    if (!position) {
      console.warn(`No position found for flower ${flowerData.id}, using fallback`);
      position = { x: 50, y: 50 }; // Center as fallback
    }

    // Use pre-calculated emotional intensity from data
    const intensity = (flowerData.emotionalIntensity || 35) / 100;
    const tSize = Math.max(0.35, Math.min(1, intensity));

    // Size calculation - mobile first approach
    const baseMin = 100;
    const baseMax = 300;
    let flowerSize = Math.round(baseMin + (baseMax - baseMin) * tSize);

    if (!isMobile) {
      // Desktop: scale up for large screens
      const scaleFactor = Math.min(2.0, window.innerWidth / 720);
      flowerSize = Math.round(flowerSize * scaleFactor);
    }

    // Use fixed position
    const xPct = position.x;
    const yPct = position.y;

    // Create flower with wrapper/inner pattern
    const inner = FlowerRenderer.createFlower(flowerData, {
      width: flowerSize,
      height: flowerSize,
      maxRadius: flowerSize * 0.45
    });

    // Outer wrapper for FLIP animations (no centering transform)
    const el = document.createElement('div');
    el.classList.add('flower');
    el.setAttribute('data-id', flowerData.id);
    el.style.position = 'absolute';
    el.style.left = `${xPct}%`;
    el.style.top = `${yPct}%`;
    el.style.width = `${flowerSize}px`;
    el.style.height = `${flowerSize}px`;

    // Inner element with centering transform (CSS handles this)
    inner.classList.add('flower-inner');
    inner.style.width = '100%';
    inner.style.height = '100%';

    el.appendChild(inner);

    // Store data for persistence
    placedFlowers.push({ xPct, yPct, size: flowerSize });
    resultsForPersist.push({ xPct, yPct, size: flowerSize });

    // Add interactions
    if (window.FlowerInteractions) {
      FlowerInteractions.addBehavior(el, flowerData);
    }

    container.appendChild(el);
    triggerDissolveAnimation(el, index * getOptimalStaggerDelay()); // Optimized stagger timing
  });

  // Save layout for future use with device type
  saveLayout(resultsForPersist, isMobile);
}

// Load data and initialize page
fetch('metaphordata/data.json')
  .then(r => r.json())
  .then(rawData => {
    const flowers = parseFlowerData(rawData);

    // Initialize modal system FIRST (if present)
    if (window.Modal) {
      Modal.init(flowers);
    } else {
      console.warn('Modal not available during initialization');
    }

    // Ensure layout runs after page is fully rendered and settled
    const initializeLayout = () => {
      createTemporalDisconnectionLayout(flowers);
    };

    // Use requestAnimationFrame to ensure DOM is fully rendered
    requestAnimationFrame(() => {
      setTimeout(initializeLayout, 100);
    });

    // Use media query for breakpoint changes instead of resize events
    const mediaQuery = window.matchMedia('(min-width: 1161px)');
    let lastIsDesktop = mediaQuery.matches;

    const handleBreakpointChange = async () => {
      const currentIsDesktop = mediaQuery.matches;

      if (currentIsDesktop !== lastIsDesktop) {
        console.log('Breakpoint crossed, animating flower transitions:', window.innerWidth);

        // Clear cache and trigger hardened FLIP animation
        sessionStorage.removeItem(TD_LAYOUT_KEY + '-desktop');
        sessionStorage.removeItem(TD_LAYOUT_KEY + '-mobile');
        await createTemporalDisconnectionLayout(flowers, true); // isResize = true

        lastIsDesktop = currentIsDesktop;
      }
    };

    mediaQuery.addEventListener('change', handleBreakpointChange);

    // Fallback resize handler for edge cases (debounced)
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(async () => {
        const currentIsDesktop = window.innerWidth > 1160;
        if (currentIsDesktop !== lastIsDesktop) {
          await handleBreakpointChange();
        }
      }, 150);
    });
  })
  .catch(err => console.error("Error loading data for Temporal Disconnection:", err));