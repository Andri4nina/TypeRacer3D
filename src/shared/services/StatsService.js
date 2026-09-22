// ─────────────────────────────────────────────────────────────────────────────
// StatsService — persistance locale des performances (localStorage).
//
//   • historique des courses (WPM, précision, durée, mots fautifs)
//   • record personnel par texte + trace de la voiture fantôme
//   • XP cumulée et déblocages
//
// Tout est encapsulé ici : aucun composant ne touche localStorage directement.
// Chaque lecture est défensive, un stockage indisponible (navigation privée,
// quota plein) ne doit jamais casser une course.
// ─────────────────────────────────────────────────────────────────────────────

const KEYS = {
  HISTORY: 'tr3d_history',
  GHOSTS:  'tr3d_ghosts',
  PROFILE: 'tr3d_profile',
}

const MAX_HISTORY = 60

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

const write = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

// ── Rangs ────────────────────────────────────────────────────────────────────
export const RANKS = [
  { id: 'rookie',   label: 'Débutant',     min: 0,   color: '#94a3b8', icon: 'dot' },
  { id: 'inter',    label: 'Intermédiaire', min: 40,  color: '#22c55e', icon: 'signal' },
  { id: 'pro',      label: 'Pro',          min: 70,  color: '#0ea5e9', icon: 'zap' },
  { id: 'master',   label: 'Master',       min: 100, color: '#a855f7', icon: 'trophy' },
  { id: 'legend',   label: 'Légende',      min: 140, color: '#f59e0b', icon: 'medal' },
]

export const rankForWpm = (wpm = 0) =>
  [...RANKS].reverse().find(r => wpm >= r.min) ?? RANKS[0]

export const nextRankForWpm = (wpm = 0) =>
  RANKS.find(r => wpm < r.min) ?? null

// ── Environnements & déblocages ──────────────────────────────────────────────
// Le palier est exprimé en XP cumulée pour rester lisible côté joueur.
export const UNLOCKABLES = [
  { id: 'circuit_day',   kind: 'track', label: 'Circuit Diurne',   xp: 0,    icon: 'flag' },
  { id: 'car_muscle',    kind: 'car',   label: 'Brute 440',        xp: 300,  icon: 'carMuscle', carId: 'muscle' },
  { id: 'circuit_night', kind: 'track', label: 'Circuit Nocturne', xp: 800,  icon: 'globe' },
  { id: 'car_hyper',     kind: 'car',   label: 'Vantom GT-X',      xp: 1500, icon: 'carHyper',  carId: 'hyper' },
  { id: 'circuit_cyber', kind: 'track', label: 'Ville Cyberpunk',  xp: 2600, icon: 'cpu' },
  { id: 'car_gtr',       kind: 'car',   label: 'Skyline GT-R',     xp: 4000, icon: 'carGt',     carId: 'gtr' },
]

// XP d'une course : la vitesse compte, la propreté compte double sur la fin.
export const xpForRace = ({ wpm = 0, accuracy = 100, progress = 1 }) =>
  Math.max(0, Math.round(wpm * 1.5 * (accuracy / 100) * progress))

// ── Profil ───────────────────────────────────────────────────────────────────
const emptyProfile = () => ({ xp: 0, races: 0, bestWpm: 0 })

export const getProfile = () => ({ ...emptyProfile(), ...read(KEYS.PROFILE, {}) })

export const levelForXp = (xp = 0) => {
  const unlocked = UNLOCKABLES.filter(u => xp >= u.xp)
  const next = UNLOCKABLES.find(u => xp < u.xp) ?? null
  return { unlocked, next }
}

// ── Historique ───────────────────────────────────────────────────────────────
export const getHistory = () => read(KEYS.HISTORY, [])

// `samples` : [{ t: msDepuisDepart, wpm, progress }] — sert au graphique
// `mistakes`: [{ word, index }]
export const recordRace = ({
  wpm = 0,
  accuracy = 100,
  errors = 0,
  elapsedMs = 0,
  progress = 1,
  textId = null,
  samples = [],
  mistakes = [],
  mode = 'solo',
}) => {
  const entry = {
    at: Date.now(),
    wpm, accuracy, errors, elapsedMs, progress, textId, mode,
    samples: samples.slice(0, 400),
    mistakes: mistakes.slice(0, 40),
  }

  const history = [entry, ...getHistory()].slice(0, MAX_HISTORY)
  write(KEYS.HISTORY, history)

  const gained = xpForRace({ wpm, accuracy, progress })
  const profile = getProfile()
  const updated = {
    xp: profile.xp + gained,
    races: profile.races + 1,
    bestWpm: Math.max(profile.bestWpm, wpm),
  }
  write(KEYS.PROFILE, updated)

  return { entry, gained, profile: updated, isNewBest: wpm > profile.bestWpm }
}

// ── Voiture fantôme ──────────────────────────────────────────────────────────
// Un fantôme par texte : la meilleure trace enregistrée dessus.
export const getGhost = (textId) => {
  if (!textId) return null
  const ghosts = read(KEYS.GHOSTS, {})
  return ghosts[textId] ?? null
}

export const saveGhostIfBest = (textId, { wpm, elapsedMs, samples }) => {
  if (!textId || !samples?.length) return false
  const ghosts = read(KEYS.GHOSTS, {})
  const current = ghosts[textId]
  if (current && current.wpm >= wpm) return false

  ghosts[textId] = { wpm, elapsedMs, samples: samples.slice(0, 400), at: Date.now() }
  return write(KEYS.GHOSTS, ghosts)
}

// Interpole la progression du fantôme à l'instant `t` (ms depuis le départ).
export const ghostProgressAt = (ghost, t) => {
  if (!ghost?.samples?.length) return 0
  const s = ghost.samples
  if (t <= s[0].t) return s[0].progress
  const last = s[s.length - 1]
  if (t >= last.t) return last.progress

  // Les échantillons sont chronologiques : une simple recherche linéaire
  // suffit largement pour 400 points, appelée une fois par frame.
  for (let i = 1; i < s.length; i++) {
    if (s[i].t >= t) {
      const a = s[i - 1]
      const b = s[i]
      const span = b.t - a.t
      const k = span > 0 ? (t - a.t) / span : 0
      return a.progress + (b.progress - a.progress) * k
    }
  }
  return last.progress
}

// Identifiant stable d'un texte, sans stocker le texte entier
export const textIdOf = (text = '') => {
  let h = 0
  for (let i = 0; i < text.length; i++) {
    h = (h * 31 + text.charCodeAt(i)) | 0
  }
  return `t${(h >>> 0).toString(36)}_${text.length}`
}

export const clearAllStats = () => {
  Object.values(KEYS).forEach(k => {
    try { localStorage.removeItem(k) } catch { /* rien à faire */ }
  })
}
