// =============================================================================
// js/agents.js - Agent Creation, AI Logic, Pathfinding Helpers
// Version: 1.47f (Refactored - Stub)
// =============================================================================

// Relies on constants from constants.js
// Relies on globals from main.js: agents, scene, camera, agentsRemaining
// Relies on functions: worldToGrid, gridToWorld (environment.js), findPathAStar, gridPathToWorldPath, findRandomReachableCell (environment.js), updateHUD (ui.js)

function createAgents_BJS(scene) { // Accept scene
    // Requires globals: agents, agentsRemaining, camera
    // Requires constants: STARTING_AGENT_COUNT, AGENT_*, PLAYER_RADIUS
    // Requires functions: worldToGrid, gridToWorld, findRandomReachableCell, updateHUD
    console.log(`BJS [agents.js]: Creating ${STARTING_AGENT_COUNT} agents...`);
    if (!scene) { console.error("Scene not provided to createAgents_BJS!"); return; }

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
    updateHUD(); // Update UI
    console.log("BJS [agents.js]: Agent creation finished.");
}

function updateAgents_BJS(delta, time) {
    // Requires globals: agents, scene, tempVec3
    // Requires constants: AGENT_*
    // Requires functions: generateNewPatrolPath_BJS (this file)
    if (!agents.length || !scene) return;
    agents.forEach(agent => {
        if (!agent || agent.hp <= 0 || !agent.rootNode) return;

        // *** Agent pathfinding and movement temporarily disabled ***
        // const agentPos = agent.rootNode.position;
        // agent.stuckLogTimer -= delta;
        // const currentState = agent.state; let nextState = currentState;
        // let needsPathUpdate = false;
        // if (agent.state === 'patrolling' && (!agent.pathToTarget || agent.pathToTarget.length === 0 || agent.currentPathIndex === -1)) {
        //     needsPathUpdate = true;
        // }
        // if (needsPathUpdate) {
        //     // generateNewPatrolPath_BJS(agent); // <--- THIS CALL IS DISABLED
        //     agent.timeSinceLastMove = 0;
        // }
        // let isMoving = false; const agentSpeed = AGENT_SPEED_PATROL;
        // if (agent.currentWaypoint) { ... movement logic ... }
        // else { ... }
        // if (!isMoving && agent.state === 'patrolling' && agent.timeSinceLastMove > AGENT_STUCK_TIMEOUT) { ... stuck logic ... }
    });
}

function generateNewPatrolPath_BJS(agent) {
    // Requires globals: mazeGrid, agent
    // Requires functions: worldToGrid, findRandomReachableCell, generatePathToTarget_BJS
    if (!agent || !agent.rootNode) return false;
    const currentGridPos = worldToGrid(agent.rootNode.position.x, agent.rootNode.position.z);
    agent.gridX = currentGridPos.x; agent.gridY = currentGridPos.y;
    const startCell = mazeGrid[agent.gridY]?.[agent.gridX];
    if (!startCell || !startCell.isPath) { return false; }
    let targetCell = null; let attempts = 0;
    do { targetCell = findRandomReachableCell(); attempts++; }
    while (targetCell && targetCell.x === startCell.x && targetCell.y === startCell.y && attempts < 10);
    if (!targetCell) { return false; }
    agent.targetGridPos = targetCell;
    return generatePathToTarget_BJS(agent, targetCell.x, targetCell.y);
}

function generatePathToTarget_BJS(agent, targetGridX, targetGridY) {
    // Requires globals: mazeGrid, agent
    // Requires functions: findPathAStar, gridPathToWorldPath (environment.js)
    if (!agent) return false;
    const startCell = mazeGrid[agent.gridY]?.[agent.gridX];
    const endCell = mazeGrid[targetGridY]?.[targetGridX];
    if (!startCell || !startCell.isPath || !endCell || !endCell.isPath) { agent.pathToTarget = []; agent.currentPathIndex = -1; agent.currentWaypoint = null; return false; }
    const gridPath = findPathAStar(mazeGrid, startCell, endCell); // findPathAStar in environment.js
    if (gridPath && gridPath.length > 0) {
        agent.pathToTarget = gridPathToWorldPath(gridPath); // gridPathToWorldPath in environment.js
        agent.currentPathIndex = 0;
        agent.currentWaypoint = agent.pathToTarget[agent.currentPathIndex];
        return true;
    } else {
        agent.pathToTarget = []; agent.currentPathIndex = -1; agent.currentWaypoint = null; return false;
    }
}

/* Three.js Reference omitted */