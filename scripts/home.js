// home.js
console.log("Home page loading...");

function groupFlowersByCategory(flowers) {
  return flowers.reduce((groups, flower) => {
    (groups[flower.category] ||= []).push(flower);
    return groups;
  }, {});
}

// Create ONE category cell and place it into the grid at a specific col/row
function createCategoryCluster(categoryName, flowers, parentGrid, colStart, row) {
    const cell = document.createElement('div');
    cell.className = 'category-cell';
  
    // ⬇️ precise grid placement: start column + span 2, and the row
    cell.style.gridColumn = `${colStart} / span 2`;
    cell.style.gridRow = `${row}`;
  
    const label = document.createElement('div');
    label.className = 'category-label';
    label.textContent = categoryName;
    cell.appendChild(label);
  
    // Arrange mini-flowers within the cell (ring layout)
    const maxFlowers = Math.min(flowers.length, 25);
    const centerX = 160;  // center of cell width (320px)
    const centerY = 110;  // center of cell height (220px)
    const radius  = 80;
  
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
  
  function createHomePage(flowers) {
    const categories = groupFlowersByCategory(flowers);
    const grid = document.getElementById('category-grid');
  
    // 🔧 Your requested layout (8 columns, span 2 each)
    // Row 1: start at columns 2, 4, 6
    // Row 2: start at columns 1, 3, 5, 7
    const layout = [
      { name: "Perpetual Looping",     colStart: 2, row: 1 },
      { name: "Loss of Agency",        colStart: 4, row: 1 },
      { name: "Sensory Overwhelm",     colStart: 6, row: 1 },
      { name: "Emotional Dysregulation", colStart: 1, row: 2 },
      { name: "Perceptual Barriers",   colStart: 3, row: 2 },
      { name: "Thought Entanglement",  colStart: 5, row: 2 },
      { name: "Temporal Disconnection",colStart: 7, row: 2 },
    ];
  
    layout.forEach(({ name, colStart, row }) => {
      const list = categories[name];
      if (list && list.length) {
        createCategoryCluster(name, list, grid, colStart, row);
      }
    });
  
    // Ensure Reflections is below (in case HTML order ever changes)
    const themes = document.getElementById('themes');
    const reflections = document.getElementById('reflections');
    if (themes && reflections) themes.insertAdjacentElement('afterend', reflections);
  }
  

// Load data and init page
fetch('../data.json')
  .then(r => r.json())
  .then(rawData => {
    const flowers = parseFlowerData(rawData);
    console.log("Home page loaded", flowers.length, "flowers");
    console.log("Categories found:", Object.keys(groupFlowersByCategory(flowers)));

    createHomePage(flowers);

    // ✅ initialize Shuffle + Modal with parsed flowers
    if (window.Shuffle) Shuffle.init(flowers);
    if (window.Modal) Modal.init(flowers);
  })
  .catch(err => console.error("Error loading data:", err));

