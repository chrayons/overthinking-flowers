// emotional-dysregulation.js
// Displays flowers for the "Emotional Dysregulation" category with fixed positioning

console.log("Emotional Dysregulation page loading...");

// Fixed flower positions - captured from working layout
const FLOWER_POSITIONS = {
  desktop: {
    'ID3': { x: 5, y: 30 },   // Elmo screaming with fire meme
    'ID10': { x: 52, y: 10 },  // darkness, spring under tension
    'ID12': { x: 71, y: 40 },  // A beating chest 
    'ID13': { x: 90, y: 38 },  // being locked in a sound proof box periodically screaming and lashing out only to calm down and pretend everything is normal
    'ID14': { x: 12, y: 52 },  // head pounding, dizzying, heat flash/fever
    'ID20': { x: 22, y: 94 },  // U know when squidward left the krusty krab for spongebob to run alone and he couldn’t relax
    'ID28': { x: 73, y: 77 },  // A hyperventilating stuffed animal (hehehe)
    'ID30': { x: 80, y: 75 },  // loads of trains going in the same direction at the same time (bound to crash), a lift where people keep getting on even though it’s uncomfortably full and hard to breathe 
    'ID36': { x: 42, y: 20 },  // the “this is fine” dog meme
    'ID40': { x: 6, y: 85 },  // Chicken running around with its head cut off
    'ID70': { x: 94, y: 92 }   // nail biting
  },
  mobile: {
    'ID3': { x: 20, y: 30 },   // Elmo screaming with fire meme
    'ID10': { x: 22, y: 20 },  // darkness, spring under tension
    'ID12': { x: 71, y: 40 },  // A beating chest 
    'ID13': { x: 18, y: 38 },  // being locked in a sound proof box periodically screaming and lashing out only to calm down and pretend everything is normal
    'ID14': { x: 12, y: 70 },  // head pounding, dizzying, heat flash/fever
    'ID20': { x: 50, y: 80 },  // U know when squidward left the krusty krab for spongebob to run alone and he couldn’t relax
    'ID28': { x: 70, y: 67 },  // A hyperventilating stuffed animal (hehehe)
    'ID30': { x: 77, y: 25 },  // loads of trains going in the same direction at the same time (bound to crash), a lift where people keep getting on even though it’s uncomfortably full and hard to breathe 
    'ID36': { x: 56, y: 26 },  // the “this is fine” dog meme
    'ID40': { x: 35, y: 75 },  // Chicken running around with its head cut off
    'ID70': { x: 80, y: 72 }   // nail biting
  }
};

// Simple layout storage - one layout for all devices
const ED_LAYOUT_KEY = 'ed-simple-layout-v3';

// Set to true to ignore cache and always use fresh positions (for experimentation)
const IGNORE_CACHE = false;

function saveLayout(placed, isMobile) {
  try {
    const deviceKey = isMobile ? ED_LAYOUT_KEY + '-mobile' : ED_LAYOUT_KEY + '-desktop';
    sessionStorage.setItem(deviceKey, JSON.stringify(placed));
  } catch {}
}

function restoreLayout(isMobile) {
  try {
    const deviceKey = isMobile ? ED_LAYOUT_KEY + '-mobile' : ED_LAYOUT_KEY + '-desktop';
    return JSON.parse(sessionStorage.getItem(deviceKey) || 'null');
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
        // Clear both device-specific cached layouts to force recalculation
        sessionStorage.removeItem(ED_LAYOUT_KEY + '-desktop');
        sessionStorage.removeItem(ED_LAYOUT_KEY + '-mobile');
        createEmotionalDysregulationLayout(flowers);
      }, 150);
    });
  })
  .catch(err => console.error("Error loading data for Emotional Dysregulation:", err));