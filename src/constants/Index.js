// ─── Screens ────────────────────────────────────────────────
export const SCREENS = {
  LOBBY:   "lobby",
  WAITING: "waiting",
  RACE:    "race",
};

// ─── Game modes ──────────────────────────────────────────────
export const GAME_MODES = {
  SOLO:        "solo",
  BOT_RACE:    "bot_race",
  MULTIPLAYER: "multiplayer",
};

// ─── Race lifecycle ──────────────────────────────────────────
export const RACE_STATUS = {
  IDLE:      "idle",
  COUNTDOWN: "countdown",
  RACING:    "racing",
  FINISHED:  "finished",
};

// ─── Race texts ──────────────────────────────────────────────
export const RACE_TEXTS = [
  "The quick brown fox jumps over the lazy dog and races across the finish line at full speed.",
  "Speed is the ultimate thrill that pushes racing drivers to the very edge of human limits.",
  "Every second counts when you are driving at full throttle on a professional race circuit.",
  "The engine roars and the tires screech as the car tears through each tight corner on track.",
  "Motorsport is the perfect blend of raw engineering precision and fearless human courage.",
  "The race begins the moment your fingers hit the keys and your car surges down the straight.",
  "Fast reflexes and sharp focus are the two things every champion driver must master to win.",
  "The checkered flag waves as the fastest typist crosses the line in a blaze of speed and glory.",
  "Under the bright lights of the racing circuit the engines roar like thunder while drivers grip their steering wheels with intense concentration knowing that even the smallest mistake could cost them victory as they accelerate down the straight chasing speed and glory.",
  "The moment the lights turn green every driver launches forward with explosive power pushing their machines to the absolute limit while the crowd watches in awe as cars weave through corners with breathtaking precision and unstoppable momentum.",
  "A professional race is not only about speed but also about strategy patience and mental strength as drivers calculate every move perfectly while battling rivals lap after lap until the final moments of the race decide the ultimate champion.",
  "As the race continues the tension grows stronger with each passing second the engines scream the tires grip the asphalt and the drivers remain locked in fierce competition determined to cross the finish line first no matter how intense the battle becomes.",
  "In the world of racing every millisecond matters because the difference between victory and defeat can be smaller than a blink of an eye which is why drivers train endlessly to sharpen their reflexes focus and control under extreme pressure."
];

// ─── Bot definitions ─────────────────────────────────────────
export const BOT_DEFS = [
  { id: "bot_0", name: "SLUG",  color: "#64748b", wpm: 10,  label: "Beginner"     },
  { id: "bot_1", name: "TITAN", color: "#3b82f6", wpm: 45,  label: "Easy"         },
  { id: "bot_2", name: "VIPER", color: "#22c55e", wpm: 80,  label: "Medium"       },
  { id: "bot_3", name: "BLAZE", color: "#f59e0b", wpm: 130, label: "Hard"         },
  { id: "bot_4", name: "STORM", color: "#a855f7", wpm: 180, label: "Expert"       },
  { id: "bot_5", name: "APEX",  color: "#ef4444", wpm: 216, label: "World Record" },
];

// ─── Player color palette ────────────────────────────────────
export const PLAYER_COLORS = [
  "#f59e0b", "#ef4444", "#3b82f6", "#22c55e",
  "#a855f7", "#ec4899", "#06b6d4", "#f97316",
];

// ─── Car model catalogue ─────────────────────────────────────
// file: null  → procedural Three.js mesh (always works, no file needed)
// file: "/cars/mycar.glb" → drop the GLB in /public/cars/ first
//
// To add a real model:
//   1. Copy the .glb to /public/cars/yourcar.glb
//   2. Change file: null → file: "/cars/yourcar.glb"
//   3. Tune scale / offsetY until it looks right on the track
export const CAR_MODELS = [
  {
    id:        "default",
    name:      "F1 Classic",
    emoji:     "🏎️",
    file:      null,          // built-in procedural mesh
    scale:     1.0,
    offsetY:   0,
    colorMesh: null,          // null = tint the whole mesh
    preview:   "#f59e0b",
  },
  {
    id:        "car_01",
    name:      "Slot 1",
    emoji:     "🚗",
    file:      "/cars/NissanGTR.glb",          // ← replace with "/cars/car_01.glb" when ready
    scale:     1.0,
    offsetY:   0,
    colorMesh: null,
    preview:   "#3b82f6",
  },
  {
    id:        "car_02",
    name:      "Slot 2",
    emoji:     "🏍️",
    file:      null,          // ← replace with "/cars/car_02.glb" when ready
    scale:     1.0,
    offsetY:   0,
    colorMesh: null,
    preview:   "#22c55e",
  },
  {
    id:        "car_03",
    name:      "Slot 3",
    emoji:     "🚕",
    file:      null,          // ← replace with "/cars/car_03.glb" when ready
    scale:     1.0,
    offsetY:   0,
    colorMesh: null,
    preview:   "#a855f7",
  },
  {
    id:        "car_04",
    name:      "Slot 4",
    emoji:     "🚙",
    file:      null,          // ← replace with "/cars/car_04.glb" when ready
    scale:     1.0,
    offsetY:   0,
    colorMesh: null,
    preview:   "#ef4444",
  },
];

export const DEFAULT_CAR_ID = "default";

// ─── 3-D track constants ─────────────────────────────────────
export const TRACK_LENGTH = 314;
export const LANE_WIDTH   = 2.2;