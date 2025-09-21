// loss-of-agency.js
// Displays flowers for the "Loss of Agency" category with golden spiral positioning

console.log("Loss of Agency page loading...");

// Responsive positioning algorithm for Loss of Agency flowers
function createLossOfAgencyLayout(flowers) {
  const container = document.getElementById('flower-container');
  if (!container) return;

  // Filter flowers for this category
  const categoryFlowers = flowers.filter(flower => flower.category === "Loss of Agency");
  console.log(`Found ${categoryFlowers.length} flowers for Loss of Agency`);

  // Clear container
  container.innerHTML = '';

  // Use viewport dimensions for responsive positioning
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const centerX = 50; // Center as percentage
  const centerY = 50; // Center as percentage

  // Golden spiral positioning with controlled spread
  const GOLDEN = 137.50776405 * (Math.PI / 180);
  // Spiral sized to fill most of viewport while allowing some overflow
  const spiralBase = Math.min(viewportWidth, viewportHeight) * 0.0005; // Moderate spiral scale
  const aBase = spiralBase * Math.min(viewportWidth, viewportHeight);
  const bBase = 0.7 * aBase; // Balanced spread
  const placedFlowers = []; // Track placed flowers for collision detection

  // Dynamic flower sizing with wider range (80px-300px)
  const minFlowerSize = 80;
  const maxFlowerSize = 300;
  const baseFlowerSize = Math.max(minFlowerSize, Math.min(maxFlowerSize, viewportWidth * 0.12));

  categoryFlowers.forEach((flowerData, index) => {
    // Calculate emotional intensity for dynamic sizing using dominant emotion
    const dominantIntensity = Math.max(...Object.values(flowerData.emotions));
    const totalIntensity = Object.values(flowerData.emotions).reduce((sum, val) => sum + val, 0);

    // Use combination of dominant emotion and total intensity for size variation
    const combinedIntensity = (dominantIntensity * 0.7) + (totalIntensity / Object.keys(flowerData.emotions).length * 0.3);

    // Map intensity to full size range (80px-300px) with more dramatic variation
    const intensityFactor = Math.max(0.3, Math.min(1.0, combinedIntensity / 100)); // 30-100% range
    const flowerSize = minFlowerSize + (maxFlowerSize - minFlowerSize) * intensityFactor;

    // Create flower element with dynamic sizing
    const flowerElement = FlowerRenderer.createFlower(flowerData, {
      width: flowerSize,
      height: flowerSize,
      maxRadius: flowerSize * 0.45
    });
    flowerElement.classList.add('flower');

    let attempts = 0;
    let x, y;
    let validPosition = false;

    // Try to find non-overlapping position with improved spacing
    while (!validPosition && attempts < 50) {
      // Golden spiral positioning with responsive scaling
      let theta = ((index + attempts * 0.1) * GOLDEN) % (Math.PI * 2);
      const aWarp = aBase * (1 + 0.2 * Math.cos(2 * theta));
      const bWarp = bBase * (1 + 0.5 * Math.sin(4 * theta));

      // Calculate position as viewport percentages with extended range
      x = centerX + (aWarp * Math.cos(theta) / viewportWidth) * 100;
      y = centerY + (bWarp * Math.sin(theta) / viewportHeight) * 100;

      // Keep most flowers in viewport, allow only some to have partial overflow
      // Calculate flower radius as percentage of viewport for bounds checking
      const flowerRadiusVW = (flowerSize / 2 / viewportWidth) * 100;
      const flowerRadiusVH = (flowerSize / 2 / viewportHeight) * 100;

      // Allow 1/3 of flower to be off-screen at most
      const maxOverflow = Math.max(flowerRadiusVW, flowerRadiusVH) * 0.67; // 2/3 of flower radius

      x = Math.max(0 - maxOverflow, Math.min(100 + maxOverflow, x));
      y = Math.max(0 - maxOverflow, Math.min(100 + maxOverflow, y));

      // Check for collisions with existing flowers with adaptive spacing
      validPosition = true;
      for (const placedFlower of placedFlowers) {
        const distance = Math.sqrt((x - placedFlower.x) ** 2 + (y - placedFlower.y) ** 2);
        // Adaptive minimum distance based on flower sizes and viewport
        const avgSize = (flowerSize + placedFlower.size) / 2;
        const minDistance = (avgSize / Math.min(viewportWidth, viewportHeight)) * 25; // Better spacing calculation
        if (distance < minDistance) {
          validPosition = false;
          break;
        }
      }
      attempts++;
    }

    // Store position and size for future collision checks
    placedFlowers.push({ x, y, size: flowerSize });

    // Position the flower using percentage-based positioning
    flowerElement.style.position = 'absolute';
    flowerElement.style.left = x + 'vw';
    flowerElement.style.top = y + 'vh';
    flowerElement.style.transform = 'translate(-50%, -50%)';

    // Set responsive size
    flowerElement.style.width = flowerSize + 'px';
    flowerElement.style.height = flowerSize + 'px';

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

    // Debug: Check what's available
    console.log('Available window objects:', Object.keys(window).filter(k => k.includes('Modal') || k.includes('modal')));
    console.log('window.Modal:', window.Modal);

    // Initialize modal system FIRST
    if (window.Modal) {
      console.log('Initializing Modal with', flowers.length, 'flowers');
      Modal.init(flowers);
    } else {
      console.warn('Modal not available during initialization');
    }

    createLossOfAgencyLayout(flowers);

    // Add resize listener for responsive layout updates
    let resizeTimeout;
    window.addEventListener('resize', () => {
      // Debounce resize events to avoid excessive recalculations
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        console.log('Viewport resized, recalculating flower positions...');
        createLossOfAgencyLayout(flowers);
      }, 250);
    });
  })
  .catch(err => console.error("Error loading data for Loss of Agency:", err));