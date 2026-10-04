// ============================================================ MINIGAME: Hover-scooter chase (spec 9.8; scene 2.5, "The slowest chase in history.")
// The bridge deck of SETS.bridge (src/15-set-bridge.js: chase API in its header). Luka drives scooter_1 with Chase (2026)
// on the pillion; Chase (2040) rides scooter_2 alongside, a nose ahead (AI: another lane, out of the drops and the cars). Three lanes (chase.LANES: L +3.5 · M 0 · R -3.5, facing +Z
// the +X lane is on the rider's LEFT). Everyone is limited to 25 km/h (chase.SPEED 6.94 m/s), drones included, so nobody
// can catch anybody: the six chasers (d25_c1..6) hang behind in a loose pack (two flank the riders at head height, so the
// low FOLLOW camera always has them looming at the top of the frame) and close in whenever the scooter slows.
//   STEER    ← / → (A / D, d-pad, a stick flick, the touch stick, or a horizontal swipe) changes lane. Left / right are
//            what you see: camera-relative, so they stay right when the game cuts to a fixed bridge-side camera that
//            looks back at the chase. A hover-car alongside in lane L blocks it (bump); cars ahead in lane L yield on
//            their own (the set) and say "After you!" (a bark).
//   DROPS    a drone drops in ahead: its shadow (the set's drop_marks) telegraphs the lane ~2.1 s before you get there
//            (Story Mode 3 s) and it lands at chest height and waits. Be in another lane, or get "hugged": the scooter
//            stops in a soft blue field for 2 s (Story 1.2 s), DRONE "Gotcha! ^ For your safety!". Every third drop or so
//            is a double (two lanes, one free; never in Story Mode).
//   DASH     SafeSense pops up on the dash ("Are you sure?" [YES], a draining bar): YES within 1.5 s (Story 2.6 s) or
//            the scooter slows to 15 km/h for 2.6 s (Story: 20 km/h, 1.5 s). Every fourth one, after the YES, asks
//            "Are you sure you're sure?" and needs YES again (YES twice). The dash screen mirrors it (dash('ask'/'ask2'/'ok')).
//   SWAP     to Chase on the pillion (recording mode; SWAP again for Luka). Luka drives himself meanwhile (he dodges and
//            taps YES on the dash). A drone comes down to buzz between the scooters; HOLD YES while one is close
//            (options.holdToPress: press) for CONFIG.record (1 s) and Chase records the Drone whir (flow.learnSample);
//            back to Luka 1.4 s later. Any drone within 2.6 m of Chase will do (the buzz, or the one hugging you).
//   HALFWAY  at chase.LAUGH (s 360) the game stops steering, closes its UI, holds the chase in chase.cruise(true, { drones })
//            and runs params.onHalfway (the scene's 2.5_laugh cutscene), then cruise(false) and resumes where the cruise
//            left the scooters. The laugh sample is always granted (flow.learnSample('laugh'), flag s25_laugh), even with
//            no onHalfway, a skipped cutscene, or a skipped mini-game.
//   END      at chase.END (s 735) chase.swerve({ drones }) takes both scooters through the barrier gap onto the mangrove
//            boardwalk (cams ch_end -> bw_end); the six drones stop at the edge (d25_edge_*). DRONE "Uneven terrain
//            detected. ^ For your safety, pursuit has ended. ^ Have a lovely day!" as a bark when scooter_1 leaves the
//            deck (params.endLine: false = the scene says it). The game finishes when the swerve has stopped.
//   No fail (no api.fail()); ~90 s of play plus the cutscene. Story Mode (options.storyMode) is gentler as noted.
//   Camera: the game owns it (spec / bridge doc §7.2): chase.camAt(s) -> FOLLOW = cam.override('fixed', { pos, look, fov })
//   with chase.followAt() writing the arrays in place each tick; a bridge-side cam = cam.override('set', { name }). A
//   fixed lens that looks back at the chase hands over to FOLLOW once the scooters have passed it (ch_launch at s ~32,
//   not 60: an empty road otherwise). Under the halfway cutscene the gameplay camera is already the live FOLLOW rig, so
//   the cutscene's closing release eases straight into the chase. The cutscene needn't call chase.cruise (the game
//   does; calling it again is harmless). end() leaves cam.override(null). Overlay (api.overlay): a SafeSense-glass strip top centre (Clontarf -> Brighton
//   progress with the halfway mark, the 25 roundel and speed, a three-lane radar that mirrors the camera, drop warnings).
//
// minigame('scooter', params) -> result
//   params (all optional):
//     onHalfway   (api) => Promise | cutscene id | [steps]: the 2.5_laugh cutscene, run while the set cruises.
//                 A function is awaited; an id or a step list is played with playCutscene (letterboxed, skippable).
//     drones      the six chaser DRONES ids (default d25_c1..d25_c6). Missing ones are spawned behind the scooters;
//                 existing ones are re-spawned in place with cone: false, ai: false (the game flies them).
//     mount       default true: SETS.bridge.mount() luka (driver) + chase (pillion) on scooter_1 and chase40 on
//                 scooter_2 (whoever is spawned) and play scooter_drive / scooter_pillion. false = the scene did it.
//     dress       default true: SETS.bridge.dress('chase25', { keepEnv: true }) unless the set is already dressed
//                 'chase25' (scooters at s25_launch_*, deck traffic reset), and env 'chase25' (20 s lerp) if not set.
//     endLine     default true: the DRONE's end line as a bark during the swerve; false = none; a string = that text.
//     swerveSpeed the swerve's speed (default chase.SPEED).
//     objective   default: objective('The slowest chase in history.') at start (the PLAY's title); a string = that
//                 text; false = leave the scene's objective alone.
//   result: { done: true, hugs, dodges, asks, answered, doubles, missed, blocked, yields, whir (the Drone whir is in
//             state.samples), laugh: true, swerved: true, time (s of play), story }
//           Pause -> Skip (never offered: no failures) -> { skipped: true, done, laugh, swerved, whir, ... } and the end
//           state is snapped (dress('end25', { keepEnv: true }): scooters at s25_bw_stop_*, riders still mounted;
//           the six drones at d25_edge_*). { aborted } / { error } from the host.
//   Always (unless aborted): flow.learnSample('laugh'), flags s25_laugh, s25_chase. Riders stay mounted (the scene
//   calls SETS.bridge.unmount() when they get off); flow.follow is set to null for the ride (re-set it after).
//   events: emit('scooter:hug', n), ('scooter:dodge', n), ('scooter:ask', { n, double }), ('scooter:miss', n),
//           ('scooter:swap', 'luka' | 'chase'), ('scooter:whir'), ('scooter:halfway'), ('scooter:resume', s),
//           ('scooter:swerve'), ('scooter:done', result). testLog 'scooter: ...' lines under autoplay.
// What the scene sets up (2.5, after 2.5_alarm): bridge current; luka (flags.santa), chase, chase40 spawned (anywhere:
//   mount puts them on the seats); the six chasers spawned at the towers (tower_drones.release()); music 'scooter'.
// Autoplay (?autoplay=1): the real code paths, deterministic: Luka's own driver AI dodges every drop except the second
//   (one hug), the engine answers the dash pop-ups (doubles included), at s 224 SWAP to Chase, a drone buzzes between the
//   scooters, YES is held until the whir is recorded, back to Luka; halfway -> onHalfway; the swerve; finish.
//   MINIGAMES.scooter.dbg() -> a snapshot { phase, s, lane, v, mode, whir, ask, ... } for key-driven tests.
// Sounds (all existing): ss_chirp (the pop-ups), accepted, sad_beep, hug_field, drone_red (a drop telegraph), drone_ok
//   (a dodge), smp_whir (the buzz), swap_whoosh, whoosh (a lane change), thud (blocked), loop 'scooter' (rate = speed).
MINIGAMES.scooter = (() => {
  const PI = Math.PI;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const smooth = (u) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
  const approach = (v, t, d) => (v < t ? Math.min(t, v + d) : Math.max(t, v - d));
  const skipping = () => typeof flow !== 'undefined' && flow.skipping;

  // ---- the script (spec 9.8 / §8 2.5, word for word)
  const L_ASK = 'Are you sure?';
  const L_ASK2 = "Are you sure you're sure?";
  const L_HUG = 'Gotcha! ^ For your safety!';
  const L_YIELD = 'After you!';
  const L_END = 'Uneven terrain detected. ^ For your safety, pursuit has ended. ^ Have a lovely day!';
  const L_PLAY = 'The slowest chase in history.';   // the PLAY's title: the objective while it runs
  // UI text (not dialogue)
  const P_REC = 'HOLD — Record the Drone whir', P_WAIT = 'Wait for a drone to come close', P_BACK = 'SWAP — Back to Luka',
    P_SWAP = 'SWAP — Chase records the Drone whir';
  const HINTS = {
    kb: ['← → change lane   ·   ENTER: YES to SafeSense   ·   TAB: Chase records', '← → lane · ENTER yes · TAB Chase'],
    pad: ['Stick / d-pad: change lane   ·   A: YES to SafeSense   ·   Y: Chase records', 'Stick: lane · A yes · Y Chase'],
    touch: ['Stick or swipe: change lane   ·   YES to SafeSense   ·   SWAP: Chase records', 'Swipe: lane · YES · SWAP Chase'],
  };
  const KMH = []; for (let i = 0; i <= 30; i++) KMH.push(i + ' km/h');

  // ---- tuning
  const DIFF = {
    normal: { win: 1.5, lead: 2.1, hug: 2.0, slowT: 2.6, slowK: 0.6, askGap: 6.2, gapK: 1, doubles: true, slowMsg: 'Slowing to 15 km/h. For your safety.' },
    story: { win: 2.6, lead: 3.0, hug: 1.2, slowT: 1.5, slowK: 0.8, askGap: 8.5, gapK: 1.35, doubles: false, slowMsg: 'Slowing to 20 km/h. For your safety.' },
  };
  const LAT_V = 6.0, LAT_V2 = 4.6, REC_R = 2.6, STEER_END = 700;
  const DRONE_IDS = ['d25_c1', 'd25_c2', 'd25_c3', 'd25_c4', 'd25_c5', 'd25_c6'];
  const DROP_IDS = ['d25_drop_1', 'd25_drop_2'];
  // the chase pack: [dx (the flankers from scooter_1, the rest from half its x), hover over the deck, dz behind scooter_1]
  const PACK = [[2.5, 2.85, -2.7], [-2.5, 2.95, -3.1], [1.2, 3.3, -7.5], [-1.6, 3.1, -9.0], [3.4, 2.6, -11.5], [-3.2, 2.75, -12.6]];
  const PATTERN = [[42, 1], [34, 1], [44, 2], [36, 1], [30, 1], [46, 2], [38, 1], [40, 2]];   // [metres to the next drop, lanes]
  const NO_DROP_CAM = { ch_launch: 1, ch_shoulder: 1, ch_channel: 1 };   // the drops play behind the riders (FOLLOW) and under ch_lamp
  // overlay palette (SafeSense glass, spec §12)
  const C = { glass: 'rgba(248,252,255,0.82)', edge: 'rgba(255,255,255,0.95)', glow: 'rgba(120,190,255,0.55)', ink: '#1c2a44',
    sub: '#6b84aa', ss: '#2f86e0', track: 'rgba(20,29,58,0.14)', navy: '#141d3a', cream: '#f3ecdc', red: '#d8323a',
    amber: '#d98a1c', cell: 'rgba(20,29,58,0.08)', cellEdge: 'rgba(47,134,224,0.45)', warn: 'rgba(216,50,58,', shadow: 'rgba(0,0,0,0.85)' };
  const F_LBL = 'bold 10px "Trebuchet MS", "Segoe UI", system-ui, sans-serif', F_25 = 'bold 9px "Trebuchet MS", "Segoe UI", system-ui, sans-serif',
    F_SPD = 'bold 15px "Trebuchet MS", "Segoe UI", system-ui, sans-serif', F_HINT = '12px "Trebuchet MS", "Segoe UI", system-ui, sans-serif';
  const WARN_A = []; for (let i = 0; i <= 20; i++) WARN_A.push(C.warn + (0.25 + 0.6 * i / 20).toFixed(2) + ')');

  // ---- state (reset by start)
  let api = null, P = null, run = 0, phase = 'off', bot = false, D = DIFF.normal, story = false;
  let SB = null, CH = null, sc1 = null, sc2 = null, marks = null, cars = null, hug = null, eng = null, engRate = 1, prevYield = null;
  let A1 = null, A2 = null, A3 = null;
  let t = 0, playT = 0, uiA = 0, hintT = 0, camFlip = false, stickX = 0;
  let s1 = 0, x1 = 0, lane1 = 0, v1 = 0, vx1 = 0, lean1 = 0, kick = 0;
  let s2 = 0, x2 = 0, lane2 = 1, want2 = 1, v2 = 0, vx2 = 0, aiT2 = 0;
  let slowT = 0, hugT = 0, hugI = -1, pressure = 0, fb = 0;
  let mode = 'luka', recK = 0, whir = false, swapBackT = 0, buzzCool = 0, botSwapped = false;
  let askT = 0, askN = 0, askStage = 0, askTok = 0, askH = null, askDbl = false, askAI = false, aiAsk = 0, dashOkT = 0, dash2T = 0, dash2St = '';
  let nextDropS = 0, patI = 0, dropN = 0, dblN = 0, aiReact = 0;
  let camName = '', easeNext = 0, laughDone = false, laughS0 = 0, laughS2 = 0, swerved = false, endT = 0, endBarked = false, swX = 0, pelN = 0;
  let stats = null;
  const FOL = { pos: [0, 2, 0], look: [0, 1, 10], fov: 52, ease: 0 };
  const SETCAM = {};
  const AT = [0.5, 0.7], AT2 = [0.5, 0.58];
  const SPEC1 = { style: 'safesense', title: 'SafeSense', msg: L_ASK, buttons: ['YES'], at: AT, w: 230, dur: 1.5, progress: { from: 100, to: 0, dur: 1.5 }, cls: 'mgsc' };
  const SPEC2 = { style: 'safesense', title: 'SafeSense', msg: L_ASK2, buttons: ['YES'], at: AT, w: 300, dur: 1.5, progress: { from: 100, to: 0, dur: 1.5 }, cls: 'mgsc', shake: true };
  const SPEC_SLOW = { style: 'safesense', title: 'SafeSense', msg: '', buttons: [], at: AT2, w: 250, dur: 1.8, ding: false, cls: 'mgsc' };
  const PIL0 = { rec: false }, PIL1 = { rec: true }, NOOPT = {};
  const PK = [], DD = [];
  for (let i = 0; i < 6; i++) PK.push({ id: '', d: null, x: 0, h: 3, z: 0 });
  for (let i = 0; i < 2; i++) DD.push({ i, id: DROP_IDS[i], d: null, st: 'park', t: 0, T: 1, x: 0, z: 0, h: 40, lane: 0, ours: false, n: 0, lift: 0, ox: 0, whirred: false });
  let V3 = null, styleEl = null, sch = '';
  const LY = { x: 0, y: 0, w: 0, h: 0, s: 1, narrow: false, lw0: 0, lw1: 0, hint: '' };
  let W = 0, H = 0;

  // ---------------------------------------------------------- helpers
  function dput(d, x, h, z, yaw, vx, vz, snap) {   // fly a DRONES record (the systems ticker keeps the previous tick for interpolation)
    if (!d || !d.obj) return;
    d.x = d.hx = x; d.z = d.hz = z; d.hover = h; d.yaw = d.hyaw = yaw; d.vx = vx; d.vz = vz;
    d.y = (SB && SB.floor ? SB.floor(x, z) : 0) + h;
    if (snap) { d.px = x; d.pz = z; d.py = d.y; d.pyaw = yaw; }
  }
  const tlog = (m) => { if (typeof testLog === 'function') testLog('scooter: ' + m); };
  const ev = (name, data) => { if (typeof emit === 'function') emit(name, data); };
  const snd = (name, vol) => { if (!skipping() && api) api.sfx(name, vol == null ? undefined : { vol }); };
  function carBlock(l, s) {        // a hover-car alongside in lane L (yielded ones sit on the shoulder at x 5.1: not in the lane)
    if (l !== 0 || !CH) return false;
    const T = CH.traffic;
    for (let i = 0; i < T.length; i++) { const c = T[i]; if (c.vis && c.mode === 'deck' && c.x > 2.0 && c.x < 4.6 && c.z - s > -3.4 && c.z - s < 4.6) return true; }
    return false;
  }
  function carNear(s0, s1x) {
    if (!CH) return false;
    const T = CH.traffic;
    for (let i = 0; i < T.length; i++) { const c = T[i]; if (c.vis && c.mode === 'deck' && c.x < 4.6 && c.z > s0 && c.z < s1x) return true; }
    return false;
  }
  function dropIn(l, s, range) {   // a dropped drone in lane l between s - 1 and s + range
    for (let i = 0; i < 2; i++) { const q = DD[i]; if ((q.st === 'drop' || q.st === 'wait') && q.lane === l && q.z > s - 1 && q.z < s + range) return q; }
    return null;
  }
  function screenLane(dir) {      // a screen-left/right press -> lane index delta (camera-relative; rider-relative side-on)
    const e = api.cam.camera.matrixWorld.elements, rx = e[0];
    const dxs = rx > 0.35 ? dir : -dir;
    return -dxs;                    // LANES[0] is +X
  }
  function riders() {
    if (A1) A1.play('scooter_drive', NOOPT);
    if (A3) A3.play('scooter_drive', NOOPT);
    setRec(mode === 'chase', true);
  }
  function setRec(on, force) {
    if (!A2) return;
    if (A2.rig && A2.rig.show) A2.rig.show('phone', !!on);
    if (force || A2.anim === 'scooter_pillion') A2.play('scooter_pillion', on ? PIL1 : PIL0);
  }
  function onYield() {
    if (phase !== 'play' || skipping() || typeof bark !== 'function') return;
    stats.yields++; bark('hovercar', L_YIELD);
  }

  // ---------------------------------------------------------- input, AI
  function steer(dir) {
    const nl = clamp(lane1 + screenLane(dir), 0, 2);
    if (nl === lane1) { kick = (LANES()[lane1] > 0 ? -1 : 1) * 0.12; snd('thud', 0.18); return; }
    if (carBlock(nl, s1)) { stats.blocked++; kick = 0.16 * (nl < lane1 ? -1 : 1); snd('thud', 0.35); return; }
    lane1 = nl; snd('whoosh', 0.22);
  }
  const LANES = () => CH.LANES;
  function trySwap() {
    if (phase !== 'play' || s1 >= STEER_END - 8) return;
    mode = mode === 'luka' ? 'chase' : 'luka';
    if (ui && ui.swapIndicator) ui.swapIndicator(mode, mode === 'luka' ? 'chase' : 'luka');
    snd('swap_whoosh', 0.5);
    setRec(mode === 'chase');
    if (mode === 'chase') { buzzCool = Math.min(buzzCool, 0.9); aiReact = 0.25; aiAsk = Math.min(aiAsk, 0.6); }
    else { recK = 0; if (ui.meter) ui.meter(null); }
    ev('scooter:swap', mode); tlog('swap ' + mode);
  }
  function lukaAI(dt) {             // Luka drives himself (recording mode, autoplay): dodge a drop in his lane
    const q = dropIn(lane1, s1, 30);
    if (!q || q.z < s1 - 0.5) { aiReact = 0.25; return; }
    if (bot && q.n === 2 && q.ours) return;          // autoplay: take the second drop on the chin (one hug)
    if ((aiReact -= dt) > 0) return;
    const a = lane1 - 1, b = lane1 + 1, pa = a >= 0 && !dropIn(a, s1, 30) && !carBlock(a, s1), pb = b <= 2 && !dropIn(b, s1, 30) && !carBlock(b, s1);
    if (pa && pb) lane1 = Math.abs(LANES()[a] - x2) > Math.abs(LANES()[b] - x2) ? a : b;   // away from Chase (2040)
    else if (pa) lane1 = a; else if (pb) lane1 = b;
    else { const c = lane1 === 1 ? 0 : 1; if (c !== lane1 && !dropIn(c, s1, 30)) lane1 = c; }
  }
  function ai2(dt) {                // Chase (2040): ride alongside in another lane, keep out of the drops and the cars
    const lineup = s1 >= STEER_END;   // for the swerve: Luka to lane L, Chase (2040) to lane M, never across each other
    if (lineup) want2 = 1;
    else if ((aiT2 -= dt) <= 0 || lane1 === lane2) {
      aiT2 = 0.25;
      let best = lane2, bs = 1e9;
      for (let l = 0; l < 3; l++) {
        let sc = 0;
        if (l === lane1) sc += 6;
        if (Math.abs(l - lane1) === 1) sc -= 1;
        if (l !== lane2) sc += 0.6;
        if (dropIn(l, s2, 32)) sc += 20;
        if (carBlock(l, s2)) sc += 30;
        if (sc < bs) { bs = sc; best = l; }
      }
      want2 = best;
    }
    const L = LANES(), tx = L[want2];
    const cross = (x2 - x1) * (tx - x1) < 0 || Math.abs(tx - x1) < 1.7;
    if (want2 !== lane2 && (!cross || s2 > s1 + 3.2)) lane2 = want2;   // crossing Luka's line: from in front of him
    const share = Math.abs(L[lane2] - L[lane1]) < 1 || Math.abs(x2 - x1) < 1.8 || want2 !== lane2;
    const dz = share || lineup ? 4.4 : 1.2;   // alongside a nose ahead (the FOLLOW lens sits 7 m behind Luka), well ahead to share a lane
    const tv = clamp(v1 + (s1 + dz - s2) * 1.6, 0, CH.SPEED * 1.1);
    v2 = approach(v2, tv, 7 * dt);
    s2 += v2 * dt;
    vx2 = clamp((L[lane2] - x2) * 5, -LAT_V2, LAT_V2); x2 += vx2 * dt;
  }

  // ---------------------------------------------------------- the drops, the hug, the buzz
  function tryDrop() {
    const p = PATTERN[patI % PATTERN.length], mz = s1 + CH.SPEED * D.lead + 3;
    const blocked = NO_DROP_CAM[camAt(s1)] || NO_DROP_CAM[camAt(mz)] || (!laughDone && mz > CH.LAUGH - 14) || mz > CH.END - 40 || hugT > 0 || s1 > STEER_END - 30;
    if (blocked) { nextDropS = s1 + 8; return; }
    let free = 0; for (let i = 0; i < 2; i++) if (DD[i].st === 'park') free++;
    if (!free) { nextDropS = s1 + 6; return; }
    let dbl = p[1] === 2 && D.doubles && free === 2 && !carNear(mz - 16, mz + 16);
    const la = lane1;
    let lb = -1;
    if (dbl) lb = la === 1 ? (dblN++ % 2 ? 0 : 2) : la === 0 ? 2 : 0;
    let k = 0;
    for (let i = 0; i < 2 && k < (dbl ? 2 : 1); i++) {
      const q = DD[i]; if (q.st !== 'park') continue;
      launch(q, k === 0 ? la : lb, mz + (k ? 1.2 : 0), k === 0);
      k++;
    }
    dropN++; patI++;
    nextDropS = s1 + p[0] * D.gapK;
    snd('drone_red', 0.4);
  }
  function launch(q, lane, z, ours) {
    q.st = 'drop'; q.t = 0; q.T = Math.max(0.8, D.lead - 0.35); q.lane = lane; q.x = LANES()[lane]; q.z = z; q.h = 9.5; q.ours = ours; q.n = dropN + 1; q.lift = 0;
    if (marks) marks.userData.show(q.i, q.x, q.z, 1.25);
    dput(q.d, q.x, q.h, q.z, PI, 0, 0, true);
    if (typeof DRONES !== 'undefined') DRONES.light(q.id, 'escort');
  }
  function leave(q) {
    if (marks) marks.userData.hide(q.i);
    q.st = 'leave'; q.t = 0;
  }
  function park(q) {
    q.st = 'park'; q.t = 0; q.h = 40; q.x = -60; q.z = s1 - 80;
    if (marks) marks.userData.hide(q.i);
    dput(q.d, q.x, q.h, q.z, 0, 0, 0, true);
  }
  function startHug(q) {
    hugT = D.hug; hugI = q.i; q.st = 'hug'; q.t = 0;
    stats.hugs++;
    v1 *= 0.3;
    cancelAsk(); askT = Math.max(askT, D.hug + 1.5);
    if (marks) marks.userData.hide(q.i);
    if (hug) { hug.visible = true; hug.scale.set(0.2, 0.2, 0.2); }
    snd('hug_field', 0.7);
    if (!skipping() && typeof bark === 'function') bark('drone', L_HUG);
    if (A1 && A1.setExpr) A1.setExpr('scared');
    ev('scooter:hug', stats.hugs); tlog('hug ' + stats.hugs + ' s=' + Math.round(s1));
  }
  function endHug() {
    if (hug) hug.visible = false;
    if (hugI >= 0 && DD[hugI].st === 'hug') leave(DD[hugI]);
    hugI = -1;
    if (A1 && A1.setExpr) A1.setExpr('neutral');
  }
  function startBuzz() {
    let q = null; for (let i = 0; i < 2; i++) if (DD[i].st === 'park') { q = DD[i]; break; }
    if (!q) { buzzCool = 1; return; }
    q.st = 'buzz'; q.t = 0; q.whirred = false; q.lane = -1;
    q.x = x1; q.z = s1 + 14; q.h = 9;
    dput(q.d, q.x, q.h, q.z, PI, 0, 0, true);
    if (typeof DRONES !== 'undefined') DRONES.light(q.id, 'curious');
  }
  function dropTick(dt) {
    const SPD = CH.SPEED;
    for (let i = 0; i < 2; i++) {
      const q = DD[i];
      switch (q.st) {
        case 'park': q.z = s1 - 80; dput(q.d, -60, 40, q.z, 0, 0, 0, true); break;
        case 'drop': {
          q.t += dt; const k = clamp(q.t / q.T, 0, 1), e = 1 - (1 - k) * (1 - k);
          q.h = 9.5 + (1.35 - 9.5) * e;
          dput(q.d, q.x, q.h, q.z, PI, 0, -2, false);
          if (k >= 1) { q.st = 'wait'; q.t = 0; }
          break;
        }
        case 'wait': {
          q.t += dt;
          if (Math.abs(x2 - q.x) < 1.6 && q.z - s2 < 4.5 && q.z - s2 > -1.6) q.lift = 1; else q.lift = Math.max(0, q.lift - dt);   // let Chase (2040) under
          const h = 1.35 + 1.3 * smooth(q.lift);
          q.h += (h - q.h) * Math.min(1, dt * 6);
          dput(q.d, q.x, q.h, q.z, PI, 0, 0, false);
          if (phase === 'play' && hugT <= 0 && Math.abs(x1 - q.x) < 1.45 && q.z - s1 < 1.25 && q.z - s1 > -0.6) { startHug(q); break; }
          if (s1 > q.z + 1.6) { if (q.ours) { stats.dodges++; snd('drone_ok', 0.35); ev('scooter:dodge', stats.dodges); } leave(q); }
          else if (q.t > 8) leave(q);
          break;
        }
        case 'hug': {
          q.x += (x1 - q.x) * Math.min(1, dt * 8); q.z = s1 + 0.95; q.h += (1.5 - q.h) * Math.min(1, dt * 6);
          dput(q.d, q.x, q.h, q.z, PI, 0, 0, false);
          break;
        }
        case 'buzz': {      // down between the scooters, alongside Chase at 25 km/h, then up and away
          q.t += dt;
          const between = Math.abs(x2 - x1) > 2.2, ox = between ? (x2 - x1) / 2 : x1 > 0 ? -2.0 : 2.0;
          let rz, h;
          if (q.t < 1.4) { const e = smooth(q.t / 1.4); rz = 14 + (-0.4 - 14) * e; h = 9 + (1.95 - 9) * e; }
          else if (q.t < 4.8 && !(whir && q.t > 2.2)) { rz = -0.4 + 0.35 * Math.sin(q.t * 2.1); h = 1.95 + 0.12 * Math.sin(q.t * 3.3); }
          else { if (q.t < 4.8) q.t = 4.8; const u = q.t - 4.8; rz = -0.4 - u * u * 3; h = 1.95 + u * 5; }
          if (!q.whirred && q.t > 1.1) { q.whirred = true; snd('smp_whir', 0.75); }
          q.x += (x1 + ox - q.x) * Math.min(1, dt * 5); q.z = s1 + rz; q.h = h;
          dput(q.d, q.x, q.h, q.z, q.t < 4.8 ? 0.4 * Math.sign(ox) : 0, 0, SPD, false);
          if (q.h > 14) { park(q); buzzCool = 1.6; }
          break;
        }
        case 'leave': {
          q.t += dt; q.h += (2 + q.t * 7) * dt; q.z += 2.5 * dt; q.x += (q.x > 0 ? 1 : -1) * 1.5 * dt;
          dput(q.d, q.x, q.h, q.z, PI, 0, 0, false);
          if (q.h > 16) park(q);
          break;
        }
      }
    }
  }
  function packTick(dt) {
    const F = CH.formation, pk = 1 - 0.45 * pressure;
    for (let i = 0; i < 6; i++) {
      const R = PK[i], o = PACK[i], f = F[i];
      let tx = clamp((i < 2 ? x1 : x1 * 0.5) + o[0] + Math.sin(t * 0.8 + i * 1.7) * 0.3, -5.7, 6.6);
      let th = o[1] - 0.35 * pressure, tz = s1 + o[2] * pk;
      if (fb > 0) { tx += (f[0] - tx) * fb; th += (f[1] - th) * fb; tz += (s1 + f[2] - tz) * fb; }
      const cz = clamp((tz - R.z) * 3, -9, 9);
      R.z += (v1 + cz) * dt;
      R.x += clamp((tx - R.x) * 3.2, -8, 8) * dt;
      R.h += clamp((th - R.h) * 2.5, -6, 6) * dt;
      dput(R.d, R.x, R.h, R.z, Math.atan2((x1 - R.x) * 0.3, 6), 0, v1 + cz, false);
    }
  }

  // ---------------------------------------------------------- the dash prompts
  function placeAsk() {
    const touch = api.input.scheme === 'touch';
    if (camName === 'FOLLOW' || !V3) { AT[0] = 0.5; AT[1] = touch ? 0.6 : 0.76; }   // over the scooter, clear of the road ahead
    else {
      V3.set(x1, CH.deckY(s1) + 1.2, s1 + 0.5);
      const p = api.cam.project(V3);
      AT[0] = clamp(p.x / Math.max(1, innerWidth), 0.24, 0.76); AT[1] = clamp(p.y / Math.max(1, innerHeight) - 0.12, 0.3, touch ? 0.6 : 0.72);
    }
    AT2[0] = AT[0]; AT2[1] = Math.max(0.24, AT[1] - 0.12);
  }
  function openAsk() {
    askN++; askDbl = askN % 4 === 0; askStage = 1; askTok++; askAI = false; aiAsk = 0.7;
    stats.asks++;
    placeAsk();
    SPEC1.dur = SPEC1.progress.dur = D.win;
    askH = api.popup(SPEC1);
    const tok = askTok; askH.done.then((k) => onAsk(tok, k));
    if (sc1) sc1.userData.dash('ask');
    if (sc2) { sc2.userData.dash('ask'); dash2T = 0.55; dash2St = 'ok'; }
    ev('scooter:ask', { n: askN, double: askDbl }); tlog('ask ' + askN + (askDbl ? ' (x2)' : ''));
  }
  function onAsk(tok, k) {
    if (tok !== askTok || !askStage || phase !== 'play') return;
    askH = null;
    const yes = k === 0 || askAI; askAI = false;
    if (yes && askDbl && askStage === 1) {      // "...Are you sure you're sure?" YES again
      askStage = 2; askTok++; aiAsk = 0.6;
      placeAsk();
      SPEC2.dur = SPEC2.progress.dur = D.win;
      askH = api.popup(SPEC2);
      const tk = askTok; askH.done.then((k2) => onAsk(tk, k2));
      if (sc1) sc1.userData.dash('ask2');
      return;
    }
    askStage = 0;
    if (yes) {
      stats.answered++; if (askDbl) stats.doubles++;
      if (sc1) sc1.userData.dash('ok');
      dashOkT = 0.9; snd('accepted', 0.3);
    } else {
      stats.missed++; slowT = D.slowT;
      if (sc1) sc1.userData.dash('idle');
      snd('sad_beep', 0.5);
      if (!skipping()) { SPEC_SLOW.msg = D.slowMsg; api.popup(SPEC_SLOW); }
      ev('scooter:miss', stats.missed); tlog('miss ' + stats.missed);
    }
    askT = D.askGap;
  }
  function cancelAsk() {
    if (!askStage) return;
    askStage = 0; askTok++;
    if (askH) { const h = askH; askH = null; h.close(); }
    if (sc1) sc1.userData.dash('idle');
    askT = Math.max(askT, 2.5);
  }
  function canAsk() {
    return s1 > CH.START + 18 && s1 < STEER_END - 12 && (laughDone ? s1 < CH.END - 24 : s1 < CH.LAUGH - 16);
  }
  function askTick(dt) {
    if (dashOkT > 0 && (dashOkT -= dt) <= 0 && !askStage && sc1) sc1.userData.dash('idle');
    if (dash2T > 0 && (dash2T -= dt) <= 0 && sc2) { sc2.userData.dash(dash2St); if (dash2St === 'ok') { dash2St = 'idle'; dash2T = 0.9; } }
    if (askStage) {
      if (mode === 'chase' && (aiAsk -= dt) <= 0 && askH) { askAI = true; const h = askH; askH = null; h.close(); }   // Luka taps YES himself
      return;
    }
    if (hugT > 0 || !canAsk()) return;
    if ((askT -= dt) > 0) return;
    const q = dropIn(lane1, s1, 9);            // not right on top of a drop
    if (q && q.st === 'drop') { askT = 0.6; return; }
    openAsk();
  }

  // ---------------------------------------------------------- recording (Chase on the pillion)
  function recTick(dt) {
    if (swapBackT > 0 && (swapBackT -= dt) <= 0 && mode === 'chase') trySwap();
    if (bot && !botSwapped && !whir && s1 > 224 && hugT <= 0) { botSwapped = true; trySwap(); }
    if (mode !== 'chase') {
      let near = false;
      if (!whir) for (let i = 0; i < 2; i++) { const q = DD[i]; if ((q.st === 'wait' || q.st === 'buzz') && Math.abs(q.z - s1) < 6 && Math.abs(q.x - x1) < 4.5) near = true; }
      ui.prompt(near ? P_SWAP : null);
      return;
    }
    if (!whir && (buzzCool -= dt) <= 0) { let busy = false; for (let i = 0; i < 2; i++) if (DD[i].st === 'buzz') busy = true; if (!busy) startBuzz(); }
    const cz = s1 - 0.32, cy = CH.deckY(s1) + 1.5;
    let dmin = 99;
    for (let i = 0; i < 2; i++) {
      const q = DD[i]; if (q.st === 'park') continue;
      const d = q.d; if (!d) continue;
      const dd = Math.hypot(d.x - x1, d.y - cy, d.z - cz); if (dd < dmin) dmin = dd;
    }
    for (let i = 0; i < 6; i++) { const d = PK[i].d; if (!d) continue; const dd = Math.hypot(d.x - x1, d.y - cy, d.z - cz); if (dd < dmin) dmin = dd; }
    const near = dmin < REC_R;
    const hold = bot ? near : api.input.holding('yes');
    if (!whir && near && hold) {
      recK += dt / ((typeof CONFIG !== 'undefined' && CONFIG.record) || 1);
      if (recK >= 1) gotWhir();
    } else recK = Math.max(0, recK - dt * 1.5);
    if (ui.meter) ui.meter(recK > 0 && !whir ? 'Recording' : null, recK);
    ui.prompt(whir ? P_BACK : near ? P_REC : P_WAIT);
  }
  function gotWhir() {
    whir = true; recK = 0; stats.whirRec = true;
    if (ui.meter) ui.meter(null);
    if (api.input.unlatch) api.input.unlatch('yes');
    if (flow && flow.learnSample) flow.learnSample('whir');
    swapBackT = 1.4;
    ev('scooter:whir'); tlog('whir');
  }

  // ---------------------------------------------------------- camera
  function camAt(s) {               // the set's schedule, but a fixed lens looking back hands over once the chase has passed it
    const n = CH.camAt(s);
    if (n === 'FOLLOW') return n;
    const c = SB.cams && SB.cams[n];
    return c && c.pos && c.look && c.look[2] < c.pos[2] && s > c.pos[2] + 1.5 ? 'FOLLOW' : n;
  }
  function camTick(dt) {
    const name = phase === 'swerve' ? (swX > 19 ? 'bw_end' : 'ch_end') : phase === 'laugh' ? 'FOLLOW' : camAt(s1);
    if (name !== camName) {
      camName = name;
      if (name === 'FOLLOW') {
        CH.followAt(FOL.pos, FOL.look, dt, true); FOL.fov = CH.follow.fov; FOL.ease = easeNext;
        api.cam.override('fixed', FOL); FOL.ease = 0;
      } else {
        const o = SETCAM[name] || (SETCAM[name] = { name, ease: 0 });
        o.ease = easeNext; api.cam.override('set', o); o.ease = 0;
      }
      easeNext = 0;
    } else if (name === 'FOLLOW') CH.followAt(FOL.pos, FOL.look, dt, false);
    const e = api.cam.camera.matrixWorld.elements;
    camFlip = e[0] > 0.35;
  }

  // ---------------------------------------------------------- halfway (the laugh) and the end (the swerve)
  function quiet() {                // close the game's UI and hazards for a cutscene / the swerve
    cancelAsk();
    if (hugT > 0) { hugT = 0; endHug(); }
    slowT = 0;
    for (let i = 0; i < 2; i++) park(DD[i]);
    if (mode === 'chase') { mode = 'luka'; setRec(false); if (ui.swapIndicator) ui.swapIndicator('luka', 'chase'); }
    recK = 0; swapBackT = 0;
    if (ui.meter) ui.meter(null);
    ui.prompt(null);
    if (sc1) sc1.userData.pose(LANES()[lane1], s1, 0, 0);
    if (sc2) sc2.userData.pose(LANES()[lane2], s2, 0, 0);
    x1 = LANES()[lane1]; x2 = LANES()[lane2]; vx1 = vx2 = 0;
  }
  function runHalfway() {
    const h = P.onHalfway;
    if (typeof h === 'function') return h(api);
    if ((typeof h === 'string' || Array.isArray(h)) && typeof playCutscene === 'function') return playCutscene(h);
    return null;
  }
  function startLaugh() {
    phase = 'laugh'; laughDone = true; laughS0 = s1; laughS2 = s2;
    quiet();
    if (ui.swapIndicator) ui.swapIndicator(null);
    if (typeof bark === 'function' && bark.clear) bark.clear();
    CH.cruise(true, { drones: P.drones });
    camTick(1 / 60);                  // the gameplay camera under the cutscene: FOLLOW, tracked while it cruises (its release eases into it)
    ev('scooter:halfway'); tlog('halfway s=' + Math.round(s1));
    const tok = run;
    let pr = null;
    try { pr = runHalfway(); } catch (e) { console.error('TWO: scooter onHalfway', e); }
    Promise.resolve(pr).catch((e) => console.error('TWO: scooter onHalfway', e)).then(() => { if (tok === run && phase === 'laugh') afterLaugh(); });
  }
  function grantLaugh() {
    if (flow && flow.learnSample) flow.learnSample('laugh');
    state.flags.s25_laugh = true;
  }
  function afterLaugh() {
    CH.cruise(false);
    grantLaugh();
    s1 = CH.s(); s2 = s1 - (laughS0 - laughS2);
    v1 = v2 = CH.SPEED;
    for (let i = 0; i < 6; i++) { const R = PK[i], d = R.d; if (d) { R.x = d.x; R.h = d.hover; R.z = d.z; } }
    fb = 1; phase = 'play'; askT = 2.5; nextDropS = Math.max(nextDropS, s1 + 22);
    riders();
    if (ui.swapIndicator) ui.swapIndicator('luka', 'chase');
    ev('scooter:resume', s1); tlog('resume s=' + Math.round(s1));
  }
  function startSwerve() {
    phase = 'swerve';
    quiet();
    if (ui.swapIndicator) ui.swapIndicator(null);
    const tok = run;
    CH.swerve({ drones: P.drones, speed: P.swerveSpeed || CH.SPEED }).then(() => { if (tok === run && phase === 'swerve') { swerved = true; endT = 1.0; } });
    ev('scooter:swerve'); tlog('swerve');
  }
  function swerveTick(dt) {
    s1 = CH.s(); if (sc1) swX = sc1.position.x;
    if (!endBarked && swX > 8.6 && P.endLine !== false) {
      endBarked = true;
      if (!skipping() && typeof bark === 'function') bark('drone', typeof P.endLine === 'string' ? P.endLine : L_END);
    }
    uiA = approach(uiA, 0, dt * 2);
    camTick(dt);
    if (eng) { const r = 0.75; if (Math.abs(r - engRate) > 0.02) { engRate = r; eng.rate(r); } }
    if (swerved && (endT -= dt) <= 0) finish();
  }
  function result() {
    return { done: true, hugs: stats.hugs, dodges: stats.dodges, asks: stats.asks, answered: stats.answered, doubles: stats.doubles,
      missed: stats.missed, blocked: stats.blocked, yields: stats.yields, whir: state.samples.includes('whir'), laugh: true,
      swerved: true, time: Math.round(playT), story };
  }
  function finish() {
    if (phase === 'end') return;
    const r = result();
    ev('scooter:done', r); tlog('done ' + JSON.stringify(r));
    api.finish(r);
  }
  function snapEnd() {               // a skip: the end state the scene expects after the swerve
    if (!SB) return;
    if (CH && CH.cruising) CH.cruise(false);
    if (SB.dress) SB.dress('end25', { keepEnv: true });
    const M = SB.marks || {};
    for (let i = 0; i < 6; i++) { const m = M['d25_edge_' + (i + 1)], R = PK[i]; if (m && R.d) dput(R.d, m[0], m[1], m[2], m[3] || 0, 0, 0, true); }
  }

  // ---------------------------------------------------------- overlay (SafeSense glass strip, top centre)
  function layout() {
    const ctx = api.overlay.ctx;
    W = innerWidth; H = innerHeight; sch = api.input.scheme;
    const narrow = W < 640 || W < H * 0.8, s = narrow ? clamp(W / 500, 0.8, 1) : 1;
    let w = Math.min(W - 32, 440 * s);
    const h = 58 * s;
    let x = (W - w) / 2, y = 12;
    if (x + w > W - 300) y = 64;   // under the HUD pill (top right)
    if (sch === 'touch' && y + h > 60 && x + w > W - 68) { x = Math.max(12, Math.min(x, W - 68 - w)); w = Math.min(w, W - 68 - x); }   // clear of the touch pause button
    LY.x = x; LY.y = y; LY.w = w; LY.h = h; LY.s = s; LY.narrow = narrow;
    ctx.font = F_LBL; LY.lw0 = ctx.measureText('CLONTARF').width; LY.lw1 = ctx.measureText('BRIGHTON').width;
    const hs = HINTS[sch] || HINTS.kb; LY.hint = narrow ? hs[1] : hs[0];
  }
  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function dot(ctx, x, y, r, fill, stroke, lw) {
    ctx.beginPath(); ctx.arc(x, y, r, 0, PI * 2);
    ctx.fillStyle = fill; ctx.fill();
    if (stroke) { ctx.lineWidth = lw; ctx.strokeStyle = stroke; ctx.stroke(); }
  }
  function drawPanel(ctx) {
    const { x, y, w, h, s } = LY, START = CH.START, SPAN = CH.END - CH.START;
    ctx.shadowColor = C.glow; ctx.shadowBlur = 14 * s;
    rr(ctx, x, y, w, h, 14 * s); ctx.fillStyle = C.glass; ctx.fill();
    ctx.shadowBlur = 0; ctx.lineWidth = 1; ctx.strokeStyle = C.edge; ctx.stroke();
    // row 1: Clontarf -> Brighton
    const ty = y + 17 * s;
    ctx.font = F_LBL; ctx.textBaseline = 'middle'; ctx.fillStyle = C.sub;
    ctx.textAlign = 'left'; ctx.fillText('CLONTARF', x + 12 * s, ty);
    ctx.textAlign = 'right'; ctx.fillText('BRIGHTON', x + w - 12 * s, ty);
    const t0 = x + 12 * s + LY.lw0 + 9 * s, t1 = x + w - 12 * s - LY.lw1 - 9 * s, tw = t1 - t0;
    rr(ctx, t0, ty - 2.5 * s, tw, 5 * s, 2.5 * s); ctx.fillStyle = C.track; ctx.fill();
    const u1 = clamp((s1 - START) / SPAN, 0, 1), u2 = clamp((s2 - START) / SPAN, 0, 1), ud = clamp((s1 - 9 - START) / SPAN, 0, 1);
    if (u1 > 0) { rr(ctx, t0, ty - 2.5 * s, Math.max(5 * s, tw * u1), 5 * s, 2.5 * s); ctx.fillStyle = C.ss; ctx.fill(); }
    const hx = t0 + tw * clamp((CH.LAUGH - START) / SPAN, 0, 1);
    ctx.fillStyle = laughDone ? C.ss : C.navy; ctx.fillRect(hx - 1, ty - 6 * s, 2, 12 * s);
    dot(ctx, t0 + tw * ud, ty, 3 * s, C.red, null, 0);
    dot(ctx, t0 + tw * u2, ty, 3.5 * s, C.ss, C.edge, 1);
    dot(ctx, t0 + tw * u1, ty, 5 * s, C.cream, C.navy, 2 * s);
    // row 2: the 25 roundel + speed, the lane radar
    const ry = y + 40 * s, rx = x + 22 * s;
    dot(ctx, rx, ry, 10 * s, '#ffffff', C.red, 2.6 * s);
    ctx.font = F_25; ctx.textAlign = 'center'; ctx.fillStyle = C.navy; ctx.fillText('25', rx, ry + 0.5);
    const kmh = clamp(Math.round(v1 * 3.6), 0, 30);
    ctx.font = F_SPD; ctx.textAlign = 'left';
    ctx.fillStyle = hugT > 0 ? C.red : slowT > 0 || kmh < 24 ? C.amber : C.ink;
    ctx.fillText(KMH[kmh], rx + 16 * s, ry + 0.5);
    const cw = 24 * s, chh = 16 * s, gap = 5 * s, x0 = x + w - 12 * s - (cw * 3 + gap * 2), y0 = ry - chh / 2;
    for (let j = 0; j < 3; j++) {
      const l = camFlip ? 2 - j : j, cx = x0 + j * (cw + gap);
      rr(ctx, cx, y0, cw, chh, 4 * s); ctx.fillStyle = C.cell; ctx.fill(); ctx.lineWidth = 1; ctx.strokeStyle = C.cellEdge; ctx.stroke();
      for (let i = 0; i < 2; i++) {
        const q = DD[i];
        if ((q.st !== 'drop' && q.st !== 'wait') || q.lane !== l) continue;
        const k = clamp(1 - (q.z - s1) / (CH.SPEED * D.lead + 3), 0, 1);
        rr(ctx, cx, y0, cw, chh, 4 * s); ctx.fillStyle = WARN_A[Math.round(k * 20)]; ctx.fill();
      }
      if (l === lane2) dot(ctx, cx + cw - 5 * s, y0 + chh - 5 * s, 2.6 * s, C.ss, null, 0);
      if (l === lane1) { rr(ctx, cx + 4 * s, y0 + 3 * s, cw - 8 * s, chh - 6 * s, 3 * s); ctx.fillStyle = C.navy; ctx.fill(); dot(ctx, cx + cw / 2, y0 + chh / 2, 2.6 * s, C.cream, null, 0); }
    }
    if (hintT > 0) {
      ctx.globalAlpha = Math.min(1, hintT) * uiA;
      ctx.font = F_HINT; ctx.textAlign = 'center'; ctx.shadowColor = C.shadow; ctx.shadowBlur = 4;
      ctx.fillStyle = '#ffffff'; ctx.fillText(LY.hint, W / 2, y + h + 15 * s);
      ctx.shadowBlur = 0;
    }
  }

  // ---------------------------------------------------------- the registry entry
  const M = {
    skipResult: () => ({ done: true, laugh: true, swerved: true, whir: typeof state !== 'undefined' && state.samples.includes('whir'),
      hugs: stats ? stats.hugs : 0, asks: stats ? stats.asks : 0, missed: stats ? stats.missed : 0, story }),
    start(params, a) {
      api = a; P = params || {}; run++; phase = 'play'; bot = false;
      story = !!(typeof options !== 'undefined' && options.storyMode); D = story ? DIFF.story : DIFF.normal;
      stats = { hugs: 0, dodges: 0, asks: 0, answered: 0, doubles: 0, missed: 0, blocked: 0, yields: 0, whirRec: false };
      if (!P.drones) P.drones = DRONE_IDS;
      SB = typeof SETS !== 'undefined' ? SETS.bridge : null; CH = SB && SB.chase;
      if (!CH || world.setId !== 'bridge') {   // nothing to ride on: grant what the scene needs and get out
        console.warn('TWO: scooter needs the bridge set'); grantLaugh();
        phase = 'end'; wait(0.2).then(() => { if (api === a) a.finish({ done: true, laugh: true, noSet: true }); });
        return;
      }
      if (!V3) V3 = new THREE.Vector3();
      sc1 = world.prop('scooter_1'); sc2 = world.prop('scooter_2'); marks = world.prop('drop_marks'); cars = world.prop('cars');
      A1 = world.actor('luka'); A2 = world.actor('chase'); A3 = world.actor('chase40');
      if (P.dress !== false && SB.dressed && SB.dressed() !== 'chase25') SB.dress('chase25', { keepEnv: true });
      if (P.dress !== false && world.envName !== 'chase25' && world.env) world.env('chase25', 20, 'bridge');
      if (typeof flow !== 'undefined' && flow.setFollow) flow.setFollow(null);
      if (typeof player !== 'undefined') player.enabled = false;
      if (P.mount !== false) {
        if (A1) SB.mount('luka', 'scooter_1', 'driver');
        if (A2) SB.mount('chase', 'scooter_1', 'pillion');
        if (A3) SB.mount('chase40', 'scooter_2', 'driver');
      }
      // the scooters: start where the set has them (s25_launch_*)
      // (the groups' positions are written at render time, so a dress this frame isn't there yet: chase.s() is live)
      const L = CH.LANES, MK = SB.marks || {}, la = MK.s25_launch_1, lb = MK.s25_launch_2;
      s1 = CH.s();
      if (la && lb && Math.abs(s1 - la[2]) < 0.5) { x1 = la[0]; s2 = lb[2]; x2 = lb[0]; }
      else { x1 = sc1 ? sc1.position.x : L[0]; s2 = sc2 ? sc2.position.z : s1 - 2; x2 = sc2 ? sc2.position.x : L[1]; }
      lane1 = 0; for (let l = 1; l < 3; l++) if (Math.abs(L[l] - x1) < Math.abs(L[lane1] - x1)) lane1 = l;
      lane2 = 1; for (let l = 0; l < 3; l++) if (Math.abs(L[l] - x2) < Math.abs(L[lane2] - x2)) lane2 = l;
      if (lane2 === lane1) lane2 = lane1 === 1 ? 0 : 1;
      want2 = lane2; v1 = v2 = 0; vx1 = vx2 = 0; lean1 = 0; kick = 0; aiT2 = 0;
      t = 0; playT = 0; uiA = 0; hintT = 10; stickX = 0; camFlip = false;
      slowT = 0; hugT = 0; hugI = -1; pressure = 0; fb = 0;
      mode = 'luka'; recK = 0; whir = state.samples.includes('whir'); swapBackT = 0; buzzCool = 0; botSwapped = false;
      askT = 4.5; askN = 0; askStage = 0; askTok++; askH = null; askDbl = false; askAI = false; dashOkT = 0; dash2T = 0;
      nextDropS = CH.START + 50; patI = 0; dropN = 0; dblN = 0; aiReact = 0.25;
      camName = ''; easeNext = 0; laughDone = false; swerved = false; endT = 0; endBarked = false; swX = x1; pelN = 0;
      // the chasers: re-spawned in place, flown by this game (no cones, no AI)
      if (typeof DRONES !== 'undefined') {
        for (let i = 0; i < 6; i++) {
          const id = P.drones[i], old = id ? DRONES.get(id) : null, R = PK[i];
          if (!id) { R.d = null; continue; }
          const ox = old ? old.x : clamp(x1 + PACK[i][0], -5.6, 6.4), oz = old ? old.z : s1 + PACK[i][2] - 6, oh = old ? old.hover : 6;
          R.id = id; R.d = DRONES.spawn(id, { at: [ox, 0, oz], hover: oh, cone: false, ai: false, showPath: false, kind: old ? old.kind : 'courtesy', face: 0 });
          R.x = ox; R.z = oz; R.h = oh;
          DRONES.light(id, 'escort');
        }
        for (let i = 0; i < 2; i++) {
          const q = DD[i];
          q.d = DRONES.spawn(q.id, { at: [-60, 0, s1 - 80], hover: 40, cone: false, ai: false, showPath: false, kind: 'courtesy', face: 0 });
          q.st = 'park'; q.t = 0;
          DRONES.light(q.id, 'escort');
        }
      }
      if (marks) marks.userData.hide();
      if (cars) { prevYield = cars.userData.onYield; cars.userData.onYield = onYield; }
      if (sc1) { sc1.userData.glow(true); sc1.userData.dash('idle'); }
      if (sc2) { sc2.userData.glow(true); sc2.userData.dash('idle'); }
      if (sc1 && typeof PROPS !== 'undefined' && PROPS.hug_field) {
        if (!hug) { hug = PROPS.hug_field(); hug.name = 'scooter_hug'; }
        hug.visible = false; hug.position.set(0, 0.05, -0.1); sc1.add(hug);
      }
      riders();
      if (ui.swapIndicator) ui.swapIndicator('luka', 'chase');
      ui.prompt(null);
      if (P.objective !== false && typeof objective === 'function') objective(typeof P.objective === 'string' ? P.objective : L_PLAY);
      if (api.AUDIO && api.AUDIO.loop && !skipping()) { eng = api.AUDIO.loop('scooter', { vol: 0.42, fade: 0.8, rate: 0.7 }); engRate = 0.7; }
      // pop-ups: SafeSense glass with a draining bar (no percentage)
      if (!styleEl) { styleEl = document.createElement('style'); styleEl.textContent = '.jv.mgsc .jv-prog span{display:none}.jv.mgsc .jv-prog{margin-top:2px}.jv.mgsc .jv-msg{font-size:16px;font-weight:600}'; }
      api.ui.appendChild(styleEl);
      W = 0; layout();
      tlog('start' + (story ? ' (story)' : '') + ' s=' + Math.round(s1));
    },
    update(dt) {
      if (phase === 'off' || phase === 'end') return;
      t += dt;
      if (phase === 'laugh') { uiA = 0; s1 = CH.s(); camTick(dt); return; }
      if (phase === 'swerve') { swerveTick(dt); return; }
      playT += dt;
      if (hintT > 0) hintT -= dt;
      uiA = approach(uiA, 1, dt * 3);
      const I = api.input, L = LANES();
      // input: SWAP, lanes (keys, pad, stick flick, touch stick, swipe)
      if (I.pressed('swap')) { I.consume('swap'); trySwap(); }
      let dir = 0;
      if (I.pressed('left')) dir = -1; else if (I.pressed('right')) dir = 1;
      const mx = I.move.x;
      if (!dir && Math.abs(mx) > 0.6 && Math.abs(stickX) <= 0.35) dir = mx > 0 ? 1 : -1;
      stickX = mx;
      const p = I.pointer;
      if (!dir && p.released) { const ddx = p.upX - p.downX, ddy = p.upY - p.downY; if (Math.abs(ddx) > 48 && Math.abs(ddx) > 1.4 * Math.abs(ddy)) dir = ddx > 0 ? 1 : -1; }
      if (s1 >= STEER_END) {             // line up for the barrier gap (Chase (2040) gets out of the way first: ai2)
        const tx = L[0];
        if (lane1 !== 0 && (s2 > s1 + 3.2 || !((x1 - x2) * (tx - x2) < 0 || Math.abs(tx - x2) < 1.7))) lane1 = 0;
      }
      else if (mode === 'chase' || bot) lukaAI(dt);
      else if (dir && hugT <= 0) steer(dir);
      // speed: the hug stops him, a missed prompt slows him
      if (hugT > 0 && (hugT -= dt) <= 0) { hugT = 0; endHug(); }
      if (slowT > 0) slowT -= dt;
      const vT = hugT > 0 ? 0 : slowT > 0 ? CH.SPEED * D.slowK : CH.SPEED;
      v1 = approach(v1, vT, (vT < v1 ? (hugT > 0 ? 16 : 6) : 4) * dt);
      s1 += v1 * dt;
      vx1 = clamp((L[lane1] - x1) * 6, -LAT_V, LAT_V); x1 += vx1 * dt;
      kick *= Math.max(0, 1 - dt * 6);
      lean1 = clamp(-vx1 * 0.07 + kick, -0.28, 0.28);
      ai2(dt);
      if (sc1) sc1.userData.pose(x1 + kick * 0.4, s1, Math.atan2(vx1, Math.max(2, v1)) * 0.8, lean1);
      if (sc2) sc2.userData.pose(x2, s2, Math.atan2(vx2, Math.max(2, v2)) * 0.8, clamp(-vx2 * 0.07, -0.25, 0.25));
      if (hug && hug.visible) { const k = Math.min(1, hug.scale.x + dt * 6), b = 1 + 0.04 * Math.sin(t * 6); hug.scale.set(1.25 * k * b, 1.15 * k, 1.7 * k * b); }
      // the pack: closer while he's slowed or hugged; into chase.formation before the laugh and the swerve
      pressure = approach(pressure, hugT > 0 ? 1 : slowT > 0 ? 0.55 : 0, dt * 1.2);
      const fbT = !laughDone && s1 > CH.LAUGH - 30 ? smooth((s1 - (CH.LAUGH - 30)) / 24) : s1 > CH.END - 32 ? smooth((s1 - (CH.END - 32)) / 26) : 0;
      fb = fbT > fb ? fbT : approach(fb, fbT, dt * 0.45);
      packTick(dt);
      if (s1 >= nextDropS) tryDrop();
      dropTick(dt);
      askTick(dt);
      recTick(dt);
      if (pelN < 2 && s1 > (pelN ? 600 : 236)) { pelN++; const pe = world.prop('pelicans'); if (pe && pe.userData.flyby) pe.userData.flyby(s1 - 14); }
      if (eng) { const r = 0.7 + 0.3 * v1 / CH.SPEED; if (Math.abs(r - engRate) > 0.02) { engRate = r; eng.rate(r); } }
      if (!laughDone && s1 >= CH.LAUGH) { startLaugh(); return; }
      if (s1 >= CH.END) { startSwerve(); return; }
      camTick(dt);
    },
    draw() {
      if (!api || phase === 'off') return;
      const ov = api.overlay, ctx = ov.ctx;
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, ov.canvas.width, ov.canvas.height);
      if (phase === 'end' || phase === 'laugh' || uiA <= 0.01 || !CH) return;
      if (innerWidth !== W || innerHeight !== H || api.input.scheme !== sch) layout();
      const K = ov.canvas.width / W;
      ctx.setTransform(K, 0, 0, K, 0, 0); ctx.globalAlpha = uiA;
      drawPanel(ctx);
      ctx.globalAlpha = 1; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    },
    end(r) {
      const was = phase;
      phase = 'end'; run++; bot = false;
      cancelAsk();
      if (hug) { hug.visible = false; if (hug.parent) hug.parent.remove(hug); }
      if (marks) marks.userData.hide();
      if (typeof DRONES !== 'undefined') for (let i = 0; i < 2; i++) { DRONES.remove(DD[i].id); DD[i].d = null; DD[i].st = 'park'; }
      if (cars && cars.userData.onYield === onYield) cars.userData.onYield = prevYield;
      if (eng) { eng.stop(0.6); eng = null; }
      if (ui) { ui.prompt(null); if (ui.meter) ui.meter(null); if (ui.swapIndicator) ui.swapIndicator(null); }
      if (sc1) sc1.userData.dash('idle');
      if (sc2) sc2.userData.dash('idle');
      if (A2) { if (A2.rig && A2.rig.show) A2.rig.show('phone', false); }
      if (A1 && A1.setExpr) A1.setExpr('neutral');
      const ok = r && !r.aborted && was !== 'off';
      if (ok && CH) { grantLaugh(); state.flags.s25_chase = true; }
      if (r && r.skipped) { snapEnd(); tlog('skipped'); }
      else if (CH && CH.cruising) CH.cruise(false);
      if (api && api.cam && was !== 'off') api.cam.override(null);
      if (api) { const ctx = api.overlay.ctx; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, api.overlay.canvas.width, api.overlay.canvas.height); }
      for (let i = 0; i < 6; i++) PK[i].d = null;
      A1 = A2 = A3 = null; sc1 = sc2 = marks = cars = null;
    },
    autoplay(a) {
      if (api !== a) M.start(a.params || {}, a);
      bot = true;
    },
    // tests: a snapshot of the run (allocates; never called by the game)
    dbg: () => ({ phase, s: s1, lane: lane1, v: v1, mode, whir, ask: askStage, double: askDbl, hug: hugT, slow: slowT, cam: camName, s2, lane2, stats: stats && { ...stats } }),
  };
  return M;
})();
