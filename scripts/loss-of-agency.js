// loss-of-agency.js
// Displays flowers for the "Loss of Agency" category with custom positioning

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

  // Custom positioning for Loss of Agency - scattered around center
  categoryFlowers.forEach((flowerData, index) => {
    // Create flower element using existing renderer
    const flowerElement = FlowerRenderer.createFlower(flowerData, 0, 0);
    flowerElement.classList.add('flower');

    // Custom positioning algorithm - spiral pattern with randomness
    const angle = (index * 137.5) * (Math.PI / 180); // Golden angle for natural distribution
    const radius = 50 + (index * 30); // Increasing distance from center
    const randomOffset = 20; // Add some randomness

    let x = centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * randomOffset;
    let y = centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * randomOffset;

    // Keep within container bounds
    x = Math.max(50, Math.min(containerRect.width - 50, x));
    y = Math.max(50, Math.min(containerRect.height - 50, y));

    // Position the flower
    flowerElement.style.position = 'absolute';
    flowerElement.style.left = x + 'px';
    flowerElement.style.top = y + 'px';
    flowerElement.style.transform = 'translate(-50%, -50%)'; // Center the flower on its position

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