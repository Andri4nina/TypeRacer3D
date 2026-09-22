// Points de vue disponibles pendant une course.
// `icon` renvoie au jeu d'icônes SVG (shared/components/Icon).
export const CAMERA_MODES = [
  { id: "chase",     label: "Chase",     icon: "target",    desc: "Caméra poursuite, recule avec la vitesse" },
  { id: "broadcast", label: "Broadcast", icon: "camera",    desc: "Vue TV latérale qui suit le peloton" },
  { id: "hood",      label: "Cockpit",   icon: "crosshair", desc: "Collée au capot, la plus nerveuse" },
];

export const DEFAULT_CAMERA_MODE = "chase";
