/**
 * Nimblemancer - Entry Point
 */

const FLAVOR_TEXTS = [
    "Sharpening swords...",
    "Memorizing spells...",
    "Brewing potions...",
    "Checking for traps...",
    "Rolling for initiative...",
    "Casting FIREBALL!!!..."
];

function init() {
    printFlavorText();
    setupEventListeners();
}

function printFlavorText() {
    const randomText = FLAVOR_TEXTS[Math.floor(Math.random() * FLAVOR_TEXTS.length)];
    console.log(`%c 📜 Nimblemancer: ${randomText}`, 'color: #dcb386; font-weight: bold; background: #2b2b2b; padding: 4px;');
}

function setupEventListeners() {
    const loadHeroBtn = document.getElementById('btn-load-hero');
    const loadPartyBtn = document.getElementById('btn-load-party');

    if (loadHeroBtn) {
        loadHeroBtn.addEventListener('click', () => {
            console.log('Load Hero: Not implemented yet.');
            alert('File import coming soon!');
        });
    }

    if (loadPartyBtn) {
        loadPartyBtn.addEventListener('click', () => {
            console.log('Load Party: Not implemented yet.');
            alert('Folder import coming soon!');
        });
    }
}

// Initialize when module loads
init();
