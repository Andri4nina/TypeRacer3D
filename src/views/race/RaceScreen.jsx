import { GAME_MODES, RACE_STATUS } from "../../constants/Index";
import { useRaceVM } from "../../viewmodels/UseRacevm";
import { Countdown } from "../shared/CountDown";
import { Leaderboard } from "../shared/LeaderBoard";
import { MiniBar } from "../shared/MiniBar";


import { PostFinishBanner } from "../shared/PostFinishBanner";
import { ScoreBoard } from "../shared/ScoreBoard";
import { TypingPanel } from "../shared/TypingPanel";
import { HUD } from "./Hud";
import { SceneCanvas } from "./ScreenCanva";



const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap');
  @keyframes cdPop   { from{transform:scale(2.4);opacity:0} to{transform:scale(1);opacity:1} }
  @keyframes fadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes blink   { 0%,100%{opacity:1} 50%{opacity:0.2} }
  @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.3} }
`;

export function RaceScreen({ socket, text, mode, players, playerName, playerColor, playerCarModelId, onPlayAgain }) {
  const vm     = useRaceVM({ socket, text, mode, playerName, playerColor, players });
  const isSolo = mode === GAME_MODES.SOLO;

  return (
    <div style={S.root}>
      <style>{GLOBAL_CSS}</style>

      {/* ── 3-D viewport ── */}
      <div style={S.viewport}>

        <SceneCanvas
          mode={mode} players={players}
          playerName={playerName} playerColor={playerColor}
          playerCarModelId={playerCarModelId}
          progressRef={vm.progressRef} finishedRef={vm.finishedRef}
          botCarMapRef={vm.botCarMapRef} playerCarMapRef={vm.playerCarMapRef}
        />

        {/* HUD — top left */}
        <div style={S.hudPos}>
          <HUD wpm={vm.wpm} progress={vm.progress} errors={vm.errors} mode={mode} />
        </div>

        {/* Leaderboard — top right (hidden in solo) */}
        {!isSolo && (
          <div style={S.lbPos}>
            <Leaderboard entries={vm.leaderboard} playerName={playerName} />
          </div>
        )}

        {/* Progress rail — bottom edge */}
        <div style={S.rail}>
          <MiniBar value={vm.progress} color={playerColor} height={4} glow />
        </div>

        {/* Mode chip */}
        <div style={S.modeChip}>
          {isSolo ? "🧘 SOLO PRACTICE" : "🤖 BOT RACE"}
        </div>

        {/* ── Overlays ── */}

        {/* Pre-race */}
        {vm.status === RACE_STATUS.IDLE && vm.countdown === null && (
          <div style={S.preRaceOverlay}>
            <div style={S.preRaceCard}>
              <div style={S.preRaceTitle}>{isSolo ? "PRACTICE" : "BOT RACE"}</div>
              <div style={S.preRaceSub} className="blink">START TYPING TO BEGIN</div>
            </div>
          </div>
        )}

        {/* Countdown */}
        {vm.countdown !== null && <Countdown count={vm.countdown} />}

        {/* Post-finish countdown banner (after first human finishes, before scores) */}
        {vm.postFinishTick !== null && !vm.scores && (
          <PostFinishBanner
            secondsLeft={vm.postFinishTick}
            winnerName={vm.firstFinisher}
            isWinner={vm.firstFinisher === playerName}
          />
        )}

        {/* Score board */}
        {vm.scores && (
          <ScoreBoard
            scores={vm.scores}
            playerName={playerName}
            mode={mode}
            onPlayAgain={onPlayAgain}
          />
        )}
      </div>

      {/* ── Typing panel ── */}
      <TypingPanel
        text={text}
        typed={vm.typed}
        errors={vm.errors}
        status={vm.status}
        onInput={vm.handleInput}
        mode={mode}
        playerColor={playerColor}
      />
    </div>
  );
}

const S = {
  root: {
    width: "100vw", height: "100vh",
    display: "flex", flexDirection: "column",
    overflow: "hidden",
    fontFamily: "'Rajdhani', sans-serif",
    background: "#0a0f1e",
  },
  viewport:  { flex: "1 1 62%", position: "relative", minHeight: 0 },
  hudPos:    { position: "absolute", top: 12, left: 12, zIndex: 10, pointerEvents: "none" },
  lbPos:     { position: "absolute", top: 12, right: 12, zIndex: 10, pointerEvents: "none" },
  rail:      { position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 10 },
  modeChip:  {
    position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)",
    background: "rgba(10,15,30,0.82)", color: "rgba(255,255,255,0.4)",
    fontSize: 9, letterSpacing: "0.25em", padding: "4px 14px",
    borderRadius: 20, border: "1px solid rgba(255,255,255,0.07)",
    backdropFilter: "blur(8px)", zIndex: 10, pointerEvents: "none",
  },
  preRaceOverlay: {
    position: "absolute", inset: 0, zIndex: 20,
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "rgba(10,15,30,0.7)", backdropFilter: "blur(4px)",
    pointerEvents: "none",
  },
  preRaceCard: {
    textAlign: "center",
    background: "rgba(15,22,42,0.95)",
    border: "1px solid rgba(245,158,11,0.2)",
    borderRadius: 5, padding: "36px 52px",
    boxShadow: "0 0 60px rgba(245,158,11,0.06)",
  },
  preRaceTitle: { fontSize: 32, fontWeight: 700, letterSpacing: "0.2em", color: "#f1f5f9", marginBottom: 10 },
  preRaceSub:   { fontSize: 10, letterSpacing: "0.35em", color: "rgba(245,158,11,0.6)", animation: "blink 1.4s ease-in-out infinite" },
};

// const GLOBAL_CSS = `
//   @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap');
//   @keyframes cdPop   { from{transform:scale(2.4);opacity:0} to{transform:scale(1);opacity:1} }
//   @keyframes fadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
//   @keyframes blink   { 0%,100%{opacity:1} 50%{opacity:0.2} }
//   @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.3} }
// `;

// export function RaceScreen({ socket, text, mode, players, playerName, playerColor, onPlayAgain }) {
//   const vm     = useRaceVM({ socket, text, mode, playerName, playerColor, players });
//   const isSolo = mode === GAME_MODES.SOLO;

//   return (
//     <div style={S.root}>
//       <style>{GLOBAL_CSS}</style>

//       {/* ── 3-D viewport ── */}
//       <div style={S.viewport}>

//         <SceneCanvas
//           mode={mode} players={players}
//           playerName={playerName} playerColor={playerColor}
//           progressRef={vm.progressRef} finishedRef={vm.finishedRef}
//           botCarMapRef={vm.botCarMapRef} playerCarMapRef={vm.playerCarMapRef}
//         />

//         {/* HUD — top left */}
//         <div style={S.hudPos}>
//           <HUD wpm={vm.wpm} progress={vm.progress} errors={vm.errors} mode={mode} />
//         </div>

//         {/* Leaderboard — top right (hidden in solo) */}
//         {!isSolo && (
//           <div style={S.lbPos}>
//             <Leaderboard entries={vm.leaderboard} playerName={playerName} />
//           </div>
//         )}

//         {/* Progress rail — bottom edge */}
//         <div style={S.rail}>
//           <MiniBar value={vm.progress} color={playerColor} height={4} glow />
//         </div>

//         {/* Mode chip */}
//         <div style={S.modeChip}>
//           {isSolo ? "🧘 SOLO PRACTICE" : "🤖 BOT RACE"}
//         </div>

//         {/* ── Overlays ── */}

//         {/* Pre-race */}
//         {vm.status === RACE_STATUS.IDLE && vm.countdown === null && (
//           <div style={S.preRaceOverlay}>
//             <div style={S.preRaceCard}>
//               <div style={S.preRaceTitle}>{isSolo ? "PRACTICE" : "BOT RACE"}</div>
//               <div style={S.preRaceSub} className="blink">START TYPING TO BEGIN</div>
//             </div>
//           </div>
//         )}

//         {/* Countdown */}
//         {vm.countdown !== null && <Countdown count={vm.countdown} />}

//         {/* Post-finish countdown banner (after first human finishes, before scores) */}
//         {vm.postFinishTick !== null && !vm.scores && (
//           <PostFinishBanner
//             secondsLeft={vm.postFinishTick}
//             winnerName={vm.firstFinisher}
//             isWinner={vm.firstFinisher === playerName}
//           />
//         )}

//         {/* Score board */}
//         {vm.scores && (
//           <ScoreBoard
//             scores={vm.scores}
//             playerName={playerName}
//             mode={mode}
//             onPlayAgain={onPlayAgain}
//           />
//         )}
//       </div>

//       {/* ── Typing panel ── */}
//       <TypingPanel
//         text={text}
//         typed={vm.typed}
//         errors={vm.errors}
//         status={vm.status}
//         onInput={vm.handleInput}
//         mode={mode}
//         playerColor={playerColor}
//       />
//     </div>
//   );
// }

// const S = {
//   root: {
//     width: "100vw", height: "100vh",
//     display: "flex", flexDirection: "column",
//     overflow: "hidden",
//     fontFamily: "'Rajdhani', sans-serif",
//     background: "#0a0f1e",
//   },
//   viewport:  { flex: "1 1 62%", position: "relative", minHeight: 0 },
//   hudPos:    { position: "absolute", top: 12, left: 12, zIndex: 10, pointerEvents: "none" },
//   lbPos:     { position: "absolute", top: 12, right: 12, zIndex: 10, pointerEvents: "none" },
//   rail:      { position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 10 },
//   modeChip:  {
//     position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)",
//     background: "rgba(10,15,30,0.82)", color: "rgba(255,255,255,0.4)",
//     fontSize: 9, letterSpacing: "0.25em", padding: "4px 14px",
//     borderRadius: 20, border: "1px solid rgba(255,255,255,0.07)",
//     backdropFilter: "blur(8px)", zIndex: 10, pointerEvents: "none",
//   },
//   preRaceOverlay: {
//     position: "absolute", inset: 0, zIndex: 20,
//     display: "flex", alignItems: "center", justifyContent: "center",
//     background: "rgba(10,15,30,0.7)", backdropFilter: "blur(4px)",
//     pointerEvents: "none",
//   },
//   preRaceCard: {
//     textAlign: "center",
//     background: "rgba(15,22,42,0.95)",
//     border: "1px solid rgba(245,158,11,0.2)",
//     borderRadius: 5, padding: "36px 52px",
//     boxShadow: "0 0 60px rgba(245,158,11,0.06)",
//   },
//   preRaceTitle: { fontSize: 32, fontWeight: 700, letterSpacing: "0.2em", color: "#f1f5f9", marginBottom: 10 },
//   preRaceSub:   { fontSize: 10, letterSpacing: "0.35em", color: "rgba(245,158,11,0.6)", animation: "blink 1.4s ease-in-out infinite" },
// };