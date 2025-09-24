// perpetual-looping.js
// Displays flowers for the "Perpetual Looping" category with fixed positioning

console.log("Perpetual Looping page loading...");

// Fixed flower positions - captured from working layout
const FLOWER_POSITIONS = {
  desktop: {
    'ID2': { x: 15, y: 20 },   // like a computer caught in an infinite loop
    'ID4': { x: 92, y: 30 },   // like i'm running to a place where there's no end to
    'ID6': { x: 39, y: 8 },   // kind of like being lost at sea - difficult to navigate through the waves...
    'ID9': { x: 17, y: 40 },   // A toy train track where the train goes in circles constantly without ever getting anywhere.
    'ID17': { x: 75, y: 40 },  // Like a hamster on a wheel? Or like I'm standing still but everyone around me...
    'ID26': { x: 2, y: 58 },  // A circular amusement park ride that spins in a circle over and over
    'ID37': { x: 60, y: 20 },  // Thoughts chasing each other, mouth to body mouth to body...
    'ID41': { x: 75, y: 65 },  // Chains of predictions of events and possible solutions (flowchart-like)
    'ID42': { x: 92, y: 70 },  // surges of negative overlooping energy
    'ID54': { x: 29, y: 92 },  // I tend to replay different scenarios that could have happened...
    'ID58': { x: 12, y: 81 },  // everytime i pick up something something else drops and i have my arms full of thoughts
    'ID64': { x: 80, y: 85 },  // Hamster 🐹 Wheel
    'ID68': { x: 26, y: 67 }   // cycle – never ending, going round and round
  },
  mobile: {
    'ID2': { x: 30, y: 20 },   // like a computer caught in an infinite loop
    'ID4': { x: 55, y: 30 },   // like i'm running to a place where there's no end to
    'ID6': { x: 39, y: 15 },   // kind of like being lost at sea - difficult to navigate through the waves...
    'ID9': { x: 15, y: 45 },   // A toy train track where the train goes in circles constantly without ever getting anywhere.
    'ID17': { x: 75, y: 40 },  // Like a hamster on a wheel? Or like I'm standing still but everyone around me...
    'ID26': { x: 10, y: 40 },  // A circular amusement park ride that spins in a circle over and over
    'ID37': { x: 60, y: 20 },  // Thoughts chasing each other, mouth to body mouth to body...
    'ID41': { x: 65, y: 65 },  // Chains of predictions of events and possible solutions (flowchart-like)
    'ID42': { x: 80, y: 70 },  // surges of negative overlooping energy
    'ID54': { x: 45, y: 75 },  // I tend to replay different scenarios that could have happened...
    'ID58': { x: 14, y: 80 },  // everytime i pick up something something else drops and i have my arms full of thoughts
    'ID64': { x: 80, y: 75 },  // Hamster 🐹 Wheel
    'ID68': { x: 27, y: 65 }   // cycle – never ending, going round and round
  }
};

// Simple layout storage - one layout for all devices
const PL_LAYOUT_KEY = 'pl-simple-layout-v3';

// Set to true to ignore cache and always use fresh positions (for experimentation)
const IGNORE_CACHE = false;

function saveLayout(placed, isMobile) {
  try {
    const deviceKey = isMobile ? PL_LAYOUT_KEY + '-mobile' : PL_LAYOUT_KEY + '-desktop';
    sessionStorage.setItem(deviceKey, JSON.stringify(placed));
  } catch {}
}

function restoreLayout(isMobile) {
  try {
    const deviceKey = isMobile ? PL_LAYOUT_KEY + '-mobile' : PL_LAYOUT_KEY + '-desktop';
    return JSON.parse(sessionStorage.getItem(deviceKey) || 'null');
  } catch {
    return null;
  }
}

// Simple, universal layout calculation
function createPerpetualLoopingLayout(flowers) {
  const container = document.getElementById('flower-container');
  if (!container) return;

  const categoryFlowers = flowers.filter(f => f.category === "Perpetual Looping");

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
      createPerpetualLoopingLayout(flowers);
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
        sessionStorage.removeItem(PL_LAYOUT_KEY + '-desktop');
        sessionStorage.removeItem(PL_LAYOUT_KEY + '-mobile');
        createPerpetualLoopingLayout(flowers);
      }, 150);
    });
  })
  .catch(err => console.error("Error loading data for Perpetual Looping:", err));