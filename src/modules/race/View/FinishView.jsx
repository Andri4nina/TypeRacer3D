/* eslint-disable react-hooks/purity */
import React from 'react'
import { useApp } from '../../../shared/contexts/AppContext'

const MEDALS = ['🥇', '🥈', '🥉']
const POSITION_LABEL = ['1ST_PLACE', '2ND_PLACE', '3RD_PLACE', '4TH_PLACE', '5TH_PLACE', '6TH_PLACE', '7TH_PLACE', '8TH_PLACE']

const sortRacers = (racers) =>
  [...racers].sort((a, b) => {
    const scoreA = (a.progress * 10000) + (a.wpm || 0)
    const scoreB = (b.progress * 10000) + (b.wpm || 0)
    return scoreB - scoreA
  })

const FinishView = ({ racers = [], playerWpm = 0, accuracy = 100, onRestart, onQuit, isMulti = false }) => {
  const { playerColor, socket, roomState } = useApp()

  const sorted = isMulti
    ? racers.filter(r => !r.isBot)
    : sortRacers(racers)
    
  const playerPos = sorted.findIndex(r => r.isPlayer)
  const position = playerPos + 1
  const isHost = isMulti && roomState?.host === socket?.id
  const waitingForRematch = isMulti && roomState?.status === 'waiting'

  const handleRematch = () => {
    if (isHost && socket) socket.emit('room:rematch')
  }

  React.useEffect(() => {
    if (isMulti && roomState?.status === 'waiting' && waitingForRematch) {
      onRestart?.()
    }
  }, [roomState?.status, isMulti, waitingForRematch, onRestart])

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-50 dark:bg-slate-950 border-4 border-slate-900 dark:border-sky-900 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] dark:shadow-[16px_16px_0px_0px_#0ea5e922] animate-in fade-in zoom-in-95 duration-300">
        
        {/* --- HEADER TACTIQUE --- */}
        <header className="flex justify-between items-center p-6 border-b-4 border-slate-900 dark:border-sky-900 bg-white dark:bg-black/40">
          <div className="leading-none">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white">
              MISSION_DEBRIEF <span className="text-sky-500">#{Math.floor(Math.random() * 9000 + 1000)}</span>
            </h2>
            <p className="font-mono text-[9px] text-slate-500 mt-1 uppercase tracking-widest font-bold">// CLASSIFIED_RESULT</p>
          </div>
          <div className="text-right">
            <div className="font-mono text-[10px] font-black bg-slate-900 text-white px-3 py-1 skew-x-[-15deg]">
              {isMulti ? 'GLOBAL_RANKING' : 'OFFLINE_SIM'}
            </div>
          </div>
        </header>

        <div className="flex flex-col md:flex-row divide-y-4 md:divide-y-0 md:divide-x-4 divide-slate-900 dark:divide-sky-900">
          
          {/* --- SECTION GAUCHE : FOCUS JOUEUR --- */}
          <div className="flex-1 p-8 text-center bg-white dark:bg-slate-900/20">
            <div className="relative inline-block mb-6">
               {/* Médaille Massive */}
               <div className="text-8xl relative z-10 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                 {MEDALS[playerPos] ?? '🏁'}
               </div>
               {/* Effet de Targetting */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-dashed border-sky-500/40 rounded-full animate-[spin_10s_linear_infinite]" />
            </div>

            <p className="font-mono text-[11px] font-black uppercase text-sky-500 tracking-[0.3em] mb-1">
              {POSITION_LABEL[playerPos] ?? `${position}TH_POSITION`}
            </p>
            <h3 className="text-4xl font-black italic uppercase text-slate-900 dark:text-white tracking-tighter leading-none mb-8">
               {position === 1 ? 'DOMINATION' : position <= 3 ? 'PODIUM_SECURED' : 'DATA_COLLECTED'}
            </h3>

            {/* Stats Cards Style "Hard-Surface" */}
            <div className="grid grid-cols-1 gap-3">
              {[
                { label: 'AVG_SPEED', val: `${playerWpm} WPM`, sub: 'Words Per Min' },
                { label: 'ACCURACY', val: `${accuracy}%`, sub: 'Neural Precision', color: accuracy >= 95 ? 'text-emerald-500' : 'text-amber-500' },
                { label: 'RANK', val: `${position}/${sorted.length}`, sub: 'Grid Standing' }
              ].map((stat, i) => (
                <div key={i} className="bg-slate-100 dark:bg-black/60 border-2 border-slate-900 dark:border-sky-900/30 p-3 flex justify-between items-center group overflow-hidden relative">
                   <div className="absolute inset-y-0 left-0 w-1 bg-slate-900 dark:bg-sky-500" />
                   <div className="text-left">
                     <p className="font-mono text-[8px] text-slate-500 uppercase font-black">{stat.label}</p>
                     <p className="font-mono text-[7px] text-slate-400 uppercase italic">{stat.sub}</p>
                   </div>
                   <span className={`text-xl font-black italic ${stat.color || 'text-slate-900 dark:text-white'}`}>{stat.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* --- SECTION DROITE : CLASSEMENT TOTAL (SCROLLABLE) --- */}
          <div className="flex-1 bg-slate-100/50 dark:bg-black/20 flex flex-col min-h-[400px]">
            <div className="p-4 border-b-2 border-slate-900/10 dark:border-sky-900/20 bg-slate-200 dark:bg-sky-900/10 flex justify-between items-center">
              <span className="font-mono text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-sky-400">Racer_Leaderboard</span>
              <span className="font-mono text-[8px] opacity-50 uppercase">{sorted.length} Units Active</span>
            </div>
            
            <div className="flex-1 overflow-y-auto max-h-[400px] p-4 space-y-2 custom-scrollbar">
              {sorted.map((racer, i) => (
                <div
                  key={racer.id}
                  className={`relative flex items-center gap-3 p-3 border-2 transition-all group
                    ${racer.isPlayer
                      ? 'bg-white dark:bg-sky-950 border-slate-900 dark:border-sky-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_#0ea5e966]'
                      : 'bg-transparent border-slate-200 dark:border-sky-900/20 opacity-70 hover:opacity-100'
                    }`}
                >
                  <span className="font-mono text-[12px] font-black w-6 italic text-slate-400">#{i + 1}</span>
                  
                  {/* Petit bloc de couleur type racing */}
                  <div className="w-1.5 h-8 skew-x-[-15deg]" style={{ backgroundColor: racer.color }} />
                  
                  <div className="flex-1 min-w-0">
                    <p className={`text-[11px] font-black uppercase truncate tracking-wider ${racer.isPlayer ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                      {racer.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                       <div className="flex-1 h-1 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full transition-all duration-1000" style={{ width: `${racer.progress * 100}%`, backgroundColor: racer.color }} />
                       </div>
                    </div>
                  </div>

                  <div className="text-right leading-none shrink-0">
                    <span className="font-mono text-[12px] font-black italic dark:text-white">{racer.wpm}</span>
                    <p className="font-mono text-[7px] text-slate-400 uppercase">WPM</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- FOOTER D'ACTIONS --- */}
        <footer className="p-6 bg-white dark:bg-black/60 border-t-4 border-slate-900 dark:border-sky-900 flex flex-col sm:flex-row gap-4">
          
          {isMulti ? (
            isHost ? (
              <button onClick={handleRematch}
                className="flex-[2] py-4 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs uppercase tracking-widest shadow-[4px_4px_0px_0px_#0369a1] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all">
                ↺ LAUNCH_REMATCH_SEQUENCE
              </button>
            ) : (
              <div className="flex-[2] py-4 bg-slate-200 dark:bg-slate-900 text-slate-500 font-black text-[10px] uppercase tracking-widest border-2 border-slate-300 dark:border-sky-900/50 flex items-center justify-center gap-3">
                <span className="w-2 h-2 bg-sky-500 animate-ping" />
                WAITING_FOR_HOST_SIGNAL...
              </div>
            )
          ) : (
            <button onClick={onRestart}
              className="flex-[2] py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-widest shadow-[4px_4px_0px_0px_#065f46] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all">
              ↺ INITIATE_NEW_PROTOCOL
            </button>
          )}

          <button onClick={onQuit}
            className="flex-1 py-4 bg-slate-900 dark:bg-slate-800 text-white font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]">
            EXIT_TO_LOBBY
          </button>
        </footer>

        {/* --- STYLE POUR LE SCROLLBAR --- */}
        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { 
            background: ${playerColor};
            border-radius: 10px;
          }
        `}</style>
      </div>
    </div>
  )
}

export default FinishView