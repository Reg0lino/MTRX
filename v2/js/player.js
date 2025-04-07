// =============================================================================
// js/player.js - Player Controls, State, and Actions
// Version: 1.47e (Refactored - Fixed Control Attach/Detach)
// =============================================================================

// --- Player Constants ---
// Required constants (assuming they are defined globally in main.js or elsewhere)
// const PLAYER_MAX_HP = 100;
// const PLAYER_SPEED_WALK = 12.0;
// const PLAYER_SPEED_RUN = 24.0;
// const PLAYER_RADIUS = ...;
// const PLAYER_COLLISION_HEIGHT = ...;
// const PLAYER_EYE_HEIGHT = ...;
// const WALL_HEIGHT = ...;
// const DAMAGE_OVERLAY_FADE_OUT_TIME = 80;
// const DAMAGE_OVERLAY_FADE_IN_TIME = 80;
// const PLAYER_DAMAGE_SHAKE_DURATION = 0.15;

// Define Keybindings
const PLAYER_KEYS_UP = ["KeyW", "ArrowUp"];
const PLAYER_KEYS_DOWN = ["KeyS", "ArrowDown"];
const PLAYER_KEYS_LEFT = ["KeyA", "ArrowLeft"];
const PLAYER_KEYS_RIGHT = ["KeyD", "ArrowRight"];
const PLAYER_KEYS_RUN = ["ShiftLeft", "ShiftRight"];
const PLAYER_KEYS_RELOAD = ["KeyR"];
const PLAYER_KEYS_FIRE = ["Fire1"]; // Babylon mapping for left mouse

// =============================================================================
// Player State Damage Function
// =============================================================================
function damagePlayer(amount, source = "Bullet") {
    // Requires access to global: gameOver, gameWon, shakeTimer, playerHP, damageOverlayElement, triggerGameOver, updateHUD, playSound
    if (gameOver || gameWon || shakeTimer > 0) return;
    playerHP -= amount;
    playerHP = Math.max(0, playerHP);
    console.log(`Player took ${amount} damage from ${source}. HP: ${playerHP}`);

    // Screen Shake (Placeholder)
    shakeTimer = PLAYER_DAMAGE_SHAKE_DURATION;
    console.log("EFFECT: Player Damage Screen Shake (Babylon implementation needed)");
    // TODO: Implement camera shake

    playSound('player_hit'); // Requires audio.js
    playSound('player_hit_feedback'); // Requires audio.js

    // Damage Overlay (Requires access to damageOverlayElement from ui.js/main.js)
    if (damageOverlayElement) {
        damageOverlayElement.style.display = 'block';
        requestAnimationFrame(() => {
            damageOverlayElement.style.opacity = '1';
            setTimeout(() => {
                if (damageOverlayElement) damageOverlayElement.style.opacity = '0';
                setTimeout(() => {
                    if (damageOverlayElement && damageOverlayElement.style.opacity === '0') {
                        damageOverlayElement.style.display = 'none';
                    }
                }, DAMAGE_OVERLAY_FADE_OUT_TIME);
            }, DAMAGE_OVERLAY_FADE_IN_TIME);
        });
    }

    updateHUD(); // Requires ui.js

    if (playerHP <= 0) {
        triggerGameOver(`Eliminated by Agent ${source}`); // Requires game_state.js
    }
}


// =============================================================================
// Event Handlers Setup (Focus on Player Controls)
// =============================================================================
function setupEventListeners() {
    console.log("BJS [player.js]: Setting up Event Listeners...");
    // Requires access to globals: canvas, instructionsElement, isPointerLocked, gameOver, gameWon, engine, camera, scene, blockerElement, document
    // Requires functions: initializeAudioContext (audio.js), fireGun (shooting.js), stopMenuEffects, updateMenuForPause, updateMenuForRabbitPickup (ui.js), onKeyDown_BJS (this file)

    if (!canvas || !scene || !engine || !camera || !instructionsElement || !blockerElement) {
         console.error("Cannot setup listeners: Critical global element(s) missing!");
         return;
    }

    // --- Initial Start / Reload Click ---
    instructionsElement.addEventListener('click', () => {
        if (!isPointerLocked && !gameOver && !gameWon) {
            initializeAudioContext(); // Requires audio.js
            console.log("Instructions clicked: Requesting pointer lock...");
            engine.enterPointerlock();
        } else if (gameOver || gameWon) {
             window.location.reload();
        }
    });

    // --- Shooting (on canvas down event when locked) ---
    scene.onPointerDown = (evt, pickInfo) => {
        // Check for left mouse button (button 0) and if pointer is locked
        if (evt.button === 0 && isPointerLocked) {
            fireGun(); // Requires shooting.js
        }
    };

    // --- Pointer Lock Change ---
    const onPointerLockChange = () => {
        const element = document.pointerLockElement || document.mozPointerLockElement || document.webkitPointerLockElement || null;

        if (element === canvas) { // Gained lock
            if (!isPointerLocked) { // Prevent re-attaching if already locked somehow
                isPointerLocked = true;
                console.log("BJS [player.js]: Pointer Locked");
                // *** Attach controls AFTER lock is confirmed ***
                if (camera) {
                    camera.attachControl(canvas, true); // Attach mouse and keyboard
                    console.log("Camera controls attached.");
                }
                // Update UI
                if(blockerElement) { blockerElement.style.opacity = '0'; setTimeout(() => { if(blockerElement) blockerElement.style.display = 'none'; }, 300); }
                document.body.classList.add('locked');
                stopMenuEffects(); // Requires ui.js
                // Reset potentially active popup states
                isMenuDisplayedForRabbit = false;
                menuDisplayTimer = 0;
             }
        } else { // Lost lock
             if (isPointerLocked) { // Prevent detaching if not locked
                 isPointerLocked = false;
                 console.log("BJS [player.js]: Pointer Unlocked");
                 // *** Detach controls when lock is lost ***
                 if (camera) {
                     camera.detachControl();
                     console.log("Camera controls detached.");
                 }
                 // Update UI
                 document.body.classList.remove('locked');
                 if (gameOver || gameWon) { /* Menu handled by trigger functions in game_state.js */ }
                 else if (isMenuDisplayedForRabbit && menuDisplayTimer > 0) { updateMenuForRabbitPickup(); } // Requires ui.js
                 else { updateMenuForPause(); } // Requires ui.js
             }
        }
    };
    document.addEventListener("pointerlockchange", onPointerLockChange, false);
    document.addEventListener("mozpointerlockchange", onPointerLockChange, false);
    document.addEventListener("webkitpointerlockchange", onPointerLockChange, false);

    // --- Keyboard Input ---
    // Only need this observable to handle non-movement keys (Reload, Toggles)
    // and potentially modify camera speed via Shift. WASD/Arrows are handled by attachControl.
    const keyMap = {};
    scene.onKeyboardObservable.add((kbInfo) => {
        const isDown = kbInfo.type === BABYLON.KeyboardEventTypes.KEYDOWN;
        const key = kbInfo.event.code;
        keyMap[key] = isDown;

        // Handle single press actions
        if (isDown) {
            onKeyDown_BJS(key); // Handle toggles, reload etc. defined below
        }

        // Update camera speed based on Shift state (only when locked)
        const shiftPressed = keyMap[PLAYER_KEYS_RUN[0]] || keyMap[PLAYER_KEYS_RUN[1]] || false;
        if (camera) {
             if (isPointerLocked) {
                  camera.speed = shiftPressed ? PLAYER_SPEED_RUN : PLAYER_SPEED_WALK;
                  isRunning = shiftPressed; // Update global state if needed
             } else {
                  isRunning = false;
                  // Ensure speed resets if lock is lost while running
                  if (camera.speed !== PLAYER_SPEED_WALK) {
                       camera.speed = PLAYER_SPEED_WALK;
                  }
             }
         }
    });

    // --- Window Resize --- (Handled in main.js now)
    // window.addEventListener("resize", () => { if (engine) { engine.resize(); } });

    console.log("BJS [player.js]: Event Listeners Setup Complete.");
}

// Function to handle single keydown events (Reload, Toggles)
function onKeyDown_BJS(keyCode) {
    // Requires access to globals: DEBUG_*, scene, debugMapCanvas, isPointerLocked, menuDisplayTimer, mapDisplayTimer
    // Requires functions: startReload (shooting.js)

    const allowDebugInput = ['KeyP', 'KeyM', 'KeyL', 'KeyK', 'Digit1', 'Digit2', 'Digit3', 'Digit4'].includes(keyCode);
    const allowGameInput = isPointerLocked && menuDisplayTimer <= 0 && mapDisplayTimer <= 0;

    if (allowGameInput) {
        if (PLAYER_KEYS_RELOAD.includes(keyCode)) {
            startReload(); // Requires shooting.js
        }
    }

    if (allowDebugInput) {
        switch (keyCode) {
            case 'KeyP': // Toggle Collision Debug View
                DEBUG_COLLISION = !DEBUG_COLLISION;
                console.log(`Collision Debug View: ${DEBUG_COLLISION?'ON':'OFF'}`);
                if(scene.debugLayer) {
                    if (DEBUG_COLLISION && !scene.debugLayer.isVisible()) {
                        scene.debugLayer.show({ embedMode: true, showCollisionMeshes: true }).catch(e=>console.error("Error showing debug layer:", e));
                    } else if (!DEBUG_COLLISION && scene.debugLayer.isVisible()) {
                        scene.debugLayer.hide();
                    } else if (DEBUG_COLLISION && scene.debugLayer.isVisible()) {
                        // If already visible, explicitly set collision mesh visibility state
                         scene.debugLayer.show({ embedMode: true, showCollisionMeshes: true }).catch(e=>console.error("Error showing debug layer:", e));
                    }
                } else if (DEBUG_COLLISION) {
                    console.warn("Debug layer not available/imported. Cannot show collision meshes.");
                    // Optionally attempt to load/show it dynamically here if desired
                     scene.debugLayer.show({ embedMode: true, showCollisionMeshes: true }).catch(e=>console.error(e));
                }
                break;
            case 'KeyM': // Toggle Debug Map
                DEBUG_MAP_VISIBLE = !DEBUG_MAP_VISIBLE;
                console.log(`Map Always On: ${DEBUG_MAP_VISIBLE?'ON':'OFF'}`);
                // Map visibility updated in drawDebugMap (ui.js)
                break;
            case 'KeyL': // Toggle Movement Logs
                DEBUG_MOVEMENT = !DEBUG_MOVEMENT;
                console.log(`Movement Debug Logs: ${DEBUG_MOVEMENT?'ON':'OFF'}`);
                break;
            case 'KeyK': // Toggle Agent Logs
                DEBUG_AGENT = !DEBUG_AGENT;
                console.log(`Agent Debug Logs: ${DEBUG_AGENT?'ON':'OFF'}`);
                break;
            // Map positioning keys...
            case 'Digit1': if (debugMapCanvas) { debugMapCanvas.className = 'map-top-left'; if(DEBUG_MAP_VISIBLE || mapDisplayTimer > 0) debugMapCanvas.classList.add('visible'); } break;
            case 'Digit2': if (debugMapCanvas) { debugMapCanvas.className = 'map-top-right'; if(DEBUG_MAP_VISIBLE || mapDisplayTimer > 0) debugMapCanvas.classList.add('visible');} break;
            case 'Digit3': if (debugMapCanvas) { debugMapCanvas.className = 'map-bottom-left'; if(DEBUG_MAP_VISIBLE || mapDisplayTimer > 0) debugMapCanvas.classList.add('visible');} break;
            case 'Digit4': if (debugMapCanvas) { debugMapCanvas.className = 'map-bottom-right'; if(DEBUG_MAP_VISIBLE || mapDisplayTimer > 0) debugMapCanvas.classList.add('visible');} break;
        }
    }
}

/*
// =============================================================================
// == Three.js Reference (Player Controls / Input) ==
// =============================================================================
// // Player State
// let moveForward = false; let moveBackward = false; let moveLeft = false; let moveRight = false; let isRunning = false; let currentSpeed = PLAYER_SPEED_WALK; let playerHP = PLAYER_MAX_HP;
// let lastCamYRotation = 0;
//
// // Controls Init
// controls = new THREE.PointerLockControls(camera, document.body);
// scene.add(controls.getObject());
//
// // Event Listeners
// instructionsElement.addEventListener('click', () => { controls.lock(); });
// controls.addEventListener('lock', () => { ... show/hide blocker ... });
// controls.addEventListener('unlock', () => { ... show/hide blocker ... });
// window.addEventListener('mousedown', (event) => { if (controls.isLocked && event.button === 0) fireGun(); });
// document.addEventListener('keydown', onKeyDown); // Separate onKeyDown handler
// document.addEventListener('keyup', onKeyUp); // Separate onKeyUp handler
//
// // Key Down Handler
// const onKeyDown = function (event) {
//     switch (event.code) {
//         case 'ArrowUp': case 'KeyW': moveForward = true; break;
//         case 'ArrowLeft': case 'KeyA': moveLeft = true; break;
//         case 'ArrowDown': case 'KeyS': moveBackward = true; break;
//         case 'ArrowRight': case 'KeyD': moveRight = true; break;
//         case 'ShiftLeft': case 'ShiftRight': if (!isRunning) { isRunning = true; currentSpeed = PLAYER_SPEED_RUN; } break;
//         case 'KeyR': startReload(); break;
//         // Debug toggles...
//     }
// };
// // Key Up Handler...
//
// // Movement in Animate Loop
// if (controls.isLocked) {
//    // Get camera direction
//    camera.getWorldDirection(playerWorldDirection).setY(0).normalize();
//    playerRightDirection.crossVectors(camera.up, playerWorldDirection).normalize();
//    // Build movement vector based on flags
//    const moveDirection = tempVec.set(0, 0, 0);
//    if (moveForward) moveDirection.add(playerWorldDirection);
//    // ... add backward, left, right ...
//    moveDirection.normalize();
//    // Calculate intended movement
//    const intendedMovement = moveDirection.multiplyScalar(currentSpeed * delta);
//    // Check collisions using raycasting
//    const allowedMovement = checkRaycastCollisions(playerPosition, intendedMovement);
//    // Apply movement to playerPosition state
//    playerPosition.add(allowedMovement);
//    // Resolve penetration
//    resolvePenetration(playerPosition);
//    // Sync controls object to final position
//    controls.getObject().position.copy(playerPosition);
// }
*/