import React from 'react'

// Palette de matériaux partagée par toutes les carrosseries.
// Les éléments JSX renvoyés sont des descripteurs : les réutiliser dans
// plusieurs meshes crée bien une instance par mesh.
export const useCarMaterials = (color) => ({
  carbon: <meshStandardMaterial color="#111" metalness={0.8} roughness={0.25} />,
  tire:   <meshStandardMaterial color="#1a1a1a" roughness={0.9} />,
  rim:    <meshStandardMaterial color="#e2e8f0" metalness={1} roughness={0.15} />,
  body:   <meshStandardMaterial color={color} metalness={0.85} roughness={0.15} envMapIntensity={1} />,
  dark:   <meshStandardMaterial color="#0b1220" metalness={0.4} roughness={0.5} />,
  glass:  <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.05} transparent opacity={0.75} />,
  chrome: <meshStandardMaterial color="#94a3b8" metalness={1} roughness={0.2} />,
})
