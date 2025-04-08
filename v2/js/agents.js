// =============================================================================
// js/agents.js - Agent Creation, AI Logic
// Version: 1.47g (Refactored - Basic Definitions)
// =============================================================================

// Relies on constants from constants.js
// Relies on globals from main.js: agents, scene, camera, agentsRemaining
// Relies on functions: worldToGrid, gridToWorld (environment.js), findRandomReachableCell (environment.js), updateHUD (ui.js)

console.log("Loading agents.js..."); // Log loading

function createAgents_BJS(scene) { // Accept scene
    // Requires globals: agents, agentsRemaining, camera
    // Requires constants: STARTING_AGENT_COUNT, AGENT_*, PLAYER_RADIUS
    // Requires functions: worldToGrid, gridToWorld, findRandomReachableCell, updateHUD
    console.log(`BJS [agents.js]: Creating ${STARTING_AGENT_COUNT} agents...`);
    if (!scene) { console.error("Scene not provided to createAgents_BJS!"); return; }
    if (!camera) { console.error("Camera not available for createAgents_BJS!"); return; } // Need camera for start pos check

    const agentBodyMaterial = new BABYLON.StandardMaterial("agentBodyMat", scene);
    agentBodyMaterial.diffuseColor = new BABYLON.Color3.FromHexString("#111111");
    agentBodyMaterial.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    const agentHeadMaterial = new BABYLON.StandardMaterial("agentHeadMat", scene);
    agentHeadMaterial.diffuseColor = new BABYLON.Color3.FromHexString("#BC8F8F");
    agentHeadMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);

    const pStartCell = worldToGrid(camera.position.x, camera.position.z);

    for(let i = 0; i < STARTING_AGENT_COUNT; i++) {
        let spawnGridPos = null; let attempts = 0; const maxAttempts = 50;
        while (!spawnGridPos && attempts < maxAttempts) { const potentialCell = findRandomReachableCell(); if (potentialCell) { const distSq = (potentialCell.x - pStartCell.x)**2 + (potentialCell.y - pStartCell.y)**2; const minDistSq = 9; if (!(potentialCell.x === pStartCell.x && potentialCell.y === pStartCell.y) && distSq > minDistSq) { spawnGridPos = potentialCell; } } attempts++; }
        if (!spawnGridPos) { console.warn(`Agent ${i} random placement failed, using fallback.`); spawnGridPos = findRandomReachableCell() || {x: MAZE_WIDTH_CELLS - 2, y: MAZE_HEIGHT_CELLS - 2}; }
        const startWorld = gridToWorld(spawnGridPos.x, spawnGridPos.y);
        const agentRoot = new BABYLON.TransformNode(`agent_${i}_root`, scene); agentRoot.position = new BABYLON.Vector3(startWorld.x, 0, startWorld.z); agentRoot.rotationQuaternion = new BABYLON.Quaternion();
        const body = BABYLON.MeshBuilder.CreateBox(`agent_${i}_body`, { width: AGENT_BODY_WIDTH, height: AGENT_BODY_HEIGHT, depth: AGENT_BODY_WIDTH * AGENT_BODY_DEPTH_FACTOR }, scene); if (agentBodyMaterial) body.material = agentBodyMaterial; body.position.y = AGENT_BODY_HEIGHT / 2; body.parent = agentRoot;
        const head = BABYLON.MeshBuilder.CreateBox(`agent_${i}_head`, { size: AGENT_HEAD_SIZE }, scene); if (agentHeadMaterial) head.material = agentHeadMaterial; head.position.y = AGENT_BODY_HEIGHT + AGENT_HEAD_SIZE / 2; head.parent = agentRoot;
        const agentData = { id: `Agent ${i}`, hp: AGENT_HP, rootNode: agentRoot, bodyMesh: body, headMesh: head, gridX: spawnGridPos.x, gridY: spawnGridPos.y, state: 'patrolling', hitTimer: 0, pathToTarget: [], currentPathIndex: -1, currentWaypoint: null, targetGridPos: {x: spawnGridPos.x, y: spawnGridPos.y}, timeSinceLastMove: 0, canSeePlayer: false, timeSincePlayerSeen: 0, lastKnownPlayerPos: new BABYLON.Vector3(), shootCooldownTimer: 0, meleeCooldownTimer: 0, losCheckTimer: Math.random() * AGENT_LOS_CHECK_INTERVAL, searchTimer: 0, targetCellRecalcTimer: 0, meleeBurstCount: 0, meleeBurstIntervalTimer: 0, stuckLogTimer: 0, currentTargetRotation: agentRoot.rotationQuaternion.clone() };
        agents.push(agentData); // Add to global agents array
        console.log(`   Agent ${i} spawned at grid (${spawnGridPos.x}, ${spawnGridPos.y})`);
    }
    agentsRemaining = agents.length; // Set global count
    if (typeof updateHUD === "function") updateHUD(); // Update UI if possible
    console.log("BJS [agents.js]: Agent creation finished.");
}

function updateAgents_BJS(delta, time) {
    // Requires globals: agents, scene, tempVec3
    // Requires constants: AGENT_*
    // Requires functions: generateNewPatrolPath_BJS (this file)

    // *** Agent pathfinding and movement temporarily disabled to avoid A* errors ***
     if (!agents.length || !scene) return;
     agents.forEach(agent => {
         if (!agent || agent.hp <= 0 || !agent.rootNode) return;
         // Future logic will go here
     });
}

// Stubs for path generation helpers (A* itself is in environment.js)
function generateNewPatrolPath_BJS(agent) {
     console.warn("generateNewPatrolPath_BJS called (agents.js) - Currently disabled");
     // Requires functions: worldToGrid, findRandomReachableCell, generatePathToTarget_BJS
     return false;
 }
function generatePathToTarget_BJS(agent, targetGridX, targetGridY) {
     console.warn("generatePathToTarget_BJS called (agents.js) - Currently disabled");
    // Requires functions: findPathAStar, gridPathToWorldPath
     return false;
 }

// end of file