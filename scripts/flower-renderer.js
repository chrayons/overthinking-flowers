// flower-renderer.js - Single Flower Visualization Component

// Define emotion categories
const neutralEmotions = ['anticipation', 'surprise'];
const positiveEmotions = ['trust', 'optimism', 'joy', 'love'];
const negativeEmotions = ['fear', 'disgust', 'anger', 'sadness', 'pessimism'];

// SVG petal paths
const neutralPetalPath = "M183.87,54.26C175.96,17.32,132.53,0,94.09,0c-0.44,0-0.89,0-1.34,0h0c-0.41,0-0.81,0-1.21,0C53.09,0,9.66,17.33,1.76,54.27c-7.15,24.44,9.04,51.95,21.73,72.44c23.05,37.19,48.72,79.4,69.32,116.28h0c20.6-36.88,46.27-79.09,69.32-116.29c12.7-20.49,28.89-48,21.73-72.44ZM159.03,120.64c-20.09,41.52-48.23,85.25-66.22,122.34c-17.99-37.09-46.13-80.82-66.22-122.33c-10.92-22.57-19.95-40.69-13.17-61.85C21.57,33.35,51.29,13.76,92.87,13.58h0c41.52,0.21,71.19,19.79,79.32,45.2c6.78,21.16-2.25,39.29-13.17,61.85Z";

const dominantNeutralPetalPath = "M183.87,54.26C175.96,17.32,132.53,0,94.09,0c-.44,0-.89,0-1.34,0h0c-.41,0-.81,0-1.21,0C53.09,0,9.66,17.33,1.76,54.27c-7.15,24.44,9.04,51.95,21.73,72.44,23.05,37.19,48.72,79.4,69.32,116.28h0c20.6-36.88,46.27-79.09,69.32-116.29,12.7-20.49,28.89-48,21.73-72.44Z";

const positivePetalPath = "M67.2,3.83C60.76,1.38,54.34,.16,48.16,.03h0c-.12-.01-.24,0-.36,0-.34,0-.68-.02-1.02-.02v.04c-6.18,.14-12.59,1.36-19.03,3.8C-13.12,22.65,.41,79.7,10.6,114.21c10.46,37.71,26.01,93.14,36.87,130.21-9.48-37.28-23.22-93.46-32.25-131.5C5.26,78.13-4.66,14.06,45.96,14.06c.41,0,2.73-.01,3.02-.01,50.62,0,40.7,64.06,30.74,98.85-9.03,38.04-22.77,94.22-32.25,131.5,10.86-37.07,26.41-92.5,36.87-130.21,10.19-34.51,23.72-91.56-17.15-110.37Z";

const dominantPositivePetalPath = "M47.48,244.4c10.86-37.07,26.41-92.5,36.87-130.21,10.19-34.51,23.72-91.56-17.15-110.37C60.76,1.38,54.34,.16,48.16,.03h0c-.12-.01-.24,0-.36,0-.34,0-.68-.02-1.02-.02v.04c-6.18,.14-12.59,1.36-19.03,3.8C-13.12,22.65,.41,79.7,10.6,114.21c10.46,37.71,26.01,93.14,36.87,130.21";

const negativePetalPath = "M75.33,47.23C73.95,17.52,57.68-.02,38.12,0h0c-.09,0-.18,0-.27,0-.12,0-.24,0-.35,0h0C17.92-.02,1.66,17.52.28,47.23c-1.53,23.42,3.44,45.78,8.18,67.04c8.26,37.79,20.75,93.19,29.35,130.24,0,0,0,.01,0,.02,0,0,0-.01,0-.02,0,0,0,.01,0,.02,0,0,0-.01,0-.02,8.59-37.06,21.08-92.46,29.35-130.24,4.73-21.27,9.71-43.62,8.18-67.04ZM37.8,244.51c-7.6-37.53-18.4-93.38-25.66-131.53C3.71,76.45.86,13.38,37.82,13.29c36.93.11,34.08,63.16,25.64,99.69-7.25,38.16-18.06,94.01-25.66,131.54Z";

const dominantNegativePetalPath = "M75.33,47.23C73.95,17.52,57.68-.02,38.12,0h0c-.09,0-.18,0-.27,0-.12,0-.24,0-.35,0h0C17.92-.02,1.66,17.52.28,47.23c-1.53,23.42,3.44,45.78,8.18,67.04c8.26,37.79,20.75,93.19,29.35,130.24,0,0,0,.01,0,.02,0,0,0-.01,0-.02,0,0,0,.01,0,.02,0,0,0-.01,0-.02,8.59-37.06,21.08-92.46,29.35-130.24,4.73-21.27,9.71-43.62,8.18-67.04Z";

/**
 * Creates a single flower visualization from emotion data
 * @param {Object} flowerData - Single flower/metaphor data with emotions object
 * @param {Object} options - Configuration options
 * @returns {SVGElement} - Complete SVG flower visualization
 */
function createFlower(flowerData, options = {}) {
    const {
        width = 80,
        height = 80,
        maxRadius = 30,
        emotionAngles = {
            // Default angles if not provided
            trust: 0,
            optimism: 45,
            joy: 90,
            love: 135,
            anticipation: 180,
            surprise: 225,
            fear: 270,
            disgust: 315,
            anger: 0,      // You'll need to set proper angles
            sadness: 45,
            pessimism: 90
        },
        emotionColors = {
            // Fallback colors for line petals
            trust: '#7db056',
            optimism: '#a7c97b',
            joy: '#7db056',
            love: '#a7c97b',
            anticipation: '#efe173',
            surprise: '#e9eab0',
            fear: '#00b2ea',
            disgust: '#25bced',
            anger: '#1363a7',
            sadness: '#0b82c1',
            pessimism: '#106bae'
        }
    } = options;
    
    // Create SVG element
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);
    
    const centerX = width / 2;
    const centerY = height / 2;
    const uniqueId = Math.random().toString(36).substr(2, 9);
    
    // Create gradients
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    
    // Helper function to create gradient
    function createGradient(id, stops, x1, y1, x2, y2) {
        const gradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
        gradient.setAttribute("id", `${id}_${uniqueId}`);
        gradient.setAttribute("x1", x1);
        gradient.setAttribute("y1", y1);
        gradient.setAttribute("x2", x2);
        gradient.setAttribute("y2", y2);
        gradient.setAttribute("gradientUnits", "userSpaceOnUse");
        
        stops.forEach(stop => {
            const stopElement = document.createElementNS("http://www.w3.org/2000/svg", "stop");
            stopElement.setAttribute("offset", stop.offset);
            stopElement.setAttribute("stop-color", stop.color);
            gradient.appendChild(stopElement);
        });
        
        return gradient;
    }
    
    // Create all gradients
    const gradients = [
        createGradient("neutral", [
            { offset: "0", color: "#efe173" },
            { offset: ".49", color: "#e9eab0" },
            { offset: "1", color: "#f8fbf4" }
        ], "92.81", "0", "92.81", "248.13"),
        
        createGradient("dominant_neutral", [
            { offset: "0", color: "#d4c441" },
            { offset: ".49", color: "#efe173" },
            { offset: "1", color: "#fffdf0" }
        ], "92.81", "0", "92.81", "248.13"),
        
        createGradient("positive", [
            { offset: "0", color: "#7db056" },
            { offset: ".49", color: "#a7c97b" },
            { offset: "1", color: "#fff" }
        ], "47.47", "0", "47.47", "249.59"),
        
        createGradient("dominant_positive", [
            { offset: "0", color: "#5a9a3d" },
            { offset: ".49", color: "#7db056" },
            { offset: "1", color: "#e8f5e1" }
        ], "47.47", "0", "47.47", "244.42"),
        
        createGradient("negative", [
            { offset: "0", color: "#b3e3f9" },
            { offset: ".06", color: "#a8e0f8" },
            { offset: ".16", color: "#8dd8f5" },
            { offset: ".28", color: "#61ccf2" },
            { offset: ".43", color: "#25bced" },
            { offset: ".52", color: "#00b2ea" },
            { offset: ".56", color: "#02a8e1" },
            { offset: ".75", color: "#0b82c1" },
            { offset: ".9", color: "#106bae" },
            { offset: "1", color: "#1363a7" }
        ], "37.8", "244.53", "37.8", "-5.18"),
        
        createGradient("dominant_negative", [
            { offset: "0", color: "#b3e3f9" },
            { offset: ".06", color: "#a8e0f8" },
            { offset: ".16", color: "#8dd8f5" },
            { offset: ".28", color: "#61ccf2" },
            { offset: ".43", color: "#25bced" },
            { offset: ".52", color: "#00b2ea" },
            { offset: ".56", color: "#02a8e1" },
            { offset: ".75", color: "#0b82c1" },
            { offset: ".9", color: "#106bae" },
            { offset: "1", color: "#1363a7" }
        ], "37.8", "244.53", "37.8", "-5.18")
    ];
    
    gradients.forEach(gradient => defs.appendChild(gradient));
    svg.appendChild(defs);
    
    // Helper function for polar coordinates
    function getCoordinates(angle, length) {
        const radians = (angle - 90) * Math.PI / 180;
        return {
            x: centerX + length * Math.cos(radians),
            y: centerY + length * Math.sin(radians)
        };
    }
    
    // Find dominant emotion (highest intensity)
    const dominantEmotion = Object.keys(flowerData.emotions).reduce((max, emotion) => 
        flowerData.emotions[emotion] > flowerData.emotions[max] ? emotion : max
    );
    
    // Generate petals for each emotion
    Object.keys(flowerData.emotions).forEach(emotion => {
        const intensity = flowerData.emotions[emotion] / 100; // Convert percentage to 0-1
        const angle = emotionAngles[emotion];
        const isDominant = emotion === dominantEmotion;
        const length = intensity * maxRadius;
        
        if (neutralEmotions.includes(emotion)) {
            // Neutral emotion petal
            const petalScale = length / 243;
            const petalGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
            petalGroup.setAttribute("transform", `
                translate(${centerX}, ${centerY}) 
                rotate(${angle}) 
                translate(0, -${length * 0.5}) 
                scale(${petalScale})
            `);
            
            const petalElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
            petalElement.setAttribute("d", isDominant ? dominantNeutralPetalPath : neutralPetalPath);
            petalElement.setAttribute("fill", `url(#${isDominant ? 'dominant_neutral' : 'neutral'}_${uniqueId})`);
            petalElement.setAttribute("transform", "translate(-92.81, -121.49)");
            
            petalGroup.appendChild(petalElement);
            svg.appendChild(petalGroup);
            
        } else if (positiveEmotions.includes(emotion)) {
            // Positive emotion petal
            const petalScale = length / 244;
            const petalGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
            petalGroup.setAttribute("transform", `
                translate(${centerX}, ${centerY}) 
                rotate(${angle}) 
                translate(0, -${length * 0.5}) 
                scale(${petalScale})
            `);
            
            const petalElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
            petalElement.setAttribute("d", isDominant ? dominantPositivePetalPath : positivePetalPath);
            petalElement.setAttribute("fill", `url(#${isDominant ? 'dominant_positive' : 'positive'}_${uniqueId})`);
            petalElement.setAttribute("transform", isDominant ? "translate(-47.48, -122.2)" : "translate(-47.47, -122.21)");
            
            petalGroup.appendChild(petalElement);
            svg.appendChild(petalGroup);
            
        } else if (negativeEmotions.includes(emotion)) {
            // Negative emotion petal
            const petalScale = length / 245;
            const petalGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
            petalGroup.setAttribute("transform", `
                translate(${centerX}, ${centerY}) 
                rotate(${angle}) 
                translate(0, -${length * 0.5}) 
                scale(${petalScale})
            `);
            
            const petalElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
            petalElement.setAttribute("d", isDominant ? dominantNegativePetalPath : negativePetalPath);
            petalElement.setAttribute("fill", `url(#${isDominant ? 'dominant_negative' : 'negative'}_${uniqueId})`);
            petalElement.setAttribute("transform", "translate(-37.8, -122.27)");
            
            petalGroup.appendChild(petalElement);
            svg.appendChild(petalGroup);
            
        } else {
            // Fallback: line petal for unknown emotions
            const end = getCoordinates(angle, length);
            const petal = document.createElementNS("http://www.w3.org/2000/svg", "line");
            petal.setAttribute("x1", centerX);
            petal.setAttribute("y1", centerY);
            petal.setAttribute("x2", end.x);
            petal.setAttribute("y2", end.y);
            petal.setAttribute("stroke", emotionColors[emotion] || "#999");
            petal.setAttribute("stroke-width", "3");
            svg.appendChild(petal);
        }
    });
    
    return svg;
}

// Export for use in other files
if (typeof window !== 'undefined') {
    window.FlowerRenderer = {
        createFlower
    };
}