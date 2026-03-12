import { useRef, useEffect } from "react";
import { RACE_STATUS, BOT_DEFS, GAME_MODES  } from "../../constants/Index";


export function TypingPanel({ text, typed, errors, status, onInput, mode, playerColor }) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (status === RACE_STATUS.RACING) setTimeout(() => inputRef.current?.focus(), 60);
  }, [status]);

  const isActive   = status === RACE_STATUS.RACING;
  const isSolo     = mode === GAME_MODES.SOLO;

  const borderColor = errors > 0 ? "#ef4444" : isActive ? "#f59e0b" : "rgba(255,255,255,0.1)";
  const glowColor   = errors > 0 ? "rgba(239,68,68,0.2)" : isActive ? "rgba(245,158,11,0.15)" : "transparent";

  return (
    <div style={S.panel}>

      {/* ── Text display ── */}
      <div style={S.textBox}>
        {text.split("").map((ch, i) => {
          let color = "rgba(255,255,255,0.22)";
          let bg    = "transparent";
          let fw    = 400;

          if (i < typed.length) {
            if (typed[i] === text[i]) { color = "#22c55e"; fw = 600; }
            else { color = "#f87171"; bg = "rgba(239,68,68,0.18)"; }
          } else if (i === typed.length) {
            color = "#0a0f1e"; bg = "#f59e0b"; fw = 700;
          }

          return (
            <span key={i} style={{ color, background: bg, fontWeight: fw, borderRadius: bg !== "transparent" ? 2 : 0, padding: bg !== "transparent" ? "0 1px" : 0 }}>
              {ch === " " ? "\u00a0" : ch}
            </span>
          );
        })}
      </div>

      {/* ── Input ── */}
      <input
        ref={inputRef}
        value={typed}
        onChange={onInput}
        disabled={!isActive}
        autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
        placeholder={
          status === RACE_STATUS.RACING    ? "Type here…" :
          status === RACE_STATUS.COUNTDOWN ? "Get ready…" :
          status === RACE_STATUS.FINISHED  ? "Race finished!" :
                                             "Waiting for race to start…"
        }
        style={{
          ...S.input,
          borderColor,
          boxShadow: `0 0 0 3px ${glowColor}`,
        }}
      />

      {/* ── Colour legend (hidden in solo) ── */}
      {!isSolo && (
        <div style={S.legend}>
          <LegendDot color={playerColor} label="YOU" />
          {BOT_DEFS.map(b => <LegendDot key={b.id} color={b.color} label={b.name} />)}
        </div>
      )}
    </div>
  );
}

function LegendDot({ color, label }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, boxShadow: `0 0 4px ${color}88`, flexShrink: 0 }} />
      <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 8, letterSpacing: "0.1em" }}>{label}</span>
    </span>
  );
}

const S = {
  panel: {
    flexShrink: 0,
    background: "rgba(10,15,30,0.97)",
    borderTop: "1px solid rgba(245,158,11,0.25)",
    padding: "14px 18px 16px",
    backdropFilter: "blur(12px)",
  },
  textBox: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 14, lineHeight: 1.85, letterSpacing: "0.03em",
    marginBottom: 10, padding: "11px 14px",
    background: "rgba(255,255,255,0.025)",
    borderRadius: 4, border: "1px solid rgba(255,255,255,0.06)",
    userSelect: "none", wordBreak: "break-word",
  },
  input: {
    width: "100%", padding: "11px 14px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid",
    borderRadius: 4, color: "#f1f5f9",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 13, outline: "none",
    letterSpacing: "0.04em",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxSizing: "border-box",
  },
  legend: { display: "flex", flexWrap: "wrap", gap: 12, marginTop: 8 },
};