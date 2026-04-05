import { useState, useEffect, useCallback } from "react";
import { SE } from "../../../services/SocketService";


export function WaitingViewModel({ socket, initialState }) {
    const [roomState, setRoomState] = useState(initialState);
    const [copied,    setCopied]    = useState(false);
  
    useEffect(() => {
   
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
      isHost:   roomState.host === socket.id,
      copied,
      startRace,
      copyCode,
    };
  }