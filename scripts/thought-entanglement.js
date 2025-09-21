// thought-entanglement.js
console.log("Thought Entanglement page loading...");

function createThoughtEntanglementLayout(flowers) {
  const container = document.getElementById('flower-container');
  if (!container) return;

  const categoryFlowers = flowers.filter(flower => flower.category === "Thought Entanglement");
  container.innerHTML = '';

  const containerRect = container.getBoundingClientRect();
  const centerX = containerRect.width / 2;
  const centerY = containerRect.height / 2;

  // Web-like interconnected pattern
  categoryFlowers.forEach((flowerData, index) => {
    const flowerElement = FlowerRenderer.createFlower(flowerData, 0, 0);
    flowerElement.classList.add('flower');

    const ringRadius = 60 + (index % 3) * 40;
    const angleStep = (2 * Math.PI) / Math.max(6, Math.ceil(categoryFlowers.length / 3));
    const angle = (index * angleStep) + (Math.random() - 0.5) * 0.3;

    const x = centerX + Math.cos(angle) * ringRadius;
    const y = centerY + Math.sin(angle) * ringRadius;

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
    createThoughtEntanglementLayout(flowers);
    if (window.Modal) Modal.init(flowers);
  })
  .catch(err => console.error("Error loading data:", err));