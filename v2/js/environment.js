// =============================================================================
// js/environment.js - Maze Generation, Geometry, Pathfinding, Scene Setup
// Version: 1.48e (Taller Walls, Wider Paths, Manual Jump) - CEILING FIX
// =============================================================================

// *** SET FLAG FOR WALL GEOMETRY VISIBILITY TEST ***
const CREATE_WALLS_GEOMETRY = true; // Ensure walls are created for this test

// Relies on constants from constants.js (v1.48e)
// Relies on globals from main.js: engine, scene, camera, playerLight, mazeGrid, floorMesh_BJS, ceilingMesh_BJS, playerPosition

// =============================================================================
// Babylon.js Scene Creation Function (CEILING ROTATION FIXED)
// =============================================================================
async function createScene(engine) {
    console.log("BJS [environment.js]: Creating Scene (v1.48e - Ceiling Fix)..."); // Version Updated
    if (!engine) { console.error("Engine missing!"); return null; }
    scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);

    // --- Camera ---
    camera = new BABYLON.UniversalCamera("playerCamera", new BABYLON.Vector3(0, PLAYER_EYE_HEIGHT, 0), scene);
    camera.speed = PLAYER_SPEED_WALK; camera.inertia = 0.0; camera.angularSensibility = BJS_ANGULAR_SENSITIVITY;
    camera.minZ = 0.1; camera.maxZ = Math.max(MAZE_WIDTH_UNITS, MAZE_HEIGHT_UNITS) * 1.5;
    camera.upperBetaLimit=Math.PI/2.1; camera.lowerBetaLimit=-Math.PI/2.1;
    camera.keysUp=PLAYER_KEYS_UP; camera.keysDown=PLAYER_KEYS_DOWN; camera.keysLeft=PLAYER_KEYS_LEFT; camera.keysRight=PLAYER_KEYS_RIGHT;

    // --- Collisions and Gravity ---
    console.log("Setting collisions and gravity...");
    scene.collisionsEnabled = true; camera.checkCollisions = true; camera.applyGravity = true;
    camera.ellipsoid = new BABYLON.Vector3(PLAYER_RADIUS, PLAYER_COLLISION_HEIGHT / 2, PLAYER_RADIUS);
    camera.ellipsoidOffset = new BABYLON.Vector3(0, PLAYER_COLLISION_HEIGHT / 2, 0);
    scene.gravity = new BABYLON.Vector3(0, MANUAL_GRAVITY, 0); // Use weaker manual gravity
    console.log(` Ellipsoid Set: Radius=${PLAYER_RADIUS.toFixed(2)}, HalfHeight=${(PLAYER_COLLISION_HEIGHT/2).toFixed(2)}`);

    camera.inputs.addKeyboard();

    // --- Lighting ---
    const ambient = new BABYLON.HemisphericLight("ambient", new BABYLON.Vector3(0,1,0), scene); ambient.intensity=0.7; ambient.groundColor=new BABYLON.Color3(0.2,0.2,0.2);
    playerLight = new BABYLON.PointLight("playerLight", new BABYLON.Vector3(0,1,0), scene); playerLight.intensity=0.9; playerLight.range = 8 * CELL_SIZE * MAZE_GRID_SCALE; playerLight.diffuse = new BABYLON.Color3(0.9, 0.9, 0.8);

    // --- Fog ---
    scene.fogMode=BABYLON.Scene.FOGMODE_LINEAR; scene.fogColor=new BABYLON.Color3(0,0.01,0);
    scene.fogStart=CELL_SIZE*MAZE_GRID_SCALE*6; scene.fogEnd=CELL_SIZE*MAZE_GRID_SCALE*18;
    console.log(` Fog Start: ${scene.fogStart.toFixed(1)}, Fog End: ${scene.fogEnd.toFixed(1)}`);

    console.log("BJS [environment.js]: Scene, Camera, Lights created.");
    return scene;
}

// Coordinate Conversion Helpers... (Unchanged from v1.47s)
function worldToGrid(wX, wZ){const vw=MAZE_WIDTH_CELLS*MAZE_GRID_SCALE; const vh=MAZE_HEIGHT_CELLS*MAZE_GRID_SCALE; const vx=(wX/CELL_SIZE)+(vw/2); const vz=(wZ/CELL_SIZE)+(vh/2); const lx=Math.floor(vx/MAZE_GRID_SCALE); const ly=Math.floor(vz/MAZE_GRID_SCALE); const cx=Math.max(0,Math.min(MAZE_WIDTH_CELLS-1,lx)); const cy=Math.max(0,Math.min(MAZE_HEIGHT_CELLS-1,ly)); return{x:cx, y:cy};}
function gridToWorld(gX, gY){const wx=(gX-MAZE_WIDTH_CELLS/2+0.5)*MAZE_GRID_SCALE*CELL_SIZE; const wz=(gY-MAZE_HEIGHT_CELLS/2+0.5)*MAZE_GRID_SCALE*CELL_SIZE; return new BABYLON.Vector3(wx,0,wz);}
function visualGridToWorldPos(vX, vY){const vw=MAZE_WIDTH_CELLS*MAZE_GRID_SCALE; const vh=MAZE_HEIGHT_CELLS*MAZE_GRID_SCALE; const wx=(vX-vw/2+0.5)*CELL_SIZE; const wz=(vY-vh/2+0.5)*CELL_SIZE; return new BABYLON.Vector3(wx,0,wz);}

// Maze Generation Functions... (Unchanged from v1.47s)
function initMazeGrid(){mazeGrid.length=0;/* ... */}
function getNeighbors(c){const n=[];/* ... */}
function removeWall(c1,c2){/* ... */}
function generateMaze(startCell) { /* ... */ }
function addCrossConnections(chance){ /* ... */}

// A* Pathfinding Implementation... (Unchanged from v1.47r)
class SimplePriorityQueue{constructor(){this._nodes=[]}enqueue(p,k){this._nodes.push({key:k,priority:p});this.sort()}dequeue(){return this._nodes.shift().key}isEmpty(){return!this._nodes.length}sort(){this._nodes.sort((a,b)=>a.priority-b.priority)}}
function heuristic(a,b){return Math.abs(a.x-b.x)+Math.abs(a.y-b.y)}
function findPathAStar(grid,start,goal,maxCells=10000){/* ... */}
function gridPathToWorldPath(gridPath){if(!gridPath)return[];return gridPath.map(cell=>{const worldPos=gridToWorld(cell.x,cell.y);worldPos.y=AGENT_BODY_HEIGHT*0.1;return worldPos})}
function findRandomReachableCell(){const maxAttempts=MAZE_WIDTH_CELLS*MAZE_HEIGHT_CELLS*2;let attempts=0;let pathExists=false;for(let y=0;y<MAZE_HEIGHT_CELLS&&!pathExists;y++){for(let x=0;x<MAZE_WIDTH_CELLS&&!pathExists;x++){if(mazeGrid[y]?.[x]?.isPath){pathExists=true}}}if(!pathExists){console.error("findRandomReachableCell: No path cells found!");return null}while(attempts<maxAttempts){const x=Math.floor(Math.random()*MAZE_WIDTH_CELLS);const y=Math.floor(Math.random()*MAZE_HEIGHT_CELLS);const cell=mazeGrid[y]?.[x];if(cell&&cell.isPath===true){return{x:x,y:y}}attempts++}console.warn(`findRandomReachableCell: Random attempts failed. Searching sequentially...`);for(let y=0;y<MAZE_HEIGHT_CELLS;y++){for(let x=0;x<MAZE_WIDTH_CELLS;x++){const cell=mazeGrid[y]?.[x];if(cell&&cell.isPath===true){return{x:x,y:y}}}}console.error("findRandomReachableCell: CRITICAL - Sequential search failed!");return null}


// =============================================================================
// Babylon.js Maze Geometry Creation (Regular Meshes - Wider Paths)
// =============================================================================
function createMazeGeometry_BJS() {
    console.log("BJS [environment.js]: Creating Maze Geometry (v1.48e)..."); // Version Updated
    if (!scene) { console.error("Scene not available!"); return; }

    // --- Materials ---
    const wallMat = new BABYLON.StandardMaterial("wallMat", scene);
    wallMat.diffuseColor=new BABYLON.Color3.FromHexString("#4d4d4d"); wallMat.specularColor=new BABYLON.Color3(0.1,0.1,0.1); wallMat.emissiveColor=new BABYLON.Color3.FromHexString("#101010"); wallMat.backFaceCulling=false;
    const floorMat = new BABYLON.StandardMaterial("floorCeilingMat", scene); floorMat.diffuseColor=new BABYLON.Color3.FromHexString("#555555"); floorMat.specularColor=new BABYLON.Color3(0,0,0); floorMat.backFaceCulling=false;

    // --- Floor & Ceiling ---
    floorMesh_BJS = BABYLON.MeshBuilder.CreateGround("floor", {width: MAZE_WIDTH_UNITS, height: MAZE_HEIGHT_UNITS}, scene); floorMesh_BJS.position.y = 0.01; floorMesh_BJS.material = floorMat; floorMesh_BJS.checkCollisions = true;
    ceilingMesh_BJS = BABYLON.MeshBuilder.CreatePlane("ceiling", {width: MAZE_WIDTH_UNITS, height: MAZE_HEIGHT_UNITS}, scene);
    ceilingMesh_BJS.position.y = WALL_HEIGHT;
    // *** CORRECTED CEILING ROTATION ***
    ceilingMesh_BJS.rotation.x = Math.PI; // Rotate to face downwards as ceiling
    ceilingMesh_BJS.material = floorCeilingMaterial_BJS;
    ceilingMesh_BJS.checkCollisions = true; // Enable ceiling collisions

    // --- Wall Creation (Regular Meshes) ---
    if (CREATE_WALLS_GEOMETRY) {
        console.warn("!!! USING SLOW REGULAR MESHES FOR WALLS (DEBUG) !!!");
        const wallMeshes = []; let wallCount = 0; const wallYPos = WALL_HEIGHT/2;
        console.log("Creating individual wall meshes...");
        for (let y=0; y<MAZE_HEIGHT_CELLS; y++){ for(let x=0; x<MAZE_WIDTH_CELLS; x++){ const c=mazeGrid[y]?.[x]; if(!c||!c.isPath) continue; const hS=(MAZE_GRID_SCALE-1)/2; if(c.walls.top){ for(let i=-hS; i<=hS; i++){ const vX=x*MAZE_GRID_SCALE+hS+i; const vY=y*MAZE_GRID_SCALE; const wP=visualGridToWorldPos(vX,vY); const wall=BABYLON.MeshBuilder.CreateBox(`wall_${wallCount++}`,{width:WALL_THICKNESS,height:WALL_HEIGHT,depth:WALL_THICKNESS}, scene); wall.position = new BABYLON.Vector3(wP.x,wallYPos,wP.z); wall.material=wallMat; wall.checkCollisions=true; wallMeshes.push(wall);}} if(c.walls.bottom){ for(let i=-hS; i<=hS; i++){ const vX=x*MAZE_GRID_SCALE+hS+i; const vY=(y+1)*MAZE_GRID_SCALE-1; const wP=visualGridToWorldPos(vX,vY); const wall=BABYLON.MeshBuilder.CreateBox(`wall_${wallCount++}`,{width:WALL_THICKNESS,height:WALL_HEIGHT,depth:WALL_THICKNESS}, scene); wall.position = new BABYLON.Vector3(wP.x,wallYPos,wP.z); wall.material=wallMat; wall.checkCollisions=true; wallMeshes.push(wall);}} if(c.walls.left){ const sY=c.walls.top?-hS+1:-hS; const eY=c.walls.bottom?hS-1:hS; for(let i=sY; i<=eY; i++){ const vX=x*MAZE_GRID_SCALE; const vY=y*MAZE_GRID_SCALE+hS+i; const wP=visualGridToWorldPos(vX,vY); const wall=BABYLON.MeshBuilder.CreateBox(`wall_${wallCount++}`,{width:WALL_THICKNESS,height:WALL_HEIGHT,depth:WALL_THICKNESS}, scene); wall.position = new BABYLON.Vector3(wP.x,wallYPos,wP.z); wall.material=wallMat; wall.checkCollisions=true; wallMeshes.push(wall);}} if(c.walls.right){ const sY=c.walls.top?-hS+1:-hS; const eY=c.walls.bottom?hS-1:hS; for(let i=sY; i<=eY; i++){ const vX=(x+1)*MAZE_GRID_SCALE-1; const vY=y*MAZE_GRID_SCALE+hS+i; const wP=visualGridToWorldPos(vX,vY); const wall=BABYLON.MeshBuilder.CreateBox(`wall_${wallCount++}`,{width:WALL_THICKNESS,height:WALL_HEIGHT,depth:WALL_THICKNESS}, scene); wall.position = new BABYLON.Vector3(wP.x,wallYPos,wP.z); wall.material=wallMat; wall.checkCollisions=true; wallMeshes.push(wall);}} }}
    const vW=MAZE_WIDTH_CELLS*MAZE_GRID_SCALE; const vH=MAZE_HEIGHT_CELLS*MAZE_GRID_SCALE; const borderYPos = WALL_HEIGHT/2; for(let vx=-1;vx<=vW;vx++){ let wP=visualGridToWorldPos(vx,-1); let wall=BABYLON.MeshBuilder.CreateBox(`wall_${wallCount++}`,{width:WALL_THICKNESS,height:WALL_HEIGHT,depth:WALL_THICKNESS}, scene); wall.position=new BABYLON.Vector3(wP.x,borderYPos,wP.z); wall.material=wallMat; wall.checkCollisions=true; wallMeshes.push(wall); wP=visualGridToWorldPos(vx,vH); wall=BABYLON.MeshBuilder.CreateBox(`wall_${wallCount++}`,{width:WALL_THICKNESS,height:WALL_HEIGHT,depth:WALL_THICKNESS}, scene); wall.position=new BABYLON.Vector3(wP.x,borderYPos,wP.z); wall.material=wallMat; wall.checkCollisions=true; wallMeshes.push(wall);} for(let vy=0;vy<vH;vy++){ let wP=visualGridToWorldPos(-1,vy); let wall=BABYLON.MeshBuilder.CreateBox(`wall_${wallCount++}`,{width:WALL_THICKNESS,height:WALL_HEIGHT,depth:WALL_THICKNESS}, scene); wall.position=new BABYLON.Vector3(wP.x,borderYPos,wZ); wall.material=wallMat; wall.checkCollisions=true; wallMeshes.push(wall); wP=visualGridToWorldPos(vW,vy); wall=BABYLON.MeshBuilder.CreateBox(`wall_${wallCount++}`,{width:WALL_THICKNESS,height:WALL_HEIGHT,depth:WALL_THICKNESS}, scene); wall.position=new BABYLON.Vector3(wP.x,borderYPos,wP.z); wall.material=wallMat; wall.checkCollisions=true; wallMeshes.push(wall);}

    console.log(`Created ${wallCount} individual wall meshes.`);
    console.log("BJS [environment.js]: Maze geometry using REGULAR MESHES complete.");
}


// =============================================================================
// Player Start Position Logic (Spawn Higher)
// =============================================================================
function findLongestCorridorAndSetPlayerStart_BJS() {
    let longestCorridor={start:null,end:null,length:0,orientation:null}; /* ... corridor finding ... */ for(let y=0;y<MAZE_HEIGHT_CELLS;y++){for(let x=0;x<MAZE_WIDTH_CELLS;x++){const l=x===0||!mazeGrid[y]?.[x-1]?.isPath;if(mazeGrid[y]?.[x]?.isPath&&l){let curL=0;let curX=x;while(curX<MAZE_WIDTH_CELLS&&mazeGrid[y]?.[curX]?.isPath){curL++;curX++}if(curL>longestCorridor.length){longestCorridor={start:{x:x,y:y},end:{x:curX-1,y:y},length:curL,orientation:'h'}}}}}for(let x=0;x<MAZE_WIDTH_CELLS;x++){for(let y=0;y<MAZE_HEIGHT_CELLS;y++){const a=y===0||!mazeGrid[y-1]?.[x]?.isPath;if(mazeGrid[y]?.[x]?.isPath&&a){let curL=0;let curY=y;while(curY<MAZE_HEIGHT_CELLS&&mazeGrid[curY]?.[x]?.isPath){curL++;curY++}if(curL>longestCorridor.length){longestCorridor={start:{x:x,y:y},end:{x:x,y:curY-1},length:curL,orientation:'v'}}}}}
    let startWorldPos = gridToWorld(1,1); let targetWorldPos=gridToWorld(1,2);
    if(longestCorridor.length>1){const useStart=Math.random()<0.5;const sG=useStart?longestCorridor.start:longestCorridor.end;const tG=useStart?longestCorridor.end:longestCorridor.start;startWorldPos=gridToWorld(sG.x,sG.y);targetWorldPos=gridToWorld(tG.x,tG.y);console.log(`Player start grid:(${sG.x},${sG.y})`)}else{console.warn("No suitable corridor, using default start.")}

    if(camera){
        // *** START EVEN HIGHER ***
        const startY = PLAYER_EYE_HEIGHT + 2.0; // Start 2.0 units above eye height
        const startPosFinal = new BABYLON.Vector3(startWorldPos.x, startY, startWorldPos.z);

        camera.position = startPosFinal;
        camera.setTarget(targetWorldPos);
        playerPosition.copyFrom(camera.position);
        console.log(`Player start pos set even higher at World(${startPosFinal.x.toFixed(1)}, ${startPosFinal.y.toFixed(1)}, ${startPosFinal.z.toFixed(1)})`);

        // Collision check (keep for now)
        const origGrav=camera.applyGravity; const origColl=camera.checkCollisions;
        console.log(` Start check: Grav=${origGrav}, Coll=${origColl}`);
        camera.applyGravity=false; camera.checkCollisions=true;
        camera._collideWithWorld(new BABYLON.Vector3(0,0,0));
        if(startPosFinal.subtract(camera.position).lengthSquared()>0.01){console.warn(`Start pos moved by collision check to ${camera.position.toString()}.`);playerPosition.copyFrom(camera.position);}
        else{console.log("Start position still clear.");camera.position = startPosFinal; playerPosition.copyFrom(camera.position);}
        camera.applyGravity=origGrav;
        console.log(` Finish check: Grav=${camera.applyGravity}, Coll=${camera.checkCollisions}`);
    } else { console.error("Cannot set player start: Camera missing!"); }
}

// end of file