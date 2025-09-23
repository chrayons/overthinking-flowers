// temporal-disconnection.js
// Displays flowers for the "Temporal Disconnection" category with fixed positioning

console.log("Temporal Disconnection page loading...");

// Fixed flower positions - captured from working layout
const FLOWER_POSITIONS = {
  desktop: {
    'ID1': { x: 18, y: 74 },   // World is moving but I'm not moving along with it
    'ID31': { x: 68, y: 47 },  // Trains, cars, moving objects moving past me in a blur
    'ID60': { x: 28, y: 21 },  // Wouldn't say I'm much of an overthinker, rather I feel like a rusty tap...
    'ID73': { x: 78, y: 50 }   // Moments of particular events that happened in the past
  },
  mobile: {
    'ID1': { x: 18, y: 74 },   // World is moving but I'm not moving along with it
    'ID31': { x: 68, y: 47 },  // Trains, cars, moving objects moving past me in a blur
    'ID60': { x: 28, y: 21 },  // Wouldn't say I'm much of an overthinker, rather I feel like a rusty tap...
    'ID73': { x: 78, y: 50 }   // Moments of particular events that happened in the past
  }
};

// Simple layout storage - one layout for all devices
const TD_LAYOUT_KEY = 'td-simple-layout-v2';

// Set to true to ignore cache and always use fresh positions (for experimentation)
const IGNORE_CACHE = false;

function saveLayout(placed) {
  try {
    sessionStorage.setItem(TD_LAYOUT_KEY, JSON.stringify(placed));
  } catch {}
}

function restoreLayout() {
  try {
    return JSON.parse(sessionStorage.getItem(TD_LAYOUT_KEY) || 'null');
  } catch {
    return null;
  }
}

// Simple, universal layout calculation
function createTemporalDisconnectionLayout(flowers) {
  const container = document.getElementById('flower-container');
  if (!container) return;

  const categoryFlowers = flowers.filter(f => f.category === "Temporal Disconnection");

  container.innerHTML = '';

  // Clear flower interactions to prevent stale positioning
  if (window.FlowerInteractions) {
    console.log('Clearing flower interactions before layout');
    window.FlowerInteractions.clearAll();
  }

  // Check for existing layout first (unless experimenting)
  const restored = IGNORE_CACHE ? null : restoreLayout();
  if (restored && restored.length === categoryFlowers.length) {
    // Use existing layout
    restored.forEach((layoutData, index) => {
      if (index >= categoryFlowers.length) return;

      const flowerData = categoryFlowers[index];
      const { xPct, yPct, size } = layoutData;

      // Create flower
      const el = FlowerRenderer.createFlower(flowerData, {
        width: size,
        height: size,
        maxRadius: size * 0.45
      });
      el.classList.add('flower');

      // Position using stored percentages
      el.style.position = 'absolute';
      el.style.left = `${xPct}%`;
      el.style.top = `${yPct}%`;
      el.style.transform = 'translate(-50%, -50%)';
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;

      // Add interactions
      if (window.FlowerInteractions) {
        FlowerInteractions.addBehavior(el, flowerData);
      }

      container.appendChild(el);
    });
    return;
  }

  // Fixed positioning - no complex calculations needed
  const placedFlowers = [];
  const resultsForPersist = [];

  // Calculate mobile/desktop state and positions once for all flowers
  const isMobile = window.innerWidth <= 1160;
  const positions = isMobile ? FLOWER_POSITIONS.mobile : FLOWER_POSITIONS.desktop;

  categoryFlowers.forEach((flowerData, index) => {
    // Simple fixed positioning - no complex algorithms
    let position = positions[flowerData.id];

    // Fallback position if flower ID not found
    if (!position) {
      console.warn(`No position found for flower ${flowerData.id}, using fallback`);
      position = { x: 50, y: 50 }; // Center as fallback
    }

    // Calculate size based on emotion intensity (keep this dynamic)
    const vals = Object.values(flowerData.emotions || {});
    const dominant = vals.length ? Math.max(...vals) : 0;
    const avg = vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0;
    const combined = 0.7 * dominant + 0.3 * avg;
    const tSize = Math.max(0.35, Math.min(1, combined / 100));

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

    // Create flower
    const el = FlowerRenderer.createFlower(flowerData, {
      width: flowerSize,
      height: flowerSize,
      maxRadius: flowerSize * 0.45
    });
    el.classList.add('flower');
    el.setAttribute('data-id', flowerData.id); // Add ID for CSS targeting

    // Position using fixed percentages
    el.style.position = 'absolute';
    el.style.left = `${xPct}%`;
    el.style.top = `${yPct}%`;
    el.style.transform = 'translate(-50%, -50%)';
    el.style.width = `${flowerSize}px`;
    el.style.height = `${flowerSize}px`;

    // Store data for persistence
    placedFlowers.push({ xPct, yPct, size: flowerSize });
    resultsForPersist.push({ xPct, yPct, size: flowerSize });

    // Add interactions
    if (window.FlowerInteractions) {
      FlowerInteractions.addBehavior(el, flowerData);
    }

    container.appendChild(el);
  });

  // Save layout for future use
  saveLayout(resultsForPersist);
}

// Load data and initialize page
fetch('../data.json')
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

    // Add resize handler for responsive flower scaling
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        console.log('Resize detected, recalculating layout for new screen size:', window.innerWidth);
        // Clear cached layout to force recalculation with new sizes
        sessionStorage.removeItem(TD_LAYOUT_KEY);
        createTemporalDisconnectionLayout(flowers);
      }, 150);
    });
  })
  .catch(err => console.error("Error loading data for Temporal Disconnection:", err));