console.log("Home.js file is loading");
console.log("Testing if shared.js loaded:", typeof parseFlowerData);

console.log("Home page loading...");

// Test that shared.js is loaded
fetch('../data.json')
    .then(response => response.json())
    .then(rawData => {
        const flowers = parseFlowerData(rawData);
        console.log("Home page loaded", flowers.length, "flowers");
        
        // Just display first flower for now to test
        createFlower(flowers[0], 100, 100);
    })
    .catch(error => {
        console.error("Error loading data:", error);
    });