import React, { useMemo } from 'react'
import * as THREE from 'three'
import { LANE_WIDTH } from '../../../boot/constants/index'

const TRACK_LENGTH = 300
const buildTrackCurve = () => new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 0,   0),
  new THREE.Vector3(0, 0,  75),
  new THREE.Vector3(0, 0, 150),
  new THREE.Vector3(0, 0, 225),
  new THREE.Vector3(0, 0, 300),
], false)

export const TRACK_CURVE  = buildTrackCurve()
export const TRACK_POINTS = TRACK_CURVE.getPoints(300)
export { TRACK_LENGTH }

// ── Matériaux ──────────────────────────────────────────────────
const mat = {
  asphalt:     new THREE.MeshStandardMaterial({ color: '#161b28', roughness: 0.94, metalness: 0.03 }),
  asphaltWorn: new THREE.MeshStandardMaterial({ color: '#1e2438', roughness: 0.96 }),
  dirt:        new THREE.MeshStandardMaterial({ color: '#3d2d1e', roughness: 1 }),
  grass:       new THREE.MeshStandardMaterial({ color: '#166534', roughness: 1 }),
  grassDark:   new THREE.MeshStandardMaterial({ color: '#14532d', roughness: 1 }),
  grassLight:  new THREE.MeshStandardMaterial({ color: '#15803d', roughness: 1 }),
  runoff:      new THREE.MeshStandardMaterial({ color: '#2a3d1c', roughness: 1 }),
  kerb1:       new THREE.MeshStandardMaterial({ color: '#dc2626' }),
  kerb2:       new THREE.MeshStandardMaterial({ color: '#f1f5f9' }),
  kerb3:       new THREE.MeshStandardMaterial({ color: '#f59e0b' }),
  lane:        new THREE.MeshStandardMaterial({ color: '#ffffff', opacity: 0.15, transparent: true }),
  whiteLine:   new THREE.MeshStandardMaterial({ color: '#ffffff', opacity: 0.9,  transparent: true }),
  yellowLine:  new THREE.MeshStandardMaterial({ color: '#fbbf24', opacity: 0.8,  transparent: true }),
  checkW:      new THREE.MeshStandardMaterial({ color: '#ffffff', opacity: 0.92, transparent: true }),
  checkB:      new THREE.MeshStandardMaterial({ color: '#080808', opacity: 0.92, transparent: true }),
  barrier:     new THREE.MeshStandardMaterial({ color: '#e2e8f0', roughness: 0.3, metalness: 0.6 }),
  barrierRed:  new THREE.MeshStandardMaterial({ color: '#ef4444', roughness: 0.4 }),
  pole:        new THREE.MeshStandardMaterial({ color: '#94a3b8', metalness: 0.9, roughness: 0.1 }),
  light:       new THREE.MeshStandardMaterial({ color: '#fef9c3', emissive: '#fef08a', emissiveIntensity: 2 }),
  pitWall:     new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.8 }),
  pitLine:     new THREE.MeshStandardMaterial({ color: '#f59e0b', opacity: 0.9, transparent: true }),
  tireStack:   new THREE.MeshStandardMaterial({ color: '#1c1917', roughness: 0.9 }),
  tireStripe:  new THREE.MeshStandardMaterial({ color: '#84cc16', roughness: 0.8 }),
  stand:       new THREE.MeshStandardMaterial({ color: '#1e3a5f', roughness: 0.8 }),
  standRoof:   new THREE.MeshStandardMaterial({ color: '#0f2744', roughness: 0.7, metalness: 0.2 }),
  concrete:    new THREE.MeshStandardMaterial({ color: '#475569', roughness: 0.9 }),
  marshal:     new THREE.MeshStandardMaterial({ color: '#f97316', roughness: 0.8 }),
}

// ── Géométries réutilisables ───────────────────────────────────
const geo = {
  laneLine:   new THREE.BoxGeometry(0.07, 0.008, 2.0),
  kerbSeg:    new THREE.BoxGeometry(0.5, 0.03, 1.4),
  rumble:     new THREE.BoxGeometry(0.65, 0.018, 0.9),
  barrierSeg: new THREE.BoxGeometry(0.28, 0.55, 1.2),
  tireStack:  new THREE.CylinderGeometry(0.22, 0.22, 0.5, 12),
  poleShaft:  new THREE.CylinderGeometry(0.04, 0.05, 5, 8),
  lightBulb:  new THREE.SphereGeometry(0.18, 8, 8),
  lightArm:   new THREE.BoxGeometry(0.06, 0.06, 1.2),
}

// ── Poteau d'éclairage ─────────────────────────────────────────
const LightPole = ({ position }) => (
  <group position={position}>
    <mesh geometry={geo.poleShaft} material={mat.pole} position={[0, 2.5, 0]} castShadow />
    <mesh geometry={geo.lightArm}  material={mat.pole} position={[0.6, 5.0, 0]} />
    <mesh geometry={geo.lightBulb} material={mat.light} position={[1.1, 5.0, 0]} />
    <pointLight position={[1.1, 5.0, 0]} intensity={18} distance={22} color="#fff8e1" castShadow={false} />
  </group>
)

// ── Barrière TecPro ────────────────────────────────────────────
const BarrierRow = ({ x, zStart, zEnd, step = 1.3 }) => {
  const count = Math.floor((zEnd - zStart) / step)
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <mesh key={i} geometry={geo.barrierSeg}
          material={Math.floor(i / 3) % 2 === 0 ? mat.barrierRed : mat.barrier}
          position={[x, 0.275, zStart + i * step]} castShadow />
      ))}
    </>
  )
}

// ── Pile de pneus ──────────────────────────────────────────────
const TireStack = ({ position }) => (
  <group position={position}>
    {[0, 0.5, 1.0].map((y, i) => (
      <group key={i}>
        <mesh geometry={geo.tireStack} material={mat.tireStack} position={[0, y, 0]} castShadow />
        <mesh position={[0, y, 0]}>
          <torusGeometry args={[0.22, 0.04, 8, 16]} />
          <primitive object={mat.tireStripe} attach="material" />
        </mesh>
      </group>
    ))}
  </group>
)

// ── Tribune ────────────────────────────────────────────────────
const Grandstand = ({ x, zCenter, length = 60 }) => {
  const side = x > 0 ? 1 : -1
  return (
    <group>
      <mesh position={[x, 2, zCenter]} castShadow>
        <boxGeometry args={[6, 4, length]} />
        <primitive object={mat.stand} attach="material" />
      </mesh>
      <mesh position={[x - side * 0.5, 4.3, zCenter]}>
        <boxGeometry args={[7, 0.25, length + 2]} />
        <primitive object={mat.standRoof} attach="material" />
      </mesh>
      {[0, 1, 2].map(step => (
        <mesh key={step} position={[x + side * (1.2 - step * 0.8), 0.3 + step * 0.8, zCenter]}>
          <boxGeometry args={[1.4, 0.15, length - 2]} />
          <primitive object={mat.concrete} attach="material" />
        </mesh>
      ))}
      {Array.from({ length: Math.floor(length / 10) }).map((_, i) => (
        <mesh key={i} position={[x, 2, zCenter - length/2 + 5 + i * 10]} castShadow>
          <boxGeometry args={[0.3, 4, 0.3]} />
          <primitive object={mat.concrete} attach="material" />
        </mesh>
      ))}
    </group>
  )
}

// ── Poste commissaire ──────────────────────────────────────────
const MarshalPost = ({ position }) => (
  <group position={position}>
    <mesh position={[0, 0.5, 0]}>
      <boxGeometry args={[1.2, 1, 0.8]} />
      <primitive object={mat.marshal} attach="material" />
    </mesh>
    <mesh position={[0, 1.1, 0]}>
      <boxGeometry args={[1.4, 0.1, 1]} />
      <primitive object={mat.concrete} attach="material" />
    </mesh>
  </group>
)

// ── TrackMesh principal ────────────────────────────────────────
const TrackMesh = ({ numRacers }) => {
  const n     = Math.max(numRacers, 2)
  const laneW = LANE_WIDTH * n
  const cols  = 12
  const pitX  = laneW / 2 + 6

  const lanePoints   = useMemo(() => TRACK_POINTS.filter((_, i) => i % 14 === 0), [])
  const kerbPoints   = useMemo(() => TRACK_POINTS.filter((_, i) => i %  6 === 0), [])
  const rumblePoints = useMemo(() => TRACK_POINTS.filter((_, i) => i %  9 === 0), [])
  const polePoints   = useMemo(() => TRACK_POINTS.filter((_, i) => i % 30 === 0), [])
  const marshalPts   = useMemo(() => TRACK_POINTS.filter((_, i) => i % 50 === 0), [])

  const laneXPositions = useMemo(() =>
    Array.from({ length: n - 1 }, (_, idx) =>
      -((n - 1) * LANE_WIDTH) / 2 + idx * LANE_WIDTH
    ), [n])

  return (
    <group>

      {/* Herbe lointaine */}
      {[-1, 1].map(side => (
        <mesh key={`gfar-${side}`} rotation={[-Math.PI/2, 0, 0]}
          position={[side * (laneW/2 + 100), -0.1, TRACK_LENGTH/2]}>
          <planeGeometry args={[140, TRACK_LENGTH + 80]} />
          <primitive object={mat.grassDark} attach="material" />
        </mesh>
      ))}

      {/* Herbe proche */}
      {[-1, 1].map(side => (
        <mesh key={`g-${side}`} rotation={[-Math.PI/2, 0, 0]}
          position={[side * (laneW/2 + 25), -0.04, TRACK_LENGTH/2]}>
          <planeGeometry args={[36, TRACK_LENGTH + 20]} />
          <primitive object={mat.grass} attach="material" />
        </mesh>
      ))}

      {/* Bandes herbe claire alternées */}
      {[-1, 1].map(side =>
        Array.from({ length: 10 }).map((_, i) => (
          <mesh key={`gl-${side}-${i}`} rotation={[-Math.PI/2, 0, 0]}
            position={[side * (laneW/2 + 18), -0.035, 15 + i * 30]}>
            <planeGeometry args={[4, 28]} />
            <primitive object={mat.grassLight} attach="material" />
          </mesh>
        ))
      )}

      {/* Zone de dégagement */}
      {[-1, 1].map(side => (
        <mesh key={`ro-${side}`} rotation={[-Math.PI/2, 0, 0]}
          position={[side * (laneW/2 + 5.5), -0.02, TRACK_LENGTH/2]}>
          <planeGeometry args={[7, TRACK_LENGTH]} />
          <primitive object={mat.runoff} attach="material" />
        </mesh>
      ))}

      {/* Sous-couche */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -0.08, TRACK_LENGTH/2]}>
        <planeGeometry args={[laneW + 8, TRACK_LENGTH + 6]} />
        <primitive object={mat.dirt} attach="material" />
      </mesh>

      {/* Asphalte principal */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0, TRACK_LENGTH/2]} receiveShadow>
        <planeGeometry args={[laneW, TRACK_LENGTH]} />
        <primitive object={mat.asphalt} attach="material" />
      </mesh>

      {/* Marques d'usure par couloir */}
      {laneXPositions.map((x, li) => (
        <mesh key={`wear-${li}`} rotation={[-Math.PI/2, 0, 0]}
          position={[x, 0.002, TRACK_LENGTH/2]}>
          <planeGeometry args={[LANE_WIDTH * 0.6, TRACK_LENGTH]} />
          <primitive object={mat.asphaltWorn} attach="material" />
        </mesh>
      ))}

      {/* Ligne centrale jaune */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.012, TRACK_LENGTH/2]}>
        <planeGeometry args={[0.1, TRACK_LENGTH]} />
        <primitive object={mat.yellowLine} attach="material" />
      </mesh>

      {/* Tirets de couloirs */}
      {laneXPositions.map(x =>
        lanePoints.map((pt, i) => (
          <mesh key={`ld-${x}-${i}`} position={[x, 0.015, pt.z]}
            geometry={geo.laneLine} material={mat.lane} />
        ))
      )}

      {/* Kerbs gauche */}
      {kerbPoints.map((pt, i) => (
        <mesh key={`kl-${i}`} position={[-(laneW/2 + 0.26), 0.015, pt.z]}
          geometry={geo.kerbSeg} material={i % 2 === 0 ? mat.kerb1 : mat.kerb2} />
      ))}

      {/* Kerbs droite */}
      {kerbPoints.map((pt, i) => (
        <mesh key={`kr-${i}`} position={[laneW/2 + 0.26, 0.015, pt.z]}
          geometry={geo.kerbSeg} material={i % 2 === 0 ? mat.kerb2 : mat.kerb1} />
      ))}

      {/* Rumble strips */}
      {rumblePoints.map((pt, i) => (
        <mesh key={`rl-${i}`} position={[-(laneW/2 + 0.85), 0.01, pt.z]}
          geometry={geo.rumble} material={i % 2 === 0 ? mat.kerb3 : mat.kerb2} />
      ))}
      {rumblePoints.map((pt, i) => (
        <mesh key={`rr-${i}`} position={[laneW/2 + 0.85, 0.01, pt.z]}
          geometry={geo.rumble} material={i % 2 === 0 ? mat.kerb2 : mat.kerb3} />
      ))}

      {/* Barrières TecPro */}
      <BarrierRow x={-(laneW/2 + 2.1)} zStart={5} zEnd={TRACK_LENGTH - 5} />
      <BarrierRow x={laneW/2 + 2.1}    zStart={5} zEnd={TRACK_LENGTH - 5} />

      {/* Piles de pneus */}
      {[20, TRACK_LENGTH/2, TRACK_LENGTH - 20].map(z => (
        <React.Fragment key={z}>
          <TireStack position={[-(laneW/2 + 2.8), 0, z]} />
          <TireStack position={[laneW/2 + 2.8,    0, z]} />
        </React.Fragment>
      ))}

      {/* Postes commissaires */}
      {marshalPts.map((pt, i) => (
        <MarshalPost key={`mp-${i}`} position={[-(laneW/2 + 4.5), 0, pt.z]} />
      ))}

      {/* Poteaux éclairage droite */}
      {polePoints.map((pt, i) => (
        <LightPole key={`lpr-${i}`} position={[laneW/2 + 4, 0, pt.z]} />
      ))}
      {/* Poteaux éclairage gauche (1 sur 2) */}
      {polePoints.filter((_, i) => i % 2 === 0).map((pt, i) => (
        <LightPole key={`lpl-${i}`} position={[-(laneW/2 + 4), 0, pt.z]} />
      ))}

      {/* Pit lane */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[pitX, 0.005, TRACK_LENGTH/2]}>
        <planeGeometry args={[4, TRACK_LENGTH * 0.6]} />
        <primitive object={mat.asphaltWorn} attach="material" />
      </mesh>
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[pitX - 1.8, 0.014, TRACK_LENGTH/2]}>
        <planeGeometry args={[0.08, TRACK_LENGTH * 0.6]} />
        <primitive object={mat.pitLine} attach="material" />
      </mesh>
      <mesh position={[pitX + 2.2, 0.5, TRACK_LENGTH/2]} castShadow>
        <boxGeometry args={[0.3, 1, TRACK_LENGTH * 0.6]} />
        <primitive object={mat.pitWall} attach="material" />
      </mesh>

      {/* Tribunes */}
      <Grandstand x={-(laneW/2 + 15)} zCenter={80}  length={55} />
      <Grandstand x={-(laneW/2 + 15)} zCenter={220} length={55} />
      <Grandstand x={laneW/2 + 15}    zCenter={150} length={70} />

      {/* Damier départ */}
      {Array.from({ length: cols }).map((_, col) =>
        [0, 1].map(row => (
          <mesh key={`sd-${col}-${row}`} rotation={[-Math.PI/2, 0, 0]}
            position={[-laneW/2 + col*(laneW/cols) + laneW/(cols*2), 0.022, row * 0.58]}>
            <planeGeometry args={[laneW/cols - 0.05, 0.54]} />
            <primitive object={(col+row)%2===0 ? mat.checkW : mat.checkB} attach="material" />
          </mesh>
        ))
      )}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.022, 1.6]}>
        <planeGeometry args={[laneW, 0.15]} />
        <primitive object={mat.whiteLine} attach="material" />
      </mesh>

      {/* Damier arrivée */}
      {Array.from({ length: cols }).map((_, col) =>
        [0, 1].map(row => (
          <mesh key={`fd-${col}-${row}`} rotation={[-Math.PI/2, 0, 0]}
            position={[-laneW/2 + col*(laneW/cols) + laneW/(cols*2), 0.022, TRACK_LENGTH - 1.2 + row * 0.58]}>
            <planeGeometry args={[laneW/cols - 0.05, 0.54]} />
            <primitive object={(col+row)%2===0 ? mat.checkW : mat.checkB} attach="material" />
          </mesh>
        ))
      )}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.022, TRACK_LENGTH - 0.2]}>
        <planeGeometry args={[laneW, 0.15]} />
        <primitive object={mat.whiteLine} attach="material" />
      </mesh>

    </group>
  )
}

export default TrackMesh