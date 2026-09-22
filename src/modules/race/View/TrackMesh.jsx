import React, { useMemo } from 'react'
import * as THREE from 'three'
import { LANE_WIDTH } from '../../../boot/constants/index'

const TRACK_LENGTH = 300

export const TRACK_CURVE = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 0, 75),
  new THREE.Vector3(0, 0, 150),
  new THREE.Vector3(0, 0, 225),
  new THREE.Vector3(0, 0, 300),
], false)

const TRACK_POINTS = TRACK_CURVE.getPoints(300)

// ─── Matériaux ──────────────────────────────────────────────────────────────────

const mat = {
  asphalt:    new THREE.MeshStandardMaterial({ color: '#161b28', roughness: 0.9 }),
  lane:       new THREE.MeshStandardMaterial({ color: '#ffffff', opacity: 0.2, transparent: true }),
  barrierRed: new THREE.MeshStandardMaterial({ color: '#dc2626', roughness: 0.6, flatShading: true }),
  barrierWht: new THREE.MeshStandardMaterial({ color: '#f1f5f9', roughness: 0.6, flatShading: true }),
  kerbRed:    new THREE.MeshStandardMaterial({ color: '#ef4444', roughness: 0.8, flatShading: true }),
  kerbWht:    new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.8, flatShading: true }),
}

// ─── Géométries partagées ───────────────────────────────────────────────────────

// Glissière béton Jersey : trapèze extrudé sur Z
const makeBarrierGeo = () => {
  const shape = new THREE.Shape()
  shape.moveTo(-0.2,  0.0)
  shape.lineTo(-0.25, 0.3)
  shape.lineTo(-0.15, 0.6)
  shape.lineTo( 0.15, 0.6)
  shape.lineTo( 0.25, 0.3)
  shape.lineTo( 0.2,  0.0)
  shape.closePath()
  return new THREE.ExtrudeGeometry(shape, {
    depth: 1.2,
    bevelEnabled: false,
  })
}
const BARRIER_GEO = makeBarrierGeo()

// Vibreur : boîte plate légèrement inclinée
const KERB_GEO = new THREE.BoxGeometry(0.6, 0.04, 1.2)

// ─── Composants instanciés ──────────────────────────────────────────────────────

// Vibreurs rouge/blanc sur les deux bords intérieurs de la piste
// Placés juste à l'intérieur des glissières, tous les 1.2 m
const Kerbs = ({ laneW }) => {
  const segLen = 1.2
  const count  = Math.ceil(TRACK_LENGTH / segLen)
  const halfW  = laneW / 2        // bord exact de l'asphalte
  const kerbX  = halfW + 0.3      // centre du vibreur (largeur 0.6)

  const matrices = useMemo(() => {
    const dummy  = new THREE.Object3D()
    const reds   = []
    const whts   = []

    for (let i = 0; i < count; i++) {
      const z     = i * segLen + segLen / 2
      const isRed = i % 2 === 0

      // Gauche
      dummy.position.set(-kerbX, 0.02, z)
      dummy.rotation.set(0, 0, 0)
      dummy.updateMatrix()
      ;(isRed ? reds : whts).push(dummy.matrix.clone())

      // Droite
      dummy.position.set(kerbX, 0.02, z)
      dummy.rotation.set(0, 0, 0)
      dummy.updateMatrix()
      ;(isRed ? reds : whts).push(dummy.matrix.clone())
    }
    return { reds, whts }
  }, [laneW, count, kerbX])

  const redMesh = useMemo(() => {
    const mesh = new THREE.InstancedMesh(KERB_GEO, mat.kerbRed, matrices.reds.length)
    matrices.reds.forEach((m, i) => mesh.setMatrixAt(i, m))
    mesh.instanceMatrix.needsUpdate = true
    mesh.receiveShadow = true
    return mesh
  }, [matrices])

  const whtMesh = useMemo(() => {
    const mesh = new THREE.InstancedMesh(KERB_GEO, mat.kerbWht, matrices.whts.length)
    matrices.whts.forEach((m, i) => mesh.setMatrixAt(i, m))
    mesh.instanceMatrix.needsUpdate = true
    mesh.receiveShadow = true
    return mesh
  }, [matrices])

  return (
    <>
      <primitive object={redMesh} />
      <primitive object={whtMesh} />
    </>
  )
}

// ─── TrackMesh ──────────────────────────────────────────────────────────────────

const TrackMesh = ({ numRacers }) => {
  const n     = Math.max(numRacers, 2)
  const laneW = LANE_WIDTH * n

  const lanePoints = useMemo(() => TRACK_POINTS.filter((_, i) => i % 14 === 0), [])

  const laneXPositions = useMemo(() =>
    Array.from({ length: n - 1 }, (_, idx) =>
      -((n - 1) * LANE_WIDTH) / 2 + idx * LANE_WIDTH
    ), [n])

  return (
    <group>
      {/* Asphalte */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, TRACK_LENGTH / 2]} receiveShadow>
        <planeGeometry args={[laneW, TRACK_LENGTH]} />
        <primitive object={mat.asphalt} attach="material" />
      </mesh>

      {/* Tirets de couloir */}
      {laneXPositions.map(x =>
        lanePoints.map((pt, i) => (
          <mesh key={`line-${x}-${i}`} position={[x + LANE_WIDTH / 2, 0.015, pt.z]}>
            <boxGeometry args={[0.07, 0.005, 2.0]} />
            <primitive object={mat.lane} attach="material" />
          </mesh>
        ))
      )}

      {/* Vibreurs */}
      <Kerbs laneW={laneW} />

    
    </group>
  )
}

export default TrackMesh
export { TRACK_LENGTH }