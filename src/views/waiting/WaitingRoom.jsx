import { GAME_MODES } from "../../constants/Index";
import { useWaitingVM } from "../../viewmodels/UseWaitingvm";
import { BotRoster } from "../shared/Botroster";
import { Button } from "../shared/Button";
import { PlayerList } from "../shared/PLayerList";



export function WaitingRoom({ socket, roomState: initial, mode }) {
  const vm      = useWaitingVM({ socket, initialState: initial });
  const isMulti = mode === GAME_MODES.MULTIPLAYER;

  return (
    <div style={S.root}>
      <div style={S.card}>

        {/* Header */}
        <div style={S.header}>
          <div style={S.pretitle}>{isMulti ? "MULTIPLAYER ROOM" : "BOT RACE"}</div>
          <h1 style={S.title}>{isMulti ? vm.roomState.id : "START ENGINES"}</h1>

          {isMulti && (
            <button onClick={vm.copyCode} style={S.copyBtn}>
              {vm.copied ? "✓ COPIED" : "⎘ COPY CODE"}
            </button>
          )}
        </div>

        <div style={S.divider} />

        {/* Players section */}
        {isMulti && (
          <Section label="PILOTS IN ROOM">
            <PlayerList players={vm.roomState.players} hostId={vm.roomState.host} />
          </Section>
        )}

        {/* Bots */}
        <Section label={`AI OPPONENTS  ·  ${vm.bots[0].wpm} WPM → ${vm.bots[vm.bots.length-1].wpm} WPM`}>
          <BotRoster bots={vm.bots} />
        </Section>

        {/* Race text preview */}
        <Section label="RACE TEXT PREVIEW">
          <div style={S.textPreview}>
            {(vm.roomState.text || "").slice(0, 55)}
            <span style={{ color: "rgba(255,255,255,0.2)" }}>…</span>
          </div>
        </Section>

        <div style={S.divider} />

        {/* CTA */}
        {vm.isHost ? (
          <Button onClick={vm.startRace} variant="primary" size="lg" fullWidth>
            ▶ START RACE
          </Button>
        ) : (
          <div style={S.waiting}>
            <span style={S.waitDot} />
            WAITING FOR HOST TO START
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", color: "rgba(245,158,11,0.6)", marginBottom: 8, textTransform: "uppercase" }}>
        {label}
      </div>
      {children}
    </div>
  );
}

const S = {
  root: {
    minHeight: "100vh",
    background: "linear-gradient(160deg, #0a0f1e 0%, #0d1530 50%, #080c18 100%)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: 20, fontFamily: "'Rajdhani', sans-serif",
  },
  card: {
    width: "100%", maxWidth: 580,
    background: "rgba(255,255,255,0.025)",
    border: "1px solid rgba(245,158,11,0.2)",
    borderRadius: 6, padding: "30px 28px",
    boxShadow: "0 0 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(245,158,11,0.06)",
  },
  header:   { textAlign: "center", marginBottom: 22 },
  pretitle: { fontSize: 9, letterSpacing: "0.3em", color: "rgba(245,158,11,0.6)", marginBottom: 6, textTransform: "uppercase" },
  title:    { fontSize: 36, fontWeight: 700, letterSpacing: "0.15em", color: "#f1f5f9", margin: "0 0 10px" },
  copyBtn: {
    fontSize: 9, fontWeight: 700, letterSpacing: "0.15em",
    color: "#f59e0b", background: "rgba(245,158,11,0.08)",
    border: "1px solid rgba(245,158,11,0.3)", borderRadius: 3,
    padding: "4px 12px", cursor: "pointer", fontFamily: "inherit",
    transition: "background 0.15s",
  },
  divider:  { height: 1, background: "rgba(255,255,255,0.06)", margin: "18px 0" },
  textPreview: {
    fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.6,
    fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.02em",
  },
  waiting: {
    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
    padding: "14px 0", fontSize: 11, letterSpacing: "0.2em",
    color: "rgba(255,255,255,0.35)",
  },
  waitDot: {
    display: "inline-block", width: 6, height: 6, borderRadius: "50%",
    background: "#f59e0b", animation: "pulse 1.2s ease-in-out infinite",
  },
};