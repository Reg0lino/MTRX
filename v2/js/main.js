// =============================================================================
// js/main.js - Main Entry Point & Game Loop Orchestration
// Version: 1.47q (Wider Corridors, Smaller Rabbits, Sensitivity Fix)
// =============================================================================

// --- Annotations ---
// Uses constants v1.47q. Initializes full game state. Focus on verifying
// scale, visualizer size, and movement.

// --- Global/Shared Variables ---
let canvas=null, engine=null, scene=null, camera=null, playerLight=null, audioCtx=null;
const mazeGrid=[], agents=[], activeRabbits=[], activeBullets=[];
let floorMesh_BJS=null, ceilingMesh_BJS=null, gunGroup_BJS=null, bulletMaterial_BJS=null, collisionVisualizer_BJS=null, mazeExitObject_BJS=null, mazeExitPosition=null;
let playerPosition=new BABYLON.Vector3(), playerHP=100, isPointerLocked=false, gameWon=false, gameOver=false, agentsRemaining=0, currentAmmo=12, isReloading=false, reloadTimer=0, canShoot=true, shootTimer=0, isRunning=false;
let rabbitSpawnTimer=15.0, mapDisplayTimer=0, menuDisplayTimer=0, isMenuDisplayedForRabbit=false, shakeTimer=0;
let DEBUG_COLLISION=false, DEBUG_MOVEMENT=true, DEBUG_AGENT=true, DEBUG_MAP_VISIBLE=false, DEBUG_SHOW_PLAYER_COLLIDER=false; // Enable move/agent logs default
// DOM Refs
let blockerElement=null, instructionsElement=null, glitchTitleElement=null, staticInstructionsElement=null, debugMapCanvas=null, debugMapCtx=null, hudHpBarFill=null, hudWeaponName=null, hudAmmoCount=null, hudReloadIndicator=null, hudReloadProgress=null, hudAgentCount=null, damageOverlayElement=null, versionInfoElement=null, menuEffectInterval=null;

// =============================================================================
// Initialization Sequence (Restored Full Init)
// =============================================================================
async function initGame() {
    console.log(`--- INIT GAME: Starting initialization (v1.47q Wider Corridors) ---`);

    // --- Load Constants & Set Initial State ---
    if (typeof CELL_SIZE === 'undefined') { console.error("CRITICAL: constants.js failed!"); return; }
    playerHP = typeof PLAYER_MAX_HP !== 'undefined' ? PLAYER_MAX_HP : 100;
    currentAmmo = typeof GUN_CLIP_SIZE !== 'undefined' ? GUN_CLIP_SIZE : 12;
    rabbitSpawnTimer = typeof RABBIT_SPAWN_INTERVAL !== 'undefined' ? RABBIT_SPAWN_INTERVAL : 15.0;
    console.log("Constants loaded successfully (v1.47q).");

    // --- Basic Setup ---
    canvas=document.getElementById("mazeCanvas"); if(!canvas){console.error("CRITICAL: Canvas missing!"); return;}
    engine=new BABYLON.Engine(canvas, true, {preserveDrawingBuffer:true, stencil:true}); if(!engine) throw 'Engine missing.';
    engine.displayLoadingUI();

    // --- Create Scene Elements ---
    scene = await createScene(engine); // env.js
    if (!scene){console.error("CRITICAL: Scene creation failed!"); engine.hideLoadingUI(); return;}

    // --- Generate Maze Data ---
    console.log("INIT GAME: Generating Maze Data...");
    initMazeGrid(); // env.js
    const startCell = mazeGrid[1]?.[1] || mazeGrid[0]?.[0]; if(!startCell){console.error("CRITICAL: No start cell!"); engine.hideLoadingUI(); return;}
    generateMaze(startCell); // env.js
    addCrossConnections(CROSS_CONNECTION_CHANCE); // env.js

    // --- Log Size Info ---
    const corridorW = PATH_VISUAL_WIDTH * CELL_SIZE; // Path width uses calculation now
    const playerDiam = PLAYER_RADIUS * 2;
    console.log(`INIT INFO: MAZE_GRID_SCALE=${MAZE_GRID_SCALE}, CELL_SIZE=${CELL_SIZE.toFixed(2)} => Actual Corridor Width: ${corridorW.toFixed(2)}`);
    console.log(`INIT INFO: PLAYER_RADIUS=${PLAYER_RADIUS.toFixed(2)} => Player Diameter: ${playerDiam.toFixed(2)}`);
    if (playerDiam >= corridorW - 0.05) { console.warn("INIT WARNING: Player diameter still very close to/larger than corridor width!"); } else { console.log("INIT INFO: Player diameter fits corridor."); }

    // --- Create 3D Maze Geometry ---
    console.log("INIT GAME: Creating Maze Geometry...");
    createMazeGeometry_BJS(); // env.js - Uses relative constants

    // --- Position Player ---
    console.log("INIT GAME: Setting Player Start Position...");
    findLongestCorridorAndSetPlayerStart_BJS(); // env.js - Uses relative constants

    // --- Create Collision Visualizer ---
    console.log("INIT GAME: Creating Collision Visualizer...");
    createCollisionVisualizer(); // local helper - Forcing smaller size override here

    // --- Create Game Entities (Restored) ---
    console.log("INIT GAME: Creating Game Entities...");
    createGun_BJS(scene, camera); // shooting.js
    createAgents_BJS(scene);     // agents.js
    for (let i=0; i<INITIAL_RABBIT_SPAWN_COUNT; i++) { spawnRabbit_BJS(scene); } // rabbits.js

    // --- Setup UI ---
    console.log("INIT GAME: Setting up UI...");
    if (!setupHUD()) { console.warn("HUD setup incomplete."); } // ui.js

    // --- Setup Input ---
    console.log("INIT GAME: Setting up Event Listeners...");
    setupEventListeners(); // player.js

    // --- Start Game ---
    engine.hideLoadingUI();
    console.log("INIT GAME: Starting Render Loop...");
    startGameLoop(); // Local helper

    // --- Initial Menu ---
    if (!gameOver && !gameWon) { const title=`<span id="glitchTitle" style="font-size:36px; display:inline-block;">[ENTER BACKDOORS]</span>`; const instr=`<span id="staticInstructions" style="font-size:14px; display:block; margin-top:15px;">(W,A,S,D=Move, MOUSE=Look, SHIFT=Run, CLICK=Fire, R=Reload)<br/>(C=Collision Box, M=Map)<br/><br/>THEY KNOW YOU'RE HERE :: Collect Rabbits :: Destroy Agents</span>`; setupInitialMenu(title,instr); startMenuEffects(); } // ui.js

    console.log("--- DEBUG TOGGLES --- C: Collision Box | M: Map | L: Move Logs | K: Agent Logs ---");
    console.log(`Matrix Maze Initialized (Babylon.js v1.47q). Click screen to start.`);
    console.log("--- INIT GAME: Finished ---");
}

// =============================================================================
// Game Loop Function (Restored Full Loop)
// =============================================================================
function startGameLoop() {
    let lastLoggedSpeed = -1;
    engine.runRenderLoop(() => {
        if (!scene || !scene.activeCamera) return;
        const delta = Math.min(engine.getDeltaTime() / 1000.0, 0.1);
        const time = performance.now() / 1000.0;

        // Debug Log
        if (DEBUG_MOVEMENT && camera && (engine.frameId % 60 === 0 || camera.speed !== lastLoggedSpeed)) { console.log(`[Loop ${engine.frameId}] Cam Pos: ${camera.position.x.toFixed(1)},${camera.position.y.toFixed(1)},${camera.position.z.toFixed(1)} | Speed: ${camera.speed.toFixed(1)} | Coll: ${camera.checkCollisions} | Grav: ${camera.applyGravity}`); }
        if (camera && camera.speed !== lastLoggedSpeed) { lastLoggedSpeed = camera.speed; }

        // Timers
        if(menuDisplayTimer>0){menuDisplayTimer-=delta;if(menuDisplayTimer<=0){menuDisplayTimer=0;isMenuDisplayedForRabbit=false;if(!isPointerLocked&&!gameOver&&!gameWon){updateMenuForPause();}}}
        if(mapDisplayTimer>0){mapDisplayTimer-=delta;if(mapDisplayTimer<=0){mapDisplayTimer=0;DEBUG_MAP_VISIBLE=false;updateDebugMapVisibility();}}
        if(shakeTimer>0){shakeTimer-=delta;}

        // Player State Sync
        if (camera) { playerPosition.copyFrom(camera.position); if (playerLight) { playerLight.position.copyFrom(camera.position); } }

        // Debug Visualizer
        if (collisionVisualizer_BJS && camera) {
            collisionVisualizer_BJS.position.copyFrom(camera.globalPosition).addInPlace(camera.ellipsoidOffset);
            // Offset slightly higher to prevent ground clipping
            collisionVisualizer_BJS.position.y += 0.05;
            if (collisionVisualizer_BJS.isVisible !== DEBUG_SHOW_PLAYER_COLLIDER) {
                collisionVisualizer_BJS.isVisible = DEBUG_SHOW_PLAYER_COLLIDER;
            }
        }

        // Game Logic Updates
        if (isPointerLocked && !gameOver && !gameWon) { handleShootingCooldown(delta); handleReloading(delta, time); updateBullets_BJS(delta); updateAgents_BJS(delta, time); updateRabbits_BJS(delta, time); }
        else { if (camera && camera.speed !== PLAYER_SPEED_WALK) { camera.speed = PLAYER_SPEED_WALK; isRunning = false; } }

        // UI Updates
        updateHUD(time); drawDebugMap(time);

        // Render
        try { scene.render(); }
        catch (e) { console.error("Render loop error:", e); engine.stopRenderLoop(); triggerGameOver("Render Error"); }
    });
}

// =============================================================================
// Helper Function for Collision Visualizer (FORCING SMALLER SIZE)
// =============================================================================
function createCollisionVisualizer() {
     if (!scene || !camera) { console.error("Cannot create visualizer: Scene/Camera missing."); return; }
     console.log("Creating player collision visualizer (FORCING SMALL SIZE)...");

     // *** OVERRIDE CONSTANTS FOR VISUALIZER SIZE - Make it very small ***
     const vizRadius = 0.1; // Forcing radius to 0.1 for visual test
     const vizHeight = 0.5; // Forcing height to 0.5 for visual test
     console.warn(` Collision Visualizer Size OVERRIDDEN to R=${vizRadius}, H=${vizHeight} for debug.`);

     collisionVisualizer_BJS = BABYLON.MeshBuilder.CreateCylinder("playerColliderViz", {
         diameterTop: vizRadius * 2,
         diameterBottom: vizRadius * 2,
         height: vizHeight,
         tessellation: 12 // Fewer segments needed for small cylinder
     }, scene);

     if (!collisionVisualizer_BJS) { console.error("Failed to create visualizer mesh!"); return; }

     const vizMat = new BABYLON.StandardMaterial("colliderVizMat", scene); vizMat.diffuseColor = new BABYLON.Color3(0,1,0); vizMat.alpha=0.4; vizMat.wireframe=true; // Slightly more opaque wireframe
     collisionVisualizer_BJS.material = vizMat;
     collisionVisualizer_BJS.isVisible = DEBUG_SHOW_PLAYER_COLLIDER;
     collisionVisualizer_BJS.isPickable = false;

     // Position based on camera + ellipsoid offset (use actual ellipsoid offset)
     collisionVisualizer_BJS.position.copyFrom(camera.globalPosition).addInPlace(camera.ellipsoidOffset);

     console.log(`Collision visualizer created (FORCED SIZE R=${vizRadius}, H=${vizHeight})`);
     console.log(`Collision visualizer initial visibility: ${collisionVisualizer_BJS.isVisible}`);
 }

// =============================================================================
// Start Initialization
// =============================================================================
if(typeof createScene==='function'&&typeof setupEventListeners==='function'&&typeof initMazeGrid==='function'&&typeof setupHUD==='function'&&typeof createGun_BJS==='function'&&typeof createAgents_BJS==='function'&&typeof spawnRabbit_BJS==='function'&&typeof triggerGameOver==='function'){ initGame().catch(e => { console.error("Init Error:", e); engine?.hideLoadingUI(); const ic=document.getElementById('instructions'); if(ic){ic.innerHTML=`<span style="color:red;">INIT FAILED<br/>Console(F12)</span><pre>${e.stack||e}</pre>`;document.getElementById('blocker').style.display='flex';}else{alert("Init Failed! Console(F12)");}}); } else { console.error("Essential functions missing!"); alert("Init Failed! Scripts missing. Console(F12)"); const ic=document.getElementById('instructions'); if(ic){ic.innerHTML=`<span style="color:red;">SCRIPT LOAD FAILED<br/>Console(F12)</span>`;document.getElementById('blocker').style.display='flex';} }

// end of file