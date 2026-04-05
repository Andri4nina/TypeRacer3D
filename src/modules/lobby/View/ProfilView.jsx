import React from 'react'
import { useApp } from '../../../shared/contexts/AppContext'

const ProfilView = () => {
  const { playerName, setPlayerName, playerColor } = useApp()

  return (
    <div className="relative bg-slate-100 dark:bg-slate-950 border-4 border-slate-900 dark:border-sky-900 p-6 md:p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_#0ea5e922] overflow-hidden group">
      
      {/* HUD DECORATIONS : Coins tactiques */}
      <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-slate-900/10 dark:border-sky-900/30 -translate-y-2 translate-x-2" />
      <div className="absolute bottom-0 left-0 w-8 h-8 bg-slate-900 dark:bg-sky-500 opacity-20" style={{ clipPath: 'polygon(0% 100%, 100% 100%, 0% 0%)' }} />

      <header className="flex items-center gap-5 mb-8">
        {/* AVATAR : Badge Holographique */}
        <div className="relative">
          <div 
            className="w-14 h-14 flex items-center justify-center border-2 transition-all duration-500 bg-slate-900 dark:bg-black/40 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            style={{ 
              borderColor: playerColor, 
              clipPath: 'polygon(20% 0%, 100% 0%, 100% 80%, 80% 100%, 0% 100%, 0% 20%)',
              boxShadow: playerName ? `0 0 15px ${playerColor}44` : ''
            }}
          >
            <span className="text-2xl font-black italic animate-pulse" style={{ color: playerColor }}>
              {playerName ? playerName.charAt(0).toUpperCase() : '?'}
            </span>
          </div>
          {/* Petit voyant de status sur le badge */}
          <div className={`absolute -top-1 -right-1 w-3 h-3 border-2 border-slate-900 dark:border-slate-950 rounded-full transition-colors duration-500 ${playerName ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-slate-500'}`} />
        </div>

        <div className="leading-tight">
          <h3 className="font-mono text-[11px] tracking-[0.4em] uppercase text-slate-900 dark:text-sky-500 font-black">
            PILOT_ID // AUTH_REQ
          </h3>
          <div className="flex items-center gap-2 mt-1">
             <div className="h-[2px] w-4 bg-slate-900 dark:bg-sky-900" />
             <p className="text-[9px] font-mono text-slate-500 dark:text-slate-400 uppercase italic">
               Status: <span className={playerName ? "text-emerald-500" : "text-amber-500"}>
                 {playerName ? 'ENROLLED_ACTIVE' : 'AWAITING_CALLSIGN'}
               </span>
             </p>
          </div>
        </div>
      </header>

      <div className="relative">
        {/* INPUT : Style Console de Saisie */}
        <div className="absolute -top-2 -left-2 px-2 bg-slate-100 dark:bg-slate-950 z-10">
           <span className="font-mono text-[8px] font-black text-slate-400 dark:text-sky-900 uppercase">Input_Field</span>
        </div>
        
        <input
          type="text"
          value={playerName}
          onChange={e => setPlayerName(e.target.value)}
          placeholder="ENTER_CALLSIGN_..."
          maxLength={20}
          className="w-full bg-white dark:bg-black/40 border-2 border-slate-900 dark:border-sky-900/50 px-6 py-5 font-mono text-base font-black tracking-[0.2em] text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-slate-800 focus:outline-none transition-all duration-300 focus:border-sky-500"
          style={{
            clipPath: 'polygon(0% 0%, 98% 0%, 100% 15%, 100% 100%, 2% 100%, 0% 85%)',
          }}
        />

        {/* PROGRESS BAR : Style Segmenté */}
        <div className="mt-3 flex gap-1 h-1.5 px-1">
          {[...Array(10)].map((_, i) => (
            <div 
              key={i} 
              className="flex-1 transition-all duration-500"
              style={{ 
                backgroundColor: (playerName.length / 20) * 10 > i ? playerColor : 'rgba(148, 163, 184, 0.1)',
                boxShadow: (playerName.length / 20) * 10 > i ? `0 0 8px ${playerColor}` : 'none'
              }}
            />
          ))}
        </div>
      </div>

      {/* FOOTER : Message de Bienvenue Systémique */}
      <div className={`mt-6 p-3 border-l-4 transition-all duration-700 ${playerName ? 'opacity-100 border-sky-500 bg-sky-500/5' : 'opacity-0 border-transparent'}`}>
        <p className="font-mono text-[10px] text-slate-600 dark:text-sky-300 uppercase leading-relaxed">
          <span className="font-black">LOG:</span> Pilot <span className="font-black italic px-1 bg-sky-500 text-slate-900">{playerName}</span> has entered the grid. 
          <br/>
          <span className="opacity-60 text-[8px]">All_Systems_Nominal // Boot_Sequence_Complete</span>
        </p>
      </div>

 
    </div>
  )
}

export default ProfilView