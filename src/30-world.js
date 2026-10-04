// ============================================================ WORLD (ENGINE-B1, extended for TWO)
// Sets (one THREE.Scene each, the fixed light rig, env lerps, an LRU of three live sets, staged pre-builds, sets
// more than two scenes behind disposed), actors (pooled rigs, blob shadows, moves, anims, tics), the player
// (modern/tank, colliders, a party of followers on one breadcrumb trail), gameplay cameras (zones + fixed/pan/rail/
// push, chained corridor eases, overrides), the cutscene camera (frame(), shots, moves, roll, shake), split screen
// (two live halves, each with its own moving shot; open/close slides), time-lapse, and helpers for systems (drones).
// Update/render paths only write into preallocated temporaries.
//
// TWO additions to Rue's world (docs/engine/04-world.md documents the rest; ARCHITECTURE §5):
// PARTY   player.follower(id | [ids] | null): the followers walk the leader's breadcrumb trail in a loose line (the k-th
//         active one stops 1.3 + 0.9·k m behind), side-step out of his way, keep 0.6 m apart, never block the player
//         (doorways stay open), never cut the camera (zones follow player.actor only), and reappear on the trail when
//         left > 8 m behind off screen. player.followers = the actors (read-only); player.fol = the first.
//         player.wait(id, on = true): that follower holds its spot (not moved, pushed or teleported) until
//         player.wait(id, false), player.control(id) or a despawn; then it picks the trail up from where the leader
//         went after it stopped. player.waiting(id) -> bool. (flow.holdPos(id) does the same by leaving the list.)
// PLAY    modern controls: camera-relative, the stick direction locked across any cut until released (re-read from
//         the shot you see, else the gameplay camera it is cutting/easing to); tank: options.controls = 'tank'.
//         Walk CONFIG.walk 1.7 m/s, run CONFIG.run 3.4 m/s. A set cam with `ease: true | secs` eases (0.25 s,
//         max 0.5) into the next cam instead of cutting, when that cam has `ease` too (chained corridor cameras).
// SHOTS   cam.shot(step): kind = step.shot, case-insensitive, spaces = hyphens. Sizes ECU CLOSE MID WIDE TWO(-SHOT)
//         THREE(-SHOT) TOP(-DOWN); INSERT, JARVIS(-CAM), POV, CAM, SET; LOW / HIGH / OTS / LOCKED and the moves PUSH
//         PULL(-OUT) TRACK PAN TILT CRANE ORBIT WHIP CRASH(-ZOOM) frame at `size` (default MID). Every option:
//         on, at, from, to, size, dist, height, angle (high|low|side|top), side (left|right|back|ots:<id>), offset,
//         facing, locked, fov, move, dur, ease (linear|in|out), amount, track, card (flow), plus TWO's:
//           half: 'right'          the shot goes to the right half of a split (else the main / left camera)
//           roll: deg              camera roll (180 = upside down: "Luka's view, upside down")
//           shake: amp | {amp,dur} a decaying jolt at the cut (also cam.shake(amp = 0.04, dur = 0.45)); none by default
//           OTS over: id | from: id | on: [subject, shoulder] (else the nearest other actor); shoulder: 'left'|'right'
//                                  (default right: the shoulder sits frame-left); angle: 'low' (from below) | 'high'
//           LOCKED                 a framed shot that never reaims and never moves (= locked: true, move ignored)
//           CRASH zoom: fov        the FOV it punches in to (default half the framing's); fov = the starting lens
//           ORBIT spin: true       keeps turning past dur at its final speed (ease: 'in' = Chase's idea engine)
//           CRANE dir: 'down'      from 2 m above down to the framing (from/to = metres of rise override)
//           JARVIS                 `on` optional: default = everyone just beyond the screen, within 5 m
//           WHIP                   0.2 s pan with overshoot, lens breath and a 1.6 px canvas blur (world.whipBlur)
//         The framing helper (frame(subjects, size, opts) -> shared {pos, look, fov, up}) never leaves the lens inside
//         or behind a wall: rays lens->aim (surfaces facing the lens) and aim->lens (surfaces facing the subject: a
//         lens inside a wall or above a ceiling), and for groups lens->every face; it swings round (35/70/90 deg),
//         else comes in front of the nearest surface (both faces of a thick wall), else takes the zone's set camera.
//         Crane rises, orbit radii and pull-outs of framed shots are shrunk at the cut to what the room allows.
//         Flag a mesh userData.noOcclude to let framing see through it. Narrow screens: compositions are fitted at
//         16:9 and render() widens the vertical FOV to keep that horizontal field (world.fitNarrow, caps 140/100 deg).
// SPLIT   world.split({ left: { set, shot | cam, env }, right: { set, shot | cam, env }, ratio = 0.5 }, { slide, dur })
//         two live sets, both halves with their own moving shots (cam.shot({..., half: 'right'}) recuts the right);
//         right.set is required to open, optional once split. slide: the right half slides in (0.6 s).
//         world.split(null, { slide, keep: 'left' | 'right', dur }) closes it: the kept half widens to fill the frame
//         (keep: 'right' makes the right set current, its actors and shot included, with its ambience). Not awaited by
//         the flow; resolves when the slide ends. cam.project(v, 'right') projects through the right half.
// SETS    at most world.liveMax = 3 live; a set not on screen for more than two scenes is disposed when a scene starts.
//         world.prebuild(id) -> Promise: builds over three frames (build, upload + ray grids, prime) during a
//         cutscene's last shot or a fade; load/show/spawn({set}) finish it at once; instant while skipping.
//         world.prop/anchor/mark(name, setId?) look in a named live set (reddy26 and reddy40 share names).
// SYSTEMS world.actorsIn(x, z, r, out) -> out (visible actors of the current set within r; pass your own array),
//         world.colliders (the current set's boxes, live), world.collide(actorOrId, x, z) -> a.pos (pushed out of
//         colliders and other actors), world.resolve(x, z, r = 0.3, out) -> out (x, floor, z) out of colliders,
//         world.lineClear(x0, z0, x1, z1, pad = 0) -> bool (no collider box on the segment), world.floorAt(x, z),
//         actor.moveTo(where, { collide: true }) (AI: slides along walls, ends where it stalls for 0.6 s).
//         Debug: world.liveIds, world.pendingIds, world.splitId, cam.cameraR.
// MISC    world.envName: the current set's env preset name; world.raining: its env rains now (the flow starts a set's rain
//         bed only then). world.torchAuto is reset to true whenever a set is shown. A timelapse stops (no more keys) when
//         the scene changes or another set is shown, and lands at once while skipping.
//         cam.override(mode, { ..., ease: secs }) blends into (or, with null, out of) an override instead of cutting;
//         'fixed' takes pos/look arrays a mini-game may mutate in place every tick, damped by lag / lookLag (seconds).
//         Colliders are live: a set may push, splice or move boxes in def.colliders at runtime (pushed bins, opening
//         doors); collisions, drone cones and lineClear read them every tick.

const { world, cam, frame, player } = (() => {
  const TAU = Math.PI * 2, DEG = Math.PI / 180;
  const V = () => new THREE.Vector3();
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const smooth = (u) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
  const EASE = { linear: (u) => u, in: (u) => u * u * u, out: (u) => 1 - (1 - u) ** 3 };
  const angTo = (a, b) => { let d = (b - a) % TAU; if (d > Math.PI) d -= TAU; else if (d < -Math.PI) d += TAU; return d; };
  const damp = (rate, dt) => 1 - Math.exp(-rate * dt);
  const skipping = () => typeof flow !== 'undefined' && flow.skipping;
  const settle = (o, k) => { const r = o[k]; o[k] = null; if (r) r(); };
  const t1 = V(), t2 = V(), t3 = V(), t4 = V(), t5 = V(), tc = new THREE.Color(), size2 = new THREE.Vector2(), box3 = new THREE.Box3();

  const camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 0.05, 600);
  const camR = new THREE.PerspectiveCamera(40, 1, 0.05, 600);   // right half of a split

  // ------------------------------------------------------------ sets
  const live = new Map();          // setId -> entry, oldest first (LRU)
  let cur = null, splitE = null;
  // scenes seen (state.scene changes): each live entry remembers the last scene it was on screen in (e.used), and a
  // set more than two scenes behind is disposed when a new scene starts (spec §16: at most three sets alive)
  let sceneN = 0, sceneSeen;
  const pending = new Map(), pbQ = [];   // setId -> a staged prebuild { id, e, stage, res, p } (one stage per rendered frame), queued in order

  const envNew = () => ({ bg: new THREE.Color(0x808080), fog: new THREE.Color(0x808080), dens: 0.01, hs: new THREE.Color(), hg: new THREE.Color(0x444444),
    hi: 1, dc: new THREE.Color(), di: 1, dp: V().set(5, 10, 5), sc: new THREE.Color(), si: 0, sp: false, rain: 0 });
  function envCopy(o, s) {
    o.bg.copy(s.bg); o.fog.copy(s.fog); o.dens = s.dens; o.hs.copy(s.hs); o.hg.copy(s.hg); o.hi = s.hi;
    o.dc.copy(s.dc); o.di = s.di; o.dp.copy(s.dp); o.sc.copy(s.sc); o.si = s.si; o.sp = s.sp; o.rain = s.rain; return o;
  }
  // rain amount when a preset doesn't say: rainy sets rain except in 'sun'; any preset named *rain* rains
  const rainFor = (def, name) => (name === 'sun' ? 0 : (def.ambience && def.ambience.rain) || /rain/.test(name) ? 1 : 0);
  function envFill(o, p, name, e) {   // o already holds the base; the preset overrides what it names
    if (p.bg != null) o.bg.set(p.bg);
    if (p.fog) { o.fog.set(p.fog[0]); if (p.fog[1] != null) o.dens = p.fog[1]; }
    if (p.hemi) { o.hs.set(p.hemi[0]); if (p.hemi[1] != null) o.hg.set(p.hemi[1]); if (p.hemi[2] != null) o.hi = p.hemi[2]; }
    if (p.dir) { o.dc.set(p.dir[0]); if (p.dir[1] != null) o.di = p.dir[1]; if (p.dir[2]) o.dp.fromArray(p.dir[2]); }
    o.sp = !!p.spot; if (p.spot) { o.sc.set(p.spot[0]); o.si = p.spot[1] ?? 0; }
    o.rain = p.rain ?? (name ? rainFor(e.def, name) : o.rain);
    return o;
  }
  function envLerp(o, a, b, k) {
    o.bg.lerpColors(a.bg, b.bg, k); o.fog.lerpColors(a.fog, b.fog, k); o.dens = a.dens + (b.dens - a.dens) * k;
    o.hs.lerpColors(a.hs, b.hs, k); o.hg.lerpColors(a.hg, b.hg, k); o.hi = a.hi + (b.hi - a.hi) * k;
    o.dc.lerpColors(a.dc, b.dc, k); o.di = a.di + (b.di - a.di) * k; o.dp.lerpVectors(a.dp, b.dp, k);
    o.sc.lerpColors(a.sc, b.sc, k); o.si = a.si + (b.si - a.si) * k; o.sp = b.sp; o.rain = a.rain + (b.rain - a.rain) * k;
  }
  function envApply(e, s) {
    e.scene.background.copy(s.bg); e.scene.fog.color.copy(s.fog); e.scene.fog.density = s.dens;
    e.hemi.color.copy(s.hs); e.hemi.groundColor.copy(s.hg); e.hemi.intensity = s.hi;
    e.dir.color.copy(s.dc); e.dir.intensity = s.di; e.dir.position.copy(s.dp);
    if (s.sp) { e.spot.color.copy(s.sc); e.spot.intensity = s.si; }
    if (e.rain) { e.rain.uniforms.uAmount.value = clamp(s.rain, 0, 1); e.rain.visible = s.rain > 0.01; }
  }
  function envSet(e, p, dur = 0) {
    if (!e) return Promise.resolve();
    const name = typeof p === 'string' ? p : null, pr = name ? e.def.env && e.def.env[name] : p;
    if (!pr) { testLog('world.env: no preset ' + p + ' in ' + e.id); return Promise.resolve(); }
    settle(e, 'envRes');
    if (name) e.envName = e.ctx.env = name;
    envCopy(e.from, e.env); envFill(envCopy(e.to, e.env), pr, name, e);
    if (!(dur > 0) || skipping()) { e.envDur = 0; envEnd(e); return Promise.resolve(); }
    e.envT = 0; e.envDur = dur;
    return new Promise((r) => { e.envRes = r; });
  }
  function envEnd(e) {
    const wet = e.env.rain > 0;
    envCopy(e.env, e.to); envApply(e, e.env);
    if ((e.env.rain > 0) !== wet && e === cur) ambience(e);
  }
  function envTick(e, dt) {
    if (!(e.envDur > 0)) return;
    e.envT += dt;
    if (e.envT >= e.envDur) { e.envDur = 0; envEnd(e); settle(e, 'envRes'); return; }
    envLerp(e.env, e.from, e.to, smooth(e.envT / e.envDur)); envApply(e, e.env);
  }
  function ambience(e) {
    if (typeof AUDIO === 'undefined') return;
    const a = e.def.ambience || {};
    if (AUDIO.ambience) AUDIO.ambience({ rain: e.env.rain > 0 && (a.rain || true), loops: a.loops || [] });   // the set's rain kind ('glass', 'roof', ...)
    if (AUDIO.setRoom) AUDIO.setRoom(a.room || 'none');
  }

  // pooled smoke/spark puffs: one Points per set (in the scene from build, so its program is warmed)
  const PUFF = 64;
  let puffMat = null;
  function makePuff() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(PUFF * 3), 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(PUFF * 4), 4).setUsage(THREE.DynamicDrawUsage));
    puffMat ||= new THREE.PointsMaterial({ size: 0.22, vertexColors: true, transparent: true, depthWrite: false,
      map: canvasTex(64, 64, (c, w, h) => {
        const gr = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
        gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.6, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
        c.fillStyle = gr; c.fillRect(0, 0, w, h);
      }, { key: 'puff' }) });
    const pts = new THREE.Points(g, puffMat);
    pts.frustumCulled = false; pts.visible = false; pts.name = 'puff';
    pts.userData = { vel: new Float32Array(PUFF * 3), life: new Float32Array(PUFF), max: new Float32Array(PUFF), g: new Float32Array(PUFF), next: 0 };
    return pts;
  }
  function puffTick(e, dt) {
    const pz = e.puff;
    if (!pz.visible) return;
    const u = pz.userData, pos = pz.geometry.attributes.position, col = pz.geometry.attributes.color, pa = pos.array, ca = col.array;
    let alive = 0;
    for (let j = 0; j < PUFF; j++) {
      if (u.life[j] <= 0) continue;
      if ((u.life[j] -= dt) <= 0) { ca[j * 4 + 3] = 0; continue; }
      alive++;
      const v = u.vel, k = 1 - 1.6 * dt;
      v[j * 3 + 1] -= u.g[j] * dt; v[j * 3] *= k; v[j * 3 + 1] *= k; v[j * 3 + 2] *= k;
      pa[j * 3] += v[j * 3] * dt; pa[j * 3 + 1] += v[j * 3 + 1] * dt; pa[j * 3 + 2] += v[j * 3 + 2] * dt;
      ca[j * 4 + 3] = 0.85 * u.life[j] / u.max[j];
    }
    pos.needsUpdate = true; col.needsUpdate = true;
    if (!alive) pz.visible = false;
  }

  // one material on plain and instanced meshes (or instanced with and without colours) makes three re-pick its
  // program at every switch, every frame (garbage + CPU): the instanced ones get a cached twin (warmed with the set)
  const TW = new Map(), vk = (o) => (o.isInstancedMesh ? (o.instanceColor ? 4 : 2) : o.isSkinnedMesh ? 8 : 1);
  function twins(group) {
    const used = new Map();
    group.traverse((o) => { if (o.material && !Array.isArray(o.material)) used.set(o.material, (used.get(o.material) || 0) | vk(o)); });
    group.traverse((o) => {
      const u = o.isInstancedMesh && used.get(o.material);
      if (!(u & (u - 1))) return;
      const m = o.material, k = vk(o), t = TW.get(m) || TW.set(m, {}).get(m);
      if (!t[k]) { t[k] = m.clone(); t[k].defaultAttributeValues = m.defaultAttributeValues; }
      o.material = t[k];
    });
  }

  function build(id) {
    const def = SETS[id];
    if (!def) throw new Error('TWO: no SETS.' + id);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(); scene.fog = new THREE.FogExp2(0x808080, 0.01);
    // the fixed light rig: never add/remove lights later (shader recompiles), only change values
    const hemi = new THREE.HemisphereLight(), dir = new THREE.DirectionalLight(), spot = new THREE.SpotLight(0xffffff, 0, 30, 0.33, 0.5, 1.5);
    spot.name = 'torch';
    scene.add(hemi, dir, spot, spot.target);
    const group = def.build();
    scene.add(group);
    twins(group);
    const props = {};
    group.traverse((o) => { if (o.name && !props[o.name]) props[o.name] = o; });
    const anchors = {};
    for (const k in def.anchors || {}) {
      const a = def.anchors[k], at = Array.isArray(a) ? a : a.at;
      anchors[k] = { at: V().fromArray(at), from: a.from ? V().fromArray(a.from) : null, fov: a.fov ?? null };
    }
    const names = Object.keys(def.env || {}), amb = def.ambience || {};
    let rain = props.rain && props.rain.uniforms ? props.rain : null;
    if (!rain && (amb.rain || names.some((n) => /rain/.test(n) || def.env[n].rain > 0))) {
      const r = typeof amb.rain === 'object' ? amb.rain : {};
      let bx = r.box;
      if (!bx) { // walkable area (zones) + a margin, else the set's bounds, capped
        if (def.zones && def.zones.length) { bx = [1e9, 1e9, -1e9, -1e9]; for (const z of def.zones) { bx[0] = Math.min(bx[0], z.box[0]); bx[1] = Math.min(bx[1], z.box[1]); bx[2] = Math.max(bx[2], z.box[2]); bx[3] = Math.max(bx[3], z.box[3]); } bx = [bx[0] - 12, bx[1] - 12, bx[2] + 12, bx[3] + 12]; }
        else { box3.setFromObject(group); bx = [Math.max(box3.min.x, -30), Math.max(box3.min.z, -30), Math.min(box3.max.x, 30), Math.min(box3.max.z, 30)]; }
      }
      const area = (bx[2] - bx[0]) * (bx[3] - bx[1]);
      rain = makeRain({ box: bx, top: r.top ?? 12, bottom: r.bottom ?? 0, count: r.count ?? Math.round(clamp(area * 2.5, 1500, 6000)) });
      scene.add(rain);
    }
    const e = { id, def, scene, group, props, anchors, hemi, dir, spot, rain, puff: makePuff(),
      firstCam: Object.keys(def.cams || {})[0] || '',
      env: envNew(), from: envNew(), to: envNew(), envName: '', envT: 0, envDur: 0, envRes: null,
      ctx: { t: 0, player: null, running: false, env: '', props }, used: sceneN };
    scene.add(e.puff);
    envApply(e, e.env);
    if (names.length) envSet(e, names[0]);
    return e;
  }

  const TEXK = ['map', 'emissiveMap', 'alphaMap', 'lightMap', 'aoMap', 'bumpMap', 'normalMap', 'specularMap'];
  function texUp(o) {
    const m = o.material;
    if (!m) return;
    for (const x of Array.isArray(m) ? m : [m]) {
      for (const k of TEXK) if (x[k] && x[k].isTexture) renderer.initTexture(x[k]);
      if (x.uniforms) for (const u in x.uniforms) { const v = x.uniforms[u].value; if (v && v.isTexture) renderer.initTexture(v); }
    }
  }
  function upload(e) { renderer.compile(e.scene, camera); e.scene.traverse(texUp); }
  function accel(e) { e.group.updateMatrixWorld(true); e.group.traverse((o) => { if (o.isMesh && !o.isSkinnedMesh && !o.isInstancedMesh && o.geometry) rayGrid(o); }); }
  const PR = [];
  function prime(e) {   // draw all of it (hidden props too) into one pixel: every buffer uploads inside the build's faded frame, not when it first shows
    e.scene.traverse((o) => { PR.push(o, o.visible, o.frustumCulled); o.visible = true; o.frustumCulled = false; });
    renderer.setScissorTest(true); renderer.setScissor(0, 0, 1, 1);
    renderer.render(e.scene, camera);
    renderer.setScissorTest(false);
    for (let i = 0; i < PR.length; i += 3) { PR[i].visible = PR[i + 1]; PR[i].frustumCulled = PR[i + 2]; }
    PR.length = 0;
  }
  function disposeGeo(e) { e.scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); }); }
  function retire(e) {
    for (let i = A.length - 1; i >= 0; i--) if (A[i].set === e) despawnA(A[i]);
    settle(e, 'envRes');
    if (RM.jarvis === e) RM.jarvis = null;
    if (RR.jarvis === e) RR.jarvis = null;
    disposeGeo(e);                  // materials and textures stay cached (ART) so programs survive
    live.delete(e.id);
  }
  function trim() {
    for (const e of live.values()) { if (live.size <= W.liveMax) break; if (e !== cur && e !== splitE) retire(e); }
  }
  function ageOut() {               // a new scene: dispose sets last on screen more than two scenes ago
    for (const e of live.values()) if (e !== cur && e !== splitE && sceneN - e.used > 2) retire(e);
  }
  function ensure(id) {             // live entry for id (builds it, or finishes its staged prebuild), marked most recently used
    let e = live.get(id);
    if (e) { live.delete(id); live.set(id, e); e.used = Math.max(e.used, sceneN); return e; }
    const pb = pending.get(id);
    if (pb) {
      pending.delete(id); pbQ.splice(pbQ.indexOf(pb), 1);
      e = pb.e || build(id);
      if (pb.stage < 2) { upload(e); accel(e); }
      if (pb.stage < 3) prime(e);
    } else { e = build(id); upload(e); accel(e); prime(e); }
    e.used = sceneN; live.set(id, e); trim();
    if (pb) settle(pb, 'res');
    return e;
  }
  // world.prebuild(id): build a set ahead of time without a single long hitch: def.build() in one frame, the
  // compile/texture upload in the next, the 1-px prime in the next (one stage per rendered frame, from render()).
  // Call it during a cutscene's last shot or under a fade; world.load/show/spawn({set}) finish it at once if needed.
  function pbStep() {                  // one stage per frame
    const pb = pbQ[0];
    if (pb.stage === 0) { pb.e = build(pb.id); pb.stage = 1; }
    else if (pb.stage === 1) { upload(pb.e); accel(pb.e); pb.stage = 2; }
    else {
      prime(pb.e); pending.delete(pb.id); pbQ.shift();
      pb.e.used = sceneN + 1;            // it's for the next scene: not aged out before it is shown
      live.set(pb.id, pb.e); trim();
      testLog('world: prebuilt ' + pb.id);
      settle(pb, 'res');
    }
  }
  function showE(e) {
    cur = e; W.set = e.def; W.setId = e.id;
    G.name = ''; snap = true;          // (the flow sets AUDIO.ambience/room after world.load)
    W.torchAuto = true;                // a set that parks the spot as a lamp (torchAuto = false) never leaks it to the next
  }

  // ------------------------------------------------------------ actors
  const actors = new Map(), A = [], pool = {}, rigs = {};   // pool: look -> idle rigs; rigs: look -> every rig built for it
  // one-shots: Rue's defaults + TWO's (04-art ANIM_ONE: tether_throw, chip_ping, coat_throw, get_up_hurt, ...)
  const ONE = { nod: 0.9, shake: 1, shrug: 1.2, give: 1.4, lanyard_on: 2, knock: 1.2, glance: 1.3, stand: 1, ...(typeof ANIM_ONE !== 'undefined' ? ANIM_ONE : {}) };
  const LOCO = { walk: 1, run: 1, carry: 1, swagger: 1, turn: 1, limp: 1, walk_rail: 1, walk_rail_l: 1 };   // (walkAnims: a move ends in idle)
  let kind = '';                    // what resolveWhere last found: mark | actor | anchor | point

  function resolveWhere(w, out, e = cur) {   // -> rotY (NaN when the place has none)
    kind = 'point';
    if (w == null) { out.set(0, 0, 0); return NaN; }
    if (Array.isArray(w)) { if (w.length === 2) out.set(w[0], 0, w[1]); else out.set(w[0], w[1], w[2]); return w.length > 3 ? w[3] : NaN; }
    if (w.isVector3) { out.copy(w); return NaN; }
    const m = e && e.def.marks && e.def.marks[w];
    if (m) { kind = 'mark'; out.set(m[0], m[1] || 0, m[2]); return m[3] ?? NaN; }
    const a = actors.get(w);
    if (a) { kind = 'actor'; out.copy(a.pos); return NaN; }
    const an = e && e.anchors[w];
    if (an) { kind = 'anchor'; out.copy(an.at); return NaN; }
    testLog('world: unknown place ' + w);
    out.set(0, 0, 0); return NaN;
  }
  function pointOf(x, out, e = cur) {        // a thing to look at: actor eyes, anchor, mark (chest height), [x,y,z]
    if (x == null) return false;
    const a = typeof x === 'string' && actors.get(x);
    if (a) { a.eyePos(out); return true; }
    if (typeof x === 'string' && e && e.anchors[x]) { out.copy(e.anchors[x].at); return true; }
    resolveWhere(x, out, e);
    if (kind === 'mark') out.y += 1.3;
    return true;
  }
  const floorAt = (e, x, z, y) => (e && e.def.floor ? e.def.floor(x, z) : y);
  const setAnim = (a, name, restart) => { if (restart) { a.anim = a.poseName = name; a.poseT = 0; } else if (a.anim !== name) a.anim = name; };
  const isUpper = (n) => n !== 'idle' && ANIMS[n] && ANIMS[n].upper && !ONE[n];
  // play(name, o): anim-specific options (low, h0, h1, z, slump, reach, sit, ...) go straight into the anim's p.
  // PCTL are play()'s own (handled below, never copied); PKEEP (h, yaw) persist as in Rue (a seat height outlives the
  // anim that set it, so a one-shot over 'sit' returns to the same seat). A base anim's other options last until the
  // next base play(); a one-shot's options (h and yaw included) are put back when it returns (pBack).
  const PCTL = { loop: 1, dur: 1, speed: 1, still: 1, wait: 1, nowait: 1 }, PKEEP = { h: 1, yaw: 1 };
  const SEAT = { sit: 1, sit_bench: 1 };   // anims that seat the rig at once (an upper anim the same tick keeps the legs)
  function pSet(a, o, one) {
    const p = a.p;
    if (one) {                     // a one-shot: remember what it overwrites
      for (const k in o) { if (PCTL[k] || o[k] === undefined || (PKEEP[k] && o[k] == null)) continue; if (!(k in a.pS)) a.pS[k] = p[k]; p[k] = o[k]; }
      return;
    }
    for (let i = 0; i < a.pX.length; i++) if (p[a.pX[i]] === a.pXV[i]) p[a.pX[i]] = undefined;   // the last base anim's own (unless re-set since)
    a.pX.length = 0; a.pXV.length = 0;
    for (const k in o) {
      if (PCTL[k] || o[k] === undefined || (PKEEP[k] && o[k] == null)) continue;
      p[k] = o[k];
      if (!PKEEP[k]) { a.pX.push(k); a.pXV.push(o[k]); }
    }
  }
  const NOOPT = {}, NONE_R = [];
  function pBack(a) { for (const k in a.pS) { a.p[k] = a.pS[k]; delete a.pS[k]; } }   // a one-shot returned: its options go

  function newActor(id, look, rig) {
    let shadow = rig.root.getObjectByName('blob');
    if (!shadow) { shadow = blobShadow(); rig.root.add(shadow); }
    const hs = rig.d && rig.d.hs ? rig.d.hs : 1;
    const a = {
      id, look, rig, root: rig.root, pos: rig.root.position, rotY: 0, anim: 'idle', expr: 'neutral', carry: null, follow: null,
      mood: null, habit: null, glanceAt: 'chase', walkAnim: look === 'rue19' ? 'swagger' : 'walk', set: null, shadow,
      waiting: false, fw: 0,          // TWO: a follower told to wait holds its spot; fw = the next trail crumb it walks to
      p: { dur: 0, speed: 1, walk: false, still: false, yaw: 0.9, h: undefined, sit: undefined, base: undefined },
      pX: [], pXV: [], pS: {},         // play()'s anim options: the base anim's keys + values, a one-shot's saved values
      poseName: '', poseT: 0, ret: 'idle', back: false, playT: -1, playRes: null, glanceT: 2 + Math.random() * 4,
      mv: { on: false, to: V(), speed: 0, face: NaN, loco: 'walk', y0: 0, d0: 1, res: null, collide: false, stuck: 0 },
      fc: { on: false, a0: 0, a1: 0, t: 0, dur: 0.3, res: null },
      held: null, heldBig: false, prev: V(), prevRot: 0, keep: V(),
    };
    Object.defineProperty(a, 'visible', { get: () => a.root.visible, set: (v) => { a.root.visible = !!v; } });
    // eyePos / headPos read the posed rig. Placed this tick (a cut): pose it now, unblended, at its current anim, so a
    // lens computed right after place() (+ play()) sees where his eyes will be, not the last frame's pose.
    const fresh = () => { if (a.placed) a.rig.pose(a.poseName || 'idle', a.poseT, a.p, true); a.root.updateMatrixWorld(true); };
    a.eyePos = (v) => { fresh(); return a.rig.parts.head.localToWorld(v.set(0, 0.134 * hs, 0.118 * hs)); };
    a.headPos = (v) => { fresh(); return a.rig.parts.head.localToWorld(v.set(0, 0.13 * hs, 0.03)); };
    // an explicit expression wins over an anim's own .expr (still, hurt_stand, laugh ...) started in the same tick, either
    // order; a play() in a later tick hands the face back to the anim
    a.setExpr = (name) => { a.expr = name; a.rig.face.set(name); a.rig.exprPin = true; a.exprF = clock.frame; };
    a.place = (where) => {
      stopMove(a);
      const r = resolveWhere(where, a.pos, a.set);
      if (!isNaN(r)) a.rotY = r;
      a.prev.copy(a.pos); a.prevRot = a.rotY; a.root.rotation.y = a.rotY; a.placed = true;
      if (P.actor === a) trailReset(); else if (FOL.indexOf(a) >= 0) a.fw = crumbW;   // a placed follower picks up the trail from here
    };
    a.moveTo = (where, o = {}) => {
      const m = a.mv;
      settle(m, 'res'); settle(a.fc, 'res'); a.fc.on = false;
      const rot = resolveWhere(where, m.to, a.set);
      t1.set(m.to.x - a.pos.x, 0, m.to.z - a.pos.z);
      if (kind === 'actor' || kind === 'anchor') {   // walk up to it and face it
        const d = t1.length(), stop = kind === 'actor' ? 0.9 : 0.6;
        m.face = d > 0.01 ? Math.atan2(t1.x, t1.z) : NaN;
        const k = d > stop ? 1 - stop / d : 0;
        m.to.set(a.pos.x + t1.x * k, a.pos.y, a.pos.z + t1.z * k);
      } else m.face = o.face === false ? NaN : rot;
      const run = !!o.run;
      m.speed = o.speed || (a.heldBig ? CONFIG.carry : run ? CONFIG.run : CONFIG.walk);
      m.loco = a.heldBig ? 'carry' : run ? 'run' : a.anim === 'climb' ? 'climb' : a.walkAnim;   // a move while climbing keeps climbing
      m.y0 = a.pos.y; m.d0 = Math.max(0.001, Math.hypot(m.to.x - a.pos.x, m.to.z - a.pos.z));
      m.collide = !!o.collide; m.stuck = 0;   // TWO: { collide: true } = pushed out of colliders/actors (AI), ends where it stalls
      if (skipping() || m.d0 < 0.02) {
        if (m.d0 >= 0.02) {   // a skipped walk ends as a played one would: up off any seat, a base anim back to idle
          if (a.rig.seated || a.p.sit) { a.rig.seated = false; a.rig.floorSit = false; a.p.sit = false; }
          if (!isUpper(a.anim) && !ONE[a.anim] && a.anim !== 'idle') setAnim(a, 'idle', true);
          a.p.walk = false;
        }
        a.pos.set(m.to.x, floorAt(a.set, m.to.x, m.to.z, m.to.y), m.to.z);
        if (!isNaN(m.face)) a.rotY = m.face;
        a.prev.copy(a.pos); a.prevRot = a.rotY;
        return Promise.resolve();
      }
      m.on = true;
      return new Promise((r) => { m.res = r; });
    };
    a.face = (target, dur = 0.3) => {
      let rot = a.rotY;
      if (typeof target === 'number') rot = target;
      else {
        resolveWhere(target, t1, a.set);
        if (Math.hypot(t1.x - a.pos.x, t1.z - a.pos.z) > 0.01) rot = Math.atan2(t1.x - a.pos.x, t1.z - a.pos.z);
      }
      return startFace(a, rot, dur);
    };
    // play(anim, o): o.dur / loop / speed / still / h / yaw as in Rue, and every other option goes to the anim's p
    // (play('polish', { low: true }), play('lift_strain', { h0, h1, dur }), play('glass_reach', { reach })).
    // Seated: 'sit' / 'sit_bench' / 'sit_floor_wall' seat the rig at once, so an upper-body anim played next (even the
    // same tick) keeps the seated legs (play('sit', { h: 0.48 }); play('piano_play')); o.sit: true seats an upper anim
    // directly, o.sit: false stands the rig up for it. Walking (moveTo) always stands a seated rig up.
    a.play = (anim, o = {}) => {
      settle(a, 'playRes');
      if (a.exprF !== clock.frame) a.rig.exprPin = false;
      const one = ONE[anim], back = !!one || o.loop === false, dur = o.dur ?? one ?? 0;
      if (a.back) pBack(a);            // a one-shot cut short: its options go before anything else is decided
      if (back) a.ret = anim === 'stand' ? 'idle' : ONE[a.anim] || LOCO[a.anim] ? (a.back ? a.ret : 'idle') : a.anim;
      a.p.dur = o.dur || 0; a.p.speed = o.speed ?? 1; a.p.still = !!o.still;
      const r = a.rig;
      if (SEAT[anim]) { r.seated = true; r.floorSit = false; }
      else if (anim === 'sit_floor_wall') { r.seated = true; r.floorSit = true; }
      else if (anim === 'idle' || anim === 'stand') { r.seated = false; r.floorSit = false; a.p.sit = undefined; }   // up on his feet (even while skipping)
      if (o.sit === true) r.seated = true;
      else if (o.sit === false) { r.seated = false; r.floorSit = false; }
      a.back = back;
      // an upper-body one-shot (glance, nod, ...) over a base pose the seated pre-pass can't rebuild (lying, kneeling, a
      // content seat or crouch): the rig poses that base under it, so he stays where he is (rig: p.base)
      const rb = back && ANIMS[anim] && ANIMS[anim].upper ? a.ret : null;
      a.p.base = rb && rb !== 'idle' && !LOCO[rb] && !SEAT[rb] && ANIMS[rb] && !ANIMS[rb].upper ? rb : undefined;
      if (skipping()) {
        if (!back) pSet(a, o, false); else { if (o.h != null) a.p.h = o.h; if (o.yaw != null) a.p.yaw = o.yaw; }   // (Rue: h / yaw always land)
        a.back = false; a.playT = -1; a.p.base = undefined; setAnim(a, back ? a.ret : anim, true); return Promise.resolve();
      }
      pSet(a, o, back);
      setAnim(a, anim, true);
      a.playT = back ? (dur || 1.2) : dur > 0 ? dur : -1;
      if (a.playT > 0) return new Promise((r) => { a.playRes = r; });
      return Promise.resolve();
    };
    a.hold = (obj, hand = 'R') => {
      if (a.held) {   // put the current one back where it came from
        const o = a.held, h = o.userData.home;
        if (h && h.parent) { h.parent.add(o); o.position.copy(h.pos); o.quaternion.copy(h.quat); }
        else if (o.parent) o.parent.remove(o);   // it had no home (built content-side, never added): just let go of it
        a.held = null; a.carry = null;
        if (a.heldBig && P.actor === a) P.speedMul = 1;
        a.heldBig = false;
      }
      const o = typeof obj === 'string' ? W.prop(obj) : obj;
      if (!o) return;
      if (!o.userData.home) o.userData.home = { parent: o.parent, pos: o.position.clone(), quat: o.quaternion.clone() };
      if (o.parent) o.parent.remove(o);
      o.position.set(0, 0, 0); o.quaternion.identity(); o.updateMatrixWorld(true);
      box3.setFromObject(o); box3.getCenter(t1); box3.getSize(t2);
      a.heldBig = Math.max(t2.x, t2.y, t2.z) > 0.45;
      if (a.heldBig) { a.root.add(o); o.position.set(-t1.x, 1.0 - t1.y, 0.45 - t1.z); if (P.actor === a) P.speedMul = 0.6; }
      else { (a.rig.attach['grip' + hand] || a.rig.parts['hand' + hand]).add(o); o.position.set(-t1.x, -t1.y, -t1.z); }
      a.held = o; a.carry = o.name || true;
    };
    return a;
  }
  function stopMove(a) { a.mv.on = false; settle(a.mv, 'res'); a.fc.on = false; settle(a.fc, 'res'); if (LOCO[a.anim]) setAnim(a, 'idle'); a.p.walk = false; }
  function startFace(a, rot, dur) {
    const f = a.fc;
    settle(f, 'res');
    const d = angTo(a.rotY, rot);
    if (Math.abs(d) < 0.01 || skipping() || !(dur > 0)) { a.rotY = a.rotY + d; f.on = false; return Promise.resolve(); }
    f.a0 = a.rotY; f.a1 = a.rotY + d; f.t = 0; f.dur = dur; f.on = true;
    return new Promise((r) => { f.res = r; });
  }
  function glance(a) {
    a.glanceT = 3 + Math.random() * 4;
    const c = actors.get(a.glanceAt);
    if (!c || c === a || c.set !== a.set) return;
    a.p.yaw = clamp(angTo(a.rotY, Math.atan2(c.pos.x - a.pos.x, c.pos.z - a.pos.z)), -1.3, 1.3);
    a.p.dur = 0; a.ret = 'idle'; a.back = true; a.playT = ONE.glance;
    setAnim(a, 'glance', true);
  }
  function poseOf(a) {
    if (a.anim === 'idle') {
      if (a.fc.on && !a.rig.seated && Math.abs(a.fc.a1 - a.fc.a0) > 0.4) return 'turn';
      if (a.mood === 'anxious') return 'lanyard';
    }
    return a.anim;
  }
  function actorTick(a, dt) {
    const m = a.mv, e = a.set;
    if (m.on) {
      const dx = m.to.x - a.pos.x, dz = m.to.z - a.pos.z, d = Math.hypot(dx, dz), step = m.speed * dt;
      if (isUpper(a.anim)) {
        a.p.walk = true; a.p.speed = m.speed / CONFIG.walk;
        if (a.rig.seated || a.p.sit) { a.rig.seated = false; a.rig.floorSit = false; a.p.sit = false; }   // walking: up off the seat
        a.p.base = undefined;
      }
      else { setAnim(a, m.loco); a.p.speed = m.speed / (m.loco === 'run' ? CONFIG.run : m.loco === 'carry' ? CONFIG.carry : CONFIG.walk); }
      if (d <= step) {
        a.pos.x = m.to.x; a.pos.z = m.to.z; a.pos.y = floorAt(e, a.pos.x, a.pos.z, m.to.y);
        m.on = false; a.p.walk = false;
        if (LOCO[a.anim]) setAnim(a, 'idle');
        const res = m.res; m.res = null;
        if (!isNaN(m.face)) { startFace(a, m.face, 0.3); if (a.fc.on) a.fc.res = res; else if (res) res(); } else if (res) res();   // already facing: resolve now
      } else if (m.collide && e) {     // AI move: slide along walls; a move that stops making progress ends where it is
        const x0 = a.pos.x, z0 = a.pos.z;
        collide(a, x0 + dx / d * step, z0 + dz / d * step, e, true);
        a.rotY += angTo(a.rotY, Math.atan2(dx, dz)) * Math.min(1, 10 * dt);
        if (Math.hypot(a.pos.x - x0, a.pos.z - z0) < step * 0.25) m.stuck += dt; else m.stuck = 0;
        if (m.stuck > 0.6) {
          m.on = false; a.p.walk = false;
          if (LOCO[a.anim]) setAnim(a, 'idle');
          settle(m, 'res');
        }
      } else {
        a.pos.x += dx / d * step; a.pos.z += dz / d * step;
        a.pos.y = floorAt(e, a.pos.x, a.pos.z, m.y0 + (m.to.y - m.y0) * (1 - (d - step) / m.d0));
        a.rotY += angTo(a.rotY, Math.atan2(dx, dz)) * Math.min(1, 10 * dt);
      }
    }
    const f = a.fc;
    if (f.on) {
      f.t += dt;
      const k = smooth(f.t / f.dur);
      a.rotY = f.a0 + (f.a1 - f.a0) * k;
      if (f.t >= f.dur) { f.on = false; settle(f, 'res'); }
    }
    if (a.playT > 0 && (a.playT -= dt) <= 0) {
      if (a.back) { a.back = false; pBack(a); a.p.base = undefined; setAnim(a, a.ret || 'idle'); }
      a.p.dur = 0; a.playT = -1; settle(a, 'playRes');
    }
    if (a.habit === 'glance' && a.anim === 'idle' && !m.on && !a.playRes && (a.glanceT -= dt) <= 0) glance(a);
    const n = poseOf(a);
    if (n !== a.poseName) { a.poseName = n; a.poseT = 0; } else a.poseT += dt;
    a.rig.update(dt);
  }
  function despawnA(a) {
    if (a.held) a.hold(null);
    stopMove(a); settle(a, 'playRes');
    a.rig.talk(false);
    if (a.root.parent) a.root.parent.remove(a.root);
    actors.delete(a.id); A.splice(A.indexOf(a), 1);
    if (P.actor === a) P.actor = null;
    const fi = FOL.indexOf(a);
    if (fi >= 0) { FOL.splice(fi, 1); a.follow = null; }
    a.set = null; a.root.visible = true; a.rig.seated = false; a.rig.floorSit = false; a.waiting = false; a.placed = false;
    (pool[a.look] ||= []).push(a.rig);
  }
  function spawn(id, where, o = {}) {
    const e = o.set ? ensure(o.set) : cur;
    if (!e) throw new Error('TWO: world.spawn before world.load');
    const look = o.look || id;
    let a = actors.get(id);
    if (a && a.look !== look) { despawnA(a); a = null; }
    if (!a) {
      let rig = pool[look] && pool[look].pop();
      if (!rig) { rig = buildCharacter(look); (rigs[look] ||= []).push(rig); }
      a = newActor(id, look, rig);
      actors.set(id, a); A.push(a);
      a.setExpr((LOOKS[look] && LOOKS[look].expr) || 'neutral'); a.rig.exprPin = false;
    }
    if (a.set !== e) { e.scene.add(a.root); a.set = e; }
    a.visible = true;
    pBack(a); pSet(a, NOOPT, false);   // a (re)spawn starts from Rue's options: no crouch, no reach left over
    setAnim(a, 'idle', true); a.back = false; a.playT = -1; settle(a, 'playRes');
    a.place(where);
    return a;
  }

  // ------------------------------------------------------------ player + followers
  // TWO: a party. player.follower(id | [ids] | null) makes the non-active playables trail the leader in a loose line
  // on one breadcrumb trail (follower k stops 1.3 + 0.9·k m behind him, k counting only those not waiting). They step
  // aside when he walks into them, keep a little space from each other, never block the player (he walks through
  // them, so doorways stay open) and never cut the camera (zones only ever follow player.actor).
  // player.wait(id, true) parks one where it stands (a two-person switch, "Hold this": it stays put, isn't teleported
  // and isn't pushed aside); player.wait(id, false) and it picks the trail up again from where the leader went next.
  const CRN = 128, CR = new Float32Array(CRN * 3);
  let crumbW = 0;                   // crumbs written since the last reset (absolute: ring index = i % CRN)
  const FOL = [];                   // the follower actors, in order
  const crumbAt = (i) => (i % CRN) * 3;
  function trailReset() { crumbW = 0; for (let i = 0; i < FOL.length; i++) FOL[i].fw = 0; }
  const P = {
    actor: null, enabled: false, speedMul: 1, running: false, frozenT: 0, ctrlYaw: 0,
    trail: false,                   // TWO: followers also trail a scripted leader (moveTo) while the player is disabled, outside cutscenes (flow sets it for a roam's autoplay)
    followers: FOL,                 // read-only: the follower actors, in order
    get fol() { return FOL[0] || null; },   // Rue's single follower (the first)
    control(id) {
      const a = id ? actors.get(id) : null;
      if (P.actor && P.actor !== a && LOCO[P.actor.anim]) setAnim(P.actor, 'idle');
      P.actor = a || null;
      if (a) {
        const i = FOL.indexOf(a);
        if (i >= 0) FOL.splice(i, 1);
        a.follow = null; a.waiting = false; P.speedMul = a.heldBig ? 0.6 : 1;
      }
      for (let i = 0; i < FOL.length; i++) FOL[i].follow = a ? a.id : null;
      trailReset();
    },
    follower(ids) {                 // id | [ids] | null (an id that isn't spawned, or is the player, is ignored)
      for (let i = 0; i < FOL.length; i++) FOL[i].follow = null;
      FOL.length = 0;
      const add = (id) => {
        const f = typeof id === 'string' ? actors.get(id) : null;
        if (f && f !== P.actor && FOL.indexOf(f) < 0) { FOL.push(f); f.follow = P.actor ? P.actor.id : null; }
      };
      if (Array.isArray(ids)) for (let i = 0; i < ids.length; i++) add(ids[i]); else add(ids);
      trailReset();
    },
    wait(id, on = true) {           // hold position (on) / follow again (off). Persists until cleared, control() or despawn
      const a = typeof id === 'string' ? actors.get(id) : id;
      if (!a || a === P.actor) return;
      a.waiting = !!on;
      if (on) { if (LOCO[a.anim] && !a.mv.on) setAnim(a, 'idle'); a.fw = crumbW; }   // later: the trail laid after this
    },
    waiting: (id) => { const a = actors.get(id); return !!(a && a.waiting); },
    frozen(sec) { P.frozenT = Math.max(P.frozenT, sec || 0); },
  };
  // push a circle (r = CONFIG.radius) at x, z out of the set's colliders (and, withActors, of the other visible
  // actors; the player is never blocked by his own followers); writes a.pos with the floor height
  function collide(a, x, z, e, withActors) {
    const r = CONFIG.radius, cl = e.def.colliders, me = a === P.actor;
    for (let it = 0; it < 2; it++) {
      if (cl) for (let i = 0; i < cl.length; i++) {
        const b = cl[i], cx = clamp(x, b[0], b[2]), cz = clamp(z, b[1], b[3]), dx = x - cx, dz = z - cz, d2 = dx * dx + dz * dz;
        if (d2 >= r * r) continue;
        if (d2 > 1e-8) { const d = Math.sqrt(d2), k = (r - d) / d; x += dx * k; z += dz * k; }
        else {   // centre inside the box: out the nearest side
          const l = x - b[0], rr = b[2] - x, t = z - b[1], bo = b[3] - z, m = Math.min(l, rr, t, bo);
          if (m === l) x = b[0] - r; else if (m === rr) x = b[2] + r; else if (m === t) z = b[1] - r; else z = b[3] + r;
        }
      }
      if (withActors) for (let i = 0; i < A.length; i++) {
        const o = A[i];
        if (o === a || o.set !== e || !o.root.visible || (me && FOL.indexOf(o) >= 0)) continue;
        const dx = x - o.pos.x, dz = z - o.pos.z, d2 = dx * dx + dz * dz, rr = r * 2;
        if (d2 < rr * rr && d2 > 1e-8) { const d = Math.sqrt(d2), k = (rr - d) / d; x += dx * k; z += dz * k; }
      }
    }
    a.pos.x = x; a.pos.z = z; a.pos.y = floorAt(e, x, z, a.pos.y);
  }
  // the direction modern controls map the stick through: the camera you see (a shot), else where the gameplay
  // camera is (or is easing to), so a release or a corridor ease never bends the lock
  const viewYaw = () => (RM.on ? Math.atan2(cs.look.x - cs.pos.x, cs.look.z - cs.pos.z) : Math.atan2(gs.look.x - gs.pos.x, gs.look.z - gs.pos.z));
  function playerTick(dt) {
    const a = P.actor;
    P.running = false;
    if (!a || !P.enabled || a.set !== cur || a.mv.on) {
      if (a && LOCO[a.anim] && !a.mv.on) setAnim(a, 'idle');
      P.ctrlYaw = viewYaw();
      return;
    }
    const mx = input.move.x, my = input.move.y, tank = options.controls === 'tank';
    if (P.frozenT > 0) { P.frozenT -= dt; if (LOCO[a.anim]) setAnim(a, 'idle'); return; }
    let dx = 0, dz = 0, mag = 0, turning = false;
    if (tank) {
      if (Math.abs(mx) > 0.2) { a.rotY -= mx * CONFIG.turn * dt; turning = true; }
      if (Math.abs(my) > 0.2) { const s = my > 0 ? 1 : -0.6; dx = Math.sin(a.rotY) * s; dz = Math.cos(a.rotY) * s; mag = Math.abs(my); }
    } else {
      // modern: camera-relative, and the direction stays locked across a camera cut until the stick/keys are released
      mag = Math.min(1, Math.hypot(mx, my));
      if (mag < 0.15) { P.ctrlYaw = viewYaw(); mag = 0; }   // re-read the camera only while released
      else {
        const fx = Math.sin(P.ctrlYaw), fz = Math.cos(P.ctrlYaw), n = Math.hypot(mx, my);
        dx = (fx * my - fz * mx) / n; dz = (fz * my + fx * mx) / n;
        a.rotY += angTo(a.rotY, Math.atan2(dx, dz)) * Math.min(1, 14 * dt);
      }
    }
    if (mag > 0) {
      const run = input.run && !a.heldBig && !(tank && my < 0);
      const sp = (run ? CONFIG.run : CONFIG.walk) * P.speedMul * mag;   // walk 1.7 m/s, run 3.4 m/s (analog)
      collide(a, a.pos.x + dx * sp * dt, a.pos.z + dz * sp * dt, cur, true);
      const loco = a.heldBig ? 'carry' : run ? 'run' : a.walkAnim;
      setAnim(a, loco); a.p.walk = false;
      a.p.speed = sp / (run ? CONFIG.run : a.heldBig ? CONFIG.carry : CONFIG.walk);
      P.running = run;
    } else if (turning) { setAnim(a, 'turn'); }
    else if (LOCO[a.anim]) setAnim(a, 'idle');
  }
  function offCamera(a) {
    t5.set(a.pos.x, a.pos.y + 1, a.pos.z).project(camera);
    return t5.z > 1 || Math.abs(t5.x) > 1.05 || Math.abs(t5.y) > 1.05;
  }
  function followerTick(dt) {
    const L = P.actor;
    if (!L || !FOL.length) return;
    if (!P.enabled && !(P.trail && L.mv.on && !(typeof flow !== 'undefined' && (flow.cutscene || flow.busy)))) return;
    const e = L.set;
    // breadcrumbs: every 0.35 m the leader moves
    const last = crumbAt(crumbW + CRN - 1);
    if (!crumbW || Math.hypot(L.pos.x - CR[last], L.pos.z - CR[last + 2]) > 0.35) {
      const j = crumbAt(crumbW); CR[j] = L.pos.x; CR[j + 1] = L.pos.y; CR[j + 2] = L.pos.z; crumbW++;
    }
    let rank = 0;
    for (let k = 0; k < FOL.length; k++) {
      const f = FOL[k];
      if (f === L || f.set !== e || f.mv.on) continue;
      if (f.waiting) { if (LOCO[f.anim]) setAnim(f, 'idle'); continue; }
      folStep(f, L, e, rank++, dt);
    }
    for (let k = 0; k < FOL.length; k++) folSpace(FOL[k], k, L, e, dt);
  }
  function folStep(f, L, e, rank, dt) {
    const dL = Math.hypot(f.pos.x - L.pos.x, f.pos.z - L.pos.z), gap = 1.3 + 0.9 * rank;
    if (f.fw > crumbW) f.fw = crumbW;                     // the trail was reset since
    if (f.fw < crumbW - CRN) f.fw = crumbW - CRN;          // overwritten: from the oldest crumb left
    if (dL > 8 + gap && offCamera(f)) {   // fell behind off-screen: reappear on the trail about gap + 0.2 m behind him
      const lo = Math.max(0, crumbW - CRN);
      let i = crumbW - 1, acc = 0;
      if (i >= lo) {
        while (i > lo && acc < gap + 0.2) { const p = crumbAt(i), q = crumbAt(i - 1); acc += Math.hypot(CR[p] - CR[q], CR[p + 2] - CR[q + 2]); i--; }
        const j = crumbAt(i); t4.set(CR[j], CR[j + 1], CR[j + 2]);
      }
      if (crumbW - lo < 2) t4.set(L.pos.x - Math.sin(L.rotY) * (gap + 0.1), L.pos.y, L.pos.z - Math.cos(L.rotY) * (gap + 0.1));
      f.pos.copy(t4); f.prev.copy(t4); f.rotY = f.prevRot = L.rotY; f.fw = Math.max(i, 0) + 1;
      return;
    }
    if (dL < gap) { if (LOCO[f.anim]) setAnim(f, 'idle'); return; }
    // a shortcut: when the trail doubles back past it (he turned round), join it at the newest crumb within reach
    for (let i = crumbW - 1; i > f.fw + 1; i--) {
      const j = crumbAt(i), dx = CR[j] - f.pos.x, dz = CR[j + 2] - f.pos.z;
      if (dx * dx + dz * dz < 0.36) { if (lineClearIn(e, f.pos.x, f.pos.z, CR[j], CR[j + 2])) f.fw = i; break; }
    }
    while (f.fw < crumbW - 1) {          // skip the crumbs it's already standing on
      const j = crumbAt(f.fw);
      if (Math.hypot(f.pos.x - CR[j], f.pos.z - CR[j + 2]) >= 0.3) break;
      f.fw++;
    }
    const has = f.fw < crumbW, j = crumbAt(f.fw);
    const tx = has ? CR[j] : L.pos.x, tz = has ? CR[j + 2] : L.pos.z;
    const dx = tx - f.pos.x, dz = tz - f.pos.z, d = Math.hypot(dx, dz);
    if (d < 1e-4) return;
    const run = dL > 3.5 + 0.9 * rank || P.running, sp = run ? CONFIG.run : CONFIG.walk, step = Math.min(d, sp * dt);
    f.pos.x += dx / d * step; f.pos.z += dz / d * step; f.pos.y = floorAt(e, f.pos.x, f.pos.z, f.pos.y);
    f.rotY += angTo(f.rotY, Math.atan2(dx, dz)) * Math.min(1, 10 * dt);
    setAnim(f, run ? 'run' : f.walkAnim); f.p.speed = 1; f.p.walk = false;
  }
  // personal space: a follower sidesteps out of the leader's path (sideways, never ahead of him) and keeps 0.6 m from
  // the other followers; colliders still hold (it never steps into a wall). A waiting one stands its ground.
  function folSpace(f, k, L, e, dt) {
    if (f === L || f.set !== e || f.mv.on || f.waiting) return;
    let px = 0, pz = 0;
    const dx = f.pos.x - L.pos.x, dz = f.pos.z - L.pos.z, d = Math.hypot(dx, dz);
    if (d < 0.75) {
      const w = (0.75 - d) / 0.75, hx = Math.sin(L.rotY), hz = Math.cos(L.rotY), t = dx * hx + dz * hz;
      let lx = dx - t * hx, lz = dz - t * hz, ll = Math.hypot(lx, lz);
      if (ll < 1e-3) { lx = hz; lz = -hx; ll = 1; }      // dead ahead: to his right
      px += lx / ll * w; pz += lz / ll * w;
      if (t < 0 && d > 1e-3) { px += dx / d * w * 0.5; pz += dz / d * w * 0.5; }   // behind him: give a little ground too
    }
    for (let m = 0; m < FOL.length; m++) {
      const o = FOL[m];
      if (m === k || o.set !== e) continue;
      const ox = f.pos.x - o.pos.x, oz = f.pos.z - o.pos.z, od = Math.hypot(ox, oz);
      if (od < 0.6) { const w = (0.6 - od) / 0.6 * (o.waiting ? 1 : 0.5); if (od > 1e-3) { px += ox / od * w; pz += oz / od * w; } else { px += m < k ? 0.3 : -0.3; } }
    }
    const pl = Math.hypot(px, pz);
    if (pl < 1e-3) return;
    const sp = Math.min(1, pl) * 1.6, step = sp * dt;
    collide(f, f.pos.x + px / pl * step, f.pos.z + pz / pl * step, e, false);
    if (sp > 0.35 && (f.anim === 'idle' || f.anim === 'turn')) {   // a real step aside (folStep sets idle again next tick)
      setAnim(f, f.walkAnim); f.p.speed = sp / CONFIG.walk; f.p.walk = false;
      f.rotY += angTo(f.rotY, Math.atan2(px, pz)) * Math.min(1, 6 * dt);
    }
  }
  // Torchlight: while world.torch is on it rides in the player's right hand, aimed ahead at the ground
  function torchTick(e) {
    const s = e.spot, a = P.actor;
    if (s.intensity <= 0 || RM.jarvis === e || RR.jarvis === e || !W.torchAuto || !a || a.set !== e) return;
    const fx = Math.sin(a.rotY), fz = Math.cos(a.rotY);
    s.position.set(a.pos.x + fx * 0.3 - fz * 0.18, a.pos.y + 1.25, a.pos.z + fz * 0.3 + fx * 0.18);
    s.target.position.set(a.pos.x + fx * 7, a.pos.y + 0.1, a.pos.z + fz * 7);
  }

  // ------------------------------------------------------------ framing: frame(subjects, size, opts)
  const F = { pos: V(), look: V(), fov: 40, up: V().set(0, 0, -1) };
  const SP = [], SF = [], SA = [];
  for (let i = 0; i < 8; i++) { SP.push(V()); SF.push(V()); SA.push(null); }
  let nS = 0, nAct = 0, feetY = 0, eyeY = 0, logMiss = false;
  const DY = { ECU: -0.03, CLOSE: -0.08, MID: -0.35, TWO: -0.3, THREE: -0.35, TOP: 0 };
  const C25 = Math.cos(25 * DEG), S25 = Math.sin(25 * DEG), C20 = Math.cos(20 * DEG), S20 = Math.sin(20 * DEG);
  const FO = { angle: null, side: null, dist: null, height: 0, fov: null, offset: 0, facing: false, shoulder: null };  // frame options, filled per call
  // the camera a framing reasons from (where "the current camera" is for side angles and fallbacks) and the share of
  // the screen width its half has (0 = auto); the right half of a split sets both while it frames
  let FC = null, FFR = 0;
  const fcam = () => FC || cs;

  function addSubj(x, e) {
    if (nS >= 8 || x == null) return;
    SA[nS] = null;
    if (typeof x !== 'string') { if (x.isVector3) SP[nS].copy(x); else SP[nS].set(x[0], x[1], x[2]); SF[nS++].set(0, 0, 0); return; }
    const a = actors.get(x);
    if (a) { a.eyePos(SP[nS]); SF[nS].set(Math.sin(a.rotY), 0, Math.cos(a.rotY)); SA[nS] = a; feetY += a.pos.y; eyeY += SP[nS].y; nS++; nAct++; return; }
    const an = e && e.anchors[x];
    if (an) { SP[nS].copy(an.at); if (an.from) SF[nS].set(an.from.x - an.at.x, 0, an.from.z - an.at.z).normalize(); else SF[nS].set(0, 0, 0); nS++; return; }
    const m = e && e.def.marks && e.def.marks[x];
    if (m) { SP[nS].set(m[0], (m[1] || 0) + 1.55, m[2]); SF[nS].set(Math.sin(m[3] || 0), 0, Math.cos(m[3] || 0)); nS++; return; }
    if (logMiss) testLog('cam: nothing called ' + x);
  }
  function gather(on, e) {
    nS = 0; nAct = 0; feetY = 0; eyeY = 0;
    if (on == null) { for (let i = 0; i < A.length; i++) if (A[i].set === e && A[i].root.visible) addSubj(A[i].id, e); }
    else if (Array.isArray(on) && typeof on[0] !== 'number') { for (let i = 0; i < on.length; i++) addSubj(on[i], e); }
    else addSubj(on, e);
    if (nAct) { feetY /= nAct; eyeY /= nAct; }
    return nS;
  }
  function aimInto(out, on, size, e) {    // the point a framing looks at
    if (!gather(on, e)) return 0;
    out.set(0, 0, 0);
    for (let i = 0; i < nS; i++) out.add(SP[i]);
    out.divideScalar(nS);
    if (nAct) { if (size === 'WIDE') out.y = feetY + 1.0; else out.y += DY[size] ?? -0.3; }
    return nS;
  }
  const inZones = (x, z, zs, pad) => { for (let i = 0; i < zs.length; i++) { const b = zs[i].box; if (x >= b[0] - pad && x <= b[2] + pad && z >= b[1] - pad && z <= b[3] + pad) return true; } return false; };
  function fitZones(Pp, L, e) {           // keep a computed camera inside the playable space: come closer, open the lens
    const zs = e && e.def.zones;
    if (!zs || !zs.length || !inZones(L.x, L.z, zs, 0.6) || inZones(Pp.x, Pp.z, zs, 0.6)) return 1;
    for (let s = 0.9; s > 0.2; s -= 0.1) {
      const x = L.x + (Pp.x - L.x) * s, z = L.z + (Pp.z - L.z) * s;
      if (inZones(x, z, zs, 0.6)) { Pp.set(x, L.y + (Pp.y - L.y) * s, z); return s; }
    }
    return 1;
  }
  // where frameInto puts the lens for direction d, distance D (not TOP)
  function lensAt(P, L, d, D, o, size) {
    if (o.angle === 'high') P.set(L.x + d.x * D * C25, L.y + D * S25, L.z + d.z * D * C25);
    else if (o.angle === 'low') { P.set(L.x + d.x * D * C20, L.y - D * S20, L.z + d.z * D * C20); P.y = Math.max(P.y, (nAct ? feetY : L.y - 1.2) + 0.15); }
    else P.set(L.x + d.x * D, nAct ? (size === 'WIDE' ? feetY + 1.55 : eyeY) : L.y, L.z + d.z * D);
    if (o.height) P.y += o.height;
    return P;
  }
  // first set surface FACING the ray's origin between P and L (raycasts only report front faces of one-sided
  // materials: what would actually render; hidden props, see-through glass, skinned meshes and anything flagged
  // userData.noOcclude (tinsel, leaves) don't count). 0 = clear. Shot cuts only, never per frame.
  const RC = new THREE.Raycaster(), HITS = [], tl = V(), tr = V();
  let hitD = 0;
  // Big static meshes (a set's merged geometry: tens of thousands of triangles, which three.js would test one by
  // one) get a coarse XZ grid of their triangles when the set is built (rayGrid), so a framing ray walks only the
  // cells under it (2D DDA). Built under black with the set, never during a shot.
  const GR = { ray: new THREE.Ray(), o: V(), d: V(), a: V(), b: V(), c: V(), p: V(), q: 0 };
  let rayMin = 0;
  function rayGrid(mesh) {
    const g = mesh.geometry, pos = g.attributes.position, idx = g.index, n = (idx ? idx.count : pos.count) / 3 | 0;
    if (n < 1500 || g.userData.rayGrid) return;
    g.computeBoundingBox();
    const bb = g.boundingBox, sx = bb.max.x - bb.min.x, sz = bb.max.z - bb.min.z;
    const cs = Math.max(1, Math.sqrt(Math.max(1, sx * sz) / 2048)), nx = Math.max(1, Math.ceil(sx / cs)), nz = Math.max(1, Math.ceil(sz / cs));
    const vi = (t, k) => (idx ? idx.getX(t * 3 + k) : t * 3 + k);
    const range = (t, out) => {   // the triangle's cell range [cx0, cz0, cx1, cz1]
      let x0 = Infinity, z0 = Infinity, x1 = -Infinity, z1 = -Infinity;
      for (let k = 0; k < 3; k++) { const v = vi(t, k), x = pos.getX(v), z = pos.getZ(v); if (x < x0) x0 = x; if (x > x1) x1 = x; if (z < z0) z0 = z; if (z > z1) z1 = z; }
      out[0] = clamp(Math.floor((x0 - bb.min.x) / cs), 0, nx - 1); out[1] = clamp(Math.floor((z0 - bb.min.z) / cs), 0, nz - 1);
      out[2] = clamp(Math.floor((x1 - bb.min.x) / cs), 0, nx - 1); out[3] = clamp(Math.floor((z1 - bb.min.z) / cs), 0, nz - 1);
    };
    const cnt = new Int32Array(nx * nz + 1), r = [0, 0, 0, 0];
    for (let t = 0; t < n; t++) { range(t, r); for (let z = r[1]; z <= r[3]; z++) for (let x = r[0]; x <= r[2]; x++) cnt[z * nx + x + 1]++; }
    for (let i = 1; i <= nx * nz; i++) cnt[i] += cnt[i - 1];
    const tri = new Int32Array(cnt[nx * nz]), fill = cnt.slice(0, nx * nz);
    for (let t = 0; t < n; t++) { range(t, r); for (let z = r[1]; z <= r[3]; z++) for (let x = r[0]; x <= r[2]; x++) tri[fill[z * nx + x]++] = t; }
    g.userData.rayGrid = { x0: bb.min.x, z0: bb.min.z, cs, nx, nz, start: cnt, tri, stamp: new Int32Array(n), n };
  }
  function gridCast(mesh) {          // RC's ray against a gridded mesh -> nearest hit distance in [RC.near, RC.far] or 0
    const G = mesh.geometry.userData.rayGrid, pos = mesh.geometry.attributes.position, idx = mesh.geometry.index;
    const m = mesh.material, side = m.side, cull = side !== THREE.DoubleSide;
    // the world ray in the mesh's space (affine: the parameter t stays the world distance)
    const inv = mesh.userData.rayInv || (mesh.userData.rayInv = new THREE.Matrix4());
    inv.copy(mesh.matrixWorld).invert();
    const o = GR.o.copy(RC.ray.origin).applyMatrix4(inv), d = GR.d.copy(RC.ray.origin).add(RC.ray.direction).applyMatrix4(inv).sub(o);
    GR.ray.origin.copy(o); GR.ray.direction.copy(d);
    const dd = d.lengthSq();
    let t0 = RC.near, t1 = RC.far;
    const xa = G.x0, xb = G.x0 + G.nx * G.cs, za = G.z0, zb = G.z0 + G.nz * G.cs;   // clip to the grid in XZ
    if (Math.abs(d.x) < 1e-12) { if (o.x < xa || o.x > xb) return 0; } else { let ta = (xa - o.x) / d.x, tb = (xb - o.x) / d.x; if (ta > tb) { const t = ta; ta = tb; tb = t; } t0 = Math.max(t0, ta); t1 = Math.min(t1, tb); }
    if (Math.abs(d.z) < 1e-12) { if (o.z < za || o.z > zb) return 0; } else { let ta = (za - o.z) / d.z, tb = (zb - o.z) / d.z; if (ta > tb) { const t = ta; ta = tb; tb = t; } t0 = Math.max(t0, ta); t1 = Math.min(t1, tb); }
    if (t0 > t1) return 0;
    const cs = G.cs, sx = d.x > 0 ? 1 : d.x < 0 ? -1 : 0, sz = d.z > 0 ? 1 : d.z < 0 ? -1 : 0;
    let cx = clamp(Math.floor((o.x + d.x * t0 - xa) / cs), 0, G.nx - 1), cz = clamp(Math.floor((o.z + d.z * t0 - za) / cs), 0, G.nz - 1);
    let tmx = sx ? (xa + (cx + (sx > 0 ? 1 : 0)) * cs - o.x) / d.x : Infinity, tmz = sz ? (za + (cz + (sz > 0 ? 1 : 0)) * cs - o.z) / d.z : Infinity;
    const tdx = sx ? cs / Math.abs(d.x) : Infinity, tdz = sz ? cs / Math.abs(d.z) : Infinity;
    const q = ++GR.q, st = G.stamp;
    let best = Infinity;
    for (let guard = 0; guard < 4096; guard++) {
      const c = cz * G.nx + cx;
      for (let k = G.start[c], ke = G.start[c + 1]; k < ke; k++) {
        const t = G.tri[k];
        if (st[t] === q) continue;
        st[t] = q;
        const i0 = idx ? idx.getX(t * 3) : t * 3, i1 = idx ? idx.getX(t * 3 + 1) : t * 3 + 1, i2 = idx ? idx.getX(t * 3 + 2) : t * 3 + 2;
        GR.a.fromBufferAttribute(pos, i0); GR.b.fromBufferAttribute(pos, i1); GR.c.fromBufferAttribute(pos, i2);
        const hit = side === THREE.BackSide ? GR.ray.intersectTriangle(GR.c, GR.b, GR.a, true, GR.p) : GR.ray.intersectTriangle(GR.a, GR.b, GR.c, cull, GR.p);
        if (!hit) continue;
        const tt = GR.p.sub(o).dot(d) / dd;
        if (tt >= RC.near && tt <= RC.far && tt < best) best = tt;
      }
      const tn = Math.min(tmx, tmz);
      if (best <= tn || tn > t1) break;   // every nearer hit would have been in the cells walked so far
      if (tmx < tmz) { cx += sx; tmx += tdx; if (cx < 0 || cx >= G.nx) break; } else { cz += sz; tmz += tdz; if (cz < 0 || cz >= G.nz) break; }
    }
    if (GR.q > 2e9) { GR.q = 0; }
    return best < Infinity ? best : 0;
  }
  function rayWalk(o) {
    if (!o.visible || o.userData.noOcclude) return;
    if (o.isMesh && !o.isSkinnedMesh) {
      const m = o.material;
      if (!(m && m.transparent && m.opacity < 0.6)) {
        if (o.geometry.userData.rayGrid && !o.isInstancedMesh && !Array.isArray(m)) { const t = gridCast(o); if (t > 0 && (!rayMin || t < rayMin)) rayMin = t; }
        else o.raycast(RC, HITS);
      }
    }
    const ch = o.children;
    for (let i = 0; i < ch.length; i++) rayWalk(ch[i]);
  }
  function occluded(P, L, e, near = 0.02, endPad = 0.3) {
    tr.subVectors(L, P);
    const len = tr.length();
    if (len < 0.35) return 0;
    RC.set(P, tr.divideScalar(len)); RC.near = near; RC.far = len - endPad;
    HITS.length = 0; rayMin = 0; rayWalk(e.group);
    let m = rayMin;
    for (let i = 0; i < HITS.length; i++) if (!m || HITS[i].distance < m) m = HITS[i].distance;
    HITS.length = 0;
    return m;
  }
  // Is the lens unusable? (a) low inside a collider (counter, desk: colliders have no height, so only below ~1.1 m),
  // (b) someone who isn't in the shot stands between lens and subjects, (c) a surface facing the lens hides the
  // subject (the lens is behind a wall), or (d) a surface facing the SUBJECT lies between them: the lens is inside a
  // wall, above a ceiling or behind a one-sided backdrop, where the back faces vanish and the frame shows the void.
  // hitD = the distance from the lens to the surface it must come in front of, when that's the reason.
  function blocked(L, d, D, o, size, e) {
    hitD = 0;
    lensAt(tl, L, d, D, o, size);
    const cl = e && e.def.colliders;
    if (cl && tl.y < 1.1) for (let i = 0; i < cl.length; i++) { const b = cl[i]; if (tl.x > b[0] - 0.08 && tl.x < b[2] + 0.08 && tl.z > b[1] - 0.08 && tl.z < b[3] + 0.08) return true; }
    for (let i = 0; i < A.length; i++) {
      const a = A[i];
      if (a.set !== e || !a.root.visible) continue;
      let sub = false;
      for (let j = 0; j < nS; j++) if (SA[j] === a) sub = true;
      if (sub) continue;
      const ax = a.pos.x - L.x, az = a.pos.z - L.z, t = ax * d.x + az * d.z;
      if (t > 0.25 && t < D + 0.3 && Math.abs(ax * d.z - az * d.x) < 0.45) return true;
    }
    hitD = occluded(tl, L, e);
    if (hitD > 0) return true;
    if (nS > 1) for (let i = 0; i < nS && i < 4; i++) {   // a group: every face must be clear too, not just the middle
      hitD = occluded(tl, SP[i], e, 0.02, 0.12);
      if (hitD > 0) return true;
    }
    const back = occluded(L, tl, e, 0.08, -0.05);   // from the subject out to (just past) the lens
    if (back > 0) { hitD = Math.max(0.01, tl.distanceTo(L) - back); return true; }
    return false;
  }
  // how far from L toward P (and up to 0.2 m past P) a lens can go before it meets a surface, whichever way the
  // surface faces (a thick wall has two faces; a ceiling just above the lens counts). len + 0.2 = clear.
  function clearTo(L, P, e) {
    const len = L.distanceTo(P), f = occluded(P, L, e, 0.02, 0.05), b = occluded(L, P, e, 0.08, -0.2);
    let c = len + 0.2;
    if (f > 0) c = Math.min(c, len - f);
    if (b > 0) c = Math.min(c, b);
    return c;
  }
  const TURNS = [0, 0.6, -0.6, 1.2, -1.2, 1.57, -1.57];
  const GP = { set: null, pos: V() }, GST = { base: V(), pushT: 0 };   // a stand-in 'player' at a group, for set cameras
  function distFor(d, L, size, dist, fv, fit) {
    if (!fit) return dist ?? CONFIG.dist[size] ?? (size === 'TOP' ? 1.5 : CONFIG.dist.MID);
    const tanH = Math.tan(fv * DEG / 2) * fitAspect(), mg = size === 'WIDE' ? 1 : 0.6;   // fit everyone with a margin
    let D = size === 'WIDE' ? CONFIG.dist.WIDE : 1.5;
    for (let i = 0; i < nS; i++) {
      const x = SP[i].x - L.x, z = SP[i].z - L.z;
      D = Math.max(D, (Math.abs(x * d.z - z * d.x) + mg) / tanH + (x * d.x + z * d.z));
    }
    return D;
  }
  // The aspect compositions are fitted at: never narrower than 16:9 (times this half's share of the width). On a
  // narrower screen render() widens the lens so the same horizontal field shows: the composition survives phones
  // (inside the 2.35:1 letterbox the frame is then identical) and a wide screen just sees more.
  const REF = 16 / 9;
  const fitAspect = () => {
    renderer.getSize(size2);
    const fr = FFR || (splitE ? SPL.ratio : 1), a = size2.x / Math.max(1, size2.y);
    return fr * (W.fitNarrow ? Math.max(a, REF) : a);
  };
  function fitFov(fov, aspect, ref, cap) {   // vertical FOV that shows (at least) the horizontal field `fov` has at aspect `ref`
    if (!W.fitNarrow || !(aspect > 0) || aspect >= ref) return fov;
    const f = 2 * Math.atan(Math.tan(fov * DEG / 2) * ref / aspect) / DEG;
    return f > cap ? Math.max(fov, cap) : f;
  }

  function frameInto(out, on, size, o, e) {
    size = size || 'MID';
    const L = out.look, Pp = out.pos;
    const fc = fcam();
    if (!aimInto(L, on, size, e)) { Pp.copy(fc.pos); L.copy(fc.look); out.fov = fc.fov; return false; }
    const f = t1.set(0, 0, 0);
    for (let i = 0; i < nS; i++) f.add(SF[i]);
    if (nS > 1 && !o.facing) {           // groups: look across the line between them
      t2.set(SP[nS - 1].x - SP[0].x, 0, SP[nS - 1].z - SP[0].z);
      const len = t2.length();
      if (len > 0.25) {
        t3.set(-t2.z / len, 0, t2.x / len);
        const s = f.dot(t3) / nS;
        if (s < -0.3) t3.negate();
        else if (s < 0.3 && (SP[0].x - L.x) * t3.z - (SP[0].z - L.z) * t3.x > 0) t3.negate();   // facing each other: first subject frame-left
        f.copy(t3);
      }
    }
    if (f.lengthSq() < 0.01) f.set(fc.pos.x - L.x, 0, fc.pos.z - L.z);
    if (f.lengthSq() < 1e-6) f.set(0, 0, 1);
    f.normalize();
    const side = o.side || '';
    if (side.startsWith('ots:')) {       // over that actor's shoulder (right by default: it sits frame-left), looking at the subject
      const oa = actors.get(side.slice(4));
      if (oa && oa.set === e) {
        oa.eyePos(t3);
        t2.set(t3.x - L.x, 0, t3.z - L.z).normalize();
        const sh = o.shoulder === 'left' ? -0.38 : 0.38, back = o.dist ?? 0.95;
        Pp.set(t3.x + t2.x * back + t2.z * sh, t3.y + 0.06 + (o.height || 0), t3.z + t2.z * back - t2.x * sh);
        if (o.angle === 'low') Pp.y = Math.max(oa.pos.y + 0.5, Pp.y - 0.55);       // OTS · from below
        else if (o.angle === 'high') Pp.y += 0.45;
        const hit = occluded(t3, Pp, e, 0.05, -0.05);   // a wall behind the shoulder: come in front of it (at least 25 cm behind him)
        if (hit > 0) { const len = t3.distanceTo(Pp), k = Math.max(0.25 / len, (hit - 0.12) / len); Pp.sub(t3).multiplyScalar(Math.min(1, k)).add(t3); }
        L.lerp(t3, 0.12);                  // subject toward the far third, the shoulder in the near one
        out.fov = o.fov ?? CONFIG.fov;
        out.up.set(-t2.x, 0, -t2.z);
        return true;
      }
    }
    const d = t2;
    if (side === 'back') d.copy(f).negate();
    else if (side === 'left') d.set(f.z, 0, -f.x);
    else if (side === 'right') d.set(-f.z, 0, f.x);
    else if (o.angle === 'side') { d.set(f.z, 0, -f.x); if (d.x * (fc.pos.x - L.x) + d.z * (fc.pos.z - L.z) < 0) d.negate(); }   // profile on the camera's side
    else d.copy(f);
    const fv = o.fov ?? (size === 'ECU' ? CONFIG.ecuFov : CONFIG.fov), fit = o.dist == null && (size === 'TWO' || size === 'THREE' || (size === 'WIDE' && nS > 1));
    if (fit && size !== 'WIDE' && nS > 1 && !side && !o.angle && fitAspect() < 1.25) {
      // a narrow frame (a split's half): square across the line they would need a lens far back (the set's own wide
      // camera, in a room); come round 45° behind the last one instead, the first seen past his shoulder (a dirty two-shot)
      const q = SP[nS - 1], c = Math.cos(0.8), sn = Math.sin(0.8), qx = q.x - L.x, qz = q.z - L.z;
      const ax = d.x * c + d.z * sn, az = -d.x * sn + d.z * c, bx = d.x * c - d.z * sn, bz = d.x * sn + d.z * c;
      if (ax * qx + az * qz >= bx * qx + bz * qz) d.set(ax, 0, az); else d.set(bx, 0, bz);
    }
    const top = o.angle === 'top' || size === 'TOP';
    let D = distFor(d, L, size, o.dist, fv, fit);
    let pull = 1;
    if (!top && !o.facing && blocked(L, d, D, o, size, e)) {   // a clean frame: swing round (35°, 70°, 90° for one person) if the lens is in or behind a wall, or someone else is in the way
      t4.copy(d);
      const nT = nS > 1 ? 5 : TURNS.length;
      for (let k = 1; k <= nT; k++) {
        if (k === nT) {                   // nowhere clean: keep the intended angle but come in front of whatever is in the way,
          d.copy(t4); D = distFor(d, L, size, o.dist, fv, fit);   // or (a WIDE, or a group that can't) take the set's own camera for where they stand
          let inWall = false;
          if (blocked(L, d, D, o, size, e) && hitD > 0) {   // come in front of the nearest surface on the line (both faces of a thick wall)
            const len = tl.distanceTo(L), cl = clearTo(L, tl, e);
            pull = Math.min(cl - 0.15, len) / len;
            if (pull * len < 0.3) inWall = true;   // the surface is right at the subject: no lens fits in front of it
            pull = Math.max(pull, 0.3 / len);
          }
          // nowhere for a real lens: a group (a WIDE, or squeezed under 30%), a single WIDE squeezed under half, or a
          // subject up against the wall takes the set's own camera for where they stand
          const zc = (inWall || (size === 'WIDE' && pull < 0.5) || (nS > 1 && pull < 0.3)) && zoneCam(e, L);
          if (zc && e.def.cams[zc]) { GP.set = e; GP.pos.set(L.x, L.y - 1.2, L.z); setCamInto(out, e, zc, GP, 0, true, GST); out.up.set(-d.x, 0, -d.z); return true; }
          pull = clamp(pull, 0.05, 1);
          break;
        }
        const c = Math.cos(TURNS[k]), sn = Math.sin(TURNS[k]);
        d.set(t4.x * c + t4.z * sn, 0, -t4.x * sn + t4.z * c);
        D = distFor(d, L, size, o.dist, fv, fit);
        if (!blocked(L, d, D, o, size, e)) break;
      }
    }
    out.up.set(-d.x, 0, -d.z);           // "up" for near-vertical views (crane from the sky, top-downs)
    if (top) { Pp.set(L.x, L.y + D, L.z); out.up.copy(f); if (o.height) Pp.y += o.height; }
    else { lensAt(Pp, L, d, D, o, size); if (pull < 1) Pp.sub(L).multiplyScalar(pull).add(L); }
    if (o.offset) { Pp.x += d.z * o.offset; Pp.z -= d.x * o.offset; L.x += d.z * o.offset; L.z -= d.x * o.offset; }
    const fz = top ? 1 : fitZones(Pp, L, e), s = fz * pull;
    if (size === 'WIDE' && nS > 1 && fz < 0.6) {   // a room too small for a wide: the set's own camera for where they stand
      const zc = zoneCam(e, L);
      if (zc && e.def.cams[zc]) { GP.set = e; GP.pos.set(L.x, L.y - 1.2, L.z); setCamInto(out, e, zc, GP, 0, true, GST); return true; }
    }
    out.fov = s < 1 ? Math.min(75, 2 * Math.atan(Math.tan(fv * DEG / 2) / s) / DEG) : fv;
    return true;
  }
  function fillFO(o) {
    FO.angle = o.angle || null; FO.side = o.side || null; FO.dist = o.dist ?? null; FO.height = o.height || 0;
    FO.fov = o.fov ?? null; FO.offset = o.offset || 0; FO.facing = !!o.facing; FO.shoulder = o.shoulder || null;
    return FO;
  }
  function frameFn(subjects, size = 'MID', opts = {}) {
    frameInto(F, subjects, String(size).toUpperCase(), fillFO(opts), cur);
    return F;
  }

  // ------------------------------------------------------------ camera state
  const cs = { pos: V(), look: V(), fov: 40 }, cp = { pos: V(), look: V(), fov: 40 }, gs = { pos: V(), look: V(), fov: 45 };
  const csR = { pos: V(), look: V(), fov: 40 }, cpR = { pos: V(), look: V(), fov: 40 };   // the right half of a split
  let snap = true, locked = false;
  const copyCam = (o, s) => { o.pos.copy(s.pos); o.look.copy(s.look); o.fov = s.fov; };
  const dirInto = (out, p, yaw, pitch, len) => out.set(p.x + Math.sin(yaw) * Math.cos(pitch) * len, p.y + Math.sin(pitch) * len, p.z + Math.cos(yaw) * Math.cos(pitch) * len);
  const yawOf = (p, l) => Math.atan2(l.x - p.x, l.z - p.z), pitchOf = (p, l) => Math.atan2(l.y - p.y, Math.hypot(l.x - p.x, l.z - p.z));

  // gameplay: set cams + zones, or an override
  const G = { name: '', mode: null, opts: null, st: { base: V(), pushT: 0 }, ease: 0 };
  const zoneCam = (e, pa) => {         // pa = an actor or a point
    const zs = e.def.zones, p = pa && (pa.pos || pa);
    if (!p || !zs) return '';
    for (let i = 0; i < zs.length; i++) { const b = zs[i].box; if (p.x >= b[0] && p.x <= b[2] && p.z >= b[1] && p.z <= b[3]) return zs[i].cam; }
    return '';
  };
  function setCamInto(out, e, name, pa, dt, cut, st) {
    const c = e.def.cams && e.def.cams[name];
    if (!c) {                             // no cameras at all: a plain overview of the actors
      if (!frameInto(out, null, 'WIDE', fillFO({ angle: 'high' }), e)) { out.pos.set(0, 6, 10); out.look.set(0, 1, 0); out.fov = 45; }
      return;
    }
    const k = cut ? 1 : damp(5, dt), fixedLook = Array.isArray(c.look);
    const tgt = t4;
    if (fixedLook) tgt.fromArray(c.look);
    else if (pa && pa.set === e) tgt.set(pa.pos.x, pa.pos.y + 1.2, pa.pos.z);
    else if (c.base) tgt.fromArray(c.base);
    else if (c.pos) tgt.set(c.pos[0], c.pos[1] - 1, c.pos[2] - 5);
    else tgt.set(0, 1, 0);
    // position
    if (c.type === 'rail' && c.from && c.to) {
      const ax = c.from[0], az = c.from[2], bx = c.to[0] - ax, bz = c.to[2] - az;
      const u = clamp(((tgt.x - ax) * bx + (tgt.z - az) * bz) / Math.max(1e-6, bx * bx + bz * bz), 0, 1);
      t3.set(ax + bx * u, c.from[1] + (c.to[1] - c.from[1]) * u, az + bz * u);
      if (cut) out.pos.copy(t3); else out.pos.lerp(t3, k);
    } else if (c.type === 'push' && c.to) {
      if (cut) st.pushT = 0; else st.pushT += dt;
      const u = smooth(st.pushT / (c.dur || 20));
      out.pos.set(c.pos[0] + (c.to[0] - c.pos[0]) * u, c.pos[1] + (c.to[1] - c.pos[1]) * u, c.pos[2] + (c.to[2] - c.pos[2]) * u);
    } else out.pos.fromArray(c.pos || c.from || [0, 5, 10]);
    // look
    if (fixedLook) out.look.copy(tgt);
    else {
      const lim = c.limit ?? (c.type === 'pan' ? 0.5 : 0);
      if (lim > 0) {                      // pan: follow the player within ±limit of the base direction
        if (cut) { if (c.base) st.base.fromArray(c.base); else st.base.copy(tgt); }
        const by = yawOf(out.pos, st.base), bp = pitchOf(out.pos, st.base);
        const yaw = by + clamp(angTo(by, yawOf(out.pos, tgt)), -lim, lim), pitch = bp + clamp(pitchOf(out.pos, tgt) - bp, -lim, lim);
        dirInto(tgt, out.pos, yaw, pitch, Math.max(1, out.pos.distanceTo(tgt)));
      }
      if (cut) out.look.copy(tgt); else out.look.lerp(tgt, k);
    }
    out.fov = c.fov ?? 45;
  }
  function followInto(out, pa, o, dt, cut) {
    const dist = o.dist ?? 2.4, h = o.height ?? 1.7, lag = Math.max(0.05, o.lag ?? 0.35), fx = Math.sin(pa.rotY), fz = Math.cos(pa.rotY);
    t4.set(pa.pos.x - fx * dist, pa.pos.y + h, pa.pos.z - fz * dist);
    if (cut) out.pos.copy(t4); else out.pos.lerp(t4, damp(1 / lag, dt));
    const ahead = o.look === 'player' ? 0 : 3;
    t4.set(pa.pos.x + fx * ahead, pa.pos.y + (ahead ? 1.1 : 1.35), pa.pos.z + fz * ahead);
    if (cut) out.look.copy(t4); else out.look.lerp(t4, damp(1.5 / lag, dt));
    out.fov = o.fov ?? 50;
  }
  function gameTick(dt) {
    const e = cur, pa = P.actor && P.actor.set === e ? P.actor : null;
    let name;
    if (G.mode === 'follow' && pa) name = 'follow';
    else if (G.mode === 'fixed') name = 'fixed';
    else if (G.mode === 'set') name = G.opts.name;
    else name = zoneCam(e, pa) || G.name || e.firstCam;
    if (!name) name = '(overview)';
    const cut = name !== G.name;
    G.ease = 0;
    if (cut && G.name && e.def.cams) {   // chained corridor cameras (both flagged { ease: true | secs }): a short ease, not a cut
      const a = e.def.cams[G.name], b = e.def.cams[name];
      if (a && b && a.ease && b.ease) G.ease = Math.min(0.5, b.ease === true ? 0.25 : +b.ease || 0.25);
    }
    G.name = name;
    if (name === 'follow') followInto(gs, pa, G.opts, dt, cut);
    else if (name === 'fixed') {       // TWO: pos/look arrays may be mutated every tick (a tracking camera); lag/lookLag damp them
      const o = G.opts, la = typeof o.look === 'string' && o.look !== 'player' ? actors.get(o.look) : null;
      t3.fromArray(o.pos);
      if (Array.isArray(o.look)) t4.fromArray(o.look); else if (la || pa) { const q = la || pa; t4.set(q.pos.x, q.pos.y + 1.2, q.pos.z); } else t4.copy(gs.look);
      if (cut || !(o.lag > 0)) gs.pos.copy(t3); else gs.pos.lerp(t3, damp(1 / o.lag, dt));
      if (cut || !(o.lookLag > 0)) gs.look.copy(t4); else gs.look.lerp(t4, damp(1 / o.lookLag, dt));
      gs.fov = o.fov ?? 45;
    } else setCamInto(gs, e, name, pa, dt, cut, G.st);
    return cut;
  }


  // ------------------------------------------------------------ cutscene shots: two rigs
  // RM is the main camera (the left half under a split), RR the right half's. Each has its own shot state, its own
  // live camera (cs/csR, interpolated from cp/cpR) and its own borrowed JARVIS spot, so both halves move.
  const shotState = () => ({ kind: '', move: '', subj: null, size: 'MID', reaim: false, t: 0, dur: 0, ease: smooth,
    pos: V(), look: V(), fov: 40, pos0: V(), look0: V(), fov0: 40, up: V().set(0, 0, -1), off: V(), aim: V(), lat: V(), start: { pos: V(), look: V(), fov: 40 }, end: { pos: V(), look: V(), fov: 40 },
    a0: 0, a1: 0, amount: 1, y0: 0, p0: 0, y1: 0, p1: 0, len: 1, len1: 1, fo: { ...FO }, trackSide: 'left', setcam: '', st: { base: V(), pushT: 0 },
    roll: 0, spin: false, spinW: 0 });
  const S = shotState(), SR = shotState();
  const newRig = (s, c, p) => ({ s, cs: c, cp: p, on: false, near: 0.05, snap: true, jarvis: null, name: '', spot: { c: new THREE.Color(), i: 0, a: 0, p: V(), t: V() } });
  const RM = newRig(S, cs, cp), RR = newRig(SR, csR, cpR);
  const rigSet = (rg) => (rg === RM ? cur : splitE);
  // shot names: case-insensitive, spaces/underscores = hyphens ('crash zoom', 'PULL OUT', 'top-down', 'Jarvis cam')
  const NAMES = { 'TWO-SHOT': 'TWO', 'THREE-SHOT': 'THREE', 'TOP-DOWN': 'TOP', 'JARVIS-CAM': 'JARVIS', 'CRASH-ZOOM': 'CRASH', 'PULL-OUT': 'PULL',
    'PUSH-IN': 'PUSH', 'CLOSE-UP': 'CLOSE', 'EXTREME-CLOSE-UP': 'ECU', MEDIUM: 'MID', 'OVER-THE-SHOULDER': 'OTS', 'WHIP-PAN': 'WHIP' };
  const shotName = (x) => { const r = String(x || 'MID').toUpperCase().replace(/[\s_]+/g, '-'); return NAMES[r] || r; };
  const MOVES = { PUSH: 'push', PULL: 'pull', TRACK: 'track', PAN: 'pan', TILT: 'tilt', CRANE: 'crane', ORBIT: 'orbit', WHIP: 'whip', CRASH: 'crash' };
  const MOVE_OK = { push: 1, pull: 1, track: 1, pan: 1, tilt: 1, crane: 1, orbit: 1, whip: 1, crash: 1, glide: 1 };
  const SIZED = { LOW: 1, HIGH: 1, OTS: 1, LOCKED: 1 };   // shot names that frame at `size` (default MID), like the moves
  const SIZES = { ECU: 1, CLOSE: 1, MID: 1, WIDE: 1, TWO: 1, THREE: 1, TOP: 1 };

  // base framing for any shot kind into o (a shotState), in set e
  function baseInto(o, step, e) {
    logMiss = true;
    const ok = baseKind(o, step, e);
    logMiss = false;
    if (ok && o.kind !== 'TOP' && !(o.kind === 'INSERT' && step.angle === 'top') && SIZES[o.kind] !== 1) {
      t1.set(o.look0.x - o.pos0.x, 0, o.look0.z - o.pos0.z);
      if (t1.lengthSq() > 1e-4) o.up.copy(t1.normalize());
    }
    return ok;
  }
  function nearestOther(id, e) {          // the visible actor nearest `id` (within 6 m), for an OTS that names no shoulder
    const a = actors.get(id);
    if (!a) return null;
    let best = null, bd = 36;
    for (let i = 0; i < A.length; i++) {
      const o = A[i];
      if (o === a || o.set !== e || !o.root.visible) continue;
      const d = (o.pos.x - a.pos.x) ** 2 + (o.pos.z - a.pos.z) ** 2;
      if (d < bd) { bd = d; best = o.id; }
    }
    return best;
  }
  function facesFront(an, lens) {          // JARVIS-CAM default faces: those beyond the screen (from the lens) within 5 m of it
    let m = 0;
    t2.subVectors(an.at, lens);
    for (let i = 0; i < nS; i++) {
      t1.subVectors(SP[i], an.at);
      if (t1.dot(t2) <= 0 || t1.lengthSq() > 25) continue;
      if (m !== i) { SP[m].copy(SP[i]); SF[m].copy(SF[i]); SA[m] = SA[i]; }
      m++;
    }
    nS = m;
  }
  function baseKind(o, step, e) {
    let k = shotName(step.shot);
    const raw = k;
    if (MOVES[k] || SIZED[k]) { k = shotName(step.size || 'MID'); if (MOVES[k] || SIZED[k]) k = 'MID'; }
    o.kind = k; o.subj = null; o.reaim = false; o.lat.set(0, 0, 0); o.up.set(0, 0, -1);
    Object.assign(o.fo, fillFO(step));
    if (raw === 'LOW' || raw === 'HIGH') o.fo.angle = raw.toLowerCase();
    let on = step.on;
    if (raw === 'OTS' && !String(o.fo.side || '').startsWith('ots:')) {   // over `over`'s (or `from`'s) shoulder, looking at `on`
      let over = step.over || (typeof step.from === 'string' ? step.from : null);
      if (!over && Array.isArray(on) && on.length === 2 && typeof on[0] === 'string') { over = on[1]; on = on[0]; }
      if (!over && typeof on === 'string') over = nearestOther(on, e);
      if (over) o.fo.side = 'ots:' + over;
    }
    if (k === 'SET') { setCamInto(o, e, step.cam, P.actor, 0, true, o.st); o.setcam = step.cam; copyTo0(o); return true; }
    if (k === 'CAM') {
      o.pos0.fromArray(step.pos); o.look0.fromArray(step.look); o.fov0 = step.fov ?? CONFIG.fov;
      if (step.to) { o.end.pos.fromArray(step.to.pos || step.pos); o.end.look.fromArray(step.to.look || step.look); o.end.fov = step.to.fov ?? o.fov0; }
      return true;
    }
    if (k === 'INSERT' || k === 'JARVIS') {
      const id = step.at ?? on, an = typeof id === 'string' ? e.anchors[id] : null;
      if (k === 'INSERT' && !an && typeof id === 'string' && actors.get(id)) {   // an actor's hands/chest
        frameInto(F, id, 'CLOSE', fillFO({ angle: 'high', dist: step.dist ?? 0.8, fov: step.fov ?? 35 }), e);
        o.pos0.copy(F.pos); o.pos0.y -= 0.3; o.look0.copy(F.look); o.look0.y -= 0.35; o.fov0 = F.fov;
        return true;
      }
      if (!an && Array.isArray(id)) { o.look0.fromArray(id); o.pos0.fromArray(step.from || [id[0], id[1] + 0.3, id[2] + 0.6]); o.fov0 = step.fov ?? 35; }
      else if (!an) { testLog('cam: no anchor ' + id); return false; }
      else {
        o.look0.copy(an.at);
        if (an.from) o.pos0.copy(an.from); else o.pos0.set(an.at.x, an.at.y + 0.35, an.at.z + 0.6);
        o.fov0 = step.fov ?? an.fov ?? (k === 'INSERT' ? 35 : CONFIG.fov);
        if (k === 'INSERT' && step.angle === 'top') {
          if (an.from) o.up.set(an.from.x - an.at.x, 0, an.from.z - an.at.z).normalize();
          o.pos0.set(an.at.x, an.at.y + (step.dist ?? 0.7), an.at.z);
        }
      }
      if (k === 'JARVIS') {                // look out at the faces (default: everyone just beyond the screen), lens wide enough for all
        if (step.on != null && step.at != null) gather(step.on, e);
        else { gather(null, e); if (an) facesFront(an, o.pos0); }
        if (nS) {
          t3.set(0, 0, 0); for (let i = 0; i < nS; i++) t3.add(SP[i]); t3.divideScalar(nS); t3.y -= 0.05;
          o.look0.copy(t3);
          t2.subVectors(t3, o.pos0).normalize();
          let ang = 0;
          for (let i = 0; i < nS; i++) ang = Math.max(ang, t2.angleTo(t1.subVectors(SP[i], o.pos0)));
          const vf = 2 * Math.atan(Math.tan(ang + 0.14) / fitAspect()) / DEG;
          o.fov0 = clamp(Math.max(o.fov0, vf), 20, 70);
        }
      }
      return true;
    }
    if (k === 'POV') {
      const a = typeof step.from === 'string' ? actors.get(step.from) : null;
      if (a) { a.eyePos(o.pos0); o.pos0.x += Math.sin(a.rotY) * 0.06; o.pos0.z += Math.cos(a.rotY) * 0.06; }
      else if (typeof step.from === 'string' && e.anchors[step.from]) o.pos0.copy(e.anchors[step.from].from || e.anchors[step.from].at);
      else pointOf(step.from, o.pos0, e);
      if (!pointOf(step.at ?? on, o.look0, e) && a) o.look0.set(o.pos0.x + Math.sin(a.rotY) * 5, o.pos0.y, o.pos0.z + Math.cos(a.rotY) * 5);
      o.fov0 = step.fov ?? 45;
      return true;
    }
    if (!SIZES[k]) { testLog('cam: unknown shot ' + raw); k = o.kind = 'MID'; }
    if (!frameInto(F, on, k, o.fo, e)) {
      if (on != null) return false;
      setCamInto(o, e, e.firstCam, null, 0, true, o.st); copyTo0(o); return true;   // WIDE of nobody: the set's first camera
    }
    o.pos0.copy(F.pos); o.look0.copy(F.look); o.fov0 = F.fov; o.up.copy(F.up);
    o.subj = on ?? null; o.size = k;
    o.reaim = !step.locked && raw !== 'LOCKED' && k !== 'TOP' && nAct > 0;
    // a reaim keeps the composition: whatever the framing added to the plain aim (offset, OTS shoulder bias, a zone cam)
    if (o.reaim && aimInto(t5, on, k, e)) o.lat.subVectors(o.look0, t5);
    return true;
  }
  function copyTo0(o) { o.pos0.copy(o.pos); o.look0.copy(o.look); o.fov0 = o.fov; }

  function endShotExtras(rg) {
    const j = rg.jarvis;
    if (j) { const s = j.spot, sv = rg.spot; s.color.copy(sv.c); s.intensity = sv.i; s.angle = sv.a; s.position.copy(sv.p); s.target.position.copy(sv.t); }
    rg.jarvis = null;
  }
  function shotInto(rg, step) {
    const e = rigSet(rg), s = rg.s, c = rg.cs, was = rg.on;
    if (!e || !step) return;
    endShotExtras(rg);
    if (rg === RM) { settle(rel, 'res'); rel.on = false; }
    copyCam(s.start, c);
    FC = c; FFR = rg === RR ? 1 - SPL.ratio : 0;
    const ok = baseInto(s, step, e);
    FC = null; FFR = 0;
    s.roll = (+step.roll || 0) * DEG; s.spin = false;
    rg.on = true; rg.near = 0.05; C.cutscene = true;
    if (!ok) {                             // nothing to frame: hold the current angle (a fresh right half: a plain view)
      if (rg === RR && !was) { c.pos.set(0, 2, 6); c.look.set(0, 1, 0); c.fov = 40; RR.snap = true; }
      copyCam(s, c); copyTo0(s); s.kind = 'CAM'; s.move = ''; s.subj = null; s.reaim = false;
      return;
    }
    const k = s.kind, raw = shotName(step.shot);
    let move = raw === 'LOCKED' ? '' : step.move ? String(step.move).toLowerCase().replace(/[^a-z].*$/, '') : MOVES[raw] || '';
    if (move === 'glide' || (k === 'CAM' && step.to)) move = k === 'CAM' && step.to ? 'glide' : '';
    if (move && !MOVE_OK[move]) { testLog('cam: unknown move ' + step.move); move = ''; }
    s.move = move; s.t = 0; s.ease = EASE[step.ease] || smooth;
    s.dur = move === 'whip' ? step.dur ?? 0.2 : move === 'crash' ? step.dur ?? 0.12 : step.dur ?? 3;
    s.off.subVectors(s.pos0, s.look0);
    s.aim.copy(s.look0);
    s.len = Math.max(0.5, s.off.length());
    if (move === 'push') { s.a0 = 1; s.a1 = step.amount ?? 0.6; }
    else if (move === 'pull') { s.a0 = 1; s.a1 = 1 / (step.amount ?? 0.6); }
    else if (move === 'crane') {           // metres of lens rise (dir: 'down' = from 2 m above to the framing)
      const down = step.dir === 'down';
      s.a0 = typeof step.from === 'number' ? step.from : down ? 2 : 0; s.a1 = typeof step.to === 'number' ? step.to : down ? 0 : 2; s.amount = step.amount ?? 1;
    } else if (move === 'orbit') {         // degrees; spin: keep turning past dur at the final speed (the idea engine)
      s.a0 = (typeof step.from === 'number' ? step.from : 0) * DEG; s.a1 = (typeof step.to === 'number' ? step.to : 90) * DEG;
      s.spin = !!step.spin; s.spinW = (s.a1 - s.a0) * (s.ease(1) - s.ease(0.999)) / 0.001 / Math.max(0.05, s.dur);
    } else if (move === 'crash') { s.a1 = step.zoom ?? s.fov0 * 0.5; if (typeof sfx === 'function' && !skipping() && step.sting !== false) sfx('sting'); }
    else if (move === 'track') { const tr = step.track || 'alongside'; s.trackSide = tr === 'ahead' ? 'front' : tr === 'behind' ? 'back' : step.side === 'right' ? 'right' : 'left'; }
    else if (move === 'pan' || move === 'tilt') {
      s.y0 = yawOf(s.pos0, s.look0); s.p0 = pitchOf(s.pos0, s.look0); s.y1 = s.y0; s.p1 = s.p0; s.len1 = s.len;
      if (typeof step.to === 'string' || Array.isArray(step.to)) {
        if (pointOf(step.to, t3, e)) { s.y1 = s.y0 + angTo(s.y0, yawOf(s.pos0, t3)); s.p1 = pitchOf(s.pos0, t3); s.len1 = Math.max(0.5, s.pos0.distanceTo(t3)); }
      } else {
        const fr = typeof step.from === 'number' ? step.from : 0;
        if (move === 'tilt') { s.p0 += fr * DEG; s.p1 = s.p0 - fr * DEG + (typeof step.to === 'number' ? step.to : 25) * DEG; }
        else { s.y0 -= fr * DEG; s.y1 = s.y0 + fr * DEG - (typeof step.to === 'number' ? step.to : 30) * DEG; }   // degrees, + = right
      }
    } else if (move === 'whip') {
      s.y0 = yawOf(s.start.pos, s.start.look); s.p0 = pitchOf(s.start.pos, s.start.look);
      s.y1 = yawOf(s.pos0, s.look0); s.p1 = pitchOf(s.pos0, s.look0); s.len1 = s.len;
    }
    // framed shots only: an explicit lens (CAM, INSERT, POV, JARVIS, SET) or facing: true is the author's call
    if (!skipping() && SIZES[k] && !s.fo.facing && (move === 'crane' || move === 'orbit' || move === 'pull')) moveRoom(s, e);
    if (skipping() && move !== 'track') s.t = s.dur;
    if (move === 'glide') { s.start.pos.copy(s.pos0); s.start.look.copy(s.look0); s.start.fov = s.fov0; }   // CAM glides from its own pos
    if (move !== 'whip') { c.pos.copy(s.pos0); c.look.copy(s.look0); c.fov = s.fov0; }
    if (rg === RM) snap = true; else RR.snap = true;
    shotTick(rg, 0);
    if (k === 'JARVIS') {                  // screens watch people: blue light from the screen onto the faces
      const sp = e.spot, sv = rg.spot, an = typeof step.at === 'string' ? e.anchors[step.at] : null;
      sv.c.copy(sp.color); sv.i = sp.intensity; sv.a = sp.angle; sv.p.copy(sp.position); sv.t.copy(sp.target.position); rg.jarvis = e;
      sp.position.copy(an ? an.at : s.pos0); sp.target.position.copy(s.look0);
      const d = sp.position.distanceTo(s.look0);
      sp.color.set(0x7fb0ff); sp.intensity = 2.5 * Math.pow(Math.max(0.3, d), 1.5); sp.angle = 0.7;
      if (an) {                           // the camera sits behind the screen: start the lens just past it
        t1.subVectors(an.at, s.pos0); t2.subVectors(s.look0, s.pos0);
        const sd = t1.length();
        if (t1.dot(t2) > 0 && sd < t2.length() - 0.3) rg.near = sd + 0.15;
      }
    }
    if (step.shake) { const sh = step.shake; C.shake(typeof sh === 'number' ? sh : sh.amp ?? 0.04, typeof sh === 'number' ? 0.45 : sh.dur ?? 0.45); }
    rg.name = String(step.shot) + (step.move ? ' ' + step.move : '') + (step.on != null ? ' ' + step.on : step.at != null ? ' ' + step.at : '');
    if (rg === RM) C.name = rg.name;
  }
  // A move must not carry the lens through a ceiling or a wall either: at the cut (a handful of rays, never per
  // frame) a crane's rise, an orbit's radius and a pull's reach shrink to what the room allows.
  function moveRoom(s, e) {
    const L = s.look0;
    if (s.move === 'pull') {
      tl.copy(s.off).multiplyScalar(s.a1).add(L);
      const c = clearTo(L, tl, e);
      if (c < s.len * s.a1 + 0.15) s.a1 = Math.max(1, (c - 0.15) / s.len);
    } else if (s.move === 'crane') {
      for (let pass = 0; pass < 2; pass++) {
        const key = pass ? 'a1' : 'a0', sc = pass ? s.amount : 1;
        for (let it = 0; it < 6 && Math.abs(s[key]) > 0.05; it++) {
          tl.copy(s.off).multiplyScalar(sc).add(L); tl.y += s[key];
          if (clearTo(L, tl, e) >= L.distanceTo(tl) + 0.15) break;
          s[key] *= 0.65;
        }
      }
    } else if (s.move === 'orbit') {
      const span = s.spin ? TAU : s.a1 - s.a0;
      let k = 1;
      for (let i = 1; i <= 8; i++) {
        const a = s.a0 + span * i / 8, co = Math.cos(a), sn = Math.sin(a);
        tl.set(L.x + s.off.x * co + s.off.z * sn, L.y + s.off.y, L.z - s.off.x * sn + s.off.z * co);
        const len = L.distanceTo(tl), c = clearTo(L, tl, e);
        if (c < len + 0.15) k = Math.min(k, Math.max(0.2, (c - 0.15) / len));
      }
      if (k < 1) {   // a tight room: a smaller circle, and a wider lens so the subject keeps (about) its size in frame
        s.off.multiplyScalar(k); s.len = Math.max(0.5, s.off.length());
        s.fov0 = Math.min(Math.max(s.fov0, 75), 2 * Math.atan(Math.tan(s.fov0 * DEG / 2) / k) / DEG);
      }
    }
  }
  function shotTick(rg, dt) {
    if (locked) return;
    const s = rg.s, c = rg.cs, e = rigSet(rg);
    if (!e) return;
    if (s.kind === 'SET') { setCamInto(c, e, s.setcam, P.actor, dt, false, s.st); return; }
    s.t += dt;
    const u = s.dur > 0 ? Math.min(1, s.t / s.dur) : 1, k = s.ease(u);
    if (s.subj != null && s.kind !== 'TOP' && aimInto(s.aim, s.subj, s.size, e)) s.aim.add(s.lat); else s.aim.copy(s.look0);
    switch (s.move) {
      case 'push': case 'pull': case 'crane': {
        const sc = s.move === 'crane' ? 1 + (s.amount - 1) * k : s.a0 + (s.a1 - s.a0) * k;
        c.pos.copy(s.off).multiplyScalar(sc).add(s.aim);
        if (s.move === 'crane') c.pos.y += s.a0 + (s.a1 - s.a0) * k;
        c.look.copy(s.aim);
        break;
      }
      case 'orbit': {
        const a = s.spin && s.t > s.dur ? s.a1 + s.spinW * (s.t - s.dur) : s.a0 + (s.a1 - s.a0) * k, co = Math.cos(a), sn = Math.sin(a);
        c.pos.set(s.aim.x + s.off.x * co + s.off.z * sn, s.aim.y + s.off.y, s.aim.z - s.off.x * sn + s.off.z * co);
        c.look.copy(s.aim);
        break;
      }
      case 'track': {   // moves with the subject exactly; only the angle eases when they turn
        const tr = s.fo.side; s.fo.side = s.trackSide; s.fo.facing = true;
        FC = c; FFR = rg === RR ? 1 - SPL.ratio : 0;
        if (frameInto(F, s.subj, s.size, s.fo, e)) {
          t5.subVectors(F.pos, F.look);
          if (s.t < 0.02) s.off.copy(t5); else s.off.lerp(t5, damp(3, dt));
          c.pos.copy(F.look).add(s.off); c.look.copy(F.look); c.fov = F.fov;
        }
        FC = null; FFR = 0;
        s.fo.side = tr;
        break;
      }
      case 'pan': case 'tilt':
        c.pos.copy(s.pos0);
        dirInto(c.look, c.pos, s.y0 + (s.y1 - s.y0) * k, s.p0 + (s.p1 - s.p0) * k, s.len + (s.len1 - s.len) * k);
        break;
      case 'whip': {   // very fast pan with an overshoot, a lens breath and (render) a brief blur: reads as motion blur
        const w = Math.sin(Math.PI * u), dy = angTo(s.y0, s.y1);
        c.pos.lerpVectors(s.start.pos, s.pos0, k);
        dirInto(c.look, c.pos, s.y0 + dy * k + Math.sign(dy) * 0.16 * w, s.p0 + (s.p1 - s.p0) * k, s.len);
        c.fov = s.start.fov + (s.fov0 - s.start.fov) * k + 9 * w;
        if (u >= 1) { s.move = ''; c.pos.copy(s.pos0); c.look.copy(s.look0); c.fov = s.fov0; }
        break;
      }
      case 'crash': {   // snaps onto the face
        const e2 = EASE.out(u);
        c.pos.copy(s.pos0); c.look.copy(s.aim);
        if (s.subj != null && aimInto(t5, s.subj, 'CLOSE', e)) c.look.lerp(t5, e2);
        c.fov = s.fov0 + (s.a1 - s.fov0) * e2;
        break;
      }
      case 'glide':
        c.pos.lerpVectors(s.start.pos, s.end.pos, k); c.look.lerpVectors(s.start.look, s.end.look, k);
        c.fov = s.start.fov + (s.end.fov - s.start.fov) * k;
        break;
      default:
        if (s.reaim) c.look.lerp(s.aim, damp(2.5, dt));   // the operator keeps the subject framed (a head lifting, a step)
    }
  }

  const rel = { on: false, t: 0, dur: 0.8, pos: V(), look: V(), fov: 40, res: null };
  const SHK = { t: 0, dur: 0, amp: 0 };   // cam.shake: off unless asked for (no handheld wobble anywhere)
  function camTick(dt) {
    copyCam(cp, cs);
    if (splitE) copyCam(cpR, csR);
    const cut = gameTick(dt);
    if (RM.on) shotTick(RM, dt);
    else {
      if (cut && G.ease > 0 && !rel.on && !skipping()) { rel.pos.copy(cs.pos); rel.look.copy(cs.look); rel.fov = cs.fov; rel.t = 0; rel.dur = G.ease; rel.on = true; }
      if (rel.on) {
        rel.t += dt;
        const k = smooth(rel.t / rel.dur);
        cs.pos.lerpVectors(rel.pos, gs.pos, k); cs.look.lerpVectors(rel.look, gs.look, k); cs.fov = rel.fov + (gs.fov - rel.fov) * k;
        if (rel.t >= rel.dur) { rel.on = false; settle(rel, 'res'); }
      } else { copyCam(cs, gs); if (cut) snap = true; }
    }
    if (splitE && RR.on) shotTick(RR, dt);
    if (!RM.on) C.name = G.name;
    if (SHK.t > 0) SHK.t -= dt;
    if (snap) { copyCam(cp, cs); snap = false; }
    if (RR.snap) { copyCam(cpR, csR); RR.snap = false; }
  }

  const PROJ = { x: 0, y: 0, visible: false };
  let lastLW = 0, lastW = 0, lastH = 0;
  const C = {
    name: '', cutscene: false,
    get camera() { return camera; },
    get cameraR() { return camR; },
    // cam.shot(step): a shot on the main camera, or with half: 'right' on the right half of a split
    shot(step) {
      if (!step) return;
      if (step.half === 'right') { if (splitE) shotInto(RR, step); else testLog('cam: a right-half shot with no split'); return; }
      shotInto(RM, step);
    },
    lock(on) { locked = !!on; },
    release(dur = 0.8) {
      endShotExtras(RM);
      RM.on = false; C.cutscene = false; locked = false;
      settle(rel, 'res');
      if (!cur) return Promise.resolve();
      G.name = ''; gameTick(0);
      if (skipping() || !(dur > 0)) { rel.on = false; copyCam(cs, gs); snap = true; return Promise.resolve(); }
      rel.pos.copy(cs.pos); rel.look.copy(cs.look); rel.fov = cs.fov; rel.t = 0; rel.dur = dur; rel.on = true;
      return new Promise((r) => { rel.res = r; });
    },
    // cam.override('follow' | 'fixed' | 'set' | null, opts): opts.ease = seconds to blend from the current view into
    // the new gameplay camera (also when clearing it) instead of cutting. 'fixed': { pos, look: [x,y,z] | 'player' |
    // actorId, fov, lag, lookLag } (lag/lookLag: damping time constants in s, so a mini-game can mutate pos/look in
    // place every tick for a tracking camera: the boss's bossCam); 'follow': { dist, height, lag, fov, look }; 'set': { name }.
    override(mode, opts = {}) {
      if (mode !== G.mode || mode === 'fixed' || mode === 'set') G.name = '';   // cut; a new 'follow' distance eases in
      G.mode = mode || null; G.opts = opts || {};
      if (!mode) G.name = '';
      const ez = opts && +opts.ease;
      if (ez > 0 && !RM.on && cur && !skipping()) {   // blend from what's on screen now (gameTick sees the cut, the blend carries it)
        settle(rel, 'res');
        rel.pos.copy(cs.pos); rel.look.copy(cs.look); rel.fov = cs.fov; rel.t = 0; rel.dur = Math.min(4, ez); rel.on = true;
      }
    },
    // cam.shake(amp = 0.04 m, dur = 0.45 s): a decaying jolt (an explosion, a slam). Opt-in only; nothing while skipping
    shake(amp = 0.04, dur = 0.45) {
      if (skipping() || !(amp > 0)) return;
      SHK.amp = amp; SHK.dur = SHK.t = Math.max(0.05, dur);
    },
    // world point -> shared { x, y, visible } in CSS px of the whole canvas (half: 'right' = through the right half's camera)
    project(v, half) {
      const right = half === 'right' && !!splitE;
      t5.copy(v).project(right ? camR : camera);
      renderer.getSize(size2);
      const lv = splitE ? lastLW || Math.round(size2.x * SPL.ratio) - 2 : size2.x, x0 = right ? lv + 4 : 0, w = right ? size2.x - x0 : lv;
      PROJ.x = x0 + (t5.x + 1) / 2 * w; PROJ.y = (1 - t5.y) / 2 * size2.y;
      PROJ.visible = t5.z < 1 && t5.z > -1 && Math.abs(t5.x) <= 1 && Math.abs(t5.y) <= 1;
      return PROJ;
    },
  };

  // aim a camera at a point; near-vertical views take their "up" from the subject so top-downs stay stable
  function aimCam(c, look, up) {
    t3.subVectors(look, c.position).normalize();
    const k = smooth((Math.abs(t3.y) - 0.93) / 0.065);
    c.up.set(up.x * k, 1 - k, up.z * k).normalize();
    c.lookAt(look);
  }

  // ------------------------------------------------------------ split screen + time-lapse
  // world.split({ left: { set, shot | cam, env }, right: { set, shot | cam, env }, ratio = 0.5 }, { slide, dur = 0.6 })
  // Both halves are live sets with live actors and their own moving shots (cam.shot({..., half: 'right'}) recuts
  // the right). Called again while split, it recuts whichever halves it names (right.set is then optional).
  // world.split(null, { slide, keep = 'left' | 'right', dur = 0.6 }) closes it: the kept half widens to fill the frame
  // (keep: 'right' makes the right half's set the current one, shot and all).
  const SPL = { ratio: 0.5, mode: '', t: 0, dur: 0.6, keep: 'left', res: null };
  function split(spec, o = {}) {
    if (!spec) {
      if (!splitE) return Promise.resolve();
      settle(SPL, 'res');
      SPL.keep = o.keep === 'right' ? 'right' : 'left';
      if (o.slide && !skipping()) { SPL.mode = 'close'; SPL.t = 0; SPL.dur = o.dur ?? 0.6; return new Promise((r) => { SPL.res = r; }); }
      SPL.mode = ''; endSplit(); return Promise.resolve();
    }
    const L = spec.left, R = spec.right || {}, was = !!splitE;
    if (L && L.set && (!cur || L.set !== cur.id)) showE(ensure(L.set));
    const rid = R.set || (splitE && splitE.id);
    if (!rid) { testLog('world.split: right.set is required'); return Promise.resolve(); }
    const re = ensure(rid);
    if (re !== splitE) { endShotExtras(RR); RR.on = false; splitE = re; }
    if (L && L.env) envSet(cur, L.env, 0);
    if (R.env) envSet(splitE, R.env, 0);
    if (spec.ratio) SPL.ratio = clamp(spec.ratio, 0.2, 0.8); else if (!was) SPL.ratio = 0.5;
    if (!was || SPL.mode === 'close') {
      settle(SPL, 'res');
      SPL.mode = !was && o.slide && !skipping() ? 'open' : ''; SPL.t = 0; SPL.dur = o.dur ?? 0.6; SPL.keep = 'left';
    }
    const ls = L && (L.shot ?? L.cam), rs = R.shot ?? R.cam;
    if (ls) shotInto(RM, typeof ls === 'string' ? { shot: 'SET', cam: ls } : ls);
    if (rs || !RR.on) shotInto(RR, typeof rs === 'string' ? { shot: 'SET', cam: rs } : rs || { shot: 'WIDE' });
    return Promise.resolve();
  }
  function copyShot(d, s) {
    for (const k in s) {
      const v = s[k];
      if (v && v.isVector3) d[k].copy(v);
      else if (k === 'start' || k === 'end') copyCam(d[k], v);
      else if (k === 'fo') Object.assign(d.fo, v);
      else if (k === 'st') { d.st.base.copy(v.base); d.st.pushT = v.pushT; }
      else d[k] = v;
    }
  }
  function endSplit() {
    if (!splitE) return;
    const e = splitE;
    if (SPL.keep === 'right') {           // the right half becomes the world: its set, its actors, its shot
      endShotExtras(RM);
      copyShot(S, SR); copyCam(cs, csR); copyCam(cp, cpR);
      RM.on = RR.on; RM.near = RR.near; RM.jarvis = RR.jarvis; RR.jarvis = null; RM.name = C.name = RR.name;
      const a = RM.spot, b = RR.spot; a.c.copy(b.c); a.i = b.i; a.a = b.a; a.p.copy(b.p); a.t.copy(b.t);
      if (RM.on) C.cutscene = true;
      splitE = null;
      if (e !== cur) { showE(e); ambience(e); trim(); }
      snap = true;
    } else { endShotExtras(RR); splitE = null; }
    RR.on = false; SPL.keep = 'left'; SPL.mode = '';
  }
  function leftWidth(w) {                 // px of the canvas the left (main) half covers, slides included
    if (!splitE) return w;
    const r = SPL.ratio;
    if (!SPL.mode) return Math.round(w * r);
    const k = smooth(SPL.t / SPL.dur);
    if (SPL.mode === 'open') return Math.round(w * (1 + (r - 1) * k));
    return Math.round(w * (SPL.keep === 'right' ? r * (1 - k) : r + (1 - r) * k));
  }
  const TL = { on: false, e: null, t: 0, dur: 8, cycles: 3, a: envNew(), b: envNew(), keys: [], ki: 0, res: null, wasLocked: false };
  function fireKey(kk) {
    try {
      if (kk.do) kk.do();
      else if (kk.steps && typeof runSteps === 'function') runSteps(kk.steps);
    } catch (err) { console.error('TWO timelapse key', err); }
  }
  function timelapse(o = {}) {
    const e = cur;
    if (!e) return Promise.resolve();
    if (TL.on) tlAbort();                // a running one stops first (before its keys and envs are overwritten)
    const pre = (p) => (typeof p === 'string' ? e.def.env && e.def.env[p] : p) || {};
    const fn = typeof o.from === 'string' ? o.from : 'day', tn = typeof o.to === 'string' ? o.to : 'night';
    envFill(envCopy(TL.a, e.env), pre(o.from ?? 'day'), fn, e);
    envFill(envCopy(TL.b, TL.a), pre(o.to ?? 'night'), tn, e);
    TL.keys = (o.keys || []).slice().sort((x, y) => x.t - y.t); TL.ki = 0; TL.t = 0;
    TL.dur = o.dur || 8; TL.cycles = o.cycles || 3;
    if (skipping()) { for (const kk of TL.keys) fireKey(kk); envCopy(e.env, TL.a); envApply(e, e.env); return Promise.resolve(); }
    TL.wasLocked = locked; locked = true; TL.on = true; TL.e = e;
    return new Promise((r) => { TL.res = r; });
  }
  function tlTick(dt) {
    const e = cur;
    if (e !== TL.e) { tlAbort(); return; }   // the set changed under it
    TL.t = skipping() ? TL.dur : TL.t + dt;  // a skip lands it at once (keys fired, env where it ends)
    envLerp(e.env, TL.a, TL.b, 0.5 - 0.5 * Math.cos(TAU * TL.cycles * Math.min(1, TL.t / TL.dur)));
    envApply(e, e.env);
    while (TL.ki < TL.keys.length && (TL.keys[TL.ki].t <= TL.t || TL.t >= TL.dur)) fireKey(TL.keys[TL.ki++]);
    if (TL.t >= TL.dur) { TL.on = false; TL.e = null; locked = TL.wasLocked; settle(TL, 'res'); }
  }
  // a time-lapse cut short by a scene change (flow:stop) or another set: no more keys (they are the old scene's), its set
  // left at the env it would have ended on, the camera unlocked (flow.stop unlocks it too), the promise settled
  function tlAbort() {
    const e = TL.e;
    TL.on = false; TL.e = null; TL.ki = TL.keys.length; locked = false;   // (never TL.wasLocked: a restart would inherit its own lock)
    if (e && live.get(e.id) === e) { envCopy(e.env, TL.a); envApply(e, e.env); }
    settle(TL, 'res');
  }
  on('flow:stop', () => { if (TL.on) tlAbort(); });

  // ------------------------------------------------------------ update + render
  function shown(a) { return a.set === cur || (a.set === splitE && splitE); }
  function setTick(e, dt) {
    const x = e.ctx;
    x.t = clock.t; x.player = P.actor; x.running = P.running; x.env = e.envName;
    if (e.def.update) e.def.update(dt, x);
    if (e.rain && e.rain.visible) e.rain.uniforms.uTime.value += dt;
    puffTick(e, dt);
  }
  function update(dt) {
    const e = cur;
    if (!e) return;
    if (typeof state !== 'undefined' && state && state.scene !== sceneSeen) { sceneSeen = state.scene; sceneN++; ageOut(); }
    const sp = splitE && splitE !== e ? splitE : null;
    e.used = sceneN; if (sp) sp.used = sceneN;
    envTick(e, dt);
    if (sp) envTick(sp, dt);
    if (TL.on) tlTick(dt);
    for (let i = 0; i < A.length; i++) { const a = A[i]; if (shown(a)) { a.prev.copy(a.pos); a.prevRot = a.rotY; } }
    playerTick(dt);
    followerTick(dt);
    for (let i = 0; i < A.length; i++) if (shown(A[i])) actorTick(A[i], dt);
    setTick(e, dt);
    if (sp) setTick(sp, dt);
    torchTick(e);
    camTick(dt);
    if (SPL.mode && (SPL.t += dt) >= SPL.dur) { const m = SPL.mode; SPL.mode = ''; if (m === 'close') endSplit(); settle(SPL, 'res'); }
  }
  function shakeInto(p, l) {              // deterministic decaying jolt (no allocation)
    const k = SHK.amp * smooth(SHK.t / SHK.dur), T = clock.t;
    p.x += k * Math.sin(T * 53.7); p.y += k * Math.sin(T * 47.1 + 1.7); p.z += k * Math.sin(T * 59.3 + 4.1);
    l.x += k * 0.6 * Math.sin(T * 41.3 + 0.5); l.y += k * 0.6 * Math.sin(T * 37.9 + 2.9);
  }
  let blurOn = false;
  function setBlur(on) {                  // WHIP: the canvas is blurred for the 0.2 s of the pan (a style flip, not per frame)
    blurOn = on;
    renderer.domElement.style.filter = on && W.whipBlur > 0 ? 'blur(' + W.whipBlur + 'px)' : '';
  }
  const lookI = V(), lookR = V(), UPZ = V().set(0, 0, -1);
  // idle(): a frame with nothing drawn (an opaque full-screen mini-game card covers the world): staged prebuilds go on
  function idle() { if (pbQ.length) pbStep(); }
  function render(alpha) {
    const e = cur;
    if (!e) return;
    if (pbQ.length) pbStep();             // a staged prebuild: one stage per rendered frame
    // a set's own render hook: def.render(alpha) moves its tick-driven props between the last two ticks (scooters, cars)
    const sp0 = splitE && splitE !== e ? splitE : null;
    if (e.def.render) try { e.def.render(alpha); } catch (err) { console.error('TWO: ' + e.id + '.render', err); e.def.render = null; }
    if (sp0 && sp0.def.render) try { sp0.def.render(alpha); } catch (err) { console.error('TWO: ' + sp0.id + '.render', err); sp0.def.render = null; }
    renderer.getSize(size2);
    const w = size2.x, h = size2.y, dtA = alpha * CONFIG.step;
    for (let i = 0; i < A.length; i++) {   // interpolate between the last two ticks, pose once per frame
      const a = A[i];
      if (!shown(a)) continue;
      a.keep.copy(a.pos); a.pos.lerpVectors(a.prev, a.keep, alpha);
      a.root.rotation.y = a.prevRot + angTo(a.prevRot, a.rotY) * alpha;
      if (a.root.visible) a.rig.pose(a.poseName || 'idle', a.poseT + dtA, a.p);
      a.placed = false;
    }
    const sp = splitE, lw = leftWidth(w), lv = sp ? Math.max(0, lw - 2) : w;   // a thin black divide between the halves
    if (snap) copyCam(cp, cs);           // a cut since the last tick: never draw a frame in between the two shots
    camera.position.lerpVectors(cp.pos, cs.pos, alpha);
    lookI.lerpVectors(cp.look, cs.look, alpha);
    if (SHK.t > 0) shakeInto(camera.position, lookI);
    aimCam(camera, lookI, RM.on ? S.up : UPZ);
    if (RM.on && S.roll) camera.rotateZ(S.roll);
    // narrow screens (and narrow halves): widen the lens to keep the 16:9 horizontal field (shots up to 140°, play 100°)
    const fov = fitFov(cp.fov + (cs.fov - cp.fov) * alpha, lv / h, REF * lv / w, RM.on ? 140 : 100), near = RM.on ? RM.near : 0.05;
    if (camera.fov !== fov || camera.near !== near || lv !== lastLW || h !== lastH) { camera.fov = fov; camera.near = near; camera.aspect = Math.max(1, lv) / h; camera.updateProjectionMatrix(); }
    const blur = !skipping() && ((RM.on && S.move === 'whip') || (!!sp && RR.on && SR.move === 'whip'));
    if (blur !== blurOn) setBlur(blur);
    if (!sp) {
      renderer.render(e.scene, camera);
    } else {
      renderer.setScissorTest(false); renderer.setClearColor(0x000000, 1); renderer.clear();
      renderer.setScissorTest(true);
      if (lv > 1) { renderer.setViewport(0, 0, lv, h); renderer.setScissor(0, 0, lv, h); renderer.render(e.scene, camera); }
      const rx = lw + 2, rw = w - rx;
      if (rw > 1) {
        if (RR.snap) copyCam(cpR, csR);
        camR.position.lerpVectors(cpR.pos, csR.pos, alpha);
        lookR.lerpVectors(cpR.look, csR.look, alpha);
        aimCam(camR, lookR, RR.on ? SR.up : UPZ);
        if (RR.on && SR.roll) camR.rotateZ(SR.roll);
        const fr = fitFov(cpR.fov + (csR.fov - cpR.fov) * alpha, rw / h, REF * rw / w, 140), nr = RR.on ? RR.near : 0.05, ar = rw / h;
        if (camR.fov !== fr || camR.near !== nr || camR.aspect !== ar) { camR.fov = fr; camR.near = nr; camR.aspect = ar; camR.updateProjectionMatrix(); }
        renderer.setViewport(rx, 0, rw, h); renderer.setScissor(rx, 0, rw, h);
        renderer.render(sp.scene, camR);
      }
      renderer.setScissorTest(false); renderer.setViewport(0, 0, w, h);
    }
    lastLW = lv; lastW = w; lastH = h;
    if (typeof AUDIO !== 'undefined' && AUDIO.listener) AUDIO.listener(camera);   // after the render: matrixWorld is current
    for (let i = 0; i < A.length; i++) if (shown(A[i])) A[i].pos.copy(A[i].keep);
  }

  // ------------------------------------------------------------ systems helpers (drones, AI): no allocation if you pass `out`
  const RV = V();
  function segBox(x0, z0, x1, z1, b, pad) {   // does the segment cross the (padded) box? (slab test)
    let t0 = 0, t1 = 1;
    const dx = x1 - x0, dz = z1 - z0;
    if (Math.abs(dx) < 1e-9) { if (x0 < b[0] - pad || x0 > b[2] + pad) return false; }
    else { let ta = (b[0] - pad - x0) / dx, tb = (b[2] + pad - x0) / dx; if (ta > tb) { const t = ta; ta = tb; tb = t; } if (ta > t0) t0 = ta; if (tb < t1) t1 = tb; if (t0 > t1) return false; }
    if (Math.abs(dz) < 1e-9) { if (z0 < b[1] - pad || z0 > b[3] + pad) return false; }
    else { let ta = (b[1] - pad - z0) / dz, tb = (b[3] + pad - z0) / dz; if (ta > tb) { const t = ta; ta = tb; tb = t; } if (ta > t0) t0 = ta; if (tb < t1) t1 = tb; if (t0 > t1) return false; }
    return true;
  }

  function lineClearIn(e, x0, z0, x1, z1, pad = 0) {
    const cl = e && e.def.colliders;
    if (cl) for (let i = 0; i < cl.length; i++) if (segBox(x0, z0, x1, z1, cl[i], pad)) return false;
    return true;
  }

  // ------------------------------------------------------------ world
  const NOCOL = [];
  const W = {
    set: null, setId: null, actors, torchAuto: true, camera,
    liveMax: 3,                     // live sets kept (spec §16: at most three; a split + the next scene's prebuild fit)
    fitNarrow: true,                // widen the FOV on screens narrower than 16:9 (compositions survive phones)
    whipBlur: 1.6,                  // px of canvas blur during a WHIP (0 = none)
    get torch() { return cur ? cur.spot : null; },
    get envName() { return cur ? cur.envName : ''; },   // the current set's env preset name (the last one set by name)
    get raining() { return !!cur && cur.env.rain > 0; },   // the current env rains (its rain bed and particles are on)
    get scene() { return cur ? cur.scene : null; },
    get splitId() { return splitE ? splitE.id : null; },
    get liveIds() { return [...live.keys()]; },          // debug/tests: live sets, oldest first (+ staged prebuilds)
    get pendingIds() { return [...pending.keys()]; },
    get colliders() { return (cur && cur.def.colliders) || NOCOL; },   // the current set's [[x0, z0, x1, z1], …] (live)
    async load(id, o = {}) {
      const e = ensure(id);
      if (o.env) envSet(e, o.env, 0);
      showE(e);
      trim();
    },
    preload(id) { ensure(id); return Promise.resolve(); },   // synchronous build: under black only (prebuild spreads it out)
    prebuild(id) {
      if (!SETS[id]) { testLog('world.prebuild: no SETS.' + id); return Promise.resolve(); }
      const e = live.get(id);
      if (e) { e.used = Math.max(e.used, sceneN + 1); return Promise.resolve(); }
      const pb = pending.get(id);
      if (pb) return pb.p;
      if (skipping()) { ensure(id).used = sceneN + 1; return Promise.resolve(); }
      const n = { id, e: null, stage: 0, res: null, p: null };
      n.p = new Promise((r) => { n.res = r; });
      pending.set(id, n); pbQ.push(n);
      return n.p;
    },
    adopt(look, rig) { (pool[look] ||= []).push(rig); (rigs[look] ||= []).push(rig); },   // boot's warmed rigs: the first spawn of each look builds nothing
    pool,                              // read-only: look -> the rigs waiting in the pool (not on any actor now)
    rigsOf: (look) => rigs[look] || NONE_R,   // every rig built for a look (boot's and any built since), pooled or in use
    show(id) { showE(ensure(id)); trim(); },
    warm(id) {
      const had = live.get(id), e = had || build(id), hidden = [];
      e.scene.traverse((o) => { if (!o.visible) { hidden.push(o); o.visible = true; } });   // compile what appears later too
      const sh = blobShadow(); e.scene.add(sh);
      box3.setFromObject(e.group); box3.getCenter(t1); box3.getSize(t2);
      camera.position.set(t1.x + t2.x * 0.3, t1.y + t2.y + 2, t1.z + t2.z * 0.6); camera.lookAt(t1);
      camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
      upload(e);
      renderer.render(e.scene, camera);     // under the loader
      e.scene.remove(sh);
      for (const o of hidden) o.visible = false;
      if (!had) disposeGeo(e);
      snap = true; lastLW = 0;
    },
    env(p, dur = 0, setId) { return envSet(setId ? live.get(setId) : cur, p, dur); },
    spawn,
    despawn(id) { const a = actors.get(id); if (a) despawnA(a); },
    actor: (id) => actors.get(id),
    talk(id, on) {
      const a = actors.get(id);
      if (a) {
        a.rig.talk(on);
        if (on && a.habit === 'glance' && a.anim === 'idle' && !a.mv.on && !a.playRes) glance(a);   // he checks on Chase before he speaks
        return;
      }
      const c = CHARACTERS[id];
      if (c && c.voice && c.voice.also) for (const part of id.split('_')) if (actors.has(part)) actors.get(part).rig.talk(on);
    },
    // props/anchors/marks: the current set, or a named live set (reddy26 and reddy40 share names)
    prop(name, setId) {
      if (setId) { const e = live.get(setId); return e ? e.props[name] : undefined; }
      if (cur && cur.props[name]) return cur.props[name];
      for (const e of live.values()) if (e.props[name]) return e.props[name];
      return undefined;
    },
    anchor: (name, setId) => { const e = setId ? live.get(setId) : cur; return e && e.anchors[name]; },
    mark: (name, setId) => { const e = setId ? live.get(setId) : cur; return e && e.def.marks && e.def.marks[name]; },
    // world.puff(where, {n, color, speed, life, gravity}) — pooled smoke (default) or sparks ({color: 0xffd060, gravity: 6})
    puff(where, o = {}) {
      const e = cur;
      if (!e || skipping()) return;
      const pr = typeof where === 'string' && e.props[where];
      if (pr) pr.getWorldPosition(t1); else resolveWhere(where, t1, e);
      const pz = e.puff, u = pz.userData, pa = pz.geometry.attributes.position.array, ca = pz.geometry.attributes.color.array;
      tc.set(o.color ?? 0xb8b8b8);
      const n = o.n ?? 14, sp = o.speed ?? 0.6, life = o.life ?? 1.2, g = o.gravity ?? -0.5;
      for (let i = 0; i < n; i++) {
        const j = u.next; u.next = (j + 1) % PUFF;
        pa[j * 3] = t1.x + (Math.random() - 0.5) * 0.08; pa[j * 3 + 1] = t1.y + (Math.random() - 0.5) * 0.08; pa[j * 3 + 2] = t1.z + (Math.random() - 0.5) * 0.08;
        t2.set(Math.random() - 0.5, Math.random() * 0.8, Math.random() - 0.5).normalize().multiplyScalar(sp * (0.5 + Math.random()));
        u.vel[j * 3] = t2.x; u.vel[j * 3 + 1] = t2.y; u.vel[j * 3 + 2] = t2.z;
        u.life[j] = u.max[j] = life * (0.7 + Math.random() * 0.6); u.g[j] = g;
        ca[j * 4] = tc.r; ca[j * 4 + 1] = tc.g; ca[j * 4 + 2] = tc.b; ca[j * 4 + 3] = 0.85;
      }
      pz.visible = true;
    },
    // --- for systems (drones, AI); cheap enough per tick ---
    actorsIn(x, z, r, out) {        // visible actors in the current set within r m of (x, z) -> out (cleared; pass your own array)
      out = out || [];
      out.length = 0;
      for (let i = 0; i < A.length; i++) {
        const a = A[i];
        if (a.set !== cur || !a.root.visible) continue;
        const dx = a.pos.x - x, dz = a.pos.z - z;
        if (dx * dx + dz * dz <= r * r) out.push(a);
      }
      return out;
    },
    collide(a, x, z) {              // move actor a (or id) to x, z pushed out of colliders and other actors -> a.pos
      const o = typeof a === 'string' ? actors.get(a) : a;
      if (!o || !o.set) return null;
      collide(o, x, z, o.set, true);
      return o.pos;
    },
    resolve(x, z, r = CONFIG.radius, out = RV) {   // a circle at x, z pushed out of the current set's colliders -> out (x, floor, z)
      const cl = cur && cur.def.colliders;
      if (cl) for (let it = 0; it < 2; it++) for (let i = 0; i < cl.length; i++) {
        const b = cl[i], cx = clamp(x, b[0], b[2]), cz = clamp(z, b[1], b[3]), dx = x - cx, dz = z - cz, d2 = dx * dx + dz * dz;
        if (d2 >= r * r) continue;
        if (d2 > 1e-8) { const d = Math.sqrt(d2), k = (r - d) / d; x += dx * k; z += dz * k; }
        else { const l = x - b[0], rr = b[2] - x, t = z - b[1], bo = b[3] - z, m = Math.min(l, rr, t, bo); if (m === l) x = b[0] - r; else if (m === rr) x = b[2] + r; else if (m === t) z = b[1] - r; else z = b[3] + r; }
      }
      return out.set(x, floorAt(cur, x, z, 0), z);
    },
    lineClear: (x0, z0, x1, z1, pad = 0) => lineClearIn(cur, x0, z0, x1, z1, pad),   // no collider box (full height: colliders have none) crosses the segment
    floorAt: (x, z) => floorAt(cur, x, z, 0),
    update, render, idle, split, timelapse,
  };

  return { world: W, cam: C, frame: frameFn, player: P };
})();
