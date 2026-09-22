/* eslint-disable react-hooks/purity */
import React, { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

const Tree = ({ position = [0, 0, 0], scale = 1, windOffset = 0 }) => {
  const trunkRef = useRef()
  const foliageRef = useRef()

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const sway = Math.sin(t * 0.8 + windOffset) * 0.012
    const swayZ = Math.cos(t * 0.6 + windOffset) * 0.008
    if (foliageRef.current) {
      foliageRef.current.rotation.z = sway
      foliageRef.current.rotation.x = swayZ
    }
  })

  // Trunk geometry — slightly tapered cylinder with manual vertices
  const trunkGeo = useMemo(() => {
    const geo = new THREE.CylinderGeometry(0.08, 0.14, 1.2, 6, 2)
    const pos = geo.attributes.position
    for (let i = 0; i < pos.count; i++) {
      pos.setX(i, pos.getX(i) + (Math.random() - 0.5) * 0.04)
      pos.setZ(i, pos.getZ(i) + (Math.random() - 0.5) * 0.04)
    }
    pos.needsUpdate = true
    geo.computeVertexNormals()
    return geo
  }, [])

  // Three stacked lowpoly cone layers
  const foliageLayers = useMemo(() => {
    const layers = []

    const configs = [
      { y: 0.0,  radiusBottom: 0.72, radiusTop: 0.08, height: 1.1, segs: 7 },
      { y: 0.65, radiusBottom: 0.55, radiusTop: 0.07, height: 0.95, segs: 6 },
      { y: 1.2,  radiusBottom: 0.38, radiusTop: 0.05, height: 0.8,  segs: 5 },
    ]

    configs.forEach((cfg, li) => {
      const geo = new THREE.ConeGeometry(cfg.radiusBottom, cfg.height, cfg.segs, 2)
      geo.parameters.radiusTop = cfg.radiusTop

      const pos = geo.attributes.position
      for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i)
        const noiseScale = 0.07 - (y / cfg.height) * 0.03
        pos.setX(i, pos.getX(i) + (Math.random() - 0.5) * noiseScale * 2)
        pos.setZ(i, pos.getZ(i) + (Math.random() - 0.5) * noiseScale * 2)
      }
      pos.needsUpdate = true
      geo.computeVertexNormals()
      layers.push({ geo, y: cfg.y, layer: li })
    })

    return layers
  }, [])

  const trunkMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#5C3D1E',
    roughness: 0.95,
    metalness: 0.0,
    flatShading: true,
  }), [])

  const foliageMats = useMemo(() => [
    new THREE.MeshStandardMaterial({ color: '#2D5A27', roughness: 0.85, flatShading: true }),
    new THREE.MeshStandardMaterial({ color: '#3A7034', roughness: 0.85, flatShading: true }),
    new THREE.MeshStandardMaterial({ color: '#4A8A3E', roughness: 0.85, flatShading: true }),
  ], [])

  return (
    <group position={position} scale={scale}>
      {/* Trunk */}
      <mesh
        ref={trunkRef}
        geometry={trunkGeo}
        material={trunkMat}
        position={[0, 0.6, 0]}
        castShadow
        receiveShadow
      />

      {/* Foliage layers — pivot at base so sway looks natural */}
      <group ref={foliageRef} position={[0, 1.2, 0]}>
        {foliageLayers.map(({ geo, y, layer }) => (
          <mesh
            key={layer}
            geometry={geo}
            material={foliageMats[layer]}
            position={[0, y, 0]}
            castShadow
            receiveShadow
          />
        ))}
      </group>
    </group>
  )
}

export default Tree