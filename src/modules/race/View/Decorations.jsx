/* eslint-disable react-hooks/purity */
import React from 'react'
import { Sky } from '@react-three/drei'
import * as THREE from 'three'
import { LANE_WIDTH } from '../../../boot/constants/index'
import { TRACK_LENGTH } from './TrackMesh'
import Tree from './Tree'

// Matériaux de base essentiels
const mats = {
  grass: new THREE.MeshStandardMaterial({ color: '#166534', roughness: 1, flatShading: true }),
  arch: new THREE.MeshStandardMaterial({ color: '#f1f5f9', roughness: 0.5, flatShading: true }),
}

const Decorations = ({ numRacers }) => {
  const laneW = LANE_WIDTH * Math.max(numRacers, 2)

  return (
    <group>
      {/* 1. ENVIRONNEMENT DE BASE */}
      <Sky 
        sunPosition={[80, 25, 80]} 
        turbidity={7} 
        rayleigh={0.4} 
      />

      {/* 2. LE SOL (Herbe) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, TRACK_LENGTH / 2]}>
        <planeGeometry args={[500, TRACK_LENGTH + 100]} />
        <primitive object={mats.grass} attach="material" />
      </mesh>

      {/* 3. ARCHE D'ARRIVÉE (Repère visuel) */}
      <group position={[0, 0, TRACK_LENGTH + 1]}>
        {/* Poteaux Gauche/Droite */}
        {[-1, 1].map(side => (
          <mesh key={side} position={[side * (laneW / 2 + 1), 4.5, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.4, 9, 6]} />
            <primitive object={mats.arch} attach="material" />
          </mesh>
        ))}
        {/* Barre transversale */}
        <mesh position={[0, 9.2, 0]} castShadow>
          <boxGeometry args={[laneW + 3, 0.6, 0.6]} />
          <primitive object={mats.arch} attach="material" />
        </mesh>
      </group>

     
      {/* <Tree /> */}
      {/* ex: <Mountains /> */}
      
    </group>
  )
}

export default Decorations