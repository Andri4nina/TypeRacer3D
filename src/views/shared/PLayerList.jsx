import { Badge } from "../shared/Badge";

export function PlayerList({ players, hostId }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {(players || []).map(p => (
        <div key={p.id} style={S.row}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: p.color, boxShadow: `0 0 6px ${p.color}88`, flexShrink: 0 }} />
          <span style={S.name}>{p.name}</span>
          {p.id === hostId && <Badge color="#f59e0b">Host</Badge>}
        </div>
      ))}
    </div>
  );
}

const S = {
  row:  { display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", background: "rgba(255,255,255,0.04)", borderRadius: 4, border: "1px solid rgba(255,255,255,0.06)" },
  name: { fontWeight: 600, fontSize: 12, color: "rgba(255,255,255,0.85)", letterSpacing: "0.08em", flex: 1 },
};