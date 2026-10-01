// ============================================================ SET: rue_house — Rue's Queenslander, Scarborough (Sunday 23 December 2040)
// Scene 2.4 "Every Sunday" (Rue's only appearance: the set never spawns him) and the optional B1 montage frame (cork31).
// Spec: docs/sets/rue_house.md — every name and coordinate there is the contract.
//
// LAYOUT (metres, Y up). +Z = east, toward the street and Moreton Bay (the house front faces +Z); +X = north, down the
// street to where it meets the water. Mark ry: 0 faces +Z (out to the street), PI faces -Z (into the house), H = PI/2
// faces +X. Yard and street y = 0; verandah and rooms y = 2.40 (floor() ramps the 14-tread stairs); ceilings y = 5.40.
//   Lot x -9..9, z -14..13.2 (paling side fences at x ±9, side gates shut at z 2.3) · house body x -7..3, z -9..0 (walls
//   0.15; hipped red iron roof, eaves y 5.6, apex (-2.0, 8.2, -4.5); chimney on the south wall; water tank in the north
//   side yard) · verandah z 0..2.8 (posts x -6.92 -4.70 -2.45 -0.72 0.72 2.92 at z 2.72; dowel balustrade z 2.65..2.8, top
//   rail 3.40; bullnose roof 5.10 -> 4.55) · front wall z -0.15..0 (door x -0.45..0.45; louvre banks x -6.4..-3.9,
//   -3.7..-1.2, 1.0..2.5, sill 3.20, head 4.50; brass bell (0.95, 4.12, 0.10)) · stairs x -0.6..0.6, z 2.8 (y 2.40) ->
//   6.44 (y 0) · concrete path x -0.5..0.5 to the picket gate (x -0.55..0.55, z 13.2) · frangipani (-4.2, 9.0) · Hills
//   hoist (5.6, 5.4) · milk-can letterbox (1.2, 13.45) · under-house: stumps behind the lattice skirt (dark, unreachable).
//   Interior: front room x -6.85..2.85, z -4.85..-0.15 (mantel on the left wall x -6.85, z -3.4..-1.6; armchairs Rue
//   (-5.40, -2.10), Luka (-2.35, -3.50), Chase (-2.30, -1.05); side table x -5.78..-5.33, z -1.25..-0.45; oval coffee
//   table (-3.70, -2.30) on a rug; sideboard x 2.35..2.85, z -3.8..-2.0; corkboard x -1.9..0.3, y 3.30..4.50 on the back
//   wall; bookshelf x 0.45..1.05; hall door x 1.2..2.1, shut; fretwork arch x -5.6..-2.4; ceiling fan (-2.4, 5.25, -2.4))
//   · kitchen x -6.85..-1.35, z -8.85..-4.85 (bench z -8.85..-8.25, top 3.30: sink x -5.5, tray x -4.98, stove x -4.4,
//   kettle (-3.20, -8.50); fridge x -2.0..-1.5; window louvres x -6.0..-3.6 onto a painted backyard; table (-4.30, -6.70)).
//   Street (filmable, not walkable; the gate stays shut in play): verge z 13.2..14.2, footpath 14.2..15.6, verge, kerb
//   17.0, road z 17.15..24 (south past the fog to the T with the Esplanade at x 63.5..70); padded speed hump x 12;
//   lamps (-8|22|46, 16.6); blank 2040 street sign (9.8, 16.2); foreshore reserve z 24..44.5 (Norfolk pines (-14,30)
//   (2,35) (18,31) (34,36), picnic shelter (8, 30), promenade path); rock sea wall z 44.5..48 (x < 76) and x 75.5..79
//   (z < 46); water y -2.0. Neighbour houses (instanced shells) at z -4: x 22 40 58 and -24 -42 -60 ... -132.
//   Far group (MeshBasic, fog: false): horizon silhouettes r 460 (Moreton Island east, Bribie and the Glass House Mountains
//   north-west, the peninsula west and south), haze + skirt (live fog colour), sun, 6 cumulus, the storm bank (6 anvils).
// Walkable: yard (z 2.3..13.2), stairs, verandah, front room, kitchen; colliders close every edge (spec §2.5).
//
// ENV: morning24 (default) · inside24 (the set parks the spot as the louvre sunbeam) · building24 · cork31 (the spot on the
//   corkboard). The interior's materials dim to ~0.6 under the exterior presets, so the room reads dim through the door.
// DRESS: SETS.rue_house.dress(state, { keepEnv }) — knock24 · explore24 · tea24 · gate24 · cork31 (applies its env unless
//   keepEnv). AUTO on a scene change: 2.4 -> knock24; any other scene (and ?setview) dresses by env (morning24 knock24,
//   inside24 explore24, building24 gate24, cork31 cork31) until something calls dress().
// AMBIENCE (per dress, getter): knock24/gate24 cicadas birds surf_far wind_soft (room none); explore24/tea24 fan clock +
//   quiet cicadas/birds (room 'room'); cork31 fan clock birds (room). One-shots: bell_brass lorikeet hover_hum_pass
//   screen_door_bang gate_latch (each falls back to an existing recipe until 03-audio has the name).
// MARKS: bell kettle gate_in gate_out stair_foot stair_top · s24_start_chase s24_start_luka s24_c40_gate s24_chase_door
//   s24_luka_door s24_rue_door · s24_in_chase s24_in_luka s24_rue_kettle s24_rue_side s24_rue_arch s24_rue_tray
//   s24_look_polaroid s24_look_cork s24_look_walkman s24_look_brick s24_look_card s24_look_tin · s24_seat_rue
//   s24_seat_luka s24_seat_chase · s24_rue_stair_top s24_rue_stair_foot s24_rue_gate s24_c40_gate_face s24_luka_yard
//   s24_chase_yard s24_walk_wp s24_walk_luka s24_walk_chase s24_walk_c40 s24_rue_watch.
// ANCHORS: house_wide bell s24_door_mid s24_door_rev polaroid_copy corkboard corkboard_end walkman brick_phone_table
//   xmas_card_2036 bic_tin kettle_rue s24_explore_room s24_tea_wide s24_tea_rue s24_twoshot_boys s24_rue_to_luka
//   s24_louvre_pov s24_yard_wide s24_gate_two s24_hands s24_verandah_wide s24_storm b1_cork31 b1_room31.
// CAMS (zone order): stairs verandah kitchen room_left room_right yard (pan, the default; from the NE front corner by the
//   Hills hoist, not the spec's west footpath, whose line to the yard ran through the frangipani) street (pan, filmable).
// Re-aimed anchor lenses (the spec's sat inside a post, a letterbox or a pine, or missed the subject): bell, s24_door_mid,
//   s24_door_rev, corkboard_end, s24_gate_two, s24_verandah_wide (behind Rue's right shoulder, under the bullnose),
//   s24_storm (between two pines), b1_room31. front_door opens to 2.45 rad (flat to the wall, clear of the doorway).
// PROPS (userData API; instant while skipping, allocation-free per tick):
//   screen_door open(u) · front_door open(u) · brass_bell ring() · gate open(u) (its collider parks while open) ·
//   walkman play(on) · brick_phone show(b) test() · polaroid_copy · corkboard paint('2040'|'2031') · xmas_card_2036 ·
//   bic_tin open(b) · kettle_rue boil(on) click() (origin above the lid: world.puff('kettle_rue') steams from it) ·
//   tea_tray · tea_set · rue_mug · mantel_clock set(h, m) · ceiling_fan · frangipani drop() · hills_hoist ·
//   lorikeets on(b) fly() · hovercar_street pass() off() on() · storm_bank build(u) set(u) flicker(on) · louvre_light ·
//   water band band_skirt haze sun clouds (backdrop).
// Extras on the entry: dress(state, opts), paths { rue_pottering, rue_to_gate, walk_off, street_car }.
// Set inspection (?setview=rue_house): TWO_TEST.dress(state, opts), TWO_TEST.call(prop, fn, ...args).
SETS.rue_house = (() => {
  const PI = Math.PI, H = PI / 2, TAU = PI * 2, DS = THREE.DoubleSide;
  // palette (spec §3.1; Yes yellow is not used on this set)
  const CREAM = 0xf1e7cf, TRIM = 0xf6f4ee, ROOF = 0x9b3b2e, VCEIL = 0xe9e2d2, VBOARD = 0x7d8c94, LATT = 0xeeeeea,
    LAWN = 0x90b25c, GARDEN = 0x5f8a3c, BARK = 0x9a9488, BLOOM = 0xfbf8f0, BUTTER = 0xf3dc8a, HIB = 0xd8323a,
    VJ = 0xdfe6cf, CEIL = 0xf4f2ec, HOOP = 0xb98a55, STAIN = 0x5a3a24, SAGE = 0x9fb08f, RUSTC = 0xb86b4b,
    BRASS = 0xc9a54a, PADDED = 0xefe6d0, GLASSY = 0xbfe6ff, WNEAR = 0x5fb7d4, WFAR = 0x3d8fb8, CONC = 0xd6d0c4,
    ASPH = 0x6c6e70, SOIL = 0x4a3c2e, PALING = 0x9c8f7a, BRICK = 0x8e4a3a, STEEL = 0xc4c8cc, CANE = 0xc9a46a,
    GUTTER = 0xd9d4c6, MULCH = 0x6e5440, MINT = 0x9cc3ad, HEDGE = 0x4f7a3a, ROCK = 0x8a8072, GREENS = [0x5f8a3c, 0x547f36, 0x6a9444, 0x4d7432];
  const OUT = [1, 1, 1], SHADE = [0.92, 0.95, 1.0], IN = [1.0, 0.92, 0.82], UNDER = [0.42, 0.41, 0.4];
  const LIFT_C = [1.9, 1.9, 1.9], LIFT_P = [1.25, 1.25, 1.25];   // read-at faces that look away from the key light
  const CEILT = [2.2, 2.7, 3.5], CEILT_IN = [2.3, 2.7, 3.3];   // down-facing ceilings and soffits: only the hemisphere's ground colour lights them
  // (plus an emissive base on M.ceilV / M.ceilIn, scaled per env in applyEnv, so painted ceilings read pale, as reddy's do)
  const COL = [];                // colliders (filled by build; the gate's box is mutated in place)
  const R = {};                  // live refs from the last build (dress/update use them)
  // scratch (update never allocates)
  const tc = new THREE.Color(), tc2 = new THREE.Color(), m4 = new THREE.Matrix4(), mA = new THREE.Matrix4(), vA = new THREE.Vector3(),
    vB = new THREE.Vector3(), sV = new THREE.Vector3(), qA = new THREE.Quaternion(), qB = new THREE.Quaternion(), qC = new THREE.Quaternion(),
    eA = new THREE.Euler(), ZAX = new THREE.Vector3(0, 0, 1), YAX = new THREE.Vector3(0, 1, 0);
  let b = null, tint = OUT, XF = null, T = null, M = null, SKY = null, DEF = null, BG = null, BU = null;
  let seed = 1; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647); const srand = (n) => { seed = n; };
  const smooth = (u) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
  const skipping = () => typeof flow !== 'undefined' && !!flow && !!flow.skipping;
  const isCur = () => typeof world !== 'undefined' && world.setId === 'rue_house';
  const isLive = () => typeof world !== 'undefined' && !!world.anchor && !!world.anchor('bell', 'rue_house');

  // ---------------------------------------------------------- geometry helpers (into the current Builder `b`), as reddy
  // tile: world-space UVs (metres per texture tile) for repeating textures; negative = rotate on horizontal faces
  function worldUV(g, tile) {
    const p = g.attributes.position, n = g.attributes.normal, uv = g.attributes.uv;
    if (!uv || !n) return;
    const s = 1 / Math.abs(tile), rot = tile < 0;
    for (let i = 0; i < p.count; i++) {
      const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), az = Math.abs(n.getZ(i)), x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      if (ay >= ax && ay >= az) uv.setXY(i, (rot ? z : x) * s, (rot ? x : z) * s);
      else if (ax >= az) uv.setXY(i, z * s, y * s);
      else uv.setXY(i, x * s, y * s);
    }
  }
  function put(g, hex, m, tile) {
    if (XF) g.applyMatrix4(XF);
    if (tile) worldUV(g, tile);
    tc.set(hex);
    const r = tc.r * tint[0], gg = tc.g * tint[1], bl = tc.b * tint[2], n = g.attributes.position.count, a = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { a[i * 3] = r; a[i * 3 + 1] = gg; a[i * 3 + 2] = bl; }
    g.setAttribute('color', new THREE.BufferAttribute(a, 3));
    b.add(g, m || DEF || M.vc);
  }
  // box: y is the BOTTOM. bb: min/max corners. boxR: centred, rotation X then Z then Y. cyl/ico: centred.
  function box(w, h, d, hex, x, y, z, ry = 0, m, tile) { const g = new THREE.BoxGeometry(w, h, d); if (ry) g.rotateY(ry); g.translate(x, y + h / 2, z); put(g, hex, m, tile); }
  function bb(x0, y0, z0, x1, y1, z1, hex, m, tile) { const g = new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0); g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); put(g, hex, m, tile); }
  function boxR(w, h, d, hex, x, y, z, rx = 0, ry = 0, rz = 0, m) {
    const g = new THREE.BoxGeometry(w, h, d); g.rotateX(rx); g.rotateZ(rz); g.rotateY(ry); g.translate(x, y, z); put(g, hex, m);
  }
  function cyl(rt, rb, h, seg, hex, x, y, z, rx = 0, rz = 0, m, sz = 1) {
    const g = new THREE.CylinderGeometry(rt, rb, h, seg); if (sz !== 1) g.scale(1, 1, sz); if (rx) g.rotateX(rx); if (rz) g.rotateZ(rz); g.translate(x, y, z); put(g, hex, m);
  }
  function ico(r, hex, x, y, z, sy = 1, m, sx = 1) { const g = new THREE.IcosahedronGeometry(r, 0); g.scale(sx, sy, sx); g.translate(x, y, z); put(g, hex, m); }
  function quad(w, h, m, x, y, z, ry = 0, rx = 0, hex = 0xffffff, tile) {
    const g = new THREE.PlaneGeometry(w, h); if (rx) g.rotateX(rx); if (ry) g.rotateY(ry); g.translate(x, y, z); put(g, hex, m, tile);
  }
  // a ground patch at height y (faces up)
  function gnd(x0, z0, x1, z1, y, m, hex, tile) { const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0); g.rotateX(-H); g.translate((x0 + x1) / 2, y, (z0 + z1) / 2); put(g, hex, m, tile); }
  // a raised patch (footpath, path, beds): a slab down into the ground, so its edges never show the sky
  const slab = (x0, z0, x1, z1, y, m, hex, tile) => bb(x0, -0.06, z0, x1, y, z1, hex, m, tile);
  // atlas regions: rg = [x, y, w, h] in canvas px (top-left origin) of an aw x ah texture
  function uvRect(g, rg, aw = 256, ah = 256, flip = false, i0 = 0, i1) {
    const u0 = rg[0] / aw, u1 = (rg[0] + rg[2]) / aw, v0 = 1 - (rg[1] + rg[3]) / ah, v1 = 1 - rg[1] / ah, uv = g.attributes.uv;
    for (let i = i0; i < (i1 ?? uv.count); i++) { const u = flip ? 1 - uv.getX(i) : uv.getX(i); uv.setXY(i, u0 + u * (u1 - u0), v0 + uv.getY(i) * (v1 - v0)); }
  }
  function quadR(w, h, m, rg, x, y, z, ry = 0, rx = 0, hex = 0xffffff, aw = 256, ah = 256, flip = false) {
    const g = new THREE.PlaneGeometry(w, h); uvRect(g, rg, aw, ah, flip);
    if (rx) g.rotateX(rx); if (ry) g.rotateY(ry); g.translate(x, y, z); put(g, hex, m);
  }
  // a box whose every face shows one atlas region (fabric, panels)
  function bbT(x0, y0, z0, x1, y1, z1, rg, m, hex = 0xffffff, aw = 256, ah = 256) {
    const g = new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0); uvRect(g, rg, aw, ah); g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); put(g, hex, m);
  }
  // an arbitrary quad a (bottom-left) b (bottom-right) c (top-right) d (top-left); uvr = [u0, v0, u1, v1] (texture units)
  function quad4(a, b2, c, d, m, hex = 0xffffff, uvr) {
    const g = new THREE.BufferGeometry(), P = [a, b2, c, a, c, d], u0 = uvr ? uvr[0] : 0, v0 = uvr ? uvr[1] : 0, u1 = uvr ? uvr[2] : 1, v1 = uvr ? uvr[3] : 1;
    const U = [u0, v0, u1, v0, u1, v1, u0, v0, u1, v1, u0, v1], pos = new Float32Array(18);
    for (let i = 0; i < 6; i++) { pos[i * 3] = P[i][0]; pos[i * 3 + 1] = P[i][1]; pos[i * 3 + 2] = P[i][2]; }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(U), 2)); g.computeVertexNormals();
    put(g, hex, m);
  }
  const regUV = (rg, aw = 256, ah = 256) => [rg[0] / aw, 1 - (rg[1] + rg[3]) / ah, (rg[0] + rg[2]) / aw, 1 - rg[1] / ah];
  function triUV(a, b2, c, ua, ub, uc, m, hex) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array([a[0], a[1], a[2], b2[0], b2[1], b2[2], c[0], c[1], c[2]]), 3));
    g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([ua[0], ua[1], ub[0], ub[1], uc[0], uc[1]]), 2)); g.computeVertexNormals(); put(g, hex, m);
  }
  // a square rod between two points
  function rod(x0, y0, z0, x1, y1, z1, r, hex, m) {
    vA.set(x1 - x0, y1 - y0, z1 - z0); const len = vA.length(); if (len < 1e-5) return;
    const g = new THREE.BoxGeometry(r, r, len + r * 0.5);
    qA.setFromUnitVectors(ZAX, vA.normalize()); g.applyQuaternion(qA);
    g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); put(g, hex, m);
  }
  // a cylinder whose side UVs repeat (corrugated tank)
  function cylUV(r, h, seg, hex, x, y, z, m, ru, rv) {
    const g = new THREE.CylinderGeometry(r, r, h, seg, 1, true), uv = g.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * ru, uv.getY(i) * rv);
    g.translate(x, y, z); put(g, hex, m);
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
  const at = (x, z, ry = 0, y = 0) => (XF = m4.makeRotationY(ry).setPosition(x, y, z));
  function geoOf(fn, o) { const pd = DEF; DEF = M.vc; const g = part('', fn, null, 0, Object.assign({ floor: false }, o)); DEF = pd; return g.children[0].geometry; }
  function IM(geo, m, list, name, parent) { const im = instanced(geo, m, list); im.name = name; (parent || R.root).add(im); return im; }
  function dyn(im) { im.instanceMatrix.setUsage(THREE.DynamicDrawUsage); im.frustumCulled = false; return im; }
  // a run of alpha-atlas cells along a wall line (x0, z0) -> (x1, z1) between y0 and y1, cells about cw x ch metres
  function alphaRun(x0, z0, x1, z1, y0, y1, rg, cw, ch, hex = 0xffffff) {
    const dx = x1 - x0, dz = z1 - z0, L = Math.hypot(dx, dz), nu = Math.max(1, Math.round(L / cw)), nv = Math.max(1, Math.round((y1 - y0) / ch));
    const w = L / nu, h = (y1 - y0) / nv, ry = Math.atan2(-dz, dx);
    for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
      const u = (i + 0.5) / nu;
      quadR(w + 0.003, h + 0.003, M.alpha, rg, x0 + dx * u, y0 + h * (j + 0.5), z0 + dz * u, ry, 0, hex, 128, 128);
    }
  }

  // ---------------------------------------------------------- painters
  const SANS = 'Arial, "Liberation Sans", "DejaVu Sans", sans-serif', SERIF = 'Georgia, "Liberation Serif", "DejaVu Serif", serif';
  function text(c, s, x, y, px, col, al = 'center', w = 'bold', maxW, fam = SANS) {
    c.font = `${w} ${px}px ${fam}`; c.fillStyle = col; c.textAlign = al; c.textBaseline = 'middle'; c.fillText(s, x, y, maxW);
  }
  // a 3 x 5 pixel font (biro on calendar pages, LCDs, tiny labels): 4 px advance per character
  const PF = {
    A: '010101111101101', M: '1000111011101011000110001', W: '1000110001101011101110001', B: '110101110101110', C: '011100100100011', D: '110101101101110', E: '111100110100111', F: '111100110100100',
    G: '011100101101011', Q: '010101101110011', I: '111010010010111', K: '101101110101101', L: '100100100100111', N: '110101101101101',
    O: '010101101101010', P: '110101110100100', R: '110101110101101', S: '011100010001110', T: '111010010010010', U: '101101101101111',
    V: '101101101101010', Y: '101101010010010', 0: '111101101101111', 1: '010110010010111', 2: '110001010100111', 3: '110001010001110',
    4: '101101111001001', 5: '111100110001110', 6: '011100110101010', 7: '111001010010010', 8: '010101010101010', 9: '010101011001110',
    '(': '010100100100010', ')': '010001001001010', "'": '010010000000000', '.': '000000000000010', ' ': '000000000000000', '-': '000000111000000',
  };
  function pf(c, s, x, y, col, sc = 1) {
    c.fillStyle = col; let cx = x;
    for (const ch of s) { const g = PF[ch] || PF[' '], w = g.length / 5; for (let i = 0; i < g.length; i++) if (g[i] === '1') c.fillRect(cx + (i % w) * sc, y + ((i / w) | 0) * sc, sc, sc); cx += (w + 1) * sc; }
  }
  
  // label / small-art atlas (256 x 256): regions
  const RG = {
    polaroid: [0, 0, 64, 80], xmas: [64, 0, 64, 80], tin: [128, 0, 64, 64], brick: [192, 0, 32, 96], lineok: [224, 0, 32, 16],
    walkman: [0, 80, 64, 48], clock: [64, 80, 32, 32], mug: [96, 80, 32, 16], letter: [96, 96, 32, 16], bay: [128, 64, 64, 48],
    cassettes: [128, 112, 64, 16], books: [192, 96, 64, 32], backyard: [0, 128, 128, 64], facade: [128, 128, 64, 32],
    floral: [192, 128, 64, 64], rug: [128, 160, 64, 64], crochet: [0, 192, 64, 64], towels: [64, 192, 64, 64], white: [249, 249, 6, 6],
  };
  // alpha cut-out atlas (128 x 128)
  const AL = { lattice: [0, 0, 64, 64], dowel: [64, 0, 32, 64], bracket: [96, 0, 32, 32], fret: [0, 64, 64, 64], leaf: [64, 64, 64, 64] };

  function paintAtlas(c) {
    c.fillStyle = '#ffffff'; c.fillRect(0, 0, 256, 256);
    // -- the Polaroid copy (64 x 80): soft image of two figures in polos and a young man, never resolving; '87 in biro
    c.fillStyle = '#f6f4ee'; c.fillRect(0, 0, 64, 80);
    c.save(); c.beginPath(); c.rect(4, 4, 56, 56); c.clip();
    let g = c.createLinearGradient(0, 4, 0, 60); g.addColorStop(0, '#a9c8d6'); g.addColorStop(0.55, '#d8c9a4'); g.addColorStop(1, '#b49a72');
    c.fillStyle = g; c.fillRect(4, 4, 56, 56);
    c.filter = 'blur(1.7px)';
    c.fillStyle = '#7a5e44'; c.fillRect(4, 36, 56, 4); c.fillStyle = '#c8b48c'; c.fillRect(4, 40, 56, 20);
    for (const [x, polo, hh, skin] of [[17, '#23284a', 30, '#d9a983'], [32, '#ece2c8', 25, '#e0b28c'], [47, '#2a5fb0', 29, '#d4a27c']]) {
      c.fillStyle = polo; c.fillRect(x - 6, 60 - hh, 12, hh); c.fillStyle = skin; c.beginPath(); c.arc(x, 60 - hh - 4, 5, 0, TAU); c.fill();
      c.fillStyle = '#4a3424'; c.beginPath(); c.arc(x, 60 - hh - 7, 4.5, PI, TAU); c.fill();
    }
    c.filter = 'none'; c.fillStyle = 'rgba(255,236,200,0.24)'; c.fillRect(4, 4, 56, 56);
    c.restore();
    c.save(); c.translate(47, 70); c.rotate(-0.08); text(c, "'87", 0, 0, 11, '#2a3f8f', 'center', 'italic bold'); c.restore();
    // -- the framed Optus Christmas card 2036 (64 x 80): navy, a thin silver frame, a silver hand-drawn Yes, a star
    c.fillStyle = '#141d3a'; c.fillRect(64, 0, 64, 80);
    c.strokeStyle = '#c8ccd4'; c.lineWidth = 2; c.strokeRect(66, 2, 60, 76);
    c.fillStyle = '#e4e8ee'; c.beginPath();
    for (let k = 0; k < 10; k++) { const a = -H + k * PI / 5, r = k % 2 ? 2.2 : 5; c.lineTo(110 + Math.cos(a) * r, 11 + Math.sin(a) * r); }
    c.fill();
    canvasTex.yes(c, 96 - 16, 16, 20, '#dfe3e8');
    text(c, "Season's", 96, 47, 9, '#d9dde3'); text(c, 'Greetings', 96, 56, 9, '#d9dde3'); text(c, '2036', 96, 65, 9, '#d9dde3');
    text(c, '— The Board', 96, 74, 7, '#b8c0cc', 'center', 'italic', 58, SERIF);
    // -- the biscuit tin lid (64 x 64): red, a crimson rosella on a branch, ASSORTED in cream serif (generic, no brand)
    c.fillStyle = '#8e1c20'; c.fillRect(128, 0, 64, 64); c.fillStyle = '#b8262a'; c.fillRect(130, 2, 60, 60);
    c.strokeStyle = '#d8b46a'; c.lineWidth = 1; c.strokeRect(132.5, 4.5, 55, 55);
    c.fillStyle = '#f3e6c8'; c.beginPath(); c.ellipse(160, 26, 23, 17, 0, 0, TAU); c.fill();
    c.strokeStyle = '#6a4a2a'; c.lineWidth = 2; c.beginPath(); c.moveTo(141, 36); c.quadraticCurveTo(160, 30, 180, 35); c.stroke();
    c.fillStyle = '#4f8a3a'; for (const [x, y, a] of [[145, 33, -0.6], [176, 33, 0.5], [170, 38, 1.2]]) { c.beginPath(); c.ellipse(x, y, 4, 1.8, a, 0, TAU); c.fill(); }
    c.fillStyle = '#2a5fb8'; c.beginPath(); c.moveTo(163, 29); c.lineTo(176, 40); c.lineTo(173, 41); c.closePath(); c.fill();
    c.fillStyle = '#c81e2a'; c.beginPath(); c.ellipse(158, 26, 7, 5, -0.5, 0, TAU); c.fill(); c.beginPath(); c.arc(152, 20, 4, 0, TAU); c.fill();
    c.fillStyle = '#3a78d0'; c.beginPath(); c.arc(151, 22, 1.8, 0, TAU); c.fill();
    c.fillStyle = '#2a5fb8'; c.beginPath(); c.ellipse(161, 27, 5, 3, -0.5, 0, TAU); c.fill();
    c.fillStyle = '#16181c'; for (let k = 0; k < 3; k++) c.fillRect(158 + k * 2, 24 + k, 1, 1); c.fillRect(149, 19, 1, 1);
    c.fillStyle = '#e8c070'; c.fillRect(148, 21, 2, 1);
    text(c, 'ASSORTED', 160, 53, 10, '#f3e6c8', 'center', 'bold', 56, SERIF);
    // -- the 1987 brick phone face (32 x 96): LCD (blank), 15 rubbery keys, a red TEST key
    c.fillStyle = '#3b3e42'; c.fillRect(192, 0, 32, 96);
    c.fillStyle = '#2a2c30'; for (let k = 0; k < 4; k++) c.fillRect(200, 3 + k * 2, 16, 1);
    c.fillStyle = '#1e2420'; c.fillRect(197, 11, 22, 12); c.fillStyle = '#56644a'; c.fillRect(198, 12, 20, 10);
    c.fillStyle = '#4c5842'; c.fillRect(198, 21, 20, 1);
    for (let r = 0; r < 5; r++) for (let k = 0; k < 3; k++) {
      const x = 197 + k * 8, y = 28 + r * 8; c.fillStyle = '#1e2022'; c.fillRect(x, y + 1, 7, 6); c.fillStyle = '#c9cbc6'; c.fillRect(x, y, 7, 6);
      c.fillStyle = '#7a7c78'; c.fillRect(x + 3, y + 2, 1, 2);
    }
    c.fillStyle = '#7a1a18'; c.fillRect(197, 72, 22, 9); c.fillStyle = '#c8302c'; c.fillRect(197, 71, 22, 9); pf(c, 'TEST', 201, 73, '#ffffff');
    c.fillStyle = '#2a2c30'; for (let k = 0; k < 3; k++) c.fillRect(204 + k * 3, 88, 1, 1);
    // -- the LCD lit: LINE OK (32 x 16)
    c.fillStyle = '#9fd86a'; c.fillRect(224, 0, 32, 16); c.fillStyle = '#b8ec84'; c.fillRect(225, 1, 30, 14);
    pf(c, 'LINE OK', 226, 6, '#16240e');
    // -- the Walkman's top (64 x 48): the window with the cassette (PUDDING (COPY 4)), the tiny speaker grille, buttons
    c.fillStyle = '#6f86a0'; c.fillRect(0, 80, 64, 48); c.fillStyle = '#7f96b0'; c.fillRect(0, 80, 64, 2);
    c.fillStyle = '#20262c'; c.fillRect(2, 86, 42, 34); c.fillStyle = '#8f969c'; c.fillRect(4, 88, 38, 30);
    c.fillStyle = '#f4f1e8'; c.fillRect(5, 89, 36, 14);
    pf(c, 'PUDDING', 7, 90, '#1f3a93'); pf(c, '(COPY 4)', 7, 97, '#1f3a93');
    c.fillStyle = '#4a2e1c'; c.fillRect(14, 106, 18, 8);
    c.fillStyle = '#1a1c1e'; c.beginPath(); c.arc(14, 110, 4.5, 0, TAU); c.arc(32, 110, 4.5, 0, TAU); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(4, 88, 38, 2);
    c.fillStyle = '#4a5c70'; c.fillRect(47, 86, 15, 34);
    c.fillStyle = '#1e2630'; for (let y = 88; y < 118; y += 4) for (let x = 49; x < 61; x += 4) c.fillRect(x, y, 2, 2);
    c.fillStyle = '#c8ccd2'; for (let k = 0; k < 4; k++) c.fillRect(6 + k * 9, 122, 7, 4);
    // -- the mantel clock dial (32 x 32)
    c.fillStyle = '#5a3a24'; c.fillRect(64, 80, 32, 32);
    c.fillStyle = '#c9a54a'; c.beginPath(); c.arc(80, 96, 15, 0, TAU); c.fill(); c.fillStyle = '#f6f0dc'; c.beginPath(); c.arc(80, 96, 13, 0, TAU); c.fill();
    c.fillStyle = '#2a2420'; for (let k = 0; k < 12; k++) { const a = k * TAU / 12; c.fillRect(Math.round(80 + Math.sin(a) * 11) - (k % 3 ? 0 : 1), Math.round(96 - Math.cos(a) * 11) - (k % 3 ? 0 : 1), k % 3 ? 1 : 2, k % 3 ? 1 : 2); }
    // -- the Rue mug wrap (32 x 16): I'M ON MUGS
    c.fillStyle = '#ffffff'; c.fillRect(96, 80, 32, 16); pf(c, "I'M ON", 99, 82, '#141d3a'); pf(c, 'MUGS', 103, 89, '#141d3a');   // M is 5 px wide
    // -- the letterbox number (32 x 16): 23
    c.fillStyle = '#efe6d0'; c.fillRect(96, 96, 32, 16); pf(c, '23', 104, 99, '#9b3b2e', 2);
    // -- framed watercolour of the bay and the jetty (64 x 48)
    c.fillStyle = '#3a2618'; c.fillRect(128, 64, 64, 48); c.fillStyle = '#f2ead6'; c.fillRect(131, 67, 58, 42);
    c.save(); c.beginPath(); c.rect(134, 70, 52, 36); c.clip();
    g = c.createLinearGradient(0, 70, 0, 106); g.addColorStop(0, '#bcd8e8'); g.addColorStop(0.45, '#e6eef0'); g.addColorStop(0.5, '#7fb4cc'); g.addColorStop(1, '#4a8fb4');
    c.fillStyle = g; c.fillRect(134, 70, 52, 36);
    c.filter = 'blur(0.6px)'; c.fillStyle = '#a8b8a0'; c.fillRect(134, 86, 52, 2);
    c.fillStyle = '#6a5038'; c.fillRect(140, 92, 46, 2); for (let x = 142; x < 186; x += 5) c.fillRect(x, 92, 1, 7);
    c.fillStyle = '#f8f6f0'; c.beginPath(); c.moveTo(150, 88); c.lineTo(153, 82); c.lineTo(155, 88); c.fill(); c.beginPath(); c.moveTo(168, 87); c.lineTo(170, 83); c.lineTo(172, 87); c.fill();
    c.filter = 'none'; c.restore();
    // -- cassette spines (64 x 16) and book spines (64 x 32)
    srand(17);
    for (let x = 128, i = 0; x < 192; x += 8, i++) { c.fillStyle = ['#2a2c30', '#e8e4d8', '#3a5a8a', '#c8302c', '#2a2c30', '#d8c8a0', '#4a6a4a', '#e8e4d8'][i % 8]; c.fillRect(x, 112, 8, 16); c.fillStyle = '#f4f1e8'; c.fillRect(x + 1, 116, 6, 3); c.fillStyle = '#1f3a93'; c.fillRect(x + 2, 117, 3, 1); c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(x + 7, 112, 1, 16); }
    for (let x = 192; x < 256;) { const w = 4 + ((rnd() * 4) | 0), h = 22 + ((rnd() * 10) | 0); c.fillStyle = ['#7a2e2a', '#2f4a6a', '#4a6a3a', '#c8b48c', '#6a4a7a', '#8a6a3a', '#2a3a3a', '#b8a080'][(rnd() * 8) | 0]; c.fillRect(x, 128 - h, w, h); c.fillStyle = 'rgba(240,230,200,0.55)'; c.fillRect(x + 1, 128 - h + 4, w - 2, 1); c.fillRect(x + 1, 124, w - 2, 1); x += w; }
    // -- the backyard through the kitchen louvres (128 x 64): mango tree, a shed, the neighbour's red roof
    g = c.createLinearGradient(0, 128, 0, 176); g.addColorStop(0, '#8fcff6'); g.addColorStop(1, '#d9eef6'); c.fillStyle = g; c.fillRect(0, 128, 128, 64);
    c.fillStyle = '#f0e8d6'; c.fillRect(84, 150, 44, 22); c.fillStyle = '#a8443a'; c.beginPath(); c.moveTo(78, 152); c.lineTo(104, 138); c.lineTo(128, 140); c.lineTo(128, 152); c.fill();
    c.fillStyle = '#3c4a56'; c.fillRect(92, 156, 8, 7); c.fillRect(110, 156, 8, 7);
    c.fillStyle = '#b8bec2'; c.fillRect(4, 156, 26, 16); c.fillStyle = '#9aa2a8'; c.beginPath(); c.moveTo(2, 157); c.lineTo(17, 150); c.lineTo(32, 157); c.fill();
    c.fillStyle = '#5a4434'; c.fillRect(56, 160, 6, 14);
    c.fillStyle = '#2f5a2c'; for (const [x, y, r] of [[59, 150, 18], [46, 156, 11], [72, 154, 12], [60, 140, 11], [50, 146, 9], [70, 144, 9]]) { c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); }
    c.fillStyle = '#3f7038'; for (const [x, y, r] of [[54, 144, 6], [66, 147, 6], [62, 136, 5]]) { c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); }
    c.fillStyle = '#9c8f7a'; c.fillRect(0, 170, 128, 12); c.fillStyle = '#8a7d66'; for (let x = 0; x < 128; x += 5) c.fillRect(x, 170, 1, 12);
    c.fillStyle = '#90b25c'; c.fillRect(0, 182, 128, 10);
    // -- a neighbour's facade (64 x 32, tinted per instance): weatherboards, two windows, a door
    c.fillStyle = '#f4f4f0'; c.fillRect(128, 128, 64, 32); c.fillStyle = '#d8d8d2'; for (let y = 131; y < 160; y += 3) c.fillRect(128, y, 64, 1);
    for (const x of [134, 170]) { c.fillStyle = '#ffffff'; c.fillRect(x - 1, 135, 20, 14); c.fillStyle = '#3c4a56'; c.fillRect(x + 1, 137, 16, 10); c.fillStyle = '#ffffff'; c.fillRect(x + 8, 137, 1, 10); }
    c.fillStyle = '#ffffff'; c.fillRect(155, 140, 12, 20); c.fillStyle = '#5a4434'; c.fillRect(157, 142, 8, 18);
    // -- faded rose floral (64 x 64): Rue's armchair
    c.fillStyle = '#e2c4b8'; c.fillRect(192, 128, 64, 64); srand(23);
    for (let i = 0; i < 26; i++) { const x = 192 + rnd() * 64, y = 128 + rnd() * 64; c.fillStyle = '#9fae8c'; c.beginPath(); c.ellipse(x + 4, y + 2, 4, 1.6, rnd() * PI, 0, TAU); c.fill(); }
    for (let i = 0; i < 18; i++) { const x = 194 + rnd() * 60, y = 130 + rnd() * 60, r = 2.5 + rnd() * 2.5; c.fillStyle = '#b77870'; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.fillStyle = '#d29a90'; c.beginPath(); c.arc(x - 0.6, y - 0.6, r * 0.5, 0, TAU); c.fill(); }
    // -- the rug under the coffee table (64 x 64)
    c.fillStyle = '#6e2622'; c.fillRect(128, 160, 64, 64); c.fillStyle = '#e6d6b0'; c.fillRect(131, 163, 58, 58); c.fillStyle = '#9a3b33'; c.fillRect(133, 165, 54, 54);
    c.fillStyle = '#28345a'; c.beginPath(); c.moveTo(160, 172); c.lineTo(178, 192); c.lineTo(160, 212); c.lineTo(142, 192); c.fill();
    c.fillStyle = '#e6d6b0'; c.beginPath(); c.moveTo(160, 182); c.lineTo(169, 192); c.lineTo(160, 202); c.lineTo(151, 192); c.fill();
    c.fillStyle = '#c8a050'; for (const [x, y] of [[138, 170], [182, 170], [138, 214], [182, 214]]) c.fillRect(x - 2, y - 2, 4, 4);
    c.fillStyle = '#6e2622'; c.fillRect(158, 190, 4, 4);
    // -- the crocheted rug (64 x 64): granny squares
    const GR = ['#d8a03a', '#c8582c', '#6a4a2a', '#efe2c4', '#3a8a8a', '#c87a8a', '#7a9a4a'];
    srand(41);
    for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) {
      const x = k * 16, y = 192 + r * 16; c.fillStyle = '#20201e'; c.fillRect(x, y, 16, 16);
      for (let s = 0; s < 3; s++) { c.fillStyle = GR[((rnd() * GR.length) | 0)]; c.fillRect(x + 1 + s * 2, y + 1 + s * 2, 14 - s * 4, 14 - s * 4); }
    }
    // -- tea towels (64 x 64): three designs side by side
    c.fillStyle = '#f2efe6'; c.fillRect(64, 192, 21, 64); c.fillStyle = '#c8302c'; c.fillRect(64, 198, 21, 3); c.fillRect(64, 246, 21, 3);
    c.fillStyle = '#e8eef2'; c.fillRect(85, 192, 21, 64); c.fillStyle = '#3a6ab0'; for (let x = 85; x < 106; x += 4) c.fillRect(x, 192, 2, 64); for (let y = 192; y < 256; y += 4) c.fillRect(85, y, 21, 1);
    c.fillStyle = '#f0e2c0'; c.fillRect(106, 192, 22, 64); c.fillStyle = '#d07a2a'; c.fillRect(106, 200, 22, 2); c.fillStyle = '#4a7a3a'; c.beginPath(); c.arc(117, 224, 6, 0, TAU); c.fill(); pf(c, 'QLD', 111, 236, '#7a3a20');
    c.fillStyle = '#ffffff'; c.fillRect(248, 248, 8, 8);
  }

  function paintAlpha(c) {
    c.clearRect(0, 0, 128, 128);
    // lattice: diagonal laths both ways, every 16 px (one cell = 0.6 m)
    c.save(); c.beginPath(); c.rect(0, 0, 64, 64); c.clip();
    c.lineWidth = 4.5; c.strokeStyle = '#d6d6d0';
    for (let k = -64; k <= 64; k += 16) { c.beginPath(); c.moveTo(k, 64); c.lineTo(k + 64, 0); c.stroke(); }
    c.strokeStyle = '#f6f6f2';
    for (let k = -64; k <= 64; k += 16) { c.beginPath(); c.moveTo(k, 0); c.lineTo(k + 64, 64); c.stroke(); }
    c.restore();
    // dowels: four turned dowels (32 x 64)
    for (let i = 0; i < 4; i++) {
      const x = 66 + i * 8, gr = c.createLinearGradient(x, 0, x + 4, 0); gr.addColorStop(0, '#cfcfca'); gr.addColorStop(0.45, '#ffffff'); gr.addColorStop(1, '#bdbdb8');
      c.fillStyle = gr; c.fillRect(x, 0, 4, 64);
      c.fillStyle = '#e4e4de'; c.fillRect(x - 1, 14, 6, 2); c.fillRect(x - 1, 48, 6, 2);
    }
    // post bracket (32 x 32): the corner at the top-left, a concave scroll
    c.fillStyle = '#f4f4f0'; c.beginPath(); c.moveTo(96, 0); c.lineTo(128, 0); c.lineTo(128, 4); c.quadraticCurveTo(102, 5, 100, 32); c.lineTo(96, 32); c.closePath(); c.fill();
    c.globalCompositeOperation = 'destination-out';
    c.beginPath(); c.arc(104, 7, 2.6, 0, TAU); c.arc(112, 5, 1.6, 0, TAU); c.arc(101, 16, 1.6, 0, TAU); c.fill();
    c.globalCompositeOperation = 'source-over';
    // fretwork (64 x 64): a half sunburst rising from the bottom centre, C-scrolls either side, rails top and bottom
    c.fillStyle = '#ffffff'; c.fillRect(0, 64, 64, 4); c.fillRect(0, 124, 64, 4);
    c.save(); c.translate(32, 124);
    for (let k = 0; k < 9; k++) { const a = PI + (k + 0.5) * PI / 9; c.beginPath(); c.moveTo(Math.cos(a - 0.07) * 6, Math.sin(a - 0.07) * 6); c.lineTo(Math.cos(a) * 26, Math.sin(a) * 26); c.lineTo(Math.cos(a + 0.07) * 6, Math.sin(a + 0.07) * 6); c.fill(); }
    c.beginPath(); c.arc(0, 0, 7, PI, TAU); c.fill();
    c.lineWidth = 2.5; c.strokeStyle = '#ffffff'; c.beginPath(); c.arc(0, 0, 28, PI, TAU); c.stroke();
    c.restore();
    c.lineWidth = 3; c.strokeStyle = '#ffffff';
    for (const s of [-1, 1]) {
      const cx = 32 + s * 24;
      c.beginPath(); c.arc(cx, 82, 7, 0, TAU); c.stroke(); c.beginPath(); c.arc(cx, 106, 7, 0, TAU); c.stroke();
      c.beginPath(); c.moveTo(cx, 89); c.lineTo(cx, 99); c.stroke();
      c.fillStyle = '#ffffff'; c.beginPath(); c.arc(cx, 82, 2, 0, TAU); c.arc(cx, 106, 2, 0, TAU); c.fill();
    }
    for (let x = 2; x < 64; x += 6) c.fillRect(x, 68, 3, 4);
    // frangipani leaf rosette (64 x 64): seven paddle leaves round the tip
    c.save(); c.translate(96, 96);
    for (let k = 0; k < 7; k++) {
      c.save(); c.rotate(k * TAU / 7 + 0.2);
      c.fillStyle = k % 2 ? '#2f6a35' : '#367a3c'; c.beginPath(); c.ellipse(0, -16, 6.5, 15, 0, 0, TAU); c.fill();
      c.fillStyle = '#5a9a4e'; c.fillRect(-0.6, -29, 1.2, 24);
      c.restore();
    }
    c.fillStyle = '#2a5a2e'; c.beginPath(); c.arc(0, 0, 4, 0, TAU); c.fill();
    c.restore();
  }

  // the corkboard: 15 columns of month pages (2026 … 2040), 12 per column, shingled; every Sunday from Nov 2026 to
  // 17 Dec 2034 has a red tick and a tiny blue LADS; Sun 24 / 31 Dec 2034 and every page after are blank. '2031': the
  // first six columns and a big December 2031 page on top (every Sunday ticked LADS).
  const sundays = (y, m) => { const out = [], first = new Date(y, m, 1).getDay(), dim = new Date(y, m + 1, 0).getDate(); for (let d = 1 + ((7 - first) % 7); d <= dim; d += 7) out.push(d); return out; };
  function page(c, x, y, yr, mo, tickTo, w = 15, h = 14) {
    c.fillStyle = 'rgba(40,24,10,0.35)'; c.fillRect(x + 1, y + 1, w, h);
    c.fillStyle = '#fbfaf4'; c.fillRect(x, y, w, h);
    c.fillStyle = mo === 11 ? '#a8564e' : '#8a94a8'; c.fillRect(x, y, w, 1); c.fillStyle = '#e8e6dc'; c.fillRect(x, y + 1, w, 1);
    const S = sundays(yr, mo);
    for (let k = 0; k < S.length; k++) {
      const d = yr * 10000 + (mo + 1) * 100 + S[k], px = x + k * 3;
      if (d >= 20261101 && d <= tickTo) {
        c.fillStyle = '#c8302c'; c.fillRect(px, y + 4, 1, 1); c.fillRect(px + 1, y + 5, 1, 1); c.fillRect(px + 2, y + 3, 1, 2);
        c.fillStyle = '#2a3f8f'; c.fillRect(px, y + 7, 2, 1);
      } else { c.fillStyle = '#dcd8cc'; c.fillRect(px, y + 5, 2, 1); }
    }
    if (h > 9) { c.fillStyle = '#e4e0d4'; for (let r = 0; r < 2; r++) c.fillRect(x + 1, y + 10 + r * 2, w - 2, 1); }
    c.fillStyle = ['#d8302c', '#2a5fb8', '#3a8a4a', '#f4f4f0'][(yr + mo) % 4]; c.fillRect(x + 7, y, 2, 2);
  }
  function paintCork(c, era) {
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.fillStyle = '#c69a62'; c.fillRect(0, 0, 256, 128);
    srand(19); for (let i = 0; i < 900; i++) { const v = rnd(); c.fillStyle = v > 0.66 ? '#b0844e' : v > 0.33 ? '#d6ac74' : '#a87a46'; c.fillRect((rnd() * 256) | 0, (rnd() * 128) | 0, 1, 1); }
    const last = era === '2031' ? 2031 : 2040, tickTo = era === '2031' ? 20311221 : 20341217;
    for (let yr = 2026; yr <= last; yr++) {
      const col = yr - 2026, x0 = 8 + col * 16;
      pf(c, String(yr).slice(2), x0 + 4, 0, 'rgba(60,36,20,0.55)');
      for (let mo = 0; mo < 12; mo++) {
        const loose = yr === 2040 && mo > 5;   // the 2040 column: the second half hangs crooked off fewer pins
        page(c, x0 + (loose ? 1 + (mo & 1) : 0), 6 + mo * 9 + (loose ? 1 : 0), yr, mo, tickTo);
      }
    }
    if (era === '2031') {   // December 2031, the newest page, pinned on top and big enough to read
      const x = 102, y = 38, w = 56, h = 47;
      c.fillStyle = 'rgba(40,24,10,0.4)'; c.fillRect(x + 2, y + 2, w, h); c.fillStyle = '#fbfaf4'; c.fillRect(x, y, w, h);
      c.fillStyle = '#8a3a34'; c.fillRect(x, y, w, 8); pf(c, 'DEC 2031', x + 13, y + 2, '#ffffff');
      const S = sundays(2031, 11);
      for (let k = 0; k < S.length; k++) {
        const ry = y + 11 + k * 7;
        c.fillStyle = '#e4e0d4'; c.fillRect(x + 1, ry + 6, w - 2, 1);
        for (let d = 1; d < 7; d++) { c.fillStyle = '#c8c4b8'; c.fillRect(x + 22 + d * 5, ry + 2, 2, 1); }
        if (2031 * 10000 + 1200 + S[k] <= 20311221) {
          c.fillStyle = '#c8302c'; c.fillRect(x + 2, ry + 2, 1, 1); c.fillRect(x + 3, ry + 3, 1, 1); c.fillRect(x + 4, ry + 1, 1, 2);
          pf(c, 'LADS', x + 7, ry, '#2a3f8f');
        }
      }
      c.fillStyle = '#d8302c'; c.fillRect(x + 27, y - 1, 3, 3);
    }
  }

  // ---------------------------------------------------------- textures (built once, keyed)
  function textures() {
    if (T) return T;
    T = {};
    const K = (k, o) => Object.assign({ key: 'rue_house_' + k, nearest: true }, o);
    T.atlas = canvasTex(256, 256, paintAtlas, K('atlas'));
    T.alpha = canvasTex(128, 128, paintAlpha, K('alpha'));
    T.cork = canvasTex(256, 128, (c) => paintCork(c, '2040'), K('cork')); R.corkEra = '2040';
    T.vj = canvasTex(64, 64, (c, w, h) => {
      c.fillStyle = '#f2f2ee'; c.fillRect(0, 0, w, h);
      srand(3); for (let i = 0; i < 140; i++) { c.fillStyle = rnd() > 0.5 ? 'rgba(0,0,0,0.035)' : 'rgba(255,255,255,0.06)'; c.fillRect((rnd() * w) | 0, (rnd() * h) | 0, 1, 2 + ((rnd() * 6) | 0)); }
      for (let x = 0; x < w; x += 16) { c.fillStyle = 'rgba(70,60,48,0.38)'; c.fillRect(x, 0, 1, h); c.fillStyle = 'rgba(255,255,255,0.55)'; c.fillRect(x + 1, 0, 1, h); c.fillStyle = 'rgba(70,60,48,0.12)'; c.fillRect(x + 15, 0, 1, h); }
    }, K('vj', { repeat: [1, 1] }));
    T.wb = canvasTex(64, 64, (c, w, h) => {
      for (let y = 0; y < h; y += 16) {
        const g = c.createLinearGradient(0, y, 0, y + 16); g.addColorStop(0, '#fbfaf6'); g.addColorStop(0.8, '#ecebe4'); g.addColorStop(1, '#e2e0d6');
        c.fillStyle = g; c.fillRect(0, y, w, 16); c.fillStyle = '#b4ac9c'; c.fillRect(0, y + 14, w, 2); c.fillStyle = '#ffffff'; c.fillRect(0, y, w, 1);
      }
      srand(4); for (let i = 0; i < 40; i++) { c.fillStyle = 'rgba(120,110,90,0.08)'; c.fillRect((rnd() * w) | 0, (rnd() * h) | 0, 6, 1); }
    }, K('wb', { repeat: [1, 1] }));
    T.boards = canvasTex(64, 64, (c, w, h) => {
      srand(6);
      for (let y = 0; y < h; y += 8) {
        const v = 226 + ((rnd() * 22) | 0); c.fillStyle = `rgb(${v},${v - 6},${v - 16})`; c.fillRect(0, y, w, 8);
        for (let i = 0; i < 5; i++) { c.fillStyle = 'rgba(110,80,50,0.12)'; c.fillRect((rnd() * w) | 0, y + 1 + ((rnd() * 6) | 0), 8 + ((rnd() * 18) | 0), 1); }
        c.fillStyle = '#8a7660'; c.fillRect(0, y, w, 1);
        const jx = (rnd() * w) | 0; c.fillStyle = '#9a8670'; c.fillRect(jx, y, 1, 8);
      }
    }, K('boards', { repeat: [1, 1] }));
    T.iron = canvasTex(64, 64, (c, w, h) => {
      for (let x = 0; x < w; x++) { const v = Math.round(200 + 50 * Math.cos(x / 8 * TAU)); c.fillStyle = `rgb(${v},${v},${v})`; c.fillRect(x, 0, 1, h); }
      srand(8); for (let i = 0; i < 30; i++) { c.fillStyle = 'rgba(90,60,40,0.12)'; c.fillRect((rnd() * w) | 0, (rnd() * h) | 0, 2, 3); }
      c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(0, 0, w, 1);
    }, K('iron', { repeat: [1, 1] }));
    T.grass = canvasTex(64, 64, (c, w, h) => {
      c.fillStyle = '#e8eadc'; c.fillRect(0, 0, w, h);
      srand(9); for (let i = 0; i < 700; i++) { const v = rnd(); c.fillStyle = v > 0.7 ? '#c2cca6' : v > 0.4 ? '#f6f4e6' : v > 0.15 ? '#d4dab8' : '#f2e6c0'; c.fillRect((rnd() * w) | 0, (rnd() * h) | 0, 1, 2); }
    }, K('grass', { repeat: [1, 1] }));
    T.conc = canvasTex(64, 64, (c, w, h) => {
      c.fillStyle = '#efefec'; c.fillRect(0, 0, w, h);
      srand(10); for (let i = 0; i < 500; i++) { const v = rnd(); c.fillStyle = v > 0.5 ? '#e0e0dc' : '#f8f8f6'; c.fillRect((rnd() * w) | 0, (rnd() * h) | 0, 1, 1); }
      c.fillStyle = '#c8c8c2'; c.fillRect(0, 0, w, 1); c.fillRect(0, 0, 1, h);
    }, K('conc', { repeat: [1, 1] }));
    T.ripple = canvasTex(128, 128, (c, w, h) => {
      c.fillStyle = '#e6eef2'; c.fillRect(0, 0, w, h);
      srand(12);
      for (let i = 0; i < 70; i++) { const x = rnd() * w, y = rnd() * h, l = 8 + rnd() * 22; c.fillStyle = rnd() > 0.45 ? 'rgba(255,255,255,0.85)' : 'rgba(150,180,200,0.55)'; c.fillRect(x, y, l, 1); if (x + l > w) c.fillRect(x - w, y, l, 1); }
    }, K('ripple', { repeat: [1, 1] }));
    T.louvre = canvasTex(64, 32, (c, w, h) => {
      c.fillStyle = '#000000'; c.fillRect(0, 0, w, h);
      for (let i = 0; i < 6; i++) { const y = 1 + i * 5.33; for (let k = 0; k < 4; k++) { const v = [60, 150, 150, 60][k]; c.fillStyle = `rgb(${v},${v},${v})`; c.fillRect(2, Math.round(y + k), w - 4, 1); } }
      const g = c.createLinearGradient(0, 0, w, 0); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(0.08, 'rgba(0,0,0,0)'); g.addColorStop(0.92, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,1)');
      c.fillStyle = g; c.fillRect(0, 0, w, h);
    }, { key: 'rue_house_louvre' });
    T.haze = canvasTex(4, 64, (c, w, h) => { const g = c.createLinearGradient(0, h, 0, 0); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.35, 'rgba(255,255,255,0.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); }, { key: 'rue_house_haze' });
    T.halo = canvasTex(64, 64, (c, w, h) => { const g = c.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,0.9)'); g.addColorStop(0.25, 'rgba(255,250,230,0.35)'); g.addColorStop(1, 'rgba(255,250,230,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); }, { key: 'rue_house_halo' });
    T.cloud = canvasTex(128, 64, (c, w, h) => {
      c.clearRect(0, 0, w, h); c.filter = 'blur(2px)';
      srand(14);
      for (let i = 0; i < 16; i++) { const x = 18 + rnd() * 92, y = 22 + rnd() * 22, r = 8 + rnd() * 14; const g = c.createLinearGradient(0, y - r, 0, y + r); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#d4dce4'); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); }
      c.fillStyle = '#c8d2dc'; c.fillRect(16, 46, 96, 6);
      c.filter = 'none';
    }, { key: 'rue_house_cloud' });
    T.storm = canvasTex(128, 128, (c, w, h) => {   // a cumulonimbus: the tower, the anvil spreading flat at the top, a pale rim
      c.clearRect(0, 0, w, h); c.filter = 'blur(1.5px)';
      srand(15);
      c.fillStyle = '#9a9a9a';
      for (let i = 0; i < 22; i++) { const y = 46 + rnd() * 78, x = 64 + (rnd() - 0.5) * (30 + (y - 46) * 0.5), r = 12 + rnd() * 14; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); }
      c.beginPath(); c.ellipse(64, 34, 58, 13, 0, 0, TAU); c.fill(); c.beginPath(); c.ellipse(78, 28, 46, 9, 0, 0, TAU); c.fill();
      c.beginPath(); c.moveTo(30, 40); c.quadraticCurveTo(64, 52, 98, 40); c.lineTo(84, 70); c.lineTo(44, 70); c.fill();
      c.globalCompositeOperation = 'source-atop';
      const g = c.createLinearGradient(0, 18, 0, 128); g.addColorStop(0, '#ffffff'); g.addColorStop(0.12, '#c4c4c4'); g.addColorStop(0.5, '#8c8c8c'); g.addColorStop(1, '#6c6c6c');
      c.fillStyle = g; c.fillRect(0, 0, w, h);
      c.fillStyle = 'rgba(255,255,255,0.55)'; for (let i = 0; i < 12; i++) { const x = 14 + rnd() * 100; c.beginPath(); c.arc(x, 24 + rnd() * 10, 5 + rnd() * 6, 0, TAU); c.fill(); }
      c.globalCompositeOperation = 'destination-out';
      const f = c.createLinearGradient(0, 128, 0, 92); f.addColorStop(0, 'rgba(0,0,0,1)'); f.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = f; c.fillRect(0, 92, w, 36);
      c.globalCompositeOperation = 'source-over'; c.filter = 'none';
    }, { key: 'rue_house_storm' });
    return T;
  }

  // ---------------------------------------------------------- materials (cached: mat()/matTex(), or created once here)
  function skyMats() {
    if (SKY) return SKY;
    const B = (o) => new THREE.MeshBasicMaterial(Object.assign({ fog: false }, o)), ADD = THREE.AdditiveBlending;
    SKY = {
      land: B({ vertexColors: true, side: DS }),
      skirt: B({ color: 0xd6e8ee, side: DS }),
      haze: B({ map: T.haze, transparent: true, depthWrite: false, side: DS, color: 0xd6e8ee }),
      sun: B({ color: 0xfffbea }),
      halo: B({ map: T.halo, color: 0xfff2c8, transparent: true, opacity: 0.9, depthWrite: false, blending: ADD }),
      cloud: B({ map: T.cloud, transparent: true, depthWrite: false, side: DS }),
      storm: B({ map: T.storm, vertexColors: true, transparent: true, depthWrite: false, side: DS }),
      louvre: new THREE.MeshBasicMaterial({ map: T.louvre, color: 0xffe8c0, transparent: true, opacity: 0.35, depthWrite: false, blending: ADD,
        polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }),
    };
    return SKY;
  }
  function initMats() {
    const alpha = mat(0xffffff, { map: T.alpha, side: DS, key: 'rue_house_alpha' }); alpha.alphaTest = 0.5;
    M = {
      vc: mat(0xffffff), vcIn: mat(0xffffff, { key: 'rue_house_in' }),
      atlas: matTex(T.atlas), atlasIn: matTex(T.atlas, { key: 'rue_house_atlas_in' }), lit: matTex(T.atlas, { emissive: 0xffffff, key: 'rue_house_lit' }),
      alpha, glass: mat(0xcfe8f0, { transparent: true, opacity: 0.25, side: DS }),
      mesh: mat(0x30363c, { transparent: true, opacity: 0.55, side: DS, key: 'rue_house_mesh' }),
      glow: mat(0x000000, { emissive: 0x9fdcff, emissiveIntensity: 1, key: 'rue_house_glow' }),
      led: mat(0x000000, { emissive: 0xff3020, emissiveIntensity: 1.4, key: 'rue_house_led' }),
      vj: matTex(T.vj, { emissive: VJ_E.getHex(), key: 'rue_house_vj' }), wb: matTex(T.wb), boards: matTex(T.boards), boardsIn: matTex(T.boards, { key: 'rue_house_boards_in' }),
      iron: matTex(T.iron), grass: matTex(T.grass), conc: matTex(T.conc), water: matTex(T.ripple), cork: matTex(T.cork, { key: 'rue_house_cork' }),
    };
    M.ceilV = mat(0xffffff, { emissive: CEIL_V_E.getHex(), key: 'rue_house_ceil_v' });       // verandah underside, eave soffits
    M.ceilIn = matTex(T.vj, { emissive: CEIL_IN_E.getHex(), key: 'rue_house_ceil_in' });     // the rooms' VJ ceilings (the VJ map is the emissive map too)
    M.dim = [M.vcIn, M.atlasIn, M.vj, M.boardsIn, M.cork, M.ceilIn];   // the interior's materials: dimmed under the exterior presets
    skyMats();
  }

  // ---------------------------------------------------------- reusable models (into the current builder)
  // an armchair at the local origin facing +Z (seat top 0.45): fabric = colour or atlas region
  function armchair(x, z, ry, hex, rg) {
    at(x, z, ry, 2.40);
    const fab = (x0, y0, z0, x1, y1, z1) => (rg ? bbT(x0, y0, z0, x1, y1, z1, rg, M.atlasIn) : bb(x0, y0, z0, x1, y1, z1, hex));
    for (const [lx, lz] of [[-0.32, -0.3], [0.32, -0.3], [-0.32, 0.3], [0.32, 0.3]]) bb(lx - 0.03, 0, lz - 0.03, lx + 0.03, 0.12, lz + 0.03, STAIN);
    fab(-0.39, 0.12, -0.34, 0.39, 0.36, 0.38);
    fab(-0.29, 0.36, -0.22, 0.29, 0.45, 0.37);
    fab(-0.39, 0.36, -0.36, 0.39, 0.98, -0.2);
    fab(-0.33, 0.85, -0.3, 0.33, 1.02, -0.18);
    fab(-0.39, 0.36, -0.3, -0.28, 0.62, 0.38); fab(0.28, 0.36, -0.3, 0.39, 0.62, 0.38);
    if (!rg) { bb(-0.395, 0.6, 0.3, -0.275, 0.64, 0.39, 0x3a2a20); bb(0.275, 0.6, 0.3, 0.395, 0.64, 0.39, 0x3a2a20); }
    XF = null;
  }
  // a louvre bank in the wall plane z = zc: glass slats (open a little), clips, mullions, white frame through the wall
  function louvres(x0, x1, y0, y1, z0, z1, n = 3) {
    const zc = (z0 + z1) / 2, w = x1 - x0, slats = Math.round((y1 - y0) / 0.1);
    bb(x0 - 0.07, y0 - 0.05, z0 - 0.02, x0, y1 + 0.05, z1 + 0.02, TRIM); bb(x1, y0 - 0.05, z0 - 0.02, x1 + 0.07, y1 + 0.05, z1 + 0.02, TRIM);
    bb(x0 - 0.07, y1, z0 - 0.02, x1 + 0.07, y1 + 0.07, z1 + 0.02, TRIM); bb(x0 - 0.07, y0 - 0.06, z0 - 0.02, x1 + 0.07, y0, z1 + 0.02, TRIM);
    for (let k = 1; k < n; k++) { const mx = x0 + w * k / n; bb(mx - 0.025, y0, zc - 0.04, mx + 0.025, y1, zc + 0.04, TRIM); }
    for (let k = 0; k < n; k++) {
      const a = x0 + w * k / n + 0.03, c = x0 + w * (k + 1) / n - 0.03;
      for (let i = 0; i < slats; i++) { const y = y0 + 0.05 + i * (y1 - y0) / slats; boxR(c - a, 0.1, 0.005, 0xffffff, (a + c) / 2, y, zc, -0.5, 0, 0, M.glass); }
      bb(a - 0.012, y0, zc - 0.012, a, y1, zc + 0.012, 0xa8acb0); bb(c, y0, zc - 0.012, c + 0.012, y1, zc + 0.012, 0xa8acb0);
    }
  }
  // a fake window on an outside wall (frame, dark glass, sill, iron hood on brackets): nrm = +1/-1 along the axis
  function sideWindow(axis, wpos, c, w, y0, y1, nrm) {
    const p = (u, v, d) => (axis === 'x' ? [wpos + d * nrm, v, u] : [u, v, wpos + d * nrm]);
    const B = (u0, v0, d0, u1, v1, d1, hex, m) => { const a = p(u0, v0, d0), q = p(u1, v1, d1); bb(Math.min(a[0], q[0]), Math.min(a[1], q[1]), Math.min(a[2], q[2]), Math.max(a[0], q[0]), Math.max(a[1], q[1]), Math.max(a[2], q[2]), hex, m); };
    B(c - w / 2 - 0.08, y0 - 0.06, 0, c + w / 2 + 0.08, y1 + 0.08, 0.04, TRIM);
    B(c - w / 2, y0, 0.04, c + w / 2, y1, 0.045, 0x34424e);
    B(c - 0.02, y0, 0.04, c + 0.02, y1, 0.06, TRIM); B(c - w / 2, (y0 + y1) / 2 - 0.02, 0.04, c + w / 2, (y0 + y1) / 2 + 0.02, 0.06, TRIM);
    B(c - w / 2 - 0.12, y0 - 0.1, 0, c + w / 2 + 0.12, y0 - 0.04, 0.1, TRIM);
    const L = w + 0.4, hy = y1 + 0.32;
    if (axis === 'x') boxR(0.7, 0.03, L, ROOF, wpos + nrm * 0.33, hy - 0.15, c, 0, 0, -0.45 * nrm);
    for (const s of [-1, 1]) B(c + s * (L / 2 - 0.05) - 0.025, hy - 0.42, 0, c + s * (L / 2 - 0.05) + 0.025, hy - 0.06, 0.5, TRIM);
  }
  // a 2040 hover hatch (as parade's): origin on the road, front +Z, body from y 0.32; glow pads in M.glow
  function hoverCar(col) {
    const y0 = 0.32, dk = 0x2c4256, trim = 0x3a3e44;
    boxR(1.76, 0.38, 3.6, col, 0, y0 + 0.23, 0); boxR(1.6, 0.34, 3.9, col, 0, y0 + 0.21, 0);
    boxR(1.66, 0.12, 3.8, 0xd8dce0, 0, y0 + 0.04, 0);
    boxR(1.7, 0.1, 1.1, col, 0, y0 + 0.43, 1.3, 0.16);
    boxR(1.56, 0.38, 1.9, dk, 0, y0 + 0.6, -0.36); boxR(1.5, 0.07, 1.62, col, 0, y0 + 0.82, -0.42);
    boxR(1.5, 0.3, 0.06, dk, 0, y0 + 0.6, 0.62, -0.5);
    boxR(1.64, 0.03, 0.1, GLASSY, 0, y0 + 0.43, 0); boxR(0.03, 0.08, 3.4, GLASSY, 0.885, y0 + 0.3, 0); boxR(0.03, 0.08, 3.4, GLASSY, -0.885, y0 + 0.3, 0);
    for (const sx of [-1, 1]) { boxR(0.4, 0.09, 0.04, 0xfffbe8, sx * 0.5, y0 + 0.3, 1.95); boxR(0.42, 0.08, 0.04, 0xe83a3a, sx * 0.5, y0 + 0.34, -1.95); }
    for (const [x, z] of [[0.58, 1.25], [-0.58, 1.25], [0.58, -1.25], [-0.58, -1.25]]) { cyl(0.3, 0.34, 0.06, 10, trim, x, y0 - 0.03, z); cyl(0.24, 0.24, 0.02, 10, 0xffffff, x, y0 - 0.075, z, 0, 0, M.glow); }
  }
  // one frangipani flower facing up at (x, y, z), size s
  function flower(x, y, z, s, tilt = 0) {
    for (let k = 0; k < 5; k++) { const a = k * TAU / 5 + 0.3; boxR(0.034 * s, 0.008 * s, 0.062 * s, BLOOM, x + Math.sin(a) * 0.032 * s, y, z + Math.cos(a) * 0.032 * s, -0.28 + tilt, a, 0); }
    boxR(0.024 * s, 0.012 * s, 0.024 * s, BUTTER, x, y + 0.004 * s, z, 0, 0.3, 0);
  }

  // ---------------------------------------------------------- the lot, the house outside, the street, the reserve (BG)
  const POSTS = [-6.92, -4.70, -2.45, -0.72, 0.72, 2.92];
  const HIBX = [[-7.4, 0.6], [-4.6, 0.55], [-2.3, 0.5], [3.1, 0.55], [4.9, 0.6]];   // hibiscus bushes in the front beds
  const rampY = (z) => 2.40 * (6.44 - z) / 3.64;
  function buildGround() {
    b = BG; tint = OUT; DEF = M.vc; XF = null;
    // ground: lots and yards, verges, the reserve, the Esplanade strip
    gnd(-230, -90, 63.5, 14.2, 0, M.grass, LAWN, 2.2);
    gnd(-230, 15.6, 63.5, 17.0, 0, M.grass, LAWN, 2.2);
    gnd(-230, 24.15, 63.5, 44.5, 0, M.grass, 0x88b45c, 2.2);
    gnd(70.15, -200, 75.6, 44.5, 0, M.grass, 0x88b45c, 2.2);
    slab(-230, 14.2, 63.5, 15.6, 0.02, M.conc, CONC, 1.2);                     // footpath
    gnd(-230, 17.15, 63.5, 24.0, 0.0, M.conc, ASPH, 3.0);                      // the street
    gnd(63.5, -200, 70.0, 44.5, 0.0, M.conc, ASPH, 3.0);                       // the Esplanade
    slab(-230, 42.8, 63.5, 44.2, 0.02, M.conc, CONC, 1.2);                     // the promenade along the sea wall
    bb(-230, 0, 17.0, 63.35, 0.1, 17.15, CONC); bb(-230, 0, 24.0, 63.35, 0.1, 24.15, CONC);
    bb(63.35, 0, -200, 63.5, 0.1, 17.0, CONC); bb(63.35, 0, 24.15, 63.5, 0.1, 44.5, CONC); bb(70.0, 0, -200, 70.15, 0.1, 44.5, CONC);
    for (let z = -196; z < 42; z += 6) bb(66.69, 0.005, z, 66.81, 0.012, z + 3, 0xf2f2ec);   // the Esplanade's dashed centre line
    for (let z = 17.6; z < 23.8; z += 0.9) bb(62.8, 0.005, z, 63.1, 0.012, z + 0.5, 0xf2f2ec);  // give way
    for (const x of [-117, -99, -81, -63, -45, -27, 19, 37, 55]) slab(x - 1.5, 13.2, x + 1.5, 17.0, 0.03, M.conc, CONC, 1.2);   // driveways
    // the padded speed hump (2040: cream foam, glassy reflector strips) across the street at x 12
    bb(11.0, 0, 17.15, 13.0, 0.05, 24.0, PADDED); bb(11.3, 0.05, 17.15, 12.7, 0.09, 24.0, PADDED); bb(11.6, 0.09, 17.15, 12.4, 0.12, 24.0, 0xf4ecd8);
    for (let z = 17.6; z < 24; z += 0.6) bb(11.05, 0.0, z, 12.95, 0.122, z + 0.02, 0xd8cdb4);
    for (const z of [18.2, 20.6, 23.0]) bb(11.25, 0.091, z, 12.75, 0.096, z + 0.3, GLASSY);
    // the blank street sign (2040: the names went into AR)
    cyl(0.04, 0.04, 2.7, 6, 0xb8bec4, 9.8, 1.35, 16.2);
    bb(9.25, 2.42, 16.17, 10.35, 2.62, 16.23, 0xf4f6f6); bb(9.8 - 0.02, 2.2, 15.65, 9.8 + 0.02, 2.4, 16.75, 0xf4f6f6);
    // ---- Rue's lot
    tint = UNDER; gnd(-7.0, -9.0, 3.0, 2.75, 0.012, M.vc, SOIL); tint = OUT;
    slab(-0.5, 6.44, 0.5, 13.2, 0.02, M.conc, CONC, 1.0);
    for (const [x0, x1] of [[-8.8, -1.0], [1.0, 8.8]]) {
      slab(x0, 12.4, x1, 13.15, 0.025, M.vc, MULCH);
      bb(x0, 0, 12.34, x1, 0.09, 12.4, 0x8a6a48);
      const xe = x0 < 0 ? x1 : x0; bb(xe - 0.03, 0, 12.34, xe + 0.03, 0.09, 13.15, 0x8a6a48);
    }
    srand(21);
    const bush = (x, z, r, cols) => { for (let k = 0; k < 4; k++) { const a = rnd() * TAU, d = r * 0.45 * (k ? 1 : 0); ico(r * (k ? 0.62 : 0.8), cols[(rnd() * cols.length) | 0], x + Math.sin(a) * d, r * (k ? 0.55 + rnd() * 0.3 : 0.7), z + Math.cos(a) * d * 0.6, 0.85); } };
    for (const s of [-1, 1]) for (let x = 1.5; x < 8.6; x += 0.85 + rnd() * 0.4) if (!HIBX.some((h) => Math.abs(h[0] - s * x) < 0.6)) bush(s * x, 12.78 + (rnd() - 0.5) * 0.12, 0.3 + rnd() * 0.12, GREENS);
    for (const [x, r] of HIBX) bush(x, 12.75, r, [0x3f7a34, 0x47843a, 0x356c2e]);   // the hibiscus
    // front fence: rails + posts (the pickets are instanced), gate posts with caps
    for (const [x0, x1] of [[-9.0, -0.62], [0.62, 9.0]]) { bb(x0, 0.16, 13.17, x1, 0.24, 13.23, TRIM); bb(x0, 0.74, 13.17, x1, 0.82, 13.23, TRIM); }
    for (const x of [-9.0, -6.6, -4.2, -1.8, 1.8, 4.2, 6.6, 9.0]) { bb(x - 0.05, 0, 13.15, x + 0.05, 1.04, 13.25, TRIM); bb(x - 0.065, 1.04, 13.135, x + 0.065, 1.08, 13.265, TRIM); }
    for (const x of [-0.64, 0.64]) { bb(x - 0.07, 0, 13.13, x + 0.07, 1.22, 13.27, TRIM); bb(x - 0.09, 1.22, 13.11, x + 0.09, 1.27, 13.29, TRIM); ico(0.065, TRIM, x, 1.33, 13.2); }
    // the milk-can letterbox (outside the fence) with the number
    bb(1.16, 0, 13.41, 1.24, 0.9, 13.49, 0x8a7458);
    cyl(0.15, 0.15, 0.36, 12, 0xd8d4c8, 1.2, 1.08, 13.45); cyl(0.12, 0.15, 0.08, 12, 0xd8d4c8, 1.2, 1.3, 13.45); cyl(0.08, 0.12, 0.06, 12, 0xc8c4b8, 1.2, 1.37, 13.45);
    bb(1.13, 1.18, 13.6, 1.27, 1.2, 13.61, 0x2a2a2a);
    quadR(0.16, 0.08, M.atlas, RG.letter, 1.2, 1.02, 13.602, 0);
    // paling side fences (1.8 m), the back fence, the side gates at z 2.3
    const palings = (x0, z0, x1, z1, hgt, s0) => {
      srand(s0); const L = Math.hypot(x1 - x0, z1 - z0), n = Math.ceil(L / 0.3);
      for (let i = 0; i < n; i++) {
        const u0 = i / n, u1 = (i + 1) / n - 0.004 / L, h = hgt - rnd() * 0.05, col = rnd() > 0.5 ? PALING : 0x93866f;
        bb(Math.min(x0 + (x1 - x0) * u0, x0 + (x1 - x0) * u1) - (x0 === x1 ? 0.025 : 0), 0, Math.min(z0 + (z1 - z0) * u0, z0 + (z1 - z0) * u1) - (z0 === z1 ? 0.025 : 0),
          Math.max(x0 + (x1 - x0) * u0, x0 + (x1 - x0) * u1) + (x0 === x1 ? 0.025 : 0), h, Math.max(z0 + (z1 - z0) * u0, z0 + (z1 - z0) * u1) + (z0 === z1 ? 0.025 : 0), col);
      }
    };
    palings(-9.05, -14, -9.05, 10.6, 1.8, 31); palings(9.05, -14, 9.05, 10.6, 1.8, 37); palings(-9.0, -14.05, 9.0, -14.05, 1.8, 41);
    palings(-9.05, 10.6, -9.05, 13.15, 1.2, 33); palings(9.05, 10.6, 9.05, 13.15, 1.2, 39);
    for (const s of [-1, 1]) { bb(s * 9.08 - 0.03, 0.25, -14, s * 9.08 + 0.03, 0.33, 13.15, 0x8a7d66); bb(s * 9.08 - 0.03, 1.45, -14, s * 9.08 + 0.03, 1.53, 10.6, 0x8a7d66); bb(s * 9.08 - 0.03, 0.95, 10.6, s * 9.08 + 0.03, 1.02, 13.15, 0x8a7d66); }
    palings(-9.0, 2.3, -7.0, 2.3, 1.75, 43); palings(3.0, 2.3, 9.0, 2.3, 1.75, 47);
    for (const [x0, x1] of [[-9.0, -7.0], [3.0, 9.0]]) { bb(x0, 0.3, 2.24, x1, 0.38, 2.27, 0x8a7d66); bb(x0, 1.4, 2.24, x1, 1.48, 2.27, 0x8a7d66); }
    // ---- under-house: lattice skirt, the dark beneath, fascia
    alphaRun(-7.0, 2.75, -0.65, 2.75, 0, 2.24, AL.lattice, 0.6, 0.56, LATT);
    alphaRun(0.65, 2.75, 3.0, 2.75, 0, 2.24, AL.lattice, 0.6, 0.56, LATT);
    alphaRun(-7.02, -9.0, -7.02, 2.75, 0, 2.24, AL.lattice, 0.6, 0.56, LATT);
    alphaRun(3.02, -9.0, 3.02, 2.75, 0, 2.24, AL.lattice, 0.6, 0.56, LATT);
    alphaRun(-7.0, -9.02, 3.0, -9.02, 0, 2.24, AL.lattice, 0.6, 0.56, LATT);
    for (const [x, z] of [[-7.0, 2.75], [-0.65, 2.75], [0.65, 2.75], [3.0, 2.75], [-7.0, -9.0], [3.0, -9.0]]) bb(x - 0.05, 0, z - 0.05, x + 0.05, 2.24, z + 0.05, TRIM);
    for (const [x0, x1] of [[-7.0, -0.65], [0.65, 3.0]]) bb(x0, 0, 2.72, x1, 0.08, 2.78, TRIM);
    tint = UNDER; quad(10.0, 11.75, M.vc, -2.0, 2.24, -3.125, 0, H, 0x5a5650); tint = OUT;
    bb(-7.06, 2.20, 2.80, 3.06, 2.42, 2.86, TRIM);
    bb(-7.08, 2.20, -9.0, -7.0, 2.42, 2.86, TRIM); bb(3.0, 2.20, -9.0, 3.08, 2.42, 2.86, TRIM); bb(-7.08, 2.20, -9.08, 3.08, 2.42, -9.0, TRIM);
    // ---- the front stairs: 14 treads (grey-blue), white risers and stringers, handrails, newels, dowel balusters
    const run = 0.26, rise = 2.40 / 14;
    for (let k = 0; k < 14; k++) {
      const z0 = 2.8 + k * run, yT = 2.40 * (13.5 - k) / 14;
      bb(-0.6, yT - 0.035, z0, 0.6, yT, z0 + run + 0.02, VBOARD);
      bb(-0.6, Math.max(0, yT - rise), z0 + run - 0.01, 0.6, yT - 0.035, z0 + run, TRIM);
    }
    for (const s of [-1, 1]) {
      boxR(0.06, 0.3, 4.62, TRIM, s * 0.63, 1.27, 4.62, Math.atan2(2.40, 3.64), 0, 0);
      rod(s * 0.65, 3.32, 2.8, s * 0.65, 0.92, 6.44, 0.065, TRIM);
      bb(s * 0.65 - 0.055, 2.40, 2.75, s * 0.65 + 0.055, 3.50, 2.86, TRIM); bb(s * 0.65 - 0.07, 3.50, 2.735, s * 0.65 + 0.07, 3.54, 2.875, TRIM);
      bb(s * 0.65 - 0.065, 0, 6.38, s * 0.65 + 0.065, 1.1, 6.5, TRIM); bb(s * 0.65 - 0.08, 1.1, 6.365, s * 0.65 + 0.08, 1.14, 6.515, TRIM); ico(0.06, TRIM, s * 0.65, 1.2, 6.44);
      const n = 8, z0 = 2.88, z1 = 6.36;
      for (let i = 0; i < n; i++) {
        const za = z0 + (z1 - z0) * i / n, zb = z0 + (z1 - z0) * (i + 1) / n, x = s * 0.65;
        quad4([x, rampY(za) + 0.13, za], [x, rampY(zb) + 0.13, zb], [x, rampY(zb) + 0.87, zb], [x, rampY(za) + 0.87, za], M.alpha, TRIM, regUV(AL.dowel, 128, 128));
      }
    }
    // ---- the house outside: weatherboard skins (the front wall is the verandah's), corner boards, side windows
    bb(2.95, 2.40, -9.0, 3.0, 5.6, 0.0, CREAM, M.wb, 0.6);
    bb(-7.0, 2.40, -9.0, -6.95, 5.6, 0.0, CREAM, M.wb, 0.6);
    bb(-7.0, 2.40, -9.0, -6.0, 5.6, -8.95, CREAM, M.wb, 0.6); bb(-3.6, 2.40, -9.0, 3.0, 5.6, -8.95, CREAM, M.wb, 0.6);
    bb(-6.0, 2.40, -9.0, -3.6, 3.45, -8.95, CREAM, M.wb, 0.6); bb(-6.0, 4.6, -9.0, -3.6, 5.6, -8.95, CREAM, M.wb, 0.6);
    for (const [x, z] of [[3.0, 0.0], [3.0, -9.0], [-7.0, -9.0], [-7.0, 0.0]]) bb(x - 0.07, 2.40, z - 0.07, x + 0.07, 5.6, z + 0.07, TRIM);
    sideWindow('x', 3.0, -2.9, 1.2, 3.1, 4.5, 1); sideWindow('x', 3.0, -6.6, 1.0, 3.1, 4.5, 1);
    sideWindow('x', -7.0, -0.9, 0.9, 3.1, 4.5, -1); sideWindow('x', -7.0, -6.6, 1.0, 3.1, 4.5, -1);
    louvres(-6.0, -3.6, 3.45, 4.6, -9.0, -8.85, 3);
    // ---- the main roof: a pyramid hip in faded heritage-red iron, soffit, fascia, gutters, downpipes, hip cappings
    const E = 5.6, X0 = -7.4, X1 = 3.4, Z0 = -9.4, Z1 = 0.4, A = [-2.0, 8.2, -4.5], ti = 1 / 0.6;
    const sl = (d) => Math.hypot(d, 8.2 - E) * ti;
    triUV([X0, E, Z1], [X1, E, Z1], A, [0, 0], [(X1 - X0) * ti, 0], [(X1 - X0) * ti / 2, sl(Z1 - A[2])], M.iron, ROOF);
    triUV([X1, E, Z0], [X0, E, Z0], A, [0, 0], [(X1 - X0) * ti, 0], [(X1 - X0) * ti / 2, sl(A[2] - Z0)], M.iron, ROOF);
    triUV([X1, E, Z1], [X1, E, Z0], A, [0, 0], [(Z1 - Z0) * ti, 0], [(Z1 - Z0) * ti / 2, sl(X1 - A[0])], M.iron, ROOF);
    triUV([X0, E, Z0], [X0, E, Z1], A, [0, 0], [(Z1 - Z0) * ti, 0], [(Z1 - Z0) * ti / 2, sl(A[0] - X0)], M.iron, ROOF);
    for (const [x, z] of [[X0, Z0], [X1, Z0], [X1, Z1], [X0, Z1]]) rod(x, E + 0.03, z, A[0], A[1] + 0.03, A[2], 0.09, 0xa8463a);
    tint = CEILT; bb(X0, E - 0.08, Z0, X1, E - 0.02, Z1, 0xeee8da, M.ceilV); tint = OUT;
    bb(X0 - 0.03, E - 0.2, Z1, X1 + 0.03, E + 0.02, Z1 + 0.03, TRIM); bb(X0 - 0.03, E - 0.2, Z0 - 0.03, X1 + 0.03, E + 0.02, Z0, TRIM);
    bb(X1, E - 0.2, Z0, X1 + 0.03, E + 0.02, Z1, TRIM); bb(X0 - 0.03, E - 0.2, Z0, X0, E + 0.02, Z1, TRIM);
    bb(X0 - 0.13, E - 0.22, Z1 + 0.03, X1 + 0.13, E - 0.08, Z1 + 0.15, GUTTER); bb(X0 - 0.13, E - 0.22, Z0 - 0.15, X1 + 0.13, E - 0.08, Z0 - 0.03, GUTTER);
    bb(X1 + 0.03, E - 0.22, Z0, X1 + 0.15, E - 0.08, Z1, GUTTER); bb(X0 - 0.15, E - 0.22, Z0, X0 - 0.03, E - 0.08, Z1, GUTTER);
    for (const [x, z] of [[X1 + 0.09, Z0 - 0.09], [X0 - 0.09, Z0 - 0.09]]) cyl(0.045, 0.045, E - 0.2, 6, GUTTER, x, (E - 0.2) / 2, z);
    // the chimney (the front room's disused fireplace) on the south wall
    bb(-7.8, 0, -3.0, -7.05, 5.2, -2.0, BRICK); bb(-7.62, 5.2, -2.82, -7.12, 8.0, -2.18, BRICK); bb(-7.68, 8.0, -2.88, -7.06, 8.1, -2.12, 0x7a7a74);
    for (const z of [-2.65, -2.35]) cyl(0.07, 0.08, 0.32, 8, 0xb05a40, -7.37, 8.26, z);
    for (let y = 0.45; y < 8; y += 0.55) bb(-7.82, y, -3.02, -7.04, y + 0.03, -1.98, 0x7a3c30);
    // the rainwater tank in the north side yard (corrugated, on a timber stand)
    bb(4.5, 0, -7.3, 6.7, 0.5, -5.1, 0x8a7a62); cylUV(1.0, 2.2, 16, 0xc8ccd0, 5.6, 1.6, -6.2, M.iron, 10, 3); cyl(1.02, 1.02, 0.06, 16, 0xb8bcc0, 5.6, 2.72, -6.2);
    // ---- the frangipani: trunk and four grey limbs (static); leaf rosettes, blossoms and the sway are the prop
    R.fPlan = frangiPlan();
    const FX = -4.2, FZ = 9.0;
    cyl(0.12, 0.18, 1.3, 8, BARK, FX, 0.65, FZ);
    const limbEnd = [];
    for (let L = 0; L < 4; L++) { const a = [0.5, 2.0, 3.6, 5.2][L], ex = FX + Math.sin(a) * 0.85, ez = FZ + Math.cos(a) * 0.85; limbEnd.push([ex, 2.05, ez]); rod(FX, 1.15, FZ, ex, 2.05, ez, 0.14, BARK); }
    for (const f of R.fForks) { const e = limbEnd[f[3]]; rod(e[0], e[1], e[2], FX + f[0], f[1], FZ + f[2], 0.1, BARK); }
    for (const p of R.fPlan) { const f = p[3] >= 0 ? R.fForks[p[3]] : null, e = f ? [FX + f[0], f[1], FZ + f[2]] : limbEnd[-1 - p[3]]; rod(e[0], e[1], e[2], FX + p[0], p[1] - 0.1, FZ + p[2], 0.065, 0xa8a296); }
    // ---- the Hills hoist's pole and base (the head turns: the prop)
    cyl(0.045, 0.05, 1.9, 8, 0xb8bec4, 5.6, 0.95, 5.4); cyl(0.12, 0.12, 0.05, 8, 0x9aa0a6, 5.6, 0.025, 5.4);
    // ---- street lamp poles are instanced; the poinciana trees on the verges (red in December)
    for (const [x, z] of [[-30, 16.3], [36, 16.3]]) {
      cyl(0.14, 0.2, 2.6, 8, 0x7a6a58, x, 1.3, z);
      for (const [dx, dz] of [[1.2, 0.4], [-1.1, 0.6], [0.2, -1.2], [0.3, 1.1]]) rod(x, 2.4, z, x + dx * 1.6, 3.3, z + dz * 1.6, 0.12, 0x7a6a58);
      srand(x > 0 ? 61 : 67);
      for (let i = 0; i < 9; i++) { const a = rnd() * TAU, r = rnd() * 2.6; ico(1.3 + rnd() * 0.5, rnd() > 0.45 ? 0x4a7a34 : 0xc8382c, x + Math.sin(a) * r, 3.7 + rnd() * 0.5, z + Math.cos(a) * r, 0.42, M.vc, 1.15); }
    }
    // ---- the neighbours' frontages: low hedges and brick walls along z 13.2 (the shells are instanced)
    srand(71);
    for (const [x0, x1] of [[-230, -9.2], [9.2, 63.3]]) for (let x = x0; x < x1; x += 18) {
      const xe = Math.min(x1, x + 18), kind = rnd();
      if (kind < 0.5) bb(x + 0.2, 0, 12.9, xe - 3.4, 0.85, 13.5, HEDGE); else bb(x + 0.2, 0, 13.1, xe - 3.4, 0.6, 13.32, kind < 0.8 ? 0xb06a4a : 0xd8d0c0);
    }
    // ---- the foreshore reserve: the picnic shelter, the pines' trunks, the rock sea wall's base
    for (const [x, z] of [[6.2, 28.6], [9.8, 28.6], [6.2, 31.4], [9.8, 31.4]]) bb(x - 0.06, 0, z - 0.06, x + 0.06, 2.55, z + 0.06, 0xe8e4da);
    triUV([5.6, 2.55, 32.0], [10.4, 2.55, 32.0], [8, 3.6, 30], [0, 0], [8, 0], [4, 3], M.iron, 0x5f7a5a);
    triUV([10.4, 2.55, 28.0], [5.6, 2.55, 28.0], [8, 3.6, 30], [0, 0], [8, 0], [4, 3], M.iron, 0x5f7a5a);
    triUV([10.4, 2.55, 32.0], [10.4, 2.55, 28.0], [8, 3.6, 30], [0, 0], [7, 0], [3.5, 3], M.iron, 0x5f7a5a);
    triUV([5.6, 2.55, 28.0], [5.6, 2.55, 32.0], [8, 3.6, 30], [0, 0], [7, 0], [3.5, 3], M.iron, 0x5f7a5a);
    bb(6.9, 0.7, 29.4, 9.1, 0.76, 30.6, 0x9a7a58); bb(7.9, 0, 29.9, 8.1, 0.7, 30.1, 0x8a8a84);
    for (const z of [28.95, 31.05]) { bb(6.9, 0.42, z - 0.15, 9.1, 0.46, z + 0.15, 0x9a7a58); bb(7.95, 0, z - 0.05, 8.05, 0.42, z + 0.05, 0x8a8a84); }
    for (const [x, z, h] of [[-14, 30, 21], [2, 35, 23], [18, 31, 19], [34, 36, 22]]) cyl(0.2, 0.4, h, 8, 0x7a6e60, x, h / 2, z);
    quad4([-230, 0.01, 44.5], [76, 0.01, 44.5], [76, -2.6, 48.6], [-230, -2.6, 48.6], M.vc, ROCK);
    quad4([75.5, 0.01, 44.5], [75.5, 0.01, -200], [79.6, -2.6, -200], [79.6, -2.6, 48.6], M.vc, ROCK);
    // ---- the backyard beyond the kitchen louvres (a painted card behind the house)
    quadR(7.8, 5.0, M.atlas, RG.backyard, -4.9, 4.0, -10.6, 0);
  }
  // the frangipani's plan (local to the trunk base, deterministic): 4 limbs -> 12 forks (R.fForks [x, y, z, limb]) ->
  // leaf rosettes at the tips (returned: [x, y, z, fork | -1 - limb]); canopy y 2.4..4.3, r <= 2.25 (the louvre sight lines)
  function frangiPlan() {
    srand(55); const forks = [], pts = [], limbs = [0.5, 2.0, 3.6, 5.2];
    for (let L = 0; L < 4; L++) for (let f = 0; f < 3; f++) {
      const a = limbs[L] + (f - 1) * 0.5 + (rnd() - 0.5) * 0.2, r = 1.3 + rnd() * 0.3;
      forks.push([Math.sin(a) * r, 2.45 + rnd() * 0.25, Math.cos(a) * r, L]);
      for (let k = 0; k < 4; k++) {
        const b2 = a + (rnd() - 0.5) * 0.95, rr = Math.min(2.25, r + 0.1 + rnd() * 0.8), y = 2.6 + 1.2 * (1 - (rr / 2.4) ** 2) + rnd() * 0.3;
        pts.push([Math.sin(b2) * rr, y, Math.cos(b2) * rr, forks.length - 1]);
      }
    }
    for (let k = 0; k < 6; k++) { const a = k * TAU / 6 + rnd() * 0.5, rr = 0.35 + rnd() * 0.5; pts.push([Math.sin(a) * rr, 3.8 + rnd() * 0.3, Math.cos(a) * rr, -1 - (k % 4)]); }
    R.fForks = forks;
    return pts;
  }

  // ---------------------------------------------------------- the verandah (BU, y0 2.40)
  function frontWall(z0, z1, m, hex, tile) {   // the front wall with its openings, between z0 and z1
    const S = (x0, x1, y0, y1) => bb(x0, y0, z0, x1, y1, z1, hex, m, tile);
    S(-7.0, -6.4, 2.40, 5.6); S(-6.4, -3.9, 2.40, 3.20); S(-6.4, -3.9, 4.50, 5.6); S(-3.9, -3.7, 2.40, 5.6);
    S(-3.7, -1.2, 2.40, 3.20); S(-3.7, -1.2, 4.50, 5.6); S(-1.2, -0.45, 2.40, 5.6); S(-0.45, 0.45, 4.50, 5.6);
    S(0.45, 1.0, 2.40, 5.6); S(1.0, 2.5, 2.40, 3.20); S(1.0, 2.5, 4.50, 5.6); S(2.5, 3.0, 2.40, 5.6);
  }
  const FERNS = [[-4.5, 4.4, 2.58], [2.1, 4.35, 2.45]];   // hanging fern baskets [x, rim y, z]
  const vRoofY = (z) => { const u = z / 3.0; return 5.10 - 0.55 * (0.65 * u + 0.35 * u * u); };
  function buildVerandah() {
    b = BU; tint = SHADE; DEF = M.vc; XF = null;
    bb(-7.0, 2.28, 0.0, 3.0, 2.40, 2.80, VBOARD, M.boards, -0.6);
    frontWall(-0.05, 0.0, M.wb, CREAM, 0.6);
    bb(-7.0, 2.40, -0.07, -0.53, 2.52, 0.03, TRIM); bb(0.53, 2.40, -0.07, 3.0, 2.52, 0.03, TRIM);
    for (const [x0, x1, n] of [[-6.4, -3.9, 2], [-3.7, -1.2, 3], [1.0, 2.5, 2]]) { louvres(x0, x1, 3.20, 4.50, -0.15, 0.0, n);   // bank 1 in two blades: its mullion stays off Rue's POV line (x -4.73)
      bb(x0 - 0.1, 3.08, -0.02, x1 + 0.1, 3.15, 0.08, TRIM); }
    bb(-0.53, 2.40, -0.17, -0.45, 4.58, 0.04, TRIM); bb(0.45, 2.40, -0.17, 0.53, 4.58, 0.04, TRIM); bb(-0.53, 4.50, -0.17, 0.53, 4.60, 0.04, TRIM);
    bb(-0.6, 4.60, -0.02, 0.6, 4.66, 0.05, TRIM);
    // posts (instanced below), the beam, brackets, balustrade
    bb(-7.06, 4.44, 2.64, 3.06, 4.64, 2.80, TRIM);
    for (let i = 0; i < POSTS.length; i++) {
      const x = POSTS[i];
      if (i > 0) quadR(0.34, 0.34, M.alpha, AL.bracket, x - 0.06 - 0.17, 4.44 - 0.17, 2.72, 0, 0, TRIM, 128, 128, true);
      if (i < POSTS.length - 1) quadR(0.34, 0.34, M.alpha, AL.bracket, x + 0.06 + 0.17, 4.44 - 0.17, 2.72, 0, 0, TRIM, 128, 128, false);
    }
    for (const [x0, x1] of [[-7.0, -0.65], [0.65, 3.0]]) {
      bb(x0, 3.33, 2.66, x1, 3.40, 2.80, TRIM); bb(x0, 3.40, 2.63, x1, 3.43, 2.83, TRIM); bb(x0, 2.50, 2.68, x1, 2.56, 2.78, TRIM);
      alphaRun(x0, 2.73, x1, 2.73, 2.56, 3.33, AL.dowel, 0.44, 0.77, TRIM);
    }
    for (const x of [-7.01, 3.01]) {
      bb(x - 0.06, 3.33, 0.0, x + 0.06, 3.40, 2.66, TRIM); bb(x - 0.09, 3.40, 0.0, x + 0.09, 3.43, 2.66, TRIM); bb(x - 0.05, 2.50, 0.0, x + 0.05, 2.56, 2.66, TRIM);
      alphaRun(x, 0.0, x, 2.66, 2.56, 3.33, AL.dowel, 0.44, 0.77, TRIM);
    }
    // the bullnose verandah roof: iron on top, the pale underside, a gutter
    const N = 8;
    for (let i = 0; i < N; i++) {
      const za = 3.05 * i / N, zb = 3.05 * (i + 1) / N, ya = vRoofY(za), yb = vRoofY(zb);
      quad4([3.15, ya + 0.05, za], [-7.15, ya + 0.05, za], [-7.15, yb + 0.05, zb], [3.15, yb + 0.05, zb], M.iron, ROOF, [0, za / 0.6, 10.3 / 0.6, zb / 0.6]);
      tint = CEILT; quad4([-7.15, ya, za], [3.15, ya, za], [3.15, yb, zb], [-7.15, yb, zb], M.ceilV, VCEIL); tint = SHADE;
      for (const x of [-7.15, 3.15]) quad4([x, ya, za], [x, yb, zb], [x, yb + 0.05, zb], [x, ya + 0.05, za], M.vc, TRIM);
    }
    const ye = vRoofY(3.05);
    tint = OUT; bb(-7.22, ye - 0.14, 3.03, 3.22, ye + 0.02, 3.15, GUTTER); cyl(0.045, 0.045, ye - 2.4, 6, GUTTER, 3.18, 2.4 + (ye - 2.4) / 2, 3.1); tint = SHADE;
    bb(-7.0, 5.08, -0.05, 3.0, 5.16, 0.06, TRIM);
    // the bell's bracket (the bell swings: the prop)
    bb(0.88, 4.24, 0.0, 1.02, 4.42, 0.03, STAIN); boxR(0.025, 0.025, 0.1, BRASS, 0.95, 4.35, 0.075); ico(0.02, BRASS, 0.95, 4.35, 0.125);
    // the cane chair and its side table, fern baskets, two pot plants by the door, the doormat
    at(-5.78, 1.18, 0.35, 2.40);
    for (const [lx, lz] of [[-0.28, -0.25], [0.28, -0.25], [-0.28, 0.28], [0.28, 0.28]]) bb(lx - 0.025, 0, lz - 0.025, lx + 0.025, 0.4, lz + 0.025, 0xa8844e);
    bb(-0.32, 0.36, -0.3, 0.32, 0.44, 0.32, CANE); boxR(0.66, 0.62, 0.08, CANE, 0, 0.72, -0.3, -0.18);
    for (const s of [-1, 1]) bb(s * 0.32 - 0.04, 0.44, -0.28, s * 0.32 + 0.04, 0.66, 0.3, CANE);
    bb(-0.26, 0.44, -0.22, 0.26, 0.5, 0.28, 0x6a8a7a);
    XF = null;
    cyl(0.22, 0.22, 0.03, 12, CANE, -5.2, 2.40 + 0.52, 1.35); cyl(0.03, 0.03, 0.5, 6, 0xa8844e, -5.2, 2.40 + 0.26, 1.35); cyl(0.16, 0.16, 0.02, 10, 0xa8844e, -5.2, 2.41, 1.35);
    cyl(0.04, 0.035, 0.1, 8, 0xffffff, -5.12, 2.98, 1.3);
    for (const [fx, fy, fz] of FERNS) {
      for (const a of [0, 2.1, 4.2]) rod(fx, vRoofY(fz) - 0.01, fz, fx + Math.sin(a) * 0.17, fy, fz + Math.cos(a) * 0.17, 0.008, 0x3a3a38);
      cyl(0.19, 0.11, 0.18, 10, 0x6a5a3e, fx, fy - 0.09, fz);
      srand(fx > 0 ? 81 : 83);
      ico(0.17, 0x4a8a40, fx, fy + 0.02, fz, 0.55);
      for (let k = 0; k < 7; k++) { const a = k * TAU / 7 + rnd() * 0.4; quadR(0.5, 0.42, M.alpha, AL.leaf, fx + Math.sin(a) * 0.2, fy - 0.12, fz + Math.cos(a) * 0.2, a, 0.5, 0xd8f0c8, 128, 128); }
      quadR(0.62, 0.62, M.alpha, AL.leaf, fx, fy + 0.03, fz, rnd() * TAU, -H, 0xe8ffe0, 128, 128);
    }
    cyl(0.15, 0.11, 0.3, 10, 0xb5654a, -0.8, 2.55, 0.3); srand(85); for (let k = 0; k < 6; k++) ico(0.12, k % 2 ? 0x3f7a3a : 0x4a8a40, -0.8 + (rnd() - 0.5) * 0.18, 2.78 + rnd() * 0.1, 0.3 + (rnd() - 0.5) * 0.18, 0.8);
    cyl(0.11, 0.08, 0.22, 10, 0xb5654a, -1.1, 2.51, 0.22); ico(0.13, 0x4f7a3a, -1.1, 2.68, 0.22, 0.8); for (let k = 0; k < 5; k++) ico(0.03, 0xd8323a, -1.1 + Math.sin(k * 1.3) * 0.09, 2.76, 0.22 + Math.cos(k * 1.3) * 0.09);
    bb(-0.45, 2.40, 0.08, 0.45, 2.414, 0.6, 0x9a7448);
  }

  // ---------------------------------------------------------- the interior (BU, tint IN, interior materials)
  function buildInterior() {
    b = BU; tint = IN; DEF = M.vcIn; XF = null;
    // floors (hoop pine), threshold, ceilings (VJ, white)
    bb(-6.85, 2.30, -4.85, 2.85, 2.40, -0.15, HOOP, M.boardsIn, 0.6); bb(-6.85, 2.30, -8.85, -1.5, 2.40, -4.85, HOOP, M.boardsIn, 0.6);
    bb(-0.45, 2.30, -0.15, 0.45, 2.405, 0.0, STAIN);
    tint = CEILT_IN; quad(9.7, 4.7, M.ceilIn, -2.0, 5.40, -2.5, 0, H, CEIL, -0.6); quad(5.35, 4.0, M.ceilIn, -4.175, 5.40, -6.85, 0, H, CEIL, -0.6); tint = IN;
    // wall linings (VJ, pale sage cream)
    frontWall(-0.15, -0.05, M.vj, VJ, 0.6);
    bb(-6.95, 2.40, -8.85, -6.85, 5.40, -0.15, VJ, M.vj, 0.6);
    bb(2.85, 2.40, -4.85, 2.95, 5.40, -0.15, VJ, M.vj, 0.6);
    bb(-6.85, 2.40, -8.95, -6.0, 5.40, -8.85, VJ, M.vj, 0.6); bb(-3.6, 2.40, -8.95, -1.5, 5.40, -8.85, VJ, M.vj, 0.6);
    bb(-6.0, 2.40, -8.95, -3.6, 3.45, -8.85, VJ, M.vj, 0.6); bb(-6.0, 4.6, -8.95, -3.6, 5.40, -8.85, VJ, M.vj, 0.6);
    bb(-6.85, 2.40, -5.0, -5.6, 5.40, -4.85, VJ, M.vj, 0.6); bb(-2.4, 2.40, -5.0, 2.85, 5.40, -4.85, VJ, M.vj, 0.6);
    bb(-1.50, 2.40, -8.85, -1.35, 5.40, -5.0, VJ, M.vj, 0.6);
    // trims: skirting, picture rail (dark stain), cornice (white)
    const trimRun = (x0, z0, x1, z1, rail = true) => {
      const ix = x0 === x1, d = 0.02;
      const B = (y0, y1, hex, dd) => (ix ? bb(x0 - dd, y0, Math.min(z0, z1), x0 + dd, y1, Math.max(z0, z1), hex) : bb(Math.min(x0, x1), y0, z0 - dd, Math.max(x0, x1), y1, z0 + dd, hex));
      B(2.40, 2.53, STAIN, d); if (rail) B(4.52, 4.57, STAIN, d); B(5.30, 5.40, CEIL, d * 2);
    };
    trimRun(-6.85, -8.85, -6.85, -0.15); trimRun(2.85, -4.85, 2.85, -0.15); trimRun(-6.85, -0.15, -0.45, -0.15); trimRun(0.45, -0.15, 2.85, -0.15);
    trimRun(-6.85, -4.85, -5.6, -4.85); trimRun(-2.4, -4.85, 2.85, -4.85); trimRun(-6.85, -8.85, -1.5, -8.85, false); trimRun(-1.5, -8.85, -1.5, -5.0);
    trimRun(-6.85, -5.0, -5.6, -5.0); trimRun(-2.4, -5.0, -1.5, -5.0);
    // the fretwork arch to the kitchen
    for (const x of [-5.6, -2.4]) bb(x - 0.05, 2.40, -5.03, x + 0.05, 5.40, -4.82, STAIN);
    bb(-5.65, 4.56, -5.03, -2.35, 4.64, -4.82, STAIN);
    alphaRun(-5.55, -4.925, -2.45, -4.925, 4.64, 5.32, AL.fret, 0.78, 0.68, 0x6a4430);
    // the hall door (shut), its frame and knob; a light switch; power points
    bb(1.12, 2.40, -4.84, 2.18, 4.58, -4.81, STAIN); bb(1.2, 2.40, -4.83, 2.1, 4.50, -4.79, 0x7a5236);
    for (const [y0, y1] of [[2.6, 3.4], [3.55, 4.35]]) for (const [x0, x1] of [[1.28, 1.6], [1.7, 2.02]]) bb(x0, y0, -4.80, x1, y1, -4.785, 0x6a4630);
    ico(0.03, BRASS, 1.98, 3.42, -4.77);
    bb(0.56, 3.55, -0.16, 0.64, 3.67, -0.145, 0xf0e8d8); bb(-1.1, 2.62, -0.16, -1.0, 2.68, -0.145, 0xf0e8d8); bb(2.84, 2.62, -1.6, 2.855, 2.68, -1.5, 0xf0e8d8);
    // ---- the front room
    // the mantel (disused fireplace): surround, firebox, hearth, shelf; the bay print above it
    bb(-6.85, 2.40, -3.4, -6.62, 3.52, -1.6, 0x7a5236); bb(-6.625, 2.40, -2.85, -6.615, 3.05, -2.15, 0x1e1a18);
    bb(-6.85, 2.40, -3.5, -6.35, 2.43, -1.5, 0x8a3a30); bb(-6.85, 3.52, -3.5, -6.60, 3.60, -1.5, STAIN);
    for (let k = 0; k < 5; k++) cyl(0.012, 0.012, 0.35, 5, 0x8a6a3a, -6.75, 2.62, -2.62 + k * 0.06);
    srand(91); for (let k = 0; k < 7; k++) ico(0.05, ['#c87a3a', '#d8b46a', '#a85a5a'][k % 3], -6.75 + (rnd() - 0.5) * 0.06, 2.84 + rnd() * 0.12, -2.62 + rnd() * 0.24, 0.7);
    cyl(0.025, 0.03, 0.18, 8, 0xf2ead6, -6.72, 3.69, -1.75); cyl(0.04, 0.04, 0.012, 10, BRASS, -6.72, 3.606, -1.75);
    cyl(0.1, 0.06, 0.035, 12, 0x5a7aa0, -6.72, 3.618, -3.2);
    bb(-6.85, 3.98, -2.88, -6.83, 4.72, -1.92, 0x3a2618); quadR(0.62, 0.465, M.atlasIn, RG.bay, -6.826, 4.35, -2.4, H);
    // the armchairs: Rue's faded rose floral (and the crocheted rug), Luka's sage, Chase's rust
    armchair(-5.40, -2.10, 1.32, 0, RG.floral);
    at(-5.40, -2.10, 1.32, 2.40); quadR(0.62, 0.46, M.atlasIn, RG.crochet, 0, 0.8, -0.36, PI, -0.12); quadR(0.62, 0.2, M.atlasIn, RG.crochet, 0, 1.06, -0.28, 0, -H + 0.3); XF = null;
    armchair(-2.35, -3.50, -1.00, SAGE); armchair(-2.30, -1.05, -2.10, RUSTC);
    // the side table: the reading lamp (the Walkman and the brick phone are props)
    bb(-5.78, 2.96, -1.25, -5.33, 3.00, -0.45, STAIN); bb(-5.76, 2.62, -1.23, -5.35, 2.645, -0.47, STAIN);
    for (const [x, z] of [[-5.75, -1.22], [-5.36, -1.22], [-5.75, -0.48], [-5.36, -0.48]]) bb(x - 0.02, 2.40, z - 0.02, x + 0.02, 2.96, z + 0.02, STAIN);
    cyl(0.055, 0.06, 0.025, 10, BRASS, -5.70, 3.012, -0.52); cyl(0.01, 0.01, 0.34, 6, BRASS, -5.70, 3.19, -0.52); cyl(0.07, 0.12, 0.16, 12, 0xefe2c4, -5.70, 3.42, -0.52);
    // the coffee table (oval) on its rug
    cyl(0.5, 0.5, 0.04, 18, STAIN, -3.7, 2.80, -2.3, 0, 0, M.vcIn, 0.6); cyl(0.42, 0.42, 0.025, 16, STAIN, -3.7, 2.55, -2.3, 0, 0, M.vcIn, 0.6);
    for (const [x, z] of [[-4.05, -2.42], [-3.35, -2.42], [-4.05, -2.18], [-3.35, -2.18]]) cyl(0.02, 0.018, 0.4, 6, STAIN, x, 2.60, z);
    quadR(2.4, 1.8, M.atlasIn, RG.rug, -3.7, 2.404, -2.3, 0, -H);
    // the sideboard (cassettes, a lamp, a bowl; the framed card is a prop), the round mirror above it
    bb(2.37, 2.52, -3.8, 2.85, 3.21, -2.0, STAIN); bb(2.35, 3.21, -3.82, 2.85, 3.25, -1.98, 0x4a2e1c);
    for (const [x, z] of [[2.42, -3.75], [2.8, -3.75], [2.42, -2.05], [2.8, -2.05]]) bb(x - 0.02, 2.40, z - 0.02, x + 0.02, 2.52, z + 0.02, STAIN);
    for (const z of [-3.35, -2.45]) { bb(2.355, 2.6, z - 0.4, 2.37, 3.14, z + 0.4, 0x6a4630); ico(0.018, BRASS, 2.35, 2.9, z + (z < -3 ? 0.32 : -0.32)); }
    bb(2.42, 3.25, -2.42, 2.66, 3.37, -2.28, 0x2a2c30); quadR(0.14, 0.12, M.atlasIn, RG.cassettes, 2.415, 3.31, -2.35, -H);
    cyl(0.06, 0.07, 0.03, 10, 0x8a6a4a, 2.6, 3.265, -3.55); cyl(0.012, 0.012, 0.3, 6, 0x8a6a4a, 2.6, 3.42, -3.55); cyl(0.08, 0.13, 0.17, 12, 0xe8dcc0, 2.6, 3.62, -3.55);
    cyl(0.11, 0.06, 0.06, 12, 0x6a8aa8, 2.62, 3.28, -2.05);
    cyl(0.36, 0.36, 0.03, 18, 0x3a2618, 2.835, 4.1, -2.9, 0, H); cyl(0.31, 0.31, 0.034, 18, 0xa8bcc4, 2.835, 4.1, -2.9, 0, H);
    // the standard lamp, the bookshelf, the corkboard's frame (the cork itself is a prop)
    cyl(0.14, 0.16, 0.03, 12, 0x3a2a20, -6.4, 2.415, -4.4); cyl(0.018, 0.018, 1.56, 6, 0x5a4030, -6.4, 3.2, -4.4); cyl(0.13, 0.22, 0.3, 12, 0xefe2c4, -6.4, 4.12, -4.4);
    bb(0.45, 2.40, -4.85, 1.05, 3.55, -4.55, STAIN);
    for (const y of [2.42, 2.82, 3.2]) { bb(0.48, y, -4.83, 1.02, y + 0.02, -4.57, 0x6a4630); quadR(0.52, 0.26, M.atlasIn, RG.books, 0.75, y + 0.15, -4.565, 0); }
    bb(-1.96, 3.24, -4.85, 0.36, 4.56, -4.805, STAIN);
    // the ceiling fan's rose and rod (the blades turn: the prop)
    cyl(0.13, 0.13, 0.02, 12, CEIL, -2.4, 5.39, -2.4); cyl(0.018, 0.018, 0.12, 6, 0x6a5038, -2.4, 5.33, -2.4);
    // ---- the kitchen
    const DOOR = 0x2a3a34;
    bb(-6.70, 2.48, -8.85, -4.72, 3.24, -8.27, MINT); bb(-4.08, 2.48, -8.85, -2.05, 3.24, -8.27, MINT);
    bb(-6.70, 2.40, -8.80, -4.72, 2.48, -8.30, 0x3a3a36); bb(-4.08, 2.40, -8.80, -2.05, 2.48, -8.30, 0x3a3a36);
    for (let x = -6.2; x < -4.72; x += 0.5) bb(x - 0.005, 2.5, -8.271, x + 0.005, 3.22, -8.265, DOOR);
    for (let x = -3.58; x < -2.05; x += 0.5) bb(x - 0.005, 2.5, -8.271, x + 0.005, 3.22, -8.265, DOOR);
    for (let x = -6.45; x < -4.72; x += 0.5) bb(x - 0.04, 3.08, -8.27, x + 0.04, 3.1, -8.25, STEEL);
    for (let x = -3.83; x < -2.05; x += 0.5) bb(x - 0.04, 3.08, -8.27, x + 0.04, 3.1, -8.25, STEEL);
    bb(-6.72, 3.24, -8.86, -4.72, 3.30, -8.23, 0xe8e0c8); bb(-4.08, 3.24, -8.86, -2.03, 3.30, -8.23, 0xe8e0c8);
    bb(-6.72, 3.26, -8.235, -4.72, 3.29, -8.225, STEEL); bb(-4.08, 3.26, -8.235, -2.03, 3.29, -8.225, STEEL);
    bb(-5.8, 3.296, -8.75, -5.2, 3.306, -8.35, STEEL); bb(-5.72, 3.299, -8.68, -5.28, 3.308, -8.42, 0x8c9094);
    cyl(0.012, 0.012, 0.18, 6, STEEL, -5.5, 3.39, -8.78); boxR(0.02, 0.02, 0.16, STEEL, -5.5, 3.47, -8.71);
    bb(-6.70, 3.30, -8.86, -2.05, 3.45, -8.845, 0xd8e4dc);
    // the stove (old enamel, freestanding): oven door, hotplates, the splashback panel with knobs, a tea towel
    bb(-4.72, 2.40, -8.85, -4.08, 3.28, -8.27, 0xefe8d6); bb(-4.66, 2.55, -8.27, -4.14, 3.0, -8.255, 0xe2dac6); bb(-4.55, 2.68, -8.256, -4.25, 2.9, -8.25, 0x2a2c30);
    bb(-4.6, 3.04, -8.27, -4.2, 3.06, -8.24, STEEL);
    for (const [x, z] of [[-4.55, -8.68], [-4.25, -8.68], [-4.55, -8.42], [-4.25, -8.42]]) cyl(0.09, 0.09, 0.012, 12, 0x1e1e20, x, 3.286, z);
    bb(-4.72, 3.28, -8.85, -4.08, 3.5, -8.79, 0xefe8d6); for (let k = 0; k < 4; k++) cyl(0.02, 0.02, 0.02, 8, 0x2a2a2c, -4.62 + k * 0.14, 3.38, -8.78, H);
    quadR(0.22, 0.32, M.atlasIn, [64, 192, 21, 64], -4.45, 2.9, -8.235, 0);
    // overhead cupboards beside the window
    bb(-6.70, 4.25, -8.85, -6.08, 5.0, -8.5, MINT); bb(-3.52, 4.25, -8.85, -2.05, 5.0, -8.5, MINT);
    bb(-6.395, 4.3, -8.501, -6.385, 4.95, -8.495, DOOR); bb(-2.785, 4.3, -8.501, -2.775, 4.95, -8.495, DOOR);
    louvres(-6.0, -3.6, 3.45, 4.6, -8.95, -8.85, 3);
    // the fridge (retro cream), the kitchen table (laminex, chrome) and two chairs
    bb(-2.0, 2.40, -8.85, -1.5, 3.75, -8.15, 0xece4cc); cyl(0.35, 0.35, 0.5, 12, 0xece4cc, -1.75, 3.75, -8.5, 0, H, M.vcIn, 1);
    bb(-2.005, 3.42, -8.16, -1.495, 3.43, -8.145, 0xb8b0a0); bb(-1.6, 3.0, -8.15, -1.57, 3.35, -8.12, STEEL); bb(-1.6, 3.5, -8.15, -1.57, 3.75, -8.12, STEEL);
    cyl(0.45, 0.45, 0.04, 18, 0xd9cfb6, -4.30, 3.14, -6.70); cyl(0.455, 0.455, 0.025, 18, STEEL, -4.30, 3.115, -6.70); cyl(0.03, 0.03, 0.72, 8, STEEL, -4.30, 2.76, -6.70); cyl(0.25, 0.25, 0.02, 12, STEEL, -4.30, 2.41, -6.70);
    for (const [x, z, ry] of [[-4.95, -6.75, H], [-4.30, -7.30, 0]]) {
      at(x, z, ry, 2.40);
      for (const [lx, lz] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) cyl(0.012, 0.012, 0.45, 6, STEEL, lx, 0.225, lz);
      bb(-0.21, 0.45, -0.2, 0.21, 0.5, 0.2, 0x4f8f8a); bb(-0.2, 0.62, -0.22, 0.2, 0.86, -0.18, 0x4f8f8a); bb(-0.19, 0.5, -0.215, -0.17, 0.66, -0.2, STEEL); bb(0.17, 0.5, -0.215, 0.19, 0.66, -0.2, STEEL);
      XF = null;
    }
    tint = OUT; DEF = M.vc;
  }

  // ---------------------------------------------------------- props (named groups; APIs on userData)
  const smoothDoor = (d) => ({ obj: d.obj, u: 0, from: 0, to: 0, k: 1, dur: d.dur, maxA: d.maxA });
  function doorTo(d, u, instant) {
    u = Math.max(0, Math.min(1, +u || 0));
    if (instant || skipping()) { d.u = d.from = d.to = u; d.k = 1; d.obj.rotation.y = d.maxA * u; return; }
    d.from = d.u; d.to = u; d.k = 0;
  }
  function buildProps(root) {
    const P = (g) => (root.add(g), g);
    // -- the screen door: hinged at x +0.45 on the verandah face, opens outward (toward the yard)
    tint = SHADE; DEF = M.vc;
    R.screen = P(part('screen_door', () => {
      const G = 0x3f6b52;
      bb(-0.88, 0, -0.015, -0.82, 2.08, 0.015, G); bb(-0.06, 0, -0.015, 0, 2.08, 0.015, G);
      bb(-0.88, 2.0, -0.015, 0, 2.08, 0.015, G); bb(-0.88, 0.95, -0.015, 0, 1.05, 0.015, G); bb(-0.88, 0, -0.015, 0, 0.16, 0.015, G);
      quad(0.76, 0.95, M.mesh, -0.44, 1.525, 0, 0, 0, 0xffffff); quad(0.76, 0.79, M.mesh, -0.44, 0.555, 0, 0, 0, 0xffffff);
      quadR(0.2, 0.2, M.alpha, AL.bracket, -0.16, 1.9, 0.017, 0, 0, G, 128, 128, true); quadR(0.2, 0.2, M.alpha, AL.bracket, -0.72, 1.9, 0.017, 0, 0, G, 128, 128, false);
      bb(-0.86, 1.0, 0.015, -0.78, 1.04, 0.05, BRASS); bb(-0.8, 0.96, 0.03, -0.78, 1.08, 0.05, BRASS);
    }, [0.45, 2.40, 0.03], 0, { y0: 0 }));
    R.dScreen = smoothDoor({ obj: R.screen, dur: 0.5, maxA: 1.6 }); R.screenBounce = 0; R.screenWas = 0;
    R.screen.userData.open = (u) => { const was = R.dScreen.to; doorTo(R.dScreen, u); if (R.dScreen.to === 0 && was > 0 && !skipping()) R.screenWas = 1; };
    // -- the front door (inner): hinged at x -0.45, opens inward
    tint = IN; DEF = M.vcIn;
    R.front = P(part('front_door', () => {
      const D = 0x7a5236, PN = 0x6a4630;
      bb(0.0, 0, -0.022, 0.9, 2.08, 0.022, D);
      bb(0.12, 1.2, -0.024, 0.78, 1.95, 0.024, 0xffffff, M.glass);
      for (const s of [-1, 1]) { bb(0.12, 0.2, s * 0.023 - 0.004, 0.42, 1.05, s * 0.023 + 0.004, PN); bb(0.48, 0.2, s * 0.023 - 0.004, 0.78, 1.05, s * 0.023 + 0.004, PN); ico(0.03, BRASS, 0.82, 1.0, s * 0.05); }
    }, [-0.45, 2.40, -0.10], 0, { y0: 0 }));
    R.dFront = smoothDoor({ obj: R.front, dur: 0.7, maxA: 2.45 });
    R.front.userData.open = (u) => doorTo(R.dFront, u);
    // -- the brass bell: pivot under the bracket; a damped swing on ring()
    tint = SHADE; DEF = M.vc;
    R.bell = P(part('brass_bell', () => {
      cyl(0.012, 0.012, 0.06, 6, BRASS, 0, -0.03, 0); cyl(0.03, 0.03, 0.04, 10, BRASS, 0, -0.08, 0);
      cyl(0.048, 0.088, 0.13, 12, BRASS, 0, -0.165, 0); cyl(0.092, 0.092, 0.016, 12, 0xb8923a, 0, -0.23, 0); cyl(0.04, 0.05, 0.03, 10, 0xd8b45a, 0, -0.1, 0);
      ico(0.02, 0x8a6a2a, 0, -0.238, 0);
      bb(-0.006, -0.69, -0.006, 0.006, -0.24, 0.006, 0xc8302c); ico(0.022, 0xc8302c, 0, -0.7, 0, 1.3);
    }, [0.95, 4.31, 0.125], 0, { floor: false }));
    R.bell.userData.ring = () => { if (skipping()) return; R.bellOn = true; R.bellT = 0; R.bellPk = 0; };
    // -- the picket gate: hinged at x -0.55, opens inward (-Z); its collider parks while open
    tint = OUT;
    R.gate = P(part('gate', () => {
      bb(0.04, 0.16, -0.06, 1.06, 0.24, -0.0, TRIM); bb(0.04, 0.72, -0.06, 1.06, 0.8, 0.0, TRIM);
      rod(0.08, 0.22, -0.03, 1.0, 0.74, -0.03, 0.05, TRIM);
      for (let i = 0; i < 8; i++) { const x = 0.1 + i * 0.13; bb(x - 0.034, 0.03, 0.0, x + 0.034, 0.95, 0.02, TRIM); boxR(0.048, 0.048, 0.02, TRIM, x, 0.95, 0.01, 0, 0, PI / 4); }
      bb(0.98, 0.78, 0.02, 1.06, 0.84, 0.05, 0x2a2a2a);
    }, [-0.55, 0, 13.22], 0, { y0: 0 }));
    R.dGate = smoothDoor({ obj: R.gate, dur: 0.6, maxA: 1.5 });
    R.gate.userData.open = (u) => { const was = R.dGate.to; doorTo(R.dGate, u); if ((u > 0) !== (was > 0)) snd('gate_latch', 0.7, 0, 0.9, 13.2); };
    // -- the Walkman (side table): spools turn and the red LED is on while it plays
    tint = IN; DEF = M.vcIn;
    R.walkman = P(part('walkman', () => {
      bb(-0.075, 0, -0.052, 0.075, 0.032, 0.052, 0x6f86a0); bb(-0.07, 0.002, -0.056, 0.07, 0.03, -0.052, 0x5a6e86);
      quadR(0.15, 0.104, M.atlasIn, RG.walkman, 0, 0.0325, 0, 0, -H);
      bb(0.076, 0.008, -0.03, 0.08, 0.024, 0.0, 0x3a3e44);
    }, [-5.55, 3.00, -1.08], 1.06, { floor: false }));
    R.spools = [];
    for (const sx of [-0.042, 0.0]) {
      const s = part('walkman_spool', () => { cyl(0.0075, 0.0075, 0.003, 10, 0xf2f2ee, 0, 0, 0); for (let k = 0; k < 3; k++) boxR(0.012, 0.0035, 0.0025, 0x2a2a2c, 0, 0.0015, 0, 0, k * PI / 3, 0); }, [sx, 0.0345, 0.011], 0, { floor: false });
      R.walkman.add(s); R.spools.push(s);
    }
    R.wled = part('walkman_led', () => bb(-0.005, 0, -0.003, 0.005, 0.004, 0.003, 0xffffff, M.led), [0.06, 0.032, -0.044], 0, { floor: false });
    R.walkman.add(R.wled);
    R.walkman.userData.play = (on) => { R.wkOn = !!on; R.wled.visible = !!on; R.walkman.userData.playing = !!on; };
    // -- the brick phone lying on the side table: show(b); test(): TEST key down, LCD LINE OK for 2 s
    R.phone = P(part('brick_phone', () => {
      bb(-0.028, 0, -0.1, 0.028, 0.044, 0.1, 0x3b3e42); bb(-0.026, 0.002, 0.1, 0.026, 0.04, 0.106, 0x2a2c30);
      quadR(0.054, 0.19, M.atlasIn, RG.brick, 0, 0.0445, 0.002, 0, -H);
      cyl(0.006, 0.007, 0.13, 6, 0x232427, 0.012, 0.03, -0.165, H, 0);
    }, [-5.53, 3.00, -0.66], 0.95, { floor: false }));
    R.key = part('brick_test', () => bbT(-0.0186, 0, -0.0076, 0.0186, 0.003, 0.0076, [197, 71, 22, 9], M.atlasIn), [0, 0.0445, 0.0564], 0, { floor: false });   // the painted TEST key, raised
    R.phone.add(R.key); R.keyY = R.key.position.y;
    R.lcd = part('brick_lcd', () => quadR(0.0415, 0.021, M.lit, RG.lineok, 0, 0, 0, 0, -H), [0, 0.0452, -0.0594], 0, { floor: false });
    R.phone.add(R.lcd); R.lcd.visible = false;
    R.phone.userData.show = (on) => { R.phone.visible = !!on; };
    R.phone.userData.test = () => { R.keyT = 0.35; R.lcdT = 2.0; R.lcd.visible = true; R.key.position.y = R.keyY - 0.0035; };
    // -- the Polaroid copy on the mantel (standing frame, facing +X)
    R.polaroid = P(part('polaroid_copy', () => {
      bb(-0.012, 0, -0.075, 0.0, 0.17, 0.075, 0x2a2018); tint = LIFT_P; quadR(0.112, 0.14, M.atlasIn, RG.polaroid, 0.002, 0.088, 0, H); tint = IN;
      bb(-0.07, 0, -0.01, -0.012, 0.012, 0.01, 0x2a2018);
    }, [-6.70, 3.60, -2.30], 0, { floor: false }));
    R.polaroid.rotation.z = 0.12;
    // -- the corkboard: one repaintable texture (paint('2040' | '2031'))
    R.cork = P(part('corkboard', () => quad(2.2, 1.2, M.cork, 0, 0, 0, 0, 0, 0xffffff), [-0.8, 3.90, -4.792], 0, { floor: false }));
    R.cork.userData.paint = (era) => paintCorkTex(era === '2031' ? '2031' : '2040');
    // -- the framed Optus Christmas card 2036 on the sideboard (facing -X)
    R.card = P(part('xmas_card_2036', () => {
      bb(0.0, 0, -0.08, 0.012, 0.2, 0.08, 0x1a1c22); tint = LIFT_C; quadR(0.13, 0.1625, M.atlasIn, RG.xmas, -0.002, 0.1, 0, -H); tint = IN;   // faces away from the sun: lifted so it reads
      bb(0.012, 0, -0.01, 0.07, 0.012, 0.01, 0x1a1c22);
    }, [2.62, 3.25, -2.90], 0, { floor: false }));
    R.card.rotation.z = -0.12;
    // -- the biscuit tin on the coffee table: open(b) lifts the lid and leans it against the tin
    R.tin = P(part('bic_tin', () => {
      bb(-0.1, 0, -0.1, 0.1, 0.075, 0.1, 0xb8262a); bb(-0.092, 0.06, -0.092, 0.092, 0.07, 0.092, 0x8e1c20);
      srand(93); for (let k = 0; k < 9; k++) boxR(0.055, 0.012, 0.04, k % 3 ? 0xd8b47a : 0x8a5a32, (rnd() - 0.5) * 0.12, 0.068 + rnd() * 0.004, (rnd() - 0.5) * 0.12, 0.3 * (rnd() - 0.5), rnd() * PI, 0.3 * (rnd() - 0.5));
    }, [-3.50, 2.82, -2.25], 0.62, { floor: false }));
    R.lid = part('bic_tin_lid', () => { bb(-0.103, 0, -0.103, 0.103, 0.02, 0.103, 0xb8262a); quadR(0.2, 0.2, M.atlasIn, RG.tin, 0, 0.0205, 0, 0, -H); }, [0, 0.075, 0], 0, { floor: false });
    R.tin.add(R.lid); R.tinU = 0; R.tinTo = 0;
    R.tin.userData.open = (on, instant) => { R.tinTo = on ? 1 : 0; R.tin.userData.isOpen = !!on; if (instant || skipping()) { R.tinU = R.tinTo; tinPose(R.tinU, 0); } };
    // -- the kettle on the bench: boil(on) puffs steam every 0.6 s (click after 25 s), click() ends it. Origin above the lid
    R.kettle = P(part('kettle_rue', () => {
      const y = -0.26;
      cyl(0.115, 0.12, 0.022, 14, 0x1e1e20, 0, y + 0.011, 0); cyl(0.1, 0.112, 0.14, 14, STEEL, 0, y + 0.092, 0); cyl(0.058, 0.1, 0.05, 14, 0xd8dcde, 0, y + 0.187, 0);
      cyl(0.04, 0.05, 0.015, 12, 0x1e1e20, 0, y + 0.218, 0); ico(0.018, 0x1e1e20, 0, y + 0.232, 0);
      bb(-0.012, y + 0.17, -0.08, 0.012, y + 0.3, -0.06, 0x1e1e20); bb(-0.012, y + 0.17, 0.06, 0.012, y + 0.3, 0.08, 0x1e1e20); bb(-0.014, y + 0.29, -0.08, 0.014, y + 0.32, 0.08, 0x1e1e20);
      cyl(0.012, 0.022, 0.09, 8, STEEL, 0.13, y + 0.14, 0, 0, -0.85);
      bb(0.06, y + 0.03, 0.07, 0.08, y + 0.05, 0.09, 0x2a2a2c);
    }, [-3.20, 3.56, -8.50], -0.35, { floor: false }));
    R.klight = part('kettle_light', () => bb(-0.008, -0.004, -0.004, 0.008, 0.004, 0.004, 0xffffff, M.led), [0.07, -0.22, 0.102], 0, { floor: false });
    R.kettle.add(R.klight); R.klight.visible = false;
    R.kettle.userData.boil = (on) => { R.kettleOn = !!on; R.kettleT = 0; R.puffT = 0.2; R.klight.visible = !!on; };
    R.kettle.userData.click = () => { if (R.kettleOn) snd('kettle_click', 0.8, -3.2, 3.5, -8.5); R.kettleOn = false; R.klight.visible = false; };
    // -- the tea tray on the bench (knock24 / explore24) and the tea set on the coffee table (tea24 / gate24)
    const teapot = (x, z, sc = 1) => { cyl(0.075 * sc, 0.06 * sc, 0.1 * sc, 12, 0x6a3a22, x, 0.05 * sc + 0.01, z); ico(0.075 * sc, 0x6a3a22, x, 0.1 * sc, z, 0.6); ico(0.02 * sc, 0x5a2e1a, x, 0.155 * sc, z); cyl(0.01 * sc, 0.016 * sc, 0.08 * sc, 6, 0x6a3a22, x + 0.09 * sc, 0.09 * sc, z, 0, -0.9); bb(x - 0.11 * sc, 0.05 * sc, z - 0.008, x - 0.07 * sc, 0.12 * sc, z + 0.008, 0x6a3a22); };
    const cup = (x, z, full) => { cyl(0.065, 0.065, 0.008, 12, 0xf6f4ee, x, 0.004, z); cyl(0.045, 0.035, 0.06, 12, 0xf6f4ee, x, 0.038, z); cyl(0.046, 0.046, 0.008, 12, 0x3a6ab0, x, 0.06, z); if (full) cyl(0.04, 0.04, 0.004, 10, 0x8a5a32, x, 0.05, z); bb(x + 0.04, 0.03, z - 0.004, x + 0.06, 0.055, z + 0.004, 0xf6f4ee); };
    const jug = (x, z) => { cyl(0.035, 0.04, 0.08, 10, 0xf6f4ee, x, 0.04, z); cyl(0.036, 0.036, 0.006, 10, 0x3a6ab0, x, 0.075, z); };
    R.tray = P(part('tea_tray', () => {
      cyl(0.25, 0.25, 0.015, 16, 0xb8bcc0, 0, 0.008, 0, 0, 0, M.vcIn, 0.65);
      XF = mA.makeTranslation(0, 0.016, 0); teapot(-0.1, 0); cup(0.09, -0.08, false); cup(0.13, 0.06, false); cup(-0.02, 0.1, false); jug(0.17, -0.02); XF = null;
    }, [-4.98, 3.30, -8.52], 0, { floor: false }));
    R.tset = P(part('tea_set', () => { teapot(-0.28, -0.02); cup(-0.08, 0.17, true); cup(0.12, -0.2, true); cup(-0.3, -0.16, true); jug(0.34, 0.14); }, [-3.70, 2.82, -2.30], 0, { floor: false }));
    // -- the Rue mug by the kettle: I'M ON MUGS
    R.mug = P(part('rue_mug', () => { cyl(0.042, 0.04, 0.095, 12, 0xffffff, 0, 0.0475, 0); bb(0.04, 0.025, -0.006, 0.07, 0.075, 0.006, 0xffffff); quadR(0.056, 0.028, M.atlasIn, RG.mug, 0, 0.052, 0.0425, 0); }, [-2.80, 3.30, -8.40], 0.25, { floor: false }));
    // -- the mantel clock: hands from scene time (set(h, m); 10:30 advancing 1:1)
    R.clock = P(part('mantel_clock', () => {
      bb(-0.06, 0, -0.12, 0.06, 0.16, 0.12, STAIN); cyl(0.12, 0.12, 0.12, 14, STAIN, 0, 0.16, 0, 0, H); bb(-0.065, 0, -0.13, 0.065, 0.02, 0.13, 0x3a2618);
      quadR(0.15, 0.15, M.atlasIn, RG.clock, 0.0615, 0.16, 0, H);
    }, [-6.72, 3.60, -2.80], 0, { floor: false }));
    R.hourH = part('clock_hour', () => bb(-0.002, -0.006, -0.0045, 0.002, 0.045, 0.0045, 0x1a1a1a), [0.064, 0.16, 0], 0, { floor: false });
    R.minH = part('clock_min', () => bb(-0.002, -0.008, -0.003, 0.002, 0.064, 0.003, 0x1a1a1a), [0.066, 0.16, 0], 0, { floor: false });
    R.clock.add(R.hourH, R.minH); R.clockMin = 630;
    R.clock.userData.set = (h, m) => { R.clockMin = (+h || 0) * 60 + (+m || 0); };
    // -- the ceiling fan (four timber blades, always turning)
    R.fan = P(part('ceiling_fan', () => {
      cyl(0.07, 0.08, 0.1, 10, 0xe8e2d0, 0, 0, 0); cyl(0.03, 0.03, 0.04, 8, BRASS, 0, -0.07, 0);
      for (let k = 0; k < 4; k++) { const a = k * H; boxR(0.13, 0.012, 0.56, 0x7a5236, Math.sin(a) * 0.37, -0.02, Math.cos(a) * 0.37, 0, a, 0.12); boxR(0.04, 0.02, 0.1, BRASS, Math.sin(a) * 0.1, -0.02, Math.cos(a) * 0.1, 0, a, 0); }
    }, [-2.4, 5.25, -2.4], 0, { floor: false }));
    // -- the frangipani's canopy: leaf rosettes (alpha), 40 blossom clusters (instanced), sway; drop() lets one fall
    tint = OUT; DEF = M.vc;
    R.frang = P(new THREE.Group()); R.frang.name = 'frangipani'; R.frang.position.set(-4.2, 0, 9.0);
    R.frang.add(part('frangipani_leaves', () => {
      srand(57);
      for (const p of R.fPlan) {
        const a = rnd() * TAU;
        quadR(0.95, 0.95, M.alpha, AL.leaf, p[0], p[1], p[2], a, -H + (rnd() - 0.5) * 0.45, 0xffffff, 128, 128);
        quadR(0.72, 0.52, M.alpha, AL.leaf, p[0], p[1] - 0.06, p[2], a + 0.6, 0.25, 0xe8ffe8, 128, 128);
        quadR(0.72, 0.52, M.alpha, AL.leaf, p[0], p[1] - 0.06, p[2], a + 0.6 + H, -0.25, 0xe8ffe8, 128, 128);
      }
    }, null, 0, { floor: false }));
    const bloomGeo = geoOf(() => { flower(0, 0, 0, 1.5); flower(0.07, -0.015, 0.04, 1.4, 0.2); flower(-0.065, -0.02, 0.045, 1.4, -0.2); flower(0.015, -0.018, -0.07, 1.4, 0.15); });
    srand(59);
    const blooms = [];
    for (let i = 0; i < 40; i++) { const p = R.fPlan[(i * 7) % R.fPlan.length]; blooms.push([p[0] + (rnd() - 0.5) * 0.1, p[1] + 0.05, p[2] + (rnd() - 0.5) * 0.1, rnd() * TAU, 0.9 + rnd() * 0.3]); }
    IM(bloomGeo, M.vc, blooms, 'frangipani_blossoms', R.frang);
    R.fallGeo = geoOf(() => flower(0, 0.008, 0, 1.4));
    const fallen = []; srand(63);
    for (let i = 0; i < 12; i++) { const a = rnd() * TAU, r = 0.6 + rnd() * 2.2; fallen.push([-4.2 + Math.sin(a) * r, 0.005, 9.0 + Math.cos(a) * r, rnd() * TAU, 1]); }
    IM(R.fallGeo, M.vc, fallen, 'blossoms_fallen', root);
    R.drop = P(new THREE.Mesh(bloomGeo, M.vc)); R.drop.name = 'frangipani_drop'; R.drop.visible = false; R.dropT = -1;
    R.frang.userData.drop = () => {
      if (skipping()) return;
      const p = R.fPlan[(R.dropN = ((R.dropN || 0) + 7) % R.fPlan.length)];
      R.dropA[0] = -4.2 + p[0]; R.dropA[1] = p[1]; R.dropA[2] = 9.0 + p[2]; R.dropT = 0; R.drop.visible = true;
    };
    R.dropA = [0, 0, 0];
    // -- the Hills hoist: the head turns (arms, wires), three tea towels flap
    R.hoist = P(part('hills_hoist', () => {
      cyl(0.07, 0.07, 0.12, 8, 0x9aa0a6, 0, 0, 0);
      const RS = [0.7, 1.2, 1.65, 2.05];
      for (let k = 0; k < 4; k++) { const a = k * H; rod(0, 0.02, 0, Math.sin(a) * 2.1, 0.14, Math.cos(a) * 2.1, 0.035, 0xb8bec4); }
      for (const r of RS) for (let k = 0; k < 4; k++) { const a0 = k * H, a1 = a0 + H, y = 0.02 + 0.12 * r / 2.1; rod(Math.sin(a0) * r, y, Math.cos(a0) * r, Math.sin(a1) * r, y, Math.cos(a1) * r, 0.008, 0xd8d8d0); }
      rod(0, 0.05, 0, 0, 0.5, 0, 0.03, 0xb8bec4);
    }, [5.6, 1.9, 5.4], 0.3, { floor: false }));
    R.towels = [];
    for (let i = 0; i < 3; i++) {
      const k = i === 2 ? 2 : i, a0 = k * H + 0.0, r = 1.65 + (i === 1 ? 0.4 : 0), u = i === 2 ? 0.35 : 0.5, a1 = a0 + H;
      const px = Math.sin(a0) * r * (1 - u) + Math.sin(a1) * r * u, pz = Math.cos(a0) * r * (1 - u) + Math.cos(a1) * r * u, ry = Math.atan2(-(Math.cos(a1) - Math.cos(a0)), Math.sin(a1) - Math.sin(a0));
      const tw = part('hoist_towel', () => bbT(-0.22, -0.6, -0.004, 0.22, 0, 0.004, [64 + i * 21, 192, 21, 64], M.atlas), [px, 0.02 + 0.12 * r / 2.1, pz], ry, { floor: false });
      R.hoist.add(tw); R.towels.push(tw);
    }
    // -- the street hover-car (white, blue under-glow): glides x -80 -> the T, turns south; pass() off() on()
    R.car = P(part('hovercar_street', () => hoverCar(0xeef1f4), [-80, 0, 21.5], H, { floor: false }));
    const cb = blobShadow(); cb.scale.set(2.6, 1, 5.0); R.car.add(cb);
    R.carS = { on: true, active: false, d: 0, v: 6, wait: 6, sfx: false };
    R.car.userData.pass = () => { const C = R.carS; C.on = true; C.active = true; C.d = 0; C.v = 6; C.sfx = false; R.car.visible = true; };
    R.car.userData.off = () => { const C = R.carS; C.on = false; C.active = false; R.car.visible = false; };
    R.car.userData.on = () => { const C = R.carS; if (!C.on) { C.on = true; C.wait = 3; } };
    R.car.visible = false;
    // -- the lorikeets: two rainbow lorikeets cross the yard on a curve every 22–30 s
    const loriBody = geoOf(() => {
      boxR(0.09, 0.08, 0.2, 0x3aa03a, 0, 0, 0); boxR(0.075, 0.06, 0.08, 0xe8502a, 0, -0.015, 0.06);
      ico(0.05, 0x2a4ac8, 0, 0.02, 0.12); boxR(0.02, 0.02, 0.03, 0xd83a2a, 0, 0.01, 0.17);
      boxR(0.05, 0.012, 0.16, 0x3a9a3a, 0, -0.005, -0.16, 0.15); boxR(0.04, 0.02, 0.05, 0xd8c83a, 0, -0.03, 0.02);
    });
    const loriWing = geoOf(() => { boxR(0.22, 0.012, 0.12, 0x3aa03a, 0.11, 0, 0); boxR(0.12, 0.014, 0.08, 0xd8382a, 0.08, -0.004, 0.0); });
    R.lori = P(new THREE.Group()); R.lori.name = 'lorikeets';
    R.loriB = dyn(IM(loriBody, M.vc, [[0, -50, 0, 0, 0.001], [0, -50, 0, 0, 0.001]], 'lorikeet_bodies', R.lori));
    R.loriW = dyn(IM(loriWing, M.vc, [[0, -50, 0, 0, 0.001], [0, -50, 0, 0, 0.001], [0, -50, 0, 0, 0.001], [0, -50, 0, 0, 0.001]], 'lorikeet_wings', R.lori));
    R.loriOn = true; R.loriT = 5; R.flyT = -1; R.flyDir = 1;
    R.lori.userData.on = (b2) => { R.loriOn = !!b2; if (!b2) { R.flyT = -1; loriHide(); } };
    R.lori.userData.fly = () => { if (!skipping()) startFlight(); };
    // -- the storm bank over the bay: build(u) eases toward u (0.02/s), set(u) jumps, flicker(on)
    R.storm = P(new THREE.Group()); R.storm.name = 'storm_bank'; R.storm.position.y = 6;
    buildStorm(R.storm);
    R.storm.userData.build = (u) => { R.stormTo = Math.max(0, Math.min(1, +u || 0)); if (skipping()) { R.stormU = R.stormTo; R.stormDirty = true; } };
    R.storm.userData.set = (u) => { R.stormU = R.stormTo = Math.max(0, Math.min(1, +u || 0)); R.stormDirty = true; };
    R.storm.userData.flicker = (on) => { R.stormFl = !!on; };
    R.stormU = R.stormTo = 0.25; R.stormDirty = true; R.stormFl = false;
    // -- the louvre light: soft stripes on the floor under each bank (additive; opacity by env)
    R.louvre = P(new THREE.Group()); R.louvre.name = 'louvre_light';
    for (const [x0, x1] of [[-6.4, -3.9], [-3.7, -1.2], [1.0, 2.5]]) {
      const g = new THREE.PlaneGeometry(x1 - x0, 1.9); g.rotateX(-H); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setY(i, uv.getY(i) * 2);
      const m = new THREE.Mesh(g, SKY.louvre); m.position.set((x0 + x1) / 2 + 0.06, 2.412, -2.15); m.renderOrder = 2; R.louvre.add(m);
    }
    tint = OUT; DEF = M.vc;
  }
  function tinPose(u, lift) {
    const k = smooth(u), L = R.lid;
    L.position.set(0.112 * k, 0.075 + (0.092 - 0.075) * k + lift, 0); L.rotation.set(0, 0, -1.1 * k);
  }

  // ---------------------------------------------------------- instanced repeats
  function buildInstanced(root) {
    // verandah posts (6), pickets (138), house stumps (20), lawn tufts (160), hibiscus flowers (30)
    tint = SHADE;
    const postGeo = geoOf(() => { bb(-0.06, 0, -0.06, 0.06, 2.24, 0.06, TRIM); bb(-0.085, 0, -0.085, 0.085, 0.15, 0.085, TRIM); bb(-0.08, 2.0, -0.08, 0.08, 2.06, 0.08, TRIM); }, { floor: true });
    IM(postGeo, M.vc, POSTS.map((x) => [x, 2.40, 2.72, 0]), 'verandah_posts', root);
    tint = OUT;
    const picketGeo = geoOf(() => { bb(-0.034, 0, -0.01, 0.034, 0.92, 0.01, TRIM); boxR(0.048, 0.048, 0.02, TRIM, 0, 0.92, 0, 0, 0, PI / 4); }, { floor: true });
    const pk = []; for (let x = -8.92; x < -0.72; x += 0.12) pk.push([x, 0.03, 13.255, 0]); for (let x = 0.74; x < 8.95; x += 0.12) pk.push([x, 0.03, 13.255, 0]);
    IM(picketGeo, M.vc, pk, 'pickets', root);
    tint = UNDER;
    const stumpGeo = geoOf(() => bb(-0.1, 0, -0.1, 0.1, 2.24, 0.1, 0x8f8a80), { floor: true });
    const st = []; for (const x of [-6.5, -4.0, -1.5, 1.0, 2.6]) for (const z of [2.5, 0.0, -2.5, -5.0, -7.6]) if (!(x === -1.5 && z === 2.5)) st.push([x, 0, z, 0]);
    IM(stumpGeo, M.vc, st.slice(0, 20), 'stumps', root);
    tint = OUT;
    const tuftGeo = geoOf(() => { for (let k = 0; k < 3; k++) boxR(0.022, 0.14, 0.006, k === 1 ? 0x7a9e4a : 0x9cbc62, 0, 0.06, 0, (k - 1) * 0.3, k * PI / 3, 0); });
    const tf = []; srand(65);
    while (tf.length < 160) {
      const x = -8.7 + rnd() * 17.4, z = 2.95 + rnd() * 9.35;
      if (Math.abs(x) < 0.85 || (Math.hypot(x + 4.2, z - 9.0) < 0.4) || (Math.hypot(x - 5.6, z - 5.4) < 0.3) || (z < 3.2 && x > -7.2 && x < 3.2)) continue;
      tf.push([x, 0, z, rnd() * TAU, 0.8 + rnd() * 0.7]);
    }
    IM(tuftGeo, M.vc, tf, 'lawn_tufts', root);
    const hibGeo = geoOf(() => { for (let k = 0; k < 5; k++) { const a = k * TAU / 5; boxR(0.05, 0.008, 0.07, HIB, Math.sin(a) * 0.035, 0, Math.cos(a) * 0.035, -0.4, a, 0); } boxR(0.008, 0.06, 0.008, 0xf3dc8a, 0, 0.03, 0.01, 0.6, 0, 0); });
    const hb = []; srand(67);
    for (let i = 0; i < 30; i++) { const [x, r] = HIBX[i % HIBX.length], a = rnd() * PI - H * 0.2, e = rnd() * 0.9; hb.push([x + Math.sin(a) * Math.cos(e) * r * 0.85, r * 0.7 + Math.sin(e) * r * 0.55, 12.75 + Math.cos(a) * Math.cos(e) * r * 0.6, rnd() * TAU, 1.3]); }
    IM(hibGeo, M.vc, hb, 'hibiscus', root);
    // neighbours: walls (atlas facade, instance colours), skirts for the high-set ones, roofs (iron, instance colours)
    const wg = new THREE.BoxGeometry(1, 1, 1); wg.translate(0, 0.5, 0);
    for (let f = 0; f < 6; f++) uvRect(wg, f === 4 ? RG.facade : RG.white, 256, 256, false, f * 4, f * 4 + 4);
    bakeLight(wg, { floor: false });
    const NB = [[22, false], [40, true], [58, false], [-24, true], [-42, false], [-60, true], [-78, false], [-96, false], [-114, true], [-132, false]];
    const WCOL = [0xeef0ee, 0xdfe8d4, 0xf0dcc8, CREAM, 0xd8e0e4, 0xf4f0e2, 0xe6dcc8, 0xdfe8d4, 0xeef0ee, 0xf0dcc8];
    const RCOL = [0x6f8a6a, ROOF, 0x8a9096, 0x7a3a34, 0x8a9096, ROOF, 0x6f8a6a, 0x8a9096, 0x7a3a34, ROOF];
    const walls = NB.map(([x, hi]) => [x, hi ? 2.3 : 0.2, -4, 0, [10, hi ? 3.1 : 3.3, 9]]);
    R.nbW = IM(wg, M.atlas, walls, 'neighbours_walls', root);
    for (let i = 0; i < NB.length; i++) R.nbW.setColorAt(i, tc.set(WCOL[i]));
    R.nbW.instanceColor.needsUpdate = true;
    const sk = new THREE.BoxGeometry(1, 1, 1); sk.translate(0, 0.5, 0); bakeLight(sk, { floor: true, y0: 0 });
    tc.set(0x6a6660); const skc = sk.attributes.color; for (let i = 0; i < skc.count; i++) skc.setXYZ(i, skc.getX(i) * tc.r, skc.getY(i) * tc.g, skc.getZ(i) * tc.b);
    IM(sk, M.vc, NB.map(([x, hi]) => [x, 0, -4, 0, hi ? [9.8, 2.35, 8.8] : [9.8, 0.25, 8.8]]), 'neighbours_skirts', root);
    const rp = [], ru = [], C4 = [[-0.5, 0.5], [0.5, 0.5], [0.5, -0.5], [-0.5, -0.5]];
    for (let i = 0; i < 4; i++) { const a = C4[i], c2 = C4[(i + 1) % 4]; rp.push(a[0], 0, a[1], c2[0], 0, c2[1], 0, 1, 0); ru.push(0, 0, 17, 0, 8.5, 6); }
    const rg = new THREE.BufferGeometry(); rg.setAttribute('position', new THREE.Float32BufferAttribute(rp, 3)); rg.setAttribute('uv', new THREE.Float32BufferAttribute(ru, 2)); rg.computeVertexNormals();
    bakeLight(rg, { floor: false });
    R.nbR = IM(rg, M.iron, NB.map(([x, hi]) => [x, hi ? 5.4 : 3.5, -4, 0, [11, 2.4, 10]]), 'neighbours_roofs', root);
    for (let i = 0; i < NB.length; i++) R.nbR.setColorAt(i, tc.set(RCOL[i]));
    R.nbR.instanceColor.needsUpdate = true;
    // backdrop trees behind the houses
    const treeGeo = geoOf(() => { ico(1, 0x3f6a34, 0, 0, 0); ico(0.7, 0x4f7a3a, 0.4, 0.35, 0.2); });
    srand(69); const tr = [];
    for (let i = 0; i < 22; i++) { const x = -140 + rnd() * 200, z = -16 - rnd() * 26, s = 3 + rnd() * 2.5; if (x > -12 && x < 12 && z > -20) continue; tr.push([x, s * 0.9, z, rnd() * TAU, s]); }
    IM(treeGeo, M.vc, tr, 'backdrop_trees', root);
    // Norfolk pine tiers (4 trees x 6 tiers)
    // a Norfolk pine whorl: a low cone of branches with a drooping skirt of foliage (unit radius; instances scale it)
    const tierGeo = geoOf(() => {
      cyl(0.08, 1.0, 0.55, 8, 0x4a8052, 0, 0.275, 0); cyl(1.0, 0.84, 0.34, 8, 0x3a6a44, 0, -0.17, 0);
    });
    const tiers = [], PINES = [[-14, 30, 21], [2, 35, 23], [18, 31, 19], [34, 36, 22]];
    for (const [x, z, hh] of PINES) for (let k = 0; k < 11; k++) { const u = k / 10, y = 3.4 + u * (hh - 4.6), r = 3.0 - u * 2.35; tiers.push([x, y, z, k * 0.7, [r, 1.9 - u * 0.7, r]]); }
    for (const [x, z, hh] of PINES) tiers.push([x, hh - 1.4, z, 0, [0.42, 2.6, 0.42]]);
    IM(tierGeo, M.vc, tiers, 'pine_tiers', root);
    // the rock sea wall
    const rockGeo = geoOf(() => ico(0.6, ROCK, 0, 0, 0, 0.7));
    const rk = []; srand(73);
    for (let x = -100; x < 76; x += 1.5 + rnd() * 0.8) for (let row = 0; row < 2; row++) { const z = 45.2 + row * 1.6 + rnd() * 0.6, y = -(z - 44.5) / 4.1 * 2.6 + 0.2; rk.push([x, y, z, rnd() * TAU, [1.3 + rnd() * 0.9, 1 + rnd() * 0.6, 1.2 + rnd() * 0.8]]); }
    for (let z = -60; z < 46; z += 1.6 + rnd() * 0.8) for (let row = 0; row < 2; row++) { const x = 76.2 + row * 1.6 + rnd() * 0.6, y = -(x - 75.5) / 4.1 * 2.6 + 0.2; rk.push([x, y, z, rnd() * TAU, [1.3 + rnd() * 0.9, 1 + rnd() * 0.6, 1.2 + rnd() * 0.8]]); }
    IM(rockGeo, M.vc, rk, 'sea_rocks', root);
    // street lamps (pole, arm, head)
    const lampGeo = geoOf(() => { cyl(0.07, 0.09, 6.4, 8, 0x8a9096, 0, 3.2, 0); rod(0, 6.2, 0, 0, 6.5, 1.3, 0.06, 0x8a9096); boxR(0.24, 0.12, 0.52, 0xd8dcdc, 0, 6.45, 1.45); boxR(0.18, 0.02, 0.4, 0xf4f2e8, 0, 6.38, 1.45); }, { floor: true });
    IM(lampGeo, M.vc, [[-8, 0, 16.6, 0], [22, 0, 16.6, 0], [46, 0, 16.6, 0]], 'street_lamps', root);
  }

  // ---------------------------------------------------------- far group (MeshBasic, fog: false)
  const sstep = (e0, e1, x) => smooth((x - e0) / (e1 - e0));
  function profile(a) {   // silhouette height (m) at bearing a (degrees, from +Z toward +X)
    const n = Math.sin(a * 0.31) * 0.5 + Math.sin(a * 0.73 + 1.3) * 0.3 + Math.sin(a * 1.9 + 0.4) * 0.2;
    const isl = sstep(-26, -20, a) * (1 - sstep(24, 30, a)), islH = 2.0 + 2.6 * Math.exp(-(((a - 6) / 6) ** 2)) + 0.9 * Math.abs(Math.sin(a * 0.8)) + 0.3 * n;
    const bri = sstep(64, 70, a) * (1 - sstep(100, 106, a)), briH = 1.2 + 0.5 * n;
    let gh = 0; for (const [c, h, w] of [[114, 4.5, 1.6], [118, 6.4, 1.2], [121, 3.6, 1.0], [124, 5.2, 1.4], [128, 3.0, 1.2], [131, 4.0, 1.0]]) gh = Math.max(gh, h * Math.max(0, 1 - Math.abs(a - c) / w));
    const pen = a < 0 ? 1 - sstep(-56, -38, a) : sstep(136, 150, a), penH = 9 + 5 * n + 3 * Math.abs(Math.sin(a * 2.3));
    return Math.max(isl * islH, bri * briH, gh > 0 ? gh + 1.2 : 0, pen * penH);
  }
  function profileCol(a) { return a > -30 && a < 32 ? [0xc0ccd0, 0xd0dadc] : a > 60 && a < 140 ? [0x9cb0b8, 0xb8c8cc] : [0x7f9a8c, 0xa8bcb4]; }
  function buildFar(root) {
    const far = new THREE.Group(); far.name = 'far'; root.add(far);
    const N = 360, r = 460, wy = -2.0, pos = [], col = [];
    for (let i = 0; i < N; i++) {
      const a0 = -180 + i * 360 / N, a1 = a0 + 360 / N, h0 = profile(a0), h1 = profile(a1);
      if (h0 < 0.15 && h1 < 0.15) continue;
      const r0 = a0 * PI / 180, r1 = a1 * PI / 180, x0 = Math.sin(r0) * r, z0 = Math.cos(r0) * r, x1 = Math.sin(r1) * r, z1 = Math.cos(r1) * r, [ct, cb] = profileCol(a0);
      for (const [x, y, z, c] of [[x0, wy + h0, z0, ct], [x0, wy - 1, z0, cb], [x1, wy + h1, z1, ct], [x1, wy + h1, z1, ct], [x0, wy - 1, z0, cb], [x1, wy - 1, z1, cb]]) { pos.push(x, y, z); tc.set(c); col.push(tc.r, tc.g, tc.b); }
    }
    const bg = new THREE.BufferGeometry(); bg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); bg.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    const band = new THREE.Mesh(bg, SKY.land); band.name = 'band'; far.add(band);
    const hz = new THREE.CylinderGeometry(452, 452, 38, 48, 1, true); hz.translate(0, wy - 1 + 19, 0);
    const haze = new THREE.Mesh(hz, SKY.haze); haze.name = 'haze'; haze.renderOrder = -2; far.add(haze);
    const sk = new THREE.CylinderGeometry(456, 456, 80, 48, 1, true); sk.translate(0, wy - 40.5, 0);
    const skirt = new THREE.Mesh(sk, SKY.skirt); skirt.name = 'band_skirt'; far.add(skirt);
    R.sun = new THREE.Group(); R.sun.name = 'sun'; far.add(R.sun);
    R.sun.add(new THREE.Mesh(new THREE.CircleGeometry(8, 24), SKY.sun));
    const halo = new THREE.Mesh(new THREE.PlaneGeometry(48, 48), SKY.halo); halo.position.z = 0.5; halo.renderOrder = 2; R.sun.add(halo);
    // 6 cumulus cards facing the house
    const cp = [], cu = []; srand(97);
    for (let i = 0; i < 6; i++) {
      const a = (-120 + i * 52 + rnd() * 20) * PI / 180, d = 280 + rnd() * 160, y = 60 + rnd() * 90, w = 60 + rnd() * 50, h = w * 0.45;
      const cx = Math.sin(a) * d, cz = Math.cos(a) * d, ex = Math.cos(a) * w / 2, ez = -Math.sin(a) * w / 2;
      for (const [px, py, pz, u, v] of [[cx - ex, y - h / 2, cz - ez, 0, 0], [cx + ex, y - h / 2, cz + ez, 1, 0], [cx + ex, y + h / 2, cz + ez, 1, 1], [cx - ex, y - h / 2, cz - ez, 0, 0], [cx + ex, y + h / 2, cz + ez, 1, 1], [cx - ex, y + h / 2, cz - ez, 0, 1]]) { cp.push(px, py, pz); cu.push(u, v); }
    }
    const cg = new THREE.BufferGeometry(); cg.setAttribute('position', new THREE.Float32BufferAttribute(cp, 3)); cg.setAttribute('uv', new THREE.Float32BufferAttribute(cu, 2));
    R.clouds = new THREE.Mesh(cg, SKY.cloud); R.clouds.name = 'clouds'; R.clouds.renderOrder = -1; far.add(R.clouds);
    // the water: near -> far, past the sea wall and round the point
    R.water = part('water', () => {
      const zs = [46, 70, 110, 180, 300, 560], cs = [WNEAR, 0x58b0d0, 0x50a6cc, 0x489cc4, WFAR, WFAR];
      for (let i = 0; i < zs.length - 1; i++) gq(-560, zs[i], 560, zs[i + 1], -2.0, cs[i], cs[i + 1], M.water, 6);
      gq(76, -200, 560, 46, -2.0, 0x58b0d0, 0x58b0d0, M.water, 6);
    }, null, 0, { floor: false });
    root.add(R.water);
  }
  function gq(x0, z0, x1, z1, y, c0, c1, m, tile) {   // a ground quad with a colour gradient from z0 to z1 (no tint)
    const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0); g.rotateX(-H); g.translate((x0 + x1) / 2, y, (z0 + z1) / 2); worldUV(g, tile);
    const p = g.attributes.position, a = new Float32Array(p.count * 3); tc.set(c0); tc2.set(c1);
    for (let i = 0; i < p.count; i++) { const k = (p.getZ(i) - z0) / (z1 - z0); a[i * 3] = tc.r + (tc2.r - tc.r) * k; a[i * 3 + 1] = tc.g + (tc2.g - tc.g) * k; a[i * 3 + 2] = tc.b + (tc2.b - tc.b) * k; }
    g.setAttribute('color', new THREE.BufferAttribute(a, 3)); b.add(g, m);
  }
  // the storm bank: 6 anvil cards over the bay (base at the group's y 30); colours rewritten only while it eases
  function buildStorm(grp) {
    const pos = [], uv = []; srand(101);
    const cards = [[-150, 330, 120, 95], [-60, 390, 150, 130], [30, 410, 170, 125], [120, 380, 150, 115], [210, 360, 160, 120], [300, 330, 120, 90]];
    for (const [x, z, w, h] of cards) {
      const a = Math.atan2(x, z), ex = Math.cos(a) * w / 2, ez = -Math.sin(a) * w / 2;
      for (const [px, py, pz, u, v] of [[x - ex, 0, z - ez, 0, 0], [x + ex, 0, z + ez, 1, 0], [x + ex, h, z + ez, 1, 1], [x - ex, 0, z - ez, 0, 0], [x + ex, h, z + ez, 1, 1], [x - ex, h, z - ez, 0, 1]]) { pos.push(px, py, pz); uv.push(u, v); }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    const ca = new THREE.BufferAttribute(new Float32Array(pos.length), 3); ca.setUsage(THREE.DynamicDrawUsage); g.setAttribute('color', ca);
    R.stormV = new Float32Array(pos.length / 3); for (let i = 0; i < R.stormV.length; i++) R.stormV[i] = uv[i * 2 + 1];
    R.stormCol = ca;
    const m = new THREE.Mesh(g, SKY.storm); m.renderOrder = -1; m.frustumCulled = false; grp.add(m);
  }
  const STORM_LO = new THREE.Color(0xdde4e2), STORM_HI = new THREE.Color(0x4e5c58), STORM_RIM = new THREE.Color(0xc9d2cc);
  function stormPaint(u) {
    const a = R.stormCol.array, V = R.stormV;
    tc.copy(STORM_LO).lerp(STORM_HI, u);
    for (let i = 0; i < V.length; i++) { const k = V[i] * V[i] * 0.55 * u; a[i * 3] = tc.r + (STORM_RIM.r - tc.r) * k; a[i * 3 + 1] = tc.g + (STORM_RIM.g - tc.g) * k; a[i * 3 + 2] = tc.b + (STORM_RIM.b - tc.b) * k; }
    R.stormCol.needsUpdate = true;
    R.storm.scale.set(0.8 + 0.25 * u, 0.32 + 0.68 * u, 1);
  }

  // ---------------------------------------------------------- build
  function build() {
    COL.length = 0; T = textures(); initMats();
    const root = new THREE.Group(); root.name = 'rue_house_root'; R.root = root;
    BG = new Builder(); BU = new Builder(); XF = null;
    buildGround();
    buildVerandah();
    buildInterior();
    root.add(BG.done(), BU.done({ y0: 2.40 }));
    b = BG = BU = null;
    b = new Builder();   // scratch builder for parts built outside a section (part() swaps its own)
    buildProps(root);
    buildInstanced(root);
    b = new Builder(); buildFar(root); b = null;
    // colliders (spec §2.5): the shell, the verandah, the interior, the yard (+ the pots, the bookshelf, the kitchen chairs)
    COL.push(
      [-7.0, 2.70, -0.65, 2.85], [0.65, 2.70, 3.0, 2.85], [-0.75, 2.80, -0.62, 6.44], [0.62, 2.80, 0.75, 6.44],
      [-9.0, 2.20, -7.0, 2.40], [3.0, 2.20, 9.0, 2.40], [-9.2, -14, -9.0, 13.3], [9.0, -14, 9.2, 13.3],
      [-9.0, 13.15, -0.55, 13.30], [0.55, 13.15, 9.0, 13.30],
      [-7.0, 2.65, -0.65, 2.85], [0.65, 2.65, 3.0, 2.85], [-7.15, 0, -7.0, 2.85], [3.0, 0, 3.15, 2.85],
      [-7.0, -0.15, -0.45, 0.0], [0.45, -0.15, 3.0, 0.0], [-6.1, 0.8, -5.1, 1.6], [-1.25, 0.08, -0.6, 0.45],
      [-7.0, -9.0, -6.85, 0.0], [2.85, -9.0, 3.0, 0.0], [-7.0, -9.0, 3.0, -8.85], [-6.85, -5.0, -5.6, -4.85], [-2.4, -5.0, 2.85, -4.85],
      [-1.50, -8.85, -1.35, -5.0], [-6.85, -3.4, -6.55, -1.6], [-5.85, -2.55, -4.95, -1.65], [-5.78, -1.25, -5.33, -0.45],
      [-4.20, -2.60, -3.20, -2.00], [-2.80, -3.95, -1.90, -3.05], [-2.75, -1.50, -1.85, -0.60], [2.35, -3.8, 2.85, -2.0],
      [-6.55, -4.6, -6.25, -4.25], [-6.85, -8.85, -1.35, -8.15], [-5.2, -7.55, -3.85, -6.25], [0.45, -4.85, 1.05, -4.55],
      [-4.45, 8.75, -3.95, 9.25], [5.5, 5.3, 5.7, 5.5], [-8.8, 12.4, -1.0, 13.15], [1.0, 12.4, 8.8, 13.15],
    );
    R.gateCol = [-0.55, 13.15, 0.55, 13.30]; COL.push(R.gateCol);
    // state: dress for this scene now (the first update re-checks the scene once the env is known)
    R.scene = undefined; R.env = null; R.ambKey = null; R.torchOwned = false; R.pendingEnv = null; R.bellOn = false; R.kettleOn = false; R.lcdT = 0; R.keyT = 0;
    dress(R.explicit && R.state ? R.state : 'knock24', { auto: true, keepEnv: true, build: true });
    if (typeof TEST !== 'undefined' && TEST.setview === 'rue_house' && typeof window !== 'undefined' && window.TWO_TEST) {
      window.TWO_TEST.dress = (s, o) => dress(s, o || {});
      window.TWO_TEST.call = (p, fn, ...a) => { const o = R.root.getObjectByName(p); return o && o.userData[fn] ? o.userData[fn](...a) : undefined; };
    }
    return root;
  }

  // ---------------------------------------------------------- dressing
  const AUTO = { '2.4': 'knock24' };
  const ENV_DRESS = { morning24: 'knock24', inside24: 'explore24', building24: 'gate24', cork31: 'cork31' };
  const DRESS = {   // spec §12
    knock24:   { env: 'morning24',  screen: 0, front: 1, walk: true,  phone: false, kettle: false, tray: true,  set: false, tin: false, cork: '2040', storm: 0.25, car: true,  lori: true,  clock: 630 },
    explore24: { env: 'inside24',   screen: 0, front: 1, walk: false, phone: false, kettle: true,  tray: true,  set: false, tin: false, cork: '2040', storm: 0.30, car: true,  lori: true,  clock: 634 },
    tea24:     { env: 'inside24',   screen: 0, front: 1, walk: false, phone: true,  kettle: false, tray: false, set: true,  tin: false, cork: '2040', storm: 0.45, car: true,  lori: false, clock: 646 },
    gate24:    { env: 'building24', screen: 1, front: 1, walk: false, phone: false, kettle: false, tray: false, set: true,  tin: true,  cork: '2040', storm: 0.55, car: false, lori: false, clock: 680 },
    cork31:    { env: 'cork31',     screen: 0, front: 0, walk: false, phone: true,  kettle: false, tray: false, set: false, tin: false, cork: '2031', storm: 0,    car: false, lori: false, clock: 595 },
  };
  const AMB = {   // spec §10 (every name is a bed in 03-audio: AUDIO.loopNames())
    knock24: { loops: ['cicadas', 'birds', 'surf_far', 'wind_soft'], room: 'none' },
    explore24: { loops: ['fan', 'clock', ['cicadas', 0.4], ['birds', 0.35]], room: 'room' },
    tea24: { loops: ['fan', 'clock', ['cicadas', 0.4], ['birds', 0.35]], room: 'room' },
    gate24: { loops: ['cicadas', ['wind_soft', 0.85], 'surf_far'], room: 'none' },
    cork31: { loops: ['fan', 'clock', ['birds', 0.5]], room: 'room' },
  };
  const NOOPT = {}, AUTO_O = { auto: true }, AUTO_KEEP = { auto: true, keepEnv: true };
  function paintCorkTex(era) {
    if (!T || R.corkEra === era) return;
    R.corkEra = era; paintCork(T.cork.image.getContext('2d'), era); T.cork.needsUpdate = true;
  }
  function dress(st, o = NOOPT) {
    if (!DRESS[st]) st = 'knock24';
    const D = DRESS[st];
    R.state = st;
    if (!o.auto) R.explicit = true;
    if (!o.build && typeof state !== 'undefined' && state) R.scene = state.scene;
    if (!R.root || !R.screen) return;
    doorTo(R.dScreen, D.screen, true); doorTo(R.dFront, D.front, true); doorTo(R.dGate, 0, true); R.screenWas = 0; R.screenBounce = 0;
    R.walkman.userData.play(D.walk);
    R.phone.userData.show(D.phone); R.lcdT = 0; R.lcd.visible = false; R.keyT = 0; R.key.position.y = R.keyY;
    R.kettle.userData.boil(D.kettle);
    R.tray.visible = D.tray; R.tset.visible = D.set;
    R.tin.userData.open(D.tin, true);
    paintCorkTex(D.cork);
    R.stormU = R.stormTo = D.storm; R.stormDirty = true; R.stormFl = false;
    if (D.car) { R.carS.on = true; R.carS.active = false; R.carS.wait = 4; R.car.visible = false; } else R.car.userData.off();
    R.loriOn = D.lori; R.flyT = -1; R.loriT = 6; loriHide();
    R.clockMin = D.clock;
    R.dropT = -1; R.drop.visible = false;
    R.bellOn = false; R.bell.rotation.z = 0;
    if (!o.keepEnv) {
      if (isLive() && typeof world !== 'undefined' && world.env) world.env(D.env, 0, 'rue_house'); else R.pendingEnv = D.env;
    }
    R.ambKey = null;
  }
  function sendAmbience() {
    R.ambKey = R.state;
    if (typeof AUDIO === 'undefined' || !AUDIO.ambience) return;
    const a = AMB[R.state] || AMB.knock24;
    try { AUDIO.ambience(a); if (AUDIO.setRoom) AUDIO.setRoom(a.room || 'none'); } catch (e) { /* audio not up yet */ }
  }

  // ---------------------------------------------------------- env-driven: sun, louvre light, interior dimming, the lamp
  const SUN = { morning24: [0.30, 0.78, 0.55], inside24: [0.30, 0.78, 0.55], building24: [0.32, 0.70, 0.62], cork31: [0.35, 0.60, 0.72] };
  const HALO = { morning24: 0.9, inside24: 0.9, building24: 0.4, cork31: 0.85 };
  const LOUVRE = { morning24: 0.3, inside24: 0.35, building24: 0.15, cork31: 0.3 };
  const IN_K = { morning24: 0.62, inside24: 1, building24: 0.6, cork31: 1 };
  const CEILV_K = { morning24: 1, inside24: 1, building24: 0.82, cork31: 1 };
  const CEIL_IN_E = new THREE.Color(0xb4b0a4), CEIL_V_E = new THREE.Color(0x9c9a92), VJ_E = new THREE.Color(0x5a5e50);   // emissive bases (ceilings; the walls' bounce fill), before the env factor
  const FAR_TINT = { morning24: 0xffffff, inside24: 0xffffff, building24: 0xc8d0d0, cork31: 0xfff6ec };
  const LAMP = {   // the set's spot as the sunbeam / the corkboard pool: [pos, target, angle, penumbra, distance]
    inside24: [[-3.8, 6.6, 3.6], [-3.6, 2.4, -2.6], 0.40, 0.75, 14],
    cork31: [[-0.8, 5.2, -2.6], [-0.8, 3.9, -4.8], 0.35, 0.6, 6],
  };
  function applyEnv(name) {
    const d = SUN[name] || SUN.morning24, L = Math.hypot(d[0], d[1], d[2]);
    R.sun.position.set(d[0] / L * 420, d[1] / L * 420, d[2] / L * 420); R.sun.lookAt(0, 0, 0);
    SKY.halo.opacity = HALO[name] ?? 0.9;
    SKY.louvre.opacity = LOUVRE[name] ?? 0.3;
    const k = IN_K[name] ?? 1; for (const m of M.dim) m.color.setScalar(k);
    M.ceilIn.emissive.copy(CEIL_IN_E).multiplyScalar(k); M.vj.emissive.copy(VJ_E).multiplyScalar(k); M.ceilV.emissive.copy(CEIL_V_E).multiplyScalar(CEILV_K[name] ?? 1);
    SKY.land.color.set(FAR_TINT[name] ?? 0xffffff); SKY.cloud.color.set(FAR_TINT[name] ?? 0xffffff);
  }

  // ---------------------------------------------------------- sounds (rate-limited, never while skipping or off screen)
  const SFXALT = { bell_brass: ['bell', 2.4, 0.55], lorikeet: ['pigeons', 1.5, 0.5], hover_hum_pass: ['hover_by', 1, 0.8], screen_door_bang: ['clunk', 1.7, 0.8], gate_latch: ['clunk', 2.4, 0.5] };
  const SO = { vol: 1, rate: 1, at: [0, 0, 0] }, LAST = {};
  function snd(name, vol, x, y, z, gap = 0.5) {
    if (!isCur() || skipping() || typeof sfx !== 'function') return;
    const now = R.t || 0; if (LAST[name] != null && now - LAST[name] < gap && now >= LAST[name]) return; LAST[name] = now;
    let n = name, rate = 1;
    const B = typeof AUDIO !== 'undefined' && AUDIO.buffers ? AUDIO.buffers.B : null, alt = SFXALT[name];
    if (alt && (!B || !B[name])) { n = alt[0]; rate = alt[1]; vol *= alt[2]; }
    SO.vol = vol; SO.rate = rate; SO.at[0] = x; SO.at[1] = y; SO.at[2] = z;
    sfx(n, SO);
  }

  // ---------------------------------------------------------- ambient life (no allocation)
  // lorikeets: a cubic Bézier across the yard (2.6 s), the second bird 0.18 s behind and a little to the side
  const LP = [[-16, 5.5, 4.0], [-5, 3.2, 13.5], [6, 4.2, 2.5], [17, 6.5, 10.5]];
  function bez(k, u, dir) {
    const t = dir > 0 ? u : 1 - u, s = 1 - t;
    return s * s * s * LP[0][k] + 3 * s * s * t * LP[1][k] + 3 * s * t * t * LP[2][k] + t * t * t * LP[3][k];
  }
  function startFlight() { R.flyT = 0; R.flyDir = -R.flyDir; snd('lorikeet', 0.7, 0, 4, 8, 3); }
  function loriHide() {
    if (!R.loriB) return;
    m4.makeScale(0.001, 0.001, 0.001).setPosition(0, -50, 0);
    for (let i = 0; i < 2; i++) R.loriB.setMatrixAt(i, m4);
    for (let i = 0; i < 4; i++) R.loriW.setMatrixAt(i, m4);
    R.loriB.instanceMatrix.needsUpdate = true; R.loriW.instanceMatrix.needsUpdate = true;
  }
  function loriTick(dt, t) {
    if (R.flyT < 0) {
      if (!R.loriOn) return;
      R.loriT -= dt; if (R.loriT <= 0) { R.loriT = 22 + ((t * 7.31) % 8); startFlight(); } else return;
    }
    R.flyT += dt;
    let any = false;
    for (let i = 0; i < 2; i++) {
      const u = (R.flyT - i * 0.18) / 2.6;
      if (u < 0 || u > 1) { m4.makeScale(0.001, 0.001, 0.001).setPosition(0, -50, 0); R.loriB.setMatrixAt(i, m4); R.loriW.setMatrixAt(i * 2, m4); R.loriW.setMatrixAt(i * 2 + 1, m4); continue; }
      any = true;
      const off = i * 0.6, x = bez(0, u, R.flyDir), y = bez(1, u, R.flyDir) + i * 0.3, z = bez(2, u, R.flyDir) + off;
      const u2 = Math.min(1, u + 0.01), dx = bez(0, u2, R.flyDir) - x, dz = bez(2, u2, R.flyDir) + off - z;
      const yaw = Math.atan2(dx, dz) + (u2 === u ? 0 : 0), flap = 0.9 * Math.sin((R.flyT + i * 0.05) * TAU * 12);
      vA.set(x, y, z); sV.set(1.25, 1.25, 1.25);
      qA.setFromAxisAngle(YAX, yaw);
      R.loriB.setMatrixAt(i, m4.compose(vA, qA, sV));
      qB.setFromAxisAngle(ZAX, flap); qC.copy(qA).multiply(qB);
      R.loriW.setMatrixAt(i * 2, m4.compose(vA, qC, sV));
      qB.setFromAxisAngle(ZAX, -flap); qC.copy(qA).multiply(qB); qB.setFromAxisAngle(YAX, PI); qC.multiply(qB);
      R.loriW.setMatrixAt(i * 2 + 1, m4.compose(vA, qC, sV));
    }
    R.loriB.instanceMatrix.needsUpdate = true; R.loriW.instanceMatrix.needsUpdate = true;
    if (!any && R.flyT > 1) R.flyT = -1;
  }
  // the street hover-car: x -80 -> 62 along z 21.5, a left turn into the Esplanade's southbound lane, away south
  const CAR_A = 142, CAR_R = 3.2, CAR_B = CAR_R * H, CAR_END = CAR_A + CAR_B + 52;
  function carTick(dt, t) {
    const C = R.carS;
    if (!C.on) return;
    if (!C.active) { C.wait -= dt; if (C.wait > 0) return; C.active = true; C.d = 0; C.v = 6; C.sfx = false; R.car.visible = true; }
    let x, z, yaw;
    const xr = -80 + C.d, near = C.d < CAR_A && Math.abs(xr - 12) < 4;
    C.v += ((near ? 2 : 6) - C.v) * Math.min(1, dt * 2.2);
    C.d += C.v * dt;
    if (C.d < CAR_A) { x = -80 + C.d; z = 21.5; yaw = H; }
    else if (C.d < CAR_A + CAR_B) { const a = (C.d - CAR_A) / CAR_R; x = 62 + Math.sin(a) * CAR_R; z = 21.5 - CAR_R + Math.cos(a) * CAR_R; yaw = H + a; }
    else { x = 62 + CAR_R; z = 21.5 - CAR_R - (C.d - CAR_A - CAR_B); yaw = PI; }
    const hump = Math.abs(x - 12) < 1.1 && z > 17 ? 0.12 * Math.cos((x - 12) / 1.1 * H) : 0;
    R.car.position.set(x, hump + 0.02 * Math.sin(t * 2), z); R.car.rotation.y = yaw;
    if (!C.sfx && x > -16 && x < 10) { C.sfx = true; snd('hover_hum_pass', 0.9, 0, 0.6, 21.5, 2); }
    if (C.d > CAR_END) { C.active = false; C.wait = 18 + ((t * 3.7) % 6); R.car.visible = false; }
  }
  function doorTick(d, dt) {
    if (d.k >= 1) return;
    d.k = Math.min(1, d.k + dt / d.dur); d.u = d.from + (d.to - d.from) * smooth(d.k); d.obj.rotation.y = d.maxA * d.u;
  }
  function update(dt, ctx) {
    if (!R.root || !R.screen) return;
    const t = ctx.t, cur = isCur(), W_ = typeof world !== 'undefined' ? world : null;
    R.t = t;
    // scene change -> auto dress (2.4: knock24); other scenes and setview dress by env until someone calls dress()
    const sid = typeof state !== 'undefined' && state ? state.scene : null;
    if (sid !== R.scene) { R.scene = sid; R.explicit = false; if (AUTO[sid]) dress(AUTO[sid], AUTO_O); else dress(ENV_DRESS[ctx.env] || 'knock24', AUTO_KEEP); }
    else if (!R.explicit && !AUTO[sid] && ENV_DRESS[ctx.env] && ENV_DRESS[ctx.env] !== R.state) dress(ENV_DRESS[ctx.env], AUTO_KEEP);
    if (R.pendingEnv && W_ && W_.env && isLive()) { const p = R.pendingEnv; R.pendingEnv = null; W_.env(p, 0, 'rue_house'); }
    if (ctx.env !== R.env) { R.env = ctx.env; applyEnv(R.env); }
    if (cur && R.ambKey !== R.state) sendAmbience();
    // the spot as the louvre sunbeam (inside24) or the corkboard's pool of light (cork31)
    const lp = LAMP[R.env], sp = cur && W_ ? W_.torch : null;
    if (sp && lp) {
      W_.torchAuto = false; R.torchOwned = true;
      sp.position.set(lp[0][0], lp[0][1], lp[0][2]); sp.target.position.set(lp[1][0], lp[1][1], lp[1][2]); sp.target.updateMatrixWorld();
      sp.angle = lp[2]; sp.penumbra = lp[3]; sp.distance = lp[4]; sp.decay = 0;
    } else if (R.torchOwned) { R.torchOwned = false; if (cur && W_) W_.torchAuto = true; if (sp) sp.decay = 1.5; }
    if (cur && W_.scene && W_.scene.fog) { SKY.skirt.color.copy(W_.scene.fog.color); SKY.haze.color.copy(W_.scene.fog.color); }
    // doors and the gate (the gate's collider parks while it is more than half open); the screen door bangs shut
    doorTick(R.dScreen, dt); doorTick(R.dFront, dt); doorTick(R.dGate, dt);
    if (R.screenWas && R.dScreen.k >= 1 && R.dScreen.u === 0) { R.screenWas = 0; R.screenBounce = 0.35; snd('screen_door_bang', 0.9, 0.0, 3.4, 0.1); }
    if (R.screenBounce > 0) { R.screenBounce = Math.max(0, R.screenBounce - dt); R.screen.rotation.y = 0.07 * Math.sin((0.35 - R.screenBounce) * 40) * R.screenBounce / 0.35; }
    const gc = R.gateCol;
    if (R.dGate.u > 0.5) { gc[0] = gc[1] = gc[2] = gc[3] = 1e4; } else { gc[0] = -0.55; gc[1] = 13.15; gc[2] = 0.55; gc[3] = 13.30; }
    // the bell: a damped swing, a ring on the first two peaks
    if (R.bellOn) {
      R.bellT += dt; const T2 = R.bellT, a = 0.5 * Math.exp(-T2 / 0.6) * Math.sin(TAU * 2.2 * T2);
      R.bell.rotation.z = a;
      const pk = (0.25 + R.bellPk) / 2.2;
      if (R.bellPk < 2 && T2 >= pk) { R.bellPk++; snd('bell_brass', R.bellPk === 1 ? 0.9 : 0.6, 0.95, 4.1, 0.1, 0.3); }
      if (T2 > 1.6) { R.bellOn = false; R.bell.rotation.z = 0; }
    }
    // the fan, the mantel clock
    R.fan.rotation.y += 3.2 * dt;
    R.clockMin += dt / 60;
    R.hourH.rotation.x = -((R.clockMin / 60) % 12) / 12 * TAU; R.minH.rotation.x = -(R.clockMin % 60) / 60 * TAU;
    // the Walkman's spools, the brick phone's LCD and key
    if (R.wkOn) { R.spools[0].rotation.y -= 2 * dt; R.spools[1].rotation.y -= 2 * dt; }
    if (R.lcdT > 0) { R.lcdT -= dt; if (R.lcdT <= 0) R.lcd.visible = false; }
    if (R.keyT > 0) { R.keyT -= dt; if (R.keyT <= 0) R.key.position.y = R.keyY; }
    // the kettle: steam every 0.6 s while it boils, the click after 25 s
    if (R.kettleOn) {
      R.kettleT += dt; R.puffT -= dt;
      if (R.puffT <= 0) { R.puffT = 0.6; if (cur && W_ && W_.puff) W_.puff('kettle_rue', PUFFO); snd('steam', 0.12, -3.2, 3.6, -8.5, 0.55); }
      if (R.kettleT > 25) R.kettle.userData.click();
    }
    // the biscuit tin's lid
    if (R.tinU !== R.tinTo) { const s = dt / 0.4; R.tinU = R.tinU < R.tinTo ? Math.min(R.tinTo, R.tinU + s) : Math.max(R.tinTo, R.tinU - s); tinPose(R.tinU, 0.06 * Math.sin(PI * R.tinU)); }
    // the frangipani's sway, a falling blossom
    R.frang.rotation.z = 0.015 * Math.sin(TAU * 0.4 * t); R.frang.rotation.x = 0.01 * Math.sin(TAU * 0.31 * t + 1);
    if (R.dropT >= 0) {
      R.dropT += dt; const k = Math.min(1, R.dropT / 2.6), A0 = R.dropA;
      R.drop.position.set(A0[0] + Math.sin(R.dropT * 3.1) * 0.25 * (1 - k), A0[1] + (0.02 - A0[1]) * k, A0[2] + 0.4 * k + Math.cos(R.dropT * 2.3) * 0.12 * (1 - k));
      R.drop.rotation.set(0.6 * Math.sin(R.dropT * 4) * (1 - k), R.dropT * 1.7, 0.5 * Math.cos(R.dropT * 3) * (1 - k));
      if (k >= 1) R.dropT = -1;
    }
    // the Hills hoist and its towels
    const gust = 0.5 + 0.5 * Math.sin(t * 0.37) * Math.sin(t * 0.23 + 1);
    R.hoist.rotation.y += (0.12 + 0.1 * gust) * dt;
    for (let i = 0; i < 3; i++) R.towels[i].rotation.x = -(0.08 + 0.18 * gust) * (0.6 + 0.4 * Math.sin(t * (3.1 + i * 0.7) + i * 2.1));
    loriTick(dt, t);
    carTick(dt, t);
    M.glow.emissiveIntensity = 0.9 + 0.2 * Math.sin(t * 3);
    // water, clouds, the storm bank
    T.ripple.offset.set(t * 0.01, t * 0.016);
    R.clouds.position.x = 40 * Math.sin(t * 0.0075);
    if (R.stormU !== R.stormTo) { const d = R.stormTo - R.stormU, mx = 0.02 * dt; R.stormU += d > mx ? mx : d < -mx ? -mx : d; R.stormDirty = true; }
    if (R.stormDirty) { R.stormDirty = false; stormPaint(R.stormU); }
    let k = 1;
    if (R.stormFl) { if (typeof options !== 'undefined' && options.reduceFlashing) k = 0.9 + 0.1 * Math.sin(t * PI * 0.5); else if ((t * 5.3) % 1 < 0.08 && Math.sin(t * 0.71) > 0.75) k = 1.45; }
    SKY.storm.color.setScalar(k);
  }
  const PUFFO = { n: 6, speed: 0.22, life: 1.6, color: 0xf2f2f2, gravity: -0.6 };

  // ---------------------------------------------------------- data
  const MARKS = {
    // general
    bell: [0.95, 2.40, 0.72, PI], kettle: [-3.20, 2.40, -7.75, PI], gate_in: [0.0, 0, 12.5, 0], gate_out: [0.0, 0, 14.0, PI],
    stair_foot: [0.0, 0, 7.0, PI], stair_top: [0.0, 2.40, 2.4, PI],
    // 2.4 Knock + 2.4_door
    s24_start_chase: [0.15, 0, 11.6, PI], s24_start_luka: [-0.75, 0, 12.4, PI], s24_c40_gate: [-1.00, 0, 13.90, PI],
    s24_chase_door: [0.30, 2.40, 1.15, PI], s24_luka_door: [-0.75, 2.40, 1.55, 2.75], s24_rue_door: [0.00, 2.40, -0.30, 0],
    // 2.4 Rue's front room
    s24_in_chase: [0.10, 2.40, -1.35, -2.36], s24_in_luka: [0.85, 2.40, -1.00, -2.20], s24_rue_kettle: [-3.20, 2.40, -7.75, PI],
    s24_rue_side: [-4.85, 2.40, -0.85, -H], s24_rue_arch: [-4.00, 2.40, -4.60, 0.25], s24_rue_tray: [-3.70, 2.40, -1.65, PI],
    s24_look_polaroid: [-6.05, 2.40, -2.30, -H], s24_look_cork: [-0.80, 2.40, -3.90, PI], s24_look_walkman: [-4.75, 2.40, -1.15, -H],
    s24_look_brick: [-4.75, 2.40, -0.55, -H], s24_look_card: [2.00, 2.40, -2.90, H], s24_look_tin: [-3.70, 2.40, -1.55, PI],
    // 2.4_tea
    s24_seat_rue: [-5.40, 2.40, -2.10, 1.32], s24_seat_luka: [-2.35, 2.40, -3.50, -1.00], s24_seat_chase: [-2.30, 2.40, -1.05, -2.10],
    // 2.4_gate
    s24_rue_stair_top: [-0.35, 2.40, 2.60, 0], s24_rue_stair_foot: [-0.35, 0, 6.75, 0], s24_rue_gate: [-0.15, 0, 12.55, 0],
    s24_c40_gate_face: [-0.15, 0, 13.95, PI], s24_luka_yard: [-1.90, 0, 11.40, 0.50], s24_chase_yard: [1.50, 0, 11.30, -0.55],
    s24_walk_wp: [1.00, 0, 14.90, H], s24_walk_luka: [26.0, 0, 14.7, H], s24_walk_chase: [25.2, 0, 15.3, H], s24_walk_c40: [27.0, 0, 15.0, H],
    s24_rue_watch: [-0.95, 2.40, 2.45, 0.85],
  };
  const ANCHORS = {
    house_wide:         { at: [-1.6, 3.4, 1.0], from: [7.4, 1.65, 20.8], fov: 44 },
    bell:               { at: [0.95, 4.12, 0.10], from: [0.42, 3.78, 0.98], fov: 30 },
    s24_door_mid:       { at: [0.00, 3.95, -0.25], from: [-0.22, 3.90, 2.50], fov: 40 },
    s24_door_rev:       { at: [-0.25, 3.95, 1.40], from: [0.35, 4.05, -0.55], fov: 44 },
    polaroid_copy:      { at: [-6.70, 3.70, -2.30], from: [-6.05, 3.80, -2.25], fov: 26 },
    corkboard:          { at: [-0.80, 3.90, -4.83], from: [-0.80, 3.88, -3.20], fov: 46 },
    corkboard_end:      { at: [-0.50, 3.56, -4.83], from: [-0.66, 3.66, -3.98], fov: 30 },
    walkman:            { at: [-5.55, 3.04, -1.08], from: [-5.05, 3.40, -0.80], fov: 24 },
    brick_phone_table:  { at: [-5.53, 3.04, -0.66], from: [-5.05, 3.42, -0.30], fov: 24 },
    xmas_card_2036:     { at: [2.62, 3.36, -2.90], from: [1.80, 3.50, -2.85], fov: 28 },
    bic_tin:            { at: [-3.50, 2.90, -2.25], from: [-3.05, 3.52, -1.62], fov: 30 },
    kettle_rue:         { at: [-3.20, 3.42, -8.50], from: [-3.05, 3.78, -7.55], fov: 30 },
    s24_explore_room:   { at: [-3.5, 3.0, -3.0], from: [2.4, 4.9, -0.5], fov: 56 },
    s24_tea_wide:       { at: [-3.6, 3.25, -0.5], from: [-3.0, 4.25, -4.55], fov: 56 },
    s24_tea_rue:        { at: [-5.40, 3.55, -2.10], from: [-2.60, 3.65, -2.00], fov: 40 },
    s24_twoshot_boys:   { at: [-2.30, 3.45, -2.30], from: [-4.65, 3.62, -1.75], fov: 40 },
    s24_rue_to_luka:    { at: [-5.40, 3.55, -2.10], from: [-3.10, 3.60, -3.20], fov: 34 },
    s24_louvre_pov:     { at: [-1.00, 1.55, 13.90], from: [-5.25, 3.55, -1.95], fov: 30 },
    s24_yard_wide:      { at: [-0.3, 1.6, 8.6], from: [7.4, 2.3, 12.2], fov: 52 },
    s24_gate_two:       { at: [-0.15, 1.45, 13.25], from: [2.1, 1.55, 11.75], fov: 40 },
    s24_hands:          { at: [-0.15, 1.12, 13.25], from: [0.75, 1.40, 12.55], fov: 28 },
    s24_verandah_wide:  { at: [18.0, 1.4, 17.0], from: [-1.50, 3.90, 1.40], fov: 46 },
    s24_storm:          { at: [60, 50, 420], from: [6.0, 1.7, 13.9], fov: 40 },
    b1_cork31:          { at: [-0.95, 3.95, -4.83], from: [-0.85, 3.90, -3.85], fov: 34 },
    b1_room31:          { at: [-4.6, 3.0, -1.6], from: [-1.0, 4.3, -4.45], fov: 46 },
  };
  function floor(x, z) {
    if (x > -7.0 && x < 3.0 && z > -9.0 && z <= 2.8) return 2.40;                        // house + verandah
    if (x > -0.62 && x < 0.62 && z > 2.8 && z < 6.44) return 2.40 * (6.44 - z) / 3.64;  // the stairs (ramp)
    return 0;
  }
  return {
    env: {
      morning24:  { bg: 0x8fcff6, fog: [0xd6e8ee, 0.0060], hemi: [0xf0f6ff, 0xb39a70, 1.05], dir: [0xfff4e2, 1.70, [8, 18, 12]], spot: [0xffffff, 0],   rain: 0 },
      inside24:   { bg: 0x8fcff6, fog: [0xd6e8ee, 0.0060], hemi: [0xfff2e0, 0x8a7458, 0.95], dir: [0xffe8c8, 0.95, [4, 10, 12]],  spot: [0xffe2b0, 1.4], rain: 0 },
      building24: { bg: 0x7fa9c4, fog: [0xb8c6c4, 0.0068], hemi: [0xdfe8ee, 0x8c8a72, 0.95], dir: [0xfff0d8, 1.30, [6, 14, 10]],  spot: [0xffffff, 0],   rain: 0 },
      cork31:     { bg: 0x9fd4f4, fog: [0xd9eaf0, 0.0058], hemi: [0xfff4e4, 0x8a7458, 0.95], dir: [0xffe8c8, 0.90, [4, 10, 12]],  spot: [0xfff0d0, 1.6], rain: 0 },
    },
    build,
    marks: MARKS,
    anchors: ANCHORS,
    cams: {
      yard:       { type: 'pan',   pos: [8.4, 3.7, 13.0],   base: [-0.6, 1.3, 8.0], look: 'player', fov: 52, limit: 0.50 },   // first = default; the NE front corner (the spec's west lens put the frangipani between it and the yard)
      stairs:     { type: 'fixed', pos: [1.6, 1.0, 9.0],    look: [-0.1, 3.3, 2.0], fov: 48 },
      verandah:   { type: 'fixed', pos: [-6.6, 4.35, 2.4],  look: [0.6, 3.3, 0.6],  fov: 50 },
      street:     { type: 'pan',   pos: [7.5, 2.4, 22.0],   base: [0.0, 1.2, 13.5], look: 'player', fov: 46, limit: 0.50 },
      room_left:  { type: 'fixed', pos: [2.55, 5.05, -0.45], look: [-4.6, 2.6, -3.6], fov: 56 },
      room_right: { type: 'fixed', pos: [-6.50, 5.05, -0.45], look: [1.4, 2.7, -4.2], fov: 56 },
      kitchen:    { type: 'fixed', pos: [-1.65, 5.00, -5.15], look: [-5.2, 2.9, -8.3], fov: 58 },
    },
    zones: [   // first match wins; tiles every walkable and filmable area
      { box: [-0.65, 2.80, 0.65, 6.44],   cam: 'stairs' },
      { box: [-7.00, -0.15, 3.00, 2.80],  cam: 'verandah' },
      { box: [-6.85, -8.85, -1.35, -4.85], cam: 'kitchen' },
      { box: [-6.85, -4.85, -2.60, -0.15], cam: 'room_left' },
      { box: [-2.60, -4.85, 2.85, -0.15],  cam: 'room_right' },
      { box: [-8.80, 2.30, 8.80, 13.20],  cam: 'yard' },
      { box: [-12.0, 13.20, 12.0, 24.0],  cam: 'street' },
    ],
    colliders: COL,
    floor,
    props: [
      'screen_door', 'front_door', 'brass_bell', 'gate', 'walkman', 'brick_phone', 'polaroid_copy', 'corkboard', 'xmas_card_2036', 'bic_tin',
      'kettle_rue', 'tea_tray', 'tea_set', 'rue_mug', 'mantel_clock', 'ceiling_fan', 'frangipani', 'hills_hoist', 'lorikeets', 'hovercar_street',
      'storm_bank', 'louvre_light', 'water', 'band', 'band_skirt', 'haze', 'sun', 'clouds',
    ],
    get ambience() { return AMB[R.state] || AMB.knock24; },
    update,
    dress: (st, o) => dress(st, o || NOOPT),
    paths: {
      rue_pottering: [[-3.2, -7.75], [-4.85, -0.85], [-4.0, -4.6], [-3.2, -7.75]],
      rue_to_gate: [[-0.35, 2.6], [-0.35, 6.75], [-0.15, 12.55]],
      walk_off: [[0.0, 13.6], [1.0, 14.9], [26.0, 14.9], [60.0, 14.9]],
      street_car: [[-80, 21.5], [70, 21.5]],
    },
  };
})();
