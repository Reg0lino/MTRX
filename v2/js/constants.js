// =============================================================================
// js/constants.js - All Game Constants
// Version: 1.48d (Fix Const Order + Restore Gun Offsets)
// =============================================================================

console.log("Loading Constants (v1.48d - Fix Const Order + Gun Offsets)..."); // Version Updated

// --- Player Base Size ---
const PLAYER_UNIT_HEIGHT = 1.8;
const PLAYER_EYE_HEIGHT = PLAYER_UNIT_HEIGHT * 0.9;
const PLAYER_COLLISION_HEIGHT = PLAYER_UNIT_HEIGHT * 0.85;
const PLAYER_RADIUS = 0.2;

// --- Maze Scale Settings ---
const PATH_VISUAL_WIDTH = 5;
const MAZE_GRID_SCALE = PATH_VISUAL_WIDTH + 2;
const MAZE_WIDTH_CELLS = 12;
const MAZE_HEIGHT_CELLS = 12;
const CELL_SIZE = 0.64; // Reverted to wider corridors

const WALL_HEIGHT = 2.0;
const WALL_HEIGHT_SHORT = 0.6;
const WALL_THICKNESS = CELL_SIZE;
const MAZE_WIDTH_UNITS = MAZE_WIDTH_CELLS * MAZE_GRID_SCALE * CELL_SIZE;
const MAZE_HEIGHT_UNITS = MAZE_HEIGHT_CELLS * MAZE_GRID_SCALE * CELL_SIZE;
const CROSS_CONNECTION_CHANCE = 0.25;
const DOOR_HEIGHT_FACTOR = 0.85; const DOOR_WIDTH_FACTOR = 0.4; const DOOR_DEPTH = CELL_SIZE * 0.5;

// --- Mouse Sensitivity ---
const BJS_ANGULAR_SENSITIVITY = 400;

// --- Player Gameplay ---
const PLAYER_MAX_HP = 100;
const PLAYER_SPEED_WALK = 1.5;
const PLAYER_SPEED_RUN = 3.0;
const PLAYER_JUMP_FORCE = 4.0;
const PLAYER_KEYS_UP = ["KeyW", "ArrowUp"]; const PLAYER_KEYS_DOWN = ["KeyS", "ArrowDown"]; const PLAYER_KEYS_LEFT = ["KeyA", "ArrowLeft"]; const PLAYER_KEYS_RIGHT = ["KeyD", "ArrowRight"]; const PLAYER_KEYS_RUN = ["ShiftLeft", "ShiftRight"]; const PLAYER_KEYS_RELOAD = ["KeyR"];
const PLAYER_KEYS_JUMP = ["Space"];

// --- Gun ---
const GUN_CLIP_SIZE = 12; const GUN_RELOAD_TIME = 1.5; const GUN_FIRE_RATE = 0.15;
// *** RESTORED GUN OFFSET CONSTANTS ***
const GUN_FORWARD_OFFSET = 1.2 * 0.3;
const GUN_RIGHT_OFFSET = 0.35 * 0.3;
const GUN_DOWN_OFFSET = -0.3 * 0.3;
const GUN_BARREL_LENGTH = 0.4 * 0.3; const GUN_BARREL_RADIUS = 0.04 * 0.3; const GUN_HANDLE_HEIGHT = 0.25 * 0.3; const GUN_HANDLE_WIDTH = 0.08 * 0.3; const GUN_HANDLE_DEPTH = 0.15 * 0.3;

// --- Bullet ---
const BULLET_SPEED = 800.0; // Revert to original bullet speed
const BULLET_SIZE = 0.08;   // Revert to original bullet size
const AGENT_BULLET_SIZE = 0.3;
const BULLET_LIFESPAN = 2.0;

// --- Agent --- (Rest unchanged)
const STARTING_AGENT_COUNT = 2; /* ... other agent constants ... */; const DEBUG_MAP_ENTITY_FLICKER_COLOR = 'rgba(255, 255, 255, 0.85)';

// --- Rabbit --- (Rest unchanged)
const INITIAL_RABBIT_SPAWN_COUNT = 2; /* ... other rabbit constants ... */; const RABBIT_SHIMMER_SPEED = 3.0;

// --- Map --- (Rest unchanged)
const DEBUG_MAP_CANVAS_SIZE = 400; /* ... other map constants ... */; const MENU_GLITCH_CHARS = ['█','▓','▒','░','_','^','~','!','*',';',':','|','/','\\',' '];


console.log("Constants Loaded (v1.48d - Fix Const Order + Gun Offsets)."); // Version Updated
console.log(`>> PLAYER_RADIUS: ${PLAYER_RADIUS.toFixed(2)}, Player Diameter: ${(PLAYER_RADIUS * 2).toFixed(2)} (Collision Size)`);
console.log(`>> CELL_SIZE: ${CELL_SIZE.toFixed(2)}, Corridor Width: ${(PATH_VISUAL_WIDTH * CELL_SIZE).toFixed(2)}`);
console.log(`>> Mouse Look Sensitivity (BJS_ANGULAR_SENSITIVITY): ${BJS_ANGULAR_SENSITIVITY}`);