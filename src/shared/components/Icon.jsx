import React from 'react'

// Jeu d'icônes SVG au trait, dessinées sur une grille 24×24.
// Remplace les emoji : rendu identique sur toutes les plateformes, couleur
// héritée du texte (`currentColor`) et taille pilotée par le composant.

const PATHS = {
  // ── Modes de jeu ────────────────────────────────────────────────
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" />
    </>
  ),
  cpu: (
    <>
      <rect x="5" y="5" width="14" height="14" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18z" />
    </>
  ),

  // ── Course ──────────────────────────────────────────────────────
  flag: (
    <>
      <path d="M5 15s1-1 4-1 5 2 8 2 4-1 4-1V4s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <path d="M5 22v-7" />
    </>
  ),
  trophy: (
    <>
      <path d="M7 9H5.5a2.5 2.5 0 0 1 0-5H7" />
      <path d="M17 9h1.5a2.5 2.5 0 0 0 0-5H17" />
      <path d="M5 22h14" />
      <path d="M10 14.5V17c0 .8-.6 1.3-1.2 1.6C7.6 19.2 7 20.4 7 22" />
      <path d="M14 14.5V17c0 .8.6 1.3 1.2 1.6 1.2.6 1.8 1.8 1.8 3.4" />
      <path d="M17 3H7v6a5 5 0 0 0 10 0z" />
    </>
  ),
  medal: (
    <>
      <path d="M8 2 6 7l3 4" />
      <path d="m16 2 2 5-3 4" />
      <circle cx="12" cy="15.5" r="6" />
      <path d="m12 12.5 1 2 2 .3-1.5 1.4.4 2.1-1.9-1-1.9 1 .4-2.1L9 14.8l2-.3z" />
    </>
  ),
  gauge: (
    <>
      <path d="M3.5 18a10 10 0 1 1 17 0" />
      <path d="m12 14 4.5-4.5" />
      <circle cx="12" cy="14" r="1.5" />
    </>
  ),
  zap: <path d="M13 2 4 14h7l-1 8 9-12h-7z" />,
  crosshair: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
    </>
  ),

  // ── Contrôles ───────────────────────────────────────────────────
  play: <path d="M7 4.5v15l12-7.5z" />,
  pause: (
    <>
      <rect x="7" y="4" width="3.5" height="16" rx="0.5" />
      <rect x="13.5" y="4" width="3.5" height="16" rx="0.5" />
    </>
  ),
  restart: (
    <>
      <path d="M3 3v6h6" />
      <path d="M3.6 15a9 9 0 1 0 2.1-9.4L3 8.5" />
    </>
  ),
  backspace: (
    <>
      <path d="M21 5H9l-7 7 7 7h12a1.8 1.8 0 0 0 1.8-1.8V6.8A1.8 1.8 0 0 0 21 5z" />
      <path d="m18 9.5-6 5M12 9.5l6 5" />
    </>
  ),
  exit: (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </>
  ),
  copy: (
    <>
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
    </>
  ),
  check: <path d="m4 12.5 5 5L20 6.5" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,

  // ── État / HUD ──────────────────────────────────────────────────
  dot: <circle cx="12" cy="12" r="5" />,
  signal: (
    <>
      <path d="M5 19v-4M10 19v-8M15 19v-12M20 19V4" />
    </>
  ),
  users: (
    <>
      <path d="M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="3.5" />
      <path d="M22 20v-2a4 4 0 0 0-3-3.8" />
      <path d="M16 3.2a4 4 0 0 1 0 7.6" />
    </>
  ),
  camera: (
    <>
      <path d="m22 8-6 4 6 4z" />
      <rect x="2" y="6" width="14" height="12" rx="2" />
    </>
  ),
  chart: (
    <>
      <path d="M3 3v18h18" />
      <path d="m7 15 4-5 3 3 5-7" />
    </>
  ),
  volume: (
    <>
      <path d="M11 5 6 9H2v6h4l5 4z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M18.5 5.5a9 9 0 0 1 0 13" />
    </>
  ),
  volumeOff: (
    <>
      <path d="M11 5 6 9H2v6h4l5 4z" />
      <path d="m16 9 5 6M21 9l-5 6" />
    </>
  ),
  sliders: (
    <>
      <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3" />
      <path d="M1 14h6M9 8h6M17 16h6" />
    </>
  ),

  // ── Silhouettes de véhicules (sélecteur) ────────────────────────
  carF1: (
    <>
      <path d="M2 14h3l2-3h6l1.5 3H22" />
      <path d="M4 11h2M16 9h5" />
      <circle cx="7" cy="16" r="2.2" />
      <circle cx="17.5" cy="16" r="2.2" />
    </>
  ),
  carMuscle: (
    <>
      <path d="M2.5 15v-2l3-.5 2.5-3.5h7l3 3.5 3 .5v2" />
      <path d="M8 9.5v3.5M15 9.5v3.5" />
      <circle cx="7" cy="16" r="2.2" />
      <circle cx="17" cy="16" r="2.2" />
    </>
  ),
  carSuv: (
    <>
      <path d="M2.5 15V9.5l3-4h9l3.5 4H21.5V15" />
      <path d="M5.5 9.5h13" />
      <path d="M11 5.5V15" />
      <circle cx="7" cy="16.5" r="2" />
      <circle cx="17" cy="16.5" r="2" />
    </>
  ),
  carKart: (
    <>
      <path d="M4 14.5h4l1.5-3h5l1 3h4.5" />
      <path d="M11 11.5V9h3" />
      <circle cx="6" cy="16" r="1.8" />
      <circle cx="18" cy="16" r="1.8" />
    </>
  ),
  carHyper: (
    <>
      <path d="M2 15.5l2-1 3-3.5h8l4 3.5 3 1" />
      <path d="M18 11.5h4" />
      <circle cx="7" cy="16.5" r="2" />
      <circle cx="17" cy="16.5" r="2" />
    </>
  ),
  carPickup: (
    <>
      <path d="M2.5 15V11h6l2-4h4l2 4h5v4" />
      <path d="M8.5 7v4" />
      <circle cx="7" cy="16.5" r="2" />
      <circle cx="17.5" cy="16.5" r="2" />
    </>
  ),
  carGt: (
    <>
      <path d="M2.5 15v-2l3.5-1 2.5-3h7l3.5 3 3 1v2" />
      <path d="M9 9v3.5M15.5 9v3.5" />
      <circle cx="7" cy="16.5" r="2.2" />
      <circle cx="17" cy="16.5" r="2.2" />
    </>
  ),
}

export const ICON_NAMES = Object.keys(PATHS)

const Icon = ({ name, size = 16, strokeWidth = 1.8, className = '', filled = false, ...rest }) => {
  const shape = PATHS[name]
  if (!shape) return null

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={`inline-block shrink-0 ${className}`}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {shape}
    </svg>
  )
}

export default Icon
