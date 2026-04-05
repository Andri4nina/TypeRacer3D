import React, { useRef, Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { CAR_MODELS } from '../../../boot/constants/index'
import { ProceduralCar } from '../../../shared/components/ProceduralCar'
import GlbCarMesh from './GlbCarMesh'
import { TRACK_CURVE } from './TrackMesh'

const RaceCar = ({ progress, color, carId, laneOffset = 0, isPlayer = false, cameraRef }) => {
  const groupRef       = useRef()
  const visualProgress = useRef(progress)
  const carDef         = CAR_MODELS.find(c => c.id === carId) ?? CAR_MODELS[0]

  useFrame((_, delta) => {
    if (!groupRef.current) return

    // Interpolation fluide vers la vraie progression
    visualProgress.current = THREE.MathUtils.lerp(
      visualProgress.current,
      progress,
      delta * 2.5
    )

    const t   = Math.min(Math.max(visualProgress.current, 0), 0.9999)
    const pos = TRACK_CURVE.getPoint(t)

    groupRef.current.position.set(pos.x + laneOffset +1.3, pos.y + 0.15, pos.z)
    groupRef.current.rotation.set(0, Math.PI * 2, 0)

    // Caméra derrière le joueur (vue Mario Kart)
    if (isPlayer && cameraRef?.current) {
      const camTarget = new THREE.Vector3(
        groupRef.current.position.x,
        groupRef.current.position.y + 3,
        groupRef.current.position.z - 8
      )
      cameraRef.current.position.lerp(camTarget, 0.1)
      cameraRef.current.lookAt(
        groupRef.current.position.x,
        groupRef.current.position.y + 0.5,
        groupRef.current.position.z + 10
      )
    }
  })

  return (
    <group ref={groupRef}>
      <Suspense fallback={
        <mesh>
          <boxGeometry args={[1.6, 0.4, 0.6]} />
          <meshStandardMaterial color={color} />
        </mesh>
      }>
        {carDef.file
          ? <GlbCarMesh file={carDef.file} color={color} scale={carDef.scale} offsetY={carDef.offsetY} />
          : <ProceduralCar color={color} />
        }
      </Suspense>
    </group>
  )
}

export default RaceCar
