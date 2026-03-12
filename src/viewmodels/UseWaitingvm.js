import { useState, useEffect, useCallback } from "react";
import { SE } from "../services/SocketService";
import { BOT_DEFS } from "../constants/Index";


/**
 * ViewModel — Waiting Room.
 * Listens for room updates, exposes host actions.
 */
export function useWaitingVM({ socket, initialState }) {
  const [roomState, setRoomState] = useState(initialState);
  const [copied,    setCopied]    = useState(false);

  useEffect(() => {
    const fn = s => setRoomState(s);
    socket.on(SE.ROOM_UPDATE, fn);
    return () => socket.off(SE.ROOM_UPDATE, fn);
  }, [socket]);

  const startRace = useCallback(() => socket.emit(SE.START_RACE), [socket]);

  const copyCode = useCallback(() => {
    navigator.clipboard?.writeText(roomState.id).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }, [roomState.id]);

  return {
    roomState,
    isHost: roomState.host === socket.id,
    copied,
    bots:   BOT_DEFS,
    startRace,
    copyCode,
  };
}