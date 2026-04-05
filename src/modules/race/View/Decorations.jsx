/* eslint-disable react-hooks/purity */
import React, { useMemo } from 'react'
import { Sky } from '@react-three/drei'
import * as THREE from 'three'
import { LANE_WIDTH } from '../../../boot/constants/index'
import { TRACK_LENGTH } from './TrackMesh'

const SIGN_COLORS = ['#dc2626','#2563eb','#16a34a','#d97706','#7c3aed','#0891b2']

// ── Matériaux partagés ─────────────────────────────────────────
const mats = {
  trunk:       new THREE.MeshStandardMaterial({ color: '#7c4b2a', roughness: 0.95, flatShading: true }),
  pine1:       new THREE.MeshStandardMaterial({ color: '#1a5c32', roughness: 0.9,  flatShading: true }),
  pine2:       new THREE.MeshStandardMaterial({ color: '#1e7a3e', roughness: 0.9,  flatShading: true }),
  pine3:       new THREE.MeshStandardMaterial({ color: '#166534', roughness: 0.9,  flatShading: true }),
  mountain:    new THREE.MeshStandardMaterial({ color: '#4b5563', roughness: 1,    flatShading: true }),
  mountainSnow:new THREE.MeshStandardMaterial({ color: '#e2e8f0', roughness: 0.8,  flatShading: true }),
  rock:        new THREE.MeshStandardMaterial({ color: '#64748b', roughness: 1,    flatShading: true }),
  standBody:   new THREE.MeshStandardMaterial({ color: '#cbd5e1', roughness: 0.8,  flatShading: true }),
  standRoof:   new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.6, metalness: 0.3, flatShading: true }),
  seatRed:     new THREE.MeshStandardMaterial({ color: '#b91c1c', roughness: 0.7,  flatShading: true }),
  seatBlue:    new THREE.MeshStandardMaterial({ color: '#1d4ed8', roughness: 0.7,  flatShading: true }),
  seatYellow:  new THREE.MeshStandardMaterial({ color: '#d97706', roughness: 0.7,  flatShading: true }),
  concrete:    new THREE.MeshStandardMaterial({ color: '#94a3b8', roughness: 0.9,  flatShading: true }),
  metal:       new THREE.MeshStandardMaterial({ color: '#64748b', metalness: 0.7, roughness: 0.3, flatShading: true }),
  signPole:    new THREE.MeshStandardMaterial({ color: '#475569', metalness: 0.6, flatShading: true }),
  lampGlow:    new THREE.MeshStandardMaterial({ color: '#fffbeb', emissive: '#fffbeb', emissiveIntensity: 1.8 }),
  tireBlack:   new THREE.MeshStandardMaterial({ color: '#1c1917', roughness: 0.95, flatShading: true }),
  archWhite:   new THREE.MeshStandardMaterial({ color: '#f1f5f9', roughness: 0.5,  flatShading: true }),
  flagWhite:   new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.6,  flatShading: true }),
  flagBlack:   new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.6,  flatShading: true }),
  grass:       new THREE.MeshStandardMaterial({ color: '#166534', roughness: 1,    flatShading: true }),
}

// ── Géométries réutilisables ───────────────────────────────────
const geos = {
  trunk:    new THREE.CylinderGeometry(0.15, 0.25, 1.8, 5),
  cone1:    new THREE.ConeGeometry(1.3, 3.0, 6),
  cone2:    new THREE.ConeGeometry(1.0, 2.2, 6),
  cone3:    new THREE.ConeGeometry(0.7, 1.6, 6),
  torus:    new THREE.TorusGeometry(0.38, 0.15, 5, 8),
  lampStem: new THREE.CylinderGeometry(0.06, 0.11, 8, 5),
  lampBulb: new THREE.SphereGeometry(0.17, 5, 4),
  lampArm:  new THREE.BoxGeometry(1.0, 0.09, 0.1),
}

// ── Arbre Low-Poly ─────────────────────────────────────────────
const Tree = ({ position, scale = 1 }) => (
  <group position={position} scale={scale}>
    <mesh geometry={geos.trunk} material={mats.trunk} position={[0, 0.9, 0]} castShadow />
    <mesh geometry={geos.cone1} material={mats.pine1} position={[0, 3.3, 0]} castShadow />
    <mesh geometry={geos.cone2} material={mats.pine2} position={[0, 4.6, 0]} castShadow />
    <mesh geometry={geos.cone3} material={mats.pine3} position={[0, 5.6, 0]} castShadow />
  </group>
)

// ── Montagne Low-Poly ──────────────────────────────────────────
const Mountain = ({ position, height, radius, snowLine = 0.72 }) => (
  <group position={position}>
    <mesh castShadow>
      <coneGeometry args={[radius, height, 7]} />
      <primitive object={mats.mountain} attach="material" />
    </mesh>
    {/* Calotte neigeuse */}
    <mesh position={[0, height * 0.5 - height * (1 - snowLine) * 0.5, 0]}>
      <coneGeometry args={[radius * (1 - snowLine) * 1.1, height * (1 - snowLine), 7]} />
      <primitive object={mats.mountainSnow} attach="material" />
    </mesh>
    {/* Rochers à la base */}
    {[0, 1.2, 2.4, 3.6].map((angle, i) => (
      <mesh key={i} position={[
        Math.cos(angle) * radius * 0.7,
        -height * 0.45,
        Math.sin(angle) * radius * 0.7
      ]}>
        <dodecahedronGeometry args={[radius * 0.12, 0]} />
        <primitive object={mats.rock} attach="material" />
      </mesh>
    ))}
  </group>
)

// ── Tribune Low-Poly ───────────────────────────────────────────
const Grandstand = ({ position, length = 20, side = 1 }) => {
  const seatColors = [mats.seatRed, mats.seatBlue, mats.seatYellow, mats.seatRed]
  return (
    <group position={position}>
      {/* Structure béton */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <boxGeometry args={[5, 3, length]} />
        <primitive object={mats.standBody} attach="material" />
      </mesh>
      {/* Gradins (4 rangées) */}
      {[0, 1, 2, 3].map(row => (
        <mesh key={row}
          position={[side * (0.8 - row * 0.9), 3.1 + row * 0.7, 0]}
          castShadow>
          <boxGeometry args={[1.6, 0.18, length - 0.5]} />
          <primitive object={seatColors[row]} attach="material" />
        </mesh>
      ))}
      {/* Toit */}
      <mesh position={[side * (-1.2), 6.0, 0]}>
        <boxGeometry args={[6.5, 0.22, length + 1]} />
        <primitive object={mats.standRoof} attach="material" />
      </mesh>
      {/* Colonnes */}
      {Array.from({ length: Math.floor(length / 8) + 1 }).map((_, i) => (
        <mesh key={i} position={[0, 1.5, -length/2 + 4 + i * 8]} castShadow>
          <cylinderGeometry args={[0.2, 0.25, 3, 5]} />
          <primitive object={mats.concrete} attach="material" />
        </mesh>
      ))}
      {/* Panneau pub sur toit */}
      <mesh position={[side * (-4.0), 5.8, 0]}>
        <boxGeometry args={[0.15, 1.8, length * 0.7]} />
        <meshStandardMaterial
          color={SIGN_COLORS[Math.abs(Math.floor(position[0])) % 6]}
          emissive={SIGN_COLORS[Math.abs(Math.floor(position[0])) % 6]}
          emissiveIntensity={0.3}
          flatShading={true}
        />
      </mesh>
    </group>
  )
}

// ── Lampadaire Low-Poly ────────────────────────────────────────
const Lamp = ({ position }) => (
  <group position={position}>
    <mesh geometry={geos.lampStem} material={mats.metal} position={[0, 4, 0]} castShadow />
    <mesh geometry={geos.lampArm}  material={mats.metal} position={[0.5, 8.0, 0]} />
    <mesh geometry={geos.lampBulb} material={mats.lampGlow} position={[1.0, 7.85, 0]} />
    <pointLight position={[1.0, 7.7, 0]} intensity={20} distance={24} color="#fff8e1" castShadow={false} />
  </group>
)

// ── Panneau publicitaire ───────────────────────────────────────
const SignBoard = ({ position, colorIdx }) => (
  <group position={position}>
    <mesh position={[0, 1.8, 0]} castShadow>
      <cylinderGeometry args={[0.09, 0.13, 3.6, 5]} />
      <primitive object={mats.signPole} attach="material" />
    </mesh>
    <mesh position={[0, 4.0, 0]} castShadow>
      <boxGeometry args={[0.14, 1.6, 5.5]} />
      <meshStandardMaterial
        color={SIGN_COLORS[colorIdx % 6]}
        emissive={SIGN_COLORS[colorIdx % 6]}
        emissiveIntensity={0.3}
        roughness={0.4}
        flatShading={true}
      />
    </mesh>
  </group>
)

// ── Arc d'arrivée Low-Poly ─────────────────────────────────────
const FinishArch = ({ laneW }) => (
  <group position={[0, 0, TRACK_LENGTH + 1]}>
    {[-1, 1].map(side => (
      <mesh key={side} position={[side * (laneW/2 + 1), 4.5, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.45, 9, 6]} />
        <primitive object={mats.archWhite} attach="material" />
      </mesh>
    ))}
    <mesh position={[0, 9.2, 0]} castShadow>
      <boxGeometry args={[laneW + 2.8, 0.55, 0.6]} />
      <primitive object={mats.archWhite} attach="material" />
    </mesh>
    {/* Damier sur l'arc */}
    {Array.from({ length: 10 }).map((_, i) => (
      <mesh key={i} position={[-laneW/2 - 0.8 + i * ((laneW + 2.4) / 10), 9.55, 0]}>
        <boxGeometry args={[(laneW + 2.4) / 10 - 0.04, 0.5, 0.62]} />
        <primitive object={i % 2 === 0 ? mats.flagWhite : mats.flagBlack} attach="material" />
      </mesh>
    ))}
  </group>
)

// ── Décorations principales ────────────────────────────────────
const Decorations = ({ numRacers }) => {
  const laneW = LANE_WIDTH * Math.max(numRacers, 2)

  // Arbres générés de façon stable (sans Math.random pour éviter les re-renders)
  const trees = useMemo(() => {
    const list = []
    const seed = (n) => ((n * 2654435761) >>> 0) / 0xFFFFFFFF
    let idx = 0
    for (let z = 8; z < TRACK_LENGTH; z += 16) {
      for (const side of [-1, 1]) {
        const xBase = side * (laneW / 2 + 8)
        list.push({
          x: xBase + (seed(idx++) - 0.5) * 5,
          z: z + (seed(idx++) - 0.5) * 7,
          scale: 0.65 + seed(idx++) * 0.7,
        })
        list.push({
          x: xBase + side * (10 + seed(idx++) * 7),
          z: z + 8 + (seed(idx++) - 0.5) * 5,
          scale: 0.55 + seed(idx++) * 0.55,
        })
      }
    }
    return list
  }, [laneW])

  const standPositions = [35, 95, 165, 235]
  const lampPositions  = [12, 42, 75, 108, 142, 175, 210, 248, 282]
  const signPositions  = [18, 55, 105, 155, 205, 265]

  return (
    <group>

      {/* ── Ciel réaliste ── */}
      <Sky
        sunPosition={[80, 25, 80]}
        turbidity={7}
        rayleigh={0.4}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
      />

      {/* ── Montagnes lointaines ── */}
      <Mountain position={[-160, 13, 80]}  height={38} radius={60} snowLine={0.68} />
      <Mountain position={[170,  10, 160]} height={28} radius={48} snowLine={0.70} />
      <Mountain position={[-140, 8,  240]} height={22} radius={40} snowLine={0.74} />
      <Mountain position={[155,  6,  40]}  height={18} radius={35} snowLine={0.78} />
      <Mountain position={[-180, 12, 150]} height={32} radius={55} snowLine={0.65} />

      {/* ── Arbres low-poly ── */}
      {trees.map((t, i) => (
        <Tree key={i} position={[t.x, 0, t.z]} scale={t.scale} />
      ))}

      {/* ── Tribunes ── */}
      {standPositions.map(z => (
        <React.Fragment key={z}>
          <Grandstand position={[-(laneW/2 + 14), 0, z]} length={22} side={1}  />
          <Grandstand position={[ laneW/2 + 14,  0, z]} length={22} side={-1} />
        </React.Fragment>
      ))}

      {/* ── Lampadaires (côté droit) ── */}
      {lampPositions.map((z, i) => (
        <Lamp key={`lr-${i}`} position={[laneW/2 + 2.2, 0, z]} />
      ))}
      {/* Lampadaires côté gauche (décalés) */}
      {lampPositions.filter((_, i) => i % 2 === 0).map((z, i) => (
        <Lamp key={`ll-${i}`} position={[-(laneW/2 + 2.2), 0, z + 20]} />
      ))}

      {/* ── Panneaux publicitaires ── */}
      {signPositions.map((z, i) => (
        <SignBoard key={i} position={[-(laneW/2 + 2.4), 0, z]} colorIdx={i} />
      ))}

      {/* ── Barrières de pneus low-poly ── */}
      {Array.from({ length: 28 }).map((_, i) => {
        const z = 5 + i * 10.5
        return [-(laneW/2 + 0.95), laneW/2 + 0.95].map((x, j) => (
          <group key={`tire-${i}-${j}`} position={[x, 0, z]}>
            <mesh geometry={geos.torus} material={mats.tireBlack} position={[0, 0.32, 0]} castShadow />
            <mesh geometry={geos.torus} material={mats.tireBlack} position={[0, 0.82, 0]} castShadow />
          </group>
        ))
      })}

      {/* ── Arc d'arrivée ── */}
      <FinishArch laneW={laneW} />

      {/* ── Portique de départ ── */}
      <group position={[0, 0, -3]}>
        {[-1, 1].map(side => (
          <mesh key={side} position={[side * (laneW/2 + 1), 3.5, 0]} castShadow>
            <cylinderGeometry args={[0.28, 0.35, 7, 6]} />
            <primitive object={mats.archWhite} attach="material" />
          </mesh>
        ))}
        <mesh position={[0, 7.2, 0]}>
          <boxGeometry args={[laneW + 2.5, 0.45, 0.5]} />
          <primitive object={mats.archWhite} attach="material" />
        </mesh>
        {/* Feux de départ (5 points rouges) */}
        {[-2, -1, 0, 1, 2].map(offset => (
          <mesh key={offset} position={[offset * 0.6, 6.7, 0]}>
            <sphereGeometry args={[0.14, 5, 4]} />
            <meshStandardMaterial color="#dc2626" emissive="#dc2626" emissiveIntensity={3} />
          </mesh>
        ))}
      </group>

      {/* ── Sol herbe (plan de fond, complète TrackMesh) ── */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -0.12, TRACK_LENGTH/2]}>
        <planeGeometry args={[500, TRACK_LENGTH + 100]} />
        <primitive object={mats.grass} attach="material" />
      </mesh>

    </group>
  )
}

export default Decorations