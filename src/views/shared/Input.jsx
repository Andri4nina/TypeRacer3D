export function Input({ value, onChange, placeholder = "", maxLength, style = {} }) {
    return (
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        style={{
          width: "100%",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(245,158,11,0.25)",
          borderRadius: "4px",
          padding: "9px 12px",
          color: "#f1f5f9",
          fontFamily: "inherit",
          fontSize: "12px",
          fontWeight: 600,
          letterSpacing: "0.1em",
          outline: "none",
          boxSizing: "border-box",
          transition: "border-color 0.2s",
          ...style,
        }}
        onFocus={e  => e.currentTarget.style.borderColor = "rgba(245,158,11,0.7)"}
        onBlur={e   => e.currentTarget.style.borderColor = "rgba(245,158,11,0.25)"}
      />
    );
  }