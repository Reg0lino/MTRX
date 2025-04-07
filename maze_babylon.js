// maze_babylon.js
// Version: 1.43b (Babylon.js Migration - Initial Setup & Reusable Logic)

// =============================================================================
// Game Constants (Ported from Three.js version, Path Width Setting included)
// =============================================================================
// --- Maze ---
// ADJUSTABLE PATH WIDTH: Set from 1 (narrowest ~3 visual units) to 10 (widest ~21 visual units)
const PATH_WIDTH_SETTING = 5; // <-- YOU CAN EDIT THIS VALUE (Range 1-10 recommended)

// MAZE_GRID_SCALE is now calculated based on PATH_WIDTH_SETTING
// Scale determines how many visual grid cells represent one logical maze cell.
// Formula ensures scale is always odd, starting from 3 (1*2+1) up to 21 (10*2+1)
const MAZE_GRID_SCALE = Math.max(3, Math.floor(PATH_WIDTH_SETTING) * 2 + 1);
console.log(`Path Width Setting: ${PATH_WIDTH_SETTING}, Resulting Grid Scale: ${MAZE_GRID_SCALE}`);

const MAZE_WIDTH_CELLS = 12;  // Logical grid width
const MAZE_HEIGHT_CELLS = 12; // Logical grid height
const CELL_SIZE = 10; // Size of one *visual* grid cell in world units

// Total maze dimensions in world units, depends on logical cells, visual scale, and cell size
const MAZE_WIDTH_UNITS = MAZE_WIDTH_CELLS * MAZE_GRID_SCALE * CELL_SIZE;
const MAZE_HEIGHT_UNITS = MAZE_HEIGHT_CELLS * MAZE_GRID_SCALE * CELL_SIZE;

const WALL_HEIGHT = 30; // Standard wall height
const WALL_HEIGHT_SHORT = 8; // Height for randomly shortened internal walls
const WALL_THICKNESS = CELL_SIZE; // Visual wall thickness (matches visual cell size)
const SHORT_WALL_CHANCE = 0.08; // Chance for an internal wall segment to be short
const CROSS_CONNECTION_CHANCE = 0.25; // Chance to add extra paths after initial generation
const DOOR_HEIGHT_FACTOR = 0.85; // Door height relative to wall height
const DOOR_WIDTH_FACTOR = 0.4; // Door width relative to *scaled* cell width
const DOOR_DEPTH = 0.3; // Door thickness
const DOOR_SPACING = 1; // (Not actively used, but kept for potential future use)

// Recalculated max instances based on *visual* grid size, add buffer.
const visualGridWidth = MAZE_WIDTH_CELLS * MAZE_GRID_SCALE;
const visualGridHeight = MAZE_HEIGHT_CELLS * MAZE_GRID_SCALE;
// NOTE: Babylon instancing might handle this differently, but keep for potential reference
const MAX_WALL_INSTANCES = Math.ceil(visualGridWidth * visualGridHeight * 1.2);
console.log(`Visual Grid: ${visualGridWidth}x${visualGridHeight}, Max Wall Instances Ref: ${MAX_WALL_INSTANCES}`);

// --- Player ---
const PLAYER_HEIGHT = WALL_HEIGHT * 0.5; // Used for camera Y pos, potential ellipsoid height
const PLAYER_RADIUS = 8.0; // Used for collision ellipsoid radius, agent distance checks
const PLAYER_MAX_HP = 100;
const PLAYER_SPEED_WALK = 25.0; // Will be applied to Babylon camera speed
const PLAYER_SPEED_RUN = 50.0;  // Will be applied to Babylon camera speed
// Raycasting constants might be replaced by Babylon's collision system/ellipsoid
// const RAYCAST_ORIGIN_Y_FACTOR = 0.5;
// const RAYCAST_DISTANCE_BUFFER = PLAYER_RADIUS * 1.05;
// const PENETRATION_RESOLUTION_FACTOR = 1.1;
const DAMAGE_OVERLAY_FADE_OUT_TIME = 80;
const DAMAGE_OVERLAY_FADE_IN_TIME = 80;
const PLAYER_DAMAGE_SHAKE_DURATION = 0.15; // Shake logic needs adapting
const PLAYER_DAMAGE_SHAKE_INTENSITY_POS = 0.10;
const PLAYER_DAMAGE_SHAKE_INTENSITY_ROT = 0.008;

// --- Gun ---
const GUN_CLIP_SIZE = 12;
const GUN_RELOAD_TIME = 1.5;
const GUN_FIRE_RATE = 0.15;
// Recoil logic needs adapting to Babylon camera/mesh manipulation
// const GUN_RECOIL_AMOUNT_POS = 0.03;
// const GUN_RECOIL_AMOUNT_ROT = 0.05;
// const GUN_RECOIL_RECOVERY_TIME = 0.1;
// const GUN_RELOAD_ANIM_DOWN_POS = -0.1;
// const GUN_RELOAD_ANIM_ROT = Math.PI / 12;
// Gun positioning relative to camera needs Babylon implementation
// const gunBasePosition = new THREE.Vector3(0.35, -0.3, -0.7);
// const gunBaseRotation = new THREE.Euler(0, -Math.PI / 36, 0);

// --- Bullet ---
const BULLET_SPEED = 800.0;
const BULLET_SIZE = 0.08; // Diameter for Babylon sphere
const AGENT_BULLET_SIZE = 0.3; // Diameter for Babylon sphere
const BULLET_LIFESPAN = 2.0;
// Particle system parameters need adapting to Babylon ParticleSystem
// const PARTICLE_COUNT_PER_BULLET = 10;
// const PARTICLE_LIFESPAN = 0.25;
// const PARTICLE_SIZE = 0.10;

// --- Agent ---
const STARTING_AGENT_COUNT = 1; // Current agent count (as requested)
const AGENT_SPEED_PATROL = 10.0; // Needs applying to agent movement logic
const AGENT_SPEED_ATTACK = 20.0;
const AGENT_HP = 2;
const AGENT_BODY_WIDTH = PLAYER_RADIUS * 0.5; // Dimensions for Babylon meshes
const AGENT_BODY_HEIGHT = PLAYER_HEIGHT * 0.9;
const AGENT_BODY_DEPTH_FACTOR = 0.5;
const AGENT_HEAD_SIZE = PLAYER_RADIUS * 0.7;
const AGENT_ARM_LENGTH = AGENT_BODY_HEIGHT * 0.55;
const AGENT_ARM_WIDTH = AGENT_BODY_WIDTH * 0.25;
const AGENT_GUN_LENGTH = AGENT_ARM_WIDTH * 3;
const AGENT_GUN_WIDTH = AGENT_ARM_WIDTH * 1.5;
// Animation parameters need adapting
// const AGENT_SWAY_AMOUNT = Math.PI / 10;
// const AGENT_SWAY_SPEED = 5.0;
const AGENT_STUCK_TIMEOUT = 4.0; // Pathfinding timeout logic remains
const AGENT_COLLISION_DISTANCE = PLAYER_RADIUS + AGENT_BODY_WIDTH * 0.8; // Distance check remains
const AGENT_HIT_COLOR = 0xff0000; // Color value can be used with Babylon materials
const AGENT_HIT_DURATION = 0.15;
const AGENT_HP_BAR_DURATION = 3.0;
const AGENT_HP_BAR_WIDTH = AGENT_HEAD_SIZE * 1.5; // Used for potential GUI HP bar

// --- Agent AI ---
const AGENT_LOS_CHECK_INTERVAL = 0.25;
const AGENT_MAX_VIEW_DISTANCE = CELL_SIZE * MAZE_GRID_SCALE * 6; // View distance scales slightly with path width
const AGENT_TIME_TO_LOSE_TARGET = 1.5;
const AGENT_SEARCH_DURATION = 6.0;
const AGENT_TURN_SPEED = Math.PI * 1.5; // Needs adapting to Babylon rotation methods
const AGENT_FIRE_RATE = 0.7;
const AGENT_BULLET_SPEED = 800.0;
const AGENT_BULLET_DAMAGE = 12;
const AGENT_BULLET_SPREAD = 0.04; // Angle spread for bullet direction vector
const AGENT_MELEE_RANGE = PLAYER_RADIUS + AGENT_BODY_WIDTH * 1.8;
const AGENT_MELEE_DAMAGE = 8;
const AGENT_MELEE_COOLDOWN = 1.5;
const AGENT_MELEE_BURST_COUNT_MIN = 2;
const AGENT_MELEE_BURST_COUNT_MAX = 4;
const AGENT_MELEE_BURST_INTERVAL = 0.2;
// Muzzle offset relative to gun mesh needs adapting
// const AGENT_GUN_MUZZLE_FORWARD_OFFSET = AGENT_GUN_LENGTH * 0.8;
const AGENT_TARGET_CELL_RECALC_INTERVAL = 0.5; // A* recalc timer logic remains
const AGENT_WAYPOINT_THRESHOLD = CELL_SIZE * 0.15; // Distance check for reaching waypoint remains

// --- Rabbit Pickup ---
const MAX_RABBITS = 4; // Current rabbit count (as requested)
const INITIAL_RABBIT_SPAWN_COUNT = 2;
const RABBIT_SPAWN_INTERVAL = 15.0;
const RABBIT_MAP_REVEAL_DURATION = 3.0; // How long map stays visible after pickup

// --- Pickup Effect (Menu Display) ---
const RABBIT_PICKUP_MENU_DURATION = 5.0;
const RABBIT_PICKUP_DISTANCE_FACTOR = 1.8;
const RABBIT_INSTANCE_SCALE = 4.0; // Scale factor for Babylon rabbit meshes
const RABBIT_GROUND_LEVEL = 0.01;

// --- Rabbit Specific Constants (Static Version - Geometry only) ---
// Dimensions for Babylon meshes
const RABBIT_BODY_RADIUS = 0.5 * 0.75; const RABBIT_BODY_HEIGHT = 0.8; const RABBIT_HEAD_RADIUS = 0.5;
// Settings for potential procedural variation (can be kept)
let RABBIT_bodyWidthSetting = 4; const RABBIT_BODY_WIDTH_MIN_FACTOR = 0.5; const RABBIT_BODY_WIDTH_MAX_FACTOR = 1.5;
const RABBIT_EAR_HEIGHT = 0.8; const RABBIT_EAR_RADIUS_BOTTOM = 0.15; const RABBIT_EAR_RADIUS_TOP = 0.1;
const RABBIT_EAR_OFFSET_Z = 0.07; const RABBIT_EAR_TILT_ANGLE = -Math.PI / 6; const RABBIT_EAR_TIP_RADIUS = RABBIT_EAR_RADIUS_TOP;
let RABBIT_earClosenessSetting = 5; const RABBIT_EAR_CLOSENESS_MIN_OFFSET_FACTOR = 0.05; const RABBIT_EAR_CLOSENESS_MAX_OFFSET_FACTOR = 0.9;
// Whisker geometry/positioning needs Babylon implementation
const RABBIT_WHISKER_LENGTH = 0.4; const RABBIT_WHISKER_SPREAD_ANGLE = Math.PI / 7; const RABBIT_WHISKER_SIDE_ANGLE = Math.PI / 5; const RABBIT_WHISKER_DOWN_ANGLE = Math.PI / 12;
const RABBIT_WHISKER_ORIGIN_Y_OFFSET = -0.09; const RABBIT_WHISKER_ORIGIN_Z_OFFSET = RABBIT_HEAD_RADIUS * 0.9999; const RABBIT_WHISKER_ORIGIN_X_OFFSET = RABBIT_HEAD_RADIUS * 0.45;
const RABBIT_NOSE_RADIUS = RABBIT_HEAD_RADIUS * 0.12; const RABBIT_NOSE_COLOR = 0xffa7bd; const RABBIT_NOSE_SCALE_X = 1.2; const RABBIT_NOSE_SCALE_Y = 0.8;
const RABBIT_NOSE_Z_OFFSET = RABBIT_HEAD_RADIUS * 0.95; const RABBIT_NOSE_Y_OFFSET = -0.08;
const RABBIT_HAND_RADIUS = 0.2; const RABBIT_HAND_SCALE_Y = 1.3; const RABBIT_HAND_SCALE_X = 0.8;
const RABBIT_HAND_OFFSET_X = RABBIT_BODY_RADIUS * 1.1; const RABBIT_HAND_OFFSET_Z = RABBIT_BODY_RADIUS * 0.3; const RABBIT_HAND_RESTING_Y_LOCAL = RABBIT_BODY_HEIGHT * 0.2;
const RABBIT_FOOT_RADIUS = 0.25; const RABBIT_FOOT_SCALE_Z = 2.0; const RABBIT_FOOT_SCALE_X = 0.7;
const RABBIT_FOOT_OFFSET_X = RABBIT_BODY_RADIUS * 0.7; const RABBIT_FOOT_OFFSET_Z = RABBIT_BODY_RADIUS * 0.5; const RABBIT_FOOT_RESTING_Y_LOCAL = -RABBIT_BODY_HEIGHT * 0.2;
const RABBIT_FOOT_TILT_ANGLE = Math.PI / 5;
const RABBIT_TAIL_RADIUS = 0.22; const RABBIT_TAIL_SCALE_X = 1.1; const RABBIT_TAIL_SCALE_Z = 1.1; const RABBIT_TAIL_SCALE_Y = 0.9;
const RABBIT_TAIL_OFFSET_Z = -RABBIT_BODY_RADIUS * 0.9; const RABBIT_TAIL_RESTING_Y_LOCAL = RABBIT_BODY_HEIGHT * 0.1;

// Jump/Bounce Physics (Visual animation logic remains, implementation changes)
const RABBIT_JUMP_INITIAL_VELOCITY_Y = 7.5;
const RABBIT_BODY_GRAVITY = 21.0;
const RABBIT_HAND_JUMP_INITIAL_VELOCITY_Y = 4.5; const RABBIT_HAND_GRAVITY = 20.0;
const RABBIT_FOOT_JUMP_INITIAL_VELOCITY_Y = 3.0; const RABBIT_FOOT_GRAVITY = 19.0;
const RABBIT_TAIL_JUMP_INITIAL_VELOCITY_Y = 2.5; const RABBIT_TAIL_GRAVITY = 18.0;
// Pulse Physics (Visual animation logic remains, implementation changes)
const RABBIT_PULSE_AMOUNT = 0.03; const RABBIT_PULSE_FREQ_MIN = 0.8; const RABBIT_PULSE_FREQ_MAX = 2.0;
// Shimmer (Visual animation logic remains, implementation changes)
const RABBIT_SHIMMER_SPEED = 3.0;
// Color values can be used with Babylon materials
const RABBIT_COLOR_WHITE = new BABYLON.Color3(1, 1, 1); // Use BABYLON.Color3
const RABBIT_COLOR_GREY = new BABYLON.Color3(0.8, 0.8, 0.8); // Use BABYLON.Color3
const getRandomPulseFreq = () => RABBIT_PULSE_FREQ_MIN + Math.random() * (RABBIT_PULSE_FREQ_MAX - RABBIT_PULSE_FREQ_MIN);
const RABBIT_NOSE_COLOR_BJS = new BABYLON.Color3.FromHexString("#ffa7bd"); // Use BABYLON Color3


// --- Map ---
const DEBUG_MAP_TRANSITION_MS = 500; // CSS transition time
const DEBUG_MAP_CANVAS_SIZE = 400;
// Map drawing logic (Canvas 2D) remains, worldToCanvas helper needs update
const DEBUG_MAP_WALL_COLOR = 'rgba(0, 255, 0, 0.6)';
const DEBUG_MAP_WALL_FLICKER_CHANCE = 0.03;
const DEBUG_MAP_WALL_FLICKER_COLOR = 'rgba(150, 255, 150, 0.75)';
const DEBUG_MAP_PLAYER_COLOR = 'rgba(200, 255, 255, 0.75)';
const DEBUG_MAP_AGENT_COLOR = 'rgba(100, 255, 100, 0.7)';
const DEBUG_MAP_RABBIT_COLOR = 'rgba(255, 192, 203, 0.8)';
const DEBUG_MAP_ENTITY_FLICKER_CHANCE = 0.05;
const DEBUG_MAP_ENTITY_FLICKER_COLOR = 'rgba(255, 255, 255, 0.85)';

// --- HUD & Effects ---
const HUD_HP_BAR_SHIMMER_SPEED = 4.0;
const HUD_HP_BAR_SHIMMER_AMOUNT = 15;
const HUD_TEXT_GLITCH_INTENSITY = 0.03;
const HUD_TEXT_GLITCH_CHARS = ['_', '^', '~', '*', ';', '|'];
const MENU_GLITCH_CHARS = ['█', '▓', '▒', '░', '_', '^', '~', '!', '*', ';', ':', '|', '/', '\\', ' '];


// =============================================================================
// Game State Variables (Ported)
// =============================================================================
const mazeGrid = []; // Holds the logical maze structure
const activeBullets = []; // Array to hold active bullet data/meshes
const agents = []; // Array to hold agent data/meshes
const activeRabbits = []; // Array to hold rabbit data/meshes

// Babylon.js scene references (will be populated in init)
let engine = null;
let scene = null;
let camera = null;
let playerLight = null; // Reference to the light attached to the player
// References to instanced meshes or individual wall/door meshes
let wallInstancesFull_BJS = null;
let wallInstancesShort_BJS = null;
let doorMeshes_BJS = []; // Array for individual door meshes if not instanced
let floorMesh_BJS = null;
let ceilingMesh_BJS = null;

// Player state
let isPointerLocked = false;
let moveForward = false; let moveBackward = false; let moveLeft = false; let moveRight = false; let isRunning = false;
// currentSpeed will likely modify camera.speed directly in Babylon
let playerHP = PLAYER_MAX_HP;
let playerPosition = new BABYLON.Vector3(0, PLAYER_HEIGHT, 0); // Use BABYLON.Vector3

// Game state flags
let gameWon = false;
let gameOver = false;
let agentsRemaining = 0; // Initialized later
let mazeExitObject_BJS = null; // Reference to the exit mesh
let mazeExitPosition = null; // BABYLON.Vector3 position of the exit

// Gun state
let gunGroup_BJS = null; // Reference to the gun mesh/container (TransformNode)
let currentAmmo = GUN_CLIP_SIZE;
let isReloading = false;
let reloadTimer = 0;
let canShoot = true;
let shootTimer = 0;
// Recoil/reload animation state needs adapting
// let isRecoiling = false;
// let recoilRecoveryTimer = 0;
// let isReloadAnimating = false;

// Timers
let rabbitSpawnTimer = RABBIT_SPAWN_INTERVAL;
let mapDisplayTimer = 0;
let menuDisplayTimer = 0;
let isMenuDisplayedForRabbit = false;
let shakeTimer = 0; // Needs adaptation for Babylon camera shake

// =============================================================================
// Debugging Variables & Toggles (Ported)
// =============================================================================
let DEBUG_COLLISION = false; // Toggle for collision visuals/logs
let DEBUG_MOVEMENT = false; // Toggle for movement logs
let DEBUG_AGENT = false; // Toggle for agent AI logs
let DEBUG_MAP_VISIBLE = false; // Toggle for debug map overlay
let debugMapCanvas = null; // Reference to the map canvas element
let debugMapCtx = null; // Reference to the map canvas 2D context
// let agentStuckCounter = 0; // (Agent specific logic can keep internal counters)
// const AGENT_STUCK_LOG_THRESHOLD = 60;

// =============================================================================
// Reusable Objects (Ported where applicable)
// =============================================================================
// Note: Many Three.js temp objects (Vectors, Quaternions) are less necessary
//       if using Babylon's built-in methods or creating temps locally.
// const tempVec = new THREE.Vector3(); // Use new BABYLON.Vector3() locally if needed
// const tempQuat = new THREE.Quaternion(); // Use new BABYLON.Quaternion() locally

// =============================================================================
// Coordinate Conversion Helpers (Adapted for Babylon.js)
// =============================================================================
/** Converts world X,Z coordinates to logical maze grid X,Y coordinates */
function worldToGrid(worldX, worldZ) {
    const visualGridWidthTotal = MAZE_WIDTH_CELLS * MAZE_GRID_SCALE;
    const visualGridHeightTotal = MAZE_HEIGHT_CELLS * MAZE_GRID_SCALE;
    const visualGridXFloat = (worldX / CELL_SIZE) + (visualGridWidthTotal / 2);
    const visualGridZFloat = (worldZ / CELL_SIZE) + (visualGridHeightTotal / 2);
    const logicalGridX = Math.floor(visualGridXFloat / MAZE_GRID_SCALE);
    const logicalGridY = Math.floor(visualGridZFloat / MAZE_GRID_SCALE);
    // Clamp results to be within grid bounds to avoid errors
    const clampedX = Math.max(0, Math.min(MAZE_WIDTH_CELLS - 1, logicalGridX));
    const clampedY = Math.max(0, Math.min(MAZE_HEIGHT_CELLS - 1, logicalGridY));
    if (logicalGridX !== clampedX || logicalGridY !== clampedY) {
        // console.warn(`worldToGrid out of bounds: (${worldX.toFixed(1)}, ${worldZ.toFixed(1)}) -> Logical (${logicalGridX}, ${logicalGridY}), Clamped to (${clampedX}, ${clampedY})`);
    }
    return { x: clampedX, y: clampedY };
}

/** Converts logical maze grid X,Y coordinates to world X,Z coordinates (center of the logical cell) */
function gridToWorld(gridX, gridY) {
    const worldX = (gridX - MAZE_WIDTH_CELLS / 2 + 0.5) * MAZE_GRID_SCALE * CELL_SIZE;
    const worldZ = (gridY - MAZE_HEIGHT_CELLS / 2 + 0.5) * MAZE_GRID_SCALE * CELL_SIZE;
    // Return a Babylon.js Vector3
    return new BABYLON.Vector3(worldX, 0, worldZ); // Y position will be set separately
}


// =============================================================================
// Maze Generation Functions (Ported - Pure JS)
// =============================================================================
function initMazeGrid() {
    mazeGrid.length = 0;
    for (let y = 0; y < MAZE_HEIGHT_CELLS; y++) {
        mazeGrid[y] = [];
        for (let x = 0; x < MAZE_WIDTH_CELLS; x++) {
            mazeGrid[y][x] = {
                x: x, y: y, visited: false,
                walls: { top: true, bottom: true, left: true, right: true },
                isWall: true, // Initially, everything is a wall block
                isPath: false // Will be carved out
            };
        }
    }
    console.log(`Initialized ${MAZE_HEIGHT_CELLS}x${MAZE_WIDTH_CELLS} logical grid.`);
}

function getNeighbors(cell) {
    const neighbors = [];
    const { x, y } = cell;
    // Check cells 2 steps away (N, S, E, W)
    const potential = [
        { x: x, y: y - 2 }, // North
        { x: x, y: y + 2 }, // South
        { x: x - 2, y: y }, // West
        { x: x + 2, y: y }  // East
    ];
    for (const p of potential) {
        // Check bounds
        if (p.y >= 0 && p.y < MAZE_HEIGHT_CELLS && p.x >= 0 && p.x < MAZE_WIDTH_CELLS) {
            const neighbor = mazeGrid[p.y]?.[p.x];
            // Check if it exists and hasn't been visited
            if (neighbor && !neighbor.visited) {
                neighbors.push(neighbor);
            }
        }
    }
    return neighbors;
}

function removeWall(cell1, cell2) {
    const dx = cell1.x - cell2.x; // dx = 2 (moving left), dx = -2 (moving right)
    const dy = cell1.y - cell2.y; // dy = 2 (moving up), dy = -2 (moving down)
    let wallX, wallY; // Coordinates of the cell *between* cell1 and cell2

    if (dx === 2) { // cell1 is to the right of cell2
        wallX = cell1.x - 1; wallY = cell1.y;
        cell1.walls.left = false;
        cell2.walls.right = false;
    } else if (dx === -2) { // cell1 is to the left of cell2
        wallX = cell1.x + 1; wallY = cell1.y;
        cell1.walls.right = false;
        cell2.walls.left = false;
    } else if (dy === 2) { // cell1 is below cell2
        wallX = cell1.x; wallY = cell1.y - 1;
        cell1.walls.top = false;
        cell2.walls.bottom = false;
    } else if (dy === -2) { // cell1 is above cell2
        wallX = cell1.x; wallY = cell1.y + 1;
        cell1.walls.bottom = false;
        cell2.walls.top = false;
    }

    // Mark the cell *between* the two as a path now
    if (wallX !== undefined && wallY !== undefined && mazeGrid[wallY]?.[wallX]) {
        mazeGrid[wallY][wallX].isWall = false;
        mazeGrid[wallY][wallX].isPath = true;
        // Also remove internal walls of this intermediate cell to ensure clear passage
        if (dx === 2 || dx === -2) { // Horizontal removal
            mazeGrid[wallY][wallX].walls.left = false;
            mazeGrid[wallY][wallX].walls.right = false;
        }
        if (dy === 2 || dy === -2) { // Vertical removal
            mazeGrid[wallY][wallX].walls.top = false;
            mazeGrid[wallY][wallX].walls.bottom = false;
        }
    } else {
        console.warn(`Could not find wall cell between (${cell1.x},${cell1.y}) and (${cell2.x},${cell2.y})`);
    }
}

function generateMaze(startCell) {
    console.log(`Starting maze generation (DFS)...`);
    const stack = [];
    startCell.visited = true;
    startCell.isWall = false; // Mark start as path
    startCell.isPath = true;
    stack.push(startCell);

    while (stack.length > 0) {
        const current = stack.pop();
        const neighbors = getNeighbors(current);

        if (neighbors.length > 0) {
            stack.push(current); // Put current back to revisit later if needed
            // Choose a random unvisited neighbor
            const chosen = neighbors[Math.floor(Math.random() * neighbors.length)];
            // Remove the wall between current and chosen
            removeWall(current, chosen);
            // Mark chosen as visited and path, push to stack
            chosen.visited = true;
            chosen.isWall = false;
            chosen.isPath = true;
            stack.push(chosen);
        }
    }
    console.log("Maze generation complete.");
}

function addCrossConnections(chance) {
    console.log(`Adding cross connections with chance: ${chance * 100}%`);
    let connectionsAdded = 0;
    for (let y = 0; y < MAZE_HEIGHT_CELLS; y++) {
        for (let x = 0; x < MAZE_WIDTH_CELLS; x++) {
            const cell = mazeGrid[y]?.[x];
            // Only consider potentially removing walls from existing path cells
            if (!cell || !cell.isPath) continue;

            // Check right wall: Is there a wall AND is the cell to the right also a path?
            if (cell.walls.right && x < MAZE_WIDTH_CELLS - 1) {
                 const wallCellX = x + 1; // The potential wall cell
                 const targetCellX = x + 2; // The cell beyond the wall
                 // Check if the wall cell AND the target cell exist and are paths
                 if (mazeGrid[y]?.[wallCellX]?.isPath && mazeGrid[y]?.[targetCellX]?.isPath) {
                     // We found a wall between two path cells
                     if (Math.random() < chance) {
                          // Remove the wall logically
                          cell.walls.right = false;
                          mazeGrid[y][wallCellX].walls.left = false; // Ensure both sides are open
                          connectionsAdded++;
                         if (DEBUG_MOVEMENT) console.log(`CrossConnect R: (${x},${y}) <-> (${wallCellX},${y})`);
                     }
                 }
            }

            // Check bottom wall: Is there a wall AND is the cell below also a path?
            if (cell.walls.bottom && y < MAZE_HEIGHT_CELLS - 1) {
                 const wallCellY = y + 1;
                 const targetCellY = y + 2;
                 if (mazeGrid[wallCellY]?.[x]?.isPath && mazeGrid[targetCellY]?.[x]?.isPath) {
                      if (Math.random() < chance) {
                           cell.walls.bottom = false;
                           mazeGrid[wallCellY][x].walls.top = false;
                           connectionsAdded++;
                          if (DEBUG_MOVEMENT) console.log(`CrossConnect B: (${x},${y}) <-> (${x},${wallCellY})`);
                      }
                 }
            }
        }
    }
    console.log(`Added ${connectionsAdded} cross connections.`);
}


// =============================================================================
// A* Pathfinding Implementation (Ported - Pure JS, needs BABYLON.Vector3 output)
// =============================================================================
class SimplePriorityQueue {
    constructor() { this._nodes = []; }
    enqueue(priority, key) { this._nodes.push({ key: key, priority: priority }); this.sort(); }
    dequeue() { return this._nodes.shift().key; }
    isEmpty() { return !this._nodes.length; }
    sort() { this._nodes.sort((a, b) => a.priority - b.priority); }
}

function heuristic(a, b) { return Math.abs(a.x - b.x) + Math.abs(a.y - b.y); }

function findPathAStar(grid, start, goal, maxCells = MAZE_WIDTH_CELLS * MAZE_HEIGHT_CELLS * 2) {
    const openSet = new SimplePriorityQueue();
    if (!grid[start.y]?.[start.x]?.isPath || !grid[goal.y]?.[goal.x]?.isPath) {
        console.warn(`A* pathfinding: Invalid start (${start.x},${start.y}) or goal (${goal.x},${goal.y}) cell.`);
        return null;
    }
    const startKey = `${start.x},${start.y}`;
    openSet.enqueue(0, startKey);

    const cameFrom = new Map();
    const gScore = new Map(); gScore.set(startKey, 0);
    const fScore = new Map(); fScore.set(startKey, heuristic(start, goal));
    let visitedCount = 0;

    while (!openSet.isEmpty()) {
        if (visitedCount > maxCells) { console.warn("A* pathfinding exceeded maxCells limit."); return null; }

        const currentKey = openSet.dequeue();
        const currentCoords = currentKey.split(',');
        const current = { x: parseInt(currentCoords[0]), y: parseInt(currentCoords[1]) };

        if (current.x === goal.x && current.y === goal.y) {
            const path = [];
            let tempKey = currentKey;
            while (tempKey) {
                const coordsArr = tempKey.split(',');
                path.push({ x: parseInt(coordsArr[0]), y: parseInt(coordsArr[1]) });
                tempKey = cameFrom.get(tempKey);
            }
            return path.reverse(); // Return grid coordinates path
        }

        visitedCount++;
        const currentCell = grid[current.y]?.[current.x];
        if (!currentCell || !currentCell.isPath) continue;

        const neighbors = [];
        const potential = [{ dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 }];

        for (const p of potential) {
            const nx = current.x + p.dx;
            const ny = current.y + p.dy;
            const neighborCell = grid[ny]?.[nx];

            if (neighborCell && neighborCell.isPath) {
                 let wallBlocked = false;
                 if (p.dx === 1 && currentCell.walls.right) wallBlocked = true;
                 else if (p.dx === -1 && currentCell.walls.left) wallBlocked = true;
                 else if (p.dy === 1 && currentCell.walls.bottom) wallBlocked = true;
                 else if (p.dy === -1 && currentCell.walls.top) wallBlocked = true;

                 // Optional: More robust check (neighbor's walls facing back)
                 // if (!wallBlocked) {
                 //     const neighborWalls = neighborCell.walls;
                 //     if (p.dx === 1 && neighborWalls.left) wallBlocked = true;
                 //     else if (p.dx === -1 && neighborWalls.right) wallBlocked = true;
                 //     else if (p.dy === 1 && neighborWalls.top) wallBlocked = true;
                 //     else if (p.dy === -1 && neighborWalls.bottom) wallBlocked = true;
                 // }

                 if (!wallBlocked) {
                     neighbors.push({ x: nx, y: ny });
                 }
             }
        }

        for (const neighbor of neighbors) {
            const neighborKey = `${neighbor.x},${neighbor.y}`;
            const tentativeGScore = (gScore.get(currentKey) || 0) + 1; // Add safety default

            if (tentativeGScore < (gScore.get(neighborKey) || Infinity)) {
                cameFrom.set(neighborKey, currentKey);
                gScore.set(neighborKey, tentativeGScore);
                const neighborFScore = tentativeGScore + heuristic(neighbor, goal);
                fScore.set(neighborKey, neighborFScore);
                openSet.enqueue(neighborFScore, neighborKey);
            }
        }
    }

    console.warn(`A* pathfinding failed from (${start.x},${start.y}) to (${goal.x},${goal.y})`);
    return null;
}

/** Converts array of grid cells {x, y} to array of BABYLON.Vector3 world waypoints */
function gridPathToWorldPath(gridPath) {
    if (!gridPath) return [];
    return gridPath.map(cell => {
        const worldPos = gridToWorld(cell.x, cell.y); // gridToWorld now returns BABYLON.Vector3
        // Keep Y at agent height or slightly below
        worldPos.y = AGENT_BODY_HEIGHT * 0.1; // Adjust Y as needed
        return worldPos;
    });
}

/** Finds a random reachable logical path cell */
function findRandomReachableCell() {
    // This function remains the same pure JS logic
    const maxAttempts = MAZE_WIDTH_CELLS * MAZE_HEIGHT_CELLS;
    let attempts = 0;
    let pathExists = false;
    for (let y = 0; y < MAZE_HEIGHT_CELLS && !pathExists; y++) {
        for (let x = 0; x < MAZE_WIDTH_CELLS && !pathExists; x++) {
            if (mazeGrid[y]?.[x]?.isPath) { pathExists = true; }
        }
    }
    if (!pathExists) {
        console.error("findRandomReachableCell: No cells with isPath=true found!");
        return null;
    }
    while(attempts < maxAttempts) {
        const x = Math.floor(Math.random() * MAZE_WIDTH_CELLS);
        const y = Math.floor(Math.random() * MAZE_HEIGHT_CELLS);
        const cell = mazeGrid[y]?.[x];
        if (cell && cell.isPath === true) { return { x: x, y: y }; }
        attempts++;
    }
    console.warn(`findRandomReachableCell: Random attempts failed. Searching sequentially...`);
    for (let y = 0; y < MAZE_HEIGHT_CELLS; y++) {
        for (let x = 0; x < MAZE_WIDTH_CELLS; x++) {
            const cell = mazeGrid[y]?.[x];
            if (cell && cell.isPath === true) { return { x: x, y: y }; }
        }
    }
    console.error("findRandomReachableCell: CRITICAL - Sequential search failed!");
    return null;
}

// =============================================================================
// Audio Context and Sound Playback (Ported - Pure Web Audio API)
// =============================================================================
let audioCtx = null;
function initializeAudioContext() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') {
            audioCtx.resume().then(() => console.log("AudioContext resumed!"))
                             .catch(e => console.error("AudioContext resume failed:", e));
        }
        console.log("AudioContext initialized.");
    }
}

function playSound(type = 'shoot', volume = 0.3, duration = 0.05) {
    if (!audioCtx) {
        // console.warn("AudioContext not initialized, cannot play sound:", type);
        return; // Don't spam warnings
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume().then(() => {
             // console.log("AudioContext resumed on playSound call.");
             playSoundInternal(type, volume, duration);
        }).catch(e => console.error("AudioContext resume failed on playSound:", e));
        return;
    }
    playSoundInternal(type, volume, duration);
}

function playSoundInternal(type, volume, duration) {
     // This function remains the same pure JS Web Audio logic
     try {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
        let freq = 440, waveType = 'sine', endFreq = freq;

        switch(type) {
            case 'shoot': freq = 660; endFreq = 110; waveType = 'sawtooth'; duration = 0.08; break;
            case 'reload': freq = 220; endFreq = 180; waveType = 'square'; duration = 0.2; gainNode.gain.linearRampToValueAtTime(volume * 0.5, audioCtx.currentTime + duration * 0.8); break;
            case 'hit_wall': freq = 150; endFreq = 100; waveType = 'square'; duration = 0.1; volume = 0.2; break;
            case 'hit_agent': freq = 880; endFreq = 550; waveType = 'triangle'; duration = 0.15; volume = 0.4; break;
            case 'agent_death': freq = 330; endFreq = 50; waveType = 'sawtooth'; duration = 0.4; volume = 0.5; break;
            case 'player_hit': freq = 200; endFreq = 150; waveType = 'square'; duration = 0.15; volume = 0.6; break;
            case 'player_hit_feedback': freq = 1000; endFreq = 1000; waveType = 'sine'; duration = 0.05; volume = 0.15; gainNode.gain.setValueAtTime(volume * 0.5, audioCtx.currentTime + duration * 0.1); break;
            case 'game_over': freq = 440; endFreq = 110; waveType = 'sawtooth'; duration = 1.5; volume = 0.6; break;
            case 'game_win': freq = 523; endFreq = 1046; waveType = 'sine'; duration = 1.8; volume = 0.6; break;
            case 'agent_shoot': freq = 550; endFreq = 220; waveType = 'sawtooth'; duration = 0.1; volume = 0.25; break;
            case 'melee_hit': freq = 300; endFreq = 200; waveType = 'square'; duration = 0.12; volume = 0.5; break;
            case 'rabbit_pickup': freq = 880; endFreq = 1760; waveType = 'triangle'; duration = 0.3; volume = 0.45; gainNode.gain.exponentialRampToValueAtTime(volume * 1.5, audioCtx.currentTime + duration * 0.5); break;
            default: duration = 0.05; break;
        }
        oscillator.type = waveType;
        oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(endFreq > 0 ? endFreq : 0.01, audioCtx.currentTime + duration);
        gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + duration);
    } catch (e) { console.error("Error playing sound:", e); }
}

// =============================================================================
// HUD & Menu Element References & Logic (Ported - Pure JS/DOM)
// =============================================================================
let hudHpBarFill = null; let hudWeaponName = null; let hudAmmoCount = null; let hudReloadIndicator = null; let hudReloadProgress = null; let hudAgentCount = null; let blockerElement = null; let instructionsElement = null; let instructionsSpan = null; let menuEffectInterval = null; let damageOverlayElement = null; let versionInfoElement = null;

function setupHUD(){
    hudHpBarFill=document.getElementById('hpBarFill');
    hudWeaponName=document.getElementById('weaponName');
    hudAmmoCount=document.getElementById('ammoCount');
    hudReloadIndicator=document.getElementById('reloadIndicator');
    hudReloadProgress=document.getElementById('reloadProgress');
    hudAgentCount=document.getElementById('agentCount');
    damageOverlayElement=document.getElementById('damageOverlay');
    versionInfoElement = document.getElementById('versionInfo'); // Get version element

    // Get blocker/instructions elements (already done in init_BJS potentially)
    blockerElement = blockerElement || document.getElementById('blocker');
    instructionsElement = instructionsElement || document.getElementById('instructions');
    if (instructionsElement && !instructionsSpan) {
        instructionsSpan = instructionsElement.querySelector('span');
    }
    debugMapCanvas = debugMapCanvas || document.getElementById('debugMapCanvas');
     if (debugMapCanvas && !debugMapCtx) {
         debugMapCtx = debugMapCanvas.getContext('2d');
     }


    if(!hudHpBarFill||!hudWeaponName||!hudAmmoCount||!hudReloadIndicator||!hudReloadProgress||!hudAgentCount||!damageOverlayElement || !versionInfoElement){
        console.error("CRITICAL: One or more HUD/Overlay/Info elements missing from HTML!");
        return false;
    }
    hudWeaponName.textContent="9mm";
    hudAgentCount.dataset.value = `${STARTING_AGENT_COUNT}`; // Use constant
    hudAmmoCount.dataset.value = `${currentAmmo} / ∞`;
    versionInfoElement.textContent = `v1.43b (BJS)`; // Update version display

    updateHUD(); // Initial update
    return true;
}

function updateHUD(time = 0){
    // This function remains the same pure JS/DOM logic
    if(hudHpBarFill) {
        const hpP = Math.max(0, playerHP) / PLAYER_MAX_HP * 100;
        hudHpBarFill.style.width = `${hpP}%`;
        if (playerHP > 0) {
            const baseLightness = 70;
            const shimmer = Math.sin(time * HUD_HP_BAR_SHIMMER_SPEED) * HUD_HP_BAR_SHIMMER_AMOUNT;
            hudHpBarFill.style.backgroundColor = `hsl(120, 100%, ${Math.max(30, Math.min(90, baseLightness + shimmer))}%)`;
        } else {
             hudHpBarFill.style.backgroundColor = `hsl(120, 100%, 30%)`;
        }
    }

    const locked = isPointerLocked; // Use Babylon's pointer lock state

    if(hudAgentCount) {
        const currentCountText = `${agentsRemaining}`;
        if (hudAgentCount.dataset.value !== currentCountText || gameOver || gameWon || !locked) {
             applyGlitchToElement(hudAgentCount, HUD_TEXT_GLITCH_INTENSITY, HUD_TEXT_GLITCH_CHARS, currentCountText);
             hudAgentCount.dataset.value = currentCountText;
        } else {
             if (hudAgentCount.innerHTML !== currentCountText) hudAgentCount.innerHTML = currentCountText;
        }
    }
    if(hudAmmoCount && hudReloadIndicator && hudReloadProgress) {
        if(isReloading){
            const reloadingText = "Reloading...";
            if (hudAmmoCount.textContent !== reloadingText) { hudAmmoCount.textContent = reloadingText; }
            hudAmmoCount.dataset.value = reloadingText;
            hudReloadIndicator.style.display = 'block';
            const p = Math.max(0, (GUN_RELOAD_TIME - reloadTimer) / GUN_RELOAD_TIME) * 100;
            hudReloadProgress.style.strokeDasharray = `${p} 100`;
        } else {
            const ammoText = `${currentAmmo} / ∞`;
            if (hudAmmoCount.dataset.value !== ammoText || gameOver || gameWon || !locked) {
                 applyGlitchToElement(hudAmmoCount, HUD_TEXT_GLITCH_INTENSITY, HUD_TEXT_GLITCH_CHARS, ammoText);
                 hudAmmoCount.dataset.value = ammoText;
            } else {
                 if (hudAmmoCount.innerHTML !== ammoText) hudAmmoCount.innerHTML = ammoText;
            }
            hudReloadIndicator.style.display = 'none';
            hudReloadProgress.style.strokeDasharray = '0 100';
        }
    }
}

function applyGlitchToElement(el, intensity = 0.05, chars = MENU_GLITCH_CHARS, originalText = null) {
    // This function remains the same pure JS/DOM logic
    if (!el) return;
    let textToGlitch = originalText !== null ? originalText : (el.dataset?.originalText || el.textContent);
    if (!textToGlitch) return;
    if (originalText !== null && el.dataset?.originalText !== originalText) { el.dataset.originalText = originalText; }
    else if (!el.dataset?.originalText) { el.dataset.originalText = textToGlitch; }
    const len = textToGlitch.length; let result = '';
    for (let i = 0; i < len; i++) {
        if (textToGlitch[i] === '<') { let tagEnd = textToGlitch.indexOf('>', i); if (tagEnd !== -1) { result += textToGlitch.substring(i, tagEnd + 1); i = tagEnd; continue; } }
        result += (Math.random() < intensity) ? chars[Math.floor(Math.random() * chars.length)] : textToGlitch[i];
    }
    if (el.innerHTML !== result) { el.innerHTML = result; }
}

function applyMenuEffects(){
    // This function remains the same pure JS/DOM logic
    if(blockerElement && blockerElement.style.display !== 'none' && instructionsSpan){
        applyGlitchToElement(instructionsSpan, 0.15, MENU_GLITCH_CHARS);
    }
}

function startMenuEffects(){
    // This function remains the same pure JS/DOM logic
    if(!menuEffectInterval && instructionsSpan){
        if(!instructionsSpan.dataset.originalText) { instructionsSpan.dataset.originalText = instructionsSpan.innerHTML; }
        clearInterval(menuEffectInterval);
        menuEffectInterval = setInterval(applyMenuEffects, 80);
    }
}

function stopMenuEffects(){
     // This function remains the same pure JS/DOM logic
    if(menuEffectInterval){
        clearInterval(menuEffectInterval);
        menuEffectInterval=null;
        if(instructionsSpan && instructionsSpan.dataset && instructionsSpan.dataset.originalText) {
            if (!gameOver && !gameWon && !isMenuDisplayedForRabbit) {
                 instructionsSpan.innerHTML = instructionsSpan.dataset.originalText;
            }
        }
    }
}

function updateMenuForPause() {
     // This function remains the same pure JS/DOM logic
     stopMenuEffects();
     if (instructionsSpan) {
         const pauseText = `<span style="font-size:36px">Paused</span><br/><br/>(Click to Resume)`;
         instructionsSpan.innerHTML = pauseText;
         instructionsSpan.dataset.originalText = pauseText; // Store the pause text as original for this state
     }
     // Ensure blocker is visible for pause
     if(blockerElement) { blockerElement.style.display = 'flex'; void blockerElement.offsetWidth; blockerElement.style.opacity = '1'; }
     if(instructionsElement) instructionsElement.style.display = 'block';
}

function updateMenuForRabbitPickup() {
     // This function remains the same pure JS/DOM logic
    stopMenuEffects();
    if (instructionsSpan) {
        const rabbitText = `<span style="font-size:28px">Rabbit Collected!</span><br/><br/>(Map Revealed Briefly)<br/>(Click to Resume)`;
        instructionsSpan.innerHTML = rabbitText;
        instructionsSpan.dataset.originalText = rabbitText; // Store rabbit text
    }
     if(blockerElement) { blockerElement.style.display = 'flex'; void blockerElement.offsetWidth; blockerElement.style.opacity = '1'; }
     if(instructionsElement) instructionsElement.style.display = 'block';
}

// =============================================================================
// Player Actions (Placeholders / Basic Logic)
// =============================================================================
function fireGun() {
    if (!isPointerLocked || !canShoot || isReloading || gameOver || gameWon) return;
    if (currentAmmo <= 0) {
        startReload();
        return;
    }
    currentAmmo--;
    canShoot = false;
    shootTimer = GUN_FIRE_RATE;
    playSound('shoot');
    // triggerRecoil_BJS(); // TODO: Implement Babylon recoil

    // --- Bullet Creation (Babylon) ---
    // TODO: Implement bullet mesh creation, positioning, velocity setting
    console.log("ACTION: Fire Gun (Babylon implementation needed)");
    // const bullet = BABYLON.MeshBuilder.CreateSphere("bullet", { diameter: BULLET_SIZE }, scene);
    // Set material
    // Get camera forward direction
    // Set bullet position (slightly in front of camera)
    // Calculate velocity vector
    // Store bullet mesh and data (velocity, life, damage, isAgentBullet) in activeBullets
    // ---

    updateHUD();
}

function startReload() {
    // This function remains mostly the same pure JS logic
    if (isReloading || currentAmmo === GUN_CLIP_SIZE || gameOver || gameWon || !isPointerLocked) return;
    console.log("ACTION: Reloading...");
    isReloading = true;
    // isReloadAnimating = true; // TODO: Control Babylon reload animation state
    reloadTimer = GUN_RELOAD_TIME;
    canShoot = false;
    playSound('reload');
    updateHUD();
}

function handleShootingCooldown(delta) {
    // This function remains the same pure JS logic
    if (!canShoot) {
        shootTimer -= delta;
        if (shootTimer <= 0) {
            canShoot = true;
        }
    }
}

function handleReloading(delta, time) {
    // This function remains mostly the same pure JS logic
    if (isReloading) {
        reloadTimer -= delta;
        // --- Reload Animation (Babylon) ---
        // TODO: Update gun mesh position/rotation based on reloadTimer progress
        // const reloadProgress = 1.0 - Math.max(0, reloadTimer) / GUN_RELOAD_TIME;
        // const animationProgress = Math.sin(reloadProgress * Math.PI);
        // gunGroup_BJS.position.y = ...
        // gunGroup_BJS.rotation.x = ...
        // ---
        if (reloadTimer <= 0) {
            isReloading = false;
            // isReloadAnimating = false; // TODO: Reset Babylon animation state
            currentAmmo = GUN_CLIP_SIZE;
            canShoot = true;
            // TODO: Reset gun mesh position/rotation
            // gunGroup_BJS.position = gunBasePosition_BJS;
            // gunGroup_BJS.rotation = gunBaseRotation_BJS;
            console.log("ACTION: Reload Complete.");
            updateHUD();
        }
    }
    // else if (isReloadAnimating) { // TODO: Handle resetting animation state if needed
    //     isReloadAnimating = false;
    //     // Reset gun mesh position/rotation
    // }
}

// =============================================================================
// Game State Functions (Ported, needs Babylon integration)
// =============================================================================
function damagePlayer(amount, source = "Bullet") {
    if (gameOver || gameWon || shakeTimer > 0) return; // Don't take damage if already over or shaking
    playerHP -= amount;
    playerHP = Math.max(0, playerHP);
    console.log(`Player took ${amount} damage from ${source}. HP: ${playerHP}`);

    // --- Screen Shake (Babylon) ---
    // TODO: Implement camera shake effect using Babylon methods
    shakeTimer = PLAYER_DAMAGE_SHAKE_DURATION;
    // cameraBasePosition.copyFrom(camera.position); // Store pre-shake position
    // cameraBaseRotation.copyFrom(camera.rotation); // Store pre-shake rotation (might use quaternions)
    console.log("EFFECT: Player Damage Screen Shake (Babylon implementation needed)");
    // ---

    playSound('player_hit');
    playSound('player_hit_feedback'); // Subtle audio cue

    // --- Damage Overlay --- (Pure DOM manipulation - should work)
    if (damageOverlayElement) {
        damageOverlayElement.style.display = 'block';
        requestAnimationFrame(() => {
            damageOverlayElement.style.opacity = '1';
            setTimeout(() => {
                if (damageOverlayElement) damageOverlayElement.style.opacity = '0';
                setTimeout(() => {
                    if (damageOverlayElement && damageOverlayElement.style.opacity === '0') {
                        damageOverlayElement.style.display = 'none';
                    }
                }, DAMAGE_OVERLAY_FADE_OUT_TIME);
            }, DAMAGE_OVERLAY_FADE_IN_TIME);
        });
    }
    // ---

    updateHUD();

    if (playerHP <= 0) {
        triggerGameOver(`Eliminated by Agent ${source}`);
    }
}

function triggerGameOver(reason = "Unknown") {
    if (gameOver || gameWon) return;
    console.log(`Game Over: ${reason}`);
    gameOver = true;
    playerHP = 0; // Ensure HP is 0
    shakeTimer = 0; // Stop any active shake

    // TODO: Restore camera position/rotation if shake was interrupted?

    updateHUD(); // Update HUD one last time

    // --- Show End Screen (Pure DOM) ---
    if (blockerElement && instructionsElement) {
        if (instructionsSpan) {
            instructionsSpan.innerHTML = `GAME OVER<br/><br/>${reason}<br/><br/>(Click to Reload)`; // Added reload prompt
            instructionsSpan.dataset.originalText = instructionsSpan.innerHTML;
        }
        blockerElement.style.opacity = '1';
        blockerElement.style.display = 'flex';
        instructionsElement.style.display = 'block';
    }
    // ---

    // --- Unlock Pointer (Babylon) ---
    if (isPointerLocked && engine) {
        engine.exitPointerlock();
    }
    // ---

    playSound('game_over');
    startMenuEffects(); // Start glitch effect on the end screen
}

function triggerGameWin() {
    if (gameOver || gameWon) return;
    console.log("Objective Complete: Exit Reached!");
    gameWon = true;
    shakeTimer = 0; // Stop any active shake

    // TODO: Restore camera position/rotation if shake was interrupted?

    // --- Show Win Screen (Pure DOM) ---
    if (blockerElement && instructionsElement) {
        if (instructionsSpan) {
            instructionsSpan.innerHTML = "EXIT REACHED<br/><br/>OBJECTIVE COMPLETE<br/><br/>(Click to Reload)"; // Added reload prompt
            instructionsSpan.dataset.originalText = instructionsSpan.innerHTML;
        }
        blockerElement.style.opacity = '1';
        blockerElement.style.display = 'flex';
        instructionsElement.style.display = 'block';
    }
    // ---

     // --- Unlock Pointer (Babylon) ---
    if (isPointerLocked && engine) {
        engine.exitPointerlock();
    }
    // ---

    playSound('game_win');
    startMenuEffects(); // Start glitch effect on the win screen
}

// =============================================================================
// Debug Map Drawing (Ported - Canvas 2D logic)
// =============================================================================
function drawDebugMap(time) {
    // This function uses the Canvas 2D API and relies on the DOM element
    // and the coordinate conversion functions, which have been ported/adapted.
    // It should work as long as debugMapCtx is initialized and worldToCanvas works.
    if (!debugMapCtx || !debugMapCanvas) return;

    const shouldBeVisible = DEBUG_MAP_VISIBLE || mapDisplayTimer > 0;
    if (shouldBeVisible) {
        if (!debugMapCanvas.classList.contains('visible')) {
            debugMapCanvas.classList.add('visible');
        }
    } else {
        if (debugMapCanvas.classList.contains('visible')) {
            debugMapCanvas.classList.remove('visible');
        }
        return; // Don't draw if not visible
    }

    const ctx = debugMapCtx;
    const canvasSize = DEBUG_MAP_CANVAS_SIZE;
    ctx.clearRect(0, 0, canvasSize, canvasSize);

    const gridTotalWidthCells = MAZE_WIDTH_CELLS;
    const gridTotalHeightCells = MAZE_HEIGHT_CELLS;
    const scaleX = canvasSize / gridTotalWidthCells;
    const scaleY = canvasSize / gridTotalHeightCells;
    const scale = Math.min(scaleX, scaleY);
    const mazeDrawingWidth = gridTotalWidthCells * scale;
    const mazeDrawingHeight = gridTotalHeightCells * scale;
    const offsetX = (canvasSize - mazeDrawingWidth) / 2;
    const offsetY = (canvasSize - mazeDrawingHeight) / 2;

    const gridToCanvas = (gridX, gridY) => ({ x: offsetX + gridX * scale, y: offsetY + gridY * scale });

    // Draw Maze Walls
    ctx.lineWidth = 1.0;
    let currentWallColor = DEBUG_MAP_WALL_COLOR;
    if (Math.random() < DEBUG_MAP_WALL_FLICKER_CHANCE) { currentWallColor = DEBUG_MAP_WALL_FLICKER_COLOR; }
    ctx.strokeStyle = currentWallColor;
    ctx.beginPath();
    for (let y = 0; y < MAZE_HEIGHT_CELLS; y++) {
        for (let x = 0; x < MAZE_WIDTH_CELLS; x++) {
            const cell = mazeGrid[y]?.[x];
            if (cell) {
                const canvasPos = gridToCanvas(x, y);
                const nextXPos = gridToCanvas(x + 1, y).x;
                const nextYPos = gridToCanvas(x, y + 1).y;
                if (cell.walls.top) { ctx.moveTo(canvasPos.x, canvasPos.y); ctx.lineTo(nextXPos, canvasPos.y); }
                if (cell.walls.left) { ctx.moveTo(canvasPos.x, canvasPos.y); ctx.lineTo(canvasPos.x, nextYPos); }
                if (y === MAZE_HEIGHT_CELLS - 1 && cell.walls.bottom) { ctx.moveTo(canvasPos.x, nextYPos); ctx.lineTo(nextXPos, nextYPos); }
                if (x === MAZE_WIDTH_CELLS - 1 && cell.walls.right) { ctx.moveTo(nextXPos, canvasPos.y); ctx.lineTo(nextXPos, nextYPos); }
            }
        }
    }
    ctx.stroke();

    // World to Canvas (uses adapted coordinate conversion)
    const worldToCanvas = (worldX, worldZ) => {
        const visualGridWidthTotal = MAZE_WIDTH_CELLS * MAZE_GRID_SCALE;
        const visualGridHeightTotal = MAZE_HEIGHT_CELLS * MAZE_GRID_SCALE;
        const visualGridXFloat = (worldX / CELL_SIZE) + (visualGridWidthTotal / 2);
        const visualGridZFloat = (worldZ / CELL_SIZE) + (visualGridHeightTotal / 2);
        const logicalGridXFloat = visualGridXFloat / MAZE_GRID_SCALE;
        const logicalGridYFloat = visualGridZFloat / MAZE_GRID_SCALE;
        return gridToCanvas(logicalGridXFloat, logicalGridYFloat);
    };

    // Draw Player (uses camera position)
    if (camera) {
        let currentPlayerColor = DEBUG_MAP_PLAYER_COLOR;
        if (Math.random() < DEBUG_MAP_ENTITY_FLICKER_CHANCE) { currentPlayerColor = DEBUG_MAP_ENTITY_FLICKER_COLOR; }
        ctx.fillStyle = currentPlayerColor; ctx.strokeStyle = currentPlayerColor;
        const playerCanvasPos = worldToCanvas(camera.position.x, camera.position.z); // Use camera world pos
        const playerRadius = scale * 0.35;
        // Get camera forward direction for orientation
        const forward = camera.getForwardRay().direction; // Babylon camera forward
        const angle = Math.atan2(forward.x, forward.z); // Angle on XZ plane
        ctx.beginPath();
        ctx.moveTo(playerCanvasPos.x + Math.sin(angle) * playerRadius, playerCanvasPos.y + Math.cos(angle) * playerRadius);
        ctx.lineTo(playerCanvasPos.x + Math.sin(angle + Math.PI * 0.8) * playerRadius * 0.7, playerCanvasPos.y + Math.cos(angle + Math.PI * 0.8) * playerRadius * 0.7);
        ctx.lineTo(playerCanvasPos.x + Math.sin(angle - Math.PI * 0.8) * playerRadius * 0.7, playerCanvasPos.y + Math.cos(angle - Math.PI * 0.8) * playerRadius * 0.7);
        ctx.closePath(); ctx.fill();
    }

    // Draw Agents (Needs agent mesh references)
    let currentAgentColor = DEBUG_MAP_AGENT_COLOR;
    if (Math.random() < DEBUG_MAP_ENTITY_FLICKER_CHANCE) { currentAgentColor = DEBUG_MAP_ENTITY_FLICKER_COLOR; }
    ctx.fillStyle = currentAgentColor; ctx.strokeStyle = currentAgentColor;
    const agentRadius = scale * 0.3;
    agents.forEach(agent => {
        // TODO: Check agent.hp > 0 and get position from agent.mesh.position
        if (agent.hp > 0 && agent.mesh) { // Assuming agent data will have a 'mesh' reference
            const agentCanvasPos = worldToCanvas(agent.mesh.position.x, agent.mesh.position.z);
            ctx.beginPath(); ctx.arc(agentCanvasPos.x, agentCanvasPos.y, agentRadius, 0, Math.PI * 2); ctx.fill();
        }
    });

    // Draw Rabbits (Needs rabbit mesh references)
    ctx.fillStyle = DEBUG_MAP_RABBIT_COLOR;
    ctx.strokeStyle = DEBUG_MAP_RABBIT_COLOR;
    const rabbitRadius = scale * 0.25;
    activeRabbits.forEach(rabbit => {
        // TODO: Get position from rabbit.mesh.position
        if (rabbit.mesh) { // Assuming rabbit data will have a 'mesh' reference
             const rabbitCanvasPos = worldToCanvas(rabbit.mesh.position.x, rabbit.mesh.position.z);
             ctx.beginPath(); ctx.rect(rabbitCanvasPos.x - rabbitRadius, rabbitCanvasPos.y - rabbitRadius, rabbitRadius * 2, rabbitRadius * 2); ctx.fill();
        }
    });

    // Draw Exit (Uses mazeExitPosition)
    if (mazeExitPosition) {
        ctx.fillStyle = 'rgba(255, 255, 0, 0.9)';
        ctx.strokeStyle = 'rgba(255, 255, 0, 0.9)';
        const exitRadius = scale * 0.4;
        const exitCanvasPos = worldToCanvas(mazeExitPosition.x, mazeExitPosition.z);
        ctx.beginPath(); ctx.arc(exitCanvasPos.x, exitCanvasPos.y, exitRadius, 0, Math.PI * 2); ctx.fill();
    }
}

// =============================================================================
// ===== BABYLON.JS SPECIFIC SETUP AND IMPLEMENTATION REQUIRED BELOW =========
// =============================================================================

// =============================================================================
// Babylon.js Scene Creation Function
// =============================================================================
async function createScene() {
    console.log("BJS: Creating Scene...");
    scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0, 0, 0); // Black background

    // --- Camera ---
    // Using UniversalCamera for FPS-style controls
    // Initial position will be set later after maze generation
    camera = new BABYLON.UniversalCamera("playerCamera", new BABYLON.Vector3(0, PLAYER_HEIGHT, 0), scene);
    camera.attachControl(canvas, true); // Attach controls to canvas

    // Configure Camera
    camera.speed = PLAYER_SPEED_WALK; // Base speed
    camera.inertia = 0.85; // Some smoothing
    camera.angularSensibility = 3000; // Mouse sensitivity
    camera.minZ = 0.1; // Near clip plane
    camera.maxZ = MAZE_WIDTH_UNITS * 1.5; // Far clip plane (adjust as needed)

    // Basic collision setup for camera
    scene.collisionsEnabled = true;
    camera.checkCollisions = true;
    // Define player collision shape (Ellipsoid) - radius, height
    camera.ellipsoid = new BABYLON.Vector3(PLAYER_RADIUS * 0.5, PLAYER_HEIGHT * 0.9, PLAYER_RADIUS * 0.5); // Adjust Y-offset later if needed
    // camera.ellipsoidOffset = new BABYLON.Vector3(0, PLAYER_HEIGHT * 0.9 / 2, 0); // Offset the ellipsoid center

    // Prevent looking straight up/down (optional)
    camera.upperBetaLimit = Math.PI / 2.2;
    camera.lowerBetaLimit = -Math.PI / 2.2;

    // --- Lighting ---
    // Simple ambient light
    const ambientLight = new BABYLON.HemisphericLight("ambientLight", new BABYLON.Vector3(0, 1, 0), scene);
    ambientLight.intensity = 0.6;
    ambientLight.groundColor = new BABYLON.Color3(0.1, 0.1, 0.1);

    // Point light attached to player (will be updated)
    playerLight = new BABYLON.PointLight("playerLight", new BABYLON.Vector3(0, 1, 0), scene);
    playerLight.intensity = 0.7;
    playerLight.range = 8 * CELL_SIZE * MAZE_GRID_SCALE; // Adjust range based on scale
    // TODO: playerLight.shadowEnabled = true; // Requires shadow generator setup

    // --- Gravity ---
    scene.gravity = new BABYLON.Vector3(0, -9.81 * 3.0, 0); // Apply gravity
    camera.applyGravity = true; // Make the camera affected by gravity

    // --- Fog (Optional Matrix effect) ---
    // scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
    // scene.fogColor = new BABYLON.Color3(0, 0.05, 0);
    // scene.fogStart = CELL_SIZE * MAZE_GRID_SCALE * 2;
    // scene.fogEnd = CELL_SIZE * MAZE_GRID_SCALE * 10;

    console.log("BJS: Scene, Camera, Lights created.");
    return scene;
}

// =============================================================================
// Babylon.js Maze Geometry Creation (Placeholder)
// =============================================================================
function createMazeGeometry_BJS() {
    console.log("BJS: Creating Maze Geometry...");

    // --- Materials (Define once) ---
    const wallMaterial_BJS = new BABYLON.StandardMaterial("wallMat", scene);
    wallMaterial_BJS.diffuseColor = new BABYLON.Color3.FromHexString("#cccccc");
    wallMaterial_BJS.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    // Emissive color for the glow effect
    wallMaterial_BJS.emissiveColor = new BABYLON.Color3.FromHexString("#333333");
    // TODO: Update emissive intensity in render loop for shimmer

    const floorMaterial_BJS = new BABYLON.StandardMaterial("floorMat", scene);
    floorMaterial_BJS.diffuseColor = new BABYLON.Color3(1, 1, 1); // White
    floorMaterial_BJS.specularColor = new BABYLON.Color3(0, 0, 0); // No reflection

    const doorMaterial_BJS = new BABYLON.StandardMaterial("doorMat", scene);
    doorMaterial_BJS.diffuseColor = new BABYLON.Color3.FromHexString("#005500");
    doorMaterial_BJS.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);

    // --- Floor & Ceiling ---
    floorMesh_BJS = BABYLON.MeshBuilder.CreatePlane("floor", {width: MAZE_WIDTH_UNITS, height: MAZE_HEIGHT_UNITS}, scene);
    floorMesh_BJS.position.y = 0;
    floorMesh_BJS.rotation.x = Math.PI / 2;
    floorMesh_BJS.material = floorMaterial_BJS;
    floorMesh_BJS.checkCollisions = true; // Enable collisions for the floor

    ceilingMesh_BJS = BABYLON.MeshBuilder.CreatePlane("ceiling", {width: MAZE_WIDTH_UNITS, height: MAZE_HEIGHT_UNITS}, scene);
    ceilingMesh_BJS.position.y = WALL_HEIGHT;
    ceilingMesh_BJS.rotation.x = -Math.PI / 2;
    ceilingMesh_BJS.material = floorMaterial_BJS.clone("ceilingMat"); // Clone material if needed
    // ceilingMesh_BJS.checkCollisions = true; // Optional: collide with ceiling?

    // --- Walls (Using Instancing or Individual Meshes) ---
    // TODO: Implement wall creation using the mazeGrid data
    // Iterate through visual grid (visualGridX, visualGridY) like in Three.js version
    // Use getWallWorldPos (adapted for BJS) to get position
    // Determine if full or short wall
    // Create instances (thinInstance recommended) or individual meshes
    // Set material
    // Set checkCollisions = true for walls

    console.warn("BJS: Wall geometry creation NOT YET IMPLEMENTED!");
    // Placeholder: Create one wall for testing
    const testWall = BABYLON.MeshBuilder.CreateBox("wall1", {width: WALL_THICKNESS, height: WALL_HEIGHT, depth: WALL_THICKNESS}, scene);
    testWall.position = new BABYLON.Vector3(0, WALL_HEIGHT / 2, 20);
    testWall.material = wallMaterial_BJS;
    testWall.checkCollisions = true;


    // --- Doors ---
    // TODO: Implement door creation if needed, similar logic to walls
    console.warn("BJS: Door geometry creation NOT YET IMPLEMENTED!");

    console.log("BJS: Maze geometry creation finished (partially).");
}

// =============================================================================
// Player Start Position (Adapted for Babylon Camera)
// =============================================================================
function findLongestCorridorAndSetPlayerStart_BJS() {
    // This function uses the same LOGICAL grid search as before
    let longestCorridor = { start: null, end: null, length: 0, orientation: null };
    for (let y = 0; y < MAZE_HEIGHT_CELLS; y++) { for (let x = 0; x < MAZE_WIDTH_CELLS; x++) { const isWallLeft = x === 0 || !mazeGrid[y]?.[x - 1]?.isPath; if (mazeGrid[y]?.[x]?.isPath && isWallLeft) { let currentLength = 0; let currentX = x; while (currentX < MAZE_WIDTH_CELLS && mazeGrid[y]?.[currentX]?.isPath) { currentLength++; currentX++; } if (currentLength > longestCorridor.length) { longestCorridor = { start: { x: x, y: y }, end: { x: currentX - 1, y: y }, length: currentLength, orientation: 'horizontal' }; } } } }
    for (let x = 0; x < MAZE_WIDTH_CELLS; x++) { for (let y = 0; y < MAZE_HEIGHT_CELLS; y++) { const isWallAbove = y === 0 || !mazeGrid[y - 1]?.[x]?.isPath; if (mazeGrid[y]?.[x]?.isPath && isWallAbove) { let currentLength = 0; let currentY = y; while (currentY < MAZE_HEIGHT_CELLS && mazeGrid[currentY]?.[x]?.isPath) { currentLength++; currentY++; } if (currentLength > longestCorridor.length) { longestCorridor = { start: { x: x, y: y }, end: { x: x, y: currentY - 1 }, length: currentLength, orientation: 'vertical' }; } } } }

    let startWorldPos = gridToWorld(1, 1); // Default fallback
    let targetWorldPos = gridToWorld(1, 2); // Default look target

    if (longestCorridor.length > 1) {
        console.log(`Longest corridor found: Length ${longestCorridor.length}, Start: (${longestCorridor.start.x},${longestCorridor.start.y}), End: (${longestCorridor.end.x},${longestCorridor.end.y})`);
        const useStartAsPlayer = Math.random() < 0.5;
        const startGridPos = useStartAsPlayer ? longestCorridor.start : longestCorridor.end;
        const targetGridPos = useStartAsPlayer ? longestCorridor.end : longestCorridor.start;
        startWorldPos = gridToWorld(startGridPos.x, startGridPos.y);
        targetWorldPos = gridToWorld(targetGridPos.x, targetGridPos.y);
        console.log(`Player starting at grid (${startGridPos.x},${startGridPos.y}), looking towards (${targetGridPos.x},${targetGridPos.y})`);
    } else {
        console.warn("Could not find a suitable longest corridor, using default start (1,1)");
    }

    // Set Babylon Camera Position and Target
    camera.position = new BABYLON.Vector3(startWorldPos.x, PLAYER_HEIGHT, startWorldPos.z);
    // Set initial look target (UniversalCamera uses setTarget)
    camera.setTarget(new BABYLON.Vector3(targetWorldPos.x, PLAYER_HEIGHT, targetWorldPos.z)); // Look slightly above floor

    // Update playerPosition state variable
    playerPosition.copyFrom(camera.position);

    console.log(`BJS: Player start position set to ${camera.position.x.toFixed(1)}, ${camera.position.z.toFixed(1)}`);
}

// =============================================================================
// Agent/Rabbit/Exit/Gun Creation (Placeholders for Babylon)
// =============================================================================
function createAgents_BJS() {
    console.warn("BJS: Agent creation NOT YET IMPLEMENTED!");
    // TODO:
    // Loop STARTING_AGENT_COUNT times
    // Find valid spawn position using findRandomReachableCell and gridToWorld
    // Create agent hierarchy (e.g., using TransformNode as parent)
    // Create meshes (body, head, arms, gun) using MeshBuilder
    // Position meshes relative to parent node
    // Create materials (StandardMaterial) and apply colors/properties
    // Store agent data in 'agents' array (including references to meshes/nodes, HP, state, pathfinding data)
    // Enable collisions for agent meshes if needed
    agentsRemaining = STARTING_AGENT_COUNT; // Set initial count
    updateHUD(); // Update HUD with agent count
}

function createRabbitGeometries_BJS() {
    console.warn("BJS: Rabbit geometry caching NOT YET IMPLEMENTED!");
    // TODO: Create Babylon Geometries (or use MeshBuilder directly in instance creation)
}

function spawnRabbit_BJS() {
     console.warn("BJS: Rabbit spawning NOT YET IMPLEMENTED!");
     // TODO:
     // Check activeRabbits.length < MAX_RABBITS
     // Find valid spawn position
     // Create rabbit instance (meshes/materials/parent node) using MeshBuilder
     // Set position, scale
     // Store rabbit data in 'activeRabbits' array (mesh references, animation state)
     // Add visual jump effect on spawn if desired
}

function createExitMarker_BJS(position) {
    console.warn("BJS: Exit marker creation NOT YET IMPLEMENTED!");
    // TODO:
    // Create exit mesh (e.g., Icosahedron) using MeshBuilder
    // Create emissive material
    // Set position based on input 'position' (BABYLON.Vector3)
    // Add PointLight as child if desired
    // Store reference in mazeExitObject_BJS, position in mazeExitPosition
}

function createGun_BJS() {
    console.warn("BJS: Gun creation NOT YET IMPLEMENTED!");
    // TODO:
    // Create gun meshes (barrel, handle) using MeshBuilder
    // Create material
    // Create parent TransformNode or attach directly to camera
    // Position/rotate relative to camera
    // Store reference in gunGroup_BJS
}

// =============================================================================
// Update Functions (Placeholders for Babylon)
// =============================================================================
function updateBullets_BJS(delta) {
    // TODO:
    // Loop through activeBullets array (backwards)
    // Update bullet mesh position based on velocity * delta
    // Decrement life timer
    // Perform collision checks (raycast from prev to current pos) against walls, agents, player
    // Handle hits (damage agent/player, play sounds)
    // Remove bullets (dispose mesh, remove from array) on hit or life <= 0
    // Update/remove associated particles
}

function updateAgents_BJS(delta, time) {
    // TODO:
    // Loop through agents array
    // Update timers (LoS check, cooldowns, etc.)
    // Perform LoS check (Babylon raycast) if needed
    // Update agent state machine (logic is mostly ported)
    // If pathfinding needed (state change, patrol end, target recalc timer):
        // Get current agent grid pos (worldToGrid(agent.mesh.position))
        // Generate path using findPathAStar -> gridPathToWorldPath
        // Store path (array of BABYLON.Vector3) and reset path index/waypoint
    // If moving:
        // Get direction to current waypoint
        // Move agent mesh (e.g., agent.mesh.moveWithCollisions(direction * speed * delta))
        // Check distance to waypoint, advance if close
        // Turn agent mesh towards waypoint (e.g., using lookAt or quaternion slerp)
    // Handle actions (shooting, melee) based on state
        // Aiming: Rotate agent mesh towards player
        // Shooting: Create agent bullet (similar to player fireGun)
        // Melee: Check range, trigger damagePlayer
    // Update animations (sway, attack pose) - manipulate mesh rotations/positions
    // Update HP bar visuals (if using GUI or 3D planes)
}

function updateRabbits_BJS(delta, time) {
    // TODO:
    // Handle spawning timer (call spawnRabbit_BJS)
    // Loop through activeRabbits
    // Update visual animations (jump physics, pulse, shimmer) by manipulating mesh position/scale/material
    // Check pickup distance (player camera vs rabbit mesh position)
    // Handle pickup:
        // Play sound
        // Remove rabbit (dispose mesh, remove from array)
        // Trigger map reveal timer
        // Trigger pickup menu timer/state
}

// =============================================================================
// Event Handlers (Adapted for Babylon.js)
// =============================================================================
function setupEventListeners() {
    console.log("BJS: Setting up Event Listeners...");

    // --- Pointer Lock ---
    const canvas = engine.getRenderingCanvas(); // Get the canvas Babylon is using

    // On click, request pointer lock
    scene.onPointerDown = (evt) => {
        // evt.button === 0 is left click
        if (!isPointerLocked && evt.button === 0) {
            initializeAudioContext(); // Ensure audio starts on user interaction
            if (gameOver || gameWon) {
                console.log("Reloading page...");
                window.location.reload();
            } else {
                 console.log("Requesting pointer lock...");
                 engine.enterPointerlock();
            }
        }
        // Handle shooting on left click if already locked
        if (isPointerLocked && evt.button === 0) {
            fireGun();
        }
    };

    // Pointer lock change listener
    const onPointerLockChange = () => {
        const element = document.pointerLockElement || null; // Check pointerLockElement
        if (element === canvas) {
            isPointerLocked = true;
            console.log("BJS: Pointer Locked");
            if(blockerElement) { blockerElement.style.opacity = '0'; setTimeout(() => { if(blockerElement) blockerElement.style.display = 'none'; }, 300); }
            document.body.classList.add('locked'); // For reticle CSS
            stopMenuEffects(); // Stop menu glitch when game starts/resumes
             isMenuDisplayedForRabbit = false; // Reset rabbit menu flag on lock
             menuDisplayTimer = 0;          // Reset rabbit menu timer
        } else {
            isPointerLocked = false;
            console.log("BJS: Pointer Unlocked");
            camera.inputs.remove(camera.inputs.attached.mouse); // Detach mouse input manually on unlock
            camera.inputs.addMouse(); // Re-add mouse input manager so it can be reattached later

            document.body.classList.remove('locked');
            // Determine reason for unlock (pause, win, lose, rabbit)
            if (gameOver || gameWon) {
                // Already handled by triggerGameOver/Win
            } else if (isMenuDisplayedForRabbit && menuDisplayTimer > 0) {
                 updateMenuForRabbitPickup();
            } else {
                 updateMenuForPause(); // Assume regular pause
            }
        }
    };
    document.addEventListener("pointerlockchange", onPointerLockChange, false);
    document.addEventListener("mozpointerlockchange", onPointerLockChange, false); // Firefox
    document.addEventListener("webkitpointerlockchange", onPointerLockChange, false); // Chrome/Safari/Edge

    // --- Keyboard Input ---
    // Use Babylon's action manager or simple keydown/up listeners
    const keyMap = {}; // Keep track of pressed keys
    scene.onKeyboardObservable.add((kbInfo) => {
        const isDown = kbInfo.type === BABYLON.KeyboardEventTypes.KEYDOWN;
        const key = kbInfo.event.code; // Use event.code
        keyMap[key] = isDown;

        // Handle single-press actions on key down
        if (isDown) {
            onKeyDown_BJS(key); // Separate handler for single presses
        } else {
            onKeyUp_BJS(key); // Handle key up events if needed
        }

        // Update movement flags based on currently held keys
        // (UniversalCamera handles WASD automatically if attached, but we might need flags for running/custom logic)
        moveForward = keyMap['KeyW'] || keyMap['ArrowUp'] || false;
        moveBackward = keyMap['KeyS'] || keyMap['ArrowDown'] || false;
        moveLeft = keyMap['KeyA'] || keyMap['ArrowLeft'] || false;
        moveRight = keyMap['KeyD'] || keyMap['ArrowRight'] || false;
        const shiftPressed = keyMap['ShiftLeft'] || keyMap['ShiftRight'] || false;

        // Adjust camera speed for running
        if (isPointerLocked) { // Only adjust speed when playing
            if (shiftPressed && !isRunning) {
                isRunning = true;
                camera.speed = PLAYER_SPEED_RUN;
            } else if (!shiftPressed && isRunning) {
                isRunning = false;
                camera.speed = PLAYER_SPEED_WALK;
            }
        } else {
             isRunning = false; // Reset running state if pointer not locked
             camera.speed = PLAYER_SPEED_WALK;
        }

    });

    // --- Window Resize ---
    window.addEventListener("resize", () => {
        if (engine) {
            engine.resize();
            console.log("BJS: Engine resized.");
        }
    });

    console.log("BJS: Event Listeners Setup Complete.");
}

// Separate handlers for single key presses (KeyDown) and releases (KeyUp)
function onKeyDown_BJS(keyCode) {
    // Allow debug input anytime
    const allowDebugInput = ['KeyP', 'KeyM', 'KeyL', 'KeyK', 'Digit1', 'Digit2', 'Digit3', 'Digit4'].includes(keyCode);
    // Allow game input only when pointer is locked AND no menus are active
    const allowGameInput = isPointerLocked && menuDisplayTimer <= 0 && mapDisplayTimer <= 0;

    if (allowGameInput) {
        switch (keyCode) {
            case 'KeyR': startReload(); break;
            // Firing is handled by onPointerDown
        }
    }

    if (allowDebugInput) {
         switch (keyCode) {
            case 'KeyP': DEBUG_COLLISION = !DEBUG_COLLISION; console.log(`Collision Debug: ${DEBUG_COLLISION?'ON':'OFF'}`); /* TODO: Toggle Babylon collision visuals */ break;
            case 'KeyM': DEBUG_MAP_VISIBLE = !DEBUG_MAP_VISIBLE; console.log(`Map Always On: ${DEBUG_MAP_VISIBLE?'ON':'OFF'}`); /* Map visibility handled by drawDebugMap */ break;
            case 'KeyL': DEBUG_MOVEMENT = !DEBUG_MOVEMENT; console.log(`Movement Debug: ${DEBUG_MOVEMENT?'ON':'OFF'}`); break;
            case 'KeyK': DEBUG_AGENT = !DEBUG_AGENT; console.log(`Agent Debug: ${DEBUG_AGENT?'ON':'OFF'}`); break;
            case 'Digit1': if (debugMapCanvas) { debugMapCanvas.className = 'map-top-left'; if(DEBUG_MAP_VISIBLE || mapDisplayTimer > 0) debugMapCanvas.classList.add('visible'); } break;
            case 'Digit2': if (debugMapCanvas) { debugMapCanvas.className = 'map-top-right'; if(DEBUG_MAP_VISIBLE || mapDisplayTimer > 0) debugMapCanvas.classList.add('visible');} break;
            case 'Digit3': if (debugMapCanvas) { debugMapCanvas.className = 'map-bottom-left'; if(DEBUG_MAP_VISIBLE || mapDisplayTimer > 0) debugMapCanvas.classList.add('visible');} break;
            case 'Digit4': if (debugMapCanvas) { debugMapCanvas.className = 'map-bottom-right'; if(DEBUG_MAP_VISIBLE || mapDisplayTimer > 0) debugMapCanvas.classList.add('visible');} break;
        }
    }
}

function onKeyUp_BJS(keyCode) {
    // Handle key releases if needed (e.g., stopping an action)
    // Note: Running state is handled based on keyMap in the main observable
}


// =============================================================================
// Main Initialization Function (Babylon.js)
// =============================================================================
async function init_BJS() {
    console.log(`--- INIT BJS: Starting initialization (v1.43b) ---`);
    const canvas = document.getElementById("mazeCanvas");
    if (!canvas) {
        console.error("CRITICAL: Canvas element not found!");
        return;
    }

    // --- 1. Create Engine & Scene ---
    engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
    if (!engine) throw 'Engine should not be null.';
    scene = await createScene(); // createScene is async if using async imports/features
    if (!scene) {
        console.error("CRITICAL: Scene creation failed!");
        return;
    }

    // --- 2. Get DOM Elements & Setup HUD ---
    console.log("INIT BJS STEP 2: DOM Elements & HUD Setup.");
    if (!setupHUD()) { console.error("CRITICAL: HUD setup failed."); return; } // setupHUD now also gets blocker/instructions

    // --- 3. Maze Data Generation ---
    console.log("INIT BJS STEP 3: Maze Data Generation...");
    initMazeGrid();
    const startGenCell = mazeGrid[1]?.[1] || mazeGrid[0]?.[0];
    if (!startGenCell) { console.error("CRITICAL: Cannot find valid start cell for maze generation!"); return; }
    generateMaze(startGenCell);
    addCrossConnections(CROSS_CONNECTION_CHANCE);

    // --- 4. Create 3D Maze Geometry ---
    console.log("INIT BJS STEP 4: Creating Maze Geometry (Babylon)...");
    createMazeGeometry_BJS(); // Uses Babylon functions

    // --- 5. Set Player Start ---
    console.log("INIT BJS STEP 5: Setting Player Start (Babylon Camera)...");
    findLongestCorridorAndSetPlayerStart_BJS();

    // --- 6. Create Agents ---
    console.log(`INIT BJS STEP 6: Creating ${STARTING_AGENT_COUNT} Agents (Babylon)...`);
    createAgents_BJS(); // Placeholder

    // --- 7. Create Player Gun ---
    console.log("INIT BJS STEP 7: Creating Gun (Babylon)...");
    createGun_BJS(); // Placeholder

    // --- 8. Cache/Prepare Rabbit Assets ---
    console.log("INIT BJS STEP 8: Preparing Rabbit Assets (Babylon)...");
    // createRabbitGeometries_BJS(); // Placeholder if caching geometry

    // --- 9. Spawn Initial Rabbits ---
    console.log(`INIT BJS STEP 9: Spawning ${INITIAL_RABBIT_SPAWN_COUNT} initial rabbits (Babylon)...`);
    for (let i = 0; i < INITIAL_RABBIT_SPAWN_COUNT; i++) {
        spawnRabbit_BJS(); // Placeholder
    }

    // --- 10. Setup Event Listeners ---
    console.log("INIT BJS STEP 10: Setup Event Listeners (Babylon)...");
    setupEventListeners();

    // --- 11. Start Render Loop ---
    console.log("INIT BJS STEP 11: Starting Render Loop...");
    engine.runRenderLoop(() => {
        if (!scene) return; // Exit if scene is not ready

        const delta = engine.getDeltaTime() / 1000.0; // Get delta time in seconds
        const time = performance.now() / 1000.0; // Get elapsed time in seconds

        // --- Update Timers ---
        if (menuDisplayTimer > 0) {
            menuDisplayTimer -= delta;
            if (menuDisplayTimer <= 0) {
                 menuDisplayTimer = 0; isMenuDisplayedForRabbit = false;
                 // If pointer was unlocked *because* of the rabbit menu, show pause menu now
                 if (!isPointerLocked && !gameOver && !gameWon) {
                     updateMenuForPause();
                 }
            }
        }
        if (mapDisplayTimer > 0) {
            mapDisplayTimer -= delta;
            if (mapDisplayTimer <= 0) {
                mapDisplayTimer = 0;
                DEBUG_MAP_VISIBLE = false; // Turn map off when timer expires
                console.log("Map reveal timer expired.");
            }
        }

        // --- Update Game Logic (if not paused/over) ---
        if (isPointerLocked && !gameOver && !gameWon) {

            // Update player position state (useful for distance checks)
            playerPosition.copyFrom(camera.position);

             // Update player light position
             if (playerLight) {
                 playerLight.position.copyFrom(camera.position);
                 playerLight.position.y += 0.5; // Slightly above camera
             }

            // Gun updates
            handleShootingCooldown(delta);
            handleReloading(delta, time);
            // handleRecoilRecovery_BJS(delta); // TODO

            // World updates
            updateBullets_BJS(delta); // TODO
            updateAgents_BJS(delta, time); // TODO
            updateRabbits_BJS(delta, time); // TODO

            // Check win condition (player near exit)
            if (mazeExitPosition && BABYLON.Vector3.DistanceSquared(playerPosition, mazeExitPosition) < Math.pow(PLAYER_RADIUS * 1.5, 2)) {
                 triggerGameWin();
            }

             // Check agent collision (distance check for now)
             // TODO: Implement checkAgentCollisions_BJS if needed
        }

        // --- Visual Updates ---
         updateHUD(time); // Update HUD regardless of pause state
         drawDebugMap(time); // Update debug map

         // Wall Shimmer Effect (Example)
        // TODO: Need reference to wall material
        // if (!gameWon && !gameOver && wallMaterial_BJS) {
        //      const baseIntensity = 0.4; const shimmerAmount = 0.3;
        //      const wallShimmer = Math.sin(time * 1.5) * shimmerAmount + (baseIntensity + shimmerAmount / 2);
        //      wallMaterial_BJS.emissiveIntensity = wallShimmer; // Need to create this property or use emissiveTexture/Color directly
        // }

        // Exit Pulse Effect (Example)
        // TODO: Need reference to exit material
        // if (mazeExitObject_BJS && mazeExitObject_BJS.material) { ... }

        // Rabbit Shimmer Effect (Example)
        // TODO: Need reference to rabbit materials
        // const shimmerLerp = (Math.sin(time * RABBIT_SHIMMER_SPEED) + 1) / 2;
        // rabbitMaterial_BJS.diffuseColor = BABYLON.Color3.Lerp(RABBIT_COLOR_GREY, RABBIT_COLOR_WHITE, shimmerLerp);


        // --- Render the scene ---
        scene.render();
    });

    // --- Initial Menu Setup ---
    if (!gameOver && !gameWon) {
        if (instructionsSpan && instructionsSpan.dataset.initialText) {
            instructionsSpan.innerHTML = instructionsSpan.dataset.initialText; // Restore initial text
            instructionsSpan.dataset.originalText = instructionsSpan.dataset.initialText;
        }
         if(blockerElement) blockerElement.style.display = 'flex'; // Ensure blocker is visible initially
        startMenuEffects(); // Start effects on initial screen
    }
    console.log("--- DEBUG TOGGLES ---"); console.log(" P: Collision Debug | M: Map Always On | L: Movement Logs | K: Agent Logs"); console.log("---------------------");
    console.log("--- MAP CORNERS ---"); console.log(" 1: Top-Left | 2: Top-Right | 3: Bottom-Left | 4: Bottom-Right"); console.log("-------------------");
    console.log(`Matrix Maze Initialized (Babylon.js v1.43b). Click screen to start.`);
    console.log("--- INIT BJS: Finished ---");
}

// =============================================================================
// Start the Babylon.js Initialization Process
// =============================================================================
init_BJS(); // Call the main Babylon initialization function