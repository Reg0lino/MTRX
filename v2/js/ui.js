// =============================================================================
// js/ui.js - HUD, Menu Effects, Debug Map
// Version: 1.47h (Initialization Fixes)
// =============================================================================

// Relies on constants from constants.js
// Relies on globals from main.js:
//      hud*, blocker*, instructions*, glitch*, static*, menuEffectInterval, damageOverlay*, version*, debugMap*, // Global DOM Elements
//      camera, agents, activeRabbits, mazeGrid, mazeExitPosition, // Game Data
//      playerHP, isReloading, reloadTimer, currentAmmo, agentsRemaining, // Player State
//      isPointerLocked, gameOver, gameWon, // Game State
//      mapDisplayTimer, DEBUG_MAP_VISIBLE // Timers & Debug Flags
// Relies on functions: worldToGrid (environment.js)

console.log("Loading ui.js..."); // Log loading

// --- Global Element References are declared in main.js ---
// This module will POPULATE those global variables in setupHUD()

function setupHUD(){
    console.log("BJS [ui.js]: setupHUD called - Populating GLOBAL element references...");

    // Fetch elements and assign to GLOBAL variables declared in main.js
    hudHpBarFill = document.getElementById('hpBarFill');
    hudWeaponName = document.getElementById('weaponName');
    hudAmmoCount = document.getElementById('ammoCount');
    hudReloadIndicator = document.getElementById('reloadIndicator');
    hudReloadProgress = document.getElementById('reloadProgress');
    hudAgentCount = document.getElementById('agentCount');
    damageOverlayElement = document.getElementById('damageOverlay');
    versionInfoElement = document.getElementById('versionInfo');
    blockerElement = document.getElementById('blocker');
    instructionsElement = document.getElementById('instructions');
    glitchTitleElement = document.getElementById('glitchTitle'); // Get specific spans inside instructions
    staticInstructionsElement = document.getElementById('staticInstructions');
    debugMapCanvas = document.getElementById('debugMapCanvas');

    // --- Check if all essential elements were found ---
    let allFound = true;
    const elementsToCheck = {
        hudHpBarFill, hudWeaponName, hudAmmoCount, hudReloadIndicator, hudReloadProgress,
        hudAgentCount, damageOverlayElement, versionInfoElement, blockerElement,
        instructionsElement, glitchTitleElement, staticInstructionsElement, debugMapCanvas
    };
    for (const key in elementsToCheck) {
        if (!elementsToCheck[key]) {
            console.error(`CRITICAL [ui.js]: UI element with ID "${elementsToCheck[key]?.id || key}" missing from HTML!`);
            allFound = false; // Flag it, but don't necessarily stop execution
        }
    }

    // Get debug map context if canvas exists
    if (debugMapCanvas) {
        debugMapCtx = debugMapCanvas.getContext('2d');
        // Set initial size and corner position
        debugMapCanvas.width = DEBUG_MAP_CANVAS_SIZE;
        debugMapCanvas.height = DEBUG_MAP_CANVAS_SIZE;
        debugMapCanvas.className = 'map-bottom-right'; // Default corner
    } else {
        console.warn("Debug map canvas not found.");
    }

    // --- Initial Static Setup ---
    if(hudWeaponName) hudWeaponName.textContent="9mm";
    if(versionInfoElement) versionInfoElement.textContent = `v1.47h (BJS)`; // Use current version

    // --- Initial Update & Log ---
    if (allFound) {
        updateHUD(); // Perform initial update with default values
        console.log("BJS [ui.js]: HUD setup complete. Global references populated.");
    } else {
         console.warn("BJS [ui.js]: HUD setup potentially incomplete due to missing elements.");
    }
    return allFound; // Return success status
}

function updateHUD(time = 0){
    // Requires GLOBAL variables populated by setupHUD and updated in main.js
    // Requires constants: PLAYER_MAX_HP, HUD_*, GUN_*
    // Requires functions: applyGlitchToElement (local)

    // --- HP Bar ---
    if(hudHpBarFill) {
        const hpP = Math.max(0, playerHP) / PLAYER_MAX_HP * 100;
        hudHpBarFill.style.width = `${hpP}%`;
        // Shimmer effect
        if (playerHP > 0) {
            const baseLightness = 70; // Base lightness % for HSL color
            const shimmer = Math.sin(time * HUD_HP_BAR_SHIMMER_SPEED) * HUD_HP_BAR_SHIMMER_AMOUNT;
            hudHpBarFill.style.backgroundColor = `hsl(120, 100%, ${Math.max(30, Math.min(90, baseLightness + shimmer))}%)`;
        } else {
            hudHpBarFill.style.backgroundColor = `hsl(120, 100%, 30%)`; // Dim color when HP is 0
        }
    } else { /* console.warn("hudHpBarFill not found in updateHUD"); */ } // Avoid spamming logs

    // Check pointer lock state (used for glitch effect)
    const locked = isPointerLocked;

    // --- Agent Count ---
    if(hudAgentCount) {
        const currentCountText = `${agentsRemaining}`;
        // Apply glitch if value changed OR game ended OR pointer unlocked
        if (hudAgentCount.dataset.value !== currentCountText || gameOver || gameWon || !locked) {
            applyGlitchToElement(hudAgentCount, HUD_TEXT_GLITCH_INTENSITY, HUD_TEXT_GLITCH_CHARS, currentCountText);
            hudAgentCount.dataset.value = currentCountText; // Store current value for comparison
        } else {
            // If no glitch needed, ensure innerHTML matches (in case glitch was interrupted)
            if (hudAgentCount.innerHTML !== currentCountText) hudAgentCount.innerHTML = currentCountText;
        }
    } else { /* console.warn("hudAgentCount not found"); */ }

    // --- Ammo Count & Reload Indicator ---
    if(hudAmmoCount && hudReloadIndicator && hudReloadProgress) {
        if(isReloading){
            const reloadingText = "Reloading...";
            // Always show "Reloading..." text while reloading
            if (hudAmmoCount.textContent !== reloadingText) {
                hudAmmoCount.textContent = reloadingText;
            }
            hudAmmoCount.dataset.value = reloadingText; // Update data value
            hudReloadIndicator.style.display = 'block'; // Show spinner
            // Update spinner progress
            const p = Math.max(0, (GUN_RELOAD_TIME - reloadTimer) / GUN_RELOAD_TIME) * 100;
            hudReloadProgress.style.strokeDasharray = `${p} 100`;
        } else {
            // Display current ammo count
            const ammoText = `${currentAmmo} / ∞`; // Assuming infinite reserve for now
            // Apply glitch if value changed OR game ended OR pointer unlocked
            if (hudAmmoCount.dataset.value !== ammoText || gameOver || gameWon || !locked) {
                applyGlitchToElement(hudAmmoCount, HUD_TEXT_GLITCH_INTENSITY, HUD_TEXT_GLITCH_CHARS, ammoText);
                hudAmmoCount.dataset.value = ammoText; // Store current value
            } else {
                // If no glitch needed, ensure innerHTML matches
                if (hudAmmoCount.innerHTML !== ammoText) hudAmmoCount.innerHTML = ammoText;
            }
            hudReloadIndicator.style.display = 'none'; // Hide spinner
            hudReloadProgress.style.strokeDasharray = '0 100'; // Reset spinner
        }
    } else { /* console.warn("ammo/reload elements not found"); */ }
}


// =============================================================================
// Menu Effects (Glitch)
// =============================================================================

// Applies random character replacement to an element's innerHTML
function applyGlitchToElement(el, intensity = 0.05, chars = MENU_GLITCH_CHARS, originalText = null) {
    if (!el) return; // Safety check

    // Determine the base text to glitch
    let textToGlitch = originalText !== null ? originalText : (el.dataset?.originalText || el.textContent);
    // Fallback if textContent is empty but innerText might have something (less likely needed now)
    if (!textToGlitch && originalText === null) textToGlitch = el.innerText;
    if (!textToGlitch) return; // Cannot glitch empty text

    // Store the original text if provided or not already stored
    if (originalText !== null && el.dataset?.originalText !== originalText) {
        el.dataset.originalText = originalText;
    } else if (!el.dataset?.originalText) {
         el.dataset.originalText = textToGlitch;
    }

    const len = textToGlitch.length;
    let result = '';
    // Iterate through the text
    for (let i = 0; i < len; i++) {
        // --- Skip HTML tags ---
        if (textToGlitch[i] === '<') {
            let tagEnd = textToGlitch.indexOf('>', i);
            if (tagEnd !== -1) {
                result += textToGlitch.substring(i, tagEnd + 1); // Append the whole tag
                i = tagEnd; // Move index past the tag
                continue; // Skip to next character after tag
            }
            // If no closing '>', treat '<' as normal character (edge case)
        }
        // --- Apply Glitch ---
        // Replace character randomly based on intensity
        result += (Math.random() < intensity) ? chars[Math.floor(Math.random() * chars.length)] : textToGlitch[i];
    }

    // Update element only if the content changed to prevent unnecessary DOM manipulation
    if (el.innerHTML !== result) {
        el.innerHTML = result;
    }
}

// Function called periodically by setInterval to apply glitch effect to the menu title
function applyMenuEffects(){
    // Only apply effect if blocker is visible and the title element exists
    if(blockerElement && blockerElement.style.display !== 'none' && glitchTitleElement){
        applyGlitchToElement(glitchTitleElement, 0.15, MENU_GLITCH_CHARS); // Use higher intensity for title
    }
}

// Starts the interval timer for menu effects
function startMenuEffects(){
    // Only start if interval isn't already running and title element exists
    if(!menuEffectInterval && glitchTitleElement){
        // Ensure original text is stored before starting
        if(!glitchTitleElement.dataset.originalText) {
            glitchTitleElement.dataset.originalText = glitchTitleElement.innerText; // Store initial text if not already set
        }
        // Ensure static instructions are reset to original if needed
        if (staticInstructionsElement && staticInstructionsElement.dataset.originalText && staticInstructionsElement.innerHTML !== staticInstructionsElement.dataset.originalText) {
             staticInstructionsElement.innerHTML = staticInstructionsElement.dataset.originalText;
        }
        clearInterval(menuEffectInterval); // Clear any existing interval just in case
        menuEffectInterval = setInterval(applyMenuEffects, 80); // Start new interval (80ms = ~12.5fps)
    }
}

// Stops the interval timer and restores original text
function stopMenuEffects(){
    if(menuEffectInterval){
        clearInterval(menuEffectInterval);
        menuEffectInterval = null; // Clear interval ID
        // Restore original text from data attribute if it exists
        if(glitchTitleElement && glitchTitleElement.dataset && glitchTitleElement.dataset.originalText) {
            glitchTitleElement.innerHTML = glitchTitleElement.dataset.originalText;
        }
         // Restore static instructions as well
         if (staticInstructionsElement && staticInstructionsElement.dataset.originalText) {
             staticInstructionsElement.innerHTML = staticInstructionsElement.dataset.originalText;
         }
    }
}

// =============================================================================
// Menu Content Updates
// =============================================================================

// Sets the menu text for the paused state
function updateMenuForPause() {
    stopMenuEffects(); // Stop any active glitching first
    if (glitchTitleElement) glitchTitleElement.innerHTML = `<span style="font-size:36px">Paused</span>`;
    if (staticInstructionsElement) staticInstructionsElement.innerHTML = `(Click to Resume)`;
    // Store these new texts as the "original" for potential future glitching if needed
    if (glitchTitleElement) glitchTitleElement.dataset.originalText = glitchTitleElement.innerText; // Use innerText to strip tags for storage
    if (staticInstructionsElement) staticInstructionsElement.dataset.originalText = staticInstructionsElement.innerHTML;
    // Ensure blocker is visible (might be called when already visible)
    if(blockerElement) { blockerElement.style.display = 'flex'; void blockerElement.offsetWidth; blockerElement.style.opacity = '1'; }
    if(instructionsElement) instructionsElement.style.display = 'block'; // Ensure instructions container is visible
}

// Sets the menu text after picking up a rabbit
function updateMenuForRabbitPickup() {
    stopMenuEffects();
    if (glitchTitleElement) glitchTitleElement.innerHTML = `<span style="font-size:28px">Rabbit Collected!</span>`;
    if (staticInstructionsElement) staticInstructionsElement.innerHTML = `(Map Revealed Briefly)<br/>(Click to Resume)`;
    // Store text
    if (glitchTitleElement) glitchTitleElement.dataset.originalText = glitchTitleElement.innerText;
    if (staticInstructionsElement) staticInstructionsElement.dataset.originalText = staticInstructionsElement.innerHTML;
    // Ensure blocker is visible
    if(blockerElement) { blockerElement.style.display = 'flex'; void blockerElement.offsetWidth; blockerElement.style.opacity = '1'; }
    if(instructionsElement) instructionsElement.style.display = 'block';
}

// Sets the initial menu text on game load
function setupInitialMenu(title, instructions) {
    console.log("BJS [ui.js]: setupInitialMenu called");
    // Check if the specific spans exist (should have been found in setupHUD)
    if (glitchTitleElement && staticInstructionsElement) {
        glitchTitleElement.innerHTML = title; // Set title (might contain spans)
        staticInstructionsElement.innerHTML = instructions; // Set instructions
        // Store the initial text content in data attributes for later restoration/glitching
        glitchTitleElement.dataset.originalText = glitchTitleElement.innerText; // Store plain text
        staticInstructionsElement.dataset.originalText = staticInstructionsElement.innerHTML; // Store potentially HTML content
    } else {
        console.error("[ui.js] setupInitialMenu: Title or instructions span element not found!");
        // Fallback: try setting the main instructions container directly
        if (instructionsElement) {
             instructionsElement.innerHTML = title + "<br/>" + instructions;
        }
    }
}


// =============================================================================
// Debug Map Drawing
// =============================================================================

// Helper to update the visibility class on the debug map canvas
function updateDebugMapVisibility() {
    if (!debugMapCanvas) return;
    const shouldBeVisible = DEBUG_MAP_VISIBLE || mapDisplayTimer > 0;
    if (shouldBeVisible) {
        if (!debugMapCanvas.classList.contains('visible')) {
            debugMapCanvas.classList.add('visible');
        }
    } else {
        if (debugMapCanvas.classList.contains('visible')) {
            debugMapCanvas.classList.remove('visible');
        }
    }
}


function drawDebugMap(time) {
    // Requires GLOBAL debugMapCtx, debugMapCanvas, DEBUG_MAP_VISIBLE, mapDisplayTimer
    // Requires GLOBAL mazeGrid, camera, agents, activeRabbits, mazeExitPosition
    // Requires constants: DEBUG_MAP_*, MAZE_*_CELLS, MAZE_GRID_SCALE, CELL_SIZE
    // Requires functions: worldToGrid (environment.js)

    if (!debugMapCtx || !debugMapCanvas) return;

    // Update visibility class based on current state (important if toggled off)
    updateDebugMapVisibility();

    // Only draw if the canvas should be visible
    if (!debugMapCanvas.classList.contains('visible')) {
        return;
    }

    const ctx = debugMapCtx;
    const canvasSize = DEBUG_MAP_CANVAS_SIZE;
    ctx.clearRect(0, 0, canvasSize, canvasSize);

    // --- Maze Grid Scaling ---
    // Map scale is based on LOGICAL grid cells fitting into the canvas
    const gridTotalWidthCells = MAZE_WIDTH_CELLS;
    const gridTotalHeightCells = MAZE_HEIGHT_CELLS;
    const scaleX = canvasSize / gridTotalWidthCells;
    const scaleY = canvasSize / gridTotalHeightCells;
    const scale = Math.min(scaleX, scaleY); // Uniform scale factor
    const mazeDrawingWidth = gridTotalWidthCells * scale;
    const mazeDrawingHeight = gridTotalHeightCells * scale;
    const offsetX = (canvasSize - mazeDrawingWidth) / 2; // Center the map
    const offsetY = (canvasSize - mazeDrawingHeight) / 2;

    // --- Coordinate Conversion Helper (Local to this function) ---
    // Converts LOGICAL grid coordinates to CANVAS coordinates
    const gridToCanvas = (gridX, gridY) => ({
        x: offsetX + gridX * scale,
        y: offsetY + gridY * scale
    });

    // --- Draw Maze Walls (Using Logical Grid Data) ---
    let currentWallColor = DEBUG_MAP_WALL_COLOR;
    if (Math.random() < DEBUG_MAP_WALL_FLICKER_CHANCE) {
        currentWallColor = DEBUG_MAP_WALL_FLICKER_COLOR;
    }
    ctx.strokeStyle = currentWallColor;
    ctx.lineWidth = 1.5; // Slightly thicker lines
    ctx.beginPath();
    for (let y = 0; y < MAZE_HEIGHT_CELLS; y++) {
        for (let x = 0; x < MAZE_WIDTH_CELLS; x++) {
            const cell = mazeGrid[y]?.[x];
            if (cell) { // Check if cell exists
                const canvasPos = gridToCanvas(x, y);
                const nextXPos = gridToCanvas(x + 1, y).x; // Pre-calculate next positions
                const nextYPos = gridToCanvas(x, y + 1).y;

                // Draw walls based on logical cell wall flags
                if (cell.walls.top) { ctx.moveTo(canvasPos.x, canvasPos.y); ctx.lineTo(nextXPos, canvasPos.y); }
                if (cell.walls.left) { ctx.moveTo(canvasPos.x, canvasPos.y); ctx.lineTo(canvasPos.x, nextYPos); }
                // Draw bottom/right walls only for border cells to avoid double drawing
                if (y === MAZE_HEIGHT_CELLS - 1 && cell.walls.bottom) { ctx.moveTo(canvasPos.x, nextYPos); ctx.lineTo(nextXPos, nextYPos); }
                if (x === MAZE_WIDTH_CELLS - 1 && cell.walls.right) { ctx.moveTo(nextXPos, canvasPos.y); ctx.lineTo(nextXPos, nextYPos); }
            }
        }
    }
    ctx.stroke(); // Draw all wall segments at once

    // --- Entity Coordinate Conversion ---
    // Converts WORLD coordinates to CANVAS coordinates
    const worldToCanvas = (worldX, worldZ) => {
        // 1. Convert world coords to visual grid float coords (includes scale)
        const visualGridWidthTotal = MAZE_WIDTH_CELLS * MAZE_GRID_SCALE;
        const visualGridHeightTotal = MAZE_HEIGHT_CELLS * MAZE_GRID_SCALE;
        const visualGridXFloat = (worldX / CELL_SIZE) + (visualGridWidthTotal / 2);
        const visualGridZFloat = (worldZ / CELL_SIZE) + (visualGridHeightTotal / 2);

        // 2. Convert visual grid float coords to logical grid float coords
        const logicalGridXFloat = visualGridXFloat / MAZE_GRID_SCALE;
        const logicalGridYFloat = visualGridZFloat / MAZE_GRID_SCALE;

        // 3. Convert logical grid float coords to canvas coords
        return gridToCanvas(logicalGridXFloat, logicalGridYFloat);
    };

    // --- Draw Player ---
    if (camera) {
        let currentPlayerColor = DEBUG_MAP_PLAYER_COLOR;
        if (Math.random() < DEBUG_MAP_ENTITY_FLICKER_CHANCE) { currentPlayerColor = DEBUG_MAP_ENTITY_FLICKER_COLOR; }
        ctx.fillStyle = currentPlayerColor;
        ctx.strokeStyle = currentPlayerColor;

        const playerCanvasPos = worldToCanvas(camera.position.x, camera.position.z); // Use camera position for map marker
        const playerRadius = scale * 0.35; // Player size relative to logical cell size on map

        // Draw player direction triangle
        const forward = camera.getForwardRay().direction;
        const angle = Math.atan2(forward.x, forward.z); // Angle in XZ plane
        ctx.beginPath();
        // Point of triangle
        ctx.moveTo(playerCanvasPos.x + Math.sin(angle) * playerRadius,
                   playerCanvasPos.y + Math.cos(angle) * playerRadius);
        // Back-left corner
        ctx.lineTo(playerCanvasPos.x + Math.sin(angle + Math.PI * 0.8) * playerRadius * 0.7,
                   playerCanvasPos.y + Math.cos(angle + Math.PI * 0.8) * playerRadius * 0.7);
        // Back-right corner
        ctx.lineTo(playerCanvasPos.x + Math.sin(angle - Math.PI * 0.8) * playerRadius * 0.7,
                   playerCanvasPos.y + Math.cos(angle - Math.PI * 0.8) * playerRadius * 0.7);
        ctx.closePath();
        ctx.fill();
    }

    // --- Draw Agents ---
    let currentAgentColor = DEBUG_MAP_AGENT_COLOR;
    if (Math.random() < DEBUG_MAP_ENTITY_FLICKER_CHANCE) { currentAgentColor = DEBUG_MAP_ENTITY_FLICKER_COLOR; }
    ctx.fillStyle = currentAgentColor;
    ctx.strokeStyle = currentAgentColor; // For potential future outlining
    const agentRadius = scale * 0.3; // Agent size relative to logical cell

    agents.forEach(agent => {
        // Only draw active agents with a valid root node
        if (agent.hp > 0 && agent.rootNode) {
            const agentCanvasPos = worldToCanvas(agent.rootNode.position.x, agent.rootNode.position.z);
            ctx.beginPath();
            ctx.arc(agentCanvasPos.x, agentCanvasPos.y, agentRadius, 0, Math.PI * 2); // Draw as circle
            ctx.fill();
            // TODO: Optionally draw agent direction vector
        }
    });

    // --- Draw Rabbits ---
    ctx.fillStyle = DEBUG_MAP_RABBIT_COLOR;
    ctx.strokeStyle = DEBUG_MAP_RABBIT_COLOR;
    const rabbitRadius = scale * 0.25; // Rabbit size relative to logical cell

    activeRabbits.forEach(rabbit => {
        if (rabbit.rootNode) { // Rabbits use rootNode
            const rabbitCanvasPos = worldToCanvas(rabbit.rootNode.position.x, rabbit.rootNode.position.z);
            ctx.beginPath();
            ctx.rect(rabbitCanvasPos.x - rabbitRadius, rabbitCanvasPos.y - rabbitRadius, rabbitRadius * 2, rabbitRadius * 2); // Draw as square
            ctx.fill();
        }
    });

     // --- Draw Exit Marker ---
     if (mazeExitPosition) { // Check if exit exists
         ctx.fillStyle = 'rgba(255, 255, 0, 0.9)'; // Bright yellow
         ctx.strokeStyle = 'rgba(255, 255, 0, 0.9)';
         const exitRadius = scale * 0.4; // Larger marker
         const exitCanvasPos = worldToCanvas(mazeExitPosition.x, mazeExitPosition.z);
         // Draw star shape or different marker? Circle for now.
         ctx.beginPath();
         ctx.arc(exitCanvasPos.x, exitCanvasPos.y, exitRadius, 0, Math.PI * 2);
         ctx.fill();
         // Could add pulsing or text "EXIT" if needed
     }
}


// end of file