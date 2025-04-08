// =============================================================================
// js/player.js - Player Controls, State, and Actions
// Version: 1.47g (Refactored)
// =============================================================================

// Relies on constants defined in constants.js
// Relies on globals from main.js

// =============================================================================
// Player State Damage Function
// =============================================================================
function damagePlayer(amount, source = "Bullet") {
    // Requires globals: gameOver, gameWon, shakeTimer, playerHP, damageOverlayElement
    // Requires functions: triggerGameOver, updateHUD, playSound
    // Requires constants: PLAYER_MAX_HP, DAMAGE_*, PLAYER_DAMAGE_*
    if (typeof triggerGameOver === 'undefined' || typeof updateHUD === 'undefined' || typeof playSound === 'undefined') { console.error("damagePlayer dependencies missing!"); return; }
    if (gameOver || gameWon || shakeTimer > 0) return;
    playerHP -= amount; playerHP = Math.max(0, playerHP);
    console.log(`Player took ${amount} damage from ${source}. HP: ${playerHP}`);
    shakeTimer = PLAYER_DAMAGE_SHAKE_DURATION; console.log("EFFECT: Player Damage Screen Shake (Implementation needed)");
    playSound('player_hit'); playSound('player_hit_feedback');
    if (damageOverlayElement) { damageOverlayElement.style.display = 'block'; requestAnimationFrame(() => { damageOverlayElement.style.opacity = '1'; setTimeout(() => { if (damageOverlayElement) damageOverlayElement.style.opacity = '0'; setTimeout(() => { if (damageOverlayElement && damageOverlayElement.style.opacity === '0') { damageOverlayElement.style.display = 'none'; } }, DAMAGE_OVERLAY_FADE_OUT_TIME); }, DAMAGE_OVERLAY_FADE_IN_TIME); }); }
    updateHUD();
    if (playerHP <= 0) { triggerGameOver(`Eliminated by Agent ${source}`); }
}

// =============================================================================
// Event Handlers Setup
// =============================================================================
function setupEventListeners() {
    console.log("BJS [player.js]: Setting up Event Listeners...");
    // Requires globals: canvas, instructionsElement, isPointerLocked, gameOver, gameWon, engine, camera, scene, blockerElement, document
    // Requires functions: initializeAudioContext, fireGun, stopMenuEffects, updateMenuForPause, updateMenuForRabbitPickup, onKeyDown_BJS
    if (!canvas || !scene || !engine || !camera || !instructionsElement || !blockerElement) { console.error("Cannot setup listeners: Critical global element(s) missing!"); return; }

    instructionsElement.addEventListener('click', () => { if (!isPointerLocked && !gameOver && !gameWon) { initializeAudioContext(); console.log("Instructions clicked: Requesting pointer lock..."); if (engine) engine.enterPointerlock(); } else if (gameOver || gameWon) { window.location.reload(); } });
    scene.onPointerDown = (evt, pickInfo) => { if (evt.button === 0 && isPointerLocked) { fireGun(); } };
    const onPointerLockChange = () => { const element = document.pointerLockElement || document.mozPointerLockElement || document.webkitPointerLockElement || null; if (element === canvas) { if (!isPointerLocked) { isPointerLocked = true; console.log("BJS [player.js]: Pointer Locked"); if (camera) { camera.attachControl(canvas, true); console.log("Camera controls attached."); } if(blockerElement) { blockerElement.style.opacity = '0'; setTimeout(() => { if(blockerElement) blockerElement.style.display = 'none'; }, 300); } document.body.classList.add('locked'); stopMenuEffects(); isMenuDisplayedForRabbit = false; menuDisplayTimer = 0; } } else { if (isPointerLocked) { isPointerLocked = false; console.log("BJS [player.js]: Pointer Unlocked"); if (camera) { camera.detachControl(); console.log("Camera controls detached."); } document.body.classList.remove('locked'); if (gameOver || gameWon) {} else if (isMenuDisplayedForRabbit && menuDisplayTimer > 0) { updateMenuForRabbitPickup(); } else { updateMenuForPause(); } } } };
    document.addEventListener("pointerlockchange", onPointerLockChange, false); document.addEventListener("mozpointerlockchange", onPointerLockChange, false); document.addEventListener("webkitpointerlockchange", onPointerLockChange, false);
    const keyMap = {}; scene.onKeyboardObservable.add((kbInfo) => { const isDown = kbInfo.type === BABYLON.KeyboardEventTypes.KEYDOWN; const key = kbInfo.event.code; keyMap[key] = isDown; if (isDown) { onKeyDown_BJS(key); } const shiftPressed = keyMap[PLAYER_KEYS_RUN[0]] || keyMap[PLAYER_KEYS_RUN[1]] || false; if (camera) { if (isPointerLocked) { camera.speed = shiftPressed ? PLAYER_SPEED_RUN : PLAYER_SPEED_WALK; isRunning = shiftPressed; } else { isRunning = false; if (camera.speed !== PLAYER_SPEED_WALK) { camera.speed = PLAYER_SPEED_WALK; } } } });
    console.log("BJS [player.js]: Event Listeners Setup Complete.");
}

// Function to handle single keydown events (Reload, Toggles)
function onKeyDown_BJS(keyCode) {
    // Requires globals: DEBUG_*, scene, debugMapCanvas, isPointerLocked, menuDisplayTimer, mapDisplayTimer
    // Requires constants: PLAYER_KEYS_RELOAD
    // Requires functions: startReload (shooting.js)
    const allowDebugInput = ['KeyP', 'KeyM', 'KeyL', 'KeyK', 'Digit1', 'Digit2', 'Digit3', 'Digit4'].includes(keyCode);
    const allowGameInput = isPointerLocked && menuDisplayTimer <= 0 && mapDisplayTimer <= 0;
    if (allowGameInput) { if (PLAYER_KEYS_RELOAD.includes(keyCode)) { startReload(); } }
    if (allowDebugInput) { switch (keyCode) { case 'KeyP': DEBUG_COLLISION = !DEBUG_COLLISION; console.log(`Collision Debug View: ${DEBUG_COLLISION?'ON':'OFF'}`); if(scene.debugLayer) { if (DEBUG_COLLISION && !scene.debugLayer.isVisible()) { scene.debugLayer.show({ embedMode: true, showCollisionMeshes: true }).catch(e=>console.error(e)); } else if (!DEBUG_COLLISION && scene.debugLayer.isVisible()) { scene.debugLayer.hide(); } else if (DEBUG_COLLISION && scene.debugLayer.isVisible()) { scene.debugLayer.show({ embedMode: true, showCollisionMeshes: true }).catch(e=>console.error(e)); } } else if(DEBUG_COLLISION) { console.warn("Debug layer needs to be enabled/imported for Key P."); scene.debugLayer.show({ embedMode: true, showCollisionMeshes: true }).catch(e=>console.error(e)); } break; case 'KeyM': DEBUG_MAP_VISIBLE = !DEBUG_MAP_VISIBLE; console.log(`Map Always On: ${DEBUG_MAP_VISIBLE?'ON':'OFF'}`); break; case 'KeyL': DEBUG_MOVEMENT = !DEBUG_MOVEMENT; console.log(`Movement Debug Logs: ${DEBUG_MOVEMENT?'ON':'OFF'}`); break; case 'KeyK': DEBUG_AGENT = !DEBUG_AGENT; console.log(`Agent Debug Logs: ${DEBUG_AGENT?'ON':'OFF'}`); break; case 'Digit1': if (debugMapCanvas) { debugMapCanvas.className = 'map-top-left'; if(DEBUG_MAP_VISIBLE || mapDisplayTimer > 0) debugMapCanvas.classList.add('visible'); } break; case 'Digit2': if (debugMapCanvas) { debugMapCanvas.className = 'map-top-right'; if(DEBUG_MAP_VISIBLE || mapDisplayTimer > 0) debugMapCanvas.classList.add('visible');} break; case 'Digit3': if (debugMapCanvas) { debugMapCanvas.className = 'map-bottom-left'; if(DEBUG_MAP_VISIBLE || mapDisplayTimer > 0) debugMapCanvas.classList.add('visible');} break; case 'Digit4': if (debugMapCanvas) { debugMapCanvas.className = 'map-bottom-right'; if(DEBUG_MAP_VISIBLE || mapDisplayTimer > 0) debugMapCanvas.classList.add('visible');} break; } }
}

// end of file