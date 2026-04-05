/* eslint-disable react-hooks/purity */
import { useState, useEffect, useRef } from 'react'
import { BOT_DEFS, RACE_STATUS } from '../../../boot/constants/index'

const useBotProgresses = (selectedBots, textLength, raceStatus, isPaused) => {
  const [botProgresses, setBotProgresses] = useState({})
  const requestRef = useRef()
  const lastUpdateRef = useRef(Date.now())
  
  // On stocke les data des bots pour éviter de boucler sur BOT_DEFS à chaque frame
  const botsData = useRef([])

  useEffect(() => {
    botsData.current = selectedBots.map(id => BOT_DEFS.find(b => b.id === id)).filter(Boolean)
  }, [selectedBots])

  useEffect(() => {
    // 1. Reset au countdown : on vide les progrès
    if (raceStatus === RACE_STATUS.COUNTDOWN) {
      setBotProgresses({})
      return
    }

    // 2. Si pause ou pas encore en course, on stoppe l'animation
    if (raceStatus !== RACE_STATUS.RACING || isPaused) {
      cancelAnimationFrame(requestRef.current)
      return
    }

    // ✅ CORRECTION CRUCIALE : 
    // On synchronise le "lastUpdate" au moment PRÉCIS où la course commence réellement
    // pour éviter que le deltaTime n'inclue le temps passé dans le compte à rebours.
    lastUpdateRef.current = Date.now()

    const update = () => {
      const now = Date.now()
      const deltaTime = (now - lastUpdateRef.current) / 1000 
      lastUpdateRef.current = now

      setBotProgresses(prev => {
        let hasChanged = false
        const nextProgresses = { ...prev }

        botsData.current.forEach(bot => {
          const current = nextProgresses[bot.id] ?? 0
          
          if (current < 1) {
            // Ton calcul de progression
            const addedProgress = ((bot.wpm * 5) / 60 * deltaTime) / textLength
            nextProgresses[bot.id] = Math.min(current + addedProgress, 1)
            hasChanged = true
          }
        })

        return hasChanged ? nextProgresses : prev
      })

      requestRef.current = requestAnimationFrame(update)
    }

    requestRef.current = requestAnimationFrame(update)

    return () => cancelAnimationFrame(requestRef.current)
  }, [raceStatus, isPaused, textLength])
  return botProgresses
}

export default useBotProgresses