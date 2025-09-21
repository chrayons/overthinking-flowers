// temporal-disconnection.js
console.log("Temporal Disconnection page loading...");

function createTemporalDisconnectionLayout(flowers) {
  const container = document.getElementById('flower-container');
  if (!container) return;

  const categoryFlowers = flowers.filter(flower => flower.category === "Temporal Disconnection");
  container.innerHTML = '';

  const containerRect = container.getBoundingClientRect();

  // Scattered timeline with disconnected gaps
  categoryFlowers.forEach((flowerData, index) => {
    const flowerElement = FlowerRenderer.createFlower(flowerData, 0, 0);
    flowerElement.classList.add('flower');

    const timelineProgress = index / Math.max(categoryFlowers.length - 1, 1);
    const baseX = 100 + timelineProgress * (containerRect.width - 200);
    const baseY = 100 + timelineProgress * (containerRect.height - 200);

    // Add disconnection gaps
    const gapOffset = Math.sin(index * 2) * 60;
    const x = baseX + gapOffset + (Math.random() - 0.5) * 30;
    const y = baseY + (Math.random() - 0.5) * 50;

    flowerElement.style.position = 'absolute';
    flowerElement.style.left = Math.max(50, Math.min(containerRect.width - 50, x)) + 'px';
    flowerElement.style.top = Math.max(50, Math.min(containerRect.height - 50, y)) + 'px';
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
    createTemporalDisconnectionLayout(flowers);
    if (window.Modal) Modal.init(flowers);
  })
  .catch(err => console.error("Error loading data:", err));