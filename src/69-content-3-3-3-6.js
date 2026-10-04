// ============================================================ CONTENT: 3.3 ("The Manager"), 3.4 ("85%"), 3.5 ("99%"), 3.6 ("two")
// BUILD_PROMPT §8 3.3–3.6, §10 (the boss), §15.3 (the song). Every line is final and word for word; '^' = a beat. Shot
// tags are quoted in the comments. Set: hq_top (docs/sets/hq_top.md, src/21-set-hq-top.js: dresses s33/s34/s35/s36 by
// scene, every mark/anchor/prop named here is the set's) and, for 3.6 steps 26–27, the valley set (lit36), prebuilt
// under the black at the start of 3.6 and cut to for the passer-by's chip view and the mall from above.
// 3.3: the reveal is a lanyard before it's a face (the badge flips to 1158, Luka turns his own over, the filter drops with
//   a click, THE MANAGER -> LUKA (2040) glitches on screen, hint 1 paid off: the glance at Chase (2040) with the empty
//   chair in the frame), every hint paid off, the USB-C port, the idea engine's ORBIT with the "two" groove (music 'boss',
//   which carries on into 3.4), beforelunch, every drone red.
// 3.4: MINIGAMES.boss (src/51-mg-boss.js) says the 3.4 lines itself as barks; its result's drone positions seed 3.5.
// 3.5: the foam, the pleas, the photo, the one-frame NO, the strike (no humour anywhere: played as a death; the high
//   ringing, the rain heard through water), he gets up, the wave, the ring of Yes-yellow drones, PAUSED.
// 3.6: the headphones, "It's yet.", "two" in full from state.pattern on AUDIO.seq with a small conductor here: the
//   sections run in order (the bridge carries the laugh), the final chorus (D major, the 1987 melody) loops while Future
//   Luka holds NO (MINIGAMES.hold_no, src/52-mg-hold.js), the outro (the restart chime) comes in at the end of a phrase
//   once the Valley has lit up. Shots are cut to the song's bars. With no audio the conductor runs on the game clock.
// Story flags: santa false (the hat and beard were dropped on the sleigh in 3.2), headphones (Chase, since L12); hurt +
//   lanyard_snapped from the strike (3.5). Continue restarts a scene at step 0: each scene dresses itself from scratch.
(() => {
  const PI = Math.PI, H = PI / 2, TAU = PI * 2;
  const say = (id, text, o) => Object.assign({ say: id, text }, o);
  const slow = (id, text, o) => say(id, text, Object.assign({ speed: 'slow' }, o));
  const sk = (c) => c.flow.skipping;
  const act = (c, id) => c.world.actor(id);
  const ud = (c, n, set) => { const o = c.world.prop(n, set); return o ? o.userData : null; };
  const K = () => (typeof RIGKIT !== 'undefined' ? RIGKIT : null);
  const V1 = new THREE.Vector3(), V2 = new THREE.Vector3(), V3 = new THREE.Vector3(), Q1 = new THREE.Quaternion();
  const DOWN = new THREE.Vector3(0, -1, 0);
  const AN = (n) => (SETS.hq_top && SETS.hq_top.anchors && SETS.hq_top.anchors[n]) || null;
  const play = (id, anim, o) => ({ act: [[id, anim, o || {}]] });
  const expr = (id, e) => ({ expr: [[id, e]] });
  const put = (id, at) => ({ place: id, at });
  const face = (id, to, dur = 0.4) => ({ face: id, to, dur });
  const glide = (pos, look, fov, to, dur = 6, ease = 'linear') => ({ shot: 'CAM', pos, look, fov, to, dur, ease });
  const lerp3 = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
  const ez = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
  const spd = () => (TEST.auto ? TEST.speed : 1);
  // an anchor of hq_top as a lens, pushing `push` of the way toward its target over `dur`
  function anchor(n, o = {}) {
    const a = AN(n);
    if (!a) return { wait: 0 };
    const look = o.look || a.at, to = { pos: lerp3(a.from, a.at, o.push ?? 0.08), look: o.lookTo || look, fov: o.fovTo || o.fov || a.fov };
    if (o.rise) to.pos[1] += o.rise;
    const s = { shot: 'CAM', pos: a.from.slice(), look: look.slice(), fov: o.fov || a.fov, to, dur: o.dur || 6, ease: o.ease || 'linear' };
    if (o.card) s.card = o.card;
    return s;
  }
  // a tween on the game clock (fn gets 0..1, linear), snapped at once while skipping or when the scene changes
  function tween(c, dur, fn) {
    const sid = c.flow.sceneId;
    if (c.flow.skipping || !(dur > 0)) { fn(1); return Promise.resolve(); }
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
  // a computed close-up: the lens `dist` m from his eyes, `yaw` rad off his facing (+ = toward his left), pushing in
  // `push` m over `dur` s. Read at step time (faces placed under the cut); nothing while skipping.
  function closeOn(c, id, o = {}) {
    if (sk(c)) return;
    const a = act(c, id);
    if (!a) return;
    if (!o.keepCard) c.ui.card(null);
    a.eyePos(V1);
    const turning = !!(a.fc && a.fc.on);
    if (turning) {   // mid-turn (a face step is not awaited): frame where the turn ends
      const dr = a.fc.a1 - a.rotY, dx = V1.x - a.pos.x, dz = V1.z - a.pos.z, cs = Math.cos(dr), sn = Math.sin(dr);
      V1.x = a.pos.x + dx * cs + dz * sn; V1.z = a.pos.z - dx * sn + dz * cs;
    }
    const ry = (o.rot ?? (turning ? a.fc.a1 : a.rotY)) + (o.yaw || 0), d = o.dist || 0.95, pu = o.push ?? 0.1, ly = V1.y - 0.05 + (o.ly || 0);
    const sx = Math.sin(ry), sz = Math.cos(ry), y = V1.y + (o.dy ?? -0.02), lx = V1.x + (o.lx || 0), lz = V1.z + (o.lz || 0), f = o.fov || 36;
    c.cam.shot({ shot: 'CAM', pos: [V1.x + sx * d, y, V1.z + sz * d], look: [lx, ly, lz], fov: f,
      to: { pos: [V1.x + sx * (d - pu), y + (o.rise || 0), V1.z + sz * (d - pu)], look: [lx, ly + (o.tilt || 0), lz], fov: o.fovTo || f }, dur: o.dur || 7, ease: o.ease || 'linear' });
  }
  const CLOSE = (id, o) => ({ do: (c) => closeOn(c, id, o) });
  // his gloved right hand held out at his side, from low on the room side looking up past it at the glass: the black
  // glove sits over the pop-up's [YES] (and the clock above it), so it reads as a silhouette, and when it fades the YES
  // shows through it
  function handLens(c, push) {
    const a = act(c, 'luka40');
    if (!a || sk(c)) return;
    c.ui.card(null);
    a.rig.parts.handR.getWorldPosition(V1);
    const p = [V1.x + 0.15, V1.y - 0.5, V1.z - 1.2], lk = [V1.x, V1.y + 0.25, V1.z];
    c.cam.shot({ shot: 'CAM', pos: p, look: lk, fov: 40,
      to: { pos: [p[0] + (lk[0] - p[0]) * push, p[1] + (lk[1] - p[1]) * push, p[2] + (lk[2] - p[2]) * push], look: lk, fov: 38 }, dur: 4, ease: 'linear' });
  }
  // over `from`'s shoulder onto `to`'s face (long lenses across the room)
  function otsOn(c, from, to, o = {}) {
    if (sk(c)) return;
    const a = act(c, from), b = act(c, to);
    if (!a || !b) return;
    c.ui.card(null);
    a.eyePos(V1); b.eyePos(V2);
    const dx = V2.x - V1.x, dz = V2.z - V1.z, L = Math.hypot(dx, dz) || 1, fx = dx / L, fz = dz / L, rx = -fz, rz = fx;
    const sd = (o.side ?? 0.34) * (o.shoulder === 'left' ? -1 : 1), bk = o.back ?? 0.8;
    const p = [V1.x - fx * bk + rx * sd, V1.y + (o.dy ?? 0.06), V1.z - fz * bk + rz * sd];
    const fov = o.fov || Math.max(12, Math.min(40, (2 * Math.atan(1.1 / (L + bk)) * 180) / PI));
    const look = [V2.x + rx * sd * 0.25, V2.y - 0.1 + (o.ly || 0), V2.z + rz * sd * 0.25], pu = o.push ?? 0.2;
    c.cam.shot({ shot: 'CAM', pos: p, look, fov, to: { pos: [p[0] + fx * pu, p[1], p[2] + fz * pu], look, fov: o.fovTo || fov }, dur: o.dur || 8, ease: 'linear' });
  }
  const OTS = (from, to, o) => ({ do: (c) => otsOn(c, from, to, o) });
  // a head turn without moving the feet (Luka's tell: he glances at Chase before he speaks)
  function glanceNow(c, from, to, dur = 1.1) {
    if (sk(c)) return;
    const a = act(c, from), b = act(c, to);
    if (!a || !b) return;
    let d = Math.atan2(b.pos.x - a.pos.x, b.pos.z - a.pos.z) - a.rotY; d = Math.atan2(Math.sin(d), Math.cos(d));
    a.play('glance', { yaw: Math.max(-1.3, Math.min(1.3, d)), dur });
  }
  const glanceAt = (from, to, dur = 1.1) => ({ do: (c) => glanceNow(c, from, to, dur) });
  // act when the typewriter reaches `sub` in `line` (any text speed); '^' beats are not typed, so index the typed text
  const typedIndex = (line, sub) => { const out = line.replace(/ ?\^ ?/g, (m, i) => (i === 0 ? '' : ' ')).replace(/ {2,}/g, ' '); return out.indexOf(sub); };
  function onText(line, sub, fn) {
    const i = typedIndex(line, sub);
    return { do: (c) => {
      if (sk(c)) { fn(c); return; }
      const el = document.querySelector('#dlg .txt'), t0 = clock.t;
      return waitUntil(() => {
        if (c.flow.skipping || clock.t - t0 > 30) return true;
        const n = el && el.lastChild;
        return !!n && n.nodeType === 3 && n.length >= i;
      }).then(() => fn(c));
    } };
  }
  const cue = (line, sub, fn) => ({ par: [line, onText(line.text, sub, fn)] });
  const call = (fn) => ({ do: (c) => { fn(c); } });   // a block-bodied do: never awaited

  // ---------------------------------------------------------- anims this file owns (guarded; no allocation per tick)
  function anim(name, fn, upper) { if (!ANIMS[name]) { ANIMS[name] = fn; if (upper) fn.upper = true; } }
  // 3.3: Future Luka turned round; under the open coat his badge swings out and flips over: biro, 1158 (p.dur)
  anim('s33_badge', (r, t, p) => {
    const k = K();
    ANIMS.still(r, t, p);
    const L = r.attach.lanyard;
    if (!L || !k) return;
    // (it starts edge-on, already swinging: only the back is ever read)
    const b = L.userData.badge, u = Math.min(1, t / (p.dur || 2.6)), f = k.ez(Math.min(1, Math.max(0, (u - 0.08) / 0.5)));
    b.rotation.y = H * 1.05 + (PI - H * 1.05) * f + 0.22 * Math.sin(u * 15) * (1 - u) * f;
    b.rotation.x = -0.32 * Math.sin(Math.min(1, u * 1.6) * PI) * (1 - u * 0.6);
  });
  // 3.3: the hood comes down: both hands up to it and back (p.dur 1.8; content swaps the hood at ~45%)
  const hoodPose = (r, t, p) => {
    const k = K(), d = r.d, b = p.hb || 0;
    k.arm(r, 1, 0.1 * d.hs, d.headC + 0.07 * d.hs - 0.05 * b, -0.02 - 0.13 * b, 1, 0.2, -0.3);
    k.arm(r, -1, 0.1 * d.hs, d.headC + 0.07 * d.hs - 0.05 * b, -0.02 - 0.13 * b, 1, 0.2, -0.3);
    r.parts.handL.rotation.set(0, 0, 1.2); r.parts.handR.rotation.set(0, 0, -1.2);
    r.parts.head.rotation.x = 0.08 - 0.06 * b;
  };
  anim('s33_hood', (r, t, p) => {
    const k = K();
    if (!k) return ANIMS.still(r, t, p);
    const u = k.once(t, p, 1.8), up = u < 0.36 ? k.ez(u / 0.36) : u > 0.72 ? k.ez((1 - u) / 0.28) : 1;
    p.hb = u < 0.38 ? 0 : k.ez(Math.min(1, (u - 0.38) / 0.24));
    k.towards(r, t, p, hoodPose, up);
  });
  // 3.3: Chase (2040)'s hands come down off his head (holds the idle pose after p.dur)
  anim('s33_hands_down', (r, t, p) => {
    const k = K();
    if (!k) return ANIMS.idle(r, t, p);
    k.towards(r, t, p, ANIMS.hands_head, 1 - k.ez(Math.min(1, t / (p.dur || 1.4))));
  });
  // 3.5: held in the foam to the chest: forearms on its top, straining. p.v 0 arms on the foam · 1 Chase mid-swing (the
  // right arm up) · 2 Chase (2040) mid-ping (two fingers at the temple); p.look -1..1 lifts the head; p.free lifts an arm
  anim('s35_held', (r, t, p) => {
    const k = K();
    if (!k) return ANIMS.idle(r, t, p);
    k.breathe(r, t, 1.5);
    const P_ = r.parts, d = r.d, v = p.v || 0, tr = 0.006 * Math.sin(t * 23) + 0.004 * Math.sin(t * 37), fr = p.free || 0;
    P_.torso.rotation.x += 0.04 + 0.025 * Math.sin(t * 1.7);
    k.arm(r, 1, 0.24 - 0.04 * fr, 0.1 + tr + 0.2 * fr, d.chestZ + 0.24 + 0.06 * fr, 1, -0.6, -0.5); P_.handL.rotation.x = 0.5 - 0.6 * fr;
    if (v === 1) { k.arm(r, -1, 0.17, d.headC + 0.14, 0.1, 1, -0.2, 0.2); P_.handR.rotation.set(-0.4, 0, 0.3); }
    else if (v === 2) { k.arm(r, -1, 0.11 * d.hs, d.headC - 0.03, 0.02, 0.5, -1, 0.3); P_.handR.rotation.set(0.15, 0, 0.35); }
    else { k.arm(r, -1, 0.24, 0.1 - tr, d.chestZ + 0.24, 1, -0.6, -0.5); P_.handR.rotation.x = 0.5; }
    P_.head.rotation.x = 0.04 - 0.3 * (p.look || 0); P_.neck.rotation.x = -0.08 * (p.look || 0);
  });
  // 3.5: Future Luka bent over his desk, the right hand on the frame (cf. the prologue's rest)
  anim('s35_desk', (r, t, p) => {
    const k = K();
    if (!k) return ANIMS.still(r, t, p);
    k.base(r, t);
    const P_ = r.parts, e = k.ez(Math.min(1, t / 0.9));
    P_.torso.rotation.x = 0.5 * e;
    k.arm(r, -1, 0.2 - 0.12 * e, -0.15 + 0.25 * e, 0.1 + 0.47 * e, 1, -0.6, -0.4);
    P_.handR.rotation.set(-0.45 * e, 0, 0.1 * e); P_.head.rotation.x = 0.3 * e;
  });
  // 3.5: the frame held up in both hands at the chest, his head down to it; p.shake trembles the hands (the frame follows)
  anim('s35_photo', (r, t, p) => {
    const k = K();
    if (!k) return ANIMS.still(r, t, p);
    k.base(r, t);
    const P_ = r.parts, d = r.d, e = k.ez(Math.min(1, t / 0.9)), s = p.shake || 0;
    const a = s * (0.007 * Math.sin(t * 29) + 0.005 * Math.sin(t * 43)), b = s * (0.006 * Math.sin(t * 33 + 1) + 0.004 * Math.sin(t * 51));
    const y = -0.08 + 0.26 * e, z = 0.1 + (d.chestZ + 0.2) * e;
    k.arm(r, 1, 0.1 + 0.08 * (1 - e), y + a, z + b, 1, -0.9, -0.4); k.arm(r, -1, 0.1 + 0.08 * (1 - e), y - b, z + a, 1, -0.9, -0.4);
    P_.handL.rotation.set(-0.6 * e, 0, -0.45 * e); P_.handR.rotation.set(-0.6 * e, 0, 0.45 * e);
    P_.head.rotation.x = 0.42 * e; P_.neck.rotation.x = 0.12 * e; P_.torso.rotation.x += 0.05 * e;
  });
  // 3.5: two fingers flicked, low at his side (one-shot ~1.2 s)
  // 3.5: the gloved right hand held a little out from his side, turned, and he looks down at it (p.dur blend in)
  const handOutPose = (r, t, p) => {
    ANIMS.still(r, t, p);
    const k = K();
    k.arm(r, -1, 0.36, -0.1, r.d.chestZ + 0.1, 0.5, -1, -0.4);
    r.parts.head.rotation.x = 0.4; r.parts.neck.rotation.x = 0.12;
  };
  anim('s35_hand_out', (r, t, p) => {
    const k = K();
    if (!k) return ANIMS.still(r, t, p);
    k.blend2(r, t, p, ANIMS.still, handOutPose, k.ez(Math.min(1, t / (p.dur || 1.0))));
  });
  anim('s35_flick', (r, t, p) => {
    const k = K();
    if (!k) return ANIMS.still(r, t, p);
    k.base(r, t);
    const u = k.once(t, p, 1.2), d = r.d, up = u < 0.35 ? k.ez(u / 0.35) : u > 0.82 ? k.ez((1 - u) / 0.18) : 1, fl = u > 0.46 && u < 0.62 ? Math.sin(((u - 0.46) / 0.16) * PI) : 0;
    k.arm(r, -1, d.shX + 0.04 - 0.04 * up, -0.12 + 0.1 * up, 0.04 + 0.16 * up, 1, -1, -0.3);
    r.parts.handR.rotation.set(-0.25 * up - 0.9 * fl, 0, 0.15);
  });
  // 3.5: torn out of the foam and thrown backwards: folded round the blow, arms and legs flung forward
  anim('s35_thrown', (r, t, p) => {
    const k = K();
    if (!k) return ANIMS.idle(r, t, p);
    const P_ = r.parts, d = r.d;
    r.seated = false; r.floorSit = false;
    P_.torso.rotation.x = 0.72; P_.neck.rotation.x = 0.3; P_.head.rotation.x = 0.45;
    k.arm(r, 1, 0.3, 0.12, 0.42, 1, -0.2, -0.6); k.arm(r, -1, 0.28, 0.04, 0.46, 1, -0.2, -0.6);
    k.leg(r, 1, d.hipX * 1.3, -d.hipY * 0.62, 0.42); k.leg(r, -1, d.hipX * 1.2, -d.hipY * 0.7, 0.32); k.flat(r);
  });
  // 3.5: down the wall from the impact to sitting slumped against it (p.dur), then holds it
  anim('s35_slide', (r, t, p) => {
    const k = K();
    if (!k) return ANIMS.sit_floor_wall(r, t, p);
    const u = Math.min(1, t / (p.dur || 1.1));
    if (u >= 1) { k.floorSit(r, t, p); return; }
    k.blend2(r, t, p, ANIMS.s35_thrown, k.floorSit, k.ez(u));
    r.seated = r.floorSit = u > 0.5;
  });
  // 3.5: getting up, slowly: a hand on the wall, a knee (the left hand finds the snapped lanyard), then up, hunched
  const sitWall = (r, t, p) => {
    const k = K(), d = r.d;
    p.slump = false; k.floorSit(r, t, p);
    k.arm(r, 1, d.shX + 0.18, d.armY - 0.02, -0.2, 1, -0.6, -0.4); r.parts.handL.rotation.set(0, 0, 1.1);
    r.parts.head.rotation.x = 0.25;
  };
  const kneelWall = (r, t, p) => {
    const k = K(), d = r.d, P_ = r.parts;
    k.kneel(r, t);
    P_.torso.rotation.x = 0.34; P_.torso.rotation.z = -0.06;
    k.arm(r, 1, d.shX + 0.24, d.armY + 0.04, -0.18, 1, -0.6, -0.4); P_.handL.rotation.set(0, 0, 1.1);
    k.arm(r, -1, -0.06, 0.16, d.chestZ + 0.03, 1, -1, 0.3); P_.head.rotation.x = 0.3;
  };
  const kneelPick = (r, t, p) => {
    const k = K(), d = r.d, P_ = r.parts;
    k.kneel(r, t);
    P_.torso.rotation.x = 0.55; P_.torso.rotation.z = 0.08;
    k.arm(r, 1, d.shX + 0.26, -0.42, 0.24, 1, -0.4, -0.2); P_.handL.rotation.set(-0.4, 0, 0.2);
    k.arm(r, -1, -0.06, 0.16, d.chestZ + 0.03, 1, -1, 0.3); P_.head.rotation.x = 0.5;
  };
  anim('s35_getup', (r, t, p) => {
    const k = K();
    if (!k) return ANIMS.hurt_stand(r, t, p);
    const u = Math.min(1, t / (p.dur || 9));
    p.slump = true;
    if (u < 0.12) k.floorSit(r, t, p);
    else if (u < 0.3) { p.slump = false; k.blend2(r, t, p, k.floorSit, sitWall, k.ez((u - 0.12) / 0.18)); }
    else if (u < 0.5) k.blend2(r, t, p, sitWall, kneelWall, k.ez((u - 0.3) / 0.2));
    else if (u < 0.6) k.blend2(r, t, p, kneelWall, kneelPick, k.ez((u - 0.5) / 0.1));
    else if (u < 0.68) k.blend2(r, t, p, kneelPick, kneelWall, k.ez((u - 0.6) / 0.08));
    else if (u < 0.94) k.blend2(r, t, p, kneelWall, ANIMS.hurt_stand, k.ez((u - 0.68) / 0.26));
    else ANIMS.hurt_stand(r, t, p);
    r.seated = r.floorSit = u < 0.3;
  });
  // 3.5: the sincere wave: the left arm (the lanyard in his fist) up over his head, one sweep, down (one-shot ~2.4 s)
  anim('s35_wave', (r, t, p) => {
    const k = K();
    ANIMS.hurt_stand(r, t, p);
    if (!k) return;
    const d = r.d, P_ = r.parts, u = k.once(t, p, 2.4);
    const up = u < 0.3 ? k.ez(u / 0.3) : u > 0.8 ? k.ez((1 - u) / 0.2) : 1, sw = u > 0.3 && u < 0.8 ? Math.sin(((u - 0.3) / 0.5) * PI) : 0;
    k.arm(r, 1, d.shX + 0.06 + (0.16 - 0.34 * sw) * up, -0.05 + (d.headC + 0.27) * up, 0.08 + 0.1 * up, 1, -0.6, 0.2);
    P_.handL.rotation.set(0, 0, -0.4 * sw * up);
    P_.torso.rotation.x -= 0.12 * up; P_.head.rotation.x = 0.12 - 0.3 * up;
  });
  // 3.6: Future Luka's face breaks: a gloved hand to his mouth, his shoulders going
  const mouthPose = (r, t, p) => {
    const k = K(), d = r.d, P_ = r.parts;
    k.arm(r, -1, 0.025, d.headC - 0.15, 0.13, 1, -1, -0.2); P_.handR.rotation.set(-1.15, 0, 0.25);
    k.arm(r, 1, d.shX + 0.02, -0.04, 0.06, 1, -1, -0.4);
    P_.head.rotation.x = 0.16; P_.neck.rotation.x = 0.06;
  };
  anim('s36_mouth', (r, t, p) => {
    const k = K();
    if (!k) return ANIMS.still(r, t, p);
    const e = k.ez(Math.min(1, t / 1.6)), sob = 0.014 * Math.max(0, Math.sin(t * 5.8)) * e;
    k.towards(r, t, p, mouthPose, e);
    r.parts.armL.position.y += sob; r.parts.armR.position.y += sob; r.parts.torso.rotation.x += 0.02 * sob / 0.014;
  });
  // 3.6: Luka at the console's east end: reaches down for the dangling phone (right hand), pulls it free, brings it up
  // to his chest; the left hand (the lanyard in his fist) goes to his ribs (one-shot ~2.6 s, then 's36_hold_phone')
  const phoneChest = (r, t, p) => {
    const k = K(), d = r.d, P_ = r.parts;
    ANIMS.hurt_stand(r, t, p);
    k.arm(r, 1, -0.07, 0.17 * (d.T / 0.47), d.chestZ + 0.03, 1, -1, 0.3); P_.handL.rotation.set(0.1, 0, -0.6);
    k.arm(r, -1, 0.04, 0.12 * (d.T / 0.47), d.chestZ + 0.17, 1, -1, -0.3); P_.handR.rotation.set(-0.9, 0.3, 0);
    P_.head.rotation.x = 0.36;
  };
  anim('s36_hold_phone', (r, t, p) => { phoneChest(r, t, p); const tap = p.tap ? Math.max(0, Math.sin(Math.min(1, t / 0.5) * PI)) : 0; r.parts.handR.rotation.x -= 0.25 * tap; });
  anim('s36_pull', (r, t, p) => {
    const k = K();
    if (!k) return ANIMS.hurt_stand(r, t, p);
    const u = k.once(t, p, 2.6), d = r.d, P_ = r.parts;
    if (u > 0.55) { k.blend2(r, t, p, ANIMS.hurt_stand, phoneChest, k.ez((u - 0.55) / 0.45)); return; }
    ANIMS.hurt_stand(r, t, p);
    const dn = u < 0.4 ? k.ez(u / 0.4) : 1 - 0.3 * k.ez((u - 0.4) / 0.15);
    P_.torso.rotation.x += 0.3 * dn;
    k.arm(r, -1, 0.18, -0.08 - 0.3 * dn, 0.12 + 0.3 * dn, 1, -1, -0.4); P_.handR.rotation.set(-0.3 * dn, 0, 0.2);
    P_.head.rotation.x = 0.12 + 0.3 * dn;
  });

  // ---------------------------------------------------------- INSERT cards painted here (2x; CARDS._kit for the house look)
  const KIT = () => CARDS._kit;
  // 3.3 step 71: Luka's 2026 phone on the black console, a USB-C cable in, his thumbs over the keys, the password field
  CARDS.s33_type = Object.assign(function s33_type(cx, w, h, d) {
    const k = KIT(), typed = d.typed || '';
    // the console's black gloss, a cold strip of storm light across it
    let g = cx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#15191e'); g.addColorStop(1, '#07080a');
    cx.fillStyle = g; k.rr(cx, w * 0.02, h * 0.04, w * 0.96, h * 0.92, 26); cx.fill();
    g = cx.createLinearGradient(0, h * 0.1, w, h * 0.5); g.addColorStop(0, 'rgba(160,190,200,0)'); g.addColorStop(0.5, 'rgba(160,190,200,.08)'); g.addColorStop(1, 'rgba(160,190,200,0)');
    cx.fillStyle = g; cx.fillRect(w * 0.02, h * 0.04, w * 0.96, h * 0.92);
    // the cable to the port, off the right edge
    cx.strokeStyle = '#dfe2e6'; cx.lineWidth = 9; cx.lineCap = 'round'; cx.beginPath(); cx.moveTo(w * 0.5, h * 0.93); cx.bezierCurveTo(w * 0.52, h * 1.0, w * 0.9, h * 0.98, w * 0.99, h * 0.8); cx.stroke();
    // the phone, landscape-ish on the gloss
    const px = w * 0.24, py = h * 0.12, pw = w * 0.52, ph = h * 0.8;
    k.shadow(cx, 26, 10); cx.fillStyle = '#16181d'; k.rr(cx, px, py, pw, ph, 38); cx.fill(); k.noShadow(cx);
    const sx = px + 16, sy = py + 16, sw = pw - 32, sh = ph - 32;
    cx.save(); k.rr(cx, sx, sy, sw, sh, 26); cx.clip();
    cx.fillStyle = '#f1f3f7'; cx.fillRect(sx, sy, sw, sh);
    cx.fillStyle = '#1b2130'; cx.font = `bold ${sh * 0.07}px ${k.SYS}`; cx.textBaseline = 'alphabetic'; cx.textAlign = 'left';
    cx.fillText('Optus HQ · Master Console', sx + sw * 0.07, sy + sh * 0.12);
    cx.fillStyle = '#5a6475'; cx.font = `${sh * 0.05}px ${k.SYS}`; cx.fillText('Password', sx + sw * 0.07, sy + sh * 0.24);
    cx.strokeStyle = '#2f86e0'; cx.lineWidth = 4; k.rr(cx, sx + sw * 0.07, sy + sh * 0.28, sw * 0.86, sh * 0.13, 10); cx.stroke();
    cx.fillStyle = '#121620'; cx.font = `${sh * 0.075}px ${k.MONO}`; cx.fillText(typed, sx + sw * 0.1, sy + sh * 0.375);
    const tw = cx.measureText(typed).width; cx.fillStyle = '#2f86e0'; cx.fillRect(sx + sw * 0.1 + tw + 4, sy + sh * 0.305, 4, sh * 0.085);
    // the keyboard
    cx.fillStyle = '#d6dbe3'; cx.fillRect(sx, sy + sh * 0.5, sw, sh * 0.5);
    const rows = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'], kw = sw / 10.6, kh = sh * 0.13;
    rows.forEach((row, ri) => {
      const off = (sw - row.length * kw) / 2;
      for (let i = 0; i < row.length; i++) {
        const kx = sx + off + i * kw + 3, ky = sy + sh * 0.54 + ri * (kh + 6), on = row[i] === d.key;
        cx.fillStyle = on ? '#2f86e0' : '#fbfcfe'; k.rr(cx, kx, ky, kw - 6, kh, 8); cx.fill();
        cx.fillStyle = on ? '#fff' : '#222833'; cx.font = `${kh * 0.5}px ${k.SYS}`; cx.textAlign = 'center'; cx.fillText(row[i], kx + (kw - 6) / 2, ky + kh * 0.68);
      }
    });
    cx.textAlign = 'left';
    cx.restore();
    // his thumbs over the keys (skin, a little blurred by the movement)
    const th = (x, y, a) => { cx.save(); cx.translate(x, y); cx.rotate(a); cx.fillStyle = '#d9a785'; cx.beginPath(); cx.ellipse(0, 0, 34, 70, 0, 0, TAU); cx.fill();
      cx.fillStyle = 'rgba(255,255,255,.35)'; cx.beginPath(); cx.ellipse(-4, -40, 18, 22, 0, 0, TAU); cx.fill(); cx.restore(); };
    const kx2 = d.key ? 'qwertyuiopasdfghjklzxcvbnm'.indexOf(d.key) : 5, left = kx2 % 10 < 5 || (kx2 >= 10 && kx2 < 15) || (kx2 >= 19 && kx2 < 22);
    th(left ? sx + sw * 0.3 : sx + sw * 0.2, sy + sh * 1.02, 0.5); th(left ? sx + sw * 0.82 : sx + sw * 0.7, sy + sh * 1.04, -0.5);
  }, { size: [900, 640] });
  // 3.5 step 16: the photo. Luka and Chase, 2033, on the Woody Point jetty at sunset, laughing so hard they're blurred
  CARDS.s35_photo = Object.assign(function s35_photo(cx, w, h, d) {
    const k = KIT();
    const fw = w * 0.9, fh = h * 0.88, x = (w - fw) / 2, y = (h - fh) / 2;
    k.tilt(cx, w, h, -0.015);
    k.shadow(cx, 30, 12); cx.fillStyle = '#0d0e10'; cx.fillRect(x, y, fw, fh); k.noShadow(cx);   // the black frame
    const mx = x + fw * 0.05, my = y + fh * 0.06, mw = fw * 0.9, mh = fh * 0.88;
    cx.fillStyle = '#f2eee6'; cx.fillRect(mx, my, mw, mh);                                           // the mat
    const ix = mx + mw * 0.06, iy = my + mh * 0.07, iw = mw * 0.88, ih = mh * 0.72;
    // the picture, painted small and scaled up (a phone photo, 2033): sunset over the bay, the jetty, two blurred men
    const c = document.createElement('canvas'); c.width = 240; c.height = 150; const p = c.getContext('2d');
    let g = p.createLinearGradient(0, 0, 0, 90); g.addColorStop(0, '#5b4a7a'); g.addColorStop(0.45, '#e2766a'); g.addColorStop(0.8, '#f6b25e'); g.addColorStop(1, '#ffd98a');
    p.fillStyle = g; p.fillRect(0, 0, 240, 90);
    p.fillStyle = '#fff1b8'; p.beginPath(); p.arc(170, 84, 11, 0, TAU); p.fill();                     // the sun, low
    g = p.createLinearGradient(0, 88, 0, 150); g.addColorStop(0, '#d98a62'); g.addColorStop(1, '#3a3f5c'); p.fillStyle = g; p.fillRect(0, 88, 240, 62);
    p.fillStyle = 'rgba(255,226,160,.55)'; for (let i = 0; i < 26; i++) p.fillRect(150 + ((i * 37) % 44), 92 + ((i * 13) % 50), 6 + (i % 4) * 2, 1);   // glitter
    p.fillStyle = '#3a2c24'; p.beginPath(); p.moveTo(0, 150); p.lineTo(0, 118); p.lineTo(240, 96); p.lineTo(240, 104); p.lineTo(70, 150); p.fill();   // the deck
    p.strokeStyle = '#2a201b'; p.lineWidth = 2; for (let i = 0; i < 9; i++) { p.beginPath(); p.moveTo(i * 26, 150); p.lineTo(i * 26 + 30, 116 - i * 2); p.stroke(); }
    p.fillStyle = '#2a201b'; for (let i = 0; i < 6; i++) p.fillRect(18 + i * 40, 92 - i * 3, 3, 26 - i * 3);   // rail posts
    p.fillRect(0, 96, 240, 2);
    // the two of them, mid-laugh: Luka doubled over, Chase's head thrown back, an arm round each other
    const bc = document.createElement('canvas'); bc.width = 240; bc.height = 150; const bq = bc.getContext('2d');
    const body = (q, x, y, lean, shirt, legs) => {
      q.save(); q.translate(x, y + 46); q.rotate(lean);
      q.fillStyle = legs; q.fillRect(-8, 0, 7, 34); q.fillRect(2, 0, 7, 34);
      q.fillStyle = shirt; q.beginPath(); q.roundRect(-13, -34, 27, 38, 6); q.fill();
      q.restore();
    };
    const head = (q, x, y, hair, tail, beard, tilt) => {
      q.save(); q.translate(x, y); q.rotate(tilt);
      q.fillStyle = '#e2b593'; q.beginPath(); q.arc(0, 0, 9, 0, TAU); q.fill();
      q.fillStyle = hair; q.beginPath(); q.arc(0, -4, 9.5, Math.PI * 1.05, Math.PI * 1.95); q.fill();
      if (tail) q.fillRect(-12, -3, 4, 12);
      if (beard) { q.fillStyle = beard; q.beginPath(); q.arc(0, 3, 7.5, 0.1, Math.PI - 0.1); q.fill(); }
      q.fillStyle = '#5a1e1e'; q.beginPath(); q.ellipse(0, 5, 3.4, 2.6, 0, 0, TAU); q.fill();   // the open laugh
      q.restore();
    };
    body(bq, 100, 40, 0.38, '#17181c', '#1a1b20'); head(bq, 110, 50, '#4b3121', true, '#3d2819', 0.5);    // Luka, folded over
    body(bq, 132, 33, -0.16, '#1f6fe0', '#46679d'); head(bq, 128, 33, '#5d3c22', false, null, -0.45);     // Chase, head back
    bq.fillStyle = '#1f6fe0'; bq.save(); bq.translate(118, 50); bq.rotate(0.5); bq.fillRect(-14, -3, 26, 6); bq.restore();   // his arm round Luka
    bq.fillStyle = '#17181c'; bq.save(); bq.translate(92, 62); bq.rotate(-0.9); bq.fillRect(-4, -14, 7, 24); bq.restore();   // Luka's hand on his knee
    cx.save(); cx.beginPath(); cx.rect(ix, iy, iw, ih); cx.clip();
    cx.imageSmoothingEnabled = true; cx.imageSmoothingQuality = 'high';
    cx.filter = 'blur(1.5px)'; cx.drawImage(c, ix, iy, iw, ih);
    // laughing so hard they're blurred: shaken, several ghosts
    cx.filter = 'blur(5px)';
    for (let i = 0; i < 5; i++) { cx.globalAlpha = i === 2 ? 0.7 : 0.3; cx.drawImage(bc, ix + (i - 2) * 9, iy + ((i * 7) % 9) - 4, iw, ih); }
    cx.globalAlpha = 1; cx.filter = 'none';
    g = cx.createRadialGradient(ix + iw / 2, iy + ih / 2, ih * 0.3, ix + iw / 2, iy + ih / 2, iw * 0.7); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(40,20,30,.35)');
    cx.fillStyle = g; cx.fillRect(ix, iy, iw, ih);
    cx.restore();
    k.hand(cx, 'Woody Pt · 2033', mx + mw / 2, my + mh * 0.9, mh * 0.075, k.BIRO, { pen: true, align: 'center' });
    g = cx.createLinearGradient(x, y, x + fw, y + fh); g.addColorStop(0, 'rgba(255,255,255,.12)'); g.addColorStop(0.35, 'rgba(255,255,255,0)');
    cx.fillStyle = g; cx.fillRect(x, y, fw, fh);   // the glass
  }, { size: [900, 660] });
  // 3.6 step 7: Chase's thumb on Play. The file: two.
  CARDS.s36_play = Object.assign(function s36_play(cx, w, h, d) {
    const k = KIT();
    const pw = w * 0.86, ph = h * 0.95, px = (w - pw) / 2, py = (h - ph) / 2;
    k.shadow(cx, 30, 12); cx.fillStyle = '#15171c'; k.rr(cx, px, py, pw, ph, 52); cx.fill(); k.noShadow(cx);
    const sx = px + 18, sy = py + 18, sw = pw - 36, sh = ph - 36;
    cx.save(); k.rr(cx, sx, sy, sw, sh, 36); cx.clip();
    let g = cx.createLinearGradient(0, sy, 0, sy + sh); g.addColorStop(0, '#1d2340'); g.addColorStop(1, '#0c0f1c'); cx.fillStyle = g; cx.fillRect(sx, sy, sw, sh);
    cx.fillStyle = '#c9d2e8'; cx.font = `600 ${sh * 0.032}px ${k.SYS}`; cx.textAlign = 'left'; cx.fillText('No Service', sx + sw * 0.08, sy + sh * 0.05);
    cx.textAlign = 'right'; cx.fillText('3%', sx + sw * 0.9, sy + sh * 0.05); cx.textAlign = 'center';
    // the "album art": a cassette label in felt tip
    const ax = sx + sw * 0.12, ay = sy + sh * 0.12, aw = sw * 0.76;
    cx.fillStyle = '#f3ecd8'; cx.fillRect(ax, ay, aw, aw);
    k.hand(cx, 'two', ax + aw / 2, ay + aw * 0.58, aw * 0.3, '#141d3a', { felt: true, align: 'center' });
    k.hand(cx, 'Pudding', ax + aw / 2, ay + aw * 0.82, aw * 0.1, k.BIRO, { pen: true, align: 'center' });
    cx.fillStyle = '#f4f6fb'; cx.font = `bold ${sh * 0.055}px ${k.SYS}`; cx.fillText('two', sx + sw / 2, sy + sh * 0.66);
    cx.fillStyle = '#8f9bb8'; cx.font = `${sh * 0.032}px ${k.SYS}`; cx.fillText('Voice memos · two_final', sx + sw / 2, sy + sh * 0.71);
    // progress
    cx.fillStyle = '#3a4466'; cx.fillRect(sx + sw * 0.1, sy + sh * 0.77, sw * 0.8, 6);
    if (d.playing) { cx.fillStyle = '#ffd21f'; cx.fillRect(sx + sw * 0.1, sy + sh * 0.77, sw * 0.03, 6); }
    // the button
    const bx = sx + sw / 2, by = sy + sh * 0.87, br = sw * 0.11;
    cx.fillStyle = d.playing ? '#ffd21f' : '#f4f6fb'; cx.beginPath(); cx.arc(bx, by, br, 0, TAU); cx.fill();
    cx.fillStyle = '#141d3a';
    if (d.playing) { cx.fillRect(bx - br * 0.36, by - br * 0.42, br * 0.24, br * 0.84); cx.fillRect(bx + br * 0.12, by - br * 0.42, br * 0.24, br * 0.84); }
    else { cx.beginPath(); cx.moveTo(bx - br * 0.3, by - br * 0.45); cx.lineTo(bx + br * 0.5, by); cx.lineTo(bx - br * 0.3, by + br * 0.45); cx.fill(); }
    cx.restore();
    // his thumb coming down on it
    cx.save(); cx.translate(bx + br * 0.5, by + br * (d.playing ? 0.9 : 1.6)); cx.rotate(-0.35);
    cx.fillStyle = '#e3b592'; cx.beginPath(); cx.ellipse(0, br * 0.9, br * 0.62, br * 1.35, 0, 0, TAU); cx.fill();
    cx.fillStyle = 'rgba(255,255,255,.35)'; cx.beginPath(); cx.ellipse(-br * 0.08, br * 0.1, br * 0.32, br * 0.4, 0, 0, TAU); cx.fill();
    cx.restore();
  }, { size: [460, 820] });

  // ---------------------------------------------------------- cleanup: anything this file leaves on shared objects
  const LIVE = { hand: null, photo: null, photoHome: null, chip: false, limp: null };
  function cleanup() {
    songStop();
    if (LIVE.hand) { LIVE.hand.rig.ghost(null, 1); LIVE.hand = null; }
    removeUpdate(flickerTick);
    if (LIVE.limp) { LIVE.limp.walkAnim = 'walk'; LIVE.limp = null; }
    photoFollow(null);
    if (LIVE.chip && typeof ui !== 'undefined' && ui.chipView) ui.chipView(false);
    LIVE.chip = false;
    if (typeof AUDIO !== 'undefined') { if (AUDIO.ringing) AUDIO.ringing(false, { fade: 0.3 }); if (AUDIO.muffle) AUDIO.muffle(null, 0.3); }
  }
  on('flow:stop', cleanup);

  // ---------------------------------------------------------- 3.5: the frame in his hands (it follows them; no allocation)
  const PH = { a: null };
  function photoTick() {
    const a = PH.a, o = LIVE.photo;
    if (!a || !o) return;
    a.rig.parts.handL.getWorldPosition(V1); a.rig.parts.handR.getWorldPosition(V2);
    V1.add(V2).multiplyScalar(0.5);
    a.eyePos(V3);
    V3.sub(V1).normalize();
    o.position.set(V1.x + V3.x * 0.05, V1.y + 0.03, V1.z + V3.z * 0.05);
    Q1.setFromUnitVectors(DOWN, V3); o.quaternion.copy(Q1);   // the picture side (local −Y) toward his eyes
  }
  function photoFollow(c, a) {
    removeUpdate(photoTick);
    if (!c || !a) {   // put it back where it lives
      const o = LIVE.photo;
      if (o && LIVE.photoHome) { o.position.copy(LIVE.photoHome.p); o.quaternion.copy(LIVE.photoHome.q); }
      PH.a = null;
      return;
    }
    const o = c.world.prop('photo_frame');
    if (!o) return;
    LIVE.photo = o;
    if (!LIVE.photoHome) LIVE.photoHome = { p: o.position.clone(), q: o.quaternion.clone() };
    PH.a = a;
    addUpdate(photoTick);
  }

  // ---------------------------------------------------------- 3.5: the translucent hand (he's being erased; it solidifies)
  // rig.ghost dithers the gloved right hand and forearm away: see-through and flickering (two ticks in three faint, with
  // longer drop-outs; Reduce Flashing: a slow pulse); erase(c, false) lets it solidify over 0.8 s. ghost() writes the
  // rig's vertex attribute, so it only runs when the level changes.
  const GH = ['handR', 'foreR'];
  const FL = { t: 0, n: 0, k: -1, solid: 0 };
  function ghostAt(a, k) { if (FL.k !== k) { FL.k = k; a.rig.ghost(GH, k); } }
  function flickerTick(dt) {
    const a = LIVE.hand;
    if (!a) return;
    FL.t += dt; FL.n++;
    if (FL.solid > 0) {
      FL.solid = Math.min(1, FL.solid + dt / 0.8);
      ghostAt(a, FL.solid >= 1 ? 1 : Math.round((0.4 + 0.6 * FL.solid * FL.solid) * 10) / 10);
      if (FL.solid >= 1) { removeUpdate(flickerTick); a.rig.ghost(null, 1); LIVE.hand = null; }
      return;
    }
    if (options.reduceFlashing) { ghostAt(a, Math.round((0.45 + 0.15 * Math.sin(FL.t * 2.2)) * 20) / 20); return; }
    ghostAt(a, Math.sin(FL.t * 3.7) > 0.55 ? 0.15 : FL.n % 3 === 0 ? 0.7 : 0.38);
  }
  function erase(c, on) {
    const a = act(c, 'luka40');
    if (on && a && !sk(c)) { LIVE.hand = a; FL.t = 0; FL.n = 0; FL.k = -1; FL.solid = 0; removeUpdate(flickerTick); addUpdate(flickerTick); return; }
    if (!on && LIVE.hand && !sk(c)) { FL.solid = 0.001; return; }   // it solidifies (the updater finishes it)
    removeUpdate(flickerTick);
    if (LIVE.hand) LIVE.hand.rig.ghost(null, 1);
    LIVE.hand = null;
  }

  // ---------------------------------------------------------- 3.6: "two", conducted (AUDIO.seq, the live arrangement)
  // Sections in order; the final chorus loops until the outro is asked for, then the outro comes in at the end of the
  // next two-bar phrase (an odd bar) that leaves time for what's on screen. Without audio it runs on the game clock.
  const SN = ['INTRO', 'VERSE', 'CHORUS', 'VERSE2', 'BRIDGE', 'FINAL', 'OUTRO'], SB = [0, 2, 10, 18, 26, 34, 42, 44];
  const SBAR = (60 / 92) * 4, SSTEP = SBAR / 16;
  const secOf = (bar) => { let i = 0; while (i < 6 && bar >= SB[i + 1]) i++; return i; };
  const SG = { on: false, live: false, virt: false, n: 0, bar: 0, s: 0, t0: 0, req: false, after: 0, outro: false, skip: -1, stop: false,
    va: 0, vb: 2, vbar: 0, vs: 0, vnext: -1, vt: 0, vT: 0 };
  function sgNext(i) { if (SG.virt) SG.vnext = i; else if (typeof AUDIO !== 'undefined' && AUDIO.seq) AUDIO.seq.section(SN[i]); }
  function sgStep(s, bar, now) {
    if (!SG.on) return;
    SG.n++; SG.s = s; SG.bar = bar;
    if (s === 0) {
      const sec = secOf(bar);
      if (SG.skip >= 0 && sec < SG.skip) sgNext(SG.skip);
      else if (sec === 5) {
        if ((bar & 1) && SG.req && now + SBAR >= SG.after - 0.05) { sgNext(6); SG.outro = true; }
        else if (bar === 41) sgNext(5);
      } else if (sec < 5 && bar === SB[sec + 1] - 1) sgNext(sec + 1);
    }
    if (bar === 43 && s === 13) SG.stop = true;   // the chime has rung; stopped on the next game tick
  }
  function onSongStep(s, bar) { if (!SG.on || SG.virt) return; SG.live = true; sgStep(s, bar, AUDIO.now()); }
  function songTick(dt) {
    if (!SG.on) return;
    if (SG.stop) { songStop(); return; }
    if (!SG.live && !SG.virt && clock.t - SG.t0 > 0.8) {   // no audio clock: run the arrangement on the game clock
      if (typeof AUDIO !== 'undefined' && AUDIO.seq) AUDIO.seq.stop();
      sgVirtual();
    }
    if (!SG.virt) return;
    SG.vt += dt;
    while (SG.on && !SG.stop && SG.vt >= SG.vT) {
      if (SG.vs === 0 && SG.vnext >= 0) { SG.va = SB[SG.vnext]; SG.vb = SB[SG.vnext + 1]; SG.vbar = SG.va; SG.vnext = -1; }
      const s = SG.vs, bar = SG.vbar, at = SG.vT;
      SG.vT += SSTEP;
      if (++SG.vs === 16) { SG.vs = 0; if (++SG.vbar >= SG.vb) SG.vbar = SG.va; }
      sgStep(s, bar, at);
    }
  }
  function sgVirtual() { SG.virt = true; SG.vt = 0; SG.vT = 0; SG.va = 0; SG.vb = 2; SG.vbar = 0; SG.vs = 0; SG.vnext = SG.skip >= 0 ? SG.skip : -1; }
  const songNow = () => (SG.virt ? SG.vt : typeof AUDIO !== 'undefined' && AUDIO.now ? AUDIO.now() : 0);
  function songStart(c) {
    songStop();
    Object.assign(SG, { on: true, live: false, virt: false, n: 0, bar: 0, s: 0, t0: clock.t, req: false, after: 0, outro: false, skip: -1, stop: false });
    if (sk(c)) SG.skip = 5;
    const st = c.state;
    // autoplay (tests) conducts on the game clock, so the pictures keep to the song whatever the frame rate
    if (!TEST.auto && typeof AUDIO !== 'undefined' && AUDIO.seq && AUDIO.now && AUDIO.now() > 0) AUDIO.seq.play(st.pattern || null, st.samples || [], onSongStep, { section: SG.skip >= 0 ? 'FINAL' : 'INTRO' });
    else sgVirtual();
    if (SG.skip >= 0) SG.n = SB[5] * 16;
    addUpdate(songTick);
  }
  function songStop() {
    if (SG.on && !SG.virt && typeof AUDIO !== 'undefined' && AUDIO.seq) AUDIO.seq.stop();
    SG.on = false; SG.stop = false;
    removeUpdate(songTick);
  }
  // skipped: everything still to come is the final chorus (the next bar)
  const songSkip = () => { if (SG.on && SG.skip < 0 && secOf(SG.bar) < 5) { SG.skip = 5; sgNext(5); } };
  // ask for the outro, no sooner than `lead` seconds from now
  function songOutro(lead) { if (!SG.on) return; SG.req = true; SG.after = songNow() + lead; }
  const capFor = (steps) => 3 + Math.max(0, steps) * SSTEP * spd() * 1.2;
  // wait until the song reaches bar:step on its first pass (INTRO..FINAL run straight through the first time)
  const atBar = (bar, step = 0) => ({ do: (c) => {
    if (sk(c) || !SG.on) return;
    const n = bar * 16 + step + 1, t0 = clock.t, cap = capFor(n - SG.n);
    return waitUntil(() => c.flow.skipping || !SG.on || SG.n >= n || clock.t - t0 > cap);
  } });
  // wait for a step of the outro (bars 42–43)
  const atOutro = (bar, step = 0, cap = 40) => ({ do: (c) => {
    if (sk(c) || !SG.on) return;
    const t0 = clock.t;
    return waitUntil(() => c.flow.skipping || !SG.on || (SG.outro && (SG.bar > bar || (SG.bar === bar && SG.s >= step))) || clock.t - t0 > cap * spd());
  } });

  // ==================================================================== shared dressing
  // story flags restated so every scene stands alone (Continue, Chapter Select)
  function storyFlags(c) { const f = c.state.flags; f.santa = false; f.headphones = true; }
  function redress(c, ids) { for (const id of ids) { const a = act(c, id); if (a) a.rig.dress(c.state); } }
  function l40Look(c, hood) {
    const a = act(c, 'luka40');
    if (!a) return;
    a.rig.show('hood', !!hood); a.rig.show('gloves', true); a.rig.show('headphones_head', false);
    a.play('still'); a.setExpr('still');
  }

  // ==================================================================== 3.3 — "The Manager"
  // hq_top (dress s33, env storm_dry → storm): the prologue's angle, the hatch ladder at the east end, the figure at the
  // glass at the west end (mgr_glass), the console in the centre with its USB-C port, the galaxy of drones.
  const L_TYPE = [0.86, 0, -16.12, 0];             // Luka at the console's east end, the docked phone in front of him
  const C_GROUP = [5.6, 0, -15.4, -1.2];             // Chase steps in toward Chase (2040) for the plan
  const L_IN = [6.2, 0, -13.0, -1.62], C_IN = [7.0, 0, -12.35, -1.5];   // a few steps into the room
  const L40_GLASS = [-5.3, 0, -11.95, 0];            // he walks to the glass: just west of his pop-up, the city before him
  // at the glass: in profile from the east along the glass (the pop-up's edge glowing at frame left) / from the room
  const GLASS_PROFILE = (dur) => glide([-2.3, 1.66, -12.35], [-5.3, 1.6, -11.98], 40, { pos: [-2.55, 1.66, -12.33], look: [-5.3, 1.6, -11.98], fov: 38 }, dur);
  const GLASS_WIDE = (dur) => glide([-0.75, 1.78, -15.25], [-4.7, 1.55, -12.15], 45, { pos: [-1.0, 1.76, -15.0], look: [-4.7, 1.55, -12.15], fov: 44 }, dur);
  function climb(c, id, delay, dropTo) {
    const a = act(c, id), top = SETS.hq_top.marks.s33_ladder_top;
    if (!a) return Promise.resolve();
    const land = () => { a.place(dropTo); a.visible = true; a.play('idle'); };
    if (sk(c)) { land(); return Promise.resolve(); }
    const sid = c.flow.sceneId;
    return c.wait(delay).then(() => {
      if (c.flow.sceneId !== sid) return null;
      if (sk(c)) { land(); return null; }
      a.place([top[0], top[1], top[2], PI]); a.visible = true; a.play('climb', { speed: 1.25 });
      return tween(c, 2.3, (u) => { a.pos.y = top[1] + (1.0 - top[1]) * u; })
        .then(() => { if (sk(c) || c.flow.sceneId !== sid) return null; a.play('idle'); return tween(c, 0.32, (u) => { a.pos.y = 1.0 * (1 - u * u); }); })
        .then(() => {
          if (c.flow.sceneId !== sid) return null;
          a.pos.y = 0;
          if (sk(c)) { land(); return null; }
          c.sfx('thud', { vol: 0.32, rate: 0.9 + 0.1 * Math.random() });
          a.play('stumble', { dur: 0.35 });
          return a.moveTo(dropTo);
        });
    });
  }
  function dress33(c) {
    storyFlags(c);
    redress(c, ['luka', 'chase', 'chase40', 'luka40']);
    l40Look(c, true);
    const l = act(c, 'luka40');
    if (l) { l.rig.badgeFlip(false); l.place('mgr_glass'); }
    for (const id of ['luka', 'chase', 'chase40']) { const a = act(c, id); if (a) { a.place([8.0, 6.2, -13.05, PI]); a.visible = false; a.play('idle'); } }
    const lk = act(c, 'luka'); if (lk) lk.rig.badgeFlip(false);
    const g = ud(c, 'glass_ui'); if (g) { g.popup('yes_only', { sched: false }); g.cursor(null); g.clock({ h: 11, m: 41, s: 0, quiet: '00:17:00' }); g.clockRun(0.35); }
    const cn = ud(c, 'console'); if (cn) { cn.screen('idle'); cn.port(false); }
    const ph = ud(c, 'luka_phone'); if (ph) ph.state('hidden');
    const gx = ud(c, 'galaxy'); if (gx) { gx.mode('idle'); gx.color('blue', 0); }
    const mh = ud(c, 'maint_hatch'); if (mh) { mh.open(1); mh.ladder(1); }
    const pf = ud(c, 'photo_frame'); if (pf) pf.state('down');
    if (SETS.hq_top.lamp) SETS.hq_top.lamp('console');
  }

  SCENES['3.3'] = {
    title: 'The Manager', set: 'hq_top', env: 'storm_dry', time: '11:41', place: 'Optus Tower, the top floor',
    playable: [], swap: false, music: null,
    hud: { noService: false, quiet: '00:17:00', samples: false, bars: null, hack: null },
    spawn: { luka40: 'mgr_glass', luka: [8.0, 6.2, -13.05, PI], chase: [8.0, 6.2, -13.05, PI], chase40: [8.0, 6.2, -13.05, PI] },
    steps: [
      ['do', dress33],
      ['cutscene', '3.3_manager'],
      ['cutscene', '3.3_plan'],
    ],
    grants: { flags: { santa: false, headphones: true, s33_reveal: true, s33_access: true }, hack: 0, quiet: '00:15:00', noService: false },
  };

  const DRONE_WATCH = (x, y, z, dur) => ({ do: (c) => { const g = ud(c, 'galaxy'); if (g) g.watch(x, y, z, dur); } });
  const MANAGER_BACK = glide([-9.86, 1.86, -13.62], [-9.6, 1.68, -12.0], 34, { pos: [-9.84, 1.85, -13.4], look: [-9.6, 1.68, -12.0], fov: 33 }, 9);
  CUTSCENES['3.3_manager'] = [
    // [WIDE · high, the prologue's angle, the far corner] Rain begins against the glass wall. The Valley below. The
    // pop-up on the glass, the empty space where NO should be. The desk, the face-down photo, the empty chair. Drones
    // hang in the air around the room like a slow galaxy.
    glide([11.4, 4.75, -22.7], [-9.0, 1.0, -12.4], 50, { pos: [10.95, 4.62, -22.48], look: [-9.0, 1.05, -12.4], fov: 48 }, 9),
    { env: 'storm', dur: 4 },
    { sfx: 'thunder_far', vol: 0.5 },
    { wait: 4.6 },
    glide([-3.0, 2.45, -15.7], [-3.0, 2.62, -11.24], 40, { pos: [-3.0, 2.42, -15.2], look: [-3.0, 2.6, -11.24], fov: 40 }, 5),
    { wait: 2.8 },
    // [MID · the hatch ladder] Luka, Chase and Chase (2040) climb down and drop onto the spotless floor.
    glide([5.4, 1.4, -15.6], [8.0, 3.2, -13.1], 50, { pos: [5.25, 1.3, -15.75], look: [8.0, 1.1, -13.0], fov: 52 }, 7.5),
    { sfx: 'creak', vol: 0.25, rate: 1.4 },
    { do: (c) => Promise.all([climb(c, 'luka', 0.2, 's33_drop_luka'), climb(c, 'chase', 1.6, 's33_drop_chase'), climb(c, 'chase40', 3.0, 's33_drop_c40')]) },
    { wait: 0.4 },
    // [WIDE · from behind them] At the far end, the figure in the long coat stands at the glass, back to them. The
    // drones turn their lights toward the three intruders, but don't move.
    glide([10.8, 1.78, -13.55], [-9.6, 1.45, -12.1], 34, { pos: [10.5, 1.76, -13.53], look: [-9.6, 1.45, -12.1], fov: 32 }, 9),
    { wait: 0.8 },
    DRONE_WATCH(8.4, 1.4, -13.0, 1.4),
    { sfx: 'drone_scan', vol: 0.35 },
    { wait: 1.8 },
    say('chase40', "It's over. ^ Turn it off."),
    // the figure, not turning; Chase (2040) takes a few steps into the room
    MANAGER_BACK,
    { move: 'chase40', to: 's33_c40_mid', nowait: true },
    { move: 'luka', to: L_IN, nowait: true },
    { move: 'chase', to: C_IN, nowait: true },
    { wait: 0.6 },
    say('manager', '…Chase.', { tag: 'filtered' }),
    { do: (c) => { if (!sk(c)) c.cam.shot({ shot: 'TWO', on: ['luka', 'chase'], move: 'push', amount: 0.86, dur: 10 }); } },
    say('chase', 'Take the hood off, Luke—'),
    glanceAt('luka', 'chase', 1.0),
    { wait: 0.55 },
    say('luka', "It's not Luke."),
    say('chase', 'I KNOW. ^ It\'s a habit.'),
    MANAGER_BACK,
    { wait: 0.8 },
    say('manager', '…Luke?', { tag: 'filtered' }),
    // (Through the filter: a small, tired breath that might be a laugh.)
    { sfx: 'steam', vol: 0.1, rate: 2.2, lp: 520 },
    { wait: 1.6 },
    // [MID · the figure] He turns round. Slowly.
    glide([-11.3, 1.74, -14.15], [-9.55, 1.42, -12.2], 42, { pos: [-11.15, 1.72, -14.0], look: [-9.55, 1.42, -12.2], fov: 41 }, 6),
    { sfx: 'manager_motif', vol: 0.22 },
    { wait: 0.5 },
    { face: 'luka40', to: 1.62, dur: 2.6 },
    { sfx: 'cloth_swish', vol: 0.18, rate: 0.7 },
    { wait: 2.9 },
    // [INSERT · slow] His chest. Under the open coat: a faded blue lanyard, paler than Luka's. As he turns, the badge
    // swings and flips over. Biro on the back: 1158.
    put('luka40', 'mgr_turn'),
    { do: (c) => { const a = act(c, 'luka40'); if (a) a.rig.badgeFlip(true); if (SETS.hq_top.lamp) SETS.hq_top.lamp('mgr'); } },   // (the spot on his chest: the biro reads)
    play('luka40', 's33_badge', { dur: 2.6 }),
    { do: (c) => {   // framed on the badge itself (its height follows the rig), the lanyard and the open coat round it
      const a = act(c, 'luka40'), L = a && a.rig.attach && a.rig.attach.lanyard;
      if (!L || sk(c)) return;
      c.ui.card(null);
      L.userData.badge.getWorldPosition(V1);
      const ry = a.rotY, sx = Math.sin(ry), sz = Math.cos(ry), lx = Math.cos(ry), lz = -Math.sin(ry);
      c.cam.shot({ shot: 'CAM', pos: [V1.x + sx * 0.64 + lx * 0.12, V1.y + 0.05, V1.z + sz * 0.64 + lz * 0.12], look: [V1.x, V1.y - 0.03, V1.z], fov: 33,
        to: { pos: [V1.x + sx * 0.52 + lx * 0.1, V1.y + 0.03, V1.z + sz * 0.52 + lz * 0.1], look: [V1.x, V1.y - 0.04, V1.z], fov: 31 }, dur: 4.5, ease: 'linear' });
    } },
    { wait: 3.6 },
    play('luka40', 'still'),
    { do: () => { if (SETS.hq_top.lamp) SETS.hq_top.lamp('console'); } },
    // [CLOSE · Chase] He sees it first. His face.
    CLOSE('chase', { dist: 0.8, push: 0.08, dur: 5 }),
    expr('chase', 'stunned'),
    { wait: 2.2 },
    // [CLOSE · Luka] His hand goes to his own badge. He turns it over. 1158.
    CLOSE('luka', { dist: 0.85, push: 0.05, dur: 2.2 }),
    expr('luka', 'worried'),
    play('luka', 'lanyard', { still: true }),
    { wait: 1.4 },
    { do: (c) => {
      const a = act(c, 'luka');
      if (a) a.rig.badgeFlip(true);
      if (sk(c) || !a) return;
      a.eyePos(V1);
      // down onto the badge in his hand, from his left (his right hand turns it over)
      const ry = a.rotY, sx = Math.sin(ry), sz = Math.cos(ry), lx = Math.cos(ry), lz = -Math.sin(ry);
      c.cam.shot({ shot: 'CAM', pos: [V1.x + sx * 0.6 + lx * 0.3, V1.y - 0.02, V1.z + sz * 0.6 + lz * 0.3], look: [V1.x + sx * 0.14, V1.y - 0.4, V1.z + sz * 0.14], fov: 30,
        to: { pos: [V1.x + sx * 0.5 + lx * 0.26, V1.y - 0.06, V1.z + sz * 0.5 + lz * 0.26], look: [V1.x + sx * 0.14, V1.y - 0.42, V1.z + sz * 0.14], fov: 27 }, dur: 3, ease: 'out' });
    } },
    { sfx: 'card_slide', vol: 0.12, rate: 1.4 },
    { wait: 2.6 },
    expr('luka', 'stunned'),
    // A click. The filter drops away. [CLOSE · the figure as the hood comes down] Grey-streaked ponytail, a beard cut
    // close and going grey, a burn scar from the jaw down the neck, tired eyes. Luka, fourteen years on. The dialogue
    // name label switches from THE MANAGER to LUKA (2040) here, on screen, with a small glitch.
    play('luka', 'idle'),
    CLOSE('luka40', { dist: 1.0, push: 0.14, dur: 9, dy: 0.0 }),
    { par: [
      { say: 'manager', text: '', auto: 2.5, tag: 'filtered' },
      { do: (c) => c.runSteps([
        { wait: 0.45 },
        { sfx: 'line_click', vol: 0.5 },
        play('luka40', 's33_hood', { dur: 1.8, loop: false }),
        { wait: 0.75 },
        { do: (cc) => { const a = act(cc, 'luka40'); if (a) a.rig.show('hood', false); } },
        { sfx: 'cloth_swish', vol: 0.25, rate: 0.8 },
        { nameGlitch: ['manager', 'luka40'] },
        { wait: 1.0 },
      ]) },
    ] },
    { do: (c) => { const a = act(c, 'luka40'); if (a) a.rig.show('hood', false); } },
    expr('luka40', 'neutral'),
    // (Hint 1, paid off.) Before he speaks he glances to his left, at Chase (2040). The empty chair beside the desk sits
    // in the edge of the frame.
    glide([-6.6, 1.65, -12.5], [-9.1, 1.42, -12.85], 38, { pos: [-6.75, 1.64, -12.52], look: [-9.1, 1.42, -12.85], fov: 37 }, 7),
    { wait: 0.6 },
    glanceAt('luka40', 'chase40', 1.6),
    { wait: 1.7 },
    slow('luka40', 'Hey, mate.'),
    // [CLOSE · Chase (2040)] He can barely make the words.
    CLOSE('chase40', { dist: 0.9, push: 0.1, dur: 7 }),
    expr('chase40', 'stunned'),
    { wait: 1.2 },
    slow('chase40', "You're dead."),
    CLOSE('luka40', { dist: 1.05, push: 0.08, dur: 6 }),
    say('luka40', 'I know.'),
    // [TOP-DOWN · Chase (2040)] His hands rise to his head. This time they don't stop.
    put('chase40', 's33_c40_mid'),
    { shot: 'TOP', on: 'chase40', dist: 1.5, offset: 0.25 },
    expr('chase40', 'tearful'),
    play('chase40', 'hands_rise', { dur: 1.3 }),
    { wait: 2.4 },
    // No music. Rain on the glass.
    glide([4.4, 1.9, -11.75], [4.1, 1.7, -11.2], 52, { pos: [4.25, 1.84, -11.7], look: [4.0, 1.66, -11.2], fov: 50 }, 5),
    { wait: 2.4 },
    // [TWO-SHOT · Luka and Luka (2040), the length of the office between them] (3 s.)
    put('luka40', 'mgr_turn'), put('luka', L_IN),
    expr('luka', 'worried'),
    glide([-1.6, 2.0, -22.6], [-1.8, 1.45, -12.5], 54, { pos: [-1.6, 1.96, -22.2], look: [-1.8, 1.45, -12.5], fov: 53 }, 9),
    { wait: 3.0 },
    slow('luka40', 'So this is where we went.'),
    CLOSE('chase40', { dist: 0.95, push: 0.06, dur: 5 }),
    say('chase40', 'I buried you.'),
    CLOSE('luka40', { dist: 1.0, push: 0.05, dur: 5 }),
    say('luka40', 'You buried a box.'),
    CLOSE('chase40', { dist: 0.9, push: 0.06, dur: 6 }),
    say('chase40', 'I wrote your eulogy forty-one times.'),
    CLOSE('luka40', { dist: 1.0, push: 0.05, dur: 5 }),
    say('luka40', 'I know.'),
    CLOSE('chase40', { dist: 0.9, push: 0.04, dur: 5 }),
    say('chase40', 'How do you—'),
    CLOSE('luka40', { dist: 1.1, push: 0.3, dur: 16 }),
    slow('luka40', "I was at the back. ^ You stood up there for four minutes and didn't say anything. ^ It was the best thing anyone's ever said about me."),
    // (Chase (2040) can't speak.)
    CLOSE('chase40', { dist: 0.85, push: 0.06, dur: 5 }),
    expr('chase40', 'crying'),
    { wait: 2.2 },
    CLOSE('chase', { dist: 0.9, push: 0.05, dur: 6 }),
    expr('chase', 'sad'),
    say('chase', '…The bench. ^ Someone polishes it.', { tag: 'quietly' }),
    OTS('chase', 'luka40', { dur: 6, push: 0.15 }),
    say('luka40', 'Every Sunday.'),
    CLOSE('chase40', { dist: 0.9, push: 0.05, dur: 6 }),
    expr('chase40', 'tearful'),
    say('chase40', 'The codes. ^ They were coming to your number.'),
    OTS('chase40', 'luka40', { dur: 6, push: 0.15 }),
    say('luka40', 'You kept paying for it.'),
    CLOSE('chase40', { dist: 0.9, push: 0.04, dur: 5 }),
    say('chase40', 'Thirty-five dollars a month.'),
    CLOSE('luka40', { dist: 1.05, push: 0.12, dur: 10 }),
    slow('luka40', "I know. ^ I could've cut it off. ^ I couldn't."),
    // LUKA (the first thing he's said): he steps forward
    { do: (c) => { if (!sk(c)) c.cam.shot({ shot: 'MID', on: 'luka', move: 'push', amount: 0.8, dur: 6 }); } },
    expr('luka', 'determined'),
    { move: 'luka', to: 's33_luka_mid', nowait: true },
    { move: 'chase', to: 's33_chase_mid', nowait: true },
    { wait: 1.4 },
    say('luka', 'The drone on the bridge. Error 4044.'),
    CLOSE('luka40', { dist: 1.0, push: 0.06, dur: 6 }),
    say('luka40', 'It thought you were me. ^ You are me.'),
    CLOSE('luka', { dist: 0.9, push: 0.05, dur: 4 }),
    say('luka', 'Why?'),
    // (Future Luka walks to the glass. He talks calmly and reasonably, which makes it worse.)
    { do: (c) => { if (SETS.hq_top.lamp) SETS.hq_top.lamp('glass'); } },
    glide([-0.4, 1.8, -15.6], [-4.6, 1.55, -12.2], 46, { pos: [-0.75, 1.78, -15.25], look: [-4.7, 1.55, -12.15], fov: 45 }, 14),
    { move: 'luka40', to: L40_GLASS },
    expr('luka40', 'still'),
    say('luka40', "I rang him. That Sunday. Six in the morning. 'I'll do it, I just need another pair of hands.' ^ And I watched his hand— ^ ^ I did that. Me. Being the one who could."),
    glide([-4.82, 1.66, -11.42], [-5.3, 1.6, -11.98], 48, { pos: [-4.86, 1.66, -11.44], look: [-5.3, 1.6, -11.98], fov: 45 }, 12),
    say('luka40', "When the roof came down, I walked out the back. Nobody saw. And I thought: good. ^ Let him think I'm gone. He's safer. Everyone's safer."),
    { par: [
      say('luka40', "And then I couldn't stop seeing it. Every line we sell is a way for someone to get hurt. Every call. Every message. Every 'I'll be there' that isn't. ^ Six years of watching people hurt each other down cables I'm responsible for."),
      { do: (c) => c.runSteps([{ wait: 3.4 }, CLOSE('luka', { dist: 0.95, push: 0.08, dur: 8 })]) },
    ] },
    GLASS_PROFILE(10),
    say('luka40', 'In seventeen minutes it stops. ^ Nobody reaches anybody. ^ Nobody gets hurt.'),
    CLOSE('luka', { dist: 0.9, push: 0.05, dur: 5 }),
    say('luka', 'Nobody gets anything.'),
    GLASS_WIDE(6),
    say('luka40', 'Exactly.'),
    CLOSE('luka', { dist: 0.9, push: 0.15, dur: 12 }),
    expr('luka', 'sad'),
    slow('luka', 'I nearly did it. Last night. ^ I nearly left him to keep him safe.'),
    GLASS_PROFILE(6),
    say('luka40', 'Then you know I\'m right.'),
    CLOSE('luka', { dist: 0.85, push: 0.04, dur: 5 }),
    say('luka', "I know you're scared."),
    // (turning back to them, and the drones turn with him)
    glide([-2.2, 1.62, -13.9], [-5.3, 1.5, -12.0], 44, { pos: [-2.4, 1.62, -13.75], look: [-5.3, 1.52, -12.0], fov: 42 }, 9),
    { face: 'luka40', to: 1.68, dur: 1.4 },
    DRONE_WATCH(4.6, 1.5, -13.4, 0.9),
    { sfx: 'drone_scan', vol: 0.3, rate: 0.9 },
    { wait: 1.2 },
    say('luka40', "Go home. All of you. ^ Please. ^ I don't want to hurt you."),
  ];

  CUTSCENES['3.3_plan'] = [
    // [INSERT · the console in the centre of the room] Sleek, black, entirely wireless, nothing plugged into it. Except
    // on its side, absurdly, one small port. USB-C.
    put('luka40', [L40_GLASS[0], 0, L40_GLASS[2], 1.68]),
    anchor('console', { push: 0.1, dur: 4 }),
    { wait: 2.2 },
    { do: (c) => { const cn = ud(c, 'console'); if (cn) cn.port(true); } },
    glide([2.05, 1.14, -14.85], [1.21, 0.84, -15.4], 36, { pos: [1.75, 1.02, -15.08], look: [1.21, 0.82, -15.4], fov: 32 }, 3.5, 'out'),
    { sfx: 'spotless_chime', vol: 0.08, rate: 1.6 },
    { wait: 2.4 },
    // [CLOSE · Luka] He's seen it.
    CLOSE('luka', { dist: 0.85, push: 0.06, dur: 5 }),
    expr('luka', 'stunned'),
    { wait: 1.4 },
    { face: 'luka', to: 'chase', dur: 0.5 }, { face: 'chase', to: 'luka', dur: 0.5 },
    { do: (c) => { if (!sk(c)) c.cam.shot({ shot: 'TWO', on: ['luka', 'chase'], dist: 1.6, move: 'push', amount: 0.9, dur: 10 }); } },
    expr('luka', 'determined'),
    say('luka', "…He's got a USB-C port.", { tag: 'under his breath' }),
    say('chase', 'In 2040?', { tag: 'under his breath' }),
    say('luka', 'JARVIS.'),
    say('chase', 'JARVIS.'),
    say('luka', "If I plug in, I can get into the system. It'll take time."),
    CLOSE('chase40', { dist: 0.95, push: 0.05, dur: 5 }),
    say('chase40', 'How do you know you can get in?', { tag: 'still breathing hard' }),
    CLOSE('luka', { dist: 0.85, push: 0.08, dur: 5 }),
    say('luka', "Because they're my passwords."),
    // [CLOSE · Chase (2040)] He takes his hands off his head. He straightens up. Something comes back into his face
    // that hasn't been there all game.
    CLOSE('chase40', { dist: 0.95, push: 0.12, dur: 9 }),
    play('chase40', 's33_hands_down', { dur: 1.5 }),
    { wait: 1.2 },
    expr('chase40', 'determined'),
    { wait: 0.8 },
    say('chase40', 'Okay. ^ Okay okay okay. ^ Hear me out.'),
    // [ORBIT · around Chase (2040), speeding up, the move from Rue] The first time in fourteen years. The music kicks in
    // under it: the "two" groove, driving.
    play('chase40', 'idle'),
    { do: (c) => { if (!sk(c)) c.cam.shot({ shot: 'ORBIT', size: 'MID', on: 'chase40', dist: 2.5, height: 0.05, from: 35, to: -55, ease: 'in', dur: 12, spin: true }); } },
    { music: 'boss', fade: 0.6 },
    { wait: 1.6 },
    say('chase', '…He does the thing.', { tag: 'whisper' }),
    expr('chase40', 'talk'),
    say('chase40', "You plug in. We keep them off you. Me and— ^ me. Swap when one of us gets tired. Don't stop for anything."),
    { move: 'chase', to: C_GROUP, nowait: true },
    { do: (c) => { if (!sk(c)) c.cam.shot({ shot: 'TWO', on: ['chase', 'chase40'], move: 'push', amount: 0.9, dur: 9 }); } },
    { face: 'chase40', to: 'chase', dur: 0.4 },
    say('chase', "That's the whole plan?"),
    say('chase40', "It's a first draft."),
    say('chase', 'Is it finished?'),
    expr('chase40', 'happy'),
    say('chase40', "It's DONE."),
    // [MID · Luka at the console] He pulls his 2026 phone and a USB-C cable from his pocket. Plugs in. A password
    // field appears on the console glass.
    put('luka', [1.6, 0, -17.6, -0.4]),
    glide([2.3, 1.62, -14.35], [0.8, 1.12, -16.0], 42, { pos: [2.15, 1.6, -14.5], look: [0.8, 1.1, -16.0], fov: 40 }, 8),
    { move: 'luka', to: L_TYPE },
    play('luka', 'type_phone'),
    { wait: 0.7 },
    { sfx: 'plug_click', vol: 0.45 },
    { do: (c) => { const ph = ud(c, 'luka_phone'), cn = ud(c, 'console'); if (ph) { ph.state('docked'); ph.screen('keyboard', 0); } if (cn) cn.screen('password', ''); } },
    play('luka', 'type'),
    { wait: 1.2 },
    // [INSERT · Luka's thumbs] He types: beforelunch
    anchor('s33_thumbs', { push: 0.1, dur: 4, card: ['s33_type', { typed: '' }] }),
    { do: async (c) => {
      const word = 'beforelunch', cn = ud(c, 'console');
      for (let i = 1; i <= word.length && !sk(c); i++) {
        c.ui.card('s33_type', { typed: word.slice(0, i), key: word[i - 1] });
        if (cn) cn.screen('password', word.slice(0, i));
        c.sfx('key_type', { vol: 0.25, rate: 0.9 + ((i * 7) % 5) * 0.05 });
        await c.wait(i === 6 ? 0.3 : 0.17);
      }
      if (cn) cn.screen('password', word);
    } },
    { wait: 0.5 },
    // [INSERT] ACCESS GRANTED. HACK 0%.
    glide([-0.2, 2.25, -17.0], [-0.2, 0.98, -15.4], 42, { pos: [-0.2, 2.12, -16.85], look: [-0.2, 0.98, -15.4], fov: 41 }, 4),
    { do: (c) => { const cn = ud(c, 'console'), ph = ud(c, 'luka_phone'); if (cn) cn.screen('granted'); if (ph) ph.screen('hack', 0); c.hud.hack(0); } },
    { sfx: 'access_granted', vol: 0.4 },
    { wait: 2.0 },
    // LUKA (2040): (quietly, stung) "…Don't."
    CLOSE('luka40', { dist: 1.0, push: 0.08, dur: 5 }),
    expr('luka40', 'sad'),
    say('luka40', '…Don\'t.', { tag: 'quietly' }),
    // [WIDE] Every drone in the room lights up red at once.
    expr('luka40', 'still'),
    anchor('s33_red', { push: 0.03, dur: 6 }),
    { wait: 0.6 },
    { do: (c) => { const g = ud(c, 'galaxy'); if (g) { g.color('red', 0); g.watch(0.9, 1.4, -16.1, 0.5); } } },
    { env: 'boss', dur: 0.6 },
    { sfx: 'drone_red', vol: 0.55 },
    { sfx: 'drone_red', vol: 0.4, rate: 0.85 },
    { wait: 1.8 },
  ];

  // ==================================================================== 3.4 — "85%"
  let BOSS = null;   // the fight's result: its live drones' positions seed 3.5's frozen galaxy
  const S33_RED = AN('s33_red');
  function dress34(c) {
    storyFlags(c);
    redress(c, ['luka', 'chase', 'chase40', 'luka40']);
    l40Look(c, false);
    const g = ud(c, 'galaxy'); if (g) g.color('red', 0);
    // 3.3's last frame under the fade-in: the boss eases from it into its tracking camera
    if (S33_RED && !sk(c)) { c.cam.shot({ shot: 'CAM', pos: S33_RED.from, look: S33_RED.at, fov: S33_RED.fov }); }
  }
  SCENES['3.4'] = {
    title: '85%', set: 'hq_top', env: 'boss', time: '11:43', place: 'Optus Tower, the top floor', timeCard: false,
    playable: ['chase', 'chase40'], swap: true, music: 'boss',
    hud: { noService: false, quiet: '00:15:00', samples: false, bars: null, hack: 0 },
    spawn: { luka: 'console_luka', chase: 'boss_chase', chase40: 'boss_c40', luka40: 'boss_l40' },
    steps: [
      ['do', dress34],
      ['objective', 'Defend Luka.'],
      // ▶ PLAY — Boss: defend Luka (spec §10; the 3.4 lines are the boss's barks, by hack %)
      ['minigame', 'boss', {}],
      ['do', (c) => { BOSS = c.flow.result || null; }],
      ['objective', null],
    ],
    grants: { flags: { santa: false, headphones: true, s34_done: true }, hack: 85, quiet: '00:04:00', noService: false },
  };

  // ==================================================================== 3.5 — "99%"
  const BY_LUKA = 's35_l40_by_luka', DESK_AT = [-10.1, 0, -15.06, H];
  const S35_LOOK_L40 = [-5.6, 0, -11.95, 2.2];       // at the glass (west of the pop-up's glare), turned toward the console
  // the spot as a lamp at his desk (the set's 'desk' lamp is straight down: a bowed head would be a dark crown): storm
  // light from the room side onto his face while he holds the photo; the set's own lamp comes back with lamp(name)
  function deskLight(c) {
    if (SETS.hq_top.lamp) SETS.hq_top.lamp('off');
    const s = c.world.torch;
    if (!s) return;
    c.world.torchAuto = false;
    s.position.set(-7.8, 2.4, -13.8); s.target.position.set(-10.0, 1.5, -15.0); s.target.updateMatrixWorld();
    s.angle = 0.4; s.penumbra = 0.7; s.distance = 7; s.color.setHex(0xdfe8ff); s.intensity = 6;
  }
  // the same on his past self's face against the wall, for the ECU of his eye (soft, from in front and below)
  function eyeLight(c) {
    if (SETS.hq_top.lamp) SETS.hq_top.lamp('off');
    const s = c.world.torch;
    if (!s) return;
    c.world.torchAuto = false;
    s.position.set(2.6, 0.75, -21.3); s.target.position.set(2.8, 0.75, -22.5); s.target.updateMatrixWorld();
    s.angle = 0.35; s.penumbra = 0.7; s.distance = 7; s.color.setHex(0xdfe8ff); s.intensity = 3;
  }
  function hackAt(c, pct) {
    const cn = ud(c, 'console'), ph = ud(c, 'luka_phone');
    if (cn) cn.screen('hack', pct);
    if (ph) ph.screen(ph && LIVE.cracked ? 'cracked' : 'hack', pct);
    c.hud.hack(pct);
  }
  const HACK = (pct) => ({ do: (c) => hackAt(c, pct) });
  function dress35(c) {
    storyFlags(c);
    const f = c.state.flags; delete f.hurt; delete f.lanyard_snapped;
    LIVE.cracked = false;
    redress(c, ['luka', 'chase', 'chase40', 'luka40']);
    l40Look(c, false);
    const l = act(c, 'luka40'); if (l) l.place(S35_LOOK_L40);
    const lk = act(c, 'luka'); if (lk) { lk.place('console_luka'); lk.play('type'); lk.setExpr('determined'); }
    const ch = act(c, 'chase'); if (ch) { ch.place('s35_chase'); ch.play('s35_held', { v: 1 }); ch.rig.show('tether', true); ch.setExpr('determined'); }
    const c4 = act(c, 'chase40'); if (c4) { c4.place('s35_c40'); c4.play('s35_held', { v: 2 }); c4.setExpr('determined'); }
    // the boss's drones, frozen where they were: the galaxy takes their places and hangs
    const g = ud(c, 'galaxy');
    if (g) {
      const arr = BOSS && BOSS.drones && BOSS.drones.length ? BOSS.drones : null;
      if (arr) g.seed(arr, Math.min(24, Math.floor(arr.length / 3)));
      g.hang(); g.color('red', 0);
    }
    const o = c.world.prop('galaxy'); if (o) o.visible = true;
    const fm = ud(c, 'foam'); if (fm) fm.clear();
    const vt = ud(c, 'vents'); if (vt) vt.open(0);
    const pf = ud(c, 'photo_frame'); if (pf) pf.state('down');
    const bd = c.world.prop('luka_badge'); if (bd) bd.visible = false;
    const cr = c.world.prop('wall_crack'); if (cr) cr.visible = false;
    const ph = ud(c, 'luka_phone'); if (ph) ph.state('docked');
    hackAt(c, 85);
    const gl = ud(c, 'glass_ui'); if (gl) { gl.popup('yes_only', { sched: false }); gl.clock({ h: 11, m: 54, s: 0, quiet: '00:04:00' }); gl.clockRun(0.5); }
    if (SETS.hq_top.lamp) SETS.hq_top.lamp('console');
    if (SETS.hq_top.reflect) SETS.hq_top.reflect(null);
  }
  SCENES['3.5'] = {
    title: '99%', set: 'hq_top', env: 'storm', time: '11:54', place: 'Optus Tower, the top floor', timeCard: false,
    playable: [], swap: false, music: null,
    hud: { noService: false, quiet: '00:04:00', samples: false, bars: null, hack: 85 },
    spawn: { luka: 'console_luka', chase: 's35_chase', chase40: 's35_c40', luka40: S35_LOOK_L40 },
    steps: [
      ['do', dress35],
      ['cutscene', '3.5_foam'],
      ['cutscene', '3.5_almost'],
      ['cutscene', '3.5_strike'],
    ],
    grants: { flags: { santa: false, headphones: true, hurt: true, lanyard_snapped: true, s35_strike: true, s35_up: true }, hack: 100, quiet: '00:01:00', noService: false },
  };

  CUTSCENES['3.5_foam'] = [
    // [CLOSE · Luka (2040)] Eyes closed.
    expr('luka40', 'sleep'),
    CLOSE('luka40', { dist: 0.95, push: 0.1, dur: 8 }),
    { wait: 1.6 },
    slow('luka40', '…Enough.'),
    { wait: 0.6 },
    say('luka40', 'Safe Mode.'),
    // [WIDE] Vents in the floor open. Safety foam blooms up around all three of them. Soft, white, quilted, completely
    // immovable, holding them to the floor up to the chest. The Tether drops. The drones stop and hang in the air.
    anchor('s35_foam_wide', { push: 0.05, dur: 8 }),
    { do: (c) => { const v = ud(c, 'vents'); if (v) v.open(1); } },
    { sfx: 'dock_clunk', vol: 0.3, rate: 0.8 },
    { wait: 0.5 },
    { do: (c) => { const f = ud(c, 'foam'); if (f) { f.bloom(0, 0.0, -16.2, 1.2); f.bloom(1, -8.0, -17.0, 1.2); f.bloom(2, 4.0, -17.0, 1.2); } } },
    { sfx: 'foam', vol: 0.6 },
    { sfx: 'foam', vol: 0.45, rate: 0.85 },
    play('luka', 's35_held', { v: 0 }),
    expr('luka', 'scared'), expr('chase', 'scared'), expr('chase40', 'scared'),
    { wait: 0.7 },
    { do: (c) => { const a = act(c, 'chase'); if (a) a.rig.show('tether', false); } },
    { sfx: 'clunk', vol: 0.3, rate: 1.3 },
    { wait: 1.0 },
    say('safesense', 'You are safe now.', { tag: 'chirpy' }),
    // [INSERT · Luka's phone, still plugged into the console, the cable taut] HACK 85% … 86%. Still going. Slowly.
    glide([1.22, 1.24, -15.86], [0.96, 0.96, -15.45], 28, { pos: [1.16, 1.17, -15.76], look: [0.96, 0.96, -15.45], fov: 26 }, 5),
    { wait: 1.6 },
    HACK(86),
    { sfx: 'meter_tick', vol: 0.2 },
    { wait: 1.6 },
    // [WIDE · locked, low] Future Luka walks among them in his long coat. Rain hammers the glass.
    { do: (c) => { const r = ud(c, 'glass_rain'); if (r) r.boost(1.6); } },
    { shot: 'CAM', pos: [9.0, 0.45, -12.2], look: [-6.0, 0.9, -15.0], fov: 50 },
    expr('luka40', 'still'),
    { move: 'luka40', to: [-6.0, 0, -15.0], nowait: true },
    { wait: 3.6 },
    // the pleas: a slow push-in on the speaker, the reverse on Future Luka standing over them. No music.
    // [Future Luka by Chase]
    put('luka40', 's35_l40_by_chase'),
    { face: 'chase', to: 's35_l40_by_chase', dur: 0 },
    play('chase', 's35_held', { v: 1, look: 0.8 }),
    expr('chase', 'determined'),
    CLOSE('chase', { dist: 0.85, push: 0.25, dur: 16, dy: -0.05, ly: 0.06, yaw: 0.4 }),   // (from his left: the arm the foam caught mid-swing stays behind him)
    { wait: 0.5 },
    cue(say('chase', "Look at him. ^ Six years. He stopped. Everything. He stopped playing. He stopped ringing Rue. He stopped— ^ You did that. ^ Not the fire. You."), 'Look at him.',
      (c) => glanceNow(c, 'chase', 'chase40', 1.8)),
    CLOSE('luka40', { dist: 1.25, push: 0.1, dur: 4, dy: -0.5, ly: -0.04, yaw: 0.25 }),
    { wait: 2.2 },
    // [Future Luka by Chase (2040)]: he goes on to the next one
    anchor('s35_foam_wide', { push: 0.03, dur: 4 }),
    { face: 'luka40', to: 1.2, dur: 0.6 },
    { move: 'luka40', to: [-2.2, 0, -15.0], nowait: true },
    { wait: 1.6 },
    put('luka40', 's35_l40_by_c40'),
    { face: 'chase40', to: 's35_l40_by_c40', dur: 0 },
    play('chase40', 's35_held', { v: 0, look: 0.8 }),
    expr('chase40', 'sad'),
    CLOSE('chase40', { dist: 0.85, push: 0.28, dur: 18, dy: -0.05, ly: 0.06 }),
    { wait: 0.5 },
    say('chase40', "You were at the back. ^ You were at the back, and you watched me not be able to say it. ^ You could've walked up. One step. ^ I'd have been so angry."),
    expr('chase40', 'tearful'),
    { wait: 1.0 },
    slow('chase40', "And then I'd have been so happy."),
    CLOSE('luka40', { dist: 1.25, push: 0.1, dur: 4, dy: -0.5, ly: -0.04, yaw: -0.25 }),
    { wait: 2.2 },
    // [Future Luka by Luka] The two Lukas, face to face, one standing, one held in foam.
    put('luka40', BY_LUKA),
    { face: 'luka', to: BY_LUKA, dur: 0 },
    play('luka', 's35_held', { v: 0, look: 0.2 }),
    expr('luka', 'determined'),
    glide([-0.8, 1.68, -18.7], [-0.8, 1.42, -16.3], 46, { pos: [-0.8, 1.66, -18.45], look: [-0.8, 1.42, -16.3], fov: 45 }, 5),
    { wait: 2.2 },
    CLOSE('luka', { dist: 0.85, push: 0.3, dur: 22, ly: 0.02 }),
    expr('luka', 'sad'),
    cue(say('luka', "I know why you did it. I nearly did it. Last night. I had the phone in my hand and a note that said 'I'll do it.' ^ He was awake. He said I don't get to decide that for him. ^ You don't get to decide it for everyone."),
      "You don't get to decide it", (c) => { const a = act(c, 'luka'); if (a) a.setExpr('determined'); }),
    CLOSE('luka40', { dist: 0.95, push: 0.08, dur: 4 }),
    { wait: 2.0 },
    // [INSERT · the hack] HACK 94%.
    anchor('console_screen', { push: 0.1, dur: 4 }),
    HACK(94),
    { sfx: 'meter_tick', vol: 0.22 },
    { wait: 1.8 },
  ];

  CUTSCENES['3.5_almost'] = [
    // [MID · Future Luka] He walks to his desk. Stops. He picks up the face-down frame and turns it over.
    put('luka40', [-10.6, 0, -18.4, 0.1]),
    expr('luka40', 'still'),
    { do: (c) => deskLight(c) },
    anchor('desk_photo_turn', { push: 0.1, dur: 10 }),
    { move: 'luka40', to: DESK_AT },
    { wait: 0.4 },
    play('luka40', 's35_desk'),
    { wait: 1.1 },
    { do: (c) => { const pf = ud(c, 'photo_frame'), a = act(c, 'luka40'); if (pf) pf.state('up'); if (a && !sk(c)) photoFollow(c, a); } },
    { sfx: 'card_slide', vol: 0.15, rate: 0.8 },
    play('luka40', 's35_photo', { shake: 0 }),
    { wait: 1.6 },
    // [INSERT · the photo] Luka and Chase, 2033, on the Woody Point jetty at sunset, laughing so hard they're both blurred.
    { shot: 'CAM', pos: [-9.3, 1.45, -14.6], look: [-9.75, 1.2, -15.05], fov: 34, card: ['s35_photo', {}] },
    { wait: 3.6 },
    // [CLOSE · Future Luka's hand] It's trembling.
    play('luka40', 's35_photo', { shake: 1 }),
    { do: (c) => {
      const a = act(c, 'luka40'), o = LIVE.photo;
      if (!a || sk(c)) return;
      c.ui.card(null);
      a.eyePos(V1);
      if (o) V2.copy(o.position); else a.rig.parts.handR.getWorldPosition(V2);
      const ry = a.rotY, sx = Math.sin(ry), sz = Math.cos(ry), rx = -sz, rz = sx;
      // over his bowed head, down onto the frame in his gloved hands (as he sees it)
      const px = V1.x - sx * 0.1 + rx * 0.08, py = V1.y + 0.1, pz = V1.z - sz * 0.1 + rz * 0.08;
      c.cam.shot({ shot: 'CAM', pos: [px, py, pz], look: [V2.x, V2.y - 0.02, V2.z], fov: 34,
        to: { pos: [px + (V2.x - px) * 0.12, py + (V2.y - py) * 0.12, pz + (V2.z - pz) * 0.12], look: [V2.x, V2.y - 0.02, V2.z], fov: 32 }, dur: 4, ease: 'linear' });
    } },
    { wait: 2.6 },
    // [ECU · the pop-up on the glass] OPT OUT ALL USERS? [YES] — and for a single frame, in the empty space, a [NO]
    // button flickers into existence. Then it's gone.
    anchor('glass_popup_ecu', { push: 0.06, dur: 4 }),
    { wait: 1.4 },
    { do: (c) => {
      const g = ud(c, 'glass_ui');
      if (!g || sk(c)) return;
      g.popup('no_flicker', { sched: false });
      let n = 0;
      return new Promise((res) => {
        const f = () => { if (++n >= 2) { off('render', f); g.popup('yes_only', { sched: false }); res(); } };
        on('render', f);
      });
    } },
    { wait: 1.6 },
    // [WIDE] The foam around the three of them softens, just slightly. Chase can move his arm.
    anchor('s35_foam_wide', { push: 0.04, dur: 6 }),
    { do: (c) => { const f = ud(c, 'foam'); if (f) f.soften(0.3); } },
    { wait: 0.8 },
    play('chase', 's35_held', { v: 1, free: 1, look: 0.4 }),
    { wait: 1.4 },
    // CHASE (2040): (softly) "Luka."
    CLOSE('chase40', { dist: 0.9, push: 0.06, dur: 5 }),
    expr('chase40', 'tearful'),
    slow('chase40', 'Luka.', { tag: 'softly' }),
    // [CLOSE · Future Luka, eyes closed] Hold 3 s. We believe he's going to stop.
    expr('luka40', 'sleep'),
    CLOSE('luka40', { dist: 0.9, push: 0.1, dur: 5, dy: -0.22, ly: -0.05, yaw: 0.3 }),
    { wait: 3.0 },
    // [INSERT · the countdown on the glass] 11:57. Thunder.
    { do: (c) => { const g = ud(c, 'glass_ui'); if (g) { g.clock({ h: 11, m: 57, s: 0, sec: false, quiet: '00:01:00' }); g.clockRun(0); } c.hud.quiet('00:01:00'); } },
    anchor('glass_clock', { push: 0.08, dur: 3 }),
    { do: (c) => { if (!sk(c) && SETS.hq_top.flash) SETS.hq_top.flash(0.8); } },
    { sfx: 'thunder', vol: 0.75 },
    { wait: 2.0 },
    // [CLOSE · Future Luka] His eyes open, and something in them closes.
    CLOSE('luka40', { dist: 0.85, push: 0.05, dur: 6, dy: -0.22, ly: -0.05, yaw: 0.3 }),
    { wait: 0.6 },
    expr('luka40', 'still'),
    { wait: 1.2 },
    slow('luka40', 'No. ^ If I stop now, it was for nothing. ^ The bench. The six years. ^ All of it. For nothing.'),
    // He puts the photo back. Face down. The foam hardens again.
    anchor('desk_photo_turn', { push: 0.14, dur: 5 }),
    play('luka40', 's35_desk'),
    { wait: 0.9 },
    { do: (c) => { photoFollow(null); const pf = ud(c, 'photo_frame'); if (pf) pf.state('down'); } },
    { sfx: 'card_slide', vol: 0.15, rate: 0.7 },
    { wait: 0.8 },
    play('luka40', 'still'),
    { do: (c) => { const f = ud(c, 'foam'); if (f) f.harden(); if (SETS.hq_top.lamp) SETS.hq_top.lamp('console'); } },
    play('chase', 's35_held', { v: 1, look: 0.2 }),
    { sfx: 'foam', vol: 0.3, rate: 1.3 },
    { wait: 0.6 },
    // [INSERT · the console] HACK 98%.
    anchor('console_screen', { push: 0.1, dur: 3 }),
    HACK(98),
    { sfx: 'meter_tick', vol: 0.22 },
    { wait: 1.6 },
    // [CLOSE · Future Luka looking at his past self] "I'm sorry." He flicks two fingers.
    put('luka40', 's35_l40_end'),
    { face: 'luka40', to: 'luka', dur: 0 },
    CLOSE('luka40', { dist: 0.95, push: 0.08, dur: 6, yaw: -0.5 }),
    { wait: 0.8 },
    say('luka40', "I'm sorry.", { tag: 'barely', speed: 'slow' }),
    { wait: 0.4 },
    { do: (c) => {   // low, in front of him: the black glove against the glowing pop-up, [YES] and the empty slot behind it
      const a = act(c, 'luka40'), l = act(c, 'luka');
      if (!a || !l || sk(c)) return;
      a.rig.parts.handR.getWorldPosition(V1);
      let fx = l.pos.x - a.pos.x, fz = l.pos.z - a.pos.z;
      const n = Math.hypot(fx, fz) || 1; fx /= n; fz /= n;
      const rx = -fz, rz = fx;
      c.cam.shot({ shot: 'CAM', pos: [V1.x + fx * 1.1 - rx * 0.3, V1.y - 0.2, V1.z + fz * 1.1 - rz * 0.3], look: [V1.x, V1.y + 0.12, V1.z], fov: 40 });
    } },
    play('luka40', 's35_flick', { dur: 1.2 }),
    { wait: 1.3 },
  ];

  // the strike: the Guardian falls from hatch_cw onto Luka at the console; it detonates; he's thrown into the north wall
  const STRIKE_ID = 's35_guardian', HIT = [0.0, 1.25, -16.2], WALL = [2.8, 0, -22.7];
  function strikeFall(c) {
    const d = DRONES.spawn(STRIKE_ID, { kind: 'guardian', at: [-2.0, 0, -17.6], hover: 4.6, cone: false, ai: false, showPath: false });
    if (!d) return Promise.resolve();
    DRONES.light(STRIKE_ID, 'escort');
    const x0 = -2.0, z0 = -17.6, y0 = 4.6;
    // like a stone: a short hang, then accelerating straight down at him
    return c.wait(0.25).then(() => tween(c, 0.45, (u) => {
      const k = u * u;
      d.x = d.hx = x0 + (HIT[0] - x0) * k; d.z = d.hz = z0 + (HIT[2] - z0) * k; d.hover = y0 + (HIT[1] - y0) * k;
    }));
  }
  function strikeHit(c) {
    DRONES.remove(STRIKE_ID);
    const f = ud(c, 'foam'); if (f) f.burst(0);
    const st = c.state.flags; st.hurt = true; st.lanyard_snapped = true;
    const a = act(c, 'luka');
    if (a) { a.rig.show('hurt', true); a.rig.show('lanyard', false); a.setExpr('wince'); }
    const ph = ud(c, 'luka_phone'); LIVE.cracked = true; if (ph) { ph.state('dangling'); ph.screen('cracked', 98); }
    const cn = ud(c, 'console'); if (cn) cn.screen('hack', 98);
    if (SETS.hq_top.lamp) SETS.hq_top.lamp('wall');
    if (sk(c)) return;
    c.ui.flash(options.reduceFlashing ? 1.4 : 0.35, options.reduceFlashing ? '#c8702c' : '#fff');
    c.sfx('blast', { vol: 0.9 }); c.sfx('bam', { vol: 0.5, rate: 0.8 });
    c.cam.shake(0.09, 0.5);
    if (c.world.puff) c.world.puff(HIT, { n: 22, color: 0xd8d4cc, speed: 2.2, life: 0.9, gravity: 0.6 });
  }
  function thrown(c) {
    const a = act(c, 'luka');
    if (!a) return Promise.resolve();
    const x0 = a.pos.x, z0 = a.pos.z;
    if (sk(c)) { a.place(WALL); a.play('sit_floor_wall', { slump: true }); return Promise.resolve(); }
    a.play('s35_thrown');
    return tween(c, 0.38, (u) => {
      a.pos.x = x0 + (WALL[0] - x0) * u; a.pos.z = z0 + (WALL[2] + 0.12 - z0) * u; a.pos.y = 1.25 * Math.sin(u * PI * 0.9) + 0.45 * u;
    }).then(() => {
      const cr = c.world.prop('wall_crack'); if (cr) cr.visible = true;
      c.sfx('wall_hit', { vol: 0.9 }); c.sfx('crunch', { vol: 0.6, rate: 0.8 });
      if (!sk(c)) c.cam.shake(0.06, 0.35);
      const b = ud(c, 'luka_badge'); if (b) b.place('s35_badge');
    });
  }
  CUTSCENES['3.5_strike'] = [
    // No humour anywhere in this sequence. Treat it as a death.
    // [WIDE] A Guardian drone drops from the ceiling like a stone, straight at Luka.
    anchor('s35_strike_wide', { push: 0.02, dur: 4 }),
    { do: (c) => { const h = ud(c, 'drone_hatches'); if (h) h.open(1, 1); } },
    { sfx: 'dock_clunk', vol: 0.4, rate: 0.7 },
    { wait: 0.5 },
    { do: (c) => strikeFall(c) },
    // It hits. It detonates. The foam bursts. Luka is torn out of it and thrown across the room, violently, into the wall.
    { do: (c) => strikeHit(c) },
    { env: 'strike', dur: 0.3 },
    { do: (c) => thrown(c) },
    { wait: 0.15 },
    // [WIDE · locked, low, across the floor] Luka slides down the wall and lies still against it. His lanyard has snapped.
    // The badge lies face down beside his open hand. His 2026 phone dangles from the console, the screen cracked, lit.
    { shot: 'CAM', pos: [-0.8, 0.3, -16.6], look: [2.75, 0.55, -22.3], fov: 38 },
    { do: (c) => {
      const a = act(c, 'luka');
      if (!a) return;
      a.place(WALL); a.setExpr('sleep');
      if (sk(c)) { a.play('sit_floor_wall', { slump: true }); return; }
      a.play('s35_slide', { slump: true, dur: 1.2 });
      a.pos.y = 0.55;
      return tween(c, 1.2, (u) => { a.pos.y = 0.55 * (1 - ez(u)); });
    } },
    play('luka', 'sit_floor_wall', { slump: true }),
    { flag: 'hurt' }, { flag: 'lanyard_snapped' },
    // The sound drops out to a high ringing. The rain is muffled, as if heard through water.
    { do: (c) => { if (!sk(c)) { AUDIO.ringing(true, { vol: 0.32, fade: 0.25 }); AUDIO.muffle(380, 1.0); } } },
    { wait: 2.6 },
    // [CLOSE · Chase] Frozen. His mouth opens and nothing comes out.
    play('chase', 'still'), play('chase40', 'still'),
    { face: 'chase', to: WALL, dur: 0 }, { face: 'chase40', to: WALL, dur: 0 },
    expr('chase', 'stunned'),
    CLOSE('chase', { dist: 0.8, push: 0.04, dur: 4 }),
    { wait: 2.2 },
    // [CLOSE · Chase (2040)] Frozen.
    expr('chase40', 'stunned'),
    CLOSE('chase40', { dist: 0.85, push: 0.04, dur: 4 }),
    { wait: 2.0 },
    // The foam around both Chases sags and dissolves (the control system stutters) but they don't move. They can't.
    anchor('s35_foam_wide', { push: 0.03, dur: 5 }),
    { do: (c) => { const f = ud(c, 'foam'); if (f) { f.sag(1, 2.5); f.sag(2, 2.5); } } },
    { sfx: 'foam', vol: 0.25, rate: 0.6 },
    { wait: 0.6 },
    play('chase', 'kneel'), play('chase40', 'kneel'),
    { wait: 2.2 },
    // [INSERT · the cracked phone] HACK 99%.
    glide([1.62, 0.52, -15.75], [1.24, 0.45, -15.4], 26, { pos: [1.55, 0.5, -15.68], look: [1.24, 0.45, -15.4], fov: 24 }, 4),
    HACK(99),
    { wait: 2.0 },
    // [WIDE · locked] Both Chases staring across the floor at Luka's body. He doesn't move. Hold 4 s.
    { shot: 'CAM', pos: [-10.5, 1.5, -14.5], look: [2.8, 0.5, -22.4], fov: 44 },
    { wait: 4.0 },
    // CHASE: (a whisper) "…Luka?" (Nothing.)
    say('chase', '…Luka?', { tag: 'whisper' }),
    play('luka40', 's35_hand_out', { dur: 1.0 }),
    { wait: 2.0 },
    // [CLOSE · Future Luka's gloved hand at his side] For a moment it goes translucent, flickering, as if he's being
    // erased. He looks down at it. He isn't moved.
    { do: (c) => handLens(c, 0.12) },
    { do: (c) => erase(c, true) },
    { wait: 2.8 },
    // [CLOSE · Future Luka] "He's an inferior version of myself; he lets himself be ruled by fear."
    play('luka40', 'still'),
    CLOSE('luka40', { dist: 0.95, push: 0.06, dur: 7, yaw: -0.5 }),
    say('luka40', "He's an inferior version of myself; he lets himself be ruled by fear."),
    // [INSERT · the cracked phone] HACK 100%.
    glide([1.62, 0.52, -15.75], [1.24, 0.45, -15.4], 26, { pos: [1.55, 0.5, -15.68], look: [1.24, 0.45, -15.4], fov: 24 }, 4),
    HACK(100),
    { sfx: 'meter_full', vol: 0.18 },
    // Silence. 2 s.
    { do: (c) => { if (!sk(c)) AUDIO.ringing(false, { fade: 1.4 }); } },
    { wait: 2.0 },
    // [ECU · Luka's eye] It opens. (a soft light from in front of him: the wall lamp only finds the crown of his head)
    { do: (c) => {
      const a = act(c, 'luka');
      if (!a || sk(c)) return;
      eyeLight(c);
      a.eyePos(V1);
      const ry = a.rotY, sx = Math.sin(ry), sz = Math.cos(ry);
      const ex = V1.x - Math.cos(ry) * 0.032, ez2 = V1.z + Math.sin(ry) * 0.032;   // his right eye
      c.cam.shot({ shot: 'CAM', pos: [ex + sx * 0.3, V1.y + 0.0, ez2 + sz * 0.3], look: [ex, V1.y, ez2], fov: 16,
        to: { pos: [ex + sx * 0.27, V1.y, ez2 + sz * 0.27], look: [ex, V1.y, ez2], fov: 15 }, dur: 4, ease: 'linear' });
    } },
    { wait: 1.0 },
    expr('luka', 'hurt'),
    { wait: 0.9 },
    slow('luka', 'No…', { tag: 'barely audible' }),
    // [WIDE · locked, low] Luka gets up. Slowly. It takes a long time. One hand on the wall, then a knee, then up. His
    // polo is torn. Blood at his hairline. He holds his ribs. He picks up the snapped lanyard and closes his fist round it.
    { shot: 'CAM', pos: [-0.8, 0.3, -16.6], look: [2.75, 0.62, -22.3], fov: 38 },
    { do: (c) => { if (SETS.hq_top.lamp) SETS.hq_top.lamp('wall'); if (!sk(c)) AUDIO.muffle(null, 6); } },
    { do: (c) => {
      const a = act(c, 'luka'), up = SETS.hq_top.marks.s35_luka_up;
      if (!a) return;
      a.setExpr('hurt');
      if (sk(c)) { a.place('s35_luka_up'); a.play('hurt_stand'); const b = c.world.prop('luka_badge'); if (b) b.visible = false; return; }
      a.play('s35_getup', { dur: 10 });
      const z0 = WALL[2];
      const sid = c.flow.sceneId;
      c.wait(5.6).then(() => { if (c.flow.sceneId === sid) { const b = c.world.prop('luka_badge'); if (b) b.visible = false; c.sfx('cloth_swish', { vol: 0.15 }); } });
      return c.wait(6.6).then(() => tween(c, 3.4, (u) => { const k = ez(u); a.pos.z = z0 + (up[2] - z0) * k; a.rotY = up[3] * k; }));
    } },
    { wait: 0.4 },
    { do: (c) => { const b = c.world.prop('luka_badge'); if (b) b.visible = false; const a = act(c, 'luka'); if (a) { a.place('s35_luka_up'); a.play('hurt_stand'); } } },
    // [CLOSE · Future Luka's hand] It solidifies.
    play('luka40', 's35_hand_out', { dur: 0.01 }),
    { wait: 0.1 },
    { do: (c) => handLens(c, 0.05) },
    { wait: 1.1 },
    { do: (c) => erase(c, false) },
    { sfx: 'chip_on', vol: 0.08, rate: 0.6 },
    { wait: 1.4 },
    // [TWO-SHOT · the two Lukas, the room between them] Past Luka, wrecked and upright. Future Luka, untouched.
    play('luka40', 'still'),
    { face: 'luka40', to: 'luka', dur: 0 },
    expr('luka', 'determined'),
    glide([-5.9, 1.5, -22.0], [-0.1, 1.25, -18.1], 56, { pos: [-5.6, 1.48, -21.75], look: [-0.1, 1.25, -18.1], fov: 54 }, 8),
    { wait: 2.0 },
    slow('luka', "You're the one who's ruled by fear."),
    // [LOW · Luka, the sincere low angle from Rue's Torchlight] He raises his arm and waves it, once.
    { shot: 'CLOSE', on: 'luka', angle: 'low', dist: 1.1, locked: true },
    { wait: 0.6 },
    play('luka', 's35_wave', { dur: 2.4, loop: false }),
    { wait: 2.5 },
    // [WIDE] Every drone in the room turns, as one, away from the Chases. Over the nearest, a small pop-up flickers:
    // IDENTITY CONFIRMED: MANAGER. They drift across the office and form a ring around Future Luka, facing him. Red →
    // blue → a warm Yes yellow.
    anchor('far_corner', { push: 0.04, dur: 9 }),
    DRONE_WATCH(2.8, 1.6, -22.45, 0.6),
    { sfx: 'drone_scan', vol: 0.4, rate: 0.8 },
    { wait: 0.8 },
    { do: async (c) => {
      if (sk(c)) return;
      const g = ud(c, 'galaxy');
      if (!g) return;
      // the nearest drone in view (4-14 m out, closest to the middle of the picture; else the nearest to the lens)
      const lf = AN('far_corner').from, o = [0, 0, 0];
      let bi = -1, bs = 1e9, ni = 0, nd = 1e9;
      for (let i = 0; i < 24; i++) {
        g.pos(i, o); V3.set(o[0], o[1], o[2]);
        const d = Math.hypot(o[0] - lf[0], o[1] - lf[1], o[2] - lf[2]);
        if (d > 2 && d < nd) { nd = d; ni = i; }
        if (d < 4 || d > 14 || !c.cam.project) continue;
        const pr = c.cam.project(V3);
        if (!pr.visible) continue;
        const dx = pr.x - innerWidth / 2, dy = pr.y - innerHeight * 0.45, sc = dx * dx + dy * dy;
        if (sc < bs) { bs = sc; bi = i; }
      }
      g.pos(bi >= 0 ? bi : ni, o);
      const spec = { style: 'safesense', msg: 'IDENTITY CONFIRMED: MANAGER', buttons: [], at: { pos: [o[0], o[1] + 0.42, o[2]] }, w: 230, dur: 0.12, ding: false };
      c.popup(spec);
      await c.wait(0.2);
      c.popup(Object.assign({}, spec, { dur: 0.1 }));
      await c.wait(0.16);
      c.popup(Object.assign({}, spec, { dur: 2.4 }));
      c.sfx('ss_chirp', { vol: 0.2, rate: 0.8 });
    } },
    { wait: 1.6 },
    { do: (c) => { const g = ud(c, 'galaxy'); if (g) { g.ring(-3.0, -13.8, 2.3, 1.9, 3.0); g.color('blue', 0.8); } } },
    // (from behind the console: they settle round him like a halo, the pop-up on the glass behind him)
    glide([-3.0, 2.8, -21.0], [-3.0, 1.5, -13.6], 50, { pos: [-3.0, 2.7, -20.2], look: [-3.0, 1.55, -13.6], fov: 48 }, 7.5),
    { sfx: 'drone_ok', vol: 0.35 },
    { wait: 1.6 },
    { do: (c) => { const g = ud(c, 'galaxy'); if (g) g.color('yellow', 1.2); if (SETS.hq_top.lamp) SETS.hq_top.lamp('ring'); } },
    { env: 'yellow', dur: 1.5 },
    { sfx: 'drone_ok', vol: 0.3, rate: 1.25 },
    { wait: 2.4 },
    // The countdown on the glass stops at 11:57:30. A small word under it: PAUSED.
    { do: (c) => { const g = ud(c, 'glass_ui'); if (g) { g.clock({ h: 11, m: 57, s: 30, sec: true, paused: true }); g.clockRun(0); } c.hud.quiet('00:00:30'); } },
    anchor('glass_clock', { push: 0.06, dur: 4 }),
    { wait: 2.6 },
  ];

  // ==================================================================== 3.6 — "two"
  const CH_ASIDE = 's36_chase_side';               // Chase steps aside, beside him, once the song's on (out of the push)
  const C40_NEAR = [-1.35, 0, -13.75, -1.62];        // Chase (2040), inside the ring by the end (moved under the cutaway)
  function dress36(c) {
    storyFlags(c);
    const f = c.state.flags; f.hurt = true; f.lanyard_snapped = true;
    redress(c, ['luka', 'chase', 'chase40', 'luka40']);
    l40Look(c, false);
    const l = act(c, 'luka40'); if (l) { l.place('s35_l40_end'); l.setExpr('still'); }
    const lk = act(c, 'luka'); if (lk) { lk.place('s35_luka_up'); lk.play('hurt_stand'); lk.setExpr('hurt'); lk.walkAnim = 'limp'; LIVE.limp = lk; }   // (he limps to the console)
    const ch = act(c, 'chase'); if (ch) { ch.place('s35_chase'); ch.play('kneel'); ch.setExpr('stunned'); ch.rig.show('headphones_neck', true); }
    const c4 = act(c, 'chase40'); if (c4) { c4.place('s36_c40'); c4.play('still'); c4.setExpr('sad'); }
    const g = ud(c, 'galaxy'); if (g) g.color('yellow', 0);
    const gl = ud(c, 'glass_ui'); if (gl) { gl.popup('yes_only', { sched: false }); gl.cursor(null); gl.clock({ h: 11, m: 57, s: 30, sec: true, paused: true }); gl.clockRun(0); }
    const ph = ud(c, 'luka_phone'); if (ph) { ph.state('dangling'); ph.screen('cracked', 100); ph.swing(0.3); }
    const cn = ud(c, 'console'); if (cn) cn.screen('hack', 100);
    const cr = c.world.prop('wall_crack'); if (cr) cr.visible = true;
    if (SETS.hq_top.lamp) SETS.hq_top.lamp('ring');
  }
  // the Valley set under the black at the start (steps 26–27 cut to it): prebuilt over three frames, capped
  function prebuildValley(c) {
    if (!SETS.valley || sk(c)) return;
    if ((c.world.liveIds || []).includes('valley')) return;
    const t0 = clock.t;
    let done = false;
    c.world.prebuild('valley').then(() => { done = true; });
    return waitUntil(() => done || c.flow.skipping || clock.t - t0 > 6);
  }
  SCENES['3.6'] = {
    title: 'two', set: 'hq_top', env: 'yellow', time: '11:57', place: 'Optus Tower, the top floor', timeCard: false,
    playable: [], swap: false, music: null, hud: null,
    spawn: { luka: 's35_luka_up', chase: 's35_chase', chase40: 's36_c40', luka40: 's35_l40_end' },
    steps: [
      ['do', dress36],
      ['cutscene', '3.6_yet'],
      // ▶ PLAY — "Your call." Control passes to Future Luka, the only time the player controls him. Both buttons live.
      ['minigame', 'hold_no', {}],
      ['cutscene', '3.6_cancel'],
    ],
    grants: { flags: { santa: false, headphones: true, hurt: true, lanyard_snapped: true, s36_no: true }, hack: null, quiet: null, noService: false },
  };

  const L40_PUSH = (o = {}) => ({ do: (c) => closeOn(c, 'luka40', Object.assign({ dist: 1.75, push: 1.0, dur: 26, dy: -0.03, yaw: -0.15 }, o)) });
  CUTSCENES['3.6_yet'] = [
    { fade: 'out', dur: 0 },
    { do: (c) => prebuildValley(c) },
    // [MID] Chase gets up out of the dissolved foam. He walks across the office toward Future Luka. The ring of yellow
    // drones parts for him.
    glide([-9.9, 1.9, -19.6], [-6.8, 1.0, -16.4], 48, { pos: [-9.4, 1.85, -19.2], look: [-5.6, 1.2, -15.6], fov: 48 }, 7),
    { fade: 'in', dur: 0.8 },
    { wait: 0.5 },
    play('chase', 'stand'),
    { wait: 1.1 },
    { do: (c) => { const g = ud(c, 'galaxy'); if (g) g.part(Math.atan2(-8.0 + 3.0, -17.0 + 13.8), 0.9); } },
    { sfx: 'drone_ok', vol: 0.2, rate: 0.9 },
    expr('chase', 'determined'),
    { move: 'chase', to: 's36_chase_l40' },
    // [CLOSE · Chase's hands] He lifts the big over-ear headphones from round his neck and plugs them into his phone.
    // (from his left side: Future Luka stands less than a metre in front of him)
    CLOSE('chase', { dist: 1.1, push: 0.15, dur: 5, yaw: 0.8, dy: 0.02, ly: 0.04, fov: 40 }),
    { do: (c) => { const a = act(c, 'chase'); if (a) a.rig.show('headphones_neck', false); } },
    play('chase', 'hold_headphones_up'),
    { wait: 1.2 },
    { sfx: 'plug_click', vol: 0.35, rate: 1.2 },
    { wait: 0.8 },
    // [TWO-SHOT · Chase and Future Luka] Future Luka looks at him and doesn't stop him.
    { face: 'luka40', to: 'chase', dur: 0.8 },
    { do: (c) => {   // side on from the room: Future Luka frame-left against the glass and its pop-up, Chase frame-right
      const a = act(c, 'chase'), b = act(c, 'luka40');
      if (!a || !b || sk(c)) return;
      const mx = (a.pos.x + b.pos.x) / 2, mz = (a.pos.z + b.pos.z) / 2;
      let dx = b.pos.x - a.pos.x, dz = b.pos.z - a.pos.z;
      const n = Math.hypot(dx, dz) || 1; dx /= n; dz /= n;
      const px = dz * 0.866 - dx * 0.5, pz = -dx * 0.866 - dz * 0.5;   // 30° round toward his face: the [YES] and the empty slot behind him
      c.cam.shot({ shot: 'CAM', pos: [mx + px * 2.05, 1.6, mz + pz * 2.05], look: [mx, 1.55, mz], fov: 40,
        to: { pos: [mx + px * 1.85, 1.6, mz + pz * 1.85], look: [mx, 1.56, mz], fov: 40 }, dur: 12, ease: 'linear' });
    } },
    { wait: 1.6 },
    say('chase', 'I said not yet.'),
    // (He lifts the headphones over Future Luka's head and settles them over his ears, the way Luka once put a lanyard
    // over Rue's head.)
    play('chase', 'put_headphones_on', { z: 0.86, h: 1.86 }),
    { wait: 1.5 },
    { do: (c) => { const a = act(c, 'luka40'); if (a) a.rig.show('headphones_head', true); } },
    { sfx: 'cloth_swish', vol: 0.2, rate: 1.1 },
    { wait: 0.8 },
    play('chase', 'idle'),
    say('chase', "It's yet."),
    // [INSERT · Chase's thumb] Play. The file: two.
    play('chase', 'type_phone'),
    { shot: 'INSERT', at: 'chase', dist: 0.7, card: ['s36_play', { playing: false }] },
    { wait: 1.6 },
    { do: (c) => { if (!sk(c)) c.ui.card('s36_play', { playing: true }); } },
    { sfx: 'button_press', vol: 0.25 },
    // The song plays. The score becomes the song: "two", built from the samples the player collected. Continuous from here.
    { do: (c) => songStart(c) },
    play('chase', 'idle'),
    { move: 'chase', to: CH_ASIDE, nowait: true },
    // [CLOSE · Future Luka, one unbroken slow push-in through the whole first verse] Nothing. He stands absolutely still
    // and listens.
    expr('luka40', 'still'),
    L40_PUSH(),
    atBar(10),
    // [CLOSE · Chase (2040)] He realises what's coming. He closes his eyes.
    CLOSE('chase40', { dist: 1.0, push: 0.2, dur: 11 }),
    expr('chase40', 'sad'),
    atBar(12, 8),
    expr('chase40', 'sleep'),
    atBar(14),
    { face: 'chase', to: 'luka40', dur: 0.6 },
    // (still listening: the song goes on through the chorus and the second verse)
    { do: (c) => closeOn(c, 'luka40', { dist: 1.2, push: 0.25, dur: 11, yaw: -1.1, dy: 0.0 }) },
    atBar(18),
    { do: (c) => {
      const a = act(c, 'luka40');
      if (!a || sk(c)) return;
      a.eyePos(V1);
      c.cam.shot({ shot: 'CAM', pos: [V1.x - 1.4, V1.y + 2.3, V1.z - 1.6], look: [V1.x, V1.y - 0.3, V1.z], fov: 50,
        to: { pos: [V1.x - 1.1, V1.y + 0.15, V1.z - 1.35], look: [V1.x, V1.y - 0.05, V1.z], fov: 44 }, dur: 12, ease: 'out' });
    } },
    atBar(22),
    OTS('luka40', 'chase', { side: 0.3, dur: 8, push: 0.1 }),
    expr('chase', 'sad'),
    atBar(24),
    L40_PUSH({ dist: 1.05, push: 0.25, dur: 10, yaw: -0.1 }),
    atBar(26),
    // The bridge. The song drops to almost nothing, and in the space, Luka's laugh, young and helpless on a hover-
    // scooter at twenty-five kilometres an hour. [CLOSE · Future Luka] His face breaks. He tears up and can't stop it.
    // He brings a gloved hand to his mouth.
    atBar(26, 6),
    expr('luka40', 'tearful'),
    atBar(27, 4),
    play('luka40', 's36_mouth'),
    atBar(29),
    // [TOP-DOWN · Chase (2040)] His hands start to rise toward his head, the old reflex, and stop halfway, and come down.
    { shot: 'TOP', on: 'chase40', dist: 1.5, offset: 0.25 },
    expr('chase40', 'tearful'),
    { wait: 0.6 },
    play('chase40', 'hands_rise', { stop: true, dur: 2.8 }),
    atBar(31),
    play('chase40', 'still'), expr('chase40', 'tearful'),
    // [MID · Luka] Holding his ribs against the wall, watching his future self cry.
    expr('luka', 'sad'),
    { do: (c) => closeOn(c, 'luka', { dist: 1.7, push: 0.25, dur: 10, dy: -0.15, yaw: 0.25 }) },
    atBar(34),
    // The last chorus lifts from B minor into D major and quotes the 1987 Pudding melody, the hold music.
    // [WIDE · the ring of yellow drones, Future Luka crying in the middle, Chase beside him, the city through the glass]
    put('chase', 's36_chase_side'),
    glide([-3.6, 3.2, -20.4], [-3.0, 1.5, -12.8], 46, { pos: [-3.55, 3.1, -19.9], look: [-3.0, 1.5, -12.8], fov: 46 }, 8),
    { do: (c) => { const a = act(c, 'luka'); if (a && !sk(c)) a.moveTo([0.95, 0, -16.12, 0.36], { speed: 0.95 }); } },
    { wait: 3.6 },
    // [INSERT · the glass] OPT OUT ALL USERS? [YES]
    anchor('glass_popup', { push: 0.05, dur: 3 }),
    { wait: 2.2 },
    // [CLOSE · Luka] He limps to the console, pulls his cracked phone free of its cable, and taps it once.
    { move: 'luka', to: [0.95, 0, -16.12, 0.36], speed: 0.95 },
    glide([2.75, 1.56, -15.15], [0.95, 1.32, -16.05], 42, { pos: [2.55, 1.52, -15.3], look: [0.95, 1.26, -16.05], fov: 40 }, 6),
    expr('luka', 'hurt'),
    play('luka', 's36_pull', { dur: 2.6, loop: false }),
    { wait: 1.25 },
    { do: (c) => { const ph = ud(c, 'luka_phone'), a = act(c, 'luka'); if (ph) ph.state('pulled'); if (a) a.rig.show('phone', true); } },
    { sfx: 'plug_click', vol: 0.35, rate: 0.8 },
    { wait: 1.4 },
    play('luka', 's36_hold_phone', { tap: 1 }),
    { wait: 0.3 },
    { sfx: 'button_press', vol: 0.25, rate: 0.9 },
    // [INSERT · the glass] A second button appears in the empty space: OPT OUT ALL USERS? [YES] [NO]
    anchor('glass_popup', { push: 0.06, dur: 3 }),
    { wait: 0.5 },
    { do: (c) => { const g = ud(c, 'glass_ui'); if (g) g.popup('yes_no', { sched: false }); } },
    { sfx: 'ss_chirp', vol: 0.22 },
    { wait: 1.4 },
    // LUKA: "Your call." (He gives the choice back. The opposite of deciding for people.)
    { face: 'luka', to: 'luka40', dur: 0.7 },
    expr('luka', 'tired'),
    CLOSE('luka', { dist: 1.1, push: 0.06, dur: 5, yaw: -0.3, dy: 0.04 }),
    say('luka', 'Your call.'),
    { wait: 0.6 },
    // Future Luka turns to the glass and steps up to it; Chase beside him
    play('luka40', 'still'),
    expr('luka40', 'tearful'),
    anchor('s36_ring_wide', { push: 0.1, dur: 5 }),
    { move: 'luka40', to: 's36_l40_glass' },
    { do: (c) => { const a = act(c, 'chase'); if (a) a.face('luka40', 0.4); } },
    { wait: 0.3 },
  ];

  CUTSCENES['3.6_cancel'] = [
    // NO pressed: the JARVIS restart chime. The final chorus plays on (it loops) until the Valley has had its moment.
    // [INSERT] NO.
    anchor('glass_popup_ecu', { push: 0.06, dur: 3 }),
    { sfx: 'restart_chime', vol: 0.4 },
    { wait: 1.6 },
    // SAFESENSE: "Opt-Out cancelled."
    anchor('glass_popup', { push: 0.06, dur: 4 }),
    { do: (c) => { const g = ud(c, 'glass_ui'); if (g) { g.cursor(null); g.popup('cancelled', { sched: false }); } } },
    say('safesense', 'Opt-Out cancelled.'),
    // The clock on the glass: 11:57:30 … 11:57:59 … 11:58.
    anchor('glass_clock', { push: 0.06, dur: 4 }),
    { do: (c) => { const g = ud(c, 'glass_ui'); if (g) { g.clock({ h: 11, m: 57, s: 30, sec: true, quiet: '00:00:30' }); g.clockRun(sk(c) ? 0 : 9.5); } } },
    { wait: 3.1 },
    { do: (c) => { const g = ud(c, 'glass_ui'); if (g) { g.clockRun(0); g.clock({ h: 11, m: 58, s: 0, sec: false, quiet: null }); } } },
    { sfx: 'tick', vol: 0.2 },
    { wait: 0.7 },
    // [WIDE · the Valley from the office, through the rain] At 11:58 the countdown on the tower facade reaches zero, and
    // instead of going dark the Valley lights up. Neon to full brightness. Music bursts out of every bar along Brunswick
    // Street. Chinatown's lanterns swing in the wind. People in the street stop and look up. Chip lights flicker.
    put('chase40', C40_NEAR),
    { face: 'chase40', to: 's36_l40_glass', dur: 0 },
    anchor('s36_valley', { push: 0.03, dur: 6 }),
    { env: 'lit', dur: 2 },
    { do: (c) => { const g = ud(c, 'facade_glow'); if (g) g.zero(2); if (SETS.hq_top.lightUp) SETS.hq_top.lightUp(2); } },
    { wait: 4.2 },
    // [INSERT · a passer-by's chip view] Opt out? NO. ^ Thank you for staying.
    { if: () => !!SETS.valley && !flow.skipping, then: [
      { set: 'valley', env: 'lit' },
      { do: (c) => {
        const V = SETS.valley;
        if (V.dress) V.dress('lit36');
        const tw = c.world.prop('tower');
        const fc = tw && tw.getObjectByName ? tw.getObjectByName('facade_countdown') : null;
        if (fc && fc.userData.zero) fc.userData.zero(sk(c) ? 0 : 1.2);
        const ln = ud(c, 'lanterns'); if (ln && ln.swing) ln.swing(true);
        const cf = ud(c, 'crowd_far'); if (cf && cf.mode) cf.mode('look_up');
        const p = c.world.spawn('local40_c', 's36_phone');
        if (p) { p.play('look_up'); }
      } },
      { shot: 'CAM', pos: [1.6, 1.62, 33.0], look: [0.0, 112.0, -10.7], fov: 30, to: { pos: [1.6, 1.62, 33.0], look: [0.0, 111.0, -10.7], fov: 28 }, dur: 5 },
      { do: (c) => { if (!sk(c)) { c.ui.chipView(true); LIVE.chip = true; } } },
      { wait: 0.7 },
      { do: async (c) => {
        if (sk(c)) return;
        const p = c.popup({ style: 'safesense', title: 'SafeSense', msg: 'Opt out? NO.', buttons: [], at: [0.5, 0.42], w: 360, dur: 3.6, icon: 'none' });
        await c.wait(0.8);
        if (p && p.setMsg) p.setMsg('Opt out? NO.\nThank you for staying.');
        c.sfx('ss_chirp', { vol: 0.2 });
      } },
      { wait: 3.4 },
      { do: (c) => { c.ui.chipView(false); LIVE.chip = false; } },
      // [WIDE · the mall from above] Somewhere a phone rings, and someone answers. The storm breaks properly: rain pours
      // down, and people in the street don't run. They laugh.
      { shot: 'CAM', pos: [3.0, 11.0, 17.0], look: [0.0, 0.5, 36.0], fov: 52, to: { pos: [2.6, 9.4, 18.6], look: [0.0, 0.6, 36.0], fov: 50 }, dur: 16 },
      { do: () => songOutro(3.2) },   // the outro comes in at the end of the next phrase that leaves this shot 3 s
      { sfx: 'phone_ring', vol: 0.4, at: [-2.2, 1.0, 38.0] },
      { sfx: 'thunder', vol: 0.6 },
      { wait: 1.3 },
      { do: (c) => { const p = act(c, 'local40_c'); if (p) p.play('phone'); } },
      { wait: 1.0 },
      atOutro(42, 9, 26),
      { set: 'hq_top', env: 'lit' },
    ], else: [
      anchor('s36_mall_fallback', { push: 0.05, dur: 12 }),
      { do: () => songOutro(3.2) },
      atOutro(42, 9, 26),
    ] },
    // [INSERT · the console] The song's last chord resolves into the JARVIS restart chime, three notes rising.
    anchor('console_screen', { push: 0.08, dur: 4 }),
    { do: (c) => { const cn = ud(c, 'console'); if (cn) cn.screen('restart', 0); } },
    atOutro(43, 0, 8),
    { do: async (c) => {
      const cn = ud(c, 'console');
      if (!cn) return;
      if (sk(c)) { cn.screen('restart', 3); return; }
      for (let i = 1; i <= 3; i++) { cn.screen('restart', i); if (i < 3) await c.wait(0.2 * spd()); }
    } },
    { wait: 0.7 },
    // [CLOSE · Future Luka] He takes the headphones off. The song finishes. (The last chord rings; the 1987 melody's final D.)
    { face: 'luka40', to: 'chase40', dur: 0 },
    play('luka40', 'still'),
    expr('luka40', 'tearful'),
    CLOSE('luka40', { dist: 1.0, push: 0.1, dur: 6 }),
    play('luka40', 'phones_off'),
    { wait: 1.0 },
    { do: (c) => { const a = act(c, 'luka40'); if (a) a.rig.show('headphones_head', false); } },   // (the anim hides them; a skip plays no anim)
    { do: (c) => { if (sk(c)) songStop(); } },
    { do: (c) => { const t0 = clock.t; return waitUntil(() => c.flow.skipping || !SG.on || clock.t - t0 > 4 * spd()); } },
    { do: () => songStop() },
    { wait: 0.8 },
    slow('luka40', '…That was the bridge.'),
    { face: 'chase40', to: 'luka40', dur: 0 },
    CLOSE('chase40', { dist: 0.95, push: 0.05, dur: 5 }),
    expr('chase40', 'fond'),
    say('chase40', 'Yeah.'),
    CLOSE('luka40', { dist: 1.0, push: 0.05, dur: 5 }),
    say('luka40', 'You finished it.'),
    // (inside the ring: the hovering drones stay behind them)
    CLOSE('chase40', { dist: 1.0, push: 0.06, dur: 5, yaw: 0.35 }),
    glanceAt('chase40', 'chase', 1.6),
    play('chase40', 'nod', { dur: 0.9 }),
    say('chase40', 'He did.', { tag: 'nodding at his younger self' }),
    { face: 'chase', to: 'chase40', dur: 0.6 },
    expr('chase', 'fond'),
    CLOSE('chase', { dist: 0.95, push: 0.05, dur: 5 }),
    say('chase', 'We did.'),
    // [WIDE] The yellow drones settle, one by one, onto the floor around them like birds landing.
    anchor('s36_ring_wide', { push: 0.08, dur: 9 }),
    { do: (c) => { const g = ud(c, 'galaxy'); if (g) g.land(4.2); } },
    { sfx: 'dock_clunk', vol: 0.12, rate: 1.5 },
    { wait: 5.0 },
  ];
})();
