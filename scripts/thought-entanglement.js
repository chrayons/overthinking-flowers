// thought-entanglement.js
// Displays flowers for the "Thought Entanglement" category with fixed positioning

console.log("Thought Entanglement page loading...");

// Fixed flower positions - captured from working layout
const FLOWER_POSITIONS = {
  desktop: {
    'ID5': { x: 12, y: 8 },   // scribbles, messy, black/dark, cloudy
    'ID8': { x: 52, y: 10 },   // scribbles, clouds, messy, gray
    'ID15': { x: 45, y: 20 },  // Trying to find the right information in a messy library
    'ID18': { x: 5, y: 45 },  // ball of yarn/thread except it’s alive
    'ID22': { x: 22, y: 31 },  // Like messed up bottle of yarn!
    'ID23': { x: 8, y: 67 },  // Its like those thought bubbles and all thats inside are scribbles
    'ID27': { x: 15, y: 65 },  // unending scribbles
    'ID29': { x: 90, y: 35 },  // A scribble , and just things moving around without anything clear just a string curing 
    'ID32': { x: 85, y: 42 },  // It’s like a matter but it’s always shifting. Any time i think i can grasp it, it changes to something different.
    'ID43': { x: 76, y: 95 },  // word cloud, labyrinth, drowning, freezing, being stuck
    'ID46': { x: 27, y: 75 },  // Storm, tangle
    'ID48': { x: 65, y: 75 },  // a knot, a racecar going around track at extremely high speeds, me running around a room restlessly
    'ID51': { x: 98, y: 48 },  // sort of like a small central point (the initial thought) and then a larger chaotic spiky/scribbly/zigzag circle around it (the associated thought spiral)
    'ID55': { x: 13, y: 35 },  // Scribbles / spiraling staircase leading downwards
    'ID56': { x: 70, y: 10 },  // A ball of yarn. You know the beginning and the end are there somewhere, but getting there is frustrating and takes ages. Also, others just tell you to buy a new one
    'ID57': { x: 20, y: 88 },  // I see problems as knots. Thinking would be the act of untying them in my head. Overthinking would be complicating the untying process, it may have been a simple fix or there was no solution, either way there is no need to keep trying to untie over and over
    'ID59': { x: 90, y: 73 }   // a tangled thread
  },
  mobile: {
    'ID5': { x: 15, y: 25 },   // scribbles, messy, black/dark, cloudy
    'ID8': { x: 44, y: 10 },   // scribbles, clouds, messy, gray
    'ID15': { x: 45, y: 25 },  // Trying to find the right information in a messy library
    'ID18': { x: 90, y: 30 },  // ball of yarn/thread except it’s alive
    'ID22': { x: 25, y: 35 },  // Like messed up bottle of yarn!
    'ID23': { x: 10, y: 75 },  // Its like those thought bubbles and all thats inside are scribbles
    'ID27': { x: 12, y: 65 },  // unending scribbles
    'ID29': { x: 75, y: 35 },  // A scribble , and just things moving around without anything clear just a string curing 
    'ID32': { x: 15, y: 42 },  // It’s like a matter but it’s always shifting. Any time i think i can grasp it, it changes to something different.
    'ID43': { x: 76, y: 70 },  // word cloud, labyrinth, drowning, freezing, being stuck
    'ID46': { x: 21, y: 75 },  // Storm, tangle
    'ID48': { x: 56, y: 75 },  // a knot, a racecar going around track at extremely high speeds, me running around a room restlessly
    'ID51': { x: 85, y: 48 },  // sort of like a small central point (the initial thought) and then a larger chaotic spiky/scribbly/zigzag circle around it (the associated thought spiral)
    'ID55': { x: 13, y: 35 },  // Scribbles / spiraling staircase leading downwards
    'ID56': { x: 65, y: 19 },  // A ball of yarn. You know the beginning and the end are there somewhere, but getting there is frustrating and takes ages. Also, others just tell you to buy a new one
    'ID57': { x: 50, y: 66 },  // I see problems as knots. Thinking would be the act of untying them in my head. Overthinking would be complicating the untying process, it may have been a simple fix or there was no solution, either way there is no need to keep trying to untie over and over
    'ID59': { x: 40, y: 80 }   // a tangled thread
  }
};

// Simple layout storage - one layout for all devices
const TE_LAYOUT_KEY = 'te-simple-layout-v5';

// Set to true to ignore cache and always use fresh positions (for experimentation)
const IGNORE_CACHE = false;

function saveLayout(placed, isMobile) {
  try {
    const deviceKey = isMobile ? TE_LAYOUT_KEY + '-mobile' : TE_LAYOUT_KEY + '-desktop';
    sessionStorage.setItem(deviceKey, JSON.stringify(placed));
  } catch {}
}

function restoreLayout(isMobile) {
  try {
    const deviceKey = isMobile ? TE_LAYOUT_KEY + '-mobile' : TE_LAYOUT_KEY + '-desktop';
    return JSON.parse(sessionStorage.getItem(deviceKey) || 'null');
  } catch {
    return null;
  }
}

// Simple, universal layout calculation
function createThoughtEntanglementLayout(flowers) {
  const container = document.getElementById('flower-container');
  if (!container) return;

  const categoryFlowers = flowers.filter(f => f.category === "Thought Entanglement");

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

  categoryFlowers.forEach((flowerData) => {
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
      createThoughtEntanglementLayout(flowers);
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
        sessionStorage.removeItem(TE_LAYOUT_KEY + '-desktop');
        sessionStorage.removeItem(TE_LAYOUT_KEY + '-mobile');
        createThoughtEntanglementLayout(flowers);
      }, 150);
    });
  })
  .catch(err => console.error("Error loading data for Thought Entanglement:", err));