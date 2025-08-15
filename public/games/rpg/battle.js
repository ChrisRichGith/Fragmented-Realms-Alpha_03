document.addEventListener('DOMContentLoaded', () => {

    // --- DATA ---
    const MAP_IMAGES = [
        'Dorf.png', 'Dunkel.png', 'Himmel.png', 'Höhle.png', 'Lava.png',
        'Ruine.png', 'Schlachtfeld.png', 'Wald.png', 'Winter.png', 'Wüste.png'
    ];
    const TACTIC_ITEM_IMAGES = [
        'Altar.png', 'Arkan.png', 'Dunkelwolke.png', 'Fass.png', 'Schildwall.png', 'Turm.png'
    ];
    let currentMap = '';
    // This will hold a deep copy of the original config for safe editing
    let MAP_CONFIG_EDITABLE = {};

    // --- DOM Elements ---
    const playerCardContainer = document.getElementById('player-character-card');
    const npcCardsContainer = document.getElementById('npc-character-cards');
    const centerPanel = document.getElementById('center-panel');
    const battleMapImage = document.getElementById('battle-map');
    const tacticItemsContainer = document.getElementById('tactic-items');

    // --- CORE GAME FUNCTIONS ---

    function getRandomElement(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function selectRandomTacticItems() {
        const shuffled = TACTIC_ITEM_IMAGES.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 2);
    }

    function displayMap() {
        const randomMap = getRandomElement(MAP_IMAGES);
        currentMap = randomMap;
        battleMapImage.src = `/images/RPG/Background/${randomMap}`;
        battleMapImage.onload = () => {
            // Create a deep copy of the config for editing, to avoid modifying the original object
            // until the user explicitly saves.
            MAP_CONFIG_EDITABLE = JSON.parse(JSON.stringify(MAP_CONFIG));
            createDropZones(randomMap);
            // Re-initialize edit mode in case map changes, to apply draggability correctly
            setupEditMode(true);
        };
    }

    function createDropZones(mapFileName, useEditableConfig = true) {
        const existingZones = document.querySelectorAll('.drop-zone');
        existingZones.forEach(zone => zone.remove());

        const config = useEditableConfig ? MAP_CONFIG_EDITABLE : MAP_CONFIG;

        if (config && config[mapFileName]) {
            const coordinates = config[mapFileName];
            coordinates.forEach((coord, index) => {
                const zone = document.createElement('div');
                zone.className = 'drop-zone';
                zone.id = `drop-zone-${index}`;
                zone.style.left = `${coord.x}px`;
                zone.style.top = `${coord.y}px`;
                zone.dataset.index = index; // Store index for easy access

                zone.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    if (!zone.classList.contains('edit-mode')) {
                        zone.classList.add('drag-over');
                    }
                });
                zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
                zone.addEventListener('drop', (e) => {
                    e.preventDefault();
                    zone.classList.remove('drag-over');
                    const itemId = e.dataTransfer.getData('text/plain');
                    const itemElement = document.getElementById(itemId);
                    if (itemElement && zone.childElementCount === 0) {
                        zone.appendChild(itemElement);
                        itemElement.style.position = 'static';
                    }
                });
                centerPanel.appendChild(zone);
            });
        }
    }

    function displayTacticItems() {
        const selectedItems = selectRandomTacticItems();
        tacticItemsContainer.innerHTML = '';
        selectedItems.forEach((itemImage, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'tactic-item';
            itemDiv.id = `tactic-item-${index}`;
            itemDiv.draggable = true;
            const img = document.createElement('img');
            img.src = `/images/RPG/Taktikitems/${itemImage}`;
            img.alt = itemImage.replace('.png', '');
            img.draggable = false;
            itemDiv.appendChild(img);
            tacticItemsContainer.appendChild(itemDiv);
            itemDiv.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', e.target.id);
                e.dataTransfer.effectAllowed = 'move';
            });
        });
    }

    // --- CHARACTER CARD FUNCTIONS ---

    function createCharacterCard(characterData) {
        if (!characterData) return null;

        const card = document.createElement('div');
        card.className = 'char-card';

        const name = characterData.name || 'Unknown';
        const imageSrc = characterData.image || '/images/RPG/Charakter/male_silhouette.svg';

        // Create image element
        const img = document.createElement('img');
        img.src = imageSrc;
        img.alt = name;

        // Create info container
        const infoDiv = document.createElement('div');
        infoDiv.className = 'char-card-info';
        const nameHeader = document.createElement('h3');
        nameHeader.textContent = name;
        infoDiv.appendChild(nameHeader);
        // More stats could be added here in the future

        // Create the new drop zone for this character
        const dropZone = document.createElement('div');
        dropZone.className = 'char-drop-zone';

        // Add event listeners for the character drop zone
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('drag-over');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            const itemId = e.dataTransfer.getData('text/plain');
            const itemElement = document.getElementById(itemId);

            // Allow drop only if the zone is empty
            if (itemElement && dropZone.childElementCount === 0) {
                // If the item comes from another character's drop zone, move it back first
                if (itemElement.parentElement.classList.contains('char-drop-zone')) {
                    // This logic can be enhanced, for now, we just append
                }
                dropZone.appendChild(itemElement);
            }
        });

        card.appendChild(img);
        card.appendChild(infoDiv);
        card.appendChild(dropZone);

        return card;
    }

    function displayCharacters() {
        // Clear previous cards
        playerCardContainer.innerHTML = '';
        npcCardsContainer.innerHTML = '';

        // Get player character from localStorage
        const playerCharData = JSON.parse(localStorage.getItem('selectedCharacter'));
        if (playerCharData) {
            const playerCard = createCharacterCard(playerCharData);
            if (playerCard) playerCardContainer.appendChild(playerCard);
        }

        // Get NPC party from localStorage
        const npcPartyData = JSON.parse(localStorage.getItem('npcParty')) || [];
        npcPartyData.forEach(npcData => {
            if (npcData) { // Check if the slot is not empty
                const npcCard = createCharacterCard(npcData);
                if (npcCard) npcCardsContainer.appendChild(npcCard);
            }
        });
    }

    // --- COORDINATE EDIT MODE ---

    let isEditModeInitialized = false;
    function setupEditMode(reinitializing = false) {
        if (isEditModeInitialized && !reinitializing) return;

        let editModeActive = false;
        const toggleKey = 'd';
        let saveButton = null;

        const handleZoneDragEnd = (e) => {
            e.preventDefault();
            const zone = e.target;
            const zoneIndex = zone.dataset.index;
            const panelRect = centerPanel.getBoundingClientRect();

            // Calculate new position relative to the center panel
            let newX = e.clientX - panelRect.left;
            let newY = e.clientY - panelRect.top;

            // Constrain to panel boundaries
            newX = Math.max(0, Math.min(newX, panelRect.width - zone.offsetWidth));
            newY = Math.max(0, Math.min(newY, panelRect.height - zone.offsetHeight));

            // Update visually
            zone.style.left = `${newX}px`;
            zone.style.top = `${newY}px`;

            // Update in-memory configuration
            if (MAP_CONFIG_EDITABLE[currentMap] && MAP_CONFIG_EDITABLE[currentMap][zoneIndex]) {
                MAP_CONFIG_EDITABLE[currentMap][zoneIndex].x = Math.round(newX);
                MAP_CONFIG_EDITABLE[currentMap][zoneIndex].y = Math.round(newY);
            }
        };

        const toggleZoneDraggability = (isDraggable) => {
            document.querySelectorAll('.drop-zone').forEach(zone => {
                zone.draggable = isDraggable;
                zone.classList.toggle('edit-mode', isDraggable);
                if (isDraggable) {
                    zone.addEventListener('dragend', handleZoneDragEnd);
                } else {
                    zone.removeEventListener('dragend', handleZoneDragEnd);
                }
            });
        };

        const saveConfiguration = async () => {
            try {
                const response = await fetch('/api/rpg/mapconfig', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(MAP_CONFIG_EDITABLE, null, 4)
                });
                const result = await response.json();
                if (response.ok) {
                    alert('Konfiguration erfolgreich gespeichert!');
                    // Update original MAP_CONFIG with new data to reflect the saved state
                    Object.assign(MAP_CONFIG, MAP_CONFIG_EDITABLE);
                } else {
                    throw new Error(result.message || 'Speichern fehlgeschlagen.');
                }
            } catch (error) {
                console.error('Error saving map configuration:', error);
                alert(`Fehler beim Speichern: ${error.message}`);
            }
        };

        const toggleEditMode = (forceState) => {
            editModeActive = (forceState !== undefined) ? forceState : !editModeActive;

            toggleZoneDraggability(editModeActive);

            if (editModeActive) {
                if (!saveButton) {
                    saveButton = document.createElement('button');
                    saveButton.textContent = 'Koordinaten speichern';
                    saveButton.id = 'save-coords-button';
                    centerPanel.appendChild(saveButton);
                    saveButton.addEventListener('click', saveConfiguration);
                }
                saveButton.style.display = 'block';
                console.log(`%c[Edit Mode] ACTIVATED. Drag drop zones to new positions. Press '${toggleKey}' to exit.`, 'color: limegreen; font-weight: bold;');
            } else {
                if (saveButton) {
                    saveButton.style.display = 'none';
                }
                console.log(`%c[Edit Mode] DEACTIVATED.`, 'color: orange; font-weight: bold;');
            }
        };

        if (!isEditModeInitialized) {
            window.addEventListener('keydown', (e) => {
                if (e.key === toggleKey) toggleEditMode();
            });
            console.log(`%cPress the '${toggleKey}' key to toggle Drop Zone Edit Mode.`, 'color: yellow; font-size: 12px;');
        }

        // When re-initializing (e.g. after map load), ensure edit mode state is reapplied
        if (reinitializing) {
            toggleEditMode(editModeActive);
        }

        isEditModeInitialized = true;
    }


    // --- INITIALIZATION ---
    function init() {
        displayMap();
        displayTacticItems();
        displayCharacters();
        setupEditMode();
    }

    init();
});
