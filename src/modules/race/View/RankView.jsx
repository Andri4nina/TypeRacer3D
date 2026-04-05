import React, { useMemo } from 'react'

const RankView = ({ racers = [] }) => {
  // Tri ultra-rapide optimisé pour le rendu temps réel
  const sorted = useMemo(() => {
    return [...racers].sort((a, b) => {
      const scoreA = (a.progress * 1000000) + (a.wpm || 0);
      const scoreB = (b.progress * 1000000) + (b.wpm || 0);
      return scoreB - scoreA;
    });
  }, [racers]);

  if (!racers || racers.length === 0) return null;

  return (
    <div className="relative flex flex-col bg-slate-100/90 dark:bg-slate-950/80 border-2 border-slate-900 dark:border-sky-900/50 p-4 min-w-[280px] shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[8px_8px_0px_0px_#0ea5e911] font-mono overflow-hidden">
      
      {/* SCANLINE EFFECT : Petit effet rétro-futuriste discret */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_bottom,transparent_50%,black_50%)] bg-[size:100%_4px]" />

      {/* HEADER HUD : Info de synchronisation */}
      <div className="flex justify-between items-end mb-4 border-b-2 border-slate-900/10 dark:border-sky-900/20 pb-2">
        <div>
          <p className="text-[10px] tracking-[0.4em] text-slate-900 dark:text-sky-500 font-black uppercase flex items-center gap-2">
            <span className="w-2 h-2 bg-sky-500 animate-pulse" />
            LIVE_GRID_POS
          </p>
        </div>
        <span className="text-[8px] font-bold text-slate-400 dark:text-slate-600 uppercase tabular-nums tracking-tighter">
          Active_Units: {racers.length}
        </span>
      </div>
      
      <div className="flex flex-col gap-2 relative z-10">
        {sorted.map((racer, i) => {
          const isPlayer = racer.isPlayer;
          const progressValue = racer.progress || 0;
          const displayPercent = Math.min(Math.round(progressValue * 100), 100);

          return (
            <div 
              key={racer.id} 
              className={`relative flex items-center gap-3 p-2 transition-all duration-300
                ${isPlayer 
                  ? 'bg-white dark:bg-sky-500/10 border-2 border-slate-900 dark:border-sky-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_#0ea5e944]' 
                  : 'bg-slate-200/50 dark:bg-white/5 border-2 border-transparent opacity-80'}`}
              style={{ clipPath: 'polygon(0% 0%, 95% 0%, 100% 25%, 100% 100%, 5% 100%, 0% 75%)' }}
            >
              {/* Position Rank */}
              <div className="flex flex-col items-center justify-center w-6 shrink-0">
                <span className={`text-[10px] font-black italic ${i === 0 ? 'text-amber-500' : 'text-slate-500'}`}>
                  #{i + 1}
                </span>
              </div>

              {/* Pilot Info Section */}
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-[9px] uppercase truncate font-black tracking-widest ${isPlayer ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                    {racer.name}
                  </span>
                  <span className={`text-[9px] font-black tabular-nums ${isPlayer ? 'text-sky-500' : 'text-slate-400'}`}>
                    {displayPercent}%
                  </span>
                </div>
                
                {/* PROGRESS BAR : Style Segmenté / Bloc */}
                <div className="w-full h-2 bg-slate-300 dark:bg-black/40 p-[1px]">
                  <div 
                    className="h-full transition-all duration-300 ease-out relative"
                    style={{ 
                      width: `${displayPercent}%`, 
                      backgroundColor: racer.color || '#3b82f6',
                      boxShadow: isPlayer ? `0 0 10px ${racer.color}aa` : 'none'
                    }} 
                  >
                    {/* Indicateur de pointe (curseur) */}
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-white opacity-50" />
                  </div>
                </div>
              </div>

              {/* Speed / WPM : Style Compteur */}
              <div className={`flex flex-col items-center justify-center px-2 py-1 min-w-[45px] border-l ${isPlayer ? 'border-slate-900 dark:border-sky-500' : 'border-slate-300 dark:border-white/10'}`}>
                <span className="text-[7px] font-black text-slate-400 uppercase leading-none mb-0.5">WPM</span>
                <span className={`text-[11px] font-black italic tabular-nums ${isPlayer ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                  {racer.wpm || 0}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-slate-900 dark:border-sky-900 opacity-20" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-slate-900 dark:border-sky-900 opacity-20" />
    </div>
  )
}

export default RankView