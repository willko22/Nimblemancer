document.addEventListener('DOMContentLoaded', () => {
    const galleryList = document.getElementById('gallery-list');
    const emptyState = document.getElementById('gallery-empty');
    const importBtn = document.getElementById('btn-import-hero');

    // Check for characters
    const storedCharacters = localStorage.getItem('nimble_characters');
    let characters = [];
    
    try {
        if (storedCharacters) {
            characters = JSON.parse(storedCharacters);
        }
    } catch (e) {
        console.error("Error parsing characters", e);
    }

    if (!characters || characters.length === 0) {
        // Empty State
        if (galleryList) galleryList.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
    } else {
        // List State
        if (emptyState) emptyState.style.display = 'none';
        if (galleryList) {
            galleryList.style.display = 'block';
            // Placeholder logic for list
            galleryList.innerHTML = `<p>Found ${characters.length} heroes.</p>`;
        }
    }

    // Import button logic
    const fileInput = document.getElementById('file-input-json');
    const dragOverlay = document.getElementById('drag-overlay');
    
    // File/Folder Import
    if (importBtn && fileInput) {
        importBtn.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (event) => {
            handleFiles(event.target.files);
        });
    }

    // Drag and Drop
    let dragCounter = 0;

    document.body.addEventListener('dragenter', (e) => {
        e.preventDefault();
        dragCounter++;
        if (dragOverlay) dragOverlay.style.display = 'flex';
    });

    document.body.addEventListener('dragover', (e) => {
        e.preventDefault(); // Necessary to allow dropping
    });

    document.body.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dragCounter--;
        if (dragCounter === 0) {
             if (dragOverlay) dragOverlay.style.display = 'none';
        }
    });

    document.body.addEventListener('drop', (e) => {
        e.preventDefault();
        dragCounter = 0;
        if (dragOverlay) dragOverlay.style.display = 'none';

        if (e.dataTransfer && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    });

    function handleFiles(files) {
        if (files && files.length > 0) {
            console.log(`User selected/dropped ${files.length} files.`);
            // Filter for JSON if needed, though input accepts .json, drop might not
            const jsonFiles = Array.from(files).filter(f => f.name.endsWith('.json'));
            
            if (jsonFiles.length > 0) {
                 console.log("JSON Files:", jsonFiles);
                 alert(`Selected ${jsonFiles.length} JSON files. Ready to import!`);
            } else {
                console.log("No JSON files found in selection.");
            }
        }
    }
});
