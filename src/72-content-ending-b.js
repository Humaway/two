// ============================================================ CONTENT: B1 ("Again") and B2 ("Christmas Morning")
// BUILD_PROMPT §8 Ending B. Every line is final and word for word; '^' = a beat. Shot tags are quoted in the comments.
// Sets: hq_roof (golden37: the goodbyes, the call's left half, the white) -> reddy26 (the split's right half, home
// without memories, the dark shop floor, the montage's 2027 / 2029 / 2034 frames and the match cut) -> parade
// (festival31 2031 poster, sunset33 2033 jetty) -> rue_house (cork31) -> reddy40 (2037 every screen, 2040 the machine
// and Des) -> reddy26 (the exact frame of 1.2 step 1) -> White. B2: parade Region W (xmas40, env wp_washed), the bench.
// The montage cuts under black: each frame's set is prebuilt in the black before the frame before it (liveMax 3:
// reddy26 is never evicted, so the match cut is instant). 2035's funeral room has no set: it is built here at load time
// (vertex colours on ART_KIT's shared material, nothing compiles mid-game) and parked in reddy26's scene for one frame.
// No roam, no kettle (cutscenes only), no samples. Story flags: hurt + lanyard_snapped + bandaged (3.5-3.7), santa off;
// home: the snapped lanyard is round Luka's neck again, knotted back together. Music: 'lofi' (B1), birds then "two"
// out loud from the slate (B2). The call is written out here in full ("exactly as A1 steps 19-25"): no cross-file use.
(() => {
  const PI = Math.PI, H = PI / 2;
  const say = (id, text, o) => Object.assign({ say: id, text }, o);
  const slow = (id, text, o) => say(id, text, Object.assign({ speed: 'slow' }, o));
  const sk = (c) => c.flow.skipping;
  const act = (c, id) => c.world.actor(id);
  const P = (c, n, s) => c.world.prop(n, s);
  const ud = (c, n, s) => { const o = P(c, n, s); return o ? o.userData : null; };
  const put = (id, at) => ({ place: id, at });
  const mine = (c) => c.flow.sceneId === 'B1' || c.flow.sceneId === 'B2';
  const V1 = new THREE.Vector3();
  const lerp = (a, b, u) => a + (b - a) * u;
  const smooth = (u) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
  const glide = (pos, look, fov, pos2, look2, fov2, dur, o) => Object.assign({ shot: 'CAM', pos, look, fov, to: { pos: pos2, look: look2 || look, fov: fov2 || fov }, dur, ease: 'linear' }, o);
  const lensPush = (n, amount, dur, o) => Object.assign({ shot: 'INSERT', at: n, move: 'push', amount, dur, ease: 'linear' }, o);
  // a tween on the game clock (fn gets 0..1 eased); snaps to the end while skipping or when the scene changes
  function tween(c, dur, fn) {
    const sid = c.flow.sceneId;
    if (sk(c) || !(dur > 0)) { fn(1); return; }
    let t = 0;
    const f = (dt) => { t = Math.min(1, t + dt / dur); if (flow.sceneId !== sid || flow.skipping) t = 1; fn(smooth(t)); if (t >= 1) removeUpdate(f); };
    addUpdate(f);
  }
  // a head turn without moving the feet (one-shot)
  function glanceAt(c, id, to, dur = 1.4) {
    const a = act(c, id), b = typeof to === 'string' ? act(c, to) : null;
    if (!a || sk(c)) return;
    const tx = b ? b.pos.x : to[0], tz = b ? b.pos.z : to[1];
    let rel = Math.atan2(tx - a.pos.x, tz - a.pos.z) - a.rotY;
    while (rel > PI) rel -= 2 * PI;
    while (rel < -PI) rel += 2 * PI;
    a.play('glance', { yaw: Math.max(-1.3, Math.min(1.3, rel)), dur });
  }
  const glance = (id, to, dur) => ({ do: (c) => { glanceAt(c, id, to, dur); } });
  // a computed close-up: the lens `dist` m from his eyes, `yaw` rad off his facing, pushing in `push` m over `dur` s
  function closeOn(c, id, o = {}) {
    if (sk(c)) return;
    const a = act(c, id);
    if (!a) return;
    a.eyePos(V1);
    const ry = a.rotY + (o.yaw || 0), d = o.dist || 0.95, pu = o.push ?? 0.12, ly = V1.y - 0.05 + (o.ly || 0);
    const sx = Math.sin(ry), sz = Math.cos(ry), y = V1.y + (o.dy ?? -0.02), f = o.fov || 36;
    c.cam.shot({ shot: 'CAM', half: o.half, pos: [V1.x + sx * d, y, V1.z + sz * d], look: [V1.x, ly, V1.z], fov: f,
      to: { pos: [V1.x + sx * (d - pu), y, V1.z + sz * (d - pu)], look: [V1.x, ly, V1.z], fov: o.fovTo || f }, dur: o.dur || 7, ease: 'linear' });
  }
  const CLOSE = (id, o) => ({ do: (c) => { closeOn(c, id, o); } });
  // back on his feet, anims set (a lie / floor-sit / seat survives otherwise)
  const up = (list) => ({ do: (c) => { for (const [id, anim, o] of list) { const a = act(c, id); if (!a) continue; a.rig.seated = false; a.rig.floorSit = false; a.play(anim || 'idle', o || {}); } } });
  const seat = (list) => ({ do: (c) => { for (const [id, anim, o] of list) { const a = act(c, id); if (!a) continue; a.rig.seated = true; a.play(anim, o || {}); } } });
  const sfx = (name, o) => Object.assign({ sfx: name }, o);

  // ============================================================ anims this file owns (guarded; no allocation per tick)
  const K = () => (typeof RIGKIT !== 'undefined' ? RIGKIT : null);
  let TY = 0, TZ = 0;
  function toT(r, y, z) { const th = r.parts.torso.rotation.x, yy = y - 0.06, cc = Math.cos(th), ss = Math.sin(th); TY = yy * cc + z * ss; TZ = -yy * ss + z * cc; }
  // arm `sd` (+1 left, -1 right) `x` out from the centre line to a point `hM` m above the feet and `zM` m ahead
  function reach(r, k, sd, x, hM, zM, px = 0.5, py = -1, pz = -0.4) { toT(r, k.hipsY(r, hM) - r.parts.hips.position.y, k.hipsY(r, zM)); k.arm(r, sd, x, TY, TZ, px, py, pz); }
  function def(n, fn, o) { if (ANIMS[n]) return; ANIMS[n] = fn; if (o && o.upper) fn.upper = true; if (o && o.shows) fn.shows = o.shows; }
  function defAnims() {
    // Chase (2040) reading the slate in his right hand, held up in front of his chest, head down (standing or seated)
    def('b1_slate', (r, t, p) => {
      const k = K(); if (!k) return ANIMS.idle(r, t, p);
      if (!r.seated) k.base(r, t); else k.breathe(r, t);
      const Pt = r.parts, hm = p.h ? 0.82 : 1.12;
      Pt.torso.rotation.x = 0.1;
      reach(r, k, -1, 0.04, hm, 0.3, 0.5, -1, -0.5); Pt.handR.rotation.set(-1.1, 0.2, 0.1);
      reach(r, k, 1, 0.08, hm - 0.04, 0.3, 0.5, -1, -0.5); Pt.handL.rotation.set(-0.8, 0, -0.3);
      Pt.head.rotation.x = 0.42; Pt.neck.rotation.x = 0.12;
    }, { upper: true, shows: 'slate' });
    // Luka holds his snapped lanyard out in his left fist (p.k 0..1 how far); the right hand at his ribs
    def('b1_offer', (r, t, p) => {
      const k = K(); if (!k) return ANIMS.idle(r, t, p);
      k.base(r, t); const Pt = r.parts, u = p.k ?? 1;
      Pt.torso.rotation.x = 0.08;
      reach(r, k, 1, 0.1 + 0.04 * u, 1.04 + 0.04 * u, 0.2 + 0.24 * u, 0.4, -1, -0.4); Pt.handL.rotation.set(0.1, 0, -0.4);
      reach(r, k, -1, 0.12, 1.02, 0.14, 0.4, -1, -0.2); Pt.handR.rotation.set(0.2, 0, 0.6);
      Pt.head.rotation.x = 0.18;
    });
    // Luka's left fist back at his chest, the lanyard in it; the right at his ribs
    def('b1_clutch', (r, t, p) => {
      const k = K(); if (!k) return ANIMS.idle(r, t, p);
      k.base(r, t); const Pt = r.parts;
      Pt.torso.rotation.x = 0.1;
      reach(r, k, 1, 0.03, 1.28, 0.17, 0.4, -1, -0.2); Pt.handL.rotation.set(0.3, 0, -0.6);
      reach(r, k, -1, 0.12, 1.02, 0.14, 0.4, -1, -0.2); Pt.handR.rotation.set(0.2, 0, 0.6);
      Pt.head.rotation.x = 0.22;
    });
    // Luka (2040) closes Luka's fingers back round it: his right hand forward over Luka's
    def('b1_cover', (r, t, p) => {
      const k = K(); if (!k) return ANIMS.idle(r, t, p);
      k.base(r, t); const Pt = r.parts;
      Pt.torso.rotation.x = 0.12;
      reach(r, k, -1, 0.02, 1.08, 0.42, 0.4, -1, -0.4); Pt.handR.rotation.set(0.5, 0, 0.2);
      Pt.head.rotation.x = 0.2;
    });
    // on his back on the floor; p.hand: the right hand on his chest (the lanyard); p.look: the head lifts toward the
    // feet (the door); p.turn: the head rolls (+ left); p.laugh: the chest shakes
    def('b1_lie', (r, t, p) => {
      ANIMS.lie(r, t); const k = K(), Pt = r.parts, d = r.d;
      if (k && p.hand) { k.arm(r, -1, 0.05, 0.19 * (d.T / 0.47), d.chestZ + 0.05, 0.4, -1, -0.2); Pt.handR.rotation.set(0, 0, 0.3); }
      Pt.head.rotation.x = -0.1 + 0.55 * (p.look || 0); Pt.head.rotation.y = p.turn || 0;
      if (p.laugh) Pt.torso.rotation.x = 0.05 * Math.abs(Math.sin(t * 9));
    });
    // 2034: crouched over someone on the floor, the right hand reaching down for his lanyard
    def('b1_grab', (r, t, p) => {
      const k = K(); if (!k) return ANIMS.idle(r, t, p);
      k.kneel(r, t); const Pt = r.parts, s = 0.015 * Math.sin(t * 7);
      Pt.torso.rotation.x = 0.62;
      reach(r, k, -1, 0.05, 0.2 + s, 0.62, 0.5, -1, -0.3); Pt.handR.rotation.set(0.9, 0, 0.2);
      reach(r, k, 1, 0.24, 0.32, 0.4, 0.5, -1, -0.3);
      Pt.head.rotation.x = 0.35;
    });
    // 2035: at the lectern, both hands on its edges, head bowed
    def('b1_lectern', (r, t, p) => {
      const k = K(); if (!k) return ANIMS.idle(r, t, p);
      k.base(r, t); const Pt = r.parts;
      Pt.torso.rotation.x = 0.1 + 0.008 * Math.sin(t * 1.1);
      reach(r, k, 1, 0.24, 1.1, 0.3, 0.5, -1, -0.4); reach(r, k, -1, 0.24, 1.1, 0.3, 0.5, -1, -0.4);
      Pt.head.rotation.x = 0.4; Pt.neck.rotation.x = 0.1;
    });
    // 2040: Chase (2040) at the machine on the bench, both hands working; p.type: one finger on Des's little screen
    def('b1_wire', (r, t, p) => {
      const k = K(); if (!k) return ANIMS.idle(r, t, p);
      k.base(r, t); const Pt = r.parts, w = t * 2.6;
      Pt.torso.rotation.x = 0.26;
      if (p.type) { reach(r, k, -1, 0.0, 1.05 - 0.012 * Math.max(0, Math.sin(t * 11)), 0.6, 0.4, -1, -0.5); Pt.handR.rotation.set(0.8, 0, 0); }
      else reach(r, k, -1, 0.1 + 0.03 * Math.sin(w), 0.98, 0.46, 0.5, -1, -0.4);
      reach(r, k, 1, 0.14 + 0.02 * Math.cos(w * 0.7), 0.97, 0.44 + 0.02 * Math.sin(w * 1.3), 0.5, -1, -0.4);
      Pt.head.rotation.x = p.type ? 0.18 : 0.32;
    });
    // B2: seated on the bench, the brick phone (shows 'brick') in his scarred right hand, turning over
    def('b2_turn', (r, t, p) => {
      const k = K(); if (!k) return ANIMS.idle(r, t, p);
      k.breathe(r, t); const Pt = r.parts, u = Math.sin(t * 0.8);
      Pt.torso.rotation.x = 0.16;
      reach(r, k, -1, 0.06, 0.86, 0.32, 0.5, -1, -0.5); Pt.handR.rotation.set(-0.7 + 0.45 * u, 0.6 * Math.sin(t * 0.55), 0.2);
      reach(r, k, 1, 0.1, 0.72, 0.3, 0.5, -1, -0.5);
      Pt.head.rotation.x = 0.4;
    }, { upper: true, shows: 'brick' });
    // Luke on the counter phone: a very long sigh (shoulders up, head back; then all of it out, head down); one-shot
    def('b1_sigh', (r, t, p) => {
      if (ANIMS.phone_bare) ANIMS.phone_bare(r, t, p); else ANIMS.idle(r, t, p);
      const Pt = r.parts, u = Math.min(1, t / (p.dur || 2.8)), a = u < 0.35 ? smooth(u / 0.35) : 1 - smooth((u - 0.35) / 0.65), b = u < 0.35 ? 0 : smooth((u - 0.35) / 0.65);
      Pt.torso.rotation.x += -0.07 * a + 0.06 * b; Pt.head.rotation.x += -0.22 * a + 0.2 * b;
      if (Pt.armL.position) { Pt.armL.position.y += 0.025 * a; Pt.armR.position.y += 0.025 * a; }
    }, { upper: true });
    // the kid on the skateboard: knees soft, arms out a little (the board follows his feet)
    def('b2_ride', (r, t, p) => {
      const k = K(); if (!k) return ANIMS.idle(r, t, p);
      k.base(r, t); const Pt = r.parts;
      Pt.hips.position.y -= 0.04; Pt.torso.rotation.y = 0.5; Pt.head.rotation.y = -0.45;
      k.arm(r, 1, 0.42, -0.08 + 0.02 * Math.sin(t * 3), 0.05, 0, -1, 0); k.arm(r, -1, 0.4, -0.1, -0.04, 0, -1, 0);
    });
  }
  defAnims();

  // ============================================================ small props built at load time (ART_KIT, shared material)
  // the knot in Luka's lanyard (home and after); the snapped lanyard in his fist (the roof); the 2035 funeral room
  // (a hall: rows of mourners' backs, a lectern, a photo on an easel, flowers)
  const KIT = (() => {
    if (typeof ART_KIT === 'undefined' || !ART_KIT.kit) return {};
    const kit = ART_KIT.kit, LC = '#82aac4', LCD = '#6c93ad';
    const knot = kit().sph(0.013, LCD, 0, 0, 0, 1.3, 1, 1).sph(0.009, LC, 0.006, -0.008, 0.004).box(0.016, 0.03, 0.003, LC, 0.012, -0.022, 0.002, 0, 0, 0.5).done();
    knot.name = 'b1_knot';
    // the snapped lanyard: two strap ends hanging from the fist, the faded LUKA badge on the longer one
    const snapped = kit()
      .box(0.018, 0.2, 0.003, LC, 0, -0.1, 0).box(0.018, 0.12, 0.003, LC, 0.024, -0.06, 0.004, 0, 0, 0.25)
      .box(0.012, 0.014, 0.008, '#b8bcc2', 0, -0.205, 0).box(0.072, 0.046, 0.006, '#e8e8e4', 0, -0.24, 0)
      .box(0.06, 0.012, 0.0065, '#5c86b0', 0, -0.228, 0).done();
    snapped.name = 'b1_snapped';
    // the hall (local metres: x -4.2..4.2, z -6.6..6.6, y 0..3.6; the lectern at the north end -Z, the door at +Z)
    const hall = new THREE.Group(); hall.name = 'b1_hall';
    const k = kit();
    const WALL = '#d6ccb8', PANEL = '#6e5034', CARPET = '#5b3536', CEIL = '#c9bfab';
    k.box(8.8, 0.1, 13.6, CARPET, 0, -0.05, 0);                          // floor
    k.box(8.8, 0.1, 13.6, CEIL, 0, 3.65, 0);                             // ceiling
    for (const sx of [-1, 1]) {
      k.box(0.2, 3.6, 13.6, WALL, sx * 4.3, 1.8, 0); k.box(0.06, 1.0, 13.4, PANEL, sx * 4.17, 0.5, 0);
      for (const z of [-3.6, 0, 3.6]) k.box(0.05, 1.5, 1.1, '#9aa6b4', sx * 4.17, 2.05, z);   // tall windows, grey morning
    }
    k.box(8.8, 3.6, 0.2, WALL, 0, 1.8, -6.9); k.box(8.6, 1.0, 0.06, PANEL, 0, 0.5, -6.77);
    k.box(8.8, 3.6, 0.2, WALL, 0, 1.8, 6.9); k.box(8.6, 1.0, 0.06, PANEL, 0, 0.5, 6.77);
    k.box(1.2, 2.2, 0.06, '#4a3424', 2.6, 1.1, 6.77);                     // the door at the back
    k.box(2.6, 0.18, 1.4, '#7a5a3c', 0, 0.09, -5.6);                      // a low dais
    k.box(0.62, 1.05, 0.42, '#6a4a30', 0, 0.71, -5.55).box(0.7, 0.06, 0.5, '#7e5a3a', 0, 1.26, -5.55, -0.25, 0, 0);   // lectern
    // the easel and the photo (frame, mount, a portrait in simple shapes), flowers at its foot
    k.box(0.04, 1.5, 0.04, '#5a4028', -1.55, 0.93, -5.75, 0.12, 0, 0).box(0.04, 1.5, 0.04, '#5a4028', -1.95, 0.93, -5.75, 0.12, 0, 0);
    k.box(0.62, 0.78, 0.04, '#2a2018', -1.75, 1.45, -5.65, -0.12, 0, 0).box(0.52, 0.68, 0.045, '#e8e2d4', -1.75, 1.45, -5.645, -0.12, 0, 0);
    k.sph(0.12, '#c88f6a', -1.75, 1.5, -5.615, 1, 1.15, 0.3).sph(0.13, '#4a2e1c', -1.75, 1.42, -5.62, 1.05, 0.9, 0.25).box(0.4, 0.2, 0.02, '#18181c', -1.75, 1.24, -5.62, -0.12, 0, 0);
    for (let i = 0; i < 9; i++) { const a = i * 0.7, x = -1.75 + Math.cos(a) * 0.25, z = -5.35 + Math.sin(a) * 0.12; k.sph(0.08, i % 3 ? '#f4f2ea' : '#e8d870', x, 0.32 + (i % 2) * 0.08, z); }
    k.box(0.5, 0.26, 0.3, '#3a5a34', -1.75, 0.13, -5.35);
    for (const sx of [-1, 1]) for (let i = 0; i < 5; i++) k.sph(0.075, i % 2 ? '#f4f2ea' : '#d8e0f0', sx * 0.85 + (i - 2) * 0.09, 0.95 + (i % 2) * 0.05, -5.95);
    k.box(0.3, 0.9, 0.3, '#b8ac94', 0.85, 0.45, -5.95).box(0.3, 0.9, 0.3, '#b8ac94', -0.85, 0.45, -5.95);
    // five rows, two blocks of chairs, nearly every one taken: the backs of mourners in dark clothes
    const HAIR = ['#2a1d14', '#4a3424', '#7a6a58', '#1a1410', '#b8b0a4', '#5a3a22', '#2e2a28', '#8a6a44'];
    const COAT = ['#1c1e24', '#24262c', '#2c2a30', '#1a1c22', '#30323a', '#22242a'];
    let n = 0;
    for (let row = 0; row < 5; row++) {
      const z = -3.3 + row * 1.25;
      for (const side of [-1, 1]) for (let s = 0; s < 4; s++) {
        const x = side * (0.75 + s * 0.68);
        k.box(0.46, 0.05, 0.44, '#4a3a2c', x, 0.46, z).box(0.46, 0.48, 0.04, '#5a4634', x, 0.72, z + 0.22);   // seat, back
        if ((row * 7 + s * 3 + (side > 0 ? 2 : 0)) % 9 === 4) continue;       // an empty chair here and there
        const hc = HAIR[n % HAIR.length], cc = COAT[n % COAT.length]; n++;
        k.box(0.42, 0.56, 0.26, cc, x, 0.76, z - 0.02).box(0.13, 0.08, 0.12, cc, x, 1.08, z - 0.02);
        k.sph(0.105, '#c89a7a', x, 1.22, z - 0.04, 0.95, 1.1, 1).sph(0.112, hc, x, 1.25, z + 0.0, 1.0, 1.05, 0.9);
      }
    }
    hall.add(k.done());
    return { knot, snapped, hall };
  })();
  // a kit prop needs a home (hold(null) puts things back where they came from): parked under the current set's scene
  function home(c, o) {
    if (!o) return;
    if (o.parent !== c.world.scene) { if (o.parent) o.parent.remove(o); if (c.world.scene) c.world.scene.add(o); }
    o.position.set(0, -40, 0); o.visible = false; delete o.userData.home;
  }
  const HALL_AT = [40, -60, -40];   // the hall's origin inside reddy26's scene: far below everything, walled in

  // ============================================================ cleanup (pooled rigs, kit props, the canvas, the spot)
  const D = { active: false, lamp: false, knot: false, hall: false, blur: false, meter: false, hum: null, song: null, pop: null, lb: false, flick: null, rigs: [] };
  function touch(c, ids) { for (const id of ids) { const a = act(c, id); if (a && !D.rigs.includes(a.rig)) D.rigs.push(a.rig); } }
  function knotOff() { if (KIT.knot && KIT.knot.parent) KIT.knot.parent.remove(KIT.knot); D.knot = false; }
  function cleanup() {
    if (!D.active) return;
    D.active = false;
    knotOff();
    if (KIT.hall && KIT.hall.parent) KIT.hall.parent.remove(KIT.hall);
    if (typeof world !== 'undefined') for (const id of ['chase', 'luke', 'luka']) { const a = world.actor(id); if (a && a.held && (a.held === KIT.snapped || a.held.name === 'store_phone')) a.hold(null); }
    if (KIT.snapped) { if (KIT.snapped.parent) KIT.snapped.parent.remove(KIT.snapped); delete KIT.snapped.userData.home; }
    if (D.blur && typeof renderer !== 'undefined') renderer.domElement.style.filter = '';
    D.blur = false;
    if (D.meter && typeof ui !== 'undefined') ui.meter(null, null);
    D.meter = false;
    if (D.hum) { D.hum.stop(0.3); D.hum = null; }
    if (D.song) { D.song.stop(0.6); D.song = null; }
    if (D.pop) { D.pop.close(); D.pop = null; }
    if (D.flick) { removeUpdate(D.flick); D.flick = null; }
    for (const r of D.rigs) {
      r.seated = false; r.floorSit = false;
      if (r.fade) r.fade(1, 0);
      if (r.root) r.root.rotation.set(0, 0, 0);
      if (r.show) { r.show('hood', false); r.show('santa_hat', false); }
      if (r.face && r.face.over) { r.face.over = null; if (r.face.redraw) r.face.redraw(); }
    }
    D.rigs.length = 0;
    if (D.lamp && typeof world !== 'undefined') { const s = world.torch; if (s) s.intensity = 0; world.torchAuto = true; }
    D.lamp = false;
  }
  if (typeof on === 'function') on('flow:stop', cleanup);

  // the spot as a lamp (re-asserted: a set may take it back when it is shown again)
  function lamp(c, pos, tgt, color = 0xffd6a0, power = 4, angle = 0.6) {
    const s = c.world.torch; if (!s) return;
    c.world.torchAuto = false; s.intensity = power; D.lamp = true;
    s.color.set(color); s.angle = angle; s.distance = 30; s.penumbra = 0.6;
    s.position.set(pos[0], pos[1], pos[2]); s.target.position.set(tgt[0], tgt[1], tgt[2]); s.target.updateMatrixWorld();
  }
  function lampOff(c) { const s = c.world.torch; if (s) s.intensity = 0; c.world.torchAuto = true; if (D.flick) { removeUpdate(D.flick); D.flick = null; } }

  // ============================================================ wardrobe: Luka's lanyard knotted back together
  function knotOn(c) {
    const a = act(c, 'luka'), L = a && a.rig.attach.lanyard, k = KIT.knot;
    if (!a || !L || !k) return;
    a.rig.show('lanyard', true);
    const b = L.userData.badge, s = Math.max(0.6, (b.position.y - 0.01) / 0.24);
    L.add(k); k.position.set(0.034, 0.335 * s, b.position.z - 0.006); k.rotation.set(0, 0, 0.3); k.scale.setScalar(1); k.visible = true;
    D.knot = true;
  }
  // the montage years: healed (no torn polo, no bandage), the knotted lanyard on; Chase without the 2040 headphones
  function years(c) {
    const l = act(c, 'luka');
    if (l) { l.rig.show('hurt', false); l.rig.show('bandage', false); l.rig.show('santa', false); l.rig.root.rotation.set(0, 0, 0); knotOn(c); }
    const h = act(c, 'chase');
    if (h) { h.rig.show('headphones_neck', false); h.rig.root.rotation.set(0, 0, 0); }
    touch(c, ['luka', 'chase']);
  }

  // ============================================================ INSERT cards (painted at 2x by ui.card)
  const SYS = 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
  const MONO = '"Courier New", ui-monospace, Menlo, Consolas, monospace';
  const HANDF = '"Segoe Print", "Bradley Hand", "Marker Felt", "Comic Sans MS", cursive';
  function rr(cx, x, y, w, h, r) { cx.beginPath(); cx.moveTo(x + r, y); cx.arcTo(x + w, y, x + w, y + h, r); cx.arcTo(x + w, y + h, x, y + h, r); cx.arcTo(x, y + h, x, y, r); cx.arcTo(x, y, x + w, y, r); cx.closePath(); }
  function txt(cx, s, x, y, px, col, al = 'left', w = '600', font = SYS, maxW) { cx.font = `${w} ${px}px ${font}`; cx.fillStyle = col; cx.textAlign = al; cx.textBaseline = 'middle'; if (maxW) cx.fillText(s, x, y, maxW); else cx.fillText(s, x, y); }
  function shadow(cx, b = 26, oy = 10, a = 0.4) { cx.shadowColor = `rgba(0,0,0,${a})`; cx.shadowBlur = b; cx.shadowOffsetY = oy; }
  function noShadow(cx) { cx.shadowColor = 'transparent'; cx.shadowBlur = 0; cx.shadowOffsetY = 0; }
  function pill(cx, x, y, w, h, label, lit) {
    const g = cx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, lit ? '#5aa6f2' : '#9cc4ec'); g.addColorStop(1, lit ? '#2f86e0' : '#7aa8d8');
    cx.fillStyle = g; rr(cx, x, y, w, h, h / 2); cx.fill();
    txt(cx, label, x + w / 2, y + h / 2 + 1, h * 0.46, lit ? '#ffffff' : 'rgba(255,255,255,0.8)', 'center', '700');
  }
  // 1. [INSERT] NO. — the Choice's glass pop-up, NO held down, its ring full
  CARDS.b1_no = (cx, w, h) => {
    shadow(cx, 30, 12, 0.35);
    const g = cx.createLinearGradient(0, 16, 0, h - 24); g.addColorStop(0, 'rgba(246,250,255,0.97)'); g.addColorStop(1, 'rgba(226,238,250,0.95)');
    cx.fillStyle = g; rr(cx, 16, 16, w - 32, h - 40, 40); cx.fill(); noShadow(cx);
    cx.strokeStyle = 'rgba(95,178,255,0.75)'; cx.lineWidth = 3; rr(cx, 16, 16, w - 32, h - 40, 40); cx.stroke();
    txt(cx, 'STORAGE FULL', w / 2, 74, 30, '#1c2a44', 'center', '800');
    txt(cx, '2 days, 6 hours, 54 minutes.', w / 2, 120, 24, '#3c4c6a', 'center', '600');
    pill(cx, w * 0.3 - 92, 196, 184, 64, 'YES', false);
    const px = w * 0.7, py = 228, pw = 210, ph = 74;
    cx.save(); cx.shadowColor = 'rgba(255,210,31,0.9)'; cx.shadowBlur = 28;
    cx.strokeStyle = '#ffd21f'; cx.lineWidth = 12; rr(cx, px - pw / 2 - 20, py - ph / 2 - 20, pw + 40, ph + 40, (ph + 40) / 2); cx.stroke(); cx.restore();
    pill(cx, px - pw / 2, py - ph / 2, pw, ph, 'NO', true);
    txt(cx, 'Keep the memories', w * 0.3, 296, 19, '#7d8fae', 'center', '600');
    txt(cx, 'Clear the memories', px, 300, 21, '#1c2a44', 'center', '700');
  };
  CARDS.b1_no.size = [760, 430];
  // a slate (2040's thin glass tablet): dark glass, a bezel, the screen rect
  function slateBody(cx, w, h) {
    shadow(cx, 34, 14, 0.5);
    cx.fillStyle = '#121418'; rr(cx, 20, 20, w - 40, h - 40, 34); cx.fill(); noShadow(cx);
    cx.strokeStyle = '#3a3f48'; cx.lineWidth = 3; rr(cx, 22, 22, w - 44, h - 44, 32); cx.stroke();
    const sx = 52, sy = 50, sw = w - 104, sh = h - 100;
    cx.fillStyle = '#0d1116'; rr(cx, sx, sy, sw, sh, 12); cx.fill();
    return [sx, sy, sw, sh];
  }
  // 11. [INSERT · Chase (2040)'s slate] The folder two: 2,847 files, and at the bottom one more, two.wav, the only one
  // that's finished.
  CARDS.b1_slate = (cx, w, h) => {
    const [sx, sy, sw, sh] = slateBody(cx, w, h);
    cx.fillStyle = '#1d2a36'; cx.fillRect(sx, sy, sw, 58);
    cx.fillStyle = '#6fc8ff'; rr(cx, sx + 22, sy + 16, 34, 26, 4); cx.fill(); cx.fillRect(sx + 22, sy + 12, 16, 8);
    txt(cx, 'two', sx + 72, sy + 30, 28, '#d8e6f0', 'left', '700');
    txt(cx, '2,848 items', sx + sw - 24, sy + 30, 20, '#9fb6c8', 'right', '500');
    const rows = ['two_v2840.wav', 'two_v2841.wav', 'two_v2842.wav', 'two_v2843.wav', 'two_v2844.wav', 'two_v2845_bridge.wav', 'two_v2846.wav', 'two_v2847.wav'];
    const rh = 44, y0 = sy + 74;
    for (let i = 0; i < rows.length; i++) {
      const y = y0 + i * rh;
      cx.globalAlpha = 0.25 + 0.75 * (i / rows.length);
      cx.fillStyle = '#4a5a6c'; cx.fillRect(sx + 26, y + 12, 18, 20);
      txt(cx, rows[i], sx + 58, y + 22, 21, '#9fb6c8', 'left', '500', MONO);
      txt(cx, 'unfinished', sx + sw - 26, y + 22, 17, '#5e7488', 'right', '500');
    }
    cx.globalAlpha = 1;
    const y = y0 + rows.length * rh + 8;
    cx.fillStyle = 'rgba(111,200,255,0.16)'; rr(cx, sx + 14, y, sw - 28, 52, 8); cx.fill();
    cx.strokeStyle = '#6fc8ff'; cx.lineWidth = 2; rr(cx, sx + 14, y, sw - 28, 52, 8); cx.stroke();
    cx.fillStyle = '#6fc8ff'; cx.fillRect(sx + 26, y + 15, 18, 22);
    txt(cx, 'two.wav', sx + 58, y + 26, 26, '#ffffff', 'left', '700', MONO);
    txt(cx, 'finished  ✓', sx + sw - 30, y + 26, 21, '#7ad89a', 'right', '700');
  };
  CARDS.b1_slate.size = [900, 620];
  // 48. 2029 — Chase's laptop: UNFINISHED — 640 items. Top of the list: two (not yet).
  CARDS.b1_laptop = (cx, w, h) => {
    shadow(cx, 30, 12, 0.45);
    cx.fillStyle = '#2a2d33'; rr(cx, 40, 20, w - 80, h - 110, 22); cx.fill();
    cx.fillStyle = '#3a3e46'; cx.beginPath(); cx.moveTo(10, h - 90); cx.lineTo(w - 10, h - 90); cx.lineTo(w - 50, h - 40); cx.lineTo(50, h - 40); cx.closePath(); cx.fill();
    noShadow(cx);
    const sx = 66, sy = 44, sw = w - 132, sh = h - 160;
    cx.fillStyle = '#f2f4f7'; cx.fillRect(sx, sy, sw, sh);
    cx.fillStyle = '#e1e5eb'; cx.fillRect(sx, sy, sw, 40);
    for (const [i, col] of [[0, '#ff5f57'], [1, '#febc2e'], [2, '#28c840']]) { cx.fillStyle = col; cx.beginPath(); cx.arc(sx + 22 + i * 22, sy + 20, 7, 0, PI * 2); cx.fill(); }
    txt(cx, 'UNFINISHED', sx + sw / 2, sy + 20, 18, '#5a6270', 'center', '600');
    txt(cx, 'UNFINISHED — 640 items', sx + 30, sy + 82, 34, '#1c2330', 'left', '800');
    const items = ['two (not yet)', 'untitled 639', 'untitled 638', 'bridge idea (Tuesday)', 'untitled 636', 'untitled 635', 'untitled 634'];
    for (let i = 0; i < items.length; i++) {
      const y = sy + 130 + i * 46;
      if (i === 0) { cx.fillStyle = 'rgba(255,210,31,0.45)'; cx.fillRect(sx + 20, y - 20, sw - 40, 40); }
      cx.strokeStyle = '#8a92a0'; cx.lineWidth = 2; cx.strokeRect(sx + 32, y - 9, 18, 18);
      txt(cx, items[i], sx + 66, y, i === 0 ? 27 : 23, i === 0 ? '#1c2330' : '#6a7280', 'left', i === 0 ? '700' : '500');
    }
  };
  CARDS.b1_laptop.size = [960, 660];
  // 50. 2031 — Rue's corkboard: Sundays ticked, one after another. LADS. LADS. LADS.
  CARDS.b1_cork = (cx, w, h) => {
    shadow(cx, 26, 10, 0.4);
    cx.fillStyle = '#b8875a'; rr(cx, 14, 14, w - 28, h - 28, 10); cx.fill(); noShadow(cx);
    cx.fillStyle = 'rgba(90,56,26,0.25)'; for (let i = 0; i < 260; i++) { const x = 20 + ((i * 97) % (w - 40)), y = 20 + ((i * 61) % (h - 40)); cx.fillRect(x, y, 3, 2); }
    const months = ['SEPTEMBER 2031', 'OCTOBER 2031', 'NOVEMBER 2031', 'DECEMBER 2031'];
    for (let m = 0; m < 4; m++) {
      const px = 36 + m * ((w - 72) / 4), pw = (w - 72) / 4 - 14, py = 40 + (m % 2) * 14, ph = h - 96;
      cx.save(); cx.translate(px + pw / 2, py + ph / 2); cx.rotate((m - 1.5) * 0.02); cx.translate(-(px + pw / 2), -(py + ph / 2));
      shadow(cx, 8, 3, 0.3); cx.fillStyle = '#f6f2e6'; cx.fillRect(px, py, pw, ph); noShadow(cx);
      txt(cx, months[m], px + pw / 2, py + 22, 15, '#3a3a3a', 'center', '700', SYS, pw - 10);
      for (let r = 0; r < 5; r++) for (let d = 0; d < 7; d++) {
        const x = px + 8 + d * ((pw - 16) / 7), y = py + 46 + r * ((ph - 60) / 5), cw = (pw - 16) / 7 - 2, chh = (ph - 60) / 5 - 2;
        cx.strokeStyle = 'rgba(0,0,0,0.12)'; cx.lineWidth = 1; cx.strokeRect(x, y, cw, chh);
        if (d === 6) {
          cx.strokeStyle = '#d42a1e'; cx.lineWidth = 3; cx.beginPath(); cx.moveTo(x + cw * 0.18, y + chh * 0.45); cx.lineTo(x + cw * 0.4, y + chh * 0.66); cx.lineTo(x + cw * 0.82, y + chh * 0.18); cx.stroke();
          txt(cx, 'LADS', x + cw / 2, y + chh * 0.84, Math.min(12, cw * 0.36), '#1d2f8f', 'center', '700', HANDF);
        }
      }
      cx.fillStyle = '#d8323a'; cx.beginPath(); cx.arc(px + pw / 2, py + 6, 6, 0, PI * 2); cx.fill();
      cx.restore();
    }
  };
  CARDS.b1_cork.size = [900, 600];
  // B2 4. [INSERT · the slate] Drafts. One draft fourteen years old: Re: what else have you got? to Moreton Bay Records,
  // dated December 2026, empty. Chase (2040) attaches two.wav and types: Sorry for the wait. Sent.
  // data: { stage: 0 drafts | 1 open | 2 attached | 3 typing (n chars) | 4 sent, n }
  const SORRY = 'Sorry for the wait.';
  CARDS.b2_email = (cx, w, h, d) => {
    const [sx, sy, sw, sh] = slateBody(cx, w, h), st = d.stage || 0;
    cx.fillStyle = '#1d2a36'; cx.fillRect(sx, sy, sw, 58);
    txt(cx, st === 0 ? 'Drafts' : st === 4 ? 'Sent' : 'Draft', sx + 24, sy + 30, 26, '#d8e6f0', 'left', '700');
    if (st === 0) {
      txt(cx, '1 draft', sx + sw - 24, sy + 30, 19, '#9fb6c8', 'right', '500');
      const y = sy + 84;
      cx.fillStyle = 'rgba(111,200,255,0.12)'; rr(cx, sx + 16, y, sw - 32, 118, 10); cx.fill();
      txt(cx, 'To: Moreton Bay Records', sx + 36, y + 30, 21, '#9fb6c8', 'left', '500');
      txt(cx, 'Re: what else have you got?', sx + 36, y + 66, 27, '#ffffff', 'left', '700');
      txt(cx, '(no message)', sx + 36, y + 98, 18, '#5e7488', 'left', '500');
      txt(cx, '18 December 2026', sx + sw - 36, y + 30, 19, '#9fb6c8', 'right', '500');
      return;
    }
    const L = sx + 30;
    txt(cx, 'To:', L, sy + 92, 20, '#5e7488', 'left', '600'); txt(cx, 'Moreton Bay Records', L + 56, sy + 92, 21, '#d8e6f0', 'left', '500');
    txt(cx, 'Re:', L, sy + 132, 20, '#5e7488', 'left', '600'); txt(cx, 'what else have you got?', L + 56, sy + 132, 23, '#ffffff', 'left', '700');
    cx.fillStyle = '#2a3846'; cx.fillRect(sx + 18, sy + 156, sw - 36, 2);
    if (st >= 2) {
      cx.fillStyle = 'rgba(111,200,255,0.15)'; rr(cx, L, sy + 176, 300, 54, 10); cx.fill();
      cx.strokeStyle = '#6fc8ff'; cx.lineWidth = 2; rr(cx, L, sy + 176, 300, 54, 10); cx.stroke();
      cx.strokeStyle = '#9fb6c8'; cx.lineWidth = 3; cx.beginPath(); cx.moveTo(L + 22, sy + 214); cx.lineTo(L + 22, sy + 190); cx.arc(L + 30, sy + 190, 8, PI, 0); cx.lineTo(L + 38, sy + 212); cx.stroke();
      txt(cx, 'two.wav', L + 56, sy + 203, 22, '#ffffff', 'left', '700', MONO);
      txt(cx, '1:55', L + 284, sy + 203, 18, '#9fb6c8', 'right', '500');
    }
    const typed = st === 3 ? SORRY.slice(0, d.n || 0) : st >= 4 ? SORRY : '';
    txt(cx, typed, L, sy + 284, 34, '#ffffff', 'left', '600');
    if (st === 3 || st === 1 || st === 2) { cx.font = `600 34px ${SYS}`; const tw = cx.measureText(typed).width; cx.fillStyle = '#6fc8ff'; cx.fillRect(L + tw + 4, sy + 266, 4, 38); }
    const by = sy + sh - 80;
    if (st >= 4) {
      cx.fillStyle = '#2e9d4a'; rr(cx, sx + sw - 250, by, 220, 58, 29); cx.fill();
      txt(cx, 'Sent  ✓', sx + sw - 140, by + 30, 26, '#ffffff', 'center', '800');
    } else {
      cx.fillStyle = st >= 3 && (d.n || 0) >= SORRY.length ? '#2f86e0' : '#2a3a4c'; rr(cx, sx + sw - 250, by, 220, 58, 29); cx.fill();
      txt(cx, 'Send', sx + sw - 140, by + 30, 26, '#ffffff', 'center', '700');
    }
  };
  CARDS.b2_email.size = [900, 620];

  // ============================================================ pop-ups on the Remote (SafeSense, then JARVIS crashes)
  const tall = () => innerHeight > innerWidth;
  async function clearing(c) {
    D.pop = null;
    if (sk(c)) return;
    const sid = c.flow.sceneId, w = Math.min(440, innerWidth - 24);
    if (tall()) { D.lb = true; c.ui.letterbox(false); }
    const p = c.popup({ style: 'safesense', title: 'SafeSense', icon: 'none', msg: 'Clearing 2 days, 6 hours, 54 minutes…', buttons: [], at: [0.5, 0.25], w, progress: { from: 0, to: 61, dur: 3.4 } });
    D.pop = p;
    await c.wait(3.9);
    if (c.flow.sceneId !== sid || sk(c)) return;
    p.close();
    D.pop = c.popup({ title: 'JARVIS', icon: 'error', msg: 'JARVIS has encountered Error 4044.', buttons: [], at: [0.5, 0.25], w: Math.min(420, innerWidth - 24), shake: true });
  }
  const dropPop = { do: (c) => { if (D.pop) D.pop.close(); D.pop = null; if (D.lb) c.ui.letterbox(true); D.lb = false; } };

  // ============================================================ B1 framings and blocking (hq_roof)
  const RX = -0.12, RY = 0.74, RZ = -18.86;                         // the Remote's little screen
  const toRemote = (x, z) => Math.atan2(RX - x, RZ - z);
  const ARC = { luka40: [0.91, 0, -17.51], luka: [0.18, 0, -17.73], chase: [-0.36, 0, -17.77], chase40: [-1.10, 0, -17.53] };
  for (const k in ARC) ARC[k][3] = toRemote(ARC[k][0], ARC[k][2]);
  const FOUR = ['chase', 'luka', 'luka40', 'chase40'];
  // [JARVIS-CAM] from just behind and above the Remote's screen, aimed at their eyes
  const JCAM = { shot: 'JARVIS', at: [RX, RY, RZ], from: [-0.12, 1.12, -19.5], on: FOUR, size: 'CLOSE', move: 'push', amount: 0.94, dur: 12, ease: 'linear' };
  // the pairs (each a short two-shot): the Lukas east of the Remote, the Chases west, face to face, turned a little to
  // their lens (north of them: the ring's south arc, the parapet and the city behind)
  const E_IN = [0.6, 0, -17.5, H + 0.5], E_OUT = [1.36, 0, -17.38, -H - 0.5];
  const W_IN = [-0.6, 0, -17.5, -H - 0.5], W_OUT = [-1.36, 0, -17.38, H + 0.5];
  const LENS_E = glide([1.0, 1.56, -19.55], [1.0, 1.42, -17.42], 36, [1.0, 1.55, -19.25], null, 36, 9);
  const LENS_W = glide([-1.0, 1.56, -19.55], [-1.0, 1.42, -17.42], 36, [-1.0, 1.55, -19.25], null, 36, 9);
  const LENS_E_TIGHT = glide([0.98, 1.62, -19.05], [0.98, 1.42, -17.44], 44, [0.98, 1.6, -18.9], [0.98, 1.42, -17.44], 42, 6);
  // [WIDE · the roof] low, from outside the ring to the north-west
  const WIDE_LOW = glide([-3.7, 1.95, -21.9], [0.0, 1.15, -17.5], 44, [-3.45, 1.9, -21.55], [0.0, 1.15, -17.5], 44, 9);
  // the call
  const DIAL = { luka: [-0.68, 0, -18.12, toRemote(-0.68, -18.12)], luka40: [1.45, 0, -17.95, toRemote(1.45, -17.95)], chase40: [-1.25, 0, -17.55, toRemote(-1.25, -17.55)] };
  // [MID] over his shoulder at the Remote: his hands on the brick phone (the set's pre-call check lens, as 3.7's)
  const DIAL_MID = lensPush('s37_check', 0.84, 7);
  const SPLIT_L = { shot: 'INSERT', at: 'a1_split_roof', move: 'push', amount: 0.9, dur: 30, ease: 'linear' };
  const SPLIT_L_PUSH = glide([-0.2, 1.42, -20.75], [-0.3, 0.95, -18.0], 46, [-0.2, 1.38, -20.5], [-0.3, 0.95, -18.0], 46, 6);
  const SPLIT_R = { shot: 'INSERT', at: 'a1_split_store' };
  const LUKE_MID = { shot: 'CAM', half: 'right', pos: [6.3, 1.85, -7.4], look: [7.05, 1.47, -9.95], fov: 34, to: { pos: [6.4, 1.82, -7.75], look: [7.05, 1.49, -9.95], fov: 34 }, dur: 10, ease: 'linear' };   // a little above the till and the monitor

  // ============================================================ SCENE B1 — "Again"
  function dressB1(c) {
    cleanup(); D.active = true;
    const f = c.state.flags;
    f.hurt = true; f.lanyard_snapped = true; f.bandaged = true; delete f.santa;
    c.state.choice = 'B';
    for (const id of FOUR) {
      const a = act(c, id);
      if (!a) continue;
      a.rig.dress(c.state); a.visible = true; a.rig.root.rotation.set(0, 0, 0);
      if (id === 'luka40') a.rig.show('hood', false);
    }
    touch(c, FOUR);
    const s = SETS.hq_roof;
    if (s && s.dress) s.dress('golden37');
    const ring = ud(c, 'ring'); if (ring) { ring.level(1, 0); ring.flicker(true); ring.pulse(0); ring.flare(0, 0); }
    const w = ud(c, 'whiteout'); if (w && w.reset) w.reset();
    const rg = ud(c, 'remote_rig'); if (rg) { rg.screen('check'); rg.trill(false); }
    if (s && s.lamp) s.lamp('ring');
    home(c, KIT.snapped);
    // the split's right half and home: build reddy26 behind the first shots
    c.world.liveMax = 3;
    c.world.prebuild('reddy26');
  }
  SCENES.B1 = {
    title: 'Again', set: 'hq_roof', env: 'golden', timeCard: false,
    playable: [], swap: false, music: 'lofi', hud: null,
    spawn: { luka: ARC.luka, chase: ARC.chase, luka40: ARC.luka40, chase40: ARC.chase40 },
    steps: [
      ['do', dressB1],
      ['cutscene', 'B1_no'],
      ['cutscene', 'B1_goodbyes'],
      ['cutscene', 'B1_call'],
      ['cutscene', 'B1_home'],
      ['cutscene', 'B1_floor'],
      ['cutscene', 'B1_again'],
    ],
    grants: { flags: { hurt: true, lanyard_snapped: true, bandaged: true, santa: false }, choice: 'B' },
  };

  // ------------------------------------------------------------ "B1_no": NO; Clearing…; Error 4044; Let them wonder
  CUTSCENES.B1_no = [
    put('luka', ARC.luka), put('chase', ARC.chase), put('luka40', ARC.luka40), put('chase40', ARC.chase40),
    up([['luka', 'hurt_stand'], ['chase', 'idle'], ['luka40', 'idle'], ['chase40', 'idle']]),
    { expr: [['luka', 'worried'], ['chase', 'worried'], ['luka40', 'still'], ['chase40', 'still']] },
    { do: (c) => { const rg = ud(c, 'remote_rig'); if (rg) rg.screen('check'); } },
    // 1. [INSERT] NO.
    { shot: 'INSERT', at: 's37_hands', card: ['b1_no', {}] },
    sfx('ss_chirp', { vol: 0.25, rate: 0.9 }),
    { wait: 2.2 },
    // 2. [JARVIS-CAM] The pop-up: Clearing 2 days, 6 hours, 54 minutes… A progress bar. Then: JARVIS has encountered
    // Error 4044.
    JCAM,
    { wait: 0.4 },
    { do: (c) => { clearing(c); } },
    { expr: [['chase', 'sad'], ['luka', 'sad']] },
    { wait: 4.1 },
    { do: (c) => { const rg = ud(c, 'remote_rig'); if (rg) rg.screen('off'); } },
    { expr: [['luka', 'stunned'], ['chase', 'stunned']] },
    { wait: 1.2 },
    // 3. (a small laugh)
    { expr: [['luka', 'fond']] },
    { act: [['luka', 'laugh', { dur: 1.0, loop: false }]] },
    say('luka', 'Error 4044.'),
    // 4.
    { expr: [['chase', 'fond']] },
    say('chase', 'Forgets who you are.'),
    // 5.
    say('luka', 'Then forgets who it is.'),
    dropPop,
    // (they turn to each other: the Lukas east of the Remote, the Chases west)
    put('luka', E_IN), put('luka40', E_OUT), put('chase', W_IN), put('chase40', W_OUT),
    up([['luka', 'hurt_stand'], ['luka40', 'idle'], ['chase', 'idle'], ['chase40', 'idle']]),
    { expr: [['chase', 'neutral'], ['chase40', 'still'], ['luka', 'neutral'], ['luka40', 'still']] },
    // 6.
    LENS_W,
    { wait: 0.5 },
    say('chase', 'Should we leave ourselves something? ^ Like last time? A tape?'),
    // 7.
    CLOSE('chase40', { yaw: 0.55, dist: 1.05, push: 0.08, dur: 5, fov: 34 }),
    say('chase40', 'No.'),
    // 8.
    CLOSE('chase', { yaw: -0.55, dist: 1.0, push: 0.06, dur: 4, fov: 34 }),
    { expr: [['chase', 'worried']] },
    say('chase', 'Why not?'),
    // 9.
    { expr: [['chase40', 'sad']] },
    CLOSE('chase40', { yaw: 0.55, dist: 1.1, push: 0.2, dur: 12, fov: 34 }),
    slow('chase40', "Because if you leave a tape, you'll know. ^ And if you know, you won't get here."),
    // 10.
    { expr: [['luka40', 'still']] },
    CLOSE('luka40', { yaw: -0.7, dist: 1.1, push: 0.12, dur: 7, fov: 34 }),
    { wait: 0.6 },
    slow('luka40', 'Let them wonder.'),
    { wait: 0.8 },
    // 11. [INSERT · Chase (2040)'s slate] (Everything on Chase's 2026 phone is about to be cleared. This copy stays in
    // 2040.)
    up([['chase40', 'b1_slate']]),
    { expr: [['chase40', 'still'], ['chase', 'sad']] },
    { shot: 'CAM', pos: [-1.0, 1.75, -17.95], look: [-1.32, 1.12, -17.2], fov: 40, card: ['b1_slate', {}] },
    sfx('ss_chirp', { vol: 0.12, rate: 1.3 }),
    { wait: 3.6 },
    // 12-17. The two Chases (a mirror: the same posture, fourteen years apart)
    up([['chase40', 'idle']]),
    LENS_W,
    { wait: 0.5 },
    say('chase', 'Look after it.'),
    say('chase40', 'I will.'),
    say('chase', 'Put it out.', { expr: 'determined' }),
    say('chase40', 'I will.'),
    CLOSE('chase', { yaw: -0.55, dist: 1.0, push: 0.08, dur: 5, fov: 34 }),
    say('chase', 'And finish the next one.'),
    { expr: [['chase40', 'fond']] },
    CLOSE('chase40', { yaw: 0.55, dist: 1.0, push: 0.06, dur: 5, fov: 34 }),
    { wait: 0.4 },
    say('chase40', '…Don\'t push it.'),
    { expr: [['chase', 'fond']] },
    LENS_W,
    { wait: 1.0 },
  ];

  // ------------------------------------------------------------ "B1_goodbyes" (18-26)
  function offer(c) {
    const a = act(c, 'luka'), o = KIT.snapped;
    if (!a || !o) return;
    if (!o.userData.home) home(c, o);
    o.visible = true; a.hold(o, 'L');
    o.rotation.set(0, 0, 0);
  }
  function stow(c) {
    const a = act(c, 'luka'), o = KIT.snapped;
    if (a && o && a.held === o) a.hold(null);
    if (o) o.visible = false;
  }
  CUTSCENES.B1_goodbyes = [
    { popup: null, clear: true },
    put('luka', E_IN), put('luka40', E_OUT), put('chase', W_IN), put('chase40', W_OUT),
    up([['luka', 'hurt_stand'], ['luka40', 'idle'], ['chase', 'idle'], ['chase40', 'idle']]),
    { expr: [['luka', 'sad'], ['luka40', 'still'], ['chase', 'sad'], ['chase40', 'still']] },
    { wait: 0.05 },
    // 18. (to Luka)
    LENS_E,
    { wait: 0.5 },
    slow('luka40', "It's a long way."),
    // 19.
    CLOSE('luka', { yaw: 0.6, dist: 1.0, push: 0.14, dur: 8, fov: 34 }),
    { expr: [['luka', 'fond']] },
    say('luka', "It's a phone call. ^ A minute at a time."),
    // 20.
    { expr: [['luka40', 'sad']] },
    CLOSE('luka40', { yaw: -0.7, dist: 1.05, push: 0.12, dur: 8, fov: 34 }),
    slow('luka40', "You're going to go back in. Into the fire."),
    // 21.
    CLOSE('luka', { yaw: 0.6, dist: 1.0, push: 0.08, dur: 5, fov: 34 }),
    { expr: [['luka', 'still']] },
    say('luka', 'I know.'),
    // 22.
    LENS_E,
    slow('luka40', "And then you're going to walk out the back."),
    // 23.
    CLOSE('luka', { yaw: 0.6, dist: 1.0, push: 0.18, dur: 11, fov: 34 }),
    { expr: [['luka', 'fond']] },
    slow('luka', "I know. ^ And then I'm going to come up here, and he's going to bring me a song."),
    { wait: 0.4 },
    // 24. (to Chase)
    { expr: [['chase40', 'sad']] },
    LENS_W,
    { wait: 0.4 },
    slow('chase40', "You're going to be me for a while. ^ I'm sorry."),
    // 25.
    CLOSE('chase', { yaw: -0.6, dist: 1.0, push: 0.12, dur: 9, fov: 34 }),
    { expr: [['chase', 'fond']] },
    say('chase', "Don't be. ^ You turned out all right. ^ Eventually."),
    { expr: [['chase40', 'fond']] },
    LENS_W,
    { wait: 1.2 },
    // 26. (to Luka, as Luka reaches for his snapped lanyard) — he holds it out to him; Future Luka closes his fingers
    // back round it
    { expr: [['luka', 'sad'], ['luka40', 'still']] },
    { do: offer },
    { act: [['luka', 'b1_offer', { k: 0 }]] },
    LENS_E_TIGHT,
    { do: (c) => { const a = act(c, 'luka'); if (!a) return; a.p.k = 0; tween(c, 1.4, (u) => { a.p.k = u; }); } },
    { wait: 1.8 },
    { act: [['luka40', 'b1_cover']] },
    { wait: 0.5 },
    slow('luka40', 'Keep your lanyard.'),
    { act: [['luka', 'b1_clutch'], ['luka40', 'idle']] },
    { expr: [['luka', 'fond'], ['luka40', 'fond']] },
    { wait: 1.4 },
    { do: stow },
    { act: [['luka', 'hurt_stand']] },
  ];

  // ------------------------------------------------------------ "B1_call": exactly as A1 steps 19-25; white
  // (Luke's cheap Santa hat: his rig's fitted santa_hat attachment; every spawn's dress() takes it off again)
  function hatOn(c) {
    const a = act(c, 'luke');
    if (a) a.rig.show('santa_hat', true);
    touch(c, ['luke']);
  }
  function storeSide(c) {
    const S = SETS.reddy26;
    if (S && S.dress) S.dress('home');
    const fl = ud(c, 'fairy_lights', 'reddy26'); if (fl && fl.power) fl.power(1.3);
    const ph = ud(c, 'store_phone', 'reddy26'); if (ph && ph.ring) ph.ring(false);
    const lk = c.world.spawn('luke', 'a1_luke_count', { set: 'reddy26' });
    if (lk) { lk.place('a1_luke_count'); lk.visible = true; lk.setExpr('tired'); lk.play('type'); }
    hatOn(c);
  }
  // the counter phone rings twice (the 2026 landline's double trill, as in 1.2: the set plays it at the phone)
  async function storeRings(c) {
    const sid = c.flow.sceneId, ph = ud(c, 'store_phone', 'reddy26');
    if (ph && ph.ring) ph.ring(true, { sfx: 'trill', every: 2.0, vol: 0.4, max: 2 });
    for (let i = 0; i < 2 && !sk(c); i++) {
      await c.wait(2.0);
      if (c.flow.sceneId !== sid) return;
      if (i === 0) { const lk = act(c, 'luke'); if (lk) { lk.play('look_up'); lk.setExpr('neutral'); } }
    }
  }
  function lukeAnswers(c) {
    const ph = P(c, 'store_phone', 'reddy26'), lk = act(c, 'luke');
    if (ph && ph.userData.ring) ph.userData.ring(false);
    if (!lk) return;
    if (ph) lk.hold(ph, 'R');
    lk.play('phone_bare'); lk.setExpr('tired');
  }
  function pour(c) {
    const ring = ud(c, 'ring', 'hq_roof'), w = ud(c, 'whiteout', 'hq_roof'), rg = ud(c, 'remote_rig', 'hq_roof');
    if (ring) { ring.pulse(1); ring.flare(0.85, 1.8); }
    if (rg) { rg.trill(false); rg.screen('white'); }
    if (w && w.pour) w.pour(4.2);
    c.world.env('whiteout', sk(c) ? 0 : 5.5, 'hq_roof');
  }
  // Luka and Chase fade into it: gone when the white reaches them
  function goneWhite(c) { for (const id of ['luka', 'chase']) { const a = act(c, id); if (a && a.set && a.set.id === 'hq_roof') a.visible = false; } }
  CUTSCENES.B1_call = [
    put('chase', 'a1_dial'), put('luka', DIAL.luka), put('luka40', DIAL.luka40), put('chase40', DIAL.chase40),
    up([['luka', 'hurt_stand'], ['luka40', 'idle'], ['chase40', 'idle'], ['chase', 'kneel_work', { h: 0.72, z: 0.43 }]]),
    { expr: [['chase', 'determined'], ['luka', 'worried'], ['luka40', 'still'], ['chase40', 'still']] },
    { do: (c) => { const rg = ud(c, 'remote_rig'); if (rg) rg.screen('call'); } },
    // 19. [MID] Chase dials on the brick phone. The double trill.
    DIAL_MID,
    { wait: 0.6 },
    sfx('key_beep', { vol: 0.3, at: [0.1, 0.72, -18.9] }), { wait: 0.22 }, sfx('key_beep', { vol: 0.3, rate: 1.1, at: [0.1, 0.72, -18.9] }), { wait: 0.22 },
    sfx('key_beep', { vol: 0.3, rate: 0.95, at: [0.1, 0.72, -18.9] }), { wait: 0.22 }, sfx('key_beep', { vol: 0.3, rate: 1.05, at: [0.1, 0.72, -18.9] }), { wait: 0.4 },
    { do: (c) => { const rg = ud(c, 'remote_rig'); if (rg) rg.trill(true); const ring = ud(c, 'ring'); if (ring) ring.pulse(0.4); } },
    sfx('trill', { vol: 0.45 }),
    { wait: 1.3 },
    // [SPLIT SCREEN] Left: the 2040 roof at golden hour, four men and a ring of yellow drones. Right: Optus Redcliffe,
    // Thursday 24 December 2026, 18:58. The store is closed. Christmas lights are on. A new Hero Table stands where the
    // old one was, still in its plastic. Luke, alone, in a Santa hat, is doing the end-of-day count. The counter phone rings.
    { do: storeSide },
    { split: { left: { shot: SPLIT_L }, right: { set: 'reddy26', shot: SPLIT_R, env: 'evening' } }, slide: true },
    { timeCard: 'Thursday 24 December 2026, 18:58', place: 'Optus Redcliffe' },
    { wait: 0.8 },
    { do: storeRings },
    { do: lukeAnswers },
    sfx('clunk', { vol: 0.25 }),
    { split: { right: { set: 'reddy26', shot: LUKE_MID } } },
    { wait: 0.6 },
    // 20.
    say('luke', 'Optus Redcliffe. ^ We\'re closed.'),
    // 21.
    say('operator', 'You have a reverse-charge call from Chase and Luka, Optus Redcliffe. ^ 2040. ^ Will you accept the charges?', { tag: 'down the line' }),
    // 22. [RIGHT HALF · CLOSE · Luke] A very long sigh.
    { do: (c) => { closeOn(c, 'luke', { half: 'right', yaw: 0.35, dist: 1.15, push: 0.14, dur: 8, fov: 38 }); } },
    { act: [['luke', 'b1_sigh', { dur: 2.8, loop: false }]] },
    { wait: 3.2 },
    // 23.
    say('luke', '…Is it them?'),
    // 24.
    say('operator', 'Please answer yes or no.', { tag: 'down the line' }),
    // 25.
    { expr: [['luke', 'fond']] },
    say('luke', 'Yes. ^ Obviously yes.'),
    // White. (The white pours across the roof from the Remote; Luka and Chase fade into it; the split closes.)
    { music: null, fade: 4 },
    { split: { left: { shot: SPLIT_L_PUSH } } },
    sfx('flash_hum', { vol: 0.5 }),
    { do: pour },
    { wait: 2.4 },
    { do: goneWhite },
    { wait: 0.8 },
    { split: null, slide: true },
    { wait: 1.2 },
    { fade: 'out', dur: 1.0, color: '#fff' },
  ];

  // ------------------------------------------------------------ "B1_home" (27-42): Rue's Act One frame, no memories
  const FLOOR_L = [5.85, 0, -27.25, 0.0], FLOOR_C = [6.85, 0, -27.25, 0.0];
  // [TOP-DOWN] turned a quarter: the two of them lying across the wide frame, heads to the right, Luka above Chase (the
  // dialogue box clear of them), feet to the shoes: it reads as two men on a floor, not two men against a wall
  const TOP_TWO = glide([6.57, 2.7, -27.55], [6.55, 0.0, -27.55], 56, [6.57, 2.55, -27.55], [6.55, 0.0, -27.55], 54, 12);
  const TOP_LUKA = glide([5.87, 1.45, -27.8], [5.85, 0.0, -27.8], 42, [5.87, 1.32, -27.8], [5.85, 0.0, -27.8], 42, 8);   // (the same way up)
  // Luke's eyeline: over his shoulder in the doorway, down onto the two of them on the floor
  const FROM_DOOR = glide([6.88, 1.92, -24.12], [6.3, 0.15, -27.3], 46, [6.86, 1.9, -24.2], [6.3, 0.15, -27.3], 44, 6);
  // from the floor up at Luke in the doorway: on his right, so his mug hand is the far one
  const UP_AT_LUKE = glide([6.62, 0.45, -26.4], [6.4, 1.6, -24.55], 40, [6.6, 0.45, -26.2], [6.4, 1.6, -24.55], 38, 6);
  // [CLOSE · Luka's hand] on his chest: the lanyard, snapped and knotted back together (aimed at the knot, read at step
  // time: from above and a little toward his feet, his hand and the badge in frame)
  const HAND_CHEST = { do: (c) => {
    if (sk(c) || !KIT.knot || !KIT.knot.parent) return;
    KIT.knot.getWorldPosition(V1);
    c.cam.shot({ shot: 'CAM', pos: [V1.x + 0.1, V1.y + 0.62, V1.z + 0.34], look: [V1.x, V1.y - 0.02, V1.z + 0.04], fov: 38,
      to: { pos: [V1.x + 0.09, V1.y + 0.52, V1.z + 0.29], look: [V1.x, V1.y - 0.02, V1.z + 0.04], fov: 36 }, dur: 6, ease: 'linear' });
  } };
  function dressHome(c) {
    const S = SETS.reddy26;
    if (S && S.dress) S.dress('home');
    const sm = ud(c, 'smoke_backroom', 'reddy26'); if (sm && sm.amount) sm.amount(1, 0);
    const d = P(c, 'backroom_door', 'reddy26'); if (d) { d.rotation.y = 0; d.userData.open = false; }
    const lk = act(c, 'luke');
    if (lk) { if (lk.held) lk.hold(null); lk.place('a1_luke_door'); lk.play('idle'); lk.setExpr('stunned'); lk.visible = false; }
    hatOn(c);
    for (const [id, at] of [['luka', FLOOR_L], ['chase', FLOOR_C]]) {
      const a = act(c, id);
      if (!a) continue;
      a.rig.dress(c.state); a.visible = false; a.place(at); a.play('b1_lie'); a.setExpr('sleep');
    }
    knotOn(c);   // (knotted back together somewhere they don't remember)
    touch(c, ['luka', 'chase', 'luke']);
  }
  // they come up out of the smoke as A1's do (rig.fade from nothing; the originals back at the end)
  function arrive(c) {
    const sm = ud(c, 'smoke_backroom', 'reddy26'), tb = ud(c, 'tube', 'reddy26');
    if (sm && sm.amount) sm.amount(0.12, sk(c) ? 0 : 4.5);
    if (tb && tb.flicker && !sk(c)) tb.flicker(4);
    const rigs = [];
    for (const id of ['luka', 'chase']) { const a = act(c, id); if (a) { if (a.rig.fade) { rigs.push(a.rig); a.rig.fade(0, 0.7); } a.visible = true; } }
    tween(c, 3.2, (u) => { for (const r of rigs) r.fade(u, 0.7 * (1 - u) * (1 - u)); if (u >= 1) for (const r of rigs) r.fade(1, 0); });
  }
  function bang(c) {
    const d = ud(c, 'backroom_door', 'reddy26'); if (d && d.bang) d.bang();
    const lk = act(c, 'luke'); if (lk) { lk.visible = true; lk.place('a1_luke_door'); lk.setExpr('stunned'); }
  }
  CUTSCENES.B1_home = [
    // 27. [WIDE · locked, the backroom, Thursday 24 December 2026, 18:58] The same frame as A1 step 37 (the exact frame
    // that ended Rue's Act One). Smoke clears. Two men on the floor.
    { set: 'reddy26', env: 'evening', spawn: { luka: FLOOR_L, chase: FLOOR_C, luke: 'a1_luke_door' } },
    { do: dressHome },
    { music: null, cut: true },
    { hud: null },
    { shot: 'INSERT', at: 'backroom_wide', locked: true },
    { fade: 'in', dur: 1.6 },
    { do: (c) => { const tb = ud(c, 'tube', 'reddy26'); if (tb && tb.flicker && !sk(c)) tb.flicker(3); } },
    { wait: 1.4 },
    { do: arrive },
    sfx('smoke_pop', { vol: 0.2 }),
    { wait: 3.6 },
    // 28. [TOP-DOWN] (The signal fills to four bars: they're home.)
    TOP_TWO,
    { hud: { noService: false, quiet: null, samples: false, bars: 0 } },
    { wait: 1.2 },
    { expr: [['luka', 'tired'], ['chase', 'tired']] },
    { hud: { bars: 4 }, anim: 2.4 },
    { wait: 1.4 },
    // 29.
    { act: [['chase', 'b1_lie', { turn: 0.6 }]] },
    { expr: [['chase', 'worried']] },
    say('chase', '…Why are we on the floor?'),
    // 30.
    { act: [['luka', 'b1_lie', { turn: -0.6 }]] },
    { expr: [['luka', 'suspicious']] },
    say('luka', 'Why do you smell like a— ^ …like a storm?'),
    // 31. [CLOSE · Luka's hand] It goes to his chest. His lanyard is there, snapped and knotted back together. He doesn't
    // know why.
    { act: [['luka', 'b1_lie', { hand: true, turn: -0.2, look: 0.25 }]] },
    { expr: [['luka', 'still']] },
    HAND_CHEST,
    { wait: 3.0 },
    // 32. [WIDE] The door bangs open. Luke, in a Santa hat.
    { shot: 'INSERT', at: 'home_door' },
    { do: bang },
    sfx('wall_hit', { vol: 0.4 }),
    { act: [['luka', 'b1_lie', { look: 1, hand: true }], ['chase', 'b1_lie', { look: 1 }]] },
    { expr: [['luka', 'stunned'], ['chase', 'stunned']] },
    { wait: 0.7 },
    // 33.
    say('luke', 'Where have you two BEEN?'),
    // 34.
    FROM_DOOR,
    { expr: [['luka', 'sheepish']] },
    say('luka', '…Lunch?'),
    // 35.
    UP_AT_LUKE,
    { expr: [['luke', 'determined']] },
    say('luke', 'For TWO DAYS?'),
    // 36.
    FROM_DOOR,
    { expr: [['luka', 'determined']] },
    say('luka', 'It was me.'),
    // 37.
    UP_AT_LUKE,
    { expr: [['luke', 'suspicious']] },
    say('luke', 'What was?'),
    // 38.
    TOP_LUKA,
    say('luka', 'Whatever it was. It was my call.'),
    // 39. (Chase looks at Luka. A beat.)
    TOP_TWO,
    { act: [['chase', 'b1_lie', { turn: 0.75, look: 0.3 }]] },
    { expr: [['chase', 'neutral']] },
    { wait: 1.2 },
    // 40.
    say('chase', '…It was both of us.'),
    // 41. (Luke and Luka both look at Chase.)
    { act: [['luka', 'b1_lie', { turn: -0.75, look: 0.3, hand: true }]] },
    { expr: [['luka', 'stunned']] },
    { wait: 1.0 },
    UP_AT_LUKE,
    { expr: [['luke', 'stunned']] },
    { wait: 1.0 },
    // 42.
    TOP_TWO,
    { expr: [['chase', 'sheepish']] },
    say('chase', 'Dunno. ^ Felt right.'),
    { wait: 1.2 },
    { fade: 'out', dur: 1.2 },
  ];

  // ------------------------------------------------------------ "B1_floor" (43-46): later, the dark shop floor
  // the hum: Chase humming the bridge of "two" (D -> F#, the motif turned upward), low, without noticing
  const HUM_N = [[0.891, 1.5], [1.122, 2.4], [0, 1.1], [0.891, 1.3], [1.122, 2.2], [1.0, 0.9], [0, 1.4]];
  async function hum(c) {
    if (sk(c) || !c.AUDIO || !c.AUDIO.loop) return;
    const sid = c.flow.sceneId;
    if (D.hum) D.hum.stop(0.1);
    const h = D.hum = c.AUDIO.loop('hum_voice', { vol: 0, fade: 0.05, rate: 0.891, at: [6.9, 1.6, -9.0] });
    for (let k = 0; k < 40; k++) {
      const [r, d] = HUM_N[k % HUM_N.length];
      if (r) { h.rate(r); h.vol(0.5); } else h.vol(0);
      await c.wait(d);
      if (c.flow.sceneId !== sid || sk(c) || D.hum !== h) break;
    }
    if (D.hum === h) { h.stop(0.4); D.hum = null; }
  }
  function humStop(c) { if (D.hum) { D.hum.stop(0.8); D.hum = null; } }
  // the SHINE meter climbing to 98% (the 1.1 polish meter's words); one string per whole percent, no per-tick garbage
  const SHINE = []; for (let i = 0; i <= 100; i++) SHINE.push('SHINE ' + i + '%');
  function shine(c) {
    if (sk(c)) return;
    D.meter = true;
    let last = -1;
    tween(c, 3.2, (u) => { const p = Math.round(84 + 14 * u); if (p !== last) { last = p; c.ui.meter(SHINE[p], p / 100); } });
  }
  const meterOff = { do: (c) => { c.ui.meter(null, null); D.meter = false; } };
  // the one smudge he leaves: on the glass in front of him, scaled up to read (as 1.1's)
  const SMUDGE_AT = [5.78, -5.62, 2.2];
  function dressFloor(c) {
    const S = SETS.reddy26;
    if (S && S.dress) S.dress('home_night');
    const t = ud(c, 'hero_table', 'reddy26');
    if (t) { if (t.set) t.set('new'); if (t.smudge1At) t.smudge1At(SMUDGE_AT[0], SMUDGE_AT[1], SMUDGE_AT[2]); if (t.smudge1) t.smudge1(true); }
    const lk = act(c, 'luke'); if (lk) { lk.visible = false; lk.rig.show('santa_hat', false); }
    const l = act(c, 'luka'), h = act(c, 'chase');
    if (l) { l.rig.root.rotation.set(0, 0, 0); l.rig.seated = false; l.place('b1_luka_polish'); l.play('polish', { h: 0.95 }); l.setExpr('still'); l.visible = true; knotOn(c); }
    // on the counter's front edge (the till behind him), his feet down the customer side
    if (h) { h.place(CHASE_SIT); h.play('sit', { h: 1.0 }); h.play('hum'); h.setExpr('hum'); h.visible = true; }
    // the table's downlight from the customer side: Luka's face over the glass, Chase on the counter behind
    lamp(c, [5.7, 3.05, -4.7], [6.3, 0.9, -7.6], 0xfff2d6, 4.2, 0.8);
    touch(c, ['luka', 'chase']);
  }
  const CHASE_SIT = [6.95, 0, -8.72, 0];
  // [WIDE] from the store's right side, so the table (Luka) and the counter (Chase) don't line up
  const FLOOR_WIDE = glide([8.8, 1.65, -2.6], [6.2, 1.15, -7.7], 46, [8.6, 1.6, -3.0], [6.2, 1.15, -7.7], 44, 14);
  const FLOOR_WIDE2 = glide([8.6, 1.6, -3.0], [6.2, 1.15, -7.7], 44, [8.4, 1.58, -3.3], [6.2, 1.15, -7.7], 43, 8);
  // [CLOSE] the smudge on the glass, from the customer side and above: his cloth hand stopped beside it
  const SMUDGE = glide([5.86, 1.62, -4.62], [5.8, 0.95, -5.66], 36, [5.85, 1.55, -4.72], [5.8, 0.95, -5.66], 34, 7);
  CUTSCENES.B1_floor = [
    // 43. [WIDE · later, the dark shop floor] Luke has gone. Luka stands at the new Hero Table with a cloth. Chase sits
    // on the counter, humming a melody, the bridge of "two", without noticing.
    { set: 'reddy26', env: 'night', spawn: { luka: 'b1_luka_polish', chase: CHASE_SIT } },
    { do: dressFloor },
    { hud: null },
    FLOOR_WIDE,
    { fade: 'in', dur: 1.4 },
    { do: (c) => { hum(c); } },
    { wait: 4.0 },
    // 44.
    { act: [['luka', 'idle']] },
    glance('luka', 'chase', 2.2),
    { expr: [['luka', 'neutral']] },
    say('luka', "What's that?"),
    // 45.
    { do: humStop },
    { act: [['chase', 'sit', { h: 1.0 }]] },
    { expr: [['chase', 'neutral']] },
    CLOSE('chase', { yaw: 0.25, dist: 1.25, push: 0.1, dur: 8, fov: 36 }),
    say('chase', '…Dunno. ^ Something I\'m working on.'),
    // 46. (Luka polishes. At 98% he stops at a smudge, looks at it for a while, and leaves it. He doesn't know why.)
    { act: [['luka', 'polish', { h: 0.95 }], ['chase', 'hum']] },
    { expr: [['luka', 'still'], ['chase', 'hum']] },
    { do: (c) => { hum(c); } },
    lensPush('a2_polish', 0.86, 9),
    { do: shine },
    { wait: 3.4 },
    { act: [['luka', 'look_down']] },
    { expr: [['luka', 'neutral']] },
    SMUDGE,
    { wait: 3.0 },
    meterOff,
    { act: [['luka', 'idle']] },
    FLOOR_WIDE2,
    { wait: 2.6 },
    { do: humStop },
    { fade: 'out', dur: 1.0 },
  ];

  // ------------------------------------------------------------ "B1_again": the montage, held frames, the loop
  // Each frame: under black, cut the set (prebuilt in the black before), dress it, build the next frame's set (awaited,
  // so the hitch is in the black too), up from black with a small date card; ~2.5 s; at most one line.
  function card(c, time, place) { if (!sk(c)) c.ui.timeCard(time, place || '', 2.9); }
  function pre(id) {
    return { do: (c) => {
      const p = c.world.prebuild(id);
      if (sk(c)) return;
      let ok = false; p.then(() => { ok = true; });
      const t0 = clock.t;
      return waitUntil(() => ok || c.flow.skipping || clock.t - t0 > 5);
    } };
  }
  const dip = { fade: 'out', dur: 0.32 };
  const rise = { fade: 'in', dur: 0.32 };
  const S26 = (st, o) => { const S = SETS.reddy26; if (S && S.dress) S.dress(st, o || {}); };
  // 47. 2027 (low from the staff aisle: Luka up the ladder against the Yes wall, Jordan looking up at him)
  const LADDER27 = lensPush('a2_ladder', 0.94, 4);   // the set's frame for A2's ladder too: the same frame, roles reversed
  function f2027(c) {
    S26('xmas27');
    const l = act(c, 'luka'), h = act(c, 'chase'), j = act(c, 'jordan');
    years(c);
    if (h) h.visible = false;
    if (l) { l.visible = true; l.place('b27_luka_top'); l.play('reach_up'); l.setExpr('determined'); }
    if (j) { j.visible = true; j.place('b27_jordan'); j.play('idle'); j.setExpr('worried'); }
    lampOff(c);
    touch(c, ['jordan']);
  }
  // 48. 2029 (the laptop on the backroom bench)
  function f2029(c) {
    for (const id of ['luka', 'chase', 'jordan']) { const a = act(c, id); if (a) a.visible = false; }
  }
  // 49. 2031 the poster
  function f2031a(c) { const S = SETS.parade; if (S && S.dress) S.dress('festival31'); }
  // 50. 2031 Rue's corkboard (no people: nobody is home)
  function f2031b(c) { const S = SETS.rue_house; if (S && S.dress) S.dress('cork31'); }
  // 51. 2033 Woody Point jetty, sunset (the face-down photo)
  // the photo's angle (3.5's face-down photo): in front of them on the jetty, the two of them mid-laugh
  const JETTY33 = glide([-273.55, 0.62, 24.55], [-274.05, 0.42, 21.75], 40, [-273.6, 0.6, 24.3], [-274.05, 0.42, 21.75], 38, 4);
  function f2033(c) {
    const S = SETS.parade; if (S && S.dress) S.dress('sunset33');
    years(c);
    for (const [id, m] of [['luka', 'b1_33_luka'], ['chase', 'b1_33_chase']]) {
      const a = act(c, id); if (!a) continue;
      a.visible = true; a.rig.seated = false; a.place(m); a.play('laugh_big'); a.setExpr('laugh');
    }
  }
  function blur(c, on) {
    if (typeof renderer === 'undefined') return;
    if (on && sk(c)) on = false;
    renderer.domElement.style.filter = on ? 'blur(1.6px)' : '';
    D.blur = !!on;
  }
  // 52. 2034, Sunday 24 December, 6:00 am: the store's front glass, grey storm light, Luka on the phone
  const STORM34 = { bg: 0x59626e, fog: [0x59626e, 0.035], hemi: [0x8e9aaa, 0x2a2c30, 0.55], dir: [0xb8c6d8, 0.55, [-4, 8, 10]], spot: [0xffffff, 0], rain: 0 };
  const PHONE34 = glide([-3.75, 1.58, -0.95], [-5.0, 1.62, -0.52], 34, [-3.85, 1.58, -0.9], [-5.0, 1.62, -0.52], 33, 4);
  function f2034a(c) {
    S26('home');
    c.world.env(STORM34, 0);
    const l = act(c, 'luka');
    years(c);
    for (const id of ['chase', 'jordan']) { const a = act(c, id); if (a) a.visible = false; }
    if (l) { l.visible = true; l.place([-5.0, 0, -0.55, H]); l.play('phone'); l.setExpr('worried'); }
  }
  // 53. 2034 — Smoke. A hand. A lanyard. (the backroom full of smoke, firelight flickering)
  const SMOKE34 = glide([7.15, 0.7, -26.75], [6.6, 0.2, -27.3], 44, [7.12, 0.66, -26.8], [6.6, 0.2, -27.3], 42, 4);
  let flk = 0;
  function f2034b(c) {
    c.world.env('night', 0);
    const sm = ud(c, 'smoke_backroom', 'reddy26'); if (sm && sm.amount) sm.amount(1, 0);
    const l = act(c, 'luka'), h = act(c, 'chase');
    if (h) { h.visible = true; h.place([7.0, 0, -27.4, H]); h.play('b1_lie', { turn: 0.5 }); h.setExpr('hurt'); }
    if (l) { l.visible = true; l.place([6.62, 0, -26.62, PI]); l.play('b1_grab'); l.setExpr('determined'); }
    lamp(c, [8.6, 1.4, -26.2], [6.9, 0.3, -27.2], 0xff8a3a, 5, 0.9);
    if (sk(c)) return;
    if (D.flick) removeUpdate(D.flick);
    const s = c.world.torch, sid = c.flow.sceneId;
    D.flick = (dt) => { flk += dt; if (!s || flow.sceneId !== sid) return; s.intensity = 4.2 + 1.4 * Math.sin(flk * 17) * Math.sin(flk * 5.3) + 0.6 * Math.sin(flk * 31); };
    addUpdate(D.flick);
  }
  // 54. 2035 — A funeral. Chase at a lectern, silent. At the very back, a figure in a long coat.
  const HX = HALL_AT[0], HY = HALL_AT[1], HZ = HALL_AT[2];
  // the very back: behind the last row, in the lens's right foreground, his back to us, hood up, facing the lectern
  const L40_BACK = [HX + 1.78, HY, HZ + 4.4, PI + 0.1];
  const HALL = glide([HX + 1.15, HY + 1.62, HZ + 6.1], [HX - 0.1, HY + 1.3, HZ - 5.4], 40, [HX + 1.1, HY + 1.6, HZ + 5.8], [HX - 0.1, HY + 1.3, HZ - 5.4], 39, 4);
  function f2035(c) {
    lampOff(c);
    const sm = ud(c, 'smoke_backroom', 'reddy26'); if (sm && sm.amount) sm.amount(0, 0);
    c.world.env('night', 0);
    if (KIT.hall && c.world.scene) { c.world.scene.add(KIT.hall); KIT.hall.position.set(HX, HY, HZ); KIT.hall.visible = true; D.hall = true; }
    for (const id of ['luka', 'chase', 'jordan']) { const a = act(c, id); if (a) a.visible = false; }
    const h = c.world.spawn('chase40', [HX, HY + 0.18, HZ - 5.1, 0]), l = c.world.spawn('luka40', L40_BACK);
    if (h) { h.rig.dress(c.state); h.place([HX, HY + 0.18, HZ - 5.1, 0]); h.play('b1_lectern'); h.setExpr('still'); }
    if (l) { l.rig.dress(c.state); l.rig.show('hood', true); l.place(L40_BACK); l.play('still'); l.setExpr('still'); }
    lamp(c, [HX, HY + 3.4, HZ - 3.6], [HX - 0.3, HY + 1.0, HZ - 5.4], 0xffe2b8, 6, 0.55);
    touch(c, ['chase40', 'luka40']);
  }
  function hallOff(c) { if (KIT.hall && KIT.hall.parent) KIT.hall.parent.remove(KIT.hall); D.hall = false; lampOff(c); }
  // 55. 2037 — Every screen in the country: a silhouette at a desk. THE MANAGER. (the 2040 store's screens, all of them)
  const SCREENS = glide([1.3, 1.5, -5.9], [-1.95, 1.8, -14.35], 36, [1.15, 1.5, -6.3], [-1.95, 1.8, -14.35], 34, 4);   // the big screen, a local watching it
  function f2037(c) {
    const S = SETS.reddy40; if (S && S.dress) S.dress('address');
    const all = ud(c, 'screens_all', 'reddy40'); if (all && all.show) all.show('address');
    if (all && all.caption) all.caption('THE MANAGER');
    const bs = ud(c, 'big_screen', 'reddy40'); if (bs && bs.glance) bs.glance(0);
  }
  // 56. 2040, Saturday 22 December — Chase, older, in the Redcliffe backroom, wiring four display chips into a machine.
  // The kettle's screen asks him to name it. He thinks. Types DES.
  const DES_SIDE = glide([4.98, 1.86, -25.78], [4.24, 1.06, -24.45], 36, [4.92, 1.82, -25.68], [4.24, 1.06, -24.45], 34, 6);
  // the match: LOW, up past the edge of the bench at his face (the angle 1.2 opens on, a lifetime earlier)
  const LOW40 = glide([4.0, 1.0, -24.62], [4.25, 1.62, -25.12], 43, [4.0, 1.02, -24.66], [4.25, 1.64, -25.12], 41, 3);
  function f2040(c) {
    const S = SETS.reddy40; if (S && S.dress) S.dress('b1_build');
    const h = c.world.spawn('chase40', 'b1_c40_wire');
    if (h) { h.rig.dress(c.state); h.place('b1_c40_wire'); h.visible = true; h.play('b1_wire'); h.setExpr('tired'); }
    const d = ud(c, 'des', 'reddy40'); if (d && d.screen) d.screen('name');
    touch(c, ['chase40']);
  }
  // 57. [MATCH CUT · the exact frame of 1.2, step 1] Tuesday 22 December 2026, 11:58.
  const LUKA_START = [5.6, 0, -6.72, 0], LUKA_ADMIRE = [5.6, 0, -7.05, 0], J12 = [-1.3, 0, -8.2, 1.1];
  const HEROIC = { shot: 'INSERT', at: 's12_heroic', move: 'push', amount: 0.9, dur: 6, ease: 'linear' };   // 1.2's first frame
  const RING = { shot: 'CAM', pos: [7.25, 1.42, -8.55], look: [7.55, 1.03, -9.22], fov: 32, to: { pos: [7.28, 1.38, -8.65], look: [7.55, 1.03, -9.22], fov: 30 }, dur: 3, ease: 'linear' };
  const TWOSHOT = { shot: 'CAM', pos: [6.95, 1.45, -5.3], look: [6.1, 1.4, -8.4], fov: 46, to: { pos: [6.9, 1.45, -5.45], look: [6.1, 1.41, -8.4], fov: 45 }, dur: 8, ease: 'linear' };
  function f1158(c) {
    S26('spotless', { time: 11 * 60 + 58 });
    const t = P(c, 'tether_loose', 'reddy26'); if (t) t.visible = false;
    const r = P(c, 'store_radio', 'reddy26'); if (r) r.userData.playing = true;
    const ph = ud(c, 'store_phone', 'reddy26'); if (ph && ph.ring) ph.ring(false);
    c.world.env('day', 0);
    lampOff(c);
    const l = act(c, 'luka'), h = act(c, 'chase'), j = act(c, 'jordan');
    // 2026 again: the lanyard as it was, whole (no knot, no wounds)
    knotOff();
    if (l) { l.visible = true; l.rig.show('hurt', false); l.rig.show('bandage', false); l.rig.show('lanyard', true); l.place(LUKA_START); l.play('idle'); l.setExpr('happy'); }
    if (h) { h.visible = true; if (h.held) h.hold(null); h.rig.show('headphones_neck', false); h.place('s11_chase_phone'); h.play('idle'); h.setExpr('neutral'); }
    if (j) { j.visible = true; j.place(J12); j.play('idle'); j.setExpr('neutral'); }
    for (const id of ['luke', 'chase40', 'luka40']) { const a = act(c, id); if (a && a.set && a.set.id === 'reddy26') a.visible = false; }
  }
  function stepBack(c) {
    const a = act(c, 'luka'); if (!a) return;
    const z0 = LUKA_START[2], z1 = LUKA_ADMIRE[2];
    tween(c, 0.9, (k) => { a.pos.x = LUKA_START[0]; a.pos.z = z0 + (z1 - z0) * k; });
  }
  // the phone rings (1.2's ring: the double trill every 1.6 s, at the phone) until Chase picks it up
  function ring2(c, on) {
    const ph = ud(c, 'store_phone', 'reddy26');
    if (ph && ph.ring) ph.ring(!!on && !sk(c), { sfx: 'trill', every: 1.6, vol: 0.55, max: 2 });
  }
  CUTSCENES.B1_again = [
    { hud: null },
    { music: 'lofi', fade: 1.5 },
    // 47. 2027 — The Redcliffe store at Christmas. Luka up a ladder hanging tinsel himself. Jordan at the bottom.
    { set: 'reddy26', env: 'day', spawn: { luka: 'b27_luka_top', jordan: 'b27_jordan' } },
    { do: f2027 },
    pre('parade'),
    LADDER27,
    rise,
    { do: (c) => { card(c, '2027'); } },
    { wait: 0.6 },
    say('jordan', "I could've—", { auto: 0.15 }),
    say('luka', "I'll do it.", { auto: 0.7 }),
    dip,
    // 48. 2029 — Chase's laptop: UNFINISHED — 640 items. Top of the list: two (not yet).
    { do: f2029 },
    pre('rue_house'),
    { shot: 'INSERT', at: 'laptop', card: ['b1_laptop', {}] },
    rise,
    { do: (c) => { card(c, '2029'); } },
    { wait: 2.7 },
    dip,
    // 49. 2031 — A festival poster, Redcliffe jetty stage, 4:10 pm: PUDDING. A sticker slapped across it: CANCELLED.
    { set: 'parade', env: 'day' },
    { do: f2031a },
    lensPush('b1_2031_poster', 0.9, 4),
    rise,
    { do: (c) => { card(c, '2031'); } },
    { wait: 2.7 },
    dip,
    // 50. 2031 — Rue's corkboard: Sundays ticked, one after another. LADS. LADS. LADS.
    { set: 'rue_house', env: 'cork31' },
    { do: f2031b },
    lensPush('b1_room31', 0.92, 4, { card: ['b1_cork', {}] }),
    rise,
    { do: (c) => { card(c, '2031'); } },
    { wait: 2.7 },
    dip,
    // 51. 2033 — Woody Point jetty, sunset. Luka and Chase laughing so hard they blur. (The face-down photo.)
    { set: 'parade', env: 'wp_sunset', spawn: { luka: 'b1_33_luka', chase: 'b1_33_chase' } },
    { do: f2033 },
    JETTY33,
    { do: (c) => { blur(c, true); } },
    rise,
    { do: (c) => { card(c, '2033'); if (!sk(c) && c.AUDIO && c.AUDIO.laugh) c.AUDIO.laugh({ vol: 0.35 }); } },
    { wait: 2.7 },
    dip,
    { do: (c) => { blur(c, false); } },
    // 52. 2034, Sunday 24 December, 6:00 am — Luka on the phone in grey storm light.
    { set: 'reddy26', env: 'day', spawn: { luka: [-5.0, 0, -0.55, H] } },
    { do: f2034a },
    pre('reddy40'),
    PHONE34,
    rise,
    { do: (c) => { card(c, '2034, Sunday 24 December, 6:00 am'); } },
    sfx('thunder', { vol: 0.35 }),
    { wait: 0.6 },
    say('luka', "Can you come in? I'll do it, I just need another pair of hands.", { auto: 0.6 }),
    dip,
    // 53. 2034 — Smoke. A hand. A lanyard.
    { spawn: 'chase', at: [7.0, 0, -27.4, H] },
    { do: f2034b },
    SMOKE34,
    rise,
    { do: (c) => { card(c, '2034'); } },
    sfx('thunder', { vol: 0.25, lp: 500 }),
    { wait: 2.7 },
    dip,
    // 54. 2035 — A funeral. Chase at a lectern, silent. At the very back, a figure in a long coat.
    { do: f2035 },
    HALL,
    rise,
    { do: (c) => { card(c, '2035'); } },
    { wait: 2.9 },
    dip,
    { do: hallOff },
    // 55. 2037 — Every screen in the country: a silhouette at a desk. THE MANAGER.
    { set: 'reddy40', env: 'day' },
    { do: f2037 },
    SCREENS,
    rise,
    { do: (c) => { card(c, '2037'); } },
    { wait: 2.8 },
    dip,
    // 56. 2040, Saturday 22 December — Chase, older, in the Redcliffe backroom, wiring the machine. The kettle's screen
    // asks him to name it. He thinks. Types DES. "Dunno. ^ Felt right."
    { set: 'reddy40', env: 'dim' },
    { do: f2040 },
    DES_SIDE,
    rise,
    { do: (c) => { card(c, '2040, Saturday 22 December'); } },
    { wait: 1.0 },
    { act: [['chase40', 'think']] },
    { wait: 1.0 },
    { act: [['chase40', 'b1_wire', { type: true }]] },
    { do: (c) => { const d = ud(c, 'des', 'reddy40'); if (d && d.type) d.type('DES', 0.9); } },
    sfx('key_beep', { vol: 0.2, at: [4.25, 1.05, -24.38] }), { wait: 0.3 }, sfx('key_beep', { vol: 0.2, rate: 1.1, at: [4.25, 1.05, -24.38] }), { wait: 0.3 },
    sfx('key_beep', { vol: 0.2, rate: 0.95, at: [4.25, 1.05, -24.38] }),
    { wait: 0.5 },
    { act: [['chase40', 'b1_wire']] },
    { expr: [['chase40', 'still']] },
    LOW40,
    say('chase40', 'Dunno. ^ Felt right.', { auto: 0.5 }),
    { wait: 0.3 },
    // 57. [MATCH CUT · the exact frame of 1.2, step 1] Tuesday 22 December 2026, 11:58. Luka steps back from a spotless
    // Hero Table. (A hard cut: reddy26 is still built.)
    { fade: 1, dur: 0 },   // (one black frame while the set swaps: no stray frame of the wrong room)
    { set: 'reddy26', env: 'day', spawn: { luka: LUKA_START, chase: 's11_chase_phone', jordan: J12 } },
    { do: f1158 },
    { music: 'radio', cut: true },
    HEROIC,
    { fade: 0, dur: 0 },
    { timeCard: 'Tuesday 22 December 2026, 11:58', place: 'Optus Redcliffe' },
    { wait: 0.5 },
    { do: stepBack },
    { wait: 0.6 },
    { prop: 'hero_table', fn: (o) => { if (o.userData.glint) o.userData.glint(); } },
    sfx('spotless_chime', { vol: 0.25 }),
    { wait: 1.1 },
    say('luka', 'Spotless.'),
    // The phone rings.
    RING,
    { do: (c) => { ring2(c, true); } },
    { wait: 2.4 },
    { do: (c) => { ring2(c, false); } },
    { hold: 'chase', prop: 'store_phone', hand: 'R' },
    { act: [['chase', 'phone']] },
    sfx('clunk', { vol: 0.25 }),
    CLOSE('chase', { dist: 1.0, fov: 38, push: 0.08, dur: 9 }),
    { wait: 0.3 },
    say('chase', 'Optus Redcliffe, Chase speaking.'),
    sfx('line_click', { vol: 0.5 }),
    say('operator', '…2040. Will you accept the charges?'),
    TWOSHOT,
    { wait: 0.5 },
    say('luka', 'Just say yes. It\'s probably Margaret.'),
    { wait: 0.2 },
    say('chase', '…Yes?'),
    // 58. White — cut before the explosion.
    { music: null, cut: true },
    { fade: 'out', dur: 0.06, color: '#fff' },
    { hold: 'chase', prop: null },
    { wait: 2.2 },
  ];

  // ============================================================ SCENE B2 — "Christmas Morning"
  const BX = -300;   // Region W's bench (world x)
  const FRONT2 = glide([BX - 0.32, 1.12, 2.35], [BX - 0.32, 0.98, 0.1], 38, [BX - 0.32, 1.1, 2.1], null, 37, 12);
  const SLATE_SHOT = lensPush('b2_slate', 0.9, 7);
  // [INSERT · the slate] behind the card: high and in front of him, his head bowed over the slate in his lap
  const SLATE_LAP = glide([BX - 0.52, 1.52, 1.05], [BX - 0.64, 0.86, 0.3], 42, [BX - 0.54, 1.47, 0.95], [BX - 0.64, 0.86, 0.3], 40, 9);
  // [WIDE] from over the railing's east end: the path, the bench, the small crowd gathering, the pelican on the rail
  const WIDE_PATH = glide([BX + 10.8, 2.4, 10.2], [BX - 0.5, 0.9, -6.0], 50, [BX + 10.4, 2.35, 9.7], [BX - 0.5, 0.9, -6.0], 48, 10);
  // [CRANE · slowly up and away] it ends with everything in the one frame: the bench and the small crowd in the lower
  // third, the pelican on the rail, the bay, the bridge on the horizon (the title sits over the water)
  const CRANE = { shot: 'CAM', pos: [-299.0, 2.4, -11.0], look: [-300.5, 0.8, 2.0], fov: 40, to: { pos: [-296.5, 18.0, -30.0], look: [-300.0, 0.0, 35.0], fov: 48 }, dur: 12, ease: 'in' };
  const CROWD = ['local40_a', 'local40_b', 'local40_c', 'local40_d', 'local40_e'];
  // where they stop: off the path, a loose half-ring on the grass behind the bench, facing it (clear of the wide's lens)
  const C_STOP = [[BX - 3.8, 0, -3.4, 0.8], [BX - 2.4, 0, -4.1, 0.47], [BX + 1.4, 0, -3.9, -0.41], [BX + 2.7, 0, -3.2, -0.75], [BX + 3.8, 0, -2.2, -1.08]];
  function dressB2(c) {
    cleanup(); D.active = true;
    const S = SETS.parade; if (S && S.dress) S.dress('xmas40');
    const l = act(c, 'luka40'), h = act(c, 'chase40');
    for (const a of [l, h]) {
      if (!a) continue;
      a.rig.dress(c.state); a.visible = true; a.rig.root.rotation.set(0, 0, 0); a.rig.seated = true;
      a.play('sit_bench', { h: 0.48 });
    }
    if (l) { l.rig.show('hood', false); l.place('b2_luka40'); l.setExpr('still'); }
    if (h) { h.place('b2_c40'); h.setExpr('tired'); h.rig.show('brick', false); }
    const sl = P(c, 'slate_speaker'); if (sl) { sl.visible = false; if (sl.userData.screen) sl.userData.screen('off'); }
    const cf = ud(c, 'coffees'); if (cf && cf.show) cf.show('both', true);   // the two takeaway coffees (the set's)
    for (let i = 0; i < CROWD.length; i++) c.world.despawn(CROWD[i]);
    c.world.despawn('kid');
    touch(c, ['luka40', 'chase40']);
    c.world.liveMax = 3;
  }
  SCENES.B2 = {
    title: 'Christmas Morning', set: 'parade', env: 'wp_washed', time: 'Tuesday 25 December 2040, 7:10 am', place: 'Woody Point',
    playable: [], swap: false, music: null, hud: null,
    spawn: { luka40: 'b2_luka40', chase40: 'b2_c40' },
    steps: [
      ['do', dressB2],
      ['cutscene', 'B2_bench'],
      ['cutscene', 'B2_two'],
    ],
    grants: { choice: 'B' },
  };

  // ------------------------------------------------------------ "B2_bench" (1-8)
  // the email (step 4): the card's stages on the game clock; the card stays on the shot it rides
  async function email(c) {
    if (sk(c)) return;
    const sid = c.flow.sceneId, o = { stage: 0, n: 0 }, sl = P(c, 'slate_speaker');
    const show = () => { if (c.flow.sceneId === sid && !sk(c)) c.ui.card('b2_email', o); };
    show();
    const beats = [[1.8, 1], [1.2, 2], [0.8, 3]];
    for (const [w, st] of beats) {
      await c.wait(w); if (c.flow.sceneId !== sid || sk(c)) return;
      o.stage = st; o.n = 0; show();
      if (st === 2) c.sfx('ss_chirp', { vol: 0.12, rate: 1.4 });
    }
    for (let i = 1; i <= SORRY.length; i++) {
      await c.wait(0.075); if (c.flow.sceneId !== sid || sk(c)) return;
      o.n = i; show(); if (i % 2) c.sfx('tick', { vol: 0.05 });
    }
    await c.wait(0.9); if (c.flow.sceneId !== sid || sk(c)) return;
    o.stage = 4; show(); c.sfx('ss_chirp', { vol: 0.2 });
    if (sl && sl.userData.screen) sl.userData.screen('sent');
  }
  CUTSCENES.B2_bench = [
    put('luka40', 'b2_luka40'), put('chase40', 'b2_c40'),
    seat([['luka40', 'sit_bench', { h: 0.48 }], ['chase40', 'sit_bench', { h: 0.48 }]]),
    { expr: [['luka40', 'still'], ['chase40', 'tired']] },
    // 1. [WIDE · locked, the angle from 2.3] The headland after the storm, everything green and washed. On the memorial
    // bench, Luka (2040) sits on his own plaque. Chase (2040) sits beside him. Two takeaway coffees.
    { shot: 'INSERT', at: 'wp_canon', locked: true },
    { wait: 4.0 },
    // 2.
    FRONT2,
    { wait: 0.6 },
    glance('chase40', 'luka40', 2.6),
    say('chase40', "Council's going to have to change the plaque."),
    // 3.
    { expr: [['luka40', 'fond']] },
    say('luka40', 'Leave it.'),
    { wait: 0.8 },
    // 4. [INSERT · the slate] Drafts. One draft fourteen years old. He attaches two.wav and types: Sorry for the wait. Sent.
    seat([['chase40', 'b1_slate', { h: 0.48 }]]),
    { expr: [['chase40', 'still']] },
    SLATE_LAP,
    { do: email },
    { wait: 7.6 },
    { do: (c) => { c.ui.card(null); const sl = P(c, 'slate_speaker'); if (sl && sl.userData.screen) sl.userData.screen('sent'); } },
    // 5.
    FRONT2,
    { expr: [['luka40', 'neutral']] },
    say('luka40', "Who's that to?"),
    // 6.
    say('chase40', 'A label. From 2026.'),
    // 7.
    say('luka40', "They'll be retired."),
    // 8.
    { expr: [['chase40', 'fond']] },
    say('chase40', "Then they'll have time to listen."),
    { wait: 0.6 },
  ];

  // ------------------------------------------------------------ "B2_two" (9-23): two, out loud, in public
  function slateDown(c) {
    const h = act(c, 'chase40'); if (h) { h.rig.show('slate', false); h.rig.seated = true; h.play('sit_bench', { h: 0.48 }); }
    const sl = P(c, 'slate_speaker'); if (sl) { sl.visible = true; if (sl.userData.screen) sl.userData.screen('play'); }
  }
  function playTwo(c) {
    if (sk(c) || !c.AUDIO || !c.AUDIO.song) return;
    if (D.song) D.song.stop(0.2);
    D.song = c.AUDIO.song({ speaker: 'walkman', gain: 0.95, fade: 0.6 });
  }
  // [WIDE] the foreshore: walkers slow and stop, the kid on his skateboard, the pelican on the railing, a chip off an ear
  async function gather(c) {
    const sid = c.flow.sceneId;
    for (let i = 0; i < CROWD.length; i++) {
      const id = CROWD[i], a = c.world.spawn(id, 'b2_crowd_' + (i + 1));
      if (!a) continue;
      a.visible = true; a.play('idle'); a.setExpr('neutral');
      if (sk(c)) a.place(C_STOP[i]); else a.moveTo(C_STOP[i], { speed: 0.85 + 0.06 * i });   // (each ends facing the bench)
    }
    const kid = c.world.spawn('kid', 'b2_kid_start', { look: 'kid40' });
    const sb = ud(c, 'skateboard');
    if (kid) {
      kid.visible = true; kid.walkAnim = 'b2_ride'; kid.play('b2_ride'); kid.setExpr('neutral');
      if (sb && sb.ride) sb.ride('kid');
      if (sk(c)) kid.place('b2_kid_stop'); else kid.moveTo('b2_kid_stop', { speed: 1.6 }).then(() => { if (c.flow.sceneId === sid) { kid.walkAnim = 'walk'; kid.play('idle'); } });
    }
    const pel = ud(c, 'pelican_hero'); if (pel && pel.land) pel.land('b2_pelican_land', sk(c) ? 0.01 : 3.2);
    touch(c, CROWD.concat(['kid']));
    if (sk(c)) { chipOff(c, true); if (kid) { kid.walkAnim = 'walk'; kid.play('idle'); } return; }
    await c.wait(5.6);
    if (c.flow.sceneId === sid) chipOff(c, false);
  }
  function chipOff(c, now) {
    const a = act(c, 'local40_c'); if (!a) return;
    if (now) { a.rig.chip('off'); return; }
    a.rig.chip('ping'); a.play('chip_ping');
    c.wait(0.8).then(() => { const b = act(c, 'local40_c'); if (b && c.flow.sceneId === 'B2') b.rig.chip('off'); });
  }
  // [INSERT] the brick phone in his scarred hand: from in front of him, low, on his hands
  function brickLens(c) {
    if (sk(c)) return;
    const h = act(c, 'chase40'); if (!h) return;
    h.rig.parts.handR.getWorldPosition(V1);
    c.cam.shot({ shot: 'CAM', pos: [V1.x + 0.05, V1.y + 0.18, V1.z + 0.55], look: [V1.x, V1.y + 0.02, V1.z], fov: 34,
      to: { pos: [V1.x + 0.05, V1.y + 0.16, V1.z + 0.48], look: [V1.x, V1.y + 0.02, V1.z], fov: 33 }, dur: 6, ease: 'linear' });
  }
  CUTSCENES.B2_two = [
    { do: (c) => { c.ui.card(null); } },
    // 9. [MID] He props the slate on the bench arm and plays two out loud, on a little speaker, in public. The first time
    // Pudding has played anything for anyone in fourteen years.
    SLATE_SHOT,
    { do: slateDown },
    { wait: 0.8 },
    sfx('ss_chirp', { vol: 0.15, rate: 1.2 }),
    { do: playTwo },
    { wait: 2.6 },
    CLOSE('chase40', { yaw: 0.45, dist: 1.6, push: 0.15, dur: 8, fov: 40, ly: -0.12 }),
    { expr: [['chase40', 'still']] },
    { wait: 3.0 },
    // 10. [WIDE] People on the foreshore path slow down. A kid on a skateboard (un-confiscated) stops. A pelican lands on
    // the railing. Somebody's chip light blinks and they take it off their ear to listen properly.
    WIDE_PATH,
    { do: (c) => { gather(c); } },
    { wait: 7.0 },
    // 11.
    FRONT2,
    { expr: [['luka40', 'neutral'], ['chase40', 'fond']] },
    glance('luka40', 'chase40', 2.4),
    say('luka40', 'Why Pudding?'),
    // 12.
    say('chase40', 'Long story.'),
    // 13.
    { expr: [['luka40', 'fond']] },
    say('luka40', "I've got time."),
    // 14. [CLOSE · Chase (2040)] He looks at him.
    { expr: [['chase40', 'stunned']] },
    CLOSE('chase40', { yaw: 0.5, dist: 0.95, push: 0.12, dur: 7, fov: 34 }),
    glance('chase40', 'luka40', 3.4),
    { wait: 2.4 },
    // 15.
    { expr: [['chase40', 'fond']] },
    slow('chase40', '…Yeah. ^ You have.'),
    { wait: 0.8 },
    // 16. [INSERT] Chase (2040) takes the brick phone out of his coat pocket and turns it over in his scarred hand.
    seat([['chase40', 'b2_turn', { h: 0.48 }]]),
    { wait: 0.05 },
    { do: brickLens },
    { wait: 3.2 },
    // 17.
    FRONT2,
    { expr: [['chase40', 'still']] },
    say('chase40', 'We should take this back.'),
    // 18.
    { expr: [['luka40', 'determined']] },
    say('luka40', 'Both of us.'),
    // 19.
    { expr: [['chase40', 'fond'], ['luka40', 'fond']] },
    say('chase40', 'Both of us.'),
    // 20. (They don't get up yet. The song plays on.)
    seat([['chase40', 'sit_bench', { h: 0.48 }]]),
    { do: (c) => { const h = act(c, 'chase40'); if (h) h.rig.show('brick', false); } },
    { shot: 'INSERT', at: 'wp_canon', locked: true },
    { wait: 3.0 },
    // 21. [CRANE · slowly up and away] Two men on a bench, a small crowd, a pelican, the bay, the bridge.
    CRANE,
    { wait: 11.5 },
    // 22. Title: TWO.
    { title: 'two', dur: 4.5 },
    { do: (c) => { if (D.song) { D.song.stop(3); D.song = null; } } },
    { fade: 'out', dur: 1.6 },
  ];
})();
