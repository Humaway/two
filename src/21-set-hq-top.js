// ============================================================ SET: hq_top — the Manager's office, top floor of Optus Tower (2040)
// Scenes P "Do Not Disturb", the 2.5_manager cutaway, 3.3 "The Manager", 3.4 "85%" (the boss arena, spec §10), 3.5 "99%",
// 3.6 "two". Spec: docs/sets/hq_top.md (the contract: every name and coordinate there is what content codes against).
//
// LAYOUT (metres, Y up, +X east, +Z south; the Valley Grid with local = VG − (0, 125.5, 0): the office floor is y 0 and x/z
// are exactly VG). Mark facing ry: 0 faces +Z (south, the glass), PI faces −Z (the north wall), H faces +X (east), −H faces
// −X (west). Facing the glass, a person's left is east; from inside looking south, screen-right is west (−X).
//   Interior x −12…12, z −23.2…−11.2, ceiling y 5.2 (24 × 12 m). GLASS: the whole south side (z −11.2), mullions every 3 m
//   (x −12…12), slim black sill; the SafeSense pop-up panel (−3.0, 2.15, −11.24) 3.2 × 1.8 and the glass clock above it
//   (−3.0, 3.55) 2.4 × 0.6, both facing the room; window drone ports (±7.5, 3.8). North wall z −23.2 (charcoal acoustic
//   panels) with the PALE impact panel x 1…5, y 0…3. East wall x 12: the private lift doors z −21.5…−19.9 under MANAGER
//   ONLY. WEST END = the Manager's: desk x −10…−9.1, z −17.6…−14.4 (top 0.74, black gloss reflecting the storm), the
//   face-down photo (−9.55, 0.75, −15.0), the empty chair (−8.5, −13.6), his spot at the glass (−9.6, −12.0). CENTRE: the
//   console (0, −15.4) 2.4 × 0.8 × 0.95, screen tilted toward Luka (north), the USB-C port on its east end (1.21, 0.80).
//   EAST END = the intruders': the maintenance hatch (8.0, 5.2, −12.9) with its fold-down ladder (plane z −13.32). Low
//   furniture: filing cabinets x −6.55…−5.55 z −20.75…−20.10, the dead planter x −3…−0.6 z −21.7…−21.1, the sofa x 5.9…8.1
//   z −21.25…−20.35. Ceiling: 3 light strips (z −14.0, −17.2, −20.4), drone hatches w (−7.5, −19.0) cw (−2, −17.6)
//   ce (2, −17.6) e (7.5, −19.0). Floor: polished black stone (live mirror / baked), 14 foam vents. Outside: 14 firefly
//   drones, rain (x −14…14, z −10.8…−4), the facade glow below the sill, SETS.valley.skyline() at (0, −125.5, 0).
//
// ENV: midday (default; P) · cutaway (2.5) · storm_dry · storm (3.3) · boss · storm_flash (3.4) · strike (3.5) · yellow ·
//   lit (3.6). No preset carries a spot: lamp() owns it. ?setview dresses by env (midday p, cutaway s25, storm* s33, boss /
//   storm_flash s34, strike s35 after the strike, yellow s36 ring, lit s36 at 11:58).
// DRESS: dress('p' | 's25' | 's33' | 's34' | 's35' | 's36') — automatic on scene change (AUTO: P p, 2.5 s25, 3.3 s33,
//   3.4 s34, 3.5 s35, 3.6 s36; the first API call or tick of a scene applies it first; Continue re-dresses).
// LAMP: lamp('desk' | 'console' | 'glass' | 'wall' | 'ring' | 'mgr' | 'off') parks the one spot (re-asserted every tick while
//   lit; 'mgr' = on the chest of whoever stands at mgr_turn: optional, no dress uses it).
// FLASH: flash(k = 1) a visual-only lightning pulse (sky + glass; Reduce Flashing: a 1.5 s swell to 40%). Ambient lightning
//   runs by itself in the storm states (12–25 s, thunder 1.2–3 s later); it never touches the env.
// REFLECT: reflect('live' | 'baked' | null = auto: baked in s34, on touch, at pixel ratio < 0.75, or if the shader fails).
// LIGHTUP: lightUp(dur = 2) — 11:58: skyline lit(1) + swing + crowd look_up + bridge lights, facade glow, fireflies scatter,
//   valley_music_far; automatic when env 'lit' is applied in s36.
// MARKS: mgr_glass p_mgr_desk p_drone_in p_drone_shoulder s25_mgr s25_drone · s33_ladder_top s33_ladder_foot s33_drop_luka
//   s33_drop_chase s33_drop_c40 mgr_turn s33_c40_mid s33_luka_mid s33_chase_mid s33_l40_glass s33_l40_turn console_luka ·
//   boss_chase boss_c40 boss_l40 · s35_chase s35_c40 s35_l40_by_chase s35_l40_by_c40 s35_l40_by_luka desk_l40 s35_l40_end
//   s35_luka_wall s35_badge s35_luka_up · s36_chase_l40 s36_c40 s36_l40_glass s36_chase_side s36_luka_console ring_centre.
// ANCHORS: glass_popup glass_popup_ecu glass_moon glass_clock p_desk_track_a p_desk_track_b photo_frame far_corner
//   p_back_head p_shoulder_chair s25_wide s33_ladder s33_from_behind s33_badge s33_two_lukas s33_glass_talk console usb_port
//   console_screen s33_thumbs s33_red s35_foam_wide s35_phone s35_locked_low desk_photo_turn s35_strike_wide s35_wall_low
//   s35_cracked_phone s35_lukas_two s35_luka_low s35_ring_wide s36_ring_wide s36_valley s36_mall_fallback hatch_cw ports.
// CAMS: far_corner (fixed, default: the prologue's angle) · boss (rail on the north wall, look player; see bossCam) ·
//   hold_no (fixed, over his right shoulder onto the glass). ZONES: three boxes (west / centre / east thirds) → boss.
// PROPS (userData APIs; every call is instant while skipping, allocation-free per frame, and survives a rebuild):
//   glass_ui popup(mode, { sched }) ('yes_only' | 'dnd' | 'no_flicker' | 'yes_no' | 'yes_grey' | 'cancelled' | 'footage' |
//     'off'), sched(on), cursor(u, v) / cursor(null) (0…1 over the pop-up, the hold_no game's 400 × 236 layout), hold(k),
//     clock({ h, m, s, sec, quiet: 'hh:mm:ss' | secs | null, paused }), clockRun(rate), clockOff(), glow(k), time (getter:
//     story seconds of the day) · glass_rain boost(k) · console screen(mode, arg) ('idle' | 'password' + typed string |
//     'granted' | 'hack' + pct | 'stall' + pct | 'restart' + notes 0…3), port(on) · luka_phone state('hidden' | 'docked' |
//     'dangling' | 'pulled'), screen(mode, pct) ('keyboard' | 'hack' | 'cracked' | 'two'), swing(k) · photo_frame
//     state('down' | 'up' | 'held') · empty_chair spin (rad/s; set it, it decays) · maint_hatch open(u) ladder(u) ·
//     drone_hatches open(i, u) (i 0–3 = w, cw, ce, e) · drone_ports open(i, u) (0 w, 1 e) · vents open(k) / open(i, k) ·
//     foam bloom(i, x, z, dur) soften(k) harden() burst(i) sag(i, dur) clear() · galaxy mode('idle') watch(x, y, z, dur)
//     color(name, dur) hang() seed(arr, n) ring(cx, cz, r, y, dur) part(angle, width) land(dur) pos(i, out) (+ .visible) ·
//     fireflies color(name) scatter() count(n) · aide_drone fly(from, to, dur) talk(on) place(where) (+ .visible) · slicks
//     show(i, x, z, ry, dur = 6) clear() · lights level(k) flicker(sec) · lift_doors (static) · wall_crack (.visible) ·
//     luka_badge place(where, ry) (+ .visible) · facade_glow zero(dur = 2) off() · rain · skyline (valley.md §12.5) ·
//     mirror (the floor) · desk / filing_cabinets / planter / sofa (static markers).
// DATA: spawns (boss), vents, bossCam, ar, AUTO.
// AMBIENCE (getter): rain kind 'glass' (rain_glass whenever the env rains) + hq_hush, drone_idle, thunder_far; s34 drops
//   drone_idle; 11:58 adds valley_music_far (lp 400). Room 'room'.
// Draw calls: static ≈ 8 (vc, panel, atlas, desk, crack-free unlit, strips, glass, labels), the live mirror re-renders the
//   visible room once; parts 1–3 each; every repeat instanced (galaxy 2, fireflies 2, vents 1, leaves 1, lamps 1, blades 1,
//   slicks 1, foam fragments 1); skyline ≈ 16.
// DEVIATIONS (from docs/sets/hq_top.md): anchors glass_moon / glass_popup_ecu re-aimed (from inside, east is screen-LEFT,
//   so the pop-up's top-right corner is at the WEST end of the panel); console_screen / s33_thumbs re-aimed over Luka's
//   left shoulder (from straight behind, his head hides the screen); the ring leaves an open arc toward the glass so the
//   pop-up and clock read through it; env intensities are scaled for r186 physical lights (hemi/dir ×≈2.5, lamp × 5).
//   The 'boss' rail cam (spec §7.1) cannot frame anyone within ~1.5 m of the north wall (they are under the lens): the
//   boss game's bossCam override must keep its target at lerp(console, chase, 0.5) as specified.
SETS.hq_top = (() => {
  const PI = Math.PI, H = PI / 2, TAU = PI * 2, DS = THREE.DoubleSide;
  // ---------------------------------------------------------- palette (spec §3.1)
  const WALL = 0x464e58, WALL_LIT = 0x8e98a8, WASH = 0x2c3440, PALE = 0xb4bcc4, CEIL = 0x181b20, MULL = 0x2a2e34, GLOSS = 0x111317, GLOSSHI = 0x3a4656,
    CHAIR = 0x30343a, SOFA = 0x2c2f36, CAB = 0x3a3e44, CONC = 0x5a5c60, STALK = 0x6a5a40, STALK2 = 0x4a3e2e, STEEL = 0x5a6068,
    STEELD = 0x23272c, BLACK = 0x050607, SKIRT = 0x0e1013, STRIPC = 0xdfe8ff, CABLE = 0xe4e6e8;
  const DL = { blue: 0x8fd8ff, patrol: 0x8fd8ff, amber: 0xffb040, curious: 0xffb040, red: 0xff4040, escort: 0xff4040, yellow: 0xffd21f, yes: 0xffd21f, white: 0xe8f6ff, off: 0x23272e };
  const SHELL = 0xeef2f6, SHELL_Y = 0xfff6e2;   // yellow = the lights; the shells only warm a touch (a tinted shell reads olive)
  const COL = [];                                         // colliders (filled by build; the foam boxes are mutated in place)
  const R = {};                                           // live refs + state (defaults() once; state survives rebuilds)
  const tc = new THREE.Color(), tc2 = new THREE.Color(), m4 = new THREE.Matrix4(), m5 = new THREE.Matrix4(), XM = new THREE.Matrix4();
  const qv = new THREE.Quaternion(), qv2 = new THREE.Quaternion(), ev = new THREE.Euler(0, 0, 0, 'ZYX'), pv = new THREE.Vector3(), sv = new THREE.Vector3(), v3 = new THREE.Vector3();
  const yUp = new THREE.Vector3(0, 1, 0), ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
  let b = null, UL = null, XF = null, T = null, M = null;
  let WASHM = null, UNLIT = null, STRIPM = null, LAMPM = null, PORTM = null, GLASSM = null, RAINAM = null, RAINBM = null, UIM = null, CONM = null,
    PHM = null, SLM = null, FGM = null, SKYM = null, BACKM = null;
  const skipping = () => typeof flow !== 'undefined' && !!flow && !!flow.skipping;
  const reduceFx = () => typeof options !== 'undefined' && !!options && !!options.reduceFlashing;
  const smooth = (u) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
  const clamp01 = (u) => (u < 0 ? 0 : u > 1 ? 1 : u);
  const isCur = () => typeof world !== 'undefined' && world.setId === 'hq_top';
  const SETVIEW = () => typeof TEST !== 'undefined' && !!TEST && TEST.setview === 'hq_top';
  const sceneNow = () => (typeof state !== 'undefined' && state ? state.scene : null);
  const angTo = (a, b2) => { let d = (b2 - a) % TAU; if (d > PI) d -= TAU; else if (d < -PI) d += TAU; return d; };

  // ---------------------------------------------------------- geometry helpers (into the current Builder `b`)
  // put(): colour every vertex; a MeshBasic material goes to the unlit list UL (merged without baked light, uv kept).
  function put(g, hex, m) {
    if (XF) g.applyMatrix4(XF);
    const mm = m || M.vc;
    if (hex != null || !g.attributes.color) {   // hex null: keep the colours the caller painted per vertex
      tc.set(hex ?? 0xffffff);
      const n = g.attributes.position.count, a = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) { a[i * 3] = tc.r; a[i * 3 + 1] = tc.g; a[i * 3 + 2] = tc.b; }
      g.setAttribute('color', new THREE.BufferAttribute(a, 3));
    }
    if (mm.isMeshBasicMaterial) { let l = UL.get(mm); if (!l) UL.set(mm, (l = [])); l.push(g); }
    else { b.geo(g, mm); g.dispose(); }
  }
  function box(w, h, d, hex, x, y, z, ry = 0, m) { const g = new THREE.BoxGeometry(w, h, d); if (ry) g.rotateY(ry); g.translate(x, y + h / 2, z); put(g, hex, m); }
  function bb(x0, y0, z0, x1, y1, z1, hex, m) {
    const ax = Math.min(x0, x1), ay = Math.min(y0, y1), az = Math.min(z0, z1), bx = Math.max(x0, x1), by = Math.max(y0, y1), bz = Math.max(z0, z1);
    box(bx - ax, by - ay, bz - az, hex, (ax + bx) / 2, ay, (az + bz) / 2, 0, m);
  }
  function boxR(w, h, d, hex, x, y, z, rx = 0, ry = 0, rz = 0, m) { const g = new THREE.BoxGeometry(w, h, d); g.rotateX(rx); g.rotateZ(rz); g.rotateY(ry); g.translate(x, y, z); put(g, hex, m); }
  function cyl(rt, rb, h, seg, hex, x, y, z, rx = 0, rz = 0, m, ry = 0) { const g = new THREE.CylinderGeometry(rt, rb, h, seg); if (rx) g.rotateX(rx); if (rz) g.rotateZ(rz); if (ry) g.rotateY(ry); g.translate(x, y, z); put(g, hex, m); }
  function torus(R0, r, rs, ts, hex, x, y, z, rx = 0, ry = 0, m, arc = TAU) { const g = new THREE.TorusGeometry(R0, r, rs, ts, arc); if (rx) g.rotateX(rx); if (ry) g.rotateY(ry); g.translate(x, y, z); put(g, hex, m); }
  function sph(r, hex, x, y, z, sx = 1, sy = sx, sz = sx, m, ws = 8, hs = 6) { const g = new THREE.SphereGeometry(r, ws, hs); g.scale(sx, sy, sz); g.translate(x, y, z); put(g, hex, m); }
  // quad faces +Z before rotation (rx first, then ry): floor rx=-H, ceiling rx=H, wall facing -X ry=-H, facing -Z ry=PI.
  function quad(w, h, m, x, y, z, ry = 0, rx = 0, hex = 0xffffff) { const g = new THREE.PlaneGeometry(w, h); if (rx) g.rotateX(rx); if (ry) g.rotateY(ry); g.translate(x, y, z); put(g, hex, m); }
  // a quad showing the pixel rect [x0, y0, x1, y1] (top-left origin) of a W × Hh canvas texture
  function rquad(w, h, m, rc, x, y, z, ry = 0, rx = 0, hex = 0xffffff, W = 256, Hh = 256) {
    const g = new THREE.PlaneGeometry(w, h), uv = g.attributes.uv;
    for (let i = 0; i < 4; i++) uv.setXY(i, uv.getX(i) > 0.5 ? rc[2] / W : rc[0] / W, uv.getY(i) > 0.5 ? 1 - rc[1] / Hh : 1 - rc[3] / Hh);
    if (rx) g.rotateX(rx); if (ry) g.rotateY(ry); g.translate(x, y, z); put(g, hex, m);
  }
  // a tiled quad: the texture repeats every tile metres (tile = n or [tx, ty]); ox/oy shift the pattern (in repeats)
  function tquad(w, h, m, x, y, z, ry = 0, rx = 0, tile = 1, hex = 0xffffff, ox = 0, oy = 0) {
    const tx = Array.isArray(tile) ? tile[0] : tile, ty = Array.isArray(tile) ? tile[1] : tile;
    const g = new THREE.PlaneGeometry(w, h), uv = g.attributes.uv;
    for (let i = 0; i < 4; i++) uv.setXY(i, ox + uv.getX(i) * w / tx, oy + uv.getY(i) * h / ty);
    if (rx) g.rotateX(rx); if (ry) g.rotateY(ry); g.translate(x, y, z); put(g, hex, m);
  }
  // tquad with a colour ramp along its width (local -x end hexA -> +x end hexB): window light washing an end wall
  function rquadRamp(w, h, m, x, y, z, ry, tile, hexA, hexB, ox = 0) {
    const g = new THREE.PlaneGeometry(w, h), uv = g.attributes.uv, pos = g.attributes.position, n = pos.count, a = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      uv.setXY(i, ox + uv.getX(i) * w / tile[0], uv.getY(i) * h / tile[1]);
      tc.set(pos.getX(i) < 0 ? hexA : hexB); a[i * 3] = tc.r; a[i * 3 + 1] = tc.g; a[i * 3 + 2] = tc.b;
    }
    g.setAttribute('color', new THREE.BufferAttribute(a, 3));
    if (ry) g.rotateY(ry); g.translate(x, y, z); put(g, null, m);
  }
  // atlas labels: a full row (0..7) or a half row (half 0 | 1) of the 256 × 256, 8 × 32 px label atlas
  const lab = (row, w, h, x, y, z, ry = 0, rx = 0) => rquad(w, h, M.atlas, [1, row * 32 + 1, 255, row * 32 + 31], x, y, z, ry, rx);
  const labH = (row, half, w, h, x, y, z, ry = 0, rx = 0) => rquad(w, h, M.atlas, [half * 128 + 1, row * 32 + 1, half * 128 + 127, row * 32 + 31], x, y, z, ry, rx);
  // a square-section bar from A to B (cables, stalks, stiles)
  function seg3(ax, ay, az, bx, by, bz, r, hex, m) {
    const dx = bx - ax, dy = by - ay, dz = bz - az, L = Math.hypot(dx, dy, dz);
    const g = new THREE.BoxGeometry(r, L, r);
    v3.set(dx / L, dy / L, dz / L); qv.setFromUnitVectors(yUp, v3);
    m5.compose(pv.set((ax + bx) / 2, (ay + by) / 2, (az + bz) / 2), qv, sv.set(1, 1, 1)); g.applyMatrix4(m5); put(g, hex, m);
  }
  // the ceiling: one downward-facing slab with rectangular holes ([x0, z0, x1, z1] each)
  function holeCeil(x0, z0, x1, z1, y, holes, hex, m) {
    const sh = new THREE.Shape(); sh.moveTo(x0, z0); sh.lineTo(x1, z0); sh.lineTo(x1, z1); sh.lineTo(x0, z1); sh.closePath();
    for (const [a0, c0, a1, c1] of holes) { const p = new THREE.Path(); p.moveTo(a0, c0); p.lineTo(a0, c1); p.lineTo(a1, c1); p.lineTo(a1, c0); p.closePath(); sh.holes.push(p); }
    const g = new THREE.ShapeGeometry(sh); g.rotateX(H); g.translate(0, y, 0); put(g, hex, m);
  }
  function wall(x0, z0, x1, z1) { COL.push([x0, z0, x1, z1]); }
  // the unlit list of one material -> one Mesh (vertex colours, uv kept when any part has it)
  function unlitMesh(m, list) {
    const anyUV = list.some((g) => g.attributes.uv);
    const parts = list.map((g0) => {
      const g = g0.index ? g0.toNonIndexed() : g0;
      if (anyUV && !g.attributes.uv) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
      for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'color' && !(anyUV && k === 'uv')) g.deleteAttribute(k);
      g.morphAttributes = {}; return g;
    });
    const merged = mergeGeometries(parts);
    for (const g of list) g.dispose(); for (const g of parts) g.dispose();
    return new THREE.Mesh(merged, m);
  }
  function flush(o) {
    const g = b.done(o);
    for (const [m, l] of UL) if (l.length) g.add(unlitMesh(m, l));
    UL.clear(); return g;
  }
  // a separate Builder (+ unlit lists) -> named Group (a prop). Coordinates inside fn are local.
  function part(name, fn, pos, ry = 0, o) {
    const pb = b, pu = UL, px = XF; b = new Builder(); UL = new Map(); XF = null;
    fn();
    const g = flush(o);
    b = pb; UL = pu; XF = px;
    if (name) g.name = name;
    if (pos) g.position.set(pos[0], pos[1], pos[2]);
    g.rotation.y = ry;
    return g;
  }
  const at = (x, z, ry = 0, y = 0) => (XF = XM.makeRotationY(ry).setPosition(x, y, z));
  const geoOf = (fn, o) => part('', fn, null, 0, { floor: false, ...o }).children[0].geometry;
  const marker = (name, x, y, z) => { const o = new THREE.Object3D(); o.name = name; o.position.set(x, y, z); return o; };
  const dynIM = (geo, m, n, name) => { const im = new THREE.InstancedMesh(geo, m, n); im.name = name; im.instanceMatrix.setUsage(THREE.DynamicDrawUsage); im.frustumCulled = false; for (let i = 0; i < n; i++) im.setMatrixAt(i, ZERO); return im; };

  // ---------------------------------------------------------- painted textures (64–256 px, nearest where text must read)
  const FONT = (px, w = 'bold') => `${w} ${px}px Arial, "Liberation Sans", "DejaVu Sans", sans-serif`;
  function text(c, s, x, y, px, col, al = 'center', w = 'bold', maxW) {
    c.font = FONT(px, w); c.fillStyle = col; c.textAlign = al; c.textBaseline = 'middle';
    if (maxW) c.fillText(s, x, y, maxW); else c.fillText(s, x, y);
  }
  let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  const canvas = (w, h) => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; return cv; };
  // label atlas: 8 rows × 32 px
  function paintAtlas(c) {
    c.fillStyle = '#15181d'; c.fillRect(0, 0, 256, 256);
    // 0 MANAGER ONLY (the lift plate)
    c.strokeStyle = '#8a929c'; c.lineWidth = 2; c.strokeRect(3, 3, 250, 26); text(c, 'MANAGER ONLY', 128, 16.5, 19, '#eef2f6', 'center', 'bold', 236);
    // 1 ROOF ACCESS ▲
    c.fillStyle = '#eef1f4'; c.fillRect(0, 32, 256, 32); text(c, 'ROOF ACCESS', 116, 48.5, 18, '#1a1d22', 'center', 'bold', 190);
    c.fillStyle = '#1a1d22'; c.beginPath(); c.moveTo(222, 57); c.lineTo(236, 57); c.lineTo(229, 41); c.closePath(); c.fill();
    // 2 the vent rim warning (on the floor)
    c.fillStyle = '#121418'; c.fillRect(0, 64, 256, 32); c.fillStyle = '#d8ccb0'; c.fillRect(0, 64, 256, 2); c.fillRect(0, 94, 256, 2);
    text(c, 'SAFETY FOAM — DO NOT STAND ON VENT', 128, 80.5, 12, '#d8ccb0', 'center', 'bold', 246);
    // 3 MAINTENANCE stencil (hatch lid)
    c.fillStyle = '#2a2e34'; c.fillRect(0, 96, 256, 32); text(c, 'MAINTENANCE', 128, 112.5, 20, '#9aa0a8', 'center', 'bold', 230);
    c.fillStyle = '#2a2e34'; for (let x = 30; x < 230; x += 22) c.fillRect(x, 104, 2, 18);   // stencil bridges
    // 4 left: USB-C (engraved under the port) · right: DRONE PORT
    c.fillStyle = '#0a0b0d'; c.fillRect(0, 128, 128, 32); text(c, 'USB-C', 64, 144.5, 21, '#7a8694', 'center', 'bold', 120);
    c.fillStyle = '#2a2e34'; c.fillRect(128, 128, 128, 32); text(c, 'DRONE PORT', 192, 144.5, 15, '#c8ced6', 'center', 'bold', 120);
    // 5 DRONE HATCH · KEEP CLEAR
    c.fillStyle = '#1c1f24'; c.fillRect(0, 160, 256, 32); c.fillStyle = '#c8a040';
    for (let x = -32; x < 256; x += 16) { c.beginPath(); c.moveTo(x, 192); c.lineTo(x + 8, 192); c.lineTo(x + 16, 160); c.lineTo(x + 8, 160); c.closePath(); c.fill(); }
    c.fillStyle = '#1c1f24'; c.fillRect(26, 166, 204, 20); text(c, 'DRONE HATCH · KEEP CLEAR', 128, 176.5, 13, '#d8dce0', 'center', 'bold', 200);
    // 6 PRIVATE · L31 (small door plaque)  7 spare
    c.fillStyle = '#eef1f4'; c.fillRect(0, 192, 256, 32); text(c, 'PRIVATE · L31', 128, 208.5, 18, '#1a1d22', 'center', 'bold', 230);
  }
  function paintPanel(c) {   // 128 × 128 acoustic panel (light: the vertex colour makes it charcoal or pale)
    c.fillStyle = '#e6e8ea'; c.fillRect(0, 0, 128, 128);
    seed = 31;
    for (let x = 6; x < 128; x += 8) { c.fillStyle = 'rgba(0,0,0,0.13)'; c.fillRect(x, 0, 2, 128); c.fillStyle = 'rgba(255,255,255,0.05)'; c.fillRect(x + 2, 0, 1, 128); }
    for (let i = 0; i < 260; i++) { c.fillStyle = rnd() < 0.5 ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.04)'; c.fillRect((rnd() * 128) | 0, (rnd() * 128) | 0, 1, 2); }
    c.fillStyle = '#4a4e54'; c.fillRect(0, 0, 3, 128); c.fillStyle = 'rgba(255,255,255,0.3)'; c.fillRect(3, 0, 1, 128);
  }
  function paintFloor(c) {   // 128 × 128 = 2.4 m: two polished black slabs per side, faint veins and long reflection streaks
    c.fillStyle = '#111419'; c.fillRect(0, 0, 128, 128);
    seed = 11;
    for (let i = 0; i < 18; i++) {   // veins
      c.strokeStyle = `rgba(${60 + (rnd() * 30) | 0},${66 + (rnd() * 30) | 0},${80 + (rnd() * 30) | 0},${0.12 + rnd() * 0.12})`; c.lineWidth = 1;
      c.beginPath(); let x = rnd() * 128, y = rnd() * 128; c.moveTo(x, y);
      for (let k = 0; k < 4; k++) { x += (rnd() - 0.3) * 30; y += (rnd() - 0.5) * 18; c.lineTo(x, y); }
      c.stroke();
    }
    for (let i = 0; i < 6; i++) { c.fillStyle = 'rgba(58,68,80,0.10)'; c.fillRect(0, (rnd() * 128) | 0, 128, 2 + ((rnd() * 4) | 0)); }
    c.fillStyle = '#07080a'; c.fillRect(0, 0, 128, 1); c.fillRect(0, 64, 128, 1); c.fillRect(0, 0, 1, 128); c.fillRect(64, 0, 1, 128);
  }
  function paintDesk(c) {   // 128 × 128 black gloss; v up = north: the storm-glass reflection brightest at the south (bottom)
    c.fillStyle = '#0a0b0d'; c.fillRect(0, 0, 128, 128);
    const g = c.createLinearGradient(0, 128, 0, 0); g.addColorStop(0, 'rgba(176,170,196,0.95)'); g.addColorStop(0.4, 'rgba(120,116,144,0.6)'); g.addColorStop(1, 'rgba(60,64,78,0.15)');
    c.fillStyle = g; c.fillRect(16, 0, 96, 128);
    const g2 = c.createLinearGradient(16, 0, 112, 0); g2.addColorStop(0, 'rgba(10,11,13,1)'); g2.addColorStop(0.2, 'rgba(10,11,13,0)'); g2.addColorStop(0.8, 'rgba(10,11,13,0)'); g2.addColorStop(1, 'rgba(10,11,13,1)');
    c.fillStyle = g2; c.fillRect(16, 0, 96, 128);
    c.fillStyle = 'rgba(8,9,11,0.92)'; c.fillRect(46, 0, 4, 128); c.fillRect(82, 0, 4, 128);   // mullions in the reflection
    c.fillStyle = 'rgba(200,206,222,0.5)'; c.fillRect(16, 116, 96, 2);   // the sill's bright line, near the south end
    c.fillStyle = 'rgba(42,52,64,0.9)'; c.fillRect(0, 0, 128, 2); c.fillRect(0, 126, 128, 2); c.fillRect(0, 0, 2, 128); c.fillRect(126, 0, 2, 128);
  }
  function paintPhotoBack(c) {   // 64 × 64: black card back, a folded stand, a felt corner
    c.fillStyle = '#16171a'; c.fillRect(0, 0, 64, 64);
    c.strokeStyle = '#2a2c30'; c.lineWidth = 2; c.strokeRect(3, 3, 58, 58);
    c.fillStyle = '#0c0d0f'; c.beginPath(); c.moveTo(26, 14); c.lineTo(38, 14); c.lineTo(36, 50); c.lineTo(28, 50); c.closePath(); c.fill();
    c.fillStyle = '#3a3c40'; c.fillRect(29, 12, 6, 3);
    c.fillStyle = '#3a2a2a'; c.beginPath(); c.moveTo(64, 64); c.lineTo(50, 64); c.lineTo(64, 50); c.closePath(); c.fill();
  }
  function paintPhoto(c) {   // 64 × 48: two blurred figures on the Woody Point jetty at sunset, 2033 (the INSERT is the CARD)
    const g = c.createLinearGradient(0, 0, 0, 30); g.addColorStop(0, '#5a4a7a'); g.addColorStop(0.55, '#e88a5a'); g.addColorStop(1, '#ffc87a');
    c.fillStyle = g; c.fillRect(0, 0, 64, 30);
    c.fillStyle = '#ffe2a0'; c.beginPath(); c.arc(46, 28, 5, 0, TAU); c.fill();
    const s = c.createLinearGradient(0, 28, 0, 48); s.addColorStop(0, '#c87a5a'); s.addColorStop(1, '#3a3a4a'); c.fillStyle = s; c.fillRect(0, 28, 64, 20);
    c.fillStyle = '#3a2a22'; c.beginPath(); c.moveTo(0, 48); c.lineTo(30, 30); c.lineTo(36, 30); c.lineTo(22, 48); c.closePath(); c.fill();
    c.globalAlpha = 0.75;
    c.fillStyle = '#ffd21f'; rr(c, 20, 22, 7, 14, 3); c.fill(); c.fillStyle = '#d8a888'; c.beginPath(); c.arc(23.5, 20, 3.2, 0, TAU); c.fill();
    c.fillStyle = '#2a6ad8'; rr(c, 29, 23, 7, 13, 3); c.fill(); c.fillStyle = '#c89878'; c.beginPath(); c.arc(32.5, 21, 3, 0, TAU); c.fill();
    c.globalAlpha = 0.35; c.fillStyle = '#ffd21f'; rr(c, 18, 21, 9, 15, 3); c.fill(); c.fillStyle = '#2a6ad8'; rr(c, 30, 22, 9, 14, 3); c.fill();
    c.globalAlpha = 1;
    c.strokeStyle = '#f4efe6'; c.lineWidth = 2; c.strokeRect(1, 1, 62, 46);
  }
  function paintRainA(c) {   // 128 × 256: rivulets (alpha)
    c.clearRect(0, 0, 128, 256); seed = 21;
    for (let i = 0; i < 26; i++) {
      let x = rnd() * 128, y = rnd() * 256; const len = 40 + rnd() * 110, a = 0.25 + rnd() * 0.45;
      c.strokeStyle = `rgba(214,226,236,${a})`; c.lineWidth = rnd() < 0.3 ? 2 : 1;
      c.beginPath(); c.moveTo(x, y);
      for (let k = 0; k < len; k += 8) { x += (rnd() - 0.5) * 2.2; y += 8; c.lineTo(x, y); }
      c.stroke();
      c.fillStyle = `rgba(232,240,248,${Math.min(1, a + 0.25)})`; c.beginPath(); c.ellipse(x, y, 1.6, 2.4, 0, 0, TAU); c.fill();
      if (y > 256) { c.beginPath(); c.ellipse(x, y - 256, 1.6, 2.4, 0, 0, TAU); c.fill(); }
    }
  }
  function paintRainB(c) {   // 128 × 128: droplets (alpha)
    c.clearRect(0, 0, 128, 128); seed = 22;
    for (let i = 0; i < 90; i++) {
      const x = rnd() * 128, y = rnd() * 128, r = 0.8 + rnd() * 1.8;
      c.fillStyle = `rgba(200,212,220,${0.25 + rnd() * 0.35})`; c.beginPath(); c.ellipse(x, y, r, r * 1.25, 0, 0, TAU); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.6)'; c.fillRect(x - r * 0.4, y - r * 0.6, 1, 1);
    }
  }
  function paintQuilt(c) {   // 64 × 64 cream quilted foam, diamond stitching
    c.fillStyle = '#efe6d0'; c.fillRect(0, 0, 64, 64);
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
      const cx = 16 + i * 32, cy = 16 + j * 32, g = c.createRadialGradient(cx - 4, cy - 4, 2, cx, cy, 22);
      g.addColorStop(0, 'rgba(255,252,244,0.9)'); g.addColorStop(1, 'rgba(200,188,160,0.0)'); c.fillStyle = g; c.fillRect(cx - 16, cy - 16, 32, 32);
    }
    c.strokeStyle = '#d0c4a6'; c.lineWidth = 2;
    for (let k = -64; k <= 64; k += 32) { c.beginPath(); c.moveTo(k, 0); c.lineTo(k + 64, 64); c.stroke(); c.beginPath(); c.moveTo(k + 64, 0); c.lineTo(k, 64); c.stroke(); }
    c.fillStyle = '#c8bc9c'; for (let x = 0; x <= 64; x += 32) for (let y = 0; y <= 64; y += 32) { c.beginPath(); c.arc(x, y, 2, 0, TAU); c.fill(); }
  }
  function paintCrack(c) {   // 64 × 64 (alpha): a dent and a cracked spray on the pale panel
    c.clearRect(0, 0, 64, 64);
    const g = c.createRadialGradient(31, 30, 1, 31, 30, 26); g.addColorStop(0, 'rgba(20,22,26,0.75)'); g.addColorStop(0.35, 'rgba(40,44,50,0.45)'); g.addColorStop(1, 'rgba(60,64,70,0)');
    c.fillStyle = g; c.fillRect(0, 0, 64, 64);
    seed = 44; c.strokeStyle = 'rgba(14,15,18,0.9)'; c.lineWidth = 1;
    for (let i = 0; i < 11; i++) {
      const a = i / 11 * TAU + rnd() * 0.4; let x = 31, y = 30; c.beginPath(); c.moveTo(x, y);
      const n = 3 + ((rnd() * 3) | 0);
      for (let k = 0; k < n; k++) { const l = 4 + rnd() * 6; x += Math.cos(a + (rnd() - 0.5) * 0.7) * l; y += Math.sin(a + (rnd() - 0.5) * 0.7) * l; c.lineTo(x, y); }
      c.stroke();
    }
    c.fillStyle = 'rgba(200,206,214,0.55)'; for (let i = 0; i < 14; i++) c.fillRect(20 + rnd() * 24, 18 + rnd() * 24, 1, 1);
  }
  function paintGlowY(c) {   // 16 × 64: Yes-yellow rising light (additive: black = nothing), bright at the bottom
    const g = c.createLinearGradient(0, 64, 0, 0); g.addColorStop(0, '#ffd21f'); g.addColorStop(0.35, '#8a6a10'); g.addColorStop(1, '#000000');
    c.fillStyle = g; c.fillRect(0, 0, 16, 64);
  }
  function paintSlick(c) {   // 64 × 32 (additive: black = nothing): a wet sheen with broad polish streaks, soft ends
    c.fillStyle = '#000'; c.fillRect(0, 0, 64, 32); seed = 77;
    const sh = c.createRadialGradient(32, 16, 2, 32, 16, 30); sh.addColorStop(0, 'rgba(255,255,255,0.35)'); sh.addColorStop(1, 'rgba(255,255,255,0)');
    c.save(); c.scale(1, 0.5); c.fillStyle = sh; c.fillRect(0, 0, 64, 64); c.restore();
    for (let i = 0; i < 5; i++) {
      const y = 6 + i * 4.4 + rnd() * 2, x0 = 2 + rnd() * 8, x1 = 54 + rnd() * 8, a = 0.45 + rnd() * 0.45, g = c.createLinearGradient(x0, 0, x1, 0);
      g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.25, `rgba(255,255,255,${a})`); g.addColorStop(0.7, `rgba(255,255,255,${a * 0.85})`); g.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = g; c.fillRect(x0, y, x1 - x0, 2 + ((rnd() * 2) | 0));
    }
  }
  // the footage (2.5): 3 frames of 64 × 36 stacked (a plain canvas; drawn into the glass canvas, nearest)
  function paintFootage(c) {
    seed = 25;
    for (let f = 0; f < 3; f++) {
      const y0 = f * 36;
      c.fillStyle = '#1a2a2a'; c.fillRect(0, y0, 64, 36);
      c.fillStyle = '#22383a'; for (let i = 0; i < 30; i++) c.fillRect((rnd() * 64) | 0, y0 + ((rnd() * 36) | 0), 3, 1);   // water
      c.fillStyle = '#1c3a26'; for (const [x, y, r] of [[44, 10, 9], [54, 20, 10], [38, 26, 8], [58, 6, 7], [30, 32, 6], [50, 32, 7]]) { c.beginPath(); c.arc(x, y0 + y, r, 0, TAU); c.fill(); }
      c.fillStyle = '#2a4a30'; for (const [x, y, r] of [[46, 12, 5], [52, 22, 6], [40, 25, 4], [57, 8, 4]]) { c.beginPath(); c.arc(x, y0 + y, r, 0, TAU); c.fill(); }
      c.strokeStyle = '#8a7a5a'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, y0 + 32); c.lineTo(22, y0 + 22); c.lineTo(46, y0 + 16); c.stroke();   // the boardwalk
      const u = [0.15, 0.45, 0.8][f];   // two scooters sliding along it toward the canopy
      for (let k = 0; k < 2; k++) {
        const s = u - k * 0.08, x = s < 0.5 ? s / 0.5 * 22 : 22 + (s - 0.5) / 0.5 * 24, y = s < 0.5 ? 32 - s / 0.5 * 10 : 22 - (s - 0.5) / 0.5 * 6;
        c.fillStyle = f === 2 ? 'rgba(143,216,255,0.45)' : '#8fd8ff'; c.fillRect(Math.round(x) - 1, y0 + Math.round(y) - 1, 3, 2);
        c.fillStyle = f === 2 ? 'rgba(255,210,31,0.4)' : '#ffd21f'; c.fillRect(Math.round(x), y0 + Math.round(y) - 1, 1, 1);
      }
      if (f === 2) { c.fillStyle = '#1c3a26'; c.beginPath(); c.arc(44, y0 + 15, 5, 0, TAU); c.fill(); }
      c.fillStyle = 'rgba(0,0,0,0.25)'; for (let y = 0; y < 36; y += 2) c.fillRect(0, y0 + y, 64, 1);   // scanlines
      c.fillStyle = '#e8f0f8'; for (const [x, w] of [[2, 1], [4, 2], [7, 1], [9, 2], [12, 1]]) c.fillRect(x, y0 + 2, w, 2);   // timestamp pixels
      c.fillStyle = '#ff4040'; c.fillRect(59, y0 + 2, 2, 2);
    }
  }
  // ---- the glass UI (pop-up 256 × 144 at the top, clock 256 × 64 at y 160): static bases per mode, digits, words
  const DWU = 400, DHU = 236, PS = 144 / 236, POX = (256 - DWU * PS) / 2;   // the hold_no game's design units -> canvas px
  const NO_X = POX + 260 * PS, NO_Y = 150 * PS, NO_W = 104 * PS + 8, NO_H = 38 * PS + 8;
  function pill(c, x, y, label, kind) {
    rr(c, x - 52, y - 19, 104, 38, 19);
    if (kind === 'grey') { c.fillStyle = '#d6dce2'; c.fill(); text(c, label, x, y + 1, 22, '#9aa6b2', 'center', 'bold'); return; }
    c.fillStyle = kind === 'flicker' ? 'rgba(74,138,184,0.8)' : '#4a8ab8'; c.fill();
    text(c, label, x, y + 1, 22, '#ffffff', 'center', 'bold');
    if (kind === 'flicker') { c.fillStyle = 'rgba(191,230,255,0.85)'; c.fillRect(x - 58, y - 8, 116, 3); c.fillRect(x - 44, y + 9, 96, 2); c.fillStyle = 'rgba(244,248,252,0.6)'; c.fillRect(x - 30, y - 2, 70, 2); }
  }
  function popBase(mode, sched, frame) {
    const cv = canvas(256, 144), c = cv.getContext('2d');
    if (mode === 'off') return cv;
    if (mode === 'footage') {   // a SafeSense window with the low-res drone footage at 3x
      rr(c, 20, 3, 216, 138, 10); c.fillStyle = 'rgba(12,20,30,0.88)'; c.fill(); c.strokeStyle = '#bfe6ff'; c.lineWidth = 2; c.stroke();
      text(c, 'DRONE 7 · LIVE', 30, 13, 10, '#bfe6ff', 'left', 'bold');
      c.fillStyle = '#ff4040'; c.beginPath(); c.arc(224, 13, 3, 0, TAU); c.fill();
      c.imageSmoothingEnabled = false; c.drawImage(T.foot, 0, frame * 36, 64, 36, 32, 25, 192, 108);
      return cv;
    }
    c.setTransform(PS, 0, 0, PS, POX, 0);
    c.save(); c.shadowColor = 'rgba(191,230,255,0.95)'; c.shadowBlur = 9;
    rr(c, 6, 6, 388, 224, 22); c.fillStyle = 'rgba(244,248,252,0.90)'; c.fill(); c.restore();
    c.lineWidth = 3.5; c.strokeStyle = '#bfe6ff'; rr(c, 6, 6, 388, 224, 22); c.stroke();
    c.fillStyle = '#4a8ab8'; c.beginPath(); c.arc(34, 31, 9, 0, TAU); c.fill(); c.fillStyle = '#f4f8fc'; c.beginPath(); c.arc(34, 31, 4, 0, TAU); c.fill();
    text(c, 'SafeSense', 50, 32, 17, '#4a8ab8', 'left', 'bold');
    if (mode === 'cancelled') { text(c, 'Opt-Out cancelled.', 200, 124, 36, '#1a2a3a', 'center', 'bold', 360); return cv; }
    text(c, 'OPT OUT ALL USERS?', 200, 88, 34, '#1a2a3a', 'center', 'bold', 372);
    pill(c, 140, 150, 'YES', mode === 'yes_grey' ? 'grey' : 'live');
    if (mode === 'yes_no' || mode === 'yes_grey') pill(c, 260, 150, 'NO', 'live');
    else if (mode === 'no_flicker') pill(c, 260, 150, 'NO', 'flicker');
    else { c.setLineDash([9, 7]); c.lineWidth = 2.5; c.strokeStyle = 'rgba(74,138,184,0.5)'; rr(c, 208, 131, 104, 38, 19); c.stroke(); c.setLineDash([]); }
    if (sched) text(c, 'Scheduled: Monday 24 December 2040 · 11:58', 200, 207, 16, '#4a5a6a', 'center', 'bold', 376);
    if (mode === 'dnd') {   // the Do Not Disturb moon, top right
      c.fillStyle = '#4a8ab8'; c.beginPath(); c.arc(366, 31, 12, 0, TAU); c.fill();
      c.fillStyle = '#f4f8fc'; c.beginPath(); c.arc(373, 25, 11, 0, TAU); c.fill();
      text(c, 'Do Not Disturb', 348, 32, 15, '#4a8ab8', 'right', 'bold');
    }
    return cv;
  }
  function glyphSet(px, h, col, glow) {   // '0'..'9' (tabular width) + ':' -> canvases
    const out = [], probe = canvas(8, 8).getContext('2d'); probe.font = FONT(px);
    let dw = 0; for (let i = 0; i < 10; i++) dw = Math.max(dw, probe.measureText(String(i)).width);
    for (let i = 0; i < 11; i++) {
      const ch = i < 10 ? String(i) : ':', w = Math.ceil(i < 10 ? dw : probe.measureText(':').width) + 3, cv = canvas(w, h), c = cv.getContext('2d');
      c.font = FONT(px); c.textAlign = 'center'; c.textBaseline = 'middle';
      if (glow) { c.shadowColor = glow; c.shadowBlur = 5; }
      c.fillStyle = col; c.fillText(ch, w / 2, h / 2 + 1); out.push(cv);
    }
    return out;
  }
  function word(s, px, h, col, glow) {
    const probe = canvas(8, 8).getContext('2d'); probe.font = FONT(px);
    const w = Math.ceil(probe.measureText(s).width) + 6, cv = canvas(w, h), c = cv.getContext('2d');
    c.font = FONT(px); c.textAlign = 'center'; c.textBaseline = 'middle'; if (glow) { c.shadowColor = glow; c.shadowBlur = 4; }
    c.fillStyle = col; c.fillText(s, w / 2, h / 2 + 1); return cv;
  }
  function textures() {
    if (T) return T;
    T = {};
    T.atlas = canvasTex(256, 256, paintAtlas, { key: 'hqt_atlas', nearest: true });
    T.panel = canvasTex(128, 128, paintPanel, { key: 'hqt_panel', nearest: true, repeat: [1, 1] });
    T.floor = canvasTex(128, 128, paintFloor, { key: 'hqt_floor', nearest: true, repeat: [1, 1] });
    T.desk = canvasTex(128, 128, paintDesk, { key: 'hqt_desk', nearest: true });
    T.photoBack = canvasTex(64, 64, paintPhotoBack, { key: 'hqt_photo_back', nearest: true });
    T.photo = canvasTex(64, 48, paintPhoto, { key: 'hqt_photo', nearest: true });
    T.rainA = canvasTex(128, 256, paintRainA, { key: 'hqt_rain_a', repeat: [1, 1] });
    T.rainB = canvasTex(128, 128, paintRainB, { key: 'hqt_rain_b', repeat: [1, 1] });
    T.quilt = canvasTex(64, 64, paintQuilt, { key: 'hqt_quilt', nearest: true, repeat: [1, 1] });
    T.crack = canvasTex(64, 64, paintCrack, { key: 'hqt_crack', nearest: true });
    T.glowY = canvasTex(16, 64, paintGlowY, { key: 'hqt_glow_y' });
    T.slick = canvasTex(64, 32, paintSlick, { key: 'hqt_slick' });
    T.foot = canvas(64, 108); paintFootage(T.foot.getContext('2d'));
    // pop-up bases (static per mode): [mode][sched 0|1]; footage frames 0..2
    T.pop = {};
    for (const md of ['yes_only', 'dnd', 'no_flicker', 'yes_no', 'yes_grey', 'cancelled', 'off']) T.pop[md] = [popBase(md, false), popBase(md, true)];
    T.foot3 = [popBase('footage', false, 0), popBase('footage', false, 1), popBase('footage', false, 2)];
    T.big = glyphSet(34, 42, '#f4f8fc', '#4a8ab8');
    T.small = glyphSet(13, 18, '#d8ecff', '#4a8ab8');
    T.wQuiet = word('QUIET IN', 13, 18, '#bfe6ff', '#4a8ab8');
    T.wPaused = word('PAUSED', 15, 18, '#ffd21f', '#8a6a10');
    // the dynamic canvases (keyed: one GPU texture each, repainted on change)
    T.ui = canvasTex(256, 256, (c) => c.clearRect(0, 0, 256, 256), { key: 'hqt_glass_ui', nearest: true });
    T.uiCtx = T.ui.image.getContext('2d');
    T.con = canvasTex(256, 96, (c) => { c.fillStyle = '#060a10'; c.fillRect(0, 0, 256, 96); }, { key: 'hqt_console', nearest: true });
    T.conCtx = T.con.image.getContext('2d');
    T.ph = canvasTex(64, 128, (c) => { c.fillStyle = '#05070a'; c.fillRect(0, 0, 64, 128); }, { key: 'hqt_phone', nearest: true });
    T.phCtx = T.ph.image.getContext('2d');
    return T;
  }

  // ---------------------------------------------------------- the glass UI painters (no allocation: drawImage + paths)
  const DASH = [0, 1000], NODASH = [], GL8 = new Int8Array(8);
  function cursorAt(c, x, y) {
    c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 15); c.lineTo(x + 3.8, y + 11.2); c.lineTo(x + 6.6, y + 17); c.lineTo(x + 9, y + 16); c.lineTo(x + 6.2, y + 10.3); c.lineTo(x + 11, y + 10.3); c.closePath();
    c.fillStyle = '#ffffff'; c.fill(); c.lineWidth = 1.3; c.strokeStyle = '#1a2a3a'; c.stroke();
  }
  function paintPopup() {
    const c = T.uiCtx;
    c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, 256, 152);
    const md = R.popup;
    if (md === 'footage') c.drawImage(T.foot3[R.footF < 0 ? 0 : R.footF], 0, 0);
    else if (md !== 'off') c.drawImage(T.pop[md][R.sched ? 1 : 0], 0, 0);
    if ((md === 'yes_no' || md === 'yes_grey') && R.hold > 0) {   // the ring filling round NO
      const x = NO_X - NO_W / 2, y = NO_Y - NO_H / 2, r = NO_H / 2, P = 2 * (NO_W - 2 * r) + TAU * r;
      DASH[0] = P * R.hold; DASH[1] = P + 10; c.setLineDash(DASH);
      c.lineWidth = 3; c.strokeStyle = R.hold >= 1 ? '#3ac87a' : '#2a8ad8'; rr(c, x, y, NO_W, NO_H, r); c.stroke(); c.setLineDash(NODASH);
    }
    if (R.cu >= 0 && md !== 'off' && md !== 'footage' && md !== 'cancelled') cursorAt(c, POX + R.cu * DWU * PS, R.cv * DHU * PS);
    T.ui.needsUpdate = true; R.uiDirty = false; R.uiT = R.t || 0;
  }
  function codes(out, secs, withSec) {   // hh:mm[:ss] -> glyph codes (10 = ':'); returns the count
    const s = Math.max(0, Math.floor(secs)), hh = Math.floor(s / 3600) % 24, mm = Math.floor(s / 60) % 60, ss = s % 60;
    out[0] = (hh / 10) | 0; out[1] = hh % 10; out[2] = 10; out[3] = (mm / 10) | 0; out[4] = mm % 10;
    if (!withSec) return 5;
    out[5] = 10; out[6] = (ss / 10) | 0; out[7] = ss % 10; return 8;
  }
  function run(c, set, n, x, y) { for (let i = 0; i < n; i++) { const g = set[GL8[i]]; c.drawImage(g, x, y); x += g.width - 2; } return x; }
  function runW(set, n) { let w = 0; for (let i = 0; i < n; i++) w += set[GL8[i]].width - 2; return w; }
  function paintClock() {
    const c = T.uiCtx, C = R.clk;
    c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 152, 256, 104);
    C.shownT = C.sec ? Math.floor(C.t) : Math.floor(C.t / 60); C.shownQ = C.q >= 0 ? Math.ceil(C.q) : -1; C.shownP = C.paused;
    if (C.on) {
      c.fillStyle = 'rgba(14,24,36,0.45)'; rr(c, 30, 161, 196, 62, 10); c.fill();
      c.strokeStyle = 'rgba(191,230,255,0.55)'; c.lineWidth = 1.5; rr(c, 30, 161, 196, 62, 10); c.stroke();
      let n = codes(GL8, C.t, C.sec), w = runW(T.big, n);
      run(c, T.big, n, 128 - w / 2, 160);
      if (C.paused) c.drawImage(T.wPaused, 128 - T.wPaused.width / 2, 202);
      else if (C.q >= 0) {
        n = codes(GL8, Math.ceil(C.q), true);
        const w1 = T.wQuiet.width, w2 = runW(T.small, n), x0 = 128 - (w1 + 2 + w2) / 2;
        c.drawImage(T.wQuiet, x0, 202); run(c, T.small, n, x0 + w1 + 2, 202);
      }
    }
    T.ui.needsUpdate = true;
  }
  // ---- the console screen (256 × 96) and the phone (64 × 128): repainted on change only
  function paintConsole() {
    const c = T.conCtx, md = R.conMode, a = R.conArg;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.fillStyle = md === 'restart' ? '#000000' : '#060a10'; c.fillRect(0, 0, 256, 96);
    if (md === 'restart') {   // the old JARVIS mark, three dots rising (one per chime note)
      c.strokeStyle = '#8fd8ff'; c.lineWidth = 2; c.beginPath(); c.arc(70, 40, 13, 0, TAU); c.stroke();
      c.fillStyle = '#8fd8ff'; c.beginPath(); c.arc(70, 40, 5, 0, TAU); c.fill();
      text(c, 'JARVIS', 150, 41, 28, '#e8f0f8', 'center', 'italic bold');
      const n = Math.max(0, Math.min(3, a | 0));
      for (let i = 0; i < 3; i++) { c.fillStyle = i < n ? '#ffd21f' : '#1a2028'; c.beginPath(); c.arc(112 + i * 16, 78 - i * 5, 4, 0, TAU); c.fill(); }
    } else if (md === 'idle') {
      c.lineWidth = 2;
      for (let k = 1; k <= 5; k++) { c.strokeStyle = `rgba(74,138,184,${0.5 - k * 0.08})`; c.beginPath(); c.ellipse(128, 48, k * 22, k * 8, 0, 0, TAU); c.stroke(); }
      c.fillStyle = '#4a8ab8'; c.beginPath(); c.arc(128, 48, 4, 0, TAU); c.fill();
      text(c, 'SafeSense', 248, 88, 9, '#4a8ab8', 'right', 'bold');
    } else if (md === 'password') {
      text(c, 'Password:', 24, 26, 16, '#bfe6ff', 'left', 'bold');
      c.strokeStyle = '#bfe6ff'; c.lineWidth = 2; rr(c, 22, 42, 212, 30, 6); c.stroke();
      c.fillStyle = 'rgba(191,230,255,0.08)'; rr(c, 22, 42, 212, 30, 6); c.fill();
      c.font = 'bold 18px "DejaVu Sans Mono", "Liberation Mono", monospace'; c.fillStyle = '#ffffff'; c.textAlign = 'left'; c.textBaseline = 'middle';
      const s = String(a || ''); c.fillText(s, 32, 58, 196);
      const cx = 32 + Math.min(196, c.measureText(s).width) + 2; c.fillStyle = '#8fd8ff'; c.fillRect(cx, 47, 2, 21);
    } else if (md === 'granted') {
      text(c, 'ACCESS GRANTED', 128, 32, 24, '#8fe8b0', 'center', 'bold', 236);
      text(c, 'HACK 0%', 128, 66, 20, '#ffffff', 'center', 'bold');
    } else {   // hack / stall
      const p = Math.max(0, Math.min(100, Math.round(+a || 0)));
      text(c, 'HACK ' + p + '%', 128, 28, 26, md === 'stall' ? '#9aa6b2' : '#ffffff', 'center', 'bold');
      c.strokeStyle = '#bfe6ff'; c.lineWidth = 2; rr(c, 24, 54, 208, 18, 4); c.stroke();
      c.fillStyle = md === 'stall' ? '#5a6a7a' : '#4a8ab8'; c.fillRect(27, 57, 202 * p / 100, 12);
      if (md === 'stall') {   // a frozen bar under a pop-up glyph
        c.fillStyle = '#f4f8fc'; rr(c, 100, 40, 56, 40, 6); c.fill(); c.fillStyle = '#4a8ab8'; c.fillRect(100, 40, 56, 9);
        text(c, '!', 128, 64, 20, '#c83a3a', 'center', 'bold');
      }
    }
    T.con.needsUpdate = true;
  }
  function phoneContent(c, w, h, md, p) {   // a box w × h (portrait 64 × 128 or landscape 128 × 64)
    c.fillStyle = '#0a0e14'; c.fillRect(0, 0, w, h);
    const land = w > h;
    if (md === 'keyboard') {
      c.strokeStyle = '#8fd8ff'; c.lineWidth = 1; c.strokeRect(4, 6, w - 8, 12); c.fillStyle = '#e8f0f8'; c.fillRect(7, 10, 18, 4);
      const ky = land ? 24 : 70, rows = 3, cols = land ? 10 : 6, kw = (w - 8) / cols, kh = land ? 12 : 16;
      for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) { c.fillStyle = '#2a3440'; c.fillRect(4 + k * kw + 1, ky + r * (kh + 2), kw - 2, kh); }
      return;
    }
    if (md === 'two') {
      c.fillStyle = '#1a2230'; c.fillRect(land ? 6 : 8, 6, land ? 40 : 48, land ? 40 : 48);
      text(c, 'two', land ? 88 : 32, land ? 22 : 74, land ? 22 : 20, '#ffffff', 'center', 'bold');
      c.fillStyle = '#ffd21f'; const tx = land ? 80 : 26, ty = land ? 40 : 92;
      c.beginPath(); c.moveTo(tx, ty); c.lineTo(tx + 12, ty + 7); c.lineTo(tx, ty + 14); c.closePath(); c.fill();
      c.fillStyle = '#3a4450'; c.fillRect(6, h - 8, w - 12, 2); c.fillStyle = '#ffd21f'; c.fillRect(6, h - 8, (w - 12) * 0.08, 2);
      return;
    }
    // hack / cracked
    text(c, 'HACK', w / 2, land ? 14 : 34, land ? 13 : 12, '#8fd8ff', 'center', 'bold');
    text(c, p + '%', w / 2, land ? 34 : 58, land ? 22 : 20, '#ffffff', 'center', 'bold');
    c.strokeStyle = '#8fd8ff'; c.lineWidth = 1; c.strokeRect(6, land ? 48 : 76, w - 12, 7);
    c.fillStyle = '#4a8ab8'; c.fillRect(7, land ? 49 : 77, (w - 14) * p / 100, 5);
  }
  function paintPhone() {
    const c = T.phCtx, md = R.phMode, p = Math.max(0, Math.min(100, Math.round(R.phPct || 0)));
    c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#05070a'; c.fillRect(0, 0, 64, 128);
    if (R.phState === 'docked') { c.setTransform(0, -1, 1, 0, 0, 128); phoneContent(c, 128, 64, md, p); }       // lying flat: landscape for Luka
    else if (R.phState === 'dangling') { c.setTransform(-1, 0, 0, -1, 64, 128); phoneContent(c, 64, 128, md, p); }   // hanging port-up: auto-rotated
    else phoneContent(c, 64, 128, md, p);
    c.setTransform(1, 0, 0, 1, 0, 0);
    if (md === 'cracked') {   // the crack, over everything
      c.strokeStyle = 'rgba(235,240,246,0.9)'; c.lineWidth = 1; seed = 58;
      for (let i = 0; i < 9; i++) { const a = i / 9 * TAU + rnd() * 0.5; let x = 40, y = 30; c.beginPath(); c.moveTo(x, y); for (let k = 0; k < 4; k++) { x += Math.cos(a + (rnd() - 0.5)) * (6 + rnd() * 10); y += Math.sin(a + (rnd() - 0.5)) * (6 + rnd() * 12); c.lineTo(x, y); } c.stroke(); }
      c.fillStyle = 'rgba(0,0,0,0.35)'; c.beginPath(); c.arc(40, 30, 6, 0, TAU); c.fill();
    }
    T.ph.needsUpdate = true;
  }

  // ---------------------------------------------------------- state (survives rebuilds)
  const NG = 24, NF = 14, NV = 14;
  const VENTS = [[-8, -20.4], [-4, -20.4], [0, -20.4], [4, -20.4], [8, -20.4], [-8, -17.0], [-4, -17.0], [0, -17.0], [4, -17.0], [8, -17.0], [-4, -13.6], [0, -13.6], [4, -13.6], [8, -13.6]];
  const HATCH = [[-7.5, -19.0], [-2.0, -17.6], [2.0, -17.6], [7.5, -19.0]], PORT = [[-7.5, 3.8], [7.5, 3.8]];
  function defaults() {
    if (R.init) return;
    R.init = true;
    Object.assign(R, {
      state: 'p', scene: undefined, env: null, lamp: 'desk', lampScene: null, lampOff: false, mode: 'live', forced: null, modeT: 0, checked: false, frames: 0, t: 0,
      popup: 'yes_only', sched: true, cu: -1, cv: 0, hold: 0, uiGlow: 1, uiDirty: false, uiT: 0, footF: -1,
      clk: { on: false, t: 0, q: -1, sec: false, paused: false, shownT: -2, shownQ: -2, shownP: false }, clkRate: 0,
      boost: 1, rainK: 0,
      conMode: 'idle', conArg: '', port: false,
      phState: 'hidden', phMode: 'keyboard', phPct: 0, phSwing: 0, phSwingT: 0,
      photoMode: 'down', chairSpin: 0, chairYaw: 0,
      mhU: 0, mhTo: 0, ldU: 0, ldTo: 0,
      dhU: [0, 0, 0, 0], dhTo: [0, 0, 0, 0], dpU: [0, 0], dpTo: [0, 0], vU: new Float32Array(NV), vTo: new Float32Array(NV), vDirty: true,
      fm: [0, 1, 2].map(() => ({ st: 'none', x: 0, z: 0, t: 0, dur: 1, k: 0 })), soft: 0, softTo: 0,
      fcol: [[1e4, 1e4, 1e4, 1e4], [1e4, 1e4, 1e4, 1e4], [1e4, 1e4, 1e4, 1e4]],
      frag: { on: false, t: 0, x: 0, z: 0 },
      sl: [0, 1, 2, 3].map(() => ({ on: false, t: 0, dur: 6, x: 0, z: 0, ry: 0 })),
      lvl: 1, flT: 0,
      crack: false, badge: { vis: false, x: 3.35, y: 0.012, z: -22.25, ry: 0.4 },
      fg: 0, fgTo: 0, fgDur: 2,
      lit: false, sky: { mode: 'midday_storm', lit: 0.35, swing: false, crowd: 'quiet', bridge: true, rain: false },
      ln: { next: 14, glass: -1, dur: 0.12, k: 1, thunder: -1 },
      aide: { vis: true, ax: -10.25, ay: 1.75, az: -12.35, bx: -10.25, by: 1.75, bz: -12.35, ry0: 0.3, ry1: 0.3, t: 1, dur: 1, talk: false, talkT: 0, lit: 'patrol' },
      ff: { n: NF, scatter: -1, col: DL.blue },
    });
    // galaxy (24): idle orbit params + live / start / target positions, yaw, per-drone delays, colours
    const G = R.G = {
      mode: 'idle', t: 0, dur: 1, after: 'idle', blend: 1, cx: -3.0, cz: -13.8, visible: false,
      r: new Float32Array(NG), w: new Float32Array(NG), ph: new Float32Array(NG), y: new Float32Array(NG), bp: new Float32Array(NG),
      px: new Float32Array(NG), py: new Float32Array(NG), pz: new Float32Array(NG), yaw: new Float32Array(NG),
      sx: new Float32Array(NG), sy: new Float32Array(NG), sz: new Float32Array(NG), syaw: new Float32Array(NG),
      tx: new Float32Array(NG), ty: new Float32Array(NG), tz: new Float32Array(NG), tyaw: new Float32Array(NG),
      dl: new Float32Array(NG), fl: 1, ang: new Float32Array(NG),
      cf: new Float32Array(NG * 3), ct: new Float32Array(NG * 3), cT: 1, cDur: 0, cDirty: true, shF: new THREE.Color(SHELL), shT: new THREE.Color(SHELL), wx: 0, wy: 0, wz: 0,
    };
    seed = 2040;
    for (let i = 0; i < NG; i++) {
      G.r[i] = 4.0 + 6.5 * rnd(); G.w[i] = (0.02 + 0.03 * rnd()) * (i % 3 === 0 ? -1 : 1); G.ph[i] = rnd() * TAU; G.y[i] = 2.2 + 2.2 * rnd(); G.bp[i] = rnd() * TAU;
      tc.setHex(DL.blue); G.cf[i * 3] = G.ct[i * 3] = tc.r; G.cf[i * 3 + 1] = G.ct[i * 3 + 1] = tc.g; G.cf[i * 3 + 2] = G.ct[i * 3 + 2] = tc.b;
    }
    orbitAll(0);
    // fireflies (14) outside: homes + Lissajous params
    const F = R.F = { hx: new Float32Array(NF), hy: new Float32Array(NF), hz: new Float32Array(NF), ax: new Float32Array(NF), ay: new Float32Array(NF), fx: new Float32Array(NF), fy: new Float32Array(NF), ph: new Float32Array(NF), cDirty: true };
    seed = 1414;
    for (let i = 0; i < NF; i++) {
      F.hx[i] = -10.5 + 21 * (i + 0.5) / NF + (rnd() - 0.5) * 1.2; F.hy[i] = 0.9 + 3.8 * rnd(); F.hz[i] = -10.4 + 4.2 * rnd();
      F.ax[i] = 0.4 + 0.5 * rnd(); F.ay[i] = 0.3 + 0.4 * rnd(); F.fx[i] = TAU / (7 + 6 * rnd()); F.fy[i] = TAU / (7 + 6 * rnd()); F.ph[i] = rnd() * TAU;
    }
  }
  function orbitAll(t) {
    const G = R.G;
    for (let i = 0; i < NG; i++) { const a = G.ph[i] + G.w[i] * t; G.px[i] = Math.cos(a) * G.r[i]; G.pz[i] = -17.2 + Math.sin(a) * G.r[i] * 0.48; G.py[i] = G.y[i]; G.yaw[i] = Math.atan2(-Math.sin(a) * Math.sign(G.w[i]), Math.cos(a) * 0.48 * Math.sign(G.w[i])); }
  }

  // ---------------------------------------------------------- dressing (spec §12.2) and the per-scene sync
  const AUTO = { 'P': 'p', '2.5': 's25', '3.3': 's33', '3.4': 's34', '3.5': 's35', '3.6': 's36' };
  const DRESS = {
    p:   { lamp: 'desk',    popup: 'yes_only', sched: true,  clock: null, galaxy: false, gcol: 'blue', ff: NF, hatch: 0, con: 'idle', conArg: '', phone: 'hidden', ph: ['keyboard', 0], sky: 'midday_storm', rainSky: false, vents: 0, crack: false, aide: 'p_drone_shoulder' },
    s25: { lamp: 'off',     popup: 'footage',  sched: false, clock: null, galaxy: false, gcol: 'blue', ff: NF, hatch: 0, con: 'idle', conArg: '', phone: 'hidden', ph: ['keyboard', 0], sky: 'midday_storm', rainSky: false, vents: 0, crack: false, aide: 's25_drone' },
    s33: { lamp: 'console', popup: 'yes_only', sched: false, clock: [11 * 3600 + 41 * 60, false, 17 * 60, false, 1], galaxy: 'idle', gcol: 'blue', ff: NF, hatch: 1, con: 'idle', conArg: '', phone: 'hidden', ph: ['keyboard', 0], sky: 'storm', rainSky: true, vents: 0, crack: false, aide: null },
    s34: { lamp: 'console', popup: 'yes_only', sched: false, clock: [11 * 3600 + 43 * 60, false, 15 * 60, false, 0], galaxy: false, gcol: 'red', ff: 8, hatch: 1, con: 'hack', conArg: 0, phone: 'docked', ph: ['hack', 0], sky: 'storm', rainSky: true, vents: 0, crack: false, aide: null },
    s35: { lamp: 'console', popup: 'yes_only', sched: false, clock: [11 * 3600 + 54 * 60, false, 4 * 60, false, 0], galaxy: 'hang', gcol: 'red', ff: 8, hatch: 1, con: 'hack', conArg: 85, phone: 'docked', ph: ['hack', 85], sky: 'storm', rainSky: true, vents: 0, crack: false, aide: null },
    s36: { lamp: 'ring',    popup: 'yes_only', sched: false, clock: [11 * 3600 + 57 * 60 + 30, true, null, true, 0], galaxy: 'ring', gcol: 'yellow', ff: 8, hatch: 1, con: 'hack', conArg: 100, phone: 'dangling', ph: ['cracked', 100], sky: 'storm', rainSky: true, vents: 1, crack: true, aide: null },
  };
  const STORMY = { s33: 1, s34: 1, s35: 1, s36: 1 };
  function sync() {
    defaults();
    if (SETVIEW()) return;
    const sc = sceneNow();
    if (sc == null || sc === R.scene) return;
    R.scene = sc;
    const st = AUTO[sc];
    if (st) dress(st, { keepLamp: R.lampScene === sc });
  }
  function dress(st, o = {}) {
    defaults();
    if (!DRESS[st]) st = 'p';
    if (!o.sv) { const sc = sceneNow(); if (sc != null) R.scene = sc; }
    const D = DRESS[st];
    R.state = st; R.forced = null; R.lit = false;
    // glass UI
    R.popup = D.popup; R.sched = D.sched; R.cu = -1; R.hold = 0; R.uiGlow = 1; R.footF = -1;
    const C = R.clk;
    if (D.clock) { C.on = true; C.t = D.clock[0]; C.sec = D.clock[1]; C.q = D.clock[2] == null ? -1 : D.clock[2]; C.paused = D.clock[3]; R.clkRate = D.clock[4]; }
    else { C.on = false; R.clkRate = 0; }
    // console, phone, photo, chair
    R.conMode = D.con; R.conArg = D.conArg; R.port = st !== 'p' && st !== 's25' && st !== 's33';
    R.phState = D.phone; R.phMode = D.ph[0]; R.phPct = D.ph[1]; R.phSwing = st === 's36' ? 0.02 : 0;
    R.photoMode = 'down'; R.chairSpin = 0;
    // hatches, ports, vents, foam, slicks
    R.mhU = R.mhTo = R.ldU = R.ldTo = D.hatch;
    for (let i = 0; i < 4; i++) R.dhU[i] = R.dhTo[i] = 0;
    for (let i = 0; i < 2; i++) R.dpU[i] = R.dpTo[i] = 0;
    for (let i = 0; i < NV; i++) R.vU[i] = R.vTo[i] = D.vents;
    R.vDirty = true;
    for (let i = 0; i < 3; i++) { R.fm[i].st = 'none'; R.fm[i].k = 0; }
    R.soft = R.softTo = 0; R.frag.on = false;
    for (const s of R.sl) s.on = false;
    // lights, crack, badge, facade glow, rain boost
    R.lvl = 1; R.flT = 0; R.crack = D.crack; R.badge.vis = false; R.fg = R.fgTo = 0; R.boost = 1;
    // drones
    const G = R.G;
    G.cDur = 0; G.cT = 1; setCols(DL[D.gcol]); G.shF.setHex(D.gcol === 'yellow' ? SHELL_Y : SHELL); G.shT.copy(G.shF); G.cDirty = true;
    if (D.galaxy === 'ring') { ringSlots(-3.0, -13.8, 2.3, 1.9); for (let i = 0; i < NG; i++) { G.px[i] = G.tx[i]; G.py[i] = G.ty[i]; G.pz[i] = G.tz[i]; G.yaw[i] = G.tyaw[i]; } G.mode = 'ringhold'; }
    else { orbitAll(R.t || 0); G.mode = D.galaxy === 'hang' ? 'hang' : 'idle'; G.blend = 1; }
    G.visible = !!D.galaxy;
    R.ff.n = D.ff; R.ff.scatter = -1; R.ff.col = DL.blue; R.F.cDirty = true;
    const A = R.aide; A.vis = !!D.aide; A.talk = false; if (D.aide) placeAide(D.aide);
    // sky
    const S = R.sky; S.mode = D.sky; S.lit = 0.35; S.swing = false; S.crowd = 'quiet'; S.bridge = true; S.rain = D.rainSky && R.rainK > 0.02;
    if (R.root) applyAll();
    if (!o.keepLamp) setLamp(D.lamp);
    if (isCur()) applyAmbience(true);
  }
  // ?setview: the env picks the dressing (and a few extras so each preset's views show its scene)
  const SV = { midday: 'p', cutaway: 's25', storm_dry: 's33', storm: 's33', boss: 's34', storm_flash: 's34', strike: 's35', yellow: 's36', lit: 's36' };
  function svDress(env) {
    dress(SV[env] || 'p', { sv: true });
    if (env === 'boss' || env === 'storm_flash') { R.dhU[0] = R.dhTo[0] = 1; R.dpU[1] = R.dpTo[1] = 1; slickShow(0, -4.5, -18.0, 0.6, 1e6); slickShow(1, 2.5, -13.2, -0.3, 1e6); }
    if (env === 'strike') {
      for (let i = 0; i < NV; i++) R.vU[i] = R.vTo[i] = 1; R.vDirty = true;
      R.crack = true; R.badge.vis = true; R.phState = 'dangling'; R.phMode = 'cracked'; R.phPct = 99; R.conArg = 98;
      R.fm[1].st = 'up'; R.fm[1].x = -8; R.fm[1].z = -17; R.fm[2].st = 'up'; R.fm[2].x = 4; R.fm[2].z = -17;
      R.dhU[1] = R.dhTo[1] = 1;
      setLamp('wall');
    }
    if (env === 'lit') lightUp(0);
    applyAll();
  }

  // ---------------------------------------------------------- lamps (spec §3.4): the one spot, parked by name
  const LAMPS = {
    desk:    { p: [-9.55, 4.9, -15.0], t: [-9.55, 0.74, -15.0], a: 0.32, pen: 0.6, d: 7, c: 0xe8f0ff, i: 1.6 },
    console: { p: [0.0, 4.9, -15.6], t: [0.0, 0.9, -15.6], a: 0.42, pen: 0.6, d: 8, c: 0xdfe8ff, i: 1.4 },
    glass:   { p: [-3.0, 4.9, -13.4], t: [-3.0, 1.8, -11.3], a: 0.5, pen: 0.7, d: 8, c: 0xcfe6ff, i: 1.0 },
    wall:    { p: [2.8, 4.9, -20.6], t: [2.8, 0.4, -22.6], a: 0.4, pen: 0.7, d: 8, c: 0xcfd8e8, i: 1.2 },
    ring:    { p: [-3.0, 4.9, -13.8], t: [-3.0, 0.8, -13.8], a: 0.55, pen: 0.8, d: 8, c: 0xffd21f, i: 1.2 },
    mgr:     { p: [-8.0, 4.9, -12.0], t: [-9.45, 1.25, -12.0], a: 0.3, pen: 0.6, d: 7, c: 0xe8f0ff, i: 1.4 },   // on the chest at mgr_turn (3.3 badge insert)
  };
  const LAMP_GAIN = 5.0;   // the engine's spot (decay 1.5, physical units) needs ~5x the spec's nominal values at 4–5 m
  function lamp(name) { sync(); R.lampScene = sceneNow(); setLamp(name); }
  function setLamp(name) {
    R.lamp = LAMPS[name] ? name : 'off'; R.lampOff = false;
    if (isCur() && R.lamp === 'off' && typeof world !== 'undefined') world.torchAuto = true;
    holdLamp();
  }
  function holdLamp() {
    if (!isCur() || typeof world === 'undefined') return;
    const s = world.torch; if (!s) return;
    if (R.lamp === 'off') { if (!R.lampOff) { R.lampOff = true; s.intensity = 0; } return; }
    const L = LAMPS[R.lamp];
    world.torchAuto = false;
    s.position.set(L.p[0], L.p[1], L.p[2]); s.target.position.set(L.t[0], L.t[1], L.t[2]);
    s.angle = L.a; s.penumbra = L.pen; s.distance = L.d; s.color.setHex(L.c); s.intensity = L.i * LAMP_GAIN;
  }

  // ---------------------------------------------------------- mirror (live | baked) + floor tint per env
  const MIR_TINT = { midday: 0xd8d4e8, cutaway: 0xffffff, storm_dry: 0xc8d4d0, storm: 0xc8d4d0, boss: 0xd8e4e0, storm_flash: 0xffffff, strike: 0xb0b8b6, yellow: 0xe8dcb0, lit: 0xf0d8c8 };
  function autoMode() {
    if (!R.mirror || !R.mirror.userData.setMode) return 'baked';
    if (R.forced) return R.forced;
    if (R.state === 's34') return 'baked';
    if (SETS.hq_floors && SETS.hq_floors.makeMirror && SETS.hq_floors.makeMirror.touch && SETS.hq_floors.makeMirror.touch()) return 'baked';
    if (typeof renderer !== 'undefined' && renderer.getPixelRatio && renderer.getPixelRatio() < 0.75) return 'baked';
    return 'live';
  }
  function applyMode() {
    const mode = autoMode(); R.mode = mode;
    if (R.mirror && R.mirror.userData.setMode) R.mirror.userData.setMode(mode);
    if (R.baked) R.baked.visible = mode === 'baked';
  }
  function reflect(mode) { sync(); R.forced = mode === 'live' || mode === 'baked' ? mode : null; applyMode(); }
  function mirrorTint(dt) {
    if (!R.mirror || !R.mirror.userData.mirror) return;
    const u = R.mirror.userData.mirror;
    tc.setHex(MIR_TINT[R.env] ?? 0xd0d8d8);
    if (dt <= 0) u.tint.copy(tc); else u.tint.lerp(tc, Math.min(1, dt * 2));
  }

  // ---------------------------------------------------------- ambience per state (the getter feeds the flow's loadSet)
  const AMB = {
    calm:  { rain: 'glass', loops: [['hq_hush', 0.45], ['drone_idle', 0.35], ['thunder_far', 0.55]], room: 'room' },
    storm: { rain: 'glass', loops: [['hq_hush', 0.4], ['drone_idle', 0.3], ['thunder_far', 0.7]], room: 'room' },
    boss:  { rain: 'glass', loops: [['hq_hush', 0.4], ['thunder_far', 0.75]], room: 'room' },
    lit:   { rain: 'glass', loops: [['hq_hush', 0.3], ['drone_idle', 0.25], { name: 'valley_music_far', vol: 0.8, lp: 400 }], room: 'room' },
  };
  const ambKey = () => (R.state === 'p' || R.state === 's25' ? 'calm' : R.state === 's34' ? 'boss' : R.state === 's36' && R.lit ? 'lit' : 'storm');
  function applyAmbience(force) {
    const k = ambKey(); if (!force && R.ambKey === k) return;
    R.ambKey = k;
    if (typeof AUDIO === 'undefined' || !AUDIO.ambience) return;
    const a = AMB[k], wet = typeof world !== 'undefined' && world.raining;
    AUDIO.ambience(wet ? a : { rain: false, loops: a.loops, room: a.room });
    if (AUDIO.setRoom) AUDIO.setRoom(a.room);
  }

  // ---------------------------------------------------------- the API helpers shared by props
  const MK = {};   // marks (filled from the data block below)
  function where(w, out) {   // a mark name, [x, z], [x, y, z] or [x, y, z, ry] -> out [x, y, z, ry (NaN = none)]
    const m = typeof w === 'string' ? MK[w] : w;
    if (!m || !(m.length >= 2)) return false;
    if (m.length === 2) { out[0] = m[0]; out[1] = 0; out[2] = m[1]; out[3] = NaN; }
    else { out[0] = m[0]; out[1] = m[1]; out[2] = m[2]; out[3] = m.length > 3 ? m[3] : NaN; }
    return true;
  }
  const W4 = [0, 0, 0, 0], W4b = [0, 0, 0, 0];
  function setCols(hex) { const G = R.G; tc.setHex(hex); for (let i = 0; i < NG; i++) { G.cf[i * 3] = G.ct[i * 3] = tc.r; G.cf[i * 3 + 1] = G.ct[i * 3 + 1] = tc.g; G.cf[i * 3 + 2] = G.ct[i * 3 + 2] = tc.b; } }
  const RING_GAP = 0.75;
  function ringSlots(cx, cz, r, y) {
    const G = R.G; G.cx = cx; G.cz = cz;
    for (let i = 0; i < NG; i++) {
      // an open arc toward the glass (angle 0 = +Z): the pop-up / clock read through it (hold_no, s36_ring_wide)
      const up = i >= 14, k = up ? i - 14 : i, n = up ? 10 : 14, a = RING_GAP + (k + 0.5) / n * (TAU - 2 * RING_GAP), rr2 = up ? r * 0.86 : r;
      G.ang[i] = a; G.tx[i] = cx + Math.sin(a) * rr2; G.ty[i] = y + (up ? 0.6 : -0.3); G.tz[i] = Math.min(-11.55, cz + Math.cos(a) * rr2); G.tyaw[i] = a + PI;
    }
  }
  function flyStart(dur, after, stagger) {   // every drone eases from where it is to its target (G.t*)
    const G = R.G;
    for (let i = 0; i < NG; i++) { G.sx[i] = G.px[i]; G.sy[i] = G.py[i]; G.sz[i] = G.pz[i]; G.syaw[i] = G.yaw[i]; G.dl[i] = stagger(i); }
    G.mode = 'fly'; G.t = 0; G.fl = Math.max(0.05, dur); G.after = after;
    if (skipping() || dur <= 0) { G.t = 1e6; }
  }
  function placeAide(w) {
    const A = R.aide;
    if (!where(w, W4)) return;
    A.ax = A.bx = W4[0]; A.ay = A.by = W4[1]; A.az = A.bz = W4[2]; A.ry0 = A.ry1 = isNaN(W4[3]) ? A.ry1 : W4[3]; A.t = A.dur = 1;
  }
  function slickShow(i, x, z, ry, dur) { const s = R.sl[i | 0]; if (!s) return; s.on = true; s.t = 0; s.dur = dur ?? 6; s.x = x; s.z = z; s.ry = ry || 0; if (skipping()) s.on = false; }
  function lightUp(dur = 2) {   // 11:58
    const S = R.sky; R.lit = true; S.lit = 1.0; S.swing = true; S.crowd = 'look_up'; S.bridge = true;
    if (R.sky3 && R.sky3.userData.lit) { const u = R.sky3.userData; u.lit(1.0, skipping() ? 0 : dur); u.swing(true); u.crowd('look_up'); u.bridgeLights(true); }
    R.fgTo = 1; R.fgDur = Math.max(0.01, dur); if (skipping() || dur <= 0) R.fg = 1;
    if (R.ff.scatter < 0) R.ff.scatter = skipping() || dur <= 0 ? 6 : 0;
    if (isCur()) applyAmbience(true);
  }
  function flash(k = 1) {
    if (skipping()) return;
    if (R.sky3 && R.sky3.userData.flash) R.sky3.userData.flash(k);
    const L = R.ln; L.glass = 0; L.k = k; L.dur = reduceFx() ? 1.5 : 0.12;
  }

  // ---------------------------------------------------------- build
  function mats() {
    UNLIT ||= new THREE.MeshBasicMaterial({ vertexColors: true });
    WASHM ||= new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
    STRIPM ||= new THREE.MeshBasicMaterial({ vertexColors: true, color: 0xffffff });
    LAMPM ||= new THREE.MeshBasicMaterial({ color: 0xff3a30 });
    PORTM ||= new THREE.MeshBasicMaterial({ color: 0x2a3038 });
    GLASSM ||= new THREE.MeshBasicMaterial({ color: 0x223040, transparent: true, opacity: 0.22, depthWrite: false, side: DS, fog: false });
    RAINAM ||= new THREE.MeshBasicMaterial({ map: T.rainA, color: 0xc8d4dc, transparent: true, opacity: 0, depthWrite: false, fog: false });
    RAINBM ||= new THREE.MeshBasicMaterial({ map: T.rainB, color: 0xc8d4dc, transparent: true, opacity: 0, depthWrite: false, fog: false });
    UIM ||= new THREE.MeshBasicMaterial({ map: T.ui, transparent: true, depthWrite: false, fog: false });
    CONM ||= new THREE.MeshBasicMaterial({ map: T.con, color: 0xffffff });
    PHM ||= new THREE.MeshBasicMaterial({ map: T.ph, color: 0xffffff });
    SLM ||= new THREE.MeshBasicMaterial({ map: T.slick, color: 0xffffff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    FGM ||= new THREE.MeshBasicMaterial({ map: T.glowY, color: 0x000000, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: DS, fog: false });
    SKYM ||= new THREE.MeshBasicMaterial({ color: 0x4a5652 });
    BACKM ||= new THREE.MeshBasicMaterial({ color: 0x2c3432, fog: false });
    UNLIT.name = 'hqt_unlit'; STRIPM.name = 'hqt_strip'; GLASSM.name = 'hqt_glass'; UIM.name = 'hqt_ui'; CONM.name = 'hqt_console'; PHM.name = 'hqt_phone';
    M = {
      vc: mat(0xffffff), panel: matTex(T.panel), atlas: matTex(T.atlas), desk: matTex(T.desk, { emissive: 0xffffff, emissiveIntensity: 0.6 }), quilt: matTex(T.quilt),
      photo: matTex(T.photo), photoBack: matTex(T.photoBack), crack: matTex(T.crack, { transparent: true }),
      glow: UNLIT, wash: WASHM, strip: STRIPM, lamp: LAMPM, port: PORTM, glass: GLASSM, rainA: RAINAM, rainB: RAINBM, ui: UIM, con: CONM, ph: PHM, sky: SKYM, back: BACKM,
    };
  }
  const HOLES = [[-8.0, -19.5, -7.0, -18.5], [-2.5, -18.1, -1.5, -17.1], [1.5, -18.1, 2.5, -17.1], [7.0, -19.5, 8.0, -18.5], [7.55, -13.35, 8.45, -12.45]];
  function buildShell() {
    // ---- walls (textured panels facing into the room) + colliders (spec §2.4: the lift doors are part of E)
    wall(-12.2, -23.4, -12.0, -11.0); wall(12.0, -23.4, 12.2, -11.0); wall(-12.2, -23.4, 12.2, -23.2); wall(-12.2, -11.2, 12.2, -11.0);
    tquad(24.0, 5.2, M.panel, 0, 2.6, -23.2, 0, 0, [1.2, 5.2], WALL);
    tquad(4.0, 3.0, M.panel, 3.0, 1.5, -23.188, 0, 0, [1.0, 3.0], PALE);                               // the pale impact panel
    bb(0.97, 0, -23.2, 1.0, 3.03, -23.17, SKIRT); bb(5.0, 0, -23.2, 5.03, 3.03, -23.17, SKIRT); bb(0.97, 3.0, -23.2, 5.03, 3.03, -23.17, SKIRT);
    // the end walls: the last 3.6 m by the glass catch the storm light (the figure at the glass reads against it)
    tquad(8.4, 5.2, M.panel, -12.0, 2.6, -19.0, H, 0, [1.2, 5.2], WALL);
    rquadRamp(3.6, 5.2, M.panel, -12.0, 2.6, -13.0, H, [1.2, 5.2], WALL_LIT, WALL);
    tquad(1.6, 5.2, M.panel, 12.0, 2.6, -22.4, -H, 0, [1.2, 5.2], WALL);
    tquad(5.0, 5.2, M.panel, 12.0, 2.6, -17.3, -H, 0, [1.2, 5.2], WALL, 0.33);
    rquadRamp(3.6, 5.2, M.panel, 12.0, 2.6, -13.0, -H, [1.2, 5.2], WALL, WALL_LIT, 0.33 + 5.0 / 1.2);
    rquadRamp(3.6, 5.2, M.wash, -11.98, 2.6, -13.0, H, [1, 1], WASH, 0x000000);       // + an additive wash (the panels
    rquadRamp(3.6, 5.2, M.wash, 11.98, 2.6, -13.0, -H, [1, 1], 0x000000, WASH);       //   alone stay too dark to read)
    tquad(1.8, 2.8, M.panel, 12.0, 3.8, -20.7, -H, 0, [1.2, 5.2], WALL, 0, 0.46);
    // skirting + the shadow gap under the ceiling
    bb(-12, 0, -23.2, 12, 0.08, -23.175, SKIRT); bb(-12, 0, -23.2, -11.975, 0.08, -11.2, SKIRT);
    bb(11.975, 0, -23.2, 12, 0.08, -21.62, SKIRT); bb(11.975, 0, -19.78, 12, 0.08, -11.2, SKIRT);
    bb(-12, 5.12, -23.2, 12, 5.2, -23.17, BLACK, M.glow); bb(-12, 5.12, -23.2, -11.97, 5.2, -11.2, BLACK, M.glow); bb(11.97, 5.12, -23.2, 12, 5.2, -11.2, BLACK, M.glow);
    // ---- ceiling (unlit dark slate) with the five hatch openings, light-strip troughs
    holeCeil(-12, -23.2, 12, -11.2, 5.2, HOLES, CEIL, M.glow);
    for (let x = -10.8; x <= 10.8; x += 2.4) {   // panel joints (split round the openings)
      let z0 = -23.2;
      for (const [a0, c0, a1, c1] of HOLES) if (x >= a0 - 0.02 && x <= a1 + 0.02) { bb(x - 0.005, 5.195, z0, x + 0.005, 5.198, c0, 0x0e1014, M.glow); z0 = c1; }
      bb(x - 0.005, 5.195, z0, x + 0.005, 5.198, -11.3, 0x0e1014, M.glow);
    }
    // ---- the glass wall: mullions, sill, head, smoked panes, the two drone-port rims
    for (let x = -12; x <= 12; x += 3) bb(x - 0.05, 0.06, -11.225, x + 0.05, 5.12, -11.045, MULL);   // set just outside the UI / rain layers
    bb(-12, 0, -11.32, 12, 0.06, -11.08, BLACK);
    bb(-12, 5.12, -11.32, 12, 5.2, -11.08, MULL);
    quad(24, 5.06, M.glass, 0, 2.59, -11.2, PI);
    for (const [px, py] of PORT) {
      torus(0.53, 0.05, 6, 24, MULL, px, py, -11.2);
      torus(0.47, 0.012, 4, 24, 0x8fd8ff, px, py, -11.25, 0, 0, M.glow);
      labH(4, 1, 0.5, 0.125, px, py - 0.68, -11.24, PI);
    }
    // ---- outside: the slab edges above and below the glass (seen looking down / up through it)
    bb(-16, -0.8, -11.08, 16, 0.0, -10.9, 0x15181c); bb(-16, 5.2, -11.08, 16, 5.7, -10.9, 0x15181c);
    // ---- the maintenance hatch shaft (black lining) + the roof sky above it
    quad(0.9, 0.6, M.glow, 8.0, 5.5, -13.35, 0, 0, 0x0c0e10); quad(0.9, 0.6, M.glow, 8.0, 5.5, -12.45, PI, 0, 0x0c0e10);
    quad(0.9, 0.6, M.glow, 7.55, 5.5, -12.9, H, 0, 0x0c0e10); quad(0.9, 0.6, M.glow, 8.45, 5.5, -12.9, -H, 0, 0x0c0e10);
    quad(0.9, 0.9, M.sky, 8.0, 5.8, -12.9, 0, H);
    bb(7.5, 5.17, -13.4, 8.5, 5.2, -13.35, STEEL); bb(7.5, 5.17, -12.45, 8.5, 5.2, -12.4, STEEL); bb(7.5, 5.17, -13.35, 7.55, 5.2, -12.45, STEEL); bb(8.45, 5.17, -13.35, 8.5, 5.2, -12.45, STEEL);
    // ---- the four drone hatch recesses (black, a stencil band beside each)
    for (const [cx, cz] of HATCH) {
      quad(1.0, 0.35, M.glow, cx, 5.375, cz - 0.5, 0, 0, 0x0a0b0d); quad(1.0, 0.35, M.glow, cx, 5.375, cz + 0.5, PI, 0, 0x0a0b0d);
      quad(1.0, 0.35, M.glow, cx - 0.5, 5.375, cz, H, 0, 0x0a0b0d); quad(1.0, 0.35, M.glow, cx + 0.5, 5.375, cz, -H, 0, 0x0a0b0d);
      quad(1.0, 1.0, M.glow, cx, 5.55, cz, 0, H, 0x101216);
      bb(cx - 0.55, 5.17, cz - 0.55, cx + 0.55, 5.2, cz - 0.5, STEELD); bb(cx - 0.55, 5.17, cz + 0.5, cx + 0.55, 5.2, cz + 0.55, STEELD);
      bb(cx - 0.55, 5.17, cz - 0.5, cx - 0.5, 5.2, cz + 0.5, STEELD); bb(cx + 0.5, 5.17, cz - 0.5, cx + 0.55, 5.2, cz + 0.5, STEELD);
    }
    // ---- foam vents: rims, the dark ring below each grille, the warning label on the floor (north of each)
    for (const [x, z] of VENTS) {
      cyl(0.41, 0.41, 0.012, 20, STEELD, x, 0.006, z);
      cyl(0.345, 0.345, 0.003, 20, BLACK, x, 0.0135, z, 0, 0, M.glow);
      lab(2, 0.62, 0.078, x, 0.004, z - 0.5, 0, -H);
    }
  }
  function buildFurniture() {
    // ---- the desk (x -10..-9.1, z -17.6..-14.4, top 0.74): black gloss slab on two panel legs; the reflection is painted
    bb(-10.0, 0.68, -17.6, -9.1, 0.74, -14.4, GLOSS);
    rquad(0.9, 3.2, M.desk, [0, 0, 128, 128], -9.55, 0.7405, -16.0, 0, -H, 0xffffff, 128, 128);
    bb(-9.98, 0, -17.58, -9.12, 0.68, -17.52, GLOSS); bb(-9.98, 0, -14.48, -9.12, 0.68, -14.42, GLOSS);
    bb(-10.0, 0.735, -17.6, -9.1, 0.742, -17.585, GLOSSHI); bb(-10.0, 0.735, -14.415, -9.1, 0.742, -14.4, GLOSSHI);
    bb(-10.005, 0.735, -17.6, -9.995, 0.742, -14.4, GLOSSHI); bb(-9.105, 0.735, -17.6, -9.095, 0.742, -14.4, GLOSSHI);
    wall(-10.0, -17.6, -9.1, -14.4);
    // ---- filing cabinets: two back to back (island x -6.55..-5.55, z -20.75..-20.10, h 1.3), drawers both faces
    bb(-6.55, 0, -20.75, -5.55, 1.3, -20.10, CAB);
    for (const [fz, s] of [[-20.75, -1], [-20.10, 1]]) for (let k = 0; k < 4; k++) {
      const y = 0.08 + k * 0.3;
      bb(-6.52, y, fz + s * 0.002, -5.58, y + 0.006, fz + s * 0.006, 0x24272c);
      bb(-6.15, y + 0.15, fz + s * 0.002, -5.95, y + 0.18, fz + s * 0.02, 0x8a929c);
    }
    bb(-6.55, 1.29, -20.75, -5.55, 1.3, -20.10, 0x50555c);
    wall(-6.55, -20.75, -5.55, -20.10);
    // ---- the planter of dead plants (the one imperfect thing in the room)
    bb(-3.0, 0, -21.7, -0.6, 0.6, -21.1, CONC); bb(-2.95, 0.5, -21.65, -0.65, 0.58, -21.15, 0x2a2018);
    seed = 99;
    for (let i = 0; i < 16; i++) {
      const x = -2.85 + 2.1 * rnd(), z = -21.6 + 0.4 * rnd(), h = 0.4 + 0.32 * rnd(), lx = (rnd() - 0.5) * 0.35, lz = (rnd() - 0.5) * 0.25;
      seg3(x, 0.58, z, x + lx, 0.58 + h, z + lz, 0.016, rnd() < 0.5 ? STALK : STALK2);
      if (rnd() < 0.6) { const dx = (rnd() - 0.5) * 0.18; seg3(x + lx, 0.58 + h, z + lz, x + lx + dx, 0.58 + h - 0.12, z + lz + 0.05, 0.012, STALK2); }
      if (rnd() < 0.5) boxR(0.07, 0.006, 0.03, STALK, x + lx * 0.6, 0.58 + h * 0.6, z + lz * 0.6, 0.6, rnd() * PI, 0.4);
    }
    wall(-3.0, -21.7, -0.6, -21.1);
    // ---- the sofa (x 5.9..8.1, z -21.25..-20.35; back on the north side, facing south)
    bb(5.9, 0.08, -21.25, 8.1, 0.38, -20.35, SOFA);
    bb(5.95, 0.38, -21.0, 7.0, 0.47, -20.38, 0x33363e); bb(7.0, 0.38, -21.0, 8.05, 0.47, -20.38, 0x33363e);
    bb(5.9, 0.38, -21.25, 8.1, 0.85, -21.0, SOFA);
    bb(5.9, 0.38, -21.25, 6.08, 0.62, -20.35, 0x282b31); bb(7.92, 0.38, -21.25, 8.1, 0.62, -20.35, 0x282b31);
    for (const [x, z] of [[5.96, -21.2], [8.04, -21.2], [5.96, -20.4], [8.04, -20.4]]) bb(x - 0.03, 0, z - 0.03, x + 0.03, 0.08, z + 0.03, 0x111214);
    wall(5.9, -21.25, 8.1, -20.35);
    wall(-1.2, -15.8, 1.2, -15.0);          // the console (the prop)
    wall(-8.8, -13.9, -8.2, -13.3);         // the empty chair (the prop)
  }
  // a mirrored (y -> -y) copy of the static room for the baked mirror mode (the floor turns translucent over it)
  function bakedCopy(srcs) {
    const g = new THREE.Group(); g.name = 'mirror_baked'; g.scale.y = -1; g.visible = false; g.userData.noOcclude = true;
    for (const src of srcs) {
      src.updateWorldMatrix(true, true);
      src.traverse((o) => {
        if (!o.isMesh || o.isInstancedMesh || o.material === GLASSM || o.material === UIM) return;
        const c = new THREE.Mesh(o.geometry, o.material); c.matrixAutoUpdate = false; c.matrix.copy(o.matrixWorld); c.userData.noOcclude = true; g.add(c);
      });
    }
    const bk = new THREE.Mesh(new THREE.PlaneGeometry(30, 7), BACKM); bk.position.set(0, 3.5, -11.0); bk.rotation.y = PI; bk.userData.noOcclude = true; g.add(bk);   // outside, mirrored: the storm, not the street
    return g;
  }
  function fallbackSky() {   // SETS.valley missing: a dark horizon band, 20 box towers, a low bridge (never throws)
    const g = new THREE.Group(); g.name = 'skyline';
    const band = new THREE.Mesh(new THREE.CylinderGeometry(500, 500, 260, 32, 1, true), new THREE.MeshBasicMaterial({ color: 0x2c3432, side: DS, fog: false })); band.position.y = 120; g.add(band);
    const pb = b, pu = UL, px = XF; b = new Builder(); UL = new Map(); XF = null;
    seed = 5;
    for (let i = 0; i < 20; i++) { const a = -0.9 + 1.8 * rnd() + H, d = 120 + 260 * rnd(), w = 14 + 20 * rnd(), h = 20 + 70 * rnd(); box(w, h, w, 0x2a2e36, Math.cos(a) * d, 0, Math.sin(a) * d); }
    bb(30, 28, 260, 160, 32, 268, 0x3a3e44);
    g.add(flush()); b = pb; UL = pu; XF = px;
    const nop = () => {};
    g.userData = { lit: nop, swing: nop, rain: nop, crowd: nop, sky: nop, flash: nop, bridgeLights: nop, update: nop, level: 0.35 };
    return g;
  }
  function build() {
    COL.length = 0; T = textures(); defaults(); mats();
    const root = new THREE.Group(); root.name = 'hq_top_root'; R.root = root;
    b = new Builder(); UL = new Map(); XF = null;
    buildShell(); buildFurniture();
    const st = flush(); st.name = 'hq_top_static'; root.add(st); R.static = st;
    const P = (g) => (root.add(g), g);
    root.add(marker('desk', -9.55, 0.74, -16.0), marker('filing_cabinets', -6.05, 0, -20.42), marker('planter', -1.8, 0, -21.4), marker('sofa', 7.0, 0, -20.8));
    for (const c of R.fcol) COL.push(c);

    // ---- the light strips (lights: level / flicker drive STRIPM)
    R.lights = P(part('lights', () => {
      const strip = (x0, x1, z) => {
        bb(x0 - 0.05, 5.16, z - 0.12, x1 + 0.05, 5.2, z + 0.12, 0x0b0d10, M.glow);
        quad(x1 - x0, 0.14, M.strip, (x0 + x1) / 2, 5.155, z, 0, H, STRIPC);
      };
      strip(-11, 11, -14.0); strip(-11, -2.65, -17.2); strip(-1.35, 1.35, -17.2); strip(2.65, 11, -17.2); strip(-11, 11, -20.4);
    }));
    R.lights.userData = {
      level(k) { sync(); R.lvl = Math.max(0, +k || 0); },
      flicker(sec = 1.2) { sync(); R.flT = skipping() ? 0 : Math.max(0, +sec || 0); },
    };

    // ---- glass_ui: the SafeSense pop-up + the clock (one canvas, two quads)
    R.ui = P(part('glass_ui', () => {
      rquad(3.2, 1.8, M.ui, [0, 0, 256, 144], -3.0, 2.15, -11.245, PI);
      rquad(2.4, 0.6, M.ui, [0, 160, 256, 224], -3.0, 3.55, -11.245, PI);
    }));
    R.ui.traverse((o) => { if (o.isMesh) o.renderOrder = 4; });
    R.ui.userData = {
      popup(mode, o) {
        sync();
        R.popup = T.pop[mode] || mode === 'footage' ? mode : 'yes_only';
        if (o && 'sched' in o) R.sched = !!o.sched;
        if (R.popup === 'footage') R.footF = -1;
        paintPopup();
      },
      sched(on) { sync(); R.sched = !!on; paintPopup(); },
      cursor(u, v) { sync(); if (u == null) R.cu = -1; else { R.cu = clamp01(+u || 0); R.cv = clamp01(+v || 0); } R.uiDirty = true; },
      hold(k) { sync(); const kk = clamp01(+k || 0); if (Math.abs(kk - R.hold) >= 1 / 64 || (kk >= 1) !== (R.hold >= 1) || (kk === 0 && R.hold !== 0)) { R.hold = kk; R.uiDirty = true; } },
      clock(o = {}) {
        sync();
        const C = R.clk;
        C.on = true; C.t = (o.h ?? 11) * 3600 + (o.m ?? 0) * 60 + (o.s ?? 0); C.sec = !!o.sec; C.paused = !!o.paused;
        if (o.quiet == null) C.q = -1;
        else if (typeof o.quiet === 'number') C.q = o.quiet;
        else { const p = String(o.quiet).split(':'); C.q = (+p[0] || 0) * 3600 + (+p[1] || 0) * 60 + (+p[2] || 0); }
        paintClock();
      },
      clockRun(rate = 1) { sync(); R.clkRate = Math.max(0, +rate || 0); },
      clockOff() { sync(); R.clk.on = false; R.clkRate = 0; paintClock(); },
      glow(k) { sync(); R.uiGlow = Math.max(0, +k || 0); UIM.color.setScalar(R.uiGlow); },
      get time() { return R.clk.t; },
    };

    // ---- glass_rain: two scrolling layers on the inner face of the glass
    R.rainGlass = P(part('glass_rain', () => {
      tquad(24, 5.06, M.rainA, 0, 2.59, -11.212, PI, 0, [2.0, 4.0]);
      tquad(24, 5.06, M.rainB, 0, 2.59, -11.216, PI, 0, [1.6, 1.6], 0xffffff, 0.37, 0.11);
    }));
    R.rainGlass.traverse((o) => { if (o.isMesh) o.renderOrder = 3; });
    R.rainGlass.userData = { boost(k = 1) { sync(); R.boost = Math.max(0, +k || 0); } };

    // ---- the console: black gloss slab on a recessed plinth, the tilted screen, the USB-C port on its east end
    R.con = P(part('console', () => {
      bb(-1.05, 0, -0.25, 1.05, 0.13, 0.25, MULL);
      bb(-1.2, 0.13, -0.4, 1.2, 0.95, 0.4, GLOSS);
      bb(-1.2, 0.946, -0.405, 1.2, 0.953, -0.393, GLOSSHI); bb(-1.2, 0.946, 0.393, 1.2, 0.953, 0.405, GLOSSHI);
      bb(-1.205, 0.946, -0.4, -1.193, 0.953, 0.4, GLOSSHI); bb(1.193, 0.946, -0.4, 1.205, 0.953, 0.4, GLOSSHI);
      for (const [x, z] of [[-1.2, -0.4], [1.2, -0.4], [-1.2, 0.4], [1.2, 0.4]]) bb(x - 0.006, 0.13, z - 0.006, x + 0.006, 0.95, z + 0.006, 0x262c36);   // a gloss glint on each corner
      const sh = new THREE.Shape(); sh.moveTo(-0.304, 0.95); sh.lineTo(0.3, 0.95); sh.lineTo(0.3, 1.112); sh.closePath();   // the screen's wedge
      const wg = new THREE.ExtrudeGeometry(sh, { depth: 1.66, bevelEnabled: false }); wg.rotateY(-H); wg.translate(0.83, 0, 0); put(wg, 0x111317);
      quad(1.6, 0.6, M.con, 0, 1.0303, -0.02, PI, -1.309);                                               // tilted 15° toward Luka (north)
      bb(1.2, 0.792, -0.008, 1.203, 0.808, 0.008, 0x020203, M.glow);                                     // the slot
      labH(4, 0, 0.06, 0.015, 1.2035, 0.768, 0, H);
    }, [0, 0, -15.4]));
    R.portRing = new THREE.Mesh(new THREE.TorusGeometry(0.014, 0.0022, 4, 16).rotateY(H), PORTM); R.portRing.name = 'console_port'; R.portRing.position.set(1.2025, 0.8, 0); R.con.add(R.portRing);
    R.con.userData = {
      screen(mode, arg) {
        sync();
        const md = mode || 'idle', a = md === 'hack' || md === 'stall' ? Math.round(+arg || 0) : md === 'restart' ? (+arg || 0) | 0 : arg ?? '';
        if (md === R.conMode && a === R.conArg) return;
        R.conMode = md; R.conArg = a; paintConsole();
      },
      port(on = true) { sync(); R.port = !!on; PORTM.color.setHex(R.port ? 0xbfe6ff : 0x2a3038); },
    };

    // ---- luka_phone: the 2026 phone (one object, re-parented by state) + the two cables
    R.phone = P(new THREE.Group()); R.phone.name = 'luka_phone';
    R.phObj = part('luka_phone_body', () => {
      bb(-0.0325, -0.065, -0.004, 0.0325, 0.065, 0.004, 0x1a1c20);
      quad(0.058, 0.12, M.ph, 0, 0, 0.0042);
      bb(-0.006, -0.072, -0.0025, 0.006, -0.065, 0.0025, 0xd8dade);                                     // the plug in its port
    }, null, 0, { floor: false });
    R.phDock = part('luka_phone_cable', () => {
      seg3(1.022, 0.957, -15.45, 1.19, 0.957, -15.43, 0.005, CABLE); seg3(1.19, 0.957, -15.43, 1.232, 0.93, -15.41, 0.005, CABLE);
      seg3(1.232, 0.93, -15.41, 1.232, 0.80, -15.4, 0.005, CABLE); bb(1.203, 0.795, -15.405, 1.232, 0.805, -15.395, 0xd8dade);
    }, null, 0, { floor: false });
    R.phone.add(R.phObj, R.phDock);
    R.phPivot = new THREE.Group(); R.phPivot.position.set(1.232, 0.80, -15.4); R.phone.add(R.phPivot);
    R.phHang = part('luka_phone_hang', () => {
      bb(-0.029, -0.005, -0.005, 0, 0.005, 0.005, 0xd8dade); seg3(0, 0, 0, 0.004, -0.3, 0, 0.005, CABLE);
    }, null, 0, { floor: false });
    R.phPivot.add(R.phHang);
    R.phone.userData = {
      state(s) { sync(); R.phState = s === 'docked' || s === 'dangling' || s === 'pulled' ? s : 'hidden'; if (R.phState === 'dangling') { R.phSwing = skipping() ? 0 : 1; R.phSwingT = 0; } applyPhone(); paintPhone(); },
      screen(mode, pct) { sync(); const p = Math.round(+pct || 0); if (mode === R.phMode && p === Math.round(R.phPct)) return; R.phMode = mode || 'hack'; R.phPct = p; paintPhone(); },
      swing(k = 1) { sync(); R.phSwing = skipping() ? 0 : +k || 0; R.phSwingT = 0; },
    };

    // ---- photo_frame: face down on the desk (the back up); 'up' flips it (the photo); 'held' hides it
    R.photo = P(part('photo_frame', () => {
      bb(-0.125, -0.01, -0.1, 0.125, 0.01, 0.1, 0x141414);
      rquad(0.23, 0.18, M.photoBack, [0, 0, 64, 64], 0, 0.0105, 0, 0, -H, 0xffffff, 64, 64);
      rquad(0.21, 0.16, M.photo, [0, 0, 64, 48], 0, -0.0105, 0, 0, H, 0xffffff, 64, 48);
    }, [-9.55, 0.75, -15.0], 0, { floor: false }));
    R.photo.userData = { state(s) { sync(); R.photoMode = s === 'up' || s === 'held' ? s : 'down'; applyPhoto(); } };

    // ---- the empty chair (swivel; never sat in): base static, the seat spins (userData.spin rad/s, decays)
    R.chair = P(part('empty_chair', () => {
      for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; boxR(0.32, 0.03, 0.04, 0x1c1e22, Math.sin(a) * 0.16, 0.07, Math.cos(a) * 0.16, 0, a + H, 0); cyl(0.025, 0.025, 0.03, 6, 0x0e0f11, Math.sin(a) * 0.31, 0.03, Math.cos(a) * 0.31); }
      cyl(0.03, 0.035, 0.3, 8, 0x5a6068, 0, 0.24, 0);
    }, [-8.5, 0, -13.6], -0.3));
    R.seat = part('empty_chair_seat', () => {
      bb(-0.25, 0.4, -0.24, 0.25, 0.48, 0.24, CHAIR); bb(-0.24, 0.47, -0.22, 0.24, 0.5, 0.22, 0x383c43);
      boxR(0.46, 0.58, 0.06, CHAIR, 0, 0.82, -0.25, -0.12, 0, 0); boxR(0.42, 0.5, 0.02, 0x383c43, 0, 0.82, -0.215, -0.12, 0, 0);
      for (const sx of [-1, 1]) { bb(sx * 0.27 - 0.02, 0.48, -0.05, sx * 0.27 + 0.02, 0.66, -0.01, 0x1c1e22); bb(sx * 0.27 - 0.03, 0.66, -0.16, sx * 0.27 + 0.03, 0.69, 0.12, 0x1c1e22); }
    }, null, 0);
    R.chair.add(R.seat);
    R.chair.userData = { get spin() { return R.chairSpin; }, set spin(v) { R.chairSpin = +v || 0; } };

    // ---- the maintenance hatch: an inner ceiling panel hinged on its east edge + the fold-down ladder (plane z -13.32)
    R.mh = P(new THREE.Group()); R.mh.name = 'maint_hatch';
    R.mhLid = new THREE.Group(); R.mhLid.position.set(8.45, 5.2, -12.9); R.mh.add(R.mhLid);
    R.mhLid.add(part('maint_hatch_lid', () => {
      bb(-0.9, -0.03, -0.45, 0, 0, 0.45, 0x2a2e34);
      lab(3, 0.7, 0.088, -0.45, -0.031, 0.0, 0, H);
    }, null, 0, { floor: false }));
    R.ladder = part('maint_ladder', () => {
      for (const x of [-0.25, 0.25]) bb(x - 0.02, -4.2, -0.02, x + 0.02, 0, 0.02, 0x8a929c);
      for (let k = 0; k < 15; k++) { const y = -4.2 + k * 0.3; cyl(0.014, 0.014, 0.5, 6, 0xa8b0b8, 0, y, 0, 0, H); }
      bb(-0.27, -4.21, -0.03, 0.27, -4.17, 0.03, 0x3a3e44);
    }, [8.0, 5.2, -13.32], 0, { floor: false });
    R.mh.add(R.ladder);
    R.mh.userData = {
      open(u = 1) { sync(); R.mhTo = clamp01(+u); if (skipping()) R.mhU = R.mhTo; },
      ladder(u = 1) { sync(); R.ldTo = clamp01(+u); if (skipping()) R.ldU = R.ldTo; },
    };

    // ---- drone hatches: 8 leaves (instanced) + 4 red lamps inside
    const leafGeo = geoOf(() => { bb(0, -0.03, -0.5, 0.5, 0, 0.5, 0x2a2e34); bb(0.05, -0.032, -0.42, 0.45, -0.03, -0.38, 0x8a7a40); });
    R.leaves = dynIM(leafGeo, M.vc, 8, 'drone_hatch_leaves');
    R.hlamps = dynIM(new THREE.BoxGeometry(0.16, 0.05, 0.16), LAMPM, 4, 'drone_hatch_lamps');
    R.dh = P(new THREE.Group()); R.dh.name = 'drone_hatches'; R.dh.add(R.leaves, R.hlamps);
    R.dh.userData = { open(i, u = 1) { sync(); i |= 0; if (i < 0 || i > 3) return; R.dhTo[i] = clamp01(+u); if (skipping()) R.dhU[i] = R.dhTo[i]; R.dhDirty = true; } };
    // ---- window drone ports: 2 × 6 iris blades (instanced)
    const bladeGeo = geoOf(() => {
      const s = new THREE.Shape(); s.moveTo(0, 0); for (let k = 0; k <= 6; k++) { const a = -PI / 6 + k / 6 * PI / 3; s.lineTo(Math.cos(a) * 0.48, Math.sin(a) * 0.48); } s.closePath();
      const g = new THREE.ExtrudeGeometry(s, { depth: 0.02, bevelEnabled: false }); g.translate(0, 0, -0.01); put(g, 0x3a4048);
    });
    R.blades = dynIM(bladeGeo, M.vc, 12, 'drone_port_blades');
    R.dp = P(new THREE.Group()); R.dp.name = 'drone_ports'; R.dp.add(R.blades);
    R.dp.userData = { open(i, u = 1) { sync(); i |= 0; if (i < 0 || i > 1) return; R.dpTo[i] = clamp01(+u); if (skipping()) R.dpU[i] = R.dpTo[i]; R.dpDirty = true; } };
    // ---- vents: 14 grilles (instanced)
    const grilleGeo = geoOf(() => {
      cyl(0.335, 0.335, 0.008, 18, 0x4a5058, 0, 0.004, 0);
      for (let k = -4; k <= 4; k++) { const z = k * 0.07, l = 2 * Math.sqrt(Math.max(0, 0.32 * 0.32 - z * z)); if (l > 0.05) bb(-l / 2, 0.008, z - 0.012, l / 2, 0.014, z + 0.012, 0x6a7078); }
      cyl(0.06, 0.06, 0.016, 10, 0x2a2e34, 0, 0.008, 0);
    });
    R.vents = P(dynIM(grilleGeo, M.vc, NV, 'vents'));
    R.vents.userData = {
      open(i, k) {
        sync();
        if (k === undefined) { const kk = clamp01(+i); for (let j = 0; j < NV; j++) R.vTo[j] = kk; }
        else { i |= 0; if (i >= 0 && i < NV) R.vTo[i] = clamp01(+k); }
        if (skipping()) for (let j = 0; j < NV; j++) R.vU[j] = R.vTo[j];
        R.vDirty = true;
      },
    };

    // ---- foam: 3 quilted blobs (dynamic colliders) + 10 burst fragments (instanced)
    R.foam = P(new THREE.Group()); R.foam.name = 'foam'; R.foams = [];
    for (let i = 0; i < 3; i++) {
      const f = part('foam_' + i, () => {
        const pts = [[0.001, 0], [0.56, 0.02], [0.61, 0.24], [0.55, 0.48], [0.6, 0.72], [0.52, 0.96], [0.38, 1.14], [0.18, 1.24], [0.001, 1.26]].map(([r, y]) => new THREE.Vector2(r, y));
        const g = new THREE.LatheGeometry(pts, 12); put(g, 0xffffff, M.quilt);
        for (let k = 0; k < 5; k++) { const a = k / 5 * TAU + i; sph(0.3, 0xf6f0e2, Math.sin(a) * 0.42, 0.32 + (k % 2) * 0.42, Math.cos(a) * 0.42, 1, 1.15, 1, M.quilt, 8, 6); }
      }, null, 0, { floor: false });
      f.visible = false; R.foam.add(f); R.foams.push(f);
    }
    const fragGeo = geoOf(() => { const g = new THREE.IcosahedronGeometry(0.13, 0); put(g, 0xf6f0e2, M.quilt); });
    R.frags = dynIM(fragGeo, M.quilt, 10, 'foam_fragments'); R.foam.add(R.frags);
    R.foam.userData = {
      bloom(i, x, z, dur = 1.2) { sync(); const F = R.fm[i | 0]; if (!F) return; F.st = 'grow'; F.x = +x || 0; F.z = +z || 0; F.t = 0; F.dur = Math.max(0.05, +dur || 1.2); if (skipping()) F.st = 'up'; },
      soften(k = 0.3) { sync(); R.softTo = clamp01(+k); if (skipping()) R.soft = R.softTo; },
      harden() { sync(); R.softTo = 0; if (skipping()) R.soft = 0; },
      burst(i) {
        sync(); const F = R.fm[i | 0]; if (!F) return;
        F.st = 'none';
        if (skipping()) return;
        const fr = R.frag; fr.on = true; fr.t = 0; fr.x = F.x; fr.z = F.z;
        if (typeof world !== 'undefined' && world.puff && isCur()) world.puff([F.x, 0.8, F.z], { n: 18, color: 0xf2ecdc, speed: 1.6, life: 1.0, gravity: 1.5 });
      },
      sag(i, dur = 2.5) { sync(); const F = R.fm[i | 0]; if (!F || F.st === 'none') return; F.st = 'sag'; F.t = 0; F.dur = Math.max(0.05, +dur || 2.5); if (skipping()) F.st = 'none'; },
      clear() { sync(); for (const F of R.fm) F.st = 'none'; R.frag.on = false; },
    };

    // ---- galaxy (24 inside) and fireflies (14 outside): the shared instanced pod (shell IM + light IM, per-instance colour)
    R.gal = DRONE_INSTANCED.make(NG, { state: 'patrol' }); R.gal.group.name = 'galaxy'; R.gal.body.name = 'galaxy_shells'; R.gal.light.name = 'galaxy_lights'; P(R.gal.group);
    R.gal.group.userData = galaxyApi();
    R.ffs = DRONE_INSTANCED.make(NF, { state: 'patrol' }); R.ffs.group.name = 'fireflies'; R.ffs.body.name = 'firefly_shells'; R.ffs.light.name = 'firefly_lights'; P(R.ffs.group);
    R.ffs.group.userData = {
      color(name) { sync(); R.ff.col = DL[name] ?? (typeof name === 'number' ? name : DL.blue); R.F.cDirty = true; },
      scatter() { sync(); if (R.ff.scatter < 0) R.ff.scatter = skipping() ? 6 : 0; },
      count(n) { sync(); R.ff.n = Math.max(0, Math.min(NF, n | 0)); },
    };

    // ---- the aide drone (P, 2.5): one courtesy model + a blob shadow on the floor
    R.aideObj = P(buildDrone('courtesy')); R.aideObj.name = 'aide_drone';
    R.aideBlob = P(blobShadow()); R.aideBlob.name = 'aide_drone_blob'; R.aideBlob.scale.setScalar(0.55);
    const AU = R.aideObj.userData;
    AU.fly = (from, to, dur = 3.5) => {
      sync(); const A = R.aide;
      if (from != null && where(from, W4)) { A.ax = W4[0]; A.ay = W4[1]; A.az = W4[2]; A.ry0 = isNaN(W4[3]) ? A.ry1 : W4[3]; }
      else { A.ax = A.cx ?? A.bx; A.ay = A.cy ?? A.by; A.az = A.cz ?? A.bz; A.ry0 = A.cry ?? A.ry1; }
      if (!where(to, W4b)) return;
      A.bx = W4b[0]; A.by = W4b[1]; A.bz = W4b[2]; A.ry1 = isNaN(W4b[3]) ? Math.atan2(A.bx - A.ax, A.bz - A.az) : W4b[3];
      A.t = 0; A.dur = Math.max(0.05, +dur || 3.5); A.vis = true; R.aideObj.visible = true;
      if (skipping()) A.t = A.dur;
    };
    AU.talk = (on = true) => { sync(); R.aide.talk = !!on; if (!on) { R.aide.lit = 'patrol'; AU.setLight('patrol'); } };
    AU.place = (w) => { sync(); placeAide(w); R.aide.vis = true; R.aideObj.visible = true; };

    // ---- slicks: 4 shiny floor streaks (additive, faded per instance)
    const slGeo = new THREE.PlaneGeometry(1.6, 0.5).rotateX(-H);
    R.slicks = P(dynIM(slGeo, SLM, 4, 'slicks'));
    for (let i = 0; i < 4; i++) R.slicks.setColorAt(i, tc.setRGB(0, 0, 0));
    R.slicks.userData = { show(i, x, z, ry, dur = 6) { sync(); slickShow(i, x, z, ry, dur); }, clear() { sync(); for (const s of R.sl) s.on = false; } };

    // ---- lift doors (static), the wall crack, the badge, the facade glow
    R.lift = P(part('lift_doors', () => {
      bb(11.93, 0, -21.62, 12.0, 2.42, -21.5, CAB); bb(11.93, 0, -19.9, 12.0, 2.42, -19.78, CAB); bb(11.93, 2.3, -21.62, 12.0, 2.42, -19.78, CAB);
      bb(11.965, 0, -21.5, 11.99, 2.3, -20.71, 0x1a1d22); bb(11.965, 0, -20.69, 11.99, 2.3, -19.9, 0x1a1d22); bb(11.97, 0, -20.71, 11.985, 2.3, -20.69, 0x08090b);
      bb(11.95, 2.47, -21.36, 11.995, 2.63, -20.04, 0x15181d);
      lab(0, 1.26, 0.14, 11.947, 2.55, -20.7, -H);
      bb(11.97, 1.1, -21.88, 11.995, 1.32, -21.72, 0x23272e); quad(0.08, 0.04, M.glow, 11.968, 1.28, -21.8, -H, 0, 0xff3b30);   // the reader (red)
    }));
    R.crackObj = P(part('wall_crack', () => { quad(1.4, 1.6, M.crack, 2.8, 1.1, -23.172); }));
    R.badgeObj = P(part('luka_badge', () => {
      bb(-0.03, 0, -0.045, 0.03, 0.004, 0.045, 0xeef0f2);
      seg3(0, 0.002, -0.045, -0.06, 0.003, -0.2, 0.012, 0x6a8ab8); seg3(-0.06, 0.003, -0.2, -0.2, 0.003, -0.26, 0.012, 0x6a8ab8);
      seg3(0.02, 0.002, -0.05, 0.12, 0.003, -0.16, 0.012, 0x6a8ab8); bb(-0.008, 0.001, -0.06, 0.008, 0.006, -0.045, 0x9aa0a8);
    }, null, 0, { floor: false }));
    R.badgeObj.userData = {
      place(w, ry) { sync(); if (!where(w, W4)) return; const B = R.badge; B.x = W4[0]; B.y = Math.max(0.006, W4[1]); B.z = W4[2]; B.ry = ry ?? (isNaN(W4[3]) ? B.ry : W4[3]); B.vis = true; applyBadge(); },
    };
    R.fglow = P(part('facade_glow', () => {
      quad(28, 6, FGM, 0, -3.0, -10.86, PI);
      const g = new THREE.PlaneGeometry(28, 3.9), uv = g.attributes.uv;   // the haze: brightest at the facade, fading south
      for (let i = 0; i < uv.count; i++) uv.setY(i, 1 - uv.getY(i));
      g.rotateX(-H); g.translate(0, -5.8, -8.95); put(g, 0x5a5a5a, FGM);
    }));
    R.fglow.traverse((o) => { if (o.isMesh) { o.renderOrder = 2; o.userData.noOcclude = true; } });
    R.fglow.userData = { zero(dur = 2) { sync(); R.fgTo = 1; R.fgDur = Math.max(0.01, +dur || 2); if (skipping()) R.fg = 1; }, off() { sync(); R.fg = R.fgTo = 0; } };

    // ---- rain (outside the glass only), the city, the floor
    R.rain = P(makeRain({ box: [-14, -10.8, 14, -4.0], top: 6, bottom: -8, count: 1800 }));
    const V = SETS.valley;
    try { R.sky3 = V && typeof V.skyline === 'function' ? V.skyline({ skip: ['TOWER'], sky: R.sky.mode, neon: 0.35 }) : fallbackSky(); }
    catch (e) { console.warn('TWO: hq_top: skyline failed, using the fallback', e); R.sky3 = fallbackSky(); }
    R.sky3.position.set(0, -125.5, 0); root.add(R.sky3);
    R.mirror = null;
    const HF = SETS.hq_floors;
    if (HF && typeof HF.makeMirror === 'function') {
      try { R.mirror = HF.makeMirror(24.2, 12.2, { key: 'hq_top', res: 256, tint: 0xd0d8d8, reflect: 0.62, map: T.floor, tile: 2.4, name: 'mirror', bakedOpacity: 0.82 }); }
      catch (e) { console.warn('TWO: hq_top: makeMirror failed, baked floor only', e); R.mirror = null; }
    }
    if (!R.mirror) {
      const g = new THREE.PlaneGeometry(24.2, 12.2), uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 24.2 / 2.4, uv.getY(i) * 12.2 / 2.4);
      R.mirror = new THREE.Mesh(g, matTex(T.floor, { transparent: true, opacity: 0.82 })); R.mirror.rotation.x = -H; R.mirror.name = 'mirror'; R.mirror.userData.noOcclude = true;
    }
    R.mirror.position.set(0, 0.002, -17.2); root.add(R.mirror);
    R.baked = bakedCopy([R.static, R.con, R.chair, R.lift, R.photo, R.lights]); root.add(R.baked);
    b = null; UL = null;
    if (!R.onStop && typeof on === 'function') { R.onStop = true; on('flow:stop', () => { R.scene = null; R.lampScene = null; }); }
    applyAll();
    return root;
  }

  // ---------------------------------------------------------- apply (state -> objects; also after a rebuild)
  function applyAll() {
    if (!R.root) return;
    paintPopup(); paintClock(); paintConsole(); paintPhone();
    UIM.color.setScalar(R.uiGlow); PORTM.color.setHex(R.port ? 0xbfe6ff : 0x2a3038);
    applyPhone(); applyPhoto(); applyBadge();
    R.crackObj.visible = R.crack;
    R.gal.group.visible = R.G.visible !== false;
    R.dhDirty = R.dpDirty = R.vDirty = true; R.G.cDirty = true; R.F.cDirty = true;
    R.aideObj.visible = R.aide.vis;
    hatchTick(0); galaxyTick(0, R.t || 0); fireflyTick(0, R.t || 0); aideTick(0, R.t || 0); foamTick(0, R.t || 0); slickTick(0);
    const u = R.sky3 && R.sky3.userData, S = R.sky;
    if (u && u.sky) { u.sky(S.mode); u.lit(S.lit, 0); u.swing(S.swing); u.crowd(S.crowd); u.bridgeLights(S.bridge); u.rain(S.rain); }
    applyMode();
    mirrorTint(0);
  }
  function applyPhone() {
    const st = R.phState, o = R.phObj;
    R.phone.visible = st !== 'hidden';
    R.phDock.visible = st === 'docked';
    R.phHang.visible = st === 'dangling' || st === 'pulled';
    if (st === 'docked') { R.phone.add(o); o.position.set(0.955, 0.958, -15.45); o.rotation.set(-H, H, 0, 'YXZ'); o.visible = true; }
    else if (st === 'dangling') { R.phPivot.add(o); o.position.set(0.004, -0.37, 0); o.rotation.set(0, H, PI, 'YXZ'); o.visible = true; }
    else o.visible = false;
  }
  function applyPhoto() {
    const md = R.photoMode || 'down';
    R.photo.visible = md !== 'held';
    R.photo.rotation.set(md === 'up' ? PI : 0, 0, 0);
  }
  function applyBadge() { const B = R.badge; R.badgeObj.visible = !!B.vis; R.badgeObj.position.set(B.x, B.y, B.z); R.badgeObj.rotation.set(0, B.ry, 0); }
  function galaxyApi() {
    const G = () => R.G;
    return {
      mode(name) {
        sync(); const g = G();
        if (name === 'idle') { for (let i = 0; i < NG; i++) { g.sx[i] = g.px[i]; g.sy[i] = g.py[i]; g.sz[i] = g.pz[i]; } g.mode = 'idle'; g.blend = skipping() ? 1 : 0; }
        else if (name === 'hang') g.mode = 'hang';
      },
      watch(x, y, z, dur = 1.2) {
        sync(); const g = G();
        if (Array.isArray(x)) { dur = y ?? dur; z = x[2]; y = x[1]; x = x[0]; }
        else if (typeof x === 'string') { const a = typeof world !== 'undefined' ? world.actor(x) : null; dur = y ?? dur; if (!a) return; z = a.pos.z; y = a.pos.y + 1.5; x = a.pos.x; }
        g.wx = +x; g.wy = +y; g.wz = +z;
        for (let i = 0; i < NG; i++) { g.sx[i] = g.px[i]; g.sy[i] = g.py[i]; g.sz[i] = g.pz[i]; g.syaw[i] = g.yaw[i]; }
        g.mode = 'watch'; g.t = 0; g.dur = Math.max(0.01, +dur || 1.2); if (skipping()) g.t = g.dur;
      },
      color(name, dur = 0.6) {
        sync(); const g = G(), hex = DL[name] ?? (typeof name === 'number' ? name : DL.blue);
        tc.setHex(hex);
        for (let i = 0; i < NG; i++) { const k = g.cDur > 0 ? smooth(g.cT / g.cDur) : 1; for (let j = 0; j < 3; j++) { const n = i * 3 + j; g.cf[n] = g.cf[n] + (g.ct[n] - g.cf[n]) * k; } g.ct[i * 3] = tc.r; g.ct[i * 3 + 1] = tc.g; g.ct[i * 3 + 2] = tc.b; }
        g.shF.lerp(g.shT, g.cDur > 0 ? smooth(g.cT / g.cDur) : 1); g.shT.setHex(name === 'yellow' || name === 'yes' ? SHELL_Y : SHELL);
        g.cT = 0; g.cDur = skipping() ? 0 : Math.max(0, +dur || 0); g.cDirty = true;
        if (g.cDur <= 0) { g.cf.set(g.ct); g.shF.copy(g.shT); g.cT = 1; }
      },
      hang() { sync(); G().mode = 'hang'; },
      seed(arr, n) {
        sync(); const g = G(), m = Math.min(NG, n ?? Math.floor((arr ? arr.length : 0) / 3));
        for (let i = 0; i < m; i++) { g.px[i] = arr[i * 3]; g.py[i] = arr[i * 3 + 1]; g.pz[i] = arr[i * 3 + 2]; }
        g.mode = 'hang';
      },
      ring(cx = -3.0, cz = -13.8, r = 2.3, y = 1.9, dur = 3.0) {
        sync(); ringSlots(cx, cz, r, y);
        flyStart(Math.max(0.1, dur - 0.6), 'ringhold', (i) => ((i * 7) % NG) / NG * 0.6);
      },
      part(angle, width = 0.9) {
        sync(); const g = G();
        for (let i = 0; i < NG; i++) {
          const d = angTo(angle, g.ang[i]);
          if (Math.abs(d) < width / 2) {
            const a = g.ang[i] + (d >= 0 ? 0.6 : -0.6), up = i >= 14, rr2 = Math.hypot(g.tx[i] - g.cx, Math.min(-11.55, g.tz[i]) - g.cz) || 2.3;
            g.ang[i] = a; g.tx[i] = g.cx + Math.sin(a) * rr2; g.tz[i] = Math.min(-11.55, g.cz + Math.cos(a) * rr2); g.tyaw[i] = a + PI; void up;
          }
        }
        flyStart(1.2, 'ringhold', () => 0);
      },
      land(dur = 4) {
        sync(); const g = G(), per = 1.2, st = Math.max(0.02, (dur - per) / NG);
        for (let i = 0; i < NG; i++) { const a = g.ang[i] || i / NG * TAU; g.tx[i] = g.cx + Math.sin(a) * 2.9; g.ty[i] = 0.12; g.tz[i] = Math.min(-11.6, g.cz + Math.cos(a) * 2.9); g.tyaw[i] = a + PI; }
        flyStart(per, 'landed', (i) => i * st);
        for (let i = 0; i < NG * 3; i++) { g.cf[i] = g.ct[i]; g.ct[i] = g.ct[i] * 0.4; }
        g.cT = 0; g.cDur = skipping() ? 0 : dur; g.cDirty = true; if (g.cDur <= 0) { g.cf.set(g.ct); g.cT = 1; }
      },
      pos(i, out) { const g = G(); out = out || [0, 0, 0]; out[0] = g.px[i]; out[1] = g.py[i]; out[2] = g.pz[i]; return out; },
    };
  }

  // ---------------------------------------------------------- ticks (no allocation)
  function hatchTick(dt) {
    const k = dt > 0 ? dt : 1e6;
    // maintenance hatch lid + ladder
    R.mhU += Math.max(-k / 0.8, Math.min(k / 0.8, R.mhTo - R.mhU));
    R.ldU += Math.max(-k / 1.4, Math.min(k / 1.4, R.ldTo - R.ldU));
    R.mhLid.rotation.z = smooth(R.mhU) * H * 0.98;
    const lu = smooth(R.ldU);
    R.ladder.visible = R.ldU > 0.001 && R.mhU > 0.3; R.ladder.scale.y = 0.19 + 0.81 * lu;
    // drone hatches
    let dirty = R.dhDirty; R.dhDirty = false;
    for (let i = 0; i < 4; i++) { const d = R.dhTo[i] - R.dhU[i]; if (d !== 0) { R.dhU[i] += Math.max(-k / 0.6, Math.min(k / 0.6, d)); dirty = true; } }
    if (dirty) {
      for (let i = 0; i < 4; i++) {
        const cx = HATCH[i][0], cz = HATCH[i][1], u = smooth(R.dhU[i]), th = u * H * 0.92;
        ev.set(0, 0, -th); qv.setFromEuler(ev); m4.compose(pv.set(cx - 0.5, 5.2, cz), qv, sv.set(1, 1, 1)); R.leaves.setMatrixAt(i * 2, m4);
        ev.set(0, PI, th); qv.setFromEuler(ev); m4.compose(pv.set(cx + 0.5, 5.2, cz), qv, sv.set(1, 1, 1)); R.leaves.setMatrixAt(i * 2 + 1, m4);
        if (R.dhU[i] > 0.05) { m4.makeTranslation(cx, 5.52, cz); R.hlamps.setMatrixAt(i, m4); } else R.hlamps.setMatrixAt(i, ZERO);
      }
      R.leaves.instanceMatrix.needsUpdate = true; R.hlamps.instanceMatrix.needsUpdate = true;
    }
    // ports (iris)
    dirty = R.dpDirty; R.dpDirty = false;
    for (let i = 0; i < 2; i++) { const d = R.dpTo[i] - R.dpU[i]; if (d !== 0) { R.dpU[i] += Math.max(-k / 0.5, Math.min(k / 0.5, d)); dirty = true; } }
    if (dirty) {
      for (let i = 0; i < 2; i++) {
        const u = smooth(R.dpU[i]);
        for (let j = 0; j < 6; j++) {
          const a = j / 6 * TAU + u * 0.5;
          m4.makeRotationZ(a); m5.makeTranslation(u * 0.36, 0, 0); m4.multiply(m5); m5.makeScale(1 - 0.82 * u, 1 - 0.82 * u, 1); m4.multiply(m5);
          m5.makeTranslation(PORT[i][0], PORT[i][1], -11.2); m5.multiply(m4); R.blades.setMatrixAt(i * 6 + j, m5);
        }
      }
      R.blades.instanceMatrix.needsUpdate = true;
    }
    // vents (grille shrinks into its hub: the dark ring shows)
    dirty = R.vDirty; R.vDirty = false;
    for (let i = 0; i < NV; i++) { const d = R.vTo[i] - R.vU[i]; if (d !== 0) { R.vU[i] += Math.max(-k / 0.7, Math.min(k / 0.7, d)); dirty = true; } }
    if (dirty) {
      for (let i = 0; i < NV; i++) { const u = smooth(R.vU[i]), s = 1 - 0.78 * u; m4.makeScale(s, 1, s).setPosition(VENTS[i][0], 0.0135 - 0.004 * u, VENTS[i][1]); R.vents.setMatrixAt(i, m4); }
      R.vents.instanceMatrix.needsUpdate = true;
    }
  }
  function foamTick(dt, t) {
    R.soft += Math.max(-dt * 1.5, Math.min(dt * 1.5, R.softTo - R.soft));
    if (dt <= 0) R.soft = R.softTo;
    for (let i = 0; i < 3; i++) {
      const F = R.fm[i], o = R.foams[i], col = R.fcol[i];
      let k = 0;
      if (F.st === 'grow') { F.t += dt; k = smooth(F.t / F.dur); if (F.t >= F.dur) F.st = 'up'; }
      else if (F.st === 'up') k = 1;
      else if (F.st === 'sag') { F.t += dt; k = 1 - F.t / F.dur; if (k <= 0) { F.st = 'none'; k = 0; } }
      F.k = k;
      if (F.st === 'none') { o.visible = false; col[0] = col[1] = col[2] = col[3] = 1e4; continue; }
      o.visible = true;
      const w = R.soft * 0.05 * Math.sin(t * 6.5 + i * 2), sh = 1 - 0.06 * R.soft;
      if (F.st === 'sag') { const kk = Math.max(0.04, k); o.scale.set((1 + 0.4 * (1 - k)) * sh, kk * sh, (1 + 0.4 * (1 - k)) * sh); }
      else o.scale.set((0.3 + 0.7 * k) * (sh + w), (0.05 + 0.95 * k) * (sh - w), (0.3 + 0.7 * k) * (sh + w));
      o.position.set(F.x, 0, F.z);
      if (k > 0.3) { col[0] = F.x - 0.5; col[1] = F.z - 0.5; col[2] = F.x + 0.5; col[3] = F.z + 0.5; } else col[0] = col[1] = col[2] = col[3] = 1e4;
    }
    const fr = R.frag;
    if (fr.on) {
      fr.t += dt;
      for (let i = 0; i < 10; i++) {
        const a = i / 10 * TAU + 0.3, sp = 1.6 + (i % 3) * 0.6, vy = 2.4 + (i % 4) * 0.5, tt = Math.min(fr.t, 1.4);
        let y = 0.7 + vy * tt - 3.2 * tt * tt; const land = y < 0.08; if (land) y = 0.08;
        const fade = fr.t > 2.4 ? Math.max(0, 1 - (fr.t - 2.4) / 1.6) : 1;
        const s = (0.7 + (i % 2) * 0.4) * fade;
        m4.makeRotationY(a * 3 + tt * 4).scale(sv.set(s, s * 0.8, s)).setPosition(fr.x + Math.sin(a) * sp * tt, y, fr.z + Math.cos(a) * sp * tt);
        R.frags.setMatrixAt(i, m4);
      }
      if (fr.t > 4) fr.on = false;
      R.frags.instanceMatrix.needsUpdate = true; R.fragShown = true;
    }
    if (!fr.on && R.fragShown !== false) { for (let i = 0; i < 10; i++) R.frags.setMatrixAt(i, ZERO); R.frags.instanceMatrix.needsUpdate = true; R.fragShown = false; }
  }
  function galaxyTick(dt, t) {
    const G = R.G, gal = R.gal;
    if (!gal) return;
    G.visible = gal.group.visible;   // content may show / hide it directly (.visible)
    if (!G.visible) return;
    G.t += dt;
    const bob = G.mode === 'idle' ? 0.08 : G.mode === 'landed' ? 0 : 0.03;
    let flying = false;
    for (let i = 0; i < NG; i++) {
      let x = G.px[i], y = G.py[i], z = G.pz[i], yaw = G.yaw[i];
      if (G.mode === 'idle') {
        const a = G.ph[i] + G.w[i] * t, sg = G.w[i] < 0 ? -1 : 1;
        x = Math.cos(a) * G.r[i]; z = -17.2 + Math.sin(a) * G.r[i] * 0.48; y = G.y[i];
        yaw = Math.atan2(-Math.sin(a) * sg, Math.cos(a) * 0.48 * sg);
        if (G.blend < 1) { const u = smooth(G.blend); x = G.sx[i] + (x - G.sx[i]) * u; y = G.sy[i] + (y - G.sy[i]) * u; z = G.sz[i] + (z - G.sz[i]) * u; }
        G.px[i] = x; G.py[i] = y; G.pz[i] = z; G.yaw[i] = yaw;
      } else if (G.mode === 'watch') {
        const u = smooth(G.t / G.dur), want = Math.atan2(G.wx - x, G.wz - z);
        yaw = G.syaw[i] + angTo(G.syaw[i], want) * u; G.yaw[i] = yaw;
      } else if (G.mode === 'fly') {
        const u = smooth((G.t - G.dl[i]) / G.fl);
        if (u < 1) flying = true;
        x = G.sx[i] + (G.tx[i] - G.sx[i]) * u; y = G.sy[i] + (G.ty[i] - G.sy[i]) * u; z = G.sz[i] + (G.tz[i] - G.sz[i]) * u;
        const mv = u > 0 && u < 1;
        yaw = mv ? G.syaw[i] + angTo(G.syaw[i], G.tyaw[i]) * u : u >= 1 ? G.tyaw[i] : G.syaw[i];
        G.px[i] = x; G.py[i] = y; G.pz[i] = z; G.yaw[i] = yaw;
      } else if (G.mode === 'ringhold' || G.mode === 'landed') { x = G.tx[i]; y = G.ty[i]; z = G.tz[i]; yaw = G.tyaw[i]; G.px[i] = x; G.py[i] = y; G.pz[i] = z; G.yaw[i] = yaw; }
      const by = bob ? bob * Math.sin(t * 0.9 + G.bp[i]) : 0;
      gal.set(i, x, y + by, z, yaw, 1);
    }
    if (G.mode === 'idle' && G.blend < 1) G.blend = Math.min(1, G.blend + dt / 2);
    if (G.mode === 'fly' && !flying) G.mode = G.after;
    // colours (lights per instance; the shell tint shared)
    if (G.cDur > 0 && G.cT < G.cDur) { G.cT = Math.min(G.cDur, G.cT + dt); G.cDirty = true; }
    if (G.cDirty) {
      const k = G.cDur > 0 ? smooth(G.cT / G.cDur) : 1;
      tc2.copy(G.shF).lerp(G.shT, k);
      for (let i = 0; i < NG; i++) {
        const n = i * 3;
        tc.setRGB(G.cf[n] + (G.ct[n] - G.cf[n]) * k, G.cf[n + 1] + (G.ct[n + 1] - G.cf[n + 1]) * k, G.cf[n + 2] + (G.ct[n + 2] - G.cf[n + 2]) * k);
        gal.light.setColorAt(i, tc); gal.body.setColorAt(i, tc2);
      }
      G.cDirty = G.cDur > 0 && G.cT < G.cDur;
      gal.light.instanceColor.needsUpdate = true; gal.body.instanceColor.needsUpdate = true;
    }
    gal.body.instanceMatrix.needsUpdate = gal.light.instanceMatrix.needsUpdate = true;
  }
  function fireflyTick(dt, t) {
    const F = R.F, ff = R.ffs, S = R.ff;
    if (!ff) return;
    if (S.scatter >= 0) S.scatter += dt;
    const sc = S.scatter >= 0 ? S.scatter : 0, out = sc > 0 ? smooth(sc / 6) : 0;
    for (let i = 0; i < NF; i++) {
      if (i >= S.n || out >= 1) { ff.body.setMatrixAt(i, ZERO); ff.light.setMatrixAt(i, ZERO); continue; }
      const x = F.hx[i] + F.ax[i] * Math.sin(t * F.fx[i] + F.ph[i]) + (F.hx[i] > 0 ? 1 : -1) * out * 6;
      const y = F.hy[i] + F.ay[i] * Math.sin(t * F.fy[i] * 1.3 + F.ph[i] * 2) - out * (8 + i % 4 * 2);
      const z = F.hz[i] + 0.3 * Math.sin(t * F.fy[i] + F.ph[i]) + out * 9;
      ff.set(i, x, y, z, PI + 0.4 * Math.sin(t * 0.3 + F.ph[i]), 1);
    }
    if (F.cDirty) {
      F.cDirty = false; tc.setHex(S.col);
      for (let i = 0; i < NF; i++) ff.light.setColorAt(i, tc);
      ff.light.instanceColor.needsUpdate = true;
    }
    ff.body.instanceMatrix.needsUpdate = ff.light.instanceMatrix.needsUpdate = true;
  }
  function aideTick(dt, t) {
    const A = R.aide, o = R.aideObj;
    if (!o) return;
    A.vis = o.visible; R.aideBlob.visible = o.visible;   // content may hide it directly (.visible = false)
    if (!A.vis) return;
    if (A.t < A.dur) A.t = Math.min(A.dur, A.t + dt);
    const u = smooth(A.t / A.dur), mv = A.t < A.dur;
    const x = A.ax + (A.bx - A.ax) * u, y = A.ay + (A.by - A.ay) * u + 0.04 * Math.sin(t * 2.1), z = A.az + (A.bz - A.az) * u;
    let yaw;
    if (mv) { const tr = Math.atan2(A.bx - A.ax, A.bz - A.az); yaw = u < 0.75 ? A.ry0 + angTo(A.ry0, tr) * Math.min(1, u * 4) : tr + angTo(tr, A.ry1) * smooth((u - 0.75) / 0.25); }
    else yaw = A.ry1;
    A.cx = x; A.cy = y; A.cz = z; A.cry = yaw;
    o.position.set(x, y, z); o.rotation.set(0, yaw, mv ? -0.22 * Math.sin(PI * u) : 0, 'YXZ');
    R.aideBlob.position.set(x, 0.012, z);
    if (A.talk) {
      A.talkT += dt;
      const want = (A.talkT % 0.24) < 0.12 ? 'white' : 'patrol';
      if (want !== A.lit) { A.lit = want; o.userData.setLight(want); }
    }
  }
  function slickTick(dt) {
    const im = R.slicks; let any = false;
    for (let i = 0; i < 4; i++) {
      const s = R.sl[i];
      if (!s.on) { im.setMatrixAt(i, ZERO); continue; }
      s.t += dt; any = true;
      const k = s.t < 0.3 ? s.t / 0.3 : s.t > s.dur - 0.6 ? Math.max(0, (s.dur - s.t) / 0.6) : 1;
      if (s.t >= s.dur) s.on = false;
      m4.makeRotationY(s.ry).setPosition(s.x, 0.008, s.z); im.setMatrixAt(i, m4);
      im.setColorAt(i, tc.setRGB(0.55 * k, 0.75 * k, 0.95 * k));
    }
    if (!any && !R.slWas && dt > 0) return;   // nothing showing (and nothing to clear): no upload
    R.slWas = any;
    im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true;
  }
  const FL = (() => { const a = new Uint8Array(64); let s = 9; for (let i = 0; i < 64; i++) { s = (s * 16807) % 2147483647; a[i] = s / 2147483647 < 0.55 ? 1 : 0; } return a; })();
  function lightsTick(dt, t) {
    let lv = R.lvl;
    if (R.flT > 0) { R.flT -= dt; if (!FL[((t * 15) | 0) & 63]) lv *= 0.08; }
    STRIPM.color.setRGB(0.62 * lv, 0.66 * lv, 0.72 * lv);
  }
  function rainTick(dt) {
    const amt = R.rain && R.rain.uniforms ? R.rain.uniforms.uAmount.value : 0;
    R.rainK = amt;
    const wet = amt > 0.02 && (DRESS[R.state].rainSky || R.lit);   // the city's own rain follows the env (none in storm_dry)
    if (wet !== R.sky.rain) { R.sky.rain = wet; if (R.sky3 && R.sky3.userData.rain) R.sky3.userData.rain(wet); }
    const op = Math.min(0.85, 0.42 * amt * R.boost);
    RAINAM.opacity = op; RAINBM.opacity = op * 0.9;
    R.rainGlass.visible = op > 0.005;
    if (op > 0.005) { T.rainA.offset.y += dt * 0.11 * (0.6 + 0.4 * R.boost); T.rainB.offset.y += dt * 0.017; if (T.rainA.offset.y > 1) T.rainA.offset.y -= 1; if (T.rainB.offset.y > 1) T.rainB.offset.y -= 1; }
  }
  function uiTick(dt, t) {
    const C = R.clk;
    if (C.on && !C.paused && R.clkRate > 0) {
      C.t += dt * R.clkRate; if (C.q >= 0) C.q = Math.max(0, C.q - dt * R.clkRate);
      const st = C.sec ? Math.floor(C.t) : Math.floor(C.t / 60), sq = C.q >= 0 ? Math.ceil(C.q) : -1;
      if (st !== C.shownT || sq !== C.shownQ) paintClock();
    } else if (C.paused !== C.shownP) paintClock();
    if (R.popup === 'footage') { const f = Math.floor(t * 4) % 3; if (f !== R.footF) { R.footF = f; R.uiDirty = true; } }
    if (R.uiDirty && t - R.uiT >= 1 / 30) paintPopup();
    // console idle pulse; port ring
    if (R.conMode === 'idle') CONM.color.setScalar(0.72 + 0.2 * Math.sin(t * 0.8)); else CONM.color.setScalar(1);
    // the dangling phone swings (decaying), the chair coasts
    if (R.phState === 'dangling' || R.phState === 'pulled') {
      R.phSwingT += dt;
      const a = R.phSwing * 0.15 * Math.exp(-R.phSwingT / 2.2) * Math.sin(R.phSwingT * 5.4);
      R.phPivot.rotation.x = a;
    } else R.phPivot.rotation.x = 0;
    if (R.chairSpin) { R.chairYaw += R.chairSpin * dt; R.chairSpin *= Math.exp(-dt * 0.9); if (Math.abs(R.chairSpin) < 0.01) R.chairSpin = 0; R.seat.rotation.y = R.chairYaw; }
  }
  function glowTick(dt) {
    if (R.fg !== R.fgTo) R.fg += Math.max(-dt / R.fgDur, Math.min(dt / R.fgDur, R.fgTo - R.fg));
    if (dt <= 0) R.fg = R.fgTo;
    R.fglow.visible = R.fg > 0.002;
    FGM.color.setScalar(R.fg * 0.85);
    // lightning on the glass (a 0.12 s lift; Reduce Flashing: a 1.5 s swell to 40%)
    const L = R.ln;
    let k = 0;
    if (L.glass >= 0) {
      L.glass += dt; const u = L.glass / L.dur;
      k = L.dur > 1 ? 0.4 * L.k * Math.sin(Math.min(1, u) * PI) : L.k * (u < 1 ? 1 - u * 0.6 : 0);
      if (u >= 1) L.glass = -1;
    }
    GLASSM.color.setHex(0x223040).lerp(tc.setHex(0xe8f0ff), k * 0.85); GLASSM.opacity = 0.22 + 0.45 * k;
    WASHM.color.setScalar((WASH_K[R.env] ?? 1) * (1 + 1.5 * k));   // the end walls' window light follows the sky
  }
  const WASH_K = { midday: 1, cutaway: 1.25, storm_dry: 0.9, storm: 0.9, boss: 1, storm_flash: 2.2, strike: 0.6, yellow: 0.9, lit: 1.1 };
  const THO = { vol: 0.6 };
  function lightning(dt) {
    const L = R.ln;
    if (L.thunder >= 0) { L.thunder -= dt; if (L.thunder < 0 && !skipping() && typeof sfx === 'function') { THO.vol = 0.45 + 0.35 * Math.random(); sfx('thunder', THO); } }
    if (!STORMY[R.state] || R.lit || SETVIEW() || skipping()) return;
    L.next -= dt;
    if (L.next <= 0) { L.next = 12 + 13 * Math.random(); flash(0.7 + 0.3 * Math.random()); L.thunder = 1.2 + 1.8 * Math.random(); }
  }

  // ---------------------------------------------------------- update (no allocation)
  function update(dt, ctx) {
    if (!R.root) return;
    const t = ctx.t; R.t = t;
    if (SETVIEW()) { if (ctx.env !== R.env) { R.env = ctx.env; svDress(R.env); } }
    else {
      sync();
      if (ctx.env !== R.env) { R.env = ctx.env; if (R.env === 'lit' && R.state === 's36' && !R.lit) lightUp(2); }
    }
    if (isCur()) {
      holdLamp(); applyAmbience(false); lightning(dt);
      if ((R.modeT -= dt) <= 0) { R.modeT = 1; if (autoMode() !== R.mode) applyMode(); }
      if (!R.checked && R.mode === 'live' && ++R.frames > 4) {
        R.checked = true;
        const mm = SETS.hq_floors && SETS.hq_floors.makeMirror;
        if (mm && mm.failed && typeof renderer !== 'undefined' && mm.failed(renderer)) { R.forced = 'baked'; applyMode(); }
      }
    }
    rainTick(dt); uiTick(dt, t); hatchTick(dt); foamTick(dt, t);
    galaxyTick(dt, t); fireflyTick(dt, t); aideTick(dt, t); slickTick(dt); lightsTick(dt, t); glowTick(dt);
    if (R.sky3 && R.sky3.userData.update) R.sky3.userData.update(dt, t);
    mirrorTint(dt);
  }

  // ---------------------------------------------------------- data
  const marks = {
    // P and 2.5
    mgr_glass: [-9.6, 0, -12.0, 0], p_mgr_desk: [-10.5, 0, -15.0, H], p_drone_in: [-2.0, 3.8, -21.0, 2.6], p_drone_shoulder: [-10.25, 1.75, -12.35, 0.3],
    s25_mgr: [-3.0, 0, -12.9, 0], s25_drone: [-1.9, 2.0, -13.3, -2.4],
    // 3.3
    s33_ladder_top: [8.0, 4.4, -13.05, PI], s33_ladder_foot: [8.0, 1.0, -13.05, PI], s33_drop_luka: [8.0, 0, -12.9, -H], s33_drop_chase: [8.9, 0, -12.15, -1.4],
    s33_drop_c40: [8.7, 0, -14.1, -1.75], mgr_turn: [-9.6, 0, -12.0, 1.62], s33_c40_mid: [6.4, 0, -17.6, -1.62], s33_luka_mid: [4.0, 0, -13.8, -1.65],
    s33_chase_mid: [5.2, 0, -13.0, -1.45], s33_l40_glass: [-4.0, 0, -11.95, 0], s33_l40_turn: [-4.0, 0, -11.95, 1.68], console_luka: [0.0, 0, -16.2, 0],
    // 3.4
    boss_chase: [-3.0, 0, -18.6, 2.6], boss_c40: [3.0, 0, -18.6, -2.6], boss_l40: [-4.0, 0, -11.95, 0.4],
    // 3.5
    s35_chase: [-8.0, 0, -17.0, 1.2], s35_c40: [4.0, 0, -17.0, -1.2], s35_l40_by_chase: [-7.1, 0, -15.9, -2.5], s35_l40_by_c40: [3.0, 0, -15.9, 2.4],
    s35_l40_by_luka: [-1.6, 0, -16.4, 1.45], desk_l40: [-10.5, 0, -15.0, H], s35_l40_end: [-3.0, 0, -13.8, 2.25], s35_luka_wall: [2.8, 0, -22.7, 0],
    s35_badge: [3.35, 0.012, -22.25, 0.4], s35_luka_up: [2.8, 0, -22.45, -0.59],
    // 3.6
    s36_chase_l40: [-3.55, 0, -14.55, 0.64], s36_c40: [4.0, 0, -17.0, -1.27], s36_l40_glass: [-3.0, 0, -12.15, 0], s36_chase_side: [-4.25, 0, -12.9, 0.35],
    s36_luka_console: [0.0, 0, -16.2, 0], ring_centre: [-3.0, 0, -13.8, 0],
  };
  Object.assign(MK, marks);
  return {
    env: {
      midday:      { bg: 0x3b3346, fog: [0x2c2836, 0.0022], hemi: [0x9a96b4, 0x16141c, 1.6], dir: [0xd0c8e0, 1.4, [8, 40, 60]], rain: 0 },
      cutaway:     { bg: 0x5c6270, fog: [0x666a74, 0.0022], hemi: [0xbcc0cc, 0x24262a, 2.0], dir: [0xfff0d8, 2.0, [-12, 60, 40]], rain: 0 },
      storm_dry:   { bg: 0x2c3432, fog: [0x283030, 0.0026], hemi: [0x7c8e86, 0x121614, 1.6], dir: [0xb8ccc4, 1.15, [0, 30, 60]], rain: 0 },
      storm:       { bg: 0x2c3432, fog: [0x283030, 0.0026], hemi: [0x7c8e86, 0x121614, 1.6], dir: [0xb8ccc4, 1.15, [0, 30, 60]], rain: 0.7 },
      boss:        { bg: 0x2c3432, fog: [0x283030, 0.0026], hemi: [0x8fa29a, 0x161a18, 2.0], dir: [0xc0d4cc, 1.4, [0, 30, 60]], rain: 0.85 },
      storm_flash: { bg: 0x8a9496, fog: [0x606a6a, 0.0026], hemi: [0xe8f0ff, 0x404850, 4.0], dir: [0xffffff, 5.5, [0, 30, 60]], rain: 0.85 },
      strike:      { bg: 0x262a2a, fog: [0x202424, 0.0040], hemi: [0x6a7270, 0x101212, 1.3], dir: [0x98a4a0, 0.8, [0, 30, 60]], rain: 0.85 },
      yellow:      { bg: 0x2c3030, fog: [0x2a2c28, 0.0030], hemi: [0xb8aa80, 0x1c1810, 1.85], dir: [0xc8c0a8, 1.15, [0, 30, 60]], rain: 0.9 },
      lit:         { bg: 0x3a3048, fog: [0x30283a, 0.0018], hemi: [0xd8b8a0, 0x24182a, 2.2], dir: [0xffd8b0, 1.4, [0, 30, 60]], rain: 1.0 },
    },
    build, dress: (st) => { sync(); dress(st); }, lamp, flash: (k) => { sync(); flash(k); }, reflect, lightUp: (dur) => { sync(); lightUp(dur); },
    marks,
    anchors: {
      glass_popup:        { at: [-3.0, 2.15, -11.24], from: [-3.0, 2.15, -14.7], fov: 40 },      // the whole panel inside the letterbox (P's lens)
      glass_popup_ecu:    { at: [-3.04, 1.915, -11.24], from: [-3.04, 1.935, -12.95], fov: 31 },  // [YES] + the slot, no title sliver (P's lens)
      glass_moon:         { at: [-3.8, 2.81, -11.24], from: [-3.78, 2.78, -12.55], fov: 30 },
      glass_clock:        { at: [-3.0, 3.55, -11.24], from: [-3.0, 3.2, -12.7], fov: 30 },
      p_desk_track_a:     { at: [-9.55, 0.76, -15.0], from: [-9.55, 0.86, -17.5], fov: 38 },
      p_desk_track_b:     { at: [-9.55, 0.745, -15.0], from: [-9.55, 0.84, -15.75], fov: 34 },
      photo_frame:        { at: [-9.55, 0.76, -15.0], from: [-9.0, 1.25, -15.65], fov: 34 },
      far_corner:         { at: [-9.0, 1.0, -12.4], from: [11.4, 4.75, -22.7], fov: 50 },
      p_back_head:        { at: [-9.6, 1.7, -12.0], from: [-9.85, 1.85, -13.6], fov: 34 },
      p_shoulder_chair:   { at: [-8.6, 1.05, -13.0], from: [-11.2, 1.75, -14.6], fov: 44 },
      s25_wide:           { at: [-3.0, 1.9, -11.3], from: [-3.0, 2.5, -19.0], fov: 46 },
      s33_ladder:         { at: [8.0, 2.6, -13.1], from: [5.4, 1.4, -15.6], fov: 50 },
      s33_from_behind:    { at: [-9.6, 1.4, -12.0], from: [11.0, 1.9, -13.6], fov: 34 },
      s33_badge:          { at: [-9.6, 1.25, -12.0], from: [-9.0, 1.3, -12.05], fov: 30 },
      s33_two_lukas:      { at: [-0.8, 1.45, -12.5], from: [0.2, 2.0, -22.4], fov: 52 },
      s33_glass_talk:     { at: [-4.0, 1.6, -11.95], from: [-1.6, 1.7, -14.6], fov: 40 },
      console:            { at: [0.4, 0.9, -15.4], from: [2.6, 1.5, -17.2], fov: 40 },
      usb_port:           { at: [1.21, 0.80, -15.4], from: [1.75, 0.92, -15.3], fov: 24 },
      console_screen:     { at: [0.0, 1.02, -15.42], from: [0.8, 1.62, -16.4], fov: 36 },
      s33_thumbs:         { at: [0.25, 1.05, -16.0], from: [0.55, 1.75, -16.45], fov: 36 },
      s33_red:            { at: [0.0, 2.2, -16.4], from: [-11.4, 4.6, -22.6], fov: 58 },
      s35_foam_wide:      { at: [-1.0, 0.9, -16.6], from: [-1.0, 4.4, -22.4], fov: 66 },
      s35_phone:          { at: [1.0, 0.98, -15.45], from: [1.4, 1.35, -16.4], fov: 30 },
      s35_locked_low:     { at: [-1.5, 1.0, -16.0], from: [9.6, 0.45, -18.6], fov: 52 },
      desk_photo_turn:    { at: [-9.9, 1.15, -15.1], from: [-7.0, 1.6, -14.0], fov: 40 },
      s35_strike_wide:    { at: [1.2, 1.2, -19.2], from: [9.6, 1.7, -15.2], fov: 58 },
      s35_wall_low:       { at: [2.4, 0.5, -21.4], from: [-5.6, 0.35, -14.6], fov: 48 },
      s35_cracked_phone:  { at: [1.24, 0.43, -15.4], from: [2.0, 0.6, -15.9], fov: 30 },
      s35_lukas_two:      { at: [-0.1, 1.2, -18.15], from: [7.2, 1.5, -13.0], fov: 60 },
      s35_luka_low:       { at: [2.8, 1.6, -22.4], from: [2.0, 0.35, -20.6], fov: 50 },
      s35_ring_wide:      { at: [-3.0, 1.8, -13.8], from: [3.6, 3.2, -20.8], fov: 54 },
      s36_ring_wide:      { at: [-3.0, 1.6, -12.8], from: [-3.0, 2.4, -21.4], fov: 50 },
      s36_valley:         { at: [0.0, -120.0, 62.0], from: [1.2, 2.4, -11.7], fov: 55 },
      s36_mall_fallback:  { at: [0.0, -125.5, 60.0], from: [-6.0, -98.0, 34.0], fov: 50 },
      hatch_cw:           { at: [-2.0, 5.0, -17.6], from: [-0.2, 1.6, -14.8], fov: 44 },
      ports:              { at: [0.0, 3.8, -11.2], from: [0.0, 2.2, -19.0], fov: 62 },
    },
    cams: {
      far_corner: { type: 'fixed', pos: [11.4, 4.75, -22.7], look: [-9.0, 1.0, -12.4], fov: 50 },
      boss:       { type: 'rail', from: [-8.5, 4.8, -22.6], to: [8.5, 4.8, -22.6], look: 'player', base: [0.0, 1.0, -14.6], limit: 0.6, fov: 60 },
      hold_no:    { type: 'fixed', pos: [-4.2, 2.05, -14.8], look: [-2.6, 2.0, -11.25], fov: 44 },
    },
    zones: [
      { box: [-12.0, -23.2, -4.0, -11.2], cam: 'boss' },
      { box: [-4.0, -23.2, 4.0, -11.2], cam: 'boss' },
      { box: [4.0, -23.2, 12.0, -11.2], cam: 'boss' },
    ],
    colliders: COL,
    spawns: {
      hatch_w:  { at: [-7.5, 5.0, -19.0], exit: [-7.5, 3.2, -18.4], side: -1 },
      hatch_cw: { at: [-2.0, 5.0, -17.6], exit: [-2.0, 3.0, -17.2], side: 0 },
      hatch_ce: { at: [2.0, 5.0, -17.6], exit: [2.0, 3.0, -17.2], side: 0 },
      hatch_e:  { at: [7.5, 5.0, -19.0], exit: [7.5, 3.2, -18.4], side: 1 },
      port_w:   { at: [-7.5, 3.8, -10.4], exit: [-7.5, 3.4, -12.4], side: -1 },
      port_e:   { at: [7.5, 3.8, -10.4], exit: [7.5, 3.4, -12.4], side: 1 },
    },
    vents: VENTS.map((v) => v.slice()),
    bossCam: { rail: { z: -22.6, y: 4.8, x0: -8.5, x1: 8.5 }, console: [0.0, 1.0, -15.4], mix: 0.5, offset: 3.2, sideEase: 1.2, lookLag: 1.0, lag: 1.5, fov: 60, fovNarrow: 66,
      sides: { hatch_w: -1, port_w: -1, hatch_cw: 0, hatch_ce: 0, hatch_e: 1, port_e: 1 } },
    ar: [
      { id: 'ar_optout', at: [-3.0, 4.4, -11.4], text: 'OPT-OUT · ALL USERS · 11:58', kind: 'sign', w: 3.0 },
      { id: 'ar_console', at: [0.0, 1.8, -15.4], text: 'MASTER CONSOLE · wireless (mostly)', kind: 'sign', w: 2.2 },
      { id: 'ar_vents', at: [0.0, 0.3, -17.0], text: 'SAFE MODE · FOAM READY', kind: 'sign', w: 1.8 },
      { id: 'ar_lift', at: [11.9, 2.4, -20.7], text: 'PRIVATE · L30 · ROOF', kind: 'sign', w: 1.6 },
    ],
    AUTO,
    props: ['glass_ui', 'glass_rain', 'console', 'luka_phone', 'desk', 'photo_frame', 'empty_chair', 'filing_cabinets', 'planter', 'sofa', 'maint_hatch',
      'drone_hatches', 'drone_ports', 'vents', 'foam', 'galaxy', 'fireflies', 'aide_drone', 'slicks', 'lights', 'lift_doors', 'wall_crack', 'luka_badge',
      'facade_glow', 'rain', 'skyline', 'mirror'],
    get ambience() { return AMB[ambKey()]; },
    get state() { return R.state; },
    update,
  };
})();
