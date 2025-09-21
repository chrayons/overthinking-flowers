// emotional-dysregulation.js
// Displays flowers for the "Emotional Dysregulation" category with chaotic positioning

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

  // Chaotic cluster positioning to represent emotional dysregulation
  categoryFlowers.forEach((flowerData, index) => {
    const flowerElement = FlowerRenderer.createFlower(flowerData, 0, 0);
    flowerElement.classList.add('flower');

    // Chaotic positioning - multiple clusters with high randomness
    const clusterIndex = index % 3; // 3 clusters
    const clusterAngles = [30, 150, 270]; // Spread clusters around
    const baseAngle = clusterAngles[clusterIndex] * (Math.PI / 180);
    const clusterRadius = 80 + Math.random() * 100;

    let x = centerX + Math.cos(baseAngle) * clusterRadius + (Math.random() - 0.5) * 120;
    let y = centerY + Math.sin(baseAngle) * clusterRadius + (Math.random() - 0.5) * 120;

    x = Math.max(50, Math.min(containerRect.width - 50, x));
    y = Math.max(50, Math.min(containerRect.height - 50, y));

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