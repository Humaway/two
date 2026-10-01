// ============================================================ MINIGAME: Public Piano (spec §9.6; scene 2.2 "Bee Gees Way")
// Chase at the laneway piano: a short rhythm game. Five lanes (keys); notes fall in time with a 92 bpm click; the
// first four bars of the "two" verse lead (spec §15.3: F#5 D5 F#5 D5 E5 F#5 A5 F#5 | G5 F#5 E5 D5 B4 D5 E5 – |
// F#5 D5 F#5 D5 A5 B5 A5 F#5 | E5 C#5 E5 F#5 E5 – – –), 28 notes, a one-bar count-in. Generous windows. Misses never
// fail: the piano just plays quieter (the left hand follows a live level, a missed note isn't played), and the result's
// loudness tells the scene how slowly the drone should come. A hit plays its note the moment the key goes down
// (AUDIO.note, the engine's piano voice); the click and the left hand are scheduled on the audio clock.
// Ported from Rue's Pedal Power (15-*.js: beat clock, nearest-beat judging, missed-beat sweep, feedback words, panel)
// with Rue's overlay pattern (layout() on resize/scheme change, quantised strings, no allocation per tick or frame).
//
// ---- the mini-game ---------------------------------------------------------------------------------------------
//   ['minigame', 'piano', { shot, continue, drone, droneTo, droneLine, player, at }]   (or c.flow.minigame('piano', …))
//     shot       the camera (default { shot: 'INSERT', at: 's22_piano_play' } when the set has that anchor; false = leave it)
//     continue   true: after the phrase Chase keeps playing on by himself, verse → chorus → second verse, and stops dead
//                where the bridge should be (bar 1 of the bridge). The mini-game finishes ~0.5 s after the phrase so the
//                cutscene 2.2_piano runs over the music; result.handle is that playback. { to: bar } stops earlier.
//     drone      a DRONES id: after the last note the drone turns amber and drifts toward droneTo at result.droneSpeed
//     droneTo    where it drifts to (default mark 's22_drone_piano', else the 'piano' prop)
//     droneLine  false = no bark. Otherwise after the last note: DRONE (bark) "Excuse me! That's quite loud!"
//     player     the actor at the keys (default 'chase'): plays 'piano_play' (seated h 0.48) while the piano plays
//     at         optional where for positional sound (default: none, the piano is heard flat, like the mini-game)
//   Result: { ok: true, loudness 0..1 (hits weighted: in time 1, close 0.75, missed 0), level 0..1 (the live meter at the
//     end), dB (peak on the SafeSense meter), perfect, good, misses, hits, total: 28, droneSpeed (m/s suggestion,
//     0.2 + 0.6 * loudness), continuing, handle (the playback when continuing, else null), auto? (autoplay) }.
//   Skipped (pause menu, only if a scene ever fails it twice: it never calls api.fail, misses don't fail):
//     { skipped: true, ok: true, loudness ≥ 0.6, … }; with `continue` Chase simply plays the rest himself.
//   ['minigame', 'piano', { sneak: true, from, loop, loudness, vol, player, stopOnMove }]: returns at once with
//     { sneak: true, handle, loudness }: Chase keeps playing "two" (verse + chorus, round and round) while the player
//     sneaks the others past. stopOnMove (default true): it stops by itself when Chase leaves the stool (the player
//     walks him away, or a moveTo). The scene decides what stopping too early means (MINIGAMES.piano.playing, or
//     on('piano:stop')).
//   Autoplay (?autoplay=1): plays the phrase on game time (honours &speed), every note in time except two deterministic
//     misses (notes 12 and 23): loudness 0.93, droneSpeed 0.76; the drone line runs as in play, and Chase's playing-on
//     (continue, play() without a loop) runs 6x so a test reaches the dead stop in ~9 s of game time.
//   The scene's part: the limiter is off (limiter_light green) before this; Chase seated at s22_piano_chase
//   (act 'sit' { h: 0.48 }); music off or quiet (the click and the piano are the music); the drone spawned (id -> drone).
//   The mini-game disables the player while it runs (A S D are lanes) and restores him after.
//
// ---- the playback (also usable without the mini-game) ---------------------------------------------------------------
//   MINIGAMES.piano.play({ from = 0, to = 24, loop: [a, b] | true, loudness = last, vol = 1, lead = true, player, at,
//     stopOnMove }) -> handle. Bars count from the verse: 0–7 VERSE, 8–15 CHORUS, 16–23 VERSE2; bar 24 is where the
//     bridge should be (nothing: a dead stop). One playback at a time (a new one replaces the old).
//   handle { mode, playing, bar, section ('VERSE' | 'CHORUS' | 'VERSE2' | 'BRIDGE' once stopped dead), reason
//     ('bridge' | 'end' | 'stop' | 'moved' | 'flow' | 'replaced' | 'abort' | 'skip'), stop(), vol(v), done: Promise }
//   MINIGAMES.piano.stop() · .playing · .handle · .loudness (the last result's) · .droneSpeed(loudness)
//   Events: emit('piano:start', mode), emit('piano:section', 'VERSE' | 'CHORUS' | 'VERSE2'), emit('piano:stop', reason).
//   Everything stops on flow:stop (scene change, Quit to Title). A skipped cutscene does not stop it: call
//   MINIGAMES.piano.stop() there (or await handle.done / waitUntil(() => !MINIGAMES.piano.playing || c.flow.skipping)).
//   Chase plays 'piano_play' while it sounds and sits back ('sit', or 'idle' when he walked off) when it stops.
//   Test hooks: MINIGAMES.piano.chart { n, t, lane, midi } and lanePoint(lane) -> [x, y] (CSS px) for scripted input.
//   Timing: on the audio clock in play (keys and taps are timed in their event handlers; re-synced after a pause, a
//   hidden tab or a stall); on game time under autoplay or before audio has started. Sounds: AUDIO.note (piano voice),
//   sfx 'tick' (the click; pitched down on the downbeat), sfx 'drone_q'.
//
// ---- controls -----------------------------------------------------------------------------------------------------
//   Keyboard  A S D F G (also 1–5, and ← ↓ Space ↑ →)       Gamepad  ◀ ▼ ▶ on the d-pad, A, B (▲ = ▼, X = A, Y = B)
//   Mouse / touch: click or tap a lane or its key.          Story Mode: wider windows and any key / YES / tap plays the
//   next note. There is no hold to confirm here (nothing to set to press-instead); no fail, so no skip offer.
MINIGAMES.piano = (() => {
  // ---------------------------------------------------------- the music (spec §15.3): 92 bpm, B minor, 16th-note steps
  const BPM = 92, BEAT = 60 / BPM, STEP = BEAT / 4, BAR = BEAT * 4;
  const VERSE = [[78, 74, 78, 74, 76, 78, 81, 78], [79, 78, 76, 74, 71, 74, 76, 0], [78, 74, 78, 74, 81, 83, 81, 78], [76, 73, 76, 78, 76, 0, 0, 0]];
  const CHORUS = [[83, 0, 81, 79, 78, 0, 74, 0], [81, 0, 78, 0, 74, 76, 78, 0], [76, 0, 73, 0, 76, 78, 81, 0], [78, 0, 74, 0, 0, 0, 0, 0]]; // eighths; 0 = held
  const SEC = ['VERSE', 'CHORUS', 'VERSE2', 'BRIDGE'];
  const CH_V = [0, 1, 2, 3, 0, 1, 2, 3], CH_C = [1, 2, 3, 0, 1, 2, 3, 0];   // 0 Bm · 1 G · 2 D · 3 A (verse Bm G D A, chorus G D A Bm)
  const ROOT = [47, 43, 50, 45], VOX = [[54, 59, 62], [55, 59, 62], [54, 57, 62], [52, 57, 61]];   // the left hand: root + a close voicing
  const BARS = 24;
  const secOf = (b) => (b < 8 ? 0 : b < 16 ? 1 : b < 24 ? 2 : 3);
  const rowOf = (b) => (secOf(b) === 1 ? CHORUS : VERSE)[b & 3];
  const chOf = (b) => (secOf(b) === 1 ? CH_C : CH_V)[b & 7];
  // five lanes by pitch, so the contour reads: B4/C#5 · D5 · E5 · F#5 · G5/A5/B5
  const laneOf = (m) => (m <= 73 ? 0 : m === 74 ? 1 : m === 76 ? 2 : m === 78 ? 3 : 4);
  const LANE_M = [73, 74, 76, 78, 81];                       // a stray press plays its lane's key, softly (a clam)
  // the phrase chart: verse bars 1–4, times from the downbeat of bar 1 (the count-in is the bar before)
  const NMAX = 32, NT = new Float32Array(NMAX), ND = new Float32Array(NMAX), NM = new Uint8Array(NMAX), NL = new Uint8Array(NMAX);
  let NN = 0;
  for (let b = 0; b < 4; b++) for (let e = 0; e < 8; e++) {
    const m = VERSE[b][e]; if (!m) continue;
    let len = 1; while (e + len < 8 && !VERSE[b][e + len]) len++;
    NT[NN] = b * BAR + e * 2 * STEP; ND[NN] = len * 2 * STEP; NM[NN] = m; NL[NN] = laneOf(m); NN++;
  }
  const PHRASE = 4 * BAR, LEAD = 1.5, PRE = 0.75;           // fall time (s) from the top of the lane to the line; pre-roll
  const AUTO_MISS = [12, 23];                               // autoplay: deterministic misses (the "Quieter" path)

  // ---------------------------------------------------------- look
  const F = '"Trebuchet MS", "Segoe UI", system-ui, sans-serif';
  const TITLE = '"Avenir Next", "Futura", "Century Gothic", "Segoe UI", "Helvetica Neue", "Trebuchet MS", system-ui, sans-serif';
  const COL = ['#c88af0', '#f48aa8', '#f6a05a', '#f2d46a', '#7fd6b8'];   // the painted flowers on the piano
  const DARK = ['#6a3a9a', '#a83a5e', '#a8561a', '#9a7a14', '#2a8a6a'];
  const NAVY = '#141d3a', INK = '#2a3a6a', SKYD = '#5a9ac0', YES = '#ffd21f';
  const FBW = ['', 'Lovely', 'Nice', 'Quieter'];
  const FBC = ['', '#fff3a8', '#e9f6ff', '#b9c3dc'];
  const BARS_TXT = ['COUNT-IN', 'BAR 1 / 4', 'BAR 2 / 4', 'BAR 3 / 4', 'BAR 4 / 4'];
  const COUNT = ['1', '2', '3', '4'], BARNUM = ['1', '2', '3', '4', '5'];
  const DB = []; for (let i = 0; i <= 120; i++) DB.push(i + ' dB');
  const PEAK = []; for (let i = 0; i <= 120; i++) PEAK.push('PEAK ' + i + ' dB');
  const ST_OK = 'Within your safe level.', ST_HOT = 'Above your safe level.', ST_DRONE = 'A Courtesy Drone is on its way.';
  const LBL = { kb: ['A', 'S', 'D', 'F', 'G'], pad: ['◀', '▼', '▶', 'A', 'B'], touch: ['', '', '', '', ''] };
  const HINT = {
    kb: 'A S D F G: play each note as it reaches the line', pad: '◀ ▼ ▶ A B: play each note as it reaches the line',
    touch: 'Tap the keys as the notes reach them',
  };
  const HINT_STORY = { kb: 'Story Mode: any key (or YES) plays the next note', pad: 'Story Mode: any button plays the next note', touch: 'Story Mode: tap anywhere for the next note' };
  // keyboard lanes (raw keydown: the press is timed when it happens, not on the next tick)
  const KEYLANE = { KeyA: 0, Digit1: 0, Numpad1: 0, ArrowLeft: 0, KeyS: 1, Digit2: 1, Numpad2: 1, ArrowDown: 1, KeyD: 2, Digit3: 2, Numpad3: 2, Space: 2,
    KeyF: 3, Digit4: 3, Numpad4: 3, ArrowUp: 3, KeyG: 4, Digit5: 4, Numpad5: 4, ArrowRight: 4 };
  const PADLANE = [['left'], ['down', 'up'], ['right'], ['yes', 'inventory'], ['no', 'swap']];

  // ---------------------------------------------------------- playback: one sequencer, its own ticker, the song clock
  // ct = song seconds (0 = downbeat of verse bar 1). Live (audio running, not autoplay): ct follows AUDIO.now() - A0,
  // re-based after any gap (pause menu, hidden tab, hitch). Otherwise ct += dt (game time: honours &speed, pause).
  const NOTE = { vol: 1, when: 0, rate: 1, at: null }, CLK = { vol: 1, when: 0, rate: 1 }, SIT = { h: 0.48 }, IDLE = {};
  let ct = 0, A0 = 0, live = false, lastAn = -1, stall = 0;
  let qOn = false, qMode = '', qOrigin = 0, qK = 0, qEnd = 0, qLoop = false, qLA = 0, qLB = 0, qClickTo = 0, qLeadFrom = 0, qRing = 0;
  let qLevel = 0.8, qVol = 1, qBar = 0, qSec = -1, qAt = null, qActor = null, qX = 0, qZ = 0, qMove = false, qHandle = null, qTicking = false;
  let qRate = 1;                                            // autoplay only: Chase's playing-on runs AUTO_RATE x (a test reaches the dead stop quickly)
  const AUTO_RATE = 6;
  let lastLoud = 0.8, hooked = false;
  const audio = () => (typeof AUDIO !== 'undefined' && AUDIO ? AUDIO : null);
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

  function clockStep(dt) {
    const A = audio(), an = !TEST.auto && A && A.now ? A.now() : 0;
    if (an > 0) { if (an === lastAn) stall += dt; else stall = 0; lastAn = an; }
    if (an > 0 && stall < 0.1) {
      if (!live) { live = true; A0 = an - (ct + dt); }
      let t = an - A0;
      if (t > ct + dt + 0.25 || t < ct - 0.25) { A0 = an - (ct + dt); t = ct + dt; }   // a gap: carry on from here
      if (t > ct) ct = t;
    } else { live = false; ct += dt * qRate; }
  }
  function nowT() { // the song time right now (between ticks too, when live)
    if (!live) return ct;
    const A = audio(), t = A ? A.now() - A0 : ct;
    return t < ct ? ct : t > ct + 0.1 ? ct + 0.1 : t;
  }
  function pnote(m, vol, when) {
    const A = audio(); if (!A || !A.note || vol <= 0.005) return;
    NOTE.vol = vol; NOTE.when = when; NOTE.at = qAt; A.note(m, NOTE);
  }
  function stepAt(k, when) { // one 16th of the arrangement
    const b = Math.floor(k / 16), s = k - b * 16;
    if (k < qClickTo && (s & 3) === 0 && typeof sfx === 'function') { CLK.when = when; CLK.vol = s === 0 ? 0.85 : 0.5; CLK.rate = s === 0 ? 0.78 : 1; sfx('tick', CLK); }
    if (b < 0 || b >= BARS) return;
    if (s === 0) {
      qBar = b;
      const sc = secOf(b);
      if (sc !== qSec) { qSec = sc; emit('piano:section', SEC[sc]); }
    }
    const c = chOf(b), lv = qVol * (0.4 + 0.6 * qLevel), r = ROOT[c], v = VOX[c];
    if (secOf(b) === 1) { // chorus: it drives a little
      if (s === 0) { pnote(r, 0.5 * lv, when); pnote(v[0], 0.16 * lv, when); pnote(v[1], 0.16 * lv, when); pnote(v[2], 0.16 * lv, when); }
      else if (s === 4 || s === 12) { pnote(v[0], 0.12 * lv, when); pnote(v[1], 0.12 * lv, when); pnote(v[2], 0.12 * lv, when); }
      else if (s === 8) { pnote(r, 0.38 * lv, when); pnote(v[1], 0.13 * lv, when); pnote(v[2], 0.13 * lv, when); }
      else if (s === 14) pnote(r + 12, 0.22 * lv, when);
    } else {
      if (s === 0) { pnote(r, 0.46 * lv, when); pnote(v[0], 0.15 * lv, when); pnote(v[1], 0.15 * lv, when); pnote(v[2], 0.15 * lv, when); }
      else if (s === 6 || s === 12) { pnote(v[1], 0.1 * lv, when); pnote(v[2], 0.1 * lv, when); }
      else if (s === 8) pnote(r + 7, 0.26 * lv, when);
    }
    if (k >= qLeadFrom && !(s & 1)) { const m = rowOf(b)[s >> 1]; if (m) pnote(m, 0.8 * qVol * (0.6 + 0.4 * qLevel), when); }
  }
  function qTick(dt) {
    if (!qOn) return;
    clockStep(dt);
    const look = live ? 0.12 : 0;
    while (qK < qEnd) {
      const st = qOrigin + qK * STEP;
      if (st > ct + look) break;
      stepAt(qK, live ? A0 + st : 0);
      qK++;
      if (qLoop && qK >= qLB) { qOrigin += (qLB - qLA) * STEP; qK = qLA; }
    }
    if (qMove && qActor) { const dx = qActor.pos.x - qX, dz = qActor.pos.z - qZ; if (dx * dx + dz * dz > 0.35 * 0.35) { qFinish('moved'); return; } }
    if (!qLoop && qK >= qEnd && ct >= qOrigin + qEnd * STEP + qRing) qFinish(qEnd >= BARS * 16 ? 'bridge' : 'end');
  }
  function poseOn(id) {
    qActor = null;
    if (!id || typeof world === 'undefined') return;
    const a = world.actor(id);
    if (!a || !a.root.visible) return;
    qActor = a; qX = a.pos.x; qZ = a.pos.z;
    if (a.anim === 'sit') a.rig.seated = true;   // sat down this very tick: keep the seated legs under the playing hands
    if (a.anim !== 'piano_play') { try { a.play('piano_play', SIT); } catch (e) { /* no rig */ } }
  }
  function poseOff(reason) {
    const a = qActor; qActor = null;
    if (!a || a.anim !== 'piano_play' || reason === 'flow' || reason === 'abort') return;   // the scene is going, its actors with it
    try { a.play(reason === 'moved' || !a.rig.seated ? 'idle' : 'sit', reason === 'moved' || !a.rig.seated ? IDLE : SIT); } catch (e) { /* gone */ }
  }
  function hook() {
    if (hooked || typeof on !== 'function') return;
    hooked = true;
    on('flow:stop', () => { if (qOn) qFinish('flow'); });
  }
  function qStart(mode) {
    hook();
    if (qOn) qFinish('replaced');
    qMode = mode; qOn = true; qSec = -1; qBar = 0; lastAn = -1; stall = 0; live = false; qRate = 1;
    if (!qTicking) { qTicking = true; addUpdate(qTick); }
    const h = { mode, reason: '', on: true, done: null, res: null,
      get playing() { return h.on; }, get bar() { return h.on ? qBar : BARS; }, get section() { return h.on ? SEC[secOf(qBar)] : h.reason === 'bridge' ? 'BRIDGE' : 'END'; },
      get t() { return ct; }, stop() { if (h.on && qHandle === h) qFinish('stop'); }, vol(v) { if (qHandle === h) qVol = clamp(+v || 0, 0, 2); } };
    h.done = new Promise((r) => { h.res = r; });
    qHandle = h;
    emit('piano:start', mode);
    return h;
  }
  function qFinish(reason) {
    if (!qOn) return;
    qOn = false; qMove = false;
    if (qTicking) { qTicking = false; removeUpdate(qTick); }
    poseOff(reason);
    const h = qHandle; qHandle = null;
    if (h) { h.on = false; h.reason = reason; h.res(); }
    emit('piano:stop', reason);
  }
  function play(o = {}) { // the public playback (sneak, a scene replaying the continuation, Chapter Select)
    const from = clamp(Math.floor(o.from ?? 0), 0, BARS - 1), to = clamp(Math.floor(o.to ?? BARS), from + 1, BARS);
    const lp = o.loop === true ? [from, to] : Array.isArray(o.loop) ? o.loop : null;
    const h = qStart(lp ? 'loop' : 'play');
    ct = 0; qOrigin = 0.08 - from * BAR; qK = from * 16;
    qLoop = !!lp; qLA = lp ? clamp(lp[0] | 0, 0, BARS - 1) * 16 : 0; qLB = lp ? clamp(lp[1] | 0, 1, BARS) * 16 : 0;
    if (qLoop && (qLB <= qLA || qK >= qLB || qK < qLA)) { qLA = 0; qLB = 16 * 16; qK = 0; qOrigin = 0.08; }
    qEnd = qLoop ? Infinity : to * 16; qRing = 0; qClickTo = -1e9; qLeadFrom = o.lead === false ? 1e9 : -1e9;
    qLevel = clamp(o.loudness ?? lastLoud, 0, 1); qVol = clamp(o.vol ?? 1, 0, 2); qAt = o.at || null;
    if (TEST.auto && !lp) qRate = AUTO_RATE;
    poseOn(o.player === undefined ? 'chase' : o.player);
    qMove = !!(o.stopOnMove && qActor);
    return h;
  }

  // ---------------------------------------------------------- the game
  let api = null, ov = null, ctx = null, p = {}, done = true, active = false, auto = false, story = false, cont = false;
  let PERF = 0.08, GOOD = 0.18, level = 0.6, vu = 34, vuShow = 34, peak = 34, perfect = 0, good = 0, misses = 0, ni = 0, ai = 0, barked = false, droneOn = false;
  let endAt = 0, finT = 0, strayT = 0, loudness = 0, hintOn = true, wasEnabled = false;
  const NJ = new Uint8Array(NMAX);                           // 0 pending · 1 in time · 2 close · 3 missed
  const KP = new Float32Array(5), LG = new Float32Array(5), FB = new Float32Array(5), FK = new Uint8Array(5);
  const PN = 40, PT = new Float32Array(PN * 6);               // petals: x y vx vy life lane
  let pi = 0;

  function petals(lane) {
    const x = hx + (lane + 0.5) * lw, y = sy;
    for (let n = 0; n < 7; n++) {
      const j = pi * 6; pi = (pi + 1) % PN;
      const a = -Math.PI * (0.15 + 0.7 * Math.random()), v = 70 + Math.random() * 110;
      PT[j] = x + (Math.random() - 0.5) * lw * 0.5; PT[j + 1] = y; PT[j + 2] = Math.cos(a) * v; PT[j + 3] = Math.sin(a) * v; PT[j + 4] = 0.55 + Math.random() * 0.35; PT[j + 5] = lane;
    }
  }
  function judge(i, off) {
    const lane = NL[i], k = Math.abs(off) <= PERF ? 1 : 2;
    NJ[i] = k;
    if (k === 1) { perfect++; level += (1 - level) * 0.24; petals(lane); } else { good++; level += (1 - level) * 0.13; }
    qLevel = level;
    pnote(NM[i], (k === 1 ? 0.95 : 0.8) * (0.75 + 0.25 * level), 0);
    vu = Math.max(vu, 47 + 40 * level + (k === 1 ? 3 : 0)); if (vu > peak) peak = vu;
    FB[lane] = 0.6; FK[lane] = k; LG[lane] = 0.25;
  }
  function miss(i) {
    const lane = NL[i];
    NJ[i] = 3; misses++;
    level = Math.max(0.08, level - 0.13); qLevel = level;
    FB[lane] = 0.6; FK[lane] = 3;
  }
  // a press on `lane` (-1: Story Mode's any-key) at song time t
  function press(lane, t) {
    if (!active) return;
    const any = story || lane < 0;
    let best = -1;
    for (let i = ni; i < NN; i++) {
      if (NT[i] - t > GOOD) break;
      if (NJ[i] || (!any && NL[i] !== lane)) continue;
      if (Math.abs(NT[i] - t) <= GOOD) { best = i; break; }
    }
    if (best >= 0) { KP[NL[best]] = 0.12; judge(best, t - NT[best]); return; }
    if (lane < 0) return;
    KP[lane] = 0.12;
    if (t > -BAR && ct - strayT > 0.09) { strayT = ct; pnote(LANE_M[lane], 0.22 * (0.6 + 0.4 * level), 0); }   // a wrong key: a quiet clam
  }
  function onKey(e) {
    if (!active || e.repeat || clock.paused) return;
    const tg = e.target;
    if (tg && (tg.tagName === 'INPUT' || tg.tagName === 'TEXTAREA')) return;
    let lane = KEYLANE[e.code];
    if (lane === undefined) { if (story && (e.code === 'Enter' || e.code === 'NumpadEnter')) lane = -1; else return; }
    e.preventDefault();
    press(lane, nowT());
  }
  function onPtr(e) {
    if (!active || clock.paused || e.button === 2) return;
    const tg = e.target;
    if (tg && tg.closest && tg.closest('#touch, button, #menu')) return;
    const x = e.clientX, y = e.clientY;
    if (x >= hx && x < hx + 5 * lw && y >= py && y <= py + ph) press(Math.min(4, Math.floor((x - hx) / lw)), nowT());
    else if (story) press(-1, nowT());
  }

  // ---------------------------------------------------------- layout (on start, resize, input scheme change)
  let W = 0, H = 0, sch = '', touch = false, narrow = false;
  let px = 0, py = 0, pw = 0, ph = 0, k1 = 1, pad = 14, headH = 56, keyH = 64, hx = 0, hw = 0, lw = 0, hy = 0, sy = 0, hh = 0, pxs = 1, noteH = 18;
  let mSide = false, mx = 0, my = 0, mw = 0, mh = 0, cpx = 0, cpw = 0;
  let fTwo = '', fHdr = '', fBar = '', fKey = '', fFb = '', fCount = '', fHint = '', fBig = '', fSm = '', fSt = '';
  let lbl = LBL.kb, hint = '', hint2 = '';
  let bgC = null, mC = null;
  const SH = 16, KR = [2, 2, 7, 7], KB = [0, 0, 3, 3];
  const GL = [null, null, null, null, null];                // lane glow gradients
  let gCool = null, gHot = null;
  function canvas2(w, h) { const c = document.createElement('canvas'); c.width = Math.max(1, w); c.height = Math.max(1, h); return c; }
  function rr(c, x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, r); }
  function flower(c, x, y, r, col) {
    c.fillStyle = col;
    for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; c.beginPath(); c.arc(x + Math.cos(a) * r, y + Math.sin(a) * r, r * 0.86, 0, Math.PI * 2); c.fill(); }
    c.fillStyle = '#f2e6a0'; c.beginPath(); c.arc(x, y, r * 0.55, 0, Math.PI * 2); c.fill();
  }
  function noteGlyph(c, x, y, s, col) {
    c.fillStyle = col; c.strokeStyle = col; c.lineWidth = Math.max(1, s * 0.22);
    c.beginPath(); c.ellipse(x, y, s, s * 0.72, -0.4, 0, Math.PI * 2); c.fill();
    c.fillRect(x + s * 0.7, y - s * 3.2, s * 0.32, s * 3.2);
    c.beginPath(); c.moveTo(x + s * 1.0, y - s * 3.2); c.quadraticCurveTo(x + s * 2.4, y - s * 2.4, x + s * 1.9, y - s * 1.3); c.stroke();
  }
  function layout() {
    W = innerWidth; H = innerHeight; sch = api.input.scheme; touch = sch === 'touch';
    narrow = W < 700 || W < H * 0.8;
    let L = 12, R = W - 12, T = 58, B = H - 12;
    if (touch) { if (W < H) { B = H - 222; T = 118; } else { L = 192; R = W - 222; } }   // clear of the stick, the buttons and the pause button
    pw = Math.round(Math.max(220, Math.min(360, R - L)));
    ph = Math.round(Math.max(240, Math.min(600, B - T)));
    px = !narrow && !touch ? Math.round(W - pw - Math.max(28, W * 0.07)) : Math.round(L + (R - L - pw) / 2);
    py = Math.round(T + Math.max(0, (B - T - ph) * 0.5));
    k1 = clamp(pw / 360, 0.72, 1);
    pad = Math.round(13 * k1);
    headH = Math.round(ph < 380 ? 44 : 58 * k1);
    keyH = Math.round(clamp(ph * 0.12, 46, 72));
    hx = px + pad; hw = pw - 2 * pad; lw = hw / 5;
    hy = py + headH; sy = py + ph - pad - keyH; hh = sy - hy; pxs = hh / LEAD;
    noteH = Math.round(clamp(lw * 0.3, 13, 20));
    fTwo = '600 ' + Math.round(30 * k1) + 'px ' + TITLE; fHdr = 'bold ' + Math.round(11 * k1) + 'px ' + F; fBar = 'bold ' + Math.round(12 * k1) + 'px ' + F;
    fKey = 'bold ' + Math.round(19 * k1) + 'px ' + F; fFb = 'bold ' + Math.round(15 * k1) + 'px ' + F; fCount = 'bold ' + Math.round(70 * k1) + 'px ' + TITLE;
    fHint = Math.round(13 * k1) + 'px ' + F;
    lbl = LBL[sch] || LBL.kb; hint = HINT[sch] || HINT.kb; hint2 = story ? HINT_STORY[sch] || HINT_STORY.kb : '';
    // the SafeSense meter: a glass card beside the panel when there is room, else a pill in the header
    mSide = !narrow && !touch && px - 244 >= 12;
    if (mSide) { mw = 226; mh = 104; mx = px - mw - 16; my = py + 8; }
    cpw = Math.round(96 * k1); cpx = px + pw - pad - cpw;
    fBig = 'bold ' + (mSide ? 30 : Math.round(17 * k1)) + 'px ' + F; fSm = (mSide ? 11 : Math.round(10 * k1)) + 'px ' + F; fSt = '12px ' + F;
    for (let l = 0; l < 5; l++) {
      const g = ctx.createLinearGradient(0, sy, 0, sy - hh * 0.55);
      g.addColorStop(0, COL[l]); g.addColorStop(1, 'rgba(255,255,255,0)'); GL[l] = g;
    }
    const bx0 = mSide ? mx + 16 : cpx + 8, bx1 = mSide ? mx + mw - 16 : cpx + cpw - 8;
    gCool = ctx.createLinearGradient(bx0, 0, bx1, 0); gCool.addColorStop(0, '#8fd0ff'); gCool.addColorStop(1, '#2f86e0');
    gHot = ctx.createLinearGradient(bx0, 0, bx1, 0); gHot.addColorStop(0, '#8fd0ff'); gHot.addColorStop(0.35, '#ffc58f'); gHot.addColorStop(1, '#f0603a');
    paintPanel(); paintMeter();
  }
  function paintPanel() {
    const s = ov.canvas.width / W, w = pw + SH * 2, h = ph + SH * 2;
    if (!bgC) bgC = canvas2(1, 1);
    bgC.width = Math.round(w * s); bgC.height = Math.round(h * s);
    const c = bgC.getContext('2d');
    c.setTransform(s, 0, 0, s, 0, 0); c.clearRect(0, 0, w, h);
    const ox = SH, oy = SH, R0 = 14 * k1;
    // body: sky-blue painted wood with a soft drop shadow
    c.save(); c.shadowColor = 'rgba(0,0,0,0.45)'; c.shadowBlur = 16; c.shadowOffsetY = 5;
    let g = c.createLinearGradient(0, oy, 0, oy + ph); g.addColorStop(0, '#a8dcf5'); g.addColorStop(1, '#78bde4');
    c.fillStyle = g; rr(c, ox, oy, pw, ph, R0); c.fill(); c.restore();
    let seed = 7; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    c.save(); rr(c, ox, oy, pw, ph, R0); c.clip();
    for (let i = 0; i < 46; i++) { c.fillStyle = rnd() > 0.5 ? 'rgba(255,255,255,0.09)' : 'rgba(40,90,140,0.07)'; c.fillRect(ox + rnd() * pw, oy + rnd() * ph, 1 + rnd() * 2, 10 + rnd() * 40); }
    // the name board: a deep blue band with the song's name
    g = c.createLinearGradient(0, oy, 0, oy + headH); g.addColorStop(0, '#34497e'); g.addColorStop(1, INK);
    c.fillStyle = g; c.fillRect(ox, oy, pw, headH - 4);
    c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(ox, oy + headH - 4, pw, 1.5);
    c.restore();
    c.lineWidth = 4; c.strokeStyle = SKYD; rr(c, ox + 2, oy + 2, pw - 4, ph - 4, R0 - 2); c.stroke();
    c.lineWidth = 1.5; c.strokeStyle = 'rgba(230,248,255,0.55)'; rr(c, ox + 5, oy + 5, pw - 10, ph - 10, R0 - 4); c.stroke();
    // 'two' in the logo style (lowercase white, a 2 px Yes-yellow underline) + PUBLIC PIANO
    const ty = oy + headH * 0.5 - 1;
    c.textBaseline = 'middle'; c.textAlign = 'left'; c.font = fTwo; c.fillStyle = '#ffffff';
    const tw = c.measureText('two').width;
    c.fillText('two', ox + pad + 4, ty - 2);
    c.fillStyle = YES; c.fillRect(ox + pad + 5, ty + Math.round(13 * k1), Math.round(tw - 2), 2);
    if (mSide || pw > 300) {
      const lx = ox + pad + 4 + tw + Math.round(14 * k1);
      c.fillStyle = 'rgba(159,200,232,0.35)'; c.fillRect(lx - Math.round(8 * k1), ty - Math.round(13 * k1), 1, Math.round(24 * k1));
      c.font = fHdr; c.fillStyle = '#9fc8e8'; c.fillText('PUBLIC PIANO', lx, ty - Math.round(7 * k1));
      c.fillStyle = '#7f9cc8'; c.fillText('92 BPM · B MINOR', lx, ty + Math.round(8 * k1));
    }
    // painted flowers and notes round the frame
    const fl = [[0.04, 0.12], [0.96, 0.2], [0.02, 0.42], [0.98, 0.55], [0.03, 0.74], [0.97, 0.86], [0.2, 0.985], [0.5, 0.99], [0.8, 0.985]];
    for (let i = 0; i < fl.length; i++) flower(c, ox + fl[i][0] * pw, oy + fl[i][1] * ph, (4 + (i % 3)) * k1, COL[i % 5]);
    noteGlyph(c, ox + 0.985 * pw, oy + 0.36 * ph, 3.2 * k1, INK); noteGlyph(c, ox + 0.012 * pw, oy + 0.6 * ph, 3.2 * k1, INK);
    // the lane well
    const wx = ox + pad, wy = oy + headH, ww = hw, wh = hh + keyH;
    c.fillStyle = 'rgba(12,19,44,0.94)'; rr(c, wx - 2, wy - 2, ww + 4, wh + 4, 9); c.fill();
    g = c.createLinearGradient(0, wy, 0, wy + 26); g.addColorStop(0, 'rgba(0,0,0,0.45)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g; c.fillRect(wx, wy, ww, 26);
    for (let l = 0; l < 5; l++) {
      c.fillStyle = COL[l]; c.globalAlpha = 0.045; c.fillRect(wx + l * lw, wy, lw, hh); c.globalAlpha = 1;
      if (l) { c.fillStyle = 'rgba(255,255,255,0.08)'; c.fillRect(Math.round(wx + l * lw), wy, 1, hh); }
    }
    c.globalAlpha = 0.07; c.font = 'bold ' + Math.round(26 * k1) + 'px ' + F; c.fillStyle = '#ffffff'; c.textAlign = 'center';
    c.fillText('PLAY ME', wx + ww / 2, wy + hh * 0.3); c.globalAlpha = 1;
    // the keys: cream, rounded at the front, a gem of the lane colour, black keys between (decoration)
    const ky = oy + headH + hh;
    for (let l = 0; l < 5; l++) {
      const x = wx + l * lw + 2, w2 = lw - 4;
      g = c.createLinearGradient(0, ky, 0, ky + keyH); g.addColorStop(0, '#fbf9f2'); g.addColorStop(0.8, '#ece6d8'); g.addColorStop(1, '#d6cfbe');
      c.fillStyle = g; c.beginPath(); c.roundRect(x, ky + 3, w2, keyH - 5, KR); c.fill();
      c.strokeStyle = '#a9a294'; c.lineWidth = 1; c.stroke();
      c.fillStyle = COL[l]; rr(c, x + w2 * 0.2, ky + 6, w2 * 0.6, 5, 2.5); c.fill();
      c.fillStyle = DARK[l]; c.globalAlpha = 0.5; c.fillRect(x + w2 * 0.2, ky + 10, w2 * 0.6, 1); c.globalAlpha = 1;
      if (lbl[l]) { c.font = fKey; c.fillStyle = INK; c.textAlign = 'center'; c.fillText(lbl[l], x + w2 / 2, ky + keyH * 0.62); }
      else { c.fillStyle = 'rgba(42,58,106,0.25)'; c.beginPath(); c.arc(x + w2 / 2, ky + keyH * 0.62, 4, 0, Math.PI * 2); c.fill(); }
    }
    for (const gap of [1, 2, 4]) {
      const x = wx + gap * lw, bw = lw * 0.3;
      c.fillStyle = '#16161c'; c.beginPath(); c.roundRect(x - bw / 2, ky + 3, bw, keyH * 0.36, KB); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(x - bw / 2 + 2, ky + 4, bw - 4, 2);
    }
  }
  function paintMeter() {
    if (!mSide) return;
    const s = ov.canvas.width / W, w = mw + SH * 2, h = mh + SH * 2;
    if (!mC) mC = canvas2(1, 1);
    mC.width = Math.round(w * s); mC.height = Math.round(h * s);
    const c = mC.getContext('2d');
    c.setTransform(s, 0, 0, s, 0, 0); c.clearRect(0, 0, w, h);
    const ox = SH, oy = SH;
    c.save(); c.shadowColor = 'rgba(120,190,255,0.6)'; c.shadowBlur = 16;
    c.fillStyle = 'rgba(250,253,255,0.88)'; rr(c, ox, oy, mw, mh, 18); c.fill(); c.restore();
    c.strokeStyle = 'rgba(255,255,255,0.95)'; c.lineWidth = 1.2; rr(c, ox + 0.5, oy + 0.5, mw - 1, mh - 1, 18); c.stroke();
    const g = c.createRadialGradient(ox + 19, oy + 17, 1, ox + 21, oy + 19, 7); g.addColorStop(0, '#ffffff'); g.addColorStop(0.5, '#8fd0ff'); g.addColorStop(1, '#2f86e0');
    c.fillStyle = g; c.beginPath(); c.arc(ox + 21, oy + 19, 6.5, 0, Math.PI * 2); c.fill();
    c.textBaseline = 'middle'; c.textAlign = 'left'; c.font = '600 12px ' + F; c.fillStyle = '#2f86e0'; c.fillText('SafeSense', ox + 33, oy + 19);
    c.textAlign = 'right'; c.font = 'bold 11px ' + F; c.fillStyle = '#e8892f'; c.fillText('OFF', ox + mw - 16, oy + 19);
    const ow = c.measureText('OFF').width;
    c.font = '11px ' + F; c.fillStyle = '#7d8fae'; c.fillText('MAX 40 dB', ox + mw - 22 - ow, oy + 19);
    const mw2 = c.measureText('MAX 40 dB').width;
    c.fillStyle = 'rgba(125,143,174,0.9)'; c.fillRect(ox + mw - 23 - ow - mw2, oy + 19, mw2 + 2, 1.2);   // the limiter is off
    // the bar track, 30–95 dB, with the 40 dB line
    const bx = ox + 16, bw = mw - 32, by = oy + 66;
    c.fillStyle = 'rgba(47,134,224,0.14)'; rr(c, bx, by, bw, 8, 4); c.fill();
    const x40 = bx + bw * (40 - 30) / 65;
    c.fillStyle = '#7d8fae'; c.fillRect(x40 - 0.75, by - 4, 1.5, 16);
  }
  function size() { if (W !== innerWidth || H !== innerHeight || sch !== api.input.scheme) layout(); }

  // ---------------------------------------------------------- lifecycle
  function finishGame() {
    if (done) return;
    done = true; active = false;
    const r = { ok: true, loudness, level: Math.round(level * 100) / 100, dB: Math.round(peak), perfect, good, misses, hits: perfect + good, total: NN,
      droneSpeed: droneSpeed(loudness), continuing: cont && qOn, handle: cont && qOn ? qHandle : null };
    if (auto) r.auto = true;
    if (TEST.auto && r.continuing) qRate = AUTO_RATE;
    api.finish(r);
  }
  function droneSpeed(l) { return Math.round((0.2 + 0.6 * clamp(+l || 0, 0, 1)) * 100) / 100; }
  function droneGo() {
    if (p.droneLine !== false && typeof bark === 'function') bark('drone', "Excuse me! That's quite loud!");
    const id = p.drone;
    if (!id || typeof DRONES === 'undefined' || !DRONES.get || !DRONES.get(id)) return;
    let to = p.droneTo;
    if (!to) to = world.mark('s22_drone_piano') ? 's22_drone_piano' : world.prop('piano') ? 'piano' : null;
    if (!to) return;
    const d = DRONES.get(id);
    DRONES.goTo(id, to, { speed: droneSpeed(loudness), then: 'idle' });
    DRONES.light(id, 'curious');
    if (d && d.obj && typeof sfx === 'function') sfx('drone_q', { at: d.obj.position, vol: 0.8 });
    droneOn = true;
  }
  function accNow() { let w = 0; for (let i = 0; i < NN; i++) w += NJ[i] === 1 ? 1 : NJ[i] === 2 ? 0.75 : 0; return w / NN; }
  function listen(on2) {
    if (on2) { addEventListener('keydown', onKey); addEventListener('pointerdown', onPtr); }
    else { removeEventListener('keydown', onKey); removeEventListener('pointerdown', onPtr); }
  }

  const M = {
    start(params, a) {
      api = a; p = params || a.params || {}; ov = a.overlay; ctx = ov.ctx;
      done = false; active = false; auto = false; W = 0; sch = '';
      story = !!(typeof options !== 'undefined' && options.storyMode);
      PERF = story ? 0.12 : 0.08; GOOD = story ? 0.27 : 0.18;
      if (p.shot !== false) {
        const shot = p.shot || (a.world.anchor('s22_piano_play') ? { shot: 'INSERT', at: 's22_piano_play' } : null);
        if (shot) a.cam.shot(shot);
      }
      if (p.sneak) { // Chase plays on by himself while the others sneak past: no game, just the playback
        const h = play({ from: p.from ?? 0, loop: p.loop || [0, 16], loudness: p.loudness, vol: p.vol, player: p.player, at: p.at, stopOnMove: p.stopOnMove !== false });
        done = true;
        a.finish({ sneak: true, handle: h, loudness: qLevel });
        return;
      }
      cont = !!p.continue;
      level = 0.6; vu = vuShow = peak = 34; perfect = good = misses = 0; ni = ai = 0; barked = droneOn = false; strayT = -9; loudness = 0; hintOn = true;
      NJ.fill(0); KP.fill(0); LG.fill(0); FB.fill(0); PT.fill(0);
      // the playback: count-in clicks, then the left hand; the lead is the player's (and Chase's own after the phrase)
      qStart(cont ? 'game+' : 'game');
      ct = -(BAR + PRE); qOrigin = 0; qK = -16; qLoop = false; qClickTo = 64; qLeadFrom = cont ? 64 : 1e9; qLevel = level; qVol = 1; qAt = p.at || null;
      const to = cont && p.continue && typeof p.continue === 'object' && p.continue.to ? clamp(p.continue.to | 0, 5, BARS) : BARS;
      qEnd = cont ? to * 16 : 65; qRing = cont ? 0 : 0.9;
      poseOn(p.player === undefined ? 'chase' : p.player);
      endAt = PHRASE + (cont ? 0.55 : 1.25); finT = 0;
      wasEnabled = player.enabled; player.enabled = false;   // A S D are lanes here, not walking
      ov.show(true);
      layout();
      active = true; listen(true);
    },
    update(dt) {
      if (done) return;
      if (!qOn) { live = false; ct += dt; }   // the playback has rung out (or was replaced): the game keeps its own time
      size();
      const t = nowT(), I = api.input;
      if (I.scheme === 'pad') for (let l = 0; l < 5; l++) { const acts = PADLANE[l]; for (let j = 0; j < acts.length; j++) if (I.pressed(acts[j])) press(l, t); }
      else if (story && I.pressed('yes') && !I.pointer.pressed && I.scheme !== 'kb') press(-1, t);
      if (auto) while (ai < NN && NT[ai] <= ct) { if (AUTO_MISS.indexOf(ai) < 0) press(NL[ai], NT[ai]); ai++; }
      while (ni < NN && (NJ[ni] || NT[ni] + GOOD < t)) { if (!NJ[ni]) miss(ni); ni++; }
      if (!barked && ni >= NN) { barked = true; loudness = Math.round(accNow() * 100) / 100; lastLoud = loudness; qLevel = 0.5 * (level + loudness); droneGo(); }
      // the meter falls back toward the room (34 dB of cicadas) plus what's still ringing
      const floor = ct < 0 ? 34 : 36 + 22 * level;
      vu = vu > floor ? Math.max(floor, vu - 16 * dt) : Math.min(floor, vu + 30 * dt);
      vuShow += (vu - vuShow) * Math.min(1, dt * 14);
      for (let l = 0; l < 5; l++) { if (KP[l] > 0) KP[l] -= dt; if (LG[l] > 0) LG[l] -= dt; if (FB[l] > 0) FB[l] -= dt; }
      for (let j = 0; j < PN * 6; j += 6) if (PT[j + 4] > 0) { PT[j] += PT[j + 2] * dt; PT[j + 1] += PT[j + 3] * dt; PT[j + 3] += 260 * dt; PT[j + 2] *= 1 - dt * 1.5; PT[j + 4] -= dt; }
      if (hintOn && ct > 0.6 * BAR) hintOn = false;
      if (ct >= PHRASE) finT += dt;
      if (ct >= endAt) finishGame();
    },
    draw() {
      if (done || !ctx || !W) return;
      const t = nowT(), s = ov.canvas.width / W;
      ctx.setTransform(s, 0, 0, s, 0, 0); ctx.clearRect(0, 0, W, H);
      // in from below, out the same way
      const tin = t + BAR + PRE, f0 = cont ? 0.05 : 0.7, kin = tin < 0.35 ? tin / 0.35 : 1, kout = finT > f0 ? Math.max(0, 1 - (finT - f0) / 0.45) : 1;
      const a0 = Math.min(kin, kout), dy = (1 - kin) * 26 + (1 - kout) * 18;
      if (a0 <= 0) return;
      ctx.globalAlpha = a0; ctx.translate(0, dy);
      if (bgC) ctx.drawImage(bgC, px - SH, py - SH, pw + SH * 2, ph + SH * 2);
      ctx.textBaseline = 'middle';
      const rf = typeof options !== 'undefined' && options.reduceFlashing;
      // header: where we are
      const bi = t < 0 ? 0 : Math.min(4, 1 + Math.floor(t / BAR));
      ctx.font = fBar; ctx.textAlign = 'right'; ctx.fillStyle = bi ? '#ffffff' : YES;
      if (mSide) ctx.fillText(BARS_TXT[bi], px + pw - pad - 4, py + headH * 0.5 - 1);
      const pr = clamp(t / PHRASE, 0, 1);
      ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(hx, py + headH - 4, hw, 2);
      ctx.fillStyle = YES; ctx.fillRect(hx, py + headH - 4, hw * pr, 2);
      // the lanes (clipped to the well)
      ctx.save(); ctx.beginPath(); ctx.rect(hx, hy, hw, hh); ctx.clip();
      // beat lines, the bar lines brighter with their numbers
      const b0 = Math.ceil((t - 0.2) / BEAT), b1 = Math.floor((t + LEAD) / BEAT);
      ctx.font = fHdr; ctx.textAlign = 'left';
      for (let b = b0; b <= b1; b++) {
        if (b < -4 || b > 16) continue;
        const y = sy - (b * BEAT - t) * pxs, bar = (b & 3) === 0;
        ctx.fillStyle = bar ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.07)';
        ctx.fillRect(hx, Math.round(y), hw, bar ? 2 : 1);
        if (bar && b >= 0 && b < 16) { ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillText(BARNUM[b >> 2], hx + 4, y - 7); }
      }
      // hit glow columns
      for (let l = 0; l < 5; l++) if (LG[l] > 0) { ctx.globalAlpha = a0 * (LG[l] / 0.25) * (rf ? 0.35 : 0.7); ctx.fillStyle = GL[l]; ctx.fillRect(hx + l * lw, sy - hh * 0.55, lw, hh * 0.55); }
      ctx.globalAlpha = a0;
      // the notes
      const nw = lw * 0.78;
      for (let i = 0; i < NN; i++) {
        const dt0 = NT[i] - t;
        if (dt0 > LEAD + 0.1) break;
        const j = NJ[i], l = NL[i], x = hx + l * lw + (lw - nw) / 2, y = sy - dt0 * pxs;
        if (j === 1 || j === 2) { // played: only the held part glows down to the line while it rings
          const e = NT[i] + ND[i] - t;
          if (ND[i] > 2 * STEP + 0.01 && e > 0) { const y2 = sy - e * pxs; ctx.fillStyle = COL[l]; ctx.globalAlpha = a0 * 0.75; ctx.fillRect(x + nw * 0.38, y2, nw * 0.24, sy - y2); ctx.globalAlpha = a0; }
          continue;
        }
        if (y - noteH > sy + 4 && j === 3) continue;
        if (j === 3) ctx.globalAlpha = a0 * 0.28;
        if (ND[i] > 2 * STEP + 0.01) { const y2 = sy - (dt0 + ND[i]) * pxs; ctx.fillStyle = COL[l]; ctx.globalAlpha *= 0.45; ctx.fillRect(x + nw * 0.38, y2, nw * 0.24, y - y2); ctx.globalAlpha = j === 3 ? a0 * 0.28 : a0; }
        ctx.fillStyle = COL[l]; ctx.beginPath(); ctx.roundRect(x, y - noteH / 2, nw, noteH, noteH / 2); ctx.fill();
        ctx.lineWidth = 2; ctx.strokeStyle = DARK[l]; ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fillRect(x + noteH * 0.45, y - noteH * 0.28, nw - noteH * 0.9, Math.max(2, noteH * 0.16));
        if (j === 3) ctx.globalAlpha = a0;
      }
      ctx.restore();
      ctx.globalAlpha = a0;
      // the line: pulses on the beat
      const fr = t / BEAT - Math.floor(t / BEAT), pulse = t > -BAR && t < PHRASE ? Math.max(0, 1 - fr * 4) * (rf ? 0.4 : 1) : 0;
      ctx.globalAlpha = a0 * (0.55 + 0.45 * pulse); ctx.fillStyle = '#fff6dc'; ctx.fillRect(hx, sy - 2, hw, 3);
      ctx.globalAlpha = a0;
      for (let l = 0; l < 5; l++) { ctx.fillStyle = COL[l]; ctx.fillRect(hx + (l + 0.5) * lw - 3, sy - 4, 6, 7); }
      // keys going down
      for (let l = 0; l < 5; l++) if (KP[l] > 0) {
        const x = hx + l * lw + 2, w2 = lw - 4;
        ctx.globalAlpha = a0 * 0.4; ctx.fillStyle = COL[l]; ctx.beginPath(); ctx.roundRect(x, sy + 3, w2, keyH - 5, KR); ctx.fill();
        ctx.globalAlpha = a0 * 0.35; ctx.fillStyle = NAVY; ctx.fillRect(x, sy + 3, w2, 4);
      }
      ctx.globalAlpha = a0;
      // petals
      for (let j = 0; j < PN * 6; j += 6) if (PT[j + 4] > 0) {
        ctx.globalAlpha = a0 * Math.min(1, PT[j + 4] * 2.5); ctx.fillStyle = COL[PT[j + 5]];
        const r = 2.6 + (j % 3);
        ctx.fillRect(PT[j] - r, PT[j + 1] - r * 0.6, r * 2, r * 1.2);
      }
      ctx.globalAlpha = a0;
      // feedback words
      ctx.font = fFb; ctx.textAlign = 'center';
      for (let l = 0; l < 5; l++) if (FB[l] > 0) {
        ctx.globalAlpha = a0 * Math.min(1, FB[l] * 3); ctx.fillStyle = FBC[FK[l]];
        ctx.fillText(FBW[FK[l]], hx + (l + 0.5) * lw, sy - 20 - (0.6 - FB[l]) * 46);
      }
      ctx.globalAlpha = a0;
      // the count-in, and the hint before it
      const cy = hy + hh * 0.42;
      if (t < 0 && t >= -BAR) {
        const bt = (t + BAR) / BEAT, n = Math.min(3, Math.floor(bt)), f = bt - n;
        ctx.globalAlpha = a0 * Math.max(0, 1 - f * 0.9); ctx.font = fCount; ctx.fillStyle = '#ffffff'; ctx.fillText(COUNT[n], hx + hw / 2, cy);
        ctx.globalAlpha = a0;
      }
      if (hintOn) {
        const ha = t < 0 ? 1 : Math.max(0, 1 - t / (0.6 * BAR));
        ctx.globalAlpha = a0 * ha; ctx.font = fHint; ctx.fillStyle = '#e8f4ff';
        ctx.fillText(hint, hx + hw / 2, cy + Math.round(58 * k1), hw - 12);
        if (hint2) { ctx.fillStyle = '#ffe9a8'; ctx.fillText(hint2, hx + hw / 2, cy + Math.round(78 * k1), hw - 12); }
        ctx.globalAlpha = a0;
      }
      // the SafeSense meter
      const db = Math.round(clamp(vuShow, 0, 120)), hot = db > 40, u = clamp((vuShow - 30) / 65, 0, 1);
      if (mSide) {
        if (mC) ctx.drawImage(mC, mx - SH, my - SH, mw + SH * 2, mh + SH * 2);
        ctx.textAlign = 'left'; ctx.font = fBig; ctx.fillStyle = hot ? '#c2461c' : '#1c2a44'; ctx.fillText(DB[db], mx + 16, my + 45);
        ctx.font = fSm; ctx.textAlign = 'right'; ctx.fillStyle = '#7d8fae'; ctx.fillText(PEAK[Math.round(clamp(peak, 0, 120))], mx + mw - 16, my + 47);
        ctx.fillStyle = hot ? gHot : gCool; ctx.beginPath(); ctx.roundRect(mx + 16, my + 66, Math.max(8, (mw - 32) * u), 8, 4); ctx.fill();
        ctx.font = fSt; ctx.textAlign = 'left'; ctx.fillStyle = droneOn ? '#c2461c' : hot ? '#d0721c' : '#6b84aa';
        ctx.fillText(droneOn ? ST_DRONE : hot ? ST_HOT : ST_OK, mx + 16, my + 90, mw - 30);
      } else {
        const cy2 = py + headH * 0.5 - 2, ch = Math.round(30 * k1);
        ctx.fillStyle = 'rgba(250,253,255,0.9)'; ctx.beginPath(); ctx.roundRect(cpx, cy2 - ch / 2, cpw, ch, ch / 2); ctx.fill();
        ctx.font = fBig; ctx.textAlign = 'center'; ctx.fillStyle = hot ? '#c2461c' : '#1c2a44'; ctx.fillText(DB[db], cpx + cpw / 2, cy2 - 2);
        ctx.fillStyle = hot ? gHot : gCool; ctx.fillRect(cpx + 8, cy2 + ch / 2 - 6, Math.max(4, (cpw - 16) * u), 3);
      }
      ctx.globalAlpha = 1; ctx.setTransform(s, 0, 0, s, 0, 0);
    },
    end(result) {
      listen(false);
      if (wasEnabled) { wasEnabled = false; player.enabled = true; }
      active = false; done = true; auto = false;
      const keep = result && (result.continuing || result.sneak);
      if (!keep && qOn && (qMode === 'game' || qMode === 'game+')) {
        if (result && (result.aborted || result.error)) qFinish('abort');
        else if (result && result.skipped) qFinish('skip');
        else if (qMode === 'game+') qFinish('stop');   // a continuation nobody is listening to
        // a plain phrase: the home chord rings out and Chase sits back (the sequencer ends itself)
      }
      if (ctx) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, ov.canvas.width, ov.canvas.height); }
      if (ov) ov.show(false);
    },
    autoplay(a) {
      if (done || api !== a) return;   // sneak: already finished
      auto = true;
    },
    // pause menu "Skip this mini-game": Chase plays the rest himself (with `continue`), the result reads like a decent take
    skipResult() {
      if (done) return { ok: true, loudness: lastLoud };
      const l = Math.max(0.6, ni ? accNow() * NN / Math.max(1, ni) : 0.6);
      loudness = lastLoud = Math.round(l * 100) / 100; qLevel = loudness;
      const keep = cont && qOn;
      if (keep) { qLeadFrom = Math.min(qLeadFrom, Math.max(0, qK)); if (TEST.auto) qRate = AUTO_RATE; }
      if (!barked) { barked = true; droneGo(); }
      return { ok: true, loudness, level: loudness, dB: Math.round(Math.max(peak, 70)), perfect, good, misses, hits: perfect + good, total: NN,
        droneSpeed: droneSpeed(loudness), continuing: keep, handle: keep ? qHandle : null };
    },
    // the playback API (continue / sneak / content)
    play, stop() { if (qOn) qFinish('stop'); },
    get playing() { return qOn; }, get handle() { return qHandle; }, get loudness() { return lastLoud; },
    droneSpeed, bpm: BPM, bars: BARS, sections: SEC,
    // test hooks: the phrase chart and where a lane's key is on screen (CSS px), for scripted input
    chart: { n: NN, t: NT, lane: NL, midi: NM }, lanePoint(l) { return [hx + (clamp(l | 0, 0, 4) + 0.5) * lw, sy + keyH * 0.5]; },
  };
  return M;
})();
