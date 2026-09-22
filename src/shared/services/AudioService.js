// ─────────────────────────────────────────────────────────────────────────────
// AudioService — tout est synthétisé à la volée en WebAudio.
// Aucun fichier son n'est embarqué : le bundle ne grossit pas et il n'y a
// aucune licence à gérer.
//
//   • clavier  : un clic court par touche, timbre réglable (switchs)
//   • moteur   : bourdon continu dont la hauteur suit le WPM instantané
//   • pneus    : bruit filtré pour les erreurs et le Backspace
// ─────────────────────────────────────────────────────────────────────────────

// Profils de switchs : fréquence du clic, longueur d'enveloppe, part de bruit.
export const SWITCH_PROFILES = {
  blue:   { label: 'Blue',   freq: 2600, decay: 0.045, noise: 0.55, click: 0.5, desc: 'Claquant / tactile' },
  brown:  { label: 'Brown',  freq: 1500, decay: 0.055, noise: 0.40, click: 0.3, desc: 'Sourd / feutré' },
  red:    { label: 'Red',    freq: 1900, decay: 0.030, noise: 0.25, click: 0.2, desc: 'Linéaire / discret' },
  topre:  { label: 'Topre',  freq: 1100, decay: 0.070, noise: 0.60, click: 0.1, desc: 'Grave / capacitif' },
}

export const SWITCH_IDS = Object.keys(SWITCH_PROFILES)

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi)

class AudioEngine {
  constructor() {
    this.ctx = null
    this.master = null
    this.engineNodes = null
    this.enabled = true
    this.volume = 0.6
    this.switchId = 'brown'
    this.noiseBuffer = null
  }

  // Le contexte ne peut être créé qu'après un geste utilisateur :
  // on l'instancie paresseusement au premier son demandé.
  ensure() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {})
      return this.ctx
    }
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return null

    this.ctx = new Ctx()
    this.master = this.ctx.createGain()
    this.master.gain.value = this.enabled ? this.volume : 0
    this.master.connect(this.ctx.destination)

    // Un buffer de bruit blanc réutilisé partout
    const len = Math.floor(this.ctx.sampleRate * 0.5)
    this.noiseBuffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate)
    const data = this.noiseBuffer.getChannelData(0)
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1

    return this.ctx
  }

  setEnabled(on) {
    this.enabled = on
    if (this.master) {
      this.master.gain.setTargetAtTime(on ? this.volume : 0, this.ctx.currentTime, 0.02)
    }
    if (!on) this.stopEngine()
  }

  setVolume(v) {
    this.volume = clamp(v, 0, 1)
    if (this.master && this.enabled) {
      this.master.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.02)
    }
  }

  setSwitch(id) {
    if (SWITCH_PROFILES[id]) this.switchId = id
  }

  // ── Clic de touche ────────────────────────────────────────────────────────
  // Deux couches : un court burst de bruit filtré (la tige) + une sinusoïde
  // très brève (le contact). Le mélange fait le caractère du switch.
  key({ wrong = false } = {}) {
    const ctx = this.ensure()
    if (!ctx || !this.enabled) return
    const p = SWITCH_PROFILES[this.switchId] ?? SWITCH_PROFILES.brown
    const t = ctx.currentTime
    const detune = 0.92 + Math.random() * 0.16 // aucune frappe n'est identique

    const out = ctx.createGain()
    out.gain.value = 0.35
    out.connect(this.master)

    // Couche bruit
    const noise = ctx.createBufferSource()
    noise.buffer = this.noiseBuffer
    noise.loop = true
    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = p.freq * detune
    bp.Q.value = 1.2
    const ng = ctx.createGain()
    ng.gain.setValueAtTime(p.noise, t)
    ng.gain.exponentialRampToValueAtTime(0.001, t + p.decay)
    noise.connect(bp).connect(ng).connect(out)
    noise.start(t)
    noise.stop(t + p.decay + 0.02)

    // Couche contact
    if (p.click > 0.01) {
      const osc = ctx.createOscillator()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(p.freq * 0.5 * detune, t)
      osc.frequency.exponentialRampToValueAtTime(p.freq * 0.22, t + p.decay)
      const og = ctx.createGain()
      og.gain.setValueAtTime(p.click * 0.5, t)
      og.gain.exponentialRampToValueAtTime(0.001, t + p.decay * 0.8)
      osc.connect(og).connect(out)
      osc.start(t)
      osc.stop(t + p.decay + 0.02)
    }

    // Une faute sonne plus bas et plus mat
    if (wrong) {
      const osc = ctx.createOscillator()
      osc.type = 'square'
      osc.frequency.setValueAtTime(150, t)
      osc.frequency.exponentialRampToValueAtTime(70, t + 0.12)
      const og = ctx.createGain()
      og.gain.setValueAtTime(0.16, t)
      og.gain.exponentialRampToValueAtTime(0.001, t + 0.14)
      osc.connect(og).connect(this.master)
      osc.start(t)
      osc.stop(t + 0.16)
    }
  }

  // ── Crissement de pneus ───────────────────────────────────────────────────
  skid(intensity = 1) {
    const ctx = this.ensure()
    if (!ctx || !this.enabled) return
    const t = ctx.currentTime
    const dur = 0.22 * intensity

    const noise = ctx.createBufferSource()
    noise.buffer = this.noiseBuffer
    noise.loop = true

    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.setValueAtTime(1800, t)
    bp.frequency.exponentialRampToValueAtTime(900, t + dur)
    bp.Q.value = 6

    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.28 * intensity, t + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)

    noise.connect(bp).connect(g).connect(this.master)
    noise.start(t)
    noise.stop(t + dur + 0.05)
  }

  // ── Moteur ────────────────────────────────────────────────────────────────
  startEngine() {
    const ctx = this.ensure()
    if (!ctx || !this.enabled || this.engineNodes) return

    const t = ctx.currentTime
    const out = ctx.createGain()
    out.gain.setValueAtTime(0.0001, t)
    out.gain.exponentialRampToValueAtTime(0.10, t + 0.6)

    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 900
    lp.Q.value = 0.8

    // Deux dents de scie légèrement désaccordées + une sous-octave :
    // ça suffit à évoquer un moteur sans échantillon.
    const oscs = [
      { type: 'sawtooth', ratio: 1,    gain: 0.5 },
      { type: 'sawtooth', ratio: 1.01, gain: 0.35 },
      { type: 'square',   ratio: 0.5,  gain: 0.25 },
    ].map(spec => {
      const osc = ctx.createOscillator()
      osc.type = spec.type
      osc.frequency.value = 60 * spec.ratio
      const g = ctx.createGain()
      g.gain.value = spec.gain
      osc.connect(g).connect(lp)
      osc.start(t)
      return { osc, ratio: spec.ratio }
    })

    lp.connect(out).connect(this.master)
    this.engineNodes = { oscs, out, lp }
  }

  // wpm → hauteur. Le ralenti tourne vers 60 Hz, le plein régime vers 260 Hz.
  setEngineRpm(wpm = 0) {
    if (!this.engineNodes || !this.ctx) return
    const t = this.ctx.currentTime
    const norm = clamp(wpm / 160, 0, 1.25)
    const base = 55 + norm * 190
    this.engineNodes.oscs.forEach(({ osc, ratio }) => {
      osc.frequency.setTargetAtTime(base * ratio, t, 0.12)
    })
    this.engineNodes.lp.frequency.setTargetAtTime(600 + norm * 2200, t, 0.15)
  }

  stopEngine() {
    if (!this.engineNodes || !this.ctx) return
    const { oscs, out } = this.engineNodes
    const t = this.ctx.currentTime
    out.gain.setTargetAtTime(0.0001, t, 0.15)
    oscs.forEach(({ osc }) => { try { osc.stop(t + 0.6) } catch { /* déjà arrêté */ } })
    this.engineNodes = null
  }

  // ── Jingles ───────────────────────────────────────────────────────────────
  beep(freq = 440, dur = 0.18, type = 'square', gain = 0.22) {
    const ctx = this.ensure()
    if (!ctx || !this.enabled) return
    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    osc.type = type
    osc.frequency.value = freq
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(gain, t + 0.01)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    osc.connect(g).connect(this.master)
    osc.start(t)
    osc.stop(t + dur + 0.02)
  }

  countdownTick(isGo = false) {
    if (isGo) {
      this.beep(880, 0.5, 'sawtooth', 0.3)
      setTimeout(() => this.beep(1320, 0.4, 'sawtooth', 0.2), 60)
    } else {
      this.beep(440, 0.16, 'square', 0.22)
    }
  }

  finishFanfare() {
    const notes = [523, 659, 784, 1047]
    notes.forEach((f, i) => setTimeout(() => this.beep(f, 0.3, 'triangle', 0.25), i * 110))
  }
}

const audio = new AudioEngine()
export default audio
