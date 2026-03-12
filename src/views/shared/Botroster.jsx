import { Badge } from "../shared/Badge";

const DIFFICULTY_COLORS = {
  "Beginner":     "#64748b",
  "Easy":         "#22c55e",
  "Medium":       "#3b82f6",
  "Hard":         "#f59e0b",
  "Expert":       "#a855f7",
  "World Record": "#ef4444",
};

export function BotRoster({ bots }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 5 }}>
      {bots.map(b => (
        <div key={b.id} style={S.row}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: b.color, boxShadow: `0 0 5px ${b.color}88`, flexShrink: 0 }} />
          <span style={{ ...S.name, color: b.color }}>{b.name}</span>
          <span style={S.wpm}>{b.wpm} wpm</span>
          <Badge color={DIFFICULTY_COLORS[b.label] || "#64748b"}>{b.label}</Badge>
        </div>
      ))}
    </div>
  );
}

const S = {
  row:  { display: "flex", alignItems: "center", gap: 7, padding: "7px 10px", background: "rgba(255,255,255,0.03)", borderRadius: 4, border: "1px solid rgba(255,255,255,0.06)" },
  name: { fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", flex: 1 },
  wpm:  { fontSize: 9, color: "rgba(255,255,255,0.35)", minWidth: 42 },
};