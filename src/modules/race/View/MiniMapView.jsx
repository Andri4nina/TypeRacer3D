import React from 'react'
import Icon from '../../../shared/components/Icon'

// Barre de progression globale : une pastille par concurrent, positionnée sur
// l'ensemble du circuit. Donne en un coup d'œil l'écart avec les adversaires
// sans quitter le texte des yeux.
const MiniMapView = ({ racers = [] }) => {
  if (racers.length === 0) return null

  return (
    <div className="w-full px-4 pt-3 pointer-events-none select-none">
      <div className="relative mx-auto max-w-4xl">

        {/* Repères de départ / arrivée */}
        <div className="flex items-center justify-between mb-1 font-mono text-[8px] font-black uppercase tracking-[0.3em] text-slate-500">
          <span className="flex items-center gap-1">
            <Icon name="dot" size={7} filled className="text-emerald-500" />
            Start
          </span>
          <span className="flex items-center gap-1 text-sky-500">
            Finish
            <Icon name="flag" size={9} strokeWidth={2.5} />
          </span>
        </div>

        <div className="relative h-7">
          {/* Rail */}
          <div className="absolute top-1/2 left-0 right-0 h-[3px] -translate-y-1/2 bg-slate-800/80 border-y border-white/5" />

          {/* Graduations tous les 10 % */}
          <div className="absolute top-1/2 left-0 right-0 flex justify-between -translate-y-1/2">
            {[...Array(11)].map((_, i) => (
              <div key={i} className="w-px h-2 bg-white/10" />
            ))}
          </div>

          {/* Pastilles des concurrents */}
          {racers.map(racer => {
            const pct = Math.min(Math.max(racer.progress ?? 0, 0), 1) * 100
            return (
              <div
                key={racer.id}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-[left] duration-200 ease-out"
                style={{ left: `${pct}%` }}
              >
                <div
                  className={`relative ${racer.isPlayer ? 'w-3.5 h-3.5' : 'w-2.5 h-2.5'} rotate-45`}
                  style={{
                    backgroundColor: racer.color || '#64748b',
                    boxShadow: racer.isPlayer ? `0 0 10px ${racer.color}` : 'none',
                    outline: racer.isPlayer ? '2px solid rgba(255,255,255,0.85)' : 'none',
                  }}
                />
                {racer.isPlayer && (
                  <span
                    className="absolute -top-4 left-1/2 -translate-x-1/2 font-mono text-[7px] font-black uppercase whitespace-nowrap"
                    style={{ color: racer.color }}
                  >
                    {Math.round(pct)}%
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default MiniMapView
