// home.js
console.log("Home page loading...");

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
  let displayName = categoryName.replace(/ (?=[^ ]*$)/, "<br>");
  label.innerHTML = displayName;
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
    const el = FlowerRenderer.createFlower(flower);
    el.classList.add('flower');
    el.style.left = (x - 40) + 'px';
    el.style.top  = (y - 40) + 'px';
    cell.appendChild(el);
  });

  parentGrid.appendChild(cell);
}

// 8-col map (centered layout)
const LAYOUT_8 = [
  { name: "Perpetual Looping",          colStart: 2, row: 1 },
  { name: "Loss of Agency",             colStart: 4, row: 1 },
  { name: "Sensory Overwhelm",          colStart: 6, row: 1 },
  { name: "Emotional Dysregulation",    colStart: 1, row: 2 },
  { name: "Perceptual Barriers",        colStart: 3, row: 2 },
  { name: "Thought Entanglement",       colStart: 5, row: 2 },
  { name: "Temporal Disconnection",     colStart: 7, row: 2 },
];

// 6-col map (staggered: 3 on top, 4 equally spaced on bottom)
const LAYOUT_6 = [
  { name: "Perpetual Looping",          colStart: 1, row: 1 },
  { name: "Loss of Agency",             colStart: 3, row: 1 },
  { name: "Sensory Overwhelm",          colStart: 5, row: 1 },

  { name: "Emotional Dysregulation",    colStart: 0, row: 2 },
  { name: "Perceptual Barriers",        colStart: 2, row: 2 },
  { name: "Thought Entanglement",       colStart: 4, row: 2 },
  { name: "Temporal Disconnection",     colStart: 6, row: 2 },
];

// 4-col map (staggered: 3 centered on top, 4 offset on bottom)
const LAYOUT_4 = [
  { name: "Perpetual Looping",          colStart: 1, row: 1 },
  { name: "Loss of Agency",             colStart: 2, row: 1 },
  { name: "Sensory Overwhelm",          colStart: 3, row: 1 },

  { name: "Emotional Dysregulation",    colStart: 0.5, row: 2 },
  { name: "Perceptual Barriers",        colStart: 1.5, row: 2 },
  { name: "Thought Entanglement",       colStart: 2.5, row: 2 },
  { name: "Temporal Disconnection",     colStart: 3.5, row: 2 },
];

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

let _flowers = [];
let currentMobileIndex = 0;

// ENHANCED MOBILE CAROUSEL FUNCTIONS (UPDATED)
function renderMobileThemes(flowers) {
  const track = document.getElementById('mobile-category-track');
  const dotsContainer = document.getElementById('carousel-dots');

  if (!track || !dotsContainer) {
    console.error('Mobile carousel elements not found');
    return;
  }

  // Clear existing content
  track.innerHTML = '';
  dotsContainer.innerHTML = '';

  const categoryNames = [
    "Perpetual Looping", "Loss of Agency", "Sensory Overwhelm",
    "Emotional Dysregulation", "Perceptual Barriers",
    "Thought Entanglement", "Temporal Disconnection"
  ];

  // Create items with simple structure
  categoryNames.forEach((name, index) => {
    // Create category item
    const item = document.createElement('div');
    item.className = 'mobile-category-item';

    const label = document.createElement('div');
    label.className = 'category-label';
    label.textContent = name;

    item.appendChild(label);
    track.appendChild(item);

    // Create dot
    const dot = document.createElement('div');
    dot.className = 'dot';
    dot.addEventListener('click', () => goToSlide(index));
    dotsContainer.appendChild(dot);
  });

  console.log('Created', track.children.length, 'items');
  currentMobileIndex = 0;
  updateCarousel();
}

function updateCarousel() {
  const track = document.getElementById('mobile-category-track');
  const dots = document.querySelectorAll('.dot');

  console.log('=== UPDATE CAROUSEL ===');
  console.log('currentMobileIndex:', currentMobileIndex);

  if (!track) {
    console.error('Track not found');
    return;
  }

  const items = Array.from(track.children);
  console.log('Found items:', items.length);

  // Validate currentMobileIndex
  if (currentMobileIndex < 0 || currentMobileIndex >= items.length) {
    console.error('Invalid currentMobileIndex:', currentMobileIndex);
    currentMobileIndex = 0;
  }

  // Center the active item: move track so active item is in viewport center
  const containerWidth = track.parentElement.offsetWidth;
  const itemWidth = 300;
  const centerOffset = (containerWidth / 2) - (itemWidth / 2);
  const translateX = centerOffset - (currentMobileIndex * itemWidth);

  console.log(`Container: ${containerWidth}px, centering item ${currentMobileIndex}`);
  console.log(`TranslateX: ${translateX}px`);
  track.style.transform = `translateX(${translateX}px)`;

  // Update active states and visibility
  items.forEach((item, index) => {
    // Calculate relative position to current active item (with circular wrapping)
    let relativePos = index - currentMobileIndex;
    const totalItems = items.length;

    // Handle circular wrapping
    if (relativePos > totalItems / 2) relativePos -= totalItems;
    if (relativePos < -totalItems / 2) relativePos += totalItems;

    const isActive = index === currentMobileIndex;
    const isVisible = Math.abs(relativePos) <= 1; // Show center + immediate neighbors only

    console.log(`Item ${index}: relativePos=${relativePos}, active=${isActive}, visible=${isVisible}`);

    // Clear all classes and add fresh
    item.className = 'mobile-category-item';
    if (isActive) {
      item.classList.add('active');
    }

    // Show/hide based on position
    item.style.visibility = isVisible ? 'visible' : 'hidden';
    item.style.opacity = isVisible ? '1' : '0';

    // Style the label
    const label = item.querySelector('.category-label');
    if (label) {
      if (isActive) {
        // Center item: large and clear
        label.style.fontSize = '48px';
        label.style.color = '#101720';
        label.style.filter = 'blur(0px)';
        label.style.background = 'lightgreen';
        label.style.border = '3px solid red';
      } else if (isVisible) {
        // Side items: small and blurred
        label.style.fontSize = '20px';
        label.style.color = '#AFBCC7';
        label.style.filter = 'blur(4px)';
        label.style.background = 'lightblue';
        label.style.border = '1px solid blue';
      }
    }
  });

  // Update dots
  dots.forEach((dot, index) => {
    dot.classList.toggle('active', index === currentMobileIndex);
  });

  console.log('=== END UPDATE ===');
}

function goToSlide(index) {
  const track = document.getElementById('mobile-category-track');
  if (!track) return;

  const totalItems = track.children.length;
  if (index >= 0 && index < totalItems) {
    currentMobileIndex = index;
    updateCarousel();
  }
}

function initMobileCarousel() {
  const prevBtn = document.querySelector('.carousel-prev');
  const nextBtn = document.querySelector('.carousel-next');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      const track = document.getElementById('mobile-category-track');
      if (track) {
        const totalItems = track.children.length;
        currentMobileIndex = (currentMobileIndex - 1 + totalItems) % totalItems;
        updateCarousel();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const track = document.getElementById('mobile-category-track');
      if (track) {
        const totalItems = track.children.length;
        currentMobileIndex = (currentMobileIndex + 1) % totalItems;
        updateCarousel();
      }
    });
  }

  // Add click listener for "See Reflections" button
  const seeReflectionsBtn = document.getElementById('mobile-see-reflections-btn');
  if (seeReflectionsBtn) {
    seeReflectionsBtn.addEventListener('click', (e) => {
      const categoryName = e.target.dataset.category;
      if (categoryName) {
        // Navigate to the category page
        const categorySlug = categoryName.toLowerCase().replace(/\s+/g, '-');
        window.location.href = `${categorySlug}.html`;
      }
    });
  }

  // Add keyboard navigation (optional enhancement)
  document.addEventListener('keydown', (e) => {
    // Only handle arrows when mobile carousel is visible
    const mobileSection = document.getElementById('themes-mobile');
    if (!mobileSection || getComputedStyle(mobileSection).display === 'none') return;

    if (e.key === 'ArrowLeft') {
      const track = document.getElementById('mobile-category-track');
      if (track) {
        const totalItems = track.children.length;
        currentMobileIndex = (currentMobileIndex - 1 + totalItems) % totalItems;
        updateCarousel();
      }
    } else if (e.key === 'ArrowRight') {
      const track = document.getElementById('mobile-category-track');
      if (track) {
        const totalItems = track.children.length;
        currentMobileIndex = (currentMobileIndex + 1) % totalItems;
        updateCarousel();
      }
    }
  });
}

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

// re-render when the breakpoint flips (debounced)
let _t;
window.addEventListener('resize', () => {
  clearTimeout(_t);
  _t = setTimeout(() => renderThemes(_flowers), 150);
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