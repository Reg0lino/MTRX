// =============================================================================
// js/rabbits.js - Rabbit Spawning and Logic
// Version: 1.47f (Refactored - Stub)
// =============================================================================

// Relies on constants from constants.js
// Relies on globals from main.js: scene, activeRabbits, rabbitSpawnTimer
// Relies on functions: findRandomReachableCell, gridToWorld (environment.js)

function spawnRabbit_BJS(scene) { // Accept scene
    // Requires globals: activeRabbits, MAX_RABBITS
    // Requires constants: RABBIT_*
    // Requires functions: findRandomReachableCell, gridToWorld
    if (!scene) { console.error("Scene missing in spawnRabbit_BJS"); return; }
    if(activeRabbits.length >= MAX_RABBITS) return; // Use constant
    const spawnGridPos = findRandomReachableCell();
    if (!spawnGridPos) { console.error("spawnRabbit: Could not find valid spawn cell!"); return; }
    const spawnWorldPos = gridToWorld(spawnGridPos.x, spawnGridPos.y);
    const rabbitRoot = new BABYLON.TransformNode(`rabbit_${activeRabbits.length}_root`, scene);
    rabbitRoot.position = new BABYLON.Vector3(spawnWorldPos.x, RABBIT_GROUND_LEVEL, spawnWorldPos.z);
    rabbitRoot.scaling.setAll(RABBIT_INSTANCE_SCALE);
    const rabbitMaterial_BJS = new BABYLON.StandardMaterial("rabbitMat" + activeRabbits.length, scene);
    rabbitMaterial_BJS.diffuseColor = RABBIT_COLOR_WHITE.clone(); // Use constant
    rabbitMaterial_BJS.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    const body = BABYLON.MeshBuilder.CreateCylinder(`rabbit_${activeRabbits.length}_body`, { diameter: RABBIT_BODY_RADIUS * 2, height: RABBIT_BODY_HEIGHT }, scene); // Use constants
    body.material = rabbitMaterial_BJS; body.position.y = RABBIT_BODY_HEIGHT / 2; body.parent = rabbitRoot;
    const head = BABYLON.MeshBuilder.CreateSphere(`rabbit_${activeRabbits.length}_head`, { diameter: RABBIT_HEAD_RADIUS * 2 }, scene); // Use constants
    head.material = rabbitMaterial_BJS; head.position.y = RABBIT_BODY_HEIGHT + RABBIT_HEAD_RADIUS * 0.9; head.parent = rabbitRoot;
    const rabbitData = { id: rabbitRoot.name, rootNode: rabbitRoot, bodyMesh: body, headMesh: head, material: rabbitMaterial_BJS, pulseFreq: Math.random() * 1.5 + 0.5 };
    activeRabbits.push(rabbitData); // Add to global array
}

function updateRabbits_BJS(delta, time) {
    // Requires globals: rabbitSpawnTimer, scene, activeRabbits
    // Requires constants: RABBIT_SPAWN_INTERVAL
    // Requires functions: spawnRabbit_BJS (this file)
    rabbitSpawnTimer -= delta;
    if(rabbitSpawnTimer <= 0){
        spawnRabbit_BJS(scene); // Pass scene
        rabbitSpawnTimer = RABBIT_SPAWN_INTERVAL; // Use constant
    }
    // TODO: Implement rabbit update logic (visuals, pickup check)
    // for(let i = activeRabbits.length - 1; i >= 0; i--){ ... }
}

/* Three.js Reference omitted */