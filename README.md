# TypeRacer3D — client

A 3D typing race game: you type a text, your car moves down a real 3D track,
and you race bots, your own ghost, or other players online.

This is the **web client**. The multiplayer server lives in a separate
repository: [serverTypeRacer3D](https://github.com/Andri4nina/serverTypeRacer3D).

> **Not affiliated with TypeRacer.** This is an independent fan project,
> inspired by [typeracer.com](https://play.typeracer.com/). "TypeRacer" is a
> registered trademark of its owner. See [Trademark](#trademark) below.

---

## Features

**Typing engine**
- Strict error handling: a wrong character freezes your progress until you
  erase it with `Backspace`. No sliding past mistakes.
- WPM computed as `correct characters / (5 × minutes)`, on a clock that starts
  at "GO" and pauses when the game does.
- Accuracy as `correct keystrokes / total keystrokes`, floored so that 100 %
  only ever means a flawless run.
- Paste blocked at the `beforeinput` level — pasting the text would otherwise
  end the race instantly.
- Word streak: each word typed cleanly builds a combo that drives the visuals.

**3D**
- Seven vehicles: an open-wheel single-seater, a hypercar, a muscle car, a
  kart, an SUV, a pickup — all procedural — plus one glTF model.
- Three cameras: chase (pulls back with speed), broadcast (trackside crane),
  cockpit. Cycle with `Alt+C`.
- Field-of-view stretch and exhaust flames on a combo, nose dive, skid, brake
  lights and screen shake on a mistake.
- World-space labels above every car showing driver name and live WPM.
- Minimap across the top with every racer's position on the circuit.

**Audio**
- Fully synthesised with the Web Audio API — no sound files, no bundle weight.
- Mechanical keyboard clicks with four selectable switch profiles
  (Blue, Brown, Red, Topre), each keystroke slightly detuned.
- Engine drone whose pitch follows your live WPM.
- Tyre screech on mistakes and on `Backspace`. Mute with `Alt+M`.

**After the race**
- WPM-over-time curve, peak marker included.
- The words you actually stumbled on, ranked.
- Rank tiers from Rookie to Legend, XP and unlock progression.
- Ghost car: your best run on a given text is recorded and replayed, so you can
  race yourself. The "Ghost duel" button replays the same text.

**Modes**
- Solo time trial
- Bot race against up to seven AI opponents of calibrated speed
- Online rooms with a share code, live positions and rematch

---

## Stack

| | |
|---|---|
| Framework | React 19 |
| Build | Vite 7 |
| 3D | three.js, @react-three/fiber, @react-three/drei |
| Styling | Tailwind CSS 4 |
| Realtime | socket.io-client |

No state-management library: a single React context plus per-feature view
models.

---

## Getting started

Requires **Node.js 18+**.

```bash
npm install
```

Point the client at a server by creating a `.env.local` (see `.env.example`):

```bash
VITE_SERVER_URL=http://localhost:3001
```

Without it the client falls back to the hosted server. Then:

```bash
npm run dev
```

The app is served on <http://localhost:5173>. Solo and bot races work without
any server running; online rooms need
[serverTypeRacer3D](https://github.com/Andri4nina/serverTypeRacer3D).

Other scripts:

```bash
npm run build     # production bundle
npm run preview   # serve the built bundle
npm run lint      # eslint
```

---

## Keyboard

| Key | Action |
|---|---|
| `Backspace` | Erase — the only way out of a blocked mistake |
| `Alt` + `C` | Cycle camera |
| `Alt` + `M` | Mute / unmute |

Shortcuts require `Alt` on purpose: a bare letter would be swallowed by the
typing field and counted as a keystroke.

---

## Architecture

```
src/
├─ boot/                     bootstrap, pages, constants
│  ├─ constants/             bots, cars, cameras, texts, game modes
│  └─ pages/                 lobby, waiting room, race
├─ modules/<feature>/
│  ├─ View/                  components
│  └─ ViewModel/             feature logic as hooks
└─ shared/
   ├─ components/            icon set, procedural cars, HUD pieces
   ├─ contexts/              AppContext — socket, player, settings
   ├─ services/              socket, audio, stats persistence
   └─ utils/
```

Each feature owns its `View` / `ViewModel` pair; anything reused across
features moves to `shared/`.

Progress, scores, ghosts, XP and settings are stored in `localStorage` through
`shared/services/StatsService.js` — no component touches storage directly.

---

## Known limitations

Stated plainly rather than left to be discovered:

- **One track.** The unlock ladder names night and cyberpunk circuits; those
  environments are not built yet.
- **Unlocks are not enforced.** XP thresholds are displayed, but every car
  stays selectable regardless of progression.
- **No public matchmaking.** The server exposes a room listing, the client
  never calls it. Online play is invite-code only.
- **English texts only**, and the corpus is duplicated between client and
  server. No language or category selection.
- **No server-side anti-cheat.** The client reports its own WPM and the server
  trusts it. Paste is blocked client-side only.
- **No sound on mobile until first interaction** — a Web Audio constraint, not
  a bug.
- The main bundle is over 1 MB (three.js); it is not code-split yet.

---

## Trademark

"TypeRacer" is a registered US trademark of its owner. This project is an
independent, non-commercial fan work, is not affiliated with, endorsed by or
connected to TypeRacer or TR Software Inc., and does not reuse their code,
assets or branding. The name is used descriptively to say what the project is
inspired by. Happy to rename on request.

## License

[MIT](LICENSE).
