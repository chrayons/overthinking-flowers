// Data parsing function
function parseFlowerData(rawData) {
    return rawData.map(flower => ({
        id: flower.MetaphorID,
        text: flower.Metaphor,
        category: flower.Category,
        emotions: {
            fear: parseFloat(flower.Fear.replace('%', '')),
            anger: parseFloat(flower.Anger.replace('%', '')),
            disgust: parseFloat(flower.Disgust.replace('%', '')),
            pessimism: parseFloat(flower.Pessimism.replace('%', '')),
            sadness: parseFloat(flower.Sadness.replace('%', '')),
            anticipation: parseFloat(flower.Anticipation.replace('%', '')),
            surprise: parseFloat(flower.Surprise.replace('%', '')),
            optimism: parseFloat(flower.Optimism.replace('%', '')),
            joy: parseFloat(flower.Joy.replace('%', '')),
            love: parseFloat(flower.Love.replace('%', '')),
            trust: parseFloat(flower.Trust.replace('%', ''))
        }
    }));
}

// Emotion angles and colors
const emotionAngles = {
    fear: 12, anger: 36, disgust: 60, pessimism: 84, sadness: 108,
    anticipation: 150, surprise: 210,
    optimism: 255, joy: 285, love: 315, trust: 345
};

const emotionColors = {
    fear: "#005BAB", anger: "#005BAB", disgust: "#005BAB", pessimism: "#005BAB", sadness: "#005BAB",
    anticipation: "#EEDE73", surprise: "#EEDE73",
    optimism: "#5EA748", joy: "#5EA748", love: "#5EA748", trust: "#5EA748"
};

// Shared flower creation function
function createFlower(flowerData, x, y) {
    console.log("Creating flower:", flowerData.text.substring(0, 30) + "...");
    
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = x + 'px';
    container.style.top = y + 'px';
    
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "300");
    svg.setAttribute("height", "300");
    
    const centerX = 150;
    const centerY = 150;
    const maxRadius = 120;
    
    function getCoordinates(angle, length) {
        const radians = (angle - 90) * Math.PI / 180;
        return {
            x: centerX + length * Math.cos(radians),
            y: centerY + length * Math.sin(radians)
        };
    }
    
    // Draw center
    const center = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    center.setAttribute("cx", centerX);
    center.setAttribute("cy", centerY);
    center.setAttribute("r", "3");
    center.setAttribute("fill", "#333");
    svg.appendChild(center);
    
    // Draw all petals
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
        petal.setAttribute("stroke-width", "6");
        
        svg.appendChild(petal);
    });
    
    container.appendChild(svg);
    document.getElementById("flower-container").appendChild(container);
    
    return container;
}