// ============================================================ SET: hq_floors — Optus Tower service floors L12, L21, L30
// Scene 3.2 "Spotless" (everything before the roof), Mon 24 Dec 2040 10:40. Spec: docs/sets/hq_floors.md (the contract:
// every name and coordinate there is what content codes against).
//
// LAYOUT (metres, Y up, +X east, +Z south; ry 0 faces +Z, PI faces -Z, H faces +X). Valley Grid plans; the three floors
// are pads laid side by side along X, every floor at y = 0 (set x = VG x + OX): L12 x -66..-30 (OX -48, ceiling 3.6),
// L21 x -18..18 (OX 0, ceiling 3.2), L30 x 30..66 (OX +48, ceiling 3.9); z = VG z. Only the dressed floor is visible.
//   L12 "Confiscated for Your Safety": service lift car x -54.1..-51.9, z -43..-40.8 (door x -53.8..-52.2 in the north
//     wall z -41..-40.6, one steel leaf sliding west) · lobby x -57..-49, z -40.6..-36.4 · static shelving blocks A
//     (x -66..-57) / B (x -49..-30) with labelled bins: SKATEBOARDS (-59, 1.0), KITCHEN KNIVES · BRISBANE (-45, 1.25),
//     LADDERS (x -42.6..-39.4) · control aisle x -61..-39, z -36.4..-34 (ctrl_w on the fence post x -60.9, ctrl_e on the
//     wall x -39.1, both z -35.2) · mobile shelf bank x -61..-39, z -34..-27 (12 units on rails; open: gap x -50.8..-49.2)
//     · bins hall x -61..-35, z -27..-15.4: guitars cage (-55.5, -21.8) REDCLIFFE 2038 · NOISE + Chase (2040)'s acoustic,
//     FIREWORKS (-58.8, -18.6), SCISSORS (-51.6, -18.6), the headphones wall (z -15.4, x -60..-48, ~300 pairs) under
//     HEARING PROTECTION INITIATIVE 2038, the trampoline bin in the stair doorway (x -36..-35, z -20.8..-19.2), the stair
//     door (x -35, z -20.6..-19.4, opens east) into a dark stub with steps up · west fence x -61.1, the robot lane behind
//     it (x -64.5..-62, two shelf robots), deep-archive shelving on the west wall.
//   L21 "The Oldest Line": walkable x -14..13, z -37..-15.4 · rack rows R1..R4 (x -10..8; gaps R1 x 1.0..2.4, R2
//     -5.4..-4.0, R3 3.6..5.0), aisles A0..A3 (z centres -35.6, -31.6, -27.6, -23.6), CRAC block behind R4 · the 1987
//     brick patch (x -14, z -24.4..-22.4) with the beige jack (-13.96, 0.45, -23.4) + tape JARVIS — 1987 — DO NOT UNPLUG
//     · valves W (-13.5, 1.15, -32.4) / E (12.5, 1.15, -32.4) on blue pipes · tea point (x 12.4..13, z -19..-15.8) ·
//     ceiling hatch (-11.8, 3.2, -16.6) with lock lamp + telescoping ladder · door x 13 (z -20.6..-19.4) to the stair
//     landing (x 13..17.6, z -24..-16: shutter STAIRWELL SEALED · for your safety at z -21.2, the down-flight).
//   L30 "The Hangar": walkable x 33..60.4, z -37..-13 · docking racks R1 x 40.4..41.3, R2 47..47.9 (bay z -35.2..-34 for
//     the rail), R3 53..53.9 (+ crossings), R0 along the south glass (z -12.6, glass z -11), R5 along the north wall
//     (z -37) · ~750 docked pods · M1 on its rail z -34.6 (parked centre x 46.2, pushed 50.45) · floor hatch (36.2, -16.6)
//     · speaker S1 (40.3, 1.5, -31), phones P1 (45.4, -15.6) / P2 (55, -22) · private lift: doors x 60.4 z -21.5..-19.9,
//     MANAGER ONLY, reader (60.38, 1.2, -19.35), side panel ROOF ACCESS — SANTA PHOTO 11:30 — AUTHORISED: SANTA
//     (60.38, 1.45, -22.4), car x 60.6..62.8 · the storm strip beyond the glass.
//
// ENV: l12 (default) · lift · l21 · l21_fog · l30 · car30.   DRESS: dress('l12' | 'l21' | 'l30') (AUTO 3.2 -> l12).
// LAMP: lamp('lift12' | 'gap' | 'headphones' | 'jack' | 'hatch21' | 'lift30' | 'car30' | 'off') parks the spot (re-asserted
//   every tick while lit). REFLECT: reflect('live' | 'baked' | null = auto: baked on touch / pixel ratio < 0.75 / shader fail).
// MIRROR: SETS.hq_floors.makeMirror(w, d, { key, res, tint, reflect, map, tile, peers, hide, holes, name }) -> Mesh (an
//   inlined Reflector; see MIRROR below; hq_top uses it). userData.mirror { tint, reflect, mode }, userData.setMode(m).
// AMBIENCE (getter): l12 hq_hush + cleaner_swish + shelf_servo (at the robot lane) · l21 server_hum + cleaner_swish +
//   drone_idle · l30 hangar_charge + drone_idle (+ thunder_far one-shots with the flashes) · lift/car30 envs: lift_hum,
//   room none. All rooms 'room'.
// MARKS: l12_car_*, s32_l12_out_*, s32_cp_l12, s32_skate, s32_knives, s32_ladders, s32_ctrl_w/e, s32_gap_n/s,
//   s32_guitars_c40/chase, s32_headphones, s32_bin_luka/done, s32_stair_in · s32_l21_land_*, s32_cp_l21, kettle, s32_cord,
//   s32_trail_start, s32_cp_l21_w, s32_jack_chase/luka/c40, s32_valve_w/e, s32_hatch, s32_hatch_top · s32_l30_up,
//   s32_l30_*, s32_cp_a, s32_s1, s32_cp_l1, m1_push, m1_done, s32_p1, s32_cp_c, s32_p2, s32_reader_luka,
//   s32_panel_chase, s32_lift_c40, car30_*.
// ANCHORS: l12_lift_inside s32_doors_open l12_panel pa12 l12_wide skateboards knives ladders ctrl_w ctrl_e gap guitars
//   s32_guitars_two headphones_wall headphones_sign s32_headphones_close tramp_bin stair_door12 · l21_landing_wide
//   shutter pa21 l21_reveal tea_point kettle kettle_cord jack_wide jack brick_phone_floor valve_w valve_e fog_wide
//   hatch21 ladder21 · l30_hatch_up hangar_reveal pa30 sentinel m1 lift30_doors lift_reader side_panel s32_santa_two car30.
// CAMS (fixed, high, along the aisles/lanes): l12_lobby (default) l12_lift_in l12_aisle_w l12_aisle_e l12_gap l12_hall_w
//   l12_hall_e · l21_landing l21_east_s l21_east_n l21_a0..a3 (chained, ease 0.25) l21_west_n l21_west_s · l30_a_s
//   l30_a_n l30_l1_s l30_l1_n l30_l2_s l30_l2_n l30_c_n l30_c_s l30_lobby l30_car. ZONES tile every walkable floor.
// PROPS (userData APIs; every call is instant while skipping, allocation-free, and its state survives a rebuild):
//   l12_lift doors(u) light(on) panel(floor) · pa12 / pa21 / pa30 talk(on) level(k 0..1) · bank open(u) jiggle() isOpen k
//   · ctrl_w / ctrl_e held(on) progress(k) · lane_bots · bins_l12 (guitars, skateboards, knives IMs) · chase_guitar ·
//   headphones_wall take() put() taken · tramp_bin push(u) reset() done · stair_door12 open(u) · landing21 door(u)
//   shutter.pulse() · tea_point steam() kettle_cord (child; .visible) · jack state('bare'|'adapter'|'phone')
//   screen('green'|'white'|'off') · valves turn(i, u) held(i, on) reset() open (emits 'valves:open' when both reach 1
//   within 1.5 s) · fog21 roll(k) · hatch21 lock('red'|'green') open(u) ladder(u) · racks21 (LED scroll) · docked
//   wake(i, on) tint(name, k) · m1 push(u) reset() done x · hatch30 open(u) · s1 / p1 / p2 play(on) · lift30 doors(u)
//   reader('red'|'green') beep() panel('booking'|'recognised') car.light(on) car.button(on) · sky30 flash(k) · cleaners.
// DATA: paths (clean_*, d21_*, d30*, old_trail, lane_bots), checkpoints, lures, ar { l12, l21, l30 }, drones { l21, l30 }.
// Draw calls: one Builder per floor (vc + atlas + labels + glow + a few textured), the bank's 12 units (2 each), every
// repeat instanced (docked 2, M1 2, cleaners 2, headphones 1, ...); the live mirror re-renders the visible floor once.
SETS.hq_floors = (() => {
  const PI = Math.PI, H = PI / 2, TAU = PI * 2, DS = THREE.DoubleSide;
  // ---------------------------------------------------------- palette (spec §3.1)
  const W12 = 0xf2f4f6, W12S = 0xd4d8de, BIN = 0x9aa2aa, PLATE = 0xf8f8f8, INK = 0x1a1a1a,
    RACK21 = 0x1e2a3a, WALL21 = 0x2c3a4e, CEIL21 = 0x1e2836, LED = 0x6fd0ff, BRICK = 0xd8c8a0, BEIGE = 0xcdbb94,
    PIPE = 0x2a6aa8, STEEL = 0xb8bec6, STEELD = 0x7a8088, HUB = 0xbfe6ff, RACK30 = 0x4a525c, BEAM = 0x2a3038, WALL30 = 0x3a4450,
    SHELL = 0xe8ecf0, UNDER = 0x9fe8ff, GLOWB = 0xbfe6ff, DEEP = 0x4a8ab8, CONC = 0x3a3f46, RUBBER = 0x2a2c30, BLACK = 0x0a0c10;
  const T12 = [1, 1, 1], T21 = [0.86, 0.93, 1.06], T30 = [0.9, 0.95, 1.05], ONE = [1, 1, 1];
  const COL = [];                                         // colliders (filled by build; dynamic boxes mutated in place)
  const R = { state: 'l12', scene: null, env: null, lamp: 'gap', mode: 'live', forced: null };   // live refs + state (survives rebuilds)
  const tc = new THREE.Color(), tc2 = new THREE.Color(), m4 = new THREE.Matrix4(), m5 = new THREE.Matrix4();
  const qv = new THREE.Quaternion(), ev = new THREE.Euler(), pv = new THREE.Vector3(), sv = new THREE.Vector3(), yUp = new THREE.Vector3(0, 1, 0);
  const ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
  let b = null, GL = null, tint = T12, XF = null, T = null, M = null, GLOWM = null, GLASSM = null, SKYM = null, FOGM = null, BEACM = null, RINGM = null, PHONEM = null;
  const skipping = () => typeof flow !== 'undefined' && !!flow && !!flow.skipping;
  const reduceFx = () => typeof options !== 'undefined' && !!options && !!options.reduceFlashing;
  const smooth = (u) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
  const clamp01 = (u) => (u < 0 ? 0 : u > 1 ? 1 : u);
  const isCur = () => typeof world !== 'undefined' && world.setId === 'hq_floors';
  const SETVIEW = () => typeof TEST !== 'undefined' && TEST && TEST.setview === 'hq_floors';

  // ---------------------------------------------------------- geometry helpers (into the current Builder `b`)
  // put(): colour every vertex hex × tint; M.glow geometry goes to the unlit list GL (merged without baked light).
  function put(g, hex, m) {
    if (XF) g.applyMatrix4(XF);
    tc.set(hex);
    const glow = m && m === M.glow, k = glow ? ONE : tint;
    const r = tc.r * k[0], gg = tc.g * k[1], bl = tc.b * k[2], n = g.attributes.position.count, a = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { a[i * 3] = r; a[i * 3 + 1] = gg; a[i * 3 + 2] = bl; }
    g.setAttribute('color', new THREE.BufferAttribute(a, 3));
    if (glow) GL.push(g); else { b.geo(g, m || M.vc); g.dispose(); }
  }
  function box(w, h, d, hex, x, y, z, ry = 0, m) { const g = new THREE.BoxGeometry(w, h, d); if (ry) g.rotateY(ry); g.translate(x, y + h / 2, z); put(g, hex, m); }
  function bb(x0, y0, z0, x1, y1, z1, hex, m) {   // min/max corners (either order)
    const ax = Math.min(x0, x1), ay = Math.min(y0, y1), az = Math.min(z0, z1), bx = Math.max(x0, x1), by = Math.max(y0, y1), bz = Math.max(z0, z1);
    box(bx - ax, by - ay, bz - az, hex, (ax + bx) / 2, ay, (az + bz) / 2, 0, m);
  }
  function boxR(w, h, d, hex, x, y, z, rx = 0, ry = 0, rz = 0, m) {
    const g = new THREE.BoxGeometry(w, h, d); g.rotateX(rx); g.rotateZ(rz); g.rotateY(ry); g.translate(x, y, z); put(g, hex, m);
  }
  function cyl(rt, rb, h, seg, hex, x, y, z, rx = 0, rz = 0, m, ry = 0) {
    const g = new THREE.CylinderGeometry(rt, rb, h, seg); if (rx) g.rotateX(rx); if (rz) g.rotateZ(rz); if (ry) g.rotateY(ry); g.translate(x, y, z); put(g, hex, m);
  }
  function torus(R0, r, rs, ts, hex, x, y, z, rx = 0, ry = 0, m, arc = TAU) {
    const g = new THREE.TorusGeometry(R0, r, rs, ts, arc); if (rx) g.rotateX(rx); if (ry) g.rotateY(ry); g.translate(x, y, z); put(g, hex, m);
  }
  // quad faces +Z before rotation (rx first, then ry): floor rx=-H, ceiling rx=H, wall facing -X ry=-H, facing -Z ry=PI.
  function quad(w, h, m, x, y, z, ry = 0, rx = 0, hex = 0xffffff) {
    const g = new THREE.PlaneGeometry(w, h); if (rx) g.rotateX(rx); if (ry) g.rotateY(ry); g.translate(x, y, z); put(g, hex, m);
  }
  // a quad showing the pixel rect [x0, y0, x1, y1] (top-left origin) of a W × Hh canvas texture
  function rquad(w, h, m, rc, x, y, z, ry = 0, rx = 0, hex = 0xffffff, W = 256, Hh = 256) {
    const g = new THREE.PlaneGeometry(w, h), uv = g.attributes.uv;
    for (let i = 0; i < 4; i++) uv.setXY(i, uv.getX(i) > 0.5 ? rc[2] / W : rc[0] / W, uv.getY(i) > 0.5 ? 1 - rc[1] / Hh : 1 - rc[3] / Hh);
    if (rx) g.rotateX(rx); if (ry) g.rotateY(ry); g.translate(x, y, z); put(g, hex, m);
  }
  // a tiled quad: the texture repeats every tile metres (tile = n or [tx, ty]; textures made with repeat [1, 1])
  function tquad(w, h, m, x, y, z, ry = 0, rx = 0, tile = 1, hex = 0xffffff, ox = 0, oy = 0) {
    const tx = Array.isArray(tile) ? tile[0] : tile, ty = Array.isArray(tile) ? tile[1] : tile;
    const g = new THREE.PlaneGeometry(w, h), uv = g.attributes.uv;
    for (let i = 0; i < 4; i++) uv.setXY(i, ox + uv.getX(i) * w / tx, oy + uv.getY(i) * h / ty);
    if (rx) g.rotateX(rx); if (ry) g.rotateY(ry); g.translate(x, y, z); put(g, hex, m);
  }
  // signs: row r (0..7) of the 8 × 32 px sign atlas; labels: slot (col 0..1, row 0..15) of the 2 × 16 label atlas (128 × 16)
  const sign = (row, w, h, x, y, z, ry = 0, lit = false) => rquad(w, h, lit ? M.lit : M.atlas, [1, row * 32 + 1, 255, row * 32 + 31], x, y, z, ry);
  const lab = (slot, w, h, x, y, z, ry = 0) => rquad(w, h, M.labels, [slot[0] * 128 + 1, slot[1] * 16 + 1, slot[0] * 128 + 127, slot[1] * 16 + 15], x, y, z, ry);
  function wall(x0, z0, x1, z1, h, hex) { bb(x0, 0, z0, x1, h, z1, hex); COL.push([x0, z0, x1, z1]); }
  // merge the unlit list into one MeshBasic (vertex colours, fogged) mesh: lamps, strips, LEDs keep their exact colour
  function glowMesh(list) {
    const parts = list.map((g0) => {
      const g = g0.index ? g0.toNonIndexed() : g0;
      for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'color') g.deleteAttribute(k);
      g.morphAttributes = {}; return g;
    });
    const merged = mergeGeometries(parts);
    for (const g of list) g.dispose(); for (const g of parts) g.dispose();
    return new THREE.Mesh(merged, M.glow);
  }
  // a separate Builder (+ glow list) -> named Group (a prop). Coordinates inside fn are local.
  function part(name, fn, pos, ry = 0, o) {
    const pb = b, pg = GL, px = XF, pt = tint; b = new Builder(); GL = []; XF = null;
    fn();
    const g = b.done(o);
    if (GL.length) g.add(glowMesh(GL));
    b = pb; GL = pg; XF = px; tint = pt;
    if (name) g.name = name;
    if (pos) g.position.set(pos[0], pos[1], pos[2]);
    g.rotation.y = ry;
    return g;
  }
  const at = (x, z, ry = 0, y = 0) => (XF = m4.makeRotationY(ry).setPosition(x, y, z));
  // the geometry of a one-material part (for InstancedMesh repeats; already baked)
  const geoOf = (fn, o) => part('', fn, null, 0, { floor: false, ...o }).children[0].geometry;
  function finish(group) {                                // close the current floor builder into group (static meshes)
    const st = b.done(); st.name = group.name + '_static';
    if (GL.length) st.add(glowMesh(GL));
    group.add(st); b = new Builder(); GL = [];
    return st;
  }

  // ---------------------------------------------------------- painted textures (64–256 px, nearest where text must read)
  const FONT = (px, w = 'bold') => `${w} ${px}px Arial, "Liberation Sans", "DejaVu Sans", sans-serif`;
  function text(c, s, x, y, px, col, al = 'center', w = 'bold', maxW) {
    c.font = FONT(px, w); c.fillStyle = col; c.textAlign = al; c.textBaseline = 'middle';
    if (maxW) c.fillText(s, x, y, maxW); else c.fillText(s, x, y);
  }
  let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  // 8 rows × 32 px: [main, sub, bg, ink, subInk]
  const SIGN_ROWS = [
    ['HEARING PROTECTION INITIATIVE 2038', '', '#f8f8f8', '#1c3a6a'],
    ['REDCLIFFE 2038 · NOISE', '', '#f8f8f8', '#1a1a1a'],
    ['SKATEBOARDS', '', '#f8f8f8', '#1a1a1a'],
    ['KITCHEN KNIVES · BRISBANE', '', '#f8f8f8', '#1a1a1a'],
    ['LADDERS', '', '#f8f8f8', '#1a1a1a'],
    ['MANAGER ONLY', '', '#15181d', '#eef2f6'],
    ['STAIRWELL SEALED', 'for your safety', '#f4f8fc', '#24507a', '#4a8ab8'],
    ['TEA POINT', 'one cup at a time (for your safety)', '#eaf4fb', '#24507a', '#4a6a88'],
  ];
  const SIG = { headphones: 0, noise: 1, skate: 2, knives: 3, ladders: 4, manager: 5, sealed: 6, tea: 7 };
  function paintSigns(c) {
    for (let r = 0; r < 8; r++) {
      const [s, sub, bg, ink, subInk] = SIGN_ROWS[r], y = r * 32;
      c.fillStyle = bg; c.fillRect(0, y, 256, 32);
      if (r === 5) { c.strokeStyle = '#8a929c'; c.lineWidth = 2; c.strokeRect(2, y + 2, 252, 28); }
      else if (r >= 6) { c.fillStyle = '#bfe6ff'; c.fillRect(0, y + 1, 4, 30); c.fillRect(252, y + 1, 4, 30); }
      else { c.strokeStyle = '#1a1a1a'; c.lineWidth = 1; c.strokeRect(1.5, y + 1.5, 253, 29); }
      if (sub) { text(c, s, 128, y + 11, 15, ink, 'center', 'bold', 236); text(c, sub, 128, y + 24, 11, subInk, 'center', 'italic bold', 240); }
      else text(c, s, 128, y + 16.5, r === 0 ? 20 : 21, ink, 'center', 'bold', 244);
    }
  }
  // labels atlas: 2 columns × 16 rows of 128 × 16 px
  const BANK_LABELS = ['SKATEBOARDS (OVERFLOW)', 'POOL NOODLES', 'PARTY POPPERS', 'WHISTLES', 'BICYCLE BELLS', 'TRUMPETS', 'SPARKLERS', 'MEGAPHONES', 'WIND CHIMES', 'DRUMS', 'CAP GUNS', 'BALLOONS'];
  const FLAVOUR = ['KAZOOS', 'WATER PISTOLS', 'POGO STICKS', 'BOOMBOXES', 'YO-YOS', 'STILTS', 'AIR HORNS', 'GLITTER', 'TAMBOURINES', 'ROLLER SKATES'];
  const LAB = { fireworks: [0, 0], scissors: [0, 1], trampolines: [0, 2], stairwell: [0, 3], lineroom: [0, 4], roof: [0, 5] };
  function paintLabels(c) {
    c.fillStyle = '#f8f8f8'; c.fillRect(0, 0, 256, 256);
    const slot = (col, row, s, bg, ink, px = 11, w = 'bold') => {
      const x = col * 128, y = row * 16;
      c.fillStyle = bg; c.fillRect(x, y, 128, 16);
      text(c, s, x + 64, y + 8.5, px, ink, 'center', w, 120);
    };
    slot(0, 0, 'FIREWORKS', '#f8f8f8', '#1a1a1a'); slot(0, 1, 'SCISSORS', '#f8f8f8', '#1a1a1a');
    slot(0, 2, 'TRAMPOLINES', '#f8f8f8', '#1a1a1a');
    slot(0, 3, '', '#2a7a4a', '#ffffff'); text(c, 'STAIRWELL', 72, 3 * 16 + 8.5, 11, '#ffffff', 'center', 'bold', 100);
    c.fillStyle = '#ffffff'; c.fillRect(8, 3 * 16 + 3, 3, 10); c.fillRect(13, 3 * 16 + 6, 3, 7); c.fillRect(18, 3 * 16 + 9, 3, 4);   // a little stair glyph
    slot(0, 4, '', '#d8c8a0', '#6a5a40');
    c.globalAlpha = 0.55; text(c, 'LINE ROOM · 1987', 64, 4 * 16 + 8.5, 12, '#5a4a32', 'center', 'bold', 124); c.globalAlpha = 1;
    slot(0, 5, 'ROOF', '#14161a', '#ffe8c8', 12);
    for (let i = 0; i < FLAVOUR.length; i++) slot(0, 6 + i, FLAVOUR[i], '#f8f8f8', '#1a1a1a');
    for (let i = 0; i < 12; i++) slot(1, i, BANK_LABELS[i], '#f8f8f8', '#1a1a1a', 11);
    for (let i = 12; i < 16; i++) slot(1, i, ['FOAM DARTS', 'BAGPIPES', 'BANGERS', 'TRIANGLES'][i - 12], '#f8f8f8', '#1a1a1a');
    c.strokeStyle = 'rgba(0,0,0,0.25)'; c.lineWidth = 1;
    for (let r = 0; r < 16; r++) for (let k = 0; k < 2; k++) if (!(k === 0 && r >= 3 && r <= 5)) c.strokeRect(k * 128 + 0.5, r * 16 + 0.5, 127, 15);
  }
  function paintJack(c) {   // 128 × 64: masking tape on painted brick, biro, slightly crooked
    c.fillStyle = '#d8c8a0'; c.fillRect(0, 0, 128, 64);
    c.fillStyle = 'rgba(120,100,70,0.25)'; for (let y = 10; y < 64; y += 21) c.fillRect(0, y, 128, 2);
    c.save(); c.translate(64, 33); c.rotate(-0.045);
    c.fillStyle = '#ebdfae'; c.beginPath();
    c.moveTo(-60, -22); for (let x = -60; x <= 60; x += 6) c.lineTo(x, -23 + (x % 12 ? 1.5 : -0.5));
    c.lineTo(61, -10); c.lineTo(59, 0); c.lineTo(62, 12); c.lineTo(60, 22);
    for (let x = 60; x >= -60; x -= 6) c.lineTo(x, 23 + (x % 12 ? -1.5 : 0.5));
    c.lineTo(-62, 10); c.lineTo(-59, 0); c.lineTo(-61, -12); c.closePath(); c.fill();
    c.fillStyle = 'rgba(160,140,90,0.25)'; c.fillRect(-60, -22, 120, 3);
    c.fillStyle = '#1e2c6e'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = 'italic bold 15px "DejaVu Sans", Arial, sans-serif'; c.fillText('JARVIS — 1987 —', 0, -9, 116);
    c.font = 'italic bold 16px "DejaVu Sans", Arial, sans-serif'; c.fillText('DO NOT UNPLUG', 1, 11, 114);
    c.strokeStyle = '#1e2c6e'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-44, 21); c.lineTo(46, 19); c.stroke();
    c.restore();
  }
  function sleigh(c, x, y, s, col) {   // a little sleigh glyph
    c.strokeStyle = col; c.fillStyle = col; c.lineWidth = 2;
    c.beginPath(); c.moveTo(x - s, y + s * 0.55); c.lineTo(x + s * 0.9, y + s * 0.55); c.quadraticCurveTo(x + s * 1.3, y + s * 0.5, x + s * 1.2, y + s * 0.2); c.stroke();
    c.beginPath(); c.moveTo(x - s * 0.7, y + s * 0.3); c.lineTo(x - s * 0.8, y - s * 0.4); c.lineTo(x + s * 0.5, y - s * 0.2); c.lineTo(x + s * 0.7, y + s * 0.3); c.closePath(); c.fill();
  }
  function paintSide(c, mode) {   // 256 × 192: the private lift's SafeSense side panel
    c.setTransform(1, 0, 0, 1, 0, 0);
    const g = c.createLinearGradient(0, 0, 0, 192); g.addColorStop(0, '#f6fafd'); g.addColorStop(1, '#d6e8f6');
    c.fillStyle = '#0c1018'; c.fillRect(0, 0, 256, 192);
    c.fillStyle = g; rr(c, 6, 6, 244, 180, 14); c.fill();
    c.strokeStyle = '#bfe6ff'; c.lineWidth = 4; rr(c, 6, 6, 244, 180, 14); c.stroke();
    text(c, 'SafeSense', 20, 24, 12, '#4a8ab8', 'left', 'bold');
    c.fillStyle = '#4a8ab8'; c.beginPath(); c.arc(232, 24, 6, 0, TAU); c.fill();
    if (mode === 'recognised') {
      c.strokeStyle = '#3aa86a'; c.lineWidth = 10; c.lineCap = 'round';
      c.beginPath(); c.moveTo(92, 92); c.lineTo(118, 118); c.lineTo(166, 66); c.stroke(); c.lineCap = 'butt';
      text(c, 'Welcome, Santa!', 128, 152, 22, '#24507a', 'center', 'bold', 224);
      return;
    }
    text(c, 'ROOF ACCESS', 128, 62, 30, '#24507a', 'center', 'bold', 228);
    c.fillStyle = '#bfe6ff'; c.fillRect(30, 84, 196, 3);
    text(c, 'SANTA PHOTO 11:30', 128, 110, 22, '#2a3a4a', 'center', 'bold', 226);
    text(c, 'AUTHORISED: SANTA', 128, 144, 21, '#2a3a4a', 'center', 'bold', 200);
    sleigh(c, 212, 168, 10, '#c8323a');
  }
  function paintReader(c, mode) {   // 64 × 96: card reader, LED window red | green
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.fillStyle = '#23272e'; c.fillRect(0, 0, 64, 96); c.fillStyle = '#2f343c'; rr(c, 4, 4, 56, 88, 8); c.fill();
    c.fillStyle = mode === 'green' ? '#5ae08a' : mode === 'off' ? '#3a2a2a' : '#ff3b30'; rr(c, 14, 12, 36, 12, 4); c.fill();
    c.strokeStyle = '#8a929c'; c.lineWidth = 2; c.beginPath(); c.arc(32, 52, 12, 0, TAU); c.stroke();
    for (let k = 1; k <= 2; k++) { c.beginPath(); c.arc(32, 52, 12 + k * 5, -0.6, 0.6); c.stroke(); }
    text(c, 'MANAGER', 32, 76, 9, '#c8ced6', 'center', 'bold', 56); text(c, 'ONLY', 32, 86, 9, '#c8ced6', 'center', 'bold', 56);
  }
  function hands(c, x, y, s, col) {   // a two-hands pictogram
    c.fillStyle = col;
    for (const sx of [-1, 1]) {
      const hx = x + sx * s * 0.62;
      rr(c, hx - s * 0.28, y - s * 0.1, s * 0.56, s * 0.62, s * 0.12); c.fill();
      for (let f = 0; f < 4; f++) { rr(c, hx - s * 0.27 + f * s * 0.14, y - s * 0.5 + (f === 0 || f === 3 ? s * 0.1 : 0), s * 0.11, s * 0.45, s * 0.05); c.fill(); }
      c.save(); c.translate(hx - sx * s * 0.3, y + s * 0.05); c.rotate(sx * 0.7); rr(c, -s * 0.06, -s * 0.28, s * 0.12, s * 0.32, s * 0.05); c.fill(); c.restore();
    }
  }
  function paintCtrl(c, k, held) {   // 128 × 128: the shelf control (SafeSense): big hold button, HOLD BOTH, two hands, ring k
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.fillStyle = '#10161e'; c.fillRect(0, 0, 128, 128);
    c.fillStyle = '#eef5fb'; rr(c, 4, 4, 120, 120, 12); c.fill();
    c.strokeStyle = '#bfe6ff'; c.lineWidth = 3; rr(c, 4, 4, 120, 120, 12); c.stroke();
    text(c, 'HOLD BOTH', 64, 17, 13, '#24507a', 'center', 'bold', 110);
    c.fillStyle = held ? '#6fd0ff' : '#4a8ab8'; c.beginPath(); c.arc(64, 64, 26, 0, TAU); c.fill();
    c.fillStyle = held ? '#e8f8ff' : '#bfe6ff'; c.beginPath(); c.arc(64, 64, 18, 0, TAU); c.fill();
    c.strokeStyle = '#c8d8e6'; c.lineWidth = 6; c.beginPath(); c.arc(64, 64, 34, 0, TAU); c.stroke();
    if (k > 0) { c.strokeStyle = k >= 1 ? '#3ac87a' : '#2a8ad8'; c.beginPath(); c.arc(64, 64, 34, -H, -H + TAU * Math.min(1, k)); c.stroke(); }
    hands(c, 64, 110, 16, '#4a6a88');
  }
  function paintLiftPanel(c, lit) {   // 128 × 256: SERVICE LIFT, G · 12 · 21 · 30, reader slot, alarm + "Are you sure?"
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
    c.fillStyle = '#1a1d22'; c.fillRect(40, 194, 48, 8);   // reader slot
    c.fillStyle = '#c8323a'; c.beginPath(); c.arc(64, 222, 9, 0, TAU); c.fill();
    c.fillStyle = '#f2f2f2'; c.fillRect(61, 217, 6, 7); c.fillRect(59, 224, 10, 2);
    text(c, 'Are you sure?', 64, 243, 11, '#20242a', 'center', 'italic bold', 118);
  }
  function paintRackLed(c) {   // 64 × 64: one rack door (tiled): dark glass, LED columns (cyan/blue, a few amber)
    c.fillStyle = '#070b12'; c.fillRect(0, 0, 64, 64);
    c.fillStyle = '#1a2433'; c.fillRect(0, 0, 3, 64); c.fillRect(61, 0, 3, 64);
    c.fillStyle = 'rgba(111,208,255,0.08)'; c.fillRect(6, 0, 10, 64);
    seed = 31;
    for (let col = 0; col < 6; col++) for (let y = 1; y < 64; y += 3) {
      const r = rnd(); if (r < 0.35) continue;
      c.fillStyle = r > 0.95 ? '#ffb040' : r > 0.7 ? '#6fd0ff' : r > 0.5 ? '#2a7ad8' : '#1c4a78';
      c.fillRect(8 + col * 8, y, 4, 1);
    }
  }
  function paintBrick(c) {   // 64 × 64: beige-painted brick, flaking
    c.fillStyle = '#d8c8a0'; c.fillRect(0, 0, 64, 64);
    c.fillStyle = '#b8a888';
    for (let r = 0; r < 8; r++) { c.fillRect(0, r * 8 + 7, 64, 1); for (let k = 0; k < 3; k++) c.fillRect(((r % 2) * 11 + k * 22) % 64, r * 8, 1, 7); }
    seed = 5; for (let i = 0; i < 9; i++) { c.fillStyle = rnd() > 0.5 ? '#a8584a' : '#c8b890'; c.fillRect(rnd() * 60, rnd() * 60, 2 + rnd() * 5, 1 + rnd() * 3); }
  }
  function paintCradle(c) {   // 64 × 32: one charging cradle on the bar (0.62 m), blue contact glints
    c.fillStyle = '#20262e'; c.fillRect(0, 0, 64, 32);
    c.fillStyle = '#2c343e'; c.fillRect(0, 4, 64, 3); c.fillRect(0, 25, 64, 3);
    c.fillStyle = '#12161c'; rr(c, 14, 8, 36, 16, 5); c.fill();
    c.fillStyle = '#8fd8ff'; c.fillRect(28, 14, 2, 4); c.fillRect(34, 14, 2, 4); c.fillStyle = '#3a6a8a'; c.fillRect(20, 20, 24, 1);
  }
  function paintFloor12(c) {   // white stone, 2 × 2 slabs of 1.2 m, faint streaks
    c.fillStyle = '#eceef2'; c.fillRect(0, 0, 128, 128);
    seed = 11; for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(200,208,220,${0.15 + rnd() * 0.3})`; c.save(); c.translate(rnd() * 128, rnd() * 128); c.rotate(0.5 + rnd() * 0.4); c.fillRect(0, 0, 10 + rnd() * 30, 1); c.restore(); }
    c.fillStyle = '#cfd5de'; c.fillRect(0, 0, 128, 1); c.fillRect(0, 64, 128, 1); c.fillRect(0, 0, 1, 128); c.fillRect(64, 0, 1, 128);
  }
  function paintFloor21(c) {   // raised-floor tiles 0.6 m (2 × 2 per tile of the texture), dark blue-grey, gloss edges
    c.fillStyle = '#0e1622'; c.fillRect(0, 0, 128, 128);
    for (const x of [0, 64]) for (const y of [0, 64]) {
      c.fillStyle = '#121c2a'; c.fillRect(x + 2, y + 2, 60, 60);
      c.fillStyle = '#1e2c3e'; c.fillRect(x + 2, y + 2, 60, 2); c.fillRect(x + 2, y + 2, 2, 60);
      c.fillStyle = '#0a1018'; c.fillRect(x + 2, y + 61, 60, 1); c.fillRect(x + 61, y + 2, 1, 60);
    }
  }
  function paintFloor30(c) {   // dark epoxy, faint mottle
    c.fillStyle = '#10151d'; c.fillRect(0, 0, 128, 128);
    seed = 17; for (let i = 0; i < 120; i++) { c.fillStyle = rnd() > 0.5 ? 'rgba(42,58,80,0.35)' : 'rgba(0,0,0,0.25)'; c.fillRect(rnd() * 128, rnd() * 128, 2 + rnd() * 6, 1 + rnd() * 3); }
  }
  function paintStorm(c) {   // 256 × 64: green-grey storm over the city, dimmed neon dots, a far river glint
    const g = c.createLinearGradient(0, 0, 0, 64); g.addColorStop(0, '#1e2828'); g.addColorStop(0.45, '#3a4848'); g.addColorStop(0.62, '#4a5a56'); g.addColorStop(0.66, '#1c2224'); g.addColorStop(1, '#0c1012');
    c.fillStyle = g; c.fillRect(0, 0, 256, 64);
    seed = 23;
    for (let i = 0; i < 60; i++) { c.fillStyle = `rgba(${rnd() > 0.5 ? '90,110,100' : '20,28,30'},${0.2 + rnd() * 0.3})`; c.beginPath(); c.ellipse(rnd() * 256, 6 + rnd() * 30, 10 + rnd() * 30, 3 + rnd() * 6, 0, 0, TAU); c.fill(); }
    c.fillStyle = '#141a1c'; for (let x = 0; x < 256; x += 3 + rnd() * 6) { const h = 2 + rnd() * 10; c.fillRect(x, 42 - h, 2 + rnd() * 5, h + 2); }
    for (let i = 0; i < 70; i++) { c.fillStyle = ['#a04880', '#3a9a98', '#c8a060', '#6080b0'][(rnd() * 4) | 0]; c.globalAlpha = 0.35 + rnd() * 0.4; c.fillRect(rnd() * 256, 40 + rnd() * 22, 1, 1); }
    c.globalAlpha = 0.35; c.fillStyle = '#8aa0a0'; c.beginPath(); c.moveTo(0, 54); c.quadraticCurveTo(90, 48, 150, 56); c.quadraticCurveTo(200, 60, 256, 52); c.lineTo(256, 54); c.quadraticCurveTo(200, 62, 150, 58); c.quadraticCurveTo(90, 50, 0, 56); c.fill();
    c.globalAlpha = 1;
  }
  function paintFog(c) {   // 64 × 64 soft wisp (additive: black is clear)
    c.fillStyle = '#000'; c.fillRect(0, 0, 64, 64);
    seed = 41;
    for (let i = 0; i < 16; i++) {
      const x = 14 + rnd() * 36, y = 22 + rnd() * 26, r = 8 + rnd() * 14, g = c.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, 'rgba(200,220,235,0.22)'); g.addColorStop(1, 'rgba(200,220,235,0)'); c.fillStyle = g; c.fillRect(0, 0, 64, 64);
    }
    const e = c.createLinearGradient(0, 0, 0, 64); e.addColorStop(0, 'rgba(0,0,0,1)'); e.addColorStop(0.3, 'rgba(0,0,0,0)'); e.addColorStop(0.9, 'rgba(0,0,0,0)'); e.addColorStop(1, 'rgba(0,0,0,1)');
    c.fillStyle = e; c.fillRect(0, 0, 64, 64);
  }
  function paintPA(c) {   // 64 × 64: round ceiling speaker grille
    c.fillStyle = '#d8dde2'; c.fillRect(0, 0, 64, 64);
    c.fillStyle = '#b8bec6'; c.beginPath(); c.arc(32, 32, 30, 0, TAU); c.fill();
    c.fillStyle = '#2a2e34'; c.beginPath(); c.arc(32, 32, 25, 0, TAU); c.fill();
    c.fillStyle = '#6a7078'; for (let y = 10; y < 56; y += 5) for (let x = 10; x < 56; x += 5) if ((x - 32) ** 2 + (y - 32) ** 2 < 22 * 22) c.fillRect(x, y, 2, 2);
  }
  function paintQuilt(c) {   // 64 × 64: grey quilted lift blanket
    c.fillStyle = '#5a6068'; c.fillRect(0, 0, 64, 64);
    c.strokeStyle = '#464c54'; c.lineWidth = 2;
    for (let k = -64; k < 128; k += 16) { c.beginPath(); c.moveTo(k, 0); c.lineTo(k + 64, 64); c.stroke(); c.beginPath(); c.moveTo(k + 64, 0); c.lineTo(k, 64); c.stroke(); }
    c.fillStyle = 'rgba(255,255,255,0.06)'; for (let y = 4; y < 64; y += 16) for (let x = 4; x < 64; x += 16) c.fillRect(x, y, 8, 8);
  }
  function paintPhone(c) {   // 32 × 64: a dropped phone playing a sample (the waveform scrolls)
    c.fillStyle = '#081018'; c.fillRect(0, 0, 32, 64);
    c.fillStyle = '#6fd0ff';
    for (let y = 0; y < 64; y += 2) { const a = Math.abs(Math.sin(y * 0.37) * Math.sin(y * 0.11)) * 12 + 1; c.fillRect(16 - a, y, a * 2, 1); }
  }
  function paintBrickScr(c, mode) {   // 64 × 32: the brick phone's LCD: green 1987 terminal | SafeSense white flood | off
    c.setTransform(1, 0, 0, 1, 0, 0);
    if (mode === 'off') { c.fillStyle = '#2a362a'; c.fillRect(0, 0, 64, 32); return; }
    if (mode === 'white') {
      c.fillStyle = '#e8f2fa'; c.fillRect(0, 0, 64, 32);
      c.fillStyle = '#ffffff'; c.strokeStyle = '#6fb8e8'; c.lineWidth = 1;
      for (const [x, y] of [[4, 3], [20, 9], [34, 4], [12, 16], [38, 17]]) { rr(c, x, y, 22, 12, 3); c.fill(); c.stroke(); c.fillStyle = '#4a8ab8'; c.fillRect(x + 4, y + 4, 14, 2); c.fillStyle = '#ffffff'; }
      return;
    }
    c.fillStyle = '#0a1a0c'; c.fillRect(0, 0, 64, 32);
    c.fillStyle = '#5aff6a'; c.font = 'bold 7px monospace'; c.textAlign = 'left'; c.textBaseline = 'top';
    c.fillText('JARVIS 1987', 3, 2); c.fillText('LINE OK', 3, 11); c.fillText('> _', 3, 20);
  }
  function paintFence(c) {   // 64 × 64 transparent chain-link
    c.clearRect(0, 0, 64, 64);
    c.strokeStyle = 'rgba(150,158,168,0.9)'; c.lineWidth = 1.5;
    for (let k = -64; k < 128; k += 16) { c.beginPath(); c.moveTo(k, 0); c.lineTo(k + 64, 64); c.stroke(); c.beginPath(); c.moveTo(k + 64, 0); c.lineTo(k, 64); c.stroke(); }
  }
  function textures() {
    if (T) return T;
    T = {};
    const nt = { nearest: true };
    T.signs = canvasTex(256, 256, paintSigns, { key: 'hqf_signs', ...nt });
    T.labels = canvasTex(256, 256, paintLabels, { key: 'hqf_labels', ...nt });
    T.jack = canvasTex(128, 64, paintJack, { key: 'hqf_jack', ...nt });
    T.side = canvasTex(256, 192, (c) => paintSide(c, 'booking'), { key: 'hqf_side', ...nt });
    T.reader = canvasTex(64, 96, (c) => paintReader(c, 'red'), { key: 'hqf_reader', ...nt });
    T.ctrlW = canvasTex(128, 128, (c) => paintCtrl(c, 0, false), { key: 'hqf_ctrl_w', ...nt });
    T.ctrlE = canvasTex(128, 128, (c) => paintCtrl(c, 0, false), { key: 'hqf_ctrl_e', ...nt });
    T.liftPanel = canvasTex(128, 256, (c) => paintLiftPanel(c, 12), { key: 'hqf_lift_panel', ...nt });
    T.ledA = canvasTex(64, 64, paintRackLed, { key: 'hqf_led_a', repeat: [1, 1], ...nt });
    T.ledB = canvasTex(64, 64, paintRackLed, { key: 'hqf_led_b', repeat: [1, 1], ...nt });
    T.brick = canvasTex(64, 64, paintBrick, { key: 'hqf_brick87', repeat: [1, 1], ...nt });
    T.cradle = canvasTex(64, 32, paintCradle, { key: 'hqf_cradle', repeat: [1, 1], ...nt });
    T.f12 = canvasTex(128, 128, paintFloor12, { key: 'hqf_floor_l12', repeat: [1, 1] });
    T.f21 = canvasTex(128, 128, paintFloor21, { key: 'hqf_floor_l21', repeat: [1, 1], ...nt });
    T.f30 = canvasTex(128, 128, paintFloor30, { key: 'hqf_floor_l30', repeat: [1, 1] });
    T.storm = canvasTex(256, 64, paintStorm, { key: 'hqf_storm_l30' });
    T.fog = canvasTex(64, 64, paintFog, { key: 'hqf_fog' });
    T.pa = canvasTex(64, 64, paintPA, { key: 'hqf_pa', ...nt });
    T.quilt = canvasTex(64, 64, paintQuilt, { key: 'hqf_quilt', repeat: [1, 1] });
    T.phone = canvasTex(32, 64, paintPhone, { key: 'hqf_phone_drop', repeat: [1, 1], ...nt });
    T.brickScr = canvasTex(64, 32, (c) => paintBrickScr(c, 'green'), { key: 'hqf_brick_scr', ...nt });
    T.fence = canvasTex(64, 64, paintFence, { key: 'hqf_fence', repeat: [1, 1] });
    T.state = { side: 'booking', reader: 'red', panel: 12, ctrl: [[0, false], [0, false]], scr: 'green' };   // what each repaintable canvas shows
    return T;
  }
  function repaint(tex, fn) { const c = tex.image.getContext('2d'); fn(c); tex.needsUpdate = true; }

  // ---------------------------------------------------------- makeMirror(w, d, opts): a live planar mirror floor (shared with hq_top)
  // An inlined, trimmed copy of three r186's examples/jsm/objects/Reflector.js: a flat PlaneGeometry mesh (rotated to face
  // +Y), a render target (res², 256; 128 on touch) and one ShaderMaterial per `key` (created once: boot warm-up compiles it;
  // a second key reuses the same program). onBeforeRender renders the scene from the mirrored camera (oblique near plane,
  // clipBias 0.003) with the mirror, its `peers` and everything in `hide` (userData.noReflect objects) hidden; recursion is
  // guarded. Shader: mix(fogged(tint × floor texture), reflection, reflect). Live reflections already carry their fog.
  // opts { key = 'hq', res, tint = 0x808080, reflect = 0.6, map (tiling floor texture), tile = 1 (metres per repeat of map),
  //        peers: [] (mirror meshes that share the key: hidden in each other's pass), hide: [] (objects never reflected),
  //        holes: [[x0, z0, x1, z1]] (world-aligned, relative to the mesh's centre) }.
  // mesh.userData: mirror { tint: Color, reflect, map, mode }, setMode('live' | 'baked') (baked: the same plane in a
  // transparent 0.8 Lambert with `map`; the caller shows its own mirrored copy under it). Renders nothing extra in baked mode.
  const MIRROR = (() => {
    const VS = `
      uniform mat4 textureMatrix;
      varying vec4 vUv;
      varying vec2 vTex;
      #include <common>
      #include <fog_pars_vertex>
      void main() {
        vUv = textureMatrix * vec4(position, 1.0);
        vTex = uv;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`;
    const FS = `
      uniform vec3 tint;
      uniform float uReflect;
      uniform sampler2D tDiffuse;
      uniform sampler2D tFloor;
      varying vec4 vUv;
      varying vec2 vTex;
      #include <common>
      #include <fog_pars_fragment>
      void main() {
        vec3 refl = texture2DProj(tDiffuse, vUv).rgb;
        vec3 base = tint * texture2D(tFloor, vTex).rgb;
        gl_FragColor = vec4(base, 1.0);
        #include <colorspace_fragment>
        vec3 bOut = gl_FragColor.rgb;
        gl_FragColor = vec4(refl, 1.0);
        #include <colorspace_fragment>
        vec3 rOut = gl_FragColor.rgb;
        #ifdef USE_FOG
          #ifdef FOG_EXP2
            float fogF = 1.0 - exp(-fogDensity * fogDensity * vFogDepth * vFogDepth);
          #else
            float fogF = smoothstep(fogNear, fogFar, vFogDepth);
          #endif
          bOut = mix(bOut, fogColor, fogF);
        #endif
        gl_FragColor = vec4(mix(bOut, rOut, uReflect), 1.0);
      }`;
    const shared = new Map();
    let busy = false, WHITE = null;
    const plane = new THREE.Plane(), normal = new THREE.Vector3(), rwp = new THREE.Vector3(), cwp = new THREE.Vector3(), rot = new THREE.Matrix4(),
      lookAt = new THREE.Vector3(), clip = new THREE.Vector4(), view = new THREE.Vector3(), target = new THREE.Vector3(), q = new THREE.Vector4();
    const cams = new WeakMap(), HID = [];
    const touch = () => { try { return matchMedia('(pointer: coarse)').matches; } catch (e) { return false; } };
    function sharedFor(key, res) {
      let s = shared.get(key); if (s) return s;
      const rt = new THREE.WebGLRenderTarget(res, res, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, type: THREE.HalfFloatType, generateMipmaps: false, depthBuffer: true });
      const mat = new THREE.ShaderMaterial({
        name: 'hqMirror', fog: true, vertexShader: VS, fragmentShader: FS,
        uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {
          tDiffuse: { value: null }, tFloor: { value: null }, textureMatrix: { value: new THREE.Matrix4() },
          tint: { value: new THREE.Color(0x808080) }, uReflect: { value: 0.6 },
        }]),
      });
      mat.uniforms.tDiffuse.value = rt.texture;
      s = { key, rt, mat }; shared.set(key, s); return s;
    }
    function hideAll(list) { for (let i = 0; i < list.length; i++) { const o = list[i]; if (o.visible) { o.visible = false; HID.push(o); } } }
    function before(renderer, scene, camera) {
      const u = this.userData.mirror;
      if (busy || !u || u.mode !== 'live') return;
      const s = u.s, U = s.mat.uniforms;
      U.tint.value.copy(u.tint); U.uReflect.value = u.reflect; U.tFloor.value = u.map; s.mat.uniformsNeedUpdate = true;
      let rc = cams.get(camera);
      if (!rc) { rc = camera.clone(); cams.set(camera, rc); }
      rwp.setFromMatrixPosition(this.matrixWorld); cwp.setFromMatrixPosition(camera.matrixWorld);
      rot.extractRotation(this.matrixWorld); normal.set(0, 0, 1).applyMatrix4(rot);
      view.subVectors(rwp, cwp);
      if (view.dot(normal) > 0) return;                    // looking at it from below
      view.reflect(normal).negate().add(rwp);
      rot.extractRotation(camera.matrixWorld);
      lookAt.set(0, 0, -1).applyMatrix4(rot).add(cwp);
      target.subVectors(rwp, lookAt).reflect(normal).negate().add(rwp);
      rc.position.copy(view); rc.up.set(0, 1, 0).applyMatrix4(rot).reflect(normal); rc.lookAt(target);
      rc.far = camera.far; rc.updateMatrixWorld(); rc.projectionMatrix.copy(camera.projectionMatrix);
      const tm = U.textureMatrix.value;
      tm.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1);
      tm.multiply(rc.projectionMatrix).multiply(rc.matrixWorldInverse).multiply(this.matrixWorld);
      plane.setFromNormalAndCoplanarPoint(normal, rwp).applyMatrix4(rc.matrixWorldInverse);
      clip.set(plane.normal.x, plane.normal.y, plane.normal.z, plane.constant);
      const pm = rc.projectionMatrix.elements;
      q.x = (Math.sign(clip.x) + pm[8]) / pm[0]; q.y = (Math.sign(clip.y) + pm[9]) / pm[5]; q.z = -1; q.w = (1 + pm[10]) / pm[14];
      clip.multiplyScalar(2 / clip.dot(q));
      pm[2] = clip.x; pm[6] = clip.y; pm[10] = clip.z + 1 - 0.003; pm[14] = clip.w;
      busy = true;
      HID.length = 0; this.visible = false; HID.push(this);
      if (u.peers) hideAll(u.peers);
      if (u.hide) hideAll(u.hide);
      const prev = renderer.getRenderTarget(), xr = renderer.xr.enabled;
      renderer.xr.enabled = false;
      renderer.setRenderTarget(s.rt);
      renderer.state.buffers.depth.setMask(true);
      if (renderer.autoClear === false) renderer.clear();
      renderer.render(scene, rc);
      renderer.xr.enabled = xr;
      renderer.setRenderTarget(prev);
      if (camera.viewport !== undefined) renderer.state.viewport(camera.viewport);
      for (let i = 0; i < HID.length; i++) HID[i].visible = true;
      HID.length = 0; busy = false;
    }
    function holeGeo(w, d, holes) {   // a w × d rectangle (local XY, y = -z world) with rectangular holes
      const sh = new THREE.Shape();
      sh.moveTo(-w / 2, -d / 2); sh.lineTo(w / 2, -d / 2); sh.lineTo(w / 2, d / 2); sh.lineTo(-w / 2, d / 2); sh.closePath();
      for (const [x0, z0, x1, z1] of holes) { const p = new THREE.Path(); p.moveTo(x0, -z1); p.lineTo(x0, -z0); p.lineTo(x1, -z0); p.lineTo(x1, -z1); p.closePath(); sh.holes.push(p); }
      const g = new THREE.ShapeGeometry(sh), pos = g.attributes.position, uv = g.attributes.uv;
      for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) / w + 0.5, pos.getY(i) / d + 0.5);
      return g;
    }
    function makeMirror(w, d, o = {}) {
      const s = sharedFor(o.key || 'hq', o.res || (touch() ? 128 : 512));
      if (!WHITE) WHITE = canvasTex(4, 4, (c) => { c.fillStyle = '#fff'; c.fillRect(0, 0, 4, 4); }, { key: 'hq_mirror_white', repeat: [1, 1] });
      const g = o.holes && o.holes.length ? holeGeo(w, d, o.holes) : new THREE.PlaneGeometry(w, d);
      const tile = o.tile || 1, uv = g.attributes.uv;
      for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / tile, uv.getY(i) * d / tile);
      const map = o.map || WHITE, baked = matTex(map, { transparent: true, opacity: o.bakedOpacity ?? 0.8 });
      const m = new THREE.Mesh(g, s.mat); m.rotation.x = -H; m.name = o.name || '';
      m.userData.noOcclude = true;
      m.userData.mirror = { s, tint: new THREE.Color(o.tint ?? 0x808080), reflect: o.reflect ?? 0.6, map, mode: 'live', peers: o.peers || null, hide: o.hide || null, baked };
      m.onBeforeRender = before;
      m.userData.setMode = (mode) => { const u = m.userData.mirror; u.mode = mode === 'baked' ? 'baked' : 'live'; m.material = u.mode === 'live' ? s.mat : baked; };
      const tw = new THREE.Mesh(g, baked); tw.visible = false; tw.scale.setScalar(0.001); m.add(tw);   // warm-up twin: compiles the baked material at boot
      if (o.peers) o.peers.push(m);
      return m;
    }
    makeMirror.touch = touch;
    makeMirror.failed = (renderer) => {   // true when a mirror program failed to link (fallback to baked)
      for (const s of shared.values()) { const p = renderer.properties.get(s.mat).currentProgram; if (p && p.diagnostics && p.diagnostics.runnable === false) return true; }
      return false;
    };
    return makeMirror;
  })();

  // ---------------------------------------------------------- shared little builders
  // a run of static shelving in local space (call at() first): x 0..len along the face, the face at z = 0 facing +z,
  // depth into -z. levels = bin shelf heights; skip(bay, level) leaves a slot empty for a special.
  function shelfRun(len, depth, h, levels, skip, colA = W12, colB = W12S, binW = 0.82) {
    const bays = Math.max(1, Math.round(len / 1.0)), bw = len / bays;
    bb(0, 0, -depth, len, h, -depth + 0.03, colB);                                    // back
    for (let i = 0; i <= bays; i++) bb(i * bw - 0.03, 0, -depth, i * bw + 0.03, h, 0, colA);
    bb(0, 0, -depth, len, 0.08, 0, colA);
    for (const y of levels) bb(0, y - 0.03, -depth, len, y, 0, colA);
    bb(0, h - 0.05, -depth, len, h, 0.02, colA);
    for (let i = 0; i < bays; i++) for (let l = 0; l < levels.length; l++) {
      if (skip && skip(i, l)) continue;
      bin((i + 0.5) * bw, levels[l], Math.min(binW, bw - 0.12), depth);
    }
  }
  const CONTENT = [0xc8323a, 0x1f6fe0, 0x2fb8a8, 0xe88ab0, 0xe8e8ea, 0x3a3e44, 0x8a5a3a, 0x6a8a3a, 0xd87a2a];
  function bin(cx, y, w, depth = 0.5, hex = BIN) {   // an open-fronted grey bin on a shelf (local space, front at z ≈ -0.04)
    const d = Math.min(0.46, depth - 0.06);
    bb(cx - w / 2, y, -0.04 - d, cx + w / 2, y + 0.36, -0.04, hex);
    quad(w - 0.12, 0.17, M.vc, cx, y + 0.2, -0.036, 0, 0, 0x50565e);                  // the open front (dark)
    quad(0.2, 0.06, M.vc, cx, y + 0.08, -0.035, 0, 0, PLATE);                         // label plate
    if (rnd() < 0.6) bb(cx - w * 0.3, y + 0.3, -0.04 - d * 0.8, cx + w * 0.25, y + 0.4, -0.12, CONTENT[(rnd() * CONTENT.length) | 0]);
  }
  function ledStrip(x0, z0, x1, z1, y, hex, wdt = 0.14) {   // a ceiling light strip (unlit) with its housing
    if (Math.abs(x1 - x0) >= Math.abs(z1 - z0)) { bb(x0, y - 0.05, z0 - wdt / 2 - 0.03, x1, y, z0 + wdt / 2 + 0.03, 0xc8ccd2); bb(x0 + 0.05, y - 0.06, z0 - wdt / 2, x1 - 0.05, y - 0.05, z0 + wdt / 2, hex, M.glow); }
    else { bb(x0 - wdt / 2 - 0.03, y - 0.05, z0, x0 + wdt / 2 + 0.03, y, z1, 0xc8ccd2); bb(x0 - wdt / 2, y - 0.06, z0 + 0.05, x0 + wdt / 2, y - 0.05, z1 - 0.05, hex, M.glow); }
  }
  function paGrille(name, x, y, z) {   // a ceiling PA grille + its talk ring (unique pulsing material)
    return part(name, () => {
      cyl(0.2, 0.2, 0.03, 16, 0xd8dde2, 0, -0.015, 0);
      quad(0.34, 0.34, M.pa, 0, -0.032, 0, 0, H);
      const g = new THREE.TorusGeometry(0.22, 0.018, 4, 24); g.rotateX(H); g.translate(0, -0.035, 0); put(g, 0xffffff, M.ring);
    }, [x, y, z], 0, { floor: false });
  }
  function bakedCopy(name, meshes) {   // baked-mirror mode: a mirrored (y -> -y) copy of a floor's static meshes / IMs
    const g = new THREE.Group(); g.name = name; g.scale.y = -1; g.visible = false; g.userData.noOcclude = true;
    for (const src of meshes) {
      let c;
      if (src.isInstancedMesh) { c = new THREE.InstancedMesh(src.geometry, src.material, src.count); c.instanceMatrix = src.instanceMatrix; if (src.instanceColor) c.instanceColor = src.instanceColor; c.frustumCulled = false; }
      else c = new THREE.Mesh(src.geometry, src.material);
      c.userData.noOcclude = true; g.add(c);
    }
    return g;
  }
  const staticMeshes = (st) => { const out = []; st.traverse((o) => { if (o.isMesh) out.push(o); }); return out; };

  // ---------------------------------------------------------- L12: "Confiscated for Your Safety" (set x = VG x - 48)
  const BANK = { closed: [], open: [], N: 12 };
  for (let i = 0; i < 12; i++) { BANK.closed.push(-61.0 + 0.973 + 1.823 * i); BANK.open.push(i < 6 ? -60.15 + 1.7 * i : -48.35 + 1.7 * (i - 6)); }
  function buildL12(g) {
    tint = T12; seed = 12;
    // ---- shell: north wall with the lift door, west wall, south partition, hall east wall, the aisle's east block
    wall(-66.0, -41.0, -53.8, -40.6, 3.6, W12); wall(-52.2, -41.0, -30.0, -40.6, 3.6, W12);
    bb(-53.8, 2.4, -41.0, -52.2, 3.6, -40.6, W12);
    bb(-54.0, 0, -40.62, -53.8, 2.5, -40.52, STEEL); bb(-52.2, 0, -40.62, -52.0, 2.5, -40.52, STEEL); bb(-54.0, 2.4, -40.62, -52.0, 2.55, -40.52, STEEL);
    bb(-66.3, 0, -41.0, -66.0, 3.6, -15.0, W12S);
    wall(-61.0, -15.4, -35.0, -15.0, 3.6, W12); bb(-66.0, 0, -15.4, -61.0, 3.6, -15.0, W12);
    wall(-35.2, -27.0, -35.0, -20.6, 3.6, W12); wall(-35.2, -19.4, -35.0, -15.4, 3.6, W12); bb(-35.2, 2.2, -20.6, -35.0, 3.6, -19.4, W12);
    bb(-35.24, 0, -20.75, -35.18, 2.3, -20.6, STEELD); bb(-35.24, 0, -19.4, -35.18, 2.3, -19.25, STEELD); bb(-35.24, 2.2, -20.75, -35.18, 2.3, -19.25, STEELD);
    wall(-39.0, -36.4, -30.0, -27.0, 3.6, W12); bb(-35.0, 0, -27.0, -30.0, 3.6, -24.2, W12); bb(-35.0, 0, -15.8, -30.0, 3.6, -15.0, W12);
    bb(-30.3, 0, -41.0, -30.0, 3.6, -36.4, W12);
    for (const z of [-36.3, -27.1]) bb(-39.06, 0, z - 0.06, -38.98, 3.6, z + 0.06, W12S);                   // corner trims
    bb(-66.0, 0, -40.6, -30.0, 0.1, -40.5, W12S); bb(-61.0, 0, -15.5, -35.2, 0.1, -15.4, W12S);              // skirting
    for (const y of [0.32, 0.92]) {                                                                          // hall wall guards
      bb(-47.7, y, -15.48, -35.2, y + 0.1, -15.4, 0xdde1e6); bb(-35.28, y, -27.0, -35.2, y + 0.1, -20.75, 0xdde1e6); bb(-35.28, y, -19.25, -35.2, y + 0.1, -15.4, 0xdde1e6);
      bb(-39.0, y, -27.08, -35.2, y + 0.1, -27.0, 0xdde1e6);
    }
    // ---- the service lift car (identical to hq_atrium's): rubber floor, quilted blankets on a rail, handrail
    bb(-54.1, 0, -43.0, -51.9, 0.02, -40.8, RUBBER);
    wall(-54.3, -43.2, -54.1, -40.8, 3.6, 0x8a9098); wall(-51.9, -43.2, -51.7, -40.8, 3.6, 0x8a9098); wall(-54.3, -43.2, -51.7, -43.0, 3.6, 0x8a9098);
    bb(-54.1, 2.5, -43.0, -51.9, 2.6, -40.8, 0xc8ccd2);
    tquad(2.0, 2.0, M.quilt, -54.09, 1.18, -41.95, H, 0, 0.66); tquad(1.4, 2.0, M.quilt, -51.91, 1.18, -42.25, -H, 0, 0.66);
    tquad(2.2, 2.0, M.quilt, -53.0, 1.18, -42.99, 0, 0, 0.66);
    bb(-54.1, 2.18, -43.0, -51.9, 2.22, -42.94, STEEL); bb(-54.08, 2.18, -43.0, -54.02, 2.22, -41.0, STEEL); bb(-51.98, 2.18, -43.0, -51.92, 2.22, -41.6, STEEL);
    bb(-53.9, 0.88, -42.92, -52.1, 0.92, -42.86, STEEL); bb(-54.02, 0.88, -42.9, -53.96, 0.92, -41.2, STEEL); bb(-52.04, 0.88, -42.9, -51.98, 0.92, -41.65, STEEL);
    bb(-51.94, 0.95, -41.32, -51.9, 1.55, -40.98, STEELD);                                                 // panel plate (the screen is the prop)
    // ---- ceiling: white panels, grid, 4 cold LED strips
    tint = [1.35, 1.35, 1.38]; quad(31.0, 25.6, M.vc, -50.5, 3.6, -27.8, 0, H, W12); tint = T12;
    for (let z = -40.0; z < -15.2; z += 1.2) bb(-66.0, 3.585, z - 0.015, -35.0, 3.6, z + 0.015, W12S);
    for (let x = -65.4; x < -35.2; x += 1.2) bb(x - 0.015, 3.585, -40.6, x + 0.015, 3.6, -15.0, W12S);
    for (const z of [-39.4, -35.2, -24.0, -18.5]) ledStrip(-64.0, z, -36.0, z, 3.6, 0xeef6ff);
    // ---- block A (x -66..-57) and block B (x -49..-30): static shelving, labelled bins on the aisle / lobby faces
    const LV = [0.08, 0.78, 1.48, 2.18];
    at(-61.0, -36.4, 0); shelfRun(4.0, 0.55, 2.9, LV, (i, l) => (i === 1 || i === 2) && l === 1); XF = null;
    // SKATEBOARDS: a wide open bin at (-59.0, 1.0) with 12 boards on edge poking out (IM below), plate on the shelf lip
    bb(-59.65, 0.78, -36.9, -58.35, 1.06, -36.42, 0x8a929a); bb(-59.6, 0.8, -36.86, -58.4, 0.82, -36.46, 0x50565e);
    sign(SIG.skate, 0.8, 0.1, -59.0, 0.72, -36.36, 0);
    at(-57.0, -36.4, H); shelfRun(4.2, 0.55, 2.9, LV); XF = null;
    at(-61.0, -40.6, -H); shelfRun(4.2, 0.55, 2.9, LV); XF = null;
    bb(-60.45, 0, -40.6, -57.55, 2.9, -36.95, W12S);
    at(-49.0, -36.4, 0); shelfRun(3.4, 0.55, 2.9, LV); XF = null;                         // x -49..-45.6
    // KITCHEN KNIVES · BRISBANE (x -45.6..-44.4): a wall rack of 40 blades (IM below), a bin up top
    for (const x of [-45.6, -44.4]) bb(x - 0.03, 0, -36.95, x + 0.03, 2.9, -36.4, W12);
    bb(-45.6, 0, -36.95, -44.4, 0.08, -36.4, W12); bb(-45.6, 2.85, -36.95, -44.4, 2.9, -36.38, W12); bb(-45.6, 2.15, -36.95, -44.4, 2.18, -36.4, W12);
    bb(-45.6, 0, -36.95, -44.4, 2.9, -36.92, W12S);
    at(-45.6, -36.4, 0); bin(0.6, 2.18, 0.82, 0.55); XF = null;
    bb(-45.55, 0.66, -36.5, -44.45, 1.52, -36.42, 0x3a3e44); bb(-45.55, 1.36, -36.42, -44.45, 1.4, -36.36, 0x8a929c); bb(-45.55, 1.04, -36.42, -44.45, 1.08, -36.36, 0x8a929c);
    sign(SIG.knives, 1.0, 0.125, -45.0, 1.62, -36.36, 0);
    at(-44.4, -36.4, 0); shelfRun(1.5, 0.55, 2.9, LV); XF = null;                         // x -44.4..-42.9
    // LADDERS (x -42.6..-39.4): aluminium ladders hung on their sides on brackets at y 0.6 / 1.2 / 1.8
    for (const x of [-42.9, -39.0]) bb(x - 0.03, 0, -36.95, x + 0.03, 2.9, -36.4, W12);
    bb(-42.9, 0, -36.95, -39.0, 0.08, -36.4, W12); bb(-42.9, 2.85, -36.95, -39.0, 2.9, -36.38, W12);
    bb(-42.9, 0, -36.95, -39.0, 2.9, -36.86, 0x8a929c);
    for (const y of [0.6, 1.2, 1.8]) {
      for (const x of [-42.3, -41.0, -39.7]) bb(x - 0.03, y - 0.05, -36.86, x + 0.03, y, -36.6, STEELD);
      bb(-42.6, y, -36.72, -39.4, y + 0.045, -36.65, 0xeef1f4); bb(-42.6, y + 0.375, -36.72, -39.4, y + 0.42, -36.65, 0xeef1f4);
      for (let x = -42.45; x < -39.4; x += 0.3) bb(x - 0.016, y + 0.045, -36.7, x + 0.016, y + 0.375, -36.67, 0xdde1e6);
    }
    sign(SIG.ladders, 0.8, 0.1, -41.0, 2.5, -36.85, 0);
    at(-49.0, -40.6, -H); shelfRun(4.2, 0.55, 2.9, LV); XF = null;
    bb(-48.45, 0, -40.6, -30.0, 2.9, -36.95, W12S);
    COL.push([-66.0, -40.6, -57.0, -36.4], [-49.0, -40.6, -30.0, -36.4]);
    // ---- the deep archive behind the fence: shelving on the west wall (x -66..-65.4), the robot lane (x -64.5..-62)
    at(-66.0, -15.4, H); shelfRun(25.2, 0.6, 3.3, [0.08, 0.78, 1.48, 2.18, 2.88]); XF = null;
    for (const x of [-64.4, -62.2]) bb(x - 0.03, 0, -40.4, x + 0.03, 0.006, -15.6, 0x8a9cb0);
    // ---- the west fence (x -61.2..-61.0): posts, rails, chain-link
    for (let k = 0; k <= 8; k++) { const z = -36.4 + k * 2.625; bb(-61.16, 0, z - 0.05, -61.04, 2.45, z + 0.05, STEELD); }
    bb(-61.14, 2.38, -36.4, -61.06, 2.44, -15.4, STEELD); bb(-61.14, 0.06, -36.4, -61.06, 0.12, -15.4, STEELD);
    tquad(21.0, 2.3, M.fence, -61.1, 1.25, -25.9, H, 0, 0.5);
    COL.push([-61.2, -36.4, -61.0, -15.4]);
    // ---- the bank's floor rails
    for (const z of [-33.0, -28.0]) { bb(-61.0, 0, z - 0.07, -39.0, 0.025, z - 0.03, STEELD); bb(-61.0, 0, z + 0.03, -39.0, 0.025, z + 0.07, STEELD); }
    // ---- the bins hall: guitars cage, fireworks / scissors bins, flavour bins, the headphones pegboard + sign
    cage(-55.5, -21.8, 1.8, 1.0, 0.9);
    sign(SIG.noise, 1.2, 0.15, -55.5, 0.75, -22.34, PI);
    greyBin(-58.8, -18.6, 1.6, 1.0, 0.8); lab(LAB.fireworks, 0.8, 0.1, -58.8, 0.62, -19.12, PI);
    for (let i = 0; i < 14; i++) { const x = -59.4 + (i % 7) * 0.2, z = -18.95 + ((i / 7) | 0) * 0.42 + rnd() * 0.12, h = 0.25 + rnd() * 0.35; cyl(0.05, 0.05, h, 6, [0xc8323a, 0x1f6fe0, 0x2fb8a8, 0xe8e8ea][i % 4], x, 0.72 + h / 2, z); }
    bb(-58.4, 0.72, -18.5, -58.1, 0.95, -18.2, 0xc8323a); bb(-58.6, 0.72, -18.9, -58.2, 0.88, -18.6, 0x1f6fe0);
    greyBin(-51.6, -18.6, 1.6, 1.0, 0.8); lab(LAB.scissors, 0.8, 0.1, -51.6, 0.62, -19.12, PI);
    { const g2 = new THREE.SphereGeometry(0.55, 8, 4, 0, TAU, 0, H); g2.scale(1.25, 0.35, 0.75); g2.translate(-51.6, 0.7, -18.6); put(g2, 0x9aa0a8); }
    for (let i = 0; i < 24; i++) { const a = rnd() * TAU, r = rnd() * 0.55; boxR(0.07, 0.025, 0.035, [0xc8323a, 0x1f6fe0, 0xd87a2a, 0x3a3e44][i % 4], -51.6 + Math.cos(a) * r * 1.2, 0.79 + 0.1 * (1 - r), -18.6 + Math.sin(a) * r * 0.6, 0, rnd() * PI, 0); }
    for (const [x, z, s] of [[-46.0, -16.0, 6], [-42.4, -16.0, 7], [-38.8, -16.0, 8], [-37.6, -26.35, 9]]) {
      greyBin(x, z, 1.3, 0.8, 0.7); greyBin(x, z, 1.2, 0.7, 0.6, 0.7, true);
      lab([0, s], 0.72, 0.09, x, 0.5, z - 0.41, PI); lab([0, s + 4 > 15 ? 6 : s + 4], 0.66, 0.0825, x, 1.08, z - 0.36, PI);
      COL.push([x - 0.65, z - 0.4, x + 0.65, z + 0.4]);
    }
    COL.push([-56.4, -22.3, -54.6, -21.3], [-59.6, -19.1, -58.0, -18.1], [-52.4, -19.1, -50.8, -18.1]);
    bb(-60.2, 0.3, -15.46, -47.8, 2.72, -15.4, 0x9aa0a8); bb(-60.1, 0.34, -15.48, -47.9, 2.68, -15.46, 0xd6dadf);
    for (let y = 0.45; y < 2.6; y += 0.2) bb(-60.05, y + 0.09, -15.5, -47.95, y + 0.1, -15.48, 0xc4c8ce);   // peg rows
    bb(-57.1, 2.73, -15.47, -50.9, 3.17, -15.4, 0x1c3a6a);
    sign(SIG.headphones, 6.0, 0.4, -54.0, 2.95, -15.475, PI);
    // ---- the stair stub (x -35..-30.4, z -24..-16): dark concrete landing, steps up
    tint = [0.6, 0.62, 0.66];
    bb(-35.0, 0, -24.0, -30.4, 0.01, -16.0, CONC);
    wall(-35.0, -24.2, -30.4, -24.0, 3.6, CONC); wall(-35.0, -16.0, -30.4, -15.8, 3.6, CONC); bb(-30.6, 0, -24.0, -30.4, 3.6, -16.0, CONC);
    for (let k = 0; k < 6; k++) bb(-33.0 + 0.4 * k, 0, -23.8, -30.6, 0.17 * (k + 1), -16.2, k % 2 ? 0x4a4f56 : 0x42474e);
    bb(-35.0, 3.5, -24.0, -30.4, 3.6, -16.0, 0x2a2e34);
    lab(LAB.stairwell, 0.8, 0.1, -35.215, 2.35, -20.0, -H);
    COL.push([-33.0, -24.0, -30.4, -16.0]);
    tint = T12;
  }
  function cage(cx, cz, w, d, h) {   // a rolling wire cage bin (static)
    bb(cx - w / 2, 0.1, cz - d / 2, cx + w / 2, 0.16, cz + d / 2, 0x7a828c);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { cyl(0.05, 0.05, 0.04, 8, 0x2a2c30, cx + sx * (w / 2 - 0.1), 0.05, cz + sz * (d / 2 - 0.1), 0, H); bb(cx + sx * w / 2 - 0.03, 0.1, cz + sz * d / 2 - 0.03, cx + sx * w / 2 + 0.03, h, cz + sz * d / 2 + 0.03, 0x8a929c); }
    for (let x = cx - w / 2 + 0.15; x < cx + w / 2 - 0.05; x += 0.15) for (const sz of [-1, 1]) bb(x - 0.008, 0.16, cz + sz * d / 2 - 0.008, x + 0.008, h, cz + sz * d / 2 + 0.008, 0x9aa2aa);
    for (let z = cz - d / 2 + 0.15; z < cz + d / 2 - 0.05; z += 0.15) for (const sx of [-1, 1]) bb(cx + sx * w / 2 - 0.008, 0.16, z - 0.008, cx + sx * w / 2 + 0.008, h, z + 0.008, 0x9aa2aa);
    for (const y of [0.5, h]) { bb(cx - w / 2, y - 0.02, cz - d / 2 - 0.01, cx + w / 2, y, cz - d / 2 + 0.01, 0x8a929c); bb(cx - w / 2, y - 0.02, cz + d / 2 - 0.01, cx + w / 2, y, cz + d / 2 + 0.01, 0x8a929c); bb(cx - w / 2 - 0.01, y - 0.02, cz - d / 2, cx - w / 2 + 0.01, y, cz + d / 2, 0x8a929c); bb(cx + w / 2 - 0.01, y - 0.02, cz - d / 2, cx + w / 2 + 0.01, y, cz + d / 2, 0x8a929c); }
  }
  function greyBin(cx, cz, w, d, h, y0 = 0, lid = false) {   // a big grey plastic floor bin (open top)
    bb(cx - w / 2, y0, cz - d / 2, cx + w / 2, y0 + h, cz + d / 2, BIN);
    bb(cx - w / 2 - 0.03, y0 + h - 0.06, cz - d / 2 - 0.03, cx + w / 2 + 0.03, y0 + h, cz + d / 2 + 0.03, 0x8a929a);
    if (!lid) bb(cx - w / 2 + 0.05, y0 + h - 0.08, cz - d / 2 + 0.05, cx + w / 2 - 0.05, y0 + h - 0.06, cz + d / 2 - 0.05, 0x3a3e44);
    else bb(cx - w / 2, y0 + h, cz - d / 2, cx + w / 2, y0 + h + 0.04, cz + d / 2, 0x8a929a);
  }
  function propsL12(g) {
    const P = (o) => (g.add(o), o);
    // ---- the lift: car light, panel, speaker grille, the steel leaf
    R.lift12 = P(part('l12_lift', () => {
      quad(0.22, 0.44, M.liftPanel, -51.945, 1.25, -41.15, -H);
      quad(0.3, 0.3, M.pa, -53.0, 2.495, -41.9, 0, H);
      bb(-53.65, 2.49, -42.55, -52.35, 2.5, -41.25, 0x8a9098);
    }, null, 0, { floor: false }));
    R.liftLight = part('l12_lift_light', () => { quad(1.2, 1.2, M.glow, -53.0, 2.488, -41.9, 0, H, 0xfff6e8); }, null, 0, { floor: false });
    R.lift12.add(R.liftLight);
    R.liftLeaf = part('l12_lift_leaf', () => {
      bb(-53.8, 0, -40.75, -52.2, 2.4, -40.69, 0xa8aeb6);
      for (let x = -53.7; x < -52.25; x += 0.18) bb(x, 0.05, -40.687, x + 0.012, 2.35, -40.684, 0x9aa0a8);
    }, null, 0);
    R.lift12.add(R.liftLeaf);
    R.liftCol = [-53.8, -40.8, -52.2, -40.6]; COL.push(R.liftCol);
    R.lift12.userData = {
      doors(u = 1) { R.liftTo = clamp01(+u); if (skipping()) R.liftU = R.liftTo; else if (R.liftTo !== R.liftU) snd('door_slide', 0.5, 0.9, LIFT_AT); },
      light(on = true) { R.liftLightOn = !!on; R.liftLight.visible = !!on; },
      panel(fl) { if (T.state.panel === fl) return; T.state.panel = fl; repaint(T.liftPanel, (c) => paintLiftPanel(c, fl)); },
      get u() { return R.liftU; },
    };
    R.pa12 = P(paGrille('pa12', -53.0, 3.6, -38.4));
    // ---- shelf controls
    R.ctrlW = P(part('ctrl_w', () => {
      bb(-61.12, 0, -35.3, -61.0, 1.45, -35.1, STEELD);
      bb(-61.0, 0.86, -35.43, -60.93, 1.34, -34.97, 0xe8eef4); quad(0.38, 0.38, M.ctrlW, -60.925, 1.1, -35.2, H);
    }, null, 0));
    R.ctrlE = P(part('ctrl_e', () => {
      bb(-39.07, 0.86, -35.43, -39.0, 1.34, -34.97, 0xe8eef4); quad(0.38, 0.38, M.ctrlE, -39.075, 1.1, -35.2, -H);
    }, null, 0));
    const ctrlApi = (k) => ({
      held(on = true) { R.ctrlHeld[k] = !!on; },
      progress(v) { R.ctrlK = clamp01(+v || 0); },
    });
    R.ctrlHeld = [false, false]; R.ctrlK = R.ctrlK || 0;
    R.ctrlW.userData = ctrlApi(0); R.ctrlE.userData = ctrlApi(1);
    // ---- the mobile shelf bank: 12 units (one Group each: merged body + its labels), amber beacons (IM)
    R.bank = P(new THREE.Group()); R.bank.name = 'bank'; R.units = []; R.unitCol = [];
    for (let i = 0; i < 12; i++) {
      seed = 100 + i;
      const u = part('bank_u' + i, () => unitModel(i), [BANK.closed[i], 0, -30.5]);
      R.bank.add(u); R.units.push(u);
      const c = [BANK.closed[i] - 0.85, -34.0, BANK.closed[i] + 0.85, -27.0]; COL.push(c); R.unitCol.push(c);
    }
    const bg = geoOf(() => { cyl(0.09, 0.1, 0.05, 8, 0x3a3e44, 0, 0.025, 0); cyl(0.065, 0.075, 0.1, 8, 0xffffff, 0, 0.1, 0); });
    R.beacons = instanced(bg, BEACM, BANK.closed.map((x) => [x, 2.83, -30.5, 0, 1]));
    R.beacons.name = 'bank_beacons'; R.beacons.instanceMatrix.setUsage(THREE.DynamicDrawUsage); R.bank.add(R.beacons);
    R.bank.userData = {
      open(u = 1) { R.bankTo = clamp01(+u); if (skipping()) { R.bankK = R.bankTo; placeBank(0); } else if (R.bankTo !== R.bankK) snd('door_slide', 0.45, 0.6, BANK_AT); },
      jiggle() { R.jigT = 0; snd('clunk', 0.35, 1.4, BANK_AT); },
      get isOpen() { return R.bankK >= 0.999; },
      get k() { return R.bankK; },
    };
    // ---- the shelf robots behind the fence (IM 2)
    const rg = geoOf(() => {
      bb(-0.45, 0.04, -0.45, 0.45, 0.32, 0.45, 0xeef1f4); cyl(0.05, 0.05, 0.9, 8, 0x2a2c30, 0, 0.05, -0.3, 0, H); cyl(0.05, 0.05, 0.9, 8, 0x2a2c30, 0, 0.05, 0.3, 0, H);
      bb(-0.12, 0.2, 0.45, 0.12, 0.26, 0.47, 0x6fc8ff);
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) bb(sx * 0.42 - 0.025, 0.32, sz * 0.42 - 0.025, sx * 0.42 + 0.025, 2.92, sz * 0.42 + 0.025, 0xd8dce2);
      for (let k = 0; k < 4; k++) { const y = 0.36 + k * 0.64; bb(-0.45, y, -0.45, 0.45, y + 0.03, 0.45, 0xe2e6ea); bb(-0.38, y + 0.03, -0.4, 0.38, y + 0.38, 0.4, [BIN, 0x8a929a, BIN, 0xa8b0b8][k]); }
      bb(-0.45, 2.9, -0.45, 0.45, 2.94, 0.45, 0xe2e6ea);
    });
    R.bots = instanced(rg, M.vc, [[-63.3, 0, -36, 0, 1], [-63.3, 0, -22, 0, 1]]);
    R.bots.name = 'lane_bots'; R.bots.instanceMatrix.setUsage(THREE.DynamicDrawUsage); R.bots.frustumCulled = false; g.add(R.bots);
    // ---- the bins' repeats: guitars (9), skateboards (12), knives (40), Chase (2040)'s acoustic
    const binsG = P(new THREE.Group()); binsG.name = 'bins_l12';
    const gg = geoOf(() => guitarModel(false));
    const gl = [];
    for (let i = 0; i < 9; i++) gl.push([-56.15 + (i % 5) * 0.32 + (i > 4 ? 0.16 : 0), 0.16, -21.6 + (i > 4 ? 0.2 : -0.02), PI + (rnd() - 0.5) * 0.6, 1]);
    const guitars = instanced(gg, M.vc, gl); guitars.name = 'l12_guitars';
    const GCOL = [0xa0522d, 0x1a1a1c, 0xa8202a, 0xc8a070, 0xe8e4dc, 0x2a4a8a, 0x6a3a2a, 0x8a8a90, 0xb06030];
    for (let i = 0; i < 9; i++) { qv.setFromEuler(ev.set(-0.12 - rnd() * 0.1, gl[i][3], (rnd() - 0.5) * 0.2)); guitars.setMatrixAt(i, m5.compose(pv.set(gl[i][0], gl[i][1], gl[i][2]), qv, sv.set(1, 1, 1))); guitars.setColorAt(i, tc.set(GCOL[i])); }
    guitars.instanceMatrix.needsUpdate = true; binsG.add(guitars);
    const sg = geoOf(() => {
      bb(-0.012, 0.0, -0.4, 0.012, 0.2, 0.4, 0xffffff);
      for (const z of [-0.26, 0.26]) { bb(0.012, 0.07, z - 0.03, 0.05, 0.13, z + 0.03, 0xb8bec6); for (const y of [0.04, 0.16]) cyl(0.028, 0.028, 0.03, 8, 0xe8e4d0, 0.06, y, z, 0, H); }
    });
    const sl = []; for (let i = 0; i < 12; i++) sl.push([-59.55 + i * 0.1, 0.87, -36.66 + rnd() * 0.06, 0, 1]);
    const boards = instanced(sg, M.vc, sl); boards.name = 'l12_skateboards';
    const SCOL = [0xc8323a, 0x1f6fe0, 0x2fb8a8, 0x1a1a1c, 0xe88ab0, 0x6a8a3a, 0xd87a2a, 0xe8e8ea, 0x4a3a8a, 0x1a1a1c, 0xa04880, 0x3a6a8a];
    for (let i = 0; i < 12; i++) boards.setColorAt(i, tc.set(SCOL[i]));
    binsG.add(boards);
    const kg = geoOf(() => { bb(-0.012, 0, -0.004, 0.012, 0.2, 0.004, 0xd8dde2); bb(-0.014, 0.2, -0.008, 0.014, 0.31, 0.008, 0xffffff); });
    const kl = []; for (let i = 0; i < 40; i++) kl.push([-45.47 + (i % 20) * 0.05 + (i < 20 ? 0 : 0.025), 1.0, i < 20 ? -36.37 : -36.35, 0, 1]);
    const knives = instanced(kg, M.vc, kl); knives.name = 'l12_knives';
    for (let i = 0; i < 40; i++) { const hgt = 0.75 + (i * 7 % 5) * 0.08, top = i < 20 ? 1.38 : 1.06; knives.setMatrixAt(i, m5.compose(pv.set(kl[i][0], top - 0.31 * hgt, kl[i][2]), qv.identity(), sv.set(1, hgt, 1))); knives.setColorAt(i, tc.set([0x1a1a1c, 0x5a3a2a, 0x2a2a2e, 0xc8323a][i % 4])); }
    knives.instanceMatrix.needsUpdate = true; binsG.add(knives);
    R.chaseGuitar = P(part('chase_guitar', () => guitarModel(true), [-55.15, 0.17, -21.98], PI + 0.25));
    R.chaseGuitar.rotation.x = -0.32; R.chaseGuitar.rotation.order = 'YXZ';
    // ---- the headphones wall: ~300 on pegs (IM, instanceColor); PICK = the pair at headphones_pick
    const hg = geoOf(() => {
      const t = new THREE.TorusGeometry(0.085, 0.012, 4, 12, PI); t.translate(0, 0.0, 0); put(t, 0xffffff);
      for (const sx of [-1, 1]) { cyl(0.048, 0.048, 0.045, 10, 0xffffff, sx * 0.09, -0.02, 0, 0, H); cyl(0.04, 0.04, 0.012, 10, 0x2a2a2e, sx * 0.064, -0.02, 0, 0, H); }
    });
    const HCOL = [0x1a1a1c, 0xe8e8ea, 0xc8323a, 0x1f6fe0, 0xe88ab0, 0x2fb8a8, 0xb8bcc4];
    const hl = [], hc = []; seed = 300;
    for (let r = 0; r < 11; r++) {
      const odd = r % 2 === 1, n = odd ? 29 : 30, x0 = odd ? -59.6 : -59.8, y = 0.45 + 0.2 * r;
      for (let i = 0; i < n; i++) {
        const x = x0 + 0.4 * i, pick = r === 5 && Math.abs(x + 54.0) < 0.01;
        if (!pick && rnd() < 0.04) continue;
        if (pick) R.PICK = hl.length;
        hl.push([x, y, -15.53, PI + (pick ? 0 : (rnd() - 0.5) * 0.25), 1]); hc.push(pick ? 0x1a1a1c : HCOL[(rnd() * HCOL.length) | 0]);
      }
    }
    R.phones = instanced(hg, M.vc, hl); R.phones.name = 'headphones_wall';
    for (let i = 0; i < hl.length; i++) R.phones.setColorAt(i, tc.set(hc[i]));
    R.phonesPick = hl[R.PICK];
    R.phones.userData = {
      take() { R.taken = true; applyTaken(); },
      put() { R.taken = false; applyTaken(); },
      get taken() { return !!R.taken; }, count: hl.length, pick: R.PICK,
    };
    g.add(R.phones); applyTaken();
    // ---- the trampoline bin (rolling cage, folded trampolines)
    R.tramp = P(part('tramp_bin', () => {
      bb(-0.5, 0.1, -0.8, 0.5, 0.16, 0.8, 0x7a828c);
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) { cyl(0.05, 0.05, 0.04, 8, 0x2a2c30, sx * 0.4, 0.05, sz * 0.7, 0, H); bb(sx * 0.5 - 0.03, 0.1, sz * 0.8 - 0.03, sx * 0.5 + 0.03, 1.7, sz * 0.8 + 0.03, 0x8a929c); }
      for (let z = -0.65; z < 0.75; z += 0.15) for (const sx of [-1, 1]) bb(sx * 0.5 - 0.008, 0.16, z - 0.008, sx * 0.5 + 0.008, 1.7, z + 0.008, 0x9aa2aa);
      for (let x = -0.35; x < 0.45; x += 0.15) for (const sz of [-1, 1]) bb(x - 0.008, 0.16, sz * 0.8 - 0.008, x + 0.008, 1.7, sz * 0.8 + 0.008, 0x9aa2aa);
      for (const y of [0.9, 1.7]) { bb(-0.51, y - 0.03, -0.81, 0.51, y, -0.79, 0x8a929c); bb(-0.51, y - 0.03, 0.79, 0.51, y, 0.81, 0x8a929c); bb(-0.51, y - 0.03, -0.8, -0.49, y, 0.8, 0x8a929c); bb(0.49, y - 0.03, -0.8, 0.51, y, 0.8, 0x8a929c); }
      for (let k = 0; k < 4; k++) {
        const x = -0.33 + k * 0.22, mt = new THREE.CylinderGeometry(0.66, 0.66, 0.05, 16, 1, false, 0, PI);
        mt.rotateZ(H); mt.translate(x, 0.2, 0); put(mt, 0x1a1a1c);
        torus(0.68, 0.06, 5, 16, 0x1f6fe0, x, 0.2, 0, 0, H, M.vc, PI);
      }
      lab(LAB.trampolines, 0.8, 0.1, -0.53, 1.25, 0, -H); lab(LAB.trampolines, 0.8, 0.1, 0.53, 1.25, 0, H);
    }, [-35.5, 0, -20.0]));
    R.trampCol = [-36.0, -20.8, -35.0, -19.2]; COL.push(R.trampCol);
    R.tramp.userData = {
      push(u) { R.binTo = Math.max(R.binTo, clamp01(+u || 0)); if (R.binTo >= 1) R.binDone = true; if (skipping()) R.binU = R.binTo; },
      reset() { R.binTo = R.binU = 0; R.binDone = false; },
      get done() { return !!R.binDone; }, get u() { return R.binU; },
    };
    // ---- the stair door (leaf hinged on the north jamb, opens east)
    R.stairDoor = P(part('stair_door12', () => {
      bb(-0.05, 0, 0.02, 0.0, 2.18, 1.18, 0x8a929c); bb(0.0, 0.95, 0.15, 0.06, 1.0, 1.05, STEEL); bb(-0.11, 0.95, 0.15, -0.05, 1.0, 1.05, STEEL);
      bb(-0.052, 1.45, 0.4, 0.002, 1.85, 0.8, 0x3a4048);
    }, [-35.08, 0, -20.6]));
    R.stairCol = [-35.1, -20.6, -35.0, -19.4]; COL.push(R.stairCol);
    R.stairDoor.userData = { open(u = 1) { R.sdTo = clamp01(+u); if (skipping()) R.sdU = R.sdTo; else if (R.sdTo > R.sdU) snd('creak', 0.4, 1.0, STAIR_AT); }, get u() { return R.sdU; } };
  }
  function unitModel(i) {   // one mobile shelf unit, local: x -0.85..0.85, z -3.5..3.5 (centre z -30.5)
    bb(-0.85, 0.03, -3.5, 0.85, 0.17, 3.5, 0x5a6068);
    for (const z of [-2.5, 2.5]) for (const sx of [-1, 1]) cyl(0.07, 0.07, 0.05, 8, 0x2a2c30, sx * 0.6, 0.07, z + sx * 0.0, 0, H);
    for (const sx of [-1, 1]) for (let k = 0; k <= 4; k++) { const z = Math.max(-3.47, Math.min(3.47, -3.5 + k * 1.75)); bb(sx * 0.82 - 0.03, 0.17, z - 0.03, sx * 0.82 + 0.03, 2.8, z + 0.03, W12); }
    bb(-0.03, 0.17, -3.45, 0.03, 2.8, 3.45, W12S);
    for (const y of [0.3, 0.95, 1.6, 2.25]) bb(-0.85, y - 0.03, -3.5, 0.85, y, 3.5, W12);
    bb(-0.86, 2.76, -3.52, 0.86, 2.8, 3.52, 0xe2e6ea);
    for (const y of [0.3, 0.95, 1.6, 2.25]) for (let k = 0; k < 5; k++) for (const sx of [-1, 1]) {
      const z = -3.5 + 0.7 + k * 1.4, hex = rnd() < 0.15 ? 0x8a929a : BIN;
      bb(sx > 0 ? 0.08 : -0.79, y, z - 0.6, sx > 0 ? 0.79 : -0.08, y + 0.34, z + 0.6, hex);
      quad(1.0, 0.16, M.vc, sx * 0.795, y + 0.19, z, sx * H, 0, 0x50565e);
      quad(0.2, 0.06, M.vc, sx * 0.797, y + 0.07, z, sx * H, 0, PLATE);
    }
    for (const sz of [-1, 1]) {
      bb(-0.85, 0.17, sz * 3.5 - 0.03, 0.85, 2.76, sz * 3.5 + 0.03, 0xe2e6ea);
      lab([1, i], 1.3, 0.1625, 0, 2.45, sz * 3.535, sz < 0 ? PI : 0);
      bb(-0.12, 0.5, sz * 3.53, 0.12, 1.9, sz * 3.56, 0xc8ccd2);
    }
    torus(0.28, 0.025, 5, 16, 0x8a929c, 0, 1.25, -3.66, 0, 0); cyl(0.04, 0.04, 0.14, 8, 0x5a6068, 0, 1.25, -3.6, H);
    for (let k = 0; k < 3; k++) boxR(0.02, 0.54, 0.02, 0x8a929c, 0, 1.25, -3.66, 0, 0, k * PI / 3);
  }
  function guitarModel(chase) {   // local origin at the bottom of the body, neck up (+y), front (soundhole) facing +z
    const bodyC = chase ? 0xc89a62 : 0xffffff, dark = chase ? 0x5a3a24 : 0x6a6a6a;
    const lower = new THREE.CylinderGeometry(0.2, 0.2, 0.09, 14); lower.rotateX(H); lower.translate(0, 0.2, 0); put(lower, bodyC);
    const upper = new THREE.CylinderGeometry(0.15, 0.15, 0.09, 14); upper.rotateX(H); upper.translate(0, 0.42, 0); put(upper, bodyC);
    cyl(0.055, 0.055, 0.01, 12, 0x101010, 0, 0.36, 0.046, H);
    bb(-0.028, 0.5, -0.012, 0.028, 0.98, 0.022, dark);
    bb(-0.045, 0.98, -0.014, 0.045, 1.16, 0.018, chase ? 0x3a2a1e : 0x2a2a2a);
    bb(-0.05, 0.22, 0.045, 0.05, 0.24, 0.05, 0x2a1a10);
    if (chase) {
      bb(0.06, 0.13, 0.046, 0.14, 0.2, 0.05, 0xc8323a); bb(-0.15, 0.22, 0.046, -0.08, 0.28, 0.05, 0x1f6fe0);
      bb(0.04, 0.44, 0.046, 0.1, 0.5, 0.05, 0x2fb8a8); bb(-0.12, 0.1, 0.046, -0.04, 0.14, 0.05, 0xe8e8ea); bb(0.1, 0.3, 0.046, 0.15, 0.36, 0.05, 0xe88ab0);
      bb(-0.046, 1.04, 0.018, 0.03, 1.16, 0.022, 0x161210); bb(0.0, 0.99, 0.018, 0.04, 1.06, 0.021, 0x2a1c14);   // the scorch
      bb(-0.18, 0.12, 0.046, -0.13, 0.17, 0.049, 0x8a6a4a); bb(0.12, 0.08, 0.046, 0.17, 0.12, 0.049, 0x9a7a52);  // worn patches
      for (let k = 0; k < 4; k++) bb(-0.002 - 0.012 * (k - 1.5), 0.24, 0.05, 0.002 - 0.012 * (k - 1.5), 1.1, 0.054, 0xd8d8d0);
    }
  }

  // ---------------------------------------------------------- L21: "The Oldest Line" (set x = VG x)
  const RACK_ROWS = [   // [z0, z1, gaps [[x0, x1]], led]
    [-34.2, -33.0, [[1.0, 2.4]], 'A'], [-30.2, -29.0, [[-5.4, -4.0]], 'B'], [-26.2, -25.0, [[3.6, 5.0]], 'A'], [-22.2, -21.0, [], 'B'],
  ];
  const VENTS = [];
  for (const x of [-7, -1, 5]) for (const z of [-35.6, -31.6, -27.6, -23.6]) VENTS.push([x, z]);
  function rackRun(x0, x1, z0, z1, led, faces = 3) {   // a run of server racks x0..x1 (doors on faces: 1 north, 2 south)
    bb(x0, 0, z0 + 0.02, x1, 2.2, z1 - 0.02, RACK21);
    bb(x0, 2.2, z0, x1, 2.26, z1, 0x2a3646); bb(x0, 0, z0, x1, 0.06, z1, 0x101820);
    const len = x1 - x0, cx = (x0 + x1) / 2, m = led === 'A' ? M.ledA : M.ledB;
    if (faces & 1) tquad(len, 2.0, m, cx, 1.12, z0 + 0.012, PI, 0, [0.6, 2.0], 0xffffff, (x0 * 7.3) % 1);
    if (faces & 2) tquad(len, 2.0, m, cx, 1.12, z1 - 0.012, 0, 0, [0.6, 2.0], 0xffffff, (x0 * 3.1) % 1);
    for (let x = x0; x <= x1 + 0.01; x += 0.6) { bb(x - 0.02, 0.06, z0, x + 0.02, 2.2, z0 + 0.03, 0x2a3646); bb(x - 0.02, 0.06, z1 - 0.03, x + 0.02, 2.2, z1, 0x2a3646); }
    for (const x of [x0, x1]) bb(x - 0.01, 0, z0, x + 0.01, 2.26, z1, 0x2a3646);
    for (let x = x0 + 1.2; x < x1 - 0.5; x += 3.0) bb(x - 0.08, 2.26, (z0 + z1) / 2 - 0.08, x + 0.08, 2.95, (z0 + z1) / 2 + 0.08, 0x141c28);   // cable risers to the tray
  }
  function tray(x0, x1, z, y = 2.95) {   // a ladder cable tray along x (rungs every 0.4 m), hung from the ceiling
    bb(x0, y - 0.06, z - 0.27, x1, y, z - 0.24, 0x5a6878); bb(x0, y - 0.06, z + 0.24, x1, y, z + 0.27, 0x5a6878);
    for (let x = x0 + 0.2; x < x1; x += 0.4) bb(x - 0.02, y - 0.05, z - 0.24, x + 0.02, y - 0.03, z + 0.24, 0x4a5868);
    for (let x = x0 + 1.0; x < x1; x += 3.0) for (const s of [-1, 1]) bb(x - 0.01, y, z + s * 0.255 - 0.01, x + 0.01, 3.2, z + s * 0.255 + 0.01, 0x5a6878);
    bb(x0 + 0.1, y - 0.03, z - 0.18, x1 - 0.1, y + 0.02, z - 0.02, 0x1a2a3a); bb(x0 + 0.1, y - 0.03, z + 0.04, x1 - 0.1, y + 0.01, z + 0.16, 0x2a2a3a);
  }
  function buildL21(g) {
    tint = T21; seed = 21;
    // ---- shell (h 3.2): outer walls, the east door opening, skirting
    wall(-14.2, -37.2, -14.0, -15.2, 3.2, WALL21); wall(-14.2, -37.2, 13.2, -37.0, 3.2, WALL21); wall(-14.2, -15.4, 13.2, -15.2, 3.2, WALL21);
    wall(13.0, -37.2, 13.2, -20.6, 3.2, WALL21); wall(13.0, -19.4, 13.2, -15.2, 3.2, WALL21); bb(13.0, 2.25, -20.6, 13.2, 3.2, -19.4, WALL21);
    bb(12.95, 0, -20.72, 13.0, 2.3, -20.6, STEELD); bb(12.95, 0, -19.4, 13.0, 2.3, -19.28, STEELD); bb(12.95, 2.25, -20.72, 13.0, 2.3, -19.28, STEELD);
    bb(-14.0, 0, -37.0, -13.97, 0.12, -15.4, 0x2a3646); bb(-14.0, 0, -37.0, 13.0, 0.12, -36.97, 0x2a3646); bb(12.97, 0, -37.0, 13.0, 0.12, -15.4, 0x2a3646); bb(-14.0, 0, -15.43, 13.0, 0.12, -15.4, 0x2a3646);
    for (let x = -13.4; x < 13.0; x += 1.2) { bb(x - 0.015, 0.12, -36.97, x + 0.015, 3.2, -36.95, 0x34465c); bb(x - 0.015, 0.12, -15.45, x + 0.015, 3.2, -15.43, 0x34465c); }
    for (let z = -36.4; z < -15.4; z += 1.2) { if (z < -24.5 || z > -22.3) bb(-13.97, 0.12, z - 0.015, -13.95, 3.2, z + 0.015, 0x34465c); if (z < -20.8 || z > -19.2) bb(12.95, 0.12, z - 0.015, 12.97, 3.2, z + 0.015, 0x34465c); }
    bb(-14.0, 2.4, -36.97, 13.0, 2.46, -36.94, 0x3a4c62); bb(-14.0, 2.4, -15.46, 13.0, 2.46, -15.43, 0x3a4c62); bb(-13.97, 2.4, -37.0, -13.94, 2.46, -24.45, 0x3a4c62); bb(-13.97, 2.4, -22.35, -13.94, 2.46, -15.4, 0x3a4c62);
    bb(12.94, 2.4, -37.0, 12.97, 2.46, -20.75, 0x3a4c62); bb(12.94, 2.4, -19.25, 12.97, 2.46, -15.4, 0x3a4c62);
    // ---- ceiling (y 3.2) with the hatch opening (x -12.25..-11.35, z -17.05..-16.15), cold LED strips over the aisles
    const C = (x0, z0, x1, z1) => quad(x1 - x0, z1 - z0, M.vc, (x0 + x1) / 2, 3.2, (z0 + z1) / 2, 0, H, CEIL21);
    C(-14.0, -37.0, 13.0, -17.05); C(-14.0, -16.15, 13.0, -15.4); C(-14.0, -17.05, -12.25, -16.15); C(-11.35, -17.05, 13.0, -16.15);
    for (const z of [-35.6, -31.6, -27.6, -23.6]) { tray(-10.0, 8.0, z); ledStrip(-9.6, z - 0.6, 7.6, z - 0.6, 3.2, LED, 0.08); ledStrip(-9.6, z + 0.6, 7.6, z + 0.6, 3.2, LED, 0.08); }
    for (const x of [-12.0, 10.5]) ledStrip(x, -36.6, x, -16.0, 3.2, 0x9cd8ff, 0.1);
    // ---- the rack rows R1..R4 (glass doors with LED dots on both faces) and the CRAC block
    for (const [z0, z1, gaps, led] of RACK_ROWS) {
      let x = -10.0;
      for (const [g0, g1] of gaps) { rackRun(x, g0, z0, z1, led); x = g1; }
      rackRun(x, 8.0, z0, z1, led, z1 === -21.0 ? 1 : 3);
    }
    bb(-10.0, 0, -21.0, 8.0, 2.6, -15.4, 0x2a3646);
    for (let x = -9.4; x < 7.8; x += 2.4) {
      bb(x, 0.1, -20.9, x + 2.0, 2.5, -20.88, 0x34404e);
      for (let y = 0.4; y < 2.4; y += 0.16) { bb(-10.03, y, -20.6, -10.0, y + 0.06, -15.8, 0x1a2230); bb(8.0, y, -20.6, 8.03, y + 0.06, -15.8, 0x1a2230); }
    }
    for (let x = -8.0; x < 8.0; x += 4.0) bb(x, 2.6, -19.8, x + 1.6, 3.2, -17.2, 0x3a4656);
    bb(-10.05, 2.0, -20.4, -10.0, 2.3, -19.4, LED, M.glow); bb(8.0, 2.0, -20.4, 8.05, 2.3, -19.4, LED, M.glow);
    COL.push([-10.0, -34.2, 1.0, -33.0], [2.4, -34.2, 8.0, -33.0], [-10.0, -30.2, -5.4, -29.0], [-4.0, -30.2, 8.0, -29.0],
      [-10.0, -26.2, 3.6, -25.0], [5.0, -26.2, 8.0, -25.0], [-10.0, -22.2, 8.0, -15.4]);
    // ---- floor vents (fog) at the aisle centres
    for (const [x, z] of VENTS) { bb(x - 0.3, 0, z - 0.3, x + 0.3, 0.006, z + 0.3, 0x1a2636); for (let k = -2; k <= 2; k++) bb(x - 0.24, 0, z + k * 0.1 - 0.02, x + 0.24, 0.008, z + k * 0.1 + 0.02, 0x070b10); }
    // ---- the 1987 brick patch on the west wall (z -24.4..-22.4, y 0..2.2) + LINE ROOM · 1987
    tquad(2.0, 2.2, M.brick, -13.985, 1.1, -23.4, H, 0, 0.5);
    bb(-14.0, 2.2, -24.45, -13.96, 2.26, -22.35, 0x8a7a5a); bb(-14.0, 0, -24.45, -13.96, 2.26, -24.4, 0x8a7a5a); bb(-14.0, 0, -22.4, -13.96, 2.26, -22.35, 0x8a7a5a);
    lab(LAB.lineroom, 1.2, 0.15, -13.982, 1.75, -23.4, H);
    // the old beige copper line: from the jack along the skirting to z -22.4, up the wall into a conduit to the ceiling
    bb(-13.985, 0.42, -23.41, -13.965, 0.45, -23.39, BEIGE); bb(-13.985, 0.08, -23.41, -13.965, 0.43, -23.39, BEIGE);
    bb(-13.985, 0.07, -23.41, -13.965, 0.09, -22.35, BEIGE); bb(-13.985, 0.07, -22.37, -13.965, 2.8, -22.35, BEIGE);
    bb(-13.99, 2.8, -22.4, -13.95, 2.84, -18.0, BEIGE); bb(-14.0, 2.75, -18.1, -13.9, 3.2, -17.9, 0x5a6878);
    // ---- cooling pipes (dia 0.3) down the walls from the trays; the valve bodies (the wheels are the prop)
    for (const [px, sx] of [[-13.85, 1], [12.85, -1]]) {
      cyl(0.15, 0.15, 3.2, 10, PIPE, px, 1.6, -32.4);
      cyl(0.17, 0.17, 0.1, 10, 0x1a4a7a, px, 0.15, -32.4); cyl(0.17, 0.17, 0.1, 10, 0x1a4a7a, px, 2.3, -32.4);
      cyl(0.15, 0.15, 3.0, 10, PIPE, px + sx * 1.5, 3.0, -32.4, 0, H);
      cyl(0.09, 0.09, 0.32, 8, 0x3a4048, px + sx * 0.2, 1.15, -32.4, 0, H); bb(px + sx * 0.08 - 0.12, 1.0, -32.55, px + sx * 0.08 + 0.12, 1.3, -32.25, 0x1a4a7a);
      sign2(px + sx * 0.16, 1.62, -32.4, sx);
    }
    COL.push([-14.0, -32.7, -13.5, -32.1], [12.5, -32.7, 13.0, -32.1]);
    // ---- tea point (east wall x 12.4..13.0, z -19.0..-15.8): counter, sink, mugs, poster (the kettle + cord are props)
    bb(12.42, 0, -19.0, 13.0, 0.86, -15.8, 0x9aa4b0); bb(12.36, 0.86, -19.04, 13.0, 0.9, -15.76, 0xe8ecf0);
    for (let z = -18.95; z < -15.8; z += 0.8) bb(12.4, 0.05, z, 12.42, 0.82, z + 0.76, 0xb8c0ca);
    bb(12.5, 0.84, -16.5, 12.9, 0.905, -15.9, 0xb8bec6); bb(12.55, 0.86, -16.45, 12.85, 0.906, -15.95, 0x5a6068);
    cyl(0.012, 0.012, 0.22, 6, STEEL, 12.92, 1.0, -16.2); bb(12.78, 1.09, -16.215, 12.93, 1.11, -16.185, STEEL);
    for (const [z, c] of [[-17.62, 0xc8323a], [-17.76, 0xe8e8ea], [-17.9, 0x1f6fe0], [-18.55, 0x2fb8a8]]) { cyl(0.04, 0.035, 0.09, 10, c, 12.6, 0.945, z); torus(0.025, 0.007, 4, 8, c, 12.6, 0.95, z + 0.045, 0, H); }
    bb(12.97, 1.2, -17.8, 12.99, 1.9, -17.0, 0xf4f8fc);
    sign(SIG.tea, 0.76, 0.095, 12.965, 1.8, -17.4, -H);
    bb(12.955, 1.36, -17.52, 12.968, 1.6, -17.28, 0x4a8ab8); bb(12.955, 1.43, -17.28, 12.968, 1.45, -17.18, 0x4a8ab8);   // one cup
    bb(12.955, 1.45, -17.2, 12.968, 1.53, -17.18, 0x4a8ab8); bb(12.955, 1.51, -17.28, 12.968, 1.53, -17.18, 0x4a8ab8); bb(12.955, 1.32, -17.58, 12.968, 1.345, -17.22, 0x4a8ab8);
    // ---- the maintenance hatch's shaft stub (above the ceiling opening) with rungs on its north wall
    tint = [0.5, 0.52, 0.56];
    bb(-12.35, 3.2, -17.15, -11.25, 6.8, -17.05, 0x0a0c10); bb(-12.35, 3.2, -16.15, -11.25, 6.8, -16.05, 0x0a0c10);
    bb(-12.35, 3.2, -17.15, -12.25, 6.8, -16.05, 0x0a0c10); bb(-11.35, 3.2, -17.15, -11.25, 6.8, -16.05, 0x0a0c10); bb(-12.35, 6.8, -17.15, -11.25, 6.9, -16.05, 0x050608);
    for (let y = 3.5; y < 6.6; y += 0.3) bb(-12.0, y, -17.05, -11.6, y + 0.03, -16.99, 0x3a4048);
    tint = T21;
    bb(-12.3, 3.15, -17.1, -11.3, 3.2, -16.1, 0x3a4656);   // the hatch frame
    // ---- the stair landing (core x 13.0..17.6, z -24..-16): concrete, sealed up-flight behind a padded shutter, down-flight
    tint = [0.72, 0.74, 0.78];
    const F = (x0, z0, x1, z1) => bb(x0, -0.02, z0, x1, 0.0, z1, CONC);
    F(13.0, -24.0, 17.6, -18.8); F(13.0, -18.8, 14.6, -16.0);
    wall(13.0, -24.2, 17.8, -24.0, 3.2, 0x4a5058); wall(17.4, -24.0, 17.8, -16.0, 3.2, 0x4a5058); wall(13.0, -16.0, 17.8, -15.8, 3.2, 0x4a5058);
    bb(13.0, 3.15, -24.0, 17.6, 3.2, -16.0, 0x2a2e34);
    for (let k = 0; k < 8; k++) bb(14.6, 0, -21.2 - 0.32 * (k + 1), 17.4, 0.17 * (k + 1), -21.2 - 0.32 * k, 0x4a4f56);
    for (let k = 0; k < 8; k++) bb(14.6, -0.17 * (k + 1) - 0.4, -18.8 + 0.32 * k, 17.4, -0.17 * (k + 1), -18.8 + 0.32 * (k + 1), 0x34383e);
    bb(14.6, -3.0, -18.8, 14.65, 0, -16.0, 0x2a2e34); bb(14.6, -3.0, -16.05, 17.4, 0, -16.0, 0x1a1c20); bb(14.6, -3.2, -18.8, 17.4, -3.0, -16.0, 0x0a0b0d);
    for (const x of [14.65, 16.0, 17.35]) bb(x - 0.025, 0, -18.85, x + 0.025, 1.0, -18.8, STEELD);
    bb(14.6, 0.97, -18.86, 17.4, 1.02, -18.79, STEEL); bb(14.62, 0.97, -18.8, 14.67, 1.02, -16.0, STEEL);
    for (const z of [-18.8, -17.4, -16.05]) bb(14.62, 0, z - 0.025, 14.67, 1.0, z + 0.025, STEELD);
    sign(SIG.sealed, 1.1, 0.1375, 16.0, 2.05, -21.035, 0, true);
    tint = T21;
    COL.push([14.6, -21.3, 17.4, -21.1], [14.6, -18.8, 17.4, -16.0], [12.4, -19.0, 13.0, -15.8]);
  }
  function sign2(x, y, z, sx) {   // a small "COOLING" placard over each valve (vc stripes)
    bb(x - 0.01, y - 0.09, z - 0.22, x + 0.01, y + 0.09, z + 0.22, 0xf4f8fc);
    bb(x + sx * 0.012 - 0.002, y - 0.03, z - 0.18, x + sx * 0.012 + 0.002, y + 0.03, z + 0.18, 0x2a6aa8);
  }
  function propsL21(g) {
    const P = (o) => (g.add(o), o);
    R.pa21 = P(paGrille('pa21', 11.0, 3.2, -21.0));
    // ---- the landing: the door into the server floor (hinged on the south jamb, opens west), the shutter's lock pad
    R.landing = P(new THREE.Group()); R.landing.name = 'landing21';
    R.landDoor = part('landing21_door', () => {
      bb(-0.05, 0, -1.18, 0.0, 2.23, -0.02, 0x6a7480); bb(-0.11, 0.95, -1.05, -0.05, 1.0, -0.15, STEEL); bb(0.0, 0.95, -1.05, 0.06, 1.0, -0.15, STEEL);
      bb(-0.052, 1.4, -0.85, 0.002, 1.9, -0.35, 0x8fb0c8);
    }, [13.08, 0, -19.4]);
    R.landing.add(R.landDoor);
    R.landCol = [13.0, -20.6, 13.1, -19.4]; COL.push(R.landCol);
    R.shutter = part('landing21_shutter', () => {
      bb(14.6, 0, -21.3, 17.4, 2.9, -21.1, 0xc8ccd2);
      for (let y = 0.2; y < 2.8; y += 0.34) bb(14.65, y, -21.1, 17.35, y + 0.28, -21.06, 0xd8dce2);
      bb(14.6, 2.9, -21.35, 17.4, 3.2, -21.05, 0x5a6068);
      bb(14.85, 1.05, -21.06, 15.15, 1.45, -21.03, 0xf4f8fc);
    }, null);
    R.landing.add(R.shutter);
    R.lockPad = new THREE.Mesh(LOCKGEO, droneLightMat('patrol')); R.lockPad.position.set(15.0, 1.25, -21.025); R.lockPad.name = 'landing21_lock';
    R.landing.add(R.lockPad);
    R.landing.userData = {
      door(u = 1) { R.ldTo = clamp01(+u); if (skipping()) R.ldU = R.ldTo; else if (R.ldTo > R.ldU) snd('creak', 0.4, 1.05, LAND_AT); },
      shutter: { pulse() { R.padT = 0.9; R.lockPad.material = droneLightMat('escort'); snd('sad_beep', 0.35, 1, PAD_AT); } },
      get u() { return R.ldU; },
    };
    // ---- the tea point: kettle (13.1 save) + the coiled spare kettle cord
    R.tea = P(new THREE.Group()); R.tea.name = 'tea_point';
    const k = PROPS.kettle(); k.name = 'tea_kettle'; k.position.set(12.7, 0.9, -17.2); k.rotation.y = -H; R.tea.add(k);
    R.cord = part('kettle_cord', () => {
      for (let i = 0; i < 4; i++) torus(0.07 - i * 0.004, 0.009, 4, 14, 0x1a1a1c, 0, 0.012 + i * 0.012, 0, H, 0);
      bb(0.06, 0.0, -0.03, 0.13, 0.04, 0.03, 0xe8e8ea); bb(-0.13, 0.0, -0.025, -0.07, 0.035, 0.025, 0x2a2a2e);
    }, [12.7, 0.9, -18.2], 0, { floor: false });
    R.tea.add(R.cord);
    R.tea.userData = { steam() { R.steamT = 1.8; }, get kettle_cord() { return R.cord; } };
    // ---- the jack: socket + tape label (static look), the kettle-cord adapter, Rue's brick phone on the floor
    R.jack = P(part('jack', () => {
      bb(-13.99, 0.4, -23.45, -13.955, 0.5, -23.35, 0xd8c8a4); bb(-13.956, 0.415, -23.43, -13.95, 0.485, -23.37, BEIGE);
      bb(-13.952, 0.44, -23.41, -13.948, 0.46, -23.39, 0x3a3020);
      quad(0.17, 0.085, M.jack, -13.975, 0.62, -23.4, H);
    }, null, 0, { floor: false }));
    R.adapter = part('jack_adapter', () => {
      bb(-13.95, 0.425, -23.43, -13.88, 0.475, -23.37, 0xe8e8ea); bb(-13.9, 0.43, -23.44, -13.86, 0.47, -23.36, 0x8a8a90);
      bb(-13.88, 0.44, -23.42, -13.84, 0.46, -23.38, 0xc87a2a); bb(-13.87, 0.445, -23.4, -13.83, 0.452, -23.37, 0xd8a040);
      bb(-13.86, 0.06, -23.41, -13.84, 0.45, -23.39, 0x1a1a1c);
    }, null, 0, { floor: false });
    R.jack.add(R.adapter);
    R.brick = new THREE.Group(); R.brick.name = 'jack_brick_phone';
    const bp = PROPS.brick_phone(); bp.name = 'jack_brick_body'; bp.rotation.x = -H; bp.position.set(0, 0.023, 0.1); R.brick.add(bp);
    const scr = new THREE.Mesh(SCRGEO, M.brickScr); scr.rotation.x = -H; scr.position.set(0, 0.0475, 0.1 - 0.165); scr.name = 'jack_brick_screen'; R.brick.add(scr);
    R.brick.position.set(-13.6, 0, -23.2); R.brick.rotation.y = 0.6; R.jack.add(R.brick);
    R.brickCord = part('jack_brick_cord', () => { bb(-13.86, 0.0, -23.41, -13.84, 0.02, -23.25, 0x1a1a1c); bb(-13.86, 0.0, -23.27, -13.66, 0.02, -23.25, 0x1a1a1c); }, null, 0, { floor: false });
    R.jack.add(R.brickCord);
    R.jack.userData = {
      state(s) { R.jackState = s === 'adapter' || s === 'phone' ? s : 'bare'; applyJack(); },
      screen(mode) { if (T.state.scr === mode) return; T.state.scr = mode; repaint(T.brickScr, (c) => paintBrickScr(c, mode)); },
      get current() { return R.jackState; },
    };
    applyJack();
    // ---- the valve wheels (steel, blue hub) + their held glow rings
    R.valves = P(new THREE.Group()); R.valves.name = 'valves'; R.wheels = []; R.vRings = [];
    for (const [px, sx, nm] of [[-13.5, 1, 'valve_wheel_w'], [12.5, -1, 'valve_wheel_e']]) {
      const w = part(nm, () => {
        torus(0.25, 0.028, 5, 18, STEEL, 0, 0, 0, 0, H); cyl(0.06, 0.06, 0.06, 10, 0x8fc8f0, 0, 0, 0, 0, H);
        for (let k = 0; k < 4; k++) { const g2 = new THREE.BoxGeometry(0.02, 0.48, 0.02); g2.rotateX(k * PI / 4); put(g2, 0xa8aeb6); }
        bb(-0.02, 0.2, -0.02, 0.02, 0.32, 0.02, 0xc8323a);
      }, [px, 1.15, -32.4], 0, { floor: false });
      R.valves.add(w); R.wheels.push(w);
      const ring = new THREE.Mesh(RINGGEO, droneLightMat('patrol')); ring.position.set(px + sx * 0.01, 1.15, -32.4); ring.rotation.y = H; ring.visible = false; ring.name = nm + '_held';
      R.valves.add(ring); R.vRings.push(ring);
    }
    R.valves.userData = {
      turn(i, u) { i = i ? 1 : 0; R.vTo[i] = clamp01(+u || 0); if (skipping()) R.vU[i] = R.vTo[i]; if (R.vTo[i] >= 1 && R.vAt[i] < 0) R.vAt[i] = R.t; valvesCheck(); },
      held(i, on = true) { R.vRings[i ? 1 : 0].visible = !!on; },
      reset() { R.vTo[0] = R.vTo[1] = R.vU[0] = R.vU[1] = 0; R.vAt[0] = R.vAt[1] = -1; R.vOpen = false; },
      get open() { return !!R.vOpen; }, get u() { return R.vU; },
    };
    // ---- the fog cards at the vents (IM 12, additive)
    const fg = new THREE.PlaneGeometry(1.4, 0.9); fg.translate(0, 0.45, 0);
    const fg2 = fg.clone(); fg2.rotateY(H); const fgm = mergeGeometries([fg, fg2]); fg.dispose(); fg2.dispose();
    R.fog = new THREE.InstancedMesh(fgm, FOGM, VENTS.length); R.fog.name = 'fog21'; R.fog.frustumCulled = false; R.fog.renderOrder = 3;
    R.fog.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    for (let i = 0; i < VENTS.length; i++) R.fog.setMatrixAt(i, ZERO);
    R.fog.userData = { roll(k = 1) { R.fogTo = clamp01(+k); if (skipping()) R.fogK = R.fogTo; }, get k() { return R.fogK; } };
    R.fog.userData.noReflect = true; R.noRef.push(R.fog);
    g.add(R.fog);
    // ---- the maintenance hatch: lid (hinged on its south edge, opens down), the lock lamp, the telescoping ladder
    R.hatch21 = P(new THREE.Group()); R.hatch21.name = 'hatch21';
    R.lid21 = part('hatch21_lid', () => { bb(-0.45, -0.04, -0.9, 0.45, 0.0, 0.0, 0x4a5666); bb(-0.38, -0.05, -0.8, 0.38, -0.04, -0.1, 0x3a4656); bb(-0.05, -0.08, -0.75, 0.05, -0.05, -0.6, STEEL); }, [-11.8, 3.2, -16.15], 0, { floor: false });
    R.hatch21.add(R.lid21);
    R.lock21 = new THREE.Mesh(LOCKGEO, droneLightMat('escort')); R.lock21.position.set(-11.8, 3.185, -17.2); R.lock21.rotation.x = H; R.lock21.name = 'hatch21_lock';
    R.hatch21.add(R.lock21);
    bb3(R.hatch21, 'hatch21_ladder_top', () => ladderModel(3.4), [-11.8, 3.2, -17.0]);
    R.ladder21 = part('hatch21_ladder', () => ladderModel(3.3), [-11.8, 3.2, -16.97], 0, { floor: false });
    R.hatch21.add(R.ladder21);
    R.hatch21.userData = {
      lock(c = 'red') { R.lock21c = c === 'green' ? 'green' : 'red'; R.lock21.material = droneLightMat(R.lock21c === 'green' ? 'green' : 'escort'); if (!skipping()) snd(R.lock21c === 'green' ? 'chime_ready' : 'sad_beep', 0.4, 1, HATCH_AT); },
      open(u = 1) { R.h21To = clamp01(+u); if (skipping()) R.h21U = R.h21To; else snd('clunk', 0.35, 0.8, HATCH_AT); },
      ladder(u = 1) { R.ldrTo = clamp01(+u); if (skipping()) R.ldrU = R.ldrTo; else snd('door_slide', 0.35, 1.3, HATCH_AT); },
      get u() { return R.h21U; }, get ladderU() { return R.ldrU; },
    };
    R.lock21.material = droneLightMat(R.lock21c === 'green' ? 'green' : 'escort');
  }
  function bb3(parent, name, fn, pos) { const p = part(name, fn, pos, 0, { floor: false }); parent.add(p); return p; }
  function ladderModel(len) {   // local: x -0.25..0.25, from y 0 up to len, in the plane z 0 (rungs toward +z)
    bb(-0.25, 0, -0.03, -0.21, len, 0.01, 0xa8aeb6); bb(0.21, 0, -0.03, 0.25, len, 0.01, 0xa8aeb6);
    for (let y = 0.25; y < len; y += 0.3) bb(-0.21, y, -0.02, 0.21, y + 0.03, 0.01, 0x8a929c);
    bb(-0.27, 0, -0.04, -0.19, 0.04, 0.03, 0x2a2c30); bb(0.19, 0, -0.04, 0.27, 0.04, 0.03, 0x2a2c30);
  }

  // ---------------------------------------------------------- L30: "The Hangar" (set x = VG x + 48)
  // racks: [x0, x1] (0.9 deep) running z -37..-13 with gaps; R0 / R5: single-faced along the south glass / north wall
  const RACKS30 = [
    { x0: 40.4, x1: 41.3, gaps: [[-34.6, -33.0], [-20.4, -18.8]] },
    { x0: 47.0, x1: 47.9, gaps: [[-35.2, -34.0], [-27.0, -25.4]] },
    { x0: 53.0, x1: 53.9, gaps: [[-35.0, -33.4], [-27.0, -25.4]] },
  ];
  const TIERS = [0.55, 1.35, 2.15], TIERS2 = [0.55, 1.35];
  function dockSlots() {   // the docked slot rule (spec §4): every 0.62 m from 0.31 in; skip crossings/bay ± 0.2; S1 keeps its spot
    const out = [];
    const inGap = (z, gaps) => { for (const [a, b2] of gaps) if (z > a - 0.2 && z < b2 + 0.2) return true; return false; };
    for (let r = 0; r < 3; r++) {
      const K = RACKS30[r];
      for (const face of [-1, 1]) for (let ti = 0; ti < 3; ti++) for (let z = -37 + 0.31; z < -13; z += 0.62) {
        if (inGap(z, K.gaps)) continue;
        if (r === 0 && face < 0 && ti >= 1 && Math.abs(z + 31.0) < 0.5) continue;      // speaker S1
        out.push({ x: face < 0 ? K.x0 - 0.12 : K.x1 + 0.12, y: TIERS[ti], z, ry: face * H, r, face });
      }
    }
    for (let ti = 0; ti < 2; ti++) for (let x = 33 + 0.31; x < 60.4; x += 0.62) {
      out.push({ x, y: TIERS2[ti], z: -12.6 - 0.12, ry: PI, r: 3, face: 0 });       // R0 (south glass), facing north
      out.push({ x, y: TIERS2[ti], z: -37.0 + 0.12, ry: 0, r: 4, face: 0 });        // R5 (north wall), facing south
    }
    return out;
  }
  function rackSeg(x0, x1, z0, z1, faces, tiers, h) {   // a docking rack segment along z (faces: -1 west, 1 east, 0 both)
    const len = z1 - z0, cz = (z0 + z1) / 2;
    bb(x0, 0, z0, x1, 0.1, z1, 0x2a3038);
    bb((x0 + x1) / 2 - 0.03, 0.1, z0, (x0 + x1) / 2 + 0.03, h - 0.1, z1, 0x1a1f26);
    for (const x of [x0, x1 - 0.06]) {
      for (let z = z0; z <= z1 + 0.01; z += 1.24) bb(x, 0, Math.min(z, z1 - 0.06), x + 0.06, h, Math.min(z, z1 - 0.06) + 0.06, RACK30);
      bb(x, h - 0.08, z0, x + 0.06, h, z1, RACK30);
      for (const y of tiers) bb(x, y - 0.32, z0, x + 0.06, y - 0.27, z1, 0x2e353e);
    }
    for (const y of tiers) bb(x0 + 0.06, y - 0.3, z0, x1 - 0.06, y - 0.28, z1, 0x262c34);
    for (const y of tiers) {
      if (faces <= 0) tquad(len, 0.12, M.cradle, x0 - 0.005, y - 0.24, cz, -H, 0, [0.62, 0.12], 0xffffff, (z0 + 37) / 0.62);
      if (faces >= 0) tquad(len, 0.12, M.cradle, x1 + 0.005, y - 0.24, cz, H, 0, [0.62, 0.12], 0xffffff, (-z1 - 37) / 0.62);
    }
    for (let z = z0 + 0.62; z < z1; z += 1.24) { bb(x0 - 0.012, h - 0.12, z - 0.015, x0, h - 0.09, z + 0.015, 0x6fc8ff, M.glow); bb(x1, h - 0.12, z - 0.015, x1 + 0.012, h - 0.09, z + 0.015, 0x6fc8ff, M.glow); }
  }
  function rackRowX(x0, x1, zf, dir, tiers, h) {   // a single-faced docking rack along x (R0 / R5); dir = facing (+1 south, -1 north)
    const zb = zf - dir * 0.8, za = Math.min(zf, zb), zc = Math.max(zf, zb), len = x1 - x0, cx = (x0 + x1) / 2;
    bb(x0, 0, za, x1, 0.1, zc, 0x2a3038); bb(x0, 0.1, dir > 0 ? za : zc - 0.05, x1, h, dir > 0 ? za + 0.05 : zc, 0x1a1f26);
    for (let x = x0; x <= x1 + 0.01; x += 1.24) bb(Math.min(x, x1 - 0.06), 0, dir > 0 ? zf - 0.06 : zf, Math.min(x, x1 - 0.06) + 0.06, h, dir > 0 ? zf : zf + 0.06, RACK30);
    bb(x0, h - 0.08, za, x1, h, zc, RACK30);
    for (const y of tiers) {
      bb(x0, y - 0.32, dir > 0 ? zf - 0.06 : zf, x1, y - 0.27, dir > 0 ? zf : zf + 0.06, 0x2e353e);
      if (dir > 0) tquad(len, 0.12, M.cradle, cx, y - 0.24, zf + 0.005, 0, 0, [0.62, 0.12], 0xffffff, (x0 - 33) / 0.62);
      else tquad(len, 0.12, M.cradle, cx, y - 0.24, zf - 0.005, PI, 0, [0.62, 0.12], 0xffffff, (33 - x1) / 0.62);
    }
    for (let x = x0 + 0.62; x < x1; x += 1.24) bb(x - 0.015, h - 0.12, dir > 0 ? zf : zf - 0.012, x + 0.015, h - 0.09, dir > 0 ? zf + 0.012 : zf, 0x6fc8ff, M.glow);
  }
  function buildL30(g) {
    tint = T30; seed = 30;
    // ---- shell (h 3.9): west wall, north wall (behind R5), east wall with the private lift opening
    wall(32.8, -37.2, 33.0, -12.8, 3.9, WALL30); bb(32.8, 0, -37.8, 33.0, 3.9, -11.0, WALL30);
    bb(33.0, 0, -37.9, 60.6, 3.9, -37.6, WALL30);
    wall(60.4, -37.2, 60.6, -21.5, 3.9, WALL30); wall(60.4, -19.9, 60.6, -12.8, 3.9, WALL30); bb(60.4, 2.45, -21.5, 60.6, 3.9, -19.9, WALL30);
    bb(60.4, 0, -12.8, 60.6, 3.9, -11.0, WALL30);
    // the lift wall: black glass surround, chrome frame, MANAGER ONLY
    bb(60.36, 0, -23.0, 60.4, 3.1, -18.4, 0x0c0e12);
    bb(60.33, 0, -21.62, 60.37, 2.52, -21.5, 0xc8ccd2); bb(60.33, 0, -19.9, 60.37, 2.52, -19.78, 0xc8ccd2); bb(60.33, 2.45, -21.62, 60.37, 2.52, -19.78, 0xc8ccd2);
    sign(SIG.manager, 1.2, 0.15, 60.355, 2.75, -20.7, -H, true);
    // ---- ceiling (3.9): dark deck, E–W steel beams, N–S girders over the racks, tiny blue status lights, dim strips
    quad(27.6, 26.9, M.vc, 46.8, 3.9, -24.45, 0, H, 0x161b22);
    for (let z = -36.0; z <= -12.0; z += 3.0) { bb(33.0, 3.74, z - 0.08, 60.4, 3.9, z + 0.08, BEAM); bb(33.0, 3.72, z - 0.15, 60.4, 3.745, z + 0.15, 0x2a3038); for (let x = 34.5; x < 60; x += 2.0) bb(x - 0.02, 3.70, z - 0.02, x + 0.02, 3.72, z + 0.02, 0x6fc8ff, M.glow); }
    for (const x of [40.85, 47.45, 53.45]) bb(x - 0.12, 3.62, -37.6, x + 0.12, 3.9, -11.8, BEAM);
    for (const x of [36.7, 44.15, 50.45, 57.15]) ledStrip(x, -36.5, x, -13.5, 3.72, 0x8fb8e8, 0.08);
    for (const x of [40.85, 47.45, 53.45]) { bb(x - 0.2, 2.95, -37.0, x + 0.2, 3.0, -13.0, 0x4a5868); bb(x - 0.18, 3.0, -37.0, x + 0.18, 3.05, -13.0, 0x1a2a3a); }
    // ---- floor: dashed lane lines down L1 / L2, the M1 rail, the hatch rim + its shaft below
    for (const x of [44.15, 50.45]) for (let z = -36.6; z < -13.4; z += 1.8) bb(x - 0.04, 0, z, x + 0.04, 0.005, Math.min(z + 1.0, -13.4), 0xd8e0e8);
    for (const z of [-34.85, -34.35]) bb(44.7, 0, z - 0.03, 51.95, 0.025, z + 0.03, 0x8a929c);
    bb(44.55, 0, -34.95, 44.7, 0.06, -34.25, 0x5a6068); bb(51.95, 0, -34.95, 52.1, 0.06, -34.25, 0x5a6068);
    bb(35.7, 0, -17.1, 36.7, 0.015, -17.05, STEELD); bb(35.7, 0, -16.15, 36.7, 0.015, -16.1, STEELD); bb(35.7, 0, -17.05, 35.75, 0.015, -16.15, STEELD); bb(36.65, 0, -17.05, 36.7, 0.015, -16.15, STEELD);
    for (const z of [-17.15, -16.0]) bb(35.6, 0, z - 0.04, 36.8, 0.006, z + 0.04, 0xb8bec6);
    tint = [0.45, 0.47, 0.5];
    bb(35.65, -3.2, -17.15, 36.75, 0, -17.05, 0x16181c); bb(35.65, -3.2, -16.15, 36.75, 0, -16.05, 0x16181c);
    bb(35.65, -3.2, -17.05, 35.75, 0, -16.15, 0x16181c); bb(36.65, -3.2, -17.05, 36.75, 0, -16.15, 0x16181c); bb(35.75, -3.3, -17.05, 36.65, -3.2, -16.15, 0x050608);
    for (let y = -3.0; y < -0.1; y += 0.3) bb(35.95, y, -17.05, 36.45, y + 0.03, -16.99, 0x5a6068);
    tint = T30;
    // ---- docking racks R1..R3 (both faces, 3 tiers), R0 along the south glass, R5 along the north wall (2 tiers)
    for (const K of RACKS30) {
      let z = -37.0;
      for (const [a, b2] of K.gaps) { rackSeg(K.x0, K.x1, z, a, 0, TIERS, 2.9); z = b2; }
      rackSeg(K.x0, K.x1, z, -13.0, 0, TIERS, 2.9);
    }
    rackRowX(33.0, 60.4, -12.6, -1, TIERS2, 1.9);
    rackRowX(33.0, 60.4, -37.0, 1, TIERS2, 1.9);
    COL.push([33.0, -37.6, 60.6, -37.0], [33.0, -13.0, 60.6, -12.6],
      [40.4, -37.0, 41.3, -34.6], [40.4, -33.0, 41.3, -20.4], [40.4, -18.8, 41.3, -13.0],
      [47.0, -37.0, 47.9, -35.2], [47.0, -34.0, 47.9, -27.0], [47.0, -25.4, 47.9, -13.0],
      [53.0, -37.0, 53.9, -35.0], [53.0, -33.4, 53.9, -27.0], [53.0, -25.4, 53.9, -13.0]);
    // ---- the south glass (z -11.0) with mullions
    for (let x = 33.0; x <= 60.4; x += 3.04) bb(x - 0.06, 0, -11.06, x + 0.06, 3.9, -10.94, 0x1a1e24);
    bb(33.0, 0, -11.1, 60.4, 0.15, -10.9, 0x1a1e24); bb(33.0, 3.75, -11.1, 60.4, 3.9, -10.9, 0x1a1e24); bb(33.0, 2.1, -11.04, 60.4, 2.16, -10.96, 0x1a1e24);
    quad(27.4, 3.9, GLASSM, 46.7, 1.95, -11.0, PI);
    // ---- the private lift car (x 60.6..62.8, z -21.8..-19.6): black mirror walls, warm strip (prop), ROOF button (prop)
    bb(60.6, -0.02, -21.8, 62.8, 0.0, -19.6, 0x141618);
    wall(60.6, -22.0, 62.8, -21.8, 3.9, 0x0a0c10); wall(62.8, -22.0, 63.0, -19.4, 3.9, 0x0a0c10); wall(60.6, -19.6, 62.8, -19.4, 3.9, 0x0a0c10);
    bb(60.6, 2.6, -21.8, 62.8, 2.7, -19.6, 0x1a1c20);
    for (const [x0, z0, x1, z1] of [[60.8, -21.79, 62.6, -21.78], [62.79, -21.6, 62.8, -19.8], [60.8, -19.62, 62.6, -19.61]]) bb(x0, 0.15, z0, x1, 2.45, z1, 0x2a2e36);
    bb(61.0, 0.9, -21.78, 62.6, 0.94, -21.74, 0xc8ccd2); bb(62.76, 0.9, -21.6, 62.8, 0.94, -19.8, 0xc8ccd2); bb(61.0, 0.9, -19.66, 62.6, 0.94, -19.62, 0xc8ccd2);
    bb(62.1, 0.95, -21.795, 62.34, 1.45, -21.77, 0x8a929c);
    lab(LAB.roof, 0.2, 0.025, 62.22, 1.36, -21.765, 0);
  }
  function propsL30(g) {
    const P = (o) => (g.add(o), o);
    R.pa30 = P(paGrille('pa30', 37.0, 3.9, -18.4));
    // ---- the docked fleet: ~750 pods (2 IM: shell + light), 12 awake ones that stir
    const slots = dockSlots(); R.slots = slots;
    R.docked = DRONE_INSTANCED.make(800, { state: 'patrol' });
    R.docked.group.name = 'docked'; R.docked.body.name = 'docked_shells'; R.docked.light.name = 'docked_lights';
    R.dockN = slots.length; R.dockBase = new Float32Array(slots.length * 3); seed = 790;
    for (let i = 0; i < slots.length; i++) {
      const s = slots[i]; R.docked.set(i, s.x, s.y, s.z, s.ry, 1);
      const k = 0.7 + rnd() * 0.2; tc.set(0x8fd8ff).multiplyScalar(k); R.docked.glow(i, tc.getHex());
      R.dockBase[i * 3] = tc.r; R.dockBase[i * 3 + 1] = tc.g; R.dockBase[i * 3 + 2] = tc.b;
    }
    R.docked.commit(); R.docked.body.count = R.docked.light.count = slots.length;
    R.docked.body.instanceMatrix.setUsage(THREE.DynamicDrawUsage); R.docked.light.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    // awake: 12 slots that line lanes L1 / L2 / band C in the middle of the floor (seen from l30_l1_s, l30_l2_s, l30_c_s)
    R.awake = []; const want = [[0, 1, -27.2], [0, 1, -22.4], [1, -1, -30.4], [1, -1, -23.8], [1, -1, -17.0], [1, 1, -29.6], [1, 1, -21.0], [2, -1, -31.0], [2, -1, -22.0], [2, 1, -29.0], [2, 1, -23.5], [2, 1, -16.6]];
    for (const [r, f, z] of want) {
      let best = -1, bd = 1e9;
      for (let i = 0; i < slots.length; i++) { const s = slots[i]; if (s.r !== r || s.face !== f || s.y !== TIERS[1]) continue; const d = Math.abs(s.z - z); if (d < bd && R.awake.indexOf(i) < 0) { bd = d; best = i; } }
      if (best >= 0) R.awake.push(best);
    }
    R.awakeOn = R.awakeOn || R.awake.map(() => true);
    R.docked.group.userData = {
      wake(i, on = true) { if (i >= 0 && i < R.awake.length) R.awakeOn[i] = !!on; },
      tint(name, k = 1) { R.dockTint = name in TINTS ? name : 'patrol'; R.dockTo = clamp01(+k); if (skipping()) R.dockK = R.dockTo; },
      get awake() { return R.awake; }, count: slots.length,
    };
    g.add(R.docked.group);
    // ---- M1: the mobile charging rack on its rail (+24 docked pods, child IMs)
    R.m1 = P(part('m1', () => {
      bb(-1.3, 0.03, -0.45, 1.3, 0.16, 0.45, 0x3a4048);
      for (const sx of [-1, 1]) for (const z of [-0.25, 0.25]) cyl(0.07, 0.07, 0.06, 8, 0x1a1c20, sx * 1.05, 0.07, z, H, 0);
      for (const x of [-1.27, -0.62, 0, 0.62, 1.21]) for (const z of [-0.45, 0.39]) bb(x, 0.16, z, x + 0.06, 2.9, z + 0.06, RACK30);
      bb(-1.3, 2.82, -0.45, 1.3, 2.9, 0.45, RACK30); bb(-1.3, 0.16, -0.03, 1.3, 2.82, 0.03, 0x1a1f26);
      for (const y of TIERS) for (const sz of [-1, 1]) { bb(-1.3, y - 0.32, sz > 0 ? 0.39 : -0.45, 1.3, y - 0.27, sz > 0 ? 0.45 : -0.39, 0x2e353e); tquad(2.6, 0.12, M.cradle, 0, y - 0.24, sz * 0.455, sz > 0 ? 0 : PI, 0, [0.62, 0.12], 0xffffff, 0.5 - 2.1 / 0.62); }
      bb(-1.42, 0.95, -0.4, -1.36, 1.02, 0.4, STEEL); for (const z of [-0.36, 0.36]) bb(-1.36, 0.97, z - 0.02, -1.3, 1.0, z + 0.02, STEEL);
      bb(-0.3, 2.9, -0.06, 0.3, 2.98, 0.06, 0x2a3038); bb(-0.08, 2.98, -0.04, 0.08, 3.02, 0.04, 0xffb040, M.glow);
      for (let x = -0.93; x <= 0.94; x += 0.62) for (const sz of [-1, 1]) bb(x - 0.015, 2.78, sz * 0.46 - 0.006, x + 0.015, 2.81, sz * 0.46 + 0.006, 0x6fc8ff, M.glow);
    }, [46.2, 0, -34.6]));
    const md = DRONE_INSTANCED.make(24, { state: 'patrol' }); md.body.name = 'm1_shells'; md.light.name = 'm1_lights';
    let n = 0;
    for (const sz of [-1, 1]) for (const y of TIERS) for (const x of [-0.93, -0.31, 0.31, 0.93]) { md.set(n, x, y, sz * 0.57, sz < 0 ? PI : 0, 1); tc.set(0x8fd8ff).multiplyScalar(0.75 + (n % 3) * 0.06); md.glow(n, tc.getHex()); n++; }
    md.commit(); R.m1.add(md.group); R.m1d = md;
    R.m1Col = [44.9, -35.05, 47.5, -34.15]; COL.push(R.m1Col);
    R.m1.userData = {
      push(u) { R.m1To = Math.max(R.m1To, clamp01(+u || 0)); if (R.m1To >= 1) R.m1Done = true; if (skipping()) R.m1U = R.m1To; },
      reset() { R.m1To = R.m1U = 0; R.m1Done = false; },
      get done() { return !!R.m1Done; }, get u() { return R.m1U; }, get x() { return 46.2 + 4.25 * smooth(R.m1U); },
    };
    // ---- the arrival floor hatch: lid hinged on its west edge, fold-up grab rails
    R.hatch30 = P(new THREE.Group()); R.hatch30.name = 'hatch30';
    R.lid30 = part('hatch30_lid', () => {
      bb(0.0, 0.0, -0.45, 0.9, 0.035, 0.45, 0x4a525c); bb(0.08, 0.035, -0.37, 0.82, 0.04, 0.37, 0x3a424c);
      bb(0.72, 0.04, -0.12, 0.8, 0.07, 0.12, STEEL); for (let k = 0; k < 6; k++) bb(0.1 + k * 0.12, 0.04, -0.36, 0.14 + k * 0.12, 0.045, 0.36, 0x5a626c);
    }, [35.75, 0, -16.6], 0, { floor: false });
    R.hatch30.add(R.lid30);
    R.rails30 = part('hatch30_rails', () => {
      for (const z of [-17.15, -16.05]) { bb(35.8, 0, z - 0.02, 35.84, 1.0, z + 0.02, STEEL); bb(36.56, 0, z - 0.02, 36.6, 1.0, z + 0.02, STEEL); bb(35.8, 0.96, z - 0.02, 36.6, 1.0, z + 0.02, STEEL); }
    }, null, 0, { floor: false });
    R.hatch30.add(R.rails30);
    R.h30Col = [1e4, 1e4, 1e4, 1e4]; COL.push(R.h30Col);
    R.hatch30.userData = { open(u = 1) { R.h30To = clamp01(+u); if (skipping()) R.h30U = R.h30To; else snd('clunk', 0.4, 0.75, H30_AT); }, get u() { return R.h30U; } };
    // ---- lure points: speaker S1 (R1's west face), dropped phones P1 / P2 (screens dark until played)
    R.s1 = P(part('s1', () => {
      bb(-0.08, -0.26, -0.22, 0.08, 0.26, 0.22, 0x2a2e34); bb(-0.1, -0.24, -0.2, -0.08, 0.24, 0.2, 0x1a1c20);
      bb(-0.1, -0.2, 0.12, -0.085, -0.12, 0.18, 0x5a6068); cyl(0.012, 0.012, 0.02, 6, 0x0a0a0a, -0.1, -0.16, 0.15, 0, H);
    }, [40.32, 1.5, -31.0], 0, { floor: false }));
    R.s1cone = part('s1_cone', () => { cyl(0.13, 0.15, 0.03, 14, 0x15171a, 0, 0, 0, 0, H); cyl(0.04, 0.04, 0.035, 8, 0x3a3e44, -0.01, 0, 0, 0, H); }, [-0.105, 0.04, 0], 0, { floor: false });
    R.s1.add(R.s1cone);
    R.s1led = new THREE.Mesh(LOCKGEO, droneLightMat('patrol')); R.s1led.scale.set(0.3, 0.3, 1); R.s1led.position.set(-0.102, 0.2, 0.15); R.s1led.rotation.y = -H; R.s1led.visible = false; R.s1.add(R.s1led);
    R.s1.userData = { play(on = true) { R.lure[0] = !!on; R.s1led.visible = !!on; } };
    R.phonesP = [];
    for (const [nm, x, z, ry] of [['p1', 45.4, -15.6, 0.7], ['p2', 55.0, -22.0, -0.4]]) {
      const p = P(part(nm, () => { bb(-0.038, 0, -0.076, 0.038, 0.009, 0.076, 0x1a1d22); bb(-0.034, 0.009, -0.07, 0.034, 0.0095, 0.07, 0x0a0c10); }, [x, 0.0, z], ry, { floor: false }));
      const scr = new THREE.Mesh(PHONEGEO, PHONEM); scr.rotation.x = -H; scr.position.y = 0.0105; scr.visible = false; scr.name = nm + '_screen'; p.add(scr);
      const i = R.phonesP.length; R.phonesP.push(scr);
      p.userData = { play(on = true) { R.lure[i + 1] = !!on; scr.visible = !!on; } };
    }
    // ---- the private lift: doors (two black leaves), reader (red / green), the SafeSense side panel, the car
    R.lift30 = P(new THREE.Group()); R.lift30.name = 'lift30';
    R.liftN = part('lift30_door_n', () => { bb(60.43, 0, -21.5, 60.53, 2.45, -20.71, 0x121418); bb(60.42, 0, -20.75, 60.43, 2.45, -20.71, 0xc8ccd2); }, null, 0);
    R.liftS = part('lift30_door_s', () => { bb(60.43, 0, -20.69, 60.53, 2.45, -19.9, 0x121418); bb(60.42, 0, -20.69, 60.43, 2.45, -20.65, 0xc8ccd2); }, null, 0);
    R.lift30.add(R.liftN, R.liftS);
    R.lift30.add(part('lift30_screens', () => {
      bb(60.33, 1.11, -19.42, 60.36, 1.29, -19.28, 0x2a2e34); quad(0.08, 0.12, M.reader, 60.325, 1.2, -19.35, -H);
      bb(60.33, 1.23, -22.69, 60.36, 1.67, -22.11, 0x2a2e34); quad(0.5, 0.375, M.side, 60.325, 1.45, -22.4, -H);
    }, null, 0, { floor: false }));
    R.carLight = part('lift30_car_light', () => {
      for (const [x0, z0, x1, z1] of [[60.7, -21.75, 62.7, -21.68], [62.68, -21.7, 62.75, -19.7], [60.7, -19.72, 62.7, -19.65]]) bb(x0, 2.52, z0, x1, 2.58, z1, 0xffe8c8, M.glow);
      quad(1.6, 1.4, M.glow, 61.7, 2.598, -20.7, 0, H, 0x5a4a38);
    }, null, 0, { floor: false });
    R.lift30.add(R.carLight);
    R.carBtn = new THREE.Mesh(BTNGEO, droneLightMat('white')); R.carBtn.position.set(62.22, 1.2, -21.765); R.carBtn.name = 'lift30_roof_button'; R.lift30.add(R.carBtn);
    R.carBtnOff = new THREE.Mesh(BTNGEO, mat(0x8a929c)); R.carBtnOff.position.copy(R.carBtn.position); R.carBtnOff.position.z -= 0.002; R.lift30.add(R.carBtnOff);
    R.l30Col = [60.4, -21.5, 60.5, -19.9]; COL.push(R.l30Col);
    R.lift30.userData = {
      doors(u = 1) { R.l30To = clamp01(+u); if (skipping()) R.l30U = R.l30To; else if (R.l30To !== R.l30U) snd('door_slide', 0.5, 1.1, L30_AT); },
      reader(c = 'red') { const m = c === 'green' ? 'green' : c === 'off' ? 'off' : 'red'; if (T.state.reader !== m) { T.state.reader = m; repaint(T.reader, (x) => paintReader(x, m)); } },
      beep() { snd(T.state.reader === 'green' ? 'key_beep' : 'sad_beep', 0.45, 1, READER_AT); },
      panel(mode = 'booking') { const m = mode === 'recognised' ? 'recognised' : 'booking'; if (T.state.side !== m) { T.state.side = m; repaint(T.side, (x) => paintSide(x, m)); } },
      car: { light(on = true) { R.carLightOn = !!on; R.carLight.visible = !!on; }, button(on = true) { R.carBtnOn = !!on; R.carBtn.visible = !!on; } },
      get u() { return R.l30U; },
    };
    R.carBtn.visible = !!R.carBtnOn;
    // ---- the storm outside: a near-flat strip beyond the glass (fog-free), lightning flashes
    R.sky = P(new THREE.Group()); R.sky.name = 'sky30';
    { const N = 12, pos = [], uv = [], idx = [];
      for (let i = 0; i <= N; i++) { const a = -0.33 + 0.66 * i / N, x = 48 + 95 * Math.sin(a), z = -100 + 95 * Math.cos(a);
        pos.push(x, -14, z, x, 12, z); uv.push(i / N, 0, i / N, 1); if (i < N) { const k = i * 2; idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3); } }
      const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); sg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); sg.setIndex(idx);
      const sm = new THREE.Mesh(sg, SKYM); sm.renderOrder = -2; sm.name = 'sky30_strip'; R.sky.add(sm); }
    R.sky.userData = { flash(k = 1) { R.flash = Math.max(R.flash, clamp01(+k)); R.flashT = 0; } };
  }

  // ---------------------------------------------------------- cleaning drones (IM: disc body + underglow), paths
  const PATHS = {
    clean_l12: [[[-56, -39.8], [-50, -39.8], [-50, -37.0], [-56, -37.0]], [[-60, -35.2], [-40, -35.2]], [[-60, -26], [-37, -26], [-37, -16.4], [-60, -16.4]],
      [[-58, -23], [-48, -20], [-40, -23]], [[-59, -17], [-49, -17]]],
    clean_l21: [[[-9.5, -34.55], [7.5, -34.55]], [[-9.5, -32.65], [7.5, -32.65]], [[-9.5, -28.65], [7.5, -28.65]],
      [[-9.5, -26.55], [7.5, -26.55]], [[-9.5, -24.65], [7.5, -24.65]], [[-9.5, -22.55], [7.5, -22.55]]],
    clean_l30: [[[34, -36], [39.5, -36], [39.5, -14], [34, -14]], [[42, -36], [46, -14]], [[48.5, -30], [52.5, -14]], [[54.5, -36], [59.5, -36], [59.5, -24], [54.5, -24]],
      [[35, -20], [39, -28]], [[55, -16], [59, -18]]],
    d21_a0: [[-8.5, -35.6], [6.5, -35.6]], d21_a2: [[-9.0, -27.6], [6.8, -27.6]],
    d30a: [[38.6, -31.0], [38.6, -15.4]], d30b: [[44.2, -36.2], [44.2, -14.0]], d30d: [[56.8, -33.0], [56.8, -16.0]],
    old_trail: [[12.2, -20.0], [10.5, -20.0], [10.5, -27.6], [-4.7, -27.6], [-4.7, -31.6], [-12.0, -31.6], [-12.0, -23.4], [-13.6, -23.4]],
    lane_bots: [[-63.3, -40.0], [-63.3, -16.0]],
  };
  const RFACES = [-34.2, -33.0, -30.2, -29.0, -26.2, -25.0, -22.2];
  const CLEAN = [];
  for (const [f, key] of [['l12', 'clean_l12'], ['l21', 'clean_l21'], ['l30', 'clean_l30']]) {
    PATHS[key].forEach((pts, p) => {
      const n = pts.length, loop = n >= 3, cum = new Float32Array(loop ? n + 1 : n);
      let L = 0; cum[0] = 0;
      for (let i = 1; i < cum.length; i++) { const a = pts[i - 1], c = pts[i % n]; L += Math.hypot(c[0] - a[0], c[1] - a[1]); cum[i] = L; }
      let face = 0;
      if (f === 'l21') { let bd = 9; for (const fz of RFACES) { const d = Math.abs(fz - pts[0][1]); if (d < bd) { bd = d; face = fz > pts[0][1] ? 1 : -1; } } }
      CLEAN.push({ f, pts, cum, n, loop, L, s: p * 3.7, v: 0.25 + ((p * 37) % 26) / 100, y: f === 'l21' ? 1.25 + (p % 3) * 0.25 : 0.1, face, spin: p });
    });
  }
  function pathAt(c, s, out) {   // position along a cleaner's path (loop or ping-pong) -> out {x, z, dx, dz}
    let u;
    if (c.loop) u = ((s % c.L) + c.L) % c.L;
    else { const w = ((s % (2 * c.L)) + 2 * c.L) % (2 * c.L); u = w > c.L ? 2 * c.L - w : w; }
    let i = 1; while (i < c.cum.length - 1 && c.cum[i] < u) i++;
    const a = c.pts[i - 1], e = c.pts[i % c.n], seg = c.cum[i] - c.cum[i - 1] || 1, k = (u - c.cum[i - 1]) / seg;
    out.x = a[0] + (e[0] - a[0]) * k; out.z = a[1] + (e[1] - a[1]) * k; out.dx = e[0] - a[0]; out.dz = e[1] - a[1];
    return out;
  }
  const PP = { x: 0, z: 0, dx: 0, dz: 0 };
  function buildCleaners(root) {
    const bgeo = geoOf(() => {
      cyl(0.24, 0.26, 0.05, 16, 0xc3cad3, 0, -0.025, 0); cyl(0.22, 0.24, 0.05, 16, SHELL, 0, 0.025, 0);
      cyl(0.12, 0.2, 0.03, 16, 0xf4f6f8, 0, 0.065, 0); cyl(0.18, 0.2, 0.02, 16, 0x3a3e44, 0, -0.06, 0);
      bb(-0.04, 0.0, 0.2, 0.04, 0.035, 0.245, 0x1a2028);
    });
    const lgeo = new THREE.TorusGeometry(0.25, 0.014, 4, 20); lgeo.rotateX(H); lgeo.translate(0, -0.035, 0);
    const eye = new THREE.BoxGeometry(0.06, 0.012, 0.01); eye.translate(0, 0.02, 0.248);
    const lg = mergeGeometries([lgeo.toNonIndexed(), eye.toNonIndexed()]); lgeo.dispose(); eye.dispose();
    R.cBody = new THREE.InstancedMesh(bgeo, M.vc, CLEAN.length); R.cGlow = new THREE.InstancedMesh(lg, DRONE_INSTANCED.lightMat, CLEAN.length);
    R.cBody.name = 'cleaners'; R.cGlow.name = 'cleaners_glow';
    for (const im of [R.cBody, R.cGlow]) { im.frustumCulled = false; im.instanceMatrix.setUsage(THREE.DynamicDrawUsage); }
    for (let i = 0; i < CLEAN.length; i++) { R.cBody.setMatrixAt(i, ZERO); R.cGlow.setMatrixAt(i, ZERO); R.cGlow.setColorAt(i, tc.set(UNDER)); }
    R.cBody.add(R.cGlow); root.add(R.cBody);
    R.cBody.userData = { paths: PATHS, count: CLEAN.length };
  }
  function cleanTick(dt, t) {
    if (!R.cBody) return;
    for (let i = 0; i < CLEAN.length; i++) {
      const c = CLEAN[i];
      if (c.f !== R.state) continue;
      c.s += c.v * dt;
      pathAt(c, c.s, PP);
      if (c.f === 'l21') {
        const bob = 0.05 * Math.sin(t * 1.3 + i);
        ev.set(c.face > 0 ? -H : H, t * (1.6 + 0.2 * c.spin), 0, 'XYZ');
        pv.set(PP.x, c.y + bob, PP.z + c.face * 0.12);
      } else {
        ev.set(0, Math.atan2(PP.dx, PP.dz) + 0.25 * Math.sin(t * 0.7 + i), 0, 'XYZ');
        pv.set(PP.x, c.y + 0.015 * Math.sin(t * 2.1 + i), PP.z);
      }
      qv.setFromEuler(ev); m5.compose(pv, qv, sv.set(1, 1, 1));
      R.cBody.setMatrixAt(i, m5); R.cGlow.setMatrixAt(i, m5);
      tc.set(UNDER).multiplyScalar(0.65 + 0.35 * Math.sin(t * 1.4 + i * 0.9)); R.cGlow.setColorAt(i, tc);
    }
    R.cBody.instanceMatrix.needsUpdate = true; R.cGlow.instanceMatrix.needsUpdate = true; R.cGlow.instanceColor.needsUpdate = true;
  }
  function hideCleaners() {
    if (!R.cBody) return;
    for (let i = 0; i < CLEAN.length; i++) if (CLEAN[i].f !== R.state) { R.cBody.setMatrixAt(i, ZERO); R.cGlow.setMatrixAt(i, ZERO); }
    R.cBody.instanceMatrix.needsUpdate = true; R.cGlow.instanceMatrix.needsUpdate = true;
  }

  // ---------------------------------------------------------- sounds, places, small state helpers
  const SO = { vol: 1, rate: 1, at: null };
  const LIFT_AT = [-53.0, 1.2, -40.7], BANK_AT = [-50.0, 1.5, -30.5], STAIR_AT = [-35.1, 1.2, -20.0], LAND_AT = [13.1, 1.2, -20.0],
    PAD_AT = [15.0, 1.25, -21.0], HATCH_AT = [-11.8, 3.0, -16.6], H30_AT = [36.2, 0.2, -16.6], L30_AT = [60.4, 1.2, -20.7],
    READER_AT = [60.38, 1.2, -19.35], BIN_AT = [-35.5, 0.5, -20.0], M1_AT = [46.2, 1.0, -34.6], SKY_AT = [48.0, 3.0, -8.0], STEAM_AT = [12.6, 1.18, -17.2];
  const STEAM = { n: 3, color: 0xf2f4f6, speed: 0.22, life: 1.4, gravity: -0.6 };
  function snd(name, vol, rate, atp) {
    if (!isCur() || skipping() || typeof sfx !== 'function') return;
    SO.vol = vol; SO.rate = rate; SO.at = atp; sfx(name, SO);
  }
  const approach = (v, to, step) => (Math.abs(to - v) <= step ? to : v + Math.sign(to - v) * step);
  const TINTS = { patrol: 0x8fd8ff, amber: 0xffb040, escort: 0xff4040, white: 0xe8f6ff, off: 0x202428, yes: 0xffd21f };
  function defaults() {   // runtime state survives rebuilds (puzzle progress lives on the prop APIs)
    const D = { liftU: 0, liftTo: 0, bankK: 0, bankTo: 0, jigT: -1, ctrlK: 0, binU: 0, binTo: 0, binDone: false, sdU: 0, sdTo: 0, taken: false,
      ldU: 0, ldTo: 0, padT: 0, steamT: 0, puffT: 0, jackState: 'bare', fogK: 0, fogTo: 0, h21U: 0, h21To: 0, ldrU: 0, ldrTo: 0, lock21c: 'red', vOpen: false,
      m1U: 0, m1To: 0, m1Done: false, h30U: 0, h30To: 0, l30U: 0, l30To: 0, dockTint: 'patrol', dockK: 0, dockTo: 0, dockShown: -1, flash: 0, flashT: 9,
      skyT: 12, thunderT: -1, carBtnOn: false, paLevel: 0, paLevelT: -9, t: 0, lastT: -1, squeakT: 0, rumbleT: 0, ambKey: '', modeT: 0, frames: 0, checked: false };
    for (const k in D) if (R[k] === undefined) R[k] = D[k];
    R.vU ||= [0, 0]; R.vTo ||= [0, 0]; R.vAt ||= [-1, -1]; R.lure ||= [false, false, false]; R.paOn ||= { l12: false, l21: false, l30: false };
    R.ctrlKD ||= [-1, -1]; R.ctrlHD ||= [null, null];
  }
  function applyTaken() {
    if (!R.phones) return;
    const h = R.phonesPick;
    if (R.taken) R.phones.setMatrixAt(R.PICK, ZERO);
    else R.phones.setMatrixAt(R.PICK, m5.compose(pv.set(h[0], h[1], h[2]), qv.setFromAxisAngle(yUp, h[3]), sv.set(1, 1, 1)));
    R.phones.instanceMatrix.needsUpdate = true;
  }
  function applyJack() {
    if (!R.adapter) return;
    const s = R.jackState;
    R.adapter.visible = s !== 'bare'; R.brick.visible = R.brickCord.visible = s === 'phone';
  }
  function valvesCheck() {
    if (R.vOpen) return;
    if (R.vAt[0] >= 0 && R.vAt[1] >= 0 && Math.abs(R.vAt[0] - R.vAt[1]) <= 1.5) { R.vOpen = true; if (typeof emit === 'function') emit('valves:open'); }
  }

  // ---------------------------------------------------------- the spot as a lamp (lamp(name)), per spec §3.4
  const LAMPS = {
    lift12:     { p: [-53.0, 2.45, -41.9], t: [-53.0, 0.0, -41.9], a: 1.1, pen: 0.5, d: 4, c: 0xfff6e8, i: 1.4 },
    gap:        { p: [-50.0, 3.5, -30.5], t: [-50.0, 0.0, -30.5], a: 0.5, pen: 0.7, d: 6, c: 0xf0f6ff, i: 1.2 },
    headphones: { p: [-54.0, 3.4, -18.2], t: [-54.0, 1.3, -15.45], a: 0.55, pen: 0.7, d: 6, c: 0xf0f6ff, i: 1.3 },
    jack:       { p: [-12.6, 3.0, -23.4], t: [-13.96, 0.45, -23.4], a: 0.32, pen: 0.6, d: 5, c: 0xfff0d0, i: 1.6 },
    hatch21:    { p: [-11.8, 0.4, -15.6], t: [-11.8, 3.2, -16.6], a: 0.5, pen: 0.6, d: 5, c: 0xc8ffd8, i: 1.2 },
    lift30:     { p: [57.4, 3.7, -20.7], t: [60.4, 1.4, -20.7], a: 0.45, pen: 0.6, d: 6, c: 0xe8f0ff, i: 1.2 },
    car30:      { p: [61.7, 2.5, -20.7], t: [61.7, 0.0, -20.7], a: 1.0, pen: 0.6, d: 4, c: 0xffe8c8, i: 1.3 },
  };
  const LAMP_GAIN = 3.0;   // the engine's spot (decay 1.5) needs more than the spec's nominal values to read on these surfaces
  const FLOOR_LAMP = { l12: 'gap', l21: 'off', l30: 'lift30' };
  function lamp(name) {
    R.lamp = LAMPS[name] ? name : 'off';
    if (isCur() && R.lamp === 'off' && typeof world !== 'undefined') world.torchAuto = true;
    holdLamp();
  }
  function holdLamp() {
    if (!isCur() || typeof world === 'undefined') return;
    const s = world.torch; if (!s) return;
    if (R.lamp === 'off') { if (s.intensity !== 0) s.intensity = 0; return; }
    const L = LAMPS[R.lamp];
    world.torchAuto = false;
    s.position.set(L.p[0], L.p[1], L.p[2]); s.target.position.set(L.t[0], L.t[1], L.t[2]);
    s.angle = L.a; s.penumbra = L.pen; s.distance = L.d; s.color.setHex(L.c); s.intensity = L.i * LAMP_GAIN;
  }

  // ---------------------------------------------------------- mirror mode (live | baked) and the floor tint per env
  const FLOOR_MIR = {   // per floor: mirror tint brightness by env, reflect amount
    l12: { reflect: 0.55, env: { l12: 0.95, lift: 0.55 }, def: 0.95 },
    l21: { reflect: 0.6, env: { l21: 1.25, l21_fog: 2.4 }, def: 1.25 },
    l30: { reflect: 0.62, env: { l30: 1.35, car30: 0.8 }, def: 1.35 },
  };
  function autoMode() {
    if (R.forced) return R.forced;
    if (MIRROR.touch()) return 'baked';
    if (typeof renderer !== 'undefined' && renderer.getPixelRatio() < 0.75) return 'baked';
    return 'live';
  }
  function applyMode() {
    const mode = autoMode(); R.mode = mode;
    for (const [m, bk, f] of [[R.m12, R.bk12, 'l12'], [R.m21, R.bk21, 'l21'], [R.m30, R.bk30, 'l30']]) {
      if (!m) continue;
      m.userData.setMode(mode); bk.visible = mode === 'baked';
    }
  }
  function reflect(mode) { R.forced = mode === 'live' || mode === 'baked' ? mode : null; applyMode(); }
  function mirrorTint(dt) {
    const F = FLOOR_MIR[R.state], m = R.state === 'l12' ? R.m12 : R.state === 'l21' ? R.m21 : R.m30;
    if (!m) return;
    const want = F.env[R.env] ?? F.def, u = m.userData.mirror;
    u.reflect = F.reflect;
    const k = u.tint.r + (want - u.tint.r) * Math.min(1, dt * 1.2);
    u.tint.setScalar(dt <= 0 ? want : k);
  }

  // ---------------------------------------------------------- ambience per floor (the getter feeds the flow's loadSet)
  const AMB = {
    l12: { rain: false, loops: [['hq_hush', 0.8], ['cleaner_swish', 0.45], { name: 'shelf_servo', vol: 0.7, at: [-63.3, 1.2, -28.0] }], room: 'room' },
    l21: { rain: false, loops: [['server_hum', 0.85], ['cleaner_swish', 0.4], ['drone_idle', 0.3]], room: 'room' },
    l30: { rain: false, loops: [['hangar_charge', 0.8], ['drone_idle', 0.4], ['hq_hush', 0.3]], room: 'room' },
    lift: { rain: false, loops: [['lift_hum', 0.8]], room: 'none' },
  };
  const ambKey = () => (R.env === 'lift' || R.env === 'car30' ? 'lift' : R.state);
  function applyAmbience(force) {
    const k = ambKey(); if (!force && R.ambKey === k) return;
    R.ambKey = k;
    if (typeof AUDIO === 'undefined' || !AUDIO.ambience) return;
    const a = AMB[k]; AUDIO.ambience(a); if (AUDIO.setRoom) AUDIO.setRoom(a.room);
  }

  // ---------------------------------------------------------- dressing: one floor visible at a time
  const FLOORS = { l12: 1, l21: 1, l30: 1 };
  const AUTO = { '3.2': 'l12' };
  function dress(st, o = {}) {
    if (!FLOORS[st]) st = 'l12';
    R.state = st;
    if (typeof state !== 'undefined' && state) R.scene = state.scene;
    if (!R.root) return;
    R.f12.visible = st === 'l12'; R.f21.visible = st === 'l21'; R.f30.visible = st === 'l30';
    applyMode(); hideCleaners(); mirrorTint(0);
    if (!o.keepLamp) lamp(SETVIEW() && st === 'l21' ? 'jack' : FLOOR_LAMP[st]);
    if (isCur()) applyAmbience(true);
  }

  // ---------------------------------------------------------- per-floor ticks (no allocation; also re-applied after a rebuild)
  function placeBank(dt) {
    R.bankK = approach(R.bankK, R.bankTo, dt / 3);
    const k = smooth(R.bankK);
    let jig = 0;
    if (R.jigT >= 0) { R.jigT += dt; const u = R.jigT / 0.5; if (u >= 1) R.jigT = -1; else jig = 0.1 * Math.sin(u * PI * 3) * (1 - u); }
    for (let i = 0; i < 12; i++) {
      const x = BANK.closed[i] + (BANK.open[i] - BANK.closed[i]) * k + (i < 6 ? -jig : jig);
      R.units[i].position.x = x; const c = R.unitCol[i]; c[0] = x - 0.85; c[2] = x + 0.85;
      R.beacons.setMatrixAt(i, m5.makeTranslation(x, 2.83, -30.5));
    }
    R.beacons.instanceMatrix.needsUpdate = true;
  }
  function tick12(dt, t) {
    // lift leaf (1.2 s), collider follows into the wall
    R.liftU = approach(R.liftU, R.liftTo, dt / 1.2);
    const lu = smooth(R.liftU); R.liftLeaf.position.x = -1.6 * lu; R.liftCol[0] = -53.8 - 1.6 * lu; R.liftCol[2] = -52.2 - 1.6 * lu;
    // the bank: 3 s ease, beacons blink while moving
    const moving = R.bankK !== R.bankTo || R.jigT >= 0;
    if (moving || dt === 0) placeBank(dt);
    BEACM.emissiveIntensity = moving ? (Math.sin(t * 14) > 0 ? 2.2 : 0.2) : 0.4;
    // control panels: repaint only on change (ring quantised)
    const qk = Math.round(R.ctrlK * 24) / 24;
    for (let i = 0; i < 2; i++) if (R.ctrlKD[i] !== qk || R.ctrlHD[i] !== R.ctrlHeld[i]) {
      R.ctrlKD[i] = qk; R.ctrlHD[i] = R.ctrlHeld[i]; const h = R.ctrlHeld[i];
      repaint(i ? T.ctrlE : T.ctrlW, (c) => paintCtrl(c, qk, h));
    }
    // the shelf robots ping-pong along the lane at 0.6 m/s
    for (let i = 0; i < 2; i++) {
      const L = 24, s = (t * 0.6 + i * 17) % (2 * L), z = -40 + (s < L ? s : 2 * L - s);
      m5.compose(pv.set(-63.3, 0, z), qv.setFromAxisAngle(yUp, s < L ? 0 : PI), sv.set(1, 1, 1)); R.bots.setMatrixAt(i, m5);
    }
    R.bots.instanceMatrix.needsUpdate = true;
    // the trampoline bin follows the push (eased), squeaks while it rolls
    const pb = R.binU; R.binU = approach(R.binU, R.binTo, dt / 0.9);
    const dz = -3.4 * R.binU; R.tramp.position.z = -20.0 + dz; R.trampCol[1] = -20.8 + dz; R.trampCol[3] = -19.2 + dz;
    if (R.binU !== pb && (R.squeakT -= dt) <= 0) { R.squeakT = 0.55; BIN_AT[2] = -20.0 + dz; snd('creak', 0.22, 1.7, BIN_AT); }
    // the stair door
    R.sdU = approach(R.sdU, R.sdTo, dt / 0.8);
    R.stairDoor.rotation.y = H * smooth(R.sdU);
    if (R.sdU >= 0.8) R.stairCol[0] = R.stairCol[2] = 1e4; else { R.stairCol[0] = -35.1; R.stairCol[2] = -35.0; }
  }
  function tick21(dt, t) {
    T.ledA.offset.y = Math.floor(t * 3) / 64; T.ledB.offset.y = -Math.floor(t * 5) / 64;
    // fog rolls out of the vents: cards rise, spread and drift along the aisles
    R.fogK = approach(R.fogK, R.fogTo, dt / 3);
    const k = R.fogK; R.fog.visible = k > 0.005; FOGM.opacity = 0.6 * k;
    if (R.fog.visible) {
      for (let i = 0; i < VENTS.length; i++) {
        const v = VENTS[i], sp = 1 + 2 * k, dx = Math.sin(t * 0.21 + i * 1.7) * 1.4 * k, rise = 0.9 * k * (0.7 + 0.3 * Math.sin(t * 0.5 + i));
        m5.compose(pv.set(v[0] + dx, rise * 0.35, v[1] + Math.cos(t * 0.17 + i) * 0.3 * k), qv.setFromAxisAngle(yUp, t * 0.06 + i), sv.set(sp, 0.6 + 0.8 * k, sp));
        R.fog.setMatrixAt(i, m5);
      }
      R.fog.instanceMatrix.needsUpdate = true;
    }
    // valve wheels ease to their turn (2.5 turns at 1)
    for (let i = 0; i < 2; i++) { R.vU[i] = approach(R.vU[i], R.vTo[i], dt / 0.5); R.wheels[i].rotation.x = (i ? -1 : 1) * R.vU[i] * 2.5 * TAU; }
    // hatch: lid hangs down from its south edge, the ladder telescopes to the floor; lock pad pulse on the landing
    R.h21U = approach(R.h21U, R.h21To, dt / 0.8); R.lid21.rotation.x = -H * smooth(R.h21U);
    R.ldrU = approach(R.ldrU, R.ldrTo, dt / 1.6); R.ladder21.position.y = 3.2 - 3.2 * smooth(R.ldrU);
    if (R.padT > 0) { R.padT -= dt; R.lockPad.material = R.padT <= 0 ? droneLightMat('patrol') : droneLightMat((R.padT * 6 | 0) % 2 ? 'escort' : 'off'); }
    R.ldU = approach(R.ldU, R.ldTo, dt / 0.8); R.landDoor.rotation.y = H * smooth(R.ldU);
    if (R.ldU >= 0.8) R.landCol[0] = R.landCol[2] = 1e4; else { R.landCol[0] = 13.0; R.landCol[2] = 13.1; }
    // the brick phone's cursor blink, the kettle's steam
    M.brickScr.emissiveIntensity = R.jackState === 'phone' && T.state.scr === 'green' && t % 1 < 0.5 ? 0.8 : 1.0;
    if (R.steamT > 0) { R.steamT -= dt; if ((R.puffT -= dt) <= 0) { R.puffT = 0.22; if (isCur() && !skipping() && typeof world !== 'undefined') world.puff(STEAM_AT, STEAM); } }
  }
  function tick30(dt, t) {
    const D = R.docked; if (!D) return;
    // the 12 awake pods: slow yaw ±0.3 rad, the light breathes brighter
    for (let a = 0; a < R.awake.length; a++) {
      const i = R.awake[a], s = R.slots[i], on = R.awakeOn[a];
      D.set(i, s.x, s.y, s.z, s.ry + (on ? 0.3 * Math.sin(t * 0.35 + a * 1.3) : 0), 1);
      if (R.dockK <= 0.001) { const p = on ? 0.5 + 0.5 * Math.sin(t * 1.7 + a) : 0; tc.setRGB(R.dockBase[i * 3], R.dockBase[i * 3 + 1], R.dockBase[i * 3 + 2]).lerp(tc2.set(0xbfe6ff), p).multiplyScalar(1 + 0.25 * p); D.light.setColorAt(i, tc); }
    }
    // a tint over every docked light (signal full / escort): lerps, amber flickers
    R.dockK = approach(R.dockK, R.dockTo, dt * 2);
    const flick = R.dockTint === 'amber' && R.dockK > 0 && Math.sin(t * 23) * Math.sin(t * 7.3) > 0.35;
    const kk = flick ? R.dockK * 0.45 : R.dockK;
    if (kk !== R.dockShown) {
      R.dockShown = kk; tc2.set(TINTS[R.dockTint] || TINTS.patrol);
      for (let i = 0; i < R.dockN; i++) { tc.setRGB(R.dockBase[i * 3], R.dockBase[i * 3 + 1], R.dockBase[i * 3 + 2]).lerp(tc2, kk); D.light.setColorAt(i, tc); }
    }
    D.light.instanceMatrix.needsUpdate = D.body.instanceMatrix.needsUpdate = true; if (D.light.instanceColor) D.light.instanceColor.needsUpdate = true;
    // M1 follows the push, its collider moves with it (the sentinel's cone is clipped by it)
    const pm = R.m1U; R.m1U = approach(R.m1U, R.m1To, dt / 0.8);
    const x = 46.2 + 4.25 * R.m1U; R.m1.position.x = x; R.m1Col[0] = x - 1.3; R.m1Col[2] = x + 1.3;
    if (R.m1U !== pm && (R.rumbleT -= dt) <= 0) { R.rumbleT = 0.45; M1_AT[0] = x; snd('thud', 0.3, 0.55, M1_AT); }
    // the floor hatch lid swings up 100° about its west edge; rails fold up; the hole blocks while open
    R.h30U = approach(R.h30U, R.h30To, dt / 0.9);
    const hu = smooth(R.h30U); R.lid30.rotation.z = 1.745 * hu; R.rails30.scale.y = Math.max(0.03, hu); R.rails30.position.y = 0;
    if (hu > 0.05) { R.h30Col[0] = 35.75; R.h30Col[1] = -17.05; R.h30Col[2] = 36.65; R.h30Col[3] = -16.15; } else R.h30Col[0] = R.h30Col[1] = R.h30Col[2] = R.h30Col[3] = 1e4;
    // private lift doors part
    R.l30U = approach(R.l30U, R.l30To, dt / 1.0);
    const du = smooth(R.l30U); R.liftN.position.z = -0.8 * du; R.liftS.position.z = 0.8 * du;
    if (R.l30U >= 0.8) R.l30Col[0] = R.l30Col[2] = 1e4; else { R.l30Col[0] = 60.4; R.l30Col[2] = 60.5; }
    // lures: the speaker cone pulses, the phones' waveform scrolls
    R.s1cone.scale.set(R.lure[0] ? 1 + 0.35 * Math.abs(Math.sin(t * 13)) : 1, 1, 1);
    if (R.lure[1] || R.lure[2]) T.phone.offset.y = -Math.floor(t * 30) / 64;
    // the storm: a distant flash every 18–35 s (Reduce Flashing: a slow swell to 40%), thunder after it
    if (isCur()) {
      R.skyT -= dt;
      if (R.skyT <= 0) { R.skyT = 18 + Math.random() * 17; R.flash = 1; R.flashT = 0; R.thunderT = 1.2 + Math.random() * 1.5; }
      if (R.thunderT > 0 && (R.thunderT -= dt) <= 0) snd('thunder_far', 0.5, 1, SKY_AT);
    }
    let fk = 0;
    if (R.flash > 0) {
      R.flashT += dt;
      if (reduceFx()) { const u = R.flashT / 1.5; fk = u >= 1 ? 0 : 0.4 * Math.sin(u * PI) * R.flash; if (u >= 1) R.flash = 0; }
      else { fk = R.flashT < 0.06 || (R.flashT > 0.1 && R.flashT < 0.16) ? R.flash : 0; if (R.flashT > 0.2) R.flash = 0; }
    }
    SKYM.color.setScalar(1 + 1.6 * fk);
  }
  function paTick(dt, t) {
    const on = R.paOn[R.state];
    let lv = 0;
    if (on) lv = t - R.paLevelT < 0.25 ? R.paLevel : 0.5 + 0.5 * Math.sin(t * 9) * Math.sin(t * 2.3);
    RINGM.emissiveIntensity = 0.15 + 1.6 * lv;
  }
  const paApi = (f) => ({ talk(on = true) { R.paOn[f] = !!on; }, level(k) { R.paLevel = clamp01(+k || 0); R.paLevelT = R.t; } });

  // ---------------------------------------------------------- build
  let LOCKGEO = null, RINGGEO = null, SCRGEO = null, PHONEGEO = null, BTNGEO = null;
  function build() {
    COL.length = 0; T = textures(); defaults();
    GLOWM ||= new THREE.MeshBasicMaterial({ vertexColors: true });
    GLASSM ||= new THREE.MeshBasicMaterial({ color: 0x9ab4c4, transparent: true, opacity: 0.16, depthWrite: false, side: DS });
    SKYM ||= new THREE.MeshBasicMaterial({ map: T.storm, fog: false, color: 0xffffff });
    FOGM ||= new THREE.MeshBasicMaterial({ map: T.fog, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: DS, color: 0xc8dcf0 });
    BEACM ||= mat(0x40301a, { emissive: 0xffb040, emissiveIntensity: 0.4, key: 'hqf_beacon' });
    RINGM ||= mat(0x10202a, { emissive: 0x6fd0ff, emissiveIntensity: 0.15, key: 'hqf_pa_ring' });
    PHONEM ||= matTex(T.phone, { emissive: 0xffffff, key: 'hqf_phone' });
    M = {
      vc: mat(0xffffff), glow: GLOWM, ring: RINGM,
      atlas: matTex(T.signs), lit: matTex(T.signs, { emissive: 0xffffff, emissiveIntensity: 0.85 }), labels: matTex(T.labels),
      jack: matTex(T.jack), side: matTex(T.side, { emissive: 0xffffff, emissiveIntensity: 0.95 }), reader: matTex(T.reader, { emissive: 0xffffff, emissiveIntensity: 0.9 }),
      ctrlW: matTex(T.ctrlW, { emissive: 0xffffff, emissiveIntensity: 0.8 }), ctrlE: matTex(T.ctrlE, { emissive: 0xffffff, emissiveIntensity: 0.8 }),
      liftPanel: matTex(T.liftPanel, { emissive: 0xffffff, emissiveIntensity: 0.45 }),
      ledA: matTex(T.ledA, { emissive: 0xffffff }), ledB: matTex(T.ledB, { emissive: 0xffffff }),
      brick: matTex(T.brick), cradle: matTex(T.cradle, { emissive: 0xffffff, emissiveIntensity: 0.35 }), quilt: matTex(T.quilt), pa: matTex(T.pa),
      brickScr: matTex(T.brickScr, { emissive: 0xffffff, key: 'hqf_brick_scr' }), fence: matTex(T.fence, { transparent: true, side: DS }),
    };
    LOCKGEO = new THREE.BoxGeometry(0.08, 0.08, 0.02); RINGGEO = new THREE.TorusGeometry(0.29, 0.02, 4, 24);
    SCRGEO = new THREE.PlaneGeometry(0.042, 0.022); PHONEGEO = new THREE.PlaneGeometry(0.066, 0.132); BTNGEO = new THREE.CylinderGeometry(0.03, 0.03, 0.02, 12).rotateX(H);
    const root = new THREE.Group(); root.name = 'hq_floors_root'; R.root = root;
    R.mirrors = []; R.noRef = [];
    b = new Builder(); GL = []; XF = null;
    const mir = (w, d, x, z, f, map, tile, holes) => {
      const m = MIRROR(w, d, { key: 'hq_floors', tint: 0xffffff, reflect: FLOOR_MIR[f].reflect, map, tile, peers: R.mirrors, hide: R.noRef, holes, name: 'mirror_' + f });
      m.position.set(x, 0, z); return m;
    };
    // L12
    R.f12 = new THREE.Group(); R.f12.name = 'floor_l12'; root.add(R.f12);
    buildL12(R.f12); const st12 = finish(R.f12); propsL12(R.f12);
    R.pa12.userData = paApi('l12');
    R.m12 = mir(31.0, 25.6, -50.5, -27.8, 'l12', T.f12, 2.4); R.f12.add(R.m12);
    R.bk12 = bakedCopy('baked_l12', staticMeshes(st12)); R.f12.add(R.bk12);
    // L21
    R.f21 = new THREE.Group(); R.f21.name = 'floor_l21'; root.add(R.f21);
    buildL21(R.f21); const st21 = finish(R.f21); st21.name = 'racks21'; propsL21(R.f21);
    R.pa21.userData = paApi('l21');
    R.m21 = mir(27.0, 21.6, -0.5, -26.2, 'l21', T.f21, 1.2); R.f21.add(R.m21);
    R.bk21 = bakedCopy('baked_l21', staticMeshes(st21)); R.f21.add(R.bk21);
    // L30
    R.f30 = new THREE.Group(); R.f30.name = 'floor_l30'; root.add(R.f30);
    buildL30(R.f30); const st30 = finish(R.f30); propsL30(R.f30);
    R.pa30.userData = paApi('l30');
    R.m30 = mir(27.4, 26.0, 46.7, -24.0, 'l30', T.f30, 2.0, [[35.75 - 46.7, -17.05 + 24.0, 36.65 - 46.7, -16.15 + 24.0]]); R.f30.add(R.m30);
    R.bk30 = bakedCopy('baked_l30', [...staticMeshes(st30), R.docked.body, R.docked.light]); R.f30.add(R.bk30);
    buildCleaners(root);
    b = null; GL = null;
    // put every prop where its (persisting) state says, then dress
    tick12(0, 0); tick21(0, 0); tick30(0, 0); applyTaken(); applyJack();
    R.liftLight.visible = R.liftLightOn !== false; R.carLight.visible = R.carLightOn !== false;
    dress(R.state, { build: true });
    return root;
  }

  // ---------------------------------------------------------- update (no allocation)
  function update(dt, ctx) {
    if (!R.root || !R.f12) return;
    const t = ctx.t, cur = isCur(); R.t = t;
    if (SETVIEW() && typeof world !== 'undefined' && world.camera) {
      const x = world.camera.position.x, f = x < -24 ? 'l12' : x > 24 ? 'l30' : 'l21';
      if (f !== R.state) dress(f);
    } else if (typeof state !== 'undefined' && state && state.scene !== R.scene) {
      R.scene = state.scene; dress(AUTO[R.scene] || R.state);
    }
    const reshown = R.lastT >= 0 && t - R.lastT > 0.5; R.lastT = t;
    if (ctx.env !== R.env) R.env = ctx.env;
    if (cur) {
      applyAmbience(reshown);
      holdLamp();
      if ((R.modeT -= dt) <= 0) { R.modeT = 1; if (autoMode() !== R.mode) applyMode(); }
      if (!R.checked && R.mode === 'live' && ++R.frames > 4) { R.checked = true; if (typeof renderer !== 'undefined' && MIRROR.failed(renderer)) { R.forced = 'baked'; applyMode(); } }
    }
    mirrorTint(dt);
    cleanTick(dt, t);
    if (R.state === 'l12') tick12(dt, t); else if (R.state === 'l21') tick21(dt, t); else tick30(dt, t);
    paTick(dt, t);
  }

  // ---------------------------------------------------------- data
  return {
    env: {
      l12:     { bg: 0xdfe4ea, fog: [0xe8ecf0, 0.028], hemi: [0xf4f8ff, 0xc8ccd4, 2.0], dir: [0xe8f0ff, 1.1, [6, 14, 8]], spot: [0xf0f6ff, 1.2], rain: 0 },
      lift:    { bg: 0x101214, fog: [0x202428, 0.020], hemi: [0xd8e2ea, 0x404448, 1.30], dir: [0xffffff, 0.35, [0, 10, 0]], spot: [0xfff6e8, 1.4], rain: 0 },
      l21:     { bg: 0x0a1420, fog: [0x10223a, 0.035], hemi: [0x8fb8e8, 0x1a2430, 1.7], dir: [0x9cc4ff, 0.8, [-6, 10, 4]], spot: [0xbfe6ff, 1.4], rain: 0 },
      l21_fog: { bg: 0x40586e, fog: [0x6a8aa8, 0.075], hemi: [0xa8c8e8, 0x2a3440, 1.9], dir: [0x9cc4ff, 0.6, [-6, 10, 4]], spot: [0xbfe6ff, 1.2], rain: 0 },
      l30:     { bg: 0x0b0f16, fog: [0x141c28, 0.030], hemi: [0x7f9cc8, 0x1a2028, 1.7], dir: [0xa8b8c8, 1.0, [0, 12, 20]], spot: [0xbfe6ff, 1.2], rain: 0 },
      car30:   { bg: 0x08080a, fog: [0x101012, 0.030], hemi: [0x8a8070, 0x202020, 1.2], dir: [0xffe8c8, 0.45, [0, 10, 0]], spot: [0xffe8c8, 1.3], rain: 0 },
    },
    build, dress, lamp, reflect, makeMirror: MIRROR,
    marks: {
      // L12
      l12_car_luka: [-53.0, 0, -42.4, 0], l12_car_chase: [-52.4, 0, -41.5, 0], l12_car_c40: [-53.6, 0, -41.5, 0],
      s32_l12_out_luka: [-53.0, 0, -39.0, 0], s32_l12_out_chase: [-52.0, 0, -38.4, 0.2], s32_l12_out_c40: [-54.0, 0, -38.4, -0.2],
      s32_cp_l12: [-53.0, 0, -37.6, 0],
      s32_skate: [-59.0, 0, -35.4, PI], s32_knives: [-45.0, 0, -35.4, PI], s32_ladders: [-41.0, 0, -35.3, PI],
      s32_ctrl_w: [-60.3, 0, -35.2, -H], s32_ctrl_e: [-39.7, 0, -35.2, H],
      s32_gap_n: [-50.0, 0, -34.6, 0], s32_gap_s: [-50.0, 0, -26.4, 0],
      s32_guitars_c40: [-55.0, 0, -23.0, 0.1], s32_guitars_chase: [-56.3, 0, -23.2, 0.45],
      s32_headphones: [-54.0, 0, -16.25, 0],
      s32_bin_luka: [-35.5, 0, -18.4, PI], s32_bin_done: [-35.5, 0, -21.8, PI], s32_stair_in: [-34.2, 0, -20.0, H],
      // L21
      s32_l21_land_luka: [14.0, 0, -20.0, -H], s32_l21_land_chase: [14.6, 0, -19.0, -1.8], s32_l21_land_c40: [14.6, 0, -20.9, -1.3],
      s32_cp_l21: [11.6, 0, -20.0, -H], kettle: [12.0, 0, -17.2, H], s32_cord: [12.0, 0, -18.2, H], s32_trail_start: [10.5, 0, -20.6, PI],
      s32_cp_l21_w: [-12.0, 0, -29.0, PI],
      s32_jack_chase: [-13.25, 0, -23.4, -H], s32_jack_luka: [-12.8, 0, -22.5, -1.9], s32_jack_c40: [-12.4, 0, -24.4, -1.2],
      s32_valve_w: [-13.1, 0, -32.4, -H], s32_valve_e: [12.1, 0, -32.4, H],
      s32_hatch: [-11.8, 0, -16.7, PI], s32_hatch_top: [-11.8, 3.0, -16.75, PI],
      // L30
      s32_l30_up: [36.2, -0.8, -16.75, PI],
      s32_l30_luka: [36.2, 0, -18.0, PI], s32_l30_chase: [35.4, 0, -18.6, 2.8], s32_l30_c40: [37.0, 0, -18.6, -2.8],
      s32_cp_a: [36.2, 0, -18.4, PI], s32_s1: [39.7, 0, -31.0, H], s32_cp_l1: [42.6, 0, -33.8, H],
      m1_push: [44.35, 0, -34.6, H], m1_done: [48.6, 0, -34.6, H],
      s32_p1: [45.4, 0, -15.0, PI], s32_cp_c: [55.0, 0, -34.2, H], s32_p2: [55.6, 0, -22.0, -H],
      s32_reader_luka: [59.6, 0, -19.35, H], s32_panel_chase: [59.6, 0, -22.4, H], s32_lift_c40: [58.4, 0, -20.7, H],
      car30_luka: [61.7, 0, -20.7, -H], car30_chase: [62.3, 0, -20.1, -H], car30_c40: [62.3, 0, -21.3, -H],
    },
    anchors: {
      // L12
      l12_lift_inside:      { at: [-53.0, 0.8, -37.0], from: [-53.0, 1.6, -42.6], fov: 60 },
      s32_doors_open:       { at: [-53.0, 1.0, -41.6], from: [-51.4, 0.35, -36.6], fov: 50 },
      l12_panel:            { at: [-51.92, 1.25, -41.15], from: [-52.85, 1.3, -41.15], fov: 30 },
      pa12:                 { at: [-53.0, 3.58, -38.4], from: [-52.0, 1.7, -37.0], fov: 40 },
      l12_wide:             { at: [-50.0, 1.0, -31.0], from: [-56.6, 3.3, -40.2], fov: 62 },
      skateboards:          { at: [-59.0, 1.0, -36.42], from: [-58.6, 1.5, -34.8], fov: 38 },
      knives:               { at: [-45.0, 1.25, -36.42], from: [-44.6, 1.5, -34.8], fov: 36 },
      ladders:              { at: [-41.0, 1.55, -36.42], from: [-42.2, 1.7, -34.4], fov: 44 },
      ctrl_w:               { at: [-60.9, 1.1, -35.2], from: [-59.6, 1.5, -34.6], fov: 36 },
      ctrl_e:               { at: [-39.1, 1.1, -35.2], from: [-40.4, 1.5, -34.6], fov: 36 },
      gap:                  { at: [-50.0, 1.2, -30.5], from: [-49.6, 2.2, -35.8], fov: 50 },
      guitars:              { at: [-55.5, 0.9, -21.8], from: [-55.7, 1.55, -23.9], fov: 40 },
      s32_guitars_two:      { at: [-55.6, 1.4, -23.1], from: [-53.4, 1.6, -24.4], fov: 42 },
      headphones_wall:      { at: [-54.0, 1.5, -15.4], from: [-54.0, 1.7, -19.6], fov: 52 },
      headphones_sign:      { at: [-54.0, 2.9, -15.42], from: [-54.0, 2.3, -21.4], fov: 34 },
      s32_headphones_close: { at: [-54.0, 1.5, -16.25], from: [-53.0, 1.6, -17.4], fov: 38 },
      tramp_bin:            { at: [-35.5, 0.9, -20.0], from: [-38.6, 1.6, -18.6], fov: 44 },
      stair_door12:         { at: [-35.0, 1.45, -20.0], from: [-38.0, 1.6, -21.6], fov: 42 },
      // L21
      l21_landing_wide:     { at: [13.4, 1.0, -21.0], from: [17.1, 2.9, -16.6], fov: 64 },
      shutter:              { at: [16.0, 1.4, -21.2], from: [15.6, 1.6, -19.4], fov: 40 },
      pa21:                 { at: [11.0, 3.15, -21.0], from: [11.6, 1.6, -19.6], fov: 40 },
      l21_reveal:           { at: [-2.0, 1.0, -27.6], from: [12.4, 2.6, -27.6], fov: 44 },
      tea_point:            { at: [12.7, 1.1, -17.4], from: [11.0, 1.5, -17.4], fov: 40 },
      kettle:               { at: [12.7, 1.05, -17.2], from: [12.0, 1.35, -17.2], fov: 32 },
      kettle_cord:          { at: [12.7, 0.95, -18.2], from: [12.1, 1.3, -18.0], fov: 30 },
      jack_wide:            { at: [-13.9, 0.8, -23.4], from: [-11.4, 1.5, -25.4], fov: 46 },
      jack:                 { at: [-13.96, 0.52, -23.4], from: [-13.45, 0.65, -23.4], fov: 26 },
      brick_phone_floor:    { at: [-13.6, 0.08, -23.2], from: [-13.0, 0.6, -23.0], fov: 32 },
      valve_w:              { at: [-13.8, 1.15, -32.4], from: [-12.0, 1.5, -31.2], fov: 40 },
      valve_e:              { at: [12.8, 1.15, -32.4], from: [11.0, 1.5, -31.2], fov: 40 },
      fog_wide:             { at: [-2.0, 0.5, -31.6], from: [-13.4, 2.9, -31.6], fov: 44 },
      hatch21:              { at: [-11.8, 3.2, -16.6], from: [-11.0, 1.0, -18.2], fov: 48 },
      ladder21:             { at: [-11.8, 2.0, -16.8], from: [-9.8, 1.6, -19.0], fov: 46 },
      // L30
      l30_hatch_up:         { at: [36.2, 0.6, -16.6], from: [38.6, 1.4, -19.6], fov: 46 },
      hangar_reveal:        { at: [52.0, 1.0, -32.0], from: [36.6, 3.7, -14.2], fov: 60 },
      pa30:                 { at: [37.0, 3.85, -18.4], from: [36.4, 1.6, -20.6], fov: 40 },
      sentinel:             { at: [50.45, 1.8, -36.2], from: [50.0, 1.6, -29.6], fov: 40 },
      m1:                   { at: [47.5, 1.4, -34.6], from: [43.2, 2.0, -31.0], fov: 48 },
      lift30_doors:         { at: [60.4, 1.4, -20.7], from: [56.4, 1.7, -20.7], fov: 40 },
      lift_reader:          { at: [60.38, 1.2, -19.35], from: [59.8, 1.35, -19.35], fov: 26 },
      side_panel:           { at: [60.38, 1.45, -22.4], from: [59.8, 1.47, -22.4], fov: 40 },
      s32_santa_two:        { at: [59.6, 1.5, -21.0], from: [57.0, 1.7, -22.4], fov: 44 },
      car30:                { at: [62.8, 1.2, -20.7], from: [60.9, 2.0, -21.6], fov: 70 },
    },
    cams: {
      // L12
      l12_lobby:   { type: 'fixed', pos: [-56.6, 3.3, -40.2], look: [-51.0, 0.4, -34.8], fov: 60 },
      l12_lift_in: { type: 'fixed', pos: [-52.05, 2.25, -40.95], look: [-53.4, 1.1, -42.6], fov: 72 },
      l12_aisle_w: { type: 'fixed', pos: [-44.0, 3.3, -34.4], look: [-60.6, 0.5, -35.6], fov: 42 },
      l12_aisle_e: { type: 'fixed', pos: [-56.0, 3.3, -34.4], look: [-39.4, 0.5, -35.6], fov: 42 },
      l12_gap:     { type: 'fixed', pos: [-48.7, 3.2, -25.8], look: [-50.0, 0.6, -32.6], fov: 54 },
      l12_hall_w:  { type: 'fixed', pos: [-47.6, 3.3, -26.6], look: [-56.0, 0.5, -17.4], fov: 56 },
      l12_hall_e:  { type: 'fixed', pos: [-42.4, 3.3, -26.4], look: [-35.8, 0.5, -19.4], fov: 58 },
      // L21
      l21_landing: { type: 'fixed', pos: [17.1, 2.9, -16.6], look: [13.4, 0.8, -21.6], fov: 64 },
      l21_east_s:  { type: 'fixed', pos: [9.4, 3.0, -25.4], look: [12.4, 0.5, -17.2], fov: 56 },
      l21_east_n:  { type: 'fixed', pos: [10.2, 2.9, -24.6], look: [11.6, 0.4, -35.6], fov: 52 },
      l21_a0:      { type: 'fixed', pos: [12.4, 2.9, -35.6], look: [-12.0, 0.4, -35.6], fov: 40, ease: 0.25 },
      l21_a1:      { type: 'fixed', pos: [-13.4, 2.9, -31.6], look: [8.0, 0.4, -31.6], fov: 40, ease: 0.25 },
      l21_a2:      { type: 'fixed', pos: [12.4, 2.9, -27.6], look: [-10.0, 0.4, -27.6], fov: 40, ease: 0.25 },
      l21_a3:      { type: 'fixed', pos: [-13.4, 2.9, -23.6], look: [8.0, 0.4, -23.6], fov: 40, ease: 0.25 },
      l21_west_n:  { type: 'fixed', pos: [-10.4, 2.9, -24.0], look: [-12.6, 0.4, -36.0], fov: 50 },
      l21_west_s:  { type: 'fixed', pos: [-10.4, 2.9, -30.0], look: [-12.8, 0.4, -17.0], fov: 54 },
      // L30
      l30_a_s:     { type: 'fixed', pos: [39.9, 3.6, -13.6], look: [35.6, 0.2, -23.0], fov: 60 },
      l30_a_n:     { type: 'fixed', pos: [33.5, 3.6, -23.5], look: [38.4, 0.2, -34.8], fov: 56 },
      l30_l1_s:    { type: 'fixed', pos: [46.6, 3.6, -13.4], look: [43.8, 0.2, -25.0], fov: 50 },
      l30_l1_n:    { type: 'fixed', pos: [41.8, 3.6, -24.6], look: [45.8, 0.2, -35.6], fov: 52 },
      l30_l2_s:    { type: 'fixed', pos: [52.6, 3.6, -13.4], look: [50.0, 0.2, -28.0], fov: 50 },
      l30_l2_n:    { type: 'fixed', pos: [48.4, 3.6, -27.4], look: [51.6, 0.3, -36.0], fov: 56 },
      l30_c_n:     { type: 'fixed', pos: [54.4, 3.6, -20.6], look: [58.6, 0.2, -34.0], fov: 54 },
      l30_c_s:     { type: 'fixed', pos: [54.4, 3.6, -35.6], look: [59.4, 0.4, -20.0], fov: 50 },
      l30_lobby:   { type: 'fixed', pos: [55.6, 2.9, -25.2], look: [60.4, 1.3, -20.6], fov: 52 },
      l30_car:     { type: 'fixed', pos: [60.9, 2.0, -21.6], look: [62.8, 1.2, -20.4], fov: 70 },
    },
    zones: [
      { box: [-54.1, -43.0, -51.9, -40.6], cam: 'l12_lift_in' },
      { box: [-57.0, -40.6, -49.0, -36.4], cam: 'l12_lobby' },
      { box: [-61.0, -36.4, -50.0, -34.0], cam: 'l12_aisle_w' },
      { box: [-50.0, -36.4, -39.0, -34.0], cam: 'l12_aisle_e' },
      { box: [-50.8, -34.0, -49.2, -27.0], cam: 'l12_gap' },
      { box: [-61.0, -27.0, -45.0, -15.4], cam: 'l12_hall_w' },
      { box: [-45.0, -27.0, -35.0, -15.4], cam: 'l12_hall_e' },
      { box: [-35.0, -24.0, -30.4, -16.0], cam: 'l12_hall_e' },
      { box: [13.0, -24.0, 17.6, -16.0], cam: 'l21_landing' },
      { box: [8.0, -25.0, 13.0, -15.4], cam: 'l21_east_s' },
      { box: [8.0, -37.0, 13.0, -25.0], cam: 'l21_east_n' },
      { box: [-14.0, -27.5, -10.0, -15.4], cam: 'l21_west_s' },
      { box: [-14.0, -37.0, -10.0, -27.5], cam: 'l21_west_n' },
      { box: [-10.0, -37.0, 8.0, -34.2], cam: 'l21_a0' },
      { box: [-10.0, -34.2, 8.0, -30.2], cam: 'l21_a1' },
      { box: [-10.0, -30.2, 8.0, -26.2], cam: 'l21_a2' },
      { box: [-10.0, -26.2, 8.0, -22.2], cam: 'l21_a3' },
      { box: [57.6, -23.6, 60.4, -17.6], cam: 'l30_lobby' },
      { box: [60.4, -22.0, 63.0, -19.4], cam: 'l30_car' },
      { box: [33.0, -25.0, 40.4, -13.0], cam: 'l30_a_s' },
      { box: [33.0, -37.0, 40.4, -25.0], cam: 'l30_a_n' },
      { box: [40.4, -25.0, 47.0, -13.0], cam: 'l30_l1_s' },
      { box: [40.4, -37.0, 47.0, -25.0], cam: 'l30_l1_n' },
      { box: [47.0, -29.0, 53.0, -13.0], cam: 'l30_l2_s' },
      { box: [47.0, -37.0, 53.0, -29.0], cam: 'l30_l2_n' },
      { box: [53.0, -37.0, 60.4, -27.0], cam: 'l30_c_n' },
      { box: [53.0, -27.0, 60.4, -13.0], cam: 'l30_c_s' },
    ],
    colliders: COL,
    props: [
      'floor_l12', 'floor_l21', 'floor_l30', 'mirror_l12', 'mirror_l21', 'mirror_l30', 'baked_l12', 'baked_l21', 'baked_l30', 'cleaners',
      'l12_lift', 'l12_lift_light', 'l12_lift_leaf', 'pa12', 'pa21', 'pa30', 'bank', 'bank_u0..bank_u11', 'bank_beacons', 'ctrl_w', 'ctrl_e',
      'lane_bots', 'bins_l12', 'chase_guitar', 'headphones_wall', 'tramp_bin', 'stair_door12',
      'landing21', 'tea_point', 'tea_kettle', 'kettle_cord', 'jack', 'jack_adapter', 'jack_brick_phone', 'valves', 'fog21', 'hatch21', 'racks21',
      'docked', 'm1', 'hatch30', 's1', 'p1', 'p2', 'lift30', 'sky30',
    ],
    get ambience() { return AMB[ambKey()]; },
    update,
    paths: PATHS,
    checkpoints: { l21: ['s32_cp_l21', 's32_cp_l21_w'], l30: ['s32_cp_a', 's32_cp_l1', 's32_cp_c'] },
    lures: { s1: [40.3, 1.5, -31.0], p1: [45.4, 0.01, -15.6], p2: [55.0, 0.01, -22.0] },
    ar: {
      l12: [
        { id: 'ar_l12', at: [-53.0, 2.9, -36.6], text: 'ARCHIVE L12 · CONFISCATED FOR YOUR SAFETY', kind: 'sign', w: 3.4 },
        { id: 'ar_returns', at: [-50.0, 2.9, -34.2], text: 'RETURNS · please allow 6–8 weeks', kind: 'sign', w: 2.4 },
        { id: 'ar_stairs', at: [-35.2, 2.6, -20.0], text: 'STAIRS · L12 → L21 (lift will not stop)', kind: 'sign', w: 2.4 },
      ],
      l21: [
        { id: 'ar_l21', at: [11.0, 2.6, -24.6], text: 'SERVER FLOOR L21 · COLD AISLES', kind: 'sign', w: 2.6 },
        { id: 'ar_old', path: 'old_trail', y: 0.03, text: 'old', kind: 'path' },
        { id: 'ar_old_tag', at: [10.5, 0.6, -20.4], text: 'old', kind: 'tag', w: 0.5 },
        { id: 'ar_hatch', at: [-11.8, 2.8, -16.6], text: 'MAINT HATCH · INTERLOCK: COOLING W + E', kind: 'sign', w: 2.6 },
      ],
      l30: [
        { id: 'ar_l30', at: [36.2, 2.9, -19.0], text: 'HANGAR L30 · COURTESY FLEET · CHARGING', kind: 'sign', w: 3.0 },
        { id: 'ar_p_d30a', path: 'd30a', kind: 'path' }, { id: 'ar_p_d30b', path: 'd30b', kind: 'path' },
        { id: 'ar_p_d30c', path: [[50.45, -36.2], [50.45, -25.2]], kind: 'path' },
        { id: 'ar_p_d30d', path: 'd30d', kind: 'path' },
        { id: 'ar_p_d30e', arc: { c: [58.8, -21.6], r: 4.2, a0: -2.47, a1: -0.67 }, kind: 'path' },
        { id: 'ar_lift', at: [60.3, 2.9, -20.7], text: 'PRIVATE LIFT · MANAGER ONLY', kind: 'sign', w: 2.2 },
      ],
    },
    // spec §7.3: the drones content spawns (DRONES.spawn) per floor
    drones: {
      l21: [
        { id: 'd21_a0', path: 'd21_a0', y: 1.9, speed: 0.8, cone: { len: 4.6, half: 0.42 } },
        { id: 'd21_a2', path: 'd21_a2', y: 1.9, speed: 0.7, cone: { len: 5.0, half: 0.42 } },
      ],
      l30: [
        { id: 'd30a', path: 'd30a', y: 1.9, speed: 0.8, cone: { len: 4.5, half: 0.42 } },
        { id: 'd30b', path: 'd30b', y: 1.9, speed: 1.0, cone: { len: 5.0, half: 0.42 } },
        { id: 'd30c', at: [50.45, 1.8, -36.2], face: 0, y: 1.8, sweep: 10.3, sweepPeriod: 5, cone: { len: 11.0, half: 0.30 } },
        { id: 'd30d', path: 'd30d', y: 1.9, speed: 0.9, cone: { len: 4.5, half: 0.42 } },
        { id: 'd30e', at: [58.8, 1.9, -21.6], face: -H, y: 1.9, sweep: 51.6, sweepPeriod: 8.3, cone: { len: 4.2, half: 0.45 } },
      ],
    },
  };
})();
