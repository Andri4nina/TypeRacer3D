import { CAR_MODELS } from "../../constants/Index";
import { Input } from "./Input";
import { CarSelector } from "../lobby/CarSelector";
import { ColorPicker } from "./colorPicker";

export function PlayerSetup({ name, color, colors, carModelId, onNameChange, onColorChange, onCarChange }) {
  const selectedCar = CAR_MODELS.find(m => m.id === carModelId);

  return (
    <div style={S.card}>
      <div style={S.title}>PILOT PROFILE</div>

      {/* Callsign */}
      <div style={S.field}>
        <label style={S.label}>CALLSIGN</label>
        <Input
          value={name}
          onChange={e => onNameChange(e.target.value)}
          placeholder="YOUR NAME"
          maxLength={12}
        />
      </div>

      {/* Car selection */}
      <div style={S.field}>
        <label style={S.label}>VEHICLE</label>
        <CarSelector selectedId={carModelId} color={color} onChange={onCarChange} />
      </div>

      {/* Livery colour */}
      <div style={S.field}>
        <label style={S.label}>LIVERY COLOUR</label>
        <ColorPicker colors={colors} selected={color} onChange={onColorChange} />
      </div>

      {/* Preview strip */}
      <div style={S.preview}>
        <div style={{ width: 32, height: 32, fontSize: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {selectedCar?.emoji ?? "🏎️"}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ ...S.previewName, color }}>{name || "RACER"}</div>
          <div style={S.previewSub}>{selectedCar?.name ?? "F1 — Classic"}</div>
        </div>
        <div style={{ width: 14, height: 14, borderRadius: "50%", background: color, boxShadow: `0 0 8px ${color}` }} />
      </div>
    </div>
  );
}

const S = {
  card: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(245,158,11,0.18)",
    borderRadius: 6,
    padding: "20px 18px",
  },
  title: { fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", color: "#f59e0b", marginBottom: 18, textTransform: "uppercase" },
  field: { marginBottom: 16 },
  label: { display: "block", fontSize: 9, letterSpacing: "0.15em", color: "rgba(255,255,255,0.35)", marginBottom: 6, textTransform: "uppercase" },
  preview: {
    marginTop: 18, padding: "10px 12px",
    background: "rgba(245,158,11,0.06)",
    borderRadius: 4, border: "1px solid rgba(245,158,11,0.12)",
    display: "flex", alignItems: "center", gap: 10,
  },
  previewName: { fontSize: 13, fontWeight: 700, letterSpacing: "0.12em" },
  previewSub:  { fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em", marginTop: 2 },
};