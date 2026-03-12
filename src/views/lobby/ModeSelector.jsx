import { BOT_DEFS, GAME_MODES } from "../../constants";
import { Button }  from "../shared/Button";
import { Input }   from "../shared/Input";

/** Single mode card */
function ModeCard({ icon, title, description, accent, selected, onClick, children }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: selected ? `rgba(${hex2rgb(accent)}, 0.07)` : "rgba(255,255,255,0.025)",
        border: `1px solid ${selected ? accent + "55" : "rgba(255,255,255,0.07)"}`,
        borderLeft: `3px solid ${selected ? accent : "transparent"}`,
        borderRadius: 5,
        padding: "16px 18px",
        cursor: "pointer",
        transition: "all 0.18s",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Glow on selected */}
      {selected && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${accent}66, transparent)` }} />
      )}

      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <span style={{ fontSize: 22, lineHeight: 1, marginTop: 2 }}>{icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", color: selected ? accent : "rgba(255,255,255,0.85)", marginBottom: 4 }}>
            {title}
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", lineHeight: 1.55, marginBottom: selected && children ? 14 : 0 }}>
            {description}
          </div>
          {selected && children}
        </div>
      </div>
    </div>
  );
}

export function ModeSelector({ mode, onSelect, onStartSolo, onStartBotRace, onCreateRoom, onJoinRoom, roomId, onRoomIdChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>

      <ModeCard
        icon="🧘" title="Solo Practice" accent="#06b6d4"
        description="Type alone with no pressure. Pure training — track your WPM improvement."
        selected={mode === GAME_MODES.SOLO}
        onClick={() => onSelect(GAME_MODES.SOLO)}
      >
        <Button onClick={onStartSolo} variant="ghost" size="sm">Start Session ▶</Button>
      </ModeCard>

      <ModeCard
        icon="🤖" title="Race vs Bots" accent="#f59e0b"
        description={`6 AI rivals from ${BOT_DEFS[0].wpm} WPM (${BOT_DEFS[0].name}) to ${BOT_DEFS[5].wpm} WPM (${BOT_DEFS[5].name} — world record pace).`}
        selected={mode === GAME_MODES.BOT_RACE}
        onClick={() => onSelect(GAME_MODES.BOT_RACE)}
      >
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 4, marginBottom: 12 }}>
            {BOT_DEFS.map(b => (
              <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 6px", background: "rgba(255,255,255,0.04)", borderRadius: 3 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: b.color, boxShadow: `0 0 4px ${b.color}` }} />
                <span style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.7)", flex: 1 }}>{b.name}</span>
                <span style={{ fontSize: 8, color: "rgba(255,255,255,0.35)" }}>{b.wpm}</span>
              </div>
            ))}
          </div>
          <Button onClick={onStartBotRace} variant="primary" size="sm">Race Now ▶</Button>
        </div>
      </ModeCard>

      <ModeCard
        icon="🌐" title="Multiplayer Room" accent="#a855f7"
        description="Race real players online. Create a room and share the code, or join an existing race."
        selected={mode === GAME_MODES.MULTIPLAYER}
        onClick={() => onSelect(GAME_MODES.MULTIPLAYER)}
      >
        <div>
          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
            <Input
              value={roomId}
              onChange={e => onRoomIdChange(e.target.value)}
              placeholder="ROOM CODE"
              maxLength={6}
              style={{ letterSpacing: "0.25em" }}
            />
            <Button onClick={onJoinRoom} variant="dim" size="sm">Join</Button>
          </div>
          <Button onClick={onCreateRoom} variant="ghost" size="sm" fullWidth>+ Create Room</Button>
        </div>
      </ModeCard>

    </div>
  );
}

function hex2rgb(hex) {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ].join(",");
}