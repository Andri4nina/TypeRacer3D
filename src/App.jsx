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

// /**
//  * App — root state machine.
//  * Responsibilities:
//  *   1. Track current screen (lobby / waiting / race)
//  *   2. Create / reset the socket on each new session
//  *   3. Pass the right slice of state down to each screen
//  *   4. Never contain UI itself
//  */
// export default function App() {
//   const [screen,    setScreen]    = useState(SCREENS.LOBBY);
//   const [session,   setSession]   = useState(null);   // { mode, name, color, text, players }
//   const [roomState, setRoomState] = useState(null);
//   const socketRef = useRef(null);

//   const handleEnter = useCallback(({ mode, name, color, carModelId, action, roomId }) => {
//     resetSocket();
//     const socket = getSocket();
//     socketRef.current = socket;

//     attachMockServer(socket, name, color);

//     const text      = RACE_TEXTS[Math.floor(Math.random() * RACE_TEXTS.length)];
//     const playerDef = { id: socket.id, name, color, lane: 0, isBot: false };

//     if (mode === GAME_MODES.SOLO) {
//       setSession({ mode, name, color, carModelId, text, players: [playerDef] });
//       setScreen(SCREENS.RACE);
//       return;
//     }

//     if (mode === GAME_MODES.BOT_RACE) {
//       const allPlayers = [playerDef, ...BOT_DEFS.map((b, i) => ({ ...b, lane: 1 + i }))];
//       const fakeRoom   = { id: "LOCAL", host: socket.id, status: "waiting", text, players: [playerDef], scores: [] };
//       setSession({ mode, name, color, carModelId, text, players: allPlayers });
//       setRoomState(fakeRoom);
//       socket.on(SE.COUNTDOWN, () => setScreen(SCREENS.RACE));
//       socket.emit(SE.CREATE_ROOM, { name, color });
//       setScreen(SCREENS.WAITING);
//       return;
//     }

//     if (mode === GAME_MODES.MULTIPLAYER) {
//       socket.on(SE.ROOM_JOINED, ({ state }) => {
//         const allPlayers = [
//           ...state.players,
//           ...BOT_DEFS.map((b, i) => ({ ...b, lane: state.players.length + i })),
//         ];
//         setSession({ mode, name, color, carModelId, text: state.text, players: allPlayers });
//         setRoomState(state);
//         setScreen(SCREENS.WAITING);
//       });
//       socket.on(SE.COUNTDOWN, () => setScreen(SCREENS.RACE));
//       if (action === "create") socket.emit(SE.CREATE_ROOM, { name, color });
//       else                     socket.emit(SE.JOIN_ROOM,   { roomId, name, color });
//       return;
//     }
//   }, []);

//   const handlePlayAgain = useCallback(() => {
//     resetSocket();
//     socketRef.current = null;
//     setSession(null);
//     setRoomState(null);
//     setScreen(SCREENS.LOBBY);
//   }, []);

//   if (screen === SCREENS.LOBBY) {
//     return <LobbyScreen onEnter={handleEnter} />;
//   }

//   if (screen === SCREENS.WAITING && roomState && session) {
//     return (
//       <WaitingRoom
//         socket={socketRef.current}
//         roomState={roomState}
//         mode={session.mode}
//       />
//     );
//   }

//   if (screen === SCREENS.RACE && session) {
//     return (
//       <RaceScreen
//         socket={socketRef.current}
//         text={session.text}
//         mode={session.mode}
//         players={session.players}
//         playerName={session.name}
//         playerColor={session.color}
//         playerCarModelId={session.carModelId}
//         onPlayAgain={handlePlayAgain}
//       />
//     );
//   }

//   return null;
// }


export default function App() {
  const [screen,    setScreen]    = useState(SCREENS.LOBBY);
  const [session,   setSession]   = useState(null);
  const [roomState, setRoomState] = useState(null);
  const [netError,  setNetError]  = useState("");
  const socketRef = useRef(null);

  function teardown() {
    // eslint-disable-next-line no-unused-vars
    try { socketRef.current?.disconnect?.(); } catch (_) { /* empty */ }
    socketRef.current = null;
    resetSocket();
    setSession(null);
    setRoomState(null);
    setNetError("");
  }

  const handleEnter = useCallback(async ({ mode, name, color, carModelId, action, roomId }) => {
    teardown();

    // ── SOLO ────────────────────────────────────────────────────
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

    // ── BOT RACE ─────────────────────────────────────────────────
    if (mode === GAME_MODES.BOT_RACE) {
      const socket     = getMockSocket();
      socketRef.current = socket;
      attachMockServer(socket, name, color);
      const text       = RACE_TEXTS[Math.floor(Math.random() * RACE_TEXTS.length)];
      const playerDef  = { id: socket.id, name, color, lane: 0, isBot: false };
      const allPlayers = [playerDef, ...BOT_DEFS.map((b, i) => ({ ...b, lane: 1 + i }))];
      const fakeRoom   = { id: "LOCAL", host: socket.id, status: "waiting", text, players: [playerDef], scores: [] };
      setSession({ mode, name, color, carModelId, text, players: allPlayers });
      setRoomState(fakeRoom);
      socket.on(SE.COUNTDOWN, () => setScreen(SCREENS.RACE));
      socket.emit(SE.CREATE_ROOM, { name, color });
      setScreen(SCREENS.WAITING);
      return;
    }

    // ── MULTIPLAYER — real socket.io ──────────────────────────────
    if (mode === GAME_MODES.MULTIPLAYER) {
      let socket;
      try {
        socket = await createRealSocket();
      } catch (err) {
        setNetError(
          `Cannot reach server at ${(typeof import.meta !== "undefined" && import.meta.env?.VITE_SERVER_URL) || "http://localhost:3001"}. ` +
          `Make sure your Node server (Index.js) is running.\n${err?.message ?? err}`
        );
        return;
      }
      socketRef.current = socket;

      socket.on(SE.ROOM_ERROR,  msg  => setNetError(msg));
      socket.on("disconnect",   ()   => setNetError("Disconnected from server."));

      socket.on(SE.ROOM_JOINED, ({ state }) => {
        const allPlayers = [
          ...state.players,
          ...BOT_DEFS.map((b, i) => ({ ...b, lane: state.players.length + i })),
        ];
        setSession({ mode, name, color, carModelId, text: state.text, players: allPlayers });
        setRoomState(state);
        setNetError("");
        setScreen(SCREENS.WAITING);
      });

      socket.on(SE.COUNTDOWN, () => setScreen(SCREENS.RACE));

      if (action === "create") socket.emit(SE.CREATE_ROOM, { name, color });
      else                     socket.emit(SE.JOIN_ROOM,   { roomId, name, color });
    }
  }, []);

  const handlePlayAgain = useCallback(() => {
    teardown();
    setScreen(SCREENS.LOBBY);
  }, []);

  if (screen === SCREENS.LOBBY) {
    return <LobbyScreen onEnter={handleEnter} netError={netError} />;
  }

  if (screen === SCREENS.WAITING && roomState && session) {
    return (
      <WaitingRoom
        socket={socketRef.current}
        roomState={roomState}
        mode={session.mode}
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
      />
    );
  }

  return null;
}