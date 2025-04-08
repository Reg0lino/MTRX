// =============================================================================
// js/main.js - Main Entry Point & Game Loop Orchestration
// Version: 1.48c (Spawn Higher, Viz Adjust, Jump Logic Prep) - WALL FIX, JUMP ENABLED
// =============================================================================

// Uses constants v1.48e. Uses Regular Meshes. Collision Viz = Sphere.
// Player spawns higher. Shooting restored. Agents disabled. Manual Jump logic ENABLED.

// --- Global/Shared Variables ---
let canvas=null, engine=null, scene=null, camera=null, playerLight=null, audioCtx=null;
const mazeGrid=[], agents=[], activeRabbits=[], activeBullets=[];
let floorMesh_BJS=null, ceilingMesh_BJS=null, gunGroup_BJS=null, bulletMaterial_BJS=null, collisionVisualizer_BJS=null, mazeExitObject_BJS=null, mazeExitPosition=null;
let playerPosition=new BABYLON.Vector3(), playerHP=100, isPointerLocked=false, gameWon=false, gameOver=false, agentsRemaining=0, currentAmmo=12, isReloading=false, reloadTimer=0, canShoot=true, shootTimer=0, isRunning=false;
let rabbitSpawnTimer=15.0, mapDisplayTimer=0, menuDisplayTimer=0, isMenuDisplayedForRabbit=false, shakeTimer=0;
let DEBUG_COLLISION=false, DEBUG_MOVEMENT=true, DEBUG_AGENT=false, DEBUG_MAP_VISIBLE=false, DEBUG_SHOW_PLAYER_COLLIDER=false;
// DOM Refs
let blockerElement=null, instructionsElement=null, glitchTitleElement=null, staticInstructionsElement=null, debugMapCanvas=null, debugMapCtx=null, hudHpBarFill=null, hudWeaponName=null, hudAmmoCount=null, hudReloadIndicator=null, hudReloadProgress=null, hudAgentCount=null, damageOverlayElement=null, versionInfoElement=null, menuEffectInterval=null;
let keyMap = {};
// State for Jump / Manual Gravity
let playerIsGrounded = true;
let playerVelocityY = 0; // Player's vertical velocity for manual gravity/jump
let lastGroundCheckTime = 0;
const groundCheckInterval = 0.1; // How often to check if grounded (seconds)
const groundCheckDist = PLAYER_COLLISION_HEIGHT * 0.55;

// =============================================================================
// Initialization Sequence (Unchanged)
// =============================================================================
async function initGame() { /* ... (unchanged from v1.48c) ... */ }

// =============================================================================
// Game Loop Function (JUMP ENABLED, otherwise unchanged)
// =============================================================================
function startGameLoop() {
    let lastLoggedSpeed = -1;
    let previousCameraPosition = new BABYLON.Vector3();
    let wasCameraColliding = false;

    engine.runRenderLoop(() => {
        if (!scene || !scene.activeCamera) return;
        const delta = Math.min(engine.getDeltaTime() / 1000.0, 0.1);
        const time = performance.now() / 1000.0;

        // --- Manual Gravity & Ground Check (Unchanged) ---
        lastGroundCheckTime += delta; if (lastGroundCheckTime >= groundCheckInterval) { playerIsGrounded = checkGrounded(); lastGroundCheckTime = 0; if (playerIsGrounded && playerVelocityY < 0) { playerVelocityY = 0; } }
        if (playerIsGrounded === false) { playerVelocityY += MANUAL_GRAVITY * delta; }

        // Store Previous Position
        if (camera) { previousCameraPosition.copyFrom(camera.position); }

        // --- Collision Detection for Visualizer (Unchanged) ---
        let isCameraCollidingHorizontally = false; if (isPointerLocked) { const posChangedSignificantly = camera.position.subtract(previousCameraPosition).lengthSquared() < 0.00001; const tryingToMove = camera.speed > 0 && (keyMap["KeyW"] || keyMap["KeyA"] || keyMap["KeyS"] || keyMap["KeyD"] || keyMap["ArrowUp"] || keyMap["ArrowDown"] || keyMap["ArrowLeft"] || keyMap["ArrowRight"]); if (positionChangedSignificantly && tryingToMove) { isCameraCollidingHorizontally = true; if (Math.abs(camera.position.y - previousCameraPosition.y) < 0.001) { playerIsGrounded = true; } } }
        if (isCameraCollidingHorizontally !== wasCameraColliding) { wasCameraColliding = isCameraCollidingHorizontally; if (collisionVisualizer_BJS?.material) { collisionVisualizer_BJS.material.emissiveColor = wasCameraColliding ? new BABYLON.Color3(1, 0, 0) : new BABYLON.Color3(0, 1, 0); if(DEBUG_MOVEMENT && isCameraCollidingHorizontally && engine.frameId % 30 === 0) console.log("Collision Detected (Viz)"); } }

        // Debug Log (Unchanged)
        if (DEBUG_MOVEMENT && camera && (engine.frameId % 60 === 0 || camera.speed !== lastLoggedSpeed)) { console.log(`[Loop ${engine.frameId}] Cam Pos: ${camera.position.x.toFixed(2)},${camera.position.y.toFixed(2)},${camera.position.z.toFixed(2)} | Speed: ${camera.speed.toFixed(1)} | Coll: ${camera.checkCollisions} | Grav: ${camera.applyGravity} | Grounded: ${playerIsGrounded} | VelY: ${playerVelocityY.toFixed(2)}`); }
        if (camera && camera.speed !== lastLoggedSpeed) { lastLoggedSpeed = camera.speed; }

        // Timers (Unchanged)
        if(menuDisplayTimer>0){menuDisplayTimer-=delta;if(menuDisplayTimer<=0){menuDisplayTimer=0;isMenuDisplayedForRabbit=false;if(!isPointerLocked&&!gameOver&&!gameWon){updateMenuForPause();}}}
        if(mapDisplayTimer>0){mapDisplayTimer-=delta;if(mapDisplayTimer<=0){mapDisplayTimer=0;DEBUG_MAP_VISIBLE=false;updateDebugMapVisibility();}}
        if(shakeTimer>0){shakeTimer-=delta;}

        // Player State Sync (Unchanged)
        if (camera) { playerPosition.copyFrom(camera.position); if (playerLight) { playerLight.position.copyFrom(camera.position); } }

        // Debug Collision Visualizer - Sphere, slightly in front and below eye level (Unchanged)
        if (collisionVisualizer_BJS && camera) { collisionVisualizer_BJS.position.copyFrom(camera.globalPosition).addInPlace(camera.ellipsoidOffset); collisionVisualizer_BJS.position.y -= PLAYER_COLLISION_HEIGHT * 0.15; if (collisionVisualizer_BJS.isVisible !== DEBUG_SHOW_PLAYER_COLLIDER) { collisionVisualizer_BJS.isVisible = DEBUG_SHOW_PLAYER_COLLIDER; } }

        // Game Logic Updates (Unchanged - Agents still disabled for now)
        if (isPointerLocked && !gameOver && !gameWon) { handleShootingCooldown(delta); handleReloading(delta, time); updateBullets_BJS(delta); /* updateAgents_BJS(delta, time); */ updateRabbits_BJS(delta, time); }
        else { if (camera && camera.speed !== PLAYER_SPEED_WALK) { camera.speed = PLAYER_SPEED_WALK; isRunning = false; } }

        // UI Updates (Unchanged)
        updateHUD(time); drawDebugMap(time);

        // --- Apply Manual Vertical Movement (AFTER collision checks, BEFORE render) ---
        if (camera) camera.position.y += playerVelocityY * delta;

        // Render
        try { scene.render(); }
        catch (e) { console.error("Render loop error:", e); engine.stopRenderLoop(); triggerGameOver("Render Error"); }
    });
}

// =============================================================================
// Helper Function for Collision Visualizer (Unchanged)
// =============================================================================
function createCollisionVisualizer() { /* ... unchanged from v1.47w ... */}

// =============================================================================
// Global keyMap (Unchanged)
// =============================================================================
let keyMap = {}; // Declared globally, updated by player.js

// =============================================================================
// Start Initialization (Unchanged)
// =============================================================================
if(typeof createScene==='function'&&typeof setupEventListeners==='function'&&typeof initMazeGrid==='function'&&typeof setupHUD==='function'&&typeof createGun_BJS==='function'&&typeof createAgents_BJS==='function'&&typeof spawnRabbit_BJS==='function'&&typeof triggerGameOver==='function'){ initGame().catch(e => { console.error("Init Error:", e); engine?.hideLoadingUI(); const ic=document.getElementById('instructions'); if(ic){ic.innerHTML=`<span style="color:red;">INIT FAILED<br/>Console(F12)</span><pre>${e.stack||e}</pre>`;document.getElementById('blocker').style.display='flex';}else{alert("Init Failed! Console(F12)");}}); } else { console.error("Essential functions missing!"); alert("Init Failed! Scripts missing. Console(F12)"); const ic=document.getElementById('instructions'); if(ic){ic.innerHTML=`<span style="color:red;">SCRIPT LOAD FAILED<br/>Check Console(F12)</span>`;document.getElementById('blocker').style.display='flex';} }

// end of file