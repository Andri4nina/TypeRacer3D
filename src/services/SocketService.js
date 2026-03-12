

import { RACE_TEXTS ,BOT_DEFS} from "../constants/Index";

// ── Socket event catalog (single source) ────────────────────
export const SE = {
  // emit (client → server)
  CREATE_ROOM:      "room:create",
  JOIN_ROOM:        "room:join",
  START_RACE:       "race:requestStart",
  PLAYER_PROGRESS:  "player:progress",
  // listen (server → client)
  ROOM_JOINED:      "room:joined",
  ROOM_UPDATE:      "room:update",
  COUNTDOWN:        "race:countdown",
  RACE_START:       "race:start",
  BOTS_PROGRESS:    "bots:progress",
  PLAYERS_PROGRESS: "players:progress",
  RACE_FINISHED:    "race:finished",
};

// ── Minimal event-emitter mock ───────────────────────────────
function createMockSocket() {
  const bus = {};
  return {
    id:    "P_" + Math.random().toString(36).slice(2, 5).toUpperCase(),
    on:    (ev, fn) => { bus[ev] = bus[ev] || []; bus[ev].push(fn); },
    off:   (ev, fn) => { if (bus[ev]) bus[ev] = bus[ev].filter(f => f !== fn); },
    emit:  () => {},                          // intercepted by attachMockServer
    _fire: (ev, d) => (bus[ev] || []).forEach(fn => fn(d)),
  };
}

// ── Mock server (no backend needed for preview) ──────────────
function wpmSpeed(wpm, len) {
  return (wpm * 5 / 60) * 0.1 / len;        // progress per 100 ms tick
}

export function attachMockServer(socket, name, color) {
  const text   = RACE_TEXTS[Math.floor(Math.random() * RACE_TEXTS.length)];
  const roomId = Math.random().toString(36).slice(2, 6).toUpperCase();
  let   raceIv = null;

  const ps = {
    id: socket.id, name, color,
    progress: 0, wpm: 0, errors: 0, finished: false, lane: 0, isBot: false,
  };

  // Intercept all emit() calls
  socket.emit = (ev, data) => {
    if (ev === SE.CREATE_ROOM || ev === SE.JOIN_ROOM) {
      setTimeout(() => socket._fire(SE.ROOM_JOINED, {
        roomId,
        state: { id: roomId, status: "waiting", text, host: socket.id, players: [{ ...ps }], scores: [] },
      }), 60);
    }
    if (ev === SE.START_RACE)       startCountdown();
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
      socket._fire(SE.BOTS_PROGRESS, bots.map(b => ({ id: b.id, progress: b.progress, finished: b.finished })));

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

// ── Singleton factory ────────────────────────────────────────
let _s = null;
export const getSocket   = () => { if (!_s) _s = createMockSocket(); return _s; };
export const resetSocket = () => { _s = null; };

// ── Production swap ──────────────────────────────────────────
// To connect a real server, replace getSocket() with:
//   import { io } from "socket.io-client";
//   export const getSocket = () => io("http://localhost:3001");