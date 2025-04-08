// =============================================================================
// js/game_state.js - Win/Lose Condition Logic
// Version: 1.47f (Refactored - Stub)
// =============================================================================

// Relies on globals from main.js: gameOver, gameWon, playerHP, shakeTimer, blockerElement, instructionsElement, glitchTitleElement, staticInstructionsElement, isPointerLocked, engine
// Relies on functions: updateHUD (ui.js), playSound (audio.js), startMenuEffects (ui.js)

function triggerGameOver(reason = "Unknown") {
    if (gameOver || gameWon) return;
    console.log(`Game Over: ${reason}`);
    gameOver = true; playerHP = 0; shakeTimer = 0;
    updateHUD(); // Requires ui.js

    if (blockerElement && instructionsElement) {
        if (glitchTitleElement) glitchTitleElement.innerHTML = `GAME OVER`;
        if(staticInstructionsElement) staticInstructionsElement.innerHTML = `${reason}<br/><br/>(Click to Reload)`;
        // Store text for menu effects
        if (glitchTitleElement) glitchTitleElement.dataset.originalText = glitchTitleElement.innerText;
        if (staticInstructionsElement) staticInstructionsElement.dataset.originalText = staticInstructionsElement.innerHTML;
        blockerElement.style.opacity = '1'; blockerElement.style.display = 'flex'; instructionsElement.style.display = 'block';
    }
    if (isPointerLocked && engine) { engine.exitPointerlock(); }
    playSound('game_over'); // Requires audio.js
    startMenuEffects(); // Requires ui.js
}

function triggerGameWin() {
    if (gameOver || gameWon) return;
    console.log("Objective Complete: Exit Reached!");
    gameWon = true; shakeTimer = 0;
     updateHUD(); // Requires ui.js

    if (blockerElement && instructionsElement) {
        if (glitchTitleElement) glitchTitleElement.innerHTML = `EXIT REACHED`;
        if(staticInstructionsElement) staticInstructionsElement.innerHTML = `OBJECTIVE COMPLETE<br/><br/>(Click to Reload)`;
        // Store text for menu effects
        if (glitchTitleElement) glitchTitleElement.dataset.originalText = glitchTitleElement.innerText;
        if (staticInstructionsElement) staticInstructionsElement.dataset.originalText = staticInstructionsElement.innerHTML;
        blockerElement.style.opacity = '1'; blockerElement.style.display = 'flex'; instructionsElement.style.display = 'block';
    }
    if (isPointerLocked && engine) { engine.exitPointerlock(); }
    playSound('game_win'); // Requires audio.js
    startMenuEffects(); // Requires ui.js
}

/* Three.js Reference omitted */