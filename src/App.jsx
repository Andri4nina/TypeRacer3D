/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/refs */


import { useState, useRef, useCallback } from "react";
import { LobbyScreen }  from "./views/lobby/LobbyScreen";
import { WaitingRoom }  from "./views/waiting/WaitingRoom";
import { RaceScreen }   from "./views/race/RaceScreen";
import {  SCREENS, GAME_MODES, RACE_TEXTS, BOT_DEFS } from "./constants/Index";
import {
  getMockSocket, createRealSocket, resetSocket,
  attachMockServer, SE,
} from "./services/SocketService";


export default function App() {
  const [screen,    setScreen]    = useState(SCREENS.LOBBY);
  const [session,   setSession]   = useState(null);
  const [roomState, setRoomState] = useState(null);
  const [netError,  setNetError]  = useState("");
  const socketRef    = useRef(null);
  const roomStateRef = useRef(null); // always up-to-date, safe inside closures

  function updateRoomState(state) {
    roomStateRef.current = state;
    setRoomState(state);
  }

  function teardown() {
    try { socketRef.current?.disconnect?.(); } catch (_) { /* empty */ }
    socketRef.current    = null;
    roomStateRef.current = null;
    resetSocket();
    setSession(null);
    setRoomState(null);
    setNetError("");
  }

  // Build definitive player list from latest room state + bot defs
  function buildRacePlayers(roomSt, mode) {
    const humans = (roomSt?.players ?? []).map((p, i) => ({ ...p, lane: i, isBot: false }));
    if (mode === GAME_MODES.SOLO) return humans;
    const bots   = BOT_DEFS.map((b, i) => ({ ...b, lane: humans.length + i, isBot: true }));
    return [...humans, ...bots];
  }

  const handleEnter = useCallback(async ({ mode, name, color, carModelId, action, roomId }) => {
    teardown();

    // ── SOLO ──────────────────────────────────────────────────────────────
    if (mode === GAME_MODES.SOLO) {
      const socket    = getMockSocket();
      socketRef.current = socket;
      attachMockServer(socket, name, color);
      const text      = RACE_TEXTS[Math.floor(Math.random() * RACE_TEXTS.length)];
      const playerDef = { id: socket.id, name, color, lane: 0, isBot: false };
      setSession({ mode, name, color, carModelId, text, players: [playerDef] });
      setScreen(SCREENS.RACE);
      return;
    }

    // ── BOT RACE ──────────────────────────────────────────────────────────
    if (mode === GAME_MODES.BOT_RACE) {
      const socket    = getMockSocket();
      socketRef.current = socket;
      attachMockServer(socket, name, color);
      const text       = RACE_TEXTS[Math.floor(Math.random() * RACE_TEXTS.length)];
      const playerDef  = { id: socket.id, name, color, lane: 0, isBot: false };
      const allPlayers = buildRacePlayers({ players: [playerDef] }, mode);
      const fakeRoom   = { id: "LOCAL", host: socket.id, status: "waiting", text, players: [playerDef], scores: [] };

      updateRoomState(fakeRoom);
      setSession({ mode, name, color, carModelId, text, players: allPlayers });

      // Switch to race screen on FIRST countdown tick — RaceScreen handles its own 3-2-1
      let switched = false;
      socket.on(SE.COUNTDOWN, () => {
        if (!switched) {
          switched = true;
          setScreen(SCREENS.RACE);
        }
      });

      socket.emit(SE.CREATE_ROOM, { name, color });
      setScreen(SCREENS.WAITING);
      return;
    }

    // ── MULTIPLAYER ────────────────────────────────────────────────────────
    if (mode === GAME_MODES.MULTIPLAYER) {
      let socket;
      try {
        socket = await createRealSocket();
      } catch (err) {
        setNetError(
          `Impossible de rejoindre le serveur.\n` +
          `Vérifiez que Index.js tourne (port 3001).\n${err?.message ?? err}`
        );
        return;
      }
      socketRef.current = socket;

      socket.on(SE.ROOM_ERROR,  msg => setNetError(msg));
      socket.on("disconnect",   ()  => setNetError("Déconnecté du serveur."));

      socket.on(SE.ROOM_JOINED, ({ state }) => {
        updateRoomState(state);
        setSession({ mode, name, color, carModelId, text: state.text, players: state.players });
        setNetError("");
        setScreen(SCREENS.WAITING);
      });

      // Keep roomStateRef fresh when other players join/leave
      socket.on(SE.ROOM_UPDATE, state => {
        updateRoomState(state);
        setSession(prev => prev ? { ...prev, players: state.players } : prev);
      });

      // On first countdown: build definitive player list and switch to race
      // RaceScreen will show its own local 3-2-1 countdown
      let switched = false;
      socket.on(SE.COUNTDOWN, () => {
        if (!switched) {
          switched = true;
          const latest  = roomStateRef.current;
          const players = buildRacePlayers(latest, mode);
          setSession(prev => ({
            ...prev,
            text:    latest?.text ?? prev?.text,
            players,
          }));
          setScreen(SCREENS.RACE);
        }
      });

      if (action === "create") socket.emit(SE.CREATE_ROOM, { name, color });
      else                     socket.emit(SE.JOIN_ROOM,   { roomId, name, color });
    }
  }, []);

  const handlePlayAgain = useCallback(() => {
    teardown();
    setScreen(SCREENS.LOBBY);
  }, []);

  const handleMenu = useCallback(() => {
    teardown();
    setScreen(SCREENS.LOBBY);
  }, []);

  // ── Render ──────────────────────────────────────────────────────────────
  if (screen === SCREENS.LOBBY) {
    return <LobbyScreen onEnter={handleEnter} netError={netError} />;
  }

  if (screen === SCREENS.WAITING && roomState && session) {
    return (
      <WaitingRoom
        socket={socketRef.current}
        roomState={roomState}
        mode={session.mode}
        onMenu={handleMenu}
      />
    );
  }

  if (screen === SCREENS.RACE && session) {
    return (
      <RaceScreen
        socket={socketRef.current}
        text={session.text}
        mode={session.mode}
        players={session.players}
        playerName={session.name}
        playerColor={session.color}
        playerCarModelId={session.carModelId}
        onPlayAgain={handlePlayAgain}
        onMenu={handleMenu}
      />
    );
  }

  return null;
}