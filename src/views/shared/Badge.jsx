export function Badge({ children, color = "#f59e0b", size = "xs" }) {
    return (
      <span style={{
        display: "inline-block",
        fontSize: size === "xs" ? "9px" : "10px",
        fontWeight: 700,
        letterSpacing: "0.15em",
        color,
        border: `1px solid ${color}44`,
        borderRadius: "2px",
        padding: "2px 7px",
        background: `${color}12`,
        textTransform: "uppercase",
      }}>
        {children}
      </span>
    );
  }