import { useState, useEffect, useCallback } from "react";
import { SE } from "../services/SocketService";
import { BOT_DEFS } from "../constants/Index";


/**
 * ViewModel — Waiting Room.
 * Listens for room updates, exposes host actions.
  */
// export function useWaitingVM({ socket, initialState }) {
//   const [roomState, setRoomState] = useState(initialState);
//   const [copied,    setCopied]    = useState(false);

//   useEffect(() => {
//     const fn = s => setRoomState(s);
//     socket.on(SE.ROOM_UPDATE, fn);
//     return () => socket.off(SE.ROOM_UPDATE, fn);
//   }, [socket]);

//   const startRace = useCallback(() => socket.emit(SE.START_RACE), [socket]);

//   const copyCode = useCallback(() => {
//     navigator.clipboard?.writeText(roomState.id).catch(() => {});
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2200);
//   }, [roomState.id]);

//   return {
//     roomState,
//     isHost: roomState.host === socket.id,
//     copied,
//     bots:   BOT_DEFS,
//     startRace,
//     copyCode,
//   };
// }



/**
 * ViewModel — Waiting Room.
 *
 * Listens for ROOM_UPDATE so the player list refreshes when others join/leave.
 * App.jsx ALSO listens to ROOM_UPDATE to keep its roomStateRef in sync — that
 * is intentional (both listeners coexist without conflict on socket.io).
 */
export function useWaitingVM({ socket, initialState }) {
  const [roomState, setRoomState] = useState(initialState);
  const [copied,    setCopied]    = useState(false);

  useEffect(() => {
    // Refresh local room state whenever the server broadcasts a change
    const onRoomUpdate = state => setRoomState(state);
    socket.on(SE.ROOM_UPDATE, onRoomUpdate);
    return () => socket.off(SE.ROOM_UPDATE, onRoomUpdate);
  }, [socket]);

  const startRace = useCallback(() => socket.emit(SE.START_RACE), [socket]);

  const copyCode = useCallback(() => {
    navigator.clipboard?.writeText(roomState.id).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }, [roomState.id]);

  return {
    roomState,
    // isHost: compare socket.id — works for both real and mock sockets
    isHost:   roomState.host === socket.id,
    copied,
    bots:     BOT_DEFS,
    startRace,
    copyCode,
  };
}