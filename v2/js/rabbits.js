// =============================================================================
// js/rabbits.js - Rabbit Spawning and Logic
// Version: 1.47q (Uses Scaled Constants)
// =============================================================================

// Relies on constants from constants.js (v1.47q)
// Relies on globals from main.js: scene, activeRabbits, rabbitSpawnTimer
// Relies on functions: findRandomReachableCell, gridToWorld (environment.js)

console.log("Loading rabbits.js (v1.47q)...");

function spawnRabbit_BJS(scene) {
    if (!scene) { console.error("Scene missing in spawnRabbit_BJS"); return; }
    if (typeof findRandomReachableCell !== 'function' || typeof gridToWorld !== 'function'){ console.error("Dependency functions missing for spawnRabbit_BJS"); return; }
    if (activeRabbits.length >= MAX_RABBITS) return; // Use constant

    const spawnGridPos = findRandomReachableCell();
    if (!spawnGridPos) { console.error("spawnRabbit: Could not find valid spawn cell!"); return; }
    const spawnWorldPos = gridToWorld(spawnGridPos.x, spawnGridPos.y);

    // Create Root Node
    const rabbitRoot = new BABYLON.TransformNode(`rabbit_${activeRabbits.length}_root`, scene);
    rabbitRoot.position = new BABYLON.Vector3(spawnWorldPos.x, RABBIT_GROUND_LEVEL, spawnWorldPos.z); // Use constant
    rabbitRoot.scaling.setAll(RABBIT_INSTANCE_SCALE); // Use new smaller constant scale

    // Material
    const rabbitMaterial_BJS = new BABYLON.StandardMaterial("rabbitMat" + activeRabbits.length, scene);
    rabbitMaterial_BJS.diffuseColor = RABBIT_COLOR_WHITE.clone(); // Use constant
    rabbitMaterial_BJS.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);

    // Geometry (Using small base constants)
    const body = BABYLON.MeshBuilder.CreateCylinder(`rabbit_${activeRabbits.length}_body`, { diameter: RABBIT_BODY_RADIUS * 2, height: RABBIT_BODY_HEIGHT }, scene);
    body.material = rabbitMaterial_BJS; body.position.y = RABBIT_BODY_HEIGHT / 2; body.parent = rabbitRoot; // Parent to root

    const head = BABYLON.MeshBuilder.CreateSphere(`rabbit_${activeRabbits.length}_head`, { diameter: RABBIT_HEAD_RADIUS * 2 }, scene);
    head.material = rabbitMaterial_BJS; head.position.y = RABBIT_BODY_HEIGHT + RABBIT_HEAD_RADIUS * 0.9; head.parent = rabbitRoot; // Parent to root

    // --- TODO: Add ears, nose, etc. based on Three.js logic if needed ---

    // Store data
    const rabbitData = {
        id: rabbitRoot.name,
        rootNode: rabbitRoot,
        bodyMesh: body,
        headMesh: head,
        material: rabbitMaterial_BJS,
        pulseFreq: Math.random() * 1.5 + 0.5 // Keep pulse effect logic separate
        // Add other state vars needed from Three.js version here (jump velocity etc.)
    };
    activeRabbits.push(rabbitData);
    // console.log(`   Rabbit spawned at grid (${spawnGridPos.x}, ${spawnGridPos.y}) with scale ${RABBIT_INSTANCE_SCALE}`);
}

function updateRabbits_BJS(delta, time) {
    if (typeof spawnRabbit_BJS !== 'function') return;

    // Spawn new rabbits periodically
    rabbitSpawnTimer -= delta;
    if(rabbitSpawnTimer <= 0){
        spawnRabbit_BJS(scene); // Pass scene
        rabbitSpawnTimer = RABBIT_SPAWN_INTERVAL; // Use constant
    }

    // Update existing rabbits
    for (let i = activeRabbits.length - 1; i >= 0; i--) {
         const rabbitData = activeRabbits[i];
         if (!rabbitData || !rabbitData.rootNode) continue;

         // --- TODO: Implement Visual Updates (Pulse, Jump, Shimmer) ---
         // Example Pulse (Apply scaling based on freq/time)
         // const pulseScale = 1.0 + Math.sin(time * rabbitData.pulseFreq * Math.PI * 2) * 0.03; // Small pulse amount
         // rabbitData.bodyMesh.scaling.y = pulseScale; // Example: pulse body height slightly
         // rabbitData.headMesh.scaling.setAll(pulseScale); // Example: pulse head uniformly

         // --- TODO: Pickup Check ---
         // Calculate distance between playerPosition and rabbitData.rootNode.position
         // Use RABBIT_PICKUP_DISTANCE_FACTOR relative to scaled size if needed
         // const pickupDistSq = ...
         // if (playerPosition.subtract(rabbitData.rootNode.position).lengthSquared() < pickupDistSq) {
             // Trigger pickup logic (remove rabbit, reveal map, show menu)
             // console.log(`Rabbit ${rabbitData.id} picked up!`);
             // rabbitData.rootNode.dispose(true, true); // Dispose root and children
             // activeRabbits.splice(i, 1);
             // mapDisplayTimer = RABBIT_MAP_REVEAL_DURATION;
             // menuDisplayTimer = RABBIT_PICKUP_MENU_DURATION;
             // isMenuDisplayedForRabbit = true;
             // if (isPointerLocked) engine.exitPointerlock(); else updateMenuForRabbitPickup();
             // playSound('rabbit_pickup');
         // }
     }
}

// end of file