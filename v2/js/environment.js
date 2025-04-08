// =============================================================================
// js/environment.js - Maze Generation, Geometry, Pathfinding, Scene Setup
// Version: 1.47s (Coord Func Typo Fix)
// =============================================================================

// --- Annotations ---
// Fixed typos (wz -> worldZ) in gridToWorld and visualGridToWorldPos functions.
// Uses constants defined relative to PLAYER_UNIT_HEIGHT (v1.47q).

// Relies on constants from constants.js (v1.47q / latest)
// Relies on globals from main.js: engine, scene, camera, playerLight, mazeGrid, floorMesh_BJS, ceilingMesh_BJS, playerPosition

// =============================================================================
// Babylon.js Scene Creation Function (Uses new relative constants)
// =============================================================================
async function createScene(engine) {
    console.log("BJS [environment.js]: Creating Scene (v1.47s - Coord Fix)..."); // Version updated
    if (!engine) { console.error("Engine not provided!"); return null; }
    scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);

    // --- Camera ---
    camera = new BABYLON.UniversalCamera("playerCamera", new BABYLON.Vector3(0, PLAYER_EYE_HEIGHT, 0), scene);
    camera.speed = PLAYER_SPEED_WALK;
    camera.inertia = 0.0;
    camera.angularSensibility = BJS_ANGULAR_SENSITIVITY;
    camera.minZ = 0.1;
    camera.maxZ = Math.max(MAZE_WIDTH_UNITS, MAZE_HEIGHT_UNITS) * 1.5;
    camera.upperBetaLimit=Math.PI/2.1; camera.lowerBetaLimit=-Math.PI/2.1;
    camera.keysUp=PLAYER_KEYS_UP; camera.keysDown=PLAYER_KEYS_DOWN; camera.keysLeft=PLAYER_KEYS_LEFT; camera.keysRight=PLAYER_KEYS_RIGHT;

    // --- Collisions and Gravity ---
    console.log("Setting collisions and gravity...");
    scene.collisionsEnabled = true;
    camera.checkCollisions = true;
    camera.applyGravity = true;
    camera.ellipsoid = new BABYLON.Vector3(PLAYER_RADIUS, PLAYER_COLLISION_HEIGHT / 2, PLAYER_RADIUS);
    camera.ellipsoidOffset = new BABYLON.Vector3(0, PLAYER_COLLISION_HEIGHT / 2, 0);
    scene.gravity = new BABYLON.Vector3(0, -9.81, 0);
    console.log(` Ellipsoid Set: Radius=${PLAYER_RADIUS.toFixed(2)}, HalfHeight=${(PLAYER_COLLISION_HEIGHT / 2).toFixed(2)}`);

    // --- Lighting ---
    const ambient = new BABYLON.HemisphericLight("ambient", new BABYLON.Vector3(0,1,0), scene); ambient.intensity=0.6; ambient.groundColor=new BABYLON.Color3(0.2,0.2,0.2);
    playerLight = new BABYLON.PointLight("playerLight", new BABYLON.Vector3(0,1,0), scene); playerLight.intensity=0.8; playerLight.range=8*CELL_SIZE*MAZE_GRID_SCALE; playerLight.diffuse=new BABYLON.Color3(0.8,0.8,0.7);

    // --- Fog ---
    scene.fogMode=BABYLON.Scene.FOGMODE_LINEAR; scene.fogColor=new BABYLON.Color3(0,0.01,0);
    scene.fogStart=CELL_SIZE*MAZE_GRID_SCALE*4; scene.fogEnd=CELL_SIZE*MAZE_GRID_SCALE*12;
    console.log(` Fog Start: ${scene.fogStart.toFixed(1)}, Fog End: ${scene.fogEnd.toFixed(1)}`);

    console.log("BJS [environment.js]: Scene, Camera, Lights created.");
    return scene;
}


// =============================================================================
// Coordinate Conversion Helpers - CORRECTED TYPOS
// =============================================================================
function worldToGrid(worldX, worldZ) {
    const visualGridWidthTotal = MAZE_WIDTH_CELLS * MAZE_GRID_SCALE;
    const visualGridHeightTotal = MAZE_HEIGHT_CELLS * MAZE_GRID_SCALE;
    const visualGridXFloat = (worldX / CELL_SIZE) + (visualGridWidthTotal / 2);
    const visualGridZFloat = (worldZ / CELL_SIZE) + (visualGridHeightTotal / 2);
    const logicalGridX = Math.floor(visualGridXFloat / MAZE_GRID_SCALE);
    const logicalGridY = Math.floor(visualGridZFloat / MAZE_GRID_SCALE);
    const clampedX = Math.max(0, Math.min(MAZE_WIDTH_CELLS - 1, logicalGridX));
    const clampedY = Math.max(0, Math.min(MAZE_HEIGHT_CELLS - 1, logicalGridY));
    return { x: clampedX, y: clampedY };
}
function gridToWorld(gridX, gridY) {
    const worldX = (gridX - MAZE_WIDTH_CELLS / 2 + 0.5) * MAZE_GRID_SCALE * CELL_SIZE;
    const worldZ = (gridY - MAZE_HEIGHT_CELLS / 2 + 0.5) * MAZE_GRID_SCALE * CELL_SIZE; // <-- Fixed typo here (was wz)
    return new BABYLON.Vector3(worldX, 0, worldZ);
}
function visualGridToWorldPos(visualGridX, visualGridY) {
    const visualGridWidthTotal = MAZE_WIDTH_CELLS * MAZE_GRID_SCALE;
    const visualGridHeightTotal = MAZE_HEIGHT_CELLS * MAZE_GRID_SCALE;
    const worldX = (visualGridX - visualGridWidthTotal / 2 + 0.5) * CELL_SIZE;
    const worldZ = (visualGridY - visualGridHeightTotal / 2 + 0.5) * CELL_SIZE; // <-- Fixed typo here (was wz)
    return new BABYLON.Vector3(worldX, 0, worldZ);
};


// =============================================================================
// Maze Generation Functions (DFS Algorithm - Unchanged Logic)
// =============================================================================
function initMazeGrid(){mazeGrid.length=0;for(let y=0;y<MAZE_HEIGHT_CELLS;y++){mazeGrid[y]=[];for(let x=0;x<MAZE_WIDTH_CELLS;x++){mazeGrid[y][x]={x:x,y:y,visited:false,walls:{top:true,bottom:true,left:true,right:true},isWall:true,isPath:false}}}console.log(`Initialized ${MAZE_HEIGHT_CELLS}x${MAZE_WIDTH_CELLS} grid.`);}
function getNeighbors(c){const n=[];const{x,y}=c;const p=[{x:x,y:y-2},{x:x,y:y+2},{x:x-2,y:y},{x:x+2,y:y}];for(const i of p){if(i.y>=0&&i.y<MAZE_HEIGHT_CELLS&&i.x>=0&&i.x<MAZE_WIDTH_CELLS){const nb=mazeGrid[i.y]?.[i.x];if(nb&&!nb.visited){n.push(nb)}}}return n}
function removeWall(c1,c2){const dx=c1.x-c2.x;const dy=c1.y-c2.y;let wx,wy;if(dx===2){wx=c1.x-1;wy=c1.y;c1.walls.left=false;c2.walls.right=false}else if(dx===-2){wx=c1.x+1;wy=c1.y;c1.walls.right=false;c2.walls.left=false}else if(dy===2){wx=c1.x;wy=c1.y-1;c1.walls.top=false;c2.walls.bottom=false}else if(dy===-2){wx=c1.x;wy=c1.y+1;c1.walls.bottom=false;c2.walls.top=false}if(wx!==undefined&&wy!==undefined&&mazeGrid[wy]?.[wx]){const wc=mazeGrid[wy][wx];wc.isWall=false;wc.isPath=true;if(dx===2||dx===-2){wc.walls.left=false;wc.walls.right=false}if(dy===2||dy===-2){wc.walls.top=false;wc.walls.bottom=false}}else{console.warn(`No wall cell ${c1.x},${c1.y} ${c2.x},${c2.y}`);}}
function generateMaze(s){console.log(`Generating maze data...`);const t=[];s.visited=true;s.isWall=false;s.isPath=true;t.push(s);while(t.length>0){const c=t.pop();const n=getNeighbors(c);if(n.length>0){t.push(c);const h=n[Math.floor(Math.random()*n.length)];removeWall(c,h);h.visited=true;h.isWall=false;h.isPath=true;t.push(h)}}console.log("Maze data generated.");}
function addCrossConnections(chance){console.log(`Adding cross connections (${chance*100}%)...`);let added=0;for(let y=0;y<MAZE_HEIGHT_CELLS;y++){for(let x=0;x<MAZE_WIDTH_CELLS;x++){const c=mazeGrid[y]?.[x];if(!c||!c.isPath)continue;if(c.walls.right&&x<MAZE_WIDTH_CELLS-2){const wx=x+1;const tx=x+2;if(mazeGrid[y]?.[wx]?.isPath&&mazeGrid[y]?.[tx]?.isPath){if(Math.random()<chance){c.walls.right=false;mazeGrid[y][wx].walls.left=false;added++}}}if(c.walls.bottom&&y<MAZE_HEIGHT_CELLS-2){const wy=y+1;const ty=y+2;if(mazeGrid[wy]?.[x]?.isPath&&mazeGrid[ty]?.[x]?.isPath){if(Math.random()<chance){c.walls.bottom=false;mazeGrid[wy][x].walls.top=false;added++}}}}}console.log(`Added ${added} cross connections.`);}


// =============================================================================
// A* Pathfinding Implementation (Corrected Formatting v2)
// =============================================================================
class SimplePriorityQueue { constructor() { this._nodes = []; } enqueue(priority, key) { this._nodes.push({ key: key, priority: priority }); this.sort(); } dequeue() { return this._nodes.shift().key; } isEmpty() { return !this._nodes.length; } sort() { this._nodes.sort((a, b) => a.priority - b.priority); } }
function heuristic(a, b) { return Math.abs(a.x - b.x) + Math.abs(a.y - b.y); }
function findPathAStar(grid, start, goal, maxCells = MAZE_WIDTH_CELLS * MAZE_HEIGHT_CELLS * 4) { const openSet = new SimplePriorityQueue(); if (!grid || !start || !goal || !grid[start.y]?.[start.x]?.isPath || !grid[goal.y]?.[goal.x]?.isPath) { console.warn(`A* pathfinding: Invalid start (${start?.x},${start?.y}) or goal (${goal?.x},${goal?.y}) cell, or cell is not a path.`); return null; } const startKey = `${start.x},${start.y}`; openSet.enqueue(0, startKey); const cameFrom = new Map(); const gScore = new Map(); gScore.set(startKey, 0); const fScore = new Map(); fScore.set(startKey, heuristic(start, goal)); let visitedCount = 0; while (!openSet.isEmpty()) { if (visitedCount > maxCells) { console.warn("A* pathfinding exceeded maxCells limit."); return null; } const currentKey = openSet.dequeue(); const currentCoords = currentKey.split(','); const current = { x: parseInt(currentCoords[0]), y: parseInt(currentCoords[1]) }; if (current.x === goal.x && current.y === goal.y) { const path = []; let tempKey = currentKey; let safety = 0; const maxPathLen = MAZE_WIDTH_CELLS * MAZE_HEIGHT_CELLS; while (tempKey && safety < maxPathLen) { const coordsArr = tempKey.split(','); path.push({ x: parseInt(coordsArr[0]), y: parseInt(coordsArr[1]) }); tempKey = cameFrom.get(tempKey); safety++; } if (safety >= maxPathLen) { console.error("A* Path reconstruction failed."); return null; } return path.reverse(); } visitedCount++; const currentCell = grid[current.y]?.[current.x]; if (!currentCell || !currentCell.isPath) continue; const neighbors = []; const potentialMoves = [{ dx: 0, dy: -1, wall: 'top' }, { dx: 0, dy: 1, wall: 'bottom' }, { dx: -1, dy: 0, wall: 'left' }, { dx: 1, dy: 0, wall: 'right' }]; for (const move of potentialMoves) { const nx = current.x + move.dx; const ny = current.y + move.dy; if (ny >= 0 && ny < MAZE_HEIGHT_CELLS && nx >= 0 && nx < MAZE_WIDTH_CELLS) { const neighborCell = grid[ny]?.[nx]; if (neighborCell && neighborCell.isPath && !currentCell.walls[move.wall]) { neighbors.push({ x: nx, y: ny }); } } } for (const neighbor of neighbors) { const neighborKey = `${neighbor.x},${neighbor.y}`; const tentativeGScore = (gScore.get(currentKey) || 0) + 1; if (tentativeGScore < (gScore.get(neighborKey) || Infinity)) { cameFrom.set(neighborKey, currentKey); gScore.set(neighborKey, tentativeGScore); const neighborFScore = tentativeGScore + heuristic(neighbor, goal); fScore.set(neighborKey, neighborFScore); openSet.enqueue(neighborFScore, neighborKey); } } } console.warn(`A* pathfinding failed to find path from (${start.x},${start.y}) to (${goal.x},${goal.y})`); return null; }
function gridPathToWorldPath(gridPath){if(!gridPath)return[];return gridPath.map(cell=>{const worldPos=gridToWorld(cell.x,cell.y);worldPos.y=AGENT_BODY_HEIGHT*0.1;return worldPos})}
function findRandomReachableCell(){const maxAttempts=MAZE_WIDTH_CELLS*MAZE_HEIGHT_CELLS*2;let attempts=0;let pathExists=false;for(let y=0;y<MAZE_HEIGHT_CELLS&&!pathExists;y++){for(let x=0;x<MAZE_WIDTH_CELLS&&!pathExists;x++){if(mazeGrid[y]?.[x]?.isPath){pathExists=true}}}if(!pathExists){console.error("findRandomReachableCell: No path cells found!");return null}while(attempts<maxAttempts){const x=Math.floor(Math.random()*MAZE_WIDTH_CELLS);const y=Math.floor(Math.random()*MAZE_HEIGHT_CELLS);const cell=mazeGrid[y]?.[x];if(cell&&cell.isPath===true){return{x:x,y:y}}attempts++}console.warn(`findRandomReachableCell: Random attempts failed. Searching sequentially...`);for(let y=0;y<MAZE_HEIGHT_CELLS;y++){for(let x=0;x<MAZE_WIDTH_CELLS;x++){const cell=mazeGrid[y]?.[x];if(cell&&cell.isPath===true){return{x:x,y:y}}}}console.error("findRandomReachableCell: CRITICAL - Sequential search failed!");return null}


// =============================================================================
// Babylon.js Maze Geometry Creation (Restored Full Corridor Logic)
// =============================================================================
function createMazeGeometry_BJS() {
    console.log("BJS [environment.js]: Creating Maze Geometry (v1.47s - Coord Fix)..."); // Version updated
    if (!scene) { console.error("Scene not available!"); return; }

    // --- Materials ---
    const wallMat=new BABYLON.StandardMaterial("wallMat",scene);wallMat.diffuseColor=new BABYLON.Color3.FromHexString("#4d4d4d");wallMat.specularColor=new BABYLON.Color3(0.1,0.1,0.1);wallMat.emissiveColor=new BABYLON.Color3.FromHexString("#101010");wallMat.backFaceCulling=false;
    const floorMat=new BABYLON.StandardMaterial("floorCeilingMat",scene);floorMat.diffuseColor=new BABYLON.Color3.FromHexString("#6a6a6a");floorMat.specularColor=new BABYLON.Color3(0,0,0);floorMat.backFaceCulling=false;

    // --- Floor & Ceiling ---
    floorMesh_BJS = BABYLON.MeshBuilder.CreateGround("floor", {width: MAZE_WIDTH_UNITS, height: MAZE_HEIGHT_UNITS}, scene); floorMesh_BJS.position.y=0.01; floorMesh_BJS.material=floorMat; floorMesh_BJS.checkCollisions=true;
    ceilingMesh_BJS = BABYLON.MeshBuilder.CreatePlane("ceiling", {width: MAZE_WIDTH_UNITS, height: MAZE_HEIGHT_UNITS}, scene); ceilingMesh_BJS.position.y=WALL_HEIGHT; ceilingMesh_BJS.rotation.x=Math.PI; ceilingMesh_BJS.material=floorMat; ceilingMesh_BJS.checkCollisions=true;

    // --- Wall Template ---
    const wallTpl=BABYLON.MeshBuilder.CreateBox("wallTpl", {width: WALL_THICKNESS, height: WALL_HEIGHT, depth: WALL_THICKNESS}, scene); wallTpl.material=wallMat;
    wallTpl.isVisible = false; // TEMPLATE MUST BE INVISIBLE
    wallTpl.checkCollisions = true;

    // --- Instance Creation (Corridor Logic) ---
    const matrices = []; let wallCount = 0; const wallYPos = WALL_HEIGHT/2;
    console.log("Calculating wall instances...");
    for (let y=0; y<MAZE_HEIGHT_CELLS; y++){ for(let x=0; x<MAZE_WIDTH_CELLS; x++){ const c=mazeGrid[y]?.[x]; if(!c||!c.isPath) continue; const hS=(MAZE_GRID_SCALE-1)/2; if(c.walls.top){ for(let i=-hS; i<=hS; i++){ const vX=x*MAZE_GRID_SCALE+hS+i; const vY=y*MAZE_GRID_SCALE; const wP=visualGridToWorldPos(vX,vY); matrices.push(BABYLON.Matrix.Translation(wP.x,wallYPos,wP.z)); wallCount++;}} if(c.walls.bottom){ for(let i=-hS; i<=hS; i++){ const vX=x*MAZE_GRID_SCALE+hS+i; const vY=(y+1)*MAZE_GRID_SCALE-1; const wP=visualGridToWorldPos(vX,vY); matrices.push(BABYLON.Matrix.Translation(wP.x,wallYPos,wP.z)); wallCount++;}} if(c.walls.left){ const sY=c.walls.top?-hS+1:-hS; const eY=c.walls.bottom?hS-1:hS; for(let i=sY; i<=eY; i++){ const vX=x*MAZE_GRID_SCALE; const vY=y*MAZE_GRID_SCALE+hS+i; const wP=visualGridToWorldPos(vX,vY); matrices.push(BABYLON.Matrix.Translation(wP.x,wallYPos,wP.z)); wallCount++;}} if(c.walls.right){ const sY=c.walls.top?-hS+1:-hS; const eY=c.walls.bottom?hS-1:hS; for(let i=sY; i<=eY; i++){ const vX=(x+1)*MAZE_GRID_SCALE-1; const vY=y*MAZE_GRID_SCALE+hS+i; const wP=visualGridToWorldPos(vX,vY); matrices.push(BABYLON.Matrix.Translation(wP.x,wallYPos,wP.z)); wallCount++;}} }}
    // Outer Border
    const vW=MAZE_WIDTH_CELLS*MAZE_GRID_SCALE; const vH=MAZE_HEIGHT_CELLS*MAZE_GRID_SCALE; const borderYPos = WALL_HEIGHT/2; for(let vx=-1;vx<=vW;vx++){ let wP=visualGridToWorldPos(vx,-1); matrices.push(BABYLON.Matrix.Translation(wP.x,borderYPos,wP.z)); wallCount++; wP=visualGridToWorldPos(vx,vH); matrices.push(BABYLON.Matrix.Translation(wP.x,borderYPos,wP.z)); wallCount++;} for(let vy=0;vy<vH;vy++){ let wP=visualGridToWorldPos(-1,vy); matrices.push(BABYLON.Matrix.Translation(wP.x,borderYPos,wP.z)); wallCount++; wP=visualGridToWorldPos(vW,vy); matrices.push(BABYLON.Matrix.Translation(wP.x,borderYPos,wP.z)); wallCount++;}

    // --- Apply Thin Instances ---
    console.log(`Total Walls Calculated: ${wallCount}`);
    if (wallTpl && matrices.length > 0) { console.log(`Applying ${matrices.length} matrices...`); wallTpl.thinInstanceAdd(matrices, true); wallTpl.freezeWorldMatrix(); console.log("Instances applied & frozen."); }
    else if(matrices.length === 0){ console.warn("No wall matrices generated!"); }
    else { console.error("Wall template missing!"); }
    console.log("BJS [environment.js]: Maze geometry instancing complete.");
}


// =============================================================================
// Player Start Position Logic (Restored Corridor Logic)
// =============================================================================
function findLongestCorridorAndSetPlayerStart_BJS() {
    // Corridor finding logic unchanged
    let longestCorridor = { start: null, end: null, length: 0, orientation: null }; for (let y=0; y<MAZE_HEIGHT_CELLS; y++) { for (let x=0; x<MAZE_WIDTH_CELLS; x++) { const isWallLeft = x===0||!mazeGrid[y]?.[x-1]?.isPath; if (mazeGrid[y]?.[x]?.isPath&&isWallLeft) { let currentLength=0; let currentX=x; while(currentX<MAZE_WIDTH_CELLS&&mazeGrid[y]?.[currentX]?.isPath){currentLength++; currentX++;} if(currentLength > longestCorridor.length){longestCorridor = {start:{x:x,y:y}, end:{x:currentX-1,y:y}, length:currentLength, orientation:'horizontal'};}}}} for(let x=0; x<MAZE_WIDTH_CELLS; x++){ for(let y=0; y<MAZE_HEIGHT_CELLS; y++){ const isWallAbove=y===0||!mazeGrid[y-1]?.[x]?.isPath; if (mazeGrid[y]?.[x]?.isPath&&isWallAbove){ let currentLength=0; let currentY=y; while(currentY<MAZE_HEIGHT_CELLS&&mazeGrid[currentY]?.[x]?.isPath){currentLength++; currentY++;} if(currentLength > longestCorridor.length){longestCorridor = {start:{x:x,y:y}, end:{x:x,y:currentY-1}, length:currentLength, orientation:'vertical'};}}}}
    let startWorldPos = gridToWorld(1, 1); let targetWorldPos = gridToWorld(1, 2);
    if (longestCorridor.length > 1) { const useStart = Math.random()<0.5; const startGrid = useStart ? longestCorridor.start : longestCorridor.end; const targetGrid = useStart ? longestCorridor.end : longestCorridor.start; startWorldPos = gridToWorld(startGrid.x, startGrid.y); targetWorldPos = gridToWorld(targetGrid.x, targetGrid.y); console.log(`Player target start grid: (${startGrid.x}, ${startGrid.y})`); } else { console.warn("Could not find suitable corridor, using default start."); }

    // Set position & check collision
    if (camera) {
        const startPosFinal = new BABYLON.Vector3(startWorldPos.x, PLAYER_EYE_HEIGHT, startWorldPos.z);
        camera.position = startPosFinal; camera.setTarget(new BABYLON.Vector3(targetWorldPos.x, PLAYER_EYE_HEIGHT, targetWorldPos.z)); playerPosition.copyFrom(camera.position);
        console.log(`Player start pos set to World(${startPosFinal.x.toFixed(1)}, ${startPosFinal.y.toFixed(1)}, ${startPosFinal.z.toFixed(1)})`);

        const origGrav = camera.applyGravity; const origColl = camera.checkCollisions;
        console.log(` Start check: Grav=${origGrav}, Coll=${origColl}`);
        camera.applyGravity = false; camera.checkCollisions = true;
        camera._collideWithWorld(new BABYLON.Vector3(0,0,0)); // Check
        if (startPosFinal.subtract(camera.position).lengthSquared() > 0.01) { console.warn(`Start pos ${startPosFinal.toString()} seems inside geometry. Cam moved to ${camera.position.toString()}.`); playerPosition.copyFrom(camera.position); }
        else { console.log("Start pos clear."); camera.position = startPosFinal; playerPosition.copyFrom(camera.position); }
        camera.applyGravity = origGrav;
        console.log(` Finish check: Grav=${camera.applyGravity}, Coll=${camera.checkCollisions}`);
    } else { console.error("Cannot set player start: Camera missing!"); }
}

// end of file