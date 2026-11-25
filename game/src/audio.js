// audio.js — every sound in the game, synthesized with WebAudio.
// No audio files: oscillators and filtered noise only, so the game stays
// fully offline and the dossier lists no audio assets.

export class SoundFX {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.musicOn = true;
    this.muted = false;
    this.musicTimer = null;
    this.sizzleNodes = null;
    this.musicStep = 0;
  }

  // Browsers only allow audio after a user gesture; call from one.
  unlock() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.5;
    this.master.connect(this.ctx.destination);
    this.startMusic();
  }

  setMuted(muted) {
    this.muted = muted;
    if (this.master) this.master.gain.value = muted ? 0 : 0.5;
  }

  tone(freq, dur, type = 'sine', vol = 0.25, when = 0, slideTo = null) {
    if (!this.ctx) return;
    const t0 = this.ctx.currentTime + when;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(g).connect(this.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  noise(dur, vol = 0.2, filterFreq = 1200, when = 0) {
    if (!this.ctx) return;
    const t0 = this.ctx.currentTime + when;
    const len = Math.max(1, Math.floor(this.ctx.sampleRate * dur));
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const f = this.ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = filterFreq;
    const g = this.ctx.createGain();
    g.gain.value = vol;
    src.connect(f).connect(g).connect(this.master);
    src.start(t0);
  }

  pickup() { this.tone(520, 0.09, 'triangle', 0.2, 0, 760); }
  place() { this.tone(330, 0.08, 'triangle', 0.18, 0, 240); }
  chop() { this.noise(0.07, 0.35, 900); this.tone(180, 0.06, 'square', 0.12); }
  chopDone() { this.tone(660, 0.1, 'triangle', 0.22); this.tone(880, 0.14, 'triangle', 0.2, 0.08); }
  grillDone() { this.tone(740, 0.12, 'sine', 0.22); this.tone(988, 0.16, 'sine', 0.2, 0.1); }
  serve() {
    this.tone(523, 0.12, 'triangle', 0.25);
    this.tone(659, 0.12, 'triangle', 0.25, 0.09);
    this.tone(784, 0.22, 'triangle', 0.28, 0.18);
  }
  coin() { this.tone(988, 0.09, 'sine', 0.2); this.tone(1319, 0.18, 'sine', 0.18, 0.07); }
  error() { this.tone(160, 0.18, 'sawtooth', 0.16, 0, 110); }
  expired() { this.tone(392, 0.15, 'triangle', 0.2, 0, 311); this.tone(311, 0.3, 'triangle', 0.2, 0.14); }
  click() { this.tone(700, 0.05, 'square', 0.1); }
  startShift() {
    [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.16, 'triangle', 0.22, i * 0.11));
  }
  shiftEnd() {
    [784, 659, 523, 392].forEach((f, i) => this.tone(f, 0.22, 'triangle', 0.22, i * 0.14));
  }

  // A looping grill hiss while at least one patty cooks.
  setSizzle(on) {
    if (!this.ctx) return;
    if (on && !this.sizzleNodes) {
      const len = this.ctx.sampleRate * 1;
      const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      const f = this.ctx.createBiquadFilter();
      f.type = 'highpass';
      f.frequency.value = 3000;
      const g = this.ctx.createGain();
      g.gain.value = 0.05;
      src.connect(f).connect(g).connect(this.master);
      src.start();
      this.sizzleNodes = { src, g };
    } else if (!on && this.sizzleNodes) {
      this.sizzleNodes.src.stop();
      this.sizzleNodes = null;
    }
  }

  // A soft plucked melody over a walking bass: I – vi – IV – V in C major.
  startMusic() {
    if (!this.ctx || this.musicTimer) return;
    const chords = [
      [261.6, 329.6, 392.0], // C
      [220.0, 261.6, 329.6], // Am
      [174.6, 220.0, 261.6], // F
      [196.0, 246.9, 293.7], // G
    ];
    const melody = [523, 0, 659, 784, 0, 659, 523, 0, 587, 0, 698, 880, 0, 784, 659, 0];
    this.musicTimer = setInterval(() => {
      if (!this.ctx || this.muted || !this.musicOn) return;
      const bar = Math.floor(this.musicStep / 4) % 4;
      const step = this.musicStep % 4;
      const chord = chords[bar];
      if (step === 0) chord.forEach((f) => this.tone(f, 1.6, 'sine', 0.045));
      const note = melody[this.musicStep % melody.length];
      if (note) this.tone(note, 0.5, 'triangle', 0.06);
      this.musicStep++;
    }, 420);
  }
}
