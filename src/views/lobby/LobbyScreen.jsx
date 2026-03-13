import { useLobbyVM } from "../../viewmodels/UseLobbyvm";
import { PlayerSetup } from "../shared/PlayerSetup";
import { ModeSelector } from "./ModeSelector";


const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0a0f1e; }
  @keyframes scanline {
    0%  { background-position: 0 0; }
    100%{ background-position: 0 100px; }
  }
`;

export function LobbyScreen({ onEnter, netError = "" }) {
  const vm = useLobbyVM({ onEnter });

  return (
    <div style={S.root}>
      <style>{CSS}</style>

      {/* Animated scan-line overlay */}
      <div style={S.scanlines} />

      {/* Ambient grid */}
      <div style={S.grid} />

      <div style={S.inner}>

        {/* ── Header ── */}
        <header style={S.header}>
          <div style={S.titleRow}>
            <div style={S.titleAccent}>TYPE</div>
            <div style={S.titleMain}>RACER</div>
          </div>
          <div style={S.tagline}>3D · MULTIPLAYER · MVVM</div>
        </header>

        {/* ── Main layout ── */}
        <div style={S.layout}>

          {/* Left column — profile */}
          <aside style={S.aside}>
            <PlayerSetup
              name={vm.name}
              color={vm.color}
              colors={vm.colors}
              carModelId={vm.carModelId}
              onNameChange={vm.setName}
              onColorChange={vm.setColor}
              onCarChange={vm.setCarModelId}
            />

            {/* Quick stats strip */}
            <div style={S.statsStrip}>
              {[["WPM", "–"], ["RACES", "0"], ["BEST", "–"]].map(([l, v]) => (
                <div key={l} style={S.stat}>
                  <div style={S.statVal}>{v}</div>
                  <div style={S.statLabel}>{l}</div>
                </div>
              ))}
            </div>
          </aside>

          {/* Right column — mode selection */}
          <main style={S.main}>
            <div style={S.sectionLabel}>SELECT MODE</div>
            <ModeSelector
              mode={vm.mode}
              onSelect={vm.selectMode}
              onStartSolo={vm.startSolo}
              onStartBotRace={vm.startBotRace}
              onCreateRoom={vm.createRoom}
              onJoinRoom={vm.joinRoom}
              roomId={vm.roomId}
              onRoomIdChange={vm.setRoomId}
            />
            {vm.error   && <div style={S.error}>⚠ {vm.error}</div>}
            {netError   && (
              <div style={{ ...S.error, marginTop: 10, padding: "10px 12px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 4, lineHeight: 1.6, whiteSpace: "pre-line" }}>
                🔌 {netError}
              </div>
            )}
          </main>
        </div>

        {/* Footer */}
        <footer style={S.footer}>
          <span>TYPERACER 3D</span>
          <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
          <span>MVVM ARCHITECTURE</span>
          <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
          <span>SOLO & BOT — NO SERVER NEEDED</span>
          <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
          <span>MULTIPLAYER — NODE SERVER REQUIRED (Index.js)</span>
        </footer>
      </div>
    </div>
  );
}

const S = {
  root: {
    minHeight: "100vh",
    background: "linear-gradient(160deg, #0a0f1e 0%, #0d1530 40%, #080c18 100%)",
    display: "flex", alignItems: "flex-start", justifyContent: "center",
    fontFamily: "'Rajdhani', sans-serif",
    position: "relative", overflow: "auto",
    padding: "20px 0 40px",
  },
  scanlines: {
    position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
    backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px)",
    animation: "scanline 4s linear infinite",
  },
  grid: {
    position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, opacity: 0.04,
    backgroundImage: "linear-gradient(rgba(245,158,11,1) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,1) 1px, transparent 1px)",
    backgroundSize: "50px 50px",
  },
  inner:    { width: "100%", maxWidth: 980, padding: "32px 20px", position: "relative", zIndex: 1 },
  header:   { textAlign: "center", marginBottom: 36 },
  titleRow: { display: "flex", alignItems: "baseline", justifyContent: "center", gap: 6 },
  titleAccent: { fontSize: 52, fontWeight: 700, color: "#f59e0b", letterSpacing: "0.08em", fontFamily: "'Rajdhani', sans-serif" },
  titleMain:   { fontSize: 52, fontWeight: 700, color: "#f1f5f9", letterSpacing: "0.08em", fontFamily: "'Rajdhani', sans-serif" },
  tagline:     { fontSize: 10, letterSpacing: "0.35em", color: "rgba(245,158,11,0.45)", marginTop: 4 },
  layout: { display: "grid", gridTemplateColumns: "310px 1fr", gap: 20, alignItems: "start" },
  aside:  {},
  main:   {},
  sectionLabel: { fontSize: 9, letterSpacing: "0.25em", color: "rgba(255,255,255,0.25)", marginBottom: 10, textTransform: "uppercase" },
  statsStrip: {
    marginTop: 12, display: "grid", gridTemplateColumns: "repeat(3,1fr)",
    background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 4,
  },
  stat:      { padding: "10px 8px", textAlign: "center", borderRight: "1px solid rgba(255,255,255,0.05)" },
  statVal:   { fontSize: 18, fontWeight: 700, color: "#f59e0b", letterSpacing: "0.05em" },
  statLabel: { fontSize: 8, letterSpacing: "0.2em", color: "rgba(255,255,255,0.25)", marginTop: 2 },
  error:  { marginTop: 12, fontSize: 11, color: "#f87171", letterSpacing: "0.1em" },
  footer: {
    marginTop: 28, display: "flex", justifyContent: "center", gap: 14,
    fontSize: 8, letterSpacing: "0.2em", color: "rgba(255,255,255,0.18)",
    textTransform: "uppercase",
  },
};