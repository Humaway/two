// ============================================================ SYSTEMS (TWO)
// The roam gameplay of spec §9 / §13 that isn't a mini-game (ARCHITECTURE §5): Courtesy Drones (patrol -> curious ->
// escort, scan cones on the floor, lures, static zaps), drone stealth with zone checkpoints and the Safe Room (13.7),
// Chase (2040)'s Chip View with world-anchored AR, Cloud+ ads and the Signal meter (13.5), Luka's strength holds and
// the two-person switches ("Hold this", §9 'it takes two').
// Built and warmed at boot (DRONES.warm, called by 99-main), pooled, and ticked by one updater with no per-tick
// allocation. Cleanup: everything clears on flow:stop (scene change, Quit to Title); drones, cones and AR belong to the
// set they were made in and go when the world shows another set. Cutscene-safe: every call finishes at once while
// flow.skipping. Autoplay: strengthHold / pairSwitch complete themselves under TEST.auto, chip.peek() is the scripted
// Chip View, and drones never escalate past curious under autoplay unless a test asks (stealth.begin({ autoCapture })).
// Hooks into other files (no edits there): world.render is wrapped at load (drones interpolate before the world draws;
// AR projects and the Safe Room draws after it), an addUpdate ticker, and the bus: flow:stop, swap, signal:full.
//
// ---- chip: Chip View + Signal ---------------------------------------------------------------------------------
//   Live only while state.active === 'chase40' in a roam (not busy, not a cutscene), chip.allowed and not forced off.
//   Hold CHIP (Q / LB / the CHIP button; a press latches with options.holdToPress): ui.chipView tint + scanlines, AR
//   visible, the Cloud+ ads placed in view, his chip light on, and chip.signal fills (chip.rate per second, 1/6 = ~6 s;
//   chip.hot = [{ at: [x, z] | box: [x0, z0, x1, z1], r, mul }] fills faster near checkpoints). Release: drains
//   (chip.drainRate). Full: emit('signal:full', { who: 'chase40' }) -> with stealth on, stealth.softFail (every drone in
//   the zone turns to him, the Safe Room, retry); without, DRONES.alert. Fields: chip.allowed, chip.forced, chip.on,
//   chip.signal, chip.full, chip.rate, chip.drainRate, chip.hot (all reset per scene).
//   chip.forceOff(on = true, msg)  scenes that need the chip off: CHIP only shows a toast; his light goes dark
//   chip.lightOn(on | null)        his chip-light attachment (null: back to the story default, dark once flags.chip_off)
//   chip.show(on, { ads = true })  cosmetic Chip View for cutscenes / POV shots / mini-games (no Signal); skip-safe;
//                                  ads: false places no Cloud+ ads (a scripted Chip View POV)
//   chip.peek(sec = 1.5) -> Promise  scripted Chip View for sec (fills the Signal like a hold): autoplay's CHIP
//   chip.reset()                   Signal back to 0
// ---- AR: world-anchored labels, visible only in Chip View (pooled DOM layer #ar over the tint, projected per frame) ---
//   AR.add({ id?, kind = 'sign', text, title?, at: where | on: actorId | prop: name, oy, w, color, size = 1, maxD }) -> id
//     w: width in metres in the world (it stays that wide, within readable limits; px when >= 40); color: CSS or 0xRRGGBB.
//     kinds: sign · price · name (a badge over a head: on: id) · code · tag · ad (text 'TITLE · line · line') · thought ·
//     popup (SafeSense glass) · path ({ points | path: [[x, z] | [x, y, z], ...] | the name of one of the set's `paths`,
//     or arc: { c: [x, z], r, a0, a1 } (yaw radians), loop, w }: a crawling dashed floor polyline, drawn in 3-D; every
//     drone with a path shows its patrol route as 'path:<droneId>' automatically).
//   AR.set(id, { text, title, at, on, oy }) · AR.remove(id) · AR.clear() · AR.show(true | false | null) (null = follow
//   Chip View) · AR.visible. A `where` is a mark, actor id, anchor, prop name, [x, z] or [x, y, z].
// ---- DRONES: Courtesy Drones (art: buildDrone(kind); a plain pod stands in when it is missing) -----------------
//   DRONES.spawn(id, { path: [[x, z], ...], loop, speed = 1, pause = 0.5, at, face, hover = 1.55, kind = 'courtesy',
//     cone: { len = 3.2, half = 0.42 } | false, sweep (deg, a parked drone scanning side to side), sweepPeriod = 5,
//     showPath = true, ai = true }) -> drone { id, kind, obj, x, z, yaw, st }. A path patrols (loops with 3+ points,
//     ping-pongs with 2); no path = parked at `at` facing `face` (radians or a where).
//   States: patrol (blue cone) -> curious (amber, turns to whoever stands in the cone, '?' chirp) -> escort (red, glides
//     to them; the hug -> stealth.capture). Out of the cone for stealth.forgetAfter (2 s) while amber: back to patrol.
//     Escort needs stealth.active. Cones are clipped by the set's colliders and DRONES.cover boxes (cover blocks sight).
//   DRONES.get(id) · remove(id) · clear() · all (live list) · reset() (spawn state; retry) · pause(on) · calm()
//   DRONES.lure(at, sampleId, { r, dur, line, over, y, disc = 0.6, transfixed }) -> thenable { n, ids, done }: drones within
//     SAMPLES[id].lure.r go and investigate for lure.dur, then return ('laugh' gets DRONES.lines.laugh). They hover a
//     metre short of it (over: right above it; y: at that height while investigating) and, transfixed, their cone
//     collapses to a disc of radius `disc` (false keeps the cone) lying on the lure's surface when `at` is [x, y, z]
//     (it pulls in, then opens: never a wide fan; nobody is spotted while it changes). transfixed: true = a lured drone
//     spots nobody at all until it leaves the lure.
//     DRONES.lureMenu(at, { fallback, test, ...lure options }) -> Promise<sampleId | null>: Chase picks from
//     state.samples (fallback ['radio']) and plays it there.
//   DRONES.alert(who) (curious at him) · turn(who) (red, facing him) · goTo(id, at, { speed, then, y }) -> Promise (y: the
//     hover height it arrives at, eased over the flight; it keeps it) ·
//     face(id, where) · release(id) (back to its patrol) · light(id, state) · inCone(id, actorId) -> bool ·
//     cover(id, [x0, z0, x1, z1] | null) (a live array: move it and the cones follow) · walls (false: colliders don't
//     block cones) · zap(droneId, actorId, { line }) -> Promise (1.6's static discharge: sparks, smoke, white flash) ·
//     claw(id, k = 1, dur = 0.4) (the noise drone's claw: 0 closed .. 1 open). Cones read the set's colliders live every
//     tick, so boxes a set moves, adds or removes at runtime (a pushed rack, a bin, a door) block or unblock sight.
//   DRONES.lines = { escort, laugh } (drone barks; null silences one) · DRONES.warm(warmObject) (boot)
// ---- stealth: capture -> Safe Room -> retry at the last checkpoint with drones reset ----------------------------
//   stealth.begin({ checkpoints: [{ id, box: [x0, z0, x1, z1] | zone: camName, at: where | { luka: where, ... } }],
//     onCapture(who), onRetry(key), variant: 'room' | 'quiet', safeRoom: false (just fade and retry), targets: [ids],
//     escortAfter = 1.4, forgetAfter = 2, escortSpeed = 3.6, zoneR = 16, autoCapture }) · stealth.end({ calm = true })
//   Without checkpoints the party's positions are saved whenever the player enters a new set zone (its camera): retry
//   puts them back where they came into it. stealth.capture(who, o) -> Promise · stealth.softFail(who) -> Promise
//   (every drone in the zone turns red to him first) · stealth.checkpoint() (save here now) · active, busy, captures.
//   Events: stealth:capture (who), stealth:retry (checkpoint key), stealth:checkpoint (key).
// ---- safeRoom(o) -> Promise: the fail state (13.7), its own tiny scene drawn full-screen; the current set stays loaded --
//   { variant: 'room' (padded white room, beanbag, kettle, YOU ARE SAFE NOW, a drone in the corner) | 'quiet' (3.1's
//   Quiet Corner: a beanbag behind a partition; when the current set has its own corner, marks quiet_beanbag +
//   quiet_drone and anchor quiet_corner (hq_atrium), that is used instead), who = state.active (sits), onRetry() }.
//   DRONE: "You are not in trouble. ^ You are in danger." -> SafeSense [YES] -> onRetry under the fade. About 4 s + YES.
// ---- strengthHold(o) -> thenable handle { k, full, held, done, cancel() } (resolves true when lifted) ---------------
//   { who = 'luka', label = 'Lift', dur = 1.6, keep (stays up only while held: the roller door), at (face it), anim,
//   onProgress(k), onFull(), onRelease(full), autoHold }. Hold YES; ui.meter strains; letting go rewinds; a tap or NO
//   gives up (false). Call it from a hotspot's do.
// ---- pairSwitch(o) -> thenable handle { id, done, end(), auto() }: two-person switches (L12 shelves, L21 valves) -------
//   { id, ends: [{ id, at, r, stand }, { ... }] (or scene hotspots { id, at, pair: id } are adopted), label = 'Turn',
//   who: [ids], hold = 0.5 (both held this long), keep, onDone(), onChange(n) }. At an end, YES: "Hold this" sends the
//   nearest partner there to hold it (he stays: player.wait); with nobody near the player holds it himself and can SWAP
//   away (he keeps holding); YES at the other end while one is held does it. YES at a held end lets go.
//   pairSwitch.get(id) · pairSwitch.clear()

const { chip, AR, DRONES, stealth, safeRoom, strengthHold, pairSwitch } = (() => {
  const PI = Math.PI, TAU = PI * 2, H = PI / 2;
  const V = () => new THREE.Vector3();
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const angTo = (a, b) => { let d = (b - a) % TAU; if (d > PI) d -= TAU; else if (d < -PI) d += TAU; return d; };
  const smooth = (u) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
  const skipping = () => flow.skipping === true;
  const log = (m) => testLog(m);
  const snd = (n, at, vol) => { if (!skipping() && typeof sfx === 'function') sfx(n, { at, vol }); };
  const barkD = (text) => (text && !skipping() && typeof bark === 'function' ? bark('drone', text) : null);
  const barkClear = () => { if (typeof bark === 'function' && bark.clear) bark.clear(); };
  const PARTY = ['luka', 'chase', 'chase40'];
  const t1 = V(), t2 = V(), t3 = V();
  let gen = 0;                                   // bumped on flow:stop: stale async runs stop
  const anim = (list) => { for (let i = 0; i < list.length; i++) if (ANIMS[list[i]]) return list[i]; return 'idle'; };
  const num = (y) => (typeof y === 'number' && y === y ? y : 0);
  const floorY = (x, z) => {
    if (typeof world.floorAt === 'function') return num(world.floorAt(x, z));
    const s = world.set; return s && s.floor ? num(s.floor(x, z)) : 0;
  };
  // an actor that is on screen in the current set (not hidden, not away in the Safe Room)
  const here = (a) => !!a && a.root.visible && !!world.scene && a.root.parent === world.scene;
  const inBox = (b, x, z) => x >= b[0] && x <= b[2] && z >= b[1] && z <= b[3];
  function zoneAt(x, z) { const zs = world.set && world.set.zones; if (zs) for (let i = 0; i < zs.length; i++) if (inBox(zs[i].box, x, z)) return zs[i].cam; return ''; }
  // "Hold this": park a party member where he stands (TWO's world: player.wait; Rue's flow: holdPos)
  const waitPos = (id, on) => { if (typeof player.wait === 'function') player.wait(id, on); else if (typeof flow.holdPos === 'function') flow.holdPos(id, on); };

  // a where -> out (Vector3); false when unknown. whereRot = its facing when it has one (marks, [x, y, z, rotY], actors)
  let whereRot = NaN;
  function whereInto(w, out) {
    whereRot = NaN;
    if (w == null) return false;
    if (w.isVector3) { out.copy(w); return true; }
    if (Array.isArray(w)) {
      if (w.length === 2) out.set(w[0], floorY(w[0], w[1]), w[1]);
      else { out.set(w[0], w[1], w[2]); if (w.length > 3) whereRot = w[3]; }
      return true;
    }
    if (typeof w !== 'string') return false;
    const a = world.actor(w); if (a) { out.copy(a.pos); whereRot = a.rotY; return true; }
    const m = world.mark(w); if (m) { out.set(m[0], m[1] || 0, m[2]); if (m[3] != null) whereRot = m[3]; return true; }
    const an = world.anchor(w); if (an) { out.copy(an.at); return true; }
    const p = world.prop(w); if (p) { p.getWorldPosition(out); return true; }
    return false;
  }
  const tex = (key, w, h, paint, o) => { const t = canvasTex(w, h, paint, Object.assign({ key }, o)); t.magFilter = THREE.NearestFilter; return t; };

  // ============================================================ AR
  const CSS = `
#ar { position: absolute; inset: 0; z-index: 4; pointer-events: none; overflow: hidden; visibility: hidden; }
#ar.on { visibility: visible; }
#ar .arl { position: absolute; left: 0; top: 0; transform-origin: 50% 100%; white-space: pre; text-align: center; will-change: transform;
  font: bold 12px/1.3 var(--sys); letter-spacing: .08em; color: #e4f5ff; padding: 4px 9px; border-radius: 3px;
  background: rgba(30,110,210,.24); border: 1px solid rgba(143,208,255,.85);
  box-shadow: 0 0 12px rgba(95,178,255,.45), inset 0 0 8px rgba(143,208,255,.22); text-shadow: 0 0 6px rgba(120,200,255,.9);
  animation: arflick 3.7s steps(1) infinite; }
#ar.calm .arl { animation: none; }
#ar .arl b { display: block; font-size: 1.2em; letter-spacing: .12em; }
#ar .arl b:empty { display: none; }
#ar .price { color: #fff4b8; background: rgba(90,70,0,.32); border-color: #ffd21f; box-shadow: 0 0 10px rgba(255,210,31,.45); text-shadow: 0 0 6px rgba(255,210,31,.8); }
#ar .name { border-radius: 999px; padding: 2px 11px; font-size: 11px; }
#ar .code { font-family: var(--mono, monospace); color: #b8ffe8; border-color: #5affc8; background: rgba(0,70,55,.36);
  box-shadow: 0 0 12px rgba(90,255,200,.45); text-shadow: 0 0 6px rgba(90,255,200,.9); letter-spacing: .14em; }
#ar .tag { border-radius: 3px 11px 11px 3px; font-size: 11px; padding: 2px 9px; }
#ar .ad { font-size: 12px; padding: 8px 15px 9px; border-radius: 7px; color: #f2eaff;
  background: linear-gradient(160deg, rgba(40,120,230,.5), rgba(150,60,220,.38)); border-color: rgba(225,205,255,.9);
  box-shadow: 0 0 18px rgba(160,120,255,.5); text-shadow: 0 0 8px rgba(200,170,255,.9); }
#ar .ad b { font-size: 1.75em; color: #fff; letter-spacing: .1em; }
#ar .ad::after { content: 'AD'; position: absolute; right: 5px; top: 3px; font-size: 8px; letter-spacing: .1em; opacity: .7; }
#ar .thought { border-radius: 16px; font-weight: normal; font-style: italic; letter-spacing: .03em; background: rgba(255,255,255,.14); }
#ar .popup { color: #22466e; text-shadow: none; background: rgba(250,252,255,.88); border: 1px solid #fff; border-radius: 14px; white-space: pre-wrap;
  box-shadow: 0 0 16px var(--ssglow, rgba(120,190,255,.55)), 0 4px 14px rgba(0,30,80,.25); font-weight: 600; letter-spacing: .02em; padding: 8px 14px; }
#ar .popup b { color: var(--ss, #2f86e0); font-size: 10px; letter-spacing: .16em; margin-bottom: 2px; }
body.saferoom #hud, body.saferoom #swap, body.saferoom #obj, body.saferoom #hack, body.saferoom #signal, body.saferoom #prompt { visibility: hidden; }
body.saferoom #pops > :not(.sr-keep) { visibility: hidden !important; }   /* the scene's own pop-ups (1.6's rules) wait outside the room */
@keyframes arflick { 0%, 46%, 49%, 81%, 84%, 100% { opacity: .96; } 47% { opacity: .5; } 82% { opacity: .78; } }
`;
  const arEl = document.createElement('div'); arEl.id = 'ar';
  { const cv = document.getElementById('chipview'), uiEl = document.getElementById('ui');   // over the tint, under pop-ups
    if (cv && cv.parentNode) cv.parentNode.insertBefore(arEl, cv.nextSibling); else if (uiEl) uiEl.append(arEl);
    const st = document.createElement('style'); st.textContent = CSS; document.head.append(st); }
  const LBL = [], lblFree = [], lblById = new Map(), AR_PXM = 60;   // CSS px per metre of a label's `w` at scale 1
  let arVis = false, arForce = null, arSeq = 0;
  function lblMake() {
    const el = document.createElement('div'), b = document.createElement('b'), s = document.createElement('span');
    el.className = 'arl'; el.style.visibility = 'hidden'; el.append(b, s); arEl.append(el);
    return { el, b, s, id: '', set: null, kind: '', at: V(), on: null, prop: null, oy: 0, maxD: 30, size: 1, wm: 0, x: -1e5, y: -1e5, k: -1, shown: false, auto: false };
  }
  for (let i = 0; i < 16; i++) lblFree.push(lblMake());   // the DOM exists before play
  function lblText(L, text, title) {
    let t = text == null ? '' : String(text), ti = title == null ? '' : String(title);
    if (L.kind === 'ad' && title == null) { const i = t.indexOf(' · '); if (i > 0) { ti = t.slice(0, i); t = t.slice(i + 3).split(' · ').join('\n'); } }
    L.b.textContent = ti; L.s.textContent = t;
  }
  const lblHide = (L) => { if (L.shown) { L.shown = false; L.el.style.visibility = 'hidden'; } };

  // 'path': a dashed floor ribbon (one quad per segment, up to RIB_N), its dashes crawling along the route
  const RIB_N = 64, RIB = [], ribFree = [], ribById = new Map();
  let dashTex = null, ribMat = null;
  function ribMaterial() {
    if (ribMat) return ribMat;
    dashTex = tex('sys_dash', 32, 4, (c, w, h) => { c.clearRect(0, 0, w, h); c.fillStyle = '#ffffff'; c.fillRect(0, 0, 19, h); c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(19, 1, 3, h - 2); }, { repeat: [1, 1] });
    ribMat = new THREE.MeshBasicMaterial({ map: dashTex, color: 0x8fdcff, transparent: true, depthWrite: false, fog: false, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 });
    return ribMat;
  }
  function ribMake() {
    const g = new THREE.BufferGeometry(), idx = new Uint16Array(RIB_N * 6);
    for (let i = 0; i < RIB_N; i++) { const v = i * 4, k = i * 6; idx[k] = v; idx[k + 1] = v + 2; idx[k + 2] = v + 1; idx[k + 3] = v + 1; idx[k + 4] = v + 2; idx[k + 5] = v + 3; }
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(RIB_N * 12), 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(RIB_N * 8), 2).setUsage(THREE.DynamicDrawUsage));
    g.setIndex(new THREE.BufferAttribute(idx, 1));
    const m = new THREE.Mesh(g, ribMaterial());
    m.frustumCulled = false; m.visible = false; m.renderOrder = 2; m.name = 'ar_path';
    return { mesh: m, id: '', set: null };
  }
  function ribFill(r, pts, loop, w = 0.07) {
    const g = r.mesh.geometry, P = g.attributes.position.array, U = g.attributes.uv.array, cnt = pts ? pts.length : 0;
    const segs = Math.min(RIB_N, loop ? cnt : cnt - 1);
    let n = 0, acc = 0;
    for (let i = 0; i < segs; i++) {
      const a = pts[i], b = pts[(i + 1) % cnt], ax = a[0], az = a[a.length > 2 ? 2 : 1], bx = b[0], bz = b[b.length > 2 ? 2 : 1];
      const dx = bx - ax, dz = bz - az, L = Math.hypot(dx, dz);
      if (L < 1e-4) continue;
      const nx = (-dz / L) * w * 0.5, nz = (dx / L) * w * 0.5, ya = floorY(ax, az) + 0.03, yb = floorY(bx, bz) + 0.03, v = n * 12, u = n * 8;
      P[v] = ax + nx; P[v + 1] = ya; P[v + 2] = az + nz; P[v + 3] = ax - nx; P[v + 4] = ya; P[v + 5] = az - nz;
      P[v + 6] = bx + nx; P[v + 7] = yb; P[v + 8] = bz + nz; P[v + 9] = bx - nx; P[v + 10] = yb; P[v + 11] = bz - nz;
      const u0 = acc / 0.5, u1 = (acc + L) / 0.5;   // one dash per half metre
      U[u] = u0; U[u + 1] = 0; U[u + 2] = u0; U[u + 3] = 1; U[u + 4] = u1; U[u + 5] = 0; U[u + 6] = u1; U[u + 7] = 1;
      acc += L; n++;
    }
    g.setDrawRange(0, n * 6);
    g.attributes.position.needsUpdate = true; g.attributes.uv.needsUpdate = true;
  }
  // a path's points: o.points | o.path ([[x, z] | [x, y, z], ...] or the name of one of the set's `paths`) | o.arc
  // ({ c: [x, z], r, a0, a1 }: an arc swept from yaw a0 to a1, the engine's convention: direction (sin a, cos a))
  function pathPts(o) {
    let p = o.points || o.path;
    if (typeof p === 'string') { const ps = world.set && world.set.paths; p = ps && ps[p]; if (!p) console.warn('TWO: AR path: no path ' + (o.points || o.path)); }
    if (!p && o.arc) {
      const a = o.arc, n = 16; p = [];
      for (let i = 0; i <= n; i++) { const t = a.a0 + ((a.a1 - a.a0) * i) / n; p.push([a.c[0] + Math.sin(t) * a.r, a.c[1] + Math.cos(t) * a.r]); }
    }
    return p || null;
  }
  function ribDrop(r) {
    if (r.mesh.parent) r.mesh.parent.remove(r.mesh);
    r.mesh.visible = false; ribById.delete(r.id); r.id = ''; r.set = null;
    const i = RIB.indexOf(r); if (i >= 0) RIB.splice(i, 1);
    ribFree.push(r);
  }

  const AR = {
    add(o = {}) {
      const id = o.id || 'ar' + ++arSeq, kind = o.kind || 'sign';
      AR.remove(id);
      if (kind === 'path') {
        if (!world.scene) return id;
        const r = ribFree.pop() || ribMake();
        ribFill(r, pathPts(o), !!o.loop, o.w);   // (one shared colour and dash: every route reads alike)
        r.id = id; r.set = world.setId; world.scene.add(r.mesh); r.mesh.visible = arVis;
        RIB.push(r); ribById.set(id, r);
        return id;
      }
      const L = lblFree.pop() || lblMake();
      L.id = id; L.set = world.setId; L.kind = kind; L.auto = !!o.auto;
      L.wm = o.w > 0 && o.w < 40 ? o.w : 0;   // w: the label's width in metres in the world (a sign panel's width), or px when >= 40
      L.maxD = o.maxD ?? (kind === 'ad' ? 60 : Math.max(30, L.wm * 10));
      L.on = typeof o.on === 'string' ? o.on : null; L.prop = !L.on && typeof o.prop === 'string' ? o.prop : null;
      L.oy = o.oy ?? (L.on ? 0.32 : 0); L.size = o.size || 1;
      if (kind === 'ad' || L.auto) arEl.prepend(L.el); else arEl.append(L.el);   // ads under everything you need to read
      if (!L.on && !L.prop && !whereInto(o.at, L.at)) L.at.set(0, -999, 0);
      L.el.className = 'arl ' + kind;
      L.el.style.width = L.wm ? Math.round(L.wm * AR_PXM) + 'px' : o.w ? o.w + 'px' : '';
      L.el.style.whiteSpace = o.w ? 'pre-wrap' : '';   // a fixed width wraps its text
      const col = typeof o.color === 'number' ? '#' + (o.color & 0xffffff).toString(16).padStart(6, '0') : o.color || '';   // 0xff3a3a or a CSS colour
      L.el.style.color = col; L.el.style.borderColor = col;
      lblText(L, o.text, o.title);
      L.x = L.y = -1e5; L.k = -1; L.shown = false; L.el.style.visibility = 'hidden';
      LBL.push(L); lblById.set(id, L);
      return id;
    },
    set(id, o = {}) {
      const L = lblById.get(id);
      if (!L) { const r = ribById.get(id); if (r && (o.points || o.path || o.arc)) ribFill(r, pathPts(o), !!o.loop, o.w); return; }
      if ('text' in o || 'title' in o) lblText(L, 'text' in o ? o.text : L.s.textContent, 'title' in o ? o.title : L.b.textContent || null);
      if ('on' in o) L.on = o.on || null;
      if (o.at != null) { L.on = null; L.prop = null; whereInto(o.at, L.at); }
      if (o.oy != null) L.oy = o.oy;
    },
    remove(id) {
      const L = lblById.get(id);
      if (L) {
        lblHide(L); lblById.delete(id); L.id = ''; L.set = null;
        const i = LBL.indexOf(L); if (i >= 0) LBL.splice(i, 1);
        lblFree.push(L);
        return;
      }
      const r = ribById.get(id); if (r) ribDrop(r);
    },
    clear() { while (LBL.length) AR.remove(LBL[LBL.length - 1].id); while (RIB.length) ribDrop(RIB[RIB.length - 1]); },
    show(on) { arForce = on == null ? null : !!on; },   // true / false force it; null: visible exactly in Chip View
    get visible() { return arVis; },
    get: (id) => lblById.get(id) || ribById.get(id) || null,
  };
  function arSetVisible(vis) {
    arVis = vis;
    arEl.classList.toggle('on', vis);
    arEl.classList.toggle('calm', !!options.reduceFlashing);
    for (let i = 0; i < RIB.length; i++) RIB[i].mesh.visible = vis && RIB[i].set === world.setId;
  }
  function arFrame() {   // after the world has drawn: the camera matrices are this frame's
    const vis = arForce != null ? arForce : chip.on;
    if (vis !== arVis) arSetVisible(vis);
    if (!vis) return;
    const cp = cam.camera.position, sid = world.setId, focal = innerHeight / 2 / Math.tan(cam.camera.fov * PI / 360);   // px per metre at 1 m
    for (let i = 0; i < LBL.length; i++) {
      const L = LBL[i];
      if (L.set !== sid) { lblHide(L); continue; }
      if (L.on) {
        const a = world.actor(L.on);
        if (!here(a)) { lblHide(L); continue; }
        t3.set(a.pos.x, a.pos.y + (a.rig.height || 1.75) + L.oy, a.pos.z);
      } else if (L.prop) {
        const p = world.prop(L.prop);
        if (!p) { lblHide(L); continue; }
        p.getWorldPosition(t3); t3.y += L.oy;
      } else t3.copy(L.at);
      const d = t3.distanceTo(cp);
      if (d > L.maxD) { lblHide(L); continue; }
      const s = cam.project(t3);
      if (!s.visible) { lblHide(L); continue; }
      // a label w metres wide stays that wide in the world (within readable limits); others shrink gently with distance
      const k = (L.wm ? clamp(focal / (AR_PXM * Math.max(0.5, d)), 0.4, 1.6) : clamp((L.kind === 'ad' ? 9 : 6) / Math.max(0.5, d), 0.45, 1.5)) * L.size;
      if (!L.shown) { L.shown = true; L.el.style.visibility = 'inherit'; }
      if (Math.abs(s.x - L.x) > 0.5 || Math.abs(s.y - L.y) > 0.5 || Math.abs(k - L.k) > 0.02) {   // DOM writes only when it moved
        L.x = s.x; L.y = s.y; L.k = k;
        L.el.style.transform = `translate(${s.x.toFixed(1)}px,${s.y.toFixed(1)}px) translate(-50%,-100%) scale(${k.toFixed(3)})`;
      }
    }
  }

  // ============================================================ chip: Chip View + Signal
  // The Cloud+ ads (spec 1.7: "more Cloud+ ads appear whenever the player uses Chip View"): placed in view, around him,
  // each time the view comes on. Placed in the lens's own frame (r right, u up, f ahead, metres) so they spread over
  // the top of whatever camera is live, then stay where they were put in the world.
  const ADS = [
    { id: '_ad_cloud', kind: 'ad', text: 'OPTUS CLOUD+ · NEVER FORGET ANYTHING AGAIN · $14.99/month', r: 0.6, u: 2.3, f: 11, size: 1.45 },
    { id: '_ad_teeth', kind: 'ad', text: 'TEETH+ · New teeth. Same you. · Smile safely.', r: -3.7, u: 1.6, f: 6.5 },
    { id: '_ad_hover', kind: 'ad', text: 'HOVER INSURANCE · One foot off the ground. · Are you sure?', r: 4.1, u: 1.1, f: 7.5 },
    { id: '_ad_safe', kind: 'popup', title: 'SafeSense', text: 'Have you tried being safe?', r: -2.3, u: -0.1, f: 4.6 },
  ];
  let chipShow = false, peekT = 0, lockT = 0;
  const chip = {
    allowed: true, forced: false, forcedMsg: 'Chip off.', on: false, signal: 0, full: false,
    rate: 1 / 6, drainRate: 1 / 3, hot: [], light: null,
    forceOff(on = true, msg) {
      chip.forced = !!on; if (msg) chip.forcedMsg = msg;
      if (on) { peekT = 0; chip.light = false; } else chip.light = null;
      if (!chip.on) chipLight(lightBase());
    },
    lightOn(on) { chip.light = on == null ? null : !!on; if (!chip.on) chipLight(lightBase()); },
    show(on, o) { chipShow = !!on && !skipping(); if (chipShow !== chip.on && !(peekT > 0)) setView(chipShow, !(o && o.ads === false)); },   // o.ads: false = no Cloud+ ads placed (a scripted POV)
    peek(sec = 1.5) {
      if (chip.forced || chip.allowed === false) return Promise.resolve(false);
      peekT = sec;
      return wait(sec).then(() => true);
    },
    reset() { chip.signal = 0; chip.full = false; lockT = 0; },
  };
  const lightBase = () => (chip.light != null ? chip.light : !state.flags.chip_off);
  function chipLight(on) {
    const a = world.actor('chase40'), r = a && a.rig;
    if (!r) return;
    if (typeof r.chip === 'function') r.chip(on ? 'on' : 'off'); else if (typeof r.show === 'function') r.show('chip', on);
  }
  function placeAds() {
    if (!world.scene) return;
    const c = cam.camera, e = c.matrixWorld.elements;   // columns: right, up, back
    for (let i = 0; i < ADS.length; i++) {
      const ad = ADS[i];
      t1.copy(c.position);
      t1.x += e[0] * ad.r + e[4] * ad.u - e[8] * ad.f; t1.y += e[1] * ad.r + e[5] * ad.u - e[9] * ad.f; t1.z += e[2] * ad.r + e[6] * ad.u - e[10] * ad.f;
      AR.add({ id: ad.id, kind: ad.kind, text: ad.text, title: ad.title, at: t1, auto: true, maxD: 60, size: ad.size });
    }
  }
  function setView(on, ads = true) {
    chip.on = on;
    if (typeof ui.chipView === 'function') ui.chipView(on);
    chipLight(on || lightBase());
    if (on) { if (ads) placeAds(); if (!skipping()) ui.sfx('chip_on', { vol: 0.6 }); }
    log('chip view ' + (on ? 'on' : 'off'));
    emit('chip:view', on);
  }
  function hotMul() {
    const a = world.actor('chase40'), hs = chip.hot;
    if (!a || !hs.length) return 1;
    let m = 1;
    for (let i = 0; i < hs.length; i++) {
      const h = hs[i];
      const inside = h.box ? inBox(h.box, a.pos.x, a.pos.z) : h.at ? Math.hypot(a.pos.x - h.at[0], a.pos.z - h.at[h.at.length > 2 ? 2 : 1]) <= (h.r ?? 4) : false;
      if (inside && (h.mul ?? 2) > m) m = h.mul ?? 2;
    }
    return m;
  }
  function chipTick(dt) {
    const me = state.active === 'chase40';
    const live = me && flow.roaming && !flow.busy && !flow.cutscene && !SR.on && !stealth.busy;
    const can = live && chip.allowed !== false && !chip.forced;
    if (lockT > 0) lockT -= dt;
    if (peekT > 0) peekT -= dt;
    if (live && !can && chip.forced && input.pressed('chip')) { input.consume('chip'); ui.toast(chip.forcedMsg); ui.sfx('clunk'); }
    // options.holdToPress: a press latches Chip View on (input.holding); pressing CHIP again while it's on lets go
    if (options.holdToPress && can && chip.on && !chipShow && !(peekT > 0) && input.pressed('chip')) { input.consume('chip'); input.unlatch('chip'); }
    const fill = !chip.forced && lockT <= 0 && !SR.on && ((can && input.holding('chip')) || peekT > 0);
    const want = fill || (chipShow && !SR.on);
    if (want !== chip.on) setView(want);
    if (fill) {
      if (!chip.full) { chip.signal = Math.min(1, chip.signal + dt * chip.rate * hotMul()); if (chip.signal >= 1) signalFull(); }   // (full and still on: it stays full)
    } else if (!stealth.busy && chip.signal > 0) {
      chip.signal = Math.max(0, chip.signal - dt * chip.drainRate);
      if (chip.signal < 0.98) chip.full = false;
    }
    if (typeof ui.signal === 'function') ui.signal(!SR.on && ((chip.on && !chipShow) || chip.signal > 0) ? chip.signal : null);
  }
  function signalFull() {
    chip.full = true; chip.signal = 1; lockT = 1.6; peekT = 0;   // the chip drops out for a moment
    if (!skipping()) ui.sfx('chip_zap', { vol: 0.7 });
    log('signal full');
    emit('signal:full', { who: 'chase40' });
  }
  function chipOff() { peekT = 0; chipShow = false; if (chip.on) setView(false); }

  // ============================================================ DRONES
  const NR = 16;                                   // cone rays (NR + 1 edges)
  const D = [], dById = new Map(), dFree = [], models = {};
  const LIGHT_OF = { patrol: 'patrol', curious: 'curious', escort: 'escort', hug: 'escort', turned: 'escort', lured: 'white', return: 'patrol', goto: 'patrol', idle: 'patrol' };
  const CONE_COL = { patrol: 0x6fc8ff, curious: 0xffb020, escort: 0xff3b30, white: 0xcdeeff, yes: 0xffd21f, green: 0x5ae08a, off: 0x445060 };
  const COV = [];                                  // DRONES.cover: { id, box }
  const BX = new Array(128);                       // occluder boxes near one drone (scratch)
  const TG = [];                                   // this tick's targets (party actors on screen)
  let paused = false, hum = null, graceT = 0, droneSeq = 0;

  // ---- models: art's buildDrone(kind), else a plain pod with the same userData API (setLight, lights)
  let phG = null;
  const phLight = (st) => (typeof droneLightMat === 'function' ? droneLightMat(st) : mat(0x000000, { emissive: CONE_COL[st] ?? CONE_COL.patrol, emissiveIntensity: 1.25, key: 'sys_dl' }));
  function placeholder(kind) {
    if (!phG) phG = {
      body: new THREE.SphereGeometry(0.21, 12, 8).scale(1, 0.82, 1), band: new THREE.CylinderGeometry(0.214, 0.214, 0.07, 14, 1, true).translate(0, 0.03, 0),
      eye: new THREE.BoxGeometry(0.12, 0.024, 0.014).translate(0, 0.035, 0.206), ring: new THREE.TorusGeometry(0.08, 0.013, 4, 14).rotateX(H).translate(0, -0.15, 0),
    };
    const s = kind === 'guardian' ? 1.5 : kind === 'cleaning' ? 1.15 : 1, g = new THREE.Group();
    const body = new THREE.Mesh(phG.body, mat(kind === 'lifeguard' ? 0xffd23a : 0xeef1f4)), band = new THREE.Mesh(phG.band, mat(0x1a2028));
    const eye = new THREE.Mesh(phG.eye, phLight('patrol')), ring = new THREE.Mesh(phG.ring, phLight('patrol')), lights = [eye, ring];
    g.add(body, band, eye, ring); g.scale.setScalar(s); g.name = 'drone_' + kind;
    g.userData = { kind, lights, state: 'patrol', radius: 0.22 * s, setLight(st) { const m = phLight(st); for (let i = 0; i < lights.length; i++) lights[i].material = m; g.userData.state = st; } };
    return g;
  }
  function modelGet(kind) {
    const l = models[kind];
    const o = (l && l.pop()) || (typeof buildDrone === 'function' ? buildDrone(kind) : placeholder(kind));
    o.rotation.order = 'YXZ'; o.visible = true;
    return o;
  }
  function modelPut(kind, o) { if (o.parent) o.parent.remove(o); if (o.userData.setLight) o.userData.setLight('patrol'); (models[kind] ||= []).push(o); }

  // ---- the floor cone: a fan of NR + 1 rays, each cut short by walls / cover; soft centre, bright rim (vertex alpha),
  // and a thin dark edge outside the rim so it still reads on a bright floor (the 2026 store's)
  const coneMats = {}, coneList = [];   // (the list: ticked without for-in)
  function coneMat(l) {
    return coneMats[l] || (coneList.push(l), coneMats[l] = new THREE.MeshBasicMaterial({ color: CONE_COL[l] ?? CONE_COL.patrol, vertexColors: true, transparent: true, depthWrite: false,
      fog: false, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
  }
  function coneMake() {
    const nv = 1 + 4 * (NR + 1), R = 2 + NR, E0 = R + NR + 1, E1 = E0 + NR + 1, g = new THREE.BufferGeometry(), col = new Float32Array(nv * 4), idx = [];
    const rgba = (v, a, c = 1) => { col[v * 4] = col[v * 4 + 1] = col[v * 4 + 2] = c; col[v * 4 + 3] = a; };
    rgba(0, 0.5);
    for (let i = 0; i <= NR; i++) { rgba(1 + i, 0.14); rgba(R + i, 0.62); rgba(E0 + i, 0.78, 0.1); rgba(E1 + i, 0.4, 0.1); }
    for (let i = 0; i < NR; i++) { idx.push(0, 1 + i, 2 + i, 1 + i, R + i, 2 + i, 2 + i, R + i, R + i + 1, E0 + i, E1 + i, E0 + i + 1, E0 + i + 1, E1 + i, E1 + i + 1); }
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(nv * 3), 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('color', new THREE.BufferAttribute(col, 4));
    g.setIndex(idx);
    const m = new THREE.Mesh(g, coneMat('patrol'));
    m.frustumCulled = false; m.renderOrder = 1; m.name = 'drone_cone';
    return m;
  }
  // the scan beam: a faint light from the drone's eye down to the apex of its floor cone (ties pod and cone together
  // from a high fixed camera); same materials as the cone, scaled to the hover height each frame
  let beamGeo = null;
  function beamMake() {
    if (!beamGeo) {
      beamGeo = new THREE.CylinderGeometry(0.035, 0.3, 1, 12, 1, true).translate(0, 0.5, 0);
      const p = beamGeo.attributes.position, col = new Float32Array(p.count * 4);
      for (let i = 0; i < p.count; i++) { col[i * 4] = col[i * 4 + 1] = col[i * 4 + 2] = 1; col[i * 4 + 3] = p.getY(i) > 0.5 ? 0.3 : 0.04; }
      beamGeo.setAttribute('color', new THREE.BufferAttribute(col, 4));
    }
    const m = new THREE.Mesh(beamGeo, coneMat('patrol'));
    m.frustumCulled = false; m.renderOrder = 1; m.name = 'drone_beam';
    return m;
  }
  function coneFill(d) {
    const P = d.cone.geometry.attributes.position.array, R = 2 + NR, E0 = R + NR + 1, E1 = E0 + NR + 1;
    for (let i = 0; i <= NR; i++) {
      const a = -d.half + (2 * d.half * i) / NR, s = Math.sin(a), c = Math.cos(a), r = d.rays[i], re = r + Math.min(0.11, r * 0.15);
      P[(1 + i) * 3] = s * r * 0.84; P[(1 + i) * 3 + 1] = 0; P[(1 + i) * 3 + 2] = c * r * 0.84;
      P[(R + i) * 3] = s * r; P[(R + i) * 3 + 1] = 0; P[(R + i) * 3 + 2] = c * r;
      P[(E0 + i) * 3] = s * r; P[(E0 + i) * 3 + 1] = 0; P[(E0 + i) * 3 + 2] = c * r;
      P[(E1 + i) * 3] = s * re; P[(E1 + i) * 3 + 1] = 0; P[(E1 + i) * 3 + 2] = c * re;
    }
    d.cone.geometry.attributes.position.needsUpdate = true;
  }
  // ray vs box in the floor plane: entry distance, or -1 (miss, behind, or starting inside it: a drone over a counter)
  function slab(ox, oz, dx, dz, b) {
    let t0 = -1e9, t1_ = 1e9;
    if (Math.abs(dx) < 1e-9) { if (ox < b[0] || ox > b[2]) return -1; } else { let a = (b[0] - ox) / dx, c = (b[2] - ox) / dx; if (a > c) { const s = a; a = c; c = s; } t0 = a; t1_ = c; }
    if (Math.abs(dz) < 1e-9) { if (oz < b[1] || oz > b[3]) return -1; } else { let a = (b[1] - oz) / dz, c = (b[3] - oz) / dz; if (a > c) { const s = a; a = c; c = s; } if (a > t0) t0 = a; if (c < t1_) t1_ = c; }
    return t1_ < t0 || t0 < 0 ? -1 : t0;
  }
  const nearBox = (b, x, z, r) => { const cx = x < b[0] ? b[0] : x > b[2] ? b[2] : x, cz = z < b[1] ? b[1] : z > b[3] ? b[3] : z; return (x - cx) * (x - cx) + (z - cz) * (z - cz) <= r * r; };
  function rays(d) {
    const ox = d.x, oz = d.z, len = d.len, half = d.half, cl = DRONES.walls !== false && world.set ? world.set.colliders : null;
    let nb = 0;
    if (cl) for (let i = 0; i < cl.length && nb < BX.length; i++) if (nearBox(cl[i], ox, oz, len + 0.1)) BX[nb++] = cl[i];
    for (let i = 0; i < COV.length && nb < BX.length; i++) if (COV[i].box && nearBox(COV[i].box, ox, oz, len + 0.1)) BX[nb++] = COV[i].box;
    for (let i = 0; i <= NR; i++) {
      const a = d.yaw - half + (2 * half * i) / NR, dx = Math.sin(a), dz = Math.cos(a);
      let r = len;
      for (let k = 0; k < nb; k++) { const t = slab(ox, oz, dx, dz, BX[k]); if (t >= 0 && t < r) r = t; }
      d.rays[i] = r < 0.05 ? 0.05 : r;
    }
    coneFill(d);
  }
  function inCone(d, a) {   // is actor a inside d's (clipped) cone?
    if (!d.hasCone) return false;
    const dx = a.pos.x - d.x, dz = a.pos.z - d.z, dist = Math.hypot(dx, dz);
    if (dist > d.len + 0.25) return false;
    if (dist < 0.35) return true;
    const ang = angTo(d.yaw, Math.atan2(dx, dz)), slack = Math.min(0.5, 0.2 / dist);
    if (Math.abs(ang) > d.half + slack) return false;
    const f = clamp((ang + d.half) / (2 * d.half), 0, 1) * NR, i = Math.min(NR - 1, Math.floor(f)), r = d.rays[i] + (d.rays[i + 1] - d.rays[i]) * (f - i);
    return dist <= r + 0.2;
  }

  // ---- '?' over a curious drone, the escort's soft blue hug field
  let qMat = null, qGeo = null, hugMesh = null, hugOn = null;
  function qMake() {
    if (!qMat) {
      const t = tex('sys_q', 64, 64, (c, w, h) => {
        c.clearRect(0, 0, w, h); c.font = 'bold 54px Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.lineWidth = 7; c.strokeStyle = '#3a2400'; c.strokeText('?', w / 2, h / 2 + 3); c.fillStyle = '#ffc23a'; c.fillText('?', w / 2, h / 2 + 3);
      });
      qMat = new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, fog: false, side: THREE.DoubleSide });
      qGeo = new THREE.PlaneGeometry(0.3, 0.3);
    }
    const m = new THREE.Mesh(qGeo, qMat); m.visible = false; m.renderOrder = 3; m.name = 'drone_q';
    return m;
  }
  function hugGet() {
    if (!hugMesh) {
      const g = new THREE.SphereGeometry(0.55, 12, 8); g.scale(1, 1.75, 1); g.translate(0, 0.9, 0);
      hugMesh = new THREE.Mesh(g, mat(0x9fd8ff, { emissive: 0x3a8ac8, emissiveIntensity: 0.6, transparent: true, opacity: 0.25, side: THREE.DoubleSide, key: 'hug' }));
      hugMesh.visible = false; hugMesh.renderOrder = 2; hugMesh.name = 'hug_field';
    }
    return hugMesh;
  }
  function hugShow(a) { const h = hugGet(); if (!world.scene || !a) return; world.scene.add(h); h.visible = true; hugOn = a; h.position.copy(a.pos); }
  function hugHide() { if (!hugMesh) return; hugMesh.visible = false; hugOn = null; if (hugMesh.parent) hugMesh.parent.remove(hugMesh); }

  // ---- drone records (pooled with their cone, shadow and '?')
  function dMake() {
    const sh = typeof blobShadow === 'function' ? blobShadow() : null;
    if (sh) sh.scale.setScalar(0.6);
    return { id: '', set: null, scene: null, kind: '', obj: null, cone: coneMake(), beam: beamMake(), rays: new Float32Array(NR + 1), shadow: sh, q: qMake(),
      x: 0, y: 0, z: 0, px: 0, py: 0, pz: 0, yaw: 0, pyaw: 0, vx: 0, vz: 0, tilt: 0, hx: 0, hz: 0, hyaw: 0, hover: 1.55, phase: 0, t: 0,
      path: new Float32Array(128), pn: 0, loop: true, seg: 0, s: 0, dir: 1, speed: 1, pause: 0.5, pauseT: 0,
      len: 3.2, half: 0.42, len0: 3.2, half0: 0.42, hasCone: true, ai: true, sweep: 0, sweepP: 5, showPath: true,
      coneK: 0, disc: 0.6, discY: NaN, yOff: 0, lureY: NaN, clawK: 0.3, clawTo: 0.3, clawV: 2.5, lureFix: false, gy0: 0, gy1: NaN, gL: 1,
      st: 'patrol', stT: 0, tgt: null, sus: 0, lost: 0, lx: 0, lz: 0, light: '',
      gx: 0, gz: 0, gs: 1.4, gRes: null, gCut: false, after: 'idle', faceX: 0, faceZ: 0, faceOn: false, lureTok: 0, lureT: 0, lureDur: 0, arrived: false };
  }
  function lightD(d, l) {
    if (d.light === l) return;
    d.light = l;
    if (d.obj.userData.setLight) d.obj.userData.setLight(l);
    d.cone.material = d.beam.material = coneMat(l);
  }
  function setSt(d, st, tgt) {
    const prev = d.st;
    d.st = st; d.stT = 0; d.tgt = tgt || null;
    // a goTo cut short (DRONES.face / release / turn / calm, the soft fail) still resolves: nobody awaits it forever
    if (prev === 'goto' && st !== 'goto' && d.gRes) { const r = d.gRes; d.gRes = null; r(); }
    if (st === 'curious') { d.sus = 0; d.lost = 0; snd('drone_q', d.obj.position, 0.8); }
    else if (st === 'escort') snd('drone_red', d.obj.position, 0.8);
    else if (st === 'patrol' && prev === 'return') snd('drone_ok', d.obj.position, 0.4);
    d.faceOn = false;
    lightD(d, LIGHT_OF[st] || 'patrol');
    d.q.visible = st === 'curious' || st === 'lured';
    if (prev !== st) log('drone ' + d.id + ' ' + st + (tgt ? ' ' + tgt.id : ''));
  }
  const leave = (d) => { if (d.st === 'patrol' || d.st === 'idle') { d.lx = d.x; d.lz = d.z; } };   // where to come back to
  function dReset(d) {
    if (d.pn >= 1) { d.x = d.path[0]; d.z = d.path[1]; } else { d.x = d.hx; d.z = d.hz; }
    d.yaw = d.hyaw; d.seg = 0; d.s = 0; d.dir = 1; d.pauseT = 0; d.vx = d.vz = 0; d.tilt = 0; d.t = 0;
    d.y = floorY(d.x, d.z) + d.hover; d.px = d.x; d.pz = d.z; d.py = d.y; d.pyaw = d.yaw;
    d.lx = d.x; d.lz = d.z; d.lureTok = 0; d.arrived = false;
    d.coneK = 0; d.len = d.len0; d.half = d.half0; d.discY = NaN; d.lureY = NaN; d.yOff = 0;
    if (d.gRes) { const r = d.gRes; d.gRes = null; r(); }
    d.st = ''; setSt(d, 'patrol');
    if (d.hasCone) rays(d);
  }
  function dDrop(d) {
    if (d.gRes) { const r = d.gRes; d.gRes = null; r(); }
    for (const o of [d.cone, d.beam, d.shadow, d.q]) if (o && o.parent) o.parent.remove(o);
    modelPut(d.kind, d.obj); d.obj = null;
    AR.remove('path:' + d.id);
    dById.delete(d.id); d.id = ''; d.set = null; d.scene = null; d.tgt = null; d.light = '';
    const i = D.indexOf(d); if (i >= 0) D.splice(i, 1);
    dFree.push(d);
  }
  function turnTo(d, x, z, rate, dt) { const w = Math.atan2(x - d.x, z - d.z); d.yaw += clamp(angTo(d.yaw, w), -rate * dt, rate * dt); }
  function turnYaw(d, w, rate, dt) { d.yaw += clamp(angTo(d.yaw, w), -rate * dt, rate * dt); }
  function glide(d, x, z, sp, dt) {   // -> true when there
    const dx = x - d.x, dz = z - d.z, L = Math.hypot(dx, dz), st = sp * dt;
    if (L <= st) { d.x = x; d.z = z; d.vx = d.vz = 0; return true; }
    d.vx = (dx / L) * sp; d.vz = (dz / L) * sp; d.x += (dx / L) * st; d.z += (dz / L) * st;
    return false;
  }
  function nextIdx(d) {
    if (d.loop) return (d.seg + 1) % d.pn;
    let j = d.seg + d.dir;
    if (j < 0 || j >= d.pn) { d.dir = -d.dir; j = d.seg + d.dir; }
    return j;
  }
  function patrol(d, dt) {
    if (d.pn < 2) {   // parked: hover at home, sweeping the cone side to side
      if (Math.abs(d.x - d.hx) + Math.abs(d.z - d.hz) > 0.01) glide(d, d.hx, d.hz, 1.2, dt); else d.vx = d.vz = 0;
      turnYaw(d, d.hyaw + (d.sweep ? Math.sin((d.t * TAU) / d.sweepP) * d.sweep : 0), 2, dt);
      return;
    }
    const P = d.path, j = nextIdx(d), ax = P[d.seg * 2], az = P[d.seg * 2 + 1], bx = P[j * 2], bz = P[j * 2 + 1];
    const L = Math.hypot(bx - ax, bz - az), want = Math.atan2(bx - ax, bz - az);
    if (d.pauseT > 0) { d.pauseT -= dt; d.vx = d.vz = 0; turnYaw(d, want, 2.5, dt); return; }   // look down the next leg first
    if (L < 1e-3) { d.seg = j; d.s = 0; return; }
    d.s += d.speed * dt;
    if (d.s >= L) { d.x = bx; d.z = bz; d.seg = j; d.s = 0; d.pauseT = d.pause; d.vx = d.vz = 0; return; }
    const k = d.s / L;
    d.x = ax + (bx - ax) * k; d.z = az + (bz - az) * k; d.vx = ((bx - ax) / L) * d.speed; d.vz = ((bz - az) / L) * d.speed;
    turnYaw(d, want, 3, dt);
  }
  function spot(d) {   // the first target in the cone (the player first); none while a lure's cone collapses / reopens
    if (d.coneK > 0 && d.coneK < 1) return null;
    let best = null;
    for (let i = 0; i < TG.length; i++) { const a = TG[i]; if (inCone(d, a)) { if (a === player.actor) return a; if (!best) best = a; } }
    return best;
  }
  function droneTick(d, dt, watch, escalate) {
    d.px = d.x; d.pz = d.z; d.py = d.y; d.pyaw = d.yaw; d.t += dt; d.stT += dt;
    // a skipped cutscene: a scripted flight lands at once, so an awaited goTo never holds the skip up (lured drones keep
    // investigating on their own clock, a roam after the cutscene may count on that; lureTick settles lure.done instead)
    if (d.st === 'goto' && d.gCut && skipping()) { d.x = d.px = d.gx; d.z = d.pz = d.gz; if (d.gy1 === d.gy1) d.hover = d.gy1; const r = d.gRes; d.gRes = null; setSt(d, d.after); if (r) r(); }
    const look = watch && d.hasCone && d.ai;
    if (!paused) switch (d.st) {
      case 'patrol': {
        patrol(d, dt);
        if (look) { const a = spot(d); if (a) { leave(d); setSt(d, 'curious', a); } }
        break;
      }
      case 'curious': {   // amber: hover, turn to him; stay in the cone and it escalates; leave it and it forgets
        const a = d.tgt;
        d.vx = d.vz = 0;
        if (!here(a)) { setSt(d, 'return'); break; }
        turnTo(d, a.pos.x, a.pos.z, 4, dt);
        if (look && inCone(d, a)) { d.lost = 0; d.sus += dt; if (escalate && d.sus >= stealth.escortAfter) setSt(d, 'escort', a); }
        else { d.lost += dt; if (d.lost >= stealth.forgetAfter) setSt(d, 'return'); }
        break;
      }
      case 'escort': {    // red: glide to him and hug
        const a = d.tgt;
        if (!here(a) || stealth.busy) { if (!stealth.busy) setSt(d, 'return'); break; }
        const dx = d.x - a.pos.x, dz = d.z - a.pos.z, L = Math.hypot(dx, dz) || 1;
        const there = glide(d, a.pos.x + (dx / L) * 0.7, a.pos.z + (dz / L) * 0.7, stealth.escortSpeed, dt);
        turnTo(d, a.pos.x, a.pos.z, 6, dt);
        if (there || L < 0.85) { setSt(d, 'hug', a); stealth.capture(a.id, { drone: d.id }); }
        break;
      }
      case 'hug': case 'turned': { const a = d.tgt; d.vx = d.vz = 0; if (a) turnTo(d, a.pos.x, a.pos.z, 5, dt); break; }
      case 'lured': {     // fly to the sound, look it over for lureDur, then go back
        if (!d.arrived) {
          d.arrived = glide(d, d.gx, d.gz, 1.6, dt); turnTo(d, d.faceX, d.faceZ, 3, dt);
          if (d.arrived) lureArrive(d);
        } else {
          d.lureT += dt;
          turnYaw(d, Math.atan2(d.faceX - d.x, d.faceZ - d.z) + Math.sin(d.lureT * 1.7) * 0.4, 2, dt);
          if (d.lureT >= d.lureDur) setSt(d, 'return');
        }
        if (look && !d.lureFix) { const a = spot(d); if (a) setSt(d, 'curious', a); }
        break;
      }
      case 'return': {
        const there = glide(d, d.lx, d.lz, 1.6, dt);
        if (there) setSt(d, 'patrol');
        else { turnTo(d, d.lx, d.lz, 3, dt); if (look) { const a = spot(d); if (a) setSt(d, 'curious', a); } }
        break;
      }
      case 'goto': {      // scripted: DRONES.goTo
        const there = glide(d, d.gx, d.gz, d.gs, dt);
        if (d.gy1 === d.gy1) { const k = there ? 1 : clamp(1 - Math.hypot(d.gx - d.x, d.gz - d.z) / d.gL, 0, 1); d.hover = d.gy0 + (d.gy1 - d.gy0) * smooth(k); }   // o.y: the height eases with the flight
        if (!there) turnTo(d, d.gx, d.gz, 4, dt);
        else { const r = d.gRes; d.gRes = null; setSt(d, d.after); if (r) r(); }
        break;
      }
      case 'idle': d.vx = d.vz = 0; if (d.faceOn) turnTo(d, d.faceX, d.faceZ, 3, dt); break;
    }
    // a lured drone that has arrived hovers at the lure's height (o.y) and, transfixed, its cone collapses to a disc
    const tr = d.st === 'lured' && d.arrived, fl = floorY(d.x, d.z);
    d.yOff += ((tr && d.lureY === d.lureY ? d.lureY - fl - d.hover : 0) - d.yOff) * Math.min(1, 3 * dt);
    d.y = fl + d.hover + d.yOff;
    const ck = tr && d.disc > 0 ? 1 : 0;
    if (d.coneK !== ck) {
      d.coneK = skipping() ? ck : ck > d.coneK ? Math.min(1, d.coneK + dt * 2.5) : Math.max(0, d.coneK - dt * 2.5);
      // two phases, so it never sweeps a wide fan: the cone pulls in to the disc's length first, then opens into the disc
      const kl = smooth(Math.min(1, d.coneK * 2)), kh = smooth(Math.max(0, d.coneK * 2 - 1));
      d.len = d.len0 + (d.disc - d.len0) * kl; d.half = d.half0 + (PI - d.half0) * kh;
    }
    if (d.hasCone) rays(d);
    const u = d.obj.userData;
    if (u.brush) u.brush.rotation.y += dt * 9;   // a cleaning drone's brush
    if (d.clawK !== d.clawTo && u.setClaw) {     // the noise drone's claw (DRONES.claw)
      const st = dt * d.clawV;
      d.clawK = Math.abs(d.clawTo - d.clawK) <= st ? d.clawTo : d.clawK + Math.sign(d.clawTo - d.clawK) * st;
      u.setClaw(d.clawK);
    }
  }
  function dronesTick(dt) {
    if (graceT > 0) graceT -= dt;
    const sid = world.setId;
    const watch = !paused && graceT <= 0 && !SR.on && !stealth.busy && !flow.cutscene && !flow.busy && (flow.roaming || TEST.auto);
    const escalate = stealth.active && (!TEST.auto || stealth.autoCapture || DRONES.autoCapture);
    TG.length = 0;
    if (watch) { const ids = (stealth.opts && stealth.opts.targets) || PARTY; for (let i = 0; i < ids.length; i++) { const a = world.actor(ids[i]); if (here(a)) TG.push(a); } }
    for (let i = 0; i < D.length; i++) if (D[i].set === sid) droneTick(D[i], dt, watch, escalate);
    const k = 0.86 + 0.14 * Math.sin(clock.t * 3.1), ke = 0.8 + 0.2 * Math.sin(clock.t * (options.reduceFlashing ? 3 : 9));   // cones breathe; escort pulses
    for (let i = 0; i < coneList.length; i++) coneMats[coneList[i]].opacity = coneList[i] === 'escort' ? ke : k;
  }
  // render-time placement: interpolate tick positions, bob, tilt into the motion, '?' faces the camera
  function dronesFrame(alpha) {
    const sid = world.setId, tt = clock.t + alpha * CONFIG.step, cq = cam.camera.quaternion;
    for (let i = 0; i < D.length; i++) {
      const d = D[i];
      if (d.set !== sid) continue;
      const x = d.px + (d.x - d.px) * alpha, z = d.pz + (d.z - d.pz) * alpha, y = d.py + (d.y - d.py) * alpha, yaw = d.pyaw + angTo(d.pyaw, d.yaw) * alpha;
      const fwd = d.vx * Math.sin(d.yaw) + d.vz * Math.cos(d.yaw);
      d.tilt += (clamp(fwd * 0.12, -0.18, 0.25) - d.tilt) * 0.12;
      d.obj.position.set(x, y + Math.sin(tt * 2.1 + d.phase) * 0.045, z);
      d.obj.rotation.set(d.tilt, yaw, Math.sin(tt * 1.3 + d.phase) * 0.03);
      const fy = y - d.hover - d.yOff, cy = d.coneK > 0 && d.discY === d.discY ? fy + (d.discY - fy) * smooth(d.coneK) : fy;   // the disc lies on the lure's surface (a table)
      if (d.hasCone) { d.cone.position.set(x, cy + 0.025, z); d.cone.rotation.y = yaw; d.beam.position.set(x, cy + 0.02, z); d.beam.scale.y = Math.max(0.1, y - cy - 0.12); }
      if (d.shadow) d.shadow.position.set(x, fy + 0.012, z);
      if (d.q.visible) { d.q.position.set(x, y + 0.42 + Math.sin(tt * 5) * 0.03, z); d.q.quaternion.copy(cq); }
    }
    if (hugOn && hugMesh) { hugMesh.position.copy(hugOn.pos); const s = 1 + Math.sin(tt * 6) * 0.04; hugMesh.scale.set(s, 1, s); }
  }
  function humTick() {   // one drone hum, placed on the nearest drone (one panner, not one per drone)
    let best = null, bd = 1e9;
    const p = player.actor, sid = world.setId;
    if (p && !SR.on) for (let i = 0; i < D.length; i++) { const d = D[i]; if (d.set !== sid) continue; const dd = Math.abs(d.x - p.pos.x) + Math.abs(d.z - p.pos.z); if (dd < bd) { bd = dd; best = d; } }
    if (!best || typeof AUDIO === 'undefined' || !AUDIO.loop) { if (hum) { hum.stop(0.6); hum = null; } return; }
    if (!hum) hum = AUDIO.loop('drone_hum', { vol: 0.55, fade: 0.8, at: best.obj.position });
    hum.pos(best.x, best.y, best.z);
  }

  // ---- lures (13.6): one live lure; the sample replays at the spot while drones are on it
  const LURE = { on: false, tok: 0, at: V(), sfx: '', t: 0, rep: 0, line: null, said: false, res: [], cut: false };
  function lureArrive(d) {
    snd('drone_scan', d.obj.position, 0.5);
    if (LURE.on && d.lureTok === LURE.tok && LURE.line && !LURE.said) { LURE.said = true; barkD(LURE.line); }
  }
  function lureEnd() { LURE.on = false; while (LURE.res.length) LURE.res.shift()(); }
  function lureTick(dt) {
    if (!LURE.on) return;
    if (LURE.cut && LURE.res.length && skipping()) while (LURE.res.length) LURE.res.shift()();   // an awaited lure in a skipped cutscene: done now (the drones stay on it)
    LURE.t += dt;
    let n = 0;
    for (let i = 0; i < D.length; i++) if (D[i].st === 'lured' && D[i].lureTok === LURE.tok) n++;
    if ((LURE.rep -= dt) <= 0 && (n || LURE.t < 0.1)) { LURE.rep = 1.9; if (LURE.sfx) snd(LURE.sfx, LURE.at, 0.9); }
    if (!n && LURE.t > 0.1) lureEnd();
  }

  const DRONES = {
    lines: { escort: 'Gotcha! ^ For your safety!', laugh: 'Excuse me! Someone is having too much fun!' },
    walls: true, autoCapture: false,
    get all() { return D; },
    spawn(id = 'drone' + ++droneSeq, o = {}) {
      if (!world.scene) { console.warn('TWO: DRONES.spawn before a set is loaded'); return null; }
      DRONES.remove(id);
      const d = dFree.pop() || dMake(), kind = o.kind || 'courtesy', p = o.path;
      d.id = id; d.kind = kind; d.set = world.setId; d.scene = world.scene; d.obj = modelGet(kind);
      d.pn = 0;
      if (Array.isArray(p)) for (let i = 0; i < p.length && d.pn < 64; i++) { const q = p[i]; d.path[d.pn * 2] = q[0]; d.path[d.pn * 2 + 1] = q.length > 2 ? q[2] : q[1]; d.pn++; }
      d.loop = o.loop ?? d.pn >= 3;
      d.speed = o.speed ?? 1; d.pause = o.pause ?? 0.5; d.hover = o.hover ?? 1.55; d.phase = Math.random() * TAU;
      let fr = NaN;
      if (d.pn) { d.hx = d.path[0]; d.hz = d.path[1]; } else if (whereInto(o.at, t1)) { d.hx = t1.x; d.hz = t1.z; fr = whereRot; } else { d.hx = 0; d.hz = 0; }
      if (typeof o.face === 'number') d.hyaw = o.face;
      else if (o.face != null && whereInto(o.face, t2)) d.hyaw = Math.atan2(t2.x - d.hx, t2.z - d.hz);
      else if (d.pn >= 2) d.hyaw = Math.atan2(d.path[2] - d.path[0], d.path[3] - d.path[1]);
      else d.hyaw = fr === fr ? fr : 0;
      const c = o.cone;
      d.hasCone = c !== false; d.len = d.len0 = (c && c.len) || 3.2; d.half = d.half0 = (c && c.half) || 0.42;
      d.clawK = d.clawTo = 0.3; if (d.obj.userData.setClaw) d.obj.userData.setClaw(0.3);
      d.ai = o.ai !== false; d.sweep = ((o.sweep || 0) * PI) / 180; d.sweepP = o.sweepPeriod || 5; d.showPath = o.showPath !== false;
      d.light = '';
      dReset(d);
      const sc = world.scene;
      sc.add(d.obj, d.q);
      if (d.shadow) sc.add(d.shadow);
      if (d.hasCone) sc.add(d.cone, d.beam);
      D.push(d); dById.set(id, d);
      if (d.showPath && d.pn >= 2) AR.add({ id: 'path:' + id, kind: 'path', points: p, loop: d.loop });
      log('drone ' + id + ' spawn ' + kind);
      return d;
    },
    get: (id) => dById.get(id) || null,
    remove(id) { const d = dById.get(id); if (d) dDrop(d); },
    clear() { while (D.length) dDrop(D[D.length - 1]); lureEnd(); },
    reset() { for (let i = 0; i < D.length; i++) dReset(D[i]); lureEnd(); graceT = 1.5; },
    pause(on = true) { paused = !!on; },
    calm() { for (let i = 0; i < D.length; i++) { const d = D[i]; if (d.st !== 'patrol' && d.st !== 'idle' && d.st !== 'goto') setSt(d, 'return'); } },
    alert(who) {   // drones in the zone turn curious at him (no escort without stealth)
      const a = typeof who === 'string' ? world.actor(who) : who;
      if (!here(a)) return;
      for (let i = 0; i < D.length; i++) {
        const d = D[i];
        if (d.set !== world.setId || !d.ai || d.st === 'hug' || d.st === 'escort' || d.st === 'goto') continue;
        if (Math.hypot(d.x - a.pos.x, d.z - a.pos.z) > stealth.zoneR) continue;
        leave(d); setSt(d, 'curious', a);
      }
    },
    turn(who) {    // every drone in the zone turns red to face him (the soft fail's beat)
      const a = typeof who === 'string' ? world.actor(who) : who;
      if (!a) return 0;
      let n = 0;
      for (let i = 0; i < D.length; i++) {
        const d = D[i];
        if (d.set !== world.setId || !d.ai || Math.hypot(d.x - a.pos.x, d.z - a.pos.z) > stealth.zoneR) continue;
        leave(d); setSt(d, 'turned', a); n++;
      }
      return n;
    },
    lure(at, sampleId, o = {}) {
      const S = (SAMPLES && SAMPLES[sampleId]) || {}, lr = S.lure || { r: 5, dur: 4 }, r = o.r ?? lr.r, dur = o.dur ?? lr.dur;
      const out = { n: 0, ids: [], done: null, then: (a, b) => out.done.then(a, b) };
      if (!whereInto(at, t1)) { out.done = Promise.resolve(); return out; }
      const lureAt3 = Array.isArray(at) && at.length > 2;   // a point on a surface (a café table): the disc lies on it
      lureEnd();
      const tok = ++LURE.tok;
      LURE.at.copy(t1);
      for (let i = 0; i < D.length; i++) {
        const d = D[i];
        if (d.set !== world.setId || !d.ai || d.st === 'escort' || d.st === 'hug' || d.st === 'turned' || d.st === 'goto' || d.kind === 'cleaning') continue;
        const dist = Math.hypot(d.x - t1.x, d.z - t1.z);
        if (dist > r) continue;
        leave(d);
        const k = o.over ? 1 : dist > 1.1 ? (dist - 1.1) / dist : 0;   // hover a metre short of it, on its own side (over: right above it)
        d.gx = d.x + (t1.x - d.x) * k; d.gz = d.z + (t1.z - d.z) * k; d.faceX = t1.x + (o.over ? t1.x - d.x : 0) * 0.01; d.faceZ = t1.z + (o.over ? t1.z - d.z : 0) * 0.01;
        d.arrived = false; d.lureT = 0; d.lureDur = dur; d.lureTok = tok;
        d.disc = o.disc === false ? 0 : o.disc ?? 0.6; d.discY = lureAt3 ? t1.y : NaN; d.lureY = typeof o.y === 'number' ? o.y : NaN;
        d.lureFix = !!o.transfixed;   // transfixed: it sees nothing else until the lure is over
        if (skipping()) { d.x = d.px = d.gx; d.z = d.pz = d.gz; }
        setSt(d, 'lured');
        out.n++; out.ids.push(d.id);
      }
      LURE.on = true; LURE.t = 0; LURE.rep = 0; LURE.sfx = S.sfx || ''; LURE.said = false; LURE.cut = flow.cutscene;
      LURE.line = o.line !== undefined ? o.line : sampleId === 'laugh' ? DRONES.lines.laugh : null;
      out.done = new Promise((res) => LURE.res.push(res));
      log('lure ' + sampleId + ' ' + out.n);
      emit('lure', { sample: sampleId, n: out.n });
      return out;
    },
    async lureMenu(at, o = {}) {   // Chase picks a sample from his phone (the counter speaker, a dropped phone)
      const have = state.samples.filter((k) => SAMPLES[k]), list = have.length ? have : (o.fallback || ['radio']).filter((k) => SAMPLES[k]);
      if (!list.length) return null;
      const labels = list.map((k) => SAMPLES[k].label);
      if (o.cancel !== false) labels.push('Cancel');
      const ti = list.indexOf(o.test || 'laugh');
      const i = await choose(labels, { test: ti >= 0 ? ti : 0 });
      if (!(i >= 0 && i < list.length)) return null;
      DRONES.lure(at, list[i], o);
      return list[i];
    },
    goTo(id, at, o = {}) {
      const d = dById.get(id);
      if (!d || !whereInto(at, t1)) return Promise.resolve();
      if (d.gRes) { const r = d.gRes; d.gRes = null; r(); }
      leave(d);
      d.gx = t1.x; d.gz = t1.z; d.gs = o.speed ?? 1.4; d.after = o.then === 'patrol' ? 'return' : o.then || 'idle';
      d.gy0 = d.hover; d.gy1 = typeof o.y === 'number' ? o.y : NaN; d.gL = Math.max(0.01, Math.hypot(d.gx - d.x, d.gz - d.z));   // o.y: arrive at this hover height
      d.gCut = flow.cutscene;   // sent from a cutscene: a skip of it lands the flight at once
      if (skipping()) { d.x = d.px = d.gx; d.z = d.pz = d.gz; if (d.gy1 === d.gy1) d.hover = d.gy1; setSt(d, d.after); return Promise.resolve(); }
      setSt(d, 'goto');
      return new Promise((r) => { d.gRes = r; });
    },
    face(id, where) {
      const d = dById.get(id);
      if (!d || !whereInto(where, t1)) return;
      if (d.st !== 'idle') { leave(d); setSt(d, 'idle'); }
      d.faceX = t1.x; d.faceZ = t1.z; d.faceOn = true;
      if (skipping()) d.yaw = d.pyaw = Math.atan2(t1.x - d.x, t1.z - d.z);
    },
    release(id) { const d = dById.get(id); if (d) setSt(d, 'return'); },
    light(id, st) { const d = dById.get(id); if (d) lightD(d, st); },
    claw(id, k = 1, dur = 0.4) {   // the noise drone's claw: k 0 closed .. 1 open, eased over dur (instant while skipping)
      const d = dById.get(id);
      if (!d || !d.obj.userData.setClaw) return;
      d.clawTo = clamp(+k || 0, 0, 1); d.clawV = 1 / Math.max(0.02, dur);
      if (skipping() || !(dur > 0)) { d.clawK = d.clawTo; d.obj.userData.setClaw(d.clawK); }
    },
    state: (id) => { const d = dById.get(id); return d ? d.st : null; },
    inCone(id, who) { const d = dById.get(id), a = typeof who === 'string' ? world.actor(who) : who; return !!(d && a && inCone(d, a)); },
    cover(id, box) {
      const i = COV.findIndex((c) => c.id === id);
      if (box) { if (i >= 0) COV[i].box = box; else COV.push({ id, box }); } else if (i >= 0) COV.splice(i, 1);
    },
    // 1.6's zap: a harmless static discharge off a drone's courtesy field into someone's fingertip
    async zap(did, aid, o = {}) {
      if (skipping()) return;
      const g = gen, d = dById.get(did), a = world.actor(aid || state.active);
      if (!a) return;
      const hand = a.rig && a.rig.parts && (a.rig.parts.handR || a.rig.parts.handL);
      if (hand) { a.root.updateMatrixWorld(true); hand.getWorldPosition(t2); } else t2.set(a.pos.x, a.pos.y + 1.0, a.pos.z);
      const at = [t2.x, t2.y, t2.z];
      snd('static_zap', t2, 0.9);
      world.puff(at, { n: 14, color: 0xcfeeff, speed: 1.8, life: 0.3, gravity: 5 });
      if (d) lightD(d, 'white');
      const an = anim(['stumble', 'shake']);
      if (an !== 'idle') a.play(an);
      await wait(0.25);
      if (g !== gen) return;   // the scene moved on: no smoke or bark in the next one
      if (d && d.obj) lightD(d, LIGHT_OF[d.st] || 'patrol');
      await wait(0.2);
      if (g !== gen) return;
      world.puff(at, { n: 5, color: 0x8c8c8c, speed: 0.12, life: 1.6, gravity: -0.35 });   // "It's a little bit of smoke."
      if (o.line) barkD(o.line === true ? 'Static discharge! ^ For your safety!' : o.line);
      await wait(0.3);
    },
    warm(wo) {   // boot (99-main): one model of every kind, every light state, a cone, a route, the '?', the hug, the Safe Room
      const g = new THREE.Group(), kinds = typeof DRONE_KINDS !== 'undefined' && Array.isArray(DRONE_KINDS) ? DRONE_KINDS : ['courtesy', 'guardian', 'popup', 'cleaning', 'noise', 'fun', 'lifeguard', 'door'];
      const got = [];
      for (let i = 0; i < kinds.length; i++) {
        const m = modelGet(kinds[i]); m.position.set(i * 0.7, 1.4, 0); g.add(m); got.push(kinds[i], m);
        if (m.userData.setBeam) m.userData.setBeam(true);
      }
      for (let i = 0; i < 6; i++) { const m = modelGet('courtesy'); got.push('courtesy', m); }   // a few spare courtesy pods
      const lights = ['curious', 'escort', 'white', 'patrol'];
      const d = dMake(); d.len = 3; d.half = 0.4; d.yaw = 0; for (let i = 0; i <= NR; i++) d.rays[i] = 3; coneFill(d);
      for (const l of lights) coneMat(l);
      d.q.visible = true; g.add(d.cone, d.beam, d.q); if (d.shadow) g.add(d.shadow);
      const rb = ribMake(); ribFill(rb, [[0, 0], [2, 0], [2, 2]], false); rb.mesh.visible = true; g.add(rb.mesh);
      const hg = hugGet(); hg.visible = true; g.add(hg);
      wo(g);
      for (const l of lights) { for (let i = 0; i < got.length; i += 2) if (got[i + 1].userData.setLight) got[i + 1].userData.setLight(l); wo(g); }
      for (let i = 0; i < got.length; i += 2) { const m = got[i + 1]; if (m.userData.setBeam) m.userData.setBeam(false); modelPut(got[i], m); }
      g.remove(d.cone, d.beam, d.q); if (d.shadow) g.remove(d.shadow); d.q.visible = false; dFree.push(d);
      for (let i = 0; i < 7; i++) dFree.push(dMake());
      g.remove(rb.mesh); rb.mesh.visible = false; ribFree.push(rb); for (let i = 0; i < 7; i++) ribFree.push(ribMake());
      g.remove(hg); hg.visible = false;
      srWarm();
    },
  };

  // ============================================================ the Safe Room (13.7)
  // Its own tiny scene with the sets' light rig (hemi + dir + spot + FogExp2: the same shader programs), drawn
  // full-screen right after the world (whose set is hidden meanwhile, never unloaded). The captured actor's root moves
  // in to sit on the beanbag and goes back after.
  const SR = { on: false, scene: null, cam: null, room: null, quiet: null, dRoom: null, dQuiet: null, variant: 'room', actor: null, home: null, hidden: null, t: 0, back: [0, 0, 0, 0], hemi: null, dl: null, dim: 0, dimTo: 0 };
  const SR_VIEW = {
    room:  { from: [1.75, 2.05, 1.9], to: [1.4, 1.8, 1.5], look: [-0.7, 0.66, -0.85], fov: 52, bag: [-0.75, -0.85], drone: [-1.5, 2.15, -1.45], dk: 'courtesy' },
    quiet: { from: [2.2, 1.8, 2.25], to: [1.85, 1.62, 1.85], look: [-0.65, 0.62, -0.7], fov: 48, bag: [-0.7, -0.75], drone: [0.95, 1.95, -1.35], dk: 'fun' },
  };
  const SR_LINE = 'You are not in trouble. ^ You are in danger.', SR_ASK = 'Would you like to try again?';
  function rrect(w, d, r, seg) {   // a rounded rectangle outline in the floor plane: [[x, z], ...]
    const out = [], hw = w / 2 - r, hd = d / 2 - r, C = [[hw, hd], [-hw, hd], [-hw, -hd], [hw, -hd]];
    for (let c = 0; c < 4; c++) for (let k = 0; k <= seg; k++) { const a = (c + k / seg) * H; out.push([C[c][0] + r * Math.cos(a), C[c][1] + r * Math.sin(a)]); }
    return out;
  }
  function triGeo(pos, uv, inward) {   // non-indexed triangles; flips the winding if the first face points the wrong way
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3));
    g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uv), 2));
    const p = g.attributes.position, a = V().fromBufferAttribute(p, 0), b = V().fromBufferAttribute(p, 1), c = V().fromBufferAttribute(p, 2);
    const n = b.clone().sub(a).cross(c.clone().sub(a));
    if (n.dot(inward(a)) < 0) {
      const P = p.array, U = g.attributes.uv.array;
      for (let i = 0; i < p.count; i += 3) for (let k = 0; k < 3; k++) { const s = P[(i + 1) * 3 + k]; P[(i + 1) * 3 + k] = P[(i + 2) * 3 + k]; P[(i + 2) * 3 + k] = s; if (k < 2) { const t = U[(i + 1) * 2 + k]; U[(i + 1) * 2 + k] = U[(i + 2) * 2 + k]; U[(i + 2) * 2 + k] = t; } }
    }
    g.computeVertexNormals();
    return g;
  }
  function wallGeo(ol, ht, tile) {
    const pos = [], uv = [], n = ol.length;
    let acc = 0;
    for (let i = 0; i < n; i++) {
      const a = ol[i], b = ol[(i + 1) % n], L = Math.hypot(b[0] - a[0], b[1] - a[1]), u0 = acc / tile, u1 = (acc + L) / tile, v = ht / tile;
      pos.push(a[0], 0, a[1], b[0], 0, b[1], b[0], ht, b[1], a[0], 0, a[1], b[0], ht, b[1], a[0], ht, a[1]);
      uv.push(u0, 0, u1, 0, u1, v, u0, 0, u1, v, u0, v);
      acc += L;
    }
    return triGeo(pos, uv, (p) => V().set(-p.x, 0, -p.z));
  }
  function capGeo(ol, y, up, tile) {
    const pos = [], uv = [], n = ol.length;
    for (let i = 0; i < n; i++) {
      const a = ol[i], b = ol[(i + 1) % n];
      pos.push(0, y, 0, a[0], y, a[1], b[0], y, b[1]);
      uv.push(0, 0, a[0] / tile, a[1] / tile, b[0] / tile, b[1] / tile);
    }
    return triGeo(pos, uv, () => V().set(0, up ? 1 : -1, 0));
  }
  function beanbag(hex, x, z) {   // a slumped bag with the dent you sit in, folds painted into the vertex colours
    const g = new THREE.SphereGeometry(0.52, 14, 9), p = g.attributes.position, c = new THREE.Color(hex), col = new Float32Array(p.count * 3);
    for (let i = 0; i < p.count; i++) {
      const x0 = p.getX(i), z0 = p.getZ(i);
      let y0 = p.getY(i) * 0.62;
      if (y0 < -0.2) y0 = -0.2 + (y0 + 0.2) * 0.3;
      const r2 = x0 * x0 + (z0 + 0.08) * (z0 + 0.08);
      if (y0 > 0) y0 -= 0.16 * Math.exp(-r2 / 0.07);
      p.setXYZ(i, x0 * 1.06 + x, y0 + 0.25, z0 + z);
      const k = 0.84 + 0.16 * Math.sin(x0 * 17 + z0 * 11) * Math.sin(y0 * 13);
      col[i * 3] = c.r * k; col[i * 3 + 1] = c.g * k; col[i * 3 + 2] = c.b * k;
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.computeVertexNormals();
    return g;
  }
  function paintQuilt(c, w, h) {   // padded white: diamond tufting with buttons
    c.fillStyle = '#eef0f3'; c.fillRect(0, 0, w, h);
    const q = w / 4;
    for (let i = -1; i <= 5; i++) for (let j = -1; j <= 5; j++) if ((i + j) & 1) {
      const g = c.createRadialGradient(i * q, j * q, 2, i * q, j * q, q * 1.05);
      g.addColorStop(0, 'rgba(255,255,255,0.95)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = g; c.fillRect(i * q - q, j * q - q, q * 2, q * 2);
    }
    c.strokeStyle = 'rgba(160,168,182,0.55)'; c.lineWidth = 2;
    for (let n = -4; n <= 8; n++) { c.beginPath(); c.moveTo(n * q * 2 - h, -h + h); c.lineTo(n * q * 2 + h, h + h); c.stroke(); }
    for (let n = -4; n <= 8; n++) { c.beginPath(); c.moveTo(n * q * 2 + h, -h + h); c.lineTo(n * q * 2 - h, h + h); c.stroke(); }
    for (let i = 0; i <= 4; i++) for (let j = 0; j <= 4; j++) if (!((i + j) & 1)) {
      c.fillStyle = '#b9c0cb'; c.beginPath(); c.arc(i * q, j * q, 3.5, 0, TAU); c.fill();
      c.fillStyle = '#f8f9fb'; c.beginPath(); c.arc(i * q - 1, j * q - 1, 1.3, 0, TAU); c.fill();
    }
  }
  function paintPoster(c, w, h) {
    c.fillStyle = '#f6f1e6'; c.fillRect(0, 0, w, h);
    const sky = c.createRadialGradient(w / 2, 128, 8, w / 2, 128, 96);
    sky.addColorStop(0, '#d4ecff'); sky.addColorStop(0.75, '#e6f2fb'); sky.addColorStop(1, 'rgba(246,241,230,0)');
    c.fillStyle = sky; c.fillRect(0, 20, w, 210);
    c.fillStyle = '#ffd56a'; c.beginPath(); c.arc(w / 2, 170, 34, PI, TAU); c.fill();                 // a calm sunrise
    c.fillStyle = '#9cc8a0'; c.fillRect(24, 168, w - 48, 6);
    c.fillStyle = '#ffffff'; c.strokeStyle = '#9aa6b8'; c.lineWidth = 2;                             // a smiling Courtesy Drone
    c.beginPath(); c.ellipse(w / 2, 100, 34, 26, 0, 0, TAU); c.fill(); c.stroke();
    c.fillStyle = '#1a2028'; c.fillRect(w / 2 - 30, 92, 60, 10);
    c.fillStyle = '#6fc8ff'; c.fillRect(w / 2 - 14, 95, 28, 4);
    c.strokeStyle = '#4a5a70'; c.beginPath(); c.arc(w / 2, 108, 9, 0.2 * PI, 0.8 * PI); c.stroke();
    c.fillStyle = '#e8607a'; c.beginPath(); c.arc(w / 2 + 44, 72, 6, 0, TAU); c.arc(w / 2 + 52, 72, 6, 0, TAU); c.fill();
    c.beginPath(); c.moveTo(w / 2 + 38, 74); c.lineTo(w / 2 + 48, 86); c.lineTo(w / 2 + 58, 74); c.fill();
    c.fillStyle = '#1d3a6e'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = 'bold 38px Arial, sans-serif';
    c.fillText('YOU ARE', w / 2, 238, w - 30); c.fillText('SAFE NOW', w / 2, 278, w - 30);
    c.fillStyle = '#7a8aa0'; c.font = '13px Arial, sans-serif'; c.fillText('SafeSense', w / 2, 306);
  }
  function paintQuiet(c, w, h) {
    c.fillStyle = '#2f7f86'; c.beginPath(); c.roundRect(2, 2, w - 4, h - 4, 14); c.fill();
    c.fillStyle = '#f2f6f4'; c.font = 'bold 30px Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('QUIET CORNER', w / 2 + 14, h / 2 + 1, w - 60);
    c.beginPath(); c.arc(26, h / 2, 12, 0.6, TAU - 0.6); c.lineTo(26, h / 2); c.fill();          // a little moon
  }
  function kettleObj() {
    if (typeof PROPS !== 'undefined' && PROPS && typeof PROPS.kettle === 'function') { try { return PROPS.kettle(); } catch (e) { /* art changed: build our own */ } }
    const b = new Builder();
    b.cyl(0.1, 0.105, 0.02, 12, mat(0x2e3034), [0, 0.01, 0]);
    b.add(new THREE.LatheGeometry([[0.001, 0.02], [0.085, 0.02], [0.09, 0.1], [0.082, 0.2], [0.06, 0.23], [0.001, 0.232]].map(([r, y]) => new THREE.Vector2(r, y)), 12), mat(0xefeeea));
    b.box(0.022, 0.16, 0.026, mat(0xe4e3df), [0, 0.13, -0.12]); b.box(0.02, 0.03, 0.05, mat(0xe4e3df), [0, 0.19, 0.1]);
    return b.done({ floor: false });
  }
  function srRoom() {
    const b = new Builder(), W = 4.4, HT = 2.7, ol = rrect(W, W, 0.85, 4);
    const quilt = tex('sys_quilt', 128, 128, paintQuilt, { repeat: [1, 1] }), poster = tex('sys_poster', 256, 320, paintPoster);
    b.add(wallGeo(ol, HT, 0.8), matTex(quilt));
    b.add(capGeo(ol, 0, true, 0.8), matTex(quilt, { color: 0xd6dce5 }));
    b.add(capGeo(ol, HT, false, 1), mat(0xf6f7f9));
    b.plane(1.3, 1.3, mat(0xffffff, { emissive: 0xf4f8ff, emissiveIntensity: 0.55 }), [0, HT - 0.01, 0], [H, 0, 0]);   // the ceiling light
    b.add(beanbag(0x6f9bd6, -0.75, -0.85), mat(0xffffff));
    b.box(0.5, 0.42, 0.5, matTex(quilt, { color: 0xe6eaf0 }), [-1.55, 0.21, 0.1]);                                     // a padded side table
    b.box(0.86, 1.06, 0.04, mat(0x2a2f38), [0.45, 1.55, -W / 2 + 0.03]);                                                // the poster, framed
    b.plane(0.74, 0.94, matTex(poster), [0.45, 1.55, -W / 2 + 0.055]);
    b.box(W - 1.9, 0.12, 0.06, mat(0xdfe3ea), [0, 0.06, -W / 2 + 0.03]);                                                  // a soft skirting
    const g = b.done({ floor: true, ambient: 0.82 });
    const k = kettleObj(); k.position.set(-1.55, 0.42, 0.12); k.rotation.y = 0.9; g.add(k);
    g.name = 'safe_room';
    return g;
  }
  function srQuiet() {   // 3.1's Quiet Corner: a beanbag behind a felt partition in the atrium, tinsel on top
    const b = new Builder(), sign = tex('sys_quiet', 256, 64, paintQuiet), wall = mat(0x8c98aa), felt = mat(0x5f7f9a), felt2 = mat(0x6a8aa4), rail = mat(0xb8bec8);
    b.box(7, 0.02, 7, mat(0x3c5a66), [0, -0.01, 0]);
    b.box(7, 3.2, 0.1, wall, [0, 1.6, -2.3]); b.box(0.1, 3.2, 7, wall, [-2.5, 1.6, 0]);
    b.box(6.9, 0.25, 0.04, mat(0xe8e2d0), [0, 2.5, -2.24]);
    b.box(1.05, 1.45, 0.06, felt, [-1.65, 0.75, 0.35]); b.box(1.05, 1.45, 0.06, felt2, [-0.55, 0.75, 0.35]);
    b.box(2.25, 0.04, 0.08, rail, [-1.1, 1.49, 0.35]);
    for (const x of [-2.2, -1.1, 0.0]) { b.box(0.04, 1.49, 0.08, rail, [x, 0.745, 0.35]); b.box(0.06, 0.03, 0.4, rail, [x, 0.015, 0.35]); }
    b.plane(0.9, 0.225, matTex(sign), [-0.55, 1.18, 0.385]);
    for (let i = 0; i < 11; i++) b.box(0.2, 0.05, 0.06, mat(i & 1 ? 0xd8b440 : 0xc83a3a), [-2.15 + i * 0.205, 1.53, 0.35]);
    b.add(beanbag(0xe0873a, -0.7, -0.75), mat(0xffffff));
    b.cyl(0.16, 0.12, 0.34, 8, mat(0xd8d2c4), [-2.0, 0.17, -1.8]);
    for (const [x, y, z] of [[-2.0, 0.5, -1.8], [-1.9, 0.62, -1.75], [-2.1, 0.58, -1.86]]) b.add(new THREE.IcosahedronGeometry(0.18, 0).translate(x, y, z), mat(0x5a8a4a));
    const g = b.done({ floor: true, ambient: 0.78 });
    g.name = 'quiet_corner';
    return g;
  }
  function srBuild() {
    if (SR.scene) return;
    const sc = new THREE.Scene();
    sc.background = new THREE.Color(0xeef1f5); sc.fog = new THREE.FogExp2(0xeef1f5, 0.0001);
    const hemi = new THREE.HemisphereLight(0xffffff, 0xd6dce6, 1.55), dl = new THREE.DirectionalLight(0xfff6ec, 0.85), sp = new THREE.SpotLight(0xffffff, 0);
    dl.position.set(1.2, 3.5, 2.4);
    sc.add(hemi, dl, sp, sp.target);
    SR.hemi = hemi; SR.dl = dl;
    SR.room = srRoom(); SR.quiet = srQuiet();
    SR.dRoom = modelGet(SR_VIEW.room.dk); SR.dQuiet = modelGet(SR_VIEW.quiet.dk);
    sc.add(SR.room, SR.quiet, SR.dRoom, SR.dQuiet);
    SR.scene = sc; SR.cam = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.05, 40);
  }
  function srWarm() {   // boot: compile + upload both variants under the loader
    srBuild();
    const cv = renderer.domElement;
    SR.cam.aspect = cv.width / cv.height; SR.cam.position.set(0.5, 1.6, 3.2); SR.cam.lookAt(0, 0.8, 0); SR.cam.updateProjectionMatrix();
    renderer.compile(SR.scene, SR.cam);
    SR.scene.traverse((o) => { const m = o.material; if (m && m.map) renderer.initTexture(m.map); });
    renderer.render(SR.scene, SR.cam);
  }
  function srCam(dt) {
    const v = SR_VIEW[SR.variant], c = SR.cam;
    SR.t += dt;
    const k = smooth(Math.min(1, SR.t / 6));   // a slow push in
    c.position.set(v.from[0] + (v.to[0] - v.from[0]) * k, v.from[1] + (v.to[1] - v.from[1]) * k, v.from[2] + (v.to[2] - v.from[2]) * k);
    c.lookAt(v.look[0], v.look[1], v.look[2]);
    if (c.fov !== v.fov) { c.fov = v.fov; c.updateProjectionMatrix(); }
    const dr = SR.variant === 'room' ? SR.dRoom : SR.dQuiet;
    dr.position.y = v.drone[1] + Math.sin(SR.t * 2.1) * 0.04;
    SR.dim += (SR.dimTo - SR.dim) * Math.min(1, dt * 5);   // the lights go down for the question (the glass pop-up reads on white)
    SR.hemi.intensity = 1.55 - 0.95 * SR.dim; SR.dl.intensity = 0.85 - 0.55 * SR.dim;
  }
  function srOn(variant, who) {
    srBuild();
    const v = SR_VIEW[variant];
    SR.variant = variant; SR.t = 0; SR.dim = SR.dimTo = 0;
    SR.room.visible = variant === 'room'; SR.quiet.visible = variant === 'quiet';
    SR.dRoom.visible = variant === 'room'; SR.dQuiet.visible = variant === 'quiet';
    const dr = variant === 'room' ? SR.dRoom : SR.dQuiet;
    dr.position.set(v.drone[0], v.drone[1], v.drone[2]); dr.rotation.y = Math.atan2(v.bag[0] - v.drone[0], v.bag[1] - v.drone[2]);
    if (dr.userData.setLight) dr.userData.setLight('patrol');
    SR.hidden = world.scene; if (SR.hidden) SR.hidden.visible = false;
    const a = who ? world.actor(who) : null;
    if (a) {
      SR.actor = a; SR.home = a.root.parent;
      const bk = SR.back; bk[0] = a.pos.x; bk[1] = a.pos.y; bk[2] = a.pos.z; bk[3] = a.rotY;   // where he goes back to
      a.root.userData.noDress = true;   // a visit, not a spawn: 04-art's 'added' re-dress would drop the scene's wardrobe toggles
      SR.scene.add(a.root);
      a.root.userData.noDress = false;
      a.place([v.bag[0], 0, v.bag[1], Math.atan2(v.from[0] - v.bag[0], v.from[2] - v.bag[1])]);
      a.play(anim(['sit', 'sit_bench']), { h: 0.38 });
    }
    srCam(0);
    SR.on = true;
    document.body.classList.add('saferoom');   // no HUD, swap indicator or objective in the Safe Room
  }
  function srOff() {
    if (!SR.on) return;
    SR.on = false;
    document.body.classList.remove('saferoom');
    const a = SR.actor;
    SR.actor = null;
    if (a) {
      if (SR.home) { a.root.userData.noDress = true; SR.home.add(a.root); a.root.userData.noDress = false; }
      a.play('idle'); a.rig.seated = false; a.place(SR.back);   // (onRetry may place him again)
    }
    if (SR.hidden) SR.hidden.visible = true;
    SR.hidden = null; SR.home = null;
  }
  async function askRetry() { // "Would you like to try again? [YES]": the one pop-up left visible in the room
    const p = popup({ style: 'safesense', msg: SR_ASK, buttons: ['YES'], at: 'center', w: 380 });
    p.el.classList.add('sr-keep');
    try { await p.done; } finally { p.el.classList.remove('sr-keep'); }
  }
  async function safeRoom(o = {}) {
    const g = gen, variant = o.variant === 'quiet' ? 'quiet' : 'room', who = o.who === undefined ? state.active : o.who;
    if (skipping() || SR.on) { if (o.onRetry) o.onRetry(); return; }
    log('safe room ' + variant);
    emit('saferoom', variant);
    const tint = variant === 'quiet' ? '#1e2733' : '#eef1f5';
    chipOff();
    if (variant === 'quiet' && world.mark('quiet_beanbag')) return hostCorner(o, who, g);   // 3.1: hq_atrium's own corner
    await ui.fade(1, 0.3, tint);
    if (g !== gen) return;
    barkClear();   // the escort's "Gotcha!" doesn't talk over the room
    srOn(variant, who);
    if (typeof music === 'function' && music.silence) music.silence(true);
    ui.fade(0, 0.35);
    await say('drone', SR_LINE, { auto: 0.6 });
    if (g !== gen) return;
    SR.dimTo = 1;
    await askRetry();   // the only button
    if (g !== gen) return;
    await ui.fade(1, 0.3, tint);
    srOff();
    if (typeof music === 'function' && music.silence) music.silence(false);
    if (g !== gen) return;
    if (o.onRetry) o.onRetry();
    log('safe room retry');
    ui.fade(0, 0.4);
  }

  // The host set's own Quiet Corner (hq_atrium.md §9: marks quiet_beanbag + quiet_drone, anchor quiet_corner) instead of
  // the drawn one: the captured character sits on the set's beanbag, a drone hovers at quiet_drone, the corner's shot.
  async function hostCorner(o, who, g) {
    const a = who ? world.actor(who) : null, bk = SR.back, m = world.mark('quiet_drone');
    await ui.fade(1, 0.3, '#1e2733');
    if (g !== gen) return;
    barkClear();
    if (a) { bk[0] = a.pos.x; bk[1] = a.pos.y; bk[2] = a.pos.z; bk[3] = a.rotY; a.place('quiet_beanbag'); a.play(anim(['sit', 'sit_bench']), { h: 0.3 }); }
    if (m) { DRONES.spawn('_quiet_drone', { at: [m[0], 0, m[2]], hover: m[1] || 2.1, cone: false, ai: false, showPath: false }); DRONES.face('_quiet_drone', 'quiet_beanbag'); }
    cam.shot(world.anchor('quiet_corner') ? { shot: 'INSERT', at: 'quiet_corner' } : { shot: 'MID', on: who || 'quiet_beanbag' });
    document.body.classList.add('saferoom');
    if (typeof music === 'function' && music.silence) music.silence(true);
    ui.fade(0, 0.35);
    await say('drone', SR_LINE, { auto: 0.6 });
    if (g !== gen) return;
    await askRetry();
    if (g !== gen) return;
    await ui.fade(1, 0.3, '#1e2733');
    document.body.classList.remove('saferoom');
    if (typeof music === 'function' && music.silence) music.silence(false);
    DRONES.remove('_quiet_drone');
    if (a) { a.play('idle'); a.rig.seated = false; a.place(bk); }
    cam.release(0);
    if (g !== gen) return;
    if (o.onRetry) o.onRetry();
    log('safe room retry');
    ui.fade(0, 0.4);
  }

  // ============================================================ stealth
  // Checkpoints: a snapshot of where the party stood (or the checkpoint's own `at`) whenever the player enters a new
  // checkpoint box / set zone. Retry restores it with drones reset and the Signal empty.
  const SNAP = { ids: ['', '', '', ''], p: new Float32Array(16), n: 0, cp: null };
  let cpKey;
  function snapNow(cp) {
    SNAP.cp = cp && cp.at != null ? cp : null; SNAP.n = 0;
    for (let i = 0; i < PARTY.length; i++) {
      const a = world.actor(PARTY[i]);
      if (!here(a)) continue;
      const k = SNAP.n++;
      SNAP.ids[k] = a.id; SNAP.p[k * 4] = a.pos.x; SNAP.p[k * 4 + 1] = a.pos.y; SNAP.p[k * 4 + 2] = a.pos.z; SNAP.p[k * 4 + 3] = a.rotY;
    }
  }
  function snapRestore() {
    const cp = SNAP.cp;
    if (cp) {
      const at = cp.at;
      if (at && typeof at === 'object' && !Array.isArray(at) && !at.isVector3) { for (const id in at) { const a = world.actor(id); if (a) a.place(at[id]); } return; }
      const p = player.actor;
      if (!p || !whereInto(at, t1)) return;
      const r = whereRot === whereRot ? whereRot : p.rotY;
      p.place([t1.x, t1.y, t1.z, r]);
      let k = 1;
      for (let i = 0; i < PARTY.length; i++) {   // the others in a line behind him
        const a = world.actor(PARTY[i]);
        if (!a || a === p || !here(a)) continue;
        a.place([t1.x - Math.sin(r) * 0.8 * k, t1.y, t1.z - Math.cos(r) * 0.8 * k, r]); k++;
      }
      return;
    }
    for (let k = 0; k < SNAP.n; k++) { const a = world.actor(SNAP.ids[k]); if (a) a.place([SNAP.p[k * 4], SNAP.p[k * 4 + 1], SNAP.p[k * 4 + 2], SNAP.p[k * 4 + 3]]); }
  }
  function cpKeyAt(x, z) {
    const cps = stealth.opts && stealth.opts.checkpoints;
    if (cps && cps.length) {
      for (let i = 0; i < cps.length; i++) { const c = cps[i]; if ((c.box && inBox(c.box, x, z)) || (c.zone && zoneAt(x, z) === c.zone)) return i; }
      return null;
    }
    return zoneAt(x, z) || null;
  }
  function stealthTick() {
    if (!stealth.active || stealth.busy || SR.on) return;
    const a = player.actor;
    if (!here(a)) return;
    const key = cpKeyAt(a.pos.x, a.pos.z);
    if (key == null || key === cpKey) return;
    cpKey = key;
    const cps = stealth.opts.checkpoints, cp = typeof key === 'number' && cps ? cps[key] : null;
    snapNow(cp);
    log('checkpoint ' + ((cp && cp.id) || key));
    emit('stealth:checkpoint', key);
  }
  function retryNow() {
    hugHide();
    DRONES.reset();
    snapRestore();
    chip.reset();
    for (let i = 0; i < pairs.length; i++) for (let k = 0; k < pairs[i].ends.length; k++) if (pairs[i].ends[k].holder) endRelease(pairs[i].ends[k]);
    if (!cam.cutscene) cam.release(0);   // cut straight to the zone's camera
    log('stealth retry');
    emit('stealth:retry', cpKey);
    if (stealth.opts && stealth.opts.onRetry) stealth.opts.onRetry(cpKey);
  }
  const stealth = {
    active: false, busy: false, captures: 0, opts: null,
    escortAfter: 1.4, forgetAfter: 2, escortSpeed: 3.6, zoneR: 16, autoCapture: false,
    begin(o = {}) {
      stealth.opts = o; stealth.active = true; stealth.busy = false;
      stealth.escortAfter = o.escortAfter ?? 1.4; stealth.forgetAfter = o.forgetAfter ?? 2; stealth.escortSpeed = o.escortSpeed ?? 3.6;
      stealth.zoneR = o.zoneR ?? 16; stealth.autoCapture = !!o.autoCapture;
      cpKey = undefined; snapNow(null);   // where the stealth starts is the first checkpoint
      const a = player.actor; if (here(a)) cpKey = cpKeyAt(a.pos.x, a.pos.z);
      log('stealth begin');
    },
    end(o) { stealth.active = false; stealth.opts = null; cpKey = undefined; if (!o || o.calm !== false) DRONES.calm(); log('stealth end'); },   // { calm: false }: lured / curious drones carry on
    checkpoint() { snapNow(null); },
    get key() { return cpKey; },
    async capture(who, o = {}) {
      if (stealth.busy || SR.on) return false;
      const g = gen, a = world.actor(who || state.active), wasBusy = flow.busy;
      stealth.busy = true;
      flow.busy = true; player.enabled = false; ui.prompt(null); hotspots.reset(); chipOff();
      log('stealth capture ' + (a ? a.id : '-'));
      emit('stealth:capture', a ? a.id : null);
      if (o.turn && a) { DRONES.turn(a); await wait(TEST.auto ? 0.4 : 1.2); if (g !== gen) return false; }
      if (a) { a.place(a.pos); hugShow(a); snd('hug_field', a.pos, 0.8); }
      if (o.line !== false) barkD(DRONES.lines.escort);
      if (stealth.opts && stealth.opts.onCapture) { try { stealth.opts.onCapture(a ? a.id : null); } catch (e) { console.error('TWO: stealth onCapture', e); } }
      await wait(TEST.auto ? 0.4 : 1.1);
      if (g !== gen) return false;
      if (stealth.opts && stealth.opts.safeRoom === false) {   // no Safe Room here (2.7's carriage): just start the zone again
        await ui.fade(1, 0.3); if (g !== gen) return false;
        retryNow(); ui.fade(0, 0.4);
      } else await safeRoom({ variant: o.variant || (stealth.opts && stealth.opts.variant), who: a ? a.id : null, onRetry: retryNow });
      if (g !== gen) return false;
      hugHide();
      stealth.busy = false; stealth.captures++;
      flow.busy = wasBusy;
      if (flow.roaming && !flow.busy) player.enabled = true;
      return true;
    },
    softFail(who = 'chase40', o = {}) {   // Signal full / "Signal detected. Hello, Chase!": the drones turn, then the Safe Room
      if (!stealth.active) { DRONES.alert(who); return Promise.resolve(false); }
      log('stealth softfail ' + who);
      return stealth.capture(who, Object.assign({ turn: true, line: false }, o));
    },
  };
  on('signal:full', (e) => { const who = (e && e.who) || 'chase40'; if (stealth.active) stealth.softFail(who); else DRONES.alert(who); });

  // ============================================================ strengthHold
  const holds = [];
  function strengthHold(o = {}) {
    const r = { o, who: o.who || 'luka', label: o.label ?? 'Lift', dur: Math.max(0.2, o.dur ?? 1.6), k: 0, idle: 0, keep: false, held: false, g: gen, res: null, autoT: 0, anim: 'idle',
      cut: flow.cutscene };   // made inside a cutscene (a hotspot's steps): a skip of it completes the hold
    const h = { get k() { return r.k; }, get full() { return r.keep || r.k >= 1; }, get held() { return r.held; }, done: null,
      cancel: () => holdEnd(r, r.keep), then: (a, b) => h.done.then(a, b) };
    h.done = new Promise((res) => { r.res = res; });
    if (skipping()) {   // a cutscene being skipped: it just happened
      if (o.onProgress) o.onProgress(1); if (o.onFull) o.onFull(); if (o.keep && o.onRelease) o.onRelease(true);
      r.res(true); return h;
    }
    const a = world.actor(r.who);
    if (a && o.at != null && whereInto(o.at, t1)) a.face(t1);
    r.anim = anim(o.anim ? [o.anim] : ['lift_strain', 'push', 'carry']);
    holds.push(r);
    ui.prompt('HOLD — ' + r.label);
    log('hold ' + r.label);
    return h;
  }
  function holdEnd(r, v) {
    const i = holds.indexOf(r);
    if (i < 0) return;
    holds.splice(i, 1);
    ui.meter(null, null); ui.prompt(null); input.unlatch('yes');
    const a = world.actor(r.who);
    if (a && a.anim === r.anim) a.play('idle');
    log('hold ' + r.label + (v ? ' ok' : ' let go'));
    r.res(!!v);
  }
  function holdsTick(dt) {
    for (let i = holds.length - 1; i >= 0; i--) {
      const r = holds[i], o = r.o;
      if (r.g !== gen) { holdEnd(r, false); continue; }
      if (r.cut && skipping()) {   // begun inside a cutscene that is now skipped: it just happened (as one begun while skipping)
        if (o.onProgress) o.onProgress(1);
        if (!r.keep && o.onFull) o.onFull();
        if (o.keep && o.onRelease) o.onRelease(true);
        holdEnd(r, true); continue;
      }
      const a = world.actor(r.who), auto = TEST.auto;
      if (auto) r.autoT += dt;
      let held = auto ? !r.keep || r.autoT < (o.autoHold ?? 1.2) : input.holding('yes'), quit = false;
      if (!auto && input.pressed('no')) { input.consume('no'); held = false; quit = true; }
      r.held = held;
      if (a) { if (held && a.anim !== r.anim) a.play(r.anim); else if (!held && a.anim === r.anim) a.play('idle'); }
      if (!r.keep) {
        if (held) { r.k = Math.min(1, r.k + (dt / r.dur) * (auto ? 2.5 : 1)); r.idle = 0; }
        else { r.k = Math.max(0, r.k - dt * 0.9); r.idle += dt; }   // let go: it sinks back
        if (o.onProgress) o.onProgress(r.k);
        ui.meter(r.label, r.k);
        if (r.k >= 1) {
          if (o.onFull) o.onFull();
          if (!o.keep) { holdEnd(r, true); continue; }
          r.keep = true; r.autoT = 0;
        } else if (quit || (r.idle > 0.6 && r.k <= 0)) holdEnd(r, false);   // a tap, NO, or let all the way down: try again
        continue;
      }
      ui.meter(r.label, 0.93 + 0.07 * Math.sin(clock.t * 37));   // up, straining: only while held
      if (!held) { if (o.onRelease) o.onRelease(true); holdEnd(r, true); }
    }
  }

  // ============================================================ pairSwitch
  const pairs = [], pairById = new Map();
  let pairSeq = 0;
  const HOLD_ANIM = () => anim(['push', 'lift_strain', 'carry']);
  function partnerFor(E) {   // the nearest other playable who could take this end
    const P = E.P, me = player.actor;
    if (!me) return null;
    const ids = P.who || PARTY;
    let best = null, bd = 6;
    for (let i = 0; i < ids.length; i++) {
      const a = world.actor(ids[i]);
      if (!here(a) || a === me || P.ends[0].holder === a.id || P.ends[1].holder === a.id) continue;
      const d = Math.hypot(a.pos.x - me.pos.x, a.pos.z - me.pos.z);
      if (d < bd) { bd = d; best = a; }
    }
    return best;
  }
  function endVerb(E) {
    const P = E.P, O = P.ends[1 - E.i];
    if (E.holder) return 'Let go';
    if (O.holder) return P.label;
    return partnerFor(E) ? 'Hold this' : 'Hold';
  }
  function endHold(E, id) {
    const a = world.actor(id);
    if (!a) return;
    E.holder = id; E.arrived = false;
    if (id === state.active) { E.sx = a.pos.x; E.sz = a.pos.z; }
    else {
      if (E.stand) t1.copy(E.stand);
      else { const dx = a.pos.x - E.at.x, dz = a.pos.z - E.at.z, L = Math.hypot(dx, dz) || 1; t1.set(E.at.x + (dx / L) * 0.6, E.at.y, E.at.z + (dz / L) * 0.6); }
      E.sx = t1.x; E.sz = t1.z;
      waitPos(id, true);
      a.moveTo([t1.x, t1.y, t1.z], { collide: true });
    }
    log('pair ' + E.P.id + ' ' + E.i + ' ' + id);
  }
  function endRelease(E) {
    const id = E.holder;
    E.holder = null; E.arrived = false;
    const a = id && world.actor(id);
    if (a && a.anim === HOLD_ANIM()) a.play('idle');
    if (id && id !== state.active) waitPos(id, false);
  }
  function endAction(E) {
    const P = E.P, O = P.ends[1 - E.i];
    if (P.done) return;
    if (E.holder) endRelease(E);                              // YES at a held end: let go
    else if (O.holder) endHold(E, state.active);              // the other end's held: this does it
    else { const pa = partnerFor(E); endHold(E, pa ? pa.id : state.active); }   // "Hold this"
    hotspots.reset();
    if (P.o.onChange) P.o.onChange((P.ends[0].holder ? 1 : 0) + (P.ends[1].holder ? 1 : 0));
  }
  function pairSwitch(o = {}) {
    const P = { id: o.id || 'pair' + ++pairSeq, o, label: o.label || 'Turn', who: o.who || null, need: o.hold ?? 0.5, both: 0, done: false, g: gen, res: null, autoT: 0, ends: [],
      cut: flow.cutscene };   // (a roam's pair is never completed by skipping some other spot's little cutscene)
    const h = { id: P.id, done: null, then: (a, b) => h.done.then(a, b), end: () => pairEnd(P, false), auto: () => pairAuto(P),
      get held() { return (P.ends[0] && P.ends[0].arrived ? 1 : 0) + (P.ends[1] && P.ends[1].arrived ? 1 : 0); } };
    h.done = new Promise((res) => { P.res = res; });
    pairEnd(pairById.get(P.id), false);
    const src = o.ends || hotspots.list.filter((x) => x.pair === P.id);
    for (let i = 0; i < 2 && i < src.length; i++) {
      const e = src[i], adopted = hotspots.list.indexOf(e) >= 0;
      const E = { P, i, hs: null, at: V(), stand: null, holder: null, arrived: false, adopted, sx: 0, sz: 0 };
      if (!whereInto(e.at ?? e.id, E.at)) console.warn('TWO: pairSwitch ' + P.id + ': no place for end ' + i);
      if (e.stand != null) { E.stand = V(); whereInto(e.stand, E.stand); }
      const hs = adopted ? e : { id: e.id || P.id + '_' + i, at: [E.at.x, E.at.y, E.at.z], r: e.r ?? 1.2 };
      if (!adopted) hs.when = P.who ? (s) => !P.done && P.who.includes(s.active) : () => !P.done;
      hs.do = () => endAction(E);
      Object.defineProperty(hs, 'verb', { get: () => endVerb(E), configurable: true, enumerable: true });
      if (!adopted) hotspots.list.push(hs);
      E.hs = hs; P.ends.push(E);
    }
    if (P.ends.length < 2) { console.warn('TWO: pairSwitch ' + P.id + ' needs two ends'); pairEnd(P, false); P.res(false); return h; }
    pairs.push(P); pairById.set(P.id, P);
    log('pair ' + P.id);
    if (skipping()) pairDone(P);
    return h;
  }
  function pairEnd(P, v) {
    if (!P) return;
    const i = pairs.indexOf(P);
    if (i >= 0) pairs.splice(i, 1);
    if (pairById.get(P.id) === P) pairById.delete(P.id);
    for (let k = 0; k < P.ends.length; k++) {
      const E = P.ends[k];
      if (E.holder && !(v && P.o.keep)) endRelease(E);
      const hs = E.hs;
      if (!hs) continue;
      if (E.adopted) { delete hs.do; delete hs.verb; } else { const j = hotspots.list.indexOf(hs); if (j >= 0) hotspots.list.splice(j, 1); }
      E.hs = null;
    }
    hotspots.reset();
    if (P.res) { const r = P.res; P.res = null; r(!!v); }
  }
  function pairDone(P) {
    if (P.done) return;
    P.done = true;
    log('pair ' + P.id + ' done');
    if (!skipping()) ui.sfx(P.o.sfx || 'clunk');
    if (P.o.onDone) P.o.onDone();
    pairEnd(P, true);
  }
  function pairAuto(P) {   // autoplay: two of the party take the two ends at once
    if (P.done || pairs.indexOf(P) < 0) return P.done;
    const ids = P.who || PARTY, got = [];
    if (ids.includes(state.active) && world.actor(state.active)) got.push(state.active);
    for (let i = 0; i < ids.length && got.length < 2; i++) if (!got.includes(ids[i]) && here(world.actor(ids[i]))) got.push(ids[i]);
    for (let k = 0; k < 2; k++) {
      const E = P.ends[k], a = got[k] && world.actor(got[k]);
      if (!a) continue;
      if (E.stand) t1.copy(E.stand); else t1.set(E.at.x + 0.6, E.at.y, E.at.z);
      a.place([t1.x, t1.y, t1.z, Math.atan2(E.at.x - t1.x, E.at.z - t1.z)]);
      E.holder = got[k]; E.arrived = true; E.sx = t1.x; E.sz = t1.z;
      if (got[k] !== state.active) waitPos(got[k], true);
    }
    pairDone(P);
    return true;
  }
  function pairsTick(dt) {
    const ha = pairs.length ? HOLD_ANIM() : 'idle';
    for (let i = pairs.length - 1; i >= 0; i--) {
      const P = pairs[i];
      if (P.g !== gen) { pairEnd(P, false); continue; }
      if (P.cut && skipping()) { pairDone(P); continue; }   // made inside a cutscene that is now skipped: done (as one made while skipping)
      if (TEST.auto && P.o.auto !== false && (P.autoT += dt) > 0.6) { pairAuto(P); continue; }
      for (let k = 0; k < 2; k++) {
        const E = P.ends[k];
        if (!E.holder) continue;
        const a = world.actor(E.holder);
        if (!here(a)) { endRelease(E); continue; }
        const d = Math.hypot(a.pos.x - E.sx, a.pos.z - E.sz);
        if (E.holder === state.active) {
          if (!E.arrived) { E.sx = a.pos.x; E.sz = a.pos.z; E.arrived = true; }
          else if (d > 0.45) { endRelease(E); hotspots.reset(); continue; }   // he walked off: let go
        } else if (!E.arrived && (d < 0.4 || !a.mv.on)) E.arrived = true;
        if (E.arrived && a.anim !== ha && !(a === player.actor && (input.move.x || input.move.y))) { a.face(E.at); a.play(ha); }
      }
      if (P.ends[0].arrived && P.ends[1].arrived) { if ((P.both += dt) >= P.need) pairDone(P); } else P.both = 0;
    }
  }
  on('swap', (nx) => {   // the one we just left keeps holding his end
    for (let i = 0; i < pairs.length; i++) for (let k = 0; k < 2; k++) {
      const E = pairs[i].ends[k];
      if (!E.holder) continue;
      if (E.holder !== nx) waitPos(E.holder, true);
      else { const a = world.actor(nx); if (a) { E.sx = a.pos.x; E.sz = a.pos.z; } }
    }
  });
  pairSwitch.get = (id) => { const P = pairById.get(id); return P ? P : null; };
  pairSwitch.clear = () => { while (pairs.length) pairEnd(pairs[pairs.length - 1], false); };

  // ============================================================ tick, render hooks, cleanup
  let lastSet = null;
  function dropOtherSets() {   // the world shows another set: that set's drones, cones and labels go with it
    const sid = world.setId;
    for (let i = D.length - 1; i >= 0; i--) if (D[i].set !== sid) dDrop(D[i]);
    for (let i = LBL.length - 1; i >= 0; i--) if (LBL[i].set !== sid) AR.remove(LBL[i].id);
    for (let i = RIB.length - 1; i >= 0; i--) if (RIB[i].set !== sid) ribDrop(RIB[i]);
    hugHide();
  }
  function tick(dt) {
    if (world.setId !== lastSet) { lastSet = world.setId; dropOtherSets(); }
    chipTick(dt);
    if (D.length) dronesTick(dt);
    stealthTick();
    lureTick(dt);
    if (holds.length) holdsTick(dt);
    if (pairs.length) pairsTick(dt);
    if (SR.on) srCam(dt);
    if (dashTex && arVis) dashTex.offset.x -= dt * 0.9;   // patrol routes crawl
    humTick();
  }
  addUpdate(tick);
  const worldRender = world.render;
  world.render = function (alpha) {
    if (D.length || hugOn) dronesFrame(alpha);
    const r = worldRender.call(this, alpha);
    arFrame();
    if (SR.on) {
      const c = SR.cam, w = innerWidth, h = innerHeight;
      if (c.aspect !== w / h) { c.aspect = w / h; c.updateProjectionMatrix(); }
      renderer.render(SR.scene, c);
    }
    return r;
  };
  on('flow:stop', () => {
    gen++;
    srOff(); hugHide();
    document.body.classList.remove('saferoom');   // (the host set's Quiet Corner sets it without SR.on: a quit mid-corner)
    DRONES.clear(); AR.clear(); arForce = null;
    while (holds.length) holdEnd(holds[holds.length - 1], false);
    pairSwitch.clear();
    stealth.active = false; stealth.busy = false; stealth.opts = null; cpKey = undefined;
    chipShow = false; peekT = 0; lockT = 0; if (chip.on) setView(false);
    Object.assign(chip, { allowed: true, forced: false, forcedMsg: 'Chip off.', signal: 0, full: false, rate: 1 / 6, drainRate: 1 / 3, light: null });
    chip.hot.length = 0;
    if (typeof ui.signal === 'function') ui.signal(null);
    paused = false; DRONES.autoCapture = false; DRONES.walls = true; COV.length = 0; graceT = 0;
    if (hum) { hum.stop(0.4); hum = null; }
  });

  return { chip, AR, DRONES, stealth, safeRoom, strengthHold, pairSwitch };
})();
