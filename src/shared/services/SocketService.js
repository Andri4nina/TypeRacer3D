// ─────────────────────────────────────────────────────────────────────────────
// SocketService — single source of truth for all socket communication.
//
// MODES:
//   Solo / Bot Race  → 100 % client, aucun socket utilisé
//                      (les bots sont simulés par BotsProgressViewModel)
//   Multiplayer      → real socket.io-client  (requires Node server on SERVER_URL)
//
// To change server URL: set VITE_SERVER_URL in .env
// ─────────────────────────────────────────────────────────────────────────────

// ── Server URL ───────────────────────────────────────────────────────────────
export const SERVER_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SERVER_URL) ||
  "https://servertyperacer3d.onrender.com";

// ── Socket event catalog (must match Index.js exactly) ───────────────────────
export const SE = {
  // emit (client → server)
  CREATE_ROOM:      "room:create",
  JOIN_ROOM:        "room:join",
  START_RACE:       "race:requestStart",
  PLAYER_PROGRESS:  "player:progress",
  ROOMS_LIST:       "rooms:list",
  // listen (server → client)
  ROOM_JOINED:      "room:joined",
  ROOM_UPDATE:      "room:update",
  ROOM_ERROR:       "room:error",
  ROOMS_REFRESH:    "rooms:refresh",
  COUNTDOWN:        "race:countdown",
  RACE_START:       "race:start",
  PLAYERS_PROGRESS: "players:progress",
  RACE_ENDS_IN:     "race:endsIn",
  RACE_FINISHED:    "race:finished",
  REMATCH:          "room:rematch",
};

// ── Real socket.io-client (async, lazy) ─────────────────────────────────────
export async function createRealSocket() {
  const { io } = await import("socket.io-client");
  const socket  = io(SERVER_URL, {
    transports: ["websocket", "polling"],
    reconnectionAttempts: 5,
    timeout: 6000,
  });
  // Wait for connection or error
  await new Promise((resolve, reject) => {
    socket.once("connect",        resolve);
    socket.once("connect_error",  reject);
  });
  return socket;
}