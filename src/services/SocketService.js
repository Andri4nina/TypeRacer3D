// ─────────────────────────────────────────────────────────────────────────────
// SocketService — single source of truth for all socket communication.
//
// MODES:
//   Solo / Bot Race  → attachMockServer()  (no backend needed)
//   Multiplayer      → real socket.io-client  (requires Node server on SERVER_URL)
//
// To change server URL: set VITE_SERVER_URL in .env  (default: localhost:3001)
// ─────────────────────────────────────────────────────────────────────────────

import {  RACE_TEXTS, BOT_DEFS } from "../constants/Index";

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
  BOTS_PROGRESS:    "bots:progress",
  PLAYERS_PROGRESS: "players:progress",
  RACE_FINISHED:    "race:finished",
};

// ── Minimal in-memory event emitter (mock socket shape) ──────────────────────
function createMockSocket() {
  const bus = {};
  return {
    id:       "P_" + Math.random().toString(36).slice(2, 5).toUpperCase(),
    isMock:   true,
    on:    (ev, fn) => { bus[ev] = bus[ev] || []; bus[ev].push(fn); },
    off:   (ev, fn) => { if (bus[ev]) bus[ev] = bus[ev].filter(f => f !== fn); },
    emit:  () => {},
    _fire: (ev, d) => (bus[ev] || []).forEach(fn => fn(d)),
    disconnect: () => {},
  };
}

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

// ── Mock server (solo + bot modes — no Node backend needed) ──────────────────
// import { RACE_TEXTS, BOT_DEFS } from "../constants";

function wpmSpeed(wpm, len) {
  return (wpm * 5 / 60) * 0.1 / len;
}

export function attachMockServer(socket, name, color) {
  const text   = RACE_TEXTS[Math.floor(Math.random() * RACE_TEXTS.length)];
  const roomId = Math.random().toString(36).slice(2, 6).toUpperCase();
  let   raceIv = null;

  const ps = {
    id: socket.id, name, color,
    progress: 0, wpm: 0, errors: 0, finished: false, lane: 0, isBot: false,
  };

  socket.emit = (ev, data) => {
    if (ev === SE.CREATE_ROOM || ev === SE.JOIN_ROOM) {
      setTimeout(() => socket._fire(SE.ROOM_JOINED, {
        roomId,
        state: { id: roomId, status: "waiting", text, host: socket.id, players: [{ ...ps }], scores: [] },
      }), 60);
    }
    if (ev === SE.START_RACE) startCountdown();
    if (ev === SE.PLAYER_PROGRESS && data) {
      Object.assign(ps, data);
      if (data.progress >= 1) ps.finished = true;
    }
  };

  function startCountdown() {
    let c = 3;
    socket._fire(SE.COUNTDOWN, c);
    const iv = setInterval(() => {
      c--;
      if (c > 0) socket._fire(SE.COUNTDOWN, c);
      else { clearInterval(iv); startRace(); }
    }, 1000);
  }

  function startRace() {
    const bots = BOT_DEFS.map((b, i) => ({
      ...b, lane: 1 + i,
      speed: wpmSpeed(b.wpm, text.length),
      progress: 0, finished: false,
    }));
    socket._fire(SE.RACE_START, { startTime: Date.now(), bots });

    raceIv = setInterval(() => {
      bots.forEach(b => {
        if (!b.finished) {
          b.progress = Math.min(1, b.progress + b.speed * (1 + (Math.random() - 0.5) * 0.15));
          if (b.progress >= 1) b.finished = true;
        }
      });
      socket._fire(SE.BOTS_PROGRESS, bots.map(b => ({
        id: b.id, progress: b.progress, finished: b.finished,
      })));

      if (bots.every(b => b.finished) && ps.finished) {
        clearInterval(raceIv);
        const scores = [
          { name, wpm: ps.wpm, errors: ps.errors, isBot: false, color },
          ...BOT_DEFS.map(b => ({ name: b.name, wpm: b.wpm, errors: 0, isBot: true, color: b.color })),
        ].sort((a, b) => b.wpm - a.wpm);
        setTimeout(() => socket._fire(SE.RACE_FINISHED, { scores }), 400);
      }
    }, 100);
  }
}

// ── Singletons ────────────────────────────────────────────────────────────────
let _mockSocket = null;

export function getMockSocket() {
  if (!_mockSocket) _mockSocket = createMockSocket();
  return _mockSocket;
}

export function resetSocket() {
  if (_mockSocket) { _mockSocket.disconnect?.(); _mockSocket = null; }
}

// Legacy alias used by solo/bot paths
export const getSocket = getMockSocket;