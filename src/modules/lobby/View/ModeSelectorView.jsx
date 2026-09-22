import React, { useState } from 'react'
import { useApp } from '../../../shared/contexts/AppContext'
import { BOT_DEFS, GAME_MODES, SCREENS } from '../../../boot/constants/index'
import Icon from '../../../shared/components/Icon'

const BOTS_SORTED = [...BOT_DEFS].sort((a, b) => a.wpm - b.wpm)

const ModeSelectorView = () => {
  const {
    gameMode, setGameMode,
    playerName, navigate,
    selectedBots, setSelectedBots,
    createRoom, 
    joinRoom    
  } = useApp()

  const [joinInput, setJoinInput] = useState('')
  const joinReady = joinInput.trim().length >= 4
  const nameReady = playerName.trim().length > 0

  const launchRace = (mode, options = {}) => {
    if (!nameReady) return
    setGameMode(mode)

    if (mode === GAME_MODES.BOT_RACE) {
      if (selectedBots.length === 0) return
      navigate(SCREENS.RACE)
    }
    else if (mode === GAME_MODES.SOLO) {
      setSelectedBots([])
      navigate(SCREENS.RACE)
    }
    else if (mode === GAME_MODES.MULTIPLAYER) {
      setSelectedBots([])
      if (options.isJoining) {
        joinRoom(joinInput.trim().toUpperCase())
      } else {
        createRoom() 
      }
    }
  }

  const toggleBot = (botId) => {
    setSelectedBots(prev =>
      prev.includes(botId) ? prev.filter(id => id !== botId) : [...prev, botId]
    )
  }

  return (
    <div className="relative bg-slate-100 dark:bg-slate-950 border-4 border-slate-900 dark:border-sky-900 p-6 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_#0ea5e922]">
      
      {/* HEADER DE MISSION */}
      <header className="mb-8 flex justify-between items-start border-b-2 border-slate-900/10 dark:border-sky-900/20 pb-4">
        <div>
          <h2 className="text-3xl font-black italic tracking-tighter uppercase text-slate-900 dark:text-white">
            DEPLOYMENT_<span className="text-sky-500">PROTOCOL</span>
          </h2>
          <div className="flex gap-4 mt-1">
             <span className="font-mono text-[9px] text-sky-500 font-bold uppercase tracking-widest">// SELECT_OBJECTIVE</span>
             <span className="font-mono text-[9px] text-slate-400 uppercase">Ver: 0.8.4</span>
          </div>
        </div>
        <div className="hidden md:block w-24 h-8 bg-slate-900 dark:bg-sky-900/20 opacity-20" 
             style={{ clipPath: 'polygon(0% 0%, 100% 0%, 80% 100%, 20% 100%)' }} />
      </header>

      <div className="flex flex-col gap-6">

        {/* --- SOLO CALIBRATION --- */}
        <section className={`relative transition-all duration-300 border-2
          ${gameMode === GAME_MODES.SOLO 
            ? 'bg-emerald-500/10 border-emerald-500 shadow-[4px_4px_0px_0px_#10b981]' 
            : 'bg-slate-200/50 dark:bg-black/20 border-slate-300 dark:border-slate-800 opacity-60 hover:opacity-100'}`}
          style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 85%, 95% 100%, 0% 100%)' }}>
          
          <button onClick={() => setGameMode(GAME_MODES.SOLO)} className="w-full p-4 flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className={`p-2 border-2 ${gameMode === GAME_MODES.SOLO ? 'bg-emerald-500 text-white' : 'bg-slate-300 dark:bg-slate-800'} transition-colors`}>
                <Icon name="target" size={20} />
              </div>
              <div className="text-left leading-none">
                <p className="text-sm font-black uppercase text-slate-900 dark:text-white tracking-widest">Solo_Calibration</p>
                <p className="text-[8px] font-mono text-slate-500 mt-1 uppercase">No_Threats // Training_Only</p>
              </div>
            </div>
            <div className={`h-1 w-12 ${gameMode === GAME_MODES.SOLO ? 'bg-emerald-500' : 'bg-slate-400'} opacity-30`} />
          </button>

          {gameMode === GAME_MODES.SOLO && (
            <div className="p-4 pt-0 animate-in fade-in zoom-in-95 duration-200">
              <button onClick={() => launchRace(GAME_MODES.SOLO)} className="w-full py-3 bg-emerald-500 text-slate-950 font-black text-[10px] uppercase hover:bg-emerald-400 shadow-[4px_4px_0px_0px_#065f46]">
                INITIATE_TRAINING_SEQUENCE
              </button>
            </div>
          )}
        </section>

        {/* --- AI CHALLENGE --- */}
        <section className={`relative transition-all duration-300 border-2
          ${gameMode === GAME_MODES.BOT_RACE 
            ? 'bg-amber-500/10 border-amber-500 shadow-[4px_4px_0px_0px_#f59e0b]' 
            : 'bg-slate-200/50 dark:bg-black/20 border-slate-300 dark:border-slate-800 opacity-60 hover:opacity-100'}`}
          style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 85%, 95% 100%, 0% 100%)' }}>
          
          <button onClick={() => setGameMode(GAME_MODES.BOT_RACE)} className="w-full p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-2 border-2 ${gameMode === GAME_MODES.BOT_RACE ? 'bg-amber-500 text-white' : 'bg-slate-300 dark:bg-slate-800'} transition-colors`}>
                <Icon name="cpu" size={20} />
              </div>
              <div className="text-left leading-none">
                <p className="text-sm font-black uppercase text-slate-900 dark:text-white tracking-widest">AI_Challenge</p>
                <p className="text-[8px] font-mono text-slate-500 mt-1 uppercase">Simulated_Hostiles // Bot_Protocol</p>
              </div>
            </div>
          </button>

          {gameMode === GAME_MODES.BOT_RACE && (
            <div className="p-4 pt-0 space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {BOTS_SORTED.map(bot => {
                  const isSelected = selectedBots.includes(bot.id);
                  return (
                    <button key={bot.id} onClick={() => toggleBot(bot.id)}
                      className={`p-2 border-2 font-mono text-[9px] flex items-center justify-between transition-all
                      ${isSelected ? 'bg-amber-500 border-slate-900 text-slate-950 font-bold' : 'bg-black/10 border-slate-800 text-slate-500'}`}>
                      <span className="truncate">{bot.name}</span>
                      <span className="opacity-60">{bot.wpm}</span>
                    </button>
                  )
                })}
              </div>
              <button onClick={() => launchRace(GAME_MODES.BOT_RACE)} disabled={selectedBots.length === 0}
                className={`w-full py-3 font-black text-[10px] uppercase shadow-[4px_4px_0px_0px_#92400e]
                ${selectedBots.length > 0 ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-600'}`}>
                ENGAGE_AI_OPERATIVES
              </button>
            </div>
          )}
        </section>

        {/* --- ONLINE ARENA --- */}
        <section className={`relative transition-all duration-300 border-2
          ${gameMode === GAME_MODES.MULTIPLAYER 
            ? 'bg-indigo-500/10 border-indigo-500 shadow-[4px_4px_0px_0px_#6366f1]' 
            : 'bg-slate-200/50 dark:bg-black/20 border-slate-300 dark:border-slate-800 opacity-60 hover:opacity-100'}`}
          style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 85%, 95% 100%, 0% 100%)' }}>
          
          <button onClick={() => setGameMode(GAME_MODES.MULTIPLAYER)} className="w-full p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-2 border-2 ${gameMode === GAME_MODES.MULTIPLAYER ? 'bg-indigo-500 text-white' : 'bg-slate-300 dark:bg-slate-800'} transition-colors`}>
                <Icon name="globe" size={20} />
              </div>
              <div className="text-left leading-none">
                <p className="text-sm font-black uppercase text-slate-900 dark:text-white tracking-widest">Online_Arena</p>
                <p className="text-[8px] font-mono text-slate-500 mt-1 uppercase">Live_Multiplayer // Sync_Active</p>
              </div>
            </div>
          </button>

          {gameMode === GAME_MODES.MULTIPLAYER && (
            <div className="p-4 pt-0 space-y-4">
              <input type="text" value={joinInput} onChange={e => setJoinInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
                placeholder="INPUT_SYNC_CODE"
                className="w-full bg-black text-indigo-400 p-3 border-2 border-indigo-900 font-mono text-center tracking-[0.5em] text-xs outline-none focus:border-indigo-500" />
              
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => launchRace(GAME_MODES.MULTIPLAYER, { isJoining: true })} disabled={!joinReady || !nameReady}
                  className={`py-3 border-2 font-black text-[9px] uppercase transition-all
                  ${joinReady && nameReady ? 'border-indigo-500 text-indigo-500 hover:bg-indigo-500 hover:text-white' : 'border-slate-800 text-slate-700'}`}>
                  JOIN_SESSION
                </button>
                <button onClick={() => launchRace(GAME_MODES.MULTIPLAYER, { isJoining: false })} disabled={!nameReady}
                  className={`py-3 font-black text-[9px] uppercase shadow-[4px_4px_0px_0px_#3730a3]
                  ${nameReady ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'bg-slate-800 text-slate-600'}`}>
                  CREATE_HOST
                </button>
              </div>
            </div>
          )}
        </section>

      </div>

      {/* FOOTER DE SECURITÉ */}
      <footer className="mt-8 pt-4 border-t-2 border-slate-900/10 dark:border-sky-900/20 flex justify-between items-center opacity-40 font-mono text-[8px]">
        <span>// AREA_CODE: TR3D_Z01</span>
        <div className="flex gap-3 text-sky-500 animate-pulse">
           <span className="flex items-center gap-1"><Icon name="dot" size={7} filled /> ENCRYPTION_ACTIVE</span>
           <span className="flex items-center gap-1"><Icon name="dot" size={7} filled /> SIGNAL_STABLE</span>
        </div>
      </footer>
    </div>
  )
}

export default ModeSelectorView