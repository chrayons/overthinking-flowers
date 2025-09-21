// perpetual-looping.js
console.log("Perpetual Looping page loading...");

function createPerpetualLoopingLayout(flowers) {
  const container = document.getElementById('flower-container');
  if (!container) return;

  const categoryFlowers = flowers.filter(flower => flower.category === "Perpetual Looping");
  container.innerHTML = '';

  const containerRect = container.getBoundingClientRect();
  const centerX = containerRect.width / 2;
  const centerY = containerRect.height / 2;

  // Perfect circle pattern representing endless loop
  categoryFlowers.forEach((flowerData, index) => {
    const flowerElement = FlowerRenderer.createFlower(flowerData, 0, 0);
    flowerElement.classList.add('flower');

    const angle = (index / categoryFlowers.length) * 2 * Math.PI;
    const radius = 120;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;

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
    createPerpetualLoopingLayout(flowers);
    if (window.Modal) Modal.init(flowers);
  })
  .catch(err => console.error("Error loading data:", err));