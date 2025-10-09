// flower-export.js - Main logic for preview and export

let currentFlowerData = null;
let satoshiFontBase64 = null;
let textureDataUrl = null;

// Load Satoshi font as base64 for embedding in exports
async function loadSatoshiFont() {
  try {
    const response = await fetch('../public/fonts/Satoshi/fonts/Satoshi-Medium.woff2');
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Could not load Satoshi font:', error);
    return null;
  }
}

// Load texture image as data URL for embedding in exports
function loadTextureAsDataUrl() {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      console.log('Texture image loaded successfully');
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        console.log('Texture converted to data URL, length:', dataUrl.length);
        resolve(dataUrl);
      } catch (error) {
        console.error('Error converting texture to data URL:', error);
        resolve(null);
      }
    };
    img.onerror = (error) => {
      console.error('Could not load texture image:', error);
      resolve(null);
    };
    img.src = '../public/textures/flowertexture.jpg';
  });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  // Load Satoshi font for exports
  satoshiFontBase64 = await loadSatoshiFont();
  console.log('Satoshi font loaded:', satoshiFontBase64 ? 'Yes' : 'No');

  // Load texture as data URL for exports
  textureDataUrl = await loadTextureAsDataUrl();
  console.log('Texture data URL loaded:', textureDataUrl ? `Yes (${textureDataUrl.substring(0, 50)}...)` : 'No');

  // Load sample data by default
  loadSampleData();

  // Set up event listeners
  document.getElementById('load-sample').addEventListener('click', loadSampleData);
  document.getElementById('refresh-preview').addEventListener('click', updatePreview);
  document.getElementById('export-btn').addEventListener('click', exportImage);

  // Auto-update preview when settings change
  ['width', 'height', 'padding', 'transparent', 'show-labels'].forEach(id => {
    const element = document.getElementById(id);
    element.addEventListener('change', updatePreview);
  });
});

// Load sample data from file
function loadSampleData() {
  fetch('sample-data.json')
    .then(response => response.json())
    .then(data => {
      document.getElementById('data-input').value = JSON.stringify(data, null, 2);
      updatePreview();
    })
    .catch(error => {
      console.error('Error loading sample data:', error);
      alert('Could not load sample data');
    });
}

// Get current configuration
function getConfig() {
  return {
    width: parseInt(document.getElementById('width').value) || 1200,
    height: parseInt(document.getElementById('height').value) || 1200,
    padding: parseInt(document.getElementById('padding').value) || 40,
    transparent: document.getElementById('transparent').checked,
    showLabels: document.getElementById('show-labels').checked,
    format: document.querySelector('input[name="format"]:checked').value
  };
}

// Parse and validate input data
function parseInputData() {
  const input = document.getElementById('data-input').value.trim();
  if (!input) {
    throw new Error('No data provided');
  }

  try {
    const rawData = JSON.parse(input);
    return window.FlowerLib.parseFlowerData(rawData);
  } catch (error) {
    throw new Error('Invalid JSON data: ' + error.message);
  }
}

// Create clock-style sector labels around circumference
function createSectorLabels(svg, config) {
  const { width, height } = config;
  const centerX = width / 2;
  const centerY = height / 2;

  // Calculate label radius (outside the grid)
  const baseRadius = 461.61;
  const maxRadius = Math.min(width, height) / 2 - config.padding;
  const scale = maxRadius / baseRadius;
  const outerCircleRadius = 461.61 * scale;
  // Scale the gap with the image size (5% of width gives good spacing)
  const labelGap = width * 0.05;
  const labelRadius = outerCircleRadius + labelGap;

  // Emotion labels in order, starting from fear (12°)
  const emotions = ['fear', 'anger', 'disgust', 'pessimism', 'sadness', 'anticipation', 'surprise', 'optimism', 'joy', 'love', 'trust'];

  emotions.forEach((emotion, index) => {
    const angle = window.FlowerLib.emotionAngles[emotion];
    const labelNumber = index + 1; // 1-11

    // Calculate position on circumference
    const radians = (angle - 90) * Math.PI / 180;
    const x = centerX + labelRadius * Math.cos(radians);
    const y = centerY + labelRadius * Math.sin(radians);

    // Create text element with size scaled to output dimensions
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", x);
    text.setAttribute("y", y);
    text.setAttribute("class", "sector-label");
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "middle");
    text.setAttribute("font-family", "Satoshi-Medium, -apple-system, BlinkMacSystemFont, sans-serif");
    // Scale font size based on width (72px for 1200px width = 6%)
    const fontSize = Math.round(width * 0.06);
    text.setAttribute("font-size", fontSize);
    text.setAttribute("font-weight", "500");
    text.setAttribute("fill", "#1a2018");
    text.textContent = labelNumber;

    svg.appendChild(text);
  });
}

// Update preview
function updatePreview() {
  const previewStage = document.getElementById('preview-stage');
  previewStage.innerHTML = '';

  try {
    const config = getConfig();
    currentFlowerData = parseInputData();

    // Create composite SVG
    const compositeSVG = createCompositeSVG(currentFlowerData, config);

    // Add to preview
    previewStage.appendChild(compositeSVG);

  } catch (error) {
    console.error('Preview error:', error);
    previewStage.innerHTML = `<div style="color: #d32f2f; padding: 20px; text-align: center;">
      <strong>Error:</strong> ${error.message}
    </div>`;
  }
}

// Create @font-face rule with embedded font
function createFontFaceRule() {
  if (!satoshiFontBase64) {
    return ''; // No font loaded, fall back to system fonts
  }

  return `
    @font-face {
      font-family: 'Satoshi-Medium';
      src: url('${satoshiFontBase64}') format('woff2');
      font-weight: 500;
      font-style: normal;
    }
  `;
}

// Create composite SVG with grid, flower, and labels
function createCompositeSVG(flowerData, config) {
  const { width, height, padding, showLabels } = config;

  // Create main SVG container
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("width", width);
  svg.setAttribute("height", height);
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");

  // Calculate dimensions accounting for padding
  const innerWidth = width - (padding * 2);
  const innerHeight = height - (padding * 2);
  const maxRadius = Math.min(innerWidth, innerHeight) / 2;

  // Calculate scale based on base radius
  const baseRadius = 461.61;
  const scale = maxRadius / baseRadius;

  // Create group for centered content
  const centerGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  centerGroup.setAttribute("transform", `translate(${padding}, ${padding})`);

  // 1. Add radial grid (behind flower)
  const gridSVG = window.FlowerLib.createRadialGridSVG({
    width: innerWidth,
    height: innerHeight,
    centerX: innerWidth / 2,
    centerY: innerHeight / 2,
    maxRadius: maxRadius
  });

  // Import grid elements
  const gridElements = gridSVG.querySelector('g');
  if (gridElements) {
    centerGroup.appendChild(gridElements.cloneNode(true));
  }

  // 2. Add flower (on top of grid)
  console.log('Creating flower with texture:', textureDataUrl ? 'Yes' : 'No');
  const flowerSVG = window.FlowerLib.createFlowerSVG(flowerData, {
    width: innerWidth,
    height: innerHeight,
    maxRadius: maxRadius * 0.95, // Slightly smaller than grid to avoid overlap
    textureDataUrl: textureDataUrl // Pass texture data URL for embedded export
  });

  // Import flower elements (defs and petals)
  const flowerDefs = flowerSVG.querySelector('defs');
  if (flowerDefs) {
    svg.appendChild(flowerDefs.cloneNode(true));
  }

  Array.from(flowerSVG.children).forEach(child => {
    if (child.tagName !== 'defs') {
      centerGroup.appendChild(child.cloneNode(true));
    }
  });

  svg.appendChild(centerGroup);

  // 3. Add sector labels (if enabled)
  if (showLabels) {
    createSectorLabels(svg, {
      width: width,
      height: height,
      padding: padding
    });
  }

  return svg;
}

// Export image (PNG or SVG)
function exportImage() {
  try {
    const config = getConfig();

    if (!currentFlowerData) {
      alert('Please update preview first');
      return;
    }

    const format = config.format;
    const timestamp = new Date().toISOString().slice(0, 16).replace(/[-:]/g, '').replace('T', '-');
    const filename = `flower-${timestamp}.${format}`;

    if (format === 'png') {
      exportPNG(currentFlowerData, config, filename);
    } else {
      exportSVG(currentFlowerData, config, filename);
    }

  } catch (error) {
    console.error('Export error:', error);
    alert('Export failed: ' + error.message);
  }
}

// Export as PNG
function exportPNG(flowerData, config, filename) {
  const { width, height, transparent } = config;

  // Create composite SVG for export
  const svg = createCompositeSVG(flowerData, config);

  // Add embedded font
  const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
  style.textContent = `
    ${createFontFaceRule()}
    text {
      font-family: 'Satoshi-Medium', -apple-system, sans-serif;
      font-weight: 500;
    }
  `;
  svg.insertBefore(style, svg.firstChild);

  // Serialize SVG to string
  const svgString = new XMLSerializer().serializeToString(svg);
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  // Create image from SVG
  const img = new Image();
  img.onload = () => {
    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Fill background if not transparent
    if (!transparent) {
      ctx.fillStyle = '#F8F8FF';
      ctx.fillRect(0, 0, width, height);
    }

    // Draw image
    ctx.drawImage(img, 0, 0, width, height);

    // Convert to PNG and download
    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      downloadFile(url, filename);
      URL.revokeObjectURL(url);
    }, 'image/png');

    URL.revokeObjectURL(url);
  };

  img.onerror = (error) => {
    console.error('Image load error:', error);
    alert('Failed to export PNG');
    URL.revokeObjectURL(url);
  };

  img.src = url;
}

// Export as SVG
function exportSVG(flowerData, config, filename) {
  // Create composite SVG for export
  const svg = createCompositeSVG(flowerData, config);

  // Add embedded font
  const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
  style.textContent = `
    ${createFontFaceRule()}
    text {
      font-family: 'Satoshi-Medium', -apple-system, sans-serif;
      font-weight: 500;
    }
  `;
  svg.insertBefore(style, svg.firstChild);

  // Serialize SVG
  const svgString = new XMLSerializer().serializeToString(svg);
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  // Download
  downloadFile(url, filename);
  URL.revokeObjectURL(url);
}

// Helper to download file
function downloadFile(url, filename) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
