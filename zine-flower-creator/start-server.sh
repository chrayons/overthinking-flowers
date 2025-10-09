#!/bin/bash
# Start local server for Zine Flower Creator
# This is needed to avoid CORS issues when loading textures and data

echo "Starting local server on port 8080..."
echo "Open: http://localhost:8080/index.html"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

cd "$(dirname "$0")"
python3 -m http.server 8080
