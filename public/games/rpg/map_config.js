// ====================================================================================
// MAP CONFIGURATION
// ====================================================================================
// This file contains the coordinates for the tactical item drop zones for each map.
//
// HOW TO USE:
// 1. For each map file (e.g., 'Dorf.png'), add an entry to the MAP_CONFIG object.
// 2. The value should be an array containing two objects, one for each drop zone.
// 3. Each object must have an 'x' and a 'y' property representing the coordinates.
//
// DEVELOPER TOOL:
// To easily find the coordinates for a map, open the battle screen in your browser,
// open the developer console (F12), and press the 'd' key. Now, when you click on
// the map, the coordinates will be logged to the console. Use these values here.
// ====================================================================================

const MAP_CONFIG = {
    // --- PLEASE FILL IN THE COORDINATES FOR EACH MAP ---
    // I have added some placeholder examples.

    'Dorf.png': [
        { x: 150, y: 200 }, // Placeholder for drop zone 1
        { x: 400, y: 350 }  // Placeholder for drop zone 2
    ],
    'Dunkel.png': [
        { x: 250, y: 598 },
        { x: 471, y: 680 }
    ],
    'Himmel.png': [
        { x: 200, y: 100 }, // Placeholder for drop zone 1
        { x: 450, y: 250 }  // Placeholder for drop zone 2
    ],
    'Höhle.png': [
        { x: 120, y: 220 }, // Placeholder for drop zone 1
        { x: 380, y: 400 }  // Placeholder for drop zone 2
    ],
    'Lava.png': [
        { x: 180, y: 180 }, // Placeholder for drop zone 1
        { x: 420, y: 320 }  // Placeholder for drop zone 2
    ],

    // --- MAPS BELOW STILL NEED COORDINATES ---
    'Ruine.png': [
        { x: 465, y: 552 },
        { x: 170, y: 550 }
    ],
    'Schlachtfeld.png': [
        { x: 389, y: 582 },
        { x: 164, y: 593 }
    ],
    'Wald.png': [
        { x: 399, y: 481 },
        { x: 185, y: 546 }
    ],
    'Winter.png': [
        { x: 467, y: 558 },
        { x: 261, y: 614 }
    ],
    'Wüste.png': [
        { x: 100, y: 100 },
        { x: 100, y: 100 }
    ]
};
