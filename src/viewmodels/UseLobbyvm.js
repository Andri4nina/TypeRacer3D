/* eslint-disable react-hooks/preserve-manual-memoization */
// import { useState, useCallback } from "react";
// import { GAME_MODES, PLAYER_COLORS } from "../constants";

// /**
//  * ViewModel — Lobby screen.
//  * Owns: player profile state, active mode selection, room code input.
//  * Never imports any UI component.
//  */
// export function useLobbyVM({ onEnter }) {
//   const [name,   setNameRaw]   = useState("RACER");
//   const [color,  setColor]     = useState(PLAYER_COLORS[0]);
//   const [mode,   setMode]      = useState(null);
//   const [roomId, setRoomIdRaw] = useState("");
//   const [error,  setError]     = useState("");

//   const setName   = v => setNameRaw(v.toUpperCase().slice(0, 12));
//   const setRoomId = v => setRoomIdRaw(v.toUpperCase().slice(0, 6));

//   const selectMode = useCallback(m => { setMode(m); setError(""); }, []);

//   const guard = useCallback(() => {
//     if (!name.trim()) { setError("Enter a nickname first"); return false; }
//     setError(""); return true;
//   }, [name]);

//   const startSolo = useCallback(() => {
//     if (!guard()) return;
//     onEnter({ mode: GAME_MODES.SOLO, name: name.trim(), color });
//   }, [name, color, guard, onEnter]);

//   const startBotRace = useCallback(() => {
//     if (!guard()) return;
//     onEnter({ mode: GAME_MODES.BOT_RACE, name: name.trim(), color });
//   }, [name, color, guard, onEnter]);

//   const createRoom = useCallback(() => {
//     if (!guard()) return;
//     onEnter({ mode: GAME_MODES.MULTIPLAYER, name: name.trim(), color, action: "create" });
//   }, [name, color, guard, onEnter]);

//   const joinRoom = useCallback(() => {
//     if (!guard()) return;
//     if (!roomId.trim()) { setError("Enter a room code"); return; }
//     onEnter({ mode: GAME_MODES.MULTIPLAYER, name: name.trim(), color, action: "join", roomId: roomId.trim() });
//   }, [name, color, roomId, guard, onEnter]);

//   return {
//     name, color, mode, roomId, error,
//     setName, setColor, setRoomId, selectMode,
//     startSolo, startBotRace, createRoom, joinRoom,
//     colors: PLAYER_COLORS,
//     modes:  GAME_MODES,
//   };
// }


import { useState, useCallback } from "react";
import {  GAME_MODES, PLAYER_COLORS, DEFAULT_CAR_ID  } from "../constants/Index";


/**
 * ViewModel — Lobby screen.
 * Owns: player profile state, car model selection, mode selection, room code.
 */
export function useLobbyVM({ onEnter }) {
  const [name,       setNameRaw]   = useState("RACER");
  const [color,      setColor]     = useState(PLAYER_COLORS[0]);
  const [carModelId, setCarModelId] = useState(DEFAULT_CAR_ID);
  const [mode,       setMode]      = useState(null);
  const [roomId,     setRoomIdRaw] = useState("");
  const [error,      setError]     = useState("");

  const setName   = v => setNameRaw(v.toUpperCase().slice(0, 12));
  const setRoomId = v => setRoomIdRaw(v.toUpperCase().slice(0, 6));

  const selectMode = useCallback(m => { setMode(m); setError(""); }, []);

  const guard = useCallback(() => {
    if (!name.trim()) { setError("Enter a nickname first"); return false; }
    setError(""); return true;
  }, [name]);

  const profile = () => ({ name: name.trim(), color, carModelId });

  const startSolo = useCallback(() => {
    if (!guard()) return;
    onEnter({ mode: GAME_MODES.SOLO, ...profile() });
  }, [name, color, carModelId, guard, onEnter]);

  const startBotRace = useCallback(() => {
    if (!guard()) return;
    onEnter({ mode: GAME_MODES.BOT_RACE, ...profile() });
  }, [name, color, carModelId, guard, onEnter]);

  const createRoom = useCallback(() => {
    if (!guard()) return;
    onEnter({ mode: GAME_MODES.MULTIPLAYER, ...profile(), action: "create" });
  }, [name, color, carModelId, guard, onEnter]);

  const joinRoom = useCallback(() => {
    if (!guard()) return;
    if (!roomId.trim()) { setError("Enter a room code"); return; }
    onEnter({ mode: GAME_MODES.MULTIPLAYER, ...profile(), action: "join", roomId: roomId.trim() });
  }, [name, color, carModelId, roomId, guard, onEnter]);

  return {
    name, color, carModelId, mode, roomId, error,
    setName, setColor, setCarModelId, setRoomId, selectMode,
    startSolo, startBotRace, createRoom, joinRoom,
    colors: PLAYER_COLORS,
    modes:  GAME_MODES,
  };
}