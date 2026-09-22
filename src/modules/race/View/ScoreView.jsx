/* eslint-disable react-hooks/static-components */
import React from 'react'
import { useApp } from '../../../shared/contexts/AppContext'
import { formatDuration } from '../../../shared/utils/time'

const ScoreView = ({ wpm = 0, accuracy = 100, progress = 0, combo = 0, elapsedMs = 0 }) => {
  const { playerColor } = useApp()

  // Helper pour les boîtes stylisées
  const StatBox = ({ label, value, sub, children, colorClass = "" }) => (
    <div className="relative flex flex-col gap-1 bg-slate-100 dark:bg-slate-950 border-2 border-slate-900 dark:border-sky-900/40 px-5 py-4 flex-1 min-w-[150px] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_0px_0px_#0ea5e911]"
         style={{ clipPath: 'polygon(0 0, 100% 0, 100% 80%, 90% 100%, 0 100%)' }}>
      
      {/* Petit indicateur d'angle */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-sky-500 opacity-50" />
      
      <span className="font-mono text-[9px] text-slate-500 dark:text-sky-500 font-black uppercase tracking-[0.2em]">
        {label}
      </span>
      
      <div className="flex items-baseline gap-2">
        <span className={`font-mono text-3xl font-black leading-none tracking-tighter ${colorClass || 'text-slate-900 dark:text-white'}`}>
          {value}
        </span>
        {sub && <span className="font-mono text-[8px] text-slate-400 uppercase italic">{sub}</span>}
      </div>
      
      {children}
    </div>
  )

  return (
    <div className="flex flex-wrap md:flex-nowrap gap-4 w-full p-2">

      {/* ── VELOCITY ── */}
      <StatBox label="Velocity_WPM" value={wpm} sub="Units/M">
        <div className="mt-2 h-1 w-full bg-slate-200 dark:bg-white/5 overflow-hidden">
          <div 
            className="h-full bg-sky-500 transition-all duration-500 ease-out" 
            style={{ width: `${Math.min((wpm / 120) * 100, 100)}%`, boxShadow: `0 0 10px #0ea5e9` }} 
          />
        </div>
      </StatBox>

      {/* ── SYNC PROGRESS ── */}
      <StatBox label="Sync_Progress" value={`${progress}%`} sub="Distance">
        <div className="relative h-3 mt-2 bg-slate-900/10 dark:bg-black/40 border border-slate-900/20 dark:border-sky-900/50 p-[2px]">
          <div
            className="h-full transition-all duration-500 ease-out relative overflow-hidden"
            style={{
              width: `${progress}%`,
              backgroundColor: playerColor || '#0ea5e9'
            }}
          >
            {/* Effet de balayage laser */}
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] w-20 animate-[shimmer_2s_infinite]" />
          </div>
        </div>
      </StatBox>

      {/* ── ELAPSED + STREAK ── */}
      <StatBox label="Race_Clock" value={formatDuration(elapsedMs)} sub="Elapsed">
        <div className="flex gap-1.5 mt-2 items-center">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-1.5 w-4 transition-all duration-200"
              style={{
                backgroundColor: i < combo ? (playerColor || '#0ea5e9') : undefined,
                boxShadow: i < combo ? `0 0 8px ${playerColor}` : 'none',
              }}
            >
              {i >= combo && <div className="h-full w-full bg-slate-300 dark:bg-white/5" />}
            </div>
          ))}
          <span className={`font-mono text-[8px] font-black uppercase italic ml-1 ${combo > 0 ? 'text-amber-500' : 'text-slate-400'}`}>
            {combo > 0 ? `Streak ×${combo}` : 'No_Streak'}
          </span>
        </div>
      </StatBox>

      {/* ── ACCURACY ── */}
      <StatBox 
        label="Accuracy_Rating" 
        value={`${accuracy}%`} 
        colorClass={accuracy >= 95 ? 'text-emerald-500' : accuracy >= 80 ? 'text-amber-500' : 'text-rose-500'}
      >
        <div className="flex gap-1.5 mt-2">
          {/* LED Indicators */}
          {[...Array(3)].map((_, i) => {
            const isActive = (i === 0 && accuracy >= 95) || (i === 1 && accuracy >= 80) || (i === 2 && accuracy < 80);
            const colors = ['bg-emerald-500', 'bg-amber-500', 'bg-rose-500'];
            return (
              <div 
                key={i} 
                className={`h-1.5 w-4 transition-all duration-300 ${isActive ? colors[i] : 'bg-slate-300 dark:bg-white/5'}`}
                style={{ boxShadow: isActive ? `0 0 8px ${colors[i].replace('bg-', '')}` : 'none' }}
              />
            );
          })}
        </div>
      </StatBox>

      <style>{`
        @keyframes shimmer {
          from { transform: translateX(-200%); }
          to { transform: translateX(500%); }
        }
      `}</style>
    </div>
  )
}

export default ScoreView