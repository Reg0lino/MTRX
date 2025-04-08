// =============================================================================
// js/game_state.js - Win/Lose Condition Logic
// Version: 1.47g (Refactored - Basic Definitions)
// =============================================================================

// Relies on globals from main.js: gameOver, gameWon, playerHP, shakeTimer, blockerElement, instructionsElement, glitchTitleElement, staticInstructionsElement, isPointerLocked, engine
// Relies on functions: updateHUD (ui.js), playSound (audio.js), startMenuEffects (ui.js)

console.log("Loading game_state.js..."); // Log loading

function triggerGameOver(reason = "Unknown") {
    // Check dependencies exist
    if (typeof updateHUD === 'undefined' || typeof playSound === 'undefined' || typeof startMenuEffects === 'undefined') {
        console.error("triggerGameOver dependencies missing!"); return;
    }
    if (gameOver || gameWon) return;
    console.log(`Game Over: ${reason}`);
    gameOver = true; playerHP = 0; shakeTimer = 0;
    updateHUD();

    if (blockerElement && instructionsElement) {
        if (glitchTitleElement) glitchTitleElement.innerHTML = `GAME OVER`;
        if(staticInstructionsElement) staticInstructionsElement.innerHTML = `${reason}<br/><br/>(Click to Reload)`;
        if (glitchTitleElement) glitchTitleElement.dataset.originalText = glitchTitleElement.innerText; // Store for effects
        if (staticInstructionsElement) staticInstructionsElement.dataset.originalText = staticInstructionsElement.innerHTML;
        blockerElement.style.opacity = '1'; blockerElement.style.display = 'flex'; instructionsElement.style.display = 'block';
    }
    if (isPointerLocked && engine) { engine.exitPointerlock(); }
    playSound('game_over');
    startMenuEffects();
}

function triggerGameWin() {
    // Check dependencies exist
     if (typeof updateHUD === 'undefined' || typeof playSound === 'undefined' || typeof startMenuEffects === 'undefined') {
        console.error("triggerGameWin dependencies missing!"); return;
    }
    if (gameOver || gameWon) return;
    console.log("Objective Complete: Exit Reached!");
    gameWon = true; shakeTimer = 0;
    updateHUD();

    if (blockerElement && instructionsElement) {
        if (glitchTitleElement) glitchTitleElement.innerHTML = `EXIT REACHED`;
        if(staticInstructionsElement) staticInstructionsElement.innerHTML = `OBJECTIVE COMPLETE<br/><br/>(Click to Reload)`;
        if (glitchTitleElement) glitchTitleElement.dataset.originalText = glitchTitleElement.innerText; // Store for effects
        if (staticInstructionsElement) staticInstructionsElement.dataset.originalText = staticInstructionsElement.innerHTML;
        blockerElement.style.opacity = '1'; blockerElement.style.display = 'flex'; instructionsElement.style.display = 'block';
    }
    if (isPointerLocked && engine) { engine.exitPointerlock(); }
    playSound('game_win');
    startMenuEffects();
}

// end of file