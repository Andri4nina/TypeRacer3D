import React from 'react'
import { Wheel, CarFx } from './CarParts'
import { useCarMaterials } from './carMaterials'

// Six carrosseries procédurales aux silhouettes franchement différentes.
// Convention : +X = avant, -X = arrière, Z = largeur, Y = hauteur.
// Chaque modèle place lui-même ses feux stop et ses sorties d'échappement.

// ─── Monoplace ────────────────────────────────────────────────────────────────
const F1Body = ({ color, fx }) => {
  const m = useCarMaterials(color)
  return (
    <>
      <mesh position={[0.7, 0.15, 0]} rotation={[0, 0, -0.05]} castShadow>
        <boxGeometry args={[1.2, 0.12, 0.35]} />{m.body}
      </mesh>
      <mesh position={[-0.1, 0.22, 0]} castShadow>
        <boxGeometry args={[0.8, 0.28, 0.55]} />{m.body}
      </mesh>
      <mesh position={[-0.3, 0.42, 0]}>
        <boxGeometry args={[0.3, 0.15, 0.2]} />{m.dark}
      </mesh>

      {[1, -1].map(side => (
        <group key={side} position={[-0.1, 0.15, 0.35 * side]}>
          <mesh rotation={[0, side * 0.1, 0]}><boxGeometry args={[0.7, 0.2, 0.25]} />{m.body}</mesh>
          <mesh position={[0.36, 0, 0]}><boxGeometry args={[0.02, 0.15, 0.2]} />{m.dark}</mesh>
        </group>
      ))}

      <group position={[1.2, 0.08, 0]}>
        <mesh><boxGeometry args={[0.2, 0.03, 1.1]} />{m.carbon}</mesh>
        {[0.45, -0.45].map((z, i) => (
          <mesh key={i} position={[0, 0.05, z]}><boxGeometry args={[0.18, 0.1, 0.02]} />{m.carbon}</mesh>
        ))}
      </group>

      <group position={[-1.1, 0.35, 0]}>
        {[0.15, -0.15].map((z, i) => (
          <mesh key={i} position={[0, -0.1, z]}><boxGeometry args={[0.05, 0.3, 0.02]} />{m.carbon}</mesh>
        ))}
        <mesh position={[0, 0.1, 0]}><boxGeometry args={[0.25, 0.04, 1.0]} />{m.carbon}</mesh>
        {[0.5, -0.5].map((z, i) => (
          <mesh key={i} position={[0, 0.05, z]}><boxGeometry args={[0.35, 0.25, 0.03]} />{m.carbon}</mesh>
        ))}
      </group>

      <Wheel position={[0.8, 0.2, 0.55]} radius={0.2} width={0.28} accent={color} />
      <Wheel position={[0.8, 0.2, -0.55]} radius={0.2} width={0.28} accent={color} />
      <Wheel position={[-0.8, 0.24, 0.6]} radius={0.24} width={0.35} accent={color} />
      <Wheel position={[-0.8, 0.24, -0.6]} radius={0.24} width={0.35} accent={color} />
      {fx}
    </>
  )
}

// ─── Muscle car : capot interminable, toit bas, train arrière large ──────────
const MuscleBody = ({ color, fx }) => {
  const m = useCarMaterials(color)
  return (
    <>
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[2.5, 0.32, 0.95]} />{m.body}
      </mesh>
      <mesh position={[0.75, 0.5, 0]} castShadow>
        <boxGeometry args={[1.0, 0.12, 0.9]} />{m.body}
      </mesh>
      <mesh position={[0.6, 0.6, 0]}>
        <boxGeometry args={[0.35, 0.1, 0.35]} />{m.dark}
      </mesh>
      <mesh position={[-0.35, 0.6, 0]} castShadow>
        <boxGeometry args={[1.1, 0.34, 0.82]} />{m.glass}
      </mesh>
      <mesh position={[-0.35, 0.79, 0]}>
        <boxGeometry args={[1.0, 0.06, 0.8]} />{m.body}
      </mesh>
      {/* Bande de capot */}
      <mesh position={[0.6, 0.57, 0]}>
        <boxGeometry args={[1.3, 0.01, 0.22]} />{m.carbon}
      </mesh>
      {/* Pare-chocs chromés */}
      <mesh position={[1.28, 0.3, 0]}><boxGeometry args={[0.1, 0.18, 0.92]} />{m.chrome}</mesh>
      <mesh position={[-1.28, 0.3, 0]}><boxGeometry args={[0.1, 0.18, 0.92]} />{m.chrome}</mesh>

      <Wheel position={[0.85, 0.28, 0.52]} radius={0.28} width={0.26} accent={color} />
      <Wheel position={[0.85, 0.28, -0.52]} radius={0.28} width={0.26} accent={color} />
      <Wheel position={[-0.85, 0.3, 0.55]} radius={0.3} width={0.38} accent={color} />
      <Wheel position={[-0.85, 0.3, -0.55]} radius={0.3} width={0.38} accent={color} />
      {fx}
    </>
  )
}

// ─── SUV : haut, anguleux, galerie de toit ───────────────────────────────────
const SuvBody = ({ color, fx }) => {
  const m = useCarMaterials(color)
  return (
    <>
      <mesh position={[0, 0.42, 0]} castShadow>
        <boxGeometry args={[2.3, 0.45, 1.0]} />{m.body}
      </mesh>
      <mesh position={[-0.15, 0.82, 0]} castShadow>
        <boxGeometry args={[1.5, 0.45, 0.94]} />{m.glass}
      </mesh>
      <mesh position={[-0.15, 1.06, 0]}>
        <boxGeometry args={[1.55, 0.06, 0.96]} />{m.body}
      </mesh>
      {/* Galerie */}
      {[0.35, -0.35].map((z, i) => (
        <mesh key={i} position={[-0.15, 1.14, z]}><boxGeometry args={[1.3, 0.05, 0.06]} />{m.carbon}</mesh>
      ))}
      {/* Pare-buffle */}
      <mesh position={[1.2, 0.38, 0]}><boxGeometry args={[0.12, 0.3, 0.98]} />{m.chrome}</mesh>
      <mesh position={[1.22, 0.62, 0]}><boxGeometry args={[0.06, 0.2, 0.5]} />{m.chrome}</mesh>
      {/* Bas de caisse */}
      {[0.52, -0.52].map((z, i) => (
        <mesh key={i} position={[0, 0.2, z]}><boxGeometry args={[1.9, 0.1, 0.06]} />{m.dark}</mesh>
      ))}
      {/* Phares */}
      {[0.35, -0.35].map((z, i) => (
        <mesh key={i} position={[1.15, 0.5, z]}>
          <boxGeometry args={[0.04, 0.12, 0.22]} />
          <meshStandardMaterial color="#fff7ed" emissive="#fff7ed" emissiveIntensity={3} toneMapped={false} />
        </mesh>
      ))}

      <Wheel position={[0.78, 0.36, 0.58]} radius={0.36} width={0.3} accent={color} />
      <Wheel position={[0.78, 0.36, -0.58]} radius={0.36} width={0.3} accent={color} />
      <Wheel position={[-0.82, 0.36, 0.58]} radius={0.36} width={0.3} accent={color} />
      <Wheel position={[-0.82, 0.36, -0.58]} radius={0.36} width={0.3} accent={color} />
      {fx}
    </>
  )
}

// ─── Kart : minuscule, châssis apparent ──────────────────────────────────────
const KartBody = ({ color, fx }) => {
  const m = useCarMaterials(color)
  return (
    <>
      <mesh position={[0, 0.14, 0]} castShadow>
        <boxGeometry args={[1.5, 0.08, 0.55]} />{m.body}
      </mesh>
      {/* Pontons */}
      {[0.42, -0.42].map((z, i) => (
        <mesh key={i} position={[0.05, 0.18, z]}><boxGeometry args={[0.7, 0.18, 0.18]} />{m.body}</mesh>
      ))}
      {/* Siège */}
      <mesh position={[-0.25, 0.32, 0]} rotation={[0, 0, 0.25]}>
        <boxGeometry args={[0.12, 0.38, 0.4]} />{m.dark}
      </mesh>
      <mesh position={[-0.05, 0.2, 0]}><boxGeometry args={[0.32, 0.12, 0.38]} />{m.dark}</mesh>
      {/* Volant */}
      <mesh position={[0.28, 0.34, 0]} rotation={[0, 0, 0.5]}>
        <torusGeometry args={[0.11, 0.025, 8, 16]} />{m.carbon}
      </mesh>
      {/* Bloc moteur latéral */}
      <mesh position={[-0.45, 0.24, 0.32]}><boxGeometry args={[0.35, 0.26, 0.2]} />{m.chrome}</mesh>
      {/* Museau */}
      <mesh position={[0.78, 0.14, 0]}><boxGeometry args={[0.28, 0.14, 0.6]} />{m.body}</mesh>

      <Wheel position={[0.55, 0.16, 0.42]} radius={0.16} width={0.18} accent={color} />
      <Wheel position={[0.55, 0.16, -0.42]} radius={0.16} width={0.18} accent={color} />
      <Wheel position={[-0.55, 0.2, 0.45]} radius={0.2} width={0.28} accent={color} />
      <Wheel position={[-0.55, 0.2, -0.45]} radius={0.2} width={0.28} accent={color} />
      {fx}
    </>
  )
}

// ─── Hypercar : coin de fromage, roues carénées, aileron géant ───────────────
const HyperBody = ({ color, fx }) => {
  const m = useCarMaterials(color)
  return (
    <>
      {/* Coin avant */}
      <mesh position={[0.75, 0.2, 0]} rotation={[0, 0, -0.07]} castShadow>
        <boxGeometry args={[1.2, 0.16, 0.9]} />{m.body}
      </mesh>
      <mesh position={[-0.25, 0.3, 0]} castShadow>
        <boxGeometry args={[1.5, 0.3, 1.0]} />{m.body}
      </mesh>
      {/* Bulle */}
      <mesh position={[-0.1, 0.52, 0]} castShadow>
        <boxGeometry args={[0.85, 0.22, 0.8]} />{m.glass}
      </mesh>
      {/* Ailes couvrant les roues */}
      {[0.55, -0.55].map((z, i) => (
        <mesh key={i} position={[0.6, 0.34, z]}><boxGeometry args={[0.7, 0.16, 0.22]} />{m.body}</mesh>
      ))}
      {/* Écopes latérales */}
      {[0.5, -0.5].map((z, i) => (
        <mesh key={i} position={[-0.5, 0.32, z]}><boxGeometry args={[0.5, 0.16, 0.1]} />{m.dark}</mesh>
      ))}
      {/* Aileron */}
      <group position={[-1.05, 0.62, 0]}>
        {[0.3, -0.3].map((z, i) => (
          <mesh key={i} position={[0.05, -0.16, z]}><boxGeometry args={[0.06, 0.34, 0.03]} />{m.carbon}</mesh>
        ))}
        <mesh><boxGeometry args={[0.3, 0.04, 1.15]} />{m.carbon}</mesh>
      </group>
      {/* Diffuseur */}
      <mesh position={[-1.2, 0.14, 0]}><boxGeometry args={[0.22, 0.12, 0.9]} />{m.carbon}</mesh>
      {/* Bandeau lumineux avant */}
      <mesh position={[1.3, 0.24, 0]}>
        <boxGeometry args={[0.04, 0.05, 0.75]} />
        <meshStandardMaterial color="#e0f2fe" emissive="#e0f2fe" emissiveIntensity={4} toneMapped={false} />
      </mesh>

      <Wheel position={[0.62, 0.24, 0.55]} radius={0.24} width={0.3} accent={color} />
      <Wheel position={[0.62, 0.24, -0.55]} radius={0.24} width={0.3} accent={color} />
      <Wheel position={[-0.7, 0.27, 0.57]} radius={0.27} width={0.38} accent={color} />
      <Wheel position={[-0.7, 0.27, -0.57]} radius={0.27} width={0.38} accent={color} />
      {fx}
    </>
  )
}

// ─── Pick-up : cabine + benne ouverte ────────────────────────────────────────
const PickupBody = ({ color, fx }) => {
  const m = useCarMaterials(color)
  return (
    <>
      <mesh position={[0, 0.38, 0]} castShadow>
        <boxGeometry args={[2.4, 0.3, 1.0]} />{m.body}
      </mesh>
      {/* Capot */}
      <mesh position={[0.85, 0.56, 0]} castShadow>
        <boxGeometry args={[0.75, 0.18, 0.96]} />{m.body}
      </mesh>
      {/* Cabine */}
      <mesh position={[0.15, 0.78, 0]} castShadow>
        <boxGeometry args={[0.85, 0.42, 0.92]} />{m.glass}
      </mesh>
      <mesh position={[0.15, 1.0, 0]}>
        <boxGeometry args={[0.9, 0.06, 0.94]} />{m.body}
      </mesh>
      {/* Benne : plancher + 3 parois */}
      <mesh position={[-0.75, 0.55, 0]}><boxGeometry args={[1.1, 0.04, 0.96]} />{m.dark}</mesh>
      {[0.46, -0.46].map((z, i) => (
        <mesh key={i} position={[-0.75, 0.68, z]}><boxGeometry args={[1.1, 0.26, 0.05]} />{m.body}</mesh>
      ))}
      <mesh position={[-1.28, 0.68, 0]}><boxGeometry args={[0.05, 0.26, 0.96]} />{m.body}</mesh>
      {/* Arceau */}
      <mesh position={[-0.28, 0.95, 0]}><boxGeometry args={[0.06, 0.34, 0.9]} />{m.chrome}</mesh>
      {/* Pare-chocs */}
      <mesh position={[1.26, 0.36, 0]}><boxGeometry args={[0.12, 0.22, 1.0]} />{m.chrome}</mesh>

      <Wheel position={[0.8, 0.34, 0.58]} radius={0.34} width={0.32} accent={color} />
      <Wheel position={[0.8, 0.34, -0.58]} radius={0.34} width={0.32} accent={color} />
      <Wheel position={[-0.85, 0.34, 0.58]} radius={0.34} width={0.32} accent={color} />
      <Wheel position={[-0.85, 0.34, -0.58]} radius={0.34} width={0.32} accent={color} />
      {fx}
    </>
  )
}

const BODIES = {
  f1:      { Body: F1Body,      fx: { exhaust: [-1.3, 0.14, 0.12], brake: [-1.25, 0.16, 0.1] } },
  muscle:  { Body: MuscleBody,  fx: { exhaust: [-1.35, 0.2, 0.25], brake: [-1.3, 0.34, 0.3], flameScale: 1.2 } },
  suv:     { Body: SuvBody,     fx: { exhaust: [-1.25, 0.24, 0.3], brake: [-1.2, 0.5, 0.38] } },
  kart:    { Body: KartBody,    fx: { exhaust: [-0.85, 0.24, 0.1], brake: [-0.8, 0.2, 0.18], flameScale: 0.7 } },
  hyper:   { Body: HyperBody,   fx: { exhaust: [-1.3, 0.18, 0.2], brake: [-1.22, 0.32, 0.34], flameScale: 1.3 } },
  pickup:  { Body: PickupBody,  fx: { exhaust: [-1.35, 0.26, 0.28], brake: [-1.3, 0.42, 0.4] } },
}

export const CAR_BODY_TYPES = Object.keys(BODIES)

// Point d'entrée unique : `type` choisit la carrosserie.
export const ProceduralCar = ({
  color = '#ef4444',
  type = 'f1',
  boost = 0,
  errorAt = 0,
  shockMs = 350,
}) => {
  const entry = BODIES[type] ?? BODIES.f1
  const { Body } = entry

  return (
    <group rotation={[0, -Math.PI / 2, 0]}>
      <Body
        color={color}
        fx={<CarFx color={color} boost={boost} errorAt={errorAt} shockMs={shockMs} {...entry.fx} />}
      />
    </group>
  )
}

export default ProceduralCar
