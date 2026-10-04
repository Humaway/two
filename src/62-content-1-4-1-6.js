// ============================================================ CONTENT: 1.4 ("All the Bulbs Are LED Now"), 1.5 ("Cred"), 1.6 ("Safety Address")
// BUILD_PROMPT §8. Every line is final and word for word; '^' = a beat. Shot tags are quoted in the comments.
// Set: reddy40 (docs/sets/reddy40.md; marks s14_* s15_* s16_*, anchors, the stealth zone table, the drones' posts).
// 1.4: the arrival (the heap, "Tea?", four scorch marks, the plant, the machine, the bulbs, Des), then a roam as Chase
//   (Luka follows, Chase (2040) walks ahead to the counter): examines, the Des kettle (save + the Kettle sample), the
//   chip kiosk (Chip chime), and the meeting with Jordan (2040) when Chase reaches him at the counter.
// 1.5: the setup (cred, Jordan passing, Jayden), Chase (2040)'s chip view POV and the TOP-DOWN, the Neural Chip Sale
//   (43-mg-chip-sale.js: its own Chip View tutorial and the 'I say yes to my chip.' lines), the bonus, "I used to be quick."
// 1.6: the Manager's address (hint 1, second time: the glance on the big screen; the motif before he speaks, never on
//   it), the HUD (NO SERVICE · QUIET IN 46:58:00), the Courtesy Drones, Jordan's "Back door.", then the stealth
//   tutorial: the zap (scripted, once), the lure through the old counter speaker (Chase), the roller door (Luka's
//   strength hold, the first-time "Let me—" / "I've got it."), the chip prompt in the car park (NO: the soft fail), the
//   pole, the skip bin (optional cover, Luka), the gate onto Redcliffe Parade.
// Continue restarts a scene at step 0: every first cutscene re-dresses the set (one tick after its own auto-dress).
// Autoplay solves every roam on foot through the real hotspots (paths go round the display tables, x -5..-3.8 and
// -0.2..1, z -7.25..-4.75 / -11.25..-8.75, and the counter's bar stools). &s16fail=1 (autoplay only) also plays 1.6's
// fail paths: one capture in the staff aisle (the Safe Room, retry at the alcove) and NO at the chip prompt (SafeSense's
// soft fail, retry, the prompt again, then YES).
(() => {
  const PI = Math.PI, H = PI / 2;
  const say = (id, text, o) => Object.assign({ say: id, text }, o);
  const slow = (id, text, o) => say(id, text, Object.assign({ speed: 'slow' }, o));
  const sk = (c) => c.flow.skipping;
  const P = (c, n) => c.world.prop(n);
  const act = (c, id) => c.world.actor(id);
  const V1 = new THREE.Vector3();
  const put = (id, x, z, ry) => ({ place: id, at: [x, 0, z, ry] });
  const SET = () => SETS.reddy40;
  const dress = (st) => { const s = SET(); if (s && s.dress && world.setId === 'reddy40') s.dress(st); };
  // one tick later (even while skipping): the set re-dresses itself on its first tick in a new scene
  const nextTick = () => new Promise((res) => { const f = () => { removeUpdate(f); res(); }; addUpdate(f); });
  // autoplay's waits: checked every tick, even while a cutscene is being skipped
  const until = (fn) => waitUntil(fn, { skip: false });
  // a tween on the game clock, snapped at once while skipping or when the scene changes (no allocation per tick)
  function tween(c, dur, fn) {
    const sid = c.flow.sceneId;
    if (c.flow.skipping || !(dur > 0)) { fn(1); return; }
    let t = 0;
    const f = (dt) => { t = Math.min(1, t + dt / dur); if (flow.sceneId !== sid || flow.skipping) t = 1; fn(t * t * (3 - 2 * t)); if (t >= 1) removeUpdate(f); };
    addUpdate(f);
  }
  // fn after `sec` of game time (at once while skipping); never into another scene
  function later(c, sec, fn) {
    const sid = c.flow.sceneId;
    if (c.flow.skipping || !(sec > 0)) { fn(); return; }
    let t = 0;
    const f = (dt) => { t += dt; if (flow.sceneId !== sid) { removeUpdate(f); return; } if (t >= sec || flow.skipping) { removeUpdate(f); fn(); } };
    addUpdate(f);
  }
  // a scene-scoped updater: runs while the scene is `id`, removes itself (and calls off) as soon as it isn't
  function scope(id, fn, off) {
    const f = (dt) => { if (flow.sceneId !== id) { removeUpdate(f); if (off) off(); return; } fn(dt); };
    addUpdate(f);
    return f;
  }
  // the active character says it (examine lines)
  const me = (text) => ({ do: (c) => (sk(c) ? null : c.say(c.state.active, text)) });
  // an anchor's lens, drifting `push` m toward its subject (the INSERTs and set frames, never quite still)
  function fromA(n, o = {}) {
    const a = SET() && SET().anchors[n];
    if (!a) { console.warn('TWO 1.4-1.6: no anchor ' + n); return { wait: 0 }; }
    const f = a.from, t = a.at, dx = t[0] - f[0], dy = t[1] - f[1], dz = t[2] - f[2], L = Math.hypot(dx, dy, dz) || 1, k = (o.push ?? 0.12) / L;
    const fov = o.fov ?? a.fov ?? 40;
    const s = { shot: 'CAM', pos: f.slice(), look: t.slice(), fov, to: { pos: [f[0] + dx * k, f[1] + dy * k, f[2] + dz * k], look: t.slice(), fov: o.fovTo ?? fov }, dur: o.dur ?? 6, ease: 'linear' };
    if (o.card) s.card = o.card;
    return s;
  }
  const cam = (pos, look, fov, to, dur, o) => Object.assign({ shot: 'CAM', pos, look, fov, to: to ? { pos: to[0] || pos, look: to[1] || look, fov: to[2] ?? fov } : undefined, dur: dur || 6, ease: 'linear' }, o);
  // a computed close-up: the lens `dist` m from his eyes, `yaw` rad off his facing (+ = toward his left), pushing in
  // `push` m over `dur` s. Read at step time (faces placed under the cut); nothing while skipping.
  function closeOn(c, id, o = {}) {
    if (sk(c)) return;
    const a = act(c, id);
    if (!a) return;
    c.ui.card(null);
    a.eyePos(V1);
    const ry = (o.ry ?? a.rotY) + (o.yaw || 0), d = o.dist || 0.95, pu = o.push ?? 0.1, ly = V1.y - 0.05 + (o.ly || 0);
    const sx = Math.sin(ry), sz = Math.cos(ry), y = V1.y + (o.dy ?? -0.02), f = o.fov || 36, lx = V1.x + (o.lx || 0), lz = V1.z + (o.lz || 0);
    c.cam.shot({ shot: 'CAM', pos: [V1.x + sx * d, y, V1.z + sz * d], look: [lx, ly, lz], fov: f,
      to: { pos: [V1.x + sx * (d - pu), y + (o.rise || 0), V1.z + sz * (d - pu)], look: [lx, ly, lz], fov: o.fovTo || f }, dur: o.dur || 7, ease: 'linear' });
  }
  const CLOSE = (id, o) => ({ do: (c) => closeOn(c, id, o) });
  // a close on `id` from whichever side of his face (±mag off his facing) keeps `from` furthest out of the frame
  function closeAway(c, id, from, o = {}) {
    const a = act(c, id), b = act(c, from);
    if (!a || !b) { closeOn(c, id, o); return; }
    const m = o.mag || 0.6, d = o.dist || 0.95;
    let best = m, bestA = -1;
    for (const y of [m, -m]) {
      const ry = a.rotY + y, cx = a.pos.x + Math.sin(ry) * d, cz = a.pos.z + Math.cos(ry) * d;
      const ux = a.pos.x - cx, uz = a.pos.z - cz, vx = b.pos.x - cx, vz = b.pos.z - cz;
      let ang = Math.acos(Math.max(-1, Math.min(1, (ux * vx + uz * vz) / (Math.hypot(ux, uz) * Math.hypot(vx, vz) || 1))));
      if (c.world.lineClear && !c.world.lineClear(a.pos.x, a.pos.z, cx, cz, 0.05)) ang -= 10;   // never a lens inside the furniture
      if (ang > bestA) { bestA = ang; best = y; }
    }
    closeOn(c, id, Object.assign({}, o, { yaw: best }));
  }
  const AWAY = (id, from, o) => ({ do: (c) => closeAway(c, id, from, o) });
  // the active character turns to a point (instant: a shot follows)
  const meFace = (to, dur = 0) => ({ do: (c) => { const a = act(c, c.state.active); if (a) a.face(to, sk(c) ? 0 : dur); } });
  // Luka's habit: he glances at Chase before he speaks (a head turn, the feet stay)
  const glance = (from, to, dur = 1.0) => ({ do: (c) => {
    if (sk(c)) return;
    const a = act(c, from), b = act(c, to);
    if (!a || !b) return;
    let d = Math.atan2(b.pos.x - a.pos.x, b.pos.z - a.pos.z) - a.rotY; d = Math.atan2(Math.sin(d), Math.cos(d));
    a.play('glance', { yaw: Math.max(-1.3, Math.min(1.3, d)), dur });
  } });
  // face an actor at once (no smear) toward a point or actor
  const turn = (id, to) => ({ face: id, to, dur: 0 });
  // swap until `id` leads (three playables: SWAP cycles)
  function swapTo(c, id) { for (let i = 0; i < 3 && c.state.active !== id; i++) if (!c.flow.swapNext()) break; }
  // walk the active character through waypoints (autoplay solves the roams on foot, through the real hotspots)
  async function walk(c, pts, run = true) {
    const sid = c.flow.sceneId;
    c.player.enabled = true;   // the party's followers walk the leader's trail only while the player is enabled
    for (const p of pts) {
      const a = act(c, c.state.active);
      if (!a || c.flow.sceneId !== sid) break;
      await a.moveTo(p, { run, collide: true });
    }
    await c.wait(run ? 0.6 : 0.4);   // let them catch up
    c.player.enabled = false;
  }
  // an actor walks a route in the background (scripted, not awaited); stops when the scene changes
  function stroll(c, id, pts, o = {}) {
    const sid = c.flow.sceneId;
    const a = act(c, id);
    if (!a) return Promise.resolve();
    if (sk(c)) { const l = pts[pts.length - 1]; a.place(l); return Promise.resolve(); }
    return (async () => {
      for (const p of pts) { if (c.flow.sceneId !== sid) return; await a.moveTo(p, { run: !!o.run, collide: o.collide !== false }); }
      if (o.face != null && c.flow.sceneId === sid) a.face(o.face, 0.4);
    })();
  }
  // the store's doorways (the route between the backroom, the corridor, the staff aisle and the floor)
  const DOOR_BACK = [6.4, 0, -24.15], DOOR_STAFF = [6.4, 0, -12.6], GAP_R = [9.45, 0, -9.0], GAP_R2 = [9.45, 0, -8.15];
  const region = (x, z) => (z < -23.95 ? 0 : z < -12.6 && x > 5.2 ? 1 : z < -9.4 && x > 2.6 ? 2 : 3);
  // the alcove in front of the display wall (floor, but open to the staff aisle behind the counter): leave it by the
  // floor side of the last display table, never across the staff aisle into the back of the counter
  const ALC_OUT = [[1.8, 0, -11.7], [1.8, 0, -8.4], [3.0, 0, -7.2]];   // round the last display table's far corner
  const inAlcove = (p) => p[2] < -9.45 && p[0] < 2.6;
  function route(from, to) {   // waypoints from a point to a point through the doorways (both [x, y, z])
    const a = region(from[0], from[2]), b = region(to[0], to[2]), out = [];
    const step = [DOOR_BACK, DOOR_STAFF, GAP_R];
    if (a === 3 && inAlcove(from) && !inAlcove(to)) out.push(...ALC_OUT);
    if (a < b) { for (let r = a; r < b; r++) { out.push(step[r]); if (r === 2) out.push(GAP_R2); } }
    else if (a > b) { for (let r = a - 1; r >= b; r--) { if (r === 2) out.push(GAP_R2); out.push(step[r]); } }
    if (b === 3 && inAlcove(to) && !(a === 3 && inAlcove(from))) out.push(ALC_OUT[2], ALC_OUT[1], ALC_OUT[0]);
    out.push(to);
    return out;
  }

  // ---------------------------------------------------------- CARDS (readable INSERTs this file owns)
  // The noticeboard, close: the same yellowed LANYARD REQUESTS paper on the same pin (2026's, fourteen years on).
  CARDS.s14_flyer = (cx, w, h) => {
    const K = CARDS._kit;
    K.seedOf('s14-flyer');
    // the cork
    cx.fillStyle = '#b98a54'; cx.fillRect(0, 0, w, h);
    for (let i = 0; i < 1600; i++) { cx.fillStyle = K.rnd() > 0.5 ? 'rgba(150,108,62,.55)' : 'rgba(214,170,116,.5)'; cx.fillRect(K.rnd() * w, K.rnd() * h, 3, 3); }
    // the corner of the roster beside it (newer paper, white, a blue pin)
    cx.save(); cx.translate(w * 0.86, h * 0.2); cx.rotate(0.05);
    K.shadow(cx, 12, 5, 0.3); cx.fillStyle = '#f7f8f6'; cx.fillRect(-90, -120, 230, 300); K.noShadow(cx);
    cx.fillStyle = '#c62828'; cx.font = `bold 30px ${K.SANS}`; cx.textAlign = 'left'; cx.textBaseline = 'middle'; cx.fillText('ROSTER', -70, -80);
    cx.fillStyle = '#2f6fd6'; cx.beginPath(); cx.arc(20, -108, 8, 0, 7); cx.fill();
    cx.restore();
    // the flyer: yellowed, brown at the edges, foxed, a little curled; the same red pin, the same angle
    cx.save(); cx.translate(w * 0.42, h * 0.52); cx.rotate(-0.04);
    const pw = w * 0.6, ph = h * 0.74;
    K.shadow(cx, 26, 10, 0.4);
    cx.fillStyle = '#e8d27a'; cx.fillRect(-pw / 2, -ph / 2, pw, ph);
    K.noShadow(cx);
    const g = cx.createRadialGradient(0, 0, pw * 0.25, 0, 0, pw * 0.7); g.addColorStop(0, 'rgba(160,110,40,0)'); g.addColorStop(1, 'rgba(140,90,30,.45)');
    cx.fillStyle = g; cx.fillRect(-pw / 2, -ph / 2, pw, ph);
    for (let i = 0; i < 26; i++) { cx.fillStyle = `rgba(150,100,40,${0.12 + K.rnd() * 0.18})`; cx.beginPath(); cx.arc(-pw / 2 + K.rnd() * pw, -ph / 2 + K.rnd() * ph, 2 + K.rnd() * 7, 0, 7); cx.fill(); }
    cx.strokeStyle = 'rgba(120,80,30,.55)'; cx.lineWidth = 6; cx.strokeRect(-pw / 2 + 3, -ph / 2 + 3, pw - 6, ph - 6);
    // a dog-eared corner
    cx.fillStyle = '#c9b062'; cx.beginPath(); cx.moveTo(pw / 2, ph / 2 - 46); cx.lineTo(pw / 2 - 46, ph / 2); cx.lineTo(pw / 2 - 40, ph / 2 - 40); cx.closePath(); cx.fill();
    cx.textAlign = 'center'; cx.textBaseline = 'middle';
    cx.fillStyle = '#26221c'; cx.font = `bold 66px ${K.SANS}`; cx.fillText('LANYARD', 0, -ph * 0.27);
    cx.fillText('REQUESTS', 0, -ph * 0.27 + 70);
    cx.fillStyle = '#4a3a20'; cx.font = `40px ${K.SANS}`; cx.fillText('please allow', 0, ph * 0.08);
    cx.fillStyle = '#141d3a'; cx.font = `bold 74px ${K.SANS}`; cx.fillText('6–8 weeks', 0, ph * 0.27);
    // the pin, its old hole beside it
    cx.fillStyle = 'rgba(60,40,20,.6)'; cx.beginPath(); cx.arc(16, -ph / 2 + 22, 3, 0, 7); cx.fill();
    K.shadow(cx, 6, 3, 0.4); cx.fillStyle = '#d32f2f'; cx.beginPath(); cx.arc(0, -ph / 2 + 22, 13, 0, 7); cx.fill(); K.noShadow(cx);
    cx.fillStyle = 'rgba(255,255,255,.45)'; cx.beginPath(); cx.arc(-4, -ph / 2 + 18, 4, 0, 7); cx.fill();
    cx.restore();
  };
  CARDS.s14_flyer.size = [900, 620];

  // ---------------------------------------------------------- custom poses (registered once)
  // pointing up and forward at the ceiling (the scorch marks): the right arm raised, the head tipped back
  if (!ANIMS.s14_point_up) {
    ANIMS.s14_point_up = (r, t, p) => {
      ANIMS.idle(r, t, p);
      if (!RIGKIT) return;
      const d = r.d, Pt = r.parts;
      RIGKIT.arm(r, -1, d.shX * 0.7, d.headC + 0.22, 0.42, 1, -0.4, -0.3);
      Pt.handR.rotation.x = -0.2; Pt.head.rotation.x = -0.32; Pt.neck.rotation.x = -0.12;
    };
  }

  // =================================================================== 1.4 — "All the Bulbs Are LED Now"
  // Backroom x 2.4..10.4, z -30..-24 (ceiling 2.8): the machine against the front wall (x 3.35..5.15, Des on its top
  // shelf at (4.25, 0.95, -24.38), screen facing -Z), scorch P1 (5.3, -26.2) P2 (7.6, -27.3) P3 (5.2, -27.7) P4 (7.7,
  // -25.6), the plant (9.3, -29.55), the light switch (5.7, 1.3, -24.01). The floor: the counter x 3.15..7.85 at
  // z -9.45..-8.55, the kiosk (5.6, -5.3), Margaret's chair (2.0, -0.85), the tree on the floor (9.25 -> 7.65, -1.0).
  const SCORCH = [[5.3, 2.79, -26.2], [7.6, 2.79, -27.3], [5.2, 2.79, -27.7], [7.7, 2.79, -25.6]];
  const C40_WAIT = [8.4, 0, -7.6, -2.6];   // s14_c40_wait: by the counter's end, customer side, watching the staff gap for them
  const MEET_BOX = [2.9, -8.75, 8.95, -6.5];   // the customer side of the counter: Chase "reaches the counter" here
  // [WIDE · locked] the cramped backroom: Rue's exact frame (the roller door's light strip in it)
  const HEAP_WIDE = { shot: 'INSERT', at: 'backroom_wide' };
  // [MID] they untangle: the three of them up in the smoke, looking round
  const UNTANGLE = cam([9.0, 1.62, -28.9], [6.6, 1.25, -26.6], 46, [[8.8, 1.6, -28.6]], 5);
  // "Tea?" (Des's screen says it) and "…Yes, please." from the bottom of the pile (low, the heap above the dialogue)
  const DES_TEA = fromA('des', { push: 0.06, dur: 3 });
  const PILE_LOW = cam([5.05, 0.62, -25.75], [6.45, 0.14, -27.25], 48, [[5.15, 0.6, -25.85]], 4);
  // the same backroom, through their eyes (they stand behind the lens): the bench, round the lost-property shelves to
  // the corridor door
  const SAME_A = cam([7.35, 1.62, -26.95], [4.3, 1.05, -29.9], 54, [[7.3, 1.62, -26.9], [2.6, 1.3, -27.1]], 2.4, { ease: 'in' });
  const SAME_B = cam([7.3, 1.62, -26.9], [2.6, 1.3, -27.1], 54, [[7.25, 1.62, -26.85], [6.35, 1.25, -24.0]], 2.6, { ease: 'out' });
  // [TILT UP] the ceiling: four scorch marks now
  const TILT_UP = cam([6.95, 1.05, -24.45], [6.5, 1.5, -26.9], 55, [null, [6.4, 2.75, -26.7], 57], 2.6, { ease: 'out' });
  // "Yours. ^ Also yours…": low from beside the shelves, his pointing arm on our side, the marks over him and the two
  // looking up behind him
  const POINT_LOW = cam([4.3, 1.1, -27.4], [6.4, 1.95, -26.2], 58, [[4.42, 1.12, -27.3]], 6);
  // [CLOSE · the plastic plant] in a corner now, still dying (the whole plant, pot to tip)
  const PLANT = cam([7.6, 1.55, -27.95], [9.3, 1.02, -29.55], 46, [[7.7, 1.53, -28.05]], 6);
  // [MID · the machine]: four display chips in tethered cradles, the scooter battery, the cables, the kettle in the middle
  const MACHINE = cam([4.35, 1.52, -26.25], [4.25, 0.82, -24.35], 46, [[4.33, 1.44, -25.95]], 5);
  // [WIDE] the light switch (nothing changes)
  const SWITCH = fromA('backroom_front', { push: 0.25, dur: 7 });
  // [CLOSE · the kettle] DES glows
  const KETTLE = fromA('des', { push: 0.12, dur: 6 });
  const DES_ECU = fromA('des_screen', { push: 0.05, dur: 4 });
  // nobody reacts: from beside the machine, three faces looking at a kettle
  const ALL_FOUR = cam([5.3, 1.72, -24.3], [5.35, 1.42, -25.6], 58, [[5.3, 1.71, -24.36]], 5);

  // pointing at each mark in turn as the line lands (Yours · Also yours · from Christmas · Mine)
  function pointMarks(c) {
    const a = act(c, 'chase40');
    if (!a) return;
    a.play('s14_point_up');
    if (sk(c)) { a.face([SCORCH[3][0], 0, SCORCH[3][2]], 0); return; }
    const T = [0, 0.95, 2.05, 3.4];
    for (let i = 0; i < 4; i++) later(c, T[i], () => { const b = act(c, 'chase40'); if (b) b.face([SCORCH[i][0], 0, SCORCH[i][2]], 0.25); });
    later(c, 4.6, () => { const b = act(c, 'chase40'); if (b) b.play('idle'); });
  }
  function dress14(c) {
    if (c.world.setId !== 'reddy40') return;
    dress('arrival');
    const d = P(c, 'des'); if (d) d.userData.screen('boiling');
    const sm = P(c, 'smoke_backroom'); if (sm) sm.userData.amount(1, 0);
    const od = P(c, 'jordan_office_door'); if (od) od.userData.open = false;
    listenSamples();
  }
  // Des obligingly boils again when Chase records him; the kiosk chimes when he records it
  let sampleHook = false;
  function listenSamples() {
    if (sampleHook) return;
    sampleHook = true;
    on('sample:add', (k) => {
      const id = flow.sceneId;
      if (id !== '1.4' && id !== '1.6') return;
      if (k === 'kettle') { const d = world.prop('des'); if (d) d.userData.boil(); }
      if (k === 'chip') { const p = world.prop('chip_kiosk'); if (p) p.userData.chime(); }
    });
  }

  // Chase (2040) answers in person: if he's further than 3 m off, he's put (under the cut) a step behind the active
  // character's shoulder, turned to him; afterwards he walks back to where he was waiting.
  const S14 = { fetched: false, home: null, walk: null };
  function fetch40(c, side = 1) {
    const a = act(c, c.state.active), b = act(c, 'chase40');
    if (!a || !b) return;
    if (Math.hypot(b.pos.x - a.pos.x, b.pos.z - a.pos.z) > 2.6) {
      const r = a.rotY;
      let best = null;
      for (const s of [side, -side]) {
        const x = a.pos.x + s * -Math.cos(r) * 0.95 - Math.sin(r) * 0.75, z = a.pos.z + s * Math.sin(r) * 0.95 - Math.cos(r) * 0.75;
        const p = c.world.resolve ? c.world.resolve(x, z, 0.32) : { x, z };
        if (!c.world.lineClear || c.world.lineClear(a.pos.x, a.pos.z, p.x, p.z, 0.05)) { best = [p.x, 0, p.z]; break; }
      }
      if (best) { S14.fetched = true; b.place(best); }
    }
    b.face(c.state.active, 0);
  }
  function back40(c) {
    if (!S14.fetched || c.flow.sceneId !== '1.4') return;
    S14.fetched = false;
    const b = act(c, 'chase40');
    if (!b) return;
    S14.walk = stroll(c, 'chase40', route([b.pos.x, 0, b.pos.z], C40_WAIT), { face: C40_WAIT[3] });
  }
  const FETCH = (side) => ({ do: (c) => fetch40(c, side) });
  const BACK = { do: (c) => back40(c) };
  // the hover-trolley's live position (a hotspot that follows the prop)
  // Margaret's chair from the window end: Chase in profile, the empty chair, the old man beyond it
  const MARGARET_SIDE = cam([-0.55, 1.5, -0.75], [2.1, 1.15, -1.3], 42, [[-0.45, 1.5, -0.8]], 6);
  // the wreath, a step back: hung, very carefully, over something rectangular
  const WREATH = cam([6.95, 1.6, -21.25], [5.42, 1.52, -20.95], 32, [[6.85, 1.6, -21.22]], 6);
  // the chips on their pillows (3% ×4), the big screen's foot above them
  const CHIPS40 = cam([-2.0, 1.45, -12.0], [-2.0, 1.03, -13.95], 42, [[-2.0, 1.43, -12.2]], 7);
  // the customer staring at nothing: her face, from between her and the accessory wall
  const LOCAL_FRONT = cam([-7.7, 1.52, -6.95], [-6.2, 1.5, -6.35], 40, [[-7.6, 1.52, -6.9]], 6);
  const TROLLEY_AT = [8.6, 0, -3.4];
  // the trolley examine: it settles; an insert of it from the far side, low over the floor, the foot of air under it
  // above the dialogue (Chase's legs beyond it); Luka a step behind him
  function trolleyShot(c) {
    const p = trolleyAt(), a = act(c, c.state.active), l = act(c, 'luka');
    if (!a) return;
    a.face([p[0], 0, p[2]], 0);
    if (sk(c)) return;
    const s = P(c, 'hover_trolley'); if (s) s.userData.settle(true);
    let dx = p[0] - a.pos.x, dz = p[2] - a.pos.z;
    const L = Math.hypot(dx, dz) || 1; dx /= L; dz /= L;
    if (l && l !== a) { l.place([a.pos.x - dx * 0.9 - dz * 0.45, 0, a.pos.z - dz * 0.9 + dx * 0.45]); l.face([p[0], 0, p[2]], 0); }
    // the clearest of eight spots round it, on the floor (windows z 0, east wall x 11, counter z -8.55): the one whose
    // line of sight to it passes furthest from everybody
    let cx = p[0] + dz * 2.0, cz = p[2] - dx * 2.0, best = -1;
    for (let i = 0; i < 8; i++) {
      const th = i * PI / 4, x = p[0] + Math.cos(th) * 1.7, z = p[2] + Math.sin(th) * 1.7;
      // (from just outside its own collider, which moves with it)
      if (!(x > -8.4 && x < 10.6 && z < -0.45 && z > -8.2) || (c.world.lineClear && !c.world.lineClear(p[0] + Math.cos(th) * 0.65, p[2] + Math.sin(th) * 0.65, x, z, 0.2))) continue;
      let m = 9;
      for (const id of ['chase', 'luka', 'chase40']) {
        const q = act(c, id);
        if (!q || q.set !== a.set) continue;
        const vx = x - p[0], vz = z - p[2], t = Math.max(0, Math.min(1, ((q.pos.x - p[0]) * vx + (q.pos.z - p[2]) * vz) / (vx * vx + vz * vz)));
        m = Math.min(m, Math.hypot(q.pos.x - p[0] - vx * t, q.pos.z - p[2] - vz * t));
      }
      if (m > best) { best = m; cx = x; cz = z; }
    }
    c.cam.shot({ shot: 'CAM', pos: [cx, 0.95, cz], look: [p[0], 0.32, p[2]], fov: 50, to: { pos: [cx + (p[0] - cx) * 0.08, 0.93, cz + (p[2] - cz) * 0.08] }, dur: 6, ease: 'linear' });
  }
  const trolleyAt = () => { const p = typeof world !== 'undefined' && world.prop && world.prop('hover_trolley'); return p && p.userData.at ? p.userData.at : TROLLEY_AT; };

  // the meeting: Chase reaches Chase (2040) at the counter (he's waiting there) -> flag s14_met
  const S14W = { upd: null };
  function watch14(c) {
    if (S14W.upd) return;
    S14W.upd = scope('1.4', () => {
      if (flow.skipping || flow.busy || flow.cutscene || state.flags.s14_met) return;
      if (!(flow.roaming || TEST.auto) || (TEST.auto && !state.flags.s14_auto_done)) return;
      const ch = world.actor('chase');
      if (!ch || state.active !== 'chase' || S14.fetched) return;
      // (the meeting places Chase (2040) under its first cut, wherever his walk back ended)
      if (ch.pos.x >= MEET_BOX[0] && ch.pos.x <= MEET_BOX[2] && ch.pos.z >= MEET_BOX[1] && ch.pos.z <= MEET_BOX[3]) state.flags.s14_met = true;
    }, () => { S14W.upd = null; });
  }

  SCENES['1.4'] = {
    title: 'All the Bulbs Are LED Now', set: 'reddy40', env: 'day', time: 'Saturday 22 December 2040, 12:04', place: 'Optus Redcliffe',
    playable: ['chase'], swap: false, music: null, hud: null,
    spawn: { chase: 's14_pile_chase', luka: 's14_pile_luka', chase40: 's14_pile_c40' },
    hotspots: [
      // Des (the save point, "Tea?" first) — and with Chase, hold YES: the Kettle ("Tea?") sample
      { id: 'h14_des', at: 'des_stand', r: 0.9, verb: 'Use', des: true, sample: 'kettle' },
      // the chip kiosk where the Hero Table stood: the Chip chime sample (Chase)
      { id: 'h14_kiosk', at: [5.6, 0, -4.5], r: 0.75, sample: 'chip' },
      // Neural Chip display: chips on pillows, 3% ×4 (he looks from the side of the lens, Luka at his back)
      { id: 'h14_chips', at: [-2.0, 0, -13.1], r: 0.95, flag: 's14_chips',
        steps: [CHIPS40, { place: 'chase', at: [-0.35, 0, -12.95, -2.14] }, { place: 'luka', at: [-2.95, 0, -12.35, 2.7] },
          { wait: 0.6 },
          me("They're chips. On little pillows. ^ On 3%. How is a chip on 3%?"),
          FETCH(1), { wait: 0.1 }, AWAY('chase40', 'chase', { dist: 1.05, fov: 38 }), { wait: 0.3 },
          say('chase40', 'Nobody knows.'), { wait: 0.2 }, BACK] },
      // Queue machine
      { id: 'h14_queue', at: [0.2, 0, -1.9], r: 0.75, flag: 's14_queue',
        steps: [meFace([0.8, 0, -1.9]), fromA('queue_machine', { push: 0.15, dur: 6 }), { wait: 0.6 }, me('Now serving: 000. ^ Fourteen years.')] },
      // Noticeboard: the yellowed flyer, same pin (the card stays up for both lines)
      { id: 'h14_notice', at: 'noticeboard', r: 0.85, flag: 's14_notice',
        steps: [fromA('noticeboard', { push: 0.2, dur: 6 }), { place: 'chase', at: [10.25, 0, -10.8, H] }, { place: 'luka', at: [9.35, 0, -10.35, 2.2] },
          { wait: 0.9 },
          fromA('noticeboard', { push: 0.3, dur: 8, card: ['s14_flyer', {}] }), { wait: 0.5 },
          me('LANYARD REQUESTS: please allow 6–8 weeks.'), { wait: 0.3 },
          say('chase', "It's the same piece of paper."), { wait: 0.2 }, { do: (c) => c.ui.card(null) }] },
      // Plastic Christmas tree (on the floor)
      { id: 'h14_tree', at: [8.1, 0, -1.7], r: 0.95, flag: 's14_tree',
        steps: [fromA('tree_floor', { push: 0.2, dur: 6 }), { place: 'chase', at: [7.0, 0, -1.05, 1.54] }, { place: 'luka', at: [6.45, 0, -1.75, 1.2] },
          { wait: 0.7 },
          { act: [['chase', 'look_down']] }, me('Same tree.'),
          { act: [['luka', 'look_down']] },
          { do: (c) => { if (!sk(c)) c.cam.shot({ shot: 'TWO', on: ['chase', 'luka'], angle: 'low', fov: 40 }); } }, { wait: 0.5 },
          say('luka', 'Same tree.'), { wait: 0.3 }, { act: [['chase', 'idle'], ['luka', 'idle']] }] },
      // Price tags: blank
      { id: 'h14_tags', at: [0.9, 0, -4.2], r: 0.75, flag: 's14_tags',
        steps: [meFace([0.4, 0, -4.95]), fromA('price_tag', { push: 0.12, dur: 6 }), { wait: 0.6 }, me("They're blank."),
          FETCH(1), { wait: 0.1 }, AWAY('chase40', 'chase', { dist: 1.05, fov: 38 }), { wait: 0.3 },
          say('chase40', "They're in the chip. Nobody prints anything anymore."), { wait: 0.2 }, BACK] },
      // A waiting chair with a brass plaque: MARGARET'S CHAIR · Reserved since it was a video shop.
      { id: 'h14_margaret', at: [2.0, 0, -1.6], r: 0.75, flag: 's14_margaret',
        steps: [fromA('margaret_plaque', { push: 0.08, dur: 6 }), { place: 'chase', at: [1.55, 0, -1.75, 0.46] }, { place: 'luka', at: [1.05, 0, -2.5, 0.6] },
          { wait: 2.2 },
          MARGARET_SIDE, { wait: 0.3 }, me('…She still comes in?'),
          FETCH(-1), { wait: 0.1 }, AWAY('chase40', 'chase', { dist: 1.0, fov: 36, push: 0.08, dur: 8 }), { wait: 0.4 },
          slow('chase40', 'Every Tuesday. ^ She waits.'), { wait: 0.5 }, BACK] },
      // The Wall (2040): the Polaroid, the PUDDING cassette, a Christmas wreath hung over something rectangular
      { id: 'h14_wall', at: [6.0, 0, -20.95], r: 0.7, flag: 's14_wall', when: (s) => !s.flags.s14_wall,
        steps: [fromA('wall40_all', { push: 0.3, dur: 7 }), { place: 'chase', at: [6.6, 0, -21.85, -H] }, { place: 'luka', at: [6.75, 0, -22.8, -H] },
          { wait: 1.4 },
          WREATH, { wait: 0.6 }, me("Someone's hung that very carefully.")] },
      // (If the player tries to lift it:)
      { id: 'h14_lift', at: [6.0, 0, -20.95], r: 1.15, verb: 'Lift', when: (s) => !!s.flags.s14_wall, once: true, flag: 's14_lift',
        steps: [cam([6.75, 1.62, -21.9], [5.55, 1.62, -20.8], 44, [[6.7, 1.6, -21.8]], 4),
          { place: 'chase', at: [5.95, 0, -20.95, -H] }, { place: 'luka', at: [6.8, 0, -22.85, -H] },
          { do: (c) => {   // he comes up the corridor behind him
            const b = act(c, 'chase40');
            if (b) { S14.fetched = true; b.place([6.55, 0, -19.6]); b.face('chase', 0); }
          } },
          { act: [['chase', 'reach_up']] }, { wait: 0.8 },
          AWAY('chase40', 'chase', { dist: 1.0, fov: 36, push: 0.06, dur: 6 }), { wait: 0.2 },
          slow('chase40', 'Leave it, mate.', { tag: 'quietly' }),
          { act: [['chase', 'idle']] }, { face: 'chase', to: 'chase40', dur: 0.4 }, { wait: 0.9 }, BACK] },
      // Hover-trolley (Luka at his left shoulder, out of the lens)
      { id: 'h14_trolley', get at() { return trolleyAt(); }, r: 1.0, flag: 's14_trolley',
        steps: [{ do: (c) => trolleyShot(c) },
          { wait: 0.7 }, me('It\'s a trolley. It hovers. ^ About a foot.'),
          { do: (c) => { const s = P(c, 'hover_trolley'); if (s) s.userData.settle(false); } }] },
      // Customer staring at nothing (from in front of her: the blank face, Chase beyond her shoulder)
      { id: 'h14_local', at: 'local40_a', r: 1.15, verb: 'Talk', flag: 's14_local',
        steps: [meFace([-6.3, 0, -6.4]), LOCAL_FRONT, { wait: 0.4 }, me('Hello?'), { wait: 1.6 }] },
      // Luke's old office door: JORDAN — MANAGER. Under it, in biro: KNOCK. PLEASE. Under that: ESPECIALLY CHASE.
      { id: 'h14_office', at: 'office_door', r: 0.85, flag: 's14_office',
        steps: [meFace([9.9, 0, -12.6]), fromA('office40_sign', { push: 0.05, dur: 6 }), { wait: 3.2 }] },
    ],
    steps: [
      ['cutscene', '1.4_arrival'],
      ['control', 'chase'],
      ['follow', 'luka'],
      ['do', (c) => {
        c.music('store40', { fade: 2.5 });
        watch14(c);
        // Chase (2040) walks ahead and waits by the counter
        S14.fetched = false;
        const b = act(c, 'chase40');
        if (b) stroll(c, 'chase40', route([b.pos.x, 0, b.pos.z], C40_WAIT), { face: C40_WAIT[3] });
      }],
      ['objective', "Find out what's changed."],
      ['roam', {
        until: 's14_met',
        // a look up the corridor at the floor, where he's waiting (no words)
        hint: { after: 150, steps: [{ do: (c) => { if (!sk(c)) c.cam.shot({ shot: 'CAM', pos: [3.4, 1.6, -11.6], look: [7.2, 1.4, -7.7], fov: 34, to: { pos: [3.6, 1.6, -11.4] }, dur: 3, ease: 'linear' }); } }, { wait: 2.4 }] },
        async auto(c) {   // on foot, through the real hotspots: Des, the Wall, the noticeboard, the floor, the counter
          const T = (id) => c.hotspots.trigger(id);
          await walk(c, ['des_stand'], false); await T('h14_des');
          if (!c.state.samples.includes('kettle')) console.error('TWO 1.4: the Kettle sample was not recorded');
          await walk(c, [DOOR_BACK, [6.4, 0, -21.0], [6.0, 0, -20.95]]); await T('h14_wall'); await T('h14_lift');
          await walk(c, [DOOR_STAFF, [9.6, 0, -11.2], [10.25, 0, -11.55]]); await T('h14_notice');
          await walk(c, [[9.9, 0, -11.75]]); await T('h14_office');
          await walk(c, [GAP_R, [9.6, 0, -6.0], [8.0, 0, -2.0]]); await T('h14_tree');
          await walk(c, [[7.0, 0, -3.6]]); await T('h14_trolley');
          await walk(c, [[5.6, 0, -4.45]]); await T('h14_kiosk');
          if (!c.state.samples.includes('chip')) console.error('TWO 1.4: the Chip chime was not recorded');
          await walk(c, [[3.4, 0, -2.6], [2.0, 0, -1.65]]); await T('h14_margaret');
          await walk(c, [[0.2, 0, -2.5]]); await T('h14_queue');
          await walk(c, [[1.5, 0, -4.2]]); await T('h14_tags');
          // (the display tables: x -5..-3.8 and -0.2..1, z -7.25..-4.75 and -11.25..-8.75; the aisles between)
          await walk(c, [[-1.9, 0, -3.0], [-2.0, 0, -8.0], [-5.6, 0, -8.0], [-5.4, 0, -7.0]]); await T('h14_local');
          await walk(c, [[-5.6, 0, -8.0], [-2.0, 0, -8.0], [-2.0, 0, -12.9]]); await T('h14_chips');
          await S14.walk;   // (he walks back to the counter first: nobody shoulders past anybody between the tables)
          c.state.flags.s14_auto_done = true;
          await walk(c, [[-2.0, 0, -8.0], [2.4, 0, -8.0], [2.9, 0, -7.1], [5.8, 0, -7.5]], false);
          { const P3 = (id) => { const a = act(c, id); return a ? a.pos.x.toFixed(1) + ',' + a.pos.z.toFixed(1) : '?'; };
            testLog('1.4 auto at the counter · chase ' + P3('chase') + ' luka ' + P3('luka') + ' chase40 ' + P3('chase40')); }
          await until(() => c.state.flags.s14_met || c.flow.sceneId !== '1.4');
        },
      }],
      ['objective', null],
      ['follow', null],
      ['cutscene', '1.4_jordan'],
    ],
    grants: { flags: { s14_met: true }, samples: ['kettle'] },
  };

  CUTSCENES['1.4_arrival'] = [
    { do: (c) => nextTick().then(() => dress14(c)) },
    { fade: 'out', dur: 0 },
    { act: [['chase', 'lie_tangled'], ['luka', 'lie_tangled'], ['chase40', 'lie_tangled']] },
    // [ECU] The kettle's screen: DES · Boiling…
    DES_ECU,
    { fade: 'in', dur: 0.8 },
    { prop: 'machine', fn: (o) => o.userData.flare(true) },
    { sfx: 'kettle', vol: 0.5 },
    { wait: 2.4 },
    // [WIDE · locked] The 2040 backroom, cramped. A white flash, smoke. Three men lie tangled on the floor.
    HEAP_WIDE,
    { sfx: 'bam', vol: 0.85 },
    { flash: 0.7 },
    { do: (c) => { const sm = P(c, 'smoke_backroom'); if (sm) sm.userData.amount(0.15, sk(c) ? 0 : 7); const m = P(c, 'machine'); if (m) later(c, 1.6, () => m.userData.flare(false)); } },
    { wait: 0.6 },
    // Stare, 2 s. The kettle clicks off.
    { par: [
      { stare: 2 },
      { do: (c) => { later(c, 1.2, () => { if (!sk(c)) c.sfx('kettle_click', { vol: 0.7 }); const d = P(c, 'des'); if (d) d.userData.screen('tea'); }); } },
    ] },
    DES_TEA,
    say('des', 'Tea?'),
    PILE_LOW,
    say('chase', '…Yes, please.', { tag: 'muffled' }),
    { wait: 0.4 },
    // [MID] They untangle. Luka and Chase look round.
    { place: 'luka', at: 's14_luka_look' }, { place: 'chase', at: 's14_chase_look' }, { place: 'chase40', at: 's14_c40_point' },
    { act: [['luka', 'brush_shoulder'], ['chase', 'idle'], ['chase40', 'idle']] },
    UNTANGLE,
    { wait: 0.9 },
    { act: [['chase', 'glance', { yaw: 1.0, dur: 1.6 }], ['luka', 'glance', { yaw: -0.9, dur: 1.8 }]] },
    { wait: 1.4 },
    // It's the same backroom: same bench, same lost property, same corridor door.
    { place: 'luka', at: [8.25, 0, -26.45, -H] }, { place: 'chase', at: [8.0, 0, -27.6, -H] }, { place: 'chase40', at: [8.95, 0, -25.3, -2.4] },
    SAME_A,
    { wait: 2.4 },
    SAME_B,
    { wait: 2.8 },
    // [TILT UP] The ceiling: four scorch marks now.
    { place: 'luka', at: 's14_luka_look' }, { place: 'chase', at: 's14_chase_look' }, { place: 'chase40', at: 's14_c40_point' },
    { face: 'luka', to: [6.4, 0, -26.8], dur: 0 }, { face: 'chase', to: [6.4, 0, -26.8], dur: 0 },
    { act: [['luka', 'look_up'], ['chase', 'look_up']] },
    TILT_UP,
    { wait: 2.6 },
    // CHASE (2040) (pointing at each)
    POINT_LOW,
    { par: [
      say('chase40', "Yours. ^ Also yours. ^ That one's from Christmas. ^ Mine.", { speed: 'normal' }),
      { do: (c) => pointMarks(c) },
    ] },
    { act: [['chase40', 'idle'], ['luka', 'idle']] },
    // [CLOSE · the plastic plant] It's in the backroom now, in a corner. Still dying.
    { face: 'chase', to: [9.3, 0, -29.55], dur: 0 }, { act: [['chase', 'idle']] },
    { face: 'chase40', to: [9.3, 0, -29.55], dur: 0 },
    PLANT,
    { wait: 1.3 },
    say('chase', 'Is that the same plant?'),
    { shot: 'CLOSE', on: 'chase40', fov: 38 },
    { wait: 0.3 },
    say('chase40', "Nobody's brave enough to throw it out."),
    // [MID · the machine] Four display Neural Chips in tethered cradles, a hover-scooter battery, a nest of cables,
    // the kettle wired into the middle of it.
    { place: 'chase', at: [5.25, 0, -25.75, -0.6] }, { place: 'chase40', at: [6.05, 0, -26.0, -0.9] }, { place: 'luka', at: [6.9, 0, -26.1, -1.2] },
    { do: (c) => { const d = P(c, 'des'); if (d) d.userData.screen('des'); } },
    MACHINE,
    { wait: 2.0 },
    CLOSE('chase', { yaw: 0.15, dist: 1.0, fov: 38, push: 0.08, dur: 5 }),
    say('chase', 'You built it out of displays.'),
    AWAY('chase40', 'chase', { dist: 1.05, fov: 38, push: 0.06, dur: 5 }),
    say('chase40', "Some things don't change."),
    // [WIDE] Chase (2040) flicks the light switch. Nothing visibly changes.
    // (both out of the lens's line to the switch: Chase on the left by the shelves, Luka on the right)
    { place: 'chase40', at: 's14_c40_switch' }, { place: 'chase', at: [5.0, 0, -26.7, 0.31] }, { place: 'luka', at: [7.6, 0, -25.4, -1.15] },
    SWITCH,
    { wait: 0.8 },
    { act: [['chase40', 'give', { dur: 0.9, loop: false }]] },
    { wait: 0.45 },
    { sfx: 'tick', vol: 0.6 },
    { wait: 1.4 },
    { face: 'chase40', to: [6.3, 0, -26.05], dur: 0.4 },
    { wait: 0.4 },
    say('chase40', 'Not much has changed. ^ All the bulbs are LED now.'),
    { face: 'luka', to: 'chase40', dur: 0 },
    glance('luka', 'chase', 0.9),
    CLOSE('luka', { yaw: 0.35, dist: 1.0, fov: 38, push: 0.06, dur: 5 }),
    { wait: 0.7 },
    say('luka', 'Everything was already LED.'),
    AWAY('chase40', 'luka', { dist: 1.0, fov: 36, push: 0.06, dur: 6 }),
    { wait: 0.3 },
    say('chase40', "…Yeah. ^ It's been a slow fourteen years."),
    // [CLOSE · the kettle] DES glows.
    { place: 'luka', at: 's14_luka_kettle' }, { place: 'chase40', at: [5.65, 0, -24.95, -1.9] }, { place: 'chase', at: [6.0, 0, -25.85, -0.6] },
    { do: (c) => { const d = P(c, 'des'); if (d) { d.userData.screen('des'); d.userData.glow(true); } } },
    KETTLE,
    { wait: 1.4 },
    CLOSE('luka', { yaw: -0.4, dist: 1.0, fov: 38, push: 0.06, dur: 5 }),
    say('luka', "Why's your kettle called Des?"),
    { face: 'chase40', to: 'luka', dur: 0 },
    { shot: 'OTS', on: 'chase40', over: 'luka', fov: 40 },
    { act: [['chase40', 'shrug', { dur: 1.4, loop: false }]] },
    say('chase40', 'Dunno. ^ Felt right.'),
    // (No one reacts.)
    { do: (c) => { const d = P(c, 'des'); if (d) d.userData.glow(false); } },
    // (Chase between and behind the two of them: from the machine, three faces in a row)
    { place: 'chase40', at: [5.85, 0, -25.3] }, { place: 'chase', at: [5.35, 0, -26.05] },
    { face: 'chase40', to: [4.25, 0, -24.4], dur: 0 }, { face: 'luka', to: [4.25, 0, -24.4], dur: 0 }, { face: 'chase', to: [4.25, 0, -24.4], dur: 0 },
    ALL_FOUR,
    { wait: 1.6 },
    { do: (c) => c.cam.release(0) },   // (control: a cut to the backroom's camera, not a glide past the machine)
  ];

  // Meeting Jordan (2040): Chase reaches the counter.
  const MEET_A = { shot: 'OTS', on: 'jordan40', over: 'chase', fov: 42 };                         // over Chase: Jordan out of his office
  const MEET_OTS_J = { shot: 'OTS', on: 'jordan40', over: 'chase', fov: 40 };                       // across the counter to Jordan
  const CHASES = cam([6.85, 1.72, -10.75], [6.6, 1.55, -7.7], 44, [[6.82, 1.7, -10.55]], 6);          // from Jordan: the two Chases
  const BETWEEN = cam([6.9, 1.7, -10.3], [5.35, 1.5, -7.25], 46, [[6.8, 1.68, -10.1]], 5);           // Chase (2040) steps into it
  const ASIDE_J = { shot: 'OTS', on: 'jordan40', over: 'chase40', fov: 40 };                       // Jordan and him, quietly, by the office door
  const ASIDE_C = { shot: 'OTS', on: 'chase40', over: 'jordan40', fov: 40 };
  const SHOWCASE = cam([4.95, 1.34, -9.75], [4.95, 1.47, -7.9], 44, [[4.95, 1.36, -9.55]], 8);        // the boys at the showcase, from the staff side
  CUTSCENES['1.4_jordan'] = [
    // under the cut: the three at the counter; Jordan comes out of the office
    { place: 'chase', at: 's14_meet_chase' }, { place: 'luka', at: 's14_meet_luka' }, { place: 'chase40', at: [7.75, 0, -7.6, -2.5] },
    { spawn: 'jordan40', at: 'office_door_in' },
    { prop: 'jordan_office_door', fn: (o) => { o.userData.open = true; } },
    MEET_A,
    { move: 'jordan40', to: 'office_door', nowait: true },
    { wait: 0.9 },
    { do: (c) => { stroll(c, 'jordan40', [[7.6, 0, -10.15], [6.4, 0, -10.0]], { face: 0 }); } },
    say('jordan40', "Chase! You're forty minutes late— ^ who's this?"),
    { place: 'jordan40', at: 's14_jordan' }, { face: 'jordan40', to: 'chase', dur: 0 },
    { face: 'chase40', to: 'jordan40', dur: 0 },
    AWAY('chase40', 'chase', { dist: 1.0, fov: 36, push: 0.06, dur: 5 }),
    { wait: 0.3 },
    say('chase40', '…My nephew.'),
    MEET_OTS_J,
    say('jordan40', 'He looks exactly like you.'),
    CHASES,
    say('chase40', 'Genes.'),
    // (Jordan looks past them at Luka, and goes pale.)
    { face: 'jordan40', to: 'luka', dur: 0 },
    { expr: [['jordan40', 'stunned']] },
    CLOSE('jordan40', { yaw: 0.25, dist: 1.0, fov: 34, push: 0.15, dur: 5 }),
    { wait: 1.3 },
    { expr: [['jordan40', 'scared']] },
    say('jordan40', 'And that\'s—'),
    // CHASE (2040) (stepping between them)
    BETWEEN,
    { move: 'chase40', to: 's14_c40_between', nowait: true },
    { wait: 0.7 },
    say('chase40', 'His mate.'),
    { place: 'chase40', at: 's14_c40_between' },
    CLOSE('jordan40', { yaw: 0.35, dist: 1.0, fov: 36, push: 0.06, dur: 5 }),
    say('jordan40', 'He looks like—'),
    AWAY('chase40', 'luka', { dist: 0.95, fov: 36, push: 0.06, dur: 5 }),
    say('chase40', 'Lots of people do.'),
    // (Jordan takes Chase (2040) aside. Quietly, while Luka and Chase pretend to look at chips:)
    { expr: [['jordan40', 'worried']] },
    { place: 'jordan40', at: 's14_aside_jordan' }, { place: 'chase40', at: 's14_aside_c40' },
    { place: 'chase', at: 's14_chips_chase' }, { place: 'luka', at: 's14_chips_luka' },
    { act: [['chase', 'look_down'], ['luka', 'look_down']] },
    { face: 'jordan40', to: 'chase40', dur: 0 }, { face: 'chase40', to: 'jordan40', dur: 0 },
    SHOWCASE,
    { wait: 1.4 },
    ASIDE_J,
    { wait: 0.4 },
    say('jordan40', "Are you all right? It's nearly the—", { tag: 'quietly' }),
    ASIDE_C,
    say('chase40', 'I know.', { tag: 'quietly' }),
    ASIDE_J,
    say('jordan40', 'You can take Monday.', { tag: 'quietly' }),
    { expr: [['chase40', 'tired']] },
    ASIDE_C,
    say('chase40', "I'm fine.", { tag: 'quietly' }),
    SHOWCASE,
    { wait: 0.4 },
    { act: [['chase', 'glance', { yaw: -1.1, dur: 1.5 }]] },
    { wait: 0.8 },
    say('chase', "Where's his Luka?", { tag: 'to Luka, low' }),
    say('luka', 'He said not around.', { tag: 'low' }),
    { act: [['chase', 'idle']] }, { face: 'chase', to: 'luka', dur: 0.3 },
    say('chase', 'Not around WHERE?'),
    { wait: 0.5 },
    { fade: 'out', dur: 0.9 },
  ];

  // =================================================================== 1.5 — "Cred"
  // Behind the counter (staff side z -10, facing +Z the customers): Chase (2040) at the terminal (6.4), Chase beside
  // him, Luka at the left terminal (4.3). Jayden at the counter (6.4, -7.85). Jordan's office door (9.4, -12.62).
  const L15 = [4.75, 0, -10.3, 0.35];
  const SET15 = cam([5.55, 1.58, -6.85], [5.6, 1.45, -10.1], 46, [[5.55, 1.58, -7.25]], 9);          // across the counter: the three of them
  const JORDAN_PASS = cam([5.2, 1.6, -5.6], [9.7, 1.3, -11.6], 50, [null, [9.2, 1.3, -6.6]], 5, { ease: 'out' });
  const DOORS15 = cam([-4.0, 1.3, -3.2], [-2.0, 1.25, 0.0], 46, [[-3.9, 1.3, -3.3], [-0.9, 1.25, -2.3]], 4.2, { ease: 'in' });   // he stomps in through the doors
  const DAZZA = cam([5.15, 1.5, -8.75], [5.2, 1.52, -10.25], 44, [[5.15, 1.5, -8.95]], 6);            // Luka and Chase, leaning in
  const POV15 = cam([6.4, 1.66, -9.8], [6.4, 1.25, -8.4], 50, [[6.4, 1.64, -9.65], [6.4, 1.3, -8.2], 46], 6);   // his eyes: the terminal, Jayden beyond
  // "Mate. Move.": across the counter from the customer side, both faces (Luka at the left edge)
  const MOVE_TWO = cam([5.3, 1.66, -8.45], [6.05, 1.5, -10.1], 42, [[5.35, 1.65, -8.6]], 5);
  const SWAT = cam([6.95, 1.58, -6.9], [6.4, 1.55, -10.0], 40, [[6.92, 1.58, -7.15]], 5);               // Jayden's side of the counter
  const POPS15 = [
    ['Are you sure?', [0.36, 0.38]], ['Upgrade to Cloud+?', [0.64, 0.3]], ['Never forget anything again!', [0.42, 0.56]],
    ["Verify identity of customer's brain", [0.66, 0.5]], ["Are you sure you're sure?", [0.5, 0.42]],
  ];
  function dress15(c) {
    if (c.world.setId !== 'reddy40') return;
    dress('store40');
    const od = P(c, 'jordan_office_door'); if (od) od.userData.open = true;
  }
  SCENES['1.5'] = {
    title: 'Cred', set: 'reddy40', env: 'day', time: '12:20', place: 'Optus Redcliffe',
    playable: ['chase', 'chase40'], swap: false, music: 'store40', hud: null,
    spawn: { chase40: 's15_c40_terminal', chase: 's15_chase_side', luka: L15, jordan40: 's15_jordan_pass_a', jayden: [-2.0, 0, 1.9, PI] },
    steps: [
      ['cutscene', '1.5_setup'],
      ['control', 'chase'],
      ['minigame', 'chip_sale', { time: '12:20' }],
      ['cutscene', '1.5_after'],
    ],
    grants: { flags: { s15_sold: true, s15_consent: true, s15_chipview: true } },
  };
  CUTSCENES['1.5_setup'] = [
    { do: (c) => nextTick().then(() => dress15(c)) },
    { place: 'chase40', at: 's15_c40_terminal' }, { place: 'chase', at: 's15_chase_side' }, { place: 'luka', at: L15 },
    SET15,
    { wait: 0.6 },
    { face: 'chase40', to: 'chase', dur: 0.4 },
    say('chase40', "We need to get to the Valley by Monday. There's a lockdown on the bridge, so we need disguises, train fare, food. ^ We need cred. ^ Cred is short for credit."),
    // (Luka looks from one Chase to the other.)
    { face: 'luka', to: [5.9, 0, -10.0], dur: 0 },
    { shot: 'CLOSE', on: 'luka', fov: 40 },
    { act: [['luka', 'glance', { yaw: -0.45, dur: 1.0 }]] }, { wait: 1.0 },
    { act: [['luka', 'glance', { yaw: 0.3, dur: 1.0 }]] }, { wait: 1.1 },
    say('luka', "There's two of them now."),
    // JORDAN (passing)
    JORDAN_PASS,
    { do: (c) => { stroll(c, 'jordan40', [[9.5, 0, -10.6], GAP_R, 's15_jordan_pass_b']); } },
    { wait: 0.8 },
    say('jordan40', "Chase, you're on the floor till one. ^ Customer.", { tag: 'passing' }),
    { act: [['jordan40', 'point', { dur: 1.2, loop: false }]] },
    // A tradie in hi-vis stomps in: JAYDEN.
    { place: 'jordan40', at: 's15_jordan_pass_b' },
    DOORS15,
    { do: (c) => { stroll(c, 'jayden', [[-2.0, 0, -1.2], [3.2, 0, -6.6], 's15_jayden_counter'], { face: PI }); } },
    { do: (c) => { if (sk(c)) return; for (let i = 0; i < 7; i++) later(c, 0.35 + i * 0.55, () => c.sfx('footstep', { vol: 0.55, rate: 0.8 })); } },
    { wait: 4.0 },
    { place: 'jayden', at: 's15_jayden_counter' }, { face: 'chase40', to: 'jayden', dur: 0 },
    { place: 'jordan40', at: [9.6, 0, -4.6, -2.2] },
    { do: (c) => { if (!sk(c)) c.cam.shot({ shot: 'OTS', on: 'jayden', over: 'chase40', fov: 40, dist: 1.0 }); } },
    say('jayden', 'Need a chip swap. Got a slab to pour at one.'),
    // LUKA (to Chase, very quietly)
    { face: 'luka', to: 'chase', dur: 0 }, { face: 'chase', to: 'jayden', dur: 0 },
    DAZZA,
    { wait: 0.3 },
    say('luka', "…It's Dazza.", { tag: 'very quietly' }),
    { face: 'chase', to: 'luka', dur: 0.3 },
    say('chase', "It's not Dazza.", { tag: 'quietly' }),
    { face: 'chase', to: 'jayden', dur: 0 },
    { do: (c) => { if (!sk(c)) c.cam.shot({ shot: 'OTS', on: 'jayden', over: 'chase', fov: 40, dist: 1.0 }); } },
    say('jayden', 'Dad says yous can never do a swap without him ending up at the servo.'),
    CLOSE('chase', { yaw: 0.3, dist: 0.95, fov: 36, push: 0.08, dur: 5 }),
    { wait: 0.4 },
    say('chase', "…It's Dazza's son."),
    // Chase (2040) steps up to the terminal. [POV · Chase (2040)'s chip view] JARVIS-style pop-ups in his eyes.
    { place: 'chase40', at: 's15_c40_terminal' },
    POV15,
    { do: (c) => { if (!sk(c)) chip.show(true); } },
    { sfx: 'chip_on', vol: 0.5 },
    { wait: 0.6 },
    ...POPS15.flatMap(([msg, at], i) => [
      { popup: { style: 'safesense', title: 'SafeSense', msg, buttons: [], icon: 'none', at, w: 250, dur: 4.2 - i * 0.6, ding: false } },
      { sfx: 'ss_chirp', vol: 0.45, rate: 1 + i * 0.06 },
      { wait: 0.55 - i * 0.05 },
    ]),
    { wait: 0.7 },
    // He swats at them.
    { do: (c) => { chip.show(false); } },
    { popup: null, clear: true },
    SWAT,
    { act: [['chase40', 'swat']] },
    { do: (c) => { if (!sk(c)) for (let i = 0; i < 3; i++) later(c, 0.4 + i * 0.45, () => c.sfx('ss_chirp', { vol: 0.25, rate: 1.4 })); } },
    { wait: 1.8 },
    // He freezes.
    { act: [['chase40', 'still']] }, { expr: [['chase40', 'scared']] },
    { wait: 0.9 },
    // [TOP-DOWN · Chase (2040)] His hands start to rise toward his head.
    { shot: 'TOP', on: 'chase40', dist: 1.12, fov: 44 },
    { act: [['chase40', 'hands_rise', { dur: 2.4 }]] },
    { wait: 2.2 },
    { face: 'chase', to: 'chase40', dur: 0 },
    CLOSE('chase', { yaw: -0.4, dist: 1.0, fov: 36, push: 0.06, dur: 4 }),
    say('chase', '…Move.'),
    { act: [['chase40', 'hands_head']] },
    AWAY('chase40', 'chase', { dist: 0.95, fov: 36, push: 0.08, dur: 6 }),
    say('chase40', 'It has to be— ^ the form has to be right first time, or—'),
    MOVE_TWO,
    { expr: [['chase', 'determined']] },
    say('chase', 'Mate. Move.'),
    // Chase takes the terminal; Chase (2040) steps aside
    { act: [['chase40', 'idle']] }, { expr: [['chase40', 'tired'], ['chase', 'neutral']] },
    { move: 'chase40', to: 's15_c40_aside', nowait: true },
    { wait: 0.3 },
    { move: 'chase', to: 's15_chase_terminal' },
    { place: 'chase40', at: 's15_c40_aside' }, { place: 'chase', at: 's15_chase_terminal' },
    { face: 'chase', to: 'jayden', dur: 0 },
    { place: 'jordan40', at: 's15_jordan_watch' },   // he drifts back to his door to watch (out of the terminal shot)
  ];
  // the little glowing card: in Jordan's hand a content mesh (jordan40's look has no card attachment); in Chase (2040)'s,
  // his own hand-held card (rig.attach.card, painted the same, shown by hold_card)
  const BONUS = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.006, 0.058), new THREE.MeshBasicMaterial({ color: 0x8ee9ff }));
  BONUS.name = 's15_bonus_card';
  const BONUS_GLOW = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.12), new THREE.MeshBasicMaterial({ color: 0x5fd0ff, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending }));
  BONUS_GLOW.rotation.x = -H; BONUS_GLOW.position.y = 0.004; BONUS.add(BONUS_GLOW);
  function bonusTo(c, id) {
    BONUS.removeFromParent(); BONUS.visible = false;
    const a = act(c, id);
    if (!a) return;
    if (a.rig.attach.card && a.rig.attach.card.userData.paint) { a.rig.attach.card.userData.paint(paintBonus); return; }
    const g = a.rig.attach.gripR || a.rig.parts.handR;
    if (!g) return;
    g.add(BONUS); BONUS.position.set(0, -0.01, 0.03); BONUS.rotation.set(0.25, 0, 0); BONUS.visible = true;
    if (!S15.card) S15.card = scope('1.5', () => {}, () => { BONUS.removeFromParent(); S15.card = null; });
  }
  // the card's face: a pale chip-blue glow, a bright rim, a chip glyph and CRED (128 × 80)
  function paintBonus(cx, w, h) {
    const g = cx.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#d8fbff'); g.addColorStop(0.55, '#8ee9ff'); g.addColorStop(1, '#5fd0ff');
    cx.fillStyle = g; cx.fillRect(0, 0, w, h);
    cx.strokeStyle = '#ffffff'; cx.lineWidth = 4; cx.strokeRect(3, 3, w - 6, h - 6);
    cx.fillStyle = '#ffffff'; cx.fillRect(14, 22, 22, 18); cx.fillStyle = '#5fd0ff'; cx.fillRect(18, 26, 14, 10);
    cx.fillStyle = '#0d3550'; cx.font = 'bold 20px Arial, sans-serif'; cx.textAlign = 'right'; cx.textBaseline = 'middle'; cx.fillText('CRED', w - 12, 32);
    cx.fillStyle = 'rgba(13,53,80,.55)'; cx.fillRect(14, 54, w - 28, 4); cx.fillRect(14, 62, (w - 28) * 0.6, 4);
  }
  const S15 = { card: null };
  const JORDAN_DOOR = cam([8.0, 1.62, -9.85], [9.85, 1.55, -12.3], 36, [[8.1, 1.62, -10.0]], 6);
  // across the counter from behind Chase's left shoulder: Jayden's face clear of his head (Luka and Chase (2040) out of
  // frame either side)
  const JAYDEN_DONE = cam([5.75, 1.72, -10.9], [6.4, 1.58, -7.85], 40, [[5.8, 1.71, -10.75]], 7);
  // Jordan hands it over: both in profile, from past the counter's end
  const BONUS_TWO = cam([8.85, 1.62, -9.0], [7.75, 1.5, -10.65], 42, [[8.75, 1.61, -9.15], null, 40], 6);
  // the card in his hand, as he sees it: over his left shoulder, down onto the card (the face he's reading)
  const V2 = new THREE.Vector3();
  const CARD_HAND = { do: (c) => {
    if (sk(c)) return;
    const a = act(c, 'chase40'), k = a && a.rig.attach.card; if (!k) return;
    a.root.updateMatrixWorld(true); k.getWorldPosition(V1); a.eyePos(V2);
    const fx = Math.sin(a.rotY), fz = Math.cos(a.rotY), lx = Math.cos(a.rotY), lz = -Math.sin(a.rotY);   // (his left: +cos, −sin)
    const px = V2.x + lx * 0.2 - fx * 0.1, py = V2.y + 0.06, pz = V2.z + lz * 0.2 - fz * 0.1;
    c.cam.shot({ shot: 'CAM', pos: [px, py, pz], look: [V1.x, V1.y, V1.z], fov: 36, to: { pos: [px + (V1.x - px) * 0.15, py + (V1.y - py) * 0.15, pz + (V1.z - pz) * 0.15], look: [V1.x, V1.y, V1.z], fov: 34 }, dur: 4, ease: 'linear' });
  } };
  CUTSCENES['1.5_after'] = [
    { place: 'chase', at: 's15_chase_terminal' }, { place: 'chase40', at: 's15_c40_aside' }, { place: 'jayden', at: 's15_jayden_counter' },
    { place: 'jordan40', at: 's15_jordan_watch' }, { place: 'luka', at: L15 },
    { act: [['jordan40', 'arms_crossed']] },
    JAYDEN_DONE,
    { expr: [['jayden', 'stunned']] },
    say('jayden', 'Done? ^ Already?'),
    { wait: 0.8 },
    { expr: [['jayden', 'happy']] },
    say('jayden', "Dad's going to be filthy."),
    // (He leaves happy.)
    { do: (c) => { stroll(c, 'jayden', [[3.2, 0, -6.6], [-2.0, 0, -1.2], [-2.0, 0, 4.5]], { face: 0 }); } },
    { wait: 1.2 },
    // JORDAN (who's been watching from the office door)
    { face: 'jordan40', to: 'chase', dur: 0 },
    JORDAN_DOOR,
    { wait: 0.4 },
    say('jordan40', "He's good."),
    { face: 'chase40', to: 'chase', dur: 0 },
    AWAY('chase40', 'chase', { dist: 0.95, fov: 36, push: 0.06, dur: 6 }),
    { wait: 0.3 },
    say('chase40', "…He's very good.", { tag: 'quietly' }),
    // JORDAN (handing Chase (2040) a little glowing card)
    { despawn: 'jayden' },
    { act: [['jordan40', 'idle']] },
    { do: (c) => bonusTo(c, 'jordan40') },
    { place: 'jordan40', at: [8.2, 0, -10.95, -0.9] }, { face: 'chase40', to: 'jordan40', dur: 0 },
    BONUS_TWO,
    { act: [['jordan40', 'give', { dur: 1.4, loop: false }]] },
    { wait: 0.5 },
    say('jordan40', "Christmas bonus. Early. Don't spend it on cables."),
    { do: (c) => bonusTo(c, 'chase40') },
    { do: (c) => { stroll(c, 'jordan40', [[9.6, 0, -11.7], [9.9, 0, -13.4]]); } },
    // (Chase (2040) looks at the card, then at his younger self.)
    { act: [['chase40', 'hold_card']] },
    { wait: 0.5 },
    CARD_HAND,
    { wait: 1.8 },
    { act: [['chase40', 'idle']] },
    { face: 'chase40', to: 'chase', dur: 0 }, { expr: [['chase40', 'still']] },
    { place: 'jordan40', at: [9.9, 0, -13.5, PI] },
    { shot: 'OTS', on: 'chase40', over: 'chase', fov: 36 },
    { wait: 2.3 },
    // LUKA (gently, to Chase (2040))
    { place: 'luka', at: [5.6, 0, -10.55, 1.2] }, { face: 'luka', to: 'chase40', dur: 0 },
    CLOSE('luka', { yaw: 0.45, dist: 0.95, fov: 36, push: 0.06, dur: 6 }),
    { wait: 0.3 },
    slow('luka', 'You all right?', { tag: 'gently' }),
    { face: 'chase40', to: 'luka', dur: 0 }, { expr: [['chase40', 'tired']] },
    { shot: 'CLOSE', on: 'chase40', fov: 36 },
    { wait: 0.4 },
    slow('chase40', 'Yeah. ^ I used to be quick.'),
    { wait: 1.2 },
    { fade: 'out', dur: 1.0 },
  ];

  // =================================================================== 1.6 — "Safety Address"
  const ADDR = [
    "Good afternoon, Australia. ^ I know it's been a hard year. It's always a hard year.",
    'Every day, I watch you hurt each other. Down every line. In every message. In every call you wait for that never comes.',
    "So this Christmas, I'm giving you something you haven't had in a very long time.",
    'Quiet.',
    'On Monday at 11:58, every Neural Chip in the country will receive one final update. No more calls. No more messages. No more waiting.',
    'Nobody will be able to hurt you again.',
    "You don't need to do anything. It's already done.",
    'Merry Christmas. Stay safe.',
  ];
  const FLOOR_WIDE = fromA('s16_floor_wide', { push: 0.6, dur: 9 });
  const SCREEN_MID = cam([-2.0, 1.74, -10.6], [-2.0, 1.86, -14.36], 30, [[-2.0, 1.76, -11.6]], 9);
  const SCREEN_ECU = cam([-2.0, 1.86, -12.5], [-2.0, 1.95, -14.36], 24, [[-2.0, 1.88, -12.95]], 5);
  const LOCALS_UP = cam([-2.75, 1.32, -11.3], [-3.4, 1.62, -9.4], 44, [[-2.85, 1.3, -11.05]], 7);    // a face lit by the screen, looking up
  const TRIO_REV = cam([-0.55, 1.62, -11.6], [2.2, 1.58, -6.6], 40, [[-0.4, 1.62, -11.2]], 8);       // the three of them, from the screen
  const BEHIND = cam([3.9, 1.72, -3.9], [-1.9, 1.62, -13.6], 46, [[3.75, 1.72, -4.2]], 8);           // the crowd, small, the screen huge
  // [PAN · across the store]: from the customer by the accessory wall, clapping, across the floor to Jordan and the
  // boys; then the old man by Margaret's chair (crying quietly, smiling); then Jordan, who doesn't clap
  const PAN16 = cam([-8.1, 1.5, -5.5], [-6.3, 1.4, -6.45], 46, [null, [1.8, 1.5, -6.8]], 4.2, { ease: 'in' });
  // the old man in the chair by Margaret's (one of the set's locals, facing −Z): a low close read off his head at the cut
  const OLD_MAN_CAM = cam([2.6, 1.15, -2.15], [2.65, 1.32, -0.9], 38, [[2.61, 1.16, -2.05]], 4);
  const OLD_MAN = { do: (c) => {
    if (sk(c)) return;
    const loc = P(c, 'locals'), r = loc && loc.userData.rigs && loc.userData.rigs.local40_c, h = r && r.parts && r.parts.head;
    if (!h) { c.cam.shot(OLD_MAN_CAM); return; }
    h.updateWorldMatrix(true, false); h.getWorldPosition(V1); V1.y += 0.1;
    c.cam.shot({ shot: 'CAM', pos: [V1.x - 0.06, V1.y - 0.1, V1.z - 1.2], look: [V1.x, V1.y - 0.02, V1.z], fov: 36, to: { pos: [V1.x - 0.06, V1.y - 0.09, V1.z - 1.08] }, dur: 4, ease: 'linear' });
  } };
  // where they stand for the address (in the open floor between the display tables and the counter's west end): the
  // set's marks s16_addr_luka / _chase / _c40 / _jordan, and s16_jordan_close for "Back door."
  const A16 = { luka: 's16_addr_luka', chase: 's16_addr_chase', chase40: 's16_addr_c40', jordan40: 's16_addr_jordan', close: 's16_jordan_close' };
  const DOORS16 = fromA('doors_lock', { push: 0.3, dur: 8 });
  // [TWO-SHOT · Luka and Chase, the only faces without chip lights]: both in profile, from the display-table side
  // (Chase (2040) beyond them, between)
  const TWO16 = cam([1.2, 1.62, -4.9], [1.93, 1.5, -6.38], 44, [[1.26, 1.61, -5.02], null, 42], 12);
  const DRONES_IN = cam([2.9, 2.3, -8.4], [-2.0, 1.6, -2.6], 44, [[2.75, 2.28, -8.2]], 6);            // over their heads: the three drones hovering, scanning
  const SIDE_BY = cam([3.6, 1.6, -5.65], [3.1, 1.55, -7.15], 40, [[3.58, 1.6, -5.75]], 7);             // Jordan beside him, not looking at him: both three-quarter on
  const POSTS = { drone_a: [3.6, -10.45], drone_b: [10.2, -11.75], drone_c: [6.4, -15.2] };
  const IN_AT = { drone_a: 'd_in_a', drone_b: 'd_in_b', drone_c: 'd_in_c' };
  const ALCOVE = [1.75, 0, -13.0];
  const S16_BACKOFF = [2.9, 0, -7.15, -2.4];   // the west end of the counter: clear of the lured drones' cones
  const S16_STEPBACK = [7.8, 0, -7.15];          // straight back from the speaker first (a bar stool beside it)
  // (the drone floats to the sound): high at the alcove's end of the staff aisle, the corridor mouth on the right, the
  // speaker across the counter (Chase backs off out of frame, the two waiting behind the lens)
  const LURE_SEE = cam([2.9, 2.45, -11.9], [7.0, 1.1, -10.4], 52, [[3.1, 2.4, -11.85], [7.2, 1.2, -9.9]], 3.4);
  const POST_C2 = [9.8, -10.95];
  const CP16 = [
    { id: 'floor', box: [-9, -9.45, 11, 0], at: { luka: 's16_cp_floor', chase: [2.3, 0, -8.15, -2.8], chase40: [1.0, 0, -8.0, -2.8] } },
    { id: 'alcove', box: [-9, -14.5, 2.6, -9.45], at: { luka: [1.95, 0, -13.1, H], chase: [1.45, 0, -12.5, H], chase40: [1.5, 0, -13.75, H] } },
    { id: 'backroom', box: [2.4, -30, 10.4, -23.75], at: { luka: 's16_cp_backroom', chase: [7.2, 0, -25.6, PI], chase40: [5.7, 0, -25.6, PI] } },
    { id: 'yard', box: [-6, -46, 20, -30.25], at: { luka: 's16_cp_yard', chase: [8.6, 0, -31.7, PI], chase40: [6.9, 0, -31.7, PI] } },
  ];
  const ZONE1 = [2.75, -12.5, 11, -9.45];
  const inBox = (b, x, z) => x >= b[0] && x <= b[2] && z >= b[1] && z <= b[3];
  const S16 = { upd: null, lure: null, pulse: null, shown: false, zapped: false, rules: null, backed: false };
  // &s16fail=1 (autoplay only): the fail paths too: one capture in the staff aisle (the Safe Room, retry at the alcove)
  // and NO at the chip prompt (SafeSense's soft fail, retry, the prompt again, then YES)
  const FAIL16 = TEST.auto && /[?&]s16fail=1/.test(location.search);

  // chip lights pulse with the screens (Chase (2040)'s and Jordan's; the locals pulse themselves)
  function pulseChips(c, on) {
    if (!on || sk(c)) {
      if (S16.pulse) { removeUpdate(S16.pulse); S16.pulse = null; }
      for (const id of ['chase40', 'jordan40']) { const a = act(c, id); if (a) a.rig.chip(id === 'chase40' && c.state.flags.chip_off ? 'off' : 'on'); }
      return;
    }
    if (S16.pulse) return;
    let t = 0, st = '';
    S16.pulse = scope('1.6', (dt) => {
      t += dt;
      const s = Math.sin(t * Math.PI) > 0 ? 'ping' : 'on';
      if (s === st) return;
      st = s;
      const a = world.actor('chase40'), j = world.actor('jordan40');
      if (a) a.rig.chip(s); if (j) j.rig.chip(s);
    }, () => { S16.pulse = null; });
  }
  // hint 1: before speaking, the silhouette glances to his left (the big screen's head layer), then forward
  function glanceLeft(c) {
    const s = P(c, 'big_screen');
    if (!s || sk(c)) { if (s) s.userData.glance(0); return; }
    let t = 0;
    const sid = c.flow.sceneId;
    const f = (dt) => {
      t += dt;
      const k = t < 0.55 ? t / 0.55 : t < 1.25 ? 1 : t < 1.8 ? 1 - (t - 1.25) / 0.55 : 0;
      s.userData.glance(k * k * (3 - 2 * k));
      if (t >= 1.8 || flow.sceneId !== sid || flow.skipping) { s.userData.glance(0); removeUpdate(f); }
    };
    addUpdate(f);
  }
  function dress16(c) {
    if (c.world.setId !== 'reddy40') return;
    dress('store40');
    const loc = P(c, 'locals');
    if (loc) { loc.userData.idle(); const r = loc.userData.rigs.local40_c; if (r) r.face.set('still'); }
    const sp = P(c, 'counter_speaker'); if (sp) sp.userData.playing = false;
    const rd = P(c, 'roller_door'); if (rd) rd.userData.set(0.45);
    const tw = P(c, 'drone_tower'); if (tw) tw.userData.alert(false);
    const od = P(c, 'jordan_office_door'); if (od) od.userData.open = false;
    listenSamples();
    S16.lure = null; S16.zapped = false;
  }
  // the lockdown: the store at safe brightness, the stealth zones, the locals frozen, the drones at their posts
  function lockdown16(c) {
    dress('lockdown');
    const loc = P(c, 'locals'); if (loc) { const r = loc.userData.rigs.local40_c; if (r) r.face.set('still'); }
    pulseChips(c, false);
    AR.clear();
    const S = SET();
    for (const a of (S && S.ar) || []) AR.add(a);
    for (const a of (S && S.ar16) || []) if (a.kind !== 'path') AR.add(a);   // (the drones show their own routes)
    // the three that came in take the staff aisle and the corridor; two more were already out the back
    for (const id of ['drone_a', 'drone_b', 'drone_c', 'drone_d', 'drone_e']) DRONES.spawn(id, Object.assign({}, S.drones[id]));
    chip.hot = [{ box: [-6, -46, 20, -30.25], mul: 2.5 }];
  }
  function stealth16(c) {
    stealth.begin({
      escortAfter: 1.5, forgetAfter: 1.8,
      checkpoints: CP16,
      onRetry: (key) => {
        const sp = P(c, 'counter_speaker'); if (sp) sp.userData.playing = false;
        const tw = P(c, 'drone_tower'); if (tw) tw.userData.alert(false);
        S16.lure = null;
        if (key === 'alcove' && c.state.flags.s16_zap && !c.state.flags.s16_lured) holdAlcove(c);
        else { player.wait('luka', false); player.wait('chase40', false); player.wait('chase', false); }
      },
    });
  }
  // after the zap: Chase sets the lure; the others wait in the alcove
  function holdAlcove(c) {
    swapTo(c, 'chase');
    const l = act(c, 'luka'), c4 = act(c, 'chase40');
    if (l) l.place([1.95, 0, -13.1, H]); if (c4) c4.place([1.5, 0, -13.75, H]);
    player.wait('luka', true); player.wait('chase40', true);
  }
  // the scene's watcher: the zap (first time anyone leads into the staff aisle), the waiting party rejoining Chase,
  // the chip prompt (Chase (2040) out in the car park with his chip on)
  function watch16(c) {
    if (S16.upd) return;
    S16.upd = scope('1.6', () => {
      if (flow.skipping || flow.busy || flow.cutscene || stealth.busy || !(flow.roaming || TEST.auto)) return;
      const F = state.flags, me = player.actor;
      if (!me) return;
      if (!F.s16_zap && inBox(ZONE1, me.pos.x, me.pos.z)) { F.s16_zap = true; hotspots.trigger('h16_zap'); return; }
      if (player.waiting('luka') || player.waiting('chase40')) {
        const back = state.active === 'chase' && F.s16_lured && Math.hypot(me.pos.x - ALCOVE[0], me.pos.z - ALCOVE[2]) < 2.6;
        if (back || state.active !== 'chase') { player.wait('luka', false); player.wait('chase40', false); }
      }
      const c4 = world.actor('chase40');
      if (c4 && c4.pos.z < -30.5 && !F.chip_off && !F.s16_chip_now) { F.s16_chip_now = true; hotspots.trigger('h16_chip'); }
    }, () => { S16.upd = null; });
  }
  // the lure: Chase plays a sample through the store's old counter speaker (it amplifies: every drone on the floor,
  // the staff aisle and the corridor hears it, and it plays for long enough to get three people into the corridor)
  async function playSpeaker(c) {
    await c.runSteps([{ move: 'chase', to: 's16_speaker' }, { face: 'chase', to: PI, dur: 0.2 }]);
    const have = c.state.samples.filter((k) => SAMPLES[k] && k !== 'laugh');
    const list = have.length ? have.slice() : [];
    if (!list.includes('alarm') && !list.includes('kettle')) list.push('radio');   // the store radio: always there
    const labels = list.map((k) => SAMPLES[k].label).concat(['Cancel']);
    if (!sk(c)) c.cam.shot(fromA('speaker', { push: 0.1, dur: 6 }));
    const i = await c.choose(labels, { test: Math.max(0, list.indexOf('alarm')) });
    if (!(i >= 0 && i < list.length)) { await c.cam.release(0.3); return; }
    const k = list[i], sp = P(c, 'counter_speaker');
    if (sp) sp.userData.playing = true;
    S16.backed = false;
    // the old speaker is loud: every drone behind the counter and the one in the corridor hears it, long enough for
    // Chase to get back to the others and all three to slip down the corridor
    const dur = Math.max(16, ((SAMPLES[k].lure && SAMPLES[k].lure.dur) || 4) * 3);
    const L = DRONES.lure([7.55, 1.1, -8.78], k, { r: 8.5, dur });
    S16.lure = L;
    c.state.flags.s16_lured = true;
    testLog('1.6 lure ' + k + ' ' + L.n);
    // after its first lure the corridor drone takes the end of the staff aisle (nobody gets trapped in the corridor)
    const d = DRONES.get('drone_c');
    if (d && L.ids.includes('drone_c')) { d.lx = POST_C2[0]; d.lz = POST_C2[1]; d.hx = POST_C2[0]; d.hz = POST_C2[1]; d.hyaw = -H; }
    const sid = c.flow.sceneId;
    Promise.resolve(L.done).then(() => { if (c.flow.sceneId === sid && S16.lure === L) { S16.lure = null; const s = P(c, 'counter_speaker'); if (s) s.userData.playing = false; } });
    // (the drone floats to the sound): across the counter into the staff aisle and up the corridor, while Chase backs
    // off to the end of the counter, out of their way (no words; the player's hands back as soon as it's seen)
    await c.playCutscene([
      LURE_SEE,
      { do: (cc) => { const a = act(cc, 'chase'); if (a && !sk(cc)) a.moveTo(S16_STEPBACK, { collide: true }).then(() => { if (cc.flow.sceneId === '1.6' && !S16.backed) a.moveTo(S16_BACKOFF, { run: true, collide: true }); }); } },
      { wait: 3.2 },
      { do: () => { S16.backed = true; } },
      { place: 'chase', at: S16_BACKOFF },
    ], { letterbox: false });
    await c.cam.release(0.3);
  }
  // the first strain: from behind his right shoulder (the door, Luka, Chase (2040) behind him); Chase (2040) steps up
  // (three-quarter on, Chase behind him); Luka in profile against the door
  const STRAIN_A = cam([9.2, 1.7, -28.0], [7.6, 1.15, -29.8], 48, [[9.1, 1.69, -28.1]], 4);
  const STRAIN_B = cam([9.15, 1.6, -28.35], [7.25, 1.45, -29.1], 42, [[9.08, 1.6, -28.4]], 4);
  const STRAIN_L = cam([6.75, 1.5, -29.75], [7.75, 1.5, -29.62], 40, [[6.82, 1.5, -29.74]], 4);
  // the roller door: only Luka can lift it, and it only stays up while he holds it
  async function rollerDoor(c) {
    const door = P(c, 'roller_door');
    await c.runSteps([{ move: 'luka', to: 's16_roller_luka' }, { face: 'luka', to: PI, dur: 0.2 }]);
    // the others close behind him (they're following)
    const ch = act(c, 'chase'), c4 = act(c, 'chase40');
    if (!c.state.flags.s16_strained) {
      c.state.flags.s16_strained = true;
      await c.playCutscene([
        { place: 'chase40', at: [6.95, 0, -28.7, 2.6] }, { place: 'chase', at: [6.45, 0, -28.15, 2.5] },
        STRAIN_A,
        { act: [['luka', 'lift_strain']] },
        { do: (cc) => { if (door) { door.userData.set(0.75); later(cc, 0.9, () => door.userData.set(0.6)); } } },
        { sfx: 'roller_door', vol: 0.35 },
        { wait: 0.9 },
        { expr: [['luka', 'hurt']] },
        { move: 'chase40', to: [7.15, 0, -29.0], nowait: true },
        STRAIN_B,
        { wait: 0.3 },
        say('chase40', 'Let me—'),
        STRAIN_L,
        { expr: [['luka', 'determined']] },
        say('luka', "I've got it.", { tag: 'strained' }),
        { do: (cc) => { if (door) door.userData.set(0.45); } },
        { act: [['luka', 'idle']] },
        { place: 'chase40', at: [7.0, 0, -28.55, -2.6] }, { place: 'chase', at: [8.5, 0, -28.6, 2.6] },
      ], { letterbox: false });
    }
    if (ch && Math.hypot(ch.pos.x - 8.4, ch.pos.z + 28.7) > 2.2) ch.place([8.5, 0, -28.6, 2.6]);
    if (c4 && Math.hypot(c4.pos.x - 7.0, c4.pos.z + 28.6) > 2.2) c4.place([7.0, 0, -28.55, -2.6]);
    let sent = false, strengthHoldLive = true;
    const through = () => { const a = act(c, 'chase'), b = act(c, 'chase40'); return !!a && !!b && a.pos.z < -30.55 && b.pos.z < -30.55; };
    const h = strengthHold({ who: 'luka', label: 'Lift', dur: 1.5, keep: true, at: [7.75, 1.0, -30.3], anim: 'lift_strain', autoHold: 3.6,
      onProgress: (k) => { if (door) door.userData.set(0.45 + 1.55 * k); },
      onFull: () => {
        if (sent) return;
        sent = true;
        c.sfx('roller_door', { vol: 0.5 });
        // Chase and Chase (2040) go under first (scripted: the player is holding the door)
        c.runSteps([
          { move: 'chase40', to: [7.15, 0, -29.7], nowait: true }, { move: 'chase', to: [8.35, 0, -29.7], nowait: true },
        ]).then(() => later(c, 0.55, () => c.runSteps([
          { move: 'chase40', to: 's16_roller_under_1', nowait: true }, { move: 'chase', to: 's16_roller_under_2', nowait: true },
        ])));
        later(c, 2.0, () => { if (through() && strengthHoldLive) c.ui.prompt('HOLD — Let go and roll under'); });
      },
    });
    const ok = await h;
    strengthHoldLive = false;
    if (c.flow.sceneId !== '1.6') return;
    if (!ok) { if (door) door.userData.set(0.45); return; }   // let go before it was up: it sinks back
    if (!through()) {   // let go too soon: it slams, and whoever wasn't through steps back inside
      if (door) door.userData.slam();
      c.sfx('roller_door', { vol: 0.6, rate: 1.4 }); c.sfx('clunk', { vol: 0.6 });
      for (const [id, at] of [['chase40', [7.0, 0, -28.55, -2.6]], ['chase', [8.5, 0, -28.6, 2.6]]]) { const a = act(c, id); if (a && a.pos.z > -30.55) a.place(at); }
      later(c, 0.6, () => { if (door) door.userData.set(0.45); });
      return;
    }
    // Luka lets go and rolls under before it slams
    c.state.flags.s16_out = true;
    await c.playCutscene([
      fromA('roller_out', { push: 0.2, dur: 3 }),
      { do: (cc) => { if (door) door.userData.set(1.05); } },
      { act: [['luka', 'duck']] },
      { move: 'luka', to: 's16_roller_luka_out', run: true },
      { do: (cc) => { if (door) door.userData.slam(); } },
      { sfx: 'roller_door', vol: 0.55, rate: 1.5 }, { sfx: 'thud', vol: 0.7 },
      { do: (cc) => { if (!sk(cc)) cc.world.puff([7.75, 0.15, -30.4], { n: 12, color: 0xd8d2c4, speed: 0.6, life: 1.0, gravity: -0.2 }); } },
      { act: [['luka', 'idle']] },
      { wait: 0.9 },
      { do: () => { AUDIO.setRoom('none'); } },
    ], { letterbox: false });
    if (c.flow.sceneId === '1.6') stealth.checkpoint();
  }

  SCENES['1.6'] = {
    title: 'Safety Address', set: 'reddy40', env: 'day', time: '13:00', place: 'Optus Redcliffe',
    playable: ['luka', 'chase', 'chase40'], swap: false, music: null, hud: null,
    spawn: { luka: [1.6, 0, -6.55, -2.65], chase: [2.25, 0, -6.2, -2.7], chase40: [2.85, 0, -6.95, -2.6], jordan40: [6.6, 0, -4.4, -2.4] },
    hotspots: [
      // Des: the save point (and the Kettle sample, if Chase hasn't got it)
      { id: 'h16_des', at: 'des_stand', r: 0.9, verb: 'Use', des: true, sample: 'kettle' },
      { id: 'h16_kiosk', at: [5.6, 0, -4.5], r: 0.75, sample: 'chip' },
      // the zap (scripted, once): triggered by the watcher the first time anyone leads into the staff aisle
      { id: 'h16_zap', at: [2.9, 0, -10.5], r: 0.01, when: () => false, steps: 'zap16', do: (c) => afterZap(c) },
      // the old counter speaker (Chase): play a sample through it
      { id: 'h16_speaker', at: 's16_speaker', r: 0.85, only: 'chase', verb: 'Play a sample', when: (s) => !!s.flags.s16_zap && !S16.lure, do: (c) => playSpeaker(c) },
      // the roller door: jammed half-shut. Only Luka can lift it.
      { id: 'h16_roller', at: 's16_roller_luka', r: 0.9, only: 'luka', verb: 'Lift', when: (s) => !s.flags.s16_out, do: (c) => rollerDoor(c) },
      { id: 'h16_roller_try', at: 's16_roller_luka', r: 0.9, verb: 'Lift', when: (s) => !s.flags.s16_out && s.active !== 'luka',
        do: async (c) => {
          const a = act(c, c.state.active);
          if (a) { a.face(PI, 0.2); a.play('lift_strain'); }
          c.sfx('clunk', { vol: 0.5 });
          await c.wait(0.9);
          if (a) a.play('idle');
          c.ui.toast('It won’t budge. Luka can lift it — SWAP.');
        } },
      // the chip prompt (Chase (2040) in the car park, chip on): triggered by the watcher
      { id: 'h16_chip', at: [7.0, 0, -31.6], r: 0.01, when: () => false, steps: 'chip16', do: (c) => chipChoice(c) },
      // the skip bin (Luka): optional cover against the yard drone's cone
      { id: 'h16_bin', at: [14.25, 0, -36.6], r: 0.85, only: 'luka', verb: 'Push', when: (s) => !s.flags.s16_bin,
        do: async (c) => {
          await c.runSteps([{ move: 'luka', to: [14.25, 0, -36.6] }, { face: 'luka', to: -H, dur: 0.2 }]);
          const b = P(c, 'skip_bin'), l = act(c, 'luka');
          if (l) l.play('push');
          c.sfx('bin_scrape', { vol: 0.6 });
          if (b) b.userData.push(-2.2);
          await c.runSteps([{ move: 'luka', to: [12.05, 0, -36.6], speed: 0.9, face: false }]);
          if (l) l.play('idle');
          c.state.flags.s16_bin = true;
        } },
      // the gate onto Redcliffe Parade: all three of them together
      { id: 'h16_gate', at: 's16_gate', r: 1.3, verb: 'Go', when: (s) => !!s.flags.chip_off && everyoneAtGate(), flag: 's16_gate', do: () => {} },
    ],
    steps: [
      ['cutscene', '1.6_address'],
      ['do', (c) => { lockdown16(c); c.music('stealth', { fade: 1.5 }); }],
      ['control', 'luka'],
      ['follow', true],
      ['swap', true],
      ['objective', 'Get out the back.'],
      ['do', (c) => {
        stealth16(c); watch16(c);
        // the rules, once: small, on the store's own SafeSense broadcast
        if (!sk(c) && !c.state.flags.s16_rules) {
          c.state.flags.s16_rules = true;
          S16.rules = c.popup({ style: 'safesense', title: 'SafeSense', icon: 'none', buttons: [], at: [0.33, 0.25], w: 300, dur: 10, ding: false,
            msg: 'Courtesy Drones are active.\nBlue: scanning.\nAmber: you have been noticed.\nRed: you will be escorted to a Safe Room.\nFor your safety.' });
          c.sfx('ss_chirp', { vol: 0.4 });
        }
      }],
      ['roam', {
        until: 's16_gate',
        async auto(c) {
          const T = (id) => c.hotspots.trigger(id), F = c.state.flags;
          const at = (s) => { const a = act(c, c.state.active); testLog('1.6 auto ' + s + ' · ' + c.state.active + (a ? ' ' + a.pos.x.toFixed(1) + ',' + a.pos.z.toFixed(1) : '')); };
          const gone = () => c.flow.sceneId !== '1.6';
          const idle = () => until(() => (!c.flow.busy && !stealth.busy && !c.flow.skipping) || gone());
          swapTo(c, 'luka');
          // to the alcove's edge, then one step into the staff aisle: the zap (the watcher fires it; nothing queued
          // after that step, so no waypoint walks anyone on through the cutscene)
          await walk(c, [[1.5, 0, -8.7], [1.9, 0, -10.8]], false);
          c.player.enabled = true;
          { const l = act(c, 'luka'); if (l) l.moveTo([3.1, 0, -10.9], { collide: true }); }
          await until(() => S16.zapped || gone()); await idle();
          at('zapped');
          if (c.state.active !== 'chase') console.error('TWO 1.6: Chase should lead after the zap (' + c.state.active + ')');
          if (FAIL16) {   // the fail path: into drone_a's patrol, escorted, the Safe Room, back in the alcove
            const n0 = stealth.captures || 0;
            stealth.autoCapture = true;
            await walk(c, [[2.2, 0, -10.9], [4.6, 0, -10.9]], false);
            await until(() => (stealth.captures || 0) > n0 || gone());
            stealth.autoCapture = false;
            await idle();
            const a = act(c, 'chase');
            testLog('1.6 fail test: retried as ' + c.state.active + ' at ' + (a ? a.pos.x.toFixed(1) + ',' + a.pos.z.toFixed(1) : '?') + (player.waiting('luka') ? ' (Luka waiting)' : ''));
          }
          // Chase: the speaker (the others wait in the alcove)
          await walk(c, [[1.8, 0, -10.2], [1.7, 0, -8.5], [2.9, 0, -7.15], [7.8, 0, -7.15], 's16_speaker']);
          await T('h16_speaker');
          if (!F.s16_lured) console.error('TWO 1.6: the lure did not play');
          at('lured');
          await walk(c, [[1.7, 0, -8.5], [1.7, 0, -11.6], [1.9, 0, -12.6]]);
          at('back at the alcove');
          await until(() => !(player.waiting('luka') || player.waiting('chase40')) || gone());
          at('together');
          // all three: along the back wall behind the drones, into the corridor, down to the backroom
          await walk(c, [[2.8, 0, -12.15], [6.3, 0, -12.15], [6.4, 0, -13.4], [6.4, 0, -23.6], [6.9, 0, -26.6]]);
          at('backroom');
          swapTo(c, 'luka');
          await walk(c, ['s16_roller_luka'], false);
          await T('h16_roller');
          await idle();
          if (!F.s16_out) console.error('TWO 1.6: the roller door did not open');
          at('out');
          await until(() => F.chip_off || gone()); await idle();
          at('chip off');
          // the yard: the skip bin (optional cover), then the gate
          await walk(c, [[10.5, 0, -33.0], [14.6, 0, -34.6], [14.6, 0, -36.6]]);
          await T('h16_bin');
          await walk(c, [[11.6, 0, -38.6], [12.4, 0, -42.6], [12.8, 0, -44.9]]);
          await T('h16_gate');
        },
      }],
      ['objective', null],
      ['swap', false],
      ['follow', null],
      ['cutscene', '1.6_exit'],
    ],
    grants: { flags: { chip_off: true, s16_out: true, s16_gate: true, s16_zap: true, s16_lured: true }, noService: true, quiet: '46:58:00' },
  };
  function everyoneAtGate() {
    for (const id of ['luka', 'chase', 'chase40']) { const a = world.actor(id); if (!a || Math.hypot(a.pos.x - 12.8, a.pos.z + 45.2) > 4.2) return false; }
    return true;
  }

  CUTSCENES['1.6_address'] = [
    { do: (c) => nextTick().then(() => dress16(c)) },
    { fade: 'out', dur: 0 },
    { place: 'luka', at: [1.6, 0, -6.55, -0.3] }, { place: 'chase', at: [2.25, 0, -6.2, 2.6] }, { place: 'chase40', at: [2.85, 0, -6.95, -1.9] },
    // [WIDE · the store floor] Every screen in the store blinks to the same image.
    FLOOR_WIDE,
    { fade: 'in', dur: 0.8 },
    { do: (c) => { stroll(c, 'jordan40', [[4.8, 0, -6.6], A16.jordan40]); } },
    { wait: 1.6 },
    { prop: 'screens_all', fn: (o) => o.userData.show('off') },
    { sfx: 'flash_hum', vol: 0.4 },
    { wait: 0.15 },
    { prop: 'screens_all', fn: (o) => o.userData.show('address') },
    { sfx: 'manager_motif', vol: 0.45 },   // the Manager's motif: the address's ident, long before he speaks
    // Every customer's chip light pulses. They stop and look up at nothing. Jordan stops. Even the hover-trolley settles.
    { prop: 'locals', fn: (o) => { o.userData.lookUp(true); o.userData.pulse(true); } },
    { do: (c) => pulseChips(c, true) },
    { prop: 'hover_trolley', fn: (o) => o.userData.settle(true) },
    { wait: 0.6 },
    { place: 'jordan40', at: A16.jordan40 }, { act: [['jordan40', 'look_up']] },
    { face: 'luka', to: [-2.0, 0, -14.3], dur: 0.6 }, { face: 'chase', to: [-2.0, 0, -14.3], dur: 0.5 }, { face: 'chase40', to: [-2.0, 0, -14.3], dur: 0.7 },
    { wait: 2.8 },
    // [MID · the big screen] A silhouette at a desk in front of a glass wall; the Valley's dimmed neon behind; drones
    // like fireflies; a storm in the sky. Before speaking, the silhouette glances to his left. Then forward.
    { place: 'luka', at: A16.luka }, { place: 'chase', at: A16.chase }, { place: 'chase40', at: A16.chase40 },
    SCREEN_MID,
    { wait: 1.6 },
    { do: (c) => glanceLeft(c) },
    { wait: 2.2 },
    say('manager', ADDR[0]),
    LOCALS_UP,
    { wait: 0.3 },
    say('manager', ADDR[1]),
    TRIO_REV,
    { wait: 0.3 },
    say('manager', ADDR[2]),
    SCREEN_ECU,
    { wait: 0.5 },
    say('manager', ADDR[3]),
    { do: (c) => closeOn(c, 'jordan40', { yaw: 0.35, dist: 1.0, fov: 36, push: 0.1, dur: 9 }) },
    say('manager', ADDR[4]),
    { do: (c) => closeOn(c, 'chase40', { yaw: -0.4, dist: 1.0, fov: 36, push: 0.08, dur: 6 }) },
    say('manager', ADDR[5]),
    BEHIND,
    { wait: 0.3 },
    say('manager', ADDR[6]),
    SCREEN_MID,
    say('manager', ADDR[7]),
    { wait: 0.6 },
    { prop: 'screens_all', fn: (o) => o.userData.show('safe') },
    // [PAN · across the store] Customers applaud politely and blankly. One old man near Margaret's chair cries quietly
    // with a smile on his face. Jordan doesn't clap.
    { prop: 'locals', fn: (o) => { o.userData.applaud(true); const r = o.userData.rigs.local40_c; if (r) { r.face.set('tearful'); r.face.mouth('smile'); } } },
    { act: [['jordan40', 'idle']] }, { expr: [['jordan40', 'still']] },
    PAN16,
    { sfx: 'applause', vol: 0.32, rate: 0.85 },
    { wait: 2.6 },
    { sfx: 'applause', vol: 0.22, rate: 0.8 },
    { wait: 1.6 },
    OLD_MAN,
    { wait: 2.8 },
    { shot: 'CLOSE', on: 'jordan40', fov: 38 },
    { wait: 1.8 },
    { prop: 'locals', fn: (o) => { o.userData.applaud(false); } },
    // the HUD: NO SERVICE (their 2026 phones) and the countdown
    { hud: { noService: true, quiet: '46:58:00', samples: false, bars: null } },
    // [TWO-SHOT · Luka and Chase, the only faces without chip lights]
    { do: (c) => pulseChips(c, false) },
    // (facing each other, cheated open a little toward the lens so both faces read)
    { face: 'chase', to: -1.45, dur: 0 }, { face: 'luka', to: 0.5, dur: 0 },
    TWO16,
    { wait: 0.6 },
    say('chase', "That's Luke."),
    glance('luka', 'chase', 0.8),
    say('luka', "That's not Luke."),
    say('chase', "'Stay safe.' That's EXACTLY what Luke says."),
    say('luka', "Luke says 'don't be late'."),
    say('chase', 'Because being late is UNSAFE.'),
    { face: 'chase40', to: 'chase', dur: 0 },
    AWAY('chase40', 'luka', { dist: 1.0, fov: 36, push: 0.06, dur: 5 }),
    say('chase40', "It's not Luke."),
    { face: 'chase', to: 'chase40', dur: 0 },
    { do: (c) => closeAway(c, 'chase', 'luka', { dist: 1.0, fov: 36, push: 0.05, dur: 4 }) },
    say('chase', 'How do you know?'),
    AWAY('chase40', 'luka', { dist: 0.95, fov: 36, push: 0.06, dur: 5 }),
    say('chase40', "Because Luke would've said 'don't be late'."),
    // the three of them
    { face: 'luka', to: 'chase40', dur: 0 },
    { do: (c) => { if (!sk(c)) c.cam.shot({ shot: 'THREE', on: ['luka', 'chase', 'chase40'], fov: 42 }); } },
    { wait: 0.3 },
    say('luka', 'What happens on Monday? Actually.'),
    { expr: [['chase40', 'tired']] },
    AWAY('chase40', 'chase', { dist: 0.95, fov: 34, push: 0.12, dur: 14 }),
    { wait: 0.3 },
    slow('chase40', "Everything runs on the chips now. Cars. Lights. Hospitals. Your fridge. ^ 'Quiet' means off. Everyone opted out. Of everything. ^ Of each other."),
    { expr: [['luka', 'determined']] },
    { shot: 'CLOSE', on: 'luka', fov: 38 },
    say('luka', 'So we stop him.'),
    AWAY('chase40', 'chase', { dist: 0.95, fov: 36, push: 0.06, dur: 5 }),
    say('chase40', "That's why you're here."),
    // [WIDE] The front doors lock with a soft clunk. A gentle chime. Three white Courtesy Drones float in through the
    // entrance, blue lights scanning.
    { face: 'luka', to: [-2.0, 0, 0], dur: 0 }, { face: 'chase', to: [-2.0, 0, 0], dur: 0 }, { face: 'chase40', to: [-2.0, 0, 0], dur: 0 },
    DOORS16,
    { wait: 0.5 },
    { prop: 'front_doors', fn: (o) => o.userData.lock(true) },
    { sfx: 'clunk', vol: 0.5 },
    { wait: 0.5 },
    { sfx: 'ss_chirp', vol: 0.5 },
    { do: (c) => {
      for (const id of ['drone_a', 'drone_b', 'drone_c']) DRONES.spawn(id, { at: IN_AT[id], face: PI, hover: 1.8, cone: { len: 2.6, half: 0.45 }, showPath: false });
      const d = P(c, 'door_l'); if (d && d.userData.hold) { d.userData.hold(true); later(c, 3.2, () => d.userData.hold(false)); }
      if (sk(c)) for (const id of ['drone_a', 'drone_b', 'drone_c']) DRONES.goTo(id, [-2.0 + (id === 'drone_a' ? -0.9 : id === 'drone_c' ? 0.9 : 0), 0, -2.6]);
      else ['drone_a', 'drone_b', 'drone_c'].forEach((id, i) => later(c, 0.35 * i, () => DRONES.goTo(id, [-2.0 + (i - 1) * 0.9, 0, -2.6], { speed: 1.4 })));
    } },
    { wait: 3.6 },
    // DRONE
    DRONES_IN,
    { do: (c) => { if (!sk(c)) c.sfx('drone_scan', { vol: 0.6 }); } },
    say('drone', 'Hello! A temporal anomaly was detected in this store fifty-six minutes ago. ^ We came as soon as it was safe. ^ For your safety, please remain where you are.'),
    AWAY('chase40', 'luka', { dist: 0.95, fov: 36, push: 0.05, dur: 4 }),
    say('chase40', "That's us.", { tag: 'quietly' }),
    // JORDAN (stepping close to Chase (2040), not looking at him, very quietly)
    { place: 'jordan40', at: A16.close }, { face: 'jordan40', to: [-2.0, 0, -0.5], dur: 0 }, { face: 'chase40', to: [-2.0, 0, -0.5], dur: 0 },
    { expr: [['jordan40', 'still']] },
    SIDE_BY,
    { wait: 0.6 },
    say('jordan40', "Back door. ^ Go. ^ I didn't see you.", { tag: 'very quietly' }),
    { wait: 0.3 },
    // the store dims to "safe brightness"; the three drones take up their posts
    { env: 'lockdown', dur: 1.6 },
    { do: (c) => { const loc = P(c, 'locals'); if (loc) loc.userData.freeze(); } },
    fromA('s16_floor_wide', { push: 0.2, dur: 4 }),
    { do: (c) => Promise.all(['drone_a', 'drone_b', 'drone_c'].map((id) => DRONES.goTo(id, [POSTS[id][0], 0, POSTS[id][1]], { speed: 2.4 }))) },
    { place: 'jordan40', at: A16.close },
    { place: 'luka', at: 's16_cp_floor' }, { place: 'chase', at: [2.3, 0, -8.15, -2.8] }, { place: 'chase40', at: [1.0, 0, -8.0, -2.8] },
  ];

  // The zap: in the staff aisle two drones cross paths. Luka, watching their cones, whispers "Go left—".
  const ZAP_OTS = cam([1.35, 1.72, -10.45], [6.0, 1.25, -11.2], 46, [[1.45, 1.72, -10.5]], 5);
  const ZAP_SIDE = cam([3.0, 1.45, -9.05], [3.55, 1.25, -11.55], 52, [[3.0, 1.45, -9.2]], 4);
  const ZAP_DRONE = cam([2.6, 1.55, -10.4], [3.85, 1.7, -11.75], 40, [[2.7, 1.56, -10.55]], 4);
  CUTSCENES.zap16 = [
    { do: () => { if (S16.rules) { S16.rules.close(); S16.rules = null; } } },
    { letterbox: true },
    { place: 'luka', at: 's16_zap_luka' }, { place: 'chase', at: 's16_zap_chase_from' }, { place: 'chase40', at: [1.6, 0, -11.6, H] },
    { do: (c) => { DRONES.goTo('drone_b', [4.9, 0, -11.75], { speed: 200 }); DRONES.goTo('drone_a', [5.8, 0, -10.45], { speed: 200 }); } },
    { wait: 0.05 },
    { do: (c) => { DRONES.release('drone_a'); DRONES.goTo('drone_b', [3.85, 0, -11.75], { speed: 0.5 }); } },
    ZAP_OTS,
    { wait: 1.2 },
    say('luka', 'Go left—', { tag: 'whisper' }),
    // Chase goes left, straight into the edge of a drone's courtesy field. ZAP.
    ZAP_SIDE,
    { move: 'chase', to: 's16_zap_chase_to' },
    { do: (c) => { DRONES.goTo('drone_b', [3.85, 0, -11.75], { speed: 200 }); DRONES.face('drone_b', 'chase'); } },
    { do: (c) => DRONES.zap('drone_b', 'chase') },
    { expr: [['chase', 'stunned']] },
    { do: (c) => { const a = act(c, 'chase'); if (a) { a.rig.face.mark('soot', true); a.rig.show('hair_static', true); } } },
    ZAP_DRONE,
    say('drone', 'Static discharge! ^ For your safety!'),
    // Chase's hair stands on end and one fingertip smokes a little.
    { face: 'chase', to: 'luka', dur: 0 }, { face: 'luka', to: 'chase', dur: 0 },
    { shot: 'CLOSE', on: 'chase', fov: 42 },
    { do: (c) => { if (sk(c)) return; const a = act(c, 'chase'); if (!a) return; const h = a.rig.parts.handR; a.root.updateMatrixWorld(true); h.getWorldPosition(V1); for (let i = 0; i < 4; i++) later(c, i * 0.7, () => c.world.puff([V1.x, V1.y + 0.05, V1.z], { n: 3, color: 0x8c8c8c, speed: 0.1, life: 1.6, gravity: -0.35 })); } },
    { wait: 0.6 },
    { expr: [['chase', 'sheepish']] },
    say('chase', "I'm fine."),
    { shot: 'OTS', on: 'luka', over: 'chase', fov: 40 },
    say('luka', "You're smoking.", { tag: 'whisper' }),
    { shot: 'OTS', on: 'chase', over: 'luka', fov: 40 },
    say('chase', "It's a little bit of smoke.", { tag: 'whisper' }),
    // (Luka's face. He said go left.)
    { expr: [['luka', 'worried']] },
    { act: [['luka', 'lanyard']] },
    { shot: 'CLOSE', on: 'luka', fov: 38, move: 'push', amount: 0.2, dur: 4 },
    { wait: 2.2 },
    { act: [['luka', 'idle']] },
    { fade: 'out', dur: 0.4 },
    { letterbox: false },
  ];
  // back in the alcove, out of every cone: Chase leads (the others wait while he sets a distraction)
  async function afterZap(c) {
    DRONES.reset();
    holdAlcove(c);
    const a = act(c, 'chase'); if (a) { a.place([1.45, 0, -12.5, H]); a.rig.face.mark('soot', true); a.rig.show('hair_static', true); }
    stealth.checkpoint();
    await c.playCutscene([
      { expr: [['luka', 'neutral'], ['chase', 'neutral']] },
      // the old counter speaker (no words): the thing that makes noise
      fromA('speaker', { push: 0.12, dur: 4 }),
      { fade: 'in', dur: 0.4 },
      { prop: 'counter_speaker', fn: (o) => { o.userData.playing = true; } },
      { wait: 0.4 },
      { prop: 'counter_speaker', fn: (o) => { o.userData.playing = false; } },
      { wait: 1.6 },
    ], { letterbox: false });
    S16.zapped = true;
    if (!sk(c)) c.ui.toast('Chase can play a sample through the old counter speaker.');
  }

  // The chip. In the car park a drone tower pings for chip signals. A prompt over Chase (2040): Switch chip off?
  CUTSCENES.chip16 = [
    { letterbox: true },
    { place: 'chase40', at: 's16_chip_prompt' },
    { do: (c) => { const t = P(c, 'drone_tower'); if (t) t.userData.ping(); } },
    fromA('tower', { push: 0.3, dur: 4 }),
    { sfx: 'drone_scan', vol: 0.5 },
    { wait: 1.4 },
    { do: (c) => { const a = act(c, 'chase40'); if (a) a.rig.chip('ping'); } },
    { do: (c) => closeOn(c, 'chase40', { yaw: 0.6, dist: 1.1, fov: 38, push: 0.06, dur: 6 }) },
    { wait: 0.3 },
    { popup: { style: 'safesense', title: 'SafeSense', msg: 'Switch chip off?', buttons: ['YES', 'NO'], icon: 'none', at: { actor: 'chase40' }, w: 240, ding: false,
      get dodge() { return FAIL16 && !state.flags.s16_said_no ? [0] : undefined; } }, wait: true },
    { do: (c) => { const a = act(c, 'chase40'); if (a) a.rig.chip('on'); } },
    { letterbox: false },
  ];
  async function chipChoice(c) {
    const yes = c.flow.result === 0;
    if (!yes) {   // NO: the tower hears him
      c.state.flags.s16_said_no = true;
      await c.playCutscene([
        { do: (cc) => { const t = P(cc, 'drone_tower'); if (t) { t.userData.alert(true); t.userData.ping(); } } },
        { do: (cc) => { const a = act(cc, 'chase40'); if (a) a.rig.chip('amber'); } },
        say('safesense', 'Signal detected. Hello, Chase!'),
      ], { letterbox: false });
      c.state.flags.s16_chip_now = false;   // after the Safe Room: the prompt again
      await stealth.softFail('chase40');
      const t = P(c, 'drone_tower'); if (t) t.userData.alert(false);
      const a = act(c, 'chase40'); if (a) a.rig.chip('on');
      return;
    }
    // YES: his light goes dark
    await c.playCutscene([
      { do: (cc) => { chip.forceOff(true, 'Chip off. Aeroplane mode.'); cc.state.flags.chip_off = true; const a = act(cc, 'chase40'); if (a) a.rig.chip('off'); } },
      { sfx: 'chip_on', vol: 0.5, rate: 0.6 },
      { act: [['chase40', 'chip_ping']] },
      { do: (cc) => closeOn(cc, 'chase40', { yaw: 0.45, dist: 1.0, fov: 36, push: 0.05, dur: 5 }) },
      { wait: 0.7 },
      say('chase40', 'Aeroplane mode. ^ For the brain.'),
      // (He immediately walks into a pole.)
      { place: 'chase40', at: 's16_bonk_from' },
      cam([5.9, 1.45, -33.2], [7.9, 1.35, -32.3], 42, [[6.0, 1.45, -33.15]], 3),   // side-on: he walks across the frame into it
      { move: 'chase40', to: [7.82, 0, -32.12] },
      { sfx: 'thud', vol: 0.9 }, { sfx: 'clunk', vol: 0.5, rate: 0.7 },
      { act: [['chase40', 'stumble', { dur: 0.45, loop: false }]] },
      { do: (cc) => { if (!sk(cc)) cc.cam.shake(0.02, 0.3); } },
      { wait: 0.9 },
      { expr: [['chase40', 'wince']] },
      { do: (cc) => closeOn(cc, 'chase40', { yaw: -0.5, dist: 1.0, fov: 36, push: 0.06, dur: 7 }) },
      { wait: 0.5 },
      { expr: [['chase40', 'worried']] },
      say('chase40', "…I can't see anything. Everything's in the chip. ^ I don't know where the car park ENDS."),
      { wait: 0.4 },
      { expr: [['chase40', 'neutral']] },
    ], { letterbox: true });
    if (c.flow.sceneId === '1.6') stealth.checkpoint();
  }

  // Exit: the car park gate onto Redcliffe Parade.
  const GATE = fromA('gate', { push: 0.5, dur: 7 });
  CUTSCENES['1.6_exit'] = [
    { do: () => { stealth.end(); } },
    { place: 'luka', at: [12.6, 0, -44.9, PI] }, { place: 'chase', at: [13.3, 0, -44.4, PI] }, { place: 'chase40', at: [12.1, 0, -44.3, PI] },
    GATE,
    { wait: 0.6 },
    { move: 'luka', to: [12.8, 0, -46.5] }, { move: 'luka', to: [12.2, 0, -48.0], nowait: true },
    { move: 'chase', to: [12.8, 0, -46.5] }, { move: 'chase', to: [13.2, 0, -48.1], nowait: true },
    { move: 'chase40', to: [12.8, 0, -46.5] }, { move: 'chase40', to: [12.7, 0, -48.2], nowait: true },
    { wait: 1.4 },
    { do: (c) => { DRONES.clear(); AR.clear(); chip.hot = []; c.world.prebuild('parade'); } },
    { fade: 'out', dur: 1.0 },
  ];
})();
