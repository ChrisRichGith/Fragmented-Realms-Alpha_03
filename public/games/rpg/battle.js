document.addEventListener('DOMContentLoaded', () => {

    // --- DATA ---
    const MAP_IMAGES = [
        'Dorf.png', 'Dunkel.png', 'Himmel.png', 'Höhle.png', 'Lava.png',
        'Ruine.png', 'Schlachtfeld.png', 'Wald.png', 'Winter.png', 'Wüste.png'
    ];

    const TACTIC_ITEM_IMAGES = [
        'Altar.png', 'Arkan.png', 'Dunkelwolke.png', 'Fass.png', 'Schildwall.png', 'Turm.png'
    ];

    let currentMap = ''; // Variable to store the current map filename

    // --- DOM Elements ---
    const playerCardContainer = document.getElementById('player-character-card');
    const npcCardsContainer = document.getElementById('npc-character-cards');
    const centerPanel = document.getElementById('center-panel');
    const battleMapImage = document.getElementById('battle-map');
    const tacticItemsContainer = document.getElementById('tactic-items');

    // --- FUNCTIONS ---

    function getRandomElement(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function selectRandomTacticItems() {
        const shuffled = TACTIC_ITEM_IMAGES.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 2);
    }

    function displayMap() {
        const randomMap = getRandomElement(MAP_IMAGES);
        currentMap = randomMap; // Store the current map
        battleMapImage.src = `/images/RPG/Background/${randomMap}`;
        battleMapImage.onload = () => {
            // Wait for the map image to load before creating drop zones
            createDropZones(randomMap);
        };
    }

    function createDropZones(mapFileName) {
        // Clear existing drop zones
        const existingZones = document.querySelectorAll('.drop-zone');
        existingZones.forEach(zone => zone.remove());

        if (MAP_CONFIG && MAP_CONFIG[mapFileName]) {
            const coordinates = MAP_CONFIG[mapFileName];
            coordinates.forEach((coord, index) => {
                const zone = document.createElement('div');
                zone.className = 'drop-zone';
                zone.id = `drop-zone-${index}`;
                zone.style.left = `${coord.x}px`;
                zone.style.top = `${coord.y}px`;

                // Event Listeners for Drop
                zone.addEventListener('dragover', (e) => {
                    e.preventDefault(); // Necessary to allow dropping
                    zone.classList.add('drag-over');
                });

                zone.addEventListener('dragleave', () => {
                    zone.classList.remove('drag-over');
                });

                zone.addEventListener('drop', (e) => {
                    e.preventDefault();
                    zone.classList.remove('drag-over');
                    const itemId = e.dataTransfer.getData('text/plain');
                    const itemElement = document.getElementById(itemId);
                    if (itemElement && zone.childElementCount === 0) { // Allow drop only if zone is empty
                        zone.appendChild(itemElement);
                        itemElement.style.position = 'static'; // Reset position
                    }
                });

                centerPanel.appendChild(zone);
            });
        }
    }

    function displayTacticItems() {
        const selectedItems = selectRandomTacticItems();
        tacticItemsContainer.innerHTML = ''; // Clear previous items
        selectedItems.forEach((itemImage, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'tactic-item';
            itemDiv.id = `tactic-item-${index}`; // Assign a unique ID
            itemDiv.draggable = true;

            const img = document.createElement('img');
            img.src = `/images/RPG/Taktikitems/${itemImage}`;
            img.alt = itemImage.replace('.png', '');
            // The parent div is draggable, not the image itself
            img.draggable = false;

            itemDiv.appendChild(img);
            tacticItemsContainer.appendChild(itemDiv);

            // Event Listener for Drag Start
            itemDiv.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', e.target.id);
                e.dataTransfer.effectAllowed = 'move';
            });
        });
    }

    function createCharacterCard(characterData) {
        if (!characterData) return null;

        const card = document.createElement('div');
        card.className = 'char-card';

        const name = characterData.name || 'Unknown';
        const image = characterData.image || '/images/RPG/Charakter/male_silhouette.svg';

        card.innerHTML = `
            <img src="${image}" alt="${name}">
            <h3>${name}</h3>
        `;
        return card;
    }

    function displayCharacters() {
        const playerCharData = JSON.parse(localStorage.getItem('selectedCharacter'));
        if (playerCharData) {
            const playerCard = createCharacterCard(playerCharData);
            playerCardContainer.appendChild(playerCard);
        }

        const npcPartyData = JSON.parse(localStorage.getItem('npcParty')) || [];
        npcCardsContainer.innerHTML = '';
        npcPartyData.forEach(npcData => {
            if (npcData) {
                const npcCard = createCharacterCard(npcData);
                if(npcCard) npcCardsContainer.appendChild(npcCard);
            }
        });
    }


    // --- UTILITIES / DEV TOOLS ---
    function setupCoordinateHelper() {
        let devModeActive = false;
        const devModeToggleKey = 'd';

        window.addEventListener('keydown', (e) => {
            if (e.key === devModeToggleKey) {
                devModeActive = !devModeActive;
                if (devModeActive) {
                    console.log(`%c[Dev Tool] Coordinate helper ACTIVATED. Click on the map to get coordinates. Press '${devModeToggleKey}' again to disable.`, 'color: limegreen; font-weight: bold;');
                    centerPanel.style.cursor = 'crosshair';
                } else {
                    console.log(`%c[Dev Tool] Coordinate helper DEACTIVATED.`, 'color: orange; font-weight: bold;');
                    centerPanel.style.cursor = 'default';
                }
            }
        });

        centerPanel.addEventListener('click', (e) => {
            if (!devModeActive) return;

            const rect = centerPanel.getBoundingClientRect();
            // The coordinates are relative to the centerPanel, which is the container for the drop zones.
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            console.log(`%c[Dev Tool] Coordinates: { x: ${Math.round(x)}, y: ${Math.round(y)} }`, 'color: cyan;');
        });
    }

    // --- INITIALIZATION ---
    function init() {
        displayMap();
        displayTacticItems();
        displayCharacters();
        setupCoordinateHelper(); // Initialize the helper tool
        console.log(`%cPress the '${'d'}' key to toggle the coordinate finder tool.`, 'color: yellow; font-size: 12px;');
    }

    init();
});
