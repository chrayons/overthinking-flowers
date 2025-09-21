// sensory-overwhelm.js
console.log("Sensory Overwhelm page loading...");

function createSensoryOverwhelmLayout(flowers) {
  const container = document.getElementById('flower-container');
  if (!container) return;

  const categoryFlowers = flowers.filter(flower => flower.category === "Sensory Overwhelm");
  container.innerHTML = '';

  const containerRect = container.getBoundingClientRect();
  const centerX = containerRect.width / 2;
  const centerY = containerRect.height / 2;

  // Dense overwhelming pattern around center
  categoryFlowers.forEach((flowerData, index) => {
    const flowerElement = FlowerRenderer.createFlower(flowerData, 0, 0);
    flowerElement.classList.add('flower');

    const maxDistance = Math.min(containerRect.width, containerRect.height) / 3;
    const distance = Math.random() * maxDistance;
    const angle = Math.random() * 2 * Math.PI;

    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;

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
    createSensoryOverwhelmLayout(flowers);
    if (window.Modal) Modal.init(flowers);
  })
  .catch(err => console.error("Error loading data:", err));