// loss-of-agency.js
// Displays flowers for the "Loss of Agency" category with fixed positioning

console.log("Loss of Agency page loading...");

// Fixed flower positions - captured from working layout
const FLOWER_POSITIONS = {
  desktop: {
    'ID7': { x: 77, y: 47 },  // sunshine and rainbows then sud...
    'ID16': { x: 35, y: 70 }, // Having a lovely married life w...
    'ID21': { x: 81, y: 29 }, // I cannaur...
    'ID25': { x: 64, y: 17 }, // a whirlpool...
    'ID33': { x: 33, y: 35 }, // walls closing in...
    'ID35': { x: 76, y: 87 }, // Starts out like a sauna. And t...
    'ID38': { x: 15, y: 37 }, // Drowning...
    'ID53': { x: 90, y: 75 }, // That one pic of the cartoon do...
    'ID67': { x: 6, y: 58 },  // the last bowling pin wobbling ...
    'ID71': { x: 18, y: 10 }  // Being completely submerged in ...
  },
  mobile: {
    'ID7': { x: 90, y: 35 },  // sunshine and rainbows then sud...
    'ID16': { x: 25, y: 58 }, // Having a lovely married life w...
    'ID21': { x: 70, y: 19 }, // I cannaur...
    'ID25': { x: 59, y: 20 }, // a whirlpool...
    'ID33': { x: 33, y: 25 }, // walls closing in...
    'ID35': { x: 75, y: 58 }, // Starts out like a sauna. And t...
    'ID38': { x: 10, y: 27 }, // Drowning...
    'ID53': { x: 55, y: 65 }, // That one pic of the cartoon do...
    'ID67': { x: 16, y: 40 },  // the last bowling pin wobbling ...
    'ID71': { x: 48, y: 10 }  // Being completely submerged in ...
  }
};

// Simple layout storage - one layout for all devices
const LOA_LAYOUT_KEY = 'loa-simple-layout-v18';

// Set to true to ignore cache and always use fresh positions (for experimentation)
const IGNORE_CACHE = false;

// Mobile detection and performance optimization
function isMobileDevice() {
  return window.innerWidth <= 1160 ||
         /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function getOptimalStaggerDelay() {
  return isMobileDevice() ? 25 : 30; // Smoother, faster stagger for desktop
}

function saveLayout(placed, isMobile) {
  try {
    const deviceKey = isMobile ? LOA_LAYOUT_KEY + '-mobile' : LOA_LAYOUT_KEY + '-desktop';
    sessionStorage.setItem(deviceKey, JSON.stringify(placed));
  } catch {}
}

function restoreLayout(isMobile) {
  try {
    const deviceKey = isMobile ? LOA_LAYOUT_KEY + '-mobile' : LOA_LAYOUT_KEY + '-desktop';
    return JSON.parse(sessionStorage.getItem(deviceKey) || 'null');
  } catch {
    return null;
  }
}

// Hardened FLIP utilities
const nextFrame = () => new Promise(r => requestAnimationFrame(() => r()));

// Progressive dissolve animation helper
function triggerDissolveAnimation(flowerElement, delay = 0) {
  // Use requestAnimationFrame to ensure DOM is ready
  requestAnimationFrame(() => {
    setTimeout(() => {
      flowerElement.classList.add('flower-dissolve-in');
    }, delay);
  });
}

async function settleLayout(el) {
  if (document.fonts?.ready) await document.fonts.ready;
  const imgs = el?.querySelectorAll?.('img') || [];
  await Promise.all([...imgs].map(img => (img.decode?.() ?? Promise.resolve()).catch(() => {})));
  await nextFrame();
  await nextFrame();
}

function measurePureBox(el) {
  const prevTransition = el.style.transition, prevTransform = el.style.transform;
  el.style.transition = 'none';
  el.style.transform = 'none';
  const rect = el.getBoundingClientRect();
  el.style.transform = prevTransform;
  el.style.transition = prevTransition;
  return rect;
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
async function flipWithScale(el, flowerData, { duration = 420, easing = 'cubic-bezier(.22, .61, .36, 1)' } = {}) { if (!el) return; el.getAnimations?.().forEach(a => a.cancel()); const first = measurePureBox(el); const isMobile = window.innerWidth <= 1160; const positions = isMobile ? FLOWER_POSITIONS.mobile : FLOWER_POSITIONS.desktop; let position = positions[flowerData.id] || { x: 50, y: 50 }; const intensity = (flowerData.emotionalIntensity || 35) / 100; const tSize = Math.max(0.35, Math.min(1, intensity)); let flowerSize = Math.round(100 + (300 - 100) * tSize); if (!isMobile) flowerSize = Math.round(flowerSize * Math.min(2.0, window.innerWidth / 720)); el.style.transition = 'none'; el.style.left = `${position.x}%`; el.style.top = `${position.y}%`; el.style.width = `${flowerSize}px`; el.style.height = `${flowerSize}px`; normalizeFlowerGraphic(el); await settleLayout(el); const last = measurePureBox(el); const dx = first.left - last.left, dy = first.top - last.top; const sx = first.width / (last.width || 1), sy = first.height / (last.height || 1); if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1 || Math.abs(sx - 1) > 0.01 || Math.abs(sy - 1) > 0.01) { el.style.willChange = 'transform'; el.style.transformOrigin = 'top left'; el.style.transition = 'none'; el.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`; await nextFrame(); const anim = el.animate([{ transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`, transformOrigin: 'top left' }, { transform: 'translate(0, 0) scale(1, 1)', transformOrigin: 'top left' }], { duration, easing, fill: 'forwards' }); anim.addEventListener?.('finish', () => { el.style.transform = ''; el.style.willChange = ''; el.style.transition = ''; }); } }

// Hardened FLIP animation with scale compensation for smooth responsive transitions
async function flipFlowers(flowers) {
  const container = document.getElementById('flower-container');
  if (!container) return;

  const categoryFlowers = flowers.filter(f => f.category === "Loss of Agency");
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

// Fixed positioning system - no helper functions needed

// Simple layout - no scaling, just percentages

// Simple, universal layout calculation
async function createLossOfAgencyLayout(flowers, isResize = false) {
  const container = document.getElementById('flower-container');
  if (!container) return;

  const categoryFlowers = flowers.filter(f => f.category === "Loss of Agency");

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

      // Outer wrapper for FLIP animations
      const el = document.createElement('div');
      el.classList.add('flower');
      el.setAttribute('data-id', flowerData.id);
      el.style.position = 'absolute';
      el.style.left = `${xPct}%`;
      el.style.top = `${yPct}%`;
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;

      // Inner element with centering transform
      inner.classList.add('flower-inner');
      inner.style.width = '100%';
      inner.style.height = '100%';

      el.appendChild(inner);

      // Add interactions
      if (window.FlowerInteractions) {
        FlowerInteractions.addBehavior(el, flowerData);
      }

      // Progressive rendering: append immediately and trigger dissolve animation
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

    // Progressive rendering: append immediately and trigger dissolve animation
    container.appendChild(el);
    triggerDissolveAnimation(el, index * 50); // 50ms stagger between flowers
  });

  // Save layout for future use with device type
  saveLayout(resultsForPersist, isMobile);
}

// Load data and initialize page
Promise.all([
  fetch('metaphordata/data.json').then(r => r.json()),
  window.FlowerRenderer?.preloadTexture() || Promise.resolve()
])
  .then(([rawData]) => {
    const flowers = parseFlowerData(rawData);

    // Initialize modal system FIRST (if present)
    if (window.Modal) {
      Modal.init(flowers);
    } else {
      console.warn('Modal not available during initialization');
    }

    // Ensure layout runs after page is fully rendered and settled
    const initializeLayout = () => {
      createLossOfAgencyLayout(flowers);
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

        // Clear cache and trigger FLIP animation
        sessionStorage.removeItem(LOA_LAYOUT_KEY + '-desktop');
        sessionStorage.removeItem(LOA_LAYOUT_KEY + '-mobile');
        await createLossOfAgencyLayout(flowers, true); // isResize = true

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
  .catch(err => console.error("Error loading data for Loss of Agency:", err));
