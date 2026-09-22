import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

// Briques communes à tous les modèles de voitures.
// Convention d'orientation : +X = avant, -X = arrière, Z = largeur.

export const Wheel =({ position, radius = 0.24, width = 0.32, accent = '#ffffff' }) => (
  <group position={position}>
    <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
      <cylinderGeometry args={[radius, radius, width, 24]} />
      <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
    </mesh>
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[radius * 0.58, radius * 0.58, width + 0.02, 12]} />
      <meshStandardMaterial color="#e2e8f0" metalness={1} roughness={0.15} />
    </mesh>
    <mesh
      rotation={[Math.PI / 2, 0, 0]}
      position={[0, 0, (width / 2 + 0.02) * (position[2] > 0 ? 1 : -1)]}
    >
      <sphereGeometry args={[0.045, 8, 8]} />
      <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={2} />
    </mesh>
  </group>
)

// Feux stop + flammes d'échappement. Tout ce qui dépend du temps vit ici,
// dans useFrame : on ne veut aucun appel impur pendant le rendu.
export const CarFx = ({
  color,
  boost = 0,
  errorAt = 0,
  shockMs = 350,
  exhaust = [-1.3, 0.14, 0.12],
  brake = [-1.25, 0.16, 0.14],
  flameScale = 1,
}) => {
  const flameRef = useRef()
  const brakeMats = useRef([])

  useFrame(({ clock }) => {
    if (flameRef.current) {
      const flicker = boost * (0.85 + Math.sin(clock.elapsedTime * 40) * 0.15) * flameScale
      flameRef.current.visible = boost > 0.05
      flameRef.current.scale.set(flicker, flicker, flicker)
    }
    const braking = errorAt > 0 && Date.now() - errorAt < shockMs
    brakeMats.current.forEach(m => {
      if (m) m.emissiveIntensity = braking ? 18 : 4
    })
  })

  const [bx, by, bz] = brake
  const [ex, ey, ez] = exhaust

  return (
    <>
      {[bz, -bz].map((z, i) => (
        <mesh key={`brake-${i}`} position={[bx, by, z]}>
          <boxGeometry args={[0.05, 0.08, 0.12]} />
          <meshStandardMaterial
            ref={m => { brakeMats.current[i] = m }}
            color="red"
            emissive="red"
            emissiveIntensity={4}
            toneMapped={false}
          />
        </mesh>
      ))}

      <group ref={flameRef} position={[ex, ey, 0]} visible={false}>
        {[ez, -ez].map((z, i) => (
          <mesh key={`flame-${i}`} position={[-0.18, 0, z]} rotation={[0, 0, Math.PI / 2]}>
            <coneGeometry args={[0.07, 0.45, 12, 1, true]} />
            <meshBasicMaterial color={color} transparent opacity={0.75} toneMapped={false} side={2} />
          </mesh>
        ))}
        <mesh position={[-0.1, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <coneGeometry args={[0.05, 0.22, 10, 1, true]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.9} toneMapped={false} side={2} />
        </mesh>
      </group>
    </>
  )
}
