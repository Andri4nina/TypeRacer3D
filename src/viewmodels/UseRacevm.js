import { useState, useRef, useCallback, useEffect } from "react";

import { BOT_DEFS, RACE_STATUS, GAME_MODES } from "../constants/Index";
import { SE } from "../services/SocketService";


const POST_FINISH_DELAY = 10; // seconds after first human finishes

/**
 * ViewModel — Race screen.
 * Manages: countdown, typing state, live WPM, leaderboard,
 *          bot/player socket progress, final scores.
 *          + post-finish countdown (10s after first human arrives)
 */
export function useRaceVM({ socket, text, mode, playerName, playerColor, players = [] }) {
  const [typed,           setTyped]           = useState("");
  const [errors,          setErrors]          = useState(0);
  const [progress,        setProgress]        = useState(0);
  const [wpm,             setWpm]             = useState(0);
  const [status,          setStatus]          = useState(
    mode === GAME_MODES.SOLO ? RACE_STATUS.RACING : RACE_STATUS.IDLE
  );
  const [countdown,       setCountdown]       = useState(null);
  const [scores,          setScores]          = useState(null);
  const [leaderboard,     setLeaderboard]     = useState(() => buildInitialLB(players, mode));
  // Post-finish: seconds remaining before results are shown (null = not started)
  const [postFinishTick,  setPostFinishTick]  = useState(null);
  // Name of the first human who crossed the line
  const [firstFinisher,   setFirstFinisher]   = useState(null);

  // Refs shared with SceneVM (no re-renders per frame)
  const progressRef     = useRef(0);
  const finishedRef     = useRef(false);
  // eslint-disable-next-line react-hooks/purity
  const startTimeRef    = useRef(mode === GAME_MODES.SOLO ? Date.now() : null);
  const botCarMapRef    = useRef({});
  const playerCarMapRef = useRef({});
  // Internal ref to avoid stale closure in the interval
  const postFinishIvRef = useRef(null);

  // ── Post-finish countdown trigger ─────────────────────────────
  const startPostFinishCountdown = useCallback((winnerName) => {
    // Only trigger once
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
        // Force results — socket may already have fired RACE_FINISHED;
        // if not (e.g. bots still running) we fire a synthetic finish
        setStatus(prev => {
          if (prev !== RACE_STATUS.FINISHED) return RACE_STATUS.FINISHED;
          return prev;
        });
        // scores may already be set; if not, set a partial one
        setScores(prev => prev || []);
      }
    }, 1000);
  }, []);

  // Cleanup interval on unmount
  useEffect(() => () => {
    if (postFinishIvRef.current) clearInterval(postFinishIvRef.current);
  }, []);

  // ── Socket listeners ───────────────────────────────────────
  useEffect(() => {
    const onCountdown = c => { setStatus(RACE_STATUS.COUNTDOWN); setCountdown(c); };
    const onStart     = () => { setStatus(RACE_STATUS.RACING); setCountdown(null); startTimeRef.current = Date.now(); };
    const onBots      = data => {
      data.forEach(b => {
        if (botCarMapRef.current[b.id]) botCarMapRef.current[b.id].progress = b.progress;
      });
      setLeaderboard(prev =>
        [...prev.map(r => r.isBot ? { ...r, progress: (data.find(b => b.id === r.id) || r).progress } : r)]
          .sort((a, b) => b.progress - a.progress)
      );
    };
    const onPlayers = data => {
      data.forEach(p => {
        if (playerCarMapRef.current[p.id]) playerCarMapRef.current[p.id].progress = p.progress;
      });
      setLeaderboard(prev =>
        [...prev.map(r => {
          if (r.isBot) return r;
          const u = data.find(p => p.id === r.id);
          return u ? { ...r, progress: u.progress } : r;
        })].sort((a, b) => b.progress - a.progress)
      );
    };
    const onFinished = ({ scores }) => {
      finishedRef.current = true;
      setStatus(RACE_STATUS.FINISHED);
      setScores(scores);
      // Stop post-finish countdown if already running
      if (postFinishIvRef.current) {
        clearInterval(postFinishIvRef.current);
        postFinishIvRef.current = null;
        setPostFinishTick(null);
      }
    };

    socket.on(SE.COUNTDOWN,        onCountdown);
    socket.on(SE.RACE_START,       onStart);
    socket.on(SE.BOTS_PROGRESS,    onBots);
    socket.on(SE.PLAYERS_PROGRESS, onPlayers);
    socket.on(SE.RACE_FINISHED,    onFinished);
    return () => {
      socket.off(SE.COUNTDOWN,        onCountdown);
      socket.off(SE.RACE_START,       onStart);
      socket.off(SE.BOTS_PROGRESS,    onBots);
      socket.off(SE.PLAYERS_PROGRESS, onPlayers);
      socket.off(SE.RACE_FINISHED,    onFinished);
    };
  }, [socket]);

  // ── Typing handler ─────────────────────────────────────────
  const handleInput = useCallback(e => {
    if (finishedRef.current || status !== RACE_STATUS.RACING) return;
    const val = e.target.value;
    let errs  = 0;
    for (let i = 0; i < val.length; i++) if (val[i] !== text[i]) errs++;

    const prog    = Math.min(val.length / text.length, 1);
    const elapsed = Math.max((Date.now() - (startTimeRef.current || Date.now())) / 60000, 0.0001);
    const liveWpm = Math.round((val.length / 5) / elapsed);

    setTyped(val); setErrors(errs); setProgress(prog); setWpm(liveWpm);
    progressRef.current = prog;

    setLeaderboard(prev =>
      [...prev.map(r => (!r.isBot && r.name === playerName) ? { ...r, progress: prog } : r)]
        .sort((a, b) => b.progress - a.progress)
    );

    socket.emit(SE.PLAYER_PROGRESS, { progress: prog, wpm: liveWpm, errors: errs });

    if (prog >= 1 && errs === 0) {
      finishedRef.current = true;
      socket.emit(SE.PLAYER_PROGRESS, { progress: 1, wpm: liveWpm, errors: errs });

      if (mode === GAME_MODES.SOLO) {
        // Solo: immediate result
        setStatus(RACE_STATUS.FINISHED);
        setScores([{ name: playerName, color: playerColor, wpm: liveWpm, errors: errs, isBot: false }]);
      } else {
        // Bot race / multiplayer: start 10s post-finish countdown
        startPostFinishCountdown(playerName);
      }
    }
  }, [text, status, playerName, playerColor, socket, mode, startPostFinishCountdown]);

  return {
    typed, errors, progress, wpm, status, countdown, scores, leaderboard,
    postFinishTick, firstFinisher,
    progressRef, finishedRef, startTimeRef,
    botCarMapRef, playerCarMapRef,
    handleInput,
  };
}

// ── Helpers ────────────────────────────────────────────────────
function buildInitialLB(players, mode) {
  const humans = players.map(p => ({ id: p.id, name: p.name, color: p.color, progress: 0, isBot: false }));
  const bots   = mode === GAME_MODES.SOLO ? [] :
    BOT_DEFS.map(b => ({ id: b.id, name: b.name, color: b.color, progress: 0, isBot: true }));
  return [...humans, ...bots];
}