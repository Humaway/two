// ============================================================ MINI-GAMES: Blend In (9.11, 3.1) + Secret Santa (3.1)
// 3.1 "Mandatory Fun" on the hq_atrium set (docs/sets/hq_atrium.md §5 marks, §7.3 drones, §7.4 stations, §12 data).
// Both are ROAM-STYLE games over the live set: the player walks the atrium under the set's own zone cameras, SWAPs
// between all three and uses CHIP, while this file runs the Fun Monitor drone, the festive actions and the deliveries.
// Decision (documented for content): they run as roam + systems. While a game runs it sets flow.roaming and flow.swap
// (restored at the end), so the flow's own SWAP, the inventory, Chip View (33-systems: CHIP only works in a roam) and
// the scene's other hotspots (the lanyard desk, the urn) all keep working; the set's festive / Secret Santa hotspots
// (h31_cracker, h31_hum, h31_pie, h31_merry_*, h31_gifts, h31_tags, h31_point_*, h31_give_*) are taken out of the
// scene's hotspot list for the game and put back after it: this file owns those verbs (context prompts next to the
// props, painted on the overlay). Run them as scene steps (['minigame', 'blend_in', {...}]), not from a hotspot's do.
//
// THE FUN MONITOR (shared by both): a 'fun' drone flying the set's paths.fun_loop at 1.1 m/s (≈ 59 s a loop), 2.6 m up,
// its beam a 5 m floor fan sweeping ±34° about its heading at 0.4 Hz (33-systems draws and clips it: hide behind the
// foam columns). This file steers it (DRONES.spawn parked, ai: false; its home/heading/sweep fields are written every
// tick so the sweep runs while it travels; fallback without them: a plain path patrol). Every party member in the beam
// must be doing something festive; idle in the beam for 3 s (4.5 s in Story Mode) -> the Monitor stops, turns to him,
// and a SafeSense pop-up over him asks "Are you having fun?" [YES] [NO]: YES -> it moves on (he is left alone for 10 s),
// NO -> a strike. Humming over 40 dB is a strike too. Two strikes -> the Quiet Corner (safeRoom({ variant: 'quiet' }),
// the set's own corner), api.fail() (the host offers "Skip this?" after two), retry at the checkpoint, strikes cleared,
// the Monitor back at the start of its loop. The idle in-beam time shows as an amber ring over a head; festive as green.
// FESTIVE ACTIONS (the active character, a context prompt next to the prop; YES):
//   Pull cracker  bi_cracker (r 1.25): it takes two: the nearest other playable within 3.2 m (or actor 'tom') comes
//                 round the table end; both put SAFETY GOGGLES ON FIRST (cracker_table.goggles), then pull_cracker:
//                 snap (cracker_table.pull, a red puff, sfx 'cracker'); both festive 8 s; goggles pushed up after.
//                 Played on a TWO shot (the zone camera there has a foam column in front of the table), then back.
//   Hum           bi_hum (r 1.45): HOLD YES to hold a note (with options.holdToPress: press to start, press again to
//                 stop; the note then settles at 37 dB by itself). The needle (a SafeSense dial on screen + the set's
//                 choir_meter.level(db)) swells while held and sinks when released: festive while it reads 30–40 dB;
//                 over 40 dB -> SafeSense chirp + a strike. Sound: AUDIO.loop('hum_voice'), its volume follows the dB.
//   Mince pie     bi_pie (r 1.25): tea_table.pie(i), anim eat (shows food); festive 7.8 s.
//   "Merry Christmas!"  to any floor staffer (crowd_staff 0–11) or recipient within 1.5 m (15 s each): a bark, the
//                 staffer nods and looks over; festive 4.5 s.
//   A timed action (pie, cracker, Merry) keeps a non-active character festive (he holds his spot: player.wait) after a
//   SWAP; walking away from the spot ends it. Hum needs the player on it.
//
// ------------------------------------------------------------ MINIGAMES.blend_in  (9.11)
// Call:  ['minigame', 'blend_in', { need, until, idle, cp, path, speed, keepDrone, flag, testCorner }]
//   need       how many of the party the Monitor must see being festive in its beam (default: every playable on the
//              set, i.e. 3: "swap to keep all three covered as it passes"); each is logged once (FUN LOGGED).
//   until      instead of the quota: a flag | [flags] | (state) => bool that ends the game (e.g. Luka reaching HR).
//   idle       seconds idle in the beam before the question (default 3; Story Mode 4.5).
//   cp         the retry checkpoint after the Quiet Corner (default mark 's31_cp'; the others ±1 m beside him).
//   path/speed the Monitor's loop (default SETS.hq_atrium.paths.fun_loop, 1.1 m/s).
//   keepDrone  default true: the Fun Monitor keeps flying after the game (secret_santa adopts it; content can remove
//              it with MINIGAMES.blend_in.stopMonitor() or DRONES.remove('fun_monitor')).
//   flag       set on success / skip (default 's31_blended').
// Result: { done: true, logged: [ids], asks, yes, strikes, corners, acts }  (skip: { skipped: true, done: true }).
// Events: blend_in:logged (id), blend_in:ask (id), blend_in:strike ({ who, n, why }), blend_in:corner (id).
// Autoplay: real code paths, deterministic: the followers are parked, Chase (2040) idles under the Monitor -> the
// question -> YES; Luka eats a mince pie as the beam passes the tea table (logged) and
// wishes a staffer "Merry Christmas!"; Chase hums too loud once (strike
// one), then holds the note in tune (logged); Chase (2040) and Luka pull a cracker, goggles first (logged) -> done.
// testCorner: true adds two strikes first (the Quiet Corner + api.fail + retry), for tests.
//
// ------------------------------------------------------------ MINIGAMES.secret_santa  (3.1, needs all three)
// HR: "Oh thank god. ^ You're late. Gifts are on the table. Names are on the tags." / LUKA: "…Ho ho." (intro), then five
// deliveries, each in four hands-offs (the panel always says whose turn it is):
//   1. LUKA takes a gift at santa_pick ("Take a gift"; santa_table.take, the gift_parcel prop in his hand). He can't
//      read the tag: it's AR (an AR 'tag' label on the parcel, visible in Chip View only).
//   2. CHASE (2040) holds CHIP within 4.5 m of Santa: 1 s of Chip View reads the tag (the Signal meter fills meanwhile:
//      full -> the Fun Monitor turns to him). Real recipients only: PRIYA, GAZ, TOM, WEN, then NADIA (the table's 15
//      decoy tags stay on the table; the AR tags show over all 20).
//   3. CHASE (2040) keeps Chip View on until the recipient is in view for 0.7 s (within 6 m of him, or on screen within
//      20 m: the zone cameras don't always face the crowd he's looking at) (the AR name badges over the crowd; decoys like
//      PRIYA S. and TOM K. included) and calls them out (a bark): "Antlers, by the tree, that's Priya." (spec); the same
//      pattern for the others (additions: by the lifts / by the crackers / front row of the choir / by the column).
//   4. CHASE (no chip) finds the right person by that description and points them out ("Point out" next to any
//      recipient or floor staffer; the wrong one shakes their head: "Not PRIYA."). A yellow marker then hangs over them.
//   5. LUKA gives it ("Give"): the recipient says the line for that delivery: "Socks. ^ Thank you, Santa." / "More
//      socks." / "These are the same socks as last year." / "Santa, are you sure you're allowed to touch me?". The fifth
//      is NADIA: Give hands straight back to the scene (no line) for the 3.1_nadia cutscene.
// Call:  ['minigame', 'secret_santa', { intro, monitor, idle, cp, chipOn, keepDrone, flag, order, callouts }]
//   intro      default true: a cut to HR at her mark 'hr' (spawned there if missing) with Santa placed 1.25 m in front of
//              her (TWO shot); the two lines; back to play beside the gift table.
//   monitor    default true: the Fun Monitor keeps patrolling and the festive actions stay live (Santa at work is
//              always festive; the other two still have to blend in). false = no drone, no strikes.
//   cp         Quiet Corner retry point (default mark 'hr_meet').
//   chipOn     default true: if Chase (2040)'s chip is forced off, it is switched back on (chip.forceOff(false)).
//   keepDrone  default false: the Fun Monitor is removed at the end (the Nadia cutscene follows).
//   order      recipient ids for deliveries 1–4 (default ['priya', 'gaz', 'tom', 'wen']); Nadia is always fifth.
//   callouts   { id: text } overrides for Chase (2040)'s call-outs.
//   flag       set on success / skip (default 's31_santa').
// Expects (spawns any that are missing at their marks): actors hr (look hr), priya (priya), gaz (staff_c), tom (staff_a),
// wen (staff_b), nadia (nadia) at gift_<id>; CHARACTERS entries for priya/gaz/tom/wen are registered here if absent.
// At the end (success, skip or autoplay) the scene is staged for 3.1_nadia: Luka at give_nadia holding the parcel
// (world.prop('gift_parcel'), via actor.hold), facing Nadia at gift_nadia; Chase (2040) at s31_c40_nadia, Chase at
// s31_chase_nadia; every delivered gift gone from the table.
// Result: { done: true, delivered: 5, nadia: true, wrong, strikes, corners }  (skip adds skipped: true).
// Events: santa:take (id), santa:read (id), santa:spot (id), santa:point ({ id, ok }), santa:give ({ id, n }).
// Autoplay: real code paths with the Monitor kept quiet: each round Luka takes, Chase (2040) peeks (chip.peek) beside
// Santa and then in sight of the recipient, Chase points (round one points at Nadia first: the wrong-person beat),
// Luka gives; the fifth hands over to the scene.
//
// Helpers: MINIGAMES.blend_in.stopMonitor() removes the Fun Monitor. Sounds used (03-audio): drone_q, drone_ok,
// drone_red, ss_chirp, cracker, cloth_swish, pop, clunk, ding; loop hum_voice.
// No allocation in update()/draw(): every string, colour and vector is built at load, at start or on an event.
(() => {
  const PI = Math.PI, TAU = PI * 2, H = PI / 2;
  const PARTY = ['luka', 'chase', 'chase40'];
  const STRIKES = 2, READ_T = 1.0, SPOT_T = 0.7, SPOT_R = 6, MERRY_CD = 15, ASK_CD = 3, IMMUNE = 10;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const skipping = () => typeof flow !== 'undefined' && flow.skipping === true;
  const fn = (o, k) => !!o && typeof o[k] === 'function';
  const snd = (n, vol = 1, rate = 1) => { if (!skipping() && typeof sfx === 'function') { try { sfx(n, { vol, rate }); } catch (e) { /* audio optional */ } } };
  const log = (m) => { if (typeof testLog === 'function') testLog(m); };

  // ---------------------------------------------------------- the script's lines (spec §8 3.1, §9.11; word for word)
  const LINE = {
    fun: 'Are you having fun?',
    merry: 'Merry Christmas!',
    hr: "Oh thank god. ^ You're late. Gifts are on the table. Names are on the tags.",
    hoho: '…Ho ho.',
    thanks: ['Socks. ^ Thank you, Santa.', 'More socks.', 'These are the same socks as last year.', "Santa, are you sure you're allowed to touch me?"],
  };
  // the recipients (hq_atrium §5, §12.5: gift index = the parcel whose AR tag carries the name)
  const RCP = {
    priya: { id: 'priya', name: 'PRIYA', look: 'priya', gift: 2, call: "Antlers, by the tree, that's Priya." },
    gaz: { id: 'gaz', name: 'GAZ', look: 'staff_c', gift: 15, call: "Antlers, by the lifts, that's Gaz." },
    tom: { id: 'tom', name: 'TOM', look: 'staff_a', gift: 7, call: "Antlers, by the crackers, that's Tom." },
    wen: { id: 'wen', name: 'WEN', look: 'staff_b', gift: 11, call: "Antlers, front row of the choir, that's Wen." },
    nadia: { id: 'nadia', name: 'NADIA', look: 'nadia', gift: 18, call: "Antlers, by the column, that's Nadia." },
  };
  const RIDS = ['priya', 'gaz', 'tom', 'wen', 'nadia'];
  for (const k of RIDS) { const r = RCP[k]; r.notIt = 'Not ' + r.name + '.'; r.find = 'Chase (2040): Chip View, find ' + r.name + ' in the crowd'; r.point = 'Chase: point out ' + r.name; r.give = 'Santa: give it to ' + r.name; r.forTxt = 'FOR: ' + r.name; }
  // speakers for the recipients (nadia is in the config); a live actor's face is the portrait
  const VOX = { priya: { wave: 'triangle', f: 250, len: 0.04 }, gaz: { wave: 'square', f: 105, len: 0.05, filter: 1400 }, tom: { wave: 'square', f: 140, len: 0.045, filter: 1800 }, wen: { wave: 'triangle', f: 285, len: 0.035 } };
  if (typeof CHARACTERS !== 'undefined') for (const k in VOX) if (!CHARACTERS[k]) CHARACTERS[k] = { name: k.toUpperCase(), actor: k, voice: VOX[k] };

  // fallbacks for the set's marks (docs/sets/hq_atrium.md §5), used only if a mark is missing
  const MK = {
    s31_cp: [0, 0, -17.5, PI], hr: [1.5, 0, -32.8, 1.0], hr_meet: [0.4, 0, -26.0, PI], santa_pick: [4.0, 0, -32.5, PI],
    gift_priya: [-1.2, 0, -29.4, 0.5], gift_tom: [-10.9, 0, -20.6, H], gift_wen: [-12.5, 0, -27.0, H], gift_gaz: [11.6, 0, -22.6, -H], gift_nadia: [7.6, 0, -30.4, -2.3],
    give_priya: [-0.8, 0, -28.6, -2.64], give_tom: [-10.0, 0, -20.6, -H], give_wen: [-11.6, 0, -27.0, -H], give_gaz: [10.7, 0, -22.6, H], give_nadia: [6.9, 0, -31.0, 0.84],
    s31_c40_nadia: [5.2, 0, -28.8, -2.2], s31_chase_nadia: [5.8, 0, -27.6, -2.5],
    bi_cracker: [-11.0, 0, -19.8, -H], bi_hum: [-11.4, 0, -29.4, -H], bi_pie: [11.8, 0, -15.0, PI], fun_home: [0, 2.6, -26.0, PI],
  };
  // the strike notes (the Safe Room variant of 13.7 is the set's Quiet Corner)
  const NOTE = { strike: 'Strike one · two = the Quiet Corner', loud: 'Over 40 dB · strike one', two: 'It takes two: bring someone' };
  const LOOP0 = [[-10.6, -16.5], [-10.6, -27.5], [-1.0, -29.5], [10.6, -27.5], [10.6, -16.5], [0.0, -17.5]];
  const CROWD0 = [[-3.0, -21.0], [3.2, -19.0], [8.2, -37.0], [5.0, -24.5], [-6.6, -26.0], [1.6, -25.4], [6.8, -21.8], [-3.4, -16.6], [11.0, -34.4], [-10.4, -35.8], [1.8, -38.6], [-7.4, -21.8]];
  const mark = (n) => (typeof world !== 'undefined' && world.mark(n)) || MK[n] || null;
  // What blocks the beam (hq_atrium's colliders have no height, so a low table would hide a whole station): while a
  // game runs the cones ignore the set's colliders (DRONES.walls = false) and use these tall things as cover instead:
  // the walls, the tree, the four foam columns, the choir on its risers, the Quiet Corner partitions, the floor staff.
  const COVER = [[-18.0, -11.4, -2.0, -11.0], [2.0, -11.4, 18.0, -11.0], [-18.0, -41.0, -17.6, -11.0], [17.6, -41.0, 18.0, -11.0], [-18.0, -41.0, 18.0, -40.6],
    [-8.6, -35.6, -1.4, -32.4], [-6.6, -37.6, -3.4, -30.4], [-9.7, -19.7, -8.3, -18.3], [8.3, -19.7, 9.7, -18.3], [-9.7, -31.7, -8.3, -30.3], [8.3, -31.7, 9.7, -30.3],
    [-17.6, -31.0, -12.0, -25.0], [-17.6, -16.5, -13.2, -16.3], [-13.3, -16.5, -13.1, -13.6]];
  const COVER_ID = COVER.map((b, i) => 'bi_cover_' + i), STAFF_ID = [], STAFF_BOX = [];
  for (let i = 0; i < 12; i++) { STAFF_ID.push('bi_staff_' + i); STAFF_BOX.push([0, 0, 0, 0]); }
  const PARK = [[13.2, 0, -37.2, PI], [14.6, 0, -35.8, PI]];   // autoplay: out of the Monitor's reach (NE corner)

  // ---------------------------------------------------------- the festive stations
  const ST = [
    { kind: 'cracker', verb: 'Pull cracker', mk: 'bi_cracker', r: 1.25, pin: [-12.0, 1.25, -20.3], x: 0, z: 0 },
    { kind: 'hum', verb: 'Hum', mk: 'bi_hum', r: 1.45, pin: [-12.4, 2.05, -29.2], x: 0, z: 0 },
    { kind: 'pie', verb: 'Mince pie', mk: 'bi_pie', r: 1.25, pin: [12.3, 1.15, -15.9], x: 0, z: 0 },
  ];
  const STASH_BLEND = /^h31_(cracker|hum|pie|merry_)/, STASH_SANTA = /^h31_(cracker|hum|pie|merry_|gifts|tags|point_|give_)/;

  // ---------------------------------------------------------- state (module level, reused run to run)
  const CH = PARTY.map((id, i) => ({ id, i, a: null, here: false, fest: 0, fk: '', fx: 0, fz: 0, idle: 0, out: 0, beam: false, logged: false, immune: 0, held: false, logT: 0, port: null }));
  const chOf = (id) => { const i = PARTY.indexOf(id); return i >= 0 ? CH[i] : null; };
  const G = {
    api: null, p: null, mode: '', done: true, tok: 0, t: 0, beat: 0, own: false, roam0: false, swap0: false, busy0: false, prev: '',
    strikes: 0, strikesTot: 0, corners: 0, asks: 0, yes: 0, acts: 0, logs: 0, need: 3, idleMax: 3, winT: -1, until: null,
    note: '', noteT: 0, noteRed: false, flash: 0, cornerOn: false, intro: false, stash: [], gog: [], gogI: 0, cr: 0, pie: 0, cp: 's31_cp',
    walls0: true, covered: false, merryCd: new Float32Array(17), lookT: new Float32Array(12), crowd: new Float32Array(24), nCrowd: 0, waits: [], autoHold: false, quietAll: false,
    fol0: undefined, P: null, setOk: false,
  };
  const FM = { id: 'fun_monitor', on: false, d: null, raw: false, n: 0, P: new Float32Array(64), C: new Float32Array(33), tot: 1, s: 0, leg: -1, pauseT: 0, speed: 1.1,
    sweep: 0.6, asking: null, hold: 0, lightT: 0, ask: 0, pts: null };
  const HUM = { on: false, ch: null, db: 26, show: 26, t: 0, quiet: 0, red: 0, loop: null, rise: 3.6 };
  const SS = { k: 0, order: ['priya', 'gaz', 'tom', 'wen', 'nadia'], cur: null, phase: '', readT: 0, spotT: 0, wrong: 0, hint: '', hintKey: -1, given: null, monitor: true, calls: null };
  const PR = { on: false, kind: '', verb: '', key: 'YES', x: 0, y: 0, z: 0, t: -1, ok: true, passive: false };
  const LY = { w: 0, h: 0, px: 0, py: 0, pw: 0, ph: 0, narrow: false, touch: false, dx: 0, dy: 0, mode: '' };
  const V1 = new THREE.Vector3(), V2 = new THREE.Vector3(), PT = [0, 0, 0];
  let U = {};   // the set's prop APIs (crowd_staff, cracker_table, tea_table, santa_table, choir_meter), cached at start

  // ---------------------------------------------------------- small helpers
  const A = (id) => world.actor(id);
  const here = (a) => !!a && a.root.visible && a.root.parent === world.scene;
  const dist = (a, x, z) => Math.hypot(a.pos.x - x, a.pos.z - z);
  const distA = (a, b) => Math.hypot(a.pos.x - b.pos.x, a.pos.z - b.pos.z);
  const stale = (t) => t !== G.tok || G.done;
  const isFest = (c) => c.fest > 0 || (G.mode === 'santa' && c.id === 'luka');
  function headScreen(a, oy = 0.28) {   // -> PT [x, y, visible] (shared)
    a.headPos(V1); V1.y += oy;
    const p = cam.project(V1); PT[0] = p.x; PT[1] = p.y; PT[2] = p.visible ? 1 : 0; return PT;
  }
  function pointScreen(x, y, z) { V1.set(x, y, z); const p = cam.project(V1); PT[0] = p.x; PT[1] = p.y; PT[2] = p.visible ? 1 : 0; return PT; }
  const onScreen = (a) => !!a && headScreen(a, 0)[2] === 1;
  function note(text, red) { G.note = text; G.noteT = 2.2; G.noteRed = !!red; }
  function placeNear(id, x, z, ry) { const a = A(id); if (a) a.place([x, 0, z, ry]); }
  function put(id, where) { const a = A(id); if (a && where) a.place(where); }

  // "beats": short scripted moments (an action, the question, a delivery). Movement, the flow's SWAP / hotspots and
  // Chip View pause (flow.busy) while one runs; the Monitor keeps flying.
  async function beat(f) {
    const t = G.tok;
    G.beat++;
    if (!flow.busy) { flow.busy = true; G.own = true; }
    player.enabled = false;
    try { await f(); } catch (e) { console.error('TWO: blend_in beat', e); }
    if (stale(t)) return;
    G.beat--;
    if (!G.beat) { if (G.own) { flow.busy = false; G.own = false; } player.enabled = !HUM.on; }
  }

  // ---------------------------------------------------------- the Fun Monitor
  function fmPath(pts) {
    const P = FM.P;
    FM.n = Math.min(32, pts.length); FM.pts = pts;
    for (let i = 0; i < FM.n; i++) { const q = pts[i]; P[i * 2] = q[0]; P[i * 2 + 1] = q.length > 2 ? q[2] : q[1]; }
    let s = 0;
    for (let i = 0; i < FM.n; i++) { FM.C[i] = s; const j = (i + 1) % FM.n; s += Math.hypot(P[j * 2] - P[i * 2], P[j * 2 + 1] - P[i * 2 + 1]); }
    FM.C[FM.n] = s; FM.tot = Math.max(0.1, s);
  }
  function legAt(s) { let i = 0; while (i < FM.n - 1 && s >= FM.C[i + 1]) i++; return i; }
  function fmAt(s, out) {   // -> out [x, z, yaw]
    s = ((s % FM.tot) + FM.tot) % FM.tot;
    const i = legAt(s), j = (i + 1) % FM.n, P = FM.P, L = FM.C[i + 1] - FM.C[i] || 1, u = (s - FM.C[i]) / L;
    const ax = P[i * 2], az = P[i * 2 + 1], bx = P[j * 2], bz = P[j * 2 + 1];
    out[0] = ax + (bx - ax) * u; out[1] = az + (bz - az) * u; out[2] = Math.atan2(bx - ax, bz - az);
    return out;
  }
  function nearestS(x, z) {
    let best = 0, bd = 1e9;
    for (let i = 0; i < FM.n; i++) {
      const j = (i + 1) % FM.n, P = FM.P, ax = P[i * 2], az = P[i * 2 + 1], dx = P[j * 2] - ax, dz = P[j * 2 + 1] - az, L2 = dx * dx + dz * dz || 1;
      const u = clamp(((x - ax) * dx + (z - az) * dz) / L2, 0, 1), px = ax + dx * u, pz = az + dz * u, d = Math.hypot(x - px, z - pz);
      if (d < bd) { bd = d; best = FM.C[i] + u * Math.sqrt(L2); }
    }
    return best;
  }
  const OUT3 = [0, 0, 0];
  function fmSpawn(atS) {
    if (typeof DRONES === 'undefined' || !world.scene) return;
    FM.s = ((atS % FM.tot) + FM.tot) % FM.tot; FM.leg = legAt(FM.s); FM.pauseT = 0;
    fmAt(FM.s, OUT3);
    const cone = { len: 5.0, half: 0.42 };
    let d = DRONES.spawn(FM.id, { kind: 'fun', at: [OUT3[0], 0, OUT3[1]], face: OUT3[2], hover: 2.6, cone, sweep: (FM.sweep * 180) / PI, sweepPeriod: 2.5, ai: false, showPath: false });
    FM.raw = !!d && typeof d.hx === 'number' && typeof d.hyaw === 'number' && typeof d.sweep === 'number' && d.pn === 0;
    if (d && !FM.raw) d = DRONES.spawn(FM.id, { kind: 'fun', path: FM.pts, loop: true, speed: FM.speed, pause: 0.5, hover: 2.6, cone, ai: false, showPath: false });
    FM.d = d; FM.on = !!d; FM.asking = null; FM.hold = 0; FM.lightT = 0;
    if (typeof AR !== 'undefined') AR.add({ id: 'path:' + FM.id, kind: 'path', points: FM.pts, loop: true });
  }
  function fmJump(s) {   // teleport along the loop (retry, autoplay)
    FM.s = ((s % FM.tot) + FM.tot) % FM.tot; FM.leg = legAt(FM.s); FM.pauseT = 0;
    const d = FM.on ? DRONES.get(FM.id) : null;
    if (!d || !FM.raw) return;
    fmAt(FM.s, OUT3);
    d.x = d.px = d.hx = OUT3[0]; d.z = d.pz = d.hz = OUT3[1]; d.yaw = d.pyaw = d.hyaw = OUT3[2];
  }
  function fmLight(st, dur = 0) { if (FM.on) DRONES.light(FM.id, st); FM.lightT = dur; }
  function fmTick(dt) {
    const d = FM.on ? DRONES.get(FM.id) : null;
    FM.d = d;
    if (!d) { FM.on = false; return; }
    if (FM.ask > 0) FM.ask -= dt;
    if (FM.lightT > 0 && (FM.lightT -= dt) <= 0) DRONES.light(FM.id, FM.asking ? 'curious' : 'patrol');
    if (!FM.raw) return;
    if (FM.asking) {
      const a = FM.asking.a;
      d.hx = d.x; d.hz = d.z; d.sweep = 0;
      if (a) d.hyaw = Math.atan2(a.pos.x - d.x, a.pos.z - d.z);
      return;
    }
    d.sweep = FM.sweep;
    if (FM.hold > 0) { FM.hold -= dt; d.hx = d.x; d.hz = d.z; return; }
    if (FM.pauseT > 0) { FM.pauseT -= dt; return; }   // turning to the next leg at a corner
    FM.s += FM.speed * dt;
    if (FM.s >= FM.tot) FM.s -= FM.tot;
    const leg = legAt(FM.s);
    if (leg !== FM.leg) { FM.leg = leg; FM.s = FM.C[leg]; FM.pauseT = 0.5; }
    fmAt(FM.s, OUT3);
    d.hx = OUT3[0]; d.hz = OUT3[1]; d.hyaw = OUT3[2];
  }
  // between games the Monitor patrols on its own (33-systems' path patrol, from where it is; no sweep, no questions)
  function fmHandOff() {
    const d = FM.on ? DRONES.get(FM.id) : null;
    if (!d || !FM.raw) return;
    const pts = [[d.x, d.z]];
    for (let k = 1; k <= FM.n; k++) { const j = (FM.leg + k) % FM.n; pts.push([FM.P[j * 2], FM.P[j * 2 + 1]]); }
    DRONES.spawn(FM.id, { kind: 'fun', path: pts, loop: true, speed: FM.speed, pause: 0.5, hover: 2.6, cone: { len: 5.0, half: 0.42 }, ai: false, showPath: false });
    FM.raw = false;
  }
  function fmStop() { if (FM.on && typeof DRONES !== 'undefined') { DRONES.remove(FM.id); if (typeof AR !== 'undefined') AR.remove('path:' + FM.id); } FM.on = false; FM.d = null; FM.asking = null; }

  // ---------------------------------------------------------- party bookkeeping
  function holdSpot(c, on) {   // a non-active character busy being festive keeps his spot (or follows again)
    if (on) { if (!c.held && c.a && player.followers.indexOf(c.a) >= 0) { player.wait(c.id, true); c.held = true; } }
    else if (c.held) { c.held = false; if (state.active !== c.id) player.wait(c.id, false); }
  }
  function setFest(c, kind, dur) {
    if (!c || !c.a) return;
    c.fest = Math.max(c.fest, dur); c.fk = kind; c.fx = c.a.pos.x; c.fz = c.a.pos.z; c.idle = 0;
    if (state.active !== c.id) holdSpot(c, true);
  }
  function festEnd(c) {
    c.fest = 0; c.fk = '';
    holdSpot(c, false);
    const a = c.a;
    if (a && (a.anim === 'eat' || a.anim === 'wave' || a.anim === 'point')) a.play('idle');
  }
  function onSwap(prev, cur) {
    const p = chOf(prev), c = chOf(cur);
    if (HUM.on && HUM.ch === p) humStop();
    if (p && p.fest > 0 && p.fk !== 'hum') holdSpot(p, true);
    if (c) c.held = false;   // (player.control cleared his wait)
  }
  function goggles(a, on, up) {
    if (!a || !fn(a.rig, 'show')) return;
    a.rig.show(up ? 'goggles_up' : 'goggles', on);
    if (on && G.gog.indexOf(a.id) < 0) G.gog.push(a.id);
  }

  // ---------------------------------------------------------- the question, strikes, the Quiet Corner
  function startAsk(c) {
    FM.asking = c; c.idle = 0; G.asks++;
    log('blend_in ask ' + c.id); emit('blend_in:ask', c.id);
    beat(async () => {
      const t = G.tok;
      if (HUM.on) humStop();
      fmLight('curious'); snd('drone_q', 0.8);
      if (!FM.raw) DRONES.face(FM.id, c.id);
      let cut = false;
      if (!onScreen(c.a)) { cam.shot({ shot: 'MID', on: c.id }); cut = true; }
      await wait(0.45);
      if (stale(t)) return;
      const k = await popup({ style: 'safesense', title: 'Fun Monitor', msg: LINE.fun, buttons: ['YES', 'NO'], at: { actor: c.id }, w: 300 }).done;
      if (stale(t)) return;
      if (k === 0) {
        G.yes++; c.immune = IMMUNE; fmLight('green', 0.9); snd('drone_ok', 0.7);
        if (c.a) c.a.play('nod');
        log('blend_in fun yes ' + c.id);
        await wait(0.5);
      } else {
        log('blend_in fun no ' + c.id);
        c.immune = 4;
        const p = strike(c, 'no');
        if (p) await p;
      }
      if (stale(t)) return;
      FM.asking = null; FM.ask = ASK_CD;
      if (!FM.raw && FM.on) DRONES.release(FM.id);
      if (FM.lightT <= 0) fmLight('patrol');
      if (cut && cam.cutscene) cam.release(0.5);
    });
  }
  function strike(c, why) {
    G.strikes++; G.strikesTot++; G.flash = 1;
    fmLight('escort', 1.1); snd('drone_red', 0.8);
    log('blend_in strike ' + G.strikes + ' ' + why);
    emit('blend_in:strike', { who: c.id, n: G.strikes, why });
    if (G.strikes >= STRIKES) return corner(c);
    note(why === 'loud' ? NOTE.loud : NOTE.strike, true);
    return null;
  }
  function corner(c) {
    return beat(async () => {
      const t = G.tok;
      G.corners++; G.cornerOn = true; FM.hold = 1e9; FM.asking = null;
      if (HUM.on) humStop();
      log('blend_in quiet corner ' + c.id); emit('blend_in:corner', c.id);
      G.api.fail();   // the host offers "Skip this?" after two
      if (typeof safeRoom === 'function') await safeRoom({ variant: 'quiet', who: c.id, onRetry: retry });
      else retry();
      if (stale(t)) return;
      G.cornerOn = false; FM.hold = 0;
      if (cam.cutscene) cam.release(0);
    });
  }
  function retry() {
    G.strikes = 0; G.flash = 0; G.note = ''; G.noteT = 0;
    const m = mark(G.cp) || MK.s31_cp, act = state.active;
    let side = -1;
    for (let i = 0; i < CH.length; i++) {
      const c = CH[i];
      c.idle = 0; c.immune = 3; if (c.fest > 0) festEnd(c); c.held = false;
      if (!c.a || !here(c.a)) continue;
      if (c.id === act) c.a.place(m);
      else { c.a.place([m[0] + side * 1.0, 0, m[2] + 0.3, m[3] || 0]); side = -side; }
    }
    fmJump(0); FM.hold = 0; FM.asking = null; FM.ask = ASK_CD;
    if (FM.on) DRONES.light(FM.id, 'patrol');
    cam.override(null);
    log('blend_in retry');
  }

  // ---------------------------------------------------------- the beam
  function beamTick(dt) {
    if (!FM.on) { for (let i = 0; i < CH.length; i++) CH[i].beam = false; return; }
    let ask = null;
    for (let i = 0; i < CH.length; i++) {
      const c = CH[i];
      if (!c.here) { c.beam = false; c.idle = 0; continue; }
      const inb = DRONES.inCone(FM.id, c.a);
      c.beam = inb;
      if (!inb) { c.out += dt; if (c.idle > 0 && c.out > 0.8) c.idle = Math.max(0, c.idle - dt * 1.5); continue; }   // (the sweep comes back: a short gap doesn't count)
      c.out = 0;
      if (isFest(c)) {
        c.idle = 0;
        if (!c.logged && !(G.mode === 'santa' && c.id === 'luka')) logIt(c);
        continue;
      }
      if (c.immune > 0 || G.quietAll) { c.idle = 0; continue; }
      c.idle += dt;
      if (c.idle >= G.idleMax && !ask && FM.ask <= 0) ask = c;
    }
    if (ask) startAsk(ask);
  }
  function logIt(c) {
    c.logged = true; c.logT = 1.8; G.logs++;
    snd('drone_ok', 0.55); fmLight('green', 0.7);
    log('blend_in logged ' + c.id); emit('blend_in:logged', c.id);
  }

  // ---------------------------------------------------------- festive actions
  function partnerFor(c) {
    const m = ST[0];
    let best = null, bd = 3.2;
    for (let i = 0; i < CH.length; i++) {
      const o = CH[i];
      if (o === c || !o.here) continue;
      const d = dist(o.a, m.x, m.z);
      if (d < bd) { bd = d; best = o.id; }
    }
    if (!best) { const t = A('tom'); if (here(t) && dist(t, m.x, m.z) < 3.5) best = 'tom'; }
    return best;
  }
  function actCracker(c, pid) {
    return beat(async () => {
      const t = G.tok, a = c.a, p = A(pid), pc = chOf(pid), m = ST[0];
      if (!a || !p) return;
      if (pc) holdSpot(pc, true);
      const mv = Promise.all([a.moveTo([m.x, 0, m.z], { collide: true }), p.moveTo([m.x + 0.05, 0, m.z + 0.8], { collide: true })]);
      await Promise.race([mv, wait(2.6)]);
      if (stale(t)) return;
      a.face(pid); p.face(c.id);
      cam.shot({ shot: 'TWO', on: [c.id, pid] });           // (the atrium's zone camera has a foam column in front of the table)
      await wait(0.3);
      if (stale(t)) return;
      goggles(a, true); goggles(p, true);                     // goggles first, both of them
      if (fn(U.cracker, 'goggles')) U.cracker.goggles(G.gogI++ % 12, false);
      snd('cloth_swish', 0.7);
      await wait(0.6);
      if (stale(t)) return;
      a.play('pull_cracker', { z: 0.4 }); p.play('pull_cracker', { z: 0.4 });
      await wait(0.98);
      if (stale(t)) return;
      if (fn(U.cracker, 'pull')) U.cracker.pull(G.cr++ % 24);
      world.puff('cracker_table', { n: 10, color: 0xd8323a, speed: 0.8 });
      snd('cracker', 1);
      setFest(c, 'cracker', 8); if (pc) setFest(pc, 'cracker', 8);
      G.acts++; log('blend_in cracker ' + c.id + ' ' + pid);
      await wait(0.7);
      if (stale(t)) return;
      goggles(a, true, true); goggles(p, true, true);         // pushed up for the rest of the party
      await wait(0.5);
      if (stale(t)) return;
      if (cam.cutscene) cam.release(0.6);
    });
  }
  function actPie(c) {
    return beat(async () => {
      const t = G.tok, a = c.a, s = ST[2];
      a.face([s.pin[0], 0, s.pin[2]]);
      await wait(0.25);
      if (stale(t)) return;
      snd('cloth_swish', 0.5); snd('pop', 0.5, 0.7);
      if (fn(U.tea, 'pie')) U.tea.pie(G.pie++ % 16);
      a.play('eat', { dur: 7.6 });
      setFest(c, 'pie', 7.8); G.acts++; log('blend_in pie ' + c.id);
      await wait(0.8);
    });
  }
  function actMerry(c, k) {
    return beat(async () => {
      const t = G.tok, a = c.a;
      let tx, tz, r = null;
      if (k < 12) { tx = G.crowd[k * 2]; tz = G.crowd[k * 2 + 1]; }
      else { r = A(RIDS[k - 12]); if (!r) return; tx = r.pos.x; tz = r.pos.z; }
      a.face([tx, 0, tz]);
      if (typeof bark === 'function') bark(c.id, LINE.merry, { now: true });
      a.play('wave', { dur: 1.6 });
      if (k < 12) { if (fn(U.crowd, 'look')) U.crowd.look(k, [a.pos.x, a.pos.z]); if (fn(U.crowd, 'nod')) U.crowd.nod(k); G.lookT[k] = 3.5; }
      else { r.face(c.id); r.play('nod'); }
      G.merryCd[k] = MERRY_CD; setFest(c, 'merry', 4.5); G.acts++;
      log('blend_in merry ' + c.id);
      await wait(0.9);
      if (stale(t)) return;
    });
  }

  // ---------------------------------------------------------- Hum (hold YES; the needle stays under 40 dB)
  const HUM_RATE = { luka: 0.9, chase: 1.12, chase40: 0.95 };
  function humStart(c) {
    HUM.on = true; HUM.ch = c; HUM.db = 27; HUM.show = 27; HUM.t = 0; HUM.quiet = 0;
    player.enabled = false;
    const s = ST[1];
    c.a.face([s.pin[0], 0, s.pin[2]]); c.a.play('hum');
    if (typeof AUDIO !== 'undefined' && AUDIO && fn(AUDIO, 'loop') && !skipping()) HUM.loop = AUDIO.loop('hum_voice', { vol: 0, fade: 0.2, rate: HUM_RATE[c.id] || 1 });
    log('blend_in hum ' + c.id);
  }
  function humStop() {
    if (!HUM.on) return;
    HUM.on = false;
    if (HUM.loop) { HUM.loop.stop(0.25); HUM.loop = null; }
    if (HUM.red <= 0 && fn(U.meter, 'level')) U.meter.level(null);
    const c = HUM.ch; HUM.ch = null;
    if (c && c.a && c.a.anim === 'hum') c.a.play('idle');
    if (typeof input !== 'undefined' && fn(input, 'unlatch')) input.unlatch('yes');
    if (!G.beat && !G.done) player.enabled = true;
  }
  function humTick(dt) {
    if (!HUM.on) return;
    const c = HUM.ch;
    if (!c || state.active !== c.id || !c.here) { humStop(); return; }
    const press = options.holdToPress === true && !G.autoHold;
    if (press && input.pressed('yes')) { input.consume('yes'); humStop(); return; }   // the second press stops
    const hold = G.autoHold || input.holding('yes');
    HUM.t += dt;
    if (hold) HUM.db += HUM.rise * dt; else HUM.db -= 9 * dt;
    if (press) HUM.db = Math.min(HUM.db, 37.2);
    const wob = (0.85 * Math.sin(HUM.t * 7.3) + 0.45 * Math.sin(HUM.t * 3.1 + 1)) * (press ? 0.45 : hold ? 1 : 0.4);
    HUM.show = HUM.db + wob;
    if (fn(U.meter, 'level')) U.meter.level(HUM.show);
    if (HUM.loop) HUM.loop.vol(clamp((HUM.show - 24) / 18, 0, 1) * 0.85);
    if (HUM.show > 40) {   // SafeSense heard that
      humStop(); HUM.red = 1.2;
      if (fn(U.meter, 'level')) U.meter.level(41.5);
      snd('ss_chirp', 0.9);
      strike(c, 'loud');
      return;
    }
    if (HUM.show >= 30) { c.fest = Math.max(c.fest, 0.8); c.fk = 'hum'; c.fx = c.a.pos.x; c.fz = c.a.pos.z; }
    if (!hold) { HUM.quiet += dt; if ((HUM.db < 25 && HUM.quiet > 0.4) || Math.abs(input.move.x) + Math.abs(input.move.y) > 0.3) humStop(); } else HUM.quiet = 0;
  }

  // ---------------------------------------------------------- context prompts (next to the props)
  function setPR(kind, verb, key, x, y, z, t, ok) { PR.on = true; PR.kind = kind; PR.verb = verb; PR.key = key; PR.x = x; PR.y = y; PR.z = z; PR.t = t; PR.ok = ok; PR.passive = false; }
  function festivePrompt(c) {
    const a = c.a;
    let best = null, bd = 1e9;
    for (let i = 0; i < ST.length; i++) { const s = ST[i], d = dist(a, s.x, s.z); if (d <= s.r && d < bd) { bd = d; best = s; } }
    if (best) {
      const key = best.kind === 'hum' ? (options.holdToPress ? 'YES' : 'HOLD') : 'YES';
      setPR(best.kind, best.verb, key, best.pin[0], best.pin[1], best.pin[2], -1, best.kind !== 'cracker' || !!partnerFor(c));
      return;
    }
    // "Merry Christmas!" to a staffer (crowd_staff 0–11) or a recipient within 1.5 m
    let k = -1; bd = 1.5;
    for (let i = 0; i < G.nCrowd; i++) { if (G.merryCd[i] > 0) continue; const d = dist(a, G.crowd[i * 2], G.crowd[i * 2 + 1]); if (d < bd) { bd = d; k = i; } }
    for (let i = 0; i < RIDS.length; i++) {
      if (G.merryCd[12 + i] > 0) continue;
      const r = A(RIDS[i]);
      if (!r || !here(r)) continue;
      const d = distA(a, r); if (d < bd) { bd = d; k = 12 + i; }
    }
    if (k < 0) return;
    if (k < 12) setPR('merry', '"Merry Christmas!"', 'YES', G.crowd[k * 2], 2.05, G.crowd[k * 2 + 1], k, true);
    else { const r = A(RIDS[k - 12]); setPR('merry', '"Merry Christmas!"', 'YES', r.pos.x, 2.05, r.pos.z, k, true); }
  }
  function promptTick() {
    PR.on = false;
    const c = chOf(state.active);
    if (!c || !c.here || HUM.on || !player.enabled) return;
    if (G.mode === 'santa') santaPrompt(c);
    if (!PR.on && (G.mode === 'blend' || (SS.monitor && c.id !== 'luka'))) festivePrompt(c);   // (Santa at work is always festive)
    if (!PR.on || PR.passive || !input.pressed('yes')) return;
    input.consume('yes');
    if (!PR.ok) { snd('clunk', 0.7); note(NOTE.two, false); return; }
    switch (PR.kind) {
      case 'hum': humStart(c); break;
      case 'pie': actPie(c); break;
      case 'merry': actMerry(c, PR.t); break;
      case 'cracker': actCracker(c, partnerFor(c)); break;
      case 'take': santaTake(); break;
      case 'point': santaPoint(PR.t); break;
      case 'give': santaGive(); break;
    }
  }

  // ---------------------------------------------------------- Secret Santa
  function parcel() { return world.prop('gift_parcel') || null; }
  function parcelTo(id) {   // the one loose parcel: into someone's hand (id) or away (null)
    const p = parcel();
    if (!p) return;
    const holder = SS.given;
    if (holder) { const h = A(holder); if (h && h.held === p) h.hold(null); }
    const lk = A('luka');
    if (lk && lk.held === p && id !== 'luka') lk.hold(null);
    SS.given = null;
    if (!id) { p.visible = false; return; }
    const a = A(id);
    if (!a) { p.visible = false; return; }
    if (a.held !== p) a.hold(p);
    p.visible = true;
    if (id !== 'luka') SS.given = id;
  }
  function santaNext() {
    SS.cur = SS.k < 5 ? RCP[SS.order[SS.k]] : null;
    SS.phase = SS.cur ? 'take' : 'done'; SS.readT = 0; SS.spotT = 0; SS.hintKey = -1;
  }
  function santaTake() {
    return beat(async () => {
      const t = G.tok, lk = A('luka'), r = SS.cur;
      if (!lk || !r) return;
      lk.face([3.5, 0, -33.6]);
      lk.play('give');
      await wait(0.45);
      if (stale(t)) return;
      if (fn(U.santa, 'take')) U.santa.take(r.gift);
      if (typeof AR !== 'undefined') {
        AR.remove('ar_tag_' + r.gift);   // (the parcel left the table)
        AR.add({ id: 'ss_tag', kind: 'tag', prop: 'gift_parcel', oy: 0.16, text: r.name, w: 0.42 });
      }
      parcelTo('luka'); snd('cloth_swish', 0.6);
      SS.phase = 'read'; SS.readT = 0; SS.hintKey = -1;
      log('santa take ' + r.id); emit('santa:take', r.id);
      await wait(0.5);
    });
  }
  function santaRead() {
    const r = SS.cur;
    SS.phase = 'spot'; SS.spotT = 0; SS.hintKey = -1;
    snd('ss_chirp', 0.6);
    log('santa read ' + r.id); emit('santa:read', r.id);
  }
  function santaSpot() {
    const r = SS.cur;
    SS.phase = 'point'; SS.hintKey = -1;
    const text = (SS.calls && SS.calls[r.id]) || r.call;
    if (typeof bark === 'function') bark('chase40', text, { now: true });
    log('santa spot ' + r.id); emit('santa:spot', r.id);
  }
  function santaPoint(k) {   // k: a recipient index 0..4 (RIDS) + 100, or a crowd staffer 0..11
    return beat(async () => {
      const t = G.tok, ch = A('chase'), r = SS.cur;
      if (!ch || !r) return;
      const rid = k >= 100 ? RIDS[k - 100] : null, ra = rid ? A(rid) : null;
      const tx = ra ? ra.pos.x : G.crowd[k * 2], tz = ra ? ra.pos.z : G.crowd[k * 2 + 1];
      ch.face([tx, 0, tz]);
      ch.play('point', { dur: 1.3 });
      await wait(0.6);
      if (stale(t)) return;
      const ok = rid === r.id;
      if (ok) {
        ra.face('chase'); ra.play('nod'); snd('pop', 0.6);
        SS.phase = 'give'; SS.hintKey = -1;
      } else {
        SS.wrong++; snd('clunk', 0.7); note(r.notIt, true);
        if (ra) { ra.face('chase'); ra.play('shake'); }
        else if (fn(U.crowd, 'look')) { U.crowd.look(k, [ch.pos.x, ch.pos.z]); G.lookT[k] = 2.5; }
      }
      log('santa point ' + (rid || 'staff_' + k) + (ok ? ' ok' : ' wrong')); emit('santa:point', { id: rid || 'staff', ok });
      await wait(0.75);
      if (stale(t)) return;
      if (ch.anim === 'point') ch.play('idle');
    });
  }
  function santaGive() {
    const r = SS.cur;
    if (!r) return null;
    if (r.id === 'nadia') {   // the fifth: straight back to the scene for 3.1_nadia
      SS.k = 5; log('santa give nadia'); emit('santa:give', { id: 'nadia', n: 5 });
      G.api.finish({ done: true, delivered: 5, nadia: true, wrong: SS.wrong, strikes: G.strikesTot, corners: G.corners });
      return null;
    }
    return beat(async () => {
      const t = G.tok, lk = A('luka'), ra = A(r.id), n = SS.k;
      if (!lk || !ra) return;
      lk.face(r.id); ra.face('luka');
      lk.play('give');
      await wait(0.55);
      if (stale(t)) return;
      parcelTo(r.id); snd('cloth_swish', 0.6);
      if (typeof AR !== 'undefined') AR.remove('ss_tag');
      await G.api.play([{ say: r.id, text: LINE.thanks[n] }]);
      if (stale(t)) return;
      SS.k = n + 1; snd('ding', 0.35);
      log('santa give ' + r.id); emit('santa:give', { id: r.id, n: n + 1 });
      santaNext();
    });
  }
  function santaPrompt(c) {
    const r = SS.cur;
    if (!r) return;
    const a = c.a;
    if (c.id === 'luka') {
      if (SS.phase === 'take') {
        const m = mark('santa_pick');
        if (dist(a, m[0], m[2]) <= 1.45) setPR('take', 'Take a gift', 'YES', 3.5, 1.15, -33.6, -1, true);
      } else if (SS.phase === 'give') {
        const ra = A(r.id);
        if (ra && distA(a, ra) <= 1.7) setPR('give', 'Give', 'YES', ra.pos.x, 2.05, ra.pos.z, -1, true);
      }
    } else if (c.id === 'chase' && SS.phase === 'point') {
      let k = -1, bd = 1.7;
      for (let i = 0; i < RIDS.length; i++) {
        if (i < 4 && SS.order.indexOf(RIDS[i]) < SS.k && RIDS[i] !== r.id) continue;   // already has socks
        const ra = A(RIDS[i]);
        if (!ra || !here(ra)) continue;
        const d = distA(a, ra); if (d < bd) { bd = d; k = 100 + i; }
      }
      for (let i = 0; i < G.nCrowd; i++) { const d = dist(a, G.crowd[i * 2], G.crowd[i * 2 + 1]); if (d < bd) { bd = d; k = i; } }
      if (k >= 100) { const ra = A(RIDS[k - 100]); setPR('point', 'Point out', 'YES', ra.pos.x, 2.05, ra.pos.z, k, true); }
      else if (k >= 0) setPR('point', 'Point out', 'YES', G.crowd[k * 2], 2.05, G.crowd[k * 2 + 1], k, true);
    } else if (c.id === 'chase40' && SS.phase === 'read' && !(typeof chip !== 'undefined' && chip.on)) {
      const lk = A('luka');
      if (lk && distA(a, lk) <= 4.5) { setPR('read', 'Read the tag', 'CHIP', lk.pos.x, 1.35, lk.pos.z, -1, true); PR.passive = true; }
    }
  }
  const HINT = {
    take: 'Santa: take a gift from the table',
    read: 'Chase (2040): hold CHIP near Santa to read the tag',
    reading: 'Reading the tag…',
  };
  function santaTick(dt) {
    const r = SS.cur;
    if (!r) return;
    const c40 = CH[2], lk = CH[0];
    const view = typeof chip !== 'undefined' && chip.on && state.active === 'chase40' && c40.here;
    if (SS.phase === 'read') {
      if (view && lk.here && distA(c40.a, lk.a) <= 4.5) { SS.readT += dt; if (SS.readT >= READ_T) santaRead(); }
      else if (SS.readT > 0) SS.readT = Math.max(0, SS.readT - dt);
    }
    if (SS.phase === 'spot') {
      const ra = A(r.id);
      // in view = close to him (the zone camera may be looking the other way) or on screen across the floor
      const d = view && ra && here(ra) ? distA(c40.a, ra) : 1e9;
      if (d <= SPOT_R || (d <= 20 && onScreen(ra))) { SS.spotT += dt; if (SS.spotT >= SPOT_T) santaSpot(); }
      else if (SS.spotT > 0) SS.spotT = Math.max(0, SS.spotT - dt * 0.5);
    }
    const key = (SS.phase === 'take' ? 1 : SS.phase === 'read' ? (SS.readT > 0 ? 3 : 2) : SS.phase === 'spot' ? 4 : SS.phase === 'point' ? 5 : 6) * 8 + SS.k;
    if (key !== SS.hintKey) {
      SS.hintKey = key;
      SS.hint = SS.phase === 'take' ? HINT.take : SS.phase === 'read' ? (SS.readT > 0 ? HINT.reading : HINT.read) : SS.phase === 'spot' ? r.find : SS.phase === 'point' ? r.point : r.give;
    }
  }
  function stageNadia() {   // the hand-off to 3.1_nadia: Luka at give_nadia with the parcel, facing her
    const r = RCP.nadia, lk = A('luka'), na = A('nadia');
    if (fn(U.santa, 'take')) for (let i = 0; i < 5; i++) U.santa.take(RCP[SS.order[i]].gift);
    if (typeof AR !== 'undefined') { AR.remove('ss_tag'); for (let i = 0; i < 5; i++) AR.remove('ar_tag_' + RCP[SS.order[i]].gift); }
    if (na) na.place(mark('gift_nadia'));
    if (lk) { lk.place(mark('give_nadia')); if (na) lk.face('nadia', 0); }
    if (na && lk) na.face('luka', 0);
    const c40 = A('chase40'), ch = A('chase');
    if (c40) c40.place(mark('s31_c40_nadia'));
    if (ch) ch.place(mark('s31_chase_nadia'));
    parcelTo('luka');
    for (let i = 0; i < CH.length; i++) holdSpot(CH[i], false);
    if (r) SS.cur = null;
  }

  // ---------------------------------------------------------- the overlay: panel, pins, head markers, the dial
  const SYS = 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
  const F = { title: '800 12px ' + SYS, state: '700 10.5px ' + SYS, name: '800 11px ' + SYS, nameN: '800 10px ' + SYS, stat: '700 10.5px ' + SYS, statN: '700 9.5px ' + SYS,
    hint: '600 11.5px ' + SYS, hintN: '600 10.5px ' + SYS, pin: '700 14px ' + SYS, key: '800 12px ' + SYS, tag: '800 11px ' + SYS, pop: '900 13px ' + SYS, dial: '800 15px ' + SYS, dialS: '700 9px ' + SYS, note: '800 13px ' + SYS };
  const C = { glass: 'rgba(250,253,255,0.9)', rim: 'rgba(255,255,255,0.95)', ice: 'rgba(191,230,255,0.85)', glow: 'rgba(120,190,255,0.55)', ss: '#2f86e0', ink: '#1c2a44', mute: '#6d7d9c',
    yes: '#ffd21f', navy: 'rgba(20,29,58,0.86)', navyB: 'rgba(255,210,31,0.6)', green: '#2fae66', amber: '#f39a12', red: '#e8423a', pale: 'rgba(28,42,68,0.12)', white: '#ffffff', faint: 'rgba(20,29,58,0.55)' };
  const TXT = {
    fun: 'FUN MONITOR', santa: 'SECRET SANTA', strikes: 'STRIKES', patrol: 'PATROLLING', asking: 'ASKING', happy: 'SATISFIED',
    festive: 'FESTIVE', festLog: 'FESTIVE · LOGGED', festLogN: 'FESTIVE ✓', logged: 'FUN LOGGED ✓', notLogged: 'NOT SEEN YET', away: '—', asked: 'BEING ASKED', loggedPop: 'FUN LOGGED',
    hintBlend: 'Be festive when the beam is on you. Swap to cover all three.', hintNarrow: 'Be festive in the beam. Swap to cover all three.',
    tagUnread: 'TAG: AR (CHIP VIEW)', dialMax: '40 dB MAX', ss: 'SafeSense', db: 'dB', santaBadge: 'SANTA', festiveTag: 'FESTIVE',
    nm: { luka: 'LUKA', chase: 'CHASE', chase40: 'CHASE (2040)' },
  };
  const IDLE_TXT = [], IDLE_TXT_N = []; for (let i = 0; i <= 60; i++) { IDLE_TXT.push('IN THE BEAM ' + (i / 10).toFixed(1) + ' s'); IDLE_TXT_N.push('BEAM ' + (i / 10).toFixed(1) + ' s'); }
  const DB_TXT = []; for (let i = 0; i <= 70; i++) DB_TXT.push(String(i));
  const TWC = {};
  function tw(c, font, s) { let m = TWC[font]; if (!m) m = TWC[font] = new Map(); let v = m.get(s); if (v === undefined) { c.font = font; v = c.measureText(s).width; m.set(s, v); } return v; }
  function rr(c, x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, r); }
  function glass(c, x, y, w, h, r) {   // SafeSense glass: translucent white, an ice rim, a soft blue glow
    c.save(); c.shadowColor = C.glow; c.shadowBlur = 20; c.fillStyle = C.glass; rr(c, x, y, w, h, r); c.fill(); c.restore();
    c.lineWidth = 1.2; c.strokeStyle = C.rim; rr(c, x + 0.6, y + 0.6, w - 1.2, h - 1.2, r); c.stroke();
    c.lineWidth = 1; c.strokeStyle = C.ice; rr(c, x - 1, y - 1, w + 2, h + 2, r + 1); c.stroke();
  }
  function drop(c, x, y) {   // the SafeSense drop
    c.save(); c.shadowColor = '#8fd0ff'; c.shadowBlur = 6; c.fillStyle = C.ss; c.beginPath(); c.arc(x, y, 5.5, 0, TAU); c.fill(); c.restore();
    c.fillStyle = '#d8efff'; c.beginPath(); c.arc(x - 1.6, y - 1.6, 1.8, 0, TAU); c.fill();
  }
  function layout(w, h) {
    LY.w = w; LY.h = h; LY.mode = G.mode; LY.narrow = w < 600; LY.touch = input.scheme === 'touch';
    LY.pw = Math.min(480, w - 24); LY.px = Math.round((w - LY.pw) / 2);
    LY.py = w >= 1180 ? 12 : LY.narrow ? 100 : 92;
    LY.ph = G.mode === 'santa' ? 128 : 100;
    LY.dx = Math.round(w / 2); LY.dy = Math.round(h - (LY.touch ? (LY.narrow ? 380 : 300) : 150));
  }
  function slot(c, i, x, y, w, active) {
    const ch = CH[i], n = LY.narrow, ps = n ? 24 : 30;
    if (active) { c.lineWidth = 2; c.strokeStyle = C.yes; rr(c, x - 3, y - 3, w + 2, ps + 6, 7); c.stroke(); }
    if (ch.port) { c.save(); rr(c, x, y, ps, ps, 6); c.clip(); c.drawImage(ch.port, x, y, ps, ps); c.restore(); }
    else { c.fillStyle = C.pale; rr(c, x, y, ps, ps, 6); c.fill(); }
    const tx = x + ps + 6;
    c.textAlign = 'left'; c.textBaseline = 'alphabetic';
    c.font = n ? F.nameN : F.name; c.fillStyle = C.ink; c.fillText(TXT.nm[ch.id], tx, y + (n ? 10 : 12));
    let s = TXT.notLogged, col = C.mute;
    if (!ch.here) s = TXT.away;
    else if (FM.asking === ch) { s = TXT.asked; col = C.amber; }
    else if (ch.beam && !isFest(ch) && ch.idle > 0) { s = (n ? IDLE_TXT_N : IDLE_TXT)[clamp(Math.floor(ch.idle * 10), 0, 60)]; col = C.amber; }
    else if (isFest(ch)) { s = G.mode === 'santa' && ch.id === 'luka' ? TXT.santaBadge : ch.logged ? (n ? TXT.festLogN : TXT.festLog) : TXT.festive; col = C.green; }
    else if (ch.logged) { s = TXT.logged; col = C.ss; }
    c.font = n ? F.statN : F.stat; c.fillStyle = col; c.fillText(s, tx, y + (n ? 21 : 25));
    // the idle-in-beam bar
    const bw = w - ps - 10, by = y + ps - 2;
    c.fillStyle = C.pale; c.fillRect(tx, by, bw, 3);
    if (ch.beam && ch.idle > 0 && !isFest(ch)) { c.fillStyle = C.amber; c.fillRect(tx, by, bw * clamp(ch.idle / G.idleMax, 0, 1), 3); }
    else if (isFest(ch) && ch.fk !== 'santa') { c.fillStyle = C.green; c.fillRect(tx, by, bw * clamp(ch.fest / 8, 0.06, 1), 3); }
  }
  function panel(c) {
    const x = LY.px, y = LY.py, w = LY.pw, h = LY.ph, n = LY.narrow, santa = G.mode === 'santa';
    glass(c, x, y, w, h, 14);
    drop(c, x + 17, y + 16);
    c.textAlign = 'left'; c.textBaseline = 'middle';
    c.font = F.title; c.fillStyle = C.ss; c.fillText(santa ? TXT.santa : TXT.fun, x + 29, y + 16.5);
    // strikes (right)
    if (!santa || SS.monitor) {
      const sx = x + w - 16;
      for (let i = 0; i < STRIKES; i++) {
        const cx = sx - i * 15;
        c.beginPath(); c.arc(cx, y + 16, 5, 0, TAU);
        if (STRIKES - i <= G.strikes) { c.fillStyle = C.red; c.fill(); } else { c.lineWidth = 1.5; c.strokeStyle = 'rgba(232,66,58,0.55)'; c.stroke(); }
      }
      c.font = F.state; c.fillStyle = G.flash > 0 ? C.red : C.mute; c.textAlign = 'right'; c.fillText(TXT.strikes, sx - STRIKES * 15 + 4, y + 16.5);
    }
    // the Monitor's state / the gifts
    c.textAlign = 'left';
    if (santa) {
      const gx = x + 29 + tw(c, F.title, TXT.santa) + 12;
      for (let i = 0; i < 5; i++) {
        const bx = gx + i * 17, done = i < SS.k, cur = i === SS.k;
        c.fillStyle = done ? C.ss : cur ? 'rgba(47,134,224,0.18)' : C.pale; rr(c, bx, y + 10, 13, 12, 2); c.fill();
        c.fillStyle = done ? C.white : cur ? C.ss : 'rgba(28,42,68,0.25)'; c.fillRect(bx + 5.5, y + 10, 2, 12); c.fillRect(bx, y + 15, 13, 2);
      }
    } else if (!n) {
      const s = FM.asking ? TXT.asking : G.winT >= 0 ? TXT.happy : TXT.patrol;
      c.font = F.state; c.fillStyle = FM.asking ? C.amber : G.winT >= 0 ? C.green : C.mute;
      c.fillText(s, x + 29 + tw(c, F.title, TXT.fun) + 12, y + 16.5);
    }
    let ry = y + 34;
    if (santa) {   // the current gift: whose tag, whose turn
      const r = SS.cur;
      c.font = F.tag; c.fillStyle = C.ink; c.textBaseline = 'middle';
      const tag = !r ? '' : SS.phase === 'take' || SS.phase === 'read' ? TXT.tagUnread : r.forTxt;
      c.fillText(tag, x + 14, ry + 2);
      c.font = n ? F.hintN : F.hint; c.fillStyle = C.ss;
      c.fillText(SS.hint, x + 14, ry + 19);
      if (SS.phase === 'read' && SS.readT > 0) { c.fillStyle = C.pale; c.fillRect(x + 14, ry + 29, w - 28, 3); c.fillStyle = C.ss; c.fillRect(x + 14, ry + 29, (w - 28) * clamp(SS.readT / READ_T, 0, 1), 3); }
      ry += 38;
    }
    // the party
    const sw = (w - 24) / 3, act = state.active;
    for (let i = 0; i < 3; i++) slot(c, i, x + 12 + i * sw, ry, sw - 8, CH[i].id === act);
    if (!santa) {
      c.font = n ? F.hintN : F.hint; c.fillStyle = C.mute; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText(n ? TXT.hintNarrow : TXT.hintBlend, x + w / 2, y + h - 12);
    }
  }
  function pin(c, x, y, key, label, bright, ok) {   // the house prompt pill, pinned next to a prop
    const kw = tw(c, F.key, key) + 14, lw = tw(c, F.pin, label), w = kw + lw + 22, h = 28, px = Math.round(x - w / 2), py = Math.round(y - h);
    c.globalAlpha = bright ? 1 : 0.55;
    c.fillStyle = C.navy; rr(c, px, py, w, h, 14); c.fill();
    c.lineWidth = 1; c.strokeStyle = C.navyB; rr(c, px + 0.5, py + 0.5, w - 1, h - 1, 14); c.stroke();
    if (key === 'HOLD') { c.lineWidth = 2; c.strokeStyle = C.yes; rr(c, px + 5, py + 5, kw, h - 10, 9); c.stroke(); c.fillStyle = C.yes; }
    else if (key === 'CHIP') { c.fillStyle = '#8fd0ff'; rr(c, px + 4, py + 4, kw, h - 8, 10); c.fill(); c.fillStyle = '#12305a'; }
    else { c.fillStyle = ok ? C.yes : '#9aa3b8'; rr(c, px + 4, py + 4, kw, h - 8, 10); c.fill(); c.fillStyle = '#141d3a'; }
    c.font = F.key; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(key, px + 4 + kw / 2, py + h / 2 + 0.5);
    c.font = F.pin; c.fillStyle = ok ? C.white : '#b8c0d4'; c.textAlign = 'left'; c.fillText(label, px + kw + 12, py + h / 2 + 0.5);
    c.beginPath(); c.moveTo(x - 5, py + h); c.lineTo(x + 5, py + h); c.lineTo(x, py + h + 6); c.closePath(); c.fillStyle = C.navy; c.fill();
    c.globalAlpha = 1;
  }
  function pins(c) {
    const a = player.actor;
    if (a && !G.beat && !HUM.on && (G.mode === 'blend' || (SS.monitor && state.active !== 'luka'))) for (let i = 0; i < ST.length; i++) {   // dim hints for the stations nearby
      const s = ST[i];
      if (PR.on && PR.kind === s.kind) continue;
      const d = dist(a, s.x, s.z);
      if (d > 8 || d <= s.r) continue;
      const p = pointScreen(s.pin[0], s.pin[1], s.pin[2]);
      if (p[2]) pin(c, p[0], p[1], s.kind === 'hum' && !options.holdToPress ? 'HOLD' : 'YES', s.verb, false, true);
    }
    if (PR.on && !G.beat) { const p = pointScreen(PR.x, PR.y, PR.z); if (p[2]) pin(c, p[0], p[1], PR.key, PR.verb, true, PR.ok); }
  }
  function heads(c) {
    for (let i = 0; i < CH.length; i++) {
      const ch = CH[i];
      if (!ch.here || (!ch.beam && ch.logT <= 0)) continue;
      const p = headScreen(ch.a, 0.42);
      if (!p[2]) continue;
      const x = p[0], y = p[1];
      if (ch.beam && FM.asking !== ch) {
        if (isFest(ch)) {
          const lw = tw(c, F.tag, TXT.festiveTag) + 14;
          c.fillStyle = 'rgba(47,174,102,0.9)'; rr(c, x - lw / 2, y - 10, lw, 18, 9); c.fill();
          c.fillStyle = C.white; c.font = F.tag; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(TXT.festiveTag, x, y - 0.5);
        } else if (ch.idle > 0 && ch.immune <= 0) {
          const k = clamp(ch.idle / G.idleMax, 0, 1);
          c.fillStyle = 'rgba(20,29,58,0.7)'; c.beginPath(); c.arc(x, y, 12, 0, TAU); c.fill();
          c.lineWidth = 3; c.strokeStyle = C.amber; c.beginPath(); c.arc(x, y, 12, -H, -H + TAU * k); c.stroke();
          c.fillStyle = C.amber; c.font = F.pop; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('?', x, y + 0.5);
        }
      }
      if (ch.logT > 0) {
        const u = 1 - ch.logT / 1.8, yy = y - 22 - u * 26;
        c.globalAlpha = clamp(ch.logT / 0.5, 0, 1);
        c.font = F.pop; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.lineWidth = 4; c.strokeStyle = C.white; c.strokeText(TXT.loggedPop, x, yy);
        c.fillStyle = C.ss; c.fillText(TXT.loggedPop, x, yy);
        c.globalAlpha = 1;
      }
    }
  }
  function santaMarks(c) {
    const r = SS.cur;
    if (!r) return;
    if (SS.phase === 'give' && !(PR.on && PR.kind === 'give')) {   // Chase pointed them out: a marker (the Give prompt replaces it)
      const ra = A(r.id);
      if (ra && here(ra)) {
        const p = headScreen(ra, 0.5);
        if (p[2]) {
          const x = p[0], y = p[1] + Math.sin(G.t * 4) * 3;
          c.fillStyle = C.yes; c.beginPath(); c.moveTo(x - 9, y - 12); c.lineTo(x + 9, y - 12); c.lineTo(x, y); c.closePath(); c.fill();
          c.lineWidth = 1.5; c.strokeStyle = '#141d3a'; c.stroke();
          const lw = tw(c, F.tag, r.name) + 14;
          c.fillStyle = C.navy; rr(c, x - lw / 2, y - 34, lw, 18, 9); c.fill();
          c.fillStyle = C.yes; c.font = F.tag; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(r.name, x, y - 24.5);
        }
      }
    }
    if (SS.phase === 'read' && SS.readT > 0) {   // reading the tag in Chip View: a ring round the parcel
      const p = parcel();
      if (p) {
        p.getWorldPosition(V2);
        const q = pointScreen(V2.x, V2.y + 0.1, V2.z);
        if (q[2]) { c.lineWidth = 3; c.strokeStyle = '#8fd0ff'; c.beginPath(); c.arc(q[0], q[1], 18, -H, -H + TAU * clamp(SS.readT / READ_T, 0, 1)); c.stroke(); }
      }
    }
    if (SS.phase === 'spot' && SS.spotT > 0) {
      const ra = A(r.id);
      if (ra) { const q = headScreen(ra, 0.1); if (q[2]) { c.lineWidth = 3; c.strokeStyle = '#8fd0ff'; c.beginPath(); c.arc(q[0], q[1], 20, -H, -H + TAU * clamp(SS.spotT / SPOT_T, 0, 1)); c.stroke(); } }
    }
  }
  function dial(c) {   // the SafeSense volume needle: 20–60 dB, 30–40 the band, red over 40
    const show = HUM.on || HUM.red > 0 || (PR.on && PR.kind === 'hum');
    if (!show) return;
    const x = LY.dx, y = LY.dy, R = LY.narrow ? 46 : 54;
    glass(c, x - R - 18, y - R - 16, 2 * R + 36, R + 44, 16);
    const a0 = PI, ang = (db) => a0 + (clamp(db, 20, 60) - 20) / 40 * PI;
    c.lineCap = 'butt';
    c.lineWidth = 7; c.strokeStyle = 'rgba(28,42,68,0.14)'; c.beginPath(); c.arc(x, y, R - 4, a0, a0 + PI); c.stroke();
    c.strokeStyle = 'rgba(47,174,102,0.85)'; c.beginPath(); c.arc(x, y, R - 4, ang(30), ang(40)); c.stroke();
    c.strokeStyle = HUM.red > 0 ? C.red : 'rgba(232,66,58,0.75)'; c.beginPath(); c.arc(x, y, R - 4, ang(40), ang(60)); c.stroke();
    c.lineWidth = 1.5; c.strokeStyle = C.ink;
    for (let d = 20; d <= 60; d += 5) { const a = ang(d), r0 = d % 10 ? R - 12 : R - 15; c.beginPath(); c.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); c.lineTo(x + Math.cos(a) * (R - 9), y + Math.sin(a) * (R - 9)); c.stroke(); }
    const db = HUM.on ? HUM.show : HUM.red > 0 ? 41.5 : 20, na = ang(db);
    c.lineWidth = 3; c.strokeStyle = HUM.red > 0 || db > 40 ? C.red : C.ss; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(na) * (R - 10), y + Math.sin(na) * (R - 10)); c.stroke(); c.lineCap = 'butt';
    c.fillStyle = C.ink; c.beginPath(); c.arc(x, y, 4, 0, TAU); c.fill();
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = F.dial; c.fillStyle = HUM.red > 0 ? C.red : C.ink; c.fillText(DB_TXT[clamp(Math.round(db), 0, 70)], x - 9, y + 16);
    c.font = F.dialS; c.fillStyle = C.mute; c.fillText(TXT.db, x + 12, y + 17);
    c.fillStyle = C.red; c.fillText(TXT.dialMax, x, y + 30);
    c.fillStyle = C.ss; c.fillText(TXT.ss, x, y - R - 6);
  }
  function noteDraw(c) {
    if (G.noteT <= 0 || !G.note) return;
    const x = LY.w / 2, y = LY.py + LY.ph + 22, w = tw(c, F.note, G.note) + 30;
    c.globalAlpha = clamp(G.noteT / 0.4, 0, 1);
    c.fillStyle = G.noteRed ? 'rgba(232,66,58,0.92)' : C.navy; rr(c, x - w / 2, y - 14, w, 28, 14); c.fill();
    c.fillStyle = C.white; c.font = F.note; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(G.note, x, y + 0.5);
    c.globalAlpha = 1;
  }

  // ---------------------------------------------------------- shared lifecycle
  function begin(mode, p, api) {
    G.tok++; G.api = api; G.p = p; G.mode = mode; G.done = false; G.t = 0; G.beat = 0; G.own = false;
    G.strikes = 0; G.strikesTot = 0; G.corners = 0; G.asks = 0; G.yes = 0; G.acts = 0; G.logs = 0; G.winT = -1; G.note = ''; G.noteT = 0; G.flash = 0;
    G.cornerOn = false; G.intro = false; G.autoHold = false; G.quietAll = false; G.waits.length = 0; G.fol0 = undefined; G.gog.length = 0;
    G.merryCd.fill(0); G.lookT.fill(0); G.prev = state.active;
    G.idleMax = p.idle || (options.storyMode ? 4.5 : 3) + (mode === 'santa' ? 1 : 0);
    HUM.on = false; HUM.red = 0; HUM.rise = options.storyMode ? 2.4 : 3.6; PR.on = false;
    G.setOk = world.setId === 'hq_atrium';
    if (!G.setOk) console.warn('TWO: ' + (mode === 'santa' ? 'secret_santa' : 'blend_in') + ' expects the hq_atrium set (got ' + world.setId + ')');
    const set = world.set || {};
    U = {};
    for (const [k, n] of [['crowd', 'crowd_staff'], ['cracker', 'cracker_table'], ['tea', 'tea_table'], ['santa', 'santa_table'], ['meter', 'choir_meter']]) { const pr = world.prop(n); U[k] = pr ? pr.userData : null; }
    // stations and the floor staff (static)
    for (let i = 0; i < ST.length; i++) { const m = mark(ST[i].mk); ST[i].x = m[0]; ST[i].z = m[2]; }
    G.nCrowd = 12;
    for (let i = 0; i < 12; i++) {
      if (fn(U.crowd, 'pos')) { const o = [0, 0, 0]; U.crowd.pos(i, o); G.crowd[i * 2] = o[0]; G.crowd[i * 2 + 1] = o[2]; }
      else { G.crowd[i * 2] = CROWD0[i][0]; G.crowd[i * 2 + 1] = CROWD0[i][1]; }
    }
    // the beam's cover
    if (typeof DRONES !== 'undefined' && fn(DRONES, 'cover')) {
      G.walls0 = DRONES.walls; DRONES.walls = false; G.covered = true;
      for (let i = 0; i < COVER.length; i++) DRONES.cover(COVER_ID[i], COVER[i]);
      for (let i = 0; i < 12; i++) { const b = STAFF_BOX[i], x = G.crowd[i * 2], z = G.crowd[i * 2 + 1]; b[0] = x - 0.25; b[1] = z - 0.25; b[2] = x + 0.25; b[3] = z + 0.25; DRONES.cover(STAFF_ID[i], b); }
    }
    // the party
    for (let i = 0; i < CH.length; i++) {
      const c = CH[i];
      c.a = A(c.id); c.here = here(c.a); c.fest = 0; c.fk = ''; c.idle = 0; c.beam = false; c.logged = false; c.immune = 0; c.held = false; c.logT = 0;
      try { c.port = typeof portraitURL === 'function' && portraitURL.canvas ? portraitURL.canvas(c.id) : null; } catch (e) { c.port = null; }
    }
    // play: roam + systems
    G.roam0 = flow.roaming; G.swap0 = flow.swap; G.busy0 = flow.busy;
    flow.roaming = true; flow.swap = true; if (G.busy0) flow.busy = false;
    if (cam.cutscene) cam.release(0.6);
    cam.override(null);
    player.enabled = true;
    const nx = PARTY.find((id) => id !== state.active && here(A(id)));
    ui.swapIndicator(state.active, nx || null);
    // the set's festive / Secret Santa hotspots are this game's verbs for now
    const re = mode === 'santa' ? STASH_SANTA : STASH_BLEND, L = hotspots.list;
    G.stash.length = 0;
    for (let i = L.length - 1; i >= 0; i--) if (L[i] && re.test(L[i].id || '')) G.stash.push(L.splice(i, 1)[0]);
    hotspots.reset();
    // Chip View's AR layer for the atrium (signs, name badges, gift tags)
    if (typeof AR !== 'undefined' && Array.isArray(set.ar)) for (let i = 0; i < set.ar.length; i++) AR.add(set.ar[i]);
    on('signal:full', onSig);
    LY.w = 0;
  }
  function onSig() {   // Chase (2040)'s Signal maxed: the Fun Monitor turns to him
    if (G.done || !FM.on || G.beat || FM.asking) return;
    const c = CH[2];
    if (c.here) startAsk(c);
  }
  function update(dt) {
    if (G.done) return;
    G.t += dt;
    for (let i = 0; i < CH.length; i++) { const c = CH[i]; c.a = A(c.id); c.here = here(c.a); }
    const act = state.active;
    if (act !== G.prev) { onSwap(G.prev, act); G.prev = act; }
    // timers
    if (G.noteT > 0) G.noteT -= dt;
    if (G.flash > 0) G.flash -= dt;
    if (HUM.red > 0 && (HUM.red -= dt) <= 0 && !HUM.on && fn(U.meter, 'level')) U.meter.level(null);
    for (let i = 0; i < 17; i++) if (G.merryCd[i] > 0) G.merryCd[i] -= dt;
    for (let i = 0; i < 12; i++) if (G.lookT[i] > 0 && (G.lookT[i] -= dt) <= 0 && fn(U.crowd, 'look')) U.crowd.look(i, null);
    for (let i = 0; i < CH.length; i++) {
      const c = CH[i];
      if (c.immune > 0) c.immune -= dt;
      if (c.logT > 0) c.logT -= dt;
      if (c.fest > 0) {
        if (c.fk !== 'hum' && c.a && state.active === c.id && Math.abs(c.a.pos.x - c.fx) + Math.abs(c.a.pos.z - c.fz) > 1.6) { festEnd(c); continue; }   // walked off
        if ((c.fest -= dt) <= 0) festEnd(c);
      }
    }
    fmTick(dt);
    const ext = flow.busy && !G.own;   // someone else's action (the desk, the urn): nothing counts meanwhile
    if (G.winT >= 0) { if (!G.beat && (G.winT -= dt) <= 0) win(); PR.on = false; return; }
    if (G.beat || ext) { PR.on = false; return; }
    humTick(dt);
    if (G.done || G.beat) return;
    beamTick(dt);
    if (G.done || G.beat) return;
    if (G.mode === 'santa') santaTick(dt);
    promptTick();
    if (G.mode === 'blend' && !G.beat) goal();
  }
  function draw() {
    const api = G.api;
    if (!api || G.done) return;
    const ov = api.overlay, c = ov.ctx, w = ov.w, h = ov.h, k = ov.canvas.width / w;
    c.setTransform(k, 0, 0, k, 0, 0); c.clearRect(0, 0, w, h);
    if (w !== LY.w || h !== LY.h || LY.mode !== G.mode || LY.touch !== (input.scheme === 'touch')) layout(w, h);
    if (G.cornerOn || G.intro) return;
    const talking = typeof say !== 'undefined' && fn(say, 'busy') && say.busy();
    if (!talking) { pins(c); heads(c); }
    if (G.mode === 'santa') santaMarks(c);
    panel(c);
    dial(c);
    noteDraw(c);
  }
  function cleanup(r) {
    G.done = true; G.tok++;
    off('signal:full', onSig);
    if (HUM.on) humStop();
    HUM.red = 0;
    if (fn(U.meter, 'level')) U.meter.level(null);
    for (let i = 0; i < 12; i++) if (G.lookT[i] > 0 && fn(U.crowd, 'look')) U.crowd.look(i, null);
    for (let i = 0; i < CH.length; i++) { const c = CH[i]; if (c.held && c.a) player.wait(c.id, false); c.held = false; c.fest = 0; c.fk = ''; }
    for (let i = 0; i < G.waits.length; i++) player.wait(G.waits[i], false);
    G.waits.length = 0;
    for (let i = 0; i < G.gog.length; i++) { const a = A(G.gog[i]); if (a && fn(a.rig, 'show')) a.rig.show('goggles', false); }
    G.gog.length = 0;
    if (G.fol0 !== undefined) { flow.setFollow(G.fol0); G.fol0 = undefined; }
    const L = hotspots.list;
    for (let i = G.stash.length - 1; i >= 0; i--) if (L.indexOf(G.stash[i]) < 0) L.push(G.stash[i]);
    G.stash.length = 0;
    if (FM.on) { FM.asking = null; FM.hold = 0; if (FM.d && FM.raw) FM.d.sweep = FM.sweep; DRONES.light(FM.id, 'patrol'); }
    if (G.covered) {
      G.covered = false; DRONES.walls = G.walls0;
      for (let i = 0; i < COVER.length; i++) DRONES.cover(COVER_ID[i], null);
      for (let i = 0; i < 12; i++) DRONES.cover(STAFF_ID[i], null);
    }
    if (G.own) { flow.busy = false; G.own = false; }
    flow.roaming = G.roam0; flow.swap = G.swap0; if (G.busy0) flow.busy = true;
    player.enabled = false;
    ui.swapIndicator(null); ui.prompt(null); hotspots.reset();
    if (!(r && r.aborted) && cam.cutscene) cam.release(0);
    const ov = G.api && G.api.overlay;
    if (ov) { ov.ctx.setTransform(1, 0, 0, 1, 0, 0); ov.ctx.clearRect(0, 0, ov.canvas.width, ov.canvas.height); }
    PR.on = false;
  }
  const quickWait = (s) => wait(TEST.fast ? Math.min(s, 0.25) : s);
  async function swapTo(id) { for (let n = 0; n < 3 && state.active !== id; n++) flow.swapNext(); await quickWait(0.25); }
  async function until(f, sec) { const t0 = clock.t; await waitUntil(() => G.done || f() || clock.t - t0 >= sec); return f(); }
  function beatsDone() { return !G.beat; }
  function park(id, k) { const a = A(id); if (!a) return; a.place(PARK[k % PARK.length]); if (player.followers.indexOf(a) >= 0) { player.wait(id, true); if (G.waits.indexOf(id) < 0) G.waits.push(id); } }
  function noFollow() { if (G.fol0 === undefined) { const f = flow.follow; G.fol0 = Array.isArray(f) ? f.slice() : f; } flow.setFollow(null); }

  // ---------------------------------------------------------- MINIGAMES.blend_in
  function goal() {
    if (G.winT >= 0) return;
    if (G.until) {
      const u = G.until;
      let ok;
      if (typeof u === 'function') ok = !!u(state);
      else if (Array.isArray(u)) { ok = true; for (let i = 0; i < u.length; i++) if (!state.flags[u[i]]) { ok = false; break; } }
      else ok = !!state.flags[u];
      if (ok) G.winT = 0.4;
      return;
    }
    let n = 0, present = 0;
    for (let i = 0; i < CH.length; i++) { if (CH[i].logged) n++; if (CH[i].here) present++; }
    if (n >= Math.min(G.need, Math.max(1, present))) { G.winT = 1.4; snd('drone_ok', 0.8); log('blend_in quota'); }
  }
  function win() {
    if (G.done) return;
    const logged = [];
    for (let i = 0; i < CH.length; i++) if (CH[i].logged) logged.push(CH[i].id);
    G.api.finish({ done: true, logged, asks: G.asks, yes: G.yes, strikes: G.strikesTot, corners: G.corners, acts: G.acts });
  }
  async function autoBlend(api) {
    const t = G.tok, ok = () => !stale(t);
    noFollow();
    await quickWait(0.5);
    if (!ok()) return;
    const S = (id) => ST.find((s) => s.kind === id);
    // 0. an idle question: Chase (2040) dawdles under the Monitor -> "Are you having fun?" -> YES
    park('luka', 0); park('chase', 1);
    await swapTo('chase40');
    { const d = DRONES.get(FM.id); if (d) { FM.hold = 7; placeNear('chase40', d.x + Math.sin(d.hyaw ?? d.yaw) * 2.4, d.z + Math.cos(d.hyaw ?? d.yaw) * 2.4, (d.hyaw ?? d.yaw) + PI); } }
    await until(() => G.asks > 0 && beatsDone(), 10);
    FM.hold = 0;
    await until(beatsDone, 4);
    if (!ok()) return;
    if (G.p.testCorner) { strike(CH[2], 'no'); strike(CH[2], 'no'); await until(() => G.corners > 0 && beatsDone(), 25); if (!ok()) return; }
    park('chase40', 1);
    // 1. Luka: a mince pie as the beam comes past the tea table
    await swapTo('luka');
    const pie = S('pie');
    put('luka', mark('bi_pie'));
    fmJump(nearestS(pie.x, pie.z) - 3.0);
    await quickWait(0.3);
    actPie(CH[0]);
    await until(() => CH[0].logged, 7);
    if (!CH[0].logged && ok()) { fmJump(nearestS(pie.x, pie.z) - 2.0); await until(() => CH[0].logged, 6); }
    await until(beatsDone, 3);
    if (!ok()) return;
    // ...then wishes a staffer "Merry Christmas!" (the bark and the nod; he's logged already)
    placeNear('luka', G.crowd[2] + 1.0, G.crowd[3], -H);
    await quickWait(0.2);
    actMerry(CH[0], 1);
    await until(beatsDone, 3);
    if (!ok()) return;
    park('luka', 0);
    // 2. Chase hums: too loud once (strike one), then in tune
    await swapTo('chase');
    const hum = S('hum');
    put('chase', mark('bi_hum'));
    fmJump(nearestS(hum.x, hum.z) - 15);
    await quickWait(0.3);
    if (!G.p.testCorner) {
      humStart(CH[1]); G.autoHold = true;
      await until(() => !HUM.on, 6);
      G.autoHold = false;
      await until(beatsDone, 3);
      await quickWait(0.4);
    }
    fmJump(nearestS(hum.x, hum.z) - 3.0);
    for (let n = 0; n < 8 && ok() && !CH[1].logged; n++) {
      if (!HUM.on) humStart(CH[1]);
      G.autoHold = true; await until(() => HUM.db > 37.5 || !HUM.on, 4);
      G.autoHold = false; await until(() => HUM.db < 33.5 || !HUM.on || CH[1].logged, 2);
    }
    G.autoHold = false;
    if (HUM.on) humStop();
    if (!ok()) return;
    park('chase', 1);
    // 3. Chase (2040) and Luka pull a cracker (goggles first)
    const cr = S('cracker');
    placeNear('luka', cr.x + 0.4, cr.z + 1.4, PI);
    if (G.waits.indexOf('luka') >= 0) player.wait('luka', true);
    await swapTo('chase40');
    put('chase40', mark('bi_cracker'));
    fmJump(nearestS(cr.x, cr.z) - 3.5);
    await quickWait(0.2);
    actCracker(CH[2], 'luka');
    await until(() => CH[2].logged && CH[0].logged, 9);
    if (!CH[2].logged && ok()) { fmJump(nearestS(cr.x, cr.z) - 2.0); await until(() => CH[2].logged, 6); }
    await until(() => G.done, 6);
    if (ok()) { console.warn('TWO: blend_in autoplay did not reach the quota'); win(); }
  }
  MINIGAMES.blend_in = {
    start(p, api) {
      begin('blend', p, api);
      G.need = p.need || 3; G.until = p.until || null; G.cp = p.cp || 's31_cp';
      FM.speed = p.speed || 1.1;
      fmPath(p.path || (world.set && world.set.paths && world.set.paths.fun_loop) || LOOP0);
      const d = typeof DRONES !== 'undefined' ? DRONES.get(FM.id) : null;
      fmSpawn(d ? nearestS(d.x, d.z) : FM.s || nearestS(MK.fun_home[0], MK.fun_home[2]));
      log('blend_in start');
    },
    update, draw,
    end(r) {
      const p = G.p || {};
      if (r && (r.done || r.skipped)) state.flags[p.flag || 's31_blended'] = true;
      cleanup(r);
      if (p.keepDrone === false || (r && r.aborted)) fmStop(); else fmHandOff();
    },
    skipResult: () => ({ done: true }),
    autoplay(api) { return autoBlend(api); },
    stopMonitor: fmStop,
    get monitor() { return FM; },
  };

  // ---------------------------------------------------------- MINIGAMES.secret_santa
  function ensureCast() {
    for (let i = 0; i < RIDS.length; i++) {
      const r = RCP[RIDS[i]];
      if (!A(r.id)) world.spawn(r.id, mark('gift_' + r.id), { look: r.look });
    }
    if (!A('hr')) world.spawn('hr', mark('hr'), { look: 'hr' });
  }
  async function intro() {   // HR at the west end of the gift table (mark 'hr'), Santa called over: a cut hides the move
    G.intro = true;
    await beat(async () => {
      const t = G.tok, hr = A('hr'), lk = A('luka'), m = mark('hr');
      if (!hr || !lk) return;
      const ry = m[3] || 0;
      hr.place(m);
      lk.place([m[0] + Math.sin(ry) * 1.25, 0, m[2] + Math.cos(ry) * 1.25, ry + PI]);
      hr.face('luka', 0); lk.face('hr', 0);
      await G.api.play([{ shot: 'TWO', on: ['hr', 'luka'] }, { say: 'hr', text: LINE.hr }, { say: 'luka', text: LINE.hoho }]);
      if (stale(t)) return;
      if (cam.cutscene) cam.release(0.6);
    });
    G.intro = false;
  }
  async function autoSanta(api) {
    const t = G.tok, ok = () => !stale(t);
    noFollow(); G.quietAll = true;   // autoplay keeps the Monitor quiet (the questions are blend_in's test)
    await until(() => SS.phase === 'take' && beatsDone(), 30);
    for (let round = 0; round < 5 && ok(); round++) {
      const r = SS.cur;
      if (!r) break;
      // 1. Santa takes a gift
      await swapTo('luka');
      put('luka', mark('santa_pick'));
      park('chase', 1);
      await quickWait(0.2);
      santaTake();
      await until(() => SS.phase === 'read' && beatsDone(), 5);
      if (!ok()) return;
      // 2. Chase (2040) reads the tag beside Santa (Chip View)
      await swapTo('chase40');
      { const lk = A('luka'); placeNear('chase40', lk.pos.x + 1.3, lk.pos.z + 0.9, -2.2); }
      if (typeof chip !== 'undefined') chip.peek(1.6);
      await until(() => SS.phase !== 'read', 3);
      if (SS.phase === 'read' && ok()) santaRead();
      // 3. ...and finds the recipient in the crowd
      const ra = A(r.id);
      if (ra) placeNear('chase40', ra.pos.x + Math.sin(ra.rotY) * 3.2, ra.pos.z + Math.cos(ra.rotY) * 3.2, ra.rotY + PI);
      await quickWait(0.3);
      if (typeof chip !== 'undefined') chip.peek(1.4);
      await until(() => SS.phase !== 'spot', 2.5);
      if (SS.phase === 'spot' && ok()) santaSpot();
      await quickWait(0.4);
      if (!ok()) return;
      // 4. Chase points them out (round one: the wrong person first)
      await swapTo('chase');
      if (round === 0) {
        const na = A('nadia');
        if (na) { placeNear('chase', na.pos.x + 0.9, na.pos.z + 0.6, 0); santaPoint(100 + RIDS.indexOf('nadia')); await until(beatsDone, 3); }
      }
      if (ra) placeNear('chase', ra.pos.x + Math.sin(ra.rotY) * 1.1, ra.pos.z + Math.cos(ra.rotY) * 1.1, ra.rotY + PI);
      await quickWait(0.2);
      santaPoint(100 + RIDS.indexOf(r.id));
      await until(() => SS.phase === 'give' && beatsDone(), 4);
      if (!ok()) return;
      park('chase', 1);
      // 5. Santa gives it
      await swapTo('luka');
      put('luka', mark('give_' + r.id));
      await quickWait(0.2);
      santaGive();
      await until(() => G.done || (SS.phase === 'take' && beatsDone()), 8);
    }
    await until(() => G.done, 4);
    if (ok()) { console.warn('TWO: secret_santa autoplay did not finish'); G.api.finish({ done: true, delivered: SS.k, nadia: SS.k >= 5 }); }
  }
  MINIGAMES.secret_santa = {
    start(p, api) {
      if (typeof world !== 'undefined' && world.scene) ensureCast();
      begin('santa', p, api);
      G.cp = p.cp || 'hr_meet';
      SS.monitor = p.monitor !== false; SS.calls = p.callouts || null;
      const ord = Array.isArray(p.order) ? p.order.filter((id) => RCP[id] && id !== 'nadia').slice(0, 4) : [];
      SS.order = ord.length === 4 ? [...ord, 'nadia'] : ['priya', 'gaz', 'tom', 'wen', 'nadia'];
      SS.k = 0; SS.wrong = 0; SS.given = null; santaNext();
      if (typeof chip !== 'undefined' && chip.forced && p.chipOn !== false) chip.forceOff(false);
      if (SS.monitor) {
        FM.speed = p.speed || 1.1;
        fmPath(p.path || (world.set && world.set.paths && world.set.paths.fun_loop) || LOOP0);
        const d = typeof DRONES !== 'undefined' ? DRONES.get(FM.id) : null;
        fmSpawn(d ? nearestS(d.x, d.z) : FM.s);
      } else fmStop();
      log('secret_santa start');
      if (p.intro !== false) intro(); else SS.phase = 'take';
    },
    update, draw,
    end(r) {
      const p = G.p || {};
      const fin = !!(r && (r.nadia || r.skipped || (r.auto && !r.aborted)));
      if (fin) { state.flags[p.flag || 's31_santa'] = true; SS.k = 5; }
      cleanup(r);
      if (fin && world.setId === 'hq_atrium') stageNadia();
      else if (r && r.aborted) { const pr = parcel(); if (pr) { const lk = A('luka'); if (lk && lk.held === pr) lk.hold(null); pr.visible = false; } }
      if (typeof AR !== 'undefined') AR.remove('ss_tag');
      if (!p.keepDrone) fmStop();
    },
    skipResult: () => ({ done: true, delivered: 5, nadia: true }),
    autoplay(api) { return autoSanta(api); },
  };
})();
