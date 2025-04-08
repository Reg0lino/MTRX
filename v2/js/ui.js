// =============================================================================
// js/ui.js - HUD, Menu Effects, Debug Map
// Version: 1.47f (Refactored - Stub)
// =============================================================================

// Relies on constants from constants.js
// Relies on globals from main.js: hud*, blocker*, instructions*, glitch*, static*, menuEffectInterval, damageOverlay*, version*, debugMap*, camera, agents, activeRabbits, mazeExitPosition, playerHP, isReloading, reloadTimer, currentAmmo, agentsRemaining, isPointerLocked, gameOver, gameWon, mapDisplayTimer, DEBUG_MAP_VISIBLE

// --- HUD & Menu Element References (Get references here) ---
let hudHpBarFill = null; let hudWeaponName = null; let hudAmmoCount = null; let hudReloadIndicator = null; let hudReloadProgress = null; let hudAgentCount = null; let blockerElement = null; let instructionsElement = null; let instructionsSpan = null; let menuEffectInterval = null; let damageOverlayElement = null; let versionInfoElement = null; let glitchTitleElement = null; let staticInstructionsElement = null;
let debugMapCanvas = null; let debugMapCtx = null;

function setupHUD(){
    // Get all DOM elements needed for UI
    hudHpBarFill=document.getElementById('hpBarFill');
    hudWeaponName=document.getElementById('weaponName');
    hudAmmoCount=document.getElementById('ammoCount');
    hudReloadIndicator=document.getElementById('reloadIndicator');
    hudReloadProgress=document.getElementById('reloadProgress');
    hudAgentCount=document.getElementById('agentCount');
    damageOverlayElement=document.getElementById('damageOverlay');
    versionInfoElement = document.getElementById('versionInfo');
    blockerElement = document.getElementById('blocker'); // Ensure it's fetched
    instructionsElement = document.getElementById('instructions');
    glitchTitleElement = document.getElementById('glitchTitle'); // Fetch specific elements
    staticInstructionsElement = document.getElementById('staticInstructions');
    debugMapCanvas = document.getElementById('debugMapCanvas');

    if (debugMapCanvas) { debugMapCtx = debugMapCanvas.getContext('2d'); }

    // Robust check for essential elements
    if(!hudHpBarFill||!hudWeaponName||!hudAmmoCount||!hudReloadIndicator||!hudReloadProgress||!hudAgentCount||!damageOverlayElement || !versionInfoElement || !blockerElement || !instructionsElement || !glitchTitleElement || !staticInstructionsElement || !debugMapCanvas) {
        console.error("CRITICAL [ui.js]: One or more essential UI elements missing from HTML!");
        // Attempt to continue, but UI might be broken
        // return false; // Or return false if UI is critical
    } else {
         console.log("BJS [ui.js]: All expected UI elements found.");
    }

    // Set initial static values
    if(hudWeaponName) hudWeaponName.textContent="9mm";
    // Initial dynamic values set in main.js or updateHUD
    if(versionInfoElement) versionInfoElement.textContent = `v1.47f (BJS)`; // Update version
    if(debugMapCanvas) {
        debugMapCanvas.width = DEBUG_MAP_CANVAS_SIZE; // Use constant
        debugMapCanvas.height = DEBUG_MAP_CANVAS_SIZE; // Use constant
        debugMapCanvas.classList.add('map-bottom-right'); // Default position
    }

    updateHUD(); // Initial update
    return true; // Indicate success (or partial success)
}

function updateHUD(time = 0){
    // Requires globals: playerHP, agentsRemaining, currentAmmo, isReloading, reloadTimer, isPointerLocked, gameOver, gameWon
    // Requires constants: PLAYER_MAX_HP, HUD_*, GUN_*
    // Requires functions: applyGlitchToElement
    if(hudHpBarFill) { const hpP = Math.max(0, playerHP) / PLAYER_MAX_HP * 100; hudHpBarFill.style.width = `${hpP}%`; if (playerHP > 0) { const baseLightness = 70; const shimmer = Math.sin(time * HUD_HP_BAR_SHIMMER_SPEED) * HUD_HP_BAR_SHIMMER_AMOUNT; hudHpBarFill.style.backgroundColor = `hsl(120, 100%, ${Math.max(30, Math.min(90, baseLightness + shimmer))}%)`; } else { hudHpBarFill.style.backgroundColor = `hsl(120, 100%, 30%)`; } }
    const locked = isPointerLocked;
    if(hudAgentCount) { const currentCountText = `${agentsRemaining}`; if (hudAgentCount.dataset.value !== currentCountText || gameOver || gameWon || !locked) { applyGlitchToElement(hudAgentCount, HUD_TEXT_GLITCH_INTENSITY, HUD_TEXT_GLITCH_CHARS, currentCountText); hudAgentCount.dataset.value = currentCountText; } else { if (hudAgentCount.innerHTML !== currentCountText) hudAgentCount.innerHTML = currentCountText; } }
    if(hudAmmoCount && hudReloadIndicator && hudReloadProgress) { if(isReloading){ const reloadingText = "Reloading..."; if (hudAmmoCount.textContent !== reloadingText) { hudAmmoCount.textContent = reloadingText; } hudAmmoCount.dataset.value = reloadingText; hudReloadIndicator.style.display = 'block'; const p = Math.max(0, (GUN_RELOAD_TIME - reloadTimer) / GUN_RELOAD_TIME) * 100; hudReloadProgress.style.strokeDasharray = `${p} 100`; } else { const ammoText = `${currentAmmo} / ∞`; if (hudAmmoCount.dataset.value !== ammoText || gameOver || gameWon || !locked) { applyGlitchToElement(hudAmmoCount, HUD_TEXT_GLITCH_INTENSITY, HUD_TEXT_GLITCH_CHARS, ammoText); hudAmmoCount.dataset.value = ammoText; } else { if (hudAmmoCount.innerHTML !== ammoText) hudAmmoCount.innerHTML = ammoText; } hudReloadIndicator.style.display = 'none'; hudReloadProgress.style.strokeDasharray = '0 100'; } }
}

function applyGlitchToElement(el, intensity = 0.05, chars = MENU_GLITCH_CHARS, originalText = null) { if (!el) return; let textToGlitch = originalText !== null ? originalText : (el.dataset?.originalText || el.textContent); if (!textToGlitch && originalText === null) textToGlitch = el.innerText; /* Fallback for span */ if (!textToGlitch) return; if (originalText !== null && el.dataset?.originalText !== originalText) { el.dataset.originalText = originalText; } else if (!el.dataset?.originalText) { el.dataset.originalText = textToGlitch; } const len = textToGlitch.length; let result = ''; for (let i = 0; i < len; i++) { if (textToGlitch[i] === '<') { let tagEnd = textToGlitch.indexOf('>', i); if (tagEnd !== -1) { result += textToGlitch.substring(i, tagEnd + 1); i = tagEnd; continue; } } result += (Math.random() < intensity) ? chars[Math.floor(Math.random() * chars.length)] : textToGlitch[i]; } if (el.innerHTML !== result) { el.innerHTML = result; } }
function applyMenuEffects(){ if(blockerElement && blockerElement.style.display !== 'none' && glitchTitleElement){ applyGlitchToElement(glitchTitleElement, 0.15, MENU_GLITCH_CHARS); } }
function startMenuEffects(){ if(!menuEffectInterval && glitchTitleElement){ if(!glitchTitleElement.dataset.originalText) { glitchTitleElement.dataset.originalText = glitchTitleElement.innerText; } if (staticInstructionsElement && staticInstructionsElement.dataset.originalText && staticInstructionsElement.innerHTML !== staticInstructionsElement.dataset.originalText) { staticInstructionsElement.innerHTML = staticInstructionsElement.dataset.originalText; } clearInterval(menuEffectInterval); menuEffectInterval = setInterval(applyMenuEffects, 80); } }
function stopMenuEffects(){ if(menuEffectInterval){ clearInterval(menuEffectInterval); menuEffectInterval=null; if(glitchTitleElement && glitchTitleElement.dataset && glitchTitleElement.dataset.originalText) { glitchTitleElement.innerHTML = glitchTitleElement.dataset.originalText; } if (staticInstructionsElement && staticInstructionsElement.dataset.originalText) { staticInstructionsElement.innerHTML = staticInstructionsElement.dataset.originalText; } } }
function updateMenuForPause() { stopMenuEffects(); if (glitchTitleElement) glitchTitleElement.innerHTML = `<span style="font-size:36px">Paused</span>`; if (staticInstructionsElement) staticInstructionsElement.innerHTML = `(Click to Resume)`; if (glitchTitleElement) glitchTitleElement.dataset.originalText = glitchTitleElement.innerText; if (staticInstructionsElement) staticInstructionsElement.dataset.originalText = staticInstructionsElement.innerHTML; if(blockerElement) { blockerElement.style.display = 'flex'; void blockerElement.offsetWidth; blockerElement.style.opacity = '1'; } if(instructionsElement) instructionsElement.style.display = 'block'; }
function updateMenuForRabbitPickup() { stopMenuEffects(); if (glitchTitleElement) glitchTitleElement.innerHTML = `<span style="font-size:28px">Rabbit Collected!</span>`; if (staticInstructionsElement) staticInstructionsElement.innerHTML = `(Map Revealed Briefly)<br/>(Click to Resume)`; if (glitchTitleElement) glitchTitleElement.dataset.originalText = glitchTitleElement.innerText; if (staticInstructionsElement) staticInstructionsElement.dataset.originalText = staticInstructionsElement.innerHTML; if(blockerElement) { blockerElement.style.display = 'flex'; void blockerElement.offsetWidth; blockerElement.style.opacity = '1'; } if(instructionsElement) instructionsElement.style.display = 'block'; }
function setupInitialMenu(title, instructions) {
    // Requires globals: instructionsElement, glitchTitleElement, staticInstructionsElement
     if (instructionsElement) {
        instructionsElement.innerHTML = title + "<br/>" + instructions;
         // Re-acquire references after changing innerHTML
         glitchTitleElement = document.getElementById('glitchTitle');
         staticInstructionsElement = document.getElementById('staticInstructions');
         // Store original texts in dataset for effects/restore
         if(glitchTitleElement) glitchTitleElement.dataset.originalText = glitchTitleElement.innerText;
         if(staticInstructionsElement) staticInstructionsElement.dataset.originalText = staticInstructionsElement.innerHTML;
     } else {
         console.error("Cannot setup initial menu: instructionsElement not found!");
     }
}


function drawDebugMap(time) {
    // Requires globals: debugMapCtx, debugMapCanvas, DEBUG_MAP_VISIBLE, mapDisplayTimer, mazeGrid, camera, agents, activeRabbits, mazeExitPosition
    // Requires constants: DEBUG_MAP_*, MAZE_*_CELLS, MAZE_GRID_SCALE, CELL_SIZE
    // Requires functions: worldToCanvas (defined locally), gridToCanvas (defined locally)
    if (!debugMapCtx || !debugMapCanvas) return; const shouldBeVisible = DEBUG_MAP_VISIBLE || mapDisplayTimer > 0; if (shouldBeVisible) { if (!debugMapCanvas.classList.contains('visible')) { debugMapCanvas.classList.add('visible'); } } else { if (debugMapCanvas.classList.contains('visible')) { debugMapCanvas.classList.remove('visible'); } return; } const ctx = debugMapCtx; const canvasSize = DEBUG_MAP_CANVAS_SIZE; ctx.clearRect(0, 0, canvasSize, canvasSize); const gridTotalWidthCells = MAZE_WIDTH_CELLS; const gridTotalHeightCells = MAZE_HEIGHT_CELLS; const scaleX = canvasSize / gridTotalWidthCells; const scaleY = canvasSize / gridTotalHeightCells; const scale = Math.min(scaleX, scaleY); const mazeDrawingWidth = gridTotalWidthCells * scale; const mazeDrawingHeight = gridTotalHeightCells * scale; const offsetX = (canvasSize - mazeDrawingWidth) / 2; const offsetY = (canvasSize - mazeDrawingHeight) / 2; const gridToCanvas = (gridX, gridY) => ({ x: offsetX + gridX * scale, y: offsetY + gridY * scale }); let currentWallColor = DEBUG_MAP_WALL_COLOR; if (Math.random() < DEBUG_MAP_WALL_FLICKER_CHANCE) { currentWallColor = DEBUG_MAP_WALL_FLICKER_COLOR; } ctx.strokeStyle = currentWallColor; ctx.lineWidth = 1.5; ctx.beginPath(); for (let y = 0; y < MAZE_HEIGHT_CELLS; y++) { for (let x = 0; x < MAZE_WIDTH_CELLS; x++) { const cell = mazeGrid[y]?.[x]; if (cell) { const canvasPos = gridToCanvas(x, y); const nextXPos = gridToCanvas(x + 1, y).x; const nextYPos = gridToCanvas(x, y + 1).y; if (cell.walls.top) { ctx.moveTo(canvasPos.x, canvasPos.y); ctx.lineTo(nextXPos, canvasPos.y); } if (cell.walls.left) { ctx.moveTo(canvasPos.x, canvasPos.y); ctx.lineTo(canvasPos.x, nextYPos); } if (y === MAZE_HEIGHT_CELLS - 1 && cell.walls.bottom) { ctx.moveTo(canvasPos.x, nextYPos); ctx.lineTo(nextXPos, nextYPos); } if (x === MAZE_WIDTH_CELLS - 1 && cell.walls.right) { ctx.moveTo(nextXPos, canvasPos.y); ctx.lineTo(nextXPos, nextYPos); } } } } ctx.stroke(); const worldToCanvas = (worldX, worldZ) => { const visualGridWidthTotal = MAZE_WIDTH_CELLS * MAZE_GRID_SCALE; const visualGridHeightTotal = MAZE_HEIGHT_CELLS * MAZE_GRID_SCALE; const visualGridXFloat = (worldX / CELL_SIZE) + (visualGridWidthTotal / 2); const visualGridZFloat = (worldZ / CELL_SIZE) + (visualGridHeightTotal / 2); const logicalGridXFloat = visualGridXFloat / MAZE_GRID_SCALE; const logicalGridYFloat = visualGridZFloat / MAZE_GRID_SCALE; return gridToCanvas(logicalGridXFloat, logicalGridYFloat); }; if (camera) { let currentPlayerColor = DEBUG_MAP_PLAYER_COLOR; if (Math.random() < DEBUG_MAP_ENTITY_FLICKER_CHANCE) { currentPlayerColor = DEBUG_MAP_ENTITY_FLICKER_COLOR; } ctx.fillStyle = currentPlayerColor; ctx.strokeStyle = currentPlayerColor; const playerCanvasPos = worldToCanvas(camera.position.x, camera.position.z); const playerRadius = scale * 0.35; const forward = camera.getForwardRay().direction; const angle = Math.atan2(forward.x, forward.z); ctx.beginPath(); ctx.moveTo(playerCanvasPos.x + Math.sin(angle) * playerRadius, playerCanvasPos.y + Math.cos(angle) * playerRadius); ctx.lineTo(playerCanvasPos.x + Math.sin(angle + Math.PI * 0.8) * playerRadius * 0.7, playerCanvasPos.y + Math.cos(angle + Math.PI * 0.8) * playerRadius * 0.7); ctx.lineTo(playerCanvasPos.x + Math.sin(angle - Math.PI * 0.8) * playerRadius * 0.7, playerCanvasPos.y + Math.cos(angle - Math.PI * 0.8) * playerRadius * 0.7); ctx.closePath(); ctx.fill(); } let currentAgentColor = DEBUG_MAP_AGENT_COLOR; if (Math.random() < DEBUG_MAP_ENTITY_FLICKER_CHANCE) { currentAgentColor = DEBUG_MAP_ENTITY_FLICKER_COLOR; } ctx.fillStyle = currentAgentColor; ctx.strokeStyle = currentAgentColor; const agentRadius = scale * 0.3; agents.forEach(agent => { if (agent.hp > 0 && agent.rootNode) { const agentCanvasPos = worldToCanvas(agent.rootNode.position.x, agent.rootNode.position.z); ctx.beginPath(); ctx.arc(agentCanvasPos.x, agentCanvasPos.y, agentRadius, 0, Math.PI * 2); ctx.fill(); } }); ctx.fillStyle = DEBUG_MAP_RABBIT_COLOR; ctx.strokeStyle = DEBUG_MAP_RABBIT_COLOR; const rabbitRadius = scale * 0.25; activeRabbits.forEach(rabbit => { if (rabbit.rootNode) { const rabbitCanvasPos = worldToCanvas(rabbit.rootNode.position.x, rabbit.rootNode.position.z); ctx.beginPath(); ctx.rect(rabbitCanvasPos.x - rabbitRadius, rabbitCanvasPos.y - rabbitRadius, rabbitRadius * 2, rabbitRadius * 2); ctx.fill(); } });
}

/* Three.js Reference omitted */