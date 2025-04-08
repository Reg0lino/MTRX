// =============================================================================
// js/agents.js - Agent Creation, AI Logic
// Version: 1.47y (Disable Movement Calls Temporarily)
// =============================================================================

// Relies on constants from constants.js (v1.47y)
// Relies on globals from main.js: agents, scene, camera, agentsRemaining
// Relies on functions: worldToGrid, gridToWorld (environment.js), findRandomReachableCell (environment.js), updateHUD (ui.js)

console.log("Loading agents.js (v1.47y - Movement Disabled)..."); // Version updated

function createAgents_BJS(scene) {
    console.log(`BJS [agents.js]: Creating ${STARTING_AGENT_COUNT} agents...`);
    if (!scene || !camera) { console.error("Scene or Camera missing for createAgents_BJS!"); return; }

    const agentBodyMaterial = new BABYLON.StandardMaterial("agentBodyMat", scene); agentBodyMaterial.diffuseColor = new BABYLON.Color3.FromHexString("#111111"); agentBodyMaterial.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    const agentHeadMaterial = new BABYLON.StandardMaterial("agentHeadMat", scene); agentHeadMaterial.diffuseColor = new BABYLON.Color3.FromHexString("#BC8F8F"); agentHeadMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);

    const headSize = AGENT_HEAD_SIZE; const bodyWidth = AGENT_BODY_WIDTH; const bodyHeight = AGENT_BODY_HEIGHT; const bodyDepthFactor = AGENT_BODY_DEPTH_FACTOR;
    const pStartCell = worldToGrid(camera.position.x, camera.position.z);

    for(let i = 0; i < STARTING_AGENT_COUNT; i++) {
        let spawnGridPos = null; let attempts = 0; const maxAttempts = 50;
        while (!spawnGridPos && attempts < maxAttempts) { const potentialCell = findRandomReachableCell(); if (potentialCell) { const distSq = (potentialCell.x - pStartCell.x)**2 + (potentialCell.y - pStartCell.y)**2; const minDistSq = 9; if (!(potentialCell.x === pStartCell.x && potentialCell.y === pStartCell.y) && distSq > minDistSq) { spawnGridPos = potentialCell; } } attempts++; }
        if (!spawnGridPos) { console.warn(`Agent ${i} random placement failed, using fallback.`); spawnGridPos = findRandomReachableCell() || {x: MAZE_WIDTH_CELLS - 2, y: MAZE_HEIGHT_CELLS - 2}; }
        const startWorld = gridToWorld(spawnGridPos.x, spawnGridPos.y);
        const agentRoot = new BABYLON.TransformNode(`agent_${i}_root`, scene); agentRoot.position = new BABYLON.Vector3(startWorld.x, 0, startWorld.z); agentRoot.rotationQuaternion = new BABYLON.Quaternion();

        const body = BABYLON.MeshBuilder.CreateBox(`agent_${i}_body`, { width: bodyWidth, height: bodyHeight, depth: bodyWidth * bodyDepthFactor }, scene); if (agentBodyMaterial) body.material = agentBodyMaterial; body.position.y = bodyHeight / 2; body.parent = agentRoot;
        const head = BABYLON.MeshBuilder.CreateBox(`agent_${i}_head`, { size: headSize }, scene); if (agentHeadMaterial) head.material = agentHeadMaterial; head.position.y = bodyHeight + headSize / 2; head.parent = agentRoot;

        const losTimer = typeof AGENT_LOS_CHECK_INTERVAL !== 'undefined' ? Math.random() * AGENT_LOS_CHECK_INTERVAL : 0.25 * Math.random();
        const agentData = {
            id: `Agent ${i}`, hp: AGENT_HP, rootNode: agentRoot, bodyMesh: body, headMesh: head, gridX: spawnGridPos.x, gridY: spawnGridPos.y, state: 'patrolling', hitTimer: 0, pathToTarget: [], currentPathIndex: -1, currentWaypoint: null, targetGridPos: {x: spawnGridPos.x, y: spawnGridPos.y}, timeSinceLastMove: 0, canSeePlayer: false, timeSincePlayerSeen: 0, lastKnownPlayerPos: new BABYLON.Vector3(), shootCooldownTimer: 0, meleeCooldownTimer: 0, losCheckTimer: losTimer, searchTimer: 0, targetCellRecalcTimer: 0, meleeBurstCount: 0, meleeBurstIntervalTimer: 0, stuckLogTimer: 0, currentTargetRotation: agentRoot.rotationQuaternion.clone()
        };
        agents.push(agentData);
        console.log(`   Agent ${i} spawned at grid (${spawnGridPos.x}, ${spawnGridPos.y})`);
    }
    agentsRemaining = agents.length;
    if (typeof updateHUD === "function") updateHUD();
    console.log("BJS [agents.js]: Agent creation finished.");
}

function updateAgents_BJS(delta, time) {
    if (!agents.length || !scene || !camera || !playerPosition) return;

    agents.forEach(agent => {
        if (!agent || agent.hp <= 0 || !agent.rootNode) return;

        // --- Temporarily Disable Pathfinding/Movement Calls ---
        // console.warn("Agent movement and pathfinding calls temporarily disabled in updateAgents_BJS");

        // Keep timers ticking (optional)
        // agent.shootCooldownTimer -= delta;
        // agent.losCheckTimer -= delta;
        // etc.

        // Basic placeholder: just look at player if close?
        // const playerDistSq = BABYLON.Vector3.DistanceSquared(agent.rootNode.position, playerPosition);
        // if (playerDistSq < (AGENT_MAX_VIEW_DISTANCE * 0.5)**2) {
        //     smoothTurnTowards(agent.rootNode, playerPosition, AGENT_TURN_SPEED * 0.5, delta);
        // }

    });
}


// --- Pathfinding Callers (Keep definitions, but updateAgents_BJS won't call them now) ---
function generateNewPatrolPath_BJS(agent) { /* ... logic from v1.47w ... */ console.warn("generateNewPatrolPath_BJS called (Movement Disabled)"); return false; }
function generatePathToTarget_BJS(agent, targetGridX, targetGridY) { /* ... logic from v1.47w ... */ console.warn("generatePathToTarget_BJS called (Movement Disabled)"); return false; }

// --- Stubs for Action/LoS checks (Keep definitions, but updateAgents_BJS won't call them now) ---
function checkAgentLoS(agent) { agent.canSeePlayer=false; return false; }
function agentFireGun(agent) { if(DEBUG_AGENT) console.log(`${agent.id}: ACTION - Fire Gun (Disabled)`); }
function attemptMeleeBurst(agent) { if(DEBUG_AGENT && Math.random()<0.05) console.log(`${agent.id}: ACTION - Attempt Melee (Disabled)`); }
function agentPerformSingleMelee(agent){ }
function smoothTurnTowards(object, targetPosition, turnSpeed, delta) { /* Basic LookAt or Slerp logic */ }


// end of file