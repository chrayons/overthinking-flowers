// emotional-dysregulation.js
// Displays flowers for the "Emotional Dysregulation" category with fixed positioning

console.log("Emotional Dysregulation page loading...");

// Fixed flower positions - captured from working layout
const FLOWER_POSITIONS = {
  desktop: {
    'ID3': { x: 15, y: 30 },   // Like a pot on the stove that's about to explode
    'ID10': { x: 75, y: 20 },  // I either feel like a lake/very calm or like a sudden summer storm
    'ID12': { x: 45, y: 40 },  // Like a leaky faucet - water dripping bit by bit until a flood
    'ID13': { x: 85, y: 50 },  // Shake Shake Shake! a snow globe
    'ID14': { x: 25, y: 65 },  // Like a volcano about to burst
    'ID20': { x: 65, y: 15 },  // I have no control over the weather, it's very unpredictable
    'ID28': { x: 35, y: 80 },  // soda can that has been shaken up, once you open it, it explodes everywhere!
    'ID30': { x: 80, y: 75 },  // I am the eye of the storm. I am calm but everything around me is chaotic
    'ID36': { x: 55, y: 60 },  // overflowing bathtub, very stressed and water just flowing everywhere
    'ID40': { x: 10, y: 85 },  // Ocean: waves are rising and falling intensely but at the end it becomes calm again
    'ID70': { x: 90, y: 85 }   // I think of explosive volcano lava
  },
  mobile: {
    'ID3': { x: 20, y: 25 },   // Like a pot on the stove that's about to explode
    'ID10': { x: 75, y: 15 },  // I either feel like a lake/very calm or like a sudden summer storm
    'ID12': { x: 50, y: 35 },  // Like a leaky faucet - water dripping bit by bit until a flood
    'ID13': { x: 80, y: 45 },  // Shake Shake Shake! a snow globe
    'ID14': { x: 25, y: 60 },  // Like a volcano about to burst
    'ID20': { x: 65, y: 20 },  // I have no control over the weather, it's very unpredictable
    'ID28': { x: 35, y: 75 },  // soda can that has been shaken up, once you open it, it explodes everywhere!
    'ID30': { x: 80, y: 70 },  // I am the eye of the storm. I am calm but everything around me is chaotic
    'ID36': { x: 55, y: 55 },  // overflowing bathtub, very stressed and water just flowing everywhere
    'ID40': { x: 15, y: 85 },  // Ocean: waves are rising and falling intensely but at the end it becomes calm again
    'ID70': { x: 85, y: 80 }   // I think of explosive volcano lava
  }
};

// Simple layout storage - one layout for all devices
const ED_LAYOUT_KEY = 'ed-simple-layout-v1';

// Set to true to ignore cache and always use fresh positions (for experimentation)
const IGNORE_CACHE = true;

function saveLayout(placed) {
  try {
    sessionStorage.setItem(ED_LAYOUT_KEY, JSON.stringify(placed));
  } catch {}
}

function restoreLayout() {
  try {
    return JSON.parse(sessionStorage.getItem(ED_LAYOUT_KEY) || 'null');
  } catch {
    return null;
  }
}

// Simple, universal layout calculation
function createEmotionalDysregulationLayout(flowers) {
  const container = document.getElementById('flower-container');
  if (!container) return;

  const categoryFlowers = flowers.filter(f => f.category === "Emotional Dysregulation");

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
      createEmotionalDysregulationLayout(flowers);
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
        sessionStorage.removeItem(ED_LAYOUT_KEY);
        createEmotionalDysregulationLayout(flowers);
      }, 150);
    });
  })
  .catch(err => console.error("Error loading data for Emotional Dysregulation:", err));