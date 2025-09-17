console.log("Home page loading...");

// Group flowers by category
function groupFlowersByCategory(flowers) {
    return flowers.reduce((groups, flower) => {
        const category = flower.category;
        if (!groups[category]) {
            groups[category] = [];
        }
        groups[category].push(flower);
        return groups;
    }, {});
}

// Create small flowers for category clusters
function createSmallFlower(flowerData, x, y) {
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = x + 'px';
    container.style.top = y + 'px';
    container.style.cursor = 'pointer';
    
    // Create smaller SVG
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "80");
    svg.setAttribute("height", "80");
    
    const centerX = 40;
    const centerY = 40;
    const maxRadius = 30;
    
    function getCoordinates(angle, length) {
        const radians = (angle - 90) * Math.PI / 180;
        return {
            x: centerX + length * Math.cos(radians),
            y: centerY + length * Math.sin(radians)
        };
    }
    
    // Draw center dot
    const center = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    center.setAttribute("cx", centerX);
    center.setAttribute("cy", centerY);
    center.setAttribute("r", "2");
    center.setAttribute("fill", "#333");
    svg.appendChild(center);
    
    // Draw petals
    Object.keys(flowerData.emotions).forEach(emotion => {
        const length = (flowerData.emotions[emotion] / 100) * maxRadius;
        const angle = emotionAngles[emotion];
        const end = getCoordinates(angle, length);
        
        const petal = document.createElementNS("http://www.w3.org/2000/svg", "line");
        petal.setAttribute("x1", centerX);
        petal.setAttribute("y1", centerY);
        petal.setAttribute("x2", end.x);
        petal.setAttribute("y2", end.y);
        petal.setAttribute("stroke", emotionColors[emotion]);
        petal.setAttribute("stroke-width", "3");
        
        svg.appendChild(petal);
    });
    
    container.appendChild(svg);
    document.body.appendChild(container);
    
    return container;
}

// Create category cluster
function createCategoryCluster(categoryName, flowers, centerX, centerY) {
    // Create category label in the center
    const label = document.createElement('div');
    label.style.position = 'absolute';
    label.style.left = centerX - 60 + 'px';
    label.style.top = centerY - 10 + 'px'; // Center the text vertically
    label.style.width = '120px';
    label.style.textAlign = 'center';
    label.style.fontSize = '14px';
    label.style.fontFamily = 'Arial, sans-serif';
    label.textContent = categoryName;
    document.body.appendChild(label);
    
    // Arrange flowers in a circle around the text
    const maxFlowers = Math.min(flowers.length, 12); // Show up to 12 flowers
    const radius = 80; // Distance from center text
    
    flowers.slice(0, maxFlowers).forEach((flower, index) => {
        // Evenly distribute flowers around the circle
        const angle = (index / maxFlowers) * 2 * Math.PI;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        createSmallFlower(flower, x, y);
    });
}

// Create home page layout
function createHomePage(flowers) {
    const categories = groupFlowersByCategory(flowers);
    
    // Define grid positions for categories (like your Figma design)
    const categoryPositions = {
        "Perpetual Looping": { x: 200, y: 180 },
        "Loss of Agency": { x: 500, y: 180 },
        "Sensory Overwhelm": { x: 800, y: 180 },
        "Emotional Dysregulation": { x: 200, y: 380 },
        "Perceptual Barriers": { x: 500, y: 380 },
        "Thought Entanglement": { x: 800, y: 380 },
        "Temporal Disconnection": { x: 1100, y: 380 }
    };
    
    // Create clusters for each category
    Object.keys(categoryPositions).forEach(categoryName => {
        if (categories[categoryName] && categories[categoryName].length > 0) {
            const pos = categoryPositions[categoryName];
            createCategoryCluster(categoryName, categories[categoryName], pos.x, pos.y);
        }
    });
}

// Load data and create home page
fetch('../data.json')
    .then(response => response.json())
    .then(rawData => {
        const flowers = parseFlowerData(rawData);
        console.log("Home page loaded", flowers.length, "flowers");
        console.log("Categories found:", Object.keys(groupFlowersByCategory(flowers)));
        
        createHomePage(flowers);
    })
    .catch(error => {
        console.error("Error loading data:", error);
    });