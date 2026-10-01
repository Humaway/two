// ============================================================ MINI-GAME: Wiring (spec 9.3) — 1.3 halves, L21 kettle cord
// Rue's Wiring (ref/rue/14:173-439) reskinned as a pairing puzzle, top-down on an open junction box, drawn on the
// overlay canvas. Left: the wires (2026 colours, printed on the socket block); right: the Remote's 2040 adapter
// (“teal-ish”, “warm grey”, “Yes yellow”, “the other blue”). Drag a wire's plug onto a terminal: the right one clicks in;
// a wrong one sparks harmlessly, the plug springs home and Chase (2040) reads out a hint (a bark: play never pauses).
//
// params  half: 1 | 2       1.3: the first two wires / the last two (the first two are already in). Omitted: all four.
//         variant: 'kettle' L21: the brick phone's 1987 line onto the port adapter, three wires plus the kettle cord
//                           that "doesn't go anywhere" (it goes to the kettle).
//         shot              a cam.shot step applied at start (Rue's pattern: right even if the cutscene was skipped).
//         lines: { kettle } optional cutscene steps played (api.play) the moment the kettle cord goes into the kettle.
// result  { ok: true, variant: 'remote' | 'kettle', half: 1 | 2 | 0, wrong: n, connected: n }
//         skipped (pause menu, after two failures): { skipped: true, ok: true, variant, half }
// fails   api.fail() on every third wrong pair (the host offers "Skip this?" after two).
// input   Mouse / touch: drag a plug onto a terminal, or tap the plug, then the terminal. Keys / pad: up/down choose a
//         wire, YES lifts it, up/down choose a terminal, YES plugs it in, NO puts it back. Nothing is held.
// autoplay  plays it: one wrong pair first (so the hint barks), then every wire to its terminal, ~0.6 s each.
// No per-frame allocation: positions live in typed arrays, strings and fonts are built on layout / on change.
(() => {
  const C26 = { blue: '#2f74e6', green: '#2fae55', white: '#f4f3ee', red: '#e2412f', cord: '#ece7da' };
  const C40 = { teal: '#36b9ae', grey: '#aaa093', yes: '#ffd21f', other: '#5b8ef0', kettle: '#c9d2dc' };
  const LAY = {
    remote: {
      title: 'WIRE THE REMOTE', left: '2026 SOCKET', right: 'REMOTE · 2040',
      wires: [['blue', 'BLUE'], ['green', 'GREEN'], ['white', 'WHITE'], ['red', 'RED']],
      terms: [['grey', 'warm grey'], ['teal', 'teal-ish'], ['yes', 'Yes yellow'], ['other', 'the other blue']],
      pair: [1, 3, 0, 2],                       // blue -> teal-ish, green -> the other blue, white -> warm grey, red -> Yes yellow
      demo: [[1, 1], [2, 2]],                   // autoplay's wrong pair per half: green -> teal-ish ("Teal's sort of blue now")
    },
    kettle: {
      title: 'MAKE IT FIT', left: 'JARVIS — 1987 — DO NOT UNPLUG', right: 'PORT · 2040',
      wires: [['blue', 'BLUE'], ['white', 'WHITE'], ['red', 'RED'], ['cord', 'KETTLE CORD']],
      terms: [['teal', 'teal-ish'], ['yes', 'Yes yellow'], ['grey', 'warm grey'], ['kettle', 'the kettle']],
      pair: [0, 2, 1, 3],
      demo: [[3, 0]],                           // the kettle cord into teal-ish: "That one doesn't go anywhere."
    },
  };
  // Chase (2040) reads the 2040 colours out loud: [first time, after that], keyed by the terminal tried
  // (or 'cord' for the kettle cord into a real terminal).
  const HINT = {
    teal: ["Teal's sort of blue now. Don't ask.", 'Teal-ish. The blue one.'],
    grey: ['Warm grey is white. ^ White was too harsh.', 'Warm grey. The white one.'],
    yes: ['Yes yellow is red. ^ Red was too alarming.', 'Yes yellow. The red one.'],
    other: ['The other blue is green. ^ Green tested badly.', 'The other blue. The green one.'],
    kettle: ["That's the kettle.", 'Still the kettle.'],
    cord: ["That one doesn't go anywhere.", 'It goes to the kettle.'],
  };
  const FONT = '"Trebuchet MS", "Segoe UI", system-ui, sans-serif';
  const HAND = '"Segoe Print", "Bradley Hand", "Marker Felt", "Comic Sans MS", cursive';
  const N = 4, TAU = Math.PI * 2;
  const SX = new Float32Array(N), SY = new Float32Array(N);       // screw (wire origin), screen px
  const RX = new Float32Array(N), RY = new Float32Array(N);       // plug rest
  const TX = new Float32Array(N), TY = new Float32Array(N);       // terminal centre
  const PX = new Float32Array(N), PY = new Float32Array(N);       // plug now
  const FL = new Float32Array(N);                                 // terminal spark flash timer
  const OK = [false, false, false, false], ACT = [false, false, false, false], OCC = [-1, -1, -1, -1];
  const SEEN = {};                                                // hint key -> times barked
  const SPK = new Float32Array(32 * 5);                           // sparks: x, y, vx, vy, life
  const STEAM = new Float32Array(12 * 4);                         // kettle steam puffs: x, y, r, life
  const TL1 = ['', '', '', ''], TL2 = ['', '', '', ''];           // terminal labels, one or two lines
  const DASH = [4, 5], NODASH = [];
  let api, ov, ctx, P, L, variant = 'remote', half = 0, run = 0, done = true, auto = false;
  let W = 0, H = 0, sch = '', tall = false, sc = 1, k = 1, ox = 0, oy = 0, BW = 800, BH = 480, hx = 0, hy = 0, hAlign = 'center';
  let LB0 = 0, LB1 = 0, LB2 = 0, LB3 = 0, RB0 = 0, RB1 = 0, RB2 = 0, RB3 = 0, kx = 0, ky = 0, ks = 1;   // blocks (screen), kettle
  let fBig = '', fMid = '', fSmall = '', fLab = '', fTerm = '', fHand = '', fTiny = '';
  let gTray = null, gBlock = null;
  let sel = -1, how = '', gox = 0, goy = 0, gpx = 0, gpy = 0, fl = 0, fr = 0, keys = false, lpx = -1, lpy = -1, hov = -1, hovT = -1;
  let need = 0, conn = 0, wrong = 0, endT = -1, zx = 0, zy = 0, zt = 0, boil = 0, t = 0;
  let status = '', hint = '', apK = 0, apT = 0, plan = null;
  // where the pointer went down: on a slow frame a whole flick (down, move, up) can land inside one tick
  let dnX = 0, dnY = 0;
  const onDown = (e) => { dnX = e.clientX; dnY = e.clientY; };

  const mx = (x) => ox + x * sc, my = (y) => oy + y * sc;
  function rr(x0, y0, x1, y1, r) { ctx.beginPath(); ctx.roundRect(x0, y0, x1 - x0, y1 - y0, r); }

  // ---------------------------------------------------------- layout (on resize / touch <-> not touch)
  function layout() {
    const touch = sch === 'touch';
    tall = H > W * 1.1 && W < 760;
    BW = tall ? 480 : 800; BH = tall ? 640 : 480;
    // header on top. Desktop keeps a band at the bottom for Chase (2040)'s bark box; portrait phones have the bark at
    // the top (31-ui), so the board starts below it; landscape touch screens put the board between the stick (left)
    // and the YES/NO buttons (right), full height.
    const short = H < 500;
    let top = 86, bottom = H < 560 ? 120 : 198, left = 16, right = 16;
    if (tall) { top = 268; bottom = touch ? 200 : 16; left = right = 8; }
    else if (touch) { left = 186; right = 236; top = short ? 60 : 86; bottom = short ? 8 : 196; }
    const aw = Math.max(160, W - left - right), ah = Math.max(120, H - top - bottom);
    sc = Math.min(aw / BW, ah / BH); k = Math.max(0.75, Math.min(1.35, sc));
    ox = left + (aw - BW * sc) / 2; oy = top + (ah - BH * sc) / 2;
    hx = tall ? 14 : ox + BW * sc / 2; hAlign = tall ? 'left' : 'center'; hy = short ? 18 : 22;
    const kettle = variant === 'kettle';
    // design units: blocks, the screws/rest/terminal columns and the four rows
    let lb, rb, scrX, restX, sockX, row0, rowD;
    if (tall) { lb = [12, 44, 150, 600]; rb = [318, 44, 468, 600]; scrX = 126; restX = 186; sockX = 344; row0 = 112; rowD = 140; }
    else { lb = [24, 40, 196, 440]; rb = [586, 34, 776, 446]; scrX = 168; restX = 248; sockX = 614; row0 = 90; rowD = 100; }
    if (kettle) rb[3] = row0 + rowD * 2 + (tall ? 64 : 52);
    LB0 = mx(lb[0]); LB1 = my(lb[1]); LB2 = mx(lb[2]); LB3 = my(lb[3]);
    RB0 = mx(rb[0]); RB1 = my(rb[1]); RB2 = mx(rb[2]); RB3 = my(rb[3]);
    for (let i = 0; i < N; i++) {
      const y = my(row0 + rowD * i);
      SX[i] = mx(scrX); SY[i] = y; RX[i] = mx(restX); RY[i] = y; TX[i] = mx(sockX); TY[i] = y;
    }
    ks = Math.max(0.5, Math.min(1.35, sc));
    if (kettle) { SX[3] = mx(lb[2] - 8); SY[3] = my(lb[3] - 22); kx = TX[3] + 34 * ks; ky = TY[3]; }
    // fonts
    const f = Math.max(0.85, Math.min(1.2, sc));
    fBig = 'bold ' + Math.round(19 * f) + 'px ' + FONT; fMid = Math.round(14 * f) + 'px ' + FONT; fSmall = Math.round(12.5 * f) + 'px ' + FONT;
    fLab = 'bold ' + Math.max(10, Math.round(12 * sc)) + 'px ' + FONT; fTerm = Math.max(11, Math.round(15 * sc)) + 'px ' + FONT;
    fHand = 'bold ' + Math.max(10, Math.round(13 * sc)) + 'px ' + HAND; fTiny = 'bold ' + Math.max(9, Math.round(10.5 * sc)) + 'px ' + FONT;
    // terminal labels: one line, or two when the column is narrow (portrait)
    ctx.font = fTerm;
    const room = tall ? (rb[2] - sockX - 26) * sc : 1e9;
    for (let i = 0; i < N; i++) {
      const s = L.terms[i][1], sp = s.lastIndexOf(' ');
      if (ctx.measureText(s).width > room && sp > 0) { TL1[i] = s.slice(0, sp); TL2[i] = s.slice(sp + 1); } else { TL1[i] = s; TL2[i] = ''; }
    }
    gTray = ctx.createLinearGradient(ox, oy, ox + BW * sc, oy + BH * sc);
    gTray.addColorStop(0, '#c8c1af'); gTray.addColorStop(1, '#aaa290');
    gBlock = ctx.createLinearGradient(0, RB1, 0, RB3);
    gBlock.addColorStop(0, '#fbfdff'); gBlock.addColorStop(1, '#e4edf6');
    // drop any lift; plugs to where they belong
    sel = -1; how = '';
    for (let i = 0; i < N; i++) { const c = OK[i]; PX[i] = c ? plugInX(i) : RX[i]; PY[i] = c ? TY[L.pair[i]] : RY[i]; }
    setStatus();
  }
  const plugInX = (i) => TX[L.pair[i]] - 19 * k;

  function setStatus() {
    const pre = half === 1 ? 'First two wires · ' : half === 2 ? 'Last two wires · ' : '';
    status = endT >= 0 ? (half === 1 ? 'Two in. Two to go.' : 'All connected.') : pre + conn + ' / ' + need + ' connected' + (wrong ? '   ·   sparks ' + wrong : '');
    const s = api.input.scheme, nar = W < 640;
    hint = H < 500 && !tall ? '' : s === 'touch' ? (nar ? 'Drag a wire to its terminal (or tap, then tap).' : 'Drag a wire onto its terminal, or tap the wire, then the terminal.')
      : s === 'pad' ? 'Stick: choose  ·  A: lift / plug in  ·  B: put back'
      : nar ? 'Drag a wire to its terminal.' : 'Drag a wire onto its terminal.   Keys: ↑↓ choose · YES lift / plug in · NO put back';
  }

  // ---------------------------------------------------------- rules
  function freePlug(from, d) { // next active, unconnected plug from `from` in direction d (or -1)
    for (let n = 0; n < N; n++) { const i = ((from + d * (n + (d ? 1 : 0))) % N + N) % N; if (ACT[i] && !OK[i]) return i; }
    return -1;
  }
  function freeTerm(from, d) {
    for (let n = 0; n < N; n++) { const r = ((from + d * (n + (d ? 1 : 0))) % N + N) % N; if (OCC[r] < 0) return r; }
    return -1;
  }
  function plugAt(x, y, rad) {
    let best = -1, bd = rad;
    for (let i = 0; i < N; i++) if (ACT[i] && !OK[i]) { const d = Math.hypot(PX[i] - x, PY[i] - y); if (d < bd) { bd = d; best = i; } }
    return best;
  }
  function termAt(x, y, rad) {
    let best = -1, bd = rad;
    for (let r = 0; r < N; r++) { const d = Math.hypot(TX[r] - x, TY[r] - y); if (d < bd) { bd = d; best = r; } }
    return best;
  }
  function release(x, y, px, py) { // a dragged plug let go at (x, y)
    const r = termAt(x, y, 40 * k);
    if (r >= 0) tryConnect(sel, r);
    else if (Math.hypot(px - gpx, py - gpy) < 10) how = 'tap';   // a tap: keep it lifted, tap a terminal next
    else drop();
  }
  function lift(i, h) { sel = i; how = h; fl = i; api.sfx('clunk', { vol: 0.35 }); }
  function drop() { sel = -1; how = ''; }

  function tryConnect(i, r) {
    if (r < 0 || OCC[r] >= 0) { drop(); return; }
    const w = L.wires[i][0], term = L.terms[r][0];
    if (L.pair[i] === r) {
      OK[i] = true; OCC[r] = i; conn++; drop();
      testLog('wiring connect ' + w + ' -> ' + term);
      api.sfx('clunk', { vol: 0.5 }); api.sfx('pop');
      if (term === 'kettle') {
        boil = 1; api.sfx('kettle_click'); api.sfx('steam', { vol: 0.6 });
        if (P.lines && P.lines.kettle) api.play(P.lines.kettle);
      }
      if (conn >= need) { endT = 0.9; if (half !== 1) api.sfx('line_click'); }
      fl = Math.max(0, freePlug(i, 1));
      setStatus();
      return;
    }
    // wrong: a harmless spark at the terminal, the plug springs home, Chase (2040) reads the colour out
    wrong++; drop();
    testLog('wiring wrong ' + w + ' -> ' + term);
    spark(TX[r], TY[r]); FL[r] = 0.6;
    api.sfx('spark'); api.sfx('zap', { vol: 0.25 });
    const key = w === 'cord' ? 'cord' : term;
    const n = SEEN[key] || 0; SEEN[key] = n + 1;
    if (typeof bark === 'function') bark('chase40', HINT[key][n ? 1 : 0], { now: true });
    if (wrong % 3 === 0 && api.fail) api.fail();
    setStatus();
  }
  function spark(x, y) {
    for (let j = 0, m = 0; j < SPK.length && m < 20; j += 5) {
      if (SPK[j + 4] > 0) continue;
      const a = Math.random() * TAU, v = 70 + Math.random() * 240;
      SPK[j] = x; SPK[j + 1] = y; SPK[j + 2] = Math.cos(a) * v; SPK[j + 3] = Math.sin(a) * v - 40; SPK[j + 4] = 0.25 + Math.random() * 0.35; m++;
    }
    zx = x; zy = y; zt = 0.7;
  }
  function finish() {
    if (done) return;
    done = true;
    api.finish({ ok: true, variant, half, wrong, connected: conn });
  }

  // ---------------------------------------------------------- autoplay: the same moves a player makes, on a timer
  function autoStep(dt) {
    if (!plan || apK >= plan.length || sel >= 0 && how !== 'key') return;
    if ((apT -= dt) > 0) return;
    const s = plan[apK];
    if (sel < 0) { if (OK[s[0]]) { apK++; return; } lift(s[0], 'key'); fr = s[1]; apT = 0.4; return; }
    tryConnect(sel, fr); apK++; apT = 0.3;
  }

  // ---------------------------------------------------------- draw helpers
  function wire(i, x, y) { // sagging cable from the screw to (x, y)
    const x0 = SX[i], y0 = SY[i], d = Math.hypot(x - x0, y - y0), cxp = (x0 + x) / 2, cyp = Math.max(y0, y) + 10 * k + d * 0.14;
    const thick = L.wires[i][0] === 'cord' ? 1.45 : 1;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(cxp, cyp, x, y);
    ctx.lineWidth = 8.5 * k * thick; ctx.strokeStyle = 'rgba(20,18,14,0.55)'; ctx.stroke();
    ctx.lineWidth = 5.5 * k * thick; ctx.strokeStyle = C26[L.wires[i][0]]; ctx.stroke();
    ctx.lineWidth = 1.4 * k; ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.stroke();
  }
  function plug(i, x, y, lifted) {
    const w = 24 * k, h = 14 * k, col = C26[L.wires[i][0]];
    if (lifted) { ctx.fillStyle = 'rgba(0,0,0,0.25)'; rr(x - w / 2 + 5 * k, y - h / 2 + 7 * k, x + w / 2 + 5 * k, y + h / 2 + 7 * k, 4 * k); ctx.fill(); }
    ctx.fillStyle = '#b9bcc2'; rr(x + w / 2 - 2 * k, y - 3.5 * k, x + w / 2 + 8 * k, y + 3.5 * k, 1.5 * k); ctx.fill();   // the metal tip
    ctx.fillStyle = col; rr(x - w / 2, y - h / 2, x + w / 2, y + h / 2, 4 * k); ctx.fill();
    ctx.lineWidth = 1.5 * k; ctx.strokeStyle = 'rgba(0,0,0,0.45)'; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.28)'; ctx.fillRect(x - w / 2 + 3 * k, y - h / 2 + 2 * k, w - 6 * k, 2.5 * k);
  }
  function ring(x, y, r, col, lw) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.lineWidth = lw; ctx.strokeStyle = col; ctx.stroke(); }
  function screw(x, y, r) {
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = '#c4a24a'; ctx.fill();
    ctx.lineWidth = 1.2; ctx.strokeStyle = '#7d6528'; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - r * 0.6, y - r * 0.6); ctx.lineTo(x + r * 0.6, y + r * 0.6); ctx.lineWidth = 1.6 * k; ctx.strokeStyle = '#6d5720'; ctx.stroke();
  }
  function drawKettle(x, y) { // a 2040 chrome kettle on the tea point, its power base at the terminal
    const s = ks;
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.beginPath(); ctx.ellipse(x + 34 * s, y + 30 * s, 44 * s, 9 * s, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#9aa3ad'; rr(x - 6 * s, y + 18 * s, x + 76 * s, y + 30 * s, 5 * s); ctx.fill();                  // base
    ctx.fillStyle = '#d7dee6'; ctx.beginPath();                                                                      // body
    ctx.moveTo(x + 4 * s, y + 18 * s); ctx.lineTo(x + 12 * s, y - 40 * s); ctx.lineTo(x + 56 * s, y - 40 * s); ctx.lineTo(x + 64 * s, y + 18 * s); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fillRect(x + 16 * s, y - 34 * s, 6 * s, 46 * s);
    ctx.lineWidth = 6 * s; ctx.strokeStyle = '#8e97a1'; ctx.beginPath(); ctx.moveTo(x + 62 * s, y - 30 * s); ctx.quadraticCurveTo(x + 86 * s, y - 14 * s, x + 64 * s, y + 6 * s); ctx.stroke();   // handle
    ctx.fillStyle = '#c3cbd4'; ctx.beginPath(); ctx.moveTo(x + 8 * s, y - 22 * s); ctx.lineTo(x - 10 * s, y - 34 * s); ctx.lineTo(x - 8 * s, y - 28 * s); ctx.lineTo(x + 6 * s, y - 12 * s); ctx.closePath(); ctx.fill();   // spout
    ctx.fillStyle = '#7d8792'; rr(x + 24 * s, y - 46 * s, x + 44 * s, y - 40 * s, 2 * s); ctx.fill();               // lid knob
    ctx.fillStyle = boil > 0 ? '#2f86e0' : '#16233a'; rr(x + 22 * s, y - 14 * s, x + 50 * s, y - 2 * s, 3 * s); ctx.fill();   // the little screen
    ctx.fillStyle = boil > 0 ? '#ffffff' : '#8fd0ff'; ctx.font = fTiny; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(boil > 0 ? 'BOIL' : 'TEA?', x + 36 * s, y - 8 * s);
  }

  const M = {
    start(params, a) {
      api = a; P = params || {}; ov = a.overlay; ctx = ov.ctx; run++;
      variant = P.variant === 'kettle' ? 'kettle' : 'remote'; L = LAY[variant];
      half = variant === 'remote' && (P.half === 1 || P.half === 2) ? P.half : 0;
      for (let i = 0; i < N; i++) { OK[i] = false; OCC[i] = -1; FL[i] = 0; ACT[i] = half === 1 ? i < 2 : half === 2 ? i >= 2 : true; }
      if (half === 2) for (let i = 0; i < 2; i++) { OK[i] = true; OCC[L.pair[i]] = i; }   // the first half is already in
      need = 0; for (let i = 0; i < N; i++) if (ACT[i]) need++;
      for (const key in HINT) SEEN[key] = 0;
      SPK.fill(0); STEAM.fill(0);
      conn = 0; wrong = 0; endT = -1; zt = 0; boil = 0; t = 0; sel = -1; how = ''; keys = false; hov = -1; hovT = -1;
      fl = Math.max(0, freePlug(-1, 1)); fr = Math.max(0, freeTerm(-1, 1));
      done = false; auto = false; plan = null; apK = 0; apT = 0;
      W = H = 0; sch = ''; lpx = dnX = a.input.pointer.x; lpy = dnY = a.input.pointer.y;
      addEventListener('pointerdown', onDown, true);
      ov.show(true);
      if (P.shot && a.cam && a.cam.shot) a.cam.shot(P.shot);
    },

    update(dt) {
      if (done) return;
      const I = api.input, Pt = I.pointer, s = I.scheme;
      if (W !== innerWidth || H !== innerHeight || (s === 'touch') !== (sch === 'touch')) { W = innerWidth; H = innerHeight; sch = s; layout(); }
      else if (s !== sch) { sch = s; setStatus(); }
      t += dt;
      for (let j = 0; j < SPK.length; j += 5) if (SPK[j + 4] > 0) {
        SPK[j] += SPK[j + 2] * dt; SPK[j + 1] += SPK[j + 3] * dt; SPK[j + 3] += 380 * dt; SPK[j + 2] *= 0.93; SPK[j + 4] -= dt;
      }
      for (let r = 0; r < N; r++) if (FL[r] > 0) FL[r] -= dt;
      if (zt > 0) zt -= dt;
      if (boil > 0) {   // steam off the kettle
        for (let j = 0; j < STEAM.length; j += 4) {
          if (STEAM[j + 3] > 0) { STEAM[j + 1] -= 26 * ks * dt; STEAM[j] += 6 * ks * dt; STEAM[j + 2] += 7 * ks * dt; STEAM[j + 3] -= dt * 0.7; }
          else if (Math.random() < dt * 3) { STEAM[j] = kx - 2 * ks; STEAM[j + 1] = ky - 36 * ks; STEAM[j + 2] = 5 * ks; STEAM[j + 3] = 1; }
        }
      }
      // plugs ease toward where they belong (rest, lifted, under the pointer, plugged in)
      for (let i = 0; i < N; i++) {
        let tx = RX[i], ty = RY[i];
        if (OK[i]) { tx = plugInX(i); ty = TY[L.pair[i]]; }
        else if (i === sel) {
          if (how === 'drag') { tx = Pt.x + gox; ty = Pt.y + goy; }
          else if (how === 'tap') { tx = RX[i] + 16 * k; ty = RY[i] - 14 * k; }
          else { tx = TX[fr] - 52 * k; ty = TY[fr] - 4 * k; }
        }
        const e = how === 'drag' && i === sel ? 1 : Math.min(1, dt * 14);
        PX[i] += (tx - PX[i]) * e; PY[i] += (ty - PY[i]) * e;
      }
      if (endT >= 0) { endT -= dt; if (endT < 0) finish(); return; }
      if (auto) { autoStep(dt); return; }

      // ---- pointer: drag, or tap-then-tap
      const moved = Pt.x !== lpx || Pt.y !== lpy;
      lpx = Pt.x; lpy = Pt.y;
      if (moved) keys = false;
      hov = sel < 0 ? plugAt(Pt.x, Pt.y, 30) : -1;
      hovT = sel >= 0 && how !== 'key' ? termAt(PX[sel], PY[sel], 40 * k) : -1;
      if (Pt.pressed) {
        const x0 = dnX, y0 = dnY, i = plugAt(x0, y0, 34);
        if (sel >= 0 && how === 'tap') {
          const r = termAt(x0, y0, 40 * k);
          if (r >= 0) { tryConnect(sel, r); return; }
          if (i < 0 || i === sel) { drop(); return; }
        }
        if (i >= 0) {
          lift(i, 'drag'); gox = PX[i] - x0; goy = PY[i] - y0; gpx = x0; gpy = y0;
          if (!Pt.down) release(Pt.x + gox, Pt.y + goy, Pt.x, Pt.y);   // down and up in the same tick
          return;
        }
      }
      if (sel >= 0 && how === 'drag' && !Pt.down) { release(Pt.x + gox, Pt.y + goy, Pt.x, Pt.y); return; }
      // ---- keys / pad (presses only: YES lifts, YES plugs in, NO puts back)
      const up = I.pressed('up') || I.pressed('left'), dn = I.pressed('down') || I.pressed('right');
      const yes = I.pressed('yes') && !Pt.pressed, no = I.pressed('no') && !Pt.pressed;
      if (up || dn || yes || no) keys = true;
      if (sel < 0) {
        if (up || dn) { const n = freePlug(fl, dn ? 1 : -1); if (n >= 0) fl = n; }
        else if (yes) { I.consume('yes'); if (!(ACT[fl] && !OK[fl])) fl = freePlug(fl, 1); if (fl >= 0) { lift(fl, 'key'); if (OCC[fr] >= 0) fr = Math.max(0, freeTerm(fr, 1)); } else fl = 0; }
      } else if (how === 'key' || how === 'tap') {
        if (how === 'tap' && (up || dn || yes)) how = 'key';
        if (up || dn) { const n = freeTerm(fr, dn ? 1 : -1); if (n >= 0) fr = n; }
        else if (yes) { I.consume('yes'); tryConnect(sel, fr); }
        else if (no) { I.consume('no'); drop(); }
      }
    },

    draw() {
      if (done || !ctx || !W) return;
      const s = ov.canvas.width / W;
      ctx.setTransform(s, 0, 0, s, 0, 0); ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(7,9,16,0.8)'; ctx.fillRect(0, 0, W, H);
      ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.textBaseline = 'middle';

      // header
      ctx.textAlign = hAlign; ctx.fillStyle = CONFIG.colors.yes; ctx.font = fBig; ctx.fillText(L.title, hx, hy);
      ctx.fillStyle = '#ffffff'; ctx.font = fMid; ctx.fillText(status, hx, hy + 23);
      ctx.fillStyle = '#9aa6c4'; ctx.font = fSmall; ctx.fillText(hint, hx, hy + 44, W - 24);

      // the open junction box, top-down
      const bx0 = ox, by0 = oy, bx1 = ox + BW * sc, by1 = oy + BH * sc;
      ctx.fillStyle = 'rgba(0,0,0,0.35)'; rr(bx0 + 6, by0 + 9, bx1 + 6, by1 + 9, 18 * sc); ctx.fill();
      ctx.fillStyle = '#e2dccb'; rr(bx0, by0, bx1, by1, 18 * sc); ctx.fill();
      ctx.fillStyle = '#cbc3b0'; rr(bx0 + 8 * sc, by0 + 8 * sc, bx1 - 8 * sc, by1 - 8 * sc, 13 * sc); ctx.fill();
      ctx.fillStyle = gTray; rr(bx0 + 14 * sc, by0 + 14 * sc, bx1 - 14 * sc, by1 - 14 * sc, 10 * sc); ctx.fill();
      for (let c = 0; c < 4; c++) {
        const x = c & 1 ? bx1 - 30 * sc : bx0 + 30 * sc, y = c & 2 ? by1 - 30 * sc : by0 + 30 * sc;
        ctx.beginPath(); ctx.arc(x, y, 9 * sc, 0, TAU); ctx.fillStyle = '#a69e8a'; ctx.fill();
        ctx.beginPath(); ctx.arc(x, y, 4.5 * sc, 0, TAU); ctx.fillStyle = '#7f7867'; ctx.fill();
      }
      ctx.save(); ctx.globalAlpha = 0.16; ctx.fillStyle = '#4b4536'; ctx.font = fLab; ctx.textAlign = 'center';
      ctx.fillText('LINE 1', (LB2 + RB0) / 2, by1 - 34 * sc); ctx.restore();

      // the cable coming in from the wall (left edge) to the socket block
      ctx.lineWidth = 16 * k; ctx.strokeStyle = '#8f8a80';
      ctx.beginPath(); ctx.moveTo(bx0 - 4, (LB1 + LB3) / 2 + 30 * sc); ctx.quadraticCurveTo(LB0 - 10 * sc, (LB1 + LB3) / 2, LB0 + 6, (LB1 + LB3) / 2); ctx.stroke();
      // left block: the 2026 socket (or the beige 1987 jack with its taped label)
      ctx.fillStyle = 'rgba(0,0,0,0.2)'; rr(LB0 + 4, LB1 + 6, LB2 + 4, LB3 + 6, 8 * sc); ctx.fill();
      ctx.fillStyle = variant === 'kettle' ? '#d8cdae' : '#efe9d8'; rr(LB0, LB1, LB2, LB3, 8 * sc); ctx.fill();
      ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(80,70,50,0.35)'; ctx.stroke();
      ctx.textAlign = 'left';
      if (variant === 'kettle') {
        ctx.save(); ctx.translate((LB0 + LB2) / 2, LB1 + 4 * sc); ctx.rotate(-0.035);
        ctx.fillStyle = '#efe3b4'; ctx.fillRect(-(LB2 - LB0) / 2 - 4 * sc, -12 * sc, LB2 - LB0 + 8 * sc, 24 * sc);
        ctx.fillStyle = '#1d2f8f'; ctx.font = fHand; ctx.textAlign = 'center'; ctx.fillText(L.left, 0, 0, LB2 - LB0);
        ctx.restore();
      } else { ctx.fillStyle = '#8a8170'; ctx.font = fTiny; ctx.fillText(L.left, LB0 + 10 * sc, LB1 + 14 * sc, LB2 - LB0 - 16 * sc); }
      for (let i = 0; i < N; i++) {
        if (L.wires[i][0] === 'cord') continue;
        ctx.fillStyle = '#5b5446'; ctx.font = fLab; ctx.textAlign = 'left';
        ctx.fillText(L.wires[i][1], LB0 + 12 * sc, SY[i], SX[i] - LB0 - 28 * sc);
        ctx.fillStyle = C26[L.wires[i][0]]; ctx.fillRect(LB0 + 12 * sc, SY[i] + 10 * sc, 24 * sc, 4 * sc);
        screw(SX[i], SY[i], 9 * k);
      }
      // right block: the 2040 adapter, glassy white with a soft blue glow
      ctx.fillStyle = 'rgba(143,208,255,0.32)'; rr(RB0 - 6, RB1 - 6, RB2 + 6, RB3 + 6, 16 * sc); ctx.fill();
      ctx.fillStyle = gBlock; rr(RB0, RB1, RB2, RB3, 12 * sc); ctx.fill();
      ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(47,134,224,0.45)'; ctx.stroke();
      ctx.fillStyle = '#6b84aa'; ctx.font = fTiny; ctx.textAlign = 'left'; ctx.fillText(L.right, RB0 + 12 * sc, RB1 + 14 * sc, RB2 - RB0 - 20 * sc);
      ctx.lineWidth = 7 * k; ctx.strokeStyle = '#d7dfe8';                    // the coil of 2040 cable, off the right edge
      ctx.beginPath(); ctx.moveTo(RB2, (RB1 + RB3) / 2);
      for (let j = 0; j < 3; j++) ctx.arc(RB2 + (14 + j * 12) * sc, (RB1 + RB3) / 2 + 10 * sc, 13 * sc, Math.PI, Math.PI * 2.85);
      ctx.lineTo(bx1 + 4, (RB1 + RB3) / 2 + 48 * sc); ctx.stroke();
      if (variant === 'kettle') drawKettle(kx, ky);
      for (let r = 0; r < N; r++) {
        const id = L.terms[r][0], col = C40[id], x = TX[r], y = TY[r];
        if (id !== 'kettle') {
          ctx.textAlign = 'left'; ctx.fillStyle = '#24324d'; ctx.font = fTerm;
          if (tall) { ctx.fillText(TL1[r], x + 20 * k, y - (TL2[r] ? 8 * k : 0)); if (TL2[r]) ctx.fillText(TL2[r], x + 20 * k, y + 9 * k); }
          else ctx.fillText(TL1[r], x + 22 * k, y, RB2 - x - 28 * k);
        } else { ctx.textAlign = 'center'; ctx.fillStyle = '#c9d6e6'; ctx.font = fTerm; ctx.fillText(TL1[r], kx + 34 * ks, ky + 44 * ks); }
        ctx.beginPath(); ctx.arc(x, y, 12 * k, 0, TAU); ctx.fillStyle = '#18202e'; ctx.fill();
        ring(x, y, 12 * k, FL[r] > 0 ? '#ff9a3c' : col, 4.5 * k);
        if (OCC[r] >= 0) { ctx.globalAlpha = 0.5; ring(x, y, 17 * k, col, 2.5 * k); ctx.globalAlpha = 1; }
      }
      // the kettle cord's tag, wires and plugs (the lifted one last, on top)
      for (let i = 0; i < N; i++) {
        if (i === sel) continue;
        if (!ACT[i] && !OK[i]) {   // the half not in play yet: taped down, dimmed
          ctx.globalAlpha = 0.45; wire(i, RX[i], RY[i]); plug(i, RX[i], RY[i], false); ctx.globalAlpha = 1;
          ctx.fillStyle = 'rgba(232,225,200,0.9)'; ctx.save(); ctx.translate(RX[i], RY[i]); ctx.rotate(0.5); ctx.fillRect(-6 * k, -14 * k, 12 * k, 28 * k); ctx.restore();
          continue;
        }
        wire(i, PX[i], PY[i]); plug(i, PX[i], PY[i], false);
        if (L.wires[i][0] === 'cord' && !OK[i]) {
          ctx.save(); ctx.translate(PX[i] - 6 * k, PY[i] + 26 * k); ctx.rotate(0.06);
          ctx.fillStyle = '#efe3b4'; ctx.fillRect(-62 * k, -11 * k, 124 * k, 22 * k);
          ctx.fillStyle = '#1d2f8f'; ctx.font = fHand; ctx.textAlign = 'center'; ctx.fillText("doesn't go anywhere", 0, 1, 118 * k);
          ctx.restore();
        }
      }
      if (sel >= 0) {
        if (hovT >= 0) { ctx.globalAlpha = 0.85; ring(TX[hovT], TY[hovT], 20 * k, '#ffffff', 2.5 * k); ctx.globalAlpha = 1; }
        wire(sel, PX[sel], PY[sel]); plug(sel, PX[sel], PY[sel], true);
      }
      // keys / pad focus, pointer hover
      if (keys && endT < 0) {
        ctx.setLineDash(DASH);
        if (sel < 0 && ACT[fl] && !OK[fl]) ring(PX[fl], PY[fl], 21 * k, CONFIG.colors.yes, 3 * k);
        else if (sel >= 0) ring(TX[fr], TY[fr], 21 * k, CONFIG.colors.yes, 3 * k);
        ctx.setLineDash(NODASH);
      } else if (hov >= 0) ring(PX[hov], PY[hov], 19 * k, 'rgba(255,255,255,0.9)', 2.5 * k);
      // done: every terminal glows
      if (endT >= 0) {
        ctx.globalAlpha = 0.35 + 0.35 * Math.sin(t * 9);
        for (let r = 0; r < N; r++) if (OCC[r] >= 0) ring(TX[r], TY[r], 22 * k, C40[L.terms[r][0]], 4 * k);
        ctx.globalAlpha = 1;
      }
      // sparks, steam
      ctx.lineWidth = 2; ctx.strokeStyle = '#fff2a0'; ctx.beginPath();
      for (let j = 0; j < SPK.length; j += 5) if (SPK[j + 4] > 0) { ctx.moveTo(SPK[j], SPK[j + 1]); ctx.lineTo(SPK[j] - SPK[j + 2] * 0.035, SPK[j + 1] - SPK[j + 3] * 0.035); }
      ctx.stroke();
      if (zt > 0.45 && !options.reduceFlashing) {
        ctx.globalAlpha = (zt - 0.45) * 2.4; ctx.fillStyle = '#fff3a0'; ctx.beginPath(); ctx.arc(zx, zy, 26 * k * (1.2 - zt), 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
      }
      if (boil > 0) {
        ctx.fillStyle = '#ffffff';
        for (let j = 0; j < STEAM.length; j += 4) if (STEAM[j + 3] > 0) {
          ctx.globalAlpha = STEAM[j + 3] * 0.45; ctx.beginPath(); ctx.arc(STEAM[j], STEAM[j + 1], STEAM[j + 2], 0, TAU); ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
    },

    end() {
      done = true; run++; sel = -1;
      removeEventListener('pointerdown', onDown, true);
      if (ctx) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, ov.canvas.width, ov.canvas.height); }
      if (ov) ov.show(false);
    },

    // the pause menu's "Skip this mini-game" (after two failures): it counts as wired
    skipResult() { return { ok: true, variant, half }; },

    autoplay(a) {
      if (done || api !== a) M.start(a.params || {}, a);
      // one wrong pair first (Chase (2040) reads the hint), then each wire in order
      plan = [];
      for (const d of L.demo) if (ACT[d[0]] && !OK[d[0]] && L.pair[d[0]] !== d[1]) { plan.push(d); break; }
      for (let i = 0; i < N; i++) if (ACT[i] && !OK[i] && L.wires[i][0] !== 'cord') plan.push([i, L.pair[i]]);
      for (let i = 0; i < N; i++) if (ACT[i] && !OK[i] && L.wires[i][0] === 'cord') plan.push([i, L.pair[i]]);
      apK = 0; apT = 0.5; auto = true; keys = true;
    },
  };
  MINIGAMES.wiring = M;
})();
