// ============================================================ SET: flat — Chase (2040)'s flat above the fish-and-chip shop
// Scenes 1.8 "Order of Service" (Sat 22 Dec 2040, 19:40) and 2.1 "Senior Casual" (Sun 23 Dec 2040, 4:52 am -> ~6:00).
// Spec: docs/sets/flat.md (names and coordinates are the contract). The exterior seen FROM the street (the lit kitchen
// window, 1.8 step 27) belongs to SETS.parade (docs/sets/parade.md §2.5); the numbers below match it.
//
// LAYOUT (metres, Y up). Flat local = parade - (32, 3.6, -7), same axes. Origin = the inside face of the front wall at
// floor level on the building's centre line. +Z = out to the bay (balcony door, kitchen window); +X = the kitchen side.
// From inside looking out (+Z) screen-right is -X: balcony right, kitchen left, the bridge far off to the right.
// Mark ry: facing (sin ry, cos ry): 0 = +Z (the bay), PI = -Z, H = +X, -H = -X. Every walkable floor is y = 0 (the stair
// down from the landing is floor(x, z)).
//   interior x -4..4, z -6.4..0, ceiling 2.6 · front wall z 0..0.15 (balcony slider x -3.4..-1.0 h 2.1, two glass panels;
//   kitchen louvre window x 1.4..3.4, sill 0.95, head 2.1, eave + light string outside at y 2.35..2.45) · partition
//   z -3.65..-3.55 (bedroom door x -1.4..-0.5, hinge -1.4, swings into the bedroom; entry door x 1.2..2.1, hinge 2.1,
//   swings onto the landing).
//   LIVING x -4..0.4: sticky note wall on the x -4 face (z -3.4..-0.3, y 0.95..2.45; five hero notes centred z -1.8,
//   y 1.7) · keyboard on an X-stand under a grey sheet x -4..-3.55, z -3.45..-2.15 (keys y 0.835) · standing desk
//   x -4..-3.35, z -1.5..-0.4, top 0.76 (music slate (-3.72, 0.77, -0.95), desk lamp) · teal couch x -2.8..-0.95,
//   z -2.9..-2.2 facing +Z (seat 0.42, back 0.85) · bookshelf x -0.35..0.85, z -3.55..-3.25, h 1.8 (shelf 3 y 1.15: the
//   31 notebooks "two 1".."two 31"; shelf 4 y 1.6: the framed 2031 photo) · dying plant (-0.75, -0.35).
//   KITCHEN x 0.4..4: bench x 3.4..4, z -2.7..-0.2, top 0.92 (sink z -1.0, kettle (3.72, 0.93, -2.1), toaster z -2.45,
//   parcel spot (3.7, 0.93, -1.5), cooktop z -0.6..-0.25), overhead cupboards y 1.5..2.2 · fridge x 3.3..4, z -3.5..-2.8,
//   h 1.8, door face x 3.29 (pelican magnet + folded card at (3.29, 1.42, -3.12), SEA BREEZE menu, bin-day magnet) ·
//   table 0.8 x 0.8 h 0.75 at (2.3, -0.95), pendant above (2.3, 2.1, -0.95); chairs W (1.65, -0.95) facing +X,
//   E (2.95, -0.95) facing -X, stool S (2.3, -1.6) facing +Z.
//   BEDROOM x -4..0.9, z -6.4..-3.6: queen bed x -3.7..-2.2, z -6.4..-4.4 (mattress 0.55); deco box under its +X side
//   (home (-2.6, -5.4), pulled out (-1.7, -5.4)); bedside (-1.95, -6.15); wardrobe x -0.4..0.85, z -6.4..-5.8; small
//   back window x -3.2..-2.0. LANDING x 0.9..2.4, z -4.8..-3.6 (dim bulb; stair down -Z from z -4.8; bathroom door on
//   the x 2.4 wall, closed). BALCONY x -4..-0.4, z 0..1.5 (walkable x -3.4..-1.0), rail z 1.5 top 1.05, awning y 2.5.
//   OUTSIDE (y -3.6 = the Parade): footpath z 0..4, road z 4..12 (+X lane z 6, -X lane z 10, zebra x -10..-6), promenade
//   z 12..15 (palms z 14.4, lamps z 12.6), park z 15..25, sand z 25..31 sloping to the water (y -5.1) at z 36, jetty
//   x -45.75..-42.25, z 25..61 + T-head x -52..-36, z 61..67; Ted Smout Bridge A(-49,-5.1,387) -> B(-247,-5.1,382)
//   (7°..33° right of +Z); horizon band r 450; dawn storm bank bearing -10°..40° at ~420 m; morning sun at 420 m.
//
// ENV: evening (default) · dawn · morning. DRESS: evening18 · dawn21 · morning21 (auto by scene: 1.8 evening18, 2.1
//   dawn21; content calls SETS.flat.dress('morning21') at 2.1_plan, or sets env 'morning' in 2.1). Outside a flat scene
//   (setview, dev) the dress follows the env.
// MARKS: s18_landing_c40 s18_landing_luka s18_landing_chase s18_arr_c40 s18_arr_luka s18_arr_chase s18_out_c40
//   s18_sticky_chase s18_keys s18_shelf s18_balcony s18_fridge_luka s18_read_chase s18_door_c40 s18_in_c40 s18_bench_c40
//   s21_couch_chase s21_bal_polish s21_bed_c40 s21_slate_chase s21_photo_chase s21_kettle s21_door_c40 s21_bal_luka
//   s21_bal_chase s21_plan_luka s21_plan_c40 s21_plan_chase s21_box_luka s21_turn_luka s21_watch_chase s21_watch_c40
//   s21_couch_lie s21_bed_lie (lying on the couch / bed: needs lie(true))
//   kettle centre
// ANCHORS: s18_pan_a s18_pan_b s18_sticky s18_keys s18_notebooks s18_balcony_view fridge_card s18_luka_close
//   s18_room_wide s18_doorway_wide s18_kitchen_locked s21_dawn_wide s21_couch_close s21_slate s21_photo s21_kettle
//   s21_doorway_mid s21_hand_frame s21_balcony_two s21_plan_wide s21_plan_notes s21_box s21_santa_mid
// CAMS (pan, RE-style corners): living (first = default) kitchen balcony bedroom. ZONES tile the balcony, living,
//   kitchen, bedroom and the landing top (kitchen cam).
// PROPS (userData API; every call is instant while skipping, nothing allocates; hand props go back to their home when
//   content drops them: hold(id, null)):
//   fridge_card state('under' crooked | 'out' hidden + order_card shown | 'back' perfectly straight) · order_card (the
//   card opened, for Luka's hands: hold('luka', 'order_card'); home = on the fridge door) · pelican_magnet · sticky_wall ·
//   keyboard_sheet lift(bool) (0.4 s; the keys + the grey line under it) · slate_desk screen('off'|'folder'|'list'|'play')
//   (standby glow at dawn), screenApi = the PROPS.slate screen · notebooks · photo_2031 · kettle steam() ·
//   balcony_door open(u 0 | 0.5 | 1) (0.6 s; collider gap follows) · curtain (sways when the door is open) ·
//   bedroom_door open(a 0 | 0.45 | 1.4) · entry_door open(bool) · deco_box state('under'|'out'|'open') (slides 0.9 m +X,
//   flaps open; collider when out) · santa_kit (hat + beard in the box; content hides it when Luka puts them on) ·
//   chips_parcel (hidden; home = the bench spot (3.7, 0.93, -1.5)) · teas state('bench'|'rail'|'hidden') holding tea_1 /
//   tea_2 (one per hand) · tea_towel (home: over the rail) · toast · plan_notes show(n 0..3) · xmas_lights (3 phase
//   InstancedMeshes, soft chase at 0.9 Hz) · pendant on(bool) (shade glow + the spot) · desk_lamp on(bool) ·
//   couch_blanket state('folded'|'spread') · plant_dying · snore_z on(bool) (the rising z + the snore loop) ·
//   outside: street_f traffic_f palms_f lamps_f jetty_f water_f foam_f band_f (+ haze_f) skirt_f bridge_f
//   bridge_lights_f clouds_f storm_bank_f sun_f sky_f
// AMBIENCE (by dress): evening18 fridge + parade_far · dawn21 birds_dawn + bay_far + snore (soft) · morning21
//   birds_dawn + bay_far + fridge; room 'room'.
// THE SPOT: evening = the pendant over the table (dark while pendant.on(false)); dawn = a pink shaft through the balcony
//   door; morning = off (torchAuto restored).
// EXTRAS on the entry: dress(state), snore(on), floor(x, z), lightsLevel(), lie(on = true) (the couch seat and the mattress
//   become floor(x, z) so a lying anim rests on them; reset by every dress(): call it after dressing).
// Static geometry is vertex-coloured and merged per material; painted 64-256 px textures (nearest) only where something
// must read; repeats are InstancedMeshes; nothing is created after build(). <= ~80 draw calls from any view (setshots).
SETS.flat = (() => {
  const PI = Math.PI, H = PI / 2, TAU = PI * 2, DS = THREE.DoubleSide;
  // ---- palette (spec §3.1; no Yes yellow anywhere: the "yellow" notes are pale lemon)
  const WALL = 0xe8e0cf, CEIL = 0xf0ebe0, TEAL = 0x4f7c7a, TEAL_D = 0x41686a, OAT = 0xcbbfa6, LAMI = 0xd9d2c0,
    CUP = 0xe4dccb, SPLASH = 0xb8d8ee, FRIDGE = 0xe9ecee, DESK = 0x6b5a48, DESK_D = 0x5a4a3a, SHELF = 0x5a4a3a,
    SHELF_D = 0x48392b, SHEETC = 0xc8c8c2, LINEN = 0x8aa0b8, RAIL = 0xd0d4d8, TERRA = 0xb86e4e, TRIM = 0xf4f0e6,
    ALU = 0xc8ccd0, DOORC = 0xebe5d8, TIMBER = 0x9a7656, TIMBER_D = 0x6e523a, IRON = 0x2a2c30, STEEL = 0xb8bec4,
    CARDB = 0xb8905e, AWN = 0x2a3a66, NAVY = 0x141d3a, CONC = 0xc2bcb0, ROAD = 0x4c4f55, LINE = 0xe8e6dc,
    PAVE = 0xd6ccba, GRASS = 0x7aa04a, SAND = 0xe9d8a6, WSAND = 0xc9b484, ROCK = 0x8a8478, WNEAR = 0x6cc3dc,
    WFAR = 0x3d9fc4, GLASSY = 0xbfe6ff, BRICK = 0xa65a44;
  const NOTE = [0xf7a8c0, 0xa8e8c8, 0xa8d0f0, 0xf8c8a0, 0xf4ec9a];
  const NOTE_CSS = ['#f7a8c0', '#a8e8c8', '#a8d0f0', '#f8c8a0', '#f4ec9a'];
  const XCOL = [0xd8323a, 0x2f9a4a, 0x3a7ae0, 0xfff1d0];
  const IN = [1, 1, 1], OUTT = [1, 1, 1];
  const Y0 = -3.6, WY = -5.1;                    // the Parade's ground and the water, in flat-local metres
  const COL = [];                                // colliders (filled by build; some are written in place by update)
  const R = {};                                  // live refs from the last build
  // scratch (update never allocates)
  const tc = new THREE.Color(), tc2 = new THREE.Color(), m4 = new THREE.Matrix4(), v1 = new THREE.Vector3(), sv = new THREE.Vector3();
  const q1 = new THREE.Quaternion(), e1 = new THREE.Euler();
  const STEAM_AT = [3.72, 1.22, -2.1], STEAM_O = { n: 16, speed: 0.25, life: 1.8, color: 0xf2f2f2 };
  let b = null, tint = IN, XF = null, T = null, M = null, SKY = null;
  const skipping = () => typeof flow !== 'undefined' && !!flow.skipping;
  const smooth = (u) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
  const clamp01 = (u) => (u < 0 ? 0 : u > 1 ? 1 : u);
  let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  // ---------------------------------------------------------- tweens (objects made once; ticks allocate nothing)
  const TW = (v = 0) => ({ v, a: v, b: v, t: 1, d: 0.5 });
  const tw = { door: TW(), bed: TW(), entry: TW(), box: TW(), flaps: TW(), sheet: TW() };
  const TWS = [tw.door, tw.bed, tw.entry, tw.box, tw.flaps, tw.sheet];
  function twSet(o, to, dur) {
    if (skipping() || !(dur > 0)) { o.v = o.a = o.b = to; o.t = 1; return; }
    if (o.b === to && o.t < 1) return;
    o.a = o.v; o.b = to; o.t = 0; o.d = dur;
  }
  function twSnap(o, to) { o.v = o.a = o.b = to; o.t = 1; }
  function twTick(o, dt) { if (o.t >= 1) return false; o.t = Math.min(1, o.t + dt / o.d); o.v = o.a + (o.b - o.a) * smooth(o.t); return true; }

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
  function ico(r, hex, x, y, z, sy = 1, m, sx = 1, sz = 1) { const g = new THREE.IcosahedronGeometry(r, 0); g.scale(sx, sy, sz); g.translate(x, y, z); put(g, hex, m); }
  function quad(w, h, m, x, y, z, ry = 0, rx = 0, hex = 0xffffff) {
    const g = new THREE.PlaneGeometry(w, h); if (rx) g.rotateX(rx); if (ry) g.rotateY(ry); g.translate(x, y, z); put(g, hex, m);
  }
  // remap a geometry's 0..1 UVs into the pixel rect r = [x, y, w, h] of an aw x ah atlas (canvas y down)
  function uvRect(g, r, aw = 256, ah = 256) {
    const uv = g.attributes.uv, u0 = r[0] / aw, u1 = (r[0] + r[2]) / aw, vt = 1 - r[1] / ah, v0 = 1 - (r[1] + r[3]) / ah;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, u0 + uv.getX(i) * (u1 - u0), v0 + uv.getY(i) * (vt - v0));
    return g;
  }
  // a textured quad showing atlas rect r (faces +Z before rotation: rx first, then rz, then ry)
  function tq(w, h, r, x, y, z, ry = 0, rx = 0, m = M.atlas, rz = 0, hex = 0xffffff) {
    const g = uvRect(new THREE.PlaneGeometry(w, h), r); if (rx) g.rotateX(rx); if (rz) g.rotateZ(rz); if (ry) g.rotateY(ry); g.translate(x, y, z); put(g, hex, m);
  }
  // world-space UVs: horizontal (x, -z) / tile, or a vertical wall along x ('x': (x, y)) or along z ('z': (z, y))
  function wuv(g, tile, vert) {
    const p = g.attributes.position, uv = g.attributes.uv;
    for (let i = 0; i < p.count; i++) {
      if (vert === 'x') uv.setXY(i, p.getX(i) / tile, p.getY(i) / tile);
      else if (vert === 'z') uv.setXY(i, -p.getZ(i) / tile, p.getY(i) / tile);
      else uv.setXY(i, p.getX(i) / tile, -p.getZ(i) / tile);
    }
    return g;
  }
  function gnd(x0, z0, x1, z1, y, m, tile = 4, hex = 0xffffff) {
    const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0); g.rotateX(-H); g.translate((x0 + x1) / 2, y, (z0 + z1) / 2);
    put(wuv(g, tile), hex, m);
  }
  // a vertical textured face with world UVs: face 'z+' | 'z-' (along x) or 'x+' | 'x-' (along z)
  function wallT(x0, z0, x1, z1, y0, y1, face, m, tile, hex = 0xffffff) {
    const along = face === 'z+' || face === 'z-', len = along ? x1 - x0 : z1 - z0;
    const g = new THREE.PlaneGeometry(len, y1 - y0);
    if (face === 'z-') g.rotateY(PI); else if (face === 'x+') g.rotateY(H); else if (face === 'x-') g.rotateY(-H);
    g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    put(wuv(g, tile, along ? 'x' : 'z'), hex, m);
  }
  // a terrain strip along z between x0..x1 following prof = [[z, y], ...] with a colour per row
  function strip(x0, x1, prof, m, tile, cols) {
    const pos = [], uv = [], col = [];
    for (let i = 0; i < prof.length - 1; i++) {
      const [za, ya] = prof[i], [zb, yb] = prof[i + 1];
      const ca = cols[i], cb = cols[i + 1];
      for (const [x, y, z, c] of [[x0, ya, za, ca], [x0, yb, zb, cb], [x1, ya, za, ca], [x1, ya, za, ca], [x0, yb, zb, cb], [x1, yb, zb, cb]]) {
        pos.push(x, y, z); uv.push(x / tile, -z / tile); tc.set(c); col.push(tc.r * tint[0], tc.g * tint[1], tc.b * tint[2]);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.computeVertexNormals();
    b.geo(g, m);
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
  const at = (x, z, ry = 0, y = 0) => (XF = new THREE.Matrix4().makeRotationY(ry).setPosition(x, y, z));
  function IM(geo, m, list, name, parent) { const im = instanced(geo, m, list); if (name) im.name = name; if (parent) parent.add(im); return im; }
  function dyn(im) { im.instanceMatrix.setUsage(THREE.DynamicDrawUsage); im.frustumCulled = false; return im; }
  // a sticky note flat on a face: 'x+' (on a wall facing +X), 'x-', 'z+', 'z-', 'up'; rot = in-plane
  function noteOn(face, x, y, z, s, rot, hex, ink = true) {
    const t = 0.003;
    if (face === 'x+' || face === 'x-') boxR(t, s, s, hex, x, y, z, rot, 0, 0);
    else if (face === 'up') boxR(s, t, s, hex, x, y, z, 0, rot, 0);
    else boxR(s, s, t, hex, x, y, z, 0, 0, rot);
    if (!ink) return;
    const o = face === 'x+' ? 0.0022 : face === 'x-' ? -0.0022 : face === 'z+' ? 0.0022 : face === 'z-' ? -0.0022 : 0.0022;
    for (let k = 0; k < 2; k++) {
      const yy = s * (0.12 - k * 0.2), w = s * (0.7 - k * 0.2), c = Math.cos(rot), sn = Math.sin(rot);
      if (face === 'x+' || face === 'x-') boxR(0.002, 0.004, w, 0x2a3050, x + o, y + yy * c, z + yy * sn, rot, 0, 0);
      else if (face === 'up') boxR(w, 0.002, 0.004, 0x2a3050, x + yy * sn, y + o, z - yy * c, 0, rot, 0);
      else boxR(w, 0.004, 0.002, 0x2a3050, x - yy * sn, y + yy * c, z + o, 0, 0, rot);
    }
  }

  // ---------------------------------------------------------- painted textures (64-256 px, nearest)
  const FONT = (px, w = 'bold') => `${w} ${px}px Arial, "Liberation Sans", "DejaVu Sans", sans-serif`;
  function text(c, s, x, y, px, col, al = 'center', w = 'bold', maxW) {
    c.font = FONT(px, w); c.fillStyle = col; c.textAlign = al; c.textBaseline = 'middle'; c.fillText(s, x, y, maxW);
  }
  function scrib(c, x, y, w, rows, col) {   // illegible marker lines (in the current transform)
    c.strokeStyle = col; c.lineWidth = 1;
    for (let r = 0; r < rows; r++) {
      const yy = y + r * 4, len = w * (0.55 + rnd() * 0.45);
      c.beginPath(); c.moveTo(x, yy);
      for (let px = x + 2.5; px < x + len; px += 2.5) c.lineTo(px, yy + (rnd() - 0.5) * 1.8);
      c.stroke();
    }
  }
  function stickyNote(c, x, y, s, rot, col, rows) {   // centred at (x, y)
    c.save(); c.translate(x, y); c.rotate(rot);
    c.fillStyle = 'rgba(60,45,30,0.22)'; c.fillRect(-s / 2 + 1, -s / 2 + 1.5, s, s);
    c.fillStyle = col; c.fillRect(-s / 2, -s / 2, s, s);
    c.fillStyle = 'rgba(0,0,0,0.07)'; c.fillRect(-s / 2, -s / 2, s, Math.max(2, s * 0.16));
    c.fillStyle = 'rgba(255,255,255,0.22)'; c.fillRect(-s / 2, s / 2 - 1.5, s, 1.5);
    if (rows) {
      const ink = rnd() > 0.25 ? 'rgba(28,34,64,0.8)' : 'rgba(150,36,48,0.75)';
      c.fillStyle = ink; c.font = FONT(Math.max(5, s * 0.26)); c.textAlign = 'left'; c.textBaseline = 'middle';
      c.fillText('two', -s / 2 + 2.5, -s / 2 + s * 0.33);
      scrib(c, -s / 2 + 2.5, -s / 2 + s * 0.55, s - 5, rows, ink);
    }
    c.restore();
  }
  const HERO = [['two —', 'bridge??'], ['two —', '2nd verse', 'too long'], ['two —', 'make it', 'better'], ['two —', 'NOT YET'], ['two —', 'for L.']];
  function paintHero(c) {   // 256 x 256 on 1.5 x 1.5 m: hundreds of notes; the five hero notes across the centre band
    c.fillStyle = '#cfc6b3'; c.fillRect(0, 0, 256, 256);
    seed = 101;
    for (let r = 0, y = -4; y < 266; y += 14, r++) for (let x = -6 + (r % 2) * 9; x < 266; x += 17) stickyNote(c, x + (rnd() - 0.5) * 6, y + (rnd() - 0.5) * 5, 18 + rnd() * 7, (rnd() - 0.5) * 0.36, NOTE_CSS[Math.floor(rnd() * 5)], 1 + Math.floor(rnd() * 2));
    for (let i = 0; i < 46; i++) stickyNote(c, rnd() * 256, rnd() * 256, 19 + rnd() * 6, (rnd() - 0.5) * 0.5, NOTE_CSS[Math.floor(rnd() * 5)], 1);
    const ROT = [-0.05, 0.035, -0.025, 0.045, -0.03], DY = [2, -3, 3, -1, 2];
    for (let k = 0; k < 5; k++) {
      const cx = 28 + k * 50, cy = 128 + DY[k], s = 48;
      c.save(); c.translate(cx, cy); c.rotate(ROT[k]);
      c.fillStyle = 'rgba(50,35,20,0.4)'; c.fillRect(-s / 2 + 1.5, -s / 2 + 2, s, s);
      c.fillStyle = NOTE_CSS[k]; c.fillRect(-s / 2, -s / 2, s, s);
      c.fillStyle = 'rgba(0,0,0,0.08)'; c.fillRect(-s / 2, -s / 2, s, 7);
      const L = HERO[k], n = L.length, ink = '#141a36';
      for (let i = 0; i < n; i++) text(c, L[i], 0, (i - (n - 1) / 2) * 12 + 2, L[i] === 'NOT YET' ? 12 : 11, ink, 'center', 'bold', 44);
      if (k === 3) { c.fillStyle = ink; c.fillRect(-20, 13, 40, 1.5); }   // NOT YET, underlined
      c.restore();
    }
  }
  function paintFill(c) {   // 128 x 128, seamless: dense small notes
    c.fillStyle = '#cfc6b3'; c.fillRect(0, 0, 128, 128);
    seed = 303;
    const L = [];
    for (let r = 0; r < 8; r++) for (let k = 0; k < 7; k++) L.push([k * 128 / 7 + (r % 2) * 9 + (rnd() - 0.5) * 5, r * 16 + (rnd() - 0.5) * 4, 17 + rnd() * 6, (rnd() - 0.5) * 0.4, Math.floor(rnd() * 5), 1 + Math.floor(rnd() * 1e6)]);
    for (const [x, y, s, rot, ci, sd] of L) for (const ox of [-128, 0, 128]) for (const oy of [-128, 0, 128]) {
      if (x + ox < -20 || x + ox > 148 || y + oy < -20 || y + oy > 148) continue;
      seed = sd; stickyNote(c, x + ox, y + oy, s, rot, NOTE_CSS[ci], 1 + (sd % 2));
    }
  }
  // atlas A (256 x 256): paper and printed things
  const A_NB = [0, 0, 256, 64], A_MENU = [0, 64, 64, 80], A_BIN = [64, 64, 32, 32], A_POST = [96, 64, 32, 32], A_DECO = [128, 64, 128, 64],
    A_ORDER = [64, 96, 64, 48], A_PLAN = [[128, 128, 40, 32], [170, 128, 40, 32], [212, 128, 40, 32]], A_CARD = [0, 144, 64, 44],
    A_PHOTO = [128, 160, 128, 96], A_TOAST = [64, 144, 32, 32], A_LABEL = [96, 144, 32, 16];
  function figure(c, x, y, s, hair, shirt, beard, laugh) {   // a small painted head + shoulders, (x, y) = chin
    c.fillStyle = shirt; c.beginPath(); c.moveTo(x - s * 1.6, y + s * 2.4); c.quadraticCurveTo(x - s * 1.5, y + s * 0.5, x, y + s * 0.45); c.quadraticCurveTo(x + s * 1.5, y + s * 0.5, x + s * 1.6, y + s * 2.4); c.fill();
    c.fillStyle = '#e2b28c'; c.beginPath(); c.ellipse(x, y - s * 0.55, s * 0.62, s * 0.75, 0, 0, TAU); c.fill();
    c.fillStyle = hair; c.beginPath(); c.ellipse(x, y - s * 1.05, s * 0.7, s * 0.42, 0, PI, TAU); c.fill(); c.fillRect(x - s * 0.7, y - s * 1.1, s * 0.25, s * 0.6);
    if (beard) { c.fillStyle = beard; c.beginPath(); c.ellipse(x, y - s * 0.2, s * 0.55, s * 0.4, 0, 0, PI); c.fill(); }
    c.fillStyle = '#2a2018'; c.fillRect(x - s * 0.3, y - s * 0.7, s * 0.14, s * 0.1); c.fillRect(x + s * 0.16, y - s * 0.7, s * 0.14, s * 0.1);
    if (laugh) { c.fillStyle = '#6a2a2a'; c.beginPath(); c.ellipse(x, y - s * 0.28, s * 0.22, s * 0.14, 0, 0, PI); c.fill(); }
  }
  function paintAtlas(c) {
    c.fillStyle = '#d8d0c0'; c.fillRect(0, 0, 256, 256);
    // notebooks: 31 identical black spines, white label strips "two 1" .. "two 31" (read top to bottom)
    for (let i = 0; i < 31; i++) {
      const x0 = Math.round(i * 256 / 31), x1 = Math.round((i + 1) * 256 / 31), w = x1 - x0;
      c.fillStyle = '#1d1f24'; c.fillRect(x0, 0, w, 64);
      c.fillStyle = '#34373e'; c.fillRect(x0, 0, 1, 64); c.fillStyle = '#0a0b0e'; c.fillRect(x1 - 1, 0, 1, 64);
      c.fillStyle = '#2a2c33'; c.fillRect(x0, 3, w, 1); c.fillRect(x0, 60, w, 1);
      c.fillStyle = '#f2f0e8'; c.fillRect(x0 + 1, 8, w - 2, 36);
      c.save(); c.translate(x0 + w / 2, 26); c.rotate(H); text(c, 'two ' + (i + 1), 0, 0.5, 6.5, '#121419', 'center', 'bold', 34); c.restore();
    }
    // the takeaway menu
    { const X = 0, Y = 64;
      c.fillStyle = '#fbfaf5'; c.fillRect(X, Y, 64, 80);
      c.fillStyle = '#2f6aa8'; c.fillRect(X, Y, 64, 25);
      text(c, 'SEA BREEZE', X + 32, Y + 8, 10, '#ffffff', 'center', 'bold', 61);
      text(c, 'FISH & CHIPS', X + 32, Y + 19, 9, '#f8e6c0', 'center', 'bold', 61);
      c.fillStyle = '#f2a050'; c.beginPath(); c.ellipse(X + 30, Y + 32, 9, 4, 0, 0, TAU); c.fill();
      c.beginPath(); c.moveTo(X + 38, Y + 32); c.lineTo(X + 45, Y + 27.5); c.lineTo(X + 45, Y + 36.5); c.fill();
      c.fillStyle = '#1c2440'; c.fillRect(X + 24, Y + 31, 2, 2);
      for (let i = 0; i < 6; i++) { c.fillStyle = '#7a828c'; c.fillRect(X + 5, Y + 41 + i * 5.4, 30 - ((i * 7) % 11), 2); c.fillStyle = '#c0403a'; c.fillRect(X + 47, Y + 41 + i * 5.4, 12, 2); }
      text(c, '3283 1971', X + 32, Y + 75, 7, '#2f6aa8');
    }
    // the bin-day magnet
    { const X = 64, Y = 64;
      c.fillStyle = '#3a8a4a'; c.beginPath(); c.arc(X + 16, Y + 16, 15.5, 0, TAU); c.fill();
      c.fillStyle = '#e8ece8'; c.fillRect(X + 11, Y + 13, 10, 10); c.fillRect(X + 10, Y + 11, 12, 2.5); c.fillStyle = '#2a2a2a'; c.fillRect(X + 12, Y + 23, 2, 2); c.fillRect(X + 18, Y + 23, 2, 2);
      text(c, 'BIN DAY', X + 16, Y + 7, 6, '#ffffff', 'center', 'bold', 24); text(c, 'TUE', X + 16, Y + 28, 6, '#ffffff');
    }
    // a postcard: REDCLIFFE, a pelican on a post
    { const X = 96, Y = 64;
      const g = c.createLinearGradient(0, Y, 0, Y + 32); g.addColorStop(0, '#8fd0f4'); g.addColorStop(0.62, '#cfeaf6'); g.addColorStop(0.63, '#3d9fc4'); g.addColorStop(1, '#2a7aa8');
      c.fillStyle = g; c.fillRect(X, Y, 32, 32); c.strokeStyle = '#ffffff'; c.lineWidth = 2; c.strokeRect(X + 1, Y + 1, 30, 30);
      c.fillStyle = '#7a6248'; c.fillRect(X + 20, Y + 17, 3, 12);
      c.fillStyle = '#f2f2ee'; c.beginPath(); c.ellipse(X + 21, Y + 14, 4, 3, 0, 0, TAU); c.fill(); c.fillRect(X + 22, Y + 8, 2, 5); c.beginPath(); c.arc(X + 23, Y + 8, 1.6, 0, TAU); c.fill();
      c.fillStyle = '#f0a868'; c.fillRect(X + 24, Y + 7.5, 5, 1.2);
      text(c, 'REDCLIFFE', X + 16, Y + 5.5, 5, '#ffffff', 'center', 'bold', 28);
    }
    // the box of decorations, seen from above: tinsel, a broken angel, sunglasses, baubles (the hat + beard are 3-D)
    { const X = 128, Y = 64;
      c.fillStyle = '#9a7448'; c.fillRect(X, Y, 128, 64);
      c.fillStyle = 'rgba(0,0,0,0.2)'; c.fillRect(X, Y, 128, 4); c.fillRect(X, Y, 4, 64);
      seed = 55;
      for (const [col, y0] of [['#d8323a', 13], ['#c8ccd4', 31], ['#2f9a4a', 49]]) {
        c.strokeStyle = col; c.lineWidth = 4; c.beginPath();
        for (let x = 6; x < 122; x += 3) c.lineTo(X + x, Y + y0 + Math.sin(x * 0.22) * 5 + (rnd() - 0.5) * 2);
        c.stroke();
        c.fillStyle = 'rgba(255,255,255,0.65)'; for (let x = 8; x < 120; x += 6) c.fillRect(X + x, Y + y0 + Math.sin(x * 0.22) * 5 - 1, 2, 2);
      }
      c.fillStyle = '#f6f2ea'; c.beginPath(); c.moveTo(X + 30, Y + 20); c.lineTo(X + 21, Y + 46); c.lineTo(X + 39, Y + 46); c.fill();
      c.fillStyle = '#e8c8a0'; c.beginPath(); c.arc(X + 30, Y + 18, 4.2, 0, TAU); c.fill();
      c.strokeStyle = '#d8b050'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(X + 30, Y + 12.5, 5, 2, 0, 0, TAU); c.stroke();
      c.fillStyle = '#fbfaf4'; c.beginPath(); c.ellipse(X + 22, Y + 27, 7, 3, -0.6, 0, TAU); c.fill();
      c.beginPath(); c.ellipse(X + 48, Y + 52, 7, 3, 0.9, 0, TAU); c.fill();
      c.fillStyle = '#16181c'; c.beginPath(); c.ellipse(X + 84, Y + 41, 8, 6, 0, 0, TAU); c.ellipse(X + 102, Y + 41, 8, 6, 0, 0, TAU); c.fill();
      c.fillRect(X + 90, Y + 39, 6, 2); c.fillStyle = 'rgba(170,210,255,0.45)'; c.fillRect(X + 79, Y + 38, 4, 2); c.fillRect(X + 97, Y + 38, 4, 2);
      for (const [x, y, col] of [[68, 20, '#3a7ae0'], [114, 24, '#d8323a'], [64, 54, '#c8ccd4'], [118, 54, '#2f9a4a']]) { c.fillStyle = col; c.beginPath(); c.arc(X + x, Y + y, 5, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,0.65)'; c.fillRect(X + x - 2, Y + y - 3, 2, 2); }
    }
    // the order of service, open: Celebrating the life of LUKA · "I'll do it." · Redcliffe · January 2035 · a photo
    { const X = 64, Y = 96;
      c.fillStyle = '#f3ecdc'; c.fillRect(X, Y, 64, 48);
      c.fillStyle = 'rgba(0,0,0,0.14)'; c.fillRect(X + 31, Y, 2, 48);
      text(c, 'Celebrating the life of', X + 16, Y + 8, 4.5, '#6a6458', 'center', 'italic', 29);
      text(c, 'LUKA', X + 16, Y + 18, 10, '#2a2620', 'center', 'bold', 29);
      text(c, '“I’ll do it.”', X + 16, Y + 29, 5.5, '#4a443a', 'center', 'italic bold', 29);
      text(c, 'Redcliffe · January 2035', X + 16, Y + 40, 4, '#6a6458', 'center', 'normal', 29);
      c.fillStyle = '#c8b898'; c.fillRect(X + 36, Y + 6, 24, 34);
      c.save(); c.beginPath(); c.rect(X + 36, Y + 6, 24, 34); c.clip();
      figure(c, X + 48, Y + 30, 6, '#6a5a4a', '#4a5a6a', '#7a6a5a', true);
      c.restore();
    }
    // the plan: three sticky notes (one per step)
    const PLAN = [['1. OFF THE', 'PENINSULA'], ['2. VALLEY', 'BY MON AM'], ['3. HQ —', 'UNSEEN']], PC = ['#f4ec9a', '#f7a8c0', '#a8e8c8'];
    for (let k = 0; k < 3; k++) {
      const [X, Y] = A_PLAN[k];
      c.fillStyle = PC[k]; c.fillRect(X, Y, 40, 32); c.fillStyle = 'rgba(0,0,0,0.08)'; c.fillRect(X, Y, 40, 5);
      text(c, PLAN[k][0], X + 20, Y + 13, 8, '#141a36', 'center', 'bold', 37); text(c, PLAN[k][1], X + 20, Y + 24, 8, '#141a36', 'center', 'bold', 37);
    }
    // the folded card under the pelican: cream, a faint grey script
    { const X = 0, Y = 144;
      c.fillStyle = '#efe6d2'; c.fillRect(X, Y, 64, 44);
      c.strokeStyle = 'rgba(130,118,100,0.55)'; c.lineWidth = 1; c.strokeRect(X + 3.5, Y + 3.5, 57, 37);
      seed = 9; c.strokeStyle = 'rgba(120,114,104,0.5)';
      for (let r = 0; r < 3; r++) { c.beginPath(); const y = Y + 15 + r * 8, w = r === 1 ? 40 : 30; c.moveTo(X + 32 - w / 2, y); for (let x = -w / 2; x <= w / 2; x += 2) c.lineTo(X + 32 + x, y + Math.sin(x * 0.9 + r) * 1.4 + (rnd() - 0.5)); c.stroke(); }
    }
    // toast (top): golden crumb, a darker crust
    { const X = 64, Y = 144; c.fillStyle = '#9a6a34'; c.fillRect(X, Y, 32, 32); c.fillStyle = '#d8a860'; c.fillRect(X + 3, Y + 3, 26, 26);
      seed = 12; for (let i = 0; i < 40; i++) { c.fillStyle = rnd() > 0.5 ? 'rgba(160,110,50,0.5)' : 'rgba(240,200,130,0.5)'; c.fillRect(X + 3 + rnd() * 25, Y + 3 + rnd() * 25, 2, 2); }
      c.fillStyle = 'rgba(250,236,170,0.75)'; c.fillRect(X + 8, Y + 9, 14, 9);   // butter
    }
    // a white label strip (chips paper stamp): SEA BREEZE
    { const X = 96, Y = 144; c.fillStyle = '#f4f2ec'; c.fillRect(X, Y, 32, 16); text(c, 'SEA BREEZE', X + 16, Y + 8, 5, '#2f6aa8', 'center', 'bold', 30); }
    // the framed photo, 2031: Chase (2040) and Luka behind a festival barrier, Luka wearing Chase's ARTIST lanyard
    { const X = 128, Y = 160;
      c.fillStyle = '#2b2622'; c.fillRect(X, Y, 128, 96);
      c.fillStyle = '#efe8d8'; c.fillRect(X + 5, Y + 5, 118, 86);
      const x0 = X + 10, y0 = Y + 10, W = 108, Hh = 76;
      const g = c.createLinearGradient(0, y0, 0, y0 + Hh); g.addColorStop(0, '#86c4ec'); g.addColorStop(0.55, '#f6deb4'); g.addColorStop(1, '#e8c890');
      c.fillStyle = g; c.fillRect(x0, y0, W, Hh);
      c.save(); c.beginPath(); c.rect(x0, y0, W, Hh); c.clip();
      c.fillStyle = '#5a5e66'; c.fillRect(x0 + 6, y0 + 4, 2, 34); c.fillRect(x0 + 92, y0 + 4, 2, 34); c.fillRect(x0 + 6, y0 + 4, 88, 2);   // the stage truss
      c.fillStyle = '#d8504a'; c.fillRect(x0 + 18, y0 + 9, 64, 8); text(c, 'REDCLIFFE FESTIVAL 2031', x0 + 50, y0 + 13.5, 5, '#ffffff', 'center', 'bold', 62);
      c.fillStyle = '#4a7a3a'; c.beginPath(); c.arc(x0 + 100, y0 + 20, 9, 0, TAU); c.fill(); c.fillStyle = '#6a5038'; c.fillRect(x0 + 99, y0 + 24, 2, 20);
      figure(c, x0 + 36, y0 + 46, 11, '#6a4a2e', '#1e2026', null, false);          // Chase (2040) at 31: shaggy brown hair, black tee
      c.fillStyle = '#6a4a2e'; c.fillRect(x0 + 26, y0 + 28, 4, 12); c.fillRect(x0 + 42, y0 + 29, 4, 10);
      figure(c, x0 + 70, y0 + 44, 11, '#3a2a20', '#3a5a8a', '#4a3424', true);        // Luka (older): beard, laughing
      c.strokeStyle = '#d8323a'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x0 + 62, y0 + 50); c.lineTo(x0 + 70, y0 + 62); c.lineTo(x0 + 78, y0 + 50); c.stroke();
      c.fillStyle = '#f4f4f4'; c.fillRect(x0 + 64, y0 + 61, 12, 9); c.fillStyle = '#d8323a'; c.fillRect(x0 + 64, y0 + 61, 12, 3);
      text(c, 'ARTIST', x0 + 70, y0 + 67, 3.5, '#1c1c1c', 'center', 'bold', 12);
      c.strokeStyle = '#9aa0a8'; c.lineWidth = 2; for (let x = 0; x < W; x += 6) { c.beginPath(); c.moveTo(x0 + x, y0 + 62); c.lineTo(x0 + x, y0 + Hh); c.stroke(); }
      c.fillStyle = '#b8bec4'; c.fillRect(x0, y0 + 60, W, 3); c.fillRect(x0, y0 + 70, W, 2);
      c.restore();
    }
  }
  function paintSlate(c, w, h, mode) {   // the music slate's screen, 256 x 160
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.fillStyle = '#0e1626'; c.fillRect(0, 0, w, h);
    if (mode === 'off') {
      c.fillStyle = 'rgba(191,230,255,0.08)'; c.beginPath(); c.moveTo(30, 0); c.lineTo(120, 0); c.lineTo(50, h); c.lineTo(-40, h); c.fill();
      c.fillStyle = 'rgba(191,230,255,0.04)'; c.beginPath(); c.moveTo(140, 0); c.lineTo(160, 0); c.lineTo(90, h); c.lineTo(70, h); c.fill();
      c.fillStyle = '#bfe6ff'; c.beginPath(); c.arc(w - 16, h - 14, 4, 0, TAU); c.fill();   // standby
      return;
    }
    c.fillStyle = '#16233a'; c.fillRect(0, 0, w, 24);
    text(c, 'SLATE', 10, 12, 11, '#bfe6ff', 'left'); text(c, '4:58 am', w - 10, 12, 11, '#bfe6ff', 'right', 'normal');
    if (mode === 'folder') {
      c.strokeStyle = '#bfe6ff'; c.lineWidth = 3; c.fillStyle = 'rgba(191,230,255,0.12)';
      c.beginPath(); c.moveTo(78, 52); c.lineTo(108, 52); c.lineTo(116, 60); c.lineTo(178, 60); c.lineTo(178, 112); c.lineTo(78, 112); c.closePath(); c.fill(); c.stroke();
      text(c, 'two', 128, 88, 26, '#ffffff');
      text(c, '2,847 items', 128, 134, 17, '#bfe6ff');
    } else if (mode === 'list') {
      c.fillStyle = '#1d2a36'; c.fillRect(0, 24, w, 22); text(c, 'two  ·  2,847 items', 10, 35, 13, '#d8e6f0', 'left');
      const L = ['two_v1.wav', 'two_v2_FINAL.wav', 'two_v2_FINAL_real.wav', 'two_v3_bridge_idea.wav', '…', 'two_v1204_dont.wav', '…', 'two_v2847.wav'];
      for (let i = 0; i < L.length; i++) { c.fillStyle = i % 2 ? '#13191f' : '#0f1418'; c.fillRect(0, 47 + i * 14, w, 14); text(c, L[i], 12, 54 + i * 14, 10.5, i === 7 ? '#ffffff' : '#9fb6c8', 'left', 'normal'); }
    } else {   // play: the latest take, a waveform and a play button
      text(c, 'two_v2847.wav', w / 2, 40, 14, '#d8e6f0');
      c.fillStyle = '#bfe6ff'; seed = 5;
      for (let x = 14; x < w - 14; x += 4) { const a = 4 + Math.abs(Math.sin(x * 0.05) * 22 + Math.sin(x * 0.19) * 9) * (0.6 + rnd() * 0.4); c.fillRect(x, 82 - a / 2, 2.5, a); }
      c.beginPath(); c.arc(w / 2, 128, 15, 0, TAU); c.fill(); c.fillStyle = '#0e1626'; c.beginPath(); c.moveTo(w / 2 - 5, 120); c.lineTo(w / 2 + 8, 128); c.lineTo(w / 2 - 5, 136); c.fill();
    }
  }
  function textures() {
    if (T) return T;
    T = {};
    const K = (k, o) => Object.assign({ key: 'flat_' + k, nearest: true }, o);
    const noise = (base, cols, n, s, sz = 2) => (c, w, h) => { c.fillStyle = base; c.fillRect(0, 0, w, h); seed = s; for (let i = 0; i < n; i++) { c.fillStyle = cols[Math.floor(rnd() * cols.length)]; c.fillRect(Math.floor(rnd() * w), Math.floor(rnd() * h), sz, sz); } };
    T.hero = canvasTex(256, 256, paintHero, K('hero'));
    T.fill = canvasTex(128, 128, paintFill, K('fill', { repeat: [1, 1] }));
    T.atlas = canvasTex(256, 256, paintAtlas, K('atlas'));
    T.keys = canvasTex(128, 32, (c) => {   // one octave, front edge at the canvas top (v up = the room side)
      c.fillStyle = '#f0e9d8'; c.fillRect(0, 0, 128, 32);
      const kw = 128 / 7;
      for (let i = 0; i <= 7; i++) { c.fillStyle = '#9c9686'; c.fillRect(Math.round(i * kw), 0, 1, 32); }
      c.fillStyle = 'rgba(255,255,255,0.55)'; c.fillRect(0, 0, 128, 2);
      for (const i of [1, 2, 4, 5, 6]) { const x = Math.round(i * kw) - 5; c.fillStyle = '#17181b'; c.fillRect(x, 13, 10, 19); c.fillStyle = '#3c3e44'; c.fillRect(x + 1, 13, 8, 2); }
      seed = 77; for (let i = 0; i < 60; i++) { c.fillStyle = 'rgba(140,132,118,0.3)'; c.fillRect(Math.floor(rnd() * 128), Math.floor(rnd() * 32), 1, 1); }
    }, K('keys', { repeat: [1, 1] }));
    T.dust = canvasTex(64, 16, (c) => {   // the thin grey line where a hand used to rest
      c.clearRect(0, 0, 64, 16);
      const g = c.createLinearGradient(0, 3, 0, 13); g.addColorStop(0, 'rgba(110,104,96,0)'); g.addColorStop(0.5, 'rgba(96,90,84,0.9)'); g.addColorStop(1, 'rgba(110,104,96,0)');
      c.fillStyle = g; c.fillRect(4, 3, 56, 10); c.clearRect(0, 0, 4, 16); c.clearRect(60, 0, 4, 16);
      seed = 3; for (let i = 0; i < 40; i++) { c.fillStyle = 'rgba(90,86,80,0.6)'; c.fillRect(6 + rnd() * 52, 5 + rnd() * 6, 1, 1); }
    }, K('dust'));
    T.sheet = canvasTex(64, 64, (c) => {   // a grey dust sheet: big soft folds, a little dust
      c.fillStyle = '#d0d0ca'; c.fillRect(0, 0, 64, 64);
      for (const [x0, w, k] of [[4, 18, 0.12], [26, 10, -0.1], [40, 20, 0.1], [58, 12, -0.08]]) {
        const g = c.createLinearGradient(x0, 0, x0 + w, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, k > 0 ? `rgba(255,255,255,${k})` : `rgba(70,70,64,${-k})`); g.addColorStop(1, 'rgba(255,255,255,0)');
        c.fillStyle = g; c.fillRect(x0, 0, w, 64);
      }
      seed = 21; for (let i = 0; i < 70; i++) { c.fillStyle = 'rgba(150,146,136,0.3)'; c.fillRect(Math.floor(rnd() * 64), Math.floor(rnd() * 64), 1, 1); }
    }, K('sheet', { repeat: [1, 1] }));
    T.floor = canvasTex(64, 64, (c) => {   // timber boards (4 per tile), staggered end joints
      seed = 4;
      for (let r = 0; r < 4; r++) {
        const y = r * 16, base = [154, 118, 86];
        for (let k = -1; k < 2; k++) {
          const x = k * 40 + r * 13, sh = 0.88 + rnd() * 0.22;
          c.fillStyle = `rgb(${base[0] * sh | 0},${base[1] * sh | 0},${base[2] * sh | 0})`; c.fillRect(x, y, 40, 16);
          c.fillStyle = 'rgba(70,46,26,0.22)'; for (let g = 0; g < 4; g++) c.fillRect(x, y + 3 + g * 3 + rnd() * 2, 40, 1);
          c.fillStyle = '#5a3e26'; c.fillRect(x, y, 1, 16);
        }
        c.fillStyle = '#5e4229'; c.fillRect(0, y + 15, 64, 1);
      }
    }, K('floor', { repeat: [1, 1] }));
    T.tiles = canvasTex(64, 64, (c) => {   // white tiles + grey grout (tinted by vertex colour: blue splashback, terracotta balcony)
      c.fillStyle = '#9a9690'; c.fillRect(0, 0, 64, 64); seed = 8;
      for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) { const v = 236 + rnd() * 19 | 0; c.fillStyle = `rgb(${v},${v},${v})`; c.fillRect(k * 16 + 1, r * 16 + 1, 15, 15); c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(k * 16 + 2, r * 16 + 2, 5, 1); }
    }, K('tiles', { repeat: [1, 1] }));
    T.curtain = canvasTex(64, 64, (c) => {
      c.clearRect(0, 0, 64, 64);
      for (let x = 0; x < 64; x++) { const a = 0.42 + 0.22 * Math.sin(x / 64 * TAU * 3) + 0.08 * Math.sin(x * 1.7); c.fillStyle = `rgba(250,248,240,${a.toFixed(3)})`; c.fillRect(x, 0, 1, 64); }
      c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(0, 60, 64, 4);
    }, K('curtain', { repeat: [1, 1] }));
    T.brick = canvasTex(64, 64, (c, w, h) => {
      c.fillStyle = '#8a4c3a'; c.fillRect(0, 0, w, h); seed = 21;
      for (let r = 0; r < 8; r++) for (let k = -1; k < 4; k++) { const x = k * 16 + (r % 2) * 8, y = r * 8; c.fillStyle = `rgb(${168 + rnd() * 24 | 0},${92 + rnd() * 18 | 0},${68 + rnd() * 14 | 0})`; c.fillRect(x + 1, y + 1, 14, 6); }
    }, K('brick', { repeat: [1, 1] }));
    T.ripple = canvasTex(128, 128, (c, w, h) => {
      c.fillStyle = '#e6f2f6'; c.fillRect(0, 0, w, h); seed = 17;
      for (let i = 0; i < 160; i++) { const x = rnd() * w, y = rnd() * h, l = 6 + rnd() * 18; c.fillStyle = rnd() > 0.45 ? 'rgba(170,205,222,0.7)' : 'rgba(255,255,255,0.85)'; c.fillRect(x, y, l, 2); c.fillRect(x - w, y, l, 2); }
    }, K('ripple', { repeat: [1, 1] }));
    T.grass = canvasTex(64, 64, noise('#9cc262', ['#88b052', '#a8cc6c', '#7ea44a', '#b4d478'], 520, 3), K('grass', { repeat: [1, 1] }));
    T.sand = canvasTex(64, 64, noise('#efe2b6', ['#e4d4a2', '#f6ecc8', '#dccb98', '#fff6dc'], 420, 9), K('sand', { repeat: [1, 1] }));
    T.cloud = canvasTex(128, 64, (c, w, h) => {   // a cumulus: one soft union of puffs, lit from above
      c.clearRect(0, 0, w, h);
      const P_ = [[30, 42, 15], [50, 33, 20], [76, 30, 19], [97, 40, 14], [63, 44, 17], [42, 48, 11], [86, 48, 11]];
      c.filter = 'blur(1.5px)';
      const g = c.createLinearGradient(0, 10, 0, 58); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.6, 'rgba(236,240,246,1)'); g.addColorStop(1, 'rgba(196,206,220,1)');
      c.fillStyle = g; c.beginPath(); for (const [x, y, r] of P_) { c.moveTo(x + r, y); c.arc(x, y, r, 0, TAU); } c.rect(26, 44, 76, 10); c.fill();
      c.filter = 'none';
      const g2 = c.createLinearGradient(0, 40, 0, 60); g2.addColorStop(0, 'rgba(255,255,255,1)'); g2.addColorStop(1, 'rgba(255,255,255,0)');
      c.globalCompositeOperation = 'destination-in'; c.fillStyle = g2; c.fillRect(0, 40, w, 24); c.globalCompositeOperation = 'source-over';
    }, K('cloud'));
    T.storm = canvasTex(128, 64, (c, w, h) => {   // a low dark storm bank: a lumpy top lit pink along its rim, soft ends and foot
      c.clearRect(0, 0, w, h); seed = 61;
      const B = []; for (let i = 0; i < 12; i++) B.push([-4 + i * 12 + (rnd() - 0.5) * 6, 26 + (rnd() - 0.5) * 12 - Math.sin(i / 11 * PI) * 6, 8 + rnd() * 7]);
      const mass = (fill, dy) => { c.fillStyle = fill; c.beginPath(); for (const [x, y, r] of B) { c.moveTo(x + r, y + dy); c.arc(x, y + dy, r, 0, TAU); } c.rect(0, 30 + dy, w, h); c.fill(); };
      c.filter = 'blur(1px)';
      mass('rgba(240,176,186,1)', 0);
      const g = c.createLinearGradient(0, 14, 0, h); g.addColorStop(0, '#6a6280'); g.addColorStop(0.5, '#4e4a64'); g.addColorStop(1, '#3e3c52');
      mass(g, 2.5);
      c.filter = 'none';
      c.globalCompositeOperation = 'destination-in';
      const gx = c.createLinearGradient(0, 0, w, 0); gx.addColorStop(0, 'rgba(0,0,0,0)'); gx.addColorStop(0.16, 'rgba(0,0,0,1)'); gx.addColorStop(0.84, 'rgba(0,0,0,1)'); gx.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = gx; c.fillRect(0, 0, w, h);
      const gy = c.createLinearGradient(0, 0, 0, h); gy.addColorStop(0, 'rgba(0,0,0,1)'); gy.addColorStop(0.72, 'rgba(0,0,0,1)'); gy.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = gy; c.fillRect(0, 0, w, h);
      c.globalCompositeOperation = 'source-over';
    }, K('storm'));
    T.foam = canvasTex(64, 32, (c, w, h) => {
      c.clearRect(0, 0, w, h); seed = 2;
      for (let i = 0; i < 120; i++) { const x = rnd() * w, y = 8 + rnd() * 16 + Math.sin(x * 0.2) * 3; c.fillStyle = `rgba(255,255,255,${(0.4 + rnd() * 0.5).toFixed(2)})`; c.beginPath(); c.arc(x, y, 1.2 + rnd() * 2.4, 0, TAU); c.fill(); }
    }, K('foam', { repeat: [1, 1] }));
    T.halo = canvasTex(64, 64, (c, w, h) => { const g = c.createRadialGradient(32, 32, 2, 32, 32, 31); g.addColorStop(0, 'rgba(255,255,250,1)'); g.addColorStop(0.2, 'rgba(255,248,228,0.8)'); g.addColorStop(0.5, 'rgba(255,236,206,0.25)'); g.addColorStop(1, 'rgba(255,230,200,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); }, { key: 'flat_halo' });
    T.haze = canvasTex(4, 64, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.75, 'rgba(255,255,255,0.35)'); g.addColorStop(1, 'rgba(255,255,255,1)'); c.fillStyle = g; c.fillRect(0, 0, w, h); }, { key: 'flat_haze' });
    T.sleeve = canvasTex(64, 64, (c, w, h) => {   // fairy lights spiralling round a palm trunk
      c.clearRect(0, 0, w, h);
      for (let k = -2; k < 3; k++) { c.strokeStyle = 'rgba(30,40,30,0.9)'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, k * 32 + 64); c.lineTo(64, k * 32); c.stroke(); }
      const cols = ['#fff1d0', '#ff5050', '#5ad070', '#7aa8ff'];
      for (let k = -2; k < 3; k++) for (let i = 0; i < 8; i++) { const x = i * 8 + 4, y = k * 32 + 64 - x; c.fillStyle = cols[(i + k + 8) % 4]; c.beginPath(); c.arc(x, y, 2.8, 0, TAU); c.fill(); }
    }, K('sleeve', { repeat: [2, 3] }));
    T.z = canvasTex(32, 32, (c) => {
      c.clearRect(0, 0, 32, 32);
      for (const [s, x, y] of [[15, 9, 21], [10, 21, 11]]) { c.font = FONT(s); c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 3; c.strokeStyle = 'rgba(30,40,70,0.8)'; c.strokeText('z', x, y); c.fillStyle = '#e8f2ff'; c.fillText('z', x, y); }
    }, K('z'));
    return T;
  }

  // ---------------------------------------------------------- materials (all cached: mat()/matTex(), or created once here)
  function skyMats() {
    if (SKY) return SKY;
    const B = (o) => new THREE.MeshBasicMaterial(Object.assign({ fog: false }, o)), ADD = THREE.AdditiveBlending;
    SKY = {
      dome: B({ vertexColors: true, side: THREE.BackSide, depthWrite: false }),
      land: B({ vertexColors: true, side: DS }),
      skirt: B({ color: 0x2c3a66, side: DS }),
      haze: B({ map: T.haze, transparent: true, depthWrite: false, side: DS, color: 0x2c3a66 }),
      bridge: B({ vertexColors: true }),
      bLamp: B({ color: 0xfff1d0, transparent: true, opacity: 0.9, depthWrite: false }),
      bDrone: B({ color: 0x9fdcff }),
      sun: B({ color: 0xfff6e0 }),
      halo: B({ map: T.halo, color: 0xffe0b0, transparent: true, opacity: 0.9, depthWrite: false, blending: ADD }),
      cloud: B({ map: T.cloud, transparent: true, depthWrite: false, side: DS }),
      storm: B({ map: T.storm, transparent: true, depthWrite: false, side: DS }),
      // lit things (fogged, unlit): street + jetty lamp heads, car lights, palm sleeves, the three bulb phases
      head: new THREE.MeshBasicMaterial({ color: 0xffffff }),
      carGlow: new THREE.MeshBasicMaterial({ color: 0xffffff, vertexColors: true }),
      sleeveA: new THREE.MeshBasicMaterial({ map: T.sleeve, transparent: true, depthWrite: false, side: DS }),
      sleeveB: new THREE.MeshBasicMaterial({ map: T.sleeve, transparent: true, depthWrite: false, side: DS }),
      ph: [new THREE.MeshBasicMaterial({ color: 0xffffff }), new THREE.MeshBasicMaterial({ color: 0xffffff }), new THREE.MeshBasicMaterial({ color: 0xffffff })],
    };
    return SKY;
  }
  function initMats() {
    M = {
      vc: mat(0xffffff),
      ext: mat(0xffffff, { key: 'flat_ext' }),                       // exterior statics (tinted per env)
      extI: mat(0xffffff, { key: 'flat_ext_i' }),                    // exterior instanced repeats (tinted per env)
      car: mat(0xffffff, { key: 'flat_car' }),                       // hover-car bodies (instanced + per-car colour)
      brick: matTex(T.brick, { key: 'flat_brick' }),
      ceil: mat(0xffffff, { emissive: 0x4a443c, emissiveIntensity: 1, key: 'flat_ceil' }),   // the ceiling's bounce light (per env)
      floor: matTex(T.floor), tiles: matTex(T.tiles),
      hero: matTex(T.hero, { emissive: 0xffffff, emissiveIntensity: 0.24 }),
      fill: matTex(T.fill, { emissive: 0xffffff, emissiveIntensity: 0.2 }),
      atlas: matTex(T.atlas, { emissive: 0xffffff, emissiveIntensity: 0.16 }),
      keys: matTex(T.keys), dust: matTex(T.dust, { transparent: true }), sheet: matTex(T.sheet),
      glass: mat(0xd8eef6, { transparent: true, opacity: 0.2, side: DS }),
      curtain: matTex(T.curtain, { transparent: true, side: DS }),
      pend: mat(0x000000, { emissive: 0xffd8a0, emissiveIntensity: 1, key: 'flat_pend' }),
      lamp: mat(0x000000, { emissive: 0xffd8a0, emissiveIntensity: 1, key: 'flat_desklamp' }),
      bulb: mat(0x000000, { emissive: 0xffe2b0, emissiveIntensity: 0.7, key: 'flat_landing' }),
      backWin: mat(0x000000, { emissive: 0x182030, emissiveIntensity: 1, key: 'flat_backwin' }),
      winLit: mat(0x000000, { emissive: 0xffd49a, emissiveIntensity: 0.9, key: 'flat_winlit' }),
      zz: matTex(T.z, { transparent: true, emissive: 0xffffff, emissiveIntensity: 0.6, key: 'flat_zz' }),
      water: matTex(T.ripple, { emissive: 0xffffff, emissiveIntensity: 1, key: 'flat_water' }),
      foam: matTex(T.foam, { transparent: true, key: 'flat_foam' }),
      grass: matTex(T.grass, { key: 'flat_grass' }), sand: matTex(T.sand, { key: 'flat_sand' }),
    };
    skyMats();
  }

  // ---------------------------------------------------------- the shell: floors, walls, ceiling, doors' frames, window
  function trimFrame(x0, x1, y1, z, face) {   // architrave round a door opening on a wall face at z (face +1 = +Z side)
    const t = 0.02 * face, w = 0.07;
    bb(x0 - w, 0, Math.min(z, z + t), x0, y1 + w, Math.max(z, z + t), TRIM);
    bb(x1, 0, Math.min(z, z + t), x1 + w, y1 + w, Math.max(z, z + t), TRIM);
    bb(x0 - w, y1, Math.min(z, z + t), x1 + w, y1 + w, Math.max(z, z + t), TRIM);
  }
  function kick(x0, z0, x1, z1) { bb(x0, 0, z0, x1, 0.08, z1, TRIM); }   // skirting board
  function shell() {
    tint = IN;
    // floors (timber boards everywhere; the landing duller)
    gnd(-4.0, -3.6, 4.0, 0.0, 0, M.floor, 0.8);
    gnd(-4.0, -6.4, 0.9, -3.6, 0, M.floor, 0.8);
    gnd(0.9, -4.8, 2.4, -3.6, 0, M.floor, 0.8, 0xcfc4b8);
    gnd(2.4, -6.4, 4.0, -3.6, 0, M.floor, 0.8, 0xbfb4a8);
    // ceiling
    quad(8.4, 6.6, M.ceil, 0, 2.6, -3.25, 0, H, CEIL);
    // outer walls (cream inside; the front face outside is brick)
    bb(-4.2, 0, -6.6, -4.0, 2.6, 0.15, WALL); bb(4.0, 0, -6.6, 4.2, 2.6, 0.15, WALL);
    bb(-4.0, 0, -6.6, -3.2, 2.6, -6.4, WALL); bb(-2.0, 0, -6.6, 4.0, 2.6, -6.4, WALL);
    bb(-3.2, 0, -6.6, -2.0, 1.2, -6.4, WALL); bb(-3.2, 1.9, -6.6, -2.0, 2.6, -6.4, WALL);   // round the back window
    COL.push([-4.2, -6.6, 4.2, -6.4], [-4.2, -6.6, -4.0, 0], [4.0, -6.6, 4.2, 0]);
    // front wall z 0..0.15: balcony slider x -3.4..-1.0 (h 2.1), kitchen window x 1.4..3.4 (sill 0.95, head 2.1)
    bb(-4.2, 0, 0, -3.4, 2.6, 0.15, WALL); bb(-3.4, 2.1, 0, -1.0, 2.6, 0.15, WALL); bb(-1.0, 0, 0, 1.4, 2.6, 0.15, WALL);
    bb(1.4, 0, 0, 3.4, 0.95, 0.15, WALL); bb(1.4, 2.1, 0, 3.4, 2.6, 0.15, WALL); bb(3.4, 0, 0, 4.2, 2.6, 0.15, WALL);
    COL.push([-4.2, 0, -3.4, 0.15], [-1.0, 0, 1.4, 0.15], [3.4, 0, 4.2, 0.15], [1.4, 0, 3.4, 0.15]);
    R.colDoor = [-3.4, 0, -1.0, 0.15]; COL.push(R.colDoor);                                     // the slider's panels (update writes it)
    // the facade outside (brick) round the openings, up to the parapet; white sills/heads
    const br = (x0, x1, y0, y1) => wallT(x0, 0.152, x1, 0.152, y0, y1, 'z+', M.brick, 1.0);
    br(-4.2, -3.4, -0.6, 2.6); br(-1.0, 1.4, -0.6, 2.6); br(3.4, 4.2, -0.6, 2.6); br(-3.4, -1.0, 2.1, 2.6); br(1.4, 3.4, -0.6, 0.95); br(1.4, 3.4, 2.1, 2.6);
    br(-4.2, 4.2, 2.6, 3.86); bb(-4.22, 3.84, -0.2, 4.22, 4.02, 0.3, 0xd8cfc0);                  // parapet + coping
    bb(1.32, 0.88, 0.15, 3.48, 0.95, 0.3, TRIM);                                                  // outside sill
    // partition z -3.65..-3.55: bedroom door x -1.4..-0.5, entry door x 1.2..2.1 (lintels at 2.1)
    bb(-4.0, 0, -3.65, -1.4, 2.6, -3.55, WALL); bb(-1.4, 2.1, -3.65, -0.5, 2.6, -3.55, WALL); bb(-0.5, 0, -3.65, 1.2, 2.6, -3.55, WALL);
    bb(1.2, 2.1, -3.65, 2.1, 2.6, -3.55, WALL); bb(2.1, 0, -3.65, 4.0, 2.6, -3.55, WALL);
    COL.push([-4.0, -3.65, -1.4, -3.55], [-0.5, -3.65, 1.2, -3.55], [2.1, -3.65, 4.0, -3.55]);
    gnd(-1.4, -3.65, -0.5, -3.55, 0.004, M.vc, 1, 0x7a5a3e); gnd(1.2, -3.65, 2.1, -3.55, 0.004, M.vc, 1, 0x7a5a3e);   // thresholds
    // door frames: jamb linings in the openings + architraves both faces (the jamb at x -1.4 is real: s21_hand_frame)
    for (const [x0, x1] of [[-1.4, -0.5], [1.2, 2.1]]) {
      bb(x0, 0, -3.66, x0 + 0.02, 2.1, -3.54, TRIM); bb(x1 - 0.02, 0, -3.66, x1, 2.1, -3.54, TRIM); bb(x0, 2.08, -3.66, x1, 2.1, -3.54, TRIM);
      trimFrame(x0, x1, 2.1, -3.55, 1); trimFrame(x0, x1, 2.1, -3.65, -1);
    }
    // bedroom | landing divider (x 0.85..0.95) and the bathroom wall (x 2.4..2.5); both run down the stairwell
    bb(0.85, -3.6, -6.4, 0.95, 2.6, -3.65, WALL); bb(2.4, -3.6, -6.4, 2.5, 2.6, -3.65, WALL);
    COL.push([0.85, -6.4, 0.95, -3.65], [2.4, -6.4, 2.5, -3.6], [0.9, -6.4, 2.4, -4.8]);
    // skirting boards
    kick(-4.0, -3.55, -3.985, 0); kick(3.985, -3.55, 4.0, 0); kick(-4.0, -0.015, -3.4, 0); kick(-1.0, -0.015, 1.4, 0); kick(3.4, -0.015, 4.0, 0);
    kick(-4.0, -3.55, -1.47, -3.535); kick(-0.43, -3.55, 1.13, -3.535); kick(2.17, -3.55, 4.0, -3.535);
    kick(-4.0, -6.4, -3.985, -3.65); kick(-4.0, -6.4, 0.85, -6.385); kick(-4.0, -3.665, -1.47, -3.65); kick(-0.43, -3.665, 0.85, -3.65); kick(0.835, -6.4, 0.85, -3.65);
    // ceiling fittings: oyster lights (off) + a SafeSense ceiling puck with a sticky note over its eye
    cyl(0.2, 0.22, 0.05, 14, 0xf6f4ee, -1.9, 2.575, -1.8); cyl(0.17, 0.2, 0.05, 14, 0xf6f4ee, -1.6, 2.575, -5.0);
    cyl(0.06, 0.07, 0.03, 12, 0xf2f4f6, 0.4, 2.585, -1.2); noteOn('up', 0.4, 2.568, -1.2, 0.075, 0.3, NOTE[4], false);
    // power points + switches
    for (const [x, z, f] of [[-2.2, -3.548, 'z+'], [3.0, -3.548, 'z+'], [-3.6, -6.398, 'z+']]) bb(x - 0.06, 0.3, z - 0.004, x + 0.06, 0.38, z + 0.008, 0xf6f4ee);
    for (const [x, z] of [[2.35, -3.548], [-0.3, -3.548]]) bb(x - 0.04, 1.2, z - 0.004, x + 0.04, 1.32, z + 0.008, 0xf6f4ee);
  }

  // ---------------------------------------------------------- the kitchen window, the balcony
  function windowAndBalcony() {
    // kitchen louvre window x 1.4..3.4, sill 0.95, head 2.1: aluminium frame, mullion at x 2.4, glass blades in clips
    bb(1.4, 0.95, 0.01, 3.4, 0.99, 0.14, ALU); bb(1.4, 2.06, 0.01, 3.4, 2.1, 0.14, ALU);
    bb(1.4, 0.95, 0.01, 1.44, 2.1, 0.14, ALU); bb(3.36, 0.95, 0.01, 3.4, 2.1, 0.14, ALU); bb(2.38, 0.95, 0.01, 2.42, 2.1, 0.14, ALU);
    for (let y = 1.04; y < 2.04; y += 0.094) for (const [x0, x1] of [[1.44, 2.38], [2.42, 3.36]]) {
      boxR(x1 - x0 - 0.02, 0.1, 0.004, 0xffffff, (x0 + x1) / 2, y, 0.075, 0.42, 0, 0, M.glass);
      bb(x0, y - 0.045, 0.06, x0 + 0.014, y + 0.045, 0.09, ALU); bb(x1 - 0.014, y - 0.045, 0.06, x1, y + 0.045, 0.09, ALU);
    }
    bb(1.32, 0.92, -0.12, 3.48, 0.952, 0.0, LAMI);                                                  // inside sill
    bb(2.3, 1.9, 0.012, 2.5, 1.95, 0.02, ALU); bb(2.38, 1.6, 0.012, 2.42, 1.95, 0.02, ALU);           // the winder handle
    // the sill: a dead basil in a pot, a jar of pens
    cyl(0.06, 0.05, 0.1, 8, 0xb06a48, 1.75, 1.0, -0.05); for (let i = 0; i < 5; i++) boxR(0.01, 0.12, 0.01, 0x7a7a3a, 1.75 + (i - 2) * 0.015, 1.1, -0.05, 0, 0, (i - 2) * 0.35);
    for (let i = 0; i < 5; i++) ico(0.022, i % 2 ? 0x8a7a40 : 0x6a6a34, 1.75 + (i - 2) * 0.035, 1.17 - Math.abs(i - 2) * 0.03, -0.05, 0.4);
    cyl(0.035, 0.035, 0.1, 8, 0x3a6a8a, 3.1, 1.0, -0.05); for (let i = 0; i < 3; i++) cyl(0.004, 0.004, 0.12, 4, [0x1a1a1a, 0xd8323a, 0x2a5aa8][i], 3.09 + i * 0.012, 1.08, -0.05, 0, (i - 1) * 0.12);
    // eave over the window outside (parade x 33.2..35.6, y 5.95..6.05)
    bb(1.2, 2.35, 0.15, 3.6, 2.45, 0.6, 0x4a4e56); bb(1.2, 2.3, 0.56, 3.6, 2.45, 0.6, 0x3a3e44);
    // balcony slider frame (the panels are the prop balcony_door): head, sill track, jambs
    bb(-3.42, 2.06, 0.01, -0.98, 2.1, 0.14, ALU); bb(-3.42, 0, 0.01, -0.98, 0.025, 0.14, ALU); bb(-3.42, 0, 0.01, -3.38, 2.1, 0.14, ALU); bb(-1.02, 0, 0.01, -0.98, 2.1, 0.14, ALU);
    // the curtain rod (the sheer is the prop curtain)
    cyl(0.012, 0.012, 3.0, 6, 0xd8d4cc, -2.2, 2.24, -0.07, 0, H); for (const x of [-3.6, -0.8]) bb(x - 0.01, 2.2, -0.08, x + 0.01, 2.26, 0.0, 0xd8d4cc);
    // balcony x -4..-0.4, z 0.15..1.5: slab, terracotta tiles, railing (balusters + timber top rail), awning y 2.5
    bb(-4.05, -0.2, 0.15, -0.35, -0.002, 1.55, 0xc8c0b4);
    gnd(-4.0, 0.15, -0.4, 1.5, 0, M.tiles, 0.3, TERRA);
    bb(-4.06, -0.22, 1.5, -0.34, -0.12, 1.58, 0xb8b0a4);
    for (let x = -3.94; x < -0.42; x += 0.117) bb(x - 0.011, 0, 1.49, x + 0.011, 1.0, 1.51, RAIL);
    for (let z = 0.27; z < 1.48; z += 0.12) { bb(-3.99, 0, z - 0.011, -3.97, 1.0, z + 0.011, RAIL); bb(-0.43, 0, z - 0.011, -0.41, 1.0, z + 0.011, RAIL); }
    bb(-4.02, 0.0, 1.46, -3.94, 1.0, 1.54, RAIL); bb(-0.46, 0.0, 1.46, -0.38, 1.0, 1.54, RAIL);       // corner posts
    bb(-4.03, 0.98, 1.44, -0.37, 1.05, 1.56, 0x8a6a4a); bb(-4.03, 0.98, 0.15, -3.95, 1.05, 1.56, 0x8a6a4a); bb(-0.45, 0.98, 0.15, -0.37, 1.05, 1.56, 0x8a6a4a);
    bb(-4.0, 0.08, 1.48, -0.4, 0.11, 1.52, RAIL);                                                   // bottom rail
    COL.push([-4.0, 1.5, -0.4, 1.6], [-4.0, 0, -3.4, 1.5], [-1.0, 0, -0.4, 1.5]);
    boxR(3.9, 0.04, 1.6, 0xd4d8d4, -2.2, 2.52, 0.92, 0.06, 0, 0);                                   // the awning (colorbond), falling outward
    for (let x = -4.1; x < -0.3; x += 0.16) boxR(0.03, 0.03, 1.6, 0xc4c8c4, x, 2.55, 0.92, 0.06, 0, 0);
    bb(-4.15, 2.36, 1.66, -0.25, 2.48, 1.74, 0xc8ccc8);                                              // gutter
    for (const x of [-4.05, -0.35]) bb(x - 0.03, 1.05, 1.62, x + 0.03, 2.42, 1.68, 0xc8ccc8);           // posts
    // two stacked plastic chairs in the east corner, a succulent in the west corner
    for (let k = 0; k < 2; k++) { const y = k * 0.06; at(-0.72, 0.62, -2.6, y);
      bb(-0.24, 0.42, -0.22, 0.24, 0.45, 0.22, 0xf2f2ee); bb(-0.24, 0.45, -0.25, 0.24, 0.86, -0.21, 0xf2f2ee);
      for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) boxR(0.035, 0.44, 0.035, 0xe8e8e4, sx * 0.21, 0.21, sz * 0.19, sz * 0.08, 0, -sx * 0.08);
      XF = null; }
    cyl(0.12, 0.1, 0.22, 8, 0xc07a58, -3.72, 0.11, 0.42); for (let i = 0; i < 6; i++) { const a = i * TAU / 6; boxR(0.04, 0.12, 0.02, 0x6a9a6a, -3.72 + Math.cos(a) * 0.05, 0.27, 0.42 + Math.sin(a) * 0.05, Math.sin(a) * 0.4, 0, -Math.cos(a) * 0.4); }
    // the light string's wire: along the rail top, down the side posts, and in scallops under the eave
    for (const p of LIGHT_WIRE) bb(p[0] - p[3], p[1] - 0.004, p[2] - p[4], p[0] + p[3], p[1] + 0.004, p[2] + p[4], 0x1e2a1e);
  }
  // christmas bulb positions (+ wire segments), computed once: rail, both side posts, the eave scallops
  const LIGHT_POS = [], LIGHT_WIRE = [];
  (() => {
    for (let x = -3.92; x < -0.45; x += 0.155) { const y = 1.085 + 0.02 * Math.sin(x * 9); LIGHT_POS.push([x, y, 1.53]); }
    for (let z = 0.28; z < 1.45; z += 0.15) { LIGHT_POS.push([-3.96, 1.085, z]); LIGHT_POS.push([-0.44, 1.085, z]); }
    for (let s = 0; s < 4; s++) for (let k = 0; k < 5; k++) { const u = (k + 0.5) / 5, x = 1.25 + (s + u) * 0.575, y = 2.36 - Math.sin(u * PI) * 0.36; LIGHT_POS.push([x, y, 0.5]); }
    LIGHT_WIRE.push([-2.19, 1.06, 1.53, 1.74, 0.004], [-3.96, 1.06, 0.84, 0.004, 0.62], [-0.44, 1.06, 0.84, 0.004, 0.62]);
    for (let s = 0; s < 4; s++) for (let k = 0; k < 6; k++) { const u = (k + 0.5) / 6, x = 1.25 + (s + u) * 0.575, y = 2.36 - Math.sin(u * PI) * 0.36 + 0.03; LIGHT_WIRE.push([x, y, 0.5, 0.05, 0.004]); }
  })();

  // ---------------------------------------------------------- living room
  function living() {
    tint = IN;
    // rug under the couch's front
    bb(-3.0, 0, -2.3, -0.8, 0.008, -0.75, 0x8a7e6e); bb(-2.9, 0.008, -2.2, -0.9, 0.009, -0.85, 0x9a8e7a);
    // the keyboard on an X-stand (under the sheet: the prop keyboard_sheet)
    for (const z of [-3.2, -2.4]) { boxR(0.035, 0.8, 0.035, IRON, -3.78, 0.35, z, 0, 0, 0.48); boxR(0.035, 0.8, 0.035, IRON, -3.78, 0.35, z, 0, 0, -0.48); }
    bb(-3.92, 0.66, -3.3, -3.88, 0.7, -2.3, IRON); bb(-3.68, 0.66, -3.3, -3.64, 0.7, -2.3, IRON);
    bb(-3.97, 0.71, -3.42, -3.57, 0.8, -2.18, 0x26272b);
    bb(-3.97, 0.8, -3.42, -3.76, 0.865, -2.18, 0x2e3034); bb(-3.97, 0.8, -3.42, -3.57, 0.86, -3.36, 0x2e3034); bb(-3.97, 0.8, -2.24, -3.57, 0.86, -2.18, 0x2e3034);
    { const g = new THREE.PlaneGeometry(1.12, 0.18), uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, (1 - uv.getX(i)) * 1.12 / 0.1645, uv.getY(i));
      g.rotateX(-H); g.rotateY(-H); g.translate(-3.665, 0.835, -2.8); put(g, 0xffffff, M.keys); }
    { const g = new THREE.PlaneGeometry(0.34, 0.06); g.rotateX(-H); g.rotateY(-H); g.translate(-3.66, 0.837, -2.72); put(g, 0xffffff, M.dust); }
    bb(-3.92, 0, -3.0, -3.84, 0.04, -2.6, 0x1a1a1c);                                                // the sustain pedal on the floor
    COL.push([-4.0, -3.45, -3.55, -2.15]);
    // the standing desk x -4..-3.35, z -1.5..-0.4, top 0.76 (no chair)
    bb(-4.0, 0.73, -1.5, -3.35, 0.76, -0.4, DESK);
    bb(-3.98, 0, -1.49, -3.38, 0.73, -1.45, DESK_D); bb(-3.98, 0, -0.45, -3.38, 0.73, -0.41, DESK_D); bb(-3.99, 0.35, -1.45, -3.95, 0.73, -0.45, DESK_D);
    cyl(0.04, 0.035, 0.1, 10, 0xe8e4dc, -3.55, 0.81, -0.62); cyl(0.032, 0.032, 0.006, 10, 0x5a3a20, -3.55, 0.855, -0.62);   // a mug of cold tea
    boxR(0.14, 0.005, 0.004, 0x1a1a1a, -3.5, 0.763, -1.25, 0, 0.6, 0);                             // a pen
    bb(-3.9, 0.76, -1.42, -3.8, 0.81, -1.32, 0x2a2c30); cyl(0.03, 0.03, 0.005, 10, 0x4a4c50, -3.85, 0.812, -1.37);   // a small speaker
    noteOn('up', -3.48, 0.762, -0.55, 0.075, 0.4, NOTE[2]); noteOn('up', -3.44, 0.763, -1.38, 0.075, -0.3, NOTE[0]);
    COL.push([-4.0, -1.5, -3.35, -0.4]);
    // the couch (faded teal) x -2.8..-0.95, z -2.9..-2.2, facing +Z: seat 0.42, back 0.85
    at(-1.875, -2.55, 0);
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) bb(sx * 0.86 - 0.03, 0, sz * 0.3 - 0.03, sx * 0.86 + 0.03, 0.06, sz * 0.3 + 0.03, 0x2a2420);
    bb(-0.925, 0.06, -0.35, 0.925, 0.3, 0.35, TEAL_D);
    bb(-0.76, 0.3, -0.17, -0.015, 0.42, 0.34, TEAL); bb(0.015, 0.3, -0.17, 0.76, 0.42, 0.34, TEAL);
    bb(-0.925, 0.3, -0.35, 0.925, 0.85, -0.2, TEAL_D);
    boxR(0.74, 0.4, 0.14, TEAL, -0.39, 0.62, -0.16, -0.16, 0, 0); boxR(0.74, 0.4, 0.14, TEAL, 0.39, 0.62, -0.16, -0.16, 0, 0);
    bb(-0.925, 0.3, -0.35, -0.76, 0.6, 0.35, TEAL_D); bb(0.76, 0.3, -0.35, 0.925, 0.6, 0.35, TEAL_D);
    bb(-0.93, 0.58, -0.35, -0.755, 0.62, 0.35, TEAL); bb(0.755, 0.58, -0.35, 0.93, 0.62, 0.35, TEAL);
    boxR(0.3, 0.3, 0.1, 0xb8a888, 0.58, 0.58, -0.08, -0.25, 0.25, 0.12);                            // a cushion
    XF = null;
    COL.push([-2.8, -2.9, -0.95, -2.2]);
    // the bookshelf x -0.35..0.85, z -3.55..-3.25, h 1.8, facing +Z (shelves at 0.25, 0.7, 1.15, 1.6)
    bb(-0.35, 0, -3.55, -0.32, 1.8, -3.25, SHELF); bb(0.82, 0, -3.55, 0.85, 1.8, -3.25, SHELF); bb(-0.35, 0, -3.55, 0.85, 1.8, -3.53, SHELF_D);
    bb(-0.32, 0, -3.53, 0.82, 0.07, -3.25, SHELF); bb(-0.35, 1.77, -3.55, 0.85, 1.8, -3.25, SHELF);
    for (const y of [0.25, 0.7, 1.15, 1.6]) bb(-0.32, y - 0.025, -3.53, 0.82, y, -3.26, SHELF);
    seed = 41;
    const books = (x0, x1, y, lean) => { let x = x0; while (x < x1) { const w = 0.025 + rnd() * 0.03, h = 0.17 + rnd() * 0.09, col = [0x8a3a34, 0x2a4a6a, 0x3a5a3a, 0xc8b890, 0x6a4a6a, 0xd8d0c0, 0x2a2a30][Math.floor(rnd() * 7)]; if (x + w > x1) break; bb(x, y, -3.5, x + w, y + h, -3.3 - rnd() * 0.04, col); x += w + 0.003; } if (lean) boxR(0.03, 0.2, 0.18, 0x8a6a3a, x1 + 0.06, y + 0.095, -3.4, 0, 0, -0.35); };
    books(-0.3, 0.3, 0.07, false); bb(0.38, 0.07, -3.5, 0.78, 0.2, -3.3, 0x7a5a3a); bb(0.4, 0.2, -3.48, 0.76, 0.21, -3.32, 0x8a6a4a);   // a crate of cables
    for (let k = 0; k < 4; k++) cyl(0.008, 0.008, 0.3, 6, 0x1a1a1a, 0.45 + k * 0.08, 0.215, -3.4, H, 0);
    books(-0.3, 0.15, 0.25, true); for (let k = 0; k < 14; k++) bb(0.3 + k * 0.034, 0.25, -3.52, 0.326 + k * 0.034, 0.56, -3.28, k % 3 ? 0x1a1a1e : 0xd8d4cc);   // books; records
    books(-0.3, 0.75, 0.7, false);
    bb(0.65, 1.15, -3.5, 0.78, 1.18, -3.3, 0x6a6a70); cyl(0.04, 0.05, 0.09, 8, 0xc07a58, 0.71, 1.225, -3.42);   // shelf 3 end: a plate + a cactus
    cyl(0.025, 0.03, 0.1, 8, 0x5a8a5a, 0.71, 1.31, -3.42);
    cyl(0.04, 0.045, 0.08, 8, 0xe8e0d0, 0.55, 1.64, -3.42); cyl(0.004, 0.004, 0.02, 4, 0x1a1a1a, 0.55, 1.69, -3.42);   // shelf 4: a candle
    noteOn('x+', 0.851, 1.3, -3.3, 0.075, 0.08, NOTE[3]); noteOn('x+', 0.851, 1.05, -3.35, 0.075, -0.12, NOTE[1]);
    COL.push([-0.35, -3.55, 0.85, -3.25]);
    // sticky notes everywhere: the partition above the couch, round the bedroom door, the wall by the balcony
    seed = 88;
    for (let i = 0; i < 26; i++) noteOn('z+', -2.9 + rnd() * 1.4, 1.25 + rnd() * 0.85, -3.548, 0.075, (rnd() - 0.5) * 0.35, NOTE[Math.floor(rnd() * 5)]);
    for (let i = 0; i < 8; i++) noteOn('z+', -1.55 + (i % 2) * 1.1, 0.9 + i * 0.15, -3.546, 0.075, (rnd() - 0.5) * 0.4, NOTE[Math.floor(rnd() * 5)]);
    for (let i = 0; i < 7; i++) noteOn('z-', -3.9 + rnd() * 0.45, 1.0 + rnd() * 1.1, -0.002, 0.075, (rnd() - 0.5) * 0.4, NOTE[Math.floor(rnd() * 5)]);
    for (let i = 0; i < 6; i++) noteOn('z+', 0.0 + rnd() * 0.8, 1.9 + rnd() * 0.5, -3.548, 0.075, (rnd() - 0.5) * 0.4, NOTE[Math.floor(rnd() * 5)]);
  }

  // ---------------------------------------------------------- kitchen
  function kitchen() {
    tint = IN;
    // bench x 3.4..4.0, z -2.7..-0.2, top 0.92: kick, carcass (doors face -X), laminate top, sink z -1.0, cooktop
    bb(3.46, 0, -2.68, 4.0, 0.1, -0.22, 0x4a4440);
    bb(3.42, 0.1, -2.7, 4.0, 0.88, -0.2, CUP);
    for (const z of [-2.08, -1.46, -0.84]) bb(3.414, 0.12, z - 0.004, 3.42, 0.86, z + 0.004, 0x9a9284);
    for (const z of [-2.39, -1.77, -1.15, -0.52]) bb(3.395, 0.74, z - 0.07, 3.415, 0.76, z + 0.07, STEEL);
    bb(3.38, 0.88, -2.72, 4.0, 0.92, -0.18, LAMI);
    bb(3.5, 0.92, -1.26, 3.9, 0.923, -0.74, 0x9aa0a6); bb(3.54, 0.923, -1.22, 3.86, 0.925, -0.78, 0x4a5056);   // sink
    cyl(0.015, 0.015, 0.22, 8, STEEL, 3.93, 1.03, -1.0); boxR(0.18, 0.02, 0.02, STEEL, 3.85, 1.14, -1.0, 0, 0, -0.15);
    bb(3.5, 0.92, -0.6, 3.92, 0.926, -0.24, 0x16181c); for (const z of [-0.5, -0.33]) cyl(0.07, 0.07, 0.002, 12, 0x3a3e44, 3.72, 0.927, z);   // cooktop
    bb(3.5, 0.92, -0.72, 3.62, 0.95, -0.64, 0x7ab0d8); cyl(0.025, 0.025, 0.16, 8, 0x5aa86a, 3.88, 1.0, -0.66);   // sponge, dish soap
    wallT(3.997, -2.7, 3.997, -0.2, 0.92, 1.5, 'x-', M.tiles, 0.3, SPLASH);
    bb(3.65, 1.5, -2.7, 4.0, 2.2, -0.2, CUP);
    for (const z of [-2.075, -1.45, -0.825]) bb(3.644, 1.52, z - 0.004, 3.65, 2.18, z + 0.004, 0x9a9284);
    for (const z of [-2.39, -1.76, -1.14, -0.51]) bb(3.625, 1.53, z - 0.07, 3.645, 1.55, z + 0.07, STEEL);
    bb(3.6, 2.2, -2.72, 4.0, 2.24, -0.18, CUP);
    seed = 61;
    for (let i = 0; i < 9; i++) noteOn('x-', 3.646, 1.62 + rnd() * 0.5, -2.6 + rnd() * 2.3, 0.075, (rnd() - 0.5) * 0.4, NOTE[Math.floor(rnd() * 5)]);
    for (let i = 0; i < 4; i++) noteOn('x-', 3.418, 0.4 + rnd() * 0.4, -2.6 + rnd() * 2.2, 0.075, (rnd() - 0.5) * 0.3, NOTE[Math.floor(rnd() * 5)]);
    // the toaster (z -2.45)
    bb(3.62, 0.92, -2.57, 3.82, 1.1, -2.33, 0xc8ccd2); bb(3.66, 1.1, -2.53, 3.78, 1.104, -2.5, 0x1a1a1a); bb(3.66, 1.1, -2.41, 3.78, 1.104, -2.38, 0x1a1a1a);
    bb(3.6, 1.02, -2.47, 3.62, 1.06, -2.43, 0x1a1a1a);
    COL.push([3.4, -2.7, 4.0, -0.2]);
    // the fridge x 3.3..4.0, z -3.5..-2.8, h 1.8, door face x 3.29 (freezer drawer at the bottom)
    bb(3.3, 0.02, -3.5, 4.0, 1.8, -2.8, FRIDGE); bb(3.32, 0, -3.48, 3.98, 0.03, -2.82, 0x3a3c40);
    bb(3.284, 0.06, -3.49, 3.3, 0.54, -2.81, 0xe2e5e7); bb(3.284, 0.58, -3.49, 3.3, 1.78, -2.81, 0xe6e9eb);
    bb(3.25, 0.46, -3.35, 3.27, 0.48, -2.95, STEEL); for (const z of [-3.33, -2.97]) bb(3.264, 0.45, z - 0.01, 3.285, 0.49, z + 0.01, STEEL);
    bb(3.25, 0.92, -2.875, 3.268, 1.46, -2.857, STEEL); for (const y of [0.95, 1.43]) bb(3.264, y - 0.012, -2.874, 3.285, y + 0.012, -2.858, STEEL);
    // magnets and paper on the door (the pelican and the card are props)
    tq(0.1, 0.125, A_MENU, 3.281, 1.26, -3.33, -H); cyl(0.012, 0.012, 0.01, 8, 0xd8323a, 3.276, 1.315, -3.33, 0, H);
    tq(0.055, 0.055, A_BIN, 3.281, 1.6, -2.98, -H);
    tq(0.085, 0.085, A_POST, 3.281, 1.05, -3.2, -H, 0, M.atlas, 0.06); cyl(0.01, 0.01, 0.01, 8, 0x3a7ae0, 3.276, 1.085, -3.17, 0, H);
    noteOn('x-', 3.282, 1.62, -3.38, 0.075, 0.1, NOTE[4]); noteOn('x-', 3.282, 0.85, -3.1, 0.075, -0.06, NOTE[0]); noteOn('x-', 3.282, 1.7, -3.18, 0.075, -0.15, NOTE[2]);
    bb(3.4, 1.8, -3.42, 3.62, 2.12, -3.26, 0xc8783a); bb(3.66, 1.8, -3.3, 3.9, 1.92, -2.95, 0x4a6a8a);   // a cereal box, a box of teabags
    COL.push([3.3, -3.5, 4.0, -2.8]);
    // the table 0.8 x 0.8, top 0.75, centre (2.3, -0.95)
    bb(1.9, 0.71, -1.35, 2.7, 0.75, -0.55, 0xb08a62); bb(1.95, 0.64, -1.3, 2.65, 0.71, -0.6, 0x9a7650);
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) bb(2.3 + sx * 0.34 - 0.025, 0, -0.95 + sz * 0.34 - 0.025, 2.3 + sx * 0.34 + 0.025, 0.71, -0.95 + sz * 0.34 + 0.025, 0x8a6a46);
    cyl(0.025, 0.03, 0.07, 8, 0xf2f2f2, 2.42, 0.785, -0.72); cyl(0.025, 0.03, 0.07, 8, 0x2a2a2a, 2.48, 0.785, -0.72);   // salt, pepper
    // chairs W (1.65, -0.95) facing +X, E (2.95, -0.95) facing -X; stool S (2.3, -1.6)
    for (const [x, ry] of [[1.65, H], [2.95, -H]]) {
      at(x, -0.95, ry);
      for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) bb(sx * 0.17 - 0.018, 0, sz * 0.17 - 0.018, sx * 0.17 + 0.018, 0.43, sz * 0.17 + 0.018, 0x7a5a3a);
      bb(-0.2, 0.43, -0.2, 0.2, 0.47, 0.2, 0xc09a6a);
      for (const sx of [-1, 1]) bb(sx * 0.17 - 0.018, 0.47, -0.2, sx * 0.17 + 0.018, 0.88, -0.165, 0x7a5a3a);
      bb(-0.19, 0.74, -0.205, 0.19, 0.86, -0.17, 0xc09a6a);
      XF = null;
    }
    cyl(0.17, 0.17, 0.04, 12, 0xc09a6a, 2.3, 0.47, -1.6); for (let k = 0; k < 3; k++) { const a = k * TAU / 3 + 0.3; boxR(0.025, 0.47, 0.025, 0x3a3c40, 2.3 + Math.cos(a) * 0.12, 0.225, -1.6 + Math.sin(a) * 0.12, Math.sin(a) * 0.12, 0, -Math.cos(a) * 0.12); }
    COL.push([1.4, -1.85, 3.2, -0.6]);
    // by the entry door: a doormat, shoes, a hook rail with a scarf and a bag
    bb(1.3, 0, -3.5, 2.0, 0.012, -3.1, 0x5a5048);
    for (const [x, ry] of [[2.55, 0.2], [2.72, 0.1]]) boxR(0.1, 0.07, 0.27, 0x3a3230, x, 0.035, -3.3, 0, ry, 0);
    bb(2.4, 1.6, -3.545, 3.0, 1.64, -3.52, TIMBER_D); for (const x of [2.5, 2.7, 2.9]) bb(x - 0.01, 1.58, -3.52, x + 0.01, 1.62, -3.48, STEEL);
    boxR(0.12, 0.55, 0.04, 0x8a3a3a, 2.5, 1.33, -3.5, 0, 0, 0.04); boxR(0.25, 0.32, 0.1, 0x3a4a5a, 2.9, 1.36, -3.48, 0.05, 0, 0);
    bb(1.0, 1.0, -3.546, 1.12, 1.08, -3.53, 0x2a2c30); bb(1.03, 1.02, -3.53, 1.09, 1.06, -3.525, GLASSY);   // the SafeSense door panel by the entry
  }

  // ---------------------------------------------------------- bedroom, landing, stairs
  function bedroom() {
    tint = IN;
    // the bed x -3.7..-2.2, z -6.4..-4.4: headboard, legs, side rails (y 0.3..0.42: the box slides under), mattress, duvet
    bb(-3.72, 0, -6.4, -2.18, 1.05, -6.32, TIMBER_D);
    for (const [x, z] of [[-3.69, -4.43], [-2.21, -4.43]]) bb(x - 0.03, 0, z - 0.03, x + 0.03, 0.42, z + 0.03, TIMBER_D);
    bb(-3.72, 0.3, -6.32, -3.68, 0.42, -4.42, TIMBER); bb(-2.22, 0.3, -6.32, -2.18, 0.42, -4.42, TIMBER); bb(-3.72, 0.3, -4.44, -2.18, 0.45, -4.4, TIMBER);
    bb(-3.68, 0.36, -6.32, -2.22, 0.42, -4.44, 0x6a5a48);
    bb(-3.68, 0.42, -6.3, -2.22, 0.55, -4.45, 0xeeeae0);
    boxR(0.55, 0.12, 0.34, 0xf4f2ec, -3.32, 0.6, -6.12, 0.25, 0.05, 0); boxR(0.55, 0.12, 0.34, 0xf0eee6, -2.62, 0.6, -6.1, 0.22, -0.06, 0);
    bb(-3.7, 0.55, -5.85, -2.2, 0.6, -4.43, LINEN); boxR(1.5, 0.08, 0.32, 0x7a90a8, -2.95, 0.6, -5.75, 0, 0, 0);   // duvet + its fold
    boxR(0.7, 0.06, 0.5, 0x8aa0b8, -3.2, 0.62, -5.0, 0, 0.3, 0.02); boxR(0.5, 0.05, 0.4, 0x7e94ac, -2.55, 0.615, -4.75, 0, -0.2, 0);
    bb(-3.745, 0.3, -5.85, -3.722, 0.6, -4.43, LINEN); bb(-3.7, 0.33, -4.398, -2.2, 0.6, -4.378, LINEN);
    COL.push([-3.7, -6.4, -2.2, -4.4]);
    // bedside (-1.95, -6.15): drawer, lamp (off), a glass of water, a book
    bb(-2.15, 0, -6.38, -1.75, 0.5, -5.95, TIMBER); bb(-2.13, 0.3, -5.952, -1.77, 0.31, -5.945, TIMBER_D); bb(-1.99, 0.38, -5.95, -1.91, 0.4, -5.94, STEEL);
    cyl(0.05, 0.06, 0.03, 10, 0x3a3c40, -2.0, 0.515, -6.25); cyl(0.008, 0.008, 0.25, 6, 0x3a3c40, -2.0, 0.65, -6.25); cyl(0.07, 0.11, 0.14, 10, 0xe8e0cc, -2.0, 0.8, -6.25);
    cyl(0.03, 0.028, 0.1, 8, 0xcfe8f0, -1.85, 0.55, -6.05, 0, 0, M.glass); bb(-2.12, 0.5, -6.08, -1.96, 0.53, -5.98, 0x2a4a6a);
    COL.push([-2.15, -6.4, -1.75, -5.95]);
    // the wardrobe x -0.4..0.85, z -6.4..-5.8 (doors face +Z), a suitcase on top, a gig bag leaning on it
    bb(-0.4, 0, -6.4, 0.85, 2.0, -5.8, 0xd8d0c0); bb(0.22, 0.05, -5.8, 0.23, 1.95, -5.79, 0x9a9284);
    for (const x of [0.16, 0.29]) bb(x - 0.01, 0.9, -5.79, x + 0.01, 1.2, -5.77, STEEL);
    bb(-0.3, 2.0, -6.35, 0.6, 2.22, -5.88, 0x8a7458); bb(0.05, 2.22, -6.15, 0.25, 2.25, -6.08, 0x3a3a3a);
    COL.push([-0.4, -6.4, 0.85, -5.8]);
    // the small dark back window x -3.2..-2.0, y 1.2..1.9 (a blind half down)
    quad(1.2, 0.7, M.backWin, -2.6, 1.55, -6.45); bb(-3.24, 1.16, -6.42, -1.96, 1.2, -6.36, ALU); bb(-3.24, 1.9, -6.42, -1.96, 1.94, -6.36, ALU);
    bb(-3.24, 1.16, -6.42, -3.2, 1.94, -6.36, ALU); bb(-2.0, 1.16, -6.42, -1.96, 1.94, -6.36, ALU); bb(-2.62, 1.2, -6.42, -2.58, 1.9, -6.38, ALU);
    bb(-3.2, 1.6, -6.39, -2.0, 1.9, -6.37, 0xe8e2d4); bb(-3.2, 1.58, -6.4, -2.0, 1.61, -6.36, 0xd8d2c4);
    // a rug by the bed, clothes on the floor, a laundry basket
    bb(-2.15, 0, -5.6, -1.2, 0.008, -4.5, 0x6a7a8a);
    boxR(0.4, 0.06, 0.3, 0x3a3a44, -0.7, 0.03, -4.4, 0, 0.4, 0); boxR(0.3, 0.05, 0.25, 0xd8d0c0, -0.55, 0.06, -4.3, 0, -0.2, 0.05);
    cyl(0.2, 0.17, 0.4, 10, 0xd8d0c0, 0.55, 0.2, -4.2); boxR(0.3, 0.12, 0.3, 0x5a6a7a, 0.55, 0.42, -4.2, 0.1, 0.3, 0);
    COL.push([0.35, -4.4, 0.75, -4.0]);
    // a few notes on the bedroom wall too
    seed = 33; for (let i = 0; i < 6; i++) noteOn('x+', -3.998, 1.2 + rnd() * 0.7, -5.4 + rnd() * 1.4, 0.075, (rnd() - 0.5) * 0.4, NOTE[Math.floor(rnd() * 5)]);
  }
  function landing() {
    tint = IN;
    // stair top at z -4.8, descending -Z (0.25 run, 0.18 rise) into the dark
    for (let k = 0; k < 9; k++) { const z1 = -4.8 - k * 0.25, y = -0.18 * (k + 1); bb(0.95, y - 0.05, z1 - 0.25, 2.4, y, z1, k ? 0x7a5c40 : 0x8a6a4a); bb(0.95, y, z1 - 0.02, 2.4, y + 0.18, z1, 0x5a4430); }
    bb(0.95, 0, -4.84, 2.4, 0.01, -4.78, 0x5a4a3a);                                                  // nosing
    bb(0.95, -3.6, -6.4, 2.4, -1.6, -6.38, 0x1a1816);                                                // the dark bottom
    for (let k = 0; k < 4; k++) { const z = -4.85 - k * 0.42; bb(0.97, 0.9 + (z + 4.8) * 0.72 - 0.02, z - 0.21, 1.02, 0.93 + (z + 4.8) * 0.72, z + 0.21, TIMBER_D); }   // handrail
    // the bathroom door on the x 2.4 wall (closed, never entered)
    bb(2.37, 0, -4.68, 2.4, 2.04, -3.86, DOORC); bb(2.34, 0.95, -4.62, 2.37, 0.99, -4.55, STEEL);
    bb(2.37, 0, -4.75, 2.395, 2.11, -4.68, TRIM); bb(2.37, 0, -3.86, 2.395, 2.11, -3.79, TRIM); bb(2.37, 2.04, -4.75, 2.395, 2.11, -3.79, TRIM);
    // the dim bulb on the landing ceiling
    cyl(0.004, 0.004, 0.3, 4, 0x2a2a2a, 1.65, 2.45, -4.25); cyl(0.03, 0.03, 0.05, 8, 0x3a3a3a, 1.65, 2.28, -4.25); ico(0.045, 0xffffff, 1.65, 2.22, -4.25, 1.2, M.bulb);
    noteOn('x-', 2.392, 1.5, -4.3, 0.075, 0.1, NOTE[1]);
  }

  // ---------------------------------------------------------- outside (flat-local: the Parade is at y -3.6)
  function hoverCar(col) {   // a 2040 hover hatch: origin on the road, front +Z, body from y 0.32 (a foot off the bitumen)
    const y0 = 0.32, dk = 0x2c4256;
    boxR(1.76, 0.38, 3.6, col, 0, y0 + 0.23, 0); boxR(1.6, 0.34, 3.9, col, 0, y0 + 0.21, 0);
    boxR(1.66, 0.12, 3.8, 0xa8acb2, 0, y0 + 0.04, 0);
    boxR(1.7, 0.1, 1.1, col, 0, y0 + 0.43, 1.3, 0.16);
    boxR(1.56, 0.38, 1.9, dk, 0, y0 + 0.6, -0.36); boxR(1.5, 0.07, 1.62, col, 0, y0 + 0.82, -0.42);
    boxR(1.5, 0.3, 0.06, dk, 0, y0 + 0.6, 0.62, -0.5);
    for (const [x, z] of [[0.58, 1.25], [-0.58, 1.25], [0.58, -1.25], [-0.58, -1.25]]) cyl(0.3, 0.34, 0.06, 10, 0x3a3e44, x, y0 - 0.03, z);
  }
  function hoverGlow() {   // headlights, tail lights, the blue under-glow (one geometry; brightness by the material)
    const y0 = 0.32;
    for (const sx of [-1, 1]) { boxR(0.4, 0.09, 0.05, 0xfff4d8, sx * 0.5, y0 + 0.3, 1.96); boxR(0.42, 0.08, 0.05, 0xff3a30, sx * 0.5, y0 + 0.34, -1.96); }
    for (const [x, z] of [[0.58, 1.25], [-0.58, 1.25], [0.58, -1.25], [-0.58, -1.25]]) cyl(0.24, 0.24, 0.02, 10, 0x6fc8ff, x, y0 - 0.075, z);
  }
  function palmCrown() {   // ten fronds in three drooping segments, a few dead ones hanging, a seed cluster
    for (let i = 0; i < 10; i++) {
      const a = i * TAU / 10 + (i % 2) * 0.2, c = Math.cos(a), s = Math.sin(a), up = i % 3 === 0 ? -0.15 : 0.12, col = i % 2 ? 0x4f8a3a : 0x5c9a42;
      boxR(0.36, 0.035, 0.9, col, s * 0.42, 0.1 + up, c * 0.42, -0.25 + up, a);
      boxR(0.32, 0.03, 0.8, i % 2 ? 0x467c34 : 0x548c3c, s * 1.15, -0.06 + up * 0.5, c * 1.15, 0.28, a);
      boxR(0.22, 0.025, 0.7, 0x3e6e2e, s * 1.75, -0.38 + up * 0.3, c * 1.75, 0.75, a);
    }
    for (let i = 0; i < 4; i++) { const a = i * TAU / 4 + 0.6; boxR(0.18, 0.9, 0.03, 0x9a8456, Math.sin(a) * 0.22, -0.45, Math.cos(a) * 0.22, 0.12, a, 0); }
    ico(0.2, 0x6a5a2a, 0, -0.05, 0, 1); ico(0.1, 0x8a6a30, 0.12, -0.2, 0.06); ico(0.1, 0x8a6a30, -0.1, -0.22, -0.05);
  }
  function street(parent) {
    tint = OUTT;
    const Y = Y0;
    // footpath, kerbs, road (+X lane z 6, -X lane z 10), zebra x -10..-6, promenade
    bb(-200, Y - 0.3, 0.15, 160, Y, 3.85, CONC); bb(-200, Y - 0.3, 3.85, 160, Y + 0.02, 4.0, 0xd0cabe);
    bb(-200, Y - 0.3, 4.0, 160, Y, 12.0, ROAD);
    for (let x = -198; x < 158; x += 6) bb(x, Y, 7.94, x + 3, Y + 0.008, 8.06, LINE);
    bb(-200, Y, 4.3, 160, Y + 0.008, 4.4, LINE); bb(-200, Y, 11.6, 160, Y + 0.008, 11.7, LINE);
    for (let z = 4.5; z < 11.6; z += 0.9) bb(-9.9, Y, z, -6.1, Y + 0.012, z + 0.45, 0xf2f0e6);
    bb(-200, Y - 0.3, 12.0, 160, Y + 0.02, 12.15, 0xd0cabe); bb(-200, Y - 0.3, 12.15, 160, Y, 15.0, PAVE);
    // park (x -36..10) + plaza (x -52..-36) + more foreshore both ways; benches; the skate bowl rim
    gnd(-36, 15, 10, 25, Y, M.grass, 4, 0xe0f0d0); gnd(-200, 15, -52, 25, Y, M.grass, 4, 0xe0f0d0); gnd(10, 15, 160, 25, Y, M.grass, 4, 0xe0f0d0);
    bb(-52, Y - 0.3, 15, -36, Y + 0.004, 25, PAVE);
    for (const x of [-33, -23, 2]) { at(x, 24.2, 0, Y); bb(-0.9, 0.42, -0.22, 0.9, 0.47, 0.22, 0x8a6a4a); bb(-0.9, 0.56, -0.3, 0.9, 0.85, -0.24, 0x8a6a4a); for (const sx of [-1, 1]) bb(sx * 0.85 - 0.04, 0, -0.28, sx * 0.85 + 0.04, 0.45, 0.25, 0x3a3e44); XF = null; }
    { const g = new THREE.RingGeometry(2.8, 3.4, 20); g.rotateX(-H); g.translate(-5, Y + 0.02, 20.5); put(g, 0xc8c2b6); const g2 = new THREE.CircleGeometry(2.8, 20); g2.rotateX(-H); g2.translate(-5, Y + 0.015, 20.5); put(g2, 0x8a8a8a); }
    // the wrapped Christmas tree and the kiosk (park, off to the right)
    cyl(0.01, 1.6, 4.2, 8, 0xc8d8c8, -28, Y + 2.1, 20.5); cyl(0.2, 0.2, 0.3, 6, 0x6a5a3a, -28, Y + 0.15, 20.5);
    bb(-20.6, Y, 15.0, -19.4, Y + 2.0, 15.8, 0xf2f4f6); bb(-20.5, Y + 1.2, 14.98, -19.5, Y + 1.8, 15.0, 0x9fd4f0);
    // sand + the slope to the water (y -5.1 at z 36); west of the park the sea wall + rocks; the bay is a plane
    strip(-36, 160, [[25, Y], [31, Y], [36, WY], [40, WY - 0.5]], M.sand, 4, [0xffffff, 0xffffff, 0xd8c8a8, 0xc8b898]);
    strip(-200, -36, [[25, Y], [25.6, WY + 0.4], [27, WY - 0.6]], M.vc, 4, [ROCK, 0x6a665e, 0x5a5650]);
    for (let x = -198; x < -36; x += 2.6) ico(0.9 + ((x * 7) % 3) * 0.2, ((x * 13) % 2) ? ROCK : 0x7a766c, x, WY + 0.3, 25.6, 0.6, M.vc, 1.2, 0.9);
    // the jetty: deck x -45.75..-42.25, z 25..61 + T-head x -52..-36, z 61..67 at y -3.6 (piles, posts, lamps instanced)
    bb(-45.75, Y - 0.3, 25, -42.25, Y, 61, 0x9c8c78); bb(-52, Y - 0.3, 61, -36, Y, 67, 0x9c8c78);
    for (const x of [-45.65, -42.35]) bb(x - 0.05, Y + 1.0, 25, x + 0.05, Y + 1.1, 61, 0xb8ac98);
    bb(-52, Y + 1.0, 66.9, -36, Y + 1.1, 67.0, 0xb8ac98); bb(-52.0, Y + 1.0, 61, -51.9, Y + 1.1, 67, 0xb8ac98); bb(-36.1, Y + 1.0, 61, -36, Y + 1.1, 67, 0xb8ac98);
    bb(-52, Y + 1.0, 61, -45.75, Y + 1.1, 61.1, 0xb8ac98); bb(-42.25, Y + 1.0, 61, -36, Y + 1.1, 61.1, 0xb8ac98);
    // the shop row both sides of the chip shop (facades at z 0..0.15, first floors + parapets), awnings y -0.6 to z 2
    const FAC = [[-200, -32.5, 0xb8d8ee, 3.3], [-32.5, -26, 0xf2f3f4, 3.8], [-21, -14.5, 0xf2a98c, 3.4], [-14.5, -10, 0x9fd8c4, 3.0], [-10, -4.2, 0xb8d8ee, 3.6],
      [4.2, 5.6, BRICK, 4.0], [5.6, 14, 0xf2f3f4, 3.2], [14, 160, 0xf3e2b0, 3.4]];
    let wn = 0;
    for (const [x0, x1, col, ph] of FAC) {
      bb(x0, Y, -8, x1, ph, 0.12, col); bb(x0, ph - 0.12, -8, x1, ph, 0.25, 0xd8d2c4);
      for (let x = x0 + 0.9; x < x1 - 1.2; x += 2.0) {
        if (x < -70 || x > 50) continue;
        bb(x, 0.6, 0.12, x + 1.1, 1.9, 0.14, 0x2c3a48); bb(x - 0.04, 0.56, 0.12, x + 1.14, 0.6, 0.2, 0xe8e6e0);
        if ((wn++ * 7) % 5 === 1) quad(1.1, 1.3, M.winLit, x + 0.55, 1.25, 0.145);                  // a lit window now and then
      }
      bb(x0, -0.6, 0.12, x1, -0.48, 2.0, col === BRICK ? NAVY : AWN); bb(x0, -0.68, 1.96, x1, -0.4, 2.04, NAVY);
      bb(x0, Y, 0.12, x1, -0.6, 0.15, 0x2a3440);                                                    // ground floor shopfront glass (dark)
    }
    bb(-26, Y, -8, -21, Y + 0.02, 0.15, 0xc8906a);                                                   // Bee Gees Way mouth (pavers)
    bb(-4, -0.6, 0.12, 4, -0.48, 2.0, AWN); bb(-4, -0.68, 1.96, 4, -0.4, 2.04, NAVY);                  // the chip shop's own awning under the balcony
    bb(-4, Y, 0.12, 4, -0.6, 0.15, 0x3a4048);
    for (let i = 0; i < 24; i++) { const x = -3.8 + i * 0.33, y = -0.72 - Math.abs(Math.sin(i * 0.8)) * 0.14; boxR(0.24, 0.06, 0.06, i % 2 ? 0xc8ccd4 : 0xd8323a, x, y, 2.06, 0, 0, Math.cos(i * 0.8) * 0.6); }
  }
  function waterPlane() {   // big, opaque, fogged; near -> far colour; the env tints the material
    const zs = [24, 44, 84, 164, 324, 870], cs = [WNEAR, 0x62bbd6, 0x56b0d0, 0x4aa6ca, WFAR, WFAR];
    strip(-450, 450, zs.map((z) => [z, WY]), M.water, 7, cs);
  }

  // ---------------------------------------------------------- far group (MeshBasicMaterial, fog: false)
  const sstep = (a, b2, x) => smooth((x - a) / (b2 - a));
  function profile(a) {   // silhouette height (m) at bearing a (degrees from +Z toward +X): islands left, mainland right
    const n = Math.sin(a * 0.31) * 0.5 + Math.sin(a * 0.73 + 1.3) * 0.3 + Math.sin(a * 1.9 + 0.4) * 0.2;
    const isl = sstep(12, 18, a) * (1 - sstep(76, 84, a)) * (Math.sin(a * 0.19 - 0.6) > -0.35 ? 1 : 0.15);
    const main = sstep(-100, -95, a) * (1 - sstep(-5, -1, a));
    const inland = 1 - sstep(-110, -98, a) * (1 - sstep(96, 108, a));
    return isl * (3.5 + 4.5 * Math.max(0, Math.sin((a - 14) / 62 * PI)) + 1.2 * n) + main * (1.8 + 0.8 * n) + inland * (20 + 12 * n);
  }
  function silhouettes() {
    const N = 240, r = 450, pos = [], col = [], wy = WY;
    for (let i = 0; i < N; i++) {
      const a0 = -180 + i * 360 / N, a1 = a0 + 360 / N, h0 = profile(a0), h1 = profile(a1);
      if (h0 < 0.2 && h1 < 0.2) continue;
      const r0 = a0 * PI / 180, r1 = a1 * PI / 180, x0 = Math.sin(r0) * r, z0 = Math.cos(r0) * r, x1 = Math.sin(r1) * r, z1 = Math.cos(r1) * r;
      const top = Math.abs(a0) > 100 ? 0x7f9a8c : 0x8aa4b4;
      for (const [x, y, z, c] of [[x0, wy + h0, z0, top], [x0, wy - 1, z0, 0x9cb8c8], [x1, wy + h1, z1, top], [x1, wy + h1, z1, top], [x0, wy - 1, z0, 0x9cb8c8], [x1, wy - 1, z1, 0x9cb8c8]]) { pos.push(x, y, z); tc.set(c); col.push(tc.r, tc.g, tc.b); }
    }
    for (let k = 0; k < 9; k++) {   // Brisbane, tiny, beyond the bridge's far end
      const a = (-58 + k * 1.6) * PI / 180, h = 4 + ((k * 7) % 5) * 1.6, w = 2.1, x = Math.sin(a) * (r - 2), z = Math.cos(a) * (r - 2), ex = Math.cos(a) * w, ez = -Math.sin(a) * w;
      for (const [px, py, pz] of [[x - ex, wy + 1.5 + h, z - ez], [x - ex, wy, z - ez], [x + ex, wy + 1.5 + h, z + ez], [x + ex, wy + 1.5 + h, z + ez], [x - ex, wy, z - ez], [x + ex, wy, z + ez]]) { pos.push(px, py, pz); tc.set(0x7f98a8); col.push(tc.r, tc.g, tc.b); }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.computeVertexNormals(); return g;
  }
  function bridgeGeo(A, B, wy, lamps) {   // the Ted Smout Bridge seen from ~390 m: deck sides + top, piers, lamp posts (or heads)
    const dx = B[0] - A[0], dz = B[2] - A[2], L = Math.hypot(dx, dz), ux = dx / L, uz = dz / L, nx = -uz * 5, nz = ux * 5;
    const hAt = (u) => wy + 5 + 4 * Math.exp(-(((u - 0.55) / 0.13) ** 2));
    const pos = [], col = [];
    const tri = (p, c) => { for (const q of p) pos.push(q[0], q[1], q[2]); tc.set(c); for (let i = 0; i < p.length; i++) col.push(tc.r, tc.g, tc.b); };
    const bx = (cx, cy, cz, hw, hh, hd, c) => {
      const P = (sx, sy, sz) => [cx + sx * nx / 5 * hw + sz * ux * hd, cy + sy * hh, cz + sx * nz / 5 * hw + sz * uz * hd];
      const f = [[[-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]], [[1, -1, -1], [-1, -1, -1], [-1, 1, -1], [1, 1, -1]], [[-1, -1, -1], [-1, -1, 1], [-1, 1, 1], [-1, 1, -1]], [[1, -1, 1], [1, -1, -1], [1, 1, -1], [1, 1, 1]], [[-1, 1, 1], [1, 1, 1], [1, 1, -1], [-1, 1, -1]]];
      for (const q of f) { const v = q.map(([a, b2, c2]) => P(a, b2, c2)); tri([v[0], v[1], v[2], v[0], v[2], v[3]], c); }
    };
    if (!lamps) {
      const N = 48;
      for (let i = 0; i < N; i++) {
        const u0 = i / N, u1 = (i + 1) / N, x0 = A[0] + dx * u0, z0 = A[2] + dz * u0, x1 = A[0] + dx * u1, z1 = A[2] + dz * u1, y0 = hAt(u0), y1 = hAt(u1);
        for (const s of [1, -1]) {
          const ax = x0 + nx * s, az = z0 + nz * s, bx2 = x1 + nx * s, bz = z1 + nz * s;
          tri([[ax, y0, az], [ax, y0 - 1.2, az], [bx2, y1, bz], [bx2, y1, bz], [ax, y0 - 1.2, az], [bx2, y1 - 1.2, bz]], 0xb4c0c8);
          tri([[ax, y0 - 1.2, az], [ax, y0 - 1.6, az], [bx2, y1 - 1.2, bz], [bx2, y1 - 1.2, bz], [ax, y0 - 1.6, az], [bx2, y1 - 1.6, bz]], 0x4c565e);
          tri([[ax, y0 + 0.9, az], [ax, y0, az], [bx2, y1 + 0.9, bz], [bx2, y1 + 0.9, bz], [ax, y0, az], [bx2, y1, bz]], 0xc8d0d6);
        }
        tri([[x0 + nx, y0, z0 + nz], [x1 + nx, y1, z1 + nz], [x1 - nx, y1, z1 - nz], [x0 + nx, y0, z0 + nz], [x1 - nx, y1, z1 - nz], [x0 - nx, y0, z0 - nz]], 0x8a949c);
      }
      for (let k = 0; k < 12; k++) { const u = (k + 0.5) / 12, x = A[0] + dx * u, z = A[2] + dz * u, top = hAt(u) - 1.6; bx(x, (wy + top) / 2, z, 3.2, (top - wy) / 2, 0.9, 0x98a4ac); }
      for (let k = 0; k < 17; k++) { const u = (k + 0.5) / 17, x = A[0] + dx * u + nx * 0.9, z = A[2] + dz * u + nz * 0.9; bx(x, hAt(u) + 2.4, z, 0.12, 2.4, 0.12, 0x9aa4ac); }
    } else for (let k = 0; k < 17; k++) { const u = (k + 0.5) / 17, x = A[0] + dx * u + nx * 0.9, z = A[2] + dz * u + nz * 0.9; bx(x, hAt(u) + 4.9, z, 0.55, 0.28, 0.55, 0xffffff); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.computeVertexNormals(); return g;
  }
  const BR_A = [-49, WY, 387], BR_B = [-247, WY, 382];
  function cards(list, mat_, name, parent) {   // [[bearing deg, dist, y, w, h], ...] -> one mesh of camera-facing cards (facing the origin)
    const pos = [], uv = [];
    for (const [deg, d, y, w, h] of list) {
      const a = deg * PI / 180, cx = Math.sin(a) * d, cz = Math.cos(a) * d, ex = Math.cos(a) * w / 2, ez = -Math.sin(a) * w / 2;
      for (const [px, py, pz, u, v] of [[cx - ex, y - h / 2, cz - ez, 0, 0], [cx + ex, y - h / 2, cz + ez, 1, 0], [cx + ex, y + h / 2, cz + ez, 1, 1], [cx - ex, y - h / 2, cz - ez, 0, 0], [cx + ex, y + h / 2, cz + ez, 1, 1], [cx - ex, y + h / 2, cz - ez, 0, 1]]) { pos.push(px, py, pz); uv.push(u, v); }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.computeVertexNormals();
    const m = new THREE.Mesh(g, mat_); m.name = name; parent.add(m); return m;
  }
  function buildFar(parent) {
    const add = (o, name) => { o.name = name; parent.add(o); return o; };
    // the sky dome: vertex colours rewritten by applySky (gradient + a glow toward the dawn)
    const dg = new THREE.SphereGeometry(540, 24, 12, 0, TAU, 0, PI * 0.56); dg.setAttribute('color', new THREE.BufferAttribute(new Float32Array(dg.attributes.position.count * 3), 3));
    R.dome = add(new THREE.Mesh(dg, SKY.dome), 'sky_f'); R.dome.renderOrder = -3; R.dome.position.y = -20;
    R.domeCol = dg.attributes.color; R.domePos = dg.attributes.position;
    R.band = add(new THREE.Mesh(silhouettes(), SKY.land), 'band_f');
    const hz = new THREE.CylinderGeometry(460, 460, 34, 48, 1, true); hz.translate(0, WY - 1 + 17, 0);
    const haze = new THREE.Mesh(hz, SKY.haze); haze.name = 'haze_f'; haze.renderOrder = -2; R.band.add(haze);
    const sk = new THREE.CylinderGeometry(456, 456, 80, 48, 1, true); sk.translate(0, WY - 40.6, 0);
    add(new THREE.Mesh(sk, SKY.skirt), 'skirt_f');
    add(new THREE.Mesh(bridgeGeo(BR_A, BR_B, WY, false), SKY.bridge), 'bridge_f');
    R.bLights = add(new THREE.Group(), 'bridge_lights_f');
    R.bLights.add(new THREE.Mesh(bridgeGeo(BR_A, BR_B, WY, true), SKY.bLamp));
    const dl = []; for (let k = 0; k < 12; k++) { const u = (k + 0.5) / 12; dl.push([BR_A[0] + (BR_B[0] - BR_A[0]) * u, WY + 12 + Math.exp(-(((u - 0.55) / 0.13) ** 2)) * 4, BR_A[2] + (BR_B[2] - BR_A[2]) * u, 0]); }
    R.bDrones = IM(new THREE.BoxGeometry(0.9, 0.9, 0.9), SKY.bDrone, dl, 'bridge_drones_f', R.bLights);
    // the sun (morning21) low over the bay, a little right; a halo
    R.sun = add(new THREE.Group(), 'sun_f');
    { const a = -6 * PI / 180, e = 7 * PI / 180; R.sun.position.set(Math.sin(a) * Math.cos(e) * 420, Math.sin(e) * 420 + WY, Math.cos(a) * Math.cos(e) * 420); R.sun.lookAt(0, 0, 0); }
    R.sun.add(new THREE.Mesh(new THREE.CircleGeometry(8, 24), SKY.sun)); { const h = new THREE.Mesh(new THREE.PlaneGeometry(110, 110), SKY.halo); h.position.z = 0.5; h.renderOrder = 2; R.sun.add(h); }
    // cumulus cards + the dawn storm bank (6 low dark cards on the horizon, bearing -10..40)
    seed = 93; const cl = []; for (let i = 0; i < 8; i++) { const w = 70 + rnd() * 60; cl.push([-150 + i * 37 + rnd() * 18, 300 + rnd() * 140, WY + 55 + rnd() * 90, w, w * 0.45]); }
    R.clouds = cards(cl, SKY.cloud, 'clouds_f', parent); R.clouds.renderOrder = -1;
    seed = 47; const sb = []; for (let i = 0; i < 6; i++) { const w = 105 + rnd() * 30; const h = 34 + rnd() * 10; sb.push([-10 + i * 10 + (rnd() - 0.5) * 4, 418 + rnd() * 6, WY - 3 + h / 2 + rnd() * 4, w, h]); }
    R.storm = cards(sb, SKY.storm, 'storm_bank_f', parent); R.storm.renderOrder = -1;
  }

  // ---------------------------------------------------------- props
  function props(root) {
    const P = (g) => (root.add(g), g);
    // ---- the fridge: the pelican magnet + the folded card under it (the millimetre); the open card for Luka's hands
    R.pelican = P(part('pelican_magnet', () => {   // a flat magnet in profile on the door (faces -X), about 8 cm
      const W = 0xf4f4f0, t = 0.012;
      ico(0.026, W, -t / 2, 0.0, 0.0, 0.62, M.vc, 0.35, 1.25); ico(0.016, W, -t / 2, 0.024, 0.018, 1.4, M.vc, 0.35, 0.6);
      ico(0.012, W, -t / 2, 0.048, 0.022, 1, M.vc, 0.4, 1.0); boxR(0.006, 0.006, 0.045, 0xf0a060, -t / 2, 0.044, 0.048, 0.25, 0, 0);
      boxR(0.006, 0.01, 0.034, 0xe89060, -t / 2, 0.036, 0.042, 0.4, 0, 0); bb(-t - 0.001, 0.05, 0.026, -t, 0.054, 0.03, 0x1a1a1a);
      ico(0.014, 0x8a8e94, -t / 2, 0.004, -0.03, 0.5, M.vc, 0.36, 1.0);
    }, [3.276, 1.43, -3.12], 0, { floor: false }));
    R.card = P(new THREE.Group()); R.card.name = 'fridge_card'; R.card.position.set(3.281, 1.445, -3.12);
    R.card.add(part('', () => { tq(0.15, 0.104, A_CARD, 0, -0.045, 0, -H); bb(0.0005, -0.096, -0.074, 0.003, 0.006, 0.074, 0xd8ceb8); }, null, 0, { floor: false }));
    R.card.userData.state = (s) => { R.cardState = s; R.card.visible = s !== 'out'; R.card.rotation.x = s === 'back' ? 0 : 0.035; if (R.order) R.order.visible = s === 'out'; };
    R.order = P(part('order_card', () => {   // the card opened (~0.24 x 0.16), front faces +Z; home = where the folded one hangs
      tq(0.24, 0.16, A_ORDER, 0, -0.08, 0.002); bb(-0.12, -0.16, -0.002, 0.12, 0.0, 0.0, 0xe6dcc6);
    }, [3.272, 1.45, -3.12], -H, { floor: false }));
    R.order.visible = false;   // fridge_card.state('out') shows it (content then holds it: hold('luka', 'order_card'))
    // ---- the sticky note wall (hero band + fill), on the x -4 face
    R.sticky = P(part('sticky_wall', () => {
      quad(1.5, 1.5, M.hero, -3.99, 1.7, -1.8, H);
      wallT(-3.991, -3.4, -3.991, -2.55, 0.95, 2.45, 'x+', M.fill, 0.5); wallT(-3.991, -1.05, -3.991, -0.3, 0.95, 2.45, 'x+', M.fill, 0.5);
      seed = 515;   // ragged edges: notes overlapping the panel border
      for (let z = -3.38; z < -0.3; z += 0.075 + rnd() * 0.04) { noteOn('x+', -3.986, 2.45 + (rnd() - 0.4) * 0.05, z, 0.07, (rnd() - 0.5) * 0.4, NOTE[Math.floor(rnd() * 5)], false); noteOn('x+', -3.986, 0.95 + (rnd() - 0.6) * 0.05, z + 0.03, 0.07, (rnd() - 0.5) * 0.4, NOTE[Math.floor(rnd() * 5)], false); }
      for (let y = 0.98; y < 2.45; y += 0.08 + rnd() * 0.04) { noteOn('x+', -3.986, y, -3.4 + (rnd() - 0.6) * 0.05, 0.07, (rnd() - 0.5) * 0.4, NOTE[Math.floor(rnd() * 5)], false); noteOn('x+', -3.986, y + 0.03, -0.3 + (rnd() - 0.4) * 0.05, 0.07, (rnd() - 0.5) * 0.4, NOTE[Math.floor(rnd() * 5)], false); }
      for (let i = 0; i < 14; i++) noteOn('x+', -3.987, 2.48 + rnd() * 0.08, -3.3 + rnd() * 2.9, 0.07, (rnd() - 0.5) * 0.5, NOTE[Math.floor(rnd() * 5)]);
    }, null, 0, { floor: false }));
    // ---- the keyboard's dust sheet: a fixed back half + a flap (front half, front drape, front halves of the ends)
    R.sheet = P(new THREE.Group()); R.sheet.name = 'keyboard_sheet';
    R.sheet.add(part('sheet_fixed', () => {
      bb(-3.99, 0.88, -3.49, -3.78, 0.9, -2.11, 0xffffff, M.sheet); bb(-3.99, 0.42, -3.49, -3.975, 0.9, -2.11, 0xffffff, M.sheet);
      boxR(0.2, 0.03, 0.05, 0xf2f2ec, -3.88, 0.905, -3.0, 0, 0.3, 0); boxR(0.18, 0.025, 0.05, 0xf2f2ec, -3.87, 0.903, -2.45, 0, -0.4, 0);   // rumples
      bb(-3.99, 0.5, -3.49, -3.78, 0.9, -3.47, 0xffffff, M.sheet); bb(-3.99, 0.46, -2.13, -3.78, 0.9, -2.11, 0xffffff, M.sheet);
    }, null, 0, { floor: false }));
    R.flap = part('sheet_flap', () => {   // local: hinge at the origin, the flap extends +X (toward the room)
      bb(0, -0.02, -0.69, 0.25, 0.0, 0.69, 0xffffff, M.sheet); boxR(0.12, 0.025, 0.05, 0xf2f2ec, 0.1, 0.006, 0.25, 0, 0.5, 0);
    }, [-3.78, 0.9, -2.8], 0, { floor: false });
    R.drape = part('sheet_drape', () => {   // hangs from the flap's front edge in soft folds; scales away as the flap folds back
      seed = 19;
      for (let k = 0; k < 9; k++) { const z0 = -0.67 + k * 1.34 / 9, z1 = z0 + 1.34 / 9 + 0.01, d = (k % 2 ? 0.012 : 0) + rnd() * 0.008; bb(0.23 + d, -0.44 - rnd() * 0.1, z0, 0.25 + d, 0.0, z1, k % 2 ? 0xf0f0ea : 0xffffff, M.sheet); }
      bb(0, -0.42, -0.69, 0.25, 0.0, -0.67, 0xffffff, M.sheet); bb(0, -0.46, 0.67, 0.25, 0.0, 0.69, 0xffffff, M.sheet);
    }, null, 0, { floor: false });
    R.flap.add(R.drape); R.sheet.add(R.flap);
    R.sheet.userData.lift = (on) => { twSet(tw.sheet, on ? 1 : 0, 0.4); R.sheetUp = !!on; };
    // ---- the music slate on the desk (PROPS.slate with its own screen)
    R.slate = PROPS.slate({ key: 'flat_slate' }); R.slate.name = 'slate_desk'; R.slate.position.set(-3.72, 0.762, -0.95); R.slate.rotation.y = H; P(R.slate);
    R.slateScr = R.slate.userData.screen; R.slateMat = R.slateScr.mat;
    R.slate.userData.screen = (mode) => { if (mode !== 'folder' && mode !== 'list' && mode !== 'play') mode = 'off'; if (R.slateMode === mode) return; R.slateMode = mode; R.slateScr.paint((c, w, h) => paintSlate(c, w, h, mode)); };
    R.slate.userData.screenApi = R.slateScr;
    // ---- the bookshelf: notebooks (shelf 3) and the photo (shelf 4)
    P(part('notebooks', () => {
      bb(-0.09, 1.15, -3.5, 0.59, 1.36, -3.292, 0x1d1f24); tq(0.68, 0.21, A_NB, 0.25, 1.255, -3.29);
      bb(-0.09, 1.36, -3.48, 0.59, 1.362, -3.31, 0xe8e4da);
    }, null, 0, { floor: false }));
    P(part('photo_2031', () => {
      boxR(0.24, 0.18, 0.014, 0x2b2622, 0, 0.09, -0.009, -0.12, 0, 0); tq(0.24, 0.18, A_PHOTO, 0, 0.09, 0.0, 0, -0.12);
      boxR(0.02, 0.12, 0.08, 0x2b2622, 0, 0.06, -0.05, 0.35, 0, 0);
    }, [0.0, 1.6, -3.36], 0, { floor: false }));
    // ---- the kettle (a normal kettle: no screen)
    R.kettle = PROPS.kettle(); R.kettle.name = 'kettle'; R.kettle.position.set(3.72, 0.92, -2.1); R.kettle.rotation.y = -H; P(R.kettle);
    R.kettle.userData.steam = () => { if (typeof world !== 'undefined' && world.puff && !skipping()) world.puff(STEAM_AT, STEAM_O); };
    // ---- the balcony slider: two glass panels (W on the outer track, E inner) sliding into the cavity beyond x -1.0
    R.balcony = P(new THREE.Group()); R.balcony.name = 'balcony_door';
    const panel = (name, z) => part(name, () => {
      bb(0, 0.025, z - 0.02, 1.22, 0.07, z + 0.02, ALU); bb(0, 2.0, z - 0.02, 1.22, 2.06, z + 0.02, ALU);
      bb(0, 0.025, z - 0.02, 0.05, 2.06, z + 0.02, ALU); bb(1.17, 0.025, z - 0.02, 1.22, 2.06, z + 0.02, ALU);
      quad(1.12, 1.93, M.glass, 0.61, 1.035, z); bb(0.06, 0.95, z - 0.03, 0.08, 1.15, z + 0.03, 0x3a3e44);
    }, null, 0, { floor: false });
    R.panelW = panel('door_panel_w', 0.1); R.panelE = panel('door_panel_e', 0.05); R.balcony.add(R.panelW, R.panelE);
    R.balcony.userData.open = (u) => twSet(tw.door, clamp01(+u || 0), 0.6);
    // ---- the sheer curtain gathered at the door's east side (3 strips, pivoting at the rod)
    R.curtain = P(new THREE.Group()); R.curtain.name = 'curtain'; R.strips = [];
    for (let i = 0; i < 3; i++) {
      const s = part('', () => { quad(0.17, 2.18, M.curtain, 0, -1.09, 0, (i - 1) * 0.5); }, [-0.95 + i * 0.13, 2.23, -0.08 - (i % 2) * 0.03], 0, { floor: false });
      R.curtain.add(s); R.strips.push(s);
    }
    // ---- doors: the bedroom door (hinge x -1.4, into the bedroom) and the entry door (hinge x 2.1, onto the landing)
    R.bedDoor = P(part('bedroom_door', () => {
      bb(0, 0, -0.02, 0.88, 2.06, 0.02, DOORC); bb(0.06, 0.1, 0.02, 0.82, 0.12, 0.024, 0xdcd6c8); bb(0.06, 1.94, 0.02, 0.82, 1.96, 0.024, 0xdcd6c8);
      for (const z of [-0.035, 0.035]) { bb(0.77, 0.98, z - 0.006, 0.81, 1.0, z + 0.006, STEEL); bb(0.79, 0.97, z - 0.015, 0.83, 1.01, z + 0.015, STEEL); }
      noteOn('z+', 0.45, 1.5, 0.022, 0.075, 0.12, NOTE[3]);
    }, [-1.38, 0, -3.6], 0, { floor: false }));
    R.bedDoor.userData.open = (a) => twSet(tw.bed, Math.max(0, Math.min(1.4, +a || 0)), 0.5);
    R.colBed = [-1.4, -3.65, -0.5, -3.55]; COL.push(R.colBed);
    R.entry = P(part('entry_door', () => {   // local: the leaf extends -X from the hinge
      bb(-0.88, 0, -0.022, 0, 2.06, 0.022, 0xe6e0d2); bb(-0.8, 0.12, 0.022, -0.08, 0.9, 0.026, 0xdcd6c8); bb(-0.8, 1.0, 0.022, -0.08, 1.94, 0.026, 0xdcd6c8);
      for (const z of [-0.04, 0.04]) bb(-0.82, 0.96, z - 0.015, -0.78, 1.0, z + 0.015, STEEL);
      cyl(0.008, 0.008, 0.05, 6, STEEL, -0.44, 1.55, 0, H, 0);                                          // the peephole
    }, [2.08, 0, -3.6], 0, { floor: false }));
    R.entry.userData.open = (on) => twSet(tw.entry, on ? 1 : 0, 0.5);
    R.colEntry = [1.2, -3.65, 2.1, -3.55]; COL.push(R.colEntry);
    // ---- the box of Christmas decorations under the bed (slides out +X 0.9 m; flaps open)
    R.box = P(new THREE.Group()); R.box.name = 'deco_box'; R.box.position.set(-2.6, 0, -5.4);
    R.box.add(part('', () => {
      bb(-0.35, 0, -0.25, 0.35, 0.26, -0.23, CARDB); bb(-0.35, 0, 0.23, 0.35, 0.26, 0.25, CARDB); bb(-0.35, 0, -0.23, -0.33, 0.26, 0.23, CARDB); bb(0.33, 0, -0.23, 0.35, 0.26, 0.23, CARDB);
      bb(-0.33, 0, -0.23, 0.33, 0.02, 0.23, 0x8a6a40); tq(0.66, 0.46, A_DECO, 0, 0.16, 0, 0, -H); bb(-0.33, 0.02, -0.23, 0.33, 0.158, 0.23, 0x6a5232);
      bb(0.349, 0.08, -0.12, 0.352, 0.18, 0.12, 0xe8e0d0); bb(0.352, 0.11, -0.08, 0.354, 0.15, 0.08, 0xd8323a);   // a label: XMAS (red marker line)
    }, null, 0));
    R.flaps = [];
    for (const [px, pz, len, wid, axis, sgn, fy] of [[0, -0.24, 0.7, 0.22, 'x', -1, 0.268], [0, 0.24, 0.7, 0.22, 'x', 1, 0.268], [-0.34, 0, 0.46, 0.2, 'z', 1, 0.262], [0.34, 0, 0.46, 0.2, 'z', -1, 0.262]]) {
      const f = part('', () => { if (axis === 'x') bb(-len / 2, -0.004, sgn > 0 ? -wid : 0, len / 2, 0.004, sgn > 0 ? 0 : wid, 0xc8a070); else bb(sgn > 0 ? 0 : -wid, -0.004, -len / 2, sgn > 0 ? wid : 0, 0.004, len / 2, 0xbd9668); }, [px, fy, pz], 0, { floor: false });
      f.userData.axis = axis; f.userData.sgn = sgn; R.box.add(f); R.flaps.push(f);
    }
    R.kit = new THREE.Group(); R.kit.name = 'santa_kit'; R.box.add(R.kit);
    { const h = PROPS.santa_hat(); h.name = 'kit_hat'; h.position.set(0.14, 0.15, -0.04); h.rotation.set(0.3, 0.6, 1.4); h.scale.setScalar(0.85); R.kit.add(h);
      const bd = PROPS.santa_beard(); bd.name = 'kit_beard'; bd.position.set(-0.02, 0.2, 0.1); bd.rotation.set(-1.35, 0.4, 0); bd.scale.setScalar(0.9); R.kit.add(bd); }
    R.box.userData.state = (s) => { R.boxState = s; twSet(tw.box, s === 'under' ? 0 : 1, 0.5); twSet(tw.flaps, s === 'open' ? 1 : 0, s === 'open' ? 0.45 : 0.2); };
    R.colBox = [1e4, 1e4, 1e4, 1e4]; COL.push(R.colBox);
    // ---- story props: the chips, the teas, the tea towel, toast, the plan
    R.chips = P(part('chips_parcel', () => {   // white paper parcel, folded ends, a grease spot, the stamp
      boxR(0.3, 0.085, 0.2, 0xf4f2ec, 0, 0.0425, 0, 0, 0.15, 0); boxR(0.3, 0.02, 0.06, 0xe8e6de, 0, 0.09, 0.0, 0, 0.15, 0);
      boxR(0.07, 0.003, 0.05, 0xd8c8a0, -0.07, 0.0865, 0.04, 0, 0.15, 0); tq(0.1, 0.05, A_LABEL, 0.06, 0.0865, -0.04, 0.15, -H, M.atlas);
    }, [3.7, 0.92, -1.5], -H, { floor: false }));
    R.teas = P(new THREE.Group()); R.teas.name = 'teas';
    const mug = (name, col, x) => { const g = part(name, () => { cyl(0.042, 0.038, 0.1, 10, col, 0, 0.05, 0); cyl(0.036, 0.036, 0.004, 10, 0x7a4a26, 0, 0.09, 0); boxR(0.014, 0.06, 0.04, col, 0.045, 0.05, 0, 0, 0, 0); }, [x, 0, 0], 0, { floor: false }); R.teas.add(g); return g; };
    R.tea1 = mug('tea_1', 0xe8e4dc, -0.09); R.tea2 = mug('tea_2', 0x4a7ab0, 0.09);
    R.teas.userData.state = (s) => {
      R.teasState = s; R.teas.visible = s !== 'hidden';
      if (s === 'rail') { R.teas.position.set(-2.3, 1.05, 1.45); R.teas.rotation.y = 0; } else { R.teas.position.set(3.62, 0.92, -1.72); R.teas.rotation.y = H; }
    };
    R.towel = P(part('tea_towel', () => {   // draped over the rail by the polishing spot: white with blue stripes
      bb(-0.22, 1.0, 1.43, 0.22, 1.06, 1.57, 0xf2f0ea); bb(-0.22, 0.72, 1.565, 0.22, 1.06, 1.575, 0xf2f0ea); bb(-0.22, 0.86, 1.425, 0.22, 1.06, 1.435, 0xf2f0ea);
      bb(-0.22, 0.9, 1.576, 0.22, 0.93, 1.578, 0x3a6ab0); bb(-0.22, 0.8, 1.576, 0.22, 0.82, 1.578, 0x3a6ab0);
    }, [-3.3, 0, 0], 0, { floor: false }));
    R.toast = P(part('toast', () => {   // two plates of toast + three mugs on the table (morning21)
      for (const [x, z] of [[1.98, -0.98], [2.62, -0.92]]) { cyl(0.11, 0.09, 0.015, 14, 0xf6f4ee, x, 0.758, z);
        for (let k = 0; k < 2; k++) { boxR(0.1, 0.012, 0.1, 0xb07a40, x + (k - 0.5) * 0.05, 0.772 + k * 0.012, z + (k - 0.5) * 0.03, 0, (k - 0.5) * 0.6, 0); } }
      for (const [x, z, col] of [[1.98, -0.72, 0xe8e4dc], [2.62, -1.18, 0xc84a3a], [2.3, -1.28, 0x4a7ab0]]) { cyl(0.04, 0.036, 0.095, 10, col, x, 0.7975, z); cyl(0.034, 0.034, 0.004, 10, 0x7a4a26, x, 0.84, z); }
      boxR(0.18, 0.004, 0.018, STEEL, 2.08, 0.769, -1.12, 0, 0.4, 0);
    }, null, 0, { floor: false }));
    // toast tops: the atlas toast cell on each slice's top
    R.toast.add(part('', () => { for (const [x, z] of [[1.98, -0.98], [2.62, -0.92]]) for (let k = 0; k < 2; k++) tq(0.098, 0.098, A_TOAST, x + (k - 0.5) * 0.05, 0.7785 + k * 0.012, z + (k - 0.5) * 0.03, (k - 0.5) * 0.6, -H); }, null, 0, { floor: false }));
    R.plan = P(new THREE.Group()); R.plan.name = 'plan_notes'; R.planN = [];
    for (let k = 0; k < 3; k++) { const n = part('', () => tq(0.09, 0.072, A_PLAN[k], 0, 0, 0, [0.06, -0.04, 0.08][k], -H), [2.17 + k * 0.13, 0.752 + k * 0.0005, -0.98 + [0.01, -0.02, 0.02][k]], 0, { floor: false }); R.plan.add(n); R.planN.push(n); }
    R.plan.userData.show = (n) => { R.planShown = Math.max(0, Math.min(3, n | 0)); for (let k = 0; k < 3; k++) R.planN[k].visible = k < R.planShown; };
    // ---- lamps: the pendant over the table (the spot in evening), the desk lamp
    R.pendant = P(part('pendant', () => {
      cyl(0.004, 0.004, 0.42, 4, 0x2a2a2a, 0, 2.39, 0); cyl(0.05, 0.05, 0.03, 10, 0xe8e4dc, 0, 2.585, 0);
      cyl(0.04, 0.2, 0.17, 12, 0x2f5a52, 0, 2.1, 0); cyl(0.2, 0.2, 0.012, 12, 0xffffff, 0, 2.016, 0, 0, 0, M.pend);
    }, [2.3, 0, -0.95], 0, { floor: false }));
    R.pendant.userData.on = (on) => { R.pendOn = !!on; M.pend.emissiveIntensity = on ? 1.1 : 0.04; };
    R.lampDesk = P(part('desk_lamp', () => {
      cyl(0.07, 0.08, 0.025, 10, 0x2a2c30, 0, 0.0125, 0); boxR(0.016, 0.34, 0.016, 0x2a2c30, 0.05, 0.17, 0, 0, 0, -0.32);
      boxR(0.016, 0.3, 0.016, 0x2a2c30, 0.15, 0.42, 0, 0, 0, 0.75);
      cyl(0.03, 0.075, 0.12, 10, 0x8a3a34, 0.02, 0.5, 0, 0, -0.9); cyl(0.07, 0.07, 0.006, 10, 0xffffff, 0.06, 0.465, 0, 0, -0.9, M.lamp);
      noteOn('z+', 0.0, 0.5, 0.074, 0.06, 0.2, NOTE[4], false);
    }, [-3.88, 0.76, -0.62], 0, { floor: false }));
    R.lampDesk.userData.on = (on) => { R.lampOn = !!on; M.lamp.emissiveIntensity = on ? 1.0 : 0.03; };
    // ---- the couch blanket: folded on the west arm, or spread (Chase slept under it)
    R.blanket = P(new THREE.Group()); R.blanket.name = 'couch_blanket';
    R.blFold = part('blanket_folded', () => { bb(-2.74, 0.42, -2.62, -2.36, 0.52, -2.3, OAT); bb(-2.74, 0.52, -2.6, -2.38, 0.53, -2.32, 0xbfb398); }, null, 0, { floor: false });
    R.blSpread = part('blanket_spread', () => {
      boxR(1.4, 0.05, 0.55, OAT, -1.95, 0.45, -2.5, 0, 0.06, 0.03); boxR(0.9, 0.06, 0.4, 0xbfb398, -2.2, 0.47, -2.45, 0, -0.1, 0);
      boxR(1.1, 0.34, 0.03, OAT, -1.95, 0.3, -2.19, 0.15, 0.04, 0); boxR(0.4, 0.04, 0.6, OAT, -1.25, 0.04, -1.95, 0, 0.4, 0);   // hanging + a corner on the floor
    }, null, 0, { floor: false });
    R.blanket.add(R.blFold, R.blSpread);
    R.blanket.userData.state = (s) => { R.blanketState = s; R.blFold.visible = s !== 'spread'; R.blSpread.visible = s === 'spread'; };
    // ---- the dying plant (a different one)
    P(part('plant_dying', () => {
      cyl(0.15, 0.11, 0.3, 10, 0xb06a48, 0, 0.15, 0); cyl(0.158, 0.158, 0.04, 10, 0xc07a58, 0, 0.29, 0); cyl(0.135, 0.135, 0.01, 10, 0x3a2a1c, 0, 0.305, 0);
      seed = 71;
      for (let i = 0; i < 7; i++) {
        const a = i * TAU / 7 + rnd(), lean = 0.2 + rnd() * 0.35, h = 0.3 + rnd() * 0.25, sx = Math.cos(a), sz = Math.sin(a);
        boxR(0.012, h, 0.012, 0x6a7a3a, sx * h * 0.25, 0.31 + h / 2, sz * h * 0.25, sz * lean, 0, -sx * lean);
        const tx = sx * h * 0.5, tz = sz * h * 0.5, ty = 0.31 + h * 0.95;
        for (let k = 0; k < 2; k++) boxR(0.09, 0.008, 0.045, [0x8a8a3a, 0x9a7a3a, 0x7a5a2a][(i + k) % 3], tx + sx * 0.05 * (k + 1), ty - 0.06 * (k + 1), tz + sz * 0.05 * (k + 1), sz * 0.9, a, -sx * 0.9);
      }
      for (const [x, z, r] of [[0.25, 0.12, 0.4], [-0.2, 0.22, 1.2], [0.1, -0.24, 2.0]]) boxR(0.07, 0.004, 0.035, 0x8a6a3a, x, 0.004, z, 0, r, 0);
    }, [-0.75, 0, -0.35], 0));
    COL.push([-0.95, -0.55, -0.55, -0.15]);
    // ---- the snore "z" rising from the bedroom doorway
    R.zz = P(new THREE.Group()); R.zz.name = 'snore_z';
    R.zzQ = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.22), M.zz); R.zz.add(R.zzQ); R.zz.position.set(-0.7, 1.55, -3.7);
    R.zz.userData.on = (on) => { R.snoreOn = !!on; R.zz.visible = R.snoreOn; sendAmbience(); };
    // ---- the Christmas lights: three phases (InstancedMeshes, per-instance colour), chase blink in update
    R.lights = P(new THREE.Group()); R.lights.name = 'xmas_lights'; R.phIM = [];
    for (let p = 0; p < 3; p++) {
      const list = []; for (let i = p; i < LIGHT_POS.length; i += 3) list.push([LIGHT_POS[i][0], LIGHT_POS[i][1], LIGHT_POS[i][2], 0, [1, 1.35, 1]]);
      const im = IM(new THREE.IcosahedronGeometry(0.03, 0), SKY.ph[p], list, 'xmas_lights_' + p, R.lights);
      for (let i = 0; i < list.length; i++) im.setColorAt(i, tc.set(XCOL[(i * 3 + p) % 4]));
      im.instanceColor.needsUpdate = true; R.phIM.push(im);
    }
  }
  function outsideProps(root) {
    const P = (g) => (root.add(g), g);
    // palms: promenade (z 14.4) + park + beach; trunks, crowns, the light sleeves (promenade six)
    const PALMS = [[-36, 14.4, 5.1], [-28, 14.4, 5.4], [-20, 14.4, 5.0], [-12, 14.4, 5.3], [-4, 14.4, 5.1], [4, 14.4, 5.2], [-33.5, 22.5, 6.2], [-16, 22.5, 6.6], [2, 19.5, 5.8], [6, 23, 6.4], [-22, 27.5, 6.0]];
    R.palms = P(new THREE.Group()); R.palms.name = 'palms_f';
    const tg = new THREE.CylinderGeometry(0.16, 0.26, 1, 7); tg.translate(0, 0.5, 0);
    IM(tg, M.extI, PALMS.map(([x, z, h]) => [x, Y0, z, 0, [1, h, 1]]), 'palm_trunks', R.palms);
    IM(geoOf(palmCrown), M.extI, PALMS.map(([x, z, h], i) => [x, Y0 + h, z, i * 1.3, 1]), 'palm_crowns', R.palms);
    const sg = new THREE.CylinderGeometry(0.235, 0.27, 2.6, 8, 1, true); sg.translate(0, 1.6, 0);
    R.sleeveA = IM(sg, SKY.sleeveA, PALMS.slice(0, 6).filter((p, i) => i % 2 === 0).map(([x, z]) => [x, Y0, z, 0, 1]), 'palm_sleeves_a', R.palms);
    R.sleeveB = IM(sg.clone(), SKY.sleeveB, PALMS.slice(0, 6).filter((p, i) => i % 2 === 1).map(([x, z]) => [x, Y0, z, 0, 1]), 'palm_sleeves_b', R.palms);
    // street lamps (z 12.6) + the jetty lamps (smaller): posts + heads
    R.lamps = P(new THREE.Group()); R.lamps.name = 'lamps_f';
    const LAMPS = [-32, -24, -16, -8, 0, 8].map((x) => [x, Y0, 12.6, PI, 1]);
    for (const [x, z, ry] of [[-45.6, 32, -H], [-42.4, 40, H], [-45.6, 48, -H], [-42.4, 56, H], [-51.8, 64, -H], [-36.2, 64, H]]) LAMPS.push([x, Y0, z, ry, 0.62]);
    IM(geoOf(() => { cyl(0.06, 0.09, 5.0, 6, 0x5a6068, 0, 2.5, 0); boxR(0.06, 0.06, 0.7, 0x5a6068, 0, 4.95, 0.32); }), M.extI, LAMPS, 'lamp_posts', R.lamps);
    R.heads = IM(geoOf(() => { boxR(0.36, 0.12, 0.5, 0xffffff, 0, 4.88, 0.62); }), SKY.head, LAMPS, 'lamp_heads', R.lamps);
    // the jetty's piles + rail posts
    R.jetty = P(new THREE.Group()); R.jetty.name = 'jetty_f';
    const piles = []; for (let z = 26; z < 61; z += 3.6) piles.push([-45.6, WY - 2.5, z, 0, 1], [-42.4, WY - 2.5, z, 0, 1]);
    for (let x = -51; x <= -37; x += 3.5) piles.push([x, WY - 2.5, 61.5, 0, 1], [x, WY - 2.5, 66.5, 0, 1]);
    IM(geoOf(() => cyl(0.16, 0.16, 4.2, 6, 0x6a5a48, 0, 2.1, 0)), M.extI, piles.slice(0, 30), 'jetty_piles', R.jetty);
    const posts = []; for (let z = 25.5; z < 61; z += 1.8) posts.push([-45.65, Y0, z, 0, 1], [-42.35, Y0, z, 0, 1]);
    IM(geoOf(() => bb(-0.05, 0, -0.05, 0.05, 1.05, 0.05, 0xb8ac98)), M.extI, posts.slice(0, 40), 'jetty_posts', R.jetty);
    // hover-cars: 3 (+X lane z 6, -X lane z 10), bodies + glows (written by update)
    R.traffic = P(new THREE.Group()); R.traffic.name = 'traffic_f';
    const far3 = [[0, -50, 0, 0, 0.001], [0, -50, 0, 0, 0.001], [0, -50, 0, 0, 0.001]];
    R.carBody = dyn(IM(geoOf(() => hoverCar(0xe8eef4)), M.car, far3, 'car_bodies', R.traffic));
    R.carGlow = dyn(IM(geoOf(hoverGlow, { ambient: 1 }), SKY.carGlow, far3, 'car_glows', R.traffic));
    for (let i = 0; i < 3; i++) R.carBody.setColorAt(i, tc.set([0xffffff, 0xb8d0e8, 0xf0c8c0][i]));
    R.carBody.instanceColor.needsUpdate = true;
  }

  // ---------------------------------------------------------- build
  function build() {
    COL.length = 0; T = textures(); initMats();
    const root = new THREE.Group(); root.name = 'flat_root'; R.root = root;
    b = new Builder(); XF = null; tint = IN;
    shell(); windowAndBalcony(); living(); kitchen(); bedroom(); landing();
    root.add(b.done());
    // the street: its own builder (ambient occlusion from the Parade's ground)
    b = new Builder(); XF = null; tint = OUTT;
    street(root);
    const st = b.done({ y0: Y0 }); st.name = 'street_f'; root.add(st);
    b = new Builder(); XF = null;
    waterPlane();
    const wt = b.done({ floor: false }); wt.name = 'water_f'; root.add(wt);
    R.foam = part('foam_f', () => { const g = new THREE.PlaneGeometry(196, 1.4); g.rotateX(-H); g.translate(62, WY + 0.03, 35.7); put(wuv(g, 5), 0xffffff, M.foam); }, null, 0, { floor: false }); root.add(R.foam);
    // street_f's static mesh uses M.vc for the generic bits: give the exterior its own (tinted) material
    st.traverse((o) => { if (o.isMesh && o.material === M.vc) o.material = M.ext; });
    b = null; XF = null;
    buildFar(root);
    props(root);
    outsideProps(root);
    // reset live state
    R.scene = undefined; R.env = null; R.dressed = null; R.level = 0; R.levelTo = 0; R.levelDrawn = -1; R.ambKey = null;
    R.torchOwned = false; R.slateMode = null; R.snoreOn = false; R.pendOn = false; R.lampOn = false; R.tCount = 0; R.stormT = 0;
    R.skyFrom = null; R.skyK = 1; R.skyName = null;
    for (let i = 0; i < TWS.length; i++) twSnap(TWS[i], 0);
    dress(AUTO[typeof state !== 'undefined' && state ? state.scene : ''] || 'evening18');
    if (typeof TEST !== 'undefined' && TEST.setview === 'flat' && typeof window !== 'undefined' && window.TWO_TEST) {   // set inspection helpers
      window.TWO_TEST.dress = (s) => dress(s);
      window.TWO_TEST.call = (name, fn, ...a) => { const o = R.root.getObjectByName(name); return o && typeof o.userData[fn] === 'function' ? (o.userData[fn](...a), true) : false; };
      window.TWO_TEST.shot = (s) => { if (typeof cam !== 'undefined') cam.shot(s); };
      window.TWO_TEST.flat = () => SETS.flat;
    }
    return root;
  }

  // ---------------------------------------------------------- dressing, ambience
  const AUTO = { '1.8': 'evening18', '2.1': 'dawn21' };
  const ENV_DRESS = { evening: 'evening18', dawn: 'dawn21', morning: 'morning21' };
  const AMB = {   // spec §10 (every name is a bed in 03-audio: AUDIO.loopNames())
    evening18: { loops: ['fridge', 'parade_far'], room: 'room' },
    dawn21: { loops: ['birds_dawn', 'bay_far', ['snore', 0.5]], room: 'room' },
    dawn21q: { loops: ['birds_dawn', 'bay_far'], room: 'room' },
    morning21: { loops: ['birds_dawn', 'bay_far', 'fridge'], room: 'room' },
  };
  const ambKey = () => (R.dressed === 'dawn21' && !R.snoreOn ? 'dawn21q' : R.dressed || 'evening18');
  function sendAmbience() {
    const k = ambKey(); if (k === R.ambKey) return;
    if (typeof AUDIO === 'undefined' || typeof world === 'undefined' || world.setId !== 'flat') return;
    R.ambKey = k;
    try { AUDIO.ambience(AMB[k]); AUDIO.setRoom(AMB[k].room || 'room'); } catch (e) { /* audio not up yet */ }
  }
  function dress(st) {
    if (!AMB[st] || st === 'dawn21q') st = 'evening18';
    if (!R.root) return;
    R.dressed = st; LIE.on = false;
    const E = st === 'evening18', D = st === 'dawn21', Mo = st === 'morning21';
    twSnap(tw.door, E ? 0.5 : D ? 0 : 1); twSnap(tw.bed, E ? 0 : D ? 0.45 : 1.4); twSnap(tw.entry, 0);
    twSnap(tw.sheet, 0); R.sheetUp = false;
    R.box.userData.state('under'); twSnap(tw.box, 0); twSnap(tw.flaps, 0); R.kit.visible = true;
    R.pendant.userData.on(E); R.lampDesk.userData.on(E);
    R.card.userData.state(E ? 'under' : 'back'); R.order.visible = false;
    R.slate.userData.screen('off');
    R.blanket.userData.state(E ? 'folded' : 'spread');
    R.chips.visible = false;
    R.teas.userData.state(E ? 'hidden' : D ? 'bench' : 'rail');
    R.towel.visible = !E;
    R.toast.visible = Mo; R.plan.visible = Mo; R.plan.userData.show(0);
    R.snoreOn = D; R.zz.visible = D;
    R.tCount = E ? 2 : D ? 1 : 2;
    for (let i = 0; i < 3; i++) CARS[i].x = CAR0[i];
    R.storm.visible = !E; R.stormT = 0; R.storm.position.x = 0;
    R.sun.visible = Mo;
    applyTweens();
    sendAmbience();
  }
  // the spot as a fixed lamp: [pos, target, angle, penumbra, distance]
  const LAMP = { pendant: [[2.3, 2.05, -0.95], [2.3, 0, -0.95], 0.9, 0.6, 5], dawn: [[-2.2, 2.3, 2.6], [-1.4, 0, -2.4], 0.35, 0.8, 8] };
  const LEVEL = { evening: 1, dawn: 0.6, morning: 0 };
  const EXT_TINT = { evening: 0x56638e, dawn: 0xd0b4bc, morning: 0xfff2e6 };
  const WATER_GLOW = { evening: 0x0a1028, dawn: 0x584c5e, morning: 0x2a3a40 };
  const WATER_TINT = { evening: 0x34467a, dawn: 0xd8b8c4, morning: 0xfff4e8 };
  const LAND_TINT = { evening: 0x3c4672, dawn: 0xb898ac, morning: 0xffead8 };
  const CLOUD_TINT = { evening: 0x2e3656, dawn: 0xf4c4cc, morning: 0xffead4 };
  const CEIL_BOUNCE = { evening: 0x4e463a, dawn: 0x5e5258, morning: 0x8a7e6e };
  const BACKWIN = { evening: 0x141c2c, dawn: 0x6a5a70, morning: 0xa89c98 };
  const SKYC = {   // zenith, horizon (= the preset's fog colour), glow colour, glow bearing (deg), glow amount
    evening: [0x101a3a, 0x2c3a66, 0x3a4680, 180, 0.2],
    dawn: [0x7c84a8, 0xc8a8b0, 0xffc8b4, -12, 0.75],
    morning: [0x98bce0, 0xf0d0b0, 0xfff0d4, -6, 0.8],
  };
  function applySky(name, k) {   // dome vertex colours: lerp from the colours already there by k (1 = snap)
    const S = SKYC[name] || SKYC.evening, P_ = R.domePos, C = R.domeCol, ga = S[3] * PI / 180, gx = Math.sin(ga), gz = Math.cos(ga);
    for (let i = 0; i < P_.count; i++) {
      const x = P_.getX(i), y = P_.getY(i), z = P_.getZ(i), r = Math.sqrt(x * x + y * y + z * z) || 1, el = Math.max(0, y / r);
      const f = Math.pow(el, 0.55), d = Math.max(0, (x * gx + z * gz) / r), glow = S[4] * Math.pow(d, 3) * (1 - smooth(el / 0.45));
      tc.set(S[1]).lerp(tc2.set(S[0]), f); tc2.set(S[2]); tc.lerp(tc2, glow);
      if (k >= 1) C.setXYZ(i, tc.r, tc.g, tc.b);
      else C.setXYZ(i, C.getX(i) + (tc.r - C.getX(i)) * k, C.getY(i) + (tc.g - C.getY(i)) * k, C.getZ(i) + (tc.b - C.getZ(i)) * k);
    }
    C.needsUpdate = true;
  }
  function applyEnv(name) {
    R.levelTo = LEVEL[name] ?? 0;
    M.ext.color.set(EXT_TINT[name] ?? 0xffffff); M.extI.color.copy(M.ext.color); M.car.color.copy(M.ext.color); M.brick.color.copy(M.ext.color);
    M.grass.color.copy(M.ext.color); M.sand.color.copy(M.ext.color); M.foam.color.copy(M.ext.color);
    M.water.color.set(WATER_TINT[name] ?? 0xffffff); M.water.emissive.set(WATER_GLOW[name] ?? 0x000000);
    SKY.land.color.set(LAND_TINT[name] ?? 0xffffff); SKY.bridge.color.copy(SKY.land.color); SKY.cloud.color.set(CLOUD_TINT[name] ?? 0xffffff);
    SKY.storm.color.set(name === 'morning' ? 0xfff0e4 : 0xffffff);
    M.backWin.emissive.set(BACKWIN[name] ?? 0x141c2c); M.ceil.emissive.set(CEIL_BOUNCE[name] ?? 0x4a443c);
    if (R.skyName === null) applySky(name, 1); else R.skyK = 0;
    R.skyName = name;
  }
  function applyTweens() {
    // balcony slider: panel W's west edge -3.4 -> -2.2 (u 0..0.5), then both into the cavity to -1.4 (u 1)
    const u = tw.door.v, xW = u <= 0.5 ? -3.4 + 2.4 * u : -2.2 + 1.6 * (u - 0.5), xE = u <= 0.5 ? -2.2 : -2.2 + 1.6 * (u - 0.5);
    R.panelW.position.x = xW; R.panelE.position.x = xE; R.colDoor[0] = xW;
    // bedroom door (a radians into the bedroom); closed / ajar block the doorway, open leaves the leaf as the wall
    const a = tw.bed.v; R.bedDoor.rotation.y = a;
    if (a < 0.9) { R.colBed[0] = -1.4; R.colBed[1] = -3.65; R.colBed[2] = -0.5; R.colBed[3] = -3.55; }
    else { R.colBed[0] = -1.45; R.colBed[1] = -3.6 - 0.88 * Math.sin(a); R.colBed[2] = -1.38 + 0.88 * Math.cos(a) + 0.04; R.colBed[3] = -3.6; }
    // entry door (onto the landing)
    const e = tw.entry.v; R.entry.rotation.y = -1.4 * e;
    if (e < 0.5) { R.colEntry[0] = 1.2; R.colEntry[1] = -3.65; R.colEntry[2] = 2.1; R.colEntry[3] = -3.55; } else { R.colEntry[0] = R.colEntry[1] = R.colEntry[2] = R.colEntry[3] = 1e4; }
    // the deco box: slides +X 0.9 m; flaps open outward
    const bx = -2.6 + 0.9 * tw.box.v; R.box.position.x = bx;
    if (tw.box.v > 0.6) { R.colBox[0] = bx - 0.35; R.colBox[1] = -5.65; R.colBox[2] = bx + 0.35; R.colBox[3] = -5.15; } else { R.colBox[0] = R.colBox[1] = R.colBox[2] = R.colBox[3] = 1e4; }
    const fo = tw.flaps.v * 2.3;
    for (let i = 0; i < 4; i++) { const f = R.flaps[i]; if (f.userData.axis === 'x') f.rotation.x = f.userData.sgn * fo; else f.rotation.z = f.userData.sgn * fo; }
    // the keyboard sheet: the flap folds back over the hinge, the drape gathers up
    const s = tw.sheet.v; R.flap.rotation.z = s * 2.95; R.drape.scale.y = Math.max(0.02, 1 - s); R.drape.visible = s < 0.98;
  }

  // ---------------------------------------------------------- update (no allocation)
  const CARS = [{ x: 0, v: 9.5, lane: 1 }, { x: 0, v: 8.5, lane: -1 }, { x: 0, v: 10.5, lane: 1 }], CAR0 = [-30, 25, 50];
  function carsTick(dt, t) {
    for (let i = 0; i < 3; i++) {
      const c = CARS[i];
      if (i >= R.tCount) { m4.makeScale(0.001, 0.001, 0.001).setPosition(0, -60, 0); R.carBody.setMatrixAt(i, m4); R.carGlow.setMatrixAt(i, m4); continue; }
      c.x += c.v * c.lane * dt;
      if (c.x > 70) c.x -= 140; else if (c.x < -70) c.x += 140;
      e1.set(0, c.lane > 0 ? H : -H, 0); q1.setFromEuler(e1); sv.set(1, 1, 1);
      v1.set(c.x, Y0 + 0.02 * Math.sin(t * 2 + i * 1.7), c.lane > 0 ? 6 : 10);
      m4.compose(v1, q1, sv); R.carBody.setMatrixAt(i, m4); R.carGlow.setMatrixAt(i, m4);
    }
    R.carBody.instanceMatrix.needsUpdate = true; R.carGlow.instanceMatrix.needsUpdate = true;
  }
  function lightsTick(dt, t) {
    R.level += (R.levelTo - R.level) * Math.min(1, dt * 0.9);
    const L = R.level;
    if (Math.abs(L - R.levelDrawn) > 0.004) {
      R.levelDrawn = L;
      SKY.head.color.setRGB(0.55 + 0.45 * L, 0.55 + 0.42 * L, 0.55 + 0.3 * L);
      SKY.bLamp.opacity = 0.1 + 0.9 * L;
      M.winLit.emissiveIntensity = 0.1 + 0.85 * L;
      SKY.carGlow.color.setScalar(0.35 + 0.65 * L);
      M.bulb.emissiveIntensity = 0.35 + 0.45 * L;
    }
    // the balcony's light string: a soft three-phase chase at 0.9 Hz (no hard flashes)
    for (let p = 0; p < 3; p++) { const c = 0.5 + 0.5 * Math.cos((t * 0.9 - p / 3) * TAU); SKY.ph[p].color.setScalar(0.32 + 0.68 * c * c); }
    const blinkA = (t * 0.8) % 1 < 0.5, base = 0.2 + 0.8 * L;
    SKY.sleeveA.color.setScalar(base * (blinkA ? 1 : 0.35)); SKY.sleeveB.color.setScalar(base * (blinkA ? 0.35 : 1));
    R.bDrones.visible = L > 0.3 && (t * 1.4) % 1 < 0.55;
  }
  function update(dt, ctx) {
    if (!R.root) return;
    const t = ctx.t, W_ = typeof world !== 'undefined' ? world : null;
    const sid = typeof state !== 'undefined' && state ? state.scene : null;
    if (sid !== R.scene) { R.scene = sid; if (AUTO[sid]) dress(AUTO[sid]); }
    if (ctx.env !== R.env) {
      R.env = ctx.env; applyEnv(R.env);
      const want = AUTO[R.scene] ? (R.scene === '2.1' && R.env === 'morning' && R.dressed === 'dawn21' ? 'morning21' : null) : ENV_DRESS[R.env];
      if (want && want !== R.dressed) dress(want);
    }
    if (R.ambKey !== ambKey()) sendAmbience();
    // the sky dome follows the env (eased) and the skirt/haze copy the live fog colour
    if (R.skyK < 1) { R.skyK = Math.min(1, R.skyK + dt * 0.6); applySky(R.skyName, R.skyK < 1 ? dt * 2.5 : 1); }
    if (W_ && W_.scene && W_.scene.fog && W_.setId === 'flat') { SKY.skirt.color.copy(W_.scene.fog.color); SKY.haze.color.copy(W_.scene.fog.color); }
    // the spot as a fixed lamp: the pendant (evening, while on), the dawn shaft (dawn); off in the morning
    const sp = W_ && W_.setId === 'flat' ? W_.torch : null;
    if (sp) {
      const lp = R.env === 'evening' ? (R.pendOn ? LAMP.pendant : null) : R.env === 'dawn' ? LAMP.dawn : null;
      if (lp) {
        W_.torchAuto = false; R.torchOwned = true;
        sp.position.set(lp[0][0], lp[0][1], lp[0][2]); sp.target.position.set(lp[1][0], lp[1][1], lp[1][2]); sp.target.updateMatrixWorld();
        sp.angle = lp[2]; sp.penumbra = lp[3]; sp.distance = lp[4]; sp.decay = 1;
        if (R.torchDark) { R.torchDark = false; sp.intensity = ENV[R.env].spot[1]; }
      } else if (R.env === 'evening') {   // the pendant switched off: keep the spot parked and dark (never a torch in the hand)
        W_.torchAuto = false; R.torchOwned = true; R.torchDark = true; sp.intensity = 0;
      } else if (R.torchOwned) { W_.torchAuto = true; R.torchOwned = false; R.torchDark = false; sp.decay = 1.5; }
    }
    // doors, box, sheet
    let moved = false;
    for (let i = 0; i < TWS.length; i++) if (twTick(TWS[i], dt)) moved = true;
    if (moved) applyTweens();
    // the curtain breathes when the door is open (more at dawn)
    const amp = 0.004 + tw.door.v * (R.env === 'dawn' ? 0.06 : 0.035);
    for (let i = 0; i < 3; i++) { const s = R.strips[i]; s.rotation.x = amp * Math.sin(t * 1.3 + i * 1.7); s.rotation.z = amp * 0.5 * Math.sin(t * 0.9 + i); }
    lightsTick(dt, t);
    carsTick(dt, t);
    // water, clouds, storm bank creeping right (-X)
    T.ripple.offset.set(t * 0.01, t * 0.016); T.foam.offset.x = t * 0.04; R.foam.position.z = 0.6 * Math.sin(t * 0.9);
    R.clouds.position.x = Math.sin(t * 0.0021) * 30;
    if (R.storm.visible) { R.stormT += dt; R.storm.position.x = -Math.min(60, R.stormT * 0.05); }
    // the slate's standby glow; the snore z
    if (R.slateMode === 'off') R.slateMat.emissiveIntensity = R.dressed === 'dawn21' ? 0.18 + 0.14 * (0.5 + 0.5 * Math.sin(t * 1.7)) : 0.12;
    else R.slateMat.emissiveIntensity = 1;
    if (R.zz.visible) {
      const ph = (t % 2.4) / 2.4;
      R.zz.position.set(-0.7 + 0.08 * Math.sin(ph * TAU), 1.45 + ph * 0.55, -3.7);
      R.zzQ.scale.setScalar(0.6 + 0.6 * ph); M.zz.opacity = Math.sin(ph * PI) * 0.9;
      if (W_ && W_.camera) R.zz.quaternion.copy(W_.camera.quaternion);
    }
  }
  // lie(true): the couch seat (y 0.42, between the arms) and the mattress (y 0.56) count as floor, so an actor placed on
  // them (s21_couch_lie, s21_bed_lie) and played an unseated lying anim ('lie', 'sleep_back', 'sleep') lies ON them.
  // Off by default and on every dress() (seated sleepers on the couch/bed use sit h 0.42/0.55 from floor level 0).
  const LIE = { on: false };
  function floor(x, z) {
    if (LIE.on) {
      if (x > -2.64 && x < -1.11 && z > -2.75 && z < -2.2) return 0.42;
      if (x > -3.68 && x < -2.22 && z > -6.3 && z < -4.45) return 0.56;
    }
    return x > 0.9 && x < 2.4 && z < -4.8 ? Math.max(-1.6, (z + 4.8) * 0.72) : 0;
  }

  // ---------------------------------------------------------- data
  const ENV = {
    evening: { bg: 0x22305c, fog: [0x2c3a66, 0.0050], hemi: [0xffe2c0, 0x3a3028, 0.9], dir: [0x8aa0d8, 0.35, [2, 6, 10]], spot: [0xffd2a0, 3.0], rain: 0 },
    dawn: { bg: 0xd2a6ae, fog: [0xc8a8b0, 0.0050], hemi: [0xc8c0d0, 0x403840, 0.60], dir: [0xffb8a0, 0.55, [-2, 3, 10]], spot: [0xffb0a0, 1.4], rain: 0 },
    morning: { bg: 0xf0c8a0, fog: [0xf0d0b0, 0.0048], hemi: [0xfff0e0, 0x5a4a40, 0.95], dir: [0xffd8b0, 0.90, [-1, 4, 10]], spot: [0xffe0c0, 0], rain: 0 },
  };
  const MARKS = {
    // 1.8
    s18_landing_c40: [1.65, 0, -4.3, 0], s18_landing_luka: [1.4, -0.144, -5.0, 0], s18_landing_chase: [1.9, -0.504, -5.5, 0],
    s18_arr_c40: [2.8, 0, -2.0, -2.2], s18_arr_luka: [1.2, 0, -2.6, 0.9], s18_arr_chase: [1.9, 0, -3.1, 0.6], s18_out_c40: [1.65, 0, -4.6, PI],
    s18_sticky_chase: [-3.2, 0, -1.8, -H], s18_keys: [-3.15, 0, -2.8, -H], s18_shelf: [0.25, 0, -2.75, PI], s18_balcony: [-2.6, 0, 1.0, 0],
    s18_fridge_luka: [3.0, 0, -3.15, H], s18_read_chase: [2.55, 0, -2.6, 2.18], s18_door_c40: [1.65, 0, -3.9, 0], s18_in_c40: [1.6, 0, -3.05, 1.68],
    s18_bench_c40: [3.1, 0, -2.0, H],
    // 2.1
    s21_couch_chase: [-1.9, 0, -2.55, -H], s21_bal_polish: [-2.7, 0, 1.15, 0], s21_bed_c40: [-2.95, 0, -5.4, PI], s21_slate_chase: [-3.05, 0, -0.95, -H],
    s21_photo_chase: [0.25, 0, -2.75, PI], s21_kettle: [3.05, 0, -2.1, H], s21_door_c40: [-0.95, 0, -3.75, -0.65], s21_bal_luka: [-3.0, 0, 1.1, 0.7],
    s21_bal_chase: [-1.55, 0, 1.0, -1.25], s21_plan_luka: [1.65, 0, -0.95, H], s21_plan_c40: [2.95, 0, -0.95, -H], s21_plan_chase: [2.3, 0, -1.6, 0],
    s21_box_luka: [-1.05, 0, -5.4, -H], s21_turn_luka: [-1.05, 0, -5.4, 0.34], s21_watch_chase: [-0.6, 0, -3.95, -2.80], s21_watch_c40: [-0.95, 0, -3.3, -3.10],
    // lying down (after SETS.flat.lie(true); play 'lie' / 'sleep_back'): head toward the mark's back, i.e. the couch's east
    // arm (x ~ -1.15) and the bed's pillows (z ~ -6.1)
    s21_couch_lie: [-1.9, 0.42, -2.47, -H], s21_bed_lie: [-2.95, 0.56, -5.3, 0],
    // general
    kettle: [3.05, 0, -2.1, H], centre: [0.0, 0, -1.8, 0],
  };
  const ANCHORS = {
    s18_pan_a:          { at: [-3.9, 1.4, -2.0], from: [-0.8, 1.6, -0.8], fov: 48 },
    s18_pan_b:          { at: [2.8, 1.1, -1.8], from: [-0.8, 1.6, -0.8], fov: 48 },
    s18_sticky:         { at: [-3.99, 1.7, -1.8], from: [-3.0, 1.65, -1.8], fov: 44 },
    s18_keys:           { at: [-3.78, 0.84, -2.8], from: [-3.2, 1.45, -2.6], fov: 34 },
    s18_notebooks:      { at: [0.25, 1.24, -3.3], from: [0.25, 1.32, -2.6], fov: 32 },
    s18_balcony_view:   { at: [-130, 2.0, 385], from: [-2.6, 1.62, 1.0], fov: 40 },
    fridge_card:        { at: [3.29, 1.42, -3.12], from: [2.75, 1.52, -2.95], fov: 28 },
    s18_luka_close:     { at: [3.0, 1.62, -3.15], from: [3.15, 1.62, -2.25], fov: 34 },
    s18_room_wide:      { at: [-1.39, 1.1, -2.76], from: [-2.9, 1.72, 0.4], fov: 60 },
    s18_doorway_wide:   { at: [2.0, 1.2, -3.3], from: [-1.0, 1.65, -0.6], fov: 50 },
    s18_kitchen_locked: { at: [2.6, 1.1, -1.8], from: [-1.6, 1.8, -1.2], fov: 56 },
    s21_dawn_wide:      { at: [-2.65, 0.95, 1.4], from: [-0.55, 1.95, -3.3], fov: 54 },
    s21_couch_close:    { at: [-1.4, 0.65, -2.55], from: [-0.6, 1.0, -1.5], fov: 38 },
    s21_slate:          { at: [-3.72, 0.78, -0.95], from: [-3.3, 1.35, -0.95], fov: 34 },
    s21_photo:          { at: [0.0, 1.65, -3.32], from: [0.0, 1.62, -2.75], fov: 30 },
    s21_kettle:         { at: [3.72, 1.05, -2.1], from: [3.0, 1.4, -2.0], fov: 34 },
    s21_doorway_mid:    { at: [-0.95, 1.4, -3.75], from: [-1.9, 1.5, -1.4], fov: 40 },
    s21_hand_frame:     { at: [-1.42, 1.35, -3.62], from: [-1.0, 1.42, -2.95], fov: 26 },
    s21_balcony_two:    { at: [-2.3, 1.45, 1.05], from: [-2.3, 1.5, -1.9], fov: 46 },
    s21_plan_wide:      { at: [2.3, 1.0, -1.1], from: [0.0, 1.75, -3.0], fov: 48 },
    s21_plan_notes:     { at: [2.3, 0.76, -0.95], from: [2.3, 1.85, -0.75], fov: 40 },
    s21_box:            { at: [-1.45, 0.72, -5.35], from: [-2.15, 1.45, -4.05], fov: 46 },
    s21_santa_mid:      { at: [-1.05, 1.5, -5.4], from: [0.35, 1.6, -4.3], fov: 40 },
  };
  return {
    env: ENV,
    build,
    marks: MARKS,
    anchors: ANCHORS,
    cams: {   // RE-style high corners looking across each room from the other room
      living:  { type: 'pan', pos: [2.0, 2.45, -0.12], base: [-2.4, 0.9, -2.0], look: 'player', fov: 58, limit: 0.45 },
      kitchen: { type: 'pan', pos: [-0.6, 2.35, -0.3], base: [2.8, 0.9, -2.4], look: 'player', fov: 58, limit: 0.45 },
      balcony: { type: 'pan', pos: [-1.6, 1.85, -2.6], base: [-2.4, 1.0, 1.0], look: 'player', fov: 52, limit: 0.35 },
      bedroom: { type: 'pan', pos: [0.6, 2.35, -3.85], base: [-2.4, 0.4, -5.4], look: 'player', fov: 62, limit: 0.40 },
    },
    zones: [   // first match wins
      { box: [-3.4, 0.0, -1.0, 1.5], cam: 'balcony' },
      { box: [-4.0, -3.6, 0.4, 0.0], cam: 'living' },
      { box: [0.4, -3.6, 4.0, 0.0], cam: 'kitchen' },
      { box: [-4.0, -6.4, 0.9, -3.6], cam: 'bedroom' },
      { box: [0.9, -4.6, 2.4, -3.6], cam: 'kitchen' },   // entry threshold / landing top (actors only)
    ],
    colliders: COL,
    floor,
    props: [
      'fridge_card', 'order_card', 'pelican_magnet', 'sticky_wall', 'keyboard_sheet', 'slate_desk', 'notebooks', 'photo_2031', 'kettle',
      'balcony_door', 'curtain', 'bedroom_door', 'entry_door', 'deco_box', 'santa_kit', 'chips_parcel', 'teas', 'tea_1', 'tea_2', 'tea_towel',
      'toast', 'plan_notes', 'xmas_lights', 'pendant', 'desk_lamp', 'couch_blanket', 'plant_dying', 'snore_z',
      'street_f', 'traffic_f', 'palms_f', 'lamps_f', 'jetty_f', 'water_f', 'foam_f', 'band_f', 'skirt_f', 'bridge_f', 'bridge_lights_f', 'clouds_f',
      'storm_bank_f', 'sun_f', 'sky_f',
    ],
    get ambience() { return AMB[ambKey()] || AMB.evening18; },
    update,
    // extras
    dress,
    snore: (on) => { if (R.zz) R.zz.userData.on(on); },
    lie: (on = true) => { LIE.on = !!on; },
    lightsLevel: () => R.level || 0,
  };
})();
