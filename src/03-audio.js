// ============================================================ AUDIO
// Every sound and note is synthesised with Web Audio (spec §15). prerender() bakes every one-shot, sample, loop,
// voice blip, song stem and the early music cues into AudioBuffers with OfflineAudioContext while the loader runs;
// the other cues bake in the background straight after (or the moment they're asked for), and the song "two" bakes
// lazily per pattern (AUDIO.bakeSong). At runtime we only start buffer sources. Buses: music / sfx / voice ->
// master -> soft limiter, volumes from `options`. Before init() (the first YES) every call is a silent no-op.
//
// Public API (globals): sfx(name, o), music(cue, o), music.silence(on), AUDIO.*: see the AUDIO object at the end.
// "two" (spec §15.3): AUDIO.song({ pattern, from, to, muffled, bleed, speaker, gain, fade, coda, onEnd }) -> handle
//   { t, duration, section, sectionAt(t), stop(fade), ready, done }; AUDIO.bakeSong(pattern) -> Promise<AudioBuffer>;
//   AUDIO.seq.play(pattern, samples, onStep, { section, muffled }) / .stop() / .section(name) for the 2.10 sequencer;
//   AUDIO.TWO = the song's data (sections, chords, leads, lanes) for charts and the sequencer UI.
// state.pattern = { lanes: [sampleId|null x4], steps: [[bool x16] x4], lead?: [bool x16|x64], bridge: 'laugh' }.
//   Lane roles by index: 0 hats, 1 snare, 2 texture, 3 chords. Missing lane samples play synth bleeps.

// The real recordings, if anyone ever makes them (spec §15.4): base64 data URIs ('data:audio/...;base64,...').
// Empty = the synthesised versions. Filled = decoded at boot and used everywhere instead (sfx('smp_laugh'), the lures,
// the bridge of "two", AUDIO.laugh(), AUDIO.voicemail()).
const LAUGH_CLIP = '';      // Luka (laughing), 2-3 s
const VOICEMAIL_CLIP = '';  // "Hey, it's Luka. I'm probably at work. Leave a message. Chase, if it's you, I'm not doing your shift."

const { AUDIO, sfx, music } = (() => {
  const SR = 44100, MR = 32000;                 // one-shots + voices, music + loops + song
  const rnd = Math.random, mtof = (m) => 440 * Math.pow(2, (m - 69) / 12), R12 = (n) => Math.pow(2, n / 12);
  const B = {}, L = {}, M = {}, V = {}, S = {};  // one-shots, loops, music cues, voices, song stems
  let WHITE, BROWN, DROPS, DRIPS, CRACKLE, DIST;
  let ctx = null, master, busM, busS, busV, muffleF, sendRoom, sendWet, sendSlap, ducked = false, silenced = false;
  // rooms (AUDIO.setRoom): [room send, wet send, slapback send, indoors (the rain bed is muffled)]
  const ROOMS = { none: [0, 0, 0, 0], room: [0.25, 0, 0, 1], small: [0.2, 0, 0, 1], carriage: [0.22, 0, 0, 1], hall: [0.12, 0.24, 0, 1],
    atrium: [0.1, 0.3, 0, 1], wet: [0, 0.35, 0, 0], lane: [0.04, 0, 0.3, 0] };
  const stats = { ms: {}, failed: [] };
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  // ---------------------------------------------------------- periodic waves (Fourier tables, one PeriodicWave per context)
  const fourier = (n, fn) => { const re = new Float32Array(n), im = new Float32Array(n); for (let k = 1; k < n; k++) im[k] = fn(k); return [re, im]; };
  const WAVES = {
    pulse: fourier(40, (n) => 2 * Math.sin(n * Math.PI * 0.125) / (n * Math.PI)),   // 12.5% pulse (Rue's 'pulse' voice)
    pulse25: fourier(40, (n) => 2 * Math.sin(n * Math.PI * 0.25) / (n * Math.PI)),  // 25% pulse: the chiptune lead
    warm: [new Float32Array(8), Float32Array.of(0, 1, 0.5, 0.3, 0.18, 0.1, 0.06, 0.03)], // a sine with a little body (Rue's 'sine' voices)
    glot: fourier(48, (n) => Math.pow(n, -1.25) * (n % 2 ? 1 : 0.85)),               // a voice-like glottal buzz (the laugh, the hum)
    reed: fourier(24, (n) => (n % 2 ? 1 / n : 0.35 / n)),                             // hollow-ish: muzak vibes, accordion-y radio
  };
  const PWC = new WeakMap();
  function pw(c, k) { let m = PWC.get(c); if (!m) PWC.set(c, (m = {})); return m[k] || (m[k] = c.createPeriodicWave(WAVES[k][0], WAVES[k][1])); }

  // ---------------------------------------------------------- synth toolkit (works on any BaseAudioContext)
  // Envelope: 0 -> v over a, decay toward v*s (time constant d), release after dur (r ~ time to silence).
  function env(p, t, dur, o) {
    const v = o.v ?? 0.3, a = o.a ?? 0.004, r = o.r ?? 0.03, hold = Math.max(dur, a);
    p.setValueAtTime(0, t);
    p.linearRampToValueAtTime(v, t + a);
    if (o.d) p.setTargetAtTime(v * (o.s ?? 0), t + a, o.d);
    p.setTargetAtTime(0, t + hold, r / 4);
    return t + hold + r + 0.02; // stop time
  }
  // Optional filter in front of dest: o.lp | o.hp | o.bp, o.q, swept to o.fto over o.fgl.
  function filt(c, dest, o, t, dur) {
    const fr = o.lp || o.hp || o.bp;
    if (!fr) return dest;
    const f = c.createBiquadFilter();
    f.type = o.lp ? 'lowpass' : o.hp ? 'highpass' : 'bandpass';
    f.Q.value = o.q ?? (o.bp ? 2 : 0.7);
    f.frequency.setValueAtTime(fr, t);
    if (o.fto) f.frequency.exponentialRampToValueAtTime(o.fto, t + (o.fgl ?? dur));
    f.connect(dest);
    return f;
  }
  function lfo(c, param, rate, depth, t = 0, end = 0, type = 'sine') {
    const l = c.createOscillator(), g = c.createGain();
    l.type = type; l.frequency.value = rate; g.gain.value = depth;
    l.connect(g); g.connect(param); l.start(t); if (end) l.stop(end);
    return l;
  }
  // Oscillator note: o.type | o.wave (PeriodicWave or a WAVES key), o.to (glide target over o.gl), o.det cents, o.vib [Hz, cents, delay].
  function tone(c, d, t, f, dur, o = {}) {
    const os = c.createOscillator(), g = c.createGain();
    if (o.wave) os.setPeriodicWave(typeof o.wave === 'string' ? pw(c, o.wave) : o.wave); else os.type = o.type || 'sine';
    os.frequency.setValueAtTime(f, t);
    if (o.to) os.frequency.exponentialRampToValueAtTime(o.to, t + (o.gl ?? dur));
    if (o.det) os.detune.value = o.det;
    const end = env(g.gain, t, dur, o);
    if (o.vib) lfo(c, os.detune, o.vib[0], o.vib[1], t + (o.vib[2] || 0), end);
    os.connect(filt(c, g, o, t, dur)); g.connect(d);
    os.start(t); os.stop(end);
  }
  // Filtered noise (white, o.brown, or any looped texture in o.buf).
  function noise(c, d, t, dur, o = {}) {
    const s = c.createBufferSource(), g = c.createGain();
    s.buffer = o.buf || (o.brown ? BROWN : WHITE); s.loop = true;
    const end = env(g.gain, t, dur, o);
    s.connect(filt(c, g, o, t, dur)); g.connect(d);
    s.start(t, rnd() * 1.5); s.stop(end);
  }
  // Two-operator FM: o.ratio, o.index (x f), index decays to o.isus with time constant o.md.
  function fm(c, d, t, f, dur, o = {}) {
    const car = c.createOscillator(), mod = c.createOscillator(), mg = c.createGain(), g = c.createGain(), I = f * (o.index ?? 2);
    car.frequency.value = f; mod.frequency.value = f * (o.ratio ?? 1);
    mg.gain.setValueAtTime(I, t); mg.gain.setTargetAtTime(I * (o.isus ?? 0.1), t, o.md ?? 0.3);
    mod.connect(mg); mg.connect(car.frequency);
    const end = env(g.gain, t, dur, o);
    if (o.vib) lfo(c, car.detune, o.vib[0], o.vib[1], t, end);
    car.connect(filt(c, g, o, t, dur)); g.connect(d);
    car.start(t); mod.start(t); car.stop(end); mod.stop(end);
  }
  // Detuned oscillator stack through one low-pass (pads, stabs). o.wob / o.lfoF: LFO outputs for pitch / cutoff.
  function chord(c, d, t, notes, dur, o = {}) {
    const f = c.createBiquadFilter(), g = c.createGain();
    f.type = 'lowpass'; f.frequency.value = o.lp ?? 1200; f.Q.value = o.q ?? 0.6;
    if (o.lfoF) o.lfoF.connect(f.detune);
    const end = env(g.gain, t, dur, { v: o.v ?? 0.05, a: o.a ?? 0.3, d: o.d, s: o.s, r: o.r ?? 0.8 });
    f.connect(g); g.connect(d);
    for (const m of notes) for (const cents of (o.det || [-8, 8])) {
      const os = c.createOscillator();
      if (o.wave) os.setPeriodicWave(pw(c, o.wave)); else os.type = o.type || 'sawtooth';
      os.frequency.value = mtof(m); os.detune.value = cents;
      if (o.wob) o.wob.connect(os.detune);
      os.connect(f); os.start(t + rnd() * 0.01); os.stop(end);
    }
  }
  function lfoOut(c, rate, depth, t = 0) { // a shared LFO signal to connect into several params
    const l = c.createOscillator(), g = c.createGain();
    l.frequency.value = rate; g.gain.value = depth; l.connect(g); l.start(t);
    return g;
  }
  function band(c, d, lo, hi) { // high-pass + low-pass, returns the input
    const h = c.createBiquadFilter(), l = c.createBiquadFilter();
    h.type = 'highpass'; h.frequency.value = lo; l.type = 'lowpass'; l.frequency.value = hi;
    h.connect(l); l.connect(d);
    return h;
  }
  function bp(c, f, q) { const n = c.createBiquadFilter(); n.type = 'bandpass'; n.frequency.value = f; n.Q.value = q; return n; }
  function peak(c, d, f, gain, q = 1) { const n = c.createBiquadFilter(); n.type = 'peaking'; n.frequency.value = f; n.gain.value = gain; n.Q.value = q; n.connect(d); return n; }
  function gn(c, d, v) { const g = c.createGain(); g.gain.value = v; g.connect(d); return g; }
  // Generated impulse: decaying noise that darkens as it decays (damp 0..1).
  const IR = {};
  function impulse(rate, sec, damp, ch = 1) {
    const k = rate + ':' + sec + ':' + damp + ':' + ch;
    if (IR[k]) return IR[k];
    const n = Math.round(rate * sec), b = new AudioBuffer({ length: n, sampleRate: rate, numberOfChannels: ch }), R = rng(n * 7 + ch);
    for (let j = 0; j < ch; j++) {
      const a = b.getChannelData(j);
      let y = 0;
      for (let i = 0; i < n; i++) {
        const x = i / n, k2 = damp * x;
        y = y * k2 + (R() * 2 - 1) * (1 - k2);
        a[i] = y * Math.exp(-6.9 * x) * Math.min(1, i / (rate * 0.004));
      }
    }
    return (IR[k] = b);
  }
  function rev(c, d, sec, mix, damp = 0.6) { // dry + convolver send; returns the input
    const inp = c.createGain(), cv = c.createConvolver(), w = c.createGain();
    cv.buffer = impulse(c.sampleRate, sec, damp); w.gain.value = mix;
    inp.connect(d); inp.connect(cv); cv.connect(w); w.connect(d);
    return inp;
  }
  // A baked buffer placed in a recipe (or played live): gain v, rate, from offset `off`, gated after `dur` s with a
  // `rel` fade, faded in over `fin`. Shared by the song (offline and live), the cues and the strums.
  function hit(c, d, b, t, v = 1, rate = 1, off = 0, dur = 0, rel = 0.04, fin = 0) {
    if (!b) return;
    const s = c.createBufferSource(); s.buffer = b;
    if (rate !== 1) s.playbackRate.value = rate;
    let n = d;
    if (v !== 1 || dur || fin) {
      const g = c.createGain(); n = g; g.connect(d);
      if (fin) { g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + fin); } else g.gain.value = v;
      if (dur) { g.gain.setValueAtTime(v, t + Math.max(dur, fin)); g.gain.linearRampToValueAtTime(0, t + Math.max(dur, fin) + rel); }
    }
    s.connect(n); s.start(t, off);
    if (dur) s.stop(t + Math.max(dur, fin) + rel + 0.01);
  }

  // ---------------------------------------------------------- instruments and recipe parts (Rue's, then TWO's)
  const kick = (c, d, t, v = 0.7) => tone(c, d, t, 140, 0.25, { to: 42, gl: 0.1, v, a: 0.002, d: 0.09, r: 0.05 });
  function snare(c, d, t, v = 0.25) {
    noise(c, d, t, 0.18, { v, a: 0.001, d: 0.05, bp: 2000, q: 0.7 });
    tone(c, d, t, 210, 0.08, { to: 150, v: v * 0.7, a: 0.001, d: 0.03 });
  }
  const hat = (c, d, t, v = 0.05, open) => noise(c, d, t, open ? 0.25 : 0.04, { v, a: 0.001, d: open ? 0.07 : 0.012, hp: 7500 });
  const pluck = (c, d, t, m, v = 0.06, lp = 1800) => tone(c, d, t, mtof(m), 0.1, { type: 'square', v, a: 0.002, d: 0.05, r: 0.03, lp, fto: 300, fgl: 0.08 });
  function marimba(c, d, t, m, dur, v = 0.14) {
    tone(c, d, t, mtof(m), dur, { v, a: 0.002, d: 0.25, r: 0.1 });
    tone(c, d, t, mtof(m) * 4, 0.1, { v: v * 0.4, a: 0.001, d: 0.04 });
  }
  const piano = (c, d, t, m, v = 0.1) => fm(c, d, t, mtof(m), 3, { ratio: 1, index: 1.6, md: 0.25, isus: 0.08, v, a: 0.003, d: 1.3, r: 0.5 });
  const bassN = (c, d, t, m, dur, v = 0.3, lp = 700) => { tone(c, d, t, mtof(m), dur, { type: 'triangle', v, a: 0.004, d: 0.4, s: 0.4, r: 0.08, lp }); tone(c, d, t, mtof(m), dur, { v: v * 0.5, a: 0.004, d: 0.4, s: 0.4, r: 0.08 }); };
  const BELL = [[0.5, 1, 1], [1, 0.8, 0.6], [1.19, 0.55, 0.45], [1.5, 0.4, 0.35], [2, 0.35, 0.25], [2.5, 0.25, 0.18]]; // ratio, level, decay share
  function bell(c, d, t, f, v, len = 8) { // Campanile: inharmonic partials, 8 s on the hum
    for (const [r, a, k] of BELL) {
      tone(c, d, t, f * r, len * k, { v: v * a, a: 0.002, d: len * k / 4, r: 0.2 });
      tone(c, d, t, f * r * 1.003, len * k, { v: v * a * 0.4, a: 0.002, d: len * k / 4, r: 0.2 });
    }
    noise(c, d, t, 0.02, { v: v * 0.4, a: 0.0005, d: 0.006, hp: 2500 });
  }
  function whistle(c, d, t, f, dur, v = 0.28) { // tin whistle: sine, gentle vibrato, a breath of noise
    tone(c, d, t, f, dur, { v, a: 0.025, d: 0.25, s: 0.65, r: 0.08, vib: [5.5, 14] });
    tone(c, d, t, f * 2, dur, { v: v * 0.12, a: 0.025, d: 0.25, s: 0.5, r: 0.06 });
    noise(c, d, t, dur * 0.8, { v: v * 0.12, a: 0.01, d: 0.08, s: 0.35, r: 0.05, bp: f * 2, q: 1 });
    noise(c, d, t, 0.02, { v: v * 0.2, a: 0.001, d: 0.012, bp: 3000, q: 1 });
  }
  function kclick(c, d, t, v) {
    noise(c, d, t, 0.03, { v, a: 0.0005, d: 0.01, hp: 5500 });
    tone(c, d, t, 3400, 0.01, { v: v * 0.15, a: 0.0005, d: 0.005 });
    tone(c, d, t, 1100, 0.01, { v: v * 0.1, a: 0.0005, d: 0.004 });
  }
  function twang(c, d, t, v) {
    tone(c, d, t, 196, 0.6, { type: 'sawtooth', to: 174, gl: 0.5, v, a: 0.002, d: 0.16, r: 0.1, lp: 3200, fto: 350, fgl: 0.45, vib: [11, 35] });
    tone(c, d, t, 98, 0.4, { v: v * 0.6, a: 0.002, d: 0.12, r: 0.1 });
  }
  function siren(c, d, t, dur, v) { // 700/950 Hz square, alternating every 0.25 s (Rue's display alarm)
    const os = c.createOscillator(), f = c.createBiquadFilter(), g = c.createGain();
    os.type = 'square'; f.type = 'lowpass'; f.frequency.value = 3000;
    for (let k = 0; k * 0.25 < dur + 0.3; k++) os.frequency.setValueAtTime(k % 2 ? 950 : 700, t + k * 0.25);
    const end = env(g.gain, t, dur, { v, a: 0.004, r: 0.02 });
    os.connect(f); f.connect(g); g.connect(d); os.start(t); os.stop(end);
  }
  function brickRing(c, d, t) { // harsh C-E-G square arpeggio, slightly distorted (Rue's brick phone)
    const sh = c.createWaveShaper(), f = c.createBiquadFilter(), g = c.createGain();
    sh.curve = DIST; f.type = 'lowpass'; f.frequency.value = 4500;
    const end = env(g.gain, t, 0.92, { v: 0.12, a: 0.003, r: 0.02 });
    for (const det of [0, 14]) {
      const os = c.createOscillator(); os.type = 'square'; os.detune.value = det;
      for (let k = 0; k < 28; k++) os.frequency.setValueAtTime([1047, 1319, 1568][k % 3], t + k * 0.034);
      os.connect(sh); os.start(t); os.stop(end);
    }
    sh.connect(f); f.connect(g); g.connect(d);
  }
  function creak(c, d, t) { // old wooden door: stick-slip sawtooth through two wood resonances
    const os = c.createOscillator(), f1 = bp(c, 750, 6), f2 = bp(c, 1600, 8), am = c.createGain(), g = c.createGain();
    os.type = 'sawtooth';
    os.frequency.setValueAtTime(70, t); os.frequency.linearRampToValueAtTime(130, t + 0.35);
    os.frequency.linearRampToValueAtTime(85, t + 0.7); os.frequency.linearRampToValueAtTime(115, t + 1);
    am.gain.value = 0.5; lfo(c, am.gain, 23, 0.5, t, t + 1.3, 'square');
    const end = env(g.gain, t, 1, { v: 1.2, a: 0.08, r: 0.2 });
    os.connect(f1); os.connect(f2); f1.connect(am); f2.connect(am); am.connect(g); g.connect(d);
    os.start(t); os.stop(end);
  }
  function fluoro(c, d, t, dur, v, flick) { // tube buzz; flickers on/off inside the [from, to] windows
    const g = c.createGain(); g.connect(d);
    g.gain.setValueAtTime(v, t);
    for (const [a, b] of flick) {
      for (let x = t + a; x < t + b; x += 0.03 + rnd() * 0.09) {
        const on = rnd() < 0.5;
        g.gain.setValueAtTime(on ? v : v * 0.05, x);
        if (on) noise(c, d, x, 0.004, { v: v * 0.6, a: 0.0005, d: 0.002, hp: 2500 });
      }
      g.gain.setValueAtTime(v, t + b);
    }
    tone(c, g, t, 100, dur, { type: 'sawtooth', v: 1, a: 0.01, r: 0.01, lp: 1200 });
    tone(c, g, t, 200, dur, { type: 'square', v: 0.15, a: 0.01, r: 0.01, hp: 3000 });
  }
  function type1(c, d, t, v) {
    noise(c, d, t, 0.012, { v, a: 0.0005, d: 0.005, bp: 2500 + rnd() * 1000, q: 1 });
    tone(c, d, t, 160, 0.03, { v: v * 0.6, a: 0.001, d: 0.012 });
  }
  // Speech-like babble (never words): buzz + breath through two formant filters that jump per syllable.
  // o.voiced 0 = a whisper (breath only).
  const VOW = [[730, 1090], [530, 1840], [300, 2250], [570, 840], [440, 1020], [660, 1700]];
  function babble(c, d, t0, dur, o) {
    const src = c.createOscillator(), nz = c.createBufferSource(), ng = c.createGain(), sg = c.createGain(), f1 = bp(c, 500, 6), f2 = bp(c, 1500, 8), g = c.createGain();
    src.type = 'sawtooth'; src.frequency.value = o.f || 150; sg.gain.value = o.voiced ?? 1;
    lfo(c, src.detune, o.wob ?? 0.6, o.wobc ?? 30, t0, t0 + dur);
    nz.buffer = WHITE; nz.loop = true; ng.gain.value = o.breath ?? 0.25;
    g.gain.value = 0;
    src.connect(sg); sg.connect(f1); sg.connect(f2); nz.connect(ng); ng.connect(f1); ng.connect(f2);
    f1.connect(g); f2.connect(g); g.connect(d);
    const syl = o.fast ? 0.07 : 0.1, end = t0 + dur - 0.15;
    for (let t = t0 + 0.05; t < end;) {
      for (let n = 2 + (rnd() * 6 | 0); n > 0 && t < end; n--) {
        const sl = syl + rnd() * syl, w = VOW[rnd() * VOW.length | 0];
        f1.frequency.setTargetAtTime(w[0], t, 0.02); f2.frequency.setTargetAtTime(w[1], t, 0.02);
        src.frequency.setTargetAtTime((o.f || 150) * (0.88 + rnd() * 0.3), t, 0.04);
        g.gain.setTargetAtTime(o.v * (0.6 + rnd() * 0.4), t, 0.012);
        g.gain.setTargetAtTime(0, t + sl * 0.75, 0.02);
        t += sl;
      }
      t += (o.fast ? 0.12 : 0.2) + rnd() * 0.35;
    }
    src.start(t0); nz.start(t0, rnd()); src.stop(t0 + dur); nz.stop(t0 + dur);
  }
  function crowdGroan(c, d, t) {
    const f1 = bp(c, 650, 5), f2 = bp(c, 1050, 6), g = c.createGain();
    f1.connect(g); f2.connect(g); g.connect(d);
    const end = env(g.gain, t, 1.1, { v: 0.5, a: 0.2, r: 0.4 });
    for (let k = 0; k < 5; k++) {
      const os = c.createOscillator(), f = 120 + rnd() * 110;
      os.type = 'sawtooth'; os.frequency.setValueAtTime(f, t); os.frequency.exponentialRampToValueAtTime(f * 0.78, t + 1.2);
      os.connect(f1); os.connect(f2); os.start(t + rnd() * 0.08); os.stop(end);
    }
  }
  function crowdTitter(c, d, t) {
    const f = bp(c, 1300, 1.5); f.connect(d);
    for (let p = 0; p < 3; p++) {
      const f0 = 280 + rnd() * 240, t0 = t + rnd() * 0.3;
      for (let k = 0; k < 5; k++) tone(c, f, t0 + k * (0.1 + rnd() * 0.03), f0 * (1 - k * 0.03), 0.05, { type: 'triangle', to: f0 * 0.85, v: 0.35, a: 0.006, d: 0.03, r: 0.02 });
    }
  }
  function clockTick(c, d, t, f) {
    noise(c, d, t, 0.006, { v: 0.35, a: 0.0005, d: 0.003, bp: f, q: 3 });
    tone(c, d, t, f * 0.7, 0.015, { v: 0.06, a: 0.0005, d: 0.006 });
  }
  // ---- TWO's instruments
  function glass(c, d, t, n, spread, v) { // tinkles: inharmonic pings, denser at the start (the BAM, the display)
    for (let k = 0; k < n; k++) {
      const x = Math.pow(rnd(), 1.7), at = t + x * spread, f = 2400 + rnd() * 4300, vv = v * (1 - x * 0.7) * (0.4 + rnd() * 0.6);
      tone(c, d, at, f, 0.01, { v: vv, a: 0.0005, d: 0.03 + rnd() * 0.1, r: 0.06 });
      tone(c, d, at, f * 2.76, 0.01, { v: vv * 0.4, a: 0.0005, d: 0.025, r: 0.03 });
      if (rnd() < 0.5) noise(c, d, at, 0.004, { v: vv * 1.5, a: 0.0003, d: 0.002, hp: 5000 });
    }
  }
  const fmBell = (c, d, t, m, dur, v, ratio = 3.5) => { fm(c, d, t, mtof(m), dur, { ratio, index: 0.9, md: 0.2, isus: 0.05, v, a: 0.002, d: dur / 3, r: dur / 2 }); tone(c, d, t, mtof(m) * 2, dur * 0.4, { v: v * 0.25, a: 0.002, d: dur / 8, r: 0.1 }); };
  const epiano = (c, d, t, m, dur, v = 0.05) => fm(c, d, t, mtof(m), dur, { ratio: 1, index: 1.1, md: 0.35, isus: 0.12, v, a: 0.004, d: 0.9, s: 0.25, r: 0.25, vib: [5, 4] });
  const vibes = (c, d, t, m, dur, v = 0.08) => { const g = gn(c, d, 0.75); lfo(c, g.gain, 5.2, 0.25, t, t + dur + 1.2); tone(c, g, t, mtof(m), dur, { v, a: 0.004, d: 0.6, s: 0.4, r: 0.6 }); tone(c, g, t, mtof(m) * 4, 0.15, { v: v * 0.2, a: 0.002, d: 0.05 }); };
  const chipLead = (c, d, t, m, dur, v = 0.05, w = 'pulse25') => tone(c, d, t, mtof(m), dur, { wave: w, v, a: 0.003, d: 0.2, s: 0.7, r: 0.04, vib: [6, 12, 0.12] });
  const tri = (c, d, t, m, dur, v = 0.15, lp = 0) => tone(c, d, t, mtof(m), dur, { type: 'triangle', v, a: 0.004, d: 0.3, s: 0.6, r: 0.05, lp });
  function nkick(c, d, t, v = 0.5) { tone(c, d, t, 150, 0.12, { to: 48, gl: 0.08, v, a: 0.001, d: 0.06 }); noise(c, d, t, 0.01, { v: v * 0.3, a: 0.0005, d: 0.004, lp: 3000 }); } // chiptune kick
  const nsnare = (c, d, t, v = 0.2) => noise(c, d, t, 0.12, { v, a: 0.001, d: 0.04, hp: 1500 });
  function clap(c, d, t, v = 0.2) { for (const s of [0, 0.011, 0.022]) noise(c, d, t + s, 0.012, { v: v * 0.7, a: 0.0005, d: 0.006, bp: 1300, q: 1 }); noise(c, d, t + 0.03, 0.12, { v: v * 0.5, a: 0.001, d: 0.04, bp: 1300, q: 1 }); }
  function shaker(c, d, t, v = 0.03) { noise(c, d, t, 0.05, { v, a: 0.012, d: 0.02, hp: 6000 }); }
  function jingle(c, d, t, v = 0.05) { // sleigh bells: a few tiny inharmonic jingles + a shake of noise
    for (let k = 0; k < 4; k++) { const f = 4200 + rnd() * 2600, s = t + k * 0.006 + rnd() * 0.01; tone(c, d, s, f, 0.01, { v: v * 0.5, a: 0.001, d: 0.04, r: 0.05 }); tone(c, d, s, f * 1.41, 0.01, { v: v * 0.25, a: 0.001, d: 0.03, r: 0.03 }); }
    noise(c, d, t, 0.06, { v: v * 0.8, a: 0.002, d: 0.025, hp: 7000 });
  }
  function crash(c, d, t, v = 0.12) { noise(c, d, t, 1.6, { v, a: 0.002, d: 0.6, s: 0.2, r: 0.8, hp: 4500 }); noise(c, d, t, 0.3, { v: v * 0.6, a: 0.002, d: 0.1, bp: 3000, q: 0.6 }); }
  function hum(c, d, t, m, dur, v = 0.05, vib = 1, det = 0) { // a hummed "mm": warm buzz, closed-mouth low-pass, gentle vibrato
    const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 700; f.Q.value = 0.8;
    const pk = peak(c, d, 260, 6, 1.2); f.connect(pk);
    tone(c, f, t, mtof(m), dur, { wave: 'glot', det, v, a: 0.18, d: 0.6, s: 0.8, r: 0.3, vib: [5, 12 * vib, 0.25] });
  }
  // Karplus-Strong plucked string, computed in JS (a feedback DelayNode can't go under one render quantum, so the
  // ukulele's high strings can't be done in the graph). Fractional-delay all-pass keeps it in tune. Cached per note.
  const KSC = {};
  function ks(m, sec = 1.6, t60 = 1.1, bright = 0.55) {
    const k = m + ':' + sec + ':' + t60 + ':' + bright;
    if (KSC[k]) return KSC[k];
    const sr = SR, f = mtof(m), n = Math.round(sec * sr), out = new Float32Array(n), Lp = sr / f - 0.5, N = Math.floor(Lp), fr = Lp - N, C = (1 - fr) / (1 + fr);
    const line = new Float32Array(N), R = rng(m * 131 + 7), dec = Math.pow(0.001, 1 / (t60 * f));
    let p = 0;
    for (let i = 0; i < N; i++) { p += ((R() * 2 - 1) - p) * bright; line[i] = p; }  // the pick: a softened noise burst
    let j = 0, prev = 0, ax = 0, ay = 0;
    for (let i = 0; i < n; i++) {
      const s = line[j], lp = 0.5 * (s + prev); prev = s;
      const ap = C * lp + ax - C * ay; ax = lp; ay = ap;
      line[j] = dec * ap; out[i] = s * Math.min(1, i / 40); j = j + 1 === N ? 0 : j + 1;
    }
    for (let i = 0, fade = Math.round(0.08 * sr); i < fade; i++) out[n - 1 - i] *= i / fade;
    const b = new AudioBuffer({ length: n, sampleRate: sr, numberOfChannels: 1 }); b.copyToChannel(out, 0);
    return (KSC[k] = b);
  }
  // Ukulele (re-entrant G4 C4 E4 A4) shapes, strummed G-string first. 1 = down, -1 = up.
  const UKE = { D: [69, 62, 66, 69], G: [67, 62, 67, 71], A: [69, 61, 64, 69], Bm: [71, 62, 66, 71], Em: [67, 64, 67, 71], C: [67, 60, 64, 72], E: [68, 64, 68, 71], 'F#m': [69, 61, 66, 69] };
  function strum(c, d, t, ch, v = 0.3, dir = 1, gap = 0.014, t60 = 1.1) {
    const ns = UKE[ch] || ch;
    for (let i = 0; i < 4; i++) { const m = ns[dir > 0 ? i : 3 - i]; hit(c, d, ks(m, 1.6, t60), t + i * gap, v * (0.8 + rnd() * 0.25)); }
  }
  // The Manager's motif (spec §15.2): G5 - E5 - C5, slow, falling, soft sine, long tail.
  function motif(c, d, t, v = 0.11, oct = 0) { [79, 76, 72].forEach((m, i) => tone(c, d, t + i * 0.78, mtof(m + oct), 1.1, { v: v * (1 - i * 0.08), a: 0.09, d: 0.9, s: 0.45, r: 2.4 })); }
  // Luka (laughing), spec §15.4: short voiced "ha" bursts (a glottal pulse at Luka's blip pitch, 110 Hz, plus aspiration
  // noise) through an "ah" formant pair (~700 / ~1200 Hz), each falling slightly in pitch, an irregular rhythm, breaths.
  function laughSynth(c, d, t0, f0 = 110) {
    const R = rng(1158), out = c.createBiquadFilter(); out.type = 'lowpass'; out.frequency.value = 5200; out.connect(d);
    const F1 = bp(c, 700, 5), F2 = bp(c, 1200, 6), F3 = bp(c, 2600, 7), body = c.createBiquadFilter();
    body.type = 'lowpass'; body.frequency.value = 420;
    F1.connect(out); F2.connect(gn(c, out, 0.7)); F3.connect(gn(c, out, 0.22)); body.connect(gn(c, out, 0.35));
    const os = c.createOscillator(), vg = c.createGain(), nz = c.createBufferSource(), ng = c.createGain();
    os.setPeriodicWave(pw(c, 'glot')); vg.gain.value = 0; ng.gain.value = 0;
    nz.buffer = WHITE; nz.loop = true;
    os.connect(vg); vg.connect(F1); vg.connect(F2); vg.connect(F3); vg.connect(body);
    nz.connect(ng); ng.connect(F1); ng.connect(F2); ng.connect(F3);
    lfo(c, os.detune, 8.5, 22, t0, t0 + 2.48); // helpless wobble
    const breath = c.createGain(), bf = bp(c, 1700, 1.6); breath.gain.value = 0; nz.connect(bf); bf.connect(breath); breath.connect(out);
    let t = t0 + 0.03;
    const bout = (n, f, gap, amp) => {
      for (let k = 0; k < n; k++) {
        const dur = 0.07 + R() * 0.04, fb = f * (1 - k * 0.035) * (0.97 + R() * 0.06), a = amp * (1 - k * 0.07) * (0.85 + R() * 0.2);
        F1.frequency.setValueAtTime(660 + R() * 110, t); F2.frequency.setValueAtTime(1120 + R() * 160, t);
        ng.gain.setTargetAtTime(a * 0.55, t - 0.025, 0.008); ng.gain.setTargetAtTime(a * 0.16, t + 0.012, 0.02); // the "h"
        os.frequency.setValueAtTime(fb, t); os.frequency.exponentialRampToValueAtTime(fb * 0.86, t + dur);
        vg.gain.setTargetAtTime(a, t, 0.008); vg.gain.setTargetAtTime(0, t + dur * 0.75, 0.016);
        ng.gain.setTargetAtTime(0, t + dur * 0.8, 0.02);
        t += dur + gap * (0.8 + R() * 0.45);
      }
    };
    const inhale = (len, v) => { breath.gain.setTargetAtTime(v, t, len / 4); bf.frequency.setValueAtTime(1300, t); bf.frequency.linearRampToValueAtTime(2300, t + len); breath.gain.setTargetAtTime(0, t + len * 0.8, 0.04); t += len; };
    bout(5, f0 * 1.6, 0.105, 0.5);
    inhale(0.22, 0.16);
    bout(4, f0 * 1.52, 0.085, 0.48);
    t += 0.04; inhale(0.15, 0.1);
    bout(1, f0 * 1.15, 0.1, 0.22);
    breath.gain.setTargetAtTime(0.07, t, 0.04); bf.frequency.setValueAtTime(1100, t); breath.gain.setTargetAtTime(0, t + 0.12, 0.05); // the sigh out
    os.start(t0); nz.start(t0, 0.3); os.stop(t0 + 2.48); nz.stop(t0 + 2.48);
  }

  // ---------------------------------------------------------- one-shots: name: [seconds, recipe(ctx, dest, t)]
  const SFX = {
    // ---- Rue's (kept byte-for-byte where TWO reuses them: ding, restart_chime, alarm, trill, brick_ring, kettle, clunk)
    ding: [0.22, (c, d, t) => { tone(c, d, t, 880, 0.06, { v: 0.28, r: 0.03 }); tone(c, d, t + 0.07, 1320, 0.06, { v: 0.28, r: 0.06 }); }],
    crash: [1, (c, d, t) => {
      tone(c, d, t, 600, 0.7, { type: 'square', to: 80, v: 0.16, r: 0.15, lp: 2600 });
      noise(c, d, t, 0.45, { v: 0.4, a: 0.002, d: 0.12, lp: 3500 });
    }],
    restart_chime: [1.3, (c, d, t) => [72, 76, 79].forEach((m, i) => tone(c, d, t + i * 0.2, mtof(m), 0.4, { v: 0.16, a: 0.03, d: 0.3, s: 0.3, r: 0.5 }))],
    alarm: [1, (c, d, t) => siren(c, d, t, 1, 0.14)],
    rip: [0.7, (c, d, t) => { noise(c, d, t, 0.22, { v: 0.45, a: 0.003, d: 0.07, bp: 3000, fto: 700, fgl: 0.2, q: 0.8 }); twang(c, d, t + 0.03, 0.22); }],
    twang: [0.8, (c, d, t) => twang(c, d, t, 0.3)],
    spark: [0.5, (c, d, t) => { for (let k = 0; k < 9; k++) noise(c, d, t + rnd() * 0.38, 0.012, { v: 0.2 + rnd() * 0.35, a: 0.0005, d: 0.004, hp: 3500 }); }],
    tick: [0.06, (c, d, t) => { noise(c, d, t, 0.006, { v: 0.3, a: 0.0005, d: 0.002, hp: 2500 }); tone(c, d, t, 2400, 0.012, { v: 0.05, a: 0.001, d: 0.004 }); }],
    trill: [1.05, (c, d, t) => { for (const s of [0, 0.6]) { tone(c, d, t + s, 400, 0.4, { v: 0.16, a: 0.008, r: 0.02 }); tone(c, d, t + s, 450, 0.4, { v: 0.16, a: 0.008, r: 0.02 }); } }],
    brick_ring: [1.05, (c, d, t) => brickRing(c, d, t)],
    bell: [8.5, (c, d, t) => bell(c, d, t, mtof(62), 0.2)],
    kettle: [3.35, (c, d, t) => {
      noise(c, d, t, 3, { v: 0.2, a: 2.8, r: 0.02, bp: 350, fto: 2600, fgl: 3, q: 1.4 });
      noise(c, d, t, 3, { v: 0.12, a: 1.6, r: 0.02, brown: true, lp: 400 });
      kclick(c, d, t + 3.02, 0.6);
    }],
    kettle_click: [0.1, (c, d, t) => kclick(c, d, t, 0.7)],
    beep: [0.13, (c, d, t) => tone(c, d, t, 1000, 0.1, { type: 'square', v: 0.11, a: 0.002, r: 0.01 })],
    till: [0.7, (c, d, t) => {
      fm(c, d, t, 2349, 0.5, { ratio: 1.41, index: 3, md: 0.08, v: 0.22, a: 0.001, d: 0.16, r: 0.1 });
      fm(c, d, t, 3520, 0.3, { ratio: 2.76, index: 1.5, md: 0.05, v: 0.1, a: 0.001, d: 0.08, r: 0.05 });
      noise(c, d, t, 0.05, { v: 0.25, a: 0.001, d: 0.02, hp: 2500 });
      tone(c, d, t, 220, 0.06, { to: 170, v: 0.2, a: 0.001, d: 0.03 });
    }],
    whistle: [0.5, (c, d, t) => whistle(c, d, t, mtof(74), 0.3)], // D5
    pigeons: [1.1, (c, d, t) => {
      for (let b = 0; b < 2; b++) for (let k = 0; k < 9; k++) noise(c, d, t + b * 0.13 + k * (0.065 + rnd() * 0.02), 0.035, { v: 0.8 * (1 - k / 12), a: 0.004, d: 0.012, bp: 700 + rnd() * 700, q: 1.3 });
    }],
    creak: [1.3, (c, d, t) => creak(c, d, t)],
    door_slide: [1.3, (c, d, t) => {
      noise(c, d, t, 0.9, { v: 0.12, a: 0.25, r: 0.3, bp: 500, fto: 1100, fgl: 0.9, q: 0.9 });
      tone(c, d, t, 120, 0.9, { type: 'triangle', v: 0.05, a: 0.1, r: 0.2, lp: 500 });
      tone(c, d, t + 1, 90, 0.08, { to: 60, v: 0.15, a: 0.002, d: 0.04 });
    }],
    clunk: [0.3, (c, d, t) => { tone(c, d, t, 95, 0.15, { to: 55, v: 0.5, a: 0.002, d: 0.06 }); noise(c, d, t, 0.05, { v: 0.3, a: 0.001, d: 0.025, lp: 700 }); }],
    sad_beep: [0.6, (c, d, t) => {
      tone(c, d, t, 440, 0.14, { type: 'square', v: 0.09, r: 0.02, lp: 2200 });
      tone(c, d, t + 0.18, 330, 0.3, { type: 'square', to: 300, v: 0.09, r: 0.05, lp: 2200 });
    }],
    key_beep: [0.1, (c, d, t) => tone(c, d, t, 1400, 0.06, { type: 'square', v: 0.09, r: 0.01, lp: 5000 })],
    sting: [1, (c, d, t) => {
      chord(c, d, t, [48, 55, 60, 63, 67], 0.05, { v: 0.06, a: 0.003, d: 0.25, s: 0, r: 0.6, lp: 3000 });
      noise(c, d, t, 0.2, { v: 0.35, a: 0.002, d: 0.08, lp: 3000 });
      tone(c, d, t, 65, 0.3, { v: 0.4, a: 0.003, d: 0.2 });
    }],
    whoosh: [0.8, (c, d, t) => noise(c, d, t, 0.35, { v: 0.9, a: 0.25, r: 0.3, bp: 300, fto: 2000, fgl: 0.5, q: 1.2 })],
    zap: [0.45, (c, d, t) => {
      tone(c, d, t, 120, 0.28, { type: 'square', v: 0.12, a: 0.002, r: 0.05, lp: 2500, vib: [31, 400] });
      for (let k = 0; k < 6; k++) noise(c, d, t + rnd() * 0.3, 0.01, { v: 0.3, a: 0.0005, d: 0.004, hp: 3000 });
    }],
    typewriter: [0.1, (c, d, t) => type1(c, d, t, 0.45)],
    footstep: [0.14, (c, d, t) => { noise(c, d, t, 0.05, { v: 1.2, a: 0.002, d: 0.02, lp: 450 }); noise(c, d, t, 0.02, { v: 0.12, a: 0.001, d: 0.008, bp: 2200 }); }],
    footstep_wet: [0.3, (c, d, t) => {
      noise(c, d, t, 0.05, { v: 0.9, a: 0.002, d: 0.02, lp: 450 });
      noise(c, d, t + 0.01, 0.12, { v: 0.35, a: 0.006, d: 0.05, bp: 2600, q: 0.8 });
      tone(c, d, t + 0.04, 1400, 0.03, { to: 900, v: 0.04, a: 0.001, d: 0.015 });
    }],
    thud: [0.5, (c, d, t) => { tone(c, d, t, 80, 0.3, { to: 40, v: 0.6, a: 0.002, d: 0.1 }); noise(c, d, t, 0.1, { v: 0.4, a: 0.002, d: 0.05, lp: 300 }); }],
    pop: [0.09, (c, d, t) => tone(c, d, t, 380, 0.05, { to: 1100, gl: 0.03, v: 0.25, a: 0.001, d: 0.02 })],
    applause: [3.3, (c, d, t) => {
      for (let k = 0; k < 110; k++) {
        const x = rnd();
        noise(c, d, t + x * 2.8, 0.02, { v: 0.6 * Math.sin(Math.PI * Math.min(1, x * 1.3)) + 0.1, a: 0.001, d: 0.008, bp: 900 + rnd() * 1600, q: 1.5 });
      }
      noise(c, d, t, 2.4, { v: 0.12, a: 0.4, r: 0.9, bp: 1500, q: 0.6 });
    }],
    groan: [1.7, (c, d, t) => crowdGroan(c, d, t)],
    titter: [1.3, (c, d, t) => crowdTitter(c, d, t)],
    murmur: [2.3, (c, d, t) => { babble(c, d, t, 2.2, { f: 120, v: 0.5 }); babble(c, d, t + 0.1, 2.1, { f: 150, v: 0.4 }); babble(c, d, t + 0.2, 2, { f: 195, v: 0.4 }); }],
    knock: [0.6, (c, d, t) => {
      for (let k = 0; k < 3; k++) {
        tone(c, d, t + k * 0.16, 190, 0.05, { to: 140, v: 0.45, a: 0.001, d: 0.025 });
        noise(c, d, t + k * 0.16, 0.03, { v: 0.35, a: 0.001, d: 0.012, bp: 900, q: 2 });
      }
    }],
    bike_bell: [1.2, (c, d, t) => {
      for (const s of [0, 0.17]) for (const [r, a, k] of [[1, 1, 0.3], [1.006, 0.6, 0.3], [2.76, 0.4, 0.15], [5.4, 0.2, 0.06]]) tone(c, d, t + s, 2300 * r, 0.8, { v: 0.09 * a, a: 0.001, d: k, r: 0.1 });
    }],
    flash_hum: [2.7, (c, d, t) => {
      for (const det of [-12, 0, 12]) tone(c, d, t, 55, 2.4, { type: 'sawtooth', to: 220, gl: 2.3, det, v: 0.08, a: 0.4, r: 0.1, lp: 300, fto: 4000, fgl: 2.3 });
      tone(c, d, t, 880, 2.4, { to: 1760, gl: 2.3, v: 0.03, a: 1.5, r: 0.1, vib: [9, 30] });
    }],
    dynamo_hit: [0.4, (c, d, t) => {
      tone(c, d, t, 130, 0.25, { to: 48, gl: 0.1, v: 0.8, a: 0.002, d: 0.1, r: 0.05 });
      tone(c, d, t, 190, 0.12, { type: 'sawtooth', to: 70, v: 0.2, a: 0.002, d: 0.05, bp: 500, q: 1.2 });
      noise(c, d, t, 0.01, { v: 0.12, a: 0.0005, d: 0.003, lp: 4000 });
    }],
    dictaphone: [0.5, (c, d, t) => {
      noise(c, d, t, 0.01, { v: 0.4, a: 0.0005, d: 0.004, hp: 2000 });
      tone(c, d, t, 1200, 0.01, { v: 0.08, a: 0.0005, d: 0.004 });
      tone(c, d, t + 0.03, 180, 0.35, { type: 'triangle', v: 0.05, a: 0.02, r: 0.05, lp: 1200, vib: [9, 30] });
    }],
    cassette_eject: [0.4, (c, d, t) => {
      tone(c, d, t, 300, 0.05, { to: 170, v: 0.3, a: 0.001, d: 0.02 });
      noise(c, d, t, 0.03, { v: 0.35, a: 0.001, d: 0.012, bp: 1500 });
      for (const s of [0.06, 0.09, 0.13]) noise(c, d, t + s, 0.01, { v: 0.15, a: 0.0005, d: 0.004, hp: 3000 });
      tone(c, d, t + 0.02, 900, 0.1, { to: 700, v: 0.05, a: 0.001, d: 0.04 });
    }],
    chime_ready: [1.2, (c, d, t) => {
      for (const [s, m] of [[0, 79], [0.14, 86]]) {
        tone(c, d, t + s, mtof(m), 0.8, { v: 0.16, a: 0.003, d: 0.35, r: 0.2 });
        tone(c, d, t + s, mtof(m) * 3, 0.3, { v: 0.03, a: 0.003, d: 0.08, r: 0.1 });
      }
    }],
    truck_reverse: [2.5, (c, d, t) => { for (const s of [0, 0.95, 1.9]) tone(c, d, t + s, 1100, 0.45, { type: 'square', v: 0.08, a: 0.004, r: 0.01, lp: 3000 }); }],
    tube_flicker: [0.9, (c, d, t) => fluoro(c, d, t, 0.8, 0.1, [[0, 0.8]])],
    smoke_pop: [1.1, (c, d, t) => {
      tone(c, d, t, 140, 0.25, { to: 45, v: 0.6, a: 0.002, d: 0.08 });
      noise(c, d, t, 0.8, { v: 0.35, a: 0.002, d: 0.2, lp: 2500, fto: 400, fgl: 0.8 });
      for (let k = 0; k < 5; k++) noise(c, d, t + 0.05 + rnd() * 0.5, 0.01, { v: 0.15, a: 0.0005, d: 0.004, hp: 3000 });
    }],
    umbrella: [0.45, (c, d, t) => {
      noise(c, d, t, 0.18, { v: 0.3, a: 0.12, r: 0.02, bp: 800, fto: 2500, fgl: 0.18 });
      noise(c, d, t + 0.2, 0.012, { v: 0.5, a: 0.0005, d: 0.005, hp: 1500 });
      tone(c, d, t + 0.2, 600, 0.02, { v: 0.2, a: 0.0005, d: 0.008 });
    }],

    // ---- TWO (spec §15.5)
    ss_chirp: [0.42, (c, d, t) => { // SafeSense: two soft rising glass notes (JARVIS's 'ding' is two flat sines)
      tone(c, d, t, mtof(88) * 0.96, 0.07, { type: 'triangle', to: mtof(88), gl: 0.04, v: 0.12, a: 0.004, d: 0.05, s: 0.4, r: 0.06 });
      tone(c, d, t + 0.1, mtof(93) * 0.96, 0.09, { type: 'triangle', to: mtof(93), gl: 0.05, v: 0.11, a: 0.004, d: 0.06, s: 0.4, r: 0.14 });
      tone(c, d, t + 0.1, mtof(105), 0.05, { v: 0.012, a: 0.004, d: 0.04, r: 0.12 });
    }],
    des_chirp: [0.55, (c, d, t) => { // Des the kettle: a polite "Tea?" (rising, like a question)
      tone(c, d, t, mtof(79), 0.08, { v: 0.12, a: 0.008, d: 0.06, s: 0.5, r: 0.04 });
      tone(c, d, t + 0.13, mtof(84), 0.17, { to: mtof(87), gl: 0.16, v: 0.12, a: 0.008, d: 0.1, s: 0.5, r: 0.1 });
    }],
    bam: [3, (c, d, t) => { // the arrival: white-noise burst, a falling sub, glass everywhere
      noise(c, d, t, 0.5, { v: 0.9, a: 0.001, d: 0.12, s: 0.15, r: 0.4, lp: 9000, fto: 900, fgl: 0.8 });
      noise(c, d, t, 0.03, { v: 0.8, a: 0.0005, d: 0.01, hp: 1500 });
      tone(c, d, t, 95, 1.3, { to: 26, gl: 1.2, v: 0.9, a: 0.002, d: 0.5, s: 0.3, r: 0.4 });
      noise(c, d, t + 0.02, 1.4, { v: 0.3, a: 0.01, d: 0.4, s: 0.2, r: 0.5, brown: true, lp: 300 });
      glass(c, d, t + 0.08, 26, 2.2, 0.09);
    }],
    glass: [1.6, (c, d, t) => { noise(c, d, t, 0.15, { v: 0.35, a: 0.001, d: 0.05, hp: 2500 }); glass(c, d, t + 0.01, 18, 1.2, 0.11); }],
    hover_by: [3, (c, d, t) => { // a hover-car gliding past a foot off the road
      const g = c.createGain(); g.connect(d); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(1, t + 1.3); g.gain.linearRampToValueAtTime(0, t + 2.8);
      for (const [f, ty, v, lp] of [[66, 'sawtooth', 0.18, 500], [66.5, 'sawtooth', 0.15, 500], [264, 'sine', 0.05, 0]]) {
        const os = c.createOscillator(), og = c.createGain(); os.type = ty; og.gain.value = v;
        os.frequency.setValueAtTime(f * 1.05, t); os.frequency.setValueAtTime(f * 1.05, t + 1.15); os.frequency.linearRampToValueAtTime(f * 0.94, t + 1.55);
        os.connect(lp ? filt(c, og, { lp }, t, 3) : og); og.connect(g); os.start(t); os.stop(t + 2.9);
      }
      noise(c, g, t, 2.8, { v: 0.12, a: 0.01, r: 0.05, bp: 900, fto: 600, fgl: 2.8, q: 0.7 });
    }],
    chip_chime: [1.5, (c, d, t) => { fmBell(c, d, t, 88, 0.9, 0.08); fmBell(c, d, t + 0.06, 95, 1.1, 0.07); tone(c, d, t + 0.06, mtof(107), 0.4, { v: 0.008, a: 0.05, r: 0.5 }); }],
    drone_scan: [1.3, (c, d, t) => { // the beam sweeping
      const os = c.createOscillator(), am = c.createGain(), g = c.createGain();
      os.frequency.setValueAtTime(1200, t); os.frequency.linearRampToValueAtTime(2200, t + 0.55); os.frequency.linearRampToValueAtTime(1200, t + 1.1);
      am.gain.value = 0.5; lfo(c, am.gain, 24, 0.5, t, t + 1.25);
      const end = env(g.gain, t, 1, { v: 0.07, a: 0.08, r: 0.15 });
      os.connect(am); am.connect(g); g.connect(d); os.start(t); os.stop(end);
      noise(c, d, t, 1, { v: 0.05, a: 0.1, r: 0.15, bp: 3000, fto: 5000, fgl: 0.55, q: 3 });
    }],
    drone_q: [0.45, (c, d, t) => { // the '?' chirp (a drone turns curious)
      tone(c, d, t, 520, 0.07, { type: 'square', v: 0.05, a: 0.003, r: 0.02, lp: 2200 });
      tone(c, d, t + 0.1, 560, 0.16, { type: 'square', to: 980, gl: 0.16, v: 0.05, a: 0.003, r: 0.04, lp: 2600 });
    }],
    drone_red: [0.6, (c, d, t) => { for (const s of [0, 0.14, 0.28]) tone(c, d, t + s, 740, 0.08, { type: 'square', v: 0.05, a: 0.002, r: 0.02, lp: 2400 }); }], // escort
    drone_ok: [0.45, (c, d, t) => { tone(c, d, t, mtof(84), 0.08, { type: 'triangle', v: 0.08, r: 0.03 }); tone(c, d, t + 0.11, mtof(79), 0.14, { type: 'triangle', v: 0.07, r: 0.12 }); }], // back to patrol
    hug_field: [1.8, (c, d, t) => { // "Gotcha! For your safety!"
      tone(c, d, t, 70, 1.4, { to: 110, gl: 1, v: 0.35, a: 0.25, d: 0.6, s: 0.6, r: 0.35 });
      chord(c, d, t, [86, 90, 93], 1.2, { type: 'sine', v: 0.02, a: 0.3, r: 0.4, lp: 6000, det: [-6, 6] });
      noise(c, d, t, 1.2, { v: 0.05, a: 0.3, r: 0.3, bp: 1500, q: 0.8 });
    }],
    dock_clunk: [0.9, (c, d, t) => {
      tone(c, d, t, 260, 0.25, { type: 'sawtooth', to: 420, v: 0.04, a: 0.01, r: 0.03, lp: 1500 }); // servo
      for (const [s, f, v] of [[0.28, 120, 0.5], [0.42, 90, 0.6]]) { tone(c, d, t + s, f, 0.12, { to: f * 0.6, v, a: 0.001, d: 0.04 }); noise(c, d, t + s, 0.04, { v: 0.3, a: 0.001, d: 0.015, bp: 1800, q: 1.5 }); }
      noise(c, d, t + 0.43, 0.01, { v: 0.3, a: 0.0005, d: 0.004, hp: 4000 }); // the latch
    }],
    claw: [1.1, (c, d, t) => { // the noise drone's claw: servo out, clamp, servo back
      tone(c, d, t, 300, 0.35, { type: 'sawtooth', to: 520, v: 0.035, a: 0.02, r: 0.03, lp: 1800, vib: [40, 20] });
      tone(c, d, t + 0.4, 140, 0.1, { to: 80, v: 0.4, a: 0.001, d: 0.04 }); noise(c, d, t + 0.4, 0.03, { v: 0.35, a: 0.001, d: 0.01, bp: 2200, q: 2 });
      tone(c, d, t + 0.55, 520, 0.4, { type: 'sawtooth', to: 300, v: 0.03, a: 0.02, r: 0.03, lp: 1800, vib: [40, 20] });
    }],
    foam: [1.8, (c, d, t) => { // safety foam: pfff-oomph, then little bubbles popping
      noise(c, d, t, 0.9, { v: 0.5, a: 0.15, d: 0.4, s: 0.3, r: 0.5, lp: 400, fto: 3200, fgl: 0.5, q: 1.5 });
      tone(c, d, t, 60, 0.5, { to: 95, gl: 0.3, v: 0.4, a: 0.05, d: 0.3, r: 0.3 });
      for (let k = 0; k < 40; k++) { const x = rnd(); noise(c, d, t + 0.1 + x * 1.3, 0.004, { v: 0.12 * (1 - x * 0.6), a: 0.0003, d: 0.002, bp: 2500 + rnd() * 4000, q: 4 }); }
    }],
    tether_whip: [0.75, (c, d, t) => {
      noise(c, d, t, 0.22, { v: 0.6, a: 0.15, r: 0.02, bp: 500, fto: 3500, fgl: 0.22, q: 1.4 });
      noise(c, d, t + 0.22, 0.02, { v: 0.9, a: 0.0005, d: 0.008, hp: 1800 }); // the crack
      twang(c, d, t + 0.22, 0.12);
    }],
    tether_yank: [0.85, (c, d, t) => {
      tone(c, d, t, 180, 0.18, { type: 'sawtooth', to: 420, gl: 0.18, v: 0.08, a: 0.01, r: 0.02, bp: 900, q: 3 }); // rubber stretching
      tone(c, d, t + 0.18, 110, 0.15, { to: 50, v: 0.6, a: 0.001, d: 0.06 }); noise(c, d, t + 0.18, 0.06, { v: 0.4, a: 0.001, d: 0.02, lp: 1200 });
      twang(c, d, t + 0.2, 0.2);
    }],
    chip_zap: [0.55, (c, d, t) => { // the chip ping, forced off
      tone(c, d, t, 1760, 0.05, { v: 0.08, a: 0.001, d: 0.03, r: 0.02 });
      tone(c, d, t + 0.04, 2400, 0.09, { type: 'square', to: 160, gl: 0.09, v: 0.07, a: 0.001, r: 0.02, lp: 5000 });
      for (let k = 0; k < 7; k++) noise(c, d, t + 0.04 + rnd() * 0.25, 0.006, { v: 0.25, a: 0.0005, d: 0.003, hp: 4000 });
    }],
    chip_on: [0.5, (c, d, t) => { tone(c, d, t, mtof(83), 0.06, { v: 0.05, a: 0.004, r: 0.05 }); tone(c, d, t + 0.05, mtof(90), 0.2, { v: 0.04, a: 0.01, r: 0.15 }); noise(c, d, t, 0.25, { v: 0.015, a: 0.05, r: 0.1, hp: 6000 }); }],
    static_zap: [0.5, (c, d, t) => {
      noise(c, d, t, 0.015, { v: 1, a: 0.0003, d: 0.004, hp: 1200 });
      tone(c, d, t, 55, 0.12, { type: 'square', v: 0.12, a: 0.001, d: 0.05, lp: 400 });
      for (let k = 0; k < 14; k++) { const x = rnd(); noise(c, d, t + x * x * 0.35, 0.004, { v: 0.35 * (1 - x), a: 0.0003, d: 0.0015, hp: 3000 }); }
    }],
    coat_whoosh: [0.75, (c, d, t) => { // a long trench coat swirling
      const am = gn(c, d, 0.7); lfo(c, am.gain, 17, 0.3, t, t + 0.75);
      noise(c, am, t, 0.3, { v: 0.5, a: 0.18, r: 0.25, bp: 250, fto: 900, fgl: 0.4, q: 0.9 });
    }],
    boom_gate: [2.1, (c, d, t) => { // clunk, the motor whine as the arm lifts, the stop
      tone(c, d, t, 110, 0.12, { to: 60, v: 0.6, a: 0.001, d: 0.05 }); noise(c, d, t, 0.05, { v: 0.4, a: 0.001, d: 0.02, bp: 1200, q: 1.2 });
      tone(c, d, t + 0.08, 170, 1.45, { type: 'sawtooth', to: 330, gl: 1.3, v: 0.08, a: 0.08, r: 0.08, lp: 1400, vib: [38, 25] });
      tone(c, d, t + 0.08, 510, 1.45, { to: 990, gl: 1.3, v: 0.02, a: 0.1, r: 0.08 });
      tone(c, d, t + 1.62, 90, 0.1, { to: 55, v: 0.45, a: 0.001, d: 0.04 }); noise(c, d, t + 1.62, 0.04, { v: 0.25, a: 0.001, d: 0.015, lp: 900 });
    }],
    sizzle: [1.8, (c, d, t) => { // onions hitting the hotplate
      noise(c, d, t, 1.4, { v: 0.3, a: 0.005, d: 0.35, s: 0.4, r: 0.3, hp: 2500 });
      noise(c, d, t, 1.4, { v: 0.5, a: 0.005, d: 0.5, s: 0.3, r: 0.3, buf: CRACKLE, hp: 1500 });
      noise(c, d, t, 0.15, { v: 0.2, a: 0.002, d: 0.05, bp: 900, q: 0.8 });
    }],
    train_chime: [1.7, (c, d, t) => { for (const [s, m] of [[0, 80], [0.32, 76], [0.64, 83]]) { tone(c, d, t + s, mtof(m), 0.5, { v: 0.13, a: 0.003, d: 0.35, r: 0.35 }); tone(c, d, t + s, mtof(m) * 2, 0.2, { v: 0.02, a: 0.003, d: 0.1 }); } }],
    train_doors: [1.5, (c, d, t) => { noise(c, d, t, 0.35, { v: 0.25, a: 0.01, d: 0.15, s: 0.3, r: 0.1, hp: 2000 }); noise(c, d, t + 0.3, 0.8, { v: 0.1, a: 0.1, r: 0.2, bp: 600, q: 0.8 }); tone(c, d, t + 1.15, 110, 0.08, { to: 70, v: 0.3, a: 0.002, d: 0.04 }); }],
    uke_strum: [1.7, (c, d, t) => strum(c, d, t, 'D', 0.32)],
    phone_ring: [2.4, (c, d, t) => { for (const s of [0, 1.2]) [76, 83, 81, 88].forEach((m, i) => marimba(c, d, t + s + i * 0.13, m, 0.18, 0.12)); }], // a 2040 smartphone (valley lit36)
    lift_ding: [1.4, (c, d, t) => { fm(c, d, t, mtof(84), 1, { ratio: 2, index: 0.5, md: 0.3, isus: 0.05, v: 0.13, a: 0.002, d: 0.5, r: 0.4 }); tone(c, d, t, mtof(96), 0.2, { v: 0.01, a: 0.002, d: 0.1 }); }],
    cracker: [0.8, (c, d, t) => { // Christmas cracker: snap, then paper
      noise(c, d, t, 0.02, { v: 1, a: 0.0003, d: 0.006, hp: 900 }); noise(c, d, t, 0.08, { v: 0.4, a: 0.001, d: 0.03, bp: 2500, q: 0.8 });
      tone(c, d, t, 180, 0.05, { to: 90, v: 0.3, a: 0.001, d: 0.02 });
      for (let k = 0; k < 6; k++) noise(c, d, t + 0.12 + k * 0.07 + rnd() * 0.03, 0.04, { v: 0.05, a: 0.005, d: 0.015, bp: 3000 + rnd() * 2500, q: 1.5 });
    }],
    steam: [0.9, (c, d, t) => noise(c, d, t, 0.45, { v: 0.35, a: 0.01, d: 0.2, s: 0.4, r: 0.3, hp: 1600, fto: 3500, fgl: 0.4 })],
    roller_door: [2.5, (c, d, t) => { // a metal roller shutter rattling up
      for (let x = 0.02, k = 0; x < 2.2; x += 0.036 + 0.012 * Math.sin(k++ * 0.7)) { noise(c, d, t + x, 0.012, { v: 0.12 + rnd() * 0.08, a: 0.0005, d: 0.005, bp: 1300 + rnd() * 1200, q: 3 }); tone(c, d, t + x, 900 + rnd() * 500, 0.01, { v: 0.015, a: 0.0005, d: 0.02 }); }
      noise(c, d, t, 2.2, { v: 0.15, a: 0.1, r: 0.2, brown: true, lp: 500 });
      tone(c, d, t + 2.22, 120, 0.1, { to: 70, v: 0.35, a: 0.001, d: 0.05 });
    }],
    thunder: [5.5, (c, d, t) => { // near: a crack, then rolls
      noise(c, d, t, 0.06, { v: 0.8, a: 0.001, d: 0.03, hp: 600 });
      noise(c, d, t + 0.02, 4.5, { v: 0.8, a: 0.04, d: 1.4, s: 0.15, r: 1.2, brown: true, lp: 900, fto: 140, fgl: 4 });
      for (const [s, v] of [[0.4, 0.5], [1.1, 0.45], [1.9, 0.35], [2.8, 0.25]]) noise(c, d, t + s, 0.6, { v, a: 0.15, d: 0.4, r: 0.6, brown: true, lp: 220 });
      tone(c, d, t, 48, 2.5, { to: 30, v: 0.3, a: 0.05, d: 1, r: 0.8 });
    }],
    thunder_far: [6, (c, d, t) => { // muffled, rolling, far off
      for (const [s, v] of [[0, 0.35], [0.6, 0.5], [1.5, 0.4], [2.6, 0.3], [3.6, 0.18]]) noise(c, d, t + s, 0.8, { v, a: 0.3, d: 0.5, r: 0.9, brown: true, lp: 240 });
      tone(c, d, t + 0.4, 40, 3, { v: 0.12, a: 0.6, d: 1.2, r: 1 });
    }],
    pelican: [0.5, (c, d, t) => { for (const s of [0, 0.045, 0.085, 0.13, 0.18]) { noise(c, d, t + s, 0.012, { v: 0.45, a: 0.0005, d: 0.006, bp: 1500, q: 3 }); tone(c, d, t + s, 380, 0.02, { to: 300, v: 0.15, a: 0.0005, d: 0.01 }); } }],
    wall_hit: [1.5, (c, d, t) => { // Luka thrown into the wall: a hard, ugly sound
      tone(c, d, t, 75, 0.4, { to: 35, v: 0.9, a: 0.001, d: 0.12 }); noise(c, d, t, 0.25, { v: 0.6, a: 0.001, d: 0.06, lp: 1400 });
      noise(c, d, t, 0.02, { v: 0.7, a: 0.0005, d: 0.006, hp: 2000 }); // the crack of the panel
      for (let k = 0; k < 12; k++) { const x = rnd(); noise(c, d, t + 0.08 + x * 0.9, 0.01, { v: 0.15 * (1 - x), a: 0.0005, d: 0.004, bp: 800 + rnd() * 2500, q: 2 }); } // debris
    }],
    blast: [2.4, (c, d, t) => { // the drone detonating; the foam bursting
      noise(c, d, t, 0.4, { v: 0.8, a: 0.001, d: 0.1, s: 0.2, r: 0.4, lp: 6000, fto: 500, fgl: 0.6 });
      tone(c, d, t, 70, 1, { to: 28, gl: 0.9, v: 0.9, a: 0.002, d: 0.4, s: 0.2, r: 0.3 });
      noise(c, d, t + 0.05, 1.6, { v: 0.25, a: 0.05, d: 0.5, r: 0.6, brown: true, lp: 350 });
      for (let k = 0; k < 24; k++) { const x = rnd(); noise(c, d, t + 0.1 + x * 1.5, 0.004, { v: 0.1 * (1 - x * 0.6), a: 0.0003, d: 0.002, bp: 2500 + rnd() * 4000, q: 4 }); }
    }],
    line_click: [0.5, (c, d, t) => { noise(c, d, t, 0.01, { v: 0.4, a: 0.0005, d: 0.004, bp: 1800, q: 1.5 }); tone(c, d, t + 0.02, 50, 0.4, { v: 0.03, a: 0.05, r: 0.05 }); noise(c, d, t + 0.02, 0.4, { v: 0.015, a: 0.05, r: 0.05, bp: 2500, q: 0.6 }); }],
    manager_motif: [6, (c, d, t) => motif(c, rev(c, d, 3.5, 0.45, 0.75), t, 0.12)],

    // ---- mini-game one-shots (the builders' "missing sounds"): short, so they bake in a couple of small contexts.
    // Pitch moves (a meter climbing, a slower click) are the caller's `rate`.
    cloth_swish: [0.35, (c, d, t) => { // polish: a microfibre cloth wiping across glass (soft, airy)
      noise(c, d, t, 0.2, { v: 0.22, a: 0.06, r: 0.1, bp: 1800, fto: 3200, fgl: 0.2, q: 0.7 });
      noise(c, d, t + 0.02, 0.16, { v: 0.07, a: 0.05, r: 0.08, hp: 5000 });
    }],
    glass_squeak: [0.42, (c, d, t) => { // polish: a patch comes clean (stick-slip squeal, gliding up)
      const am = gn(c, d, 0.6); lfo(c, am.gain, 38, 0.4, t, t + 0.4, 'square');
      tone(c, am, t, 1700, 0.24, { type: 'sawtooth', to: 2500, gl: 0.2, v: 0.06, a: 0.02, r: 0.08, bp: 2300, q: 4 });
      tone(c, am, t, 3400, 0.2, { to: 5000, gl: 0.2, v: 0.018, a: 0.02, r: 0.06 });
    }],
    glass_slap: [0.55, (c, d, t) => { // a hand slapping flat on the glass: skin, the pane flexing, a dull ring
      noise(c, d, t, 0.03, { v: 0.6, a: 0.0005, d: 0.012, bp: 1400, q: 0.8 });
      tone(c, d, t, 160, 0.12, { to: 90, v: 0.35, a: 0.001, d: 0.04 });
      for (const [f, v, k] of [[1180, 0.04, 0.09], [2650, 0.022, 0.06], [4100, 0.012, 0.04]]) tone(c, d, t, f, 0.3, { v, a: 0.001, d: k, s: 0, r: 0.1 });
    }],
    spotless_chime: [1, (c, d, t) => { // SPOTLESS: bright and brief, four bell notes up and a glint
      [84, 88, 91, 96].forEach((m, i) => { tone(c, d, t + i * 0.055, mtof(m), 0.4, { v: 0.09, a: 0.002, d: 0.16, s: 0, r: 0.2 }); tone(c, d, t + i * 0.055, mtof(m) * 3, 0.2, { v: 0.015, a: 0.002, d: 0.05, s: 0, r: 0.1 }); });
      tone(c, d, t + 0.2, mtof(103), 0.4, { v: 0.025, a: 0.004, d: 0.14, s: 0, r: 0.2 });
      glass(c, d, t + 0.12, 6, 0.4, 0.025);
    }],
    meter_tick: [0.09, (c, d, t) => { // a meter ticking up a notch (raise `rate` as it climbs)
      tone(c, d, t, 1320, 0.035, { type: 'triangle', to: 1480, gl: 0.03, v: 0.09, a: 0.001, d: 0.02, s: 0.2, r: 0.02 });
      noise(c, d, t, 0.004, { v: 0.08, a: 0.0005, d: 0.002, hp: 4000 });
    }],
    meter_fall: [0.32, (c, d, t) => tone(c, d, t, 990, 0.2, { type: 'triangle', to: 520, gl: 0.2, v: 0.08, a: 0.004, d: 0.1, s: 0.4, r: 0.06 })],
    meter_full: [0.8, (c, d, t) => { // a meter hits 100: two hard buzzes over a thump
      for (const s of [0, 0.22]) { tone(c, d, t + s, 220, 0.16, { type: 'square', v: 0.06, a: 0.003, r: 0.03, lp: 1800 }); tone(c, d, t + s, 233, 0.16, { type: 'square', v: 0.045, a: 0.003, r: 0.03, lp: 1800 }); }
      tone(c, d, t, 55, 0.4, { v: 0.25, a: 0.004, d: 0.15, s: 0, r: 0.1 });
    }],
    plug_click: [0.16, (c, d, t) => { // wiring: a plug seating in its socket
      noise(c, d, t, 0.012, { v: 0.55, a: 0.0005, d: 0.004, bp: 3200, q: 1.2 });
      noise(c, d, t + 0.018, 0.01, { v: 0.35, a: 0.0005, d: 0.003, bp: 2200, q: 1.5 });
      tone(c, d, t + 0.018, 210, 0.04, { to: 130, v: 0.22, a: 0.001, d: 0.018 });
    }],
    access_granted: [0.85, (c, d, t) => { // a terminal says yes: three blips up, then a held confirming tone
      [76, 79, 83].forEach((m, i) => tone(c, d, t + i * 0.08, mtof(m), 0.06, { type: 'square', v: 0.05, a: 0.002, r: 0.02, lp: 3500 }));
      tone(c, d, t + 0.26, mtof(88), 0.3, { type: 'triangle', v: 0.1, a: 0.004, d: 0.2, s: 0.5, r: 0.2 });
      tone(c, d, t + 0.26, mtof(95), 0.2, { v: 0.02, a: 0.004, d: 0.1, s: 0, r: 0.1 });
    }],
    key_type: [0.07, (c, d, t) => { // one keystroke on an old terminal keyboard (vary `rate` per key)
      noise(c, d, t, 0.008, { v: 0.4, a: 0.0005, d: 0.003, bp: 4200, q: 1.1 });
      noise(c, d, t + 0.012, 0.012, { v: 0.25, a: 0.0005, d: 0.005, bp: 1600, q: 1.4 });
      tone(c, d, t + 0.012, 300, 0.02, { to: 210, v: 0.08, a: 0.001, d: 0.008 });
    }],
    popup_clear: [0.2, (c, d, t) => { // a SafeSense pop-up dismissed: a small glassy flick up
      tone(c, d, t, mtof(91), 0.05, { type: 'triangle', to: mtof(96), gl: 0.04, v: 0.06, a: 0.002, d: 0.03, s: 0.3, r: 0.05 });
      noise(c, d, t, 0.05, { v: 0.04, a: 0.002, d: 0.02, hp: 5000 });
    }],
    crunch: [0.42, (c, d, t) => { // chip sale: a bite of a muesli bar (brittle cracks, then a little grit)
      for (let k = 0; k < 14; k++) { const x = k / 14; noise(c, d, t + x * 0.16 + rnd() * 0.012, 0.012, { v: 0.35 * (1 - x * 0.6), a: 0.0005, d: 0.004, bp: 1400 + rnd() * 2800, q: 1.4 }); }
      noise(c, d, t, 0.12, { v: 0.1, a: 0.003, d: 0.05, lp: 900 });
      for (let k = 0; k < 6; k++) noise(c, d, t + 0.22 + k * 0.03, 0.01, { v: 0.08, a: 0.0005, d: 0.004, bp: 2500, q: 1 });
    }],
    tap_pay: [0.32, (c, d, t) => { // a chip tap-to-pay: a soft tap, the reader's two quick beeps
      noise(c, d, t, 0.01, { v: 0.2, a: 0.0005, d: 0.004, bp: 1500, q: 1 });
      for (const s of [0.07, 0.17]) tone(c, d, t + s, 2093, 0.06, { type: 'triangle', v: 0.08, a: 0.002, r: 0.02 });
    }],
    marker_squeak: [0.48, (c, d, t) => { // a marker writing on a card: three short squeaky strokes
      for (const [s, f, l] of [[0, 2300, 0.11], [0.15, 2700, 0.08], [0.28, 2100, 0.14]]) {
        tone(c, d, t + s, f, l, { type: 'sawtooth', to: f * 1.12, gl: l, v: 0.03, a: 0.01, r: 0.03, bp: f, q: 6, vib: [45, 60] });
        noise(c, d, t + s, l, { v: 0.05, a: 0.01, r: 0.03, bp: 3800, q: 2 });
      }
    }],
    card_slide: [0.32, (c, d, t) => noise(c, d, t, 0.2, { v: 0.25, a: 0.03, r: 0.1, bp: 2600, fto: 1500, fgl: 0.2, q: 0.9 })],   // a card slid across a desk
    card_insert: [0.32, (c, d, t) => { // a card pushed into a reader: slide, latch
      noise(c, d, t, 0.16, { v: 0.2, a: 0.02, r: 0.04, bp: 2000, fto: 3000, fgl: 0.16, q: 1 });
      noise(c, d, t + 0.17, 0.01, { v: 0.5, a: 0.0005, d: 0.004, bp: 2600, q: 1.5 });
      tone(c, d, t + 0.17, 170, 0.06, { to: 110, v: 0.25, a: 0.001, d: 0.025 });
    }],
    accepted: [0.62, (c, d, t) => { // a JARVIS-era reader approves: a dusty square major third
      tone(c, d, t, mtof(72), 0.12, { type: 'square', v: 0.05, a: 0.003, r: 0.03, lp: 2200 });
      tone(c, d, t + 0.13, mtof(76), 0.3, { type: 'square', v: 0.05, a: 0.003, d: 0.2, s: 0.5, r: 0.12, lp: 2200 });
      tone(c, d, t + 0.13, mtof(79), 0.3, { type: 'triangle', v: 0.05, a: 0.003, d: 0.2, s: 0.5, r: 0.15 });
    }],
    button_press: [0.22, (c, d, t) => { // a big chunky plastic button (Teddy's NO): press, clack, spring back
      tone(c, d, t, 140, 0.08, { to: 85, v: 0.4, a: 0.001, d: 0.03 }); noise(c, d, t, 0.02, { v: 0.4, a: 0.0005, d: 0.008, bp: 1200, q: 1.2 });
      noise(c, d, t + 0.11, 0.012, { v: 0.2, a: 0.0005, d: 0.005, bp: 2200, q: 1.5 });
    }],
    tongs_click: [0.22, (c, d, t) => { // steel tongs clacking shut (a click and its bounce)
      for (const [s, v] of [[0, 1], [0.035, 0.55]]) {
        noise(c, d, t + s, 0.006, { v: 0.4 * v, a: 0.0003, d: 0.002, hp: 3000 });
        for (const [f, k] of [[2950, 0.05], [4730, 0.035], [6890, 0.02]]) tone(c, d, t + s, f, 0.12, { v: 0.035 * v, a: 0.0005, d: k, s: 0, r: 0.05 });
      }
    }],
    snag_turn: [0.55, (c, d, t) => { // a snag turned on the hotplate: the tongs, then the fresh side flaring
      SFX.tongs_click[1](c, d, t);
      noise(c, d, t + 0.05, 0.36, { v: 0.2, a: 0.01, d: 0.15, s: 0.3, r: 0.1, buf: CRACKLE, hp: 1800 });
      noise(c, d, t + 0.05, 0.28, { v: 0.1, a: 0.01, d: 0.1, s: 0.3, r: 0.1, hp: 3000 });
    }],
    sauce_squirt: [0.5, (c, d, t) => { // a squeeze bottle: the squeeze, wet sputters, the last of the air
      noise(c, d, t, 0.28, { v: 0.35, a: 0.02, d: 0.15, s: 0.5, r: 0.08, bp: 420, fto: 900, fgl: 0.28, q: 2.5 });
      for (let k = 0; k < 7; k++) noise(c, d, t + 0.06 + k * 0.045 + rnd() * 0.02, 0.025, { v: 0.25, a: 0.002, d: 0.01, bp: 300 + rnd() * 500, q: 3 });
      noise(c, d, t + 0.36, 0.06, { v: 0.12, a: 0.003, d: 0.03, bp: 2400, q: 0.8 });
    }],
    bin_scrape: [0.62, (c, d, t) => { // a burnt snag scraped into a steel bin
      const am = gn(c, d, 0.5); lfo(c, am.gain, 29, 0.5, t, t + 0.5, 'sawtooth');
      noise(c, am, t, 0.35, { v: 0.3, a: 0.03, r: 0.1, bp: 2200, fto: 1300, fgl: 0.35, q: 5 });
      tone(c, d, t + 0.38, 520, 0.12, { v: 0.04, a: 0.001, d: 0.06, s: 0, r: 0.08 }); tone(c, d, t + 0.38, 1310, 0.1, { v: 0.02, a: 0.001, d: 0.04, s: 0, r: 0.06 });
    }],
    swap_whoosh: [0.36, (c, d, t) => { // a quick move between stations (a mini-game's own SWAP)
      noise(c, d, t, 0.18, { v: 0.4, a: 0.08, r: 0.1, bp: 600, fto: 2600, fgl: 0.2, q: 1.1 });
      tone(c, d, t + 0.14, mtof(84), 0.05, { type: 'triangle', v: 0.04, a: 0.002, r: 0.06 });
    }],
    metronome: [0.07, (c, d, t) => { // the 92 bpm click (a woodblock tick); metronome_hi is the accented downbeat
      noise(c, d, t, 0.006, { v: 0.35, a: 0.0003, d: 0.002, bp: 2000, q: 2 });
      tone(c, d, t, 1050, 0.03, { v: 0.12, a: 0.0005, d: 0.012, s: 0, r: 0.02 });
    }],
    metronome_hi: [0.08, (c, d, t) => {
      noise(c, d, t, 0.006, { v: 0.5, a: 0.0003, d: 0.002, bp: 2800, q: 2 });
      tone(c, d, t, 1580, 0.04, { v: 0.16, a: 0.0005, d: 0.015, s: 0, r: 0.025 });
      tone(c, d, t, 3160, 0.02, { v: 0.03, a: 0.0005, d: 0.008 });
    }],
    desk_slap: [0.36, (c, d, t) => { // a hand flat on a desk
      noise(c, d, t, 0.025, { v: 0.7, a: 0.0005, d: 0.01, bp: 1100, q: 0.7 });
      tone(c, d, t, 120, 0.18, { to: 70, v: 0.45, a: 0.001, d: 0.06 }); noise(c, d, t, 0.12, { v: 0.2, a: 0.002, d: 0.05, lp: 500 });
    }],
    time_jump: [0.85, (c, d, t) => { // a jump in time: a tape spooling forward, a tick at the end
      tone(c, d, t, 180, 0.6, { type: 'sawtooth', to: 1400, gl: 0.6, v: 0.04, a: 0.05, r: 0.08, lp: 2500, vib: [30, 40] });
      noise(c, d, t, 0.6, { v: 0.15, a: 0.1, r: 0.08, bp: 800, fto: 4000, fgl: 0.6, q: 1.2 });
      clockTick(c, d, t + 0.7, 2600);
    }],

    // ---- samples (spec §13.6): each short, usable as a lure (the whole buffer) and as a sequencer hit (SMP below)
    smp_alarm: [1.3, (c, d, t) => siren(c, d, t, 1.2, 0.14)],
    smp_radio: [2.4, (c, d, t) => { // the store radio through its speaker, one bar
      const b = band(c, d, 300, 3400), st = 60 / 120 / 4;
      for (let s = 0; s < 16; s += 2) chord(c, b, t + s * st, [52, 59, 64], st * 0.8, { type: 'square', v: s % 8 ? 0.016 : 0.024, a: 0.002, r: 0.04, lp: 1800, det: [-6, 6] });
      for (let s = 0; s < 16; s += 2) jingle(c, b, t + s * st, s % 4 ? 0.05 : 0.08);
      kick(c, b, t, 0.5); kick(c, b, t + 8 * st, 0.4); snare(c, b, t + 4 * st, 0.3); snare(c, b, t + 12 * st, 0.3);
      for (const [s, m] of [[0, 80], [2, 80], [4, 78], [6, 76], [12, 71]]) tone(c, b, t + s * st, mtof(m), st * 1.8, { type: 'sawtooth', v: 0.03, a: 0.01, r: 0.05, lp: 2200 });
    }],
    smp_kettle: [2.5, (c, d, t) => { // the click, a short boil, Des: "Tea?"
      kclick(c, d, t, 0.6);
      noise(c, d, t + 0.05, 1.3, { v: 0.16, a: 0.9, r: 0.25, bp: 500, fto: 2400, fgl: 1.3, q: 1.4 });
      noise(c, d, t + 0.05, 1.3, { v: 0.1, a: 0.7, r: 0.25, brown: true, lp: 400 });
      tone(c, d, t + 1.65, mtof(79), 0.08, { v: 0.12, a: 0.008, d: 0.06, s: 0.5, r: 0.04 });
      tone(c, d, t + 1.78, mtof(84), 0.17, { to: mtof(87), gl: 0.16, v: 0.12, a: 0.008, d: 0.1, s: 0.5, r: 0.12 });
    }],
    smp_chip: [1.5, (c, d, t) => { fmBell(c, d, t, 88, 0.9, 0.08); fmBell(c, d, t + 0.06, 95, 1.1, 0.07); }],
    smp_hover: [2.4, (c, d, t) => { // a parked hover-car humming up
      const g = c.createGain(); g.connect(d); g.gain.setValueAtTime(0.3, t); g.gain.linearRampToValueAtTime(1, t + 0.25); g.gain.setValueAtTime(1, t + 1.9); g.gain.linearRampToValueAtTime(0, t + 2.35);
      tone(c, g, t, 55, 2.35, { type: 'sawtooth', to: 66, gl: 0.4, v: 0.2, a: 0.02, r: 0.02, lp: 520 }); tone(c, g, t, 55.5, 2.35, { type: 'sawtooth', to: 66.5, gl: 0.4, v: 0.16, a: 0.02, r: 0.02, lp: 520 });
      tone(c, g, t, 220, 2.35, { to: 264, gl: 0.4, v: 0.05, a: 0.02, r: 0.02, vib: [3, 10] });
      noise(c, g, t, 2.35, { v: 0.1, a: 0.02, r: 0.02, bp: 800, q: 0.7 });
    }],
    smp_bay: [2.5, (c, d, t) => { // a pelican's bill-clack, then the bay washing under the jetty
      for (const s of [0, 0.045, 0.085, 0.13]) { noise(c, d, t + s, 0.012, { v: 0.4, a: 0.0005, d: 0.006, bp: 1500, q: 3 }); tone(c, d, t + s, 380, 0.02, { to: 300, v: 0.14, a: 0.0005, d: 0.01 }); }
      noise(c, d, t + 0.2, 2, { v: 0.4, a: 0.6, d: 0.8, s: 0.3, r: 0.5, brown: true, lp: 650 });
      noise(c, d, t + 0.5, 1.4, { v: 0.08, a: 0.3, d: 0.5, r: 0.4, bp: 1100, q: 0.8 });
      tone(c, d, t + 1.1, 150, 0.08, { to: 120, v: 0.08, a: 0.01, d: 0.05 }); // a hollow knock under the boards
    }],
    smp_piano: [2.4, (c, d, t) => { piano(c, d, t, 66, 0.12); piano(c, d, t, 54, 0.05); piano(c, d, t + 0.55, 62, 0.11); }], // the 'two' motif, F#4 -> D4
    smp_cicadas: [2.4, (c, d, t) => {
      const g = c.createGain(); g.connect(d); g.gain.value = 0.5; lfo(c, g.gain, 42, 0.5, t, t + 2.4);
      noise(c, g, t, 2.2, { v: 0.6, a: 0.05, d: 1.2, s: 0.6, r: 0.15, bp: 5200, q: 5 });
      noise(c, g, t, 2.2, { v: 0.35, a: 0.05, d: 1.2, s: 0.6, r: 0.15, bp: 6300, q: 7 });
    }],
    smp_brick: [2.2, (c, d, t) => { brickRing(c, d, t); brickRing(c, d, t + 1.15); }],
    smp_boom: [2.1, (c, d, t) => SFX.boom_gate[1](c, d, t)],
    smp_whir: [2.3, (c, d, t) => { // a drone whipping past at 25 km/h
      const g = c.createGain(); g.connect(d); g.gain.setValueAtTime(0.15, t); g.gain.linearRampToValueAtTime(1, t + 0.5); g.gain.linearRampToValueAtTime(0, t + 2.2);
      for (const f of [196, 197, 245, 246.5]) { const os = c.createOscillator(); os.type = 'triangle'; os.frequency.setValueAtTime(f * 1.08, t); os.frequency.setValueAtTime(f * 1.08, t + 0.45); os.frequency.linearRampToValueAtTime(f * 0.9, t + 0.8); os.connect(filt(c, gn(c, g, 0.09), { lp: 1500 }, t, 2)); os.start(t); os.stop(t + 2.25); }
      noise(c, g, t, 2.2, { v: 0.12, a: 0.01, r: 0.02, bp: 1200, fto: 800, fgl: 1, q: 1.2 });
    }],
    smp_laugh: [2.5, (c, d, t) => laughSynth(c, d, t, 110)],
    smp_sizzle: [2, (c, d, t) => SFX.sizzle[1](c, d, t)],
    smp_train: [1.7, (c, d, t) => SFX.train_chime[1](c, d, t)],
    smp_uke: [2, (c, d, t) => { strum(c, d, t, 'D', 0.36); strum(c, d, t + 0.5, 'D', 0.22, -1); }],
  };
  // How each sample sits in a sequencer lane: hit = where its transient is (s), root = its pitch (MIDI) for re-pitching
  // in the chord lane, chord = a stem family that plays the actual chord (the ukulele and the piano "doubling the chords").
  const SMP = { alarm: {}, radio: {}, kettle: {}, chip: { root: 88 }, hover: { hit: 0.08 }, bay: {}, piano: { chord: 'pno', root: 66 }, cicadas: { hit: 0.05 },
    brick: { root: 84 }, boom: {}, whir: { hit: 0.45 }, laugh: { hit: 0.02 }, sizzle: {}, train: { root: 80 }, uke: { chord: 'uke', root: 62 } };

  // ---------------------------------------------------------- baked loops (ambience beds, 32 kHz, RMS-normalised)
  // { len, rms, whole(c, d, len): rendered in one go, bars: [count, fn(c, d, k)]: each bar rendered on its own
  //   context (one big graph renders many times slower), tail: release time per chunk, rev: [sec, mix, damp] and
  //   band: [lo, hi] applied over the assembled loop, xf: crossfade the tail over the head (noise beds),
  //   once: no wrap-around (a cue that plays to its end, e.g. the credits' coda) }
  // Everything else wraps note and reverb tails round onto the start, so every loop is seamless.
  const dur = (n, bpm) => n * 4 * 60 / bpm;
  const LOOPS = {
    // Rue's
    rain: { len: 4, rms: 0.05, xf: 1, whole: (c, d) => { noise(c, d, 0, 4.5, { v: 0.3, brown: true, lp: 1400 }); noise(c, d, 0, 4.5, { v: 0.03, hp: 5000 }); noise(c, d, 0, 4.5, { v: 0.5, buf: DROPS, hp: 1500 }); } },
    rain_heavy: { len: 4, rms: 0.09, xf: 1, whole: (c, d) => {
      noise(c, d, 0, 4.5, { v: 0.4, brown: true, lp: 2400 }); noise(c, d, 0, 4.5, { v: 0.06, hp: 3000 });
      noise(c, d, 0, 4.5, { v: 0.4, brown: true, lp: 200 });
      noise(c, d, 0, 4.5, { v: 0.7, buf: DROPS, hp: 1200 }); noise(c, d, 0, 4.5, { v: 0.5, buf: DROPS, hp: 1200 });
    } },
    hum: { len: 2, rms: 0.02, xf: 1, whole: (c, d) => {
      tone(c, d, 0, 100, 2.5, { type: 'sawtooth', v: 0.5, lp: 350 }); tone(c, d, 0, 100, 2.5, { v: 0.3 });
      tone(c, d, 0, 200, 2.5, { v: 0.12 }); tone(c, d, 0, 100, 2.5, { type: 'square', v: 0.04, hp: 2500 });
    } },
    aircon: { len: 4, rms: 0.025, xf: 1, whole: (c, d) => {
      noise(c, d, 0, 4.5, { v: 0.5, brown: true, lp: 500 }); noise(c, d, 0, 4.5, { v: 0.03, bp: 1200, q: 0.5 });
      for (const s of [0.9, 2.9]) noise(c, d, s, 0.004, { v: 0.12, a: 0.0005, d: 0.002, hp: 2500 });
    } },
    transistor: { len: 6, rms: 0.05, xf: 1, whole: (c, d) => { // a far-off announcer and a band on a transistor radio (Teddy's booth)
      const f = band(c, d, 350, 2800);
      babble(c, f, 0, 6.4, { f: 115, v: 0.3 });
      chord(c, f, 0, [57, 61, 64], 6.4, { type: 'triangle', v: 0.02, a: 0.5, r: 0.1, lp: 2000 });
      noise(c, d, 0, 6.4, { v: 0.1, buf: CRACKLE, lp: 5000 }); noise(c, d, 0, 6.4, { v: 0.008, bp: 3000, q: 0.7 });
    } },
    alarm: { len: 1, rms: 0.12, xf: 1, whole: (c, d) => siren(c, d, 0, 1.3, 0.2) },
    dynamo: { len: 1, rms: 0.1, xf: 1, whole: (c, d) => {
      tone(c, d, 0, 220, 1.3, { type: 'sawtooth', v: 0.4, bp: 700, q: 2 }); tone(c, d, 0, 440, 1.3, { type: 'triangle', v: 0.1 });
      noise(c, d, 0, 1.3, { v: 0.05, bp: 1100, q: 1.5 });
    } },
    clock_tick: { len: 2, rms: 0.01, tail: 0.1, whole: (c, d) => { clockTick(c, d, 0.5, 3500); clockTick(c, d, 1.5, 2600); } },
    city: { len: 6, rms: 0.04, xf: 1, whole: (c, d) => {
      const g = gn(c, d, 0.8); lfo(c, g.gain, 1 / 6, 0.2);
      noise(c, g, 0, 6.5, { v: 0.4, brown: true, lp: 320 }); noise(c, g, 0, 6.5, { v: 0.1, brown: true, lp: 1100 });
      noise(c, d, 0, 6.5, { v: 0.008, bp: 2000, q: 0.5 });
    } },
    typing: { len: 4, rms: 0.03, tail: 0.2, bars: [4, (c, d) => { for (let x = 0.02; x < 1; x += rnd() < 0.12 ? 0.35 + rnd() * 0.3 : 0.07 + rnd() * 0.08) type1(c, d, x, 0.2 + rnd() * 0.15); }] },
    fluoro: { len: 3, rms: 0.03, xf: 1, whole: (c, d) => fluoro(c, d, 0, 3.4, 0.3, [[0.6, 0.85], [2.1, 2.25]]) },
    // TWO's (spec §15.5): weather
    rain_glass: { len: 4, rms: 0.045, xf: 1, whole: (c, d) => { // rain on a window: taps and a soft wash through the glass
      noise(c, d, 0, 4.5, { v: 0.25, brown: true, lp: 900 }); noise(c, d, 0, 4.5, { v: 0.6, buf: DROPS, bp: 3600, q: 2.5 });
      noise(c, d, 0, 4.5, { v: 0.35, buf: DRIPS, bp: 2200, q: 3 }); noise(c, d, 0, 4.5, { v: 0.008, hp: 6000 });
    } },
    rain_roof: { len: 4, rms: 0.07, xf: 1, whole: (c, d) => { // drumming on an iron roof
      noise(c, d, 0, 4.5, { v: 0.7, buf: DROPS, bp: 900, q: 1.3 }); noise(c, d, 0, 4.5, { v: 0.5, buf: DROPS, bp: 2600, q: 2 });
      noise(c, d, 0, 4.5, { v: 0.3, brown: true, lp: 1600 }); noise(c, d, 0, 4.5, { v: 0.3, brown: true, lp: 160 });
    } },
    rain_street: { len: 4, rms: 0.08, xf: 1, whole: (c, d) => { // a wet street: wash, splashes, a gutter running
      noise(c, d, 0, 4.5, { v: 0.05, lp: 3500 }); noise(c, d, 0, 4.5, { v: 0.35, brown: true, lp: 1800 });
      noise(c, d, 0, 4.5, { v: 0.6, buf: DROPS, hp: 1200 }); noise(c, d, 0, 4.5, { v: 0.3, buf: DROPS, bp: 1700, q: 1 });
      noise(c, d, 0, 4.5, { v: 0.5, buf: DRIPS, lp: 1600 });
    } },
    thunder: { len: 20, rms: 0.035, tail: 6, whole: (c, d) => { // distant storm: two far rolls per 20 s (wraps)
      for (const [t0, k] of [[3, 1], [13.5, 0.7]]) for (const [s, v] of [[0, 0.35], [0.6, 0.5], [1.5, 0.4], [2.6, 0.3], [3.6, 0.18]]) noise(c, d, t0 + s, 0.8, { v: v * k, a: 0.3, d: 0.5, r: 0.9, brown: true, lp: 240 });
      noise(c, d, 0, 20, { v: 0.05, brown: true, lp: 120, a: 0.01, r: 0.01 });
    } },
    wind: { len: 8, rms: 0.04, xf: 1, whole: (c, d) => {
      const f = bp(c, 500, 1.4), g = gn(c, d, 0.7); f.connect(g); lfo(c, f.frequency, 1 / 8, 260); lfo(c, g.gain, 0.25, 0.3);
      noise(c, f, 0, 8.5, { v: 0.8 }); noise(c, d, 0, 8.5, { v: 0.25, brown: true, lp: 300 });
    } },
    // nature
    cicadas: { len: 4, rms: 0.035, xf: 1, whole: (c, d) => {
      const g = gn(c, d, 0.6); lfo(c, g.gain, 0.5, 0.4);
      const tr = gn(c, g, 0.55); lfo(c, tr.gain, 40, 0.45); // the trill (160 cycles a loop)
      noise(c, tr, 0, 4.5, { v: 0.5, bp: 5200, q: 6 }); noise(c, tr, 0, 4.5, { v: 0.3, bp: 6100, q: 8 }); noise(c, g, 0, 4.5, { v: 0.08, bp: 4400, q: 4 });
    } },
    waves: { len: 8, rms: 0.06, xf: 1, whole: (c, d) => { // the bay under the jetty: two swells a loop, laps, a hollow knock
      const g = gn(c, d, 0.6); lfo(c, g.gain, 0.25, 0.4);
      noise(c, g, 0, 8.5, { v: 0.5, brown: true, lp: 700 }); noise(c, g, 0, 8.5, { v: 0.04, bp: 2500, q: 0.5 });
      for (const s of [1.6, 2.15, 5.5, 6.1]) { noise(c, d, s, 0.3, { v: 0.06, a: 0.05, d: 0.12, r: 0.2, bp: 900, q: 1.2 }); tone(c, d, s + 0.05, 150, 0.05, { to: 120, v: 0.05, a: 0.005, d: 0.04 }); }
    } },
    birds: { len: 8, rms: 0.025, tail: 0.6, whole: (c, d) => {
      const R = rng(42);
      for (let x = 0.3; x < 7.6; x += 0.6 + R() * 1.6) { const f = 2600 + R() * 2400, n = 2 + (R() * 4 | 0); for (let k = 0; k < n; k++) tone(c, d, x + k * 0.09, f * (1 + R() * 0.1), 0.05, { to: f * (0.75 + R() * 0.6), gl: 0.05, v: 0.05 + R() * 0.03, a: 0.005, r: 0.02 }); }
    } },
    bell_buoy: { len: 12, rms: 0.025, tail: 6, whole: (c, d) => { bell(c, d, 1, mtof(69), 0.07, 5); bell(c, d, 6.8, mtof(69), 0.05, 5); noise(c, d, 0, 12, { v: 0.1, brown: true, lp: 400, a: 0.01, r: 0.01 }); } },
    // people
    crowd_whisper: { len: 8, rms: 0.03, xf: 1, whole: (c, d) => { const b = band(c, d, 900, 6000); for (let k = 0; k < 6; k++) babble(c, b, k * 0.3, 8.4, { v: 0.25, voiced: 0, breath: 1, fast: k % 2 === 0 }); } },
    // machines
    server: { len: 4, rms: 0.035, xf: 1, whole: (c, d) => {
      for (const [f, v] of [[50, 0.3], [100, 0.2], [150, 0.06]]) tone(c, d, 0, f, 4.5, { v });
      noise(c, d, 0, 4.5, { v: 0.4, brown: true, lp: 600 }); noise(c, d, 0, 4.5, { v: 0.05, bp: 320, q: 1.5 }); noise(c, d, 0, 4.5, { v: 0.008, hp: 7000 });
      for (const s of [0.7, 0.78, 2.3, 3.1, 3.15]) clockTick(c, d, s, 1800 + rnd() * 900);
    } },
    fridge: { len: 4, rms: 0.02, xf: 1, whole: (c, d) => { tone(c, d, 0, 50, 4.5, { type: 'triangle', v: 0.3, lp: 300 }); tone(c, d, 0, 100, 4.5, { v: 0.08 }); noise(c, d, 0, 4.5, { v: 0.2, brown: true, lp: 250 }); } },
    hotplate: { len: 3, rms: 0.05, xf: 1, whole: (c, d) => { noise(c, d, 0, 3.5, { v: 0.25, hp: 3000 }); noise(c, d, 0, 3.5, { v: 0.6, buf: CRACKLE, hp: 1500 }); noise(c, d, 0, 3.5, { v: 0.3, buf: DRIPS, bp: 900, q: 1 }); } },
    train_clack: { len: 4, rms: 0.06, xf: 1, whole: (c, d) => { // the rails: clack-clack pairs, rumble, a soft motor whine
      noise(c, d, 0, 4.5, { v: 0.5, brown: true, lp: 260 }); tone(c, d, 0, 420, 4.5, { v: 0.008, vib: [0.25, 20] });
      for (const s of [0.6, 0.73, 2.6, 2.73]) { noise(c, d, s, 0.03, { v: 0.45, a: 0.001, d: 0.012, bp: 700, q: 1.2 }); tone(c, d, s, 95, 0.05, { to: 70, v: 0.3, a: 0.001, d: 0.02 }); }
    } },
    drone_hum: { len: 2, rms: 0.05, xf: 1, whole: (c, d) => { // one courtesy drone: four rotors beating (periodic in 2 s)
      for (const f of [190, 190.5, 236, 237]) tone(c, d, 0, f, 2.5, { type: 'triangle', v: 0.08, lp: 1400 });
      noise(c, d, 0, 2.5, { v: 0.08, bp: 1100, q: 1.2 }); tone(c, d, 0, 1900, 2.5, { v: 0.005 });
    } },
    drones: { len: 6, rms: 0.04, xf: 1, whole: (c, d) => { // a swarm, idling like fireflies
      const g = gn(c, d, 0.7); lfo(c, g.gain, 1 / 3, 0.25);
      for (let k = 0; k < 10; k++) tone(c, g, 0, 170 + k * 13.5, 6.5, { type: 'triangle', v: 0.03, lp: 900, det: rnd() * 30 });
      noise(c, g, 0, 6.5, { v: 0.1, bp: 1000, q: 0.9 });
    } },
    hover: { len: 4, rms: 0.05, xf: 1, whole: (c, d) => { // a hover-car idling (0.5 Hz beat: two cycles a loop)
      tone(c, d, 0, 62, 4.5, { type: 'sawtooth', v: 0.3, lp: 380 }); tone(c, d, 0, 62.5, 4.5, { type: 'sawtooth', v: 0.25, lp: 380 });
      tone(c, d, 0, 248, 4.5, { v: 0.04, vib: [0.5, 6] }); noise(c, d, 0, 4.5, { v: 0.06, bp: 700, q: 0.6 });
    } },
    hover_traffic: { len: 8, rms: 0.035, xf: 1, whole: (c, d) => { // distant hover traffic: two passes a loop
      for (const t0 of [0.4, 4.6]) { const g = c.createGain(); g.connect(d); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(1, t0 + 1.6); g.gain.linearRampToValueAtTime(0, t0 + 3.4); tone(c, g, t0, 64, 3.4, { type: 'sawtooth', to: 57, v: 0.15, a: 0.01, r: 0.02, lp: 420 }); noise(c, g, t0, 3.4, { v: 0.05, a: 0.01, r: 0.02, bp: 800, q: 0.6 }); }
      noise(c, d, 0, 8.5, { v: 0.12, brown: true, lp: 300 });
    } },
    scooter: { len: 2, rms: 0.06, xf: 1, whole: (c, d) => { // hover-scooter whine: rate() follows the throttle (25 km/h, always)
      tone(c, d, 0, 220, 2.5, { type: 'sawtooth', v: 0.1, bp: 900, q: 2 }); tone(c, d, 0, 440, 2.5, { type: 'triangle', v: 0.06 });
      tone(c, d, 0, 1320, 2.5, { v: 0.012 }); noise(c, d, 0, 2.5, { v: 0.05, bp: 1800, q: 0.8 });
    } },
    roller: { len: 1, rms: 0.08, xf: 1, whole: (c, d) => { // the roller door straining against a hold: a rattle (24 a loop)
      for (let k = 0; k < 28; k++) noise(c, d, k / 24, 0.01, { v: 0.12 + (k % 3) * 0.04, a: 0.0005, d: 0.005, bp: 1500 + (k % 5) * 250, q: 3 });
      noise(c, d, 0, 1.3, { v: 0.2, brown: true, lp: 400 });
    } },
    tape_hiss: { len: 2, rms: 0.02, xf: 1, whole: (c, d) => { noise(c, d, 0, 2.5, { v: 0.3, hp: 3500 }); noise(c, d, 0, 2.5, { v: 0.1, bp: 7000, q: 0.7 }); tone(c, d, 0, 50, 2.5, { v: 0.02 }); } },
    ringing: { len: 4, rms: 0.035, xf: 1, whole: (c, d) => { tone(c, d, 0, 6800, 4.5, { v: 0.3 }); tone(c, d, 0, 6800.25, 4.5, { v: 0.12 }); tone(c, d, 0, 3400, 4.5, { v: 0.015 }); } }, // 3.5: heartbeat-free high ringing
    hum_voice: { len: 2, rms: 0.08, xf: 1, whole: (c, d) => hum(c, d, 0, 52, 2.5, 0.2) }, // Blend In: holding a hummed note (rate/vol from the mini-game)
  };

  // ---------------------------------------------------------- the sets' beds (every loop name docs/sets/*.md uses)
  // LOOP_ALIAS: a variant of a baked bed, nothing to bake: name -> [bed, vol, rate, lowpass Hz (0 = open)].
  const LOOP_ALIAS = {
    surf: ['waves', 1, 1, 0], surf_far: ['waves', 0.6, 0.94, 650], bay_far: ['waves', 0.5, 0.9, 520], water_lap: ['waves', 0.55, 1.18, 950],
    wind_soft: ['wind', 0.5, 0.9, 900], wind_bay: ['wind', 0.85, 0.92, 0], wind_high: ['wind', 1, 1.25, 0], wind_fast: ['wind', 1.1, 1.6, 0], wind_gust: ['wind', 1, 1.1, 0],
    thunder_far: ['thunder', 0.7, 1, 180], drone_idle: ['drone_hum', 0.5, 1, 1200], drone_swarm: ['drones', 1, 1, 0], drone_ring: ['drones', 0.7, 0.85, 700],
    hover_far: ['hover_traffic', 0.7, 1, 900], hover_idle: ['hover', 0.6, 1, 0], server_hum: ['server', 1, 1, 0],
    hq_hush: ['aircon', 0.7, 1, 800], atrium_air: ['aircon', 0.9, 0.8, 0], room_tone: ['aircon', 0.6, 0.7, 500], hall_hum: ['aircon', 0.8, 0.6, 0], padded_hush: ['aircon', 0.45, 1, 400],
    rail_clack: ['train_clack', 1, 1, 0], train_hum: ['hum', 0.5, 0.9, 500], train_idle: ['hum', 0.35, 0.8, 400], lift_hum: ['hum', 0.5, 1.2, 700], desk_hum: ['hum', 0.25, 1, 600],
    neon_hum: ['fluoro', 0.6, 1, 0], clock: ['clock_tick', 1, 1, 0], whisper_crowd: ['crowd_whisper', 1, 1, 0], sizzle_plate: ['hotplate', 1, 1, 0],
    radio_tinny: ['transistor', 0.7, 1, 0], tinnitus: ['ringing', 0.6, 1, 0], city_far_quiet: ['city', 0.35, 1, 500], birds_dawn: ['birds', 1.2, 1.12, 0],
  };
  // LATE loops: baked in the background after boot (from the first YES), or the moment a scene asks for one (it fades
  // in when ready), so the loader doesn't wait for them. Same recipe shape as LOOPS.
  const LATE = {
    gulls: { len: 10, rms: 0.03, tail: 0.8, whole: (c, d) => { // a few gull cries, near and far
      const R = rng(7), f = band(c, d, 500, 4200);
      for (const [t0, n, v] of [[0.6, 3, 1], [4.2, 2, 0.5], [6.9, 4, 0.8]]) for (let k = 0; k < n; k++) {
        const t = t0 + k * (0.32 + R() * 0.1), f0 = 1250 + R() * 250;
        tone(c, f, t, f0, 0.22, { type: 'sawtooth', to: f0 * 0.62, gl: 0.22, v: 0.09 * v, a: 0.02, d: 0.1, s: 0.5, r: 0.05, bp: 1700, q: 2.5, vib: [22, 40] });
      }
    } },
    crickets: { len: 4, rms: 0.02, tail: 0.2, whole: (c, d) => {
      const R = rng(11);
      for (const [f, per, v] of [[4600, 0.62, 0.05], [5200, 0.81, 0.03], [3900, 1.13, 0.02]]) for (let t = R() * per; t < 4; t += per) for (let k = 0; k < 3; k++) tone(c, d, t + k * 0.035, f, 0.02, { v, a: 0.002, d: 0.01, r: 0.008 });
      noise(c, d, 0, 4.2, { v: 0.01, bp: 4800, q: 4 });
    } },
    clink: { len: 8, rms: 0.012, tail: 0.6, whole: (c, d) => { // polite cups and plates, sparse
      const R = rng(5);
      for (let t = 0.4; t < 7.8; t += 0.9 + R() * 1.6) {
        const f = 2400 + R() * 1800;
        tone(c, d, t, f, 0.25, { v: 0.05, a: 0.001, d: 0.06, r: 0.2 }); tone(c, d, t, f * 2.76, 0.12, { v: 0.02, a: 0.001, d: 0.03, r: 0.1 });
        if (R() < 0.4) tone(c, d, t + 0.09, f * 1.1, 0.15, { v: 0.03, a: 0.001, d: 0.04, r: 0.1 });
      }
    } },
    crowd_polite: { len: 8, rms: 0.025, xf: 1, whole: (c, d) => { const b = band(c, d, 150, 1800); for (let k = 0; k < 5; k++) babble(c, b, k * 0.2, 8.4, { v: 0.2, f: 110 + k * 25, fast: k % 2 === 0 }); } },
    crowd_low: { len: 8, rms: 0.03, xf: 1, whole: (c, d) => { const b = band(c, d, 120, 1200); for (let k = 0; k < 4; k++) babble(c, b, k * 0.3, 8.4, { v: 0.25, f: 100 + k * 30 }); } },
    crowd_laugh: { len: 12, rms: 0.035, xf: 1, whole: (c, d) => { // a murmur and the odd burst of laughter
      const b = band(c, d, 150, 2600);
      for (let k = 0; k < 4; k++) babble(c, b, k * 0.3, 12.4, { v: 0.16, f: 120 + k * 30 });
      laughSynth(c, gn(c, b, 0.25), 2.5, 150); laughSynth(c, gn(c, b, 0.18), 8.1, 190);
    } },
    crowd_street: { len: 10, rms: 0.05, xf: 1, whole: (c, d) => { // happy, normal volume
      const b = band(c, d, 150, 3200);
      for (let k = 0; k < 7; k++) babble(c, b, k * 0.15, 10.4, { v: 0.22, f: 105 + k * 22, fast: k % 3 === 0 });
      laughSynth(c, gn(c, b, 0.2), 4, 170);
    } },
    platform_murmur: { len: 8, rms: 0.03, xf: 1, whole: (c, d) => {
      const b = band(c, d, 200, 1500);
      for (let k = 0; k < 4; k++) babble(c, b, k * 0.25, 8.4, { v: 0.18, f: 115 + k * 28 });
      noise(c, d, 0, 8.4, { v: 0.12, brown: true, lp: 220 });
    } },
    street_arvo: { len: 12, rms: 0.035, xf: 1, whole: (c, d) => { // distant hover hum, a bus pulling in, a bird or two
      const g = gn(c, d, 0.8); lfo(c, g.gain, 1 / 12, 0.3);
      noise(c, g, 0, 12.4, { v: 0.35, brown: true, lp: 320 });
      tone(c, d, 3, 58, 5, { type: 'sawtooth', to: 46, gl: 5, v: 0.06, a: 1.6, r: 2, lp: 260 }); noise(c, d, 7.4, 0.5, { v: 0.05, a: 0.05, r: 0.4, hp: 2500 });   // the bus: in, brakes sigh
      const R = rng(3); for (const t of [1.2, 9.6]) for (let k = 0; k < 3; k++) { const f = 2900 + R() * 1500; tone(c, d, t + k * 0.1, f, 0.05, { to: f * 0.8, gl: 0.05, v: 0.03, a: 0.005, r: 0.02 }); }
    } },
    snore: { len: 6, rms: 0.03, tail: 0.6, whole: (c, d) => { // in (a rattle) ... out (a sigh)
      noise(c, d, 0.2, 1.6, { v: 0.12, a: 0.8, r: 0.5, bp: 520, q: 1 });
      tone(c, d, 0.5, 62, 1.2, { type: 'sawtooth', v: 0.12, a: 0.4, r: 0.4, lp: 380, vib: [28, 60] });
      noise(c, d, 2.6, 1.4, { v: 0.08, a: 0.3, r: 0.9, bp: 900, q: 0.8 });
    } },
    mangrove: { len: 8, rms: 0.03, xf: 1, whole: (c, d) => { // crab clicks, insects, drips, the mud
      noise(c, d, 0, 8.4, { v: 0.3, buf: CRACKLE, bp: 2600, q: 1.2 });
      const g = gn(c, d, 0.5); lfo(c, g.gain, 13, 0.45); noise(c, g, 0, 8.4, { v: 0.06, bp: 6800, q: 7 });
      noise(c, d, 0, 8.4, { v: 0.2, buf: DRIPS, lp: 1500 }); noise(c, d, 0, 8.4, { v: 0.15, brown: true, lp: 200 });
    } },
    fan: { len: 2, rms: 0.02, xf: 1, whole: (c, d) => { // a ceiling fan: the blade whoosh, its motor, one tick a turn
      const g = gn(c, d, 0.6); lfo(c, g.gain, 2, 0.35);
      noise(c, g, 0, 2.3, { v: 0.4, brown: true, lp: 700 }); tone(c, d, 0, 48, 2.3, { v: 0.05 }); clockTick(c, d, 0.7, 1400);
    } },
    drip: { len: 7, rms: 0.015, tail: 0.4, whole: (c, d) => { for (const [t, f] of [[0.5, 900], [2.2, 1100], [3.1, 820], [5.4, 1000]]) tone(c, d, t, f, 0.06, { to: f * 1.9, gl: 0.05, v: 0.12, a: 0.001, d: 0.03, r: 0.03 }); } },
    cleaner_swish: { len: 3, rms: 0.02, xf: 1, whole: (c, d) => { const g = gn(c, d, 0.6); lfo(c, g.gain, 3, 0.4); noise(c, g, 0, 3.3, { v: 0.3, bp: 2500, q: 0.7 }); tone(c, d, 0, 180, 3.3, { type: 'triangle', v: 0.03, lp: 600 }); } },
    shelf_servo: { len: 6, rms: 0.03, tail: 0.5, whole: (c, d) => { for (const t of [0.5, 3.3]) { tone(c, d, t, 300, 1.2, { type: 'sawtooth', to: 520, gl: 1.2, v: 0.06, a: 0.08, r: 0.2, bp: 1200, q: 2 }); noise(c, d, t, 1.2, { v: 0.03, a: 0.08, r: 0.2, bp: 3000, q: 1 }); } } },
    hangar_charge: { len: 6, rms: 0.03, xf: 1, whole: (c, d) => { // hundreds of tiny charging whines
      const R = rng(19);
      for (let k = 0; k < 14; k++) tone(c, d, 0, 2000 + R() * 3000, 6.3, { v: 0.008 + R() * 0.006, a: 0.2, r: 0.01, vib: [0.3 + R() * 0.8, 15 + R() * 20] });
      noise(c, d, 0, 6.3, { v: 0.1, brown: true, lp: 300 }); tone(c, d, 0, 100, 6.3, { v: 0.03 });
    } },
    alarm_soft: { len: 2, rms: 0.04, tail: 0.3, whole: (c, d) => { for (const [t, f] of [[0, 660], [0.5, 880], [1, 660], [1.5, 880]]) tone(c, d, t, f, 0.42, { v: 0.1, a: 0.03, d: 0.2, s: 0.6, r: 0.06 }); } },
    valley_music_far: { len: dur(4, 112), rms: 0.05, band: [35, 600], tail: 0.5, bars: [4, (c, d, k) => { // the bars on Brunswick St, through walls
      const st = 60 / 112 / 4, rt = [33, 33, 29, 31][k];
      for (const s of [0, 4, 8, 12]) kick(c, d, s * st, 0.6);
      for (const s of [0, 3, 6, 8, 11, 14]) bassN(c, d, s * st, rt + (s === 14 ? 7 : 0), st * 1.6, 0.35, 500);
      for (const s of [2, 6, 10, 14]) chord(c, d, s * st, [rt + 24, rt + 28, rt + 31], st, { v: 0.02, a: 0.01, r: 0.05, lp: 700 });
    }] },
    parade_far: { len: 8, rms: 0.03, xf: 1, whole: (c, d) => { // muffled surf + a glassy hover-car going past, through the open door
      const g = gn(c, d, 0.6); lfo(c, g.gain, 0.25, 0.4); noise(c, g, 0, 8.4, { v: 0.5, brown: true, lp: 500 });
      const h = c.createGain(); h.connect(d); h.gain.setValueAtTime(0, 2); h.gain.linearRampToValueAtTime(1, 3.6); h.gain.linearRampToValueAtTime(0, 5.4);
      tone(c, h, 2, 64, 3.4, { type: 'sawtooth', to: 57, v: 0.12, a: 0.01, r: 0.02, lp: 420 }); tone(c, h, 2, 1900, 3.4, { v: 0.006, vib: [3, 20] });
    } },
  };
  const BAKING_L = {};
  function ensureLate(name) { // a LATE loop's buffer, baking it now if it isn't yet
    if (L[name]) return Promise.resolve(L[name]);
    if (!LATE[name] || !canBake()) return Promise.resolve(null);
    return BAKING_L[name] || (BAKING_L[name] = bake(LATE[name]).then((b) => (L[name] = b)).catch((e) => { fail(name, e); return null; }));
  }

  // ---------------------------------------------------------- music cues (32 kHz loops; `boot: 1` bakes behind the loader,
  // the rest bake in the background right after, in story order, or the moment music() asks for them)
  // Rue's store theme (F major), the root of TWO's 2040 store theme.
  const REDDY = {
    rt: [41, 38, 46, 36, 41, 45, 46, 36],
    ch: [[53, 57, 60], [50, 53, 57], [50, 53, 58], [52, 55, 60], [53, 57, 60], [52, 57, 60], [50, 53, 58], [52, 55, 58]],
    mel: (() => { const A = [[0, 72, 2], [3, 69, 1], [4, 72, 2], [8, 77, 3], [12, 76, 2], [14, 74, 2]]; return [A, [[0, 74, 3], [4, 69, 2], [6, 72, 2], [8, 74, 4], [14, 77, 2]], [[0, 74, 2], [2, 72, 2], [4, 70, 4], [8, 65, 2], [10, 67, 2], [12, 70, 4]],
      [[0, 72, 4], [6, 76, 2], [8, 79, 4], [12, 76, 4]], A, [[0, 76, 3], [4, 72, 2], [6, 69, 2], [8, 72, 4], [14, 76, 2]],
      [[0, 77, 2], [2, 74, 2], [4, 70, 4], [8, 74, 2], [10, 72, 2], [12, 70, 2], [14, 69, 2]], [[0, 67, 2], [2, 69, 2], [4, 70, 2], [6, 72, 2], [8, 76, 4], [12, 79, 4]]]; })(),
  };
  // "two" (spec §15.3): 92 bpm, B minor. Chord voicings are the 1987 song's pads (same notes, a different feeling).
  const STEP = 60 / 92 / 4, BAR = 16 * STEP;
  const CH = { Bm: [50, 54, 59, 62], G: [50, 55, 59, 62], D: [50, 54, 57, 62], A: [49, 52, 57, 64], Em: [52, 55, 59, 64] };
  const ROOT = { Bm: 35, G: 43, D: 38, A: 33, Em: 40 };
  const LEAD = { // eighth notes, one bar per row; 0 = tie (the note before holds)
    verse: [[78, 74, 78, 74, 76, 78, 81, 78], [79, 78, 76, 74, 71, 74, 76, 0], [78, 74, 78, 74, 81, 83, 81, 78], [76, 73, 76, 78, 76, 0, 0, 0]],
    chorus: [[83, 0, 81, 79, 78, 0, 74, 0], [81, 0, 78, 0, 74, 76, 78, 0], [76, 0, 73, 0, 76, 78, 81, 0], [78, 0, 74, 0, 0, 0, 0, 0]],
  };
  // The 1987 Pudding melody (spec §15.2), one note per two steps over two bars (D G | Bm A).
  const PUD = [[74, 78, 81, 78, 76, 79, 83, 81], [78, 81, 86, 83, 81, 78, 76, 74]];
  const PUD_CH = [[50, 54, 57, 62], [50, 55, 59, 62], [50, 54, 59, 62], [49, 52, 57, 64]], PUD_RT = [38, 43, 35, 33]; // D G Bm A (Rue's stems)
  const notesOf = (row) => { const out = []; for (let i = 0; i < 8; i++) if (row[i]) { let l = 2; while (i + l / 2 < 8 && !row[i + l / 2]) l += 2; out.push([i * 2, row[i], l]); } return out; }; // [step, midi, steps]
  const VERSE_N = LEAD.verse.map(notesOf), CHORUS_N = LEAD.chorus.map(notesOf), PUD_N = PUD.map(notesOf);
  const third = (m) => m - ([0, 2, 5, 7].includes(((m - 62) % 12 + 12) % 12) ? 3 : 4); // a diatonic third below, in D major
  const twoLead = (c, d, t, m, len, v = 0.06) => { tone(c, d, t, mtof(m), len, { wave: 'pulse25', v: v * 0.55, a: 0.008, d: 0.25, s: 0.7, r: 0.09, lp: 2600, vib: [5.2, 11, 0.15] }); tone(c, d, t, mtof(m), len, { type: 'triangle', v: v * 0.9, a: 0.008, d: 0.3, s: 0.75, r: 0.1, vib: [5.2, 11, 0.15] }); };

  // One bar of the 1987 song, four ways (spec §15.2: the 1987 record, the national hold music, Mia's ukulele, lift muzak).
  function puddingBar(kind) {
    return (c, d, k) => {
      const st = STEP, b = k & 3, ch = PUD_CH[b], rt = PUD_RT[b], mel = PUD_N[b & 1], R = rng(k * 17 + kind.length);
      if (kind === 'band') { // the record: Rue's stems (pads, bass), dynamo kick, till snare, kettle-click hats, tin whistle
        chord(c, d, 0, ch, BAR, { v: 0.03, a: 0.25, r: 0.7, lp: 1800, det: [-9, 0, 9] });
        for (const s of [0, 6, 8, 14]) bassN(c, d, s * st, s === 14 ? rt + 7 : rt, 0.7 * (s === 6 || s === 14 ? 0.4 : 1), 0.35, 900);
        for (const s of [0, 4, 8, 12]) hit(c, d, B.dynamo_hit, s * st, 0.5);
        for (const s of [4, 12]) hit(c, d, B.till, s * st, 0.35);
        for (let s = 0; s < 16; s += 2) hit(c, d, B.kettle_click, s * st, 0.3);
        for (const [s, m, l] of mel) whistle(c, d, s * st, mtof(m), l * st * 0.9, 0.2);
      } else if (kind === 'chip') { // thin chiptune hold music (it sits under a phone band)
        for (const [s, m, l] of mel) chipLead(c, d, s * st, m, l * st * 0.8, 0.07, 'pulse');
        for (let s = 0; s < 16; s++) tone(c, d, s * st, mtof(ch[(s % 3) + 1] + 12), st * 0.5, { type: 'square', v: 0.012, a: 0.002, r: 0.01 });
        for (const s of [0, 4, 8, 12]) tri(c, d, s * st, rt + 12, st * 3, 0.13);
        for (const s of [4, 12]) nsnare(c, d, s * st, 0.04);
      } else if (kind === 'uke') { // Mia: soft strums, the tune picked on the top string, whisper volume
        const name = ['D', 'G', 'Bm', 'A'][b];
        for (const [s, dir, v] of [[0, 1, 0.22], [6, 1, 0.12], [8, -1, 0.1], [12, 1, 0.14], [14, -1, 0.08]]) strum(c, d, s * st, name, v, dir, 0.018, 1.0);
        for (const [s, m, l] of mel) hit(c, d, ks(m, 1.2, 0.8, 0.7), s * st + 0.005, 0.32);
      } else { // 'muzak': e-piano comping, vibes melody, walking bass, brushes
        for (const s of [0, 6, 10]) for (const m of ch) epiano(c, d, s * st + R() * 0.01, m + 12, st * 3, 0.022);
        const walk = [rt, rt + 4, rt + 7, rt + 9];
        for (let q = 0; q < 4; q++) tri(c, d, q * 4 * st, walk[q] + 12, st * 3.5, 0.12, 900);
        for (const [s, m, l] of mel) vibes(c, d, s * st, m, l * st, 0.06);
        for (const s of [4, 12]) noise(c, d, s * st, 0.18, { v: 0.025, a: 0.03, d: 0.08, bp: 3500, q: 0.5 });
        for (let s = 0; s < 16; s += 2) noise(c, d, (s + (s % 4 ? 0.4 : 0)) * st, 0.06, { v: 0.008, a: 0.01, d: 0.03, hp: 5000 });
      }
    };
  }
  const CUES = {
    // Title: one sustained pad, a slow Campanile bell every 8 bars (Rue's).
    title: { boot: 1, len: dur(8, 64), rev: [3.5, 0.45, 0.7], tail: 4, whole: (c, d, len) => {
      chord(c, d, 0, [50, 57, 64, 66, 69], len, { v: 0.03, a: 3, r: 3, lp: 900, lfoF: lfoOut(c, 2 / len, 500), det: [-10, -3, 6] });
      chord(c, d, 0, [38, 50], len, { type: 'triangle', v: 0.06, a: 3, r: 3, lp: 400, det: [0] });
      bell(c, d, 0.02, mtof(62), 0.1);
    } },
    // The Manager (spec §15.2): G5 - E5 - C5 on a soft sine over a low C, long tail. Prologue, the address, the PA, the reveal.
    manager: { boot: 1, len: 12, rms: 0.06, rev: [3.5, 0.5, 0.75], tail: 5, whole: (c, d) => {
      chord(c, d, 0, [36, 43], 12, { type: 'sine', v: 0.06, a: 3, r: 3, lp: 400, det: [-4, 4] });
      motif(c, d, 1, 0.11);
    } },
    // 1.1, the store radio: an original 80s-rock Christmas pastiche. Chugging square guitar, sleigh bells, a big snare.
    radio: { boot: 1, len: dur(8, 120), rms: 0.1, band: [170, 5200], rev: [0.8, 0.12, 0.4], bars: [8, (c, d, k) => {
      const st = 60 / 120 / 4, rt = [40, 37, 33, 35, 40, 44, 45, 35][k], big = rev(c, d, 0.35, 0.7, 0.3);
      const mel = [[[0, 80, 2], [2, 80, 2], [4, 78, 2], [6, 76, 4], [12, 71, 4]], [[0, 76, 2], [2, 78, 2], [4, 80, 4], [8, 83, 6], [14, 80, 2]],
        [[0, 81, 4], [4, 80, 2], [6, 78, 2], [8, 76, 4], [12, 78, 4]], [[0, 78, 6], [6, 75, 2], [8, 78, 8]],
        [[0, 83, 2], [2, 83, 2], [4, 85, 2], [6, 83, 4], [12, 80, 4]], [[0, 80, 4], [4, 78, 2], [6, 80, 2], [8, 83, 8]],
        [[0, 85, 4], [4, 83, 2], [6, 81, 2], [8, 80, 4], [12, 78, 4]], [[0, 76, 6], [6, 78, 2], [8, 75, 4], [12, 71, 4]]][k];
      const pc = [rt + 12, rt + 19, rt + 24];
      for (let s = 0; s < 16; s += 2) { const acc = s === 0 || s === 6 || s === 12; chord(c, d, s * st, pc, st * (acc ? 1.4 : 0.7), { type: 'square', v: acc ? 0.022 : 0.014, a: 0.002, d: 0.08, s: 0.4, r: 0.03, lp: acc ? 2200 : 1300, det: [-7, 7] }); }
      for (let s = 0; s < 16; s += 2) tone(c, d, s * st, mtof(rt), st * 1.6, { type: 'sawtooth', v: 0.09, a: 0.003, d: 0.1, s: 0.4, r: 0.03, lp: 700 });
      for (let s = 0; s < 16; s++) if (s % 2 === 0 || s % 4 === 3) jingle(c, d, s * st, s % 4 === 0 ? 0.07 : 0.04);
      for (const [s, m, l] of mel) for (const det of [-6, 6]) tone(c, d, s * st, mtof(m), l * st * 0.92, { type: 'sawtooth', det, v: 0.022, a: 0.02, d: 0.3, s: 0.7, r: 0.06, lp: 2400, vib: [5.5, 14, 0.15] });
      if (k >= 4) for (const [s, m] of mel) fmBell(c, d, s * st, m + 12, 0.5, 0.025, 3.5); // glockenspiel doubles the answer
      kick(c, d, 0, 0.5); kick(c, d, 8 * st, 0.45); if (k % 4 === 3) kick(c, d, 10 * st, 0.4);
      for (const s of [4, 12]) snare(c, big, s * st, 0.3);
      if (k === 7) for (const s of [13, 14, 15]) snare(c, d, s * st, 0.18);
    }] },
    // 1.3: a tense, bouncy synth loop under the alarms. D minor, 128 bpm, octave-bouncing bass.
    tense: { len: dur(8, 128), rms: 0.1, rev: [0.6, 0.1, 0.4], bars: [8, (c, d, k) => {
      const st = 60 / 128 / 4, rt = [38, 38, 34, 36, 38, 38, 43, 45][k];
      const ch = [[62, 65, 69], [62, 65, 69], [58, 62, 65], [60, 64, 67], [62, 65, 69], [62, 65, 69], [55, 58, 62], [57, 61, 64]][k];
      for (let s = 0; s < 16; s++) tone(c, d, s * st, mtof(rt + (s % 2 ? 12 : 0)), st * 0.7, { type: 'sawtooth', v: 0.06, a: 0.002, d: 0.05, s: 0.3, r: 0.02, lp: 1100, fto: 300, fgl: st * 0.7 });
      for (const s of [0, 3, 6, 10, 13]) chord(c, d, s * st, ch, st * 0.6, { type: 'square', v: 0.016, a: 0.002, d: 0.05, s: 0.2, r: 0.03, lp: 2600 });
      for (let s = 0; s < 16; s++) pluck(c, d, s * st, ch[[0, 1, 2, 1][s % 4]] + 12, 0.025, 3200);
      for (const s of (k & 1 ? [0, 6, 8, 14] : [0, 8])) kick(c, d, s * st, 0.35);
      for (const s of [4, 12]) snare(c, d, s * st, 0.16);
      for (let s = 0; s < 16; s++) hat(c, d, s * st, s % 2 ? 0.02 : 0.035);
    }] },
    // 1.4-1.6: the store theme (Rue's), slower and dreamier, with a soft glassy chime layer ("2040").
    store40: { len: dur(8, 92), rms: 0.1, rev: [2.2, 0.32, 0.6], bars: [8, (c, d, k) => {
      const st = STEP, rt = REDDY.rt[k], ch = REDDY.ch[k];
      for (const s of [0, 8]) tri(c, d, s * st, rt, st * 7, 0.16, 600);
      chord(c, d, 0, ch, BAR - 0.05, { type: 'triangle', v: 0.018, a: 0.4, r: 0.6, lp: 1400 });
      for (const [s, m, l] of REDDY.mel[k]) tone(c, d, s * st, mtof(m), l * st, { v: 0.09, a: 0.01, d: 0.5, s: 0.3, r: 0.3 });
      for (let s = 0; s < 16; s += 2) fmBell(c, d, s * st, ch[[0, 1, 2, 1][(s / 2) % 4]] + 24, 0.6, 0.016);
      for (const s of [4, 12]) noise(c, d, s * st, 0.05, { v: 0.04, a: 0.001, d: 0.015, bp: 3000, q: 1 });
    }] },
    // 1.7, 2.2: sunny and slightly off-kilter (G Lydian, 3+3+2, a wobble in the tuning), the glassy 2040 layer, cicadas.
    seaside: { len: dur(8, 100), rms: 0.1, rev: [1.4, 0.2, 0.5], bars: [8, (c, d, k) => {
      const st = 60 / 100 / 4, R = rng(k + 3), rt = [43, 48, 43, 42, 40, 48, 43, 38][k];
      const ch = [[59, 62, 67], [60, 64, 67, 73], [59, 62, 67], [57, 62, 66], [59, 64, 67], [60, 64, 67, 73], [59, 62, 67], [57, 62, 66]][k];
      const mel = [[[0, 71, 3], [3, 74, 3], [6, 79, 2], [8, 78, 3], [11, 74, 5]], [[0, 76, 3], [3, 73, 3], [6, 74, 2], [8, 76, 8]], [[0, 74, 3], [3, 71, 3], [6, 67, 2], [8, 69, 3], [11, 71, 5]], [[0, 73, 6], [6, 74, 2], [8, 69, 8]],
        [[0, 71, 3], [3, 76, 3], [6, 79, 2], [8, 83, 3], [11, 81, 5]], [[0, 79, 3], [3, 78, 3], [6, 76, 2], [8, 73, 8]], [[0, 74, 3], [3, 79, 3], [6, 78, 2], [8, 76, 3], [11, 74, 5]], [[0, 73, 4], [4, 74, 4], [8, 69, 8]]][k];
      for (const s of [0, 6, 12]) tri(c, d, s * st, rt, st * 5, 0.16, 700);
      for (const s of [0, 3, 6, 8, 11, 14]) for (const m of ch) hit(c, d, ks(m, 0.9, 0.6, 0.6), s * st + R() * 0.02, s === 0 || s === 8 ? 0.12 : 0.07);
      for (const [s, m, l] of mel) { const det = (R() - 0.5) * 30; tone(c, d, s * st, mtof(m), l * st, { v: 0.07, det, a: 0.004, d: 0.3, s: 0.15, r: 0.15 }); tone(c, d, s * st, mtof(m) * 2, l * st, { v: 0.02, det, a: 0.004, d: 0.12, r: 0.1 }); }
      for (const s of [2, 10]) fmBell(c, d, s * st, ch[1] + 24, 0.7, 0.012);
      for (let s = 0; s < 16; s++) shaker(c, d, (s + (s % 2 ? 0.25 : 0)) * st, s % 2 ? 0.012 : 0.02);
    }], whole: (c, d, len) => { const g = gn(c, d, 0.5); lfo(c, g.gain, 2 / len, 0.4); noise(c, g, 0, len, { v: 0.05, bp: 5200, q: 6, r: 0.01 }); } },
    // Drone scenes: a low filtered pulse. C minor, 84 bpm.
    stealth: { len: dur(8, 84), rms: 0.09, rev: [1.8, 0.25, 0.7], bars: [8, (c, d, k) => {
      const st = 60 / 84 / 4, rt = [36, 36, 32, 32, 36, 36, 31, 35][k];
      const ch = [[60, 63, 67, 74], [60, 63, 67, 74], [56, 60, 63, 67], [56, 60, 63, 67], [60, 63, 67, 74], [60, 63, 67, 74], [55, 59, 62, 67], [55, 59, 62, 65]][k];
      for (let s = 0; s < 16; s += 2) tone(c, d, s * st, mtof(rt), st * 1.6, { type: 'sawtooth', v: s % 4 ? 0.07 : 0.1, a: 0.004, d: 0.12, s: 0.3, r: 0.05, lp: 260, fto: 700, fgl: st * 1.5, q: 4 });
      chord(c, d, 0, ch, BAR, { type: 'triangle', v: 0.01, a: 0.8, r: 1, lp: 700 });
      for (let s = 0; s < 16; s += 2) noise(c, d, s * st, 0.01, { v: 0.05, a: 0.0005, d: 0.004, bp: 4000, q: 4 });
      for (const s of [0, 10]) tone(c, d, s * st, 70, 0.2, { to: 40, v: 0.25, a: 0.004, d: 0.08, lp: 300 });
      if (k >= 4) for (const [s, m] of [[3, 79], [7, 75], [11, 74]]) pluck(c, d, s * st, m, 0.03, 1800);
    }] },
    // 2.5, the checkpoint: twangy and tense. E minor, a spaghetti twang, woodblock tick-tock, timpani.
    checkpoint: { len: dur(8, 100), rms: 0.1, rev: [1.6, 0.25, 0.5], bars: [8, (c, d, k) => {
      const st = 60 / 100 / 4, rt = [40, 40, 43, 40, 45, 43, 47, 47][k];
      const riff = [[[0, 52, 3], [3, 55, 3], [6, 57, 2], [8, 58, 1], [9, 59, 7]], [[0, 64, 4], [4, 62, 2], [6, 59, 2], [8, 57, 8]], [[0, 55, 3], [3, 59, 3], [6, 62, 2], [8, 64, 8]], [[0, 59, 4], [4, 58, 2], [6, 57, 2], [8, 52, 8]],
        [[0, 57, 3], [3, 60, 3], [6, 64, 2], [8, 62, 8]], [[0, 59, 3], [3, 62, 3], [6, 67, 2], [8, 66, 8]], [[0, 63, 3], [3, 66, 3], [6, 69, 2], [8, 71, 8]], [[0, 69, 4], [4, 66, 4], [8, 63, 4], [12, 59, 4]]][k];
      for (const [s, m, l] of riff) { tone(c, d, s * st, mtof(m) * 1.02, l * st, { type: 'sawtooth', to: mtof(m), gl: 0.06, v: 0.05, a: 0.002, d: 0.3, s: 0.35, r: 0.15, lp: 3000, fto: 600, fgl: l * st, vib: [6, 18, 0.1] }); tone(c, d, s * st, mtof(m - 12), l * st, { v: 0.04, a: 0.002, d: 0.3, s: 0.3, r: 0.1 }); }
      for (let s = 0; s < 16; s += 2) { tone(c, d, s * st, s % 4 ? 900 : 1250, 0.02, { v: 0.05, a: 0.0005, d: 0.012 }); noise(c, d, s * st, 0.01, { v: 0.04, a: 0.0005, d: 0.005, bp: s % 4 ? 900 : 1250, q: 5 }); }
      for (const s of [0, 10]) tone(c, d, s * st, mtof(rt), 0.4, { to: mtof(rt) * 0.94, v: 0.3, a: 0.003, d: 0.2, r: 0.2, lp: 500 });
      tone(c, d, 0, mtof(rt - 12), BAR, { v: 0.05, a: 0.2, r: 0.3 });
      noise(c, d, 12 * st, 0.03, { v: 0.1, a: 0.001, d: 0.01, bp: 2500, q: 2 });
    }] },
    // 2.5, the scooter chase: the "two" chorus as fast chiptune.
    scooter: { len: dur(8, 144), rms: 0.11, bars: [8, (c, d, k) => {
      const st = 60 / 144 / 4, nm = ['G', 'D', 'A', 'Bm'][k & 3], ch = CH[nm], rt = { G: 43, D: 50, A: 45, Bm: 47 }[nm];
      for (const [s, m, l] of CHORUS_N[k & 3]) { chipLead(c, d, s * st, m, l * st * 0.85, 0.06); if (k >= 4) chipLead(c, d, s * st, third(m), l * st * 0.85, 0.03, 'pulse'); }
      for (let s = 0; s < 16; s++) tone(c, d, s * st, mtof(ch[1 + (s % 3)] + 12), st * 0.6, { type: 'square', v: 0.014, a: 0.001, r: 0.01, lp: 4000 });
      for (let s = 0; s < 16; s += 2) tri(c, d, s * st, rt + (s % 4 === 2 ? 12 : 0), st * 1.6, 0.14);
      for (const s of [0, 4, 8, 12]) nkick(c, d, s * st, 0.45);
      for (const s of [4, 12]) nsnare(c, d, s * st, 0.12);
      for (let s = 0; s < 16; s++) noise(c, d, s * st, 0.02, { v: s % 2 ? 0.015 : 0.025, a: 0.0005, d: 0.006, hp: 8000 });
    }] },
    // 2.6: sunny, with a ukulele bass (a round plucky U-bass) and strums. D major, 104 bpm.
    sizzle: { len: dur(8, 104), rms: 0.1, rev: [1, 0.15, 0.4], bars: [8, (c, d, k) => {
      const st = 60 / 104 / 4, nm = ['D', 'G', 'A', 'D', 'Bm', 'G', 'A', 'A'][k], rt = { D: 38, G: 43, A: 45, Bm: 47 }[nm] - 12, R = rng(k + 11);
      for (const [s, x] of [[0, 0], [3, 7], [6, 12], [8, 0], [11, 7], [14, 10]]) { tone(c, d, s * st, mtof(rt + x + 12), st * 2, { v: 0.16, a: 0.004, d: 0.18, s: 0.2, r: 0.08 }); tone(c, d, s * st, mtof(rt + x + 12), st * 2, { type: 'triangle', v: 0.1, a: 0.004, d: 0.2, s: 0.2, r: 0.08, lp: 700 }); }
      for (const [s, dir, v] of [[2, 1, 0.14], [6, 1, 0.12], [7, -1, 0.07], [10, 1, 0.14], [14, 1, 0.12], [15, -1, 0.07]]) strum(c, d, s * st + R() * 0.008, nm, v, dir);
      if (k >= 4) for (const [s, m, l] of [[[0, 78, 4], [4, 81, 4], [8, 83, 8]], [[0, 83, 3], [3, 81, 3], [6, 79, 2], [8, 78, 8]], [[0, 76, 3], [3, 78, 3], [6, 81, 2], [8, 76, 8]], [[0, 73, 4], [4, 76, 4], [8, 69, 8]]][k - 4]) marimba(c, d, s * st, m, l * st, 0.1);
      for (let s = 0; s < 16; s++) shaker(c, d, s * st, s % 2 ? 0.012 : 0.022);
      for (const s of [4, 12]) clap(c, d, s * st, 0.12);
    }] },
    // 2.8-2.9: almost nothing. (The whispering crowd and muffled thunder are ambience.)
    quiet: { len: 16, rms: 0.03, xf: 1, whole: (c, d) => {
      const g = gn(c, d, 0.6); lfo(c, g.gain, 1 / 16, 0.4);
      chord(c, g, 0, [35, 54, 61], 16.5, { type: 'sine', v: 0.05, a: 2, r: 0.1, lp: 900, det: [-3, 3] });
      tone(c, d, 3, mtof(78), 2, { v: 0.02, a: 0.4, d: 1.5, r: 2 }); tone(c, d, 11, mtof(74), 2, { v: 0.018, a: 0.4, d: 1.5, r: 2 });
    } },
    // 2.1: the "two" motif (the falling third, F#5 -> D5), pads only.
    pads: { len: dur(8, 92), rms: 0.08, rev: [3, 0.4, 0.7], tail: 7, bars: [8, (c, d, k) => {
      if (k & 1) return;
      const nm = ['Bm', 'G', 'D', 'A'][k >> 1];
      chord(c, d, 0, CH[nm], 2 * BAR, { v: 0.026, a: 1.2, r: 2.2, lp: 1300, det: [-9, 0, 9] });
      tone(c, d, 0, mtof(ROOT[nm]), 2 * BAR, { v: 0.05, a: 1, r: 2 });
      tone(c, d, 4 * STEP, mtof(78), 6 * STEP, { v: 0.045, a: 0.5, d: 1, s: 0.6, r: 1.2 });
      tone(c, d, 12 * STEP, mtof(74), 14 * STEP, { v: 0.045, a: 0.6, d: 1.5, s: 0.6, r: 2 });
    }] },
    // 3.4: the boss. "two" verse and chorus (never the bridge), driving.
    boss: { len: dur(8, 92), rms: 0.12, rev: [0.8, 0.12, 0.4], bars: [8, (c, d, k) => {
      const st = STEP, nm = k < 4 ? ['Bm', 'G', 'D', 'A'][k] : ['G', 'D', 'A', 'Bm'][k - 4], ch = CH[nm], rt = ROOT[nm] + (ROOT[nm] > 40 ? -12 : 0);
      for (const [s, m, l] of (k < 4 ? VERSE_N : CHORUS_N)[k & 3]) { for (const det of [-8, 8]) tone(c, d, s * st, mtof(m), l * st * 0.9, { type: 'sawtooth', det, v: 0.026, a: 0.005, d: 0.2, s: 0.7, r: 0.06, lp: 3200, vib: [5.5, 12, 0.12] }); twoLead(c, d, s * st, m - 12, l * st * 0.9, 0.04); }
      for (let s = 0; s < 16; s += 2) tone(c, d, s * st, mtof(rt + (s % 4 === 2 ? 12 : 0)), st * 1.5, { type: 'sawtooth', v: 0.09, a: 0.003, d: 0.08, s: 0.4, r: 0.03, lp: 900, fto: 350, fgl: st * 1.4 });
      for (const s of [0, 3, 6, 10]) chord(c, d, s * st, ch.map((m) => m + 12), st * 1.1, { v: 0.018, a: 0.003, d: 0.1, s: 0.3, r: 0.05, lp: 3000 });
      for (const s of (k & 1 ? [0, 4, 8, 12, 14] : [0, 4, 8, 12])) kick(c, d, s * st, 0.4);
      for (const s of [4, 12]) snare(c, d, s * st, 0.22);
      for (let s = 0; s < 16; s++) hat(c, d, s * st, s % 2 ? 0.022 : 0.035, s === 14);
      if (k === 0 || k === 4) crash(c, d, 0, 0.1);
    }] },
    // The 1987 song (spec §15.2): D major, 92 bpm, D - G - Bm - A, the melody exactly as Rue had it. And its uses.
    pudding: { len: dur(4, 92), rms: 0.11, rev: [1.2, 0.15, 0.5], bars: [4, puddingBar('band')] },
    hold: { len: dur(4, 92), rms: 0.09, band: [300, 3400], bars: [4, puddingBar('chip')], whole: (c, d, len) => noise(c, d, 0, len, { v: 0.06, buf: CRACKLE, bp: 3000, q: 0.6, a: 0.01, r: 0.01 }) },
    uke: { len: dur(4, 92), rms: 0.035, rev: [1.4, 0.25, 0.6], bars: [4, puddingBar('uke')] },
    lift: { len: dur(4, 92), rms: 0.08, band: [180, 6500], rev: [1.6, 0.3, 0.6], bars: [4, puddingBar('muzak')] },
    pudding_coda: { once: 1, len: dur(5, 92), rms: 0.11, rev: [1.2, 0.15, 0.5], tail: 6.5, bars: [5, (c, d, k) => { // the credits' last word: 4 bars, then the D and the bell
      if (k < 4) return puddingBar('band')(c, d, k);
      chord(c, d, 0, PUD_CH[0], 2.5, { v: 0.03, a: 0.25, r: 2.5, lp: 1800, det: [-9, 0, 9] }); bassN(c, d, 0, 38, 2, 0.35, 900);
      whistle(c, d, 0, mtof(74), 1.6, 0.18); hit(c, d, B.bell, 0, 0.45);
    }] },
    // 3.1: the staff choir humming a carol-ish tune (no words) at exactly 40 dB. F major, 66 bpm.
    choir: { len: dur(8, 66), rms: 0.05, rev: [2.4, 0.35, 0.6], bars: [8, (c, d, k) => {
      const b = 60 / 66, tune = [[72, 69, 65, 69], [70, 74, 72, 70], [69, 72, 77, 76], [74, 72, 0, 0], [74, 72, 69, 65], [67, 70, 69, 67], [65, 67, 69, 70], [69, 0, 0, 0]][k];
      const harm = [[53, 57, 60], [53, 58, 62], [53, 57, 60], [55, 60, 64], [50, 57, 62], [50, 55, 58], [55, 58, 64], [53, 57, 60]][k];
      for (let q = 0; q < 4; q++) if (tune[q]) { let l = 1; while (q + l < 4 && !tune[q + l]) l++; for (const det of [-7, 0, 6]) hum(c, d, q * b + rnd() * 0.02, tune[q] - 12, l * b * 0.95, 0.03, 1, det); }
      for (const m of harm) for (const det of [-5, 5]) hum(c, d, rnd() * 0.03, m, 4 * b * 0.97, 0.018, 0.6, det);
    }] },
    // 3.2 (HQ): sterile, cold synth and a hum.
    hq: { len: 16, rms: 0.07, rev: [3, 0.35, 0.5], tail: 4, whole: (c, d) => {
      chord(c, d, 0, [48, 55, 59, 62, 66], 16, { type: 'sine', v: 0.02, a: 3, r: 3, lp: 2500, det: [-3, 3] });
      for (const [f, v] of [[50, 0.025], [100, 0.012], [150, 0.005]]) tone(c, d, 0, f, 16, { v, a: 0.5, r: 0.5 });
      for (const [s, m] of [[2, 95], [6.5, 90], [11, 100], [14, 91]]) fmBell(c, d, s, m, 1.2, 0.02);
      noise(c, d, 0, 16, { v: 0.02, a: 2, r: 2, bp: 2000, q: 0.4 });
    } },
    // The Choice (3.7): a single sustained chord.
    sustain: { len: 12, rms: 0.06, xf: 1, whole: (c, d) => {
      chord(c, d, 0, [50, 57, 62, 64, 66], 12.5, { v: 0.022, a: 2, r: 0.1, lp: 1100, lfoF: lfoOut(c, 1 / 12, 300), det: [-7, 0, 7] });
      tone(c, d, 0, mtof(38), 12.5, { v: 0.06, a: 2, r: 0.1 });
    } },
    // A1: the "two" bridge, slowed, as a lullaby. Em - G - A - A, music box and warm pads, D5 -> F#5.
    lullaby: { len: dur(8, 60), rms: 0.08, rev: [2.8, 0.4, 0.7], tail: 7, bars: [8, (c, d, k) => {
      const b = 1, nm = ['Em', 'G', 'A', 'A'][k & 3], ch = CH[nm];
      if ((k & 3) !== 3) chord(c, d, 0, ch, (nm === 'A' ? 8 : 4) * b, { type: 'triangle', v: 0.02, a: 1.2, r: 2, lp: 1000, det: [-6, 6] });
      for (let i = 0; i < 8; i++) fmBell(c, d, i * b / 2, ch[[0, 1, 2, 3, 2, 1, 2, 3][i]] + 12, 1.2, 0.022, 4);
      if (!(k & 1)) { tone(c, d, 0, mtof(74), 1.9 * b, { v: 0.06, a: 0.15, d: 1, s: 0.5, r: 0.8, vib: [4.5, 8, 0.4] }); tone(c, d, 2 * b, mtof(78), 5.5 * b, { v: 0.06, a: 0.2, d: 1.5, s: 0.5, r: 1.5, vib: [4.5, 8, 0.4] }); }
      tone(c, d, 0, mtof(ROOT[nm]), 3.8 * b, { v: 0.05, a: 0.3, d: 1.5, s: 0.5, r: 0.5 });
    }] },
    // B1: a stripped-down lo-fi "two". 80 bpm, dusty, crackling.
    lofi: { len: dur(8, 80), rms: 0.09, band: [60, 5000], rev: [1.2, 0.2, 0.6], bars: [8, (c, d, k) => {
      const st = 60 / 80 / 4, nm = ['Bm', 'G', 'D', 'A'][k & 3], ch = CH[nm], wob = lfoOut(c, 0.4, 8);
      chord(c, d, 0, ch.map((m) => m + 12), 9 * st, { v: 0.02, a: 0.02, d: 0.7, s: 0.5, r: 0.4, lp: 1800, wob }); chord(c, d, 10 * st, ch.map((m) => m + 12), 5 * st, { v: 0.016, a: 0.02, d: 0.5, s: 0.5, r: 0.4, lp: 1600, wob });
      for (const [s, l] of [[0, 6], [7, 3], [10, 5]]) bassN(c, d, s * st, ROOT[nm] > 40 ? ROOT[nm] - 12 : ROOT[nm], l * st, 0.12, 450);
      for (const s of [0, 7, 10]) tone(c, d, s * st, 110, 0.2, { to: 45, v: s ? 0.25 : 0.32, a: 0.003, d: 0.08, lp: 600 });
      for (const s of [4, 12]) noise(c, d, s * st, 0.14, { v: 0.1, a: 0.002, d: 0.05, bp: 1600, q: 0.8 });
      for (let s = 0; s < 16; s += 2) noise(c, d, (s + (s % 4 ? 0.35 : 0)) * st, 0.03, { v: s % 4 ? 0.02 : 0.03, a: 0.001, d: 0.012, hp: 6000 });
      if (k < 4) for (const [s, m, l] of VERSE_N[k]) tone(c, d, s * st, mtof(m), l * st * 0.85, { type: 'square', v: 0.018, a: 0.01, d: 0.2, s: 0.6, r: 0.08, lp: 1400 });
    }], whole: (c, d, len) => { noise(c, d, 0, len, { v: 0.2, buf: CRACKLE, bp: 3000, q: 0.5, r: 0.02 }); noise(c, d, 0, len, { v: 0.004, hp: 4000, r: 0.02 }); } },
    // Rue's store theme and the emotional cue, baked only if someone asks.
    reddy: { lazy: 1, len: dur(8, 112), rev: [0.8, 0.12, 0.4], bars: [8, (c, d, k) => {
      const st = 60 / 112 / 4, rt = REDDY.rt[k], ch = REDDY.ch[k];
      for (let s = 0; s < 16; s += 2) tone(c, d, s * st, mtof(rt + (s % 4 ? 12 : 0)), st * 1.2, { type: 'triangle', v: 0.22, a: 0.003, d: 0.08, s: 0.2, r: 0.04, lp: 900 });
      for (const s of [2, 6, 10, 14]) for (const m of ch) pluck(c, d, s * st, m, 0.05, 2600);
      for (const [s, m, l] of REDDY.mel[k]) marimba(c, d, s * st, m, l * st, 0.13);
      kick(c, d, 0, 0.4); kick(c, d, 8 * st, 0.35);
      for (const s of [4, 12]) { noise(c, d, s * st, 0.05, { v: 0.12, a: 0.001, d: 0.015, bp: 3000, q: 1 }); tone(c, d, s * st, 330, 0.03, { v: 0.06, a: 0.001, d: 0.012 }); }
      for (let s = 2; s < 16; s += 4) hat(c, d, s * st, 0.04);
      for (let s = 0; s < 16; s++) hat(c, d, s * st, 0.012);
    }] },
    emotional: { lazy: 1, len: dur(8, 66), rev: [3.5, 0.45, 0.7], tail: 4, bars: [8, (c, d, k) => {
      const b = 60 / 66, N = [[[0, [50, 62, 66]], [2, [69]]], [[0, [47, 59, 62]], [2.5, [66]]], [[0, [43, 55, 59]], [2, [62]], [3, [67]]], [[0, [45, 57, 61]], [2, [64]]],
        [[0, [50, 66]], [2, [62]], [3, [69]]], [[0, [47, 62, 66]], [2, [71]]], [[0, [43, 59, 67]], [1, [62]], [2, [71]]], [[0, [45, 61, 64]], [2.5, [57]]]][k];
      for (const [beat, ms] of N) for (const m of ms) piano(c, d, beat * b, m, m < 52 ? 0.08 : 0.1);
    }] },
  };
  // Music cues heard as a sound in the room (AUDIO.loop / set ambience): name -> [cue, speaker]. Any other cue name works too.
  const DIEG = { radio: ['radio', 'radio'], store_radio: ['radio', 'radio'], hold: ['hold', 'phone'], hold_music: ['hold', 'phone'], walkman: ['pudding', 'walkman'],
    uke: ['uke', null], choir: ['choir', null], lift: ['lift', 'lift'], pudding: ['pudding', 'radio'] };
  const WARM_ORDER = ['hold', 'tense', 'store40', 'stealth', 'pudding', 'seaside', 'pads', 'uke', 'checkpoint', 'scooter', 'sizzle', 'quiet', 'lift', 'choir', 'hq', 'boss', 'sustain', 'lullaby', 'lofi', 'pudding_coda'];

  // ---------------------------------------------------------- "two": the arrangement (spec §15.3)
  // 44 bars: INTRO 2 · VERSE 8 · CHORUS 8 · VERSE2 8 · BRIDGE 8 · FINAL (chorus in D major) 8 · OUTRO 2 = 1:55.
  // twoStep() schedules one 16th of it from baked stems into any context: the offline bake (one small context per bar,
  // in parallel) and the live player (the 2.10 sequencer, and "two" before its bake is ready) share it note for note.
  const SECS = [['INTRO', ['Bm', 'A']], ['VERSE', ['Bm', 'G', 'D', 'A', 'Bm', 'G', 'D', 'A']], ['CHORUS', ['G', 'D', 'A', 'Bm', 'G', 'D', 'A', 'Bm']],
    ['VERSE2', ['Bm', 'G', 'D', 'A', 'Bm', 'G', 'D', 'A']], ['BRIDGE', ['Em', 'G', 'A', 'A', 'Em', 'G', 'A', 'A']],
    ['FINAL', ['D', 'G', 'Bm', 'A', 'D', 'G', 'Bm', 'A']], ['OUTRO', ['D', 'D']]];
  const NB = 44, BSEC = new Int8Array(NB), BK = new Int8Array(NB), BCH = [], SEC0 = [];
  { let i = 0; SECS.forEach(([, chs], si) => { SEC0.push(i); chs.forEach((ch, k) => { BSEC[i] = si; BK[i] = k; BCH.push(ch); i++; }); }); SEC0.push(i); }
  const SONG_LEN = 43 * BAR + 3.4, SONG_GAIN = 0.85;                     // the restart chime lands on the last bar's downbeat
  const LANE_NAMES = ['hats', 'snare', 'texture', 'chords'];
  const LANE_V = [0.3, 0.5, 0.3, 0.42], LANE_GATE = [0.11, 0.26, 0, 0.6]; // per lane: level, gate (0 = the whole sample)
  const LG = [[0.45, 0, 0.8, 0], [0.8, 0.85, 0.55, 0.65], [1, 1, 0.7, 0.85], [0.85, 0.9, 0.6, 0.75], [0, 0, 0.12, 0], [1.1, 1.1, 0.85, 1], [0, 0, 0.4, 0]]; // per section x lane
  const DEF_ON = [[0, 2, 4, 6, 8, 10, 12, 14], [4, 12], [0], [0, 6, 10]];
  const defSteps = () => DEF_ON.map((on) => Array.from({ length: 16 }, (_, i) => on.includes(i)));
  const PREF = [['kettle', 'sizzle', 'chip', 'brick', 'alarm', 'train', 'radio'], ['boom', 'train', 'brick', 'alarm', 'kettle', 'radio', 'sizzle'],
    ['hover', 'bay', 'cicadas', 'whir', 'sizzle', 'radio'], ['uke', 'piano', 'chip', 'train']]; // what Chase would pick for each lane
  const secIdx = (n, d) => { if (n == null) return d; if (typeof n === 'number') return n; const k = String(n).toUpperCase().replace(/[\s_]/g, '');
    const i = SECS.findIndex(([x]) => x === k); return i >= 0 ? i : ({ VERSE1: 1, CHORUS1: 2, CHORUS2: 5, FINALCHORUS: 5, LASTCHORUS: 5 })[k] ?? d; };
  const sbuf = (id) => (id && ((typeof SAMPLES !== 'undefined' && SAMPLES[id] && B[SAMPLES[id].sfx]) || B['smp_' + id])) || null;
  function defaultPattern(samples) {
    const have = samples || [], used = [];
    const lanes = PREF.map((pref) => { const id = pref.find((k) => have.includes(k) && !used.includes(k)) || null; if (id) used.push(id); return id; });
    return { lanes, steps: defSteps(), lead: null, bridge: 'laugh' };
  }
  function prep(pat, samples, P) { // any pattern shape -> the arrangement's view of it (the arrays are kept, so edits are live)
    const st = (typeof state !== 'undefined' && state) || {};
    samples = Array.isArray(samples) ? samples : Array.isArray(st.samples) ? st.samples : [];
    if (Array.isArray(pat)) pat = { steps: pat };                     // Rue's 4 x 16 grid
    if (!pat || typeof pat !== 'object') pat = defaultPattern(samples);
    P = P || { lanes: [null, null, null, null], steps: null, lead: null, bridge: 'laugh', whir: false, raw: null };
    P.raw = pat;
    for (let l = 0; l < 4; l++) { const id = pat.lanes ? pat.lanes[l] : null; P.lanes[l] = id && sbuf(id) ? id : null; }
    const s = pat.steps;
    P.steps = Array.isArray(s) && s.length >= 4 && s.every((r) => r && r.length >= 16) ? s : (P.steps && P.steps.def ? P.steps : Object.assign(defSteps(), { def: 1 }));
    P.lead = Array.isArray(pat.lead) && pat.lead.length ? pat.lead : null;
    P.bridge = pat.bridge === undefined ? 'laugh' : pat.bridge;
    P.whir = samples.includes('whir') || pat.whir === true;
    return P;
  }
  const songKey = (P) => JSON.stringify([P.lanes, P.steps.map((r) => r.slice(0, 16).map((x) => (x ? 1 : 0)).join('')), P.lead && P.lead.map((x) => (x ? 1 : 0)).join(''), P.bridge, P.whir, !!LAUGH_CLIP]);
  const leadOn = (P, k, s) => !P.lead || !!P.lead[(k * 16 + s) % P.lead.length];
  function laneHit(c, D, W, P, l, t, ch, g) {
    const id = P.lanes[l], b = id && sbuf(id);
    if (!b) { // no sample in this lane: Rue's synth bleeps
      if (l === 0) hit(c, D, S.bleep.hat, t, g); else if (l === 1) hit(c, D, S.bleep.snare, t, g);
      else if (l === 2) hit(c, W, S.tex[ch], t, g); else hit(c, W, S.cbl[ch], t, g);
      return;
    }
    const m = SMP[id] || {}, v = LANE_V[l] * g;
    if (l === 3 && m.chord && S[m.chord]) { hit(c, W, S[m.chord][ch], t, v * 1.1, 1, 0, 0.75, 0.15); return; } // the ukulele / piano play the chord
    let rate = 1;
    if (l === 3 && m.root) { let n = ((ROOT[ch] - m.root) % 12 + 12) % 12; if (n > 6) n -= 12; rate = R12(n); }      // a pitched sample follows the root
    hit(c, l === 2 || l === 3 ? W : D, b, t, v, rate, m.hit || 0, LANE_GATE[l], 0.05);
  }
  function twoStep(c, D, W, P, i, s, t) { // bar i (0..43), step s (0..15), at time t
    const si = BSEC[i], k = BK[i], ch = BCH[i], lg = LG[si];
    // the sample lanes (the player's samples, or bleeps)
    for (let l = 0; l < 4; l++) if (lg[l] > 0 && P.steps[l][s]) laneHit(c, D, W, P, l, t, ch, lg[l]);
    if (si === 4) { // BRIDGE: the drums drop out, a held pad, D5 -> F#5 once every two bars, the laugh on bars 1 and 5
      if (s === 0) {
        if ((k & 3) !== 3) { const len = (k & 3) === 2 ? 2 * BAR : BAR; hit(c, W, S.bpad[ch], t, 1, 1, 0, len - 0.1, 0.9); hit(c, W, S.bass[ROOT[ch]], t, 0.45, 1, 0, len - 0.2, 0.4); }
        if (!(k & 1)) hit(c, W, S.blead[74], t, 0.8, 1, 0, 8 * STEP, 0.25);
        if ((k === 0 || k === 4) && P.bridge) hit(c, W, sbuf(P.bridge), t, 0.95);
        if (P.whir && B.smp_whir) hit(c, W, B.smp_whir, t, 0.16, 0.5, 0, 3.2, 1.6, 1.1); // the drone whir, slowed into a pad
        if (k === 7) hit(c, W, S.one.swell, t, 0.45);
      } else if (s === 8 && !(k & 1)) hit(c, W, S.blead[78], t, 0.8, 1, 0, 24 * STEP, 0.6);
      return;
    }
    if (si === 6) { // OUTRO: the last D rings, then the restart chime
      if (s === 0 && k === 0) { hit(c, W, S.bpad.D, t, 1); hit(c, W, S.bass[38], t, 0.6, 1, 0, 2.6, 1); hit(c, W, S.blead[74], t, 0.75); hit(c, D, S.one.kick, t, 0.45); }
      if (s === 0 && k === 1) hit(c, W, B.restart_chime, t, 1.15);
      return;
    }
    if (s === 0) {
      hit(c, W, S.pad[ch], t, si === 0 ? 0.6 : si === 1 ? 0.8 : si === 3 ? 0.9 : 1);
      if (k === 0 && (si === 2 || si === 3 || si === 5)) hit(c, D, S.one.crash, t, si === 3 ? 0.35 : 0.6);
    }
    if (si === 0) { if (s === 0) hit(c, W, S.bass[ROOT[ch]], t, 0.5, 1, 0, BAR - 0.2, 0.4); return; } // INTRO: pads, bass, the texture lane
    // drums
    const drive = si === 2 || si === 5;
    if (drive ? s % 4 === 0 : s === 0 || s === 8 || (s === 10 && (k & 1))) hit(c, D, S.one.kick, t, drive ? 0.6 : 0.55);
    // bass: verse 0 6 8 14 (a fifth on 14); chorus 8ths with octave jumps
    const r = ROOT[ch];
    if (drive) { if (!(s & 1)) hit(c, W, S.bass[r], t, 0.42, s === 6 || s === 14 ? 2 : 1, 0, 0.2, 0.05); }
    else if (s === 0 || s === 6 || s === 8 || s === 14) hit(c, W, S.bass[r], t, 0.5, s === 14 ? 1.4983 : 1, 0, s === 0 || s === 8 ? 0.5 : 0.28, 0.06);
    // the lead
    if (si === 5) { // FINAL: the 1987 melody, one note per two steps over two bars (twice per pass); tin whistle doubling, a third below on the second pass
      if (!(s & 1)) { const m = PUD[k & 1][s >> 1]; hit(c, W, S.lead[m], t, 0.6, 1, 0, 2 * STEP * 0.92, 0.07); hit(c, W, S.whis[m], t, 0.75); if (k >= 4) hit(c, W, S.lead[third(m)], t, 0.32, 1, 0, 2 * STEP * 0.92, 0.07); }
      return;
    }
    const row = (si === 2 ? CHORUS_N : VERSE_N)[k & 3];
    for (let n = 0; n < row.length; n++) if (row[n][0] === s && leadOn(P, k, s)) hit(c, W, S.lead[row[n][1]], t, 0.8, 1, 0, row[n][2] * STEP * 0.92, 0.08);
  }
  const barTail = (i) => (BSEC[i] === 4 || BSEC[i] === 6 ? 7 : 4.5);
  const SONGS = new Map(); // bakes by pattern (LRU of 2)
  function bakeSong(pattern, o = {}) {
    if (!canBake()) return Promise.resolve(null);
    const P0 = prep(pattern, o.samples), key = songKey(P0);
    if (SONGS.has(key)) { const pr = SONGS.get(key); SONGS.delete(key); SONGS.set(key, pr); return pr; }
    const P = Object.assign({}, P0, { lanes: P0.lanes.slice(), steps: P0.steps.map((r) => r.slice()), lead: P0.lead && P0.lead.slice() }); // a snapshot
    const T0 = performance.now();
    const pr = (async () => {
      const n = Math.ceil(SONG_LEN * MR), out = new Float32Array(n);
      await pool(NB, 6, (i) => render(BAR + barTail(i), MR, (c, d) => {
        const W = rev(c, d, 1.4, BSEC[i] === 4 ? 0.3 : 0.16, 0.6);
        for (let s = 0; s < 16; s++) twoStep(c, d, W, P, i, s, s * STEP);
      }).then((x) => { const at = Math.round(i * BAR * MR); for (let j = 0, m = Math.min(x.length, n - at); j < m; j++) out[at + j] += x[j] * SONG_GAIN; }));
      for (let j = 0, f = Math.round(0.6 * MR); j < f; j++) out[n - 1 - j] *= j / f;
      stats.ms.song = Math.round(performance.now() - T0);
      return buf(out, MR);
    })().catch((e) => { fail('two', e); SONGS.delete(key); return null; });
    SONGS.set(key, pr);
    while (SONGS.size > 2) SONGS.delete(SONGS.keys().next().value);
    return pr;
  }

  // ---------------------------------------------------------- song stems (baked at boot, 32 kHz)
  const LEAD_NOTES = [71, 73, 74, 76, 78, 79, 81, 83, 86], PIANO_NOTES = [48, 53, 58, 63, 68, 73, 78, 83];
  const STEMS = () => {
    const L = [];
    for (const n in CH) {
      L.push(['pad', n, BAR + 1, (c, d) => chord(c, d, 0, CH[n], BAR, { v: 0.03, a: 0.25, r: 0.7, lp: 1800, det: [-9, 0, 9] })]);
      L.push(['bpad', n, 2 * BAR + 2.6, (c, d) => { chord(c, d, 0, CH[n], 2 * BAR, { v: 0.03, a: 0.9, r: 2.2, lp: 1100, det: [-7, 0, 7] }); chord(c, d, 0, CH[n].map((m) => m + 12), 2 * BAR, { type: 'triangle', v: 0.012, a: 1.4, r: 2.2, lp: 2400, det: [-5, 5] }); }]);
      L.push(['tex', n, 2.4, (c, d) => chord(c, d, 0, CH[n].map((m) => m + 12), 1.4, { type: 'square', v: 0.009, a: 0.35, r: 0.6, lp: 900, det: [-6, 6] })]);
      L.push(['cbl', n, 0.4, (c, d) => chord(c, d, 0, CH[n].slice(1).map((m) => m + 12), 0.14, { type: 'square', v: 0.035, a: 0.003, d: 0.06, s: 0.3, r: 0.08, lp: 2600, det: [0] })]);
      L.push(['pno', n, 1.8, (c, d) => CH[n].slice(1).forEach((m, j) => piano(c, d, j * 0.012, m + 12, 0.06))]);
      L.push(['uke', n, 1.8, (c, d) => strum(c, d, 0, n, 0.3)]);
    }
    for (const m of new Set(Object.values(ROOT))) L.push(['bass', m, 1.4, (c, d) => bassN(c, d, 0, m, 1.1, 0.35, 900)]);
    for (const m of LEAD_NOTES) { L.push(['lead', m, 1.5, (c, d) => twoLead(c, d, 0, m, 1.3)]); L.push(['whis', m, 0.55, (c, d) => whistle(c, d, 0, mtof(m), 0.3, 0.2)]); }
    L.push(['blead', 74, 5.6, (c, d) => tone(c, d, 0, mtof(74), 4, { v: 0.07, a: 0.12, d: 1.2, s: 0.6, r: 1.2, vib: [4.8, 9, 0.5] })]);
    L.push(['blead', 78, 5.6, (c, d) => tone(c, d, 0, mtof(78), 4, { v: 0.07, a: 0.15, d: 1.2, s: 0.6, r: 1.2, vib: [4.8, 9, 0.5] })]);
    for (const m of PIANO_NOTES) L.push(['pn', m, 2.4, (c, d) => { piano(c, d, 0, m, 0.12); noise(c, d, 0, 0.01, { v: 0.05, a: 0.0005, d: 0.004, bp: 2500, q: 1 }); }]);
    L.push(['one', 'kick', 0.35, (c, d) => kick(c, d, 0, 0.75)]);
    L.push(['one', 'crash', 2.5, (c, d) => crash(c, d, 0, 0.12)]);
    L.push(['one', 'swell', BAR + 0.3, (c, d) => noise(c, d, 0, BAR, { v: 0.18, a: BAR * 0.95, r: 0.05, hp: 900, fto: 6000, fgl: BAR })]);
    L.push(['bleep', 'hat', 0.05, (c, d) => tone(c, d, 0, 2093, 0.025, { type: 'square', v: 0.06, a: 0.001, d: 0.01 })]);
    L.push(['bleep', 'snare', 0.15, (c, d) => { tone(c, d, 0, 294, 0.08, { type: 'square', v: 0.14, a: 0.002, d: 0.04 }); noise(c, d, 0, 0.06, { v: 0.12, a: 0.001, d: 0.02, bp: 3000 }); }]);
    return L;
  };

  // ---------------------------------------------------------- baking
  function buf(data, rate) { const b = new AudioBuffer({ length: data.length, sampleRate: rate, numberOfChannels: 1 }); b.copyToChannel(data, 0); return b; }
  function scale(d, rms) { // RMS-normalise, never past 0.95 peak
    let s = 0, pk = 1e-9;
    for (let i = 0; i < d.length; i++) { s += d[i] * d[i]; pk = Math.max(pk, Math.abs(d[i])); }
    const k = Math.min(rms / Math.max(1e-9, Math.sqrt(s / d.length)), 0.95 / pk);
    for (let i = 0; i < d.length; i++) d[i] *= k;
  }
  async function render(len, rate, fn) { // one small offline context -> samples
    const c = new OfflineAudioContext(1, Math.ceil(len * rate), rate);
    fn(c, c.destination);
    return (await c.startRendering()).getChannelData(0);
  }
  // Many short recipes in one context, one output channel each (a context per recipe costs more to set up than to
  // render). A recipe that throws while building its graph leaves its channel silent and is reported, nothing else.
  async function renderMulti(len, rate, fns) {
    const n = fns.length, c = new OfflineAudioContext(n, Math.ceil(len * rate), rate), mg = c.createChannelMerger(n);
    c.destination.channelCountMode = 'explicit'; c.destination.channelInterpretation = 'discrete';
    mg.connect(c.destination);
    const ok = fns.map((fn, k) => { const g = c.createGain(); g.connect(mg, 0, k); try { fn(c, g); return true; } catch (e) { return e; } });
    const b = await c.startRendering();
    return ok.map((r, k) => (r === true ? b.getChannelData(k) : r));
  }
  async function bakeMany(items, rate, done) { // items: [name, seconds, fn(c, d)], grouped by length, 16 to a context
    items = items.slice().sort((a, b) => a[1] - b[1]);
    const groups = [];
    for (let i = 0; i < items.length; i += 16) groups.push(items.slice(i, i + 16));
    await Promise.all(groups.map((g) => renderMulti(g[g.length - 1][1], rate, g.map((x) => x[2])).then((res) => g.forEach(([name, l], k) => {
      if (res[k] instanceof Float32Array) done(name, res[k].slice(0, Math.ceil(l * rate))); else fail(name, res[k]);
    })).catch((e) => g.forEach(([name]) => fail(name, e)))));
  }
  async function pool(n, width, job) { let next = 0; await Promise.all(Array.from({ length: Math.min(width, n) }, async () => { while (next < n) await job(next++); })); }
  async function bake(o) {
    const n = Math.round(o.len * MR), tail = o.tail ?? 1.5, N = o.once ? n + Math.round(tail * MR) : n, dry = new Float32Array(N), jobs = [];
    const add = (d, at) => { if (o.once) { for (let i = 0; i < d.length && at + i < N; i++) dry[at + i] += d[i]; } else for (let i = 0; i < d.length; i++) dry[(at + i) % n] += d[i]; };
    if (o.whole) jobs.push(() => render(o.len + (o.xf ? 0.3 : tail), MR, (c, d) => o.whole(c, d, o.len)).then((d) => {
      if (!o.xf) return add(d, 0);
      const x = d.length - n; // crossfade the continuation over the head
      for (let i = 0; i < n; i++) dry[i] += i < x ? d[i] * Math.sin((i / x) * Math.PI / 2) + d[n + i] * Math.cos((i / x) * Math.PI / 2) : d[i];
    }));
    if (o.bars) {
      const [cnt, fn] = o.bars, bl = o.len / cnt;
      for (let k = 0; k < cnt; k++) jobs.push(() => render(bl + tail, MR, (c, d) => fn(c, d, k)).then((d) => add(d, Math.round(k * bl * MR))));
    }
    await pool(jobs.length, 8, (j) => jobs[j]());
    let out = dry;
    if (o.rev || o.band) { // one pass over the assembled loop; the reverb tail wraps round too
      const sec = o.rev ? o.rev[0] : 0;
      out = await render(N / MR + sec, MR, (c, d) => {
        const s = c.createBufferSource();
        let x = o.rev ? rev(c, d, o.rev[0], o.rev[1], o.rev[2]) : d;
        if (o.band) x = band(c, x, o.band[0], o.band[1]);
        s.buffer = buf(dry, MR); s.connect(x); s.start(0);
      });
      if (!o.once) for (let i = n; i < out.length; i++) out[i - n] += out[i];
      out = out.subarray(0, N);
    }
    scale(out, o.rms ?? 0.12);
    return buf(out, MR);
  }
  function loopable(n, x, fill) { // JS-generated texture with its end crossfaded into its start
    const a = new Float32Array(n + x);
    fill(a);
    for (let i = 0; i < x; i++) { const k = (i / x) * Math.PI / 2; a[i] = a[i] * Math.sin(k) + a[n + i] * Math.cos(k); }
    return buf(a.subarray(0, n), SR);
  }
  function clicks(sec, perSec, fLo, fHi, dec, amp) { // damped-sine pings at random times (drops, drips, crackle)
    const n = Math.round(sec * SR), a = new Float32Array(n), Lc = Math.round(dec * SR * 5);
    for (let k = Math.round(sec * perSec); k > 0; k--) {
      const at = rnd() * n | 0, w = 2 * Math.PI * (fLo + rnd() * (fHi - fLo)) / SR, v = amp * (0.3 + rnd() * 0.7) * (rnd() < 0.5 ? -1 : 1);
      for (let i = 0; i < Lc; i++) a[(at + i) % n] += v * Math.exp(-i / (dec * SR)) * Math.sin(w * i);
    }
    return buf(a, SR);
  }
  const canBake = () => typeof OfflineAudioContext !== 'undefined' && !!WHITE;
  function fail(name, e) { stats.failed.push(name); console.warn('TWO: audio bake failed: ' + name, e); }
  const BAKING = {};
  function ensureCue(name) { // a music cue's buffer, baking it now if it isn't yet
    if (M[name]) return Promise.resolve(M[name]);
    if (!CUES[name] || !canBake()) return Promise.resolve(null);
    return BAKING[name] || (BAKING[name] = bake(CUES[name]).then((b) => (M[name] = b)).catch((e) => { fail(name, e); return null; }));
  }
  async function decodeClip(uri) { // LAUGH_CLIP / VOICEMAIL_CLIP: a base64 data URI -> a mono AudioBuffer
    const b64 = String(uri).split(',').pop(), bin = atob(b64), bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const ab = await new OfflineAudioContext(1, 1, SR).decodeAudioData(bytes.buffer);
    const n = ab.length, mono = new Float32Array(n);
    for (let ch = 0; ch < ab.numberOfChannels; ch++) { const x = ab.getChannelData(ch); for (let i = 0; i < n; i++) mono[i] += x[i] / ab.numberOfChannels; }
    let pk = 1e-9; for (let i = 0; i < n; i++) pk = Math.max(pk, Math.abs(mono[i]));
    for (let i = 0; i < n; i++) mono[i] *= 0.7 / pk;
    return buf(mono, ab.sampleRate);
  }

  let baked = false;
  async function prerender() {
    if (typeof OfflineAudioContext === 'undefined' || typeof AudioBuffer === 'undefined' || WHITE) return;
    const idle = () => new Promise((r) => setTimeout(r, 0)), T = performance.now();
    let t0 = T;
    const lap = (k) => { const t = performance.now(); stats.ms[k] = Math.round(t - t0); t0 = t; };
    const job = (name, p) => p.catch((e) => fail(name, e));
    WHITE = loopable(SR * 2, 2000, (a) => { for (let i = 0; i < a.length; i++) a[i] = rnd() - 0.5; });
    BROWN = loopable(SR * 2, 4000, (a) => { let y = 0; for (let i = 0; i < a.length; i++) { y = (y + 0.02 * (rnd() * 2 - 1)) / 1.02; a[i] = y * 3.5; } });
    DROPS = clicks(3.7, 30, 2000, 5000, 0.0015, 0.5);
    DRIPS = clicks(5.3, 5, 700, 1400, 0.02, 0.6);
    CRACKLE = clicks(2.9, 25, 2500, 9000, 0.0003, 0.8);
    DIST = new Float32Array(256);
    for (let i = 0; i < 256; i++) DIST[i] = Math.tanh(3 * (i / 127.5 - 1)) / Math.tanh(3);
    lap('textures');
    // many small contexts in parallel, a yield between groups so the loader keeps animating
    await bakeMany(Object.keys(SFX).map((k) => [k, SFX[k][0], (c, d) => SFX[k][1](c, d, 0)]), SR, (k, d) => { B[k] = buf(d, SR); });
    if (LAUGH_CLIP) await job('LAUGH_CLIP', decodeClip(LAUGH_CLIP).then((b) => { B.smp_laugh = b; }));       // the real laugh, everywhere
    if (VOICEMAIL_CLIP) await job('VOICEMAIL_CLIP', decodeClip(VOICEMAIL_CLIP).then((b) => { B.voicemail_clip = b; }));
    lap('sfx'); await idle();
    await bakeMany(STEMS().map(([k, i, len, fn]) => [k + '|' + i, len, fn]), MR, (n, d) => { const [k, i] = n.split('|'); (S[k] || (S[k] = {}))[i] = buf(d, MR); });
    lap('stems'); await idle();
    await job('voices', renderVoices());
    lap('voices'); await idle();
    await Promise.all(Object.keys(LOOPS).map((k) => job(k, bake(LOOPS[k]).then((b) => { L[k] = b; }))));
    lap('loops'); await idle();
    await Promise.all(Object.keys(CUES).filter((k) => CUES[k].boot).map((k) => ensureCue(k)));
    lap('cues');
    stats.ms.prerender = Math.round(performance.now() - T);
    baked = true;
    setTimeout(startWarm, 3000);
  }
  // The rest of the score bakes in the background (render threads; the main thread only builds the graphs): from init()
  // (the first YES, or autoplay), or 3 s after the bake if that comes first, so it never competes with the loader.
  let warming = false;
  function startWarm() {
    if (warming || !baked) return;
    warming = true;
    setTimeout(warmLate, 60);
    setTimeout(warmCues, 150);
  }
  // one LATE bed at a time, a breath between: each bake builds its whole node graph on the main thread, and nineteen at
  // once (crowds, babble) would be one long hitch at the start of play (spec §16: none over 50 ms). A scene that asks for
  // a bed first just bakes it now (ensureLate is shared, so nothing bakes twice).
  function warmLate() {
    const names = Object.keys(LATE), T = performance.now();
    let i = 0;
    const next = () => {
      while (i < names.length && L[names[i]]) i++;
      if (i >= names.length) { stats.ms.late = Math.round(performance.now() - T); return; }
      ensureLate(names[i++]).then(() => setTimeout(next, 40));
    };
    next();
  }
  function warmCues() {
    let i = 0;
    const next = () => {
      while (i < WARM_ORDER.length && (M[WARM_ORDER[i]] || !CUES[WARM_ORDER[i]])) i++;
      if (i < WARM_ORDER.length) { ensureCue(WARM_ORDER[i++]).then(() => setTimeout(next, 150)); return; }
      stats.ms.warm = Math.round(performance.now() - Tw);
      const st = typeof state !== 'undefined' && state;
      if (st && st.pattern) bakeSong(st.pattern); // a saved game near the end: have its song ready
    };
    const Tw = performance.now();
    next();
  }

  // Voice blips (spec §4): per speaker 4 vowel-coloured variants + a rising one for question tails. Read from CHARACTERS,
  // so a new speaker just works. Fields: wave, f, len, gap, filter, soft, tumble, mono, pure (no harmonic body),
  // chirp (rising), ring (ring-mod Hz, depth ringDepth = 0.5), band [lo, hi] (+ hiss: a tape-hiss bed while it talks), also/duo.
  const WAVE_V = { sine: 0.5, triangle: 0.4, square: 0.15, pulse: 0.2, sawtooth: 0.18 };
  const GENERIC = { wave: 'triangle', f: 200, len: 0.04 };
  const VB = new Map();
  function bakeVoice(v) {
    const key = JSON.stringify(v);
    if (VB.has(key)) return VB.get(key);
    const pr = renderMulti(v.len * 1.5 + 0.06, SR, [0, 1, 2, 3, 4].map((k) => {
      const rising = k === 4, len = v.len * (rising ? 1.5 : 1);
      return (c, d) => {
        const f = v.f * (v.tumble && !rising ? [1.1, 0.94, 1.04, 0.9][k] : 1);
        let out = d;
        if (v.band) out = band(c, out, v.band[0], v.band[1]);
        let into = peak(c, out, [700, 1100, 1600, 2300, 1100][k], v.mono ? 0 : 7, 1.8);
        if (v.ring) { const rm = c.createGain(), dp = v.ringDepth ?? 0.5; rm.gain.value = 1 - dp; lfo(c, rm.gain, v.ring, dp); rm.connect(into); into = rm; } // the masked Manager
        const wave = v.wave === 'pulse' ? 'pulse' : v.wave === 'sine' && !v.pure ? 'warm' : null;
        tone(c, into, 0, f, len, {
          type: wave ? undefined : v.wave || 'square', wave, v: WAVE_V[v.wave] || 0.3, a: v.soft ? 0.015 : 0.003, d: len * (v.soft ? 0.8 : 0.6), s: 0.3, r: v.soft ? 0.04 : 0.015,
          lp: v.filter, q: 1, to: rising || v.chirp ? f * (rising ? 1.35 : 1.18) : v.mono ? 0 : f * (v.tumble ? [0.92, 1.06, 0.95, 1.08][k] : 0.96), gl: len,
        });
      };
    })).then((r) => {
      const a = r.map((x, k) => { if (!(x instanceof Float32Array)) throw x; return x.slice(0, Math.ceil((v.len * (k === 4 ? 1.5 : 1) + 0.06) * SR)); });
      let s = 0, n = 0, pk = 1e-9;
      for (const x of a) { let y = 0, p = 0; for (let i = 0; i < x.length; i++) { y = 0.959 * (y + x[i] - p); p = x[i]; s += y * y; n++; pk = Math.max(pk, Math.abs(x[i])); } } // loudness through a 300 Hz high-pass
      const g = Math.min((v.soft ? 0.06 : 0.07) / Math.max(1e-9, Math.sqrt(s / n)), 0.9 / pk); // every voice equally loud (and never clipping)
      for (const x of a) for (let i = 0; i < x.length; i++) x[i] *= g;
      return { n: a.slice(0, 4).map((x) => buf(x, SR)), q: buf(a[4], SR), min: v.len + 0.02 + (v.gap || 0), mono: !!v.mono, hiss: v.hiss || 0, phone: !!v.band };
    });
    VB.set(key, pr);
    return pr;
  }
  async function renderVoices() {
    const base = await bakeVoice(GENERIC), alias = {};
    V._generic = Object.assign({ last: 0 }, base);
    await Promise.all(Object.keys(CHARACTERS).map(async (id) => {
      const ch = CHARACTERS[id] || {}, v = ch.voice;
      if (typeof v === 'string') { alias[id] = v; return; }
      const b = v && typeof v === 'object' && v.f > 0 ? await bakeVoice(v).catch((e) => { fail('voice ' + id, e); return base; }) : base;
      V[id] = Object.assign({ last: 0, also: v && v.also, duo: Array.isArray(ch.duo) ? ch.duo : null }, b);
    }));
    for (const id in alias) V[id] = V[alias[id]] || V._generic;
  }

  // ---------------------------------------------------------- runtime
  const gainTo = (dest, v) => { const g = ctx.createGain(); g.gain.value = v; g.connect(dest); return g; };
  function hold(p, t) {
    if (p.cancelAndHoldAtTime) p.cancelAndHoldAtTime(t);
    else { const v = p.value; p.cancelScheduledValues(t); p.setValueAtTime(v, t); }
  }
  function applyOptions() {
    if (!ctx) return;
    const t = ctx.currentTime;
    busM.gain.setTargetAtTime(silenced ? 0 : (options.music ?? 0.8) * (ducked ? CONFIG.duck : 1), t, silenced ? 0.05 : 0.12);
    busS.gain.setTargetAtTime(options.sfx ?? 0.9, t, 0.05);
    busV.gain.setTargetAtTime(options.voice ?? 0.9, t, 0.05);
  }
  function init() {
    startWarm();
    if (ctx) { if (ctx.state === 'suspended') ctx.resume().catch(() => {}); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try { ctx = new AC({ latencyHint: 'interactive' }); } catch (e) { return; }
    const lim = ctx.createDynamicsCompressor();
    lim.threshold.value = -6; lim.knee.value = 6; lim.ratio.value = 12; lim.attack.value = 0.003; lim.release.value = 0.2;
    master = ctx.createGain(); master.connect(lim); lim.connect(ctx.destination);
    // music and sfx pass through a low-pass that is wide open until AUDIO.muffle() (3.5: "as if heard through water")
    const mf = () => { const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 20000; f.Q.value = 0.5; f.connect(master); return f; };
    muffleF = [mf(), mf()];
    busM = gainTo(muffleF[0], 0); busS = gainTo(muffleF[1], 0); busV = gainTo(master, 0);
    const send = (sec, damp) => { const cv = ctx.createConvolver(), g = gainTo(cv, 0); cv.buffer = impulse(ctx.sampleRate, sec, damp, 2); cv.connect(muffleF[1]); busS.connect(g); return g; };
    sendRoom = send(0.6, 0.3); sendWet = send(2.2, 0.8);
    { // 'lane': a short slapback off two close walls (a delay with a little feedback)
      const dl = ctx.createDelay(0.5), fb = ctx.createGain(), lp = ctx.createBiquadFilter();
      dl.delayTime.value = 0.085; fb.gain.value = 0.32; lp.type = 'lowpass'; lp.frequency.value = 3200;
      sendSlap = gainTo(dl, 0); dl.connect(lp); lp.connect(fb); fb.connect(dl); lp.connect(muffleF[1]); busS.connect(sendSlap);
    }
    impulse(ctx.sampleRate, 1.4, 0.6); // the live song player's reverb, ready before it's needed
    applyOptions();
    if (typeof on === 'function') on('options', applyOptions);
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  }
  function setPos(p, x, y, z) { // [x,y,z] | {x,y,z} | anchor name | x, y, z
    if (typeof x === 'string') { let a = null; try { a = world.anchor(x) || world.mark(x); } catch (e) { /* no world yet */ } if (!a) return; x = a.at || a; }
    if (x && typeof x === 'object') { y = x.y ?? x[1]; z = x.z ?? x[2]; x = x.x ?? x[0]; }
    if (!(isFinite(x) && isFinite(y) && isFinite(z))) return;
    if (p.positionX) { p.positionX.value = x; p.positionY.value = y; p.positionZ.value = z; } else p.setPosition(x, y, z);
  }
  function place(node, o, hrtf) { // positional (o.at), panned (o.pan) or plain; returns the node to connect onward
    if (hrtf || (o && o.at != null)) {
      const p = ctx.createPanner();
      p.panningModel = hrtf ? 'HRTF' : 'equalpower'; p.distanceModel = 'inverse';
      p.refDistance = (o && o.ref) || 2; p.rolloffFactor = 1;
      setPos(p, (o && o.at) || [0, 0, 0]);
      node.connect(p);
      return p;
    }
    if (o && o.pan) { const p = ctx.createStereoPanner(); p.pan.value = o.pan; node.connect(p); return p; }
    return node;
  }
  // A speaker the sound comes out of (filters on the runtime context): returns the input node.
  function speaker(kind, dest) {
    if (!kind) return dest;
    const shape = (d, drive) => { const sh = ctx.createWaveShaper(); sh.curve = DIST; sh.connect(d); return gainTo(sh, drive); };
    switch (kind) {
      case 'monitor': return band(ctx, peak(ctx, gainTo(dest, 0.55), 1300, 5, 0.9), 220, 3000);           // 2.10: the desk's tiny monitor
      case 'bleed': return band(ctx, gainTo(dest, 0.12), 900, 6000);                                       // headphones leaking
      case 'phone': return band(ctx, shape(gainTo(dest, 0.9), 0.6), 300, 3400);                            // down the line / a phone speaker
      case 'walkman': return band(ctx, peak(ctx, shape(gainTo(dest, 0.6), 0.7), 1800, 4, 1), 380, 4200);   // Rue's Walkman, its little speaker
      case 'radio': return band(ctx, gainTo(dest, 0.9), 250, 3200);
      case 'lift': return band(ctx, gainTo(dest, 0.85), 200, 5000);
      default: return dest;
    }
  }
  function playBuf(b, o, rate, bus) { // the one place a one-shot starts; returns its length in seconds
    if (!ctx || !b) return 0;
    const s = ctx.createBufferSource(), g = ctx.createGain(), r = (rate || 1) * ((o && o.rate) || 1);
    s.buffer = b; if (r !== 1) s.playbackRate.value = r;
    g.gain.value = o && o.vol != null ? o.vol : 1;
    let n = g;
    if (o && o.lp) { n = ctx.createBiquadFilter(); n.type = 'lowpass'; n.frequency.value = o.lp; g.connect(n); } // o.lp: muffled (through a door)
    s.connect(g); place(n, o, false).connect(bus || busS);
    s.start(o && o.when > 0 ? o.when : 0, (o && o.offset) || 0);
    return b.duration / r;
  }
  const warned = new Set();
  const warnOnce = (k, n) => { if (baked && typeof TEST !== 'undefined' && TEST.auto && !warned.has(k + n)) { warned.add(k + n); console.warn('TWO: no ' + k + " '" + n + "'"); } };
  function sfx(name, o) { // o: { vol, rate, lp, at, pan, when (AUDIO.now() time), offset }
    if (!ctx) return 0;
    const b = B[name];
    if (!b) { warnOnce('sfx', name); return 0; }
    return playBuf(b, o, 1, busS);
  }

  const NOOP = { stop() {}, vol() {}, rate() {}, pos() {} };
  const live = new Set();
  let alarms = 0;
  // A looped bed: a LOOPS entry, or a music cue heard in the room (DIEG, or any cue name: through its speaker).
  function loop(name, o = {}) {
    if (!ctx) return NOOP;
    const al = LOOP_ALIAS[name];
    if (al) { o = Object.assign({}, o, { vol: (o.vol ?? 1) * al[1], rate: (o.rate || 1) * al[2], lp: o.lp || al[3] || 0 }); name = al[0]; }
    let b = L[name], cue = null, spk = null, late = null;
    if (!b) {
      if (LATE[name]) late = name;
      else { const dg = DIEG[name]; cue = dg ? dg[0] : CUES[name] ? name : null; spk = dg ? dg[1] : null; if (!cue) { warnOnce('loop', name); return NOOP; } b = M[cue] || null; }
    }
    const g = ctx.createGain(), t = ctx.currentTime;
    const det = name === 'alarm' ? 1 + 0.013 * alarms++ : 1; // each layered alarm slightly detuned
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(o.vol ?? 1, t + (o.fade ?? 0.15));
    const into = o.lp ? band(ctx, g, 20, o.lp) : g, p = place(g, o, !!o.hrtf);
    p.connect(o.bus === 'music' ? busM : o.bus === 'voice' ? busV : busS);
    let on = true, s = null;
    const start = (bb) => {
      if (!on || !bb) return;
      s = ctx.createBufferSource(); s.buffer = bb; s.loop = true; s.playbackRate.value = (o.rate || 1) * det;
      s.connect(spk ? speaker(spk, into) : into); s.start(ctx.currentTime, o.from ?? rnd() * bb.duration);
    };
    if (b) start(b); else (late ? ensureLate(late) : ensureCue(cue)).then(start);
    const h = {
      stop(f = 0.3) {
        if (!on) return;
        on = false; live.delete(h); if (name === 'alarm') alarms--;
        const t2 = ctx.currentTime; hold(g.gain, t2); g.gain.linearRampToValueAtTime(0, t2 + f + 0.01); if (s) s.stop(t2 + f + 0.05);
        setTimeout(() => g.disconnect(), (f + 0.3) * 1000);
      },
      vol(v) { if (on) g.gain.setTargetAtTime(v, ctx.currentTime, 0.05); },
      rate(r) { if (on && s) s.playbackRate.setTargetAtTime(r * det, ctx.currentTime, 0.05); },
      pos(x, y, z) { if (p.panningModel) setPos(p, x, y, z); },
    };
    live.add(h);
    return h;
  }

  // Set ambience: { rain: true | 'glass' | 'roof' | 'street' | 'heavy', loops: ['cicadas', ['waves', 0.6], { name, vol, lp }], room }.
  // rain: true picks Rue's (muffled indoors, heavy outdoors). A world env change passes rain: true/false with the same
  // loops array, so the set's rain kind is remembered against it.
  const RAIN = { glass: 'rain_glass', roof: 'rain_roof', street: 'rain_street', heavy: 'rain_heavy', light: 'rain' };
  const rainKind = new WeakMap(), amb = {};
  let lastAmb = null, room = 'none', lastKind = null;
  function ambience(a) {
    if (!ctx) return;
    lastAmb = a;
    const want = {}, inside = !!(ROOMS[room] && ROOMS[room][3]), loops = a && Array.isArray(a.loops) ? a.loops : [];
    if (a && typeof a.rain === 'string') { lastKind = a.rain; if (a.loops) rainKind.set(a.loops, a.rain); }
    else if (a && 'room' in a) lastKind = null; // a set's own ambience without a rain kind
    const kind = a && a.rain ? (typeof a.rain === 'string' ? a.rain : (a.loops && rainKind.get(a.loops)) || lastKind) : null;
    if (a && a.rain) {
      if (kind && RAIN[kind]) want[RAIN[kind]] = { vol: 1 };
      else if (!inside) want.rain_heavy = { vol: 0.7 }; else want.rain = { vol: 0.6, lp: 1800 };   // heavier outdoors, muffled through the glass indoors
    }
    for (const e of loops) {
      const ob = e && typeof e === 'object' && !Array.isArray(e) ? e : null, n = typeof e === 'string' ? e : Array.isArray(e) ? e[0] : ob && ob.name;
      if (n) want[n] = { vol: Array.isArray(e) ? e[1] ?? 1 : (ob && ob.vol) ?? 1, lp: ob && ob.lp, at: ob && ob.at };
    }
    for (const k in amb) if (!want[k]) { amb[k].h.stop(1); delete amb[k]; }
    for (const k in want) {
      const w = want[k];
      if (amb[k]) { if (amb[k].vol !== w.vol) { amb[k].h.vol(w.vol); amb[k].vol = w.vol; } continue; }
      amb[k] = { h: loop(k, { fade: 1, vol: w.vol, lp: w.lp || 0, at: w.at }), vol: w.vol };
    }
  }

  // Voice blips: one per syllable, however fast the text types. A band voice (the voicemail) gets a tape-hiss bed while it talks.
  let hissH = null, hissT = 0, vmUntil = 0;
  function hissOn(v) {
    if (!hissH) hissH = loop('tape_hiss', { vol: v * 0.6, fade: 0.08, bus: 'voice' });
    clearTimeout(hissT); hissT = setTimeout(hissOff, 900);
  }
  function hissOff() { clearTimeout(hissT); if (hissH) { hissH.stop(0.4); hissH = null; } }
  function blip(id, rising) {
    if (!ctx) return;
    const v = V[id] || V[String(id).split('_')[0]] || V._generic;
    if (!v) return;
    if (v.duo) { for (let i = 0; i < v.duo.length; i++) if (v.duo[i] !== id) blip(v.duo[i], rising); return; }
    const t = ctx.currentTime;
    if (v.phone && t < vmUntil) return; // the voicemail (recording or AUDIO.voicemail) is already speaking
    if (t - v.last < (rising ? v.min * 0.6 : v.min)) return;
    v.last = t;
    const s = ctx.createBufferSource();
    s.buffer = rising && !v.mono ? v.q : v.n[rnd() * 4 | 0]; // the operator never inflects
    if (!v.mono) s.playbackRate.value = 1 + (rnd() * 2 - 1) * 0.08;
    s.connect(busV); s.start(t);
    if (v.hiss) hissOn(v.hiss);
    if (v.also) blip(v.also, rising);
  }

  function listener(camera) {
    if (!ctx || !camera) return;
    const e = camera.matrixWorld.elements, l = ctx.listener;
    if (l.positionX) {
      l.positionX.value = e[12]; l.positionY.value = e[13]; l.positionZ.value = e[14];
      l.forwardX.value = -e[8]; l.forwardY.value = -e[9]; l.forwardZ.value = -e[10];
      l.upX.value = e[4]; l.upY.value = e[5]; l.upZ.value = e[6];
    } else { l.setPosition(e[12], e[13], e[14]); l.setOrientation(-e[8], -e[9], -e[10], e[4], e[5], e[6]); }
  }

  // ---------------------------------------------------------- "two" at runtime: song handles and the live player
  const players = [], handles = new Set();
  let pumpId = 0;
  function livePlayer(P, o) { // schedules twoStep() on the audio clock, 0.2 s ahead (Rue's look-ahead scheduler)
    const out = gainTo(o.dest || busM, (o.gain ?? 1) * SONG_GAIN), D = speaker(o.speaker, out);
    const p = { P, live: !!o.live, a: o.a, b: o.b, bar: o.a, s: 0, loop: !!o.loop, next: null, t: (o.at || ctx.currentTime) + 0.06, out, D, W: rev(ctx, D, 1.4, 0.18, 0.6),
      onStep: o.onStep, onEnd: o.onEnd, done: false, endAt: 0, qt: new Float64Array(64), qi: new Int16Array(64), qh: 0, qn: 0 };
    players.push(p);
    if (!pumpId) pumpId = setInterval(pump, 25);
    pump();
    return p;
  }
  function pstep(p, t) {
    if (p.s === 0) {
      if (p.next != null) { p.a = SEC0[p.next]; p.b = SEC0[p.next + 1]; p.bar = p.a; p.next = null; }
      if (p.live) prep(p.P.raw, null, p.P);                       // the sequencer's edits (lanes, lead, bridge) land on the next bar
    }
    twoStep(ctx, p.D, p.W, p.P, p.bar, p.s, t);
    if (p.onStep && p.qn < 64) { const j = (p.qh + p.qn) & 63; p.qt[j] = t; p.qi[j] = p.s + p.bar * 16; p.qn++; }
    if (++p.s === 16) { p.s = 0; if (++p.bar >= p.b) { if (p.loop) p.bar = p.a; else { p.done = true; p.endAt = t + STEP + (p.b >= NB ? 3.2 : 0.9); } } }
  }
  function pump() {
    if (!ctx) return;
    const now = ctx.currentTime, ahead = now + (document.hidden ? 1.2 : 0.2);
    for (let j = players.length - 1; j >= 0; j--) {
      const p = players[j];
      while (!p.done && p.t < ahead) { pstep(p, p.t); p.t += STEP; }
      while (p.qn && p.qt[p.qh] <= now) { const i = p.qi[p.qh]; p.qh = (p.qh + 1) & 63; p.qn--; p.onStep(i & 15, i >> 4); }
      if (p.done && now >= p.endAt) { players.splice(j, 1); release(p, 0.05); if (p.onEnd) p.onEnd(); }
    }
    if (!players.length) { clearInterval(pumpId); pumpId = 0; }
  }
  function release(p, fade) {
    const t = ctx.currentTime;
    p.done = true;
    hold(p.out.gain, t); p.out.gain.linearRampToValueAtTime(0, t + fade);
    setTimeout(() => p.out.disconnect(), (fade + 0.3) * 1000);
  }
  function stopPlayer(p, fade) { const j = players.indexOf(p); if (j >= 0) { players.splice(j, 1); release(p, fade); } }

  // AUDIO.song({ pattern, samples, from, to, muffled, bleed, speaker, gain, fade, coda, dest, onEnd }) -> handle.
  // Plays the baked song if it's ready, else the same arrangement live while it bakes for next time.
  function song(o, legacy) {
    if (Array.isArray(o) || o === null || (o && (o.steps || o.lanes) && !('pattern' in o))) {
      if (legacy && !Array.isArray(o) && o !== null) o = Object.assign({}, legacy, { pattern: o });
      else if (legacy || Array.isArray(o)) return pudding(legacy || {});  // Rue's call shape: AUDIO.song(grid, { samples, bars, onEnd }) was the 1987 song
      else o = { pattern: o };
    }
    o = o || {};
    const st = (typeof state !== 'undefined' && state) || {};
    const pat = 'pattern' in o ? o.pattern : st.pattern, samples = o.samples || st.samples || [];
    const from = secIdx(o.from, 0), to = Math.max(from, secIdx(o.to, SECS.length - 1)), last = to === SECS.length - 1;
    const t0 = SEC0[from] * BAR, t1 = last ? SONG_LEN : SEC0[to + 1] * BAR, tail = last ? 0 : 0.9;
    const codaLen = o.coda ? (M.pudding_coda ? M.pudding_coda.duration : dur(5, 92) + 6.5) : 0, gap = 0.4;
    let res, rdy;
    const h = {
      duration: t1 - t0 + tail + (o.coda ? gap + codaLen : 0), start: -1, stopped: false, src: [], p: null, out: null, onEnd: o.onEnd || null,
      get t() { return ctx && h.start >= 0 ? Math.max(0, Math.min(h.duration, ctx.currentTime - h.start)) : 0; },
      get playing() { return h.start >= 0 && !h.stopped && h.t < h.duration; },
      get section() { return h.sectionAt(h.t); },
      sectionAt(t) { const x = t0 + (t ?? h.t); if (x >= SONG_LEN || (o.coda && x > t1 + gap)) return o.coda && x > t1 ? 'CODA' : 'END'; return SECS[BSEC[Math.min(NB - 1, Math.floor(x / BAR))]][0]; },
      stop(f = 0.4) {
        if (h.stopped) return;
        h.stopped = true; handles.delete(h);
        if (ctx && h.out) { const t = ctx.currentTime; hold(h.out.gain, t); h.out.gain.linearRampToValueAtTime(0, t + f); for (const s of h.src) s.stop(t + f + 0.05); setTimeout(() => h.out.disconnect(), (f + 0.4) * 1000); }
        if (h.p) stopPlayer(h.p, f);
        res();
      },
    };
    h.done = new Promise((r) => { res = r; });
    h.ready = new Promise((r) => { rdy = r; });
    if (!ctx) { h.stopped = true; res(); rdy(); return h; }
    handles.add(h);
    const end = () => { if (h.stopped) return; h.stopped = true; handles.delete(h); if (h.onEnd) h.onEnd(); res(); };
    const begin = (b, coda) => {
      if (h.stopped) return;
      const when = ctx.currentTime + 0.06, fin = o.fade || 0.02;
      h.out = gainTo(o.dest || busM, 0); h.out.gain.setValueAtTime(0, when); h.out.gain.linearRampToValueAtTime(o.gain ?? 1, when + fin);
      const into = speaker(o.speaker || (o.muffled ? 'monitor' : o.bleed ? 'bleed' : null), h.out);
      h.start = when;
      if (b) { // the baked song: one buffer source from the `from` section to the end of `to`
        const s = ctx.createBufferSource(); s.buffer = b; s.connect(into); s.start(when, t0); s.stop(when + t1 - t0 + tail + 0.05); h.src.push(s);
        if (!last) { h.out.gain.setValueAtTime(o.gain ?? 1, when + t1 - t0); h.out.gain.linearRampToValueAtTime(0, when + t1 - t0 + tail); }
      } else h.p = livePlayer(prep(pat, samples), { dest: into, a: SEC0[from], b: SEC0[to + 1], at: when - 0.06 });
      if (coda) { const s = ctx.createBufferSource(); s.buffer = coda; s.connect(into); s.start(when + t1 - t0 + gap); h.src.push(s); h.duration = t1 - t0 + gap + coda.duration; }
      setTimeout(end, (h.duration + 0.2) * 1000);
      rdy();
    };
    const pr = bakeSong(pat, { samples });
    const cp = o.coda ? ensureCue('pudding_coda') : Promise.resolve(null);
    // already baked (or nearly)? wait for it; otherwise play live straight away
    let started = false;
    Promise.all([pr, cp]).then(([b, coda]) => { if (!started) { started = true; begin(b, coda); } });
    setTimeout(() => { if (!started) { started = true; cp.then((coda) => begin(null, coda)); } }, o.coda ? 400 : 120);
    return h;
  }
  // The 1987 song as a handle (the jukebox, Rue's AUDIO.song call shape): `loops` times round, then the coda.
  function pudding(o = {}) {
    let res; const h = { duration: 0, start: -1, stopped: false, src: [], out: null, stop(f = 0.4) { if (h.stopped) return; h.stopped = true; handles.delete(h); if (h.out) { const t = ctx.currentTime; hold(h.out.gain, t); h.out.gain.linearRampToValueAtTime(0, t + f); for (const s of h.src) s.stop(t + f + 0.05); } res(); }, get t() { return h.start >= 0 ? ctx.currentTime - h.start : 0; } };
    h.done = new Promise((r) => { res = r; });
    if (!ctx) { res(); return h; }
    handles.add(h);
    Promise.all([ensureCue('pudding'), ensureCue('pudding_coda')]).then(([a, b]) => {
      if (h.stopped || !a) return;
      const when = ctx.currentTime + 0.05, n = Math.max(1, o.loops || Math.ceil((o.bars || 8) / 4));
      h.out = gainTo(o.dest || busM, o.gain ?? 1); const into = speaker(o.speaker, h.out);
      const s = ctx.createBufferSource(); s.buffer = a; s.loop = true; s.connect(into); s.start(when); s.stop(when + n * a.duration); h.src.push(s);
      if (b) { const c = ctx.createBufferSource(); c.buffer = b; c.connect(into); c.start(when + n * a.duration); h.src.push(c); }
      h.start = when; h.duration = n * a.duration + (b ? b.duration : 0);
      setTimeout(() => { if (h.stopped) return; h.stopped = true; handles.delete(h); if (o.onEnd) o.onEnd(); res(); }, (h.duration + 0.2) * 1000);
    });
    return h;
  }

  // ---------------------------------------------------------- music cues
  let cur = null; // { name, g, src: [], h }
  function endCue(c, f) {
    const t = ctx.currentTime;
    c.dead = true;
    hold(c.g.gain, t); c.g.gain.linearRampToValueAtTime(0, t + f);
    for (const s of c.src) s.stop(t + f + 0.05);
    if (c.h) c.h.stop(f);
    setTimeout(() => c.g.disconnect(), (f + 0.4) * 1000);
  }
  function music(cue, o) {
    if (!ctx) return;
    o = o || {};
    if (cue && cur && cur.name === cue) return;
    const cut = !!o.cut, had = !!cur;
    if (cur) { endCue(cur, cut ? 0.012 : (o.fade ?? 1)); cur = null; }
    if (!cue) return;
    const g = ctx.createGain(), fin = cut ? 0.012 : o.fade ?? (had ? 1 : 0.05);
    g.gain.value = 0; g.connect(busM);
    const c = (cur = { name: cue, g, src: [], h: null });
    const fadeIn = () => { const t = ctx.currentTime; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(1, t + fin); };
    if (cue === 'two' || cue === 'credits') { c.h = song({ pattern: (typeof state !== 'undefined' && state && state.pattern) || null, dest: g, coda: cue === 'credits' }); fadeIn(); return; }
    const name = cue === 'walkman' ? 'pudding' : cue, spk = cue === 'walkman' ? 'walkman' : null;
    if (!CUES[name]) { warnOnce('music cue', cue); return; } // a silent current cue (as Rue)
    const start = (b) => {
      if (c.dead || !b) return;
      const s = ctx.createBufferSource(); s.buffer = b; s.loop = !CUES[name].once; s.connect(speaker(spk, g)); s.start(ctx.currentTime + 0.01); c.src.push(s);
      fadeIn();
    };
    if (M[name]) start(M[name]); else ensureCue(name).then(start);
  }
  music.silence = (on) => { silenced = !!on; applyOptions(); };

  // ---------------------------------------------------------- the 2.10 sequencer: "two", live
  let seqP = null;
  const seq = {
    // Loops a section of "two" (default VERSE) from the live pattern: lanes, steps, lead mask and bridge sample are read
    // as they change (steps within 0.2 s, lanes/bridge on the next bar). onStep(step 0..15, bar 0..43) on the audio clock.
    play(pattern, samples, onStep, o = {}) {
      if (!ctx) return;
      seq.stop();
      if (Array.isArray(pattern)) pattern = { steps: pattern };
      const si = secIdx(o.section, 1), P = prep(pattern, samples);
      seqP = livePlayer(P, { live: true, a: SEC0[si], b: o.bars ? SEC0[si] + o.bars : SEC0[si + 1], loop: true, onStep, speaker: o.speaker || (o.muffled ? 'monitor' : null), gain: o.gain });
    },
    stop() { if (seqP) stopPlayer(seqP, 0.05); seqP = null; },
    section(name) { if (seqP) seqP.next = secIdx(name, 1); },
    get playing() { return !!seqP; },
  };
  // One lane hit, as the song would play it (sequencer previews): lane 0..3, sampleId or null for the bleep.
  function laneHitNow(id, lane = 0, o = {}) {
    if (!ctx) return;
    const P = { lanes: [null, null, null, null] }, ch = o.chord || 'Bm', out = gainTo(busM, o.vol ?? 1);
    P.lanes[lane] = id && sbuf(id) ? id : null;
    laneHit(ctx, out, out, P, lane, ctx.currentTime + 0.01, ch, 1);
    setTimeout(() => out.disconnect(), 3000);
  }

  // ---------------------------------------------------------- the laugh, the voicemail, notes, 3.5
  const laugh = (o) => playBuf(B.smp_laugh, o, 1, busV); // returns its length
  const VM_TEXT = "Hey, it's Luka. I'm probably at work. Leave a message. ^ Chase, if it's you, I'm not doing your shift.";
  let vmH = null;
  function voicemail(text, o = {}) { // the greeting, tinny (300-3400 Hz) with tape hiss: VOICEMAIL_CLIP, or Luka's blips (o.cps letters/s)
    if (vmH) vmH.stop(0.05);
    let res, out = null, hs = null;
    const h = { dur: 0, clip: !!B.voicemail_clip, stopped: false, src: [], stop(f = 0.3) { if (h.stopped) return; h.stopped = true; vmUntil = 0; if (ctx && out) { const t = ctx.currentTime; hold(out.gain, t); out.gain.linearRampToValueAtTime(0, t + f); for (const s of h.src) s.stop(t + f + 0.05); if (hs) hs.stop(f); } res(); } };
    h.done = new Promise((r) => { res = r; });
    if (!ctx) { res(); return h; }
    out = gainTo(busV, o.vol ?? 1); hs = loop('tape_hiss', { vol: 0.35, fade: 0.05, bus: 'voice' });
    const line = speaker('phone', out);
    const t0 = ctx.currentTime + 0.12;
    let t = t0;
    if (B.voicemail_clip) { const s = ctx.createBufferSource(); s.buffer = B.voicemail_clip; s.connect(line); s.start(t0); h.src.push(s); t = t0 + B.voicemail_clip.duration; }
    else {
      const v = V.voicemail || V.luka || V._generic, str = String(text || VM_TEXT);
      const q = str.lastIndexOf('?');
      for (let i = 0, n = 0; i < str.length; i++) {
        const ch = str[i];
        if (ch === '^') { t += 0.8; continue; }
        if (/[.!?]/.test(ch)) { t += 0.32; continue; }
        if (/[,;:—–]/.test(ch)) { t += 0.16; continue; }
        if (ch === ' ') { t += 0.045; continue; }
        if (!/[A-Za-z0-9']/.test(ch)) continue;
        if (n++ % 2 === 0) { const s = ctx.createBufferSource(); s.buffer = q > i && q - i < 7 && !v.mono ? v.q : v.n[rnd() * 4 | 0]; s.playbackRate.value = 1 + (rnd() * 2 - 1) * 0.08; s.connect(line); s.start(t); h.src.push(s); }
        t += 1 / (o.cps || 18);
      }
    }
    h.dur = t - t0 + 0.3; vmUntil = t + 0.2;
    setTimeout(() => h.stop(0.3), (h.dur + 0.15) * 1000);
    vmH = h;
    return h;
  }
  function note(m, o = {}) { // the public piano (and anything else that needs a played note): MIDI note, nearest baked key re-pitched
    if (!ctx || !S.pn) return 0;
    let base = PIANO_NOTES[0];
    for (const k of PIANO_NOTES) if (Math.abs(k - m) < Math.abs(base - m)) base = k;
    return playBuf(S.pn[base], o, R12(m - base), o.bus === 'music' ? busM : busS);
  }
  function muffle(hz, d = 0.6) { // "as if heard through water": hz (e.g. 500) or null to open up again
    if (!ctx) return;
    const t = ctx.currentTime;
    for (const f of muffleF) { hold(f.frequency, t); f.frequency.exponentialRampToValueAtTime(hz > 0 ? hz : 20000, t + Math.max(0.02, d)); }
  }
  let ringH = null;
  function ringing(on, o = {}) { // 3.5: the sound drops out to a high ringing (not muffled, not ducked)
    if (!ctx) return;
    if (on && !ringH && L.ringing) {
      const g = gainTo(master, 0), s = ctx.createBufferSource(), t = ctx.currentTime;
      s.buffer = L.ringing; s.loop = true; s.connect(g); s.start(t);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(o.vol ?? 0.5, t + (o.fade ?? 0.08));
      ringH = { g, s };
    } else if (!on && ringH) { const t = ctx.currentTime; hold(ringH.g.gain, t); ringH.g.gain.linearRampToValueAtTime(0, t + (o.fade ?? 2)); ringH.s.stop(t + (o.fade ?? 2) + 0.05); ringH = null; }
  }
  const sampleBuffer = (k) => sbuf(k);
  const PK = {};
  function peaks(k, n = 48) { // the waveform card: n peak heights 0..1 (cached)
    const key = k + ':' + n;
    if (PK[key]) return PK[key];
    const b = sbuf(k), out = new Float32Array(n);
    if (!b) return out;
    const d = b.getChannelData(0), w = d.length / n;
    let mx = 1e-9;
    for (let i = 0; i < n; i++) { let p = 0; for (let j = Math.floor(i * w), e = Math.floor((i + 1) * w); j < e; j++) { const a = Math.abs(d[j]); if (a > p) p = a; } out[i] = p; if (p > mx) mx = p; }
    for (let i = 0; i < n; i++) out[i] /= mx;
    return (PK[key] = out);
  }

  const AUDIO = {
    init, prerender, applyOptions, ambience, listener, blip, loop, sfx, music,
    duck(on) { ducked = !!on; applyOptions(); if (!on) hissOff(); },
    // AUDIO.setRoom(name): the acoustics every sound effect plays in (ROOMS: none room small carriage hall atrium wet lane)
    setRoom(r) {
      if (!ctx) return;
      const t = ctx.currentTime, k = ROOMS[r] || (r && r !== 'none' && warnOnce('room', r), ROOMS.none);
      if (r !== room) { room = r; if (lastAmb) ambience(lastAmb); } // the rain bed follows indoors/outdoors
      sendRoom.gain.setTargetAtTime(k[0], t, 0.2); sendWet.gain.setTargetAtTime(k[1], t, 0.2); sendSlap.gain.setTargetAtTime(k[2], t, 0.2);
    },
    now: () => (ctx ? ctx.currentTime : 0),            // the audio clock (sfx(name, { when }) schedules on it)
    get ready() { return baked; },
    // "two"
    song, bakeSong, seq, pudding, hit: laneHitNow,
    TWO: {
      bpm: 92, step: STEP, bar: BAR, bars: NB, duration: SONG_LEN, lanes: LANE_NAMES,
      sections: SECS.map(([name, chords], i) => ({ name, bars: chords.length, firstBar: SEC0[i], start: SEC0[i] * BAR, end: SEC0[i + 1] * BAR, chords })),
      lead: { verse: VERSE_N, chorus: CHORUS_N, pudding: PUD_N },     // per bar: [[step, midi, steps], ...]
      defaultSteps: defSteps, defaultPattern, sectionAt: (t) => SECS[BSEC[Math.max(0, Math.min(NB - 1, Math.floor(t / BAR)))]][0],
    },
    // samples, the laugh, the voicemail, notes
    sampleBuffer, peaks, playSample: (k, o) => playBuf(sbuf(k), o, 1, busS), laugh, voicemail, note,
    // effects
    muffle, ringing,
    warm: (names) => Promise.all([].concat(names).map((n) => ensureCue(n))), // bake cues ahead of a scene (they bake in the background anyway)
    stopAll() {
      if (!ctx) return;
      music(null, { cut: true });
      for (let j = players.length - 1; j >= 0; j--) stopPlayer(players[j], 0.05);
      seqP = null;
      for (const h of [...handles]) h.stop(0.05);
      for (const h of [...live]) h.stop(0.05);
      for (const k in amb) delete amb[k];
      lastAmb = null; hissOff(); ringing(false, { fade: 0.05 }); muffle(null, 0.05); if (vmH) vmH.stop(0.05);
    },
    buffers: { B, L, M, V, S }, stats, // for tests / the F2 overlay
    loopNames: () => [...Object.keys(LOOPS), ...Object.keys(LOOP_ALIAS), ...Object.keys(LATE)],   // every bed AUDIO.loop / ambience knows (tests)
    rooms: Object.keys(ROOMS),
    loopReady: (n) => { const al = LOOP_ALIAS[n], k = al ? al[0] : n; return !!(L[k] || M[(DIEG[k] && DIEG[k][0]) || k]); },
  };
  if (typeof window !== 'undefined') window.TWO_AUDIO = AUDIO; // test hook (headless probes)
  return { AUDIO, sfx, music };
})();
