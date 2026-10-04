// ============================================================ MINI-GAME: POLISH (spec 9.1, scene 1.1)
// The Hero Table glass, top-down, as a painted card on the overlay (Rue's INSERT-card look): smoked glass in a chrome
// frame, four phones in their cradle pucks (screens to the customers: "3%"), and the dirt: fingerprints, a palm smear,
// sleeve swirls, specks, a mug ring and one ghostly forehead print (a face pressed to the glass), all soft alpha.
// A microfibre cloth rubs away whatever it passes over. SHINE % = 1 − remaining smudge mass. At 99 % Chase leans on
// it (a fresh handprint), at 100 % a sparkle sweeps the glass with a bright chime: SPOTLESS. No fail. ~60–90 s.
//
// Controls: mouse / touch: drag on the glass. Keys / pad: hold YES and steer with the arrows / stick. Holding YES (or
// a finger, or the mouse button) still for half a second polishes slowly on its own: the cloth circles and drifts to
// the nearest dirt (spec 9.1 accessibility). options.holdToPress: YES puts the cloth down, YES again (or NO) lifts it.
// Story Mode: the cloth rubs 1.6x as hard.
//
// Call:  ['minigame', 'polish', { shot, lean, flag, anim }]   or   await c.flow.minigame('polish', { … })
//   shot   the camera under the card (re-applied after the lean). Default: an INSERT on anchor 'hero_top' if the set has it.
//   lean   what happens at 99 %:
//            undefined / true  the default beat, if actor 'chase' is on the set: he walks to mark 's11_chase_lean'
//                              (fallback [6.25, 0, -6.2]), leans on the glass (the print lands), LUKA "CHASE." /
//                              CHASE "Sorry.", and he wanders back to where he was
//            [steps]           cutscene steps run with api.play (they may cut the camera; the card fades out first)
//            fn(api, handprint) -> Promise   anything at all
//            false             no lean (Chase isn't there)
//          Inside a custom lean, call MINIGAMES.polish.handprint() (or the handprint argument) the moment his hand
//          lands; if nothing does, the print lands when the lean ends. The 3D prop gets hero_table.userData.handprint(true).
//   flag   a flag set on success (e.g. 's11_polished'); anim: false = don't put actor 'luka' into the crouched polish loop
//          (else his hands land on the glass at glassH m, default 0.95). The default lean walks Chase round the counter
//          ({ collide: true }; if he stalls short he is placed on the mark).
// Result: { spotless: true, shine: 1, leaned, secs }   (+ skipped / auto). Events: emit('polish:lean'), emit('polish:spotless').
// 3D props it drives when the set has them (reddy26 spec 5.1): hero_table.userData.handprint(on) / glint() / set('spotless');
// hero_smudge fades with the shine (its material opacity), so the 3D glass matches the card during the lean.
MINIGAMES.polish = (() => {
  const PI = Math.PI, TAU = PI * 2;
  const AW = 640, AH = 360, GW = 128, GH = 72, CELL = AW / GW, N = GW * GH;   // dirt art (design px) and the rub grid
  const R = 0.062;            // cloth radius, in card widths
  const K = 3.1;              // dirt removed per card-width rubbed, at the cloth's centre (÷ hardness)
  const STEP = 0.02;          // max rub sub-step (card widths): a fast drag never skips cells
  const D = new Float32Array(N), WT = new Float32Array(N), HD = new Float32Array(N), WH = new Float32Array(N);
  const BS = new Float32Array(16 * 9);                                   // 8×8-cell block sums (auto-polish, hints)
  const SP = new Float32Array(48 * 6);                                   // glints: u, v, life, max, size, spin
  const PCT = []; for (let i = 0; i <= 100; i++) PCT.push(i + '%');
  const PHONES = [[0.125, '#2b2e33', '#3d4249'], [0.375, '#c9ccd1', '#9ea3aa'], [0.625, '#2f63c9', '#244c9c'], [0.875, '#efe6d2', '#c9bea6']];
  const SO = { vol: 1, rate: 1 };                                        // reused sfx options (no allocation per call)
  const FONT = '"Trebuchet MS", "Segoe UI", system-ui, sans-serif', MONO = '"Courier New", ui-monospace, Menlo, Consolas, monospace';
  const SHADOW = 'rgba(0,0,0,0.28)', GLINT = '#ffffff', RING = 'rgba(255,255,255,0.75)';

  // canvases: built once per module, repainted per start / layout
  let artC = null, art = null, compC = null, comp = null, maskC = null, mctx = null, maskImg = null, handC = null, hand = null;
  let under = null, uctx = null, over = null, octx = null, cloth = null, clctx = null;
  let api = null, ov = null, ctx = null, P = null, done = true, run = 0, AUTO = false;
  let W = 0, H = 0, sch = '', rot = false, cw = 0, ch = 0, ccx = 0, ccy = 0, mg = 0, fT = 0, dprL = 1;
  let fTitle = '', fBig = '', fSmall = '', fStamp = '', hint = '', hint2 = '', titleY = 0, meterY = 0, mw = 0, mx = 0, hintY = 0;
  let bandG = null, meterG = null, meterHot = null;
  let M0 = 1, M = 0, shine = 0, pct = 0, maskDirty = true, phase = 'off', t = 0, cardA = 1, endT = 0, sweep = -1;
  let cu = 0.5, cv = 0.62, lpx = -1, lpy = -1, still = 0, pressing = false, latched = false, crot = 0.25, act = 0, spin = 0;
  let tu = 0.5, tv = 0.5, scanT = 0, swish = 0, squeakCD = 0, best = 1, stuckT = 0, ringA = 0, handGlow = 0, sparkleN = 0;
  let leanOn = false, leaned = false, handDone = false, luka = null, lukaAnim = false, smudgeMat = null, smudgeOp = 1, smudgeK = -1;
  let baseShot = null;
  const TOP_SHOT = { shot: 'INSERT', at: 'hero_top' };
  let seed = 1;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  let vseed = 7;
  const vrnd = () => (vseed = (vseed * 16807) % 2147483647) / 2147483647;   // visual-only randomness (glints)

  function canvases() {
    if (artC) return;
    const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
    artC = mk(AW, AH); art = artC.getContext('2d', { willReadFrequently: true });
    handC = mk(AW, AH); hand = handC.getContext('2d', { willReadFrequently: true });
    compC = mk(AW, AH); comp = compC.getContext('2d');
    maskC = mk(GW, GH); mctx = maskC.getContext('2d'); maskImg = mctx.createImageData(GW, GH);
    under = mk(4, 4); uctx = under.getContext('2d');
    over = mk(4, 4); octx = over.getContext('2d');
    cloth = mk(4, 4); clctx = cloth.getContext('2d');
  }

  // ---------------------------------------------------------- the dirt (design px on a 640×360 card; white on clear)
  function haze(c, x, y, rx, ry, rot, a, warm) {
    c.save(); c.translate(x, y); c.rotate(rot); c.scale(1, ry / rx);
    const g = c.createRadialGradient(0, 0, 0, 0, 0, rx);
    const col = warm ? '255,238,222' : '255,255,255';
    g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(0.55, `rgba(${col},${a * 0.6})`); g.addColorStop(1, `rgba(${col},0)`);
    c.fillStyle = g; c.beginPath(); c.arc(0, 0, rx, 0, TAU); c.fill(); c.restore();
  }
  function print(c, x, y, rx, ry, rot, a) {             // a fingerprint: a soft oily patch + broken whorl ridges
    haze(c, x, y, rx * 1.15, ry * 1.15, rot, a * 0.32);
    c.save(); c.translate(x, y); c.rotate(rot);
    const n = Math.max(4, Math.round(rx / 2.3)), wx = (rnd() - 0.5) * rx * 0.25, wy = (rnd() - 0.5) * ry * 0.2;
    c.lineCap = 'round';
    for (let k = 1; k <= n; k++) {
      const f = k / n, a0 = rnd() * TAU, sw = TAU * (0.55 + rnd() * 0.4);
      c.lineWidth = 1.1 + rnd() * 0.5; c.strokeStyle = `rgba(255,255,255,${a * (0.45 + rnd() * 0.4) * (1 - f * 0.35)})`;
      c.beginPath(); c.ellipse(wx * (1 - f), wy * (1 - f), rx * f, ry * f, 0, a0, a0 + sw); c.stroke();
      if (rnd() < 0.5) { const a1 = a0 + sw + 0.35; c.beginPath(); c.ellipse(wx * (1 - f), wy * (1 - f), rx * f, ry * f, 0, a1, a1 + 0.5 + rnd()); c.stroke(); }
    }
    c.restore();
  }
  function capsule(c, x0, y0, x1, y1, w, a) {
    c.strokeStyle = `rgba(255,255,255,${a})`; c.lineWidth = w; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
  }
  // a whole hand: palm + four fingers (tips printed) + thumb; rot 0 = fingers pointing up the card
  function handprint(c, x, y, rot, a, s) {
    c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
    haze(c, 0, 12, 25, 29, 0, a * 0.55);
    haze(c, -4, 18, 15, 12, 0.4, a * 0.35);
    c.lineCap = 'round';
    for (let i = 0; i < 9; i++) { c.lineWidth = 1; c.strokeStyle = `rgba(255,255,255,${a * 0.35})`; c.beginPath(); c.arc(-2 + rnd() * 6, 16 + rnd() * 8, 6 + i * 2.2, PI * 1.1 + rnd() * 0.3, PI * 1.9 - rnd() * 0.3); c.stroke(); }
    const F = [[-15, -12, 33, -0.18], [-5, -16, 40, -0.06], [6, -16, 38, 0.05], [16, -11, 29, 0.17]];
    for (const [fx, fy, len, ang] of F) {
      const ex = fx + Math.sin(ang) * len, ey = fy - Math.cos(ang) * len;
      capsule(c, fx, fy, ex + Math.sin(ang) * -6, ey + Math.cos(ang) * 6, 9.5, a * 0.42);
      print(c, ex, ey + 3, 5.2, 7, ang, a * 0.95);
    }
    capsule(c, -21, 10, -36, -4, 10, a * 0.4); print(c, -37, -6, 5.5, 7.5, -0.9, a * 0.9);
    c.restore();
  }
  function stampH(u, v, ru, rv, h) {                    // hardness: greasy prints take more rubbing
    const gx = u * GW, gy = v * GH, rx = ru * GW, ry = rv * GH;
    const i0 = Math.max(0, Math.floor(gx - rx)), i1 = Math.min(GW - 1, Math.ceil(gx + rx));
    const j0 = Math.max(0, Math.floor(gy - ry)), j1 = Math.min(GH - 1, Math.ceil(gy + ry));
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      const dx = (i + 0.5 - gx) / rx, dy = (j + 0.5 - gy) / ry;
      if (dx * dx + dy * dy <= 1) { const k = j * GW + i; if (HD[k] < h) HD[k] = h; }
    }
  }
  function paintDirt() {
    const c = art;
    seed = 4242;
    c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-over'; c.clearRect(0, 0, AW, AH);
    HD.fill(1);
    // the ghostly forehead print: someone pressed their face to the glass to see the phones (forehead, brows, nose)
    const fx = 0.6 * AW, fy = 0.2 * AH;
    haze(c, fx, fy, 66, 27, -0.05, 0.36, true); haze(c, fx, fy - 2, 46, 15, -0.05, 0.22, true);
    for (let i = 0; i < 4; i++) { c.lineWidth = 2.2; c.strokeStyle = 'rgba(255,240,226,0.2)'; c.beginPath(); c.ellipse(fx, fy - 8 + i * 6, 40 - i * 3, 9, -0.05, PI * 1.08, PI * 1.92); c.stroke(); }
    haze(c, fx - 27, fy + 24, 21, 7, 0.12, 0.26, true); haze(c, fx + 25, fy + 23, 21, 7, -0.16, 0.26, true);
    haze(c, fx + 2, fy + 44, 10, 12, 0, 0.42, true); haze(c, fx + 1, fy + 42, 5, 5, 0, 0.3, true);
    stampH(0.6, 0.22, 0.13, 0.2, 2.1);
    // a palm dragged across the left end (the smear trails to the right)
    for (let i = 0; i < 6; i++) haze(c, 96 + i * 13, 92 + i * 4, 30 - i * 2.5, 24 - i * 2, 0.3, 0.2, true);
    for (let i = 0; i < 4; i++) capsule(c, 74 + i * 11, 52 + i * 3, 150 + i * 9, 70 + i * 6, 7, 0.11);
    handprint(c, 92, 92, -0.35, 0.5, 0.95);
    stampH(0.19, 0.24, 0.12, 0.17, 1.5);
    // sleeve swirls (someone "cleaned" it with a dirty sleeve)
    c.lineCap = 'round';
    for (const [x, y, r, a0, a1] of [[300, 300, 64, 3.6, 5.6], [318, 290, 46, 3.3, 5.9], [500, 128, 52, 0.2, 2.2], [210, 148, 38, 4.6, 6.9]]) {
      c.lineWidth = 11; c.strokeStyle = 'rgba(255,255,255,0.1)'; c.beginPath(); c.arc(x, y, r, a0, a1); c.stroke();
      for (let k = -2; k <= 2; k++) { c.lineWidth = 1.2; c.strokeStyle = `rgba(255,255,255,${0.16 + rnd() * 0.12})`; c.beginPath(); c.arc(x, y, r + k * 2.4, a0 + rnd() * 0.3, a1 - rnd() * 0.3); c.stroke(); }
    }
    stampH(0.47, 0.83, 0.12, 0.2, 0.8);
    // fingerprints: one grab along Luka's edge (four fingers + a thumb), singles and pairs elsewhere
    for (let i = 0; i < 4; i++) print(c, 174 + i * 21, 334 - Math.abs(i - 1.5) * 6, 9, 12, -0.15 + i * 0.1, 0.7);
    print(c, 146, 318, 10, 13, -1.0, 0.65);
    const singles = [[44, 300, 0.4], [118, 196, 1.2], [262, 52, 0.2], [392, 50, -0.4], [418, 66, 0.1], [560, 300, -0.7], [604, 216, 0.9], [470, 318, 0.3], [366, 168, -1.1], [246, 278, 0.6]];
    for (const [x, y, r] of singles) print(c, x, y, 8.5 + rnd() * 3, 11.5 + rnd() * 3, r, 0.55 + rnd() * 0.25);
    // specks and a mug ring
    for (let i = 0; i < 26; i++) { c.fillStyle = `rgba(255,255,255,${0.35 + rnd() * 0.35})`; c.beginPath(); c.arc(16 + rnd() * 608, 12 + rnd() * 336, 1 + rnd() * 2.2, 0, TAU); c.fill(); }
    c.lineWidth = 3.2; c.strokeStyle = 'rgba(214,176,128,0.6)'; c.beginPath(); c.arc(582, 64, 21, 0, TAU); c.stroke();
    c.lineWidth = 6; c.strokeStyle = 'rgba(214,176,128,0.32)'; c.beginPath(); c.arc(582, 64, 21, 2.2, 4.1); c.stroke();
    stampH(582 / AW, 64 / AH, 0.045, 0.08, 2.3);
    // nothing under the phones and their pucks
    c.globalCompositeOperation = 'destination-out'; c.fillStyle = '#000';
    for (const p of PHONES) c.fillRect(p[0] * AW - 24, 0.5 * AH - 36, 48, 74);
    c.globalCompositeOperation = 'source-over';
    // Chase's fresh print (lands at 99 %): its own layer until then
    hand.setTransform(1, 0, 0, 1, 0, 0); hand.clearRect(0, 0, AW, AH);
    seed = 99;
    handprint(hand, 0.72 * AW, 0.31 * AH, -0.55, 0.9, 1.05);
  }
  function weigh(c, out) {                                // average alpha per cell (start-time only: one getImageData)
    const px = c.getImageData(0, 0, AW, AH).data;
    out.fill(0);
    for (let y = 0; y < AH; y++) {
      const j = (y / CELL) | 0, row = y * AW * 4;
      for (let x = 0; x < AW; x++) out[j * GW + ((x / CELL) | 0)] += px[row + x * 4 + 3];
    }
    const k = 1 / (255 * CELL * CELL);
    for (let i = 0; i < N; i++) out[i] *= k;
  }

  // ---------------------------------------------------------- layout + the static card layers (repainted on resize)
  function rr(c, x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, r); }
  function paintUnder() {
    const d = dprL, wd = cw + 2 * mg, hd = ch + 2 * mg;
    under.width = Math.ceil(wd * d); under.height = Math.ceil(hd * d);
    const c = uctx;
    c.setTransform(d, 0, 0, d, 0, 0); c.clearRect(0, 0, wd, hd); c.translate(wd / 2, hd / 2);
    const x0 = -cw / 2, y0 = -ch / 2;
    // drop shadow + the chrome trim
    c.save(); c.shadowColor = 'rgba(0,0,0,0.55)'; c.shadowBlur = cw * 0.045; c.shadowOffsetY = cw * 0.016;
    rr(c, x0 - fT, y0 - fT, cw + 2 * fT, ch + 2 * fT, fT * 1.8); c.fillStyle = '#8f98a2'; c.fill(); c.restore();
    let g = c.createLinearGradient(x0 - fT, y0 - fT, x0 + cw * 0.6, y0 + ch + fT);
    g.addColorStop(0, '#f6f8fa'); g.addColorStop(0.22, '#8e97a0'); g.addColorStop(0.48, '#eef1f3'); g.addColorStop(0.74, '#7a838c'); g.addColorStop(1, '#d9dee2');
    rr(c, x0 - fT, y0 - fT, cw + 2 * fT, ch + 2 * fT, fT * 1.8); c.fillStyle = g; c.fill();
    c.lineWidth = Math.max(1, fT * 0.18); c.strokeStyle = 'rgba(40,46,54,0.6)'; rr(c, x0 - fT * 0.25, y0 - fT * 0.25, cw + fT * 0.5, ch + fT * 0.5, fT); c.stroke();
    // the glass: smoked, the white plinth glowing faintly through it, two fluoro tubes and the Yes wall reflected
    c.save(); rr(c, x0, y0, cw, ch, fT * 0.8); c.clip();
    g = c.createLinearGradient(x0, y0, x0 + cw, y0 + ch);
    g.addColorStop(0, '#3b6170'); g.addColorStop(0.45, '#23434f'); g.addColorStop(1, '#13262e');
    c.fillStyle = g; c.fillRect(x0, y0, cw, ch);
    g = c.createRadialGradient(0, 0, ch * 0.1, 0, 0, cw * 0.55);
    g.addColorStop(0, 'rgba(214,232,238,0.16)'); g.addColorStop(1, 'rgba(214,232,238,0)');
    c.fillStyle = g; c.fillRect(x0, y0, cw, ch);
    g = c.createRadialGradient(cw * 0.36, ch * 0.3, 0, cw * 0.36, ch * 0.3, ch * 0.42);
    g.addColorStop(0, 'rgba(255,210,31,0.13)'); g.addColorStop(1, 'rgba(255,210,31,0)');
    c.fillStyle = g; c.fillRect(x0, y0, cw, ch);
    c.save(); c.rotate(-0.12); c.filter = 'blur(' + Math.max(2, ch * 0.022).toFixed(1) + 'px)'; c.fillStyle = 'rgba(232,245,255,0.075)';
    rr(c, -cw * 0.46, -ch * 0.37, cw * 0.7, ch * 0.05, ch * 0.025); c.fill();
    rr(c, -cw * 0.14, ch * 0.25, cw * 0.64, ch * 0.045, ch * 0.022); c.fill();
    c.fillStyle = 'rgba(240,250,255,0.06)'; rr(c, -cw * 0.4, -ch * 0.355, cw * 0.58, ch * 0.016, ch * 0.008); c.fill(); c.restore();
    g = c.createLinearGradient(x0, y0, x0 + cw * 0.3, y0 + ch * 0.45);
    g.addColorStop(0, 'rgba(255,255,255,0.12)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g; c.fillRect(x0, y0, cw, ch);
    // the "Yes" window decal faces the customers, so from Luka's side it reads upside down
    if (typeof canvasTex !== 'undefined' && canvasTex.yes) {
      c.save(); c.translate(x0 + cw * 0.37, y0 + ch * 0.075); c.rotate(PI); c.globalAlpha = 0.38;
      canvasTex.yes(c, -ch * 0.056, -ch * 0.035, ch * 0.07, '#ffd21f'); c.restore();
    }
    g = c.createRadialGradient(0, 0, cw * 0.32, 0, 0, cw * 0.62);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.3)');
    c.fillStyle = g; c.fillRect(x0, y0, cw, ch);
    c.restore();
    c.lineWidth = 1; c.strokeStyle = 'rgba(255,255,255,0.35)'; rr(c, x0 + 0.5, y0 + 0.5, cw - 1, ch - 1, fT * 0.8); c.stroke();
  }
  function paintOver() {                                 // the phones in their pucks, standing on the glass
    const d = dprL;
    over.width = Math.ceil(cw * d); over.height = Math.ceil(ch * d);
    const c = octx;
    c.setTransform(d, 0, 0, d, 0, 0); c.clearRect(0, 0, cw, ch);
    const pw = cw * 0.046, ph = ch * 0.15, y = ch * 0.5;
    for (const [u, body, edge] of PHONES) {
      const x = u * cw;
      // coiled tether down to its grommet
      const gx = x - cw * 0.032, gy = y + ch * 0.2;
      c.strokeStyle = '#0d0f12'; c.lineWidth = Math.max(1.5, cw * 0.0035); c.beginPath();
      for (let i = 0; i <= 28; i++) {
        const k = i / 28, px = x + (gx - x) * k, py = y + ph * 0.4 + (gy - y - ph * 0.4) * k, a = k * TAU * 6;
        const amp = cw * 0.006 * Math.sin(PI * Math.min(1, k * 1.4));
        if (i) c.lineTo(px + Math.cos(a) * amp, py + Math.sin(a) * amp * 0.6); else c.moveTo(px, py);
      }
      c.stroke();
      c.fillStyle = '#06080a'; c.beginPath(); c.ellipse(gx, gy, cw * 0.009, ch * 0.012, 0, 0, TAU); c.fill();
      c.strokeStyle = '#a9b1b9'; c.lineWidth = 1; c.stroke();
      // the puck
      c.save(); c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = cw * 0.012; c.shadowOffsetY = cw * 0.004;
      c.fillStyle = '#111317'; c.beginPath(); c.ellipse(x, y + ph * 0.15, pw * 0.82, ph * 0.62, 0, 0, TAU); c.fill(); c.restore();
      c.strokeStyle = '#3a3f46'; c.lineWidth = 1; c.beginPath(); c.ellipse(x, y + ph * 0.15, pw * 0.82, ph * 0.62, 0, 0, TAU); c.stroke();
      // the phone, tilted back, screen to the customers (up the card): we see its edge and a sliver of screen
      c.save(); c.shadowColor = 'rgba(0,0,0,0.45)'; c.shadowBlur = cw * 0.01; c.shadowOffsetY = cw * 0.006;
      c.fillStyle = edge; rr(c, x - pw / 2, y - ph / 2, pw, ph, pw * 0.2); c.fill(); c.restore();
      c.fillStyle = body; rr(c, x - pw / 2, y - ph / 2, pw, ph * 0.86, pw * 0.2); c.fill();
      c.fillStyle = '#0a1018'; rr(c, x - pw * 0.4, y - ph * 0.43, pw * 0.8, ph * 0.72, pw * 0.12); c.fill();
      const bx = x - pw * 0.17, by = y - ph * 0.22, bw2 = pw * 0.34, bh2 = ph * 0.1;   // a battery, nearly flat
      c.strokeStyle = '#ff5a4e'; c.lineWidth = Math.max(1, pw * 0.04); c.strokeRect(bx, by, bw2, bh2);
      c.fillStyle = '#ff5a4e'; c.fillRect(bx + bw2, by + bh2 * 0.3, Math.max(1, pw * 0.04), bh2 * 0.4); c.fillRect(bx + 1, by + 1, Math.max(1, bw2 * 0.08), bh2 - 2);
      c.font = 'bold ' + Math.max(7, Math.round(pw * 0.36)) + 'px ' + FONT; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('3%', x, y + ph * 0.02);
      c.fillStyle = 'rgba(255,255,255,0.22)'; c.fillRect(x - pw * 0.36, y - ph * 0.47, pw * 0.72, Math.max(1, ph * 0.025));
      c.fillStyle = 'rgba(0,0,0,0.35)'; rr(c, x - pw * 0.12, y + ph * 0.36, pw * 0.24, Math.max(1.5, ph * 0.03), 1); c.fill();
    }
  }
  function paintCloth() {                                // a folded microfibre cloth (Yes yellow), bunched under the hand
    const s = R * cw * 2.5, d = dprL;
    cloth.width = cloth.height = Math.ceil(s * d);
    const c = clctx;
    c.setTransform(d, 0, 0, d, 0, 0); c.clearRect(0, 0, s, s); c.translate(s / 2, s / 2);
    const r = s * 0.36;
    c.fillStyle = '#d6a917'; c.beginPath(); c.moveTo(-r, -r * 0.8); c.quadraticCurveTo(0, -r * 1.12, r * 0.95, -r * 0.88);
    c.quadraticCurveTo(r * 1.15, 0, r, r * 0.9); c.quadraticCurveTo(0, r * 1.1, -r * 0.92, r * 0.94); c.quadraticCurveTo(-r * 1.12, 0, -r, -r * 0.8); c.fill();
    c.fillStyle = '#f7d43a'; c.beginPath(); c.moveTo(-r * 0.9, -r * 0.72); c.quadraticCurveTo(0, -r * 1.0, r * 0.86, -r * 0.8);
    c.quadraticCurveTo(r * 1.0, 0, r * 0.88, r * 0.76); c.lineTo(-r * 0.3, r * 0.1); c.quadraticCurveTo(-r * 1.0, 0, -r * 0.9, -r * 0.72); c.fill();
    c.fillStyle = '#ffe680'; c.beginPath(); c.moveTo(-r * 0.3, r * 0.1); c.lineTo(r * 0.88, r * 0.76); c.quadraticCurveTo(0, r * 0.98, -r * 0.84, r * 0.86); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(150,110,10,0.55)'; c.lineWidth = Math.max(1, r * 0.05);
    c.beginPath(); c.moveTo(-r * 0.3, r * 0.1); c.lineTo(r * 0.88, r * 0.76); c.stroke();
    c.fillStyle = 'rgba(160,120,10,0.18)';
    for (let i = 0; i < 40; i++) { const a = (i * 2.399) % TAU, q = Math.sqrt(i / 40) * r * 0.85; c.fillRect(Math.cos(a) * q, Math.sin(a) * q, 1.2, 1.2); }
    c.strokeStyle = 'rgba(255,255,255,0.5)'; c.lineWidth = Math.max(1, r * 0.04);
    c.beginPath(); c.moveTo(-r * 0.8, -r * 0.7); c.quadraticCurveTo(0, -r * 0.95, r * 0.75, -r * 0.76); c.stroke();
  }
  function layout() {
    W = innerWidth; H = innerHeight; sch = api.input.scheme;
    dprL = ov.canvas.width / W || 1;
    const touch = sch === 'touch', narrow = W < 600;
    rot = H > W * 1.15;
    const top = narrow ? 100 : 112;
    let bot, side;
    if (touch) { if (rot) { bot = 196; side = 14; } else { bot = 14; side = Math.min(196, W * 0.22); } }
    else { bot = narrow ? 24 : 34; side = 24; }
    const aw = W - 2 * side, ah = H - top - bot;
    cw = (rot ? Math.min(ah, aw * 16 / 9) : Math.min(aw, ah * 16 / 9)) * 0.9;
    ch = cw * 9 / 16; fT = cw * 0.024; mg = cw * 0.07;
    ccx = W / 2; ccy = top + ah / 2;
    const k = Math.min(1, W / 900);
    fTitle = 'bold ' + Math.round(narrow ? 16 : 20 * Math.max(0.85, k)) + 'px ' + FONT;
    fBig = 'bold ' + Math.round(narrow ? 15 : 17) + 'px ' + MONO;
    fSmall = Math.round(narrow ? 12 : 13.5) + 'px ' + FONT;
    fStamp = 'bold ' + Math.round(Math.min(cw * 0.11, (rot ? ch : ch) * 0.24)) + 'px ' + FONT;
    titleY = narrow ? 22 : 28; meterY = narrow ? 44 : 52; hintY = narrow ? 82 : 92;
    mw = Math.min(440, W - 48); mx = (W - mw) / 2;
    meterG = ctx.createLinearGradient(mx, 0, mx + mw, 0);
    meterG.addColorStop(0, '#7fb2c8'); meterG.addColorStop(0.7, '#cfefff'); meterG.addColorStop(1, '#ffffff');
    meterHot = ctx.createLinearGradient(mx, 0, mx + mw, 0);
    meterHot.addColorStop(0, '#ffd21f'); meterHot.addColorStop(1, '#fff6c8');
    const bw = cw * 0.16;
    bandG = ctx.createLinearGradient(-bw, 0, bw, 0);
    const ba = options.reduceFlashing ? 0.32 : 0.85;
    bandG.addColorStop(0, 'rgba(255,255,255,0)'); bandG.addColorStop(0.5, `rgba(255,255,255,${ba})`); bandG.addColorStop(1, 'rgba(255,255,255,0)');
    setHint();
    paintUnder(); paintOver(); paintCloth();
  }
  function setHint() {
    const s = api.input.scheme, narrow = W < 600, htp = options.holdToPress === true;
    if (s === 'touch') { hint = 'Drag on the glass to polish.'; hint2 = 'Hold your finger still: it polishes slowly by itself.'; }
    else if (s === 'pad') {
      hint = htp ? 'Press A to put the cloth down · steer with the stick.' : 'Hold A and steer with the stick.';
      hint2 = 'Hold A without moving: it polishes slowly by itself.';
    } else {
      hint = narrow ? 'Hold the mouse button and rub.' : htp ? 'Hold the mouse button and rub · or press YES and steer with the arrows.' : 'Hold the mouse button and rub · or hold YES and steer with the arrows.';
      hint2 = 'Hold YES without moving: it polishes slowly by itself.';
    }
  }

  // ---------------------------------------------------------- the game
  function scan() {                                     // the densest nearby dirt -> tu, tv (no allocation)
    BS.fill(0);
    for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) { const k = j * GW + i; BS[(j >> 3) * 16 + (i >> 3)] += WT[k] * D[k]; }
    let bi = -1, bs = 0;
    for (let b = 0; b < 144; b++) {
      if (BS[b] < 0.02) continue;
      const bu = ((b % 16) + 0.5) / 16, bv = (((b / 16) | 0) + 0.5) / 9, du = bu - cu, dv = (bv - cv) * 0.5625;
      const s = BS[b] / (1 + 14 * (du * du + dv * dv));
      if (s > bs) { bs = s; bi = b; }
    }
    if (bi < 0) return false;
    let su = 0, sv = 0, sw = 0;
    const bx = (bi % 16) * 8, by = ((bi / 16) | 0) * 8;
    for (let j = by; j < by + 8; j++) for (let i = bx; i < bx + 8; i++) { const w = WT[j * GW + i] * D[j * GW + i]; su += (i + 0.5) * w; sv += (j + 0.5) * w; sw += w; }
    if (sw > 0) { tu = su / sw / GW; tv = sv / sw / GH; }
    return true;
  }
  function glint(u, v, size) {
    for (let k = 0; k < SP.length; k += 6) if (SP[k + 2] <= 0) {
      SP[k] = u; SP[k + 1] = v; SP[k + 3] = SP[k + 2] = 0.45 + vrnd() * 0.35; SP[k + 4] = size; SP[k + 5] = vrnd() * PI; return;
    }
  }
  function rub(u, v, d, boost) {                        // one stroke of the cloth at (u, v) travelling d card-widths
    const gx = u * GW, gy = v * GH, r = R * GW, r2 = r * r;
    const i0 = Math.max(0, Math.floor(gx - r)), i1 = Math.min(GW - 1, Math.ceil(gx + r));
    const j0 = Math.max(0, Math.floor(gy - r)), j1 = Math.min(GH - 1, Math.ceil(gy + r));
    let cleared = 0;
    for (let j = j0; j <= j1; j++) {
      const dy = j + 0.5 - gy;
      for (let i = i0; i <= i1; i++) {
        const dx = i + 0.5 - gx, q = (dx * dx + dy * dy) / r2;
        if (q >= 1) continue;
        const k = j * GW + i, w = WT[k], o = D[k];
        if (w <= 0 || o <= 0) continue;
        let n = o - K * d * (1 - q) * boost / HD[k];
        if (n < 0.03) n = 0;
        D[k] = n; M -= (o - n) * w;
        if (n === 0 && w > 0.1) cleared++;
      }
    }
    if (cleared) { maskDirty = true; if (cleared > 2 && sparkleN < 3) { sparkleN++; glint(u + (vrnd() - 0.5) * R, v + (vrnd() - 0.5) * R * 1.6, 0.6 + vrnd() * 0.5); } }
    maskDirty = true;
  }
  function stroke(u0, v0, u1, v1, boost) {              // a cloth path, sub-stepped
    const du = u1 - u0, dv = (v1 - v0) * 0.5625, d = Math.sqrt(du * du + dv * dv);
    if (d <= 0) return 0;
    const n = Math.ceil(d / STEP), dd = Math.min(d, 0.06) / n;   // a flick still only scrubs so much
    for (let s = 1; s <= n; s++) rub(u0 + (u1 - u0) * s / n, v0 + (v1 - v0) * s / n, dd, boost);
    return d;
  }
  function toCard(sx, sy) {                             // screen px -> card (u, v) into tu/tv-like temporaries
    const dx = sx - ccx, dy = sy - ccy;
    if (rot) { PU = dy / cw + 0.5; PV = -dx / ch + 0.5; } else { PU = dx / cw + 0.5; PV = dy / ch + 0.5; }
  }
  let PU = 0, PV = 0;
  const clampU = (u) => (u < -0.03 ? -0.03 : u > 1.03 ? 1.03 : u);
  const clampV = (v) => (v < -0.05 ? -0.05 : v > 1.05 ? 1.05 : v);

  function smudgeFade(force) {                           // the 3D glass follows the card (hero_smudge opacity)
    if (!smudgeMat) return;
    const k = Math.round((1 - shine) * 50);
    if (k === smudgeK && !force) return;
    smudgeK = k; smudgeMat.opacity = smudgeOp * (k / 50);
  }
  function addHand() {
    if (handDone || done) return;
    handDone = true;
    // bake what's left of the old dirt into the art (keep the mass), then lay the new print on top
    if (maskDirty) compose();
    art.globalCompositeOperation = 'copy'; art.drawImage(compC, 0, 0); art.globalCompositeOperation = 'source-over';
    art.drawImage(handC, 0, 0);
    M = 0;
    for (let i = 0; i < N; i++) { const w = WT[i] * D[i]; WT[i] = w + WH[i] * (1 - w); D[i] = 1; M += WT[i]; }
    stampH(0.7, 0.29, 0.1, 0.2, 1.4);
    shine = Math.max(0, 1 - M / M0); maskDirty = true; handGlow = 1.6;
    SO.vol = 0.45; SO.rate = 1.5; api.sfx('thud', SO);
    const ht = api.world.prop('hero_table');
    if (ht && ht.userData.handprint) ht.userData.handprint(true);
    smudgeFade(true);
  }
  function defaultLean() {
    const c = api.world.actor('chase');
    if (!c) return [];
    const spot = api.world.mark('s11_chase_lean') || [6.25, 0, -6.2, -0.4], back = [c.pos.x, c.pos.y, c.pos.z, c.rotY];
    const hasLuka = !!api.world.actor('luka');
    return [
      { shot: 'WIDE', on: hasLuka ? ['luka', 'chase'] : ['chase'] },
      { move: 'chase', to: spot, collide: true },   // round the counter, not through it (a move that stalls ends where it stalls)
      { do: () => { const a = api.world.actor('chase'); if (a && Math.hypot(a.pos.x - spot[0], a.pos.z - spot[2]) > 0.15) a.place(spot); } },
      { act: [['chase', 'push', { dur: 2.4, loop: false }]] },
      { wait: 0.45 },
      { do: () => addHand() },
      { shot: 'TWO', on: hasLuka ? ['luka', 'chase'] : ['chase'] },
      { wait: 0.4 },
      { say: 'luka', text: 'CHASE.', expr: 'determined' },
      { say: 'chase', text: 'Sorry.', expr: 'sheepish' },
      { move: 'chase', to: back, nowait: true },
      { wait: 0.3 },
    ];
  }
  async function lean() {
    const k = run, L = P.lean;
    phase = 'lean'; leaned = true;
    emit('polish:lean');
    try {
      if (typeof L === 'function') await L(api, addHand);
      else await api.play(Array.isArray(L) ? L : defaultLean());
    } catch (e) { console.error('TWO: polish lean', e); }
    if (k !== run || done) return;
    addHand();
    if (baseShot) api.cam.shot(baseShot);
    phase = 'leanIn';
  }
  function spotless() {
    phase = 'spotless'; sweep = 0; endT = 0;
    D.fill(0); M = 0; shine = 1; pct = 100; maskDirty = true;
    SO.vol = 0.9; SO.rate = 1.12; api.sfx('chime_ready', SO);
    const ht = api.world.prop('hero_table');
    if (ht) { if (ht.userData.handprint) ht.userData.handprint(false); if (ht.userData.glint) ht.userData.glint(); if (ht.userData.set) ht.userData.set('spotless'); }
    smudgeFade(true);
    emit('polish:spotless');
  }
  function fin(extra) {
    if (done) return;
    if (P.flag) { state.flags[P.flag] = true; emit('flag:set', { name: P.flag, value: true }); }
    const r = { spotless: true, shine: 1, leaned, secs: Math.round(t) };
    if (extra) Object.assign(r, extra);
    api.finish(r);
  }

  function compose() {                                  // the dirt layer = art × the rub mask (smoothly upscaled)
    const a = maskImg.data;
    for (let i = 0, j = 3; i < N; i++, j += 4) { a[j - 3] = a[j - 2] = a[j - 1] = 255; a[j] = D[i] * 255; }
    mctx.putImageData(maskImg, 0, 0);
    comp.globalCompositeOperation = 'copy'; comp.drawImage(artC, 0, 0);
    comp.globalCompositeOperation = 'destination-in'; comp.imageSmoothingEnabled = true; comp.drawImage(maskC, 0, 0, AW, AH);
    comp.globalCompositeOperation = 'source-over';
    maskDirty = false;
  }

  function input(dt) {
    const I = api.input, Pt = I.pointer;
    let pu = cu, pv = cv;
    if (Pt.x !== lpx || Pt.y !== lpy || Pt.pressed) {     // the mouse / a finger moved: the cloth goes there
      if (lpx >= 0 || Pt.pressed) { toCard(Pt.x, Pt.y); cu = clampU(PU); cv = clampV(PV); }
      if (Pt.pressed) { pu = cu; pv = cv; }                // a new touch lands there: no streak from the old spot
      lpx = Pt.x; lpy = Pt.y;
    }
    const m = I.move;
    if (m.x || m.y) {                                     // keys / stick: steer in screen space
      const sp = 0.62 * dt * (I.run ? 1.6 : 1), sx = m.x * sp, sy = -m.y * sp;
      if (rot) { cu = clampU(cu + sy); cv = clampV(cv - sx * cw / ch); }
      else { cu = clampU(cu + sx); cv = clampV(cv + sy * cw / ch); }
    }
    if (options.holdToPress === true && I.pressed('yes') && !Pt.pressed) latched = !latched;
    if (I.pressed('no')) latched = false;
    I.consume('yes');
    pressing = Pt.down || I.held('yes') || latched;
    const moved = Math.abs(cu - pu) + Math.abs(cv - pv);
    if (!pressing) { still = 0; return; }
    const boost = options.storyMode === true ? 1.6 : 1;   
    if (moved > 0.0004) { still = 0; const d = stroke(pu, pv, cu, cv, boost); swish += d; act = Math.min(1, act + d * 8); return; }
    // held still: polish slowly on its own, circling and drifting to the nearest dirt
    still += dt;
    if (still < 0.5) return;
    if ((scanT -= dt) <= 0) { scanT = 0.4; if (!scan()) { tu = cu; tv = cv; } }
    spin += dt * TAU * 1.4;
    const du = tu - cu, dv = tv - cv, dl = Math.sqrt(du * du + dv * dv), gs = 0.12 * dt;
    const nu = clampU(cu + (dl > gs ? du / dl * gs : du) + Math.cos(spin) * 0.024 * dt * TAU * 1.4);
    const nv = clampV(cv + (dl > gs ? dv / dl * gs : dv) + Math.sin(spin) * 0.024 * dt * TAU * 1.4 * cw / ch);
    const d = stroke(cu, cv, nu, nv, boost);
    cu = nu; cv = nv; swish += d * 0.5; act = Math.min(1, act + d * 6);
  }
  function autoInput(dt) {                              // ?autoplay=1: scrub the densest dirt, zig-zagging, briskly
    if (t < 0.9) { pressing = false; return; }           // (a look at the dirty glass first)
    if ((scanT -= dt) <= 0) { scanT = 0.15; if (!scan()) { tu = 0.5; tv = 0.5; } }
    spin += dt * 9;
    const du = tu - cu, dv = tv - cv, dl = Math.sqrt(du * du + dv * dv), gs = 1.1 * dt;
    const nu = clampU(cu + (dl > gs ? du / dl * gs : du) + Math.cos(spin) * 0.06 * dt * 9);
    const nv = clampV(cv + (dl > gs ? dv / dl * gs : dv) + Math.sin(spin * 1.3) * 0.08 * dt * 9);
    pressing = true;
    const d = stroke(cu, cv, nu, nv, 2.2);
    cu = nu; cv = nv; swish += d; act = Math.min(1, act + d * 8);
  }

  return {
    handprint: () => addHand(),                          // for a custom lean's step list: { do: () => MINIGAMES.polish.handprint() }
    start(params, a) {
      canvases();
      api = a; ov = a.overlay; ctx = ov.ctx; P = params || {};
      run++; done = false; AUTO = false; phase = 'play'; t = 0; cardA = 0; sweep = -1; endT = 0;
      W = H = 0; sch = ''; lpx = lpy = -1; still = 0; pressing = false; latched = false; act = 0; spin = 0; swish = 0; squeakCD = 0;
      cu = 0.5; cv = 0.66; tu = cu; tv = cv; scanT = 0; stuckT = 0; ringA = 0; handGlow = 0; sparkleN = 0; vseed = 7;
      leaned = false; handDone = false;
      for (let k = 0; k < SP.length; k += 6) SP[k + 2] = 0;
      paintDirt();
      weigh(art, WT); weigh(hand, WH);
      D.fill(1); M0 = 0; let mh = 0; for (let i = 0; i < N; i++) { M0 += WT[i]; mh += WH[i]; }
      if (mh > M0 * 0.06) { const k = M0 * 0.06 / mh; for (let i = 0; i < N; i++) WH[i] *= k; }   // his print knocks ~6 % off
      M = M0; shine = 0; pct = 0; best = M; maskDirty = true;
      const w = a.world, chase = w.actor('chase');
      leanOn = P.lean !== false && (typeof P.lean === 'function' || Array.isArray(P.lean) || !!chase);
      // the 3D side: the shot, Luka crouched over the glass, the smudge decal tracking the card
      baseShot = P.shot || (w.anchor('hero_top') ? TOP_SHOT : null);
      if (baseShot) a.cam.shot(baseShot);
      luka = P.anim === false ? null : w.actor('luka'); lukaAnim = false;
      if (luka) { luka.play('polish', { low: true, h: P.glassH ?? 0.95 }); lukaAnim = true; }   // crouched, hands on the glass (glassH m, the Hero Table's 0.95)
      smudgeMat = null; smudgeK = -1;
      const hs = w.prop('hero_smudge');
      if (hs) hs.traverse((o) => { if (!smudgeMat && o.material && !Array.isArray(o.material) && o.material.transparent) smudgeMat = o.material; });
      if (smudgeMat) smudgeOp = smudgeMat.opacity;   // (only a decal that is already transparent: flipping it would recompile a shader)
      ov.show(true);
    },
    update(dt) {
      if (done || !api) return;
      if (W !== innerWidth || H !== innerHeight || (api.input.scheme === 'touch') !== (sch === 'touch') || ov.canvas.width / innerWidth !== dprL) layout();
      else if (api.input.scheme !== sch) { sch = api.input.scheme; setHint(); }
      t += dt;
      for (let k = 0; k < SP.length; k += 6) if (SP[k + 2] > 0) SP[k + 2] -= dt;
      if (handGlow > 0) handGlow -= dt;
      if (phase === 'leanOut') { cardA -= dt / 0.35; if (cardA <= 0) { cardA = 0; lean(); } return; }
      if (phase === 'lean') return;
      if (phase === 'leanIn') { cardA += dt / 0.4; if (cardA >= 1) { cardA = 1; phase = 'play'; } return; }
      if (phase === 'spotless') {
        endT += dt; sweep = endT / (options.reduceFlashing ? 1.1 : 0.7);
        if (endT > 0.15 && endT < 1.2 && vrnd() < dt * 14) glint(vrnd(), vrnd(), 0.8 + vrnd() * 0.8);
        if (endT >= 2.4) fin();
        return;
      }
      if (cardA < 1) cardA = Math.min(1, cardA + dt / 0.3);
      // play
      const m0 = M;
      sparkleN = 0;
      if (AUTO) autoInput(dt); else input(dt);
      act = Math.max(0, act - dt * 2.5);
      shine = Math.max(0, Math.min(1, 1 - M / M0));
      pct = shine >= 0.994 ? 100 : Math.min(99, Math.floor(shine * 100));
      smudgeFade(false);
      // feedback: a swish per stretch of rubbing, a squeak when a patch comes up clean
      if (swish > 0.35) { swish = 0; SO.vol = 0.1; SO.rate = 1.6 + vrnd() * 0.5; api.sfx('whoosh', SO); }
      if (squeakCD > 0) squeakCD -= dt;
      if (sparkleN > 0 && squeakCD <= 0) { squeakCD = 0.32; SO.vol = 0.07; SO.rate = 1.9 + vrnd() * 0.5; api.sfx('whistle', SO); }
      // stuck near the end: the dirtiest spot glints (and the auto-polish already knows where it is)
      if (M < best - M0 * 0.001) { best = M; stuckT = 0; } else stuckT += dt;
      if (shine > 0.85 && stuckT > 4) { if ((scanT -= dt) <= 0 && still < 0.5) { scanT = 0.5; scan(); } ringA = Math.min(1, ringA + dt * 2); }
      else ringA = Math.max(0, ringA - dt * 3);
      if (leanOn && !leaned && shine >= 0.99) { phase = 'leanOut'; return; }
      if (pct >= 100) spotless();
      if (m0 !== M) maskDirty = true;
    },
    draw() {
      if (done || !ctx || !W) return;
      const s = ov.canvas.width / W;
      ctx.setTransform(s, 0, 0, s, 0, 0); ctx.clearRect(0, 0, W, H);
      const a = cardA;
      if (a <= 0.001) return;
      ctx.globalAlpha = a;
      ctx.fillStyle = 'rgba(5,8,16,0.5)'; ctx.fillRect(0, 0, W, H);
      // ---- the card
      ctx.save();
      ctx.translate(ccx, ccy + (1 - a) * 30);
      if (rot) ctx.rotate(PI / 2);
      ctx.drawImage(under, -cw / 2 - mg, -ch / 2 - mg, cw + 2 * mg, ch + 2 * mg);
      if (maskDirty) compose();
      ctx.save();
      ctx.beginPath(); ctx.rect(-cw / 2, -ch / 2, cw, ch); ctx.clip();
      ctx.globalAlpha = a * 0.92; ctx.imageSmoothingEnabled = true;
      ctx.drawImage(compC, -cw / 2, -ch / 2, cw, ch);
      ctx.globalAlpha = a;
      if (handGlow > 0 && handDone) {                     // the new print, pointed out
        ctx.globalAlpha = a * 0.8 * Math.min(1, handGlow) * (0.5 + 0.5 * Math.sin(t * 9));
        ctx.strokeStyle = '#ffd21f'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse((0.72 - 0.5) * cw, (0.31 - 0.5) * ch, cw * 0.075, ch * 0.2, -0.55, 0, TAU); ctx.stroke();
        ctx.globalAlpha = a;
      }
      if (ringA > 0.01 && phase === 'play') {              // "there's still a bit there"
        const k = ringA * (0.45 + 0.4 * Math.sin(t * 5));
        ctx.globalAlpha = a * k; ctx.strokeStyle = RING; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc((tu - 0.5) * cw, (tv - 0.5) * ch, cw * (0.045 + 0.01 * Math.sin(t * 5)), 0, TAU); ctx.stroke();
        ctx.globalAlpha = a;
      }
      if (sweep >= 0 && sweep <= 1.4) {                  // SPOTLESS: a sparkle band sweeps the glass
        ctx.save(); ctx.translate(-cw * 0.7 + sweep * cw * 1.4 / 1.0, 0); ctx.transform(1, 0, -0.55, 1, 0, 0);
        ctx.fillStyle = bandG; ctx.fillRect(-cw * 0.16, -ch, cw * 0.32, ch * 2); ctx.restore();
      }
      ctx.restore();
      ctx.drawImage(over, -cw / 2, -ch / 2, cw, ch);
      // glints
      ctx.fillStyle = GLINT;
      for (let k = 0; k < SP.length; k += 6) {
        const life = SP[k + 2];
        if (life <= 0) continue;
        const f = life / SP[k + 3], z = SP[k + 4] * cw * 0.03 * Math.sin(PI * f), x = (SP[k] - 0.5) * cw, y = (SP[k + 1] - 0.5) * ch;
        ctx.globalAlpha = a * Math.min(1, f * 2.2);
        ctx.save(); ctx.translate(x, y); ctx.rotate(SP[k + 5] + (1 - f) * 0.8);
        ctx.beginPath(); ctx.moveTo(0, -z); ctx.lineTo(z * 0.16, -z * 0.16); ctx.lineTo(z, 0); ctx.lineTo(z * 0.16, z * 0.16);
        ctx.lineTo(0, z); ctx.lineTo(-z * 0.16, z * 0.16); ctx.lineTo(-z, 0); ctx.lineTo(-z * 0.16, -z * 0.16); ctx.closePath(); ctx.fill();
        ctx.restore();
      }
      ctx.globalAlpha = a;
      // the cloth (lifted: bigger and further off its shadow; down: it scrubs and twists)
      if (phase === 'play' || phase === 'leanOut') {
        const x = (cu - 0.5) * cw, y = (cv - 0.5) * ch, cs = R * cw * 2.5 * (pressing ? 1 : 1.07), off = pressing ? cw * 0.004 : cw * 0.014;
        const want = 0.25 + Math.sin(t * 16) * 0.16 * act + (still >= 0.5 && pressing ? spin * 0.15 : 0);
        crot += (want - crot) * 0.25;
        ctx.fillStyle = SHADOW; ctx.beginPath(); ctx.ellipse(x + off, y + off * 1.3, cs * 0.36, cs * 0.33, 0, 0, TAU); ctx.fill();
        ctx.save(); ctx.translate(x - (pressing ? 0 : off * 0.5), y - (pressing ? 0 : off)); ctx.rotate(crot);
        ctx.drawImage(cloth, -cs / 2, -cs / 2, cs, cs); ctx.restore();
      }
      ctx.restore();
      // ---- screen-space: title, the SHINE meter, the hint, SPOTLESS
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center'; ctx.font = fTitle; ctx.fillStyle = '#ffd21f';
      ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 4;
      ctx.fillText('POLISH THE HERO TABLE', W / 2, titleY);
      ctx.shadowBlur = 0;
      const by = meterY + 10, bh = 12;
      ctx.font = fSmall; ctx.textAlign = 'left'; ctx.fillStyle = '#c4cbe0'; ctx.fillText('SHINE', mx, meterY - 2);
      ctx.font = fBig; ctx.textAlign = 'right'; ctx.fillStyle = pct >= 99 ? '#ffd21f' : '#ffffff'; ctx.fillText(PCT[pct], mx + mw, meterY - 3);
      ctx.fillStyle = 'rgba(10,14,30,0.75)'; rr(ctx, mx - 3, by - 3, mw + 6, bh + 6, (bh + 6) / 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.1)'; rr(ctx, mx, by, mw, bh, bh / 2); ctx.fill();
      const fw = Math.max(bh, mw * shine);
      ctx.fillStyle = pct >= 99 ? meterHot : meterG; rr(ctx, mx, by, fw, bh, bh / 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fillRect(mx + bh / 2, by + 2, Math.max(0, fw - bh), 2);
      if (phase === 'play' || phase === 'leanOut') {
        ctx.font = fSmall; ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(232,236,245,0.9)';
        ctx.fillText(hint, W / 2, hintY);
        if (t > 6 && still < 0.5) { ctx.fillStyle = 'rgba(151,162,194,0.9)'; ctx.fillText(hint2, W / 2, hintY + 19); }
      }
      if (phase === 'spotless' && endT > 0.35) {
        const k = Math.min(1, (endT - 0.35) / 0.25), sc = 1.5 - 0.5 * (k * k * (3 - 2 * k));
        ctx.save(); ctx.translate(ccx, ccy); ctx.scale(sc, sc); ctx.rotate(-0.06);
        ctx.globalAlpha = a * k; ctx.font = fStamp; ctx.textAlign = 'center';
        ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(4, cw * 0.012); ctx.strokeStyle = '#141d3a'; ctx.strokeText('SPOTLESS', 0, 0);
        ctx.fillStyle = '#ffffff'; ctx.fillText('SPOTLESS', 0, 0);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    },
    end(r) {
      done = true; run++; phase = 'off';
      if (luka && lukaAnim) { luka.p.low = false; luka.play('idle'); }
      luka = null; lukaAnim = false;
      const ok = r && (r.spotless || r.skipped);
      if (ok && r.skipped && api) {                      // skipped: leave the table exactly as a win would
        const ht = api.world.prop('hero_table');
        if (ht && ht.userData.set) { if (ht.userData.handprint) ht.userData.handprint(false); ht.userData.set('spotless'); }
        if (P && P.flag) { state.flags[P.flag] = true; emit('flag:set', { name: P.flag, value: true }); }
      }
      if (smudgeMat) smudgeMat.opacity = smudgeOp;          // the set's own state ('spotless' hides the decal) takes over
      smudgeMat = null;
      if (ctx) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, ov.canvas.width, ov.canvas.height); ctx.globalAlpha = 1; }
      if (ov) ov.show(false);
    },
    skipResult: () => ({ spotless: true, shine: 1, leaned }),
    // ?autoplay=1: scrub it clean for real (the lean plays its lines); &fast=1: straight to the end state
    autoplay(a) {
      if (done || api !== a) return;
      if (TEST.fast) {
        const ht = a.world.prop('hero_table');
        if (ht && ht.userData.set) { if (ht.userData.handprint) ht.userData.handprint(false); ht.userData.set('spotless'); }
        leaned = leanOn; fin({ auto: true });
        return;
      }
      AUTO = true;
    },
  };
})();
