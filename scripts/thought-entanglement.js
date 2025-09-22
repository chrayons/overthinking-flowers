// thought-entanglement.js
// Displays flowers for the "Thought Entanglement" category with fixed positioning

console.log("Thought Entanglement page loading...");

// Fixed flower positions - captured from working layout
const FLOWER_POSITIONS = {
  desktop: {
    'ID5': { x: 20, y: 15 },   // A ball of yarn with all the strings tangled up
    'ID8': { x: 65, y: 10 },   // Like twisted earphones (when they're all tangled up)
    'ID15': { x: 45, y: 25 },  // Knotted string
    'ID18': { x: 85, y: 20 },  // a drawing that's been scribbled on so you can't make out what was originally drawn
    'ID22': { x: 25, y: 40 },  // Telephone wires all knotted together
    'ID23': { x: 75, y: 35 },  // A bunch of snakes all twisted around each other
    'ID27': { x: 15, y: 65 },  // Like a rubber band ball that's all tangled up
    'ID29': { x: 55, y: 50 },  // a big bowl of spaghetti all mixed around
    'ID32': { x: 35, y: 80 },  // very tangled fishing line :(
    'ID43': { x: 80, y: 60 },  // Loosely tied shoelaces - but they're still messy
    'ID46': { x: 10, y: 85 },  // Roots are all intertwined, spread out underneath the ground
    'ID48': { x: 65, y: 75 },  // Web with multiple connections
    'ID51': { x: 90, y: 80 },  // Plate of spaghetti !!!
    'ID55': { x: 40, y: 65 },  // Tangled hair
    'ID56': { x: 70, y: 25 },  // Chain links
    'ID57': { x: 50, y: 85 },  // Tangled Christmas lights
    'ID59': { x: 90, y: 45 }   // a messy braided rope
  },
  mobile: {
    'ID5': { x: 25, y: 10 },   // A ball of yarn with all the strings tangled up
    'ID8': { x: 70, y: 5 },    // Like twisted earphones (when they're all tangled up)
    'ID15': { x: 50, y: 20 },  // Knotted string
    'ID18': { x: 80, y: 15 },  // a drawing that's been scribbled on so you can't make out what was originally drawn
    'ID22': { x: 25, y: 35 },  // Telephone wires all knotted together
    'ID23': { x: 75, y: 30 },  // A bunch of snakes all twisted around each other
    'ID27': { x: 15, y: 60 },  // Like a rubber band ball that's all tangled up
    'ID29': { x: 55, y: 45 },  // a big bowl of spaghetti all mixed around
    'ID32': { x: 35, y: 75 },  // very tangled fishing line :(
    'ID43': { x: 80, y: 55 },  // Loosely tied shoelaces - but they're still messy
    'ID46': { x: 15, y: 85 },  // Roots are all intertwined, spread out underneath the ground
    'ID48': { x: 65, y: 70 },  // Web with multiple connections
    'ID51': { x: 85, y: 80 },  // Plate of spaghetti !!!
    'ID55': { x: 40, y: 65 },  // Tangled hair
    'ID56': { x: 70, y: 25 },  // Chain links
    'ID57': { x: 50, y: 85 },  // Tangled Christmas lights
    'ID59': { x: 85, y: 40 }   // a messy braided rope
  }
};

// Simple layout storage - one layout for all devices
const TE_LAYOUT_KEY = 'te-simple-layout-v1';

// Set to true to ignore cache and always use fresh positions (for experimentation)
const IGNORE_CACHE = true;

function saveLayout(placed) {
  try {
    sessionStorage.setItem(TE_LAYOUT_KEY, JSON.stringify(placed));
  } catch {}
}

function restoreLayout() {
  try {
    return JSON.parse(sessionStorage.getItem(TE_LAYOUT_KEY) || 'null');
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

  categoryFlowers.forEach((flowerData) => {
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
        // Clear cached layout to force recalculation with new sizes
        sessionStorage.removeItem(TE_LAYOUT_KEY);
        createThoughtEntanglementLayout(flowers);
      }, 150);
    });
  })
  .catch(err => console.error("Error loading data for Thought Entanglement:", err));