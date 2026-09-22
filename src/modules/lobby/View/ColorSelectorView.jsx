import React, { useState } from 'react'
import { PLAYER_COLORS } from '../../../boot/constants/index'
import { useApp } from '../../../shared/contexts/AppContext'
import Icon from '../../../shared/components/Icon'

const ColorSelectorView = () => {
  const { playerColor, setPlayerColor } = useApp()
  const [usingCustom, setUsingCustom] = useState(!PLAYER_COLORS.includes(playerColor))

  return (
    <div className="relative bg-slate-100 dark:bg-slate-950 border-4 border-slate-900 dark:border-sky-900 p-6 md:p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_#0ea5e922] overflow-hidden">
      
      {/* HUD HEADER : Style Diagnostic */}
      <header className="flex justify-between items-center mb-10 border-b-2 border-slate-900/10 dark:border-sky-900/30 pb-4">
        <div className="flex items-center gap-4">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 animate-ping opacity-20 rounded-full" style={{ backgroundColor: playerColor }} />
            <div className="w-3 h-3 rotate-45 border-2 border-slate-900 dark:border-white shadow-[0_0_10px]" 
                 style={{ backgroundColor: playerColor, shadowColor: playerColor }} />
          </div>
          <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white">
            CHROMATIC_<span className="text-sky-500">LAB</span>
          </h3>
        </div>
        <div className="font-mono text-[10px] font-black bg-slate-900 text-white px-3 py-1 skew-x-[-15deg] border-r-4 border-sky-500">
          {usingCustom ? 'MANUAL_HEX' : 'PRESET_LINK'}
        </div>
      </header>

      <div className="flex flex-col lg:flex-row items-center gap-10">

        {/* GRILLE DE PRESETS : Style "Capsules d'Énergie" */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-4 flex-grow">
          {PLAYER_COLORS.map((color) => {
            const active = !usingCustom && playerColor === color
            return (
              <button
                key={color}
                onClick={() => { setPlayerColor(color); setUsingCustom(false); }}
                className={`group relative w-10 h-10 transition-all duration-200 active:scale-90
                  ${active ? 'z-10' : 'opacity-60 hover:opacity-100'}`}
              >
                {/* La forme de la capsule (Octogone) */}
                <div 
                  className={`absolute inset-0 border-2 transition-all duration-300
                    ${active ? 'border-slate-900 dark:border-white scale-110' : 'border-transparent'}`}
                  style={{ 
                    backgroundColor: color,
                    clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
                    boxShadow: active ? `0 0 20px ${color}` : 'none'
                  }}
                />
                {/* Petit reflet interne */}
                <div className="absolute top-1 left-1 w-2 h-1 bg-white/30 rounded-full rotate-[-45deg]" />
              </button>
            )
          })}
        </div>

        {/* SÉPARATEUR TACTIQUE */}
        <div className="hidden lg:flex flex-col items-center gap-2">
           <div className="w-[2px] h-8 bg-slate-300 dark:bg-sky-900/50" />
           <span className="font-mono text-[10px] text-slate-400 rotate-90">OR</span>
           <div className="w-[2px] h-8 bg-slate-300 dark:bg-sky-900/50" />
        </div>

        {/* CUSTOM PICKER : Style "Réacteur de Fusion" */}
        <div className="flex flex-col items-center gap-3">
          <label className="relative cursor-pointer group/picker">
            <input
              type="color"
              value={playerColor}
              onChange={(e) => { setPlayerColor(e.target.value); setUsingCustom(true); }}
              className="sr-only"
            />
            {/* Anneau extérieur tournant (décoratif) */}
            <div className={`absolute -inset-4 border-2 border-dashed border-slate-300 dark:border-sky-500/30 rounded-full ${usingCustom ? 'animate-[spin_8s_linear_infinite]' : ''}`} />
            
            <div
              className={`w-20 h-20 transition-all duration-500 flex items-center justify-center border-4
                ${usingCustom ? 'border-slate-900 dark:border-white' : 'border-slate-300 dark:border-slate-800'}`}
              style={{
                clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                background: usingCustom ? playerColor : 'conic-gradient(from 0deg, red, yellow, lime, cyan, blue, magenta, red)',
              }}
            >
              <div className="w-8 h-8 bg-white/20 backdrop-blur-sm border-2 border-white animate-pulse" 
                   style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
            </div>
          </label>
          <span className="font-mono text-[10px] font-black text-slate-500 dark:text-sky-500 uppercase tracking-widest">Override_Core</span>
        </div>
      </div>

      {/* BARRE DE FLUX : Style Télémétrie Racing */}
      <div className="mt-12 p-4 bg-slate-900/5 dark:bg-black/40 border-2 border-slate-900 dark:border-sky-900">
        <div className="flex justify-between items-end mb-3">
          <div className="flex flex-col leading-none">
            <span className="text-[10px] font-mono text-slate-500 dark:text-sky-400 uppercase tracking-[0.2em]">Plasma_Output</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white italic">{playerColor.toUpperCase()}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-emerald-500 animate-pulse">STABLE</span>
            <div className="w-10 h-10 border-2 border-slate-900 dark:border-white p-1" style={{ backgroundColor: playerColor }} />
          </div>
        </div>

        <div className="h-4 w-full bg-slate-300 dark:bg-slate-800 relative overflow-hidden">
          {/* Grille de fond sur la barre */}
          <div className="absolute inset-0 opacity-20 bg-[grid:linear-gradient(90deg,transparent_9px,#000_10px)] bg-[size:10px_100%]" />
          
          <div
            className="h-full transition-all duration-1000 ease-out relative"
            style={{ 
              width: usingCustom ? '100%' : '40%', 
              backgroundColor: playerColor,
              boxShadow: `inset 0 0 20px rgba(0,0,0,0.3)`
            }}
          >
            {/* Effet de brillance qui traverse la barre */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[scan_2s_linear_infinite]" 
                 style={{ backgroundSize: '200% 100%' }} />
          </div>
        </div>
      </div>

      {/* FOOTER : Détails de debug */}
      <div className="mt-6 flex justify-between items-center opacity-40 font-mono text-[8px] text-slate-500 dark:text-sky-200">
        <div className="flex gap-4">
           <span>R_ADDR: 0x442</span>
           <span>G_ADDR: 0x119</span>
           <span>B_ADDR: 0x902</span>
        </div>
        <span className="flex items-center gap-1 animate-pulse">
          <Icon name="dot" size={7} filled /> CALIBRATION_ACTIVE
        </span>
      </div>

      <style>{`
        @keyframes scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}

export default ColorSelectorView