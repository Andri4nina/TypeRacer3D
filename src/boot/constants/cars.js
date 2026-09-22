// Catalogue des véhicules.
// `body`  : carrosserie procédurale (voir shared/components/cars/CarModels)
// `file`  : modèle .glb chargé depuis public/ — prioritaire sur `body`
// `icon`  : nom d'icône SVG (plus d'emoji, cf. shared/components/Icon)
// `rating`: jauges purement cosmétiques affichées dans le Vehicle Lab

export const CAR_MODELS = [
  {
    id:      "f1",
    name:    "Apex Monoposto",
    icon:    "carF1",
    body:    "f1",
    file:    null,
    scale:   1.0,
    offsetY: 0,
    preview: "#f59e0b",
    rating:  { speed: 10, grip: 9, weight: 2 },
  },
  {
    id:      "hyper",
    name:    "Vantom GT-X",
    icon:    "carHyper",
    body:    "hyper",
    file:    null,
    scale:   1.0,
    offsetY: 0,
    preview: "#a855f7",
    rating:  { speed: 9, grip: 8, weight: 4 },
  },
  {
    id:      "muscle",
    name:    "Brute 440",
    icon:    "carMuscle",
    body:    "muscle",
    file:    null,
    scale:   1.0,
    offsetY: 0,
    preview: "#ef4444",
    rating:  { speed: 8, grip: 5, weight: 7 },
  },
  {
    id:      "gtr",
    name:    "Skyline GT-R",
    icon:    "carGt",
    body:    "hyper",              // repli si le .glb ne charge pas
    file:    "/cars/NissanGTR.glb",
    scale:   0.55,
    offsetY: 0,
    preview: "#3b82f6",
    rating:  { speed: 9, grip: 9, weight: 5 },
  },
  {
    id:      "kart",
    name:    "Sprint Kart",
    icon:    "carKart",
    body:    "kart",
    file:    null,
    scale:   1.0,
    offsetY: 0,
    preview: "#22c55e",
    rating:  { speed: 5, grip: 10, weight: 1 },
  },
  {
    id:      "suv",
    name:    "Ridge Runner",
    icon:    "carSuv",
    body:    "suv",
    file:    null,
    scale:   1.0,
    offsetY: 0,
    preview: "#0ea5e9",
    rating:  { speed: 6, grip: 6, weight: 9 },
  },
  {
    id:      "pickup",
    name:    "Haul 3500",
    icon:    "carPickup",
    body:    "pickup",
    file:    null,
    scale:   1.0,
    offsetY: 0,
    preview: "#f97316",
    rating:  { speed: 5, grip: 5, weight: 10 },
  },
];

export const DEFAULT_CAR_ID = "f1";
