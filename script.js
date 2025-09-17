console.log("Flower garden is loading...");

// Complete flower data with all 11 emotions
const testFlower = {
    fear: 100, anger: 100, disgust: 100, pessimism: 100, sadness: 100,
    anticipation: 100, surprise: 100,
    optimism: 100, joy: 100, love: 100, trust: 100
};

// Emotion angles from your PRD
const emotionAngles = {
    fear: 12, anger: 36, disgust: 60, pessimism: 84, sadness: 108,
    anticipation: 150, surprise: 210,
    optimism: 255, joy: 285, love: 315, trust: 345
};

// Colors for each emotion zone
const emotionColors = {
    fear: "#005BAB", anger: "#005BAB", disgust: "#005BAB", pessimism: "#005BAB", sadness: "#005BAB",
    anticipation: "#EEDE73", surprise: "#EEDE73",
    optimism: "#5EA748", joy: "#5EA748", love: "#5EA748", trust: "#5EA748"
};

// Create SVG
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
Object.keys(testFlower).forEach(emotion => {
    const length = (testFlower[emotion] / 100) * maxRadius;
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

document.getElementById("flower-container").appendChild(svg);
console.log("Drew complete 11-petal flower");