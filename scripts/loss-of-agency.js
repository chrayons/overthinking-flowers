// loss-of-agency.js
// Displays flowers for the "Loss of Agency" category with fixed positioning

console.log("Loss of Agency page loading...");

// Fixed flower positions - captured from working layout
const FLOWER_POSITIONS = {
  desktop: {
    'ID7': { x: 74.6, y: 54.5 },  // sunshine and rainbows then sud...
    'ID16': { x: 17.5, y: 62.2 }, // Having a lovely married life w...
    'ID21': { x: 80.8, y: 29.0 }, // I cannaur...
    'ID25': { x: 40.3, y: 93.9 }, // a whirlpool...
    'ID33': { x: 36.5, y: 30.0 }, // walls closing in...
    'ID35': { x: 76.3, y: 86.5 }, // Starts out like a sauna. And t...
    'ID38': { x: 10.3, y: 32.6 }, // Drowning...
    'ID53': { x: 95.0, y: 74.8 }, // That one pic of the cartoon do...
    'ID67': { x: 5.0, y: 67.9 },  // the last bowling pin wobbling ...
    'ID71': { x: 92.4, y: 29.7 }  // Being completely submerged in ...
  },
  mobile: {
    'ID7': { x: 71.8, y: 53.9 },  // sunshine and rainbows then sud...
    'ID16': { x: 17.5, y: 62.2 }, // Having a lovely married life w...
    'ID21': { x: 95.0, y: 34.3 }, // I cannaur...
    'ID25': { x: 40.3, y: 93.9 }, // a whirlpool...
    'ID33': { x: 5.0, y: 18.9 },  // walls closing in...
    'ID35': { x: 76.3, y: 86.5 }, // Starts out like a sauna. And t...
    'ID38': { x: 5.0, y: 23.2 },  // Drowning...
    'ID53': { x: 95.0, y: 74.8 }, // That one pic of the cartoon do...
    'ID67': { x: 5.0, y: 67.9 },  // the last bowling pin wobbling ...
    'ID71': { x: 95.0, y: 18.8 }  // Being completely submerged in ...
  }
};

// Simple layout storage - one layout for all devices
const LOA_LAYOUT_KEY = 'loa-simple-layout-v13';

function saveLayout(placed) {
  try {
    sessionStorage.setItem(LOA_LAYOUT_KEY, JSON.stringify(placed));
  } catch {}
}

function restoreLayout() {
  try {
    return JSON.parse(sessionStorage.getItem(LOA_LAYOUT_KEY) || 'null');
  } catch {
    return null;
  }
}

// Fixed positioning system - no helper functions needed

// Simple layout - no scaling, just percentages

// Simple, universal layout calculation
function createLossOfAgencyLayout(flowers) {
  const container = document.getElementById('flower-container');
  if (!container) return;

  const categoryFlowers = flowers.filter(f => f.category === "Loss of Agency");

  container.innerHTML = '';

  // Clear flower interactions to prevent stale positioning
  if (window.FlowerInteractions) {
    console.log('Clearing flower interactions before layout');
    window.FlowerInteractions.clearAll();
  }

  // Check for existing layout first
  const restored = restoreLayout();
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

  categoryFlowers.forEach((flowerData, index) => {
    // Simple fixed positioning - no complex algorithms
    const isMobile = window.innerWidth <= 1160;
    const positions = isMobile ? FLOWER_POSITIONS.mobile : FLOWER_POSITIONS.desktop;
    const position = positions[flowerData.id];

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
      createLossOfAgencyLayout(flowers);
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
        sessionStorage.removeItem(LOA_LAYOUT_KEY);
        createLossOfAgencyLayout(flowers);
      }, 150);
    });
  })
  .catch(err => console.error("Error loading data for Loss of Agency:", err));
