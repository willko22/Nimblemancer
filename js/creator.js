/**
 * Nimblemancer - Character Creator
 */

// Character state object
let character = {
    name: '',
    ancestry: null,
    class: null,
    background: null,
    statSpread: 'standard',
    stats: {
        str: null,
        dex: null,
        int: null,
        will: null
    },
    skills: [],
    equipment: []
};

// Stat spread definitions
const STAT_SPREADS = {
    standard: [2, 2, 0, -1],
    balanced: [2, 1, 1, 0],
    minmax: [3, 1, -1, -1]
};

let draggedValue = null;

// Load character from sessionStorage if exists
function loadCharacter() {
    const saved = sessionStorage.getItem('nimble_character_wip');
    if (saved) {
        try {
            const savedChar = JSON.parse(saved);
            // Merge saved data with defaults to ensure proper structure
            character = {
                ...character,
                ...savedChar,
                stats: {
                    str: savedChar.stats?.str || null,
                    dex: savedChar.stats?.dex || null,
                    int: savedChar.stats?.int || null,
                    will: savedChar.stats?.will || null
                },
                statSpread: savedChar.statSpread || 'standard'
            };
            console.log('Loaded work-in-progress character from session');
            // Restore name input
            const nameInput = document.getElementById('character-name');
            if (nameInput && character.name) {
                nameInput.value = character.name;
            }
        } catch (e) {
            console.error('Error loading character from session:', e);
        }
    }
}

// Save character to sessionStorage
function saveCharacter() {
    sessionStorage.setItem('nimble_character_wip', JSON.stringify(character));
    console.log('Character saved to session:', character);
}

// Update character and save
function updateCharacter(key, value) {
    character[key] = value;
    saveCharacter();
}

// Tab management
function initTabs() {
    const tabs = document.querySelectorAll('.tab');
    const panels = document.querySelectorAll('.tab-panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            
            // Remove active class from all tabs and panels
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding panel
            tab.classList.add('active');
            document.getElementById(`tab-${targetTab}`).classList.add('active');
        });
    });
}

// Load and display ancestries
async function loadAncestries() {
    try {
        const response = await fetch('assets/data/ancestries.json');
        const data = await response.json();
        const ancestryList = document.getElementById('ancestry-list');
        
        if (!ancestryList) return;
        
        ancestryList.innerHTML = '';
        
        data.ancestries.forEach(ancestry => {
            const card = document.createElement('div');
            card.className = 'selection-card';
            if (character.ancestry?.id === ancestry.id) {
                card.classList.add('selected');
            }
            
            card.innerHTML = `
                <h3>${ancestry.name}</h3>
                <div class="card-meta">
                    <div class="card-meta-item"><strong>${ancestry.size}</strong></div>
                </div>
                <p class="card-description">${ancestry.description}</p>
                <div class="ancestry-footer">
                    <div class="ancestry-trait">
                        <strong>${ancestry.trait.name}.</strong> ${ancestry.trait.effect}
                    </div>
                </div>
            `;
            
            card.addEventListener('click', () => {
                // Remove selected from all cards
                ancestryList.querySelectorAll('.selection-card').forEach(c => c.classList.remove('selected'));
                // Add selected to clicked card
                card.classList.add('selected');
                // Update character
                updateCharacter('ancestry', ancestry);
                // Mark tab as completed
                document.querySelector('[data-tab="ancestry"]').classList.add('completed');
            });
            
            ancestryList.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading ancestries:', error);
    }
}

// Stats System
function initStats() {
    console.log('Initializing stats system...');
    console.log('Current character stats:', character.stats);
    console.log('Current stat spread:', character.statSpread);
    
    // Ensure stat pool exists before trying to populate
    const poolElement = document.getElementById('stat-pool');
    if (!poolElement) {
        console.error('Stat pool element not found - retrying in 100ms');
        setTimeout(initStats, 100);
        return;
    }
    
    setupStatSpreadListeners();
    setupDropzones();
    populateStatPool();
    restoreStatAssignments();
    updateStatIndicators();
    checkStatsComplete();
    
    console.log('Stats system initialized');
}

function populateStatPool() {
    const pool = document.getElementById('stat-pool');
    if (!pool) {
        console.error('Stat pool element not found!');
        return;
    }
    
    const spread = STAT_SPREADS[character.statSpread];
    if (!spread) {
        console.error('Invalid stat spread:', character.statSpread);
        return;
    }
    
    pool.innerHTML = '';
    console.log('Populating stat pool with spread:', spread);
    
    spread.forEach((value, index) => {
        // Check if this value is already assigned
        const uniqueId = value + '_' + index;
        const isAssigned = Object.values(character.stats).includes(uniqueId);
        
        if (isAssigned) {
            console.log('Value already assigned:', uniqueId);
            return;
        }
        
        const chip = document.createElement('div');
        chip.className = 'stat-chip';
        chip.draggable = true;
        chip.dataset.value = value;
        chip.dataset.index = index;
        chip.dataset.uniqueId = uniqueId;
        chip.textContent = value >= 0 ? `+${value}` : value;
        
        chip.addEventListener('dragstart', (e) => {
            draggedValue = {
                value: value,
                index: index,
                uniqueId: uniqueId
            };
            chip.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });
        
        chip.addEventListener('dragend', () => {
            chip.classList.remove('dragging');
        });
        
        pool.appendChild(chip);
        console.log('Added stat chip:', value);
    });
    
    console.log('Stat pool populated with', pool.children.length, 'chips');
}

function setupStatSpreadListeners() {
    const radios = document.querySelectorAll('input[name="stat-spread"]');
    radios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            character.statSpread = e.target.value;
            character.stats = { str: null, dex: null, int: null, will: null };
            saveCharacter();
            populateStatPool();
            clearDropzones();
            updateStatIndicators();
            checkStatsComplete();
        });
    });
    
    // Restore selected spread
    const selectedRadio = document.querySelector(`input[name="stat-spread"][value="${character.statSpread}"]`);
    if (selectedRadio) selectedRadio.checked = true;
}

function setupDropzones() {
    const dropzones = document.querySelectorAll('.stat-dropzone');
    
    dropzones.forEach(zone => {
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('drag-over');
        });
        
        zone.addEventListener('dragleave', () => {
            zone.classList.remove('drag-over');
        });
        
        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('drag-over');
            
            if (!draggedValue) return;
            
            const targetStat = zone.dataset.stat;
            
            // Handle swapping if both source and target have values
            if (draggedValue.fromStat && character.stats[targetStat]) {
                // Swap the values
                const tempValue = character.stats[targetStat];
                character.stats[targetStat] = character.stats[draggedValue.fromStat];
                character.stats[draggedValue.fromStat] = tempValue;
            }
            // Handle moving from stat box to empty stat box
            else if (draggedValue.fromStat) {
                character.stats[draggedValue.fromStat] = null;
                character.stats[targetStat] = draggedValue.uniqueId;
            }
            // Handle dragging from pool (replace existing value if any)
            else {
                if (character.stats[targetStat]) {
                    // Old value returns to pool
                    character.stats[targetStat] = null;
                }
                character.stats[targetStat] = draggedValue.uniqueId;
            }
            
            saveCharacter();
            
            // Update UI
            populateStatPool();
            restoreStatAssignments();
            updateStatIndicators();
            checkStatsComplete();
            
            draggedValue = null;
        });
        
        // Make dropzone draggable when it has a value
        zone.addEventListener('mousedown', (e) => {
            if (!zone.classList.contains('has-value')) return;
            
            zone.draggable = true;
            const stat = zone.dataset.stat;
            const uniqueId = character.stats[stat];
            
            if (!uniqueId) return;
            
            const [value] = uniqueId.split('_');
            
            zone.addEventListener('dragstart', function dragStartHandler(e) {
                draggedValue = {
                    value: parseInt(value),
                    uniqueId: uniqueId,
                    fromStat: stat
                };
                zone.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                
                // Remove this listener after use
                zone.removeEventListener('dragstart', dragStartHandler);
            });
        });
        
        zone.addEventListener('dragend', () => {
            zone.classList.remove('dragging');
            zone.draggable = false;
        });
    });
}

function clearDropzones() {
    document.querySelectorAll('.stat-dropzone').forEach(zone => {
        zone.querySelector('.stat-value').textContent = 'Drop here';
        zone.classList.remove('has-value');
    });
}

function restoreStatAssignments() {
    Object.keys(character.stats).forEach(stat => {
        const uniqueId = character.stats[stat];
        if (uniqueId) {
            const [value] = uniqueId.split('_');
            const zone = document.querySelector(`.stat-dropzone[data-stat="${stat}"]`);
            if (zone) {
                const numValue = parseInt(value);
                zone.querySelector('.stat-value').textContent = numValue >= 0 ? `+${numValue}` : numValue;
                zone.classList.add('has-value');
            }
        } else {
            // Ensure empty zones are cleared
            const zone = document.querySelector(`.stat-dropzone[data-stat="${stat}"]`);
            if (zone) {
                zone.querySelector('.stat-value').textContent = 'Drop here';
                zone.classList.remove('has-value');
            }
        }
    });
}

function updateStatIndicators() {
    // Reset all indicators
    document.querySelectorAll('.stat-key, .stat-advantage, .stat-disadvantage').forEach(el => {
        el.style.display = 'none';
    });
    
    // TODO: Show indicators based on class key stat, ancestry bonuses, etc.
    // For now, this is a placeholder for when class data is available
    
    // Example logic (to be implemented with class data):
    // if (character.class?.keyStat === 'str') {
    //     document.querySelector('.stat-box[data-stat="str"] .stat-key').style.display = 'inline';
    // }
}

function checkStatsComplete() {
    const allAssigned = Object.values(character.stats).every(val => val !== null);
    const tab = document.querySelector('[data-tab="stats"]');
    if (allAssigned && tab) {
        tab.classList.add('completed');
    } else if (tab) {
        tab.classList.remove('completed');
    }
}

console.log(JSON.stringify(character, null, 2));

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    loadCharacter();
    initTabs();
    loadAncestries();
    
    // Initialize stats immediately
    initStats();
    
    // Wire up name input
    const nameInput = document.getElementById('character-name');
    if (nameInput) {
        nameInput.addEventListener('input', (e) => {
            updateCharacter('name', e.target.value);
        });
    }
    
    console.log('%c ⚔️ Character Creator Initialized', 'color: #dcb386; font-weight: bold; background: #2b2b2b; padding: 4px;');
});
