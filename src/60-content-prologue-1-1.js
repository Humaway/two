// ============================================================ CONTENT: P ("Do Not Disturb") and 1.1 ("Spotless")
// BUILD_PROMPT §8. Every line is final and word for word; '^' = a beat. Shot tags are quoted in the comments.
// P: hq_top (docs/sets/hq_top.md, dress 'p', env 'midday'): the SafeSense prompt on the glass (glass_ui yes_only → dnd),
//   the desk track to the face-down photo, the hooded Manager (actor luka40) at mark mgr_glass, the aide drone, the
//   glance at the empty chair (hint 1: no music marks it), then the title card "two" over black.
// 1.1: reddy26 (docs/sets/reddy26.md, dress 'xmas'): the crane down out of the sky, the Hero Table, the hold music from
//   Chase's phone, the radio, the ladder. Then a roam (Luka): Polish (src/40-mg-polish.js: its own 99 % lean beat says
//   "CHASE." / "Sorry."), the tinsel (Jordan down, the ladder), Chase off hold (twice: the hold + the calc, then the
//   label email, a two-shot across the counter with Luka glancing at Chase before he speaks), the examine list (the
//   Wall, the backroom), the kettle. Ends on the floor clock at 11:58; 1.2 (src/61) picks up from there.
// Continue: 1.1 restarts at step 0 with its saved flags: a short re-entry replaces the opening and every prop and
//   person is dressed from the flags (s11_polished, s11_jordan_down, s11_tinsel, s11_hold1, s11_offhold, s11_door).
(() => {
  const PI = Math.PI, H = PI / 2;
  const say = (id, text, o) => Object.assign({ say: id, text }, o);
  const sk = (c) => c.flow.skipping;
  const P = (c, n) => c.world.prop(n);
  const act = (c, id) => c.world.actor(id);
  const V1 = new THREE.Vector3();
  const K = () => (typeof RIGKIT !== 'undefined' ? RIGKIT : null);
  // one tick later (even while skipping): a set re-dresses itself on its first tick in a new scene, so content that
  // dresses from flags (Continue) runs after it
  const nextTick = () => new Promise((res) => { const f = () => { removeUpdate(f); res(); }; addUpdate(f); });
  // a tween on the game clock, snapped at once while skipping or when the scene changes (no allocation per tick)
  function tween(c, dur, fn) {
    const sid = c.flow.sceneId;
    if (c.flow.skipping || !(dur > 0)) { fn(1); return; }
    let t = 0;
    const f = (dt) => { t = Math.min(1, t + dt / dur); if (flow.sceneId !== sid || flow.skipping) t = 1; fn(t * t * (3 - 2 * t)); if (t >= 1) removeUpdate(f); };
    addUpdate(f);
  }
  // a computed close-up: the lens `dist` m from his eyes, `yaw` rad off his facing (+ = toward his left), pushing in
  // `push` m over `dur` s; `ly` lifts the look, `dy` the lens. Read at step time (faces placed under the cut).
  function closeOn(c, id, o = {}) {
    if (sk(c)) return;
    const a = act(c, id);
    if (!a) return;
    c.ui.card(null);
    a.eyePos(V1);
    const ry = (o.rot ?? a.rotY) + (o.yaw || 0), d = o.dist || 0.95, pu = o.push ?? 0.1, ly = V1.y - 0.05 + (o.ly || 0);
    const sx = Math.sin(ry), sz = Math.cos(ry), y = V1.y + (o.dy ?? -0.02), f = o.fov || 36;
    c.cam.shot({ shot: 'CAM', pos: [V1.x + sx * d, y, V1.z + sz * d], look: [V1.x, ly, V1.z], fov: f,
      to: { pos: [V1.x + sx * (d - pu), y + (o.rise || 0), V1.z + sz * (d - pu)], look: [V1.x, ly, V1.z], fov: o.fovTo || f }, dur: o.dur || 7, ease: 'linear' });
  }
  const CLOSE = (id, o) => ({ do: (c) => closeOn(c, id, o) });
  const turn = (id, to) => ({ do: (c) => { const a = act(c, id); if (a) a.face(to, 0); } });
  const turnSlow = (id, to, dur = 0.4) => ({ face: id, to, dur });
  const play = (id, anim, o) => ({ act: [[id, anim, o || {}]] });
  // on the ladder a move climbs (the walk anim swapped for 'climb' while it lasts; a {move} would otherwise walk)
  const climbing = (id, on) => ({ do: (c) => { const a = act(c, id); if (a) a.walkAnim = on ? 'climb' : 'walk'; } });
  const expr = (id, e) => ({ expr: [[id, e]] });
  const glide = (pos, look, fov, to, dur, ease = 'linear') => ({ shot: 'CAM', pos, look, fov, to, dur, ease });
  // walk the active character through waypoints (autoplay solves the roam on foot, through the real hotspots)
  async function walk(c, pts, run = true) {
    const sid = c.flow.sceneId;
    for (const p of pts) {
      const a = act(c, c.state.active);
      if (!a || c.flow.sceneId !== sid) break;
      await a.moveTo(p, { run });
    }
  }
  const setClock = (h, m) => ({ prop: 'clock_hands', fn: (o) => { if (o.userData.set) o.userData.set(h, m); } });

  // ---------------------------------------------------------- anims this file owns (guarded; no allocation per tick)
  // P: the gloved right hand reaches down onto the desk, rests on the face-down frame, and leaves (p.dur ≈ 3.4)
  if (!ANIMS.s0_rest) {
    ANIMS.s0_rest = (r, t, p) => {
      const k = K(); if (!k) return ANIMS.still(r, t, p);
      k.base(r, t);
      const P_ = r.parts, u = k.once(t, p, 3.6), e = u < 0.3 ? k.ez(u / 0.3) : u > 0.78 ? k.ez((1 - u) / 0.22) : 1;
      // torso bent 0.5 rad: the target (0.08, 0.1, 0.57) in torso space is the desk top ~0.55 m in front of his hips
      P_.torso.rotation.x = 0.5 * e;
      k.arm(r, -1, 0.2 - 0.12 * e, -0.15 + 0.25 * e, 0.1 + 0.47 * e, 1, -0.6, -0.4);
      P_.handR.rotation.set(-0.45 * e, 0, 0.1 * e);
      P_.head.rotation.x = 0.3 * e;
    };
  }
  // 1.1: Chase leans over the Hero Table to watch, still on hold: the phone at his ear, a finger down onto the glass
  if (!ANIMS.s11_lean) {
    ANIMS.s11_lean = (r, t, p) => {
      const k = K(); if (!k) return ANIMS.phone(r, t, p);
      k.base(r, t);
      const P_ = r.parts, d = r.d, e = k.ez(Math.min(1, t / 0.7));
      P_.torso.rotation.x += 0.55 * e;
      k.arm(r, -1, 0.1 * d.hs, d.headC - 0.17, 0.07, 0.5, -1, 0.3); P_.handR.rotation.set(0.25, 0, 0.15);
      k.arm(r, 1, 0.14, 0.05 + 0.26 * e, 0.2 + 0.31 * e, 1, -0.6, -0.4); P_.handL.rotation.set(-0.5 * e, 0, 0);
      P_.head.rotation.x = 0.4 * e; P_.head.rotation.z = 0.08;
    };
  }
  // Luka crouched at the Hero Table, polishing: hands on the glass (y 0.95) in circles, eyes on his work
  if (!ANIMS.s11_polish) {
    ANIMS.s11_polish = (r, t, p) => {
      const k = K(); if (!k) return ANIMS.polish(r, t, p);
      const P_ = r.parts, d = r.d, w = t * 5.5, c = Math.cos(w), s2 = Math.sin(w), hy = d.hipY * 0.7;
      k.breathe(r, t);
      r.seated = false; r.floorSit = false; P_.hips.position.y = hy;
      k.leg(r, 1, d.hipX * 1.15, d.footH - hy, 0.16); k.leg(r, -1, d.hipX * 1.15, d.footH - hy, 0.0); k.flat(r);
      // torso bent 0.3: (0.13, 0.44, 0.39) in torso space is the glass top ~0.5 m in front of his hips
      P_.torso.rotation.x = 0.3;
      k.arm(r, 1, 0.13 + 0.05 * c, 0.44 + 0.01 * s2, 0.39 + 0.05 * s2, 1, -0.6, -0.4);
      k.arm(r, -1, 0.13 - 0.05 * c, 0.44 - 0.01 * s2, 0.39 - 0.05 * s2, 1, -0.6, -0.4);
      P_.handL.rotation.x = -0.4; P_.handR.rotation.x = -0.4;
      P_.head.rotation.x = 0.35; P_.neck.rotation.x = 0.1;
    };
  }
  // Chase holds up a finger (still on hold), the phone at his ear
  if (!ANIMS.s11_finger) {
    ANIMS.s11_finger = (r, t, p) => {
      const k = K(); if (!k) return ANIMS.phone(r, t, p);
      k.base(r, t);
      const P_ = r.parts, d = r.d, e = k.ez(Math.min(1, t / 0.35));
      k.arm(r, -1, 0.1 * d.hs, d.headC - 0.17, 0.07, 0.5, -1, 0.3); P_.handR.rotation.set(0.25, 0, 0.15);
      k.arm(r, 1, 0.17, -0.05 + (d.headC - 0.1) * e, 0.12 + 0.12 * e, 1, -1, -0.3); P_.handL.rotation.set(-1.3 * e, 0, -0.2 * e);
      P_.head.rotation.z = 0.12; P_.head.rotation.x = -0.05;
    };
  }
  // Luka up the ladder when it wobbles: both hands on the top rails, very still
  if (!ANIMS.s11_grip) {
    ANIMS.s11_grip = (r, t, p) => {
      const k = K(); if (!k) return ANIMS.still(r, t, p);
      k.base(r, t);
      const P_ = r.parts, d = r.d, tr = 0.004 * Math.sin(t * 29);
      k.arm(r, 1, 0.18, d.headC - 0.32 + tr, 0.26, 1, -0.5, -0.8); k.arm(r, -1, 0.18, d.headC - 0.32 - tr, 0.26, 1, -0.5, -0.8);
      P_.handL.rotation.x = -0.6; P_.handR.rotation.x = -0.6; P_.torso.rotation.x = 0.05; P_.head.rotation.x = -0.1;
    };
  }

  // ==================================================================== P — "Do Not Disturb"
  // hq_top: the west end is the Manager's (the desk x −10…−9.1, the face-down photo (−9.55, 0.75, −15.0), the empty
  // chair (−8.5, −13.6), his spot at the glass mgr_glass (−9.6, −12.0) facing the glass (+Z); his left is east, +X).
  const DESK_AT = [-10.1, 0, -15.06, H];                     // at the desk's west edge: the right hand reaches the frame
  // the cursor (u, v over the pop-up): in from the right under the empty slot where NO should be, clear of the
  // schedule line (11:58 stays readable), and stops just short of YES
  const C_FROM = [0.92, 0.71], C_TO = [0.47, 0.73];
  function glass(c) { return P(c, 'glass_ui'); }
  function dressP(c) {
    const a = act(c, 'luka40');
    if (a) { a.rig.show('hood', true); a.rig.show('gloves', true); a.visible = true; a.place('mgr_glass'); a.play('still'); a.setExpr('still'); }
    const g = glass(c);
    if (g && g.userData.popup) { g.userData.popup('yes_only', { sched: true }); g.userData.cursor(C_FROM[0], C_FROM[1]); }
    const ph = P(c, 'photo_frame'); if (ph && ph.userData.state) ph.userData.state('down');
    const ad = P(c, 'aide_drone'); if (ad) { ad.visible = false; if (ad.userData.talk) ad.userData.talk(false); }
  }
  function cursorDrift(c) {
    const g = glass(c); if (!g || !g.userData.cursor) return;
    tween(c, 2.4, (k) => g.userData.cursor(C_FROM[0] + (C_TO[0] - C_FROM[0]) * k, C_FROM[1] + (C_TO[1] - C_FROM[1]) * k));
  }
  const aide = (on) => ({ do: (c) => { const ad = P(c, 'aide_drone'); if (ad && ad.userData.talk) ad.userData.talk(on); } });

  SCENES.P = {
    title: 'Do Not Disturb', set: 'hq_top', env: 'midday', time: 'Saturday 22 December 2040, 11:52', place: 'Optus Tower, Fortitude Valley', timeCard: false,
    playable: [], swap: false, hud: null, music: null,
    spawn: { luka40: 'mgr_glass' },
    steps: [['cutscene', 'P']],
    grants: {},
  };

  CUTSCENES.P = [
    // [BLACK] Thunder, very far away. A drone hum fades up.
    { fade: 'out', dur: 0 },
    { do: (c) => dressP(c) },
    { sfx: 'thunder_far', vol: 0.55 },
    { loop: 'drone_idle', vol: 0.32, fade: 2.6 },
    { wait: 2.0 },
    // [ECU · locked] The pop-up on the glass: OPT OUT ALL USERS? [YES] and the empty, button-shaped space where NO
    // should be; Scheduled: Monday 24 December 2040 · 11:58. A cursor drifts toward YES and stops just short. Hold 3 s.
    { shot: 'INSERT', at: 'glass_popup' },
    { fade: 'in', dur: 1.4 },
    { wait: 0.9 },
    { do: (c) => cursorDrift(c) },
    { wait: 1.5 },
    { shot: 'INSERT', at: 'glass_popup_ecu' },
    { wait: 1.0 },
    { do: (c) => { const g = glass(c); if (g && g.userData.cursor) g.userData.cursor(C_TO[0], C_TO[1]); } },
    { wait: 3.0 },
    // [INSERT · slow track along the desk] The surface so clean it reflects the storm; the track ends on the face-down
    // frame. A gloved hand enters and rests on it for a moment. The hand leaves. (He's out of the track's view until
    // the lens is down on the frame; then only the arm comes in.)
    { do: (c) => { const a = act(c, 'luka40'); if (a && !sk(c)) a.visible = false; } },
    glide([-9.55, 0.86, -17.5], [-9.55, 0.76, -15.0], 38, { pos: [-9.55, 1.02, -15.62], look: [-9.62, 0.75, -15.0], fov: 32 }, 4.4, 'out'),
    { wait: 4.4 },
    { do: (c) => { const a = act(c, 'luka40'); if (a) { a.place(DESK_AT); a.visible = true; } } },
    play('luka40', 's0_rest', { dur: 3.6, loop: false }),
    { wait: 3.9 },
    // [WIDE · high, from the far corner] A figure in a long dark coat at the glass, back to camera, small against the
    // city. The empty chair to his left. A drone glides in through the dark and stops at his shoulder.
    { do: (c) => { const a = act(c, 'luka40'); if (a) { a.visible = true; a.place('mgr_glass'); a.play('still'); } } },
    glide([11.4, 4.75, -22.7], [-9.0, 1.0, -12.4], 50, { pos: [10.9, 4.65, -22.45], look: [-9.0, 1.05, -12.4], fov: 48 }, 13),
    { do: (c) => { const ad = P(c, 'aide_drone'); if (ad && ad.userData.fly) ad.userData.fly('p_drone_in', 'p_drone_shoulder', 3.6); } },
    { wait: 4.0 },
    aide(true),
    say('drone', 'Sir. Unscheduled outbound call. Redcliffe store. ^ Destination: Tuesday, twenty-second of December, 2026.'),
    aide(false),
    // [CLOSE · the back of his head, the hood up] He doesn't move.
    glide([-9.45, 1.86, -13.65], [-9.62, 1.72, -12.0], 34, { pos: [-9.46, 1.85, -13.45], look: [-9.62, 1.72, -12.0], fov: 33 }, 9),
    { wait: 1.4 },
    say('manager', '…Who\'s calling?'),
    aide(true),
    say('drone', 'Chase.'),
    aide(false),
    // [MID · from behind, his shoulder and the empty chair in frame] (Hint 1.) He turns his head a few degrees to the
    // left, toward the empty chair, as if checking with someone. Then back to the glass. No music marks it.
    // (from just behind the desk, a little to his left: his hood against the sky between two mullions, so the turn reads
    // in silhouette; the chair at the left of frame, the aide drone at his right shoulder)
    glide([-10.05, 1.95, -15.5], [-9.25, 1.1, -12.2], 49, { pos: [-10.0, 1.93, -15.3], look: [-9.25, 1.1, -12.2], fov: 48 }, 8),
    { wait: 0.9 },
    play('luka40', 'glance', { yaw: 0.45, dur: 1.8 }),
    { wait: 2.2 },
    aide(true),
    say('drone', 'Shall I end the call?'),
    aide(false),
    // A pause, 2 s.
    { wait: 2.0 },
    say('manager', 'No. ^ He never finishes anything.'),
    // [ECU] The pop-up on the glass. In its corner a small moon icon switches on: Do Not Disturb.
    { shot: 'INSERT', at: 'glass_moon' },
    { wait: 1.0 },
    { do: (c) => { const g = glass(c); if (g && g.userData.popup) g.userData.popup('dnd', { sched: true }); } },
    { sfx: 'ss_chirp', vol: 0.18, rate: 0.85 },
    { wait: 2.0 },
    // [BLACK] Title: TWO (white, lowercase-friendly, a hairline rule in Yes yellow: ui.title's logo style)
    { fade: 'out', dur: 0.15 },
    { wait: 0.8 },
    { title: 'two', dur: 4 },
    { wait: 0.6 },
  ];

  // ==================================================================== 1.1 — "Spotless"
  // reddy26 (+Z = the car park, −Z = the backroom). The Hero Table centre (5.6, −5.3), glass top y 0.93–0.95, glass
  // z −5.75…−4.85; the counter x 3.15..7.85, z −9.45..−8.55 (top y 1.0); the store phone's base (7.55, 1.05, −9.2) (a
  // cordless handset: Chase carries it); the radio (7.55, 1.0, −8.78); the ladder (4.05, 0, −11.75) at the Yes wall;
  // the floor clock (8.4, 2.62, −12.46); the corridor x 5.4..7.4 (the Wall on its left face, x 5.415); the backroom
  // door hinge (5.95, −23.87); the backroom x 2.4..10.4, z −30..−24.
  const M11 = {
    luka: [5.6, 0, -6.1, 0],                 // crouched at the glass (the opening; s11_polish for the game)
    chaseFront: [6.78, 0, -7.95, 0.12],      // leaning back on the counter's customer side, on the phone
    chaseLean: [6.12, 0, -6.28, -0.3],       // leaning over Luka to watch (a finger on the glass)
    chaseTill: [6.95, 0, -9.95, 0],          // behind the till (after the first talk)
    chaseWait: [8.3, 0, -8.1, -2.6],         // round the counter's right end (the polish lean walks from here)
    jordanTop: [4.05, 1.26, -11.7, PI], jordanFoot: [4.05, 0, -11.2, PI], jordanDown: [4.75, 0, -10.9, -2.5], jordanTill: [6.0, 0, -7.8, PI],
    lukaLadder: [4.05, 0, -11.15, PI], lukaTop: [4.05, 1.26, -11.7, PI],
    lukaCounter: [7.25, 0, -7.75, PI - 0.5], lukaFront: [6.95, 0, -6.5, PI],
  };
  // the opening's fingerprint (hero_smudge1 at ×3: a 7 cm print reads as a smudge from a metre and a half), world
  // (x, z): just past Luka's hands, then under Chase's finger
  const SMUDGE_L = [5.65, -5.46], SMUDGE_C = [6.08, -5.67];
  const O11 = { line: 'Get the store ready for Christmas.', polish: 'Polish the Hero Table', tinsel: 'Hang the tinsel', hold: 'Get Chase off hold' };
  function duties() {
    const f = state.flags;
    objective(O11.line);
    objective.list([{ text: O11.polish, done: !!f.s11_polished }, { text: O11.tinsel, done: !!f.s11_tinsel }, { text: O11.hold, done: !!f.s11_offhold }]);
  }
  const tick = (flag, quiet) => [{ flag }, ...(quiet ? [] : [{ sfx: 'pop', vol: 0.5 }]), { do: () => duties() }];
  const resumed = (s) => !!(s.flags.s11_polished || s.flags.s11_jordan_down || s.flags.s11_hold1 || s.flags.s11_door);

  // the hold music is never heard in 1.1 (it doubled the store radio); HOLD_OFF still clears any left over
  const HOLD_OFF = { loop: 'hold', stop: true, fade: 0.25 };

  // the coil of tinsel Jordan holds ("a fistful"): the floor coil, shrunk into a hand while it's held
  function coil(c, who) {
    const o = P(c, 'tinsel_coil'); if (!o) return;
    for (const id of ['jordan', 'luka']) { const a = act(c, id); if (a && a.held === o) a.hold(null); }
    if (!who) { o.scale.setScalar(1); o.visible = false; return; }
    o.scale.setScalar(0.42); o.visible = true;
    const a = act(c, who); if (a) a.hold(o, 'R');
  }
  function smudge(c, on, at = SMUDGE_L) {
    const t = P(c, 'hero_table'); if (!t || !t.userData.smudge1At) return;
    t.userData.smudge1At(at[0], at[1], 3.0); t.userData.smudge1(on);
    watchOn();
  }
  // scene watcher (allocation-free): the fingerprint goes home when the scene ends; the backroom door (shut, the set's
  // doorway collider keeps the player out) creaks open after its nine-second spinner and stays open (flag s11_door)
  let watching = false, doorWas = true;
  function watch11() {
    if (flow.sceneId !== '1.1' || world.setId !== 'reddy26') {
      const t = world.prop('hero_table', 'reddy26'); if (t && t.userData.smudge1At) t.userData.smudge1At(null);
      watching = false; removeUpdate(watch11); return;
    }
    const d = world.prop('backroom_door', 'reddy26');
    const open = !!d && (!!d.userData.open || d.rotation.y > 0.9);
    if (open && !doorWas) { if (!flow.skipping) sfx('creak', DOOR_SFX); state.flags.s11_door = true; }
    doorWas = open;
  }
  const DOOR_SFX = { vol: 0.3 };
  function watchOn() { if (!watching) { watching = true; addUpdate(watch11); } }
  function doorShut(c) {
    const d = P(c, 'backroom_door'); if (!d) return;
    if (c.state.flags.s11_door_asked) c.state.flags.s11_door = true;   // (saved during the nine seconds)
    if (c.state.flags.s11_door) { d.userData.open = true; d.rotation.y = 1.5; doorWas = true; return; }
    d.userData.open = false; d.rotation.y = 0; doorWas = false;
    if (d.userData.solid) d.userData.solid(true);
    watchOn();
  }
  // everyone and everything where the flags say (the opening's own blocking comes after, under the crane)
  function dress11(c) {
    const f = c.state.flags;
    const t = P(c, 'hero_table'); if (t && t.userData.set) t.userData.set(f.s11_polished ? 'spotless' : 'smudged');
    const ty = P(c, 'tinsel_yes'); if (ty && ty.userData.set) ty.userData.set(f.s11_tinsel ? 'hung' : 'hidden');
    const r = P(c, 'store_radio'); if (r) r.userData.playing = true;
    const lad = P(c, 'ladder'); if (lad && lad.userData.set) lad.userData.set('yes_wall');
    const ch = act(c, 'chase');
    if (ch) { ch.hold(null); ch.setExpr('neutral'); }
    smudge(c, false);
    doorShut(c);
    roamPlace(c);
  }
  // where people stand during the roam, from the flags (also after a mini-game or a talk)
  function roamPlace(c) {
    const f = c.state.flags, l = act(c, 'luka'), ch = act(c, 'chase'), j = act(c, 'jordan');
    if (ch) {
      if (!f.s11_hold1) { ch.place(M11.chaseFront); ch.hold('store_phone', 'R'); ch.play('phone_bare'); ch.setExpr('wince'); }
      else { ch.hold(null); ch.place(M11.chaseTill); ch.play('idle'); ch.setExpr(f.s11_offhold ? 'neutral' : 'tired'); }
    }
    if (j) {
      j.walkAnim = 'walk';
      if (!f.s11_jordan_down) { j.place(M11.jordanTop); j.play('reach_up'); coil(c, 'jordan'); }
      else { if (j.held) coil(c, null); j.place(M11.jordanDown); j.play('idle'); }
    }
    if (l) { l.walkAnim = 'walk'; l.setExpr('neutral'); }
  }
  // the roam: only the store radio (no hold music under it)
  function holdBed(c) { return c.runSteps([HOLD_OFF]); }
  // Luka steps behind the lens of an examine (so he is never in front of it) and turns to the thing
  // (world.anchor() gives Vector3s)
  const xyz = (v) => (Array.isArray(v) ? v : [v.x, v.y, v.z]);
  function behind(c, f, at) {
    const a = act(c, 'luka'); if (!a) return;
    const dx = at[0] - f[0], dz = at[2] - f[2], d = Math.hypot(dx, dz) || 1, ux = dx / d, uz = dz / d;
    const t = (a.pos.x - f[0]) * ux + (a.pos.z - f[2]) * uz;
    if (t > -0.4) a.place([f[0] - ux * 0.55, 0, f[2] - uz * 0.55, Math.atan2(ux, uz)]);
    else a.face([at[0], 0, at[2]], 0);
    a.play('idle');
  }
  // an examine: the anchor's lens with a slow push (a card over it if given), the line, then the card away
  function look(c, name, card, push = 0.12) {
    const an = c.world.anchor(name);
    if (!an || !an.from) return;
    const f = xyz(an.from), a = xyz(an.at), fov = an.fov || 36;
    behind(c, f, a);
    if (sk(c)) return;
    c.ui.card(null);
    c.cam.shot({ shot: 'CAM', pos: [f[0], f[1], f[2]], look: [a[0], a[1], a[2]], fov,
      to: { pos: [f[0] + (a[0] - f[0]) * push, f[1] + (a[1] - f[1]) * push, f[2] + (a[2] - f[2]) * push], look: [a[0], a[1], a[2]], fov }, dur: 7, ease: 'linear' });
    if (card) c.ui.card(card[0], card[1]);
  }
  // (every roam interaction cuts back to the zone camera: Luka stands just behind an examine's lens, and a glide home
  // from a close-up would pass through somebody's head)
  const CUT = { do: (c) => c.cam.release(0) };
  const ex = (name, line, card, push) => [{ do: (c) => look(c, name, card, push) }, { wait: card ? 0.9 : 0.4 }, say('luka', line), { do: (c) => c.ui.card(null) }, CUT];

  // ---------------------------------------------------------- CARDS (readable INSERTs this file owns)
  const KIT = () => CARDS._kit;
  // a staff flyer pinned to the noticeboard / the Wall: lines [text, px, colour, weight]
  CARDS.s11_flyer = (cx, w, h, d) => {
    const k = KIT(), paper = d.paper || '#fff2a8', lines = d.lines || [];
    cx.save(); cx.translate(w / 2, h / 2); cx.rotate(d.tilt ?? -0.025);
    k.shadow(cx, 26, 10); cx.fillStyle = paper; cx.fillRect(-w * 0.4, -h * 0.44, w * 0.8, h * 0.88); k.noShadow(cx);
    cx.fillStyle = d.pin || '#d32f2f'; cx.beginPath(); cx.arc(0, -h * 0.39, 12, 0, 7); cx.fill();
    cx.fillStyle = 'rgba(255,255,255,.5)'; cx.beginPath(); cx.arc(-3, -h * 0.39 - 4, 4, 0, 7); cx.fill();
    cx.textAlign = 'center'; cx.textBaseline = 'middle';
    let y = -h * 0.44 + (d.top || 110);
    for (const [s, px, col, wt] of lines) {
      cx.font = `${wt || 'bold'} ${px}px ${k.SANS}`; cx.fillStyle = col || '#141d3a';
      cx.fillText(s, 0, y, w * 0.72); y += px * 1.28;
    }
    cx.restore();
  };
  CARDS.s11_flyer.size = [700, 760];
  // Luke's office door sign: LUKE — MANAGER / KNOCK / PLEASE / and, new, in thin blue biro: ESPECIALLY YOU TWO
  CARDS.s11_door = (cx, w, h) => {
    const k = KIT();
    k.shadow(cx, 26, 10); cx.fillStyle = '#ffffff'; cx.fillRect(w * 0.1, h * 0.05, w * 0.8, h * 0.9); k.noShadow(cx);
    cx.strokeStyle = '#141d3a'; cx.lineWidth = 8; cx.strokeRect(w * 0.12, h * 0.065, w * 0.76, h * 0.87);
    cx.textAlign = 'center'; cx.textBaseline = 'middle';
    cx.fillStyle = '#141d3a'; cx.font = `bold 110px ${k.SANS}`; cx.fillText('LUKE', w / 2, h * 0.19);
    cx.font = `bold 46px ${k.SANS}`; cx.fillText('— MANAGER —', w / 2, h * 0.3);
    const ln = (s, y, rot, font, col) => { cx.save(); cx.translate(w / 2, y); cx.rotate(rot); cx.font = font; cx.fillStyle = col; cx.fillText(s, 0, 0, w * 0.7); cx.restore(); };
    ln('KNOCK', h * 0.47, -0.06, `italic bold 96px ${k.HAND}`, '#1f3a93');
    ln('PLEASE', h * 0.63, 0.05, `italic bold 74px ${k.HAND}`, '#c62828');
    ln('ESPECIALLY YOU TWO', h * 0.8, -0.06, `italic 46px ${k.HAND}`, k.BIRO);
    cx.save(); cx.translate(w / 2, h * 0.85); cx.rotate(-0.06); cx.strokeStyle = 'rgba(29,47,143,.7)'; cx.lineWidth = 3;
    cx.beginPath(); cx.moveTo(-220, 0); cx.lineTo(220, -4); cx.stroke(); cx.beginPath(); cx.moveTo(-200, 12); cx.lineTo(210, 8); cx.stroke(); cx.restore();
  };
  CARDS.s11_door.size = [640, 820];
  // "Sorry for the wait. — R." on a small cream card, pinned to the Wall
  CARDS.s11_note = (cx, w, h) => {
    const k = KIT();
    cx.save(); cx.translate(w / 2, h / 2); cx.rotate(-0.04);
    k.shadow(cx, 24, 10); cx.fillStyle = '#fbf6e2'; cx.fillRect(-w * 0.42, -h * 0.36, w * 0.84, h * 0.72); k.noShadow(cx);
    cx.fillStyle = '#c0282d'; cx.beginPath(); cx.arc(0, -h * 0.31, 10, 0, 7); cx.fill();
    cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillStyle = '#1e2a5a';
    cx.font = `italic bold 78px ${k.HAND}`; cx.fillText('Sorry for', 0, -h * 0.1, w * 0.76); cx.fillText('the wait.', 0, h * 0.06, w * 0.76);
    cx.font = `italic 58px ${k.HAND}`; cx.fillText('— R.', w * 0.16, h * 0.22);
    cx.restore();
  };
  CARDS.s11_note.size = [760, 560];
  // Chase's laptop: the folder UNFINISHED — 213 items, the newest first: track two (dont open)
  CARDS.s11_folder = (cx, w, h) => {
    const k = KIT();
    k.shadow(cx, 30, 12); cx.fillStyle = '#1c2a44'; k.rr(cx, w * 0.03, h * 0.04, w * 0.94, h * 0.9, 20); cx.fill(); k.noShadow(cx);
    const x = w * 0.06, y = h * 0.09, ww = w * 0.88, hh = h * 0.8;
    cx.fillStyle = '#f4f6f9'; cx.fillRect(x, y, ww, hh);
    cx.fillStyle = '#2a2f3a'; cx.fillRect(x, y, ww, 70);
    for (const [i, col] of [[0, '#e05a4e'], [1, '#e8b84a'], [2, '#5ac06a']]) { cx.fillStyle = col; cx.beginPath(); cx.arc(x + 30 + i * 30, y + 35, 9, 0, 7); cx.fill(); }
    cx.textBaseline = 'middle'; cx.textAlign = 'left'; cx.fillStyle = '#ffffff'; cx.font = `bold 34px ${k.SYS}`; cx.fillText('UNFINISHED — 213 items', x + 130, y + 36);
    const rows = ['track two (dont open)', 'kettle thing v3', 'bridge idea (no bridge)', 'untitled 211', 'pudding 2??', 'untitled 209', 'untitled 208'];
    rows.forEach((s, i) => {
      const ry = y + 80 + i * 56;
      if (ry + 50 > y + hh) return;
      cx.fillStyle = i === 0 ? '#2f6fd6' : i % 2 ? '#eceff4' : '#f8f9fb'; cx.fillRect(x + 6, ry, ww - 12, 52);
      cx.fillStyle = i === 0 ? '#ffffff' : '#8a93a3'; cx.fillRect(x + 22, ry + 13, 26, 28);
      cx.fillStyle = i === 0 ? '#ffffff' : '#1b2233'; cx.font = `${i === 0 ? 'bold ' : ''}32px ${k.SYS}`; cx.fillText(s, x + 66, ry + 27);
      if (i === 0) { cx.textAlign = 'right'; cx.font = `26px ${k.SYS}`; cx.fillText('Today 03:12', x + ww - 24, ry + 27); cx.textAlign = 'left'; }
    });
  };
  CARDS.s11_folder.size = [960, 640];
  const C_NOTICE = ['s11_flyer', { lines: [['LANYARD', 92], ['REQUESTS', 92], ['please allow', 58, '#444', 'normal'], ['6–8 weeks', 96, '#141d3a']], top: 150 }];
  const C_HOLD = ['s11_flyer', { paper: '#fdfdf6', pin: '#1f6fe0', tilt: 0.02, top: 120, lines: [['HOLD', 104, '#111'], ['MUSIC', 104, '#111'], ['NOW FEATURING', 48, '#333'], ['PUDDING', 100, '#c62828', 'italic bold'], ['— R.', 58, '#1e2a5a', 'italic']] }];

  // ---------------------------------------------------------- the roam's pieces
  // the Hero Table: the line on the first go, then the game (Luka crouched at s11_polish, Chase able to wander over)
  async function polish(c) {
    const f = c.state.flags, l = act(c, 'luka'), ch = act(c, 'chase');
    if (!f.s11_table_seen) {
      await c.runSteps([
        { do: (cc) => { if (l) { l.place('s11_polish'); l.play('idle'); } } },
        // (on the four phones, tilting up across the glass to his face as he talks)
        { do: (cc) => { if (!sk(cc)) cc.cam.shot({ shot: 'CAM', pos: [6.45, 1.36, -4.2], look: [5.6, 1.0, -5.3], fov: 40, to: { pos: [6.4, 1.4, -4.32], look: [5.6, 1.48, -6.35], fov: 40 }, dur: 4.5 }); } },
        say('luka', 'Four new phones. First display Luke\'s let us have since October. ^ If anything happens to it, it comes out of my pay.'),
        { flag: 's11_table_seen' },
      ]);
      if (flow.sceneId !== '1.1') return;
    }
    // (Chase can't walk through the counter: if he's behind the till, he waits round its end)
    if (ch && f.s11_hold1) { ch.place(M11.chaseWait); ch.play('idle'); }
    if (l) { l.place(M11.luka); l.play('s11_polish'); l.setExpr('determined'); }
    await c.flow.minigame('polish', { flag: 's11_polished', anim: false });
    if (flow.sceneId !== '1.1') return;
    c.state.flags.s11_polished = true;
    if (l) { l.play('idle'); l.setExpr('happy'); }
    roamPlace(c);
    duties(); if (!sk(c)) sfx('pop', { vol: 0.5 });
    return c.cam.release(0);
  }

  // the first talk: still on hold (a finger), then the calc at the register
  const CALC_WIDE = { shot: 'CAM', pos: [9.6, 2.05, -6.4], look: [5.9, 1.45, -9.9], fov: 50, to: { pos: [9.45, 2.0, -6.55], look: [5.9, 1.45, -9.9], fov: 48 }, dur: 9, ease: 'linear' };
  const CALC_THREE = { shot: 'CAM', pos: [9.5, 1.7, -8.6], look: [6.6, 1.4, -8.65], fov: 48, to: { pos: [9.3, 1.68, -8.62], look: [6.6, 1.4, -8.65], fov: 46 }, dur: 9, ease: 'linear' };
  const TALK1 = [
    { do: (c) => { const l = act(c, 'luka'), ch = act(c, 'chase'); if (l) { l.place(M11.lukaFront); l.face('chase', 0); l.play('idle'); } if (ch) ch.face('luka', 0); } },
    // (side-on along the counter's front: both in profile, Luka frame-left, Chase frame-right with his finger up)
    { shot: 'CAM', pos: [8.7, 1.58, -7.25], look: [6.85, 1.45, -7.22], fov: 44, to: { pos: [8.55, 1.57, -7.24], look: [6.85, 1.45, -7.22], fov: 43 }, dur: 7, ease: 'linear' },
    // He holds up a finger: still on hold.
    play('chase', 's11_finger'), expr('chase', 'tired'),
    { wait: 1.2 },
    say('luka', 'Still?'),
    CLOSE('chase', { dist: 1.0, fov: 38, push: 0.06, dur: 8, yaw: -0.6 }),
    say('chase', 'Forty-three minutes. It\'s looped eleven times. I\'ve started hearing things I\'d change.'),
    play('chase', 'phone_bare'),
    CLOSE('luka', { dist: 1.0, fov: 38, push: 0.05, dur: 5, yaw: 0.6 }),
    say('luka', 'Like what?'),
    CLOSE('chase', { dist: 0.95, fov: 38, push: 0.06, dur: 5, yaw: -0.6 }),
    say('chase', 'Everything.'),
    // (Then, at the register, Chase works out a Christmas bundle price for Jordan on paper.) The handset goes down on
    // the counter: on speaker, still on hold.
    { do: (c) => {
      const ch = act(c, 'chase'), l = act(c, 'luka'), j = act(c, 'jordan'), f = c.state.flags;
      if (ch) { ch.hold(null); ch.place(M11.chaseTill); ch.play('write_note'); ch.setExpr('neutral'); }
      if (l) { l.place([7.45, 0, -7.45, PI - 0.35]); l.play('idle'); }
      if (j && f.s11_jordan_down) { j.place(M11.jordanTill); j.play('idle'); j.face('chase', 0); }
    } },
    HOLD_OFF,
    { if: (s) => !!s.flags.s11_jordan_down, then: [CALC_THREE], else: [CALC_WIDE] },
    { wait: 1.4 },
    play('chase', 'give', { dur: 1.4, loop: false }),
    say('chase', 'Jordan, check the calc. ^ Calc is short for calculator.'),
    { if: (s) => !!s.flags.s11_jordan_down, then: [CLOSE('jordan', { dist: 1.0, fov: 38, push: 0.05, dur: 5, yaw: -0.5 })],
      else: [glide([4.95, 0.95, -10.05], [4.05, 2.85, -11.75], 44, { pos: [4.92, 0.98, -10.12], look: [4.05, 2.85, -11.75], fov: 43 }, 5)] },
    expr('jordan', 'tired'),
    say('jordan', 'I know what calc\'s short for.'),
    expr('luka', 'smug'),
    CLOSE('luka', { dist: 1.0, fov: 38, push: 0.05, dur: 5, yaw: 0.6 }),
    say('luka', 'Everyone knows what calc\'s short for.'),
    expr('luka', 'neutral'), expr('jordan', 'neutral'),
    { flag: 's11_hold1' },
    { do: (c) => { const j = act(c, 'jordan'); if (j && c.state.flags.s11_jordan_down) { j.place(M11.jordanDown); j.play('idle'); } const ch = act(c, 'chase'); if (ch) ch.play('idle'); } },
  ];
  // the second talk: he hangs up (head office never answered), and the real conversation: a two-shot across the
  // counter, Luka glancing at Chase before he speaks. Played straight: no gag, no sting.
  const ACROSS = { shot: 'CAM', pos: [9.75, 1.55, -8.75], look: [7.1, 1.42, -8.85], fov: 42, to: { pos: [9.45, 1.55, -8.78], look: [7.1, 1.42, -8.85], fov: 40 }, dur: 30, ease: 'linear' };
  const GL = { yaw: 0.55, dur: 2.2 };
  const glanceL = [play('luka', 'glance', GL), { wait: 0.55 }];
  const TALK2 = [
    { do: (c) => { const l = act(c, 'luka'), ch = act(c, 'chase'); if (l) { l.place(M11.lukaCounter); l.play('idle'); l.setExpr('neutral'); } if (ch) { ch.place(M11.chaseTill); ch.face([7.25, 0, -7.75], 0); ch.play('idle'); } } },
    // he picks the handset up off the counter, listens, and puts it back: click
    { hold: 'chase', prop: 'store_phone', hand: 'R' }, play('chase', 'phone_bare'), expr('chase', 'tired'),
    HOLD_OFF,
    CLOSE('chase', { dist: 1.05, fov: 38, push: 0.06, dur: 5, yaw: 0.45 }),
    { wait: 1.8 },
    { hold: 'chase', prop: null }, play('chase', 'idle'),
    HOLD_OFF,
    { sfx: 'clunk', vol: 0.3 },
    { wait: 0.6 },
    ACROSS,
    { wait: 0.8 },
    say('chase', 'Someone from a label emailed.'),
    ...glanceL,
    say('luka', 'What?'),
    say('chase', 'Moreton Bay Records. They heard the hold music. They want to hear \'what else I\'ve got\'.'),
    ...glanceL, expr('luka', 'happy'),
    say('luka', 'Mate. That\'s huge.'),
    say('chase', 'Yeah.'),
    ...glanceL, expr('luka', 'neutral'),
    say('luka', 'What else have you got?'),
    say('chase', 'Two hundred and thirteen unfinished songs.'),
    ...glanceL,
    say('luka', 'Send them one.'),
    say('chase', 'None of them are finished.'),
    ...glanceL,
    say('luka', 'Send them the least unfinished one.'),
    say('chase', 'That\'s track two. It\'s not ready.'),
    ...glanceL,
    say('luka', 'When\'s it going to be ready?'),
    say('chase', 'When it\'s good.'),
    // (A beat. Chase fiddles with his new lanyard.)
    play('chase', 'lanyard'), expr('chase', 'sad'),
    CLOSE('chase', { dist: 1.35, fov: 38, ly: -0.16, push: 0.32, dur: 14, yaw: 0.45 }),
    { wait: 1.2 },
    say('chase', 'You said I changed a person. On the tape. So now there\'s, like, proof. That I could be something. ^ And I\'m doing screen protectors.'),
    play('chase', 'idle'),
    ...glanceL,
    CLOSE('luka', { dist: 1.05, fov: 36, push: 0.06, dur: 6, yaw: -0.15, rot: PI }),
    say('luka', 'You\'re good at screen protectors.'),
    CLOSE('chase', { dist: 1.0, fov: 36, push: 0.08, dur: 8, yaw: 0.45 }),
    say('chase', 'That\'s what scares me.'),
    { wait: 1.4 },
    expr('chase', 'neutral'), expr('luka', 'neutral'),
    ...tick('s11_offhold', true),
  ];
  // after the main conversation
  const TALK3 = [
    { do: (c) => { const ch = act(c, 'chase'); if (ch) ch.face('luka', 0); } },
    play('chase', 'lanyard', { dur: 1.6, loop: false }),
    CLOSE('chase', { dist: 1.0, fov: 38, push: 0.06, dur: 6, yaw: -0.3 }),
    say('chase', 'Has my lanyard— ^ It came. I keep forgetting it came.'),
  ];
  function talkChase(c) {
    const f = c.state.flags;
    return c.runSteps(!f.s11_hold1 ? TALK1 : !f.s11_offhold ? TALK2 : TALK3).then(() => {
      if (flow.sceneId !== '1.1') return;
      roamPlace(c); holdBed(c); duties();
      return c.cam.release(0);
    });
  }

  // the tinsel: Jordan climbs down; Luka goes up (careful, both hands), the ladder wobbles once, he holds very still
  const LADDER_MID = { shot: 'CAM', pos: [6.1, 1.75, -9.6], look: [4.1, 1.55, -11.6], fov: 46, to: { pos: [6.0, 1.72, -9.7], look: [4.1, 1.5, -11.6], fov: 45 }, dur: 8, ease: 'linear' };
  const JORDAN_DOWN = [
    { do: (c) => { const l = act(c, 'luka'); if (l) { l.place([4.75, 0, -10.2, -2.6]); l.face('jordan', 0); l.play('idle'); } } },
    LADDER_MID,
    { wait: 0.5 },
    climbing('jordan', true), play('jordan', 'climb', { speed: 1.2 }),
    { move: 'jordan', to: M11.jordanFoot, speed: 0.75, face: false },
    climbing('jordan', false), play('jordan', 'idle'),
    { move: 'jordan', to: M11.jordanDown },
    { face: 'jordan', to: 'luka', dur: 0.3 },
    { flag: 's11_jordan_down' },
    { wait: 0.4 },
  ];
  const J_ASIDE = [3.35, 0, -10.8, 2.48];
  const LADDER_UP = [
    // (Jordan on the far side of him from the lens, so neither hides the other; they face each other for the hand-off)
    { do: (c) => { const l = act(c, 'luka'), j = act(c, 'jordan'); if (j) { j.place([3.45, 0, -10.7]); j.play('idle'); } if (l) { l.place(M11.lukaLadder); l.play('idle'); l.face('jordan', 0); } if (j) j.face('luka', 0); } },
    // Jordan hands him the tinsel
    { shot: 'CAM', pos: [5.75, 1.62, -10.3], look: [4.4, 1.35, -11.1], fov: 46, to: { pos: [5.7, 1.61, -10.35], look: [4.4, 1.35, -11.1], fov: 45 }, dur: 6, ease: 'linear' },
    play('jordan', 'give', { dur: 1.2, loop: false }),
    { wait: 0.6 },
    { do: (c) => coil(c, 'luka') },
    { wait: 0.5 },
    { face: 'luka', to: Math.PI, dur: 0.3 },
    // up, slowly, both hands (Jordan stands back, the other side of the ladder)
    { place: 'jordan', at: J_ASIDE },
    LADDER_MID,
    climbing('luka', true), play('luka', 'climb', { speed: 0.6 }),
    { move: 'luka', to: M11.lukaTop, speed: 0.45, face: false },
    climbing('luka', false), play('luka', 's11_grip'), expr('luka', 'scared'),
    // [OTS · from below] the ladder wobbles once. Luka holds very still.
    { shot: 'CAM', pos: [4.78, 0.55, -10.1], look: [4.05, 2.55, -12.0], fov: 52, to: { pos: [4.76, 0.57, -10.15], look: [4.05, 2.6, -12.0], fov: 51 }, dur: 4, ease: 'linear' },
    { wait: 0.6 },
    { prop: 'ladder', fn: (o) => { if (o.userData.wobble) o.userData.wobble(); } },
    { sfx: 'creak', vol: 0.35, rate: 1.3 },
    { wait: 1.8 },
    expr('luka', 'determined'),
    // he hangs the tinsel
    play('luka', 'reach_up'),
    { wait: 0.8 },
    { prop: 'tinsel_yes', fn: (o) => { if (o.userData.set) o.userData.set('half'); } },
    { sfx: 'cloth_swish', vol: 0.3 },
    { wait: 0.9 },
    { prop: 'tinsel_yes', fn: (o) => { if (o.userData.set) o.userData.set('hung'); } },
    { do: (c) => coil(c, null) },
    { sfx: 'cloth_swish', vol: 0.3, rate: 1.1 },
    { wait: 0.6 },
    // and down
    LADDER_MID,
    climbing('luka', true), play('luka', 'climb', { speed: 0.7 }),
    { move: 'luka', to: M11.lukaLadder, speed: 0.6, face: false },
    climbing('luka', false), play('luka', 'idle'), expr('luka', 'neutral'),
    ...tick('s11_tinsel'),
    { place: 'jordan', at: M11.jordanDown },
    { face: 'luka', to: 'jordan', dur: 0.3 }, { face: 'jordan', to: 'luka', dur: 0.3 },
    { shot: 'CAM', pos: [3.75, 1.62, -9.2], look: [4.4, 1.48, -11.05], fov: 44, to: { pos: [3.8, 1.61, -9.3], look: [4.4, 1.48, -11.05], fov: 43 }, dur: 6, ease: 'linear' },
    { wait: 0.4 },
    say('jordan', 'You could\'ve let me do that.'),
    say('luka', 'Yeah.'),
    // (He wouldn't.)
    { wait: 0.6 },
  ];
  const JORDAN_TALK = [
    { do: (c) => { const l = act(c, 'luka'), j = act(c, 'jordan'); if (j && l) { j.face('luka', 0); l.face('jordan', 0); } } },
    CLOSE('jordan', { dist: 1.0, fov: 38, push: 0.06, dur: 6, yaw: -0.4 }),
    say('jordan', 'Luke says if the display gets so much as a fingerprint, you\'re doing Boxing Day.'),
  ];

  SCENES['1.1'] = {
    title: 'Spotless', set: 'reddy26', env: 'day', time: 'Tuesday 22 December 2026, 11:31', place: 'Optus Redcliffe',
    playable: ['luka'], swap: false, hud: null, music: null,
    spawn: { luka: M11.luka, chase: M11.chaseFront, jordan: M11.jordanTop },
    hotspots: [
      // --- the three duties
      { id: 'h11_table', at: 's11_polish', r: 1.0, verb: 'Polish', when: (s) => !s.flags.s11_polished, do: (c) => polish(c) },
      { id: 'h11_chase_f', at: 'chase', r: 1.5, verb: 'Talk', when: (s) => !s.flags.s11_hold1, do: (c) => talkChase(c) },
      { id: 'h11_chase_b', at: 'chase', r: 2.5, verb: 'Talk', when: (s) => !!s.flags.s11_hold1, do: (c) => talkChase(c) },
      { id: 'h11_jordan', at: 'jordan', r: 1.5, verb: 'Talk',
        do: (c) => c.runSteps(c.state.flags.s11_jordan_down ? JORDAN_TALK : JORDAN_DOWN).then(() => { if (flow.sceneId === '1.1') { roamPlace(c); return c.cam.release(0); } }) },
      { id: 'h11_ladder', at: M11.lukaLadder, r: 0.8, verb: 'Climb', when: (s) => !!s.flags.s11_jordan_down && !s.flags.s11_tinsel,
        do: (c) => c.runSteps(LADDER_UP).then(() => { if (flow.sceneId === '1.1') { roamPlace(c); return c.cam.release(0); } }) },
      // --- the examine list (Luka)
      { id: 'h11_phones', at: [5.6, 0, -4.45], r: 0.7, steps: ex('hero_phones', '3%. They come out of the box tired.') },
      { id: 'h11_tree', at: [8.7, 0, -1.6], r: 0.8, steps: ex('xmas_tree', 'It\'s plastic. It\'s dying. It caught it off the plant.') },
      { id: 'h11_plant', at: [9.7, 0, -1.5], r: 0.7, steps: ex('pot_plant', 'Still dying. Bit festive about it.') },
      { id: 'h11_queue', at: [0.2, 0, -1.9], r: 0.75, steps: ex('queue_machine', 'Now serving: 000.') },
      { id: 'h11_notice', at: [9.4, 0, -11.55], r: 0.8, steps: ex('noticeboard', 'LANYARD REQUESTS: please allow 6–8 weeks. ^ Chase\'s took eight months. He tells customers.', C_NOTICE) },
      { id: 'h11_office', at: [9.9, 0, -11.5], r: 0.7, steps: ex('office_door_sign', 'LUKE — MANAGER. Under it: KNOCK. Under that: PLEASE. ^ Under that, new: ESPECIALLY YOU TWO.', ['s11_door', {}]) },
      { id: 'h11_monitor', at: [4.3, 0, -10.1], r: 0.7,
        steps: [{ do: (c) => look(c, 'monitor2', null, 0.1) }, { wait: 0.5 },
          { popup: { title: 'JARVIS', msg: 'JARVIS wishes you a Merry Christmas! Are you sure?', icon: 'info', buttons: ['YES', 'YES'] }, wait: true }, CUT] },
      { id: 'h11_polaroid', at: [6.6, 0, -19.55], r: 0.45, steps: ex('wall_polaroid', 'Us and Rue. 1987. ^ Don\'t remember it. It\'s still my favourite photo.', ['polaroid', { front: true }]) },
      { id: 'h11_cassette', at: [6.6, 0, -20.05], r: 0.45, steps: ex('wall_cassette', 'The first song Chase ever finished. It\'s got a kettle in it. He doesn\'t remember writing it.', ['label', { text: 'PUDDING' }]) },
      { id: 'h11_note', at: [6.6, 0, -20.45], r: 0.4, steps: ex('wall_note', '\'Sorry for the wait. — R.\' Came with his lanyard.', ['s11_note', {}]) },
      { id: 'h11_missing', at: [6.6, 0, -20.95], r: 0.45, steps: ex('wall_missing', 'Luke printed these when we disappeared. Now he can\'t take them down without admitting it happened.', null, 0.2) },
      { id: 'h11_flyer', at: [6.6, 0, -21.5], r: 0.45, steps: ex('wall_flyer', 'HOLD MUSIC: NOW FEATURING PUDDING. — R. ^ Rue asked if he could use it. Chase said yes before he finished the question.', C_HOLD) },
      // the backroom door: JARVIS spins its panel for nine seconds, then it opens (and stays open)
      { id: 'h11_door', at: [6.4, 0, -23.2], r: 0.85, verb: 'Open', when: (s) => !s.flags.s11_door && !s.flags.s11_door_asked,
        do: (c) => { c.state.flags.s11_door_asked = true; const d = P(c, 'backroom_door'); if (d && d.userData.request) { if (sk(c)) d.userData.open = true; else d.userData.request(); } if (!sk(c)) sfx('beep', { vol: 0.3 }); } },
      { id: 'h11_mug', at: [9.2, 0, -28.75], r: 0.55, steps: ex('rue_mug', 'He\'s on mugs.', null, 0.15) },
      { id: 'h11_ceiling', at: [6.0, 0, -26.3], r: 0.9, steps: ex('ceiling_scorch', 'Two scorch marks. One for leaving, one for coming back. DO NOT PAINT. ^ I wrote that.') },
      { id: 'h11_tv', at: [8.9, 0, -26.2], r: 0.8,
        steps: [{ do: (c) => look(c, 'tv', null, 0.1) }, { wait: 1.6 }, say('luka', 'Every year.'), CUT] },   // (the TV's own screen: the card and the pop-up)
      { id: 'h11_laptop', at: [3.95, 0, -28.6], r: 0.6, steps: ex('laptop', 'He\'ll finish it.', ['s11_folder', {}]) },
      { id: 'h11_kettle', at: 'kettle', r: 0.85, verb: 'Use', kettle: true },
    ],
    steps: [
      ['cutscene', '1.1_open'],
      ['control', 'luka'],
      ['do', (c) => { duties(); holdBed(c); if (!resumed(c.state)) tutorial(c); }],
      ['roam', {
        until: ['s11_polished', 's11_tinsel', 's11_offhold'],
        hint: { after: 150, steps: [{ do: (c) => c.ui.toast('Objectives: top left') }] },
        async auto(c) {   // every task through the real hotspots (on foot), the examines in place, the door, the kettle
          const T = (id) => c.hotspots.trigger(id), f = c.state.flags;
          if (!f.s11_tinsel) {
            await walk(c, [[7.0, 0, -6.9], [8.5, 0, -8.0], [8.5, 0, -10.2], [4.8, 0, -10.5]]);
            if (!f.s11_jordan_down) await T('h11_jordan');
            await walk(c, [M11.lukaLadder]); await T('h11_ladder');
          }
          await T('h11_jordan');
          if (!f.s11_hold1) { await walk(c, [[5.0, 0, -10.5], [8.5, 0, -10.2], [8.5, 0, -8.0], [6.9, 0, -6.9]]); await T('h11_chase_f'); }
          if (!f.s11_offhold) { await walk(c, [[7.4, 0, -7.6]]); await T('h11_chase_b'); }
          await T('h11_chase_b');
          if (!f.s11_polished) { await walk(c, [[6.6, 0, -6.6], M11.luka]); await T('h11_table'); }
          for (const id of ['h11_phones', 'h11_tree', 'h11_plant', 'h11_queue', 'h11_notice', 'h11_office', 'h11_monitor']) await T(id);
          await walk(c, [[6.4, 0, -12.3], [6.6, 0, -19.6]]);
          for (const id of ['h11_polaroid', 'h11_cassette', 'h11_note', 'h11_missing', 'h11_flyer']) await T(id);
          await walk(c, [[6.4, 0, -22.9]]); await T('h11_door');
          const t0 = clock.t;
          await waitUntil(() => c.flow.skipping || flow.sceneId !== '1.1' || !!c.state.flags.s11_door || clock.t - t0 > 14);
          await walk(c, [[6.4, 0, -25.2], [8.9, 0, -28.4]]); await T('h11_kettle');
          for (const id of ['h11_mug', 'h11_tv', 'h11_ceiling', 'h11_laptop']) await T(id);
        },
      }],
      ['objective', null],
      ['cutscene', '1.1_end'],
    ],
    grants: { flags: { s11_table_seen: true, s11_polished: true, s11_jordan_down: true, s11_tinsel: true, s11_hold1: true, s11_offhold: true } },
  };

  // how to move and which key is YES (the first roam of the game), as in Rue's 1.1
  function tutorial(c) {
    const s = input.scheme;
    c.ui.prompt(s === 'pad' ? 'Left stick — Move  ·  A — YES' : s === 'touch' ? 'Stick — Move  ·  YES button — YES' : 'WASD / Arrows — Move  ·  Enter / Space — YES');
    c.wait(1.2).then(() => { if (c.flow.sceneId === '1.1') c.ui.toast('Objectives: top left'); });
  }

  // ---------------------------------------------------------- the opening
  // [CRANE] the anchors s11_crane_a → b → c → d as one chained move
  const CRANE = [
    glide([-2.0, 30, 30], [-2.0, 50, -20], 50, { pos: [-3.3, 5.6, 4.4], look: [-4.0, 4.8, 0.5], fov: 40 }, 3.6, 'in'),
    { wait: 3.6 },
    glide([-3.3, 5.6, 4.4], [-4.0, 4.8, 0.5], 40, { pos: [-1.2, 1.4, 9.0], look: [-2.0, 1.2, 0.0], fov: 45 }, 2.6),
    { wait: 2.6 },
    glide([-1.2, 1.4, 9.0], [-2.0, 1.2, 0.0], 45, { pos: [-2.0, 1.5, 1.6], look: [-2.0, 1.3, -6.0], fov: 48 }, 2.6, 'out'),
  ];
  // [MID · through the glass] (anchor s11_mid_glass, through the clear patch in the snow spray)
  const MID_GLASS = glide([5.6, 1.45, 2.6], [5.6, 1.15, -8.5], 34, { pos: [5.6, 1.38, 0.55], look: [5.75, 1.12, -8.5], fov: 29 }, 6.5);
  // [CLOSE · the glass] steeply down onto the glass between the 3% phones: the fingerprint in the middle, his cloth
  // coming in from the top; room on the right for Chase's finger
  const GLASS = glide([5.66, 1.62, -5.02], [5.74, 0.95, -5.53], 42, { pos: [5.67, 1.55, -5.08], look: [5.75, 0.95, -5.54], fov: 40 }, 9);
  // Luka (not looking up), low across the glass; Chase leaning in over him
  // (a step further back and up than his eye line: Chase's head, bent over him, stays under the top bar)
  const NOT_UP = glide([4.45, 1.32, -4.85], [5.65, 1.3, -6.1], 48, { pos: [4.5, 1.31, -4.92], look: [5.65, 1.3, -6.1], fov: 46 }, 6);
  // [TWO-SHOT · the counter] Luka at the glass foreground, Chase back on the counter with the phone
  const COUNTER2 = glide([5.85, 1.64, -4.3], [6.1, 1.25, -7.2], 46, { pos: [5.87, 1.63, -4.45], look: [6.1, 1.25, -7.2], fov: 45 }, 20);
  // [WIDE] the floor, the radio swinging into its chorus
  const WIDE = glide([10.3, 2.75, -1.4], [5.4, 1.3, -8.6], 52, { pos: [10.1, 2.7, -1.6], look: [5.4, 1.3, -8.6], fov: 50 }, 8);
  // [LOW · Jordan up the ladder, reaching] (anchor s11_ladder_low, drifting up)
  const LOW_J = glide([4.7, 0.45, -10.2], [4.05, 2.4, -11.9], 50, { pos: [4.66, 0.5, -10.28], look: [4.05, 2.45, -11.9], fov: 48 }, 6);

  CUTSCENES['1.1_open'] = [
    { do: (c) => nextTick().then(() => dress11(c)) },
    { if: (s) => resumed(s), then: [
      // Continue (a kettle save): straight back into the store as the flags left it
      { music: 'radio', fade: 0.6 },
      { do: (c) => { const l = act(c, 'luka'); if (l) { l.place(c.state.flags.s11_polished ? [5.6, 0, -6.6, 0] : 's11_polish'); l.play('idle'); } } },
      WIDE,
      { wait: 2.5 },
    ], else: [
      // the opening's blocking (dress11 placed the roam's; this is the script's)
      { do: (c) => nextTick().then(() => {
        const l = act(c, 'luka'), ch = act(c, 'chase'), j = act(c, 'jordan');
        if (l) { l.place(M11.luka); l.play('s11_polish'); l.setExpr('determined'); }
        if (ch) { ch.place(M11.chaseFront); ch.hold('store_phone', 'R'); ch.play('phone_bare'); ch.setExpr('wince'); }
        if (j) { j.place(M11.jordanTop); j.play('reach_up'); coil(c, 'jordan'); }
        const d = P(c, 'door_l'); if (d && d.userData.hold) d.userData.hold(true);
      }) },
      // [CRANE · down out of a blazing blue sky] Past the Yes sign: a Santa hat jammed over the Y, tinsel limp in the
      // heat. Down to the car park shimmering at 34 degrees, past fake-snow spray on the windows, through the doors.
      { loop: 'cicadas', vol: 0.45, fade: 1.0 }, { loop: 'street_arvo', vol: 0.25, fade: 1.0 },
      ...CRANE,
      { wait: 1.6 },
      // (the doors part: the store radio, an instrumental 80s-rock Christmas pastiche)
      { music: 'radio', fade: 0.35 },
      { loop: 'cicadas', stop: true, fade: 1.2 }, { loop: 'street_arvo', stop: true, fade: 1.2 },
      { wait: 1.0 },
      // [MID · through the glass] Inside, Luka crouches at the Hero Table polishing, tongue between his teeth,
      // completely absorbed. Behind him, Chase leans on the counter with the store phone to his ear, eyes closed,
      // suffering. Jordan at the top of a stepladder by the Yes wall holding a fistful of tinsel.
      { do: (c) => { const d = P(c, 'door_l'); if (d && d.userData.hold) d.userData.hold(null); } },
      MID_GLASS,
      { wait: 5.0 },
      // [CLOSE · the glass] A smudge. Luka breathes on it. Polishes. Gone. He moves on.
      { do: (c) => smudge(c, true) },
      GLASS,
      { wait: 1.0 },
      { sfx: 'whoosh', vol: 0.12, rate: 0.55, lp: 900 },
      { do: (c) => { if (!sk(c)) c.world.puff([5.65, 0.99, -5.5], BREATH); } },
      { wait: 0.8 },
      { sfx: 'cloth_swish', vol: 0.35 }, { sfx: 'glass_squeak', vol: 0.25 },
      { wait: 0.5 },
      { do: (c) => smudge(c, false) },
      { wait: 0.6 },
      { do: (c) => { const l = act(c, 'luka'); if (!l) return; const x0 = l.pos.x; tween(c, 0.9, (k) => { l.pos.x = x0 - 0.22 * k; }); } },
      // Behind him, Chase's finger lands on the glass as he leans over to watch. A new smudge.
      { do: (c) => { const ch = act(c, 'chase'); if (ch) { ch.place(M11.chaseLean); ch.play('s11_lean'); ch.setExpr('neutral'); } } },
      { wait: 1.1 },
      { do: (c) => smudge(c, true, SMUDGE_C) },
      { sfx: 'tick', vol: 0.18 },
      { wait: 0.7 },
      // LUKA (not looking up)
      NOT_UP,
      { wait: 0.4 },
      say('luka', 'Chase.'),
      expr('chase', 'sheepish'),
      say('chase', 'Sorry.'),
      // (he straightens and drifts back to the counter, the phone still at his ear)
      play('chase', 'phone_bare'),
      { move: 'chase', to: M11.chaseFront, nowait: true },
      { wait: 0.9 },
      // [TWO-SHOT · the counter] Faintly from Chase's phone comes a tinny chiptune melody: the 1987 Pudding song as hold
      // music. (The radio drops back into the room while we listen.)
      { place: 'chase', at: M11.chaseFront }, play('chase', 'phone_bare'), expr('chase', 'wince'),
      { music: null, fade: 0.9 },
      { loop: 'radio', vol: 0.28, fade: 0.9, at: [7.55, 1.1, -8.78] },
      COUNTER2,
      { wait: 1.8 },
      expr('chase', 'neutral'),
      say('chase', 'It\'s my song.'),
      say('luka', 'I know.'),
      say('chase', 'I\'ve been on hold with head office for forty minutes. ^ With my own song.'),
      say('luka', 'How\'s that feel?'),
      CLOSE('chase', { dist: 1.0, fov: 38, push: 0.06, dur: 7, yaw: 0.35 }),
      say('chase', 'Proud. ^ And then trapped.'),
      // [WIDE] The radio swings into a big chugging guitar chorus (instrumental).
      { loop: 'radio', stop: true, fade: 0.1 },
      { music: 'radio', cut: true },
      HOLD_OFF,
      WIDE,
      { wait: 1.8 },
      expr('chase', 'wince'),
      CLOSE('chase', { dist: 1.0, fov: 38, push: 0.05, dur: 6, yaw: 0.35 }),
      say('chase', 'Can we change the playlist?'),
      CLOSE('luka', { dist: 0.95, fov: 38, push: 0.05, dur: 9, yaw: 0.55, ly: 0.03 }),
      say('luka', 'It\'s Christmas.'),
      CLOSE('chase', { dist: 1.0, fov: 38, push: 0.05, dur: 6, yaw: 0.35 }),
      say('chase', 'It\'s been Bon Jovi since November.'),
      CLOSE('luka', { dist: 0.95, fov: 38, push: 0.05, dur: 6, yaw: 0.55, ly: 0.03 }),
      say('luka', 'Bon Jovi\'s better than Kanye West.'),
      expr('chase', 'suspicious'),
      CLOSE('chase', { dist: 0.95, fov: 37, push: 0.06, dur: 6, yaw: 0.35 }),
      { wait: 0.3 },
      say('chase', '…Nobody said Kanye.'),
      CLOSE('luka', { dist: 0.95, fov: 38, push: 0.04, dur: 6, yaw: 0.55, ly: 0.03 }),
      say('luka', 'Just getting ahead of it.'),
      expr('chase', 'wince'),
      // [LOW · Jordan up the ladder, reaching] The ladder wobbles slightly.
      LOW_J,
      { wait: 1.0 },
      { prop: 'ladder', fn: (o) => { if (o.userData.wobble) o.userData.wobble(); } },
      { sfx: 'creak', vol: 0.3, rate: 1.4 },
      { wait: 0.9 },
      // [CLOSE · Luka] His head snaps up. He's on his feet. (the lens rises with him; then the close, standing)
      expr('luka', 'worried'),
      { do: (c) => { const l = act(c, 'luka'); if (l) l.face([4.05, 0, -11.7], 0); } },
      glide([4.62, 1.22, -7.85], [5.38, 1.0, -6.1], 44, { pos: [4.62, 1.5, -7.85], look: [5.38, 1.58, -6.1], fov: 44 }, 0.75, 'out'),
      { wait: 0.15 },
      play('luka', 'stand', { h: 0.42, dur: 0.55, loop: false }),
      { wait: 0.8 },
      play('luka', 'idle'),
      CLOSE('luka', { dist: 1.05, fov: 38, push: 0.05, dur: 6, yaw: 0.3 }),
      { wait: 0.3 },
      say('luka', 'Jordan. Down. ^ I\'ll do it.'),
      // (Jordan, from the top of the ladder, a hand still up with the tinsel)
      expr('jordan', 'talk'),
      glide([4.95, 0.95, -10.05], [4.05, 2.85, -11.75], 44, { pos: [4.92, 0.98, -10.12], look: [4.05, 2.85, -11.75], fov: 43 }, 5),
      say('jordan', 'I\'m fine—'),
      expr('luka', 'determined'),
      CLOSE('luka', { dist: 0.95, fov: 36, push: 0.08, dur: 5, yaw: 0.25, ly: 0.05 }),
      say('luka', 'I\'ll do it.'),
      { wait: 0.4 },
      expr('luka', 'neutral'),
    ] },
    // (both ways: the roam's blocking; control passes to Luka: a cut to the floor's camera as the bars slide away (a
    // glide out of his close-up would pass through his head))
    { do: (c) => { const l = act(c, 'luka'); if (l) l.play('idle'); roamPlace(c); } },
    CUT,
  ];
  const BREATH = { n: 5, color: 0xf2f6fa, speed: 0.08, life: 0.7, gravity: -0.05 };

  // When all three are ticked, the wall clock reads 11:58. (1.2 opens on Luka stepping back from the table.)
  CUTSCENES['1.1_end'] = [
    HOLD_OFF,
    { do: (c) => { const r = P(c, 'store_radio'); if (r) r.userData.playing = true; } },
    setClock(11, 57),
    { shot: 'CAM', pos: [9.15, 1.75, -7.6], look: [8.4, 2.5, -12.46], fov: 44, to: { pos: [8.45, 2.38, -11.2], look: [8.4, 2.6, -12.46], fov: 30 }, dur: 3.6 },
    { wait: 2.6 },
    setClock(11, 58),
    { sfx: 'tick', vol: 0.25 },
    { wait: 1.0 },
    { shot: 'INSERT', at: 'clock_floor', card: ['clock', { time: '11:58' }] },
    { wait: 2.2 },
  ];
})();
