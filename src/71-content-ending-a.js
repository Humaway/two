// ============================================================ CONTENT: ENDING A — A1 "Keep", A2 "Christmas Morning"
// BUILD_PROMPT §8 (continued). Every line is final and word for word; '^' = a beat. Shot tags are quoted in comments.
// A1: hq_roof (golden37 -> a1_after; src/22-set-hq-roof.js) -> reddy26 (the split's right half, then "Home" in the
//   backroom: Rue's exact Act One frame `backroom_wide`). Music: the "two" bridge, slowed, as a lullaby ('lullaby');
//   the After plays "two" itself from Chase (2040)'s slate (AUDIO.song from the last chorus; it collapses to the tinny
//   earbuds on the concrete when they've gone). The honest moments play straight: nothing on top of them.
// A2: foreshore26 (the 2.3 angle `wp_canon`, no bench), the three-frame montage on reddy26 (days_later / tinsel_down /
//   wall_print), back to the grass, the title. Music: birds; then "two" from Chase's phone speaker (the full mix takes
//   over for the montage).
// CUTSCENES['A_coda']: the A-only coda "One possible 2040", for the credits / PC writer to run after the credits
//   (self-contained: it loads reddy26 itself — prebuild it during the credits — and ends on black).
// No roam, no kettle hotspot (A1/A2 are cutscene only), no samples. Story flags: hurt, lanyard_snapped, bandaged (Luka
// comes home bandaged, his own lanyard snapped); Future Luka's hood is down; item lanyard40 (Future Luka's faded
// lanyard, 1158) is handed over in A1 step 4 and is in Luka's hands from then on (his rig holds the real one).
// The 2040 selves fading (and Luka and Chase fading into the white): rig.fade(k, wash), the engine's per-rig transparent
// copies (compiled at boot for the four heroes), with a warm wash ("like a photo left in the sun"); nothing compiles
// mid-game.
(() => {
  const PI = Math.PI, H = PI / 2;
  const say = (id, text, o) => Object.assign({ say: id, text }, o);
  const slow = (id, text, o) => say(id, text, Object.assign({ speed: 'slow' }, o));
  const sk = (c) => c.flow.skipping;
  const P = (c, n, s) => c.world.prop(n, s);
  const act = (c, id) => c.world.actor(id);
  const ud = (c, n, s) => { const o = P(c, n, s); return o ? o.userData : null; };
  const put = (id, at) => ({ place: id, at });
  const V1 = new THREE.Vector3(), V2 = new THREE.Vector3();
  const smooth = (u) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
  const lerp = (a, b, u) => a + (b - a) * u;
  const clamp01 = (u) => (u < 0 ? 0 : u > 1 ? 1 : u);

  // a head turn without moving the feet (upper anim; seated / lying legs stay)
  function glanceAt(c, id, to, dur = 1.4) {
    const a = act(c, id), b = typeof to === 'string' ? act(c, to) : null;
    if (!a || sk(c)) return;
    const tx = b ? b.pos.x : to[0], tz = b ? b.pos.z : to[1];
    let rel = Math.atan2(tx - a.pos.x, tz - a.pos.z) - a.rotY;
    while (rel > PI) rel -= 2 * PI;
    while (rel < -PI) rel += 2 * PI;
    a.play('glance', { yaw: Math.max(-1.3, Math.min(1.3, rel)), dur });
  }
  // a computed close-up: the lens `dist` m from his eyes, `yaw` rad off his facing (+ = toward his left), pushing in
  // `push` m over `dur` s (linear). Read at step time; nothing while skipping. o.half: 'right' = the split's right half.
  function closeOn(c, id, o = {}) {
    if (sk(c)) return;
    const a = act(c, id);
    if (!a) return;
    a.eyePos(V1);
    const ry = a.rotY + (o.yaw || 0), d = o.dist || 0.95, pu = o.push ?? 0.12, ly = V1.y - 0.05 + (o.ly || 0);
    const sx = Math.sin(ry), sz = Math.cos(ry), y = V1.y + (o.dy ?? -0.02), f = o.fov || 36;
    const s = { shot: 'CAM', pos: [V1.x + sx * d, y, V1.z + sz * d], look: [V1.x, ly, V1.z], fov: f,
      to: { pos: [V1.x + sx * (d - pu), y, V1.z + sz * (d - pu)], look: [V1.x, ly, V1.z], fov: o.fovTo || f }, dur: o.dur || 7, ease: 'linear' };
    if (o.half) s.half = o.half;
    c.cam.shot(s);
  }
  const CLOSE = (id, o) => ({ do: (c) => { closeOn(c, id, o); } });
  // an anchor's lens with a slow push (amount = the end distance as a share of the start)
  const lensPush = (n, amount, dur, o) => Object.assign({ shot: 'INSERT', at: n, move: 'push', amount, dur, ease: 'linear' }, o);
  // a glide between two fixed lenses
  const glide = (pos, look, fov, pos2, look2, fov2, dur, o) => Object.assign({ shot: 'CAM', pos, look, fov, to: { pos: pos2, look: look2 || look, fov: fov2 || fov }, dur, ease: 'linear' }, o);
  // back on his feet: a floor-sit / seat survives 'idle' and every upper anim
  const up = (list) => ({ do: (c) => { for (const [id, anim, o] of list) { const a = act(c, id); if (!a) continue; a.rig.seated = false; a.rig.floorSit = false; a.play(anim || 'idle', o || {}); } } });
  const screen = (m) => ({ do: (c) => { const u = ud(c, 'remote_rig', 'hq_roof'); if (u && u.screen) u.screen(m); } });
  // a tween on game time (snaps when skipping or when the scene changes); allocates one closure per call, nothing per tick
  function tween(c, dur, fn) {
    const sid = c.flow.sceneId;
    if (sk(c) || !(dur > 0)) { fn(1); return Promise.resolve(); }
    let t = 0;
    return new Promise((res) => {
      const f = (dt) => {
        t = Math.min(1, t + dt / dur);
        if (flow.sceneId !== sid || flow.skipping) t = 1;
        fn(t);
        if (t >= 1) { removeUpdate(f); res(); }
      };
      addUpdate(f);
    });
  }
  // ============================================================ the fade ("like a photo left in the sun")
  // rig.fade(k, wash): every mesh on the rig swaps to its own transparent copy (built and compiled at boot for the four
  // heroes, so nothing compiles mid-game), opacity k (0..1) and a warm emissive wash; k = 1 / wash = 0 puts the
  // originals back. FADED: the rigs this file has faded (restored on flow:stop).
  const FADED = [];
  function applyFade(rig, k, w) {
    if (!FADED.includes(rig)) FADED.push(rig);
    rig.fade(k, w);
  }
  // running fades (allocation-free tick); K_OF: each rig's current opacity (1 when not fading)
  const FT = [], K_OF = new Map();
  function fadeTick(dt) {
    for (let i = FT.length - 1; i >= 0; i--) {
      const f = FT[i];
      f.t += dt;
      const u = flow.skipping || f.dur <= 0 ? 1 : Math.min(1, f.t / f.dur), k = lerp(f.from, f.to, f.ease ? smooth(u) : u);
      applyFade(f.r, k, f.wash * (1 - k) * (1 - k)); K_OF.set(f.r, k);
      if (u >= 1) { FT.splice(i, 1); fadeDone(f.r, f.a, k); }
    }
    if (!FT.length) removeUpdate(fadeTick);
  }
  function fadeDone(r, a, k) {
    if (k <= 0.001) { if (a) a.visible = false; r.fade(1, 0); K_OF.set(r, 0); }
    else if (k >= 0.999) { r.fade(1, 0); K_OF.set(r, 1); }
  }
  // fadeRig(c, id, to, dur, wash, ease): from wherever he is now (1 if not fading) to `to`; skipping snaps
  function fadeRig(c, id, to, dur, wash = 0.45, o = {}) {
    const a = act(c, id);
    if (!a || !a.rig.fade) return;
    const r = a.rig;
    for (let i = FT.length - 1; i >= 0; i--) if (FT[i].r === r) FT.splice(i, 1);
    const from = o.from ?? (K_OF.has(r) ? K_OF.get(r) : 1);
    if (o.from != null) { a.visible = true; applyFade(r, o.from, wash * (1 - o.from) * (1 - o.from)); K_OF.set(r, o.from); }
    if (sk(c) || !(dur > 0)) { applyFade(r, to, wash * (1 - to) * (1 - to)); K_OF.set(r, to); fadeDone(r, a, to); return; }
    FT.push({ r, a, from, to, t: 0, dur, wash, ease: o.ease !== false });
    addUpdate(fadeTick);
  }
  function fadeReset() {
    FT.length = 0; removeUpdate(fadeTick);
    for (const r of FADED) r.fade(1, 0);
    FADED.length = 0; K_OF.clear();
  }

  // ============================================================ hand props and wardrobe this file borrows (restored on flow:stop)
  // Future Luka's lanyard (the real attachment on his pooled rig): actor.hold() records its home on his torso the first
  // time, and every despawn / hold(null) sends it back there.
  const L40 = { obj: null };
  function lanyard40Obj(c) {
    if (L40.obj) return L40.obj;
    const a = act(c, 'luka40'), r = a ? a.rig : (c.world.rigsOf ? c.world.rigsOf('luka40')[0] : null);
    if (r && r.attach && r.attach.lanyard) L40.obj = r.attach.lanyard;
    return L40.obj;
  }
  // after a hold: the badge sits in the palm and the strap trails from it (hold() centres the whole loop on the hand)
  function palm(o, rx = 0) {
    const b = o && o.userData.badge;
    if (!b) return;
    o.rotation.set(rx, 0, 0); o.updateMatrix();
    V2.copy(b.position).applyQuaternion(o.quaternion);
    o.position.set(-V2.x, -V2.y + 0.02, -V2.z);
  }
  // lay a held lanyard so its badge lands on a world point, badge face up, the strap toward -Z (his head, lying)
  const QP = new THREE.Quaternion(), QUP = new THREE.Quaternion().setFromEuler(new THREE.Euler(-H, 0, 0));
  function layBadge(o, wx, wy, wz) {
    const b = o && o.userData.badge;
    if (!b || !o.parent) return;
    o.parent.updateWorldMatrix(true, false);
    o.parent.getWorldQuaternion(QP);
    o.quaternion.copy(QP.invert().multiply(QUP));
    o.updateWorldMatrix(false, true);
    b.getWorldPosition(V1); V2.set(wx, wy, wz);
    o.parent.worldToLocal(V1); o.parent.worldToLocal(V2);
    o.position.add(V2).sub(V1);
  }
  // run fn a few ticks from now (the hands' world positions are then those of the new pose); dropped on a scene change
  function later(c, fn, ticks = 3) {
    const sid = c.flow.sceneId;
    let n = 0;
    const f = () => { if (++n < ticks) return; removeUpdate(f); if (flow.sceneId === sid) fn(c); };
    addUpdate(f);
  }
  const lanyardsOnChest = (c) => later(c, layLanyards, 12);
  // A2: the faded lanyard lying across his palms, badge up (the strap back toward him)
  function badgeInHands(c) {
    const a = act(c, 'luka'), o = L40.obj;
    if (!a || !o || !o.parent) return;
    a.rig.parts.handL.getWorldPosition(V2); const lx = V2.x, ly = V2.y, lz = V2.z;
    a.rig.parts.handR.getWorldPosition(V2);
    layBadge(o, (lx + V2.x) / 2, Math.max(ly, V2.y) + 0.035, (lz + V2.z) / 2 + 0.07);
  }
  function layLanyards(c) {
    const a = act(c, 'luka');
    if (!a) return;
    const o = L40.obj, own = OWN.obj;
    a.rig.parts.handL.getWorldPosition(V2); const lx = V2.x, ly = V2.y, lz = V2.z;
    a.rig.parts.handR.getWorldPosition(V2); const rx = V2.x, ry = V2.y, rz = V2.z;
    if (o && o.parent) layBadge(o, (lx + rx) / 2 + 0.07, Math.max(ly, ry) + 0.03, (lz + rz) / 2 + 0.15);
    if (own && own.parent) layBadge(own, (lx + rx) / 2 - 0.07, Math.max(ly, ry) + 0.028, (lz + rz) / 2 + 0.19);
  }
  // Luka's own (snapped) lanyard, moved into his other hand for the homecoming: { obj, parent, pos, quat, scale }
  const OWN = { obj: null, parent: null, pos: new THREE.Vector3(), quat: new THREE.Quaternion(), scl: new THREE.Vector3(), vis: false };
  function ownLanyardToHand(c) {
    const a = act(c, 'luka');
    if (!a || OWN.obj) return;
    const l = a.rig.attach.lanyard, g = a.rig.attach.gripR || a.rig.parts.handR;
    if (!l || !g) return;
    OWN.obj = l; OWN.parent = l.parent; OWN.pos.copy(l.position); OWN.quat.copy(l.quaternion); OWN.scl.copy(l.scale); OWN.vis = l.visible;
    g.add(l); l.scale.setScalar(1); l.visible = true; palm(l, 0.6);
  }
  // a borrowed attachment parented somewhere else for a while (restored on flow:stop)
  const BOR = { obj: null, parent: null, pos: new THREE.Vector3(), quat: new THREE.Quaternion(), scl: new THREE.Vector3(), vis: false };
  function borrow(o, parent) {
    if (!o || !parent) return;
    if (BOR.obj !== o) { borrowHome(); BOR.obj = o; BOR.parent = o.parent; BOR.pos.copy(o.position); BOR.quat.copy(o.quaternion); BOR.scl.copy(o.scale); BOR.vis = o.visible; }
    parent.add(o);
  }
  function borrowHome() {
    const o = BOR.obj;
    if (!o) return;
    if (BOR.parent) BOR.parent.add(o); else if (o.parent) o.parent.remove(o);
    o.position.copy(BOR.pos); o.quaternion.copy(BOR.quat); o.scale.copy(BOR.scl); o.visible = BOR.vis;
    BOR.obj = null; BOR.parent = null;
  }
  function ownLanyardHome() {
    const l = OWN.obj;
    if (!l) return;
    if (OWN.parent) OWN.parent.add(l);
    l.position.copy(OWN.pos); l.quaternion.copy(OWN.quat); l.scale.copy(OWN.scl); l.visible = OWN.vis;
    OWN.obj = null; OWN.parent = null;
  }
  // Luke's cheap Santa hat: his rig's fitted santa_hat attachment (every spawn's dress() takes it off again)
  const HAT = { on: null };
  function hatOn(c) {
    const a = act(c, 'luke');
    if (!a) return;
    a.rig.show('santa_hat', true); HAT.on = a.rig;
  }
  function hatOff() { if (HAT.on) HAT.on.show('santa_hat', false); HAT.on = null; }
  // pooled rigs leave the way they came: standing, dressed by flags on their next spawn, with their own materials
  const TOUCHED = [];
  const touch = (c, ids) => { for (const id of ids) { const a = act(c, id); if (a && !TOUCHED.includes(a.rig)) TOUCHED.push(a.rig); } };
  const SLATE_DEFAULT = ['two_v1.wav', 'two_v2_FINAL.wav', 'two_v2_FINAL_real.wav', 'two_v3_bridge_idea.wav', '...', 'two_v1204_dont.wav', '...', 'two_v2847.wav'];
  let slatePainted = null;
  function slateList(c, title, lines) {
    const a = act(c, 'chase40'), s = a && a.rig.attach.slate;
    if (s && s.userData.list) { s.userData.list(title, lines); slatePainted = s; }
  }

  // ============================================================ "two": the song handles (stopped on flow:stop)
  const SONG = { a: null, b: null };
  function songStop(f = 0.4) { if (SONG.a) SONG.a.stop(f); if (SONG.b) SONG.b.stop(f); SONG.a = SONG.b = null; }
  function gainTo(h, v, d) {
    if (!h || !h.out || typeof AUDIO === 'undefined' || !AUDIO.now) return;
    const g = h.out.gain, t = AUDIO.now();
    g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.linearRampToValueAtTime(v, t + Math.max(0.05, d));
  }
  // two synced handles of the same song: `main` heard first, `alt` silent until crossfaded in
  function songPair(c, o) {
    songStop(0.2);
    if (sk(c) || typeof AUDIO === 'undefined' || !AUDIO.song) return;
    const base = { from: o.from, to: o.to };
    SONG.a = AUDIO.song(Object.assign({}, base, { speaker: o.speakerA || null, gain: o.gainA ?? 1, fade: o.fade || 0.6 }));
    SONG.b = AUDIO.song(Object.assign({}, base, { speaker: o.speakerB || null, gain: 0.0001, fade: 0.05 }));
  }
  function songCross(gB, d, gA = 0.0001) { gainTo(SONG.a, gA, d); gainTo(SONG.b, gB, d); }

  // ============================================================ the cleanup (every scene change and quit)
  let dirty = false;
  function cleanup() {
    if (!dirty) return;
    dirty = false;
    fadeReset();
    songStop(0.3);
    hatOff();
    ownLanyardHome();
    borrowHome();
    if (slatePainted && slatePainted.userData.list) slatePainted.userData.list('two  ·  2,847 items', SLATE_DEFAULT);
    slatePainted = null;
    for (const r of TOUCHED) {
      r.seated = false; r.floorSit = false;
      if (r.ghosted && r.ghost) r.ghost(null, 1);
      if (r.attach.earbud) r.attach.earbud.visible = false;
      if (r.attach.slate) r.attach.slate.visible = false;
    }
    TOUCHED.length = 0;
    removeUpdate(badgeTick);
    if (BADGE.obj) BADGE.obj.rotation.set(0, BADGE.obj.userData.flip ? PI : 0, 0);
    BADGE.obj = null;
    if (HELD.p) { try { HELD.p.close(); } catch (e) { /* gone */ } HELD.p = null; }
    try { const cf = world.prop('coffees', 'foreshore26'); if (cf && cf.userData.home) cf.userData.home(); } catch (e) { /* not live */ }
    try { if (typeof ui !== 'undefined' && ui.meter) ui.meter(null, null); } catch (e) { /* ui gone */ }
    lampOff();
  }
  if (typeof on === 'function') on('flow:stop', cleanup);
  const begin = (c) => { cleanup(); dirty = true; };

  // ============================================================ anims this file owns (guarded; no allocation per tick)
  const K = () => (typeof RIGKIT !== 'undefined' ? RIGKIT : null);
  let TY = 0, TZ = 0;
  function toT(r, y, z) { const th = r.parts.torso.rotation.x, yy = y - 0.06, cc = Math.cos(th), ss = Math.sin(th); TY = yy * cc + z * ss; TZ = -yy * ss + z * cc; }
  // reach arm `sd` (+1 left, -1 right) `x` out from the centre line to a point `hM` m above the feet and `zM` m ahead
  function reach(r, k, sd, x, hM, zM, px = 0.5, py = -1, pz = -0.4) { toT(r, k.hipsY(r, hM) - r.parts.hips.position.y, k.hipsY(r, zM)); k.arm(r, sd, x, TY, TZ, px, py, pz); }
  // a two-key arm lerp: from (x0,h0,z0) to (x1,h1,z1) by u
  function reachL(r, k, sd, u, x0, h0, z0, x1, h1, z1) { reach(r, k, sd, lerp(x0, x1, u), lerp(h0, h1, u), lerp(z0, z1, u)); }
  const HANG = [0.2, 0.8, 0.04];                                      // a hanging hand: x out, height, ahead (m)
  function anim(name, fn, upper) { if (!ANIMS[name]) { ANIMS[name] = fn; if (upper) ANIMS[name].upper = true; } }

  function defAnims() {
    // Luka standing hurt (hunched, his hand on his ribs) without hurt_stand's own face, so the scene sets his faces
    anim('a1_hurt', (r, t, p) => ANIMS.hurt_stand(r, t, p), true);
    // Chase kneeling at the Remote, dialling the brick phone (p.dial: the right hand taps the keys)
    anim('a1_dial', (r, t, p) => {
      const k = K(); if (!k) return ANIMS.idle(r, t, p);
      k.kneel(r, t); const Pt = r.parts;
      Pt.torso.rotation.x = 0.3 + 0.02 * Math.sin(t * 1.2);
      reach(r, k, 1, 0.1, 0.71, 0.44, 0.5, -1, -0.4);
      const tap = p.dial ? Math.max(0, Math.sin(t * 9)) * 0.035 : 0;
      reach(r, k, -1, 0.2, 0.74 + tap, 0.42, 0.5, -1, -0.4);
      Pt.handL.rotation.x = 0.5; Pt.handR.rotation.x = 0.7; Pt.head.rotation.x = 0.38; Pt.neck.rotation.x = 0.1;
    });
    // Future Luka unclipping his lanyard: both hands to the badge, a small lift, then the right hand out, offering (holds)
    anim('a1_unclip', (r, t, p) => {
      const k = K(); if (!k) return ANIMS.idle(r, t, p);
      k.base(r, t); const Pt = r.parts, u = Math.min(1, t / (p.dur || 1.8));
      const a = smooth(u / 0.35), lift = Math.sin(clamp01((u - 0.35) / 0.2) * PI) * 0.05, b = smooth((u - 0.55) / 0.45);
      Pt.head.rotation.x = 0.3 * a - 0.12 * b; Pt.torso.rotation.x += 0.05 * a;
      reachL(r, k, 1, a * (1 - b), HANG[0], HANG[1], HANG[2], 0.05, 1.14 + lift, 0.24);
      reachL(r, k, -1, a, HANG[0], HANG[1], HANG[2], 0.05, 1.14 + lift, 0.24);
      if (b > 0) reachL(r, k, -1, b, 0.05, 1.14, 0.24, 0.08, 1.02, 0.4);
      Pt.handR.rotation.x = 0.4 + 0.6 * b;
    });
    // Luka's left hand out, palm up, then closed round the lanyard (p.close 0..1 by time after 1.2 s); the right hand
    // stays on his ribs (hurt_stand)
    anim('a1_receive', (r, t, p) => {
      const k = K(); if (!k) return ANIMS.idle(r, t, p);
      ANIMS.hurt_stand(r, t, p); const Pt = r.parts, u = smooth(t / 0.7);
      reachL(r, k, 1, u, r.d.shX + 0.06, 0.82, 0.08, 0.1, 1.0, 0.36);
      Pt.handL.rotation.set(u * 0.2, 0, -1.2 * u);
      Pt.head.rotation.x = 0.32 * u;
    });
    // Future Luka's two hands closing round Luka's (forward, a little below chest height), head bowed over them
    anim('a1_cup', (r, t, p) => {
      const k = K(); if (!k) return ANIMS.idle(r, t, p);
      k.base(r, t); const Pt = r.parts, u = smooth(t / 0.8);
      Pt.torso.rotation.x += 0.1 * u;
      reachL(r, k, 1, u, 0.08, 1.0, 0.36, 0.02, 1.01, 0.4);
      reachL(r, k, -1, u, 0.08, 1.02, 0.4, 0.04, 0.97, 0.42);
      Pt.handL.rotation.set(0.3 * u, 0, 0.6 * u); Pt.handR.rotation.set(0.3 * u, 0, -0.9 * u);
      Pt.head.rotation.x = 0.36 * u;
    });
    // one nod (upper, one-shot by loop: false)
    anim('a1_nod1', (r, t, p) => { ANIMS.idle(r, t, p); const u = clamp01(t / (p.dur || 0.8)); r.parts.head.rotation.x += 0.34 * Math.sin(u * PI); r.parts.neck.rotation.x += 0.08 * Math.sin(u * PI); }, true);
    // a long breath out: shoulders up, then down further than they were, head dropping (upper, one-shot)
    anim('a1_exhale', (r, t, p) => {
      ANIMS.idle(r, t, p);
      const Pt = r.parts, u = clamp01(t / (p.dur || 2.0)), inh = Math.sin(clamp01(u / 0.4) * H), exh = smooth((u - 0.4) / 0.6);
      const sh = 0.03 * inh - 0.045 * exh;
      Pt.armL.position.y += sh; Pt.armR.position.y += sh;
      Pt.torso.rotation.x += -0.05 * inh + 0.1 * exh; Pt.head.rotation.x += -0.06 * inh + 0.22 * exh;
    }, true);
    // sitting ON the parapet cap (the root at the cap's top), legs over the drop. p.m: 0 hands on the cap · 1 the slate
    // in his lap (both hands) · 2 giving an earbud to the man on his right · 3 looking at his own left hand · 4 shoulder to
    // shoulder, his head tilted toward his neighbour (p.side +1 = his left) · 5 the earbud going into his ear
    anim('a1_perch', (r, t, p) => {
      const k = K(); if (!k) return ANIMS.idle(r, t, p);
      const Pt = r.parts, d = r.d, hy = k.hipsY(r, 0) + 0.12, m = p.m || 0;
      r.seated = true; r.floorSit = false; Pt.coat.rotation.x = -0.55;
      Pt.hips.position.y = hy;
      k.leg(r, 1, d.hipX * 1.1, d.footH - hy - k.hipsY(r, 0.36), 0.36); k.leg(r, -1, d.hipX * 1.1, d.footH - hy - k.hipsY(r, 0.42), 0.3); k.flat(r);
      const br = Math.sin(t * 1.3);
      Pt.torso.rotation.x = 0.1 + 0.012 * br;
      const u = smooth(t / 0.9);
      if (m === 1 || m === 2) {                                   // the slate in his lap
        Pt.torso.rotation.x = 0.26 + 0.01 * br;
        if (m === 2) reachL(r, k, 1, u, 0.09, 0.2, 0.26, -0.3, 0.6, 0.2);
        else reach(r, k, 1, 0.09, 0.2, 0.26, 0.5, -1, -0.4);
        reach(r, k, -1, 0.06 + 0.02 * Math.sin(t * 3.1), 0.22 + 0.012 * Math.sin(t * 4.7), 0.3, 0.5, -1, -0.4);
        Pt.handL.rotation.x = m === 2 ? 0.2 : 0.5; Pt.handR.rotation.x = 0.6;
        Pt.head.rotation.x = m === 2 ? 0.2 : 0.42; Pt.neck.rotation.x = 0.1;
        if (m === 2) { Pt.head.rotation.y = -0.45 * u; Pt.torso.rotation.y = -0.18 * u; }
      } else if (m === 3) {                                       // the left hand up in front of his face, turned over
        reach(r, k, -1, d.shX * 0.8, 0.06, 0.16, 0.5, -0.4, -1);
        reachL(r, k, 1, u, d.shX * 0.8, 0.06, 0.16, 0.12, 0.68, 0.34);
        Pt.handL.rotation.set(-0.4 * u, 0, -1.4 * u + 0.12 * Math.sin(t * 0.9));
        Pt.head.rotation.x = 0.25 * u; Pt.head.rotation.y = 0.12 * u;
      } else if (m === 5) {                                       // fitting the earbud: the left hand up to his left ear
        reach(r, k, -1, d.shX * 0.8, 0.06, 0.16, 0.5, -0.4, -1);
        reachL(r, k, 1, u, d.shX * 0.8, 0.06, 0.16, 0.13, 0.98, 0.02);
        Pt.handL.rotation.set(0, 0, -0.6 * u); Pt.head.rotation.z = -0.12 * u;
      } else {                                                    // hands on the cap beside him; head toward his neighbour
        reach(r, k, 1, d.shX + 0.08, 0.04, 0.02, 0.5, -0.4, -1);
        reach(r, k, -1, d.shX + 0.08, 0.04, 0.02, 0.5, -0.4, -1);
        if (m === 4) { const s = p.side || 1; Pt.head.rotation.z = -0.14 * s * u; Pt.head.rotation.y = 0.16 * s * u; Pt.torso.rotation.z = -0.04 * s * u; Pt.head.rotation.x = 0.06; }
      }
      if (p.ly) Pt.head.rotation.y += p.ly * u;                   // a look aside (a glance would stand him up off the cap)
    });
    // standing, arms down, no face of its own (Luke in the doorway)
    anim('a1_stand', (r, t, p) => ANIMS.still(r, t, p), true);
    // Luke's very long sigh with the receiver at his ear: chest up and up, then everything sags (p.dur 2.6)
    anim('a1_sigh', (r, t, p) => {
      ANIMS.phone(r, t, p);
      const Pt = r.parts, u = clamp01(t / (p.dur || 2.6)), inh = Math.sin(clamp01(u / 0.45) * H), exh = smooth((u - 0.45) / 0.55);
      const sh = 0.035 * inh - 0.05 * exh;
      Pt.armL.position.y += sh; Pt.armR.position.y += sh * 0.4;
      Pt.torso.rotation.x += -0.07 * inh + 0.14 * exh; Pt.head.rotation.x += -0.12 * inh + 0.3 * exh;
    }, true);
    // flat on his back on the floor, both hands on his chest round the lanyards; p.look lifts the head toward the door;
    // p.laugh: the chest shaking (laughing, half crying)
    anim('a1_lie', (r, t, p) => {
      const k = K(); ANIMS.lie(r, t, p);
      if (!k) return;
      const Pt = r.parts, sh = p.laugh ? 0.05 * Math.sin(t * 17) * (0.6 + 0.4 * Math.sin(t * 2.3)) : 0;
      k.arm(r, 1, 0.05, 0.12 * (r.d.T / 0.47), r.d.chestZ + 0.05 + sh, 1, -1, 0.3);
      k.arm(r, -1, 0.07, 0.08 * (r.d.T / 0.47), r.d.chestZ + 0.06 + sh * 0.8, 1, -1, 0.3);
      Pt.handL.rotation.set(0.2, 0, 0.8); Pt.handR.rotation.set(0.2, 0, -0.8);
      Pt.torso.rotation.x += sh * 0.5;
      if (p.look) { Pt.neck.rotation.x += 0.3 * p.look; Pt.head.rotation.x += 0.45 * p.look; }
      if (p.turn) Pt.head.rotation.y += p.turn;
    });
    // sitting on the grass, knees up, forearms on the knees (p.cup: the right hand by the knee holds the coffee)
    const grass = (r, t, k) => {
      const Pt = r.parts, d = r.d, hy = k.hipsY(r, 0.04) + 0.06;
      r.seated = true; r.floorSit = true; Pt.coat.rotation.x = -1.45;
      Pt.hips.position.y = hy; Pt.hips.position.z = 0;
      k.leg(r, 1, d.hipX * 1.4, d.footH - hy + 0.03, 0.5, 1); k.leg(r, -1, d.hipX * 1.3, d.footH - hy + 0.03, 0.46, 1); k.flat(r);
      Pt.torso.rotation.x = 0.06 + 0.014 * Math.sin(t * 1.4);
    };
    anim('a2_grass', (r, t, p) => {
      const k = K(); if (!k) return ANIMS.idle(r, t, p);
      grass(r, t, k); const Pt = r.parts;
      reach(r, k, 1, 0.2, 0.36, 0.34, 0.5, -1, -0.2);
      reach(r, k, -1, 0.2, 0.36, 0.34, 0.5, -1, -0.2);
      Pt.handL.rotation.x = 0.6; Pt.handR.rotation.x = 0.6; Pt.head.rotation.x = p.down ? 0.3 : 0.02;
    });
    // the phone in both hands at the chest, head down to it (p.press: the right thumb jabs once at ~0.3 s)
    anim('a2_phone', (r, t, p) => {
      const k = K(); if (!k) return ANIMS.idle(r, t, p);
      grass(r, t, k); const Pt = r.parts;
      Pt.torso.rotation.x = 0.2;
      const jab = p.press ? Math.max(0, Math.sin(clamp01((t - 0.15) / 0.3) * PI)) * 0.03 : 0;
      reach(r, k, 1, 0.07, 0.52, 0.28, 0.5, -1, -0.3);
      reach(r, k, -1, 0.05, 0.53 + jab, 0.27 - jab * 0.5, 0.5, -1, -0.3);
      Pt.handL.rotation.set(0.9, 0, 0.3); Pt.handR.rotation.set(0.9, 0, -0.3);
      Pt.head.rotation.x = 0.42; Pt.neck.rotation.x = 0.12;
    });
    // his hands start to rise toward his head, stop halfway, and come back down to the phone (p.dur 2.6); then holds
    anim('a2_halt', (r, t, p) => {
      const k = K(); if (!k) return ANIMS.idle(r, t, p);
      grass(r, t, k); const Pt = r.parts, u = clamp01(t / (p.dur || 2.6));
      const rise = u < 0.45 ? smooth(u / 0.45) : u < 0.6 ? 1 : 1 - smooth((u - 0.6) / 0.4), h = 0.5 * rise;   // halfway
      Pt.torso.rotation.x = 0.2 - 0.06 * rise;
      reachL(r, k, 1, h, 0.07, 0.52, 0.28, 0.12, 1.18, 0.1);
      reachL(r, k, -1, h, 0.05, 0.53, 0.27, 0.12, 1.18, 0.1);
      Pt.handL.rotation.set(0.9 * (1 - rise), 0, 0.3 + 0.8 * rise); Pt.handR.rotation.set(0.9 * (1 - rise), 0, -0.3 - 0.8 * rise);
      Pt.head.rotation.x = 0.42 - 0.3 * rise;
    });
    // laughing on the grass, the phone back in his hands (shoulders shaking, head tipping back)
    anim('a2_laugh', (r, t, p) => {
      const k = K(); if (!k) return ANIMS.idle(r, t, p);
      grass(r, t, k); const Pt = r.parts, s = Math.sin(t * 15) * 0.02;
      Pt.torso.rotation.x = 0.04 + s; Pt.armL.position.y += s * 0.6; Pt.armR.position.y += s * 0.6;
      reach(r, k, 1, 0.07, 0.5, 0.28, 0.5, -1, -0.3); reach(r, k, -1, 0.05, 0.5, 0.27, 0.5, -1, -0.3);
      Pt.handL.rotation.set(0.9, 0, 0.3); Pt.handR.rotation.set(0.9, 0, -0.3);
      Pt.head.rotation.x = -0.18 + s;
    });
    // turning the faded lanyard over in his hands, in his lap (the badge turns in BADGE's tick)
    anim('a2_turn', (r, t, p) => {
      const k = K(); if (!k) return ANIMS.idle(r, t, p);
      grass(r, t, k); const Pt = r.parts, w = Math.sin(t * 1.1);
      Pt.torso.rotation.x = 0.22;
      reach(r, k, 1, 0.06, 0.46, 0.34 + 0.01 * w, 0.5, -1, -0.3);
      reach(r, k, -1, 0.09, 0.46, 0.34, 0.5, -1, -0.3);
      Pt.handL.rotation.set(0.6, 0.3 * w, 0.5); Pt.handR.rotation.set(0.6, 0, -0.6);
      Pt.head.rotation.x = 0.46; Pt.neck.rotation.x = 0.12;
    });
    // standing at the table, polishing the glass in slow circles with the right hand (p.stop: the hand rests, he looks)
    anim('a2_polish', (r, t, p) => {
      const k = K(); if (!k) return ANIMS.idle(r, t, p);
      k.base(r, t); const Pt = r.parts, w = t * 4.2, st = p.stop ? 0 : 1;
      Pt.torso.rotation.x = 0.42;
      reach(r, k, -1, 0.14 + 0.06 * Math.cos(w) * st, 0.96, 0.46 + 0.05 * Math.sin(w) * st, 0.5, -1, -0.4);
      reach(r, k, 1, 0.24, 0.95, 0.4, 0.5, -1, -0.4);
      Pt.handL.rotation.x = 1.0; Pt.handR.rotation.x = 1.0; Pt.head.rotation.x = 0.4 + (p.stop ? 0.12 : 0);
      if (p.stop) Pt.head.rotation.y = 0.18;
    });
    // holding the ladder steady with both hands, looking up at the man on it
    anim('a2_steady', (r, t, p) => {
      const k = K(); if (!k) return ANIMS.idle(r, t, p);
      k.base(r, t); const Pt = r.parts;
      reach(r, k, 1, 0.22, 1.12, 0.32, 0.5, -1, -0.6); reach(r, k, -1, 0.22, 1.18, 0.32, 0.5, -1, -0.6);
      Pt.handL.rotation.x = 0.4; Pt.handR.rotation.x = 0.4;
      Pt.neck.rotation.x = -0.2; Pt.head.rotation.x = -0.45 + 0.03 * Math.sin(t * 0.9);
    });
    // up the ladder, both arms up unhooking the tinsel from the top of the Yes wall
    anim('a2_unhook', (r, t, p) => {
      const k = K(); if (!k) return ANIMS.idle(r, t, p);
      k.base(r, t); const Pt = r.parts, w = Math.sin(t * 1.7);
      reach(r, k, 1, 0.3 + 0.06 * w, 1.95 + 0.04 * w, 0.32, 0.5, -0.2, -1);
      reach(r, k, -1, 0.26 - 0.05 * w, 1.9 - 0.03 * w, 0.3, 0.5, -0.2, -1);
      Pt.handL.rotation.x = -0.4; Pt.handR.rotation.x = -0.4;
      Pt.neck.rotation.x = -0.18; Pt.head.rotation.x = -0.3;
    });
    // the coda: one arm (p.sd: +1 left, -1 right) reaching forward and down to the phone on the counter (p.dur), holding
    anim('coda_reach', (r, t, p) => {
      const k = K(); if (!k) return ANIMS.idle(r, t, p);
      k.base(r, t); const Pt = r.parts, sd = p.sd || -1, u = p.go ? smooth(t / (p.dur || 1.0)) : 0;
      Pt.torso.rotation.x += 0.22 * u;
      reachL(r, k, sd, u, HANG[0], HANG[1], HANG[2], p.x ?? 0.16, p.h ?? 1.08, p.z ?? 0.62);
      if (sd > 0) Pt.handL.rotation.set(0.6 * u, 0, 0.3 * u); else Pt.handR.rotation.set(0.6 * u, 0, -0.3 * u);
    });
  }
  defAnims();

  // ============================================================ CARDS (readable INSERTs this file owns)
  const SYS = 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
  function rr(cx, x, y, w, h, r) { cx.beginPath(); cx.moveTo(x + r, y); cx.arcTo(x + w, y, x + w, y + h, r); cx.arcTo(x + w, y + h, x, y + h, r); cx.arcTo(x, y + h, x, y, r); cx.arcTo(x, y, x + w, y, r); cx.closePath(); }
  function txt(cx, s, x, y, px, col, al = 'left', w = '600', maxW) { cx.font = `${w} ${px}px ${SYS}`; cx.fillStyle = col; cx.textAlign = al; cx.textBaseline = 'middle'; if (maxW) cx.fillText(s, x, y, maxW); else cx.fillText(s, x, y); }

  // [INSERT] YES. The Choice's YES pill, its ring full and gold: "Keep the memories".
  CARDS.a1_yes = (cx, w, h) => {
    const g = cx.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, w * 0.62);
    g.addColorStop(0, 'rgba(240,246,255,0.96)'); g.addColorStop(1, 'rgba(206,224,248,0.9)');
    cx.fillStyle = 'rgba(0,0,0,0.25)'; rr(cx, 22, 26, w - 44, h - 44, 40); cx.fill();
    cx.fillStyle = g; rr(cx, 16, 16, w - 32, h - 40, 40); cx.fill();
    cx.strokeStyle = 'rgba(95,178,255,0.75)'; cx.lineWidth = 3; rr(cx, 16, 16, w - 32, h - 40, 40); cx.stroke();
    const px = w / 2, py = h * 0.43, pw = 300, ph = 104;
    // the ring, full: a gold track round the pill
    cx.save(); cx.shadowColor = 'rgba(255,210,31,0.9)'; cx.shadowBlur = 26;
    cx.strokeStyle = '#ffd21f'; cx.lineWidth = 12; rr(cx, px - pw / 2 - 22, py - ph / 2 - 22, pw + 44, ph + 44, (ph + 44) / 2); cx.stroke();
    cx.restore();
    const pg = cx.createLinearGradient(0, py - ph / 2, 0, py + ph / 2); pg.addColorStop(0, '#5aa6f2'); pg.addColorStop(1, '#2f86e0');
    cx.fillStyle = pg; rr(cx, px - pw / 2, py - ph / 2, pw, ph, ph / 2); cx.fill();
    txt(cx, 'YES', px, py + 3, 64, '#ffffff', 'center', '800');
    txt(cx, 'Keep the memories', px, h * 0.8, 34, '#3c4c6a', 'center', '600');
  };
  CARDS.a1_yes.size = [760, 430];

  // A2: Chase's and Luka's 2026 phones, close. d.mode: 'upload' (Pudding — two, his thumb over POST) · 'posted' (Plays:
  // d.plays) · 'email' (Re: what else have you got?, d.attach, d.typed, d.sent) · 'calling' (RUE (BRICK))
  function wave(cx, x, y, w, h, col) {
    cx.fillStyle = col; let s = 11;
    for (let i = 0; i < 46; i++) { s = (s * 16807) % 2147483647; const a = 0.25 + 0.75 * Math.abs(Math.sin(i * 0.37) * Math.cos(i * 0.11)) * (0.6 + 0.4 * (s / 2147483647)); const bh = h * a; cx.fillRect(x + i * (w / 46), y + (h - bh) / 2, w / 46 * 0.62, bh); }
  }
  function paperclip(cx, x, y, s, col) {
    cx.strokeStyle = col; cx.lineWidth = s * 0.12; cx.lineCap = 'round';
    cx.beginPath(); cx.moveTo(x + s * 0.3, y + s * 0.2); cx.lineTo(x + s * 0.3, y + s * 0.85); cx.arc(x + s * 0.5, y + s * 0.85, s * 0.2, PI, 0, true); cx.lineTo(x + s * 0.7, y + s * 0.1); cx.arc(x + s * 0.55, y + s * 0.1, s * 0.15, 0, PI, true); cx.lineTo(x + s * 0.4, y + s * 0.75); cx.stroke();
  }
  CARDS.a2_phone = (cx, w, h, d) => {
    const mode = d.mode || 'upload';
    const pw = w * 0.86, ph = h * 0.96, x = (w - pw) / 2, y = (h - ph) / 2, R = 64;
    cx.save(); cx.shadowColor = 'rgba(0,0,0,0.45)'; cx.shadowBlur = 30; cx.shadowOffsetY = 12;
    cx.fillStyle = '#16181d'; rr(cx, x, y, pw, ph, R); cx.fill(); cx.restore();
    cx.strokeStyle = '#4a505c'; cx.lineWidth = 4; rr(cx, x + 2, y + 2, pw - 4, ph - 4, R); cx.stroke();
    const m = 22, sx = x + m, sy = y + m, sw = pw - 2 * m, sh = ph - 2 * m;
    const dark = mode === 'calling';
    cx.save(); rr(cx, sx, sy, sw, sh, R - m); cx.clip();
    cx.fillStyle = dark ? '#0f1524' : '#f4f6fa'; cx.fillRect(sx, sy, sw, sh);
    const fg = dark ? '#eef2fa' : '#1b2130', mute = dark ? '#9aa6c0' : '#6a7488';
    // status bar
    txt(cx, mode === 'calling' ? '7:31' : '7:12', sx + 40, sy + 34, 26, fg, 'left', '700');
    for (let i = 0; i < 4; i++) { cx.fillStyle = fg; cx.fillRect(sx + sw - 150 + i * 12, sy + 44 - (i + 1) * 6, 8, (i + 1) * 6); }
    cx.strokeStyle = fg; cx.lineWidth = 2.5; rr(cx, sx + sw - 88, sy + 24, 46, 22, 5); cx.stroke(); cx.fillStyle = fg; cx.fillRect(sx + sw - 85, sy + 27, 30, 16);
    cx.fillStyle = '#000'; rr(cx, sx + sw / 2 - 70, sy + 14, 140, 38, 19); cx.fill();
    const L = sx + 40, Rr = sx + sw - 40, cw = sw - 80;
    if (mode === 'upload' || mode === 'posted') {
      txt(cx, mode === 'upload' ? 'Upload track' : 'Your track', L, sy + 112, 40, fg, 'left', '700');
      // artwork: a yellow square with a hand-drawn kettle
      const ay = sy + 160, as = 150;
      cx.fillStyle = '#ffd21f'; rr(cx, L, ay, as, as, 14); cx.fill();
      cx.strokeStyle = '#141d3a'; cx.lineWidth = 6; cx.lineJoin = 'round';
      cx.beginPath(); cx.moveTo(L + 42, ay + 112); cx.lineTo(L + 52, ay + 58); cx.lineTo(L + 100, ay + 58); cx.lineTo(L + 110, ay + 112); cx.closePath(); cx.stroke();
      cx.beginPath(); cx.moveTo(L + 104, ay + 72); cx.lineTo(L + 126, ay + 60); cx.stroke();
      cx.beginPath(); cx.arc(L + 76, ay + 52, 20, PI, 0); cx.stroke();
      txt(cx, 'Pudding', L + as + 26, ay + 56, 44, fg, 'left', '800', cw - as - 26);
      txt(cx, 'two.wav  ·  1:58', L + as + 26, ay + 110, 30, mute, 'left', '500', cw - as - 26);
      txt(cx, 'Pudding — two', L, ay + as + 62, 60, fg, 'left', '800', cw);
      wave(cx, L, ay + as + 112, cw, 70, mode === 'upload' ? '#2f6fd6' : '#9fb3d8');
      if (mode === 'upload') {
        const by = sy + sh - 230, bw = cw, bh = 112;
        const pressed = !!d.pressed;
        cx.fillStyle = pressed ? '#1d4fa8' : '#1f6fe0'; rr(cx, L, by, bw, bh, 26); cx.fill();
        txt(cx, 'POST', L + bw / 2, by + bh / 2 + 2, 52, '#ffffff', 'center', '800');
        // his thumb, hovering over POST
        const tx = L + bw * 0.62, ty = by + bh * (pressed ? 0.55 : 0.95);
        cx.save(); cx.translate(tx, ty); cx.rotate(-0.35);
        cx.fillStyle = 'rgba(0,0,0,0.18)'; cx.beginPath(); cx.ellipse(10, 18, 54, 74, 0, 0, PI * 2); cx.fill();
        cx.fillStyle = '#ebba95'; cx.beginPath(); cx.ellipse(0, 40, 50, 76, 0, 0, PI * 2); cx.fill();
        cx.fillStyle = '#f6d7c0'; cx.beginPath(); cx.ellipse(0, -2, 32, 36, 0, PI, 0); cx.fill();
        cx.restore();
      } else {
        const ty = sy + 610;
        cx.fillStyle = '#2e9d4a'; cx.beginPath(); cx.arc(L + 34, ty, 30, 0, PI * 2); cx.fill();
        cx.strokeStyle = '#fff'; cx.lineWidth = 8; cx.lineCap = 'round'; cx.beginPath(); cx.moveTo(L + 20, ty); cx.lineTo(L + 31, ty + 12); cx.lineTo(L + 50, ty - 12); cx.stroke();
        txt(cx, 'Posted.', L + 82, ty + 2, 58, fg, 'left', '800');
        txt(cx, 'Plays:', L, ty + 140, 60, mute, 'left', '700');
        txt(cx, String(d.plays ?? 0), L + 210, ty + 136, 100, fg, 'left', '800');
      }
    } else if (mode === 'email') {
      txt(cx, d.sent ? 'Sent' : 'Reply', L, sy + 112, 40, fg, 'left', '700');
      cx.fillStyle = '#e3e8f1'; cx.fillRect(sx, sy + 146, sw, 2);
      txt(cx, 'To:', L, sy + 190, 32, mute, 'left', '600'); txt(cx, 'Moreton Bay Records', L + 66, sy + 190, 34, fg, 'left', '700', cw - 66);
      cx.fillStyle = '#e3e8f1'; cx.fillRect(sx, sy + 228, sw, 2);
      txt(cx, 'Re: what else have you got?', L, sy + 272, 38, fg, 'left', '700', cw);
      cx.fillStyle = '#e3e8f1'; cx.fillRect(sx, sy + 314, sw, 2);
      let yy = sy + 350;
      if (d.attach) {
        cx.fillStyle = '#e8eefb'; rr(cx, L, yy, cw * 0.72, 76, 16); cx.fill();
        paperclip(cx, L + 16, yy + 14, 48, '#2f6fd6');
        txt(cx, 'two.wav', L + 78, yy + 38, 34, '#1f3f8a', 'left', '700');
        txt(cx, '4.1 MB', L + cw * 0.72 - 20, yy + 38, 22, mute, 'right', '500');
        yy += 110;
      }
      const ty = (d.typed || '');
      txt(cx, ty, L, yy + 40, 56, fg, 'left', '700', cw);
      if (!d.sent) { cx.font = `700 56px ${SYS}`; const tw = Math.min(cx.measureText(ty).width, cw); cx.fillStyle = '#1f6fe0'; cx.fillRect(L + tw + 4, yy + 6, 5, 66); }
      const by = sy + sh - 200;
      if (d.sent) {
        cx.fillStyle = '#2e9d4a'; rr(cx, L, by, cw, 104, 26); cx.fill();
        txt(cx, 'Sent.', L + cw / 2, by + 54, 52, '#ffffff', 'center', '800');
      } else {
        cx.fillStyle = '#1f6fe0'; rr(cx, L + cw * 0.5, by, cw * 0.5, 104, 26); cx.fill();
        txt(cx, 'Send', L + cw * 0.75, by + 54, 44, '#ffffff', 'center', '800');
      }
    } else {   // calling
      txt(cx, 'Calling…', sx + sw / 2, sy + 196, 44, mute, 'center', '600');
      txt(cx, 'RUE (BRICK)', sx + sw / 2, sy + 286, 76, fg, 'center', '800', cw);
      const ay = sy + 470;
      cx.fillStyle = '#26324e'; cx.beginPath(); cx.arc(sx + sw / 2, ay, 110, 0, PI * 2); cx.fill();
      // a brick phone, drawn small in the avatar
      cx.fillStyle = '#2a2c30'; rr(cx, sx + sw / 2 - 32, ay - 70, 64, 140, 10); cx.fill();
      cx.fillRect(sx + sw / 2 + 14, ay - 112, 10, 46);
      cx.fillStyle = '#9fd28a'; cx.fillRect(sx + sw / 2 - 22, ay - 56, 44, 26);
      cx.fillStyle = '#5a5e66'; for (let i = 0; i < 9; i++) cx.fillRect(sx + sw / 2 - 22 + (i % 3) * 16, ay - 14 + Math.floor(i / 3) * 18, 12, 12);
      cx.fillStyle = '#e8463a'; cx.beginPath(); cx.arc(sx + sw / 2, sy + sh - 150, 62, 0, PI * 2); cx.fill();
      cx.strokeStyle = '#fff'; cx.lineWidth = 12; cx.lineCap = 'round'; cx.beginPath(); cx.arc(sx + sw / 2, sy + sh - 132, 34, PI * 1.15, PI * 1.85); cx.stroke();
    }
    cx.restore();
  };
  CARDS.a2_phone.size = [600, 1000];

  // The Wall's new print: four men on a rooftop at golden hour inside a ring of yellow lights. A drone took it. The two
  // older men are faint in it, like a double exposure, but they're there.
  function figure(cx, x, y, s, body, legs, hair, alpha, coat) {
    cx.save(); cx.globalAlpha = alpha;
    cx.fillStyle = legs; cx.fillRect(x - 7 * s, y - 34 * s, 6 * s, 34 * s); cx.fillRect(x + 1 * s, y - 34 * s, 6 * s, 34 * s);
    cx.fillStyle = body; rr(cx, x - 11 * s, y - (coat ? 66 : 64) * s, 22 * s, (coat ? 52 : 32) * s, 5 * s); cx.fill();
    cx.fillRect(x - 15 * s, y - 62 * s, 5 * s, 24 * s); cx.fillRect(x + 10 * s, y - 62 * s, 5 * s, 24 * s);
    cx.fillStyle = '#e2b08e'; cx.beginPath(); cx.arc(x, y - 73 * s, 8 * s, 0, PI * 2); cx.fill();
    cx.fillStyle = hair; cx.beginPath(); cx.arc(x, y - 76 * s, 8.4 * s, PI * 1.05, PI * 1.95); cx.fill();
    cx.restore();
  }
  CARDS.a2_print = (cx, w, h) => {
    // the frame on the wall: black, a white mat, the print
    cx.fillStyle = '#d9d2c2'; cx.fillRect(0, 0, w, h);
    cx.save(); cx.shadowColor = 'rgba(0,0,0,0.4)'; cx.shadowBlur = 24; cx.shadowOffsetY = 10;
    cx.fillStyle = '#17181b'; cx.fillRect(w * 0.08, h * 0.07, w * 0.84, h * 0.86); cx.restore();
    cx.fillStyle = '#f4f1ea'; cx.fillRect(w * 0.105, h * 0.1, w * 0.79, h * 0.8);
    const x = w * 0.165, y = h * 0.17, pw = w * 0.67, ph = h * 0.66;
    cx.save(); cx.beginPath(); cx.rect(x, y, pw, ph); cx.clip();
    const sky = cx.createLinearGradient(0, y, 0, y + ph * 0.55); sky.addColorStop(0, '#f6b26b'); sky.addColorStop(0.6, '#ffd08a'); sky.addColorStop(1, '#ffe3a8');
    cx.fillStyle = sky; cx.fillRect(x, y, pw, ph);
    cx.fillStyle = 'rgba(255,240,200,0.9)'; cx.beginPath(); cx.arc(x + pw * 0.82, y + ph * 0.4, ph * 0.07, 0, PI * 2); cx.fill();
    // the city along the horizon, the river shining, the bridge
    cx.fillStyle = '#6a5a6a';
    let s = 5; for (let i = 0; i < 26; i++) { s = (s * 16807) % 2147483647; const bw = pw / 26, bh = ph * (0.05 + 0.13 * (s / 2147483647)); cx.fillRect(x + i * bw, y + ph * 0.5 - bh, bw * 0.92, bh); }
    cx.fillStyle = '#ffe7b0'; cx.fillRect(x, y + ph * 0.5, pw, ph * 0.025);
    cx.strokeStyle = '#5a4a5a'; cx.lineWidth = 3; cx.beginPath(); cx.moveTo(x + pw * 0.06, y + ph * 0.49); cx.quadraticCurveTo(x + pw * 0.2, y + ph * 0.4, x + pw * 0.34, y + ph * 0.49); cx.stroke();
    // the roof, seen from above
    const dg = cx.createLinearGradient(0, y + ph * 0.52, 0, y + ph); dg.addColorStop(0, '#8d8378'); dg.addColorStop(1, '#6a625a');
    cx.fillStyle = dg; cx.fillRect(x, y + ph * 0.52, pw, ph * 0.48);
    cx.fillStyle = '#a49a8c'; cx.fillRect(x, y + ph * 0.52, pw, ph * 0.03);
    // the ring of yellow lights
    const rx = x + pw * 0.5, ry = y + ph * 0.75, RX = pw * 0.4, RY = ph * 0.17;
    for (let i = 0; i < 64; i++) {
      const a = (i / 64) * PI * 2, px = rx + Math.cos(a) * RX, py = ry + Math.sin(a) * RY;
      const gg = cx.createRadialGradient(px, py, 0, px, py, 12); gg.addColorStop(0, 'rgba(255,224,90,0.95)'); gg.addColorStop(1, 'rgba(255,210,31,0)');
      cx.fillStyle = gg; cx.fillRect(px - 12, py - 12, 24, 24);
      cx.fillStyle = '#fff3b0'; cx.fillRect(px - 2, py - 2, 4, 4);
    }
    // four men: the older two faint, a double exposure
    const fy = ry + RY * 0.35, sc = ph / 330;
    figure(cx, rx - pw * 0.17, fy - 4, sc, '#26272d', '#17181c', '#7d6e60', 0.36, true);     // Luka (2040)
    figure(cx, rx - pw * 0.06, fy, sc, '#141519', '#141519', '#4b3121', 1, false);           // Luka
    figure(cx, rx + pw * 0.05, fy, sc, '#1f6fe0', '#46679d', '#5d3c22', 1, false);           // Chase
    figure(cx, rx + pw * 0.16, fy - 4, sc, '#a8865a', '#4d5f7e', '#7a6656', 0.36, true);     // Chase (2040)
    // the ring's front arc over their feet
    for (let i = 4; i < 29; i++) {
      const a = (i / 64) * PI * 2, px = rx + Math.cos(a) * RX, py = ry + Math.sin(a) * RY;
      cx.fillStyle = 'rgba(255,224,90,0.55)'; cx.fillRect(px - 3, py - 3, 6, 6);
    }
    // print grain and a warm cast
    cx.fillStyle = 'rgba(255,180,90,0.08)'; cx.fillRect(x, y, pw, ph);
    cx.restore();
    const gl = cx.createLinearGradient(x, y, x + pw, y + ph); gl.addColorStop(0, 'rgba(255,255,255,0.16)'); gl.addColorStop(0.45, 'rgba(255,255,255,0)');
    cx.fillStyle = gl; cx.fillRect(x, y, pw, ph);
  };
  CARDS.a2_print.size = [900, 720];

  // ============================================================ the Cloud+ pop-up (SafeSense, 2040-styled), line by line
  const PSYS = 'system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif';
  const CLOUD = ['Cloud+ activated.', 'Your memories are safe.', 'Your 2040 selves will be overwritten.', 'Thank you for saying yes.'];
  function cloudHTML(n) {
    const v = (i) => (i < n ? 'visible' : 'hidden');
    return '<div style="font-family:' + PSYS + ';text-align:center;line-height:1.3">' +
      '<div style="display:flex;align-items:center;justify-content:center;gap:10px;margin:0 0 12px;visibility:' + v(0) + '">' +
      '<i style="display:inline-block;width:24px;height:24px;border-radius:50%;background:radial-gradient(circle at 38% 35%,#fff 0 14%,#8fe0a8 50%,#2e9d4a);color:#fff;font:800 14px/24px ' + PSYS + ';font-style:normal;box-shadow:0 0 10px rgba(80,200,120,.6)">✓</i>' +
      '<b style="font-size:min(26px,6.4vw);font-weight:800;letter-spacing:.02em;color:#1c2a44">' + CLOUD[0] + '</b></div>' +
      '<div style="font-size:min(18px,4.6vw);font-weight:700;color:#1c2a44;visibility:' + v(1) + '">' + CLOUD[1] + '</div>' +
      '<div style="font-size:min(17px,4.3vw);color:#3c4c6a;margin-top:8px;visibility:' + v(2) + '">' + CLOUD[2] + '</div>' +
      '<div style="font-size:min(16px,4vw);font-style:italic;color:#2f86e0;margin-top:12px;visibility:' + v(3) + '">' + CLOUD[3] + '</div></div>';
  }
  // On a portrait phone the bars cover most of the screen and pop-ups sit under them: the bars slide away while it's up.
  const HELD = { p: null, lbOff: false };
  const tall = () => innerHeight > innerWidth;
  async function cloudPop(c) {
    HELD.p = null;
    if (sk(c)) return;
    const sid = c.flow.sceneId, w = Math.min(470, innerWidth - 24);
    const p = c.popup({ style: 'safesense', title: 'SafeSense', icon: 'none', buttons: [], at: [0.5, 0.42], w });
    const m = p.el && p.el.querySelector('.jv-msg');
    HELD.p = p;
    if (tall()) { HELD.lbOff = true; c.ui.letterbox(false); }
    for (let i = 1; i <= 4; i++) {
      if (m) m.innerHTML = cloudHTML(i);
      c.sfx(i === 1 ? 'ss_chirp' : 'tick', { vol: i === 1 ? 0.3 : 0.12 });
      await c.wait(i === 1 ? 1.6 : i < 4 ? 1.75 : 0.6);   // each line read, then the '^' beat
      if (c.flow.sceneId !== sid || sk(c)) return;
    }
  }
  const dropPop = { do: (c) => { if (HELD.p) HELD.p.close(); HELD.p = null; if (HELD.lbOff) c.ui.letterbox(true); HELD.lbOff = false; } };

  // ============================================================ A1 framings and blocking (hq_roof's marks and anchors where they fit)
  const RX = -0.12, RY = 0.74, RZ = -18.86;                         // the Remote's little screen
  const toRemote = (x, z) => Math.atan2(RX - x, RZ - z);
  const ARC = { luka40: [0.91, 0, -17.51], luka: [0.18, 0, -17.73], chase: [-0.36, 0, -17.77], chase40: [-1.10, 0, -17.53] };
  for (const k in ARC) ARC[k][3] = toRemote(ARC[k][0], ARC[k][2]);
  const FOUR = ['chase', 'luka', 'luka40', 'chase40'];
  // [JARVIS-CAM] from just behind and above the Remote's screen (as 3.7's), aimed at their eyes
  const JCAM = { shot: 'JARVIS', at: [RX, RY, RZ], from: [-0.12, 1.12, -19.5], on: FOUR, size: 'CLOSE', move: 'push', amount: 0.94, dur: 10, ease: 'linear' };
  // the goodbyes: two pairs facing each other a pace apart, each turned a little toward its lens (north of them, so the
  // ring's south arc, the parapet and the city are behind them). The older two swap pairs for lines 14-18.
  const E_IN = [0.6, 0, -17.5, H + 0.5], E_OUT = [1.36, 0, -17.38, -H - 0.5];
  const W_IN = [-0.6, 0, -17.5, -H - 0.5], W_OUT = [-1.36, 0, -17.38, H + 0.5];
  const LENS_E = glide([1.0, 1.56, -19.55], [1.0, 1.42, -17.42], 36, [1.0, 1.55, -19.25], null, 36, 9);
  const LENS_W = glide([-1.0, 1.56, -19.55], [-1.0, 1.42, -17.42], 36, [-1.0, 1.55, -19.25], null, 36, 9);
  // the lanyard changes hands: the same two-shot, closer, their faces and the hands between them
  const LENS_E_TIGHT = glide([0.98, 1.6, -19.05], [0.98, 1.36, -17.44], 44, [0.98, 1.58, -18.9], [0.98, 1.36, -17.44], 42, 5);
  // [WIDE · the roof] from the ring's north edge, a little west: the four round the Remote side by side (none hidden
  // behind another), the present in the foreground, the parapet and the city beyond
  const WIDE_LOW = glide([-1.6, 1.85, -21.7], [0.1, 1.2, -17.5], 44, [-1.5, 1.82, -21.4], [0.1, 1.2, -17.5], 44, 9);
  // the older two crossing between the pairs: from the Yes sign's side, a little higher
  const CROSS = glide([-3.7, 1.95, -21.9], [0.0, 1.1, -17.4], 44, [-3.5, 1.9, -21.6], [0.0, 1.1, -17.4], 44, 5);
  // the call
  const DIAL = { luka: [-0.68, 0, -18.12, toRemote(-0.68, -18.12)], luka40: [1.45, 0, -17.95, toRemote(1.45, -17.95)], chase40: [-1.25, 0, -17.55, toRemote(-1.25, -17.55)] };
  // [MID] over his shoulder at the Remote: his hands on the brick phone (the set's pre-call check lens, as 3.7's)
  const DIAL_MID = lensPush('s37_check', 0.84, 7);
  const SPLIT_L = { shot: 'INSERT', at: 'a1_split_roof', move: 'push', amount: 0.9, dur: 30, ease: 'linear' };
  // the white pours from the Remote: closer, the four round it (left half)
  const SPLIT_L_PUSH = glide([-0.2, 1.42, -20.75], [-0.3, 0.95, -18.0], 46, [-0.2, 1.38, -20.5], [-0.3, 0.95, -18.0], 46, 6);
  // the right half: Luke at the till, across the counter (waist up, the receiver at his ear)
  const LUKE_MID = { shot: 'CAM', half: 'right', pos: [6.3, 1.85, -7.4], look: [7.05, 1.47, -9.95], fov: 34, to: { pos: [6.4, 1.82, -7.75], look: [7.05, 1.49, -9.95], fov: 34 }, dur: 10, ease: 'linear' };   // a little above the till and the monitor
  const SPLIT_R = { shot: 'INSERT', at: 'a1_split_store' };
  // the After: two men on the parapet cap, shoulder to shoulder, facing the city
  const SIT_L40 = [-0.3, 1.2, -11.25, 0], SIT_C40 = [0.3, 1.2, -11.25, 0];
  const PARAPET_WIDE = lensPush('a1_parapet_wide', 0.82, 14);
  // from in front of them, a floating lens beyond the parapet: both faces, the roof and the ring behind them
  const FRONT_TWO = glide([0.4, 2.12, -9.0], [0.0, 1.98, -11.25], 38, [0.35, 2.1, -9.3], [0.0, 1.98, -11.25], 38, 12);
  const FRONT_BUDS = glide([0.55, 2.05, -9.85], [0.05, 1.86, -11.25], 34, [0.5, 2.04, -10.0], [0.05, 1.86, -11.25], 34, 8);
  const SLATE = lensPush('a1_hands_slate', 0.88, 6);
  const BEHIND = { shot: 'INSERT', at: 'a1_behind', locked: true };   // [WIDE · locked, from behind them, the city ahead]
  const EARBUDS = lensPush('a1_earbuds', 0.9, 3.5);
  // Home: the backroom (reddy26). Rue's exact frame, then from above.
  const FLOOR_L = [5.85, 0, -27.25, 0.0], FLOOR_C = [6.85, 0, -27.25, 0.0];
  // [TOP-DOWN] turned a quarter: the two of them lying across the wide frame, heads to the right, Luka above Chase (the
  // dialogue box clear of them): it reads as two men on a floor, not two men against a wall
  const TOP_TWO = glide([6.57, 2.7, -27.55], [6.55, 0.0, -27.55], 56, [6.57, 2.55, -27.55], [6.55, 0.0, -27.55], 54, 12);
  const TOP_LUKA = glide([5.87, 1.5, -27.75], [5.85, 0.0, -27.75], 42, [5.87, 1.36, -27.75], [5.85, 0.0, -27.75], 42, 8);   // his face and the lanyards, the same way up
  // Luke's eyeline (over his shoulder in the doorway, down onto them), and the floor's view up at him (on his right, so
  // his mug hand is the far one)
  const FROM_DOOR = glide([6.88, 1.92, -24.12], [6.3, 0.15, -27.3], 46, [6.86, 1.9, -24.2], [6.3, 0.15, -27.3], 44, 6);
  const UP_AT_LUKE = glide([6.62, 0.45, -26.4], [6.4, 1.6, -24.55], 40, [6.6, 0.45, -26.2], [6.4, 1.6, -24.55], 38, 6);

  // ------------------------------------------------------------ A1 dressing (Continue / Chapter Select restart at step 0)
  function dressA1(c) {
    begin(c);
    const f = c.state.flags;
    f.hurt = true; f.lanyard_snapped = true; f.bandaged = true; delete f.santa;
    for (const id of ['luka', 'chase', 'luka40', 'chase40']) {
      const a = act(c, id);
      if (!a) continue;
      a.rig.dress(c.state);
      a.visible = true;
      if (id === 'luka40') a.rig.show('hood', false);
    }
    touch(c, ['luka', 'chase', 'luka40', 'chase40']);
    const s = SETS.hq_roof;
    if (s.dress) s.dress('golden37');
    const ring = ud(c, 'ring'); if (ring) { ring.level(1, 0); ring.flicker(true); ring.pulse(0); ring.flare(0, 0); }
    const w = ud(c, 'whiteout'); if (w && w.reset) w.reset();
    const rg = ud(c, 'remote_rig'); if (rg) { rg.screen('check'); rg.trill(false); }
    if (s.lamp) s.lamp('ring');
    L40.obj = null; lanyard40Obj(c);
    // the split's right half and the homecoming: build reddy26 behind the first shots
    c.world.liveMax = Math.max(c.world.liveMax || 3, 3);
    c.world.prebuild('reddy26');
  }

  // ============================================================ SCENE A1 — "Keep"
  SCENES.A1 = {
    title: 'Keep', set: 'hq_roof', env: 'golden', timeCard: false,
    playable: [], swap: false, music: 'lullaby', hud: null,
    spawn: { luka: ARC.luka, chase: ARC.chase, luka40: ARC.luka40, chase40: ARC.chase40 },
    steps: [
      ['do', dressA1],
      ['cutscene', 'A1_keep'],
      ['cutscene', 'A1_goodbyes'],
      ['cutscene', 'A1_call'],
      ['cutscene', 'A1_after'],
      ['cutscene', 'A1_home'],
    ],
    grants: { flags: { hurt: true, lanyard_snapped: true, bandaged: true, santa: false }, items: ['lanyard40'], choice: 'A' },
  };

  // ------------------------------------------------------------ "A1_keep": YES; Cloud+ activated; the roof, silent
  CUTSCENES.A1_keep = [
    put('luka', ARC.luka), put('chase', ARC.chase), put('luka40', ARC.luka40), put('chase40', ARC.chase40),
    up([['luka', 'a1_hurt'], ['chase', 'idle'], ['luka40', 'idle'], ['chase40', 'idle']]),
    { expr: [['luka', 'worried'], ['chase', 'worried'], ['luka40', 'still'], ['chase40', 'still']] },
    // 1. [INSERT] YES.
    { shot: 'INSERT', at: 's37_hands', card: ['a1_yes', {}] },
    { sfx: 'ss_chirp', vol: 0.25, rate: 1.1 },
    { wait: 2.2 },
    // 2. [JARVIS-CAM] The pop-up changes: Cloud+ activated. ^ Your memories are safe. ^ Your 2040 selves will be
    // overwritten. ^ Thank you for saying yes.
    JCAM,
    { wait: 0.5 },
    { do: cloudPop },
    { expr: [['chase', 'stunned'], ['luka', 'sad']] },
    { wait: 1.6 },
    dropPop,
    // 3. [WIDE · the roof] Nobody says anything for a moment. Then Future Luka nods, once. Chase (2040) breathes out.
    { do: (c) => { const rg = ud(c, 'remote_rig'); if (rg) rg.screen('off'); } },
    { expr: [['chase', 'sad'], ['luka', 'sad'], ['luka40', 'still'], ['chase40', 'still']] },
    WIDE_LOW,
    { wait: 2.6 },
    { act: [['luka40', 'a1_nod1', { dur: 0.8, loop: false }]] },
    { wait: 1.5 },
    { act: [['chase40', 'a1_exhale', { dur: 2.0, loop: false }]] },
    { wait: 2.2 },
  ];

  // ------------------------------------------------------------ "A1_goodbyes" (each a short two-shot)
  // Future Luka's lanyard goes from his chest to Luka's left hand under the cut to the hands.
  function lanyardChanges(c) {
    const a = act(c, 'luka'), b = act(c, 'luka40'), o = lanyard40Obj(c);
    if (!a || !o) return;
    if (a.held !== o) a.hold(o, 'L');
    if (b && b.held === o) { b.held = null; b.carry = null; }
    o.visible = true; palm(o, 0.4);
    if (!c.state.inventory.includes('lanyard40')) c.inventory.add('lanyard40');
  }
  CUTSCENES.A1_goodbyes = [
    put('luka', E_IN), put('luka40', E_OUT), put('chase', W_IN), put('chase40', W_OUT),
    up([['luka', 'a1_hurt'], ['luka40', 'idle'], ['chase', 'idle'], ['chase40', 'idle']]),
    { expr: [['luka', 'sad'], ['luka40', 'still'], ['chase', 'sad'], ['chase40', 'still']] },
    { wait: 0.05 },
    // 4. Future Luka unclips his faded lanyard, the 1158 badge, and puts it in Luka's hand, closing his fingers round it.
    LENS_E,
    { wait: 0.7 },
    { act: [['luka40', 'a1_unclip', { dur: 1.8 }]] },
    { wait: 1.9 },
    { do: lanyardChanges },
    { act: [['luka', 'a1_receive'], ['luka40', 'a1_cup']] },
    LENS_E_TIGHT,
    { sfx: 'cloth_swish', vol: 0.12 },
    { wait: 2.6 },
    // 5.
    LENS_E,
    { wait: 0.3 },
    slow('luka40', "Don't twist it."),
    // 6.
    { act: [['luka', 'a1_hurt'], ['luka40', 'idle']] },
    say('luka', "I won't."),
    // 7.
    CLOSE('luka40', { yaw: -0.7, dist: 1.05, push: 0.1, dur: 6, fov: 34 }),
    { expr: [['luka40', 'fond']] },
    say('luka40', 'You will. ^ Just not as much.'),
    // 8. (to Chase)
    { expr: [['luka40', 'still'], ['chase40', 'still']] },
    LENS_W,
    { wait: 0.3 },
    say('chase40', 'Finish things.'),
    // 9.
    say('chase', 'I will.', { expr: 'determined' }),
    // 10.
    say('chase40', 'Bad ones.'),
    // 11.
    { expr: [['chase', 'sheepish']] },
    say('chase', 'Mostly bad ones.'),
    // 12.
    CLOSE('chase40', { yaw: 0.55, dist: 1.05, push: 0.1, dur: 6, fov: 34 }),
    { expr: [['chase40', 'fond']] },
    say('chase40', 'And ring Rue.'),
    // 13.
    CLOSE('chase', { yaw: -0.55, dist: 1.05, push: 0.1, dur: 5, fov: 34 }),
    { expr: [['chase', 'sad']] },
    say('chase', 'Every Sunday.'),
    // (the older two change places: one round the back of the Remote, one round the front)
    { expr: [['luka40', 'still'], ['chase40', 'still']] },
    CROSS,
    { move: 'luka40', to: [0.0, 0, -18.4], speed: 1.2, face: false, nowait: true },
    { move: 'chase40', to: [0.0, 0, -16.55], speed: 1.25, face: false },
    { move: 'luka40', to: W_OUT, speed: 1.1, nowait: true },
    { move: 'chase40', to: E_OUT, speed: 1.15 },
    { do: (c) => { const t0 = clock.t; return waitUntil(() => c.flow.skipping || clock.t - t0 > 3 || (Math.abs(act(c, 'luka40').pos.x - W_OUT[0]) < 0.05)); } },
    put('luka40', W_OUT), put('chase40', E_OUT), { face: 'luka40', to: W_OUT[3], dur: 0 }, { face: 'chase40', to: E_OUT[3], dur: 0 },
    up([['luka40', 'idle'], ['chase40', 'idle']]),
    // 14. (to Chase)
    LENS_W,
    { wait: 0.4 },
    say('luka40', 'Look after him.'),
    // 15.
    say('chase', 'He looks after me.', { expr: 'neutral' }),
    // 16.
    CLOSE('luka40', { yaw: 0.55, dist: 1.05, push: 0.1, dur: 6, fov: 34 }),
    { expr: [['luka40', 'fond']] },
    say('luka40', 'Let him. ^ A bit.'),
    // 17. (to Luka)
    LENS_E,
    { wait: 0.4 },
    say('chase40', 'Let someone else carry a box.'),
    // 18. "…I'll try." (He hears himself. He doesn't say "I'll do it".)
    CLOSE('luka', { yaw: 0.6, dist: 1.0, push: 0.16, dur: 7, fov: 34 }),
    { expr: [['luka', 'sad']] },
    { wait: 0.6 },
    slow('luka', '…I\'ll try.'),
    { do: (c) => { const a = act(c, 'luka'); if (a && !sk(c)) a.rig.face.browLift(0.6); } },
    { wait: 1.5 },
    { do: (c) => { const a = act(c, 'luka'); if (a) a.rig.face.browLift(0); } },
  ];

  // ------------------------------------------------------------ "A1_call": the brick phone; the split; white
  function storeSide(c) {
    const S = SETS.reddy26;
    if (S && S.dress) S.dress('home');
    const fl = ud(c, 'fairy_lights', 'reddy26'); if (fl && fl.power) fl.power(1.3);
    const ph = ud(c, 'store_phone', 'reddy26'); if (ph && ph.ring) ph.ring(false);
    const lk = c.world.spawn('luke', 'a1_luke_count', { set: 'reddy26' });
    if (lk) { lk.place('a1_luke_count'); lk.visible = true; lk.setExpr('tired'); lk.play('type'); }
    hatOn(c);
    touch(c, ['luke']);
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
    lk.play('phone_bare');                                      // the counter handset, not his own phone
    lk.setExpr('tired');
  }
  function pour(c) {
    const ring = ud(c, 'ring', 'hq_roof'), w = ud(c, 'whiteout', 'hq_roof'), rg = ud(c, 'remote_rig', 'hq_roof');
    if (ring) { ring.pulse(1); ring.flare(0.85, 1.8); }
    if (rg) { rg.trill(false); rg.screen('white'); }
    if (w && w.pour) w.pour(4.2);
    c.world.env('whiteout', sk(c) ? 0 : 5.5, 'hq_roof');
    fadeRig(c, 'luka', 0, 3.0, 0.9);
    fadeRig(c, 'chase', 0, 3.0, 0.9);
  }
  CUTSCENES.A1_call = [
    put('chase', 'a1_dial'), put('luka', DIAL.luka), put('luka40', DIAL.luka40), put('chase40', DIAL.chase40),
    up([['luka', 'a1_hurt'], ['luka40', 'idle'], ['chase40', 'idle']]),
    { act: [['chase', 'a1_dial']] },
    { expr: [['chase', 'determined'], ['luka', 'worried'], ['luka40', 'still'], ['chase40', 'still']] },
    screen('call'),
    // 19. [MID] Chase dials on the brick phone. The double trill.
    DIAL_MID,
    { wait: 0.6 },
    { act: [['chase', 'a1_dial', { dial: true }]] },
    { sfx: 'key_beep', vol: 0.3, at: [0.1, 0.72, -18.9] }, { wait: 0.22 }, { sfx: 'key_beep', vol: 0.3, rate: 1.1, at: [0.1, 0.72, -18.9] }, { wait: 0.22 },
    { sfx: 'key_beep', vol: 0.3, rate: 0.95, at: [0.1, 0.72, -18.9] }, { wait: 0.22 }, { sfx: 'key_beep', vol: 0.3, rate: 1.05, at: [0.1, 0.72, -18.9] }, { wait: 0.4 },
    { act: [['chase', 'a1_dial']] },
    { do: (c) => { const rg = ud(c, 'remote_rig'); if (rg) rg.trill(true); const ring = ud(c, 'ring'); if (ring) ring.pulse(0.4); } },
    { sfx: 'trill', vol: 0.45 },
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
    { sfx: 'clunk', vol: 0.25 },
    LUKE_MID,
    { wait: 0.6 },
    // 20.
    say('luke', 'Optus Redcliffe. ^ We\'re closed.'),
    // 21.
    say('operator', 'You have a reverse-charge call from Chase and Luka, Optus Redcliffe. ^ 2040. ^ Will you accept the charges?', { tag: 'down the line' }),
    // 22. [RIGHT HALF · CLOSE · Luke] A very long sigh.
    { do: (c) => { closeOn(c, 'luke', { half: 'right', yaw: 0.35, dist: 1.12, push: 0.14, dur: 8, fov: 38 }); } },
    { act: [['luke', 'a1_sigh', { dur: 2.8, loop: false }]] },
    { wait: 3.2 },
    // 23.
    say('luke', '…Is it them?'),
    // 24.
    say('operator', 'Please answer yes or no.', { tag: 'down the line' }),
    // 25.
    { expr: [['luke', 'fond']] },
    say('luke', 'Yes. ^ Obviously yes.'),
    // 26. [LEFT HALF] White pours across the roof from the Remote. Luka and Chase fade into it. The split closes; the left
    // half fills the frame.
    { music: null, fade: 4 },
    { split: { left: { shot: SPLIT_L_PUSH } } },
    { sfx: 'flash_hum', vol: 0.5 },
    { do: pour },
    { wait: 3.2 },
    { split: null, slide: true },
    { wait: 1.6 },
    { fade: 'out', dur: 1.0, color: '#fff' },
  ];

  // ------------------------------------------------------------ "A1_after" (still 2040: it takes its time)
  function dressAfter(c) {
    const s = SETS.hq_roof;
    if (s.dress) s.dress('a1_after');
    if (s.lamp) s.lamp('sitters');
    const w = ud(c, 'whiteout', 'hq_roof'); if (w && w.reset) w.reset();
    c.world.env('afterglow', 0, 'hq_roof');
    lanyardChanges(c);
    for (const id of ['luka', 'chase']) { const a = act(c, id); if (a) a.visible = false; }   // gone home (they keep what they hold)
    const l = act(c, 'luka40'), h = act(c, 'chase40');
    for (const [a, at] of [[l, SIT_L40], [h, SIT_C40]]) {
      if (!a) continue;
      a.visible = true; a.place(at); a.play('a1_perch', { m: 0 });
      if (a.rig.attach.earbud) a.rig.attach.earbud.visible = false;
    }
    if (l) l.setExpr('still');
    if (h) h.setExpr('tired');
    if (h && h.rig.attach.slate) h.rig.attach.slate.visible = false;
  }
  function playTwo(c) {
    slateList(c, 'two', ['▶  two.wav', '', '', '']);
    // full while they listen; the earbuds' tinny bleed waits silently in sync, for when they've gone
    songPair(c, { from: 'FINAL', speakerB: 'bleed', gainA: 0.95, fade: 1.2 });
  }
  // He looks at his hand: in front of him and off his left shoulder, the raised hand big in the foreground, his face
  // behind it (read at step time, the pose up)
  function handLens(c) {
    if (sk(c)) return;
    const a = act(c, 'luka40'); if (!a) return;
    a.rig.parts.handL.getWorldPosition(V2); a.eyePos(V1);
    const mx = (V1.x + V2.x) / 2, my = (V1.y + V2.y) / 2, mz = (V1.z + V2.z) / 2, sx = Math.sin(a.rotY + 0.55), sz = Math.cos(a.rotY + 0.55);
    c.cam.shot({ shot: 'CAM', pos: [V2.x + sx * 0.95, V2.y + 0.06, V2.z + sz * 0.95], look: [mx, my, mz], fov: 38,
      to: { pos: [V2.x + sx * 0.8, V2.y + 0.05, V2.z + sz * 0.8], look: [mx, my, mz], fov: 36 }, dur: 5, ease: 'linear' });
  }
  // "the edges of it are starting to fade": his left glove and forearm dither out first (rig.ghost; dress() resets it)
  const HAND_L = ['handL', 'foreL'];
  function handFade(c, to, dur) {
    const a = act(c, 'luka40');
    if (!a || !a.rig.ghost) return;
    touch(c, ['luka40']);
    tween(c, dur, (u) => { a.rig.ghost(HAND_L, 1 - (1 - to) * smooth(u)); });
  }
  function budsIn(c) {
    for (const id of ['luka40', 'chase40']) { const a = act(c, id); if (a && a.rig.attach.earbud) a.rig.attach.earbud.visible = true; }
  }
  CUTSCENES.A1_after = [
    { do: dressAfter },
    // 27. [WIDE · the roof] Two men sit on the parapet, shoulder to shoulder, the ring of drones glowing around them. The
    // Valley's music drifts up.
    PARAPET_WIDE,
    { fade: 'in', dur: 2.6 },
    { wait: 3.6 },
    // 28.
    FRONT_TWO,
    { wait: 0.6 },
    { act: [['luka40', 'a1_perch', { m: 0, ly: 0.55 }]] },
    { wait: 0.6 },
    slow('luka40', 'Can I ask you something I never asked?'),
    { act: [['chase40', 'a1_perch', { m: 0, ly: -0.45 }]] },
    // 29.
    say('chase40', 'Go on.'),
    // 30.
    CLOSE('luka40', { yaw: 0.28, dist: 1.0, push: 0.1, dur: 6, fov: 34 }),
    say('luka40', 'Why Pudding?'),
    // 31. (smiling)
    CLOSE('chase40', { yaw: -0.28, dist: 1.0, push: 0.1, dur: 6, fov: 34 }),
    { expr: [['chase40', 'fond']] },
    { wait: 0.4 },
    slow('chase40', '…It\'s a long story.'),
    // 32. "We've got—" (He looks at his hand. The edges of it are starting to fade, like a photo left in the sun.)
    CLOSE('luka40', { yaw: 0.28, dist: 1.0, push: 0.05, dur: 4, fov: 34 }),
    { expr: [['luka40', 'fond']] },
    say('luka40', 'We\'ve got—', { auto: 0.25 }),
    { expr: [['luka40', 'still']] },
    { act: [['luka40', 'a1_perch', { m: 3 }]] },
    { wait: 1.0 },
    { do: handLens },
    { do: (c) => { fadeRig(c, 'luka40', 0.86, 2.4, 0.3); handFade(c, 0.42, 2.4); } },
    { wait: 2.6 },
    CLOSE('luka40', { yaw: 0.28, dist: 1.05, push: 0.12, dur: 7, fov: 34 }),
    { act: [['luka40', 'a1_perch', { m: 0 }]] },
    { expr: [['luka40', 'sad']] },
    { wait: 0.5 },
    slow('luka40', '…We haven\'t got time, have we.'),
    // 33. (laughing softly)
    CLOSE('chase40', { yaw: -0.28, dist: 1.0, push: 0.08, dur: 6, fov: 34 }),
    { expr: [['chase40', 'laugh']] },
    { sfx: 'titter', vol: 0.12, rate: 0.82 },
    say('chase40', 'No.'),
    { expr: [['chase40', 'fond'], ['luka40', 'fond']] },
    // 34. [CLOSE · Chase (2040)'s hands] He takes out his music slate, untangles a pair of earbuds, and gives one to Luka
    // (2040). One each. Plays two.
    { do: (c) => { const a = act(c, 'chase40'); if (a && a.rig.attach.slate) a.rig.attach.slate.visible = true; slateList(c, 'two', ['two.wav', '', '', '']); } },
    { act: [['chase40', 'a1_perch', { m: 1 }]] },
    SLATE,
    { sfx: 'cloth_swish', vol: 0.1 },
    { wait: 2.6 },
    FRONT_BUDS,
    { act: [['chase40', 'a1_perch', { m: 2 }]] },
    { wait: 1.2 },
    { do: budsIn },
    { act: [['luka40', 'a1_perch', { m: 5 }], ['chase40', 'a1_perch', { m: 1 }]] },
    { wait: 1.1 },
    { sfx: 'tick', vol: 0.15 },
    { do: playTwo },
    { act: [['luka40', 'a1_perch', { m: 0 }]] },
    { wait: 2.4 },
    // 35. [WIDE · locked, from behind them, the city ahead] The two of them listening, shoulder to shoulder. Over the
    // length of the song's last chorus they fade, very gently, until the parapet is empty.
    { do: (c) => { const a = act(c, 'chase40'); if (a && a.rig.attach.slate) a.rig.attach.slate.visible = false; } },
    { act: [['luka40', 'a1_perch', { m: 4, side: -1 }], ['chase40', 'a1_perch', { m: 4, side: 1 }]] },
    { expr: [['luka40', 'fond'], ['chase40', 'fond']] },
    BEHIND,
    { wait: 2.6 },
    { do: (c) => { fadeRig(c, 'luka40', 0, 15, 0.55, { ease: false }); fadeRig(c, 'chase40', 0, 15.4, 0.55, { ease: false }); const s = ud(c, 'sun'); if (s && !sk(c)) tween(c, 18, (u) => s.y(-1.2 * u)); } },
    { wait: 9.0 },
    { do: (c) => { const b = P(c, 'earbuds', 'hq_roof'); if (b) b.visible = true; } },
    { wait: 3.6 },
    // (the song collapses into the two little buds on the concrete)
    { do: () => { songCross(2.6, 3.0); } },
    { wait: 3.0 },
    // A pair of earbuds lies on the wet concrete, still playing, tinny.
    EARBUDS,
    { wait: 2.8 },
    // The ring of yellow drones. The city. Hold 4 s.
    BEHIND,
    { wait: 4.0 },
    // 36. Fade to white.
    { fade: 'out', dur: 2.4, color: '#fff' },
    { do: () => { songStop(1.2); } },
  ];

  // ------------------------------------------------------------ "A1_home" (2026, the backroom: Rue's Act One frame)
  function dressHome(c) {
    songStop(0.6);
    fadeReset();
    const S = SETS.reddy26;
    if (S && S.dress) S.dress('home');
    const sm = ud(c, 'smoke_backroom', 'reddy26'); if (sm && sm.amount) sm.amount(1, 0);
    const d = P(c, 'backroom_door', 'reddy26'); if (d) { d.rotation.y = 0; d.userData.open = false; }
    const lk = act(c, 'luke');
    if (lk) { if (lk.held) lk.hold(null); lk.place('a1_luke_door'); lk.play('a1_stand'); lk.setExpr('stunned'); lk.visible = false; }
    hatOn(c);
    for (const [id, at] of [['luka', FLOOR_L], ['chase', FLOOR_C]]) {
      const a = act(c, id);
      if (!a) continue;
      a.rig.dress(c.state); a.rig.show('lanyard2', false); a.visible = true; a.place(at); a.play('a1_lie'); a.setExpr('sleep');
      fadeRig(c, id, 0, 0);                                     // (under the white: gone, until the smoke clears)
    }
    // Luka holds two lanyards: his own, snapped, and one fourteen years more faded
    const l = act(c, 'luka'), o = lanyard40Obj(c);
    if (l && o && l.held !== o) l.hold(o, 'L');
    if (o) palm(o, 0.6);
    ownLanyardToHand(c);
    touch(c, ['luka', 'chase', 'luke']);
  }
  function arrive(c) {
    const sm = ud(c, 'smoke_backroom', 'reddy26'), tb = ud(c, 'tube', 'reddy26');
    if (sm && sm.amount) sm.amount(0.12, sk(c) ? 0 : 4.5);
    if (tb && tb.flicker && !sk(c)) tb.flicker(4);
    fadeRig(c, 'luka', 1, 3.2, 0.7, { from: 0 });
    fadeRig(c, 'chase', 1, 3.2, 0.7, { from: 0 });
  }
  function bang(c) {
    const d = ud(c, 'backroom_door', 'reddy26'); if (d && d.bang) d.bang();
    const lk = act(c, 'luke'); if (lk) { lk.visible = true; lk.place('a1_luke_door'); lk.setExpr('stunned'); }
  }
  CUTSCENES.A1_home = [
    // 37. [WIDE · locked, the backroom, Thursday 24 December 2026, 18:58] The exact frame that ended Rue's Act One: the
    // empty backroom, smoke curling up to the flickering tube. It clears. Two men on the floor.
    { set: 'reddy26', env: 'evening', spawn: { luka: FLOOR_L, chase: FLOOR_C, luke: 'a1_luke_door' } },
    { do: dressHome },
    { music: null, cut: true },
    { hud: null },
    { shot: 'INSERT', at: 'backroom_wide', locked: true },
    { fade: 'in', dur: 1.6 },
    { do: (c) => { const tb = ud(c, 'tube', 'reddy26'); if (tb && tb.flicker && !sk(c)) tb.flicker(3); } },
    { wait: 1.6 },
    { do: arrive },
    { do: lanyardsOnChest },
    { sfx: 'smoke_pop', vol: 0.2 },
    { wait: 3.8 },
    // 38. [TOP-DOWN] Luka and Chase, side by side on their backs. Luka holds two lanyards: his own, snapped, and one
    // fourteen years more faded. (The signal fills to four bars: they're home.)
    TOP_TWO,
    { hud: { noService: false, quiet: null, samples: false, bars: 0 } },
    { wait: 1.2 },
    { do: (c) => { const a = act(c, 'luka'); if (a) a.setExpr('tired'); const b = act(c, 'chase'); if (b) b.setExpr('tired'); } },
    { hud: { bars: 4 }, anim: 2.4 },
    { wait: 1.6 },
    // 39.
    { expr: [['luka', 'worried']] },
    say('luka', '…Chase?'),
    // 40.
    { act: [['chase', 'a1_lie', { turn: 0.7 }]] },
    { expr: [['chase', 'stunned']] },
    slow('chase', 'I remember.'),
    // 41.
    { expr: [['luka', 'stunned']] },
    slow('luka', 'I remember.'),
    // 42. (They both laugh. It's half crying. Neither of them minds.)
    { expr: [['luka', 'laugh'], ['chase', 'laugh']] },
    { act: [['luka', 'a1_lie', { laugh: true }], ['chase', 'a1_lie', { laugh: true }]] },
    { sfx: 'smp_laugh', vol: 0.22, rate: 0.96 },
    { wait: 1.4 },
    { expr: [['chase', 'crying']] },
    { wait: 1.0 },
    { expr: [['luka', 'tearful'], ['chase', 'laugh']] },
    { wait: 1.0 },
    // 43. [WIDE · the corridor door bangs open] Luke, in his Santa hat.
    { shot: 'INSERT', at: 'home_door' },
    { do: bang },
    { sfx: 'wall_hit', vol: 0.4 },
    { act: [['luka', 'a1_lie', { look: 1 }], ['chase', 'a1_lie', { look: 1 }]] },
    { expr: [['luka', 'stunned'], ['chase', 'stunned']] },
    { wait: 0.7 },
    // 44.
    say('luke', 'Where have you two BEEN?'),
    // 45.
    FROM_DOOR,
    { expr: [['luka', 'sheepish']] },
    say('luka', '…Lunch?'),
    // 46.
    UP_AT_LUKE,
    { expr: [['luke', 'determined']] },
    say('luke', 'For TWO DAYS?'),
    // 47. (to Luka)
    TOP_TWO,
    { act: [['luka', 'a1_lie', { look: 0.4 }], ['chase', 'a1_lie', { look: 0.4, turn: 0.7 }]] },
    { expr: [['chase', 'fond'], ['luka', 'neutral']] },
    say('chase', 'Two days.'),
    // 48. "It was me—" (He stops. Looks at Chase.) "…It was us."
    TOP_LUKA,
    { expr: [['luka', 'determined']] },
    say('luka', 'It was me—', { auto: 0.25 }),
    { act: [['luka', 'a1_lie', { look: 0.3, turn: -0.75 }]] },
    { expr: [['luka', 'neutral']] },
    { wait: 1.1 },
    { expr: [['luka', 'fond']] },
    slow('luka', '…It was us.'),
    // 49.
    UP_AT_LUKE,
    { expr: [['luke', 'stunned']] },
    say('luke', 'What?'),
    // 50.
    FROM_DOOR,
    { act: [['luka', 'a1_lie', { look: 1 }], ['chase', 'a1_lie', { look: 1 }]] },
    { expr: [['chase', 'determined'], ['luka', 'fond']] },
    say('chase', 'It was us. Both of us.'),
    // 51. [CLOSE · Luke] He looks at the two of them on the floor for a long time.
    { expr: [['luke', 'tired']] },
    CLOSE('luke', { yaw: 0.25, dist: 1.0, push: 0.22, dur: 9, fov: 36, ly: -0.03 }),
    { wait: 3.4 },
    // 52.
    { expr: [['luke', 'fond']] },
    slow('luke', '…Merry Christmas. ^ Get out of my store.'),
    { wait: 0.8 },
    { music: 'lullaby', fade: 3 },
    { fade: 'out', dur: 1.8 },
  ];

  // ============================================================ SCENE A2 — "Christmas Morning"
  // the badge turning over in his hands (the lanyard group is in his left grip; its badge is its child)
  const BADGE = { obj: null, t: 0 };
  function badgeTick(dt) {
    const b = BADGE.obj;
    if (!b) { removeUpdate(badgeTick); return; }
    BADGE.t += dt;
    b.rotation.y = PI * smooth(0.5 + 0.5 * Math.sin(BADGE.t * 0.9 - H));
    b.rotation.x = 0.15 * Math.sin(BADGE.t * 1.3);
  }
  function dressA2(c) {
    begin(c);
    const f = c.state.flags;
    f.hurt = true; f.lanyard_snapped = true; f.bandaged = true; delete f.santa;
    if (!c.state.inventory.includes('lanyard40')) c.state.inventory.push('lanyard40');
    for (const id of ['luka', 'chase']) {
      const a = act(c, id);
      if (!a) continue;
      a.rig.dress(c.state); a.visible = true;
      a.play('a2_grass'); a.setExpr('neutral');
    }
    // Christmas morning: a clean polo; the bandage is under it; a graze healing at his hairline
    const l = act(c, 'luka');
    if (l) { l.rig.show('hurt', false); l.rig.show('bandage', false); l.rig.show('lanyard2', false); l.rig.face.mark('graze', true); }
    touch(c, ['luka', 'chase']);
    const S = SETS.foreshore26; if (S && S.dress) S.dress('xmas26');
    const cf = ud(c, 'coffees', 'foreshore26'); if (cf && cf.hold) cf.hold('luka', true, 'R');
    L40.obj = null; lanyard40Obj(c);
    c.world.liveMax = Math.max(c.world.liveMax || 3, 3);
    c.world.prebuild('reddy26');   // the montage
  }
  SCENES.A2 = {
    title: 'Christmas Morning', set: 'foreshore26', env: 'xmas_morning', time: 'Friday 25 December 2026, 7:10 am', place: 'Woody Point',
    playable: [], swap: false, music: null, hud: null,
    spawn: { luka: 'a2_luka', chase: 'a2_chase' },
    steps: [
      ['do', dressA2],
      ['cutscene', 'A2_morning'],
      ['cutscene', 'A2_montage'],
    ],
    grants: { flags: { hurt: true, lanyard_snapped: true, bandaged: true, santa: false }, items: ['lanyard40'], choice: 'A' },
  };

  // ------------------------------------------------------------ "A2_morning"
  const PHONE_C = { shot: 'INSERT', at: 'a2_phone_chase' };
  const PHONE_L = { shot: 'INSERT', at: 'a2_phone_luka' };
  const TWO_FRONT = lensPush('a2_two_front', 0.86, 12);
  const card = (kind, data) => ({ do: (c) => { if (!sk(c)) c.ui.card(kind, data); } });
  // [TOP-DOWN] straight down over his head (his front at the top of the frame), close enough that the hands rising
  // toward it read; a slow rise away (read at step time)
  function topDownChase(c) {
    if (sk(c)) return;
    const a = act(c, 'chase'); if (!a) return;
    a.eyePos(V1);
    const fx = Math.sin(a.rotY), fz = Math.cos(a.rotY), x = V1.x + fx * 0.12, z = V1.z + fz * 0.12;
    c.cam.shot({ shot: 'CAM', pos: [x - fx * 0.03, V1.y + 1.25, z - fz * 0.03], look: [x, V1.y - 0.4, z], fov: 52,
      to: { pos: [x - fx * 0.03, V1.y + 1.45, z - fz * 0.03], look: [x, V1.y - 0.4, z], fov: 52 }, dur: 6, ease: 'linear' });
  }
  async function typeEmail(c) {
    const sid = c.flow.sceneId, msg = 'Sorry for the wait.';
    if (sk(c)) return;
    c.ui.card('a2_phone', { mode: 'email', attach: false, typed: '' });
    await c.wait(1.2); if (c.flow.sceneId !== sid || sk(c)) return;
    c.sfx('tick', { vol: 0.14 });
    c.ui.card('a2_phone', { mode: 'email', attach: true, typed: '' });
    await c.wait(1.0);
    for (let n = 3; n <= msg.length && !sk(c); n += 3) {
      if (c.flow.sceneId !== sid) return;
      c.ui.card('a2_phone', { mode: 'email', attach: true, typed: msg.slice(0, Math.min(n, msg.length)) });
      c.sfx('key_type', { vol: 0.08, rate: 0.9 + (n % 5) * 0.05 });
      await c.wait(0.24);
    }
    if (c.flow.sceneId !== sid || sk(c)) return;
    c.ui.card('a2_phone', { mode: 'email', attach: true, typed: msg });
    await c.wait(1.0); if (c.flow.sceneId !== sid || sk(c)) return;
    c.sfx('whoosh', { vol: 0.16 });
    c.ui.card('a2_phone', { mode: 'email', attach: true, typed: msg, sent: true });
    await c.wait(1.6);
  }
  function lanyardInHands(c) {
    const l = act(c, 'luka'), cf = ud(c, 'coffees', 'foreshore26');
    if (cf && cf.hold) cf.hold('luka', false);
    if (!l || !L40.obj) return;
    if (l.held !== L40.obj) l.hold(L40.obj, 'L');
    L40.obj.visible = true; palm(L40.obj, 0.3);
    l.play('a2_turn');
    later(c, badgeInHands, 18);
    const b = L40.obj.userData.badge;
    if (b && !sk(c)) { BADGE.obj = b; BADGE.t = 0; addUpdate(badgeTick); }
  }
  function lanyardDown(c) {
    removeUpdate(badgeTick);
    if (BADGE.obj) { BADGE.obj.rotation.set(0, BADGE.obj.userData.flip ? PI : 0, 0); BADGE.obj = null; }
    const l = act(c, 'luka'); if (l && l.held) l.hold(null);
  }
  CUTSCENES.A2_morning = [
    put('luka', 'a2_luka'), put('chase', 'a2_chase'),
    { act: [['luka', 'a2_grass'], ['chase', 'a2_phone']] },
    { expr: [['luka', 'neutral'], ['chase', 'neutral']] },
    // 1. [WIDE · locked, the angle from 2.3] The headland. Where the bench will never be, Luka and Chase sit on the grass
    // with takeaway coffees. Christmas morning, cool for once.
    { shot: 'INSERT', at: 'wp_canon', locked: true },
    { wait: 4.0 },
    // 2. [INSERT · Chase's phone] A music upload page: Pudding — two. He hovers over POST.
    Object.assign({ card: ['a2_phone', { mode: 'upload' }] }, PHONE_C),
    { wait: 3.0 },
    // 3. [TOP-DOWN · Chase] His hands start to rise toward his head. They stop halfway. He laughs instead, and presses POST.
    { do: topDownChase },
    { expr: [['chase', 'worried']] },
    { act: [['chase', 'a2_halt', { dur: 2.6 }]] },
    { wait: 2.7 },
    { expr: [['chase', 'laugh']] },
    { act: [['chase', 'a2_laugh']] },
    { sfx: 'titter', vol: 0.16, rate: 1.05 },
    { wait: 1.5 },
    { act: [['chase', 'a2_phone', { press: true }]] },
    { expr: [['chase', 'happy']] },
    { wait: 0.35 },
    Object.assign({ card: ['a2_phone', { mode: 'upload', pressed: true }] }, PHONE_C),
    { sfx: 'button_press', vol: 0.3 },
    { wait: 0.7 },
    // 4. [INSERT] Posted. Plays: 0. 1. (Luka's phone pings in his pocket.) 2.
    card('a2_phone', { mode: 'posted', plays: 0 }),
    { do: (c) => { songPair(c, { from: 'INTRO', speakerA: 'phone', gainA: 0.55, fade: 0.4 }); } },
    { wait: 1.6 },
    card('a2_phone', { mode: 'posted', plays: 1 }),
    { sfx: 'ding', vol: 0.2, rate: 1.25, lp: 1600 },
    { wait: 1.5 },
    card('a2_phone', { mode: 'posted', plays: 2 }),
    { wait: 1.6 },
    // 5.
    TWO_FRONT,
    { do: (c) => { glanceAt(c, 'chase', 'luka', 2.0); } },
    { expr: [['luka', 'fond'], ['chase', 'happy']] },
    say('luka', 'That\'s me.'),
    // 6.
    say('chase', 'That\'s you.'),
    // 7. [INSERT] Chase opens the email from Moreton Bay Records ("Re: what else have you got?"), attaches two.wav, and
    // types: Sorry for the wait. Sent.
    { act: [['chase', 'a2_phone']] },
    PHONE_C,
    { do: typeEmail },
    { do: (c) => { c.ui.card(null); } },
    // 8. (Quiet. The bay.)
    { act: [['chase', 'a2_grass', { down: true }]] },
    lensPush('a2_bridge', 0.92, 6),
    { wait: 3.4 },
    // 9. LUKA (turning the faded 2040 lanyard over in his hands)
    { do: lanyardInHands },
    { expr: [['luka', 'still']] },
    { wait: 0.05 },
    { do: (c) => {
      if (sk(c)) return;
      const a = act(c, 'luka'); if (!a) return;
      a.rig.parts.handL.getWorldPosition(V1);
      c.cam.shot({ shot: 'CAM', pos: [V1.x - 0.5, V1.y + 0.55, V1.z + 0.82], look: [V1.x + 0.05, V1.y, V1.z + 0.06], fov: 36,
        to: { pos: [V1.x - 0.44, V1.y + 0.5, V1.z + 0.72], look: [V1.x + 0.05, V1.y, V1.z + 0.06], fov: 34 }, dur: 7, ease: 'linear' });
    } },
    { wait: 1.4 },
    say('luka', 'Do you think about them?'),
    // 10.
    TWO_FRONT,
    { act: [['chase', 'a2_grass']] },
    say('chase', 'It\'s been a day.'),
    // 11.
    say('luka', '…Yeah.'),
    // 12.
    say('chase', 'Every day, probably.'),
    // 13.
    CLOSE('luka', { yaw: -0.3, dist: 1.0, push: 0.12, dur: 8, fov: 34 }),
    { expr: [['luka', 'worried']] },
    say('luka', 'What if I still— ^ what if we still turn into—', { auto: 0.3 }),
    // 14.
    CLOSE('chase', { yaw: 0.3, dist: 1.0, push: 0.12, dur: 7, fov: 34 }),
    { expr: [['chase', 'determined']] },
    { wait: 0.4 },
    slow('chase', 'Then I\'ll be awake.'),
    // 15. (Luka looks at him. Nods.)
    CLOSE('luka', { yaw: 0.6, dist: 1.15, push: 0.1, dur: 5, fov: 34, dy: -0.1, ly: -0.04 }),
    { do: (c) => { glanceAt(c, 'luka', 'chase', 2.4); } },
    { expr: [['luka', 'fond']] },
    { wait: 1.4 },
    { act: [['luka', 'a1_nod1', { dur: 0.8, loop: false }]] },
    { wait: 1.2 },
    // 16. (taking out his phone)
    { do: lanyardDown },
    TWO_FRONT,
    { act: [['luka', 'a2_phone'], ['chase', 'a2_grass']] },
    { expr: [['luka', 'neutral'], ['chase', 'neutral']] },
    { wait: 0.6 },
    say('luka', 'It\'s not Sunday.'),
    // 17.
    { do: (c) => { glanceAt(c, 'chase', 'luka', 1.8); } },
    say('chase', 'Ring him anyway.', { expr: 'fond' }),
    // 18. [INSERT · Luka's phone] Calling: RUE (BRICK). The old double trill begins. (Cut before anyone answers.)
    Object.assign({ card: ['a2_phone', { mode: 'calling' }] }, PHONE_L),
    { wait: 0.5 },
    { sfx: 'trill', vol: 0.32, lp: 3000 },
    { wait: 1.15 },
  ];

  // ------------------------------------------------------------ "A2_montage" (three quiet held frames, the song playing)
  function frame1(c) {
    const S = SETS.reddy26;
    if (S && S.dress) S.dress('days_later');
    const t = ud(c, 'hero_table', 'reddy26'); if (t && t.set) t.set('new');
    const sm = ud(c, 'hero_table', 'reddy26'); if (sm && sm.smudge1) sm.smudge1(false);
    for (const id of ['luka', 'chase']) {
      const a = act(c, id); if (!a) continue;
      a.rig.seated = false; a.rig.floorSit = false; a.visible = true;
    }
    const l = act(c, 'luka');
    if (l) { l.place('a2_luka_polish'); l.play('a2_polish'); l.setExpr('determined'); l.rig.show('lanyard', true); l.rig.show('lanyard2', false); l.rig.show('hurt', false); l.rig.show('bandage', false); }
    const ch = act(c, 'chase');
    if (ch) { ch.place('a2_chase'); ch.play('idle'); ch.setExpr('neutral'); }
    if (!sk(c)) songCross(0.9, 1.6);
  }
  function shine(c) {
    if (sk(c)) return Promise.resolve();
    return tween(c, 2.6, (u) => { c.ui.meter('SHINE ' + Math.round(88 + 10 * u) + '%', 0.88 + 0.1 * u); });
  }
  function frame2(c) {
    c.ui.meter(null, null);
    const S = SETS.reddy26;
    if (S && S.dress) S.dress('tinsel_down');
    const ch = act(c, 'chase'); if (ch) ch.visible = false;
    const j = c.world.spawn('jordan', 'a2_jordan_top');
    if (j) { j.place('a2_jordan_top'); j.play('a2_unhook'); j.setExpr('neutral'); }
    const l = act(c, 'luka');
    if (l) { l.place('a2_luka_hold'); l.play('a2_steady'); l.setExpr('fond'); }
    touch(c, ['jordan']);
  }
  function frame3(c) {
    const S = SETS.reddy26;
    if (S && S.dress) S.dress('wall_print');
    for (const id of ['luka', 'jordan']) { const a = act(c, id); if (a) a.visible = false; }
  }
  function grassEmpty(c) {
    const S = SETS.foreshore26; if (S && S.dress) S.dress('xmas26_empty');
    const g = ud(c, 'grass_f26', 'foreshore26'); if (g && g.gust) g.gust(true);
  }
  CUTSCENES.A2_montage = [
    // 19. [MONTAGE · three quiet held frames, the song playing; only the first has any dialogue]
    // — The 2026 store a few days later. Luka at the new Hero Table, polishing. He gets to 98%, looks at a smudge, and
    // leaves it. Chase: "You missed a bit." Luka: "I know."
    { set: 'reddy26', env: 'day', spawn: { luka: 'a2_luka_polish', chase: 'a2_chase' } },
    { do: frame1 },
    lensPush('a2_polish', 0.86, 9),
    { do: shine },
    { do: (c) => { const t = ud(c, 'hero_table', 'reddy26'); if (t && t.smudge1) t.smudge1(true); } },
    { act: [['luka', 'a2_polish', { stop: true }]] },
    { expr: [['luka', 'neutral']] },
    { wait: 1.4 },
    { do: (c) => { glanceAt(c, 'chase', 'luka', 2.0); } },
    say('chase', 'You missed a bit.'),
    { act: [['luka', 'idle']] },
    { expr: [['luka', 'fond']] },
    say('luka', 'I know.'),
    { wait: 0.8 },
    // — Jordan up the ladder taking the tinsel down. Luka at the bottom, holding the ladder, letting him.
    { do: frame2 },
    lensPush('a2_ladder', 0.94, 6),   // (the set's frame: B1's 2027 is the same frame, roles reversed)
    { wait: 4.2 },
    // — The Wall. The 1987 Polaroid. The PUDDING cassette. And a new print: four men on a rooftop at golden hour inside a
    // ring of yellow lights. A drone took it. The two older men are faint in it, like a double exposure, but they're there.
    { do: frame3 },
    glide([6.75, 1.86, -19.78], [5.42, 1.9, -19.8], 42, [6.35, 1.88, -19.79], [5.42, 1.94, -19.8], 40, 7),
    { wait: 2.6 },
    Object.assign({ card: ['a2_print', {}] }, glide([6.3, 1.9, -19.79], [5.42, 1.98, -19.8], 40, [6.1, 1.95, -19.79], [5.42, 2.0, -19.8], 38, 4)),
    { wait: 3.6 },
    // 20. [WIDE · Woody Point] The grass where the bench would have been. Wind.
    { set: 'foreshore26' },
    { do: grassEmpty },
    { loop: 'wind_gust', vol: 0.5, fade: 1.2 },
    lensPush('a2_grass', 0.9, 7),
    { wait: 4.0 },
    // 21. Title: TWO.
    { do: () => { songStop(3.5); } },
    { fade: 'out', dur: 1.2 },
    { title: 'two', dur: 4 },
    { loop: 'wind_gust', stop: true, fade: 1.5 },
    { wait: 0.6 },
  ];

  // ============================================================ A-ONLY CODA — "One possible 2040" (run after the credits)
  // CUTSCENES['A_coda']: [CLOSE · locked] A store counter we don't quite recognise. A phone rings. Two older hands reach
  // for it at the same time: one with a faded blue lanyard looped round the wrist, one with no scars on it at all.
  // VOICE 1 / VOICE 2. (Both laugh. We never see their faces.) Black. — Self-contained: it starts black, loads reddy26
  // (prebuild it during the credits: world.prebuild('reddy26')), dresses it for the night, and ends on black.
  const CODA_L = [7.84, 0, -9.74, -0.48], CODA_C = [7.25, 0, -9.74, 0.52];
  // the two hands land side by side on the handset (about a hand's width apart), not one on top of the other
  const CODA_REACH_L = { sd: -1, go: false, x: 0.0, h: 1.07, z: 0.53 }, CODA_REACH_C = { sd: 1, go: false, x: 0.0, h: 1.07, z: 0.53 };
  const CODA_SHOT = { shot: 'INSERT', at: 'counter_phone', locked: true };   // over the counter, steep: hands, no faces
  function codaDress(c) {
    begin(c);
    const S = SETS.reddy26;
    if (S && S.dress) S.dress('home_night');
    const t = ud(c, 'clock_hands', 'reddy26'); if (t && t.set) t.set(16, 40);
    for (const id of ['luka', 'chase']) {
      const a = act(c, id); if (!a) continue;
      a.visible = true; a.rig.seated = false; a.rig.floorSit = false;
      a.rig.show('hurt', false); a.rig.show('bandage', false); a.rig.show('headphones_neck', false); a.rig.show('lanyard', false); a.rig.show('lanyard2', false);
      a.setExpr('neutral');
    }
    const l = act(c, 'luka'), c2 = act(c, 'chase');
    if (l) { l.place(CODA_L); l.play('coda_reach', CODA_REACH_L); }
    if (c2) { c2.place(CODA_C); c2.play('coda_reach', CODA_REACH_C); }
    // the faded blue lanyard looped round the wrist: the neck loop, small, round his right forearm by the hand
    L40.obj = null;
    const o = lanyard40Obj(c);
    if (l && o) {
      if (o.parent && l.held === o) l.hold(null);
      const d = l.rig.d || {}, T = d.T || 0.47, fore = d.fore || 0.26, sc = 0.42;
      borrow(o, l.rig.parts.foreR);
      o.scale.setScalar(sc); o.rotation.set(0, 0, 0); o.position.set(0, -fore * 0.9 - T * sc, 0.004);
      o.visible = true;
    }
    touch(c, ['luka', 'chase']);
    // one warm light over the counter (the spot as a lamp; the rest of the store stays in the dark)
    const sp = c.world.torch;
    if (sp) {
      c.world.torchAuto = false; sp.intensity = 3.2; sp.color.set(0xffe2b8); sp.angle = 0.55; sp.penumbra = 0.7; sp.distance = 12;
      sp.position.set(7.4, 3.0, -8.7); sp.target.position.set(7.55, 1.0, -9.25); sp.target.updateMatrixWorld();
      LAMP.on = true;
    }
  }
  const LAMP = { on: false };
  function lampOff() { if (!LAMP.on || typeof world === 'undefined') return; const sp = world.torch; if (sp) sp.intensity = 0; world.torchAuto = true; LAMP.on = false; }
  CUTSCENES.A_coda = [
    { fade: 'out', dur: 0 },
    { music: null, cut: true },
    { hud: null },
    { popup: null, clear: true },
    { set: 'reddy26', env: 'evening', spawn: { luka: CODA_L, chase: CODA_C } },
    { do: codaDress },
    CODA_SHOT,
    { timeCard: 'One possible 2040' },
    { fade: 'in', dur: 1.4 },
    { wait: 1.2 },
    { do: (c) => { const ph = ud(c, 'store_phone', 'reddy26'); if (ph && ph.ring) ph.ring(true); } },
    { sfx: 'phone_ring', vol: 0.3 },
    { wait: 1.6 },
    { act: [['luka', 'coda_reach', Object.assign({}, CODA_REACH_L, { go: true, dur: 1.1 })], ['chase', 'coda_reach', Object.assign({}, CODA_REACH_C, { go: true, dur: 1.0 })]] },
    { wait: 0.5 },
    say('voice1', 'I\'ll get it—', { auto: 0.15 }),
    say('voice2', '—I\'ve got it.'),
    { do: (c) => { const ph = ud(c, 'store_phone', 'reddy26'); if (ph && ph.ring) ph.ring(false); } },
    // (Both laugh. We never see their faces.)
    { sfx: 'smp_laugh', vol: 0.28, rate: 0.86 },
    { sfx: 'titter', vol: 0.18, rate: 0.8 },
    { wait: 2.6 },
    // Black.
    { fade: 'out', dur: 1.4 },
    { do: () => { borrowHome(); lampOff(); } },
    { wait: 0.5 },
  ];
})();
