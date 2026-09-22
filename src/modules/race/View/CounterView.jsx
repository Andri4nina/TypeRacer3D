import React, { useState, useEffect } from 'react'
import { useApp } from '../../../shared/contexts/AppContext'
import audio from '../../../shared/services/AudioService'

const CounterView = ({ onComplete, from = 5 }) => {
  const [count, setCount] = useState(from)
  const { playerColor } = useApp()

  // Bip à chaque graduation, accord montant sur le GO
  useEffect(() => {
    audio.countdownTick(count <= 0)
  }, [count])

  useEffect(() => {
    if (count < 0) {
      const finishTimeout = setTimeout(() => onComplete?.(), 600)
      return () => clearTimeout(finishTimeout)
    }

    const t = setTimeout(() => setCount(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [count, onComplete])

  return (
    <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950/90 overflow-hidden">
      
      {/* GRID DE FOND TACTIQUE */}
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* VISEURS HUD ROTATIFS (Remplacent les ronds) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Viseur Principal Octogonal */}
        <div 
          className="w-[400px] h-[400px] border-4 border-slate-800 animate-[spin_20s_linear_infinite]" 
          style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' }}
        />
        {/* Éléments de visée (Coins) */}
        <div className="absolute w-[320px] h-[320px] flex justify-between items-start">
           <div className="w-8 h-8 border-t-4 border-l-4" style={{ borderColor: playerColor }} />
           <div className="w-8 h-8 border-t-4 border-r-4" style={{ borderColor: playerColor }} />
        </div>
        <div className="absolute w-[320px] h-[320px] flex justify-between items-end">
           <div className="w-8 h-8 border-b-4 border-l-4" style={{ borderColor: playerColor }} />
           <div className="w-8 h-8 border-b-4 border-r-4" style={{ borderColor: playerColor }} />
        </div>
      </div>

      {/* CHIFFRE CENTRAL */}
      <div className="relative z-10">
        <div
          key={count}
          className="font-black text-center select-none italic tracking-tighter"
          style={{
            fontSize: count <= 0 ? '7rem' : '12rem',
            lineHeight: 0.8,
            animation: 'countPop 0.6s cubic-bezier(0.19, 1, 0.22, 1)',
            color: count <= 0 ? playerColor : 'white',
            textShadow: count <= 0 
              ? `0 0 40px ${playerColor}, 0 0 80px ${playerColor}` 
              : '8px 8px 0px rgba(255,255,255,0.1)',
          }}
        >
          {count <= 0 ? 'IGNITION' : `0${count}`}
        </div>

        {/* Lignes de scan horizontales uniquement au moment du GO */}
        {count <= 0 && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-4 bg-white/20 blur-xl animate-pulse" />
        )}
      </div>

      {/* BARRE DE CHARGEMENT ÉNERGÉTIQUE */}
      <div className="mt-20 flex flex-col items-center gap-4">
        <div className="flex gap-2 p-1 border-2 border-slate-800 bg-black/40">
          {[...Array(from)].map((_, i) => (
            <div
              key={i}
              className={`w-10 h-4 transition-all duration-300 ${i < (from - count) ? '' : 'bg-slate-900'}`}
              style={{ 
                backgroundColor: i < (from - count) ? playerColor : '',
                clipPath: 'polygon(20% 0%, 100% 0%, 80% 100%, 0% 100%)' 
              }}
            />
          ))}
        </div>
        
        {/* TEXTES DE STATUT */}
        <div className="flex flex-col items-center">
          <p className="font-mono text-[10px] tracking-[0.6em] text-white font-black uppercase">
            {count <= 0 ? 'SYSTEMS_OVERDRIVE' : 'STAGING_SEQUENCE'}
          </p>
          <p className="font-mono text-[8px] text-slate-500 uppercase mt-2">
             Reactor_Temp: <span style={{ color: playerColor }}>{100 - (count * 20)}%</span> // Pressure: NOMINAL
          </p>
        </div>
      </div>

      {/* COORDONNÉES DE DÉBUG DANS LES COINS */}
      <div className="absolute top-10 left-10 font-mono text-[9px] text-slate-600 opacity-50 text-left">
        LAT: 21.4429<br/>LON: 47.9021
      </div>
      <div className="absolute bottom-10 right-10 font-mono text-[9px] text-slate-600 opacity-50 text-right">
        TR3D_CORE_ID: X-99<br/>SIGNAL: 5/5
      </div>

      <style>{`
        @keyframes countPop {
          0%   { opacity: 0; transform: scale(3) skewX(-20deg); filter: blur(20px) brightness(2); }
          50%  { opacity: 1; transform: scale(0.9) skewX(5deg); filter: blur(0px) brightness(1.2); }
          100% { opacity: 1; transform: scale(1) skewX(0deg); filter: blur(0px) brightness(1); }
        }
      `}</style>
    </div>
  )
}

export default CounterView