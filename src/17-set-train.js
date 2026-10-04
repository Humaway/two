// ============================================================ SET: train — one 2040 Shorncliffe-line carriage
// Scene 2.7 "Shorncliffe Line" (Sun 23 Dec 2040, 16:30 -> ~16:50, storm): 2.7_board (from its second beat), the PLAY
// "Ticket inspection" (roam: drone + stealth from 33-systems), 2.7_talk. Spec: docs/sets/train.md (names and
// coordinates are the contract).
//
// LAYOUT (metres, Y up). THE CARRIAGE NEVER MOVES; THE WORLD DOES. Carriage floor y 0 (platforms are at floor level; the
// track bed / outside ground is y -1.15). +Z = the direction of travel (toward the city); the treadmill moves the outside
// world toward -Z. -X = the platform side at every station (left when facing +Z). Mark ry: faces (sin ry, cos ry):
// 0 = +Z, PI = -Z, H = +X, -H = -X.
//   Shell: interior x -1.42..1.42, z -11..11; outer skin x +-1.55; ceiling 2.30 flat for |x| < 0.75, coving to 2.02 at
//   |x| 1.42. End walls z +-11 (gangway doors shut, a dim painted card of the next carriage in their windows).
//   Vestibules (doors both sides, a pair of 0.65 leaves sliding 0.62 into pockets, amber lamp above each):
//   A z -11..-8.6 (doors -10.15..-8.85), M z -1..1 (doors -0.65..0.65; TEA POINT on the M face of the -X partition at
//   z -1.0), B z 8.6..11 (doors 8.85..10.15). Glass partitions at z -8.6, -1, 1, 8.6 from x +-0.42 to +-1.42 (y 0..1.9).
//   Eight bays of facing 2+2 seats (bay length 1.9): A1 -8.6..-6.7 · A2 ..-4.8 · A3 ..-2.9 · A4 ..-1.0 · B1 1.0..2.9 ·
//   B2 ..4.8 · B3 ..6.7 · B4 ..8.6. Per bay per side two benches: f (faces +Z, cushion z0+0.08..z0+0.54, back z0..z0+0.1)
//   and b (faces -Z, cushion z1-0.54..z1-0.08, back z1-0.1..z1); cushion top 0.45, back top 1.22, white head-cloths,
//   a grab handle at the aisle corner. Side L x -1.38..-0.40, R 0.40..1.38. Seats: window w x +-1.12, aisle a +-0.66;
//   f z = z0+0.31 (ry 0), b z = z1-0.31 (ry PI) — seat(bay, side, row, pos) and the 64 marks seat_<bay><side><row><pos>.
//   Aisle x -0.40..0.40. Grab poles (+-0.62, -10.3 / 0 / 10.3: A and B by the gangway, out of the corner lenses). Windows per bay both sides: glazing x +-1.43,
//   y 0.92..1.86, z z0+0.25..z1-0.25 (rain on the glass). LED strips x +-0.80 y 2.26. PIDs over each partition's aisle
//   opening (y 2.17, facing the seats). CCTV dome (0, 2.28, 0).
//   OUTSIDE (treadmill, all allocation-free): track bed (UV-scrolled, our track x 0, the second track x 4.2), masts
//   (period 60: x -2.6 and 6.8, wires static), suburbs (period 480: the parallel street x 12.5..19.5 with power poles
//   x 11.6, Queenslanders / lowset brick / fibro x 22..46 and -16..-40, trees, a park, a padded level crossing at
//   local z 381, the noise wall x -7.5 and chain-link x 10.5, the 120 m wetland west at local z 200..320 with mangroves
//   and a heron; 3 hover-cars on the street), rain sheets x -8.5 and 9, far: storm dome, horizon band (hills west, CBD
//   ahead, the bay glint east), cloud rings, a sky-flash shell. PLATFORM group (-X; local z 0 = platform centre =
//   carriage centre when stopped): deck x -1.65..-7.0, z -50..50, top y 0, white tactile strip x -2.25..-1.85, canopy
//   x -6.5..-2.4, z -30..30, y 3.4 (8 columns x -6.2), blank nameboards 3.6 x 0.6 at (-4.0, 2.4, +-12) facing +X,
//   4 padded benches x -5.6, padded bin (-5, 0, 4), 6 lamps x -6.6, back fence x -7.45, station building beyond,
//   8 standing dummies (IM).
//
// ENV: storm27 (default) · platform27 · dark27 (no preset rains: the world rain would fall inside; the rain is the
//   set's own: sheets, glass). DRESS (dress(state, { keepEnv })): board27 · run27 · inspect27 · talk27 · valley27 · none.
//   AUTO: '2.7' -> board27; outside 2.7 (setview, dev) the dress follows the env (platform27 board27, storm27 run27,
//   dark27 talk27) until something calls dress().
// MARKS: seat_<A1..B4><L|R><f|b><w|a> (64) · s27_c40 s27_chase s27_passenger s27_luka_doze · s27_chase_up
//   s27_reindeer_man rdeer_seat rdeer_aisle_M rdeer_aisle_B1 rdeer_flop s27_pax_c s27_pax_d s27_free_B4 s27_cp_carriage ·
//   d27_board_out d27_board_in d27_stop_A1..A4 d27_stop_M d27_stop_B1..B4 d27_wait_M d27_wait_B1 d27_exit_A d27_exit_M
//   d27_exit_B · s27_talk_luka s27_talk_c40 s27_talk_chase · s27_kettle s27_chime_spot
// ANCHORS: s27_board_three s27_passenger_ots s27_platform_wide s27_doors_chime s27_drone_boards s27_luka_doze
//   s27_reindeer s27_reindeer_block s27_chase_asleep s27_talk_two s27_window_storm s27_carriage_wide · tea_point
//   s27_nameboard s27_pid
// CAMS (fixed, high in the corners under the coving; they cut, never ease): aisle_B_far (first = default)
//   aisle_B_near aisle_A_far aisle_A_near vest_M vest_A vest_B. ZONES tile the carriage (7 boxes).
// PROPS (userData API; every call is instant while skipping, nothing allocates per tick):
//   doors_L, doors_R open(u 0..1) (1.4 s ease; .u = now) · door_lamps blink while doors move · leds level(u),
//   flicker(dur) · pids pulse() · tea_point (world.puff('tea_point'); steam()) · reindeer state('seat' | 'aisle' |
//   'held' | 'flop', where?, who = 'chase') (aisle: a mark name or [x, z]; held: world.actor(who).hold), wobble(),
//   .state · pax nod(i), scanFlash(i), scanBay(bay, side), seatOf(i), count · platform name(label), dummies(n), .label ·
//   nameboard_a, nameboard_b (AR anchors) · scenery (track_bed, fences, masts, suburbs, street_cars, rain_sheets) ·
//   far (dome, band, clouds, flash) lightning(k)
// EXTRAS on the entry: dress(state, o), seat(bay, side, row, pos), travel { cruise, speed, state, station, depart(),
//   arrive(name, d = 110) -> s, stopNow(name), cruiseNow() }, doors(open, side = 'L'), chime(), lightning(k = 1),
//   paths, stations, ar (nameboard AR specs), castFor(state) -> { actorId: mark }, castLook(actorId) -> look
//   (reindeer_man -> local40_c; the others' ids are their looks).
// AMBIENCE (getter, by travel state): cruising rail_clack + train_hum + rain_roof; stopped train_idle + rain_roof +
//   platform_murmur; talk27 / valley27 + rain_heavy; room 'carriage'. One-shots: train_chime, train_doors, thunder_far,
//   thunder, glass_squeak (the reindeer).
// THE SPOT is the lightning (fixed outside the -X windows of B4); world.torchAuto = false while this set is current.
// Static geometry is vertex-coloured and merged per material; painted 64-256 px textures (nearest) only where something
// must read; every outside repeat is an InstancedMesh in its layer group (the group moves, never the instances).
SETS.train = (() => {
  const PI = Math.PI, H = PI / 2, DS = THREE.DoubleSide;
  // ---- palette (spec §3.1; no Yes yellow: poles, tactile strips and head-cloths are white)
  const WALL = 0xe6eef4, CEILC = 0xf0f4f8, DADO = 0xc6d4e0, NAVY = 0x22355e, CLOTH = 0xf2f4f6, AISLE = 0x9fc4e0,
    POLE = 0xf4f6f8, STEEL = 0xaab2ba, STEEL_D = 0x5e666e, SHELL = 0x8e9aa8, RUBBER = 0x2a2e34, DOORC = 0xdde6ee,
    TEALD = 0x2a6e72, BITU = 0x3a3d40, GUM = 0x4c6a4a, WET = 0x2f3e3a, CONC = 0x9a9a94, TACT = 0xe8e8e0,
    CANOPY = 0xc8ccd0, GRASS = 0x56704c, GRAVEL = 0x5e5b54, RD_BODY = 0x8a5a36, RD_CHEST = 0xf2ece0, RD_NOSE = 0xd8323a,
    RD_ANT = 0xc8a878, PADC = 0xe6dcc6;
  const IN = [1, 1, 1], OUT = [0.66, 0.72, 0.70], PLAT = [0.84, 0.88, 0.88];
  const GY = -1.15;                                 // outside ground / track bed level
  const XI = 1.42, XO = 1.55, ZE = 11.0, CY = 2.30, CXF = 0.75, CYW = 2.02;
  const BAYS = { A1: -8.6, A2: -6.7, A3: -4.8, A4: -2.9, B1: 1.0, B2: 2.9, B3: 4.8, B4: 6.7 }, BL = 1.9;
  const BAY_IDS = ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4'];
  const DOORZ = [-9.5, 0, 9.5], DH = 0.65, DSLIDE = 0.62, DTIME = 1.4;
  const POLEZ = [-10.3, 0, 10.3];                   // grab poles (spec -9.5 / 0 / 9.5: A and B moved to the gangway side, out of the corner lenses)
  const PARTZ = [-8.6, -1.0, 1.0, 8.6];
  const SUB_T = 480, MAST_T = 60, ZMIN = -175, ZMAX = 655;   // treadmill periods; local z covered by the suburbs layer
  const COL = [];                                   // colliders (the reindeer's box is written in place)
  const R = {};                                     // live refs from the last build
  // scratch (update never allocates)
  const tc = new THREE.Color(), m4 = new THREE.Matrix4(), q1 = new THREE.Quaternion(), e1 = new THREE.Euler(),
    v1 = new THREE.Vector3(), s1 = new THREE.Vector3(), c1 = new THREE.Color();
  let b = null, tint = IN, XF = null, T = null, M = null, MB = null;
  const skipping = () => typeof flow !== 'undefined' && flow && !!flow.skipping;
  const calm = () => typeof options !== 'undefined' && options && !!options.reduceFlashing;
  const isCur = () => typeof world !== 'undefined' && world.setId === 'train';
  const smooth = (u) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
  const r2 = (v) => Math.round(v * 100) / 100;
  let seed = 11; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const SO = { vol: 1, rate: 1, at: null, lp: 0 };
  function snd(name, vol = 1, rate = 1, at = null) {
    if (!isCur() || skipping() || typeof sfx !== 'function') return;
    SO.vol = vol; SO.rate = rate; SO.at = at; sfx(name, SO);
  }

  // ---------------------------------------------------------- seats
  function seat(bay, side, row, pos, out) {
    const z0 = BAYS[bay]; if (z0 == null) return null;
    const s = side === 'L' ? -1 : 1, f = row === 'f';
    const r = out || [0, 0, 0, 0];
    r[0] = r2(s * (pos === 'a' ? 0.66 : 1.12)); r[1] = 0; r[2] = r2(f ? z0 + 0.31 : z0 + BL - 0.31); r[3] = f ? 0 : PI;
    return r;
  }
  const seatOfName = (n, out) => seat(n.slice(0, 2), n[2], n[3], n[4], out);   // 'B2Rbw'

  // ---------------------------------------------------------- geometry helpers (into the current Builder `b`), as reddy
  function put(g, hex, m) {
    if (XF) g.applyMatrix4(XF);
    tc.set(hex);
    const r = tc.r * tint[0], gg = tc.g * tint[1], bl = tc.b * tint[2], n = g.attributes.position.count, a = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { a[i * 3] = r; a[i * 3 + 1] = gg; a[i * 3 + 2] = bl; }
    g.setAttribute('color', new THREE.BufferAttribute(a, 3));
    b.geo(g, m || M.vc);
  }
  function box(w, h, d, hex, x, y, z, ry = 0, m) { const g = new THREE.BoxGeometry(w, h, d); if (ry) g.rotateY(ry); g.translate(x, y + h / 2, z); put(g, hex, m); }
  // (long runs are cut into <= 32 m pieces: very long thin triangles rasterise badly across the near plane)
  function bb(x0, y0, z0, x1, y1, z1, hex, m) {
    const LZ = Math.abs(z1 - z0), LX = Math.abs(x1 - x0);
    if (LZ > 32) { const n = Math.ceil(LZ / 32), a = Math.min(z0, z1), d = LZ / n; for (let i = 0; i < n; i++) bb(x0, y0, a + i * d, x1, y1, a + (i + 1) * d, hex, m); return; }
    if (LX > 32) { const n = Math.ceil(LX / 32), a = Math.min(x0, x1), d = LX / n; for (let i = 0; i < n; i++) bb(a + i * d, y0, z0, a + (i + 1) * d, y1, z1, hex, m); return; }
    box(LX, Math.abs(y1 - y0), LZ, hex, (x0 + x1) / 2, Math.min(y0, y1), (z0 + z1) / 2, 0, m);
  }
  function boxR(w, h, d, hex, x, y, z, rx = 0, ry = 0, rz = 0, m) {
    const g = new THREE.BoxGeometry(w, h, d); g.rotateX(rx); g.rotateZ(rz); g.rotateY(ry); g.translate(x, y, z); put(g, hex, m);
  }
  function cyl(rt, rb, h, seg, hex, x, y, z, rx = 0, rz = 0, m) {
    const g = new THREE.CylinderGeometry(rt, rb, h, seg); if (rx) g.rotateX(rx); if (rz) g.rotateZ(rz); g.translate(x, y, z); put(g, hex, m);
  }
  function ico(r, hex, x, y, z, sy = 1, m, sx = 1, sz = 1) { const g = new THREE.IcosahedronGeometry(r, 0); g.scale(sx, sy, sz); g.translate(x, y, z); put(g, hex, m); }
  function sph(r, hex, x, y, z, sx = 1, sy = 1, sz = 1, ws = 8, hs = 6, m) { const g = new THREE.SphereGeometry(r, ws, hs); g.scale(sx, sy, sz); g.translate(x, y, z); put(g, hex, m); }
  // a plane facing +Z before rotation (rx first, then ry)
  function quad(w, h, m, x, y, z, ry = 0, rx = 0, hex = 0xffffff) {
    const g = new THREE.PlaneGeometry(w, h); if (rx) g.rotateX(rx); if (ry) g.rotateY(ry); g.translate(x, y, z); put(g, hex, m);
  }
  // remap a geometry's 0..1 UVs into the pixel rect r = [x, y, w, h] of an aw x ah atlas (canvas y down)
  function uvRect(g, r, aw = 256, ah = 256) {
    const uv = g.attributes.uv, u0 = r[0] / aw, u1 = (r[0] + r[2]) / aw, vt = 1 - r[1] / ah, v0 = 1 - (r[1] + r[3]) / ah;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, u0 + uv.getX(i) * (u1 - u0), v0 + uv.getY(i) * (vt - v0));
    return g;
  }
  // a textured quad showing atlas rect r (faces +Z before rotation: rx first, then ry)
  function tq(w, h, r, x, y, z, ry = 0, rx = 0, m = M.atlas, hex = 0xffffff) {
    const g = uvRect(new THREE.PlaneGeometry(w, h), r); if (rx) g.rotateX(rx); if (ry) g.rotateY(ry); g.translate(x, y, z); put(g, hex, m);
  }
  // world-space UVs by the dominant normal (a box covered in moquette, a floor, a wall strip)
  function triUV(g, tile, tv = tile) {
    if (!g.attributes.normal) g.computeVertexNormals();
    const p = g.attributes.position, n = g.attributes.normal, uv = g.attributes.uv;
    for (let i = 0; i < p.count; i++) {
      const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), az = Math.abs(n.getZ(i));
      if (ax >= ay && ax >= az) uv.setXY(i, p.getZ(i) / tile, p.getY(i) / tv);
      else if (ay >= az) uv.setXY(i, p.getX(i) / tile, -p.getZ(i) / tv);
      else uv.setXY(i, p.getX(i) / tile, p.getY(i) / tv);
    }
    return g;
  }
  function bbT(x0, y0, z0, x1, y1, z1, m, tile, hex = 0xffffff) {
    const g = new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0); g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    put(triUV(g, tile), hex, m);
  }
  // a quad from four corners (a b c d in order); the face looks toward `toward` = [x, y, z]
  function quad4(a, bq, c, d, hex, m, toward) {
    const g = new THREE.BufferGeometry();
    const P = [a, bq, c, a, c, d], pos = new Float32Array(18);
    for (let i = 0; i < 6; i++) { pos[i * 3] = P[i][0]; pos[i * 3 + 1] = P[i][1]; pos[i * 3 + 2] = P[i][2]; }
    // flip if the normal faces away from `toward`
    const ux = bq[0] - a[0], uy = bq[1] - a[1], uz = bq[2] - a[2], wx = c[0] - a[0], wy = c[1] - a[1], wz = c[2] - a[2];
    const nx = uy * wz - uz * wy, ny = uz * wx - ux * wz, nz = ux * wy - uy * wx;
    if (toward && nx * (toward[0] - a[0]) + ny * (toward[1] - a[1]) + nz * (toward[2] - a[2]) < 0) {
      for (const k of [1, 4]) { const j = k * 3, l = (k + 1) * 3; for (let t = 0; t < 3; t++) { const s = pos[j + t]; pos[j + t] = pos[l + t]; pos[l + t] = s; } }
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.computeVertexNormals();
    g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(12), 2));
    put(g, hex, m);
  }
  // a separate Builder -> named Group (a prop). Coordinates inside fn are local.
  function part(name, fn, pos, ry = 0, o) {
    const pb = b, px = XF; b = new Builder(); XF = null;
    fn();
    const g = b.done(o); b = pb; XF = px;
    if (name) g.name = name;
    if (pos) g.position.set(pos[0], pos[1], pos[2]);
    g.rotation.y = ry;
    return g;
  }
  // one merged geometry (single material) from a builder function, for InstancedMesh repeats
  function geoOf(fn, o) { const g = part('', fn, null, 0, Object.assign({ floor: false }, o)); return g.children[0].geometry; }
  function IM(geo, m, list, name, parent) { const im = instanced(geo, m, list); if (name) im.name = name; if (parent) parent.add(im); return im; }
  function dyn(im) { im.instanceMatrix.setUsage(THREE.DynamicDrawUsage); im.frustumCulled = false; return im; }
  function text(c, s, x, y, px, col, al = 'center', w = 'bold', maxW) {
    c.font = `${w} ${px}px Arial, "Liberation Sans", "DejaVu Sans", sans-serif`; c.fillStyle = col; c.textAlign = al; c.textBaseline = 'middle';
    if (maxW) c.fillText(s, x, y, maxW); else c.fillText(s, x, y);
  }
  function rrect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }

  // ---------------------------------------------------------- textures (built once, keyed)
  // atlas cells (256 x 256)
  const A_PID = [0, 0, 128, 48], A_TEA = [128, 0, 64, 64], A_DOORPIC = [192, 0, 64, 64], A_TAG = [0, 64, 128, 64],
    A_SIGN1 = [128, 64, 128, 32], A_SIGN2 = [128, 96, 128, 32], A_NAME = [0, 128, 128, 32], A_GANG = [128, 128, 64, 128],
    A_BTN = [192, 128, 32, 32], A_WHITE = [228, 132, 24, 24], A_SIGN3 = [0, 160, 128, 32], A_SIGN4 = [0, 192, 128, 32],
    A_BLDG = [0, 224, 128, 32];
  // houses texture cells (256 x 128)
  const H_WB = [0, 0, 64, 64], H_BR = [64, 0, 64, 64], H_FIB = [128, 0, 64, 64], H_CB = [192, 0, 64, 64], H_LAT = [0, 64, 64, 32],
    H_WHITE = [244, 116, 8, 8], H_DOOR = [64, 64, 32, 64], H_GAR = [96, 64, 64, 64];
  function paintPID(c, x0, y0, w, h, k = 1) {
    const g = c.createLinearGradient(0, y0, 0, y0 + h); g.addColorStop(0, '#173866'); g.addColorStop(1, '#3a7cbc');
    c.fillStyle = g; c.fillRect(x0, y0, w, h);
    c.fillStyle = 'rgba(191,230,255,0.10)'; for (let y = y0; y < y0 + h; y += 3) c.fillRect(x0, y, w, 1);
    // the chip glyph (blank screen otherwise: AR only)
    const cx = x0 + w / 2, cy = y0 + h / 2;
    c.strokeStyle = `rgba(191,230,255,${0.85 * k})`; c.lineWidth = 2; rrect(c, cx - 9, cy - 9, 18, 18, 3); c.stroke();
    c.fillStyle = `rgba(191,230,255,${0.85 * k})`; c.fillRect(cx - 4, cy - 4, 8, 8);
    for (let i = -1; i <= 1; i++) { c.fillRect(cx + i * 6 - 1, cy - 14, 2, 4); c.fillRect(cx + i * 6 - 1, cy + 10, 2, 4); c.fillRect(cx - 14, cy + i * 6 - 1, 4, 2); c.fillRect(cx + 10, cy + i * 6 - 1, 4, 2); }
  }
  function textures() {
    if (T) return T;
    T = {};
    seed = 11;
    // moquette: navy with small teal chip-dots and a faint wave
    T.moq = canvasTex(64, 64, (c, w, h) => {
      c.fillStyle = '#22355e'; c.fillRect(0, 0, w, h);
      for (let i = 0; i < 260; i++) { c.fillStyle = rnd() < 0.5 ? 'rgba(10,20,44,0.35)' : 'rgba(60,80,130,0.25)'; c.fillRect((rnd() * w) | 0, (rnd() * h) | 0, 1, 1); }
      c.strokeStyle = 'rgba(70,100,150,0.5)'; c.lineWidth = 1;
      for (let row = 0; row < 4; row++) { c.beginPath(); for (let x = 0; x <= w; x++) { const y = row * 16 + 12 + Math.sin((x / w) * Math.PI * 2) * 2.5; if (x) c.lineTo(x, y); else c.moveTo(x, y); } c.stroke(); }
      for (let row = 0; row < 4; row++) for (let col = 0; col < 4; col++) {
        const x = col * 16 + (row % 2 ? 8 : 0) + 4, y = row * 16 + 4;
        c.fillStyle = '#2f8a8a'; c.fillRect(x, y, 3, 3); c.fillStyle = '#5cc0c0'; c.fillRect(x + 1, y + 1, 1, 1);
        c.fillStyle = 'rgba(47,138,138,0.55)'; c.fillRect(x - 1, y + 1, 1, 1); c.fillRect(x + 3, y + 1, 1, 1); c.fillRect(x + 1, y - 1, 1, 1); c.fillRect(x + 1, y + 3, 1, 1);
      }
    }, { key: 'train_moq', repeat: [1, 1], nearest: true });
    // floor: grey speckle
    T.floor = canvasTex(64, 64, (c, w, h) => {
      c.fillStyle = '#8a9096'; c.fillRect(0, 0, w, h);
      for (let i = 0; i < 700; i++) { const k = rnd(); c.fillStyle = k < 0.4 ? '#7a8086' : k < 0.75 ? '#9aa0a6' : k < 0.93 ? '#a8b0b8' : '#5e646a'; c.fillRect((rnd() * w) | 0, (rnd() * h) | 0, 1, 1); }
    }, { key: 'train_floor', repeat: [1, 1], nearest: true });
    // rain on the glass: faint haze, droplets, rivulets streaking back
    T.drops = canvasTex(128, 128, (c, w, h) => {
      c.clearRect(0, 0, w, h); c.fillStyle = 'rgba(200,215,225,0.07)'; c.fillRect(0, 0, w, h);
      const dot = (x, y, r) => {
        for (const ox of [-w, 0, w]) for (const oy of [-h, 0, h]) {
          c.fillStyle = 'rgba(40,52,60,0.40)'; c.beginPath(); c.ellipse(x + ox, y + oy + r * 0.35, r, r * 0.8, 0, 0, Math.PI * 2); c.fill();
          c.fillStyle = 'rgba(235,244,250,0.75)'; c.beginPath(); c.ellipse(x + ox, y + oy, r * 0.85, r * 0.7, 0, 0, Math.PI * 2); c.fill();
          c.fillStyle = 'rgba(255,255,255,0.95)'; c.fillRect(x + ox - r * 0.4, y + oy - r * 0.45, 1, 1);
        }
      };
      for (let i = 0; i < 90; i++) dot(rnd() * w, rnd() * h, 0.7 + rnd() * 1.5);
      c.lineCap = 'round';
      for (let i = 0; i < 12; i++) {
        const x = rnd() * w, y = rnd() * h, len = 18 + rnd() * 40, sl = 0.25 + rnd() * 0.25;
        for (const ox of [-w, 0, w]) for (const oy of [-h, 0, h]) {
          c.strokeStyle = 'rgba(220,232,240,0.45)'; c.lineWidth = 1.3; c.beginPath(); c.moveTo(x + ox, y + oy); c.lineTo(x + ox - len, y + oy + len * sl); c.stroke();
        }
      }
    }, { key: 'train_drops', repeat: [1, 1] });
    // track bed: one tile = 4.2 m across (track centred) x 2.4 m along (4 sleepers)
    T.track = canvasTex(128, 128, (c, w, h) => {
      c.fillStyle = '#56544e'; c.fillRect(0, 0, w, h);
      for (let i = 0; i < 2600; i++) { const k = rnd(); c.fillStyle = k < 0.3 ? '#4a4842' : k < 0.6 ? '#66625a' : k < 0.85 ? '#74706a' : '#3c3a36'; c.fillRect((rnd() * w) | 0, (rnd() * h) | 0, 2, 2); }
      for (let s = 0; s < 4; s++) { const y = s * 32 + 10; c.fillStyle = '#3e3a36'; c.fillRect(34, y, 60, 13); c.fillStyle = '#4c4844'; c.fillRect(34, y, 60, 3); }
      for (const x of [47, 79]) { c.fillStyle = '#2a2a2c'; c.fillRect(x - 2, 0, 5, h); c.fillStyle = '#8a8e92'; c.fillRect(x - 1, 0, 3, h); c.fillStyle = '#c8d0d6'; c.fillRect(x, 0, 1, h); }
    }, { key: 'train_track', repeat: [1, 1], nearest: true });
    // fences: top half a concrete noise-wall panel (3 m, drain line), bottom half chain-link (alpha)
    T.fence = canvasTex(64, 64, (c, w, h) => {
      c.clearRect(0, 0, w, h);
      c.fillStyle = '#8c918e'; c.fillRect(0, 0, w, 32);
      for (let i = 0; i < 300; i++) { c.fillStyle = rnd() < 0.5 ? '#80857f' : '#979c98'; c.fillRect((rnd() * w) | 0, (rnd() * 30) | 0, 1, 1); }
      c.fillStyle = '#6a6e6a'; c.fillRect(0, 0, 2, 32); c.fillStyle = '#a6aaa6'; c.fillRect(2, 0, 1, 32);
      c.fillStyle = '#5a5e5a'; c.fillRect(0, 26, w, 2); c.fillStyle = 'rgba(60,66,62,0.5)'; c.fillRect(10, 2, 1, 22); c.fillRect(40, 4, 1, 18);
      c.fillStyle = '#9ea29e'; c.fillRect(0, 0, w, 2);
      // chain-link
      c.strokeStyle = 'rgba(150,158,160,0.95)'; c.lineWidth = 1;
      for (let x = -32; x < w + 32; x += 6) { c.beginPath(); c.moveTo(x, 34); c.lineTo(x + 28, 62); c.stroke(); c.beginPath(); c.moveTo(x + 28, 34); c.lineTo(x, 62); c.stroke(); }
      c.fillStyle = '#7a8084'; c.fillRect(0, 32, 3, 32); c.fillRect(0, 33, w, 2);
    }, { key: 'train_fence', repeat: [1, 1], nearest: true });
    // the atlas
    T.atlas = canvasTex(256, 256, (c) => {
      c.fillStyle = '#ffffff'; c.fillRect(0, 0, 256, 256);
      paintPID(c, A_PID[0], A_PID[1], A_PID[2], A_PID[3]);
      // tea point pictogram: cup + steam on a white plate
      { const [x, y, w, h] = A_TEA; c.fillStyle = '#eef3f6'; c.fillRect(x, y, w, h); c.strokeStyle = '#2a6e72'; c.lineWidth = 3; rrect(c, x + 3, y + 3, w - 6, h - 6, 8); c.stroke();
        c.fillStyle = '#22355e'; c.beginPath(); c.moveTo(x + 18, y + 30); c.lineTo(x + 42, y + 30); c.lineTo(x + 39, y + 50); c.lineTo(x + 21, y + 50); c.closePath(); c.fill();
        c.strokeStyle = '#22355e'; c.lineWidth = 3; c.beginPath(); c.arc(x + 43, y + 38, 5, -1.3, 1.3); c.stroke();
        c.fillRect(x + 15, y + 51, 30, 3);
        c.strokeStyle = '#2f8a8a'; c.lineWidth = 2.5; for (const sx of [24, 31, 38]) { c.beginPath(); c.moveTo(x + sx, y + 26); c.bezierCurveTo(x + sx - 5, y + 21, x + sx + 5, y + 17, x + sx, y + 10); c.stroke(); } }
      // door pictogram: keep hands clear
      { const [x, y, w, h] = A_DOORPIC; c.fillStyle = '#eef3f6'; c.fillRect(x, y, w, h); c.fillStyle = '#2a6e72'; c.beginPath(); c.arc(x + 32, y + 30, 22, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#ffffff'; c.fillRect(x + 31, y + 12, 2, 36); c.fillRect(x + 18, y + 22, 10, 16); c.fillRect(x + 20, y + 16, 3, 8); c.fillRect(x + 24, y + 15, 3, 9);
        c.strokeStyle = '#ffffff'; c.lineWidth = 3; c.beginPath(); c.moveTo(x + 38, y + 30); c.lineTo(x + 48, y + 30); c.moveTo(x + 44, y + 25); c.lineTo(x + 49, y + 30); c.lineTo(x + 44, y + 35); c.stroke();
        text(c, 'KEEP CLEAR', x + 32, y + 58, 9, '#22355e'); }
      // luggage tag in biro: TO THE GRANDKIDS
      { const [x, y, w, h] = A_TAG; c.fillStyle = '#d8dee4'; c.fillRect(x, y, w, h);
        c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(x + 22, y + 4); c.lineTo(x + w - 4, y + 4); c.lineTo(x + w - 4, y + h - 4); c.lineTo(x + 22, y + h - 4); c.lineTo(x + 4, y + h - 18); c.lineTo(x + 4, y + 18); c.closePath(); c.fill();
        c.strokeStyle = '#b8c0c8'; c.lineWidth = 1; c.stroke();
        c.fillStyle = '#d8dee4'; c.beginPath(); c.arc(x + 16, y + h / 2, 4, 0, Math.PI * 2); c.fill(); c.strokeStyle = '#9aa4ae'; c.stroke();
        text(c, 'TO THE', x + 74, y + 21, 17, '#1f3fa8', 'center', 'italic bold');
        text(c, 'GRANDKIDS', x + 74, y + 42, 19, '#1f3fa8', 'center', 'italic bold', 96);
        c.strokeStyle = '#1f3fa8'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x + 32, y + 54); c.quadraticCurveTo(x + 74, y + 59, x + 116, y + 53); c.stroke(); }
      // signs
      const sign = (r, s1, s2, bg, fg) => { const [x, y, w, h] = r; c.fillStyle = bg; c.fillRect(x, y, w, h); c.fillStyle = fg; c.fillRect(x, y + h - 3, w, 3);
        if (s2) { text(c, s1, x + w / 2, y + 10, 11, fg, 'center', 'bold', w - 8); text(c, s2, x + w / 2, y + 22, 10, fg, 'center', 'bold', w - 8); } else text(c, s1, x + w / 2, y + h / 2 - 1, 13, fg, 'center', 'bold', w - 8); };
      sign(A_SIGN1, 'DOORS CLOSE', 'AFTER THE CHIME', '#eef3f6', '#22355e');
      sign(A_SIGN2, 'CARRIAGE 3 OF 6', null, '#22355e', '#eef3f6');
      sign(A_SIGN3, 'PLEASE HOLD ON', 'FOR YOUR SAFETY', '#eef3f6', '#2a6e72');
      sign(A_SIGN4, 'PRIORITY SEATING', null, '#2a6e72', '#eef3f6');
      // the blank nameboard (AR only): navy, a thin white rule, the chip mark small in the corner
      { const [x, y, w, h] = A_NAME; c.fillStyle = '#1c2c50'; c.fillRect(x, y, w, h); c.strokeStyle = '#dfe8f0'; c.lineWidth = 2; c.strokeRect(x + 3, y + 3, w - 6, h - 6);
        c.fillStyle = 'rgba(191,230,255,0.7)'; c.fillRect(x + w - 16, y + 11, 8, 8); c.fillStyle = 'rgba(191,230,255,0.25)'; c.fillRect(x + 10, y + h / 2 - 1, w - 34, 2); }
      // the next carriage through the gangway window: dim blue perspective
      { const [x, y, w, h] = A_GANG; const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#5a7a9a'); g.addColorStop(0.5, '#34506e'); g.addColorStop(1, '#283a50'); c.fillStyle = g; c.fillRect(x, y, w, h);
        const cx = x + w / 2, cy = y + 52;
        c.fillStyle = '#1e2c44'; for (let i = 0; i < 6; i++) { const k = 1 - i * 0.15, bw = 12 * k, bh = 26 * k, oy = cy + 40 * k; c.fillRect(cx - 4 - bw - 14 * k, oy - bh, bw, bh); c.fillRect(cx + 4 + 14 * k, oy - bh, bw, bh); }
        c.strokeStyle = '#bfe0ff'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + 6, y + 6); c.lineTo(cx - 6, cy - 2); c.moveTo(x + w - 6, y + 6); c.lineTo(cx + 6, cy - 2); c.stroke();
        c.fillStyle = '#9fc4e0'; c.beginPath(); c.moveTo(cx - 3, cy + 6); c.lineTo(cx + 3, cy + 6); c.lineTo(cx + 14, y + h); c.lineTo(cx - 14, y + h); c.closePath(); c.globalAlpha = 0.35; c.fill(); c.globalAlpha = 1;
        c.fillStyle = '#1a2436'; c.fillRect(cx - 7, cy - 14, 14, 20); c.fillStyle = 'rgba(191,224,255,0.35)'; c.fillRect(cx - 4, cy - 11, 8, 8); }
      // door button: a white ring with a teal centre
      { const [x, y, w] = A_BTN; c.fillStyle = '#c8d0d8'; c.fillRect(x, y, w, w); c.fillStyle = '#f4f6f8'; c.beginPath(); c.arc(x + 16, y + 16, 13, 0, Math.PI * 2); c.fill(); c.fillStyle = '#2f8a8a'; c.beginPath(); c.arc(x + 16, y + 16, 8, 0, Math.PI * 2); c.fill(); c.fillStyle = '#bfe6ff'; c.fillRect(x + 13, y + 15, 6, 2); }
      c.fillStyle = '#ffffff'; c.fillRect(A_WHITE[0], A_WHITE[1], A_WHITE[2], A_WHITE[3]);
      // station building windows strip (brick with lit windows), for the backdrop
      { const [x, y, w, h] = A_BLDG; c.fillStyle = '#8a5a48'; c.fillRect(x, y, w, h); c.fillStyle = '#6e4638'; for (let yy = y; yy < y + h; yy += 4) c.fillRect(x, yy, w, 1);
        for (let i = 0; i < 6; i++) { c.fillStyle = i % 3 === 1 ? '#3a4450' : '#e8d29a'; c.fillRect(x + 6 + i * 20, y + 8, 12, 16); c.fillStyle = '#dcdcd4'; c.fillRect(x + 5 + i * 20, y + 24, 14, 2); } }
    }, { key: 'train_atlas', nearest: true });
    // houses: four facades + lattice, door, garage; and the matching window-glow map
    const facade = (glow) => (c) => {
      c.fillStyle = glow ? '#000000' : '#ffffff'; c.fillRect(0, 0, 256, 128);
      const win = (x, y, w, h, lit, frame) => {
        if (glow) { c.fillStyle = lit ? '#ffffff' : '#000000'; c.fillRect(x + 1, y + 1, w - 2, h - 2); return; }
        c.fillStyle = frame; c.fillRect(x, y, w, h); c.fillStyle = lit ? '#ffd890' : '#2c3640'; c.fillRect(x + 1, y + 1, w - 2, h - 2);
        if (lit) { c.fillStyle = '#e8b868'; c.fillRect(x + 1, y + 1, w - 2, 3); }
        c.fillStyle = frame; c.fillRect(x + 1, y + (h >> 1), w - 2, 1);
      };
      if (!glow) {
        // weatherboard
        c.fillStyle = '#f2f0ea'; c.fillRect(0, 0, 64, 64); c.fillStyle = '#c8c4ba'; for (let y = 2; y < 64; y += 4) c.fillRect(0, y, 64, 1);
        c.fillStyle = '#e0dcd2'; c.fillRect(0, 0, 2, 64); c.fillRect(62, 0, 2, 64);
        // brick
        c.fillStyle = '#d8cfc2'; c.fillRect(64, 0, 64, 64);
        for (let y = 0; y < 64; y += 4) for (let x = (y / 4) % 2 ? -4 : 0; x < 64; x += 8) { c.fillStyle = ((x * 7 + y * 3) % 5) ? '#a8644c' : '#94563e'; c.fillRect(64 + Math.max(0, x), y, Math.min(7, 64 - Math.max(0, x)), 3); }
        // fibro
        c.fillStyle = '#e4e2d8'; c.fillRect(128, 0, 64, 64); c.fillStyle = '#c4c2b8'; for (let x = 128; x < 192; x += 12) c.fillRect(x, 0, 1, 64); c.fillRect(128, 30, 64, 1);
        // Colorbond
        c.fillStyle = '#e8ecee'; c.fillRect(192, 0, 64, 64); for (let x = 192; x < 256; x += 4) { c.fillStyle = '#c4cacc'; c.fillRect(x, 0, 1, 64); c.fillStyle = '#f6f8f8'; c.fillRect(x + 2, 0, 1, 64); }
        // lattice (stumps skirt)
        c.fillStyle = '#3a4a3a'; c.fillRect(0, 64, 64, 32); c.strokeStyle = '#c8d0c0'; c.lineWidth = 1;
        for (let x = -32; x < 96; x += 6) { c.beginPath(); c.moveTo(x, 64); c.lineTo(x + 32, 96); c.stroke(); c.beginPath(); c.moveTo(x + 32, 64); c.lineTo(x, 96); c.stroke(); }
        // door, garage
        c.fillStyle = '#5a3a2a'; c.fillRect(64, 64, 32, 64); c.fillStyle = '#ffd890'; c.fillRect(74, 72, 12, 10);
        c.fillStyle = '#c8ccce'; c.fillRect(96, 64, 64, 64); c.fillStyle = '#aab0b2'; for (let y = 66; y < 128; y += 5) c.fillRect(96, y, 64, 1);
        c.fillStyle = '#ffffff'; c.fillRect(H_WHITE[0], H_WHITE[1], H_WHITE[2], H_WHITE[3]);
      }
      // windows: weatherboard (sash, one lit), brick (aluminium), fibro
      win(7, 18, 9, 30, true, '#ffffff'); win(26, 18, 9, 30, false, '#ffffff'); win(48, 18, 9, 30, true, '#ffffff');
      win(64 + 6, 20, 12, 24, false, '#d8dcd8'); win(64 + 40, 20, 16, 24, true, '#d8dcd8');
      win(128 + 8, 20, 12, 22, true, '#d0d0c8'); win(128 + 40, 20, 12, 22, false, '#d0d0c8');
      if (glow) { c.fillStyle = '#ffffff'; c.fillRect(75, 73, 10, 8); }
    };
    T.houses = canvasTex(256, 128, facade(false), { key: 'train_houses', nearest: true });
    T.housesGlow = canvasTex(256, 128, facade(true), { key: 'train_houses_glow', nearest: true });
    // horizon band (alpha): row 0 hills + treeline (west, everywhere), row 1 the CBD ahead, row 2 the bay (east)
    T.band = canvasTex(256, 128, (c, w) => {
      c.clearRect(0, 0, w, 128);
      const ridge = (y0, h0, amp, n, col, f) => { c.fillStyle = col; c.beginPath(); c.moveTo(0, y0 + h0); for (let x = 0; x <= w; x += 2) { const t = x / w; c.lineTo(x, y0 + h0 - amp * f(t)); } c.lineTo(w, y0 + h0); c.closePath(); c.fill(); };
      ridge(0, 47, 26, 0, '#b8c0bc', (t) => 0.55 + 0.25 * Math.sin(t * Math.PI * 2) + 0.15 * Math.sin(t * Math.PI * 6 + 1) + 0.05 * Math.sin(t * Math.PI * 22));
      ridge(0, 47, 12, 0, '#8c968e', (t) => 0.5 + 0.3 * Math.sin(t * Math.PI * 4 + 2) + 0.2 * Math.abs(Math.sin(t * Math.PI * 40)));
      // CBD: low hills + towers
      ridge(48, 47, 8, 0, '#9aa4a0', (t) => 0.6 + 0.4 * Math.sin(t * Math.PI * 2));
      seed = 5;
      for (let i = 0; i < 26; i++) {
        const cx = 40 + rnd() * 176, tw = 5 + rnd() * 9, th = 8 + rnd() * 30 * (1 - Math.abs(cx - 128) / 120);
        c.fillStyle = rnd() < 0.5 ? '#a4aeac' : '#b4bcba'; c.fillRect(cx, 95 - th - 4, tw, th + 4);
        c.fillStyle = 'rgba(255,230,170,0.6)'; for (let k = 0; k < 4; k++) c.fillRect(cx + 1 + ((rnd() * (tw - 2)) | 0), 95 - 6 - ((rnd() * th) | 0), 1, 1);
      }
      c.fillStyle = '#c4ccca'; c.fillRect(124, 52, 4, 39);   // a spire
      // the bay: a flat horizon, a bright glint line
      c.fillStyle = '#a8b4b2'; c.fillRect(0, 118, w, 10); c.fillStyle = 'rgba(232,240,236,0.9)'; c.fillRect(0, 118, w, 2);
      for (let x = 0; x < w; x += 9) { c.fillStyle = 'rgba(240,248,244,0.7)'; c.fillRect(x + ((x * 13) % 5), 121, 4, 1); }
    }, { key: 'train_band', nearest: true });
    // dome: dark cloud base overhead to a lighter band at the horizon (greyscale; the material tints it per env)
    T.dome = canvasTex(128, 64, (c, w, h) => {
      const g = c.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#8a8a8a'); g.addColorStop(0.32, '#a6a6a6'); g.addColorStop(0.5, '#ffffff'); g.addColorStop(0.56, '#f0f0f0'); g.addColorStop(1, '#d0d0d0');
      c.fillStyle = g; c.fillRect(0, 0, w, h);
      seed = 23;
      for (let i = 0; i < 40; i++) { const x = rnd() * w, y = 4 + rnd() * 24, r = 4 + rnd() * 10; c.fillStyle = 'rgba(70,74,72,0.22)'; for (const ox of [-w, 0, w]) { c.beginPath(); c.ellipse(x + ox, y, r * 1.8, r * 0.6, 0, 0, Math.PI * 2); c.fill(); } }
    }, { key: 'train_dome' });
    // storm clouds (alpha), tiling horizontally
    T.cloud = canvasTex(128, 64, (c, w, h) => {
      c.clearRect(0, 0, w, h); seed = 31;
      for (let i = 0; i < 26; i++) {
        const x = rnd() * w, y = 22 + rnd() * 22, r = 6 + rnd() * 12;
        for (const ox of [-w, 0, w]) {
          c.fillStyle = 'rgba(63,74,70,0.9)'; c.beginPath(); c.ellipse(x + ox, y, r * 1.6, r * 0.8, 0, 0, Math.PI * 2); c.fill();
          c.fillStyle = 'rgba(154,168,160,0.55)'; c.beginPath(); c.ellipse(x + ox - r * 0.3, y - r * 0.45, r * 1.1, r * 0.35, 0, 0, Math.PI * 2); c.fill();
        }
      }
      const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(0.25, 'rgba(0,0,0,0)'); g.addColorStop(0.85, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,1)');
      c.globalCompositeOperation = 'destination-out'; c.fillStyle = g; c.fillRect(0, 0, w, h); c.globalCompositeOperation = 'source-over';
    }, { key: 'train_cloud', repeat: [1, 1] });
    // rain streaks (alpha)
    T.streaks = canvasTex(64, 128, (c, w, h) => {
      c.clearRect(0, 0, w, h); seed = 41; c.lineCap = 'round';
      for (let i = 0; i < 70; i++) {
        const x = rnd() * w, y = rnd() * h, len = 8 + rnd() * 22, a = 0.18 + rnd() * 0.4;
        c.strokeStyle = `rgba(220,230,236,${a.toFixed(2)})`; c.lineWidth = 1;
        for (const oy of [-h, 0, h]) for (const ox of [-w, 0, w]) { c.beginPath(); c.moveTo(x + ox, y + oy); c.lineTo(x + ox - len * 0.12, y + oy + len); c.stroke(); }
      }
    }, { key: 'train_streaks', repeat: [1, 1] });
    return T;
  }

  // ---------------------------------------------------------- materials
  function materials() {
    M = {
      vc: mat(0xffffff),
      ceil: mat(0xffffff, { emissive: 0x9fb6cc, emissiveIntensity: 0.5, key: 'train_ceil' }),
      floor: matTex(T.floor),
      seat: matTex(T.moq),
      atlas: matTex(T.atlas),
      pid: matTex(T.atlas, { emissive: 0xffffff, emissiveIntensity: 0.9, key: 'train_pid' }),
      glass: mat(0xd4e8f2, { transparent: true, opacity: 0.18, side: DS }),
      led: mat(0xffffff, { emissive: 0xbfe0ff, emissiveIntensity: 1.3, key: 'train_led' }),
      lampL: mat(0x5a3a10, { emissive: 0xffae3a, emissiveIntensity: 0.2, key: 'train_lampL' }),
      lampR: mat(0x5a3a10, { emissive: 0xffae3a, emissiveIntensity: 0.2, key: 'train_lampR' }),
      track: matTex(T.track, { key: 'train_track' }),
      fence: matTex(T.fence, { key: 'train_fence', side: DS }),
      house: matTex(T.houses, { emissive: 0xffc878, emissiveIntensity: 0.9, key: 'train_house' }),
      glow: mat(0xffffff, { emissive: 0xe8f0ff, emissiveIntensity: 0.85 }),
      soffit: mat(0x9aa0a6, { emissive: 0x6a7480, emissiveIntensity: 1 }),
      red: mat(0x400000, { emissive: 0xff3020, emissiveIntensity: 0.9, key: 'train_xing' }),
    };
    M.fence.alphaTest = 0.5;
    M.house.emissiveMap = T.housesGlow;
    MB ||= {
      glassRain: new THREE.MeshBasicMaterial({ map: T.drops, transparent: true, opacity: 0.6, depthWrite: false, color: 0xe6eef2 }),
      dome: new THREE.MeshBasicMaterial({ map: T.dome, fog: false, side: THREE.BackSide, depthWrite: false, color: 0x6f807a }),
      band: new THREE.MeshBasicMaterial({ map: T.band, transparent: true, fog: false, depthWrite: false, color: 0x5d6d66 }),
      cloud: new THREE.MeshBasicMaterial({ map: T.cloud, transparent: true, fog: false, depthWrite: false, side: THREE.BackSide }),
      flash: new THREE.MeshBasicMaterial({ color: 0xe8f0ff, transparent: true, opacity: 0, fog: false, depthWrite: false, side: THREE.BackSide, blending: THREE.AdditiveBlending }),
      rain: new THREE.MeshBasicMaterial({ map: T.streaks, transparent: true, opacity: 0.5, depthWrite: false, side: DS, color: 0xd8e2e8 }),
      chip: new THREE.MeshBasicMaterial({ color: 0xffffff }),
    };
    M.glassRain = MB.glassRain;
  }

  // ---------------------------------------------------------- the carriage interior (static)
  function shell() {
    tint = IN;
    // floor (speckle), underframe, door wells, aisle lines
    { const g = new THREE.PlaneGeometry(2 * XO, 2 * ZE); g.rotateX(-H); put(triUV(g, 0.8), 0xffffff, M.floor); }
    bb(-XO, -0.7, -ZE - 0.15, XO, -0.01, ZE + 0.15, 0x3a3e44);
    for (const s of [-1, 1]) for (const zc of DOORZ) {
      bb(s * 1.28, 0, zc - DH, s * XO, 0.004, zc + DH, 0xb8c0c8);            // aluminium door well
      bb(s * 1.30, 0.004, zc - DH, s * 1.36, 0.007, zc + DH, TACT);           // white edge strip
    }
    for (const s of [-1, 1]) for (const [z0, z1] of [[-8.6, -1.0], [1.0, 8.6]]) bb(s * 0.36, 0, z0, s * 0.40, 0.004, z1, AISLE);
    // ---- side walls: dado below the windows, pillars between them, a band over them; door openings
    const doorAt = (z) => DOORZ.some((zc) => z > zc - DH && z < zc + DH);
    const winRanges = BAY_IDS.map((k) => [BAYS[k] + 0.25, BAYS[k] + BL - 0.25]);
    for (const s of [-1, 1]) {
      const xa = s * XI, xb = s * XO;
      // build in z steps between all breakpoints
      const bp = [-ZE, ZE];
      for (const zc of DOORZ) bp.push(zc - DH, zc + DH);
      for (const [a, c] of winRanges) bp.push(a, c);
      bp.sort((p, q) => p - q);
      for (let i = 0; i < bp.length - 1; i++) {
        const z0 = bp[i], z1 = bp[i + 1], zm = (z0 + z1) / 2; if (z1 - z0 < 1e-4) continue;
        if (doorAt(zm)) continue;
        const win = winRanges.some(([a, c]) => zm > a && zm < c);
        bb(xa, 0, z0, xb, 0.92, z1, DADO);
        if (!win) bb(xa, 0.92, z0, xb, 1.86, z1, WALL);
        bb(xa, 1.86, z0, xb, CYW, z1, WALL);
      }
      // door heads and jambs (dark rubber edges)
      for (const zc of DOORZ) {
        bb(xa, 1.98, zc - DH, xb, CYW, zc + DH, STEEL);
        bb(s * 1.40, 0, zc - DH - 0.03, s * 1.47, 2.0, zc - DH, RUBBER); bb(s * 1.40, 0, zc + DH, s * 1.47, 2.0, zc + DH + 0.03, RUBBER);
      }
      // window reveals, sills, a teal stripe under the windows
      for (const [a, c] of winRanges) {
        bb(s * 1.36, 0.885, a, s * XI, 0.92, c, STEEL);
        bb(xa - s * 0.005, 0.92, a, s * 1.47, 0.95, c, 0x9aa4ae); bb(xa - s * 0.005, 1.83, a, s * 1.47, 1.86, c, 0x9aa4ae);
        bb(xa - s * 0.005, 0.92, a, s * 1.47, 1.86, a + 0.03, 0x9aa4ae); bb(xa - s * 0.005, 0.92, c - 0.03, s * 1.47, 1.86, c, 0x9aa4ae);
      }
      for (const [z0, z1] of [[-8.6, -1.0], [1.0, 8.6]]) bb(xa - s * 0.004, 0.80, z0, xa, 0.84, z1, TEALD);
    }
    // the glazing (rain on the glass): one quad per window, facing in
    for (const s of [-1, 1]) for (const [a, c] of winRanges) {
      const g = new THREE.PlaneGeometry(c - a, 0.94); g.rotateY(s < 0 ? H : -H); g.translate(s * 1.44, 1.39, (a + c) / 2);
      const uv = g.attributes.uv, p = g.attributes.position;
      for (let i = 0; i < uv.count; i++) uv.setXY(i, p.getZ(i) / 0.5, p.getY(i) / 0.5);
      put(g, 0xffffff, M.glassRain);
    }
    // ---- ceiling and coving (lit by the LEDs: emissive)
    { const g = new THREE.PlaneGeometry(2 * CXF, 2 * ZE); g.rotateX(H); g.translate(0, CY, 0); put(g, CEILC, M.ceil); }
    for (const s of [-1, 1]) quad4([s * CXF, CY, -ZE], [s * XI, CYW, -ZE], [s * XI, CYW, ZE], [s * CXF, CY, ZE], CEILC, M.ceil, [0, 1.0, 0]);
    // ceiling details: a centre service strip, air vents
    for (let z = -10; z <= 10; z += 2.5) if (Math.abs(z) > 0.3) { bb(-0.13, CY - 0.008, z - 0.32, 0.13, CY, z + 0.32, 0xdfe6ec, M.ceil); for (let k = -2; k <= 2; k++) bb(-0.11, CY - 0.009, z + k * 0.12 - 0.02, 0.11, CY - 0.008, z + k * 0.12 + 0.02, 0x8e9aa6, M.ceil); }
    // CCTV dome
    sph(0.075, 0x1c2228, 0, CY - 0.02, 0, 1, 0.7, 1, 10, 6); cyl(0.09, 0.09, 0.02, 12, 0xe8eef2, 0, CY - 0.01, 0);
    // ---- LED strips over the seating sections and the vestibules
    for (const s of [-1, 1]) {
      for (const [z0, z1] of [[-8.55, -1.05], [1.05, 8.55], [-10.8, -8.75], [-0.85, 0.85], [8.75, 10.8]]) {
        bb(s * 0.86, 2.255, z0, s * 0.74, 2.285, z1, 0xc8d2dc, M.ceil);
        bb(s * 0.835, 2.245, z0 + 0.02, s * 0.765, 2.258, z1 - 0.02, 0xffffff, M.led);
      }
    }
    // ---- end walls with the gangway doors (shut, a dim card of the next carriage in the window)
    for (const s of [-1, 1]) {
      const zw = s * ZE, zo = s * (ZE + 0.15), zf = s * (ZE + 0.06);
      bb(-XO, 0, zw, -0.48, CY, zo, WALL); bb(0.48, 0, zw, XO, CY, zo, WALL); bb(-0.48, 1.98, zw, 0.48, CY, zo, WALL);
      bb(-0.48, 0, zw, -0.44, 1.98, zo, STEEL); bb(0.44, 0, zw, 0.48, 1.98, zo, STEEL);
      // the door (recessed), its window card, a handle
      bb(-0.44, 0, zf, 0.44, 1.97, zo, 0xb4c0cc);
      bb(-0.2, 1.06, zf - s * 0.004, 0.2, 1.74, zf, 0x6a7480);
      tq(0.36, 0.64, A_GANG, 0, 1.4, zf - s * 0.006, s > 0 ? PI : 0);
      bb(0.26, 0.98, zf - s * 0.03, 0.30, 1.14, zf, STEEL_D);
      // signs either side
      tq(0.66, 0.165, A_SIGN2, -0.95, 1.72, zw - s * 0.004, s > 0 ? PI : 0);
      tq(0.66, 0.165, A_SIGN3, 0.95, 1.72, zw - s * 0.004, s > 0 ? PI : 0);
      tq(0.66, 0.165, A_SIGN1, s > 0 ? 0.95 : -0.95, 1.50, zw - s * 0.004, s > 0 ? PI : 0);
    }
    // ---- partitions: glass screens with steel frames (the tea point's has a solid panel)
    for (const zp0 of PARTZ) for (const s of [-1, 1]) {
      const zp = zp0 + (Math.abs(zp0) > 5 ? Math.sign(zp0) : -Math.sign(zp0)) * 0.035;   // toward the vestibule (clear of the seat backs)
      const xa = s * 0.42, xb = s * XI, tea = zp0 === -1.0 && s < 0;
      bb(xa, 0, zp - 0.025, xa + s * 0.045, 1.92, zp + 0.025, STEEL);              // aisle post
      bb(xa, 1.88, zp - 0.02, xb, 1.92, zp + 0.02, STEEL);                          // top rail
      bb(xa, 0, zp - 0.02, xb, 0.18, zp + 0.02, STEEL_D);                           // kick panel
      if (tea) {
        bb(xb, 0.18, zp - 0.02, -0.62, 1.88, zp + 0.02, 0xd6dee6);
        quad(0.2, 1.70, M.glass, -0.52, 1.03, zp, 0);
      } else quad(Math.abs(xb - xa) - 0.045, 1.70, M.glass, (xa + s * 0.045 + xb) / 2, 1.03, zp, 0);
      bb(s * 1.395, 0, zp - 0.03, xb, 1.92, zp + 0.03, STEEL);                     // wall post
      // priority seating sign on the seat side of the outer partitions
      if (zp0 === -8.6 || zp0 === 8.6) tq(0.42, 0.105, A_SIGN4, s * 0.92, 1.62, zp0 + (zp0 < 0 ? 0.004 : -0.004), zp0 < 0 ? 0 : PI);
    }
    // ---- grab poles (white, floor to ceiling)
    for (const zc of POLEZ) for (const s of [-1, 1]) {
      cyl(0.02, 0.02, CY, 8, POLE, s * 0.62, CY / 2, zc); cyl(0.045, 0.045, 0.03, 10, STEEL, s * 0.62, 0.015, zc); cyl(0.04, 0.04, 0.03, 10, STEEL, s * 0.62, CY - 0.015, zc);
    }
    // door buttons + pictograms on the fixed wall either side of each door (inside)
    for (const s of [-1, 1]) for (const zc of DOORZ) {
      tq(0.09, 0.09, A_BTN, s * (XI - 0.004), 1.15, zc + DH + 0.1, s < 0 ? H : -H);
      if (zc !== 0) tq(0.14, 0.14, A_DOORPIC, s * (XI - 0.004), 1.45, zc + (zc < 0 ? -DH - 0.22 : DH + 0.15), s < 0 ? H : -H);
    }
  }

  // the 32 benches (frames in M.vc, cushions/backs in M.seat, head-cloths, grab handles)
  function seats() {
    tint = IN;
    for (const k of BAY_IDS) {
      const z0 = BAYS[k], z1 = z0 + BL;
      for (const s of [-1, 1]) {
        const xa = Math.min(s * 0.40, s * 1.38), xb = Math.max(s * 0.40, s * 1.38), xin = s * 0.40;
        // a wall rail the benches hang from
        bb(s * 1.38, 0.18, z0 + 0.05, s * XI, 0.30, z1 - 0.05, STEEL_D);
        for (const f of [true, false]) {
          const zz = (d) => (f ? z0 + d : z1 - d), za = (d0, d1) => [Math.min(zz(d0), zz(d1)), Math.max(zz(d0), zz(d1))];
          const [c0, c1] = za(0.08, 0.54), [k0, k1] = za(0.03, 0.10), [h0, h1] = za(0.0, 0.03), [p0, p1] = za(0.10, 0.52);
          bb(xa, 0.28, p0, xb, 0.36, p1, SHELL);                                        // seat pan
          bbT(xa + 0.01, 0.36, c0, xb - 0.01, 0.45, c1, M.seat, 0.32);                  // cushion
          bbT(xa + 0.01, 0.45, k0, xb - 0.01, 1.20, k1, M.seat, 0.32);                  // backrest
          bb(xa, 0.28, h0, xb, 1.22, h1, SHELL);                                        // rear shell
          bb(xa, 1.20, Math.min(h0, k0), xb, 1.235, Math.max(h1, k1), 0x7a8694);         // top cap
          bb(s * 0.86, 0.36, c0 + 0.02, s * 0.92, 0.452, c1 - 0.02, 0x18284a);           // seam between the two seats
          // pedestal at the aisle end, armrest
          bb(xin + s * 0.03, 0, zz(0.30) - 0.04, xin + s * 0.09, 0.28, zz(0.30) + 0.04, STEEL_D);
          bb(xin + s * 0.02, 0.0, zz(0.30) - 0.12, xin + s * 0.10, 0.02, zz(0.30) + 0.12, STEEL_D);
          // head-cloths (white), one per seat, draped over the top
          for (const px of [1.12, 0.66]) {
            const x = s * px, fz = f ? k1 + 0.006 : k0 - 0.006;
            bb(x - 0.17, 1.0, Math.min(fz, f ? k1 : k0), x + 0.17, 1.21, Math.max(fz, f ? k1 : k0), CLOTH);
            bb(x - 0.17, 1.235, Math.min(h0, k0), x + 0.17, 1.245, Math.max(h1, k1), CLOTH);
          }
          // the grab handle at the aisle corner
          const gz = (h0 + k1) / 2 - 0.0;
          bb(xin + s * 0.02, 1.235, gz - 0.07, xin + s * 0.04, 1.30, gz - 0.05, POLE);
          bb(xin + s * 0.02, 1.235, gz + 0.05, xin + s * 0.04, 1.30, gz + 0.07, POLE);
          bb(xin + s * 0.015, 1.28, gz - 0.07, xin + s * 0.045, 1.31, gz + 0.07, POLE);
        }
      }
    }
  }

  // the PIDs (4) and the tea point
  function pids() {
    const P = new THREE.Group(); P.name = 'pids';
    const g = part('pid_screens', () => {
      for (const zp of PARTZ) {
        const face = zp === -8.6 || zp === 1.0 ? 1 : -1, z = zp + face * 0.03;   // faces the seats
        bb(-0.18, 2.11, z - 0.025, 0.18, 2.23, z + 0.025, 0xb8c4ce, M.ceil);
        bb(-0.172, 2.115, z + face * 0.025, 0.172, 2.225, z + face * 0.029, 0x1e2630);
        bb(-0.015, 2.25, z - 0.01, 0.015, CY, z + 0.01, STEEL);
        tq(0.33, 0.10, A_PID, 0, 2.17, z + face * 0.0305, face > 0 ? 0 : PI, 0, M.pid);
      }
    }, null, 0, { floor: false });
    P.add(g);
    return P;
  }
  function teaPoint() {
    // origin at the hot-water nozzle (the puff point); the unit hangs on the M face of the -X partition at z -1.0
    return part('tea_point', () => {
      bb(-0.20, -0.125, -0.10, 0.20, 0.325, 0.02, 0xe8eef2);                         // body
      bb(-0.20, -0.125, -0.10, 0.20, -0.105, 0.03, STEEL);                            // drip tray
      bb(-0.16, -0.10, -0.06, 0.16, -0.085, 0.02, 0x7a848e);
      tq(0.20, 0.20, A_TEA, -0.06, 0.20, 0.0215);                                      // pictogram
      cyl(0.016, 0.016, 0.06, 8, STEEL, 0.0, 0.02, -0.02);                             // nozzle
      bb(-0.03, 0.04, -0.06, 0.03, 0.07, 0.0, STEEL);
      bb(0.10, 0.14, 0.0, 0.18, 0.24, 0.022, 0x2f8a8a);                                // the push button plate
      bb(0.12, 0.17, 0.02, 0.16, 0.21, 0.026, 0xf4f6f8);
      // cup stack in a side holder
      bb(0.20, -0.06, -0.08, 0.27, 0.22, 0.0, STEEL);
      for (let i = 0; i < 4; i++) cyl(0.03, 0.024, 0.07, 8, 0xf6f6f2, 0.235, -0.03 + 0.065 * i + 0.035, -0.04);
    }, [-1.0, 1.0, -0.85], 0, { floor: false });
  }

  // the sliding door leaves: one group per side, two moving parts (the -Z leaves and the +Z leaves of all three doors)
  function doorLeaves(s) {
    const G = new THREE.Group(); G.name = s < 0 ? 'doors_L' : 'doors_R';
    const leaf = (sign) => part(s < 0 ? (sign < 0 ? 'doorsN_L' : 'doorsP_L') : (sign < 0 ? 'doorsN_R' : 'doorsP_R'), () => {
      for (const zc of DOORZ) {
        const za = sign < 0 ? zc - DH : zc, zb = sign < 0 ? zc : zc + DH;
        const xa = s * 1.445, xb = s * 1.515, x0 = Math.min(xa, xb), x1 = Math.max(xa, xb);
        bb(x0, 0.01, za, x1, 1.0, zb, DOORC); bb(x0, 1.85, za, x1, 2.0, zb, DOORC);
        bb(x0, 1.0, za, x1, 1.85, za + 0.07, DOORC); bb(x0, 1.0, zb - 0.07, x1, 1.85, zb, DOORC);
        quad(DH - 0.14, 0.85, M.glass, (x0 + x1) / 2, 1.425, (za + zb) / 2, H);
        bb(x0 - 0.003, 0.95, za, x1 + 0.003, 0.99, zb, TEALD);                              // a teal band
        const me = sign < 0 ? zb : za;                                                         // meeting edge: rubber nosing
        bb(x0 - 0.004, 0.01, Math.min(me, me - sign * 0.03), x1 + 0.004, 2.0, Math.max(me, me - sign * 0.03), RUBBER);
        const xin = s > 0 ? x0 - 0.012 : x1 + 0.012;                                          // a grab bar on the inner face
        bb(Math.min(xin, s > 0 ? x0 : x1), 1.02, (za + zb) / 2 - 0.12, Math.max(xin, s > 0 ? x0 : x1), 1.06, (za + zb) / 2 + 0.12, STEEL);
      }
    }, null, 0, { floor: false });
    const n = leaf(-1), p = leaf(1);
    G.add(n); G.add(p);
    G.userData.n = n; G.userData.p = p;
    return G;
  }
  // door lamps: 6 amber lamps above the doors (one material per side so only the moving side blinks)
  function doorLamps() {
    return part('door_lamps', () => {
      for (const s of [-1, 1]) for (const zc of DOORZ) {
        bb(s * 1.33, 2.04, zc - 0.10, s * 1.40, 2.10, zc + 0.10, 0x6a727a);
        bb(s * 1.325, 2.045, zc - 0.08, s * 1.335, 2.095, zc + 0.08, 0xffffff, s < 0 ? M.lampL : M.lampR);
      }
    }, null, 0, { floor: false });
  }

  // ---------------------------------------------------------- the reindeer (inflatable; origin at its feet, facing +Z)
  function reindeerModel() {
    return part('rdeer_model', () => {
      for (const [x, z] of [[-0.18, 0.28], [0.18, 0.28], [-0.18, -0.32], [0.18, -0.32]]) {
        cyl(0.085, 0.10, 0.46, 8, RD_BODY, x, 0.23, z); sph(0.11, 0x6a4228, x, 0.03, z + 0.02, 1, 0.45, 1.2, 8, 4);
      }
      sph(0.34, RD_BODY, 0, 0.74, -0.04, 1, 0.95, 1.55, 12, 8);                         // body
      sph(0.26, RD_CHEST, 0, 0.84, 0.36, 1, 1.15, 0.7, 10, 6);                          // white chest
      sph(0.10, RD_CHEST, 0, 0.92, -0.56, 1, 1, 0.8, 8, 6);                             // tail
      // neck and head
      const g = new THREE.CylinderGeometry(0.14, 0.18, 0.5, 10); g.rotateX(0.35); g.translate(0, 1.18, 0.42); put(g, RD_BODY);
      sph(0.19, RD_BODY, 0, 1.46, 0.52, 1, 1, 1.25, 10, 8);                              // head
      sph(0.13, 0x9a6a44, 0, 1.40, 0.74, 1, 0.85, 1.0, 10, 6);                          // muzzle
      sph(0.075, RD_NOSE, 0, 1.42, 0.86, 1, 1, 1, 10, 8);                               // red nose
      sph(0.022, 0xffffff, 0.02, 1.45, 0.92, 1, 1, 0.6, 6, 4);                          // nose glint
      for (const sx of [-1, 1]) {
        sph(0.045, 0xffffff, sx * 0.09, 1.55, 0.66, 1, 1.1, 0.6, 8, 6); sph(0.028, 0x101010, sx * 0.095, 1.55, 0.69, 1, 1.1, 0.6, 6, 4);
        boxR(0.05, 0.16, 0.10, 0x6a4228, sx * 0.19, 1.58, 0.48, 0, 0, sx * 0.9);       // ears
        // antlers: a main beam up and out, two tines
        const ant = (len, r, x, y, z, rz, rx) => { const a = new THREE.CylinderGeometry(r * 0.8, r, len, 6); a.translate(0, len / 2, 0); a.rotateX(rx); a.rotateZ(rz); a.translate(x, y, z); put(a, RD_ANT); };
        ant(0.34, 0.045, sx * 0.10, 1.60, 0.46, -sx * 0.55, -0.15);
        ant(0.22, 0.04, sx * 0.27, 1.88, 0.42, -sx * 0.15, -0.1);
        ant(0.16, 0.035, sx * 0.20, 1.80, 0.44, sx * 0.25, 0.35);
        ant(0.14, 0.03, sx * 0.30, 1.95, 0.40, -sx * 0.9, 0);
      }
      // the valve and a seam
      cyl(0.02, 0.02, 0.04, 6, 0xf2ece0, 0.33, 0.78, -0.2, 0, H);
      // the luggage tag on a string from the neck (on the character's right, toward the reindeer man's side)
      bb(-0.152, 1.02, 0.45, -0.148, 1.14, 0.455, 0xe8e4dc);
      tq(0.24, 0.12, A_TAG, -0.20, 0.98, 0.50, -PI / 4 - H * 0.5, 0, M.atlas);
    }, null, 0, { floor: false });
  }

  // ---------------------------------------------------------- passenger dummies (seated: IM bodies, heads, chip lights)
  const PAXN = 30;
  const PAX_BASE = ['A1Lfw', 'A1Lba', 'A1Rfa', 'A1Rbw', 'A2Lfa', 'A2Lbw', 'A2Rfw', 'A2Rba', 'A3Lfw', 'A3Lba', 'A3Rfa', 'A3Rbw', 'A4Lfa', 'A4Lbw', 'A4Rfw', 'A4Rba',
    'B1Rfw', 'B1Rfa', 'B1Rbw', 'B1Rba'];
  const PAX_SEATS = {
    inspect27: PAX_BASE.concat(['B2Lfw', 'B2Lfa', 'B3Rfw', 'B3Rbw', 'B3Rba', 'B4Lfa', 'B4Lba', 'B4Rfw', 'B4Rfa', 'B4Rba']),
    board27: PAX_BASE.concat(['A1Lbw', 'A2Lfw', 'B3Rfw', 'B3Rbw', 'B3Rba', 'B4Lfa', 'B4Lba', 'B4Rfw', 'B4Rfa', 'B4Rba']),   // B2 L front kept clear: the platform shots
    talk27: PAX_BASE.concat(['B2Lfw', 'B2Lfa', 'B2Lbw', 'B2Lba', 'B3Rfw', 'B3Rbw', 'B3Rba', 'B3Rfa', 'B3Lba', 'B4Rfw']),
  };
  PAX_SEATS.run27 = PAX_SEATS.board27; PAX_SEATS.valley27 = PAX_SEATS.talk27;
  const PAX_BODY = ['#2a3550', '#4a4f58', '#5a4636', '#3e5a52', '#6a3a3e', '#8a8a86', '#2e2e34', '#46627a', '#7a6a52', '#5a6a3e', '#a8a49a', '#3a4a6a'];
  const PAX_SKIN = ['#e8c0a0', '#c89070', '#a87050', '#7a4e34', '#f0cfb0', '#d8a080'];
  const PAX = { seats: [], base: [], head: [], chipK: new Float32Array(PAXN), flash: new Float32Array(PAXN), nodI: [-1, -1], nodT: [0, 0], nodNext: 2.5, chipT: 0, s: new Float32Array(PAXN) };
  for (let i = 0; i < PAXN; i++) { PAX.seats.push(''); PAX.base.push([0, 0, 0, 0]); }
  function paxBodyGeo() {
    return geoOf(() => {
      const W = 0xffffff, TR = 0x8c8c8c, SH = 0x303030, HAND = 0xe6e6e6;
      for (const sx of [-1, 1]) {
        bb(sx * 0.145 - 0.06, 0, 0.36, sx * 0.145 + 0.06, 0.07, 0.56, SH);           // shoes
        bb(sx * 0.10 - 0.055, 0.05, 0.36, sx * 0.10 + 0.055, 0.47, 0.48, TR);         // shins
        bb(sx * 0.10 - 0.065, 0.43, -0.06, sx * 0.10 + 0.065, 0.57, 0.46, TR);         // thighs
        bb(sx * 0.215 - 0.05, 0.66, -0.10, sx * 0.215 + 0.05, 1.00, 0.02, W);          // upper arms
        bb(sx * 0.17 - 0.045, 0.58, -0.04, sx * 0.17 + 0.045, 0.67, 0.24, W);          // forearms on the thighs
        bb(sx * 0.12 - 0.04, 0.575, 0.22, sx * 0.12 + 0.04, 0.635, 0.31, HAND);        // hands
      }
      bb(-0.18, 0.52, -0.16, 0.18, 1.0, 0.08, W);                                       // torso (coat)
      bb(-0.22, 0.92, -0.14, 0.22, 1.04, 0.06, W);                                      // shoulders
      bb(-0.19, 0.52, -0.02, 0.19, 0.64, 0.12, W);                                      // coat lap
      bb(-0.05, 0.62, 0.075, 0.05, 1.0, 0.085, 0xb8b8b8);                              // zip line
    });
  }
  function paxHeadGeo() {   // origin at the neck pivot
    return geoOf(() => {
      const SK = 0xffffff, HR = 0x5a4e46;
      bb(-0.045, -0.06, -0.06, 0.045, 0.06, 0.03, SK);                                  // neck
      bb(-0.09, 0.04, -0.11, 0.09, 0.26, 0.09, SK);                                     // head
      bb(-0.10, 0.20, -0.12, 0.10, 0.29, 0.07, HR);                                     // hair cap
      bb(-0.10, 0.13, -0.125, 0.10, 0.24, -0.06, HR);                                   // back of the hair
      for (const sx of [-1, 1]) bb(sx * 0.04 - 0.012, 0.155, 0.09, sx * 0.04 + 0.012, 0.172, 0.096, 0x202020);   // eyes
      bb(-0.016, 0.10, 0.09, 0.016, 0.135, 0.11, 0xe0e0e0);                            // nose
    });
  }
  function paxChipGeo() { const g = new THREE.BoxGeometry(0.028, 0.028, 0.028); g.translate(-0.096, 0.13, -0.045); return g; }
  // write instance i's body / head / chip matrices from PAX.base[i] (+ a nod angle on the head)
  function paxWrite(i, nod) {
    const p = PAX.base[i], sc = PAX.s[i];
    const on = !!PAX.seats[i];
    if (!on) { m4.makeScale(0, 0, 0).setPosition(0, -50, 0); R.paxBody.setMatrixAt(i, m4); R.paxHead.setMatrixAt(i, m4); R.paxChip.setMatrixAt(i, m4); return; }
    m4.compose(v1.set(p[0], 0, p[2]), q1.setFromAxisAngle(s1.set(0, 1, 0), p[3]), s1.set(sc, sc, sc));
    if (nod == null) R.paxBody.setMatrixAt(i, m4);
    e1.set(nod || 0, p[3], 0, 'YXZ'); q1.setFromEuler(e1);
    // the head pivot sits 1.06 up, slightly back: (0, 1.06, -0.04) in the body's frame
    v1.set(-Math.sin(p[3]) * 0.04 * sc + p[0], 1.06 * sc, -Math.cos(p[3]) * 0.04 * sc + p[2]);
    m4.compose(v1, q1, s1.set(sc, sc, sc));
    R.paxHead.setMatrixAt(i, m4); R.paxChip.setMatrixAt(i, m4);
  }
  function paxPopulate(st) {
    const list = PAX_SEATS[st] || PAX_SEATS.board27;
    for (let i = 0; i < PAXN; i++) {
      const n = list[i] || '';
      PAX.seats[i] = n;
      if (n) seatOfName(n, PAX.base[i]);
      PAX.flash[i] = 0;
      paxWrite(i, null);
    }
    PAX.nodI[0] = PAX.nodI[1] = -1;
    R.paxBody.instanceMatrix.needsUpdate = R.paxHead.instanceMatrix.needsUpdate = R.paxChip.instanceMatrix.needsUpdate = true;
  }

  // standing dummies on the platform (body + head IMs, local to the platform group)
  function standGeo() {
    return geoOf(() => {
      const W = 0xffffff, TR = 0x8a8a8a, SH = 0x303030;
      for (const sx of [-1, 1]) {
        bb(sx * 0.1 - 0.06, 0, -0.06, sx * 0.1 + 0.06, 0.07, 0.14, SH);
        bb(sx * 0.1 - 0.065, 0.06, -0.06, sx * 0.1 + 0.065, 0.86, 0.07, TR);
        bb(sx * 0.225 - 0.05, 0.92, -0.06, sx * 0.225 + 0.05, 1.46, 0.05, W);
      }
      bb(-0.19, 0.82, -0.12, 0.19, 1.46, 0.10, W);
      bb(-0.22, 1.36, -0.11, 0.22, 1.50, 0.08, W);
    });
  }
  function standHeadGeo() {
    return geoOf(() => {
      bb(-0.045, 0.0, -0.05, 0.045, 0.08, 0.04, 0xffffff);
      bb(-0.09, 0.06, -0.10, 0.09, 0.28, 0.09, 0xffffff);
      bb(-0.10, 0.21, -0.11, 0.10, 0.31, 0.07, 0x3a3a3a); bb(-0.10, 0.09, -0.115, 0.10, 0.24, -0.05, 0x3a3a3a);
    });
  }

  // ---------------------------------------------------------- the platform group (slides in, stops at the doors)
  const STAND = [[-3.2, -3.8, 1.35], [-3.6, -1.2, 1.7], [-2.9, 1.4, 1.5], [-4.1, 3.0, 1.9], [-3.3, 5.6, 1.4], [-3.0, 7.8, 1.6], [-4.4, -5.6, 1.2], [-3.8, 8.6, 1.75]];
  function platform() {
    const G = new THREE.Group(); G.name = 'platform';
    const g = part('platform_static', () => {
      tint = PLAT;
      // deck, coping, tactile strip, the platform wall face, ramps
      bb(-7.0, GY, -50, -1.65, 0, 50, CONC);
      bb(-1.85, 0.0, -50, -1.65, 0.006, 50, 0xb8b8b0);
      bb(-2.25, 0.0, -50, -1.85, 0.008, 50, TACT);
      for (let z = -49.5; z < 50; z += 0.6) bb(-2.22, 0.008, z, -1.88, 0.012, z + 0.3, 0xd8d8d0);
      for (const s of [-1, 1]) { const g2 = new THREE.BoxGeometry(5.35, 0.04, 9.2); g2.rotateX(s * 0.125); g2.translate(-4.325, -0.58, s * 54.55); put(g2, CONC); }
      // canopy: roof slab, fascia, underside light strips, columns
      bb(-6.5, 3.30, -30, -2.4, 3.45, 30, CANOPY);
      { const g = new THREE.PlaneGeometry(4.1, 60, 1, 4); g.rotateX(H); g.translate(-4.45, 3.295, 0); put(g, 0xffffff, M.soffit); }
      bb(-2.46, 3.05, -30, -2.40, 3.48, 30, 0xdfe3e6); bb(-6.56, 3.05, -30, -6.5, 3.48, 30, 0xb0b4b8);
      bb(-3.3, 3.27, -29, -3.1, 3.30, 29, 0xffffff, M.glow); bb(-5.5, 3.27, -29, -5.3, 3.30, 29, 0xffffff, M.glow);
      for (let k = 0; k < 8; k++) { const z = -26.25 + k * 7.5; bb(-6.32, 0, z - 0.12, -6.08, 3.30, z + 0.12, 0xb8bcc0); bb(-6.36, 0, z - 0.16, -6.04, 0.12, z + 0.16, 0x8a8e92); }
      // nameboards (blank: AR only) hung from the canopy, facing +X (and a blank back)
      for (const z of [-12, 12]) {
        bb(-4.08, 2.08, z - 1.86, -3.96, 2.72, z + 1.86, 0x1c2430);
        tq(3.6, 0.6, A_NAME, -3.955, 2.4, z, H); tq(3.6, 0.6, A_NAME, -4.085, 2.4, z, -H);
        for (const dz of [-1.4, 1.4]) bb(-4.03, 2.72, z + dz - 0.02, -4.01, 3.30, z + dz + 0.02, STEEL);
      }
      // padded benches (cream foam over a frame), a padded bin, lamps, a padded help point
      for (const z of [-17, -6, 5.5, 16]) {
        bb(-5.85, 0, z - 0.85, -5.75, 0.42, z - 0.75, 0x6a7078); bb(-5.85, 0, z + 0.75, -5.75, 0.42, z + 0.85, 0x6a7078);
        bb(-5.95, 0.40, z - 0.95, -5.30, 0.52, z + 0.95, PADC); bb(-6.02, 0.50, z - 0.95, -5.90, 0.98, z + 0.95, PADC);
        for (let k = -2; k <= 2; k++) bb(-5.96, 0.52, z + k * 0.38 - 0.005, -5.29, 0.525, z + k * 0.38 + 0.005, 0xc8bea8);
      }
      cyl(0.26, 0.26, 0.9, 10, PADC, -5.0, 0.45, 4); cyl(0.27, 0.27, 0.06, 10, 0x6a7078, -5.0, 0.93, 4);
      for (const z of [-46, -40, -34, 34, 40, 46]) {
        cyl(0.05, 0.07, 4.2, 6, 0x5a6068, -6.6, 2.1, z); bb(-6.6, 4.1, z - 0.06, -5.9, 4.18, z + 0.06, 0x5a6068);
        bb(-6.0, 4.02, z - 0.12, -5.6, 4.10, z + 0.12, 0xffffff, M.glow);
      }
      bb(-6.0, 0, -22.4, -5.4, 1.5, -21.8, PADC); bb(-5.42, 0.9, -22.3, -5.40, 1.35, -21.9, 0xffffff, M.glow);
      // back fence (palisade), the station building beyond, a few trees
      bb(-7.48, 0, -50, -7.40, 0.08, 50, 0x3c4a44); bb(-7.48, 1.45, -50, -7.40, 1.53, 50, 0x3c4a44);
      for (let z = -50; z <= 50; z += 0.45) bb(-7.46, 0, z, -7.42, 1.6, z + 0.06, 0x3c4a44);
      bb(-12.0, GY, -16, -8.5, 3.6, 16, 0x8a5a48); bb(-12.3, 3.6, -16.5, -8.2, 3.9, 16.5, 0x6a6e72);
      for (let k = 0; k < 4; k++) tq(7.5, 1.9, A_BLDG, -8.49, 1.8, -12 + k * 8, H);
      tint = OUT;
      for (const [x, z, h] of [[-14, -30, 6], [-15, 24, 7.5], [-13, 34, 5.5], [-16, -40, 7]]) { cyl(0.18, 0.28, h * 0.5, 6, 0x6a6058, x, GY + h * 0.25, z); ico(h * 0.36, GUM, x, GY + h * 0.72, z, 0.8); }
      tint = IN;
    }, null, 0, { floor: false });
    G.add(g);
    // AR anchors on the nameboards
    for (const [n, z] of [['nameboard_a', -12], ['nameboard_b', 12]]) { const o = new THREE.Object3D(); o.name = n; o.position.set(-3.9, 2.75, z); G.add(o); }
    // waiting passengers (8 standing; dress shows 8 or 5)
    const bodyG = standGeo(), headG = standHeadGeo();
    const list = STAND.map(([x, z, ry], i) => [x, 0, z, ry, 0.94 + 0.12 * ((i * 37) % 10) / 10]);
    R.standBody = IM(bodyG, M.vc, list, 'plat_dummies', G);
    R.standHead = IM(headG, M.vc, list.map((t) => [t[0], 1.47 * t[4], t[2], t[3], t[4]]), 'plat_heads', G);
    for (let i = 0; i < list.length; i++) {
      R.standBody.setColorAt(i, c1.set(PAX_BODY[(i * 5 + 3) % PAX_BODY.length]));
      R.standHead.setColorAt(i, c1.set(PAX_SKIN[(i * 3 + 1) % PAX_SKIN.length]));
    }
    R.standList = list;
    G.userData.label = 'SANDGATE';
    G.userData.name = (label) => {
      G.userData.label = label || '';
      if (typeof AR !== 'undefined' && AR.get) for (const id of ['ar_nameboard_a', 'ar_nameboard_b']) if (AR.get(id)) AR.set(id, { text: G.userData.label });
    };
    G.userData.dummies = (n) => {
      for (let i = 0; i < list.length; i++) {
        const t = list[i], sc = i < n ? t[4] : 0;
        m4.compose(v1.set(t[0], 0, t[2]), q1.setFromAxisAngle(s1.set(0, 1, 0), t[3]), s1.set(sc, sc, sc)); R.standBody.setMatrixAt(i, m4);
        m4.compose(v1.set(t[0], 1.47 * t[4], t[2]), q1, s1.set(sc, sc, sc)); R.standHead.setMatrixAt(i, m4);
      }
      R.standBody.instanceMatrix.needsUpdate = R.standHead.instanceMatrix.needsUpdate = true;
    };
    return G;
  }

  // ---------------------------------------------------------- outside: the treadmill and the far sky
  // emit a copy of every periodic suburbs item at z, z + 480 and z - 480 while it lands in the covered range
  const PER = (z, len = 0) => { const out = []; for (const dz of [0, SUB_T, -SUB_T]) { if (z + dz + len >= ZMIN && z + dz - len < ZMAX) out.push(z + dz); } return out; };
  function scenery() {
    const S = new THREE.Group(); S.name = 'scenery';
    tint = OUT;
    // ---- static outside: ground, gravel shoulders, overhead wires, power lines (uniform along z: they never move)
    const st = part('outside_static', () => {
      tint = OUT;
      { const g = new THREE.PlaneGeometry(900, 900, 28, 28); g.rotateX(-H); g.translate(0, GY - 0.06, 0); put(g, 0x4a5a46); }
      bb(-7.6, GY - 0.05, -320, -2.4, GY - 0.01, 320, GRAVEL); bb(6.4, GY - 0.05, -320, 10.6, GY - 0.01, 320, GRAVEL);
      for (const [x, y] of [[0, 4.35], [4.2, 4.35], [0, 5.25], [4.2, 5.25]]) bb(x - 0.012, y, -300, x + 0.012, y + 0.024, 300, 0x2a2c2e);
      for (const y of [6.3, 6.55, 6.8]) bb(11.6 - 0.012, y, -300, 11.6 + 0.012, y + 0.02, 300, 0x26282a);
    }, null, 0, { floor: false });
    S.add(st);
    // ---- track bed: UV-scrolled ballast, sleepers, rails (our track x 0, the second x 4.2)
    {
      const g = new THREE.PlaneGeometry(8.8, 340, 1, 14); g.rotateX(-H); g.translate(2.0, GY, 0);
      const p = g.attributes.position, uv = g.attributes.uv;
      for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + 2.1) / 4.2, p.getZ(i) / 2.4);
      bakeLight(g); tc.set(0xffffff); const col = g.attributes.color; for (let i = 0; i < col.count; i++) col.setXYZ(i, col.getX(i) * OUT[0], col.getY(i) * OUT[1], col.getZ(i) * OUT[2]);
      const m = new THREE.Mesh(g, M.track); m.name = 'track_bed'; S.add(m); R.track = m;
    }
    // ---- masts (period 60): a steel pole and a cantilever arm over the track; west x -2.6 (arm +X), east x 6.8 (arm -X)
    const mastG = geoOf(() => {
      tint = OUT;
      bb(-0.14, 0, -0.12, 0.14, 6.6, 0.12, 0x7a8288); bb(-0.2, 0, -0.2, 0.2, 0.25, 0.2, 0x8a8a84);
      bb(0, 5.9, -0.05, 2.95, 6.0, 0.05, 0x6a7278); boxR(0.06, 0.06, 3.1, 0x6a7278, 1.45, 5.45, 0, 0, H, 0.33);
      bb(2.6, 5.15, -0.04, 2.95, 5.22, 0.04, 0x6a7278); cyl(0.05, 0.05, 0.4, 6, 0x8a5a3a, 0.35, 5.95, 0, 0, H);
      bb(2.84, 5.22, -0.02, 2.88, 5.95, 0.02, 0x50565a);
    });
    const ML = [];
    for (let z = -150; z <= 210; z += MAST_T) { ML.push([-2.6, GY, z, 0, 1]); ML.push([6.8, GY, z + 30, PI, 1]); }
    const masts = new THREE.Group(); masts.name = 'masts'; S.add(masts); R.masts = masts;
    IM(mastG, M.vc, ML, 'mast_im', masts);
    // ---- suburbs (period 480)
    const sub = new THREE.Group(); sub.name = 'suburbs'; S.add(sub); R.suburbs = sub;
    suburbs(sub);
    // ---- rain sheets: two vertical quads, the streaks scroll down and with the world
    {
      const pb = b; b = new Builder();
      for (const x of [-8.5, 9.0]) {
        const g = new THREE.PlaneGeometry(400, 30, 16, 1); g.rotateY(x < 0 ? H : -H); g.translate(x, GY + 15, 0);
        const p = g.attributes.position, uv = g.attributes.uv;
        for (let i = 0; i < p.count; i++) uv.setXY(i, p.getZ(i) / 1.6, p.getY(i) / 3.2);
        put(g, 0xffffff, MB.rain);
      }
      const rg = b.done({ floor: false }); b = pb; rg.name = 'rain_sheets'; S.add(rg); R.rain = rg;
      rg.traverse((o) => { if (o.isMesh) o.renderOrder = 2; });
    }
    tint = IN;
    return S;
  }

  function suburbs(sub) {
    tint = OUT;
    seed = 97;
    const LQ = [], LL = [], LF = [], LR = [], RC = [], LT = [], LC = [], CC = [], LP = [];
    const QC = ['#f4f2ec', '#e8f0f4', '#f0ead8', '#e4ecdc', '#f4e8e0', '#dce8ec'], BRC = ['#f0e8e0', '#e8dcd0', '#fff6ec', '#e0d4c8'], FBC = ['#eeeee6', '#e0e8ea', '#f0ece0'];
    const ROOFC = ['#8a4a3e', '#7d8a90', '#5f6e62', '#a35a3c', '#6a7480', '#9aa2a6', '#4e5a66'];
    const TREEC = ['#4c6a4a', '#56744c', '#435e44', '#5e7a52', '#6a6a8a'];
    const skip = (x, z) => (z > 372 && z < 390) || (x > 0 && x < 34 && z > 96 && z < 164) || (x < 0 && z > 196 && z < 324);
    const house = (x, z, ry) => {
      const k = rnd(), sc = 0.92 + rnd() * 0.16;
      let top, rd;
      if (k < 0.45) { for (const zz of PER(z, 8)) LQ.push([x, GY, zz, ry, sc]); top = 4.2 * sc; rd = [10.4, 2.4, 10.4]; }
      else if (k < 0.8) { for (const zz of PER(z, 8)) LL.push([x, GY, zz, ry, sc]); top = 2.7 * sc; rd = [11.0, 1.5, 9.0]; }
      else { for (const zz of PER(z, 8)) LF.push([x, GY, zz, ry, sc]); top = 3.2 * sc; rd = [8.8, 1.6, 7.8]; }
      const rc = ROOFC[(rnd() * ROOFC.length) | 0];
      for (const zz of PER(z, 8)) { LR.push([x, GY + top, zz, ry, [rd[0] * sc, rd[1] * sc, rd[2] * sc]]); RC.push(rc); }
      // a tree or two in the yard
      if (rnd() < 0.8) tree(x + (x > 0 ? -6.5 : 6.5) + rnd() * 2, z + (rnd() - 0.5) * 12, rnd() < 0.2 ? 'jac' : 'gum');
    };
    const tree = (x, z, kind) => {
      const h = kind === 'mang' ? 2 + rnd() * 1.5 : kind === 'jac' ? 6 + rnd() * 2 : 8 + rnd() * 6;
      const cr = kind === 'mang' ? 2.2 + rnd() * 1.6 : kind === 'jac' ? 3.2 + rnd() : 2.4 + rnd() * 1.6;
      const col = kind === 'mang' ? '#2e4434' : kind === 'jac' ? (rnd() < 0.5 ? '#6a6a8a' : '#5e6e5a') : TREEC[(rnd() * 4) | 0];
      for (const zz of PER(z, 6)) {
        LT.push([x, GY, zz, rnd() * PI, [kind === 'gum' ? 1.0 : 1.3, h * (kind === 'mang' ? 0.35 : 0.62), kind === 'gum' ? 1.0 : 1.3]]);
        LC.push([x, GY + h * (kind === 'mang' ? 0.42 : 0.74), zz, rnd() * PI, [cr * (kind === 'mang' ? 1.5 : 1.1), cr * (kind === 'gum' ? 0.95 : kind === 'mang' ? 0.55 : 0.75), cr * (kind === 'mang' ? 1.8 : 1.1)]]);
        CC.push(col);
      }
    };
    // houses: east two rows facing the railway (-X), west two rows (backs to the railway)
    for (let z = 4; z < SUB_T; z += 17 + rnd() * 3) { const zz = z + (rnd() - 0.5) * 3; if (!skip(26, zz)) house(26 + (rnd() - 0.5) * 2, zz, -H); }
    for (let z = 12; z < SUB_T; z += 17 + rnd() * 3) { const zz = z + (rnd() - 0.5) * 3; if (!skip(42, zz)) house(42 + (rnd() - 0.5) * 3, zz, -H); }
    for (let z = 6; z < SUB_T; z += 17 + rnd() * 3) { const zz = z + (rnd() - 0.5) * 3; if (!skip(-20, zz)) house(-20 + (rnd() - 0.5) * 2, zz, -H); }
    for (let z = 15; z < SUB_T; z += 17 + rnd() * 3) { const zz = z + (rnd() - 0.5) * 3; if (!skip(-36, zz)) house(-36 + (rnd() - 0.5) * 3, zz, -H); }
    // street trees, railway reserve gums, the park, the wetland mangroves
    for (let z = 10; z < SUB_T; z += 22 + rnd() * 12) if (!skip(21, z)) tree(21 + rnd(), z, rnd() < 0.35 ? 'jac' : 'gum');
    for (let z = 20; z < SUB_T; z += 26 + rnd() * 20) { if (!skip(-9.5, z)) tree(-10 - rnd() * 2, z, 'gum'); }
    for (let z = 30; z < SUB_T; z += 34 + rnd() * 20) if (!(z > 372 && z < 390)) tree(12.0 - rnd() * 0.6, z, 'gum');
    for (let i = 0; i < 9; i++) tree(24 + rnd() * 18, 102 + rnd() * 56, rnd() < 0.3 ? 'jac' : 'gum');
    for (let i = 0; i < 26; i++) tree(-11 - rnd() * 34, 204 + rnd() * 114, 'mang');
    // power poles every 40 m by the street
    const poleG = geoOf(() => { tint = OUT; cyl(0.12, 0.16, 9.0, 6, 0x6a5a48, 0, 4.5, 0); bb(-0.1, 6.9, -1.0, 0.1, 7.05, 1.0, 0x5a4a3a); for (const dz of [-0.8, 0, 0.8]) cyl(0.04, 0.05, 0.16, 6, 0xd8d8d0, 0, 7.13, dz); });
    for (let z = 0; z < SUB_T; z += 40) for (const zz of PER(z, 2)) LP.push([11.6, GY, zz, H, 1]);
    // the merged static part of the layer: street, footpaths, yards, fences, park, the crossing, the wetland
    const g = part('suburbs_static', () => {
      tint = OUT;
      bb(12.5, GY - 0.03, ZMIN, 19.5, GY + 0.01, ZMAX, BITU);
      bb(11.5, GY - 0.03, ZMIN, 12.5, GY + 0.06, ZMAX, 0x8a8c88); bb(19.5, GY - 0.03, ZMIN, 20.5, GY + 0.06, ZMAX, 0x8a8c88);
      for (let z = ZMIN; z < ZMAX; z += 6) bb(15.95, GY + 0.01, z, 16.05, GY + 0.015, z + 3, 0xd8d8d0);
      // lawns east and west (slightly varied greens), the yard fences between houses
      bb(20.5, GY - 0.04, ZMIN, 52, GY - 0.02, ZMAX, 0x5a7450); bb(-48, GY - 0.04, ZMIN, -10.6, GY - 0.02, ZMAX, 0x52704a);
      for (let z = 0; z < SUB_T; z += 18) for (const zz of PER(z, 1)) {
        if (!skip(26, z)) bb(21.0, GY, zz - 0.03, 34, GY + 1.1, zz + 0.03, 0x8a8478);
        if (!skip(-20, z)) bb(-30, GY, zz - 0.03, -12, GY + 1.6, zz + 0.03, 0x7d8a90);
      }
      // backyard bits west: Hills hoists, padded trampolines, sheds
      for (let z = 9; z < SUB_T; z += 36) for (const zz of PER(z, 4)) {
        if (skip(-20, z)) continue;
        cyl(0.03, 0.03, 2.0, 5, 0x9aa0a4, -14.5, GY + 1.0, zz); for (const a of [0, 1.05, 2.1]) boxR(2.6, 0.03, 0.03, 0x9aa0a4, -14.5, GY + 1.95, zz, 0, a, 0);
        cyl(1.4, 1.4, 0.12, 10, 0x2f6a8a, -15.5, GY + 0.75, zz + 9); cyl(1.5, 1.5, 0.08, 10, 0x4a90b0, -15.5, GY + 0.66, zz + 9);
        bb(-17, GY, zz - 6, -14.6, GY + 2.2, zz - 3.6, 0xb8c0c4);
      }
      // the park (east): open lawn, a path, a padded playground, a picnic shelter
      for (const zz of PER(130, 34)) {
        bb(20.5, GY - 0.02, zz - 34, 48, GY, zz + 34, 0x64804e);
        bb(21, GY, zz - 1, 46, GY + 0.02, zz + 1, 0xb0a890);
        bb(28, GY, zz - 12, 34, GY + 0.04, zz - 4, 0x3a6a9a); bb(29, GY, zz - 11, 33, GY + 2.2, zz - 10.6, PADC); bb(29, GY + 2.0, zz - 11, 33, GY + 2.3, zz - 5, 0xd8504a);
        cyl(0.5, 0.5, 0.25, 8, PADC, 31, GY + 0.12, zz - 7);
        for (const [dx, dz] of [[-1.6, -1.6], [1.6, -1.6], [-1.6, 1.6], [1.6, 1.6]]) bb(38 + dx - 0.06, GY, zz + 12 + dz - 0.06, 38 + dx + 0.06, GY + 2.3, zz + 12 + dz + 0.06, 0x6a5a48);
        bb(35.8, GY + 2.3, zz + 9.8, 40.2, GY + 2.45, zz + 14.2, 0x2f6a5a);
      }
      // the padded level crossing at local z 381
      for (const zz of PER(381, 6)) {
        bb(-60, GY - 0.02, zz - 3.5, 12.5, GY + 0.04, zz + 3.5, BITU);
        for (const x of [-0.53, 0.53, 3.67, 4.73]) bb(x - 0.035, GY + 0.04, zz - 3.5, x + 0.035, GY + 0.06, zz + 3.5, 0xa8b0b6);
        for (const zl of [zz - 3.3, zz + 3.3]) bb(-2.6, GY + 0.04, zl - 0.12, 7.6, GY + 0.045, zl + 0.12, 0xe8e8e0);
        for (const [x, z1, dir] of [[-3.0, zz - 4.2, 1], [7.4, zz + 4.2, -1]]) {
          bb(x - 0.12, GY, z1 - 0.12, x + 0.12, GY + 3.0, z1 + 0.12, 0xe8e8e0);
          bb(x - 0.25, GY + 2.6, z1 - 0.06, x + 0.25, GY + 2.85, z1 + 0.06, 0x222222);
          for (const sx of [-1, 1]) bb(x + sx * 0.16 - 0.07, GY + 2.66, z1 - 0.09, x + sx * 0.16 + 0.07, GY + 2.8, z1 - 0.07, 0xffffff, M.red);
          // the padded boom, down across the road (cream foam with soft red bands)
          bb(x - 0.14, GY + 0.85, z1 - 0.14, x + 0.14, GY + 1.25, z1 + 0.14, 0xb8bcc0);
          const zA = z1 + dir * 0.2, zB = z1 + dir * 7.6;
          bb(x - 0.11, GY + 0.95, Math.min(zA, zB), x + 0.11, GY + 1.17, Math.max(zA, zB), PADC);
          for (let k = 1; k < 7; k += 2) bb(x - 0.115, GY + 0.95, Math.min(zA + dir * k, zA + dir * (k + 0.9)), x + 0.115, GY + 1.17, Math.max(zA + dir * k, zA + dir * (k + 0.9)), 0xd06058);
        }
      }
      // the wetland (west, 120 m): dark water channels, mud, reeds, a heron
      for (const zz of PER(260, 64)) {
        bb(-48, GY - 0.03, zz - 62, -10.6, GY - 0.015, zz + 62, 0x4a5444);
        for (const [x0, x1, zc, len, a] of [[-14, -44, -40, 50, 0.3], [-12, -46, 10, 70, -0.25], [-20, -40, 45, 30, 0.15]]) {
          const gg = new THREE.PlaneGeometry(len, 3.2 + rnd() * 2, Math.ceil(len / 25), 1); gg.rotateX(-H); gg.rotateY(a); gg.translate((x0 + x1) / 2, GY - 0.005, zz + zc); put(gg, WET);
          const g2 = new THREE.PlaneGeometry(len * 0.8, 0.4, Math.ceil(len / 25), 1); g2.rotateX(-H); g2.rotateY(a); g2.translate((x0 + x1) / 2, GY - 0.002, zz + zc + 0.6); put(g2, 0x5a7068);
        }
        for (let i = 0; i < 30; i++) { const x = -12 - rnd() * 34, z = zz - 58 + rnd() * 116; boxR(0.05, 0.9 + rnd() * 0.5, 0.05, 0x7a7a52, x, GY + 0.4, z, 0, rnd() * PI, (rnd() - 0.5) * 0.4); }
        const hx = -24, hz = zz + 8;
        for (const sx of [-1, 1]) bb(hx + sx * 0.05 - 0.01, GY, hz - 0.01, hx + sx * 0.05 + 0.01, GY + 0.45, hz + 0.01, 0x3a3a34);
        sph(0.14, 0xe8eae6, hx, GY + 0.6, hz, 0.8, 0.9, 1.6, 8, 5); boxR(0.04, 0.42, 0.04, 0xe8eae6, hx, GY + 0.86, hz + 0.18, 0.5, 0, 0);
        sph(0.06, 0xe8eae6, hx, GY + 1.06, hz + 0.3, 1, 1, 1.4, 6, 4); boxR(0.02, 0.02, 0.16, 0xc8a040, hx, GY + 1.05, hz + 0.44, 0.1, 0, 0);
      }
      // a bus shelter and two parked hover-scooters on the street
      for (const zz of PER(60, 3)) { bb(20.6, GY, zz - 1.6, 21.6, GY + 2.4, zz + 1.6, 0x9aa4ac); bb(20.4, GY + 2.4, zz - 1.8, 21.8, GY + 2.5, zz + 1.8, 0x5a6470); }
    }, null, 0, { floor: false });
    sub.add(g);
    // fences: the noise wall west (low wire fence along the wetland), chain-link east; gaps at the crossing
    {
      const pb = b; b = new Builder();
      const fenceRun = (x, z0, z1, top, ry) => {
        if (z1 - z0 < 0.5) return;
        if (z1 - z0 > 30) { const n = Math.ceil((z1 - z0) / 30), d = (z1 - z0) / n; for (let i = 0; i < n; i++) fenceRun(x, z0 + i * d, z0 + (i + 1) * d, top, ry); return; }
        const gg = new THREE.PlaneGeometry(z1 - z0, 1.8); gg.rotateY(ry); gg.translate(x, GY + 0.9, (z0 + z1) / 2);
        const p = gg.attributes.position, uv = gg.attributes.uv;
        for (let i = 0; i < p.count; i++) uv.setXY(i, p.getZ(i) / 3.0, (top ? 0.5 : 0) + ((p.getY(i) - GY) / 1.8) * 0.5);
        put(gg, 0xffffff, M.fence);
      };
      const runs = (x, top, gaps) => { let z = ZMIN; for (const [a, c] of gaps) { fenceRun(x, z, a, top, x < 0 ? H : -H); z = c; } fenceRun(x, z, ZMAX, top, x < 0 ? H : -H); };
      const xg = [[381 - 4.4 - SUB_T, 381 + 4.4 - SUB_T], [381 - 4.4, 381 + 4.4]];
      // west: noise wall, but chain-link along the wetland
      const wet = [[200 - SUB_T, 320 - SUB_T], [200, 320]];
      runs(-7.5, true, [xg[0], wet[0], xg[1], wet[1]].sort((p, q) => p[0] - q[0]));
      for (const [a, c] of wet) fenceRun(-7.5, Math.max(ZMIN, a), Math.min(ZMAX, c), false, H);
      runs(10.5, false, xg);
      const fg = b.done({ floor: false }); b = pb; fg.name = 'fences'; sub.add(fg);
    }
    // the instanced repeats
    const wallM = M.house;
    const qldG = geoOf(() => {
      tint = OUT;
      const w = 9, d = 9, y0 = 1.4, y1 = 4.2;
      const bx = (x0, ya, z0, x1, yb, z1, cell, hex = 0xffffff) => { const gg = new THREE.BoxGeometry(x1 - x0, yb - ya, z1 - z0); gg.translate((x0 + x1) / 2, (ya + yb) / 2, (z0 + z1) / 2); uvRect(gg, cell, 256, 128); put(gg, hex, wallM); };
      bx(-w / 2, y0, -d / 2, w / 2, y1, d / 2, H_WB);
      bx(-w / 2 + 0.2, 0.15, -d / 2 + 0.2, w / 2 - 0.2, y0, d / 2 - 0.2, H_LAT);
      for (const x of [-4.1, 4.1]) for (const z of [-4.1, 0, 4.1]) bx(x - 0.1, 0, z - 0.1, x + 0.1, y0, z + 0.1, H_WHITE, 0x5a5a56);
      // the verandah across the front (+Z), posts, a white rail, front stairs
      bx(-w / 2, y0 - 0.1, d / 2, w / 2, y0, d / 2 + 2.4, H_WHITE, 0x8a7a68);
      for (const x of [-4.4, -1.5, 1.5, 4.4]) bx(x - 0.07, y0, d / 2 + 2.25, x + 0.07, y1, d / 2 + 2.39, H_WHITE, 0xf4f4f0);
      bx(-w / 2, y0 + 0.85, d / 2 + 2.3, w / 2, y0 + 0.95, d / 2 + 2.4, H_WHITE, 0xf4f4f0);
      bx(-w / 2, y0 + 0.05, d / 2 + 2.32, w / 2, y0 + 0.85, d / 2 + 2.38, H_LAT, 0xf0f0ea);   // the balustrade (lattice)
      bx(-w / 2 - 0.2, y1, d / 2 - 0.2, w / 2 + 0.2, y1 + 0.12, d / 2 + 2.6, H_WHITE, 0x8a9096);
      bx(-0.7, 0, d / 2 + 2.4, 0.7, y0 - 0.1, d / 2 + 4.2, H_WHITE, 0x7a6a58);
      bx(-0.5, y0, d / 2 - 0.02, 0.5, y0 + 2.1, d / 2 + 0.02, H_DOOR);
    });
    const lowG = geoOf(() => {
      tint = OUT;
      const bx = (x0, ya, z0, x1, yb, z1, cell, hex = 0xffffff) => { const gg = new THREE.BoxGeometry(x1 - x0, yb - ya, z1 - z0); gg.translate((x0 + x1) / 2, (ya + yb) / 2, (z0 + z1) / 2); uvRect(gg, cell, 256, 128); put(gg, hex, wallM); };
      bx(-5, 0, -4, 5, 2.7, 4, H_BR);
      bx(-5.2, 2.3, 4, -1.6, 2.45, 9, H_WHITE, 0x9aa2a6);   // carport roof on posts
      bx(-5.0, 0, 4.2, -1.8, 0.05, 8.8, H_WHITE, 0x8a8a84);
      for (const [x, z] of [[-5.1, 8.9], [-1.7, 8.9]]) bx(x - 0.06, 0, z - 0.06, x + 0.06, 2.3, z + 0.06, H_WHITE, 0xe8e8e4);
      bx(0.8, 0, 3.98, 1.8, 2.1, 4.02, H_DOOR);
    });
    const fibG = geoOf(() => {
      tint = OUT;
      const bx = (x0, ya, z0, x1, yb, z1, cell, hex = 0xffffff) => { const gg = new THREE.BoxGeometry(x1 - x0, yb - ya, z1 - z0); gg.translate((x0 + x1) / 2, (ya + yb) / 2, (z0 + z1) / 2); uvRect(gg, cell, 256, 128); put(gg, hex, wallM); };
      bx(-4, 0.6, -3.5, 4, 3.2, 3.5, H_FIB);
      for (const x of [-3.6, 0, 3.6]) for (const z of [-3.2, 3.2]) bx(x - 0.1, 0, z - 0.1, x + 0.1, 0.6, z + 0.1, H_WHITE, 0x5a5a56);
      bx(-4.5, 0, 5, -1.5, 2.4, 9, H_CB);   // a Colorbond shed
      bx(-0.5, 0.6, 3.48, 0.5, 2.6, 3.52, H_DOOR);
      bx(-0.7, 0, 3.5, 0.7, 0.6, 4.6, H_WHITE, 0x7a7a72);
    });
    const roofG = (() => { const gg = new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1); gg.rotateY(PI / 4); gg.translate(0, 0.5, 0); return gg; })();
    const trunkG = (() => { const gg = new THREE.CylinderGeometry(0.1, 0.16, 1, 5); gg.translate(0, 0.5, 0); return gg; })();
    const canopyG = new THREE.IcosahedronGeometry(1, 0);
    const tintGeo = (gg) => { gg = gg.index ? gg.toNonIndexed() : gg; gg.computeVertexNormals(); gg.computeBoundingBox(); bakeLight(gg, { y0: gg.boundingBox.min.y }); const col = gg.attributes.color; for (let i = 0; i < col.count; i++) col.setXYZ(i, col.getX(i) * OUT[0], col.getY(i) * OUT[1], col.getZ(i) * OUT[2]); return gg; };
    const imQ = IM(qldG, wallM, LQ, 'houses_qld', sub), imL = IM(lowG, wallM, LL, 'houses_low', sub), imF = IM(fibG, wallM, LF, 'houses_fibro', sub);
    LQ.forEach((t, i) => imQ.setColorAt(i, c1.set(QC[(i * 7) % QC.length])));
    LL.forEach((t, i) => imL.setColorAt(i, c1.set(BRC[(i * 5) % BRC.length])));
    LF.forEach((t, i) => imF.setColorAt(i, c1.set(FBC[(i * 3) % FBC.length])));
    const imR = IM(tintGeo(roofG), M.vc, LR, 'roofs', sub); RC.forEach((c, i) => imR.setColorAt(i, c1.set(c)));
    const imT = IM(tintGeo(trunkG), M.vc, LT, 'trunks', sub); LT.forEach((t, i) => imT.setColorAt(i, c1.set(i % 3 ? '#cfc8bc' : '#8a7a68')));
    const imC = IM(tintGeo(canopyG), M.vc, LC, 'canopies', sub); CC.forEach((c, i) => imC.setColorAt(i, c1.set(c)));
    IM(poleG, M.vc, LP, 'power_poles', sub);
    // street hover-cars (3; their own motion on top of the treadmill)
    const carG = geoOf(() => {
      tint = OUT;
      bb(-0.86, 0.38, -2.05, 0.86, 0.86, 2.05, 0xffffff); bb(-0.78, 0.86, -1.2, 0.78, 1.32, 0.9, 0xffffff);
      bb(-0.8, 0.9, -1.1, 0.8, 1.24, 0.8, 0x2a3440); bb(-0.7, 0.30, -1.8, 0.7, 0.38, 1.8, 0x3a3e44);
      for (const sx of [-1, 1]) { bb(sx * 0.6 - 0.18, 0.55, 2.04, sx * 0.6 + 0.18, 0.64, 2.07, 0xfff4d0); bb(sx * 0.6 - 0.16, 0.56, -2.07, sx * 0.6 + 0.16, 0.64, -2.04, 0xff4030); }
      bb(-0.72, 0.22, -1.7, 0.72, 0.26, 1.7, 0x9fd8ff);
    });
    R.cars = dyn(IM(carG, M.vc, [[15, GY, 0, 0, 1], [15, GY, 100, 0, 1], [17.6, GY, 50, PI, 1]], 'street_cars', sub));
    ['#c84a3a', '#e8ecee', '#2f8a8a'].forEach((c, i) => R.cars.setColorAt(i, c1.set(c)));
    tint = IN;
  }

  // the far sky: dome, horizon band, cloud rings, the sky-flash shell (static; fog: false)
  function far() {
    const F = new THREE.Group(); F.name = 'far';
    const dome = new THREE.Mesh(new THREE.SphereGeometry(420, 24, 12), MB.dome); dome.name = 'dome'; dome.renderOrder = -3; F.add(dome);
    // the band: hills everywhere, the CBD ahead (+Z, +-24 deg), the bay east (+X, +-35 deg)
    {
      const N = 96, rad = 300, y0 = GY - 8, y1 = GY + 40, pos = [], uv = [];
      const rowOf = (a) => { const fz = Math.cos(a), fx = Math.sin(a); if (fz > Math.cos(0.42)) return 1; if (fx > Math.cos(0.6)) return 2; return 0; };
      const vr = [[1 - 48 / 128, 1], [1 - 96 / 128, 1 - 48 / 128], [0, 1 - 96 / 128]];
      for (let i = 0; i < N; i++) {
        const a0 = (i / N) * PI * 2, a1 = ((i + 1) / N) * PI * 2, row = rowOf((a0 + a1) / 2), [vb, vt] = vr[row];
        const u0 = row === 1 ? ((a0 + 0.42) / 0.84) : (i / N) * 4, u1 = row === 1 ? ((a1 + 0.42) / 0.84) : ((i + 1) / N) * 4;
        const A = (a) => { let x = a; if (row === 1 && x > PI) x -= PI * 2; return x; };
        const ua = row === 1 ? (A(a0) + 0.42) / 0.84 : u0, ub = row === 1 ? (A(a1) + 0.42) / 0.84 : u1;
        const p0 = [Math.sin(a0) * rad, Math.cos(a0) * rad], p1 = [Math.sin(a1) * rad, Math.cos(a1) * rad];
        const yl = row === 2 ? GY - 2 : y0, yh = row === 2 ? GY + 7 : y1;
        pos.push(p0[0], yl, p0[1], p1[0], yl, p1[1], p1[0], yh, p1[1], p0[0], yl, p0[1], p1[0], yh, p1[1], p0[0], yh, p0[1]);
        uv.push(ua, vb, ub, vb, ub, vt, ua, vb, ub, vt, ua, vt);
      }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      const band = new THREE.Mesh(g, MB.band); band.material.side = DS; band.name = 'band'; band.renderOrder = -2; F.add(band);
    }
    // cloud rings (one mesh: two radii, different UV repeats); the texture drifts
    {
      const pb = b; b = new Builder();
      for (const [rad, y0, h, rep, off] of [[250, 34, 60, 5, 0], [190, 22, 42, 3, 0.37]]) {
        const gg = new THREE.CylinderGeometry(rad, rad, h, 40, 1, true); gg.translate(0, y0 + h / 2, 0);
        const uv = gg.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * rep + off);
        b.add(gg, MB.cloud);
      }
      const cg = b.done({ floor: false }); b = pb; cg.name = 'clouds'; cg.traverse((o) => { if (o.isMesh) o.renderOrder = -1; }); F.add(cg);
    }
    const flash = new THREE.Mesh(new THREE.SphereGeometry(400, 16, 8), MB.flash); flash.name = 'flash'; flash.visible = false; flash.renderOrder = -1; F.add(flash);
    R.flashM = flash;
    return F;
  }

  // ---------------------------------------------------------- build
  function build() {
    COL.length = 0; T = textures(); materials();
    const root = new THREE.Group(); R.root = root;
    b = new Builder(); XF = null; tint = IN;
    shell(); seats();
    root.add(b.done());
    const P = (g) => (root.add(g), g);
    R.pids = P(pids());
    R.tea = P(teaPoint());
    R.doorsL = P(doorLeaves(-1)); R.doorsR = P(doorLeaves(1));
    R.lamps = P(doorLamps());
    // LEDs: the strips are part of the static mesh (M.led); this named handle carries the API
    R.leds = P(new THREE.Object3D()); R.leds.name = 'leds';
    // the reindeer: root (position + yaw) > pivot (roll, squash) > model
    R.rd = new THREE.Group(); R.rd.name = 'reindeer'; R.rdPivot = new THREE.Group(); R.rdPivot.name = 'rdeer_pivot';
    R.rdPivot.add(reindeerModel()); R.rd.add(R.rdPivot); P(R.rd);
    // seated passengers
    const pax = new THREE.Group(); pax.name = 'pax'; P(pax); R.pax = pax;
    R.paxBody = dyn(IM(paxBodyGeo(), M.vc, new Array(PAXN).fill(0).map(() => [0, -50, 0, 0, 0]), 'pax_bodies', pax));
    R.paxHead = dyn(IM(paxHeadGeo(), M.vc, new Array(PAXN).fill(0).map(() => [0, -50, 0, 0, 0]), 'pax_heads', pax));
    R.paxChip = dyn(IM(paxChipGeo(), MB.chip, new Array(PAXN).fill(0).map(() => [0, -50, 0, 0, 0]), 'pax_chips', pax));
    seed = 61;
    for (let i = 0; i < PAXN; i++) {
      R.paxBody.setColorAt(i, c1.set(PAX_BODY[(i * 7 + 2) % PAX_BODY.length]));
      R.paxHead.setColorAt(i, c1.set(PAX_SKIN[(i * 5 + 1) % PAX_SKIN.length]));
      PAX.chipK[i] = rnd() * 6.28; PAX.s[i] = 0.93 + rnd() * 0.12;
      R.paxChip.setColorAt(i, c1.set(0xbfe6ff));
    }
    // the platform, the treadmill, the far sky
    R.plat = P(platform());
    R.scenery = P(scenery());
    R.far = P(far());
    // colliders (spec §7.2)
    COL.push([-XO, -ZE, -XI, ZE], [XI, -ZE, XO, ZE], [-XO, -ZE - 0.15, XO, -ZE], [-XO, ZE, XO, ZE + 0.15]);
    for (const k of BAY_IDS) { const z0 = BAYS[k], z1 = z0 + BL; COL.push([-XI, z0, -0.40, z1], [0.40, z0, XI, z1]); }
    for (const zp of PARTZ) COL.push([-XI, zp - 0.05, -0.42, zp + 0.05], [0.42, zp - 0.05, XI, zp + 0.05]);
    for (const zc of POLEZ) for (const s of [-1, 1]) COL.push([s * 0.62 - 0.05, zc - 0.05, s * 0.62 + 0.05, zc + 0.05]);
    R.rdCol = [1e4, 1e4, 1e4 + 0.1, 1e4 + 0.1]; COL.push(R.rdCol);
    // APIs on the props
    apis();
    // initial dressing
    R.scene = typeof state !== 'undefined' && state ? state.scene : null;
    R.explicit = !!R.pending; R.env = null; R.spot = null;
    dressApply(R.pending || AUTO[R.scene] || 'board27', true); R.pending = null;
    return root;
  }

  // ---------------------------------------------------------- state: travel, doors, LEDs, lightning, reindeer
  const TR = { st: 'stopped', v: 0, off: 0, odo: 0, decel: 0, platZ: 0, platOn: true, station: 'SANDGATE', hold: false, cruise: 13.0 };
  const DOOR = { L: { p: 0, to: 0, u: 0 }, R: { p: 0, to: 0, u: 0 } };
  const LED = { level: 1, envLevel: 1, flkT: 0, flkD: 0, pulseT: 0, hemiBase: -1 };
  const FLK = [1, 0.2, 1, 0.1, 0.6, 1, 0.35, 1, 0.15, 0.8, 1, 0.5, 1];
  const LT_TAB = [14, 19, 12.5, 23, 16, 21, 13, 25, 17.5, 15], TH_TAB = [1.4, 2.6, 1.1, 2.2, 1.8, 2.9, 1.2];
  const FL = { t: -1, dur: 0.15, peak: 0, calm: false, strike: false, spotK: 0, dirK: 0, ambI: 0, ambT: 9, thunT: -1, thunName: '', thunVol: 1, dirBase: -1, dirCol: new THREE.Color(), boostCol: new THREE.Color(0xe8f0ff) };
  const RD = { st: 'seat', x: -0.89, y: 0.45, z: 6.39, ry: PI, wobT: -1, bobT: 0, holder: null };
  const ENV = {
    storm27:    { bg: 0x5d6f68, fog: [0x6f807a, 0.0100], hemi: [0xb9d4ff, 0x3a4048, 1.00], dir: [0xc8d8d0, 0.55, [-6, 8, 2]], spot: [0xe8f0ff, 0], rain: 0 },
    platform27: { bg: 0x6c7e76, fog: [0x7d8c84, 0.0090], hemi: [0xc4dcff, 0x40464c, 1.05], dir: [0xd0dcd4, 0.65, [-6, 8, 2]], spot: [0xe8f0ff, 0], rain: 0 },
    dark27:     { bg: 0x46544f, fog: [0x56645e, 0.0120], hemi: [0xa8c4f4, 0x30363c, 0.95], dir: [0xb4c4bc, 0.40, [-6, 8, 2]], spot: [0xe8f0ff, 0], rain: 0 },
  };
  const ENVX = {
    storm27:    { dome: new THREE.Color(0x6f807a), band: new THREE.Color(0x6a7a74), cloud: new THREE.Color(0xd0d8d4), led: 1.0, win: 0.75, lightning: true },
    platform27: { dome: new THREE.Color(0x7d8c84), band: new THREE.Color(0x76867e), cloud: new THREE.Color(0xe0e6e2), led: 1.0, win: 0.55, lightning: false },
    dark27:     { dome: new THREE.Color(0x56645e), band: new THREE.Color(0x52605a), cloud: new THREE.Color(0xa8b2ae), led: 0.92, win: 1.0, lightning: true },
  };
  const RAINL = { light: [0.45, 0.30], medium: [0.62, 0.48], heavy: [0.78, 0.78] };   // [glass opacity, sheets opacity]
  let rainL = RAINL.medium;

  function apis() {
    // doors
    for (const [G, side] of [[R.doorsL, 'L'], [R.doorsR, 'R']]) {
      G.userData.open = (u) => doorsSet(side, u);
      Object.defineProperty(G.userData, 'u', { get: () => DOOR[side].u, configurable: true });
    }
    R.lamps.userData.blink = (on) => { DOOR.L.blink = DOOR.R.blink = on; };
    R.leds.userData.level = (u) => { LED.level = u == null ? 1 : u; };
    R.leds.userData.flicker = (dur = 1.2) => {
      if (skipping()) return;
      if (LED.flkD > 0 && R.hemi && LED.hemiBase >= 0) R.hemi.intensity = LED.hemiBase;
      LED.hemiBase = -1; LED.flkT = 0; LED.flkD = dur;
    };
    R.pids.userData.pulse = () => { if (skipping()) return; LED.pulseT = 1.6; };
    R.tea.userData.steam = () => { if (isCur() && typeof world !== 'undefined' && world.puff) world.puff('tea_point', { n: 16, speed: 0.25, life: 1.8, color: 0xf2f2f2 }); };
    R.rd.userData.state = (s, where, who) => rdState(s, where, who);
    R.rd.userData.wobble = () => { RD.wobT = 0; snd('glass_squeak', 0.7, 0.55); };
    Object.defineProperty(R.rd.userData, 'st', { get: () => RD.st, configurable: true });
    const pu = R.pax.userData;
    pu.count = PAXN;
    pu.seatOf = (i) => PAX.seats[i] || null;
    pu.nod = (i) => { if (i < 0 || i >= PAXN || !PAX.seats[i]) return; const k = PAX.nodI[0] < 0 ? 0 : 1; PAX.nodI[k] = i; PAX.nodT[k] = 0; };
    pu.scanFlash = (i) => { if (i >= 0 && i < PAXN) PAX.flash[i] = 0.6; };
    pu.scanBay = (bay, side) => { for (let i = 0; i < PAXN; i++) { const n = PAX.seats[i]; if (n && n.slice(0, 2) === bay && (!side || n[2] === side)) PAX.flash[i] = 0.6; } };
    R.far.userData.lightning = (k) => lightning(k);
  }

  function doorsSet(side, u) {
    const d = DOOR[side === 'R' ? 'R' : 'L'], to = u > 0.5 ? 1 : u < 0 ? 0 : u;
    if (skipping() || !R.root) { d.p = d.to = to; d.u = to; doorPose(); return; }
    if (d.to !== to) snd('train_doors', 0.8, 1, null);
    d.to = to;
  }
  function doorPose() {
    if (!R.doorsL) return;
    for (const [G, d, s] of [[R.doorsL, DOOR.L, -1], [R.doorsR, DOOR.R, 1]]) {
      const o = DSLIDE * d.u;
      G.userData.n.position.z = -o; G.userData.p.position.z = o;
    }
  }
  function doors(open, side = 'L') {
    doorsSet(side, open ? 1 : 0);
    if (!open) chime();
  }
  let chimeT = -9;
  function chime() {
    const t = typeof clock !== 'undefined' ? clock.t : 0;
    if (t - chimeT < 1.0) return;
    chimeT = t; snd('train_chime', 0.9, 1, null);
  }

  // travel
  function placePlatform() {
    if (!R.plat) return;
    R.plat.position.z = TR.platZ;
    R.plat.visible = TR.platOn && TR.platZ > -175 && TR.platZ < 300;
  }
  const travel = {
    cruise: 13.0,
    get speed() { return TR.v; }, get state() { return TR.st; }, get station() { return TR.station; }, get offset() { return TR.off; },
    depart() {
      if (skipping()) { travel.cruiseNow(); return; }
      if (TR.st === 'cruising' || TR.st === 'departing') return;
      if (DOOR.L.to > 0 || DOOR.R.to > 0) { doors(false, 'L'); doorsSet('R', 0); }
      TR.st = 'departing'; TR.hold = true;
      if (R.env === 'platform27' && typeof world !== 'undefined') world.env('storm27', 4, 'train');
    },
    arrive(name, d = 110) {
      if (name) setStation(name);
      if (skipping() || TR.v <= 0.05) { travel.stopNow(name); return 0; }
      d = Math.max(10, d);
      TR.platZ = d; TR.platOn = true; TR.decel = (TR.v * TR.v) / (2 * d); TR.st = 'arriving'; TR.hold = false;
      placePlatform();
      return TR.v / TR.decel;
    },
    stopNow(name) {
      if (name) setStation(name);
      TR.st = 'stopped'; TR.v = 0; TR.platZ = 0; TR.platOn = true; TR.hold = false; placePlatform();
    },
    cruiseNow() { TR.st = 'cruising'; TR.v = TR.cruise; TR.platOn = false; TR.hold = false; placePlatform(); },
  };
  function setStation(name) { TR.station = name; if (R.plat) R.plat.userData.name(name); }
  function travelTick(dt) {
    let v0 = TR.v;
    if (TR.st === 'departing') {
      if (TR.hold && DOOR.L.u <= 0.001 && DOOR.R.u <= 0.001) TR.hold = false;
      if (!TR.hold) { TR.v = Math.min(TR.cruise, TR.v + 1.6 * dt); if (TR.v >= TR.cruise) TR.st = 'cruising'; }
    }
    let d;
    if (TR.st === 'arriving') {
      const vn = TR.v - TR.decel * dt;
      if (vn <= 0) { d = TR.decel > 0 ? (v0 * v0) / (2 * TR.decel) : 0; TR.v = 0; }
      else { TR.v = vn; d = (v0 + vn) * 0.5 * dt; }
    } else d = (v0 + TR.v) * 0.5 * dt;
    TR.off = (TR.off + d) % SUB_T; TR.odo = (TR.odo + d) % 9600;   // (9600 = 20 x 480 = 30 x 320: the street cars' wrap stays continuous)
    if (TR.platOn) { TR.platZ -= d; if (TR.platZ < -175) TR.platOn = false; }
    if (TR.st === 'arriving' && TR.v <= 0) {
      TR.st = 'stopped'; TR.platZ = 0; TR.v = 0;
      if (R.env === 'storm27' && typeof world !== 'undefined') world.env('platform27', 3, 'train');
    }
    placePlatform();
  }

  // the reindeer
  function holderOf(a) { if (a && a.held === R.rd) RD.holder = a; }
  function rdRelease() {
    RD.holder = null;
    if (typeof world !== 'undefined' && world.actors) world.actors.forEach(holderOf);
    if (RD.holder) RD.holder.hold(null);
    if (R.rd.parent !== R.root) R.root.add(R.rd);
    RD.holder = null;
  }
  const WH = [0, 0, 0, 0];
  function rdState(s, where, who = 'chase') {
    if (!R.rd) return;
    if (s === 'held') {
      rdRelease();
      RD.st = 'held'; R.rdCol[0] = R.rdCol[1] = 1e4; R.rdCol[2] = R.rdCol[3] = 1e4 + 0.1;
      R.rd.position.set(0, 0, 0); R.rd.rotation.set(0, 0, 0); rdPivot(0.9, 0.9, 0.9, 0, 0, 0);
      const a = typeof world !== 'undefined' ? world.actor(who) : null;
      if (a) a.hold(R.rd);
      return;
    }
    rdRelease();
    RD.st = s === 'aisle' || s === 'flop' ? s : 'seat';
    if (RD.st === 'aisle') {
      const w = where || 'rdeer_aisle_M';
      if (typeof w === 'string' && MARKS[w]) { const m = MARKS[w]; WH[0] = m[0]; WH[2] = m[2]; WH[3] = m[3] ?? PI; }
      else if (Array.isArray(w)) { WH[0] = w[0]; WH[2] = w.length >= 3 ? w[2] : w[1]; WH[3] = PI; }
      else { WH[0] = 0; WH[2] = 0; WH[3] = PI; }
      RD.x = WH[0]; RD.y = 0; RD.z = WH[2]; RD.ry = WH[3];
      R.rdCol[0] = RD.x - 0.40; R.rdCol[1] = RD.z - 0.35; R.rdCol[2] = RD.x + 0.40; R.rdCol[3] = RD.z + 0.35;
    } else {
      R.rdCol[0] = R.rdCol[1] = 1e4; R.rdCol[2] = R.rdCol[3] = 1e4 + 0.1;
      const m = RD.st === 'flop' ? MARKS.rdeer_flop : MARKS.rdeer_seat;
      RD.x = m[0]; RD.y = m[1]; RD.z = m[2]; RD.ry = m[3];
    }
    rdPose(0);
  }
  function rdPivot(sx, sy, sz, rz, px, py, pz = 0) { R.rdPivot.scale.set(sx, sy, sz); R.rdPivot.rotation.set(0, 0, rz); R.rdPivot.position.set(px, py, pz); }
  function rdPose(t) {
    const held = R.rd.parent !== R.root;
    let k = 0;
    if (RD.wobT >= 0) k = Math.sin(RD.wobT / 0.6 * PI * 3) * (1 - RD.wobT / 0.6) * 0.12;
    if (held) { rdPivot(0.9 * (1 - k * 0.5), 0.9 * (1 + k), 0.9 * (1 - k * 0.5), 0, 0, 0); return; }
    R.rd.position.set(RD.x, RD.y, RD.z); R.rd.rotation.set(0, RD.ry, 0);
    if (RD.st === 'seat') rdPivot(1.0 * (1 - k * 0.5), 0.80 * (1 + k), 0.62 * (1 - k * 0.5), 0, 0, 0, 0.04);
    else if (RD.st === 'flop') rdPivot(0.85, 0.85 * (1 + k), 0.80, H, 0.9, 0.30, -0.1);
    else rdPivot(1 - k * 0.5, (1 + k) * (1 + 0.006 * Math.sin(t * 2.1)), 1 - k * 0.5, 0, 0, 0.004 + 0.006 * Math.sin(t * 2.1));
  }

  // put back what a running flash / flicker borrowed (dir, hemi, spot), before starting another or re-dressing
  function fxReset() {
    if (FL.t >= 0) {
      if (R.dir && FL.dirK > 0 && FL.dirBase >= 0) { R.dir.intensity = FL.dirBase; R.dir.color.copy(FL.dirCol); }
      if (R.spot && FL.spotK > 0) R.spot.intensity = 0;
      if (MB) MB.flash.opacity = 0;
      if (R.flashM) R.flashM.visible = false;
      FL.t = -1;
    }
    if (LED.flkD > 0) { if (R.hemi && LED.hemiBase >= 0) R.hemi.intensity = LED.hemiBase; LED.hemiBase = -1; LED.flkD = 0; }
  }
  // lightning: scripted (k) and ambient (sky only)
  function lightning(k = 1) {
    if (skipping() || !isCur() || !R.root) return;
    fxReset();
    FL.t = 0; FL.calm = calm(); FL.strike = !FL.calm; FL.peak = FL.calm ? 0.3 : 0.6 * k; FL.dur = FL.calm ? 0.8 : 0.32;
    FL.spotK = FL.calm ? Math.min(0.8, 1.6 * k) : 9 * k; FL.dirK = FL.calm ? 0.4 : 1.65 * k;
    FL.thunT = 0.4; FL.thunName = 'thunder'; FL.thunVol = 0.9;
    R.leds.userData.flicker(1.2);
  }
  function flashCurve(t) {
    // 0..1 for a sky flash: calm = one smooth bump; else a sharp double strike
    if (FL.calm) return t >= FL.dur ? 0 : Math.sin(PI * t / FL.dur);
    if (t < 0.05) return t / 0.05;
    if (t < 0.10) return 1 - (t - 0.05) / 0.05 * 0.8;
    if (t < 0.14) return 0.2 + (t - 0.10) / 0.04 * 0.6;
    return t >= FL.dur ? 0 : 0.8 * (1 - (t - 0.14) / (FL.dur - 0.14));
  }

  // ---------------------------------------------------------- dressing
  const AUTO = { '2.7': 'board27' };
  const ENV_DRESS = { platform27: 'board27', storm27: 'run27', dark27: 'talk27' };
  const DRESS = {
    board27:   { env: 'platform27', travel: 'stop', station: 'SANDGATE', doors: true, rd: 'seat', plat: 8, rain: 'light' },
    run27:     { env: 'storm27', travel: 'cruise', station: 'DEAGON', doors: false, rd: 'seat', plat: 0, rain: 'medium' },
    inspect27: { env: 'platform27', travel: 'stop', station: 'BOONDALL', doors: true, rd: 'seat', plat: 5, rain: 'medium' },
    talk27:    { env: 'dark27', travel: 'cruise', station: 'NUDGEE', doors: false, rd: 'flop', plat: 0, rain: 'heavy' },
    valley27:  { env: 'dark27', travel: 'arrive', station: 'FORTITUDE VALLEY', doors: false, rd: 'flop', plat: 0, rain: 'heavy' },
  };
  const CAST = {
    board27: { chase40: 's27_c40', chase: 's27_chase', luka: 's27_luka_doze', passenger_a: 's27_passenger', reindeer_man: 's27_reindeer_man', passenger_c: 's27_pax_c', passenger_d: 's27_pax_d' },
    inspect27: { chase40: 's27_c40', chase: 's27_chase_up', luka: 's27_luka_doze', passenger_a: 's27_passenger', reindeer_man: 's27_reindeer_man', passenger_c: 's27_pax_c', passenger_d: 's27_pax_d' },
    talk27: { luka: 's27_talk_luka', chase40: 's27_talk_c40', chase: 's27_talk_chase', passenger_a: 's27_passenger', reindeer_man: 's27_reindeer_man', passenger_c: 'seat_B2Rba', passenger_d: 'seat_B2Rbw' },
  };
  CAST.run27 = CAST.board27; CAST.valley27 = CAST.talk27;
  const CAST_LOOK = { reindeer_man: 'local40_c' };   // the reindeer's owner is a man (2.7: actor reindeer_man, look local40_c)
  function dressApply(st, build) {
    const D = DRESS[st]; if (!D) return;
    R.state = st;
    rainL = RAINL[D.rain] || RAINL.medium;
    if (!R.root) return;
    // travel
    if (D.travel === 'stop') travel.stopNow(D.station);
    else if (D.travel === 'arrive') { travel.cruiseNow(); setStation(D.station); if (!build && !skipping()) travel.arrive(D.station, 160); else travel.stopNow(D.station); }
    else { travel.cruiseNow(); setStation(D.station); }
    DOOR.L.p = DOOR.L.to = DOOR.L.u = D.doors ? 1 : 0; DOOR.R.p = DOOR.R.to = DOOR.R.u = 0; doorPose();
    // reindeer, passengers, platform dummies
    rdState(D.rd);
    paxPopulate(st);
    R.plat.userData.dummies(D.plat);
    fxReset(); FL.thunT = -1;
    R.ambKey = null;
  }
  function dress(st, o = {}) {
    if (st === 'none') { if (typeof world !== 'undefined') world.torchAuto = true; R.released = true; return; }
    if (!DRESS[st]) st = 'board27';
    R.released = false; R.explicit = true;
    if (typeof state !== 'undefined' && state) R.scene = state.scene;
    if (!R.root) R.pending = st;   // not built yet: build() dresses it
    dressApply(st, false);
    if (!o.keepEnv && typeof world !== 'undefined' && world.env) world.env(DRESS[st].env, 0, 'train');
  }

  // ---------------------------------------------------------- ambience by travel state
  const AMB = {
    cruise: { rain: false, loops: [['rail_clack', 1], ['train_hum', 1], ['rain_roof', 0.8]], room: 'carriage' },
    slow: { rain: false, loops: [['rail_clack', 0.55], ['train_hum', 0.9], ['rain_roof', 0.8]], room: 'carriage' },
    stop: { rain: false, loops: [['train_idle', 1], ['rain_roof', 0.8], ['platform_murmur', 0.6]], room: 'carriage' },
    cruiseH: { rain: false, loops: [['rail_clack', 1], ['train_hum', 1], ['rain_roof', 0.9], ['rain_heavy', 0.55]], room: 'carriage' },
    slowH: { rain: false, loops: [['rail_clack', 0.55], ['train_hum', 0.9], ['rain_roof', 0.9], ['rain_heavy', 0.55]], room: 'carriage' },
    stopH: { rain: false, loops: [['train_idle', 1], ['rain_roof', 0.9], ['rain_heavy', 0.55], ['platform_murmur', 0.4]], room: 'carriage' },
  };
  function ambKey() {   // (constant strings: called every tick)
    const heavy = R.state === 'talk27' || R.state === 'valley27';
    if (TR.st === 'stopped') return heavy ? 'stopH' : 'stop';
    if (TR.st === 'cruising') return heavy ? 'cruiseH' : 'cruise';
    return heavy ? 'slowH' : 'slow';
  }

  // ---------------------------------------------------------- update (no allocation)
  function findLights() {
    R.spot = R.hemi = R.dir = null;
    const sc = R.root && R.root.parent; if (!sc) return;
    for (let i = 0; i < sc.children.length; i++) {
      const o = sc.children[i];
      if (o.isSpotLight) R.spot = o; else if (o.isHemisphereLight) R.hemi = o; else if (o.isDirectionalLight) R.dir = o;
    }
  }
  function nodTick(dt) {
    for (let k = 0; k < 2; k++) {
      const i = PAX.nodI[k]; if (i < 0) continue;
      PAX.nodT[k] += dt;
      const u = PAX.nodT[k] / 1.3;
      if (u >= 1) { PAX.nodI[k] = -1; paxWrite(i, 0); }
      else paxWrite(i, Math.sin(u * PI) * 0.28);
      R.paxHead.instanceMatrix.needsUpdate = R.paxChip.instanceMatrix.needsUpdate = true;
    }
  }
  function update(dt, ctx) {
    if (!R.root || !R.paxBody) return;
    const t = ctx.t, cur = isCur();
    // a new scene: auto-dress once (an explicit dress wins until the scene changes)
    const sid = typeof state !== 'undefined' && state ? state.scene : null;
    if (sid !== R.scene) { R.scene = sid; R.explicit = false; if (AUTO[sid]) { dressApply(AUTO[sid], false); if (typeof world !== 'undefined') world.env(DRESS[AUTO[sid]].env, 0, 'train'); R.explicit = true; } }
    if (!R.spot || R.spot.parent !== R.root.parent) findLights();
    if (cur && !R.released && typeof world !== 'undefined' && world.torchAuto) world.torchAuto = false;
    // env change: sky tints, LED level; outside a 2.7 scene the dress follows the env
    if (ctx.env !== R.env) {
      R.env = ctx.env;
      if (!R.explicit && !AUTO[R.scene] && ENV_DRESS[R.env] && ENV_DRESS[R.env] !== R.state) dressApply(ENV_DRESS[R.env], false);
      const X = ENVX[R.env] || ENVX.storm27; LED.envLevel = X.led;
    }
    const X = ENVX[R.env] || ENVX.storm27, kk = Math.min(1, dt * 1.5);
    MB.dome.color.lerp(X.dome, kk); MB.band.color.lerp(X.band, kk); MB.cloud.color.lerp(X.cloud, kk);
    M.house.emissiveIntensity += (X.win - M.house.emissiveIntensity) * kk;
    // travel and the treadmill
    travelTick(dt);
    const off = TR.off;
    R.masts.position.z = -(off % MAST_T);
    R.suburbs.position.z = -off;
    T.track.offset.y = (off / 2.4) % 1;
    T.streaks.offset.x = (off / 1.6) % 1; T.streaks.offset.y = (T.streaks.offset.y + dt * 2.5) % 1;
    T.drops.offset.x = (T.drops.offset.x + TR.v * 0.004 * dt) % 1; T.drops.offset.y = (T.drops.offset.y - 0.03 * dt + 1) % 1;
    T.cloud.offset.x = (T.cloud.offset.x + dt * 0.0016 + TR.v * 0.00006 * dt) % 1;
    MB.glassRain.opacity += (rainL[0] - MB.glassRain.opacity) * kk; MB.rain.opacity += (rainL[1] - MB.rain.opacity) * kk;
    // street cars: their own +-8 m/s along the street, wrapped to the visible range around the carriage
    for (let i = 0; i < 3; i++) {
      const dir = i === 2 ? -1 : 1, sp = i === 2 ? 9 : 8;
      const w = ((i * 107 + dir * sp * (t % 9600) - TR.odo) % 320 + 320) % 320 - 160;
      v1.set(i === 2 ? 17.6 : 15, GY, w + off); q1.setFromAxisAngle(s1.set(0, 1, 0), dir > 0 ? 0 : PI);
      R.cars.setMatrixAt(i, m4.compose(v1, q1, s1.set(1, 1, 1)));
    }
    R.cars.instanceMatrix.needsUpdate = true;
    // doors: ease, lamps blink while moving
    let moving = 0;
    for (let k = 0; k < 2; k++) {
      const d = k ? DOOR.R : DOOR.L;
      if (d.p !== d.to) { const st = dt / DTIME; d.p = Math.abs(d.to - d.p) <= st ? d.to : d.p + Math.sign(d.to - d.p) * st; d.u = smooth(d.p); moving |= k ? 2 : 1; }
    }
    if (moving) doorPose();
    const blink = (0.5 + 0.5 * Math.sign(Math.sin(t * PI * 4)));
    M.lampL.emissiveIntensity = moving & 1 || DOOR.L.blink ? 0.25 + 1.6 * blink : DOOR.L.u > 0.99 ? 0.9 : 0.2;
    M.lampR.emissiveIntensity = moving & 2 || DOOR.R.blink ? 0.25 + 1.6 * blink : DOOR.R.u > 0.99 ? 0.9 : 0.2;
    // lightning: ambient sky flashes in storm27 / dark27, scripted flashes with the spot, dir boost and thunder
    if (cur && R.spot) {
      R.spot.position.set(-4.5, 2.6, 7.6); R.spot.target.position.set(-0.5, 1.0, 7.6);
      R.spot.angle = 0.6; R.spot.penumbra = 0.8; R.spot.distance = 9;
      if (R.spot.target.parent !== R.root.parent) R.root.parent.add(R.spot.target);
    }
    if (cur && X.lightning && FL.t < 0) {
      FL.ambT -= dt;
      if (FL.ambT <= 0) {
        FL.ambI = (FL.ambI + 1) % LT_TAB.length; FL.ambT = LT_TAB[FL.ambI];
        if (!skipping()) { FL.t = 0; FL.calm = calm(); FL.strike = false; FL.peak = FL.calm ? 0.18 : 0.25; FL.dur = FL.calm ? 0.8 : 0.15; FL.spotK = 0; FL.dirK = 0; FL.thunT = TH_TAB[FL.ambI % TH_TAB.length]; FL.thunName = 'thunder_far'; FL.thunVol = 0.7; }
      }
    }
    if (FL.t >= 0) {
      if (FL.t === 0 && R.dir) { FL.dirBase = R.dir.intensity; FL.dirCol.copy(R.dir.color); }
      FL.t += dt;
      const c = FL.t >= FL.dur ? 0 : (FL.strike ? flashCurve(FL.t) : Math.sin(PI * FL.t / FL.dur));
      MB.flash.opacity = FL.peak * c; R.flashM.visible = MB.flash.opacity > 0.002;
      if (R.spot && FL.spotK > 0) R.spot.intensity = FL.calm ? FL.spotK * c : FL.t < 0.10 ? FL.spotK : FL.t < 0.18 ? FL.spotK * 0.4 : 0;
      if (R.dir && FL.dirK > 0) { R.dir.intensity = FL.dirBase + FL.dirK * c; R.dir.color.copy(FL.dirCol).lerp(FL.boostCol, c); }
      if (FL.t >= FL.dur && FL.t >= 0.2) {
        FL.t = -1; MB.flash.opacity = 0; R.flashM.visible = false;
        if (R.spot && FL.spotK > 0) R.spot.intensity = 0;
        if (R.dir && FL.dirK > 0) { R.dir.intensity = FL.dirBase; R.dir.color.copy(FL.dirCol); }
      }
    }
    if (FL.thunT >= 0) { FL.thunT -= dt; if (FL.thunT < 0) snd(FL.thunName, FL.thunVol, 1, null); }
    // LEDs: level x env level x flicker; the ceiling glow follows; the hemi dips with them while flickering
    let fk = 1;
    if (LED.flkD > 0) {
      if (LED.flkT === 0 && R.hemi) LED.hemiBase = R.hemi.intensity;
      LED.flkT += dt;
      const u = LED.flkT / LED.flkD;
      if (u >= 1) { LED.flkD = 0; if (R.hemi && LED.hemiBase >= 0) R.hemi.intensity = LED.hemiBase; LED.hemiBase = -1; }
      else { fk = calm() ? 1 - 0.5 * Math.sin(PI * u) : FLK[((LED.flkT / 0.07) | 0) % FLK.length]; if (R.hemi && LED.hemiBase >= 0) R.hemi.intensity = LED.hemiBase * (0.45 + 0.55 * fk); }
    }
    const lv = LED.level * LED.envLevel * fk;
    M.led.emissiveIntensity = 1.3 * lv; M.ceil.emissiveIntensity = 0.5 * lv;
    if (LED.pulseT > 0) LED.pulseT = Math.max(0, LED.pulseT - dt);
    M.pid.emissiveIntensity = 0.9 * (0.6 + 0.4 * lv) * (1 + 0.5 * Math.sin(PI * Math.min(1, LED.pulseT / 1.6)));
    // the reindeer
    if (RD.wobT >= 0) { RD.wobT += dt; if (RD.wobT >= 0.6) RD.wobT = -1; }
    rdPose(t);
    // passengers: two random nods every ~3 s; chip lights pulse (one colour write per 0.5 s), scan flashes
    if ((PAX.nodNext -= dt) <= 0) { PAX.nodNext = 2.4 + rnd() * 1.6; for (let k = 0; k < 2; k++) if (PAX.nodI[k] < 0) { const i = (rnd() * PAXN) | 0; if (PAX.seats[i]) { PAX.nodI[k] = i; PAX.nodT[k] = 0; } } }
    nodTick(dt);
    let fl = false;
    for (let i = 0; i < PAXN; i++) if (PAX.flash[i] > 0) { PAX.flash[i] = Math.max(0, PAX.flash[i] - dt); fl = true; }
    if ((PAX.chipT -= dt) <= 0 || fl) {
      if (PAX.chipT <= 0) PAX.chipT = 0.5;
      for (let i = 0; i < PAXN; i++) {
        const k = PAX.flash[i] > 0 ? 1.8 : 0.65 + 0.35 * Math.sin(t * 1.3 + PAX.chipK[i]);
        R.paxChip.setColorAt(i, c1.setRGB(0.749 * k, 0.902 * k, 1.0 * k));
      }
      R.paxChip.instanceColor.needsUpdate = true;
    }
    // ambience follows the travel state (and the heavy rain of 2.7_talk)
    if (cur) { const key = ambKey(); if (key !== R.ambKey || (R.lastT >= 0 && t - R.lastT > 0.5)) { R.ambKey = key; if (typeof AUDIO !== 'undefined' && AUDIO.ambience) { AUDIO.ambience(AMB[key]); if (AUDIO.setRoom) AUDIO.setRoom('carriage'); } } }
    R.lastT = t;
  }

  // ---------------------------------------------------------- data
  const MARKS = {
    // 2.7_board
    s27_c40: seat('B2', 'R', 'b', 'w'), s27_chase: seat('B2', 'R', 'b', 'a'), s27_passenger: seat('B2', 'R', 'f', 'w'), s27_luka_doze: seat('B2', 'L', 'b', 'w'),
    // the PLAY
    s27_chase_up: [0.0, 0, 4.20, PI], s27_reindeer_man: seat('B3', 'L', 'f', 'w'),
    rdeer_seat: [-0.89, 0.45, 6.39, PI], rdeer_aisle_M: [0.0, 0, 0.0, PI], rdeer_aisle_B1: [0.0, 0, 1.95, PI], rdeer_flop: [-0.89, 0.45, 1.95, H],
    s27_pax_c: seat('B4', 'R', 'b', 'w'), s27_pax_d: seat('B4', 'L', 'b', 'w'), s27_free_B4: seat('B4', 'L', 'f', 'w'), s27_cp_carriage: [0.0, 0, 4.20, PI],
    d27_board_out: [-3.2, 1.9, -9.5, H], d27_board_in: [0.0, 1.95, -9.5, 0],
    d27_stop_A1: [0, 1.95, -7.65, 0], d27_stop_A2: [0, 1.95, -5.75, 0], d27_stop_A3: [0, 1.95, -3.85, 0], d27_stop_A4: [0, 1.95, -1.95, 0], d27_stop_M: [0, 1.95, 0.0, 0],
    d27_stop_B1: [0, 1.95, 1.95, 0], d27_stop_B2: [0, 1.95, 3.85, 0], d27_stop_B3: [0, 1.95, 5.75, 0], d27_stop_B4: [0, 1.95, 7.65, 0],
    d27_wait_M: [0.0, 1.95, -1.6, 0], d27_wait_B1: [0.0, 1.95, 0.6, 0],
    d27_exit_A: [-3.2, 1.9, -9.5, -H], d27_exit_M: [-3.2, 1.9, 0.0, -H], d27_exit_B: [-3.2, 1.9, 9.5, -H],
    // 2.7_talk
    s27_talk_luka: seat('B4', 'L', 'f', 'w'), s27_talk_c40: seat('B4', 'L', 'b', 'w'), s27_talk_chase: seat('B4', 'R', 'b', 'w'),
    // hotspots' feet
    s27_kettle: [-1.0, 0, -0.45, PI], s27_chime_spot: [-1.05, 0, 0.32, -H],
  };
  for (const k of BAY_IDS) for (const sd of ['L', 'R']) for (const row of ['f', 'b']) for (const pos of ['w', 'a']) MARKS['seat_' + k + sd + row + pos] = seat(k, sd, row, pos);

  return {
    env: ENV,
    build,
    marks: MARKS,
    anchors: {
      s27_board_three:   { at: [0.90, 1.10, 3.85], from: [-0.55, 1.35, 3.85], fov: 52 },
      s27_passenger_ots: { at: [0.90, 1.15, 4.49], from: [0.85, 1.42, 2.70], fov: 44 },
      s27_platform_wide: { at: [-3.5, 1.4, 0.0], from: [0.9, 1.9, 6.0], fov: 50 },
      s27_doors_chime:   { at: [-1.42, 1.5, 0.0], from: [0.6, 1.6, 1.6], fov: 40 },
      s27_drone_boards:  { at: [-0.6, 1.6, -9.5], from: [0.3, 1.92, 1.2], fov: 40 },
      s27_luka_doze:     { at: [-1.10, 1.15, 4.49], from: [-0.25, 1.30, 3.60], fov: 34 },
      s27_reindeer:      { at: [-0.89, 1.30, 6.39], from: [0.20, 1.50, 5.20], fov: 44 },
      s27_reindeer_block:{ at: [0.0, 1.35, 0.0], from: [0.45, 1.55, -3.6], fov: 44 },
      s27_chase_asleep:  { at: [1.25, 1.10, 8.29], from: [0.35, 1.30, 7.55], fov: 36 },
      s27_talk_two:      { at: [-1.12, 1.05, 7.65], from: [0.62, 1.22, 7.65], fov: 50 },
      s27_window_storm:  { at: [-40.0, 6.0, 20.0], from: [-0.98, 1.28, 7.80], fov: 44 },
      s27_carriage_wide: { at: [0.0, 1.0, -6.0], from: [0.0, 2.10, 10.6], fov: 50 },
      tea_point:         { at: [-1.0, 1.1, -0.92], from: [-0.35, 1.45, 0.25], fov: 40 },
      s27_nameboard:     { at: [-4.0, 2.4, 12.0], from: [-0.6, 1.55, 9.0], fov: 40 },
      s27_pid:           { at: [0.0, 2.17, 1.03], from: [0.25, 1.55, 3.2], fov: 36 },
    },
    cams: {
      // each pair faces opposite ways down the aisle: they cut (an ease would swing through a top-down over the player)
      aisle_B_far:  { type: 'fixed', pos: [0.95, 2.12, 10.25],  look: [-0.30, 0.55, 1.40],  fov: 46 },
      aisle_B_near: { type: 'fixed', pos: [-0.95, 2.12, 1.20],  look: [0.30, 0.55, 8.90],   fov: 56 },
      aisle_A_far:  { type: 'fixed', pos: [-0.95, 2.12, -10.25], look: [0.30, 0.55, -1.40], fov: 46 },
      aisle_A_near: { type: 'fixed', pos: [0.95, 2.12, -1.20],  look: [-0.30, 0.55, -8.90], fov: 56 },
      vest_M:       { type: 'fixed', pos: [1.10, 2.05, 0.85],   look: [-0.90, 0.70, -0.50], fov: 64 },
      vest_A:       { type: 'fixed', pos: [1.10, 2.05, -8.75],  look: [-0.80, 0.70, -10.30], fov: 64 },
      vest_B:       { type: 'fixed', pos: [-1.10, 2.05, 8.75],  look: [0.80, 0.70, 10.30],  fov: 64 },
    },
    zones: [
      { box: [-1.42, -11.0, 1.42, -8.6], cam: 'vest_A' },
      { box: [-1.42, -8.6, 1.42, -4.8],  cam: 'aisle_A_near' },
      { box: [-1.42, -4.8, 1.42, -1.0],  cam: 'aisle_A_far' },
      { box: [-1.42, -1.0, 1.42, 1.0],   cam: 'vest_M' },
      { box: [-1.42, 1.0, 1.42, 4.8],    cam: 'aisle_B_far' },
      { box: [-1.42, 4.8, 1.42, 8.6],    cam: 'aisle_B_near' },
      { box: [-1.42, 8.6, 1.42, 11.0],   cam: 'vest_B' },
    ],
    colliders: COL,
    props: ['doors_L', 'doors_R', 'door_lamps', 'leds', 'pids', 'tea_point', 'reindeer', 'pax', 'platform', 'nameboard_a', 'nameboard_b', 'scenery',
      'track_bed', 'fences', 'masts', 'suburbs', 'street_cars', 'rain_sheets', 'far', 'dome', 'band', 'clouds', 'flash'],
    get ambience() { return AMB[ambKey()] || AMB.cruise; },
    update,
    dress, seat, travel, doors, chime, lightning,
    castFor: (st) => CAST[st] || CAST.board27,
    castLook: (id) => CAST_LOOK[id] || id,
    get ar() {
      const label = (R.plat && R.plat.userData.label) || TR.station;
      return [{ id: 'ar_nameboard_a', kind: 'sign', text: label, prop: 'nameboard_a', w: 3.6 }, { id: 'ar_nameboard_b', kind: 'sign', text: label, prop: 'nameboard_b', w: 3.6 }];
    },
    paths: {
      d27_aisle: [[0, -9.5], [0, -7.65], [0, -5.75], [0, -3.85], [0, -1.95], [0, 0], [0, 1.95], [0, 3.85], [0, 5.75], [0, 7.65], [0, 9.5]],
      luka_to_B4: [[-0.66, 4.49], [0, 4.2], [0, 7.0], [-1.12, 7.01]],
      c40_to_B4: [[1.12, 4.49], [0, 4.2], [0, 8.0], [-1.12, 8.29]],
      chase_to_B4: [[0, 4.2], [0, 8.0], [1.12, 8.29]],
    },
    stations: ['SANDGATE', 'DEAGON', 'BOONDALL', 'NUDGEE', 'FORTITUDE VALLEY'],
  };
})();
