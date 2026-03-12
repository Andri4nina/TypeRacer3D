// ─── Screens ────────────────────────────────────────────────
export const SCREENS = {
    LOBBY:   "lobby",
    WAITING: "waiting",
    RACE:    "race",
  };
  
  // ─── Game modes ──────────────────────────────────────────────
  export const GAME_MODES = {
    SOLO:        "solo",        // practice alone, no opponents
    BOT_RACE:    "bot_race",    // race against AI bots
    MULTIPLAYER: "multiplayer", // socket.io room
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
  ];
  
  // ─── Bot definitions ─────────────────────────────────────────
  // wpm 10 (slowest) → 216 (world record ~212 WPM)
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
  // Add your GLB files to /public/cars/ and register them here.
  // The built-in "default" always works — no file needed.
  //
  // Fields:
  //   id        – unique key used everywhere in code
  //   name      – display name in the selector
  //   file      – path relative to /public  (null = use procedural fallback)
  //   scale     – uniform scale applied after load
  //   offsetY   – vertical offset so the car sits on the road (tune per model)
  //   colorMesh – regex or string matching mesh names that receive the player colour
  //               set to null to tint the entire model
  export const CAR_MODELS = [
    {
      id:        "default",
      name:      "F1 — Classic",
      emoji:     "🏎️",
      file:      null,          // procedural Three.js fallback
      scale:     1.0,
      offsetY:   0,
      colorMesh: null,
      preview:   "#f59e0b",    // accent used in the selector card
    },
    // ── Slot 1 ── drop your first GLB here ──────────────────────
    {
      id:        "car_01",
      name:      "Model Slot 1",
      emoji:     "🚗",
      file:      "/cars/NissanGTR.glb",   // place file in /public/cars/
      scale:     1.0,
      offsetY:   0,
      colorMesh: null,                 // null = tint all meshes
      preview:   "#3b82f6",
    },
    // ── Slot 2 ─────────────────────────────────────────────────
    {
      id:        "car_02",
      name:      "Model Slot 2",
      emoji:     "🏍️",
      file:      "/cars/car_02.glb",
      scale:     1.0,
      offsetY:   0,
      colorMesh: null,
      preview:   "#22c55e",
    },
    // ── Slot 3 ─────────────────────────────────────────────────
    {
      id:        "car_03",
      name:      "Model Slot 3",
      emoji:     "🚕",
      file:      "/cars/car_03.glb",
      scale:     1.0,
      offsetY:   0,
      colorMesh: null,
      preview:   "#a855f7",
    },
    // ── Slot 4 ─────────────────────────────────────────────────
    {
      id:        "car_04",
      name:      "Model Slot 4",
      emoji:     "🚙",
      file:      "/cars/car_04.glb",
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