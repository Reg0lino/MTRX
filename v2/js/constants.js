// =============================================================================
// js/constants.js - All Game Constants
// Version: 1.47q (Wider Corridors, Smaller Rabbits, Sensitivity Fix)
// =============================================================================

console.log("Loading Constants (v1.47q - Wider Corridors, Sensitivity)...");

// --- Player Base Size ---
const PLAYER_UNIT_HEIGHT = 1.8;

// --- Player Derived Dimensions ---
const PLAYER_EYE_HEIGHT = PLAYER_UNIT_HEIGHT * 0.9; // ~1.62
const PLAYER_COLLISION_HEIGHT = PLAYER_UNIT_HEIGHT * 0.85; // ~1.53
// Keep radius small as per previous test, diameter = 0.4
const PLAYER_RADIUS = 0.2;

// --- Maze Scale Settings ---
// Keep path 3 visual cells wide for now
const PATH_VISUAL_WIDTH = 3;
const MAZE_GRID_SCALE = PATH_VISUAL_WIDTH + 2; // 5

// --- Environment Scale (Derived for WIDER Corridors) ---
// Target corridor width ~2.0x player diameter
const desiredCorridorWidth = (PLAYER_RADIUS * 2) * 2.0; // Target ~0.8
// Calculate CELL_SIZE based on target width and visual path width
const CELL_SIZE = desiredCorridorWidth / PATH_VISUAL_WIDTH; // NEW CELL_SIZE (~0.267)
// Wall height relative to player
const WALL_HEIGHT = PLAYER_UNIT_HEIGHT * 1.3; // ~2.34
const WALL_THICKNESS = CELL_SIZE; // Wall thickness matches new cell size (~0.267)
const WALL_HEIGHT_SHORT = WALL_HEIGHT * 0.3; // ~0.7

// Logical maze grid size
const MAZE_WIDTH_CELLS = 12;
const MAZE_HEIGHT_CELLS = 12;

// Total maze dimensions (calculated from above)
const MAZE_WIDTH_UNITS = MAZE_WIDTH_CELLS * MAZE_GRID_SCALE * CELL_SIZE;
const MAZE_HEIGHT_UNITS = MAZE_HEIGHT_CELLS * MAZE_GRID_SCALE * CELL_SIZE;

// Maze generation features
const CROSS_CONNECTION_CHANCE = 0.25;
// Door dimensions relative to walls/cells
const DOOR_HEIGHT_FACTOR = 0.85; const DOOR_WIDTH_FACTOR = 0.4; const DOOR_DEPTH = CELL_SIZE * 0.5;

// --- Mouse Sensitivity ---
// *** ADJUSTED BASED ON FEEDBACK ***
const BJS_ANGULAR_SENSITIVITY = 400; // Lower value = faster/more sensitive

// --- Player Gameplay ---
const PLAYER_MAX_HP = 100;
// Speeds relative to player height
const PLAYER_SPEED_WALK = PLAYER_UNIT_HEIGHT * 1.2; // ~2.16
const PLAYER_SPEED_RUN = PLAYER_UNIT_HEIGHT * 2.4; // ~4.32

// Input keys remain the same
const PLAYER_KEYS_UP = ["KeyW", "ArrowUp"]; const PLAYER_KEYS_DOWN = ["KeyS", "ArrowDown"]; const PLAYER_KEYS_LEFT = ["KeyA", "ArrowLeft"]; const PLAYER_KEYS_RIGHT = ["KeyD", "ArrowRight"]; const PLAYER_KEYS_RUN = ["ShiftLeft", "ShiftRight"]; const PLAYER_KEYS_RELOAD = ["KeyR"];

// --- Gun (Placeholder Values) ---
const GUN_CLIP_SIZE = 12; const GUN_RELOAD_TIME = 1.5; const GUN_FIRE_RATE = 0.15;
const GUN_FORWARD_OFFSET = 0.5; const GUN_RIGHT_OFFSET = 0.15; const GUN_DOWN_OFFSET = -0.15;
const GUN_BARREL_LENGTH = 0.15; const GUN_BARREL_RADIUS = 0.015; const GUN_HANDLE_HEIGHT = 0.1; const GUN_HANDLE_WIDTH = 0.03; const GUN_HANDLE_DEPTH = 0.05;

// --- Bullet (Scaled) ---
const BULLET_SPEED = 20.0; const BULLET_SIZE = 0.02; const AGENT_BULLET_SIZE = 0.04; const BULLET_LIFESPAN = 1.5;

// --- Agent (Scaled Relative to Player) ---
const STARTING_AGENT_COUNT = 2; const AGENT_HP = 2;
const AGENT_BODY_HEIGHT = PLAYER_COLLISION_HEIGHT * 0.9; const AGENT_BODY_WIDTH = PLAYER_RADIUS * 0.8; const AGENT_HEAD_SIZE = PLAYER_RADIUS * 0.6; const AGENT_BODY_DEPTH_FACTOR = 0.5;
const AGENT_SPEED_PATROL = PLAYER_SPEED_WALK * 0.7; const AGENT_SPEED_ATTACK = PLAYER_SPEED_RUN * 0.7;
const AGENT_MAX_VIEW_DISTANCE = CELL_SIZE * MAZE_GRID_SCALE * 15; const AGENT_MELEE_RANGE = PLAYER_RADIUS + AGENT_BODY_WIDTH * 1.8;
const AGENT_COLLISION_DISTANCE = PLAYER_RADIUS + AGENT_BODY_WIDTH * 0.8;
// Other agent constants largely unchanged from 1.47o

// --- Rabbit ---
// *** REDUCED RABBIT SCALE SIGNIFICANTLY ***
const RABBIT_INSTANCE_SCALE = 0.5; // Drastically smaller scale
const RABBIT_GROUND_LEVEL = 0.01;
// Keep base geometry small
const RABBIT_BODY_RADIUS = 0.15; const RABBIT_BODY_HEIGHT = 0.2; const RABBIT_HEAD_RADIUS = 0.1;
const INITIAL_RABBIT_SPAWN_COUNT = 2; const MAX_RABBITS = 4; const RABBIT_SPAWN_INTERVAL = 15.0;
// Other rabbit constants largely unchanged from 1.47o

// --- Map / HUD / Effects (Unchanged) ---
const DEBUG_MAP_CANVAS_SIZE = 400; /* ... other map/hud constants ... */

console.log("Constants Loaded (v1.47q - Wider Corridors, Sensitivity Fix).");
console.log(`>> PLAYER_RADIUS: ${PLAYER_RADIUS.toFixed(2)}, Player Diameter: ${(PLAYER_RADIUS * 2).toFixed(2)}`);
console.log(`>> CELL_SIZE: ${CELL_SIZE.toFixed(2)}, Corridor Width: ${(PATH_VISUAL_WIDTH * CELL_SIZE).toFixed(2)}`);
console.log(`>> Mouse Look Sensitivity (BJS_ANGULAR_SENSITIVITY): ${BJS_ANGULAR_SENSITIVITY}`);
console.log(`>> RABBIT_INSTANCE_SCALE: ${RABBIT_INSTANCE_SCALE}`);