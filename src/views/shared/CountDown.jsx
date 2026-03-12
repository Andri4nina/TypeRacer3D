const COUNT_COLORS = { 3: "#ef4444", 2: "#f59e0b", 1: "#22c55e" };

export function Countdown({ count }) {
  const color = COUNT_COLORS[count] || "#fff";
  return (
    <div style={S.overlay}>
      <div style={S.inner}>
        <div
          key={count}
          style={{
            fontSize: 160, fontWeight: 700, lineHeight: 1,
            color,
            textShadow: `0 0 60px ${color}99, 0 0 120px ${color}44`,
            fontFamily: "inherit",
            animation: "cdPop 0.65s cubic-bezier(0.34,1.56,0.64,1) both",
          }}
        >
          {count}
        </div>
        <div style={S.label}>GET READY</div>
      </div>
    </div>
  );
}

const S = {
  overlay: {
    position: "absolute", inset: 0, zIndex: 30, pointerEvents: "none",
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "rgba(10,15,30,0.65)", backdropFilter: "blur(3px)",
  },
  inner:  { textAlign: "center" },
  label: {
    fontSize: 11, fontWeight: 700, letterSpacing: "0.4em",
    color: "rgba(255,255,255,0.4)", marginTop: 12,
    textTransform: "uppercase",
  },
};