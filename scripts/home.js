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
    const el = FlowerRenderer.createFlower(flower, 0, 0);
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

// 6-col map (staggered: 3 on top, 4 offset on bottom)
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
function createHomePage(flowers) {
  _flowers = flowers;
  renderThemes(_flowers);

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
