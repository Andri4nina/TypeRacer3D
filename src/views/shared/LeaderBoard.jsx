import { MiniBar } from "./MiniBar";


const RANK_COLORS = ["#f59e0b", "#94a3b8", "#cd7f32"];

export function Leaderboard({ entries, playerName }) {
  return (
    <div style={S.wrap}>
      <div style={S.title}>STANDINGS</div>
      {entries.slice(0, 9).map((r, i) => {
        const isMe = !r.isBot && r.name === playerName;
        return (
          <div key={r.name + i} style={{ ...S.row, background: isMe ? "rgba(245,158,11,0.08)" : "transparent", borderLeft: isMe ? "2px solid #f59e0b" : "2px solid transparent" }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: RANK_COLORS[i] || "rgba(255,255,255,0.2)", width: 14, textAlign: "center", flexShrink: 0 }}>{i + 1}</span>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: r.color, boxShadow: `0 0 4px ${r.color}`, flexShrink: 0 }} />
            <span style={{ fontSize: 10, fontWeight: isMe ? 700 : 500, color: isMe ? "#f59e0b" : "rgba(255,255,255,0.65)", flex: 1, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", letterSpacing: "0.05em" }}>
              {r.name}
            </span>
            <div style={{ width: 48 }}>
              <MiniBar value={r.progress} color={r.color} height={3} glow={isMe} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

const S = {
  wrap: {
    background: "rgba(10,15,30,0.88)", backdropFilter: "blur(12px)",
    border: "1px solid rgba(245,158,11,0.15)", borderRadius: 4,
    padding: "10px 4px", minWidth: 180,
  },
  title: { fontSize: 8, fontWeight: 700, letterSpacing: "0.25em", color: "rgba(245,158,11,0.5)", padding: "0 8px 8px", textTransform: "uppercase" },
  row:   { display: "flex", alignItems: "center", gap: 6, padding: "4px 8px", transition: "background 0.2s" },
};