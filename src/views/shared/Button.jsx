const VARIANTS = {
  primary: {
    bg: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    shadow: "0 4px 20px rgba(245,158,11,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
    color: "#0a0f1e",
  },
  ghost: {
    bg: "transparent",
    shadow: "inset 0 0 0 1.5px rgba(245,158,11,0.5)",
    color: "#f59e0b",
  },
  danger: {
    bg: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    shadow: "0 4px 20px rgba(239,68,68,0.4)",
    color: "#fff",
  },
  dim: {
    bg: "rgba(255,255,255,0.06)",
    shadow: "inset 0 0 0 1px rgba(255,255,255,0.1)",
    color: "rgba(255,255,255,0.6)",
  },
};

const SIZES = {
  sm: { padding: "7px 18px",  fontSize: "10px" },
  md: { padding: "10px 22px", fontSize: "11px" },
  lg: { padding: "14px 32px", fontSize: "13px" },
};

export function Button({ children, onClick, variant = "primary", size = "md", disabled = false, fullWidth = false }) {
  const v = VARIANTS[variant] || VARIANTS.primary;
  const s = SIZES[size] || SIZES.md;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: v.bg,
        boxShadow: v.shadow,
        color: v.color,
        padding: s.padding,
        fontSize: s.fontSize,
        fontFamily: "inherit",
        fontWeight: 700,
        letterSpacing: "0.15em",
        border: "none",
        borderRadius: "4px",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        width: fullWidth ? "100%" : "auto",
        transition: "opacity 0.15s, transform 0.1s, box-shadow 0.15s",
        textTransform: "uppercase",
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
      onMouseDown={e =>  { if (!disabled) e.currentTarget.style.transform = "translateY(1px)"; }}
      onMouseUp={e =>    { if (!disabled) e.currentTarget.style.transform = "translateY(-1px)"; }}
    >
      {children}
    </button>
  );
}