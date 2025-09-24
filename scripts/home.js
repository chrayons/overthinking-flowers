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

function createCategoryCluster(categoryName, flowers, parentGrid) {
  const cell = document.createElement('div');
  cell.className = 'category-cell';

  // Make entire cell clickable - navigate to category page
  cell.style.cursor = 'pointer';
  cell.addEventListener('click', () => {
    localStorage.setItem('lastVisitedCategory', categoryName);
    const filename = categoryToFilename(categoryName);
    window.location.href = filename;
  });

  const label = document.createElement('div');
  label.className = 'category-label';
  label.innerHTML = categoryName.replace(/ (?=[^ ]*$)/, "<br>");
  label.style.zIndex = '2';
  cell.appendChild(label);

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
  // IMPORTANT: don’t force width/height; let the SVG use its own box
  // (remove any previous el.style.width/height lines)

  // --- Animate from label center to final (CENTER-BASED!) ---
  const startX = centerX;
  const startY = centerY;
  const endX   = x;
  const endY   = y;

  // Use CSS custom properties for position-specific values with reusable animation
  el.style.setProperty('--start-x', `${startX}px`);
  el.style.setProperty('--start-y', `${startY}px`);
  el.style.setProperty('--end-x', `${endX}px`);
  el.style.setProperty('--end-y', `${endY}px`);
  el.style.setProperty('--end-scale', scale);
  el.style.setProperty('--end-rotation', `${rot}deg`);

  // start at center
  el.style.left = `${startX}px`;
  el.style.top  = `${startY}px`;
  el.style.opacity = '0';
  el.classList.add('animate-entrance');

  // lock final state after animation
  setTimeout(() => {
    el.classList.remove('animate-entrance');
    el.style.left = `${endX}px`;
    el.style.top  = `${endY}px`;
    el.style.transform = `translate(-50%,-50%) rotate(${rot}deg) scale(${scale})`;
    el.style.opacity = '1';
  }, 800);

  cell.appendChild(el);
});

parentGrid.appendChild(cell); // ← add this
} // ← and this (end of createCategoryCluster)

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

// ---------- render desktop grid (no positions set here) ----------
function renderThemes(flowers) {
  const categories = groupFlowersByCategory(flowers);
  const grid = document.getElementById('category-grid');
  if (!grid) return;
  grid.innerHTML = '';

  CATEGORY_ORDER.forEach((name) => {
    const list = categories[name];
    if (list && list.length) {
      createCategoryCluster(name, list, grid);
    }
  });

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
    dot.addEventListener('click', () => goToSlide(index));
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
}

function updateCarousel() {
  const container = document.querySelector('.carousel-container');
  const track = document.getElementById('mobile-category-track');
  const prevBtn = document.querySelector('.carousel-prev');
  const nextBtn = document.querySelector('.carousel-next');
  const dots = document.querySelectorAll('.dot');
  if (!container || !track || !prevBtn || !nextBtn || _mobileCount === 0) return;

  // Position each item based on its relationship to the active index
  _carouselItems.forEach((item, index) => {
    const offset = (index - currentMobileIndex + _mobileCount) % _mobileCount;

    // Remove all position classes
    item.classList.remove('active', 'prev', 'next', 'hidden');

    if (offset === 0) {
      // Active item - center
      item.classList.add('active');
      item.style.transform = 'translateX(0%) translateZ(0px)';
      item.style.filter = 'blur(0px)';
      item.style.opacity = '1';
      item.style.zIndex = '10';
    } else if (offset === _mobileCount - 1) {
      // Previous item - left
      item.classList.add('prev');
      item.style.transform = 'translateX(-120%) translateZ(-50px)';
      item.style.filter = 'blur(2px)';
      item.style.opacity = '0.6';
      item.style.zIndex = '5';
    } else if (offset === 1) {
      // Next item - right
      item.classList.add('next');
      item.style.transform = 'translateX(120%) translateZ(-50px)';
      item.style.filter = 'blur(2px)';
      item.style.opacity = '0.6';
      item.style.zIndex = '5';
    } else {
      // Hidden items - far offscreen
      item.classList.add('hidden');
      const direction = offset < _mobileCount / 2 ? 300 : -300;
      item.style.transform = `translateX(${direction}%) translateZ(-100px)`;
      item.style.filter = 'blur(5px)';
      item.style.opacity = '0';
      item.style.zIndex = '1';
    }
  });

  // Update dots
  dots.forEach((dot, i) => dot.classList.toggle('active', i === currentMobileIndex));

  // Arrows always enabled for infinite carousel
  prevBtn.disabled = false;
  nextBtn.disabled = false;

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

// keep mobile carousel centered on resize (no desktop re-render needed - CSS handles it)
let _t;
window.addEventListener('resize', () => {
  clearTimeout(_t);
  _t = setTimeout(() => {
    updateCarousel(); // only update mobile carousel positioning
  }, 150);
});

// Load + init
fetch('../data.json')
  .then(r => r.json())
  .then(rawData => {
    const flowers = parseFlowerData(rawData);

    createHomePage(flowers);
    if (window.Shuffle) Shuffle.init(flowers);
    if (window.Modal)   Modal.init(flowers);
  })
  .catch(err => console.error("Error loading data:", err));
