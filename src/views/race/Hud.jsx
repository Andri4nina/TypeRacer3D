import { GAME_MODES } from "../../constants";

export function HUD({ wpm, progress, errors, mode }) {
  const isSolo = mode === GAME_MODES.SOLO;

  const tiles = [
    { label: "SPEED",    value: wpm,                    unit: "wpm", color: "#f59e0b" },
    { label: "PROGRESS", value: Math.round(progress*100), unit: "%",  color: "#22c55e" },
    ...(!isSolo ? [{ label: "ERRORS", value: errors, unit: "", color: "#ef4444" }] : []),
  ];

  return (
    <div style={{ display: "flex", gap: 8 }}>
      {tiles.map(t => (
        <div key={t.label} style={{
          background: "rgba(10,15,30,0.88)",
          border: `1px solid ${t.color}33`,
          borderBottom: `2px solid ${t.color}`,
          borderRadius: "4px 4px 0 0",
          padding: "6px 14px",
          backdropFilter: "blur(10px)",
          minWidth: 72,
        }}>
          <div style={{ fontSize: 8, letterSpacing: "0.2em", color: t.color + "aa", marginBottom: 1 }}>{t.label}</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: t.color, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
            {t.value}<span style={{ fontSize: 9, opacity: 0.7, marginLeft: 2 }}>{t.unit}</span>
          </div>
        </div>
      ))}
    </div>
  );
}