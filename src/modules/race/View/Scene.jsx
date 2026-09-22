import React, { useRef } from 'react'
import { PerspectiveCamera, Environment } from '@react-three/drei'
import { LANE_WIDTH } from '../../../boot/constants/index'
import TrackMesh from './TrackMesh'
import Decorations from './Decorations'
import RaceCar from './RaceCar'

const Scene = ({ racers, showLabels = true, cameraMode = 'chase' }) => {
  const cameraRef = useRef()

  return (
    <>
      {/* Pas d'OrbitControls ici : la caméra est pilotée par RaceCar (vue poursuite),
          les deux entraient en conflit à chaque frame. */}
      <PerspectiveCamera ref={cameraRef} makeDefault fov={65} near={0.1} far={600} />
    
      {/* Éclairage */}
      <ambientLight intensity={0.7} />
      <directionalLight
        position={[10, 30, 50]}
        intensity={1.4}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={400}
        shadow-camera-left={-80}
        shadow-camera-right={80}
        shadow-camera-top={80}
        shadow-camera-bottom={-80}
      />
      <directionalLight position={[-10, 10, -20]} intensity={0.4} />
      <Environment preset="sunset" />

      
      <TrackMesh numRacers={racers.length} />

      {/* Décors */}
      <Decorations numRacers={racers.length} />

      {/* Voitures */}
      {racers.map((racer, i) => (
        <RaceCar
          key={racer.id}
          progress={racer.progress}
          color={racer.color}
          carId={racer.carId}
          laneOffset={(i - (racers.length + .2) / 2) * LANE_WIDTH}
          isPlayer={racer.isPlayer}
          name={racer.name}
          wpm={racer.wpm ?? 0}
          showLabel={showLabels}
          cameraMode={cameraMode}
          boost={racer.boost ?? 0}
          errorAt={racer.errorAt ?? 0}
          cameraRef={racer.isPlayer ? cameraRef : null}
        />
      ))}
    </>
  )
}

export default Scene
