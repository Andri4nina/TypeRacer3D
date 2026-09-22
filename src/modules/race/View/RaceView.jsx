/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import ThreeDView from './ThreeDView'
import ScoreView from './ScoreView'
import RankView from './RankView'
import TextTypeView from './TextTypeView'
import ParameterView from './ParameterView'
import CounterView from './CounterView'
import FinishView from './FinishView'
import { useApp } from '../../../shared/contexts/AppContext'
import { RACE_STATUS, GAME_MODES, BOT_DEFS, RACE_TEXTS, CAMERA_MODES } from '../../../boot/constants/index'
import useBotProgresses from '../ViewModel/BotsProgressViewModel'
import Icon from '../../../shared/components/Icon'
import MiniMapView from './MiniMapView'
import audio from '../../../shared/services/AudioService'
import {
  recordRace, getGhost, saveGhostIfBest, ghostProgressAt, textIdOf,
} from '../../../shared/services/StatsService'

const getRandom = arr => arr[Math.floor(Math.random() * arr.length)]

const RaceView = () => {
  const {
    gameMode, playerName, playerColor, selectedBots, navigate, roomState, socket, leaveRoom,
    cameraMode, setCameraMode, soundOn, setSoundOn,
  } = useApp()
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

  // Incrémenté à chaque relance : garantit le remontage du moteur de frappe
  // même quand le tirage aléatoire redonne le même texte.
  const [raceId, setRaceId] = useState(0)

  // --- RESSENTI : série de mots propres et à-coups sur faute ---
  const [combo, setCombo] = useState(0)
  const [errors, setErrors] = useState(0)
  const [elapsedMs, setElapsedMs] = useState(0)
  // Horodatage de la dernière faute — pilote le plongeon de la voiture
  const [errorAt, setErrorAt] = useState(0)

  // --- ANALYSE POST-COURSE ---
  // Accumulés dans des refs : ces données ne pilotent aucun rendu tant que la
  // course n'est pas finie, inutile de re-rendre à chaque frappe.
  const samplesRef = useRef([])
  const mistakesRef = useRef([])
  const lastSampleRef = useRef(-1)
  const [debrief, setDebrief] = useState(null)

  // --- VOITURE FANTÔME (solo) ---
  const textId = useMemo(() => textIdOf(sharedText), [sharedText])
  const ghost = useMemo(() => (isMulti ? null : getGhost(textId)), [textId, isMulti])
  const [ghostProgress, setGhostProgress] = useState(0)

  // --- MULTI: Progression des autres joueurs en temps réel ---
  const [livePlayersProgress, setLivePlayersProgress] = useState({})

  // --- MULTI: Classement final autoritaire reçu du serveur ---
  // Identique pour tous les clients, évite les désynchronisations de tri
  const [finalScores, setFinalScores] = useState(null)

  // --- TIMER DE FIN (MULTI) — valeur autoritaire envoyée par le serveur ---
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

    // Le serveur décompte le délai de grâce et coupe la course lui-même ;
    // on se contente d'afficher ce qu'il envoie.
    const handleEndsIn = (seconds) => setEndCountdown(seconds)

    socket.on('race:start', handleRaceStart)
    socket.on('players:progress', handlePlayersProgress)
    socket.on('race:endsIn', handleEndsIn)
    socket.on('race:finished', handleRaceFinished)

    return () => {
      socket.off('race:start', handleRaceStart)
      socket.off('players:progress', handlePlayersProgress)
      socket.off('race:endsIn', handleEndsIn)
      socket.off('race:finished', handleRaceFinished)
    }
  }, [isMulti, socket])

  // --- HANDLERS ---
  const handleStats = useCallback((stats) => {
    const { progress, wpm, accuracy, combo, errors, elapsedMs } = stats
    setPlayerProgress(progress)
    setWpm(wpm)
    setAccuracy(accuracy)
    setCombo(combo)
    setErrors(errors)
    setElapsedMs(elapsedMs)

    // Un point de courbe toutes les 250 ms au maximum : suffisant pour le
    // graphique et le fantôme, sans gonfler le localStorage.
    if (elapsedMs - lastSampleRef.current >= 250) {
      lastSampleRef.current = elapsedMs
      samplesRef.current.push({ t: Math.round(elapsedMs), wpm, progress })
    }

    // FIX #3 : Utiliser le bon nom d'événement 'player:progress' (pas 'player:update')
    if (isMulti && socket) {
      // `errors` vient du moteur de frappe : plus de ré-estimation approximative
      socket.emit('player:progress', { progress, wpm, errors })
    }
  }, [isMulti, socket])

  const handleError = useCallback((info) => {
    setErrorAt(Date.now())
    if (info?.word) mistakesRef.current.push(info)
  }, [])

  // ── Fantôme : rejoue la meilleure trace enregistrée sur ce texte ──
  useEffect(() => {
    if (!ghost || raceStatus !== RACE_STATUS.RACING || isPaused) return
    const startedAt = Date.now()
    const id = setInterval(() => {
      setGhostProgress(ghostProgressAt(ghost, Date.now() - startedAt))
    }, 60)
    return () => clearInterval(id)
  }, [ghost, raceStatus, isPaused])

  // ── Moteur : tourne pendant la course, sa hauteur suit le WPM ──
  useEffect(() => {
    if (raceStatus === RACE_STATUS.RACING && !isPaused) {
      audio.startEngine()
    } else {
      audio.stopEngine()
    }
    return () => audio.stopEngine()
  }, [raceStatus, isPaused])

  useEffect(() => {
    audio.setEngineRpm(wpm)
  }, [wpm])

  // ── Fin de course : on fige l'analyse, on enregistre, on met à jour le fantôme ──
  const recordedRef = useRef(false)
  useEffect(() => {
    if (raceStatus !== RACE_STATUS.FINISHED || recordedRef.current) return
    recordedRef.current = true
    audio.finishFanfare()

    const samples = samplesRef.current
    const mistakes = mistakesRef.current

    const result = recordRace({
      wpm, accuracy, errors, elapsedMs,
      progress: playerProgress,
      textId,
      samples, mistakes,
      mode: isMulti ? 'multi' : gameMode,
    })

    // Le fantôme ne se met à jour que sur une course solo réellement terminée
    const ghostSaved = !isMulti
      && playerProgress >= 1
      && saveGhostIfBest(textId, { wpm, elapsedMs, samples })

    setDebrief({ ...result, samples, mistakes, ghostSaved })
  }, [raceStatus, wpm, accuracy, errors, elapsedMs, playerProgress, textId, isMulti, gameMode])

  const cycleCamera = useCallback(() => {
    const i = CAMERA_MODES.findIndex(m => m.id === cameraMode)
    setCameraMode(CAMERA_MODES[(i + 1) % CAMERA_MODES.length].id)
  }, [cameraMode, setCameraMode])

  // ── Raccourcis Alt+C (caméra) et Alt+M (son) ──
  // Obligatoirement sous Alt : une lettre seule serait avalée par le champ de
  // saisie et comptée comme une frappe de course.
  useEffect(() => {
    const onKey = (ev) => {
      if (!ev.altKey || ev.ctrlKey || ev.metaKey) return
      const k = ev.key.toLowerCase()
      if (k === 'c') {
        ev.preventDefault()
        cycleCamera()
      } else if (k === 'm') {
        ev.preventDefault()
        setSoundOn(!soundOn)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [cycleCamera, soundOn, setSoundOn])

  const handlePlayerFinish = useCallback(() => {
    if (raceStatus === RACE_STATUS.RACING && !playerFinished) {
      setPlayerFinished(true)

      if (isMulti && socket) {
        // FIX #3 : Bon événement + marquer finished
        socket.emit('player:progress', { progress: 1, wpm, errors, finished: true })
      } else if (!isMulti) {
        setRaceStatus(RACE_STATUS.FINISHED)
      }
    }
  }, [raceStatus, playerFinished, isMulti, socket, wpm, errors])

  const handlePause = () => {
    if (!canPause) return
    setIsPaused(p => !p)
    setShowParams(p => !p)
  }

  // `keepText` : rejoue le même texte, seul moyen d'affronter son fantôme.
  const handleRestart = (keepText = false) => {
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
    setCombo(0)
    setErrors(0)
    setElapsedMs(0)
    setErrorAt(0)
    setRaceId(id => id + 1)
    samplesRef.current = []
    mistakesRef.current = []
    lastSampleRef.current = -1
    recordedRef.current = false
    setDebrief(null)
    setGhostProgress(0)

    if (!isMulti && !keepText) {
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

  // Série de mots propres → 0 (rien) à 1 (boost maximum)
  const boost = Math.min(combo / 5, 1)

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
          isPlayer: isMe,
          // Le ressenti n'est calculé que pour sa propre voiture
          boost: isMe ? boost : 0,
          errorAt: isMe ? errorAt : 0,
        }
      })
    : [
        { id: 'player', name: playerName || 'Toi', color: playerColor, progress: playerProgress, wpm, isPlayer: true, boost, errorAt },
        // Voiture fantôme : rejoue ton meilleur passage sur ce texte
        ...(ghost ? [{
          id: 'ghost',
          name: 'GHOST',
          color: '#94a3b8',
          progress: ghostProgress,
          wpm: ghost.wpm,
          isPlayer: false,
          isGhost: true,
        }] : []),
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

      {/* MINIMAP : position relative de tout le monde sur le circuit */}
      {!isFinished && (
        <div className="absolute top-0 left-0 w-full z-20">
          <MiniMapView racers={racers} />
        </div>
      )}

      {/* TIMER D'URGENCE HUD (Multi uniquement) */}
      {isMulti && endCountdown !== null && endCountdown > 0 && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
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
      <div className="absolute top-16 left-3 z-10 flex flex-col gap-3 w-[min(420px,52vw)]">
        <ScoreView
          wpm={wpm}
          accuracy={accuracy}
          progress={Math.round(playerProgress * 100)}
          combo={combo}
          elapsedMs={elapsedMs}
        />
        <RankView racers={racers} />
      </div>

      {/* Colonne de contrôles : caméras, son, pause — empilés pour ne jamais
          recouvrir les compteurs de gauche. */}
      {!isFinished && (
        <div className="absolute top-16 right-3 z-30 flex flex-col items-end gap-2">
          <div className="flex items-stretch border border-white/10 bg-slate-900/60 backdrop-blur-sm">
            {CAMERA_MODES.map(mode => (
              <button
                key={mode.id}
                onClick={() => setCameraMode(mode.id)}
                title={`${mode.label} (Alt+C)`}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-widest transition-colors
                  ${cameraMode === mode.id
                    ? 'bg-sky-500 text-slate-950'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                <Icon name={mode.icon} size={11} strokeWidth={2.5} />
                <span className="hidden md:inline">{mode.label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => setSoundOn(!soundOn)}
            title="Couper le son (Alt+M)"
            className={`flex items-center gap-2 px-2.5 py-1.5 border text-[9px] font-black uppercase tracking-widest backdrop-blur-sm transition-colors
              ${soundOn
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                : 'border-white/10 bg-slate-900/60 text-slate-500'}`}
          >
            <Icon name={soundOn ? 'volume' : 'volumeOff'} size={12} strokeWidth={2.5} />
            {soundOn ? 'Audio_On' : 'Muted'}
          </button>

          {canPause ? (
            <button
              onClick={handlePause}
              className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-slate-900/50 border border-white/10 text-[10px] tracking-widest text-white hover:bg-white/10 transition-all backdrop-blur-sm"
            >
              <Icon name={isPaused ? 'play' : 'pause'} size={12} filled strokeWidth={0} />
              {isPaused ? 'RESUME' : 'PAUSE'}
            </button>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-sky-500/10 border border-sky-500/30 text-sky-500 text-[10px] tracking-widest font-black uppercase italic backdrop-blur-sm">
              <Icon name="dot" size={8} filled className="animate-pulse" />
              Live_Sync_Active
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
            onError={handleError}
            key={`${raceId}:${sharedText}`}
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
          errors={errors}
          elapsedMs={elapsedMs}
          textLength={textLength}
          debrief={debrief}
          onRematchSameText={() => handleRestart(true)}
          hasGhost={Boolean(debrief?.ghostSaved || ghost)}
          onRestart={handleRestart}
          onQuit={handleQuit}
          isMulti={isMulti}
        />
      )}
    </div>
  )
}

export default RaceView