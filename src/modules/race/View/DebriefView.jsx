import React, { useMemo } from 'react'
import Icon from '../../../shared/components/Icon'
import { rankForWpm, nextRankForWpm, levelForXp } from '../../../shared/services/StatsService'
import { formatDuration } from '../../../shared/utils/time'

// ─── Courbe WPM / temps ───────────────────────────────────────────────────────
// SVG tracé à la main : pas de dépendance graphique pour une seule courbe.
const WpmChart = ({ samples = [], color = '#0ea5e9' }) => {
  const { line, area, peak, maxWpm, duration } = useMemo(() => {
    const pts = samples.filter(s => Number.isFinite(s.wpm) && Number.isFinite(s.t))
    if (pts.length < 2) return { line: '', area: '', peak: null, maxWpm: 0, duration: 0 }

    const W = 300
    const H = 90
    const maxWpm = Math.max(...pts.map(p => p.wpm), 10)
    const duration = Math.max(pts[pts.length - 1].t, 1)

    const toXY = (p) => [
      (p.t / duration) * W,
      H - (p.wpm / maxWpm) * (H - 8) - 4,
    ]

    const coords = pts.map(toXY)
    const line = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
    const area = `${line} L${W},${H} L0,${H} Z`

    const peakPoint = pts.reduce((a, b) => (b.wpm > a.wpm ? b : a), pts[0])
    return { line, area, peak: { ...peakPoint, xy: toXY(peakPoint) }, maxWpm, duration }
  }, [samples])

  if (!line) {
    return (
      <p className="font-mono text-[9px] text-slate-500 uppercase italic py-6 text-center">
        Course trop courte pour tracer une courbe
      </p>
    )
  }

  return (
    <div className="relative">
      <svg viewBox="0 0 300 90" className="w-full h-24" preserveAspectRatio="none">
        <defs>
          <linearGradient id="wpmFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75].map(r => (
          <line key={r} x1="0" y1={90 * r} x2="300" y2={90 * r}
                stroke="currentColor" strokeWidth="0.5" className="text-white/10" />
        ))}

        <path d={area} fill="url(#wpmFill)" />
        <path d={line} fill="none" stroke={color} strokeWidth="1.8"
              vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
        {peak && (
          <circle cx={peak.xy[0]} cy={peak.xy[1]} r="2.5" fill="#fff" stroke={color} strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke" />
        )}
      </svg>

      <div className="flex justify-between font-mono text-[8px] uppercase tracking-widest text-slate-500 mt-1">
        <span>0s</span>
        <span className="text-slate-400">Pic {peak?.wpm ?? 0} wpm</span>
        <span>{formatDuration(duration)}</span>
      </div>
      <span className="absolute top-0 left-0 font-mono text-[8px] text-slate-600">{maxWpm}</span>
    </div>
  )
}

// ─── Mots sur lesquels le joueur a buté ───────────────────────────────────────
const ProblemWords = ({ mistakes = [] }) => {
  const ranked = useMemo(() => {
    const counts = new Map()
    mistakes.forEach(m => {
      const w = (m.word || '').trim()
      if (!w) return
      counts.set(w, (counts.get(w) || 0) + 1)
    })
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
  }, [mistakes])

  if (ranked.length === 0) {
    return (
      <div className="flex items-center gap-2 py-3 font-mono text-[10px] text-emerald-500 uppercase font-black">
        <Icon name="check" size={13} strokeWidth={3} />
        Aucune faute — parcours net
      </div>
    )
  }

  const worst = ranked[0][1]

  return (
    <div className="flex flex-wrap gap-1.5 py-1">
      {ranked.map(([word, count]) => (
        <span
          key={word}
          className="flex items-center gap-1.5 px-2 py-1 border font-mono text-[10px] font-black"
          style={{
            borderColor: count >= worst ? '#f43f5e' : 'rgba(148,163,184,0.3)',
            color: count >= worst ? '#fb7185' : '#94a3b8',
            backgroundColor: count >= worst ? 'rgba(244,63,94,0.08)' : 'transparent',
          }}
        >
          {word}
          {count > 1 && <span className="opacity-60 italic">×{count}</span>}
        </span>
      ))}
    </div>
  )
}

// ─── Rang + XP ────────────────────────────────────────────────────────────────
const RankPanel = ({ wpm, gained, profile }) => {
  const rank = rankForWpm(wpm)
  const next = nextRankForWpm(wpm)
  const { next: nextUnlock } = levelForXp(profile?.xp ?? 0)

  const toNext = next ? Math.max(0, next.min - wpm) : 0
  const ratio = next
    ? Math.min(1, (wpm - rank.min) / Math.max(1, next.min - rank.min))
    : 1

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center w-11 h-11 border-2 shrink-0"
          style={{ borderColor: rank.color, color: rank.color }}
        >
          <Icon name={rank.icon} size={22} strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[8px] uppercase tracking-[0.3em] text-slate-500">Rang</p>
          <p className="text-lg font-black italic uppercase leading-none" style={{ color: rank.color }}>
            {rank.label}
          </p>
        </div>
        {gained > 0 && (
          <div className="text-right">
            <p className="font-mono text-[8px] uppercase tracking-widest text-slate-500">XP gagnée</p>
            <p className="font-mono text-base font-black italic text-amber-400">+{gained}</p>
          </div>
        )}
      </div>

      {next && (
        <div>
          <div className="flex justify-between font-mono text-[8px] uppercase tracking-widest text-slate-500 mb-1">
            <span>Vers {next.label}</span>
            <span>{toNext} wpm restants</span>
          </div>
          <div className="h-1.5 bg-black/40 border border-white/10">
            <div className="h-full transition-all duration-700"
                 style={{ width: `${ratio * 100}%`, backgroundColor: rank.color }} />
          </div>
        </div>
      )}

      {nextUnlock && (
        <div className="flex items-center gap-2 px-2 py-1.5 border border-white/10 bg-black/30">
          <Icon name={nextUnlock.icon} size={14} className="text-slate-400 shrink-0" />
          <span className="font-mono text-[9px] uppercase text-slate-400 truncate">
            Prochain déblocage : <span className="text-white font-black">{nextUnlock.label}</span>
          </span>
          <span className="ml-auto font-mono text-[9px] font-black text-amber-400 shrink-0">
            {Math.max(0, nextUnlock.xp - (profile?.xp ?? 0))} xp
          </span>
        </div>
      )}
    </div>
  )
}

// ─── Panneau complet ──────────────────────────────────────────────────────────
const DebriefView = ({ debrief, wpm, color = '#0ea5e9' }) => {
  if (!debrief) return null

  return (
    <div className="flex flex-col gap-5 p-6 border-t-4 border-slate-900 dark:border-sky-900 bg-slate-50 dark:bg-black/40">

      <section>
        <h4 className="flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-[0.3em] text-sky-500 mb-2">
          <Icon name="chart" size={13} strokeWidth={2.5} />
          Vitesse / Temps
        </h4>
        <WpmChart samples={debrief.samples} color={color} />
      </section>

      <section>
        <h4 className="flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-[0.3em] text-sky-500 mb-2">
          <Icon name="crosshair" size={13} strokeWidth={2.5} />
          Mots problématiques
        </h4>
        <ProblemWords mistakes={debrief.mistakes} />
      </section>

      <section>
        <RankPanel wpm={wpm} gained={debrief.gained} profile={debrief.profile} />
      </section>

      {(debrief.isNewBest || debrief.ghostSaved) && (
        <div className="flex items-center gap-2 px-3 py-2 border border-amber-500/50 bg-amber-500/10">
          <Icon name="trophy" size={15} className="text-amber-400 shrink-0" strokeWidth={2} />
          <span className="font-mono text-[10px] font-black uppercase tracking-widest text-amber-400">
            {debrief.isNewBest ? 'Nouveau record personnel' : 'Fantôme mis à jour'}
          </span>
        </div>
      )}
    </div>
  )
}

export default DebriefView
