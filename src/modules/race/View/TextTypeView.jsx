import React, { useState, useEffect, useRef, useCallback } from 'react'
import { RACE_STATUS } from '../../../boot/constants/index'
import { useApp } from '../../../shared/contexts/AppContext'
import Icon from '../../../shared/components/Icon'
import audio from '../../../shared/services/AudioService'

// Nombre de mots enchaînés sans faute pour atteindre le boost maximum
const COMBO_FOR_MAX_BOOST = 5

// Mot auquel appartient le caractère d'indice `index` — sert à identifier
// les mots sur lesquels le joueur bute.
const wordAt = (text, index) => {
  let start = Math.max(0, Math.min(index, text.length - 1))
  while (start > 0 && text[start - 1] !== ' ') start--
  let end = start
  while (end < text.length && text[end] !== ' ') end++
  return text.slice(start, end)
}

const TextTypeView = ({
  text = "",
  raceStatus,
  isPaused,
  onStats,
  onFinish,
  onBoost,
  onError,
}) => {
  const { playerColor } = useApp()

  // Invariant : `typed` est toujours un préfixe correct de `text`,
  // éventuellement suivi d'UN seul caractère erroné (l'erreur en attente).
  const [typed, setTyped] = useState('')
  const [hasError, setHasError] = useState(false)
  const [combo, setCombo] = useState(0)

  // Source de vérité synchrone. On ne peut pas se reposer sur l'état React
  // pendant la frappe : plusieurs `beforeinput` peuvent arriver avant le
  // moindre rendu, et la moitié des touches serait perdue.
  const engine = useRef({ typed: '', hasError: false, combo: 0, wordClean: true })

  const inputRef = useRef(null)
  const startTimeRef = useRef(null)
  const pausedMsRef = useRef(0)
  const pauseStartRef = useRef(null)
  const totalErrorsRef = useRef(0)
  const totalKeystrokesRef = useRef(0)

  const isActive = raceStatus === RACE_STATUS.RACING && !isPaused

  // Le chrono démarre au GO, pas à la première frappe
  useEffect(() => {
    if (raceStatus === RACE_STATUS.RACING && startTimeRef.current === null) {
      startTimeRef.current = Date.now()
    }
  }, [raceStatus])

  // La pause ne doit pas compter dans le temps de course
  useEffect(() => {
    if (startTimeRef.current === null) return
    if (isPaused) {
      pauseStartRef.current = Date.now()
    } else if (pauseStartRef.current !== null) {
      pausedMsRef.current += Date.now() - pauseStartRef.current
      pauseStartRef.current = null
    }
  }, [isPaused])

  useEffect(() => {
    if (isActive) inputRef.current?.focus()
  }, [isActive])

  const elapsedMinutes = () => {
    if (startTimeRef.current === null) return 0.001
    const raw = Date.now() - startTimeRef.current - pausedMsRef.current
    return Math.max(raw / 60000, 0.001)
  }

  const pushStats = useCallback((correctCount, currentCombo) => {
    // Grâce au hard block, les caractères validés sont forcément corrects :
    // WPM = caractères corrects / (5 × minutes), conformément à la formule standard.
    const wpm = Math.round((correctCount / 5) / elapsedMinutes())
    // Math.floor plutôt que Math.round : afficher 100 % alors qu'une faute a
    // été commise est trompeur, 100 % doit rester le sans-faute.
    const accuracy = totalKeystrokesRef.current > 0
      ? Math.max(0, Math.floor(((totalKeystrokesRef.current - totalErrorsRef.current) / totalKeystrokesRef.current) * 100))
      : 100
    const progress = text.length > 0 ? Math.min(correctCount / text.length, 1) : 0

    onStats?.({
      progress,
      wpm,
      accuracy,
      combo: currentCombo,
      errors: totalErrorsRef.current,
      elapsedMs: startTimeRef.current === null
        ? 0
        : Date.now() - startTimeRef.current - pausedMsRef.current,
    })
  }, [text, onStats])

  // Insère un caractère. Retourne false si la saisie doit s'arrêter là
  // (hard block actif, ou faute qui vient d'être commise).
  const insertChar = (char) => {
    const e = engine.current
    if (e.hasError) return false
    if (e.typed.length >= text.length) return false

    totalKeystrokesRef.current++

    if (char !== text[e.typed.length]) {
      // Faute : le caractère fautif s'affiche, mais la progression gèle ici
      totalErrorsRef.current++
      e.wordClean = false
      e.typed += char
      e.hasError = true
      e.combo = 0
      audio.key({ wrong: true })
      audio.skid(1)
      onError?.({ word: wordAt(text, e.typed.length - 1), index: e.typed.length - 1 })
      return false
    }

    audio.key()
    e.typed += char

    // Un mot vient d'être bouclé proprement → boost
    if (char === ' ' || e.typed.length === text.length) {
      if (e.wordClean) {
        e.combo += 1
        onBoost?.(e.combo)
      }
      e.wordClean = true
    }
    return true
  }

  const deleteChar = () => {
    const e = engine.current
    if (e.typed.length === 0) return
    e.typed = e.typed.slice(0, -1)
    e.hasError = false
    audio.skid(0.45)
  }

  // On intercepte `beforeinput` en natif et on annule systématiquement
  // l'événement : le DOM ne modifie jamais la valeur lui-même, React reste
  // seul maître de `value`. Plus de course entre le navigateur et le rendu,
  // et le collage est bloqué au même endroit que le reste.
  const handlersRef = useRef(null)

  // Rafraîchi après chaque rendu : le listener natif, lui, n'est posé qu'une
  // fois et lit toujours la version à jour ici.
  useEffect(() => {
    handlersRef.current = { isActive, insertChar, deleteChar, pushStats, onFinish, text }
  })

  useEffect(() => {
    const el = inputRef.current
    if (!el) return

    // Répercute l'état du moteur vers React puis vers le parent
    const sync = (h) => {
      const e = engine.current
      setTyped(e.typed)
      setHasError(e.hasError)
      setCombo(e.combo)
      h.pushStats(e.hasError ? e.typed.length - 1 : e.typed.length, e.combo)

      if (!e.hasError && e.typed.length >= h.text.length) {
        h.onFinish?.()
      }
    }

    // L'effacement passe par keydown : React réécrit `value` à chaque rendu,
    // ce qui replace le curseur en tête. Backspace n'ayant alors rien à
    // supprimer, le navigateur n'émet aucun `beforeinput`.
    const onKeyDown = (ev) => {
      if (ev.key !== 'Backspace' && ev.key !== 'Delete') return
      ev.preventDefault()
      const h = handlersRef.current
      if (!h || !h.isActive) return
      h.deleteChar()
      sync(h)
    }

    const onBeforeInput = (ev) => {
      ev.preventDefault()
      const h = handlersRef.current
      if (!h || !h.isActive) return

      const type = ev.inputType || 'insertText'

      if (type.startsWith('delete')) {
        h.deleteChar()
      } else if (type === 'insertFromPaste' || type === 'insertFromDrop') {
        return // anti-triche : un collage terminerait la course instantanément
      } else if (ev.data) {
        for (const char of ev.data) {
          if (!h.insertChar(char)) break
        }
      } else {
        return
      }

      sync(h)
    }

    el.addEventListener('keydown', onKeyDown)
    el.addEventListener('beforeinput', onBeforeInput)
    return () => {
      el.removeEventListener('keydown', onKeyDown)
      el.removeEventListener('beforeinput', onBeforeInput)
    }
  }, [])

  // Anti-triche : le collage court-circuiterait toute la course
  const blockInsertion = (e) => e.preventDefault()

  const comboRatio = Math.min(combo / COMBO_FOR_MAX_BOOST, 1)

  return (
    <div
      className="relative w-full max-w-7xl mx-auto py-6 px-8 cursor-text bg-slate-100 dark:bg-black border-2 border-slate-900 dark:border-sky-900/30 overflow-hidden"
      onClick={() => inputRef.current?.focus()}
      style={{ clipPath: 'polygon(2% 0, 100% 0, 100% 100%, 0 100%, 0 15%)' }}
    >
      {/* BACKGROUND DECORATION */}
      <div className="absolute top-2 right-4 font-mono text-[10px] text-slate-300 dark:text-sky-900/50 pointer-events-none select-none uppercase">
        Input_Buffer_Sector_01
      </div>

      {/* LISERÉ DE COMBO : s'intensifie avec la série de mots propres */}
      <div
        className="absolute top-0 left-0 h-[3px] transition-all duration-300 pointer-events-none"
        style={{
          width: `${comboRatio * 100}%`,
          backgroundColor: playerColor || '#0ea5e9',
          boxShadow: comboRatio > 0 ? `0 0 12px ${playerColor}` : 'none',
        }}
      />

      {/* INPUT CACHÉ */}
      <input
        ref={inputRef}
        type="text"
        value={typed}
        // La valeur est pilotée par le listener `beforeinput` ci-dessus ;
        // ce onChange ne sert qu'à satisfaire l'input contrôlé de React.
        onChange={() => {}}
        onPaste={blockInsertion}
        onDrop={blockInsertion}
        disabled={!isActive}
        className="absolute inset-0 w-full opacity-0 z-50 cursor-default"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
      />

      {/* TEXT DISPLAY AREA : Garde la hauteur prédéfinie */}
      <div className="relative z-10 font-mono text-xl md:text-2xl leading-relaxed text-left select-none break-words max-h-[120px] overflow-y-auto pr-4 custom-scrollbar">
        {text.split('').map((char, i) => {
          let stateClass = ""
          const isCurrent = i === typed.length

          if (i < typed.length) {
            stateClass = typed[i] === char
              ? "text-green-500 "
              : "text-rose-500 bg-rose-500/30"
          } else {
            stateClass = "text-slate-400 dark:text-slate-500"
          }

          return (
            <span
              key={i}
              className={`relative inline-block transition-all duration-75 border-b-2 ${isCurrent ? 'border-sky-500 bg-sky-500/5' : 'border-transparent'} ${stateClass}`}
            >
              {/* Le Curseur (Caret) */}
              {isCurrent && (
                <span
                  className="absolute bottom-0 left-0 w-full h-[3px] animate-pulse"
                  style={{ backgroundColor: playerColor || '#0ea5e9', boxShadow: `0 0 12px ${playerColor}` }}
                />
              )}
              {char === " " ? " " : char}
            </span>
          )
        })}
      </div>

      {/* MINI BARRE D'ÉTAT : Style Radar / Terminal */}
      <div className="mt-6 flex items-center justify-between border-t-2 border-slate-900/10 dark:border-sky-900/20 pt-3 font-mono text-[9px] font-black uppercase tracking-[0.2em]">
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-300 dark:bg-slate-800"}`} />
            <span className={isActive ? "text-emerald-500" : "text-slate-400"}>
              {isActive ? "CORE_LINK_STABLE" : "STANDBY_MODE"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-500">
            <span className="opacity-50">PROG:</span>
            <span className="text-slate-900 dark:text-sky-400">
              {hasError ? typed.length - 1 : typed.length} / {text.length}
            </span>
          </div>

          {combo > 1 && (
            <div className="flex items-center gap-2 text-amber-500 animate-pulse">
              <span className="opacity-50">STREAK:</span>
              <span className="italic">×{combo}</span>
            </div>
          )}
        </div>

        {hasError ? (
          <div className="flex items-center gap-2 px-3 py-1 bg-rose-600 text-white skew-x-[-15deg]">
            <Icon name="backspace" size={13} strokeWidth={2.5} />
            <span className="font-black italic">BACKSPACE_TO_UNLOCK</span>
          </div>
        ) : isPaused ? (
          <div className="flex items-center gap-2 px-3 py-1 bg-amber-500 text-black skew-x-[-15deg] animate-pulse">
            <span className="font-black italic">! PAUSE_INTERRUPT</span>
          </div>
        ) : (
          <div className="text-[8px] text-slate-400 italic opacity-50">
            // DATA_STREAM_ACTIVE
          </div>
        )}
      </div>

      {/* STYLE POUR LE SCROLLBAR INTERNE */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${playerColor}33;
          border-radius: 2px;
        }
      `}</style>
    </div>
  )
}

export default TextTypeView
