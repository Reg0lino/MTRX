// =============================================================================
// js/environment.js - Maze Generation, Geometry, Pathfinding, Scene Setup
// Version: 1.47g (Refactored - Localized Geo Templates)
// =============================================================================

// Relies on constants from constants.js
// Relies on globals from main.js: engine, scene, camera, playerLight, mazeGrid, floorMesh_BJS, ceilingMesh_BJS, playerPosition

// =============================================================================
// Babylon.js Scene Creation Function
// =============================================================================
async function createScene(engine) {
    console.log("BJS [environment.js]: Creating Scene...");
    if (!engine) { console.error("Engine not provided to createScene!"); return null; }
    scene = new BABYLON.Scene(engine); // Assign to global scene
    scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);
    camera = new BABYLON.UniversalCamera("playerCamera", new BABYLON.Vector3(0, PLAYER_EYE_HEIGHT, 0), scene); // Assign to global camera
    camera.speed = PLAYER_SPEED_WALK; camera.inertia = 0.0; camera.angularSensibility = BJS_ANGULAR_SENSITIVITY; camera.minZ = 0.5; camera.maxZ = Math.max(MAZE_WIDTH_UNITS, MAZE_HEIGHT_UNITS) * 1.5; camera.upperBetaLimit = Math.PI / 2.1; camera.lowerBetaLimit = -Math.PI / 2.1;
    camera.keysUp = PLAYER_KEYS_UP; camera.keysDown = PLAYER_KEYS_DOWN; camera.keysLeft = PLAYER_KEYS_LEFT; camera.keysRight = PLAYER_KEYS_RIGHT;
    scene.collisionsEnabled = true; camera.checkCollisions = true; camera.ellipsoid = new BABYLON.Vector3(PLAYER_RADIUS, PLAYER_COLLISION_HEIGHT / 2, PLAYER_RADIUS); camera.ellipsoidOffset = new BABYLON.Vector3(0, PLAYER_COLLISION_HEIGHT / 2, 0); scene.gravity = new BABYLON.Vector3(0, -9.81 * 2.5, 0); camera.applyGravity = true;
    const ambientLight = new BABYLON.HemisphericLight("ambientLight", new BABYLON.Vector3(0, 1, 0), scene); ambientLight.intensity = 0.6; ambientLight.groundColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    playerLight = new BABYLON.PointLight("playerLight", new BABYLON.Vector3(0, 1, 0), scene); // Assign to global playerLight
    playerLight.intensity = 0.8; playerLight.range = 8 * CELL_SIZE * MAZE_GRID_SCALE; playerLight.diffuse = new BABYLON.Color3(0.8, 0.8, 0.7);
    scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR; scene.fogColor = new BABYLON.Color3(0, 0.01, 0); scene.fogStart = CELL_SIZE * MAZE_GRID_SCALE * 1.5; scene.fogEnd = CELL_SIZE * MAZE_GRID_SCALE * 8;
    console.log("BJS [environment.js]: Scene, Camera, Lights created.");
    return scene;
}

// =============================================================================
// Coordinate Conversion Helpers
// =============================================================================
function worldToGrid(worldX, worldZ) { const visualGridWidthTotal = MAZE_WIDTH_CELLS * MAZE_GRID_SCALE; const visualGridHeightTotal = MAZE_HEIGHT_CELLS * MAZE_GRID_SCALE; const visualGridXFloat = (worldX / CELL_SIZE) + (visualGridWidthTotal / 2); const visualGridZFloat = (worldZ / CELL_SIZE) + (visualGridHeightTotal / 2); const logicalGridX = Math.floor(visualGridXFloat / MAZE_GRID_SCALE); const logicalGridY = Math.floor(visualGridZFloat / MAZE_GRID_SCALE); const clampedX = Math.max(0, Math.min(MAZE_WIDTH_CELLS - 1, logicalGridX)); const clampedY = Math.max(0, Math.min(MAZE_HEIGHT_CELLS - 1, logicalGridY)); return { x: clampedX, y: clampedY }; }
function gridToWorld(gridX, gridY) { const worldX = (gridX - MAZE_WIDTH_CELLS / 2 + 0.5) * MAZE_GRID_SCALE * CELL_SIZE; const worldZ = (gridY - MAZE_HEIGHT_CELLS / 2 + 0.5) * MAZE_GRID_SCALE * CELL_SIZE; return new BABYLON.Vector3(worldX, 0, worldZ); }
function visualGridToWorldPos(visualGridX, visualGridY) { const visualGridWidthTotal = MAZE_WIDTH_CELLS * MAZE_GRID_SCALE; const visualGridHeightTotal = MAZE_HEIGHT_CELLS * MAZE_GRID_SCALE; const worldX = (visualGridX - visualGridWidthTotal / 2 + 0.5) * CELL_SIZE; const worldZ = (visualGridY - visualGridHeightTotal / 2 + 0.5) * CELL_SIZE; return new BABYLON.Vector3(worldX, 0, worldZ); };

// =============================================================================
// Maze Generation Functions
// =============================================================================
function initMazeGrid() { mazeGrid.length = 0; for (let y = 0; y < MAZE_HEIGHT_CELLS; y++) { mazeGrid[y] = []; for (let x = 0; x < MAZE_WIDTH_CELLS; x++) { mazeGrid[y][x] = { x: x, y: y, visited: false, walls: { top: true, bottom: true, left: true, right: true }, isWall: true, isPath: false }; } } console.log(`BJS [environment.js]: Initialized ${MAZE_HEIGHT_CELLS}x${MAZE_WIDTH_CELLS} logical grid.`); }
function getNeighbors(cell) { const neighbors = []; const { x, y } = cell; const potential = [{ x: x, y: y - 2 }, { x: x, y: y + 2 }, { x: x - 2, y: y }, { x: x + 2, y: y }]; for (const p of potential) { if (p.y >= 0 && p.y < MAZE_HEIGHT_CELLS && p.x >= 0 && p.x < MAZE_WIDTH_CELLS) { const neighbor = mazeGrid[p.y]?.[p.x]; if (neighbor && !neighbor.visited) { neighbors.push(neighbor); } } } return neighbors; }
function removeWall(cell1, cell2) { const dx = cell1.x - cell2.x; const dy = cell1.y - cell2.y; let wallX, wallY; if (dx === 2) { wallX = cell1.x - 1; wallY = cell1.y; cell1.walls.left = false; cell2.walls.right = false; } else if (dx === -2) { wallX = cell1.x + 1; wallY = cell1.y; cell1.walls.right = false; cell2.walls.left = false; } else if (dy === 2) { wallX = cell1.x; wallY = cell1.y - 1; cell1.walls.top = false; cell2.walls.bottom = false; } else if (dy === -2) { wallX = cell1.x; wallY = cell1.y + 1; cell1.walls.bottom = false; cell2.walls.top = false; } if (wallX !== undefined && wallY !== undefined && mazeGrid[wallY]?.[wallX]) { mazeGrid[wallY][wallX].isWall = false; mazeGrid[wallY][wallX].isPath = true; if (dx === 2 || dx === -2) { mazeGrid[wallY][wallX].walls.left = false; mazeGrid[wallY][wallX].walls.right = false; } if (dy === 2 || dy === -2) { mazeGrid[wallY][wallX].walls.top = false; mazeGrid[wallY][wallX].walls.bottom = false; } } else { console.warn(`Could not find wall cell between (${cell1.x},${cell1.y}) and (${cell2.x},${cell2.y})`); } }
function generateMaze(startCell) { console.log(`BJS [environment.js]: Starting maze generation (DFS)...`); const stack = []; startCell.visited = true; startCell.isWall = false; startCell.isPath = true; stack.push(startCell); while (stack.length > 0) { const current = stack.pop(); const neighbors = getNeighbors(current); if (neighbors.length > 0) { stack.push(current); const chosen = neighbors[Math.floor(Math.random() * neighbors.length)]; removeWall(current, chosen); chosen.visited = true; chosen.isWall = false; chosen.isPath = true; stack.push(chosen); } } console.log("BJS [environment.js]: Maze generation complete."); }
function addCrossConnections(chance) { console.log(`BJS [environment.js]: Adding cross connections with chance: ${chance * 100}%`); let connectionsAdded = 0; for (let y = 0; y < MAZE_HEIGHT_CELLS; y++) { for (let x = 0; x < MAZE_WIDTH_CELLS; x++) { const cell = mazeGrid[y]?.[x]; if (!cell || !cell.isPath) continue; if (cell.walls.right && x < MAZE_WIDTH_CELLS - 2) { const wallCellX = x + 1; const targetCellX = x + 2; if (mazeGrid[y]?.[wallCellX]?.isPath && mazeGrid[y]?.[targetCellX]?.isPath) { if (Math.random() < chance) { cell.walls.right = false; mazeGrid[y][wallCellX].walls.left = false; connectionsAdded++; } } } if (cell.walls.bottom && y < MAZE_HEIGHT_CELLS - 2) { const wallCellY = y + 1; const targetCellY = y + 2; if (mazeGrid[wallCellY]?.[x]?.isPath && mazeGrid[targetCellY]?.[x]?.isPath) { if (Math.random() < chance) { cell.walls.bottom = false; mazeGrid[wallCellY][x].walls.top = false; connectionsAdded++; } } } } } console.log(`BJS [environment.js]: Added ${connectionsAdded} cross connections.`); }

// =============================================================================
// A* Pathfinding Implementation
// =============================================================================
class SimplePriorityQueue { constructor() { this._nodes = []; } enqueue(priority, key) { this._nodes.push({ key: key, priority: priority }); this.sort(); } dequeue() { return this._nodes.shift().key; } isEmpty() { return !this._nodes.length; } sort() { this._nodes.sort((a, b) => a.priority - b.priority); } }
function heuristic(a, b) { return Math.abs(a.x - b.x) + Math.abs(a.y - b.y); }
function findPathAStar(grid, start, goal, maxCells = MAZE_WIDTH_CELLS * MAZE_HEIGHT_CELLS * 4) { const openSet = new SimplePriorityQueue(); if (!grid || !start || !goal || !grid[start.y]?.[start.x]?.isPath || !grid[goal.y]?.[goal.x]?.isPath) { return null; } const startKey = `${start.x},${start.y}`; openSet.enqueue(0, startKey); const cameFrom = new Map(); const gScore = new Map(); gScore.set(startKey, 0); const fScore = new Map(); fScore.set(startKey, heuristic(start, goal)); let visitedCount = 0; while (!openSet.isEmpty()) { if (visitedCount > maxCells) { console.warn("A* pathfinding exceeded maxCells limit."); return null; } const currentKey = openSet.dequeue(); const currentCoords = currentKey.split(','); const current = { x: parseInt(currentCoords[0]), y: parseInt(currentCoords[1]) }; if (current.x === goal.x && current.y === goal.y) { const path = []; let tempKey = currentKey; let safety = 0; while (tempKey && safety < (MAZE_WIDTH_CELLS * MAZE_HEIGHT_CELLS)) { const coordsArr = tempKey.split(','); path.push({ x: parseInt(coordsArr[0]), y: parseInt(coordsArr[1]) }); tempKey = cameFrom.get(tempKey); safety++; } if (safety >= (MAZE_WIDTH_CELLS * MAZE_HEIGHT_CELLS)) { console.error("A* Path reconstruction failed (infinite loop suspected)."); return null; } return path.reverse(); } visitedCount++; const currentCell = grid[current.y]?.[current.x]; if (!currentCell || !currentCell.isPath) continue; const neighbors = []; const potentialMoves = [ { dx: 0, dy: -1, wall: 'top'}, { dx: 0, dy: 1,  wall: 'bottom'}, { dx: -1, dy: 0, wall: 'left'}, { dx: 1, dy: 0,  wall: 'right'} ]; for (const move of potentialMoves) { const nx = current.x + move.dx; const ny = current.y + move.dy; if (ny >= 0 && ny < MAZE_HEIGHT_CELLS && nx >= 0 && nx < MAZE_WIDTH_CELLS) { const neighborCell = grid[ny]?.[nx]; if (neighborCell && neighborCell.isPath && !currentCell.walls[move.wall]) { neighbors.push({ x: nx, y: ny }); } } } for (const neighbor of neighbors) { const neighborKey = `${neighbor.x},${neighbor.y}`; const tentativeGScore = (gScore.get(currentKey) || 0) + 1; if (tentativeGScore < (gScore.get(neighborKey) || Infinity)) { cameFrom.set(neighborKey, currentKey); gScore.set(neighborKey, tentativeGScore); const neighborFScore = tentativeGScore + heuristic(neighbor, goal); fScore.set(neighborKey, neighborFScore); openSet.enqueue(neighborFScore, neighborKey); } } } return null; }
function gridPathToWorldPath(gridPath) { if (!gridPath) return []; return gridPath.map(cell => { const worldPos = gridToWorld(cell.x, cell.y); worldPos.y = AGENT_BODY_HEIGHT * 0.1; return worldPos; }); }
function findRandomReachableCell() { const maxAttempts = MAZE_WIDTH_CELLS * MAZE_HEIGHT_CELLS; let attempts = 0; let pathExists = false; for (let y = 0; y < MAZE_HEIGHT_CELLS && !pathExists; y++) { for (let x = 0; x < MAZE_WIDTH_CELLS && !pathExists; x++) { if (mazeGrid[y]?.[x]?.isPath) { pathExists = true; } } } if (!pathExists) { console.error("findRandomReachableCell: No cells with isPath=true found!"); return null; } while(attempts < maxAttempts) { const x = Math.floor(Math.random() * MAZE_WIDTH_CELLS); const y = Math.floor(Math.random() * MAZE_HEIGHT_CELLS); const cell = mazeGrid[y]?.[x]; if (cell && cell.isPath === true) { return { x: x, y: y }; } attempts++; } console.warn(`findRandomReachableCell: Random attempts failed. Searching sequentially...`); for (let y = 0; y < MAZE_HEIGHT_CELLS; y++) { for (let x = 0; x < MAZE_WIDTH_CELLS; x++) { const cell = mazeGrid[y]?.[x]; if (cell && cell.isPath === true) { return { x: x, y: y }; } } } console.error("findRandomReachableCell: CRITICAL - Sequential search failed!"); return null; }

// =============================================================================
// Babylon.js Maze Geometry Creation
// =============================================================================
function createMazeGeometry_BJS() {
    // Requires globals: scene, mazeGrid, floorMesh_BJS, ceilingMesh_BJS
    // Requires constants: WALL_*, CELL_SIZE, MAZE_*_UNITS, MAZE_*_CELLS, MAZE_GRID_SCALE, DOOR_*_FACTOR, DOOR_DEPTH, SHORT_WALL_CHANCE
    console.log("BJS [environment.js]: Creating Maze Geometry...");
    if (!scene) { console.error("Scene not available for geometry creation!"); return; }

    // --- Define Materials Locally ---
    const wallMaterial_BJS = new BABYLON.StandardMaterial("wallMat", scene); wallMaterial_BJS.diffuseColor = new BABYLON.Color3.FromHexString("#999999"); wallMaterial_BJS.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1); wallMaterial_BJS.emissiveColor = new BABYLON.Color3.FromHexString("#202020");
    const floorCeilingMaterial_BJS = new BABYLON.StandardMaterial("floorCeilingMat", scene); floorCeilingMaterial_BJS.diffuseColor = new BABYLON.Color3(1, 1, 1); floorCeilingMaterial_BJS.specularColor = new BABYLON.Color3(0, 0, 0);
    const doorMaterial_BJS = new BABYLON.StandardMaterial("doorMat", scene); doorMaterial_BJS.diffuseColor = new BABYLON.Color3.FromHexString("#006400"); doorMaterial_BJS.emissiveColor = new BABYLON.Color3.FromHexString("#003300"); doorMaterial_BJS.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);

    // --- Create Floor & Ceiling ---
    // Assign to global variables if needed by other modules, otherwise keep local
    floorMesh_BJS = BABYLON.MeshBuilder.CreateGround("floor", {width: MAZE_WIDTH_UNITS, height: MAZE_HEIGHT_UNITS}, scene); floorMesh_BJS.position.y = 0.01; floorMesh_BJS.material = floorCeilingMaterial_BJS; floorMesh_BJS.checkCollisions = true;
    ceilingMesh_BJS = BABYLON.MeshBuilder.CreatePlane("ceiling", {width: MAZE_WIDTH_UNITS, height: MAZE_HEIGHT_UNITS}, scene); ceilingMesh_BJS.position.y = WALL_HEIGHT; ceilingMesh_BJS.rotation.x = Math.PI; ceilingMesh_BJS.material = floorCeilingMaterial_BJS;

    // --- Create Base Templates Locally ---
    // These templates are only needed within this function scope
    const wallMeshFullTemplate = BABYLON.MeshBuilder.CreateBox("wallTemplateFull", {width: WALL_THICKNESS, height: WALL_HEIGHT, depth: WALL_THICKNESS}, scene);
    wallMeshFullTemplate.material = wallMaterial_BJS; wallMeshFullTemplate.isVisible = false; wallMeshFullTemplate.checkCollisions = true;
    const wallMeshShortTemplate = BABYLON.MeshBuilder.CreateBox("wallTemplateShort", {width: WALL_THICKNESS, height: WALL_HEIGHT_SHORT, depth: WALL_THICKNESS}, scene);
    wallMeshShortTemplate.material = wallMaterial_BJS; wallMeshShortTemplate.isVisible = false; wallMeshShortTemplate.checkCollisions = true;
    const doorMeshTemplateLocal = BABYLON.MeshBuilder.CreateBox("doorTemplate", { width: MAZE_GRID_SCALE * CELL_SIZE * DOOR_WIDTH_FACTOR, height: WALL_HEIGHT * DOOR_HEIGHT_FACTOR, depth: DOOR_DEPTH }, scene);
    doorMeshTemplateLocal.material = doorMaterial_BJS; doorMeshTemplateLocal.isVisible = false; doorMeshTemplateLocal.checkCollisions = true;


    // --- Instance Creation Logic ---
    const fullWallMatrices = []; const shortWallMatrices = []; const doorMatrices = [];
    const visualGridWidthTotal = MAZE_WIDTH_CELLS * MAZE_GRID_SCALE; const visualGridHeightTotal = MAZE_HEIGHT_CELLS * MAZE_GRID_SCALE;
    for (let visualGridY = 0; visualGridY < visualGridHeightTotal; visualGridY++) {
        for (let visualGridX = 0; visualGridX < visualGridWidthTotal; visualGridX++) {
            const cellX = Math.floor(visualGridX / MAZE_GRID_SCALE); const cellY = Math.floor(visualGridY / MAZE_GRID_SCALE); const cell = mazeGrid[cellY]?.[cellX]; let isVisualWall = false; let isDoorway = false;
            if (cell) { const relX = visualGridX % MAZE_GRID_SCALE; const relY = visualGridY % MAZE_GRID_SCALE; if (cell.walls.top && relY === 0) isVisualWall = true; else if (cell.walls.bottom && relY === MAZE_GRID_SCALE - 1) isVisualWall = true; else if (cell.walls.left && relX === 0) isVisualWall = true; else if (cell.walls.right && relX === MAZE_GRID_SCALE - 1) isVisualWall = true; else if (cell.isWall && !cell.isPath) isVisualWall = true; const isBorder = cellX === 0 || cellX === MAZE_WIDTH_CELLS - 1 || cellY === 0 || cellY === MAZE_HEIGHT_CELLS - 1; if (!isBorder && isVisualWall) { if (relX === MAZE_GRID_SCALE - 1 && Math.abs(relY - (MAZE_GRID_SCALE - 1) / 2) < 1) { if (cell.isPath && cellX < MAZE_WIDTH_CELLS - 1 && mazeGrid[cellY]?.[cellX + 1]?.isPath && !cell.walls.right) { isDoorway = true; isVisualWall = false; const worldPos = visualGridToWorldPos(visualGridX, visualGridY); const matrix = BABYLON.Matrix.RotationYawPitchRoll(Math.PI / 2, 0, 0).multiply(BABYLON.Matrix.Translation(worldPos.x, WALL_HEIGHT * DOOR_HEIGHT_FACTOR / 2, worldPos.z)); doorMatrices.push(matrix); } } else if (relY === MAZE_GRID_SCALE - 1 && Math.abs(relX - (MAZE_GRID_SCALE - 1) / 2) < 1) { if (cell.isPath && cellY < MAZE_HEIGHT_CELLS - 1 && mazeGrid[cellY + 1]?.[cellX]?.isPath && !cell.walls.bottom) { isDoorway = true; isVisualWall = false; const worldPos = visualGridToWorldPos(visualGridX, visualGridY); const matrix = BABYLON.Matrix.RotationYawPitchRoll(0, 0, 0).multiply(BABYLON.Matrix.Translation(worldPos.x, WALL_HEIGHT * DOOR_HEIGHT_FACTOR / 2, worldPos.z)); doorMatrices.push(matrix); } } } } else { isVisualWall = true; }
            if (isVisualWall && !isDoorway) { const isBorder = cellX === 0 || cellX === MAZE_WIDTH_CELLS - 1 || cellY === 0 || cellY === MAZE_HEIGHT_CELLS - 1; let isShort = !isBorder && Math.random() < SHORT_WALL_CHANCE; const wallHeight = isShort ? WALL_HEIGHT_SHORT : WALL_HEIGHT; const worldPos = visualGridToWorldPos(visualGridX, visualGridY); const matrix = BABYLON.Matrix.Translation(worldPos.x, wallHeight / 2, worldPos.z); if (isShort) { shortWallMatrices.push(matrix); } else { fullWallMatrices.push(matrix); } }
        }
    }

    // --- Apply Thin Instances ---
    // Make sure the template meshes actually exist before trying to add instances
    console.log(`Creating ${fullWallMatrices.length} full wall instances...`);
    if (wallMeshFullTemplate && fullWallMatrices.length > 0) {
        wallMeshFullTemplate.thinInstanceAdd(fullWallMatrices, true); // Use local template
    } else if (fullWallMatrices.length > 0) { console.error("wallMeshFullTemplate missing!"); }

    console.log(`Creating ${shortWallMatrices.length} short wall instances...`);
    if (wallMeshShortTemplate && shortWallMatrices.length > 0) {
         wallMeshShortTemplate.thinInstanceAdd(shortWallMatrices, true); // Use local template
     } else if (shortWallMatrices.length > 0) { console.error("wallMeshShortTemplate missing!"); }

    console.log(`Creating ${doorMatrices.length} door instances...`);
    if (doorMeshTemplateLocal && doorMatrices.length > 0) {
        doorMeshTemplateLocal.thinInstanceAdd(doorMatrices, true); // Use local template
    } else if (doorMatrices.length > 0) { console.error("doorMeshTemplateLocal missing!"); }

    // Assign global references if needed AFTER creation (though not strictly necessary if only used here)
    wallMeshFull = wallMeshFullTemplate;
    wallMeshShort = wallMeshShortTemplate;
    doorMeshTemplate = doorMeshTemplateLocal;

    console.log("BJS [environment.js]: Maze geometry instancing complete.");
}

// =============================================================================
// Player Start Position
// =============================================================================
function findLongestCorridorAndSetPlayerStart_BJS() {
    // Requires globals: mazeGrid, camera, playerPosition
    // Requires constants: MAZE_*, PLAYER_EYE_HEIGHT
    // Requires helper: gridToWorld
    let longestCorridor = { start: null, end: null, length: 0, orientation: null }; for (let y = 0; y < MAZE_HEIGHT_CELLS; y++) { for (let x = 0; x < MAZE_WIDTH_CELLS; x++) { const isWallLeft = x === 0 || !mazeGrid[y]?.[x - 1]?.isPath; if (mazeGrid[y]?.[x]?.isPath && isWallLeft) { let currentLength = 0; let currentX = x; while (currentX < MAZE_WIDTH_CELLS && mazeGrid[y]?.[currentX]?.isPath) { currentLength++; currentX++; } if (currentLength > longestCorridor.length) { longestCorridor = { start: { x: x, y: y }, end: { x: currentX - 1, y: y }, length: currentLength, orientation: 'horizontal' }; } } } } for (let x = 0; x < MAZE_WIDTH_CELLS; x++) { for (let y = 0; y < MAZE_HEIGHT_CELLS; y++) { const isWallAbove = y === 0 || !mazeGrid[y - 1]?.[x]?.isPath; if (mazeGrid[y]?.[x]?.isPath && isWallAbove) { let currentLength = 0; let currentY = y; while (currentY < MAZE_HEIGHT_CELLS && mazeGrid[currentY]?.[x]?.isPath) { currentLength++; currentY++; } if (currentLength > longestCorridor.length) { longestCorridor = { start: { x: x, y: y }, end: { x: x, y: currentY - 1 }, length: currentLength, orientation: 'vertical' }; } } } } let startWorldPos = gridToWorld(1, 1); let targetWorldPos = gridToWorld(1, 2); if (longestCorridor.length > 1) { const useStartAsPlayer = Math.random() < 0.5; const startGridPos = useStartAsPlayer ? longestCorridor.start : longestCorridor.end; const targetGridPos = useStartAsPlayer ? longestCorridor.end : longestCorridor.start; startWorldPos = gridToWorld(startGridPos.x, startGridPos.y); targetWorldPos = gridToWorld(targetGridPos.x, targetGridPos.y); } else { console.warn("Could not find suitable longest corridor, using default start (1,1)"); }
    if (camera) { camera.position = new BABYLON.Vector3(startWorldPos.x, PLAYER_EYE_HEIGHT, startWorldPos.z); camera.setTarget(new BABYLON.Vector3(targetWorldPos.x, PLAYER_EYE_HEIGHT, targetWorldPos.z)); playerPosition.copyFrom(camera.position); console.log(`BJS [environment.js]: Player start position set to ${camera.position.x.toFixed(1)}, ${camera.position.z.toFixed(1)}`); } else { console.error("Cannot set player start: Camera object not found!"); }
}

// end of file