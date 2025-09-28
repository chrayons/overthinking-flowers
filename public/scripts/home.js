// home.js — CSS-only layout version (no gridColumn/gridRow from JS)
console.log("Home page loading...");

// ---------- Pre-calculated flower positions for consistent layout ----------
// Generated once to ensure identical positions on every page load
const FLOWER_POSITIONS = (() => {
  const positions = [];
  const maxFlowers = 25;
  const centerX = 144;  // half of 288
  const centerY = 99;   // half of 198
  const aBase = 100;
  const bBase = 0.6 * aBase;
  const GOLDEN = 137.50776405 * (Math.PI / 180);

  // Use fixed seed for deterministic "random" values
  let seed = 12345;
  const seededRandom = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  for (let i = 0; i < maxFlowers; i++) {
    let theta = (i * GOLDEN) % (Math.PI * 2);
    theta += (seededRandom() - 0.5) * (Math.PI / 12); // ±15°

    const aWarp = aBase * (1 + 0.2 * Math.cos(2 * theta));
    const bWarp = bBase * (1 + 0.5 * Math.sin(4 * theta));

    const x = centerX + aWarp * Math.cos(theta);
    const y = centerY + bWarp * Math.sin(theta);

    let baseScale = 0.55 + seededRandom() * 0.95;
    const sideBias = 0.9 + 0.25 * Math.abs(Math.cos(theta));
    let scale = baseScale * sideBias;

    // occasional superstar (about 1 in 10)
    if (seededRandom() < 0.10) scale *= 1.25;

    scale = Math.min(1.9, scale);

    positions.push({ x, y, scale, rotation: 0 });
  }

  return positions;
})();

// ---------- helpers ----------
function groupFlowersByCategory(flowers) {
  return flowers.reduce((groups, flower) => {
    (groups[flower.category] ||= []).push(flower);
    return groups;
  }, {});
}

function categoryToFilename(categoryName) {
  return categoryName.toLowerCase().replace(/\s+/g, '-') + '.html';
}

function addFlowersToExistingCell(cell, categoryName, flowers) {
  // Make entire cell clickable - navigate to category page
  cell.style.cursor = 'pointer';
  cell.addEventListener('click', () => {
    localStorage.setItem('lastVisitedCategory', categoryName);
    const filename = categoryToFilename(categoryName);
    window.location.href = filename;
  });

  // Label already exists in HTML, just ensure z-index
  const label = cell.querySelector('.category-label');
  if (label) {
    label.style.zIndex = '2';
  }

  // ---- Use pre-calculated positions for consistent, fast rendering ----
  const maxFlowers = Math.min(flowers.length, 25);
  const centerX = 144;  // half of 288
  const centerY = 99;   // half of 198

  flowers.slice(0, maxFlowers).forEach((flower, i) => {
    // Get pre-calculated position data
    const position = FLOWER_POSITIONS[i] || FLOWER_POSITIONS[0]; // fallback to first position
    const { x, y, scale, rotation: rot } = position;

    const el = FlowerRenderer.createFlower(flower, 0, 0);
    el.classList.add('flower');
    el.style.position = 'absolute';
    el.style.pointerEvents = 'none';
    el.style.zIndex = '1';

    // --- Animate from label center to final (CENTER-BASED!) ---
    const startX = centerX;
    const startY = centerY;
    const endX   = x;
    const endY   = y;

    // Remove unused CSS custom properties for better performance

    // Position flowers for transform-only animation (better performance)
    el.style.left = `${centerX}px`; // Base position at label center
    el.style.top = `${centerY}px`;   // Base position at label center
    el.style.transform = `translate3d(-50%, -50%, 0) rotate(${rot}deg) scale(0.1)`; // Start small (10% scale) for smoother animation
    el.style.opacity = '1'; // Visible but tiny
    el.style.willChange = 'transform'; // Optimize for animation
    el.classList.add('flower-ready'); // Mark as ready for animation

    // Pre-calculate final transform values to avoid calc() during animation
    const offsetX = endX - centerX;
    const offsetY = endY - centerY;

    el.dataset.offsetX = offsetX;
    el.dataset.offsetY = offsetY;
    el.dataset.finalScale = scale;
    el.dataset.finalRotation = rot;

    cell.appendChild(el);
  });
}

// Order to render categories (CSS controls placement)
const CATEGORY_ORDER = [
  "Perpetual Looping",
  "Loss of Agency",
  "Sensory Overwhelm",
  "Emotional Dysregulation",
  "Perceptual Barriers",
  "Thought Entanglement",
  "Temporal Disconnection"
];

// ---------- enhance pre-rendered desktop grid with flowers ----------
function renderThemes(flowers) {
  const categories = groupFlowersByCategory(flowers);
  const grid = document.getElementById('category-grid');
  if (!grid) return;

  // Find existing category cells and add flowers to them
  const existingCells = grid.querySelectorAll('.category-cell');
  existingCells.forEach(cell => {
    const categoryName = cell.dataset.category;
    const list = categories[categoryName];
    if (list && list.length) {
      addFlowersToExistingCell(cell, categoryName, list);
    }
  });

  // Content is immediately visible for better mobile performance

  // Add efficient hover event handling to replace expensive :has() selector
  grid.addEventListener('mouseover', (e) => {
    if (e.target.closest('.category-cell')) {
      grid.classList.add('hovering');
    }
  }, { passive: true });

  grid.addEventListener('mouseout', (e) => {
    // Only remove class if we're leaving the grid entirely
    if (!grid.contains(e.relatedTarget)) {
      grid.classList.remove('hovering');
    }
  }, { passive: true });
}

// ---------- mobile carousel (position-based) ----------
let _flowers = [];
let currentMobileIndex = 0;  // Active index (0..n-1)
let _mobileCount = 0;        // Number of categories
let _carouselItems = [];     // Array of DOM elements

// Cache DOM elements for better INP performance
let _cachedContainer = null;
let _cachedTrack = null;
let _cachedPrevBtn = null;
let _cachedNextBtn = null;
let _cachedDots = null;

function renderMobileThemes(flowers) {
  const categories = groupFlowersByCategory(flowers);
  const track = document.getElementById('mobile-category-track');
  const dotsContainer = document.getElementById('carousel-dots');
  if (!track || !dotsContainer) return;

  track.innerHTML = '';
  dotsContainer.innerHTML = '';

  // Build items (no clones needed)
  _carouselItems = [];
  CATEGORY_ORDER.forEach((name, index) => {
    const list = categories[name];
    if (!list || !list.length) return;

    const item = document.createElement('div');
    item.className = 'mobile-category-item';
    item.dataset.index = String(index);

    const label = document.createElement('div');
    label.className = 'category-label';
    label.innerHTML = name.replace(/ (?=[^ ]*$)/, "<br>");
    item.appendChild(label);

    _carouselItems.push(item);
    track.appendChild(item);

    const dot = document.createElement('div');
    dot.className = 'dot';
    dot.dataset.index = index;

    // Add immediate visual feedback and optimized click handler
    dot.addEventListener('touchstart', () => {
      dot.style.transform = 'scale(0.9)';
    }, { passive: true });

    dot.addEventListener('touchend', () => {
      dot.style.transform = 'scale(1)';
    }, { passive: true });

    // Optimized click handler with immediate response
    dot.addEventListener('click', (e) => {
      e.preventDefault();
      // Immediate visual feedback
      dot.classList.add('active');
      // Fast slide update
      goToSlide(index);
    }, { passive: false });

    dotsContainer.appendChild(dot);
  });

  if (_carouselItems.length === 0) return;
  _mobileCount = _carouselItems.length;

  // Check for stored last visited category, otherwise default to "Perpetual Looping"
  const lastVisited = localStorage.getItem('lastVisitedCategory');
  const targetCategory = lastVisited && CATEGORY_ORDER.includes(lastVisited) ? lastVisited : "Perpetual Looping";
  const initial = Math.max(0, Math.min(CATEGORY_ORDER.indexOf(targetCategory), _mobileCount - 1));
  currentMobileIndex = initial;

  updateCarousel();

  // Mobile carousel is immediately visible for better performance
}

function updateCarousel() {
  // Use cached elements (only query once)
  if (!_cachedContainer) {
    _cachedContainer = document.querySelector('.carousel-container');
    _cachedTrack = document.getElementById('mobile-category-track');
    _cachedPrevBtn = document.querySelector('.carousel-prev');
    _cachedNextBtn = document.querySelector('.carousel-next');
    _cachedDots = document.querySelectorAll('.dot');
  }

  if (!_cachedContainer || !_cachedTrack || !_cachedPrevBtn || !_cachedNextBtn || _mobileCount === 0) return;

  // Batch DOM updates with requestAnimationFrame for better performance
  requestAnimationFrame(() => {
    // Position each item based on its relationship to the active index
    _carouselItems.forEach((item, index) => {
      const offset = (index - currentMobileIndex + _mobileCount) % _mobileCount;

      // Remove all position classes in one operation
      item.className = item.className.replace(/\b(active|prev|next|hidden)\b/g, '').trim() + ' mobile-category-item';

      if (offset === 0) {
        // Active item - center
        item.classList.add('active');
        item.style.cssText = 'transform: translateX(0%) translateZ(0px); filter: blur(0px); opacity: 1; z-index: 10;';
      } else if (offset === _mobileCount - 1) {
        // Previous item - left
        item.classList.add('prev');
        item.style.cssText = 'transform: translateX(-120%) translateZ(-50px); filter: blur(2px); opacity: 0.6; z-index: 5;';
      } else if (offset === 1) {
        // Next item - right
        item.classList.add('next');
        item.style.cssText = 'transform: translateX(120%) translateZ(-50px); filter: blur(2px); opacity: 0.6; z-index: 5;';
      } else {
        // Hidden items - far offscreen
        item.classList.add('hidden');
        const direction = offset < _mobileCount / 2 ? 300 : -300;
        item.style.cssText = `transform: translateX(${direction}%) translateZ(-100px); filter: blur(5px); opacity: 0; z-index: 1;`;
      }
    });

    // Update dots efficiently
    _cachedDots.forEach((dot, i) => {
      if (i === currentMobileIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  });

  // Arrows always enabled for infinite carousel
  _cachedPrevBtn.disabled = false;
  _cachedNextBtn.disabled = false;

  // Update CTA
  const seeReflectionsBtn = document.getElementById('mobile-see-reflections-btn');
  if (seeReflectionsBtn) {
    seeReflectionsBtn.dataset.category = CATEGORY_ORDER[currentMobileIndex] || '';
  }
}

function initMobileCarousel() {
  const prevBtn = document.querySelector('.carousel-prev');
  const nextBtn = document.querySelector('.carousel-next');

  // Add click handler for "See Reflections" button
  const seeReflectionsBtn = document.getElementById('mobile-see-reflections-btn');
  if (seeReflectionsBtn) {
    seeReflectionsBtn.addEventListener('click', () => {
      const categoryName = seeReflectionsBtn.dataset.category;
      if (categoryName) {
        localStorage.setItem('lastVisitedCategory', categoryName);
        const filename = categoryToFilename(categoryName);
        window.location.href = filename;
      }
    });
  }

  // Simple navigation using modular arithmetic
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (_mobileCount === 0) return;
      currentMobileIndex = (currentMobileIndex - 1 + _mobileCount) % _mobileCount;
      updateCarousel();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (_mobileCount === 0) return;
      currentMobileIndex = (currentMobileIndex + 1) % _mobileCount;
      updateCarousel();
    });
  }
}

function goToSlide(index) {
  if (_mobileCount === 0) return;

  // Early return if already at target index
  if (currentMobileIndex === index) return;

  currentMobileIndex = ((index % _mobileCount) + _mobileCount) % _mobileCount;
  updateCarousel();
}

// ---------- bootstrap ----------
function createHomePage(flowers) {
  _flowers = flowers;
  renderThemes(_flowers);          // desktop grid (CSS controls layout)
  renderMobileThemes(_flowers);    // mobile carousel
  initMobileCarousel();

  // keep Reflections after Themes
  const themes = document.getElementById('themes');
  const reflections = document.getElementById('reflections');
  if (themes && reflections) themes.insertAdjacentElement('afterend', reflections);
}

// Performance budget check for animations
function shouldUseReducedAnimations() {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const isSlowConnection = connection && connection.effectiveType &&
                         (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g');
  const isLowMemory = navigator.deviceMemory && navigator.deviceMemory < 4;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return isSlowConnection || isLowMemory || prefersReducedMotion;
}

// Global function to trigger flower animations after loading
window.triggerFlowerAnimations = function() {
  console.log('Triggering flower expansion animations...');

  const allFlowers = document.querySelectorAll('.flower-ready');
  const useReducedAnimations = shouldUseReducedAnimations();

  // Use requestAnimationFrame for smoother performance
  requestAnimationFrame(() => {
    // Animate ALL flowers with very subtle timing variation for organic feel
    allFlowers.forEach((flower, index) => {
      const offsetX = parseFloat(flower.dataset.offsetX);
      const offsetY = parseFloat(flower.dataset.offsetY);
      const finalScale = flower.dataset.finalScale;
      const finalRotation = flower.dataset.finalRotation;

      // Add very subtle timing variation (0-20ms) for organic feel
      const subtleDelay = Math.random() * 20;

      setTimeout(() => {
        if (useReducedAnimations) {
          // Instant positioning for low-end devices
          const translateX = -50; // Keep centered
          const translateY = -50; // Keep centered
          flower.style.transform = `translate3d(${translateX}%, ${translateY}%, 0) translate3d(${offsetX}px, ${offsetY}px, 0) rotate(${finalRotation}deg) scale(${finalScale})`;
          flower.classList.remove('flower-ready');
          flower.style.willChange = 'auto';
        } else {
          // Full animation for capable devices - smooth slow-to-fast easing
          flower.style.transition = 'transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

          // Animate using translate3d for GPU acceleration (no calc() needed)
          const translateX = -50; // Keep centered
          const translateY = -50; // Keep centered
          flower.style.transform = `translate3d(${translateX}%, ${translateY}%, 0) translate3d(${offsetX}px, ${offsetY}px, 0) rotate(${finalRotation}deg) scale(${finalScale})`;

          // Clean up after animation (increased timeout to match new duration)
          setTimeout(() => {
            flower.classList.remove('flower-ready');
            flower.style.transition = '';
            flower.style.willChange = 'auto'; // Reset will-change
          }, 800);
        }
      }, subtleDelay);
    });
  });
};

// keep mobile carousel centered on resize (no desktop re-render needed - CSS handles it)
let _t;
window.addEventListener('resize', () => {
  clearTimeout(_t);
  _t = setTimeout(() => {
    updateCarousel(); // only update mobile carousel positioning
  }, 150);
});

// Load + init
fetch('metaphordata/data.json')
  .then(r => r.json())
  .then(rawData => {
    const flowers = parseFlowerData(rawData);

    createHomePage(flowers);
    if (window.Shuffle) Shuffle.init(flowers);
    if (window.Modal)   Modal.init(flowers);
  })
  .catch(err => console.error("Error loading data:", err));
