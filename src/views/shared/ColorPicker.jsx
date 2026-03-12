export function ColorPicker({ colors, selected, onChange }) {
    return (
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {colors.map(c => (
          <button
            key={c}
            onClick={() => onChange(c)}
            style={{
              width: 26, height: 26, borderRadius: "50%",
              background: c, cursor: "pointer",
              border: "none", outline: "none",
              boxShadow: selected === c
                ? `0 0 0 2px #0a0f1e, 0 0 0 4px ${c}, 0 0 12px ${c}88`
                : `0 0 0 1px ${c}44`,
              transform: selected === c ? "scale(1.18)" : "scale(1)",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
          />
        ))}
      </div>
    );
  }