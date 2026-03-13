/* eslint-disable react-hooks/purity */
import { useState, useRef, useCallback, useEffect } from "react";

import { BOT_DEFS, RACE_STATUS, GAME_MODES } from "../constants/Index";
import { SE } from "../services/SocketService";



const POST_FINISH_DELAY = 10;

/**
 * ViewModel — Race screen.
 *
 * COUNTDOWN FIX:
 *   The RaceScreen is now mounted BEFORE the race starts (during waiting phase).
 *   useRaceVM runs its own local 3-2-1 countdown using setInterval,
 *   completely independent from server events. This guarantees the countdown
 *   is always visible and never "missed" because the component mounted late.
 *
 *   Flow:
 *     App.jsx receives race:countdown(3) → switches screen to RACE
 *     → useRaceVM starts its own local 3s countdown
 *     → after 3s flips to RACING locally
 *     → race:start event from server is also listened to as a fallback
 */
export function useRaceVM({ socket, text, mode, playerName, playerColor, players = [] }) {
  const isSolo = mode === GAME_MODES.SOLO;

  const [typed,          setTyped]          = useState("");
  const [errors,         setErrors]         = useState(0);
  const [progress,       setProgress]       = useState(0);
  const [wpm,            setWpm]            = useState(0);
  const [status,         setStatus]         = useState(
    isSolo ? RACE_STATUS.RACING : RACE_STATUS.COUNTDOWN
  );
  // Solo: no countdown. Non-solo: start at 3 and count down locally
  const [countdown,      setCountdown]      = useState(isSolo ? null : 3);
  const [scores,         setScores]         = useState(null);
  const [leaderboard,    setLeaderboard]    = useState(() => buildInitialLB(players, mode));
  const [postFinishTick, setPostFinishTick] = useState(null);
  const [firstFinisher,  setFirstFinisher]  = useState(null);

  // Refs for 3-D loop — never cause re-renders
  const progressRef     = useRef(0);
  const finishedRef     = useRef(false);
  const startTimeRef    = useRef(isSolo ? Date.now() : null);
  const botCarMapRef    = useRef({});
  const playerCarMapRef = useRef({});
  const postFinishIvRef = useRef(null);
  const raceStartedRef  = useRef(isSolo); // prevent double-start

  // ── LOCAL countdown (3→2→1→GO) ──────────────────────────────────────────
  // Runs only in non-solo mode. Does not depend on socket timing.
  useEffect(() => {
    if (isSolo) return;

    let count = 3;
    setCountdown(count);
    setStatus(RACE_STATUS.COUNTDOWN);

    const iv = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(iv);
        setCountdown(null);
        if (!raceStartedRef.current) {
          raceStartedRef.current = true;
          startTimeRef.current   = Date.now();
          setStatus(RACE_STATUS.RACING);
        }
      }
    }, 1000);

    return () => clearInterval(iv);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Post-finish countdown ────────────────────────────────────────────────
  const startPostFinishCountdown = useCallback((winnerName) => {
    if (postFinishIvRef.current) return;
    setFirstFinisher(winnerName);
    setPostFinishTick(POST_FINISH_DELAY);
    let remaining = POST_FINISH_DELAY;
    postFinishIvRef.current = setInterval(() => {
      remaining -= 1;
      setPostFinishTick(remaining);
      if (remaining <= 0) {
        clearInterval(postFinishIvRef.current);
        postFinishIvRef.current = null;
        setStatus(prev => prev !== RACE_STATUS.FINISHED ? RACE_STATUS.FINISHED : prev);
        setScores(prev => prev || []);
      }
    }, 1000);
  }, []);

  useEffect(() => () => {
    if (postFinishIvRef.current) clearInterval(postFinishIvRef.current);
  }, []);

  // ── Socket listeners ─────────────────────────────────────────────────────
  useEffect(() => {
    // race:start = server confirmation (use server startTime for WPM sync)
    const onStart = ({ startTime } = {}) => {
      if (!raceStartedRef.current) {
        raceStartedRef.current = true;
        startTimeRef.current   = startTime ?? Date.now();
        setCountdown(null);
        setStatus(RACE_STATUS.RACING);
      } else {
        // Already started locally — just sync the startTime for WPM accuracy
        if (startTime) startTimeRef.current = startTime;
      }
    };

    // Bot progress → update 3D ref + leaderboard
    const onBots = data => {
      data.forEach(b => {
        if (botCarMapRef.current[b.id])
          botCarMapRef.current[b.id].progress = b.progress;
      });
      setLeaderboard(prev =>
        prev.map(r => {
          if (!r.isBot) return r;
          const u = data.find(b => b.id === r.id);
          return u ? { ...r, progress: u.progress } : r;
        }).sort((a, b) => b.progress - a.progress)
      );
    };

    // Other human players progress
    const onPlayers = data => {
      data.forEach(p => {
        if (playerCarMapRef.current[p.id])
          playerCarMapRef.current[p.id].progress = p.progress;
      });
      setLeaderboard(prev =>
        prev.map(r => {
          if (r.isBot) return r;
          const u = data.find(p => p.id === r.id);
          return u ? { ...r, progress: u.progress, wpm: u.wpm ?? r.wpm } : r;
        }).sort((a, b) => b.progress - a.progress)
      );
    };

    const onFinished = ({ scores }) => {
      finishedRef.current = true;
      setStatus(RACE_STATUS.FINISHED);
      setScores(scores);
      if (postFinishIvRef.current) {
        clearInterval(postFinishIvRef.current);
        postFinishIvRef.current = null;
        setPostFinishTick(null);
      }
    };

    socket.on(SE.RACE_START,       onStart);
    socket.on(SE.BOTS_PROGRESS,    onBots);
    socket.on(SE.PLAYERS_PROGRESS, onPlayers);
    socket.on(SE.RACE_FINISHED,    onFinished);

    return () => {
      socket.off(SE.RACE_START,       onStart);
      socket.off(SE.BOTS_PROGRESS,    onBots);
      socket.off(SE.PLAYERS_PROGRESS, onPlayers);
      socket.off(SE.RACE_FINISHED,    onFinished);
    };
  }, [socket]);

  // ── Typing handler ────────────────────────────────────────────────────────
  const handleInput = useCallback(e => {
    if (finishedRef.current || status !== RACE_STATUS.RACING) return;
    const val  = e.target.value;
    let   errs = 0;
    for (let i = 0; i < val.length; i++) if (val[i] !== text[i]) errs++;

    const prog    = Math.min(val.length / text.length, 1);
    const elapsed = Math.max((Date.now() - (startTimeRef.current || Date.now())) / 60000, 0.0001);
    const liveWpm = Math.round((val.length / 5) / elapsed);

    setTyped(val); setErrors(errs); setProgress(prog); setWpm(liveWpm);
    progressRef.current = prog;

    setLeaderboard(prev =>
      prev.map(r => (!r.isBot && r.id === socket.id) ? { ...r, progress: prog, wpm: liveWpm } : r)
          .sort((a, b) => b.progress - a.progress)
    );

    socket.emit(SE.PLAYER_PROGRESS, { progress: prog, wpm: liveWpm, errors: errs });

    if (prog >= 1 && errs === 0) {
      finishedRef.current = true;
      socket.emit(SE.PLAYER_PROGRESS, { progress: 1, wpm: liveWpm, errors: errs });

      if (isSolo) {
        setStatus(RACE_STATUS.FINISHED);
        setScores([{ name: playerName, color: playerColor, wpm: liveWpm, errors: errs, isBot: false }]);
      } else {
        startPostFinishCountdown(playerName);
      }
    }
  }, [text, status, playerName, playerColor, socket, isSolo, startPostFinishCountdown]);

  return {
    typed, errors, progress, wpm, status, countdown, scores, leaderboard,
    postFinishTick, firstFinisher,
    progressRef, finishedRef, startTimeRef,
    botCarMapRef, playerCarMapRef,
    handleInput,
  };
}

function buildInitialLB(players, mode) {
  const humans = players
    .filter(p => !p.isBot)
    .map(p => ({ id: p.id, name: p.name, color: p.color, progress: 0, wpm: 0, isBot: false }));
  const bots = mode === GAME_MODES.SOLO ? [] :
    BOT_DEFS.map(b => ({ id: b.id, name: b.name, color: b.color, progress: 0, wpm: 0, isBot: true }));
  return [...humans, ...bots];
}