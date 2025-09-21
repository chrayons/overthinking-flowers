// loss-of-agency.js
// Displays flowers for the "Loss of Agency" category with golden spiral positioning

console.log("Loss of Agency page loading...");

// --- helpers to persist/restore a layout by viewport “bucket” ---
const LOA_LAYOUT_VERSION = 'v14'; // bump to invalidate cached positions when you change logic

function layoutKey() {
  // Much larger buckets to prevent frequent recalculation
  const wBucket = Math.round(window.innerWidth / 300);
  const hBucket = Math.round(window.innerHeight / 300);
  return `loa-layout-${LOA_LAYOUT_VERSION}-${wBucket}x${hBucket}`;
}

function saveLayout(placed) {
  try {
    sessionStorage.setItem(layoutKey(), JSON.stringify(placed));
  } catch {}
}

function restoreLayout() {
  try {
    return JSON.parse(sessionStorage.getItem(layoutKey()) || 'null');
  } catch {
    return null;
  }
}

// Scale existing layout instead of recalculating positions
function scaleExistingLayout(categoryFlowers, container, newWidth, newHeight) {
  if (!originalLayout || !originalViewport) return false;

  const scaleX = newWidth / originalViewport.width;
  const scaleY = newHeight / originalViewport.height;
  const avgScale = (scaleX + scaleY) / 2;

  // Only scale if the size change isn't too dramatic
  if (avgScale < 0.4 || avgScale > 2.5) {
    originalLayout = null;
    originalViewport = null;
    return false;
  }

  container.innerHTML = '';

  originalLayout.forEach((layoutData, index) => {
    if (index >= categoryFlowers.length) return;

    const flowerData = categoryFlowers[index];

    // Scale the flower size
    const newSize = Math.round(layoutData.size * avgScale);

    // Keep positions but allow slight adjustment for aspect ratio changes
    const xPct = layoutData.xPct;
    const yPct = layoutData.yPct;

    // Create flower SVG
    const el = FlowerRenderer.createFlower(flowerData, {
      width: newSize,
      height: newSize,
      maxRadius: newSize * 0.45
    });
    el.classList.add('flower');

    // Position with smooth scaling
    el.style.position = 'absolute';
    el.style.left = `${xPct}%`;
    el.style.top = `${yPct}%`;
    el.style.transform = 'translate(-50%, -50%)';
    el.style.width = `${newSize}px`;
    el.style.height = `${newSize}px`;
    el.style.transition = 'all 0.3s ease'; // Smooth scaling

    // Add interactions
    if (window.FlowerInteractions) {
      FlowerInteractions.addBehavior(el, flowerData);
    }

    container.appendChild(el);
  });

  return true;
}

// Store the original layout for scaling
let originalLayout = null;
let originalViewport = null;

// Responsive positioning algorithm for Loss of Agency flowers
function createLossOfAgencyLayout(flowers) {
  const container = document.getElementById('flower-container');
  if (!container) return;

  const categoryFlowers = flowers.filter(f => f.category === "Loss of Agency");

  // Current viewport dimensions
  const viewportWidth  = window.innerWidth;
  const viewportHeight = window.innerHeight - 32; // minus 32px header

  // If we have an original layout, try to scale it instead of recalculating
  if (originalLayout && originalViewport) {
    scaleExistingLayout(categoryFlowers, container, viewportWidth, viewportHeight);
    return;
  }

  // First time or major size change - create new layout
  container.innerHTML = '';

  // Conservative ellipse reach - keep flowers well within viewport bounds
  const aspectRatio = viewportWidth / viewportHeight;
  let rxPercent, ryPercent;

  if (aspectRatio > 1.8) {
    // Very wide screens - more conservative
    rxPercent = 0.72;
    ryPercent = 0.72;
  } else if (aspectRatio < 0.6) {
    // Very tall screens - more conservative
    rxPercent = 0.56;
    ryPercent = 0.56;
  } else {
    // Normal aspect ratios - keep well contained
    rxPercent = 0.64;
    ryPercent = 0.64;
  }

  const rx = viewportWidth  * rxPercent;
  const ry = viewportHeight * ryPercent;

  // Try to restore an existing layout for this viewport bucket
  const restored = restoreLayout();

  // Constants
  const GOLDEN = 155.50776405 * (Math.PI / 180);
  const base = Math.min(viewportWidth, viewportHeight);

  // Even larger flower sizes - another 1.5x increase
  const sizeScale = aspectRatio > 1.5 ? 0.8 : aspectRatio < 0.7 ? 1.2 : 1.0;

  const minFlowerSize = Math.max(180, Math.round(base * 0.30 * sizeScale)); // 1.5x bigger (was 120)
  const maxFlowerSize = Math.min(600, Math.round(base * 0.70 * sizeScale)); // 1.5x bigger (was 650)

  const placedFlowers = [];
  const resultsForPersist = [];

  categoryFlowers.forEach((flowerData, index) => {
    let xPct, yPct, flowerSize;

    if (restored && restored.length === categoryFlowers.length) {
      ({ xPct, yPct, size: flowerSize } = restored[index]);
    } else {
      // --- size by blend of dominant + average intensity ---
      const vals = Object.values(flowerData.emotions || {});
      const dominant = vals.length ? Math.max(...vals) : 0;
      const avg = vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0;
      const combined = 0.7 * dominant + 0.3 * avg;
      const tSize = Math.max(0.35, Math.min(1, combined / 100)); // 35%..100%
      flowerSize = Math.round(minFlowerSize + (maxFlowerSize - minFlowerSize) * tSize);

      // --- Vogel (golden-angle) spiral that fills the whole ellipse ---
      const N = categoryFlowers.length;
      const theta = index * GOLDEN;

      // r in [0..1]; stronger central focus with gradual radiating outward
      const tFill = (index + 1) / (N + 1);
      const r = Math.pow(Math.sqrt(tFill), 0.90); // even less aggressive spread, stronger central clustering

      // center
      const cx = viewportWidth / 2;
      const cy = viewportHeight / 2;

      // ellipse reach
      const x = cx + rx * r * Math.cos(theta);
      const y = cy + ry * r * Math.sin(theta);

      // convert to percentages relative to container
      xPct = (x / viewportWidth) * 100;
      yPct = (y / viewportHeight) * 100;

      // Strong containment - keep flowers well within viewport with minimal edge touching
      const flowerRadius = flowerSize / 2;

      // Calculate safe bounds ensuring flowers stay mostly inside viewport
      const safeMarginX = (flowerRadius * 0.8 / viewportWidth) * 100; // 80% of radius as margin
      const safeMarginY = (flowerRadius * 0.8 / viewportHeight) * 100; // 80% of radius as margin

      // Clamp to safe bounds - only allow 20% of flower radius to potentially touch edges
      xPct = Math.max(safeMarginX, Math.min(100 - safeMarginX, xPct));
      yPct = Math.max(safeMarginY, Math.min(100 - safeMarginY, yPct));

      // Improved collision detection with better responsive scaling
      let nudgeCount = 0;
      for (const p of placedFlowers) {
        // Calculate distance in actual pixels, not percentages
        const dx = (xPct - p.xPct) * viewportWidth / 100;
        const dy = (yPct - p.yPct) * viewportHeight / 100;
        const d = Math.hypot(dx, dy);

        const avgSize = (flowerSize + p.size) / 2;
        const k = 8; // reduced spacing since flowers are much larger now
        const minDist = avgSize * (k / 100); // simpler distance calculation

        if (d < minDist && nudgeCount < 2) {
          // Nudge along spiral tangent with adaptive strength
          const nudgeStrength = Math.min(2.0, 100 / Math.min(viewportWidth, viewportHeight));
          xPct += nudgeStrength * Math.sin(theta + Math.PI/2);
          yPct -= nudgeStrength * Math.cos(theta + Math.PI/2);
          nudgeCount++;
        }
      }
    }

    // Create flower SVG
    const el = FlowerRenderer.createFlower(flowerData, {
      width: flowerSize,
      height: flowerSize,
      maxRadius: flowerSize * 0.45
    });
    el.classList.add('flower');

    // Position relative to the container (which we measured)
    el.style.position = 'absolute';
    el.style.left = `${xPct}%`;
    el.style.top  = `${yPct}%`;
    el.style.transform = 'translate(-50%, -50%)';
    el.style.width  = `${flowerSize}px`;
    el.style.height = `${flowerSize}px`;

    // Track for collision + persistence
    placedFlowers.push({ xPct, yPct, size: flowerSize });
    resultsForPersist.push({ xPct, yPct, size: flowerSize });

    // Interactions (tooltip + modal)
    if (window.FlowerInteractions) {
      FlowerInteractions.addBehavior(el, flowerData);
    }

    container.appendChild(el);
  });

  // Store original layout for smooth scaling
  originalLayout = resultsForPersist.map(item => ({ ...item }));
  originalViewport = { width: viewportWidth, height: viewportHeight };

  // Persist this viewport's layout so navigating back won't reshuffle
  if (!restored || restored.length !== categoryFlowers.length) {
    saveLayout(resultsForPersist);
  }
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
      // Clear any cached layouts when navigating to page to prevent stale positioning
      originalLayout = null;
      originalViewport = null;
      createLossOfAgencyLayout(flowers);
    };

    // Use requestAnimationFrame to ensure DOM is fully rendered, then add a small delay
    requestAnimationFrame(() => {
      setTimeout(initializeLayout, 100);
    });

    // Smooth scaling on resize with fallback to recalculation for major changes
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        createLossOfAgencyLayout(flowers);
      }, 100); // Faster response for smoother scaling
    });
  })
  .catch(err => console.error("Error loading data for Loss of Agency:", err));
