// perceptual-barriers.js
console.log("Perceptual Barriers page loading...");

function createPerceptualBarriersLayout(flowers) {
  const container = document.getElementById('flower-container');
  if (!container) return;

  const categoryFlowers = flowers.filter(flower => flower.category === "Perceptual Barriers");
  container.innerHTML = '';

  const containerRect = container.getBoundingClientRect();
  const centerY = containerRect.height / 2;

  // Linear barrier pattern - two parallel lines
  categoryFlowers.forEach((flowerData, index) => {
    const flowerElement = FlowerRenderer.createFlower(flowerData, 0, 0);
    flowerElement.classList.add('flower');

    const lineIndex = index % 2;
    const offsetY = (lineIndex - 0.5) * 100;
    const x = (containerRect.width / (categoryFlowers.length + 1)) * (index + 1);
    const y = centerY + offsetY + (Math.random() - 0.5) * 40;

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
    createPerceptualBarriersLayout(flowers);
    if (window.Modal) Modal.init(flowers);
  })
  .catch(err => console.error("Error loading data:", err));