// =============================================================================
// js/player.js - Player Controls, State, and Actions
// Version: 1.48c (Add Jump Logic) - JUMP IMPLEMENTED
// =============================================================================

// Relies on constants from constants.js (v1.48c)
// Relies on globals from main.js: camera, playerHP, gameOver, gameWon, isPointerLocked, engine, shakeTimer, damageOverlayElement, blockerElement, instructionsElement, audioCtx, isRunning, canvas, scene, DEBUG_SHOW_PLAYER_COLLIDER, DEBUG_MOVEMENT, DEBUG_AGENT, DEBUG_MAP_VISIBLE, keyMap, playerIsGrounded, playerVelocityY // <<< Needs global playerVelocityY
// Relies on functions: initializeAudioContext, playSound, fireGun, startReload, triggerGameOver, updateHUD, stopMenuEffects, updateMenuForPause, updateMenuForRabbitPickup, updateDebugMapVisibility

// =============================================================================
// Player State Damage Function (Unchanged)
// =============================================================================
function damagePlayer(amount, source = "Bullet") { /* ... code from v1.47o ... */ }


// =============================================================================
// Event Handlers Setup (Jump Key Handling ADDED)
// =============================================================================
function setupEventListeners() {
    console.log("BJS [player.js]: Setting up Event Listeners (v1.48c - Jump)..."); // Version Updated
    if (!canvas||!scene||!engine||!camera||!instructionsElement||!blockerElement){console.error("Cannot setup listeners: Critical elements missing!"); return;}

    // --- Click Blocker/Instructions ---
    instructionsElement.addEventListener('click', () => { initializeAudioContext(); if (!isPointerLocked && !gameOver && !gameWon) { console.log("Instructions clicked: Requesting pointer lock..."); engine.enterPointerlock(); } else if (gameOver || gameWon) { console.log("Instructions clicked: Reloading page..."); window.location.reload(); } });

    // --- Fire Gun ---
    scene.onPointerDown = (evt) => { console.log(`scene.onPointerDown: button=${evt.button}, isPointerLocked=${isPointerLocked}, menuTimer=${menuDisplayTimer}, mapTimer=${mapDisplayTimer}`); if (evt.button === 0 && isPointerLocked && menuDisplayTimer <= 0 && mapDisplayTimer <= 0) { fireGun(); } };

    // --- Pointer Lock Change ---
    const onPointerLockChange = () => { const element = document.pointerLockElement || document.mozPointerLockElement || document.webkitPointerLockElement || null; if (element === canvas) { if (!isPointerLocked) { isPointerLocked = true; console.log("Pointer Locked - Attaching controls."); if(camera){camera.attachControl(canvas,true);console.log("Controls attached.");}else{console.error("Cam missing!");} if(blockerElement){blockerElement.style.opacity='0';setTimeout(()=>{if(blockerElement)blockerElement.style.display='none'},300);} document.body.classList.add('locked'); /* stopMenuEffects(); */ isMenuDisplayedForRabbit = false; menuDisplayTimer = 0; } } else { if (isPointerLocked) { isPointerLocked = false; console.log("Pointer Unlocked - Detaching controls."); if(camera){camera.detachControl(canvas);console.log("Controls detached."); if(isRunning){camera.speed = PLAYER_SPEED_WALK; isRunning=false;}}else{console.error("Cam missing!");} document.body.classList.remove('locked'); if(blockerElement){blockerElement.style.display='flex';blockerElement.style.opacity='1';} if(gameOver||gameWon){}else if(isMenuDisplayedForRabbit&&menuDisplayTimer>0){updateMenuForRabbitPickup();}else{updateMenuForPause();} } } };
    document.addEventListener("pointerlockchange",onPointerLockChange,false); document.addEventListener("mozpointerlockchange",onPointerLockChange,false); document.addEventListener("webkitpointerlockchange",onPointerLockChange,false);

    // --- Keyboard Input (Handles Jump) ---
    const keyMap = {}; // Global in main.js - no redeclaration here!
    scene.onKeyboardObservable.add((kbInfo) => {
        const isDown = kbInfo.type === BABYLON.KeyboardEventTypes.KEYDOWN; const key = kbInfo.event.code; keyMap[key] = isDown; // Update global keymap

        if (isPointerLocked) { // Game Actions
            if (isDown) {
                if (PLAYER_KEYS_RELOAD.includes(key)) { startReload(); }
                if (PLAYER_KEYS_JUMP.includes(key)) { tryJump(); } // Call jump function - NEW
                if (DEBUG_MOVEMENT && ['KeyW','KeyA','KeyS','KeyD'].includes(key)) { console.log(`Key Event: ${key} Down (Locked)`); }
            } else { // Key Up
                 if (DEBUG_MOVEMENT && ['KeyW','KeyA','KeyS','KeyD'].includes(key)) { console.log(`Key Event: ${key} Up (Locked)`); }
            }
            const shift = keyMap[PLAYER_KEYS_RUN[0]] || keyMap[PLAYER_KEYS_RUN[1]] || false; if (camera) { const targetSpeed = shift ? PLAYER_SPEED_RUN : PLAYER_SPEED_WALK; if (camera.speed !== targetSpeed) { camera.speed = targetSpeed; isRunning = shift; } }
        } else { if (camera && isRunning) { camera.speed = PLAYER_SPEED_WALK; isRunning = false; } }
        if (isDown) { handleDebugKeys(key); } // Debug Actions
    });
    console.log("BJS [player.js]: Event Listeners Setup Complete.");
}

// =============================================================================
// Jump Functionality (Manual Velocity - Unchanged from 1.47z)
// =============================================================================
function tryJump() {
    if (!camera) return;
    if (playerIsGrounded) {
        playerIsGrounded = false;
        playerVelocityY = PLAYER_JUMP_FORCE;
        console.log(`Jump! Applied force: ${PLAYER_JUMP_FORCE}, VelY set to: ${playerVelocityY}`);
    } else {
         console.log("Cannot jump: airborne.");
    }
}


// --- Debug Key Handling (Unchanged from 1.47k) ---
function handleDebugKeys(keyCode) { /* ... unchanged from v1.47k ... */ }

// end of file