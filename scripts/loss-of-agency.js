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
    'ID7': { x: 90, y: 45 },  // sunshine and rainbows then sud...
    'ID16': { x: 25, y: 68 }, // Having a lovely married life w...
    'ID21': { x: 70, y: 29 }, // I cannaur...
    'ID25': { x: 59, y: 35 }, // a whirlpool...
    'ID33': { x: 33, y: 35 }, // walls closing in...
    'ID35': { x: 75, y: 68 }, // Starts out like a sauna. And t...
    'ID38': { x: 10, y: 37 }, // Drowning...
    'ID53': { x: 55, y: 75 }, // That one pic of the cartoon do...
    'ID67': { x: 16, y: 50 },  // the last bowling pin wobbling ...
    'ID71': { x: 48, y: 20 }  // Being completely submerged in ...
  }
};

// Simple layout storage - one layout for all devices
const LOA_LAYOUT_KEY = 'loa-simple-layout-v17';

// Set to true to ignore cache and always use fresh positions (for experimentation)
const IGNORE_CACHE = false;

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

  // Save layout for future use with device type
  saveLayout(resultsForPersist, isMobile);
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
        // Clear both device-specific cached layouts to force recalculation
        sessionStorage.removeItem(LOA_LAYOUT_KEY + '-desktop');
        sessionStorage.removeItem(LOA_LAYOUT_KEY + '-mobile');
        createLossOfAgencyLayout(flowers);
      }, 150);
    });
  })
  .catch(err => console.error("Error loading data for Loss of Agency:", err));
