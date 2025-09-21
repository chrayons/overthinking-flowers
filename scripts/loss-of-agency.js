// loss-of-agency.js
// Displays flowers for the "Loss of Agency" category with golden spiral positioning

console.log("Loss of Agency page loading...");

// --- helpers to persist/restore a layout by viewport “bucket” ---
const LOA_LAYOUT_VERSION = 'v4'; // bump to invalidate cached positions when you change logic

function layoutKey() {
  const wBucket = Math.round(window.innerWidth / 100);
  const hBucket = Math.round(window.innerHeight / 100);
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

// Responsive positioning algorithm for Loss of Agency flowers
function createLossOfAgencyLayout(flowers) {
  const container = document.getElementById('flower-container');
  if (!container) return;

  const categoryFlowers = flowers.filter(f => f.category === "Loss of Agency");
  container.innerHTML = '';

  // Dimensions of the fixed “stage” (the container is the reference frame)
  const viewportWidth  = container.clientWidth  || window.innerWidth;
  const viewportHeight = container.clientHeight || window.innerHeight;

  // Ellipse reach: controls how “full” the canvas feels
  const rx = viewportWidth  * 0.46;
  const ry = viewportHeight * 0.40;

  // Try to restore an existing layout for this viewport bucket
  const restored = restoreLayout();

  // Constants
  const GOLDEN = 137.50776405 * (Math.PI / 180);
  const base = Math.min(viewportWidth, viewportHeight);

  // Size range: keep them larger on desktop, but cap on tiny screens
  const minFlowerSize = Math.max(72, Math.round(base * 0.08));
  const maxFlowerSize = Math.min(300, Math.round(base * 0.24));

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

      // r in [0..1]; exponent < 1 spreads outward more (0.65 works nicely)
      const tFill = (index + 1) / (N + 1);
      const r = Math.pow(Math.sqrt(tFill), 0.65);

      // center
      const cx = viewportWidth / 2;
      const cy = viewportHeight / 2;

      // ellipse reach
      const x = cx + rx * r * Math.cos(theta);
      const y = cy + ry * r * Math.sin(theta);

      // convert to percentages relative to container
      xPct = (x / viewportWidth) * 100;
      yPct = (y / viewportHeight) * 100;

      // allow large petals to kiss edges (light overhang)
      const rVW = (flowerSize / 2 / viewportWidth) * 100;
      const rVH = (flowerSize / 2 / viewportHeight) * 100;
      const maxOverflow = Math.max(rVW, rVH) * 0.20;

      xPct = Math.max(0 - maxOverflow, Math.min(100 + maxOverflow, xPct));
      yPct = Math.max(0 - maxOverflow, Math.min(100 + maxOverflow, yPct));

      // quick, gentle spacing check (nudge if too close)
      for (const p of placedFlowers) {
        const d = Math.hypot(xPct - p.xPct, yPct - p.yPct);
        const avgSize = (flowerSize + p.size) / 2;
        const minDist = (avgSize / Math.min(viewportWidth, viewportHeight)) * 10;
        if (d < minDist) {
          const nudge = 0.8;
          xPct += nudge * Math.sin(theta);
          yPct -= nudge * Math.cos(theta);
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

  // Persist this viewport’s layout so navigating back won’t reshuffle
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

    createLossOfAgencyLayout(flowers);

    // Recompute only when the viewport “bucket” changes
    let lastKey = layoutKey();
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const keyNow = layoutKey();
        if (keyNow !== lastKey) {
          lastKey = keyNow;
          createLossOfAgencyLayout(flowers);
        }
      }, 120);
    });
  })
  .catch(err => console.error("Error loading data for Loss of Agency:", err));
