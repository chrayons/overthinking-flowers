// home.js — CSS-only layout version (no gridColumn/gridRow from JS)
console.log("Home page loading...");

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
    const filename = categoryToFilename(categoryName);
    window.location.href = filename;
  });

  const label = document.createElement('div');
  label.className = 'category-label';
  label.innerHTML = categoryName.replace(/ (?=[^ ]*$)/, "<br>");
  cell.appendChild(label);

  // draw ring (fixed size — we do NOT scale)
  const maxFlowers = Math.min(flowers.length, 25);
  const centerX = 144;  // half of 288 (cell width)
  const centerY = 99;   // half of 198 (cell height)
  const radius  = 75;

  flowers.slice(0, maxFlowers).forEach((flower, i) => {
    const angle = (i / maxFlowers) * 2 * Math.PI;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    const el = FlowerRenderer.createFlower(flower, 0, 0);
    el.classList.add('flower');

    // Create custom animation from center to final position
    const startX = centerX - 40; // Start at label center
    const startY = centerY - 40;
    const endX = x - 40; // End at ring position
    const endY = y - 40;

    // Create unique animation for this flower
    const animationName = `radiate-${Date.now()}-${i}`;
    const keyframes = `
      @keyframes ${animationName} {
        0% {
          left: ${startX}px;
          top: ${startY}px;
          transform: scale(0.3);
          opacity: 0;
        }
        100% {
          left: ${endX}px;
          top: ${endY}px;
          transform: scale(1);
          opacity: 1;
        }
      }
    `;

    // Add keyframes to document
    const style = document.createElement('style');
    style.textContent = keyframes;
    document.head.appendChild(style);

    // Apply animation
    el.style.animationName = animationName;
    el.classList.add('animate-entrance');

    // Start at center position
    el.style.left = startX + 'px';
    el.style.top = startY + 'px';

    // Remove animation class after completion and set final position
    setTimeout(() => {
      el.classList.remove('animate-entrance');
      el.style.animationName = '';
      // Ensure flower stays at final position
      el.style.left = endX + 'px';
      el.style.top = endY + 'px';
      el.style.transform = 'scale(1)';
      el.style.opacity = '1';
    }, 800);

    cell.appendChild(el);
  });

  parentGrid.appendChild(cell);
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
}

// ---------- mobile carousel (unchanged) ----------
let _flowers = [];
let currentMobileIndex = 0;  // REAL index (0..n-1)
let _mobileCount = 0;        // number of REAL items
let _pendingSnap = null;     // { to: 'head' | 'tail' } during wrap

function renderMobileThemes(flowers) {
  const categories = groupFlowersByCategory(flowers);
  const track = document.getElementById('mobile-category-track');
  const dotsContainer = document.getElementById('carousel-dots');
  if (!track || !dotsContainer) return;

  track.innerHTML = '';
  dotsContainer.innerHTML = '';

  // Build REAL items
  const realItems = [];
  CATEGORY_ORDER.forEach((name, realIndex) => {
    const list = categories[name];
    if (!list || !list.length) return;

    const item = document.createElement('div');
    item.className = 'mobile-category-item';
    item.dataset.realIndex = String(realIndex);

    const label = document.createElement('div');
    label.className = 'category-label';
    label.innerHTML = name.replace(/ (?=[^ ]*$)/, "<br>");
    item.appendChild(label);

    realItems.push(item);

    const dot = document.createElement('div');
    dot.className = 'dot';
    dot.dataset.index = realIndex;
    dot.addEventListener('click', () => goToSlide(realIndex));
    dotsContainer.appendChild(dot);
  });

  if (realItems.length === 0) return;

  _mobileCount = realItems.length;

  // Add clones: [cloneLast] + REALS + [cloneFirst]
  const cloneLast  = realItems[realItems.length - 1].cloneNode(true);
  cloneLast.classList.add('clone'); cloneLast.dataset.clone = 'true';

  const cloneFirst = realItems[0].cloneNode(true);
  cloneFirst.classList.add('clone'); cloneFirst.dataset.clone = 'true';

  track.appendChild(cloneLast);
  realItems.forEach(el => track.appendChild(el));
  track.appendChild(cloneFirst);

  // Default to "Emotional Dysregulation" centered
  const initial = Math.max(0, Math.min(CATEGORY_ORDER.indexOf("Emotional Dysregulation"), _mobileCount - 1));
  currentMobileIndex = initial;

  updateCarousel();
}

function updateCarousel() {
  const container = document.querySelector('.carousel-container');
  const track = document.getElementById('mobile-category-track');
  const prevBtn = document.querySelector('.carousel-prev');
  const nextBtn = document.querySelector('.carousel-next');
  const dots = document.querySelectorAll('.dot');
  if (!container || !track || !prevBtn || !nextBtn) return;

  const items = track.children;
  const totalItems = items.length;
  if (!totalItems || _mobileCount === 0) return;

  // Active class on REAL item only (ignore clones)
  Array.from(items).forEach((item) => {
    const isReal = !item.classList.contains('clone') && item.dataset.realIndex != null;
    if (!isReal) {
      item.classList.remove('active');
      return;
    }
    const realIndex = Number(item.dataset.realIndex);
    item.classList.toggle('active', realIndex === currentMobileIndex);
  });

  // Center the DOM node that corresponds to the real index (accounting for leading clone)
  const targetDomIndex = currentMobileIndex + 1;
  const activeEl = items[targetDomIndex];

  const style = getComputedStyle(track);
  const m = new DOMMatrixReadOnly(style.transform === 'none' ? '' : style.transform);
  const currentTx = m.m41 || 0;

  const containerRect = container.getBoundingClientRect();
  const activeRect    = activeEl.getBoundingClientRect();
  const containerCenter = containerRect.left + containerRect.width / 2;
  const activeCenter    = activeRect.left    + activeRect.width  / 2;

  const delta = containerCenter - activeCenter;
  const nextTx = currentTx + delta;
  track.style.transform = `translateX(${nextTx}px)`;

  // Dots reflect REAL index
  dots.forEach((dot, i) => dot.classList.toggle('active', i === currentMobileIndex));

  // Infinite carousel: arrows stay enabled
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
  const track = document.getElementById('mobile-category-track');
  if (!track) return;

  // Add click handler for "See Reflections" button
  const seeReflectionsBtn = document.getElementById('mobile-see-reflections-btn');
  if (seeReflectionsBtn) {
    seeReflectionsBtn.addEventListener('click', () => {
      const categoryName = seeReflectionsBtn.dataset.category;
      if (categoryName) {
        const filename = categoryToFilename(categoryName);
        window.location.href = filename;
      }
    });
  }

  // After animated move to a clone, snap instantly to the real item
  track.addEventListener('transitionend', () => {
    if (!_pendingSnap) return;

    const prevTransition = track.style.transition;
    track.style.transition = 'none'; // disable for instant snap

    if (_pendingSnap.to === 'head') {
      currentMobileIndex = 0;
      snapToDomIndex(currentMobileIndex + 1);
    } else if (_pendingSnap.to === 'tail') {
      currentMobileIndex = _mobileCount - 1;
      snapToDomIndex(currentMobileIndex + 1);
    }

    track.getBoundingClientRect();
    track.style.transition = prevTransition;
    _pendingSnap = null;
  });

  function snapToDomIndex(domIndex) {
    const container = document.querySelector('.carousel-container');
    const items = track.children;
    const target = items[domIndex];
    if (!container || !target) return;

    const style = getComputedStyle(track);
    const m = new DOMMatrixReadOnly(style.transform === 'none' ? '' : style.transform);
    const currentTx = m.m41 || 0;

    const cr = container.getBoundingClientRect();
    const ar = target.getBoundingClientRect();
    const cc = cr.left + cr.width / 2;
    const ac = ar.left + ar.width / 2;

    const delta = cc - ac;
    const nextTx = currentTx + delta;
    track.style.transform = `translateX(${nextTx}px)`;

    const dots = document.querySelectorAll('.dot');
    Array.from(items).forEach((item) => {
      const isReal = !item.classList.contains('clone') && item.dataset.realIndex != null;
      if (!isReal) {
        item.classList.remove('active');
        return;
      }
      const realIndex = Number(item.dataset.realIndex);
      item.classList.toggle('active', realIndex === currentMobileIndex);
    });
    dots.forEach((dot, i) => dot.classList.toggle('active', i === currentMobileIndex));
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (_mobileCount === 0) return;

      if (currentMobileIndex > 0) {
        currentMobileIndex -= 1;
        updateCarousel();
      } else {
        _pendingSnap = { to: 'tail' };
        const items = track.children;
        const currentItem = items[currentMobileIndex + 1];
        const itemWidth = currentItem.getBoundingClientRect().width;

        const style = getComputedStyle(track);
        const m = new DOMMatrixReadOnly(style.transform === 'none' ? '' : style.transform);
        const currentTx = m.m41 || 0;

        track.style.transform = `translateX(${currentTx + itemWidth}px)`;
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (_mobileCount === 0) return;

      if (currentMobileIndex < _mobileCount - 1) {
        currentMobileIndex += 1;
        updateCarousel();
      } else {
        _pendingSnap = { to: 'head' };
        const items = track.children;
        const currentItem = items[currentMobileIndex + 1];
        const itemWidth = currentItem.getBoundingClientRect().width;

        const style = getComputedStyle(track);
        const m = new DOMMatrixReadOnly(style.transform === 'none' ? '' : style.transform);
        const currentTx = m.m41 || 0;

        track.style.transform = `translateX(${currentTx - itemWidth}px)`;
      }
    });
  }
}

function goToSlide(index) {
  const track = document.getElementById('mobile-category-track');
  if (!track || _mobileCount === 0) return;
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
