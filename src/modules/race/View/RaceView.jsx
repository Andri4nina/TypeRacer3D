/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useCallback, useEffect } from 'react'
import ThreeDView from './ThreeDView'
import ScoreView from './ScoreView'
import RankView from './RankView'
import TextTypeView from './TextTypeView'
import ParameterView from './ParameterView'
import CounterView from './CounterView'
import FinishView from './FinishView'
import { useApp } from '../../../shared/contexts/AppContext'
import { RACE_STATUS, GAME_MODES, BOT_DEFS, RACE_TEXTS } from '../../../boot/constants/index'
import useBotProgresses from '../ViewModel/BotsProgressViewModel'

const getRandom = arr => arr[Math.floor(Math.random() * arr.length)]

const RaceView = () => {
  const { gameMode, playerName, playerColor, selectedBots, navigate, roomState, socket, leaveRoom } = useApp()
  const isMulti = gameMode === GAME_MODES.MULTIPLAYER

  const [sharedText, setSharedText] = useState(() => isMulti ? (roomState?.text || "") : getRandom(RACE_TEXTS))

  useEffect(() => {
    if (isMulti && roomState?.text) {
      setSharedText(roomState.text)
    }
  }, [roomState?.text, isMulti])

  // --- ÉTATS DE COURSE ---
  const [raceStatus, setRaceStatus] = useState(RACE_STATUS.COUNTDOWN)
  const [isPaused, setIsPaused] = useState(false)
  const [showParams, setShowParams] = useState(false)
  const [playerProgress, setPlayerProgress] = useState(0)
  const [wpm, setWpm] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  const [playerFinished, setPlayerFinished] = useState(false)

  // --- MULTI: Progression des autres joueurs en temps réel ---
  const [livePlayersProgress, setLivePlayersProgress] = useState({})

  // --- MULTI: Classement final autoritaire reçu du serveur ---
  // Identique pour tous les clients, évite les désynchronisations de tri
  const [finalScores, setFinalScores] = useState(null)

  // --- SYSTÈME DE TIMER DE FIN (MULTI) ---
  const [endCountdown, setEndCountdown] = useState(null)

  const textLength = sharedText.length
  const botProgresses = useBotProgresses(selectedBots, textLength, raceStatus, isPaused)
  const canPause = !isMulti
  const isFinished = raceStatus === RACE_STATUS.FINISHED

  // --- ÉCOUTE DES ÉVÉNEMENTS SOCKET MULTI ---
  useEffect(() => {
    if (!isMulti || !socket) return

    // FIX #2 : Synchroniser le départ via l'événement socket, pas le roomState
    const handleRaceStart = () => {
      setRaceStatus(RACE_STATUS.COUNTDOWN)
    }

    // FIX #3 : Écouter les progressions live des autres joueurs
    const handlePlayersProgress = (players) => {
      const map = {}
      players.forEach(p => {
        map[p.id] = { progress: p.progress || 0, wpm: p.wpm || 0, finished: p.finished || false }
      })
      setLivePlayersProgress(map)
    }

    const handleRaceFinished = ({ scores } = {}) => {
      if (scores && scores.length > 0) {
        const enriched = scores.map(s => ({
          ...s,
          // Identification fiable : on compare l'id socket, pas le nom
          isPlayer: s.id === socket?.id,
        }))
        setFinalScores(enriched)
      }
      setRaceStatus(RACE_STATUS.FINISHED)
      setEndCountdown(null)
    }

    socket.on('race:start', handleRaceStart)
    socket.on('players:progress', handlePlayersProgress)
    socket.on('race:finished', handleRaceFinished)

    return () => {
      socket.off('race:start', handleRaceStart)
      socket.off('players:progress', handlePlayersProgress)
      socket.off('race:finished', handleRaceFinished)
    }
  }, [isMulti, socket])

  // --- LOGIQUE DE DÉCOMPTE DE FIN DE COURSE ---
  useEffect(() => {
    if (!isMulti || !roomState?.players) return

    const totalPlayers = roomState.players.length
    // On utilise livePlayersProgress pour avoir les données les plus fraîches
    const finishedPlayers = roomState.players.filter(p => {
      const live = livePlayersProgress[p.id]
      return live ? live.progress >= 1 : p.progress >= 1
    }).length

    if (finishedPlayers === 1 && endCountdown === null) {
      setEndCountdown(20)
    }

    if (finishedPlayers === totalPlayers && totalPlayers > 0) {
      setEndCountdown(prev => (prev === null || prev > 5) ? 5 : prev)
    }

    if (roomState.status === 'finished') {
      setRaceStatus(RACE_STATUS.FINISHED)
      setEndCountdown(null)
    }
  }, [roomState, isMulti, endCountdown, livePlayersProgress])

  useEffect(() => {
    if (endCountdown === null || endCountdown <= 0) return
    const timer = setInterval(() => {
      setEndCountdown(prev => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [endCountdown])

  // --- HANDLERS ---
  const handleStats = useCallback(({ progress, wpm, accuracy }) => {
    setPlayerProgress(progress)
    setWpm(wpm)
    setAccuracy(accuracy)

    // FIX #3 : Utiliser le bon nom d'événement 'player:progress' (pas 'player:update')
    if (isMulti && socket) {
      socket.emit('player:progress', {
        progress,
        wpm,
        errors: Math.round(progress * textLength * (1 - accuracy / 100))
      })
    }
  }, [isMulti, socket, textLength])

  const handlePlayerFinish = useCallback(() => {
    if (raceStatus === RACE_STATUS.RACING && !playerFinished) {
      setPlayerFinished(true)

      if (isMulti && socket) {
        // FIX #3 : Bon événement + marquer finished
        socket.emit('player:progress', { progress: 1, wpm, errors: 0, finished: true })
      } else if (!isMulti) {
        setRaceStatus(RACE_STATUS.FINISHED)
      }
    }
  }, [raceStatus, playerFinished, isMulti, socket, wpm])

  const handlePause = () => {
    if (!canPause) return
    setIsPaused(p => !p)
    setShowParams(p => !p)
  }

  const handleRestart = () => {
    // Reset état local (solo ET multi rematch)
    setRaceStatus(RACE_STATUS.COUNTDOWN)
    setIsPaused(false)
    setShowParams(false)
    setPlayerProgress(0)
    setWpm(0)
    setAccuracy(100)
    setPlayerFinished(false)
    setFinalScores(null)
    setLivePlayersProgress({})
    setEndCountdown(null)

    if (!isMulti) {
      setSharedText(getRandom(RACE_TEXTS))
    }
    // En multi : le nouveau texte arrivera via roomState.text après room:rematch
  }

  const handleQuit = () => {
    if (isMulti) {
      leaveRoom()
    } else {
      navigate('lobby')
    }
  }

  // --- CLASSEMENT LIVE ---
  // FIX #1 : En mode multi, fusionner roomState.players avec livePlayersProgress
  // pour avoir les données les plus récentes
  const racers = isMulti
    ? (roomState?.players || []).map(p => {
        const isMe = p.id === socket?.id
        // Priorité aux données live reçues via players:progress
        const live = livePlayersProgress[p.id]
        return {
          id: p.id,
          name: p.name,
          color: p.color,
          progress: isMe ? playerProgress : (live?.progress ?? p.progress ?? 0),
          wpm: isMe ? wpm : (live?.wpm ?? p.wpm ?? 0),
          isPlayer: isMe
        }
      })
    : [
        { id: 'player', name: playerName || 'Toi', color: playerColor, progress: playerProgress, wpm, isPlayer: true },
        ...selectedBots.map(botId => {
          const bot = BOT_DEFS.find(b => b.id === botId)
          return {
            id: botId,
            name: bot?.name ?? botId,
            color: bot?.color ?? '#888',
            progress: botProgresses[botId] ?? 0,
            wpm: bot?.wpm ?? 0,
            isPlayer: false,
          }
        }),
      ]

  return (
    <div className="relative w-full h-screen overflow-hidden select-none bg-slate-950 font-mono">

      {/* FIX #1 : Passer TOUS les racers à ThreeDView, pas seulement les bots solo */}
      <div className="absolute inset-0">
        <ThreeDView
          raceStatus={raceStatus}
          isPaused={isPaused}
          racers={racers}
          playerProgress={playerProgress}
          botProgresses={isMulti ? {} : botProgresses}
          playerWpm={wpm}
        />
      </div>

      {/* TIMER D'URGENCE HUD (Multi uniquement) */}
      {isMulti && endCountdown !== null && endCountdown > 0 && (
        <div className="absolute top-10 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div className="flex flex-col items-center bg-red-600/10 border border-red-500/50 backdrop-blur-xl px-8 py-2 rounded-sm shadow-[0_0_20px_rgba(239,68,68,0.2)]">
            <p className="text-[10px] text-red-500 font-black tracking-[0.5em] uppercase animate-pulse">
              Grid_Shutdown_Sequence
            </p>
            <p className="text-4xl font-black text-white italic">
              {endCountdown < 10 ? `0${endCountdown}` : endCountdown}
              <span className="text-xs ml-1 text-red-500 italic">s</span>
            </p>
          </div>
        </div>
      )}

      {/* Overlays haut gauche */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-3 min-w-64">
        <ScoreView wpm={wpm} accuracy={accuracy} progress={Math.round(playerProgress * 100)} />
        <RankView racers={racers} />
      </div>

      {/* Bouton Pause / Multi Status */}
      {!isFinished && (
        <div className="absolute top-3 right-3 z-10">
          {canPause ? (
            <button
              onClick={handlePause}
              className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-slate-900/50 border border-white/10 text-[10px] tracking-widest text-white hover:bg-white/10 transition-all backdrop-blur-sm"
            >
              <span>{isPaused ? '▶' : '⏸'}</span>
              {isPaused ? 'RESUME' : 'PAUSE'}
            </button>
          ) : (
            <div className="px-3 py-1.5 bg-sky-500/10 border border-sky-500/30 text-sky-500 text-[10px] tracking-widest font-black uppercase italic backdrop-blur-sm">
              ● Live_Sync_Active
            </div>
          )}
        </div>
      )}

      {/* Zone de frappe */}
      {!isFinished && sharedText && (
        <div className="absolute bottom-0 left-0 w-full z-10 bg-light/95 backdrop-blur-sm border-t border-light/10">
          <TextTypeView
            text={sharedText}
            raceStatus={raceStatus}
            isPaused={isPaused}
            onStats={handleStats}
            onFinish={handlePlayerFinish}
            key={sharedText.slice(0, 10)}
          />
        </div>
      )}

      {/* Countdown au démarrage */}
      {raceStatus === RACE_STATUS.COUNTDOWN && (
        <CounterView onComplete={() => setRaceStatus(RACE_STATUS.RACING)} />
      )}

      {/* Menu de pause */}
      {showParams && (
        <ParameterView
          onClose={() => { setShowParams(false); setIsPaused(false) }}
          onResume={() => { setShowParams(false); setIsPaused(false) }}
          onRestart={handleRestart}
        />
      )}

      {/* Écran de fin */}
      {isFinished && (
        <FinishView
          racers={isMulti && finalScores ? finalScores : racers}
          playerWpm={wpm}
          accuracy={accuracy}
          onRestart={handleRestart}
          onQuit={handleQuit}
          isMulti={isMulti}
        />
      )}
    </div>
  )
}

export default RaceView