// ============================================================ MINIGAME: Sausage Sizzle (spec 9.9; scene 2.6 "Snag")
// Two stations, one player. SWAP (Tab / Y / the SWAP button, or a click / tap on the other card) moves between LUKA on
// the hotplate and CHASE on the front. Both stations run all the time: the snags keep cooking while you serve, and the
// queue keeps waiting while you cook.
//   HOTPLATE  six snags. Only the side facing down cooks: raw -> browning -> READY -> burning -> burnt. YES (or a click /
//             tap on the snag) turns it; turn it at READY ("TURN!"), and when both sides are done ("READY!") YES lifts
//             it into the tray (the cooked snags the front sells). Turning early does no harm and no good; turning while
//             it burns still saves it (charred). A burnt snag goes in the bin; three burnt and Luke takes the tongs for a
//             few seconds ("Easy, Santa.") and turns them himself. No fail. The onions want a stir every few seconds:
//             HOLD YES on them (or hold the pointer on them; options.holdToPress = one press). Left too long they catch,
//             and the front can't add onions until Luka has stirred them.
//   FRONT     the customer at the serve point orders in a speech bubble (bread + snag + onions? + sauce: tomato / BBQ /
//             none, for safety), with a small 2040 quirk; the docket under it ticks off what's on the bread. BREAD, SNAG
//             (from the tray), ONIONS, TOMATO or BBQ, then HAND OVER: YES on the focused button, a click / tap, or drag
//             an item onto the bread (and the sandwich up onto the customer). NO (or a right click) takes the last item
//             back. A wrong order comes back (it only costs time). Everyone pays by chip; Chase (2040) counts the change
//             at the cash tin (there is none).
//   Ten served -> done. The banter of 2.6 plays as barks at set customers (params.banter).
//
// minigame('sizzle', params) -> result
//   params (all optional):
//     target: 10             customers to serve
//     start: 'chase'         who is at a station first: 'chase' (the front) | 'luka' (the hotplate)
//     banter: BANTER         [{ at: servedCount, steps: [step, ...] }]; false = none. A step is
//                            { bark: speakerId, text, tag?, act?: [actorId, anim, opts?] } (awaited until read) |
//                            { turn: true } (Luka turns a sausage that doesn't need turning) | { wait: s } |
//                            { act: [actorId, anim, opts?] } | { do: async (api) => {} }.
//                            MINIGAMES.sizzle.BANTER is the default: 2.6's banter, word for word.
//     intro: true            LUKE's "Nobody gets a favour from me ..." as a bark when play starts. false = none (the scene
//                            said it already); a string = that line from luke40 instead.
//     shots: { luka, chase } the live 3-D shot behind each station (cam.shot steps). Defaults: the CAM lenses below on
//                            sandgate (across the plate at Luka and Luke; over Chase's shoulder at the queue), else a MID
//                            shot on the active actor.
//     place: true            put luka / luke40 / chase / chase40 on the set's sz_* marks and pose them (Luka holds the
//                            spare tongs and flips, Luke flips beside him, Chase (2040) looks into the cash tin).
//                            false = leave them where the scene put them.
//     dress: true            SETS.sandgate.dress('sizzle26', { keepEnv: true }) at start (the queue goes live, the tin
//                            opens). false = the scene dressed it. NB the set re-dresses itself to 'luke26' on the first
//                            frame of a new scene, so start the game after at least one frame of 2.6 (any cutscene).
//     tray: 2                cooked snags already in the tray (Luke's been at it)
//     onServe(n, order), onBurnt(total), onTakeover(n)   optional callbacks (also emitted as events, below)
//   result: { ok: true, served, burnt, takeovers, wrong, turns, stirs, active }   (active = 'luka' | 'chase', the last
//           station); Pause -> Skip (only ever offered by the host after failures, and this game never fails):
//           { skipped: true, ok: true, served: target, ... }; { aborted } / { error } from the host.
//           Sets state.flags.s26_sizzle = true unless aborted.
//   events: emit('sizzle:swap', 'luka'|'chase'), ('sizzle:served', n), ('sizzle:burnt', total), ('sizzle:takeover', n),
//           ('sizzle:done', result); testLog 'sizzle: start' / 'sizzle: done ...'.
// What the scene sets up (2.6): sandgate current; actors luka (flags.santa: hat and beard), chase, chase40, luke40.
//   With the set's API everything is mirrored into 3-D: the snags' two sides and the roll (SETS.sandgate.sizzle.snag /
//   turn), the onions cooking and the stir, the sandwich on the build spot and the hand-over, the sauce squeeze, the
//   open cash tin, and the live queue (queue.front / advance / visits / bubble, live(false) at the end). Without
//   sandgate it still plays (cards only; customers step up on a timer). Music is the scene's ('sizzle').
// Autoplay: a deterministic bot plays it (game time x2): it swaps, turns at READY, stirs, builds every order (one wrong
//   sauce on purpose), lets three snags burn once so Luke takes over, and lets the banter finish before it ends.
// Drawn on the overlay canvas: two painted cards over the live shot (on small screens the station you're not at folds
// into a tab). Nothing is allocated per tick: typed arrays, precomputed strings, one shared sfx options object.
MINIGAMES.sizzle = (() => {
  const PI = Math.PI, TAU = PI * 2;
  const FF = '"Trebuchet MS", "Segoe UI", system-ui, sans-serif';
  const F9B = 'bold 9px ' + FF, F10 = '10px ' + FF, F10B = 'bold 10px ' + FF, F10I = 'italic 10px ' + FF, F11 = '11px ' + FF, F11B = 'bold 11px ' + FF,
    F12B = 'bold 12px ' + FF, F13 = '13px ' + FF, F13B = 'bold 13px ' + FF, F14B = 'bold 14px ' + FF, F15B = 'bold 15px ' + FF, F22B = 'bold 22px ' + FF;
  const CW = 440, CH = 250, TW = 104, TH = 46, SH = 26, GAP = 10;   // card / tab / strip design sizes (px before scale)
  const C = {
    navy: '#141d3a', panel: 'rgba(20,29,58,0.93)', dim: 'rgba(8,12,26,0.5)', yes: '#ffd21f', line: '#3a4670', text: '#e8ecf5', sub: '#97a2c2',
    red: '#c8262e', white: '#f6f4ee', good: '#7dffb0', warn: '#ffcf7a', bad: '#ff6b5e',
    steel: '#666a72', steelHi: '#80858e', steelLo: '#3f4248', groove: 'rgba(30,32,38,0.45)', grease: 'rgba(40,30,20,0.28)',
    raw: '#eea6a1', rawHi: '#f9d3cf', rawLo: '#c98680', part: '#d99068', partHi: '#efb48c', partLo: '#a8603e',
    cooked: '#a4582c', cookedHi: '#cf8650', cookedLo: '#6e3618', char: '#4a2818', charHi: '#6e3c22', charLo: '#24120a',
    burnt: '#1b1411', burntHi: '#3a2c26', mark: 'rgba(40,18,8,0.75)',
    bread: '#f4ead2', crust: '#c99a5e', tomato: '#d0342e', bbq: '#5a2e1e', napkin: '#fbfaf6', paper: '#fffdf4', ink: '#141d3a',
  };
  // the cooking (down) side, by phase: label colour, rim colour
  const PH_COL = ['#f2b2ad', '#e09a58', '#ffd21f', '#ff6b4a', '#8a8f9a'];
  const PH_RIM = ['#d68e88', '#c87850', '#e8b040', '#ff5a2a', '#120d0b'];
  const ONI_PAL = [];   // 24 steps: raw -> golden -> dark (built once)
  (function () {
    const A = [0xf0, 0xe6, 0xc8], B = [0xd3, 0xa4, 0x56], D = [0x5a, 0x3c, 0x22];
    for (let i = 0; i < 24; i++) {
      const u = i / 23, a = u < 0.5 ? A : B, b = u < 0.5 ? B : D, k = u < 0.5 ? u * 2 : (u - 0.5) * 2;
      ONI_PAL.push('rgb(' + Math.round(a[0] + (b[0] - a[0]) * k) + ',' + Math.round(a[1] + (b[1] - a[1]) * k) + ',' + Math.round(a[2] + (b[2] - a[2]) * k) + ')');
    }
  })();
  // onion strands (pile-local): x, y, r, a0, sweep; grease spots: x, y, r (seeded, fixed)
  const STR = new Float32Array(26 * 5), GREASE = new Float32Array(14 * 3);
  (function () {
    let s = 7;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 26; i++) {
      const a = rnd() * TAU, d = Math.sqrt(rnd()) * 24;
      STR[i * 5] = Math.cos(a) * d; STR[i * 5 + 1] = Math.sin(a) * d * 0.8; STR[i * 5 + 2] = 5 + rnd() * 7;
      STR[i * 5 + 3] = rnd() * TAU; STR[i * 5 + 4] = 1.6 + rnd() * 1.8;
    }
    for (let i = 0; i < 14; i++) { GREASE[i * 3] = 20 + rnd() * 400; GREASE[i * 3 + 1] = 44 + rnd() * 150; GREASE[i * 3 + 2] = 3 + rnd() * 8; }
  })();
  const DASH = [5, 4], NODASH = [];

  // ---------------------------------------------------------- tuning (seconds of game time)
  const SIDE = { brown: 2.2, ready: 5.0, win: 3.6, burn: 2.6 };   // a side: browning from, READY from, READY window, burning window
  const ONION = { stir: 6.0, catchAt: 9.5 }, HOLD = 0.55, TAKEOVER = 6.5, LAY = 0.9, SCRAPE = 1.2, LIFT = 0.45, TURN_T = 0.28, PAY = 1.3, WALK = 1.1;
  const INIT_T = [0.6, 0.0, 0.3, 0.0, 0.9, 0.15], SPD = [1.0, 0.93, 1.07, 0.96, 1.04, 0.9];
  const BOT_SPEED = 2;
  let tBrown = 0, tReady = 0, tBurn = 0, tBurnt = 0, tStir = 0, tCatch = 0;

  // ---------------------------------------------------------- the queue (sandgate's sizzle_a..e; each comes twice, served in that order)
  // a tradie in shorts · a mum with a hover-pram · an old man with a dog lead and no dog · a teen with a skateboard ·
  // a woman in netball kit. on = onions; sauce 'tomato' | 'bbq' | 'none'; ta = as they pay; pop = their chip's SafeSense.
  const ORDERS = [
    [{ on: true, sauce: 'tomato', say: 'Snag with onions and tomato, thanks.', quirk: 'Can I get it with no risk?', ta: 'Ta.', pop: 'Food is hot. Please allow it to cool.' },
      { on: false, sauce: 'bbq', say: 'Same again, mate. No onions, BBQ.', quirk: 'Do I need to sign anything?', ta: 'Legend.' }],
    [{ on: false, sauce: 'tomato', say: 'A snag with tomato. No onions.', quirk: "The pram wants to know if it's been risk-assessed.", ta: 'Lovely.' },
      { on: true, sauce: 'none', say: 'Onions, and no sauce. None, for safety.', quirk: "Don't tell the pram.", ta: 'Shh.' }],
    [{ on: true, sauce: 'bbq', say: 'Snag, onions, BBQ.', quirk: 'And a little bit for the dog.', ta: 'He says thanks.', pop: 'No dog detected.' },
      { on: false, sauce: 'tomato', say: 'One more. Tomato, no onions.', quirk: "The dog's not allowed onions.", ta: 'Good boy.' }],
    [{ on: true, sauce: 'none', say: 'Snag with onions. Sauce? None, for safety.', quirk: 'Is Santa insured for open flame?', ta: 'Sick.' },
      { on: true, sauce: 'tomato', say: 'Snag, onions, tomato.', quirk: "My chip says that's my snag for the year.", ta: 'Worth it.', pop: 'Annual snag allowance reached.' }],
    [{ on: false, sauce: 'bbq', say: 'Snag and BBQ. No onions.', quirk: 'Game day. We wear helmets for netball now.', ta: 'Cheers.' },
      { on: true, sauce: 'bbq', say: 'Snag with everything. Onions, BBQ.', quirk: "Is 'everything' allowed?", ta: 'Ta, Santa!' }],
  ];
  const OOPS = ["That's not what I said. I think.", 'Close. Not quite.', 'Is that... the same thing?', "I'll wait. It's Sunday."];
  const SAUCE_TXT = { tomato: 'TOMATO', bbq: 'BBQ', none: 'none, for safety' };

  // ---------------------------------------------------------- 2.6's lines (word for word)
  const INTRO = 'Nobody gets a favour from me on an empty stomach. Grab some tongs.';
  const EASY = 'Easy, Santa.';
  const BANTER = [
    { at: 2, steps: [
      { bark: 'chase', text: "Why's it called a snag?" },
      { bark: 'luke40', text: 'Nobody knows.' },
    ] },
    { at: 5, steps: [
      { bark: 'luke40', text: 'Had a 2IC once. Luka.', act: ['luke40', 'sizzle_flip'] },   // to Santa Luka, flipping beside him
      { bark: 'luka', text: '…Yeah?' },
      { bark: 'luke40', text: 'Best 2IC I ever had.' },
      { bark: 'luka', text: 'Really?' },
      { bark: 'luke40', text: "No. Nightmare. Did everything himself. Wouldn't let anyone else carry a box. Cleaned the displays till you could see your soul in them. ^ Miss him every day." },
      { turn: true },   // Luka turns a sausage that doesn't need turning.
    ] },
  ];

  // ---------------------------------------------------------- default 3-D lenses (sandgate): the station you're at
  // wide: faces in the top half; compact (landscape phone) and stack (portrait, where the world widens the lens to keep
  // the 16:9 field) aim lower so the faces stay above the cards
  const SHOTS = {
    luka: {   // across the plate at Luka (Santa) and Luke flipping beside him
      wide: { shot: 'CAM', pos: [-7.1, 1.66, -0.95], look: [-7.1, 1.02, -3.3], fov: 50 },
      compact: { shot: 'CAM', pos: [-7.1, 1.66, -0.95], look: [-7.1, 0.87, -3.3], fov: 50 },
      stack: { shot: 'CAM', pos: [-7.1, 1.66, -0.95], look: [-7.1, 0.08, -3.3], fov: 40 },
    },
    chase: {  // from the queue: the customer's back, Chase at the build spot, Chase (2040) lost at the cash tin, the hotplate behind
      wide: { shot: 'CAM', pos: [-3.9, 1.8, 1.9], look: [-5.4, 1.0, -1.5], fov: 50 },
      compact: { shot: 'CAM', pos: [-3.9, 1.8, 1.9], look: [-5.4, 0.43, -1.5], fov: 50 },
      stack: { shot: 'CAM', pos: [-3.9, 1.8, 1.9], look: [-5.4, -0.87, -1.5], fov: 40 },
    },
  };
  const MARKS = { luka: 'sz_luka', luke40: 'sz_luke', chase: 'sz_chase', chase40: 'sz_c40' };

  // ---------------------------------------------------------- state
  let api = null, ov = null, ctx = null, P = null, run = 0, done = true, bot = false, phase = 'off';
  let W = 0, H = 0, sch = '', layActive = '', S = null, hasSet = false;
  let target = 10, active = 'chase', T = 0, endT = 0, endWait = 0, swapFlash = 0;
  let served = 0, burnt = 0, burntTotal = 0, takeovers = 0, wrong = 0, turns = 0, stirs = 0, tray = 2, takeover = 0;
  let focusH = 0, focusF = 0, holdArmed = false, ptrHold = false, stirHold = 0, stirLock = false;
  let fbStr = '', fbT = 0, fbCol = '', fbCard = 0;
  // snags: st 0 empty (sW = time to lay one) · 1 cooking · 2 burnt (sW = time to the bin) · 3 lifting into the tray (sW)
  // sA = time cooked on the side facing down (the one cooking), sB = the side facing up; cA / cB = that side is charred
  const sSt = new Int8Array(6), sPh = new Int8Array(6), cA = new Int8Array(6), cB = new Int8Array(6);
  const sA = new Float32Array(6), sB = new Float32Array(6), sW = new Float32Array(6), sTA = new Float32Array(6), sRdy = new Float32Array(6);
  const upQ = new Int16Array(6), dnQ = new Int16Array(6);           // 3-D colours last sent (quantised); -1 gone, -2 unknown
  let oT = 0, oCook = 0, oChar = 0, oWob = -1, oQ = -1, catching = false, oWarned = false;
  // the front
  const cust = { st: 'walk', t: 0, rig: -1, visit: 0, ord: null, lines: [], split: 0, oops: '', oopsT: 0, n: 0 };
  const build = { bread: false, snag: false, onions: false, sauce: null };
  const stack = [];          // what was added, in order (for NO); at most 4
  let buildKey = -1, giveT = -1;
  // particles in hotplate-card space: x, y, vx, vy, life, max (+ kind: 0 smoke, 1 steam)
  const PN = 48, PT = new Float32Array(PN * 6), PK = new Int8Array(PN);
  // banter
  let banter = null, bi = 0, bRun = false;
  // 3-D
  let luka = null, luke = null, chase = null, c40 = null, c40T = 0;
  const v3 = new THREE.Vector3();
  const SO = { vol: 1, rate: 1 };
  // strings (built at start / on a scheme change, never per frame)
  const STR_N = [];
  let STR_S = [], STR_C = [];
  let swapKey = 'Tab', swapKW = 20, hintHot = '', hintFront = '';
  // layout in CSS px: mode 'wide' (both cards) | 'compact' (landscape: card + tab) | 'stack' (portrait: card + tab)
  const L = { mode: 'wide', s: 1, top: 0, bottom: 0, strip: { x: 0, y: 0, w: 0 },
    hot: { x: 0, y: 0, w: 0, h: 0, tab: false, horiz: false }, front: { x: 0, y: 0, w: 0, h: 0, tab: false, horiz: false } };
  // pointer drag at the front: -1 none, 0..4 an ingredient, 6 the sandwich
  let drag = -1, dragX0 = 0, dragY0 = 0, dragMoved = false, ptrMX = -1, ptrMY = -1;

  // ---------------------------------------------------------- DOM: only a <style> while it runs (the bark box goes up top,
  // the objective line and the unused touch stick / BAG step aside); the host empties #mg at finish, which removes it
  let root = null, styleEl = null, barkTop = -1;
  function makeRoot() {
    root = document.createElement('div'); root.className = 'mg-sz';
    styleEl = document.createElement('style');
    root.appendChild(styleEl);
  }
  function setStyle(top) {         // on a layout change only
    if (top === barkTop) return;
    barkTop = top;
    styleEl.textContent = '.mg-sz{display:none}#ui #bark{top:' + top + 'px!important;bottom:auto!important}#ui #obj{opacity:0!important}' +
      '#ui.touchui #stick,#ui.touchui #t-bag{opacity:0!important;pointer-events:none!important}';
  }

  // ---------------------------------------------------------- helpers
  const snd = (name, vol, rate) => { SO.vol = vol; SO.rate = rate || 1; if (api && api.sfx) api.sfx(name, SO); };
  const actorOf = (id) => (api && api.world && api.world.actor ? api.world.actor(id) : null);
  function fb(text, col, card) { fbStr = text; fbT = 1.5; fbCol = col || C.warn; fbCard = card === undefined ? (active === 'luka' ? 0 : 1) : card; }
  function setS() {
    S = typeof SETS !== 'undefined' && SETS.sandgate && typeof world !== 'undefined' && world.setId === 'sandgate' ? SETS.sandgate : null;
    hasSet = !!(S && S.sizzle && S.queue);
  }
  function phaseOf(t) { return t < tBrown ? 0 : t < tReady ? 1 : t < tBurn ? 2 : t < tBurnt ? 3 : 4; }
  function labels() {
    sch = api.input.scheme;
    const hp = typeof options !== 'undefined' && options.holdToPress;
    swapKey = sch === 'pad' ? 'Y' : sch === 'touch' ? '' : 'Tab';   // touch: the card itself (or the SWAP button) swaps
    ctx.font = F10B; swapKW = swapKey ? ctx.measureText(swapKey).width : -12;
    if (sch === 'touch') {
      hintHot = 'Tap a snag to turn it · ' + (hp ? 'tap' : 'hold') + ' the onions to stir';
      hintFront = 'Tap, or drag onto the bread';
    } else {
      const y = sch === 'pad' ? 'A' : 'Enter', n = sch === 'pad' ? 'B' : 'Esc';
      hintHot = '◀ ▶ pick · ' + y + ' turn · ' + (hp ? 'press ' : 'hold ') + y + ' on the onions: stir';
      hintFront = '◀ ▶ pick · ' + y + ' add · ' + n + ' take back';
    }
  }

  // ---------------------------------------------------------- 3-D mirror (sandgate's sizzle + queue APIs; all guarded)
  function snag3(i, up, dn) {        // u in the set's colour space (0 raw .25 browning .5 ready .75 burning 1 burnt); up < 0 = gone
    if (!hasSet) return;
    if (up < 0) { if (upQ[i] !== -1) { upQ[i] = dnQ[i] = -1; S.sizzle.snag(i, 'gone'); } return; }
    const a = Math.round(up * 48), b = Math.round(dn * 48);
    if (upQ[i] < 0) { S.sizzle.snag(i, up); upQ[i] = dnQ[i] = a; }      // from gone / unknown: both sides at once
    if (upQ[i] !== a) { S.sizzle.snag(i, up, 'up'); upQ[i] = a; }
    if (dnQ[i] !== b) { S.sizzle.snag(i, dn, 'down'); dnQ[i] = b; }
  }
  function cookU(t) {                // a side's colour from its cooking time
    if (t < tReady) return 0.5 * t / tReady;
    if (t < tBurn) return 0.5;
    if (t < tBurnt) return 0.55 + 0.35 * (t - tBurn) / (tBurnt - tBurn);
    return 1;
  }
  function mirrorSnags() {
    if (!hasSet) return;
    for (let i = 0; i < 6; i++) {
      if (sTA[i] >= 0) continue;     // mid-roll: the set swaps the two colours itself
      const st = sSt[i];
      if (st === 0) snag3(i, -1, 0);
      else if (st === 2) snag3(i, 1, 1);
      else if (st === 3) { if (sW[i] < LIFT * 0.4) snag3(i, -1, 0); }
      else snag3(i, cB[i] ? 0.8 : cookU(sB[i]), cA[i] ? 0.8 : cookU(sA[i]));
    }
  }
  function mirrorOnions() {
    if (!hasSet) return;
    const u = Math.min(1, oCook * 0.6 + oChar * 0.4), k = Math.round(u * 32);
    if (k !== oQ) { oQ = k; S.sizzle.onions(u); }
  }
  function mirrorBuild() {
    const k = (build.bread ? 1 : 0) + (build.snag ? 2 : 0) + (build.onions ? 4 : 0) + (build.sauce === 'tomato' ? 8 : build.sauce === 'bbq' ? 16 : 0);
    if (k === buildKey) return;
    buildKey = k;
    if (hasSet) S.sizzle.build(build);
  }

  // ---------------------------------------------------------- hotplate
  function lay(i, t0) {
    sSt[i] = 1; sA[i] = t0 || 0; sB[i] = 0; cA[i] = cB[i] = 0; sPh[i] = phaseOf(sA[i]); sTA[i] = -1; sRdy[i] = 0;
    if (hasSet) { S.sizzle.snag(i, 'raw'); upQ[i] = dnQ[i] = 0; }
  }
  function plateNeed() {
    let cooking = 0;
    for (let i = 0; i < 6; i++) if (sSt[i] === 1 || sSt[i] === 3) cooking++;
    return target - served + 1 - tray - (build.snag ? 1 : 0) - cooking;   // one spare (Luke's lunch)
  }
  // who: 0 the player, 1 Luke, 2 the banter (a sausage that doesn't need turning)
  function turn(i, who) {
    if (i < 0 || i > 5) return false;
    if (sSt[i] !== 1 || sTA[i] >= 0) { if (!who && sSt[i] === 0) fb('Nothing there.', C.sub, 0); return false; }
    const ph = sPh[i];
    if (ph === 4) return false;
    sTA[i] = 0;
    if (hasSet) S.sizzle.turn(i); else { snd('sizzle', 0.3, 1.5); snd('tick', 0.5, 0.7); }
    if (who !== 1 && luka && takeover <= 0) luka.play('sizzle_flip');
    if (ph === 3) cA[i] = 1;
    if (ph >= 2 && sB[i] >= tReady) {     // both sides done: off the plate and into the tray
      sSt[i] = 3; sW[i] = LIFT; sRdy[i] = 0; turns++;
      if (!who) fb(cA[i] || cB[i] ? 'Into the tray. A bit charred.' : 'Into the tray.', C.good, 0);
      return true;
    }
    // a turn: the other side goes down
    let t = sA[i]; sA[i] = sB[i]; sB[i] = t;
    t = cA[i]; cA[i] = cB[i]; cB[i] = t;
    if (hasSet) { t = upQ[i]; upQ[i] = dnQ[i]; dnQ[i] = t; }   // the set swaps its colours mid-roll
    sPh[i] = phaseOf(sA[i]); sRdy[i] = 0;
    if (ph >= 2) { turns++; if (!who) fb(ph === 3 ? 'Saved it. Charred.' : 'Turned.', ph === 3 ? C.warn : C.good, 0); }
    else if (!who) fb('Not yet.', C.sub, 0);
    return true;
  }
  function stir(who) {
    oT = 0; stirs++; oChar *= 0.4; catching = false; oWob = 0; oWarned = false;
    if (hasSet) S.sizzle.stir(); else snd('sizzle', 0.3, 1.1);
    puff(364, 108, 1, 6);
    if (!who) fb('Stirred.', C.good, 0);
  }
  function startTakeover() {
    takeover = TAKEOVER; takeovers++; burnt = 0;
    if (typeof bark === 'function') bark('luke40', EASY);
    snd('clunk', 0.35, 1.2);
    const id = run;
    if (luke) luke.moveTo('sz_luke_takeover').then(() => { if (id === run && luke) luke.play('sizzle_flip'); });
    if (luka) { luka.hold(null); luka.moveTo('sz_luka_aside').then(() => { if (id === run && luka) luka.play('arms_crossed'); }); }
    emit('sizzle:takeover', takeovers);
    if (P.onTakeover) P.onTakeover(takeovers);
  }
  function endTakeover() {
    takeover = 0;
    const id = run;
    if (luke) luke.moveTo('sz_luke').then(() => { if (id === run && luke) luke.play('sizzle_flip'); });
    if (luka) luka.moveTo('sz_luka').then(() => { if (id !== run || !luka) return; if (hasSet) luka.hold('tongs_spare'); luka.play('sizzle_flip'); });
    if (phase === 'play') fb('Your tongs, Santa.', C.sub, 0);
  }
  function cookTick(k) {
    for (let i = 0; i < 6; i++) {
      if (sTA[i] >= 0) { sTA[i] += k / TURN_T; if (sTA[i] >= 1) sTA[i] = -1; }
      const st = sSt[i];
      if (st === 0) {
        if ((sW[i] -= k) <= 0) { if (plateNeed() > 0) lay(i, 0); else sW[i] = 0.5; }
      } else if (st === 2) {
        if ((sW[i] -= k) <= 0) { sSt[i] = 0; sW[i] = LAY; if (!hasSet) snd('thud', 0.25, 1.6); }
        else if (Math.random() < k * 3) puff(36 + i * 46, 80, 0, 1);
      } else if (st === 3) {
        if ((sW[i] -= k) <= 0) { sSt[i] = 0; sW[i] = LAY; tray++; }
      } else {
        sA[i] += k * SPD[i];
        const ph = phaseOf(sA[i]);
        if (ph === 2 || ph === 3) sRdy[i] += k;
        if (ph !== sPh[i]) {
          sPh[i] = ph;
          if (ph === 2) snd('tick', 0.45, 1.35);
          else if (ph === 3) snd('steam', 0.22, 0.75);
          else if (ph === 4) {
            sSt[i] = 2; sW[i] = SCRAPE; burnt++; burntTotal++;
            snd('smoke_pop', 0.4, 1); puff(36 + i * 46, 86, 0, 5);
            fb('Burnt one.', C.bad, 0);
            emit('sizzle:burnt', burntTotal); if (P.onBurnt) P.onBurnt(burntTotal);
            if (burnt >= 3 && takeover <= 0) startTakeover();
          }
        }
        if (ph === 3 && Math.random() < k * 4) puff(36 + i * 46, 84, 0, 1);
      }
    }
  }
  function onionTick(k) {
    oT += k; oCook = Math.min(1, oCook + k * 0.012);
    if (oT > tCatch) {
      if (!catching) { catching = true; snd('steam', 0.3, 0.6); fb('Onions are catching!', C.bad, 0); }
      oChar = Math.min(1, oChar + k * 0.08);
      if (Math.random() < k * 3) puff(364, 108, 0, 1);
    } else if (oT > tStir && !oWarned) { oWarned = true; snd('sizzle', 0.18, 0.8); }
    if (oWob >= 0) { oWob += k / 0.35; if (oWob >= 1) oWob = -1; }
  }
  function takeoverTick(k) {
    if (takeover <= 0) return;
    takeover -= k;
    for (let i = 0; i < 6; i++) if (sSt[i] === 1 && sTA[i] < 0 && (sPh[i] === 3 || (sPh[i] === 2 && sRdy[i] > 0.35))) { turn(i, 1); break; }
    if (oT > tStir * 0.7) stir(1);
    if (takeover <= 0) endTakeover();
  }
  function puff(x, y, kind, n) {
    for (let j = 0, m = 0; j < PN && m < n; j++) {
      const o = j * 6;
      if (PT[o + 4] > 0) continue;
      PT[o] = x + (Math.random() - 0.5) * 16; PT[o + 1] = y + (Math.random() - 0.5) * 8;
      PT[o + 2] = (Math.random() - 0.5) * 10; PT[o + 3] = -14 - Math.random() * 16;
      PT[o + 4] = PT[o + 5] = 0.9 + Math.random() * 0.7; PK[j] = kind; m++;
    }
  }
  function partTick(k) {
    for (let j = 0; j < PN; j++) {
      const o = j * 6;
      if (PT[o + 4] <= 0) continue;
      PT[o] += PT[o + 2] * k; PT[o + 1] += PT[o + 3] * k; PT[o + 2] *= 1 - k; PT[o + 4] -= k;
    }
  }

  // ---------------------------------------------------------- the front
  function wrap(str, font, maxW, out) {     // on a customer change only (allocates)
    ctx.font = font;
    let line = '';
    const words = str.split(' ');
    for (let i = 0; i < words.length; i++) {
      const t = line ? line + ' ' + words[i] : words[i];
      if (ctx.measureText(t).width > maxW && line) { out.push(line); line = words[i]; } else line = t;
    }
    if (line) out.push(line);
  }
  function beginOrder(rig) {
    cust.rig = rig;
    cust.visit = hasSet && S.queue.visits ? Math.min(1, S.queue.visits(rig) | 0) : Math.min(1, (served / 5) | 0);
    cust.ord = ORDERS[((rig % 5) + 5) % 5][cust.visit];
    cust.st = 'order'; cust.t = 0; cust.oopsT = 0; cust.n = served + 1;
    cust.lines.length = 0;
    wrap(cust.ord.say, F13B, 228, cust.lines); cust.split = cust.lines.length;
    wrap(cust.ord.quirk, F13, 228, cust.lines);
  }
  function frontTick(k) {
    cust.t += k;
    if (cust.oopsT > 0) cust.oopsT -= k;
    if (cust.st === 'walk') {
      if (served >= target) return;
      if (hasSet) { const i = S.queue.front(); if (i >= 0) beginOrder(i); else if (cust.t > 6) beginOrder(served % 5); }
      else if (cust.t > WALK) beginOrder(served % 5);
    } else if (cust.st === 'paid') {
      if (cust.t > PAY) { cust.st = 'walk'; cust.t = 0; cust.ord = null; }
    }
    if (giveT >= 0) { giveT += k / 0.5; if (giveT >= 1) giveT = -1; }
    // Chase (2040) at the tin: looks in, looks up, looks in
    if (c40 && (c40T -= k) <= 0) { c40T = 5 + Math.random() * 4; c40.play(Math.random() < 0.5 ? 'think' : 'look_down'); }
  }
  const ING = ['BREAD', 'SNAG', 'ONIONS', 'TOMATO', 'BBQ', 'HAND OVER'];
  const BTN_X = [10, 76, 142, 212, 282, 344], BTN_W = [60, 60, 64, 64, 56, 86], BTN_Y = 180, BTN_H = 44;
  const WHY = ['', 'Got bread.', 'Bread first.', 'One snag each.', 'No snags cooked. SWAP to Luka.', 'Onions are on.', 'Onions are catching. SWAP to Luka.', 'One sauce.'];
  function canAdd(k) {               // 0 = ok, else an index into WHY
    if (k === 0) return build.bread ? 1 : 0;
    if (!build.bread) return 2;
    if (k === 1) return build.snag ? 3 : tray <= 0 ? 4 : 0;
    if (k === 2) return build.onions ? 5 : catching ? 6 : 0;
    if (k === 3 || k === 4) return build.sauce ? 7 : 0;
    return 0;
  }
  function add(k) {
    if (phase !== 'play') return false;
    if (k === 5) return handOver();
    const r = canAdd(k);
    if (r) { fb(WHY[r], r === 4 || r === 6 ? C.bad : C.warn, 1); snd('clunk', 0.3, 1.3); return false; }
    if (k === 0) build.bread = true;
    else if (k === 1) { build.snag = true; tray--; }
    else if (k === 2) build.onions = true;
    else { build.sauce = k === 3 ? 'tomato' : 'bbq'; if (hasSet) S.sizzle.squeeze(build.sauce); }
    if (k < 3 || !hasSet) snd('pop', 0.3, k === 0 ? 0.8 : k === 1 ? 0.65 : k === 2 ? 1.1 : 0.55);
    if (stack.length < 4) stack.push(k);
    if (chase) chase.play('tap', { dur: 0.45, loop: false });
    mirrorBuild();
    focusF = k === 0 ? 1 : k === 1 ? 2 : k === 2 ? 3 : 5;   // on to the next sensible button
    return true;
  }
  function undo() {
    if (!stack.length) { fb('Nothing to take back.', C.sub, 1); return; }
    const k = stack.pop();
    if (k === 0) { if (build.snag) tray++; build.bread = build.snag = build.onions = false; build.sauce = null; stack.length = 0; }
    else if (k === 1) { build.snag = false; tray++; }
    else if (k === 2) build.onions = false;
    else build.sauce = null;
    focusF = k;
    snd('tick', 0.4, 0.8);
    mirrorBuild();
  }
  function handOver() {
    if (cust.st !== 'order' || !cust.ord) { fb('Nobody at the front yet.', C.sub, 1); return false; }
    if (!build.bread) { fb('Bread first.', C.warn, 1); snd('clunk', 0.3, 1.3); return false; }
    if (!build.snag) { fb('It needs a snag.', C.warn, 1); snd('clunk', 0.3, 1.3); return false; }
    const o = cust.ord;
    if (build.onions !== o.on || (build.sauce || 'none') !== o.sauce) {   // back it comes; the snag goes back in the tray
      wrong++; cust.oops = OOPS[(wrong - 1) % OOPS.length]; cust.oopsT = 1.8;
      snd('sad_beep', 0.35, 1);
      tray++; build.bread = build.snag = build.onions = false; build.sauce = null; stack.length = 0; mirrorBuild(); focusF = 0;
      if (chase) chase.play('shrug');
      fb('Wrong order. Check the docket.', C.bad, 1);
      return false;
    }
    served++;
    if (hasSet) { S.sizzle.give(); S.queue.advance(); }
    giveT = 0; buildKey = 0;                 // the set hides its sandwich after the slide
    build.bread = build.snag = build.onions = false; build.sauce = null; stack.length = 0;
    cust.st = 'paid'; cust.t = 0; focusF = 0;
    snd('chip_chime', 0.5, 1);
    if (chase) chase.play('give');
    if (c40) { c40.play('shrug'); c40T = 3; }
    if (o.pop && hasSet && S.queue.bubble && typeof popup === 'function') {   // their chip has something to say
      S.queue.bubble(cust.rig, v3); v3.y -= 0.75;   // about the chest
      const p = api.cam.project(v3), m = 130;
      if (L.top >= 220) {         // (only where there's room above the cards)
        if (p.visible && p.x > m && p.x < innerWidth - m && p.y > 60 && p.y < L.top - 30) popup({ style: 'safesense', msg: o.pop, buttons: [], dur: 2.4, w: 220, at: { pos: [v3.x, v3.y, v3.z] } });
        else popup({ style: 'safesense', msg: o.pop, buttons: [], dur: 2.4, w: 220, at: [0.5, Math.max(0.14, Math.min(0.4, (L.top - 70) / innerHeight))] });
      }
    }
    emit('sizzle:served', served); if (P.onServe) P.onServe(served, o);
    if (TEST.auto) testLog('sizzle: served ' + served + ' at ' + T.toFixed(1) + ' s');
    if (served >= target) finishPlay();
    return true;
  }
  function finishPlay() {
    phase = 'done'; endT = 2.2; endWait = 0;
    snd('chime_ready', 0.6, 1);
    if (hasSet && S.queue.live) S.queue.live(false);
    if (takeover > 0) endTakeover();
  }

  // ---------------------------------------------------------- banter (barks over play; never pauses it)
  async function runBanter(b) {
    bRun = true;
    const id = run;
    try {
      for (let i = 0; i < b.steps.length; i++) {
        if (id !== run || done) return;
        const st = b.steps[i];
        if (st.act) { const a = actorOf(st.act[0]); if (a) a.play(st.act[1], st.act[2]); }
        if (st.bark) { if (typeof bark === 'function') await bark(st.bark, st.text, st.tag ? { tag: st.tag } : undefined); }
        else if (st.turn) autoTurn();
        else if (st.wait) await wait(st.wait);
        else if (st.do) await st.do(api);
      }
    } finally { if (id === run) bRun = false; }
  }
  function banterTick() {
    if (bRun || !banter || bi >= banter.length) return;
    if (served >= banter[bi].at) runBanter(banter[bi++]);
  }
  function autoTurn() {             // the sausage that doesn't need turning
    let pick = -1;
    if (focusH < 6 && sSt[focusH] === 1 && sPh[focusH] <= 1 && sTA[focusH] < 0) pick = focusH;
    for (let i = 0; i < 6 && pick < 0; i++) if (sSt[i] === 1 && sPh[i] <= 1 && sTA[i] < 0) pick = i;
    if (pick >= 0) turn(pick, 2);
  }

  // ---------------------------------------------------------- swapping stations
  let shotKey = '';
  function shotFor(who) {
    const sh = P.shots && P.shots[who];
    if (sh) return sh;
    if (S) return SHOTS[who][L.mode];
    return who === 'luka' ? MID_LUKA : MID_CHASE;
  }
  const MID_LUKA = { shot: 'MID', on: 'luka' }, MID_CHASE = { shot: 'MID', on: 'chase' };
  function applyShot() {          // on a swap, and when the layout mode changes (a resize)
    shotKey = L.mode; shotWho = active;
    if (api.cam && api.cam.shot) api.cam.shot(shotFor(active));
  }
  let shotWho = '';
  function swap(to) {
    const nx = to || (active === 'luka' ? 'chase' : 'luka');
    if (nx === active) return;
    active = nx; swapFlash = 1; holdArmed = false; ptrHold = false; stirHold = 0; drag = -1;
    if (active === 'luka') {          // straight to the most urgent snag
      let best = -1, bu = 0;
      for (let i = 0; i < 6; i++) if (sSt[i] === 1) { const u = sPh[i] === 3 ? 10 : sPh[i] === 2 ? 5 + sRdy[i] : 0; if (u > bu) { bu = u; best = i; } }
      if (best >= 0) focusH = best; else if (oT > tStir) focusH = 6;
    } else focusF = !build.bread ? 0 : !build.snag ? 1 : focusF;
    applyShot();
    snd('whoosh', 0.16, 1.9);
    emit('sizzle:swap', active);
  }

  // ---------------------------------------------------------- input
  function inRect(x, y, r) { return x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h; }
  function hotAt(dx, dy) {          // hotplate-card design coords -> 0..5 a snag, 6 the onions, -1
    if (dy < 36 || dy > 206) return -1;
    if (dx >= 302 && dx <= 430) return 6;
    for (let i = 0; i < 6; i++) if (Math.abs(dx - (36 + i * 46)) <= 22) return i;
    return -1;
  }
  function frontAt(dx, dy) {        // front-card design coords -> 0..5 a button, 6 the sandwich, 7 the bubble, -1
    if (dy >= BTN_Y && dy <= BTN_Y + BTN_H) { for (let k = 0; k < 6; k++) if (dx >= BTN_X[k] && dx <= BTN_X[k] + BTN_W[k]) return k; return -1; }
    if (dy >= 30 && dy <= 136) return dx >= 272 ? 6 : 7;
    return -1;
  }
  function pointerDown(px, py) {
    const h = L.hot, f = L.front;
    if (inRect(px, py, h)) {
      if (active !== 'luka') swap('luka');
      if (h.tab || phase !== 'play') return;
      const i = hotAt((px - h.x) / L.s, (py - h.y) / L.s);
      if (i < 0) return;
      focusH = i;
      if (i === 6) { ptrHold = true; holdArmed = true; stirLock = false; }
      else if (takeover > 0) fb("Luke's got it.", C.sub, 0);
      else turn(i, 0);
      return;
    }
    if (inRect(px, py, f)) {
      if (active !== 'chase') swap('chase');
      if (f.tab || phase !== 'play') return;
      const k = frontAt((px - f.x) / L.s, (py - f.y) / L.s);
      if (k < 0 || k === 7) return;
      if (k === 6) { if (build.bread) { drag = 6; dragX0 = px; dragY0 = py; dragMoved = false; } return; }
      focusF = k;
      if (k === 5) { add(5); return; }
      drag = k; dragX0 = px; dragY0 = py; dragMoved = false;
    }
  }
  function pointerUp(px, py) {
    const k = drag; drag = -1; ptrHold = false;
    if (k < 0 || phase !== 'play') return;
    if (!dragMoved) { if (k < 6) add(k); return; }
    const f = L.front, inF = inRect(px, py, f), dk = inF ? frontAt((px - f.x) / L.s, (py - f.y) / L.s) : -1;
    if (k === 6) { if (!inF || dk === 7) add(5); return; }    // the sandwich up onto the customer (the bubble, or the shot)
    if (dk === 6 || dk === 7) add(k);                          // an ingredient onto the bread
  }
  function inputs(dt) {
    const I = api.input, p = I.pointer;
    if (p.pressed && !(I.pressed('no') && !I.pressed('yes'))) { I.consume('yes'); pointerDown(p.x, p.y); }
    if (drag >= 0 && p.down && (Math.abs(p.x - dragX0) > 9 || Math.abs(p.y - dragY0) > 9)) dragMoved = true;
    if (p.released || (!p.down && (drag >= 0 || ptrHold))) pointerUp(p.x, p.y);
    if (I.scheme === 'kb' && (p.x !== ptrMX || p.y !== ptrMY)) {   // the mouse moves the focus
      ptrMX = p.x; ptrMY = p.y;
      const r = active === 'luka' ? L.hot : L.front;
      if (!r.tab && inRect(p.x, p.y, r)) {
        const dx = (p.x - r.x) / L.s, dy = (p.y - r.y) / L.s;
        if (active === 'luka') { const i = hotAt(dx, dy); if (i >= 0 && i !== focusH && !ptrHold) { focusH = i; holdArmed = false; } }
        else { const k = frontAt(dx, dy); if (k >= 0 && k < 6) focusF = k; }
      }
    }
    if (I.pressed('swap')) { I.consume('swap'); swap(); }
    if (phase !== 'play') return;
    const dir = I.pressed('left') ? -1 : I.pressed('right') ? 1 : 0;
    if (active === 'luka') {
      if (dir) { focusH = (focusH + dir + 7) % 7; holdArmed = false; snd('tick', 0.2, 1.6); }
      if (I.pressed('up') && focusH !== 6) { focusH = 6; holdArmed = false; }
      else if (I.pressed('down') && focusH === 6) { focusH = 5; holdArmed = false; }
      if (I.pressed('yes')) {
        if (focusH === 6) { holdArmed = true; stirLock = false; }
        else if (takeover > 0) fb("Luke's got it.", C.sub, 0);
        else turn(focusH, 0);
      }
      stirTick(focusH === 6 && ((holdArmed && I.holding('yes')) || (ptrHold && p.down)), dt);
    } else {
      if (dir) { focusF = (focusF + dir + 6) % 6; snd('tick', 0.2, 1.6); }
      if (I.pressed('yes')) add(focusF);
      if (I.pressed('no')) { I.consume('no'); undo(); }
      stirTick(false, dt);
    }
  }
  function stirTick(holding, k) {
    if (!holding) { stirHold = 0; stirLock = false; if (!ptrHold && !api.input.holding('yes')) holdArmed = false; return; }
    if (stirLock) return;
    if (takeover > 0) { fb("Luke's got it.", C.sub, 0); stirLock = true; return; }
    stirHold += k;
    if (stirHold >= HOLD) { stirHold = 0; stirLock = true; stir(0); if (api.input.unlatch) api.input.unlatch('yes'); holdArmed = false; ptrHold = false; }
  }

  // ---------------------------------------------------------- autoplay: a deterministic bot (same actions as the player)
  let botT = 0, botHold = false, botWrong = false, botForce = -1, botClock = 0;
  function botTick(k) {
    botClock += k;
    if (botHold) { holdArmed = true; stirTick(true, k); if (stirLock) { botHold = false; stirLock = false; } return; }
    if ((botT -= k) > 0) return;
    botT = 0.16;
    if (phase !== 'play') return;
    if (botClock > 240) { finishPlay(); return; }
    const neglect = served >= 2 && takeovers === 0;   // lets three burn once, so Luke takes the tongs
    let hotU = 0, hotI = -1;
    if (takeover <= 0 && !neglect) {
      for (let i = 0; i < 6; i++) if (sSt[i] === 1 && sTA[i] < 0) { const u = sPh[i] === 3 ? 9 : sPh[i] === 2 ? 3 + sRdy[i] : 0; if (u > hotU) { hotU = u; hotI = i; } }
      if (oT > tStir * 0.85 && hotU < 9) { hotU = Math.max(hotU, oT > tStir ? 8 : 2.5); hotI = 6; }
    }
    const o = cust.ord, frontU = cust.st === 'order' && o ? (build.snag || tray > 0 ? 4 : 0) : 0;
    if (active === 'luka') {
      if (hotI < 0 || (hotU < 4 && frontU >= 4)) { if (frontU > 0 || takeover > 0 || neglect) swap('chase'); return; }
      if (focusH !== hotI) { focusH = hotI; return; }
      if (hotI === 6) { holdArmed = true; botHold = true; stirLock = false; stirHold = 0; return; }
      turn(hotI, 0); return;
    }
    if (hotU >= 6 || (hotI >= 0 && frontU === 0)) { swap('luka'); return; }
    if (!o || cust.st !== 'order') return;
    let want = 5;
    if (!build.bread) want = 0;
    else if (!build.snag) want = tray > 0 ? 1 : -1;
    else if (o.on && !build.onions) want = catching ? -1 : 2;
    else if (o.sauce !== 'none' && !build.sauce) want = o.sauce === 'tomato' ? 3 : 4;
    if (!botWrong && served === 1 && build.snag && !build.sauce && o.sauce !== 'none') { botWrong = true; botForce = o.sauce === 'tomato' ? 4 : 3; }   // one wrong sauce, on purpose
    if (botForce >= 0 && build.snag && !build.sauce) want = botForce;
    if (want < 0) { if (!neglect && takeover <= 0) swap('luka'); return; }
    if (focusF !== want) { focusF = want; return; }
    if (add(want) && want === botForce) botForce = -1;
  }

  // ---------------------------------------------------------- layout (on resize / scheme / station change; not per frame)
  function layout() {
    W = innerWidth; H = innerHeight; labels(); layActive = active;
    const touch = sch === 'touch', portrait = W < 560 || W < H * 0.8;
    const m = W < 700 ? 12 : 16, rightRes = touch && !portrait ? 206 : 0, bottom = touch && portrait ? 206 : m;
    const availW = W - m * 2 - rightRes;
    const wideS = Math.min((availW - GAP) / (CW * 2), (H * 0.46) / (CH + SH + 4), 1.6);
    const hot = L.hot, fr = L.front;
    hot.horiz = fr.horiz = false;
    if (!portrait && wideS >= 0.78) {
      L.mode = 'wide'; const s = L.s = wideS;
      const tw = (CW * 2 + GAP) * s, x0 = m + (availW - tw) / 2, y0 = H - bottom - CH * s;
      hot.x = x0; hot.y = y0; hot.w = CW * s; hot.h = CH * s; hot.tab = false;
      fr.x = x0 + (CW + GAP) * s; fr.y = y0; fr.w = CW * s; fr.h = CH * s; fr.tab = false;
      L.strip.x = x0; L.strip.w = tw; L.strip.y = y0 - (SH + 4) * s;
    } else if (!portrait) {
      L.mode = 'compact';
      const s = L.s = Math.min((availW - GAP) / (CW + TW), (H - 104) / (CH + SH + 4), 1.4);   // the top ~100 px: the bark box, the HUD
      const tw = (CW + TW + GAP) * s, x0 = m + (availW - tw) / 2, y0 = H - bottom - CH * s;
      const big = active === 'luka' ? hot : fr, small = active === 'luka' ? fr : hot;
      big.x = active === 'luka' ? x0 : x0 + (TW + GAP) * s; small.x = active === 'luka' ? x0 + (CW + GAP) * s : x0;
      big.y = small.y = y0; big.w = CW * s; small.w = TW * s; big.h = small.h = CH * s; big.tab = false; small.tab = true;
      L.strip.x = x0; L.strip.w = tw; L.strip.y = y0 - (SH + 4) * s;
    } else {
      L.mode = 'stack';
      const s = L.s = Math.min((W - m * 2) / CW, (H - bottom - 120) / (CH + TH + SH + GAP + 4), 1.4);
      const x0 = (W - CW * s) / 2, yt = H - bottom - (CH + TH + GAP) * s;   // the hotplate always above the front
      const big = active === 'luka' ? hot : fr, small = active === 'luka' ? fr : hot;
      if (active === 'luka') { hot.y = yt; fr.y = yt + (CH + GAP) * s; } else { hot.y = yt; fr.y = yt + (TH + GAP) * s; }
      big.x = small.x = x0; big.w = small.w = CW * s; big.h = CH * s; small.h = TH * s; big.tab = false; small.tab = true; small.horiz = true;
      L.strip.x = x0; L.strip.w = CW * s; L.strip.y = yt - (SH + 4) * s;
    }
    L.top = L.strip.y; L.bottom = Math.max(hot.y + hot.h, fr.y + fr.h);
    // the bark box: up top, clear of the cards (and of the HUD / pause button where they share the row)
    const bw = Math.min(440, W * 0.72) + 18, hudL = W - 300;
    setStyle(L.mode === 'stack' ? (touch ? 118 : 58) : H < 520 && bw + 10 < hudL ? 8 : 58);
  }

  // ---------------------------------------------------------- drawing (pure: reads state, writes pixels)
  let K = 1;   // CSS px -> canvas px
  function tf(x, y, s) { ctx.setTransform(K * s, 0, 0, K * s, K * x, K * y); }
  function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
  function text(str, x, y, font, col, align) { ctx.font = font; ctx.fillStyle = col; ctx.textAlign = align || 'left'; ctx.fillText(str, x, y); }
  function textW(str, x, y, font, col, mw) { ctx.font = font; ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.fillText(str, x, y, mw); }   // squeezed to fit
  const pulse = (hz) => 0.5 + 0.5 * Math.sin(T * TAU * (typeof options !== 'undefined' && options.reduceFlashing ? hz * 0.4 : hz));
  let pcLuka = null, pcChase = null;   // the baked portraits (fetched at start)
  function portrait(id, x, y, sz, on) {
    const pc = id === 'luka' ? pcLuka : pcChase;
    rr(x - 2, y - 2, sz + 4, sz + 4, 7); ctx.fillStyle = on ? C.yes : C.line; ctx.fill();
    ctx.save(); rr(x, y, sz, sz, 6); ctx.clip();
    if (pc) ctx.drawImage(pc, x, y, sz, sz); else { ctx.fillStyle = '#26325e'; ctx.fillRect(x, y, sz, sz); }
    ctx.restore();
    if (id === 'luka' && state.flags && state.flags.santa) {   // the disguise
      ctx.fillStyle = C.red; ctx.beginPath(); ctx.moveTo(x + sz * 0.08, y + sz * 0.3); ctx.quadraticCurveTo(x + sz * 0.5, y - sz * 0.55, x + sz * 1.1, y - sz * 0.02); ctx.lineTo(x + sz * 0.92, y + sz * 0.3); ctx.fill();
      ctx.fillStyle = C.white; rr(x, y + sz * 0.22, sz * 0.94, sz * 0.17, sz * 0.08); ctx.fill();
      ctx.beginPath(); ctx.arc(x + sz * 1.08, y - sz * 0.02, sz * 0.12, 0, TAU); ctx.fill();
    }
  }
  function frame(w, h, on, alert) {
    rr(0, 0, w, h, 14); ctx.fillStyle = C.panel; ctx.fill();
    if (on && swapFlash > 0) { ctx.globalAlpha = 0.5 * swapFlash; ctx.lineWidth = 3 + 12 * swapFlash; ctx.strokeStyle = C.yes; ctx.stroke(); ctx.globalAlpha = 1; }   // the station you just swapped to
    ctx.lineWidth = on ? 3 : 2;
    if (on) ctx.strokeStyle = C.yes;
    else if (alert) { ctx.strokeStyle = C.bad; ctx.globalAlpha = 0.45 + 0.55 * pulse(1.6); }
    else ctx.strokeStyle = C.line;
    ctx.stroke(); ctx.globalAlpha = 1;
    if (on) { ctx.fillStyle = C.yes; ctx.fillRect(14, 0, w - 28, 2); }
  }
  function swapPill(xr, y, alert) {          // right edge at xr
    const w = swapKW + 56;
    rr(xr - w, y, w, 18, 9); ctx.fillStyle = alert && pulse(1.6) > 0.5 ? C.yes : '#e8e8ee'; ctx.fill();
    text('SWAP', xr - w + 8, y + 12.5, F10B, C.navy);
    if (!swapKey) return;
    rr(xr - swapKW - 13, y + 2, swapKW + 10, 14, 7); ctx.fillStyle = C.navy; ctx.fill();
    text(swapKey, xr - 8, y + 12.5, F10B, C.white, 'right');
  }
  function hotAlert() {
    if (takeover > 0 || phase !== 'play') return 0;
    let a = 0;
    for (let i = 0; i < 6; i++) if (sSt[i] === 1) { if (sPh[i] === 3) return 3; if (sPh[i] === 2) a = 2; }
    if (oT > tCatch) return 4;
    if (oT > tStir) return Math.max(a, 1);
    return a;
  }
  const HOT_ALERT = ['', 'STIR THE ONIONS', 'SNAG READY', 'BURNING!', 'ONIONS CATCHING'];
  function frontAlert() { return phase === 'play' && cust.st === 'order' && (tray > 0 || build.snag) ? 1 : 0; }

  function drawSnag(i, cx) {
    const st = sSt[i];
    if (st === 0) {                       // an empty spot
      ctx.setLineDash(DASH); ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 1.5; rr(cx - 11, 52, 22, 78, 11); ctx.stroke(); ctx.setLineDash(NODASH);
      return;
    }
    const ph = st === 2 ? 4 : sPh[i];
    let y = 52, a = 1, sx = 1;
    if (st === 3) { const u = 1 - sW[i] / LIFT; y -= 26 * u; a = 1 - u; }
    if (sTA[i] >= 0) sx = Math.max(0.08, Math.abs(Math.cos(PI * sTA[i])));
    const both = sB[i] >= tReady;         // the top side's done: READY! next time
    if (st === 1 && (ph === 2 || ph === 3)) {   // the glow that says "now"
      ctx.globalAlpha = ph === 3 ? 0.35 + 0.45 * pulse(3) : 0.25 + 0.35 * pulse(1.5);
      rr(cx - 19, y - 8, 38, 94, 16); ctx.fillStyle = ph === 3 ? C.bad : C.yes; ctx.fill(); ctx.globalAlpha = 1;
    }
    ctx.save(); ctx.globalAlpha = a; ctx.translate(cx, y + 39); ctx.scale(sx, 1);
    // what's on top: mid-roll it's the side coming up
    const topT = sTA[i] >= 0 && sTA[i] < 0.5 ? sA[i] : sB[i], topC = sTA[i] >= 0 && sTA[i] < 0.5 ? cA[i] : cB[i];
    let body = C.raw, hi = C.rawHi, lo = C.rawLo, marks = false;
    if (ph === 4) { body = C.burnt; hi = C.burntHi; lo = '#000'; }
    else if (topC) { body = C.char; hi = C.charHi; lo = C.charLo; marks = true; }
    else if (topT >= tReady) { body = C.cooked; hi = C.cookedHi; lo = C.cookedLo; marks = true; }
    else if (topT >= tBrown) { body = C.part; hi = C.partHi; lo = C.partLo; }
    rr(-11, -39, 22, 78, 11); ctx.fillStyle = lo; ctx.fill();
    rr(-10, -38, 19, 75, 10); ctx.fillStyle = body; ctx.fill();
    rr(-7, -33, 5, 60, 3); ctx.fillStyle = hi; ctx.fill();
    if (marks) { ctx.strokeStyle = C.mark; ctx.lineWidth = 2.5; ctx.beginPath(); for (let k = 0; k < 4; k++) { ctx.moveTo(-9, -24 + k * 16); ctx.lineTo(8, -32 + k * 16); } ctx.stroke(); }
    if (ph < 4) { ctx.lineWidth = 2.5; ctx.strokeStyle = ph === 3 ? (pulse(4) > 0.5 ? '#ff5a2a' : '#7a2a10') : PH_RIM[ph]; rr(-11, -39, 22, 78, 11); ctx.stroke(); }   // the underside, at the rim
    ctx.restore(); ctx.globalAlpha = 1;
    if (st === 3) return;
    // label, the timing bar (the yellow is READY, the red is burning), and how many sides are done
    const lab = ph === 4 ? 'BURNT' : ph === 3 ? 'BURNING!' : ph === 2 ? (both ? 'READY!' : 'TURN!') : ph === 1 ? 'BROWNING' : both ? '2ND SIDE' : 'RAW';
    textW(lab, cx, 148, F9B, PH_COL[ph], 42);
    if (st !== 1) return;
    const bw = 38, bx = cx - bw / 2, by = 156, span = tBurnt, u = Math.min(1, sA[i] / span);
    ctx.fillStyle = '#0b1026'; ctx.fillRect(bx - 1, by - 1, bw + 2, 8);
    ctx.fillStyle = '#4a5478'; ctx.fillRect(bx, by, bw * u, 6);
    ctx.fillStyle = 'rgba(255,210,31,0.6)'; ctx.fillRect(bx + bw * tReady / span, by, bw * (tBurn - tReady) / span, 6);
    ctx.fillStyle = 'rgba(255,90,60,0.6)'; ctx.fillRect(bx + bw * tBurn / span, by, bw * (tBurnt - tBurn) / span, 6);
    ctx.fillStyle = C.white; ctx.fillRect(bx + bw * u - 1, by - 2, 2, 10);
    const n = (both ? 1 : 0) + (sA[i] >= tReady ? 1 : 0);
    for (let k = 0; k < 2; k++) { ctx.beginPath(); ctx.arc(cx - 5 + k * 10, 173, 3, 0, TAU); ctx.fillStyle = k < n ? C.yes : '#2a3355'; ctx.fill(); }
  }
  function drawTongs(cx, y) {
    ctx.strokeStyle = '#d6dbe3'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx + 26, y - 10); ctx.lineTo(cx + 9, y + 18); ctx.moveTo(cx + 30, y - 8); ctx.lineTo(cx + 15, y + 20); ctx.stroke();
    ctx.strokeStyle = C.red; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(cx + 27, y - 9); ctx.lineTo(cx + 33, y - 20); ctx.stroke(); ctx.lineCap = 'butt';
  }
  function drawHot(on) {
    const r = L.hot;
    tf(r.x, r.y, L.s);
    const al = hotAlert();
    frame(CW, CH, on, !on && al > 1);
    portrait('luka', 12, 6, 22, on);
    text('LUKA', 44, 22, F15B, on ? C.yes : C.text);
    text('HOTPLATE', 96, 22, F11, C.sub);
    text('BURNT', 300, 21, F10B, C.sub, 'right');
    for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(312 + k * 13, 17, 4.5, 0, TAU); ctx.fillStyle = k < burnt ? C.bad : '#2a3355'; ctx.fill(); }
    text('TRAY', 392, 21, F10B, C.sub, 'right'); text(STR_N[Math.min(tray, STR_N.length - 1)], 398, 22, F14B, tray ? C.good : C.bad);
    // the plate
    rr(10, 36, 420, 170, 8); ctx.fillStyle = C.steel; ctx.fill();
    ctx.fillStyle = C.steelHi; ctx.fillRect(14, 36, 412, 3);
    ctx.strokeStyle = C.groove; ctx.lineWidth = 2; ctx.beginPath(); for (let k = 0; k < 13; k++) { ctx.moveTo(14, 46 + k * 12.5); ctx.lineTo(296, 46 + k * 12.5); } ctx.stroke();
    ctx.fillStyle = C.grease; for (let k = 0; k < 14; k++) { ctx.beginPath(); ctx.arc(GREASE[k * 3], GREASE[k * 3 + 1], GREASE[k * 3 + 2], 0, TAU); ctx.fill(); }
    ctx.fillStyle = C.steelLo; ctx.fillRect(300, 40, 2, 162);
    for (let i = 0; i < 6; i++) drawSnag(i, 36 + i * 46);
    drawOnions(on);
    if (on && phase === 'play') {         // focus: a bracket and the tongs
      ctx.strokeStyle = C.yes; ctx.lineWidth = 2;
      if (focusH < 6) { const cx = 36 + focusH * 46; rr(cx - 22, 42, 44, 138, 8); ctx.stroke(); if (takeover <= 0) drawTongs(cx, 46); }
      else { rr(306, 42, 120, 158, 10); ctx.stroke(); }
    }
    for (let j = 0; j < PN; j++) {        // smoke and steam
      const o = j * 6, l = PT[o + 4]; if (l <= 0) continue;
      const u = l / PT[o + 5];
      ctx.globalAlpha = 0.55 * u; ctx.fillStyle = PK[j] === 0 ? '#5a5652' : '#f2efe8';
      ctx.beginPath(); ctx.arc(PT[o], PT[o + 1], 4 + (1 - u) * 9, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (takeover > 0) {                   // Luke has the tongs
      ctx.fillStyle = 'rgba(10,14,30,0.55)'; rr(10, 36, 420, 170, 8); ctx.fill();
      ctx.save(); ctx.translate(220, 112); ctx.rotate(-0.06);
      ctx.fillStyle = C.red; ctx.fillRect(-150, -22, 300, 44); ctx.fillStyle = C.white; ctx.fillRect(-150, -22, 300, 5); ctx.fillRect(-150, 17, 300, 5);
      text("LUKE'S ON THE TONGS", 0, 6, F15B, C.white, 'center');
      ctx.restore();
      ctx.fillStyle = '#0b1026'; rr(140, 150, 160, 8, 4); ctx.fill();
      ctx.fillStyle = C.yes; rr(140, 150, 160 * Math.max(0, takeover / TAKEOVER), 8, 4); ctx.fill();
    }
    if (!on) { ctx.fillStyle = C.dim; rr(0, 0, CW, CH, 14); ctx.fill(); swapPill(254, 7, al > 1); }
    if (fbT > 0 && fbCard === 0) { ctx.globalAlpha = Math.min(1, fbT * 3); text(fbStr, 14, 230, F12B, fbCol); ctx.globalAlpha = 1; }
    else if (on) text(hintHot, 14, 230, F10, C.sub);
    else if (al) { ctx.globalAlpha = 0.6 + 0.4 * pulse(1.6); text(HOT_ALERT[al], 14, 230, F12B, al > 1 ? C.bad : C.warn); ctx.globalAlpha = 1; }
  }
  function drawOnions(on) {
    const cx = 364, cy = 108;
    const ci = Math.min(23, Math.round(Math.min(1, oCook * 0.6 + oChar * 0.4) * 23)), pal = ONI_PAL[ci], dark = ONI_PAL[Math.min(23, ci + 5)];
    const w = oWob >= 0 ? Math.sin(oWob * PI * 3) * (1 - oWob) : 0;
    const g = Math.max(0, 1 - oT / tStir), col = oT > tCatch ? C.bad : oT > tStir ? C.warn : C.good;   // the gauge: time until it wants a stir
    ctx.lineWidth = 5; ctx.strokeStyle = '#2a3048'; ctx.beginPath(); ctx.arc(cx, cy, 46, 0, TAU); ctx.stroke();
    ctx.strokeStyle = col; ctx.beginPath();
    if (oT > tStir) { ctx.globalAlpha = 0.5 + 0.5 * pulse(oT > tCatch ? 3 : 1.5); ctx.arc(cx, cy, 46, 0, TAU); }
    else ctx.arc(cx, cy, 46, -PI / 2, -PI / 2 + TAU * g);
    ctx.stroke(); ctx.globalAlpha = 1;
    if (stirHold > 0) { ctx.lineWidth = 7; ctx.strokeStyle = C.yes; ctx.beginPath(); ctx.arc(cx, cy, 53, -PI / 2, -PI / 2 + TAU * Math.min(1, stirHold / HOLD)); ctx.stroke(); }
    ctx.fillStyle = dark; ctx.beginPath(); ctx.ellipse(cx, cy + 3, 31, 25, 0, 0, TAU); ctx.fill();
    ctx.lineWidth = 3; ctx.lineCap = 'round';
    for (let i = 0; i < 26; i++) {
      const o = i * 5;
      ctx.strokeStyle = i % 4 === 0 ? dark : pal;
      ctx.beginPath(); ctx.arc(cx + STR[o] + w * 4 * ((i & 1) ? 1 : -1), cy + STR[o + 1], STR[o + 2], STR[o + 3] + w, STR[o + 3] + w + STR[o + 4]); ctx.stroke();
    }
    ctx.lineCap = 'butt';
    const lab = stirHold > 0 ? 'STIRRING' : oT > tCatch ? 'CATCHING!' : oT > tStir ? 'STIR!' : 'ONIONS';
    text(lab, cx, 172, F11B, oT > tCatch ? C.bad : oT > tStir ? C.warn : C.sub, 'center');
    if (on && focusH === 6 && stirHold <= 0 && phase === 'play') text(typeof options !== 'undefined' && options.holdToPress ? 'press YES' : 'hold YES', cx, 189, F10, C.yes, 'center');
  }

  // ---- the front
  function drawIcon(k, x, y, s, dis) {      // centred on x, y
    ctx.globalAlpha = dis ? 0.35 : 1;
    if (k === 0) { rr(x - 13 * s, y - 9 * s, 26 * s, 18 * s, 5 * s); ctx.fillStyle = C.crust; ctx.fill(); rr(x - 11 * s, y - 7 * s, 22 * s, 14 * s, 4 * s); ctx.fillStyle = C.bread; ctx.fill(); }
    else if (k === 1) { rr(x - 14 * s, y - 4.5 * s, 28 * s, 9 * s, 4.5 * s); ctx.fillStyle = C.cooked; ctx.fill(); ctx.fillStyle = C.cookedHi; ctx.fillRect(x - 10 * s, y - 3 * s, 18 * s, 2 * s); }
    else if (k === 2) { ctx.strokeStyle = ONI_PAL[12]; ctx.lineWidth = 2.2 * s; ctx.beginPath(); for (let j = 0; j < 4; j++) { ctx.moveTo(x - 12 * s + j * 6 * s, y + 5 * s); ctx.quadraticCurveTo(x - 9 * s + j * 6 * s, y - 9 * s, x - 4 * s + j * 6 * s, y + 4 * s); } ctx.stroke(); }
    else if (k === 3 || k === 4) {
      ctx.fillStyle = k === 3 ? C.tomato : C.bbq; rr(x - 6 * s, y - 6 * s, 12 * s, 16 * s, 3 * s); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x - 3 * s, y - 6 * s); ctx.lineTo(x, y - 13 * s); ctx.lineTo(x + 3 * s, y - 6 * s); ctx.fill();
      ctx.fillStyle = C.white; ctx.fillRect(x - 4 * s, y - 1 * s, 8 * s, 4 * s);
    } else if (k === 5) {
      ctx.fillStyle = C.navy; ctx.beginPath(); ctx.moveTo(x - 12 * s, y - 3 * s); ctx.lineTo(x + 4 * s, y - 3 * s); ctx.lineTo(x + 4 * s, y - 9 * s); ctx.lineTo(x + 14 * s, y);
      ctx.lineTo(x + 4 * s, y + 9 * s); ctx.lineTo(x + 4 * s, y + 3 * s); ctx.lineTo(x - 12 * s, y + 3 * s); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  function drawBuild(x, y, s, a) {          // the sandwich, top-down, centred on x, y
    ctx.globalAlpha = a;
    rr(x - 34 * s, y - 15 * s, 68 * s, 30 * s, 10 * s); ctx.fillStyle = C.crust; ctx.fill();
    rr(x - 31 * s, y - 12 * s, 62 * s, 24 * s, 8 * s); ctx.fillStyle = C.bread; ctx.fill();
    if (build.snag) {
      rr(x - 30 * s, y - 6 * s, 60 * s, 12 * s, 6 * s); ctx.fillStyle = C.cooked; ctx.fill(); ctx.fillStyle = C.cookedHi; ctx.fillRect(x - 24 * s, y - 4 * s, 40 * s, 2.5 * s);
      ctx.strokeStyle = C.mark; ctx.lineWidth = 2 * s; ctx.beginPath(); for (let k = 0; k < 4; k++) { ctx.moveTo(x - 20 * s + k * 13 * s, y + 5 * s); ctx.lineTo(x - 14 * s + k * 13 * s, y - 5 * s); } ctx.stroke();
    }
    if (build.onions) { ctx.strokeStyle = ONI_PAL[12]; ctx.lineWidth = 2 * s; ctx.beginPath(); for (let k = 0; k < 6; k++) { ctx.moveTo(x - 26 * s + k * 10 * s, y + 3 * s); ctx.quadraticCurveTo(x - 22 * s + k * 10 * s, y - 9 * s, x - 17 * s + k * 10 * s, y + 2 * s); } ctx.stroke(); }
    if (build.sauce) {
      ctx.strokeStyle = build.sauce === 'tomato' ? C.tomato : C.bbq; ctx.lineWidth = 3 * s; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(x - 26 * s, y);
      for (let k = 0; k < 8; k++) ctx.lineTo(x - 20 * s + k * 7 * s, k & 1 ? y + 4 * s : y - 4 * s);
      ctx.stroke(); ctx.lineJoin = 'miter';
    }
    ctx.globalAlpha = 1;
  }
  function chip(x, y, w, label, need, ok) {   // a line on the docket. ok: 0 to do, 1 done, 2 wrong
    rr(x, y, w, 26, 6); ctx.fillStyle = need ? C.paper : 'rgba(255,253,244,0.55)'; ctx.fill();
    ctx.lineWidth = 1.5; ctx.strokeStyle = ok === 1 ? '#2f8f55' : ok === 2 ? C.red : '#c9c2a8'; ctx.stroke();
    rr(x + 6, y + 7, 12, 12, 2); ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; ctx.stroke();
    if (ok === 1) { ctx.strokeStyle = '#2f8f55'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(x + 8, y + 13); ctx.lineTo(x + 11, y + 17); ctx.lineTo(x + 17, y + 8); ctx.stroke(); }
    if (ok === 2) { ctx.strokeStyle = C.red; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(x + 8, y + 9); ctx.lineTo(x + 16, y + 17); ctx.moveTo(x + 16, y + 9); ctx.lineTo(x + 8, y + 17); ctx.stroke(); }
    text(label, x + 23, y + 17, need ? F11B : F10I, C.ink);
  }
  function drawFront(on) {
    const r = L.front, o = cust.ord;
    tf(r.x, r.y, L.s);
    const al = frontAlert();
    frame(CW, CH, on, !on && al > 0);
    portrait('chase', 12, 6, 22, on);
    text('CHASE', 44, 22, F15B, on ? C.yes : C.text);
    text('FRONT', 108, 22, F11, C.sub);
    if (cust.st !== 'walk' && cust.n > 0) text(STR_C[Math.min(cust.n, STR_C.length - 1)], CW - 14, 21, F11, C.sub, 'right');
    // the bubble: its tail points up at the customer in the shot
    rr(10, 34, 254, 100, 12); ctx.fillStyle = C.white; ctx.fill();
    ctx.beginPath(); ctx.moveTo(40, 36); ctx.lineTo(52, 22); ctx.lineTo(62, 36); ctx.fill();
    if (cust.st === 'walk' || !o) text(served >= target ? 'Sold out.' : '…', 22, 72, F13B, '#8a90a0');
    else if (cust.st === 'paid') { text(o.ta, 22, 62, F13B, C.ink); glassPill(22, 82); }
    else if (cust.oopsT > 0) text(cust.oops, 22, 62, F13B, C.red);
    else for (let k = 0; k < cust.lines.length && k < 5; k++) text(cust.lines[k], 22, 54 + k * 17, k < cust.split ? F13B : F13, k < cust.split ? C.ink : '#4a5170');
    // the docket
    if (cust.st === 'order' && o) {
      chip(10, 142, 74, 'BREAD', true, build.bread ? 1 : 0);
      chip(90, 142, 70, 'SNAG', true, build.snag ? 1 : 0);
      chip(166, 142, 104, o.on ? 'ONIONS' : 'NO ONIONS', o.on, build.onions ? (o.on ? 1 : 2) : 0);
      chip(276, 142, 154, SAUCE_TXT[o.sauce], o.sauce !== 'none', build.sauce ? (build.sauce === o.sauce ? 1 : 2) : 0);
    } else { ctx.setLineDash(DASH); ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1.5; rr(10, 142, 420, 26, 6); ctx.stroke(); ctx.setLineDash(NODASH); }
    // the napkin and what's on it
    ctx.save(); ctx.translate(350, 86); ctx.rotate(-0.05);
    rr(-70, -46, 140, 92, 4); ctx.fillStyle = C.napkin; ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.08)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-70, 0); ctx.lineTo(70, 0); ctx.moveTo(0, -46); ctx.lineTo(0, 46); ctx.stroke();
    ctx.restore();
    if (build.bread && drag !== 6) drawBuild(350, 84, 1.3, 1);
    else if (giveT >= 0) { ctx.save(); ctx.translate(0, -30 * giveT); drawBuild(350, 84, 1.3, 1 - giveT); ctx.restore(); }
    else if (!build.bread) { ctx.setLineDash(DASH); ctx.strokeStyle = 'rgba(20,29,58,0.25)'; ctx.lineWidth = 1.5; rr(305, 64, 90, 40, 10); ctx.stroke(); ctx.setLineDash(NODASH); text('bread here', 350, 89, F10I, '#8a90a0', 'center'); }
    // the buttons
    for (let k = 0; k < 6; k++) {
      const bx = BTN_X[k], bw = BTN_W[k], f = on && focusF === k && phase === 'play', ho = k === 5;
      const dis = ho ? !(build.bread && build.snag && cust.st === 'order') : canAdd(k) !== 0;
      rr(bx, BTN_Y, bw, BTN_H, 8); ctx.fillStyle = ho ? (dis ? '#7a7350' : C.yes) : f ? '#33407a' : '#232c52'; ctx.fill();
      if (f) { ctx.strokeStyle = ho ? C.white : C.yes; ctx.lineWidth = 2.5; ctx.stroke(); }
      drawIcon(k, bx + bw / 2, BTN_Y + 15, 0.95, dis && !ho);
      text(ING[k], bx + bw / 2, BTN_Y + 38, F10B, ho ? C.navy : dis ? '#6a7290' : C.text, 'center');
      if (k === 1) { rr(bx + bw - 17, BTN_Y - 6, 22, 16, 8); ctx.fillStyle = tray ? C.good : C.bad; ctx.fill(); text(STR_N[Math.min(tray, STR_N.length - 1)], bx + bw - 6, BTN_Y + 6, F10B, C.navy, 'center'); }
      if (k === 2 && catching) { rr(bx + bw - 15, BTN_Y - 6, 18, 16, 8); ctx.fillStyle = C.bad; ctx.fill(); text('!', bx + bw - 6, BTN_Y + 6, F10B, C.navy, 'center'); }
    }
    if (!on) { ctx.fillStyle = C.dim; rr(0, 0, CW, CH, 14); ctx.fill(); swapPill(320, 7, al > 0); }
    // footer: feedback or the hint · Chase (2040) at the tin
    if (fbT > 0 && fbCard === 1) { ctx.globalAlpha = Math.min(1, fbT * 3); text(fbStr, 14, 241, F12B, fbCol); ctx.globalAlpha = 1; }
    else if (on) text(hintFront, 14, 241, F10, C.sub);
    else if (al) { ctx.globalAlpha = 0.6 + 0.4 * pulse(1.6); text('CUSTOMER WAITING', 14, 241, F12B, C.warn); ctx.globalAlpha = 1; }
    tin(CW - 14, 234);
  }
  function glassPill(x, y) {                // SafeSense glass: paid by chip
    rr(x, y, 116, 22, 11); ctx.fillStyle = 'rgba(223,238,255,0.95)'; ctx.fill();
    ctx.strokeStyle = 'rgba(80,160,240,0.9)'; ctx.lineWidth = 1.5; ctx.stroke();
    text('✓ PAID BY CHIP', x + 58, y + 15, F10B, '#2f86e0', 'center');
  }
  function tin(xr, y) {                     // right-aligned: the cash tin, and the man at it
    text('Chase (2040) counts the change.', xr - 31, y + 7, F10I, C.sub, 'right');
    rr(xr - 24, y - 3, 24, 14, 2); ctx.fillStyle = '#9aa3b0'; ctx.fill();
    ctx.fillStyle = '#c8ccd0'; ctx.fillRect(xr - 25, y - 6, 26, 4);
    ctx.fillStyle = '#e8d8a0'; ctx.fillRect(xr - 21, y + 1, 18, 7);
    text('$0', xr - 12, y + 7.5, F9B, C.navy, 'center');
  }

  // ---- tabs (the station you're not at, on small screens)
  function drawTab(which) {
    const r = which === 0 ? L.hot : L.front, s = L.s, w = r.w / s, h = r.h / s;
    tf(r.x, r.y, s);
    const al = which === 0 ? hotAlert() : frontAlert(), hot = al > (which === 0 ? 1 : 0);
    frame(w, h, false, hot);
    const id = which === 0 ? 'luka' : 'chase', nm = which === 0 ? 'LUKA' : 'CHASE', stn = which === 0 ? 'HOTPLATE' : 'FRONT';
    if (r.horiz) {
      portrait(id, 9, 8, 30, false);
      text(nm, 48, 21, F13B, C.text); text(stn, 48, 36, F10, C.sub);
      if (which === 0) {
        for (let i = 0; i < 6; i++) miniSnag(i, 136 + i * 16, 13, 10, 20);
        miniOnion(244, 23);
        if (al) { ctx.globalAlpha = 0.6 + 0.4 * pulse(1.6); text(HOT_ALERT[al], 262, 27, F9B, al > 1 ? C.bad : C.warn); ctx.globalAlpha = 1; }
      } else miniFront(136, 11, al, true);
      swapPill(w - 8, 14, hot);
    } else {
      portrait(id, (w - 40) / 2, 10, 40, false);
      text(nm, w / 2, 68, F13B, C.text, 'center'); text(stn, w / 2, 82, F10, C.sub, 'center');
      if (which === 0) {
        for (let i = 0; i < 6; i++) miniSnag(i, w / 2 - 22 + (i % 3) * 22, 94 + ((i / 3) | 0) * 38, 12, 32);
        miniOnion(w / 2, 186);
        if (al) { ctx.globalAlpha = 0.6 + 0.4 * pulse(1.6); text(HOT_ALERT[al], w / 2, 212, F9B, al > 1 ? C.bad : C.warn, 'center'); ctx.globalAlpha = 1; }
      } else miniFront(w / 2 - 32, 100, al, false);
      swapPill(w / 2 + (swapKW + 56) / 2, h - 28, hot);
    }
  }
  function miniSnag(i, cx, y, w, h) {
    const st = sSt[i], ph = st === 2 ? 4 : sPh[i];
    rr(cx - w / 2, y, w, h, w / 2);
    if (st === 0 || st === 3) { ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1; ctx.stroke(); return; }
    ctx.fillStyle = ph === 4 ? C.burnt : sB[i] >= tReady ? C.cooked : C.raw; ctx.fill();
    ctx.lineWidth = 2.5; ctx.strokeStyle = ph === 3 ? (pulse(4) > 0.5 ? '#ff5a2a' : '#7a2a10') : PH_RIM[ph]; ctx.stroke();
  }
  function miniOnion(x, y) {
    ctx.beginPath(); ctx.arc(x, y, 9, 0, TAU); ctx.fillStyle = ONI_PAL[Math.min(23, Math.round(Math.min(1, oCook * 0.6 + oChar * 0.4) * 23))]; ctx.fill();
    ctx.lineWidth = 2.5; ctx.strokeStyle = oT > tCatch ? C.bad : oT > tStir ? C.warn : C.good; ctx.stroke();
  }
  function miniFront(x, y, al, horiz) {
    rr(x, y, 64, 24, 8); ctx.fillStyle = C.white; ctx.fill();
    const ord = cust.st === 'order';
    text(ord ? '!' : '…', x + 32, y + 17, F13B, ord ? C.red : '#8a90a0', 'center');
    if (horiz) {
      text('TRAY', x + 76, y + 16, F10B, C.sub); text(STR_N[Math.min(tray, STR_N.length - 1)], x + 108, y + 17, F13B, tray ? C.good : C.bad);
      if (al) { ctx.globalAlpha = 0.6 + 0.4 * pulse(1.6); text('CUSTOMER', x + 126, y + 16, F9B, C.warn); ctx.globalAlpha = 1; }
    } else {
      text('TRAY', x + 30, y + 52, F10B, C.sub, 'right'); text(STR_N[Math.min(tray, STR_N.length - 1)], x + 36, y + 53, F13B, tray ? C.good : C.bad);
      if (al) { ctx.globalAlpha = 0.6 + 0.4 * pulse(1.6); text('CUSTOMER', x + 32, y + 92, F9B, C.warn, 'center'); ctx.globalAlpha = 1; }
    }
  }

  function drawStrip() {
    const st = L.strip, s = L.s, w = st.w / s;
    tf(st.x, st.y, s);
    rr(0, 0, w, SH, 9); ctx.fillStyle = 'rgba(20,29,58,0.84)'; ctx.fill();
    ctx.fillStyle = C.yes; ctx.fillRect(10, SH - 2, w - 20, 2);
    text('SAUSAGE SIZZLE', 12, 18, F13B, C.yes);
    const narrow = w < 600, n = target, step = n > 12 ? 12 : 19, ix = narrow ? 142 : (w - n * step) / 2;
    for (let k = 0; k < n; k++) {
      const x = ix + k * step + 8, d = k < served;
      rr(x - 8, 8, 16, 10, 4); ctx.fillStyle = d ? C.crust : '#2a3355'; ctx.fill();
      if (d) { rr(x - 7, 10.5, 14, 5, 2.5); ctx.fillStyle = C.cooked; ctx.fill(); }
    }
    text(STR_S[Math.min(served, STR_S.length - 1)], ix + n * step + 6, 18, F12B, C.text);
    if (!narrow) text(active === 'luka' ? 'LUKA · HOTPLATE' : 'CHASE · FRONT', w - 12, 18, F10B, C.sub, 'right');
  }
  function drawMarker() {                   // a chevron over the customer who's ordering (the front's shot)
    if (!hasSet || active !== 'chase' || cust.st !== 'order' || !S.queue.bubble || phase !== 'play') return;
    S.queue.bubble(cust.rig, v3); v3.y -= 0.2;   // (the set gives head + 0.3 m) just over their head
    const p = api.cam.project(v3);
    if (!p.visible || p.y > L.top - 16 || p.y < 30) return;
    ctx.setTransform(K, 0, 0, K, 0, 0);
    const b = 4 * Math.sin(T * 5);
    ctx.fillStyle = C.yes; ctx.strokeStyle = C.navy; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(p.x - 9, p.y - 20 + b); ctx.lineTo(p.x + 9, p.y - 20 + b); ctx.lineTo(p.x, p.y - 8 + b); ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  function drawDrag() {
    if (drag < 0 || !dragMoved) return;
    const p = api.input.pointer;
    ctx.setTransform(K * L.s, 0, 0, K * L.s, K * p.x, K * p.y);
    if (drag === 6) drawBuild(0, 0, 1.3, 0.9); else drawIcon(drag, 0, 0, 1.4, false);
  }
  function drawDone() {
    if (phase !== 'done') return;
    const s = L.s, cx = L.strip.x + L.strip.w / 2, cy = (L.top + L.bottom) / 2;
    const a = Math.min(1, (2.2 - endT) * 4), z = 1 + 0.4 * Math.max(0, 1 - a);
    ctx.setTransform(K * s * z, 0, 0, K * s * z, K * cx, K * cy); ctx.rotate(-0.08);
    ctx.globalAlpha = a;
    rr(-150, -34, 300, 68, 12); ctx.fillStyle = C.yes; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = C.navy; ctx.stroke();
    text(STR_DONE, 0, 2, F22B, C.navy, 'center');
    text('Nobody got any risk.', 0, 22, F11B, C.navy, 'center');
    ctx.globalAlpha = 1;
  }
  let STR_DONE = 'TEN SERVED';

  // ---------------------------------------------------------- lifecycle
  function fin(r) { if (done) return; done = true; phase = 'off'; api.finish(r); }
  function result() { return { ok: true, served, burnt: burntTotal, takeovers, wrong, turns, stirs, active }; }
  function resetAll() {
    served = 0; burnt = 0; burntTotal = 0; takeovers = 0; wrong = 0; turns = 0; stirs = 0; takeover = 0; T = 0; endT = 0; endWait = 0; swapFlash = 0;
    focusH = 0; focusF = 0; holdArmed = false; ptrHold = false; stirHold = 0; stirLock = false; fbT = 0; drag = -1; giveT = -1; buildKey = -1;
    oT = 1.5; oCook = 0.15; oChar = 0; oWob = -1; oQ = -1; catching = false; oWarned = false;
    cust.st = 'walk'; cust.t = 0; cust.rig = -1; cust.ord = null; cust.lines.length = 0; cust.split = 0; cust.oopsT = 0; cust.n = 0;
    build.bread = build.snag = build.onions = false; build.sauce = null; stack.length = 0;
    for (let j = 0; j < PN; j++) PT[j * 6 + 4] = 0;
    for (let i = 0; i < 6; i++) { upQ[i] = dnQ[i] = -2; sSt[i] = 0; sW[i] = 0; sTA[i] = -1; }
    bi = 0; bRun = false; botT = 0.6; botHold = false; botWrong = false; botForce = -1; botClock = 0; c40T = 2; shotKey = ''; shotWho = '';
  }
  function stage() {                        // everyone at their station
    luka = actorOf('luka'); luke = actorOf('luke40'); chase = actorOf('chase'); c40 = actorOf('chase40');
    if (P.place === false) return;
    const ok = (id) => S && S.marks && S.marks[MARKS[id]];
    if (luka && ok('luka')) luka.place(MARKS.luka);
    if (luke && ok('luke40')) luke.place(MARKS.luke40);
    if (chase && ok('chase')) chase.place(MARKS.chase);
    if (c40 && ok('chase40')) c40.place(MARKS.chase40);
    if (luka) { if (hasSet) luka.hold('tongs_spare'); luka.play('sizzle_flip'); }
    if (luke) luke.play('sizzle_flip');
    if (chase) chase.play('idle');
    if (c40) c40.play('look_down');
  }

  return {
    BANTER, ORDERS,
    // a read-only snapshot for tests and content (allocates; not for per-frame use)
    peek: () => ({ phase, active, served, target, tray, burnt, burntTotal, takeover, takeovers, wrong, turns, stirs, focusH, focusF,
      build: { bread: build.bread, snag: build.snag, onions: build.onions, sauce: build.sauce }, customer: cust.st, order: cust.ord,
      onions: { t: oT, catching, hold: stirHold }, snags: Array.from(sSt, (st, i) => ({ st, phase: sPh[i], down: sA[i], up: sB[i] })),
      layout: { mode: L.mode, s: L.s, hot: { ...L.hot }, front: { ...L.front } } }),
    skipResult: () => ({ ok: true, served: target, burnt: burntTotal, takeovers, wrong, turns, stirs, active }),
    start(params, a) {
      api = a; P = params || a.params || {}; ov = a.overlay; ctx = ov.ctx; done = false; bot = false; run++;
      if (!root) makeRoot();
      a.ui.appendChild(root); barkTop = -1;
      target = Math.max(1, (P.target | 0) || 10);
      STR_N.length = 0; for (let i = 0; i <= Math.max(12, target + 4); i++) STR_N.push(String(i));
      STR_S = []; STR_C = [];
      for (let i = 0; i <= target; i++) { STR_S.push(i + ' / ' + target); STR_C.push('CUSTOMER ' + i + ' / ' + target); }
      STR_DONE = target === 10 ? 'TEN SERVED' : target + ' SERVED';
      const sm = typeof options !== 'undefined' && options.storyMode, kw = sm ? 1.6 : 1, kc = sm ? 1.1 : 1;
      tBrown = SIDE.brown * kc; tReady = SIDE.ready * kc; tBurn = tReady + SIDE.win * kw; tBurnt = tBurn + SIDE.burn * kw;
      tStir = ONION.stir * (sm ? 1.5 : 1); tCatch = ONION.catchAt * (sm ? 1.5 : 1);
      banter = P.banter === false ? null : Array.isArray(P.banter) ? P.banter.slice().sort((x, y) => x.at - y.at) : BANTER;
      resetAll();
      tray = P.tray == null ? 2 : Math.max(0, P.tray | 0);
      active = P.start === 'luka' ? 'luka' : 'chase';
      setS();
      if (S && P.dress !== false && S.dress) { S.dress('sizzle26', { keepEnv: true }); setS(); }
      for (let i = 0; i < 6; i++) lay(i, INIT_T[i]);
      if (hasSet) { S.sizzle.heat(0.8); if (S.sizzle.tin) S.sizzle.tin(true); S.sizzle.build(build); buildKey = 0; }
      mirrorSnags(); mirrorOnions();
      stage();
      phase = 'play';
      ptrMX = a.input.pointer.x; ptrMY = a.input.pointer.y;
      if (typeof portraitURL !== 'undefined' && portraitURL.canvas) { pcLuka = portraitURL.canvas('luka'); pcChase = portraitURL.canvas('chase'); }
      layout(); applyShot();
      ov.show(true);
      if (P.intro !== false && typeof bark === 'function') bark('luke40', typeof P.intro === 'string' ? P.intro : INTRO);
      testLog('sizzle: start (' + (hasSet ? 'sandgate' : 'cards only') + ')');
    },
    update(dt) {
      if (done) return;
      const k = bot ? dt * BOT_SPEED : dt;
      T += k;
      if (fbT > 0) fbT -= dt;
      if (swapFlash > 0) swapFlash -= dt * 3;
      if (bot) botTick(k); else inputs(dt);
      if (shotKey !== L.mode && shotWho === active && phase !== 'off') applyShot();
      if (phase === 'play') { cookTick(k); onionTick(k); takeoverTick(k); frontTick(k); banterTick(); }
      else if (phase === 'done') {
        frontTick(k); endT -= k; endWait += dt;
        if (endT <= 0 && (!bRun || endWait > 14)) {
          const r = result();
          state.flags.s26_sizzle = true; emit('flag:set', { name: 's26_sizzle', value: true });
          emit('sizzle:done', r);
          testLog('sizzle: done ' + served + ' served, ' + burntTotal + ' burnt, ' + takeovers + ' takeover(s), ' + wrong + ' wrong, ' + turns + ' turns, ' + stirs + ' stirs, ' + T.toFixed(1) + ' s');
          fin(r); return;
        }
      }
      partTick(k);
      mirrorSnags(); mirrorOnions(); mirrorBuild();
    },
    draw() {
      if (done || !ctx) return;
      if (innerWidth !== W || innerHeight !== H || sch !== api.input.scheme || layActive !== active) layout();
      K = ov.canvas.width / W;
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, ov.canvas.width, ov.canvas.height);
      ctx.textBaseline = 'alphabetic';
      drawStrip();
      if (L.hot.tab) drawTab(0); else drawHot(active === 'luka');
      if (L.front.tab) drawTab(1); else drawFront(active === 'chase');
      drawMarker(); drawDrag(); drawDone();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    },
    end(r) {
      done = true; phase = 'off'; run++; bot = false; drag = -1;
      if (r && !r.aborted) state.flags.s26_sizzle = true;
      if (r && r.skipped) testLog('sizzle: skipped');
      if (hasSet) {
        if (S.queue.live) S.queue.live(false);
        S.sizzle.heat(0.6);
        if (r && r.skipped) S.sizzle.build({});
      }
      if (luka) { luka.hold(null); if (takeover > 0) luka.place(MARKS.luka); }
      if (luke && takeover > 0) luke.place(MARKS.luke40);
      takeover = 0;
      if (ctx) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, ov.canvas.width, ov.canvas.height); }
      if (ov) ov.show(false);
      luka = luke = chase = c40 = null;
    },
    autoplay(a) {
      if (done || api !== a) MINIGAMES.sizzle.start(a.params || {}, a);
      bot = true;
    },
  };
})();
