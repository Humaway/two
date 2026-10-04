// ============================================================ SET: parade — Redcliffe Parade, the jetty, Suttons Beach, Bee Gees Way
// (Region P) and the Woody Point headland with the memorial bench (Region W), 2040. Spec: docs/sets/parade.md.
// Layout (metres, Y up). +Z = the bay (seaward), +X runs along the Parade toward the chip shop. Every walkable surface is
// at y = 0 (no floor()). Mark facing ry: 0 faces +Z (the bay), PI faces -Z (the shops), H faces +X.
//   REGION P (world origin; footprint x -46..46, z -37..60; walkable x -44..42; backdrop to x ±130):
//     shop row facades at z = -7 facing +Z: Block A x -46..6 (surf, pharmacy, gelato, newsagent, dentist, bakery, op shop,
//     café on the lane corner with the tea urn = the kettle at (3.2, 1.05, -7.05)); Bee Gees Way x 6..11, z -7..-35 (mural,
//     festoon, public piano at (8.3, -20) with the SafeSense limiter, three generic bronze figures with guitars at z -33.9,
//     exit pocket x 11..14, z -35..-31); Block C x 11..46 (boutique, barber, ice cream, CHIP SHOP x 28..36 with Chase (2040)'s
//     flat above: balcony x 28..31.6, kitchen window x 33.4..35.4 y 4.55..5.7 + a stub room; flat street door x 36.2..37.4).
//     Footpath z -7..-3 · kerbs + padded bollards z -3.15 / 5.15 · road z -3..5 (+X lane z -1, -X lane z 3; zebras
//     x -16..-12 and 22..26) · promenade z 5..8 (lamps z 5.6, palms z 7.4) · car park x -42..-22, z 8..12 · stage (2031
//     band shell) x -31..-25, z 13..19 · plaza x -20..-4, z 8..18 · jetty deck x -13.75..-10.25, z 18..54 + T-head x -20..-4,
//     z 54..60 · park x -4..42, z 8..18 (wrapped tree (4,13.5), kiosk (12,8.4), 2032 plaque (-2,8.5), skate bowl (27,13.5)) ·
//     Suttons Beach sand z 18..24 then slope to the waterline (y -1.5) at z 29 · water y -1.5.
//     Far group: horizon silhouettes r 470, haze band r 480, skirt, Ted Smout Bridge A(-17,-1.5,380) -> B(-215,-1.5,375)
//     (2.5°..30° right of +Z), sun at 420 m along the env's direction, 8 cumulus cards.
//   REGION W (built in local coordinates; world = local + W0, W0 = [-300, 0, 0]); only one region ever draws:
//     bench at local (0,0,0) facing +Z (1.9 m, seat 0.45, top rail 0.8..0.9 at z -0.24, memorial plaque on its rear face
//     at (0, 0.84, -0.275)), concrete pad, path z -9.1..-6.9, railing z 6.5 (x -22..22), headland wall + rocks to the water
//     (y -2.6), Norfolk pines, picnic shelter (14,-12) + coffee cart (11,-10.6; its urn is the region's kettle),
//     blank council sign (-8.5,-9.8), padded bin (4.5,-9.6), pandanus,
//     Woody jetty stub x 24.8..27.2, bell buoy (10,-2.6,70), houses z -55..-65; bridge A(105,-2.6,365) -> B(-100,-2.6,372).
// Region visibility: dress() sets it per state; update() also follows the render camera (x < -150 -> W) so a shot in the
// other region never shows an empty world (setview, credits vignettes).
// Static geometry is vertex-coloured and merged per material (one M.vc mesh per region); painted textures (128-256 px,
// nearest) only where something must read; every repeat is an InstancedMesh; nothing is created after build().
//
// Marks: kettle flat_door flat_door_in chips_window kiosk tree_look plaque_look sign_look bollard_look sample_hover sample_bay
//   jetty_man jetty_man_talk skate_kid skate_kid_talk chips_woman chips_woman_talk family_1..3 family_out_1..3 lifeguard
//   s17_luka_start s17_chase_start s17_c40_start s17_luka_plaque s17_chase_plaque s17_c40_plaque s17_c40_pov s17_cp_plaza
//   s17_cp_park s17_cp_fp s17_cp_chips s17_exit_luka s17_exit_chase s17_exit_c40 s18x_luka s18x_chase s18x_c40
//   s22_enter_* s22_stop_* (luka chase c40) s22_drone s22_drone_piano s22_chip_c40 s22_plate_luka s22_keypad s22_piano_chase
//   s22_piano_c40 s22_c40_edge s22_luka_hide s22_sneak_1..3 s22_exit s22_cp_lane s22_sample_cicadas
//   s23_walk_luka s23_walk_chase s23_walk_c40 s23_c40_stop s23_chase_stop s23_luka_stop s23_plaque_look s23_sit_prompt
//   s23_seat_luka s23_seat_chase s23_seat_c40 s23_c40_elbow b2_luka40 b2_c40 b2_crowd_1..5 b2_stop_1..5 b2_kid_start
//   b2_kid_stop b2_pelican_land b1_33_luka b1_33_chase kettle_w (Region W's save point: hotspot at 'urn_w', kettle: true)
// Anchors: s17_crane_a s17_crane_b s17_lifeguard s17_track s17_car_turn s17_plaque s17_plaque_mid s17_pov_chip blank_sign tree
//   bollard kiosk hover_parked jetty_waves pelican_pole jetty_man skate_kid chips_window flat_door s17_dusk_exit urn
//   s18_ext_window s22_lane_track s22_statues s22_drone_end s22_ar_tag s22_limiter s22_keypad s22_piano_play s22_piano_cam
//   s22_c40_close s22_lane_bay s22_luka_hiss s22_exit b1_2031_poster crane_sky_p wp_canon s23_path_wide s23_plaque
//   s23_rail_a s23_rail_b s23_seat s23_bench_front s23_c40_close s23_storm b2_slate b2_wide_path b2_crane_a b2_crane_b
//   credits_bench credits_bridge b1_2033_jetty urn_w coffees_w
// Cams (zones in brackets): fp_far_west fp_west fp_mid fp_east chips carpark_fs jetty_plaza jetty_near jetty_end park_west
//   park_east lane_mouth lane_end wp_canon wp_bench_close wp_bench_front
// Props (userData API): region_p region_w · hovercar_hero drive(pathId, speed)->Promise, indicate(on), stop() ·
//   hovercar_parked highlight(on) · traffic count(n) · cars_parked · lifeguard_drone talk(on) · family exit() ·
//   pelicans_p pelicans_w · pelican_hero clack(), land(at, dur=3)->Promise · strollers on(bool) · palm_lights_a/b ·
//   lane_festoon · lamps · xmas_tree_wrapped · plaque_2032 · blank_sign · billboard_blank · kiosk chime() ·
//   chip_shop_window open(bool) · awning_tinsel · urn steam() · flat_door open(bool) · flat_window lit(bool) ·
//   window_figures · flat_balcony_lights · stage_2031 · poster_2031 · piano · limiter_light set('red'|'green') ·
//   limiter_plate lift(u), prop(bool) · keypad press(d) · lane_bollards up(bool) · statues · lane_palm · water_p foam_p
//   glitter_p · bench glint(u|null), polished(bool) · memorial_plaque · frangipani · bench_pad · railing_w ·
//   bell_buoy · storm_clouds build(u), flicker(on) · puddles · slate_speaker screen('off'|'drafts'|'sent'|'play') ·
//   skateboard ride(actorId|null) · woody_jetty · council_sign_w · coffee_cart_w · urn_w steam() ·
//   coffees (luka40/chase40 cups, hidden by every dress()) show(who | 'both', on), hold(who, on = true, hand = 'L'), home() ·
//   grass_w · water_w foam_w ·
//   band_p/_w band_skirt_p/_w haze_p/_w bridge_p/_w bridge_lights_p/_w sun_p/_w clouds_p/_w
// Env: day golden dusk evening morning wp_morning wp_washed wp_sunset (first = default).
// Dress states: day17 evening18 lane22 festival31 (P) · bench23 xmas40 sunset33 credits (W). AUTO by scene id:
//   1.7 day17 · 1.8 evening18 · 2.2 lane22 · 2.3 bench23 · B2 xmas40 · C credits · anything else day17.
// Extras on the entry: W0, dress(state), region(), paths{} (incl. s17_pass s17_turn s18_pass), ar[], lightsLevel().
SETS.parade = (() => {
  const PI = Math.PI, H = PI / 2, TAU = PI * 2;
  const WX = -300, W0 = [WX, 0, 0];
  // palette (spec §3.1; Yes yellow is never used on this set)
  const NAVY = 0x141d3a, GLASSY = 0xbfe6ff, CREAM = 0xefe6d0, SEAM = 0xd8ccb0, SILVER = 0xc8ccd4, TRED = 0xd8323a,
    TGRN = 0x2f9a4a, LINE = 0xd9d9d0, CONC = 0xcfc8ba, PAVE = 0xd9b98f, SAND = 0xe9d8a6, WSAND = 0xc9b484,
    WNEAR = 0x6cc3dc, WFAR = 0x3d9fc4, TIMBER = 0x9c8c78, MINT = 0x9fd8c4, SALMON = 0xf2a98c, BUTTER = 0xf3e2b0,
    PBLUE = 0xb8d8ee, WHITE = 0xf2f3f4, BRICK = 0xb5654a, BRONZE = 0x8a5a2b, BRONZE_HI = 0xb8844a, BRASS = 0xc9a54a,
    BENCHW = 0x8a5a36, SANDST = 0xd8b98a, PINE = 0x2e5a3a, GALV = 0xb8bec4, DARKG = 0x2c3a48, TRUNK = 0x7a6248;
  const AWN = 0x2a3a66, SUNP = [0.95, 0.97, 1.0], LANE = [0.9, 0.93, 1.0], WPT = [1, 1, 1];
  const COL = [];                // colliders (filled by build)
  const R = {};                  // live refs from the last build (dress/update use them)
  // scratch (update never allocates)
  const tc = new THREE.Color(), tc2 = new THREE.Color(), m4 = new THREE.Matrix4(), mA = new THREE.Matrix4(), mB = new THREE.Matrix4(), mA2 = new THREE.Matrix4();
  const v1 = new THREE.Vector3(), v2 = new THREE.Vector3(), sv = new THREE.Vector3(), q1 = new THREE.Quaternion(), e1 = new THREE.Euler(), e2 = new THREE.Euler();
  const UPV = new THREE.Vector3(0, 1, 0), AT3 = [0, 0, 0], SFX_CHIRP = { vol: 0.35, at: AT3 }, SFX_BELL = { vol: 0.25, at: AT3 }, SFX_CLACK = { vol: 0.9, at: AT3 };
  let b = null, tint = SUNP, XF = null, T = null, M = null, SKY = null, GRASSM = null, RIGS = null;

  // ---------------------------------------------------------- geometry helpers (into the current Builder `b`), as reddy
  function put(g, hex, m) {
    if (XF) g.applyMatrix4(XF);
    tc.set(hex);
    const r = tc.r * tint[0], gg = tc.g * tint[1], bl = tc.b * tint[2], n = g.attributes.position.count, a = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { a[i * 3] = r; a[i * 3 + 1] = gg; a[i * 3 + 2] = bl; }
    g.setAttribute('color', new THREE.BufferAttribute(a, 3));
    b.geo(g, m || M.vc);
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
  function ico(r, hex, x, y, z, sy = 1, m) { const g = new THREE.IcosahedronGeometry(r, 0); g.scale(1, sy, 1); g.translate(x, y, z); put(g, hex, m); }
  function quad(w, h, m, x, y, z, ry = 0, rx = 0, hex = 0xffffff) {
    const g = new THREE.PlaneGeometry(w, h); if (rx) g.rotateX(rx); if (ry) g.rotateY(ry); g.translate(x, y, z); put(g, hex, m);
  }
  // remap a geometry's 0..1 UVs into the pixel rect r = [x, y, w, h] of an aw x ah atlas (canvas y down)
  function uvRect(g, r, aw = 256, ah = 256) {
    const uv = g.attributes.uv, u0 = r[0] / aw, u1 = (r[0] + r[2]) / aw, v1_ = 1 - r[1] / ah, v0 = 1 - (r[1] + r[3]) / ah;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, u0 + uv.getX(i) * (u1 - u0), v0 + uv.getY(i) * (v1_ - v0));
    return g;
  }
  // a textured quad showing atlas rect r (faces +Z before rotation: rx first, then ry)
  function tq(w, h, r, x, y, z, ry = 0, rx = 0, m = M.atlasA, aw = 256, ah = 256, hex = 0xffffff) {
    const g = uvRect(new THREE.PlaneGeometry(w, h), r, aw, ah); if (rx) g.rotateX(rx); if (ry) g.rotateY(ry); g.translate(x, y, z); put(g, hex, m);
  }
  function boxT(w, h, d, r, x, y, z, m, aw = 256, ah = 256, hex = 0xffffff, ry = 0) {
    const g = uvRect(new THREE.BoxGeometry(w, h, d), r, aw, ah); if (ry) g.rotateY(ry); g.translate(x, y + h / 2, z); put(g, hex, m);
  }
  // world-space UVs: plane geometry already in place, uv = (x, -z) / tile (or a vertical wall: (along, y) / tile)
  function wuv(g, tile, vert) {
    const p = g.attributes.position, uv = g.attributes.uv;
    for (let i = 0; i < p.count; i++) {
      if (vert === 'x') uv.setXY(i, p.getX(i) / tile, p.getY(i) / tile);
      else if (vert === 'z') uv.setXY(i, p.getZ(i) / tile, p.getY(i) / tile);
      else uv.setXY(i, p.getX(i) / tile, -p.getZ(i) / tile);
    }
    return g;
  }
  function gnd(x0, z0, x1, z1, y, m, tile = 4, hex = 0xffffff) {
    const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0); g.rotateX(-H); g.translate((x0 + x1) / 2, y, (z0 + z1) / 2);
    put(wuv(g, tile), hex, m);
  }
  // a vertical textured wall face (world UVs): along X (facing +Z or -Z) or along Z (facing +X or -X)
  function wallT(x0, z0, x1, z1, y0, y1, face, m, tile, hex = 0xffffff) {
    const along = face === 'z+' || face === 'z-', len = along ? x1 - x0 : z1 - z0;
    const g = new THREE.PlaneGeometry(len, y1 - y0);
    if (face === 'z-') g.rotateY(PI); else if (face === 'x+') g.rotateY(H); else if (face === 'x-') g.rotateY(-H);
    g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    put(wuv(g, tile, along ? 'x' : 'z'), hex, m);
  }
  // a terrain strip along z between x0..x1 following prof = [[z, y], ...] (+ an optional colour per row)
  function strip(x0, x1, prof, m, tile, cols) {
    const pos = [], uv = [], col = [];
    for (let i = 0; i < prof.length - 1; i++) {
      const [za, ya] = prof[i], [zb, yb] = prof[i + 1];
      const ca = cols ? cols[i] : 0xffffff, cb = cols ? cols[i + 1] : 0xffffff;
      const P4 = [[x0, ya, za, ca], [x0, yb, zb, cb], [x1, ya, za, ca], [x1, ya, za, ca], [x0, yb, zb, cb], [x1, yb, zb, cb]];
      for (const [x, y, z, c] of P4) { pos.push(x, y, z); uv.push(x / tile, -z / tile); tc.set(c); col.push(tc.r * tint[0], tc.g * tint[1], tc.b * tint[2]); }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.computeVertexNormals();
    if (XF) g.applyMatrix4(XF);
    b.geo(g, m);
  }
  // a flat polygon (XZ points) at height y, facing up, world UVs
  function poly(pts, y, m, tile, hex = 0xffffff) {
    const s = new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z)));
    const g = new THREE.ShapeGeometry(s); g.rotateX(-H); g.translate(0, y, 0);
    put(wuv(g, tile), hex, m);
  }
  // a vertical skirt below an XZ polyline (outward = left of travel... built to face away from the land: water side)
  function skirt(pts, y0, y1, hex, m) {
    const pos = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, az] = pts[i], [bx, bz] = pts[i + 1];
      pos.push(ax, y1, az, ax, y0, az, bx, y1, bz, bx, y1, bz, ax, y0, az, bx, y0, bz);
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals();
    put(g, hex, m);
  }
  function wall(x0, z0, x1, z1, h, hex) { bb(x0, 0, z0, x1, h, z1, hex); COL.push([x0, z0, x1, z1]); }
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
  const at = (x, z, ry = 0) => (XF = m4.makeRotationY(ry).setPosition(x, 0, z));
  const shade = (hex, k) => { tc2.set(hex).multiplyScalar(k); return tc2.getHex(); };
  const smooth = (u) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
  const clamp01 = (u) => (u < 0 ? 0 : u > 1 ? 1 : u);
  let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  function IM(geo, m, list, name, parent) {
    const im = instanced(geo, m, list); if (name) im.name = name; if (parent) parent.add(im); return im;
  }
  function dyn(im) { im.instanceMatrix.setUsage(THREE.DynamicDrawUsage); im.frustumCulled = false; return im; }

  // ---------------------------------------------------------- painted textures (128-256 px, nearest)
  const FONT = (px, w = 'bold') => `${w} ${px}px Arial, "Liberation Sans", "DejaVu Sans", sans-serif`;
  function text(c, s, x, y, px, col, al = 'center', w = 'bold', maxW) {
    c.font = FONT(px, w); c.fillStyle = col; c.textAlign = al; c.textBaseline = 'middle'; c.fillText(s, x, y, maxW);
  }
  function rrect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  function arGlyph(c, x, y, s = 8) {   // a dotted square with a chip dot: "there's something here in AR"
    c.fillStyle = 'rgba(70,130,190,0.75)';
    for (let i = 0; i < s; i += 2) { c.fillRect(x + i, y, 1, 1); c.fillRect(x + i, y + s - 1, 1, 1); c.fillRect(x, y + i, 1, 1); c.fillRect(x + s - 1, y + i, 1, 1); }
    c.fillRect(x + s / 2 - 1, y + s / 2 - 1, 2, 2);
  }
  // atlas A (256 x 256): readable physical things of Region P
  const A_PLQ = [0, 0, 128, 64], A_LIM = [128, 0, 128, 96], A_BLANK = [0, 64, 128, 64], A_CHIPS = [0, 128, 128, 64],
    A_PIANO = [128, 96, 128, 64], A_GHOST = [0, 192, 256, 32], A_STAT = [0, 224, 64, 32], A_1A = [64, 224, 64, 32],
    A_BOARD = [128, 160, 128, 32], A_KEYS = [128, 224, 128, 32];
  function paintAtlasA(c) {
    c.fillStyle = '#808080'; c.fillRect(0, 0, 256, 256);
    // BRISBANE 2032: bronze, raised border, a small stylised flame
    let g = c.createLinearGradient(0, 0, 0, 64); g.addColorStop(0, '#9a6a36'); g.addColorStop(1, '#6a4320');
    c.fillStyle = g; c.fillRect(0, 0, 128, 64);
    c.strokeStyle = '#c8945a'; c.lineWidth = 3; c.strokeRect(3, 3, 122, 58); c.strokeStyle = '#4a2c12'; c.lineWidth = 1; c.strokeRect(6.5, 6.5, 115, 51);
    c.fillStyle = '#e2b878'; c.beginPath(); c.moveTo(20, 48); c.quadraticCurveTo(10, 36, 20, 16); c.quadraticCurveTo(22, 28, 28, 30); c.quadraticCurveTo(32, 40, 20, 48); c.fill();
    c.fillStyle = '#4a2c12'; c.beginPath(); c.moveTo(20, 44); c.quadraticCurveTo(15, 37, 20, 27); c.quadraticCurveTo(22, 35, 25, 37); c.quadraticCurveTo(26, 42, 20, 44); c.fill();
    for (const [s, y, px] of [['BRISBANE', 22, 17], ['2032', 45, 24]]) { text(c, s, 77, y + 1, px, '#3a220c'); text(c, s, 76, y, px, '#f0cc8a'); }
    // the SafeSense limiter face: label (left) + keypad under the brass plate (right)
    c.fillStyle = '#e9edf1'; c.fillRect(128, 0, 128, 96); c.fillStyle = '#f8fafc'; rrect(c, 130, 2, 124, 92, 10); c.fill();
    c.strokeStyle = '#c3ccd6'; c.lineWidth = 2; rrect(c, 130, 2, 124, 92, 10); c.stroke();
    text(c, 'SafeSense', 161, 13, 9, '#3a8ad8'); text(c, 'MAX', 161, 36, 19, '#1c2a3a'); text(c, '40 dB', 161, 58, 17, '#1c2a3a');
    text(c, 'for your', 161, 76, 8, '#6a7a8a', 'center', 'normal'); text(c, 'safety', 161, 85, 8, '#6a7a8a', 'center', 'normal');
    c.fillStyle = '#b8924a'; c.fillRect(194, 6, 58, 84); c.fillStyle = '#3a3430'; c.fillRect(198, 10, 50, 76);
    const K = '123456789*0#';
    for (let i = 0; i < 12; i++) {
      const x = 200 + (i % 3) * 16, y = 12 + Math.floor(i / 3) * 18;
      c.fillStyle = '#d8d4cc'; c.fillRect(x, y, 14, 15); c.fillStyle = '#f4f2ee'; c.fillRect(x, y, 14, 2);
      text(c, K[i] === '*' ? '✱' : K[i], x + 7, y + 8.5, 10, '#1c1c1c');
    }
    // the blank sign: pale panel, faint edge, a tiny AR glyph bottom-right
    c.fillStyle = '#eef1f3'; c.fillRect(0, 64, 128, 64); c.strokeStyle = '#d6dce2'; c.lineWidth = 2; c.strokeRect(2, 66, 124, 60);
    arGlyph(c, 112, 112, 8);
    // the chip shop through the glass: tiles, a lit fluoro tube, steel fryers, a blank menu board, a tea towel
    c.fillStyle = '#f2f0ea'; c.fillRect(0, 128, 128, 64);
    c.strokeStyle = '#d8d4cc'; c.lineWidth = 1; for (let x = 0; x < 128; x += 8) { c.beginPath(); c.moveTo(x + 0.5, 140); c.lineTo(x + 0.5, 192); c.stroke(); } for (let y = 140; y < 192; y += 8) { c.beginPath(); c.moveTo(0, y + 0.5); c.lineTo(128, y + 0.5); c.stroke(); }
    c.fillStyle = '#ffffff'; c.fillRect(10, 130, 70, 5); c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(6, 135, 78, 4);
    c.fillStyle = '#3a3e44'; c.fillRect(86, 134, 38, 26); c.fillStyle = '#4a5058'; c.fillRect(88, 136, 34, 22);
    c.fillStyle = '#9aa2aa'; c.fillRect(0, 168, 128, 24); c.fillStyle = '#c4ccd4'; c.fillRect(0, 168, 128, 3);
    for (const x of [8, 40, 72]) { c.fillStyle = '#7a828a'; c.fillRect(x, 172, 26, 16); c.fillStyle = '#c89a4a'; c.fillRect(x + 3, 174, 20, 4); }
    c.fillStyle = '#f4f4f4'; c.fillRect(104, 172, 14, 18); c.fillStyle = '#d83a3a'; for (let i = 0; i < 4; i++) for (let k = 0; k < 4; k++) if ((i + k) % 2) c.fillRect(104 + i * 3.5, 172 + k * 4.5, 3.5, 4.5);
    // the public piano: sky blue, painted flowers and notes, a faded PLAY ME
    c.fillStyle = '#8fcff0'; c.fillRect(128, 96, 128, 64);
    seed = 13;
    for (let i = 0; i < 14; i++) {
      const x = 132 + rnd() * 120, y = 100 + rnd() * 56, col = ['#f48aa8', '#ffffff', '#f6a05a', '#c88af0'][i % 4];
      c.fillStyle = col; for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; c.beginPath(); c.arc(x + Math.cos(a) * 3, y + Math.sin(a) * 3, 2.6, 0, TAU); c.fill(); }
      c.fillStyle = '#f2e6a0'; c.beginPath(); c.arc(x, y, 1.6, 0, TAU); c.fill();
    }
    c.fillStyle = '#2a3a6a'; for (const [x, y] of [[150, 112], [214, 108], [236, 146], [170, 150]]) { c.beginPath(); c.ellipse(x, y, 3, 2.2, -0.4, 0, TAU); c.fill(); c.fillRect(x + 2, y - 10, 1.5, 10); c.fillRect(x + 2, y - 10, 5, 2); }
    c.globalAlpha = 0.8; text(c, 'PLAY ME', 192, 128, 17, '#ffffff'); c.globalAlpha = 1;
    // ghost sign on brick (paint pre-dates AR)
    c.fillStyle = '#b5654a'; c.fillRect(0, 192, 256, 32);
    for (let y = 192, r = 0; y < 224; y += 6, r++) { c.fillStyle = '#9a5440'; c.fillRect(0, y, 256, 1); for (let x = (r % 2) * 7; x < 256; x += 14) c.fillRect(x, y, 1, 6); }
    c.globalAlpha = 0.66; text(c, 'FISH · CHIPS · OYSTERS · EST. 1971', 128, 209, 15, '#fbf4e6', 'center', 'bold', 248); c.globalAlpha = 1;
    seed = 31; for (let i = 0; i < 70; i++) { c.fillStyle = rnd() > 0.5 ? 'rgba(181,101,74,0.6)' : 'rgba(160,88,64,0.45)'; c.fillRect(rnd() * 256, 194 + rnd() * 28, 2 + rnd() * 5, 1 + rnd() * 3); }
    // statue plinth plaque: bronze, illegible lines
    c.fillStyle = '#6e4520'; c.fillRect(0, 224, 64, 32); c.strokeStyle = '#a87a42'; c.lineWidth = 2; c.strokeRect(2, 226, 60, 28);
    c.fillStyle = '#4a2c12'; for (let i = 0; i < 4; i++) c.fillRect(10, 232 + i * 5, i === 0 ? 44 : 30 + (i * 7) % 14, 2);
    // "1A" brass number
    c.fillStyle = '#c9a54a'; c.fillRect(64, 224, 64, 32); c.strokeStyle = '#8a6a2a'; c.strokeRect(66, 226, 60, 28); text(c, '1A', 96, 241, 20, '#3a2a10');
    // weathered board (the stage poster board when empty)
    c.fillStyle = '#e8e2d4'; c.fillRect(128, 160, 128, 32); seed = 5; for (let i = 0; i < 40; i++) { c.fillStyle = 'rgba(150,140,120,0.25)'; c.fillRect(128 + rnd() * 128, 160 + rnd() * 32, 3, 2); }
    // keypad key highlight (press flash)
    c.fillStyle = '#9fe0ff'; c.fillRect(128, 224, 32, 32);
  }
  // atlas B (256 x 256): twelve shop window displays (64 px) + the window figures (2 frames)
  const B_SHOP = (i) => [(i % 4) * 64, Math.floor(i / 4) * 64, 64, 64], B_FIG_A = [0, 192, 128, 64], B_FIG_B = [128, 192, 128, 64];
  function paintAtlasB(c) {
    const cell = (i, bg, fn) => { const x = (i % 4) * 64, y = Math.floor(i / 4) * 64; c.save(); c.translate(x, y); c.beginPath(); c.rect(0, 0, 64, 64); c.clip(); c.fillStyle = bg; c.fillRect(0, 0, 64, 64); fn(); c.fillStyle = 'rgba(0,0,0,0.18)'; c.fillRect(0, 56, 64, 8); c.restore(); };
    const R_ = (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
    cell(0, '#d8eef8', () => { ['#f28c5a', '#5ab0e8', '#f2f2f2', '#7ad0a8'].forEach((col, k) => { c.fillStyle = col; c.beginPath(); c.ellipse(10 + k * 14, 34, 5, 24, 0.05 * (k - 1.5), 0, TAU); c.fill(); R_(9 + k * 14, 14, 2, 40, 'rgba(0,0,0,0.25)'); }); });
    cell(1, '#f4f6f8', () => { for (let r = 0; r < 4; r++) { R_(2, 8 + r * 13, 60, 2, '#b8c0c8'); for (let k = 0; k < 9; k++) R_(4 + k * 6.6, 1 + r * 13, 5, 7, ['#9fd0f0', '#f0a8c0', '#ffffff', '#a8e0b8'][(k + r) % 4]); } });
    cell(2, '#fbeee8', () => { R_(0, 30, 64, 26, '#d8dde2'); for (let k = 0; k < 6; k++) { c.fillStyle = ['#f6c0d0', '#c8e8b0', '#fff0c8', '#c8a080', '#f4a0a0', '#d0c8f0'][k]; c.beginPath(); c.ellipse(6 + k * 10.4, 34, 5, 4, 0, 0, TAU); c.fill(); } R_(0, 20, 64, 4, '#e6eef4'); });
    cell(3, '#e8e4dc', () => { for (let r = 0; r < 3; r++) for (let k = 0; k < 5; k++) { R_(3 + k * 12, 6 + r * 17, 10, 14, '#f6f4ee'); R_(3 + k * 12, 6 + r * 17, 10, 3, ['#d84a4a', '#3a6ac8', '#3a3a3a'][(k + r) % 3]); } });
    cell(4, '#e6f4f0', () => { R_(14, 34, 34, 8, '#9fd8c4'); R_(40, 22, 8, 14, '#9fd8c4'); R_(16, 42, 4, 12, '#8a9aa0'); R_(28, 6, 2, 16, '#8a9aa0'); c.fillStyle = '#fff8e0'; c.beginPath(); c.arc(29, 6, 6, 0, PI); c.fill(); });
    cell(5, '#f6ead8', () => { for (let r = 0; r < 3; r++) { R_(2, 18 + r * 14, 60, 2, '#b89870'); for (let k = 0; k < 4; k++) { c.fillStyle = ['#c8884a', '#a86a34', '#e0b070'][(k + r) % 3]; c.beginPath(); c.ellipse(10 + k * 15, 13 + r * 14, 6, 4, 0, 0, TAU); c.fill(); } } });
    cell(6, '#ece6f0', () => { R_(4, 8, 56, 2, '#7a7a7a'); for (let k = 0; k < 8; k++) R_(5 + k * 7, 10, 6, 24 + (k % 3) * 6, ['#c84a4a', '#4a8ac8', '#e8c8a0', '#6aa86a', '#9a6ab8', '#e88a4a', '#3a3a3a', '#f0f0f0'][k]); });
    cell(7, '#f4ece0', () => { R_(0, 34, 64, 22, '#8a6a4a'); R_(40, 12, 18, 22, '#5a5e64'); R_(43, 15, 12, 8, '#c8ccd0'); for (let k = 0; k < 5; k++) { R_(4 + k * 7, 27, 5, 7, '#f8f8f4'); } });
    cell(8, '#f8ece8', () => { for (const [x, col] of [[18, '#e88aa8'], [44, '#6ab0d8']]) { c.fillStyle = '#e8d0c0'; c.beginPath(); c.arc(x, 10, 4, 0, TAU); c.fill(); c.fillStyle = col; c.beginPath(); c.moveTo(x - 5, 15); c.lineTo(x + 5, 15); c.lineTo(x + 9, 50); c.lineTo(x - 9, 50); c.fill(); } });
    cell(9, '#e8f2ee', () => { R_(8, 4, 48, 24, '#c8dce8'); R_(10, 6, 44, 20, '#dcecf4'); R_(22, 34, 20, 10, '#3a3a40'); R_(26, 44, 12, 4, '#8a8a90'); R_(30, 48, 4, 8, '#8a8a90'); });
    cell(10, '#eef4fa', () => { R_(0, 36, 64, 20, '#c8d8e8'); for (let k = 0; k < 4; k++) { c.fillStyle = '#d8a868'; c.beginPath(); c.moveTo(8 + k * 15, 34); c.lineTo(14 + k * 15, 34); c.lineTo(11 + k * 15, 46); c.fill(); c.fillStyle = ['#f6c0d0', '#c8e8b0', '#fff4e0', '#c09070'][k]; c.beginPath(); c.arc(11 + k * 15, 31, 4, 0, TAU); c.fill(); } });
    cell(11, '#f6f6f2', () => { for (let r = 0; r < 2; r++) for (let k = 0; k < 3; k++) { const x = 4 + k * 20, y = 6 + r * 25; R_(x, y, 17, 21, '#ffffff'); R_(x + 2, y + 2, 13, 9, '#a8d0e8'); R_(x + 4, y + 6, 9, 5, '#e8c8a0'); R_(x + 2, y + 13, 13, 2, '#c0c0c0'); R_(x + 2, y + 17, 9, 2, '#c0c0c0'); } });
    // window figures: a warm kitchen, a pendant, three seated silhouettes; frame B: the right one eats a chip
    for (const [x0, hand] of [[0, false], [128, true]]) {
      const g = c.createLinearGradient(0, 192, 0, 256); g.addColorStop(0, '#f6d49a'); g.addColorStop(1, '#d8a060');
      c.fillStyle = g; c.fillRect(x0, 192, 128, 64);
      c.fillStyle = 'rgba(255,240,200,0.7)'; c.beginPath(); c.ellipse(x0 + 64, 204, 40, 16, 0, 0, TAU); c.fill();
      c.fillStyle = '#3a3030'; c.fillRect(x0 + 63, 192, 2, 8); c.beginPath(); c.moveTo(x0 + 56, 206); c.lineTo(x0 + 72, 206); c.lineTo(x0 + 68, 200); c.lineTo(x0 + 60, 200); c.fill();
      c.fillStyle = '#fff6dc'; c.fillRect(x0 + 60, 206, 8, 2);
      const fig = (cx, hy) => { c.fillStyle = '#3c2c28'; c.beginPath(); c.arc(cx, hy, 7, 0, TAU); c.fill(); c.beginPath(); c.moveTo(cx - 13, 250); c.quadraticCurveTo(cx - 13, hy + 9, cx, hy + 8); c.quadraticCurveTo(cx + 13, hy + 9, cx + 13, 250); c.fill(); };
      fig(x0 + 26, 222); fig(x0 + 64, 218); fig(x0 + 102, 223);
      if (hand) { c.fillStyle = '#3c2c28'; c.save(); c.translate(x0 + 108, 236); c.rotate(-0.6); c.fillRect(-3, -16, 6, 18); c.restore(); c.fillStyle = '#f0d070'; c.fillRect(x0 + 116, 216, 3, 7); }
      c.fillStyle = '#7a5434'; c.fillRect(x0 + 6, 244, 116, 12); c.fillStyle = '#f4f0e8'; c.fillRect(x0 + 50, 241, 28, 4);
    }
  }
  // the lane mural: two 256 x 128 paintings stacked (A top, B bottom)
  function paintMural(c) {
    for (const [y0, k] of [[0, 0], [128, 1]]) {
      const g = c.createLinearGradient(0, y0, 0, y0 + 128); g.addColorStop(0, k ? '#f6a86a' : '#6ec0f0'); g.addColorStop(0.55, k ? '#f8d8a0' : '#bfe6ff'); g.addColorStop(0.56, '#3d9fc4'); g.addColorStop(1, '#2a7aa8');
      c.fillStyle = g; c.fillRect(0, y0, 256, 128);
      c.fillStyle = k ? '#ffe2b8' : '#fff6d8'; c.beginPath(); c.arc(k ? 196 : 54, y0 + 40, 20, 0, TAU); c.fill();
      c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 3;
      for (let i = 0; i < 3; i++) { c.beginPath(); for (let x = 0; x <= 256; x += 8) c.lineTo(x, y0 + 82 + i * 12 + Math.sin(x * 0.08 + i + k) * 4); c.stroke(); }
      const palm = (x, h) => { c.strokeStyle = '#6a4a2a'; c.lineWidth = 4; c.beginPath(); c.moveTo(x, y0 + 128); c.quadraticCurveTo(x + 6, y0 + 128 - h / 2, x + 2, y0 + 128 - h); c.stroke(); c.strokeStyle = '#2f8a4a'; c.lineWidth = 4; for (let f = 0; f < 6; f++) { const a = -PI / 2 + (f - 2.5) * 0.55; c.beginPath(); c.moveTo(x + 2, y0 + 128 - h); c.quadraticCurveTo(x + 2 + Math.cos(a) * 12, y0 + 128 - h + Math.sin(a) * 12 - 4, x + 2 + Math.cos(a) * 22, y0 + 128 - h + Math.sin(a) * 18 + 6); c.stroke(); } };
      palm(k ? 20 : 228, 70); palm(k ? 240 : 12, 54);
      const guitar = (x, y, a, col) => { c.save(); c.translate(x, y0 + y); c.rotate(a); c.fillStyle = col; c.beginPath(); c.ellipse(0, 8, 9, 11, 0, 0, TAU); c.ellipse(0, -6, 7, 8, 0, 0, TAU); c.fill(); c.fillStyle = '#2a1a10'; c.beginPath(); c.arc(0, 2, 3, 0, TAU); c.fill(); c.fillRect(-1.5, -34, 3, 30); c.fillRect(-3, -40, 6, 7); c.restore(); };
      guitar(k ? 80 : 172, 60, k ? 0.5 : -0.4, k ? '#d8504a' : '#e8a040'); guitar(k ? 112 : 140, 58, k ? -0.3 : 0.3, '#5a8ad8');
      c.fillStyle = '#fff8e8'; for (let i = 0; i < 9; i++) { const x = 70 + ((i * 37 + k * 50) % 150), y = y0 + 8 + ((i * 23) % 40); c.beginPath(); for (let p = 0; p < 10; p++) { const r = p % 2 ? 2 : 5, a = p / 10 * TAU - H; c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } c.fill(); }
      for (const [x, y] of k ? [[150, 92], [40, 100]] : [[100, 96], [210, 104]]) { c.fillStyle = '#141414'; c.beginPath(); c.arc(x, y0 + y, 12, 0, TAU); c.fill(); c.fillStyle = k ? '#d8504a' : '#3a8ad8'; c.beginPath(); c.arc(x, y0 + y, 4, 0, TAU); c.fill(); }
      // framed sepia photographs of blurred generic figures (no likenesses)
      for (let i = 0; i < 3; i++) {
        const x = (k ? 128 : 76) + i * 26, y = y0 + 52;
        c.fillStyle = '#f2ead8'; c.fillRect(x - 2, y - 2, 24, 28); c.fillStyle = '#b89870'; c.fillRect(x, y, 20, 24);
        c.fillStyle = 'rgba(80,56,36,0.75)'; for (let f = 0; f < 3; f++) { c.beginPath(); c.arc(x + 4 + f * 6, y + 9, 2.6, 0, TAU); c.fill(); c.fillRect(x + 1.5 + f * 6, y + 12, 5, 12); }
      }
    }
  }
  function textures() {
    if (T) return T;
    T = {};
    const K = (k, o) => Object.assign({ key: 'parade_' + k, nearest: true }, o);
    T.atlasA = canvasTex(256, 256, paintAtlasA, K('atlasA'));
    T.atlasB = canvasTex(256, 256, paintAtlasB, K('atlasB'));
    T.mural = canvasTex(256, 256, paintMural, K('mural'));
    const noise = (base, cols, n, s) => (c, w, h) => { c.fillStyle = base; c.fillRect(0, 0, w, h); seed = s; for (let i = 0; i < n; i++) { c.fillStyle = cols[Math.floor(rnd() * cols.length)]; c.fillRect(Math.floor(rnd() * w), Math.floor(rnd() * h), 2, 2); } };
    T.grass = canvasTex(64, 64, (c, w, h) => { noise('#9cc262', ['#88b052', '#a8cc6c', '#7ea44a', '#b4d478'], 520, 3)(c, w, h); c.fillStyle = 'rgba(70,110,40,0.35)'; for (let i = 0; i < 40; i++) c.fillRect(Math.floor(rnd() * w), Math.floor(rnd() * h), 1, 3); }, K('grass', { repeat: [1, 1] }));
    T.sand = canvasTex(64, 64, noise('#efe2b6', ['#e4d4a2', '#f6ecc8', '#dccb98', '#fff6dc'], 420, 9), K('sand', { repeat: [1, 1] }));
    T.pavers = canvasTex(64, 64, (c, w, h) => {
      c.fillStyle = '#f4f0e8'; c.fillRect(0, 0, w, h); seed = 4;
      for (let r = 0; r < 4; r++) for (let k = 0; k < 2; k++) { const x = k * 32 + (r % 2) * 16, y = r * 16; c.fillStyle = `rgb(${236 + rnd() * 14 | 0},${230 + rnd() * 14 | 0},${220 + rnd() * 12 | 0})`; c.fillRect(x + 1, y + 1, 30, 14); c.fillRect(x - 31, y + 1, 30, 14); }
      c.fillStyle = 'rgba(120,110,95,0.45)'; for (let r = 0; r < 4; r++) { c.fillRect(0, r * 16, w, 1); for (let k = 0; k < 2; k++) c.fillRect((k * 32 + (r % 2) * 16) % 64, r * 16, 1, 16); }
    }, K('pavers', { repeat: [1, 1] }));
    T.asphalt = canvasTex(128, 128, noise('#55585d', ['#4a4d52', '#606369', '#45484c', '#6a6d72'], 1400, 6), K('asphalt', { repeat: [1, 1] }));
    T.brick = canvasTex(64, 64, (c, w, h) => {
      c.fillStyle = '#9a5440'; c.fillRect(0, 0, w, h); seed = 21;
      for (let r = 0; r < 8; r++) for (let k = -1; k < 4; k++) { const x = k * 16 + (r % 2) * 8, y = r * 8; c.fillStyle = `rgb(${172 + rnd() * 24 | 0},${92 + rnd() * 18 | 0},${66 + rnd() * 14 | 0})`; c.fillRect(x + 1, y + 1, 14, 6); }
    }, K('brick', { repeat: [1, 1] }));
    T.ripple = canvasTex(128, 128, (c, w, h) => {
      c.fillStyle = '#e6f2f6'; c.fillRect(0, 0, w, h); seed = 17;
      for (let i = 0; i < 160; i++) { const x = rnd() * w, y = rnd() * h, l = 6 + rnd() * 18; c.fillStyle = rnd() > 0.45 ? 'rgba(170,205,222,0.7)' : 'rgba(255,255,255,0.85)'; c.fillRect(x, y, l, 2); c.fillRect(x - w, y, l, 2); }
    }, K('ripple', { repeat: [1, 1] }));
    T.foam = canvasTex(64, 32, (c, w, h) => {
      c.clearRect(0, 0, w, h); seed = 2;
      for (let i = 0; i < 120; i++) { const x = rnd() * w, y = 8 + rnd() * 16 + Math.sin(x * 0.2) * 3; c.fillStyle = `rgba(255,255,255,${(0.4 + rnd() * 0.5).toFixed(2)})`; c.beginPath(); c.arc(x, y, 1.2 + rnd() * 2.4, 0, TAU); c.fill(); }
    }, K('foam', { repeat: [1, 1] }));
    T.palm = canvasTex(64, 64, (c, w, h) => {
      c.clearRect(0, 0, w, h);
      for (let k = -2; k < 3; k++) { c.strokeStyle = 'rgba(30,40,30,0.9)'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, k * 32 + 64); c.lineTo(64, k * 32); c.stroke(); }
      const cols = ['#fff1d0', '#ff5050', '#5ad070', '#fff1d0'];
      for (let k = -2; k < 3; k++) for (let i = 0; i < 8; i++) { const x = i * 8 + 4, y = k * 32 + 64 - x; c.fillStyle = cols[(i + k + 8) % 4]; c.beginPath(); c.arc(x, y, 2.6, 0, TAU); c.fill(); }
    }, K('palm', { repeat: [1, 1] }));
    T.bubble = canvasTex(64, 64, (c, w, h) => {
      c.fillStyle = 'rgba(230,240,248,0.35)'; c.fillRect(0, 0, w, h);
      for (let y = 0; y < 64; y += 8) for (let x = (y / 8) % 2 * 4; x < 64; x += 8) { c.strokeStyle = 'rgba(255,255,255,0.75)'; c.lineWidth = 1; c.beginPath(); c.arc(x + 4, y + 4, 3.2, 0, TAU); c.stroke(); c.fillStyle = 'rgba(255,255,255,0.8)'; c.fillRect(x + 2, y + 2, 1, 1); }
      for (const [x, y, col] of [[14, 20, 'rgba(216,50,58,0.55)'], [44, 40, 'rgba(200,204,212,0.6)'], [30, 54, 'rgba(47,154,74,0.5)']]) { c.fillStyle = col; c.beginPath(); c.arc(x, y, 5, 0, TAU); c.fill(); }
    }, K('bubble', { repeat: [1, 1] }));
    T.poster = canvasTex(128, 256, (c, w, h) => {
      c.fillStyle = '#1e3a6a'; c.fillRect(0, 0, w, h); c.fillStyle = '#f2a98c'; c.fillRect(0, 150, w, 106);
      c.fillStyle = '#fff1d0'; c.beginPath(); c.arc(64, 150, 34, PI, TAU); c.fill();
      text(c, 'REDCLIFFE', 64, 22, 18, '#ffffff'); text(c, 'FESTIVAL', 64, 42, 18, '#ffffff'); text(c, '2031', 64, 68, 26, '#9fd8c4');
      text(c, 'JETTY STAGE', 64, 96, 13, '#ffffff'); text(c, 'PUDDING', 64, 184, 24, '#141d3a'); text(c, '4:10 pm', 64, 210, 17, '#141d3a');
      c.save(); c.translate(64, 130); c.rotate(-0.42); c.fillStyle = '#d8323a'; c.fillRect(-72, -15, 144, 30); text(c, 'CANCELLED', 0, 1, 20, '#ffffff'); c.restore();
    }, K('poster'));
    T.cloud = canvasTex(128, 64, (c, w, h) => {
      c.clearRect(0, 0, w, h);
      for (const [x, y, r] of [[30, 42, 16], [52, 32, 22], [78, 30, 20], [98, 40, 15], [64, 44, 18], [44, 48, 12], [86, 48, 12]]) {
        const g = c.createRadialGradient(x, y - r * 0.3, r * 0.2, x, y, r); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.75, 'rgba(244,248,252,0.95)'); g.addColorStop(1, 'rgba(230,238,246,0)');
        c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
      }
      c.fillStyle = 'rgba(190,205,220,0.35)'; c.fillRect(18, 50, 92, 6);
    }, K('cloud'));
    T.storm = canvasTex(128, 128, (c, w, h) => {
      c.clearRect(0, 0, w, h);
      const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(214,220,226,1)'); g.addColorStop(0.25, 'rgba(120,128,138,1)'); g.addColorStop(0.75, 'rgba(70,76,88,0.95)'); g.addColorStop(1, 'rgba(90,98,108,0)');
      c.fillStyle = g; c.beginPath(); c.moveTo(4, 30); c.quadraticCurveTo(64, 0, 124, 26); c.quadraticCurveTo(110, 46, 92, 52); c.quadraticCurveTo(104, 96, 120, 128); c.lineTo(8, 128); c.quadraticCurveTo(26, 96, 34, 52); c.quadraticCurveTo(14, 44, 4, 30); c.fill();
    }, K('storm'));
    T.glint = canvasTex(64, 64, (c, w, h) => { const g = c.createRadialGradient(32, 32, 1, 32, 32, 30); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(220,240,255,0.7)'); g.addColorStop(1, 'rgba(200,230,255,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(255,255,255,0.9)'; c.fillRect(31, 4, 2, 56); c.fillRect(4, 31, 56, 2); }, { key: 'parade_glint' });
    T.glitter = canvasTex(64, 64, (c, w, h) => { c.clearRect(0, 0, w, h); seed = 41; for (let i = 0; i < 60; i++) { c.fillStyle = `rgba(255,252,236,${(0.4 + rnd() * 0.6).toFixed(2)})`; c.fillRect(Math.floor(rnd() * w), Math.floor(rnd() * h), 2 + Math.floor(rnd() * 3), 1); } }, K('glitter', { repeat: [1, 1] }));
    T.halo = canvasTex(128, 128, (c, w, h) => { const g = c.createRadialGradient(64, 64, 4, 64, 64, 63); g.addColorStop(0, 'rgba(255,255,250,1)'); g.addColorStop(0.18, 'rgba(255,250,232,0.85)'); g.addColorStop(0.45, 'rgba(255,244,214,0.3)'); g.addColorStop(1, 'rgba(255,240,210,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); }, { key: 'parade_halo' });
    T.haze = canvasTex(4, 64, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.75, 'rgba(255,255,255,0.3)'); g.addColorStop(1, 'rgba(255,255,255,1)'); c.fillStyle = g; c.fillRect(0, 0, w, h); }, { key: 'parade_haze' });
    // Region W: brass memorial plaque (same layout as the CARD memorial_plaque) + the blank council sign
    T.atlasW = canvasTex(256, 128, (c) => {
      let g = c.createLinearGradient(0, 0, 0, 64); g.addColorStop(0, '#dcb860'); g.addColorStop(0.5, '#c9a54a'); g.addColorStop(1, '#a8862e');
      c.fillStyle = g; c.fillRect(0, 0, 256, 64); c.strokeStyle = '#7a5e1a'; c.lineWidth = 2; c.strokeRect(3, 3, 250, 58); c.strokeStyle = '#efd88a'; c.lineWidth = 1; c.strokeRect(6.5, 6.5, 243, 51);
      for (const [s, y, px, w] of [['IN MEMORY OF LUKA · 2IC', 19, 17, 'bold'], ['“I’ll do it.”', 36, 15, 'italic bold'], ['He was the one who could.', 51, 13, 'bold']]) { text(c, s, 129, y + 1, px, 'rgba(255,240,190,0.6)', 'center', w); text(c, s, 128, y, px, '#3a2a08', 'center', w); }
      c.fillStyle = '#eef1f3'; c.fillRect(0, 64, 128, 64); c.strokeStyle = '#d6dce2'; c.lineWidth = 2; c.strokeRect(2, 66, 124, 60); arGlyph(c, 112, 112, 8);
      // bench timber (128 x 32 at 128,64): varnished slats; the top rail strip (128,96) with gloss streaks
      for (const [y0, gloss] of [[64, false], [96, true]]) {
        c.fillStyle = '#8a5a36'; c.fillRect(128, y0, 128, 32); seed = 8;
        for (let i = 0; i < 26; i++) { c.fillStyle = rnd() > 0.5 ? 'rgba(110,64,34,0.6)' : 'rgba(168,112,70,0.5)'; c.fillRect(128, y0 + Math.floor(rnd() * 32), 128, 1); }
        if (gloss) { c.fillStyle = 'rgba(255,255,255,0.85)'; c.fillRect(128, y0 + 6, 128, 2); c.fillStyle = 'rgba(190,230,255,0.75)'; c.fillRect(128, y0 + 10, 128, 3); c.fillStyle = 'rgba(160,210,240,0.55)'; c.fillRect(128, y0 + 20, 128, 2); for (let x = 128; x < 256; x += 22) { c.fillStyle = 'rgba(255,255,255,0.9)'; c.fillRect(x, y0 + 5, 6, 4); } }
      }
    }, K('atlasW'));
    // transparent bits for W: frangipani (0,0) + a sky puddle (64,0)
    T.atlasT = canvasTex(128, 64, (c) => {
      c.clearRect(0, 0, 128, 64);
      for (const [x, y, s] of [[18, 20, 1], [44, 26, 0.9], [30, 46, 1.05]]) {
        for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; c.save(); c.translate(x, y); c.rotate(a); c.fillStyle = '#fbfaf4'; c.beginPath(); c.ellipse(0, -6 * s, 4.2 * s, 7 * s, 0.35, 0, TAU); c.fill(); c.fillStyle = 'rgba(244,226,150,0.9)'; c.beginPath(); c.ellipse(0, -2.5 * s, 1.6 * s, 3 * s, 0.35, 0, TAU); c.fill(); c.restore(); }
        c.fillStyle = '#f0d890'; c.beginPath(); c.arc(x, y, 2.4 * s, 0, TAU); c.fill();
      }
      const g = c.createRadialGradient(96, 32, 4, 96, 32, 30); g.addColorStop(0, 'rgba(206,234,250,0.85)'); g.addColorStop(0.7, 'rgba(150,200,232,0.7)'); g.addColorStop(1, 'rgba(120,170,200,0)');
      c.fillStyle = g; c.beginPath(); c.ellipse(96, 32, 30, 22, 0, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,0.8)'; c.fillRect(84, 24, 14, 2);
    }, K('atlasT'));
    return T;
  }
  const W_PLQ = [0, 0, 256, 64], W_BLANK = [0, 64, 128, 64], W_SLAT = [128, 64, 128, 32], W_RAIL = [128, 96, 128, 32];

  // ---------------------------------------------------------- materials (all cached: mat()/matTex(), or created once here)
  function skyMats() {
    if (SKY) return SKY;
    const B = (o) => new THREE.MeshBasicMaterial(Object.assign({ fog: false }, o)), DS = THREE.DoubleSide, ADD = THREE.AdditiveBlending;
    SKY = {
      land: B({ vertexColors: true, side: DS }),                                       // horizon silhouettes (tinted per env)
      skirt: B({ color: 0xcfe6ef, side: DS }),                                         // copies the live fog colour
      haze: B({ map: T.haze, transparent: true, depthWrite: false, side: DS, color: 0xcfe6ef }),
      bridge: B({ vertexColors: true }),
      bLamp: B({ color: 0xfff1d0, transparent: true, opacity: 0.25, depthWrite: false }),
      bDrone: B({ color: 0x9fdcff }),
      sun: B({ color: 0xfffbea }),
      halo: B({ map: T.halo, color: 0xfff2c8, transparent: true, opacity: 0.9, depthWrite: false, blending: ADD }),
      cloud: B({ map: T.cloud, transparent: true, depthWrite: false, side: DS }),
      storm: B({ map: T.storm, transparent: true, depthWrite: false, side: DS }),
      glint: new THREE.MeshBasicMaterial({ map: T.glint, transparent: true, depthWrite: false, blending: ADD }),
      glitter: new THREE.MeshBasicMaterial({ map: T.glitter, transparent: true, depthWrite: false, blending: ADD, opacity: 0.8 }),
      bulb: new THREE.MeshBasicMaterial({ color: 0xffffff }),                          // lamp heads, bulbs: + instanceColor
    };
    return SKY;
  }
  function grassMat() {   // W grass tufts: Lambert + a wind sway in the vertex shader (uTime), one program
    if (GRASSM) return GRASSM;
    const m = new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true, flatShading: true });
    m.userData.uTime = { value: 0 };
    m.onBeforeCompile = (sh) => {
      sh.uniforms.uTime = m.userData.uTime;
      sh.vertexShader = 'uniform float uTime;\n' + sh.vertexShader.replace('#include <begin_vertex>', [
        '#include <begin_vertex>',
        '#ifdef USE_INSTANCING',
        '  float ph = instanceMatrix[3].x * 0.37 + instanceMatrix[3].z * 0.23;',
        '#else',
        '  float ph = 0.0;',
        '#endif',
        '  float k = max(position.y, 0.0) * 3.2;',
        '  transformed.x += sin(uTime * 1.7 + ph) * 0.06 * k;',
        '  transformed.z += cos(uTime * 1.3 + ph * 1.3) * 0.035 * k;'].join('\n'));
    };
    m.customProgramCacheKey = () => 'parade_grass_sway';
    return (GRASSM = m);
  }
  function initMats() {
    const DS = THREE.DoubleSide;
    M = {
      vc: mat(0xffffff), vc2: mat(0xffffff, { side: DS }),
      atlasA: matTex(T.atlasA, { emissive: 0xffffff, emissiveIntensity: 0.2 }),
      shop: matTex(T.atlasB, { emissive: 0xffffff, emissiveIntensity: 0.3, key: 'parade_shoplit' }),      // window displays (lights level)
      chipLit: matTex(T.atlasA, { emissive: 0xffffff, emissiveIntensity: 0.85, key: 'parade_chiplit' }),  // chip shop interior (tube flicker)
      figs: matTex(T.atlasB, { emissive: 0xffffff, emissiveIntensity: 0.95, key: 'parade_figs' }),
      mural: matTex(T.mural),
      glass: mat(0xcfe8f0, { transparent: true, opacity: 0.28, side: DS }),
      grass: matTex(T.grass), sand: matTex(T.sand), pave: matTex(T.pavers), asph: matTex(T.asphalt), brick: matTex(T.brick),
      water: matTex(T.ripple), foam: matTex(T.foam, { transparent: true }),
      winLit: mat(0xfff0d0, { emissive: 0xffd8a0, emissiveIntensity: 0.9, key: 'parade_winlit' }),           // the flat's kitchen window glow
      winDark: mat(0x2c3a48, { transparent: true, opacity: 0.75, side: DS }),
      room: mat(0xffffff, { emissive: 0xffe2b8, emissiveIntensity: 0, key: 'parade_room' }),
      pend: mat(0xffffff, { emissive: 0xfff0c8, emissiveIntensity: 0, key: 'parade_pend' }),
      palmA: matTex(T.palm, { transparent: true, emissive: 0xffffff, emissiveIntensity: 0.35, side: DS, key: 'parade_palmA' }),
      palmB: matTex(T.palm, { transparent: true, emissive: 0xffffff, emissiveIntensity: 0.35, side: DS, key: 'parade_palmB' }),
      bubble: matTex(T.bubble, { transparent: true, side: DS }),
      poster: matTex(T.poster),
      grassW: matTex(T.grass, { key: 'parade_grassW' }),
      atlasW: matTex(T.atlasW, { emissive: 0xffffff, emissiveIntensity: 0.22 }),
      atlasT: matTex(T.atlasT, { transparent: true }),
      carGlow: mat(0x000000, { emissive: 0x9fdcff, emissiveIntensity: 1, key: 'parade_carglow' }),            // hero + parked under-glow (pulse)
      blink: mat(0x000000, { emissive: 0xffb020, emissiveIntensity: 0, key: 'parade_blink' }),               // hero car indicators
      parkGlow: mat(0x000000, { emissive: 0x9fdcff, emissiveIntensity: 0.8, key: 'parade_parkglow' }),
    };
    skyMats();
  }

  // ---------------------------------------------------------- reusable models (into the current builder)
  // a 2040 hover hatch: origin on the road, front +Z, 3.9 long, 1.76 wide, body from y 0.32 (a foot off the bitumen)
  function hoverCar(col, glowM) {
    const y0 = 0.32, dk = 0x2c4256, trim = 0x3a3e44;
    boxR(1.76, 0.38, 3.6, col, 0, y0 + 0.23, 0); boxR(1.6, 0.34, 3.9, col, 0, y0 + 0.21, 0);       // body (rounded ends by two boxes)
    boxR(1.66, 0.12, 3.8, shade(col, 0.86), 0, y0 + 0.04, 0);                                      // skirt
    boxR(1.7, 0.1, 1.1, col, 0, y0 + 0.43, 1.3, 0.16);                                             // hood sloping to the nose
    boxR(1.56, 0.38, 1.9, dk, 0, y0 + 0.6, -0.36); boxR(1.5, 0.07, 1.62, col, 0, y0 + 0.82, -0.42); // glass canopy + roof
    boxR(1.5, 0.3, 0.06, dk, 0, y0 + 0.6, 0.62, -0.5);                                              // raked windscreen
    boxR(1.64, 0.03, 0.1, GLASSY, 0, y0 + 0.43, 0); boxR(0.03, 0.08, 3.4, GLASSY, 0.885, y0 + 0.3, 0); boxR(0.03, 0.08, 3.4, GLASSY, -0.885, y0 + 0.3, 0);
    for (const sx of [-1, 1]) { boxR(0.4, 0.09, 0.04, 0xfffbe8, sx * 0.5, y0 + 0.3, 1.95); boxR(0.42, 0.08, 0.04, 0xe83a3a, sx * 0.5, y0 + 0.34, -1.95); }
    for (const [x, z] of [[0.58, 1.25], [-0.58, 1.25], [0.58, -1.25], [-0.58, -1.25]]) cyl(0.3, 0.34, 0.06, 10, trim, x, y0 - 0.03, z);
    if (glowM) for (const [x, z] of [[0.58, 1.25], [-0.58, 1.25], [0.58, -1.25], [-0.58, -1.25]]) cyl(0.24, 0.24, 0.02, 10, 0xffffff, x, y0 - 0.075, z, 0, 0, glowM);
  }
  function palmCrown() {   // fronds at the local origin (the trunk top)
    for (let i = 0; i < 8; i++) {
      const a = i * TAU / 8 + 0.2, c = Math.cos(a), s = Math.sin(a);
      boxR(0.34, 0.04, 1.3, i % 2 ? 0x4f8a3a : 0x5c9a42, s * 0.62, 0.12, c * 0.62, 0.32, a);
      boxR(0.3, 0.035, 1.1, i % 2 ? 0x467c34 : 0x548c3c, s * 1.55, -0.18, c * 1.55, 0.62, a);
    }
    ico(0.2, 0x6a5a2a, 0, -0.05, 0, 1); ico(0.1, 0x7a6a30, 0.12, -0.18, 0.06); ico(0.1, 0x7a6a30, -0.1, -0.2, -0.05);
  }
  function bench(len = 1.8) {   // a park bench at the local origin, facing +Z (seat y 0.45)
    const W_ = 0x8a6a4a, IRON = 0x3a3e44;
    for (const sx of [-1, 1]) { bb(sx * len / 2 - 0.05, 0, -0.28, sx * len / 2 + 0.05, 0.45, 0.25, IRON); bb(sx * len / 2 - 0.05, 0.45, -0.3, sx * len / 2 + 0.05, 0.85, -0.22, IRON); }
    for (let k = 0; k < 3; k++) bb(-len / 2, 0.42, -0.22 + k * 0.17, len / 2, 0.47, -0.08 + k * 0.17, W_);
    for (let k = 0; k < 2; k++) bb(-len / 2, 0.56 + k * 0.17, -0.29, len / 2, 0.68 + k * 0.17, -0.25, W_);
  }
  function pelicanBody(lower) {   // perched, origin at the feet, facing +Z (about 0.95 m tall)
    const WH = 0xf2f2ee, GR = 0xb8bcc0, BILL = 0xf0b8a0;
    ico(0.27, WH, 0, 0.4, -0.05, 0.72); ico(0.22, WH, 0, 0.38, -0.32, 0.68); ico(0.1, 0x5a5a5a, 0, 0.38, -0.52, 0.5);   // body + tail
    boxR(0.13, 0.3, 0.13, WH, 0, 0.66, 0.14, -0.35); boxR(0.11, 0.2, 0.11, WH, 0, 0.82, 0.2, 0.25); ico(0.11, WH, 0, 0.94, 0.22, 1.05);   // S neck, head
    bb(-0.03, 0.96, 0.25, 0.03, 0.985, 0.27, 0x1a1a1a);
    boxR(0.07, 0.045, 0.5, BILL, 0, 0.91, 0.5, 0.36);                                                           // upper bill
    if (lower) boxR(0.09, 0.09, 0.42, 0xe8a888, 0, 0.83, 0.45, 0.42);                                          // pouch
    for (const sx of [-1, 1]) { boxR(0.05, 0.18, 0.05, 0x9a9890, sx * 0.09, 0.1, -0.02); bb(sx * 0.09 - 0.06, 0, -0.02, sx * 0.09 + 0.06, 0.02, 0.12, 0x9a9890); }
  }
  function pelicanWing() {   // along +X from the shoulder (local origin), 1.05 m, black tips
    boxR(0.72, 0.04, 0.38, 0xf0f0ec, 0.36, 0, 0); boxR(0.36, 0.035, 0.3, 0x2a2a2a, 0.9, 0, -0.03); boxR(0.72, 0.03, 0.07, 0x3a3a3a, 0.36, -0.005, -0.17);
  }
  function statueFigure(x, z, pose) {   // a generic bronze young man with a guitar, 1.8 m, on the plinth (y 0.4), facing +Z
    const y = 0.4, Bz = BRONZE, Bh = BRONZE_HI, lean = [0.04, -0.03, 0.02][pose], tilt = [0.12, -0.08, 0.18][pose];
    at(x, z, [0.1, 0, -0.12][pose]);
    for (const sx of [-1, 1]) { boxR(0.15, 0.82, 0.17, Bz, sx * 0.11, y + 0.43, sx * (pose === 1 ? 0.04 : 0.0), 0, 0, sx * 0.03); boxR(0.15, 0.08, 0.28, Bz, sx * 0.12, y + 0.04, 0.05); }
    boxR(0.36, 0.2, 0.22, Bz, 0, y + 0.92, 0); boxR(0.42, 0.56, 0.24, Bz, 0, y + 1.28, 0, lean, 0, 0);
    boxR(0.1, 0.12, 0.1, Bh, 0, y + 1.6, 0); ico(0.125, Bh, 0, y + 1.74, 0.01, 1.15);
    if (pose === 0) { ico(0.13, Bz, 0, y + 1.8, -0.03, 0.75); boxR(0.24, 0.24, 0.1, Bz, 0, y + 1.66, -0.08); }           // longer hair
    else if (pose === 1) ico(0.135, Bz, 0, y + 1.82, -0.02, 0.6);                                                     // short
    else { ico(0.14, Bz, 0, y + 1.8, 0, 0.8); ico(0.08, Bz, 0.08, y + 1.86, 0.03); ico(0.08, Bz, -0.08, y + 1.85, 0.02); }   // curls
    // guitar across the body: body low on the right hip, neck up to the left hand
    { const g = new THREE.CylinderGeometry(0.2, 0.2, 0.09, 10); g.rotateX(H); g.translate(-0.07, y + 1.06, 0.17); put(g, Bh); }
    { const g = new THREE.CylinderGeometry(0.155, 0.155, 0.09, 10); g.rotateX(H); g.translate(0.05, y + 1.27, 0.17); put(g, Bh); }
    cyl(0.055, 0.055, 0.02, 8, 0x3a2410, -0.04, y + 1.12, 0.22, H, 0);
    boxR(0.06, 0.62, 0.05, Bz, 0.2, y + 1.48, 0.18, 0, 0, -1.0 + tilt); boxR(0.09, 0.14, 0.05, Bz, 0.48, y + 1.68, 0.18, 0, 0, -1.0 + tilt);
    // arms: right forearm across the strings, left hand up the neck
    boxR(0.1, 0.34, 0.11, Bz, -0.24, y + 1.36, 0.06, 0.4, 0, 0.25); boxR(0.09, 0.3, 0.1, Bz, -0.12, y + 1.16, 0.2, 1.2, 0, 0.9);
    boxR(0.1, 0.34, 0.11, Bz, 0.25, y + 1.36, 0.06, 0.5, 0, -0.35); boxR(0.09, 0.3, 0.1, Bz, 0.36, y + 1.42, 0.2, 1.3, 0, -1.1);
    if (pose === 2) { XF = null; return; }
    XF = null;
  }
  function pine(x, z, h, s) {   // Norfolk pine trunk (tiers are instanced separately)
    cyl(0.08 * s, 0.24 * s, h, 6, 0x6a5240, x, h / 2, z);
  }

  // ---------------------------------------------------------- REGION P
  const SHOPS = [   // x0, x1, facade, parapet height, display index
    [-46, -39.5, PBLUE, 6.9, 0], [-39.5, -33, WHITE, 6.6, 1], [-33, -26.5, SALMON, 7.2, 2], [-26.5, -20, BUTTER, 6.6, 3],
    [-20, -13.5, MINT, 7.0, 4], [-13.5, -7, 0xf0dcc4, 6.8, 5], [-7, -0.5, PBLUE, 6.5, 6],
    [11, 17.5, SALMON, 7.0, 8], [17.5, 22, MINT, 6.6, 9], [22, 28, PBLUE, 7.2, 10], [37.6, 46, WHITE, 6.8, 11],
  ];
  function shopUnit(x0, x1, col, ph, disp, o = {}) {
    const roof = ph - 0.6, dk = shade(col, 0.8), cx = (x0 + x1) / 2, w = x1 - x0;
    bb(x0, 0, -16, x1, 3.0, -7.8, dk); bb(x0, 3.0, -16, x1, roof, -7.3, dk);  // mass (the ground floor is recessed: the display)
    bb(x0, 3.0, -7.3, x1, ph, -7.0, col);                                     // upper facade + parapet
    bb(x0 - 0.02, ph - 0.14, -7.38, x1 + 0.02, ph, -6.92, shade(col, 1.08));   // coping
    bb(x0, 3.0, -7.3, x1, 3.16, -6.94, shade(col, 0.92));                     // sill band over the awning
    const n = w > 5 ? 2 : 1;
    for (let i = 0; i < n; i++) {
      const wx = x0 + w * (i + 0.5) / n;
      bb(wx - 0.75, 4.2, -7.04, wx + 0.75, 5.7, -6.97, 0xf4f4ee); bb(wx - 0.66, 4.29, -7.06, wx + 0.66, 5.61, -6.95, 0x34485a);
      bb(wx - 0.02, 4.29, -7.07, wx + 0.02, 5.61, -6.94, 0xf4f4ee); bb(wx - 0.8, 4.12, -7.08, wx + 0.8, 4.2, -6.9, shade(col, 0.9));
    }
    if (!o.noSign) tq(Math.min(3.2, w - 0.8), 0.6, A_BLANK, cx, 3.62, -6.96);   // blank sign panel (AR label sits here)
    // ground floor shopfront: pilasters, bulkhead, transom, glass, the display behind it
    bb(x0, 0, -7.8, x0 + 0.3, 3.0, -6.96, col); bb(x1 - 0.3, 0, -7.8, x1, 3.0, -6.96, col);
    if (o.custom) return;
    bb(x0 + 0.3, 0, -7.8, x1 - 0.3, 0.45, -7.04, shade(col, 0.55));
    bb(x0 + 0.3, 2.62, -7.8, x1 - 0.3, 3.0, -7.04, NAVY);
    const gx0 = x0 + 0.3, gx1 = x1 - 0.3, door = o.doorL ? gx0 + 0.15 : gx1 - 1.15;
    tq(gx1 - gx0, 2.17, B_SHOP(disp), cx, 1.535, -7.78, 0, 0, M.shop);
    quad(gx1 - gx0, 2.17, M.glass, cx, 1.535, -7.12);
    for (const mx of [gx0 + 0.03, gx1 - 0.03, door, door + 1.0]) bb(mx - 0.035, 0.45, -7.16, mx + 0.035, 2.62, -7.08, 0x8a9096);
    bb(door, 2.18, -7.16, door + 1.0, 2.24, -7.08, 0x8a9096); bb(door + 0.86, 1.0, -7.08, door + 0.9, 1.4, -7.02, 0xd8dce0);   // door head, handle
    // awning: navy top, cream soffit, navy fascia; tie rods
    bb(x0, 3.0, -7.0, x1, 3.12, -5.0, AWN); bb(x0, 2.98, -6.96, x1, 3.0, -5.04, 0xe8e4da); bb(x0, 2.9, -5.06, x1, 3.2, -4.98, NAVY);
    for (const tx of [x0 + 0.6, x1 - 0.6]) boxR(0.022, 0.022, 2.3, 0x9aa0a6, tx, 4.0, -6.0, -0.5);
  }
  function backdropBlock(x0, x1, dir) {   // the Parade continuing past the barriers (not walkable)
    const cols = [PBLUE, SALMON, MINT, BUTTER, WHITE, 0xe8d8c8, 0xc8d8c0];
    let x = x0, i = 0;
    while (dir > 0 ? x < x1 : x > x1) {
      const w = [7, 8.5, 6.5, 9, 7.5][i % 5], xa = dir > 0 ? x : x - w, xb = dir > 0 ? x + w : x;
      shopUnit(xa, xb, cols[(i * 3 + (dir > 0 ? 1 : 0)) % cols.length], 6.4 + ((i * 7) % 5) * 0.3, (i * 5 + (dir > 0 ? 2 : 0)) % 12);
      x += dir * w; i++;
    }
  }

  function buildP(rp) {
    b = new Builder(); XF = null; tint = SUNP;
    const addP = (g) => (rp.add(g), g);
    // ======================================================== grounds
    gnd(-130, -7, 130, -3.3, 0, M.pave, 1.6, CONC);                                     // footpath (shop side)
    gnd(-130, -3.3, 130, 5.3, 0, M.asph, 6, 0xe8e8e8);                                  // the road (under the kerbs)
    gnd(-44, 5.3, 130, 8, 0, M.pave, 1.6, PAVE); gnd(-130, 5.3, -50, 8, 0, M.pave, 1.6, PAVE);   // promenade
    gnd(-50, 5.3, -44, 18, 0, M.asph, 6, 0xe0e0e0);                                     // vehicle access off the west end
    gnd(-44, 8, -20, 12.1, 0, M.asph, 6, 0xd8d8d8);                                     // car park
    gnd(-44, 12.4, -20, 18, 0, M.grass, 3, 0xf0f0e0); gnd(-130, 8, -50, 18, 0, M.grass, 3, 0xf0f0e0);
    gnd(-20, 8, -4, 18, 0, M.pave, 1.6, PAVE);                                          // plaza
    gnd(-4, 8, 23.6, 18, 0, M.grass, 3); gnd(30.4, 8, 130, 18, 0, M.grass, 3); gnd(23.6, 8, 30.4, 10.1, 0, M.grass, 3); gnd(23.6, 16.9, 30.4, 18, 0, M.grass, 3);
    strip(-4, 480, [[18, 0], [24, 0], [29, -1.5], [31, -2.45], [44, -3.6], [70, -4.5]], M.sand, 3, [0xffffff, 0xfaf4e8, 0xd8c8a0, 0xb0a888, 0x90a0a0, 0x80a0a8]);
    gnd(-480, -480, 480, -16, -0.02, M.vc, 4, 0xb8b088);                                // inland (crane only)
    gnd(-480, -16, -130, 18, -0.02, M.vc, 4, 0xa8b07a); gnd(130, -16, 480, 18, -0.02, M.vc, 4, 0xa8b07a);
    // kerbs (gaps at the zebras), lines, zebras, stop lines
    for (const [x0, x1] of [[-130, -16], [-12, 22], [26, 130]]) bb(x0, 0, -3.3, x1, 0.1, -3.0, 0xc9c3b6);
    for (const [x0, x1] of [[-130, -50], [-44, -16], [-12, 22], [26, 130]]) bb(x0, 0, 5.0, x1, 0.1, 5.3, 0xc9c3b6);   // (the vehicle access x -50..-44 is flush)
    for (let x = -129; x < 130; x += 6) bb(x, 0, 0.94, x + 3, 0.012, 1.06, LINE);
    for (const [x0, x1] of [[-130, -16.5], [-11.5, 21.5], [26.5, 130]]) { bb(x0, 0, -2.78, x1, 0.012, -2.68, LINE); bb(x0, 0, 4.68, x1, 0.012, 4.78, LINE); }
    for (const [x0, x1] of [[-16, -12], [22, 26]]) {
      for (let z = -2.75; z < 5; z += 1.0) bb(x0 + 0.1, 0, z, x1 - 0.1, 0.014, z + 0.5, 0xf2f0e6);
      bb(x0 - 1.65, 0, -2.9, x0 - 1.35, 0.012, 0.9, LINE); bb(x1 + 1.35, 0, 1.1, x1 + 1.65, 0.012, 4.9, LINE);
      for (const sz of [-3.26, 5.0]) bb(x0, 0, sz, x1, 0.02, sz + 0.26, 0xb8b2a6);                           // flush kerb ramps
    }
    // ======================================================== shop row
    for (const s of SHOPS) shopUnit(s[0], s[1], s[2], s[3], s[4]);
    backdropBlock(-46, -130, -1); backdropBlock(46, 130, 1);
    // café: corner unit at the lane mouth, takeaway window + ledge (the urn is a prop)
    shopUnit(-0.5, 6, WHITE, 7.4, 7, { custom: true });
    bb(-0.2, 0, -7.8, 6, 0.45, -7.04, 0x8a8e94); bb(-0.2, 2.62, -7.8, 6, 3.0, -7.04, NAVY);
    tq(2.2, 2.17, B_SHOP(7), 0.9, 1.535, -7.78, 0, 0, M.shop); quad(2.2, 2.17, M.glass, 0.9, 1.535, -7.12);
    tq(2.4, 1.4, B_SHOP(7), 3.2, 1.75, -7.9, 0, 0, M.shop); bb(2.0, 0.45, -7.9, 2.06, 2.62, -7.04, 0x8a9096); bb(4.34, 0.45, -7.9, 4.4, 2.62, -7.04, 0x8a9096);
    bb(2.0, 0.45, -7.9, 4.4, 1.0, -7.25, 0xd8dce0); bb(1.96, 0.98, -7.4, 4.44, 1.02, -6.78, 0xc8ccd0);   // takeaway counter + ledge
    bb(2.0, 2.4, -7.9, 4.4, 2.62, -7.2, 0x5a5e64);                                                        // roller shutter box
    bb(4.6, 0.45, -7.4, 5.7, 2.24, -7.3, 0x2a3038); quad(1.1, 1.79, M.glass, 5.15, 1.345, -7.12); bb(4.55, 2.24, -7.16, 5.75, 2.3, -7.08, 0x8a9096);
    bb(-0.5, 3.0, -7.0, 6, 3.12, -5.0, AWN); bb(-0.5, 2.98, -6.96, 6, 3.0, -5.04, 0xe8e4da); bb(-0.5, 2.9, -5.06, 6, 3.2, -4.98, NAVY);
    bb(5.94, 2.9, -7.0, 6.02, 3.2, -5.0, NAVY);
    // ======================================================== the chip shop (x 28..36) + Chase (2040)'s flat over it + the street door
    bb(28, 0, -16, 36, 3.0, -7.8, 0x9a5440); bb(28, 3.0, -16, 36, 3.6, -7.3, 0x9a5440); bb(28, 3.6, -16, 32.4, 7.0, -7.3, 0x9a5440); bb(32.4, 3.6, -16, 36, 7.0, -10.0, 0x9a5440); bb(32.4, 6.2, -10, 36, 7.0, -7.3, 0x9a5440);
    const brick = (x0, x1, y0, y1) => wallT(x0, -7.0, x1, -7.0, y0, y1, 'z+', M.brick, 1.0);
    brick(28, 28.4, 0, 3.0); brick(35.6, 36, 0, 3.0); brick(28, 36, 3.0, 3.6); brick(28, 36, 5.8, 7.6);
    brick(28, 28.6, 3.6, 5.8); brick(31.0, 33.4, 3.6, 5.8); brick(35.4, 36, 3.6, 5.8); brick(33.4, 35.4, 3.6, 4.55); brick(33.4, 35.4, 5.7, 5.8);
    for (const [x0, x1] of [[28, 28.4], [35.6, 36]]) bb(x0, 0, -7.8, x1, 3.0, -7.0, 0x9a5440);
    bb(27.98, 7.45, -7.36, 36.02, 7.62, -6.9, 0xd8cfc0); bb(28, 3.0, -7.06, 36, 3.12, -6.92, 0xd8cfc0);
    tq(7.0, 0.94, A_GHOST, 32, 7.0, -6.985);                                                               // the ghost sign
    tq(1.7, 0.42, A_BLANK, 32.2, 3.34, -6.985);                                                            // small blank sign (AR: FISH & CHIPS)
    // ground floor: glass, service hatch + ledge (the interior card is the prop chip_shop_window), door
    bb(28.4, 0, -7.8, 35.6, 0.4, -7.04, 0x7a8088); bb(28.4, 2.62, -7.8, 35.6, 3.0, -7.04, NAVY);
    for (const [x0, x1] of [[28.4, 29.6], [32.0, 33.0], [34.0, 35.6]]) quad(x1 - x0, 2.22, M.glass, (x0 + x1) / 2, 1.51, -7.12);
    quad(2.4, 0.5, M.glass, 30.8, 2.36, -7.12); bb(29.6, 0.4, -7.2, 32.0, 0.9, -7.04, 0xb8bec4);
    bb(29.5, 0.88, -7.3, 32.1, 0.94, -6.66, 0xd0d4d8); bb(29.6, 0.6, -6.7, 32.0, 0.88, -6.66, 0xa8aeb4);       // service window ledge
    tq(2.2, 0.32, A_BLANK, 30.8, 2.3, -6.99);                                                              // blank menu strip (AR prices)
    for (const mx of [28.43, 29.6, 32.0, 33.0, 34.0, 35.57]) bb(mx - 0.035, 0.4, -7.16, mx + 0.035, 2.62, -7.08, 0x8a9096);
    bb(29.6, 2.08, -7.16, 32.0, 2.14, -7.08, 0x8a9096); bb(33.0, 0.4, -7.2, 34.0, 2.24, -7.15, 0x3a4048); bb(33.84, 1.0, -7.1, 33.88, 1.4, -7.04, 0xd8dce0);
    bb(28, 3.0, -7.0, 36, 3.12, -5.0, AWN); bb(28, 2.98, -6.96, 36, 3.0, -5.04, 0xe8e4da); bb(28, 2.9, -5.06, 36, 3.2, -4.98, NAVY);
    // first floor: balcony (x 28..31.6, z -7..-5.5, floor 3.6, rail top 4.65), sliding door, kitchen window + eave
    bb(28, 3.45, -7.0, 31.6, 3.6, -5.5, 0xcfc8ba); bb(28, 3.4, -5.56, 31.6, 3.62, -5.48, 0xb8b2a6);
    for (let x = 28.05; x <= 31.56; x += 0.12) bb(x - 0.012, 3.6, -5.53, x + 0.012, 4.6, -5.51, 0x2a2e34);
    for (let z = -6.94; z < -5.5; z += 0.12) { bb(27.99, 3.6, z - 0.012, 28.01, 4.6, z + 0.012, 0x2a2e34); bb(31.59, 3.6, z - 0.012, 31.61, 4.6, z + 0.012, 0x2a2e34); }
    bb(27.97, 4.6, -7.0, 31.63, 4.67, -5.47, 0x3a3e44); bb(28, 4.6, -5.55, 31.6, 4.67, -5.47, 0x3a3e44);
    bb(28.6, 3.6, -7.35, 31.0, 5.8, -7.25, 0x23282e); tq(2.3, 2.1, B_FIG_A, 29.8, 4.68, -7.24, 0, 0, M.vc, 256, 256, 0x404850);   // dark interior card
    for (const mx of [28.6, 29.8, 31.0]) bb(mx - 0.05, 3.6, -7.12, mx + 0.05, 5.84, -6.96, 0xe8e6e0); bb(28.55, 5.74, -7.12, 31.05, 5.84, -6.96, 0xe8e6e0);
    quad(2.4, 2.2, M.glass, 29.8, 4.7, -7.08);
    bb(33.32, 4.47, -7.1, 35.48, 4.57, -6.86, 0xe8e6e0); bb(33.32, 5.68, -7.1, 35.48, 5.76, -6.98, 0xe8e6e0);   // sill, head
    bb(33.32, 4.47, -7.1, 33.44, 5.76, -6.96, 0xe8e6e0); bb(35.36, 4.47, -7.1, 35.48, 5.76, -6.96, 0xe8e6e0); bb(34.36, 4.55, -7.1, 34.44, 5.7, -7.0, 0xe8e6e0);
    bb(33.2, 5.95, -7.0, 35.6, 6.05, -6.55, 0x4a4e56);                                                     // eave over the window
    // the stub room behind the kitchen window (x 32.4..36, y 3.6..6.2, z -10..-7): cream, a table, three chairs
    bb(32.4, 3.5, -10, 36, 3.6, -7.15, 0x9a7a5a); quad(3.6, 2.6, M.room, 34.2, 4.9, -9.98, 0, 0, 0xf3e4c8);
    quad(2.85, 2.6, M.room, 32.42, 4.9, -8.575, H, 0, 0xf0dcc0); quad(2.85, 2.6, M.room, 35.98, 4.9, -8.575, -H, 0, 0xf0dcc0);
    quad(3.6, 2.85, M.room, 34.2, 6.19, -8.575, 0, H, 0xfaf0e0);
    bb(33.8, 4.3, -9.97, 34.8, 5.1, -9.94, 0x7a9ab0); bb(32.6, 3.6, -9.9, 33.4, 4.5, -9.4, 0xe8e8e8);       // a picture, the fridge corner
    bb(33.7, 4.32, -8.5, 34.9, 4.38, -7.4, 0xc8a070); for (const [x, z] of [[33.75, -8.45], [34.85, -8.45], [33.75, -7.45], [34.85, -7.45]]) bb(x - 0.03, 3.6, z - 0.03, x + 0.03, 4.32, z + 0.03, 0x6a4a2a);
    for (const [x, z] of [[33.3, -7.95], [35.3, -7.95], [34.3, -8.9]]) { bb(x - 0.2, 4.0, z - 0.2, x + 0.2, 4.06, z + 0.2, 0x6a4a2a); bb(x - 0.2, 4.06, z - (x < 34 ? 0.2 : x > 35 ? 0.2 : 0.2), x + 0.2, 4.6, z - 0.16, 0x5a3e24); }
    bb(34.25, 5.62, -8.0, 34.35, 6.2, -7.9, 0x2a2a2a);                                                     // pendant cord (shade is a prop)
    quad(2.0, 0.6, M.room, 34.4, 5.4, -7.16, 0, 0, 0xf4eee0);                                               // the blind, half down
    // the street door pier (x 36..37.6) with the stair cavity (the door is a prop)
    bb(36, 2.4, -16, 37.6, 7.0, -7.3, 0x9a5440); bb(36, 0, -16, 37.6, 2.4, -9.2, 0x9a5440); bb(36, 0, -9.2, 36.2, 2.4, -7.3, 0x9a5440); bb(37.4, 0, -9.2, 37.6, 2.4, -7.3, 0x9a5440);
    brick(36, 37.6, 2.4, 7.6); brick(36, 36.2, 0, 2.4); brick(37.4, 37.6, 0, 2.4); bb(35.98, 7.45, -7.36, 37.62, 7.62, -6.9, 0xd8cfc0);
    bb(36.2, 0, -9.2, 37.4, 0.01, -7.0, 0x2a2420); bb(36.2, 0, -9.2, 37.4, 2.4, -9.15, 0x18161a);
    for (let i = 0; i < 4; i++) bb(36.2, 0, -9.15 + 0, 37.4, 0.18 * (i + 1), -9.15 + 0.3 * (4 - i), 0x2a2420);
    bb(36.14, 2.36, -7.08, 37.46, 2.46, -6.96, 0xe8e6e0); bb(36.14, 0, -7.08, 36.2, 2.4, -6.96, 0xe8e6e0); bb(37.4, 0, -7.08, 37.46, 2.4, -6.96, 0xe8e6e0);
    bb(36, 3.0, -7.0, 37.6, 3.12, -5.6, NAVY); bb(36, 2.92, -5.66, 37.6, 3.2, -5.58, NAVY);
    // ======================================================== Bee Gees Way (x 6..11, z -7..-35) + the exit pocket
    tint = LANE;
    gnd(6, -35, 11, -7, 0, M.pave, 1.2, 0xc8906a); gnd(11, -35, 14, -31, 0, M.pave, 1.2, 0xc8906a);
    bb(0, 0, -37, 6, 7, -16, 0xd8c8b4); bb(11, 0, -31, 22, 7, -16, 0xd0c4b0); bb(0, 0, -37, 11, 7, -35, 0xd8c8b4); bb(11, 0, -40, 16, 7, -35, 0xd8c8b4); bb(14, 0, -31, 16, 7, -24, 0xd0c4b0);
    bb(5.6, 0, -16, 6, 7, -7.3, 0xe8e2d8); bb(11, 0, -16, 11.4, 7, -7.3, 0xe8e2d8);                         // café / boutique side walls
    for (const [x, ry, zEnd] of [[6.001, H, -34.9], [10.999, -H, -31]]) {   // the east wall stops at the exit pocket
      const tile = (-8.0 - zEnd + (zEnd < -34 ? 0.9 : 0)) / 4;
      for (let k = 0; k < 4; k++) { const z = -8.0 - (k + 0.5) * tile; tq(tile, 3.6, [0, ((k + (x > 8 ? 1 : 0)) % 2) * 128, 256, 128], x, 2.2, z, ry, 0, M.mural); }
      bb(x - 0.06, 0, zEnd, x + 0.06, 0.4, -7.3, 0xb8a890); bb(x - 0.05, 4.0, zEnd, x + 0.05, 4.12, -7.3, 0xb8a890);
    }
    bb(6, 0, -35.06, 11, 7, -35, 0xd0c0a8); bb(11, 0, -35.06, 14, 7, -35, 0xd0c0a8);
    // the back street through the pocket (painted backdrop, not walkable)
    gnd(14, -40, 26, -24, 0, M.asph, 6, 0xd0d0d0); bb(22, 0, -46, 30, 6.5, -20, 0xc8b8a0);
    for (let z = -44; z < -22; z += 3) { bb(21.96, 1.0, z, 22.0, 2.4, z + 1.6, 0x3a4048); bb(21.96, 3.8, z, 22.0, 5.2, z + 1.6, 0x3a4048); }
    bb(13.98, 0, -31.2, 14.02, 1.05, -30.8, 0x6a6e74);
    // the sign bar across the lane mouth (blank panel; AR: BEE GEES WAY) and the wires of the festoon
    bb(6, 4.66, -7.25, 11, 4.72, -7.19, 0x3a3e44); tq(2.4, 0.5, A_BLANK, 8.5, 4.4, -7.2);
    for (const x of [7.3, 9.7]) bb(x - 0.01, 4.65, -7.21, x + 0.01, 4.66, -7.19, 0x3a3e44);
    // statues: plinth + three generic bronze figures with guitars (prop: static merged)
    bb(6.8, 0, -34.7, 10.2, 0.4, -33.1, 0x8a8478); bb(6.75, 0.38, -34.75, 10.25, 0.42, -33.05, 0x9a9488);
    tq(0.5, 0.25, A_STAT, 8.5, 0.21, -33.09);
    // public piano bench + lane palm planter (palm crown instanced) + a bin
    bb(9.2, 0.44, -20.7, 9.7, 0.5, -19.3, 0x6a8ab0); for (const [x, z] of [[9.25, -20.65], [9.65, -20.65], [9.25, -19.35], [9.65, -19.35]]) bb(x - 0.03, 0, z - 0.03, x + 0.03, 0.44, z + 0.03, 0x3a3e44);
    bb(9.8, 0, -27.0, 10.8, 0.55, -26.0, 0xb8a890); bb(9.88, 0.5, -26.92, 10.72, 0.56, -26.08, 0x5a4636);
    cyl(0.25, 0.22, 0.9, 10, CREAM, 6.35, 0.45, -12.5); cyl(0.26, 0.26, 0.06, 10, SEAM, 6.35, 0.92, -12.5);
    tint = SUNP;
    // ======================================================== promenade, car park, stage, plaza, park, beach, sea wall, jetty
    // padded SAFETY ZONE barriers (quilted cream foam) closing the walkable ends
    const foamWall = (x0, z0, x1, z1) => { bb(x0, 0, z0, x1, 1.05, z1, CREAM); bb(x0 - 0.02, 1.0, z0 - 0.02, x1 + 0.02, 1.1, z1 + 0.02, SEAM); for (let t = 0; t < 1; t += 0.5) bb(x0 - 0.01, 0.1 + t, z0 - 0.01, x1 + 0.01, 0.13 + t, z1 + 0.01, SEAM); };
    foamWall(-44.4, -7, -44, -3.3); foamWall(42, -7, 42.4, -3.3); foamWall(-44.4, 5.3, -44, 12.1); foamWall(42, 5.3, 42.4, 24.4);
    // car park: bays (6 nose-in, facing +Z), wheel stops, the low wall + a blank sign (AR: HOVERSURE)
    for (let k = 0; k <= 6; k++) { const x = -42.4 + k * 2.8; bb(x - 0.05, 0, 8.4, x + 0.05, 0.012, 12.0, 0xf2f0e6); }
    for (let k = 0; k < 6; k++) bb(-41.6 + k * 2.8, 0, 11.4, -40.4 + k * 2.8, 0.1, 11.55, 0xb8b2a6);
    bb(-44, 0, 12.1, -20, 0.55, 12.4, 0xd8cfbf); bb(-44.02, 0.55, 12.08, -19.98, 0.6, 12.42, 0xe8e0d0);
    for (const x of [-31, -29]) bb(x - 0.04, 0.6, 12.2, x + 0.04, 2.3, 12.3, 0x6a6e74); tq(2.6, 0.6, A_BLANK, -30, 2.6, 12.42);
    // plaza: jetty entrance arch (blank: AR REDCLIFFE JETTY), bollard plinths
    bb(-15.45, 0, 17.55, -15.35, 2.5, 17.65, 0x6a6e74); tq(1.8, 0.7, A_BLANK, -15.4, 2.1, 17.53, PI); tq(1.8, 0.7, A_BLANK, -15.4, 2.1, 17.67);
    COL.push([-15.5, 17.5, -15.3, 17.7]);
    // beach sign post (blank: AR SUTTONS BEACH)
    bb(13.95, 0, 18.45, 14.05, 2.1, 18.55, 0x6a6e74); tq(2.4, 0.6, A_BLANK, 14, 2.4, 18.44, PI); tq(2.4, 0.6, A_BLANK, 14, 2.4, 18.56);
    // street sign at the zebra (blank: AR REDCLIFFE PDE)
    bb(-16.5, 0, -3.5, -16.4, 3.4, -3.4, 0x6a6e74); tq(1.6, 0.36, A_BLANK, -16, 3.6, -3.38); tq(1.6, 0.36, A_BLANK, -16, 3.6, -3.52, PI);
    // sea wall (z 18..18.4) with the jetty gap, the groyne at x -4
    bb(-480, -2.6, 18, -13.75, 0, 18.4, 0xcbb894); bb(-10.25, -2.6, 18, -4, 0, 18.4, 0xcbb894);
    bb(-480, -0.02, 18.0, -13.75, 0.04, 18.42, 0xe0d4b8); bb(-10.25, -0.02, 18.0, -4, 0.04, 18.42, 0xe0d4b8);
    // skate bowl: deck with a round hole + a lathed bowl (1.2 deep)
    {
      const s = new THREE.Shape([new THREE.Vector2(23.6, -10.1), new THREE.Vector2(30.4, -10.1), new THREE.Vector2(30.4, -16.9), new THREE.Vector2(23.6, -16.9)]);
      const hole = new THREE.Path(); hole.absarc(27, -13.5, 3.4, 0, TAU, true); s.holes.push(hole);
      const g = new THREE.ShapeGeometry(s, 16); g.rotateX(-H); put(g, 0xc8c4bc);
      const prof = []; for (let i = 0; i <= 6; i++) { const a = i / 6 * H; prof.push(new THREE.Vector2(3.4 - 1.6 * (1 - Math.cos(a)), -1.2 * Math.sin(a))); }
      prof.push(new THREE.Vector2(0.01, -1.2));
      const lg = new THREE.LatheGeometry(prof, 24); lg.translate(27, 0, 13.5); put(lg, 0xb8b4ac);
      for (let i = 0; i < 24; i++) { const a = i / 24 * TAU; boxR(0.24, 0.08, 0.92, 0x9a9690, 27 + Math.sin(a) * 3.42, 0.03, 13.5 + Math.cos(a) * 3.42, 0, a + H); }
    }
    // park benches (the T-head bench too)
    for (const [x, z] of [[-1, 17.2], [9, 17.4], [34, 17.4]]) { at(x, z); bench(); XF = null; }
    at(-12, 59.2); bench(2.0); XF = null;
    // jetty: deck, plank lines, rails (posts instanced), T-head, mooring poles, stairs to the water
    bb(-13.75, -0.3, 18, -10.25, 0, 54, TIMBER); bb(-20, -0.3, 54, -4, 0, 60, TIMBER);
    for (let z = 18.5; z < 54; z += 0.9) bb(-13.74, -0.005, z, -10.26, 0.004, z + 0.04, 0x847664);
    for (let z = 54.5; z < 60; z += 0.9) bb(-19.99, -0.005, z, -4.01, 0.004, z + 0.04, 0x847664);
    const rail = (x0, z0, x1, z1) => { for (const y of [0.55, 1.05]) bb(x0, y, z0, x1, y + 0.07, z1, 0xb8aa94); };
    rail(-13.82, 18, -13.68, 54); rail(-10.32, 18, -10.18, 54);
    rail(-20.07, 53.93, -13.75, 54.07); rail(-10.25, 53.93, -3.93, 54.07); rail(-20.07, 54, -19.93, 60.07); rail(-4.07, 54, -3.93, 60.07); rail(-20.07, 59.93, -3.93, 60.07);
    bb(-14.0, -0.32, 18, -13.75, -0.05, 54, 0x7a6c5a); bb(-10.25, -0.32, 18, -10.0, -0.05, 54, 0x7a6c5a);
    for (const [x, z] of [[-9.4, 23.8], [-14.6, 40.0]]) { cyl(0.13, 0.15, 4.4, 8, 0x6a5a48, x, -1.0, z); cyl(0.15, 0.15, 0.06, 8, 0x4a3e32, x, 1.2, z); }
    // rooftop billboard (blank; the Cloud+ AR ad fills it in Chip View) on its frame over Block A
    rp.add(b.done());
    // ======================================================== colliders (spec §2.6; objects push their own next to them)
    COL.push(
      [-46, -16, 6, -7], [11, -16, 46, -7],                                                  // shops
      [-46, -7, -44, -3], [42, -7, 46, -3],                                                  // footpath ends
      [-44, -3.3, -16, -3.0], [-12, -3.3, 22, -3.0], [26, -3.3, 42, -3.0],                   // kerb, shop side
      [-44, 5.0, -16, 5.3], [-12, 5.0, 22, 5.3], [26, 5.0, 42, 5.3],                         // kerb, bay side
      [-16.3, -3, -16, 5], [-12, -3, -11.7, 5], [21.7, -3, 22, 5], [26, -3, 26.3, 5],         // zebra sides
      [-46, 5, -44, 12], [-46, 8, -42, 13], [-44, 12, -20, 12.4], [-20.4, 12.4, -20, 18],   // promenade W end, car park, plaza W edge
      [-20, 18, -13.75, 18.4], [-10.25, 18, -4, 18.4],                                       // sea wall
      [-14.05, 18, -13.75, 54], [-10.25, 18, -9.95, 54],                                     // jetty rails
      [-20.3, 53.7, -13.75, 54], [-10.25, 53.7, -3.7, 54], [-20.3, 54, -20, 60.3], [-4, 54, -3.7, 60.3], [-20.3, 60, -3.7, 60.3],
      [-13.0, 58.95, -11.0, 59.5],                                                            // T-head bench
      [-4, 24, 42, 24.4], [-4.4, 18, -4, 24], [42, 5, 42.4, 24.4],                           // beach limit, park edges
      [4, -37, 6, -16], [11, -31, 13, -16], [6, -37, 11, -35], [11, -37, 16, -35], [14, -35, 16, -31],   // lane walls
      [-1.9, 16.9, -0.1, 17.5], [8.1, 17.1, 9.9, 17.7], [33.1, 17.1, 34.9, 17.7],            // park benches
      [23.6, 10.1, 30.4, 16.9], [13.9, 18.4, 14.1, 18.6]);                                   // skate bowl, beach sign

    // ======================================================== instanced repeats
    // padded bollards (kerbs both sides, gaps at the zebras, four at the jetty mouth)
    const bl = [];
    for (let k = 0; k <= 52; k++) { const x = -42.4 + k * 1.6; if ((x > -16.2 && x < -11.8) || (x > 21.8 && x < 26.2)) continue; bl.push([x, 0.1, -3.15, 0], [x, 0.1, 5.15, 0]); }
    for (const x of [-14.3, -9.7]) bl.push([x, 0, 17.6, 0]);
    for (const p of PROPS.parts('padded_bollard')) IM(p.geometry, p.material, bl, 'bollards', rp);
    for (const p of bl) if (p[2] > 17) COL.push([p[0] - 0.17, p[2] - 0.17, p[0] + 0.17, p[2] + 0.17]);
    // palms: trunks + crowns + Christmas light sleeves (even / odd)
    const palms = [[-36, 7.4, 6.6], [-28, 7.4, 7.2], [-4, 7.4, 6.8], [4, 7.4, 7.4], [9.6, 7.4, 6.4], [20, 7.4, 7.0], [28, 7.4, 6.6], [36, 7.4, 7.2],
      [-1.5, 15.5, 6.0], [16, 15.5, 6.6], [34, 12.5, 5.8], [38, 16.0, 6.4], [-19.4, 17.3, 6.8], [-5.5, 16.5, 6.2], [10, 20.5, 5.6]];
    const trunkG = (() => { const g = new THREE.CylinderGeometry(0.13, 0.19, 1, 6, 8); g.translate(0, 0.5, 0); const p = g.attributes.position, a = new Float32Array(p.count * 3); for (let i = 0; i < p.count; i++) { tc.set(Math.floor(p.getY(i) * 16) % 2 ? 0x8a6b4a : 0x76593c); a[i * 3] = tc.r; a[i * 3 + 1] = tc.g; a[i * 3 + 2] = tc.b; } g.setAttribute('color', new THREE.BufferAttribute(a, 3)); return bakeLight(g, { y0: 0 }); })();
    IM(trunkG, M.vc, palms.map(([x, z, h]) => [x, 0, z, (x * 7) % 3, [1, h, 1]]), 'palm_trunks', rp);
    IM(geoOf(palmCrown), M.vc, palms.map(([x, z, h]) => [x, h, z, (x * 3) % TAU, 1]), 'palm_crowns', rp);
    const sleeve = (() => { const g = new THREE.CylinderGeometry(0.2, 0.22, 2.8, 8, 1, true); g.translate(0, 1.9, 0); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 2, uv.getY(i) * 5); return g; })();
    R.palmA = IM(sleeve, M.palmA, palms.filter((p, i) => i % 2 === 0).map(([x, z]) => [x, 0, z, 0]), 'palm_lights_a', rp);
    R.palmB = IM(sleeve, M.palmB, palms.filter((p, i) => i % 2 === 1).map(([x, z]) => [x, 0, z, 0.8]), 'palm_lights_b', rp);
    for (const [x, z] of palms) COL.push([x - 0.25, z - 0.25, x + 0.25, z + 0.25]);
    // lamps: promenade 10 (arms over the footpath of the promenade), plaza 2, jetty 6
    const lamps = [];
    for (const x of [-40, -32, -24, -8, -4.6, 8, 16, 21, 32, 44]) lamps.push([x, 5.6, PI]);
    lamps.push([-18, 12, 0], [-6, 12, 0], [-13.95, 24, H], [-13.95, 36, H], [-13.95, 48, H], [-10.05, 30, -H], [-10.05, 42, -H], [-4.2, 57, -H]);
    const postG = geoOf(() => { cyl(0.12, 0.14, 0.3, 8, 0x3a3e44, 0, 0.15, 0); cyl(0.06, 0.075, 4.3, 8, 0x4a4f56, 0, 2.3, 0); boxR(0.05, 0.05, 0.74, 0x4a4f56, 0, 4.42, 0.34); cyl(0.05, 0.05, 0.1, 6, 0x4a4f56, 0, 4.48, 0); cyl(0.08, 0.24, 0.14, 8, 0x3a3e44, 0, 4.42, 0.7); }, { floor: true });
    IM(postG, M.vc, lamps.map(([x, z, ry]) => [x, 0, z, ry]), 'lamp_posts', rp);
    R.lampHeads = IM(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 10), SKY.bulb, lamps.map(([x, z, ry]) => [x + Math.sin(ry) * 0.7, 4.33, z + Math.cos(ry) * 0.7, ry]), 'lamps', rp);
    for (let i = 0; i < lamps.length; i++) R.lampHeads.setColorAt(i, tc.set(0xf4f0e8));
    for (const [x, z] of lamps) if (z < 18) COL.push([x - 0.15, z - 0.15, x + 0.15, z + 0.15]);
    // jetty piles + rail posts
    const piles = [];
    for (let z = 19; z < 54; z += 2) piles.push([-13.6, -4.2, z, 0], [-10.4, -4.2, z, 0]);
    for (let k = 0; k < 8; k++) for (const z of [54.6, 59.4]) piles.push([-19.4 + k * 2.2, -4.2, z, 0]);
    IM(geoOf(() => cyl(0.16, 0.18, 4.0, 7, 0x5a4c3c, 0, 2.0, 0)), M.vc, piles, 'jetty_piles', rp);
    const posts = [];
    for (let z = 18.1; z <= 54; z += 2) posts.push([-13.75, 0, z, 0], [-10.25, 0, z, 0]);
    for (let x = -20; x <= -4; x += 2) posts.push([x, 0, 60, 0]);
    for (const z of [55.5, 57, 58.5]) posts.push([-20, 0, z, 0], [-4, 0, z, 0]);
    for (const x of [-20, -18, -16, -14.5, -9.5, -8, -6, -4]) posts.push([x, 0, 54, 0]);
    IM(geoOf(() => bb(-0.06, 0, -0.06, 0.06, 1.15, 0.06, 0x9a8c76), { floor: true }), M.vc, posts, 'jetty_rail_posts', rp);
    // rocks: under the first spans of the jetty and along the sea wall, the groyne at x -4
    seed = 77; const rocks = [];
    for (let i = 0; i < 30; i++) { const x = i < 22 ? -24 + i * 0.95 + rnd() * 0.5 : -4.2 + rnd() * 0.4, z = i < 22 ? 18.7 + rnd() * 2.4 : 18.5 + (i - 22) * 1.3; rocks.push([x, -1.9 + rnd() * 0.5, z, rnd() * 3, [0.7 + rnd() * 0.7, 0.5 + rnd() * 0.5, 0.7 + rnd() * 0.6]]); }
    IM(geoOf(() => ico(0.8, 0x8a8478, 0, 0, 0, 0.8)), M.vc, rocks, 'rocks_p', rp);
    // rooftop AC units, inland town blocks + pines + a water tower
    seed = 51; const ac = [];
    for (let i = 0; i < 20; i++) { const xa = i < 12 ? -44 + rnd() * 48 : 12 + rnd() * 32; ac.push([xa, 6.25, -14.5 + rnd() * 5, (rnd() > 0.5 ? H : 0)]); }
    IM(geoOf(() => { bb(-0.7, 0, -0.5, 0.7, 0.8, 0.5, 0xd4d6d8); cyl(0.3, 0.3, 0.04, 10, 0x5a5e63, 0, 0.82, 0); }), M.vc, ac, 'roof_ac', rp);
    const town = [], tcol = [0xe8dcc8, 0xd8e0e4, 0xf0d8c8, 0xdce8d0, 0xe4e0d8, 0xc8d4dc];
    seed = 61; for (let i = 0; i < 24; i++) { const x = -110 + (i % 8) * 30 + rnd() * 8, z = -58 - Math.floor(i / 8) * 34 - rnd() * 10; town.push([x, 0, z, rnd() * 0.3, [12 + rnd() * 10, 5 + rnd() * 5, 10 + rnd() * 8]]); }
    const townIM = IM(geoOf(() => { bb(-0.5, 0, -0.5, 0.5, 1, 0.5, 0xffffff); }), M.vc, town, 'town', rp);
    for (let i = 0; i < 24; i++) townIM.setColorAt(i, tc.set(tcol[i % tcol.length]));
    const pinesP = [];
    for (const [x, z, h] of [[-60, -40, 18], [-20, -60, 22], [40, -48, 20], [75, -70, 24], [-90, -80, 20], [10, -110, 26]]) for (let t = 0; t < 6; t++) { const k = 1 - t / 6; pinesP.push([x, h * (0.25 + t * 0.125), z, t, [0.6 + h * 0.15 * k, 1.2 + 0.6 * k, 0.6 + h * 0.15 * k]]); }
    R.tierG = geoOf(() => { const g = new THREE.ConeGeometry(1, 1.6, 9, 2); g.translate(0, 0.5, 0); const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const r = Math.hypot(p.getX(i), p.getZ(i)); if (r > 0.5) p.setY(i, p.getY(i) - (r - 0.5) * 0.35); } put(g, 0x3a6a44); ico(0.3, 0x4a7a50, 0, 1.25, 0, 1.6); });
    IM(R.tierG, M.vc, pinesP, 'town_pines', rp);
    rp.add(part('town_trunks', () => { for (const [x, z, h] of [[-60, -40, 18], [-20, -60, 22], [40, -48, 20], [75, -70, 24], [-90, -80, 20], [10, -110, 26]]) pine(x, z, h, 1.4);
      cyl(3, 3, 4, 10, 0xd8dcdc, 30, 22, -90); cyl(0.4, 0.4, 20, 6, 0xb8bcbc, 30, 10, -90); }));

    // ======================================================== props (Region P)
    buildPropsP(rp, addP);
  }

  // ---------------------------------------------------------- ambient rigs (built once, re-parented on every build; not actors)
  const STROLL = [
    { look: 'local40_a', z: -5.4, x0: -40, x1: -22 }, { look: 'local40_b', z: -5.4, x0: -13, x1: 2 },
    { look: 'local40_c', z: -5.6, x0: 13, x1: 26 }, { look: 'local40_d', z: 6.7, x0: -40, x1: -26 },
    { look: 'local40_e', z: 6.7, x0: 18, x1: 40 }, { look: 'local40_f', sit: true, x0: 9.0, x1: 9.0, z: 17.5 },
  ];
  const FAMILY = ['sizzle_b', 'sizzle_d', 'kid40'];
  function buildRigs() {
    if (RIGS) return RIGS;
    RIGS = {
      strollers: STROLL.map((s, i) => {
        const rig = buildCharacter(s.look); rig.root.add(blobShadow());
        return { rig, s, x: s.sit ? s.x0 : s.x0 + (s.x1 - s.x0) * (0.2 + 0.25 * i % 0.8), z: s.z, to: s.x1, a: 'idle', at: 0, t: 0.5 + i * 0.9, yaw: s.sit ? 0 : H, face: s.sit ? 0 : H, col: [1e4, 1e4, 1e4, 1e4], pick: 'idle' };
      }),
      family: FAMILY.map((id) => ({ rig: buildCharacter(id), a: 'idle', at: 0 })),
    };
    return RIGS;
  }
  function pelicanIMs(parent, nBody, suffix) {   // bodies + wings (2 per body); matrices written by update
    const body = IM(R.pelBodyG, M.vc, new Array(nBody).fill(0).map(() => [0, -50, 0, 0]), 'pelicans_' + suffix, parent);
    const wings = IM(R.pelWingG, M.vc2, new Array(nBody * 2).fill(0).map(() => [0, -50, 0, 0]), 'pelican_wings_' + suffix, parent);
    dyn(body); dyn(wings);
    return { body, wings, n: nBody };
  }

  function buildPropsP(rp, addP) {
    // ---- hover-cars: the hero (TRACK, 1.8 exterior), the idling one in the car park, traffic, two parked
    R.hero = addP(part('hovercar_hero', () => hoverCar(0xf4f4f2, M.carGlow), null, 0, { floor: false }));
    R.heroBlink = part('hero_blink', () => { for (const z of [1.86, -1.86]) bb(0.84, 0.58, z - 0.08, 0.9, 0.68, z + 0.08, 0xffffff, M.blink); }, null, 0, { floor: false });
    R.hero.add(R.heroBlink);
    { const s = blobShadow(); s.scale.set(2.6, 1, 5.2); R.hero.add(s); }
    R.hero.visible = false;
    R.drive = { path: null, len: 0, segs: null, d: 0, v: 0, res: null, x: 0, z: 0, yaw: 0, on: false, blink: false };
    R.hero.userData.drive = (pathId, speed = 2) => {
      const pts = PATHS[pathId]; if (!pts) return Promise.resolve();
      const D = R.drive; if (D.res) { const r = D.res; D.res = null; r(); }
      D.path = pts; D.segs = []; D.len = 0;
      for (let i = 0; i < pts.length - 1; i++) { const l = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]); D.segs.push(l); D.len += l; }
      D.d = 0; D.v = speed; D.on = true; D.yaw = Math.atan2(pts[1][0] - pts[0][0], pts[1][1] - pts[0][1]);
      R.hero.visible = true; heroPlace(0);
      if (typeof flow !== 'undefined' && flow.skipping) { D.d = D.len; heroPlace(D.len); D.on = false; R.hero.visible = false; return Promise.resolve(); }
      return new Promise((res) => { D.res = res; });
    };
    R.hero.userData.indicate = (on) => { R.drive.blink = !!on; if (!on) M.blink.emissiveIntensity = 0; };
    R.hero.userData.stop = () => { const D = R.drive; D.on = false; R.hero.visible = false; M.blink.emissiveIntensity = 0; D.blink = false; if (D.res) { const r = D.res; D.res = null; r(); } };
    R.parked = addP(part('hovercar_parked', () => hoverCar(0xcfe2ee, M.parkGlow), [-27, 0, 10.2], 0, { floor: false }));
    { const s = blobShadow(); s.scale.set(2.6, 1, 5.2); R.parked.add(s); }
    R.parked.userData.hi = false; R.parked.userData.highlight = (on) => { R.parked.userData.hi = !!on; };
    COL.push([-28.0, 8.1, -26.0, 12.1]);
    R.carG = geoOf(() => hoverCar(0xffffff, null)); R.carGlowG = geoOf(() => { for (const [x, z] of [[0.58, 1.25], [-0.58, 1.25], [0.58, -1.25], [-0.58, -1.25]]) cyl(0.24, 0.24, 0.02, 10, 0xffffff, x, 0.245, z); boxR(1.64, 0.03, 0.1, 0xffffff, 0, 0.75, 0); });
    const TCOL = [0xf4f4f2, 0xbfe0f4, 0xc8ccd4, 0xf2a98c, 0x9fd8c4, 0x3a4a78];
    R.traffic = addP(new THREE.Group()); R.traffic.name = 'traffic';
    R.tBody = dyn(IM(R.carG, M.vc, TCOL.map(() => [0, -50, 0, 0]), 'traffic_body', R.traffic));
    R.tGlow = dyn(IM(R.carGlowG, SKY.bulb, TCOL.map(() => [0, -50, 0, 0]), 'traffic_glow', R.traffic));
    { const bs = blobShadow(); R.tShadow = dyn(new THREE.InstancedMesh(bs.geometry, bs.material, 6)); R.tShadow.name = 'traffic_shadow'; R.tShadow.renderOrder = 1; R.traffic.add(R.tShadow); }
    for (let i = 0; i < 6; i++) { R.tBody.setColorAt(i, tc.set(TCOL[i])); R.tGlow.setColorAt(i, tc.set(0x9fdcff)); }
    R.cars = TCOL.map((c, i) => ({ lane: i % 2 ? -1 : 1, x: -90 + i * 31, v: 0, vMax: 5 + (i * 0.37 % 1) * 2, stopT: 0, chirp: false, on: true }));
    R.tCount = 6; R.traffic.userData.count = (n) => { R.tCount = Math.max(0, Math.min(6, n | 0)); };
    const cp = IM(R.carG, M.vc, [[-38.2, 0, 10.2, 0], [-32.6, 0, 10.2, 0]], 'cars_parked', rp);
    cp.setColorAt(0, tc.set(0xe8e8e4)); cp.setColorAt(1, tc.set(0x3a4a78));
    COL.push([-39.2, 8.1, -37.2, 12.1], [-33.6, 8.1, -31.6, 12.1]);
    // ---- the lifeguard drone over Suttons Beach
    R.life = addP(new THREE.Group()); R.life.name = 'lifeguard_drone';
    R.lifeD = buildDrone('lifeguard'); R.lifeD.scale.setScalar(1.7); R.life.add(R.lifeD); R.life.position.set(15, 3.2, 32.6); R.life.rotation.y = PI;
    R.life.userData.talk = (on) => { R.lifeTalk = !!on; }; R.lifeTalk = false;
    // ---- set-owned rigs: strollers with chip lights + the family in the shallows
    const rigs = buildRigs();
    R.strollers = addP(new THREE.Group()); R.strollers.name = 'strollers';
    for (const c of rigs.strollers) { R.strollers.add(c.rig.root); COL.push(c.col); }
    R.strollers.userData.on = (on) => { R.strollers.visible = !!on; if (!on) for (const c of rigs.strollers) c.col[0] = c.col[1] = c.col[2] = c.col[3] = 1e4; };
    R.family = addP(new THREE.Group()); R.family.name = 'family';
    for (const f of rigs.family) R.family.add(f.rig.root);
    R.famT = -1; R.family.userData.exit = () => { if (R.famT < 0) R.famT = 0; if (typeof flow !== 'undefined' && flow.skipping) R.famT = 6; };
    // ---- pelicans: instanced flock (4 perched + 2 gliding) + the hero
    R.pelBodyG = geoOf(() => pelicanBody(true)); R.pelWingG = geoOf(pelicanWing);
    R.pelP = pelicanIMs(rp, 6, 'p');
    R.pelHero = new THREE.Group(); R.pelHero.name = 'pelican_hero';
    R.pelHeroBody = new THREE.Mesh(geoOf(() => pelicanBody(false)), M.vc); R.pelHero.add(R.pelHeroBody);
    R.pelHeroJaw = part('pelican_jaw', () => boxR(0.09, 0.09, 0.42, 0xe8a888, 0, -0.04, 0.21, 0.0), [0, 0.88, 0.27], 0, { floor: false });
    R.pelHeroJaw.rotation.x = 0.42; R.pelHero.add(R.pelHeroJaw);
    R.pelWingL = new THREE.Mesh(R.pelWingG, M.vc2); R.pelWingR = new THREE.Mesh(R.pelWingG, M.vc2);
    R.pelWingL.position.set(0.16, 0.56, 0.0); R.pelWingR.position.set(-0.16, 0.56, 0.0); R.pelHero.add(R.pelWingL, R.pelWingR);
    R.root.add(R.pelHero);
    R.pelH = { mode: 'perch', t: 0, dur: 3, clackT: -1, res: null, from: new THREE.Vector3(), to: new THREE.Vector3(), ry: 0, home: [-9.4, 1.23, 23.8, 0.6] };
    R.pelHero.userData.clack = () => { R.pelH.clackT = 0; if (typeof sfx === 'function' && !(typeof flow !== 'undefined' && flow.skipping)) { AT3[0] = R.pelHero.position.x; AT3[1] = R.pelHero.position.y + 0.9; AT3[2] = R.pelHero.position.z; sfx('pelican', SFX_CLACK); } };
    R.pelHero.userData.land = (where, dur = 3) => {
      const m = typeof where === 'string' ? MARKS[where] : where, P = R.pelH;
      if (!m) return Promise.resolve();
      if (P.res) { const r = P.res; P.res = null; r(); }
      P.to.set(m[0], m[1], m[2]); P.ry = m[3] || 0;
      P.from.set(m[0] - Math.sin(P.ry) * 14 + 6, m[1] + 7, m[2] - Math.cos(P.ry) * 14);
      P.mode = 'land'; P.t = 0; P.dur = dur; R.pelHero.visible = true;
      if (typeof flow !== 'undefined' && flow.skipping) { P.t = dur; }
      return new Promise((res) => { P.res = res; });
    };
    // ---- palms: the lane palm on its own (fronds sway); festoon over the lane
    R.lanePalm = addP(part('lane_palm', () => { cyl(0.12, 0.17, 5.0, 6, 0x7a5d3f, 0, 2.5, 0); }, [10.3, 0.5, -26.5]));
    R.lanePalmCrown = part('lane_palm_crown', palmCrown, [0, 5.0, 0], 0, { floor: false }); R.lanePalm.add(R.lanePalmCrown);
    const fest = [], wire = [];
    for (let k = 0; k < 10; k++) {
      const z0 = -8.0 - k * 2.25, z1 = z0 - 2.25, xa = k % 2 ? 11 : 6, xb = k % 2 ? 6 : 11;
      for (let j = 0; j < 4; j++) { const u = (j + 0.5) / 4; fest.push([xa + (xb - xa) * u, 4.2 - Math.sin(u * PI) * 0.35 - 0.06, z0 + (z1 - z0) * u, 0]); }
      wire.push([xa, z0, xb, z1]);
    }
    R.festoon = IM(new THREE.IcosahedronGeometry(0.07, 0), SKY.bulb, fest, 'lane_festoon', rp);
    const FEST = [0xfff1d0, 0xff6a5a, 0x7ae08a, 0x8ab8ff, 0xffb46a]; R.festCol = FEST;
    for (let i = 0; i < fest.length; i++) R.festoon.setColorAt(i, tc.set(FEST[i % 5]));
    addP(part('festoon_wires', () => { for (const [xa, za, xb, zb] of wire) for (let j = 0; j < 4; j++) { const u0 = j / 4, u1 = (j + 1) / 4; const p0 = [xa + (xb - xa) * u0, 4.2 - Math.sin(u0 * PI) * 0.35, za + (zb - za) * u0], p1 = [xa + (xb - xa) * u1, 4.2 - Math.sin(u1 * PI) * 0.35, za + (zb - za) * u1]; const g = new THREE.BoxGeometry(0.015, 0.015, Math.hypot(p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2])); g.lookAt(new THREE.Vector3(p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2])); g.translate((p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2, (p0[2] + p1[2]) / 2); put(g, 0x2a2e34); } }, null, 0, { floor: false }));
    // ---- the wrapped Christmas tree, the 2032 plaque, the blank sign, the billboard, the kiosk
    R.tree = addP(part('xmas_tree_wrapped', () => {
      cyl(0.9, 1.0, 0.5, 10, 0xb8a890, 0, 0.25, 0); cyl(0.14, 0.16, 0.8, 6, 0x5a4636, 0, 0.9, 0);
      for (let t = 0; t < 4; t++) { const g = new THREE.ConeGeometry(1.4 - t * 0.3, 1.3, 9); g.translate(0, 1.25 + t * 0.72, 0); put(g, t % 2 ? 0x3f7a42 : 0x356e3a); }
      for (let i = 0; i < 12; i++) { const a = i * 2.3, y = 1.2 + (i % 4) * 0.7, r = 1.25 - (i % 4) * 0.28; ico(0.1, [TRED, SILVER, 0x5a8ad8][i % 3], Math.sin(a) * r, y, Math.cos(a) * r); }
      const wrap = new THREE.ConeGeometry(1.62, 3.9, 12, 1, true); wrap.translate(0, 2.42, 0); const uv = wrap.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 4, uv.getY(i) * 4); put(wrap, 0xffffff, M.bubble);
      for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; boxR(0.16, 0.34, 0.12, CREAM, Math.sin(a) * 0.17, 4.5 + Math.cos(a) * 0.17, 0, 0, 0, -a); }
      ico(0.16, SEAM, 0, 4.5, 0, 0.7); cyl(0.22, 0.22, 0.04, 10, 0xeae4d8, 0, 0.52, 0);
      for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; boxR(0.3, 0.2, 0.25, [TRED, SILVER, TGRN][k % 3], Math.sin(a) * 1.25, 0.6, Math.cos(a) * 1.25, 0, a); }
    }, [8.4, 0, 13.2]));
    COL.push([7.0, 11.8, 9.8, 14.6]);
    R.plaque = addP(part('plaque_2032', () => {
      bb(-0.42, 0, -0.24, 0.42, 0.62, 0.2, SANDST); boxR(0.9, 0.08, 0.42, 0xe2c898, 0, 0.78, 0.05, 1.047);
      tq(0.56, 0.28, A_PLQ, 0, 0.802, 0.0885, 0, -0.5236); bb(-0.5, 0, -0.3, 0.5, 0.06, 0.3, 0xb8a078);
    }, [-2, 0, 8.5], PI));
    COL.push([-2.5, 8.2, -1.5, 8.8]);
    R.blankSign = addP(part('blank_sign', () => {
      for (const x of [-1.5, 1.5]) bb(x - 0.06, 0, -0.06, x + 0.06, 2.85, 0.06, 0x8a9096);
      bb(-1.55, 1.08, -0.05, 1.55, 2.72, 0.03, 0xd8dce0); tq(3.0, 1.6, A_BLANK, 0, 1.9, 0.035);
    }, [-16.5, 0, 15.5], PI));
    COL.push([-18.1, 15.4, -17.9, 15.6], [-15.1, 15.4, -14.9, 15.6]);
    addP(part('billboard_blank', () => {
      for (const x of [-11, -4, 3]) { bb(x - 0.12, 5.9, -12.3, x + 0.12, 8.1, -12.1, 0x6a6e74); boxR(0.1, 3.2, 0.1, 0x6a6e74, x, 7.0, -13.0, 0.6); }
      bb(-12.1, 7.95, -12.25, 4.1, 14.1, -12.05, 0xc8ccd0); tq(16, 6, A_BLANK, -4, 11, -12.04);
    }));
    R.kiosk = PROPS.safesense_kiosk({ key: 'parade_kiosk' }); R.kiosk.name = 'kiosk'; R.kiosk.position.set(12, 0, 8.4); R.kiosk.rotation.y = PI; addP(R.kiosk);
    R.kiosk.userData.show('Here for|you.'); R.kioskT = 0;
    R.kiosk.userData.chime = () => { R.kioskT = 1.4; if (R.kiosk.userData.setLight) R.kiosk.userData.setLight('white'); R.kiosk.userData.show('Have you tried|being safe?'); };
    COL.push([11.4, 8.1, 12.6, 8.9]);
    // ---- the chip shop: lit interior card (open/flicker), tinsel on the awning, the urn, the flat's door + window + figures + lights
    R.chipWin = addP(part('chip_shop_window', () => { tq(7.2, 2.22, A_CHIPS, 32, 1.51, -7.78, 0, 0, M.chipLit); }, null, 0, { floor: false }));
    R.chipOpen = true; R.chipWin.userData.open = (on) => { R.chipOpen = !!on; };
    R.tinsel = addP(part('awning_tinsel', () => {
      for (let i = 0; i < 32; i++) { const u = i / 31, x = -4 + u * 8, y = -0.12 - Math.abs(Math.sin(u * PI * 4)) * 0.22; boxR(0.26, 0.07, 0.07, i % 2 ? SILVER : TRED, x, y, 0.02, 0, 0, Math.cos(u * PI * 4) * 0.6); }
      for (let i = 0; i < 9; i++) ico(0.06, [TRED, SILVER, TGRN][i % 3], -4 + i, -0.38, 0.03);
    }, [32, 3.0, -4.95], 0, { floor: false }));
    R.urn = addP(part('urn', () => {
      cyl(0.17, 0.18, 0.04, 12, 0x3a3e44, 0, 0.02, 0); cyl(0.15, 0.15, 0.4, 12, 0xd8dce2, 0, 0.24, 0); cyl(0.155, 0.155, 0.03, 12, 0xb8bec4, 0, 0.42, 0);
      cyl(0.06, 0.08, 0.05, 10, 0x2a2c30, 0, 0.47, 0); boxR(0.04, 0.04, 0.12, 0x2a2c30, 0, 0.12, 0.16); bb(-0.02, 0.06, 0.2, 0.02, 0.11, 0.24, 0x2a2c30);
      boxR(0.05, 0.05, 0.03, 0xe83a3a, 0.08, 0.3, 0.14);
    }, [3.2, 1.02, -7.05], 0, { floor: false }));
    R.urn.userData.steam = () => { if (typeof world !== 'undefined' && world.puff) world.puff([3.2, 1.55, -7.05], { n: 16, speed: 0.25, life: 1.8, color: 0xf2f2f2 }); };
    R.door = addP(part('flat_door', () => {
      bb(0, 0, -0.03, 1.2, 2.34, 0.03, NAVY); bb(0.1, 0.3, 0.03, 1.1, 1.1, 0.045, 0x1c2648); bb(0.1, 1.3, 0.03, 1.1, 2.2, 0.045, 0x1c2648);
      tq(0.2, 0.1, A_1A, 0.6, 1.62, 0.05); cyl(0.035, 0.035, 0.07, 8, BRASS, 1.04, 1.05, 0.06, H); bb(0.45, 0.95, 0.03, 0.75, 1.0, 0.05, BRASS);
    }, [36.2, 0, -7.02], 0, { floor: false }));
    R.doorT = 0; R.doorOpen = false; R.door.userData.open = (on) => { R.doorOpen = !!on; if (typeof flow !== 'undefined' && flow.skipping) R.doorT = on ? 1 : 0; };
    R.flatWin = addP(new THREE.Group()); R.flatWin.name = 'flat_window';
    R.winDark = part('flat_window_dark', () => quad(1.94, 1.1, M.winDark, 34.4, 5.125, -7.05), null, 0, { floor: false });
    R.winClear = part('flat_window_clear', () => quad(1.94, 1.1, M.glass, 34.4, 5.125, -7.05), null, 0, { floor: false });
    R.pendant = part('flat_pendant', () => { cyl(0.08, 0.26, 0.2, 10, 0x2a2a2a, 34.3, 5.55, -7.95); cyl(0.2, 0.2, 0.02, 10, 0xffffff, 34.3, 5.44, -7.95, 0, 0, M.pend); }, null, 0, { floor: false });
    R.flatWin.add(R.winDark, R.winClear, R.pendant);
    R.flatLit = false; R.flatWin.userData.lit = (on) => { R.flatLit = !!on; applyFlatLit(); };
    R.figs = addP(part('window_figures', () => { tq(1.9, 0.95, B_FIG_A, 34.4, 4.95, -7.4, 0, 0, M.figs); }, null, 0, { floor: false }));
    R.figsB = part('window_figures_b', () => { tq(1.9, 0.95, B_FIG_B, 34.4, 4.95, -7.399, 0, 0, M.figs); }, null, 0, { floor: false }); R.figs.add(R.figsB);
    R.figsA = R.figs.children[0];
    const bal = [];
    for (let x = 28.1; x < 31.6; x += 0.26) bal.push([x, 4.7, -5.5, 0]);
    for (let z = -6.9; z < -5.5; z += 0.28) bal.push([28.0, 4.7, z, 0], [31.6, 4.7, z, 0]);
    for (let x = 33.3; x < 35.6; x += 0.26) bal.push([x, 5.92, -6.56, 0]);
    R.balLights = IM(new THREE.IcosahedronGeometry(0.045, 0), SKY.bulb, bal, 'flat_balcony_lights', rp);
    for (let i = 0; i < bal.length; i++) R.balLights.setColorAt(i, tc.set([0xff5050, 0x5ad070, 0xfff1d0][i % 3]));
    // ---- the stage (2031 band shell) + the festival poster (B1 frame only)
    addP(part('stage_2031', () => {
      bb(-31, 0, 13, -25, 0.8, 19, 0xc8c0b0); bb(-31.05, 0.78, 12.95, -24.95, 0.84, 19.05, 0x8a7a64);
      { const g = new THREE.SphereGeometry(3.2, 12, 6, -H, PI, 0, H); g.translate(-27.9, 0.8, 16); put(g, 0xf0ece4, M.vc2); }   // a quarter dome open to +X
      { const g = new THREE.TorusGeometry(3.2, 0.12, 4, 12, PI); g.rotateY(H); g.translate(-27.9, 0.8, 16); put(g, 0xd8d0c0); }
      bb(-25.2, 0.7, 13.08, -24.0, 2.5, 13.16, 0x8a8478); tq(1.1, 1.7, A_BOARD, -24.6, 1.6, 13.06, PI);
      for (const x of [-25.15, -24.05]) bb(x - 0.04, 0, 13.08, x + 0.04, 0.7, 13.16, 0x6a6e74);
    }));
    R.poster = addP(part('poster_2031', () => {
      tq(1.0, 1.6, [0, 0, 128, 256], -24.6, 1.6, 13.04, PI, 0, M.poster, 128, 256);
      for (let i = 0; i < 12; i++) { const z = 13.3 + i * 0.48; const g = new THREE.ConeGeometry(0.12, 0.24, 3); g.rotateX(PI); g.translate(-25.0, 3.6 - Math.sin(i / 11 * PI) * 0.25, z); put(g, [TRED, 0x5a8ad8, 0xffffff, TGRN][i % 4]); }
    }, null, 0, { floor: false }));
    // ---- Bee Gees Way: piano (+ limiter box), LED, brass plate, keypad flash, lane bollards, statues
    R.piano = addP(part('piano', () => {
      const BL = 0x8fcff0, DKB = 0x5a9ac0;
      bb(-0.3, 0.08, -0.75, 0.3, 1.3, 0.75, BL); bb(-0.32, 1.28, -0.77, 0.32, 1.34, 0.77, DKB); bb(-0.32, 0, -0.77, 0.32, 0.1, 0.77, DKB);
      tq(1.42, 1.1, A_PIANO, -0.302, 0.7, 0, -H); tq(0.56, 1.0, A_PIANO, 0, 0.72, 0.752); tq(0.56, 1.0, A_PIANO, 0, 0.72, -0.752, PI);
      bb(0.3, 0.68, -0.72, 0.58, 0.74, 0.72, DKB); bb(0.3, 0.74, -0.7, 0.56, 0.78, 0.7, 0xf4f2ec);         // keybed + white keys
      for (let i = 0; i < 27; i++) { if (i % 7 === 2 || i % 7 === 6) continue; const z = -0.7 + (i + 1) * 0.05; bb(0.3, 0.78, z - 0.014, 0.46, 0.81, z + 0.014, 0x1a1a1a); }
      for (let i = 0; i < 28; i++) bb(0.555, 0.745, -0.7 + i * 0.05, 0.56, 0.78, -0.698 + i * 0.05, 0xc8c4bc);
      bb(0.3, 0.8, -0.72, 0.36, 1.28, 0.72, BL); tq(1.3, 0.3, A_PIANO, 0.362, 0.98, 0, H);                  // fallboard: PLAY ME
      bb(0.3, 1.0, -0.6, 0.42, 1.06, 0.6, 0xe8e4d8);                                                          // music desk
      for (const z of [-0.68, 0.68]) bb(0.38, 0, z - 0.04, 0.6, 0.72, z + 0.04, BL);                          // cheeks
      // the SafeSense limiter on the +Z end face: label (left half) + keypad (right half, under the plate)
      bb(-0.17, 0.72, 0.75, 0.17, 0.98, 0.87, 0xe8edf2); tq(0.32, 0.24, A_LIM, 0, 0.85, 0.871);
      bb(-0.18, 0.71, 0.74, 0.18, 0.73, 0.88, 0xc8d0d8);
    }, [8.3, 0, -20]));
    COL.push([7.95, -20.8, 8.95, -19.2], [9.15, -20.75, 9.75, -19.25]);
    R.led = addP(part('limiter_light', () => bb(-0.05, 0, -0.025, 0.05, 0.025, 0.025, 0xffffff, droneLightMat('escort')), [8.18, 0.98, -19.19], 0, { floor: false }));
    R.ledState = 'red'; R.led.userData.set = (st) => { R.ledState = st === 'green' ? 'green' : 'red'; R.led.children[0].material = droneLightMat(R.ledState === 'green' ? 'green' : 'escort'); };
    R.plate = addP(new THREE.Group()); R.plate.name = 'limiter_plate'; R.plate.position.set(8.385, 0.975, -19.125);
    R.plateMesh = part('limiter_plate_mesh', () => { bb(-0.085, -0.25, 0, 0.085, 0, 0.018, BRASS); bb(-0.08, -0.24, 0.018, 0.08, -0.01, 0.02, 0xd8b860); for (const [x, y] of [[-0.06, -0.03], [0.06, -0.03], [-0.06, -0.22], [0.06, -0.22]]) cyl(0.008, 0.008, 0.01, 6, 0x7a6020, x, y, 0.022, H); cyl(0.012, 0.012, 0.17, 6, 0x9a7a30, 0, -0.002, 0.008, 0, H); }, null, 0, { floor: false });
    R.plate.add(R.plateMesh); R.plateU = 0; R.plateTo = 0; R.plateHeld = false;
    R.plate.userData.lift = (u) => { R.plateTo = clamp01(u); if (typeof flow !== 'undefined' && flow.skipping) R.plateU = R.plateTo; };
    R.plate.userData.prop = (on) => { R.plateHeld = !!on; if (on) R.plateTo = 1; };
    R.keyFlash = addP(part('keypad', () => tq(0.032, 0.028, A_KEYS, 0, 0, 0, 0, 0, M.chipLit), [8.39, 0.92, -19.122], 0, { floor: false }));
    R.keyFlash.children[0].visible = false; R.keyT = 0;
    R.keyFlash.userData.press = (d) => { const K = '123456789*0#', i = Math.max(0, K.indexOf(String(d))); R.keyFlash.position.set(8.39 + ((i % 3) - 1) * 0.04, 0.95 - Math.floor(i / 3) * 0.046, -19.122); R.keyFlash.children[0].visible = true; R.keyT = 0.18; };
    R.bollards = addP(part('lane_bollards', () => { for (const z of [-34.2, -33.0, -31.8]) { cyl(0.16, 0.16, 0.86, 10, CREAM, 11.4, 0.43, z); cyl(0.165, 0.165, 0.05, 10, SEAM, 11.4, 0.1, z); cyl(0.12, 0.12, 0.06, 10, 0x3a3e44, 11.4, 0.89, z); } }));
    R.bolCol = [11.2, -35, 11.6, -31]; COL.push(R.bolCol); R.bolU = 1; R.bolUp = true;
    R.bollards.userData.up = (on) => { R.bolUp = !!on; if (typeof flow !== 'undefined' && flow.skipping) R.bolU = on ? 1 : 0; };
    addP(part('statues', () => { statueFigure(7.4, -33.9, 0); statueFigure(8.5, -33.9, 1); statueFigure(9.6, -33.9, 2); }));
    COL.push([6.7, -34.8, 10.3, -33.0], [9.8, -27.0, 10.8, -26.0]);
    R.conf = [[1e4, 1e4, 1e4, 1e4], [1e4, 1e4, 1e4, 1e4]]; COL.push(R.conf[0], R.conf[1]);   // lane22 confinement (dress)
    // ---- water, foam, sun glitter
    R.waterP = addP(part('water_p', () => waterPlane(-1.5, 16, 1000), null, 0, { floor: false }));
    R.foamP = addP(part('foam_p', () => { const g = new THREE.PlaneGeometry(46, 0.9); g.rotateX(-H); g.translate(19, -1.47, 29); put(wuv(g, 6), 0xffffff, M.foam); }, null, 0, { floor: false }));
    addP(part('foam_rocks', () => { for (const [x0, x1, z] of [[-24, -13.9, 21.2], [-10.1, -4.4, 21.0]]) { const g = new THREE.PlaneGeometry(x1 - x0, 1.2); g.rotateX(-H); g.translate((x0 + x1) / 2, -1.46, z); put(wuv(g, 5), 0xffffff, M.foam); } }, null, 0, { floor: false }));
    R.glitterP = addP(part('glitter_p', () => { const g = new THREE.PlaneGeometry(36, 320); g.rotateX(-H); g.translate(0, 0, 190); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 4, uv.getY(i) * 30); put(g, 0xffffff, SKY.glitter); }, [0, -1.46, 0], 0, { floor: false }));
    // ---- far group (Region P)
    buildFar(rp, 'p', [-17, -1.5, 380], [-215, -1.5, 375], -1.5);
  }
  function waterPlane(y, z0, z1) {   // a big opaque fogged plane, near -> far colour, world UVs
    const zs = [z0, z0 + 20, z0 + 60, z0 + 140, z0 + 300, z1], cs = [WNEAR, 0x62bbd6, 0x56b0d0, 0x4aa6ca, WFAR, WFAR];
    strip(-560, 560, zs.map((z) => [z, y]), M.water, 7, cs);
  }

  // ---------------------------------------------------------- far groups (per region, MeshBasicMaterial, fog: false)
  const sstep = (a, b, x) => smooth((x - a) / (b - a));
  function profile(sfx, a) {   // silhouette height (m) at bearing a (degrees, from +Z toward +X)
    const n = Math.sin(a * 0.31) * 0.5 + Math.sin(a * 0.73 + 1.3) * 0.3 + Math.sin(a * 1.9 + 0.4) * 0.2;
    if (sfx === 'p') {
      const isl = sstep(12, 18, a) * (1 - sstep(76, 84, a)) * (Math.sin(a * 0.19 - 0.6) > -0.35 ? 1 : 0.15);
      const main = sstep(-100, -95, a) * (1 - sstep(-5, -1, a));
      const inland = 1 - sstep(-110, -98, a) * (1 - sstep(96, 108, a));
      return isl * (3.5 + 4.5 * Math.max(0, Math.sin((a - 14) / 62 * PI)) + 1.2 * n) + main * (1.8 + 0.8 * n) + inland * (20 + 12 * n);
    }
    const main = sstep(-80, -72, a) * (1 - sstep(36, 44, a));
    const pen = sstep(36, 46, a) * (1 - sstep(104, 112, a));
    const inland = 1 - sstep(-112, -100, a) * (1 - sstep(100, 112, a));
    return main * (1.6 + 0.9 * n) + pen * (3 + 7 * sstep(40, 100, a) + 1.4 * n) + inland * (18 + 10 * n);
  }
  function silhouettes(sfx, wy) {   // a strip of low land on the horizon (r 470), tiny towers on the P mainland
    const N = 240, r = 470, pos = [], col = [];
    const cTop = sfx === 'p' ? [0x8aa4b4, 0x7f9a8c] : [0x88a2b0, 0x82a090], cBot = 0x9cb8c8;
    for (let i = 0; i < N; i++) {
      const a0 = -180 + i * 360 / N, a1 = a0 + 360 / N, h0 = profile(sfx, a0), h1 = profile(sfx, a1);
      if (h0 < 0.2 && h1 < 0.2) continue;
      const r0 = a0 * PI / 180, r1 = a1 * PI / 180, x0 = Math.sin(r0) * r, z0 = Math.cos(r0) * r, x1 = Math.sin(r1) * r, z1 = Math.cos(r1) * r;
      const top = Math.abs(a0) > 100 ? cTop[1] : cTop[0];
      for (const [x, y, z, c] of [[x0, wy + h0, z0, top], [x0, wy - 1, z0, cBot], [x1, wy + h1, z1, top], [x1, wy + h1, z1, top], [x0, wy - 1, z0, cBot], [x1, wy - 1, z1, cBot]]) { pos.push(x, y, z); tc.set(c); col.push(tc.r, tc.g, tc.b); }
    }
    if (sfx === 'p') for (let k = 0; k < 9; k++) {   // Brisbane, tiny, beyond the bridge's far end
      const a = (-58 + k * 1.6) * PI / 180, h = 4 + ((k * 7) % 5) * 1.6, w = 2.2, x = Math.sin(a) * (r - 2), z = Math.cos(a) * (r - 2), ex = Math.cos(a) * w, ez = -Math.sin(a) * w;
      for (const [px, py, pz] of [[x - ex, wy + 1.5 + h, z - ez], [x - ex, wy, z - ez], [x + ex, wy + 1.5 + h, z + ez], [x + ex, wy + 1.5 + h, z + ez], [x - ex, wy, z - ez], [x + ex, wy, z + ez]]) { pos.push(px, py, pz); tc.set(0x7f98a8); col.push(tc.r, tc.g, tc.b); }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.computeVertexNormals(); return g;
  }
  function bridgeGeo(A, B, wy, lamps) {   // the Ted Smout Bridge as seen from 370 m: deck sides + top, piers, lamp posts (or lamp heads)
    const dx = B[0] - A[0], dz = B[2] - A[2], L = Math.hypot(dx, dz), ux = dx / L, uz = dz / L, nx = -uz * 5, nz = ux * 5;
    const hAt = (u) => wy + 5 + 4 * Math.exp(-(((u - 0.55) / 0.13) ** 2));
    const pos = [], col = [];
    const tri = (p, c) => { for (const q of p) { pos.push(q[0], q[1], q[2]); } tc.set(c); for (let i = 0; i < p.length; i++) col.push(tc.r, tc.g, tc.b); };
    const box = (cx, cy, cz, hw, hh, hd, c) => {   // axis-aligned along the bridge (hw across, hd along)
      const P = (sx, sy, sz) => [cx + sx * nx / 5 * hw + sz * ux * hd, cy + sy * hh, cz + sx * nz / 5 * hw + sz * uz * hd];
      const f = [[[-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]], [[1, -1, -1], [-1, -1, -1], [-1, 1, -1], [1, 1, -1]], [[-1, -1, -1], [-1, -1, 1], [-1, 1, 1], [-1, 1, -1]], [[1, -1, 1], [1, -1, -1], [1, 1, -1], [1, 1, 1]], [[-1, 1, 1], [1, 1, 1], [1, 1, -1], [-1, 1, -1]]];
      for (const q of f) { const v = q.map(([a, b2, c2]) => P(a, b2, c2)); tri([v[0], v[1], v[2], v[0], v[2], v[3]], c); }
    };
    if (!lamps) {
      const N = 48;
      for (let i = 0; i < N; i++) {
        const u0 = i / N, u1 = (i + 1) / N, x0 = A[0] + dx * u0, z0 = A[2] + dz * u0, x1 = A[0] + dx * u1, z1 = A[2] + dz * u1, y0 = hAt(u0), y1 = hAt(u1);
        for (const s of [1, -1]) {   // both sides: concrete face + a dark underside line
          const ax = x0 + nx * s, az = z0 + nz * s, bx = x1 + nx * s, bz = z1 + nz * s;
          tri([[ax, y0, az], [ax, y0 - 1.2, az], [bx, y1, bz], [bx, y1, bz], [ax, y0 - 1.2, az], [bx, y1 - 1.2, bz]], 0xb4c0c8);
          tri([[ax, y0 - 1.2, az], [ax, y0 - 1.6, az], [bx, y1 - 1.2, bz], [bx, y1 - 1.2, bz], [ax, y0 - 1.6, az], [bx, y1 - 1.6, bz]], 0x4c565e);
          tri([[ax, y0 + 0.9, az], [ax, y0, az], [bx, y1 + 0.9, bz], [bx, y1 + 0.9, bz], [ax, y0, az], [bx, y1, bz]], 0xc8d0d6);   // parapet
        }
        tri([[x0 + nx, y0, z0 + nz], [x1 + nx, y1, z1 + nz], [x1 - nx, y1, z1 - nz], [x0 + nx, y0, z0 + nz], [x1 - nx, y1, z1 - nz], [x0 - nx, y0, z0 - nz]], 0x8a949c);
      }
      for (let k = 0; k < 12; k++) { const u = (k + 0.5) / 12, x = A[0] + dx * u, z = A[2] + dz * u, top = hAt(u) - 1.6; box(x, (wy + top) / 2, z, 3.2, (top - wy) / 2, 0.9, 0x98a4ac); }
      for (let k = 0; k < 17; k++) { const u = (k + 0.5) / 17, x = A[0] + dx * u + nx * 0.9, z = A[2] + dz * u + nz * 0.9; box(x, hAt(u) + 2.4, z, 0.12, 2.4, 0.12, 0x9aa4ac); }
    } else for (let k = 0; k < 17; k++) { const u = (k + 0.5) / 17, x = A[0] + dx * u + nx * 0.9, z = A[2] + dz * u + nz * 0.9; box(x, hAt(u) + 4.9, z, 0.5, 0.25, 0.5, 0xffffff); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.computeVertexNormals(); return g;
  }
  function buildFar(parent, sfx, A, B, wy) {
    const add = (g, name) => { g.name = name + '_' + sfx; parent.add(g); return g; };
    const band = add(new THREE.Mesh(silhouettes(sfx, wy), SKY.land), 'band');
    const hz = new THREE.CylinderGeometry(480, 480, 34, 48, 1, true); hz.translate(0, wy - 1 + 17, 0);
    add(new THREE.Mesh(hz, SKY.haze), 'haze').renderOrder = -2;
    const sk = new THREE.CylinderGeometry(476, 476, 80, 48, 1, true); sk.translate(0, wy - 40.6, 0);
    add(new THREE.Mesh(sk, SKY.skirt), 'band_skirt');
    add(new THREE.Mesh(bridgeGeo(A, B, wy, false), SKY.bridge), 'bridge');
    const bl = add(new THREE.Group(), 'bridge_lights');
    bl.add(new THREE.Mesh(bridgeGeo(A, B, wy, true), SKY.bLamp));
    const dl = []; for (let k = 0; k < 12; k++) { const u = (k + 0.5) / 12; dl.push([A[0] + (B[0] - A[0]) * u, wy + 12 + Math.exp(-(((u - 0.55) / 0.13) ** 2)) * 4, A[2] + (B[2] - A[2]) * u, 0]); }
    const dIM = instanced(new THREE.BoxGeometry(0.9, 0.9, 0.9), SKY.bDrone, dl); dIM.name = 'bridge_drones_' + sfx; bl.add(dIM);
    const sun = add(new THREE.Group(), 'sun');
    sun.add(new THREE.Mesh(new THREE.CircleGeometry(10, 24), SKY.sun)); const halo = new THREE.Mesh(new THREE.PlaneGeometry(150, 150), SKY.halo); halo.position.z = 0.5; halo.renderOrder = 2; sun.add(halo);
    // 8 cumulus cards facing the region origin
    const pos = [], uv = [];
    seed = sfx === 'p' ? 91 : 97;
    for (let i = 0; i < 8; i++) {
      const a = (-150 + i * 37 + rnd() * 18) * PI / 180, d = 300 + rnd() * 160, y = wy + 50 + rnd() * 90, w = 70 + rnd() * 60, h = w * 0.45;
      const cx = Math.sin(a) * d, cz = Math.cos(a) * d, ex = Math.cos(a) * w / 2, ez = -Math.sin(a) * w / 2;
      for (const [px, py, pz, u, v] of [[cx - ex, y - h / 2, cz - ez, 0, 0], [cx + ex, y - h / 2, cz + ez, 1, 0], [cx + ex, y + h / 2, cz + ez, 1, 1], [cx - ex, y - h / 2, cz - ez, 0, 0], [cx + ex, y + h / 2, cz + ez, 1, 1], [cx - ex, y + h / 2, cz - ez, 0, 1]]) { pos.push(px, py, pz); uv.push(u, v); }
    }
    const cg = new THREE.BufferGeometry(); cg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); cg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); cg.computeVertexNormals();
    const clouds = add(new THREE.Mesh(cg, SKY.cloud), 'clouds'); clouds.renderOrder = -1;
    R['far_' + sfx] = { band, sun, bl, dIM, clouds };
  }

  // ---------------------------------------------------------- REGION W (local coordinates; the group sits at W0)
  const COAST = [[-200, -80], [-90, -55], [-40, -30], [-30, -4], [-22, 6.8], [22, 6.8], [30, 0], [40, -20], [90, -45], [200, -70]];
  function buildW(rw) {
    b = new Builder(); XF = null; tint = WPT;
    const addW = (g) => (rw.add(g), g);
    poly([...COAST, [200, -480], [-200, -480]], 0, M.grassW, 3);
    skirt(COAST, -3.4, 0.0, 0xc8a878);
    for (let i = 2; i < 7; i++) { const [ax, az] = COAST[i], [bx, bz] = COAST[i + 1]; const L = Math.hypot(bx - ax, bz - az); const g = new THREE.BoxGeometry(L, 0.16, 0.5); g.rotateY(-Math.atan2(bz - az, bx - ax)); g.translate((ax + bx) / 2, 0.02, (az + bz) / 2); put(g, 0xe0c898); }
    gnd(-40, -9.1, 40, -6.9, 0.02, M.pave, 1.4, CONC);                                       // the path
    gnd(-40, -11.6, 40, -9.5, 0.012, M.vc, 2, 0x6a5a40);                                     // garden bed
    seed = 33; for (let x = -39; x < 40; x += 1.5 + rnd() * 1.2) { const r = 0.36 + rnd() * 0.18, col = [0x4f8a3e, 0x5c9644, 0x68a04c, 0x5a8a50][Math.floor(rnd() * 4)], z = -10.7 + rnd() * 0.5; if (x < 9.7 || x > 12.3) ico(r, col, x, 0.16, z, 0.55); }   // (the coffee cart stands in the gap at x 11)
    bb(-1.2, 0, -0.6, 1.2, 0.04, 0.6, 0xc8c4bc);                                              // the pad
    for (const [x, z, r] of [[-12.5, 5.7, 0.5], [-7.2, 5.9, 0.38], [-3.8, 5.6, 0.32], [4.6, 5.8, 0.42], [8.8, 5.6, 0.36], [13.4, 5.8, 0.5]]) { ico(r, 0x5a8a48, x, r * 0.35, z, 0.55); ico(r * 0.7, 0x6c9a50, x + r * 0.7, r * 0.25, z - 0.2, 0.5); }   // pigface by the railing
    // railing: two rails (posts instanced)
    for (const y of [0.55, 1.05]) bb(-22, y - 0.03, 6.47, 22, y + 0.03, 6.53, GALV);
    // picnic shelter (14,-12), pandanus (-18,4) (17,5), road + verge inland
    at(14, -12);
    for (const [x, z] of [[-1.8, -1.8], [1.8, -1.8], [-1.8, 1.8], [1.8, 1.8]]) bb(x - 0.08, 0, z - 0.08, x + 0.08, 2.4, z + 0.08, 0x6a5a48);
    { const g = new THREE.ConeGeometry(3.0, 1.1, 4); g.rotateY(PI / 4); g.translate(0, 2.95, 0); put(g, 0x5a7a8a); }
    bb(-1.0, 0.7, -0.4, 1.0, 0.76, 0.4, 0x8a6a4a); for (const z of [-0.75, 0.75]) bb(-1.0, 0.42, z - 0.15, 1.0, 0.47, z + 0.15, 0x8a6a4a); bb(-0.08, 0, -0.08, 0.08, 0.7, 0.08, 0x6a5a48);
    XF = null;
    for (const [x, z] of [[-18, 4], [17, 5]]) {
      for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; boxR(0.05, 0.9, 0.05, 0x8a7a5a, x + Math.sin(a) * 0.25, 0.4, z + Math.cos(a) * 0.25, Math.cos(a) * 0.3, 0, -Math.sin(a) * 0.3); }
      cyl(0.12, 0.14, 2.0, 6, 0x8a7a5a, x, 1.6, z);
      for (let k = 0; k < 14; k++) { const a = k / 14 * TAU, t = 0.6 + (k % 3) * 0.3; boxR(0.12, 0.03, 1.4, k % 2 ? 0x5a8a4a : 0x6a9a52, x + Math.sin(a) * 0.5, 2.7 + (k % 3) * 0.12, z + Math.cos(a) * 0.5, t, a); }
    }
    gnd(-200, -48, 200, -44, 0.01, M.asph, 6, 0xe0e0e0); gnd(-200, -44, 200, -43.4, 0.015, M.vc, 2, 0xc8c2b4);
    for (const [x, z, h] of [[-14, -16, 20], [12, -22, 24], [-24, -4, 18], [28, -12, 22], [-6, -34, 21]]) pine(x, z, h, 1.5);
    rw.add(b.done());
    // ---- instanced: railing posts, pine tiers, rocks, jetty piles, houses, grass tufts, pelicans
    IM(geoOf(() => bb(-0.04, 0, -0.04, 0.04, 1.1, 0.04, GALV), { floor: true }), M.vc, new Array(23).fill(0).map((_, i) => [-22 + i * 2, 0, 6.5, 0]), 'railing_w', rw);
    const tiers = [];
    for (const [x, z, h] of [[-14, -16, 20], [12, -22, 24], [-24, -4, 18], [28, -12, 22], [-6, -34, 21]]) for (let t = 0; t < 8; t++) { const k = 1 - t / 8; tiers.push([x, h * (0.22 + t * 0.098), z, t * 0.9, [0.6 + h * 0.15 * k, 1.0 + 0.6 * k, 0.6 + h * 0.15 * k]]); }
    IM(R.tierG, M.vc, tiers, 'pine_tiers_w', rw);
    seed = 19; const rocks = [];
    for (let i = 0; i < 40; i++) { const s = 2 + Math.floor(rnd() * 4), [ax, az] = COAST[s], [bx, bz] = COAST[s + 1], u = rnd(); rocks.push([ax + (bx - ax) * u + rnd() * 1.2, -2.4 + rnd() * 0.7, az + (bz - az) * u + 1.2 + rnd() * 2.2, rnd() * 3, [0.8 + rnd() * 0.8, 0.6 + rnd() * 0.5, 0.8 + rnd() * 0.7]]); }
    IM(geoOf(() => ico(0.9, 0x9a8a72, 0, 0, 0, 0.8)), M.vc, rocks, 'rocks_w', rw);
    const houses = []; seed = 23; for (let i = 0; i < 12; i++) houses.push([-80 + i * 14 + rnd() * 4, 0, -57 - rnd() * 8, (rnd() - 0.5) * 0.2, [9 + rnd() * 3, 1, 8 + rnd() * 2]]);
    const hIM = IM(geoOf(() => { bb(-0.5, 0, -0.5, 0.5, 3.0, 0.5, 0xffffff); const g = new THREE.ConeGeometry(0.75, 1.6, 4); g.rotateY(PI / 4); g.scale(1, 1, 1); g.translate(0, 3.8, 0); put(g, 0xa85a3a); }, { floor: true }), M.vc, houses, 'houses_w', rw);
    for (let i = 0; i < 12; i++) hIM.setColorAt(i, tc.set([0xf4f0e8, 0xe8ecf0, 0xf0e4d8, 0xe4ecdc][i % 4]));
    const tufts = []; seed = 29;
    while (tufts.length < 320) { const near = tufts.length < 220, x = near ? -18 + rnd() * 36 : -34 + rnd() * 68, z = near ? -16 + rnd() * 22 : -44 + rnd() * 50; if (z > 5.6 || (z > -11.8 && z < -6.6) || (Math.abs(x) < 1.5 && Math.abs(z) < 0.9) || (Math.abs(x - 14) < 2.3 && Math.abs(z + 12) < 2.3)) continue; tufts.push([x, 0, z, rnd() * 3, 0.8 + rnd() * 0.6]); }
    R.grassW = IM(geoOf(() => { for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; boxR(0.035, 0.24, 0.012, k % 2 ? 0x94c25a : 0x84b44e, Math.sin(a) * 0.04, 0.11, Math.cos(a) * 0.04, Math.cos(a) * 0.35, a, 0); } }), grassMat(), tufts, 'grass_w', rw);
    R.pelW = pelicanIMs(rw, 2, 'w');
    // ---- the memorial bench (own material: varnished slats, the polished top rail), plaque, pad, frangipani
    R.bench = addW(part('bench', () => {
      const IRON = 0x2e3236;
      for (const sx of [-1, 1]) { bb(sx * 0.95 - 0.04, 0, -0.27, sx * 0.95 + 0.04, 0.45, 0.25, IRON); bb(sx * 0.95 - 0.04, 0.45, -0.27, sx * 0.95 + 0.04, 0.82, -0.2, IRON); boxR(0.1, 0.05, 0.5, 0x3a3e44, sx * 0.98, 0.65, 0.02); bb(sx * 0.98 - 0.03, 0.45, 0.2, sx * 0.98 + 0.03, 0.65, 0.25, IRON); }
      for (let k = 0; k < 4; k++) boxT(1.9, 0.045, 0.1, W_SLAT, 0, 0.42, -0.18 + k * 0.12, M.atlasW, 256, 128);
      for (let k = 0; k < 2; k++) boxT(1.9, 0.1, 0.035, W_SLAT, 0, 0.5 + k * 0.14, -0.235, M.atlasW, 256, 128);
    }));
    R.railGloss = part('bench_rail_gloss', () => boxT(1.94, 0.1, 0.06, W_RAIL, 0, 0.8, -0.24, M.atlasW, 256, 128), null, 0, { floor: false });
    R.railDull = part('bench_rail_dull', () => boxT(1.94, 0.1, 0.06, W_SLAT, 0, 0.8, -0.24, M.atlasW, 256, 128), null, 0, { floor: false });
    R.bench.add(R.railGloss, R.railDull); R.railDull.visible = false;
    R.glint = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.16), SKY.glint); R.glint.name = 'bench_glint'; R.glint.rotation.x = -H; R.glint.position.set(0, 0.905, -0.24); R.glint.visible = false; R.bench.add(R.glint);
    R.bench.userData.glint = (u) => { if (u == null || u < 0 || u > 1) { R.glint.visible = false; return; } R.glint.visible = true; R.glint.position.x = -0.92 + 1.84 * u; };
    R.bench.userData.polished = (on) => { R.railGloss.visible = !!on; R.railDull.visible = !on; };
    R.plaqueW = addW(part('memorial_plaque', () => { bb(-0.158, 0.803, -0.278, 0.158, 0.877, -0.27, 0x8a6a28); tq(0.3, 0.07, W_PLQ, 0, 0.84, -0.2795, PI, 0, M.atlasW, 256, 128); }, null, 0, { floor: false }));
    R.pad = addW(part('bench_pad', () => { bb(-1.24, 0, -0.64, 1.24, 0.03, 0.64, 0xb8b4ac); }, null, 0, { floor: false }));
    R.flowers = addW(part('frangipani', () => { tq(0.3, 0.3, [0, 0, 64, 64], -0.25, 0.476, 0.05, 0.4, -H, M.atlasT, 128, 64); }, null, 0, { floor: false }));
    R.puddles = addW(part('puddles', () => { for (const [x, z, w, d] of [[-6, -8.2, 1.4, 0.7], [-2.6, -7.5, 1.0, 0.5], [3.2, -8.4, 1.6, 0.8], [7.6, -7.8, 0.9, 0.5], [0.8, 0.3, 0.9, 0.45], [-0.7, -0.45, 0.7, 0.35]]) tq(w, d, [64, 0, 64, 64], x, z > -1 ? 0.045 : 0.03, z, 0.3, -H, M.atlasT, 128, 64); }, null, 0, { floor: false }));
    // ---- props: council sign, bin, Woody jetty, bell buoy, slate speaker, skateboard
    addW(part('council_sign_w', () => { bb(-0.05, 0, -0.05, 0.05, 1.95, 0.05, 0x6a6e74); bb(-0.52, 1.18, -0.06, 0.52, 1.92, -0.02, 0xd8dce0); tq(1.0, 0.7, W_BLANK, 0, 1.55, -0.015, 0, 0, M.atlasW, 256, 128); }, [-8.5, 0, -9.8]));
    // the coffee cart by the picnic shelter (local (11, -10.6), serving hatch to the path): Region W's kettle is its
    // hot-water urn (prop urn_w, steam()); stacked cups, a blank menu board (no AR here), a striped canopy
    addW(part('coffee_cart_w', () => {
      const BODY = 0x3f6f60, TRIM = 0xe8e2d4, TOP = 0xb8b2a6, CAN = 0xf2eee4, STRIPE = 0x4f8a78;
      bb(-0.8, 0.2, -0.42, 0.8, 1.0, 0.42, BODY); bb(-0.8, 0.2, 0.42, 0.8, 0.26, 0.44, TRIM); bb(-0.8, 0.94, 0.42, 0.8, 1.0, 0.44, TRIM);
      bb(-0.86, 1.0, -0.46, 0.86, 1.05, 0.54, TOP);                                                     // counter (overhangs the hatch)
      for (const sx of [-1, 1]) { cyl(0.2, 0.2, 0.07, 12, 0x1c1c1c, sx * 0.5, 0.2, -0.44, H); cyl(0.07, 0.07, 0.075, 8, 0x8a8e94, sx * 0.5, 0.2, -0.44, H); }
      bb(-0.74, 0, 0.3, -0.68, 0.2, 0.36, 0x2a2c30); bb(0.68, 0, 0.3, 0.74, 0.2, 0.36, 0x2a2c30);       // front legs
      for (const [x, z] of [[-0.8, -0.4], [0.8, -0.4], [-0.8, 0.5], [0.8, 0.5]]) bb(x - 0.025, 1.05, z - 0.025, x + 0.025, 2.1, z + 0.025, 0x8a8e94);
      for (let k = 0; k < 8; k++) boxR(0.24, 0.05, 1.3, k % 2 ? STRIPE : CAN, -0.84 + k * 0.24, 2.14, 0.05, 0.12);   // canopy, tipped to the hatch
      for (let k = 0; k < 8; k++) bb(-0.96 + k * 0.24, 1.98, 0.66, -0.72 + k * 0.24, 2.1, 0.68, k % 2 ? STRIPE : CAN);   // valance
      for (let k = 0; k < 3; k++) cyl(0.04, 0.032, 0.11, 8, 0xf4f2ec, -0.5, 1.105 + k * 0.03, 0.22);    // a stack of takeaway cups
      cyl(0.045, 0.045, 0.012, 8, 0xf8f8f6, -0.28, 1.056, 0.24); bb(-0.15, 1.05, 0.1, 0.05, 1.16, 0.3, 0x5a3a26);   // lids, a tip jar box
      bb(-0.05, 0, 0.62, 0.05, 0.85, 0.66, 0x2a2c30); bb(-0.32, 0.5, 0.63, 0.32, 0.95, 0.65, 0x2a2c30); bb(-0.29, 0.53, 0.652, 0.29, 0.92, 0.66, 0xe4e6e2);   // menu board (blank)
    }, [11.0, 0, -10.6]));
    R.urnW = addW(part('urn_w', () => {
      cyl(0.15, 0.16, 0.04, 12, 0x3a3e44, 0, 0.02, 0); cyl(0.13, 0.13, 0.36, 12, 0xd8dce2, 0, 0.22, 0); cyl(0.135, 0.135, 0.03, 12, 0xb8bec4, 0, 0.39, 0);
      cyl(0.05, 0.07, 0.05, 10, 0x2a2c30, 0, 0.44, 0); boxR(0.04, 0.04, 0.1, 0x2a2c30, 0, 0.11, 0.14); bb(-0.02, 0.05, 0.17, 0.02, 0.1, 0.21, 0x2a2c30);
      boxR(0.045, 0.045, 0.03, 0xe83a3a, 0.07, 0.28, 0.12);
    }, [11.35, 1.05, -10.35], 0, { floor: false }));
    R.urnW.userData.steam = () => { if (typeof world !== 'undefined' && world.puff) world.puff([WX + 11.35, 1.5, -10.35], { n: 16, speed: 0.25, life: 1.8, color: 0xf2f2f2 }); };
    // the two takeaway coffees (B2: Luka (2040)'s on the seat by his hip, Chase (2040)'s on the pad by his foot); hidden
    // until show(): separate meshes so content can put one in a hand (hold), as foreshore26's coffees
    R.coffees = addW(new THREE.Group()); R.coffees.name = 'coffees'; R.cups = {};
    for (const who of ['luka40', 'chase40']) {
      const h = CUP_W[who], g = part('coffee_' + who, () => {
        cyl(0.043, 0.031, 0.12, 10, 0xf4f2ec, 0, 0.064, 0); cyl(0.0425, 0.036, 0.046, 10, 0x9a6a3e, 0, 0.068, 0);
        cyl(0.046, 0.046, 0.012, 10, 0xf8f8f6, 0, 0.13, 0); cyl(0.038, 0.044, 0.01, 10, 0xeeeeea, 0, 0.14, 0); bb(0.012, 0.144, -0.006, 0.028, 0.1465, 0.006, 0x3a2a20);
      }, h, h[3], { floor: false });
      g.visible = false; R.coffees.add(g); R.cups[who] = { mesh: g, held: null };
    }
    R.coffees.userData.show = (who, on = true) => { for (const k in R.cups) if (who === 'both' || who === k || who == null) R.cups[k].mesh.visible = !!on; };
    R.coffees.userData.hold = (who, on = true, hand = 'L') => holdCupW(who, on, hand);
    R.coffees.userData.home = () => { for (const k in R.cups) homeCupW(k); };
    addW(part('bin_w', () => { cyl(0.3, 0.27, 0.95, 10, CREAM, 0, 0.475, 0); cyl(0.31, 0.31, 0.06, 10, SEAM, 0, 0.95, 0); for (const y of [0.3, 0.62]) cyl(0.305, 0.305, 0.03, 10, SEAM, 0, y, 0); }, [4.5, 0, -9.6]));
    R.wjetty = addW(part('woody_jetty', () => {
      bb(24.8, -1.3, 4, 27.2, -1.0, 40, TIMBER); for (let z = 4.5; z < 40; z += 0.9) bb(24.81, -1.005, z, 27.19, -0.996, z + 0.04, 0x847664);
      for (const x of [24.85, 27.15]) for (const y of [-0.45, 0.0]) bb(x - 0.04, y, 4, x + 0.04, y + 0.06, 40, 0xb8aa94);
      for (let k = 0; k < 4; k++) bb(25.2, -1.0 + k * 0.25 - 0.25, 1.2 + k * 0.7, 26.8, -1.0 + k * 0.25, 1.9 + k * 0.7, 0xc8c0b0);
    }));
    IM(geoOf(() => { cyl(0.15, 0.17, 4.6, 7, 0x5a4c3c, 0, 2.3, 0); bb(-0.04, 4.6, -0.04, 0.04, 5.6, 0.04, 0x9a8c76); }), M.vc, new Array(24).fill(0).map((_, i) => [i % 2 ? 27.15 : 24.85, -5.6, 5 + Math.floor(i / 2) * 3.1, 0]), 'woody_jetty_piles', rw);
    R.buoy = addW(part('bell_buoy', () => {
      cyl(0.9, 1.1, 0.7, 10, 0xd8323a, 0, 0.1, 0); for (let k = 0; k < 4; k++) { const a = k / 4 * TAU + 0.4; boxR(0.08, 2.2, 0.08, 0xc82a32, Math.sin(a) * 0.55, 1.4, Math.cos(a) * 0.55, Math.cos(a) * 0.22, 0, -Math.sin(a) * 0.22); }
      bb(-0.5, 2.4, -0.5, 0.5, 2.5, 0.5, 0xc82a32); cyl(0.2, 0.28, 0.4, 8, 0x5a5a5a, 0, 1.8, 0); cyl(0.05, 0.05, 0.6, 6, 0x3a3a3a, 0, 2.8, 0); cyl(0.12, 0.12, 0.1, 8, 0xf2f2ee, 0, 3.1, 0);
    }, [10, -2.6, 70], 0, { floor: false }));
    R.buoyT = 0;
    R.slate = addW(new THREE.Group()); R.slate.name = 'slate_speaker'; R.slate.position.set(-0.98, 0.68, 0.02);
    R.slateP = PROPS.slate({ key: 'parade_slate' }); R.slateP.rotation.set(0.95, 0.3, 0); R.slateP.position.set(0, 0.05, 0.02); R.slate.add(R.slateP);
    R.slate.add(part('slate_spk', () => { bb(-0.05, 0, -0.16, 0.05, 0.1, -0.06, 0x2a2c30); cyl(0.03, 0.03, 0.006, 10, 0x6a6e74, 0, 0.05, -0.105, H); cyl(0.004, 0.004, 0.12, 4, 0x1a1a1a, 0.02, 0.02, -0.02, H); }, null, 0, { floor: false }));
    R.slateMode = 'off'; R.slateSc = R.slateP.userData.screen;
    R.slate.userData.screen = (mode) => { R.slateMode = mode; paintSlate(mode); };
    R.skate = addW(part('skateboard', () => {
      boxR(0.78, 0.025, 0.2, 0x2a2a2e, 0, 0.1, 0); boxR(0.14, 0.025, 0.19, 0x2a2a2e, 0.42, 0.13, 0, 0, 0, 0.4); boxR(0.14, 0.025, 0.19, 0x2a2a2e, -0.42, 0.13, 0, 0, 0, -0.4);
      for (const [x, z] of [[0.26, 0.08], [0.26, -0.08], [-0.26, 0.08], [-0.26, -0.08]]) cyl(0.035, 0.035, 0.035, 8, 0xe8402a, x, 0.04, z, H);
      for (const x of [0.26, -0.26]) bb(x - 0.02, 0.06, -0.08, x + 0.02, 0.09, 0.08, 0xb8bec4);
    }, [-14.5, 0, -8.2], H, { floor: false }));
    R.rider = null; R.skate.userData.ride = (id) => { R.rider = id || null; };
    // ---- water + rock foam
    addW(part('water_w', () => waterPlane(-2.6, -90, 1000), null, 0, { floor: false }));
    addW(part('foam_w', () => { for (let i = 2; i < 7; i++) { const [ax, az] = COAST[i], [bx, bz] = COAST[i + 1], L = Math.hypot(bx - ax, bz - az); const g = new THREE.PlaneGeometry(L, 1.6); g.rotateX(-H); g.rotateY(-Math.atan2(bz - az, bx - ax)); g.translate((ax + bx) / 2 - (bz - az) / L * 2.6, -2.56, (az + bz) / 2 + (bx - ax) / L * 2.6); put(wuv(g, 5), 0xffffff, M.foam); } }, null, 0, { floor: false }));
    // ---- far group (Region W) + the storm building behind the bridge
    buildFar(rw, 'w', [105, -2.6, 365], [-100, -2.6, 372], -2.6);
    R.storm = addW(new THREE.Group()); R.storm.name = 'storm_clouds';
    { const pos = [], uv = []; seed = 3;
      for (let i = 0; i < 5; i++) { const x = -30 + i * 17 + rnd() * 8, w = 70 + rnd() * 45, h = 100 + rnd() * 50, z = 432 + i * 4;
        for (const [px, py, u, v] of [[x - w / 2, 0, 0, 0], [x + w / 2, 0, 1, 0], [x + w / 2, h, 1, 1], [x - w / 2, 0, 0, 0], [x + w / 2, h, 1, 1], [x - w / 2, h, 0, 1]]) { pos.push(px, py, z); uv.push(u, v); } }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.computeVertexNormals();
      const m = new THREE.Mesh(g, SKY.storm); m.renderOrder = -1; R.storm.add(m); R.storm.position.y = -8; }
    R.stormU = 0.2; R.stormTo = 0.2; R.stormFl = false;
    R.storm.userData.build = (u) => { R.stormTo = clamp01(u); if (typeof flow !== 'undefined' && flow.skipping) R.stormU = R.stormTo; };
    R.storm.userData.flicker = (on) => { R.stormFl = !!on; };
  }
  function paintSlate(mode) {
    const sc = R.slateSc; if (!sc) return;
    sc.paint((c, w, h) => {
      c.fillStyle = '#0d1116'; c.fillRect(0, 0, w, h);
      if (mode === 'off') return;
      c.fillStyle = '#1d2a36'; c.fillRect(0, 0, w, 26); c.textBaseline = 'middle'; c.textAlign = 'left';
      c.font = FONT(14); c.fillStyle = '#d8e6f0';
      if (mode === 'drafts' || mode === 'sent') {
        c.fillText(mode === 'drafts' ? 'Drafts' : 'Sent', 10, 13);
        c.font = FONT(11, 'normal'); c.fillStyle = '#9fb6c8';
        c.fillText('To: Moreton Bay Records', 10, 44); c.fillText('Re: what else have you got?', 10, 62);
        c.fillText(mode === 'drafts' ? 'December 2026' : 'two.wav  ·  Sorry for the wait.', 10, 80);
        if (mode === 'sent') { c.fillStyle = '#7ad89a'; c.font = FONT(13); c.fillText('Sent ✓', 10, 112); }
      } else {
        c.fillText('two.wav   ▶', 10, 13); c.fillStyle = '#6fc8ff';
        for (let i = 0; i < 46; i++) { const v = 8 + Math.abs(Math.sin(i * 0.7) * 26 + Math.sin(i * 2.3) * 14); c.fillRect(10 + i * 5.2, 92 - v / 2, 3, v); }
        c.fillStyle = '#9fb6c8'; c.font = FONT(10, 'normal'); c.fillText('Pudding', 10, 140);
      }
    });
  }

  const CUP_W = { luka40: [0.42, 0.465, 0.06, 0.6], chase40: [-0.86, 0.03, 0.42, -0.4] };   // Region W local [x, y, z, ry]
  function holdCupW(who, on, hand) {   // into the actor's grip (as the rigs' mug); on = false puts it back
    const c = R.cups && R.cups[who]; if (!c) return;
    if (!on) { homeCupW(who); return; }
    const a = typeof world !== 'undefined' && world.actors ? world.actors.get(who) : null;
    const g = a && a.rig && a.rig.attach ? a.rig.attach[hand === 'R' ? 'gripR' : 'gripL'] : null;
    if (!g) return;
    g.add(c.mesh); c.held = g;
    c.mesh.position.set(0, -0.02, -0.04); c.mesh.rotation.set(H, 0, 0); c.mesh.scale.setScalar(1 / ((a.rig.d && a.rig.d.s) || 1));
    c.mesh.visible = true;
  }
  function homeCupW(who) {
    const c = R.cups && R.cups[who]; if (!c) return;
    if (c.held) { R.coffees.add(c.mesh); c.held = null; }
    const h = CUP_W[who]; c.mesh.position.set(h[0], h[1], h[2]); c.mesh.rotation.set(0, h[3], 0); c.mesh.scale.setScalar(1);
  }

  // ---------------------------------------------------------- build
  function build() {
    COL.length = 0; T = textures(); initMats();
    const root = new THREE.Group(); root.name = 'parade_root'; R.root = root;
    R.rp = new THREE.Group(); R.rp.name = 'region_p'; root.add(R.rp);
    R.rw = new THREE.Group(); R.rw.name = 'region_w'; R.rw.position.set(WX, 0, 0); root.add(R.rw);
    buildP(R.rp);
    buildW(R.rw);
    COL.push([-322, 6.3, -278, 6.7], [-317, -10.4, -316, 6.7], [-284, -10.4, -283, 6.7], [-317, -10.4, -283, -10],
      [-301.0, -0.3, -299.0, 0.3], [-308.7, -9.95, -308.3, -9.65], [-295.8, -9.9, -295.2, -9.3], [-318.6, 3.4, -317.4, 4.6],
      [-289.86, -11.05, -288.14, -9.98]);   // the coffee cart (its counter overhang)
    R.fars = [R.far_p, R.far_w];
    R.scene = typeof state !== 'undefined' && state ? state.scene : null; R.env = null;   // dressed below for this scene: update re-dresses on the next change R.dressed = null; R.region = null; R.level = 0; R.levelTo = 0; R.levelDrawn = -1;
    R.torchOwned = false; R.ambKey = null; R.chirpT = 0; R.bellT = 0; R.bellUp = false; R.lifeLit = '';
    dress(AUTO[typeof state !== 'undefined' && state ? state.scene : ''] || 'day17');
    return root;
  }

  // ---------------------------------------------------------- dressing (regions, people, traffic, props, ambience)
  const AUTO = { '1.7': 'day17', '1.8': 'evening18', '2.2': 'lane22', '2.3': 'bench23', B2: 'xmas40', C: 'credits' };
  const REGION_OF = { day17: 'P', evening18: 'P', lane22: 'P', festival31: 'P', bench23: 'W', xmas40: 'W', sunset33: 'W', credits: 'W' };
  const AMB = {   // spec §10 (every name is a bed in 03-audio: AUDIO.loopNames())
    day17: { loops: ['surf', 'hover_far'], room: 'none' },   // (no cicadas on the beachfront: they hissed over the surf)
    dusk17: { loops: ['surf', 'hover_far', 'crickets'], room: 'none' },
    evening18: { loops: ['surf', 'hover_far', 'crickets'], room: 'none' },
    lane22: { loops: ['cicadas', 'hover_far'], room: 'lane' },
    festival31: { loops: ['surf', 'hover_far'], room: 'none' },
    bench23: { loops: ['wind', 'water_lap', 'bell_buoy'], room: 'none' },
    xmas40: { loops: ['birds', 'water_lap', 'wind_soft'], room: 'none' },
    sunset33: { loops: ['water_lap', 'wind_soft'], room: 'none' },
    credits: { loops: ['birds', 'water_lap', 'wind_soft'], room: 'none' },
  };
  const ambKey = () => (R.dressed === 'day17' && (R.env === 'dusk' || R.env === 'evening') ? 'dusk17' : R.dressed || 'day17');
  function sendAmbience() {
    const k = ambKey(); if (k === R.ambKey) return;
    if (typeof AUDIO === 'undefined' || typeof world === 'undefined' || world.setId !== 'parade') return;
    R.ambKey = k;
    try { AUDIO.ambience(AMB[k]); AUDIO.setRoom(AMB[k].room || 'none'); } catch (e) { /* audio not up yet */ }
  }
  function setRegion(reg) {
    R.region = reg; R.rp.visible = reg === 'P'; R.rw.visible = reg === 'W';
    R.pelHero.visible = R.pelH.on && (R.pelH.region === reg);
  }
  function applyFlatLit() {
    const on = R.flatLit;
    R.winDark.visible = !on; R.winClear.visible = on;
    M.room.emissiveIntensity = on ? 0.42 : 0; M.pend.emissiveIntensity = on ? 1.2 : 0;
  }
  function dress(st) {
    if (!REGION_OF[st]) st = 'day17';
    if (!R.root) return;
    R.dressed = st;
    const reg = REGION_OF[st], P17 = st === 'day17', E18 = st === 'evening18', L22 = st === 'lane22', F31 = st === 'festival31';
    // Region P
    R.tCount = P17 ? 6 : E18 ? 2 : L22 ? 3 : F31 ? 4 : 0;
    for (let i = 0; i < 6; i++) { const c = R.cars[i]; c.x = -90 + i * 31 + (L22 ? 7 : 0); c.v = c.vMax; }
    R.hero.userData.stop();
    R.strollers.userData.on(P17);
    R.life.visible = P17; R.lifeTalk = false;
    R.family.visible = P17; R.famT = -1;
    R.poster.visible = F31;
    R.figs.visible = E18;
    R.flatLit = E18; applyFlatLit();
    R.chipOpen = true;
    R.bolUp = !L22; R.bolU = R.bolUp ? 1 : 0;
    R.led.userData.set('red'); R.plateU = R.plateTo = 0; R.plateHeld = false; R.keyFlash.children[0].visible = false;
    R.doorOpen = false; R.doorT = 0;
    R.kioskT = 0; R.kiosk.userData.show('Here for|you.'); if (R.kiosk.userData.setLight) R.kiosk.userData.setLight('patrol');
    const cf = L22 ? [[1.3, -7, 1.5, -3], [13.5, -7, 13.7, -3]] : null;
    for (let i = 0; i < 2; i++) { const a = R.conf[i]; if (cf) { a[0] = cf[i][0]; a[1] = cf[i][1]; a[2] = cf[i][2]; a[3] = cf[i][3]; } else a[0] = a[1] = a[2] = a[3] = 1e4; }
    R.pelMode = P17 || F31 ? 'all' : E18 ? 'perched' : L22 ? 'beach' : 'none';
    // the hero pelican: on the mooring pole (1.7), waiting off-frame for B2's landing, otherwise away
    const PH = R.pelH; if (PH.res) { const r = PH.res; PH.res = null; r(); }
    PH.mode = 'perch'; PH.on = P17 || st === 'xmas40'; PH.region = P17 ? 'P' : 'W';
    if (P17) { R.pelHero.position.set(PH.home[0], PH.home[1], PH.home[2]); R.pelHero.rotation.set(0, PH.home[3], 0); }
    if (st === 'xmas40') { PH.on = false; PH.region = 'W'; }
    // Region W
    const benchOn = st !== 'sunset33';
    R.bench.visible = R.plaqueW.visible = R.pad.visible = benchOn; R.bench.userData.polished(true); R.glint.visible = false;
    R.flowers.visible = st === 'bench23';
    R.storm.visible = st === 'bench23'; R.stormU = R.stormTo = 0.2; R.stormFl = false;
    R.puddles.visible = st === 'xmas40';
    R.slate.visible = false; R.slate.userData.screen('off');
    R.skate.visible = st === 'xmas40'; R.rider = null; R.skate.position.set(-14.5, 0, -8.2); R.skate.rotation.y = H;
    R.pelWOn = st === 'xmas40';
    R.coffees.userData.home(); R.coffees.userData.show('both', false);
    setRegion(reg);
    sendAmbience();
  }

  // ---------------------------------------------------------- ambient life (no allocation)
  const SUN = { day: [0.19, 0.80, 0.55], golden: [-0.14, 0.21, -0.97], morning: [0.35, 0.28, 0.89], wp_morning: [0.52, 0.62, 0.59], wp_washed: [0.80, 0.30, 0.52], wp_sunset: [-0.60, 0.06, 0.80] };
  const LEVEL = { day: 0, morning: 0, golden: 0.4, dusk: 1, evening: 1, wp_morning: 0, wp_washed: 0, wp_sunset: 0.6 };
  const FAR_TINT = { day: 0xffffff, golden: 0xffe4c8, dusk: 0xa898b8, evening: 0x5a6488, morning: 0xfff2e4, wp_morning: 0xeef2f6, wp_washed: 0xffffff, wp_sunset: 0xffc0a0 };
  const CLOUD_TINT = { day: 0xffffff, golden: 0xffdcb8, dusk: 0xd0a0b8, evening: 0x50587a, morning: 0xfff0e0, wp_morning: 0xe4eaf0, wp_washed: 0xffffff, wp_sunset: 0xffb088 };
  const GRASS_W_TINT = { wp_washed: 0xd8ffd0, wp_sunset: 0xffe0c0 };
  const ZEB = [[-16, -12], [22, 26]], zebOcc = [0, 0], zebClear = [9, 9];
  const LAMP = {   // the set's spot as a fixed lamp: [pos, target, angle, penumbra, distance]
    chips: [[32.0, 2.9, -5.4], [32.0, 0, -3.6], 0.9, 0.6, 9],
    pendant: [[34.3, 6.0, -7.95], [34.3, 3.6, -7.95], 1.0, 0.5, 4],
    lane: [[8.6, 8.0, -11.0], [8.4, 0, -20.0], 0.45, 0.7, 16],
  };
  const WALKP = { speed: 0.6 }, SITP = { h: 0.45 }, NOP = {};
  function applyEnv(name) {
    R.levelTo = LEVEL[name] ?? 0;
    const d = SUN[name];
    for (let i = 0; i < 2; i++) {
      const F = R.fars[i]; if (!F) continue;
      F.sun.visible = !!d;
      if (d) { const L = Math.hypot(d[0], d[1], d[2]); F.sun.position.set(d[0] / L * 420, d[1] / L * 420 + (i ? -2.6 : -1.5), d[2] / L * 420); F.sun.lookAt(i ? WX : 0, 0, 0); }
    }
    R.glitterP.visible = !!d && d[1] < 0.9 && d[2] > 0;
    if (d) R.glitterP.rotation.y = Math.atan2(d[0], d[2]);
    SKY.land.color.set(FAR_TINT[name] ?? 0xffffff); SKY.bridge.color.set(FAR_TINT[name] ?? 0xffffff); SKY.cloud.color.set(CLOUD_TINT[name] ?? 0xffffff);
    M.grassW.color.set(GRASS_W_TINT[name] ?? 0xffffff);
    sendAmbience();
  }
  function lampFor() {   // by env (Region P presets only; W presets keep the spot at 0)
    const e = R.env;
    return e === 'golden' || e === 'dusk' ? LAMP.chips : e === 'evening' ? LAMP.pendant : e === 'morning' ? LAMP.lane : null;
  }
  function heroPlace(d, dt) {
    const D = R.drive, p = D.path; let i = 0, acc = 0;
    while (i < D.segs.length - 1 && acc + D.segs[i] < d) { acc += D.segs[i]; i++; }
    const u = D.segs[i] > 0 ? Math.min(1, (d - acc) / D.segs[i]) : 1, ax = p[i][0], az = p[i][1], bx = p[i + 1][0], bz = p[i + 1][1];
    D.x = ax + (bx - ax) * u; D.z = az + (bz - az) * u;
    const want = Math.atan2(bx - ax, bz - az);
    if (!dt) D.yaw = want; else { let da = want - D.yaw; da = ((da + PI) % TAU + TAU) % TAU - PI; D.yaw += da * Math.min(1, dt * 2.5); }
    R.hero.position.set(D.x, 0, D.z); R.hero.rotation.y = D.yaw;
  }
  let zebNow = 0;
  function zebraCheck(a) {
    if (!a.root.visible) return;
    const x = a.pos.x, z = a.pos.z;
    if (z < -3.2 || z > 5.2) return;
    if (x > ZEB[0][0] - 0.3 && x < ZEB[0][1] + 0.3) zebOcc[0] = 1; else if (x > ZEB[1][0] - 0.3 && x < ZEB[1][1] + 0.3) zebOcc[1] = 1;
  }
  function chirpAt(x, z) {
    if (R.chirpT > 0 || typeof sfx !== 'function' || (typeof flow !== 'undefined' && flow.skipping)) return;
    R.chirpT = 0.5; AT3[0] = x; AT3[1] = 1.0; AT3[2] = z; sfx('ss_chirp', SFX_CHIRP);
  }
  function setIM(im, i, x, y, z, ry, s, roll) {
    e1.set(0, ry, roll || 0); q1.setFromEuler(e1); sv.set(s, s, s); v1.set(x, y, z);
    im.setMatrixAt(i, m4.compose(v1, q1, sv));
  }
  function trafficTick(dt, t) {
    const on = R.rp.visible;
    zebOcc[0] = zebOcc[1] = 0;
    if (on && typeof world !== 'undefined' && world.actors) world.actors.forEach(zebraCheck);
    for (let k = 0; k < 2; k++) zebClear[k] = zebOcc[k] ? 0 : zebClear[k] + dt;
    const D = R.drive, hLane = D.on ? (Math.abs(D.z - 3) < 1.2 ? -1 : Math.abs(D.z + 1) < 1.2 ? 1 : 0) : 0;
    for (let i = 0; i < 6; i++) {
      const c = R.cars[i];
      if (!on || i >= R.tCount) { setIM(R.tBody, i, 0, -50, 0, 0, 0.001); setIM(R.tGlow, i, 0, -50, 0, 0, 0.001); setIM(R.tShadow, i, 0, -50, 0, 0, 0.001); continue; }
      const dir = c.lane; let vT = c.vMax, gap = 1e9;
      for (let j = 0; j < R.tCount; j++) { if (j === i || R.cars[j].lane !== dir) continue; const g = (R.cars[j].x - c.x) * dir; if (g > 0 && g < gap) gap = g; }
      if (hLane === dir) { const g = (D.x - c.x) * dir; if (g > 0 && g < gap) gap = g; }
      if (gap < 16) vT = Math.min(vT, Math.max(0, (gap - 6.5) * 0.9));
      for (let k = 0; k < 2; k++) {
        if (zebClear[k] > 0.8) continue;
        const stopX = dir > 0 ? ZEB[k][0] - 1.5 - 2.0 : ZEB[k][1] + 1.5 + 2.0, d = (stopX - c.x) * dir;
        if (d > -0.4 && d < 12) { vT = Math.min(vT, Math.max(0, d * 0.9)); if (d < 1.2 && c.v < 1.0 && !c.chirp) { c.chirp = true; chirpAt(c.x, dir > 0 ? -1 : 3); } }
      }
      if (vT > 1) c.chirp = false;
      c.v += (vT - c.v) * Math.min(1, dt * 2.4);
      c.x += c.v * dir * dt;
      if (dir > 0 && c.x > 100) c.x -= 200; else if (dir < 0 && c.x < -100) c.x += 200;
      const z = dir > 0 ? -1.0 : 3.0, bob = 0.02 * Math.sin(t * 2 + i), ry = dir > 0 ? H : -H;
      setIM(R.tBody, i, c.x, bob, z, ry, 1); setIM(R.tGlow, i, c.x, bob, z, ry, 1);
      e1.set(0, ry, 0); q1.setFromEuler(e1); sv.set(2.6, 1, 5.2); v1.set(c.x, 0, z); R.tShadow.setMatrixAt(i, m4.compose(v1, q1, sv));
    }
    R.tBody.instanceMatrix.needsUpdate = true; R.tGlow.instanceMatrix.needsUpdate = true; R.tShadow.instanceMatrix.needsUpdate = true;
  }
  // pelicans: P (4 perched + 2 gliders), W (2 perched); each body gets two wings
  const PERCH_P = [[-13.75, 1.15, 31.0, 0.4], [-10.25, 1.15, 45.0, -2.6], [19.5, 0, 22.6, 2.2], [22.8, 0, 23.1, -0.4]];
  const PERCH_W = [[-17.5, -1.5, 9.4, 0.6], [18.6, -1.6, 8.8, -0.5]];
  function pelSet(P, i, x, y, z, yaw, roll, pitch, flap, spread) {
    e1.set(pitch, yaw, roll); q1.setFromEuler(e1); sv.set(1, 1, 1); v1.set(x, y, z); mA.compose(v1, q1, sv);
    P.body.setMatrixAt(i, mA);
    for (let s = 0; s < 2; s++) {
      if (spread) e2.set(0, 0, s ? PI - flap : flap, 'XYZ'); else e2.set(0.4, s ? -H : H, s ? PI + 0.06 : -0.06, 'YXZ');
      mB.makeRotationFromEuler(e2); if (!spread) { mA2.makeScale(0.72, 1, 0.62); mB.multiply(mA2); }
      mB.setPosition(s ? (spread ? -0.16 : -0.06) : (spread ? 0.16 : 0.06), spread ? 0.5 : 0.6, spread ? -0.05 : 0.14);
      m4.multiplyMatrices(mA, mB); P.wings.setMatrixAt(i * 2 + s, m4);
    }
  }
  function pelHide(P, i) { m4.makeScale(0.001, 0.001, 0.001).setPosition(0, -50, 0); P.body.setMatrixAt(i, m4); P.wings.setMatrixAt(i * 2, m4); P.wings.setMatrixAt(i * 2 + 1, m4); }
  function pelTick(t) {
    const P = R.pelP;
    if (R.rp.visible) {
      for (let i = 0; i < 4; i++) {
        const show = R.pelMode === 'all' || R.pelMode === 'perched' || (R.pelMode === 'beach' && i >= 2);
        if (!show) { pelHide(P, i); continue; }
        const p = PERCH_P[i], bobT = (t + i * 2.7) % 6.5, nod = bobT < 0.6 ? Math.sin(bobT / 0.6 * PI) * 0.18 : 0;
        pelSet(P, i, p[0], p[1], p[2], p[3] + 0.08 * Math.sin(t * 0.3 + i), 0, nod, 0, false);
      }
      for (let i = 4; i < 6; i++) {
        if (R.pelMode !== 'all') { pelHide(P, i); continue; }
        const th = t * TAU / 30 + (i - 4) * PI, x = 20 + Math.cos(th) * 14, z = 27 + Math.sin(th) * 14, y = 7.5 + Math.sin(th * 2 + i) * 0.7;
        const cyc = (t + i * 4.3) % 9, flap = cyc < 1.2 ? 0.08 + 0.32 * Math.sin(cyc / 1.2 * PI * 3) : 0.06;
        pelSet(P, i, x, y, z, Math.atan2(-Math.sin(th), Math.cos(th)), 0.28, 0, flap, true);
      }
      P.body.instanceMatrix.needsUpdate = true; P.wings.instanceMatrix.needsUpdate = true;
    }
    const W = R.pelW;
    if (R.rw.visible) {
      for (let i = 0; i < 2; i++) { if (!R.pelWOn) { pelHide(W, i); continue; } const p = PERCH_W[i], bobT = (t + i * 3.1) % 7, nod = bobT < 0.6 ? Math.sin(bobT / 0.6 * PI) * 0.18 : 0; pelSet(W, i, p[0], p[1], p[2], p[3], 0, nod, 0, false); }
      W.body.instanceMatrix.needsUpdate = true; W.wings.instanceMatrix.needsUpdate = true;
    }
  }
  function pelHeroTick(dt, t) {
    const P = R.pelH, h = R.pelHero;
    if (!P.on && P.mode !== 'land') return;
    let flap = 0, spread = false;
    if (P.mode === 'land') {
      P.t += dt; const u = Math.min(1, P.t / P.dur), k = 1 - (1 - u) * (1 - u);
      h.position.set(P.from.x + (P.to.x - P.from.x) * k, P.from.y + (P.to.y - P.from.y) * (u * u * (3 - 2 * u)), P.from.z + (P.to.z - P.from.z) * k);
      const yaw = Math.atan2(P.to.x - P.from.x, P.to.z - P.from.z);
      h.rotation.set(u > 0.82 ? -0.5 * Math.sin((u - 0.82) / 0.18 * PI) : 0.05, u > 0.9 ? yaw + (P.ry - yaw) * (u - 0.9) / 0.1 : yaw, 0);
      spread = u < 0.97; flap = u > 0.8 ? 0.3 + 0.4 * Math.sin(t * 14) : 0.06 + 0.04 * Math.sin(t * 2);
      if (u >= 1) { P.mode = 'perch'; P.on = true; h.rotation.set(0, P.ry, 0); if (P.res) { const r = P.res; P.res = null; r(); } }
      h.visible = R.region === P.region || P.region === undefined;
    } else {
      const bobT = (t * 1.0) % 6.2; R.pelHeroBody.rotation.x = bobT < 0.6 ? Math.sin(bobT / 0.6 * PI) * 0.15 : 0;
    }
    if (spread) { R.pelWingL.rotation.set(0, 0, flap, 'XYZ'); R.pelWingR.rotation.set(0, 0, PI - flap, 'XYZ'); R.pelWingL.scale.set(1, 1, 1); R.pelWingR.scale.set(1, 1, 1); R.pelWingL.position.set(0.16, 0.5, -0.05); R.pelWingR.position.set(-0.16, 0.5, -0.05); }
    else { R.pelWingL.rotation.set(0.4, H, -0.06, 'YXZ'); R.pelWingR.rotation.set(0.4, -H, PI + 0.06, 'YXZ'); R.pelWingL.scale.set(0.72, 1, 0.62); R.pelWingR.scale.set(0.72, 1, 0.62); R.pelWingL.position.set(0.06, 0.6, 0.14); R.pelWingR.position.set(-0.06, 0.6, 0.14); }
    if (P.clackT >= 0) { P.clackT += dt; R.pelHeroJaw.rotation.x = 0.42 + (P.clackT < 0.5 ? Math.abs(Math.sin(P.clackT * 22)) * 0.35 : 0); if (P.clackT > 0.5) P.clackT = -1; }
  }
  function strollTick(c, dt) {
    const r = c.rig.root;
    if (c.s.sit) {
      r.position.set(c.x, 0, c.z); r.rotation.y = 0;
      c.at += dt; c.t -= dt;
      if (c.t <= 0) { c.t = 5 + Math.random() * 6; c.pick = c.pick === 'chip_ping' ? 'sit_bench' : Math.random() < 0.4 ? 'chip_ping' : 'sit_bench'; c.at = 0; }
      c.rig.seated = true; c.rig.pose(c.pick === 'chip_ping' ? 'chip_ping' : 'sit_bench', c.at, SITP); c.rig.update(dt);
      c.col[0] = c.x - 0.3; c.col[1] = c.z - 0.2; c.col[2] = c.x + 0.3; c.col[3] = c.z + 0.45;
      return;
    }
    let want = c.pick, face = c.face;
    if (Math.abs(c.to - c.x) > 0.05) { const sg = c.to > c.x ? 1 : -1; c.x += sg * Math.min(Math.abs(c.to - c.x), 1.0 * dt); want = 'walk'; face = sg > 0 ? H : -H; }
    else if ((c.t -= dt) <= 0) {
      const k = Math.random(); c.t = 2.5 + Math.random() * 3.5;
      if (k < 0.45) { c.to = c.s.x0 + Math.random() * (c.s.x1 - c.s.x0); c.pick = 'idle'; }
      else if (k < 0.65) { c.pick = 'chip_ping'; c.t = 1.4; }
      else if (k < 0.85) { c.pick = 'look_down'; c.face = c.z < 0 ? PI : 0; }
      else { c.pick = 'idle'; c.face = c.z < 0 ? PI : 0; }
    }
    if (want !== c.a) { c.a = want; c.at = 0; }
    c.at += dt;
    c.yaw += ((((face - c.yaw + PI) % TAU) + TAU) % TAU - PI) * Math.min(1, dt * 6);
    r.position.set(c.x, 0, c.z); r.rotation.y = c.yaw;
    c.rig.pose(c.a, c.at, c.a === 'walk' ? WALKP : NOP); c.rig.update(dt);
    c.col[0] = c.x - 0.28; c.col[1] = c.z - 0.28; c.col[2] = c.x + 0.28; c.col[3] = c.z + 0.28;
  }
  const FAM_IN = [[13.6, -2.35, 30.4], [15.0, -2.35, 30.9], [16.2, -2.1, 30.3]], FAM_OUT = [[13.4, 0, 23.0], [14.6, 0, 23.4], [15.8, 0, 22.9]];
  const sandY = (z) => (z <= 24 ? 0 : z <= 29 ? -1.5 * (z - 24) / 5 : z <= 31 ? -1.5 - 0.95 * (z - 29) / 2 : -2.45);
  function familyTick(dt, t) {
    const F = RIGS.family;
    if (R.famT >= 0 && R.famT < 6) R.famT = Math.min(6, R.famT + dt);
    const u = R.famT < 0 ? 0 : smooth(R.famT / 6), walking = R.famT >= 0 && R.famT < 6;
    for (let i = 0; i < 3; i++) {
      const f = F[i], a = FAM_IN[i], b2 = FAM_OUT[i], r = f.rig.root;
      const z = a[2] + (b2[2] - a[2]) * u, x = a[0] + (b2[0] - a[0]) * u;
      const y = u <= 0 ? a[1] + 0.03 * Math.sin(t * 1.6 + i) : u >= 1 ? 0 : Math.max(a[1] + (0 - a[1]) * u, Math.min(0, sandY(z)) - 0.6 * (1 - u));
      r.position.set(x, y, z); r.rotation.y = PI;
      const an = walking ? 'walk' : (i === 2 && u <= 0 ? 'wave' : 'idle');
      if (an !== f.a) { f.a = an; f.at = 0; }
      f.at += dt; f.rig.pose(f.a, f.at, walking ? WALKP : NOP); f.rig.update(dt);
    }
  }
  function lightsTick(dt, t) {
    R.level += (R.levelTo - R.level) * Math.min(1, dt * 0.9);
    const L = R.level;
    if (Math.abs(L - R.levelDrawn) > 0.004) {
      R.levelDrawn = L;
      tc.set(0xd8d6d0); tc2.set(0xfff0c8); tc.lerp(tc2, Math.min(1, L * 1.4));
      for (let i = 0; i < R.lampHeads.count; i++) R.lampHeads.setColorAt(i, tc);
      R.lampHeads.instanceColor.needsUpdate = true;
      M.shop.emissiveIntensity = 0.26 + 0.55 * L;
      SKY.bLamp.opacity = 0.12 + 0.88 * L;
      if (R.dressed === 'day17') { const lit = L >= 0.4; if (lit !== R.flatLit) { R.flatLit = lit; applyFlatLit(); } }
    }
    const blinkA = (t * 0.8) % 1 < 0.5, base = 0.18 + 0.95 * L;
    M.palmA.emissiveIntensity = base * (blinkA ? 1 : 0.3); M.palmB.emissiveIntensity = base * (blinkA ? 0.3 : 1);
    if (R.rp.visible) {
      const fb = 0.55 + 0.45 * L;
      for (let i = 0; i < R.festoon.count; i++) { const k = fb * (0.8 + 0.2 * Math.sin(t * 1.3 + i * 1.7)); tc.set(R.festCol[i % 5]).multiplyScalar(k); R.festoon.setColorAt(i, tc); }
      R.festoon.instanceColor.needsUpdate = true;
      const ph = Math.floor(t * 1.2) % 3, bb2 = 0.45 + 0.55 * L;
      for (let i = 0; i < R.balLights.count; i++) { const k = (i % 3 === ph ? 1 : 0.35) * bb2; tc.set(i % 3 === 0 ? 0xff5050 : i % 3 === 1 ? 0x5ad070 : 0xfff1d0).multiplyScalar(k); R.balLights.setColorAt(i, tc); }
      R.balLights.instanceColor.needsUpdate = true;
    }
    for (let i = 0; i < 2; i++) { const F = R.fars[i]; if (F) F.dIM.visible = L > 0.5 && (t * 1.4 + i * 0.3) % 1 < 0.55; }
  }
  function update(dt, ctx) {
    if (!R.root) return;
    const t = ctx.t;
    const sid = typeof state !== 'undefined' && state ? state.scene : null;
    if (sid !== R.scene) { R.scene = sid; dress(AUTO[sid] || 'day17'); }
    if (ctx.env !== R.env) { R.env = ctx.env; applyEnv(R.env); }
    const W_ = typeof world !== 'undefined' ? world : null;
    if (R.ambKey !== ambKey()) sendAmbience();
    if (W_ && W_.camera) { const want = W_.camera.position.x < -150 ? 'W' : 'P'; if (want !== R.region) setRegion(want); }
    if (W_ && W_.scene && W_.scene.fog && W_.setId === 'parade') { SKY.skirt.color.copy(W_.scene.fog.color); SKY.haze.color.copy(W_.scene.fog.color); }
    // the spot as a fixed lamp (chip shop pool at dusk, the flat's pendant, the lane sunbeam)
    const lp = lampFor(), sp = W_ && W_.setId === 'parade' ? W_.torch : null;
    if (sp && lp) {
      W_.torchAuto = false; R.torchOwned = true;
      sp.position.set(lp[0][0], lp[0][1], lp[0][2]); sp.target.position.set(lp[1][0], lp[1][1], lp[1][2]); sp.target.updateMatrixWorld();
      sp.angle = lp[2]; sp.penumbra = lp[3]; sp.distance = lp[4]; sp.decay = 0;
    } else if (R.torchOwned && W_) { W_.torchAuto = true; R.torchOwned = false; if (sp) sp.decay = 1.5; }
    if (R.chirpT > 0) R.chirpT -= dt;
    lightsTick(dt, t);
    // water, foam, glitter, clouds
    T.ripple.offset.set(t * 0.012, t * 0.02); T.foam.offset.x = t * 0.04; T.glitter.offset.set(Math.sin(t * 0.7) * 0.02, -t * 0.03);
    const fz = 0.6 * Math.sin(t * 0.9); R.foamP.position.set(0, fz < 0 ? -fz * 0.3 : 0, fz);
    for (let i = 0; i < 2; i++) { const F = R.fars[i]; if (F) F.clouds.position.x = Math.sin(t * 0.0021 + i) * 30; }
    if (R.rp.visible) {
      trafficTick(dt, t);
      // the hero car
      const D = R.drive;
      if (D.on) { D.d += D.v * dt; if (D.d >= D.len) { heroPlace(D.len, dt); D.on = false; R.hero.visible = false; D.blink = false; M.blink.emissiveIntensity = 0; if (D.res) { const r = D.res; D.res = null; r(); } } else heroPlace(D.d, dt); R.hero.position.y = 0.02 * Math.sin(t * 2); }
      if (D.blink) M.blink.emissiveIntensity = (t * 1.6) % 1 < 0.5 ? 1.8 : 0;
      M.carGlow.emissiveIntensity = 0.9 + 0.2 * Math.sin(t * 3);
      M.parkGlow.emissiveIntensity = R.parked.userData.hi ? 1.6 + 0.3 * Math.sin(t * 8) : 0.6 + 0.4 * Math.sin(t * PI);
      R.parked.position.y = 0.015 * Math.sin(t * 1.7);
      // lifeguard drone, family, strollers
      if (R.life.visible) {
        R.life.position.y = 3.2 + 0.08 * Math.sin(t * TAU * 1.3 / 2); R.life.rotation.y = PI + 0.18 * Math.sin(t * 0.4); R.life.rotation.z = 0.04 * Math.sin(t * 0.9);
        const st = R.lifeTalk ? ((t * 4) % 1 < 0.5 ? 'escort' : 'white') : ((t * 0.7) % 1 < 0.15 ? 'escort' : 'patrol');
        if (st !== R.lifeLit) { R.lifeLit = st; R.lifeD.userData.setLight(st); }
        familyTick(dt, t);
      }
      if (R.strollers.visible) for (let i = 0; i < RIGS.strollers.length; i++) strollTick(RIGS.strollers[i], dt);
      // chip shop tube flicker, kiosk chime, LED, plate, keypad, lane bollards, door, tinsel, figures, palm
      const burst = Math.sin(t * 1.1) + Math.sin(t * 2.9 + 1) > 1.65;
      M.chipLit.emissiveIntensity = R.chipOpen ? (burst && (t * 15) % 1 < 0.4 && !(typeof options !== 'undefined' && options.reduceFlashing) ? 0.35 : 0.85) : 0.05;   // (Reduce Flashing: a steady tube)
      if (R.kioskT > 0) { R.kioskT -= dt; if (R.kioskT <= 0) { if (R.kiosk.userData.setLight) R.kiosk.userData.setLight('patrol'); R.kiosk.userData.show('Here for|you.'); } }
      R.led.visible = R.ledState === 'green' || (t * 0.5) % 1 < 0.6;
      const pt = R.plateHeld ? 1 : R.plateTo; R.plateU += (pt - R.plateU) * Math.min(1, dt * 10); R.plate.rotation.x = -1.9 * R.plateU;
      if (R.keyT > 0) { R.keyT -= dt; if (R.keyT <= 0) R.keyFlash.children[0].visible = false; }
      const bt = R.bolUp ? 1 : 0; if (R.bolU !== bt) R.bolU = R.bolU < bt ? Math.min(bt, R.bolU + dt / 0.6) : Math.max(bt, R.bolU - dt / 0.6);
      R.bollards.position.y = -0.9 * (1 - smooth(R.bolU));
      if (R.bolU > 0.5) { R.bolCol[0] = 11.2; R.bolCol[1] = -35; R.bolCol[2] = 11.6; R.bolCol[3] = -31; } else R.bolCol[0] = R.bolCol[1] = R.bolCol[2] = R.bolCol[3] = 1e4;
      const dtgt = R.doorOpen ? 1 : 0; if (R.doorT !== dtgt) R.doorT = R.doorT < dtgt ? Math.min(1, R.doorT + dt / 0.5) : Math.max(0, R.doorT - dt / 0.5);
      R.door.rotation.y = 1.4 * smooth(R.doorT);
      R.tinsel.rotation.x = 0.05 * Math.sin(t * TAU * 0.6); R.tinsel.rotation.z = 0.01 * Math.sin(t * TAU * 0.6 + 1);
      if (R.figs.visible) { const fB = Math.floor(t / 2.6) % 2 === 1; R.figsA.visible = !fB; R.figsB.visible = fB; }
      R.lanePalmCrown.rotation.z = 0.03 * Math.sin(t * 0.9); R.lanePalmCrown.rotation.x = 0.02 * Math.sin(t * 0.7 + 1);
    }
    pelTick(t);
    pelHeroTick(dt, t);
    if (R.rw.visible) {
      GRASSM.userData.uTime.value = t;
      const ph = t * TAU / 4.2, s = Math.sin(ph);
      R.buoy.position.y = -2.6 + 0.15 * s; R.buoy.rotation.z = 0.12 * Math.sin(ph + 1.1); R.buoy.rotation.x = 0.06 * Math.sin(ph * 0.7);
      const tilt = Math.sin(ph + 1.1);
      if (tilt > 0.97 && !R.bellUp) { R.bellUp = true; const loop = AMB[ambKey()].loops.indexOf('bell_buoy') >= 0; if (!loop && typeof sfx === 'function' && !(typeof flow !== 'undefined' && flow.skipping)) { AT3[0] = WX + 10; AT3[1] = 0; AT3[2] = 70; sfx('bell', SFX_BELL); } } else if (tilt < 0.5) R.bellUp = false;
      if (R.storm.visible) {
        const d = R.stormTo - R.stormU, mx = 0.02 * dt; R.stormU += d > mx ? mx : d < -mx ? -mx : d;
        const u = R.stormU; R.storm.scale.set(0.85 + 0.25 * u, 0.3 + 0.7 * u, 1);
        let k = 1;
        if (R.stormFl) { if (typeof options !== 'undefined' && options.reduceFlashing) k = 0.88 + 0.12 * Math.sin(t * PI); else if ((t * 6.3) % 1 < 0.07 && Math.sin(t * 0.83) > 0.8) k = 1.35; }
        SKY.storm.color.setScalar(k);
      }
      if (R.rider && W_ && W_.actors) {
        const a = W_.actors.get(R.rider);
        if (a) { R.skate.position.set(a.pos.x - WX, 0, a.pos.z); R.skate.rotation.y = a.rotY - H; }
      }
      if (R.slateMode === 'play' && R.slateSc) R.slateSc.mat.emissiveIntensity = 0.85 + 0.25 * Math.abs(Math.sin(t * PI * 92 / 60));
    }
  }

  // ---------------------------------------------------------- data
  const MARKS = {
    // general (Region P)
    kettle: [3.2, 0, -5.9, PI], flat_door: [36.8, 0, -5.8, PI], flat_door_in: [36.8, 0, -7.8, PI],
    chips_window: [30.8, 0, -6.0, PI], kiosk: [12.0, 0, 7.2, 0], tree_look: [8.4, 0, 11.0, 0], plaque_look: [-2.0, 0, 7.3, 0],
    sign_look: [-16.5, 0, 13.6, 0], bollard_look: [-10.4, 0, 6.3, PI], sample_hover: [-25.6, 0, 10.4, -H], sample_bay: [-11.0, 0, 23.2, H],
    jetty_man: [-12.0, 0, 59.2, 0], jetty_man_talk: [-13.4, 0, 57.8, 0.79], skate_kid: [23.2, 0, 14.0, H], skate_kid_talk: [22.0, 0, 12.8, 0.75],
    chips_woman: [30.8, 0, -6.0, PI], chips_woman_talk: [32.3, 0, -5.1, -2.2],
    family_1: [13.6, -2.35, 30.4, PI], family_2: [15.0, -2.35, 30.9, PI], family_3: [16.2, -2.1, 30.3, PI],
    family_out_1: [13.4, 0, 23.0, PI], family_out_2: [14.6, 0, 23.4, PI], family_out_3: [15.8, 0, 22.9, PI], lifeguard: [15.0, 3.2, 32.6, PI],
    // 1.7
    s17_luka_start: [-19.6, 0, 6.3, H], s17_chase_start: [-19.0, 0, 7.1, H], s17_c40_start: [-20.6, 0, 6.8, H],
    s17_luka_plaque: [-2.6, 0, 6.7, 0.35], s17_chase_plaque: [-1.3, 0, 6.6, -0.3], s17_c40_plaque: [-3.4, 0, 6.0, 0.6], s17_c40_pov: [-3.1, 0, 6.1, PI],
    s17_cp_plaza: [-12.0, 0, 9.0, H], s17_cp_park: [0.0, 0, 9.0, H], s17_cp_fp: [7.0, 0, -4.8, H], s17_cp_chips: [24.0, 0, -4.8, H],
    s17_exit_luka: [35.6, 0, -4.6, PI], s17_exit_chase: [37.6, 0, -4.4, -2.6], s17_exit_c40: [36.8, 0, -5.8, PI],
    // 1.8 exterior (the stub room behind the kitchen window)
    s18x_luka: [33.65, 3.6, -7.95, H], s18x_chase: [34.95, 3.6, -7.95, -H], s18x_c40: [34.3, 3.6, -8.6, 0],
    // 2.2
    s22_enter_luka: [7.6, 0, -4.4, PI], s22_enter_chase: [9.4, 0, -4.2, PI], s22_enter_c40: [8.5, 0, -3.5, PI],
    s22_stop_luka: [7.5, 0, -12.0, PI], s22_stop_chase: [9.4, 0, -12.4, PI], s22_stop_c40: [8.5, 0, -11.2, PI],
    s22_drone: [10.0, 1.9, -31.0, 0], s22_drone_piano: [8.35, 1.9, -21.6, H], s22_chip_c40: [7.0, 0, -16.8, 2.64],
    s22_plate_luka: [8.05, 0, -18.5, PI], s22_keypad: [8.6, 0, -18.5, PI], s22_piano_chase: [9.45, 0, -20.3, -H], s22_piano_c40: [9.45, 0, -19.6, -H],
    s22_c40_edge: [6.6, 0, -15.4, 2.61], s22_luka_hide: [7.0, 0, -21.5, 0.6],
    s22_sneak_1: [6.8, 0, -17.0, PI], s22_sneak_2: [6.8, 0, -25.0, PI], s22_sneak_3: [7.0, 0, -31.5, PI], s22_exit: [13.2, 0, -33.0, H],
    s22_cp_lane: [8.5, 0, -9.0, PI], s22_sample_cicadas: [9.4, 0, -26.5, H],
    // 2.3 (Region W, world)
    s23_walk_luka: [-315.0, 0, -7.6, H], s23_walk_chase: [-316.0, 0, -8.4, H], s23_walk_c40: [-317.0, 0, -7.9, H],
    s23_c40_stop: [-305.0, 0, -8.0, 0.56], s23_chase_stop: [-303.8, 0, -8.7, 0.45], s23_luka_stop: [-304.2, 0, -7.3, 0.5],
    s23_plaque_look: [-300.0, 0, -0.85, 0], s23_sit_prompt: [-300.0, 0, 0.8, PI],
    s23_seat_luka: [-300.0, 0, 0.08, 0], s23_seat_chase: [-299.36, 0, 0.08, 0], s23_seat_c40: [-300.64, 0, 0.08, 0], s23_c40_elbow: [-303.0, 0, -8.0, 0.36],
    // B2
    b2_luka40: [-300.0, 0, 0.08, 0], b2_c40: [-300.64, 0, 0.08, 0],
    b2_crowd_1: [-309.0, 0, -8.2, H], b2_crowd_2: [-306.6, 0, -7.7, H], b2_crowd_3: [-296.5, 0, -8.3, -H], b2_crowd_4: [-294.2, 0, -7.8, -H], b2_crowd_5: [-291.8, 0, -8.1, -H],
    b2_stop_1: [-306.0, 0, -7.6, 0.4], b2_stop_2: [-304.4, 0, -7.2, 0.3], b2_stop_3: [-296.8, 0, -7.4, -0.3], b2_stop_4: [-295.2, 0, -7.9, -0.35], b2_stop_5: [-293.6, 0, -7.5, -0.4],
    b2_kid_start: [-315.0, 0, -8.2, H], b2_kid_stop: [-302.2, 0, -8.4, 0.3], b2_pelican_land: [-294.4, 1.07, 6.5, PI],
    // optional B1 frames (the Woody jetty, sunset33)
    b1_33_luka: [-274.5, -1.0, 21.6, 0.3], b1_33_chase: [-273.6, -1.0, 21.9, -0.4],
    // Region W's save point: the coffee cart's urn by the picnic shelter (hotspot at: 'urn_w', kettle: true)
    kettle_w: [-288.7, 0, -9.35, PI],
  };
  const PATHS = {   // [[x, z], ...]: drones fly at their own height, cars at the road
    car17_track: [[10, 3.0], [-44, 3.0], [-47, 6.5], [-47, 14]],
    car18_ext: [[14, -1.0], [48, -1.0]],
    // the hero car's legs in 1.7 / 1.8 (63-content-1-7-1-8.js used to add these at runtime; identical values)
    s17_pass: [[-3, 3.0], [-44, 3.0], [-47, 6.5], [-47, 14]],
    s17_turn: [[-39.5, 3.0], [-44, 3.0], [-47, 6.5], [-47, 16]],
    s18_pass: [[17, -1.0], [52, -1.0]],
    walk_fp: [[-40, -5.4], [40, -5.4]], walk_prom: [[-40, 6.7], [40, 6.7]],
    s17_patrol_park: [[4.4, 10.8], [12.4, 10.8], [12.4, 15.8], [4.4, 15.8]],   // loop round the wrapped tree (8.4, 13.2)
    s17_patrol_plaza: [[-18, 10], [-7, 10], [-7, 16], [-18, 16]],
    s17_patrol_fp: [[4, -5.0], [20, -5.0]],
    s22_guard: [[10.0, -31.0], [9.0, -31.0]],
    s22_to_piano: [[10.0, -31.0], [8.6, -24.0], [8.3, -20.0]],
  };
  const SHOP_AR = [['SURF', -42.75], ['PHARMACY', -36.25], ['GELATO', -29.75], ['NEWSAGENT', -23.25], ['DENTIST', -16.75], ['BAKERY', -10.25],
    ['OP SHOP', -3.75], ['CAFÉ', 2.75], ['BOUTIQUE', 14.25], ['BARBER', 19.75], ['ICE CREAM', 25.0], ['REAL ESTATE', 41.8]];
  const AR = [
    { id: 'ar_cloud_billboard', at: [-4, 11, -11.8], text: 'OPTUS CLOUD+ · NEVER FORGET ANYTHING AGAIN · $14.99/month', kind: 'ad', w: 16 },
    { id: 'ar_welcome', at: [-16.5, 2.2, 15.4], text: 'WELCOME TO REDCLIFFE', kind: 'sign', w: 3 },
    { id: 'ar_teeth', at: [-16.5, 1.45, 15.4], text: 'SMILE BRIGHTER · teeth whitening $9.99', kind: 'ad', w: 2.6 },
    { id: 'ar_parade', at: [-16, 3.6, -3.2], text: 'REDCLIFFE PDE', kind: 'sign', w: 2 },
    { id: 'ar_lane', at: [8.5, 4.4, -7.1], text: 'BEE GEES WAY', kind: 'sign', w: 2.4 },
    { id: 'ar_chips', at: [32.2, 3.34, -6.9], text: 'FISH & CHIPS', kind: 'sign', w: 3.2 },
    { id: 'ar_chips_price', at: [30.8, 2.3, -6.9], text: 'Flake & chips $11.50 · Potato scallop $1.20', kind: 'price', w: 2.2 },
    { id: 'ar_jetty', at: [-15.4, 2.1, 17.4], text: 'REDCLIFFE JETTY · No fishing (for your safety)', kind: 'sign', w: 3 },
    { id: 'ar_beach', at: [14, 2.4, 18.4], text: 'SUTTONS BEACH · Swimming is a risk', kind: 'sign', w: 3 },
    { id: 'ar_kiosk', at: [12, 2.5, 8.4], text: 'Have you tried being safe?', kind: 'ad', w: 2.2 },
    { id: 'ar_hover', at: [-30, 2.6, 12.5], text: 'HOVERSURE · One foot is plenty', kind: 'ad', w: 2.6 },
    { id: 'ar_lane_tag', at: [8.3, 1.55, -19.1], text: 'SERVICE CODE 2032', kind: 'code', w: 1.2 },   // 2.2 only
    ...SHOP_AR.map(([s, x]) => ({ id: 'ar_shop_' + s.toLowerCase().replace(/[^a-z]+/g, '_'), at: [x, 3.6, -6.9], text: s, kind: 'sign', w: 3.2 })),
  ];
  return {
    env: {
      day:        { bg: 0x8ccff8, fog: [0xcfe6ef, 0.0044], hemi: [0xeef6ff, 0xb59c74, 1.10], dir: [0xfff6e6, 1.75, [10, 18, 12]], spot: [0xffffff, 0], rain: 0 },
      golden:     { bg: 0x9cc6ea, fog: [0xf2d6b0, 0.0046], hemi: [0xfff0dc, 0xa08060, 1.00], dir: [0xffc890, 1.35, [-4, 7, -16]], spot: [0xffd6a0, 0.8], rain: 0 },
      dusk:       { bg: 0x4d5f8f, fog: [0x8a7f9a, 0.0050], hemi: [0xb8b8e0, 0x3a3040, 0.75], dir: [0xff9a70, 0.45, [-4, 3, -16]], spot: [0xffc890, 2.2], rain: 0 },
      evening:    { bg: 0x1f2c55, fog: [0x2c3a66, 0.0055], hemi: [0x6f80b8, 0x1a1820, 0.60], dir: [0x8aa0d8, 0.25, [6, 10, 10]], spot: [0xffcf98, 2.6], rain: 0 },
      morning:    { bg: 0x9fd4f4, fog: [0xf3e2c8, 0.0046], hemi: [0xf4f6ff, 0xa89070, 1.00], dir: [0xffe2b8, 1.40, [3, 5, 16]], spot: [0xffe6c0, 1.2], rain: 0 },
      wp_morning: { bg: 0x98c4de, fog: [0xc8d6dc, 0.0044], hemi: [0xe8f0f6, 0x8a9a70, 1.00], dir: [0xfff0d8, 1.30, [6, 9, 14]], spot: [0xffffff, 0], rain: 0 },
      wp_washed:  { bg: 0x88cdf6, fog: [0xd8eef4, 0.0040], hemi: [0xf0fbff, 0x6f9a4c, 1.10], dir: [0xfff4e0, 1.50, [14, 7, 10]], spot: [0xffffff, 0], rain: 0 },
      wp_sunset:  { bg: 0xe89a6a, fog: [0xf0b080, 0.0046], hemi: [0xffd8b8, 0x6a4a40, 0.85], dir: [0xff9a50, 1.10, [-10, 3, 6]], spot: [0xffffff, 0], rain: 0 },
    },
    build,
    marks: MARKS,
    anchors: {
      // Region P
      s17_crane_a:    { at: [80, 336, 231], from: [-8, 62, -36], fov: 55 },
      s17_crane_b:    { at: [-12, 0.5, 46], from: [-17, 7.0, 0.5], fov: 50 },
      s17_lifeguard:  { at: [15.0, 0.6, 31.5], from: [11.4, 2.2, 21.8], fov: 44 },
      s17_track:      { at: [-19.6, 1.2, 6.6], from: [-17.6, 1.5, 10.4], fov: 44 },
      s17_car_turn:   { at: [-45.5, 0.6, 6.0], from: [-33.5, 2.6, 5.0], fov: 40 },
      s17_plaque:     { at: [-2.0, 0.8, 8.41], from: [-2.05, 1.12, 7.5], fov: 34 },
      s17_plaque_mid: { at: [-2.2, 0.95, 7.6], from: [-0.2, 1.45, 4.8], fov: 42 },
      s17_pov_chip:   { at: [-4.0, 6.5, -12.0], from: [-3.1, 1.62, 6.1], fov: 60 },
      blank_sign:     { at: [-16.5, 1.9, 15.45], from: [-16.4, 1.7, 12.6], fov: 44 },
      tree:           { at: [8.4, 1.7, 13.2], from: [7.8, 1.6, 9.3], fov: 46 },
      bollard:        { at: [-10.4, 0.45, 5.15], from: [-9.6, 1.0, 6.7], fov: 36 },
      kiosk:          { at: [12.0, 1.35, 8.3], from: [12.0, 1.45, 6.9], fov: 38 },
      hover_parked:   { at: [-27.0, 0.6, 10.4], from: [-24.6, 1.3, 8.4], fov: 40 },
      jetty_waves:    { at: [-12.4, -1.4, 20.2], from: [-7.4, 0.3, 22.8], fov: 44 },
      pelican_pole:   { at: [-9.4, 1.4, 23.8], from: [-10.9, 1.5, 22.4], fov: 34 },
      jetty_man:      { at: [-12.0, 1.0, 59.2], from: [-13.6, 1.5, 56.4], fov: 40 },
      skate_kid:      { at: [23.2, 1.0, 14.0], from: [21.0, 1.4, 11.8], fov: 40 },
      chips_window:   { at: [30.8, 1.4, -7.0], from: [32.6, 1.6, -4.4], fov: 42 },
      flat_door:      { at: [36.8, 1.2, -7.0], from: [35.0, 1.6, -3.6], fov: 40 },
      s17_dusk_exit:  { at: [34.5, 3.2, -7.0], from: [24.0, 2.0, 6.5], fov: 46 },
      urn:            { at: [3.2, 1.15, -7.05], from: [3.0, 1.45, -5.9], fov: 34 },
      s18_ext_window: { at: [34.3, 4.9, -7.9], from: [33.2, 1.5, 4.2], fov: 32 },
      s22_lane_track: { at: [8.5, 1.2, -9.0], from: [8.6, 1.7, -1.2], fov: 44 },
      s22_statues:    { at: [8.5, 1.4, -33.8], from: [8.5, 1.7, -24.0], fov: 34 },
      s22_drone_end:  { at: [10.0, 1.9, -31.0], from: [8.6, 1.6, -26.5], fov: 36 },
      s22_ar_tag:     { at: [8.3, 1.55, -19.1], from: [7.2, 1.62, -16.9], fov: 36 },
      s22_limiter:    { at: [8.3, 0.86, -19.13], from: [8.3, 1.1, -18.5], fov: 34 },
      s22_keypad:     { at: [8.39, 0.86, -19.12], from: [8.36, 1.08, -18.72], fov: 30 },
      s22_piano_play: { at: [8.6, 0.95, -20.0], from: [10.4, 1.75, -20.9], fov: 40 },
      s22_piano_cam:  { at: [9.45, 1.12, -19.95], from: [7.3, 2.6, -19.95], fov: 44 },   // high over the lid: both seated faces
      s22_c40_close:  { at: [6.6, 1.58, -15.4], from: [7.3, 1.62, -16.35], fov: 36 },    // in front of him at s22_c40_edge
      s22_lane_bay:   { at: [-30.0, 3.0, 380], from: [8.2, 1.62, -15.2], fov: 30 },
      s22_luka_hiss:  { at: [7.0, 1.0, -21.5], from: [7.6, 1.3, -23.2], fov: 40 },
      s22_exit:       { at: [13.2, 0.9, -33.2], from: [7.0, 2.6, -28.8], fov: 46 },
      b1_2031_poster: { at: [-24.6, 1.6, 13.1], from: [-24.4, 1.75, 9.6], fov: 34 },
      crane_sky_p:    { at: [-12, 0, 120], from: [-6, 48, -30], fov: 50 },
      // Region W (world)
      wp_canon:        { at: [-300.5, 0.7, 4.0], from: [-298.5, 2.0, -13.0], fov: 40 },
      s23_path_wide:   { at: [-306.0, 1.0, -8.0], from: [-304.0, 1.7, -30.0], fov: 22 },
      s23_plaque:      { at: [-300.0, 0.84, -0.27], from: [-300.48, 1.02, -0.6], fov: 30 },   // beside the reader's shoulder at s23_plaque_look
      s23_rail_a:      { at: [-300.7, 0.86, -0.24], from: [-301.2, 1.08, -0.82], fov: 30 },
      s23_rail_b:      { at: [-299.3, 0.86, -0.24], from: [-299.8, 1.08, -0.82], fov: 30 },
      s23_seat:        { at: [-300.25, 0.47, 0.05], from: [-300.3, 1.5, -0.45], fov: 34 },
      s23_bench_front: { at: [-300.0, 0.95, 0.05], from: [-299.6, 1.25, 3.0], fov: 40 },
      s23_c40_close:   { at: [-300.64, 1.2, 0.08], from: [-301.6, 1.3, 1.4], fov: 34 },
      s23_storm:       { at: [-290.0, 40, 420], from: [-300.0, 1.4, -2.0], fov: 30 },
      b2_slate:        { at: [-300.98, 0.74, 0.04], from: [-300.98, 1.15, 0.5], fov: 30 },
      b2_wide_path:    { at: [-301.0, 0.8, -6.5], from: [-290.5, 2.2, 8.5], fov: 48 },
      b2_crane_a:      { at: [-300.5, 0.8, 2.0], from: [-299.0, 2.4, -11.0], fov: 40 },
      b2_crane_b:      { at: [-300.0, 0.0, 60.0], from: [-296.0, 34.0, -40.0], fov: 46 },
      credits_bench:   { at: [-300.0, 0.6, 0.0], from: [-296.2, 1.4, -4.6], fov: 40 },
      credits_bridge:  { at: [-300.0, 4.0, 368], from: [-300.0, 1.6, 5.5], fov: 14 },
      b1_2033_jetty:   { at: [-274.0, -0.2, 22.0], from: [-282.0, 0.4, 12.0], fov: 38 },
      urn_w:           { at: [-288.65, 1.22, -10.35], from: [-288.85, 1.55, -9.2], fov: 34 },   // Region W's kettle (the cart's urn)
      coffees_w:       { at: [-300.2, 0.3, 0.2], from: [-299.7, 1.05, 1.25], fov: 36 },      // B2: the two cups by the bench
    },
    cams: {
      fp_far_west:    { type: 'pan', pos: [-27.0, 4.6, 2.2], base: [-40.0, 0.8, -5.2], look: 'player', fov: 44, limit: 0.55 },
      fp_west:        { type: 'pan', pos: [-11.0, 4.8, 1.6], base: [-25.0, 0.8, -5.2], look: 'player', fov: 44, limit: 0.55 },
      fp_mid:         { type: 'pan', pos: [-18.6, 5.0, 3.2], base: [-3.0, 0.8, -5.2], look: 'player', fov: 42, limit: 0.60 },
      fp_east:        { type: 'pan', pos: [12.8, 5.6, 4.6], base: [14.0, 0.8, -5.4], look: 'player', fov: 50, limit: 0.60 },
      chips:          { type: 'pan', pos: [22.8, 3.4, 7.0], base: [33.0, 2.4, -6.8], look: 'player', fov: 46, limit: 0.50 },
      carpark_fs:     { type: 'pan', pos: [-46.5, 5.0, 11.4], base: [-30.0, 0.6, 7.0], look: 'player', fov: 46, limit: 0.55 },
      jetty_plaza:    { type: 'pan', pos: [-7.2, 6.0, -6.2], base: [-12.0, 0.6, 13.0], look: 'player', fov: 44, limit: 0.50 },
      jetty_near:     { type: 'pan', pos: [-12.0, 2.3, 13.5], base: [-12.0, 0.8, 50.0], look: 'player', fov: 28, limit: 0.15 },
      jetty_end:      { type: 'pan', pos: [-4.6, 4.0, 61.6], base: [-12.0, 0.4, 45.0], look: 'player', fov: 46, limit: 0.50 },
      park_west:      { type: 'pan', pos: [-3.0, 5.4, 3.0], base: [8.0, 0.6, 18.0], look: 'player', fov: 48, limit: 0.55 },
      park_east:      { type: 'pan', pos: [41.4, 5.0, 4.6], base: [27.0, 0.6, 16.0], look: 'player', fov: 48, limit: 0.55 },
      lane_mouth:     { type: 'pan', pos: [10.6, 3.6, -5.6], base: [8.2, 0.8, -26.0], look: 'player', fov: 42, limit: 0.40 },
      lane_end:       { type: 'pan', pos: [6.5, 4.6, -34.6], base: [8.8, 0.6, -16.0], look: 'player', fov: 46, limit: 0.45 },
      wp_canon:       { type: 'fixed', pos: [-298.5, 2.0, -13.0], look: [-300.5, 0.7, 4.0], fov: 40 },
      wp_bench_close: { type: 'fixed', pos: [-302.9, 1.5, -3.4], look: [-300.0, 0.65, 0.2], fov: 42 },
      wp_bench_front: { type: 'fixed', pos: [-301.8, 1.35, 4.6], look: [-300.0, 0.7, 0.0], fov: 44 },
    },
    zones: [   // first match wins; boxes tile every walkable area
      { box: [-16, -3, -12, 5], cam: 'jetty_plaza' },      // zebra W
      { box: [22, -3, 26, 5], cam: 'chips' },              // zebra E
      { box: [-44, -7, -30, -3], cam: 'fp_far_west' },
      { box: [-30, -7, -16, -3], cam: 'fp_west' },
      { box: [-16, -7, 6, -3], cam: 'fp_mid' },
      { box: [6, -7, 22, -3], cam: 'fp_east' },            // includes the lane mouth threshold
      { box: [22, -7, 42, -3], cam: 'chips' },
      { box: [-44, 5, -20, 12], cam: 'carpark_fs' },       // west promenade + foreshore car park
      { box: [-20, 5, -4, 18], cam: 'jetty_plaza' },
      { box: [-13.75, 18, -10.25, 36], cam: 'jetty_near' },
      { box: [-20, 36, -4, 60], cam: 'jetty_end' },        // far deck + T-head
      { box: [-4, 5, 17, 24], cam: 'park_west' },          // promenade + park + beach (west)
      { box: [17, 5, 42, 24], cam: 'park_east' },
      { box: [6, -20, 11, -7], cam: 'lane_mouth' },
      { box: [6, -35, 14, -20], cam: 'lane_end' },         // incl. the exit pocket
      { box: [-316, -10, -284, -3.5], cam: 'wp_canon' },   // 2.3: path + back grass
      { box: [-316, -3.5, -284, 0.4], cam: 'wp_bench_close' },
      { box: [-316, 0.4, -284, 6.2], cam: 'wp_bench_front' },
    ],
    colliders: COL,
    props: [
      'region_p', 'region_w', 'hovercar_hero', 'hovercar_parked', 'traffic', 'cars_parked', 'lifeguard_drone', 'family', 'pelicans_p', 'pelicans_w',
      'pelican_hero', 'strollers', 'palm_lights_a', 'palm_lights_b', 'lane_festoon', 'lamps', 'xmas_tree_wrapped', 'plaque_2032', 'blank_sign',
      'billboard_blank', 'kiosk', 'chip_shop_window', 'awning_tinsel', 'urn', 'flat_door', 'flat_window', 'window_figures', 'flat_balcony_lights',
      'stage_2031', 'poster_2031', 'piano', 'limiter_light', 'limiter_plate', 'keypad', 'lane_bollards', 'statues', 'lane_palm', 'water_p', 'foam_p',
      'glitter_p', 'bench', 'memorial_plaque', 'frangipani', 'bench_pad', 'railing_w', 'bell_buoy', 'storm_clouds', 'puddles', 'slate_speaker',
      'skateboard', 'woody_jetty', 'council_sign_w', 'coffee_cart_w', 'urn_w', 'coffees', 'coffee_luka40', 'coffee_chase40', 'grass_w', 'water_w', 'foam_w', 'band_p', 'band_w', 'band_skirt_p', 'band_skirt_w', 'haze_p', 'haze_w',
      'bridge_p', 'bridge_w', 'bridge_lights_p', 'bridge_lights_w', 'sun_p', 'sun_w', 'clouds_p', 'clouds_w',
    ],
    get ambience() { return AMB[ambKey()] || AMB.day17; },
    update,
    // extras (spec §12)
    W0, dress, region: () => R.region || 'P', paths: PATHS, ar: AR, lightsLevel: () => R.level || 0,
  };
})();
