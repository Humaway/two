// ============================================================ CONTENT: C (Credits) and PC (Post-credits: "Hold")
// BUILD_PROMPT §8 C and PC. Every line is final and word for word; '^' = a beat. Shot tags are quoted in the comments.
// C: the credits mini-game (src/53-mg-credits.js: the song-timed cards over live vignettes on the real sets; it plays
//   "two" + the 1987 coda, reads state.choice for the last card, prebuilds PC's set (reddy26) during the last card and
//   ends on black), then, for Ending A only, the A-only coda "One possible 2040" (CUTSCENES.A_coda, src/71: it starts
//   black, loads reddy26 itself and ends black).
// PC: reddy26, Tue 22 Dec 2026, 12:10, six minutes after the boys vanished: dress `wrecked` + { pc: true } (smoke 0.5
//   over the wreck, tinsel on the floor, the tethers barely moving, the ladder folded against the counter's right end,
//   Luke's office door open). Luke shouts into a phone at his desk through the open door; Jordan stands alone in the
//   middle of it all. The counter phone rings (the store_phone handset is cordless: Jordan carries it). MARGARET is
//   voice only (speaker 'margaret', no actor). HOLD: the 'hold' cue (the 1987 Pudding song, thin chiptune, phone band)
//   as a loop from the handset Jordan lays on the counter, faint and tinny. Then the ladder (reddy26 `ladder`: folded ->
//   carried at his side -> yes_wall), the climb, the tinsel (`tinsel_yes` fallen -> half), black. The flow sets
//   profile.completed when PC ends and returns to the title (Chapter Select and Extras unlock).
// No roam, no kettle (cutscenes only), no samples, no HUD, no music cue (the set's aircon + fluoro, then the hold loop).
(() => {
  const PI = Math.PI;
  const say = (id, text, o) => Object.assign({ say: id, text }, o);
  const line = (id, text, o) => say(id, text, Object.assign({ tag: 'down the line' }, o));
  const sk = (c) => c.flow.skipping;
  const act = (c, id) => c.world.actor(id);
  const P = (c, n) => c.world.prop(n, 'reddy26');
  const ud = (c, n) => { const o = P(c, n); return o ? o.userData : null; };
  const play = (id, anim, o) => ({ act: [[id, anim, o || {}]] });
  const expr = (id, e) => ({ expr: [[id, e]] });
  const lerp = (a, b, u) => a + (b - a) * u;
  const smooth = (u) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
  const glide = (pos, look, fov, pos2, look2, fov2, dur) => ({ shot: 'CAM', pos, look, fov, to: { pos: pos2, look: look2 || look, fov: fov2 || fov }, dur, ease: 'linear' });
  const V1 = new THREE.Vector3();
  const isPC = (c) => c.flow.sceneId === 'PC';

  // a tween on the game clock (fn gets 0..1 eased); snaps to the end while skipping or when the scene changes
  function tween(c, dur, fn) {
    const sid = c.flow.sceneId;
    if (sk(c) || !(dur > 0)) { fn(1); return Promise.resolve(); }
    let t = 0, res = null;
    const f = (dt) => { t = Math.min(1, t + dt / dur); if (flow.sceneId !== sid || flow.skipping) t = 1; fn(smooth(t)); if (t >= 1) { removeUpdate(f); if (res) res(); } };
    addUpdate(f);
    return new Promise((r) => { res = r; });
  }
  // a computed close-up: the lens `dist` m from his eyes, `yaw` rad off his facing (+ = his left), pushing in `push` m
  function closeOn(c, id, o = {}) {
    if (sk(c)) return;
    const a = act(c, id);
    if (!a) return;
    a.eyePos(V1);
    const ry = a.rotY + (o.yaw || 0), d = o.dist || 0.95, pu = o.push ?? 0.12, ly = V1.y - 0.05 + (o.ly || 0);
    const sx = Math.sin(ry), sz = Math.cos(ry), y = V1.y + (o.dy ?? -0.02), f = o.fov || 36;
    c.cam.shot({ shot: 'CAM', pos: [V1.x + sx * d, y, V1.z + sz * d], look: [V1.x, ly, V1.z], fov: f,
      to: { pos: [V1.x + sx * (d - pu), y, V1.z + sz * (d - pu)], look: [V1.x, ly, V1.z], fov: o.fovTo || f }, dur: o.dur || 7, ease: 'linear' });
  }
  const CLOSE = (id, o) => ({ do: (c) => { closeOn(c, id, o); } });

  // ============================================================ anims this file owns (guarded; no allocation per tick)
  const K = () => (typeof RIGKIT !== 'undefined' ? RIGKIT : null);
  let TY = 0, TZ = 0;
  function toT(r, y, z) { const th = r.parts.torso.rotation.x, yy = y - 0.06, cc = Math.cos(th), ss = Math.sin(th); TY = yy * cc + z * ss; TZ = -yy * ss + z * cc; }
  // reach arm `sd` (+1 left, -1 right) `x` out from the centre line to a point `hM` m above the feet and `zM` m ahead
  function reach(r, k, sd, x, hM, zM, px = 0.5, py = -1, pz = -0.4) { toT(r, k.hipsY(r, hM) - r.parts.hips.position.y, k.hipsY(r, zM)); k.arm(r, sd, x, TY, TZ, px, py, pz); }
  const phoneArm = (r, k) => { const d = r.d; k.arm(r, -1, 0.1 * d.hs, d.headC - 0.17, 0.07, 0.5, -1, 0.3); r.parts.handR.rotation.set(0.25, 0, 0.15); };   // = ANIMS.phone's right arm
  function def(n, fn, o) { if (ANIMS[n]) return; ANIMS[n] = fn; if (o && o.upper) fn.upper = true; if (o && o.shows) fn.shows = o.shows; }
  // Luke at his desk, shouting into the phone: the phone at his right ear, the free hand jabbing at the air, leaning in
  def('pc_shout', (r, t, p) => {
    const k = K(); if (!k) return ANIMS.phone(r, t, p);
    k.base(r, t);
    const Pt = r.parts, d = r.d, j = Math.max(0, Math.sin(t * 4.6)) * (0.6 + 0.4 * Math.sin(t * 0.9)), b = Math.sin(t * 2.3);
    Pt.torso.rotation.x += 0.1 + 0.03 * j;
    phoneArm(r, k);
    k.arm(r, 1, d.shX * 0.62 + 0.04 * b, 0.14 + 0.07 * j, 0.28 + 0.1 * j, 1, -1, -0.4);
    Pt.handL.rotation.set(-0.5 * j, 0.3, 0); Pt.head.rotation.x = 0.06 - 0.12 * j; Pt.head.rotation.z = 0.1;
  }, { upper: true, shows: 'phone' });
  // Jordan and the ringing phone: weight back, chin in, both hands up at his middle (a snake on the counter)
  def('pc_snake', (r, t, p) => {
    const k = K(); if (!k) return ANIMS.still(r, t, p);
    k.base(r, t);
    const Pt = r.parts, u = k.ez(Math.min(1, t / 0.6));
    Pt.torso.rotation.x -= 0.12 * u; Pt.head.rotation.x = 0.16 * u; Pt.neck.rotation.x = 0.06 * u;
    reach(r, k, 1, 0.12, lerp(0.8, 1.05, u), lerp(0.04, 0.2, u)); reach(r, k, -1, 0.12, lerp(0.8, 1.02, u), lerp(0.04, 0.18, u));
  }, { upper: true });
  // the handset at his ear (no phone of his own), his left hand out over the counter to the base's HOLD key
  def('pc_press', (r, t, p) => {
    const k = K(); if (!k) return ANIMS.phone_bare(r, t, p);
    k.base(r, t);
    const Pt = r.parts, u = k.ez(Math.min(1, t / 0.55));
    Pt.torso.rotation.x += 0.3 * u;
    phoneArm(r, k);
    reach(r, k, 1, 0.12, lerp(0.85, 1.12, u), lerp(0.06, 0.72, u));
    Pt.handL.rotation.x = 0.6 * u; Pt.head.rotation.x = 0.32 * u;
  }, { upper: true });
  // carrying the folded stepladder at his right side: the right arm straight down, the hand round the top rail
  def('pc_ladder', (r, t, p) => {
    const k = K(); if (!k) return ANIMS.idle(r, t, p);
    if (!p.walk) k.base(r, t);
    const Pt = r.parts;
    reach(r, k, -1, 0.27, 0.86, 0.06, 0.5, -1, -0.2);
    Pt.handR.rotation.set(-0.3, 0, 0.25); Pt.torso.rotation.z += 0.05; Pt.head.rotation.z = -0.03;
  }, { upper: true });

  // ============================================================ PC — "Hold"
  // reddy26 (+Z = the car park, −Z = the backroom). The wreck of the Hero Table (5.6, −5.3); the counter x 3.15..7.85,
  // z −9.45..−8.55, top y 1.0 (the staff side is −Z); the phone's base (7.55, 1.05, −9.2), the radio (7.55, −8.78); the
  // Yes wall x 2.75..5.35 at z −12.5 (the ladder's spot (4.05, −11.75)); Luke's office x 7.65..11, z −12.75..−17 (the
  // door hinge (9.4, −12.62), his desk pc_luke_desk (9.25, −16.35)). Marks: pc_jordan_mid, pc_jordan_phone,
  // pc_ladder_pick, pc_ladder_path, pc_ladder_set, s11_jordan_top.
  const J_MID = [6.0, 0, -6.9, -0.25];                    // pc_jordan_mid, turned to the crater (his face to the wide)
  const PHONE = [7.55, 1.05, -9.2], CRATER = [5.6, 0, -5.3];
  const HANDSET_DOWN = [6.92, 1.022, -8.68];                // laid on the counter by the front edge, left of the radio
  const HOLD_AT = [6.92, 1.06, -8.68];
  const TOP = [4.05, 1.26, -11.7, PI];                      // s11_jordan_top: on the third tread

  // [WIDE · locked] the shop floor from the front right corner: the wreck and its smoke, tinsel on the floor, the
  // counter, the Yes wall and the ladder, and Luke's open office door on the right with Luke at his desk in it
  const WIDE = { shot: 'INSERT', at: 'floor_wreck_wide', locked: true };
  // the ringing phone's view of him (he looks at it the way you'd look at a snake)
  const SNAKE = CLOSE('jordan', { dist: 1.25, push: 0.22, dur: 4.5, fov: 34, dy: -0.06 });
  // MID over the counter from the staff side: he comes to the phone and answers it (the JARVIS screens left)
  const ANSWER = glide([6.82, 1.72, -10.4], [7.12, 1.45, -8.05], 40, [6.85, 1.7, -10.2], [7.13, 1.47, -8.05], 36, 9);
  // his POV: the smoking crater where the display used to be (a slow push down into it)
  const CRATER_POV = glide([7.02, 1.6, -7.82], [5.6, 0.4, -5.3], 44, [6.9, 1.56, -7.62], [5.6, 0.32, -5.3], 34, 4.5);
  // MID from the staff side again, a slow push through Margaret's patience
  const PATIENT = glide([6.55, 1.62, -10.15], [7.15, 1.52, -8.05], 36, [6.6, 1.6, -9.95], [7.15, 1.54, -8.05], 30, 14);
  // [INSERT] the base on the counter: he presses HOLD (the card covers the centre; his hand comes into the lens)
  const HOLD_INSERT = { shot: 'INSERT', at: 'counter_phone', card: ['pc_hold', { pressed: false }] };

  // the counter phone rings (a 2026 landline's double trill, every 1.6 s) until he answers or the scene moves on
  const RING_O = { vol: 0.5, at: PHONE, ref: 4 };
  let ringing = false, ringT = 0, ringSid = null, ringUD = null;
  function ringTick(dt) {
    ringT -= dt;
    if (!ringing || flow.sceneId !== ringSid || flow.skipping) {
      ringing = false; removeUpdate(ringTick);
      if (ringUD && ringUD.ring) ringUD.ring(false);
      ringUD = null; return;
    }
    if (ringT <= 0) { ringT = 1.6; sfx('trill', RING_O); }
  }
  function ringOn(c) {
    if (sk(c)) return;
    ringUD = ud(c, 'store_phone'); if (ringUD && ringUD.ring) ringUD.ring(true);
    ringT = 0; ringSid = c.flow.sceneId; ringing = true; addUpdate(ringTick);
  }
  function ringOff(c) {
    ringing = false;
    const u = ud(c, 'store_phone'); if (u && u.ring) u.ring(false);
  }

  // the carried ladder: in his hands, then the set's 'carried' state lays it along his right side (the top rail at his
  // right hand, 0.86 m up)
  function carryLadder(c) {
    const j = act(c, 'jordan'), lad = P(c, 'ladder');
    if (!j || !lad) return;
    if (j.held !== lad) j.hold(lad);
    if (j.held !== lad) return;
    if (lad.userData.set) lad.userData.set('carried');
    j.play('pc_ladder');
  }
  // the ladder stood open at the Yes wall (from his hands, or straight there when skipped / on Continue)
  function ladderUp(c) {
    const j = act(c, 'jordan'), lad = P(c, 'ladder');
    if (j && lad && j.held === lad) j.hold(null);
    if (lad && lad.userData.set) lad.userData.set('yes_wall');
    if (j) j.play('idle');
  }
  // the receiver goes down on the counter (not on its cradle: that would hang up on her), still holding her
  function receiverDown(c) {
    const j = act(c, 'jordan'), h = P(c, 'store_phone');
    if (j && h && j.held === h) j.hold(null);
    if (h) { h.position.set(HANDSET_DOWN[0], HANDSET_DOWN[1], HANDSET_DOWN[2]); h.rotation.set(0, 0.42, 0); }
  }
  // the set at the scene's start (also Continue / Chapter Select: everything from step 0)
  function dressPC(c) {
    ringing = false;
    const S = SETS.reddy26; if (S && S.dress) S.dress('wrecked', { pc: true });
    const j = act(c, 'jordan'), lk = act(c, 'luke');
    if (j) {
      if (j.held) j.hold(null);
      j.visible = true; j.rig.seated = false; j.rig.floorSit = false;
      j.place(J_MID); j.play('idle'); j.setExpr('stunned');
    }
    if (lk) {
      if (lk.held) lk.hold(null);
      lk.visible = true; lk.rig.seated = false; lk.rig.floorSit = false;
      lk.place('pc_luke_desk'); lk.play('pc_shout'); lk.setExpr('determined');
    }
    const s = ud(c, 'smoke_floor'); if (s && s.amount) s.amount(0.5, 0);
  }
  // the card: he presses HOLD (the key goes down and lights; the LCD says so)
  function pressHold(c) {
    if (sk(c)) return;
    c.ui.card('pc_hold', { pressed: true });
    c.sfx('button_press', { vol: 0.45 });
  }
  // up the ladder: the climb, his root rising to the third tread (a tween, snapped when skipped)
  function climb(c) {
    const j = act(c, 'jordan');
    if (!j) return;
    if (sk(c)) { j.place(TOP); j.play('reach_up'); return; }
    const x0 = j.pos.x, y0 = j.pos.y, z0 = j.pos.z;
    j.face(PI, 0.2);
    j.play('climb', { speed: 1.1 });
    c.sfx('creak', { vol: 0.28, rate: 1.2, at: [4.05, 0.8, -11.75] });
    return tween(c, 1.5, (k) => { j.pos.set(lerp(x0, TOP[0], k), lerp(y0, TOP[1], k), lerp(z0, TOP[2], k)); }).then(() => { if (isPC(c)) { j.place(TOP); j.play('still'); } });
  }
  // the tinsel: up off the floor and along the top of the Yes wall, the left swag first (he's started)
  function hangTinsel(c) {
    const j = act(c, 'jordan');
    if (j) { j.place(TOP); j.play('reach_up'); }
    const lad = ud(c, 'ladder'); if (lad && lad.wobble) lad.wobble();
    if (sk(c)) { const t = ud(c, 'tinsel_yes'); if (t && t.set) t.set('half'); return; }
    return c.wait(0.9).then(() => {
      if (!isPC(c)) return;
      const t = ud(c, 'tinsel_yes'); if (t && t.set) t.set('half');
      c.sfx('cloth_swish', { vol: 0.3 });
    });
  }
  // the end state, whatever was skipped: on the ladder, the swag up, the receiver on the counter
  function endState(c) {
    ringOff(c);
    receiverDown(c);
    const lad = P(c, 'ladder'), j = act(c, 'jordan');
    if (lad && j && j.held === lad) j.hold(null);
    if (lad && lad.userData.set) lad.userData.set('yes_wall');
    const t = ud(c, 'tinsel_yes'); if (t && t.set) t.set('half');
    if (j) { j.place(TOP); j.play('reach_up'); }
  }

  SCENES.C = {
    title: 'Credits', set: 'parade', env: 'wp_washed',
    playable: [], swap: false, hud: null, music: null, timeCard: false,
    steps: [
      ['minigame', 'credits', {}],
      // Ending A only: "One possible 2040" (src/71's coda; it starts black, loads reddy26 itself, ends black)
      ['do', (c) => (codaA(c) ? c.world.prebuild('reddy26') : null)],
      ['do', (c) => (codaA(c) ? c.playCutscene('A_coda') : null)],
    ],
    grants: {},
  };
  function codaA(c) {
    const ch = c.state.choice || (typeof TEST !== 'undefined' && TEST.ending) || 'A';
    return ch === 'A' && !!CUTSCENES.A_coda;
  }

  SCENES.PC = {
    title: 'Hold', set: 'reddy26', env: 'day', time: 'Tuesday 22 December 2026, 12:10', place: 'Optus Redcliffe',
    playable: [], swap: false, hud: null, music: null,
    spawn: { jordan: J_MID, luke: 'pc_luke_desk' },
    steps: [
      ['do', dressPC],
      ['cutscene', 'PC_hold'],
    ],
    grants: {},
  };

  CUTSCENES.PC_hold = [
    // 1. [WIDE · locked] The 2026 shop floor, six minutes after the boys vanished. Smoke still hangs over the wreck of
    // the Hero Table. Tinsel on the floor. Through the office door, Luke shouting into a phone. Jordan stands alone in
    // the middle of it all.
    WIDE,
    { wait: 1.8 },
    say('luke', '—the WHOLE table—', { tag: 'off' }),
    { wait: 1.2 },
    // 2. The counter phone rings. Jordan looks at it the way you'd look at a snake.
    { do: ringOn },
    { wait: 1.0 },
    { face: 'jordan', to: PHONE, dur: 0.8 },
    expr('jordan', 'scared'),
    { wait: 1.0 },
    SNAKE,
    play('jordan', 'pc_snake'),
    { wait: 2.6 },
    // (he goes to it, the way you'd go to a snake)
    expr('jordan', 'worried'),
    ANSWER,
    play('jordan', 'idle'),
    { move: 'jordan', to: 'pc_jordan_phone', speed: 0.85 },
    { wait: 0.35 },
    { do: ringOff },
    { hold: 'jordan', prop: 'store_phone', hand: 'R' },
    play('jordan', 'phone_bare'),
    { sfx: 'clunk', vol: 0.22, rate: 1.3 },
    { wait: 0.5 },
    // 3. JORDAN: (answering)
    say('jordan', '…Optus Redcliffe, Jordan speaking.'),
    // 4. MARGARET: (voice only, down the line)
    line('margaret', 'Hello, love, it\'s Margaret. ^ Is Chase there? It\'s about my grandson\'s plan.'),
    // 5. [CLOSE · Jordan] He looks at the smoking crater where the display used to be.
    { face: 'jordan', to: CRATER, dur: 0.9 },
    { wait: 1.0 },
    CLOSE('jordan', { dist: 1.0, push: 0.14, dur: 6, fov: 36, yaw: 0.45 }),
    expr('jordan', 'stunned'),
    { wait: 1.3 },
    CRATER_POV,
    { wait: 2.4 },
    CLOSE('jordan', { dist: 0.9, push: 0.1, dur: 6, fov: 34, yaw: 0.3 }),
    expr('jordan', 'still'),
    { wait: 0.4 },
    // 6.
    say('jordan', '…He\'s in 2040.'),
    // 7.
    line('margaret', 'Oh. ^ I\'ll wait.'),
    { face: 'jordan', to: PI, dur: 0.6 },
    PATIENT,
    expr('jordan', 'worried'),
    { wait: 0.3 },
    // 8.
    say('jordan', 'It might be a while.'),
    // 9.
    line('margaret', 'I\'ve been coming here since it was a video shop, love. ^ I can wait.'),
    expr('jordan', 'sheepish'),
    { wait: 0.5 },
    // 10.
    say('jordan', '…I\'ll put you on hold.'),
    // 11. [INSERT] He presses HOLD. Faint and tinny down the line, the hold music starts: the 1987 Pudding song.
    play('jordan', 'pc_press'),
    HOLD_INSERT,
    { wait: 1.0 },
    { do: pressHold },
    { loop: 'hold', vol: 0.17, at: HOLD_AT, ref: 6, fade: 0.4 },   // (ref 6: still there, faintly, in the wide)
    { wait: 2.6 },
    // 12. [WIDE · locked] Jordan, alone, smoke, tinsel. He sets the receiver down, picks up the stepladder, carries it
    // to the Yes wall, climbs it, and starts hanging the tinsel himself.
    WIDE,
    play('jordan', 'phone_bare'),
    expr('jordan', 'neutral'),
    { wait: 0.9 },
    play('jordan', 'give', { dur: 1.1 }),
    { wait: 0.55 },
    { do: receiverDown },
    { sfx: 'clunk', vol: 0.14, rate: 1.4, at: HANDSET_DOWN },
    { wait: 0.6 },
    play('jordan', 'idle'),
    { wait: 0.3 },
    { move: 'jordan', to: 'pc_ladder_pick', speed: 1.0 },
    { wait: 0.3 },
    { do: carryLadder },
    { sfx: 'clunk', vol: 0.2, rate: 0.8, at: [8.0, 0.8, -8.7] },
    expr('jordan', 'determined'),
    { wait: 0.4 },
    { move: 'jordan', to: 'pc_ladder_path', speed: 1.15, face: false },
    { move: 'jordan', to: 'pc_ladder_set', speed: 1.15 },
    { do: ladderUp },
    { sfx: 'clunk', vol: 0.24, rate: 0.75, at: [4.05, 0.5, -11.75] },
    { wait: 0.7 },
    { do: climb },
    { do: hangTinsel },
    { wait: 2.2 },
    // 13. Black. (Return to the title screen: the flow, with Chapter Select and Extras unlocked.)
    { loop: 'hold', stop: true, fade: 2.0 },
    { fade: 'out', dur: 1.8 },
    { do: endState },
    { wait: 0.4 },
  ];

  // ============================================================ the INSERT card: the counter phone's base, HOLD
  // A 2026 office cordless base seen from above: the empty cradle (he has the handset), the LCD, the keypad, the HOLD
  // key with its LED; Jordan's fingertip over it, then on it (pressed: the key down, the LED lit, the LCD on hold).
  const rr = (cx, x, y, w, h, r) => { cx.beginPath(); cx.roundRect(x, y, w, h, r); };
  const SANS = '"Trebuchet MS", "Segoe UI", system-ui, sans-serif', LCD = '"Courier New", ui-monospace, Menlo, monospace';
  function txt(cx, s, x, y, px, col, al = 'center', w = '700', font = SANS) { cx.font = `${w} ${px}px ${font}`; cx.fillStyle = col; cx.textAlign = al; cx.textBaseline = 'middle'; cx.fillText(s, x, y); }
  function key(cx, x, y, w, h, label, col, tcol, down, px = 30, ly = 0.5) {
    cx.fillStyle = 'rgba(0,0,0,0.55)'; rr(cx, x + 2, y + (down ? 3 : 7), w, h, 12); cx.fill();
    const g = cx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, down ? col[1] : col[0]); g.addColorStop(1, col[1]);
    cx.fillStyle = g; rr(cx, x, y + (down ? 4 : 0), w, h, 12); cx.fill();
    cx.strokeStyle = 'rgba(255,255,255,0.12)'; cx.lineWidth = 2; rr(cx, x + 1, y + (down ? 5 : 1), w - 2, h - 2, 11); cx.stroke();
    txt(cx, label, x + w / 2, y + h * ly + (down ? 5 : 1), px, tcol);
  }
  CARDS.pc_hold = (cx, w, h, d) => {
    const on = !!d.pressed;
    // the body
    cx.save(); cx.shadowColor = 'rgba(0,0,0,0.5)'; cx.shadowBlur = 30; cx.shadowOffsetY = 14;
    const bg = cx.createLinearGradient(0, 40, 0, h - 40); bg.addColorStop(0, '#3a3d43'); bg.addColorStop(1, '#232529');
    cx.fillStyle = bg; rr(cx, 34, 44, w - 68, h - 88, 46); cx.fill(); cx.restore();
    cx.strokeStyle = '#4c5058'; cx.lineWidth = 3; rr(cx, 37, 47, w - 74, h - 94, 44); cx.stroke();
    // the empty cradle, the charging contacts
    cx.fillStyle = '#141518'; rr(cx, 70, 86, 168, h - 172, 30); cx.fill();
    cx.strokeStyle = '#0b0c0e'; cx.lineWidth = 4; rr(cx, 72, 88, 164, h - 176, 28); cx.stroke();
    cx.fillStyle = '#c9a24a'; cx.fillRect(132, h - 150, 14, 26); cx.fillRect(162, h - 150, 14, 26);
    txt(cx, 'Optus', 154, 132, 22, '#6b7079', 'center', '700');
    // the LCD
    const lx = 272, ly = 84, lw = w - 272 - 70, lh = 104;
    cx.fillStyle = '#15171a'; rr(cx, lx - 8, ly - 8, lw + 16, lh + 16, 14); cx.fill();
    const lg = cx.createLinearGradient(0, ly, 0, ly + lh); lg.addColorStop(0, on ? '#c2d49e' : '#a9b78f'); lg.addColorStop(1, on ? '#a9bd83' : '#929f7b');
    cx.fillStyle = lg; rr(cx, lx, ly, lw, lh, 8); cx.fill();
    txt(cx, 'LINE 1', lx + 18, ly + 30, 28, '#27301f', 'left', '700', LCD);
    if (on) { txt(cx, 'ON HOLD', lx + lw - 18, ly + 72, 38, '#1b2214', 'right', '700', LCD); txt(cx, '♪', lx + 30, ly + 74, 34, '#1b2214', 'center', '700'); }
    else { txt(cx, '00:47', lx + lw - 18, ly + 30, 28, '#27301f', 'right', '700', LCD); txt(cx, 'REDCLIFFE', lx + lw - 18, ly + 74, 26, '#3a4530', 'right', '700', LCD); }
    // the keypad
    const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'], kx = 272, ky = 222, kw = 64, kh = 46, gx = 14, gy = 14;
    for (let i = 0; i < 12; i++) key(cx, kx + (i % 3) * (kw + gx), ky + Math.floor(i / 3) * (kh + gy), kw, kh, KEYS[i], ['#5a5f68', '#3b3f46'], '#eef0f3', false, 26);
    // the function keys: TALK, HOLD (with its LED), REDIAL
    const fx = kx + 3 * (kw + gx) + 18, fw = w - fx - 70;
    key(cx, fx, ky, fw, kh, 'TALK', ['#3f9a5a', '#2a6e3e'], '#eafbe9', false, 24);
    key(cx, fx, ky + kh + gy, fw, kh * 2 + gy, 'HOLD', on ? ['#9e1f1f', '#7a1414'] : ['#d23a32', '#a62620'], '#ffffff', on, 36, 0.3);
    key(cx, fx, ky + 3 * (kh + gy), fw, kh, 'REDIAL', ['#5a5f68', '#3b3f46'], '#eef0f3', false, 22);
    const ledX = fx + 20, ledY = ky + kh + gy + 18 + (on ? 4 : 0);
    if (on) { const rg = cx.createRadialGradient(ledX, ledY, 1, ledX, ledY, 22); rg.addColorStop(0, 'rgba(255,90,70,0.95)'); rg.addColorStop(1, 'rgba(255,60,40,0)'); cx.fillStyle = rg; cx.beginPath(); cx.arc(ledX, ledY, 22, 0, PI * 2); cx.fill(); }
    cx.fillStyle = on ? '#ffd0c4' : '#5a1210'; cx.beginPath(); cx.arc(ledX, ledY, 6, 0, PI * 2); cx.fill();
    // his fingertip, in from the lower right: over the key, then on it
    const tx = fx + fw * (on ? 0.6 : 0.7), ty = ky + kh + gy + (kh * 2 + gy) * (on ? 0.74 : 0.86);
    cx.save(); cx.translate(tx, ty); cx.rotate(-0.62);
    if (!on) { cx.fillStyle = 'rgba(0,0,0,0.28)'; cx.beginPath(); cx.ellipse(-16, 30, 40, 150, 0, 0, PI * 2); cx.fill(); }
    const fg = cx.createLinearGradient(-38, 0, 38, 0); fg.addColorStop(0, '#6e4329'); fg.addColorStop(0.45, '#9a6646'); fg.addColorStop(1, '#73472c');
    cx.fillStyle = fg; cx.beginPath(); cx.moveTo(-38, 260); cx.lineTo(-36, 20); cx.quadraticCurveTo(-34, -34, 0, -36); cx.quadraticCurveTo(34, -34, 36, 20); cx.lineTo(40, 260); cx.closePath(); cx.fill();
    cx.fillStyle = '#c99a7e'; rr(cx, -22, -30, 44, 40, 16); cx.fill();
    cx.fillStyle = 'rgba(255,255,255,0.25)'; rr(cx, -16, -26, 18, 14, 7); cx.fill();
    cx.strokeStyle = 'rgba(60,34,20,0.5)'; cx.lineWidth = 3; cx.beginPath(); cx.moveTo(-26, 96); cx.quadraticCurveTo(0, 104, 26, 96); cx.stroke();
    cx.restore();
  };
  CARDS.pc_hold.size = [760, 560];

  // scene watcher: a ladder or a receiver still in his hands when the scene ends (Quit, Chapter Select) goes home
  function cleanup() {
    ringing = false;
    if (typeof world === 'undefined' || !world.actor) return;
    const j = world.actor('jordan');
    if (j && j.held && (j.held.name === 'ladder' || j.held.name === 'store_phone')) j.hold(null);
  }
  if (typeof on === 'function') on('flow:stop', cleanup);
})();
