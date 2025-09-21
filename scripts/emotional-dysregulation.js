// emotional-dysregulation.js
// Displays flowers for the "Emotional Dysregulation" category with golden spiral positioning

console.log("Emotional Dysregulation page loading...");

function createEmotionalDysregulationLayout(flowers) {
  const container = document.getElementById('flower-container');
  if (!container) return;

  const categoryFlowers = flowers.filter(flower => flower.category === "Emotional Dysregulation");
  console.log(`Found ${categoryFlowers.length} flowers for Emotional Dysregulation`);

  container.innerHTML = '';

  const containerRect = container.getBoundingClientRect();
  const centerX = containerRect.width / 2;
  const centerY = containerRect.height / 2;

  // Golden spiral positioning (tighter spiral for emotional dysregulation) with full container spread
  const GOLDEN = 137.50776405 * (Math.PI / 180);
  const aBase = Math.min(containerRect.width, containerRect.height) * 0.35; // Tighter for emotional effect
  const bBase = 0.6 * aBase;
  const placedFlowers = [];
  const flowerSize = 350;

  categoryFlowers.forEach((flowerData, index) => {
    const flowerElement = FlowerRenderer.createFlower(flowerData, {
      width: 350,
      height: 350,
      maxRadius: 160
    });
    flowerElement.classList.add('flower');

    let attempts = 0;
    let x, y;
    let validPosition = false;

    while (!validPosition && attempts < 50) {
      let theta = ((index + attempts * 0.1) * GOLDEN) % (Math.PI * 2);
      const aWarp = aBase * (1 + 0.2 * Math.cos(2 * theta));
      const bWarp = bBase * (1 + 0.5 * Math.sin(4 * theta));

      x = centerX + aWarp * Math.cos(theta);
      y = centerY + bWarp * Math.sin(theta);

      validPosition = true;
      for (const placedFlower of placedFlowers) {
        const distance = Math.sqrt((x - placedFlower.x) ** 2 + (y - placedFlower.y) ** 2);
        if (distance < flowerSize * 0.8) {
          validPosition = false;
          break;
        }
      }
      attempts++;
    }

    placedFlowers.push({ x, y });

    flowerElement.style.position = 'absolute';
    flowerElement.style.left = x + 'px';
    flowerElement.style.top = y + 'px';
    flowerElement.style.transform = 'translate(-50%, -50%)';

    if (window.FlowerInteractions) {
      FlowerInteractions.addBehavior(flowerElement, flowerData);
    }

    container.appendChild(flowerElement);
  });
}

fetch('../data.json')
  .then(r => r.json())
  .then(rawData => {
    const flowers = parseFlowerData(rawData);
    createEmotionalDysregulationLayout(flowers);
    if (window.Modal) Modal.init(flowers);
  })
  .catch(err => console.error("Error loading data for Emotional Dysregulation:", err));