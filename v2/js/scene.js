// =============================================================================
// js/scene.js - Scene, Camera, Lighting, Fog Setup
// Version: 1.47e (Refactored)
// =============================================================================

// Note: Constants required by this file (like PLAYER_EYE_HEIGHT, speeds, maze dimensions, sensitivity)
// are assumed to be declared globally in main.js or loaded before this script.

// =============================================================================
// Scene Creation Function
// =============================================================================
async function createScene() {
    // Requires global: engine
    // Assigns to global: scene, camera, playerLight
    console.log("BJS [scene.js]: Creating Scene...");
    if (!engine) { console.error("Engine not initialized before createScene!"); return null; }

    scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0, 0, 0, 1); // Black background

    // --- Camera ---
    // Use global camera variable declared in main.js
    camera = new BABYLON.UniversalCamera("playerCamera", new BABYLON.Vector3(0, PLAYER_EYE_HEIGHT, 0), scene);
    camera.speed = PLAYER_SPEED_WALK; // Default speed
    camera.inertia = 0.0; // Raw mouse input
    camera.angularSensibility = BJS_ANGULAR_SENSITIVITY; // Use calculated sensitivity from main.js constants
    camera.minZ = 0.5;
    camera.maxZ = Math.max(MAZE_WIDTH_UNITS, MAZE_HEIGHT_UNITS) * 1.5; // Use constants from main.js
    camera.upperBetaLimit = Math.PI / 2.1;
    camera.lowerBetaLimit = -Math.PI / 2.1;
    // Controls are NOT attached here; attached in player.js upon pointer lock

    // --- Collision & Gravity ---
    scene.collisionsEnabled = true;
    camera.checkCollisions = true;
    camera.ellipsoid = new BABYLON.Vector3(PLAYER_RADIUS, PLAYER_COLLISION_HEIGHT / 2, PLAYER_RADIUS);
    camera.ellipsoidOffset = new BABYLON.Vector3(0, PLAYER_COLLISION_HEIGHT / 2, 0);
    scene.gravity = new BABYLON.Vector3(0, -9.81 * 2.5, 0);
    camera.applyGravity = true;

    // --- Lighting ---
    const ambientLight = new BABYLON.HemisphericLight("ambientLight", new BABYLON.Vector3(0, 1, 0), scene);
    ambientLight.intensity = 0.6;
    ambientLight.groundColor = new BABYLON.Color3(0.2, 0.2, 0.2);

    // Assign to global playerLight variable declared in main.js
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
    return scene; // Return the created scene
}

/*
// =============================================================================
// == Three.js Reference (Scene Setup) ==
// =============================================================================
// const scene = new THREE.Scene();
// const canvas = document.getElementById('mazeCanvas');
// const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
// renderer.setSize(window.innerWidth, window.innerHeight);
// renderer.setPixelRatio(window.devicePixelRatio);
// renderer.shadowMap.enabled = true;
// const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// scene.background = new THREE.Color(0x000000);
//
// // Lighting
// const ambientLight = new THREE.AmbientLight(0xaaaaaa, 0.5);
// scene.add(ambientLight);
// const playerLight = new THREE.PointLight(0xffffff, 0.6, 60);
// playerLight.castShadow = true;
// scene.add(playerLight);
//
// // Fog (Not present in Three.js version, added in Babylon)
*/