console.log("Flower garden is loading...");

// Your first flower data
const testFlower = {
    sadness: 83,
    joy: 12,
    fear: 25
};

// Create SVG element
const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
svg.setAttribute("width", "300");
svg.setAttribute("height", "300");

// Center point
const centerX = 150;
const centerY = 150;
const maxRadius = 120;

// Function to convert angle to x,y coordinates
function getCoordinates(angle, length) {
    const radians = (angle - 90) * Math.PI / 180; // -90 to make 0° point up
    return {
        x: centerX + length * Math.cos(radians),
        y: centerY + length * Math.sin(radians)
    };
}

// Draw center dot
const center = document.createElementNS("http://www.w3.org/2000/svg", "circle");
center.setAttribute("cx", centerX);
center.setAttribute("cy", centerY);
center.setAttribute("r", "3");
center.setAttribute("fill", "#333");

// Draw sadness petal (0 degrees - pointing up)
const sadnessLength = (testFlower.sadness / 100) * maxRadius;
const sadnessEnd = getCoordinates(0, sadnessLength);
const sadnessPetal = document.createElementNS("http://www.w3.org/2000/svg", "line");
sadnessPetal.setAttribute("x1", centerX);
sadnessPetal.setAttribute("y1", centerY);
sadnessPetal.setAttribute("x2", sadnessEnd.x);
sadnessPetal.setAttribute("y2", sadnessEnd.y);
sadnessPetal.setAttribute("stroke", "#005BAB");
sadnessPetal.setAttribute("stroke-width", "8");

// Draw joy petal (120 degrees)
const joyLength = (testFlower.joy / 100) * maxRadius;
const joyEnd = getCoordinates(120, joyLength);
const joyPetal = document.createElementNS("http://www.w3.org/2000/svg", "line");
joyPetal.setAttribute("x1", centerX);
joyPetal.setAttribute("y1", centerY);
joyPetal.setAttribute("x2", joyEnd.x);
joyPetal.setAttribute("y2", joyEnd.y);
joyPetal.setAttribute("stroke", "#5EA748");
joyPetal.setAttribute("stroke-width", "8");

// Draw fear petal (240 degrees)
const fearLength = (testFlower.fear / 100) * maxRadius;
const fearEnd = getCoordinates(240, fearLength);
const fearPetal = document.createElementNS("http://www.w3.org/2000/svg", "line");
fearPetal.setAttribute("x1", centerX);
fearPetal.setAttribute("y1", centerY);
fearPetal.setAttribute("x2", fearEnd.x);
fearPetal.setAttribute("y2", fearEnd.y);
fearPetal.setAttribute("stroke", "#005BAB");
fearPetal.setAttribute("stroke-width", "8");

// Add all elements to SVG
svg.appendChild(center);
svg.appendChild(sadnessPetal);
svg.appendChild(joyPetal);
svg.appendChild(fearPetal);

// Add SVG to page
document.getElementById("flower-container").appendChild(svg);

console.log("Drew flower with sadness:", sadnessLength, "joy:", joyLength, "fear:", fearLength);