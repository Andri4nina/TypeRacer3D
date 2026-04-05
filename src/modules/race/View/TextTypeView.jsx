import React, { useState, useEffect, useRef, useCallback } from 'react'
import { RACE_STATUS } from '../../../boot/constants/index'
import { useApp } from '../../../shared/contexts/AppContext'

const TextTypeView = ({ text = "", raceStatus, isPaused, onStats, onFinish }) => {
  const { playerColor } = useApp()
  const [typed, setTyped] = useState('')
  const inputRef = useRef(null)
  const startTimeRef = useRef(null)
  const totalErrorsRef = useRef(0)
  const totalKeystrokesRef = useRef(0)

  const isActive = raceStatus === RACE_STATUS.RACING && !isPaused

  useEffect(() => {
    if (isActive) inputRef.current?.focus()
  }, [isActive])

  const computeStats = useCallback((newTyped) => {
    const now = Date.now()
    if (!startTimeRef.current) startTimeRef.current = now
    const elapsedMin = Math.max((now - startTimeRef.current) / 60000, 0.001)

    let correctUpTo = 0
    for (let i = 0; i < newTyped.length; i++) {
      if (newTyped[i] === text[i]) correctUpTo++
      else break
    }

    const wpm = Math.round((correctUpTo / 5) / elapsedMin)
    const accuracy = totalKeystrokesRef.current > 0
      ? Math.max(0, Math.round(((totalKeystrokesRef.current - totalErrorsRef.current) / totalKeystrokesRef.current) * 100))
      : 100
    const progress = Math.min(newTyped.length / text.length, 1)

    onStats?.({ progress, wpm, accuracy })
  }, [text, onStats])

  const handleChange = (e) => {
    if (!isActive) return
    const val = e.target.value

    if (val.length > typed.length) {
      totalKeystrokesRef.current++
      if (val[val.length - 1] !== text[typed.length]) {
        totalErrorsRef.current++
      }
    }

    setTyped(val)
    computeStats(val)

    if (val.length >= text.length) {
      onFinish?.()
    }
  }

  return (
    <div
      className="relative w-full max-w-7xl mx-auto py-6 px-8 cursor-text bg-slate-100 dark:bg-black border-2 border-slate-900 dark:border-sky-900/30 overflow-hidden"
      onClick={() => inputRef.current?.focus()}
      style={{ clipPath: 'polygon(2% 0, 100% 0, 100% 100%, 0 100%, 0 15%)' }}
    >
      {/* BACKGROUND DECORATION */}
      <div className="absolute top-2 right-4 font-mono text-[10px] text-slate-300 dark:text-sky-900/50 pointer-events-none select-none uppercase">
        Input_Buffer_Sector_01
      </div>

      {/* INPUT CACHÉ */}
      <input
        ref={inputRef}
        type="text"
        value={typed}
        onChange={handleChange}
        disabled={!isActive}
        className="absolute inset-0 w-full opacity-0 z-50 cursor-default"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
      />

      {/* TEXT DISPLAY AREA : Garde la hauteur prédéfinie */}
      <div className="relative z-10 font-mono text-xl md:text-2xl leading-relaxed text-left select-none break-words max-h-[120px] overflow-y-auto pr-4 custom-scrollbar">
        {text.split('').map((char, i) => {
          let stateClass = ""
          let isCurrent = i === typed.length

          if (i < typed.length) {
            stateClass = typed[i] === char
              ? "text-green-500 "
              : "text-rose-500 bg-rose-500/10"
          } else {
            stateClass = "text-slate-400 dark:text-white"
          }

          return (
            <span 
              key={i} 
              className={`relative inline-block transition-all duration-75 border-b-2 ${isCurrent ? 'border-sky-500 bg-sky-500/5' : 'border-transparent'} ${stateClass}`}
            >
              {/* Le Curseur (Caret) */}
              {isCurrent && (
                <span
                  className="absolute bottom-0 left-0 w-full h-[3px] animate-pulse"
                  style={{ backgroundColor: playerColor || '#0ea5e9', boxShadow: `0 0 12px ${playerColor}` }}
                />
              )}
              {char === " " ? "\u00A0" : char}
            </span>
          )
        })}
      </div>

      {/* MINI BARRE D'ÉTAT : Style Radar / Terminal */}
      <div className="mt-6 flex items-center justify-between border-t-2 border-slate-900/10 dark:border-sky-900/20 pt-3 font-mono text-[9px] font-black uppercase tracking-[0.2em]">
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-300 dark:bg-slate-800"}`} />
            <span className={isActive ? "text-emerald-500" : "text-slate-400"}>
              {isActive ? "CORE_LINK_STABLE" : "STANDBY_MODE"}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-slate-500">
            <span className="opacity-50">PROG:</span>
            <span className="text-slate-900 dark:text-sky-400">{typed.length} / {text.length}</span>
          </div>
        </div>

        {isPaused ? (
          <div className="flex items-center gap-2 px-3 py-1 bg-amber-500 text-black skew-x-[-15deg] animate-pulse">
            <span className="font-black italic">! PAUSE_INTERRUPT</span>
          </div>
        ) : (
          <div className="text-[8px] text-slate-400 italic opacity-50">
            // DATA_STREAM_ACTIVE
          </div>
        )}
      </div>

      {/* STYLE POUR LE SCROLLBAR INTERNE */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: ${playerColor}33; 
          border-radius: 2px;
        }
      `}</style>
    </div>
  )
}

export default TextTypeView