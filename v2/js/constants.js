// =============================================================================
// js/constants.js - All Game Constants
// Version: 1.47g
// =============================================================================

console.log("Loading Constants...");

// --- Mouse Sensitivity ---
const MOUSE_SENSITIVITY_SETTING = 5; // Range 1-10 recommended
// Convert setting to Babylon's angularSensibility (Lower value = more sensitive)
const BJS_ANGULAR_SENSITIVITY = 10000 / (MOUSE_SENSITIVITY_SETTING * 1.5 + 3); // Adjust formula as needed

// --- Maze ---
const PATH_WIDTH_SETTING = 5;
const MAZE_GRID_SCALE = Math.max(3, Math.floor(PATH_WIDTH_SETTING) * 2 + 1);
const MAZE_WIDTH_CELLS = 12;
const MAZE_HEIGHT_CELLS = 12;
const CELL_SIZE = 10;
const MAZE_WIDTH_UNITS = MAZE_WIDTH_CELLS * MAZE_GRID_SCALE * CELL_SIZE;
const MAZE_HEIGHT_UNITS = MAZE_HEIGHT_CELLS * MAZE_GRID_SCALE * CELL_SIZE;
const WALL_HEIGHT = 30;
const WALL_HEIGHT_SHORT = 8;
const WALL_THICKNESS = CELL_SIZE;
const SHORT_WALL_CHANCE = 0.08;
const CROSS_CONNECTION_CHANCE = 0.25; // Re-enabled
const DOOR_HEIGHT_FACTOR = 0.85;
const DOOR_WIDTH_FACTOR = 0.4;
const DOOR_DEPTH = 0.3;

// --- Player ---
const PLAYER_HEIGHT = WALL_HEIGHT * 0.5;
const PLAYER_EYE_HEIGHT = WALL_HEIGHT * 0.85;
const PLAYER_RADIUS = PLAYER_HEIGHT * 0.25;
const PLAYER_COLLISION_HEIGHT = PLAYER_EYE_HEIGHT * 1.5;
const PLAYER_MAX_HP = 100;
const PLAYER_SPEED_WALK = 12.0;
const PLAYER_SPEED_RUN = 24.0;
const DAMAGE_OVERLAY_FADE_OUT_TIME = 80;
const DAMAGE_OVERLAY_FADE_IN_TIME = 80;
const PLAYER_DAMAGE_SHAKE_DURATION = 0.15;
const PLAYER_DAMAGE_SHAKE_INTENSITY_POS = 0.10;
const PLAYER_DAMAGE_SHAKE_INTENSITY_ROT = 0.008;
const PLAYER_KEYS_UP = ["KeyW", "ArrowUp"];
const PLAYER_KEYS_DOWN = ["KeyS", "ArrowDown"];
const PLAYER_KEYS_LEFT = ["KeyA", "ArrowLeft"];
const PLAYER_KEYS_RIGHT = ["KeyD", "ArrowRight"];
const PLAYER_KEYS_RUN = ["ShiftLeft", "ShiftRight"];
const PLAYER_KEYS_RELOAD = ["KeyR"];
const PLAYER_KEYS_FIRE = ["Fire1"]; // Babylon mapping for left mouse

// --- Gun ---
const GUN_CLIP_SIZE = 12;
const GUN_RELOAD_TIME = 1.5;
const GUN_FIRE_RATE = 0.15;
const GUN_FORWARD_OFFSET = 1.2;
const GUN_RIGHT_OFFSET = 0.35;
const GUN_DOWN_OFFSET = -0.3;
const GUN_BARREL_LENGTH = 0.4;
const GUN_BARREL_RADIUS = 0.04;
const GUN_HANDLE_HEIGHT = 0.25;
const GUN_HANDLE_WIDTH = 0.08;
const GUN_HANDLE_DEPTH = 0.15;

// --- Bullet ---
const BULLET_SPEED = 400.0;
const BULLET_SIZE = 0.15;
const AGENT_BULLET_SIZE = 0.3;
const BULLET_LIFESPAN = 2.0;

// --- Agent ---
const STARTING_AGENT_COUNT = 2;
const AGENT_HP = 2;
const AGENT_BODY_WIDTH = PLAYER_RADIUS * 0.5 * 2;
const AGENT_BODY_HEIGHT = PLAYER_HEIGHT * 0.9;
const AGENT_BODY_DEPTH_FACTOR = 0.5;
const AGENT_HEAD_SIZE = PLAYER_RADIUS * 0.7 * 1.5;
const AGENT_COLLISION_DISTANCE = PLAYER_RADIUS + AGENT_BODY_WIDTH * 0.8;
const AGENT_HIT_COLOR_HEX = 0xff0000;
const AGENT_HIT_DURATION = 0.15;
const AGENT_HP_BAR_DURATION = 3.0;
const AGENT_HP_BAR_WIDTH = AGENT_BODY_WIDTH * 1.5;
const AGENT_SPEED_PATROL = 8.0;
const AGENT_SPEED_ATTACK = 16.0;
const AGENT_LOS_CHECK_INTERVAL = 0.25;
const AGENT_MAX_VIEW_DISTANCE = CELL_SIZE * MAZE_GRID_SCALE * 6;
const AGENT_TIME_TO_LOSE_TARGET = 1.5;
const AGENT_SEARCH_DURATION = 6.0;
const AGENT_TURN_SPEED = Math.PI * 0.8;
const AGENT_FIRE_RATE = 0.7;
const AGENT_BULLET_SPEED = 800.0;
const AGENT_BULLET_DAMAGE = 12;
const AGENT_BULLET_SPREAD = 0.04;
const AGENT_MELEE_RANGE = PLAYER_RADIUS + AGENT_BODY_WIDTH * 1.8;
const AGENT_MELEE_DAMAGE = 8;
const AGENT_MELEE_COOLDOWN = 1.5;
const AGENT_MELEE_BURST_COUNT_MIN = 2;
const AGENT_MELEE_BURST_COUNT_MAX = 4;
const AGENT_MELEE_BURST_INTERVAL = 0.2;
const AGENT_TARGET_CELL_RECALC_INTERVAL = 0.5;
const AGENT_WAYPOINT_THRESHOLD = CELL_SIZE * 0.2;
const AGENT_STUCK_TIMEOUT = 5.0;

// --- Rabbit ---
const INITIAL_RABBIT_SPAWN_COUNT = 2;
const MAX_RABBITS = 4;
const RABBIT_SPAWN_INTERVAL = 15.0;
const RABBIT_MAP_REVEAL_DURATION = 3.0;
const RABBIT_PICKUP_MENU_DURATION = 5.0;
const RABBIT_PICKUP_DISTANCE_FACTOR = 1.8;
const RABBIT_INSTANCE_SCALE = 3.0;
const RABBIT_GROUND_LEVEL = 0.01;
const RABBIT_BODY_RADIUS = 0.5 * 0.75; const RABBIT_BODY_HEIGHT = 0.8; const RABBIT_HEAD_RADIUS = 0.5;
const RABBIT_COLOR_WHITE = new BABYLON.Color3(1, 1, 1);
const RABBIT_COLOR_GREY = new BABYLON.Color3(0.8, 0.8, 0.8);
const RABBIT_NOSE_COLOR_BJS = new BABYLON.Color3.FromHexString("#ffa7bd");
const RABBIT_SHIMMER_SPEED = 3.0;

// --- Map ---
const DEBUG_MAP_CANVAS_SIZE = 400;
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

// --- Debugging --- (Moved flags to main.js where they are used)

console.log("Constants Loaded.");
// end of file