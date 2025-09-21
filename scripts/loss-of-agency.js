// loss-of-agency.js
// Displays flowers for the "Loss of Agency" category with golden spiral positioning

console.log("Loss of Agency page loading...");

// Custom positioning algorithm for Loss of Agency flowers
function createLossOfAgencyLayout(flowers) {
  const container = document.getElementById('flower-container');
  if (!container) return;

  // Filter flowers for this category
  const categoryFlowers = flowers.filter(flower => flower.category === "Loss of Agency");
  console.log(`Found ${categoryFlowers.length} flowers for Loss of Agency`);

  // Clear container
  container.innerHTML = '';

  // Get container dimensions for positioning
  const containerRect = container.getBoundingClientRect();
  const centerX = containerRect.width / 2;
  const centerY = containerRect.height / 2;

  // Golden spiral positioning with full container spread and collision detection
  const GOLDEN = 137.50776405 * (Math.PI / 180);
  const aBase = Math.min(containerRect.width, containerRect.height) * 0.4; // Use 40% of container size
  const bBase = 0.6 * aBase;
  const placedFlowers = []; // Track placed flowers for collision detection
  const flowerSize = 350; // Max flower size for collision detection

  categoryFlowers.forEach((flowerData, index) => {
    // Create flower element using existing renderer with larger size
    const flowerElement = FlowerRenderer.createFlower(flowerData, {
      width: 350,
      height: 350,
      maxRadius: 160
    });
    flowerElement.classList.add('flower');

    let attempts = 0;
    let x, y;
    let validPosition = false;

    // Try to find non-overlapping position
    while (!validPosition && attempts < 50) {
      // Golden spiral positioning with slight variation per attempt
      let theta = ((index + attempts * 0.1) * GOLDEN) % (Math.PI * 2);
      const aWarp = aBase * (1 + 0.2 * Math.cos(2 * theta));
      const bWarp = bBase * (1 + 0.5 * Math.sin(4 * theta));

      x = centerX + aWarp * Math.cos(theta);
      y = centerY + bWarp * Math.sin(theta);

      // Check for collisions with existing flowers
      validPosition = true;
      for (const placedFlower of placedFlowers) {
        const distance = Math.sqrt((x - placedFlower.x) ** 2 + (y - placedFlower.y) ** 2);
        if (distance < flowerSize * 0.8) { // 80% minimum distance for more spacing
          validPosition = false;
          break;
        }
      }
      attempts++;
    }

    // Store position for future collision checks
    placedFlowers.push({ x, y });

    // Position the flower (allow edge clipping)
    flowerElement.style.position = 'absolute';
    flowerElement.style.left = x + 'px';
    flowerElement.style.top = y + 'px';
    flowerElement.style.transform = 'translate(-50%, -50%)';

    // Add interactive behavior
    if (window.FlowerInteractions) {
      FlowerInteractions.addBehavior(flowerElement, flowerData);
    }

    // Add to container
    container.appendChild(flowerElement);
  });
}

// Load data and initialize page
fetch('../data.json')
  .then(r => r.json())
  .then(rawData => {
    const flowers = parseFlowerData(rawData);
    createLossOfAgencyLayout(flowers);

    // Initialize modal system
    if (window.Modal) {
      Modal.init(flowers);
    }
  })
  .catch(err => console.error("Error loading data for Loss of Agency:", err));