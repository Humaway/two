// ============================================================ SET: hq_atrium — Optus Tower ground-floor atrium, Ann Street (3.1)
// Scene 3.1 "Mandatory Fun" (Mon 24 Dec 2040, 10:00): the CRANE up the outside of the tower, the atrium party, the
// lanyard desk, Blend In (the Fun Monitor's patrol), Secret Santa, Nadia, the service lift. Spec: docs/sets/hq_atrium.md
// (the contract: every name and coordinate there is what content codes against).
//
// LAYOUT — the Valley Grid (VG, docs/sets/valley.md): metres, Y up, +X east, +Z south; Ann Street's centreline z = 0.
// Facing ry: 0 = +Z (south, toward the glass / Ann St), PI = −Z (north, the tree and the countdown), H = +X, −H = −X.
// Boxes and colliders are [x0, z0, x1, z1].
//   Atrium interior x −17.6…17.6, z −40.6…−11.4, floor y 0 (mirror-bright stone), coffered soffit y 13.5. The south
//   facade is glass (inner z −11.4, outer −11.0; mullions every 2 m, transoms 4.5 / 9.0) with the entrance doors
//   x −2…2 (two leaves slide to x ±4). Mezzanines W x −17.6…−13.6 and E x 13.6…17.6 (L1 slab y 4.3–4.5, L2 8.8–9.0,
//   glass balustrades with padded rails at x ±13.6; not walkable; six onlookers). The north wall is the white feature
//   wall with the service lift door (x −5.8…−4.2) and its reader (−3.55, 1.2, −40.55); the goods car behind it
//   x −6.1…−3.9, z −43…−40.8, y 0…2.5.
//   Entrance (south centre): speed gates z −15.6…−14.4 (open). West: the cracker table (x −12.45…−11.55, z −22…−19),
//   the choir risers under the SafeSense meter (x −15.4…−12, z −31…−25; dial (−13.75, 3.6, −28)), the Quiet Corner
//   (x −17.6…−13.2, z −16.4…−11.4). Centre: four foam-wrapped columns (±9, −19) (±9, −31), six pendant stars, the
//   MANDATORY FUN banner strung between the L2 balustrades (x −13.4…13.4, y 9.7…11.3 sagging 0.25, z −22.5). East: the
//   morning-tea table + urn (x 11…14, z −16.45…−15.55; urn (13.6, −16)), the lanyard desk (x 13…13.8, z −28.2…−25.8;
//   the acrylic LANYARD REQUESTS sign stands on its north end), four staff lifts on x 17.6 (z −33.5, −30.5, −23.5,
//   −20.5). North: the bubble-wrapped tree (−5, −34; base r 3.6, 13 m, padded star 12.4–13.2), the Secret Santa table
//   (centre (3.5, −33.6), 3.2 × 1.0, 20 parcels), the behind-tree passage z −40.6…−37.6; on the wall the LED countdown
//   (x 1…13, y 5.6…9.6) with Yes (Are you sure?) above it (x 4…10, y 10.3…12.55).
//   Outside (built here, matching the valley's 2.8 street): the forecourt and canopy (x −8…8, z −11…−8, y 5.0–5.4), Ann
//   St x −120…120 (road y −0.10, raised zebras E x −2…2 / W x −32…−28, kerb bollards every 2 m both sides, lamps at
//   x −56…56 every 16 m both sides (the N pair at ±8 moved to ±11.2, clear of the canopy), the mall-head bollard row z 11.6, the mall's paving to z 110, four hover-cars), the
//   podium's stone faces (glass band 4.5–9.0); above y 13.5 SETS.valley.tower({ podium: 'none' }) and around it
//   SETS.valley.skyline({ skip: ['TOWER', 'TRAFFIC'], sky: 'midday_storm' }) (fallback: a plain box tower with its own
//   countdown + Yes, and a horizon band; never throws). Walkable outside: the forecourt x −10…10, z −11…−7.2 and zebra E.
//   The floor is a 0.8-opaque polished stone over a mirrored (y → −y) copy of the interior's static meshes (walls,
//   mezzanines, columns, the tree, tables, desk, lifts, the countdown; not the figures or actors): no reflection pass,
//   geometry (hq_floors' baked mode).
//
// ENV (first = default): atrium (party; spot = the tree lamp) · storm_ext (the crane; spot off) · lift (inside the car).
// DRESS: dress('party31' | 'crane31' | 'lift31'); AUTO when 3.1 (re)starts: party31 + reset() (gifts, crackers, goggles,
//   pies back, doors shut, reader red, countdowns 01:58:00 running), applied on the set's first tick in the scene or just
//   before content's first dress / lamp / reset call, whichever comes first (so content's own first dress wins). crane31 brightens the interior seen through
//   the glass and pauses the interior's ambient animation; lift31 lights the car (lamp follows the env: lift -> car).
//   With no scene (?setview) the dress follows the env. SETS.hq_atrium.reset() is the same reset content can call.
// LAMP (the one spot): lamp('tree' | 'car' | 'off'); re-asserted every tick while lit (world.torchAuto = false).
// MARKS: s31_ext_luka/_chase/_c40 s31_door_luka/_chase/_c40 door_drone s31_in_luka/_chase/_c40 s31_cp · desk_chase
//   desk_woman · hr hr_meet santa_pick c40_tags gift_priya/_tom/_wen/_gaz/_nadia give_priya/_tom/_wen/_gaz/_nadia
//   s31_c40_nadia s31_chase_nadia · bi_cracker bi_hum bi_pie bi_merry_1/_2/_3 kettle · quiet_beanbag quiet_drone ·
//   s31_lift_luka s31_lift_chase s31_lift_c40 lift_luka lift_chase lift_c40 fun_home.
// ANCHORS: s31_crane_a/_b/_c s31_wide s31_track_a/_b door_drone s31_invite s31_inside lanyard_sign s31_desk_two banner
//   countdown_wall yes_unsure choir choir_meter crackers mince_pies urn santa_table gift_tags s31_hr tree tree_star
//   s31_nadia_mid s31_nadia_close s31_luka_close s31_lanyard quiet_corner quiet_poster s31_behind_tree lift_reader
//   s31_lift_doors lift_inside lift_speaker lift_panel facade_countdown yes_sign.
// CAMS (fixed, high, 27–36° down so the Fun Monitor's beam reads): at_entry (default) at_west at_choir at_centre at_east
//   at_tree at_svc at_quiet lift_in ext_door. ZONES (first match wins) tile the floor, the forecourt and zebra E.
// PROPS (world.prop(name).userData; every call is allocation-free, instant while skipping, and survives a rebuild):
//   tree_wrapped {star (the padded star; .turn rad/s)} · tree_bulbs · banner_fun · countdown_wall {set(h, m, s), run(rate),
//   zero(dur), ctl} · yes_unsure {lit(b)} · choir_meter {level(db | null)} · choir {hush(b)} · crowd_staff {nod(i),
//   look(i, where | null), pos(i, out)} · staff_shadows · cracker_table {pull(i), goggles(i, on), reset()} · santa_table
//   {take(i), put(i), left(), slot(i, out), reset()} · gift_parcel (a hidden loose parcel for a hand) · invite (Luke's
//   invitation card, hidden: {hold(who, on = true, hand = 'R'), home()}; home it before the set goes) · tea_table {pie(i),
//   steam(), reset()} · tea_urn · lanyard_desk · staff_lifts · quiet_corner · entrance_doors {open(u)} · speed_gates ·
//   svc_lift {open(u)} · svc_reader {set('red'|'green'), beep()} · lift_car {light(on), speaker(k), panel(floor)} ·
//   columns · corner_foam · mezz · pendant_stars · canopy · ext_street · ext_bollards · ext_lamps · ext_traffic {stop(b)}
//   · tower (+ facade_countdown, yes_sign, tower_drones) · skyline · floor_mirror.
// DATA: paths { fun_loop, traffic_east, traffic_west, to_lift, to_santa, to_desk, to_choir, to_crackers, to_tea },
//   gifts [{ i, row, at, tag }] (+ gifts.byName), ar (signs + name badges + gift tags; also ar_signs / ar_names /
//   ar_tags), hotspots (spec §8 positions).
// AMBIENCE (03-audio loops): party31 atrium_air + crowd_polite + clink, room atrium · crane31 wind_high + drone_swarm +
//   thunder_far, room none · the lift (env lift) lift_hum with the crowd ducked, room small.
// Draw calls: interior static ≈ 9 meshes, the mirror ≈ 30, parts 1–3 each, every repeat instanced; tower ≈ 6, skyline
//   ≈ 16 (setshots: max 139 from any cam or anchor, s31_crane_a).
// DEVIATIONS from docs/sets/hq_atrium.md (all for the picture):
//   · the banner hangs between the L2 balustrades (y 9.7…11.3, x ±13.4): at the spec's 5.9…7.5 it cut across at_choir,
//     at_west, at_east and hid the far-wall countdown from every view from the south; anchor `banner` re-aimed.
//   · Yes (Are you sure?) sits above the countdown (x 4…10, y 10.3…12.55): at x −13.4…−7.4 the tree's top hid one half
//     and the (−9, −31) column the other from every viewpoint in the south half; anchor `yes_unsure` follows it.
//   · the acrylic LANYARD REQUESTS sign stands on the desk's north end (Chase at desk_chase stood in front of the
//     desk's −X face); anchor `lanyard_sign` follows it.
//   · anchors re-aimed: s31_wide (from x −2.6 so the tree and columns hide neither sign), door_drone (over the three
//     heads), s31_invite (side-on), s31_nadia_mid (side-on: the spec lens was over Nadia's back).
//   · sky 'midday_storm' (10:00) instead of 'storm' (night); lamps / bollards follow the valley's street (both
//     footpaths) rather than the spec's lamp list; env hemi/dir intensities raised (three's physical lights), the spot
//     lamps × gain (tree 40, car 6); a 'lift' preset hemi of 3.0 so the quilts read.
SETS.hq_atrium = (() => {
  const ID = 'hq_atrium', PI = Math.PI, H = PI / 2, TAU = PI * 2, DS = THREE.DoubleSide;
  // palette (spec §3.1)
  const WHITE = 0xf2f4f6, SHAD = 0xd8dce2, STONE = 0xe8eaee, STEEL = 0xb8bec6, STEELD = 0x7a8088, FOAM = 0xefe6d0, SEAM = 0xd8ccb0,
    SS = 0xbfe6ff, SSD = 0x4a8ab8, XRED = 0xd8323a, SILVER = 0xc8ccd4, QUILT = 0x5a6068, MULL = 0x4a525c, NAVY = 0x141d3a,
    CARPET = 0x7a8494, ANTLER = 0x6a4a32, CLOTH = 0xf6f7f8, SKIN = 0xd8a888;
  const ONE = [1, 1, 1];
  const skipping = () => typeof flow !== 'undefined' && !!flow && !!flow.skipping;
  const reduceFx = () => typeof options !== 'undefined' && !!options && !!options.reduceFlashing;
  const smooth = (u) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const clamp01 = (u) => (u < 0 ? 0 : u > 1 ? 1 : u);
  const isCur = () => typeof world !== 'undefined' && world.setId === ID;
  const SETVIEW = () => typeof TEST !== 'undefined' && !!TEST && TEST.setview === ID;
  const snd = (name, vol, rate, at) => { if (!skipping() && typeof sfx === 'function') { try { sfx(name, { vol, rate, at }); } catch (e) { /* audio is optional */ } } };
  function rng(seed) { let s = (seed >>> 0) % 2147483647 || 1; return () => ((s = (s * 16807) % 2147483647) / 2147483647); }

  // ---------------------------------------------------------- module state
  // COL: the live collider array (the engine reads it every tick). R: this build's object refs. S: prop state that
  // survives a rebuild (the set is disposed and rebuilt when it falls out of the LRU).
  const COL = [], R = {};
  const S = {
    taken: new Array(20).fill(false), pulled: new Array(24).fill(false), gog: new Array(12).fill(true), pies: new Array(16).fill(false),
    doorTo: 0, doorU: 0, svcTo: 0, svcU: 0, reader: 'red', panel: '', carLight: false, spk: 0, spkT: -1, hush: false, meterDb: null,
    yesLit: true, state: 'party31', lamp: 'tree', lampUser: false, traffic: true,
  };
  // scratch for update() (no allocation per tick)
  const tc = new THREE.Color(), m4 = new THREE.Matrix4(), m5 = new THREE.Matrix4(), qv = new THREE.Quaternion(), ev = new THREE.Euler(0, 0, 0, 'YXZ');
  const pv = new THREE.Vector3(), sv = new THREE.Vector3(), yUp = new THREE.Vector3(0, 1, 0);
  const ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
  let b = null, GL = null, DEFM = null, tint = ONE, XF = null, T = null, M = null;

  // ---------------------------------------------------------- geometry helpers (reddy's style, into the current Builder `b`)
  // put(): colour every vertex hex × tint; geometry for the unlit M.glow goes to GL (merged later without baked light).
  function put(g, hex, m) {
    if (XF) g.applyMatrix4(XF);
    tc.set(hex);
    const glow = !!m && m === M.glow, k = glow ? ONE : tint;
    const r = tc.r * k[0], gg = tc.g * k[1], bl = tc.b * k[2], n = g.attributes.position.count, a = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { a[i * 3] = r; a[i * 3 + 1] = gg; a[i * 3 + 2] = bl; }
    g.setAttribute('color', new THREE.BufferAttribute(a, 3));
    if (glow) GL.push(g); else b.add(g, m || DEFM);
  }
  // box: y is the BOTTOM. bb: min/max corners (either order). boxR / cyl / ico: centred.
  function box(w, h, d, hex, x, y, z, ry = 0, m) { const g = new THREE.BoxGeometry(w, h, d); if (ry) g.rotateY(ry); g.translate(x, y + h / 2, z); put(g, hex, m); }
  function bb(x0, y0, z0, x1, y1, z1, hex, m) {
    const ax = Math.min(x0, x1), ay = Math.min(y0, y1), az = Math.min(z0, z1), bx = Math.max(x0, x1), by = Math.max(y0, y1), bz = Math.max(z0, z1);
    box(bx - ax, by - ay, bz - az, hex, (ax + bx) / 2, ay, (az + bz) / 2, 0, m);
  }
  function boxR(w, h, d, hex, x, y, z, rx = 0, ry = 0, rz = 0, m) {
    const g = new THREE.BoxGeometry(w, h, d); g.rotateX(rx); g.rotateZ(rz); g.rotateY(ry); g.translate(x, y, z); put(g, hex, m);
  }
  function cyl(rt, rb, h, seg, hex, x, y, z, rx = 0, rz = 0, m) {
    const g = new THREE.CylinderGeometry(rt, rb, h, seg); if (rx) g.rotateX(rx); if (rz) g.rotateZ(rz); g.translate(x, y, z); put(g, hex, m);
  }
  function ico(r, hex, x, y, z, sy = 1, m, det = 0) { const g = new THREE.IcosahedronGeometry(r, det); g.scale(1, sy, 1); g.translate(x, y, z); put(g, hex, m); }
  // quad faces +Z before rotation (rx first, then ry): floor rx=-H, ceiling rx=H, wall facing -X ry=-H, facing -Z ry=PI.
  // uv = [u0, v0, u1, v1] (cell() turns a canvas pixel rect into one)
  function quad(w, h, m, x, y, z, ry = 0, rx = 0, hex = 0xffffff, uv = null) {
    const g = new THREE.PlaneGeometry(w, h);
    if (uv) { const a = g.attributes.uv; for (let i = 0; i < 4; i++) { a.setX(i, a.getX(i) > 0.5 ? uv[2] : uv[0]); a.setY(i, a.getY(i) > 0.5 ? uv[3] : uv[1]); } }
    if (rx) g.rotateX(rx); if (ry) g.rotateY(ry); g.translate(x, y, z); put(g, hex, m);
  }
  const cell = (W, Hh, px, py, pw, ph) => [px / W, 1 - (py + ph) / Hh, (px + pw) / W, 1 - py / Hh];
  const AT = (r) => cell(256, 256, r[0], r[1], r[2], r[3]);   // an atlas region -> uv rect
  // a horizontal floor quad x0..x1, z0..z1 at y with the texture tiled every `tile` metres (world-anchored uvs)
  function ground(x0, z0, x1, z1, y, m, tile = 4, hex = 0xffffff) {
    quad(x1 - x0, z1 - z0, m, (x0 + x1) / 2, y, (z0 + z1) / 2, 0, -H, hex, [x0 / tile, -z1 / tile, x1 / tile, -z0 / tile]);
  }
  function uvAll(g, u, v) { const a = g.attributes.uv; for (let i = 0; i < a.count; i++) a.setXY(i, u, v); return g; }
  // part(): fn() into a fresh Builder (XF cleared) -> a named Group at pos (local coordinates inside fn)
  function part(name, fn, pos, ry = 0, o) {
    const pb = b, px = XF, pt = tint, pg = GL, pd = DEFM; b = new Builder(); XF = null; GL = [];
    fn();
    const g = b.done(o);
    if (GL.length) g.add(unlit(GL, M.glow));
    b = pb; XF = px; tint = pt; GL = pg; DEFM = pd;
    if (name) g.name = name;
    if (pos) g.position.set(pos[0], pos[1], pos[2]);
    g.rotation.y = ry;
    return g;
  }
  // a one-material shape (for InstancedMesh): fn() into a fresh Builder, light baked (no floor AO) -> BufferGeometry
  function shapeGeo(fn, o = { floor: false }) {
    const pb = b, px = XF, pt = tint, pg = GL; b = new Builder(); XF = null; tint = ONE; GL = [];
    fn();
    const g = b.done(o); b = pb; XF = px; tint = pt; GL = pg;
    return g.children[0].geometry;
  }
  // unlit vertex-coloured geometry, merged without baked light
  function unlit(list, m) {
    const parts = list.map((g0) => {
      const g = g0.index ? g0.toNonIndexed() : g0; if (g !== g0) g0.dispose();
      for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'color') g.deleteAttribute(k);
      return g;
    });
    const merged = mergeGeometries(parts); for (const g of parts) g.dispose();
    merged.computeBoundingSphere();
    return new THREE.Mesh(merged, m);
  }
  const at = (x, z, ry = 0, y = 0) => (XF = m4.makeRotationY(ry).setPosition(x, y, z));
  // a square beam between two points (any direction)
  function beam(x0, y0, z0, x1, y1, z1, r, hex, m) {
    const dx = x1 - x0, dy = y1 - y0, dz = z1 - z0, L = Math.hypot(dx, dy, dz) || 1e-3;
    const g = new THREE.BoxGeometry(r, L, r);
    pv.set(dx / L, dy / L, dz / L); qv.setFromUnitVectors(yUp, pv);
    g.applyQuaternion(qv); g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); put(g, hex, m);
  }
  // a padded 5-point star prism (local XY plane, facing ±Z, centred)
  function starGeo(ro, ri, depth) {
    const s = new THREE.Shape();
    for (let i = 0; i < 10; i++) { const a = H + i * PI / 5, r = i % 2 ? ri : ro, x = Math.cos(a) * r, y = Math.sin(a) * r; if (i) s.lineTo(x, y); else s.moveTo(x, y); }
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: depth * 0.3, bevelSize: ro * 0.08, bevelSegments: 1, curveSegments: 1 });
    g.translate(0, 0, -depth / 2);
    return g;
  }

  // ---------------------------------------------------------- unlit materials (created once, cached by key; warmed at boot)
  const BM = {};
  const basic = (key, o) => BM[key] || (BM[key] = new THREE.MeshBasicMaterial(o));
  const ADD = THREE.AdditiveBlending;

  // ---------------------------------------------------------- painters
  const FONT = (px, w = 'bold') => `${w} ${px}px Arial, "Liberation Sans", "DejaVu Sans", sans-serif`;
  function text(c, s, x, y, px, col, al = 'center', w = 'bold', maxW) {
    c.font = FONT(px, w); c.fillStyle = col; c.textAlign = al; c.textBaseline = 'middle';
    if (maxW) c.fillText(s, x, y, maxW); else c.fillText(s, x, y);
  }
  function rrect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.lineTo(x + w - r, y); c.quadraticCurveTo(x + w, y, x + w, y + r); c.lineTo(x + w, y + h - r); c.quadraticCurveTo(x + w, y + h, x + w - r, y + h); c.lineTo(x + r, y + h); c.quadraticCurveTo(x, y + h, x, y + h - r); c.lineTo(x, y + r); c.quadraticCurveTo(x, y, x + r, y); c.closePath(); }
  function drop(c, x, y, s, fill, face) {   // the SafeSense drop (a teardrop), smiling
    c.fillStyle = fill; c.beginPath(); c.moveTo(x, y - s * 1.35); c.quadraticCurveTo(x + s * 1.05, y - s * 0.2, x + s * 0.95, y + s * 0.35);
    c.arc(x, y + 0.3 * s, s * 0.95, 0.05, PI - 0.05); c.quadraticCurveTo(x - s * 1.05, y - s * 0.2, x, y - s * 1.35); c.fill();
    if (!face) return;
    c.fillStyle = face; c.beginPath(); c.arc(x - s * 0.33, y + s * 0.15, s * 0.11, 0, TAU); c.arc(x + s * 0.33, y + s * 0.15, s * 0.11, 0, TAU); c.fill();
    c.strokeStyle = face; c.lineWidth = Math.max(1, s * 0.12); c.lineCap = 'round'; c.beginPath(); c.arc(x, y + s * 0.35, s * 0.38, 0.35, PI - 0.35); c.stroke();
  }
  function star(c, x, y, ro, ri, fill, stroke) {
    c.beginPath(); for (let i = 0; i < 10; i++) { const a = -H + i * PI / 5, r = i % 2 ? ri : ro; c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } c.closePath();
    c.fillStyle = fill; c.fill(); if (stroke) { c.strokeStyle = stroke; c.lineWidth = 1; c.stroke(); }
  }
  // the service-lift panel (128 × 256), the same as hq_floors' car: SERVICE LIFT, G · 12 · 21 · 30, reader slot, alarm
  function paintLiftPanel(c, lit) {
    c.setTransform(1, 0, 0, 1, 0, 0);
    const g = c.createLinearGradient(0, 0, 128, 0); g.addColorStop(0, '#aab0b8'); g.addColorStop(0.5, '#cdd2d8'); g.addColorStop(1, '#a4aab2');
    c.fillStyle = g; c.fillRect(0, 0, 128, 256);
    c.strokeStyle = '#6a7078'; c.lineWidth = 3; c.strokeRect(2, 2, 124, 252);
    text(c, 'SERVICE', 64, 18, 15, '#20242a', 'center', 'bold', 110); text(c, 'LIFT', 64, 34, 15, '#20242a', 'center', 'bold', 110);
    const fl = ['30', '21', '12', 'G'];
    for (let i = 0; i < 4; i++) {
      const y = 66 + i * 34, on = String(lit) === fl[i];
      c.fillStyle = '#3a3e44'; c.beginPath(); c.arc(64, y, 14, 0, TAU); c.fill();
      c.fillStyle = on ? '#ffe2a0' : '#d8dce0'; c.beginPath(); c.arc(64, y, 11, 0, TAU); c.fill();
      if (on) { c.strokeStyle = '#ffb040'; c.lineWidth = 3; c.beginPath(); c.arc(64, y, 14, 0, TAU); c.stroke(); }
      text(c, fl[i], 64, y + 1, 12, '#20242a', 'center', 'bold');
    }
    c.fillStyle = '#1a1d22'; c.fillRect(40, 194, 48, 8);
    c.fillStyle = '#c8323a'; c.beginPath(); c.arc(64, 222, 9, 0, TAU); c.fill();
    c.fillStyle = '#f2f2f2'; c.fillRect(61, 217, 6, 7); c.fillRect(59, 224, 10, 2);
    text(c, 'Are you sure?', 64, 243, 11, '#20242a', 'center', 'italic bold', 118);
  }

  // ---------------------------------------------------------- textures (128–256 px, nearest magnification, keyed 'hqa_*')
  // atlas regions [x, y, w, h] on the 256 × 256 sign atlas
  const A = {
    yes: [0, 0, 256, 96], lanyard: [0, 96, 128, 64], poster: [128, 96, 64, 96], exit: [192, 96, 64, 32], reader: [192, 128, 32, 48],
    call: [224, 128, 32, 48], ribbon: [0, 160, 128, 16], tent: [0, 176, 128, 32], goggles: [0, 208, 128, 24], caption: [128, 192, 128, 24],
    white: [250, 250, 4, 4],
  };
  function textures() {
    if (T) return T;
    T = {};
    const K = (k, o = {}) => ({ key: 'hqa_' + k, nearest: true, ...o });
    // polished white stone: 2 × 2 slabs of 1.2 m per tile, faint grout, soft veins, a few glints
    T.floor = canvasTex(128, 128, (c) => {
      const r = rng(41);
      c.fillStyle = '#eceef1'; c.fillRect(0, 0, 128, 128);
      for (let i = 0; i < 4; i++) { const x = (i % 2) * 64, y = (i >> 1) * 64, v = 236 + ((r() * 8) | 0); c.fillStyle = `rgb(${v},${v + 1},${v + 4})`; c.fillRect(x + 1, y + 1, 62, 62); }
      c.strokeStyle = 'rgba(160,168,182,0.22)'; c.lineWidth = 1;
      for (let i = 0; i < 9; i++) { c.beginPath(); let x = r() * 128, y = r() * 128; c.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (r() - 0.3) * 22; y += (r() - 0.5) * 14; c.lineTo(x, y); } c.stroke(); }
      c.fillStyle = '#cdd2da'; c.fillRect(0, 0, 128, 1); c.fillRect(0, 64, 128, 1); c.fillRect(0, 0, 1, 128); c.fillRect(64, 0, 1, 128);
      c.fillStyle = 'rgba(255,255,255,0.8)'; for (let i = 0; i < 10; i++) c.fillRect((r() * 128) | 0, (r() * 128) | 0, 2, 1);
    }, K('floor', { repeat: [1, 1] }));
    // bubble wrap over a dark green tree: needles, red / silver bauble blurs and warm light blurs under the film, the
    // bubble grid (rims + specular dots), a vertical and a horizontal tape seam
    T.wrap = canvasTex(128, 128, (c) => {
      const r = rng(1225);
      c.fillStyle = '#3a6a4a'; c.fillRect(0, 0, 128, 128);
      for (let i = 0; i < 220; i++) { c.fillStyle = r() < 0.5 ? 'rgba(30,70,44,0.7)' : 'rgba(70,110,80,0.6)'; const x = r() * 128, y = r() * 128; c.fillRect(x, y, 1 + r() * 4, 1); }
      const blur = (x, y, rr, col) => { const g = c.createRadialGradient(x, y, 0, x, y, rr); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(x - rr, y - rr, rr * 2, rr * 2); };
      for (let i = 0; i < 7; i++) blur(8 + r() * 112, 8 + r() * 112, 6 + r() * 4, r() < 0.55 ? 'rgba(216,50,58,0.85)' : 'rgba(210,214,222,0.85)');
      for (let i = 0; i < 6; i++) blur(r() * 128, r() * 128, 5, 'rgba(255,214,140,0.55)');
      c.fillStyle = 'rgba(238,246,250,0.2)'; c.fillRect(0, 0, 128, 128);   // the milky film
      for (let y = 5, row = 0; y < 128; y += 9, row++) for (let x = row % 2 ? 10 : 5; x < 128; x += 10) {   // bubbles
        c.fillStyle = 'rgba(238,246,250,0.16)'; c.beginPath(); c.arc(x, y, 4, 0, TAU); c.fill();
        c.strokeStyle = 'rgba(255,255,255,0.5)'; c.lineWidth = 1; c.beginPath(); c.arc(x, y, 4, PI * 0.85, PI * 1.65); c.stroke();
        c.strokeStyle = 'rgba(20,40,30,0.35)'; c.beginPath(); c.arc(x, y, 4, PI * 1.9, PI * 2.6); c.stroke();
        c.fillStyle = 'rgba(255,255,255,0.95)'; c.fillRect(x - 2, y - 2, 2, 1);
      }
      c.strokeStyle = 'rgba(255,255,255,0.2)'; c.lineWidth = 2;   // crinkles
      for (let i = 0; i < 4; i++) { const x = r() * 128; c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 20 + r() * 40, 128); c.stroke(); }
      c.fillStyle = 'rgba(240,236,214,0.32)'; c.fillRect(58, 0, 12, 128); c.fillRect(0, 98, 128, 10);   // tape
      c.fillStyle = 'rgba(255,255,255,0.45)'; c.fillRect(58, 0, 1, 128); c.fillRect(69, 0, 1, 128); c.fillRect(0, 98, 128, 1); c.fillRect(0, 107, 128, 1);
    }, K('wrap', { repeat: [1, 1] }));
    // the sign atlas
    T.atlas = canvasTex(256, 256, (c) => {
      c.fillStyle = '#ffffff'; c.fillRect(0, 0, 256, 256);
      // Yes (Are you sure?): the Yes logo in Yes yellow on navy + (Are you sure?) in SafeSense blue
      c.fillStyle = '#141d3a'; rrect(c, 2, 4, 252, 88, 10); c.fill();
      c.strokeStyle = '#2a3a66'; c.lineWidth = 2; rrect(c, 6, 8, 244, 80, 8); c.stroke();
      canvasTex.yes(c, 14, 14, 54, '#ffd21f');
      text(c, '(Are you', 178, 36, 22, '#bfe6ff', 'center', 'bold', 140); text(c, 'sure?)', 178, 62, 22, '#bfe6ff', 'center', 'bold', 140);
      // LANYARD REQUESTS · please allow 6–8 weeks (frosted acrylic)
      { const [x, y] = A.lanyard; c.fillStyle = '#e4eef4'; c.fillRect(x, y, 128, 64); c.strokeStyle = '#8aa8bc'; c.lineWidth = 2; c.strokeRect(x + 2, y + 2, 124, 60);
        text(c, 'LANYARD REQUESTS', x + 64, y + 17, 14, '#1e2a44', 'center', 'bold', 118);
        c.fillStyle = '#4a8ab8'; c.fillRect(x + 14, y + 28, 100, 2);
        text(c, 'please allow', x + 64, y + 39, 11, '#2a5a80', 'center', 'italic bold', 116); text(c, '6–8 weeks', x + 64, y + 53, 13, '#1e2a44', 'center', 'bold', 116); }
      // YOU ARE SAFE NOW (the drop smiling)
      { const [x, y] = A.poster, g = c.createLinearGradient(0, y, 0, y + 96); g.addColorStop(0, '#d8eefc'); g.addColorStop(1, '#ffffff');
        c.fillStyle = g; c.fillRect(x, y, 64, 96); c.strokeStyle = '#9ac4e0'; c.lineWidth = 2; c.strokeRect(x + 1, y + 1, 62, 94);
        drop(c, x + 32, y + 34, 15, '#7ec4f0', '#1e3a5a');
        text(c, 'YOU ARE', x + 32, y + 64, 11, '#1e2a44', 'center', 'bold', 58); text(c, 'SAFE NOW', x + 32, y + 77, 12, '#1e2a44', 'center', 'bold', 60);
        text(c, 'SafeSense', x + 32, y + 90, 7, '#4a8ab8', 'center', 'bold'); }
      // EXIT (green, running figure)
      { const [x, y] = A.exit; c.fillStyle = '#1a8a3a'; c.fillRect(x, y, 64, 32); c.fillStyle = '#ffffff';
        c.beginPath(); c.arc(x + 12, y + 8, 3, 0, TAU); c.fill(); c.lineWidth = 3; c.strokeStyle = '#fff'; c.lineCap = 'round';
        c.beginPath(); c.moveTo(x + 11, y + 12); c.lineTo(x + 9, y + 19); c.lineTo(x + 5, y + 26); c.moveTo(x + 9, y + 19); c.lineTo(x + 15, y + 25); c.moveTo(x + 11, y + 13); c.lineTo(x + 17, y + 16); c.moveTo(x + 10, y + 14); c.lineTo(x + 5, y + 17); c.stroke();
        text(c, 'EXIT', x + 42, y + 17, 16, '#ffffff'); }
      // the card reader face (the LED is a separate quad)
      { const [x, y] = A.reader; c.fillStyle = '#25282d'; c.fillRect(x, y, 32, 48); c.fillStyle = '#353a42'; rrect(c, x + 3, y + 3, 26, 42, 4); c.fill();
        c.fillStyle = '#0c0e10'; c.fillRect(x + 8, y + 7, 16, 5);
        c.strokeStyle = '#c8d4e0'; c.lineWidth = 1.5; for (let k = 0; k < 3; k++) { c.beginPath(); c.arc(x + 12, y + 30, 4 + k * 4, -0.7, 0.7); c.stroke(); }
        c.fillStyle = '#c8d4e0'; c.fillRect(x + 9, y + 28, 3, 4); }
      // a staff-lift call panel (up / down)
      { const [x, y] = A.call; c.fillStyle = '#c4c9d0'; c.fillRect(x, y, 32, 48); c.strokeStyle = '#8a9098'; c.strokeRect(x + 1, y + 1, 30, 46);
        for (const [cy, up] of [[15, 1], [30, 0]]) { c.fillStyle = '#3a3e44'; c.beginPath(); c.arc(x + 16, y + cy, 6, 0, TAU); c.fill(); c.fillStyle = '#bfe6ff'; c.beginPath(); c.moveTo(x + 16, y + cy + (up ? -3 : 3)); c.lineTo(x + 19, y + cy + (up ? 2 : -2)); c.lineTo(x + 13, y + cy + (up ? 2 : -2)); c.fill(); }
        text(c, 'Are you sure?', x + 16, y + 42, 5, '#2a2e34', 'center', 'bold', 30); }
      // PRE-SCREENED ribbon (the Secret Santa table's skirt)
      { const [x, y] = A.ribbon; c.fillStyle = '#4a8ab8'; c.fillRect(x, y, 128, 16); c.fillStyle = '#bfe6ff'; c.fillRect(x, y + 1, 128, 1); c.fillRect(x, y + 14, 128, 1);
        text(c, 'PRE-SCREENED', x + 64, y + 8.5, 10, '#ffffff', 'center', 'bold', 120); }
      // tent cards: MINCE PIES · pre-screened, GOGGLES ON · before pulling
      { const [x, y] = A.tent; c.fillStyle = '#ffffff'; c.fillRect(x, y, 128, 32); c.strokeStyle = '#4a8ab8'; c.lineWidth = 2; c.strokeRect(x + 2, y + 2, 124, 28);
        text(c, 'MINCE PIES', x + 64, y + 12, 13, '#1e2a44', 'center', 'bold', 118); text(c, 'pre-screened · one each', x + 64, y + 24, 9, '#4a8ab8', 'center', 'bold', 118); }
      { const [x, y] = A.goggles; c.fillStyle = '#ffffff'; c.fillRect(x, y, 128, 24); c.strokeStyle = '#d8323a'; c.lineWidth = 2; c.strokeRect(x + 2, y + 2, 124, 20);
        text(c, 'GOGGLES ON', x + 64, y + 9.5, 11, '#d8323a', 'center', 'bold', 118); text(c, 'before pulling', x + 64, y + 18, 8, '#1e2a44', 'center', 'bold', 118); }
      // the countdown's caption plate
      { const [x, y] = A.caption; c.fillStyle = '#2a2e34'; c.fillRect(x, y, 128, 24); drop(c, x + 16, y + 12, 6, '#7ec4f0');
        text(c, 'SafeSense', x + 72, y + 12, 13, '#bfe6ff', 'center', 'bold', 92); }
    }, K('atlas'));
    // MANDATORY FUN (256 × 32): red letters, a SafeSense-blue border, two small padded stars; columns 0–5 are plain
    // (white + the border) so the long outer runs of the banner map there
    T.banner = canvasTex(256, 32, (c) => {
      c.fillStyle = '#fbfbfa'; c.fillRect(0, 0, 256, 32);
      c.fillStyle = '#4a8ab8'; c.fillRect(0, 1, 256, 2); c.fillRect(0, 29, 256, 2);
      star(c, 22, 16, 8, 3.6, '#efe6d0', '#c8b890'); star(c, 234, 16, 8, 3.6, '#efe6d0', '#c8b890');
      text(c, 'MANDATORY FUN', 128, 17, 21, '#d8323a', 'center', 'bold', 180);
    }, K('banner'));
    // the SafeSense dB meter (128 × 128): 0–60 dB over 240°, red arc above 40, 40 dB MAX
    T.meter = canvasTex(128, 128, (c) => {
      c.fillStyle = '#e8ecf0'; c.fillRect(0, 0, 128, 128);
      c.fillStyle = '#f8fafc'; c.beginPath(); c.arc(64, 64, 62, 0, TAU); c.fill();
      c.strokeStyle = '#4a8ab8'; c.lineWidth = 3; c.beginPath(); c.arc(64, 64, 61, 0, TAU); c.stroke();
      const ang = (db) => -H + (db / 30 - 1) * 2.094;
      c.strokeStyle = '#d8323a'; c.lineWidth = 7; c.beginPath(); c.arc(64, 64, 52, ang(40), ang(60)); c.stroke();
      for (let db = 0; db <= 60; db += 5) {
        const a = ang(db), maj = db % 10 === 0, r0 = maj ? 42 : 46;
        c.strokeStyle = db > 40 ? '#a01a20' : '#1e2a44'; c.lineWidth = maj ? 2 : 1;
        c.beginPath(); c.moveTo(64 + Math.cos(a) * r0, 64 + Math.sin(a) * r0); c.lineTo(64 + Math.cos(a) * 50, 64 + Math.sin(a) * 50); c.stroke();
        if (maj) text(c, String(db), 64 + Math.cos(a) * 33, 64 + Math.sin(a) * 33, 9, db > 40 ? '#a01a20' : '#1e2a44');
      }
      text(c, 'dB', 64, 44, 9, '#1e2a44');
      text(c, '40 dB MAX', 64, 90, 11, '#d8323a', 'center', 'bold', 80);
      text(c, 'SafeSense', 64, 104, 9, '#4a8ab8', 'center', 'bold', 70);
    }, K('meter'));
    // staff-lift indicator strip: "Are you sure?" scrolling (repeat in u)
    T.ind = canvasTex(128, 16, (c) => {
      c.fillStyle = '#081018'; c.fillRect(0, 0, 128, 16);
      text(c, 'Are you sure?', 64, 8.5, 11, '#bfe6ff', 'center', 'bold', 118);
      c.fillStyle = 'rgba(0,0,0,0.45)'; for (let x = 1; x < 128; x += 2) c.fillRect(x, 0, 1, 16); for (let y = 1; y < 16; y += 2) c.fillRect(0, y, 128, 1);
    }, K('ind', { repeat: [1, 1] }));
    // a parcel: white wrap, SafeSense ribbon cross, a PRE-SCREENED sticker, a blank paper tag (names are AR)
    T.gift = canvasTex(128, 128, (c) => {
      c.fillStyle = '#f6f8fa'; c.fillRect(0, 0, 128, 128);
      c.strokeStyle = '#e2e6ec'; c.lineWidth = 1; for (let k = -128; k < 128; k += 12) { c.beginPath(); c.moveTo(k, 0); c.lineTo(k + 128, 128); c.stroke(); c.beginPath(); c.moveTo(k + 128, 0); c.lineTo(k, 128); c.stroke(); }
      c.fillStyle = '#4a8ab8'; c.fillRect(56, 0, 16, 128); c.fillRect(0, 56, 128, 16);
      c.fillStyle = '#7ab0d8'; c.fillRect(56, 0, 2, 128); c.fillRect(0, 56, 128, 2);
      c.fillStyle = '#ffffff'; rrect(c, 8, 92, 44, 26, 4); c.fill(); c.strokeStyle = '#4a8ab8'; c.lineWidth = 2; c.stroke();
      text(c, 'PRE-', 30, 100, 10, '#2a5a80', 'center', 'bold'); text(c, 'SCREENED', 30, 111, 9, '#2a5a80', 'center', 'bold', 40);
      c.fillStyle = '#fffdf4'; c.fillRect(84, 10, 30, 20); c.strokeStyle = '#b8b0a0'; c.lineWidth = 1; c.strokeRect(84.5, 10.5, 29, 19);
      c.beginPath(); c.moveTo(84, 20); c.lineTo(70, 30); c.stroke();
    }, K('gift'));
    // Luke's invitation (the hand prop `invite`): card stock, a Yes-yellow border, MANDATORY FUN, LUKE + 2
    T.invite = canvasTex(128, 96, (c) => {
      c.fillStyle = '#f7f4ec'; c.fillRect(0, 0, 128, 96);
      c.strokeStyle = '#ffd21f'; c.lineWidth = 4; c.strokeRect(5, 5, 118, 86);
      text(c, 'MANDATORY', 64, 33, 15, '#c62828', 'center', 'bold'); text(c, 'FUN', 64, 51, 15, '#c62828', 'center', 'bold');
      text(c, 'LUKE + 2', 64, 74, 10, '#141d3a', 'center', 'normal');
    }, K('invite'));
    // a cracker (64 around × 32 along): silver frilled ends, red body, a gold band and white stars
    T.cracker = canvasTex(64, 32, (c) => {
      c.fillStyle = '#d8323a'; c.fillRect(0, 0, 64, 32);
      c.fillStyle = '#c8ccd4'; c.fillRect(0, 0, 64, 7); c.fillRect(0, 25, 64, 7);
      c.fillStyle = '#a8aeb8'; for (let x = 0; x < 64; x += 4) { c.fillRect(x, 0, 1, 7); c.fillRect(x + 2, 25, 1, 7); }
      c.fillStyle = '#e8c050'; c.fillRect(0, 14, 64, 4);
      for (let x = 4; x < 64; x += 12) { star(c, x, 10.5, 2.4, 1, '#ffffff'); star(c, x + 6, 21.5, 2.4, 1, '#ffffff'); }
    }, K('cracker'));
    // a mince pie: crimped pastry, a star cut, the tiny PRE-SCREENED sticker
    T.pie = canvasTex(32, 32, (c) => {
      c.fillStyle = '#b8743a'; c.fillRect(0, 0, 32, 32);
      c.fillStyle = '#e0a860'; c.beginPath(); c.arc(16, 16, 14, 0, TAU); c.fill();
      c.strokeStyle = '#c88a48'; c.lineWidth = 1; for (let i = 0; i < 16; i++) { const a = i * TAU / 16; c.beginPath(); c.moveTo(16 + Math.cos(a) * 11, 16 + Math.sin(a) * 11); c.lineTo(16 + Math.cos(a) * 14, 16 + Math.sin(a) * 14); c.stroke(); }
      star(c, 16, 16, 6, 2.6, '#6a2a1e');
      c.fillStyle = '#ffffff'; c.fillRect(19, 5, 8, 5); c.fillStyle = '#4a8ab8'; c.fillRect(20, 6, 6, 1); c.fillRect(20, 8, 4, 1);
    }, K('pie'));
    // grey quilted moving blanket (the lift car)
    T.quilt = canvasTex(64, 64, (c) => {
      c.fillStyle = '#6c727a'; c.fillRect(0, 0, 64, 64);
      c.strokeStyle = '#535a62'; c.lineWidth = 2;
      for (let k = -64; k < 128; k += 16) { c.beginPath(); c.moveTo(k, 0); c.lineTo(k + 64, 64); c.stroke(); c.beginPath(); c.moveTo(k + 64, 0); c.lineTo(k, 64); c.stroke(); }
      c.fillStyle = 'rgba(255,255,255,0.06)'; for (let y = 4; y < 64; y += 16) for (let x = 4; x < 64; x += 16) c.fillRect(x, y, 8, 8);
    }, K('quilt', { repeat: [1, 1] }));
    // brushed steel with fingerprints (nobody polishes the service lift)
    T.steel = canvasTex(64, 64, (c) => {
      const r = rng(87);
      c.fillStyle = '#b4bac2'; c.fillRect(0, 0, 64, 64);
      for (let x = 0; x < 64; x++) { const v = 170 + ((r() * 26) | 0); c.fillStyle = `rgba(${v},${v + 4},${v + 10},0.55)`; c.fillRect(x, 0, 1, 64); }
      for (let i = 0; i < 5; i++) { const x = 10 + r() * 44, y = 18 + r() * 30; c.strokeStyle = 'rgba(110,116,124,0.35)'; c.lineWidth = 1; for (let k = 1; k < 4; k++) { c.beginPath(); c.ellipse(x, y, k * 1.4, k * 1.9, 0.3, 0, TAU); c.stroke(); } }
    }, K('steel', { repeat: [1, 1] }));
    T.pa = canvasTex(64, 64, (c) => {   // the round ceiling speaker grille
      c.fillStyle = '#d8dde2'; c.fillRect(0, 0, 64, 64);
      c.fillStyle = '#b8bec6'; c.beginPath(); c.arc(32, 32, 30, 0, TAU); c.fill();
      c.fillStyle = '#2a2e34'; c.beginPath(); c.arc(32, 32, 25, 0, TAU); c.fill();
      c.fillStyle = '#6a7078'; for (let y = 10; y < 56; y += 5) for (let x = 10; x < 56; x += 5) if ((x - 32) ** 2 + (y - 32) ** 2 < 22 * 22) c.fillRect(x, y, 2, 2);
    }, K('pa'));
    T.liftPanel = canvasTex(128, 256, (c) => paintLiftPanel(c, ''), K('lift_panel'));
    // the podium's white stone (outside): panels with joints, a weather streak
    T.podium = canvasTex(128, 128, (c) => {
      const r = rng(13);
      c.fillStyle = '#c8cacc'; c.fillRect(0, 0, 128, 128);
      for (let y = 0; y < 4; y++) for (let x = 0; x < 2; x++) { const v = 196 + ((r() * 14) | 0); c.fillStyle = `rgb(${v},${v + 1},${v + 3})`; c.fillRect(x * 64 + 1, y * 32 + 1, 62, 30); }
      for (let i = 0; i < 6; i++) { c.fillStyle = 'rgba(120,124,128,0.12)'; c.fillRect(r() * 128, 0, 2 + r() * 3, 128); }
    }, K('podium', { repeat: [1, 1] }));
    // Ann Street: wet bitumen and wet pavers (the valley's paint, so the street matches 2.8)
    T.road = canvasTex(128, 128, (c) => {
      const r = rng(11);
      c.fillStyle = '#2a2b34'; c.fillRect(0, 0, 128, 128);
      for (let i = 0; i < 900; i++) { const v = 32 + r() * 20 | 0; c.fillStyle = `rgb(${v},${v},${v + 6})`; c.fillRect(r() * 128 | 0, r() * 128 | 0, 1, 1); }
      for (let i = 0; i < 14; i++) { c.fillStyle = `rgba(80,88,120,${0.12 + r() * 0.18})`; const x = r() * 128, y = r() * 128; c.beginPath(); c.ellipse(x, y, 6 + r() * 18, 1.5 + r() * 3, (r() - 0.5) * 0.4, 0, TAU); c.fill(); }
    }, K('road', { repeat: [1, 1] }));
    T.pave = canvasTex(128, 128, (c) => {
      const r = rng(19);
      c.fillStyle = '#2a2c34'; c.fillRect(0, 0, 128, 128);
      for (let y = 0; y < 8; y++) for (let x = 0; x < 4; x++) { const o = (y % 2) * 16, v = 70 + r() * 16 | 0; c.fillStyle = `rgb(${v},${v + 2},${v + 10})`; c.fillRect(((x * 32 + o) % 128) + 1, y * 16 + 1, 30, 14); if (o) c.fillRect(0, y * 16 + 1, 15, 14); }
      for (let i = 0; i < 10; i++) { c.fillStyle = `rgba(110,118,150,${0.15 + r() * 0.2})`; c.beginPath(); c.ellipse(r() * 128, r() * 128, 8 + r() * 14, 2 + r() * 4, (r() - 0.5) * 0.6, 0, TAU); c.fill(); }
    }, K('pave', { repeat: [1, 1] }));
    // a soft radial blob (car glow / shadows, figure shadows)
    T.soft = canvasTex(64, 64, (c) => {
      const g = c.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.55, 'rgba(255,255,255,0.45)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = g; c.fillRect(0, 0, 64, 64);
    }, { key: 'hqa_soft' });
    // the extras' faces (polite smiles); the right-hand column stays white for the rest of the head
    T.face = canvasTex(64, 64, (c) => {
      c.fillStyle = '#ffffff'; c.fillRect(0, 0, 64, 64);
      c.fillStyle = '#2a1e18'; c.fillRect(12, 26, 5, 6); c.fillRect(31, 26, 5, 6);
      c.fillStyle = '#5a4030'; c.fillRect(10, 21, 9, 2); c.fillRect(29, 21, 9, 2);
      c.fillStyle = 'rgba(220,120,110,0.35)'; c.fillRect(8, 36, 7, 4); c.fillRect(33, 36, 7, 4);
      c.strokeStyle = '#8a3a34'; c.lineWidth = 2; c.beginPath(); c.arc(24, 37, 7, 0.45, PI - 0.45); c.stroke();
    }, K('face'));
    return T;
  }

  // ---------------------------------------------------------- materials (mat()/matTex()/basic() caches: one program each, warmed)
  function mats() {
    textures();
    M = {
      vc: mat(0xffffff),
      in: mat(0xffffff, { key: 'hqa_in' }),                       // the interior's static geometry (crane31 brightens it)
      floor: matTex(T.floor, { transparent: true, opacity: 0.8, depthWrite: true, key: 'hqa_floor' }),
      wrap: matTex(T.wrap, { key: 'hqa_wrap' }),
      atlas: matTex(T.atlas, { emissive: 0xffffff, emissiveIntensity: 0.22 }),
      atlasLit: matTex(T.atlas, { emissive: 0xffffff, emissiveIntensity: 0.85 }),
      glow: basic('hqa_glow', { vertexColors: true }),
      glass: basic('hqa_glass', { color: 0xcfe0ea, transparent: true, opacity: 0.25, depthWrite: false, side: DS }),
      invite: matTex(T.invite), quilt: matTex(T.quilt), steel: matTex(T.steel), podium: matTex(T.podium), road: matTex(T.road), pave: matTex(T.pave),
      banner: matTex(T.banner, { emissive: 0xffffff, emissiveIntensity: 0.18 }),
      meter: matTex(T.meter, { emissive: 0xffffff, emissiveIntensity: 0.35 }),
      arc: basic('hqa_arc', { color: 0xff3a40, transparent: true, opacity: 0, blending: ADD, depthWrite: false }),
      ind: basic('hqa_ind', { map: T.ind }),
      gift: matTex(T.gift), cracker: matTex(T.cracker), pie: matTex(T.pie),
      fig: mat(0xffffff, { key: 'hqa_fig' }), figBase: mat(0xffffff, { key: 'hqa_figb' }), face: matTex(T.face, { key: 'hqa_face' }),
      goggle: mat(0xffffff, { key: 'hqa_goggle' }), star: mat(0xffffff, { key: 'hqa_star' }), foamIM: mat(0xffffff, { key: 'hqa_foam' }),
      chip: basic('hqa_chip', { color: 0xbfe6ff }),
      bulb: basic('hqa_bulb', { color: 0xffffff }),
      led: basic('hqa_led', { color: 0xff3020 }),
      carLight: basic('hqa_car_light', { color: 0xfff6e8 }),
      spk: basic('hqa_spk', { color: 0xbfe6ff, transparent: true, opacity: 0, blending: ADD, depthWrite: false }),
      pa: matTex(T.pa),
      panel: matTex(T.liftPanel, { emissive: 0xffffff, emissiveIntensity: 0.35 }),
      lampHead: basic('hqa_lamp_head', { color: 0xfff0d0 }),
      car: mat(0xffffff, { key: 'hqa_car' }),
      carGlow: basic('hqa_car_glow', { map: T.soft, transparent: true, blending: ADD, depthWrite: false, color: 0x2a7aa8 }),
      shadow: basic('hqa_shadow', { map: T.soft, transparent: true, depthWrite: false, color: 0x000000, opacity: 0.38, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }),
      horizon: basic('hqa_horizon', { color: 0x3a4442, fog: false, side: THREE.BackSide }),
    };
    M.glass.forceSinglePass = true;
    return M;
  }

  // ---------------------------------------------------------- data shared by build / update (fixed positions)
  const GATES = [-4.5, -2.7, -0.9, 0.9, 2.7, 4.5];
  const COLS = [[-9.0, -19.0], [9.0, -19.0], [-9.0, -31.0], [9.0, -31.0]];
  const LIFTS = [-33.5, -30.5, -23.5, -20.5];
  const TREE = { x: -5.0, z: -34.0, tiers: [[0.45, 3.2, 3.6, 1.6], [2.6, 3.0, 3.1, 1.3], [4.7, 2.8, 2.6, 1.05], [6.7, 2.6, 2.1, 0.8], [8.6, 2.4, 1.6, 0.55], [10.3, 2.2, 1.1, 0.05]] };
  const treeR = (y) => { let r = 0; for (const [y0, h, rb, rt] of TREE.tiers) if (y >= y0 && y <= y0 + h) r = Math.max(r, rb + (rt - rb) * (y - y0) / h); return r; };
  const STARS = [[-6, 11.0, -18], [0, 11.7, -18], [6, 10.8, -18], [-6, 11.6, -26], [0, 10.6, -26], [6, 11.4, -26]];
  // the figures: choir 0–9 (on the risers, facing +X), crowd 0–11 (floor, spec §4), mezzanine onlookers (crowd 12–17)
  const CHOIR = [
    [-14.8, 0.6, -30.3], [-14.8, 0.6, -28.7], [-14.8, 0.6, -27.1], [-14.8, 0.6, -25.6],
    [-13.6, 0.3, -29.5], [-13.6, 0.3, -27.8], [-13.6, 0.3, -26.1],
    [-12.5, 0.0, -29.9], [-12.5, 0.0, -28.5], [-12.5, 0.0, -25.6],
  ].map(([x, y, z]) => [x, y, z, H]);
  const CROWD = [
    [-3.0, 0, -21.0, -H], [3.2, 0, -19.0, H], [8.2, 0, -37.0, 0], [5.0, 0, -24.5, 2.6], [-6.6, 0, -26.0, 0.9], [1.6, 0, -25.4, -2.2],
    [6.8, 0, -21.8, -1.4], [-3.4, 0, -16.6, 2.9], [11.0, 0, -34.4, -0.6], [-10.4, 0, -35.8, 1.2], [1.8, 0, -38.6, 0.3], [-7.4, 0, -21.8, 1.2],
    [-13.9, 4.5, -20.0, H], [-13.9, 4.5, -33.0, H], [13.9, 4.5, -18.0, -H], [13.9, 4.5, -30.0, -H], [13.9, 9.0, -24.0, -H], [-13.9, 9.0, -26.0, H],
  ];
  const CLOTHES = [0x1e2a44, 0x6a7078, 0xe8eaee, 0x202226, 0xb8a888, 0x2a3a5a, 0x8a9098, 0xd8dce2];
  const SKINS = [0xf0c8a8, 0xe0b090, 0xc89870, 0xa87050, 0x8a5a3c, 0xf2d0b8, 0xd8a888];
  // 20 parcels (spec §12.5): row A z -33.85, row B z -33.35, x = 2.05 + 0.32 k, y 0.86
  const GIFT_TAGS = ['MARCUS', 'JO', 'PRIYA', 'DEV', 'SAM', 'KYLIE', 'RAJ', 'TOM', 'LIAM', 'MEI', 'TROY', 'WEN', 'ANH', 'CLAIRE', 'BEC', 'GAZ', 'PRIYA S.', 'TOM K.', 'NADIA', 'WEN L.'];
  const GIFTS = GIFT_TAGS.map((tag, i) => ({ i, row: i < 10 ? 'A' : 'B', at: [2.05 + 0.32 * (i % 10), 0.86, i < 10 ? -33.85 : -33.35], tag }));
  GIFTS.byName = { priya: 2, tom: 7, wen: 11, gaz: 15, nadia: 18 };
  const STEAM_AT = [13.6, 1.35, -16.0];

  // ---------------------------------------------------------- build(): the interior (one Builder), the exterior, the props
  function build() {
    COL.length = 0; mats(); FIG = null;
    const root = new THREE.Group(); root.name = 'hq_atrium_root'; R.root = root;
    const P = (g, parent = root) => (parent.add(g), g);
    R.mirrorSrc = [];
    const mirrorOf = (g) => (R.mirrorSrc.push(g), g);

    // ======================================================== interior static (M.in + floor + atlas + wrap-free)
    b = new Builder(); GL = []; XF = null; tint = ONE; DEFM = M.in;
    // ---- the shell: walls, skirting, the north feature wall's slats
    bb(-18.0, 0, -41.0, -17.6, 13.5, -11.0, WHITE); bb(17.6, 0, -41.0, 18.0, 13.5, -11.0, WHITE);
    bb(-18.0, 0, -41.0, -5.8, 13.5, -40.6, WHITE); bb(-4.2, 0, -41.0, 18.0, 13.5, -40.6, WHITE); bb(-5.8, 2.4, -41.0, -4.2, 13.5, -40.6, WHITE);
    bb(-17.6, 0, -40.6, -17.55, 0.12, -11.4, SHAD); bb(17.55, 0, -40.6, 17.6, 0.12, -11.4, SHAD);
    bb(-17.6, 0, -40.6, -6.0, 0.12, -40.55, SHAD); bb(-4.0, 0, -40.6, 17.6, 0.12, -40.55, SHAD);
    for (let x = -16.8; x < 17.0; x += 1.2) {
      if (x > -6.6 && x < -3.4) continue;
      bb(x - 0.05, 0.12, -40.6, x + 0.05, 13.3, -40.54, 0xe2e6ea);
    }
    // ---- the floor (polished stone over the mirrored room), the entrance mat, thresholds
    ground(-17.6, -40.6, 17.6, -11.4, 0, M.floor, 2.4);
    bb(-2.6, 0, -13.4, 2.6, 0.012, -11.4, 0x5a626c); bb(-2.0, 0, -11.45, 2.0, 0.01, -11.0, STEELD);
    // ---- the coffered soffit (L3 slab) and its downlights
    quad(35.2, 29.2, M.in, 0, 13.5, -26.0, 0, H, WHITE);
    for (const x of [-13.6, -9.0, -4.5, 0, 4.5, 9.0, 13.6]) bb(x - 0.2, 12.9, -40.6, x + 0.2, 13.5, -11.4, SHAD);
    const CZ = [-36.95, -33.3, -29.65, -26.0, -22.35, -18.7, -15.05];
    for (const z of CZ) bb(-17.6, 12.9, z - 0.2, 17.6, 13.5, z + 0.2, SHAD);
    for (const x of [-11.3, -6.75, -2.25, 2.25, 6.75, 11.3]) for (let k = 0; k < CZ.length + 1; k++) {
      const z0 = k === 0 ? -40.6 : CZ[k - 1], z1 = k === CZ.length ? -11.4 : CZ[k];
      quad(0.6, 0.6, M.glow, x, 13.47, (z0 + z1) / 2, 0, H, 0xfff4e4);
    }
    // ---- the south facade: glass, mullions every 2 m, transoms at the mezzanine levels, the door portal + track
    quad(16, 13.5, M.glass, -10, 6.75, -11.2); quad(16, 13.5, M.glass, 10, 6.75, -11.2); quad(4, 10.7, M.glass, 0, 8.15, -11.2);
    for (let x = -18; x <= 18.01; x += 2) bb(x - 0.06, Math.abs(x) < 0.1 ? 2.8 : 0, -11.45, x + 0.06, 13.5, -11.0, MULL);
    for (const y of [4.5, 9.0]) bb(-18, y - 0.08, -11.45, 18, y + 0.08, -11.0, MULL);
    bb(-18, 0, -11.45, -2, 0.1, -11.0, MULL); bb(2, 0, -11.45, 18, 0.1, -11.0, MULL); bb(-18, 13.3, -11.45, 18, 13.5, -11.0, MULL);
    bb(-2.1, 2.6, -11.5, 2.1, 2.8, -11.0, MULL); bb(-4.2, 2.62, -11.62, 4.2, 2.86, -11.45, 0x9aa2aa);
    quad(0.6, 0.3, M.atlasLit, 0, 3.1, -11.64, PI, 0, 0xffffff, AT(A.exit)); bb(-0.32, 2.94, -11.63, 0.32, 3.26, -11.6, 0x2a2e34);
    // ---- the choir risers (carpet, foam nosings)
    bb(-15.4, 0, -31.0, -14.2, 0.6, -25.0, CARPET); bb(-14.2, 0, -31.0, -13.0, 0.3, -25.0, CARPET);
    bb(-14.25, 0.55, -31.0, -14.17, 0.63, -25.0, FOAM); bb(-13.05, 0.25, -31.0, -12.97, 0.33, -25.0, FOAM);
    for (const z of [-31.02, -24.98]) { bb(-15.4, 0, z - 0.02, -14.2, 0.6, z + 0.02, 0x6a7484); bb(-14.2, 0, z - 0.02, -13.0, 0.3, z + 0.02, 0x6a7484); }
    // ---- the lift car (behind the north wall): rubber floor, steel shell, quilted blankets, rails, ceiling
    bb(-6.1, 0, -43.0, -3.9, 0.02, -40.8, 0x2a2c30);
    bb(-6.3, 0, -43.2, -6.1, 2.6, -40.8, 0x8a9098); bb(-3.9, 0, -43.2, -3.7, 2.6, -40.8, 0x8a9098); bb(-6.3, 0, -43.2, -3.7, 2.6, -43.0, 0x8a9098);
    bb(-6.1, 2.5, -43.0, -3.9, 2.6, -40.8, 0xe4e8ec);
    quad(2.0, 2.0, M.quilt, -6.09, 1.18, -41.95, H, 0, 0xffffff, [0, 0, 2.5, 2.5]); quad(1.4, 2.0, M.quilt, -3.91, 1.18, -42.25, -H, 0, 0xffffff, [0, 0, 1.75, 2.5]);
    quad(2.2, 2.0, M.quilt, -5.0, 1.18, -42.99, 0, 0, 0xffffff, [0, 0, 2.75, 2.5]);
    bb(-6.1, 2.18, -43.0, -3.9, 2.22, -42.94, STEEL); bb(-6.08, 2.18, -43.0, -6.02, 2.22, -41.0, STEEL); bb(-3.98, 2.18, -43.0, -3.92, 2.22, -41.6, STEEL);
    bb(-5.9, 0.88, -42.92, -4.1, 0.92, -42.86, STEEL); bb(-6.02, 0.88, -42.9, -5.96, 0.92, -41.2, STEEL); bb(-4.04, 0.88, -42.9, -3.98, 0.92, -41.65, STEEL);
    bb(-3.94, 0.95, -41.32, -3.9, 1.55, -40.98, STEELD);
    bb(-5.8, 0, -40.85, -4.2, 0.022, -40.6, STEELD);
    const inStatic = b.done(); inStatic.name = 'interior';
    if (GL.length) inStatic.add(unlit(GL, M.glow));
    for (const m of inStatic.children) {
      if (m.material === M.floor) { m.renderOrder = -1; m.name = 'floor'; m.userData.noOcclude = true; R.floor = m; }
      else if (m.material === M.glass) m.userData.noOcclude = true;
      else mirrorOf(m);
    }
    root.add(inStatic);

    // ======================================================== the mezzanines (W and E, L1 + L2): slabs, balustrades, life
    R.mezz = P(part('mezz', () => {
      for (const s of [-1, 1]) {
        for (const [y0, y1, rail] of [[4.3, 4.5, 5.6], [8.8, 9.0, 10.1]]) {
          bb(s * 17.6, y0, -40.6, s * 13.6, y1, -11.4, STONE);
          bb(s * 13.6, y0 - 0.12, -40.6, s * 13.52, y1 + 0.03, -11.4, SHAD);
          bb(s * 13.62, y0 - 0.2, -40.6, s * 13.48, y0 - 0.08, -11.4, FOAM);
          for (let z = -40.4; z < -11.5; z += 2.0) bb(s * 13.58, y1, z - 0.03, s * 13.66, rail, z + 0.03, STEEL);
          bb(s * 13.56, y1, -40.6, s * 13.68, y1 + 0.08, -11.4, STEEL);
          bb(s * 13.5, rail - 0.04, -40.6, s * 13.74, rail + 0.12, -11.4, FOAM);
          for (let z = -40.0; z < -11.5; z += 1.2) bb(s * 13.49, rail - 0.05, z - 0.02, s * 13.75, rail + 0.13, z + 0.02, SEAM);
          quad(29.2, 1.1, M.glass, s * 13.62, y1 + 0.6, -26.0, H);
          for (let z = -38.6; z < -12; z += 3.0) quad(0.45, 0.45, M.glow, s * 15.6, y0 - 0.012, z, 0, H, 0xfff4e4);
          // the back wall's office doors, a planter or two
          for (const z of s < 0 ? [-36.0, -27.0, -18.0] : [-36.5, -26.5, -16.5]) {
            bb(s * 17.6, y1, z - 0.5, s * 17.55, y1 + 2.2, z + 0.5, 0x8a929c); bb(s * 17.56, y1 + 1.0, z + 0.32, s * 17.52, y1 + 1.06, z + 0.42, STEEL);
          }
          for (const z of y0 < 5 ? [-38.5, -24.0, -13.0] : [-34.0, -14.5]) {
            cyl(0.28, 0.24, 0.5, 8, 0xe8eaee, s * 16.9, y1 + 0.25, z); ico(0.42, 0x4a7a54, s * 16.9, y1 + 0.85, z, 1.1); ico(0.3, 0x5a8a5a, s * 16.75, y1 + 1.15, z + 0.12, 1);
          }
        }
      }
      bb(16.6, 4.5, -21.6, 17.2, 5.6, -21.0, 0xe8eef4); cyl(0.14, 0.14, 0.4, 8, 0x9ad0f0, 16.9, 5.8, -21.3);   // a water cooler (E L1)
    }));
    mirrorOf(R.mezz);

    // ======================================================== columns: foam-wrapped to 2.2 m
    R.columns = P(part('columns', () => {
      for (const [x, z] of COLS) {
        cyl(0.6, 0.6, 13.5, 14, WHITE, x, 6.75, z);
        cyl(0.68, 0.68, 2.2, 14, FOAM, x, 1.1, z); cyl(0.6, 0.69, 0.04, 14, SEAM, x, 2.22, z);
        for (const y of [0.55, 1.1, 1.65]) cyl(0.685, 0.685, 0.03, 14, SEAM, x, y, z);
        cyl(0.72, 0.72, 0.05, 14, SHAD, x, 0.025, z);
      }
    }));
    mirrorOf(R.columns);

    // ======================================================== the tree: six bubble-wrapped tiers, the planter, bulbs, the star
    R.tree = P(part('tree_wrapped', () => {
      const r = rng(77);
      for (const [y0, h, rb, rt] of TREE.tiers) {
        const g = new THREE.CylinderGeometry(rt, rb, h, 14, 1, true), uv = g.attributes.uv, su = Math.max(4, Math.round(TAU * rb / 1.4)), sl = Math.hypot(h, rb - rt) / 1.4, off = r();
        for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * su + off, uv.getY(i) * sl);
        g.translate(0, y0 + h / 2, 0); put(g, 0xffffff, M.wrap);
        const d = new THREE.CircleGeometry(rb * 0.99, 14); d.rotateX(H); d.translate(0, y0 + 0.01, 0); put(d, 0x3e6248);
      }
      cyl(3.86, 3.96, 0.45, 22, FOAM, 0, 0.225, 0); cyl(3.88, 3.88, 0.03, 22, SEAM, 0, 0.3, 0); cyl(3.7, 3.7, 0.02, 22, 0xe4dac0, 0, 0.455, 0);
    }, [TREE.x, 0, TREE.z]));
    mirrorOf(R.tree);
    R.star = part('tree_star', () => { put(starGeo(0.42, 0.18, 0.22), FOAM); const g2 = starGeo(0.4, 0.17, 0.2); g2.rotateY(H); put(g2, 0xe8dcc0); bb(-0.03, -0.62, -0.03, 0.03, -0.32, 0.03, 0x8a9098); }, [0, 12.8, 0], 0, { floor: false });
    R.star.userData.turn = 0.05; R.tree.add(R.star); R.tree.userData.star = R.star;
    {   // 60 bulbs just under the wrap (a spiral round the tiers); brightness per instance (instanceColor)
      const pos = [];
      for (let i = 0; i < 60; i++) { const y = 0.9 + 11.0 * (i / 59), a = i * 2.39996, rr = treeR(y) + 0.04; pos.push([Math.cos(a) * rr, y, Math.sin(a) * rr, 0, 1]); }
      R.bulbs = instanced(new THREE.OctahedronGeometry(0.07, 0), M.bulb, pos); R.bulbs.name = 'tree_bulbs';
      for (let i = 0; i < 60; i++) R.bulbs.setColorAt(i, tc.setHex(0xffd890));
      R.bulbs.instanceColor.setUsage(THREE.DynamicDrawUsage); R.bulbs.instanceColor.needsUpdate = true;
      R.tree.add(R.bulbs);
      R.bulbPh = pos.map((p, i) => (i * 1.618) % TAU);
    }

    // ======================================================== pendant stars (IM 6) on cables
    R.cables = P(part('pendant_cables', () => { for (const [x, y, z] of STARS) bb(x - 0.01, y + 0.7, z - 0.01, x + 0.01, 13.5, z + 0.01, 0x8a9098); }));
    {
      const g = starGeo(0.75, 0.32, 0.3); g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 3).fill(1), 3));
      tc.setHex(FOAM); const ca = g.attributes.color; for (let i = 0; i < ca.count; i++) ca.setXYZ(i, tc.r, tc.g, tc.b);
      bakeLight(g, { floor: false });
      R.stars = instanced(g, M.star, STARS.map(([x, y, z], i) => [x, y, z, i * 0.7, 1])); R.stars.name = 'pendant_stars';
      R.stars.instanceMatrix.setUsage(THREE.DynamicDrawUsage); R.stars.frustumCulled = false; root.add(R.stars); mirrorOf(R.stars);
    }

    // ======================================================== MANDATORY FUN (two-sided, sagging), pivot on its top line
    // strung between the L2 balustrades (y 9.7–11.3; the spec's 5.9–7.5 cut every high camera's view of the floor)
    R.banner = P(part('banner_fun', () => {
      const X = 13.4, xs = [], sag = (x) => 0.25 * (1 - (x / X) ** 2), HB = 1.6;
      for (let i = 0; i <= 24; i++) xs.push(-X + 2 * X * i / 24);
      xs.push(-6.4, 6.4); xs.sort((p, q) => p - q);
      const U = (x, back, out) => { if (out) return 3 / 256; const u = clamp01((x + 6.4) / 12.8); return back ? 1 - u : u; };
      const pos = [], nor = [], uvs = [];
      const v = (x, y, z, nz, u, w) => { pos.push(x, y, z); nor.push(0, 0, nz); uvs.push(u, w); };
      for (let k = 0; k < xs.length - 1; k++) {
        const a = xs[k], c = xs[k + 1]; if (c - a < 1e-4) continue;
        const out = Math.abs((a + c) / 2) > 6.4, ta = -sag(a), tb = -sag(c), ba = ta - HB, bc = tb - HB;
        const ua = U(a, 0, out), uc = U(c, 0, out), wa = U(a, 1, out), wc = U(c, 1, out);
        // front (+Z)
        v(a, ba, 0.012, 1, ua, 0); v(c, bc, 0.012, 1, uc, 0); v(c, tb, 0.012, 1, uc, 1);
        v(a, ba, 0.012, 1, ua, 0); v(c, tb, 0.012, 1, uc, 1); v(a, ta, 0.012, 1, ua, 1);
        // back (-Z), wound the other way, the text mirrored to read from the north
        v(c, bc, -0.012, -1, wc, 0); v(a, ba, -0.012, -1, wa, 0); v(a, ta, -0.012, -1, wa, 1);
        v(c, bc, -0.012, -1, wc, 0); v(a, ta, -0.012, -1, wa, 1); v(c, tb, -0.012, -1, wc, 1);
        beam(a, ta + 0.02, 0, c, tb + 0.02, 0, 0.05, 0x8a9098);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
      put(g, 0xffffff, M.banner);
      for (const s of [-1, 1]) {
        bb(s * X, -HB, -0.025, s * (X - 0.06), 0, 0.025, 0x4a8ab8);
        beam(s * (X - 0.03), 0.02, 0, s * (X - 0.3), 2.2, 0, 0.025, 0x8a9098);      // up to the soffit
        beam(s * (X - 0.03), -HB, 0, s * 13.6, -1.48, 0, 0.025, 0x8a9098);          // tied off to the L2 rail
      }
    }, [0, 11.3, -22.5], 0, { floor: false }));
    mirrorOf(R.banner);

    // ======================================================== the north wall: the LED countdown, Yes (Are you sure?)
    R.count = makeCountdown();
    R.countWall = P(part('countdown_wall', () => {
      bb(0.8, 5.4, -40.6, 13.2, 9.8, -40.45, 0x2a2e34); bb(1.0, 6.0, -40.47, 13.0, 9.2, -40.445, 0x0c1016);
      for (const [x, y] of [[0.8, 5.4], [13.2, 5.4], [0.8, 9.8], [13.2, 9.8]]) bb(x - 0.12, y - 0.12, -40.62, x + 0.12, y + 0.12, -40.4, FOAM);
      quad(2.4, 0.45, M.atlas, 7.0, 5.72, -40.44, 0, 0, 0xffffff, AT(A.caption));
    }, null, 0, { floor: false }));
    { const g = new THREE.PlaneGeometry(11.6, 2.9); g.translate(7.0, 7.6, -40.43); const face = new THREE.Mesh(g, R.count.mat); face.name = 'countdown_face'; R.countWall.add(face); }
    R.countWall.userData = { ctl: R.count, set: (h, m, s) => { R.count.set(h, m, s); }, run: (k = 1) => { R.count.run(k); }, zero: (d) => { R.count.zero(d); } };
    mirrorOf(R.countWall);
    // Yes (Are you sure?): above the countdown (x 4…10, y 10.3…12.55; at the spec's x −13.4…−7.4 the tree's top and the
    // (−9, −31) column hide one half or the other from every view from the south)
    R.yes = P(part('yes_unsure', () => {
      bb(3.9, 10.2, -40.6, 10.1, 12.65, -40.5, NAVY);
      for (const [x, y] of [[3.9, 10.2], [10.1, 10.2], [3.9, 12.65], [10.1, 12.65]]) bb(x - 0.08, y - 0.08, -40.62, x + 0.08, y + 0.08, -40.46, FOAM);
    }, null, 0, { floor: false }));
    { const g = new THREE.PlaneGeometry(6.0, 2.25); const u = AT(A.yes), a = g.attributes.uv; for (let i = 0; i < 4; i++) { a.setX(i, a.getX(i) > 0.5 ? u[2] : u[0]); a.setY(i, a.getY(i) > 0.5 ? u[3] : u[1]); }
      g.translate(7.0, 11.425, -40.49); R.yesFace = new THREE.Mesh(g, M.atlasLit); R.yesFace.name = 'yes_unsure_face'; R.yes.add(R.yesFace); }
    R.yes.userData = { lit(on = true) { S.yesLit = !!on; R.yesFace.material = S.yesLit ? M.atlasLit : M.atlas; }, get on() { return S.yesLit; } };
    mirrorOf(R.yes);

    // ======================================================== the SafeSense meter over the choir (faces +X)
    R.meter = P(part('choir_meter', () => {
      cyl(0.78, 0.78, 0.08, 24, FOAM, 0, 0, -0.1, H); cyl(0.72, 0.72, 0.1, 24, WHITE, 0, 0, -0.04, H);
      bb(-0.3, 0.6, -0.08, -0.26, 0.72, -0.04, STEELD); bb(0.26, 0.6, -0.08, 0.3, 0.72, -0.04, STEELD); bb(-0.4, 0.68, -0.12, 0.4, 0.7, 0.0, STEELD);
    }, [-13.75, 3.6, -28.0], H, { floor: false }));
    { const g = new THREE.CircleGeometry(0.7, 28); g.translate(0, 0, 0.012); const m = new THREE.Mesh(g, M.meter); m.name = 'meter_dial'; R.meter.add(m); }
    { const g = new THREE.RingGeometry(0.56, 0.645, 20, 1, -0.524, 1.396); g.translate(0, 0, 0.018); const m = new THREE.Mesh(g, M.arc); m.name = 'meter_arc'; m.renderOrder = 2; R.meter.add(m); R.arc = m; }
    R.needle = part('meter_needle', () => { bb(-0.016, -0.08, 0.02, 0.016, 0.56, 0.032, 0xb02020); cyl(0.05, 0.05, 0.03, 12, 0x2a2e34, 0, 0, 0.03, H); }, [0, 0, 0], 0, { floor: false });
    R.meter.add(R.needle);
    R.meterK = { db: 39, to: 39, pulse: 0 };
    R.meter.userData = { level(db) { S.meterDb = db == null ? null : +db; }, get db() { return R.meterK.db; } };

    // ======================================================== tables: crackers + goggles, Secret Santa, morning tea; the desk
    // the cracker table: its origin 1 m up (world.puff('cracker_table') bursts at hand height)
    R.crackers = P(part('cracker_table', () => {
      const Y = -1.0;
      bb(-0.45, Y + 0.74, -1.5, 0.45, Y + 0.78, 1.5, CLOTH); bb(-0.44, Y + 0.02, -1.49, 0.44, Y + 0.74, 1.49, 0xeef0f2);
      bb(-0.01, Y + 0.78, -0.03, 0.01, Y + 0.9, 0.03, 0xc8ccd2);
      quad(0.4, 0.075, M.atlas, 0.012, Y + 0.86, 0, H, 0, 0xffffff, AT(A.goggles)); quad(0.4, 0.075, M.atlas, -0.012, Y + 0.86, 0, -H, 0, 0xffffff, AT(A.goggles));
    }, [-12.0, 1.0, -20.5], 0));
    mirrorOf(R.crackers);
    {
      const r = rng(24), pos = [];
      const layer = (n, y, z0) => { for (let k = 0; k < n; k++) pos.push([(r() - 0.5) * 0.1, y, z0 + 0.068 * k, H + (r() - 0.5) * 0.24, 1]); };
      layer(12, -1.0 + 0.812, -1.35); layer(8, -1.0 + 0.866, -1.25); layer(4, -1.0 + 0.918, -1.12);
      const g = new THREE.CylinderGeometry(0.03, 0.03, 0.32, 8, 8, false), p = g.attributes.position;
      for (let i = 0; i < p.count; i++) { const y = p.getY(i), k = Math.abs(Math.abs(y) - 0.12) < 0.01 ? 0.55 : 1; p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k); }
      g.rotateX(H);   // along local Z; the instance yaw lays it across the table
      R.cr = instanced(g, M.cracker, pos); R.cr.name = 'crackers'; R.crackers.add(R.cr); R.crPos = pos;
      const gg = shapeGeo(() => {
        bb(-0.08, 0, -0.03, 0.08, 0.035, 0.03, 0xd8eef8); bb(-0.075, 0.035, -0.024, 0.075, 0.042, 0.024, 0xeef8ff);
        bb(-0.11, 0.005, -0.004, -0.08, 0.025, 0.004, 0x2a5a8a); bb(0.08, 0.005, -0.004, 0.11, 0.025, 0.004, 0x2a5a8a);
        bb(-0.11, 0.005, -0.12, -0.1, 0.025, -0.004, 0x2a5a8a); bb(0.1, 0.005, -0.12, 0.11, 0.025, -0.004, 0x2a5a8a); bb(-0.11, 0.005, -0.13, 0.11, 0.025, -0.12, 0x2a5a8a);
      });
      const gp = []; for (let k = 0; k < 12; k++) gp.push([k % 2 ? 0.2 : -0.2, -1.0 + 0.78, 0.22 + 0.21 * (k >> 1), 0, 1]);
      R.gog = instanced(gg, M.goggle, gp); R.gog.name = 'goggles'; R.crackers.add(R.gog); R.gogPos = gp;
    }
    R.crackers.userData = {
      pull(i) { if (i >= 0 && i < 24) { S.pulled[i] = true; crackerMx(i); } },
      goggles(i, on = false) { if (i >= 0 && i < 12) { S.gog[i] = !!on; gogMx(i); } },
      reset() { S.pulled.fill(false); S.gog.fill(true); for (let i = 0; i < 24; i++) crackerMx(i); for (let i = 0; i < 12; i++) gogMx(i); },
      left() { let n = 0; for (let i = 0; i < 24; i++) if (!S.pulled[i]) n++; return n; },
    };
    // the Secret Santa table: white skirt, the PRE-SCREENED ribbon, 20 identical parcels
    R.santa = P(part('santa_table', () => {
      bb(-1.6, 0.76, -0.5, 1.6, 0.8, 0.5, CLOTH); bb(-1.58, 0.02, -0.48, 1.58, 0.76, 0.48, 0xf4f6f8);
      for (const s of [-1, 1]) {
        bb(-1.6, 0.46, s * 0.48, 1.6, 0.6, s * 0.495, SSD);
        for (const x of [-0.8, 0.8]) quad(0.9, 0.11, M.atlas, x, 0.53, s * 0.497, s > 0 ? 0 : PI, 0, 0xffffff, AT(A.ribbon));
        boxR(0.24, 0.12, 0.03, SSD, -0.12, 0.6, s * 0.5, 0, 0, 0.5); boxR(0.24, 0.12, 0.03, SSD, 0.12, 0.6, s * 0.5, 0, 0, -0.5); bb(-0.04, 0.55, s * 0.49, 0.04, 0.65, s * 0.515, 0x3a7aa8);
      }
    }, [3.5, 0, -33.6]));
    mirrorOf(R.santa);
    {
      const g = new THREE.BoxGeometry(0.24, 0.12, 0.18), parts = [g.toNonIndexed()]; g.dispose();
      for (const s of [-1, 1]) { const bw = new THREE.BoxGeometry(0.07, 0.04, 0.03); bw.rotateZ(s * 0.5); bw.translate(s * 0.035, 0.075, 0); const n = bw.toNonIndexed(); bw.dispose(); parts.push(uvAll(n, 0.5, 0.5)); }
      const gm = mergeGeometries(parts); for (const q of parts) q.dispose();
      R.gifts = instanced(gm, M.gift, GIFTS.map((G) => [G.at[0] - 3.5, G.at[1], G.at[2] + 33.6, 0, 1])); R.gifts.name = 'gifts'; R.santa.add(R.gifts);
      R.parcel = new THREE.Mesh(gm, M.gift); R.parcel.name = 'gift_parcel'; R.parcel.visible = false; root.add(R.parcel);
    }
    // Luke's invitation: a hidden card (0.15 × 0.105) at home under the root, for a hand: hold(who, on = true, hand = 'R')
    // puts it in that grip as 3.1 holds it (face out), home() / hold(who, false) back here hidden; actor.hold works too
    R.invite = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.105, 0.004), M.invite); R.invite.name = 'invite'; R.invite.visible = false; root.add(R.invite);
    R.invite.userData = {
      hold(who, on = true, hand = 'R') {
        const c = R.invite; if (!on) { R.invite.userData.home(); return; }
        const a = typeof world !== 'undefined' && world.actor ? world.actor(who) : null;
        const g = a && a.rig && ((a.rig.attach && a.rig.attach[hand === 'L' ? 'gripL' : 'gripR']) || (a.rig.parts && a.rig.parts[hand === 'L' ? 'handL' : 'handR']));
        if (!g) return;
        g.add(c); c.position.set(0, -0.07, 0.04); c.rotation.set(0, -H, 0); c.visible = true;
      },
      home() { const c = R.invite; if (c.parent !== R.root && R.root) R.root.add(c); c.position.set(0, -40, 0); c.rotation.set(0, 0, 0); c.visible = false; },
    };
    R.santa.userData = {
      take(i) { if (i >= 0 && i < 20) { S.taken[i] = true; giftMx(i); } },
      put(i) { if (i >= 0 && i < 20) { S.taken[i] = false; giftMx(i); } },
      left() { let n = 0; for (let i = 0; i < 20; i++) if (!S.taken[i]) n++; return n; },
      slot(i, out) { const G = GIFTS[i] || GIFTS[0]; if (out && out.isVector3) out.set(G.at[0], G.at[1], G.at[2]); else if (out) { out[0] = G.at[0]; out[1] = G.at[1]; out[2] = G.at[2]; } return out; },
      reset() { S.taken.fill(false); for (let i = 0; i < 20; i++) giftMx(i); },
    };
    // morning tea: the urn (= the kettle), 16 pre-screened mince pies on two trays, cups and saucers, napkins, a tent card
    R.tea = P(part('tea_table', () => {
      bb(-1.5, 0.74, -0.45, 1.5, 0.78, 0.45, CLOTH); bb(-1.48, 0.02, -0.43, 1.48, 0.74, 0.43, 0xeef0f2);
      bb(-1.35, 0.78, -0.2, -0.55, 0.795, 0.2, SILVER); bb(-0.45, 0.78, -0.2, 0.35, 0.795, 0.2, SILVER);
      for (const [x, z] of [[0.5, -0.25], [0.5, -0.05]]) { cyl(0.075, 0.075, 0.012, 10, 0xffffff, x, 0.786, z); for (let k = 0; k < 4; k++) cyl(0.045, 0.038, 0.07, 10, 0xf8f8f8, x, 0.83 + k * 0.055, z); }
      for (let k = 0; k < 4; k++) { const x = 0.42 + (k % 2) * 0.18, z = 0.12 + (k >> 1) * 0.16; cyl(0.07, 0.07, 0.01, 10, 0xffffff, x, 0.785, z); cyl(0.045, 0.038, 0.07, 10, 0xf8f8f8, x, 0.825, z); }
      bb(0.68, 0.78, -0.33, 0.84, 0.82, -0.17, 0xffffff);
      quad(0.36, 0.09, M.atlas, -0.15, 0.86, 0.32, 0, 0, 0xffffff, AT(A.tent)); bb(-0.32, 0.78, 0.305, 0.02, 0.81, 0.315, 0xd8dce2);
    }, [12.5, 0, -16.0]));
    mirrorOf(R.tea);
    R.urn = part('tea_urn', () => {
      cyl(0.15, 0.17, 0.06, 14, STEELD, 0, 0.03, 0); cyl(0.165, 0.165, 0.42, 14, STEEL, 0, 0.27, 0); cyl(0.14, 0.165, 0.05, 14, STEEL, 0, 0.505, 0);
      cyl(0.03, 0.03, 0.05, 8, 0x1a1c20, 0, 0.55, 0); bb(-0.02, 0.1, 0.15, 0.02, 0.15, 0.22, STEELD); bb(-0.012, 0.07, 0.2, 0.012, 0.1, 0.215, STEELD);
      bb(-0.08, 0.0, 0.14, 0.08, 0.02, 0.26, STEELD); boxR(0.2, 0.03, 0.03, 0x1a1c20, 0, 0.4, 0, 0, 0, 0);
      quad(0.03, 0.03, M.glow, 0.07, 0.32, 0.166, 0, 0, 0x5ae08a);
    }, [1.1, 0.78, 0], 0, { floor: false });
    R.tea.add(R.urn);
    {
      const g = new THREE.CylinderGeometry(0.045, 0.038, 0.028, 12), pos = [];
      for (const x0 of [-1.35, -0.45]) for (let k = 0; k < 8; k++) pos.push([x0 + 0.1 + 0.2 * (k % 4), 0.81, (k >> 2) ? 0.1 : -0.1, (k * 0.9) % TAU, 1]);
      R.pies = instanced(g, M.pie, pos); R.pies.name = 'mince_pies'; R.tea.add(R.pies); R.piePos = pos;
    }
    R.tea.userData = {
      pie(i) { if (i >= 0 && i < 16) { S.pies[i] = true; pieMx(i); } },
      steam() { if (typeof world !== 'undefined' && world.puff && !skipping()) world.puff(STEAM_AT, { n: 16, speed: 0.25, life: 1.8, color: 0xf2f2f2 }); snd('steam', 0.3, 1, STEAM_AT); },
      reset() { S.pies.fill(false); for (let i = 0; i < 16; i++) pieMx(i); },
      left() { let n = 0; for (let i = 0; i < 16; i++) if (!S.pies[i]) n++; return n; },
    };
    // the lanyard desk: LANYARD REQUESTS · please allow 6–8 weeks on acrylic, a tray of empty hooks, a stool behind
    R.desk = P(part('lanyard_desk', () => {
      bb(13.0, 0, -28.2, 13.8, 1.0, -25.8, WHITE); bb(12.95, 1.0, -28.25, 13.85, 1.05, -25.75, 0xe4e8ec);
      bb(13.8, 0.72, -28.1, 14.15, 0.76, -25.9, 0xe4e8ec); bb(12.98, 0.05, -28.2, 13.0, 0.95, -25.8, SHAD);
      // the acrylic desk sign (LANYARD REQUESTS · please allow 6–8 weeks) on its stand at the desk's north end
      bb(13.02, 1.05, -28.16, 13.12, 1.07, -27.34, STEEL); bb(13.06, 1.07, -28.14, 13.08, 1.5, -27.36, 0xdcecf4);
      quad(0.76, 0.38, M.atlas, 13.055, 1.27, -27.75, -H, 0, 0xffffff, AT(A.lanyard));
      quad(0.8, 0.15, M.atlas, 12.975, 0.78, -27.0, -H, 0, 0xffffff, AT(A.caption));
      bb(13.2, 1.05, -26.6, 13.6, 1.07, -26.0, STEELD); bb(13.38, 1.07, -26.58, 13.42, 1.32, -26.54, STEEL); bb(13.38, 1.3, -26.58, 13.42, 1.32, -26.02, STEEL);
      for (let k = 0; k < 6; k++) bb(13.37, 1.22, -26.52 + k * 0.09, 13.43, 1.31, -26.51 + k * 0.09, STEEL);
      bb(13.5, 1.05, -28.0, 13.56, 1.4, -27.5, 0x1a1c20); bb(13.52, 1.05, -27.9, 13.7, 1.07, -27.6, 0x2a2c30);
      cyl(0.2, 0.2, 0.05, 10, 0x2a2e34, 14.6, 0.68, -27.0); cyl(0.03, 0.03, 0.66, 6, STEELD, 14.6, 0.33, -27.0); cyl(0.22, 0.22, 0.03, 10, STEELD, 14.6, 0.015, -27.0);
    }));
    mirrorOf(R.desk);

    // ======================================================== the staff lifts (east wall): steel doors, scrolling indicators
    R.lifts = P(part('staff_lifts', () => {
      for (const c of LIFTS) {
        bb(17.5, 0, c - 0.75, 17.6, 2.7, c + 0.75, STEEL); bb(17.47, 0, c - 0.6, 17.5, 2.4, c + 0.6, 0xc4cad2); bb(17.465, 0, c - 0.01, 17.47, 2.4, c + 0.01, STEELD);
        bb(17.47, 2.47, c - 0.56, 17.5, 2.63, c + 0.56, 0x0c1016);
        quad(1.04, 0.13, M.ind, 17.465, 2.55, c, -H);
      }
      for (const z of [-32.0, -22.0]) quad(0.2, 0.3, M.atlas, 17.585, 1.2, z, -H, 0, 0xffffff, AT(A.call));
    }));
    mirrorOf(R.lifts);

    // ======================================================== the Quiet Corner: padded partitions, beanbag, poster, lamp, plant
    R.quiet = P(part('quiet_corner', () => {
      bb(-17.6, 0, -16.45, -13.2, 2.0, -16.35, FOAM); bb(-13.25, 0, -16.45, -13.15, 2.0, -13.6, FOAM);
      cyl(0.07, 0.07, 4.4, 8, FOAM, -15.4, 2.0, -16.4, 0, H); cyl(0.07, 0.07, 2.85, 8, FOAM, -13.2, 2.0, -15.03, H);
      for (let x = -17.0; x < -13.3; x += 0.6) bb(x - 0.015, 0.05, -16.47, x + 0.015, 1.95, -16.33, SEAM);
      for (let z = -15.8; z < -13.7; z += 0.6) bb(-13.27, 0.05, z - 0.015, -13.13, 1.95, z + 0.015, SEAM);
      bb(-17.2, 0, -15.9, -14.1, 0.012, -12.3, 0xd8e4ec);
      ico(0.6, 0xeee2c8, -15.8, 0.3, -14.4, 0.55, undefined, 1); ico(0.34, 0xe6d8bc, -15.95, 0.5, -14.6, 0.7, undefined, 1);
      quad(0.6, 0.9, M.atlas, -15.4, 1.4, -16.34, 0, 0, 0xffffff, AT(A.poster));
      cyl(0.16, 0.18, 0.03, 10, 0x2a2e34, -17.1, 0.015, -15.9); cyl(0.015, 0.015, 1.5, 6, STEELD, -17.1, 0.77, -15.9);
      cyl(0.16, 0.22, 0.26, 10, 0xfff0d0, -17.1, 1.6, -15.9, 0, 0, M.glow);
      cyl(0.18, 0.15, 0.36, 8, 0xe8eaee, -13.75, 0.18, -15.95); ico(0.3, 0x4a8a50, -13.75, 0.62, -15.95, 1.3); ico(0.22, 0x5a9a5a, -13.65, 0.85, -15.85, 1.2); ico(0.18, 0x3a7a44, -13.85, 0.92, -16.05, 1.2);
    }));
    mirrorOf(R.quiet);

    // ======================================================== speed gates (open), padded tops, SafeSense strips
    R.gates = P(part('speed_gates', () => {
      for (const x of GATES) {
        bb(x - 0.12, 0, -15.6, x + 0.12, 1.0, -14.4, 0xdde1e6); bb(x - 0.14, 1.0, -15.62, x + 0.14, 1.07, -14.38, FOAM);
        for (const s of [-1, 1]) { bb(x + s * 0.121, 0.55, -15.5, x + s * 0.124, 0.9, -14.5, 0x9aa2aa); bb(x + s * 0.12, 0.95, -15.55, x + s * 0.126, 0.98, -14.45, SS, M.glow); }
        bb(x - 0.07, 1.07, -15.2, x + 0.07, 1.075, -15.0, 0x2a2e34); quad(0.1, 0.1, M.glow, x, 1.077, -15.1, 0, -H, 0x7ec4f0);
      }
    }));
    mirrorOf(R.gates);

    // ======================================================== the entrance doors (two sliding glass leaves) and their collider
    const leaf = (name, s) => {
      const g = part(name, () => {
        bb(-1.0, 0, -0.03, 1.0, 0.06, 0.03, MULL); bb(-1.0, 2.5, -0.03, 1.0, 2.56, 0.03, MULL); bb(-s * 1.0, 0, -0.03, -s * 0.95, 2.56, 0.03, MULL);
        bb(s * 0.93, 0, -0.06, s * 1.0, 2.56, 0.06, FOAM);
        bb(-s * 0.7, 0.95, -0.07, -s * 0.66, 1.25, -0.03, STEEL); bb(-s * 0.7, 0.95, 0.03, -s * 0.66, 1.25, 0.07, STEEL);
        quad(1.9, 2.44, M.glass, 0, 1.28, 0);
      }, [s * 1.0, 0, -11.32], 0, { floor: false });
      return g;
    };
    R.doors = P(new THREE.Group()); R.doors.name = 'entrance_doors';
    R.leafL = leaf('door_leaf_l', -1); R.leafR = leaf('door_leaf_r', 1); R.doors.add(R.leafL, R.leafR);
    R.doors.traverse((o) => { if (o.isMesh && o.material === M.glass) o.userData.noOcclude = true; });
    R.colDoor = [-2.0, -11.4, 2.0, -11.0];
    R.doors.userData = { open(u = 1) { S.doorTo = clamp01(+u); if (skipping()) S.doorU = S.doorTo; else if (S.doorTo !== S.doorU) snd('door_slide', 0.45, 1.0, [0, 1.2, -11.2]); }, get u() { return S.doorU; } };

    // ======================================================== the service lift: frame, the steel leaf, the reader, the car
    R.svc = P(part('svc_lift', () => {
      bb(-6.05, 0, -40.6, -5.8, 2.65, -40.53, STEEL); bb(-4.2, 0, -40.6, -3.95, 2.65, -40.53, STEEL); bb(-6.05, 2.4, -40.6, -3.95, 2.65, -40.53, STEEL);
      bb(-6.1, 0, -40.62, -6.0, 2.7, -40.5, FOAM); bb(-4.0, 0, -40.62, -3.9, 2.7, -40.5, FOAM);
    }));
    R.svcLeaf = part('svc_leaf', () => {
      box(1.6, 2.4, 0.06, 0xffffff, 0, 0, 0, 0, M.steel);
      bb(-0.8, 0, -0.035, 0.8, 0.08, 0.035, STEELD); bb(0.74, 0.9, 0.03, 0.78, 1.3, 0.05, STEELD);
    }, [-5.0, 0, -40.72], 0);
    R.svc.add(R.svcLeaf);
    R.colSvc = [-5.8, -40.8, -4.2, -40.6];
    R.svc.userData = { open(u = 1) { S.svcTo = clamp01(+u); if (skipping()) S.svcU = S.svcTo; else if (S.svcTo !== S.svcU) snd('door_slide', 0.4, 0.8, [-5.0, 1.2, -40.6]); }, get u() { return S.svcU; } };
    R.reader = P(part('svc_reader', () => {
      bb(-3.66, 1.04, -40.6, -3.44, 1.36, -40.555, 0x25282d);
      quad(0.18, 0.27, M.atlas, -3.55, 1.2, -40.552, 0, 0, 0xffffff, AT(A.reader));
    }, null, 0, { floor: false }));
    { const g = new THREE.PlaneGeometry(0.075, 0.022); g.translate(-3.55, 1.31, -40.548); R.led = new THREE.Mesh(g, M.led); R.led.name = 'reader_led'; R.reader.add(R.led); }
    R.readerK = { flash: 0 };
    R.reader.userData = {
      set(s) { S.reader = s === 'green' ? 'green' : 'red'; },
      beep() { R.readerK.flash = skipping() ? 0 : 0.18; snd('beep', 0.4, S.reader === 'green' ? 1.3 : 0.9, [-3.55, 1.2, -40.5]); },
      get state() { return S.reader; },
    };
    R.car = P(part('lift_car', () => {
      quad(0.22, 0.44, M.panel, -3.945, 1.25, -41.15, -H);
      quad(0.3, 0.3, M.pa, -5.0, 2.495, -41.9, 0, H);
      bb(-5.8, 2.49, -42.8, -4.2, 2.5, -42.3, 0x8a9098); bb(-5.8, 2.49, -41.5, -4.2, 2.5, -41.0, 0x8a9098); cyl(0.2, 0.2, 0.012, 16, 0x8a9098, -5.0, 2.494, -41.9);
    }, null, 0, { floor: false }));
    { const g = new THREE.PlaneGeometry(1.5, 0.42), g2 = g.clone(); g.rotateX(H); g.translate(-5.0, 2.488, -42.55); g2.rotateX(H); g2.translate(-5.0, 2.488, -41.25);
      const gm = mergeGeometries([g, g2]); g.dispose(); g2.dispose(); R.carLight = new THREE.Mesh(gm, M.carLight); R.carLight.name = 'lift_car_light'; R.car.add(R.carLight); }
    { const g = new THREE.RingGeometry(0.15, 0.2, 20); g.rotateX(H); g.translate(-5.0, 2.485, -41.9); R.spkRing = new THREE.Mesh(g, M.spk); R.spkRing.name = 'lift_speaker_glow'; R.spkRing.renderOrder = 2; R.car.add(R.spkRing); }
    R.car.userData = {
      light(on = true) { S.carLight = !!on; R.carLight.visible = S.carLight; },
      speaker(k) { S.spk = clamp01(+k || 0); S.spkT = 1.0; },
      panel(fl) { const s = fl == null ? '' : String(fl); if (S.panel === s) return; S.panel = s; repaintPanel(); },
    };

    // ======================================================== corner foam guards (IM): tables, desk, risers, partitions, gates
    {
      const g = shapeGeo(() => { bb(-0.06, 0, -0.06, 0.06, 1, 0.06, FOAM); bb(-0.065, 0.48, -0.065, 0.065, 0.52, 0.065, SEAM); });
      const L = [], cn = (x0, z0, x1, z1, y, h) => { for (const [x, z] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) L.push([x, y, z, 0, [1, h, 1]]); };
      cn(-12.45, -22.0, -11.55, -19.0, 0, 0.78); cn(11.0, -16.45, 14.0, -15.55, 0, 0.78); cn(1.9, -34.1, 5.1, -33.1, 0, 0.8);
      L.push([12.98, 0, -28.2, 0, [1, 1.05, 1]], [12.98, 0, -25.8, 0, [1, 1.05, 1]]);
      L.push([-13.0, 0, -31.0, 0, [1, 0.3, 1]], [-13.0, 0, -25.0, 0, [1, 0.3, 1]], [-14.2, 0, -31.0, 0, [1, 0.6, 1]], [-14.2, 0, -25.0, 0, [1, 0.6, 1]]);
      L.push([-13.2, 0, -16.4, 0, [1.3, 2.05, 1.3]], [-13.2, 0, -13.6, 0, [1.3, 2.05, 1.3]]);
      for (const x of GATES) for (const z of [-15.6, -14.4]) for (const s of [-1, 1]) L.push([x + s * 0.12, 0, z, 0, [0.6, 1.0, 0.6]]);
      for (const s of [-1, 1]) for (const y of [4.12, 8.62]) for (const z of [-40.5, -11.5]) L.push([s * 13.56, y, z, 0, [1.4, 0.45, 1.4]]);
      for (const x of [-17.55, 17.55]) for (const z of [-40.55, -11.45]) L.push([x, 0, z, 0, [1, 2.2, 1]]);
      L.push([-5.95, 0, -40.5, 0, [1, 2.7, 1]], [-4.05, 0, -40.5, 0, [1, 2.7, 1]]);
      for (const c of LIFTS) for (const s of [-1, 1]) L.push([17.53, 0, c + s * 0.75, 0, [0.6, 2.7, 0.6]]);
      R.foam = instanced(g, M.foamIM, L); R.foam.name = 'corner_foam'; root.add(R.foam); mirrorOf(R.foam);
    }

    // ======================================================== the staff: choir + crowd (body, base, head, chip light; IM)
    figures(root, mirrorOf);

    // ======================================================== outside: Ann St, the forecourt, the canopy, the podium faces
    exterior(root);

    // ======================================================== the tower above the podium and the Valley around it
    tower(root);

    // ======================================================== the floor mirror: the static interior and figures, y -> -y
    {
      const mir = new THREE.Group(); mir.name = 'floor_mirror'; mir.scale.y = -1; mir.userData.noOcclude = true; root.add(mir); R.mirror = mir;
      root.updateMatrixWorld(true);
      const add = (src) => {
        let c;
        if (src.isInstancedMesh) { c = new THREE.InstancedMesh(src.geometry, src.material, src.count); c.instanceMatrix = src.instanceMatrix; if (src.instanceColor) c.instanceColor = src.instanceColor; c.frustumCulled = false; }
        else c = new THREE.Mesh(src.geometry, src.material);
        c.matrixAutoUpdate = false; c.matrix.copy(src.matrixWorld); c.userData.noOcclude = true; mir.add(c);
      };
      for (const g of R.mirrorSrc) {
        if (g.isMesh) { add(g); continue; }
        g.traverse((o) => { if (o.isMesh && o.material !== M.glass && o.material !== M.floor && o.material !== M.arc && o.material !== M.spk) add(o); });
      }
      mir.updateMatrixWorld(true);
    }

    // ======================================================== colliders (spec §2.4)
    COL.push([-18.0, -11.4, -2.0, -11.0], [2.0, -11.4, 18.0, -11.0], R.colDoor,
      [-18.0, -41.0, -17.6, -11.0], [17.6, -41.0, 18.0, -11.0],
      [-18.0, -41.0, -5.8, -40.6], [-4.2, -41.0, 18.0, -40.6], R.colSvc,
      [-6.3, -43.2, -6.1, -40.8], [-3.9, -43.2, -3.7, -40.8], [-6.3, -43.2, -3.7, -43.0],
      [-8.6, -35.6, -1.4, -32.4], [-6.6, -37.6, -3.4, -30.4],
      [-9.7, -19.7, -8.3, -18.3], [8.3, -19.7, 9.7, -18.3], [-9.7, -31.7, -8.3, -30.3], [8.3, -31.7, 9.7, -30.3],
      [1.9, -34.1, 5.1, -33.1], [-12.45, -22.0, -11.55, -19.0], [11.0, -16.45, 14.0, -15.55],
      [13.0, -28.6, 17.6, -25.4], [-17.6, -31.0, -12.0, -25.0],
      [-17.6, -16.5, -13.2, -16.3], [-13.3, -16.5, -13.1, -13.6],
      [-10.4, -11.0, -10.0, -7.2], [10.0, -11.0, 10.4, -7.2], [-40, -7.5, -2, -7.2], [2, -7.5, 40, -7.2],
      [-2.3, -7.2, -2.0, 7.2], [2.0, -7.2, 2.3, 7.2], [-2.0, 7.2, 2.0, 7.5],
      [-11.35, -9.75, -11.05, -9.45], [11.05, -9.75, 11.35, -9.45]);
    for (const x of GATES) COL.push([x - 0.12, -15.6, x + 0.12, -14.4]);
    for (let i = 0; i < 12; i++) { const [x, , z] = CROWD[i]; COL.push([x - 0.25, z - 0.25, x + 0.25, z + 0.25]); }

    applyState();
    if (SETVIEW() && typeof window !== 'undefined' && window.TWO_TEST) {   // set inspection helpers (tools/setshots, dev)
      window.TWO_TEST.dress = (s) => dress(s);
      window.TWO_TEST.call = (prop, fn, ...a) => { const p = world.prop(prop); return p && p.userData[fn] ? p.userData[fn](...a) : undefined; };
    }
    b = null; XF = null; GL = null;
    return root;
  }

  // ---------------------------------------------------------- the staff figures (shared shapes, two prop groups)
  let FIG = null;
  function figGeos() {
    if (FIG) return FIG;
    FIG = {};
    FIG.base = shapeGeo(() => {   // legs, shoes, hands, neck, the lanyard (fixed colours)
      for (const s of [-1, 1]) { bb(s * 0.17, 0.06, -0.085, s * 0.02, 0.86, 0.085, 0x34383f); bb(s * 0.17, 0, -0.1, s * 0.02, 0.07, 0.16, 0x1a1a1c); bb(s * 0.33, 0.78, -0.04, s * 0.25, 0.9, 0.05, SKIN); }
      bb(-0.05, 1.42, -0.05, 0.05, 1.52, 0.05, SKIN);
      boxR(0.014, 0.3, 0.01, 0x4a8ab8, -0.06, 1.3, 0.122, 0, 0, -0.22); boxR(0.014, 0.3, 0.01, 0x4a8ab8, 0.06, 1.3, 0.122, 0, 0, 0.22);
      bb(-0.04, 1.06, 0.118, 0.04, 1.16, 0.128, 0xffffff); bb(-0.04, 1.14, 0.119, 0.04, 1.16, 0.129, 0x4a8ab8);
    });
    FIG.clothes = shapeGeo(() => {   // torso + arms (white: the instance colour is the clothing)
      bb(-0.2, 0.84, -0.115, 0.2, 1.44, 0.115, 0xffffff); bb(-0.22, 1.3, -0.12, 0.22, 1.46, 0.12, 0xf4f4f4);
      for (const s of [-1, 1]) bb(s * 0.33, 0.88, -0.06, s * 0.21, 1.44, 0.07, 0xf0f0f0);
    });
    {   // the head: the face on the +Z side (T.face u 0..0.75), everything else on the texture's white column
      const pb = b, px = XF, pt = tint, pg = GL; b = new Builder(); XF = null; tint = ONE; GL = [];
      const hd = new THREE.BoxGeometry(0.2, 0.24, 0.22), uv = hd.attributes.uv;
      for (let i = 0; i < uv.count; i++) { if (i >= 16 && i < 20) uv.setXY(i, uv.getX(i) * 0.75, uv.getY(i) * 0.94); else uv.setXY(i, 0.94, 0.5); }
      hd.translate(0, 0.14, 0); put(hd, 0xffffff, M.face);
      const add = (g, hex) => { uvAll(g, 0.94, 0.5); put(g, hex, M.face); };
      { const g = new THREE.BoxGeometry(0.215, 0.07, 0.235); g.translate(0, 0.27, -0.005); add(g, 0x5a3a26); }
      { const g = new THREE.BoxGeometry(0.215, 0.16, 0.05); g.translate(0, 0.17, -0.095); add(g, 0x5a3a26); }
      { const g = new THREE.BoxGeometry(0.24, 0.025, 0.035); g.translate(0, 0.3, 0); add(g, 0x3a2a20); }
      for (const s of [-1, 1]) {
        { const g = new THREE.BoxGeometry(0.024, 0.2, 0.024); g.rotateZ(-s * 0.35); g.translate(s * 0.1, 0.39, 0); add(g, ANTLER); }
        { const g = new THREE.BoxGeometry(0.018, 0.09, 0.018); g.rotateZ(-s * 1.0); g.translate(s * 0.15, 0.42, 0); add(g, ANTLER); }
        { const g = new THREE.BoxGeometry(0.018, 0.08, 0.018); g.rotateZ(s * 0.3); g.translate(s * 0.09, 0.47, 0.01); add(g, ANTLER); }
      }
      const gr = b.done({ floor: false }); b = pb; XF = px; tint = pt; GL = pg;
      FIG.head = gr.children[0].geometry;
    }
    FIG.chip = new THREE.BoxGeometry(0.022, 0.03, 0.022); FIG.chip.translate(-0.108, 0.13, -0.05);
    FIG.shadow = new THREE.PlaneGeometry(0.75, 0.75); FIG.shadow.rotateX(-H);
    return FIG;
  }
  function figures(root, mirrorOf) {
    const G = figGeos(), r = rng(2040);
    const mk = (name, list) => {
      const grp = new THREE.Group(); grp.name = name; root.add(grp);
      const body = list.map((p) => [p[0], p[1], p[2], p[3], 1]);
      const im = (g, m, nm) => { const x = instanced(g, m, body); x.name = nm; x.instanceMatrix.setUsage(THREE.DynamicDrawUsage); x.frustumCulled = false; grp.add(x); return x; };
      const F = { grp, clothes: im(G.clothes, M.fig, name + '_clothes'), base: im(G.base, M.figBase, name + '_base'), head: im(G.head, M.face, name + '_heads'), chip: im(G.chip, M.chip, name + '_chips'), list: [] };
      for (let i = 0; i < list.length; i++) {
        const [x, y, z, ry] = list[i];
        F.clothes.setColorAt(i, tc.setHex(CLOTHES[(r() * CLOTHES.length) | 0]));
        F.head.setColorAt(i, tc.setHex(SKINS[(r() * SKINS.length) | 0]));
        F.list.push({ x, y, z, ry, s: 0.95 + r() * 0.1, lean: y > 1 ? 0.18 : 0, ph: r() * TAU, turn: 0, goal: 0, next: 1 + r() * 6, nod: -1, look: null });
      }
      F.clothes.instanceColor.needsUpdate = true; F.head.instanceColor.needsUpdate = true;
      return F;
    };
    R.choir = mk('choir', CHOIR); R.crowd = mk('crowd_staff', CROWD);
    R.choir.grp.userData = { hush(on = true) { S.hush = !!on; }, get hushed() { return S.hush; } };
    R.crowd.grp.userData = {
      nod(i) { const f = R.crowd.list[i]; if (f) f.nod = 0; },
      look(i, where) { const f = R.crowd.list[i]; if (f) f.look = where || null; },   // [x, z] (or null: back to idle)
      pos(i, out) { const f = R.crowd.list[i]; if (f && out) { if (out.isVector3) out.set(f.x, f.y, f.z); else { out[0] = f.x; out[1] = f.y; out[2] = f.z; } } return out; },
    };
    const sh = [];
    for (const p of CHOIR) sh.push([p[0], p[1] + 0.012, p[2], 0, 1]);
    for (const p of CROWD) sh.push([p[0], p[1] + 0.012, p[2], 0, 1]);
    R.figShadows = instanced(G.shadow, M.shadow, sh); R.figShadows.name = 'staff_shadows'; R.figShadows.renderOrder = 1; root.add(R.figShadows);
    poseFigures(R.choir, 0, 0, true); poseFigures(R.crowd, 0, 0, false);
  }

  // ---------------------------------------------------------- outside: Ann St (matches the valley's 2.8 street), the podium
  const CAR_LANES = [-5.25, -1.75, 1.75, 5.25];
  function exterior(root) {
    const onZebra = (x0, x1) => (x1 > -32.3 && x0 < -27.7) || (x1 > -2.3 && x0 < 2.3);
    R.street = part('ext_street', () => {
      DEFM = M.vc;
      ground(-120, -7, 120, 7, -0.10, M.road, 8);
      for (let x = -120; x < 120; x += 3) if (!onZebra(x, x + 1.6)) for (const z of [-3.5, 3.5]) bb(x, -0.1, z - 0.06, x + 1.6, -0.092, z + 0.06, 0x8a8a84);
      for (const [x0, x1] of [[-120, -32.3], [-27.7, -2.3], [2.3, 120]]) { for (const z of [-0.14, 0.14]) bb(x0, -0.1, z - 0.05, x1, -0.092, z + 0.05, 0x9a9070); for (const z of [-6.6, 6.6]) bb(x0, -0.1, z - 0.05, x1, -0.092, z + 0.05, 0x7a7a74); }
      for (const [x0, x1] of [[-32, -28], [-2, 2]]) {   // raised zebras, flush with the footpaths
        bb(x0, -0.12, -7, x1, -0.02, 7, 0x34353e);
        for (let z = -6.5; z < 6.6; z += 1.0) bb(x0 + 0.35, -0.02, z, x1 - 0.35, 0.0, z + 0.5, 0xd8d8d0);
        for (const sx of [x0 - 0.5, x1]) bb(sx, -0.1, -7, sx + 0.5, -0.06, 7, 0x2a2b32);
      }
      bb(-120, -0.14, -11, 120, -0.004, -7, 0x6a6a72); bb(-120, -0.14, 7, 120, -0.004, 11, 0x6a6a72);
      ground(-120, -11, 120, -7, 0, M.pave, 4); ground(-120, 7, 120, 11, 0, M.pave, 4);
      ground(-8, 11, 8, 110, 0, M.pave, 4); bb(-8.2, -0.5, 11, -8, 0.02, 110, 0x4a4a52); bb(8, -0.5, 11, 8.2, 0.02, 110, 0x4a4a52);
      bb(-2.6, 0, -11.0, 2.6, 0.012, -9.6, 0x4a4e56);
    }); root.add(R.street);
    // the podium's outer faces: stone to 13.5 with a dark glass band 4.5–9.0 (W, E, N); the south face is the atrium glass
    R.podium = part('podium', () => {
      DEFM = M.vc;
      const face = (f) => {   // f: 'W' | 'E' | 'N'
        const ry = f === 'W' ? -H : f === 'E' ? H : PI, w = f === 'N' ? 36 : 30, cx = f === 'W' ? -18.02 : f === 'E' ? 18.02 : 0, cz = f === 'N' ? -41.02 : -26.0;
        for (const [y0, y1] of [[0, 4.5], [9.0, 13.5]]) quad(w, y1 - y0, M.podium, cx, (y0 + y1) / 2, cz, ry, 0, 0xffffff, [0, y0 / 4, w / 4, y1 / 4]);
        quad(w, 4.5, M.vc, cx, 6.75, cz, ry, 0, 0x2a3644);
      };
      face('W'); face('E'); face('N');
      for (let z = -41; z <= -11; z += 2) { bb(-18.12, 4.5, z - 0.05, -18.0, 9.0, z + 0.05, 0x3a4048); bb(18.0, 4.5, z - 0.05, 18.12, 9.0, z + 0.05, 0x3a4048); }
      for (let x = -18; x <= 18; x += 2) bb(x - 0.05, 4.5, -41.12, x + 0.05, 9.0, -41.0, 0x3a4048);
      for (const y of [4.5, 9.0]) { bb(-18.14, y - 0.1, -41.1, -18.0, y + 0.1, -11.0, 0x3a4048); bb(18.0, y - 0.1, -41.1, 18.14, y + 0.1, -11.0, 0x3a4048); bb(-18.1, y - 0.1, -41.14, 18.1, y + 0.1, -41.0, 0x3a4048); }
    }); root.add(R.podium);
    // the canopy over the forecourt (padded leading edge, soffit lights, tie rods to the facade)
    R.canopy = part('canopy', () => {
      DEFM = M.vc;
      bb(-8, 5.0, -11.0, 8, 5.4, -8.0, 0xd8dce0);
      bb(-8.1, 4.95, -8.15, 8.1, 5.45, -7.9, FOAM); for (const s of [-1, 1]) bb(s * 8.12, 4.95, -11.0, s * 7.9, 5.45, -8.0, FOAM);
      for (let x = -7; x <= 7.01; x += 2) quad(0.5, 2.0, M.glow, x, 4.985, -9.6, 0, H, 0xf2ead4);
      for (const s of [-1, 1]) beam(s * 7.2, 5.4, -8.3, s * 6.0, 9.0, -11.0, 0.06, STEELD);
    }); root.add(R.canopy);
    // padded bollards: both kerbs (gaps at the zebras), the mall-head row
    const BOL = [];
    for (let x = -60; x <= 60; x += 2) if (!(x > -33 && x < -27) && !(x > -3 && x < 3)) BOL.push([x, 0, -7.35, 0], [x, 0, 7.35, 0]);
    for (let x = -6; x <= 6.01; x += 1.5) BOL.push([x, 0, 11.6, 0]);
    const bolGeo = shapeGeo(() => {
      cyl(0.1, 0.1, 0.9, 8, 0x5a6068, 0, 0.45, 0); cyl(0.2, 0.2, 0.74, 10, FOAM, 0, 0.43, 0);
      for (const y of [0.18, 0.43, 0.68]) cyl(0.205, 0.205, 0.03, 10, SEAM, 0, y, 0);
      cyl(0.13, 0.13, 0.1, 8, 0x3a3e44, 0, 0.85, 0); cyl(0.21, 0.21, 0.05, 10, 0x4a4e54, 0, 0.025, 0);
    });
    R.bollards = instanced(bolGeo, M.vc, BOL); R.bollards.name = 'ext_bollards'; root.add(R.bollards);
    // street lamps (6.5 m, arms over the road), foam-wrapped to 1.8 m
    const LAMP = [];
    for (const x of [-56, -40, -24, -8, 8, 24, 40, 56]) LAMP.push([Math.abs(x) === 8 ? x * 1.4 : x, 0, -9.6, 0, 1], [x, 0, 9.6, PI, 1]);   // N ±8 -> ±11.2: clear of the canopy
    const postGeo = shapeGeo(() => {
      cyl(0.16, 0.18, 0.2, 8, 0x3a3e44, 0, 0.1, 0); cyl(0.07, 0.09, 6.5, 8, 0x4a5058, 0, 3.25, 0);
      cyl(0.15, 0.15, 1.8, 10, FOAM, 0, 1.1, 0); for (const y of [0.5, 1.1, 1.7]) cyl(0.155, 0.155, 0.03, 10, SEAM, 0, y, 0);
      boxR(0.06, 0.06, 1.1, 0x4a5058, 0, 6.35, 0.5); boxR(0.3, 0.12, 0.5, 0x2a2e34, 0, 6.32, 1.05);
    });
    R.lampPosts = instanced(postGeo, M.vc, LAMP); R.lampPosts.name = 'ext_lamps'; root.add(R.lampPosts);
    const headGeo = new THREE.BoxGeometry(0.26, 0.04, 0.44); headGeo.translate(0, 6.25, 1.05);
    R.lampHeads = instanced(headGeo, M.lampHead, LAMP); R.lampHeads.name = 'ext_lamp_heads'; root.add(R.lampHeads);
    // hover-cars (body / underside glow / shadow): 2 m/s, yield at zebra E
    const carGeo = shapeGeo(() => {
      const BODY = 0xe8eaee, GLS = 0x3a4a5c;
      bb(-1.75, 0.1, -0.84, 1.75, 0.5, 0.84, BODY); bb(-1.95, 0.0, -0.74, 1.95, 0.14, 0.74, 0x6a7078);
      boxR(0.5, 0.36, 1.66, BODY, 1.85, 0.3, 0, 0, 0, 0.5); boxR(0.45, 0.36, 1.66, BODY, -1.85, 0.3, 0, 0, 0, -0.45);
      { const sh = new THREE.Shape(); sh.moveTo(-1.25, 0); sh.lineTo(1.2, 0); sh.lineTo(0.55, 0.42); sh.lineTo(-0.85, 0.42); sh.closePath();
        const eg = new THREE.ExtrudeGeometry(sh, { depth: 1.36, bevelEnabled: false }); eg.translate(0, 0.5, -0.68); put(eg, GLS); }
      bb(-0.8, 0.92, -0.6, 0.5, 0.95, 0.6, BODY);
      bb(1.98, 0.26, -0.6, 2.04, 0.34, -0.3, 0xfffbe8); bb(1.98, 0.26, 0.3, 2.04, 0.34, 0.6, 0xfffbe8);
      bb(-2.02, 0.28, -0.66, -1.96, 0.34, 0.66, 0xc83030);
    });
    R.CARS = [];
    for (let i = 0; i < 4; i++) { const lane = CAR_LANES[i], dir = lane < 0 ? 1 : -1; R.CARS.push({ x: -50 + i * 29, lane, dir, v: 2.0, wait: 0 }); }
    const CI = R.CARS.map((c) => [c.x, 0.32, c.lane, c.dir > 0 ? 0 : PI]);
    R.traffic = new THREE.Group(); R.traffic.name = 'ext_traffic'; root.add(R.traffic);
    R.carBody = instanced(carGeo, M.car, CI); R.carBody.name = 'traffic_body';
    const cols = [0xe8e8ec, 0x6a8ab8, 0xa8b0b8, 0x7aa08a];
    for (let i = 0; i < 4; i++) R.carBody.setColorAt(i, tc.setHex(cols[i]));
    R.carBody.instanceColor.needsUpdate = true;
    const glowGeo = new THREE.PlaneGeometry(4.0, 2.0); glowGeo.rotateX(-H); glowGeo.translate(0, -0.25, 0);
    R.carGlow = instanced(glowGeo, M.carGlow, CI); R.carGlow.name = 'traffic_glow';
    const shGeo = new THREE.PlaneGeometry(5.0, 2.4); shGeo.rotateX(-H);
    R.carShadow = instanced(shGeo, M.shadow, CI.map((p) => [p[0], -0.085, p[2], p[3]])); R.carShadow.name = 'traffic_shadow';
    for (const im of [R.carBody, R.carGlow, R.carShadow]) { im.instanceMatrix.setUsage(THREE.DynamicDrawUsage); im.frustumCulled = false; R.traffic.add(im); }
    R.traffic.userData = { stop(on = true) { S.traffic = !on; } };
  }

  // ---------------------------------------------------------- the tower and the Valley (shared builders), or a fallback
  function tower(root) {
    const V = SETS.valley;
    R.tower = R.sky = null;
    if (V && typeof V.tower === 'function' && typeof V.skyline === 'function') {
      try {
        R.tower = V.tower({ podium: 'none', drones: 12 }); root.add(R.tower);
        R.sky = V.skyline({ skip: ['TOWER', 'TRAFFIC'], sky: 'midday_storm', neon: 0.35 }); root.add(R.sky);
      } catch (e) {
        console.warn('TWO: hq_atrium: shared tower/skyline failed, using the fallback', e);
        if (R.tower) root.remove(R.tower); if (R.sky) root.remove(R.sky); R.tower = R.sky = null;
      }
    }
    if (!R.tower || !R.sky) fallbackTower(root);
    const fc = R.tower.userData.countdown;
    if (fc) { fc.set(1, 58, 0); fc.run(1); if (S.facadeSecs != null) fc.secs = S.facadeSecs; }
    if (R.tower.userData.lit) R.tower.userData.lit(0.15);
  }
  // a minimal countdown (only when SETS.valley is missing): the same API, painted with fillText once a second
  function miniCountdown(key) {
    const tex = canvasTex(256, 64, (c) => { c.fillStyle = '#04070d'; c.fillRect(0, 0, 256, 64); }, { key, nearest: true });
    const cx = tex.image.getContext('2d');
    const ctl = {
      tex, mat: basic(key, { map: tex, fog: false }), secs: 7080, rate: 1, shown: -1, yes: 0,
      set(h, m = 0, s = 0) { ctl.secs = h * 3600 + m * 60 + s; ctl.shown = -1; return ctl; },
      run(r = 1) { ctl.rate = r; return ctl; }, text() { return ctl; },
      zero() { ctl.secs = 0; ctl.rate = 0; ctl.shown = -1; return ctl; },
      update(dt) {
        if (ctl.rate && ctl.secs > 0) ctl.secs = Math.max(0, ctl.secs - dt * ctl.rate);
        const s = Math.ceil(ctl.secs - 1e-6);
        if (s === ctl.shown) return;
        ctl.shown = s;
        const p = (n) => (n < 10 ? '0' : '') + n;
        cx.fillStyle = '#04070d'; cx.fillRect(0, 0, 256, 64);
        text(cx, 'QUIET IN', 128, 11, 14, '#9fd4ff');
        cx.font = 'bold 38px "DejaVu Sans Mono", "Liberation Mono", monospace'; cx.fillStyle = '#e4f4ff'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
        cx.fillText(p(Math.floor(s / 3600)) + ':' + p(Math.floor(s / 60) % 60) + ':' + p(s % 60), 128, 42);
        tex.needsUpdate = true;
      },
    };
    ctl.update(0);
    return ctl;
  }
  function makeCountdown() {
    const V = SETS.valley;
    let c = null;
    if (V && typeof V.countdown === 'function') { try { c = V.countdown({ key: 'hqa_count_wall', label: 'QUIET IN' }); } catch (e) { c = null; } }
    if (!c) c = miniCountdown('hqa_count_wall_fb');
    c.set(1, 58, 0); c.run(1);
    if (S.countSecs != null) c.secs = S.countSecs;
    return c;
  }
  function fallbackTower(root) {
    if (R.tower) root.remove(R.tower); if (R.sky) root.remove(R.sky);
    const ctl = miniCountdown('hqa_count_facade_fb');
    const g = part('tower', () => {
      DEFM = M.vc;
      bb(-18, 13.5, -41, 18, 131, -11, 0x5f7484);
      for (let y = 17.5; y < 131; y += 4) bb(-18.05, y - 0.15, -41.05, 18.05, y + 0.15, -10.95, 0x9aa2aa);
      bb(-14, 131, -41, 14, 134, -35, 0x4a5058);
    }, null, 0, { floor: false });
    { const q = new THREE.PlaneGeometry(32, 8); q.translate(0, 112, -10.7); const m = new THREE.Mesh(q, ctl.mat); m.name = 'facade_countdown'; g.add(m); }
    { const yt = canvasTex(256, 96, (c) => { canvasTex.yes(c, 128 - 0.8 * 82, 7, 82, '#ffd21f'); }, { key: 'hqa_yes_fb' });
      const q = new THREE.PlaneGeometry(24, 8); q.translate(0, 138.2, -35.95); const m = new THREE.Mesh(q, basic('hqa_yes_fb', { map: yt, transparent: true, fog: false })); m.name = 'yes_sign'; g.add(m); }
    g.userData = { countdown: ctl, lit() {}, update(dt) { ctl.update(dt); } };
    root.add(g); R.tower = g;
    const sky = new THREE.Group(); sky.name = 'skyline';
    { const cg = new THREE.CylinderGeometry(480, 480, 120, 32, 1, true); cg.translate(0, 40, -20); const m = new THREE.Mesh(cg, M.horizon); m.frustumCulled = false; sky.add(m); }
    sky.userData = { update() {}, flash() {}, lit() {} };
    root.add(sky); R.sky = sky;
  }

  // ---------------------------------------------------------- prop state -> meshes (allocation-free)
  const UNIT = new THREE.Vector3(1, 1, 1);
  function imAt(im, i, p, hide) {
    if (hide) { m5.copy(ZERO); m5.setPosition(p[0], p[1], p[2]); }
    else { qv.setFromAxisAngle(yUp, p[3] || 0); m5.compose(pv.set(p[0], p[1], p[2]), qv, UNIT); }
    im.setMatrixAt(i, m5); im.instanceMatrix.needsUpdate = true;
  }
  const GPOS = GIFTS.map((G) => [G.at[0] - 3.5, G.at[1], G.at[2] + 33.6, 0]);
  function crackerMx(i) { if (R.cr) imAt(R.cr, i, R.crPos[i], S.pulled[i]); }
  function gogMx(i) { if (R.gog) imAt(R.gog, i, R.gogPos[i], !S.gog[i]); }
  function giftMx(i) { if (R.gifts) imAt(R.gifts, i, GPOS[i], S.taken[i]); }
  function pieMx(i) { if (R.pies) imAt(R.pies, i, R.piePos[i], S.pies[i]); }
  function repaintPanel() { const c = T.liftPanel.image.getContext('2d'); paintLiftPanel(c, S.panel); T.liftPanel.needsUpdate = true; }
  function placeDoors() {
    const e = smooth(S.doorU); R.leafL.position.x = -1.0 - 2.0 * e; R.leafR.position.x = 1.0 + 2.0 * e;
    const open = S.doorU >= 0.8, c = R.colDoor; c[0] = open ? 1e4 : -2.0; c[1] = -11.4; c[2] = open ? 1e4 + 4 : 2.0; c[3] = -11.0;
  }
  function placeSvc() {
    R.svcLeaf.position.x = -5.0 - 1.6 * smooth(S.svcU);
    const open = S.svcU >= 0.8, c = R.colSvc; c[0] = open ? 1e4 : -5.8; c[1] = -40.8; c[2] = open ? 1e4 + 1.6 : -4.2; c[3] = -40.6;
  }
  const GAIN_CRANE = 1.55;
  function interiorGain(k) {
    if (R.gain === k) return; R.gain = k;
    for (const m of [M.in, M.wrap, M.floor]) m.color.setScalar(k);
    for (const F of [R.choir, R.crowd]) if (F) for (const im of [F.clothes, F.base, F.head]) im.material.color.setScalar(k);
  }
  function applyState() {
    if (!R.root) return;
    for (let i = 0; i < 24; i++) crackerMx(i);
    for (let i = 0; i < 12; i++) gogMx(i);
    for (let i = 0; i < 20; i++) giftMx(i);
    for (let i = 0; i < 16; i++) pieMx(i);
    placeDoors(); placeSvc();
    R.carLight.visible = S.carLight;
    R.yesFace.material = S.yesLit ? M.atlasLit : M.atlas;
    R.ledHex = -1;
    repaintPanel();
    R.gain = -1; interiorGain(S.state === 'crane31' ? GAIN_CRANE : 1);
    R.paused = S.state === 'crane31';
  }
  // the scene's starting state (AUTO on 3.1; content may call SETS.hq_atrium.reset())
  function reset() {
    S.taken.fill(false); S.pulled.fill(false); S.gog.fill(true); S.pies.fill(false);
    S.doorTo = S.doorU = 0; S.svcTo = S.svcU = 0; S.reader = 'red'; S.panel = ''; S.carLight = false; S.spk = 0; S.spkT = -1;
    S.hush = false; S.meterDb = null; S.yesLit = true; S.traffic = true;
    S.countSecs = null; S.facadeSecs = null;
    if (R.count) { R.count.set(1, 58, 0); R.count.run(1); }
    const fc = R.tower && R.tower.userData.countdown; if (fc) { fc.set(1, 58, 0); fc.run(1); }
    for (const F of [R.choir, R.crowd]) if (F) for (const f of F.list) { f.turn = f.goal = 0; f.nod = -1; f.look = null; }
    applyState();
  }

  // ---------------------------------------------------------- the spot as a lamp (spec §3.4); re-asserted every tick while lit
  const LAMPS = {
    tree: { p: [-10.0, 11.0, -24.0], t: [3.0, 0.8, -32.5], a: 0.45, pen: 0.7, d: 30, c: 0xfff0d8, i: 1.5, gain: 40 },
    car: { p: [-5.0, 2.45, -41.9], t: [-5.0, 0.0, -41.9], a: 1.1, pen: 0.5, d: 4, c: 0xfff6e8, i: 1.4, gain: 6 },
  };
  function setLamp(name) {
    S.lamp = LAMPS[name] ? name : 'off'; R.lampOff = false;
    if (isCur() && S.lamp === 'off') world.torchAuto = true;
    holdLamp();
  }
  function lamp(name) { setLamp(name); S.lampUser = true; }
  function autoLamp() { if (!S.lampUser) setLamp(S.state === 'crane31' ? 'off' : S.state === 'lift31' && R.env === 'lift' ? 'car' : 'tree'); }
  function holdLamp() {
    if (!isCur()) return;
    const s = world.torch; if (!s) return;
    if (S.lamp === 'off') { if (!R.lampOff) { R.lampOff = true; s.intensity = 0; } return; }
    const L = LAMPS[S.lamp];
    world.torchAuto = false;
    s.position.set(L.p[0], L.p[1], L.p[2]); s.target.position.set(L.t[0], L.t[1], L.t[2]);
    s.angle = L.a; s.penumbra = L.pen; s.distance = L.d; s.color.setHex(L.c); s.intensity = L.i * L.gain;
  }

  // ---------------------------------------------------------- ambience by state (the AMBIENCE object is mutated in place)
  const AMBS = {
    party: { loops: ['atrium_air', 'crowd_polite', ['clink', 0.7]], room: 'atrium' },
    crane: { loops: ['wind_high', 'drone_swarm', ['thunder_far', 0.8]], room: 'none' },
    lift: { loops: ['lift_hum', ['crowd_polite', 0.12], ['atrium_air', 0.2]], room: 'small' },
  };
  const AMBIENCE = { rain: false, loops: AMBS.party.loops, room: 'atrium' };
  function ambience(key) {
    const a = AMBS[key]; AMBIENCE.loops = a.loops; AMBIENCE.room = a.room;
    if (R.amb === key) return; R.amb = key;
    if (isCur() && typeof AUDIO !== 'undefined' && AUDIO.ambience) { try { AUDIO.ambience({ rain: false, loops: a.loops }); if (AUDIO.setRoom) AUDIO.setRoom(a.room); } catch (e) { /* audio is optional */ } }
  }
  // the lift: inside (env lift) or once the steel door has closed on the choir
  function autoAmb() { ambience(S.state === 'crane31' ? 'crane' : S.state === 'lift31' && (R.env === 'lift' || (R.svcWasOpen && S.svcTo === 0)) ? 'lift' : 'party'); }

  // ---------------------------------------------------------- dress(state)
  const AUTO = { '3.1': 'party31' };
  const ENV_DRESS = { atrium: 'party31', storm_ext: 'crane31', lift: 'lift31' };
  function dress(st) {
    if (st !== 'crane31' && st !== 'lift31') st = 'party31';
    S.state = st; R.svcWasOpen = false;
    if (st === 'party31') { S.doorTo = S.doorU = 0; S.svcTo = S.svcU = 0; S.reader = 'red'; S.carLight = false; }
    if (st === 'lift31') S.carLight = true;
    if (st === 'crane31') S.doorTo = S.doorU = 0;
    applyState();
    S.lampUser = false; autoLamp(); autoAmb();
  }

  // ---------------------------------------------------------- the scene's start (AUTO) vs content's own calls
  // The first of: the set's first tick in the scene, or content's first dress / lamp / reset call, applies the scene's
  // AUTO dress and starting state (so a dress('crane31') in 3.1's first step is never clobbered by the auto dress, and
  // Continue, which restarts the scene at step 0, gets the gifts, crackers, pies and countdowns back).
  const sceneNow = () => (typeof state !== 'undefined' && state ? state.scene : null);
  function touch() { if (R.touched) return; R.touched = true; const a = AUTO[sceneNow()]; if (a) { reset(); dress(a); } }
  if (typeof on === 'function') on('flow:stop', () => { R.scene = null; R.touched = false; });
  const API = { dress(st) { touch(); dress(st); }, lamp(name) { touch(); lamp(name); }, reset() { touch(); reset(); } };

  // ---------------------------------------------------------- update(dt, ctx): ambient life, no allocation
  const HEROES = ['luka', 'chase', 'chase40'];
  let fr = 7; const frand = () => ((fr = (fr * 16807) % 2147483647) / 2147483647);
  const wrapPI = (a) => { while (a > PI) a -= TAU; while (a < -PI) a += TAU; return a; };
  const here = (a) => !!a && !!a.set && a.set.id === ID && a.root.visible;
  function nearestHero(x, z, rMax) {
    if (typeof world === 'undefined') return null;
    let best = null, bd = rMax * rMax;
    for (let i = 0; i < 3; i++) { const a = world.actor(HEROES[i]); if (!here(a)) continue; const dx = a.pos.x - x, dz = a.pos.z - z, d = dx * dx + dz * dz; if (d < bd) { bd = d; best = a; } }
    return best;
  }
  function poseFigures(F, t, dt, choir) {
    const L = F.list;
    for (let i = 0; i < L.length; i++) {
      const f = L[i];
      let bob = 0, roll = 0, pitch = 0;
      if (choir) { if (S.hush) continue; bob = 0.015 * Math.sin(PI * t + f.ph); roll = 0.05 * Math.sin(0.5 * PI * t + f.ph); }
      else {
        bob = 0.006 * Math.sin(1.9 * t + f.ph);
        if (f.look) f.goal = clamp(wrapPI(Math.atan2(f.look[0] - f.x, f.look[f.look.length > 2 ? 2 : 1] - f.z) - f.ry), -1.1, 1.1);
        else if (t >= f.next) {
          if (f.goal !== 0) { f.goal = 0; f.next = t + 4 + 4 * frand(); }
          else { const a = nearestHero(f.x, f.z, f.y > 1 ? 16 : 10); if (a) { f.goal = clamp(wrapPI(Math.atan2(a.pos.x - f.x, a.pos.z - f.z) - f.ry), -1.1, 1.1); f.next = t + 2 + 1.5 * frand(); } else f.next = t + 2 + 2 * frand(); }
        }
        f.turn += (f.goal - f.turn) * Math.min(1, dt * 2.5);
        if (f.nod >= 0) { f.nod += dt; pitch = f.nod < 0.9 ? 0.32 * Math.sin(PI * f.nod / 0.9) : 0; if (f.nod >= 0.9) f.nod = -1; }
      }
      ev.set(f.lean, f.ry, 0, 'YXZ'); qv.setFromEuler(ev); sv.set(f.s, f.s, f.s);
      m4.compose(pv.set(f.x, f.y + bob, f.z), qv, sv); F.clothes.setMatrixAt(i, m4); F.base.setMatrixAt(i, m4);
      const nl = 1.5 * f.s, sl = Math.sin(f.lean) * nl;
      ev.set(f.lean * 0.4 + pitch, f.ry + f.turn, roll, 'YXZ'); qv.setFromEuler(ev);
      m4.compose(pv.set(f.x + Math.sin(f.ry) * sl, f.y + bob + Math.cos(f.lean) * nl, f.z + Math.cos(f.ry) * sl), qv, sv);
      F.head.setMatrixAt(i, m4); F.chip.setMatrixAt(i, m4);
    }
    F.clothes.instanceMatrix.needsUpdate = F.base.instanceMatrix.needsUpdate = F.head.instanceMatrix.needsUpdate = F.chip.instanceMatrix.needsUpdate = true;
  }
  let zE = false;
  function onZebra(a) { if (!here(a)) return; const x = a.pos.x, z = a.pos.z; if (z > -7.4 && z < 7.4 && x > -2.4 && x < 2.4) zE = true; }
  function step(u, to, rate) { return u < to ? Math.min(to, u + rate) : Math.max(to, u - rate); }
  R.flashT = 12;
  function update(dt, ctx) {
    if (!R.root) return;
    const t = ctx.t;
    // scene change -> the scene's dress (+ its starting state); with no scene (?setview) the dress follows the env
    const sc = sceneNow();
    if (sc !== R.scene) { R.scene = sc; touch(); }
    if (ctx.env !== R.env) { R.env = ctx.env; if (SETVIEW() && !AUTO[sc]) dress(ENV_DRESS[R.env] || 'party31'); else { autoLamp(); autoAmb(); } }
    // countdowns (the wall and the facade tick in real time; repaint only when the second changes)
    R.count.update(dt); S.countSecs = R.count.secs;
    if (R.tower && R.tower.userData.update) { R.tower.userData.update(dt, t); const fc = R.tower.userData.countdown; if (fc) S.facadeSecs = fc.secs; }
    if (R.sky && R.sky.userData.update) R.sky.userData.update(dt, t);
    R.flashT -= dt; if (R.flashT <= 0) { R.flashT = 25 + 15 * frand(); if (R.sky && R.sky.userData.flash && !skipping()) R.sky.userData.flash(0.45); }
    // doors: the entrance leaves and the service lift's steel leaf (eased; their colliders open at u >= 0.8)
    if (S.doorU !== S.doorTo) { S.doorU = step(S.doorU, S.doorTo, dt / 1.2); placeDoors(); }
    if (S.svcU !== S.svcTo) { S.svcU = step(S.svcU, S.svcTo, dt / 1.2); placeSvc(); if (S.state === 'lift31' && S.svcU > 0.8) R.svcWasOpen = true; }
    if (S.state === 'lift31') autoAmb();
    // the reader's LED (red / green; a beep flashes it)
    if (R.readerK.flash > 0) R.readerK.flash -= dt;
    const led = R.readerK.flash > 0 ? (S.reader === 'green' ? 0xb0ffc8 : 0xffb0a0) : S.reader === 'green' ? 0x30e060 : 0xff3020;
    if (led !== R.ledHex) { R.ledHex = led; M.led.color.setHex(led); }
    // the lift car: the grille glows with the muzak (content's speaker(k), else a soft auto pulse while lit)
    if (S.spkT > 0) { S.spkT -= dt; M.spk.opacity = 0.15 + 0.6 * S.spk; }
    else M.spk.opacity = S.carLight ? 0.18 + 0.12 * Math.sin(t * 3.4) * Math.sin(t * 1.3) : 0;
    // the outside: hover-cars at 2 m/s, yielding at zebra E
    {
      zE = false; if (typeof world !== 'undefined' && world.actors) world.actors.forEach(onZebra);
      for (let i = 0; i < R.CARS.length; i++) {
        const c = R.CARS[i];
        let want = S.traffic ? 2.0 : 0;
        const front = c.x + c.dir * 2.1;
        if (zE && ((c.dir > 0 && front < -2.6 && front > -13) || (c.dir < 0 && front > 2.6 && front < 13))) { const stop = c.dir > 0 ? -3.0 : 3.0; if (c.dir * (stop - front) < 1.0) want = 0; c.wait = 0.8; }
        if (want > 0 && c.wait > 0) { c.wait -= dt; if (c.v < 0.05) want = 0; }
        c.v += Math.max(-dt * 1.4, Math.min(dt * 1.4, want - c.v));
        c.x += c.dir * c.v * dt; if (c.x > 70) c.x -= 140; else if (c.x < -70) c.x += 140;
        qv.setFromAxisAngle(yUp, c.dir > 0 ? 0 : PI);
        m4.compose(pv.set(c.x, 0.32 + 0.02 * Math.sin(2 * t + i), c.lane), qv, UNIT); R.carBody.setMatrixAt(i, m4); R.carGlow.setMatrixAt(i, m4);
        m4.compose(pv.set(c.x, -0.085, c.lane), qv, UNIT); R.carShadow.setMatrixAt(i, m4);
      }
      R.carBody.instanceMatrix.needsUpdate = R.carGlow.instanceMatrix.needsUpdate = R.carShadow.instanceMatrix.needsUpdate = true;
    }
    holdLamp();
    if (R.paused) return;   // crane31: the camera is outside; the interior holds still
    // the tree: bulbs twinkle under the wrap, the padded star turns
    const rf = reduceFx();
    for (let i = 0; i < 60; i++) {
      const k = rf ? 0.75 + 0.15 * Math.sin(0.4 * t + R.bulbPh[i]) : 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(0.9 * t + R.bulbPh[i]) * Math.sin(0.37 * t + 2.0 * R.bulbPh[i]));
      R.bulbs.setColorAt(i, tc.setRGB(k, 0.82 * k, 0.5 * k));
    }
    R.bulbs.instanceColor.needsUpdate = true;
    R.star.rotation.y += (R.star.userData.turn || 0) * dt;
    // the staff: the choir hums (bob + sway), the crowd glances at the heroes, the Merry Christmas partners nod
    poseFigures(R.choir, t, dt, true); poseFigures(R.crowd, t, dt, false);
    // the meter: idle 38–40 with the hum, content's level during Hum; the red arc pulses over 40
    const K = R.meterK, target = S.meterDb != null ? S.meterDb : 39 + 0.7 * Math.sin(1.7 * t) + 0.35 * Math.sin(4.3 * t);
    K.db += (clamp(target, 0, 62) - K.db) * Math.min(1, dt * 4);
    R.needle.rotation.z = (1 - K.db / 30) * 2.094;
    M.arc.opacity = K.db > 40 ? (rf ? 0.45 : 0.3 + 0.35 * (0.5 + 0.5 * Math.sin(8 * t))) : 0;
    // the banner sways; the pendant stars turn; the staff-lift indicators scroll
    R.banner.rotation.x = 0.02 * Math.sin(TAU * 0.3 * t);
    for (let i = 0; i < STARS.length; i++) {
      const st = STARS[i];   // (indexed, not destructured: no iterator per tick)
      qv.setFromAxisAngle(yUp, i * 0.7 + t * (i % 2 ? 0.09 : -0.07));
      m4.compose(pv.set(st[0], st[1] + 0.05 * Math.sin(0.6 * t + i), st[2]), qv, UNIT); R.stars.setMatrixAt(i, m4);
    }
    R.stars.instanceMatrix.needsUpdate = true;
    T.ind.offset.x = (t * 0.12) % 1;
  }

  // ---------------------------------------------------------- data: AR (Chip View), hotspots (spec §8 positions)
  const AR_SIGNS = [
    { id: 'ar_welcome', at: [0.0, 3.2, -11.6], text: 'WELCOME TO MANDATORY FUN', kind: 'sign', w: 3.6 },
    { id: 'ar_santa', at: [3.5, 2.6, -34.2], text: 'SECRET SANTA · every gift pre-screened', kind: 'sign', w: 3.0 },
    { id: 'ar_quiet', at: [-15.4, 2.4, -16.2], text: 'QUIET CORNER', kind: 'sign', w: 2.0 },
    { id: 'ar_crackers', at: [-12.0, 2.0, -20.5], text: 'CRACKERS · GOGGLES MANDATORY', kind: 'sign', w: 2.6 },
    { id: 'ar_pies', at: [12.5, 2.0, -16.0], text: 'MINCE PIES · PRE-SCREENED', kind: 'sign', w: 2.4 },
    { id: 'ar_choir', at: [-13.0, 3.0, -25.0], text: 'STAFF CHOIR · 40 dB', kind: 'sign', w: 2.0 },
    { id: 'ar_lifts', at: [17.4, 3.0, -27.0], text: 'LIFTS · Are you sure?', kind: 'sign', w: 2.2 },
    { id: 'ar_svc', at: [-5.0, 2.8, -40.5], text: 'SERVICE LIFT · L30 MAX', kind: 'sign', w: 2.0 },
  ];
  const DECOYS = ['MARCUS', 'JO', 'DEV', 'SAM', 'RAJ', 'LIAM', 'MEI', 'TROY', 'ANH', 'CLAIRE', 'PRIYA S.', 'TOM K.', 'KIM', 'SAL', 'BEN', 'ZOE', 'OMAR', 'LUCY', 'HUGO', 'NINA', 'ALEX', 'IVY'];
  const AR_NAMES = [
    ...CROWD.slice(0, 12).map(([x, y, z], i) => ({ id: 'ar_name_staff_' + i, kind: 'name', at: [x, y + 2.05, z], text: DECOYS[i] })),
    ...CHOIR.map(([x, y, z], i) => ({ id: 'ar_name_choir_' + i, kind: 'name', at: [x, y + 2.05, z], text: DECOYS[12 + i] })),
    { id: 'ar_name_priya', kind: 'name', on: 'priya', text: 'PRIYA' }, { id: 'ar_name_tom', kind: 'name', on: 'tom', text: 'TOM' },
    { id: 'ar_name_wen', kind: 'name', on: 'wen', text: 'WEN' }, { id: 'ar_name_gaz', kind: 'name', on: 'gaz', text: 'GAZ' },
    { id: 'ar_name_nadia', kind: 'name', on: 'nadia', text: 'NADIA' }, { id: 'ar_name_hr', kind: 'name', on: 'hr', text: 'HR: KYLIE' },
    { id: 'ar_name_desk', kind: 'name', on: 'desk', text: 'DESK: BEC' },
  ];
  const AR_TAGS = GIFTS.map((G) => ({ id: 'ar_tag_' + G.i, kind: 'tag', at: [G.at[0], G.at[1] + 0.14, G.at[2]], text: G.tag, w: 0.42 }));
  const HOTSPOTS = [
    { id: 'h31_desk', at: 'desk_chase', shot: 's31_desk_two', r: 1.2, verb: 'Talk', who: 'chase' },
    { id: 'h31_kettle', at: 'kettle', shot: 'urn', r: 1.2, verb: 'Kettle', who: 'any' },
    { id: 'h31_cracker', at: 'bi_cracker', shot: 'crackers', r: 1.2, verb: 'Pull cracker', who: 'any' },
    { id: 'h31_hum', at: 'bi_hum', shot: 'choir_meter', r: 1.4, verb: 'Hum', who: 'any' },
    { id: 'h31_pie', at: 'bi_pie', shot: 'mince_pies', r: 1.2, verb: 'Mince pie', who: 'any' },
    { id: 'h31_merry_1', at: 'bi_merry_1', r: 1.2, verb: '"Merry Christmas!"', who: 'any', staff: 0 },
    { id: 'h31_merry_2', at: 'bi_merry_2', r: 1.2, verb: '"Merry Christmas!"', who: 'any', staff: 1 },
    { id: 'h31_merry_3', at: 'bi_merry_3', r: 1.2, verb: '"Merry Christmas!"', who: 'any', staff: 2 },
    { id: 'h31_gifts', at: 'santa_pick', shot: 'santa_table', r: 1.2, verb: 'Take a gift', who: 'luka' },
    { id: 'h31_tags', at: 'c40_tags', shot: 'gift_tags', r: 1.6, verb: 'Read tags', who: 'chase40' },
    ...['priya', 'tom', 'wen', 'gaz', 'nadia'].map((n) => ({ id: 'h31_point_' + n, at: 'gift_' + n, r: 1.6, verb: 'Point out', who: 'chase' })),
    ...['priya', 'tom', 'wen', 'gaz', 'nadia'].map((n) => ({ id: 'h31_give_' + n, at: 'give_' + n, r: 1.0, verb: 'Give', who: 'luka' })),
    { id: 'h31_lift', at: 's31_lift_luka', shot: 'lift_reader', r: 1.2, verb: 'Use lanyard', who: 'luka' },
  ];

  return {
    // first key = the build default
    env: {
      atrium: { bg: 0xdfe6ea, fog: [0xc4ced4, 0.0055], hemi: [0xf6f8ff, 0xc4c8d2, 2.0], dir: [0xdfe8f0, 1.0, [8, 20, 30]], spot: [0xfff0d8, 1.5], rain: 0 },
      storm_ext: { bg: 0x47524f, fog: [0x56625f, 0.0032], hemi: [0xa8b6b0, 0x2a302e, 1.5], dir: [0xc8d6d2, 0.9, [-30, 60, 40]], spot: [0xffffff, 0], rain: 0 },
      lift: { bg: 0x101214, fog: [0x202428, 0.020], hemi: [0xe0e8f0, 0x6a6e74, 3.0], dir: [0xffffff, 0.6, [0, 10, 0]], spot: [0xfff6e8, 1.4], rain: 0 },
    },
    build, dress: API.dress, lamp: API.lamp, reset: API.reset,
    marks: {
      // outside / the entrance
      s31_ext_luka: [-1.1, 0, -4.0, PI], s31_ext_chase: [1.0, 0, -3.6, PI], s31_ext_c40: [0.0, 0, -4.8, PI],
      s31_door_luka: [-1.0, 0, -9.4, PI], s31_door_chase: [1.0, 0, -9.2, PI], s31_door_c40: [0.0, 0, -9.8, PI],
      door_drone: [0.0, 1.9, -10.5, 0],
      s31_in_luka: [-1.0, 0, -13.4, PI], s31_in_chase: [1.0, 0, -13.2, PI], s31_in_c40: [0.0, 0, -13.9, PI],
      s31_cp: [0.0, 0, -17.5, PI],
      // the lanyard desk
      desk_chase: [12.2, 0, -27.0, H], desk_woman: [14.4, 0, -27.0, -H],
      // Secret Santa
      hr: [1.5, 0, -32.8, 1.0], hr_meet: [0.4, 0, -26.0, PI], santa_pick: [4.0, 0, -32.5, PI], c40_tags: [5.6, 0, -32.6, -2.4],
      gift_priya: [-1.2, 0, -29.4, 0.5], gift_tom: [-10.9, 0, -20.6, H], gift_wen: [-12.5, 0, -27.0, H], gift_gaz: [11.6, 0, -22.6, -H], gift_nadia: [7.6, 0, -30.4, -2.3],
      give_priya: [-0.8, 0, -28.6, -2.64], give_tom: [-10.0, 0, -20.6, -H], give_wen: [-11.6, 0, -27.0, -H], give_gaz: [10.7, 0, -22.6, H], give_nadia: [6.9, 0, -31.0, 0.84],
      s31_c40_nadia: [5.2, 0, -28.8, -2.2], s31_chase_nadia: [5.8, 0, -27.6, -2.5],
      // Blend In action spots
      bi_cracker: [-11.0, 0, -19.8, -H], bi_hum: [-11.4, 0, -29.4, -H], bi_pie: [11.8, 0, -15.0, PI],
      bi_merry_1: [-4.0, 0, -21.0, H], bi_merry_2: [4.2, 0, -19.0, -H], bi_merry_3: [8.2, 0, -36.0, PI], kettle: [13.0, 0, -15.0, PI],
      // the Quiet Corner (Safe Room variant)
      quiet_beanbag: [-15.8, 0, -14.4, 0.6], quiet_drone: [-17.0, 2.1, -12.0, 2.5],
      // the service lift
      s31_lift_luka: [-4.0, 0, -39.8, PI], s31_lift_chase: [-3.0, 0, -38.9, -2.6], s31_lift_c40: [-5.6, 0, -39.0, 2.6],
      lift_luka: [-5.0, 0, -42.4, 0], lift_chase: [-4.4, 0, -41.5, 0], lift_c40: [-5.6, 0, -41.5, 0],
      fun_home: [0.0, 2.6, -26.0, PI],
    },
    anchors: {
      s31_crane_a: { at: [0.0, 7.0, -11.0], from: [-4.0, 1.2, 8.5], fov: 50 },
      s31_crane_b: { at: [0.0, 92.0, -11.0], from: [9.0, 70.0, 26.0], fov: 48 },
      s31_crane_c: { at: [0.0, 120.0, -11.0], from: [14.0, 124.0, 44.0], fov: 50 },
      s31_wide: { at: [-2.0, 4.8, -34.0], from: [-2.6, 5.2, -12.2], fov: 60 },
      s31_track_a: { at: [0.0, 1.3, -4.6], from: [5.0, 1.5, -2.0], fov: 44 },
      s31_track_b: { at: [0.0, 1.3, -9.6], from: [4.6, 1.5, -7.4], fov: 44 },
      door_drone: { at: [0.0, 1.9, -10.5], from: [0.8, 2.5, -7.4], fov: 36 },
      s31_invite: { at: [0.0, 1.5, -10.1], from: [1.7, 1.6, -10.3], fov: 38 },
      s31_inside: { at: [0.5, 1.5, -13.5], from: [-2.4, 1.6, -16.6], fov: 40 },
      lanyard_sign: { at: [13.05, 1.27, -27.75], from: [11.65, 1.4, -27.65], fov: 28 },
      s31_desk_two: { at: [13.3, 1.4, -27.0], from: [11.4, 1.6, -29.6], fov: 42 },
      banner: { at: [0.0, 10.4, -22.5], from: [0.0, 5.0, -12.4], fov: 40 },
      countdown_wall: { at: [7.0, 7.6, -40.55], from: [7.0, 4.0, -27.0], fov: 40 },
      yes_unsure: { at: [7.0, 11.4, -40.55], from: [5.0, 2.0, -24.0], fov: 32 },
      choir: { at: [-13.8, 1.4, -28.0], from: [-7.0, 2.2, -26.5], fov: 48 },
      choir_meter: { at: [-13.75, 3.6, -28.0], from: [-11.2, 2.6, -28.0], fov: 34 },
      crackers: { at: [-12.0, 0.85, -20.5], from: [-10.6, 1.5, -20.5], fov: 38 },
      mince_pies: { at: [12.3, 0.84, -16.0], from: [12.3, 1.4, -14.9], fov: 32 },
      urn: { at: [13.6, 1.05, -16.0], from: [13.0, 1.45, -14.9], fov: 32 },
      santa_table: { at: [3.5, 0.9, -33.6], from: [3.6, 1.7, -31.6], fov: 42 },
      gift_tags: { at: [3.5, 0.9, -33.6], from: [5.6, 1.62, -32.6], fov: 34 },
      s31_hr: { at: [1.5, 1.5, -32.8], from: [3.4, 1.6, -30.2], fov: 40 },
      tree: { at: [-5.0, 6.0, -34.0], from: [2.0, 2.0, -20.0], fov: 50 },
      tree_star: { at: [-5.0, 12.8, -34.0], from: [-2.0, 1.6, -24.0], fov: 22 },
      s31_nadia_mid: { at: [7.25, 1.4, -30.7], from: [8.9, 1.55, -32.45], fov: 40 },
      s31_nadia_close: { at: [7.6, 1.6, -30.4], from: [6.9, 1.62, -31.3], fov: 34 },
      s31_luka_close: { at: [6.9, 1.62, -31.0], from: [7.5, 1.6, -30.0], fov: 34 },
      s31_lanyard: { at: [6.9, 1.7, -31.0], from: [8.2, 1.6, -30.6], fov: 36 },
      quiet_corner: { at: [-15.6, 0.8, -14.6], from: [-13.6, 2.4, -11.9], fov: 60 },
      quiet_poster: { at: [-15.4, 1.4, -16.35], from: [-15.4, 1.45, -14.6], fov: 34 },
      s31_behind_tree: { at: [-5.0, 1.2, -40.6], from: [-0.6, 1.6, -37.2], fov: 44 },
      lift_reader: { at: [-3.55, 1.2, -40.55], from: [-3.55, 1.35, -39.95], fov: 26 },
      s31_lift_doors: { at: [-5.0, 1.2, -40.6], from: [-0.6, 1.5, -37.0], fov: 44 },
      lift_inside: { at: [-5.0, 1.3, -42.2], from: [-4.05, 2.25, -40.95], fov: 72 },
      lift_speaker: { at: [-5.2, 2.2, -41.8], from: [-4.4, 1.1, -41.0], fov: 46 },
      lift_panel: { at: [-3.92, 1.25, -41.15], from: [-4.6, 1.35, -41.15], fov: 30 },
      facade_countdown: { at: [0.0, 112.0, -10.7], from: [0.0, 104.0, 40.0], fov: 34 },
      yes_sign: { at: [0.0, 137.0, -36.0], from: [0.0, 128.0, 30.0], fov: 26 },
    },
    cams: {
      at_entry: { type: 'fixed', pos: [6.8, 5.4, -12.0], look: [-2.0, 0.8, -24.0], fov: 56 },
      at_west: { type: 'fixed', pos: [3.0, 8.6, -14.0], look: [-12.0, 0.4, -19.5], fov: 50 },
      at_choir: { type: 'fixed', pos: [-2.0, 8.4, -20.0], look: [-13.5, 0.8, -28.5], fov: 50 },
      at_centre: { type: 'fixed', pos: [0.0, 9.0, -12.2], look: [0.0, 0.0, -24.5], fov: 52 },
      at_east: { type: 'fixed', pos: [-3.0, 8.6, -14.0], look: [12.0, 0.4, -22.0], fov: 50 },
      at_tree: { type: 'fixed', pos: [11.0, 9.6, -22.0], look: [-1.0, 0.6, -34.5], fov: 52 },
      at_svc: { type: 'fixed', pos: [1.6, 2.3, -39.4], look: [-6.0, 1.1, -40.2], fov: 54 },
      at_quiet: { type: 'fixed', pos: [-13.6, 2.6, -11.9], look: [-16.4, 0.5, -15.6], fov: 62 },
      lift_in: { type: 'fixed', pos: [-4.05, 2.25, -40.95], look: [-5.4, 1.1, -42.6], fov: 72 },
      ext_door: { type: 'fixed', pos: [6.4, 2.2, -2.0], look: [-0.6, 1.8, -10.6], fov: 50 },
    },
    zones: [
      { box: [-6.1, -43.0, -3.9, -40.6], cam: 'lift_in' },
      { box: [-11.0, -40.6, 1.0, -37.6], cam: 'at_svc' },
      { box: [-17.6, -16.4, -13.2, -11.4], cam: 'at_quiet' },
      { box: [-6.0, -17.0, 6.0, -11.4], cam: 'at_entry' },
      { box: [-17.6, -24.0, -6.0, -11.4], cam: 'at_west' },
      { box: [-17.6, -40.6, -6.0, -24.0], cam: 'at_choir' },
      { box: [-6.0, -30.0, 6.0, -17.0], cam: 'at_centre' },
      { box: [6.0, -30.0, 17.6, -11.4], cam: 'at_east' },
      { box: [-6.0, -40.6, 17.6, -30.0], cam: 'at_tree' },
      { box: [-10.0, -11.0, 10.0, -7.0], cam: 'ext_door' },
      { box: [-2.0, -7.0, 2.0, 7.0], cam: 'ext_door' },
    ],
    colliders: COL,
    paths: {
      fun_loop: [[-10.6, -16.5], [-10.6, -27.5], [-1.0, -29.5], [10.6, -27.5], [10.6, -16.5], [0.0, -17.5]],
      traffic_east: [[-50, -3.5], [50, -3.5]], traffic_west: [[50, 3.5], [-50, 3.5]],
      // walking routes round the furniture (moveTo has no pathfinding)
      to_lift: [[0.0, -17.5], [2.0, -29.0], [1.0, -36.6], [-2.0, -39.0], [-4.0, -39.8]],
      to_santa: [[0.0, -17.5], [2.0, -29.0], [4.0, -32.5]],
      to_desk: [[0.0, -17.5], [7.0, -22.0], [12.2, -27.0]],
      to_choir: [[0.0, -17.5], [-7.6, -24.6], [-11.4, -29.4]],
      to_crackers: [[0.0, -17.5], [-7.0, -18.8], [-11.0, -19.8]],
      to_tea: [[0.0, -17.5], [7.0, -16.4], [11.8, -15.0]],
    },
    gifts: GIFTS, ar: [...AR_SIGNS, ...AR_NAMES, ...AR_TAGS], ar_signs: AR_SIGNS, ar_names: AR_NAMES, ar_tags: AR_TAGS, hotspots: HOTSPOTS,
    props: ['tree_wrapped', 'tree_star', 'tree_bulbs', 'banner_fun', 'countdown_wall', 'yes_unsure', 'choir_meter', 'choir', 'crowd_staff', 'staff_shadows',
      'cracker_table', 'santa_table', 'gift_parcel', 'invite', 'tea_table', 'tea_urn', 'lanyard_desk', 'staff_lifts', 'quiet_corner', 'entrance_doors', 'speed_gates',
      'svc_lift', 'svc_leaf', 'svc_reader', 'lift_car', 'columns', 'corner_foam', 'mezz', 'pendant_stars', 'canopy', 'ext_street', 'ext_bollards', 'ext_lamps',
      'ext_traffic', 'podium', 'tower', 'facade_countdown', 'yes_sign', 'tower_drones', 'skyline', 'floor_mirror'],
    ambience: AMBIENCE, update,
    get state() { return S.state; },
  };
})();
