// =============================================================================
// js/environment.js - Scene Setup, Maze Generation & Geometry
// Version: 1.47e (Refactored)
// =============================================================================

// --- Relevant Constants (Assume defined globally in main.js or constants file) ---
// const PATH_WIDTH_SETTING = 5;
// const MAZE_GRID_SCALE = ...;
// const MAZE_WIDTH_CELLS = 12;
// const MAZE_HEIGHT_CELLS = 12;
// const CELL_SIZE = 10;
// const MAZE_WIDTH_UNITS = ...;
// const MAZE_HEIGHT_UNITS = ...;
// const WALL_HEIGHT = 30;
// const WALL_HEIGHT_SHORT = 8;
// const WALL_THICKNESS = CELL_SIZE;
// const SHORT_WALL_CHANCE = 0.08;
// const CROSS_CONNECTION_CHANCE = 0.25;
// const DOOR_HEIGHT_FACTOR = 0.85;
// const DOOR_WIDTH_FACTOR = 0.4;
// const DOOR_DEPTH = 0.3;
// const PLAYER_EYE_HEIGHT = ...;

// =============================================================================
// Coordinate Conversion Helpers (Specific to maze logic)
// =============================================================================
function worldToGrid(worldX, worldZ) { const visualGridWidthTotal = MAZE_WIDTH_CELLS * MAZE_GRID_SCALE; const visualGridHeightTotal = MAZE_HEIGHT_CELLS * MAZE_GRID_SCALE; const visualGridXFloat = (worldX / CELL_SIZE) + (visualGridWidthTotal / 2); const visualGridZFloat = (worldZ / CELL_SIZE) + (visualGridHeightTotal / 2); const logicalGridX = Math.floor(visualGridXFloat / MAZE_GRID_SCALE); const logicalGridY = Math.floor(visualGridZFloat / MAZE_GRID_SCALE); const clampedX = Math.max(0, Math.min(MAZE_WIDTH_CELLS - 1, logicalGridX)); const clampedY = Math.max(0, Math.min(MAZE_HEIGHT_CELLS - 1, logicalGridY)); return { x: clampedX, y: clampedY }; }
function gridToWorld(gridX, gridY) { const worldX = (gridX - MAZE_WIDTH_CELLS / 2 + 0.5) * MAZE_GRID_SCALE * CELL_SIZE; const worldZ = (gridY - MAZE_HEIGHT_CELLS / 2 + 0.5) * MAZE_GRID_SCALE * CELL_SIZE; return new BABYLON.Vector3(worldX, 0, worldZ); }
function visualGridToWorldPos(visualGridX, visualGridY) { const visualGridWidthTotal = MAZE_WIDTH_CELLS * MAZE_GRID_SCALE; const visualGridHeightTotal = MAZE_HEIGHT_CELLS * MAZE_GRID_SCALE; const worldX = (visualGridX - visualGridWidthTotal / 2 + 0.5) * CELL_SIZE; const worldZ = (visualGridY - visualGridHeightTotal / 2 + 0.5) * CELL_SIZE; return new BABYLON.Vector3(worldX, 0, worldZ); };

// =============================================================================
// Maze Generation Functions (Ported - Pure JS)
// =============================================================================
function initMazeGrid() {
    // Requires global: mazeGrid, MAZE_HEIGHT_CELLS, MAZE_WIDTH_CELLS
    mazeGrid.length = 0; // Clear previous grid data
    for (let y = 0; y < MAZE_HEIGHT_CELLS; y++) {
        mazeGrid[y] = [];
        for (let x = 0; x < MAZE_WIDTH_CELLS; x++) {
            mazeGrid[y][x] = { x: x, y: y, visited: false, walls: { top: true, bottom: true, left: true, right: true }, isWall: true, isPath: false };
        }
    }
    console.log(`BJS [environment.js]: Initialized ${MAZE_HEIGHT_CELLS}x${MAZE_WIDTH_CELLS} logical grid.`);
}

function getNeighbors(cell) {
    // Requires global: mazeGrid, MAZE_HEIGHT_CELLS, MAZE_WIDTH_CELLS
    const neighbors = []; const { x, y } = cell; const potential = [{ x: x, y: y - 2 }, { x: x, y: y + 2 }, { x: x - 2, y: y }, { x: x + 2, y: y }]; for (const p of potential) { if (p.y >= 0 && p.y < MAZE_HEIGHT_CELLS && p.x >= 0 && p.x < MAZE_WIDTH_CELLS) { const neighbor = mazeGrid[p.y]?.[p.x]; if (neighbor && !neighbor.visited) { neighbors.push(neighbor); } } } return neighbors;
}

function removeWall(cell1, cell2) {
    // Requires global: mazeGrid
    const dx = cell1.x - cell2.x; const dy = cell1.y - cell2.y; let wallX, wallY; if (dx === 2) { wallX = cell1.x - 1; wallY = cell1.y; cell1.walls.left = false; cell2.walls.right = false; } else if (dx === -2) { wallX = cell1.x + 1; wallY = cell1.y; cell1.walls.right = false; cell2.walls.left = false; } else if (dy === 2) { wallX = cell1.x; wallY = cell1.y - 1; cell1.walls.top = false; cell2.walls.bottom = false; } else if (dy === -2) { wallX = cell1.x; wallY = cell1.y + 1; cell1.walls.bottom = false; cell2.walls.top = false; } if (wallX !== undefined && wallY !== undefined && mazeGrid[wallY]?.[wallX]) { mazeGrid[wallY][wallX].isWall = false; mazeGrid[wallY][wallX].isPath = true; if (dx === 2 || dx === -2) { mazeGrid[wallY][wallX].walls.left = false; mazeGrid[wallY][wallX].walls.right = false; } if (dy === 2 || dy === -2) { mazeGrid[wallY][wallX].walls.top = false; mazeGrid[wallY][wallX].walls.bottom = false; } } else { console.warn(`Could not find wall cell between (${cell1.x},${cell1.y}) and (${cell2.x},${cell2.y})`); }
}

function generateMaze(startCell) {
    // Requires global: mazeGrid
    // Requires local: getNeighbors, removeWall
    console.log(`BJS [environment.js]: Starting maze generation (DFS)...`);
    const stack = []; startCell.visited = true; startCell.isWall = false; startCell.isPath = true; stack.push(startCell); while (stack.length > 0) { const current = stack.pop(); const neighbors = getNeighbors(current); if (neighbors.length > 0) { stack.push(current); const chosen = neighbors[Math.floor(Math.random() * neighbors.length)]; removeWall(current, chosen); chosen.visited = true; chosen.isWall = false; chosen.isPath = true; stack.push(chosen); } }
    console.log("BJS [environment.js]: Maze generation complete.");
}

function addCrossConnections(chance) {
    // Requires global: mazeGrid, MAZE_WIDTH_CELLS, MAZE_HEIGHT_CELLS
    console.log(`BJS [environment.js]: Adding cross connections with chance: ${chance * 100}%`);
    let connectionsAdded = 0; for (let y = 0; y < MAZE_HEIGHT_CELLS; y++) { for (let x = 0; x < MAZE_WIDTH_CELLS; x++) { const cell = mazeGrid[y]?.[x]; if (!cell || !cell.isPath) continue; if (cell.walls.right && x < MAZE_WIDTH_CELLS - 2) { const wallCellX = x + 1; const targetCellX = x + 2; if (mazeGrid[y]?.[wallCellX]?.isPath && mazeGrid[y]?.[targetCellX]?.isPath) { if (Math.random() < chance) { cell.walls.right = false; mazeGrid[y][wallCellX].walls.left = false; connectionsAdded++; } } } if (cell.walls.bottom && y < MAZE_HEIGHT_CELLS - 2) { const wallCellY = y + 1; const targetCellY = y + 2; if (mazeGrid[wallCellY]?.[x]?.isPath && mazeGrid[targetCellY]?.[x]?.isPath) { if (Math.random() < chance) { cell.walls.bottom = false; mazeGrid[wallCellY][x].walls.top = false; connectionsAdded++; } } } } } console.log(`BJS [environment.js]: Added ${connectionsAdded} cross connections.`);
}

// =============================================================================
// Babylon.js Maze Geometry Creation
// =============================================================================
function createMazeGeometry_BJS() {
    // Requires globals: scene, mazeGrid, WALL_*, CELL_SIZE, MAZE_*_UNITS, MAZE_*_CELLS, MAZE_GRID_SCALE, DOOR_*_FACTOR, DOOR_DEPTH, SHORT_WALL_CHANCE
    // Assigns to globals: floorMesh_BJS, ceilingMesh_BJS, wallMeshFull, wallMeshShort, doorMeshTemplate
    console.log("BJS [environment.js]: Creating Maze Geometry using Instancing...");
    const wallMaterial_BJS = new BABYLON.StandardMaterial("wallMat", scene); wallMaterial_BJS.diffuseColor = new BABYLON.Color3.FromHexString("#999999"); wallMaterial_BJS.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1); wallMaterial_BJS.emissiveColor = new BABYLON.Color3.FromHexString("#202020");
    const floorCeilingMaterial_BJS = new BABYLON.StandardMaterial("floorCeilingMat", scene); floorCeilingMaterial_BJS.diffuseColor = new BABYLON.Color3(1, 1, 1); floorCeilingMaterial_BJS.specularColor = new BABYLON.Color3(0, 0, 0);
    const doorMaterial_BJS = new BABYLON.StandardMaterial("doorMat", scene); doorMaterial_BJS.diffuseColor = new BABYLON.Color3.FromHexString("#006400"); doorMaterial_BJS.emissiveColor = new BABYLON.Color3.FromHexString("#003300"); doorMaterial_BJS.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);

    floorMesh_BJS = BABYLON.MeshBuilder.CreateGround("floor", {width: MAZE_WIDTH_UNITS, height: MAZE_HEIGHT_UNITS}, scene); floorMesh_BJS.position.y = 0.01; floorMesh_BJS.material = floorCeilingMaterial_BJS; floorMesh_BJS.checkCollisions = true;
    ceilingMesh_BJS = BABYLON.MeshBuilder.CreatePlane("ceiling", {width: MAZE_WIDTH_UNITS, height: MAZE_HEIGHT_UNITS}, scene); ceilingMesh_BJS.position.y = WALL_HEIGHT; ceilingMesh_BJS.rotation.x = Math.PI; ceilingMesh_BJS.material = floorCeilingMaterial_BJS;

    wallMeshFull = BABYLON.MeshBuilder.CreateBox("wallTemplateFull", {width: WALL_THICKNESS, height: WALL_HEIGHT, depth: WALL_THICKNESS}, scene); wallMeshFull.material = wallMaterial_BJS; wallMeshFull.isVisible = false; wallMeshFull.checkCollisions = true;
    wallMeshShort = BABYLON.MeshBuilder.CreateBox("wallTemplateShort", {width: WALL_THICKNESS, height: WALL_HEIGHT_SHORT, depth: WALL_THICKNESS}, scene); wallMeshShort.material = wallMaterial_BJS; wallMeshShort.isVisible = false; wallMeshShort.checkCollisions = true;
    doorMeshTemplate = BABYLON.MeshBuilder.CreateBox("doorTemplate", { width: MAZE_GRID_SCALE * CELL_SIZE * DOOR_WIDTH_FACTOR, height: WALL_HEIGHT * DOOR_HEIGHT_FACTOR, depth: DOOR_DEPTH }, scene); doorMeshTemplate.material = doorMaterial_BJS; doorMeshTemplate.isVisible = false; doorMeshTemplate.checkCollisions = true;

    const fullWallMatrices = []; const shortWallMatrices = []; const doorMatrices = [];
    const visualGridWidthTotal = MAZE_WIDTH_CELLS * MAZE_GRID_SCALE; const visualGridHeightTotal = MAZE_HEIGHT_CELLS * MAZE_GRID_SCALE;

    for (let visualGridY = 0; visualGridY < visualGridHeightTotal; visualGridY++) {
        for (let visualGridX = 0; visualGridX < visualGridWidthTotal; visualGridX++) {
            const cellX = Math.floor(visualGridX / MAZE_GRID_SCALE);
            const cellY = Math.floor(visualGridY / MAZE_GRID_SCALE);
            const cell = mazeGrid[cellY]?.[cellX];
            let isVisualWall = false; let isDoorway = false;

            if (cell) {
                const relX = visualGridX % MAZE_GRID_SCALE; const relY = visualGridY % MAZE_GRID_SCALE;
                if (cell.walls.top && relY === 0) isVisualWall = true; else if (cell.walls.bottom && relY === MAZE_GRID_SCALE - 1) isVisualWall = true; else if (cell.walls.left && relX === 0) isVisualWall = true; else if (cell.walls.right && relX === MAZE_GRID_SCALE - 1) isVisualWall = true; else if (cell.isWall && !cell.isPath) isVisualWall = true;
                const isBorder = cellX === 0 || cellX === MAZE_WIDTH_CELLS - 1 || cellY === 0 || cellY === MAZE_HEIGHT_CELLS - 1;
                if (!isBorder && isVisualWall) {
                    if (relX === MAZE_GRID_SCALE - 1 && Math.abs(relY - (MAZE_GRID_SCALE - 1) / 2) < 1) { if (cell.isPath && cellX < MAZE_WIDTH_CELLS - 1 && mazeGrid[cellY]?.[cellX + 1]?.isPath && !cell.walls.right) { isDoorway = true; isVisualWall = false; const worldPos = visualGridToWorldPos(visualGridX, visualGridY); const matrix = BABYLON.Matrix.RotationYawPitchRoll(Math.PI / 2, 0, 0).multiply(BABYLON.Matrix.Translation(worldPos.x, WALL_HEIGHT * DOOR_HEIGHT_FACTOR / 2, worldPos.z)); doorMatrices.push(matrix); } }
                    else if (relY === MAZE_GRID_SCALE - 1 && Math.abs(relX - (MAZE_GRID_SCALE - 1) / 2) < 1) { if (cell.isPath && cellY < MAZE_HEIGHT_CELLS - 1 && mazeGrid[cellY + 1]?.[cellX]?.isPath && !cell.walls.bottom) { isDoorway = true; isVisualWall = false; const worldPos = visualGridToWorldPos(visualGridX, visualGridY); const matrix = BABYLON.Matrix.RotationYawPitchRoll(0, 0, 0).multiply(BABYLON.Matrix.Translation(worldPos.x, WALL_HEIGHT * DOOR_HEIGHT_FACTOR / 2, worldPos.z)); doorMatrices.push(matrix); } }
                }
            } else { isVisualWall = true; }

            if (isVisualWall && !isDoorway) {
                const isBorder = cellX === 0 || cellX === MAZE_WIDTH_CELLS - 1 || cellY === 0 || cellY === MAZE_HEIGHT_CELLS - 1; let isShort = !isBorder && Math.random() < SHORT_WALL_CHANCE; const wallHeight = isShort ? WALL_HEIGHT_SHORT : WALL_HEIGHT; const worldPos = visualGridToWorldPos(visualGridX, visualGridY); const matrix = BABYLON.Matrix.Translation(worldPos.x, wallHeight / 2, worldPos.z); if (isShort) { shortWallMatrices.push(matrix); } else { fullWallMatrices.push(matrix); }
            }
        }
    }
    console.log(`Creating ${fullWallMatrices.length} full wall instances...`); if (fullWallMatrices.length > 0) wallMeshFull.thinInstanceAdd(fullWallMatrices);
    console.log(`Creating ${shortWallMatrices.length} short wall instances...`); if (shortWallMatrices.length > 0) wallMeshShort.thinInstanceAdd(shortWallMatrices);
    console.log(`Creating ${doorMatrices.length} door instances...`); if (doorMatrices.length > 0) doorMeshTemplate.thinInstanceAdd(doorMatrices);
    console.log("BJS [environment.js]: Maze geometry instancing complete.");
}

// =============================================================================
// Player Start Position
// =============================================================================
function findLongestCorridorAndSetPlayerStart_BJS() {
    // Requires globals: mazeGrid, MAZE_WIDTH_CELLS, MAZE_HEIGHT_CELLS, camera, playerPosition, PLAYER_EYE_HEIGHT
    // Requires helper: gridToWorld
    let longestCorridor = { start: null, end: null, length: 0, orientation: null };
    // ... (Logic for finding longest corridor - same as before) ...
    for (let y = 0; y < MAZE_HEIGHT_CELLS; y++) { for (let x = 0; x < MAZE_WIDTH_CELLS; x++) { const isWallLeft = x === 0 || !mazeGrid[y]?.[x - 1]?.isPath; if (mazeGrid[y]?.[x]?.isPath && isWallLeft) { let currentLength = 0; let currentX = x; while (currentX < MAZE_WIDTH_CELLS && mazeGrid[y]?.[currentX]?.isPath) { currentLength++; currentX++; } if (currentLength > longestCorridor.length) { longestCorridor = { start: { x: x, y: y }, end: { x: currentX - 1, y: y }, length: currentLength, orientation: 'horizontal' }; } } } } for (let x = 0; x < MAZE_WIDTH_CELLS; x++) { for (let y = 0; y < MAZE_HEIGHT_CELLS; y++) { const isWallAbove = y === 0 || !mazeGrid[y - 1]?.[x]?.isPath; if (mazeGrid[y]?.[x]?.isPath && isWallAbove) { let currentLength = 0; let currentY = y; while (currentY < MAZE_HEIGHT_CELLS && mazeGrid[currentY]?.[x]?.isPath) { currentLength++; currentY++; } if (currentLength > longestCorridor.length) { longestCorridor = { start: { x: x, y: y }, end: { x: x, y: currentY - 1 }, length: currentLength, orientation: 'vertical' }; } } } }

    let startWorldPos = gridToWorld(1, 1); let targetWorldPos = gridToWorld(1, 2);
    if (longestCorridor.length > 1) { const useStartAsPlayer = Math.random() < 0.5; const startGridPos = useStartAsPlayer ? longestCorridor.start : longestCorridor.end; const targetGridPos = useStartAsPlayer ? longestCorridor.end : longestCorridor.start; startWorldPos = gridToWorld(startGridPos.x, startGridPos.y); targetWorldPos = gridToWorld(targetGridPos.x, targetGridPos.y); } else { console.warn("Could not find suitable longest corridor, using default start (1,1)"); }

    if (camera) {
        camera.position = new BABYLON.Vector3(startWorldPos.x, PLAYER_EYE_HEIGHT, startWorldPos.z);
        camera.setTarget(new BABYLON.Vector3(targetWorldPos.x, PLAYER_EYE_HEIGHT, targetWorldPos.z));
        playerPosition.copyFrom(camera.position); // Sync state variable
        console.log(`BJS [environment.js]: Player start position set to ${camera.position.x.toFixed(1)}, ${camera.position.z.toFixed(1)}`);
    } else {
        console.error("Cannot set player start: Camera object not found!");
    }
}

/*
// =============================================================================
// == Three.js Reference (Maze Geometry) ==
// =============================================================================
// function createMazeGeometry() {
//     // ... Remove old meshes ...
//     wallInstancesFull = new THREE.InstancedMesh(wallGeometryFull, wallMaterial, MAX_WALL_INSTANCES);
//     wallInstancesShort = new THREE.InstancedMesh(wallGeometryShort, wallMaterial, MAX_WALL_INSTANCES);
//     // ... Set shadow properties ...
//     let fullInstanceCount = 0; let shortInstanceCount = 0;
//     const matrix = new THREE.Matrix4(); const positionVec = new THREE.Vector3();
//     const getWallWorldPos = (visualGridX, visualGridY) => { ... }; // Similar logic
//     for (let visualGridY = 0; visualGridY < visualGridHeightTotal; visualGridY++) {
//         for (let visualGridX = 0; visualGridX < visualGridWidthTotal; visualGridX++) {
//             // ... Determine logical cell (cellX, cellY), cell, relX, relY ...
//             // ... Determine isFineGridWall based on cell.walls ...
//             if (isFineGridWall) {
//                  // ... Determine isBorder, isShort, meshHeight, wallBaseY ...
//                  const pos = getWallWorldPos(visualGridX, visualGridY);
//                  positionVec.set(pos.x, wallBaseY + meshHeight / 2, pos.z);
//                  matrix.setPosition(positionVec);
//                  if (isShort) {
//                      wallInstancesShort.setMatrixAt(shortInstanceCount++, matrix);
//                  } else {
//                      wallInstancesFull.setMatrixAt(fullInstanceCount++, matrix);
//                       // Door placement logic (different implementation in Three.js)
//                       // Created individual door meshes here:
//                       // if (placeDoor) {
//                       //    const door = new THREE.Mesh(doorGeometry, doorMaterial);
//                       //    door.position.set(pos.x, ...); door.rotation.y = ...;
//                       //    doorMeshes.push(door); scene.add(door);
//                       // }
//                  }
//              }
//         }
//     }
//     wallInstancesFull.count = fullInstanceCount;
//     wallInstancesShort.count = shortInstanceCount;
//     wallInstancesFull.instanceMatrix.needsUpdate = true;
//     wallInstancesShort.instanceMatrix.needsUpdate = true;
//     scene.add(wallInstancesFull); scene.add(wallInstancesShort);
//     // Floor/Ceiling
//     const floorGeometry = new THREE.PlaneGeometry(MAZE_WIDTH_UNITS, MAZE_HEIGHT_UNITS);
//     const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial); // Separate floorMaterial
//     // ... Position and add floor/ceiling ...
// }
*/