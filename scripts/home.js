// home.js
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

function createCategoryCluster(categoryName, flowers, parentGrid, colStart, row) {
  const cell = document.createElement('div');
  cell.className = 'category-cell';
  cell.style.gridColumn = `${colStart} / span 2`;
  cell.style.gridRow = `${row}`;

  const label = document.createElement('div');
  label.className = 'category-label';
  label.innerHTML = categoryName.replace(/ (?=[^ ]*$)/, "<br>");
  cell.appendChild(label);

  // draw ring (fixed size — we do NOT scale)
  const maxFlowers = Math.min(flowers.length, 25);
  const centerX = 144;  // half of 288 (new cell width)
  const centerY = 99;   // half of 198 (new cell height)
  const radius  = 75;   // slightly reduced radius to fit new cell size

  flowers.slice(0, maxFlowers).forEach((flower, i) => {
    const angle = (i / maxFlowers) * 2 * Math.PI;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    const el = FlowerRenderer.createFlower(flower, 0, 0);
    el.classList.add('flower');
    el.style.left = (x - 40) + 'px';
    el.style.top  = (y - 40) + 'px';
    cell.appendChild(el);
  });

  parentGrid.appendChild(cell);
}

// ---------- layout maps ----------
const LAYOUT_8 = [
  { name: "Perpetual Looping",          colStart: 2, row: 1 },
  { name: "Loss of Agency",             colStart: 4, row: 1 },
  { name: "Sensory Overwhelm",          colStart: 6, row: 1 },
  { name: "Emotional Dysregulation",    colStart: 1, row: 2 },
  { name: "Perceptual Barriers",        colStart: 3, row: 2 },
  { name: "Thought Entanglement",       colStart: 5, row: 2 },
  { name: "Temporal Disconnection",     colStart: 7, row: 2 },
];

const LAYOUT_6 = [
  { name: "Perpetual Looping",          colStart: 1, row: 1 },
  { name: "Loss of Agency",             colStart: 3, row: 1 },
  { name: "Sensory Overwhelm",          colStart: 5, row: 1 },
  { name: "Emotional Dysregulation",    colStart: 0, row: 2 },
  { name: "Perceptual Barriers",        colStart: 2, row: 2 },
  { name: "Thought Entanglement",       colStart: 4, row: 2 },
  { name: "Temporal Disconnection",     colStart: 6, row: 2 },
];

const LAYOUT_4 = [
  { name: "Perpetual Looping",          colStart: 1, row: 1 },
  { name: "Loss of Agency",             colStart: 2, row: 1 },
  { name: "Sensory Overwhelm",          colStart: 3, row: 1 },
  { name: "Emotional Dysregulation",    colStart: 0.5, row: 2 },
  { name: "Perceptual Barriers",        colStart: 1.5, row: 2 },
  { name: "Thought Entanglement",       colStart: 2.5, row: 2 },
  { name: "Temporal Disconnection",     colStart: 3.5, row: 2 },
];

// Single source of truth for mobile order & labels
const CATEGORY_ORDER = [
  "Perpetual Looping",
  "Loss of Agency",
  "Sensory Overwhelm",
  "Emotional Dysregulation",
  "Perceptual Barriers",
  "Thought Entanglement",
  "Temporal Disconnection"
];

// ---------- desktop grid ----------
function getColsFromCSS() {
  const grid = document.getElementById('category-grid');
  const styles = getComputedStyle(grid);
  const cols = parseInt(styles.getPropertyValue('--cols') || '8', 10);
  return Number.isFinite(cols) ? cols : 8;
}

function pickLayout() {
  const cols = getColsFromCSS();
  if (cols >= 8) return LAYOUT_8;
  if (cols >= 6) return LAYOUT_6;
  return LAYOUT_4;
}

function renderThemes(flowers) {
  const categories = groupFlowersByCategory(flowers);
  const grid = document.getElementById('category-grid');
  grid.innerHTML = '';

  pickLayout().forEach(({ name, colStart, row }) => {
    const list = categories[name];
    if (list && list.length) createCategoryCluster(name, list, grid, colStart, row);
  });
}

// ---------- mobile carousel ----------
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

  // current translateX so we can adjust relatively
  const style = getComputedStyle(track);
  const m = new DOMMatrixReadOnly(style.transform === 'none' ? '' : style.transform);
  const currentTx = m.m41 || 0;

  // centers in viewport coordinates (robust with negative margins, scaling, etc.)
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
      // moved to trailing cloneFirst -> snap to REAL first
      currentMobileIndex = 0;
      snapToDomIndex(currentMobileIndex + 1); // real first is at DOM index 1
    } else if (_pendingSnap.to === 'tail') {
      // moved to leading cloneLast -> snap to REAL last
      currentMobileIndex = _mobileCount - 1;
      snapToDomIndex(currentMobileIndex + 1); // real last is at DOM index _mobileCount
    }

    // force reflow, then restore transition
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

    // refresh active classes & dots
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
        // wrap left: animate one item width to the left, then snap to real last
        _pendingSnap = { to: 'tail' };
        const items = track.children;

        // Get current item width for consistent animation distance
        const currentItem = items[currentMobileIndex + 1]; // +1 for leading clone
        const itemWidth = currentItem.getBoundingClientRect().width;

        const style = getComputedStyle(track);
        const m = new DOMMatrixReadOnly(style.transform === 'none' ? '' : style.transform);
        const currentTx = m.m41 || 0;

        // Move left by one item width
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
        // wrap right: animate one item width to the right, then snap to real first
        _pendingSnap = { to: 'head' };
        const items = track.children;

        // Get current item width for consistent animation distance
        const currentItem = items[currentMobileIndex + 1]; // +1 for leading clone
        const itemWidth = currentItem.getBoundingClientRect().width;

        const style = getComputedStyle(track);
        const m = new DOMMatrixReadOnly(style.transform === 'none' ? '' : style.transform);
        const currentTx = m.m41 || 0;

        // Move right by one item width
        track.style.transform = `translateX(${currentTx - itemWidth}px)`;
      }
    });
  }

  // (Optional) keyboard: keep as you had, or mirror wrap logic if you want keys infinite too
}

function goToSlide(index) {
  const track = document.getElementById('mobile-category-track');
  if (!track || _mobileCount === 0) return;
  // clamp to REAL range (dots always map to real indices)
  currentMobileIndex = ((index % _mobileCount) + _mobileCount) % _mobileCount;
  updateCarousel();
}

// ---------- bootstrap ----------
function createHomePage(flowers) {
  _flowers = flowers;
  renderThemes(_flowers);
  renderMobileThemes(_flowers);
  initMobileCarousel();

  // keep Reflections after Themes
  const themes = document.getElementById('themes');
  const reflections = document.getElementById('reflections');
  if (themes && reflections) themes.insertAdjacentElement('afterend', reflections);
}

// re-render (debounced) and keep mobile centered on resize
let _t;
window.addEventListener('resize', () => {
  clearTimeout(_t);
  _t = setTimeout(() => {
    renderThemes(_flowers);
    updateCarousel(); // keep the active mobile item centered after a resize
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
