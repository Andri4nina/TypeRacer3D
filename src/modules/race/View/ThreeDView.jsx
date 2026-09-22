import React, { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { useApp } from '../../../shared/contexts/AppContext'
import { CAR_MODELS, DEFAULT_CAR_ID, BOT_DEFS } from '../../../boot/constants/index'
import Scene from './Scene'

const ThreeDView = ({ playerProgress = 0, botProgresses = {}, playerWpm = 0, racers: racersProp = null, showLabels = true }) => {
  const { playerColor, playerName, selectedCar, selectedBots, cameraMode } = useApp()

  const racers = useMemo(() => {
   
    if (racersProp && racersProp.length > 0) {
      return racersProp.map((r, i) => ({
        ...r,
    
        carId: r.isPlayer
          ? (selectedCar ?? DEFAULT_CAR_ID)
          : CAR_MODELS[i % CAR_MODELS.length]?.id ?? DEFAULT_CAR_ID,
      }))
    }

    const list = [{
      id: 'player',
      name: playerName || 'Toi',
      progress: playerProgress,
      color: playerColor,
      carId: selectedCar ?? DEFAULT_CAR_ID,
      isPlayer: true,
      wpm: playerWpm,
    }]

    selectedBots.forEach((botId, i) => {
      const bot = BOT_DEFS.find(b => b.id === botId)
      if (!bot) return
      const carDef = CAR_MODELS[(i + 1) % CAR_MODELS.length]
      list.push({
        id: botId,
        name: bot.name,
        progress: botProgresses[botId] ?? 0,
        color: bot.color,
        carId: carDef.id,
        isPlayer: false,
        wpm: bot.wpm,
      })
    })

    return list
  }, [racersProp, playerColor, playerName, selectedCar, selectedBots, playerProgress, botProgresses, playerWpm])

  return (
    <div className="w-full h-full">
      {/* `shadowMap` n'est pas une prop de Canvas : elle finissait sur le <div> */}
      <Canvas shadows={{ type: THREE.PCFShadowMap }}>
        <Suspense fallback={null}>
          <Scene racers={racers} showLabels={showLabels} cameraMode={cameraMode} />
        </Suspense>
      </Canvas>
    </div>
  )
}

export default ThreeDView