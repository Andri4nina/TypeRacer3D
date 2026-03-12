/**
 * PostFinishBanner — shown after the first human player crosses the finish line.
 * Displays a 10-second countdown before results appear.
 * Other players can still type during this window.
 */
export function PostFinishBanner({ secondsLeft, winnerName, isWinner }) {
    // Colour pulses red when < 4 s
    const urgent  = secondsLeft <= 3;
    const ringColor = urgent ? "#ef4444" : secondsLeft <= 6 ? "#f59e0b" : "#22c55e";
    const pct     = (secondsLeft / 10) * 100; // progress ring fill
  
    return (
      <div style={S.wrap}>
        <div style={S.card}>
  
          {/* Winner announcement */}
          <div style={S.winnerRow}>
            <span style={S.flag}>🏁</span>
            <div>
              <div style={S.finishedLabel}>FINISHED</div>
              <div style={{ ...S.winnerName, color: isWinner ? "#f59e0b" : "#f1f5f9" }}>
                {isWinner ? "YOU" : winnerName}
              </div>
            </div>
            {isWinner && <span style={S.crown}>👑</span>}
          </div>
  
          {/* Circular countdown */}
          <div style={S.ringWrap}>
            <svg width="72" height="72" viewBox="0 0 72 72" style={{ transform: "rotate(-90deg)" }}>
              {/* Track */}
              <circle cx="36" cy="36" r="30" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
              {/* Fill — animates via strokeDashoffset */}
              <circle
                cx="36" cy="36" r="30"
                fill="none"
                stroke={ringColor}
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 30}`}
                strokeDashoffset={`${2 * Math.PI * 30 * (1 - pct / 100)}`}
                style={{ transition: "stroke-dashoffset 0.9s linear, stroke 0.3s" }}
              />
            </svg>
            {/* Number in centre */}
            <div style={{ ...S.ringNum, color: ringColor }}>{secondsLeft}</div>
          </div>
  
          <div style={{ ...S.subLabel, color: urgent ? "#ef4444" : "rgba(255,255,255,0.4)" }}>
            {urgent ? "RESULTS INCOMING…" : "RESULTS IN"}
          </div>
        </div>
      </div>
    );
  }
  
  const S = {
    wrap: {
      position: "absolute", bottom: 14, left: "50%",
      transform: "translateX(-50%)",
      zIndex: 20, pointerEvents: "none",
    },
    card: {
      background: "rgba(10,15,30,0.92)",
      border: "1px solid rgba(245,158,11,0.3)",
      borderRadius: 10,
      padding: "12px 20px",
      backdropFilter: "blur(14px)",
      display: "flex",
      alignItems: "center",
      gap: 16,
      boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
      animation: "fadeUp 0.4s cubic-bezier(0.34,1.36,0.64,1) both",
      whiteSpace: "nowrap",
    },
    winnerRow: { display: "flex", alignItems: "center", gap: 10 },
    flag:      { fontSize: 22 },
    finishedLabel: { fontSize: 8, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase" },
    winnerName:    { fontSize: 16, fontWeight: 700, letterSpacing: "0.1em" },
    crown:         { fontSize: 18, marginLeft: 2 },
    ringWrap: { position: "relative", width: 72, height: 72, flexShrink: 0 },
    ringNum: {
      position: "absolute", inset: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em",
    },
    subLabel: { fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", textAlign: "center" },
  };