// home.js
console.log("Home page loading...");

// ---------- helpers ----------
function groupFlowersByCategory(flowers) {
  return flowers.reduce((groups, flower) => {
    (groups[flower.category] ||= []).push(flower);
    return groups;
  }, {});
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

// Single source of truth for the mobile order & label mapping
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
let currentMobileIndex = 0;

function renderMobileThemes(flowers) {
  const categories = groupFlowersByCategory(flowers);
  const track = document.getElementById('mobile-category-track');
  const dotsContainer = document.getElementById('carousel-dots');
  if (!track || !dotsContainer) return;

  track.innerHTML = '';
  dotsContainer.innerHTML = '';

  CATEGORY_ORDER.forEach((name, index) => {
    const list = categories[name];
    if (!list || !list.length) return;

    const item = document.createElement('div');
    item.className = 'mobile-category-item';
    item.dataset.index = index;

    const label = document.createElement('div');
    label.className = 'category-label';
    label.innerHTML = name.replace(/ (?=[^ ]*$)/, "<br>");
    item.appendChild(label);

    track.appendChild(item);

    const dot = document.createElement('div');
    dot.className = 'dot';
    dot.dataset.index = index;
    dot.addEventListener('click', () => goToSlide(index));
    dotsContainer.appendChild(dot);
  });

  // Default to "Emotional Dysregulation" centered, if present
  const initial = Math.max(
    0,
    Math.min(
      CATEGORY_ORDER.indexOf("Emotional Dysregulation"),
      track.children.length - 1
    )
  );
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
  if (!totalItems) return;

  // 1) Set active class
  Array.from(items).forEach((item, index) => {
    item.classList.toggle('active', index === currentMobileIndex);
  });

  // 2) Center the active item using rects (robust with big negative margins/overlaps)
  const activeEl = items[currentMobileIndex];

  // current translateX so we can adjust relative to it
  const style = getComputedStyle(track);
  const m = new DOMMatrixReadOnly(style.transform === 'none' ? '' : style.transform);
  const currentTx = m.m41 || 0;

  // centers in viewport coordinates
  const containerRect = container.getBoundingClientRect();
  const activeRect    = activeEl.getBoundingClientRect();
  const containerCenter = containerRect.left + containerRect.width / 2;
  const activeCenter    = activeRect.left    + activeRect.width  / 2;

  // move by exactly the delta so active center lines up with container center
  const delta = containerCenter - activeCenter;
  const nextTx = currentTx + delta;
  track.style.transform = `translateX(${nextTx}px)`;

  // 3) Dots + buttons
  dots.forEach((dot, i) => dot.classList.toggle('active', i === currentMobileIndex));
  prevBtn.disabled = currentMobileIndex === 0;
  nextBtn.disabled = currentMobileIndex === totalItems - 1;

  // 4) Update the CTA’s category
  const seeReflectionsBtn = document.getElementById('mobile-see-reflections-btn');
  if (seeReflectionsBtn) {
    const CATEGORY_ORDER = [
      "Perpetual Looping",
      "Loss of Agency",
      "Sensory Overwhelm",
      "Emotional Dysregulation",
      "Perceptual Barriers",
      "Thought Entanglement",
      "Temporal Disconnection"
    ];
    seeReflectionsBtn.dataset.category = CATEGORY_ORDER[currentMobileIndex] || '';
  }
}


function initMobileCarousel() {
  const prevBtn = document.querySelector('.carousel-prev');
  const nextBtn = document.querySelector('.carousel-next');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentMobileIndex > 0) {
        currentMobileIndex--;
        updateCarousel();
      }
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const track = document.getElementById('mobile-category-track');
      if (track && currentMobileIndex < track.children.length - 1) {
        currentMobileIndex++;
        updateCarousel();
      }
    });
  }

  const seeReflectionsBtn = document.getElementById('mobile-see-reflections-btn');
  if (seeReflectionsBtn) {
    seeReflectionsBtn.addEventListener('click', (e) => {
      const categoryName = e.currentTarget.dataset.category;
      if (categoryName) {
        const categorySlug = categoryName.toLowerCase().replace(/\s+/g, '-');
        window.location.href = `${categorySlug}.html`;
      }
    });
  }

  // Optional keyboard navigation (active only when mobile section is visible)
  document.addEventListener('keydown', (e) => {
    const mobileSection = document.getElementById('themes-mobile');
    if (!mobileSection || getComputedStyle(mobileSection).display === 'none') return;

    if (e.key === 'ArrowLeft' && currentMobileIndex > 0) {
      currentMobileIndex--;
      updateCarousel();
    } else if (e.key === 'ArrowRight') {
      const track = document.getElementById('mobile-category-track');
      if (track && currentMobileIndex < track.children.length - 1) {
        currentMobileIndex++;
        updateCarousel();
      }
    }
  });
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
