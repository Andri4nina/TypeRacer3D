import React, { useRef, Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles, Html } from '@react-three/drei'
import * as THREE from 'three'
import { CAR_MODELS } from '../../../boot/constants/index'
import { ProceduralCar } from '../../../shared/components/cars/CarModels'
import GlbCarMesh from './GlbCarMesh'
import { TRACK_CURVE } from './TrackMesh'

const BASE_FOV = 65
const FOV_BOOST = 12      // étirement max du champ de vision à plein combo
const SHOCK_MS = 350      // durée du à-coup après une faute

const RaceCar = ({
  progress,
  color,
  carId,
  name,
  wpm = 0,
  laneOffset = 0,
  isPlayer = false,
  boost = 0,
  errorAt = 0,
  showLabel = true,
  cameraMode = 'chase',
  cameraRef,
}) => {
  const groupRef       = useRef()
  const bodyRef        = useRef()
  const visualProgress = useRef(progress)
  const smoothBoost    = useRef(0)
  const carDef         = CAR_MODELS.find(c => c.id === carId) ?? CAR_MODELS[0]

  // Intensité du choc : 1 juste après la faute, 0 après SHOCK_MS
  const shockRef = useRef(0)

  useFrame((_, delta) => {
    if (!groupRef.current) return

    // Le boost monte vite et redescend doucement — c'est ce qui donne la sensation
    // d'élan qui retombe quand on casse sa série.
    smoothBoost.current = THREE.MathUtils.lerp(smoothBoost.current, boost, delta * 4)

    const sinceError = errorAt > 0 ? Date.now() - errorAt : Infinity
    shockRef.current = sinceError < SHOCK_MS
      ? 1 - sinceError / SHOCK_MS
      : 0
    const shock = shockRef.current

    // Interpolation fluide vers la vraie progression
    visualProgress.current = THREE.MathUtils.lerp(
      visualProgress.current,
      progress,
      delta * 2.5
    )

    const t   = Math.min(Math.max(visualProgress.current, 0), 0.9999)
    const pos = TRACK_CURVE.getPoint(t)

    // Petit dérapage latéral au moment de la faute
    const skid = shock * Math.sin(Date.now() * 0.05) * 0.18

    groupRef.current.position.set(
      pos.x + laneOffset + 1.3 + skid,
      pos.y + 0.15,
      pos.z
    )
    groupRef.current.rotation.set(0, Math.PI * 2, 0)

    // Plongeon de l'avant sur erreur, léger cabrage sous boost
    if (bodyRef.current) {
      bodyRef.current.rotation.z = THREE.MathUtils.lerp(
        bodyRef.current.rotation.z,
        -shock * 0.22 + smoothBoost.current * 0.05,
        delta * 12
      )
      bodyRef.current.position.y = -shock * 0.05
    }

    // Caméra pilotée par la voiture du joueur
    if (isPlayer && cameraRef?.current) {
      const cam = cameraRef.current
      const p = groupRef.current.position
      let camTarget
      let lookAt

      if (cameraMode === 'broadcast') {
        // Vue TV : caméra latérale légèrement en avant, comme une grue de bord
        // de piste qui accompagne le peloton.
        camTarget = new THREE.Vector3(p.x + 11, p.y + 4.5, p.z + 5)
        lookAt = new THREE.Vector3(p.x, p.y + 0.6, p.z + 1)
      } else if (cameraMode === 'hood') {
        // Vue capot : collée au véhicule, la plus nerveuse
        camTarget = new THREE.Vector3(p.x, p.y + 0.85, p.z + 1.1)
        lookAt = new THREE.Vector3(p.x, p.y + 0.7, p.z + 14)
      } else {
        // Chasse : recule avec la vitesse pour accentuer l'effet d'élan
        camTarget = new THREE.Vector3(p.x, p.y + 3, p.z - 8 - smoothBoost.current * 1.2)
        lookAt = new THREE.Vector3(p.x, p.y + 0.5, p.z + 10)
      }

      cam.position.lerp(camTarget, cameraMode === 'hood' ? 0.35 : 0.1)
      cam.lookAt(lookAt)

      const targetFov = BASE_FOV + smoothBoost.current * FOV_BOOST - shock * 5
      if (Math.abs(cam.fov - targetFov) > 0.01) {
        cam.fov = THREE.MathUtils.lerp(cam.fov, targetFov, delta * 6)
        cam.updateProjectionMatrix()
      }

      // Secousse d'écran : appliquée APRÈS le lerp pour ne pas polluer la
      // position cible, sinon la caméra dérive au lieu de vibrer.
      if (shock > 0) {
        cam.position.x += (Math.random() - 0.5) * shock * 0.4
        cam.position.y += (Math.random() - 0.5) * shock * 0.3
        cam.position.z += (Math.random() - 0.5) * shock * 0.2
      }
    }
  })

  return (
    <group ref={groupRef}>
      <group ref={bodyRef}>
        <Suspense fallback={
          <mesh>
            <boxGeometry args={[1.6, 0.4, 0.6]} />
            <meshStandardMaterial color={color} />
          </mesh>
        }>
          {carDef.file
            ? <GlbCarMesh file={carDef.file} color={color} scale={carDef.scale} offsetY={carDef.offsetY} />
            : <ProceduralCar color={color} type={carDef.body} boost={boost} errorAt={errorAt} shockMs={SHOCK_MS} />
          }
        </Suspense>
      </group>

      {/* Étiquette monde : pilote + WPM au-dessus du toit */}
      {showLabel && name && (
        <Html
          position={[0, 1.5, 0]}
          center
          distanceFactor={14}
          zIndexRange={[10, 0]}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          <div
            className="flex items-center gap-2 px-2 py-1 whitespace-nowrap font-mono border backdrop-blur-sm"
            style={{
              backgroundColor: 'rgba(2,6,23,0.75)',
              borderColor: color,
              boxShadow: isPlayer ? `0 0 12px ${color}` : 'none',
            }}
          >
            <span
              className="w-1.5 h-4 skew-x-[-15deg] shrink-0"
              style={{ backgroundColor: color }}
            />
            <span className="text-[11px] font-black uppercase tracking-wider text-white">
              {name}
            </span>
            <span className="text-[11px] font-black italic tabular-nums" style={{ color }}>
              {wpm}
            </span>
            <span className="text-[8px] uppercase text-slate-400">wpm</span>
          </div>
        </Html>
      )}

      {/* Traînée d'étincelles : n'apparaît qu'à partir de 2 mots enchaînés */}
      {boost > 0.25 && (
        <Sparkles
          count={Math.round(12 + boost * 28)}
          scale={[1.2, 0.5, 2.5]}
          position={[-1.6, 0.2, 0]}
          size={2 + boost * 4}
          speed={0.6 + boost}
          color={color}
          opacity={0.5 + boost * 0.5}
        />
      )}
    </group>
  )
}

export default RaceCar
