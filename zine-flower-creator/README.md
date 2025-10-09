# Zine Flower Creator

A private, standalone tool for exporting flower visualizations for the Recursive Flora Zine.

## Features

- **Flower Rendering**: Renders data flowers using the same renderer as the public site
- **Petal Texture**: Includes texture overlay on petals (matching public site)
- **Radial Grid**: Displays the base grid with 11 radial spokes and 4 concentric circles
- **Clock-Style Labels**: Numbers 1-11 positioned upright around the circumference (Satoshi Medium, 24px)
- **Configurable Export**: Width, height, padding, transparency options
- **Dual Export Formats**: PNG or SVG with one-click download

## Usage

### 1. **Start the Local Server** (Required)

Due to browser CORS restrictions, you must run a local server to load textures:

**Option A: Use the provided script**
```bash
./start-server.sh
```
Then open: http://localhost:8080/index.html

**Option B: Manual server**
```bash
cd zine-flower-creator
python3 -m http.server 8080
```
Then open: http://localhost:8080/index.html

⚠️ **Don't open `index.html` directly** - it won't load textures due to CORS

### 2. **Configure Settings**
   - **Width/Height**: Set output dimensions (default: 1200×1200px)
   - **Padding**: Outer margin around the image (default: 40px)
   - **Transparent**: Enable for transparent PNG background
   - **Show Labels**: Toggle sector numbers 1-11

### 3. **Input Data**
   - Paste flower JSON data in the textarea
   - Use "Load Sample Data" for example
   - Click "Update Preview" to render

### 4. **Export**
   - Select format: PNG or SVG
   - Click "Export Image"
   - File saves as `flower-YYYYMMDD-HHMM.[ext]`

## Data Format

The tool expects JSON data matching the public site's format:

```json
{
  "MetaphorID": "ID1",
  "Metaphor": "World is moving but I'm not moving along with it",
  "Fear": "6.07%",
  "Anger": "12.73%",
  "Disgust": "25.55%",
  "Pessimism": "51.23%",
  "Sadness": "82.55%",
  "Anticipation": "14.25%",
  "Surprise": "1.25%",
  "Optimism": "20.87%",
  "Joy": "2.19%",
  "Love": "0.47%",
  "Trust": "1.77%",
  "Category": "Temporal Disconnection",
  "Dominant Emotion": "Sadness"
}
```

## Sector Label Mapping

Labels are numbered 1-11, starting from fear (12°) and proceeding clockwise:

1. Fear (12°)
2. Anger (36°)
3. Disgust (60°)
4. Pessimism (84°)
5. Sadness (108°)
6. Anticipation (150°)
7. Surprise (210°)
8. Optimism (255°)
9. Joy (285°)
10. Love (315°)
11. Trust (345°)

## Technical Details

- **No External Dependencies**: All code is self-contained
- **No Server Required**: Runs entirely in the browser
- **No Analytics**: Private tool with no tracking
- **Read-Only Source**: Does not modify `/public` files
- **Export Only**: No writes to filesystem except downloads

## Files

- `index.html` - Main interface
- `flower-lib.js` - Flower renderer and grid logic (extracted from public code)
- `flower-export.js` - Export functionality (PNG/SVG)
- `styles.css` - UI styles
- `sample-data.json` - Example flower data
- `README.md` - This file

## Browser Support

Works in all modern browsers that support:
- SVG rendering
- Canvas API
- ES6+ JavaScript
- File download API

Tested in: Chrome, Firefox, Safari, Edge

## Notes

- Preview shows actual size at 100% zoom
- PNG export respects transparency setting
- SVG export includes embedded font fallbacks
- Labels are positioned outside the outer grid circle
- Flower is scaled to fit within the grid boundaries
