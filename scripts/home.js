console.log("Home page loading...");

// Define emotion categories
const neutralEmotions = ['anticipation', 'surprise'];
const positiveEmotions = ['trust', 'optimism', 'joy', 'love'];
const negativeEmotions = ['fear', 'disgust', 'anger', 'sadness', 'pessimism'];

// Your SVG petal paths
const neutralPetalPath = "M183.87,54.26C175.96,17.32,132.53,0,94.09,0c-0.44,0-0.89,0-1.34,0h0c-0.41,0-0.81,0-1.21,0C53.09,0,9.66,17.33,1.76,54.27c-7.15,24.44,9.04,51.95,21.73,72.44c23.05,37.19,48.72,79.4,69.32,116.28h0c20.6-36.88,46.27-79.09,69.32-116.29c12.7-20.49,28.89-48,21.73-72.44ZM159.03,120.64c-20.09,41.52-48.23,85.25-66.22,122.34c-17.99-37.09-46.13-80.82-66.22-122.33c-10.92-22.57-19.95-40.69-13.17-61.85C21.57,33.35,51.29,13.76,92.87,13.58h0c41.52,0.21,71.19,19.79,79.32,45.2c6.78,21.16-2.25,39.29-13.17,61.85Z";

const positivePetalPath = "M67.2,3.83C60.76,1.38,54.34.16,48.16.03h0c-.12-.01-.24,0-.36,0-.34,0-.68-.02-1.02-.02v.04c-6.18.14-12.59,1.36-19.03,3.8C-13.12,22.65.41,79.7,10.6,114.21c10.46,37.71,26.01,93.14,36.87,130.21-9.48-37.28-23.22-93.46-32.25-131.5C5.26,78.13-4.66,14.06,45.96,14.06c.41,0,2.73-.01,3.02-.01,50.62,0,40.7,64.06,30.74,98.85-9.03,38.04-22.77,94.22-32.25,131.5,10.86-37.07,26.41-92.5,36.87-130.21,10.19-34.51,23.72-91.56-17.15-110.37Z";

const negativePetalPath = "M75.33,47.23C73.95,17.52,57.68-.02,38.12,0h0c-.09,0-.18,0-.27,0-.12,0-.24,0-.35,0h0C17.92-.02,1.66,17.52.28,47.23c-1.53,23.42,3.44,45.78,8.18,67.04c8.26,37.79,20.75,93.19,29.35,130.24,0,0,0,.01,0,.02,0,0,0-.01,0-.02,0,0,0,.01,0,.02,0,0,0-.01,0-.02,8.59-37.06,21.08-92.46,29.35-130.24,4.73-21.27,9.71-43.62,8.18-67.04ZM37.8,244.51c-7.6-37.53-18.4-93.38-25.66-131.53C3.71,76.45.86,13.38,37.82,13.29c36.93.11,34.08,63.16,25.64,99.69-7.25,38.16-18.06,94.01-25.66,131.54Z";

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
    
    // Create gradient definitions for all petal types
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    
    // Neutral gradient (yellow)
    const neutralGradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
    neutralGradient.setAttribute("id", `neutral_gradient_${x}_${y}`);
    neutralGradient.setAttribute("x1", "92.81");
    neutralGradient.setAttribute("y1", "0");
    neutralGradient.setAttribute("x2", "92.81");
    neutralGradient.setAttribute("y2", "248.13");
    neutralGradient.setAttribute("gradientUnits", "userSpaceOnUse");
    
    const neutralStop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    neutralStop1.setAttribute("offset", "0");
    neutralStop1.setAttribute("stop-color", "#efe173");
    
    const neutralStop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    neutralStop2.setAttribute("offset", ".49");
    neutralStop2.setAttribute("stop-color", "#e9eab0");
    
    const neutralStop3 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    neutralStop3.setAttribute("offset", "1");
    neutralStop3.setAttribute("stop-color", "#f8fbf4");
    
    neutralGradient.appendChild(neutralStop1);
    neutralGradient.appendChild(neutralStop2);
    neutralGradient.appendChild(neutralStop3);
    defs.appendChild(neutralGradient);
    
    // Positive gradient (green)
    const positiveGradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
    positiveGradient.setAttribute("id", `positive_gradient_${x}_${y}`);
    positiveGradient.setAttribute("x1", "47.47");
    positiveGradient.setAttribute("y1", "0");
    positiveGradient.setAttribute("x2", "47.47");
    positiveGradient.setAttribute("y2", "249.59");
    positiveGradient.setAttribute("gradientUnits", "userSpaceOnUse");
    
    const positiveStop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    positiveStop1.setAttribute("offset", "0");
    positiveStop1.setAttribute("stop-color", "#7db056");
    
    const positiveStop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    positiveStop2.setAttribute("offset", ".49");
    positiveStop2.setAttribute("stop-color", "#a7c97b");
    
    const positiveStop3 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    positiveStop3.setAttribute("offset", "1");
    positiveStop3.setAttribute("stop-color", "#fff");
    
    positiveGradient.appendChild(positiveStop1);
    positiveGradient.appendChild(positiveStop2);
    positiveGradient.appendChild(positiveStop3);
    defs.appendChild(positiveGradient);
    
    // Negative gradient (blue)
    const negativeGradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
    negativeGradient.setAttribute("id", `negative_gradient_${x}_${y}`);
    negativeGradient.setAttribute("x1", "37.8");
    negativeGradient.setAttribute("y1", "0");
    negativeGradient.setAttribute("x2", "37.8");
    negativeGradient.setAttribute("y2", "249.71");
    negativeGradient.setAttribute("gradientUnits", "userSpaceOnUse");
    
    const negativeStop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    negativeStop1.setAttribute("offset", "0");
    negativeStop1.setAttribute("stop-color", "#366bb0");
    
    const negativeStop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    negativeStop2.setAttribute("offset", ".2");
    negativeStop2.setAttribute("stop-color", "#2e8ecc");
    
    const negativeStop3 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    negativeStop3.setAttribute("offset", ".56");
    negativeStop3.setAttribute("stop-color", "#7ec8ef");
    
    const negativeStop4 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    negativeStop4.setAttribute("offset", "1");
    negativeStop4.setAttribute("stop-color", "#c0e2f7");
    
    negativeGradient.appendChild(negativeStop1);
    negativeGradient.appendChild(negativeStop2);
    negativeGradient.appendChild(negativeStop3);
    negativeGradient.appendChild(negativeStop4);
    defs.appendChild(negativeGradient);
    
    svg.appendChild(defs);
    
    // Draw petals
    Object.keys(flowerData.emotions).forEach((emotion, index) => {
        const intensity = flowerData.emotions[emotion] / 100;
        const angle = emotionAngles[emotion];
        
        if (neutralEmotions.includes(emotion)) {
            // Create SVG petal for neutral emotions
            const length = intensity * maxRadius;
            
            // Calculate scale to match line length (neutral SVG petal is ~243 units tall)
            const petalScale = length / 243;
            
            // Create a group for the petal that can be transformed
            const petalGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
            
            // Calculate transform: rotate around center, then translate out, then scale
            const transform = `
                translate(${centerX}, ${centerY}) 
                rotate(${angle}) 
                translate(0, -${length * 0.5}) 
                scale(${petalScale})
            `;
            petalGroup.setAttribute("transform", transform);
            
            // Create the petal path
            const petalElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
            petalElement.setAttribute("d", neutralPetalPath);
            petalElement.setAttribute("fill", `url(#neutral_gradient_${x}_${y})`);
            petalElement.setAttribute("transform", "translate(-92.81, -121.49)"); // Center the petal on its root
            
            petalGroup.appendChild(petalElement);
            svg.appendChild(petalGroup);
            
        } else if (positiveEmotions.includes(emotion)) {
            // Create SVG petal for positive emotions
            const length = intensity * maxRadius;
            
            // Calculate scale to match line length (positive SVG petal is ~244 units tall)
            const petalScale = length / 244;
            
            // Create a group for the petal that can be transformed
            const petalGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
            
            // Calculate transform: rotate around center, then translate out, then scale
            const transform = `
                translate(${centerX}, ${centerY}) 
                rotate(${angle}) 
                translate(0, -${length * 0.5}) 
                scale(${petalScale})
            `;
            petalGroup.setAttribute("transform", transform);
            
            // Create the petal path
            const petalElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
            petalElement.setAttribute("d", positivePetalPath);
            petalElement.setAttribute("fill", `url(#positive_gradient_${x}_${y})`);
            petalElement.setAttribute("transform", "translate(-47.47, -122.21)"); // Center the petal on its root
            
            petalGroup.appendChild(petalElement);
            svg.appendChild(petalGroup);
            
        } else if (negativeEmotions.includes(emotion)) {
            // Create SVG petal for negative emotions
            const length = intensity * maxRadius;
            
            // Calculate scale to match line length (negative SVG petal is ~245 units tall)
            const petalScale = length / 245;
            
            // Create a group for the petal that can be transformed
            const petalGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
            
            // Calculate transform: rotate around center, then translate out, then scale
            const transform = `
                translate(${centerX}, ${centerY}) 
                rotate(${angle}) 
                translate(0, -${length * 0.5}) 
                scale(${petalScale})
            `;
            petalGroup.setAttribute("transform", transform);
            
            // Create the petal path
            const petalElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
            petalElement.setAttribute("d", negativePetalPath);
            petalElement.setAttribute("fill", `url(#negative_gradient_${x}_${y})`);
            petalElement.setAttribute("transform", "translate(-37.8, -122.27)"); // Center the petal on its root
            
            petalGroup.appendChild(petalElement);
            svg.appendChild(petalGroup);
            
        } else {
            // Create line petal for any other emotions (fallback)
            const length = intensity * maxRadius;
            const end = getCoordinates(angle, length);
            
            const petal = document.createElementNS("http://www.w3.org/2000/svg", "line");
            petal.setAttribute("x1", centerX);
            petal.setAttribute("y1", centerY);
            petal.setAttribute("x2", end.x);
            petal.setAttribute("y2", end.y);
            petal.setAttribute("stroke", emotionColors[emotion]);
            petal.setAttribute("stroke-width", "3");
            
            svg.appendChild(petal);
        }
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