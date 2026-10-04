// ============================================================ CONTENT: 1.2 ("Accept the Charges") and 1.3 ("Before Lunch")
// BUILD_PROMPT §8. Every line is final and word for word; '^' = a beat. Shot tags are quoted in the comments.
// Set: reddy26 (docs/sets/reddy26.md: the Hero Table, the blast, the counter, the corridor, the backroom). 1.3's split
// screen puts reddy40 (docs/sets/reddy40.md, dress split13: the machine and Des) in the right half.
// Mini-games: stall (src/41: rounds 1–3, then 4–5 with drift) and wiring (src/42: halves 1 and 2). Their lines (Luke's
// five rounds, "…Who's that?" / "Chase's uncle.", Jordan's "I was up a LADDER." off, Chase (2040)'s colour hints) are
// said by them, not here.
// 1.2: no player. 1.3: Luka ⇄ Chase, the SWAP tutorial: Stall rounds 1–3 → SWAP → Wiring half 1 → SWAP → rounds 4–5 →
// SWAP → Wiring half 2; the optional Display alarm sample at the backroom door's window; the kettle saves.
(() => {
  const PI = Math.PI, H = PI / 2;
  const say = (id, text, o) => Object.assign({ say: id, text }, o);
  const sk = (c) => c.flow.skipping;
  const P = (c, n) => c.world.prop(n);
  const act = (c, id) => c.world.actor(id);
  const V1 = new THREE.Vector3(), V2 = new THREE.Vector3();
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
    c.cam.shot({ shot: 'CAM', pos: [V1.x + sx * d, y, V1.z + sz * d], look: [V1.x, ly, V1.z], fov: f, roll: o.roll || 0,
      to: { pos: [V1.x + sx * (d - pu), y + (o.rise || 0), V1.z + sz * (d - pu)], look: [V1.x, ly + (o.lookRise || 0), V1.z], fov: o.fovTo || f }, dur: o.dur || 7, ease: o.ease || 'linear' });
  }
  const CLOSE = (id, o) => ({ do: (c) => closeOn(c, id, o) });
  // turn now (under a cut: the next computed close reads the final facing)
  const turn = (id, to) => ({ do: (c) => { const a = act(c, id); if (a) a.face(to, 0); } });
  const turnSlow = (id, to, dur = 0.4) => ({ face: id, to, dur });
  const play = (id, anim, o) => ({ act: [[id, anim, o || {}]] });
  const expr = (id, e) => ({ expr: [[id, e]] });
  // autoplay: SWAP until `id` leads (bounded)
  const swapTo = (c, id) => { for (let i = 0; i < 3 && c.state.active !== id; i++) c.flow.swapNext(); };
  // walk the active character through waypoints (autoplay solves the roams on foot, through the real hotspots)
  async function walk(c, pts) {
    const sid = c.flow.sceneId;
    for (const p of pts) {
      const a = act(c, c.state.active);
      if (!a || c.flow.sceneId !== sid) break;
      await a.moveTo(p);
    }
  }
  const setClock = (h, m) => ({ prop: 'clock_hands', fn: (o) => { if (o.userData.set) o.userData.set(h, m); } });
  // a set anchor's lens (SETS.reddy26.anchors: from → at, fov) gliding by (dpos, dlook) to fov `f` over `dur` s
  const add3 = (a, d) => [a[0] + d[0], a[1] + d[1], a[2] + d[2]];
  function glideA(n, dpos, dlook, f, dur) {
    const a = SETS.reddy26 && SETS.reddy26.anchors && SETS.reddy26.anchors[n];
    if (!a) { console.warn('TWO 1.2: no anchor ' + n); return { wait: 0 }; }
    return { shot: 'CAM', pos: a.from.slice(), look: a.at.slice(), fov: a.fov, to: { pos: add3(a.from, dpos), look: add3(a.at, dlook), fov: f }, dur, ease: 'linear' };
  }

  // ---------------------------------------------------------- anims this file owns (guarded; no allocation per tick)
  // Luka blown backwards off his feet (1.2 step 16-18): the root faces the way he flies (−Z), the hips turn round to
  // face the blast and tumble back over the flight (+X rotation about the root's X = the head leads the fall).
  if (!ANIMS.s12_fly) {
    ANIMS.s12_fly = (r, t) => {
      const P_ = r.parts, s = Math.sin;
      r.seated = false; r.floorSit = false;
      const a = Math.min(2.5, 0.55 + t * 3.0);
      P_.hips.rotation.set(a, PI, 0);
      P_.legL.rotation.set(-1.0 - 0.3 * s(t * 9), 0, 0.18); P_.shinL.rotation.x = 1.1;
      P_.legR.rotation.set(-0.45 + 0.3 * s(t * 9 + 1), 0, -0.22); P_.shinR.rotation.x = 0.55;
      P_.armL.rotation.set(-2.3 + 0.45 * s(t * 11), 0, 0.7); P_.foreL.rotation.x = -0.6;
      P_.armR.rotation.set(-1.8 + 0.45 * s(t * 11 + 1.3), 0, -0.8); P_.foreR.rotation.x = -0.5;
      P_.torso.rotation.x = -0.2; P_.head.rotation.x = 0.3;
    };
  }
  // Luka hauling himself up and over the counter (1.2 step 31): crouched, both hands planted forward, one knee up
  if (!ANIMS.s12_over) {
    ANIMS.s12_over = (r, t, p) => {
      const k = K(); if (!k) return ANIMS.idle(r, t, p);
      const P_ = r.parts, d = r.d;
      k.base(r, t);
      P_.torso.rotation.x = 0.6; P_.head.rotation.x = -0.35;
      k.arm(r, 1, 0.17, -0.12, 0.44, 1, -0.6, -0.4); k.arm(r, -1, 0.17, -0.12, 0.44, 1, -0.6, -0.4);
      P_.handL.rotation.x = -0.6; P_.handR.rotation.x = -0.6;
      P_.legL.rotation.x = -1.3; P_.shinL.rotation.x = 1.7; P_.legR.rotation.x = -0.35; P_.shinR.rotation.x = 0.45;
      if (d) P_.hips.position.y -= 0.02;
    };
  }
  // Chase frowns at the receiver (1.2 step 9): held out in front of his face, his head tipped toward it
  if (!ANIMS.s12_receiver) {
    ANIMS.s12_receiver = (r, t, p) => {
      const k = K(); if (!k) return ANIMS.phone(r, t, p);
      k.base(r, t);
      const P_ = r.parts, d = r.d;
      k.arm(r, -1, 0.07, d.headC - 0.24, 0.27, 1, -1, -0.2);
      P_.handR.rotation.set(-0.2, 0.2, 0.5); P_.head.rotation.set(0.12, -0.16, 0.05);
    };
    ANIMS.s12_receiver.upper = true;
  }
  // the figure coughs in the smoke (1.2 step 19): the back of his left hand to his mouth, two jolts
  if (!ANIMS.s12_cough) {
    ANIMS.s12_cough = (r, t, p) => {
      const k = K(); if (!k) return ANIMS.idle(r, t, p);
      k.base(r, t);
      const P_ = r.parts, d = r.d, u = k.once(t, p, 1.4), up = u < 0.2 ? k.ez(u / 0.2) : u > 0.8 ? k.ez((1 - u) / 0.2) : 1;
      const j = u > 0.2 && u < 0.75 ? Math.pow(Math.max(0, Math.sin((u - 0.2) * 2 * PI / 0.27)), 6) : 0;
      k.arm(r, 1, 0.05 + 0.12 * (1 - up), (d.headC - 0.22) * up - 0.1 * (1 - up), 0.14 + 0.06 * up, 1, -1, -0.3);
      P_.handL.rotation.set(-0.5 * up, 0, -0.4 * up);
      P_.torso.rotation.x += 0.16 * j; P_.head.rotation.x += 0.18 * j + 0.05 * up;
    };
  }
  // the collar turned down (1.2 step 23): both hands to the collar at the neck, out and down, then away
  if (!ANIMS.s12_collar) {
    ANIMS.s12_collar = (r, t, p) => {
      const k = K(); if (!k) return ANIMS.idle(r, t, p);
      k.base(r, t);
      const P_ = r.parts, d = r.d, u = k.once(t, p, 1.8);
      const up = u < 0.25 ? k.ez(u / 0.25) : u > 0.75 ? k.ez((1 - u) / 0.25) : 1, fold = u < 0.35 ? 0 : u > 0.65 ? 1 : k.ez((u - 0.35) / 0.3);
      const y = (d.headC - 0.3 - 0.05 * fold) * up - 0.12 * (1 - up), x = 0.07 + 0.06 * fold + 0.08 * (1 - up), z = 0.06 + 0.05 * up;
      k.arm(r, 1, x, y, z, 1, -0.6, -0.5); k.arm(r, -1, x, y, z, 1, -0.6, -0.5);
      P_.handL.rotation.set(-0.3 * up, 0, -0.9 * up); P_.handR.rotation.set(-0.3 * up, 0, 0.9 * up);
      P_.head.rotation.x = 0.08 * up;
    };
  }
  // Chase (2040) brushes the glass dust off Luka's shoulder with his left hand (1.2 step 32): reach, three strokes, back
  if (!ANIMS.s12_brush) {
    ANIMS.s12_brush = (r, t, p) => {
      const k = K(); if (!k) return ANIMS.give(r, t, p);
      k.base(r, t);
      const P_ = r.parts, d = r.d, u = k.once(t, p, 2.4), reach = u < 0.22 ? k.ez(u / 0.22) : u > 0.82 ? k.ez((1 - u) / 0.18) : 1;
      const st = u > 0.25 && u < 0.78 ? Math.sin((u - 0.25) / 0.53 * 3 * PI) : 0;
      k.arm(r, 1, d.shX * 0.55 - 0.04 * st, d.armY * 0.8 * reach - 0.1 * (1 - reach) + 0.025 * Math.abs(st), 0.12 + 0.36 * reach, 1, -0.7, -0.4);
      P_.handL.rotation.set(0.35 * reach, 0, 0.25 * st);
      P_.head.rotation.x = 0.12 * reach; P_.head.rotation.y = 0.12 * reach; P_.torso.rotation.x += 0.05 * reach;
    };
  }
  // Chase scoops a tether off the floor (1.2 step 65): a quick crouch, the right hand down to the floor
  if (!ANIMS.s12_scoop) {
    ANIMS.s12_scoop = (r, t, p) => {
      const k = K(); if (!k) return ANIMS.duck(r, t, p);
      const u = k.once(t, p, 0.9), dn = u < 0.45 ? k.ez(u / 0.45) : k.ez((1 - u) / 0.55);
      ANIMS.idle(r, t, p);
      const P_ = r.parts, d = r.d, hy = d.hipY * (1 - 0.38 * dn);
      P_.hips.position.y = hy;
      k.leg(r, 1, d.hipX * 1.1, d.footH - hy, 0.1 * dn); k.leg(r, -1, d.hipX * 1.1, d.footH - hy, 0.22 * dn); k.flat(r);
      P_.torso.rotation.x = 0.85 * dn; P_.head.rotation.x = -0.2 * dn;
      k.arm(r, -1, 0.16, -0.2 - 0.25 * dn, 0.2 + 0.28 * dn, 1, -0.6, -0.4);
    };
  }
  // Chase (2040) shows the Remote (1.3 setup): held up in his right hand (it rides the right grip) in front of his chest
  if (!ANIMS.s13_show) {
    ANIMS.s13_show = (r, t, p) => {
      const k = K(); if (!k) return ANIMS.give(r, t, p);
      k.base(r, t);
      const d = r.d;
      k.arm(r, -1, 0.1, d.armY * 0.55, 0.34, 1, -1, -0.3);
      r.parts.handR.rotation.set(-0.5, 0, 0.3); r.parts.head.rotation.x = 0.16;
    };
    ANIMS.s13_show.upper = true;
  }
  // "I've got hand." (1.3 setup): the scarred right hand held up at face height, the back of it to the room
  if (!ANIMS.s13_hand) {
    ANIMS.s13_hand = (r, t, p) => {
      const k = K(); if (!k) return ANIMS.idle(r, t, p);
      k.base(r, t);
      const P_ = r.parts, d = r.d, u = k.ez(Math.min(1, t / 0.5));
      k.arm(r, -1, d.shX * 0.55, (d.headC - 0.2) * u - 0.1 * (1 - u), 0.12 + 0.2 * u, 1, -1, -0.2);
      P_.handR.rotation.set(-0.2 * u, -1.2 * u, 0.2 * u); P_.head.rotation.y = -0.08 * u;
    };
    ANIMS.s13_hand.upper = true;
  }
  // Jordan with a hand on the ladder (1.3 step 23)
  if (!ANIMS.s13_ladder) {
    ANIMS.s13_ladder = (r, t, p) => {
      const k = K(); if (!k) return ANIMS.idle(r, t, p);
      k.base(r, t);
      k.arm(r, -1, 0.16, 0.18, 0.3, 1, -1, -0.4);
      r.parts.handR.rotation.set(-0.4, 0, 0.2); r.parts.head.rotation.y = 0.1;
    };
    ANIMS.s13_ladder.upper = true;
  }

  // ==================================================================== 1.2 — "Accept the Charges"
  // reddy26 (+Z = the car park, −Z = the backroom). The Hero Table centre (5.6, −5.3), top y 0.95; the counter x 3.15..7.85,
  // z −9.45..−8.55, top y 1.0 (the glass showcase x 4.75..6.45 is open on the staff side); the store phone (7.55, 1.05,
  // −9.2); Chase on it at s11_chase_phone (7.15, −9.95). Luka admires the table at s12_luka_admire (5.6, −7.05).
  const J12 = [-1.3, 0, -8.2, 1.1];                       // Jordan tidying the left display table, clear of the flight
  const LUKA_START = [5.6, 0, -6.72, 0], LUKA_ADMIRE = [5.6, 0, -7.05, 0];
  // the flight: the root (his feet) on a parabola at x 5.6, from where he stood to the floor behind the counter
  const FLIGHT = [[5.6, 0.47, -7.5], [5.6, 0.86, -8.0], [5.6, 1.09, -8.5], [5.6, 1.15, -8.9], [5.6, 1.09, -9.3], [5.6, 0.88, -9.7], [5.6, 0.53, -10.15], [5.6, 0.0, -10.62]];
  const LAND = [5.6, 0, -10.62, PI];                     // on his back behind the showcase, his head toward the counter
  const FIG_AT = [5.6, 0, -5.3, PI], FIG_OUT = [5.85, 0, -6.15, 2.81];   // out of the wreck, facing Chase at the phone
  const LUKA_OVER = [5.4, 0, -7.9, 0], C40_BRUSH = [5.5, 0, -7.25, PI], C40_GAP = [5.75, 0, -6.55, 2.91];

  // [LOW · heroic, up past the glittering edge of the Hero Table] (anchor s12_heroic: the lens just above the glass top,
  // y 0.95: below it the top's underside hides his face). Ending B match-cuts back to this frame.
  const HEROIC = glideA('s12_heroic', [0.03, 0.03, -0.14], [0, 0.04, 0], 40, 6);
  // the phone ringing on the counter
  const RING = { shot: 'CAM', pos: [7.25, 1.42, -8.55], look: [7.55, 1.03, -9.22], fov: 32, to: { pos: [7.28, 1.38, -8.65], look: [7.55, 1.03, -9.22], fov: 30 }, dur: 3, ease: 'linear' };
  // [TWO-SHOT · Luka in the foreground, admiring the table, back to Chase] (anchor s12_twoshot: from the table's right
  // end, so the JARVIS monitor (x 6.4) isn't between the lens and Chase at the phone)
  const TWOSHOT = glideA('s12_twoshot', [-0.05, 0, -0.15], [0, 0.01, 0], 45, 8);
  // [CLOSE · Luka] looking down at his reflection: from just past the glass edge, below his face, looking up
  const REFLECT = { shot: 'CAM', pos: [5.48, 1.08, -6.08], look: [5.6, 1.56, -7.05], fov: 34, to: { pos: [5.5, 1.1, -6.18], look: [5.6, 1.56, -7.05], fov: 33 }, dur: 4, ease: 'linear' };
  // [WIDE · locked, the whole floor] (anchor floor_locked)
  const BAM_WIDE = { shot: 'INSERT', at: 'floor_locked' };
  // [WIDE] real time: from the front-left of the floor: the counter he went over, the smoking wreck, the tree going over
  // on the right (it falls toward the lens's side of frame)
  const WIDE_RT = { shot: 'CAM', pos: [-2.0, 2.8, -1.0], look: [7.5, 0.9, -7.0], fov: 52, to: { pos: [-1.8, 2.75, -1.15], look: [7.4, 0.9, -7.05], fov: 51 }, dur: 4, ease: 'linear' };
  // [LOW · from behind the counter, Luka's view, upside down] (anchor s12_pov_upside, rolled 180°)
  const POV_UP = { shot: 'CAM', pos: [5.6, 0.18, -9.9], look: [5.6, 1.2, -5.3], fov: 42, roll: 180, to: { pos: [5.6, 0.19, -9.88], look: [5.6, 1.22, -5.3], fov: 40 }, dur: 4, ease: 'linear' };
  // the stare: the three of them in one locked frame, high in the staff aisle (Luka on the floor, Chase, the figure)
  const STARE = { shot: 'CAM', pos: [9.0, 2.3, -11.9], look: [6.0, 0.7, -7.6], fov: 52 };
  // FIGURE, from behind him: his back and his head bowed over the wreck (his face stays his for one more beat)
  const FIG_BACK = { shot: 'CAM', pos: [4.7, 1.9, -3.6], look: [5.6, 1.0, -6.5], fov: 46, to: { pos: [4.76, 1.88, -3.76], look: [5.6, 1.0, -6.5], fov: 45 }, dur: 6, ease: 'linear' };
  // LUKA (from the floor): above his head, so his face is upside down in the frame
  const FLOOR_LUKA = { shot: 'CAM', pos: [5.64, 1.05, -9.6], look: [5.6, 0.12, -10.15], fov: 44, to: { pos: [5.64, 1.0, -9.62], look: [5.6, 0.12, -10.15], fov: 42 }, dur: 4, ease: 'linear' };
  // [MID] Luka climbs up over the counter: from the customer side, his head in frame on the counter top, tilting down
  // with him as he drops onto the floor
  const OVER = { shot: 'CAM', pos: [3.4, 1.75, -6.5], look: [5.5, 1.62, -8.9], fov: 50, to: { pos: [3.5, 1.72, -6.6], look: [5.45, 1.38, -8.2], fov: 48 }, dur: 4.5 };   // (default ease: smooth in and out)
  // the brush, side-on: both profiles (Luka frame-left, Chase (2040) frame-right), the hand on his shoulder
  const BRUSH = { shot: 'CAM', pos: [3.9, 1.6, -7.55], look: [5.45, 1.45, -7.57], fov: 40, to: { pos: [4.05, 1.6, -7.56], look: [5.45, 1.45, -7.57], fov: 38 }, dur: 7, ease: 'linear' };
  // [WIDE] the alarms whoop: the three of them, the wreck, the counter, the beacon
  const WIDE_35 = { shot: 'CAM', pos: [9.9, 2.1, -3.3], look: [6.0, 1.15, -8.4], fov: 50, to: { pos: [9.75, 2.05, -3.55], look: [6.0, 1.15, -8.4], fov: 48 }, dur: 6, ease: 'linear' };
  // WHAT WAS THAT? — the office door (LUKE — MANAGER / KNOCK / PLEASE / ESPECIALLY YOU TWO), whipped to
  // "So you came to the gap.": Chase (behind the counter) and Chase (2040), side-on from past the end of the counter
  // [TWO-SHOT · Luka and Chase] across the counter's corner: both three-quarter on, the same size, Luka frame-left
  // (Chase (2040) just out of frame-left)
  const TWO_LC = { shot: 'CAM', pos: [8.3, 1.62, -7.1], look: [6.3, 1.45, -8.9], fov: 44, to: { pos: [8.15, 1.61, -7.25], look: [6.3, 1.45, -8.9], fov: 42 }, dur: 12, ease: 'linear' };
  const TWO_LC2 = { shot: 'CAM', pos: [8.15, 1.61, -7.25], look: [6.3, 1.45, -8.9], fov: 42, to: { pos: [7.95, 1.6, -7.45], look: [6.3, 1.45, -8.9], fov: 40 }, dur: 16, ease: 'linear' };   // (picked up again, a little closer)
  const TWO_HC = { shot: 'CAM', pos: [9.3, 1.65, -7.0], look: [6.45, 1.4, -8.25], fov: 46, to: { pos: [9.2, 1.65, -7.05], look: [6.45, 1.4, -8.25], fov: 44 }, dur: 6, ease: 'linear' };
  const OFFICE = { shot: 'CAM', pos: [9.7, 1.55, -10.3], look: [9.9, 1.4, -12.6], fov: 42, move: 'whip' };
  // Backroom. Now.: low on the staff-side floor, the loose tether in the foreground, Chase's feet arriving
  const SCOOP = { shot: 'CAM', pos: [5.55, 0.75, -11.5], look: [6.6, 0.42, -10.15], fov: 52 };
  const POCKET = { shot: 'CAM', pos: [7.4, 1.25, -9.35], look: [6.4, 0.95, -11.9], fov: 48, to: { pos: [7.3, 1.25, -9.5], look: [6.4, 1.0, -12.6], fov: 46 }, dur: 4, ease: 'linear' };

  // 11:58: the store's spotless moment (Continue starts here too: the set may still be wrecked from before)
  function dress12(c) {
    const S = SETS.reddy26;
    if (S && c.world.setId === 'reddy26') S.dress('spotless', { time: 11 * 60 + 58 });
    const t = P(c, 'tether_loose'); if (t) t.visible = false;
    const r = P(c, 'store_radio'); if (r) r.userData.playing = true;
    const l = act(c, 'luka'), ch = act(c, 'chase'), j = act(c, 'jordan');
    if (l) { l.walkAnim = 'walk'; l.rig.root.rotation.set(0, 0, 0); l.place(LUKA_START); l.play('idle'); l.setExpr('happy'); }
    if (ch) { ch.hold(null); ch.place('s11_chase_phone'); ch.play('idle'); ch.setExpr('neutral'); }
    if (j) { j.place(J12); j.play('idle'); }
    if (c.world.actor('chase40')) c.world.despawn('chase40');
    hemOn = false;
  }
  // Luka steps back from the table (no turn: a short slide while he looks at it)
  function stepBack(c) {
    const a = act(c, 'luka'); if (!a) return;
    const x0 = LUKA_START[0], z0 = LUKA_START[2], z1 = LUKA_ADMIRE[2];
    tween(c, 0.9, (k) => { a.pos.x = x0; a.pos.z = z0 + (z1 - z0) * k; });
  }
  // the phone rings (a 2026 landline: the double trill at the handset, every 1.6 s, four at most) until he answers
  const RING_O = { sfx: 'trill', every: 1.6, vol: 0.55, max: 4 };
  const ring = (on) => ({ prop: 'store_phone', fn: (o) => { if (o.userData.ring) { if (on && !flow.skipping) o.userData.ring(true, RING_O); else o.userData.ring(false); } } });
  // BAM (1.2 step 16): the table goes, the flash, Luka launched, the alarms; the music cuts dead on the blast
  function bam(c) {
    const t = P(c, 'hero_table'); if (t) t.userData.blast({ instant: sk(c), tree: false });   // (the tree goes over at the real-time wide)
    c.music(null, { cut: true });
    const ra = P(c, 'store_radio'); if (ra) ra.userData.playing = false;
    const lo = P(c, 'tether_loose'); if (lo) lo.visible = true;           // one tether lands behind the counter
    const j = act(c, 'jordan'); if (j) { j.face([5.6, 0, -5.3], 0); j.play('duck'); j.setExpr('scared'); }
    const ch = act(c, 'chase'); if (ch) ch.setExpr('stunned');
    launch(c);
    if (sk(c)) return;
    sfx('bam', { vol: 1 }); sfx('glass', { vol: 0.8 });
    c.ui.flash(0.55);
  }
  let flightTok = 0;
  function launch(c) {
    const a = act(c, 'luka'); if (!a) return;
    const tok = ++flightTok;
    a.place([LUKA_ADMIRE[0], 0, LUKA_ADMIRE[2], PI]);
    if (sk(c)) { land(c, true); return; }
    a.walkAnim = 's12_fly'; a.play('s12_fly'); a.setExpr('stunned');
    (async () => {
      for (let i = 0; i < FLIGHT.length; i++) {
        if (tok !== flightTok || flow.sceneId !== '1.2') return;
        await a.moveTo(FLIGHT[i], { speed: 3.0, face: false });
      }
      if (tok === flightTok) land(c, false);
    })();
  }
  function land(c, quiet) {
    const a = act(c, 'luka'); if (!a) return;
    if (a.walkAnim === 'walk' && a.anim === 'lie') return;   // already down
    flightTok++;
    a.walkAnim = 'walk';
    a.place(LAND); a.play('lie'); a.setExpr('stunned');
    if (!quiet && !sk(c)) { sfx('thud', { vol: 0.9 }); sfx('crash', { vol: 0.35, rate: 0.8 }); c.world.puff([5.6, 0.3, -10.2], DUST); }
  }
  const DUST = { n: 12, color: 0xd8dde2, speed: 0.5, life: 1.1, gravity: -0.2 };
  // the figure's coat smokes at the hem (from the POV until he turns his collar down); allocation-free
  let hemOn = false, hemT = 0;
  const HEM = [0, 0.35, 0], HEM_O = { n: 3, color: 0x8d8780, speed: 0.12, life: 1.6, gravity: -0.3 };
  function hem(dt) {
    if (flow.sceneId !== '1.2' || !hemOn) { hemOn = false; removeUpdate(hem); return; }
    if (flow.skipping) return;
    if ((hemT -= dt) > 0) return;
    hemT = 0.45;
    const a = world.actor('chase40'); if (!a) return;
    HEM[0] = a.pos.x + (Math.random() - 0.5) * 0.5; HEM[2] = a.pos.z + (Math.random() - 0.5) * 0.5;
    world.puff(HEM, HEM_O);
  }
  function figureIn(c) {
    const a = c.world.spawn('chase40', FIG_AT);
    if (!a) return;
    a.rig.show('collar_up', true); a.play('still'); a.setExpr('still');
    hemOn = true; hemT = 0; addUpdate(hem);
  }
  // Luka over the counter: up off the floor, hands on the counter, over, down on the customer side
  async function climbOver(c) {
    const a = act(c, 'luka'); if (!a) return;
    if (sk(c)) { a.walkAnim = 'walk'; a.place(LUKA_OVER); a.play('idle'); return; }
    a.place([5.55, 0, -10.05, PI]); a.play('stand', { h: 0.25 });
    await c.wait(0.55);
    if (flow.sceneId !== '1.2') return;
    a.walkAnim = 's12_over';
    await a.moveTo([5.5, 1.0, -9.05], { speed: 1.15, face: false });
    if (flow.sceneId !== '1.2') return;
    a.face(0, 0.25);
    await a.moveTo([5.45, 0, -8.2], { speed: 1.3, face: false });
    if (flow.sceneId !== '1.2') return;
    a.walkAnim = 'walk';
    a.place(LUKA_OVER); a.play('idle'); a.setExpr('stunned');
    if (!sk(c)) c.world.puff([5.4, 1.3, -7.9], GLASS_DUST);
  }
  const GLASS_DUST = { n: 10, color: 0xeef6fa, speed: 0.35, life: 0.9, gravity: 0.6 };
  // the tether: scooped up and into the back pocket (the item lands silently in the bag; nobody comments)
  function pocket(c) {
    const a = act(c, 'chase');
    const t = P(c, 'tether_loose'); if (t) t.visible = false;
    if (a) { a.rig.show('tether', false); a.rig.show('tether_pocket', true); }
  }

  SCENES['1.2'] = {
    title: 'Accept the Charges', set: 'reddy26', env: 'day', time: '11:58', place: 'Optus Redcliffe', timeCard: false,
    playable: [], swap: false, hud: null, music: 'radio',
    spawn: { luka: LUKA_START, chase: 's11_chase_phone', jordan: J12 },
    steps: [
      ['cutscene', '1.2_spotless'],
      ['cutscene', '1.2_bam'],
      ['cutscene', '1.2_mate'],
      ['cutscene', '1.2_gap'],
    ],
    grants: { flags: { s12_tether: true }, items: ['tether'] },
  };

  CUTSCENES['1.2_spotless'] = [
    { do: (c) => nextTick().then(() => dress12(c)) },
    // [LOW · heroic, up past the glittering edge of the Hero Table] Luka steps back and looks at it. The glass catches
    // the light. He's so proud.
    HEROIC,
    { wait: 0.5 },
    { do: (c) => stepBack(c) },
    { wait: 0.6 },
    { prop: 'hero_table', fn: (o) => o.userData.glint() },
    { sfx: 'spotless_chime', vol: 0.25 },
    { wait: 1.1 },
    say('luka', 'Spotless.'),
    { wait: 0.3 },
    // [INSERT] The wall clock: 11:58.
    setClock(11, 58),
    { shot: 'INSERT', at: 'clock_floor', card: ['clock', { time: '11:58' }] },
    { wait: 1.8 },
    // The store phone on the counter rings. Chase answers.
    RING,
    ring(true),
    { wait: 2.2 },
    ring(false),
    { place: 'chase', at: 's11_chase_phone' },
    { hold: 'chase', prop: 'store_phone', hand: 'R' },
    play('chase', 'phone'),
    { sfx: 'clunk', vol: 0.25 },
    CLOSE('chase', { dist: 1.0, fov: 38, push: 0.08, dur: 9 }),
    { wait: 0.4 },
    say('chase', 'Optus Redcliffe, Chase speaking.'),
    { sfx: 'line_click', vol: 0.5 },
    say('operator', 'You have a reverse-charge call from—'),
    say('voice', 'Chase. Optus Redcliffe.', { tag: 'down the line' }),
    say('operator', '—2040. Will you accept the charges?'),
    // [CLOSE · Chase] He frowns at the receiver.
    play('chase', 's12_receiver'), expr('chase', 'suspicious'),
    CLOSE('chase', { dist: 0.85, fov: 36, push: 0.1, dur: 4, yaw: 0.25 }),
    { wait: 1.2 },
    play('chase', 'phone'),
    { wait: 0.3 },
    say('chase', '…Sorry, from who?'),
    // [TWO-SHOT · Luka in the foreground, admiring the table, back to Chase]
    expr('chase', 'neutral'),
    TWOSHOT,
    { wait: 0.6 },
    say('luka', 'Just say yes. It\'s probably Margaret.'),
    { wait: 0.2 },
    say('chase', '…Yes?'),
    // [CLOSE · Luka] He's looking down at his own reflection in the spotless glass, utterly content.
    play('luka', 'look_down'), expr('luka', 'fond'),
    REFLECT,
    { prop: 'hero_table', fn: (o) => o.userData.glint() },
    { wait: 1.5 },
    // (Half a second of perfect pride.)
    { wait: 0.5 },
  ];

  CUTSCENES['1.2_bam'] = [
    // [WIDE · locked, the whole floor] BAM. A white flash erupts from inside the Hero Table (Reduce Flashing: a slow
    // grey bloom: ui.flash and the table's own flash both honour it). The glass, the phones and the cradles blow apart.
    // Luka is launched backwards over the counter.
    BAM_WIDE,
    { wait: 0.35 },
    { do: (c) => bam(c) },
    { loop: 'alarm', vol: 0.08, rate: 1.0 }, { loop: 'alarm', vol: 0.064, rate: 1.13 }, { loop: 'alarm', vol: 0.064, rate: 0.89 }, { loop: 'alarm', vol: 0.052, rate: 1.27 },
    { wait: 0.3 },
    // [SLOW MOTION · CLOSE · Luka mid-air, 1.5 s] His face as the display he polished for two hours disintegrates in the
    // background: from above the staff side, his upturned face low in frame, the blast beyond him, tracking him over
    // the counter (0.45 s of game time = 1.5 s on screen)
    { slowmo: 0.3, dur: 1.5 },
    { shot: 'CAM', pos: [5.25, 2.65, -10.35], look: [5.6, 1.2, -7.3], fov: 46, to: { pos: [5.2, 2.62, -10.6], look: [5.6, 1.05, -8.0], fov: 43 }, dur: 0.45, ease: 'linear' },
    { wait: 0.45 },
    // [WIDE] Real time. He lands behind the counter with a crash. Four security alarms scream (Rue's alarm sound). The
    // Christmas tree falls over. Smoke fills the floor. Four empty tethers swing from what's left of the table. The radio
    // keeps playing.
    WIDE_RT,
    // (the blast left the tree up: it goes over here, in real time, where it's seen)
    { prop: 'xmas_tree', fn: (o) => { if (o.userData.fall) o.userData.fall(); } },
    { wait: 0.8 },
    { do: (c) => land(c, false) },
    { wait: 2.2 },
    // [LOW · from behind the counter, Luka's view, upside down] Through the smoke a figure stands where the table was: a
    // long tan trench coat, smoking slightly at the hem. He coughs.
    { do: (c) => figureIn(c) },
    { do: (c) => { const a = act(c, 'luka'); if (a && !sk(c)) a.visible = false; } },   // the lens is his eyes
    POV_UP,
    { wait: 1.2 },
    play('chase40', 's12_cough', { dur: 1.4, loop: false }),
    { wait: 1.7 },
    // Stare, 3 s. Luka upside down. Chase frozen with the receiver. The figure.
    { do: (c) => { const a = act(c, 'luka'); if (a) a.visible = true; } },
    STARE,
    { stare: 3 },
    { music: null, cut: true },
    { do: (c) => { const r = P(c, 'store_radio'); if (r) r.userData.playing = false; } },
    // FIGURE (a silhouette until he turns his collar down): "…Sorry." (He looks down at the wreck.) "^ Was that new?"
    FIG_BACK,
    { wait: 0.4 },
    say('figure', '…Sorry.'),
    play('chase40', 'look_down'),
    say('figure', '^ Was that new?'),
    // LUKA (from the floor)
    expr('luka', 'hurt'),
    FLOOR_LUKA,
    { wait: 0.3 },
    say('luka', 'It was SPOTLESS.', { tag: 'from the floor' }),
    { wait: 0.2 },
  ];

  CUTSCENES['1.2_mate'] = [
    // [CLOSE · the figure] He turns his collar down. Grey stubble, tired eyes, over-ear headphones round his neck, a soft
    // blue light behind his ear, a scorched lanyard: CHASE · SENIOR CASUAL. Chase's face, fourteen years on.
    play('chase40', 'idle'), expr('chase40', 'tired'),
    { do: (c) => { const a = act(c, 'chase40'); if (a) { a.face('chase', 0); if (!sk(c)) { a.eyePos(V1); const ry = a.rotY;
      c.cam.shot({ shot: 'CAM', pos: [V1.x + Math.sin(ry) * 1.0, V1.y - 0.32, V1.z + Math.cos(ry) * 1.0], look: [V1.x, V1.y - 0.5, V1.z], fov: 34,
        to: { pos: [V1.x + Math.sin(ry) * 0.85, V1.y - 0.04, V1.z + Math.cos(ry) * 0.85], look: [V1.x, V1.y - 0.04, V1.z], fov: 32 }, dur: 3.2, ease: 'out' }); } } } },
    { do: (c) => { hemOn = false; } },
    play('chase40', 's12_collar', { dur: 1.8, loop: false }),
    { wait: 0.75 },
    { do: (c) => { const a = act(c, 'chase40'); if (a) a.rig.show('collar_up', false); } },
    { wait: 2.6 },
    // [CLOSE · Chase]
    expr('chase', 'stunned'),
    CLOSE('chase', { dist: 0.95, fov: 36, push: 0.12, dur: 5 }),
    { wait: 0.5 },
    say('chase', '…Oh no.'),
    // (out of the wreck; facing the counter)
    { place: 'chase40', at: FIG_OUT }, play('chase40', 'idle'), expr('chase40', 'tired'),
    CLOSE('chase40', { dist: 1.0, fov: 36, push: 0.06, dur: 6, yaw: 0.2 }),
    { wait: 0.3 },
    say('chase40', 'Hey, mate.'),
    CLOSE('chase', { dist: 1.0, fov: 38, push: 0.06, dur: 5, yaw: -0.15 }),
    say('chase', 'You\'re me.'),
    CLOSE('chase40', { dist: 1.0, fov: 36, push: 0.06, dur: 5, yaw: 0.2 }),
    say('chase40', 'I\'m you.'),
    expr('chase', 'scared'),
    CLOSE('chase', { dist: 1.0, fov: 38, push: 0.06, dur: 5, yaw: -0.15 }),
    say('chase', 'You\'re OLD.'),
    expr('chase40', 'talk'),
    CLOSE('chase40', { dist: 1.05, fov: 36, push: 0.1, dur: 8, yaw: 0.2 }),
    say('chase40', 'I\'m fourteen years older. That\'s not old. That\'s— ^ It\'s a bit old.', { act: 'shrug' }),
    // [MID] Luka climbs up over the counter, covered in glass dust.
    expr('chase40', 'tired'),
    OVER,
    { do: (c) => climbOver(c) },
    { wait: 1.0 },
    { do: (c) => waitUntil(() => c.flow.skipping || flow.sceneId !== '1.2' || (act(c, 'luka') && act(c, 'luka').pos.z > -8.0 && act(c, 'luka').pos.y < 0.05)) },
    { place: 'luka', at: LUKA_OVER }, play('luka', 'idle'), expr('luka', 'stunned'),
    { wait: 0.4 },
    // Chase (2040) turns and sees him, and stops. Hold 2 s on his face: he's looking at someone he hasn't seen in six
    // years. (A strange, too-long look.)
    turnSlow('chase40', 'luka', 0.5),
    { wait: 0.5 },
    expr('chase40', 'talk'),
    { do: (c) => { const a = act(c, 'chase40'); if (a && !sk(c)) { const l = act(c, 'luka'); closeOn(c, 'chase40', { rot: Math.atan2(l.pos.x - a.pos.x, l.pos.z - a.pos.z), yaw: 0.3, dist: 0.9, fov: 33, push: 0.12, dur: 3 }); } } },
    { wait: 2.0 },
    // He walks over and carefully brushes the dust off Luka's shoulder, as if checking that he's solid.
    BRUSH,
    { move: 'chase40', to: C40_BRUSH },
    turn('chase40', 'luka'),
    play('chase40', 's12_brush', { dur: 2.4, loop: false }),
    { wait: 2.5 },
    // (they're half a metre apart: the closes are over the other one's shoulder, from well round the side)
    expr('luka', 'suspicious'),
    CLOSE('luka', { dist: 0.8, fov: 38, push: 0.04, dur: 4, yaw: 0.8 }),
    say('luka', '…What?'),
    expr('chase40', 'tired'),
    CLOSE('chase40', { dist: 0.8, fov: 38, push: 0.05, dur: 6, yaw: -0.9 }),
    say('chase40', 'Nothing. ^ You\'ve got display on you.'),
  ];

  CUTSCENES['1.2_gap'] = [
    // [WIDE] The alarms whoop. Chase (2040) is all business.
    expr('luka', 'neutral'), expr('chase', 'worried'), expr('chase40', 'determined'),
    { hold: 'chase', prop: null }, play('chase', 'idle'),
    { place: 'chase', at: [7.15, 0, -9.95, -0.45] },
    { place: 'luka', at: [5.4, 0, -7.9, 0.25] },
    WIDE_35,
    { sfx: 'alarm', vol: 0.22 },
    // he steps back off Luka and squares up to the pair of them (1.4 m out: room for the closes)
    { move: 'chase40', to: C40_GAP, nowait: true },
    { wait: 0.9 },
    { place: 'chase40', at: C40_GAP },
    turnSlow('chase40', [6.3, 0, -8.9], 0.35),
    say('chase40', 'We haven\'t got long. In two days, someone\'s going to switch off the world. I need your help.'),
    { shot: 'TWO', on: ['luka', 'chase'] },
    say('luka', 'We\'re on till five.'),
    say('chase', 'We\'re on till five.'),
    CLOSE('chase40', { dist: 1.05, fov: 36, push: 0.05, dur: 5, yaw: -0.5 }),
    say('chase40', 'You won\'t be on till five.'),
    CLOSE('chase', { dist: 1.0, fov: 38, push: 0.05, dur: 5, yaw: -0.4 }),
    say('chase', 'Who\'s switching off the world?'),
    CLOSE('chase40', { dist: 1.0, fov: 36, push: 0.08, dur: 8, yaw: -0.5 }),
    say('chase40', 'Nobody knows his name. Took over Optus three years ago. Everyone just calls him the Manager.'),
    // [TWO-SHOT · Luka and Chase] They look at each other.
    turn('luka', 'chase'), turn('chase', 'luka'),
    TWO_LC,
    { wait: 1.0 },
    say('luka', '…Should we call the manager?'),
    expr('chase40', 'worried'),
    CLOSE('chase40', { dist: 1.0, fov: 36, push: 0.05, dur: 5, yaw: -0.5 }),
    say('chase40', 'No. He IS the— no.'),
    expr('chase', 'determined'),
    TWO_LC2,
    say('chase', 'It\'s Luke.'),
    say('chase40', 'Nobody knows who—'),
    say('chase', 'It\'s obviously Luke.'),
    say('luka', 'It\'s not Luke.'),
    say('chase', 'He hung up on us. In 1987.'),
    say('luka', 'We don\'t remember that.'),
    say('chase', 'He TOLD us.'),
    // LUKA (to Chase (2040))
    turnSlow('luka', 'chase40', 0.4), expr('chase', 'neutral'),
    { wait: 0.3 },
    CLOSE('luka', { dist: 1.0, fov: 38, push: 0.05, dur: 5, yaw: -0.5 }),
    say('luka', 'Why us?'),
    expr('chase40', 'tired'),
    turn('chase40', 'luka'),   // he answers Luka
    CLOSE('chase40', { dist: 1.15, fov: 34, push: 0.3, dur: 14, yaw: 0.5 }),
    say('chase40', 'Because I\'ve got a gap. Two days. Christmas 2026. I woke up on that backroom floor on Christmas Eve with Luke screaming at me, and I never found out where we went.'),
    say('chase40', '^ Fourteen years, it\'s the only bit of my life I can\'t account for. So whatever went wrong, it starts here.'),
    TWO_HC,
    say('chase', 'So you came to the gap.'),
    say('chase40', 'I came to the gap.'),
    CLOSE('luka', { dist: 1.0, fov: 38, push: 0.04, dur: 5, yaw: -0.5 }),
    say('luka', 'And what\'s in the gap?'),
    CLOSE('chase40', { dist: 1.05, fov: 36, push: 0.05, dur: 6, yaw: 0.5 }),
    { do: (c) => { const a = act(c, 'chase40'), l = act(c, 'luka'), h = act(c, 'chase'); if (!a || !l || !h || sk(c)) return;
      const yl = Math.atan2(l.pos.x - a.pos.x, l.pos.z - a.pos.z) - a.rotY, yh = Math.atan2(h.pos.x - a.pos.x, h.pos.z - a.pos.z) - a.rotY;
      a.play('glance', { yaw: Math.max(-1.2, Math.min(1.2, yh)), dur: 1.1 }).then(() => { if (flow.sceneId === '1.2' && !flow.skipping) a.play('glance', { yaw: Math.max(-1.2, Math.min(1.2, yl)), dur: 1.1 }); }); } },
    { wait: 1.8 },
    say('chase40', '…Apparently, me.'),
    // LUKA: "Why not bring your Luka?"
    CLOSE('luka', { dist: 1.0, fov: 38, push: 0.06, dur: 6, yaw: -0.5 }),
    say('luka', 'Why not bring your Luka?'),
    // [CLOSE · Chase (2040)] A flicker.
    CLOSE('chase40', { dist: 0.85, fov: 33, push: 0.08, dur: 6, yaw: 0.45 }),
    expr('chase40', 'sad'),
    { wait: 0.9 },
    expr('chase40', 'still'),
    { wait: 0.3 },
    say('chase40', 'He\'s not around.'),
    CLOSE('luka', { dist: 1.0, fov: 38, push: 0.05, dur: 5, yaw: -0.5 }),
    say('luka', 'Not around where?'),
    expr('chase40', 'tired'),
    CLOSE('chase40', { dist: 1.0, fov: 36, push: 0.05, dur: 5, yaw: 0.5 }),
    say('chase40', 'Can we do this later?'),
    // LUKE (off, from the office)
    OFFICE,
    { do: (c) => { for (const id of ['luka', 'chase', 'chase40']) { const a = act(c, id); if (a) a.face([9.9, 0, -12.6], sk(c) ? 0 : 0.3); } } },
    say('luke', 'WHAT WAS THAT?', { tag: 'off' }),
    expr('chase40', 'determined'),
    WIDE_35,
    say('chase40', 'Backroom. ^ Now.'),
    // As they move, Chase scoops one of the broken security tethers off the floor and shoves it in his back pocket.
    // Nobody comments.
    { move: 'chase40', to: 's12_exit_1', run: true, nowait: true },
    { do: (c) => { (async () => { await c.wait(0.5); if (flow.sceneId !== '1.2') return; const l = act(c, 'luka'); if (l && !sk(c)) l.moveTo('s12_exit_1', { run: true }).then(() => { if (flow.sceneId === '1.2' && !flow.skipping) l.moveTo('s12_exit_2', { run: true }); }); })(); } },
    { wait: 0.4 },
    SCOOP,
    { move: 'chase', to: [6.62, 0, -10.2, -2.0] },
    play('chase', 's12_scoop', { dur: 0.9, loop: false }),
    { wait: 0.42 },
    { do: (c) => { const t = P(c, 'tether_loose'); if (t) t.visible = false; const a = act(c, 'chase'); if (a) a.rig.show('tether', true); } },
    { wait: 0.5 },
    { do: (c) => { c.inventory.add('tether'); } },
    POCKET,
    { move: 'chase', to: [6.4, 0, -11.4], nowait: true },
    { wait: 0.5 },
    { do: (c) => pocket(c) },
    { move: 'chase40', to: 's12_exit_2', nowait: true },
    { wait: 1.4 },
    { do: (c) => { if (!c.inventory.has('tether')) c.inventory.add('tether'); pocket(c); for (const [id, at] of [['chase40', [6.4, 0, -14.6, PI]], ['luka', [6.4, 0, -13.8, PI]], ['chase', [6.4, 0, -13.0, PI]]]) { const a = act(c, id); if (a && sk(c)) a.place(at); } } },
    { flag: 's12_tether' },
  ];

  // ==================================================================== 1.3 — "Before Lunch"
  // The backroom x 2.4..10.4, z −30..−24 (door hinge (5.95, −23.87), the window y 1.3–1.75; the wall phone + junction box
  // at x 4.3 on the front wall; the kettle (10.08, −28.55)); the corridor x 5.4..7.4 (the Stall at s13_stall_luka /
  // s13_stall_luke). The split's right half: reddy40's backroom (the machine and Des at (4.25, 0.95, −24.38)).
  const SETUP_WIDE = { shot: 'CAM', pos: [8.9, 1.9, -28.9], look: [6.1, 1.35, -25.6], fov: 46, to: { pos: [8.75, 1.88, -28.6], look: [6.1, 1.38, -25.7], fov: 44 }, dur: 6, ease: 'linear' };
  const WINDOW_POV = { shot: 'INSERT', at: 's13_window_pov' };
  // (behind Luke's head as he comes down the corridor; Luka coming out of the backroom door at the far end)
  const CORR_DOOR = { shot: 'CAM', pos: [6.85, 2.25, -12.9], look: [6.3, 1.2, -23.4], fov: 44, to: { pos: [6.82, 2.2, -13.3], look: [6.3, 1.22, -23.4], fov: 42 }, dur: 4, ease: 'linear' };
  // "Someone has to keep him out of here.": from the room, Chase (2040) at the door window turning back to them (Luka
  // stepped clear under the window insert)
  const WIN_MID = { shot: 'CAM', pos: [6.2, 1.62, -26.25], look: [6.75, 1.55, -24.45], fov: 40, to: { pos: [6.24, 1.62, -26.1], look: [6.75, 1.56, -24.45], fov: 38 }, dur: 5, ease: 'linear' };
  const STALL_BASE = { shot: 'OTS', on: 'luka', over: 'luke' };
  const JBOX = { shot: 'INSERT', at: 'jbox' };
  // 1.3_call
  // the three of them round the wall phone, from the room: Chase's back frame-left, Chase (2040) side-on at the phone,
  // Luka frame-right
  const CALL_MID = { shot: 'CAM', pos: [5.4, 1.62, -26.9], look: [4.25, 1.5, -24.7], fov: 44, to: { pos: [5.32, 1.62, -26.65], look: [4.25, 1.5, -24.7], fov: 42 }, dur: 6, ease: 'linear' };
  // the same three in the split's left half (half the width: a wider lens)
  const CALL_THREE = { shot: 'CAM', pos: [4.35, 1.66, -27.8], look: [4.35, 1.5, -24.9], fov: 50, to: { pos: [4.35, 1.66, -27.6], look: [4.35, 1.5, -24.9], fov: 49 }, dur: 6, ease: 'linear' };
  const SPLIT_L = { shot: 'INSERT', at: 'split_a' };
  const SPLIT_R = { shot: 'INSERT', at: 'split_a', half: 'right' };
  const DES_ECU = { shot: 'INSERT', at: 'des_screen', half: 'right' };
  const DES_CLOSE = { shot: 'INSERT', at: 'des', half: 'right' };
  // [WIDE · locked, the store floor]: high from the shopfront, the smoking wreck mid-frame (clear of the dialogue box),
  // the counter, Luke at the corridor mouth and Jordan with the ladder behind it
  const FLOOR_LOCK = { shot: 'CAM', pos: [4.8, 2.9, -0.5], look: [5.8, 0.7, -7.8], fov: 52 };
  // where everyone stands
  const M13 = {
    c40: [5.7, 0, -26.4, 0.9], luka: [6.9, 0, -25.6, -2.4], chase: [7.2, 0, -26.7, -1.9],
    window: [6.8, 0, -24.42, -0.3], stallLuka: [6.4, 0, -18.2, 0], stallLuke: [6.4, 0, -16.8, PI], lukeStare: [6.4, 0, -11.7, 0],
    wireChase: [4.3, 0, -24.6, 0], wireC40: [5.15, 0, -25.0, -0.5], record: [6.4, 0, -24.45, 0],
    callC40: [4.3, 0, -24.55, H], callLuka: [3.45, 0, -25.2, 0.92], callChase: [5.25, 0, -25.1, -1.05],
    lukaAside: [7.45, 0, -26.0, -2.6], windowFrom: [6.9, 0, -26.0],
    lukeOut: [6.4, 0, -12.0, 0], jordan: [4.6, 0, -11.25, 0.3],
  };
  const O13 = { stall1: 'Luka: Stall Luke', wire: 'Chase: Wire the Remote into the backroom phone' };
  function duties13() {
    const f = state.flags;
    objective.list([{ text: O13.stall1, done: !!f.s13_stall2 }, { text: O13.wire, done: !!f.s13_wire2 }]);
  }
  // Continue restarts at step 0 with the flags: the wreck, the tether gone, the Remote where the flags put it
  function dress13(c) {
    const S = SETS.reddy26, f = c.state.flags;
    if (S && c.world.setId === 'reddy26') S.dress('wrecked', { time: 12 * 60 + 1 });
    const t = P(c, 'tether_loose'); if (t) t.visible = false;
    const jb = P(c, 'jbox_lid'); if (jb) jb.userData.open = !!f.s13_wire1;
    const rp = P(c, 'remote_plugged'); if (rp) rp.visible = !!f.s13_wire1;
    const bd = P(c, 'backroom_door'); if (bd) bd.userData.open = false;
    const l = act(c, 'luka'), ch = act(c, 'chase'), c40 = act(c, 'chase40'), lk = act(c, 'luke');
    if (l) { l.walkAnim = 'walk'; l.rig.root.rotation.set(0, 0, 0); l.visible = true; l.play('idle'); l.setExpr('neutral'); }
    if (ch) { ch.play('idle'); ch.setExpr('neutral'); ch.rig.show('remote', !!c.inventory.has('remote') && !f.s13_wire1 && !!f.s13_given); }
    if (c40) { c40.rig.show('remote', false); c40.rig.show('collar_up', false); c40.play('idle'); }
    if (lk) lk.visible = !f.s13_stall2;
  }

  SCENES['1.3'] = {
    title: 'Before Lunch', set: 'reddy26', env: 'day', time: '12:01', place: 'Optus Redcliffe',
    playable: ['luka', 'chase'], swap: false, hud: null, music: 'tense',
    spawn: { luka: M13.luka, chase: M13.chase, chase40: M13.c40, luke: M13.lukeStare, jordan: M13.jordan },
    hotspots: [
      // Chase: the junction box (Wiring, half 1 after the first three rounds, half 2 after the last two)
      { id: 'h13_jbox', at: 's13_wire_chase', r: 0.85, verb: 'Wire', only: 'chase',
        when: (s) => (!!s.flags.s13_stall1 && !s.flags.s13_wire1) || (!!s.flags.s13_stall2 && !s.flags.s13_wire2),
        do: (c) => wire(c) },
      // Luka: back to Luke for rounds 4–5 once the first half of the wiring is in
      { id: 'h13_luke', at: 'luke', r: 1.9, verb: 'Talk', only: 'luka',
        when: (s) => !!s.flags.s13_wire1 && !s.flags.s13_stall2,
        do: (c) => stall2(c) },
      // the optional first sample: the display alarms through the backroom door's little window (Chase holds YES 1 s)
      { id: 'h13_window', at: 's13_record', r: 0.7, sample: 'alarm' },
      // the kettle (save)
      { id: 'h13_kettle', at: 'kettle', r: 0.85, verb: 'Use', kettle: true },
    ],
    steps: [
      ['cutscene', '1.3_setup'],
      ['control', 'luka'],
      ['objective', 'Call 2040.'],
      ['do', () => duties13()],
      ['do', (c) => (c.state.flags.s13_stall1 ? null : stall1(c))],
      ['swap', true],
      ['do', (c) => roam13(c)],
      ['roam', {
        until: 's13_wire2',
        hint: { after: 45, steps: [{ do: (c) => { if (!c.flow.swap) return; c.ui.toast(input.scheme === 'pad' ? 'SWAP — Y' : input.scheme === 'touch' ? 'SWAP — tap SWAP' : 'SWAP — Tab'); } }] },
        async auto(c) {   // the SWAP tutorial, played through the real hotspots: SWAP, the sample, the kettle, the halves
          const T = (id) => c.hotspots.trigger(id);
          if (!c.state.flags.s13_wire1) {
            swapTo(c, 'chase');
            await walk(c, [[5.6, 0, -24.9], M13.record]);
            await T('h13_window');
            await walk(c, [[7.2, 0, -26.2], [8.9, 0, -28.4]]); await T('h13_kettle');
            await walk(c, [[6.2, 0, -25.6], M13.wireChase]); await T('h13_jbox');
          }
          if (!c.state.flags.s13_stall2) { swapTo(c, 'luka'); await walk(c, [[6.4, 0, -17.9]]); await T('h13_luke'); }
          if (!c.state.flags.s13_wire2) { swapTo(c, 'chase'); await walk(c, [M13.wireChase]); await T('h13_jbox'); }
          if (!c.state.samples.includes('alarm')) console.error('TWO 1.3: the Display alarm sample was not recorded');
        },
      }],
      ['swap', false],
      ['objective', null],
      ['cutscene', '1.3_call'],
    ],
    grants: { flags: { s13_given: true, s13_stall1: true, s13_wire1: true, s13_wired: true, s13_stall2: true, s13_wire2: true, tut_swap: true }, items: ['remote'], samples: ['alarm'] },
  };

  // the first three rounds (a scene step, so the SWAP prompt comes straight after)
  function stall1(c) {
    c.player.enabled = false;
    return c.flow.minigame('stall', { rounds: [1, 2, 3], shot: STALL_BASE }).then((r) => {
      c.state.flags.s13_stall1 = true;
      duties13();
      return c.cam.release().then(() => r);   // back to the corridor's own camera for the roam (and the SWAP prompt)
    });
  }
  // rounds 4–5 from the hotspot: they face each other again; his suspicion has drifted while Luka was away
  async function stall2(c) {
    const l = act(c, 'luka'), lk = act(c, 'luke');
    if (l) l.place('s13_stall_luka');
    if (lk) lk.visible = true;
    await c.flow.minigame('stall', { rounds: [4, 5], drift: true, shot: STALL_BASE });
    if (flow.sceneId !== '1.3') return;
    c.state.flags.s13_stall2 = true;
    duties13();
    // "…I'll open it after lunch.": he goes back to the floor
    if (lk) { lk.setExpr('tired'); lk.moveTo([6.4, 0, -12.2]).then(() => { if (flow.sceneId === '1.3' && c.state.flags.s13_stall2) lk.visible = false; }); }
    if (sk(c) || TEST.fast) { if (lk) { lk.place([6.4, 0, -12.2, 0]); lk.visible = false; } }
    return c.cam.release();
  }
  // the Wiring halves: Chase at the box, the lid open, the Remote's cable in his hand
  async function wire(c) {
    const half = c.state.flags.s13_wire1 ? 2 : 1;
    const ch = act(c, 'chase'), c40 = act(c, 'chase40');
    if (ch) { ch.place('s13_wire_chase'); ch.play('idle'); if (half === 1) ch.rig.show('remote', true); }
    if (c40) { c40.place('s13_wire_c40'); c40.face('chase', 0); }
    const jb = P(c, 'jbox_lid'); if (jb) jb.userData.open = true;
    if (ch) ch.play('type');
    await c.flow.minigame('wiring', { half, shot: JBOX });
    if (flow.sceneId !== '1.3') return;
    if (ch) { ch.play('idle'); ch.rig.show('remote', false); }
    const rp = P(c, 'remote_plugged'); if (rp) rp.visible = true;
    if (half === 1) { c.state.flags.s13_wire1 = true; c.state.flags.s13_wired = true; }
    else c.state.flags.s13_wire2 = true;
    sfx('plug_click', { vol: 0.5 });
    duties13();
    return c.cam.release(0);   // (a cut: the box's lens is in front of Chase, a glide home would pass through him)
  }
  // during the roam: Luke's suspicion drifts on its own while you're with Chase (a meter, until rounds 4–5 are done);
  // the record prompt at the door window reads as the script has it. Allocation-free; gone with the scene.
  let roamOn = false;
  const WIN_X = 6.4, WIN_Z = -24.45;
  function roamTick() {
    if (flow.sceneId !== '1.3') { roamOn = false; ui.meter(null, null); removeUpdate(roamTick); return; }
    const f = state.flags, free = flow.roaming && !flow.busy;
    if (free && state.active === 'chase' && f.s13_wire1 && !f.s13_stall2 && MINIGAMES.stall && MINIGAMES.stall.level) ui.meter('SUSPICION', MINIGAMES.stall.level() / 100);
    else ui.meter(null, null);
    if (free && state.active === 'chase' && !state.samples.includes('alarm') && !input.held('yes')) {
      const a = player.actor;
      if (a) { const dx = a.pos.x - WIN_X, dz = a.pos.z - WIN_Z; if (dx * dx + dz * dz <= 0.49) ui.prompt('Record? (hold YES)'); }
    }
  }
  function roam13() { if (!roamOn) { roamOn = true; addUpdate(roamTick); } }

  CUTSCENES['1.3_setup'] = [
    { do: (c) => nextTick().then(() => dress13(c)) },
    { do: (c) => { c.world.prebuild('reddy40'); } },   // the split's right half, built behind this cutscene
    { loop: 'alarm', vol: 0.048, rate: 1.0, lp: 700 }, { loop: 'alarm', vol: 0.04, rate: 1.13, lp: 700 }, { loop: 'alarm', vol: 0.04, rate: 0.89, lp: 700 }, { loop: 'alarm', vol: 0.032, rate: 1.27, lp: 700 },
    { place: 'luka', at: M13.luka }, { place: 'chase', at: M13.chase }, { place: 'chase40', at: M13.c40 },
    { place: 'luke', at: M13.lukeStare }, { place: 'jordan', at: M13.jordan },
    play('jordan', 's13_ladder'),
    // In the backroom, Chase (2040) pulls the Remote from his coat: a cream phone receiver gaffer-taped to a display
    // Neural Chip, a coil of 2040 cable, and a jack that fits nothing in 2026.
    SETUP_WIDE,
    { wait: 0.8 },
    { do: (c) => { const a = act(c, 'chase40'); if (a) a.rig.show('remote', true); } },
    play('chase40', 's13_show'),
    { wait: 0.4 },
    // (an insert on the thing in his hand, tilting up toward his face)
    { do: (c) => { const a = act(c, 'chase40'); if (!a || sk(c)) return; a.eyePos(V1); const ry = a.rotY;
      c.cam.shot({ shot: 'CAM', pos: [V1.x + Math.sin(ry) * 0.9 - Math.cos(ry) * 0.2, V1.y - 0.35, V1.z + Math.cos(ry) * 0.9 + Math.sin(ry) * 0.2], look: [V1.x + Math.sin(ry) * 0.25, V1.y - 0.4, V1.z + Math.cos(ry) * 0.25], fov: 36,
        to: { pos: [V1.x + Math.sin(ry) * 0.88 - Math.cos(ry) * 0.2, V1.y - 0.3, V1.z + Math.cos(ry) * 0.88 + Math.sin(ry) * 0.2], look: [V1.x + Math.sin(ry) * 0.2, V1.y - 0.3, V1.z + Math.cos(ry) * 0.2], fov: 36 }, dur: 2.2, ease: 'out' }); } },
    { wait: 1.8 },
    CLOSE('chase40', { dist: 1.0, fov: 36, push: 0.08, dur: 9, yaw: -0.5 }),
    say('chase40', 'The machine\'s in the backroom. ^ In 2040. This is the other end. It needs a landline and someone with steady hands.'),
    expr('chase', 'smug'),
    CLOSE('chase', { dist: 1.0, fov: 38, push: 0.06, dur: 5, yaw: 0.3 }),
    say('chase', 'You\'ve got hands.'),
    // He hands it over (the Remote is Chase's to wire), and the scarred right hand comes up empty
    play('chase40', 'give', { dur: 0.8, loop: false }),
    { wait: 0.45 },
    { do: (c) => { const a = act(c, 'chase40'), b = act(c, 'chase'); if (a) a.rig.show('remote', false); if (b) b.rig.show('remote', !c.state.flags.s13_wire1); } },
    { flag: 's13_given' },
    { item: 'remote' },
    // (holding up his scarred right hand)
    play('chase40', 's13_hand'),
    { do: (c) => { const a = act(c, 'chase40'); if (!a || sk(c)) return; a.eyePos(V1); const ry = a.rotY, sx = Math.sin(ry), sz = Math.cos(ry);
      c.cam.shot({ shot: 'CAM', pos: [V1.x + sx * 1.05 + sz * 0.3, V1.y - 0.05, V1.z + sz * 1.05 - sx * 0.3], look: [V1.x - sz * 0.12 + sx * 0.25, V1.y - 0.12, V1.z + sx * 0.12 + sz * 0.25], fov: 36,
        to: { pos: [V1.x + sx * 0.95 + sz * 0.3, V1.y - 0.05, V1.z + sz * 0.95 - sx * 0.3], look: [V1.x - sz * 0.12 + sx * 0.25, V1.y - 0.1, V1.z + sx * 0.12 + sz * 0.25], fov: 35 }, dur: 5, ease: 'linear' }); } },
    { wait: 0.6 },
    say('chase40', 'I\'ve got hand.'),
    expr('chase', 'worried'),
    CLOSE('chase', { dist: 1.0, fov: 38, push: 0.06, dur: 5, yaw: 0.3 }),
    say('chase', '…What happened?'),
    play('chase40', 'idle'), expr('chase40', 'still'),
    CLOSE('chase40', { dist: 1.0, fov: 36, push: 0.05, dur: 4, yaw: -0.5 }),
    say('chase40', 'Later.'),
    // (Through the backroom door window, Luke has come out of his office and is staring at the wreck. He turns toward
    // the corridor.) Chase (2040)'s look through the little window; under it he's at the door and Luka has stepped
    // clear of the lens that comes next
    play('luke', 'idle'), expr('luke', 'suspicious'), { place: 'luke', at: M13.lukeStare },
    WINDOW_POV,
    { place: 'chase40', at: M13.window }, play('chase40', 'idle'),
    { place: 'luka', at: M13.lukaAside },
    { wait: 1.6 },
    turnSlow('luke', PI, 0.6),
    { wait: 1.0 },
    { move: 'luke', to: [6.4, 0, -13.4], nowait: true },
    { wait: 0.5 },
    // CHASE (2040): "Someone has to keep him out of here." (he turns from the window to the two of them)
    expr('chase40', 'tired'),
    WIN_MID,
    { wait: 0.3 },
    turnSlow('chase40', M13.windowFrom, 0.5),
    { wait: 0.3 },
    say('chase40', 'Someone has to keep him out of here.'),
    // (Luka and Chase look at each other.)
    turn('luka', 'chase'), turn('chase', 'luka'), expr('chase', 'neutral'),
    { shot: 'TWO', on: ['luka', 'chase'] },
    { wait: 1.2 },
    play('luka', 'lanyard', { dur: 1.2, loop: false }),
    CLOSE('luka', { dist: 0.85, fov: 36, push: 0.08, dur: 4, yaw: 0.8 }),
    { wait: 0.5 },
    say('luka', '…I\'ll do it.'),
    // out into the corridor: the door, and Luke coming down it
    { place: 'luke', at: [6.4, 0, -15.0, PI] }, play('luke', 'idle'),
    { prop: 'backroom_door', fn: (o) => { o.userData.open = true; } },
    { place: 'luka', at: [6.4, 0, -24.3, 0] },
    CORR_DOOR,
    { wait: 0.3 },
    { sfx: 'creak', vol: 0.3 },
    { move: 'luka', to: M13.stallLuka, nowait: true },
    { move: 'luke', to: M13.stallLuke, nowait: true },
    { wait: 1.4 },
    { prop: 'backroom_door', fn: (o) => { o.userData.open = false; } },
    { do: (c) => waitUntil(() => c.flow.skipping || flow.sceneId !== '1.3' || (act(c, 'luka') && act(c, 'luka').pos.z > -18.4)) },
    { place: 'luka', at: M13.stallLuka }, { place: 'luke', at: M13.stallLuke },
    { place: 'chase', at: M13.wireChase }, { place: 'chase40', at: M13.wireC40 },
    // into the Stall (its own camera, the same lens: no jump)
    { do: (c) => { c.cam.shot(STALL_BASE); c.cam.cutscene = false; } },
  ];

  CUTSCENES['1.3_call'] = [
    { do: (c) => { ui.meter(null, null); const lk = act(c, 'luke'); if (lk) lk.visible = false; c.world.prebuild('reddy40'); } },
    { music: null, fade: 1.5 },
    // [MID · the backroom] The three of them crowd round the wall phone. Chase (2040) dials the store's own number.
    { place: 'chase40', at: M13.callC40 }, { place: 'luka', at: M13.callLuka }, { place: 'chase', at: M13.callChase },
    play('luka', 'idle'), play('chase', 'idle'), expr('luka', 'worried'), expr('chase', 'neutral'), expr('chase40', 'tired'),
    { prop: 'remote_plugged', visible: true },
    CALL_MID,
    { wait: 0.5 },
    { hold: 'chase40', prop: 'wall_phone_handset', hand: 'R' },
    play('chase40', 'phone'),
    { sfx: 'clunk', vol: 0.25 },
    { wait: 0.4 },
    { sfx: 'key_beep', vol: 0.3 }, { wait: 0.18 }, { sfx: 'key_beep', vol: 0.3, rate: 1.1 }, { wait: 0.18 }, { sfx: 'key_beep', vol: 0.3, rate: 0.95 }, { wait: 0.18 },
    { sfx: 'key_beep', vol: 0.3, rate: 1.05 }, { wait: 0.3 },
    say('chase40', 'Same number. Always has been. ^ It rings the kettle now.'),
    // [SPLIT SCREEN] Left: 2026, the three of them in the backroom with the alarms muffled. Right: 2040, the same
    // backroom, darker; four scorch marks on the ceiling; the machine of four display Neural Chips in cradles, a
    // hover-scooter battery and a nest of cables; and plugged into it, a chrome kettle with a little screen.
    turn('chase40', [6.9, 0, -27.6]),
    { do: (c) => { const S = SETS.reddy40; if (S && S.dress) S.dress('split13'); const d = c.world.prop('des', 'reddy40'); if (d) d.userData.screen('des'); } },
    { split: { left: { shot: SPLIT_L }, right: { set: 'reddy40', shot: { shot: 'INSERT', at: 'split_a' }, env: 'dim' } }, slide: true },
    { sfx: 'trill', vol: 0.45 },
    { wait: 1.3 },
    say('operator', 'You have a reverse-charge call from Chase, Optus Redcliffe, 2026. Will you accept the charges?'),
    // [RIGHT HALF · ECU · the kettle's screen] The screen reads DES, then: Would you like to boil? [YES]. It ticks YES
    // itself.
    DES_ECU,
    { wait: 1.0 },
    { do: (c) => { const d = c.world.prop('des', 'reddy40'); if (d) d.userData.screen('boil_q'); } },
    { sfx: 'ss_chirp', vol: 0.35 },
    { wait: 1.5 },
    { do: (c) => { const d = c.world.prop('des', 'reddy40'); if (d) d.userData.screen('boil_yes'); } },
    { sfx: 'button_press', vol: 0.35 },
    { wait: 1.0 },
    { do: (c) => { const d = c.world.prop('des', 'reddy40'); if (d) d.userData.screen('tea'); const m = c.world.prop('machine', 'reddy40'); if (m) m.userData.flare(true); } },
    { sfx: 'des_chirp', vol: 0.45 },
    say('des', 'Tea?'),
    // [LEFT HALF]
    { split: { right: { shot: DES_CLOSE } } },
    CALL_THREE,
    { wait: 0.5 },
    expr('chase', 'stunned'),
    CLOSE('chase', { dist: 0.95, fov: 40, push: 0.05, dur: 5, yaw: 0.3 }),
    say('chase', 'Why is your kettle answering the phone?'),
    CLOSE('chase40', { dist: 0.95, fov: 40, push: 0.05, dur: 5, yaw: 0.45 }),
    say('chase40', 'It\'s on a plan. Everything\'s on a plan.'),
    // LUKA (glances toward the floor, where Jordan is)
    expr('luka', 'worried'),
    CLOSE('luka', { dist: 1.1, fov: 40, push: 0.05, dur: 5, yaw: -0.3 }),
    play('luka', 'glance', { yaw: 0.5, dur: 1.4 }),
    { wait: 0.6 },
    say('luka', 'Jordan\'s on his own out there.'),
    CLOSE('chase40', { dist: 0.95, fov: 40, push: 0.05, dur: 5, yaw: 0.45 }),
    say('chase40', 'He\'ll be fine.'),
    CLOSE('luka', { dist: 0.95, fov: 40, push: 0.05, dur: 5, yaw: -0.3 }),
    say('luka', 'You don\'t know that.'),
    CLOSE('chase40', { dist: 0.95, fov: 40, push: 0.05, dur: 6, yaw: 0.45 }),
    say('chase40', 'I do, actually. He runs the place in 2040.'),
    expr('luka', 'stunned'),
    CALL_THREE,
    say('luka', '…Jordan?'),
    say('chase40', 'He\'s my boss.'),
    expr('chase', 'stunned'),
    CLOSE('chase', { dist: 0.9, fov: 40, push: 0.05, dur: 5, yaw: 0.3 }),
    say('chase', 'You\'re still CASUAL?'),
    expr('chase40', 'tired'),
    CLOSE('chase40', { dist: 0.95, fov: 40, push: 0.06, dur: 6, yaw: 0.45 }),
    say('chase40', 'Senior casual. ^ They made it up for me.'),
    // DES (down the line)
    { split: { right: { shot: DES_ECU } } },
    say('des', 'Tea?', { tag: 'down the line' }),
    // LUKA (twisting his lanyard)
    expr('luka', 'worried'),
    play('luka', 'lanyard'),
    CLOSE('luka', { dist: 0.95, fov: 40, push: 0.08, dur: 6, yaw: -0.3 }),
    { wait: 0.6 },
    say('luka', '…We\'ll be back before lunch.'),
    CALL_THREE,
    say('chase', 'You said that last time.'),
    play('luka', 'idle'),
    say('luka', 'I don\'t remember last time.'),
    say('chase', 'Neither do I. I listened to the tape.'),
    // [WIDE] White fills the frame.
    { split: { left: { shot: SPLIT_L }, right: { shot: SPLIT_R } } },
    { do: (c) => { const m = c.world.prop('machine', 'reddy40'); if (m) m.userData.flare(true); const d = c.world.prop('des', 'reddy40'); if (d && !sk(c)) d.userData.boil(); } },
    { sfx: 'flash_hum', vol: 0.6 },
    { wait: 0.6 },
    { sfx: 'zap', vol: 0.5 },
    { fade: 'out', dur: 0.6, color: '#fff' },
    // (under the white) the split closes, the backroom empties; out on the floor the wreck still smokes
    { split: null },
    { loop: 'alarm', stop: true, fade: 0.05 },
    { hold: 'chase40', prop: null },
    { despawn: 'luka' }, { despawn: 'chase' }, { despawn: 'chase40' },
    { do: (c) => { const tt = P(c, 'hero_tethers'); if (tt) tt.userData.swing(0.55); const s = P(c, 'smoke_floor'); if (s && s.userData.amount) s.userData.amount(0.8, 0); } },
    { do: (c) => { const lk = act(c, 'luke'); if (lk) { lk.visible = true; lk.setExpr('stunned'); lk.place([6.4, 0, -13.5, 0]); } const j = act(c, 'jordan'); if (j) { j.place(M13.jordan); j.play('s13_ladder'); j.setExpr('worried'); } } },
    { loop: 'alarm', vol: 0.064, rate: 1.0 }, { loop: 'alarm', vol: 0.052, rate: 1.13 }, { loop: 'alarm', vol: 0.052, rate: 0.89 }, { loop: 'alarm', vol: 0.04, rate: 1.27 },
    // [WIDE · locked, the store floor] Smoke over the wreck of the Hero Table, tinsel on the floor, four tethers swinging
    // slower and slower. Luke steps out of the corridor. Jordan stands holding the ladder.
    FLOOR_LOCK,
    { fade: 'in', dur: 1.0 },
    { move: 'luke', to: M13.lukeOut },
    { wait: 0.5 },
    say('luke', '…Where\'d they go?'),
    { wait: 0.3 },
    say('jordan', '…Lunch?'),
    { wait: 0.5 },
    // [INSERT] The wall clock: 12:04.
    setClock(12, 4),
    { shot: 'INSERT', at: 'clock_floor', card: ['clock', { time: '12:04' }] },
    { wait: 2.2 },
    { fade: 'out', dur: 0.8 },
  ];
})();
