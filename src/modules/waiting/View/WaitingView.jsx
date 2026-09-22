import React, { useState, useEffect } from 'react';
import { useApp } from '../../../shared/contexts/AppContext';
import { SE } from '../../../shared/services/SocketService';
import Icon from '../../../shared/components/Icon';

const WaitingView = () => {
  const { roomState, socket, leaveRoom } = useApp();
  const [localCountdown, setLocalCountdown] = useState(null);
  const [copied, setCopied] = useState(false);

  const players = roomState?.players || [];
  const roomId = roomState?.id;
  const isHost = roomState?.host === socket?.id;

  useEffect(() => {
    if (!socket) return;
    const handleCountdown = (count) => setLocalCountdown(count);
    socket.on(SE.COUNTDOWN, handleCountdown);
    return () => socket.off(SE.COUNTDOWN, handleCountdown);
  }, [socket]);

  const handleStartRace = () => {
    if (isHost && socket) socket.emit(SE.START_RACE);
  };

  const copyRoomId = () => {
    if (!roomId) return;
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeaveRoom = () => leaveRoom();

  if (!roomId) return null;

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto p-6 font-mono animate-in zoom-in-95 duration-500 text-slate-900 dark:text-white">
      
      {/* ── HEADER HUD : Mission Control ── */}
      <div className="relative bg-white dark:bg-slate-900/40 border-2 border-slate-900 dark:border-sky-900/50 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_#0ea5e922]">
        {/* ABORT BUTTON */}
        <div className="absolute -top-3 -right-3">
          <button 
            onClick={handleLeaveRoom}
            className="px-4 py-2 bg-rose-600 dark:bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            [ ABORT_MISSION ]
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mt-2">
          <div className="space-y-2">
            <p className="text-[10px] text-slate-500 dark:text-sky-500 uppercase font-black tracking-[.4em]">Sector_Access_Key</p>
            <div className="flex items-center gap-4">
                <h1 className="text-6xl font-black tracking-tighter italic bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 px-4 py-1">
                  {roomId}
                </h1>
                <button 
                    onClick={copyRoomId}
                    className={`h-full px-4 py-3 text-[10px] font-black border-2 transition-all active:scale-95 ${
                        copied 
                        ? 'bg-emerald-500 border-emerald-500 text-white' 
                        : 'border-slate-900 dark:border-sky-500/50 hover:bg-slate-900 hover:text-white dark:hover:bg-sky-500 dark:hover:text-black'
                    }`}
                >
                    <span className="flex items-center gap-1.5">
                      <Icon name={copied ? 'check' : 'copy'} size={12} strokeWidth={2.5} />
                      {copied ? 'KEY_COPIED' : 'CLONE_ID'}
                    </span>
                </button>
            </div>
          </div>
          
          <div className="flex items-center gap-4 bg-slate-100 dark:bg-black/40 p-4 border-l-4 border-slate-900 dark:border-sky-500">
            <div className="text-right">
              <p className="text-3xl font-black leading-none italic tabular-nums">{players.length}</p>
              <p className="flex items-center justify-end gap-1 text-[9px] text-slate-500 uppercase tracking-widest font-bold">
                <Icon name="users" size={10} /> Pilots_In_Grid
              </p>
            </div>
            <div className="w-10 h-10 border-2 border-dashed border-slate-300 dark:border-sky-900/50 rounded-full animate-spin-slow flex items-center justify-center">
               <div className="w-2 h-2 bg-sky-500 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* ── PLAYER GRID : Deployment Units ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {players.map((player, idx) => {
          const isYou = player.id === socket?.id;
          return (
            <div 
              key={player.id || idx}
              className={`relative p-1 transition-all duration-300
                ${isYou ? 'bg-slate-900 dark:bg-sky-500' : 'bg-slate-200 dark:bg-white/5'}`}
              style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 90% 100%, 0 100%)' }}
            >
              <div className="bg-white dark:bg-slate-900 p-4 flex items-center gap-4">
                <div className="relative shrink-0">
                  <div className="w-12 h-12 border-2 border-slate-900 dark:border-sky-900/30 flex items-center justify-center bg-slate-50 dark:bg-black/40">
                    <div 
                      className="w-5 h-5 rotate-45 shadow-[0_0_15px_rgba(0,0,0,0.1)]"
                      style={{ 
                        backgroundColor: player.color, 
                        boxShadow: isYou ? `0 0 15px ${player.color}` : 'none' 
                      }}
                    />
                  </div>
                  {isYou && (
                    <div className="absolute -top-1 -left-1 w-3 h-3 bg-sky-500 border-2 border-white dark:border-slate-900 rounded-full animate-ping" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-black uppercase truncate ${isYou ? 'text-sky-600 dark:text-sky-400' : ''}`}>
                      {player.name}
                    </p>
                    {player.id === roomState?.host && (
                      <span className="text-[8px] bg-amber-500 text-black px-1.5 py-0.5 font-black italic">LEADER</span>
                    )}
                  </div>
                  <p className="text-[8px] text-slate-400 dark:text-slate-600 uppercase tracking-widest mt-1 font-bold">
                    Unit_Status: <span className="text-emerald-500">Online</span>
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── CONTROLS HUD : Ignition sequence ── */}
      <div className="relative mt-auto">
        <div className="absolute inset-x-0 -top-4 flex justify-center">
           <div className="bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 px-4 py-1 text-[9px] font-black uppercase tracking-[0.3em]">
             System_Ready
           </div>
        </div>

        <div className="bg-slate-100 dark:bg-slate-900/60 border-2 border-slate-900 dark:border-white/10 p-8 shadow-[inset_0_0_40px_rgba(0,0,0,0.05)]">
          {localCountdown !== null ? (
            <div className="text-center py-6 animate-in zoom-in-50 duration-300">
              <div className="text-8xl font-black text-slate-900 dark:text-white tracking-widest italic leading-none">
                0{localCountdown}
              </div>
              <p className="text-[12px] text-amber-500 dark:text-amber-400 font-black uppercase tracking-[1.2em] mt-4 animate-pulse">
                Ignition_Sequence_Active
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {isHost ? (
                <button
                  onClick={handleStartRace}
                  className="group relative w-full py-6 bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 font-black text-[14px] tracking-[0.6em] uppercase transition-all overflow-hidden border-b-8 border-black dark:border-sky-700 active:border-b-0 active:translate-y-2"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    <Icon name="play" size={16} filled strokeWidth={0} />
                    Launch_Race_Protocol
                  </span>
                  <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                </button>
              ) : (
                <div className="flex flex-col items-center gap-4 py-6 border-2 border-dashed border-slate-300 dark:border-sky-900/30">
                  <div className="flex gap-3">
                     {[0, 1, 2, 3].map(i => (
                       <div key={i} className="w-1.5 h-6 bg-sky-500/20 dark:bg-sky-500/10 relative overflow-hidden">
                          <div className="absolute inset-0 bg-sky-500 animate-[loading_1.5s_infinite]" style={{ animationDelay: `${i * 0.2}ms` }} />
                       </div>
                     ))}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-sky-500 font-black uppercase tracking-[0.5em] italic">
                    Awaiting_Commander_Signal...
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes loading {
          0% { transform: translateY(100%); }
          50% { transform: translateY(0%); }
          100% { transform: translateY(-100%); }
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default WaitingView;