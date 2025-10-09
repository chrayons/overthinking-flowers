// flower-lib.js - Extracted flower renderer for zine export
// Read-only wrapper of public/scripts/flower-renderer.js

// Define emotion categories
const neutralEmotions = ['anticipation', 'surprise'];
const positiveEmotions = ['trust', 'optimism', 'joy', 'love'];
const negativeEmotions = ['fear', 'disgust', 'anger', 'sadness', 'pessimism'];

// Emotion angles (static positioning)
const emotionAngles = {
  fear: 12,
  anger: 36,
  disgust: 60,
  pessimism: 84,
  sadness: 108,
  anticipation: 150,
  surprise: 210,
  optimism: 255,
  joy: 285,
  love: 315,
  trust: 345
};

// SVG petal paths
const neutralPetalPath = "M178.75,63.24C173.34,28.66,129.57,0,91.12,0h-2.55C50.12,0,6.35,28.66.94,63.24c-4.32,22.7,6.88,42.97,19.58,63.46,23.05,37.19,48.73,79.38,69.32,116.26-17.99-37.08-46.12-80.81-66.21-122.32-10.92-22.57-17.28-39.03-13.5-55.24C16.25,39.17,48.39,13.86,89.82,13.57c41.43.29,73.62,25.6,79.74,51.83,3.78,16.21-2.58,32.67-13.5,55.24-20.09,41.51-48.22,85.24-66.22,122.32h0s.01.01.01.01c20.6-36.88,46.27-79.08,69.32-116.27,12.7-20.49,23.9-40.76,19.58-63.46Z";

const dominantNeutralPetalPath = "M178.75,63.24C173.34,28.66,129.57,0,91.12,0h-2.55C50.12,0,6.35,28.66.94,63.24c-4.32,22.7,6.88,42.97,19.58,63.46,23.05,37.19,48.73,79.38,69.32,116.26h0s.01.01.01.01c20.6-36.88,46.27-79.08,69.32-116.27,12.7-20.49,23.9-40.76,19.58-63.46Z";

const positivePetalPath = "M67.2,3.83C60.76,1.38,54.34,.16,48.16,.03h0c-.12-.01-.24,0-.36,0-.34,0-.68-.02-1.02-.02v.04c-6.18,.14-12.59,1.36-19.03,3.8C-13.12,22.65,.41,79.7,10.6,114.21c10.46,37.71,26.01,93.14,36.87,130.21-9.48-37.28-23.22-93.46-32.25-131.5C5.26,78.13-4.66,14.06,45.96,14.06c.41,0,2.73-.01,3.02-.01,50.62,0,40.7,64.06,30.74,98.85-9.03,38.04-22.77,94.22-32.25,131.5,10.86-37.07,26.41-92.5,36.87-130.21,10.19-34.51,23.72-91.56-17.15-110.37Z";

const dominantPositivePetalPath = "M47.48,244.4c10.86-37.07,26.41-92.5,36.87-130.21,10.19-34.51,23.72-91.56-17.15-110.37C60.76,1.38,54.34,.16,48.16,.03h0c-.12-.01-.24,0-.36,0-.34,0-.68-.02-1.02-.02v.04c-6.18,.14-12.59,1.36-19.03,3.8C-13.12,22.65,.41,79.7,10.6,114.21c10.46,37.71,26.01,93.14,36.87,130.21";

const negativePetalPath = "M75.33,47.23C73.95,17.52,57.68-.02,38.12,0h0c-.09,0-.18,0-.27,0-.12,0-.24,0-.35,0h0C17.92-.02,1.66,17.52.28,47.23c-1.53,23.42,3.44,45.78,8.18,67.04c8.26,37.79,20.75,93.19,29.35,130.24,0,0,0,.01,0,.02,0,0,0-.01,0-.02,0,0,0,.01,0,.02,0,0,0-.01,0-.02,8.59-37.06,21.08-92.46,29.35-130.24,4.73-21.27,9.71-43.62,8.18-67.04ZM37.8,244.51c-7.6-37.53-18.4-93.38-25.66-131.53C3.71,76.45.86,13.38,37.82,13.29c36.93.11,34.08,63.16,25.64,99.69-7.25,38.16-18.06,94.01-25.66,131.54Z";

const dominantNegativePetalPath = "M75.33,47.23C73.95,17.52,57.68-.02,38.12,0h0c-.09,0-.18,0-.27,0-.12,0-.24,0-.35,0h0C17.92-.02,1.66,17.52.28,47.23c-1.53,23.42,3.44,45.78,8.18,67.04c8.26,37.79,20.75,93.19,29.35,130.24,0,0,0,.01,0,.02,0,0,0-.01,0-.02,0,0,0,.01,0,.02,0,0,0-.01,0-.02,8.59-37.06,21.08-92.46,29.35-130.24,4.73-21.27,9.71-43.62,8.18-67.04Z";

// Create global gradient definitions
function createGradientDefs(svg, includeTexture = true, textureDataUrl = null) {
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");

  // Add texture pattern if enabled
  if (includeTexture) {
    const texturePattern = document.createElementNS("http://www.w3.org/2000/svg", "pattern");
    texturePattern.setAttribute("id", "petal-texture");
    texturePattern.setAttribute("patternUnits", "userSpaceOnUse");
    // Larger pattern size for visibility at high resolution
    texturePattern.setAttribute("width", "400");
    texturePattern.setAttribute("height", "400");

    const textureImage = document.createElementNS("http://www.w3.org/2000/svg", "image");
    // Use data URL if provided, otherwise relative path (for preview)
    const imageHref = textureDataUrl || "../public/textures/flowertexture.jpg";
    textureImage.setAttribute("href", imageHref);
    textureImage.setAttribute("width", "400");
    textureImage.setAttribute("height", "400");
    textureImage.setAttribute("preserveAspectRatio", "xMidYMid slice");

    texturePattern.appendChild(textureImage);
    defs.appendChild(texturePattern);
  }

  function createGradient(id, stops, x1, y1, x2, y2) {
    const gradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
    gradient.setAttribute("id", id);
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

  const gradients = [
    createGradient("gradient-neutral", [
      { offset: "0", color: "#efe173" },
      { offset: ".49", color: "#e9eab0" },
      { offset: "1", color: "#f8fbf4" }
    ], "92.81", "0", "92.81", "248.13"),

    createGradient("gradient-dominant-neutral", [
      { offset: "0", color: "#d4c441" },
      { offset: ".49", color: "#efe173" },
      { offset: "1", color: "#fffdf0" }
    ], "92.81", "0", "92.81", "248.13"),

    createGradient("gradient-positive", [
      { offset: "0", color: "#7db056" },
      { offset: ".49", color: "#a7c97b" },
      { offset: "1", color: "#fff" }
    ], "47.47", "0", "47.47", "249.59"),

    createGradient("gradient-dominant-positive", [
      { offset: "0", color: "#5a9a3d" },
      { offset: ".49", color: "#7db056" },
      { offset: "1", color: "#e8f5e1" }
    ], "47.47", "0", "47.47", "244.42"),

    createGradient("gradient-negative", [
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

    createGradient("gradient-dominant-negative", [
      { offset: "0", color: "#b3e3f9" },
      { offset: ".06", color: "#a8e0f8" },
      { offset: ".16", color: "#8dd8f5" },
      { offset: ".28", color: "#61ccf2" },
      { offset: ".43", color: "#25bced" },
      { offset: ".52", color: "#00b2ea" },
      { offset: ".56", color: "#02a8e1" },
      { offset: ".75", color: "#0b82c1" },
      { offset: ".90", color: "#106bae" },
      { offset: "1", color: "#1363a7" }
    ], "37.8", "244.53", "37.8", "-5.18")
  ];

  gradients.forEach(gradient => defs.appendChild(gradient));
  return defs;
}

// Create flower SVG
function createFlowerSVG(flowerData, options = {}) {
  const {
    width = 1200,
    height = 1200,
    maxRadius = 550,
    textureDataUrl = null
  } = options;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("width", width);
  svg.setAttribute("height", height);
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");

  const centerX = width / 2;
  const centerY = height / 2;

  // Add gradient definitions with texture
  const defs = createGradientDefs(svg, true, textureDataUrl);
  svg.appendChild(defs);

  // Find dominant emotion
  const dominantEmotion = Object.keys(flowerData.emotions).reduce((max, emotion) =>
    flowerData.emotions[emotion] > flowerData.emotions[max] ? emotion : max
  );

  // Generate petals for each emotion
  Object.keys(flowerData.emotions).forEach(emotion => {
    const intensity = flowerData.emotions[emotion] / 100;
    const angle = emotionAngles[emotion];
    const isDominant = emotion === dominantEmotion;
    const length = intensity * maxRadius;

    if (neutralEmotions.includes(emotion)) {
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
      petalElement.setAttribute("fill", `url(#${isDominant ? 'gradient-dominant-neutral' : 'gradient-neutral'})`);
      petalElement.setAttribute("transform", "translate(-92.81, -121.49)");

      petalGroup.appendChild(petalElement);

      // Add texture overlay
      const textureOverlay = document.createElementNS("http://www.w3.org/2000/svg", "path");
      textureOverlay.setAttribute("d", isDominant ? dominantNeutralPetalPath : neutralPetalPath);
      textureOverlay.setAttribute("fill", "url(#petal-texture)");
      textureOverlay.setAttribute("opacity", "0.4");
      textureOverlay.setAttribute("transform", "translate(-92.81, -121.49)");
      petalGroup.appendChild(textureOverlay);

      svg.appendChild(petalGroup);

    } else if (positiveEmotions.includes(emotion)) {
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
      petalElement.setAttribute("fill", `url(#${isDominant ? 'gradient-dominant-positive' : 'gradient-positive'})`);
      petalElement.setAttribute("transform", isDominant ? "translate(-47.48, -122.2)" : "translate(-47.47, -122.21)");

      petalGroup.appendChild(petalElement);

      // Add texture overlay
      const textureOverlay = document.createElementNS("http://www.w3.org/2000/svg", "path");
      textureOverlay.setAttribute("d", isDominant ? dominantPositivePetalPath : positivePetalPath);
      textureOverlay.setAttribute("fill", "url(#petal-texture)");
      textureOverlay.setAttribute("opacity", "0.4");
      textureOverlay.setAttribute("transform", isDominant ? "translate(-47.48, -122.2)" : "translate(-47.47, -122.21)");
      petalGroup.appendChild(textureOverlay);

      svg.appendChild(petalGroup);

    } else if (negativeEmotions.includes(emotion)) {
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
      petalElement.setAttribute("fill", `url(#${isDominant ? 'gradient-dominant-negative' : 'gradient-negative'})`);
      petalElement.setAttribute("transform", "translate(-37.8, -122.27)");

      petalGroup.appendChild(petalElement);

      // Add texture overlay
      const textureOverlay = document.createElementNS("http://www.w3.org/2000/svg", "path");
      textureOverlay.setAttribute("d", isDominant ? dominantNegativePetalPath : negativePetalPath);
      textureOverlay.setAttribute("fill", "url(#petal-texture)");
      textureOverlay.setAttribute("opacity", "0.4");
      textureOverlay.setAttribute("transform", "translate(-37.8, -122.27)");
      petalGroup.appendChild(textureOverlay);

      svg.appendChild(petalGroup);
    }
  });

  return svg;
}

// Create radial grid SVG
function createRadialGridSVG(options = {}) {
  const {
    width = 1200,
    height = 1200,
    centerX = width / 2,
    centerY = height / 2,
    maxRadius = 570
  } = options;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("width", width);
  svg.setAttribute("height", height);
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");

  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute("fill", "none");
  g.setAttribute("stroke", "#d1d3d4");
  g.setAttribute("stroke-width", "1");
  g.setAttribute("stroke-linejoin", "round");
  g.setAttribute("stroke-linecap", "round");

  // Helper to convert angle to coordinates
  function polarToCartesian(angle, radius) {
    const radians = (angle - 90) * Math.PI / 180;
    return {
      x: centerX + radius * Math.cos(radians),
      y: centerY + radius * Math.sin(radians)
    };
  }

  // Draw boundary lines (11 spokes)
  const spokeAngles = [0, 24, 48, 72, 96, 120, 180, 240, 270, 300, 330];
  spokeAngles.forEach(angle => {
    const end = polarToCartesian(angle, maxRadius);
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", centerX);
    line.setAttribute("y1", centerY);
    line.setAttribute("x2", end.x);
    line.setAttribute("y2", end.y);
    g.appendChild(line);
  });

  // Draw concentric circles (scaled proportionally)
  const baseRadius = 461.61;
  const scale = maxRadius / baseRadius;
  const radii = [114.62, 230.86, 346.61, 461.61].map(r => r * scale);

  radii.slice(0, 3).forEach(r => {
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", centerX);
    circle.setAttribute("cy", centerY);
    circle.setAttribute("r", r);
    circle.setAttribute("stroke-dasharray", "1 5");
    g.appendChild(circle);
  });

  // Outer circle (solid)
  const outerCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  outerCircle.setAttribute("cx", centerX);
  outerCircle.setAttribute("cy", centerY);
  outerCircle.setAttribute("r", radii[3]);
  g.appendChild(outerCircle);

  svg.appendChild(g);
  return svg;
}

// Parse flower data from raw JSON
function parseFlowerData(rawData) {
  return {
    id: String(rawData.MetaphorID),
    text: rawData.Metaphor,
    category: rawData.Category,
    emotionalIntensity: parseFloat((rawData["Emotional Intensity"] || "0").replace('%', '')),
    dominantValence: rawData["Dominant Valence"] || null,
    dominantEmotionName: rawData["Dominant Emotion"] || null,
    emotions: {
      fear: parseFloat(rawData.Fear.replace('%', '')),
      anger: parseFloat(rawData.Anger.replace('%', '')),
      disgust: parseFloat(rawData.Disgust.replace('%', '')),
      pessimism: parseFloat(rawData.Pessimism.replace('%', '')),
      sadness: parseFloat(rawData.Sadness.replace('%', '')),
      anticipation: parseFloat(rawData.Anticipation.replace('%', '')),
      surprise: parseFloat(rawData.Surprise.replace('%', '')),
      optimism: parseFloat(rawData.Optimism.replace('%', '')),
      joy: parseFloat(rawData.Joy.replace('%', '')),
      love: parseFloat(rawData.Love.replace('%', '')),
      trust: parseFloat(rawData.Trust.replace('%', ''))
    }
  };
}

// Export API
window.FlowerLib = {
  createFlowerSVG,
  createRadialGridSVG,
  parseFlowerData,
  emotionAngles,
  neutralEmotions,
  positiveEmotions,
  negativeEmotions
};
