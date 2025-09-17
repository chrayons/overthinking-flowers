console.log("Flower garden is loading...");

// Complete flower data with all 11 emotions
const testFlower = {
    fear: 1, anger: 1, disgust: 2, pessimism: 1, sadness: 2,
    anticipation: 53, surprise: 8,
    optimism: 54, joy: 91, love: 7, trust: 12
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

// Add valence zone labels
const valenceLabels = [
    { text: "NEGATIVE", angle: 60, radius: 140 },   // Center of negative zone (0° to 120°)
    { text: "NEUTRAL", angle: 180, radius: 140 },   // Center of neutral zone (120° to 240°)  
    { text: "POSITIVE", angle: 300, radius: 140 }   // Center of positive zone (240° to 360°)
];

// Calculate valence totals
const negativeTotal = testFlower.fear + testFlower.anger + testFlower.disgust + testFlower.pessimism + testFlower.sadness;
const neutralTotal = testFlower.anticipation + testFlower.surprise;
const positiveTotal = testFlower.optimism + testFlower.joy + testFlower.love + testFlower.trust;
const overallIntensity = negativeTotal + neutralTotal + positiveTotal;

const valencePercentages = {
    negative: Math.round((negativeTotal / overallIntensity) * 100),
    neutral: Math.round((neutralTotal / overallIntensity) * 100),
    positive: Math.round((positiveTotal / overallIntensity) * 100)
};

// Add labels with hover functionality
valenceLabels.forEach((label, index) => {
    const coords = getCoordinates(label.angle, label.radius);
    
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", coords.x);
    text.setAttribute("y", coords.y);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "middle");
    text.setAttribute("fill", "#999");
    text.setAttribute("font-size", "12");
    text.setAttribute("font-family", "Arial, sans-serif");
    text.textContent = label.text;
    text.style.cursor = "pointer";
    
    svg.appendChild(text);
    
    // Add hover tooltip for valence zones
    const valenceTooltip = document.createElement('div');
    valenceTooltip.style.cssText = `
        position: absolute;
        background: rgba(0,0,0,0.9);
        color: white;
        padding: 12px;
        border-radius: 6px;
        font-size: 14px;
        display: none;
        pointer-events: none;
        z-index: 1000;
        text-align: center;
    `;
    document.body.appendChild(valenceTooltip);
    
    const valenceType = label.text.toLowerCase();
    const percentage = valencePercentages[valenceType];
    
    text.addEventListener('mouseenter', (e) => {
        valenceTooltip.innerHTML = `${label.text.charAt(0) + label.text.slice(1).toLowerCase()}: ${percentage}% of Overall<br>Emotional Intensity`;
        valenceTooltip.style.display = 'block';
        valenceTooltip.style.left = e.pageX - 75 + 'px'; // Center the tooltip
        valenceTooltip.style.top = e.pageY - 50 + 'px';
    });
    
    text.addEventListener('mouseleave', () => {
        valenceTooltip.style.display = 'none';
    });
});

console.log("Valence percentages:", valencePercentages);
console.log("Overall intensity:", Math.round((overallIntensity / 1100) * 100) + "%");


// Add hover tooltips to petals
Object.keys(testFlower).forEach((emotion, index) => {
    const petal = svg.children[index + 1]; // +1 to skip the center circle
    
    // Create tooltip element
    const tooltip = document.createElement('div');
    tooltip.style.position = 'absolute';
    tooltip.style.background = 'rgba(0,0,0,0.8)';
    tooltip.style.color = 'white';
    tooltip.style.padding = '8px';
    tooltip.style.borderRadius = '4px';
    tooltip.style.fontSize = '14px';
    tooltip.style.display = 'none';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.zIndex = '1000';
    document.body.appendChild(tooltip);
    
    // Mouse enter - show tooltip
    petal.addEventListener('mouseenter', (e) => {
        tooltip.textContent = `${emotion}: ${testFlower[emotion]}%`;
        tooltip.style.display = 'block';
        tooltip.style.left = e.pageX + 10 + 'px';
        tooltip.style.top = e.pageY - 30 + 'px';
    });
    
    // Mouse move - follow cursor
    petal.addEventListener('mousemove', (e) => {
        tooltip.style.left = e.pageX + 10 + 'px';
        tooltip.style.top = e.pageY - 30 + 'px';
    });
    
    // Mouse leave - hide tooltip
    petal.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
    });
});
console.log("Drew complete 11-petal flower");

