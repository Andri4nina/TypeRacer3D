export function MiniBar({ value = 0, color = "#f59e0b", height = 3, glow = false }) {
    const pct = Math.min(Math.max(value * 100, 0), 100);
    return (
      <div style={{ width: "100%", height, background: "rgba(255,255,255,0.08)", borderRadius: height }}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          background: color,
          borderRadius: height,
          transition: "width 0.25s ease",
          boxShadow: glow ? `0 0 6px ${color}88` : "none",
        }} />
      </div>
    );
  }