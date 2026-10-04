// ============================================================ SET: bridge — the Clontarf checkpoint, the Ted Smout Memorial
// Bridge deck over Bramble Bay, the Brighton mangrove boardwalk (Sunday 23 December 2040, 13:00). Spec: docs/sets/bridge.md
// (scene 2.5 "Are You Sure You're Sure?": checkpoint, scooter chase, boardwalk; + the credits vignette `credits25`).
// Layout (metres, Y up). One straight world along +Z, three regions, all built at once (merged + instanced):
//   +Z = south, toward Brighton (the direction of travel). +X = east (Bramble Bay); facing +Z, +X is on your LEFT
//   (keep-left: lane L, the slow lane, is the +X lane). Mark facing ry: faces (sin ry, cos ry). Boxes [x0, z0, x1, z1].
//   Land y 0. Water y -5.0. Deck top deckY(z): 0, except a smooth hump z 300..500 peaking +4.0 at z 400.
//   Region C, the Clontarf checkpoint (z -60..36; ground runs on to z -200): road x -6.1..6.1 (lanes R -3.5 · M 0 · L +3.5),
//     gate line z 0 (gate_R post -6.3, gate_M post -1.75, gate_L post +1.75 whose arm reaches x 6.95 over the passage),
//     traffic islands x ±1.5..±2.0 z -5..3, stop line z -2.5; booth x 7.0..9.0 z -3.0..-0.6 (hatch on the north face,
//     side window on the west face, door on the south face, reason-card panel on the east face); footpath x 6.1..9.6 +
//     verge 9.6..13.0 from the foam wall at z -46.5 to the plaza (x 6.1..13.0, z -12..-0.6) closed by the padded fence
//     z -0.6; the passage x 6.1..7.0 beside the booth; the scooter dock x 6.1..10.5 z 0.1..8.0; towers W (-9.2, 3) and
//     E (12.2, 3); 12 queued hover-cars (lanes x -3.6 / 0 / 3.6, z -5.6 / -11.4 / -17.2 / -23.0); the blank gantry z -30;
//     foreshore park x 13.3..21.5, sea wall x 22 and z 36; west: padded fence x -6.3, closed footpath, houses x -12..-60.
//   Region D, the deck (z 40..760): slab x -6.7..8.7; west barrier + railing, east foam-capped barrier x 6.1..6.4, shared
//     path x 6.4..8.4, outer railing x 8.48; 28 piers every 24 m (navigation span 376..424), 39 lamps, 602 railing posts;
//     channel markers (±26, 380/420) and the beacon (26, 650); the old Houghton Highway bridge x -46..-36 (y -1.0, closed).
//   Region B, Brighton (z 760..900+): land x -80..8.6 (road curves off to -X past z 880), the barrier gap z 766..776, the
//     council sign (9.2, 774.6), boardwalk W1 (z 777, x 8.4 -> 22.4 ramp y 0 -> -2.6, then flat to the corner), W2 (x 24,
//     z 777 -> 800), W3 (z 800, x 24 -> 44) + lookout x 44..47; mud flats y -4.4 x 8.6..90 z 730..880; 70 mangroves.
//   Far (fog: false, re-centred on the camera every tick, r 470..540): horizon band (peninsula N, Brighton/Sandgate + a tiny
//     CBD S/SW, Moreton Island E, Hays Inlet + hills W), haze, skirt, sun + halo, cumulus, the storm wall S..E.
// Static geometry: one Builder per region merged by material (vertex-coloured M.vc + painted road / concrete / grass / foam
// / atlas), painted textures 64-256 px with nearest filtering only where something must read; every repeat instanced;
// nothing is created after build(); update() allocates nothing. Scooters, cars and pelicans are placed at render time
// (interpolated between ticks like actors, so mounted riders never slip) by wrapping world.render once: the engine has no
// per-set render hook (a `def.render(alpha)` would replace the wrap).
//
// Marks: teddy_seat kettle gate_L_post dock_w1..3 dock_e1..3 credits_teddy · s25_start_luka s25_start_chase s25_start_c40
//   s25_chip s25_cp_start s25_cp_cross s25_cp_plaza s25_hatch s25_panel_chase s25_desk_chase s25_wait_c40 s25_scan_luka
//   s25_scan_chase s25_scan_c40 d25_scan_1..3 d25_confused s25_pass s25_boom_rec s25_dock_luka s25_dock_chase s25_dock_c40
//   s25_launch_1 s25_launch_2 s25_bw_stop_1 s25_bw_stop_2 s25_bw_luka s25_bw_chase s25_bw_c40 d25_edge_1..6
// Anchors: s25_wide_low s25_teddy_hatch s25_no_button s25_speaker s25_explain s25_roleplay s25_roleplay_rev s25_panel
//   s25_desk_card s25_screen s25_scan_wide s25_gate_lift s25_towers_red s25_launch s25_crest_wide s25_edge s25_bw_hide
//   drone_footage credits_checkpoint (+ inspection: council_sign booth_wall dash_1)
// Cams (fixed): cp_north (default) cp_cross cp_plaza cp_passage cp_dock cp_overview ch_launch ch_shoulder ch_lamp
//   ch_channel ch_end bw_end. Zones tile the walk (passage, dock, plaza, cross, north), the boardwalk, the deck (framing
//   + fallback only: the chase drives the camera) and the rest of the land (cp_overview).
// Props (userData API): gate_R gate_M gate_L lift(on) cycle() up · booth · no_button press() · desk_fan · booth_screen
//   show('idle'|'reject'|'accept'|'confirmed') · booth_speaker pulse() · reason_panel pull(i) back(i) insert(i|'xmas')
//   led('off'|'red'|'green') reset() · desk_card show(on) written(on) · kettle_booth · radio_booth · booth_lamp ·
//   tower_W tower_E alarm(on) (children ring, beacon) · tower_drones hide(i) release() show() · cars ask(lane)
//   deckReset() park() flowing(on) onYield(i) (hook) · scooter_1 scooter_2 pose(x, z, yaw, lean) dock() dash(state)
//   glow(on) seat { driver, pillion } · drop_marks show(i, x, z, r) hide(i) · pelicans flyby(z0) · channel_lights ·
//   council_sign · mangroves · lamps · far (userData.storm) · storm build(u) flicker(on) · water · mud
// Env: noon25 (default) chase25 mangrove25 credits25. Dress (dress(state, { keepEnv })): checkpoint25 gate25 alarm25
//   chase25 end25 credits25 (AUTO: 2.5 -> checkpoint25, C -> credits25; other scenes / ?setview dress by env).
// Ambience per dress: wind_bay hover_idle drone_hum water_lap gulls radio_tinny · + alarm_soft · wind_fast water_lap ·
//   mangrove wind_soft thunder_far · wind_bay gulls hover_idle (room none).
// Extras on the entry: dress(state, { keepEnv }), dressed(), askLoop(on), mount(id, scooter, seat), unmount(id?), paths, ar,
//   floor, deckY, chase (below).
// Riders: mount('luka', 'scooter_1', 'driver' | 'pillion') writes the actor's pos (the floor under the seat: seat.driver /
//   seat.pillion are root offsets [x, y, z] in the scooter's frame, y = -0.28 = the ground) and rotY every tick; play
//   'scooter_drive' / 'scooter_pillion' / 'scooter_laugh' (rig poses expect a 0.65 m seat). unmount() with no id drops all.
// CHASE API (for 46-mg-scooter.js; scooter_1's z is the chase's s; every call is allocation-free unless noted):
//   chase.LANES [3.5, 0, -3.5] (L, M, R centres, x) · LANE_W 3.5 · ROAD [-6.1, 6.1] (kerb / barrier faces) · PATH [6.4, 8.4]
//   (the shared path) · GAP [766, 776] (the east barrier gap, z) · START 14 · LAUGH 360 · END 735 · SPEED 6.94 (25 km/h)
//   chase.deckY(z) -> deck top y (hump z 300..500, +4.0 at 400) · floor(x, z) -> walk/ride height anywhere
//   scooter_N.userData.pose(x, z, yaw, lean)  the mini-game drives each scooter every tick (y = floor + 0.28 + bob, pitch
//     follows the hump, render-interpolated between ticks); dash('idle'|'ask'|'ask2'|'ok') repaints on change only; glow(on)
//   chase.follow { offset, look, fov, damp } and chase.followAt(pos, look, dt, snap): writes the FOLLOW rig into the two
//     arrays held by cam.override('fixed', { pos, look, fov }) (offset/look relative to scooter_1, y over deckY at each
//     point, lateral follow damped by `damp`; snap = true on entering a FOLLOW segment)
//   chase.schedule [[s0, s1, cam | 'FOLLOW'], ...] (spec §7.2) and chase.camAt(s) -> the cam name or 'FOLLOW' for s
//   chase.traffic: the six deck cars' live state { x, z, v, vis, yielding, mode } (read only; they yield on their own:
//     cars.userData.onYield = (i) => bark, suppressed while cruising); cars.userData.deckReset() puts them back
//   chase.formation [[x, y over deck, dz behind scooter_1] x6] · chase.cruise(on, { drones: ids }) autopilot at SPEED in
//     the current lanes with DRONES ids held in formation (the 2.5_laugh cutscene) · chase.swerve({ drones, speed }) ->
//     Promise: both scooters along paths.swerve_1/2 onto W1/W2/W3 (~7 s), drones to d25_edge_*; skip-safe (snaps to
//     s25_bw_stop_*) · chase.s() · chase.cruising / chase.swerving
//   drop_marks.userData.show(i 0..2, x, z, r) / hide(i?) telegraph a drop-in · pelicans.userData.flyby(z0)
//   Setup: dress('chase25') = scooters at s25_launch_*, deck traffic reset, towers red, storm building 0.55 -> 0.8.
SETS.bridge = (() => {
  const PI = Math.PI, H = PI / 2, TAU = PI * 2;
  // ---- palette (spec §3.1: 2040 day, turning to storm; no Yes yellow anywhere)
  const BIT = 0x4a4d52, LINE = 0xe8e8e0, CONC = 0xc8c4bb, CONCD = 0x9a978f, GALV = 0xb8bec4, FOAM = 0xefe6d0, SEAM = 0xd8ccb0,
    BOOTH = 0xf2f3f4, STRIPE = 0x5b86b8, RED = 0xd8323a, NORED = 0xc8302c, CREAM = 0xf3ecdc, NAVY = 0x141d3a,
    GRASSC = 0x8db255, GRASSB = 0x7bae4e, CANOPY = 0x5f7a4a, BARK = 0x7a6e5e, TIMBER = 0x9a8268, SAND = 0xcbb894;
  const WY = -5.0, MUDY = -4.4, BWY = -2.6, HOVER = 0.28;
  // ---- the deck profile (spec §2.1)
  const deckY = (z) => (z <= 300 || z >= 500 ? 0 : 2.0 * (1 - Math.cos(TAU * (z - 300) / 200)));
  const deckDY = (z) => (z <= 300 || z >= 500 ? 0 : 2.0 * (TAU / 200) * Math.sin(TAU * (z - 300) / 200));
  function floor(x, z) {
    if (z > 40 && z < 760 && x > -6.7 && x < 8.7) return deckY(z);
    if (z > 775.9 && z < 778.1 && x >= 8.4 && x <= 25.1) return x < 22.4 ? -2.6 * (x - 8.4) / 14.0 : BWY;   // W1 ramp (then the corner)
    if ((x > 22.9 && x < 25.1 && z >= 777 && z <= 801.1) || (z > 798.9 && z < 801.1 && x >= 24 && x <= 47) || (x >= 44 && x <= 47 && z >= 798 && z <= 803)) return BWY;
    return 0;
  }
  const COL = [];                 // colliders (filled by build; dynamic ones written in place)
  const R = {};                   // live refs from the last build
  // scratch (update never allocates)
  const tc = new THREE.Color(), tc2 = new THREE.Color(), m4 = new THREE.Matrix4(), mA = new THREE.Matrix4(), mB = new THREE.Matrix4();
  const v1 = new THREE.Vector3(), v2 = new THREE.Vector3(), sv = new THREE.Vector3(), q1 = new THREE.Quaternion(), eY = new THREE.Euler(0, 0, 0, 'YXZ'), e2 = new THREE.Euler();
  const UP = new THREE.Vector3(0, 1, 0), ZS = [];
  let b = null, XF = null, T = null, M = null, SKY = null, U = null, gain = 1;

  // ---------------------------------------------------------- geometry helpers (into the current Builder `b`), as reddy
  function put(g, hex, m) {
    if (XF) g.applyMatrix4(XF);
    tc.set(hex); if (gain !== 1) tc.multiplyScalar(gain);
    const n = g.attributes.position.count, a = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { a[i * 3] = tc.r; a[i * 3 + 1] = tc.g; a[i * 3 + 2] = tc.b; }
    g.setAttribute('color', new THREE.BufferAttribute(a, 3));
    b.add(g, m || M.vc);
  }
  // box: y is the BOTTOM. bb: min/max corners. boxR: centred, any rotation (X, then Z, then Y). cyl/ico: centred.
  function box(w, h, d, hex, x, y, z, ry = 0, m) { const g = new THREE.BoxGeometry(w, h, d); if (ry) g.rotateY(ry); g.translate(x, y + h / 2, z); put(g, hex, m); }
  function bb(x0, y0, z0, x1, y1, z1, hex, m) { box(x1 - x0, y1 - y0, z1 - z0, hex, (x0 + x1) / 2, y0, (z0 + z1) / 2, 0, m); }
  function boxR(w, h, d, hex, x, y, z, rx = 0, ry = 0, rz = 0, m) {
    const g = new THREE.BoxGeometry(w, h, d); g.rotateX(rx); g.rotateZ(rz); g.rotateY(ry); g.translate(x, y, z); put(g, hex, m);
  }
  function cyl(rt, rb, h, seg, hex, x, y, z, rx = 0, rz = 0, m) {
    const g = new THREE.CylinderGeometry(rt, rb, h, seg); if (rx) g.rotateX(rx); if (rz) g.rotateZ(rz); g.translate(x, y, z); put(g, hex, m);
  }
  function seg(ax, ay, az, bx, by, bz, r, hex, n = 5) {   // a thin rod from a to b
    const dx = bx - ax, dy = by - ay, dz = bz - az, L = Math.hypot(dx, dy, dz);
    const g = new THREE.CylinderGeometry(r, r, L, n); v1.set(dx / L, dy / L, dz / L); q1.setFromUnitVectors(UP, v1);
    g.applyQuaternion(q1); g.translate((ax + bx) / 2, (ay + by) / 2, (az + bz) / 2); put(g, hex);
  }
  function bar(ax, ay, az, bx, by, bz, w, hex) {          // a square bar from a to b (lattice members)
    const dx = bx - ax, dy = by - ay, dz = bz - az, L = Math.hypot(dx, dy, dz);
    const g = new THREE.BoxGeometry(w, L, w); v1.set(dx / L, dy / L, dz / L); q1.setFromUnitVectors(UP, v1);
    g.applyQuaternion(q1); g.translate((ax + bx) / 2, (ay + by) / 2, (az + bz) / 2); put(g, hex);
  }
  function ico(r, hex, x, y, z, sy = 1, m, sx = 1) { const g = new THREE.IcosahedronGeometry(r, 0); g.scale(sx, sy, sx); g.translate(x, y, z); put(g, hex, m); }
  // remap a geometry's 0..1 UVs into the pixel rect r = [x, y, w, h] of an aw x ah atlas (canvas y down)
  function uvRect(g, r, aw = 256, ah = 256) {
    const uv = g.attributes.uv, u0 = r[0] / aw, u1 = (r[0] + r[2]) / aw, va = 1 - r[1] / ah, v0 = 1 - (r[1] + r[3]) / ah;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, u0 + uv.getX(i) * (u1 - u0), v0 + uv.getY(i) * (va - v0));
    return g;
  }
  // a textured quad showing atlas rect r (faces +Z before rotation: rx first, then ry)
  function tq(w, h, r, x, y, z, ry = 0, rx = 0, m = M.atlas, hex = 0xffffff) {
    const g = uvRect(new THREE.PlaneGeometry(w, h), r); if (rx) g.rotateX(rx); if (ry) g.rotateY(ry); g.translate(x, y, z); put(g, hex, m);
  }
  function wuv(g, tile) {   // world-space UVs on a horizontal surface: uv = (x, -z) / tile
    const p = g.attributes.position, uv = g.attributes.uv;
    for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / tile, -p.getZ(i) / tile);
    return g;
  }
  function gnd(x0, z0, x1, z1, y, m, tile = 4, hex = 0xffffff) {
    const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0); g.rotateX(-H); g.translate((x0 + x1) / 2, y, (z0 + z1) / 2);
    put(wuv(g, tile), hex, m);
  }
  // a quilted-foam box: per-face UVs scaled to the face size (one quilt cell = 0.5 m)
  function qbb(x0, y0, z0, x1, y1, z1, hex = 0xffffff) {
    const w = x1 - x0, h = y1 - y0, d = z1 - z0, g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv;
    const F = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];   // BoxGeometry face order: +x -x +y -y +z -z
    for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) { const i = f * 4 + k; uv.setXY(i, uv.getX(i) * F[f][0] / 0.5, uv.getY(i) * F[f][1] / 0.5); }
    g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); put(g, hex, M.quilt);
  }
  // sample points for things that follow the deck: the ends plus every 10 m over the hump
  function zSamples(z0, z1) {
    ZS.length = 0; ZS.push(z0);
    for (let z = 300; z <= 500; z += 10) if (z > z0 + 1e-4 && z < z1 - 1e-4) ZS.push(z);
    ZS.push(z1); return ZS;
  }
  const Q = (P, a, c2, d, e) => { P.push(a[0], a[1], a[2], c2[0], c2[1], c2[2], d[0], d[1], d[2], a[0], a[1], a[2], d[0], d[1], d[2], e[0], e[1], e[2]); };
  function geoP(P, uv) {
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
    if (uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.computeVertexNormals(); return g;
  }
  // a prism along z that follows deckY (x0..x1, from deck+ya to deck+yb); caps: [north, south]; flat: ignore the hump
  function along(x0, x1, ya, yb, z0, z1, hex, o = {}) {
    const Z = zSamples(z0, z1), P = [], dy = o.flat ? () => 0 : deckY;
    for (let i = 0; i < Z.length - 1; i++) {
      const za = Z[i], zc = Z[i + 1], a = dy(za), c = dy(zc);
      Q(P, [x0, a + yb, za], [x0, c + yb, zc], [x1, c + yb, zc], [x1, a + yb, za]);                 // top
      if (!o.noBottom) Q(P, [x0, a + ya, za], [x1, a + ya, za], [x1, c + ya, zc], [x0, c + ya, zc]); // bottom
      Q(P, [x0, a + ya, za], [x0, c + ya, zc], [x0, c + yb, zc], [x0, a + yb, za]);                 // -X side
      Q(P, [x1, a + ya, za], [x1, a + yb, za], [x1, c + yb, zc], [x1, c + ya, zc]);                 // +X side
    }
    if (o.caps !== false) {
      const a = dy(z0), c = dy(z1);
      Q(P, [x0, a + ya, z0], [x0, a + yb, z0], [x1, a + yb, z0], [x1, a + ya, z0]);
      Q(P, [x0, c + ya, z1], [x1, c + ya, z1], [x1, c + yb, z1], [x0, c + yb, z1]);
    }
    put(geoP(P), hex, o.m);
  }
  // a horizontal textured ribbon on top of the deck profile (u across x0..x1, v = z / vTile)
  function ribbon(x0, x1, y, z0, z1, m, vTile, hex = 0xffffff, uTile = 0) {
    const Z = zSamples(z0, z1), P = [], UV = [];
    for (let i = 0; i < Z.length - 1; i++) {
      const za = Z[i], zc = Z[i + 1], a = deckY(za) + y, c = deckY(zc) + y;
      Q(P, [x0, a, za], [x0, c, zc], [x1, c, zc], [x1, a, za]);
      const ua = uTile ? x0 / uTile : 0, ub = uTile ? x1 / uTile : 1, va = -za / vTile, vc = -zc / vTile;
      UV.push(ua, va, ua, vc, ub, vc, ua, va, ub, vc, ub, va);
    }
    put(geoP(P, UV), hex, m);
  }
  // a separate Builder -> named Group (a prop). Coordinates inside fn are local.
  function part(name, fn, pos, ry = 0, o) {
    const pb = b, px = XF; b = new Builder(); XF = null;
    fn();
    const g = b.done(Object.assign({ floor: false }, o)); b = pb; XF = px;
    if (name) g.name = name;
    if (pos) g.position.set(pos[0], pos[1], pos[2]);
    g.rotation.y = ry;
    return g;
  }
  // one merged geometry (single material) from a builder function, for InstancedMesh repeats
  function geoOf(fn, o) { const g = part('', fn, null, 0, o); return g.children[0].geometry; }
  const at = (x, z, ry = 0, y = 0) => (XF = m4.makeRotationY(ry).setPosition(x, y, z));
  const smooth = (u) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
  let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  function IM(geo, m, list, name, parent) {
    const im = instanced(geo, m, list); if (name) im.name = name; if (parent) parent.add(im); return im;
  }
  function dyn(im) { im.instanceMatrix.setUsage(THREE.DynamicDrawUsage); im.frustumCulled = false; return im; }
  const angTo = (a, c) => { let d = (c - a) % TAU; if (d > PI) d -= TAU; else if (d < -PI) d += TAU; return d; };

  // ---------------------------------------------------------- painted textures (64-256 px, nearest)
  const FONT = (px, w = 'bold') => `${w} ${px}px Arial, "Liberation Sans", "DejaVu Sans", sans-serif`;
  function text(c, s, x, y, px, col, al = 'center', w = 'bold', maxW) {
    c.font = FONT(px, w); c.fillStyle = col; c.textAlign = al; c.textBaseline = 'middle';
    if (maxW) c.fillText(s, x, y, maxW); else c.fillText(s, x, y);
  }
  function rrect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  // the atlas (256 x 256): reason panel face, NO plate, 25 sticker, the cards, the booth's inside wall, the council
  // sign, the blank sign panel. Cards: WORK FAMILY MEDICAL LEISURE OTHER CHRISTMAS (+ the blank card).
  const A_PANEL = [0, 0, 224, 128], A_NO = [224, 0, 32, 32], A_ST25 = [224, 32, 32, 32], A_BLANKCARD = [224, 64, 32, 20], A_FOAMTAG = [224, 88, 32, 40];
  const A_BOOTHIN = [0, 128, 128, 64], A_COUNCIL = [128, 128, 128, 64], A_BLANK = [0, 216, 64, 32], A_CARD = (i) => [i * 40, 192, 40, 24];
  const CARD_WORDS = ['WORK', 'FAMILY', 'MEDICAL', 'LEISURE', 'OTHER'], CARD_COL = ['#2f6fc0', '#3a9a5a', '#c8302c', '#e08a2a', '#7a8088'];
  const SLOT_Z = [-1.25, -1.47, -1.69, -1.91, -2.13], READER_Z = -2.38;   // reading order left -> right from the panel side
  const PANEL_U = (z) => (-1.1 - z) / 1.4;                                   // panel face: u 0 at z -1.1 (screen left) .. 1 at z -2.5
  function paintAtlas(c) {
    c.fillStyle = '#808080'; c.fillRect(0, 0, 256, 256);
    // ---- reason panel (224 x 128 = 1.4 x 0.8 m, 160 px/m): grey plastic, JARVIS logo, five pockets + labels, reader, sticker
    const g0 = c.createLinearGradient(0, 0, 0, 128); g0.addColorStop(0, '#b4b8bc'); g0.addColorStop(1, '#989ca2');
    c.fillStyle = g0; c.fillRect(0, 0, 224, 128);
    c.strokeStyle = '#6a6e74'; c.lineWidth = 2; c.strokeRect(1, 1, 222, 126); c.strokeStyle = '#d0d4d8'; c.lineWidth = 1; c.strokeRect(4.5, 4.5, 215, 119);
    c.fillStyle = '#1f6fe0'; c.beginPath(); c.arc(16, 15, 6, 0, TAU); c.fill(); c.fillStyle = '#b4b8bc'; c.beginPath(); c.arc(16, 15, 2.5, 0, TAU); c.fill();
    text(c, 'JARVIS', 26, 15, 13, '#1f6fe0', 'left');
    text(c, 'REASON FOR TRAVEL', 214, 15, 9, '#33373c', 'right');
    c.fillStyle = '#7e8288'; c.fillRect(8, 26, 208, 1);
    for (let i = 0; i < 5; i++) {
      const cx = PANEL_U(SLOT_Z[i]) * 224;
      c.fillStyle = '#2a2d31'; c.fillRect(cx - 14, 62, 28, 18);           // the pocket (cards stand in it)
      c.fillStyle = '#4a4e54'; c.fillRect(cx - 14, 62, 28, 2);
      c.fillStyle = '#e8eaec'; c.fillRect(cx - 16, 84, 32, 12);
      text(c, CARD_WORDS[i], cx, 90.5, 9, '#1c1e22', 'center', 'bold', 30);
    }
    const rx = PANEL_U(READER_Z) * 224;   // the reader: a dark slot, an arrow, the LED socket
    c.fillStyle = '#3a3e44'; c.fillRect(rx - 14, 40, 28, 44); c.fillStyle = '#121416'; c.fillRect(rx - 11, 50, 22, 4);
    c.fillStyle = '#e8eaec'; c.beginPath(); c.moveTo(rx - 5, 60); c.lineTo(rx + 5, 60); c.lineTo(rx, 66); c.fill();
    text(c, 'INSERT', rx, 74, 7, '#e8eaec'); c.fillStyle = '#1a1c1e'; c.beginPath(); c.arc(rx, 92, 5, 0, TAU); c.fill();
    c.save(); c.translate(150, 112); c.rotate(-0.04);   // the sticker: BACKUP — DO NOT REMOVE (yellowed white, red text)
    c.fillStyle = '#f2ecd8'; c.fillRect(-56, -8, 112, 16); c.strokeStyle = '#c8302c'; c.lineWidth = 1; c.strokeRect(-54.5, -6.5, 109, 13);
    text(c, 'BACKUP — DO NOT REMOVE', 0, 0.5, 8, '#c8302c', 'center', 'bold', 104); c.restore();
    c.fillStyle = 'rgba(40,40,40,0.25)'; for (const [x, y] of [[9, 9], [215, 9], [9, 119], [215, 119]]) { c.beginPath(); c.arc(x, y, 2, 0, TAU); c.fill(); }
    // ---- the NO plate: red, white NO
    c.fillStyle = '#c8302c'; c.fillRect(224, 0, 32, 32); c.strokeStyle = '#f4f4f4'; c.lineWidth = 2; c.strokeRect(226, 2, 28, 28);
    text(c, 'NO', 240, 17, 15, '#ffffff');
    // ---- the 25 sticker: white circle, red ring, 25
    c.fillStyle = '#141d3a'; c.fillRect(224, 32, 32, 32);
    c.fillStyle = '#ffffff'; c.beginPath(); c.arc(240, 48, 15, 0, TAU); c.fill(); c.strokeStyle = '#d8323a'; c.lineWidth = 3.5; c.beginPath(); c.arc(240, 48, 12.5, 0, TAU); c.stroke();
    text(c, '25', 240, 49, 12, '#141414');
    // ---- the blank card + a foam tag (spare)
    c.fillStyle = '#f6f6f2'; c.fillRect(224, 64, 32, 20); c.fillStyle = '#d8dce0'; c.fillRect(224, 64, 32, 3);
    c.fillStyle = '#efe6d0'; c.fillRect(224, 88, 32, 40);
    // ---- the cards (40 x 24): a coloured top band and the word; the 6th is Chase's CHRISTMAS in marker
    for (let i = 0; i < 6; i++) {
      const x = i * 40;
      c.fillStyle = '#f6f6f2'; c.fillRect(x, 192, 40, 24); c.fillStyle = '#c8ccd0'; c.fillRect(x, 215, 40, 1); c.fillRect(x + 39, 192, 1, 24);
      if (i < 5) { c.fillStyle = CARD_COL[i]; c.fillRect(x, 192, 40, 6); text(c, CARD_WORDS[i], x + 20, 207, 9, '#141414', 'center', 'bold', 36); }
      else {
        c.save(); c.translate(x + 20, 205); c.rotate(-0.06); text(c, 'CHRISTMAS', 0, 0, 9, '#141a40', 'center', 'bold italic', 37); c.restore();
        c.strokeStyle = '#141a40'; c.lineWidth = 1; c.beginPath(); c.moveTo(x + 5, 213); c.quadraticCurveTo(x + 20, 211, x + 35, 212.5); c.stroke();
      }
    }
    // ---- the booth's inside wall (128 x 64 = 0.8 x 0.4 m): 2037 calendar, a dog photo, a crossword, the sticky note TEDDY
    c.fillStyle = '#e4e2d8'; c.fillRect(0, 128, 128, 64);
    c.fillStyle = 'rgba(160,150,130,0.25)'; for (let i = 0; i < 8; i++) c.fillRect(0, 128 + i * 8, 128, 1);
    c.fillStyle = '#fbfbf8'; c.fillRect(4, 131, 38, 50); c.fillStyle = '#c8302c'; c.fillRect(4, 131, 38, 9);   // calendar
    text(c, '2037', 23, 136, 8, '#ffffff'); text(c, 'MARCH', 23, 145, 6, '#33373c');
    c.fillStyle = '#9a9ea4'; for (let r = 0; r < 5; r++) for (let k = 0; k < 7; k++) c.fillRect(6 + k * 5, 150 + r * 6, 4, 4);
    c.fillStyle = '#c8302c'; c.fillRect(21, 162, 4, 4);
    c.save(); c.translate(64, 150); c.rotate(0.05);                                                           // the dog photo
    c.fillStyle = '#ffffff'; c.fillRect(-15, -15, 30, 28); c.fillStyle = '#7fb0d8'; c.fillRect(-13, -13, 26, 16); c.fillStyle = '#6a9a48'; c.fillRect(-13, 1, 26, 8);
    c.fillStyle = '#8a5a32'; c.fillRect(-7, -4, 13, 7); c.fillRect(3, -9, 6, 7); c.fillRect(-6, 3, 2, 4); c.fillRect(3, 3, 2, 4); c.fillStyle = '#5a3a20'; c.fillRect(7, -9, 2, 4);
    c.fillStyle = '#141414'; c.fillRect(6, -7, 1, 1); c.restore();
    c.save(); c.translate(98, 160); c.rotate(-0.04);                                                          // the crossword (half done)
    c.fillStyle = '#f0ede2'; c.fillRect(-20, -22, 40, 44); text(c, 'CROSSWORD', 0, -18, 6, '#33373c');
    seed = 5; for (let r = 0; r < 6; r++) for (let k = 0; k < 6; k++) { const bl = rnd() < 0.28; c.fillStyle = bl ? '#1c1c1c' : '#ffffff'; c.fillRect(-15 + k * 5, -12 + r * 5, 4, 4); if (!bl && rnd() < 0.45) { c.fillStyle = '#3a4a9a'; c.fillRect(-14 + k * 5, -11 + r * 5, 2, 2); } }
    c.restore();
    c.save(); c.translate(64, 177); c.rotate(-0.08);                                                          // the sticky note TEDDY (shaky biro)
    c.fillStyle = '#cfeec0'; c.fillRect(-14, -10, 28, 20); c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(-14, 9, 28, 1);
    c.font = FONT(10, 'bold'); c.fillStyle = '#2a3a9a'; c.textBaseline = 'middle'; c.textAlign = 'center';
    'TEDDY'.split('').forEach((ch, k) => c.fillText(ch, -10 + k * 5, 1 + (k % 2 ? 1 : -0.5)));
    c.restore();
    // ---- the council sign (128 x 64): routed timber, cream MANGROVE BOARDWALK, a painted crab
    c.fillStyle = '#6a4a2e'; c.fillRect(128, 128, 128, 64);
    seed = 13; for (let i = 0; i < 34; i++) { c.fillStyle = rnd() > 0.5 ? 'rgba(40,24,12,0.35)' : 'rgba(140,100,64,0.3)'; c.fillRect(128, 128 + Math.floor(rnd() * 64), 128, 1); }
    c.strokeStyle = '#efe4c8'; c.lineWidth = 2; rrect(c, 131, 131, 122, 58, 5); c.stroke();
    for (const [s, y] of [['MANGROVE', 149], ['BOARDWALK', 170]]) { text(c, s, 207, y + 1, 15, 'rgba(20,10,4,0.6)', 'center', 'bold', 88); text(c, s, 206, y, 15, '#efe4c8', 'center', 'bold', 88); }
    c.fillStyle = '#d8442a'; c.beginPath(); c.ellipse(146, 162, 9, 6, 0, 0, TAU); c.fill();                  // the crab
    c.strokeStyle = '#d8442a'; c.lineWidth = 2;
    for (const s of [-1, 1]) { for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(146 + s * 6, 164 + k * 1.5); c.lineTo(146 + s * 12, 168 + k * 2.5); c.stroke(); } c.beginPath(); c.arc(146 + s * 10, 153, 3.5, 0, TAU); c.stroke(); c.beginPath(); c.moveTo(146 + s * 6, 158); c.lineTo(146 + s * 9, 155); c.stroke(); }
    c.fillStyle = '#141414'; c.fillRect(143, 157, 2, 2); c.fillRect(148, 157, 2, 2);
    // ---- the blank sign panel (64 x 32): pale, a frame, the 8 px AR glyph in a corner (as parade)
    c.fillStyle = '#e6eaec'; c.fillRect(0, 216, 64, 32); c.strokeStyle = '#b8c0c6'; c.lineWidth = 2; c.strokeRect(1, 217, 62, 30);
    c.fillStyle = 'rgba(160,190,210,0.35)'; c.fillRect(6, 224, 52, 2); c.fillRect(6, 236, 40, 2);
    c.fillStyle = '#9fc8e6'; c.beginPath(); c.moveTo(56, 238); c.lineTo(60, 242); c.lineTo(56, 246); c.lineTo(52, 242); c.fill();
  }
  // the SafeSense screen in the booth (128 x 64): idle / reject / accept / confirmed
  function paintScreen(c, mode) {
    const w = 128, h = 64, g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#eef5fb'); g.addColorStop(1, '#d4e4f2'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.fillStyle = '#3a8ad8'; c.beginPath(); c.moveTo(14, 8); c.quadraticCurveTo(22, 18, 14, 22); c.quadraticCurveTo(6, 18, 14, 8); c.fill();
    text(c, 'SafeSense', 24, 15, 10, '#3a8ad8', 'left');
    if (mode === 'reject') { c.fillStyle = '#f8dcd8'; rrect(c, 8, 28, 112, 28, 8); c.fill(); text(c, 'Reason rejected', 64, 42, 12, '#c8302c', 'center', 'bold', 104); }
    else if (mode === 'accept') { c.fillStyle = '#d8f0e0'; rrect(c, 8, 28, 112, 28, 8); c.fill(); text(c, 'Reason accepted', 64, 42, 12, '#2a8a4a', 'center', 'bold', 104); }
    else if (mode === 'confirmed') { c.fillStyle = '#3a8ad8'; rrect(c, 8, 28, 112, 28, 8); c.fill(); text(c, 'Crossing confirmed', 64, 42, 11, '#ffffff', 'center', 'bold', 106); }
    else { text(c, 'Are you sure?', 64, 40, 12, '#1c2a3a', 'center', 'bold', 110); c.fillStyle = 'rgba(58,138,216,0.4)'; c.fillRect(30, 53, 68, 2); }
  }
  // a scooter's dash (128 x 64): 25 km/h, the battery at 3 %, the SafeSense mini-state (idle / ask / ask2 / ok)
  function paintDash(c, st) {
    const w = 128, h = 64;
    c.fillStyle = '#0c1420'; c.fillRect(0, 0, w, h); c.fillStyle = '#16243a'; c.fillRect(2, 2, w - 4, h - 4);
    text(c, '25', 38, 30, 34, '#9fd8ff'); text(c, 'km/h', 38, 52, 9, '#6fa8d0');
    c.strokeStyle = '#9fd8ff'; c.lineWidth = 1.5; c.strokeRect(74, 8, 40, 14); c.fillRect(114, 12, 3, 6);
    c.fillStyle = '#ff3a3a'; c.fillRect(76, 10, 3, 10); text(c, '3%', 94, 15.5, 9, '#ff6a5a');
    if (st === 'ask' || st === 'ask2') { c.fillStyle = '#3a8ad8'; rrect(c, 72, 30, 48, 26, 9); c.fill(); text(c, st === 'ask2' ? '??' : '?', 96, 44, 16, '#ffffff'); }
    else if (st === 'ok') { c.fillStyle = '#2a8a4a'; rrect(c, 72, 30, 48, 26, 9); c.fill(); c.strokeStyle = '#ffffff'; c.lineWidth = 3; c.beginPath(); c.moveTo(86, 43); c.lineTo(93, 50); c.lineTo(106, 36); c.stroke(); }
    else { c.fillStyle = '#3a8ad8'; c.beginPath(); c.moveTo(96, 32); c.quadraticCurveTo(105, 44, 96, 50); c.quadraticCurveTo(87, 44, 96, 32); c.fill(); }
  }
  function textures() {
    if (T) return T;
    T = {};
    const K = (k, o) => Object.assign({ key: 'bridge_' + k, nearest: true }, o);
    T.atlas = canvasTex(256, 256, paintAtlas, K('atlas'));
    const noise = (base, cols, n, s, sz = 2) => (c, w, h) => { c.fillStyle = base; c.fillRect(0, 0, w, h); seed = s; for (let i = 0; i < n; i++) { c.fillStyle = cols[Math.floor(rnd() * cols.length)]; c.fillRect(Math.floor(rnd() * w), Math.floor(rnd() * h), sz, sz); } };
    // the road (128 across x -6.1..6.1, 128 along 12 m): bitumen, solid edge lines at ±5.25, 3 m dashes at ±1.75 every 12 m
    T.road = canvasTex(128, 128, (c, w, h) => {
      noise('#4a4d52', ['#45484d', '#4f5257', '#43464b', '#53565b', '#484b50'], 1800, 3, 1)(c, w, h);
      c.fillStyle = 'rgba(255,255,255,0.035)'; c.fillRect(20, 0, 22, h); c.fillRect(58, 0, 18, h); c.fillRect(94, 0, 22, h);   // a faint sheen (no tyre marks: hover-cars)
      const X = (x) => Math.round((x + 6.1) / 12.2 * w);
      c.fillStyle = '#e8e8e0'; c.fillRect(X(-5.25) - 1, 0, 2, h); c.fillRect(X(5.25) - 1, 0, 2, h);
      for (const x of [-1.75, 1.75]) c.fillRect(X(x) - 1, 0, 2, 32);
      c.fillStyle = 'rgba(30,32,36,0.5)'; for (let i = 0; i < 6; i++) c.fillRect(Math.floor(rnd() * w), Math.floor(rnd() * h), 6 + Math.floor(rnd() * 10), 1);   // sealed cracks
    }, K('road', { repeat: [1, 1] }));
    // concrete pavers (2 m), footpath and plaza
    T.conc = canvasTex(64, 64, (c, w, h) => {
      noise('#cdc8bd', ['#c4bfb3', '#d4d0c6', '#c0bbaf', '#d8d4ca'], 600, 12, 1)(c, w, h);
      c.fillStyle = '#a8a296'; c.fillRect(0, 0, 1, h); c.fillRect(0, 0, w, 1); c.fillRect(32, 0, 1, h); c.fillRect(0, 32, w, 1);
      c.fillStyle = '#ddd8ce'; c.fillRect(1, 1, 1, h - 1); c.fillRect(33, 1, 1, h - 1);
    }, K('conc', { repeat: [1, 1] }));
    // grass (neutral green: vertex colours give dry Clontarf #8db255 / greener Brighton #7bae4e)
    T.grass = canvasTex(64, 64, (c, w, h) => {
      noise('#d4d8c8', ['#c4ccb4', '#dfe2d2', '#bcc4aa', '#e6e8da', '#ccd2bc'], 900, 3, 1)(c, w, h);
      c.fillStyle = 'rgba(90,110,60,0.25)'; for (let i = 0; i < 120; i++) c.fillRect(Math.floor(rnd() * w), Math.floor(rnd() * h), 1, 2);
      c.fillStyle = 'rgba(232,220,170,0.4)'; for (let i = 0; i < 50; i++) c.fillRect(Math.floor(rnd() * w), Math.floor(rnd() * h), 1, 1);
    }, K('grass', { repeat: [1, 1] }));
    // quilted cream foam (one diamond cell per 0.5 m), seams #d8ccb0
    T.quilt = canvasTex(32, 32, (c, w, h) => {
      c.fillStyle = '#efe6d0'; c.fillRect(0, 0, w, h);
      const g = c.createRadialGradient(16, 12, 2, 16, 16, 18); g.addColorStop(0, 'rgba(255,255,255,0.4)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h);
      c.strokeStyle = '#d0c2a4'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(0, 16); c.lineTo(16, 0); c.lineTo(32, 16); c.lineTo(16, 32); c.closePath(); c.stroke();
      c.fillStyle = '#c8b898'; for (const [x, y] of [[0, 16], [16, 0], [32, 16], [16, 32]]) c.fillRect(x - 1, y - 1, 2, 2);
    }, K('quilt', { repeat: [1, 1] }));
    // water ripples (white-ish: vertex colours carry near/far blue) and wet mud
    T.ripple = canvasTex(128, 128, (c, w, h) => {
      c.fillStyle = '#e4eef2'; c.fillRect(0, 0, w, h); seed = 17;
      for (let i = 0; i < 170; i++) { const x = rnd() * w, y = rnd() * h, l = 6 + rnd() * 18; c.fillStyle = rnd() > 0.45 ? 'rgba(170,200,214,0.7)' : 'rgba(255,255,255,0.9)'; c.fillRect(x, y, l, 2); c.fillRect(x - w, y, l, 2); }
    }, K('ripple', { repeat: [1, 1] }));
    T.mud = canvasTex(128, 128, (c, w, h) => {
      noise('#5d5244', ['#564c3e', '#655a4b', '#514738', '#6a5f50'], 2200, 23, 2)(c, w, h);
      seed = 29; for (let i = 0; i < 60; i++) { const x = rnd() * w, y = rnd() * h, l = 8 + rnd() * 26; c.fillStyle = rnd() > 0.5 ? 'rgba(138,128,112,0.75)' : 'rgba(170,164,150,0.55)'; c.fillRect(x, y, l, 1); c.fillRect(x - w, y, l, 1); }
      c.fillStyle = 'rgba(40,34,26,0.5)'; for (let i = 0; i < 90; i++) c.fillRect(Math.floor(rnd() * w), Math.floor(rnd() * h), 1, 1);   // crab holes
    }, K('mud', { repeat: [1, 1] }));
    // the SafeSense screen + the two dashes (repainted in place on a state change)
    T.screen = canvasTex(128, 64, (c) => paintScreen(c, 'idle'), K('screen'));
    T.dash1 = canvasTex(128, 64, (c) => paintDash(c, 'idle'), K('dash1'));
    T.dash2 = canvasTex(128, 64, (c) => paintDash(c, 'idle'), K('dash2'));
    // sky: storm wall (anvil, lit rim, green-grey underside), cumulus, the sun's halo, the horizon haze, a drop telegraph
    T.storm = canvasTex(256, 128, (c, w, h) => {
      c.clearRect(0, 0, w, h); seed = 31;
      const top = (x) => 34 + 14 * Math.sin(x / w * TAU + 0.6) + 8 * Math.sin(x / w * TAU * 3 + 1.1) + 4 * Math.sin(x / w * TAU * 7 + 2);
      for (let x = 0; x < w; x++) {   // the body under the profile: lit grey at the top, dark green-grey below
        const t = top(x), g = c.createLinearGradient(0, t, 0, h);
        g.addColorStop(0, '#9aa6a2'); g.addColorStop(0.25, '#6e7c78'); g.addColorStop(0.6, '#4f5c58'); g.addColorStop(0.85, '#5e6e5c'); g.addColorStop(1, '#6a7a6a');
        c.fillStyle = g; c.fillRect(x, Math.floor(t + 6), 1, h);
      }
      for (let i = 0; i < 70; i++) {   // billows along the top: lit on their upper side (the sun is high behind the viewer)
        const x = rnd() * w, r = 6 + rnd() * 11, y = top(x) + r * 0.7 + rnd() * 10;
        for (const ox of [0, -w, w]) {
          const g = c.createRadialGradient(x + ox - r * 0.25, y - r * 0.45, r * 0.1, x + ox, y, r);
          g.addColorStop(0, '#d4dcd6'); g.addColorStop(0.45, '#a6b2ac'); g.addColorStop(0.85, '#76847e'); g.addColorStop(1, 'rgba(110,124,118,0)');
          c.fillStyle = g; c.beginPath(); c.arc(x + ox, y, r, 0, TAU); c.fill();
        }
      }
      c.fillStyle = 'rgba(201,210,204,0.35)';   // a thin anvil spreading where the tower is tallest
      c.beginPath(); c.ellipse(w * 0.32, top(w * 0.32) + 2, 60, 6, 0, 0, TAU); c.fill(); c.beginPath(); c.ellipse(w * 0.32 + w, top(w * 0.32) + 2, 60, 6, 0, 0, TAU); c.fill(); c.beginPath(); c.ellipse(w * 0.32 - w, top(w * 0.32) + 2, 60, 6, 0, 0, TAU); c.fill();
      for (let i = 0; i < 26; i++) {   // rain curtains under the base
        const x = rnd() * w, wd = 4 + rnd() * 10, y0 = h * (0.62 + rnd() * 0.12), g = c.createLinearGradient(0, y0, 0, h);
        g.addColorStop(0, 'rgba(74,86,80,0)'); g.addColorStop(0.4, 'rgba(74,86,80,0.55)'); g.addColorStop(1, 'rgba(84,96,88,0.7)');
        c.fillStyle = g; c.fillRect(x, y0, wd, h - y0); c.fillRect(x - w, y0, wd, h - y0);
      }
      c.clearRect(0, 0, w, 2);
    }, K('storm', { repeat: [1, 1] }));
    T.storm.wrapT = THREE.ClampToEdgeWrapping;
    T.cloud = canvasTex(128, 64, (c, w, h) => {
      c.clearRect(0, 0, w, h);
      for (const [x, y, r] of [[24, 42, 13], [42, 33, 18], [64, 28, 21], [88, 33, 17], [106, 41, 12], [56, 42, 16], [80, 43, 13]]) {
        c.save(); c.translate(x, y); c.scale(1, 0.7);
        const g = c.createRadialGradient(0, -r * 0.3, r * 0.2, 0, 0, r); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.7, 'rgba(238,242,246,0.92)'); g.addColorStop(1, 'rgba(220,228,236,0)');
        c.fillStyle = g; c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fill(); c.restore();
      }
      c.fillStyle = 'rgba(180,192,204,0.35)'; c.fillRect(16, 46, 96, 4);
    }, K('cloud'));
    T.halo = canvasTex(128, 128, (c, w, h) => { const g = c.createRadialGradient(64, 64, 4, 64, 64, 63); g.addColorStop(0, 'rgba(255,255,250,1)'); g.addColorStop(0.18, 'rgba(255,250,236,0.75)'); g.addColorStop(0.45, 'rgba(255,246,222,0.22)'); g.addColorStop(1, 'rgba(255,242,216,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); }, { key: 'bridge_halo' });
    T.haze = canvasTex(4, 64, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.7, 'rgba(255,255,255,0.35)'); g.addColorStop(1, 'rgba(255,255,255,1)'); c.fillStyle = g; c.fillRect(0, 0, w, h); }, { key: 'bridge_haze' });
    T.drop = canvasTex(64, 64, (c, w, h) => {
      const g = c.createRadialGradient(32, 32, 2, 32, 32, 31); g.addColorStop(0, 'rgba(10,16,30,0.75)'); g.addColorStop(0.62, 'rgba(10,16,30,0.5)'); g.addColorStop(0.8, 'rgba(20,40,70,0.2)'); g.addColorStop(1, 'rgba(10,16,30,0)');
      c.fillStyle = g; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(159,216,255,0.55)'; c.lineWidth = 2; c.beginPath(); c.arc(32, 32, 24, 0, TAU); c.stroke();
    }, K('drop'));
    return T;
  }

  // ---------------------------------------------------------- materials (cached: mat()/matTex(), or created once here)
  function skyMats() {
    if (SKY) return SKY;
    const B = (o) => new THREE.MeshBasicMaterial(Object.assign({ fog: false }, o)), DS = THREE.DoubleSide, ADD = THREE.AdditiveBlending;
    SKY = {
      band: B({ vertexColors: true, side: DS }),                                       // horizon silhouettes (tinted per env)
      skirt: B({ color: 0xd8dccc, side: DS }),                                         // copies the live fog colour
      haze: B({ map: T.haze, transparent: true, depthWrite: false, side: DS, color: 0xd8dccc }),
      sun: B({ color: 0xfffcf0 }),
      halo: B({ map: T.halo, color: 0xfff4d8, transparent: true, opacity: 0.85, depthWrite: false, blending: ADD }),
      cloud: B({ map: T.cloud, transparent: true, opacity: 1, depthWrite: false, side: DS, color: 0xf4f6f8 }),
      storm: B({ map: T.storm, transparent: true, opacity: 0.94, depthWrite: false, side: DS, color: 0xffffff }),
    };
    return SKY;
  }
  function unlitMats() {   // fogged, unlit families created once: glows (vertex colours), channel lights (instance colour), drop telegraphs
    if (U) return U;
    U = {
      glow: new THREE.MeshBasicMaterial({ vertexColors: true }),
      chan: new THREE.MeshBasicMaterial({ color: 0xffffff }),
      drop: new THREE.MeshBasicMaterial({ map: T.drop, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }),
    };
    return U;
  }
  function initMats() {
    const DS = THREE.DoubleSide;
    M = {
      vc: mat(0xffffff), vc2: mat(0xffffff, { side: DS }),
      road: matTex(T.road), conc: matTex(T.conc), grass: matTex(T.grass), quilt: matTex(T.quilt),
      atlas: matTex(T.atlas, { emissive: 0xffffff, emissiveIntensity: 0.14 }),
      atlasHi: matTex(T.atlas, { emissive: 0xffffff, emissiveIntensity: 0.75 }),
      glass: mat(0xbfe6ff, { transparent: true, opacity: 0.25, side: DS, emissive: 0xffc27a, emissiveIntensity: 0, key: 'bridge_glass' }),   // the booth window: warm-lit at dusk
      water: matTex(T.ripple, { key: 'bridge_water' }), mud: matTex(T.mud, { key: 'bridge_mud' }),
      lamp: mat(0xdfe5ea, { emissive: 0xfff2d8, emissiveIntensity: 0, key: 'bridge_lamphead' }),
      bulb: mat(0x8a8478, { emissive: 0xffe2a8, emissiveIntensity: 1, key: 'bridge_boothbulb' }),
      bW: mat(0x10161c, { emissive: 0x6fb8ff, emissiveIntensity: 1.2, key: 'bridge_beacon_w' }),
      bE: mat(0x10161c, { emissive: 0x6fb8ff, emissiveIntensity: 1.2, key: 'bridge_beacon_e' }),
      screen: matTex(T.screen, { emissive: 0xffffff, emissiveIntensity: 0.9 }),
      dash1: matTex(T.dash1, { emissive: 0xffffff }), dash2: matTex(T.dash2, { emissive: 0xffffff }),
      ledOff: mat(0x2a2c30), ledRed: mat(0x300000, { emissive: 0xff3030 }), ledGreen: mat(0x003000, { emissive: 0x40e070 }),
      charge: mat(0x1a2a3a, { emissive: 0x6fc8ff, emissiveIntensity: 0.8 }),
    };
    skyMats(); unlitMats();
  }

  // ---------------------------------------------------------- far group (fog: false), re-centred on the camera every tick
  const sstep = (a, c, x) => smooth((x - a) / (c - a));
  // horizon height (m above the water) at bearing a (degrees from +Z toward +X): S Brighton/Sandgate shore + a tiny CBD
  // (SW), E open bay + Moreton Island's low line, N the Redcliffe peninsula, W Hays Inlet mangroves + the hills behind
  const BANDN = 360, BAND_H = new Float32Array(BANDN + 1), BAND_K = new Uint8Array(BANDN + 1);
  function bandProfile() {
    seed = 41;
    for (let i = 0; i <= BANDN; i++) {
      const a = -180 + i, n = Math.sin(a * 0.31) * 0.5 + Math.sin(a * 0.73 + 1.3) * 0.3 + Math.sin(a * 1.9 + 0.4) * 0.2;
      const south = sstep(-80, -70, a) * (1 - sstep(38, 48, a));
      const moreton = sstep(60, 68, a) * (1 - sstep(120, 128, a));
      const north = 1 - sstep(-152, -140, a) * (1 - sstep(140, 152, a));
      const west = sstep(-142, -130, a) * (1 - sstep(-82, -72, a));
      const hills = sstep(-138, -118, a) * (1 - sstep(-96, -78, a));
      let h = south * (2.4 + 1.4 * n) + moreton * (1.4 + 0.9 * n + 4.8 * Math.exp(-(((a - 97) / 7) ** 2))) + north * (3.2 + 2.0 * n) + west * (2.0 + 0.5 * n) + hills * (9 + 7 * (0.6 + 0.4 * n));
      let k = hills > 0.3 ? 2 : moreton > 0.3 ? 3 : 1;
      if (a >= -31 && a <= -21) { h += 3 + rnd() * 10; k = 4; }                    // the Brisbane CBD, 25 km away
      if ((a >= 166 || a <= -172) && rnd() < 0.5) { h += 3 + rnd() * 6; k = 4; }     // Redcliffe / Scarborough towers
      BAND_H[i] = h; BAND_K[i] = h < 0.25 ? 0 : k;
    }
  }
  function bandGeo() {
    bandProfile();
    const r = 470, P = [], C = [], TOP = [0, 0x8fa6a2, 0x8a9fae, 0xa0b4bc, 0x9eacb8], BASE = 0xb8c6c4;
    const push = (x, y, z, hex) => { P.push(x, y, z); tc.set(hex); C.push(tc.r, tc.g, tc.b); };
    for (let i = 0; i < BANDN; i++) {
      const h0 = BAND_H[i], h1 = BAND_H[i + 1]; if (BAND_K[i] === 0 && BAND_K[i + 1] === 0) continue;
      const flat = BAND_K[i] === 4, ha = flat ? h0 : h0, hb = flat ? h0 : h1, top = TOP[BAND_K[i] || BAND_K[i + 1]];
      const a0 = (-180 + i) * PI / 180, a1 = (-179 + i) * PI / 180;
      const x0 = Math.sin(a0) * r, z0 = Math.cos(a0) * r, x1 = Math.sin(a1) * r, z1 = Math.cos(a1) * r;
      push(x0, WY + ha, z0, top); push(x0, WY - 1, z0, BASE); push(x1, WY + hb, z1, top);
      push(x1, WY + hb, z1, top); push(x0, WY - 1, z0, BASE); push(x1, WY - 1, z1, BASE);
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3));
    return g;
  }
  function stormGeo() {   // the storm wall: 12 cards of 15° from bearing -5° to 175° (S..E..NE), unit height (scaled by build)
    const r = 540, P = [], UV = [], N = 12;
    for (let i = 0; i < N; i++) {
      const a0 = (-5 + i * 15) * PI / 180, a1 = (10 + i * 15) * PI / 180, x0 = Math.sin(a0) * r, z0 = Math.cos(a0) * r, x1 = Math.sin(a1) * r, z1 = Math.cos(a1) * r;
      const k = (j) => { const e = smooth(Math.min(j, N - j) / 2.4); return 0.04 + 0.96 * e * (0.85 + 0.15 * Math.sin(j * 1.9)); };
      const h0 = k(i), h1 = k(i + 1), u0 = i * 0.37, u1 = u0 + 0.37;
      P.push(x0, 0, z0, x1, 0, z1, x1, h1, z1, x0, 0, z0, x1, h1, z1, x0, h0, z0);
      UV.push(u0, 0, u1, 0, u1, 1, u0, 0, u1, 1, u0, 1);
    }
    return geoP(P, UV);
  }
  function cloudGeo() {   // 8 high cumulus cards facing the origin, mostly N and W (the storm owns the S and E)
    const P = [], UV = [];
    seed = 97;
    for (let i = 0; i < 8; i++) {
      const a = (150 + i * 32 + rnd() * 14) * PI / 180, d = 320 + rnd() * 130, y = WY + 95 + rnd() * 70, w = 90 + rnd() * 60, h = w * 0.42;
      const cx = Math.sin(a) * d, cz = Math.cos(a) * d, ex = Math.cos(a) * w / 2, ez = -Math.sin(a) * w / 2;
      for (const [px, py, pz, u, v] of [[cx - ex, y - h / 2, cz - ez, 0, 0], [cx + ex, y - h / 2, cz + ez, 1, 0], [cx + ex, y + h / 2, cz + ez, 1, 1], [cx - ex, y - h / 2, cz - ez, 0, 0], [cx + ex, y + h / 2, cz + ez, 1, 1], [cx - ex, y + h / 2, cz - ez, 0, 1]]) { P.push(px, py, pz); UV.push(u, v); }
    }
    return geoP(P, UV);
  }
  function buildFar(root) {
    const far = new THREE.Group(); far.name = 'far'; root.add(far); R.far = far;
    const add = (g, name, ro) => { g.name = name; if (ro != null) g.renderOrder = ro; g.frustumCulled = false; far.add(g); return g; };
    R.band = add(new THREE.Mesh(bandGeo(), SKY.band), 'band');
    const hz = new THREE.CylinderGeometry(480, 480, 46, 48, 1, true); hz.translate(0, WY - 1 + 23, 0);
    add(new THREE.Mesh(hz, SKY.haze), 'haze', -3);
    const sk = new THREE.CylinderGeometry(476, 476, 90, 48, 1, true); sk.translate(0, WY - 45.6, 0);
    add(new THREE.Mesh(sk, SKY.skirt), 'skirt');
    R.storm = add(new THREE.Mesh(stormGeo(), SKY.storm), 'storm', -4);
    R.storm.position.y = WY - 6;
    R.clouds = add(new THREE.Mesh(cloudGeo(), SKY.cloud), 'clouds', -1);
    R.sun = add(new THREE.Group(), 'sun');
    R.sun.add(new THREE.Mesh(new THREE.CircleGeometry(8, 24), SKY.sun));
    const halo = new THREE.Mesh(new THREE.PlaneGeometry(110, 110), SKY.halo); halo.position.z = 0.5; halo.renderOrder = 2; R.sun.add(halo);
    R.sun.traverse((o) => { o.frustumCulled = false; });
    // storm API (spec §4 `far`): build(u) 0 low/far .. 1 towering/close (eases 0.02/s; instant when skipping), flicker(on)
    const api = {
      build: (u, rate = 0.02) => { R.stormTo = Math.max(0, Math.min(1, u)); R.stormRate = rate; if (skipping()) R.stormU = R.stormTo; },
      flicker: (on) => { R.flickOn = !!on; R.flickT = 2 + Math.random() * 3; },
    };
    Object.assign(R.storm.userData, api); far.userData.storm = api;
  }
  const skipping = () => typeof flow !== 'undefined' && flow && flow.skipping;

  // ---------------------------------------------------------- Region C: the Clontarf checkpoint (static)
  // a quilted-foam cylinder (tower bases, bollard sleeves): UVs scaled so one cell is 0.5 m
  function qcyl(r, h, seg, x, y, z) {
    const g = new THREE.CylinderGeometry(r, r, h, seg), uv = g.attributes.uv, k = TAU * r / 0.5;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * k, uv.getY(i) * h / 0.5);
    g.translate(x, y + h / 2, z); put(g, 0xffffff, M.quilt);
  }
  function towerMast(x, z) {   // padded base, square lattice mast to 9.0, three docking arms at 7.6, the top platform
    qcyl(0.9, 1.0, 14, x, 0, z); cyl(0.92, 0.92, 0.06, 14, SEAM, x, 1.0, z);
    cyl(0.6, 0.75, 0.25, 10, 0x8a9098, x, 1.06, z);
    const s = 0.28, y0 = 1.25, y1 = 9.0, GM = 0xa8b0b8;
    for (const [px, pz] of [[-s, -s], [s, -s], [s, s], [-s, s]]) bb(x + px - 0.045, y0, z + pz - 0.045, x + px + 0.045, y1, z + pz + 0.045, GM);
    for (let y = y0; y < y1 - 0.5; y += 0.95) {
      const ya = y, yb = Math.min(y1, y + 0.95);
      for (let f = 0; f < 4; f++) {
        const c0 = [[-s, -s], [s, -s], [s, s], [-s, s]][f], c1 = [[s, -s], [s, s], [-s, s], [-s, -s]][f];
        bar(x + c0[0], ya, z + c0[1], x + c1[0], yb, z + c1[1], 0.035, GM);
        bar(x + c0[0], ya, z + c0[1], x + c1[0], ya, z + c1[1], 0.035, GM);
      }
    }
    bb(x - 0.42, 8.95, z - 0.42, x + 0.42, 9.05, z + 0.42, 0x7e868e);
    for (let k = 0; k < 3; k++) {   // arms toward +Z, -120°, +120°: the dock_* cradles at r 1.1
      const a = k === 0 ? 0 : k === 1 ? -2 * PI / 3 : 2 * PI / 3, sx = Math.sin(a), sz = Math.cos(a);
      bar(x + sx * 0.3, 7.6, z + sz * 0.3, x + sx * 1.02, 7.6, z + sz * 1.02, 0.07, GM);
      bar(x + sx * 0.3, 7.15, z + sz * 0.3, x + sx * 0.8, 7.58, z + sz * 0.8, 0.04, GM);
      cyl(0.13, 0.1, 0.05, 10, 0x6a727a, x + sx * 1.1, 7.6, z + sz * 1.1);
      cyl(0.135, 0.135, 0.015, 10, 0x9fd8ff, x + sx * 1.1, 7.63, z + sz * 1.1);
    }
    bb(x - 0.5, 1.0, z + 0.32, x - 0.1, 1.6, z + 0.6, 0xd8dce0);   // the equipment box
  }
  function buildRegionC(root) {
    b = new Builder(); XF = null;
    // ---- ground: the road runs from the far north onto the deck; footpath, plaza, dock (pavers); verge + park (grass)
    ribbon(-6.1, 6.1, 0, -200, 40, M.road, 12);
    for (const r of [[6.1, -200, 9.6, -12], [6.1, -12, 13.0, -0.6], [6.1, -0.6, 10.5, 8.2], [-9.0, -200, -6.1, 36]]) gnd(r[0], r[1], r[2], r[3], 0.03, M.conc, 2);
    gnd(6.25, 0.4, 10.4, 7.9, 0.035, M.vc, 2, 0x3a4048);                                  // the dock's rubber mat
    for (const [x0, z0, x1, z1, hex] of [[9.6, -200, 13.0, -12, GRASSC], [13.0, -200, 22, 36, 0x93b45c], [10.5, -0.6, 13.0, 36, GRASSC], [6.1, 8.2, 10.5, 36, GRASSC], [-80, -200, -9.0, 36, 0x88ac54]])
      gnd(x0, z0, x1, z1, 0.0, M.grass, 3, hex);
    gnd(6.1, 8.2, 10.5, 12.0, 0.034, M.conc, 2);                                            // the kerb ramp apron to lane L
    bb(9.585, 0, -200, 9.6, 0.029, -12, 0xa8a296); bb(-9.0, 0, -200, -8.985, 0.029, 36, 0xa8a296);   // paver edges (no sliver under the step)
    // kerbs (the east one lowered at the ramp z 8.2..12), islands with padded noses, the stop line, island hatching
    bb(5.9, 0, -200, 6.1, 0.1, 8.2, 0xdedad0); bb(5.9, 0, 12, 6.1, 0.1, 36, 0xdedad0); bb(5.9, 0, 8.2, 6.1, 0.03, 12, 0xdedad0);
    bb(-6.1, 0, -200, -5.9, 0.1, 36, 0xdedad0);
    for (const sx of [-1, 1]) { bb(sx * 1.5 - (sx > 0 ? 0 : 0.5), 0, -5, sx * 1.5 + (sx > 0 ? 0.5 : 0), 0.15, 3, 0xd4d0c4); bb(sx * 1.75 - 0.24, 0.15, -4.9, sx * 1.75 + 0.24, 0.16, 2.9, 0x8a8a7a); }
    for (const [x0, x1] of [[-5.25, -2.0], [-1.5, 1.5], [2.0, 5.25]]) bb(x0, 0, -2.62, x1, 0.02, -2.38, LINE);
    for (let i = 0; i < 4; i++) for (const sx of [-1, 1]) boxR(0.12, 0.012, 1.0, LINE, sx * 1.75, 0.006, -6.2 - i * 0.9, 0, sx * 0.6, 0);   // chevrons before the islands
    // sea walls (x 22 and z 36, but not under the deck), the abutment, rocks (instanced below)
    bb(22, -5.4, -200, 22.5, 0.12, 36.5, 0xb8a888); bb(21.8, 0.0, -200, 22.5, 0.16, 36.5, 0xd2c6a8);
    bb(-80, -5.4, 36, -6.7, 0.12, 36.5, 0xb8a888); bb(8.7, -5.4, 36, 22.5, 0.12, 36.5, 0xb8a888);
    bb(-80, 0.0, 35.8, -6.7, 0.16, 36.5, 0xd2c6a8); bb(8.7, 0.0, 35.8, 22.5, 0.16, 36.5, 0xd2c6a8);
    bb(-6.7, -5.4, 36, 8.7, -0.02, 40, CONCD); bb(-7.0, -5.4, 39.4, 9.0, -1.4, 40.2, 0xb0aca2);
    gnd(6.1, 12, 8.7, 40, 0.035, M.conc, 2);                                                 // the path onto the deck
    // ---- the padded fences: west (closed footpath), plaza, dock; the north foam wall; the verge hedge; the dock rails
    qbb(-6.45, 0, -200, -6.25, 1.1, -1.0); qbb(-6.45, 0, 1.0, -6.25, 1.1, 36);
    qbb(9.0, 0, -0.75, 13.3, 1.1, -0.45);
    qbb(10.5, 0, -0.45, 10.7, 1.1, 8.2);
    qbb(6.0, 0, -46.8, 13.3, 1.5, -46.5); bb(6.0, 1.5, -46.85, 13.3, 1.56, -46.45, SEAM);
    for (let z = -46.5; z < -0.6; z += 0.9) { ico(0.42 + rnd() * 0.1, 0x5e8a44, 13.15, 0.55, z + 0.45, 1.0, undefined, 0.8); }
    bb(12.95, 0, -46.5, 13.35, 0.62, -0.45, 0x527a3c);
    for (let z = -46.5; z <= -0.6; z += 4) qbb(13.05, 0, z - 0.1, 13.25, 0.95, z + 0.1);
    bb(6.0, 0, 8.0, 10.7, 0.08, 8.2, 0x6a7078); for (let x = 6.1; x <= 10.6; x += 1.5) bb(x - 0.04, 0, 8.06, x + 0.04, 0.5, 8.14, GALV); bb(6.0, 0.46, 8.04, 10.7, 0.52, 8.16, GALV);
    bb(7.3, 0, 3.6, 9.8, 0.42, 3.8, 0xd8dce0); bb(7.3, 0.42, 3.62, 9.8, 0.46, 3.78, 0x3a4048);   // the charging rail
    for (const x of [7.9, 9.2]) bb(x - 0.18, 0.43, 3.58, x + 0.18, 0.47, 3.82, 0x9fd8ff);
    // ---- the gantry (z -30): posts with foam sleeves, the beam, three blank panels facing the queue (-Z)
    for (const x of [-7.2, 10.2]) { bb(x - 0.2, 0, -30.2, x + 0.2, 6.6, -29.8, 0x9aa2aa); qbb(x - 0.3, 0, -30.3, x + 0.3, 1.4, -29.7); }
    bb(-7.4, 6.0, -30.2, 10.4, 6.6, -29.8, 0x9aa2aa); bb(-7.4, 6.6, -30.15, 10.4, 6.68, -29.85, 0x7e868e);
    for (const x of [-3.6, 0, 3.6]) { bb(x - 1.62, 4.9, -30.34, x + 1.62, 6.52, -30.2, 0xc8ced2); tq(3.2, 1.6, A_BLANK, x, 5.71, -30.345, PI); }
    // ---- the gate posts (their arms are props): white housings with a red band, a foam skirt
    for (const x of [-6.3, -1.75, 1.75]) {
      bb(x - 0.2, 0, -0.42, x + 0.2, 1.0, -0.06, BOOTH); bb(x - 0.205, 0.72, -0.425, x + 0.205, 0.86, -0.055, RED);
      bb(x - 0.16, 1.0, -0.38, x + 0.16, 1.06, -0.1, 0xb0b6bc); qbb(x - 0.24, 0, -0.46, x + 0.24, 0.3, -0.02);
      bb(x - 0.06, 0.6, -0.06, x + 0.06, 1.12, 0.02, 0x9aa2aa);                               // the pivot bracket
    }
    // ---- the towers' masts (rings + beacons are props)
    towerMast(-9.2, 3.0); towerMast(12.2, 3.0);
    // ---- verge furniture: the bench (11.5, -34) facing -X, the bin (11.6, -9), the picnic table (16.5, -26)
    at(11.5, -34.0, -H);
    bb(-0.9, 0, -0.25, -0.8, 0.42, 0.25, 0x7e868e); bb(0.8, 0, -0.25, 0.9, 0.42, 0.25, 0x7e868e); XF = null;
    qbb(11.25, 0.4, -34.9, 11.75, 0.52, -33.1); qbb(11.68, 0.52, -34.9, 11.82, 0.95, -33.1);
    cyl(0.26, 0.24, 0.92, 10, 0x5a7a6a, 11.6, 0.46, -9.0); cyl(0.28, 0.28, 0.06, 10, 0x4a6a5a, 11.6, 0.95, -9.0); cyl(0.12, 0.12, 0.02, 10, 0x9fd8ff, 11.6, 0.985, -9.0);
    at(16.5, -26.0, 0.3);
    bb(-0.9, 0.72, -0.4, 0.9, 0.78, 0.4, 0x9a7a58); for (const z of [-0.7, 0.7]) bb(-0.9, 0.42, z - 0.13, 0.9, 0.47, z + 0.13, 0x9a7a58);
    for (const x of [-0.7, 0.7]) { boxR(0.08, 0.82, 0.08, 0x7a6048, x, 0.4, -0.3, 0.45); boxR(0.08, 0.82, 0.08, 0x7a6048, x, 0.4, 0.3, -0.45); }
    XF = null;
    // ---- the old Houghton Highway bridge's closed approach (x -46..-36): a stub of road and a padded barrier
    gnd(-46, -4, -36, 36, 0.02, M.vc, 4, 0x55585c); for (const x of [-46.2, -36.2]) bb(x, 0, -4, x + 0.4, 0.12, 36, 0xdedad0);
    // ---- trunks of the two Norfolk pines (tiers instanced)
    for (const [x, z, h] of PINES_C) cyl(0.12, 0.34, h, 6, 0x6a5240, x, h / 2, z);
    root.add(b.done());
  }
  const PINES_C = [[17, -40, 19], [20.5, -8, 22], [-30, -70, 18], [-52, -20, 21]];
  const PINES_B = [[-14, 790, 20], [-22, 840, 22], [-8, 870, 18], [-40, 820, 21]];

  // ---------------------------------------------------------- Region D: the deck (static)
  const PIER_Z = []; for (let k = 1; k <= 29; k++) { const z = 40 + 24 * k; if (z !== 400) PIER_Z.push(z); }   // 28 piers (nav span 376..424)
  const LAMPS = [];   // [x, z, ry, y] (ry 0: arm toward -X)
  for (let k = 0; k <= 19; k++) LAMPS.push([6.25, 58 + 36 * k, 0]);
  for (let k = 0; k <= 18; k++) LAMPS.push([-6.30, 76 + 36 * k, PI]);
  LAMPS.push([12.4, -42, 0]); for (const z of [-18, 18]) LAMPS.push([10.0, z, 0]);
  for (const z of [-54, -30, -6, 18, 796, 832, 868]) LAMPS.push([-6.8, z, PI]);
  const CHAN = [[-26, 380, 0x3ac85a, 0], [26, 380, 0x3ac85a, 0], [-26, 420, 0xff3a3a, 0], [26, 420, 0xff3a3a, 0], [26, 650, 0x3ac85a, 1]];
  function buildRegionD(root) {
    b = new Builder(); XF = null;
    along(-6.7, 8.7, -1.4, -0.02, 40, 760, CONC);                                         // the slab
    along(-6.78, -6.6, -0.62, 0.06, 40, 760, 0xb4b0a6, { caps: false }); along(8.6, 8.78, -0.62, 0.06, 40, 760, 0xb4b0a6, { caps: false });   // fascias
    ribbon(-6.1, 6.1, 0, 40, 760, M.road, 12);
    for (const z of PIER_Z) { const y = deckY(z); bb(-6.1, y + 0.002, z - 0.04, 6.1, y + 0.012, z + 0.04, 0x3c3f44); }   // expansion joints
    // west: concrete barrier (0.85) + steel railing to 1.30 (posts instanced); east: foam-capped barrier, the shared path, the outer railing
    along(-6.45, -6.10, -0.02, 0.85, 40, 760, CONC); along(-6.47, -6.08, -0.02, 0.1, 40, 760, CONCD, { caps: false });
    along(-6.31, -6.25, 1.24, 1.30, 40, 760, GALV); along(-6.30, -6.26, 1.04, 1.08, 40, 760, GALV);
    along(6.10, 6.40, -0.02, 0.75, 40, 760, CONC); along(6.07, 6.43, 0.75, 0.88, 40, 760, FOAM);
    ribbon(6.40, 8.40, 0.055, 40, 760, M.conc, 2, 0xffffff, 2);
    along(8.40, 8.56, -0.02, 0.12, 40, 760, CONCD); along(8.45, 8.51, 1.24, 1.30, 40, 760, GALV); along(8.46, 8.50, 0.64, 0.68, 40, 760, GALV);
    // the channel markers (green starboard cones / red port cans on piles) and the tall beacon pole at (26, 650)
    for (const [x, z, col, tall] of CHAN) {
      const top = tall ? 3.2 : -1.2, c3 = col === 0x3ac85a ? 0x3a9a4a : 0xc8302c;
      cyl(0.22, 0.26, top - WY + 0.5, 8, tall ? 0xe8e4dc : 0x5a5e62, x, (top + WY - 0.5) / 2, z);
      if (tall) for (let k = 0; k < 4; k++) cyl(0.235, 0.235, 0.9, 8, 0xc8302c, x, WY + 1.5 + k * 1.9, z);
      bb(x - 0.4, top - 0.2, z - 0.4, x + 0.4, top - 0.1, z + 0.4, 0x7a7e84);
      if (col === 0x3ac85a && !tall) { const g = new THREE.ConeGeometry(0.42, 0.8, 4); g.rotateY(PI / 4); g.translate(x, top + 0.3, z); put(g, c3); }
      else if (!tall) cyl(0.32, 0.32, 0.7, 8, c3, x, top + 0.25, z);
      else bb(x - 0.3, top - 0.1, z - 0.3, x + 0.3, top + 0.1, z + 0.3, 0x3a9a4a);
    }
    // the old Houghton Highway bridge (x -46..-36): deck y -1.0, parapets, ramps up to the land at both ends, padded barrier
    along(-46, -36, -1.8, -1.0, 44, 752, 0xb4b0a6, { flat: true });
    gnd(-45.75, 44, -36.25, 752, -0.985, M.vc, 4, 0x63666a);
    for (let z = 46; z < 750; z += 12) bb(-41.06, -0.982, z, -40.94, -0.975, z + 6, 0xb8b8b0);
    along(-46, -45.72, -1.0, -0.32, 44, 752, CONCD, { flat: true }); along(-36.28, -36, -1.0, -0.32, 44, 752, CONCD, { flat: true });
    for (const [zc, s] of [[40, 1], [756, -1]]) boxR(10, 0.8, 8.06, 0xb4b0a6, -41, -0.9, zc, s * Math.atan2(1, 8));
    for (const [zc, s] of [[40, 1], [756, -1]]) boxR(9.5, 0.02, 8.06, 0x63666a, -41, -0.5 + 0.006, zc, s * Math.atan2(1, 8));
    qbb(-45.7, -0.62, 44.6, -36.3, 0.45, 45.2); for (let x = -45; x < -36; x += 2.2) bb(x, 0.45, 44.7, x + 1.0, 0.5, 45.1, RED);
    root.add(b.done({ y0: WY }));
  }
  // ---------------------------------------------------------- Region B: Brighton, the boardwalk (static)
  const WALKS = [[8.4, 775.9, 25.1, 778.1], [22.9, 778.1, 25.1, 801.1], [25.1, 798.9, 44, 801.1], [44, 798, 47, 803]];
  const RAILS = [   // [x0, z0, x1, z1, y0, y1]: rail centre lines (posts every 2 m) — also the framing colliders
    [8.4, 775.8, 22.4, 775.8, 0, BWY], [22.4, 775.8, 25.2, 775.8, BWY, BWY], [8.4, 778.2, 22.4, 778.2, 0, BWY], [22.4, 778.2, 22.8, 778.2, BWY, BWY],
    [22.8, 778.2, 22.8, 801.2, BWY, BWY], [25.2, 775.8, 25.2, 798.8, BWY, BWY], [25.2, 798.8, 44, 798.8, BWY, BWY], [22.8, 801.2, 44, 801.2, BWY, BWY],
    [44, 798, 47, 798, BWY, BWY], [47, 798, 47, 803, BWY, BWY], [44, 803, 47, 803, BWY, BWY], [44, 798, 44, 798.8, BWY, BWY], [44, 801.2, 44, 803, BWY, BWY],
  ];
  function curveRoad() {   // the Brighton road curving off to -X after z 880 (a quarter arc r 55 about (-55, 880), then straight)
    const P = [], UV = [], N = 14, rr = 55, cx = -55, cz = 880;
    const pt = (th, w) => [cx + (rr + w) * Math.cos(th), 0, cz + (rr + w) * Math.sin(th)];
    for (let i = 0; i < N; i++) {
      const t0 = i / N * H, t1 = (i + 1) / N * H, v0 = -(rr * t0) / 12, v1_ = -(rr * t1) / 12;
      Q(P, pt(t0, -6.1), pt(t1, -6.1), pt(t1, 6.1), pt(t0, 6.1));
      UV.push(0, v0, 0, v1_, 1, v1_, 0, v0, 1, v1_, 1, v0);
    }
    put(geoP(P, UV), 0xffffff, M.road);
    const P2 = [], UV2 = [];   // the straight beyond (x -55 -> -90 at z 935 ± 6.1)
    Q(P2, [-55, 0, 928.9], [-90, 0, 928.9], [-90, 0, 941.1], [-55, 0, 941.1]); UV2.push(1, 0, 1, -35 / 12, 0, -35 / 12, 1, 0, 0, -35 / 12, 0, 0);
    put(geoP(P2, UV2), 0xffffff, M.road);
  }
  function plank(x0, z0, x1, z1, y, alongX, hex) {   // planks across the walk, 0.2 m pitch
    if (alongX) for (let x = x0; x < x1 - 0.01; x += 0.2) bb(x + 0.01, y - 0.05, z0, Math.min(x1, x + 0.19), y, z1, ((x * 5) | 0) % 3 ? hex : 0x8a745c);
    else for (let z = z0; z < z1 - 0.01; z += 0.2) bb(x0, y - 0.05, z + 0.01, x1, y, Math.min(z1, z + 0.19), ((z * 5) | 0) % 3 ? hex : 0x8a745c);
  }
  const embY = (x) => (x <= 8.6 ? 0 : x >= 12 ? MUDY : -4.4 * (x - 8.6) / 3.4);
  function buildRegionB(root) {
    b = new Builder(); XF = null;
    gnd(-80, 760, 8.6, 960, -0.03, M.grass, 3, GRASSB);
    ribbon(-6.1, 6.1, 0, 760, 880, M.road, 12); curveRoad();
    bb(-6.1, 0, 760, -5.9, 0.1, 880, 0xdedad0); bb(-6.7, -0.03, 760, -6.1, 0.03, 880, 0xc8c2b4);
    // east: the foam-capped barrier with the gap z 766..776 (padded end blocks), the path, the outer railing (gap at W1)
    for (const [z0, z1] of [[760, 766], [776, 900]]) { along(6.10, 6.40, -0.02, 0.75, z0, z1, CONC); along(6.07, 6.43, 0.75, 0.88, z0, z1, FOAM); }
    qbb(6.02, 0, 765.5, 6.48, 0.95, 766.1); qbb(6.02, 0, 775.9, 6.48, 0.95, 776.5);
    gnd(6.1, 766, 6.4, 776, 0.05, M.conc, 2);
    ribbon(6.40, 8.40, 0.055, 760, 900, M.conc, 2, 0xffffff, 2);
    for (const [z0, z1] of [[760, 775.9], [778.1, 900]]) { along(8.40, 8.56, -0.02, 0.12, z0, z1, CONCD); along(8.45, 8.51, 1.24, 1.30, z0, z1, GALV); along(8.46, 8.50, 0.64, 0.68, z0, z1, GALV); }
    // the sea wall at z 760 (west of the deck), the abutment, the old bridge's south ramp lands here
    bb(-80, -5.4, 759.5, -6.7, 0.12, 760.1, 0xb8a888); bb(-80, 0.0, 759.5, -6.7, 0.16, 760.3, 0xd2c6a8);
    bb(-6.7, -5.4, 758, 8.7, -1.4, 760.5, 0xb0aca2);
    // the embankment (riprap) from the path down to the mud, z 758..900
    { const P = []; for (let z = 758; z < 900; z += 10) { const z1 = Math.min(900, z + 10); Q(P, [8.6, 0.02, z], [8.6, 0.02, z1], [12.2, MUDY - 0.05, z1], [12.2, MUDY - 0.05, z]); } put(geoP(P), 0x8a8274); }
    bb(8.56, -0.4, 758, 8.7, 0.06, 900, 0xb8b0a0);
    // the gantry at z 800 (blank panels facing the traffic, AR BRIGHTON)
    for (const x of [-7.2, 8.0]) { bb(x - 0.2, 0, 799.8, x + 0.2, 6.6, 800.2, 0x9aa2aa); qbb(x - 0.3, 0, 799.7, x + 0.3, 1.4, 800.3); }
    bb(-7.4, 6.0, 799.8, 8.2, 6.6, 800.2, 0x9aa2aa);
    for (const x of [-3.6, 0, 3.6]) { bb(x - 1.62, 4.9, 799.66, x + 1.62, 6.52, 799.8, 0xc8ced2); tq(3.2, 1.6, A_BLANK, x, 5.71, 799.655, PI); }
    // ---- the boardwalk: W1 (ramp, x 8.4 -> 22.4, then the corner), W2, W3, the lookout; stringers, piles, rails
    const TIM = TIMBER;
    { const L = Math.hypot(14, 2.6), sl = Math.atan2(2.6, 14);
      for (let x = 8.4; x < 22.39; x += 0.2) { const xc = x + 0.1, y = floor(xc, 777) - 0.025; boxR(0.19, 0.05, 2.2, ((x * 5) | 0) % 3 ? TIM : 0x8a745c, xc, y, 777, 0, 0, -sl); }
      for (const z of [776.1, 777.9]) boxR(L, 0.2, 0.12, 0x6a5a48, 15.4, -1.3 - 0.15, z, 0, 0, -sl); }
    plank(22.4, 775.9, 25.1, 778.1, BWY, true, TIM);
    plank(22.9, 778.1, 25.1, 801.1, BWY, false, TIM);
    plank(25.1, 798.9, 44, 801.1, BWY, true, TIM);
    plank(44, 798, 47, 803, BWY, true, TIM);
    for (const [x0, z0, x1, z1] of [[22.4, 775.9, 25.1, 778.1], [22.9, 778.1, 25.1, 801.1], [25.1, 798.9, 44, 801.1], [44, 798, 47, 803]]) bb(x0 + 0.05, BWY - 0.25, z0 + 0.05, x1 - 0.05, BWY - 0.05, z1 - 0.05, 0x6a5a48);
    const pile = (x, z) => { const yb = Math.max(MUDY, embY(x)) - 0.3, yt = floor(x, z) - 0.06; if (yt > yb + 0.1) bb(x - 0.08, yb, z - 0.08, x + 0.08, yt, z + 0.08, 0x5a4c3e); };
    for (let x = 9.4; x < 25; x += 2) { pile(x, 776.0); pile(x, 778.0); }
    for (let z = 780; z < 801; z += 2) { pile(23.0, z); pile(25.0, z); }
    for (let x = 27; x < 47; x += 2) { pile(x, 799.0); pile(x, 801.0); }
    // rails: top (0.9) and mid (0.45) along every RAILS line; the posts are instanced (railPosts)
    for (const [x0, z0, x1, z1, ya, yb] of RAILS) {
      const L = Math.hypot(x1 - x0, z1 - z0), alongX = Math.abs(x1 - x0) > Math.abs(z1 - z0), sl = Math.atan2(yb - ya, L);
      for (const h of [0.9, 0.45]) {
        const t = h > 0.5 ? 0.07 : 0.05, col = h > 0.5 ? 0x8a7258 : 0x7a6450, y = (ya + yb) / 2 + h;
        if (alongX) boxR(L + 0.06, t, 0.06, col, (x0 + x1) / 2, y, z0, 0, 0, sl); else boxR(0.06, t, L + 0.06, col, x0, y, (z0 + z1) / 2);
      }
    }
    // ---- trunks of the Brighton pines
    for (const [x, z, h] of PINES_B) cyl(0.12, 0.34, h, 6, 0x6a5240, x, h / 2, z);
    root.add(b.done({ y0: MUDY }));
  }

  // ---------------------------------------------------------- instanced repeats (static), water, mud, mangroves
  const distRect = (x, z, r) => Math.hypot(Math.max(r[0] - x, 0, x - r[2]), Math.max(r[1] - z, 0, z - r[3]));
  function segD(x, z, ax, az, bx, bz) {
    const dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz, t = L2 ? Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L2)) : 0;
    return Math.hypot(x - ax - dx * t, z - az - dz * t);
  }
  const MANG = [];   // [x, z, s, ry]: 70 grey mangroves, clear of the walks' decks and the boardwalk lenses' sight lines
  function mangroveList() {
    if (MANG.length) return MANG;
    seed = 71;
    for (let guard = 0; MANG.length < 70 && guard < 20000; guard++) {
      let x, z;
      if (guard % 3 === 0) { x = 12.5 + rnd() * 57.5; z = 745 + rnd() * 115; }
      else { const w = WALKS[1 + Math.floor(rnd() * 3)], px = w[0] + rnd() * (w[2] - w[0]), pz = w[1] + rnd() * (w[3] - w[1]), a = rnd() * TAU, d = 2 + rnd() * 7; x = px + Math.cos(a) * d; z = pz + Math.sin(a) * d; }
      const s = 0.82 + rnd() * 0.42, cr = 1.8 * s;
      if (x < 12.5 || x > 70 || z < 745 || z > 860) continue;
      if (z > 771 && z < 783 && x < 27) continue;                                             // the W1 corridor (and the drones' edge)
      let dw = 99; for (const w of WALKS) dw = Math.min(dw, distRect(x, z, w));
      if (dw < 1.05) continue;                                                                // roots clear of the decks (canopies may overhang)
      if (segD(x, z, 36, 806, 24, 786) < cr + 1.2 || segD(x, z, 36, 806, 29.5, 800) < cr + 1.0 || segD(x, z, 20, 777, 9.6, 772) < cr + 1.5) continue;
      if (Math.hypot(x - 36, z - 806) < cr + 3 || Math.hypot(x - 20, z - 777) < cr + 3) continue;
      let ok = true; for (const m of MANG) if (Math.hypot(m[0] - x, m[1] - z) < 1.45 * (m[2] + s)) { ok = false; break; }
      if (ok) MANG.push([x, z, s, rnd() * TAU]);
    }
    return MANG;
  }
  function mangroveTrunk() {   // local: mud at y 0; stilt roots, a crooked trunk, four limbs into the canopy
    for (let k = 0; k < 8; k++) {
      const a = k / 8 * TAU + 0.3, r0 = 0.8 + (k % 3) * 0.14, cx = Math.cos(a), cz = Math.sin(a);
      seg(cx * r0, -0.1, cz * r0, cx * r0 * 0.68, 0.55, cz * r0 * 0.68, 0.035, 0x5e5446, 4);
      seg(cx * r0 * 0.68, 0.55, cz * r0 * 0.68, cx * 0.14, 0.95, cz * 0.14, 0.04, 0x6a5e4e, 4);
    }
    cyl(0.1, 0.15, 1.6, 6, BARK, 0.05, 1.65, 0);
    for (const [x, z] of [[0.9, 0.4], [-0.8, 0.6], [0.1, -0.9], [-0.5, -0.6]]) seg(0.05, 2.1, 0, x, 2.75, z, 0.055, BARK, 4);
  }
  function mangroveCanopy() {   // grey-green blobs, r ~1.8 m, from 2.3 to 3.8 m above the mud (s = 1)
    ico(1.0, CANOPY, 0, 3.05, 0, 0.62, undefined, 1.8);
    ico(0.9, 0x6a8654, 0.95, 3.25, 0.55, 0.58, undefined, 1.5);
    ico(0.85, 0x566e44, -0.9, 3.15, -0.5, 0.6, undefined, 1.45);
    ico(0.8, 0x627c4c, -0.4, 3.2, 0.95, 0.6, undefined, 1.35);
    ico(0.6, 0x728c5a, 0.15, 3.65, -0.1, 0.7, undefined, 1.3);
  }
  function buildRepeats(root) {
    // railing posts: deck east outer (x 8.48, 1.30 high) and west (on the barrier, 0.85..1.30); Brighton's path
    const posts = [];
    for (let z = 40; z <= 760.01; z += 2.4) { const y = deckY(z); posts.push([8.48, y, z, 0, [1, 1.30, 1]], [-6.28, y + 0.85, z, 0, [1, 0.45, 1]]); }
    for (let z = 762.4; z <= 900; z += 2.4) if (z < 775.7 || z > 778.3) posts.push([8.48, 0, z, 0, [1, 1.30, 1]]);
    IM(geoOf(() => bb(-0.03, 0, -0.03, 0.03, 1, 0.03, GALV)), M.vc, posts, 'railing_posts', root);
    // lamps: 9 m galvanised poles with a 2.2 m arm over the road (pole IM + head IM)
    const lamps = new THREE.Group(); lamps.name = 'lamps'; root.add(lamps);
    const lst = LAMPS.map(([x, z, ry]) => [x, z > 40 && z < 760 && x > -7 && x < 9 ? deckY(z) : 0, z, ry]);
    IM(geoOf(() => {
      cyl(0.09, 0.13, 9, 6, GALV, 0, 4.5, 0); bb(-0.18, 0, -0.18, 0.18, 0.25, 0.18, 0x9aa2aa);
      seg(0, 8.55, 0, -0.55, 9.05, 0, 0.06, GALV); seg(-0.55, 9.05, 0, -2.2, 9.02, 0, 0.055, GALV);
      bb(-2.55, 8.88, -0.17, -1.85, 9.06, 0.17, 0x8a929a);
    }), M.vc, lst, 'lamp_poles', lamps);
    R.lampHeads = IM(geoOf(() => bb(-2.5, 8.83, -0.13, -1.9, 8.88, 0.13, 0xffffff)), M.lamp, lst, 'lamp_heads', lamps);
    // piers: two columns each (thicker on the navigation span) + a cap beam under the slab
    const cols = [], caps = [];
    for (const z of PIER_Z) {
      const nav = z === 376 || z === 424, s = nav ? 1.4 : 1, top = deckY(z) - 1.4 - 0.8;
      for (const x of [-3.0, 5.0]) cols.push([x, WY - 0.5, z, 0, [s, top - (WY - 0.5), s]]);
      caps.push([1.0, top, z, 0, nav ? [1.02, 1, 1.3] : 1]);
    }
    IM(geoOf(() => { bb(-0.6, 0, -0.6, 0.6, 0.11, 0.6, 0x5e6a58); bb(-0.6, 0.11, -0.6, 0.6, 1, 0.6, 0xbab6ac); }), M.vc, cols, 'pier_columns', root);
    IM(geoOf(() => { bb(-7.5, 0, -0.8, 7.5, 0.8, 0.8, 0xb4b0a6); bb(-7.5, -0.08, -0.6, 7.5, 0, 0.6, 0x9a968c); }), M.vc, caps, 'pier_caps', root);
    // the old bridge's 36 pile bents
    const ob = []; for (let k = 0; k < 36; k++) ob.push([0, WY - 0.5, 50 + 20 * k, 0]);
    IM(geoOf(() => { for (const x of [-44, -41, -38]) { bb(x - 0.25, 0, -0.25, x + 0.25, 0.6, 0.25, 0x5e6a58); bb(x - 0.25, 0.6, -0.25, x + 0.25, 3.3, 0.25, 0xa8a49a); } bb(-45.8, 3.3, -0.4, -36.2, 3.7, 0.4, 0xb0aca2); }), M.vc, ob, 'old_bridge_piers', root);
    // rocks at the sea walls (x 22 and z 36) and the Brighton embankment toe
    const rocks = []; seed = 19;
    for (let i = 0; i < 60; i++) {
      const k = rnd();
      if (k < 0.45) rocks.push([22.6 + rnd() * 2.6, WY + 0.2 + rnd() * 0.9, -60 + rnd() * 96, rnd() * 3, [0.9 + rnd() * 0.9, 0.7 + rnd() * 0.6, 0.9 + rnd() * 0.8]]);
      else if (k < 0.8) { const x = rnd() < 0.5 ? -60 + rnd() * 52 : 9.5 + rnd() * 12.5; rocks.push([x, WY + 0.2 + rnd() * 0.9, 36.6 + rnd() * 2.6, rnd() * 3, [0.9 + rnd() * 0.9, 0.7 + rnd() * 0.6, 0.9 + rnd() * 0.8]]); }
      else rocks.push([12.0 + rnd() * 1.5, MUDY + 0.1 + rnd() * 0.3, 762 + rnd() * 120, rnd() * 3, [0.6 + rnd() * 0.5, 0.5 + rnd() * 0.3, 0.6 + rnd() * 0.5]]);
    }
    for (let i = 0; i < 130; i++) { const x = 8.9 + rnd() * 3.1; rocks.push([x, embY(x) - 0.12, i < 90 ? 758 + rnd() * 44 : 802 + rnd() * 60, rnd() * 3, [0.35 + rnd() * 0.35, 0.22 + rnd() * 0.2, 0.35 + rnd() * 0.3]]); }   // riprap on the Brighton embankment
    IM(geoOf(() => ico(0.9, 0x8a7a66, 0, 0, 0, 0.8)), M.vc, rocks, 'rocks', root);
    // Norfolk pines (6 tiers each)
    const tierG = geoOf(() => { const g = new THREE.ConeGeometry(1, 1.6, 9, 2); g.translate(0, 0.5, 0); const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const r = Math.hypot(p.getX(i), p.getZ(i)); if (r > 0.5) p.setY(i, p.getY(i) - (r - 0.5) * 0.35); } put(g, 0x2e5a3a); ico(0.3, 0x3a6a44, 0, 1.25, 0, 1.6); });
    const tiers = [];
    for (const [x, z, h] of [...PINES_C, ...PINES_B]) for (let t = 0; t < 6; t++) { const k = 1 - t / 6; tiers.push([x, h * (0.25 + t * 0.125), z, t * 0.9, [0.6 + h * 0.16 * k, 1.1 + 0.6 * k, 0.6 + h * 0.16 * k]]); }
    IM(tierG, M.vc, tiers, 'pines', root);
    // houses: Clontarf west (x -14..-62) and Brighton (x -30..-72): weatherboard walls (instance colour) + roofs
    const houses = []; seed = 23;
    for (let i = 0; i < 8; i++) { const z = -190 + i * 26 + rnd() * 6, x = i % 2 ? -16 - rnd() * 6 : -58 + rnd() * 6; if (x > -47 && x < -35 && z > -10) continue; houses.push([x, 0, z, (rnd() - 0.5) * 0.2 + (i % 2 ? H : -H), [10 + rnd() * 2, 1, 8 + rnd() * 2]]); }
    for (let i = 0; i < 6; i++) houses.push([-32 - (i % 2) * 22 - rnd() * 6, 0, 790 + Math.floor(i / 2) * 32 + rnd() * 6, (rnd() - 0.5) * 0.2 + (i % 2 ? -H : H), [10 + rnd() * 2, 1, 8 + rnd() * 2]]);
    const hW = IM(geoOf(() => {
      bb(-0.5, 0.5, -0.5, 0.5, 3.3, 0.5, 0xffffff);
      for (const x of [-0.42, 0.42]) for (const z of [-0.42, 0.42]) bb(x - 0.02, 0, z - 0.02, x + 0.02, 0.5, z + 0.02, 0xd8d0c4);
      for (const x of [-0.3, -0.1, 0.2, 0.36]) bb(x - 0.06, 1.4, 0.5, x + 0.06, 2.6, 0.512, 0x4a5662);
      bb(-0.5, 0.5, 0.5, 0.5, 0.62, 0.75, 0xc8c0b0); for (let x = -0.48; x <= 0.48; x += 0.12) bb(x - 0.006, 0.62, 0.72, x + 0.006, 1.6, 0.73, 0xe8e4dc);
    }), M.vc, houses, 'houses', root);
    for (let i = 0; i < houses.length; i++) hW.setColorAt(i, tc.set([0xf4f0e8, 0xe8ecf0, 0xf0e4d8, 0xe4ecdc, 0xdce4ec][i % 5]));
    hW.instanceColor.needsUpdate = true;
    IM(geoOf(() => { const g = new THREE.ConeGeometry(0.76, 1.7, 4); g.rotateY(PI / 4); g.translate(0, 4.15, 0); put(g, 0x8a8e94); bb(-0.56, 3.28, -0.56, 0.56, 3.32, 0.56, 0x6a6e74); }), M.vc, houses, 'house_roofs', root);
    // gum trees among the houses
    const gums = []; seed = 47;
    for (let i = 0; i < 18; i++) { const br = i >= 11; gums.push([br ? -12 - rnd() * 60 : -12 - rnd() * 60, 0, br ? 770 + rnd() * 120 : -195 + rnd() * 225, rnd() * 3, 0.8 + rnd() * 0.5]); }
    IM(geoOf(() => { cyl(0.16, 0.24, 3.6, 6, 0xb8aa98, 0, 1.8, 0); ico(2.2, 0x5a7a48, 0, 5.0, 0, 0.8); ico(1.5, 0x6a8a52, 0.9, 5.6, 0.5, 0.8); ico(1.3, 0x4e6e40, -0.8, 4.6, -0.6, 0.8); }), M.vc, gums, 'gums', root);
    // padded bollards: the island noses, the footpath kerb, the dock edge
    const bol = [[-1.75, 0.15, -5.2], [1.75, 0.15, -5.2], [6.35, 0, 4.0], [6.35, 0, 7.0]];
    for (const z of [-40, -34, -28, -22, -16]) bol.push([6.35, 0, z]);
    R.bollards = bol;
    IM(geoOf(() => { cyl(0.16, 0.16, 0.82, 10, FOAM, 0, 0.47, 0); cyl(0.165, 0.165, 0.06, 10, SEAM, 0, 0.06, 0); cyl(0.11, 0.11, 0.06, 10, 0x3a3e44, 0, 0.91, 0); cyl(0.05, 0.11, 0.04, 10, 0x3a3e44, 0, 0.96, 0); for (const y of [0.3, 0.6]) cyl(0.163, 0.163, 0.02, 10, SEAM, 0, y, 0); }), M.vc, bol.map((p) => [p[0], p[1], p[2], 0]), 'bollards', root);
    // moored boats
    IM(geoOf(() => {
      const g = new THREE.CylinderGeometry(1.2, 0.9, 6.5, 8, 1); g.rotateX(H); g.scale(1, 0.45, 1); g.translate(0, 0.35, 0); put(g, 0xf2f2ee);
      bb(-0.8, 0.75, -1.8, 0.8, 1.6, 0.6, 0xe8ecf0); bb(-0.82, 1.1, 0.4, 0.82, 1.45, 0.62, 0x3a4a5a); bb(-0.7, 1.6, -1.6, 0.7, 1.68, 0.4, 0xc8ccd0);
      cyl(0.03, 0.03, 3.2, 4, 0xc8ccd0, 0, 3.0, -0.6); bb(-1.22, 0.3, -2.8, 1.22, 0.42, 2.8, 0x2a5a8a);
    }), M.vc, [[60, WY - 0.15, 300, 0.4], [90, WY - 0.15, 520, -0.8], [-80, WY - 0.15, 610, 1.9]], 'boats', root);
    // the boardwalk's rail posts (every 2 m along each rail)
    const bwp = [];
    for (const [x0, z0, x1, z1, ya, yb] of RAILS) { const L = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(L / 2)); for (let i = 0; i <= n; i++) { const u = i / n; bwp.push([x0 + (x1 - x0) * u, ya + (yb - ya) * u - 0.05, z0 + (z1 - z0) * u, 0]); } }
    IM(geoOf(() => bb(-0.05, 0, -0.05, 0.05, 1.0, 0.05, 0x7a6450)), M.vc, bwp, 'boardwalk_posts', root);
    // mangroves: trunks + stilt roots, canopies, 300 pneumatophores
    const mg = new THREE.Group(); mg.name = 'mangroves'; root.add(mg);
    const ML = mangroveList(), mt = ML.map(([x, z, s, ry]) => [x, MUDY, z, ry, s]);
    IM(geoOf(mangroveTrunk), M.vc, mt, 'mangrove_trunks', mg);
    IM(geoOf(mangroveCanopy), M.vc, mt, 'mangrove_canopies', mg);
    const pn = []; seed = 83;
    for (let i = 0; i < 300; i++) { const t = ML[Math.floor(rnd() * ML.length)], a = rnd() * TAU, d = 0.9 + rnd() * 2.6; const x = t[0] + Math.cos(a) * d, z = t[1] + Math.sin(a) * d; if (x < 12.3) continue; pn.push([x, MUDY - 0.02, z, rnd() * 3, 0.7 + rnd() * 0.8]); }
    IM(geoOf(() => { cyl(0.004, 0.022, 0.26, 4, 0x6a5e4e, 0, 0.13, 0); }), M.vc, pn, 'pneumatophores', mg);
    // contact shadows for the furniture (one instanced draw, the shared blob material)
    if (typeof blobShadow === 'function') {
      const bl = blobShadow(), lst2 = [[11.5, 0.035, -34.0, 0, [1.4, 1, 2.6]], [11.6, 0.035, -9.0, 0, 0.9], [16.5, 0.02, -26.0, 0.3, [3, 1, 2.4]]];
      for (const p of bol) lst2.push([p[0], p[1] + 0.035, p[2], 0, 0.6]);
      for (const [x, z] of [...PINES_C, ...PINES_B]) lst2.push([x, x > 0 && z < 0 ? 0.02 : (z > 700 ? -0.01 : 0.02), z, 0, 7]);
      const bi = IM(bl.geometry.clone(), bl.material, lst2, 'blobs', root); bi.renderOrder = 1;
    }
  }
  function waterGrid() {   // x -700..700, z -600..1400 in 50 m cells: near the bridge #5aa9c4, far #3f86a8 (world UVs, 7 m tile)
    const P = [], UV = [], C = [], NX = 28, NZ = 40, x0 = -700, z0 = -600, S = 50;
    const col = (x) => { const k = smooth((Math.abs(x - 1) - 30) / 300); tc.setRGB(0, 0, 0); tc.set(0x5aa9c4).lerp(tc2.set(0x3f86a8), k); return tc; };
    for (let i = 0; i < NX; i++) for (let j = 0; j < NZ; j++) {
      const xa = x0 + i * S, xb = xa + S, za = z0 + j * S, zb = za + S;
      for (const [x, z] of [[xa, za], [xa, zb], [xb, zb], [xa, za], [xb, zb], [xb, za]]) { P.push(x, WY, z); UV.push(x / 7, -z / 7); const c = col(x); C.push(c.r * 1.35, c.g * 1.35, c.b * 1.35); }
    }
    const g = geoP(P, UV); g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3)); b.add(g, M.water);
  }
  function mudFlats() {
    gnd(8.6, 730, 90, 880, MUDY, M.mud, 6, 0xffffff);
    const P = [];   // skirts down to the water on the open sides
    Q(P, [8.6, MUDY, 730], [90, MUDY, 730], [90, WY - 0.3, 730], [8.6, WY - 0.3, 730]);
    Q(P, [90, MUDY, 730], [90, MUDY, 880], [90, WY - 0.3, 880], [90, WY - 0.3, 730]);
    Q(P, [90, MUDY, 880], [8.6, MUDY, 880], [8.6, WY - 0.3, 880], [90, WY - 0.3, 880]);
    put(geoP(P), 0x4e4436, M.vc2);
  }

  // ---------------------------------------------------------- props
  const GATE_DEF = [['gate_R', -6.3, 4.2], ['gate_M', -1.75, 3.2], ['gate_L', 1.75, 5.2]];   // name, post x, arm length (+X)
  function gateArm(len) {   // pivot at the origin, the arm along +X: 0.1 x 0.1, red bands every 0.5 m, the 0.25 foam tip cube
    bb(-0.55, -0.1, -0.08, -0.14, 0.1, 0.08, 0x5a6068); bb(-0.14, -0.09, -0.07, 0.14, 0.09, 0.07, 0x8a929a);
    let k = 0; for (let x = 0.14; x < len - 0.25; x += 0.5, k++) bb(x, -0.05, -0.05, Math.min(len - 0.25, x + 0.5), 0.05, 0.05, k % 2 ? RED : 0xf4f4f2);
    bb(len - 0.25, -0.125, -0.125, len, 0.125, 0.125, FOAM); bb(len - 0.27, -0.13, -0.13, len - 0.23, 0.13, 0.13, SEAM);
  }
  function boothShell() {   // world coordinates: x 7.0..9.0, z -3.0..-0.6, walls to 2.70, roof to 2.85
    const X0 = 7.0, X1 = 9.0, Z0 = -3.0, Z1 = -0.6, W = 0.06, TOP = 2.7;
    bb(X0 - 0.06, 0, Z0 - 0.06, X1 + 0.06, 0.12, Z1 + 0.06, 0xb8b4aa);
    bb(X0 + W, 0.0, Z0 + W, X1 - W, 0.025, Z1 - W, 0x48525a);                                        // lino
    bb(X0, 0.12, Z0, X1, 1.0, Z0 + W, BOOTH); bb(X0, 2.05, Z0, X1, TOP, Z0 + W, BOOTH);                  // north wall + the hatch
    bb(X0, 1.0, Z0, 7.3, 2.05, Z0 + W, BOOTH); bb(8.7, 1.0, Z0, X1, 2.05, Z0 + W, BOOTH);
    bb(X0, 0.12, Z0, X0 + W, 1.0, Z1, BOOTH); bb(X0, 2.05, Z0, X0 + W, TOP, Z1, BOOTH);                  // west wall + the side window
    bb(X0, 1.0, Z0, X0 + W, 2.05, -1.95, BOOTH); bb(X0, 1.0, -0.95, X0 + W, 2.05, Z1, BOOTH);
    bb(X0, 0.12, Z1 - W, 7.3, TOP, Z1, BOOTH); bb(8.1, 0.12, Z1 - W, X1, TOP, Z1, BOOTH); bb(7.3, 2.1, Z1 - W, 8.1, TOP, Z1, BOOTH);   // south + door
    bb(7.31, 0.12, Z1 - 0.045, 8.09, 2.09, Z1 - 0.015, 0xe2e5e8); bb(7.45, 1.3, Z1 - 0.05, 7.95, 1.9, Z1 - 0.01, 0x7a96aa); bb(7.95, 1.0, Z1 - 0.06, 8.02, 1.08, Z1 - 0.04, 0x8a929a);
    bb(X1 - W, 0.12, Z0, X1, TOP, Z1, BOOTH);                                                            // east
    gain = 0.66; const LN = 0xdcdcd6, e = 0.008;                                                          // the shaded inside: a lining
    bb(X0 + W, 0.12, Z0 + W, X1 - W, 1.0, Z0 + W + e, LN); bb(X0 + W, 2.05, Z0 + W, X1 - W, TOP, Z0 + W + e, LN); bb(X0 + W, 1.0, Z0 + W, 7.3, 2.05, Z0 + W + e, LN); bb(8.7, 1.0, Z0 + W, X1 - W, 2.05, Z0 + W + e, LN);
    bb(X0 + W, 0.12, Z0 + W, X0 + W + e, 1.0, Z1 - W, LN); bb(X0 + W, 2.05, Z0 + W, X0 + W + e, TOP, Z1 - W, LN); bb(X0 + W, 1.0, Z0 + W, X0 + W + e, 2.05, -1.95, LN); bb(X0 + W, 1.0, -0.95, X0 + W + e, 2.05, Z1 - W, LN);
    bb(X0 + W, 0.12, Z1 - W - e, 7.3, TOP, Z1 - W, LN); bb(8.1, 0.12, Z1 - W - e, X1 - W, TOP, Z1 - W, LN); bb(7.3, 2.1, Z1 - W - e, 8.1, TOP, Z1 - W, LN);
    bb(X1 - W - e, 0.12, Z0 + W, X1 - W, TOP, Z1 - W, LN); bb(X0 + W, TOP - 0.02, Z0 + W, X1 - W, TOP - 0.005, Z1 - W, 0xc8ccd0);
    bb(7.31, 0.12, Z1 - W - e - 0.03, 8.09, 2.09, Z1 - W - e, 0xd0d4d8);                                  // the door's inside
    gain = 1;
    for (const [y0, y1] of [[2.22, 2.4], [0.3, 0.38]]) {                                                  // the faded blue stripes
      bb(X0 - 0.005, y0, Z0 - 0.005, X1 + 0.005, y1, Z0, STRIPE); bb(X0 - 0.005, y0, Z1, X1 + 0.005, y1, Z1 + 0.005, STRIPE);
      bb(X0 - 0.005, y0, Z0, X0, y1, Z1, STRIPE); bb(X1, y0, Z0, X1 + 0.005, y1, Z1, STRIPE);
    }
    bb(6.75, TOP, -3.25, 9.25, 2.85, -0.35, 0xe8eaec); bb(6.73, 2.77, -3.27, 9.27, 2.79, -0.33, 0xc0c6cc);   // the roof
    for (const [cx, cz] of [[X0, Z0], [X1, Z0], [X0, Z1], [X1, Z1]]) qbb(cx - 0.08, 0.12, cz - 0.08, cx + 0.08, 2.62, cz + 0.08);   // 2040 foam corners
    bb(7.3, 0.97, -3.27, 8.7, 1.02, -3.0, 0xc8ccd0); for (const x of [7.4, 8.6]) boxR(0.04, 0.22, 0.04, 0xa8b0b8, x, 0.88, -3.14, -0.7);   // counter shelf
    gain = 0.62;                                                                                          // inside the shaded booth
    bb(7.3, 0.97, -3.0, 8.7, 1.02, -2.85, 0xc8ccd0);                                                      // inside sill
    bb(7.1, 0.76, -2.95, 8.9, 0.8, -2.45, 0x8a7a64); bb(7.12, 0.025, -2.93, 7.62, 0.76, -2.5, 0xb8b4aa);  // the desk
    bb(8.84, 0.025, -2.93, 8.88, 0.76, -2.89, 0x8a929a); bb(8.84, 0.025, -2.51, 8.88, 0.76, -2.47, 0x8a929a); bb(7.62, 0.5, -2.93, 8.86, 0.52, -2.9, 0x8a929a);
    // Teddy's old office chair (8.0, -1.75) facing -Z, seat 0.48
    cyl(0.26, 0.26, 0.03, 5, 0x3a3e44, 8.0, 0.04, -1.75); cyl(0.03, 0.03, 0.4, 6, 0x5a6068, 8.0, 0.25, -1.75);
    bb(7.76, 0.44, -1.98, 8.24, 0.52, -1.52, 0x4a5a6a); bb(7.78, 0.55, -1.52, 8.22, 1.05, -1.45, 0x4a5a6a); bb(7.84, 0.48, -1.5, 8.16, 0.6, -1.46, 0x3a3e44);
    // the inside wall behind Teddy (south wall, right of the door): the 2037 calendar, the dog, the crossword, TEDDY
    tq(0.8, 0.4, A_BOOTHIN, 8.53, 1.4, Z1 - W - 0.012, PI);
    bb(8.6, 0.025, -1.3, 8.92, 0.7, -0.7, 0xc8ccd0); bb(8.62, 0.7, -1.28, 8.9, 0.72, -0.72, 0x8a929a);
    gain = 1;
    // the radio's power lead, the ceiling lamp's rose; glass in the side window
    bb(7.07, 1.55, -2.32, 7.09, 2.6, -2.29, 0x2a2c30);
    tq(1.05, 1.0, A_FOAMTAG, X0 + 0.03, 1.525, -1.45, H, 0, M.glass);
    // the roof box (a blank sign facing the queue) and the speaker bracket
    bb(7.35, 2.85, -2.35, 8.65, 3.35, -2.15, 0xc8ced2); tq(1.24, 0.44, A_BLANK, 8.0, 3.1, -2.355, PI);
    bb(7.97, 2.85, -2.95, 8.03, 2.95, -2.6, 0x8a929a);
  }
  function radioModel() { bb(-0.1, 0, -0.03, 0.1, 0.12, 0.03, 0x8a3a2a); bb(-0.085, 0.015, -0.032, 0.02, 0.105, -0.03, 0x3a2a22); cyl(0.018, 0.018, 0.01, 8, 0xd8c8a0, 0.055, 0.06, -0.035, H); seg(0.08, 0.12, 0.0, 0.04, 0.42, 0.06, 0.004, 0xc8ccd0, 4); bb(-0.07, 0.12, -0.012, 0.07, 0.14, 0.012, 0x3a2a22); }
  function fanBase() { cyl(0.07, 0.08, 0.025, 10, 0xd8dce0, 0, 0.0125, 0); cyl(0.012, 0.012, 0.2, 6, 0xc8ccd0, 0, 0.12, 0); }
  function fanHead() {   // the motor + cage; blades are a child spinning about the head's +Z (local)
    const g = new THREE.CylinderGeometry(0.045, 0.05, 0.1, 8); g.rotateX(H); g.translate(0, 0, -0.06); put(g, 0xd8dce0);
    for (let k = 0; k < 10; k++) { const a = k / 10 * TAU; seg(Math.cos(a) * 0.13, Math.sin(a) * 0.13, 0.02, Math.cos(a + TAU / 10) * 0.13, Math.sin(a + TAU / 10) * 0.13, 0.02, 0.004, 0xc8ccd0, 3); }
    for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; seg(0, 0, 0.05, Math.cos(a) * 0.13, Math.sin(a) * 0.13, 0.02, 0.003, 0xc8ccd0, 3); }
  }
  function fanBlades() { for (let k = 0; k < 3; k++) { const a = k / 3 * TAU; boxR(0.05, 0.1, 0.008, 0x9fc8e0, Math.cos(a) * 0.065, Math.sin(a) * 0.065, 0, 0.25, 0, a + H); } cyl(0.02, 0.02, 0.02, 6, 0xd8dce0, 0, 0, 0, H); }
  function hornModel() {   // the booth speaker: a flared horn facing -Z on a bracket (origin at the horn's throat)
    const g = new THREE.CylinderGeometry(0.15, 0.055, 0.28, 10, 1, true); g.rotateX(-H); g.translate(0, 0, -0.16); put(g, 0xe2e4e6, M.vc2);
    const d = new THREE.CylinderGeometry(0.07, 0.07, 0.12, 8); d.rotateX(H); d.translate(0, 0, 0.02); put(d, 0x8a929a);
    cyl(0.135, 0.135, 0.005, 10, 0x2a2c30, 0, 0, -0.29, H);
  }
  function scooterBody(n) {   // local: origin at the hover point (floor + 0.28), facing +Z; cream fairing, navy deck + saddle
    bb(-0.25, 0, -0.72, 0.25, 0.18, 0.6, CREAM); boxR(0.5, 0.16, 0.3, CREAM, 0, 0.1, 0.7, 0.45); boxR(0.46, 0.14, 0.2, CREAM, 0, 0.08, -0.78, -0.4);
    bb(-0.21, 0.18, -0.68, 0.21, 0.2, 0.62, NAVY);                                                       // the navy deck (1.3 x 0.42)
    bb(-0.15, 0.2, -0.62, 0.15, 0.35, 0.16, 0x1c2648); bb(-0.155, 0.35, -0.62, 0.155, 0.37, 0.16, 0x26305a); bb(-0.152, 0.3, -0.27, 0.152, 0.372, -0.25, 0x101830);   // the two-up saddle
    bb(-0.26, 0.04, -0.4, 0.26, 0.14, 0.3, 0xe4dcc8);                                                    // side panels
    boxR(0.07, 0.5, 0.07, CREAM, 0, 0.4, 0.63, -0.12); bb(-0.28, 0.645, 0.6, 0.28, 0.675, 0.66, 0x26292e);   // stem + T-bar
    for (const sx of [-1, 1]) bb(sx * 0.29 - 0.04, 0.635, 0.595, sx * 0.29 + 0.04, 0.685, 0.665, 0x111111);
    boxR(0.2, 0.11, 0.05, 0x26292e, 0, 0.71, 0.63, 0.75);                                               // dash housing on the T-bar
    for (const sx of [-1, 1]) tq(0.13, 0.13, A_ST25, sx * 0.262, 0.1, -0.3, sx * H, 0, M.atlas);
    tq(0.11, 0.11, A_ST25, 0, 0.13, -0.86, PI, -0.4, M.atlas);
    bb(-0.04, 0.02, 0.83, 0.04, 0.05, 0.86, 0x26292e);
  }
  function scooterLights() { bb(-0.09, 0.07, -0.81, 0.09, 0.11, -0.79, 0xff3030); bb(-0.07, 0.1, 0.86, 0.07, 0.14, 0.87, 0xfff6e0); bb(-0.24, -0.005, -0.7, 0.24, 0.015, 0.58, 0x9fd8ff); }
  function carBody() {   // a 2040 hover-car, origin on the road under its centre, hull underside at y 0 (the IM adds the 0.32 hover)
    const W = 0xffffff;
    bb(-0.86, 0.08, -1.72, 0.86, 0.56, 1.7, W); boxR(1.72, 0.26, 0.5, W, 0, 0.3, 1.86, 0.55); boxR(1.7, 0.3, 0.4, W, 0, 0.34, -1.84, -0.4);
    bb(-0.88, 0.0, -1.95, 0.88, 0.1, 1.95, 0x2a2e34);
    bb(-0.72, 1.06, -1.0, 0.72, 1.13, 0.5, W);
    for (const [x, z] of [[-0.74, 0.52], [0.74, 0.52], [-0.74, -1.02], [0.74, -1.02]]) bb(x - 0.03, 0.56, z - 0.03, x + 0.03, 1.08, z + 0.03, W);
    for (const sx of [-1, 1]) bb(sx * 0.865, 0.28, -1.4, sx * 0.875, 0.34, 1.4, 0xd8dce0);
  }
  function carInside() { bb(-0.66, 0.56, -1.0, 0.66, 0.6, 0.5, 0x3a3e44); bb(-0.6, 0.6, -0.5, -0.12, 0.8, -0.1, 0x2a3040); bb(0.12, 0.6, -0.5, 0.6, 0.8, -0.1, 0x2a3040); ico(0.12, 0xd8a888, -0.36, 0.98, -0.18, 1.15); ico(0.125, 0x3a2a20, -0.36, 1.03, -0.22, 0.75); bb(-0.6, 0.62, 0.32, 0.6, 0.72, 0.48, 0x2a2e34); }
  function carCanopy() { bb(-0.8, 0.56, -1.12, 0.8, 1.06, 0.62, 0xffffff); }
  function carGlow() {
    for (const sx of [-1, 1]) { bb(sx * 0.6 - 0.2, 0.36, 2.0, sx * 0.6 + 0.2, 0.42, 2.05, 0xfff6e0); bb(sx * 0.62 - 0.2, 0.42, -2.0, sx * 0.62 + 0.2, 0.48, -1.96, 0xff3030); }
    for (const [x, z] of [[0.55, 1.2], [-0.55, 1.2], [0.55, -1.2], [-0.55, -1.2]]) cyl(0.26, 0.26, 0.02, 8, 0x9fd8ff, x, -0.01, z);
    bb(-0.49, 0.97, -0.3, -0.46, 1.0, -0.27, 0x6fc8ff);                                                  // the driver's chip light
  }
  function pelicanBody() {   // origin at the body centre, facing +Z (~1.4 m beak to tail)
    const g = new THREE.IcosahedronGeometry(0.2, 0); g.scale(1.0, 0.85, 2.4); put(g, 0xeef0ee);
    ico(0.11, 0xf2f2ee, 0, 0.12, 0.52); bb(-0.03, 0.06, 0.6, 0.03, 0.12, 1.0, 0xe8a070); bb(-0.04, 0.0, 0.62, 0.04, 0.07, 0.95, 0xd88a5a);
    boxR(0.22, 0.04, 0.24, 0x2a2a2a, 0, 0.0, -0.52); bb(-0.015, 0.15, 0.58, 0.015, 0.17, 0.6, 0x141414);
  }
  function pelicanWing() { boxR(0.6, 0.035, 0.34, 0xf2f2ee, 0.3, 0, 0); boxR(0.55, 0.03, 0.28, 0xe2e4e2, 0.85, 0, -0.03, 0, 0.08); boxR(0.35, 0.025, 0.24, 0x1c1c1c, 1.28, 0, -0.06, 0, 0.12); bb(0, -0.02, -0.18, 1.1, -0.005, -0.12, 0x2a2a2a); }
  function buildProps(root) {
    const add = (g) => (root.add(g), g);
    // ---- the three boom gates (arms pivot at y 1.05; rotation.z 0 down .. 1.45 up)
    R.gates = {};
    for (const [name, x, len] of GATE_DEF) {
      const g = add(part(name, () => gateArm(len), [x, 1.05, 0.02]));
      const G = { g, name, ang: 0, a0: 0, a1: 0, t: 1, dur: 1, up: false, next: null };
      g.userData.lift = (on = true) => gateLift(G, !!on);
      g.userData.cycle = () => { gateLift(G, false); G.next = 'up'; if (skipping()) { G.next = null; gateLift(G, true); } };
      Object.defineProperty(g.userData, 'up', { get: () => G.up, configurable: true });
      R.gates[name] = G;
    }
    // ---- the booth and what is in it
    R.booth = add(part('booth', boothShell, null, 0, { floor: true }));
    R.lampFix = add(part('booth_lamp', () => { cyl(0.012, 0.012, 0.15, 4, 0x2a2c30, 0, 0.075, 0); const g = new THREE.ConeGeometry(0.16, 0.14, 10, 1, true); g.translate(0, -0.06, 0); put(g, 0x3a6a5a, M.vc2); }, [8.0, 2.55, -2.0]));
    R.bulb = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), M.bulb); R.bulb.position.set(0, -0.1, 0); R.bulb.name = 'booth_bulb'; R.lampFix.add(R.bulb);
    R.noBtn = add(part('no_button', () => {
      bb(-0.1, 0, -0.11, 0.1, 0.05, 0.1, 0x8a929a); bb(-0.105, 0, -0.115, 0.105, 0.012, 0.105, 0x5a6068);
      cyl(0.03, 0.03, 0.03, 8, 0x5a6068, 0, 0.065, 0.04);
      tq(0.14, 0.07, A_NO, 0, 0.0515, -0.06, PI, -H, M.atlas);
    }, [7.95, 0.80, -2.70]));
    R.noCap = part('no_cap', () => { cyl(0.062, 0.058, 0.032, 12, NORED, 0, 0.016, 0); cyl(0.045, 0.062, 0.012, 12, 0xd84a44, 0, 0.038, 0); }, [0, 0.078, 0.04]);
    R.noBtn.add(R.noCap);
    R.noPlate = R.noBtn.children.find((m) => m.material === M.atlas) || null;
    R.noBtn.userData.press = () => { R.pressT = 0.25; if (!skipping()) snd('button_press', 0.7, R.noBtn.position); };
    R.fan = add(part('desk_fan', fanBase, [8.78, 0.80, -2.84]));
    R.fanHead = part('fan_head', fanHead, [0, 0.24, 0]); R.fan.add(R.fanHead);
    R.blades = part('fan_blades', fanBlades, [0, 0, 0.04]); R.fanHead.add(R.blades);
    R.screen = add(part('booth_screen', () => {
      bb(0.0, -0.13, -0.18, 0.05, 0.13, 0.18, 0x2a2e34); bb(-0.01, -0.02, -0.04, 0.01, 0.02, 0.04, 0x5a6068);
      const g = new THREE.PlaneGeometry(0.30, 0.20); g.rotateY(H); g.translate(0.052, 0, 0); put(g, 0xffffff, M.screen);
    }, [7.07, 1.40, -2.20]));
    R.screen.userData.show = (mode) => showScreen(mode);
    R.horn = add(part('booth_speaker', hornModel, [8.0, 2.95, -2.95]));
    R.horn.userData.pulse = () => { R.hornT = 0.2; };
    // the reason-card panel (east face x 9.00..9.06): five cards in pockets, the reader, the LED
    R.panel = add(part('reason_panel', () => {
      bb(9.0, 0.95, -2.5, 9.06, 1.75, -1.1, 0x8a8e94);
      const g = uvRect(new THREE.PlaneGeometry(1.4, 0.8), A_PANEL); g.rotateY(H); g.translate(9.062, 1.35, -1.8); put(g, 0xffffff, M.atlas);
      bb(9.06, 1.38, READER_Z - 0.09, 9.085, 1.41, READER_Z + 0.09, 0x2a2d31);                         // the reader's lip
    }));
    const POCKET_Y = 1.28;
    R.cards = []; R.readerCards = [];
    for (let i = 0; i < 6; i++) {
      const c = part('reason_card_' + i, () => { const g = uvRect(new THREE.PlaneGeometry(0.15, 0.09), A_CARD(i)); g.rotateY(H); put(g, 0xffffff, M.atlas); bb(-0.008, -0.045, -0.075, 0.0, 0.045, 0.075, 0xf0f0ec); }, [9.072, POCKET_Y + 0.045, i < 5 ? SLOT_Z[i] : READER_Z]);
      R.panel.add(c);
      if (i < 5) R.cards.push({ g: c, y: 0, to: 0, home: SLOT_Z[i], inReader: false });
      const rc = part('reader_card_' + i, () => { const g = uvRect(new THREE.PlaneGeometry(0.15, 0.09), A_CARD(i)); g.rotateY(H); put(g, 0xffffff, M.atlas); }, [9.075, 1.43, READER_Z]);
      rc.visible = false; R.panel.add(rc); R.readerCards.push(rc);
      if (i === 5) c.visible = false;
    }
    R.led = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.025, 0.025), M.ledOff); R.led.position.set(9.07, 1.175, READER_Z); R.led.name = 'panel_led'; R.panel.add(R.led);
    Object.assign(R.panel.userData, {
      pull: (i) => { const c = R.cards[i]; if (c && !c.inReader) { c.to = 0.08; if (skipping()) c.y = c.to; snd('card_slide', 0.6, R.panel.position); } },
      back: (i) => { const c = R.cards[i]; if (c) { if (c.inReader) { c.inReader = false; c.g.visible = true; R.readerCards[i].visible = false; } c.to = 0; if (skipping()) c.y = 0; } },
      insert: (i) => insertCard(i),
      led: (st) => { R.led.material = st === 'red' ? M.ledRed : st === 'green' ? M.ledGreen : M.ledOff; R.ledState = st || 'off'; },
      reset: () => panelReset(false),
    });
    R.deskCard = add(part('desk_card', () => {
      bb(-0.06, 0, -0.04, 0.06, 0.003, 0.04, 0xf6f6f2);
      const g = new THREE.CylinderGeometry(0.008, 0.008, 0.13, 6); g.rotateZ(H); g.rotateY(0.5); g.translate(0.03, 0.009, 0.07); put(g, 0x1a1a40);
      bb(-0.005, 0.004, 0.04, 0.02, 0.013, 0.09, 0xe8e8e8);
    }, [8.55, 0.80, -2.60]));
    R.cardBlank = part('desk_card_blank', () => tq(0.12, 0.075, A_BLANKCARD, 0, 0.0035, 0, PI, -H), null);
    R.cardXmas = part('desk_card_xmas', () => tq(0.12, 0.075, A_CARD(5), 0, 0.0035, 0, PI, -H), null);
    R.deskCard.add(R.cardBlank, R.cardXmas); R.cardXmas.visible = false;
    R.deskCard.userData.show = (on = true) => { R.deskCard.visible = !!on; };
    R.deskCard.userData.written = (on = true) => { R.cardXmas.visible = !!on; R.cardBlank.visible = !on; };
    const kt = typeof PROPS !== 'undefined' && PROPS.kettle ? PROPS.kettle() : part('', () => cyl(0.08, 0.09, 0.2, 10, 0xf2f2f2, 0, 0.1, 0));
    kt.name = 'kettle_booth'; kt.position.set(7.25, 0.80, -2.70); kt.rotation.y = 0.6; add(kt);
    add(part('radio_booth', radioModel, [7.40, 1.02, -2.92], 0.08));
    // ---- the towers: scanner ring (spins) + beacon, blue -> red on alarm(on)
    R.towers = {};
    for (const [name, x, mB] of [['tower_W', -9.2, M.bW], ['tower_E', 12.2, M.bE]]) {
      const g = add(new THREE.Group()); g.name = name; g.position.set(x, 0, 3.0);
      const ring = part(name + '_ring', () => {
        for (let k = 0; k < 12; k++) { const a = k / 12 * TAU, a2 = (k + 1) / 12 * TAU; bar(Math.sin(a) * 0.72, 0, Math.cos(a) * 0.72, Math.sin(a2) * 0.72, 0, Math.cos(a2) * 0.72, 0.07, 0xd8dce0); }
        for (let k = 0; k < 4; k++) { const a = k / 4 * TAU; bar(0, 0, 0, Math.sin(a) * 0.72, 0, Math.cos(a) * 0.72, 0.04, 0x9aa2aa); box(0.18, 0.1, 0.18, 0xffffff, Math.sin(a) * 0.72, -0.05, Math.cos(a) * 0.72, a, mB); }
        cyl(0.12, 0.12, 0.14, 8, 0x8a929a, 0, 0, 0);
      }, [0, 9.2, 0]);
      const beacon = part(name + '_beacon', () => {
        cyl(0.1, 0.14, 0.12, 8, 0x5a6068, 0, 0.06, 0);
        const gg = new THREE.SphereGeometry(0.17, 10, 5, 0, TAU, 0, H); gg.translate(0, 0.12, 0); put(gg, 0xffffff, mB);
        cyl(0.04, 0.04, 0.04, 6, 0x5a6068, 0, 0.31, 0);
      }, [0, 9.38, 0]);
      g.add(ring, beacon);
      const TW = { g, ring, beacon, m: mB, alarm: false };
      g.userData.ring = ring; g.userData.beacon = beacon;
      g.userData.alarm = (on = true) => { TW.alarm = !!on; };
      R.towers[name] = TW;
    }
    // ---- the six docked drones (the courtesy pod, instanced: body + light)
    if (typeof DRONE_INSTANCED !== 'undefined') {
      R.fleet = DRONE_INSTANCED.make(6, { state: 'patrol' }); R.fleet.group.name = 'tower_drones'; root.add(R.fleet.group);
      R.dockOn = [1, 1, 1, 1, 1, 1];
      Object.assign(R.fleet.group.userData, {
        hide: (i) => { if (i >= 0 && i < 6) R.dockOn[i] = 0; },
        release: () => { for (let i = 0; i < 6; i++) R.dockOn[i] = 0; },
        show: (i) => { if (i == null) for (let k = 0; k < 6; k++) R.dockOn[k] = 1; else if (i >= 0 && i < 6) R.dockOn[i] = 1; },
      });
    }
    // ---- the hover-cars: 0-11 the queue, 12-17 deck traffic (body tinted per instance, interior, canopy, glows, blobs)
    const cars = add(new THREE.Group()); cars.name = 'cars'; R.cars = cars;
    const N = 18, park = new Array(N).fill(0).map(() => [0, -60, 0, 0]);
    R.carBody = dyn(IM(geoOf(carBody), M.vc, park, 'car_bodies', cars));
    R.carIn = dyn(IM(geoOf(carInside), M.vc, park, 'car_interiors', cars));
    R.carGlass = dyn(IM(geoOf(carCanopy), mat(0xbfe6ff, { transparent: true, opacity: 0.32 }), park, 'car_canopies', cars));
    R.carGlow = dyn(IM(geoOf(carGlow), U.glow, park, 'car_glows', cars));
    if (typeof blobShadow === 'function') { const bl = blobShadow(); R.carBlob = dyn(IM(bl.geometry.clone(), bl.material, park, 'car_blobs', cars)); R.carBlob.renderOrder = 1; }
    const PAINT = [0xf4f4f2, 0xbcd8ec, 0xc4c8cc, 0xe8806a, 0x9edcc0, 0x2a3a6a];
    for (let i = 0; i < N; i++) R.carBody.setColorAt(i, tc.set(PAINT[(i * 5 + (i >> 2)) % 6]));
    R.carBody.instanceColor.needsUpdate = true;
    Object.assign(cars.userData, { ask: (lane) => askCar(lane), deckReset: () => deckReset(), park: () => deckPark(), flowing: (on) => { R.carFlow = !!on; carsHome(); }, onYield: null });
    // ---- the two hire scooters
    R.scoot = [];
    for (let n = 0; n < 2; n++) {
      const name = 'scooter_' + (n + 1), g = add(new THREE.Group()); g.name = name;
      g.add(part(name + '_body', () => scooterBody(n)));
      const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.17, 0.085), n ? M.dash2 : M.dash1); dash.position.set(0, 0.7287, 0.6105); dash.rotation.order = 'YXZ'; dash.rotation.set(-0.82, PI, 0); dash.name = name + '_dash'; g.add(dash);
      g.add(part(name + '_lights', scooterLights, null, 0, {}));
      g.children[g.children.length - 1].traverse((o) => { if (o.isMesh) o.material = U.glow; });
      const glow = part(name + '_glow', () => { const c = new THREE.CircleGeometry(0.42, 14); c.rotateX(H); c.scale(1, 1, 1.9); c.translate(0, -0.02, -0.05); put(c, 0x9fd8ff); }, null);
      glow.traverse((o) => { if (o.isMesh) { o.material = U.glow; } }); g.add(glow);
      if (typeof blobShadow === 'function') { const bs = blobShadow(); bs.geometry = bs.geometry.clone(); bs.position.set(0, -HOVER + 0.03, -0.05); bs.scale.set(0.95, 1, 2.0); g.add(bs); }
      const S = { g, glow, dashTex: n ? T.dash2 : T.dash1, dashSt: 'idle', x: 0, y: 0, z: 0, yaw: 0, lean: 0, pitch: 0, px: 0, py: 0, pz: 0, pyaw: 0, plean: 0, ppitch: 0, tx: 0, tz: 0, tyaw: 0, tlean: 0, glowOn: false, bob: n * 1.7, col: [0, 0, 0, 0] };
      Object.assign(g.userData, {
        seat: { driver: [0, -HOVER, 0.12], pillion: [0, -HOVER, -0.32] },
        pose: (x, z, yaw = 0, lean = 0) => { S.tx = x; S.tz = z; S.tyaw = yaw; S.tlean = lean; },
        dock: () => scootDock(n),
        dash: (st) => scootDash(S, st),
        glow: (on = true) => { S.glowOn = !!on; glow.visible = S.glowOn; },
      });
      R.scoot.push(S);
      COL.push(S.col);
    }
    // ---- drop telegraphs (3), pelicans (2), channel lights (5), the council sign
    const dg = new THREE.PlaneGeometry(2, 2); dg.rotateX(-H);
    R.drops = dyn(IM(dg, U.drop, [[0, -60, 0, 0], [0, -60, 0, 0], [0, -60, 0, 0]], 'drop_marks', root)); R.drops.renderOrder = 1;
    R.dropS = [0, 1, 2].map(() => ({ on: false, k: 0, x: 0, z: 0, r: 1 }));
    Object.assign(R.drops.userData, {
      show: (i, x, z, r = 1.2) => { const d = R.dropS[i]; if (!d) return; d.on = true; d.x = x; d.z = z; d.r = r; if (skipping()) d.k = 1; },
      hide: (i) => { if (i == null) { for (const d of R.dropS) d.on = false; } else if (R.dropS[i]) R.dropS[i].on = false; },
    });
    gain = 1.6; const pbG = geoOf(pelicanBody), pwG = geoOf(pelicanWing); gain = 1;
    R.pelB = dyn(IM(pbG, M.vc, [[0, -60, 0, 0], [0, -60, 0, 0]], 'pelicans', root));
    R.pelW = dyn(IM(pwG, M.vc2, [[0, -60, 0, 0], [0, -60, 0, 0], [0, -60, 0, 0], [0, -60, 0, 0]], 'pelican_wings', root));
    R.pelT = -1; R.pelZ = 0;
    R.pelB.userData.flyby = (z0) => { R.pelT = 0; R.pelZ = z0 == null ? 0 : z0; if (!skipping()) snd('pelican', 0.6, null); };
    R.chan = IM(geoOf(() => bb(-0.13, 0, -0.13, 0.13, 0.22, 0.13, 0xffffff)), U.chan, CHAN.map(([x, z, c, tall]) => [x, tall ? 3.3 : -1.2 + (c === 0x3ac85a ? 0.72 : 0.62), z, 0]), 'channel_lights', root);
    for (let i = 0; i < CHAN.length; i++) R.chan.setColorAt(i, tc.set(CHAN[i][2]));
    R.chan.instanceColor.needsUpdate = true; R.chanOn = true;
    add(part('council_sign', () => {
      for (const x of [-0.72, 0.72]) bb(x - 0.05, -1.0, -0.05, x + 0.05, 1.78, 0.05, 0x5a4030);
      bb(-0.66, 1.0, -0.035, 0.66, 1.7, 0.035, 0x5a3c26); bb(-0.68, 1.69, -0.05, 0.68, 1.73, 0.05, 0x4a3020);
      tq(1.24, 0.62, A_COUNCIL, 0, 1.35, -0.037, PI); tq(1.24, 0.62, A_COUNCIL, 0, 1.35, 0.037, 0);
    }, [9.2, 0, 774.6], -0.75));
  }

  // ---------------------------------------------------------- runtime state (module-level, reset by dress)
  const SPEED = 6.94, LANES = [3.5, 0, -3.5], START = 14, LAUGH = 360, END = 735;
  const DOCKS = [[-9.2, 7.75, 4.1], [-10.15, 7.75, 2.45], [-8.25, 7.75, 2.45], [12.2, 7.75, 4.1], [11.25, 7.75, 2.45], [13.15, 7.75, 2.45]];   // w1 w2 w3 e1 e2 e3
  const QX = [3.6, 0, -3.6], QZ = [-5.6, -11.4, -17.2, -23.0], DECK0 = [43, 82, 116, 150, 180, 205];
  const SC_DOCK = [[7.9, 4.6], [9.2, 4.6]], SC_LAUNCH = [[3.5, 14.0], [0.0, 12.0]], SC_STOP = [[31.0, 800.0], [27.6, 800.0]];
  const EDGE = [[8.2, 2.3, 771.5], [9.4, 2.6, 772.5], [10.6, 2.3, 773.5], [8.2, 2.9, 769.5], [9.6, 3.1, 770.0], [11.0, 2.8, 771.2]];
  const FORMATION = [[1.8, 2.2, -5], [1.8, 2.3, -7], [1.8, 2.2, -9], [1.8, 2.3, -11], [1.8, 2.2, -13], [1.8, 2.3, -15]];
  const PATHS = {
    d25_sweep: [[-3.0, -20.0], [13.5, -20.0]],
    d25_queue: [[0, -24], [0, -6]],
    d25_drift: [[8.0, -4.6], [12.0, -9.0], [18.0, -14.0]],
    walk_in: [[8.0, -42.0], [8.0, -10.0], [8.0, -4.5]],
    to_dock: [[6.55, -2.5], [6.55, 0.6], [7.6, 2.4]],
    swerve_1: [[3.5, 735], [3.6, 760], [5.2, 768], [6.9, 771.5], [7.6, 776.0], [9.0, 777.0], [24.0, 777.0], [24.0, 799.0], [31.0, 800.0]],
    swerve_2: [[0.0, 735], [1.0, 758], [4.4, 768.5], [6.6, 772.6], [7.4, 777.0], [8.8, 777.0], [23.6, 777.0], [23.6, 798.5], [27.6, 800.0]],
    credits_flow: [[3.6, -23], [3.6, 60]],
  };
  const arcLen = (P) => { const L = [0]; for (let i = 1; i < P.length; i++) L.push(L[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1])); return L; };
  const SWP = [PATHS.swerve_1, PATHS.swerve_2], SWL = [arcLen(PATHS.swerve_1), arcLen(PATHS.swerve_2)];
  const PT = [0, 0];
  function pathAt(n, s) {   // -> PT = [x, z] at arc length s along swerve path n
    const P = SWP[n], L = SWL[n]; s = Math.max(0, Math.min(L[L.length - 1], s));
    let i = 1; while (i < L.length - 1 && L[i] < s) i++;
    const s0 = L[i - 1], u = L[i] > s0 ? (s - s0) / (L[i] - s0) : 0;
    PT[0] = P[i - 1][0] + (P[i][0] - P[i - 1][0]) * u; PT[1] = P[i - 1][1] + (P[i][1] - P[i - 1][1]) * u; return PT;
  }
  const CARS = []; for (let i = 0; i < 18; i++) CARS.push({ x: 0, y: -60, z: 0, yaw: 0, px: 0, py: -60, pz: 0, pyaw: 0, tx: 3.5, v: 4.5, tv: 4.5, vis: 0, mode: 'queue', creepT: -1, yielding: false, yielded: false, trig: 0, bob: i * 0.77 });
  const CR = { on: false, drones: null, sw: false, v: 6.94, s: [0, 0], s0: [0, 0], dx: [0, 0], res: null, done: [false, false] };
  const MOUNTS = [];
  R.ask = { on: false, t: 0, lane: 0, user: true };
  R.stormU = 0.35; R.stormTo = 0.35; R.stormRate = 0.02; R.flickOn = false; R.flickT = 5; R.flashT = 0; R.pressT = 0; R.hornT = 0; R.pelT = -1;
  R.env = null; R.envSnap = true; R.lastT = -1; R.state = null; R.scene = undefined; R.carFlow = false; R.deckMode = 'hide';
  const SO = { vol: 1, at: undefined }, SND_T = {};
  const isCur = () => typeof world !== 'undefined' && world.setId === 'bridge';
  function snd(name, vol, atp) {
    if (!isCur() || skipping() || typeof sfx !== 'function') return;
    const t = typeof clock !== 'undefined' ? clock.t : 0;
    if (SND_T[name] != null && t - SND_T[name] < 0.5) return;
    SND_T[name] = t; SO.vol = vol; SO.at = atp || undefined; sfx(name, SO);
  }
  const dialogBusy = () => typeof say !== 'undefined' && say && typeof say.busy === 'function' && say.busy();

  // ---- gates
  function gateLift(G, on) {
    G.a0 = G.ang; G.a1 = on ? 1.45 : 0; G.t = 0; G.dur = on ? 2.6 : 2.0; G.up = on; G.next = null;
    if (skipping()) { G.ang = G.a1; G.t = G.dur; } else snd('boom_gate', 0.85, G.g.position);
  }
  function gateSnap(G, up) { G.ang = G.a0 = G.a1 = up ? 1.45 : 0; G.t = G.dur = 1; G.up = !!up; G.next = null; G.g.rotation.z = G.ang; }
  const gateEase = (u) => { const b0 = smooth(Math.min(1, u / 0.82)); return u > 0.82 ? b0 + 0.04 * Math.sin((u - 0.82) / 0.18 * PI) : b0; };
  // ---- the booth screen, the reason panel, the cars, the scooters
  function showScreen(mode) {
    if (mode !== 'reject' && mode !== 'accept' && mode !== 'confirmed') mode = 'idle';
    if (R.screenMode === mode) return; R.screenMode = mode;
    paintScreen(T.screen.image.getContext('2d'), mode); T.screen.needsUpdate = true;
  }
  function insertCard(i) {
    for (let k = 0; k < 6; k++) R.readerCards[k].visible = false;
    for (const c of R.cards) if (c.inReader) { c.inReader = false; c.g.visible = true; c.to = 0; c.y = 0; }
    const k = i === 'xmas' ? 5 : i | 0;
    if (k < 5 && R.cards[k]) { R.cards[k].inReader = true; R.cards[k].g.visible = false; R.cards[k].y = R.cards[k].to = 0; }
    if (R.readerCards[k]) R.readerCards[k].visible = true;
    snd('card_insert', 0.7, R.panel.position);
  }
  function panelReset(xmas) {
    for (const c of R.cards) { c.inReader = false; c.g.visible = true; c.y = c.to = 0; c.g.position.y = 1.325; }
    for (let k = 0; k < 6; k++) R.readerCards[k].visible = xmas && k === 5;
    R.panel.userData.led(xmas ? 'green' : 'off');
  }
  function askCar(lane) { const c = CARS[(lane | 0) % 3]; if (c && c.mode === 'queue') c.creepT = 0; }
  function carsHome() {
    for (let i = 0; i < 12; i++) { const c = CARS[i], r = (i / 3) | 0, l = i % 3; c.mode = R.carFlow ? 'flow' : 'queue'; c.x = c.px = QX[l]; c.z = c.pz = QZ[r]; c.yaw = c.pyaw = 0; c.creepT = -1; c.vis = 1; c.y = c.py = 0.32; }
    if (R.carFlow) for (let i = 0; i < 12; i++) { const r = (i / 3) | 0, l = i % 3; CARS[i].z = CARS[i].pz = -23 + ((r * 20.75 + l * 7.3) % 83); }
  }
  function deckReset() { R.deckMode = 'active'; for (let k = 0; k < 6; k++) { const c = CARS[12 + k]; c.mode = 'deck'; c.x = c.px = c.tx = 3.5; c.z = c.pz = DECK0[k]; c.v = c.tv = 4.5; c.yaw = c.pyaw = 0; c.vis = 1; c.yielding = false; c.yielded = false; } }
  function deckPark() { R.deckMode = 'park'; for (let k = 0; k < 6; k++) { const c = CARS[12 + k]; c.mode = 'park'; c.x = c.px = c.tx = 5.15; c.z = c.pz = 668 + k * 15; c.v = c.tv = 0; c.yaw = c.pyaw = 0.02; c.vis = 1; } }
  function deckHide() { R.deckMode = 'hide'; for (let k = 0; k < 6; k++) { const c = CARS[12 + k]; c.mode = 'hide'; c.vis = 0; } }
  function scootSet(n, x, z, yaw) {
    const S = R.scoot[n]; S.tx = S.x = S.px = x; S.tz = S.z = S.pz = z; S.tyaw = S.yaw = S.pyaw = yaw; S.tlean = S.lean = S.plean = 0;
    S.y = S.py = floor(x, z) + HOVER; S.pitch = S.ppitch = 0;
  }
  function scootDock(n) { scootSet(n, SC_DOCK[n][0], SC_DOCK[n][1], 0); }
  function scootDash(S, st) {
    if (st !== 'ask' && st !== 'ask2' && st !== 'ok') st = 'idle';
    if (S.dashSt === st) return; S.dashSt = st;
    paintDash(S.dashTex.image.getContext('2d'), st); S.dashTex.needsUpdate = true;
  }

  // ---- mounting riders (spec §10.7): the actor's root follows the scooter's seat every tick
  function mount(id, scooter, seat = 'driver') {
    unmount(id);
    const n = scooter === 'scooter_2' || scooter === 2 ? 1 : 0;
    MOUNTS.push({ id, n, oz: seat === 'pillion' ? -0.32 : 0.12 });
    mountTick(true);
  }
  function unmount(id) { for (let i = MOUNTS.length - 1; i >= 0; i--) if (id == null || MOUNTS[i].id === id) MOUNTS.splice(i, 1); }
  function mountTick(snap) {
    if (!MOUNTS.length || typeof world === 'undefined' || !world.actors || !R.scoot) return;
    for (let i = 0; i < MOUNTS.length; i++) {
      const m = MOUNTS[i], a = world.actors.get(m.id); if (!a) continue;
      const S = R.scoot[m.n], sy = Math.sin(S.yaw), cy = Math.cos(S.yaw);
      a.pos.set(S.x + sy * m.oz, S.y - HOVER, S.z + cy * m.oz); a.rotY = S.yaw;
      if (snap) { a.prev.copy(a.pos); a.prevRot = a.rotY; }
    }
  }

  // ---- the chase autopilot: cruise (lanes, SPEED, drones in formation) and the swerve onto the boardwalk
  function cruise(on, o) {
    CR.on = !!on; CR.drones = on && o && o.drones ? o.drones : on ? CR.drones : null;
    if (on) for (let n = 0; n < 2; n++) { const S = R.scoot[n]; S.tyaw = 0; S.tlean = 0; }
  }
  function droneAt(id, x, ya, z, yaw, v) {
    if (typeof DRONES === 'undefined' || !DRONES.get) return;
    const d = DRONES.get(id); if (!d) return;
    d.x = d.hx = x; d.z = d.hz = z; d.hover = ya; d.yaw = d.hyaw = yaw; d.vx = Math.sin(yaw) * v; d.vz = Math.cos(yaw) * v;
    if (skipping()) { d.px = d.x; d.pz = d.z; }
  }
  function swerve(o = {}) {
    if (CR.res) { const r = CR.res; CR.res = null; r(); }
    CR.on = false; CR.sw = true; CR.v = o.speed || SPEED; if (o.drones) CR.drones = o.drones;
    for (let n = 0; n < 2; n++) {
      const S = R.scoot[n], P = SWP[n];
      CR.s[n] = CR.s0[n] = Math.max(0, Math.min(SWL[n][1] - 0.5, S.tz - P[0][1]));
      pathAt(n, CR.s[n]); CR.dx[n] = S.tx - PT[0]; CR.done[n] = false;
    }
    const p = new Promise((res) => { CR.res = res; });
    if (skipping()) swerveEnd();
    return p;
  }
  function swerveEnd() {
    CR.sw = false;
    for (let n = 0; n < 2; n++) scootSet(n, SC_STOP[n][0], SC_STOP[n][1], H);
    if (CR.drones) for (let i = 0; i < CR.drones.length && i < 6; i++) droneAt(CR.drones[i], EDGE[i][0], EDGE[i][1], EDGE[i][2], 1.9, 0);
    mountTick(true);
    if (CR.res) { const r = CR.res; CR.res = null; r(); }
  }
  function chaseTick(dt) {
    if (CR.on) {
      for (let n = 0; n < 2; n++) { const S = R.scoot[n]; S.tz += SPEED * dt; S.tyaw += (0 - S.tyaw) * Math.min(1, dt * 3); S.tlean *= Math.max(0, 1 - dt * 3); }
      if (CR.drones) { const z1 = R.scoot[0].tz; for (let i = 0; i < CR.drones.length && i < 6; i++) { const f = FORMATION[i]; droneAt(CR.drones[i], f[0], f[1], z1 + f[2], 0, SPEED); } }
    } else if (CR.sw) {
      if (skipping()) { swerveEnd(); return; }
      for (let n = 0; n < 2; n++) {
        const S = R.scoot[n], Lend = SWL[n][SWL[n].length - 1], rem = Lend - CR.s[n];
        const v = rem > 6 ? CR.v : Math.max(1.2, CR.v * Math.sqrt(rem / 6));
        CR.s[n] = Math.min(Lend, CR.s[n] + v * dt); if (CR.s[n] >= Lend - 0.02) CR.done[n] = true;
        const s = CR.s[n], blend = Math.max(0, 1 - (s - CR.s0[n]) / 10);
        pathAt(n, s - 0.8); const ax = PT[0], az = PT[1]; pathAt(n, s + 0.8); const bx = PT[0], bz = PT[1];
        S.tx = (ax + bx) / 2 + CR.dx[n] * blend; S.tz = (az + bz) / 2;
        pathAt(n, s + 1.4); const fx = PT[0], fz = PT[1]; pathAt(n, s - 1.4);
        const want = Math.atan2(fx - PT[0], fz - PT[1]), turn = angTo(S.tyaw, want);
        S.tyaw += turn * Math.min(1, dt * 5); S.tlean = Math.max(-0.25, Math.min(0.25, -turn * 0.6));
      }
      if (CR.drones) {
        const z1 = R.scoot[0].tz;
        for (let i = 0; i < CR.drones.length && i < 6; i++) {
          const f = FORMATION[i], E = EDGE[i], d = typeof DRONES !== 'undefined' && DRONES.get ? DRONES.get(CR.drones[i]) : null; if (!d) continue;
          if (z1 + f[2] < E[2] - 2 && z1 < 752) droneAt(CR.drones[i], f[0] + (E[0] - f[0]) * smooth((z1 - 735) / 20), f[1], z1 + f[2], 0, SPEED);
          else { const dx = E[0] - d.x, dz = E[2] - d.z, L = Math.hypot(dx, dz), st = SPEED * dt; if (L > st) droneAt(CR.drones[i], d.x + dx / L * st, d.hover + (E[1] - d.hover) * Math.min(1, dt * 2), d.z + dz / L * st, Math.atan2(dx, dz), SPEED); else droneAt(CR.drones[i], E[0], E[1], E[2], 1.9, 0); }
        }
      }
      if (CR.done[0] && CR.done[1]) swerveEnd();
    }
  }

  // ---------------------------------------------------------- dressing
  const AUTO = { '2.5': 'checkpoint25', C: 'credits25' };
  const ENV_DRESS = { noon25: 'checkpoint25', chase25: 'chase25', mangrove25: 'end25', credits25: 'credits25' };
  const DRESS = {   // spec §12 dress table
    checkpoint25: { env: 'noon25', gates: [0, 0, 0], ask: true, alarm: false, dock: [1, 1, 1, 1, 1, 1], queue: 'stop', deck: 'hide', scoot: 'dock', glow: false, xmas: false, desk: true, screen: 'idle', storm: [0.35, 0.35], flick: false },
    gate25: { env: 'noon25', gates: [0, 0, 1], ask: false, alarm: false, dock: [1, 1, 1, 0, 1, 1], queue: 'stop', deck: 'hide', scoot: 'dock', glow: false, xmas: true, desk: false, screen: 'confirmed', storm: [0.40, 0.40], flick: false },
    alarm25: { env: 'noon25', gates: [0, 0, 1], ask: false, alarm: true, dock: [0, 0, 0, 0, 0, 0], queue: 'stop', deck: 'hide', scoot: 'dock', glow: true, xmas: true, desk: false, screen: 'confirmed', storm: [0.45, 0.45], flick: false },
    chase25: { env: 'chase25', gates: [0, 0, 1], ask: false, alarm: true, dock: [0, 0, 0, 0, 0, 0], queue: 'stop', deck: 'active', scoot: 'launch', glow: true, xmas: true, desk: false, screen: 'idle', storm: [0.55, 0.8], flick: false },
    end25: { env: 'mangrove25', gates: [0, 0, 1], ask: false, alarm: true, dock: [0, 0, 0, 0, 0, 0], queue: 'stop', deck: 'park', scoot: 'stop', glow: true, xmas: true, desk: false, screen: 'idle', storm: [0.9, 0.9], flick: true },
    credits25: { env: 'credits25', gates: [1, 1, 1], ask: false, alarm: false, dock: [0, 0, 0, 0, 0, 0], queue: 'flow', deck: 'hide', scoot: 'dock', glow: false, xmas: false, desk: true, screen: 'idle', storm: [0, 0], flick: false },
  };
  const AMB_CP = [['wind_bay', 0.6], { name: 'hover_idle', vol: 0.55, at: [0, 1, -14] }, { name: 'drone_hum', vol: 0.4, at: [1.5, 8, 3] }, ['water_lap', 0.45], ['gulls', 0.5], { name: 'radio_tinny', vol: 0.55, at: [7.4, 1.1, -2.9] }];
  const AMB = {
    checkpoint25: { rain: false, loops: AMB_CP, room: 'none' },
    gate25: { rain: false, loops: AMB_CP, room: 'none' },
    alarm25: { rain: false, loops: [...AMB_CP, { name: 'alarm_soft', vol: 0.6, at: [1.5, 9, 3] }], room: 'none' },
    chase25: { rain: false, loops: [['wind_fast', 0.75], ['water_lap', 0.25]], room: 'none' },
    end25: { rain: false, loops: [['mangrove', 0.8], ['wind_soft', 0.5], ['thunder_far', 0.55]], room: 'none' },
    credits25: { rain: false, loops: [['wind_bay', 0.45], ['gulls', 0.55], ['hover_idle', 0.45]], room: 'none' },
  };
  function applyAmbience() {
    R.amb = R.state;
    if (!isCur() || typeof AUDIO === 'undefined' || !AUDIO.ambience) return;
    try { const a = AMB[R.state] || AMB.checkpoint25; AUDIO.ambience(a); if (AUDIO.setRoom) AUDIO.setRoom('none'); } catch (e) { /* audio not up yet */ }
  }
  function dress(st, o = {}) {
    if (!DRESS[st]) st = 'checkpoint25';
    R.state = st;
    if (!o.auto && typeof state !== 'undefined' && state) R.scene = state.scene;   // an explicit dress acknowledges the scene
    if (!R.root || !R.scoot) return;
    const D = DRESS[st];
    for (let k = 0; k < 3; k++) gateSnap(R.gateList[k], D.gates[k]);
    R.ask.on = D.ask; R.ask.t = 0; R.ask.lane = 2;
    for (const k in R.towers) R.towers[k].alarm = D.alarm;
    for (let i = 0; i < 6; i++) R.dockOn[i] = D.dock[i];
    R.carFlow = D.queue === 'flow'; carsHome();
    if (D.deck === 'active') deckReset(); else if (D.deck === 'park') deckPark(); else deckHide();
    CR.on = false; if (CR.sw || CR.res) { CR.sw = false; if (CR.res) { const r = CR.res; CR.res = null; r(); } }
    const sp = D.scoot === 'launch' ? SC_LAUNCH : D.scoot === 'stop' ? SC_STOP : SC_DOCK, ry = D.scoot === 'stop' ? H : 0;
    for (let n = 0; n < 2; n++) { scootSet(n, sp[n][0], sp[n][1], ry); R.scoot[n].g.userData.glow(D.glow); scootDash(R.scoot[n], 'idle'); }
    panelReset(D.xmas); R.deskCard.userData.show(D.desk); R.deskCard.userData.written(false);
    showScreen(D.screen);
    R.stormU = D.storm[0]; R.stormTo = D.storm[1]; R.stormRate = st === 'chase25' ? 0.0028 : 0.02; R.flickOn = D.flick; R.flickT = 3; R.flashT = 0;
    R.pelT = -1; for (const d of R.dropS) { d.on = false; d.k = 0; }
    R.pressT = R.hornT = 0;
    mountTick(true);
    if (o.build) return;
    if (!o.keepEnv && typeof world !== 'undefined' && world.env) world.env(D.env, 0, 'bridge');
    applyAmbience();
  }
  function askLoop(on) { R.ask.user = on !== false; }

  // ---------------------------------------------------------- env-driven look (eases with the world's env lerp)
  const ENVX = {
    noon25: { lamp: 0, sun: [-0.15, 0.95, -0.27], sunA: 1, water: 0xffffff, band: 0xffffff, storm: 0xffffff, cloud: 0xf4f6f8, cloudA: 1, haze: 0, spot: 1 },
    chase25: { lamp: 0, sun: [-0.25, 0.88, -0.40], sunA: 1, water: 0xe2c6bc, band: 0xe2e8e8, storm: 0xe4eae8, cloud: 0xe8ecee, cloudA: 0.75, haze: 0.15, spot: 0 },
    mangrove25: { lamp: 0.6, sun: [-0.25, 0.88, -0.40], sunA: 0, water: 0xc2b2aa, band: 0xc4cecc, storm: 0xc8d0cc, cloud: 0xc8d0d0, cloudA: 0, haze: 0.6, spot: 0 },
    credits25: { lamp: 1, sun: [-0.85, 0.20, 0.48], sunA: 1, water: 0xffe4d4, band: 0xffe0cc, storm: 0xffdcc4, cloud: 0xffd4b0, cloudA: 0.9, haze: 0, spot: 1 },
  };
  const EV = { lamp: 0, sunA: 1, cloudA: 1, haze: 0, sun: new THREE.Vector3(-0.15, 0.95, -0.27), water: new THREE.Color(1, 1, 1), band: new THREE.Color(1, 1, 1), storm: new THREE.Color(1, 1, 1), cloud: new THREE.Color(1, 1, 1) };
  const ZAX = new THREE.Vector3(0, 0, 1), FOGC = new THREE.Color();
  function envTick(dt, envName) {
    const X = ENVX[envName] || ENVX.noon25, k = R.envSnap ? 1 : 1 - Math.exp(-dt / 1.6);
    R.envSnap = false;
    EV.lamp += (X.lamp - EV.lamp) * k; EV.sunA += (X.sunA - EV.sunA) * k; EV.cloudA += (X.cloudA - EV.cloudA) * k; EV.haze += (X.haze - EV.haze) * k;
    v1.set(X.sun[0], X.sun[1], X.sun[2]).normalize(); EV.sun.lerp(v1, k).normalize();
    EV.water.lerp(tc.set(X.water), k); EV.band.lerp(tc.set(X.band), k); EV.storm.lerp(tc.set(X.storm), k); EV.cloud.lerp(tc.set(X.cloud), k);
    M.lamp.emissiveIntensity = EV.lamp; M.glass.emissiveIntensity = 0.85 * EV.lamp; M.glass.opacity = 0.25 + 0.45 * EV.lamp; M.water.color.copy(EV.water); SKY.cloud.color.copy(EV.cloud); SKY.cloud.opacity = EV.cloudA; R.clouds.visible = EV.cloudA > 0.02;
    SKY.band.color.copy(EV.band); if (R.fogC) SKY.band.color.lerp(R.fogC, EV.haze);
    R.sun.position.set(EV.sun.x * 420, EV.sun.y * 420 + WY, EV.sun.z * 420);
    v2.copy(EV.sun).negate(); R.sun.quaternion.setFromUnitVectors(ZAX, v2);
    R.sun.visible = EV.sunA > 0.05; SKY.halo.opacity = 0.85 * EV.sunA;
  }

  // ---------------------------------------------------------- per-tick life (no allocation)
  function towersTick(dt, t) {
    const rf = typeof options !== 'undefined' && options && options.reduceFlashing;
    for (let k = 0; k < 2; k++) {
      const W = R.towerList[k], m = W.m, sp = W.alarm ? 3 : 0.8;
      W.spin = (W.spin || 0.8) + (sp - (W.spin || 0.8)) * Math.min(1, dt * 1.5);
      W.ring.rotation.y += W.spin * dt;
      if (W.alarm) { m.emissive.setHex(0xff3a3a); m.emissiveIntensity = rf ? 1.3 : (Math.sin(t * TAU * 2) > 0 ? 1.7 : 0.2); }
      else { m.emissive.setHex(0x6fb8ff); m.emissiveIntensity = 1.0 + 0.25 * Math.sin(t * 2.2); }
    }
    if (R.fleet) {
      for (let i = 0; i < 6; i++) {
        const D = DOCKS[i], tx = i < 3 ? -9.2 : 12.2, s = R.dockOn[i] ? 1 : 0.0001;
        R.fleet.set(i, D[0], D[1] + 0.05 * Math.sin(t * 1.9 + i * 1.3), D[2], Math.atan2(D[0] - tx, D[2] - 3.0), s);
      }
      R.fleet.commit();
    }
  }
  function queueTick(dt, t) {
    const A = R.ask;
    if (A.on && A.user && !dialogBusy()) {
      const t0 = A.t; A.t += dt;
      if (A.t >= 6.5) { A.t -= 6.5; A.lane = (A.lane + 1) % 3; askCar(A.lane); }
      if (t0 < 0.6 && A.t >= 0.6) { R.horn.userData.pulse(); snd('ss_chirp', 0.55, R.horn.position); if (typeof emit === 'function') emit('bridge:ask', A.lane); }
      if (t0 < 1.8 && A.t >= 1.8) R.noBtn.userData.press();
    }
    for (let i = 0; i < 12; i++) {
      const c = CARS[i]; c.px = c.x; c.py = c.y; c.pz = c.z; c.pyaw = c.yaw;
      const r = (i / 3) | 0, l = i % 3;
      if (c.mode === 'flow') {
        c.z += 2 * dt; if (c.z > 60) { c.z -= 83; c.pz = c.z; }
        c.vis = Math.min(1, (c.z + 23) / 3, (60 - c.z) / 3);
      } else {
        let cr = 0;
        if (c.creepT >= 0) { c.creepT += dt; const u = c.creepT; cr = u < 0.6 ? smooth(u / 0.6) * 0.4 : u < 2.2 ? 0.4 : u < 2.8 ? 0.4 * (1 - smooth((u - 2.2) / 0.6)) : 0; if (u >= 2.8) c.creepT = -1; }
        c.x = QX[l]; c.z = QZ[r] + cr; c.vis = 1;
      }
      c.y = floor(c.x, c.z) + 0.32 + 0.02 * Math.sin(t * 1.7 + c.bob);
    }
  }
  function deckTick(dt, t) {
    for (let k = 0; k < 6; k++) {
      const c = CARS[12 + k]; c.px = c.x; c.py = c.y; c.pz = c.z; c.pyaw = c.yaw;
      if (c.mode === 'deck' && c.vis) {
        if (!c.yielding) {
          for (let n = 0; n < 2; n++) { const S = R.scoot[n], dz = c.z - S.z; if (Math.abs(S.x - 3.5) < 1.2 && dz > 0 && dz < 14) { c.yielding = true; c.trig = n; c.tx = 5.1; c.tv = 2.0; if (!c.yielded) { c.yielded = true; if (!CR.on && typeof R.cars.userData.onYield === 'function') R.cars.userData.onYield(k); snd('hover_by', 0.5, R.scoot[n].g.position); } break; } }
        } else if (R.scoot[c.trig].z > c.z + 10) { c.yielding = false; c.tx = 3.5; c.tv = 4.5; }
        c.v += (c.tv - c.v) * Math.min(1, dt * 1.5);
        const vx = (c.tx - c.x) * 1.1; c.x += vx * dt; c.z += c.v * dt;
        c.yaw += (Math.atan2(vx, Math.max(0.5, c.v)) - c.yaw) * Math.min(1, dt * 4);
        if (c.z > 868) c.vis = 0;   // off the land road behind every end camera
      }
      c.y = floor(c.x, c.z) + 0.32 + 0.02 * Math.sin(t * 1.7 + c.bob);
    }
  }
  function scootTick(dt, t) {
    for (let n = 0; n < 2; n++) {
      const S = R.scoot[n];
      S.px = S.x; S.py = S.y; S.pz = S.z; S.pyaw = S.yaw; S.plean = S.lean; S.ppitch = S.pitch;
      const jump = Math.abs(S.tx - S.x) + Math.abs(S.tz - S.z) > 3;
      S.x = S.tx; S.z = S.tz; S.yaw = S.tyaw; S.lean += (S.tlean - S.lean) * Math.min(1, dt * 6);
      const sy = Math.sin(S.yaw) * 0.6, cy = Math.cos(S.yaw) * 0.6, sl = (floor(S.x + sy, S.z + cy) - floor(S.x - sy, S.z - cy)) / 1.2;
      S.pitch += (-Math.atan(Math.max(-0.4, Math.min(0.4, sl))) - S.pitch) * Math.min(1, dt * 8);
      S.y = floor(S.x, S.z) + HOVER + 0.02 * Math.sin(t * TAU * 2.3 / 2 + S.bob);
      if (jump) { S.px = S.x; S.pz = S.z; S.py = S.y; S.pyaw = S.yaw; }
      if (S.glowOn) { const k = 1 + 0.06 * Math.sin(t * 5 + n); S.glow.scale.set(k, 1, k); }
      const D = SC_DOCK[n], c = S.col;
      if (Math.abs(S.x - D[0]) < 0.6 && Math.abs(S.z - D[1]) < 0.6) { c[0] = S.x - 0.25; c[1] = S.z - 0.65; c[2] = S.x + 0.25; c[3] = S.z + 0.65; }
      else { c[0] = c[1] = 1e4; c[2] = c[3] = 1e4 + 1; }
    }
  }
  function boothTick(dt, t) {
    R.blades.rotation.z += 18 * dt;
    R.fanHead.rotation.y = -0.5 + 0.6 * Math.sin(t * TAU * 0.15);
    if (R.pressT > 0) R.pressT = Math.max(0, R.pressT - dt);
    R.noCap.position.y = 0.078 - (R.pressT > 0 ? 0.03 : 0);
    if (R.noPlate) R.noPlate.material = R.pressT > 0 ? M.atlasHi : M.atlas;
    if (R.hornT > 0) R.hornT = Math.max(0, R.hornT - dt);
    R.horn.scale.setScalar(R.hornT > 0 ? 1.05 : 1);
    for (let i = 0; i < 5; i++) { const c = R.cards[i]; if (c.y !== c.to) { const d = c.to - c.y, st = 0.5 * dt; c.y = Math.abs(d) <= st ? c.to : c.y + Math.sign(d) * st; } c.g.position.y = 1.325 + c.y; c.g.position.x = 9.072 + c.y * 0.25; }
    for (let k = 0; k < 3; k++) {
      const G = R.gateList[k];
      if (G.t < G.dur) { G.t = Math.min(G.dur, G.t + dt); G.ang = G.a0 + (G.a1 - G.a0) * gateEase(G.t / G.dur); if (G.t >= G.dur && G.next === 'up') { G.next = null; gateLift(G, true); } }
      G.g.rotation.z = G.ang;
    }
    const gc = R.gateCol, upL = R.gates.gate_L.ang > 0.6;
    if (upL) { gc[0] = gc[1] = 1e4; gc[2] = gc[3] = 1e4 + 1; } else { gc[0] = 6.10; gc[1] = -0.10; gc[2] = 7.00; gc[3] = 0.10; }
  }
  function skyTick(dt, t) {
    const rf = typeof options !== 'undefined' && options && options.reduceFlashing;
    if (R.stormU !== R.stormTo) { const d = R.stormTo - R.stormU, st = R.stormRate * dt; R.stormU = Math.abs(d) <= st || skipping() ? R.stormTo : R.stormU + Math.sign(d) * st; }
    const u = R.stormU, s = 1 - 0.1 * u; R.storm.scale.set(s, 45 + 205 * u, s); R.storm.visible = u > 0.01;
    let fl = 0;
    if (R.flickOn) {
      if (rf) fl = 0.08 * (0.5 + 0.5 * Math.sin(t * PI));
      else { R.flickT -= dt; if (R.flickT <= 0) { R.flashT = 0.42; R.flickT = 6 + Math.random() * 8; } if (R.flashT > 0) { R.flashT -= dt; const p = 0.42 - R.flashT; fl = p < 0.08 || (p > 0.2 && p < 0.3) ? 0.9 : 0.15; } }
    }
    SKY.storm.color.copy(EV.storm).multiplyScalar((1 - 0.18 * u) * (1 + fl)); if (R.fogC) SKY.storm.color.lerp(R.fogC, EV.haze * 0.55);
    R.clouds.rotation.y = t * 0.0015;
    // channel lights: 0.5 Hz (green on even seconds, red on odd; the beacon always slow-green)
    const ph = Math.floor(t) % 2 === 0;
    if (ph !== R.chanOn) { R.chanOn = ph; for (let i = 0; i < CHAN.length; i++) { const on = CHAN[i][3] ? ph : (CHAN[i][2] === 0x3ac85a) === ph; R.chan.setColorAt(i, on ? tc.set(CHAN[i][2]) : tc.set(CHAN[i][2]).multiplyScalar(0.18)); } R.chan.instanceColor.needsUpdate = true; }
    T.ripple.offset.set(t * 0.008, t * 0.016); T.mud.offset.x = Math.sin(t * 0.13) * 0.012;
  }
  function dropsTick(dt) {
    for (let i = 0; i < 3; i++) {
      const d = R.dropS[i]; d.k += ((d.on ? 1 : 0) - d.k) * Math.min(1, dt / 0.12); const s = Math.max(0.0001, d.r * 0.5 * d.k);
      v1.set(d.x, floor(d.x, d.z) + 0.035, d.z); q1.identity(); sv.set(s, 1, s); R.drops.setMatrixAt(i, m4.compose(v1, q1, sv));
    }
    R.drops.instanceMatrix.needsUpdate = true;
  }
  function pelTick(dt) {
    if (R.pelT < 0) return;
    R.pelT += dt; if (R.pelT > 11) R.pelT = -1;
  }
  // render-time placement (interpolated between the last two ticks, like actors): scooters, cars, pelicans
  function visuals(a) {
    for (let n = 0; n < 2; n++) {
      const S = R.scoot[n], g = S.g;
      g.position.set(S.px + (S.x - S.px) * a, S.py + (S.y - S.py) * a, S.pz + (S.z - S.pz) * a);
      eY.set(S.ppitch + (S.pitch - S.ppitch) * a, S.pyaw + angTo(S.pyaw, S.yaw) * a, S.plean + (S.lean - S.plean) * a); g.quaternion.setFromEuler(eY);
    }
    for (let i = 0; i < 18; i++) {
      const c = CARS[i], vis = c.vis > 0.001 ? c.vis : 0.0001;
      v1.set(c.px + (c.x - c.px) * a, c.py + (c.y - c.py) * a, c.pz + (c.z - c.pz) * a);
      q1.setFromAxisAngle(UP, c.pyaw + angTo(c.pyaw, c.yaw) * a); sv.set(vis, vis, vis);
      m4.compose(v1, q1, sv);
      R.carBody.setMatrixAt(i, m4); R.carIn.setMatrixAt(i, m4); R.carGlass.setMatrixAt(i, m4); R.carGlow.setMatrixAt(i, m4);
      if (R.carBlob) { v1.y = floor(v1.x, v1.z) + 0.03; sv.set(2.3 * vis, 1, 4.8 * vis); R.carBlob.setMatrixAt(i, m4.compose(v1, q1, sv)); }
    }
    R.carBody.instanceMatrix.needsUpdate = R.carIn.instanceMatrix.needsUpdate = R.carGlass.instanceMatrix.needsUpdate = R.carGlow.instanceMatrix.needsUpdate = true;
    if (R.carBlob) R.carBlob.instanceMatrix.needsUpdate = true;
    // pelicans: glide past at 12 m/s, x +9.5 over the water, deck + 6, a slow flap now and then
    const pt = R.pelT >= 0 ? R.pelT + a * (typeof CONFIG !== 'undefined' ? CONFIG.step : 1 / 60) : -1;
    for (let p = 0; p < 2; p++) {
      if (pt < 0) { sv.set(0.0001, 0.0001, 0.0001); m4.compose(v1.set(0, -60, 0), q1.identity(), sv); R.pelB.setMatrixAt(p, m4); R.pelW.setMatrixAt(p * 2, m4); R.pelW.setMatrixAt(p * 2 + 1, m4); continue; }
      const z = R.pelZ - 32 + 12 * pt - p * 3.2, x = 9.5 + p * 1.3, y = deckY(Math.max(40, Math.min(760, z))) + 6 + p * 0.7 + 0.3 * Math.sin(pt * 0.9 + p);
      eY.set(0, 0, 0.05 * Math.sin(pt * 0.7 + p)); q1.setFromEuler(eY); sv.set(1, 1, 1); mA.compose(v1.set(x, y, z), q1, sv);
      R.pelB.setMatrixAt(p, mA);
      const cyc = (pt + p * 1.4) % 3.2, flap = cyc < 0.9 ? 0.45 * Math.sin(cyc / 0.9 * TAU) : 0.06;
      for (let s = 0; s < 2; s++) { e2.set(0, 0, s ? PI - flap : flap); mB.makeRotationFromEuler(e2); mB.setPosition(s ? -0.16 : 0.16, 0.04, 0.05); m4.multiplyMatrices(mA, mB); R.pelW.setMatrixAt(p * 2 + s, m4); }
    }
    R.pelB.instanceMatrix.needsUpdate = R.pelW.instanceMatrix.needsUpdate = true;
  }
  function update(dt, ctx) {
    if (!R.root || !R.scoot) return;
    const t = ctx.t, cur = isCur(), W_ = typeof world !== 'undefined' ? world : null;
    const reshown = R.lastT >= 0 && t - R.lastT > 0.5;
    // a new scene: AUTO dress (2.5 -> checkpoint25, C -> credits25); anything else (and ?setview) dresses by env
    const sid = typeof state !== 'undefined' && state ? state.scene : null;
    if (sid !== R.scene) { R.scene = sid; if (AUTO[sid]) dress(AUTO[sid], { auto: true }); else dress(ENV_DRESS[ctx.env] || 'checkpoint25', { auto: true, keepEnv: true }); }
    else if (ctx.env !== R.env && typeof TEST !== 'undefined' && TEST && TEST.setview && ENV_DRESS[ctx.env] && ENV_DRESS[ctx.env] !== R.state) dress(ENV_DRESS[ctx.env], { auto: true, keepEnv: true });
    if (ctx.env !== R.env) { R.env = ctx.env; if (skipping() || reshown || R.lastT < 0 || (typeof TEST !== 'undefined' && TEST && TEST.setview)) R.envSnap = true; }
    if (reshown) R.envSnap = true;
    if (cur && (R.amb !== R.state || reshown)) applyAmbience();
    R.lastT = t;
    envTick(dt, R.env);
    // the desk lamp: the set's spot over Teddy's desk while the env lights it (torchAuto off while this set owns it)
    const sp = W_ && cur ? W_.torch : null, X = ENVX[R.env] || ENVX.noon25;
    if (sp && X.spot && sp.intensity > 0) {
      W_.torchAuto = false; R.torchOwned = true;
      sp.position.set(8.0, 2.45, -2.0); sp.target.position.set(8.0, 0.8, -2.6); sp.angle = 0.7; sp.penumbra = 0.6; sp.distance = 4.5; sp.decay = 1.0;
    } else if (R.torchOwned && W_ && cur) { W_.torchAuto = true; R.torchOwned = false; }
    M.bulb.emissiveIntensity = sp && X.spot && sp.intensity > 0 ? 1.2 : 0.1;
    // the far group follows the camera (skybox behaviour); skirt + haze copy the live fog colour
    if (W_ && W_.camera) R.far.position.set(W_.camera.position.x, 0, W_.camera.position.z);
    if (W_ && W_.scene && W_.scene.fog && cur) { SKY.skirt.color.copy(W_.scene.fog.color); SKY.haze.color.copy(W_.scene.fog.color); R.fogC = FOGC.copy(W_.scene.fog.color); }
    chaseTick(dt);
    scootTick(dt, t);
    mountTick(false);
    queueTick(dt, t); deckTick(dt, t);
    towersTick(dt, t); boothTick(dt, t); skyTick(dt, t); dropsTick(dt); pelTick(dt);
    if (!R.hooked || !cur) visuals(1);
  }

  // ---------------------------------------------------------- build
  function build() {
    COL.length = 0; T = textures(); initMats();
    const root = new THREE.Group(); root.name = 'bridge_root'; R.root = root;
    buildRegionC(root); buildRegionD(root); buildRegionB(root);
    R.water = part('water', waterGrid, null, 0, { floor: false }); root.add(R.water);
    R.mud = part('mud', mudFlats, null, 0, { floor: false }); root.add(R.mud);
    buildRepeats(root); buildProps(root); buildFar(root);
    R.gateList = [R.gates.gate_R, R.gates.gate_M, R.gates.gate_L];
    R.towerList = [R.towers.tower_W, R.towers.tower_E];
    // colliders (spec §2.7): the walk is the footpath + verge, the plaza, the passage and the dock; everything else is ridden or filmed
    COL.push([5.90, -46.5, 6.10, 8.2], [6.0, -46.8, 13.3, -46.5], [13.0, -46.5, 13.3, -0.45], [9.0, -0.75, 13.3, -0.45], [7.0, -3.0, 9.0, -0.6]);
    R.gateCol = [6.10, -0.10, 7.00, 0.10]; COL.push(R.gateCol);
    COL.push([10.5, -0.45, 10.7, 8.2], [6.0, 8.0, 10.7, 8.2], [7.3, 3.6, 9.8, 3.8], [10.0, -30.2, 10.4, -29.8]);
    COL.push([12.25, -42.15, 12.55, -41.85], [9.85, -18.15, 10.15, -17.85]);
    COL.push([11.2, -34.9, 11.8, -33.1], [11.35, -9.25, 11.85, -8.75]);
    for (const p of R.bollards) if (p[0] > 6) COL.push([p[0] - 0.17, p[2] - 0.17, p[0] + 0.17, p[2] + 0.17]);
    COL.push([8.40, 40, 8.60, 760], [-6.50, 40, -6.25, 760]);   // framing only: the deck's railings and the boardwalk's rails
    for (const [x0, z0, x1, z1] of RAILS) COL.push([Math.min(x0, x1) - 0.1, Math.min(z0, z1) - 0.1, Math.max(x0, x1) + 0.1, Math.max(z0, z1) + 0.1]);
    // the render-time interpolation hook (scooters, cars, pelicans move like actors: between the last two ticks)
    if (!R.hooked && typeof world !== 'undefined' && world && typeof world.render === 'function' && !world.render.__bridge) {
      const wr = world.render;
      const f = function (alpha) { if (R.root && R.scoot && isCur()) visuals(alpha); return wr.call(this, alpha); };
      f.__bridge = true; world.render = f; R.hooked = true;
    }
    if (!R.stopHook && typeof on === 'function') { R.stopHook = true; on('flow:stop', () => { MOUNTS.length = 0; CR.on = false; if (CR.sw) swerveEnd(); R.ask.user = true; }); }
    R.scene = typeof state !== 'undefined' && state ? state.scene : null;
    R.env = null; R.envSnap = true; R.lastT = -1; R.amb = null; R.screenMode = null; R.torchOwned = false;
    for (const S of R.scoot) S.dashSt = null;
    dress(AUTO[R.scene] || 'checkpoint25', { build: true, auto: true });
    visuals(1);
    return root;
  }

  // ---------------------------------------------------------- data
  const marks = {
    teddy_seat: [8.0, 0, -1.75, PI], kettle: [7.30, 0, -3.75, 0], gate_L_post: [1.75, 0, 0.0, 0], credits_teddy: [8.0, 0, -1.75, PI],
    dock_w1: [-9.2, 7.75, 4.1, 0], dock_w2: [-10.15, 7.75, 2.45, 0], dock_w3: [-8.25, 7.75, 2.45, 0],
    dock_e1: [12.2, 7.75, 4.1, 0], dock_e2: [11.25, 7.75, 2.45, 0], dock_e3: [13.15, 7.75, 2.45, 0],
    s25_start_luka: [7.4, 0, -41.5, 0], s25_start_chase: [8.6, 0, -42.2, 0], s25_start_c40: [9.8, 0, -41.6, -0.2],
    s25_chip: [9.0, 0, -31.0, 0], s25_cp_start: [8.0, 0, -42.0, 0], s25_cp_cross: [8.0, 0, -25.0, 0], s25_cp_plaza: [9.0, 0, -10.0, 0],
    s25_hatch: [8.0, 0, -3.85, 0], s25_panel_chase: [9.75, 0, -1.80, -H], s25_desk_chase: [8.60, 0, -3.75, 0], s25_wait_c40: [11.4, 0, -6.2, -0.6],
    s25_scan_luka: [8.0, 0, -5.0, 0.4], s25_scan_chase: [9.7, 0, -4.6, 0.2], s25_scan_c40: [10.9, 0, -4.9, -0.1],
    d25_scan_1: [9.7, 2.5, -3.7, PI], d25_scan_2: [10.9, 2.5, -4.0, PI], d25_scan_3: [8.0, 2.6, -4.1, PI], d25_confused: [8.0, 2.6, -4.6, 0],
    s25_pass: [6.55, 0, -1.5, 0], s25_boom_rec: [6.55, 0, 0.6, -H],
    s25_dock_luka: [7.9, 0, 3.3, 0], s25_dock_chase: [7.2, 0, 3.0, 0.3], s25_dock_c40: [9.2, 0, 3.3, 0],
    s25_launch_1: [3.5, 0.28, 14.0, 0], s25_launch_2: [0.0, 0.28, 12.0, 0],
    s25_bw_stop_1: [31.0, -2.32, 800.0, H], s25_bw_stop_2: [27.6, -2.32, 800.0, H],
    s25_bw_luka: [31.4, -2.6, 800.3, -2.4], s25_bw_chase: [30.4, -2.6, 799.6, -2.0], s25_bw_c40: [27.2, -2.6, 800.4, -2.2],
    d25_edge_1: [8.2, 2.3, 771.5, 1.9], d25_edge_2: [9.4, 2.6, 772.5, 1.9], d25_edge_3: [10.6, 2.3, 773.5, 1.9],
    d25_edge_4: [8.2, 2.9, 769.5, 1.9], d25_edge_5: [9.6, 3.1, 770.0, 1.9], d25_edge_6: [11.0, 2.8, 771.2, 1.9],
  };
  const anchors = {
    s25_wide_low:       { at: [3.0, 3.0, 0.0],      from: [-1.6, 1.3, -40.5],  fov: 48 },
    s25_teddy_hatch:    { at: [8.0, 1.25, -1.75],   from: [8.45, 1.85, -4.70], fov: 36 },
    s25_no_button:      { at: [7.95, 0.85, -2.71],  from: [7.95, 1.92, -3.14], fov: 26 },
    s25_speaker:        { at: [8.0, 2.95, -2.95],   from: [6.4, 1.8, -7.5],    fov: 36 },
    s25_explain:        { at: [8.5, 1.45, -41.6],   from: [10.7, 1.65, -45.9], fov: 44 },
    s25_roleplay:       { at: [8.0, 1.35, -2.8],    from: [6.2, 1.70, -5.6],   fov: 40 },
    s25_roleplay_rev:   { at: [8.0, 1.5, -3.9],     from: [8.38, 1.45, -1.40], fov: 42 },
    s25_panel:          { at: [9.06, 1.32, -1.80],  from: [10.15, 1.62, -1.15], fov: 34 },
    s25_desk_card:      { at: [8.55, 0.82, -2.60],  from: [8.35, 1.78, -3.30], fov: 28 },
    s25_screen:         { at: [7.12, 1.40, -2.20],  from: [7.70, 1.50, -2.20], fov: 30 },
    s25_scan_wide:      { at: [9.6, 1.6, -4.4],     from: [13.6, 3.0, -9.5],   fov: 44 },
    s25_gate_lift:      { at: [4.3, 1.4, 0.0],      from: [6.5, 1.6, -5.4],    fov: 40 },
    s25_towers_red:     { at: [11.6, 4.3, 5.3],     from: [3.2, 1.2, 0.8],     fov: 54 },
    s25_launch:         { at: [3.5, 0.8, 20.0],     from: [9.6, 1.4, 6.0],     fov: 46 },
    s25_crest_wide:     { at: [2.0, 5.0, 420.0],    from: [-30.0, 12.0, 380.0], fov: 44 },
    s25_edge:           { at: [9.6, 2.6, 772.0],    from: [20.0, -0.6, 777.0], fov: 42 },
    s25_bw_hide:        { at: [29.5, -1.8, 800.0],  from: [36.0, -1.6, 806.0], fov: 44 },
    drone_footage:      { at: [30.0, -2.6, 800.0],  from: [14.0, 24.0, 774.0], fov: 46 },
    credits_checkpoint: { at: [3.0, 1.4, 0.0],      from: [-5.6, 3.4, -21.0],  fov: 44 },
    // inspection only (not in the script)
    council_sign:       { at: [9.2, 1.35, 774.6],   from: [11.3, 1.6, 772.3],  fov: 34 },
    booth_wall:         { at: [8.5, 1.35, -0.7],    from: [8.2, 1.5, -2.6],    fov: 40 },
    dash_1:             { at: [7.9, 1.0, 5.2],      from: [7.9, 1.5, 4.6],     fov: 30 },
  };
  const cams = {
    cp_north:    { type: 'fixed', pos: [10.5, 6.5, -50.0], look: [7.5, 0.0, -32.0], fov: 46 },   // first = default
    cp_cross:    { type: 'fixed', pos: [9.7, 7.2, -29.3],  look: [6.6, 0.0, -15.5], fov: 52 },   // the sweeper crosses L-R at z -20 (lens just south of the gantry beam)
    cp_plaza:    { type: 'fixed', pos: [14.2, 4.6, -14.5], look: [7.8, 0.8, -2.6],  fov: 50 },   // hatch AND panel faces in one frame
    cp_passage:  { type: 'fixed', pos: [3.4, 3.4, 5.0],    look: [6.6, 0.8, -1.5],  fov: 48 },   // from lane L south of the gate
    cp_dock:     { type: 'fixed', pos: [3.2, 4.2, 12.5],   look: [8.3, 0.6, 3.6],   fov: 50 },
    cp_overview: { type: 'fixed', pos: [-4.0, 9.0, -46.0], look: [4.0, 0.0, -10.0], fov: 50 },   // filmable land outside the walk
    ch_launch:   { type: 'fixed', pos: [11.6, 3.6, 30.0],  look: [4.0, 0.6, 12.0],  fov: 50 },
    ch_shoulder: { type: 'fixed', pos: [-5.8, 0.5, 214.0], look: [1.0, 0.9, 168.0], fov: 38 },   // low on the W shoulder, looking back up the road
    ch_lamp:     { type: 'fixed', pos: [6.2, 12.0, 364.0], look: [0.5, 2.2, 336.0], fov: 50 },   // from a lamp head on the hump
    ch_channel:  { type: 'fixed', pos: [26.0, 3.5, 650.0], look: [2.0, 1.2, 598.0], fov: 32 },   // long lens from the channel-marker beacon
    ch_end:      { type: 'fixed', pos: [16.5, 5.2, 790.0], look: [4.0, 0.4, 750.0], fov: 46 },
    bw_end:      { type: 'fixed', pos: [36.0, 0.6, 806.0], look: [24.0, -2.0, 786.0], fov: 48 },
  };
  const zones = [   // first match wins
    { box: [6.0, -3.0, 7.0, 0.1], cam: 'cp_passage' },
    { box: [6.0, 0.1, 10.6, 8.2], cam: 'cp_dock' },
    { box: [6.0, -12.0, 13.3, -0.45], cam: 'cp_plaza' },
    { box: [6.0, -24.5, 13.3, -12.0], cam: 'cp_cross' },
    { box: [6.0, -46.5, 13.3, -24.5], cam: 'cp_north' },
    { box: [8.4, 774.0, 60.0, 840.0], cam: 'bw_end' },
    { box: [-60, 8.2, 60, 100], cam: 'ch_launch' },      // deck zones: framing + fallback only (the chase drives the camera)
    { box: [-60, 100, 60, 260], cam: 'ch_shoulder' },
    { box: [-60, 260, 60, 460], cam: 'ch_lamp' },
    { box: [-60, 460, 60, 690], cam: 'ch_channel' },
    { box: [-60, 690, 60, 900], cam: 'ch_end' },
    { box: [-60, -60, 60, 8.2], cam: 'cp_overview' },
  ];
  const ar = [   // only while Chase (2040) is active with his chip on (before t25_chip)
    { id: 'ar_lockdown', at: [0, 6.3, -30.1], text: 'PENINSULA LOCKDOWN', kind: 'sign', w: 9, color: 0xff3a3a },
    { id: 'ar_lockdown2', at: [0, 5.6, -30.1], text: 'All crossings require human confirmation', kind: 'sign', w: 6, color: 0xff3a3a },
    { id: 'ar_booth', at: [8.0, 3.2, -3.0], text: 'CHECKPOINT 3 · CLONTARF', kind: 'sign', w: 2.6 },
    { id: 'ar_tower_w', at: [-9.2, 10.2, 3.0], text: 'COURTESY TOWER · Have a safe day', kind: 'sign', w: 3 },
    { id: 'ar_tower_e', at: [12.2, 10.2, 3.0], text: 'COURTESY TOWER · Have a safe day', kind: 'sign', w: 3 },
    { id: 'ar_bridge', at: [0, 3.0, 40.0], text: 'TED SMOUT MEMORIAL BRIDGE · 2.7 km · 25 km/h', kind: 'sign', w: 6 },
    { id: 'ar_hire', at: [8.5, 1.6, 4.6], text: 'HOVER HIRE · 25 km/h · Are you sure?', kind: 'ad', w: 2.4 },
    { id: 'ar_queue', at: [0, 2.4, -11.4], text: 'ESTIMATED WAIT: indefinite (for your safety)', kind: 'tag', w: 3.4 },
  ];
  // the FOLLOW rig (spec §7.2): writes the mini-game's override pos/look arrays in place; lateral follow damped
  const FW = { x: 0, ok: false };
  function followAt(pos, look, dt, snap) {
    if (!R.scoot) return;
    const S = R.scoot[0], f = chase.follow, k = snap || !FW.ok ? 1 : 1 - Math.exp(-f.damp * (dt || 1 / 60));
    FW.x += (S.x - FW.x) * k; FW.ok = true;
    const zc = S.z + f.offset[2], zl = S.z + f.look[2];
    pos[0] = FW.x + f.offset[0]; pos[1] = deckY(zc) + f.offset[1]; pos[2] = zc;
    look[0] = FW.x + f.look[0]; look[1] = deckY(zl) + f.look[1]; look[2] = zl;
  }
  function camAt(s) {
    const L = chase.schedule;
    for (let i = 0; i < L.length; i++) if (s < L[i][1]) return L[i][2];
    return L[L.length - 1][2];
  }
  const TRAFFIC = CARS.slice(12);   // the six deck cars' live state (read-only): { x, z, v, vis, yielding, mode }
  const chase = {
    LANES, START, LAUGH, END, SPEED, deckY,
    ROAD: [-6.1, 6.1], LANE_W: 3.5, PATH: [6.4, 8.4], GAP: [766, 776],   // kerb/barrier faces (x), the shared path (x), the barrier gap (z)
    follow: { offset: [-0.8, 1.55, -7.0], look: [0, 0.9, 12.0], fov: 52, damp: 4 },
    schedule: [[10, 60, 'ch_launch'], [60, 150, 'FOLLOW'], [150, 215, 'ch_shoulder'], [215, 330, 'FOLLOW'], [330, 360, 'ch_lamp'], [360, 560, 'FOLLOW'], [560, 640, 'ch_channel'], [640, 735, 'FOLLOW'], [735, 900, 'ch_end']],
    formation: FORMATION,
    traffic: TRAFFIC,
    cruise: (on, o) => cruise(on, o),
    swerve: (o) => swerve(o),
    s: () => (R.scoot ? R.scoot[0].z : 0),
    camAt,
    followAt,
    get cruising() { return CR.on; },
    get swerving() { return CR.sw; },
  };
  return {
    env: {
      noon25:     { bg: 0x9cc8e0, fog: [0xd8dccc, 0.0042], hemi: [0xf2f4ee, 0x9a8a6a, 1.05], dir: [0xfff0d6, 1.60, [-3, 18, -8]],  spot: [0xffd8a0, 4.5], rain: 0 },
      chase25:    { bg: 0x8aa8b4, fog: [0xc4cabc, 0.0040], hemi: [0xe6ebe6, 0x7f7a62, 1.00], dir: [0xfff2dc, 1.40, [-6, 14, -10]], spot: [0xffffff, 0],   rain: 0 },
      mangrove25: { bg: 0x6f8a88, fog: [0x9aa89a, 0.0085], hemi: [0xcfdcd0, 0x4a5a40, 0.90], dir: [0xe8ecd8, 0.90, [-6, 10, 4]],   spot: [0xffffff, 0],   rain: 0 },
      credits25:  { bg: 0xe6b884, fog: [0xf0caa0, 0.0040], hemi: [0xffe8cc, 0x6a5a48, 0.95], dir: [0xffb070, 1.20, [-14, 5, 6]],  spot: [0xffd8a0, 4.0], rain: 0 },
    },
    build, marks, anchors, cams, zones, colliders: COL, floor, update,
    props: [
      'gate_R', 'gate_M', 'gate_L', 'booth', 'booth_lamp', 'booth_bulb', 'no_button', 'no_cap', 'desk_fan', 'fan_head', 'fan_blades', 'booth_screen', 'booth_speaker',
      'reason_panel', 'reason_card_0..5', 'reader_card_0..5', 'panel_led', 'desk_card', 'desk_card_blank', 'desk_card_xmas', 'kettle_booth', 'radio_booth',
      'tower_W', 'tower_E', 'tower_W_ring', 'tower_W_beacon', 'tower_E_ring', 'tower_E_beacon', 'tower_drones', 'cars', 'car_bodies', 'car_interiors', 'car_canopies', 'car_glows', 'car_blobs',
      'scooter_1', 'scooter_2', 'scooter_1_dash', 'scooter_2_dash', 'scooter_1_glow', 'scooter_2_glow', 'drop_marks', 'pelicans', 'pelican_wings', 'channel_lights', 'council_sign',
      'mangroves', 'mangrove_trunks', 'mangrove_canopies', 'pneumatophores', 'lamps', 'lamp_poles', 'lamp_heads', 'railing_posts', 'pier_columns', 'pier_caps', 'old_bridge_piers',
      'rocks', 'pines', 'houses', 'house_roofs', 'gums', 'bollards', 'boats', 'boardwalk_posts', 'blobs', 'water', 'mud', 'far', 'band', 'haze', 'skirt', 'storm', 'clouds', 'sun',
    ],
    get ambience() { return AMB[R.state] || AMB.checkpoint25; },
    // extras (spec §12)
    dress, dressed: () => R.state, askLoop, mount, unmount, chase, paths: PATHS, ar, deckY,
  };
})();
