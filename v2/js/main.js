// =============================================================================
// js/main.js - Main Entry Point & Game Loop Orchestration
// Version: 1.47g (Refactored - Localized Geo Templates)
// =============================================================================

// --- Global/Shared Variables ---
// Engine & Scene References
let canvas = null;
let engine = null;
let scene = null;
let camera = null;
let playerLight = null;

// Game Content References
const mazeGrid = []; // Populated by environment.js
const agents = [];   // Populated by agents.js
const activeRabbits = []; // Populated by rabbits.js
const activeBullets = []; // Managed by shooting.js
// Maze Geometry (Floor/Ceiling might be needed globally?)
let floorMesh_BJS = null;
let ceilingMesh_BJS = null;
// Template meshes are now local to createMazeGeometry_BJS
// let wallMeshFull = null;
// let wallMeshShort = null;
// let doorMeshTemplate = null;
let gunGroup_BJS = null; // Gun parent node
let bulletMaterial_BJS = null; // Shared bullet material

// Game State
let playerHP = typeof PLAYER_MAX_HP !== 'undefined' ? PLAYER_MAX_HP : 100; // Use constant
let isPointerLocked = false;
let gameWon = false;
let gameOver = false;
let agentsRemaining = 0;
let mazeExitObject_BJS = null;
let mazeExitPosition = null;

// Player Weapon State
let currentAmmo = typeof GUN_CLIP_SIZE !== 'undefined' ? GUN_CLIP_SIZE : 12; // Use constant
let isReloading = false;
let reloadTimer = 0;
let canShoot = true;
let shootTimer = 0;

// Timers
let rabbitSpawnTimer = typeof RABBIT_SPAWN_INTERVAL !== 'undefined' ? RABBIT_SPAWN_INTERVAL : 15.0; // Use constant
let mapDisplayTimer = 0;
let menuDisplayTimer = 0;
let isMenuDisplayedForRabbit = false;
let shakeTimer = 0;

// Debugging Flags
let DEBUG_COLLISION = false;
let DEBUG_MOVEMENT = false;
let DEBUG_AGENT = true;
let DEBUG_MAP_VISIBLE = false;

// =============================================================================
// Main Initialization Function
// =============================================================================
async function initGame() {
    console.log(`--- INIT GAME: Starting initialization (v1.47g Refactored) ---`); // Update version
    canvas = document.getElementById("mazeCanvas");
    if (!canvas) { console.error("CRITICAL: Canvas element not found!"); return; }

    engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
    if (!engine) throw 'Engine should not be null.';
    engine.displayLoadingUI();

    // Create Scene (environment.js)
    scene = await createScene(engine);
    if (!scene) { console.error("CRITICAL: Scene creation failed!"); engine.hideLoadingUI(); return; }

    // Setup UI Elements (ui.js)
    console.log("INIT GAME: Setting up UI...");
    if (!setupHUD()) { console.error("CRITICAL: HUD setup failed."); engine.hideLoadingUI(); return; }

    // Generate Maze Data (environment.js)
    console.log("INIT GAME: Generating Maze Data...");
    initMazeGrid();
    const startGenCell = mazeGrid[1]?.[1] || mazeGrid[0]?.[0];
    if (!startGenCell) { console.error("CRITICAL: Cannot find valid start cell!"); engine.hideLoadingUI(); return; }
    generateMaze(startGenCell);
    addCrossConnections(CROSS_CONNECTION_CHANCE); // Use constant

    // Create 3D Maze Geometry (environment.js)
    console.log("INIT GAME: Creating Maze Geometry...");
    createMazeGeometry_BJS(); // This now creates templates locally

    // Set Player Start Position (environment.js)
    console.log("INIT GAME: Setting Player Start Position...");
    findLongestCorridorAndSetPlayerStart_BJS();

    // Create Game Entities (respective files)
    console.log("INIT GAME: Creating Game Entities...");
    createGun_BJS(scene, camera); // shooting.js
    createAgents_BJS(scene);     // agents.js
    for (let i = 0; i < INITIAL_RABBIT_SPAWN_COUNT; i++) { // Use constant
        spawnRabbit_BJS(scene); // rabbits.js
    }

    // Setup Event Listeners (player.js)
    console.log("INIT GAME: Setting up Event Listeners...");
    setupEventListeners();

    engine.hideLoadingUI();

    // Start the Render Loop
    console.log("INIT GAME: Starting Render Loop...");
    engine.runRenderLoop(() => {
        if (!scene || !scene.activeCamera) return;
        const delta = engine.getDeltaTime() / 1000.0;
        const time = performance.now() / 1000.0;

        // Update Timers
        if (menuDisplayTimer > 0) { menuDisplayTimer -= delta; if (menuDisplayTimer <= 0) { menuDisplayTimer = 0; isMenuDisplayedForRabbit = false; if (!isPointerLocked && !gameOver && !gameWon) { updateMenuForPause(); } } }
        if (mapDisplayTimer > 0) { mapDisplayTimer -= delta; if (mapDisplayTimer <= 0) { mapDisplayTimer = 0; DEBUG_MAP_VISIBLE = false; } }

        // Update Game Logic (only when playing)
        if (isPointerLocked && !gameOver && !gameWon) {
            playerPosition.copyFrom(camera.position);
            if (playerLight) { playerLight.position.copyFrom(camera.position); }

            handleShootingCooldown(delta); // shooting.js
            handleReloading(delta, time); // shooting.js
            updateBullets_BJS(delta);       // shooting.js
            updateAgents_BJS(delta, time);  // agents.js (Logic currently disabled inside stub)
            updateRabbits_BJS(delta, time);// rabbits.js
        }

        // Update UI (ui.js)
        updateHUD(time);
        drawDebugMap(time);

        // Render the scene
        try { scene.render(); } catch (e) {
            console.error("Render loop error:", e);
            engine.stopRenderLoop();
            triggerGameOver("Render Error"); // game_state.js
        }
    });

    // Initial Menu Setup (ui.js)
    if (!gameOver && !gameWon) {
        const initialTitle = `<span id="glitchTitle" style="font-size:36px; display: inline-block;">[ENTER BACKDOORS]</span>`;
        const initialInstructions = `<span id="staticInstructions" style="font-size: 14px; display: block; margin-top: 15px;">(W, A, S, D = Move, MOUSE = Look, SHIFT = Run, CLICK = Fire, R = Reload)<br/>(P = Collision Debug, M = Map Debug)<br/><br/>THEY KNOW YOU'RE HERE :: Collect the Rabbits :: Destroy Agents</span>`;
        setupInitialMenu(initialTitle, initialInstructions);
        startMenuEffects();
    }

    console.log("--- DEBUG TOGGLES --- P: Collision | M: Map | L: Movement Logs | K: Agent Logs ---");
    console.log(`Matrix Maze Initialized (Babylon.js v1.47g Refactored). Click screen to start.`);
    console.log("--- INIT GAME: Finished ---");
}

// =============================================================================
// Start the Initialization Process Directly
// =============================================================================
if (typeof createScene === 'function' &&
    typeof setupEventListeners === 'function' &&
    typeof initMazeGrid === 'function' &&
    typeof setupHUD === 'function' /* Check main functions */)
{
    initGame().catch(e => {
        console.error("Error during initialization:", e);
        engine?.hideLoadingUI();
        const instructionsContainer = document.getElementById('instructions');
        if (instructionsContainer) {
             instructionsContainer.innerHTML = `<span style="color: red; font-size: 16px;">INIT FAILED<br/>Check Console (F12)</span>`;
             document.getElementById('blocker').style.display = 'flex';
        } else { alert("Initialization Failed! Check Console (F12)"); }
    });
} else {
    console.error("Essential functions from prerequisite files were not found! Check script loading order and errors.");
    alert("Initialization Failed! Essential scripts missing. Check Console (F12)");
    const instructionsContainer = document.getElementById('instructions');
     if (instructionsContainer) {
             instructionsContainer.innerHTML = `<span style="color: red; font-size: 16px;">SCRIPT LOAD FAILED<br/>Check Console (F12)</span>`;
             document.getElementById('blocker').style.display = 'flex';
     }
}

// =============================================================================
// Placeholder functions (Stubs for files NOT YET CREATED/FILLED)
// =============================================================================
// These prevent "not defined" errors until the actual files are implemented.
if (typeof createAgents_BJS === 'undefined') { function createAgents_BJS(scene) { console.warn("createAgents_BJS stub called!"); agentsRemaining = STARTING_AGENT_COUNT || 2; updateHUD(); } }
if (typeof updateAgents_BJS === 'undefined') { function updateAgents_BJS(delta, time) { /* Agent logic disabled */ } }
if (typeof INITIAL_RABBIT_SPAWN_COUNT === 'undefined') { const INITIAL_RABBIT_SPAWN_COUNT = 2; }
if (typeof RABBIT_SPAWN_INTERVAL === 'undefined') { const RABBIT_SPAWN_INTERVAL = 15.0; }
if (typeof spawnRabbit_BJS === 'undefined') { function spawnRabbit_BJS(scene) { console.warn("spawnRabbit_BJS stub called!"); } }
if (typeof updateRabbits_BJS === 'undefined') { function updateRabbits_BJS(delta, time) { if(typeof rabbitSpawnTimer !== 'undefined') { rabbitSpawnTimer -= delta; if(rabbitSpawnTimer <= 0){ spawnRabbit_BJS(scene); rabbitSpawnTimer = RABBIT_SPAWN_INTERVAL; } } } }
if (typeof GUN_CLIP_SIZE === 'undefined') { const GUN_CLIP_SIZE = 12; }
if (typeof GUN_RELOAD_TIME === 'undefined') { const GUN_RELOAD_TIME = 1.5; }
if (typeof GUN_FIRE_RATE === 'undefined') { const GUN_FIRE_RATE = 0.15; }
if (typeof createGun_BJS === 'undefined') { function createGun_BJS(scene, camera) { console.warn("createGun_BJS stub called!"); } }
if (typeof fireGun === 'undefined') { function fireGun() { console.warn("fireGun stub called!"); } }
if (typeof startReload === 'undefined') { function startReload() { console.warn("startReload stub called!"); } }
if (typeof handleShootingCooldown === 'undefined') { function handleShootingCooldown(delta) {} }
if (typeof handleReloading === 'undefined') { function handleReloading(delta, time) {} }
if (typeof updateBullets_BJS === 'undefined') { function updateBullets_BJS(delta) {} }
if (typeof setupHUD === 'undefined') { function setupHUD() { console.warn("setupHUD stub called!"); return true; } }
if (typeof updateHUD === 'undefined') { function updateHUD(time) {} }
if (typeof drawDebugMap === 'undefined') { function drawDebugMap(time) {} }
if (typeof applyGlitchToElement === 'undefined') { function applyGlitchToElement(el, intensity, chars, text) {} }
if (typeof startMenuEffects === 'undefined') { function startMenuEffects() { console.warn("startMenuEffects stub called!"); } }
if (typeof stopMenuEffects === 'undefined') { function stopMenuEffects() {} }
if (typeof updateMenuForPause === 'undefined') { function updateMenuForPause() { console.warn("updateMenuForPause stub called!");} }
if (typeof updateMenuForRabbitPickup === 'undefined') { function updateMenuForRabbitPickup() { console.warn("updateMenuForRabbitPickup stub called!");} }
if (typeof setupInitialMenu === 'undefined') { function setupInitialMenu(title, instructions) { console.warn("setupInitialMenu stub called!"); const ge = document.getElementById('glitchTitle'); const se = document.getElementById('staticInstructions'); if(ge) ge.innerHTML = title; if(se) se.innerHTML = instructions; } }
if (typeof triggerGameOver === 'undefined') { function triggerGameOver(reason) { console.error("triggerGameOver stub called!", reason); gameOver = true; if(engine) engine.stopRenderLoop(); } }
if (typeof triggerGameWin === 'undefined') { function triggerGameWin() { console.error("triggerGameWin stub called!"); gameWon = true; if(engine) engine.stopRenderLoop(); } }
// Define fallback constants if constants.js failed to load
if (typeof PLAYER_MAX_HP === 'undefined') { const PLAYER_MAX_HP = 100; }
if (typeof PLAYER_EYE_HEIGHT === 'undefined') { const PLAYER_EYE_HEIGHT = 25.5; }
if (typeof PLAYER_SPEED_WALK === 'undefined') { const PLAYER_SPEED_WALK = 12.0; }
if (typeof PLAYER_SPEED_RUN === 'undefined') { const PLAYER_SPEED_RUN = 24.0; }
if (typeof AGENT_BODY_HEIGHT === 'undefined') { const AGENT_BODY_HEIGHT = 27; }


// end of file
```)**

```javascript
// =============================================================================
// js/shooting.js - Gun, Bullet Logic
// Version: 1.47g (Refactored)
// =============================================================================

// Relies on constants from constants.js
// Relies on globals from main.js: scene, camera, activeBullets, currentAmmo, canShoot, shootTimer, isReloading, reloadTimer, isPointerLocked, gameOver, gameWon, gunGroup_BJS, bulletMaterial_BJS
// Relies on functions: playSound (audio.js), updateHUD (ui.js), startReload (this file)

function createGun_BJS(scene, camera) {
    console.log("BJS [shooting.js]: Creating Gun...");
    if (!scene || !camera) { console.error("Scene or Camera missing for createGun_BJS"); return;}
    if (gunGroup_BJS) { gunGroup_BJS.dispose(false, true); } // Dispose previous if any
    gunGroup_BJS = new BABYLON.TransformNode("gunGroup", scene);
    gunGroup_BJS.parent = camera;
    gunGroup_BJS.position = new BABYLON.Vector3(GUN_RIGHT_OFFSET, GUN_DOWN_OFFSET, GUN_FORWARD_OFFSET); // Use constants
    const gunMaterial = new BABYLON.StandardMaterial("gunMat", scene);
    gunMaterial.diffuseColor = new BABYLON.Color3.FromHexString("#222222");
    gunMaterial.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
    const barrel = BABYLON.MeshBuilder.CreateCylinder("gunBarrel", { height: GUN_BARREL_LENGTH, diameter: GUN_BARREL_RADIUS * 2, tessellation: 12 }, scene); // Use constants
    barrel.material = gunMaterial; barrel.rotation.x = Math.PI / 2; barrel.position.z = GUN_BARREL_LENGTH / 2; barrel.parent = gunGroup_BJS;
    const handle = BABYLON.MeshBuilder.CreateBox("gunHandle", { width: GUN_HANDLE_WIDTH, height: GUN_HANDLE_HEIGHT, depth: GUN_HANDLE_DEPTH }, scene); // Use constants
    handle.material = gunMaterial; handle.position.y = -GUN_HANDLE_HEIGHT / 2 - GUN_BARREL_RADIUS * 0.5; handle.position.z = -GUN_BARREL_LENGTH * 0.2; handle.parent = gunGroup_BJS;
    console.log("BJS [shooting.js]: Gun created.");
}

function fireGun() {
    if (!isPointerLocked || !canShoot || isReloading || gameOver || gameWon) return;
    if (currentAmmo <= 0) { startReload(); return; }
    currentAmmo--; canShoot = false; shootTimer = GUN_FIRE_RATE;
    playSound('shoot'); // Assumes playSound is global

    if (!bulletMaterial_BJS) { // Create material once
         bulletMaterial_BJS = new BABYLON.StandardMaterial("bulletMat", scene);
         bulletMaterial_BJS.diffuseColor = new BABYLON.Color3(0.2, 1, 0.2);
         bulletMaterial_BJS.emissiveColor = new BABYLON.Color3(0.1, 0.6, 0.1);
         // bulletMaterial_BJS.disableLighting = true; // Optional: Make bullets ignore lighting
    }

    const bullet = BABYLON.MeshBuilder.CreateSphere("bullet" + Date.now(), { diameter: BULLET_SIZE, segments: 8 }, scene);
    bullet.material = bulletMaterial_BJS;
    bullet.checkCollisions = false; // Bullets themselves don't collide physically

    const cameraForward = camera.getForwardRay().direction;
    const offset = cameraForward.scale(GUN_FORWARD_OFFSET);
    bullet.position = camera.globalPosition.add(offset); // Start slightly ahead of camera
    const velocity = cameraForward.scale(BULLET_SPEED); // Use constant speed

    activeBullets.push({ mesh: bullet, velocity: velocity, life: BULLET_LIFESPAN, isAgentBullet: false, damage: 1 });
    updateHUD(); // Assumes updateHUD is global
}

function startReload() {
    if (isReloading || currentAmmo === GUN_CLIP_SIZE || gameOver || gameWon || !isPointerLocked) return;
    console.log("ACTION: Reloading..."); isReloading = true; reloadTimer = GUN_RELOAD_TIME; canShoot = false;
    playSound('reload'); // Assumes playSound is global
    updateHUD(); // Assumes updateHUD is global
}

function handleShootingCooldown(delta) {
    if (!canShoot) { shootTimer -= delta; if (shootTimer <= 0) { canShoot = true; } }
}

function handleReloading(delta, time) {
    if (isReloading) { reloadTimer -= delta; if (reloadTimer <= 0) { isReloading = false; currentAmmo = GUN_CLIP_SIZE; canShoot = true; console.log("ACTION: Reload Complete."); updateHUD(); } } // Assumes updateHUD is global
}

function updateBullets_BJS(delta) {
    // Requires globals: activeBullets
    for (let i = activeBullets.length - 1; i >= 0; i--) {
        const bulletData = activeBullets[i];
        const bulletMesh = bulletData.mesh;
        const velocity = bulletData.velocity;

        // Move bullet
        bulletMesh.position.addInPlace(velocity.scale(delta));

        // Update life
        bulletData.life -= delta;

        // Check for removal (collision check still TODO)
        if (bulletData.life <= 0) {
            bulletMesh.dispose();
            activeBullets.splice(i, 1);
            continue;
        }
        // TODO: Implement Collision Checks here
    }
}

// end of file