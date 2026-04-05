import React, { useState } from 'react'
import { useApp } from '../../../shared/contexts/AppContext'
import { BOT_DEFS, GAME_MODES } from '../../../boot/constants/index'

const BOTS_SORTED = [...BOT_DEFS].sort((a, b) => a.wpm - b.wpm)

const ParameterView = ({ onClose, onResume, onRestart }) => {
  const {
    theme, toggleTheme,
    gameMode,
    selectedBots, setSelectedBots,
    navigate,
    playerColor
  } = useApp()

  const isBotMode = gameMode === GAME_MODES.BOT_RACE
  const [tab, setTab] = useState(isBotMode ? 'bots' : 'general')

  const toggleBot = (botId) =>
    setSelectedBots(prev =>
      prev.includes(botId) ? prev.filter(id => id !== botId) : [...prev, botId]
    )

  const TABS = [
    { id: 'general', label: 'SYSTEM' },
    ...(isBotMode ? [{ id: 'bots', label: 'AI_UNITS' }] : []),
  ]

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4" onClick={onClose}>
      
      {/* MODAL STRUCTURE : Style Armored Case */}
      <div 
        className="relative w-full max-w-sm bg-slate-100 dark:bg-slate-950 border-4 border-slate-900 dark:border-sky-900 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_#0ea5e922] animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        
        {/* HEADER : Console Tab */}
        <header className="flex items-center justify-between p-5 border-b-4 border-slate-900 dark:border-sky-900 bg-white dark:bg-black/40">
          <div className="flex flex-col leading-none">
            <span className="font-mono text-[10px] tracking-[0.4em] text-sky-500 font-black uppercase">COMMAND_MODULE</span>
            <span className="text-[8px] font-mono text-slate-400 dark:text-slate-600 uppercase mt-1 italic tracking-widest">State: PAUSE_OVERRIDE</span>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-slate-900 dark:bg-sky-900/20 text-white dark:text-sky-400 hover:bg-rose-600 transition-colors font-black text-xl">
            ×
          </button>
        </header>

        {/* TABS : Mechanical Toggle Style */}
        {TABS.length > 1 && (
          <div className="flex p-2 bg-slate-200/50 dark:bg-black/20 border-b-2 border-slate-900 dark:border-sky-900/30">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 py-3 font-mono text-[10px] font-black uppercase tracking-widest transition-all relative
                  ${tab === t.id 
                    ? 'bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950' 
                    : 'text-slate-400 dark:text-slate-600 hover:bg-slate-300 dark:hover:bg-sky-900/10'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        {/* CONTENT AREA */}
        <div className="p-6 min-h-[280px]">
          
          {/* TAB: GENERAL SYSTEM */}
          {tab === 'general' && (
            <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
              <div className="flex items-center justify-between p-4 bg-white dark:bg-black/40 border-2 border-slate-900/10 dark:border-sky-900/30">
                <div className="leading-tight">
                  <p className="font-mono text-[11px] font-black text-text uppercase tracking-wider italic">Grid_Aesthetics</p>
                  <p className="font-mono text-[8px] text-sky-500 uppercase font-bold mt-1">{theme === 'dark' ? '>> NIGHT_MODE_ACTIVE' : '>> DAY_MODE_ACTIVE'}</p>
                </div>
                <button
                  onClick={toggleTheme}
                  className="px-5 py-2 border-2 border-slate-900 dark:border-sky-500 bg-transparent font-mono text-[10px] font-black dark:text-sky-500 hover:bg-slate-900 hover:text-white dark:hover:bg-sky-500 dark:hover:text-slate-950 transition-all"
                >
                  {theme === 'dark' ? 'SUN_SYNC' : 'VOID_SYNC'}
                </button>
              </div>

              <div className="h-1 bg-slate-900/5 dark:bg-sky-900/20" />

              <button
                onClick={() => navigate('lobby')}
                className="w-full py-4 border-2 border-rose-500 text-rose-500 font-mono text-[10px] font-black uppercase tracking-[0.2em] hover:bg-rose-500 hover:text-white transition-all shadow-[4px_4px_0px_0px_#f43f5e33]"
              >
                [ ABORT_CURRENT_MISSION ]
              </button>
            </div>
          )}

          {/* TAB: AI UNITS (BOTS) */}
          {tab === 'bots' && isBotMode && (
            <div className="space-y-2 animate-in slide-in-from-right-4 duration-300 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
              <div className="mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-500 animate-pulse" />
                <span className="font-mono text-[8px] text-slate-500 uppercase font-bold italic tracking-tighter">Next Deployment Configuration</span>
              </div>

              {BOTS_SORTED.map(bot => {
                const checked = selectedBots.includes(bot.id)
                return (
                  <button
                    key={bot.id}
                    onClick={() => toggleBot(bot.id)}
                    className={`w-full flex items-center justify-between p-3 border-2 transition-all
                      ${checked 
                        ? 'bg-amber-500/10 border-amber-500 text-amber-500' 
                        : 'bg-white dark:bg-black/20 border-slate-200 dark:border-sky-900/20 opacity-60'}`}
                  >
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] font-black uppercase tracking-widest">{bot.name}</span>
                      <span className="text-[7px] font-mono opacity-60">CLASS: {bot.label}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-[10px] font-black italic">{bot.wpm} <span className="text-[7px] not-italic opacity-50">WPM</span></span>
                      <div className={`w-4 h-4 border-2 flex items-center justify-center ${checked ? 'border-amber-500 bg-amber-500' : 'border-slate-300 dark:border-sky-900/50'}`}>
                        {checked && <div className="w-1.5 h-1.5 bg-black" />}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* FOOTER ACTIONS : Heavy Duty Buttons */}
        <footer className="p-6 pt-0 space-y-4 bg-slate-200/30 dark:bg-black/40">
          
          <button onClick={onResume} className="group relative w-full py-4 bg-sky-500 text-slate-950 font-black font-mono text-[11px] tracking-[0.4em] uppercase shadow-[4px_4px_0px_0px_#0369a1] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all overflow-hidden">
             <div className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-[-25deg] -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
             <span className="relative z-10 flex items-center justify-center gap-2">
               ▶_RESUME_SYNC
             </span>
          </button>

          {onRestart && (
            <button onClick={onRestart} className="w-full py-3 border-2 border-amber-500 text-amber-500 font-mono text-[10px] font-black uppercase tracking-widest hover:bg-amber-500/10 transition-all">
              ↺_REBOOT_SIMULATION
            </button>
          )}
        </footer>

        {/* HUD DECOR : Bordures de coins technique */}
        <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-sky-500 pointer-events-none opacity-40" />
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: ${playerColor}; }
        @keyframes shimmer {
          100% { transform: translateX(350%) skew-x(-25deg); }
        }
      `}</style>
    </div>
  )
}

export default ParameterView