// =============================================================================
// js/player.js - Player Controls, State, and Actions
// Version: 1.47p (Inspector Debugging)
// =============================================================================

// Relies on constants from constants.js (v1.47p - Inspector Debugging)
// Relies on globals from main.js: camera, playerHP, gameOver, gameWon, isPointerLocked, engine, shakeTimer, damageOverlayElement, blockerElement, instructionsElement, audioCtx, isRunning, canvas, scene, DEBUG_SHOW_PLAYER_COLLIDER, DEBUG_MOVEMENT, DEBUG_AGENT, DEBUG_MAP_VISIBLE
// Relies on functions: initializeAudioContext, playSound, fireGun (disabled call), startReload (disabled call), triggerGameOver (disabled call), updateHUD, stopMenuEffects, updateMenuForPause, updateMenuForRabbitPickup, updateDebugMapVisibility

// =============================================================================
// Player State Damage Function (Keep definition, but won't be called)
// =============================================================================
function damagePlayer(amount, source = "Bullet") { /* ... code from 1.47o ... */ }


// =============================================================================
// Event Handlers Setup (Focus on Input and Controls)
// =============================================================================
function setupEventListeners() {
    console.log("BJS [player.js]: Setting up Event Listeners (v1.47p - Inspector Debug)...");
    if (!canvas||!scene||!engine||!camera||!instructionsElement||!blockerElement){console.error("Cannot setup listeners: Critical elements missing!"); return;}

    // --- Click Blocker/Instructions ---
    instructionsElement.addEventListener('click', () => {
        initializeAudioContext();
        if (!isPointerLocked && !gameOver && !gameWon) { console.log("Requesting pointer lock..."); engine.enterPointerlock(); }
        // No reload on game over/win in this test
    });

    // --- Fire Gun (Listener only) ---
    scene.onPointerDown = (evt) => { if (evt.button === 0 && isPointerLocked) { console.log("Left Click - FireGun Disabled"); } };

    // --- Pointer Lock Change ---
    const onPointerLockChange = () => { const element = document.pointerLockElement || document.mozPointerLockElement || document.webkitPointerLockElement || null; if (element === canvas) { if (!isPointerLocked) { isPointerLocked = true; console.log("Pointer Locked - Attaching controls."); if(camera){camera.attachControl(canvas,true);console.log("Controls attached.");}else{console.error("Cam missing!");} if(blockerElement){blockerElement.style.opacity='0';setTimeout(()=>{if(blockerElement)blockerElement.style.display='none'},300);} document.body.classList.add('locked'); /* stopMenuEffects(); */ isMenuDisplayedForRabbit = false; menuDisplayTimer = 0; } } else { if (isPointerLocked) { isPointerLocked = false; console.log("Pointer Unlocked - Detaching controls."); if(camera){camera.detachControl(canvas);console.log("Controls detached."); if(isRunning){camera.speed = PLAYER_SPEED_WALK; isRunning=false;}}else{console.error("Cam missing!");} document.body.classList.remove('locked'); if(blockerElement){blockerElement.style.display='flex';blockerElement.style.opacity='1';} updateMenuForPause(); } } }; // Simplified unlock menu
    document.addEventListener("pointerlockchange",onPointerLockChange,false); document.addEventListener("mozpointerlockchange",onPointerLockChange,false); document.addEventListener("webkitpointerlockchange",onPointerLockChange,false);

    // --- Keyboard Input ---
    const keyMap = {};
    scene.onKeyboardObservable.add((kbInfo) => {
        const isDown = kbInfo.type === BABYLON.KeyboardEventTypes.KEYDOWN; const key = kbInfo.event.code; keyMap[key] = isDown;
        if (isPointerLocked) {
            if (isDown) { if (PLAYER_KEYS_RELOAD.includes(key)) { console.log("Reload Key (R) - Action Disabled"); } if (DEBUG_MOVEMENT && ['KeyW','KeyA','KeyS','KeyD'].includes(key)) { console.log(`Key Event: ${key} Down (Locked)`); }}
            else { if (DEBUG_MOVEMENT && ['KeyW','KeyA','KeyS','KeyD'].includes(key)) { console.log(`Key Event: ${key} Up (Locked)`); } }
            const shift = keyMap[PLAYER_KEYS_RUN[0]] || keyMap[PLAYER_KEYS_RUN[1]] || false; if (camera) { const targetSpeed = shift ? PLAYER_SPEED_RUN : PLAYER_SPEED_WALK; if (camera.speed !== targetSpeed) { camera.speed = targetSpeed; isRunning = shift; } }
        } else { if (camera && isRunning) { camera.speed = PLAYER_SPEED_WALK; isRunning = false; } }
        if (isDown) { handleDebugKeys(key); }
    });
    console.log("BJS [player.js]: Event Listeners Setup Complete.");
}


// --- Debug Key Handling (Inspector Toggle Added) ---
function handleDebugKeys(keyCode) {
     const allowInput = ['KeyC','KeyP','KeyM','KeyL','KeyK','Digit1','Digit2','Digit3','Digit4'].includes(keyCode); if(!allowInput) return;
     switch (keyCode) {
         case 'KeyC': DEBUG_SHOW_PLAYER_COLLIDER = !DEBUG_SHOW_PLAYER_COLLIDER; console.log(`Collision Viz: ${DEBUG_SHOW_PLAYER_COLLIDER?'ON':'OFF'}`); break;
         case 'KeyP': // Toggle Babylon Inspector
             console.log("P Key Pressed - Toggling Inspector");
             if (scene) {
                if (scene.debugLayer.isVisible()) {
                    scene.debugLayer.hide();
                    console.log("Inspector hidden.");
                } else {
                    // Ensure debugLayer exists before showing
                    scene.debugLayer = scene.debugLayer || new BABYLON.DebugLayer(scene); // Create if needed
                    scene.debugLayer.show({ embedMode: true, enableClose: true, showExplorer: true, showInspector: true })
                        .then(() => { console.log("Inspector shown."); })
                        .catch(e => console.error("Inspector Error:", e));
                }
             } else { console.warn("Cannot toggle Inspector: Scene not ready."); }
             break;
         // Other debug keys remain the same...
         case 'KeyM': DEBUG_MAP_VISIBLE = !DEBUG_MAP_VISIBLE; console.log(`Map Always On: ${DEBUG_MAP_VISIBLE?'ON':'OFF'}`); /* updateDebugMapVisibility(); */ break; // Map drawing skipped
         case 'KeyL': DEBUG_MOVEMENT = !DEBUG_MOVEMENT; console.log(`Movement Logs: ${DEBUG_MOVEMENT?'ON':'OFF'}`); break;
         case 'KeyK': DEBUG_AGENT = !DEBUG_AGENT; console.log(`Agent Logs: ${DEBUG_AGENT?'ON':'OFF'}`); break;
         case 'Digit1': /* Map corners skipped */ break;
         case 'Digit2': /* Map corners skipped */ break;
         case 'Digit3': /* Map corners skipped */ break;
         case 'Digit4': /* Map corners skipped */ break;
     }
 }

// end of file