// =============================================================================
// js/main.js - Main Entry Point & Game Loop Orchestration
// Version: 1.47e (Refactored)
// =============================================================================

// --- Global/Shared Variables ---
// Engine & Scene References (Initialized here or in createScene)
let canvas = null;
let engine = null;
let scene = null;
let camera = null; // Main player camera (created in environment.js)
let playerLight = null; // Light attached to the player (created in environment.js)

// Game Content References (Populated by other modules)
const mazeGrid = [];
const agents = [];
const activeRabbits = [];
const activeBullets = [];

// Game State (Managed here for now)
let playerHP = 100; // Default value, PLAYER_MAX_HP will be in player.js
let isPointerLocked = false;
let gameWon = false;
let gameOver = false;
let agentsRemaining = 0;
let mazeExitObject_BJS = null;
let mazeExitPosition = null;

// Player Weapon State (Defaults, constants will be in shooting.js)
let currentAmmo = 12;
let isReloading = false;
let reloadTimer = 0;
let canShoot = true;
let shootTimer = 0;

// Timers (Defaults, constants will be elsewhere)
let rabbitSpawnTimer = 15.0;
let mapDisplayTimer = 0;
let menuDisplayTimer = 0;
let isMenuDisplayedForRabbit = false;
let shakeTimer = 0;

// Debugging Flags (Defaults, constants could be elsewhere)
let DEBUG_COLLISION = false;
let DEBUG_MOVEMENT = false;
let DEBUG_AGENT = true;
let DEBUG_MAP_VISIBLE = false;

// =============================================================================
// Main Initialization Function
// =============================================================================
async function initGame() {
    console.log(`--- INIT GAME: Starting initialization (v1.47e Refactored) ---`);
    canvas = document.getElementById("mazeCanvas");
    if (!canvas) { console.error("CRITICAL: Canvas element not found!"); return; }

    engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
    if (!engine) throw 'Engine should not be null.';
    engine.displayLoadingUI();

    // Create Scene, Camera, Lights (from environment.js)
    // This function should assign to the global 'scene', 'camera', 'playerLight' variables
    scene = await createScene(); // createScene defined in environment.js
    if (!scene) { console.error("CRITICAL: Scene creation failed!"); engine.hideLoadingUI(); return; }

    // Setup UI Elements (from ui.js)
    // Requires ui.js to be loaded
    console.log("INIT GAME: Setting up UI...");
    if (!setupHUD()) { // setupHUD defined in ui.js (placeholder for now)
        console.error("CRITICAL: HUD setup failed."); engine.hideLoadingUI(); return;
    }

    // Generate Maze Data (from maze.js)
    // Requires maze.js to be loaded
    console.log("INIT GAME: Generating Maze Data...");
    initMazeGrid(); // Defined in maze.js
    const startGenCell = mazeGrid[1]?.[1] || mazeGrid[0]?.[0];
    if (!startGenCell) { console.error("CRITICAL: Cannot find valid start cell!"); engine.hideLoadingUI(); return; }
    generateMaze(startGenCell); // Defined in maze.js
    addCrossConnections(CROSS_CONNECTION_CHANCE); // Defined in maze.js (Constant defined here for now)

    // Create 3D Maze Geometry (from maze.js)
    console.log("INIT GAME: Creating Maze Geometry...");
    createMazeGeometry_BJS(); // Defined in maze.js

    // Set Player Start Position (from maze.js)
    console.log("INIT GAME: Setting Player Start Position...");
    findLongestCorridorAndSetPlayerStart_BJS(); // Defined in maze.js

    // Create Game Entities (Placeholders, requires respective files)
    console.log("INIT GAME: Creating Game Entities...");
    createGun_BJS(); // Defined in shooting.js (placeholder)
    createAgents_BJS(); // Defined in agents.js (placeholder)
    for (let i = 0; i < INITIAL_RABBIT_SPAWN_COUNT; i++) { // Constant from rabbits.js (placeholder)
        spawnRabbit_BJS(); // Defined in rabbits.js (placeholder)
    }

    // Setup Event Listeners (from player.js)
    // Requires player.js to be loaded
    console.log("INIT GAME: Setting up Event Listeners...");
    setupEventListeners(); // Defined in player.js

    // Hide loading screen now that setup is done
    engine.hideLoadingUI();

    // Start the Render Loop
    console.log("INIT GAME: Starting Render Loop...");
    engine.runRenderLoop(() => {
        if (!scene || !scene.activeCamera) return;
        const delta = engine.getDeltaTime() / 1000.0;
        const time = performance.now() / 1000.0;

        // --- Update Timers ---
        if (menuDisplayTimer > 0) { menuDisplayTimer -= delta; if (menuDisplayTimer <= 0) { menuDisplayTimer = 0; isMenuDisplayedForRabbit = false; if (!isPointerLocked && !gameOver && !gameWon) { updateMenuForPause(); } } } // Requires ui.js
        if (mapDisplayTimer > 0) { mapDisplayTimer -= delta; if (mapDisplayTimer <= 0) { mapDisplayTimer = 0; DEBUG_MAP_VISIBLE = false; } }

        // --- Update Game Logic (only when playing) ---
        if (isPointerLocked && !gameOver && !gameWon) {
            playerPosition.copyFrom(camera.position);
            if (playerLight) { playerLight.position.copyFrom(camera.position); }

            // Updates managed by dedicated files
            handleShootingCooldown(delta); // Requires shooting.js
            handleReloading(delta, time); // Requires shooting.js
            updateBullets_BJS(delta); // Requires shooting.js
            updateAgents_BJS(delta, time); // Requires agents.js
            updateRabbits_BJS(delta, time); // Requires rabbits.js

            // Check win condition (Placeholder)
            // if (mazeExitPosition && BABYLON.Vector3.DistanceSquared(playerPosition, mazeExitPosition) < ...) { triggerGameWin(); } // Requires game_state.js
        }

        // Update UI (Requires ui.js)
        updateHUD(time);
        drawDebugMap(time);

        // Render the scene
        try { scene.render(); } catch (e) {
            console.error("Render loop error:", e);
            engine.stopRenderLoop();
            // triggerGameOver("Render Error"); // Requires game_state.js
        }
    });

    // --- Initial Menu Setup --- (Requires ui.js)
    if (!gameOver && !gameWon) {
        const initialTitle = `<span id="glitchTitle" style="font-size:36px; display: inline-block;">[ENTER BACKDOORS]</span>`;
        const initialInstructions = `<span id="staticInstructions" style="font-size: 14px; display: block; margin-top: 15px;">(W, A, S, D = Move, MOUSE = Look, SHIFT = Run, CLICK = Fire, R = Reload)<br/>(P = Collision Debug, M = Map Debug)<br/><br/>THEY KNOW YOU'RE HERE :: Collect the Rabbits :: Destroy Agents</span>`;
        setupInitialMenu(initialTitle, initialInstructions); // Call helper from ui.js
        startMenuEffects(); // Requires ui.js
    }

    console.log("--- DEBUG TOGGLES --- P: Collision | M: Map | L: Movement Logs | K: Agent Logs ---");
    console.log(`Matrix Maze Initialized (Babylon.js v1.47e Refactored). Click screen to start.`);
    console.log("--- INIT GAME: Finished ---");
}

// =============================================================================
// Start the Initialization Process on DOM Load
// =============================================================================
window.addEventListener('DOMContentLoaded', () => {
    // Make sure all required script files are loaded before initializing
    // This simple check assumes they are loaded in order via HTML script tags
    // More robust solutions exist (e.g., module loaders, Promises) if needed
    if (typeof createScene === 'function' && typeof setupEventListeners === 'function') {
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
        console.error("Required script files (scene.js, player.js) might not be loaded correctly!");
        alert("Initialization Failed! Scripts missing. Check Console (F12)");
    }
});


// =============================================================================
// Placeholder functions (Stubs for functions defined in other files)
// =============================================================================
// These prevent "not defined" errors until the actual files are created/loaded.

// From scene.js (Actually defined there now)
// async function createScene() { console.error("createScene stub called!"); return null; }

// From player.js (Actually defined there now)
// function setupEventListeners() { console.error("setupEventListeners stub called!"); }
// function damagePlayer(amount, source) { console.error("damagePlayer stub called!"); }

// From maze.js (Need to create maze.js)
const MAZE_GRID_SCALE = 11; // Temp default
const CROSS_CONNECTION_CHANCE = 0.25; // Temp default
function initMazeGrid() { console.warn("initMazeGrid stub called!"); }
function generateMaze(startCell) { console.warn("generateMaze stub called!"); }
function addCrossConnections(chance) { console.warn("addCrossConnections stub called!"); }
function createMazeGeometry_BJS() { console.warn("createMazeGeometry_BJS stub called!"); }
function findLongestCorridorAndSetPlayerStart_BJS() { console.warn("findLongestCorridorAndSetPlayerStart_BJS stub called!"); }

// From agents.js (Need to create agents.js)
const STARTING_AGENT_COUNT = 2; // Temp default
function createAgents_BJS() { console.warn("createAgents_BJS stub called!"); agentsRemaining = STARTING_AGENT_COUNT; /* Update global */ }
function updateAgents_BJS(delta, time) { /* Agent logic disabled */ }

// From rabbits.js (Need to create rabbits.js)
const INITIAL_RABBIT_SPAWN_COUNT = 2; // Temp default
const RABBIT_SPAWN_INTERVAL = 15.0; // Temp default
function spawnRabbit_BJS() { console.warn("spawnRabbit_BJS stub called!"); }
function updateRabbits_BJS(delta, time) { rabbitSpawnTimer -= delta; if(rabbitSpawnTimer <= 0){ spawnRabbit_BJS(); rabbitSpawnTimer = RABBIT_SPAWN_INTERVAL; } }

// From shooting.js (Need to create shooting.js)
const GUN_CLIP_SIZE = 12; // Temp default
const GUN_RELOAD_TIME = 1.5; // Temp default
const GUN_FIRE_RATE = 0.15; // Temp default
function createGun_BJS() { console.warn("createGun_BJS stub called!"); }
function fireGun() { console.warn("fireGun stub called!"); }
function startReload() { console.warn("startReload stub called!"); }
function handleShootingCooldown(delta) { /* Placeholder */ }
function handleReloading(delta, time) { /* Placeholder */ }
function updateBullets_BJS(delta) { /* Placeholder */ }

// From ui.js (Need to create ui.js)
function setupHUD() { console.warn("setupHUD stub called!"); return true; }
function updateHUD(time) { /* Placeholder */ }
function drawDebugMap(time) { /* Placeholder */ }
function applyGlitchToElement(el, intensity, chars, text) { /* Placeholder */ }
function startMenuEffects() { console.warn("startMenuEffects stub called!"); }
function stopMenuEffects() { /* Placeholder */ }
function updateMenuForPause() { console.warn("updateMenuForPause stub called!");}
function updateMenuForRabbitPickup() { console.warn("updateMenuForRabbitPickup stub called!");}
function setupInitialMenu(title, instructions) { console.warn("setupInitialMenu stub called!"); } // New helper assumed for ui.js

// From game_state.js (Need to create game_state.js)
function triggerGameOver(reason) { console.error("triggerGameOver stub called!"); gameOver = true; if(engine) engine.stopRenderLoop(); }
function triggerGameWin() { console.error("triggerGameWin stub called!"); gameWon = true; if(engine) engine.stopRenderLoop(); }

// Constants needed by stubs
const PLAYER_MAX_HP = 100;