// ============================================================ MINIGAME: Sequencer "two" (spec §9.10; scene 2.10 "3:00 am")
// Rue's Sequencer (ref/rue/16-*.js: the tracker grid, a cursor + a button row, pointer hover / click, NO = play / stop,
// preview on toggle, the live pattern handed to AUDIO.seq so edits are heard at once, a fallback clock), rebuilt for
// "two" and two people, on the glass of Chase (2040)'s slate over the live desk shot. Four sample lanes x 16 steps
// (a sample per lane picked from the takes Chase collected, any order; an empty lane is a synth bleep), a LEAD lane with
// the "two" melody written in (toggle its notes on and off, a bar at a time), and the section strip INTRO · VERSE ·
// CHORUS · VERSE 2 · BRIDGE · CHORUS · OUTRO. Everything is pre-arranged except the bridge's empty feature slot:
// every take auditioned there gets "Fine." / "Yeah, fine." / "That's fine." from Chase (2040), except Luka (laughing),
// which plays the scripted beat and locks in (60 s without trying it and Chase (2040) drags it in himself). Then PLAY
// IT BACK (the first verse and chorus only, muffled through the desk's tiny monitor), and [ONE MORE PASS] [IT'S DONE].
//
// ---- the mini-game ------------------------------------------------------------------------------------------------
//   ['minigame', 'sequencer', { shot, shots, onBridge, lines, time, clock, place, dragAfter, gain, music }]
//     shot       the lens behind the slate (default INSERT 's210_desk_two' when the set has it; false = leave the camera)
//     shots      { c40, clock }: cutaway lenses. c40 (the bridge beat) defaults to INSERT 's210_c40_close', else CLOSE on
//                chase40; clock (each ONE MORE PASS jump) to INSERT 'sl_clock' when the set has it (+ a time card), else
//                no cutaway (the time jumps big on the slate's glass). null / false = no cutaway.
//     onBridge   the scripted beat when the laugh lands in the bridge. Default: played inline (the slate lowers, CLOSE
//                on Chase (2040), CHASE (2040) (barely) "…That's the bridge. ^ That's what was missing.", the monitor
//                stops while he puts the headphones down, a held beat). A step list runs instead (api.play), or a
//                function (api, { dragged }) -> Promise (a scene's cutscene: c.playCutscene(...)); false = no beat.
//                The laugh locks in when it resolves.
//     lines      { stop, quick }: step lists or (api) => Promise replacing the inline exchanges after the second
//                ONE MORE PASS ("Stop." … "It's done when you stop. ^ That's all done is.") and for IT'S DONE the
//                first time ("…That was quick." … "You did. ^ In about four minutes, probably."). Default inline.
//     time '3:00' the slate's clock at the start · clock [['3:14'], ['3:31', '3:52']] the jumps per ONE MORE PASS ·
//     place ''    under the time card · dragAfter 60  seconds of editing before Chase (2040) drags the laugh in
//     gain 1      the monitor's level · music: false keeps the current cue (default: faded out, the slate is the music)
//   Result: { ok: true, pattern, lanes, passes: 0..2, quick (IT'S DONE the first time), stopped (the "Stop." exchange
//     ran), dragged (Chase (2040) put the laugh in), auditioned: [ids in order], time: '3:52 am', auto? }.
//   state.pattern = { lanes: [sampleId | null x 4], steps: [[bool x 16] x 4], lead: [bool x 64] | null, bridge: 'laugh' }
//     (exactly what AUDIO.song / AUDIO.bakeSong / music('two') read: lane 0 hats, 1 snare, 2 texture, 3 chords; lead is
//     null when every note is on), and AUDIO.bakeSong(state.pattern) starts in the background, so 3.6 finds it baked.
//     The lead mask is the audio engine's: index bar-of-the-line x 16 + step (4 bars), one mask for the verses and the
//     first chorus alike (03-audio leadOn); the last chorus (the 1987 melody) and the bridge are shown read-only.
//   No fail state (so the host never offers "Skip this?"). If it is skipped anyway: empty lanes get Chase's own picks,
//     the laugh goes in the bridge, the pattern is stored: { skipped: true, ok: true, pattern, … }. { aborted } /
//     { error } store nothing.
//   Events: emit('sequencer:lane', { lane, id }), ('sequencer:audition', id), ('sequencer:bridge', { dragged }),
//     ('sequencer:playback', on), ('sequencer:pass', n), ('sequencer:done', result). testLog 'sequencer: …'.
//   MINIGAMES.sequencer.pattern(samples?) -> a complete pattern without playing (Chase's picks + the laugh in the
//     bridge), e.g. for Chapter Select grants past 2.10.
//   Test hooks: .phase ('edit' | 'beat' | 'drag' | 'playback' | 'choice' | 'pass' | 'done' | 'off'), .focus, .takes,
//     .at(kind, i, j) -> [x, y] CSS px of a control (strip, head, cell, chip, slot, pick, btn) for scripted input.
// What the scene sets up (2.10): valley dressed 'three210'; chase40 on the stool at s210_c40_desk, chase on the amp at
//   s210_chase_amp; 2.10_promise ends on s210_desk_two. Used when the set has them: slate_desk.screen('seq'),
//   foh_desk.state('live') while it plays back (then 'half'), wall_clock_sl.set(h, m) on each jump. QUIET IN on the
//   HUD counts down with the clock (08:58:00 at 3:00 -> 08:06:00 at 3:52). The scene runs 2.10_bounce afterwards.
//
// ---- controls -----------------------------------------------------------------------------------------------------
//   Keyboard  arrows / WASD move · Enter / Space toggle, pick, press · Esc / Backspace preview the section (play/stop),
//             close the sample list · Tab / Q next / previous section.
//   Mouse     hover + click; drag along a lane to paint steps; drag a take onto the bridge's slot (or click it);
//             right click = preview. Click a lane's name for its sample list; the LEAD name flips its bar (◂ ▸).
//   Gamepad   stick / d-pad, A, B (preview / back), Y / LB next / previous section.
//   Touch     tap and drag as the mouse; the YES / NO buttons are A / B (the stick hides while the slate is up).
//   No holds (nothing to set to "press instead"), no timing, no fail.
//
// ---- autoplay -----------------------------------------------------------------------------------------------------
//   Plays it through on game time like a player: picks Chase's four lanes from the list, toggles a couple of steps and a
//   lead note, auditions one other take in the bridge ("Fine."), then the laugh (the beat, inline), PLAY IT BACK for
//   ~2.5 s, ONE MORE PASS twice (3:14 … 3:31 … 3:52, "Stop."), IT'S DONE. &seq=quick (or params.test: 'quick') presses
//   IT'S DONE first ("…That was quick."). With a short params.dragAfter it waits for Chase (2040) to drag the laugh in.
// Nothing is allocated per tick or frame: typed arrays, precomputed strings and gradients, reused option objects.
MINIGAMES.sequencer = (() => {
  // ---------------------------------------------------------- the song (spec §15.3; AUDIO.TWO is read when it's there)
  const STEP = 60 / 92 / 4, BAR = 16 * STEP;
  const BRIDGE = 4;
  const SEC_LABEL = ['INTRO', 'VERSE', 'CHORUS', 'VERSE 2', 'BRIDGE', 'CHORUS', 'OUTRO'];
  const SEC_BARS = [2, 8, 8, 8, 8, 8, 2], SEC_FIRST = [0, 2, 10, 18, 26, 34, 42];
  const SEC_CH = [['Bm', 'A'], ['Bm', 'G', 'D', 'A'], ['G', 'D', 'A', 'Bm'], ['Bm', 'G', 'D', 'A'], ['Em', 'G', 'A', 'A'], ['D', 'G', 'Bm', 'A'], ['D', 'D']];
  // how loud each lane plays per section (03-audio's LG): 0 = the lane rests there
  const LG = [[0.45, 0, 0.8, 0], [0.8, 0.85, 0.55, 0.65], [1, 1, 0.7, 0.85], [0.85, 0.9, 0.6, 0.75], [0, 0, 0.12, 0], [1.1, 1.1, 0.85, 1], [0, 0, 0.4, 0]];
  const LKIND = [-1, 0, 1, 0, -1, 2, -1];   // the lead per section: -1 none, 0 the verse line, 1 the chorus line, 2 the 1987 melody
  // fallbacks for when AUDIO is missing (the same tables as 03-audio)
  const DEF_ON = [[0, 2, 4, 6, 8, 10, 12, 14], [4, 12], [0], [0, 6, 10]];
  const PREF = [['kettle', 'sizzle', 'chip', 'brick', 'alarm', 'train', 'radio'], ['boom', 'train', 'brick', 'alarm', 'kettle', 'radio', 'sizzle'],
    ['hover', 'bay', 'cicadas', 'whir', 'sizzle', 'radio'], ['uke', 'piano', 'chip', 'train']];
  const LEAD_V = [[78, 74, 78, 74, 76, 78, 81, 78], [79, 78, 76, 74, 71, 74, 76, 0], [78, 74, 78, 74, 81, 83, 81, 78], [76, 73, 76, 78, 76, 0, 0, 0]];
  const LEAD_C = [[83, 0, 81, 79, 78, 0, 74, 0], [81, 0, 78, 0, 74, 76, 78, 0], [76, 0, 73, 0, 76, 78, 81, 0], [78, 0, 74, 0, 0, 0, 0, 0]];
  const PUD = [[74, 78, 81, 78, 76, 79, 83, 81], [78, 81, 86, 83, 81, 78, 76, 74]];
  const notesOf = (row) => { const out = []; for (let i = 0; i < 8; i++) if (row[i]) { let l = 2; while (i + l / 2 < 8 && !row[i + l / 2]) l += 2; out.push([i * 2, row[i], l]); } return out; };
  const NN = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  // ---------------------------------------------------------- words (every line word for word, spec §8 2.10)
  const FINE = ['Fine.', 'Yeah, fine.', "That's fine."];
  const L_BRIDGE = "…That's the bridge. ^ That's what was missing.";
  const L_STOP = [['chase40', 'Stop.'], ['chase', "It's not—"], ['chase40', "It's done."], ['chase', "The bridge isn't—"], ['chase40', "It's done when you stop. ^ That's all done is."]];
  const L_QUICK = [['chase40', '…That was quick.', 'stunned'], ['chase', "It's done when you stop."], ['chase40', '…Who told you that?'], ['chase', 'You did. ^ In about four minutes, probably.', 'fond']];
  const CLOCK_DEF = [['3:14'], ['3:31', '3:52']];

  // ---------------------------------------------------------- look (the slate: dark 2040 glass; SafeSense pills)
  const F = '"Trebuchet MS", "Segoe UI", system-ui, sans-serif';
  const TF = '"Avenir Next", "Futura", "Century Gothic", "Segoe UI", "Helvetica Neue", "Trebuchet MS", system-ui, sans-serif';
  const MONO = '"Courier New", ui-monospace, Menlo, Consolas, monospace';
  const ICE = '#e8f4ff', DIM = '#8ea7c6', DIM2 = '#5d7696', SSL = '#8fd0ff', YES = '#ffd21f', INK = '#1c2a44', NAVY = '#141d3a';
  const LANE_NAME = ['HATS', 'SNARE', 'TEXTURE', 'CHORDS'];
  const LANE_COL = ['#8fd0ff', '#ffb38a', '#7fe3c4', '#c9a8ff'];
  const LANE_INK = ['#0b2a46', '#4a220c', '#0b3a2c', '#2c1a52'];
  const PICK_T = ['HATS  ·  pick a sample', 'SNARE  ·  pick a sample', 'TEXTURE  ·  pick a sample', 'CHORDS  ·  pick a sample'];
  const TAGS = { alarm: 'ALM', radio: 'RAD', kettle: 'KET', chip: 'CHP', hover: 'HUM', bay: 'BAY', piano: 'PNO', cicadas: 'CIC', brick: 'BRK',
    boom: 'BOOM', whir: 'WHR', laugh: 'HA', sizzle: 'SIZ', train: 'TRN', uke: 'UKE' };
  const NUMS = []; for (let i = 1; i <= 16; i++) NUMS.push(String(i));
  const BARN = ['1', '2', '3', '4', '5', '6', '7', '8'];
  const MMSS = []; for (let i = 0; i <= 240; i++) MMSS.push(Math.floor(i / 60) + ':' + (i % 60 < 10 ? '0' : '') + (i % 60));
  const DASH = [5, 4], NODASH = [];
  const HELP = {
    kb: 'Arrows move  ·  Enter toggles  ·  Esc previews  ·  Tab / Q change section',
    pad: 'Stick moves  ·  A toggles  ·  B previews  ·  Y / LB change section',
    touch: 'Tap a step  ·  drag to paint  ·  tap a lane name for its sample',
  };
  const STAGE = ['Pick a sample for each lane.', 'The bridge is empty. Audition a sample in it.', 'Play it back when you’re ready.', 'Audition as many as you like.'];
  const MSG = ['', 'The bridge is still empty.', 'The last chorus plays the 1987 melody.', 'The bridge is done.', 'That lane rests in this section.'];
  const DROP_TXT = { kb: 'Click a sample or drag it here  ·  Enter auditions it', pad: 'Choose a sample  ·  A auditions it here', touch: 'Tap a sample, or drag it here' };
  const BTN_T = [['▶  PREVIEW', 'PLAY IT BACK'], ['■  STOP'], ['ONE MORE PASS', 'IT’S DONE']];
  const STOP_T = '■  STOP', MON_TXT = 'through the desk monitor', IN_LANE = ['in HATS', 'in SNARE', 'in TEXTURE', 'in CHORDS'], PASS_T = 'One more pass…';
  const CSS = '#ui.touchui.mg-seq #stick,#ui.touchui.mg-seq #t-bag,#ui.touchui.mg-seq #t-chip{opacity:0;pointer-events:none}';
  const SO_T = { vol: 0.35 }, SO_SOFT = { vol: 0.18 }, SO_POP = { vol: 0.45 }, SO_CLUNK = { vol: 0.4 }, SO_CHIRP = { vol: 0.4 }, SO_THUD = { vol: 0.5 }, SO_WH = { vol: 0.22 };
  const HO = { chord: 'Bm', vol: 0.9 }, NO_ = { vol: 0.6 }, SEQ_O = { section: 1, muffled: true, bars: 0, gain: 1 };
  const Z_STRIP = 0, Z_GRID = 1, Z_BTN = 2, Z_PICK = 3, Z_CHIPS = 4;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const ease = (u) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
  const aud = () => (typeof AUDIO !== 'undefined' && AUDIO ? AUDIO : null);
  const sfx0 = (n, o) => { if (api && api.sfx) api.sfx(n, o); };

  // ---------------------------------------------------------- the lead, per line and bar (built once)
  // LD[kind][bar] = { n, st: start steps, ln: lengths, mi: midi, on / off: names, cov[16]: the note covering each step }
  let LD = null;
  function buildLead() {
    const T = aud() && AUDIO.TWO && AUDIO.TWO.lead;
    const src = [(T && T.verse) || LEAD_V.map(notesOf), (T && T.chorus) || LEAD_C.map(notesOf), (T && T.pudding) || PUD.map(notesOf)];
    LD = src.map((bars) => bars.map((row) => {
      const n = row.length, b = { n, st: new Int8Array(n), ln: new Int8Array(n), mi: new Uint8Array(n), on: [], off: [], cov: new Int8Array(16).fill(-1) };
      row.forEach(([s, m, l], i) => {
        b.st[i] = s; b.ln[i] = l; b.mi[i] = m;
        const nm = NN[m % 12] + (Math.floor(m / 12) - 1); b.on.push(nm); b.off.push(nm.toLowerCase());
        for (let k = s; k < s + l && k < 16; k++) b.cov[k] = i;
      });
      return b;
    }));
  }
  const leadRow = (s, bar) => { const k = LKIND[s]; return k < 0 || !LD ? null : LD[k][k === 2 ? bar & 1 : bar & 3]; };

  // ---------------------------------------------------------- the pattern (one live object: AUDIO.seq reads it as it changes)
  const PAT = { lanes: [null, null, null, null], steps: [0, 1, 2, 3].map(() => new Array(16).fill(false)), lead: new Array(64).fill(true), bridge: null };
  function defaultLanes(samples) {
    const A = aud(), have = samples || [];
    if (A && A.TWO && A.TWO.defaultPattern) return A.TWO.defaultPattern(have).lanes.slice();
    const used = [];
    return PREF.map((pref) => { const id = pref.find((k) => have.includes(k) && !used.includes(k)) || null; if (id) used.push(id); return id; });
  }
  function load() { // the last stored pattern (re-entry), else Chase's groove with empty lanes
    const sp = state.pattern, ok = sp && typeof sp === 'object' && Array.isArray(sp.steps) && sp.steps.length >= 4 && sp.steps.every((r) => Array.isArray(r) && r.length >= 16);
    for (let l = 0; l < 4; l++) {
      for (let s = 0; s < 16; s++) PAT.steps[l][s] = ok ? !!sp.steps[l][s] : DEF_ON[l].includes(s);
      const id = ok && Array.isArray(sp.lanes) ? sp.lanes[l] : null;
      PAT.lanes[l] = id && TK.includes(id) ? id : null;
    }
    const ld = ok && Array.isArray(sp.lead) && sp.lead.length >= 64 ? sp.lead : null;
    for (let i = 0; i < 64; i++) PAT.lead[i] = ld ? !!ld[i] : true;
    PAT.bridge = null;   // never undefined: the audio engine reads undefined as "the laugh"
  }
  function snapshot() {
    let all = true;
    for (let i = 0; i < 64; i++) if (!PAT.lead[i]) { all = false; break; }
    return { lanes: PAT.lanes.slice(), steps: PAT.steps.map((r) => r.slice()), lead: all ? null : PAT.lead.slice(), bridge: 'laugh' };
  }
  function store() {
    const pat = snapshot();
    state.pattern = pat;
    const A = aud();
    if (A && A.bakeSong) { try { A.bakeSong(pat, { samples: state.samples }); } catch (e) { console.warn('TWO: sequencer bake', e); } }   // off the main thread; cached for 3.6
    return pat;
  }

  // ---------------------------------------------------------- state
  const TK = [], PK = [], HEARD = new Uint8Array(16), AUD = [];   // the takes (ids), their peaks, heard flags, audition order
  const TL1 = [], TL2 = [];                                         // each take's label in two lines (narrow lane names)
  const FL = new Float32Array(80);                                  // toggle flashes: lanes 0..63, lead 64..79
  const TIMES = [];
  let api = null, ov = null, ctx = null, p = {}, run = 0, done = true, auto = false, phase = 'off', wasEnabled = false, uiRoot = null, styleEl = null;
  let baseShot = null, laughI = -1, sec = 1, fs = 1, leadBar = 0, locked = false, laughTried = false, dragged = false, passes = 0, greyed = false;
  let slotI = -1, slotT = 1, lockT = 1, fineI = 0, fineT = 0, dragT = 0, dragAfter = 60, msg = 0, msgT = 0;
  let vis = 0, visTo = 0, visRate = 2, hold = 0, tt = 0;
  let previewOn = false, previewSec = -1, previewBars = 8, stepSeen = false, ownClk = 0, prevT0 = 0, playRow = -1, playBar = -1;
  let song = null, pbT = 0, pbDur = 16 * BAR, pbShow = 0, deskLive = false;
  let fz = Z_GRID, fr = 0, fc = -1, fb = 0, fp = 0, fk = 0, pick = -1;
  let lpx = -1, lpy = -1, paintOn = false, paintLane = 0, paintVal = false, cdI = -1, cdX = 0, cdY = 0, cdMoved = false;
  let fidOn = false, fidT = 0, fidK = 0, fidL = 0, fidS = 0, fidSeed = 7, gxp = 0, gyp = 0;
  let hand = false, handT = 0, handX = 0, handY = 0, handA = 0, handCarry = -1;
  let h0 = 3, clkM = 0, clkTo = 0, clkShown = -1, q0 = -1, clkJump = 0;
  const onStep = (s, bar) => { playRow = s; playBar = bar; stepSeen = true; };

  // ---------------------------------------------------------- layout (on start, resize, input-scheme change)
  let W = 0, H = 0, sch = '', touch = false, narrow = false, portrait = false, k1 = 1;
  let px = 0, py = 0, pw = 0, ph = 0, pad = 16, insR = 0, hdrH = 48, stripY = 0, stripH = 32, bbY = 0, bbH = 56;
  let gx = 0, gy = 0, gw = 0, gh = 0, gx0 = 0, hw = 120, cx0 = 0, cw = 40, cellH = 40, laneH = 46, subH = 0, wrap = false, cpl = 16, numH = 0, headH = 40, cg = 4;
  let slx = 0, sly = 0, slw = 0, slh = 0, bcCols = 1, bcw = 100, bch = 36, shx = 0, shy = 0, shw = 0, shh = 0, pcCols = 1, pcw = 100, pch = 36, clx = 0, cly = 0, cls = 24;
  let BY = 0, BH = 40, hintX = 0, hintY = 0, hintW = 0, help = '', dropTxt = '';
  const SX = new Float32Array(7), SW = new Float32Array(7), CX = new Float32Array(16), CY = new Float32Array(16), RY = new Float32Array(5);
  const BCX = new Float32Array(16), BCY = new Float32Array(16), PCX = new Float32Array(17), PCY = new Float32Array(17);
  const BX = [new Float32Array(2), new Float32Array(1), new Float32Array(2)], BWD = [new Float32Array(2), new Float32Array(1), new Float32Array(2)], BN = [2, 1, 2];
  let fLogo = '', fTitle = '', fSub = '', fClock = '', fStrip = '', fLane = '', fTake = '', fCell = '', fNum = '', fNote = '', fBtn = '', fHint = '', fChip = '', fBig = '', fSm = '', fPickT = '';
  let bgC = null, vigG = null, selG = null, btnG = null, offG = null, PB_OF = '/ 0:42';
  let clkW = 60, monW = 50, bmW = 18, secW = 60, timeW = 30, monTxtW = 140, jumpW = 200, fJump = '';
  const SH = 30;
  const rr = (c, x, y, w, h, r) => { c.beginPath(); c.roundRect(x, y, w, h, r); };

  function chipGrid(n, x, y, w, h, X, Y, minW, maxH) { // n chips in a grid inside (x, y, w, h); -> [cols, cw, ch] in out
    const g = Math.round(clamp(8 * k1, 5, 10));
    let cols = clamp(Math.floor((w + g) / (minW + g)), 1, Math.max(1, n)), rows = Math.ceil(n / cols), ch = Math.floor((h - (rows - 1) * g) / rows);
    while (ch < 26 && cols < n) { cols++; rows = Math.ceil(n / cols); ch = Math.floor((h - (rows - 1) * g) / rows); }
    ch = clamp(ch, 22, maxH); const cwd = Math.floor((w - (cols - 1) * g) / cols);
    for (let i = 0; i < n; i++) { X[i] = x + (i % cols) * (cwd + g); Y[i] = y + Math.floor(i / cols) * (ch + g); }
    CG[0] = cols; CG[1] = cwd; CG[2] = ch;
  }
  const CG = [1, 100, 36];

  function layout() {
    W = innerWidth; H = innerHeight; sch = api.input.scheme; touch = sch === 'touch';
    portrait = W < H; narrow = W < 700 || portrait;
    let L, R, T, B;
    if (touch && !portrait) { L = 8; R = W - 206; T = 8; B = H - 8; }            // the YES / NO / SWAP column and pause stay clear
    else if (touch) { L = 8; R = W - 8; T = 116; B = H - 196; }                    // phones upright: under the pause button, above YES / NO
    else { L = Math.max(12, Math.round(W * 0.025)); R = W - L; T = narrow ? 44 : 58; B = H - Math.max(10, Math.round(H * 0.03)); }
    pw = Math.round(Math.max(240, Math.min(R - L, 1240))); ph = Math.round(Math.max(220, Math.min(B - T, 700)));
    px = Math.round(L + (R - L - pw) / 2); py = Math.round(T + Math.max(0, (B - T - ph) * 0.35));
    k1 = clamp(Math.min(pw / 1100, ph / 620), 0.6, 1.12);
    pad = Math.round(clamp(18 * k1, 9, 20));
    insR = 0;
    hdrH = Math.round(clamp(50 * k1, 32, 56));
    stripY = py + hdrH + Math.round(6 * k1); stripH = Math.round(clamp(34 * k1, 24, 38));
    const sx0 = px + pad, sw0 = pw - 2 * pad, sg = Math.max(3, Math.round(5 * k1)), avail = sw0 - sg * 6;
    let x = sx0, minPill = 1e9;
    for (let i = 0; i < 7; i++) { const w = avail * (0.55 / 7 + 0.45 * SEC_BARS[i] / 44); SX[i] = x; SW[i] = w; x += w + sg; if (w < minPill) minPill = w; }
    bbH = Math.round(clamp((narrow ? 78 : 58) * k1, 50, 74)); bbY = py + ph - pad - bbH;
    gx = px + pad; gw = pw - 2 * pad; gy = stripY + stripH + Math.round(12 * k1); gh = bbY - Math.round(8 * k1) - gy;
    // the step grid: 16 columns in four groups, or two lines of 8 per lane when it's narrow
    hw = Math.round(clamp(gw * 0.14, 76, 176));
    const hgap = Math.round(clamp(10 * k1, 5, 12)), gb = Math.round(clamp(8 * k1, 3, 10));
    cg = Math.max(2, Math.round(4 * k1));
    cw = Math.floor((gw - hw - hgap - 3 * gb) / 16); wrap = cw < 26;
    if (wrap) { hw = Math.round(clamp(gw * 0.22, 64, 100)); cw = Math.min(64, Math.floor((gw - hw - hgap - gb) / 8)); cpl = 8; } else { cw = Math.min(66, cw); cpl = 16; }
    numH = !wrap && gh > 5 * 32 + 20 ? Math.round(clamp(16 * k1, 12, 18)) : 0;
    if (wrap) { subH = Math.floor(clamp((gh - 5 * 6) / 10, 18, 44)); laneH = 2 * subH + 6; cellH = subH - 3; headH = 2 * subH - 3; }
    else { laneH = Math.floor(clamp((gh - numH) / 5, 22, 72)); cellH = laneH - Math.max(3, Math.round(7 * k1)); headH = cellH; }
    const totW = hw + hgap + cpl * cw + (wrap ? 1 : 3) * gb, totH = numH + 5 * laneH;
    gx0 = Math.round(gx + Math.max(0, (gw - totW) / 2)); cx0 = gx0 + hw + hgap;
    const gy0 = Math.round(gy + Math.max(0, (gh - totH) / 2));
    for (let s = 0; s < 16; s++) { const c = s % cpl; CX[s] = c * cw + Math.floor(c / 4) * gb; CY[s] = wrap ? Math.floor(s / cpl) * subH : 0; }
    for (let r = 0; r < 5; r++) RY[r] = gy0 + numH + r * laneH;
    // the bridge view: the feature slot + the takes
    const n = TK.length;
    if (gw >= 560 && !portrait) { slw = Math.round(gw * 0.42); slx = gx + gw - slw; sly = gy; slh = gh; chipGrid(n, gx, gy, gw - slw - 18, gh, BCX, BCY, Math.max(150, 168 * k1), 54); }   // the takes left (clear of the barks), the slot right
    else { slx = gx; sly = gy; slw = gw; slh = Math.round(clamp(gh * 0.4, 96, 190)); chipGrid(n, gx, gy + slh + 10, gw, gh - slh - 10, BCX, BCY, 132, 46); }
    bcCols = CG[0]; bcw = CG[1]; bch = CG[2];
    // the sample list for a lane (a SafeSense sheet over the grid)
    shw = Math.round(Math.min(gw - 8, 860)); shh = Math.round(gh - 4); shx = Math.round(gx + (gw - shw) / 2); shy = gy + 2;
    const tH = Math.round(clamp(40 * k1, 30, 44));
    cls = Math.round(clamp(28 * k1, 24, 30)); clx = shx + shw - cls - 10; cly = shy + (tH - cls) / 2 + 2;
    chipGrid(n + 1, shx + 14, shy + tH + 6, shw - 28, shh - tH - 18, PCX, PCY, narrow ? 120 : Math.max(150, 176 * k1), 50);
    pcCols = CG[0]; pcw = CG[1]; pch = CG[2];
    // fonts
    const fz2 = (v, a, b) => Math.round(clamp(v * k1, a, b)) + 'px ';
    fLogo = '600 ' + fz2(28, 19, 30) + TF; fTitle = 'bold ' + fz2(12, 10, 13) + F; fSub = fz2(11, 9, 12) + F; fClock = 'bold ' + fz2(17, 13, 18) + F;
    fStrip = 'bold ' + Math.round(clamp(Math.min(12 * k1, minPill / 4.4), 8, 13)) + 'px ' + F;
    fLane = 'bold ' + fz2(10, 8, 11) + F; fTake = 'bold ' + fz2(13, 10, 14) + F; fCell = 'bold ' + Math.round(clamp(cw * 0.26, 8, 12)) + 'px ' + MONO;
    fNum = fz2(10, 8, 11) + MONO; fNote = 'bold ' + Math.round(clamp(cw * 0.3, 8, 13)) + 'px ' + F; fBtn = 'bold ' + fz2(14, 11, 15) + F;
    fHint = fz2(13, 10, 14) + F; fChip = 'bold ' + fz2(13, 10, 14) + F; fBig = 'bold ' + fz2(22, 15, 24) + F; fSm = fz2(11, 9, 12) + F; fPickT = 'bold ' + fz2(14, 11, 15) + F;
    ctx.font = fClock; clkW = ctx.measureText('12:59 am').width;
    fJump = 'bold ' + Math.round(clamp(58 * k1, 34, 64)) + 'px ' + TF; ctx.font = fJump; jumpW = ctx.measureText('3:52 am').width;
    ctx.font = fSm; monW = ctx.measureText('MONITOR').width; monTxtW = ctx.measureText(MON_TXT).width;
    ctx.font = fTake; bmW = ctx.measureText('Bm').width;
    ctx.font = fHint; secW = ctx.measureText('VERSE 2  ').width; timeW = ctx.measureText('0:00 ').width;
    PB_OF = '/ ' + MMSS[Math.round(pbDur)];
    // the bottom bar: a hint, then the buttons (right-aligned, or centred under the hint when narrow)
    BH = Math.round(clamp(40 * k1, 34, 46));
    ctx.font = fBtn;
    const bpad = Math.round(clamp(26 * k1, 16, 30)), bgap = Math.round(clamp(12 * k1, 8, 14));
    for (let c = 0; c < 3; c++) {
      let tot = 0;
      for (let i = 0; i < BN[c]; i++) { let w = ctx.measureText(BTN_T[c][i]).width + 2 * bpad; if (c === 0 && i === 0) w = Math.max(w, ctx.measureText(STOP_T).width + 2 * bpad); w = Math.max(w, c === 2 ? 190 * k1 : 120 * k1); BWD[c][i] = Math.round(w); tot += w + (i ? bgap : 0); }
      if (narrow && tot > pw - 2 * pad) { const k = (pw - 2 * pad - bgap * (BN[c] - 1)) / (tot - bgap * (BN[c] - 1)); tot = 0; for (let i = 0; i < BN[c]; i++) { BWD[c][i] = Math.floor(BWD[c][i] * k); tot += BWD[c][i] + (i ? bgap : 0); } }
      let bx = narrow ? Math.round(px + (pw - tot) / 2) : Math.round(px + pw - pad - tot);
      for (let i = 0; i < BN[c]; i++) { BX[c][i] = bx; bx += BWD[c][i] + bgap; }
    }
    BY = narrow ? bbY + bbH - BH : Math.round(bbY + (bbH - BH) / 2);
    hintX = px + pad + 2; hintY = narrow ? bbY + Math.round(10 * k1) : bbY + bbH / 2; hintW = narrow ? pw - 2 * pad : Math.max(120, BX[2][0] - hintX - 16);
    help = HELP[sch] || HELP.kb; dropTxt = DROP_TXT[sch] || DROP_TXT.kb;
    // gradients
    vigG = ctx.createRadialGradient(W / 2, H * 0.52, Math.min(W, H) * 0.2, W / 2, H * 0.52, Math.max(W, H) * 0.75);
    vigG.addColorStop(0, 'rgba(3,6,14,0.22)'); vigG.addColorStop(1, 'rgba(3,6,14,0.68)');
    selG = ctx.createLinearGradient(0, stripY, 0, stripY + stripH); selG.addColorStop(0, '#66b6ff'); selG.addColorStop(1, '#2f86e0');
    btnG = ctx.createLinearGradient(0, BY, 0, BY + BH); btnG.addColorStop(0, '#66b6ff'); btnG.addColorStop(1, '#2f86e0');
    offG = ctx.createLinearGradient(0, BY, 0, BY + BH); offG.addColorStop(0, 'rgba(191,230,255,0.16)'); offG.addColorStop(1, 'rgba(191,230,255,0.08)');
    paintPanel();
  }
  function paintPanel() { // the static glass: body, sheen, header (logo + titles); everything else is drawn live
    const s = ov.canvas.width / W, w = pw + SH * 2, h = ph + SH * 2;
    if (!bgC) bgC = document.createElement('canvas');
    bgC.width = Math.max(1, Math.round(w * s)); bgC.height = Math.max(1, Math.round(h * s));
    const c = bgC.getContext('2d');
    c.setTransform(s, 0, 0, s, 0, 0); c.clearRect(0, 0, w, h);
    const ox = SH, oy = SH, R0 = Math.round(clamp(24 * k1, 14, 26));
    c.save(); c.shadowColor = 'rgba(95,178,255,0.42)'; c.shadowBlur = 28;
    let g = c.createLinearGradient(0, oy, 0, oy + ph); g.addColorStop(0, 'rgba(22,40,72,0.9)'); g.addColorStop(1, 'rgba(7,13,28,0.93)');
    c.fillStyle = g; rr(c, ox, oy, pw, ph, R0); c.fill(); c.restore();
    c.save(); rr(c, ox, oy, pw, ph, R0); c.clip();
    g = c.createLinearGradient(ox, oy, ox + pw * 0.55, oy + ph * 0.8); g.addColorStop(0, 'rgba(255,255,255,0.09)'); g.addColorStop(0.5, 'rgba(255,255,255,0.02)'); g.addColorStop(0.51, 'rgba(255,255,255,0)');
    c.fillStyle = g; c.fillRect(ox, oy, pw, ph);
    g = c.createLinearGradient(0, oy, 0, oy + hdrH); g.addColorStop(0, 'rgba(143,208,255,0.12)'); g.addColorStop(1, 'rgba(143,208,255,0.02)');
    c.fillStyle = g; c.fillRect(ox, oy, pw, hdrH);
    c.fillStyle = 'rgba(191,230,255,0.16)'; c.fillRect(ox + pad, oy + hdrH - 1, pw - 2 * pad, 1);
    c.fillStyle = 'rgba(191,230,255,0.1)'; c.fillRect(ox + pad, oy + (bbY - py) - Math.round(5 * k1), pw - 2 * pad, 1);
    c.restore();
    c.lineWidth = 1.3; c.strokeStyle = 'rgba(191,230,255,0.55)'; rr(c, ox + 0.5, oy + 0.5, pw - 1, ph - 1, R0); c.stroke();
    c.lineWidth = 1; c.strokeStyle = 'rgba(191,230,255,0.1)'; rr(c, ox + 4, oy + 4, pw - 8, ph - 8, R0 - 3); c.stroke();
    // 'two' in the logo style (lowercase white, a 2 px Yes-yellow underline), SEQUENCER, the file
    const ty = oy + hdrH / 2, lx = ox + pad + 2;
    c.textBaseline = 'middle'; c.textAlign = 'left'; c.font = fLogo; c.fillStyle = '#ffffff';
    const tw = c.measureText('two').width;
    c.fillText('two', lx, ty - 2);
    c.fillStyle = YES; c.fillRect(lx + 1, ty + Math.round(clamp(12 * k1, 8, 14)), Math.round(tw - 2), 2);
    const sx = lx + tw + Math.round(16 * k1);
    c.fillStyle = 'rgba(191,230,255,0.3)'; c.fillRect(sx - Math.round(8 * k1), ty - Math.round(12 * k1), 1, Math.round(24 * k1));
    c.font = fTitle; c.fillStyle = ICE; c.fillText('SEQUENCER', sx, narrow ? ty : ty - Math.round(7 * k1));
    if (!narrow) { c.font = fSub; c.fillStyle = DIM; c.fillText('two_v2848  ·  92 BPM  ·  B MINOR', sx, ty + Math.round(8 * k1)); }
  }
  function size() { if (W !== innerWidth || H !== innerHeight || sch !== api.input.scheme) layout(); }

  // ---------------------------------------------------------- hit tests (pointer, CSS px); hR / hC out
  let hR = 0, hC = 0;
  function hitStrip(x, y) { if (y < stripY || y > stripY + stripH) return -1; for (let i = 0; i < 7; i++) if (x >= SX[i] && x <= SX[i] + SW[i]) return i; return -1; }
  function hitGrid(x, y) {
    for (let r = 0; r < 5; r++) {
      const y0 = RY[r];
      if (y < y0 || y >= y0 + laneH) continue;
      if (x >= gx0 && x < gx0 + hw && y < y0 + headH + 3) { hR = r; hC = -1; return true; }
      for (let s = 0; s < 16; s++) { const cx = cx0 + CX[s], cy = y0 + CY[s]; if (x >= cx && x < cx + cw && y >= cy && y < cy + (wrap ? subH : laneH)) { hR = r; hC = s; return true; } }
    }
    return false;
  }
  function hitChip(x, y) { for (let i = 0; i < TK.length; i++) if (x >= BCX[i] && x < BCX[i] + bcw && y >= BCY[i] && y < BCY[i] + bch) return i; return -1; }
  function hitPick(x, y) { for (let i = 0; i <= TK.length; i++) if (x >= PCX[i] && x < PCX[i] + pcw && y >= PCY[i] && y < PCY[i] + pch) return i; return -1; }
  const inSlot = (x, y) => x >= slx && x <= slx + slw && y >= sly && y <= sly + slh;
  const inSheet = (x, y) => x >= shx && x <= shx + shw && y >= shy && y <= shy + shh;
  const inClose = (x, y) => x >= clx - 4 && x <= clx + cls + 4 && y >= cly - 4 && y <= cly + cls + 4;
  const cfg = () => (phase === 'edit' ? 0 : phase === 'playback' ? 1 : phase === 'choice' ? 2 : -1);
  function hitBtn(x, y) { const c = cfg(); if (c < 0 || y < BY || y > BY + BH) return -1; for (let i = 0; i < BN[c]; i++) if (x >= BX[c][i] && x <= BX[c][i] + BWD[c][i]) return i; return -1; }

  // ---------------------------------------------------------- set hooks, shots
  function propCall(name, fn, a, b) {
    const w = api && api.world, pr = w && w.prop ? w.prop(name) : null, u = pr && pr.userData;
    if (u && typeof u[fn] === 'function') { try { u[fn](a, b); } catch (e) { /* the set's business */ } }
  }
  function shotOf(k) {
    const S = p.shots || {}, w = api.world;
    if (k in S) return S[k] || null;
    if (k === 'c40') return w.anchor('s210_c40_close') ? { shot: 'INSERT', at: 's210_c40_close' } : w.actor('chase40') ? { shot: 'CLOSE', on: 'chase40' } : null;
    if (k === 'clock') return w.anchor('sl_clock') ? { shot: 'INSERT', at: 'sl_clock' } : null;
    return null;
  }
  function shot(k) { const s = k === 'base' ? baseShot : shotOf(k); if (s) { try { api.cam.shot(s); } catch (e) { console.warn('TWO: sequencer shot', e); } } return !!s; }
  const fade = (v, d) => { visTo = v; visRate = 1 / Math.max(0.05, d); return wait(d); };
  function playLines(x) {
    if (typeof x === 'function') return Promise.resolve(x(api));
    if (Array.isArray(x) && x.length) return api.play(x);
    return Promise.resolve();
  }

  // ---------------------------------------------------------- sound
  const chordNow = () => { const c = SEC_CH[sec]; return c[(LKIND[sec] >= 0 ? leadBar : 0) % c.length]; };
  function hitLane(l, id) { const A = aud(); if (A && A.hit) { HO.chord = chordNow(); A.hit(id === undefined ? PAT.lanes[l] : id, l, HO); } else sfx0('tick', SO_T); }
  function startPreview(s, bars) {
    const A = aud();
    stopPreview();
    previewOn = true; previewSec = s; previewBars = bars || SEC_BARS[s]; stepSeen = false; ownClk = 0; prevT0 = tt; playRow = -1; playBar = -1;
    SEQ_O.section = s; SEQ_O.bars = bars || 0; SEQ_O.gain = p.gain ?? 1;
    if (A && A.seq) { try { A.seq.play(PAT, TK, onStep, SEQ_O); } catch (e) { console.warn('TWO: sequencer preview', e); } }
  }
  function stopPreview() {
    const A = aud();
    if (previewOn && A && A.seq) A.seq.stop();
    previewOn = false; previewSec = -1; playRow = -1; playBar = -1;
  }
  function flash(m) { msg = m; msgT = 2.4; }

  // ---------------------------------------------------------- edits
  function setSec(s) {
    s = clamp(s, 0, 6);
    if (s === sec) return;
    sec = s; fs = s; leadBar = 0;
    if (pick >= 0) closePicker(true);
    if (fz === Z_GRID && s === BRIDGE) { fz = Z_CHIPS; fk = clamp(fk, 0, TK.length - 1); }
    else if (fz === Z_CHIPS && s !== BRIDGE) { fz = Z_GRID; fr = 0; }
    if (previewOn) startPreview(s, s === BRIDGE ? 4 : 0);
    sfx0('tick', SO_T);
  }
  function cellPress(r, c) {
    if (r < 4) {
      const on = (PAT.steps[r][c] = !PAT.steps[r][c]);
      FL[r * 16 + c] = 1;
      if (LG[sec][r] === 0) flash(4);
      if (on && !previewOn) hitLane(r); else sfx0('tick', SO_T);
      return;
    }
    const k = LKIND[sec], row = leadRow(sec, leadBar), n = row ? row.cov[c] : -1;
    if (n < 0) { sfx0('tick', SO_SOFT); return; }
    if (k === 2) { sfx0('clunk', SO_CLUNK); flash(2); return; }
    const j = (leadBar & 3) * 16 + row.st[n], on = (PAT.lead[j] = !PAT.lead[j]);
    for (let s = row.st[n]; s < row.st[n] + row.ln[n] && s < 16; s++) FL[64 + s] = 1;
    const A = aud();
    if (on && !previewOn && A && A.note) A.note(row.mi[n], NO_); else sfx0('tick', SO_T);
  }
  function headerPress(r, x) {
    if (r < 4) { openPicker(r); return; }
    if (LKIND[sec] < 0) { sfx0('tick', SO_SOFT); return; }
    leadBar = (leadBar + (x != null && x < gx0 + hw * 0.45 ? 3 : 1)) & 3;
    sfx0('tick', SO_T);
  }
  function openPicker(l) {
    pick = l; fz = Z_PICK;
    let i = PAT.lanes[l] ? TK.indexOf(PAT.lanes[l]) : -1;
    if (i < 0) { i = 0; while (i < TK.length && PAT.lanes.includes(TK[i])) i++; }   // an empty lane: the first sample no lane has yet
    fp = i;
    sfx0('pop', SO_POP);
  }
  function closePicker(silent) { const l = pick; pick = -1; fz = Z_GRID; fr = Math.max(0, l); fc = -1; if (!silent) sfx0('tick', SO_T); }
  function assign(l, i) { // i: a take, or -1 = the synth bleep; a take already in another lane swaps places with this one
    const id = i >= 0 ? TK[i] : null, was = PAT.lanes[l];
    if (id) for (let k = 0; k < 4; k++) if (k !== l && PAT.lanes[k] === id) PAT.lanes[k] = was;
    PAT.lanes[l] = id;
    for (let s = 0; s < 16; s++) if (PAT.steps[l][s]) FL[l * 16 + s] = 0.8;
    hitLane(l, id);
    testLog('sequencer: lane ' + l + ' ' + (id || 'bleep'));
    if (typeof emit === 'function') emit('sequencer:lane', { lane: l, id });
  }
  function pickPress(i) { const l = pick; if (l < 0) return; assign(l, i < TK.length ? i : -1); closePicker(true); }
  function audition(i, byHim) {
    if (locked || i < 0 || i >= TK.length || phase === 'beat') return;
    const id = TK[i];
    slotI = i; slotT = 0;
    if (!HEARD[i]) { HEARD[i] = 1; AUD.push(id); }
    PAT.bridge = id;
    startPreview(BRIDGE, 4);   // the bridge from its first bar: the feature hits at once
    const A = aud();
    if (!(A && A.seq) && A && A.playSample) A.playSample(id, NO_);
    testLog('sequencer: audition ' + id);
    if (typeof emit === 'function') emit('sequencer:audition', id);
    if (id === 'laugh') { laughTried = true; dragged = !!byHim; fineT = 0; bridgeBeat(!!byHim); }
    else fineT = 1.5;
  }
  function fine() { if (typeof bark === 'function' && !locked) bark('chase40', FINE[fineI++ % 3]); }

  // ---------------------------------------------------------- the scripted parts (async; every await re-checks `run`)
  function beatSteps() {
    return [
      { do: () => { shot('c40'); } },
      { say: 'chase40', text: L_BRIDGE, tag: 'barely', speed: 'slow', expr: 'tearful' },
      { do: () => { stopPreview(); propCall('headphones_desk', 'show', true); } },   // he puts the headphones down; the monitor stops
      { wait: TEST.auto ? 0.4 : 1.6 },
    ];
  }
  async function bridgeBeat(byHim) {
    const id = run;
    phase = 'beat'; fineT = 0; pick = -1; paintOn = false; cdI = -1;
    testLog('sequencer: the bridge ' + (byHim ? '(Chase (2040) dragged it in)' : '(found)'));
    await wait(TEST.auto ? 0.6 : 1.9);   // the laugh plays inside the bridge first
    if (id !== run) return;
    const h = p.onBridge;
    if (h !== false) {
      await fade(0, 0.45); if (id !== run) return;
      try { if (typeof h === 'function') await h(api, { dragged: !!byHim }); else await playLines(Array.isArray(h) ? h : beatSteps()); } catch (e) { console.error('TWO: sequencer bridge beat', e); }
      if (id !== run) return;
    }
    stopPreview();
    locked = true; PAT.bridge = 'laugh'; slotI = laughI; slotT = 0; lockT = 0;
    testLog('sequencer: bridge locked (laugh)');
    if (typeof emit === 'function') emit('sequencer:bridge', { dragged: !!byHim });
    shot('base');
    sfx0('ss_chirp', SO_CHIRP);
    phase = 'edit'; fz = Z_BTN; fb = 1; hold = 0.3;
    await fade(1, 0.5);
  }
  function chaseDrag() { // 60 s and the laugh never tried: Chase (2040) reaches over and drags it in himself
    if (phase !== 'edit' || locked || laughTried || laughI < 0) return;
    if (pick >= 0) closePicker(true);
    paintOn = false; cdI = -1; fidStop();
    stopPreview(); setSec(BRIDGE);
    fz = Z_CHIPS; fk = laughI;
    phase = 'drag'; hand = true; handT = 0; handA = 0; handCarry = -1; handX = px + pw - 40; handY = py - 30;
    testLog('sequencer: Chase (2040) reaches over');
  }
  function handTick(dt) {
    handT += dt;
    const x0 = px + pw - 40, y0 = py - 30, cxm = BCX[laughI] + bcw * 0.5, cym = BCY[laughI] + bch * 0.5, tx = slx + slw * 0.5, ty = sly + slh * 0.4;
    handA = Math.min(1, handT * 4);
    if (handT < 1.0) { const u = ease(handT / 1.0); handX = x0 + (cxm - x0) * u; handY = y0 + (cym - y0) * u; }
    else if (handT < 1.35) { handX = cxm; handY = cym - (handT - 1.0) * 24; handCarry = laughI; }
    else if (handT < 2.3) { const u = ease((handT - 1.35) / 0.95); handX = cxm + (tx - cxm) * u; handY = cym - 8.4 + (ty - cym + 8.4) * u; }
    else if (handCarry >= 0) { handCarry = -1; phase = 'edit'; audition(laughI, true); }
    else { const u = Math.min(1, (handT - 2.3) / 0.6); handX = tx + (x0 - tx) * ease(u); handY = ty + (y0 - ty) * ease(u); handA = 1 - u; if (u >= 1) hand = false; }
  }
  function playBack() {
    if (!locked) { sfx0('clunk', SO_CLUNK); flash(1); return; }
    stopPreview();
    phase = 'playback'; pbT = 0; pbShow = 0; fz = Z_BTN; fb = 0; hold = 0.3;
    sec = fs = 1; leadBar = 0;
    const A = aud();
    song = A && A.song ? A.song({ pattern: PAT, samples: TK, from: 1, to: 2, muffled: true, gain: p.gain ?? 1 }) : null;
    pbDur = (SEC_BARS[1] + SEC_BARS[2]) * BAR;
    propCall('foh_desk', 'state', 'live'); deskLive = true;
    sfx0('ss_chirp', SO_CHIRP);
    testLog('sequencer: playback (verse + chorus, muffled)');
    if (typeof emit === 'function') emit('sequencer:playback', true);
  }
  function playbackTick(dt) {
    pbT += dt;
    let t = pbT, ended = false;
    if (song) { if (song.start >= 0) { t = song.t; if (song.stopped) ended = true; } else if (!song.stopped) t = 0; }
    if (t > pbDur) t = pbDur;
    pbShow = t;
    const bar = Math.min(15, Math.floor(t / BAR)), s = bar < 8 ? 1 : 2;
    if (sec !== s) { sec = fs = s; }
    playRow = Math.floor(t / STEP) & 15; playBar = SEC_FIRST[1] + bar;
    if ((auto && pbT >= 2.6) || ended || pbT >= pbDur + 0.6) endPlayback();
  }
  function endPlayback() {
    if (phase !== 'playback') return;
    if (song) { song.stop(0.8); song = null; }
    playRow = -1; playBar = -1;
    if (deskLive) { propCall('foh_desk', 'state', 'half'); deskLive = false; }
    if (typeof emit === 'function') emit('sequencer:playback', false);
    phase = 'choice'; fz = Z_BTN; fb = greyed ? 1 : 0; hold = 0.3;
  }
  function parseClock(s) { const m = /^(\d{1,2}):(\d\d)/.exec(String(s || '')); return m ? clamp((+m[1] - h0) * 60 + +m[2], 0, 119) : clkTo; }
  async function jump(str) {
    const id = run, m = parseClock(str), cut = shotOf('clock');
    sfx0('whoosh', SO_WH);
    if (cut) { await fade(0, 0.3); if (id !== run) return; shot('clock'); }
    clkTo = m; clkJump = cut ? 0 : 1;
    propCall('wall_clock_sl', 'set', h0 + Math.floor(m / 60), m % 60);
    if (cut && typeof ui !== 'undefined' && ui.timeCard) ui.timeCard(TIMES[m], p.place || '', TEST.auto ? 1.0 : 1.7);
    await wait(cut ? (TEST.auto ? 1.0 : 1.5) : TEST.auto ? 0.5 : 1.3); if (id !== run) return;
    if (cut) { shot('base'); await fade(1, 0.3); }
  }
  async function onePass() {
    const id = run, n = ++passes;
    phase = 'pass'; fz = Z_BTN;
    testLog('sequencer: one more pass ' + n);
    if (typeof emit === 'function') emit('sequencer:pass', n);
    sec = fs = 1; leadBar = 0;
    startPreview(1, 0);                        // the same verse, round again: nothing audible changes
    fidOn = true; fidT = 0; fidK = 0; gxp = cx0 + CX[0]; gyp = RY[0];
    await wait(TEST.auto ? 0.5 : 1.6); if (id !== run) return;
    const jumps = (Array.isArray(p.clock) ? p.clock : CLOCK_DEF)[n - 1] || [];
    for (let j = 0; j < jumps.length; j++) {
      await jump(jumps[j]); if (id !== run) return;
      await wait(TEST.auto ? 0.3 : 0.9); if (id !== run) return;
    }
    fidStop();
    if (n >= 2) { // his hand flat on the desk
      await fade(0, 0.4); if (id !== run) return;
      const stopSteps = [{ do: () => { stopPreview(); sfx0('thud', SO_THUD); } }];
      for (const [who, text] of L_STOP) stopSteps.push({ say: who, text });
      try { await (p.lines && p.lines.stop ? (stopPreview(), playLines(p.lines.stop)) : api.play(stopSteps)); } catch (e) { console.error('TWO: sequencer lines', e); }
      if (id !== run) return;
      greyed = true;                           // ONE MORE PASS greys out: only IT'S DONE remains
      shot('base');
      phase = 'choice'; fz = Z_BTN; fb = 1; hold = 0.3;
      await fade(1, 0.45);
      return;
    }
    stopPreview();
    phase = 'choice'; fz = Z_BTN; fb = 0; hold = 0.3;
  }
  async function itsDone() {
    const id = run;
    phase = 'done'; stopPreview(); fidStop();
    testLog('sequencer: it’s done' + (passes ? ' (after ' + passes + ')' : ' (first time)'));
    await fade(0, 0.45); if (id !== run) return;
    if (!passes) {
      const q = [];
      for (const [who, text, expr] of L_QUICK) q.push(expr ? { say: who, text, expr } : { say: who, text });
      try { await (p.lines && p.lines.quick ? playLines(p.lines.quick) : api.play(q)); } catch (e) { console.error('TWO: sequencer lines', e); }
      if (id !== run) return;
    }
    finishGame();
  }
  function heardList() { return AUD.slice(); }
  function result(extra) {
    const pat = store();
    const r = { ok: true, pattern: pat, lanes: pat.lanes.slice(), passes, quick: passes === 0 && !(extra && extra.skipped), stopped: greyed, dragged, auditioned: heardList(), time: TIMES[Math.round(clkTo)] };
    if (auto) r.auto = true;
    return r;
  }
  function finishGame() {
    if (done) return;
    const r = result();
    testLog('sequencer: done · lanes ' + r.lanes.map((x) => x || 'bleep').join(' ') + ' · passes ' + passes + (dragged ? ' · dragged' : ''));
    if (typeof emit === 'function') emit('sequencer:done', r);
    api.finish(r);
  }

  // ---------------------------------------------------------- per tick
  function fiddleTick(dt) { // Chase fiddles: a cell flips and flips back, round the verse
    fidT += dt;
    if (fidK === 0) {
      fidSeed = (fidSeed * 16807) % 2147483647; fidL = fidSeed % 4;
      fidSeed = (fidSeed * 16807) % 2147483647; fidS = fidSeed % 16;
      fidK = 1;
    }
    const tx = cx0 + CX[fidS] + cw * 0.5, ty = RY[fidL] + CY[fidS] + cellH * 0.5, k = Math.min(1, dt * 12);
    gxp += (tx - gxp) * k; gyp += (ty - gyp) * k;
    if (fidK === 1 && fidT >= 0.22) { PAT.steps[fidL][fidS] = !PAT.steps[fidL][fidS]; FL[fidL * 16 + fidS] = 1; sfx0('tick', SO_SOFT); fidK = 2; }
    if (fidK === 2 && fidT >= 0.4) { PAT.steps[fidL][fidS] = !PAT.steps[fidL][fidS]; FL[fidL * 16 + fidS] = 0.6; fidK = 0; fidT = 0; }
  }
  function fidStop() { // never leave a cell flipped: nothing changes
    if (fidOn && fidK === 2) PAT.steps[fidL][fidS] = !PAT.steps[fidL][fidS];
    fidOn = false; fidK = 0;
  }
  function clockTick(dt) {
    if (clkM < clkTo) clkM = Math.min(clkTo, clkM + dt * Math.max(14, (clkTo - clkM) * 2.4));
    if (clkJump > 0) clkJump = Math.max(0, clkJump - dt * 0.8);
    const m = Math.floor(clkM);
    if (m !== clkShown) { clkShown = m; if (q0 >= 0 && typeof hud !== 'undefined' && hud.quiet) hud.quiet(Math.max(0, q0 - m * 60)); }
  }
  function handleInput() {
    const I = api.input, P = I.pointer, no = I.pressed('no');
    if (P.x !== lpx || P.y !== lpy) { lpx = P.x; lpy = P.y; hover(P.x, P.y); }
    if (paintOn) { if (P.down) paintAt(P.x, P.y); else paintOn = false; }
    if (cdI >= 0) { const dx = P.x - cdX, dy = P.y - cdY; if (dx * dx + dy * dy > 64) cdMoved = true; if (!P.down) dropChip(P.x, P.y); }
    if (P.pressed) { if (no) onNo(); else press(P.x, P.y); return; }
    if (no) { onNo(); return; }
    if (phase === 'edit' && pick < 0) { if (I.pressed('swap')) { setSec(sec + 1); return; } if (I.pressed('chip')) { setSec(sec - 1); return; } }
    const dx = I.pressed('left') ? -1 : I.pressed('right') ? 1 : 0, dy = I.pressed('up') ? -1 : I.pressed('down') ? 1 : 0;
    if (dx || dy) nav(dx, dy);
    if (I.pressed('yes')) activate();
  }
  function hover(x, y) {
    if (pick >= 0) { const i = hitPick(x, y); if (i >= 0) fp = i; return; }
    if (phase === 'edit') {
      const si = hitStrip(x, y); if (si >= 0) { fz = Z_STRIP; fs = si; return; }
      if (sec === BRIDGE) { const ci = hitChip(x, y); if (ci >= 0) { fz = Z_CHIPS; fk = ci; return; } }
      else if (hitGrid(x, y)) { fz = Z_GRID; fr = hR; fc = hC; return; }
    }
    const b = hitBtn(x, y); if (b >= 0) { fz = Z_BTN; fb = b; }
  }
  function press(x, y) {
    if (pick >= 0) { const i = hitPick(x, y); if (i >= 0) { fp = i; pickPress(i); } else if (inClose(x, y) || !inSheet(x, y)) closePicker(); return; }
    if (phase === 'edit') {
      const si = hitStrip(x, y); if (si >= 0) { fz = Z_STRIP; fs = si; setSec(si); return; }
      if (sec === BRIDGE) {
        const ci = hitChip(x, y);
        if (ci >= 0) { fz = Z_CHIPS; fk = ci; if (locked) { sfx0('tick', SO_SOFT); flash(3); } else { cdI = ci; cdX = x; cdY = y; cdMoved = false; } return; }
      } else if (hitGrid(x, y)) {
        fz = Z_GRID; fr = hR; fc = hC;
        if (hC < 0) headerPress(hR, x);
        else { cellPress(hR, hC); if (hR < 4) { paintOn = true; paintLane = hR; paintVal = PAT.steps[hR][hC]; } }
        return;
      }
    }
    const b = hitBtn(x, y); if (b >= 0) { fz = Z_BTN; fb = b; buttonPress(b); }
  }
  function paintAt(x, y) {
    if (!hitGrid(x, y) || hR !== paintLane || hC < 0) return;
    if (PAT.steps[hR][hC] !== paintVal) { PAT.steps[hR][hC] = paintVal; FL[hR * 16 + hC] = 1; if (paintVal && !previewOn) hitLane(hR); else sfx0('tick', SO_SOFT); }
  }
  function dropChip(x, y) {
    const i = cdI; cdI = -1;
    if (phase !== 'edit') return;
    if (cdMoved ? inSlot(x, y) : hitChip(x, y) === i) audition(i);
  }
  function onNo() {
    if (pick >= 0) { closePicker(); return; }
    if (phase === 'edit') { buttonPress(0); return; }
    if (phase === 'playback') buttonPress(0);
  }
  function buttonPress(b) {
    const c = cfg();
    if (c === 0) { if (b === 0) { if (previewOn) stopPreview(); else startPreview(sec, sec === BRIDGE ? 4 : 0); sfx0('tick', SO_T); } else playBack(); }
    else if (c === 1) { if (pbT > 0.8) endPlayback(); }
    else if (c === 2) { if (b === 0) { if (greyed) sfx0('clunk', SO_CLUNK); else { sfx0('tick', SO_T); onePass(); } } else { sfx0('ss_chirp', SO_CHIRP); itsDone(); } }
  }
  function nav(dx, dy) {
    if (fz === Z_PICK) { const n = TK.length + 1; let i = fp + dx + dy * pcCols; if (i < 0 || i >= n) i = dy ? fp : clamp(i, 0, n - 1); fp = i; return; }
    if (phase !== 'edit') { const c = cfg(); if (c >= 0 && dx) fb = clamp(fb + dx, 0, BN[c] - 1); fz = Z_BTN; return; }
    if (fz === Z_STRIP) {
      if (dx) setSec(clamp(sec + dx, 0, 6));
      else if (dy > 0) { if (sec === BRIDGE) fz = Z_CHIPS; else { fz = Z_GRID; fr = 0; } }
    } else if (fz === Z_GRID) {
      if (dx) fc = clamp(fc + dx, -1, 15);
      if (dy < 0) { if (fr === 0) { fz = Z_STRIP; fs = sec; } else fr--; }
      else if (dy > 0) { if (fr === 4) fz = Z_BTN; else fr++; }
    } else if (fz === Z_CHIPS) {
      const c = bcCols, n = TK.length;
      if (dx) fk = clamp(fk + dx, 0, n - 1);
      if (dy < 0) { if (fk - c < 0) { fz = Z_STRIP; fs = sec; } else fk -= c; }
      else if (dy > 0) { if (fk + c < n) fk += c; else if (Math.floor(fk / c) < Math.floor((n - 1) / c)) fk = n - 1; else fz = Z_BTN; }
    } else if (fz === Z_BTN) {
      if (dx) fb = clamp(fb + dx, 0, 1);
      if (dy < 0) { if (sec === BRIDGE) fz = Z_CHIPS; else { fz = Z_GRID; fr = 4; } }
    }
  }
  function activate() {
    if (fz === Z_PICK) { pickPress(fp); return; }
    if (phase !== 'edit') { buttonPress(fb); return; }
    if (fz === Z_STRIP) { setSec(fs); if (sec === BRIDGE) fz = Z_CHIPS; else { fz = Z_GRID; fr = 0; } return; }
    if (fz === Z_GRID) { if (fc < 0) headerPress(fr, null); else cellPress(fr, fc); return; }
    if (fz === Z_CHIPS) { if (locked) { sfx0('tick', SO_SOFT); flash(3); } else audition(fk); return; }
    buttonPress(fb);
  }

  // ---------------------------------------------------------- draw
  function ring(x, y, w, h, r, col) {
    ctx.lineWidth = 2; ctx.strokeStyle = '#ffffff'; rr(ctx, x - 3, y - 3, w + 6, h + 6, r + 3); ctx.stroke();
    ctx.lineWidth = 3; ctx.strokeStyle = col; rr(ctx, x - 6, y - 6, w + 12, h + 12, r + 6); ctx.stroke();
  }
  function wave(pk, x, y, w, h, col, n) { // a take's waveform, n bars
    if (!pk) return;
    const bw = w / n;
    ctx.fillStyle = col;
    for (let i = 0; i < n; i++) { const v = pk[Math.floor(i * pk.length / n)], hh = Math.max(1, v * h); ctx.fillRect(x + i * bw + 0.5, y - hh / 2, Math.max(1, bw - 1.2), hh); }
  }
  function lockGlyph(x, y, s, col) {
    ctx.strokeStyle = col; ctx.lineWidth = Math.max(1.4, s * 0.16);
    ctx.beginPath(); ctx.arc(x, y - s * 0.18, s * 0.28, Math.PI, 0); ctx.stroke();
    ctx.fillStyle = col; rr(ctx, x - s * 0.42, y - s * 0.2, s * 0.84, s * 0.62, s * 0.12); ctx.fill();
  }
  function drawHeader() {
    const cy = py + hdrH / 2, rx = px + pw - pad - insR;
    ctx.textAlign = 'right'; ctx.font = fClock;
    ctx.fillStyle = clkJump > 0 || clkM < clkTo ? YES : ICE;
    ctx.fillText(TIMES[Math.floor(clkM)], rx, cy);
    if (!narrow) {
      const lx = rx - clkW - Math.round(14 * k1), on = previewOn || phase === 'playback';
      ctx.font = fSm; ctx.fillStyle = on ? ICE : DIM;
      ctx.fillText(on ? 'MONITOR' : 'SLATE', lx, cy + 1);
      if (on) { ctx.fillStyle = '#ff6a5a'; ctx.globalAlpha = vis * ((tt * 2.2) % 1 < 0.6 ? 1 : 0.35); ctx.beginPath(); ctx.arc(lx - monW - 9, cy + 1, 3.5, 0, 6.2832); ctx.fill(); ctx.globalAlpha = vis; }
    }
  }
  function drawStrip() {
    const y = stripY, h = stripH, r = Math.min(h / 2, 12);
    ctx.font = fStrip; ctx.textAlign = 'center';
    for (let i = 0; i < 7; i++) {
      const x = SX[i], w = SW[i], sel = i === sec, empty = i === BRIDGE && !locked;
      const live = (previewOn && previewSec === i) || (phase === 'playback' && (i === 1 || i === 2) && playBar >= SEC_FIRST[i] && playBar < SEC_FIRST[i] + SEC_BARS[i]);
      ctx.fillStyle = sel ? selG : live ? 'rgba(143,208,255,0.16)' : 'rgba(191,230,255,0.06)';
      rr(ctx, x, y, w, h, r); ctx.fill();
      if (empty && !sel) {
        ctx.setLineDash(DASH); ctx.lineWidth = 1.5; ctx.strokeStyle = YES; ctx.globalAlpha = vis * (0.45 + 0.35 * Math.sin(tt * 3.2));
        rr(ctx, x + 0.75, y + 0.75, w - 1.5, h - 1.5, r); ctx.stroke(); ctx.setLineDash(NODASH); ctx.globalAlpha = vis;
      } else if (!sel) { ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(191,230,255,0.2)'; rr(ctx, x + 0.5, y + 0.5, w - 1, h - 1, r); ctx.stroke(); }
      ctx.fillStyle = sel ? '#ffffff' : empty ? '#ffe68a' : live ? ICE : DIM;
      ctx.fillText(SEC_LABEL[i], x + w / 2, y + h / 2 + 1, w - 6);
      if (i === BRIDGE && locked) { ctx.fillStyle = YES; ctx.beginPath(); ctx.arc(x + w - 9, y + 8, 3, 0, 6.2832); ctx.fill(); }
      if (live && playBar >= 0) { // how far through this section
        const u = clamp((playBar - SEC_FIRST[i] + (playRow + 1) / 16) / (previewOn ? previewBars : SEC_BARS[i]), 0, 1);
        ctx.fillStyle = sel ? 'rgba(255,255,255,0.85)' : SSL; ctx.fillRect(x + r * 0.6, y + h - 4, (w - r * 1.2) * u, 2);
      }
      if (fz === Z_STRIP && fs === i && pick < 0 && phase === 'edit') ring(x, y, w, h, r, 'rgba(95,178,255,0.55)');
    }
    if (phase === 'playback' || phase === 'choice' || phase === 'pass') { // the rest of the song waits for 3.6
      const x0 = SX[3], x1 = SX[6] + SW[6];
      ctx.fillStyle = 'rgba(7,13,28,0.45)'; rr(ctx, x0 - 1, y - 1, x1 - x0 + 2, h + 2, r); ctx.fill();
    }
  }
  function drawGrid() {
    const playing = playRow >= 0 && ((previewOn && previewSec === sec) || phase === 'playback'), rest = LG[sec];
    // step numbers
    if (numH) {
      ctx.font = fNum; ctx.textAlign = 'center';
      for (let s = 0; s < 16; s++) { ctx.fillStyle = s === playRow && playing ? YES : (s & 3) === 0 ? ICE : DIM2; ctx.fillText(NUMS[s], cx0 + CX[s] + cw / 2, RY[0] - numH / 2 - 1); }
    }
    // the playhead
    if (playing) {
      const x = cx0 + CX[playRow], ytop = RY[0] + CY[playRow] - 3, ybot = RY[4] + CY[playRow] + cellH + 3;
      ctx.fillStyle = 'rgba(232,244,255,0.09)';
      if (wrap) for (let r = 0; r < 5; r++) ctx.fillRect(x - 2, RY[r] + CY[playRow] - 2, cw, cellH + 4);
      else { rr(ctx, x - 2, ytop, cw, ybot - ytop, 6); ctx.fill(); }
    }
    for (let r = 0; r < 4; r++) {
      const y0 = RY[r], id = PAT.lanes[r], resting = rest[r] === 0;
      // the lane's name: its role, its sample (or the synth bleep)
      ctx.fillStyle = 'rgba(191,230,255,0.07)'; rr(ctx, gx0, y0, hw, headH, 8); ctx.fill();
      ctx.fillStyle = LANE_COL[r]; ctx.fillRect(gx0, y0 + 5, 3, headH - 10);
      ctx.textAlign = 'left'; ctx.font = fLane; ctx.fillStyle = resting ? DIM2 : DIM;
      ctx.fillText(LANE_NAME[r], gx0 + 11, y0 + headH * 0.3, hw - 30);
      ctx.font = fTake; ctx.fillStyle = id ? ICE : '#b9c8dc';
      if (wrap) { const k = id ? TK.indexOf(id) : -1; ctx.fillText(k >= 0 ? TL1[k] : 'Synth', gx0 + 11, y0 + headH * 0.56, hw - 16); ctx.fillText(k >= 0 ? TL2[k] : 'bleep', gx0 + 11, y0 + headH * 0.76, hw - 16); }
      else ctx.fillText(id ? SAMPLES[id].label : 'Synth bleep', gx0 + 11, y0 + headH * 0.68, hw - 26);
      ctx.fillStyle = DIM; ctx.beginPath(); const ax = gx0 + hw - 13, ay = wrap ? y0 + headH * 0.3 : y0 + headH * 0.5; ctx.moveTo(ax - 4, ay - 2); ctx.lineTo(ax + 4, ay - 2); ctx.lineTo(ax, ay + 3); ctx.fill();
      if (resting && !wrap && headH > 34) { ctx.font = fLane; ctx.fillStyle = DIM2; ctx.textAlign = 'right'; ctx.fillText('rests', gx0 + hw - 22, y0 + headH * 0.3); }
      if (fz === Z_GRID && fr === r && fc < 0 && pick < 0 && phase === 'edit') ring(gx0, y0, hw, headH, 8, 'rgba(95,178,255,0.55)');
      // the steps
      ctx.globalAlpha = vis * (resting ? 0.38 : 1);
      ctx.font = fCell; ctx.textAlign = 'center';
      for (let s = 0; s < 16; s++) {
        const x = cx0 + CX[s], y = y0 + CY[s], w = cw - cg, on = PAT.steps[r][s];
        if (on) {
          ctx.fillStyle = LANE_COL[r]; rr(ctx, x, y, w, cellH, 6); ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(x + 5, y + 3, w - 10, 2);
          if (playing && s === playRow && !resting) { ctx.fillStyle = 'rgba(255,255,255,0.55)'; rr(ctx, x, y, w, cellH, 6); ctx.fill(); }
          if (w >= 28 && cellH >= 18) { ctx.fillStyle = LANE_INK[r]; ctx.fillText(id ? TAGS[id] || 'SMP' : 'BLP', x + w / 2, y + cellH / 2 + 1); }
        } else {
          ctx.fillStyle = (s & 3) === 0 ? 'rgba(191,230,255,0.11)' : 'rgba(191,230,255,0.06)'; rr(ctx, x, y, w, cellH, 6); ctx.fill();
        }
        const f = FL[r * 16 + s]; if (f > 0) { const ga = ctx.globalAlpha; ctx.globalAlpha = ga * f * 0.6; ctx.fillStyle = '#ffffff'; rr(ctx, x - 1, y - 1, w + 2, cellH + 2, 7); ctx.fill(); ctx.globalAlpha = ga; }
      }
      ctx.globalAlpha = vis;
    }
    drawLead(playing);
    // the focus ring on a step
    if (fz === Z_GRID && fc >= 0 && pick < 0 && phase === 'edit') ring(cx0 + CX[fc], RY[fr] + CY[fc], cw - cg, cellH, 6, 'rgba(95,178,255,0.55)');
  }
  function drawLead(playing) {
    const y0 = RY[4], k = LKIND[sec], row = leadRow(sec, leadBar);
    ctx.fillStyle = 'rgba(255,210,31,0.08)'; rr(ctx, gx0, y0, hw, headH, 8); ctx.fill();
    ctx.fillStyle = YES; ctx.fillRect(gx0, y0 + 5, 3, headH - 10);
    ctx.textAlign = 'left'; ctx.font = fLane; ctx.fillStyle = DIM;
    ctx.fillText(k === 2 ? 'LEAD · 1987' : 'LEAD', gx0 + 11, y0 + headH * 0.3, hw - 20);
    ctx.font = fTake;
    if (k < 0) { ctx.fillStyle = DIM2; ctx.fillText('—', gx0 + 11, y0 + headH * 0.68); }
    else {
      const ch = SEC_CH[sec][leadBar & 3];
      ctx.fillStyle = ICE; ctx.fillText(ch, gx0 + 11, y0 + headH * 0.68);
      const dx = gx0 + 11 + bmW + 14, dy = y0 + headH * 0.68;
      for (let b = 0; b < 4; b++) { ctx.fillStyle = b === (leadBar & 3) ? YES : 'rgba(255,210,31,0.28)'; ctx.beginPath(); ctx.arc(dx + b * 9, dy, b === (leadBar & 3) ? 3.2 : 2.4, 0, 6.2832); ctx.fill(); }
      ctx.fillStyle = DIM; ctx.textAlign = 'right'; ctx.font = fLane; ctx.fillText('◂ ▸', gx0 + hw - 8, y0 + headH * 0.3);
    }
    if (fz === Z_GRID && fr === 4 && fc < 0 && pick < 0 && phase === 'edit') ring(gx0, y0, hw, headH, 8, 'rgba(255,210,31,0.5)');
    // the cells behind the notes
    for (let s = 0; s < 16; s++) { ctx.fillStyle = 'rgba(255,210,31,0.04)'; rr(ctx, cx0 + CX[s], y0 + CY[s], cw - cg, cellH, 6); ctx.fill(); }
    if (!row) {
      ctx.font = fSm; ctx.textAlign = 'center'; ctx.fillStyle = DIM2;
      ctx.fillText(sec === 0 ? 'no lead in the intro' : 'no lead here: the last D rings', cx0 + (CX[cpl - 1] + cw) / 2, y0 + cellH / 2 + 1);
      return;
    }
    const pb = playing && ((playBar - SEC_FIRST[sec]) & 3) === (leadBar & 3);
    ctx.font = fNote;
    for (let n = 0; n < row.n; n++) {
      const st = row.st[n], en = Math.min(16, st + row.ln[n]), on = k === 2 || PAT.lead[(leadBar & 3) * 16 + st];
      for (let a = st; a < en;) { // one pill per line (two lines when the grid wraps)
        const line = Math.floor(a / cpl), b = Math.min(en, (line + 1) * cpl);
        const x = cx0 + CX[a], w = CX[b - 1] + cw - cg - CX[a], y = y0 + CY[a];
        if (on) {
          ctx.fillStyle = k === 2 ? 'rgba(255,210,31,0.62)' : YES; rr(ctx, x, y, w, cellH, 7); ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillRect(x + 6, y + 3, w - 12, 2);
          if (pb && playRow >= a && playRow < b) { ctx.fillStyle = 'rgba(255,255,255,0.55)'; rr(ctx, x, y, w, cellH, 7); ctx.fill(); }
          if (a === st) { ctx.fillStyle = NAVY; ctx.textAlign = 'left'; ctx.fillText(row.on[n], x + 6, y + cellH / 2 + 1, w - 8); }
        } else {
          ctx.setLineDash(DASH); ctx.lineWidth = 1.4; ctx.strokeStyle = 'rgba(255,210,31,0.5)'; rr(ctx, x + 0.7, y + 0.7, w - 1.4, cellH - 1.4, 7); ctx.stroke(); ctx.setLineDash(NODASH);
          if (a === st) { ctx.fillStyle = 'rgba(255,226,140,0.6)'; ctx.textAlign = 'left'; ctx.fillText(row.off[n], x + 6, y + cellH / 2 + 1, w - 8); }
        }
        a = b;
      }
      const f = FL[64 + st]; if (f > 0) { ctx.globalAlpha = vis * f * 0.5; ctx.fillStyle = '#ffffff'; rr(ctx, cx0 + CX[st] - 1, y0 + CY[st] - 1, cw + 1, cellH + 2, 7); ctx.fill(); ctx.globalAlpha = vis; }
    }
  }
  function drawBridge() {
    const live = previewOn && previewSec === BRIDGE, has = slotI >= 0, drop = cdI >= 0 && cdMoved && inSlot(lpx, lpy);
    // the feature slot
    const r = Math.round(clamp(18 * k1, 12, 20)), s = slotT < 1 ? 0.94 + 0.06 * ease(slotT) : 1;
    ctx.fillStyle = locked ? 'rgba(255,210,31,0.08)' : drop ? 'rgba(143,208,255,0.16)' : 'rgba(191,230,255,0.05)';
    rr(ctx, slx, sly, slw, slh, r); ctx.fill();
    if (!has || drop) { ctx.setLineDash(DASH); ctx.lineWidth = 2; ctx.strokeStyle = drop ? SSL : 'rgba(191,230,255,0.45)'; rr(ctx, slx + 1, sly + 1, slw - 2, slh - 2, r); ctx.stroke(); ctx.setLineDash(NODASH); }
    else { ctx.lineWidth = locked ? 2 : 1.5; ctx.strokeStyle = locked ? YES : 'rgba(191,230,255,0.6)'; rr(ctx, slx + 1, sly + 1, slw - 2, slh - 2, r); ctx.stroke(); }
    if (locked && lockT < 1) { ctx.globalAlpha = vis * 0.8 * (1 - lockT); ctx.lineWidth = 6 * (1 - lockT); ctx.strokeStyle = '#ffe278'; rr(ctx, slx - 6 * lockT, sly - 6 * lockT, slw + 12 * lockT, slh + 12 * lockT, r + 6 * lockT); ctx.stroke(); ctx.globalAlpha = vis; }
    const ix = slx + Math.round(16 * k1);
    ctx.textAlign = 'left'; ctx.font = fLane; ctx.fillStyle = locked ? YES : DIM;
    ctx.fillText('BRIDGE  ·  FEATURE', ix, sly + Math.round(18 * k1));
    ctx.textAlign = 'right'; ctx.fillStyle = DIM2; ctx.fillText('Em · G · A · A  ·  the drums drop out', slx + slw - Math.round(14 * k1), sly + Math.round(18 * k1), slw * 0.55);
    const tlH = Math.round(clamp(30 * k1, 22, 34)), tlY = sly + slh - tlH - Math.round(12 * k1), midY = sly + (tlY - sly) * 0.55;
    if (!has) {
      ctx.textAlign = 'center'; ctx.font = fBig; ctx.fillStyle = 'rgba(232,244,255,0.55)'; ctx.fillText('empty', slx + slw / 2, midY - Math.round(8 * k1));
      ctx.font = fSm; ctx.fillStyle = DIM; ctx.fillText(dropTxt, slx + slw / 2, midY + Math.round(16 * k1), slw - 24);
    } else {
      ctx.save(); ctx.translate(slx + slw / 2, midY); ctx.scale(s, s);
      ctx.textAlign = 'center'; ctx.font = fBig; ctx.fillStyle = locked ? '#fff3c2' : ICE; ctx.fillText(SAMPLES[TK[slotI]].label, 0, -Math.round(16 * k1), slw - 40);
      wave(PK[slotI], -slw * 0.36, Math.round(12 * k1), slw * 0.72, Math.round(clamp(26 * k1, 16, 30)), locked ? 'rgba(255,210,31,0.75)' : 'rgba(143,208,255,0.75)', 40);
      ctx.restore();
      ctx.textAlign = 'center'; ctx.font = fSm;
      if (locked) { lockGlyph(slx + slw / 2 - Math.round(38 * k1), midY + Math.round(40 * k1), Math.round(12 * k1), YES); ctx.fillStyle = YES; ctx.fillText('LOCKED IN', slx + slw / 2 + Math.round(8 * k1), midY + Math.round(41 * k1)); }
      else { ctx.fillStyle = live ? SSL : DIM; ctx.fillText(live ? 'auditioning in the bridge…' : 'auditioned', slx + slw / 2, midY + Math.round(41 * k1)); }
    }
    // the eight bars, the feature on bars 1 and 5
    const bw = (slw - 2 * Math.round(14 * k1)) / 8, bx0 = slx + Math.round(14 * k1);
    ctx.font = fSm; ctx.textAlign = 'center';
    const pbar = live ? playBar - SEC_FIRST[BRIDGE] : -1;
    for (let b = 0; b < 8; b++) {
      const x = bx0 + b * bw;
      ctx.fillStyle = b === pbar ? 'rgba(143,208,255,0.3)' : 'rgba(191,230,255,0.07)'; rr(ctx, x + 1, tlY, bw - 2, tlH, 5); ctx.fill();
      ctx.fillStyle = b === pbar ? ICE : DIM; ctx.fillText(SEC_CH[BRIDGE][b & 3], x + bw / 2, tlY + tlH * 0.62);
      ctx.fillStyle = DIM2; ctx.fillText(BARN[b], x + 8, tlY + 8);
      if (b === 0 || b === 4) {
        const dx = x + bw / 2, dy = tlY - 1;
        ctx.fillStyle = has ? (locked ? YES : SSL) : 'rgba(191,230,255,0.3)';
        ctx.beginPath(); ctx.moveTo(dx, dy - 6); ctx.lineTo(dx + 5, dy - 1); ctx.lineTo(dx, dy + 4); ctx.lineTo(dx - 5, dy - 1); ctx.fill();
      }
    }
    // the takes
    for (let i = 0; i < TK.length; i++) {
      const x = BCX[i], y = BCY[i], cur = i === slotI, foc = fz === Z_CHIPS && fk === i && phase === 'edit';
      ctx.globalAlpha = vis * (locked && !cur ? 0.45 : cdI === i && cdMoved ? 0.35 : 1);
      ctx.fillStyle = cur ? (locked ? 'rgba(255,210,31,0.2)' : 'rgba(143,208,255,0.22)') : 'rgba(191,230,255,0.08)';
      rr(ctx, x, y, bcw, bch, bch / 2); ctx.fill();
      ctx.lineWidth = 1; ctx.strokeStyle = cur ? (locked ? YES : SSL) : 'rgba(191,230,255,0.22)'; rr(ctx, x + 0.5, y + 0.5, bcw - 1, bch - 1, bch / 2); ctx.stroke();
      const ww = bcw >= 170 ? Math.min(54 * k1, bcw * 0.28) : 0;
      ctx.textAlign = 'left'; ctx.font = fChip; ctx.fillStyle = ICE; ctx.fillText(SAMPLES[TK[i]].label, x + bch * 0.45, y + bch / 2 + 1, bcw - bch * 0.8 - ww - 12);
      if (ww) wave(PK[i], x + bcw - ww - bch * 0.35, y + bch / 2, ww, bch * 0.5, cur ? (locked ? YES : SSL) : 'rgba(143,208,255,0.55)', 12);
      if (HEARD[i] && !cur) { ctx.fillStyle = DIM; ctx.beginPath(); ctx.arc(x + bcw - 8, y + 8, 2.4, 0, 6.2832); ctx.fill(); }
      ctx.globalAlpha = vis;
      if (foc) ring(x, y, bcw, bch, bch / 2, 'rgba(95,178,255,0.55)');
    }
  }
  function drawPicker() {
    ctx.fillStyle = 'rgba(4,8,18,0.55)'; rr(ctx, gx - 4, gy - 4, gw + 8, gh + 8, 14); ctx.fill();
    ctx.save(); ctx.shadowColor = 'rgba(120,190,255,0.55)'; ctx.shadowBlur = 22;
    ctx.fillStyle = 'rgba(248,252,255,0.93)'; rr(ctx, shx, shy, shw, shh, 20); ctx.fill(); ctx.restore();
    ctx.lineWidth = 1; ctx.strokeStyle = '#ffffff'; rr(ctx, shx + 0.5, shy + 0.5, shw - 1, shh - 1, 20); ctx.stroke();
    const tH = PCY[0] - shy - 6;
    ctx.fillStyle = LANE_COL[pick]; ctx.beginPath(); ctx.arc(shx + 22, shy + tH / 2 + 2, 6, 0, 6.2832); ctx.fill();
    ctx.textAlign = 'left'; ctx.font = fPickT; ctx.fillStyle = INK; ctx.fillText(PICK_T[pick], shx + 36, shy + tH / 2 + 3, shw - 90);
    // close
    ctx.fillStyle = 'rgba(47,134,224,0.12)'; ctx.beginPath(); ctx.arc(clx + cls / 2, cly + cls / 2, cls / 2, 0, 6.2832); ctx.fill();
    ctx.strokeStyle = '#2f86e0'; ctx.lineWidth = 2; const c0 = cls * 0.32;
    ctx.beginPath(); ctx.moveTo(clx + c0, cly + c0); ctx.lineTo(clx + cls - c0, cly + cls - c0); ctx.moveTo(clx + cls - c0, cly + c0); ctx.lineTo(clx + c0, cly + cls - c0); ctx.stroke();
    const curId = PAT.lanes[pick];
    for (let i = 0; i <= TK.length; i++) {
      const x = PCX[i], y = PCY[i], id = i < TK.length ? TK[i] : null, cur = id === curId, foc = fp === i;
      let other = -1;
      if (id) for (let l = 0; l < 4; l++) if (l !== pick && PAT.lanes[l] === id) other = l;
      ctx.fillStyle = cur ? '#2f86e0' : 'rgba(47,134,224,0.08)'; rr(ctx, x, y, pcw, pch, pch / 2); ctx.fill();
      if (!cur) { ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(47,134,224,0.28)'; rr(ctx, x + 0.5, y + 0.5, pcw - 1, pch - 1, pch / 2); ctx.stroke(); }
      const ww = id && pcw >= 170 ? Math.min(44 * k1, pcw * 0.24) : 0;
      ctx.textAlign = 'left'; ctx.font = fChip; ctx.fillStyle = cur ? '#ffffff' : id ? INK : '#5b6f90';
      ctx.fillText(id ? SAMPLES[id].label : 'Synth bleep', x + pch * 0.45, y + pch / 2 + (other >= 0 ? -5 : 1), pcw - pch * 0.8 - ww - 12);
      if (other >= 0) { ctx.font = fSm; ctx.fillStyle = cur ? '#dbeeff' : LANE_INK[other]; ctx.fillText(IN_LANE[other], x + pch * 0.45, y + pch / 2 + 9); }
      if (ww) wave(PK[i], x + pcw - ww - pch * 0.35, y + pch / 2, ww, pch * 0.46, cur ? '#dbeeff' : 'rgba(47,134,224,0.6)', 10);
      if (foc) { ctx.lineWidth = 2; ctx.strokeStyle = '#2f86e0'; rr(ctx, x - 3, y - 3, pcw + 6, pch + 6, pch / 2 + 3); ctx.stroke(); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(95,178,255,0.45)'; rr(ctx, x - 6, y - 6, pcw + 12, pch + 12, pch / 2 + 6); ctx.stroke(); }
    }
  }
  function drawBottom() {
    const c = cfg();
    // the hint: where we are, or the transient message, then the controls
    ctx.textAlign = 'left'; ctx.font = fHint;
    let st = '';
    if (msgT > 0 && msg) { ctx.fillStyle = '#ffe68a'; st = MSG[msg]; }
    else if (phase === 'playback') { ctx.fillStyle = ICE; st = ''; }
    else if (phase === 'pass') { ctx.fillStyle = DIM; st = PASS_T; }
    else if (c === 0) {
      let n = 0; for (let l = 0; l < 4; l++) if (PAT.lanes[l]) n++;
      ctx.fillStyle = ICE; st = !locked && n < 4 && sec !== BRIDGE ? STAGE[0] : !locked ? (slotI >= 0 ? STAGE[3] : STAGE[1]) : STAGE[2];
    }
    if (phase === 'playback') {
      const ly = narrow ? hintY : hintY - Math.round(8 * k1), t = Math.floor(pbShow);
      ctx.fillStyle = SSL; ctx.fillText(SEC_LABEL[sec], hintX, ly);
      ctx.fillStyle = ICE; ctx.fillText(MMSS[Math.min(240, t)], hintX + secW, ly);
      ctx.fillStyle = DIM; ctx.fillText(PB_OF, hintX + secW + timeW, ly);
      const bx = narrow ? hintX : hintX + monTxtW + 14, by = narrow ? hintY + Math.round(14 * k1) : hintY + Math.round(11 * k1), bw = Math.max(40, Math.min(narrow ? hintW : hintW - monTxtW - 14, 300 * k1));
      if (!narrow) { ctx.font = fSm; ctx.fillStyle = DIM; ctx.fillText(MON_TXT, hintX, hintY + Math.round(11 * k1)); }
      ctx.fillStyle = 'rgba(191,230,255,0.14)'; ctx.fillRect(bx, by - 1, bw, 2); ctx.fillStyle = SSL; ctx.fillRect(bx, by - 1, bw * clamp(pbShow / pbDur, 0, 1), 2);
    } else if (st) {
      ctx.fillText(st, hintX, narrow ? hintY : hintY - Math.round(8 * k1), hintW);
      if (!narrow && c === 0) { ctx.font = fSm; ctx.fillStyle = DIM2; ctx.fillText(help, hintX, hintY + Math.round(11 * k1), hintW); }
    }
    if (c < 0) return;
    // the buttons (SafeSense pills)
    ctx.font = fBtn; ctx.textAlign = 'center';
    for (let i = 0; i < BN[c]; i++) {
      const x = BX[c][i], w = BWD[c][i], foc = fz === Z_BTN && fb === i && pick < 0;
      const off = (c === 0 && i === 1 && !locked) || (c === 2 && i === 0 && greyed), primary = !off && ((c === 0 && i === 1) || c === 2 || c === 1);
      ctx.fillStyle = off ? 'rgba(120,140,170,0.16)' : primary ? btnG : offG; rr(ctx, x, BY, w, BH, BH / 2); ctx.fill();
      if (!primary) { ctx.lineWidth = 1; ctx.strokeStyle = off ? 'rgba(191,230,255,0.14)' : 'rgba(191,230,255,0.45)'; rr(ctx, x + 0.5, BY + 0.5, w - 1, BH - 1, BH / 2); ctx.stroke(); }
      else { ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fillRect(x + BH * 0.5, BY + 2, w - BH, 1.5); }
      ctx.fillStyle = off ? '#61789a' : '#ffffff';
      ctx.fillText(c === 0 && i === 0 && previewOn ? STOP_T : BTN_T[c][i], x + w / 2, BY + BH / 2 + 1, w - 12);
      if (foc) ring(x, BY, w, BH, BH / 2, off ? 'rgba(160,170,190,0.4)' : 'rgba(95,178,255,0.6)');
    }
  }
  function drawHand() { // Chase (2040)'s hand: the burned right one
    const x = handX, y = handY, s = clamp(20 * k1, 14, 22);
    ctx.globalAlpha = vis * handA;
    if (handCarry >= 0) { // the take he's carrying
      ctx.fillStyle = 'rgba(143,208,255,0.3)'; rr(ctx, x - bcw * 0.5, y - bch * 0.5, bcw, bch, bch / 2); ctx.fill();
      ctx.strokeStyle = SSL; ctx.lineWidth = 1.5; rr(ctx, x - bcw * 0.5, y - bch * 0.5, bcw, bch, bch / 2); ctx.stroke();
      ctx.textAlign = 'left'; ctx.font = fChip; ctx.fillStyle = ICE; ctx.fillText(SAMPLES.laugh.label, x - bcw * 0.5 + bch * 0.45, y + 1, bcw - bch);
    }
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; rr(ctx, x - s * 0.1 + 3, y - s * 0.1 + 4, s * 0.9, s * 1.05, s * 0.3); ctx.fill();
    ctx.fillStyle = '#e2b08e'; rr(ctx, x - s * 0.12, y - s * 0.05, s * 0.86, s * 0.95, s * 0.3); ctx.fill();   // the palm
    rr(ctx, x - s * 0.06, y - s * 0.62, s * 0.24, s * 0.7, s * 0.12); ctx.fill();                          // the finger
    ctx.fillStyle = '#c98472'; rr(ctx, x + s * 0.22, y + s * 0.18, s * 0.4, s * 0.38, s * 0.14); ctx.fill(); // the burn
    ctx.fillStyle = '#a8865a'; ctx.fillRect(x - s * 0.16, y + s * 0.82, s * 0.94, s * 0.3);                 // the trench coat's cuff
    ctx.font = fSm; ctx.textAlign = 'left'; ctx.fillStyle = ICE; ctx.fillText('CHASE (2040)', x + s * 0.9, y - s * 0.5);
    ctx.globalAlpha = vis;
  }

  // ---------------------------------------------------------- lifecycle
  const M = {
    start(params, a) {
      api = a; p = params || a.params || {}; ov = a.overlay; ctx = ov.ctx;
      run++; done = false; auto = false; phase = 'edit'; W = 0; sch = ''; tt = 0;
      if (!LD) buildLead();
      // the takes: what Chase collected (in order), the laugh always (spec §13.6: scripted, always granted)
      TK.length = 0; PK.length = 0; AUD.length = 0; HEARD.fill(0);
      const sm = Array.isArray(state.samples) ? state.samples : [];
      for (const id of sm) if (typeof SAMPLES !== 'undefined' && SAMPLES[id] && !TK.includes(id) && TK.length < 15) TK.push(id);
      if (!TK.includes('laugh')) { if (TK.length >= 15) TK.length = 14; TK.push('laugh'); }
      laughI = TK.indexOf('laugh');
      TL1.length = TL2.length = 0;
      for (const id of TK) { const t = SAMPLES[id].label, sp = t.indexOf(' ', Math.floor(t.length / 2) - 3); if (sp > 0) { TL1.push(t.slice(0, sp)); TL2.push(t.slice(sp + 1)); } else { TL1.push(t); TL2.push(''); } }
      const A = aud();
      for (let i = 0; i < TK.length; i++) {
        let pk = A && A.peaks ? A.peaks(TK[i], 24) : null;
        if (!pk || !pk.some((v) => v > 0)) { pk = new Float32Array(24); let s = 3 + i * 7; for (let j = 0; j < 24; j++) { s = (s * 16807) % 2147483647; pk[j] = 0.25 + 0.75 * (s / 2147483647) * (1 - j / 30); } }
        PK.push(pk);
      }
      load();
      locked = laughTried = dragged = greyed = false; passes = 0; slotI = -1; slotT = lockT = 1; fineI = 0; fineT = 0; dragT = 0; msg = 0; msgT = 0;
      dragAfter = p.dragAfter ?? 60;
      sec = fs = 1; leadBar = 0; pick = -1; fz = Z_GRID; fr = 0; fc = -1; fb = 0; fp = 0; fk = 0;
      previewOn = false; previewSec = -1; playRow = playBar = -1; song = null; deskLive = false; FL.fill(0);
      fidOn = false; fidK = 0; hand = false; handCarry = -1; cdI = -1; paintOn = false; lpx = a.input.pointer.x; lpy = a.input.pointer.y;
      // the clock
      const tm = /^(\d{1,2}):(\d\d)/.exec(String(p.time || '3:00'));
      h0 = tm ? +tm[1] : 3; const m0 = tm ? +tm[2] : 0;
      TIMES.length = 0;
      for (let m = 0; m < 120; m++) { const h = h0 + Math.floor(m / 60), hh = ((h + 11) % 12) + 1; TIMES.push(hh + ':' + (m % 60 < 10 ? '0' : '') + (m % 60) + (h % 24 < 12 ? ' am' : ' pm')); }
      clkM = clkTo = m0; clkShown = -1; clkJump = 0;
      q0 = -1;
      const qs = typeof state.quiet === 'string' ? /^(\d+):(\d\d):(\d\d)$/.exec(state.quiet) : null;
      if (qs) q0 = +qs[1] * 3600 + +qs[2] * 60 + +qs[3] + m0 * 60;
      // the camera, the music, the set
      baseShot = p.shot === false ? null : p.shot || (a.world.anchor('s210_desk_two') ? { shot: 'INSERT', at: 's210_desk_two' } : null);
      shot('base');
      if (p.music !== false && typeof music === 'function') music(null, { fade: 1 });
      propCall('slate_desk', 'screen', 'seq');
      wasEnabled = player.enabled; player.enabled = false;
      uiRoot = document.getElementById('ui');
      if (uiRoot) uiRoot.classList.add('mg-seq');
      if (!styleEl) { styleEl = document.createElement('style'); styleEl.textContent = CSS; }
      a.ui.appendChild(styleEl);
      vis = 0; visTo = 1; visRate = 1 / 0.45; hold = 0.45;
      ov.show(true);
      layout();
      testLog('sequencer: start (' + TK.length + ' samples)');
    },
    update(dt) {
      if (done) return;
      size();
      tt += dt;
      if (vis !== visTo) { const d = dt * visRate; vis = vis < visTo ? Math.min(visTo, vis + d) : Math.max(visTo, vis - d); }
      if (hold > 0) hold -= dt;
      if (slotT < 1) slotT = Math.min(1, slotT + dt * 4);
      if (lockT < 1) lockT = Math.min(1, lockT + dt * 0.7);
      if (msgT > 0) msgT -= dt;
      for (let i = 0; i < 80; i++) if (FL[i] > 0) FL[i] = Math.max(0, FL[i] - dt * 3.2);
      clockTick(dt);
      if (fineT > 0 && (fineT -= dt) <= 0) fine();
      if (phase === 'edit' && !locked && !laughTried && dragAfter > 0 && (dragT += dt) >= dragAfter) chaseDrag();
      if (previewOn && !stepSeen && tt - prevT0 > 0.5) { // no audio clock (no AudioContext yet): keep the playhead moving anyway
        ownClk += dt; const n = Math.floor(ownClk / STEP);
        playRow = n & 15; playBar = SEC_FIRST[previewSec] + Math.floor(n / 16) % previewBars;
      }
      if (phase === 'playback') playbackTick(dt);
      if (fidOn) fiddleTick(dt);
      if (hand) handTick(dt);
      // the lead follows the music while nobody is on it
      if (playRow >= 0 && playBar >= 0 && LKIND[sec] >= 0 && !(fz === Z_GRID && fr === 4) && ((previewOn && previewSec === sec) || phase === 'playback')) leadBar = (playBar - SEC_FIRST[sec]) & 3;
      if (!auto && hold <= 0 && vis > 0.6 && (phase === 'edit' || phase === 'playback' || phase === 'choice')) handleInput();
      else { paintOn = false; if (cdI >= 0 && !api.input.pointer.down) cdI = -1; }
    },
    draw() {
      if (done || !ctx || !W) return;
      const s = ov.canvas.width / W;
      ctx.setTransform(s, 0, 0, s, 0, 0); ctx.clearRect(0, 0, W, H);
      if (vis <= 0.004) return;
      ctx.globalAlpha = vis;
      ctx.fillStyle = vigG; ctx.fillRect(0, 0, W, H);
      ctx.translate(0, Math.round((1 - vis) * 16));
      if (bgC) ctx.drawImage(bgC, px - SH, py - SH, pw + SH * 2, ph + SH * 2);
      ctx.textBaseline = 'middle';
      drawHeader(); drawStrip();
      if (sec === BRIDGE) drawBridge(); else drawGrid();
      if (pick >= 0) drawPicker();
      drawBottom();
      if (fidOn) { ctx.lineWidth = 2.5; ctx.strokeStyle = 'rgba(255,190,90,0.9)'; rr(ctx, gxp - cw * 0.5 - 4, gyp - cellH * 0.5 - 4, cw - cg + 8, cellH + 8, 9); ctx.stroke(); }
      if (cdI >= 0 && cdMoved) { // the take under the pointer
        const x = lpx - bcw * 0.5, y = lpy - bch * 0.5;
        ctx.fillStyle = 'rgba(143,208,255,0.32)'; rr(ctx, x, y, bcw, bch, bch / 2); ctx.fill();
        ctx.strokeStyle = SSL; ctx.lineWidth = 1.5; rr(ctx, x, y, bcw, bch, bch / 2); ctx.stroke();
        ctx.textAlign = 'left'; ctx.font = fChip; ctx.fillStyle = ICE; ctx.fillText(SAMPLES[TK[cdI]].label, x + bch * 0.45, y + bch / 2 + 1, bcw - bch);
      }
      if (hand) drawHand();
      if (clkJump > 0) { // the clock jumps: big on the slate for a moment
        const a = Math.min(1, clkJump * 2.2), cx = gx + gw / 2, cy = gy + gh * 0.46;
        ctx.globalAlpha = vis * a * 0.82; ctx.fillStyle = '#07101f'; rr(ctx, cx - jumpW / 2 - 34 * k1, cy - 46 * k1, jumpW + 68 * k1, 92 * k1, 46 * k1); ctx.fill();
        ctx.globalAlpha = vis * a; ctx.font = fJump; ctx.textAlign = 'center'; ctx.fillStyle = YES; ctx.fillText(TIMES[Math.floor(clkM)], cx, cy + 3);
      }
      ctx.globalAlpha = 1; ctx.setTransform(s, 0, 0, s, 0, 0);
    },
    end(r) {
      run++;
      stopPreview();
      if (song) { song.stop(0.4); song = null; }
      if (deskLive) { propCall('foh_desk', 'state', 'half'); deskLive = false; }
      fineT = 0; fidStop(); hand = false; paintOn = false; cdI = -1; pick = -1;
      if (wasEnabled) { wasEnabled = false; player.enabled = true; }
      if (uiRoot) uiRoot.classList.remove('mg-seq');
      if (ctx) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, ov.canvas.width, ov.canvas.height); }
      if (ov) ov.show(false);
      done = true; phase = 'off'; auto = false;
    },
    // Pause -> "Skip this mini-game" (never offered: no fail state). Chase's own picks fill the empty lanes, the laugh goes in.
    skipResult() {
      if (done) return { ok: true, pattern: state.pattern };
      const pref = defaultLanes(TK);
      for (let l = 0; l < 4; l++) if (!PAT.lanes[l] && pref[l] && !PAT.lanes.includes(pref[l])) PAT.lanes[l] = pref[l];
      locked = true; dragged = dragged || !laughTried;
      const r = result({ skipped: true });
      r.quick = false;
      return r;
    },
    async autoplay(a) {
      if (done || api !== a) return;
      auto = true;
      const id = run, alive = () => id === run && !done;
      const until = (fn, cap) => { const t0 = clock.t; return waitUntil(() => !alive() || fn() || clock.t - t0 > cap); };
      await wait(0.6); if (!alive()) return;
      // 1. the four lanes, picked from the list (Chase's own choices, any order would do)
      const pref = defaultLanes(TK), ready = () => until(() => phase === 'edit' && !hand, 60);
      for (let l = 0; l < 4; l++) {
        await ready(); if (!alive()) return;
        if (sec === BRIDGE) setSec(1);
        fz = Z_GRID; fr = l; fc = -1; await wait(0.2); if (!alive()) return;
        openPicker(l); await wait(0.3); if (!alive()) return;
        const i = pref[l] ? TK.indexOf(pref[l]) : -1;
        fp = i < 0 ? TK.length : i; await wait(0.25); if (!alive()) return;
        pickPress(fp); await wait(0.2); if (!alive()) return;
      }
      // 2. a groove: a step on, a step off; a lead note off and back on
      await ready(); if (!alive()) return;
      if (sec === BRIDGE) setSec(1);
      fz = Z_GRID; fr = 0; fc = 3; await wait(0.2); cellPress(0, 3); await wait(0.25); if (!alive()) return;
      fr = 2; fc = 8; await wait(0.2); cellPress(2, 8); await wait(0.25); if (!alive()) return;
      fr = 4; fc = 6; await wait(0.2); cellPress(4, 6); await wait(0.35); cellPress(4, 6); await wait(0.25); if (!alive()) return;
      buttonPress(0); await wait(0.9); buttonPress(0); if (!alive()) return;   // a listen to the verse
      // 3. the bridge
      fz = Z_STRIP; await wait(0.2); setSec(BRIDGE); fz = Z_CHIPS; await wait(0.4); if (!alive()) return;
      if (dragAfter > 0 && dragAfter < 30) await until(() => locked, dragAfter + 30);   // a test of Chase (2040) dragging it in
      else {
        const other = TK.findIndex((k) => k !== 'laugh');
        if (other >= 0) { fk = other; await wait(0.2); audition(other); await wait(2.4); if (!alive()) return; }
        fk = laughI; await wait(0.3); audition(laughI);
        await until(() => locked && phase === 'edit', 40);
      }
      if (!alive()) return;
      await wait(0.4);
      // 4. play it back
      fz = Z_BTN; fb = 1; await wait(0.2); buttonPress(1);
      await until(() => phase === 'choice', 60); if (!alive()) return;
      await wait(0.4);
      // 5. one more pass, twice ("Stop."), or it's done at once
      const quick = p.test === 'quick' || /[?&]seq=quick\b/.test(location.search);
      if (!quick) for (let n = 0; n < 2 && !greyed; n++) {
        fb = 0; await wait(0.3); buttonPress(0);
        await until(() => phase === 'choice', 60); if (!alive()) return;
        await wait(0.4);
      }
      fb = 1; await wait(0.3); buttonPress(1);
      await until(() => !alive(), 30);
      if (!done && id === run) finishGame();   // belt and braces: never leave a test hanging
    },
    // a complete pattern without playing (Chapter Select grants past 2.10, Extras before the scene): the laugh in the bridge
    pattern(samples) {
      const lanes = defaultLanes(samples || state.samples || []);
      return { lanes, steps: DEF_ON.map((on) => { const r = new Array(16).fill(false); for (const s of on) r[s] = true; return r; }), lead: null, bridge: 'laugh' };
    },
    get phase() { return phase; },
    // test hook: the centre (CSS px) of a control, for scripted mouse / touch input
    //   at('strip', i) · at('head', lane 0..4) · at('cell', lane, step) · at('chip', i) · at('slot') · at('pick', i) · at('btn', i)
    at(kind, i = 0, j = 0) {
      if (kind === 'strip') return [SX[i] + SW[i] / 2, stripY + stripH / 2];
      if (kind === 'head') return [gx0 + hw * 0.6, RY[i] + headH / 2];
      if (kind === 'cell') return [cx0 + CX[j] + (cw - cg) / 2, RY[i] + CY[j] + cellH / 2];
      if (kind === 'chip') return [BCX[i] + bcw / 2, BCY[i] + bch / 2];
      if (kind === 'slot') return [slx + slw / 2, sly + slh / 2];
      if (kind === 'pick') return [PCX[i] + pcw / 2, PCY[i] + pch / 2];
      if (kind === 'btn') { const c = Math.max(0, cfg()); return [BX[c][i] + BWD[c][i] / 2, BY + BH / 2]; }
      return null;
    },
    get takes() { return TK.slice(); },
    get focus() { return { zone: ['strip', 'grid', 'btn', 'pick', 'chips'][fz], row: fr, col: fc, btn: fb, pick: fp, chip: fk, lane: pick, sec, phase, vis, fiddle: fidOn }; },
  };
  return M;
})();
