// =============================================================================
// js/scene.js - Scene, Camera, Lighting, Fog Setup
// Version: 1.47f (Refactored - Pass Dependencies)
// =============================================================================

// This file defines the createScene function.
// It relies on constants defined in constants.js and globals from main.js

async function createScene(engine) { // Accepts engine instance
    console.log("BJS [scene.js]: Creating Scene...");
    if (!engine) { console.error("Engine not provided to createScene!"); return null; }

    // Assign to global scene variable (from main.js)
    scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0, 0, 0, 1); // Black background

    // --- Camera ---
    // Assign to global camera variable (from main.js)
    camera = new BABYLON.UniversalCamera("playerCamera", new BABYLON.Vector3(0, PLAYER_EYE_HEIGHT, 0), scene);
    camera.speed = PLAYER_SPEED_WALK; // Default speed (Use constant)
    camera.inertia = 0.0; // Raw mouse input
    camera.angularSensibility = BJS_ANGULAR_SENSITIVITY; // Use calculated sensitivity (Use constant)
    camera.minZ = 0.5;
    camera.maxZ = Math.max(MAZE_WIDTH_UNITS, MAZE_HEIGHT_UNITS) * 1.5; // Use constants
    camera.upperBetaLimit = Math.PI / 2.1;
    camera.lowerBetaLimit = -Math.PI / 2.1;

    // *** Explicitly define WASD and Arrow Keys for movement ***
    camera.keysUp = PLAYER_KEYS_UP;       // Use constant from constants.js
    camera.keysDown = PLAYER_KEYS_DOWN;   // Use constant from constants.js
    camera.keysLeft = PLAYER_KEYS_LEFT;   // Use constant from constants.js
    camera.keysRight = PLAYER_KEYS_RIGHT; // Use constant from constants.js
    // Note: Babylon's UniversalCamera defaults often include these,
    // but setting them explicitly ensures they are correct.

    // Controls are attached in player.js based on pointer lock state

    // --- Collision & Gravity ---
    scene.collisionsEnabled = true;
    camera.checkCollisions = true;
    camera.ellipsoid = new BABYLON.Vector3(PLAYER_RADIUS, PLAYER_COLLISION_HEIGHT / 2, PLAYER_RADIUS); // Use constants
    camera.ellipsoidOffset = new BABYLON.Vector3(0, PLAYER_COLLISION_HEIGHT / 2, 0); // Use constant
    scene.gravity = new BABYLON.Vector3(0, -9.81 * 2.5, 0);
    camera.applyGravity = true;

    // --- Lighting ---
    const ambientLight = new BABYLON.HemisphericLight("ambientLight", new BABYLON.Vector3(0, 1, 0), scene);
    ambientLight.intensity = 0.6;
    ambientLight.groundColor = new BABYLON.Color3(0.2, 0.2, 0.2);

    // Assign to global playerLight variable (from main.js)
    playerLight = new BABYLON.PointLight("playerLight", new BABYLON.Vector3(0, 1, 0), scene);
    playerLight.intensity = 0.8;
    playerLight.range = 8 * CELL_SIZE * MAZE_GRID_SCALE; // Use constants
    playerLight.diffuse = new BABYLON.Color3(0.8, 0.8, 0.7);

    // --- Fog ---
    scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
    scene.fogColor = new BABYLON.Color3(0, 0.01, 0);
    scene.fogStart = CELL_SIZE * MAZE_GRID_SCALE * 1.5; // Use constants
    scene.fogEnd = CELL_SIZE * MAZE_GRID_SCALE * 8; // Use constants

    console.log("BJS [scene.js]: Scene, Camera, Lights created.");
    return scene; // Return the created scene object
}

// end of file