/* eslint-disable react-hooks/purity -- la dispersion des confettis est
   volontairement aléatoire ; elle est figée par useMemo au premier rendu. */
import React, { useMemo } from 'react'

// Gerbe de confettis purement CSS : chaque morceau reçoit sa trajectoire, sa
// rotation et son délai. Pas de canvas, pas de boucle d'animation JS —
// le compositeur du navigateur fait tout le travail.
const PALETTE = ['#f59e0b', '#0ea5e9', '#22c55e', '#f43f5e', '#a855f7', '#ffffff']

const Confetti = ({ count = 70, color }) => {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 1.6,
        duration: 2.6 + Math.random() * 2.2,
        drift: (Math.random() - 0.5) * 220,
        spin: 360 + Math.random() * 900,
        size: 5 + Math.random() * 7,
        ratio: 0.4 + Math.random() * 0.9,
        tint: i % 7 === 0 && color ? color : PALETTE[i % PALETTE.length],
      })),
    [count, color]
  )

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-[110]" aria-hidden="true">
      {pieces.map(p => (
        <span
          key={p.id}
          className="absolute top-[-8%] will-change-transform"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size * p.ratio}px`,
            backgroundColor: p.tint,
            animation: `confettiFall ${p.duration}s cubic-bezier(0.25,0.6,0.4,1) ${p.delay}s forwards`,
            '--drift': `${p.drift}px`,
            '--spin': `${p.spin}deg`,
          }}
        />
      ))}

      <style>{`
        @keyframes confettiFall {
          0%   { transform: translate3d(0, 0, 0) rotate(0deg); opacity: 0; }
          8%   { opacity: 1; }
          100% { transform: translate3d(var(--drift), 115vh, 0) rotate(var(--spin)); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="confettiFall"] { animation: none !important; opacity: 0 !important; }
        }
      `}</style>
    </div>
  )
}

export default Confetti
