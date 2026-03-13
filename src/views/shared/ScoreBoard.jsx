import { GAME_MODES } from "../../constants/Index";
import { Button }     from "../shared/Button";




const MEDALS = ["🥇", "🥈", "🥉"];

export function ScoreBoard({ scores, playerName, mode, onPlayAgain, onMenu }) {
  const isSolo  = mode === GAME_MODES.SOLO;
  const myScore = scores.find(s => s.name === playerName && !s.isBot);
  const myRank  = scores.findIndex(s => s.name === playerName && !s.isBot) + 1;

  return (
    <div style={S.overlay}>
      <div style={S.panel}>

        {/* Header */}
        <div style={S.header}>
          <div style={S.flag}>🏁</div>
          <h2 style={S.title}>{isSolo ? "SESSION COMPLETE" : "RACE OVER"}</h2>
          {myScore && (
            <div style={S.myResult}>
              <span style={S.myWpm}>{myScore.wpm}</span>
              <span style={S.myWpmUnit}>WPM</span>
              {!isSolo && <span style={S.myRank}>P{myRank}</span>}
            </div>
          )}
        </div>

        <div style={S.divider} />

        {/* Scores list */}
        <div style={S.list}>
          {scores.map((s, i) => {
            const isMe = s.name === playerName && !s.isBot;
            return (
              <div key={i} style={{
                ...S.row,
                background: isMe ? "rgba(245,158,11,0.08)" : "rgba(255,255,255,0.02)",
                borderLeft: `3px solid ${isMe ? "#f59e0b" : s.color + "44"}`,
              }}>
                <span style={{ fontSize: 18, width: 32, textAlign: "center", flexShrink: 0 }}>
                  {MEDALS[i] || <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 700 }}>{i + 1}</span>}
                </span>
                <div style={{ width: 9, height: 9, borderRadius: "50%", background: s.color, boxShadow: `0 0 6px ${s.color}`, flexShrink: 0 }} />
                <span style={{ ...S.name, color: isMe ? "#f59e0b" : "rgba(255,255,255,0.8)" }}>
                  {s.name}
                  {s.isBot && <span style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", marginLeft: 5 }}>[BOT]</span>}
                  {isMe    && <span style={{ fontSize: 8, color: "#f59e0b",                 marginLeft: 5 }}>[YOU]</span>}
                </span>
                <div style={S.wpmCol}>
                  <span style={{ ...S.wpmVal, color: i === 0 ? "#f59e0b" : i === 1 ? "#94a3b8" : i === 2 ? "#cd7f32" : "rgba(255,255,255,0.55)" }}>
                    {s.wpm}
                  </span>
                  <span style={S.wpmUnit}>wpm</span>
                </div>
                {!s.isBot && <span style={S.errors}>{s.errors} err</span>}
              </div>
            );
          })}
        </div>

        <div style={S.divider} />

        {/* Action buttons */}
        <div style={S.actions}>
          <Button onClick={onPlayAgain} variant="primary" size="lg" style={{ flex: 1 }}>
            ↩ PLAY AGAIN
          </Button>
          <Button onClick={onMenu} variant="ghost" size="lg" style={{ flex: 1 }}>
            ⌂ MAIN MENU
          </Button>
        </div>
      </div>
    </div>
  );
}

const S = {
  overlay: {
    position: "absolute", inset: 0, zIndex: 30,
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "rgba(10,15,30,0.9)", backdropFilter: "blur(10px)",
  },
  panel: {
    background: "rgba(15,22,42,0.98)",
    border: "1px solid rgba(245,158,11,0.25)",
    borderRadius: 6, padding: "28px 26px",
    maxWidth: 460, width: "90%",
    boxShadow: "0 0 0 1px rgba(245,158,11,0.06), 0 24px 64px rgba(0,0,0,0.6)",
    animation: "fadeUp 0.4s cubic-bezier(0.34,1.36,0.64,1) both",
    fontFamily: "'Rajdhani', sans-serif",
    maxHeight: "90vh", overflowY: "auto",
  },
  header:    { textAlign: "center", marginBottom: 18 },
  flag:      { fontSize: 36, marginBottom: 8 },
  title:     { fontSize: 22, fontWeight: 700, letterSpacing: "0.2em", color: "#f1f5f9", margin: "0 0 12px" },
  myResult:  { display: "flex", alignItems: "baseline", justifyContent: "center", gap: 4 },
  myWpm:     { fontSize: 44, fontWeight: 700, color: "#f59e0b", letterSpacing: "-0.02em" },
  myWpmUnit: { fontSize: 14, color: "rgba(245,158,11,0.6)", letterSpacing: "0.1em" },
  myRank:    { marginLeft: 12, fontSize: 20, fontWeight: 700, color: "rgba(255,255,255,0.35)" },
  divider:   { height: 1, background: "rgba(255,255,255,0.06)", margin: "16px 0" },
  list:      { display: "flex", flexDirection: "column", gap: 5 },
  row:       { display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 4 },
  name:      { fontSize: 13, fontWeight: 600, flex: 1, letterSpacing: "0.06em" },
  wpmCol:    { display: "flex", alignItems: "baseline", gap: 2 },
  wpmVal:    { fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em" },
  wpmUnit:   { fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" },
  errors:    { fontSize: 9, color: "rgba(255,255,255,0.2)", minWidth: 34, textAlign: "right" },
  actions:   { display: "flex", gap: 10 },
};