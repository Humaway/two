// ============================================================ MINI-GAME: Boss — 3.4 "85%" (spec §10) on hq_top
// Luka hacks at the console; the player defends him as Chase ⇄ Chase (2040) (SWAP), the other Chase is AI and always
// goes for the drone nearest Luka. Future Luka stands at the glass and talks: the 3.4 lines play over the fight as
// barks (corner box, portrait), word for word, by hack %. No health bars, no fail state: drones only slow the hack.
//
// CALL    ['minigame', 'boss', { … }] in scene 3.4 (set hq_top, env 'boss', dress 's34' — the set does that itself for
//         scene 3.4; the game dresses s34 when the set is in another state). Actors (spawned at these marks when
//         missing): luka console_luka (types at the console the whole fight) · chase boss_chase · chase40 boss_c40 ·
//         luka40 boss_l40 (at the glass; turns to whoever he talks to). Any held cutscene shot is released into the
//         tracking camera over 1.2 s, so 3.3's last WIDE can lead straight in.
// PARAMS  from      hack % to start at (default state.hack when 0 < it < to, else 0)        to   85 (finish)
//         active    'chase' | 'chase40': who the player starts as (default state.active when a Chase, else 'chase')
//         rate      0.3 (% per second while nothing touches Luka; Story Mode ×2)   back 0.5 (%/s drift while one does)
//         stalls    [[31, 'backwards'], [52, 'runaway'], [67, 'sure']]  (MINIGAMES.hack bug ids)
//         lines     false mutes the 3.4 lines          music 'boss' | false            musicOut true (fade out at 85%)
//         keepCam   leave the tracking camera on after the game (default: cam.override(null))
//         clearDrones  remove every drone at the end (default false: the live ones hang frozen where they are, for
//                   3.5's galaxy.seed(result.drones, n); downed ones are always removed)
//         autoRate  autoplay multiplies the hack rate (default 4)
// RESULT  { done: true, hack, time, stalls, touches, wraps, downs, by: { tether, ping, coat, wall }, lures, swaps, fails,
//           drones: [x, y, z, …] }  (drones = the live drones' positions at the end, for galaxy.seed)
//         skipped (pause menu after two api.fail()s): { skipped: true, done: true, hack: 85, drones }
// EVENTS  boss:line (pct) · boss:stall ({ pct, bug }) · boss:stall_done (bug) · boss:touch (kind: a drone reached Luka)
//         · boss:wrap (chase id) · boss:down ({ kind, by }) · boss:done (result). Logs 'boss …' lines (TWO_TEST.log).
// FAIL    no fail state; api.fail() when the hack sits under 1% for 45 s, or makes no new progress for 120 s, so the
//         host offers "Skip this?" after two.
//
// THE FIGHT
//   Camera   cam.override('fixed') mutated in place every tick (SETS.hq_top.bossCam): the lens rides the north-wall rail
//            (z −22.6, y 4.8, x ±8.5), aimed at lerp(console, active Chase, 0.5 → 0.8 as he nears the north wall), the
//            lens 3.2 m to the side AWAY from where the newest drone came in, so the view eases toward that side
//            (west hatch/port → the view swings west); lens lag 1.5 s, look lag 1.0 s, FOV 60 (the world widens it on
//            narrow screens). The Chases are kept off the 1.5 m north strip by a soft boundary (z ≥ −20.3).
//   Hack     +rate %/s while no drone is on Luka; a drone on him stops it and it drifts back at `back` %/s while one
//            stays. Bug stalls at 31 / 52 / 67: the bar freezes (STALLED), a SafeSense pop-up sits over it, the prompt
//            says "SWAP — Luka"; SWAP goes to Luka and MINIGAMES.hack.embed(api, { bug }) runs one pop-up full screen
//            (the arena holds still meanwhile); done → back to the Chase, the bar moves again. The glass clock and the
//            HUD QUIET IN count down (cosmetic, monotonic) 15:00 → 04:00 by 85% (the clock 11:43 → 11:54).
//   Chase    YES: Tether at the aimed drone (the one the stick faces, or nearest the mouse / a tap); keep YES held once
//            it bites to yank (0.45 s): Courtesy / Pop-up / Cleaning → yanked to the floor; Guardian → shield
//            stripped, then a second Tether drops it. 7 m reach, 1.2 s cooldown. BAG (I / X): the Lure wheel (his
//            samples; stick / left-right / mouse picks, YES throws 4.5 m ahead or at the mouse, NO closes): drones in
//            SAMPLES[id].lure.r divert to it for lure.dur; one out at a time.
//   Chase (2040)  CHIP (Q / LB / CHIP): Chip Ping, every unshielded drone within 4 m drops; 8 s cooldown; while he's the
//            one you play it floods the screen with pop-ups for 2 s (visual only). HOLD YES (0.5 s): Coat over the aimed
//            drone (6 m); it flies blind into a wall and drops; a shielded Guardian loses its shield instead. The coat
//            lands where it fell: walk over it to get it back (and 15 s from the throw) before the next one.
//   Hugs     a Courtesy drone that reaches a Chase wraps him in a soft blue field for 3 s (he can't act); one that
//            reaches Luka (or a Guardian) stays on him until it is downed or lured off.
//   Pop-up drones hang back and project SafeSense pop-ups onto the active Chase's view (max 3): NO dismisses one
//            (or click / tap its NO). Cleaning drones fly low and polish streaks (hq_top slicks) slippery for 6 s.
//   Waves    0–25% Courtesy only · 25–50 + Cleaning · 50–75 + Pop-up and one Guardian at a time · 75–85 two Guardians,
//            more of everything (≤ 8 alive). Assist: the hack dropped > 10% within 60 s → spawns a third slower until it
//            climbs back. Story Mode: half the spawns, twice the hack rate.
//   Lines    the 3.4 lines at 10 25 31(stall) 40 50(lightning + flicker) 65 75 80 as bark()s, never pausing play.
//   Music    music('boss') (verse + chorus only) unless music: false.
// AUTOPLAY  deterministic (seeded spawns, AI for both Chases, the hack ×autoRate): swaps every 14 s, the AI tethers,
//           pings, throws the coat and fetches it, opens the Lure wheel once and throws, dismisses pop-ups, SWAPs to
//           Luka at each stall (the embedded Hack plays itself), done at 85% in about 100 s of game time.
// NO ALLOCATION per tick / frame: pooled drone records, preallocated DOM, overlay painted with cached strings.
(() => {
  const PI = Math.PI, TAU = PI * 2, H = PI / 2;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const sm = (u) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
  const angTo = (a, b) => { let d = (b - a) % TAU; if (d > PI) d -= TAU; else if (d < -PI) d += TAU; return d; };
  const skipping = () => typeof flow !== 'undefined' && flow.skipping === true;
  const fire = (n, d) => { if (typeof emit === 'function') emit(n, d); };
  const log = (m) => { if (typeof testLog === 'function') testLog(m); fire('boss:log', m); };   // (boss:log: for input probes)

  // ---------------------------------------------------------- tuning
  const ROOM = { x0: -11.5, x1: 11.5, z0: -22.7, z1: -11.7 };   // where drones fly
  const ZN = -20.3, ZS = -11.8, XL = 11.4;                       // the Chases' soft box (north strip off: the rail cam)
  const CONSOLE = [0, 1.0, -15.4];
  const TETH = { range: 7, cd: 1.2, wind: 0.24, fly: 0.2, yank: 0.45, bite: 1.6 };
  const PING = { r: 4, cd: 8, flood: 2 };
  const COAT = { range: 6, cd: 15, hold: 0.5, fly: 0.36, speed: 3.3 };
  const HUG = 3, SLICK = 6;
  const KIND = {
    courtesy: { sp: 1.25, h: 1.45, light: 'escort', cone: { len: 1.4, half: 0.55 }, touch: 0.7 },
    guardian: { sp: 0.95, h: 1.7, light: 'escort', cone: { len: 1.6, half: 0.5 }, touch: 0.9 },
    popup:    { sp: 1.6, h: 2.5, light: 'curious', cone: false, touch: 0 },
    cleaning: { sp: 1.45, h: 0.62, light: 'patrol', cone: false, touch: 0 },
  };
  const WAVES = [
    { at: 0, max: 3, every: 5.5, cl: 0, pp: 0, gd: 0 },
    { at: 25, max: 4, every: 4.8, cl: 1, pp: 0, gd: 0 },
    { at: 50, max: 6, every: 4.2, cl: 1, pp: 1, gd: 1 },
    { at: 75, max: 8, every: 3.0, cl: 2, pp: 2, gd: 2 },
  ];
  const SPAWN_KEYS = ['hatch_w', 'hatch_cw', 'hatch_ce', 'hatch_e', 'port_w', 'port_e'];
  const SPAWN_DEF = {   // hq_top's spawns (used when the set doesn't carry them)
    hatch_w: { at: [-7.5, 5.0, -19.0], exit: [-7.5, 3.2, -18.4], side: -1 }, hatch_cw: { at: [-2.0, 5.0, -17.6], exit: [-2.0, 3.0, -17.2], side: 0 },
    hatch_ce: { at: [2.0, 5.0, -17.6], exit: [2.0, 3.0, -17.2], side: 0 }, hatch_e: { at: [7.5, 5.0, -19.0], exit: [7.5, 3.2, -18.4], side: 1 },
    port_w: { at: [-7.5, 3.8, -10.4], exit: [-7.5, 3.4, -12.4], side: -1 }, port_e: { at: [7.5, 3.8, -10.4], exit: [7.5, 3.4, -12.4], side: 1 },
  };
  const STALLS_DEF = [[31, 'backwards'], [52, 'runaway'], [67, 'sure']];
  // the 3.4 lines (spec §8 3.4, word for word): [pct, [[speaker, text, tag, faceTo], …]]
  const LINES = [
    [10, [['luka40', "You're going to get hurt.", '', 'chase'], ['chase', "That's mine."]]],
    [25, [['luka40', "Chase. ^ You don't have to do this.", '', 'chase40'], ['chase40', "Yeah, I do. ^ You taught me that. 'I'll do it.'"]]],
    [40, [['luka40', 'Is this what you want? To be the reason they get hurt?', 'to Luka', 'luka'], ['luka', 'They chose it.', 'typing']]],
    [50, [['luka40', "You don't know what it's like. Being the one who could.", '', 'luka'], ['luka', "Yeah, I do. ^ I'm the one who could. ^ I'm doing it right now."]]],
    [65, [['chase40', "Why didn't you TELL me?", 'furious'], ['luka40', "Because you'd have stayed.", '', 'chase40'], ['chase40', "Of course I'd have stayed!"], ['luka40', "THAT'S WHY.", '', 'chase40']]],
    [75, [['luka40', 'Stop. Please. ^ Stop.', '', 'luka']]],
    [80, [['chase', 'Nearly there!'], ['chase40', "Don't say nearly. Never say nearly."]]],
  ];
  const STALL_LINES = { backwards: [['luka', "Bar's going backwards!"], ['chase', 'Press NO!']] };
  // SafeSense UI text (not dialogue)
  const HZ_MSG = ['Are you sure?', 'Have you tried being safe?', 'Please remain calm.', 'Unsafe movement detected.', 'Please hold.',
    'You seem stressed. Breathe in.', 'This fight has been paused. For your safety.', 'Hydration reminder.'];
  const FLOOD = ['Chip overload.', 'SafeSense', 'Signal: FULL', 'Are you sure?', 'Hello!', 'Please hold.', 'For your safety.', 'Updating…',
    'Reconnecting…', 'Welcome back, Chase.', 'Device not found.', 'Installing calm.'];
  const FL_POS = [[0.24, 0.3], [0.7, 0.24], [0.5, 0.46], [0.3, 0.64], [0.76, 0.58], [0.58, 0.76], [0.16, 0.48], [0.86, 0.4], [0.42, 0.2], [0.62, 0.36]];
  const HZ_POS = [[0.34, 0.42], [0.66, 0.5], [0.46, 0.64], [0.6, 0.32]];
  const STALL_UI = {
    backwards: { title: 'Update', msg: 'Restoring safety…', btn: '' },
    runaway: { title: 'SafeSense', msg: 'Continue?', btn: 'OK' },
    sure: { title: 'SafeSense', msg: 'Are you sure?', btn: 'YES' },
  };
  const FONT = '600 13px "Trebuchet MS", "Segoe UI", system-ui, sans-serif', FONT_S = '600 11px "Trebuchet MS", "Segoe UI", system-ui, sans-serif';
  const SCALE = []; for (let i = 0; i <= 50; i++) SCALE.push('scaleX(' + (i / 50) + ')');
  const S100 = [], P100 = [], TXP = []; for (let i = 0; i <= 100; i++) { S100.push('scaleX(' + (i / 100) + ')'); P100.push(i + '%'); }
  for (let i = -70; i <= 70; i++) TXP.push('translateX(' + i + 'px)');

  // ---------------------------------------------------------- state (module-level, reset by start)
  let api = null, P = {}, phase = 'end', auto = false, run = 0;
  let from0 = 0, chipOn = false;
  let t = 0, hack = 0, peak = 0, goal = 85, rate = 0.3, backRate = 0.5, story = false, seed = 1158;
  let lineI = 0, stallI = 0, STALLS = STALLS_DEF, stall = null, stallT = 0, hk = null, hkFrom = 'chase', opq = 0;
  let zeroT = 0, flatT = 0, flatPeak = 0, fails = 0;
  let spawnT = 0, spawnN = 0, lastG = -99, lastP = -99, lastC = -99;
  let assist = false, assistRef = 0, histT = 0, histI = 0;
  const HIST = new Float32Array(60);
  let q = 900, qShown = -1, pctShown = -1, hudBack = false, hudStall = false;
  let side = -1, sideTo = -1, onLuka = 0, wasOn = false, swapT = 14, lukaExpr = '';
  let mouseT = 0, pmx = 0, pmy = 0, floodT = 0, hzSeen = 0, nextWheelAuto = 30;
  let spawns = SPAWN_DEF, bossCam = null;
  const ST = { touches: 0, wraps: 0, downs: 0, tether: 0, ping: 0, coat: 0, wall: 0, lures: 0, swaps: 0, stalls: 0 };
  const CAMO = { pos: [0, 4.8, -22.6], look: [0, 1, -16], fov: 60, lag: 1.5, lookLag: 1.0 };
  const HK_STALL = { stalled: true }, HK_BACK = { back: true }, DASH0 = [], DASH1 = [5, 7];
  const CLK = { h: 11, m: 43, s: 0, quiet: 900, sec: false };
  const SO = { at: null, vol: 1 }, SO2 = { vol: 1 };
  let V1 = null, V2 = null, V3 = null, MV = null;     // THREE vectors (made at first start)
  const rand = () => { seed = (seed + 0x6d2b79f5) | 0; let x = Math.imul(seed ^ (seed >>> 15), 1 | seed); x ^= x + Math.imul(x ^ (x >>> 7), 61 | x); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };

  // the Chases
  const mkCh = (id) => ({ id, a: null, c40: id === 'chase40', wrapT: 0, cd: 0, cd2: 0, hugB: null, pingT: 0,
    tt: { st: 'idle', t: 0, b: null, x: 0, y: 0, z: 0, k: 0, held: 0 },
    coat: { st: 'worn', t: 0, b: null, x: 0, y: 0, z: 0, x0: 0, y0: 0, z0: 0, cd: 0, charge: 0, tap: 0 },
    slipX: 0, slipZ: 0, lx: 0, lz: 0, slick: false,
    ai: { t: 0, b: null, ready: 0, mx: 1e9, mz: 1e9, lureCd: 8, detT: 0, sideK: 1 } });
  const CH = { chase: mkCh('chase'), chase40: mkCh('chase40') }, CHL = [CH.chase, CH.chase40];
  let luka = null, l40 = null;

  // drones: pooled records over DRONES (ai: false, parked 'idle': this file moves them and writes x / z / yaw / hover)
  const NB = 16, BP = [], LIVE = [];
  for (let i = 0; i < NB; i++) BP.push({ id: '', on: false, d: null, kind: '', K: null, st: '', t: 0, x: 0, z: 0, h: 1.5, hTo: 1.5, vx: 0, vz: 0, yaw: 0,
    shield: false, tgt: null, ch: null, slot: 0, ax: 0, ay: 0, az: 0, ex: 0, ey: 0, ez: 0, lureEnd: 0, sx: 0, sz: 0, sdx: 0, sdz: 0, sn: 0, sacc: 0, sp: 0,
    projT: 0, beamT: 0, bdx: 0, bdz: 0, kx: 0, kz: 0, stunT: 0, n: 0, landed: false, side: 0, lured: false });
  const PEND = []; for (let i = 0; i < 4; i++) PEND.push({ on: false, t: 0, key: '', kind: '', closeT: 0 });
  const HATCH_T = new Float32Array(6);   // close timers per spawn key index
  const LU = { on: false, cd: 0, fly: 0, x0: 0, z0: 0, x: 0, z: 0, r: 5, dur: 4, t: 0, id: '', label: '', rep: 0, sfx: '' };
  const SL = []; for (let i = 0; i < 4; i++) SL.push({ on: false, x: 0, z: 0, c: 1, s: 0, t: 0 });
  let slI = 0;
  const WH = { on: false, i: 0, list: [], t: 0, last: -1 };
  const AIM = { b: null, ok: false };
  let props = null, MESH = null, D = null, stallEl = null;

  // ---------------------------------------------------------- small helpers
  const prop = (n) => { const p = world.prop(n); return p && p.userData ? p.userData : null; };
  const actorOf = (id) => world.actor(id) || null;
  const activeCh = () => (state.active === 'chase40' ? CH.chase40 : state.active === 'chase' ? CH.chase : CH[hkFrom] || CH.chase);
  const playerCh = () => (state.active === 'chase' || state.active === 'chase40' ? CH[state.active] : null);
  const dist2 = (ax, az, bx, bz) => { const dx = ax - bx, dz = az - bz; return dx * dx + dz * dz; };
  function snd(n, x, y, z, vol = 1) {
    if (skipping() || !api || !api.sfx) return;
    if (x == null) { SO2.vol = vol; api.sfx(n, SO2); return; }
    V3.set(x, y, z); SO.at = V3; SO.vol = vol; api.sfx(n, SO);
  }
  const barkL = (id, text, tag) => (typeof bark === 'function' ? bark(id, text, tag ? { tag } : undefined) : null);
  const alive = (b) => b && b.on && b.st !== 'down';
  const targetable = (b) => alive(b) && b.st !== 'blind' && !(b.st === 'enter' && b.h > 3.6);

  // ---------------------------------------------------------- DOM (built once; pooled)
  const CSS = `
.bs{position:fixed;inset:0;pointer-events:none!important;font-family:var(--game,"Trebuchet MS",sans-serif);user-select:none;-webkit-user-select:none}
.bs.off{display:none}
.bs .jv{pointer-events:none!important;position:absolute}
.bs .jv-b{pointer-events:auto}
.bs-pills{position:absolute;left:14px;top:14px;display:flex;flex-wrap:wrap;gap:8px;max-width:calc(100vw - 28px)}
.bs-pill{position:relative;display:flex;align-items:center;gap:8px;padding:5px 13px 6px 6px;border-radius:999px;background:rgba(20,29,58,.84);border:1px solid rgba(255,210,31,.5);font-size:14px;color:#fff;white-space:nowrap;overflow:hidden;letter-spacing:.04em;transition:opacity .2s}
.bs-pill b{padding:1px 8px;border-radius:999px;background:var(--yes,#ffd21f);color:var(--navy,#141d3a);font-size:12px;letter-spacing:.06em}
.bs-pill b.k2{background:#e8e8ee}
.bs-pill b.chip{background:var(--ice,#bfe6ff);color:#12305a;box-shadow:0 0 8px rgba(143,208,255,.8)}
.bs-pill b.hold{background:transparent;color:var(--yes,#ffd21f);box-shadow:inset 0 0 0 2px var(--yes,#ffd21f)}
.bs-pill i{position:absolute;left:0;bottom:0;height:3px;width:100%;background:var(--yes,#ffd21f);transform-origin:0 50%;transform:scaleX(1)}
.bs-pill.wait{opacity:.62}
.bs-pill.warn{border-color:#ffb27a}
.bs-pill.warn span{color:#ffd2b0}
.bs .bs-hz{width:min(300px,74vw);transform:translate(-50%,-50%)}
.bs .bs-hz .jv-note{font-size:12px}
.bs .bs-fl{width:min(220px,50vw);transform:translate(-50%,-50%);font-size:13px}
.bs .bs-fl .jv-body{padding:4px 14px 10px}
.bs .bs-fl .jv-msg{font-size:13px}
.bs-stall{left:50%;top:30px;transform:translateX(-50%);width:min(320px,80vw);z-index:8;pointer-events:none!important}
.bs-stall .jv-b{pointer-events:none}
.bs-stall .jv-prog{padding:0 22px 12px}
.bs-stall.off{display:none}
@media (max-width:600px){.bs-pills{top:44px;left:12px;gap:6px;max-width:calc(100vw - 92px)}.bs-pill{font-size:12px;padding:4px 10px 5px 5px;gap:6px}.bs-pill b{font-size:11px;padding:1px 6px}.bs-stall{top:92px}}
`;
  function h(tag, cls, parent, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; if (parent) parent.appendChild(e); return e; }
  function ssBox(parent, cls, title, withBtn) {
    const w = h('div', 'jv ss ' + cls + ' off', parent);
    const bar = h('div', 'jv-bar', w); h('span', 'jv-logo', bar, 'SafeSense'); const tt = h('span', 'jv-t', bar, title || '');
    const body = h('div', 'jv-body', w); h('div', 'ic none', body); const msg = h('div', 'jv-msg', body);
    const note = h('div', 'jv-note off', w);
    let btn = null;
    if (withBtn) { const bs = h('div', 'jv-btns', w); btn = h('button', 'jv-b', bs, withBtn); btn.type = 'button'; btn.tabIndex = -1; }
    return { el: w, tt, msg, note, btn, on: false, t: 0 };
  }
  function build() {
    if (D) return;
    const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    const root = h('div', 'bs off');
    const pills = h('div', 'bs-pills', root), pl = [];
    for (let i = 0; i < 2; i++) { const p = h('div', 'bs-pill', pills), k = h('b', null, p), s = h('span', null, p), f = h('i', null, p); pl.push({ el: p, k, s, f, kT: null, sT: null, fK: -1, wait: null, warn: null, kc: null }); }
    const hz = [];
    for (let i = 0; i < 4; i++) {
      const b = ssBox(root, 'bs-hz', '', 'NO'), k = i;
      b.btn.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); if (phase !== 'end') hzOff(k); });
      hz.push(b);
    }
    const fl = [];
    for (let i = 0; i < FL_POS.length; i++) { const b = ssBox(root, 'bs-fl', '', null); b.msg.textContent = FLOOD[i % FLOOD.length]; b.el.style.left = (FL_POS[i][0] * 100) + '%'; b.el.style.top = (FL_POS[i][1] * 100) + '%'; fl.push(b); }
    // the stall pop-up sits over the HUD's HACK bar (#hack is z 7 in #ui): it lives in #ui at z 8
    const sp = ssBox(null, 'bs-stall', '', ' ');
    const pr = h('div', 'jv-prog', sp.el), pd = h('div', null, pr), pf = h('i', null, pd), pp = h('span', null, pr, '31%');
    sp.prog = pr; sp.fill = pf; sp.pct = pp; sp.el.insertBefore(pr, sp.el.querySelector('.jv-btns'));
    stallEl = sp;
    D = { root, pl, hz, fl, sp };
  }
  function domOn(on) {
    if (!D) return;
    if (on) { if (api && api.ui && D.root.parentNode !== api.ui) api.ui.appendChild(D.root); D.root.classList.remove('off'); }
    else D.root.classList.add('off');
  }
  function domDetach() {
    if (!D) return;
    D.root.classList.add('off'); if (D.root.parentNode) D.root.parentNode.removeChild(D.root);
    for (const b of D.hz) { b.on = false; b.el.classList.add('off'); }
    for (const b of D.fl) { b.on = false; b.el.classList.add('off'); }
    stallPop(null);
    if (stallEl && stallEl.el.parentNode) stallEl.el.parentNode.removeChild(stallEl.el);
  }
  // hazard pop-ups (the Pop-up drones' projections onto the active Chase's view)
  function hzCount() { let n = 0; for (let i = 0; i < 4; i++) if (D.hz[i].on) n++; return n; }
  function hzOn() {
    for (let i = 0; i < 4; i++) {
      const b = D.hz[i];
      if (b.on) continue;
      b.on = true; b.t = 0; b.msg.textContent = HZ_MSG[(rand() * HZ_MSG.length) | 0];
      b.note.textContent = 'NO dismisses it'; b.note.classList.toggle('off', hzSeen >= 2); hzSeen++;
      b.el.style.left = (HZ_POS[i][0] * 100) + '%'; b.el.style.top = (HZ_POS[i][1] * 100) + '%'; b.el.style.zIndex = String(10 + hzSeen);
      b.el.classList.remove('off');
      return true;
    }
    return false;
  }
  function hzOff(i) {
    const b = D.hz[i];
    if (!b || !b.on) return;
    b.on = false; b.el.classList.add('off');
    snd('popup_clear', null, 0, 0, 0.6);
    log('boss popup off');
  }
  function hzNewest() { let k = -1, bt = 1e9; for (let i = 0; i < 4; i++) { const b = D.hz[i]; if (b.on && b.t < bt) { bt = b.t; k = i; } } return k; }
  function hzClear() { if (D) for (let i = 0; i < 4; i++) { D.hz[i].on = false; D.hz[i].el.classList.add('off'); } }
  function floodTick(dt) {
    if (floodT <= 0) return;
    floodT -= dt;
    const el = PING.flood - floodT;
    for (let i = 0; i < D.fl.length; i++) {
      const b = D.fl[i], on = floodT > 0 && el >= i * 0.06 && el < PING.flood - (D.fl.length - i) * 0.02;
      if (on !== b.on) { b.on = on; b.el.classList.toggle('off', !on); }
    }
  }
  function floodClear() { floodT = 0; if (D) for (let i = 0; i < D.fl.length; i++) { const b = D.fl[i]; if (b.on) { b.on = false; b.el.classList.add('off'); } } }
  function stallPop(bug) {
    const sp = stallEl;
    if (!sp) return;
    if (!bug) { if (sp.on) { sp.on = false; sp.el.classList.add('off'); } return; }
    const u = STALL_UI[bug] || STALL_UI.sure;
    sp.tt.textContent = u.title; sp.msg.textContent = u.msg; sp.t = 0; sp.v = -999;
    sp.btn.textContent = u.btn || 'OK'; sp.btn.parentNode.classList.toggle('off', !u.btn);
    sp.prog.classList.toggle('off', bug !== 'backwards');
    sp.btn.style.transform = '';
    const host = document.getElementById('ui');
    if (host && sp.el.parentNode !== host) host.appendChild(sp.el);
    sp.on = true; sp.el.classList.remove('off');
  }

  // ---------------------------------------------------------- 3-D bits (built once; added to the set's scene per run)
  function meshes() {
    if (MESH) return MESH;
    const ringG = new THREE.RingGeometry(0.9, 1.0, 48); ringG.rotateX(-H);
    const ring = (key, col) => { const m = new THREE.Mesh(ringG, mat(0x000000, { emissive: col, emissiveIntensity: 1, transparent: true, opacity: 0.6, side: THREE.DoubleSide, key })); m.renderOrder = 3; m.visible = false; m.userData.noOcclude = true; return m; };
    const field = () => { const f = PROPS.hug_field(); f.visible = false; f.traverse((o) => { o.userData.noOcclude = true; }); return f; };
    MESH = { ping: ring('boss_ping', 0x8fd0ff), lure: ring('boss_lure', 0xffd21f), lure2: ring('boss_lure2', 0xffd21f),
      teth: PROPS.tether_line(), coat: PROPS.coat_thrown(), fields: [field(), field(), field()] };
    MESH.teth.visible = false; MESH.coat.visible = false;
    return MESH;
  }
  function meshesAdd(on) {
    const M = meshes(), list = [M.ping, M.lure, M.lure2, M.teth, M.coat, M.fields[0], M.fields[1], M.fields[2]];
    for (let i = 0; i < list.length; i++) {
      const o = list[i];
      if (on) { if (world.scene && o.parent !== world.scene) world.scene.add(o); o.visible = false; }
      else { o.visible = false; if (o.parent) o.parent.remove(o); }
    }
  }

  // ---------------------------------------------------------- drones
  function bFree() { for (let i = 0; i < NB; i++) if (!BP[i].on) return BP[i]; return null; }
  function bGo(b, st) { b.st = st; b.t = 0; }
  function bLight(b, l) { if (b.d && typeof DRONES !== 'undefined') DRONES.light(b.id, l); }
  function bPut(b) {
    const d = b.d;
    if (!d || !d.obj) return;
    d.x = b.x; d.z = b.z; d.yaw = b.yaw; d.hover = b.h; d.vx = b.vx; d.vz = b.vz; d.faceOn = false;
  }
  function counts(out) { out.courtesy = out.guardian = out.popup = out.cleaning = 0; for (let i = 0; i < LIVE.length; i++) if (LIVE[i].st !== 'down') out[LIVE[i].kind]++; return out; }
  const CNT = { courtesy: 0, guardian: 0, popup: 0, cleaning: 0 };
  function aliveN() { let n = 0; for (let i = 0; i < LIVE.length; i++) if (LIVE[i].st !== 'down') n++; return n; }
  function spawnDrone(kind, key, inRoom) {
    if (typeof DRONES === 'undefined' || !world.scene) return null;
    const b = bFree();
    if (!b) return null;
    const sp = spawns[key] || SPAWN_DEF[key], K = KIND[kind];
    const id = 'boss_' + kind + '_' + (++spawnN);
    const at = inRoom || sp.at;
    const d = DRONES.spawn(id, { at: [at[0], 0, at[2]], hover: at[1], kind, cone: K.cone, ai: false, showPath: false });
    if (!d) return null;
    DRONES.face(id, [sp.exit[0], 0, sp.exit[2]]); d.faceOn = false;
    b.on = true; b.id = id; b.d = d; b.kind = kind; b.K = K; b.x = at[0]; b.z = at[2]; b.h = b.hTo = at[1]; b.vx = b.vz = 0;
    b.yaw = Math.atan2(sp.exit[0] - at[0], sp.exit[2] - at[2]); b.tgt = null; b.ch = null; b.slot = 0; b.lured = false; b.landed = false;
    b.ax = at[0]; b.ay = at[1]; b.az = at[2]; b.ex = sp.exit[0]; b.ey = sp.exit[1]; b.ez = sp.exit[2]; b.side = sp.side || 0;
    b.shield = kind === 'guardian'; b.projT = 1.5 + rand() * 1.5; b.beamT = 0; b.sn = 0; b.n = 0; b.sacc = 0; b.stunT = 0;
    const u = d.obj.userData;
    if (u.setShield) u.setShield(b.shield);
    if (u.setBeam) u.setBeam(false);
    coneVis(b, true);
    bLight(b, K.light);
    bGo(b, inRoom ? 'seek' : 'enter');
    if (inRoom) { b.hTo = K.h; }
    LIVE.push(b);
    if (!inRoom && b.side) sideTo = b.side;
    log('boss spawn ' + kind + ' ' + key);
    bPut(b);
    return b;
  }
  function coneVis(b, on) { const d = b.d; if (d && d.cone && d.hasCone) { d.cone.visible = on; if (d.beam) d.beam.visible = on; } }
  function bRemove(b) {
    if (!b.on) return;
    coneVis(b, true);   // (the record goes back to DRONES' pool as it came)
    if (typeof DRONES !== 'undefined') DRONES.remove(b.id);
    b.on = false; b.d = null; b.tgt = null; b.ch = null;
    const i = LIVE.indexOf(b);
    if (i >= 0) { LIVE[i] = LIVE[LIVE.length - 1]; LIVE.length--; }
    for (let k = 0; k < 2; k++) { const ch = CHL[k]; if (ch.tt.b === b) ch.tt.b = null; if (ch.coat.b === b) ch.coat.b = null; if (ch.ai.b === b) ch.ai.b = null; if (ch.hugB === b) ch.hugB = null; }
    if (AIM.b === b) AIM.b = null;
  }
  // knock a drone out of the air (by: tether / ping / coat / wall)
  function bDown(b, by, kx = 0, kz = 0) {
    if (!alive(b)) return;
    if (b.ch) { unwrap(b.ch); b.ch = null; }
    bGo(b, 'down'); b.kx = kx; b.kz = kz; b.landed = false; b.hTo = 0.16;
    coneVis(b, false);
    const u = b.d && b.d.obj && b.d.obj.userData;
    if (u && u.setBeam) u.setBeam(false);
    if (u && u.setShield) u.setShield(false);
    bLight(b, 'off');
    ST.downs++; if (ST[by] != null) ST[by]++;
    log('boss down ' + b.kind + ' ' + by);
    fire('boss:down', { kind: b.kind, by });
  }
  function stripShield(b) {
    b.shield = false;
    const u = b.d && b.d.obj && b.d.obj.userData;
    if (u && u.setShield) u.setShield(false);
    snd('glass', b.x, b.h, b.z, 0.8);
    puffAt(b.x, b.h, b.z, 0x9fd8ff, 10, 1.4);
    if (b.ch) { unwrap(b.ch); b.ch = null; }
    bGo(b, 'stun'); b.stunT = 1.2;
    log('boss shield ' + b.id);
  }
  function puffAt(x, y, z, col, n, speed) { if (!world.puff || skipping()) return; V2.set(x, y, z); world.puff(V2, { n, color: col, speed, life: 0.5, gravity: 4 }); }
  const PUFF_O = { n: 6, color: 0x8c8c8c, speed: 0.15, life: 1.4, gravity: -0.35 };

  // movement: steer toward (tx, tz) at sp with separation; returns the distance left
  function steer(b, tx, tz, sp, dt, face) {
    const dx = tx - b.x, dz = tz - b.z, L = Math.hypot(dx, dz);
    let wx = 0, wz = 0;
    if (L > 0.03) { const s = Math.min(sp, L * 4); wx = (dx / L) * s; wz = (dz / L) * s; }
    for (let i = 0; i < LIVE.length; i++) {   // keep a metre apart
      const o = LIVE[i];
      if (o === b || o.st === 'down') continue;
      const ox = b.x - o.x, oz = b.z - o.z, d2 = ox * ox + oz * oz;
      if (d2 < 1.0 && d2 > 1e-6) { const d = Math.sqrt(d2), k = (1.0 - d) * 1.6; wx += (ox / d) * k; wz += (oz / d) * k; }
    }
    const k = Math.min(1, 5 * dt);
    b.vx += (wx - b.vx) * k; b.vz += (wz - b.vz) * k;
    b.x = clamp(b.x + b.vx * dt, ROOM.x0, ROOM.x1); b.z = clamp(b.z + b.vz * dt, ROOM.z0, ROOM.z1);
    const want = face != null ? face : b.vx * b.vx + b.vz * b.vz > 0.04 ? Math.atan2(b.vx, b.vz) : b.yaw;
    b.yaw += clamp(angTo(b.yaw, want), -4 * dt, 4 * dt);
    return L;
  }
  const yawTo = (b, x, z) => Math.atan2(x - b.x, z - b.z);
  // the courtesy drone's mark: the nearest person nobody else is already hugging (wrapped Chases are left alone)
  function nearestPerson(b) {
    let best = luka, bd = luka ? dist2(b.x, b.z, luka.pos.x, luka.pos.z) : 1e9;
    for (let i = 0; i < 2; i++) {
      const ch = CHL[i];
      if (!ch.a || ch.wrapT > 0 || ch.hugB) continue;
      const d = dist2(b.x, b.z, ch.a.pos.x, ch.a.pos.z);
      if (d < bd) { bd = d; best = ch.a; }
    }
    return best;
  }
  function lukaSlotFree() { let m = 0; for (let i = 0; i < LIVE.length; i++) if (LIVE[i].st === 'luka') m |= 1 << LIVE[i].slot; for (let s = 0; s < 4; s++) if (!(m & (1 << s))) return s; return 3; }
  function droneTick(b, dt) {
    b.t += dt;
    const K = b.K;
    switch (b.st) {
      case 'enter': {   // out of the hatch / in through the port iris
        const k = sm(b.t / 0.9);
        b.x = b.ax + (b.ex - b.ax) * k; b.z = b.az + (b.ez - b.az) * k; b.h = b.hTo = b.ay + (b.ey - b.ay) * k;
        if (b.t >= 0.9) { bGo(b, 'seek'); b.hTo = K.h; }
        break;
      }
      case 'seek': seek(b, dt); break;
      case 'hug': {     // wrapped round a Chase for 3 s, then a courteous step back
        const a = b.ch && b.ch.a;
        if (!a) { bGo(b, 'seek'); break; }
        const dx = b.x - a.pos.x, dz = b.z - a.pos.z, L = Math.hypot(dx, dz) || 1;
        steer(b, a.pos.x + (dx / L) * 0.55, a.pos.z + (dz / L) * 0.55, 2, dt, yawTo(b, a.pos.x, a.pos.z));
        b.hTo = 1.25;
        if (b.t >= HUG) { unwrap(b.ch); b.ch = null; bGo(b, 'back'); b.bdx = dx / L; b.bdz = dz / L; }
        break;
      }
      case 'back': steer(b, b.x + b.bdx * 2, b.z + b.bdz * 2, K.sp, dt); b.hTo = K.h; if (b.t > 1.3) bGo(b, 'seek'); break;
      case 'luka': {    // on Luka: the hack stops and drifts back while it stays
        if (!luka) { bGo(b, 'seek'); break; }
        const a = PI + (b.slot - 1.5) * 0.85;
        steer(b, luka.pos.x + Math.sin(a) * 0.72, luka.pos.z + Math.cos(a) * 0.72, 1.6, dt, yawTo(b, luka.pos.x, luka.pos.z));
        b.hTo = b.kind === 'guardian' ? 1.55 : 1.35;
        break;
      }
      case 'snared': {  // a tether round it: it bucks on the line
        b.vx = b.vz = 0;
        b.x = b.sx + Math.sin(b.t * 37) * 0.05; b.z = b.sz + Math.cos(b.t * 29) * 0.05;
        b.yaw += Math.sin(b.t * 23) * 0.06;
        break;
      }
      case 'stun': b.vx *= 0.9; b.vz *= 0.9; b.yaw += dt * 5; if (b.t >= b.stunT) { bGo(b, 'seek'); } break;
      case 'lured': {
        if (!LU.on || LU.fly > 0 || t >= b.lureEnd) { b.lured = false; bLight(b, K.light); bGo(b, 'seek'); break; }
        const dx = b.x - LU.x, dz = b.z - LU.z, L = Math.hypot(dx, dz) || 1;
        steer(b, LU.x + (dx / L) * 1.0, LU.z + (dz / L) * 1.0, Math.max(1.6, K.sp), dt, yawTo(b, LU.x, LU.z) + Math.sin(b.t * 1.7) * 0.4);
        b.hTo = 1.1;
        break;
      }
      case 'blind': {   // the coat over it: flies blind until it meets a wall
        b.vx = b.bdx * COAT.speed + Math.sin(b.t * 9) * 0.6; b.vz = b.bdz * COAT.speed + Math.cos(b.t * 7) * 0.6;
        b.x += b.vx * dt; b.z += b.vz * dt; b.yaw += dt * 6; b.hTo = 1.3;
        if (b.x <= ROOM.x0 || b.x >= ROOM.x1 || b.z <= ROOM.z0 || b.z >= ROOM.z1 || b.t > 4) {
          b.x = clamp(b.x, ROOM.x0, ROOM.x1); b.z = clamp(b.z, ROOM.z0, ROOM.z1);
          snd('wall_hit', b.x, b.h, b.z, 1); puffAt(b.x, b.h, b.z, 0xffd060, 12, 2);
          if (cam.shake && !options.reduceFlashing) cam.shake(0.03, 0.3);
          const c = CH.chase40.coat;
          if (c.b === b) coatDrop(c, b.x - b.bdx * 0.8, b.z - b.bdz * 0.8);
          bDown(b, 'wall', -b.bdx * 0.8, -b.bdz * 0.8);
        }
        break;
      }
      case 'down': {
        const k = Math.min(1, b.t / 0.4);
        b.x += b.kx * dt; b.z += b.kz * dt; b.kx *= 0.92; b.kz *= 0.92;
        b.x = clamp(b.x, ROOM.x0, ROOM.x1); b.z = clamp(b.z, ROOM.z0, ROOM.z1);
        b.h = b.h + (0.16 - b.h) * k * k; b.vx = b.vz = 0;
        if (!b.landed && k >= 1) {
          b.landed = true; b.kx = b.kz = 0;
          if (world.resolve) { world.resolve(b.x, b.z, 0.32, V2); b.x = V2.x; b.z = V2.z; }
          snd('thud', b.x, 0.2, b.z, 0.9); puffAt(b.x, 0.25, b.z, 0xffd060, 10, 1.6);
        }
        if (b.t >= 1.8) { if (world.puff && !skipping()) { V2.set(b.x, 0.3, b.z); world.puff(V2, PUFF_O); } bRemove(b); return; }
        break;
      }
    }
    if (b.st !== 'enter' && b.st !== 'down') b.h += (b.hTo - b.h) * Math.min(1, 2.5 * dt);
    if (b.beamT > 0 && (b.beamT -= dt) <= 0) { const u = b.d && b.d.obj && b.d.obj.userData; if (u && u.setBeam) u.setBeam(false); }
    bPut(b);
  }
  function seek(b, dt) {
    const K = b.K;
    if (b.kind === 'popup') {   // hang back ~5.5 m from the active Chase and throw pop-ups into his eyes
      const ch = activeCh(), a = ch.a;
      if (!a) return;
      const dx = b.x - a.pos.x, dz = b.z - a.pos.z, L = Math.hypot(dx, dz) || 1;
      steer(b, clamp(a.pos.x + (dx / L) * 5.5, ROOM.x0 + 0.5, ROOM.x1 - 0.5), clamp(a.pos.z + (dz / L) * 5.5, -20.5, -12.2), K.sp, dt, yawTo(b, a.pos.x, a.pos.z));
      b.hTo = K.h;
      if (phase === 'fight' && L < 9.5 && (b.projT -= dt) <= 0) {
        b.projT = 3.6 + rand() * 1.2;
        const u = b.d && b.d.obj && b.d.obj.userData;
        if (u && u.setBeam) { u.setBeam(true); b.beamT = 0.6; }
        snd('ss_chirp', b.x, b.h, b.z, 0.8);
        if (hzOn()) log('boss popup');
      }
      return;
    }
    if (b.kind === 'cleaning') {   // a low pass polishing a streak: four slicks, 1.6 m each, slippery for 6 s
      if (b.n === 0) {             // pick a streak across the fighting floor
        const ang = rand() * TAU, cx = -7 + rand() * 14, cz = -18.6 + rand() * 5.4;
        b.sdx = Math.sin(ang); b.sdz = Math.cos(ang);
        b.sx = clamp(cx - b.sdx * 3.2, -10.5, 10.5); b.sz = clamp(cz - b.sdz * 3.2, -19.8, -12.4);
        b.n = 1; b.sn = 0; b.sacc = 0;
      }
      if (b.n === 1) { b.hTo = K.h; if (steer(b, b.sx, b.sz, K.sp, dt) < 0.25) { b.n = 2; b.sacc = 1.6; } return; }
      if (b.n === 2) {
        const x0 = b.x, z0 = b.z;
        steer(b, b.x + b.sdx * 2, b.z + b.sdz * 2, K.sp, dt, Math.atan2(b.sdx, b.sdz));
        b.sacc += Math.hypot(b.x - x0, b.z - z0);
        if (b.sacc >= 1.6) { b.sacc -= 1.6; slickAt(b.x - b.sdx * 0.8, b.z - b.sdz * 0.8, b.sdx, b.sdz); b.sn++; }
        if (b.sn >= 4 || b.x <= ROOM.x0 + 0.6 || b.x >= ROOM.x1 - 0.6 || b.z <= -20.4 || b.z >= -11.9) { b.n = 3; b.t = 0; }
        return;
      }
      if (b.n === 3) { b.vx *= 0.9; b.vz *= 0.9; if (b.t > 1.6) b.n = 0; }
      return;
    }
    // courtesy (nearest person) and guardian (Luka)
    const tg = b.kind === 'guardian' ? luka : nearestPerson(b);
    b.tgt = tg; b.hTo = K.h;
    if (!tg) { b.vx *= 0.9; b.vz *= 0.9; return; }
    const L = steer(b, tg.pos.x, tg.pos.z, K.sp, dt);
    if (L < K.touch) {
      if (tg === luka) { bGo(b, 'luka'); b.slot = lukaSlotFree(); ST.touches++; snd('drone_red', b.x, b.h, b.z, 0.8); log('boss touch ' + b.kind); fire('boss:touch', b.kind); }
      else { const ch = tg === CH.chase.a ? CH.chase : CH.chase40; wrap(ch, b); }
    }
  }
  // the spawner: waves by hack %, the assist, Story Mode
  function wave() { let w = WAVES[0]; for (let i = 0; i < WAVES.length; i++) if (peak >= WAVES[i].at) w = WAVES[i]; return w; }
  function spawnTick(dt) {
    for (let i = 0; i < PEND.length; i++) {
      const p = PEND[i];
      if (!p.on) continue;
      if ((p.t -= dt) <= 0) { p.on = false; spawnDrone(p.kind, p.key); hatch(p.key, 0, 1.0); }
    }
    for (let i = 0; i < 6; i++) if (HATCH_T[i] > 0 && (HATCH_T[i] -= dt) <= 0) hatchSet(i, 0);
    const w = wave();
    if ((spawnT -= dt) > 0) return;
    let pending = 0; for (let i = 0; i < PEND.length; i++) if (PEND[i].on) pending++;
    if (aliveN() + pending >= w.max) { spawnT = 0.8; return; }
    spawnT = w.every * (story ? 2 : 1) * (assist ? 1.5 : 1) * (0.85 + rand() * 0.3);
    counts(CNT);
    let kind = 'courtesy';
    if (w.gd && CNT.guardian < w.gd && t - lastG > 9) { kind = 'guardian'; lastG = t; }
    else if (w.pp && CNT.popup < w.pp && t - lastP > 10) { kind = 'popup'; lastP = t; }
    else if (w.cl && CNT.cleaning < w.cl && t - lastC > 9) { kind = 'cleaning'; lastC = t; }
    const ports = kind === 'guardian' || kind === 'popup';
    const key = ports ? (rand() < 0.5 ? 'port_w' : 'port_e') : SPAWN_KEYS[(rand() * 4) | 0];
    for (let i = 0; i < PEND.length; i++) if (!PEND[i].on) { const p = PEND[i]; p.on = true; p.t = 0.6; p.key = key; p.kind = kind; hatch(key, 1, 0); break; }
  }
  function hatchSet(i, u) {
    if (!props) return;
    if (i < 4) { if (props.hatches) props.hatches.open(i, u); } else if (props.ports) props.ports.open(i - 4, u);
  }
  function hatch(key, u, closeIn) {
    const i = SPAWN_KEYS.indexOf(key);
    if (i < 0) return;
    if (u) { hatchSet(i, 1); HATCH_T[i] = 0; snd(i < 4 ? 'dock_clunk' : 'whoosh', spawns[key].at[0], spawns[key].at[1], spawns[key].at[2], 0.6); }
    else HATCH_T[i] = closeIn;
  }

  // ---------------------------------------------------------- slicks (the cleaning drones' polish; this file owns the physics)
  function slickAt(x, z, dx, dz) {
    const s = SL[slI]; const i = slI; slI = (slI + 1) % 4;
    const ry = Math.atan2(-dz, dx);
    s.on = true; s.x = x; s.z = z; s.c = Math.cos(ry); s.s = Math.sin(ry); s.t = SLICK;
    if (props && props.slicks) props.slicks.show(i, x, z, ry, SLICK);
    snd('glass_squeak', x, 0.3, z, 0.5);
  }
  function onSlick(x, z) {
    for (let i = 0; i < 4; i++) {
      const s = SL[i];
      if (!s.on) continue;
      const dx = x - s.x, dz = z - s.z, u = dx * s.c - dz * s.s, w = dx * s.s + dz * s.c;
      if (u > -0.95 && u < 0.95 && w > -0.42 && w < 0.42) return true;
    }
    return false;
  }

  // ---------------------------------------------------------- the Chases
  function wrap(ch, b) {
    if (ch.wrapT > 0) return;
    ch.wrapT = HUG; ch.hugB = b; b.ch = ch; bGo(b, 'hug');
    ST.wraps++;
    cancelActs(ch);
    stopAI(ch);
    snd('hug_field', ch.a.pos.x, 1, ch.a.pos.z, 0.8);
    if (ch.a.setExpr) ch.a.setExpr('scared');
    log('boss wrap ' + ch.id); fire('boss:wrap', ch.id);
  }
  function unwrap(ch) {
    if (!ch) return;
    ch.wrapT = 0;
    const b = ch.hugB; ch.hugB = null;
    if (b && b.ch === ch && b.st === 'hug') { b.ch = null; bGo(b, 'back'); const dx = b.x - ch.a.pos.x, dz = b.z - ch.a.pos.z, L = Math.hypot(dx, dz) || 1; b.bdx = dx / L; b.bdz = dz / L; }
    if (ch.a && ch.a.setExpr) ch.a.setExpr('neutral');
    if (ch === playerCh() && player.frozenT) player.frozenT = 0;
  }
  function cancelActs(ch) {   // a hug, a swap or a stall cuts a hold short (a thrown line or coat carries on)
    const tt = ch.tt;
    if (tt.st === 'bite') tetherFree(ch, false);
    if (ch.coat.st === 'charge') { ch.coat.st = 'worn'; ch.coat.charge = 0; }
    if (ch === CH.chase && WH.on) wheel(false);
  }
  function stopAI(ch) { const a = ch.a; if (a && a.mv && a.mv.on) a.place(a.pos); ch.ai.mx = ch.ai.mz = 1e9; }
  const MOVE_O = { collide: true, run: true, speed: 2.4, face: false };
  function moveAI(ch, x, z, speed = 2.4) {
    const a = ch.a, A = ch.ai, moving = !!(a.mv && a.mv.on);
    x = clamp(x, -XL, XL); z = clamp(z, ZN + 0.25, ZS);
    const dx = x - a.pos.x, dz = z - a.pos.z, L = Math.abs(dx) + Math.abs(dz), same = Math.abs(x - A.mx) + Math.abs(z - A.mz) < 0.5;
    if (L < 0.35 || (same && !moving && L < 0.75)) { if (moving) stopAI(ch); return; }
    if (A.detT > 0) return;                   // walking round something
    if (moving && same) return;
    MOVE_O.speed = speed;
    if (same && !moving) {                    // the last walk stalled against furniture or someone: step round it
      A.sideK = A.sideK > 0 ? -1 : 1;
      const n = Math.hypot(dx, dz) || 1, c = Math.cos(1.2 * A.sideK), sn = Math.sin(1.2 * A.sideK), ux = dx / n, uz = dz / n;
      MV.set(clamp(a.pos.x + (ux * c - uz * sn) * 1.8, -XL, XL), 0, clamp(a.pos.z + (ux * sn + uz * c) * 1.8, ZN + 0.25, ZS));
      A.detT = 0.8; A.mx = A.mz = 1e9;
      a.moveTo(MV, MOVE_O);
      return;
    }
    A.mx = x; A.mz = z; MV.set(x, 0, z);
    a.moveTo(MV, MOVE_O);
  }
  function faceTo(a, x, z, k) { a.rotY += angTo(a.rotY, Math.atan2(x - a.pos.x, z - a.pos.z)) * k; }
  function handPos(a, out) {
    const p = a.rig && a.rig.parts && a.rig.parts.handR;
    if (p && p.getWorldPosition) { p.getWorldPosition(out); return out; }
    return out.set(a.pos.x + Math.sin(a.rotY) * 0.3, 1.3, a.pos.z + Math.cos(a.rotY) * 0.3);
  }
  // ---- Tether (Chase)
  function tetherThrow(ch, b, ax, az) {
    const tt = ch.tt, a = ch.a;
    if (tt.st !== 'idle' || ch.cd > 0 || ch.wrapT > 0 || !a) return false;
    const tx = b ? b.x : ax, tz = b ? b.z : az;
    a.rotY = Math.atan2(tx - a.pos.x, tz - a.pos.z);
    stopAI(ch);
    a.play('tether_throw');
    tt.st = 'wind'; tt.t = 0; tt.b = b; tt.x = tx; tt.z = tz; tt.y = b ? b.h : 1.2; tt.k = 0; tt.held = 0;
    snd('tether_whip', a.pos.x, 1.4, a.pos.z, 0.8);
    log('boss tether ' + (b ? b.kind : 'miss'));
    return true;
  }
  function tetherFree(ch, yanked) {
    const tt = ch.tt, b = tt.b;
    if (b && b.st === 'snared') {
      if (yanked) {
        const a = ch.a, dx = a.pos.x - b.x, dz = a.pos.z - b.z, L = Math.hypot(dx, dz) || 1;
        if (b.kind === 'guardian' && b.shield) stripShield(b);
        else bDown(b, 'tether', (dx / L) * 2.2, (dz / L) * 2.2);
        snd('tether_yank', b.x, b.h, b.z, 1);
      } else { bGo(b, 'stun'); b.stunT = 0.35; }
    }
    tt.st = 'back'; tt.t = 0; tt.b = null; ch.cd = TETH.cd;
    if (ch.a && ch.a.anim === 'tether_yank') ch.a.play('idle');
  }
  function tetherTick(ch, dt, isPlayer) {
    const tt = ch.tt, a = ch.a;
    if (tt.st === 'idle') return;
    tt.t += dt;
    const b = tt.b;
    if (b && alive(b) && b.st !== 'snared') { tt.x = b.x; tt.z = b.z; tt.y = b.h; }
    if (tt.st === 'wind') { if (isPlayer) player.frozen(0.05); if (tt.t >= TETH.wind) { tt.st = 'fly'; tt.t = 0; } return; }
    if (tt.st === 'fly') {
      tt.k = Math.min(1, tt.t / TETH.fly);
      if (isPlayer) player.frozen(0.05);
      if (tt.k < 1) return;
      const ok = b && targetable(b) && b.st !== 'snared' && dist2(a.pos.x, a.pos.z, b.x, b.z) < (TETH.range + 1.5) * (TETH.range + 1.5);
      if (!ok) { tt.st = 'back'; tt.t = 0; tt.b = null; ch.cd = TETH.cd; snd('clunk', tt.x, 0.2, tt.z, 0.4); return; }
      if (b.ch) { unwrap(b.ch); b.ch = null; }
      if (b.lured) b.lured = false;
      bGo(b, 'snared'); b.sx = b.x; b.sz = b.z;
      tt.st = 'bite'; tt.t = 0; tt.held = 0;
      a.play('tether_yank');
      snd('tether_yank', b.x, b.h, b.z, 0.5);
      return;
    }
    if (tt.st === 'bite') {   // keep YES held to yank (AI and autoplay just do)
      if (!b || b.st !== 'snared') { tetherFree(ch, false); return; }
      faceTo(a, b.x, b.z, Math.min(1, 10 * dt));
      if (isPlayer) player.frozen(0.05);
      const holding = !isPlayer || auto || input.holding('yes');
      if (holding) tt.held += dt;
      if (tt.held >= TETH.yank) { tetherFree(ch, true); if (isPlayer) input.unlatch('yes'); return; }
      if (tt.t >= TETH.bite) tetherFree(ch, false);
      return;
    }
    if (tt.st === 'back') { tt.k = Math.max(0, 1 - tt.t / 0.2); if (tt.t >= 0.2) { tt.st = 'idle'; tt.k = 0; } }
  }
  // ---- Chip Ping (Chase (2040))
  function ping(ch) {
    const a = ch.a;
    if (!a || ch.cd2 > 0 || ch.wrapT > 0) return false;
    ch.cd2 = PING.cd;
    stopAI(ch);
    a.play('chip_ping');
    if (a.rig && a.rig.chip) a.rig.chip('ping');
    ch.pingT = 0.9;
    const M = meshes();
    M.ping.position.set(a.pos.x, 0.05, a.pos.z); M.ping.scale.setScalar(0.2); M.ping.visible = true; M.ping.userData.t = 0;
    snd('chip_zap', a.pos.x, 1.6, a.pos.z, 1);
    let n = 0;
    for (let i = LIVE.length - 1; i >= 0; i--) {
      const b = LIVE[i];
      if (!alive(b) || dist2(b.x, b.z, a.pos.x, a.pos.z) > PING.r * PING.r) continue;
      if (b.kind === 'guardian' && b.shield) { snd('glass', b.x, b.h, b.z, 0.5); b.stunT = 0; continue; }
      if (b.st === 'snared') { for (let k = 0; k < 2; k++) if (CHL[k].tt.b === b) { CHL[k].tt.st = 'back'; CHL[k].tt.t = 0; CHL[k].tt.b = null; CHL[k].cd = TETH.cd; } }
      const dx = b.x - a.pos.x, dz = b.z - a.pos.z, L = Math.hypot(dx, dz) || 1;
      puffAt(b.x, b.h, b.z, 0x8fd0ff, 10, 1.8);
      bDown(b, 'ping', (dx / L) * 1.5, (dz / L) * 1.5); n++;
    }
    if (n) snd('static_zap', a.pos.x, 1.4, a.pos.z, 0.8);
    if (ch === playerCh() && D) { floodT = PING.flood; snd('ss_chirp', null, 0, 0, 0.7); log('boss flood'); }
    log('boss ping ' + n);
    return true;
  }
  // ---- Coat (Chase (2040))
  const coatReady = (ch) => ch.coat.st === 'worn' && ch.coat.cd <= 0 && ch.wrapT <= 0;
  function coatDrop(c, x, z) {   // where the coat lands: open floor he can walk to (never behind the desk or in furniture)
    c.st = 'floor'; c.b = null; c.y = 0;
    x = clamp(x, -8.3, 10.6); z = clamp(z, -19.7, -12.3);
    if (world.resolve) { world.resolve(x, z, 0.5, V2); x = V2.x; z = V2.z; }
    c.x = x; c.z = z;
  }
  function coatThrow(ch, b) {
    const c = ch.coat, a = ch.a;
    if (!a || !b || !coatReady(ch)) return false;
    a.rotY = Math.atan2(b.x - a.pos.x, b.z - a.pos.z);
    stopAI(ch);
    a.play('coat_throw');
    if (a.rig && a.rig.show) { a.rig.show('coat', false); a.rig.show('collar_up', false); }
    c.st = 'fly'; c.t = 0; c.b = b; c.cd = COAT.cd; c.charge = 0;
    c.x0 = a.pos.x + Math.sin(a.rotY) * 0.3; c.y0 = 1.5; c.z0 = a.pos.z + Math.cos(a.rotY) * 0.3; c.x = b.x; c.y = b.h; c.z = b.z;
    snd('coat_whoosh', a.pos.x, 1.4, a.pos.z, 1);
    log('boss coat ' + b.kind);
    return true;
  }
  function coatTick(ch, dt, isPlayer) {
    const c = ch.coat, a = ch.a;
    if (c.cd > 0) c.cd -= dt;
    if (c.st === 'charge') {
      if (!isPlayer || auto) return;
      const b = AIM.b;
      if (!input.holding('yes')) { c.st = 'worn'; if (c.charge < 0.18) c.tap = 1.4; c.charge = 0; return; }
      c.charge += dt;
      if (c.charge >= COAT.hold) { input.unlatch('yes'); if (b && AIM.ok) coatThrow(ch, b); else { c.st = 'worn'; c.charge = 0; snd('clunk', null, 0, 0, 0.4); } }
      return;
    }
    if (c.st === 'fly') {
      c.t += dt;
      const b = c.b;
      if (b && alive(b)) { c.x = b.x; c.y = b.h; c.z = b.z; }
      if (c.t < COAT.fly) return;
      if (!b || !alive(b) || b.st === 'blind') { coatDrop(c, c.x, c.z); snd('cloth_swish', c.x, 0.3, c.z, 0.6); return; }
      if (b.ch) { unwrap(b.ch); b.ch = null; }
      ST.coat++;
      if (b.kind === 'guardian' && b.shield) { stripShield(b); coatDrop(c, b.x, b.z); return; }
      if (b.st === 'snared') for (let k = 0; k < 2; k++) if (CHL[k].tt.b === b) { CHL[k].tt.st = 'back'; CHL[k].tt.t = 0; CHL[k].tt.b = null; CHL[k].cd = TETH.cd; }
      const dx = b.x - a.pos.x, dz = b.z - a.pos.z, L = Math.hypot(dx, dz) || 1;
      b.lured = false; bGo(b, 'blind'); b.bdx = dx / L; b.bdz = dz / L; bLight(b, 'off'); coneVis(b, false);
      c.st = 'on'; snd('cloth_swish', b.x, b.h, b.z, 0.9);
      return;
    }
    if (c.st === 'on') { const b = c.b; if (!b || !alive(b)) coatDrop(c, c.x, c.z); else { c.x = b.x; c.z = b.z; } return; }
    if (c.st === 'floor' && a && dist2(a.pos.x, a.pos.z, c.x, c.z) < 0.95 * 0.95 && ch.wrapT <= 0) {   // he picks it back up
      c.st = 'worn';
      if (a.rig && a.rig.show) { a.rig.show('coat', true); a.rig.show('collar_up', true); }
      snd('cloth_swish', a.pos.x, 1, a.pos.z, 0.8);
      log('boss coat back');
    }
  }
  // ---- Lure (Chase): one out at a time
  function lureList() {
    const L = WH.list; L.length = 0;
    const s = state.samples || [];
    for (let i = 0; i < s.length; i++) if (typeof SAMPLES !== 'undefined' && SAMPLES[s[i]] && L.indexOf(s[i]) < 0) L.push(s[i]);
    if (!L.length) { if (SAMPLES.laugh) L.push('laugh'); else if (SAMPLES.radio) L.push('radio'); }
    return L;
  }
  function lureThrow(ch, id, x, z) {
    const a = ch.a;
    if (!a || LU.on || LU.cd > 0 || ch.wrapT > 0 || typeof SAMPLES === 'undefined' || !SAMPLES[id]) return false;
    const S = SAMPLES[id], lr = S.lure || { r: 5, dur: 4 };
    LU.on = true; LU.fly = 0.45; LU.x0 = a.pos.x; LU.z0 = a.pos.z; LU.x = clamp(x, -XL, XL); LU.z = clamp(z, ZN, ZS);
    LU.r = Math.max(3.5, lr.r); LU.dur = Math.max(3, lr.dur); LU.t = 0; LU.id = id; LU.label = '♪ ' + S.label; LU.sfx = S.sfx || ''; LU.rep = 0;
    a.rotY = Math.atan2(LU.x - a.pos.x, LU.z - a.pos.z);
    stopAI(ch);
    a.play('push', { loop: false, dur: 0.45 });
    snd('whoosh', a.pos.x, 1.2, a.pos.z, 0.6);
    ST.lures++;
    log('boss lure ' + id);
    return true;
  }
  function lureTick(dt) {
    if (LU.cd > 0) LU.cd -= dt;
    if (!LU.on) return;
    const M = meshes();
    if (LU.fly > 0) {
      if ((LU.fly -= dt) > 0) return;
      LU.fly = 0;
      snd('pop', LU.x, 0.2, LU.z, 0.7); puffAt(LU.x, 0.2, LU.z, 0xffd21f, 10, 1.2);
      let n = 0;
      for (let i = 0; i < LIVE.length; i++) {
        const b = LIVE[i];
        if (!alive(b) || b.st === 'blind' || b.st === 'snared' || (b.st === 'enter' && b.h > 3.6)) continue;
        if (dist2(b.x, b.z, LU.x, LU.z) > LU.r * LU.r) continue;
        if (b.ch) { unwrap(b.ch); b.ch = null; }
        b.lured = true; b.lureEnd = t + LU.dur; bGo(b, 'lured'); bLight(b, 'white'); n++;
        const u = b.d && b.d.obj && b.d.obj.userData; if (u && u.setBeam) u.setBeam(false);
      }
      M.lure.position.set(LU.x, 0.04, LU.z); M.lure.visible = true; M.lure2.position.set(LU.x, 0.04, LU.z); M.lure2.visible = true;
      log('boss lured ' + n);
    }
    LU.t += dt;
    if ((LU.rep -= dt) <= 0) { LU.rep = 1.9; if (LU.sfx) snd(LU.sfx, LU.x, 0.4, LU.z, 0.9); }
    if (LU.t >= LU.dur) { LU.on = false; LU.cd = 3; M.lure.visible = false; M.lure2.visible = false; }
  }
  // ---- the Lure wheel
  function wheel(on) {
    if (on === WH.on) return;
    WH.on = on; WH.t = 0;
    if (on) { lureList(); if (WH.last >= 0 && WH.last < WH.list.length) WH.i = WH.last; else WH.i = Math.max(0, WH.list.indexOf('laugh')); snd('pop', null, 0, 0, 0.4); }
  }
  function lurePoint(ch, out) {   // 4.5 m ahead, or where the mouse points on the floor
    const a = ch.a;
    if (mouseT > 0 && input.scheme === 'kb' && floorAt(input.pointer.x, input.pointer.y, out) && dist2(out.x, out.z, a.pos.x, a.pos.z) < 81) return out;
    out.set(a.pos.x + Math.sin(a.rotY) * 4.5, 0, a.pos.z + Math.cos(a.rotY) * 4.5);
    return out;
  }
  function wheelInput(ch) {
    const n = WH.list.length;
    if (!n) { wheel(false); return; }
    player.frozen(0.05);
    if (input.pressed('left') || input.pressed('up')) { input.consume('left'); input.consume('up'); WH.i = (WH.i + n - 1) % n; snd('tick', null, 0, 0, 0.3); }
    if (input.pressed('right') || input.pressed('down')) { input.consume('right'); input.consume('down'); WH.i = (WH.i + 1) % n; snd('tick', null, 0, 0, 0.3); }
    if (Math.hypot(input.move.x, input.move.y) > 0.7) {   // the stick points at a slot
      const ang = Math.atan2(input.move.x, input.move.y), k = (Math.round(((ang + TAU) % TAU) / TAU * n) % n);
      if (k !== WH.i) { WH.i = k; snd('tick', null, 0, 0, 0.3); }
    }
    if ((input.pointer.pressed || mouseT > 0) && wheelHit(ch) >= 0) WH.i = wheelHit(ch);
    if (input.pressed('yes')) {
      input.consume('yes');
      const id = WH.list[WH.i]; WH.last = WH.i;
      lurePoint(ch, V1);
      wheel(false);
      lureThrow(ch, id, V1.x, V1.z);
      return;
    }
    if (input.pressed('no') || input.pressed('inventory')) { input.consume('no'); input.consume('inventory'); wheel(false); }
  }
  let WCX = 0, WCY = 0;
  function wheelHit() {   // the slot under the pointer (CSS px), or -1
    const n = WH.list.length, dx = input.pointer.x - WCX, dy = input.pointer.y - WCY, r = Math.hypot(dx, dy);
    if (r < 30 || r > 170 || !n) return -1;
    const ang = Math.atan2(dx, -dy);
    return Math.round(((ang + TAU) % TAU) / TAU * n) % n;
  }
  function floorAt(px, py, out) {   // the floor point under a screen point (CSS px), false above the horizon
    const c = cam.camera;
    if (!c) return false;
    V2.set((px / innerWidth) * 2 - 1, -(py / innerHeight) * 2 + 1, 0.5).unproject(c);
    V2.sub(c.position);
    if (V2.y > -0.02) return false;
    const k = -c.position.y / V2.y;
    out.set(c.position.x + V2.x * k, 0, c.position.z + V2.z * k);
    return true;
  }

  // ---- aiming (the player): the stick's facing cone, or the drone nearest the mouse / the tap
  function aim(ch, range) {
    const a = ch.a;
    let best = null, bs = 1e9;
    const ptr = (mouseT > 0 && input.scheme === 'kb') || (input.scheme === 'touch' && input.pointer.pressed);
    for (let i = 0; i < LIVE.length; i++) {
      const b = LIVE[i];
      if (!targetable(b) || b.st === 'snared') continue;
      const dx = b.x - a.pos.x, dz = b.z - a.pos.z, L = Math.hypot(dx, dz);
      if (L > range + 3) continue;
      let s;
      if (ptr) {
        V2.set(b.x, b.h + 0.3, b.z); const p = cam.project(V2);
        if (!p.visible) continue;
        s = Math.hypot(p.x - input.pointer.x, p.y - input.pointer.y);
        if (s > 170) continue;
      } else {
        const ang = Math.abs(angTo(a.rotY, Math.atan2(dx, dz)));
        s = ang > 1.05 ? 1000 + L : L * (1 + ang * 1.6);
      }
      if (L > range) s += 2000;
      if (s < bs) { bs = s; best = b; }
    }
    AIM.b = best; AIM.ok = !!best && dist2(best.x, best.z, a.pos.x, a.pos.z) <= range * range;
    return best;
  }

  // ---- the AI Chase (and both under autoplay): the drone nearest Luka, always
  function nearestLuka(skip) {
    let best = null, bd = 1e9;
    const lx = luka ? luka.pos.x : 0, lz = luka ? luka.pos.z : -16.2;
    for (let i = 0; i < LIVE.length; i++) {
      const b = LIVE[i];
      if (!targetable(b) || b === skip || b.st === 'snared' || b.lured) continue;
      let d = dist2(b.x, b.z, lx, lz);
      if (b.st === 'hug' && b.ch && b.ch.a) d *= 0.5;   // a wrapped partner counts as urgent
      if (d < bd) { bd = d; best = b; }
    }
    return best;
  }
  function nearestTo(ax, az, skip) {
    let best = null, bd = 1e9;
    for (let i = 0; i < LIVE.length; i++) { const b = LIVE[i]; if (!targetable(b) || b === skip || b.st === 'snared' || b.lured) continue; const d = dist2(b.x, b.z, ax, az); if (d < bd) { bd = d; best = b; } }
    return best;
  }
  function aiTick(ch, dt, partnerB, isAutoPlayer) {
    const A = ch.ai, a = ch.a;
    if (!a) return;
    if (A.lureCd > 0) A.lureCd -= dt;
    if (A.detT > 0) A.detT -= dt;
    if (ch.wrapT > 0 || ch.tt.st !== 'idle' || ch.coat.st === 'charge') return;
    if ((A.t -= dt) > 0) return;
    A.t = 0.25;
    // the drone nearest Luka (the active player's autoplayer takes the next one so they don't both chase one)
    let b = isAutoPlayer ? nearestTo(a.pos.x, a.pos.z, partnerB) : nearestLuka(null);
    if (isAutoPlayer && !b) b = nearestLuka(null);
    A.b = b;
    const lx = luka ? luka.pos.x : 0, lz = luka ? luka.pos.z : -16.2;
    if (!ch.c40) {
      // lure: a cleaning drone about, or a crowd on Luka
      let crowd = 0; for (let i = 0; i < LIVE.length; i++) { const o = LIVE[i]; if (alive(o) && !o.lured && dist2(o.x, o.z, lx, lz) < 16) crowd++; }
      counts(CNT);
      let cl = null; for (let i = 0; i < LIVE.length; i++) { const o = LIVE[i]; if (o.kind === 'cleaning' && o.st === 'seek' && o.n === 2) cl = o; }
      if (!LU.on && LU.cd <= 0 && A.lureCd <= 0 && (crowd >= 3 || cl)) {
        const L = lureList();
        let id = L[0]; for (let i = 0; i < L.length; i++) if (L[i] === 'laugh') id = 'laugh';
        // at a polishing drone: 2.5 m past it, away from Luka; a crowd: 4.5 m out from Luka toward them
        let cx = 0, cz = 0, n = 0, k = 4.5;
        if (cl) { cx = cl.x - lx; cz = cl.z - lz; n = 1; k = Math.hypot(cx, cz) + 2.5; }
        else { for (let i = 0; i < LIVE.length; i++) { const o = LIVE[i]; if (alive(o)) { cx += o.x; cz += o.z; n++; } } cx = n ? cx / n - lx : 1; cz = n ? cz / n - lz : 1; }
        const L2 = Math.hypot(cx, cz) || 1;
        if (lureThrow(ch, id, lx + (cx / L2) * k, lz + (cz / L2) * k)) { A.lureCd = 20; return; }
      }
      if (!b) { A.ready = 0; moveAI(ch, lx - 2.2, lz - 1.3, 2.2); return; }
      const d = Math.sqrt(dist2(a.pos.x, a.pos.z, b.x, b.z));
      if (d <= TETH.range - 1.5 && ch.cd <= 0 && b.st !== 'enter') {
        if (a.mv && a.mv.on) stopAI(ch);
        faceTo(a, b.x, b.z, 0.5);
        if ((A.ready += 0.25) >= 0.75) { A.ready = 0; tetherThrow(ch, b); }
        return;
      }
      A.ready = 0;
      const k = d > 3.5 ? (d - 3.5) / d : 0;
      moveAI(ch, a.pos.x + (b.x - a.pos.x) * k, a.pos.z + (b.z - a.pos.z) * k);
      return;
    }
    // Chase (2040)
    const c = ch.coat;
    if (c.st === 'floor' && (!b || dist2(b.x, b.z, lx, lz) > 9 || !coatReady(ch))) { moveAI(ch, c.x, c.z); return; }
    if (!b) { A.ready = 0; moveAI(ch, lx + 2.2, lz - 1.3, 2.2); return; }
    const d = Math.sqrt(dist2(a.pos.x, a.pos.z, b.x, b.z));
    let inPing = 0; for (let i = 0; i < LIVE.length; i++) { const o = LIVE[i]; if (alive(o) && !(o.kind === 'guardian' && o.shield) && dist2(o.x, o.z, a.pos.x, a.pos.z) < (PING.r - 0.5) * (PING.r - 0.5)) inPing++; }
    if (ch.cd2 <= 0 && inPing >= 1) { if ((A.ready += 0.25) >= 0.75) { A.ready = 0; ping(ch); } faceTo(a, b.x, b.z, 0.5); if (a.mv && a.mv.on) stopAI(ch); return; }
    if (coatReady(ch) && d < COAT.range - 0.8 && b.st !== 'enter' && (ch.cd2 > 1.5 || d > PING.r)) { if ((A.ready += 0.25) >= 1.0) { A.ready = 0; coatThrow(ch, b); } faceTo(a, b.x, b.z, 0.5); if (a.mv && a.mv.on) stopAI(ch); return; }
    A.ready = 0;
    const k = d > 2.4 ? (d - 2.4) / d : 0;
    moveAI(ch, a.pos.x + (b.x - a.pos.x) * k, a.pos.z + (b.z - a.pos.z) * k);
  }
  // slick physics + the soft north boundary + timers, for both Chases
  function chaseTick(ch, dt, isPlayer) {
    const a = ch.a;
    if (!a) return;
    if (ch.cd > 0) ch.cd -= dt;
    if (ch.cd2 > 0) ch.cd2 -= dt;
    if (ch.coat.tap > 0) ch.coat.tap -= dt;
    if (ch.pingT > 0 && (ch.pingT -= dt) <= 0 && a.rig && a.rig.chip) a.rig.chip(state.flags && state.flags.chip_off ? 'off' : 'on');
    if (ch.wrapT > 0) { ch.wrapT -= dt; if (isPlayer) player.frozen(0.05); if (ch.wrapT <= 0) unwrap(ch); }
    // slip: momentum on a polished streak (input barely steers)
    const vx = (a.pos.x - ch.lx) / dt, vz = (a.pos.z - ch.lz) / dt, on = onSlick(a.pos.x, a.pos.z);
    if (on && !ch.slick) { ch.slipX = vx * 0.9; ch.slipZ = vz * 0.9; if (Math.hypot(vx, vz) > 1.2) snd('glass_squeak', a.pos.x, 0.2, a.pos.z, 0.6); }
    ch.slick = on;
    if (on) { const f = 1 - 0.4 * dt; ch.slipX *= f; ch.slipZ *= f; } else { const f = Math.max(0, 1 - 7 * dt); ch.slipX *= f; ch.slipZ *= f; }
    if (Math.abs(ch.slipX) + Math.abs(ch.slipZ) > 0.05) {
      const x0 = a.pos.x, z0 = a.pos.z;
      world.collide(a, x0 + ch.slipX * dt, z0 + ch.slipZ * dt);
      if (Math.abs(a.pos.x - x0 - ch.slipX * dt) > 1e-3) ch.slipX *= -0.3;
      if (Math.abs(a.pos.z - z0 - ch.slipZ * dt) > 1e-3) ch.slipZ *= -0.3;
    }
    if (isPlayer) player.speedMul = on ? 0.3 : 1;
    if (a.pos.z < ZN) a.pos.z += (ZN - a.pos.z) * Math.min(1, 10 * dt);   // the north strip is off (the rail camera)
    ch.lx = a.pos.x; ch.lz = a.pos.z;
    if (!ch.c40) tetherTick(ch, dt, isPlayer); else coatTick(ch, dt, isPlayer);
  }

  // ---------------------------------------------------------- SWAP
  function swapTo(id) {
    const prev = state.active;
    if (id === prev || !actorOf(id)) return;
    const pc = CH[prev];
    if (pc) { cancelActs(pc); hzClear(); floodClear(); }
    state.active = id;
    player.control(id); player.frozenT = 0; player.speedMul = 1;
    const ch = CH[id];
    if (ch) { stopAI(ch); ch.ai.t = 0; }
    player.enabled = !auto && !!ch;
    if (ch) { const o = id === 'chase' ? 'chase40' : 'chase'; ui.swapIndicator(id, stall ? 'luka' : o); }
    snd('swap_whoosh', null, 0, 0, 0.6);
    ST.swaps++;
    log('boss swap ' + id); fire('swap', id);
  }

  // ---------------------------------------------------------- the bug stalls
  function stallStart(pct, bug) {
    stall = { pct, bug }; stallT = 0; ST.stalls++;
    hack = pct;
    if (api.hud) api.hud.hack(hack, HK_STALL);
    hudStall = true;
    if (props && props.console) props.console.screen('stall', pct);
    stallPop(bug);
    snd('sad_beep', null, 0, 0, 0.6); snd('ss_chirp', null, 0, 0, 0.5);
    ui.prompt('SWAP — Luka');
    const ch = activeCh(); ui.swapIndicator(ch.id, 'luka');
    const L = STALL_LINES[bug];
    if (L && P.lines !== false) for (let i = 0; i < L.length; i++) barkL(L[i][0], L[i][1]);
    log('boss stall ' + bug); fire('boss:stall', { pct, bug });
  }
  function stallSwap() {   // SWAP — Luka: the single Hack pop-up, full screen
    if (!stall || hk || phase !== 'fight') return;
    hkFrom = state.active === 'chase40' ? 'chase40' : 'chase';
    cancelActs(CH[hkFrom]); hzClear(); floodClear(); chipable(false);
    if (WH.on) wheel(false);
    state.active = 'luka'; player.control('luka'); player.enabled = false; player.frozenT = 0;
    ui.prompt(null); ui.swapIndicator('luka', hkFrom); stallPop(null);
    snd('swap_whoosh', null, 0, 0, 0.6);
    for (let i = 0; i < 2; i++) stopAI(CHL[i]);
    domOn(false);
    const me = run, bug = stall.bug;
    log('boss swap luka');
    fire('swap', 'luka');
    const M = typeof MINIGAMES !== 'undefined' && MINIGAMES.hack;
    if (M && typeof M.embed === 'function') {
      hk = M.embed(api, { bug, time: clockStr() });
      phase = 'card'; opq = 0.6;
      hk.done.then(() => { if (run === me) stallDone(bug); });
    } else { phase = 'card'; hk = null; opq = 0; stallT = 0; }   // no Hack game built: a beat at the console, then on
  }
  function stallDone(bug) {
    if (phase !== 'card') return;
    hk = null;
    if (api.opaque) api.opaque(false);
    phase = 'fight';
    stall = null; hudStall = false;
    if (api.hud) api.hud.hack(hack, null);
    domOn(true);
    state.active = 'luka';
    swapTo(hkFrom);
    snd('access_granted', null, 0, 0, 0.5);
    log('boss stall done ' + bug); fire('boss:stall_done', bug);
  }
  let clkStr = '';
  function clockStr() { const T = 11 * 3600 + 58 * 60 - Math.round(q); const hh = Math.floor(T / 3600), mm = Math.floor(T / 60) % 60; clkStr = hh + ':' + (mm < 10 ? '0' : '') + mm; return clkStr; }

  // ---------------------------------------------------------- the hack, its HUD, the lines, the clock
  function lines(pct) {
    lineI++;
    if (pct === 50) lightning();
    if (P.lines === false) return;
    const L = LINES[lineI - 1][1], me = run;
    let prev = null;
    for (let i = 0; i < L.length; i++) {   // Future Luka turns to whoever he's talking to as his line comes up
      const ln = L[i], to = ln[3];
      if (ln[0] === 'luka40' && to && l40 && actorOf(to)) {
        if (!prev) l40.face(to, 0.6);
        else prev.then(() => { if (run === me && l40 && phase === 'fight') l40.face(to, 0.6); });
      }
      prev = barkL(ln[0], ln[1], ln[2]);
    }
    if (pct === 75 && l40) { if (l40.setExpr) l40.setExpr('tearful'); if (ANIMS.hands_halt) l40.play('hands_halt'); }
    if (pct === 65 && CH.chase40.a && CH.chase40.a.setExpr) CH.chase40.a.setExpr('determined');
    log('boss line ' + pct); fire('boss:line', pct);
  }
  function lightning() {
    const S = typeof SETS !== 'undefined' && SETS.hq_top;
    if (!options.reduceFlashing) { world.env('storm_flash'); world.env('boss', 0.5); }
    if (S && S.flash) S.flash(1);
    if (props && props.lights && !options.reduceFlashing) props.lights.flicker(1.2);
    snd('thunder', null, 0, 0, 1);
    log('boss lightning');
  }
  function hackTick(dt) {
    onLuka = 0;
    for (let i = 0; i < LIVE.length; i++) if (LIVE[i].st === 'luka') onLuka++;
    if (onLuka && !wasOn) { if (luka && luka.setExpr) luka.setExpr('scared'); }
    else if (!onLuka && wasOn) { if (luka && luka.setExpr) luka.setExpr('neutral'); }
    wasOn = onLuka > 0;
    if (!stall) {
      if (onLuka) hack = Math.max(0, hack - backRate * dt);
      else hack = Math.min(goal, hack + rate * dt);
      if (hack > peak) peak = hack;
      if (stallI < STALLS.length && hack >= STALLS[stallI][0]) { stallStart(STALLS[stallI][0], STALLS[stallI][1]); stallI++; }
      while (lineI < LINES.length && peak >= LINES[lineI][0]) lines(LINES[lineI][0]);
    }
    // assist: the hack fell > 10% within the last 60 s -> spawns slow by a third until it climbs back
    if ((histT += dt) >= 1) { histT -= 1; HIST[histI] = hack; histI = (histI + 1) % HIST.length; }
    let mx = 0; for (let i = 0; i < HIST.length; i++) if (HIST[i] > mx) mx = HIST[i];
    if (!assist && mx - hack > 10) { assist = true; assistRef = mx; log('boss assist on'); }
    else if (assist && hack >= assistRef - 2) { assist = false; log('boss assist off'); }
    // the "Skip this?" offer: sitting near 0, or no new ground for a long time
    if (!auto) {
      if (hack < 1 && !stall) { if ((zeroT += dt) >= 45) { zeroT = 0; fails++; api.fail(); log('boss fail zero'); } } else zeroT = 0;
      if (peak > flatPeak + 0.5) { flatPeak = peak; flatT = 0; } else if ((flatT += dt) >= 120) { flatT = 0; fails++; api.fail(); log('boss fail flat'); }
    }
    // cosmetic countdown: 15:00 -> 04:00 by 85% (never runs backwards)
    const span = 660 * (1 - (peak - from0) / Math.max(1, goal - from0));
    const lo = 240 + span - 20, hi = 240 + span + 30;
    q = clamp(q - dt * 2.2, lo, hi); if (q > qShown && qShown >= 0) q = Math.min(q, qShown);
    hudTick();
    if (hack >= goal) done();
  }
  function hudTick() {
    const back = onLuka > 0 && !stall;
    if (api.hud) {
      hudBack = back; hudStall = stall != null;
      api.hud.hack(hack, hudStall ? HK_STALL : back ? HK_BACK : null);
    }
    const s = Math.ceil(q);
    if (s !== qShown) {
      qShown = s;
      if (api.hud && api.hud.quiet) api.hud.quiet(s);
      if (props && props.glass) { const T = 11 * 3600 + 58 * 60 - s; CLK.h = Math.floor(T / 3600); CLK.m = Math.floor(T / 60) % 60; CLK.s = T % 60; CLK.quiet = s; props.glass.clock(CLK); }
    }
    const p = Math.floor(hack);
    if (p !== pctShown) {
      pctShown = p;
      if (props && props.console && !stall) props.console.screen('hack', p);
      if (props && props.phone) props.phone.screen('hack', p);
    }
  }

  // ---------------------------------------------------------- input (the player's Chase)
  function inputTick(dt) {
    const p = input.pointer;
    if (p.x !== pmx || p.y !== pmy) { if (input.scheme === 'kb') mouseT = 2.5; pmx = p.x; pmy = p.y; }
    else if (mouseT > 0) mouseT -= dt;
    if (input.pressed('swap')) {
      input.consume('swap');
      if (stall) stallSwap();
      else swapTo(state.active === 'chase' ? 'chase40' : 'chase');
      return;
    }
    if (input.pressed('no') && D && hzCount() && !WH.on) { input.consume('no'); hzOff(hzNewest()); }
    const ch = playerCh();
    if (!ch || !ch.a) return;
    if (ch.wrapT > 0) { AIM.b = null; if (input.pressed('yes')) input.consume('yes'); return; }
    if (!ch.c40) {
      if (WH.on) { wheelInput(ch); return; }
      aim(ch, TETH.range);
      if (input.pressed('yes')) {
        input.consume('yes');
        if (ch.tt.st === 'idle' && ch.cd <= 0) {
          if (AIM.b && AIM.ok) tetherThrow(ch, AIM.b);
          else { lurePoint(ch, V1); const a = ch.a, dx = V1.x - a.pos.x, dz = V1.z - a.pos.z, L = Math.hypot(dx, dz) || 1; tetherThrow(ch, null, a.pos.x + (dx / L) * 4, a.pos.z + (dz / L) * 4); }
        }
      }
      if (input.pressed('inventory')) { input.consume('inventory'); if (!LU.on && LU.cd <= 0 && ch.tt.st === 'idle') wheel(true); else snd('clunk', null, 0, 0, 0.4); }
      return;
    }
    aim(ch, COAT.range);
    if (input.pressed('chip')) { input.consume('chip'); if (!ping(ch)) snd('clunk', null, 0, 0, 0.35); }
    const c = ch.coat;
    if (c.st === 'worn' && input.pressed('yes')) {
      input.consume('yes');
      if (coatReady(ch)) { c.st = 'charge'; c.charge = 0; snd('cloth_swish', ch.a.pos.x, 1.2, ch.a.pos.z, 0.4); }
      else { snd('clunk', null, 0, 0, 0.35); c.tap = 1.6; }
    }
  }
  // the autoplayer (deterministic): swaps, the Lure wheel once, pop-ups dismissed, SWAP to Luka at each stall
  function autoTick(dt) {
    if (stall && phase === 'fight' && (stallT += dt) >= 1.4) { stallSwap(); return; }
    if (D) for (let i = 0; i < 4; i++) { const b = D.hz[i]; if (b.on && b.t > 0.7) hzOff(i); }
    if (!stall && (swapT -= dt) <= 0) { swapT = 14; swapTo(state.active === 'chase' ? 'chase40' : 'chase'); }
    if (state.active === 'chase' && peak >= nextWheelAuto && !LU.on && LU.cd <= 0 && CH.chase.wrapT <= 0 && CH.chase.tt.st === 'idle') {
      if (!WH.on) { wheel(true); WH.t = 0; }
      else if ((WH.t += dt) > 0.6) {
        const ch = CH.chase, id = WH.list[WH.i], b = nearestLuka(null); nextWheelAuto = 999;
        wheel(false); lureThrow(ch, id, b ? b.x : ch.a.pos.x + Math.sin(ch.a.rotY) * 4.5, b ? b.z : ch.a.pos.z + Math.cos(ch.a.rotY) * 4.5);
      }
    }
  }

  // ---------------------------------------------------------- the camera (bossCam over a mutated 'fixed' override)
  function camTick(dt, cut) {
    const ch = activeCh(), a = ch.a;
    if (!a) return;
    const BC = bossCam, rail = BC && BC.rail, off = (BC && BC.offset) || 3.2, ease = (BC && BC.sideEase) || 1.2;
    const con = (BC && BC.console) || CONSOLE;
    const z = a.pos.z, mix = ((BC && BC.mix) || 0.5) + 0.3 * sm((-18.4 - z) / 2.0);
    const tx = con[0] + (a.pos.x - con[0]) * mix, tz = con[2] + (z - con[2]) * mix;
    side += clamp(sideTo - side, (-2 / ease) * dt, (2 / ease) * dt);
    if (cut) side = sideTo;
    const Lx = clamp(tx - off * side, rail ? rail.x0 : -8.5, rail ? rail.x1 : 8.5), Ly = rail ? rail.y : 4.8, Lz = rail ? rail.z : -22.6;
    // aim between the two (by angle, so neither falls off an edge) and widen the lens when they're far apart
    const lx = luka ? luka.pos.x : con[0], lz = luka ? luka.pos.z : con[2];
    const yc = Math.atan2(a.pos.x - Lx, a.pos.z - Lz), d = angTo(yc, Math.atan2(lx - Lx, lz - Lz)), ym = yc + d * 0.5;
    const dist = Math.max(3, Math.hypot(tx - Lx, tz - Lz));
    CAMO.pos[0] = Lx; CAMO.pos[1] = Ly; CAMO.pos[2] = Lz;
    CAMO.look[0] = Lx + Math.sin(ym) * dist; CAMO.look[1] = con[1]; CAMO.look[2] = Lz + Math.cos(ym) * dist;
    const f0 = (BC && BC.fov) || 60, need = Math.min(2.6, Math.abs(d) + 0.55);   // horizontal radians (+ ~16 deg each side)
    const vf = clamp((2 * Math.atan(Math.tan(need / 2) / (16 / 9)) * 180) / PI, f0, 74);
    CAMO.fov = cut ? vf : CAMO.fov + (vf - CAMO.fov) * Math.min(1, dt * 1.5);
  }

  // ---------------------------------------------------------- finish
  function liveDrones() {
    const out = [];
    for (let i = 0; i < LIVE.length; i++) { const b = LIVE[i]; if (b.st !== 'down') out.push(+b.x.toFixed(2), +(b.h + (world.floorAt ? world.floorAt(b.x, b.z) || 0 : 0)).toFixed(2), +b.z.toFixed(2)); }
    return out;
  }
  function freeze() {   // the fight stops where it is: live drones hang (3.5 seeds the galaxy from them), downed ones go
    for (let i = LIVE.length - 1; i >= 0; i--) {
      const b = LIVE[i];
      if (b.st === 'down' || P.clearDrones) { bRemove(b); continue; }
      b.vx = b.vz = 0; if (b.st === 'enter') { b.h = b.hTo = b.ey; }
      const u = b.d && b.d.obj && b.d.obj.userData; if (u && u.setBeam) u.setBeam(false);
      bLight(b, b.K.light);
      bPut(b);
    }
  }
  function done() {
    if (phase !== 'fight') return;
    phase = 'done';
    hack = goal;
    if (api.hud) { api.hud.hack(goal, null); if (api.hud.quiet) api.hud.quiet(240); }
    q = 240; qShown = -1; hudTick();
    const drones = liveDrones();
    const r = { done: true, hack: goal, time: +t.toFixed(1), stalls: ST.stalls, touches: ST.touches, wraps: ST.wraps, downs: ST.downs,
      by: { tether: ST.tether, ping: ST.ping, coat: ST.coat, wall: ST.wall }, lures: ST.lures, swaps: ST.swaps, fails, drones };
    log('boss done ' + Math.round(t) + 's downs ' + ST.downs + ' touches ' + ST.touches);
    fire('boss:done', r);
    api.finish(r);
  }
  function cleanup(r) {
    if (phase === 'end') return;
    const wasCard = phase === 'card';
    phase = 'end'; run++;
    if (hk && hk.active) hk.end(); hk = null;
    if (wasCard && api && api.opaque) api.opaque(false);
    if (r && r.skipped) { hack = goal; if (api && api.hud) { api.hud.hack(goal, null); if (api.hud.quiet) api.hud.quiet(240); } if (props && props.console) props.console.screen('hack', goal); if (props && props.phone) props.phone.screen('hack', goal); }
    for (let k = 0; k < 2; k++) {
      const ch = CHL[k], a = ch.a;
      if (!a) continue;
      if (ch.tt.b && ch.tt.b.st === 'snared') bGo(ch.tt.b, 'seek');
      ch.tt.st = 'idle'; ch.tt.b = null; ch.wrapT = 0; ch.hugB = null;
      if (ch.coat.st !== 'worn' && a.rig && a.rig.show) { a.rig.show('coat', true); a.rig.show('collar_up', true); }
      ch.coat.st = 'worn'; ch.coat.b = null;
      if (a.mv && a.mv.on && a.set) a.place(a.pos);
      if (a.anim === 'tether_yank') a.play('idle');
      if (a.setExpr) a.setExpr('neutral');
      if (a.rig && a.rig.chip && ch.c40) a.rig.chip(state.flags && state.flags.chip_off ? 'off' : 'on');
    }
    if (typeof DRONES !== 'undefined') freeze();
    if (LU.on) LU.on = false;
    WH.on = false;
    meshesAdd(false);
    if (D) { floodClear(); domDetach(); }
    chipable(false);
    if (typeof ui !== 'undefined') { ui.prompt(null); ui.swapIndicator(null); }
    player.enabled = false; player.speedMul = 1; player.frozenT = 0;
    if (state.active === 'luka') { state.active = hkFrom; if (actorOf(hkFrom)) player.control(hkFrom); }
    for (let i = 0; i < 6; i++) { hatchSet(i, 0); HATCH_T[i] = 0; }
    for (let i = 0; i < PEND.length; i++) PEND[i].on = false;
    if (!P.keepCam && typeof cam !== 'undefined') cam.override(null, { ease: r && r.done ? 0 : 0.6 });
    if (P.music !== false && P.musicOut !== false && typeof music === 'function' && !(r && r.aborted)) music(null, { fade: 1.4 });
    if (api && api.overlay) { const c = api.overlay.ctx; c.clearRect(0, 0, api.overlay.w, api.overlay.h); }
  }

  // ---------------------------------------------------------- the overlay (aim, wraps, the lure, the wheel, the coat)
  let SX = 0, SY = 0;
  function proj(x, y, z) { V2.set(x, y, z); const p = cam.project(V2); SX = p.x; SY = p.y; return p.visible; }
  const WCACHE = new Map();
  function textW(c, s) { let w = WCACHE.get(s); if (w == null) { w = c.measureText(s).width; WCACHE.set(s, w); } return w; }
  function tag(c, x, y, s, fg, bg) {
    const w = textW(c, s) + 14;
    c.fillStyle = bg; c.beginPath(); if (c.roundRect) c.roundRect(x - w / 2, y - 11, w, 20, 10); else c.rect(x - w / 2, y - 11, w, 20); c.fill();
    c.fillStyle = fg; c.fillText(s, x, y);
  }
  function arc(c, x, y, r, k, col, lw) { c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.arc(x, y, r, -H, -H + TAU * k); c.stroke(); }
  function drawOverlay() {
    const O = api.overlay, c = O.ctx, W = O.w, Hh = O.h;
    c.clearRect(0, 0, W, Hh);
    if (phase !== 'fight') return;
    c.font = FONT; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineCap = 'round';
    const sc = Math.min(1.2, Math.max(0.75, Math.min(W, Hh) / 720));
    const pc = playerCh();
    // Chase (2040)'s ping reach on the floor (ready: blue; cooling: faint)
    if (pc && pc.c40 && pc.a) {
      const a = pc.a;
      c.strokeStyle = pc.cd2 <= 0 ? 'rgba(143,208,255,.55)' : 'rgba(143,208,255,.16)'; c.lineWidth = 2; c.setLineDash(pc.cd2 <= 0 ? DASH0 : DASH1); c.beginPath();
      let first = true;
      for (let i = 0; i <= 32; i++) { const an = (i / 32) * TAU; if (proj(a.pos.x + Math.sin(an) * PING.r, 0.03, a.pos.z + Math.cos(an) * PING.r)) { if (first) { c.moveTo(SX, SY); first = false; } else c.lineTo(SX, SY); } else first = true; }
      c.stroke(); c.setLineDash(DASH0);
    }
    // the aimed drone
    if (pc && AIM.b && alive(AIM.b) && !auto && !WH.on) {
      const b = AIM.b, ready = AIM.ok && (pc.c40 ? coatReady(pc) : pc.cd <= 0 && pc.tt.st === 'idle');
      if (proj(b.x, b.h, b.z)) {
        const r = (b.kind === 'guardian' ? 30 : 22) * sc, col = ready ? '#ffd21f' : 'rgba(220,226,240,.55)';
        c.strokeStyle = col; c.lineWidth = 2.5; c.beginPath(); c.arc(SX, SY, r, 0, TAU); c.stroke();
        for (let i = 0; i < 4; i++) { const an = i * H + t * 1.4; c.beginPath(); c.moveTo(SX + Math.cos(an) * (r + 3), SY + Math.sin(an) * (r + 3)); c.lineTo(SX + Math.cos(an) * (r + 10), SY + Math.sin(an) * (r + 10)); c.stroke(); }
        if (pc.c40 && pc.coat.st === 'charge') arc(c, SX, SY, r + 15, pc.coat.charge / COAT.hold, '#ffd21f', 4);
        if (b.kind === 'guardian' && b.shield) { c.font = FONT_S; tag(c, SX, SY - r - 18, pc.c40 ? 'SHIELD · TETHER IT' : 'SHIELD', '#12305a', 'rgba(191,230,255,.9)'); c.font = FONT; }
      }
    }
    // a line biting: the yank meter
    for (let k = 0; k < 2; k++) {
      const ch = CHL[k], tt = ch.tt;
      if (tt.st === 'bite' && tt.b && proj(tt.b.x, tt.b.h, tt.b.z)) {
        arc(c, SX, SY, 30 * sc, tt.held / TETH.yank, '#ffd21f', 5);
        if (ch === pc && !auto && tt.held < 0.05) { c.font = FONT_S; tag(c, SX, SY + 44 * sc, 'HOLD YES — yank', '#141d3a', 'rgba(255,210,31,.92)'); c.font = FONT; }
      }
    }
    // wrapped Chases: the field's countdown
    for (let k = 0; k < 2; k++) {
      const ch = CHL[k], a = ch.a;
      if (!a || ch.wrapT <= 0) continue;
      if (proj(a.pos.x, 2.15, a.pos.z)) { arc(c, SX, SY, 14 * sc, ch.wrapT / HUG, 'rgba(159,216,255,.95)', 4); }
    }
    // drones on Luka
    if (onLuka && luka && proj(luka.pos.x, 2.25, luka.pos.z)) {
      const p = 0.75 + 0.25 * Math.sin(t * 10);
      c.fillStyle = p > 0.9 ? 'rgba(255,59,48,.95)' : 'rgba(255,59,48,.75)'; c.beginPath(); c.arc(SX, SY, 13 * sc, 0, TAU); c.fill();
      c.fillStyle = '#fff'; c.fillText('!', SX, SY + 1);
    }
    // the coat on the floor (go and get it)
    const co = CH.chase40.coat;
    if (co.st === 'floor' && proj(co.x, 0.6, co.z)) {
      c.font = FONT_S; tag(c, SX, SY - 8, 'COAT', '#2a1d0e', 'rgba(232,200,150,.92)'); c.font = FONT;
    }
    // the lure: in flight, then its label and timer
    if (LU.on) {
      if (LU.fly > 0) { const k = 1 - LU.fly / 0.45; if (proj(LU.x0 + (LU.x - LU.x0) * k, 1.2 + Math.sin(k * PI) * 1.4 - k * 1.1, LU.z0 + (LU.z - LU.z0) * k)) { c.fillStyle = '#ffd21f'; c.beginPath(); c.arc(SX, SY, 6, 0, TAU); c.fill(); } }
      else if (proj(LU.x, 1.0, LU.z)) { c.font = FONT_S; tag(c, SX, SY, LU.label, '#141d3a', 'rgba(255,210,31,.9)'); c.font = FONT; arc(c, SX, SY + 22, 7, 1 - LU.t / LU.dur, 'rgba(255,210,31,.9)', 3); }
    }
    // the Lure wheel
    if (WH.on && pc && pc.a && proj(pc.a.pos.x, 1.2, pc.a.pos.z)) {
      WCX = SX; WCY = SY;
      const n = WH.list.length, R = Math.min(118, Math.min(W, Hh) * 0.2);
      c.fillStyle = 'rgba(20,29,58,.55)'; c.beginPath(); c.arc(SX, SY, R + 30, 0, TAU); c.fill();
      c.font = FONT_S;
      for (let i = 0; i < n; i++) {
        const an = (i / n) * TAU, x = SX + Math.sin(an) * R, y = SY - Math.cos(an) * R, S = SAMPLES[WH.list[i]];
        tag(c, x, y, S ? S.label : WH.list[i], i === WH.i ? '#141d3a' : '#fff', i === WH.i ? 'rgba(255,210,31,.95)' : 'rgba(20,29,58,.9)');
      }
      c.font = FONT; tag(c, SX, SY, 'LURE', '#fff', 'rgba(20,29,58,.92)');
    }
  }
  // the 3-D bits that follow interpolated positions (after world.render: one frame behind, invisible at 60 fps)
  function meshFrame() {
    const M = MESH;
    if (!M) return;
    // tether line: hand -> drone (or the throw point)
    const tt = CH.chase.tt, a = CH.chase.a;
    if (a && tt.st !== 'idle' && tt.st !== 'wind') {
      handPos(a, V1);
      let x = tt.x, y = tt.y, z = tt.z;
      if (tt.b && tt.b.d && tt.b.d.obj) { const o = tt.b.d.obj.position; x = o.x; y = o.y; z = o.z; }
      const k = tt.st === 'fly' ? tt.k : tt.st === 'back' ? tt.k : 1;
      M.teth.userData.span(V1.x, V1.y, V1.z, V1.x + (x - V1.x) * k, V1.y + (y - V1.y) * k, V1.z + (z - V1.z) * k);
      M.teth.visible = k > 0.02;
    } else M.teth.visible = false;
    // the coat: flying (an arc), over a drone, or a heap on the floor
    const co = CH.chase40.coat;
    if (co.st === 'fly' || co.st === 'on' || co.st === 'floor') {
      const g = M.coat; g.visible = true;
      if (co.st === 'fly') {
        const k = Math.min(1, co.t / COAT.fly);
        let x = co.x, y = co.y, z = co.z;
        if (co.b && co.b.d && co.b.d.obj) { const o = co.b.d.obj.position; x = o.x; y = o.y; z = o.z; }
        g.position.set(co.x0 + (x - co.x0) * k, co.y0 + (y - co.y0) * k + Math.sin(k * PI) * 0.8, co.z0 + (z - co.z0) * k);
        g.rotation.set(0, k * 5, 0); g.scale.set(0.6 + 0.4 * k, 0.6 + 0.4 * k, 0.6 + 0.4 * k);
      } else if (co.st === 'on' && co.b && co.b.d && co.b.d.obj) {
        const o = co.b.d.obj; g.position.set(o.position.x, o.position.y - 0.2, o.position.z); g.rotation.set(0, o.rotation.y, 0); g.scale.set(1, 1, 1);
      } else { g.position.set(co.x, 0.02, co.z); g.rotation.set(0, 0.6, 0); g.scale.set(1.1, 0.35, 1.1); }
    } else M.coat.visible = false;
    // hug fields: the Chases, and Luka while one is on him
    for (let k = 0; k < 3; k++) {
      const f = M.fields[k], ac = k < 2 ? CHL[k].a : luka, on = k < 2 ? CHL[k].wrapT > 0 : onLuka > 0;
      f.visible = !!(on && ac);
      if (f.visible) { f.position.set(ac.pos.x, ac.pos.y, ac.pos.z); const s = 1 + Math.sin(t * 6 + k) * 0.04; f.scale.set(s, 1, s); }
    }
    // the ping ring
    if (M.ping.visible) {
      const u = M.ping.userData, k = Math.min(1, u.t / 0.4);
      M.ping.scale.setScalar(0.2 + (PING.r - 0.2) * sm(k)); M.ping.material.opacity = 0.75 * (1 - k * k);
      if (k >= 1) M.ping.visible = false;
    }
    // the lure's sound rings
    if (M.lure.visible) {
      const k1 = (t * 0.9) % 1, k2 = (t * 0.9 + 0.5) % 1;
      M.lure.scale.setScalar(0.3 + LU.r * 0.5 * k1); M.lure.material.opacity = 0.6 * (1 - k1);
      M.lure2.scale.setScalar(0.3 + LU.r * 0.5 * k2); M.lure2.material.opacity = 0.6 * (1 - k2);
    }
  }
  // the ability pills (DOM written on change only)
  const KEYS = { kb: { lure: 'I' }, pad: { lure: 'X' }, touch: { lure: 'BAG' } };
  function pill(p, key, kc, lab, fill, wait, warn) {
    if (p.kT !== key) { p.kT = key; p.k.textContent = key; }
    if (p.kc !== kc) { p.kc = kc; p.k.className = kc; }
    if (p.sT !== lab) { p.sT = lab; p.s.textContent = lab; }
    const f = Math.round(clamp(fill, 0, 1) * 50);
    if (f !== p.fK) { p.fK = f; p.f.style.transform = SCALE[f]; }
    if (wait !== p.wait) { p.wait = wait; p.el.classList.toggle('wait', wait); }
    if (warn !== p.warn) { p.warn = warn; p.el.classList.toggle('warn', warn); }
  }
  const LLAB = new Map();
  function lureLab(id) { let l = LLAB.get(id); if (l == null) { l = 'LURE' + (id && SAMPLES[id] ? ' · ' + SAMPLES[id].label : ''); LLAB.set(id, l); } return l; }
  function chipable(on) { if (on !== chipOn) { chipOn = on; document.body.classList.toggle('chipable', on); } }
  function drawPills() {
    const pc = playerCh();
    chipable(!!pc && pc.c40 && !auto && phase === 'fight');
    if (!D || !pc) return;
    const K = KEYS[input.scheme] || KEYS.kb;
    if (!pc.c40) {
      const tw = pc.tt.st !== 'idle' || pc.cd > 0;
      pill(D.pl[0], 'YES', '', pc.wrapT > 0 ? 'WRAPPED' : 'TETHER', tw ? 1 - pc.cd / TETH.cd : 1, tw || pc.wrapT > 0, false);
      const n = WH.list.length ? WH.list : lureList(), id = n[clamp(WH.last >= 0 ? WH.last : Math.max(0, n.indexOf('laugh')), 0, n.length - 1)];
      pill(D.pl[1], K.lure, 'k2', LU.on ? 'LURE OUT' : lureLab(id), LU.on ? 1 - LU.t / LU.dur : LU.cd > 0 ? 1 - LU.cd / 3 : 1, LU.on || LU.cd > 0, false);
    } else {
      const c = pc.coat, floor = c.st === 'floor' || c.st === 'on' || c.st === 'fly';
      const lab = pc.wrapT > 0 ? 'WRAPPED' : floor ? 'COAT · GO GET IT' : c.tap > 0 ? 'COAT · HOLD YES' : 'COAT';
      pill(D.pl[0], 'HOLD YES', 'hold', lab, floor ? 0 : 1 - Math.max(0, c.cd) / COAT.cd, !coatReady(pc), floor);
      pill(D.pl[1], 'CHIP', 'chip', 'PING', 1 - pc.cd2 / PING.cd, pc.cd2 > 0, false);
    }
  }
  function drawStallPop() {
    const sp = stallEl;
    if (!sp || !sp.on || !stall) return;
    sp.t += 1 / 60;
    if (stall.bug === 'backwards') {
      const v = Math.round(100 - ((t * 22) % 100));
      if (v !== sp.v) { sp.v = v; sp.fill.style.transform = S100[v]; sp.pct.textContent = P100[v]; }
    } else if (stall.bug === 'runaway') {
      const x = Math.round(Math.sin(t * 2.6) * 70);
      if (x !== sp.v) { sp.v = x; sp.btn.style.transform = TXP[x + 70]; }
    } else if (stall.bug === 'sure') {
      const k = Math.floor(t / 1.6) % 2;
      if (k !== sp.v) { sp.v = k; sp.msg.textContent = k ? "Are you sure you're sure?" : 'Are you sure?'; }
    }
  }

  // ---------------------------------------------------------- MINIGAMES.boss
  const M = {
    start(params, a) {
      if (phase !== 'end') cleanup({ aborted: true });
      api = a; P = params || {}; run++; build();
      if (!V1) { V1 = new THREE.Vector3(); V2 = new THREE.Vector3(); V3 = new THREE.Vector3(); MV = new THREE.Vector3(); }
      auto = !!TEST.auto;
      story = !!options.storyMode;
      goal = P.to || 85;
      const from = typeof P.from === 'number' ? P.from : state.hack > 0 && state.hack < goal ? state.hack : 0;
      from0 = from;
      hack = peak = flatPeak = from;
      rate = (P.rate || 0.3) * (story ? 2 : 1) * (auto ? P.autoRate || 4 : 1); backRate = P.back || 0.5;
      STALLS = Array.isArray(P.stalls) ? P.stalls : STALLS_DEF;
      lineI = 0; while (lineI < LINES.length && LINES[lineI][0] <= from) lineI++;
      stallI = 0; while (stallI < STALLS.length && STALLS[stallI][0] <= from) stallI++;
      t = 0; stall = null; stallT = 0; hk = null; opq = 0; zeroT = flatT = 0; fails = 0; seed = 1158;
      spawnT = 2.2; spawnN = 0; lastG = lastP = lastC = -99; assist = false; assistRef = 0; histT = 0; histI = 0; HIST.fill(from);
      q = 900 - 660 * (from / goal); qShown = -1; pctShown = -1; hudBack = hudStall = false;
      onLuka = 0; wasOn = false; swapT = 14; mouseT = 0; floodT = 0; hzSeen = 0; nextWheelAuto = Math.max(from + 6, 30); lukaExpr = '';
      for (const k in ST) ST[k] = 0;
      LU.on = false; LU.cd = 0; WH.on = false; WH.last = -1; for (let i = 0; i < 4; i++) SL[i].on = false; slI = 0;
      for (let i = 0; i < PEND.length; i++) PEND[i].on = false; HATCH_T.fill(0);
      LIVE.length = 0; for (let i = 0; i < NB; i++) BP[i].on = false;
      // the set and its props
      const S = typeof SETS !== 'undefined' && SETS.hq_top;
      spawns = (S && S.spawns) || SPAWN_DEF; bossCam = (S && S.bossCam) || null;
      if (S && world.setId === 'hq_top' && S.dress && S.state !== 's34' && P.dress !== false) S.dress('s34');
      props = { glass: prop('glass_ui'), console: prop('console'), phone: prop('luka_phone'), hatches: prop('drone_hatches'), ports: prop('drone_ports'), slicks: prop('slicks'), lights: prop('lights') };
      if (props.glass && props.glass.clockRun) props.glass.clockRun(0);
      if (props.slicks && props.slicks.clear) props.slicks.clear();
      if (props.phone && props.phone.state) props.phone.state('docked');
      // the actors
      const mk = (id, mark) => actorOf(id) || (world.mark(mark) ? world.spawn(id, mark) : null);
      luka = mk('luka', 'console_luka'); l40 = mk('luka40', 'boss_l40');
      CH.chase.a = mk('chase', 'boss_chase'); CH.chase40.a = mk('chase40', 'boss_c40');
      for (let k = 0; k < 2; k++) {
        const ch = CHL[k];
        ch.wrapT = 0; ch.cd = 0; ch.cd2 = 0; ch.hugB = null; ch.pingT = 0; ch.slipX = ch.slipZ = 0; ch.slick = false;
        ch.tt.st = 'idle'; ch.tt.b = null; ch.tt.k = 0; ch.coat.st = 'worn'; ch.coat.cd = 0; ch.coat.b = null; ch.coat.charge = 0; ch.coat.tap = 0;
        ch.ai.t = 0.4 + k * 0.12; ch.ai.b = null; ch.ai.ready = 0; ch.ai.mx = ch.ai.mz = 1e9; ch.ai.lureCd = 8;
        if (ch.a) { ch.lx = ch.a.pos.x; ch.lz = ch.a.pos.z; if (ch.a.rig && ch.a.rig.show && ch.c40) { ch.a.rig.show('coat', true); } }
      }
      if (luka) { luka.play(ANIMS.type ? 'type' : 'idle'); }
      // who the player is
      const want = P.active === 'chase' || P.active === 'chase40' ? P.active : state.active === 'chase40' ? 'chase40' : 'chase';
      hkFrom = want;
      state.active = want;
      player.follower(null);
      if (actorOf(want)) player.control(want);
      player.enabled = !auto; player.frozenT = 0; player.speedMul = 1;
      ui.swapIndicator(want, want === 'chase' ? 'chase40' : 'chase');
      ui.prompt(null);
      // the camera: lens away from the side the Chase starts on (a three-quarter view across the room)
      const aa = CH[want].a;
      side = sideTo = aa && aa.pos.x < 0 ? -1 : 1;
      CAMO.fov = (bossCam && bossCam.fov) || 60; CAMO.lag = (bossCam && bossCam.lag) || 1.5; CAMO.lookLag = (bossCam && bossCam.lookLag) || 1.0;
      camTick(0, true);
      cam.override('fixed', CAMO);
      const cp = cam.camera && cam.camera.position, inRoom = !!cp && cp.x > -12.2 && cp.x < 12.2 && cp.z > -23.4 && cp.z < -11 && cp.y > 0 && cp.y < 5.3;
      cam.release(skipping() || !inRoom ? 0 : 1.2);   // ease from a shot in the office (3.3's last); cut from anywhere else
      // HUD
      if (api.hud) { if (api.hud.show) api.hud.show(); api.hud.hack(hack, null); if (api.hud.quiet) api.hud.quiet(Math.ceil(q)); }
      hudTick();
      // 3-D bits, DOM
      meshesAdd(true);
      domOn(true);
      for (const p of D.pl) { p.kT = p.sT = p.kc = null; p.fK = -1; p.wait = p.warn = null; }
      // music
      if (P.music !== false && typeof music === 'function') music(P.music || 'boss', { fade: 0.8 });
      // the fight starts hot: two Courtesy drones already in the air (they came in with 3.3's red)
      phase = 'fight';
      spawnDrone('courtesy', 'hatch_w', [-6.2, 2.4, -18.2]);
      spawnDrone('courtesy', 'hatch_e', [6.2, 2.4, -18.2]);
      log('boss start ' + Math.round(from) + '% as ' + want + (story ? ' story' : '') + (auto ? ' auto' : ''));
    },
    update(dt) {
      if (phase === 'end' || phase === 'done') return;
      if (phase === 'card') {
        if (hk && hk.active) { hk.update(dt); if (opq > 0 && (opq -= dt) <= 0 && api.opaque) api.opaque(true); }
        else if (!hk && (stallT += dt) >= 1.5) stallDone(stall ? stall.bug : '');
        return;
      }
      t += dt;
      if (D) { for (let i = 0; i < 4; i++) if (D.hz[i].on) D.hz[i].t += dt; floodTick(dt); }
      if (!auto) inputTick(dt); else autoTick(dt);
      if (phase !== 'fight') return;
      if (stall && !auto) stallT += dt;
      const pc = playerCh();
      for (let k = 0; k < 2; k++) {
        const ch = CHL[k], isP = ch === pc;
        chaseTick(ch, dt, isP && !auto);
        if (!isP || auto) aiTick(ch, dt, CHL[1 - k].ai.b, isP && auto);
      }
      spawnTick(dt);
      for (let i = LIVE.length - 1; i >= 0; i--) if (i < LIVE.length) droneTick(LIVE[i], dt);
      for (let i = 0; i < 4; i++) if (SL[i].on && (SL[i].t -= dt) <= 0) SL[i].on = false;
      lureTick(dt);
      if (MESH && MESH.ping.visible) MESH.ping.userData.t += dt;
      hackTick(dt);
      camTick(dt, false);
    },
    draw() {
      if (phase === 'end') return;
      if (phase === 'card') { if (hk && hk.active) hk.draw(); return; }
      meshFrame();
      drawOverlay();
      drawPills();
      drawStallPop();
    },
    end(r) { cleanup(r); },
    skipResult() { return { skipped: true, done: true, hack: goal, drones: liveDrones() }; },
    autoplay(a) {
      if (phase === 'end' || api !== a) M.start(a.params || {}, a);
      auto = true; player.enabled = false;
      rate = (P.rate || 0.3) * (story ? 2 : 1) * (P.autoRate || 4);
    },
    // for content: the live drones' positions now (flat [x, y, z, …]) — 3.5's galaxy.seed
    positions: () => liveDrones(),
  };
  MINIGAMES.boss = M;
})();
