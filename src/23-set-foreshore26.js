// ============================================================ SET: foreshore26 — Woody Point headland, Christmas morning 2026
// (no bench). Spec: docs/sets/foreshore26.md (scene A2 "Christmas Morning", steps 1-18 and 20; step 19 is on reddy26).
// This is parade's Region W fourteen years earlier: the layout constants below are copied verbatim from
// src/12-set-parade.js (docs/sets/parade.md §2.3-2.4) and built in LOCAL coordinates with the origin at the bench spot
// (parade world = this local + (-300, 0, 0)), so wp_canon here is the same frame as parade's wp_canon (2.3 / B2) with
// the bench, its pad, plaque and frangipani missing. Any change to Region W's layout must be mirrored here, and vice versa.
// Layout (metres, Y up). +Z = the bay (seaward), +X = east (screen LEFT when facing the bay). Walkable ground at y 0.
//   (0, 0, 0) bench_spot: plain grass with the same tufts as everywhere (no bench, pad, plaque or flowers in 2026).
//   Walkable x -16..16, z -10..6.2 (closed by colliders). Path (concrete) z -9.1..-6.9, x -40..40; garden bed + shrubs
//   z -11.6..-9.5; railing z 6.5, x -22..22 (posts every 2 m, rails y 0.55 / 1.05; red tinsel tied round the post at
//   x 2: the spec's "x 3" falls between posts); sandstone headland face along the shoreline (water y -2.6): (-40,-30) (-30,-4) (-22,6.8) (22,6.8) (30,0)
//   (40,-20), rocks at its foot; Norfolk pines (-14,-16) (12,-22) (-24,-4) (28,-12) (-6,-34); picnic shelter (14,-12);
//   council sign (-8.5,-9.8) facing +Z "WOODY POINT / FORESHORE / Please take your rubbish home"; green-lid wheelie bin
//   (4.5,-9.6); pandanus (-18,4) (17,5); Woody jetty stub x 24.8..27.2, z 2..40, deck y -1.0 (not walkable); bell buoy
//   (10,-2.6,70); road z -48..-44 and 12 low houses z -55..-65.
//   Far (fog: false): horizon band r 470 + haze r 480 + skirt (live fog colour); Ted Smout Bridge A(105,-2.6,365) ->
//   B(-100,-2.6,372) (16° left .. 15° right of +Z; deck 5 m over the water, a 9 m hump at 55 %; 12 piers, 17 lamps, off
//   at 7 am) with 8 tiny 2026 cars on wheels, keeping left; sun r 9 + halo at 420 m toward (0.80, 0.28, 0.53) (east,
//   low, off to the left of wp_canon); 6 thin high cumulus.
// Static geometry: one vertex-coloured M.vc merge + grass / concrete ground; painted textures (128-256 px, nearest) only
// where something must read (the sign, the bin sticker); every repeat instanced; nothing is created after build().
//
// Marks: a2_luka a2_chase bench_spot path_w path_e
// Anchors: wp_canon a2_phone_chase a2_topdown a2_two_front a2_lanyard a2_phone_luka a2_grass a2_bridge
//   (+ for inspection: council_sign tinsel bin)
// Cams: wp_canon (first = default: the angle from 2.3) · wp_west wp_east (debug roam only: the two ends of the headland)
// Zones: wp_canon (the grass in its frame) · wp_west / wp_east (the rest of the walkable headland, split at x 1)
// Props (userData API): grass_f26 gust(on) (grass_fine, a denser carpet, sways with it) · coffees show(who | 'both', on), hold(who, on = true, hand = 'L'), home()
//   (children coffee_luka, coffee_chase; who = 'luka' | 'chase') · tinsel_rail (tinsel_tail flutters) ·
//   council_sign_26 · bin_26 · bell_buoy · gulls (+ gull_wings) · bridge_cars · woody_jetty woody_jetty_piles railing_w
//   pines shelter houses street_trees rocks blobs · water foam band haze skirt bridge bridge_lamps sun clouds
// Env: xmas_morning. Dress states: xmas26 (default; AUTO for A2) · xmas26_empty (step 20: coffees hidden, gust on).
// Ambience: birds, wind_soft, water_lap (room none). Extras on the entry: dress(state), dressed().
SETS.foreshore26 = (() => {
  const PI = Math.PI, H = PI / 2, TAU = PI * 2;
  // palette (spec §3.1: the Rue palette, morning, cool for once; no Yes yellow, no 2040 glassy accent)
  const GRASS = 0x86b552, SANDST = 0xd8b98a, ROCK = 0x8a7a66, PINE = 0x2e5a3a, GALV = 0xb8bec4, WNEAR = 0x7cc8dc,
    WFAR = 0x4aa4c6, SIGNB = 0x5a3a26, BINB = 0x2f5a3a, BINL = 0x3a7a4a, TRED = 0xd8323a, TSIL = 0xc8ccd4, TIMBER = 0x9c8c78;
  // ---- layout constants: parade Region W verbatim (local; docs/sets/parade.md §2.3-2.4)
  const COAST = [[-200, -80], [-90, -55], [-40, -30], [-30, -4], [-22, 6.8], [22, 6.8], [30, 0], [40, -20], [90, -45], [200, -70]];
  const PINES = [[-14, -16, 20], [12, -22, 24], [-24, -4, 18], [28, -12, 22], [-6, -34, 21]];
  const SHELTER = [14, -12], SIGN = [-8.5, -9.8], BIN = [4.5, -9.6], PANDANUS = [[-18, 4], [17, 5]], TINSEL_X = 2;   // spec: 'the post at x 3' — the posts stand at even x (-22 + 2i), so the nearest one toward the bench spot
  const WY = -2.6, BUOY = [10, WY, 70], BR_A = [105, WY, 365], BR_B = [-100, WY, 372];
  const SUN_D = [0.80, 0.28, 0.53];
  const CUP_HOME = { luka: [-0.05, 0, 0.75], chase: [0.6, 0, 0.75] };
  const COL = [];                // colliders (filled by build)
  const R = {};                  // live refs from the last build (dress/update use them)
  // scratch (update never allocates)
  const tc = new THREE.Color(), tc2 = new THREE.Color(), m4 = new THREE.Matrix4(), mA = new THREE.Matrix4(), mB = new THREE.Matrix4();
  const v1 = new THREE.Vector3(), sv = new THREE.Vector3(), q1 = new THREE.Quaternion(), eY = new THREE.Euler(0, 0, 0, 'YXZ'), e2 = new THREE.Euler();
  const UP = new THREE.Vector3(0, 1, 0);
  let b = null, XF = null, T = null, M = null, SKY = null, GRASSM = null, gain = 1;   // gain: vertex colour multiplier (linear; > 1 allowed)

  // ---------------------------------------------------------- geometry helpers (into the current Builder `b`), as parade
  function put(g, hex, m) {
    if (XF) g.applyMatrix4(XF);
    tc.set(hex); if (gain !== 1) tc.multiplyScalar(gain);
    const n = g.attributes.position.count, a = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { a[i * 3] = tc.r; a[i * 3 + 1] = tc.g; a[i * 3 + 2] = tc.b; }
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
  function seg(ax, ay, az, bx, by, bz, r, hex) {   // a thin round rod from a to b
    const dx = bx - ax, dy = by - ay, dz = bz - az, L = Math.hypot(dx, dy, dz);
    const g = new THREE.CylinderGeometry(r, r, L, 5); v1.set(dx / L, dy / L, dz / L); q1.setFromUnitVectors(UP, v1);
    g.applyQuaternion(q1); g.translate((ax + bx) / 2, (ay + by) / 2, (az + bz) / 2); put(g, hex);
  }
  function ico(r, hex, x, y, z, sy = 1, m) { const g = new THREE.IcosahedronGeometry(r, 0); g.scale(1, sy, 1); g.translate(x, y, z); put(g, hex, m); }
  // remap a geometry's 0..1 UVs into the pixel rect r = [x, y, w, h] of an aw x ah atlas (canvas y down)
  function uvRect(g, r, aw = 256, ah = 256) {
    const uv = g.attributes.uv, u0 = r[0] / aw, u1 = (r[0] + r[2]) / aw, v1_ = 1 - r[1] / ah, v0 = 1 - (r[1] + r[3]) / ah;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, u0 + uv.getX(i) * (u1 - u0), v0 + uv.getY(i) * (v1_ - v0));
    return g;
  }
  // a textured quad showing atlas rect r (faces +Z before rotation: rx first, then ry)
  function tq(w, h, r, x, y, z, ry = 0, rx = 0, m = M.atlas, aw = 256, ah = 256, hex = 0xffffff) {
    const g = uvRect(new THREE.PlaneGeometry(w, h), r, aw, ah); if (rx) g.rotateX(rx); if (ry) g.rotateY(ry); g.translate(x, y, z); put(g, hex, m);
  }
  // world-space UVs: uv = (x, -z) / tile
  function wuv(g, tile) {
    const p = g.attributes.position, uv = g.attributes.uv;
    for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / tile, -p.getZ(i) / tile);
    return g;
  }
  function gnd(x0, z0, x1, z1, y, m, tile = 4, hex = 0xffffff) {
    const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0); g.rotateX(-H); g.translate((x0 + x1) / 2, y, (z0 + z1) / 2);
    put(wuv(g, tile), hex, m);
  }
  // a terrain strip along z between x0..x1 following prof = [[z, y], ...] (+ an optional colour per row)
  function strip(x0, x1, prof, m, tile, cols) {
    const pos = [], uv = [], col = [];
    for (let i = 0; i < prof.length - 1; i++) {
      const [za, ya] = prof[i], [zb, yb] = prof[i + 1];
      const ca = cols ? cols[i] : 0xffffff, cb = cols ? cols[i + 1] : 0xffffff;
      const P4 = [[x0, ya, za, ca], [x0, yb, zb, cb], [x1, ya, za, ca], [x1, ya, za, ca], [x0, yb, zb, cb], [x1, yb, zb, cb]];
      for (const [x, y, z, c] of P4) { pos.push(x, y, z); uv.push(x / tile, -z / tile); tc.set(c).multiplyScalar(gain); col.push(tc.r, tc.g, tc.b); }
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
  // a vertical skirt below an XZ polyline (the headland face, seen from the water side)
  function skirt(pts, y0, y1, hex, m) {
    const pos = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, az] = pts[i], [bx, bz] = pts[i + 1];
      pos.push(ax, y1, az, ax, y0, az, bx, y1, bz, bx, y1, bz, ax, y0, az, bx, y0, bz);
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals();
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
  const at = (x, z, ry = 0) => (XF = m4.makeRotationY(ry).setPosition(x, 0, z));
  const smooth = (u) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
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
  // atlas (256 x 256): t_sign26 (the council sign, painted at 2x the spec's 128 x 64 so it reads), the bin sticker
  const A_SIGN = [0, 0, 256, 128], A_BIN = [0, 128, 128, 64];
  function paintAtlas(c) {
    c.fillStyle = '#808080'; c.fillRect(0, 0, 256, 256);
    // WOODY POINT FORESHORE: routed brown timber, cream letters, a cream border
    c.fillStyle = '#5a3a26'; c.fillRect(0, 0, 256, 128);
    seed = 11; for (let i = 0; i < 46; i++) { c.fillStyle = rnd() > 0.5 ? 'rgba(36,20,10,0.32)' : 'rgba(128,86,56,0.28)'; c.fillRect(0, Math.floor(rnd() * 128), 256, 1); }
    c.strokeStyle = '#f2ead6'; c.lineWidth = 3; rrect(c, 7.5, 7.5, 241, 113, 8); c.stroke();
    for (const [s, y, px] of [['WOODY POINT', 34, 31], ['FORESHORE', 67, 31]]) { text(c, s, 129, y + 1.5, px, 'rgba(20,10,4,0.55)'); text(c, s, 128, y, px, '#f2ead6'); }
    c.fillStyle = '#f2ead6'; c.fillRect(44, 87, 168, 2);
    text(c, 'Please take your rubbish home', 128, 105, 15, '#f2ead6', 'center', 'bold', 228);
    // the bin sticker: white, the tidy figure, RUBBISH ONLY
    c.fillStyle = '#2f5a3a'; c.fillRect(0, 128, 128, 64);
    c.fillStyle = '#f4f4ee'; rrect(c, 4, 132, 120, 56, 6); c.fill();
    c.fillStyle = '#2a2a2a'; c.beginPath(); c.arc(22, 145, 4, 0, TAU); c.fill();
    c.fillRect(19, 150, 6, 14); c.fillRect(19, 163, 2.5, 12); c.fillRect(22.5, 163, 2.5, 12);
    c.save(); c.translate(24, 153); c.rotate(-0.9); c.fillRect(0, -1.5, 10, 3); c.restore();
    c.fillRect(31, 156, 3, 3); c.fillRect(33, 163, 12, 13); c.fillRect(32, 162, 14, 2);
    text(c, 'RUBBISH', 86, 150, 15, '#1c1c1c'); text(c, 'ONLY', 86, 166, 15, '#1c1c1c');
    text(c, 'no hot ashes', 86, 180, 9, '#555555', 'center', 'normal');
    // spare cells: a plain cream panel and the brown (sign back / edge)
    c.fillStyle = '#f2ead6'; c.fillRect(128, 128, 64, 64); c.fillStyle = '#5a3a26'; c.fillRect(192, 128, 64, 64);
  }
  function textures() {
    if (T) return T;
    T = {};
    const K = (k, o) => Object.assign({ key: 'f26_' + k, nearest: true }, o);
    T.atlas = canvasTex(256, 256, paintAtlas, K('atlas'));
    const noise = (base, cols, n, s, sz = 2) => (c, w, h) => { c.fillStyle = base; c.fillRect(0, 0, w, h); seed = s; for (let i = 0; i < n; i++) { c.fillStyle = cols[Math.floor(rnd() * cols.length)]; c.fillRect(Math.floor(rnd() * w), Math.floor(rnd() * h), sz, sz); } };
    // grass with dew: #86b552 base, #b8d890 dew glints, a few dark blades
    T.grass = canvasTex(128, 128, (c, w, h) => {   // 128 px over 3 m: A2 shoots the grass from a metre away
      noise('#86b552', ['#7aa84a', '#92c05e', '#729e44', '#9ac866', '#80ae4e'], 2400, 3)(c, w, h);
      c.fillStyle = 'rgba(62,100,36,0.45)'; for (let i = 0; i < 260; i++) c.fillRect(Math.floor(rnd() * w), Math.floor(rnd() * h), 1, 2 + Math.floor(rnd() * 3));
      c.fillStyle = 'rgba(170,206,120,0.6)'; for (let i = 0; i < 160; i++) c.fillRect(Math.floor(rnd() * w), Math.floor(rnd() * h), 1, 2);
      c.fillStyle = '#b8d890'; for (let i = 0; i < 90; i++) c.fillRect(Math.floor(rnd() * w), Math.floor(rnd() * h), 1, 1);
      c.fillStyle = '#e4f0d4'; for (let i = 0; i < 24; i++) c.fillRect(Math.floor(rnd() * w), Math.floor(rnd() * h), 1, 1);   // dew glints
    }, K('grass', { repeat: [1, 1] }));
    // path concrete #cfc8ba: speckle + one expansion joint per tile (1.6 m) across the path
    T.conc = canvasTex(64, 64, (c, w, h) => {
      noise('#cfc8ba', ['#c6bfb0', '#d6d0c4', '#c2bbac', '#dcd6ca'], 700, 12, 1)(c, w, h);
      c.fillStyle = 'rgba(150,140,124,0.18)'; for (let i = 0; i < 5; i++) c.fillRect(Math.floor(rnd() * w), Math.floor(rnd() * h), 3 + Math.floor(rnd() * 5), 2);
      c.fillStyle = '#9a9284'; c.fillRect(0, 0, 1, h); c.fillStyle = '#ddd8cd'; c.fillRect(1, 0, 1, h);
    }, K('conc', { repeat: [1, 1] }));
    T.ripple = canvasTex(128, 128, (c, w, h) => {
      c.fillStyle = '#e8f4f8'; c.fillRect(0, 0, w, h); seed = 17;
      for (let i = 0; i < 160; i++) { const x = rnd() * w, y = rnd() * h, l = 6 + rnd() * 18; c.fillStyle = rnd() > 0.45 ? 'rgba(176,212,228,0.7)' : 'rgba(255,255,255,0.85)'; c.fillRect(x, y, l, 2); c.fillRect(x - w, y, l, 2); }
    }, K('ripple', { repeat: [1, 1] }));
    T.foam = canvasTex(64, 32, (c, w, h) => {
      c.clearRect(0, 0, w, h); seed = 2;
      for (let i = 0; i < 120; i++) { const x = rnd() * w, y = 8 + rnd() * 16 + Math.sin(x * 0.2) * 3; c.fillStyle = `rgba(255,255,255,${(0.4 + rnd() * 0.5).toFixed(2)})`; c.beginPath(); c.arc(x, y, 1.2 + rnd() * 2.4, 0, TAU); c.fill(); }
    }, K('foam', { repeat: [1, 1] }));
    // thin, high fair-weather cumulus (flatter than parade's)
    T.cloud = canvasTex(128, 64, (c, w, h) => {
      c.clearRect(0, 0, w, h);
      for (const [x, y, r] of [[26, 40, 13], [44, 34, 17], [66, 31, 19], [88, 34, 16], [106, 40, 11], [56, 41, 15], [80, 42, 12]]) {
        c.save(); c.translate(x, y); c.scale(1, 0.62);
        const g = c.createRadialGradient(0, -r * 0.3, r * 0.2, 0, 0, r); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.7, 'rgba(244,248,252,0.92)'); g.addColorStop(1, 'rgba(230,238,246,0)');
        c.fillStyle = g; c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fill(); c.restore();
      }
      c.fillStyle = 'rgba(196,210,224,0.3)'; c.fillRect(18, 44, 92, 4);
    }, K('cloud'));
    T.halo = canvasTex(128, 128, (c, w, h) => { const g = c.createRadialGradient(64, 64, 4, 64, 64, 63); g.addColorStop(0, 'rgba(255,255,250,1)'); g.addColorStop(0.18, 'rgba(255,250,236,0.8)'); g.addColorStop(0.45, 'rgba(255,246,222,0.26)'); g.addColorStop(1, 'rgba(255,242,216,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); }, { key: 'f26_halo' });
    T.haze = canvasTex(4, 64, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.75, 'rgba(255,255,255,0.3)'); g.addColorStop(1, 'rgba(255,255,255,1)'); c.fillStyle = g; c.fillRect(0, 0, w, h); }, { key: 'f26_haze' });
    return T;
  }

  // ---------------------------------------------------------- materials (cached: mat()/matTex(), or created once here)
  function skyMats() {
    if (SKY) return SKY;
    const B = (o) => new THREE.MeshBasicMaterial(Object.assign({ fog: false }, o)), DS = THREE.DoubleSide, ADD = THREE.AdditiveBlending;
    SKY = {
      land: B({ vertexColors: true, side: DS, color: 0xeef2f6 }),                     // horizon silhouettes, morning tint
      skirt: B({ color: 0xdfe8ec, side: DS }),                                         // copies the live fog colour
      haze: B({ map: T.haze, transparent: true, depthWrite: false, side: DS, color: 0xdfe8ec }),
      bridge: B({ vertexColors: true, color: 0xf2f4f6 }),
      lamp: B({ color: 0xc4cacc }),                                                    // lamp heads, off at 7 am
      car: B({ vertexColors: true }),                                                  // + instanceColor (body paint)
      sun: B({ color: 0xfffcf0 }),
      halo: B({ map: T.halo, color: 0xfff4d8, transparent: true, opacity: 0.85, depthWrite: false, blending: ADD }),
      cloud: B({ map: T.cloud, transparent: true, depthWrite: false, side: DS, color: 0xf0f4f8 }),
    };
    return SKY;
  }
  function grassMat() {   // the tufts: Lambert + a wind sway in the vertex shader (uTime = wind phase, uWind 1 .. 1.8)
    if (GRASSM) return GRASSM;
    const m = new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true, flatShading: true });
    m.userData.uTime = { value: 0 }; m.userData.uWind = { value: 1 };
    m.onBeforeCompile = (sh) => {
      sh.uniforms.uTime = m.userData.uTime; sh.uniforms.uWind = m.userData.uWind;
      sh.vertexShader = 'uniform float uTime;\nuniform float uWind;\n' + sh.vertexShader.replace('#include <begin_vertex>', [
        '#include <begin_vertex>',
        '#ifdef USE_INSTANCING',
        '  float ph = instanceMatrix[3].x * 0.37 + instanceMatrix[3].z * 0.23;',
        '#else',
        '  float ph = 0.0;',
        '#endif',
        '  float k = max(position.y, 0.0) * 3.2, g = uWind - 1.0;',
        '  transformed.x += (sin(uTime * 1.7 + ph) * 0.06 * uWind - g * 0.1) * k;',
        '  transformed.z += (cos(uTime * 1.3 + ph * 1.3) * 0.035 * uWind - g * 0.03) * k;'].join('\n'));
    };
    m.customProgramCacheKey = () => 'f26_grass_sway';
    return (GRASSM = m);
  }
  function initMats() {
    const DS = THREE.DoubleSide;
    M = {
      vc: mat(0xffffff), vc2: mat(0xffffff, { side: DS }),
      atlas: matTex(T.atlas, { emissive: 0xffffff, emissiveIntensity: 0.12 }),
      grass: matTex(T.grass), conc: matTex(T.conc),
      water: matTex(T.ripple), foam: matTex(T.foam, { transparent: true }),
    };
    skyMats();
  }

  // ---------------------------------------------------------- far group (MeshBasicMaterial, fog: false), as parade Region W
  const sstep = (a, b2, x) => smooth((x - a) / (b2 - a));
  function profile(a) {   // silhouette height (m) at bearing a (degrees, from +Z toward +X): parade's Region W profile
    const n = Math.sin(a * 0.31) * 0.5 + Math.sin(a * 0.73 + 1.3) * 0.3 + Math.sin(a * 1.9 + 0.4) * 0.2;
    const main = sstep(-80, -72, a) * (1 - sstep(36, 44, a));
    const pen = sstep(36, 46, a) * (1 - sstep(104, 112, a));
    const inland = 1 - sstep(-112, -100, a) * (1 - sstep(100, 112, a));
    return main * (1.6 + 0.9 * n) + pen * (3 + 7 * sstep(40, 100, a) + 1.4 * n) + inland * (18 + 10 * n);
  }
  function silhouettes(wy) {   // the mainland shore behind the bridge, the peninsula curving off to the left, hills inland
    const N = 240, r = 470, pos = [], col = [];
    const cTop = [0x8aa6b4, 0x84a292], cBot = 0xa4c0cc;
    for (let i = 0; i < N; i++) {
      const a0 = -180 + i * 360 / N, a1 = a0 + 360 / N, h0 = profile(a0), h1 = profile(a1);
      if (h0 < 0.2 && h1 < 0.2) continue;
      const r0 = a0 * PI / 180, r1 = a1 * PI / 180, x0 = Math.sin(r0) * r, z0 = Math.cos(r0) * r, x1 = Math.sin(r1) * r, z1 = Math.cos(r1) * r;
      const top = Math.abs(a0) > 100 ? cTop[1] : cTop[0];
      for (const [x, y, z, c] of [[x0, wy + h0, z0, top], [x0, wy - 1, z0, cBot], [x1, wy + h1, z1, top], [x1, wy + h1, z1, top], [x0, wy - 1, z0, cBot], [x1, wy - 1, z1, cBot]]) { pos.push(x, y, z); tc.set(c); col.push(tc.r, tc.g, tc.b); }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.computeVertexNormals(); return g;
  }
  // the deck profile: 5 m over the water, a 9 m hump at 55 % (same numbers as parade)
  const hAt = (u) => WY + 5 + 4 * Math.exp(-(((u - 0.55) / 0.13) ** 2));
  const dhdu = (u) => -4 * 2 * (u - 0.55) / (0.13 * 0.13) * Math.exp(-(((u - 0.55) / 0.13) ** 2));
  function bridgeGeo(A, B, lamps) {   // the Ted Smout Bridge from 370 m: deck sides + top, low parapets, piers, lamp posts (or heads)
    const dx = B[0] - A[0], dz = B[2] - A[2], L = Math.hypot(dx, dz), ux = dx / L, uz = dz / L, nx = -uz * 5, nz = ux * 5;
    const pos = [], col = [];
    const tri = (p, c) => { for (const q of p) pos.push(q[0], q[1], q[2]); tc.set(c); for (let i = 0; i < p.length; i++) col.push(tc.r, tc.g, tc.b); };
    const bx3 = (cx, cy, cz, hw, hh, hd, c) => {   // axis-aligned along the bridge (hw across, hd along)
      const P = (sx, sy, sz) => [cx + sx * nx / 5 * hw + sz * ux * hd, cy + sy * hh, cz + sx * nz / 5 * hw + sz * uz * hd];
      const f = [[[-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]], [[1, -1, -1], [-1, -1, -1], [-1, 1, -1], [1, 1, -1]], [[-1, -1, -1], [-1, -1, 1], [-1, 1, 1], [-1, 1, -1]], [[1, -1, 1], [1, -1, -1], [1, 1, -1], [1, 1, 1]], [[-1, 1, 1], [1, 1, 1], [1, 1, -1], [-1, 1, -1]]];
      for (const q of f) { const v = q.map(([a, b2, c2]) => P(a, b2, c2)); tri([v[0], v[1], v[2], v[0], v[2], v[3]], c); }
    };
    if (!lamps) {
      const N = 48, PH = 0.55;   // parapet: a low barrier (parade 2040: 0.9) so the 2026 cars' cabins show above it
      for (let i = 0; i < N; i++) {
        const u0 = i / N, u1 = (i + 1) / N, x0 = A[0] + dx * u0, z0 = A[2] + dz * u0, x1 = A[0] + dx * u1, z1 = A[2] + dz * u1, y0 = hAt(u0), y1 = hAt(u1);
        for (const s of [1, -1]) {   // both sides: concrete face + a dark underside line + the parapet
          const ax = x0 + nx * s, az = z0 + nz * s, bx = x1 + nx * s, bz = z1 + nz * s;
          tri([[ax, y0, az], [ax, y0 - 1.2, az], [bx, y1, bz], [bx, y1, bz], [ax, y0 - 1.2, az], [bx, y1 - 1.2, bz]], 0xb4c0c8);
          tri([[ax, y0 - 1.2, az], [ax, y0 - 1.6, az], [bx, y1 - 1.2, bz], [bx, y1 - 1.2, bz], [ax, y0 - 1.6, az], [bx, y1 - 1.6, bz]], 0x4c565e);
          tri([[ax, y0 + PH, az], [ax, y0, az], [bx, y1 + PH, bz], [bx, y1 + PH, bz], [ax, y0, az], [bx, y1, bz]], 0xc8d0d6);
        }
        tri([[x0 + nx, y0, z0 + nz], [x1 + nx, y1, z1 + nz], [x1 - nx, y1, z1 - nz], [x0 + nx, y0, z0 + nz], [x1 - nx, y1, z1 - nz], [x0 - nx, y0, z0 - nz]], 0x8a949c);
      }
      for (let k = 0; k < 12; k++) { const u = (k + 0.5) / 12, x = A[0] + dx * u, z = A[2] + dz * u, top = hAt(u) - 1.6; bx3(x, (WY + top) / 2, z, 3.2, (top - WY) / 2, 0.9, 0x98a4ac); }
      for (let k = 0; k < 17; k++) { const u = (k + 0.5) / 17, x = A[0] + dx * u + nx * 0.9, z = A[2] + dz * u + nz * 0.9; bx3(x, hAt(u) + 2.4, z, 0.12, 2.4, 0.12, 0x9aa4ac); }
    } else for (let k = 0; k < 17; k++) { const u = (k + 0.5) / 17, x = A[0] + dx * u + nx * 0.9, z = A[2] + dz * u + nz * 0.9; bx3(x, hAt(u) + 4.9, z, 0.5, 0.25, 0.5, 0xffffff); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.computeVertexNormals(); return g;
  }
  function car2026() {   // a small 2026 hatch on four wheels: origin on the road, front +Z, 4.2 x 1.75 (body white: instance colour paints it)
    const W = 0xffffff, GL = 0x56626e, TY = 0x1a1a1c;
    bb(-0.86, 0.3, -2.05, 0.86, 0.86, 2.1, W); bb(-0.84, 0.86, 1.1, 0.84, 0.94, 2.06, W);   // body + bonnet
    bb(-0.78, 0.86, -1.6, 0.78, 1.36, 0.95, GL); bb(-0.74, 1.36, -1.5, 0.74, 1.46, 0.75, W);  // glasshouse + roof
    bb(-0.88, 0.22, -2.1, 0.88, 0.36, 2.14, 0x3a3e44);                                       // bumpers / sills
    for (const sx of [-1, 1]) { bb(sx * 0.6 - 0.16, 0.6, 2.1, sx * 0.6 + 0.16, 0.74, 2.15, 0xd8dcd8); bb(sx * 0.62 - 0.14, 0.62, -2.11, sx * 0.62 + 0.14, 0.76, -2.06, 0x8a1c1c); }
    for (const [x, z] of [[0.8, 1.3], [-0.8, 1.3], [0.8, -1.3], [-0.8, -1.3]]) cyl(0.32, 0.32, 0.24, 10, TY, x, 0.32, z, 0, H);
  }
  function buildFar(parent) {
    const add = (g, name) => { g.name = name; parent.add(g); return g; };
    R.band = add(new THREE.Mesh(silhouettes(WY), SKY.land), 'band');
    const hz = new THREE.CylinderGeometry(480, 480, 34, 48, 1, true); hz.translate(0, WY - 1 + 17, 0);
    add(new THREE.Mesh(hz, SKY.haze), 'haze').renderOrder = -2;
    const sk = new THREE.CylinderGeometry(476, 476, 80, 48, 1, true); sk.translate(0, WY - 40.6, 0);
    add(new THREE.Mesh(sk, SKY.skirt), 'skirt');
    add(new THREE.Mesh(bridgeGeo(BR_A, BR_B, false), SKY.bridge), 'bridge');
    add(new THREE.Mesh(bridgeGeo(BR_A, BR_B, true), SKY.lamp), 'bridge_lamps');
    // 8 cars (2026: wheels, headlights off), two lanes, keeping left: A->B on the far (+Z) side, B->A on the near side
    const dx = BR_B[0] - BR_A[0], dz = BR_B[2] - BR_A[2], L = Math.hypot(dx, dz);
    R.br = { dx, dz, L, nx: -dz / L, nz: dx / L, yaw: Math.atan2(dx, dz) };
    R.carS = [];
    const PAINT = [0xf2f2f0, 0xb02a2a, 0xc8ccd0, 0x2a4a8a, 0x1e1e22, 0xe8e2d4, 0x6a7078, 0x3a7a8a];
    for (let i = 0; i < 8; i++) {
      const dir = i % 2 ? -1 : 1, van = i === 3 || i === 6;
      R.carS.push({ u: ((i * 0.27 + (i % 2) * 0.11) % 1), dir, v: 16.7 * (0.9 + ((i * 37) % 10) / 50), lane: dir > 0 ? -2.2 : 2.2, s: van ? [1.06, 1.3, 1.18] : [1, 1, 1] });
    }
    R.carIM = dyn(IM(geoOf(car2026), SKY.car, R.carS.map(() => [0, -60, 0, 0]), 'bridge_cars', parent));
    for (let i = 0; i < 8; i++) R.carIM.setColorAt(i, tc.set(PAINT[i]));
    R.carIM.instanceColor.needsUpdate = true;
    // the sun (low, east: off to the left of wp_canon) + a soft additive halo
    const sun = add(new THREE.Group(), 'sun');
    sun.add(new THREE.Mesh(new THREE.CircleGeometry(9, 24), SKY.sun));
    const halo = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), SKY.halo); halo.position.z = 0.5; halo.renderOrder = 2; sun.add(halo);
    const Ls = Math.hypot(SUN_D[0], SUN_D[1], SUN_D[2]);
    sun.position.set(SUN_D[0] / Ls * 420, SUN_D[1] / Ls * 420 + WY, SUN_D[2] / Ls * 420); sun.lookAt(0, 0, 0);
    // 6 thin, high cumulus cards facing the origin
    const pos = [], uv = [];
    seed = 97;
    for (let i = 0; i < 6; i++) {
      const a = (-140 + i * 50 + rnd() * 16) * PI / 180, d = 310 + rnd() * 150, y = WY + 85 + rnd() * 70, w = 80 + rnd() * 60, h = w * 0.36;
      const cx = Math.sin(a) * d, cz = Math.cos(a) * d, ex = Math.cos(a) * w / 2, ez = -Math.sin(a) * w / 2;
      for (const [px, py, pz, u, v] of [[cx - ex, y - h / 2, cz - ez, 0, 0], [cx + ex, y - h / 2, cz + ez, 1, 0], [cx + ex, y + h / 2, cz + ez, 1, 1], [cx - ex, y - h / 2, cz - ez, 0, 0], [cx + ex, y + h / 2, cz + ez, 1, 1], [cx - ex, y + h / 2, cz - ez, 0, 1]]) { pos.push(px, py, pz); uv.push(u, v); }
    }
    const cg = new THREE.BufferGeometry(); cg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); cg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); cg.computeVertexNormals();
    R.clouds = add(new THREE.Mesh(cg, SKY.cloud), 'clouds'); R.clouds.renderOrder = -1;
  }
  function waterPlane(y, z0, z1) {   // a big opaque fogged plane, near -> far colour, world UVs (1120 x 1090)
    const zs = [z0, z0 + 20, z0 + 60, z0 + 140, z0 + 300, z1], cs = [WNEAR, 0x72c2da, 0x66b9d4, 0x58afce, WFAR, WFAR];
    gain = 1.9; strip(-560, 560, zs.map((z) => [z, y]), M.water, 7, cs); gain = 1;   // lifted so the bay reads #7cc8dc / #4aa4c6 under the rig
  }

  // ---------------------------------------------------------- the headland
  function gullBody() {   // origin at the body centre, facing +Z (0.42 m)
    const g = new THREE.IcosahedronGeometry(0.09, 0); g.scale(0.9, 0.8, 2.3); put(g, 0xf4f4f0);
    ico(0.065, 0xf4f4f0, 0, 0.04, 0.19); boxR(0.025, 0.02, 0.08, 0xf0c040, 0, 0.03, 0.27, 0.15);
    boxR(0.1, 0.02, 0.12, 0xd8dade, 0, 0.01, -0.22); bb(-0.015, 0.04, 0.215, 0.015, 0.055, 0.23, 0x1a1a1a);
  }
  function gullWing() {   // along +X from the shoulder (local origin): 0.55 m, grey mantle, black tip
    boxR(0.3, 0.018, 0.16, 0xb8bec6, 0.15, 0, 0); boxR(0.22, 0.016, 0.11, 0xb0b6be, 0.4, 0, -0.02, 0, 0.12); boxR(0.08, 0.014, 0.08, 0x1c1c1c, 0.53, 0, -0.04, 0, 0.2);
  }
  function cup() {   // a takeaway coffee (origin at its base): white cup, brown sleeve, lid with a sip hole
    cyl(0.043, 0.031, 0.12, 10, 0xf4f2ec, 0, 0.064, 0);
    cyl(0.0425, 0.036, 0.046, 10, 0x9a6a3e, 0, 0.068, 0);
    cyl(0.046, 0.046, 0.012, 10, 0xf8f8f6, 0, 0.13, 0); cyl(0.038, 0.044, 0.01, 10, 0xeeeeea, 0, 0.14, 0);
    bb(0.012, 0.144, -0.006, 0.028, 0.1465, 0.006, 0x3a2a20);
  }
  function build() {
    COL.length = 0; T = textures(); initMats();
    const root = new THREE.Group(); root.name = 'foreshore26_root'; R.root = root;
    const add = (g) => (root.add(g), g);
    b = new Builder(); XF = null;
    // ---- ground: grass to the shoreline, the sandstone face + coping, the path, the garden bed + shrubs, pigface
    poly([...COAST, [200, -480], [-200, -480]], 0, M.grass, 3);
    skirt(COAST, -3.4, 0.0, SANDST);
    for (let i = 2; i < 7; i++) { const [ax, az] = COAST[i], [bx, bz] = COAST[i + 1]; const L = Math.hypot(bx - ax, bz - az); const g = new THREE.BoxGeometry(L, 0.16, 0.5); g.rotateY(-Math.atan2(bz - az, bx - ax)); g.translate((ax + bx) / 2, 0.02, (az + bz) / 2); put(g, 0xe2cc9c); }
    gnd(-40, -9.1, 40, -6.9, 0.02, M.conc, 1.6);                                              // the path (concrete)
    for (const z of [-9.1, -6.9]) bb(-40, 0, z - 0.04, 40, 0.035, z + 0.04, 0xbdb6a8);        // its edges
    gnd(-40, -11.6, 40, -9.5, 0.012, M.vc, 2, 0x6a5a40);                                     // garden bed
    seed = 33; for (let x = -39; x < 40; x += 1.5 + rnd() * 1.2) ico(0.36 + rnd() * 0.18, [0x4f8a3e, 0x5c9644, 0x68a04c, 0x5a8a50][Math.floor(rnd() * 4)], x, 0.16, -10.7 + rnd() * 0.5, 0.55);
    for (const [x, z, r] of [[-12.5, 5.7, 0.5], [-7.2, 5.9, 0.38], [-3.8, 5.6, 0.32], [4.6, 5.8, 0.42], [8.8, 5.6, 0.36], [13.4, 5.8, 0.5]]) { ico(r, 0x5a8a48, x, r * 0.35, z, 0.55); ico(r * 0.7, 0x6c9a50, x + r * 0.7, r * 0.25, z - 0.2, 0.5); }   // pigface by the railing
    // ---- railing: two galvanised rails (posts instanced)
    for (const y of [0.55, 1.05]) bb(-22, y - 0.03, 6.47, 22, y + 0.03, 6.53, GALV);
    // ---- pandanus (-18,4) (17,5), road + verge inland, the pines' trunks
    for (const [x, z] of PANDANUS) {
      for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; boxR(0.05, 0.9, 0.05, 0x8a7a5a, x + Math.sin(a) * 0.25, 0.4, z + Math.cos(a) * 0.25, Math.cos(a) * 0.3, 0, -Math.sin(a) * 0.3); }
      cyl(0.12, 0.14, 2.0, 6, 0x8a7a5a, x, 1.6, z);
      for (let k = 0; k < 14; k++) { const a = k / 14 * TAU, t = 0.6 + (k % 3) * 0.3; boxR(0.12, 0.03, 1.4, k % 2 ? 0x5a8a4a : 0x6a9a52, x + Math.sin(a) * 0.5, 2.7 + (k % 3) * 0.12, z + Math.cos(a) * 0.5, t, a); }
    }
    gnd(-200, -48, 200, -44, 0.01, M.vc, 6, 0x5a5d62); gnd(-200, -44, 200, -43.4, 0.015, M.vc, 2, 0xc8c2b4);
    for (let x = -196; x < 200; x += 9) bb(x, 0.011, -46.08, x + 3, 0.014, -45.92, 0xe8e6de);   // centre line
    for (const [x, z, h] of PINES) cyl(0.08 * 1.5, 0.24 * 1.5, h, 6, 0x6a5240, x, h / 2, z);
    root.add(b.done());

    // ---- instanced: railing posts, pine tiers, rocks, houses, grass tufts, jetty piles, blob shadows
    R.posts = IM(geoOf(() => bb(-0.04, 0, -0.04, 0.04, 1.1, 0.04, GALV), { floor: true }), M.vc, new Array(23).fill(0).map((_, i) => [-22 + i * 2, 0, 6.5, 0]), 'railing_w', root);
    const tierG = geoOf(() => { const g = new THREE.ConeGeometry(1, 1.6, 9, 2); g.translate(0, 0.5, 0); const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const r = Math.hypot(p.getX(i), p.getZ(i)); if (r > 0.5) p.setY(i, p.getY(i) - (r - 0.5) * 0.35); } put(g, PINE); ico(0.3, 0x3a6a44, 0, 1.25, 0, 1.6); });
    const tiers = [];
    for (const [x, z, h] of PINES) for (let t = 0; t < 8; t++) { const k = 1 - t / 8; tiers.push([x, h * (0.22 + t * 0.098), z, t * 0.9, [0.6 + h * 0.15 * k, 1.0 + 0.6 * k, 0.6 + h * 0.15 * k]]); }
    R.pines = IM(tierG, M.vc, tiers, 'pines', root);
    seed = 19; const rocks = [];
    for (let i = 0; i < 40; i++) { const s = 2 + Math.floor(rnd() * 4), [ax, az] = COAST[s], [bx, bz] = COAST[s + 1], u = rnd(); rocks.push([ax + (bx - ax) * u + rnd() * 1.2, -2.4 + rnd() * 0.7, az + (bz - az) * u + 1.2 + rnd() * 2.2, rnd() * 3, [0.8 + rnd() * 0.8, 0.6 + rnd() * 0.5, 0.8 + rnd() * 0.7]]); }
    IM(geoOf(() => ico(0.9, ROCK, 0, 0, 0, 0.8)), M.vc, rocks, 'rocks', root);
    const houses = []; seed = 23; for (let i = 0; i < 12; i++) houses.push([-80 + i * 14 + rnd() * 4, 0, -57 - rnd() * 8, (rnd() - 0.5) * 0.2, [9 + rnd() * 3, 1, 8 + rnd() * 2]]);
    const hIM = IM(geoOf(() => {   // a low brick-veneer house facing the bay (scaled per instance: 9-12 m wide)
      bb(-0.5, 0, -0.5, 0.5, 3.0, 0.5, 0xffffff); const g = new THREE.ConeGeometry(0.75, 1.6, 4); g.rotateY(PI / 4); g.translate(0, 3.8, 0); put(g, 0xa85a3a);
      for (const x of [-0.34, -0.16, 0.22, 0.38]) bb(x - 0.065, 1.0, 0.5, x + 0.065, 2.1, 0.515, 0x4a5662);
      bb(0.02, 0, 0.5, 0.1, 2.2, 0.515, 0x8a6648); bb(-0.5, 0, 0.5, 0.5, 0.35, 0.52, 0xd8d0c4);
    }, { floor: true }), M.vc, houses, 'houses', root);
    const trees = []; seed = 41; for (let i = 0; i < 14; i++) trees.push([-86 + i * 13 + rnd() * 5, 0, -50.5 - rnd() * 3 - (i % 3 === 0 ? 14 : 0), rnd() * 3, 0.8 + rnd() * 0.5]);
    IM(geoOf(() => { cyl(0.18, 0.26, 3.2, 6, 0x6a5a48, 0, 1.6, 0); ico(2.3, 0x4f7a3e, 0, 4.4, 0, 0.85); ico(1.6, 0x5c8a46, 0.9, 5.0, 0.6, 0.8); }), M.vc, trees, 'street_trees', root);
    for (let i = 0; i < 12; i++) hIM.setColorAt(i, tc.set([0xf4f0e8, 0xe8ecf0, 0xf0e4d8, 0xe4ecdc][i % 4]));
    // grass tufts: parade's field (same seed, same rules) without the bench hole; only the two sitting spots + the coffees are kept clear
    const tufts = []; seed = 29;
    while (tufts.length < 320) { const near = tufts.length < 220, x = near ? -18 + rnd() * 36 : -34 + rnd() * 68, z = near ? -16 + rnd() * 22 : -44 + rnd() * 50; if (z > 5.6 || (z > -11.8 && z < -6.6) || (x > -0.75 && x < 0.95 && z > -0.1 && z < 1.0) || (Math.abs(x - 14) < 2.3 && Math.abs(z + 12) < 2.3)) continue; tufts.push([x, 0, z, rnd() * 3, 0.8 + rnd() * 0.6]); }
    const blade = (h, w, lean, a, col) => {   // a flat tapering blade leaning out from the tuft's centre
      const g = new THREE.ConeGeometry(w, h, 3, 1); g.scale(1, 1, 0.35); g.translate(0, h / 2, 0); g.rotateX(lean); g.rotateY(a); g.translate(Math.sin(a) * 0.025, 0, Math.cos(a) * 0.025); put(g, col);
    };
    const BLADE = [0x8fbe58, 0x7cac4a, 0xa8cc78, 0x86b552, 0x74a444, 0x9ac866, 0x80b04e];
    R.grass = IM(geoOf(() => { for (let k = 0; k < 7; k++) blade(0.2 + (k % 3) * 0.04, 0.022, 0.18 + (k % 2) * 0.16, k / 7 * TAU + 0.3, BLADE[k]); }), grassMat(), tufts, 'grass_f26', root);
    R.grass.userData.gust = (on) => gust(on);
    // a finer, denser carpet over the walkable headland (the same sway; keeps A2's close shots on the grass alive)
    const fine = []; seed = 53;
    while (fine.length < 900) { const x = -17 + rnd() * 34, z = -10.4 + rnd() * 16.2; if ((z > -9.3 && z < -6.7) || (x > -0.8 && x < 1.0 && z > -0.15 && z < 1.05) || (Math.abs(x - 14) < 1.5 && Math.abs(z + 12) < 1.5)) continue; fine.push([x, 0, z, rnd() * TAU, 0.45 + rnd() * 0.4]); }
    IM(geoOf(() => { for (let k = 0; k < 5; k++) blade(0.16 + (k % 2) * 0.05, 0.018, 0.25 + (k % 3) * 0.1, k / 5 * TAU, BLADE[(k + 2) % 7]); }), grassMat(), fine, 'grass_fine', root);
    IM(geoOf(() => { cyl(0.15, 0.17, 4.6, 7, 0x5a4c3c, 0, 2.3, 0); bb(-0.04, 4.6, -0.04, 0.04, 5.6, 0.04, 0x9a8c76); }), M.vc, new Array(24).fill(0).map((_, i) => [i % 2 ? 27.15 : 24.85, -5.6, 5 + Math.floor(i / 2) * 3.1, 0]), 'woody_jetty_piles', root);
    if (typeof blobShadow === 'function') {   // soft contact shadows (the shared blob texture + material, one instanced draw)
      const bl = blobShadow();
      const list = [[BIN[0], 0.026, BIN[1] + 0.03, 0, 1.0], [SIGN[0], 0.026, SIGN[1] - 0.05, 0, 0.55], [SHELTER[0], 0.036, SHELTER[1], 0, 6.2], ...PANDANUS.map(([x, z]) => [x, 0.012, z, 0, 2.6]), ...PINES.map(([x, z]) => [x, 0.012, z, 0, 5.5])];
      R.cupBlob0 = list.length;   // the two coffees' contact shadows come last (hidden with the cups)
      for (const k of ['luka', 'chase']) list.push([CUP_HOME[k][0], 0.012, CUP_HOME[k][2], 0, 0.17]);
      R.blobs = IM(bl.geometry.clone(), bl.material, list, 'blobs', root); R.blobs.renderOrder = 1;
    }

    // ---- props: picnic shelter, council sign, bin, tinsel, coffees, Woody jetty, bell buoy
    R.shelter = add(part('shelter', () => {
      for (const [x, z] of [[-1.8, -1.8], [1.8, -1.8], [-1.8, 1.8], [1.8, 1.8]]) bb(x - 0.08, 0, z - 0.08, x + 0.08, 2.4, z + 0.08, 0x6a5a48);
      { const g = new THREE.ConeGeometry(3.0, 1.1, 4); g.rotateY(PI / 4); g.translate(0, 2.95, 0); put(g, 0x5a7a8a); }
      bb(-1.0, 0.7, -0.4, 1.0, 0.76, 0.4, 0x8a6a4a); for (const z of [-0.75, 0.75]) bb(-1.0, 0.42, z - 0.15, 1.0, 0.47, z + 0.15, 0x8a6a4a); bb(-0.08, 0, -0.08, 0.08, 0.7, 0.08, 0x6a5a48);
      bb(-1.3, 0, -1.3, 1.3, 0.03, 1.3, 0xc4beb2);   // slab
    }, [SHELTER[0], 0, SHELTER[1]]));
    R.sign = add(part('council_sign_26', () => {
      bb(-0.05, 0, -0.11, 0.05, 1.92, -0.03, 0x7a7e84);                                  // galvanised post (behind the board)
      bb(-0.58, 1.27, -0.03, 0.58, 1.87, 0.01, SIGNB);                                     // routed timber board
      bb(-0.6, 1.865, -0.04, 0.6, 1.9, 0.02, 0x4a2e1e);                                    // capping
      tq(1.12, 0.56, A_SIGN, 0, 1.57, 0.016);
    }, [SIGN[0], 0, SIGN[1]]));
    R.bin = add(part('bin_26', () => {   // a 240 L wheelie bin: front (sticker) faces the path (+Z), wheels + handle at the back
      boxR(0.52, 0.9, 0.5, BINB, 0, 0.5, 0.0, -0.035);                                   // body, a slight taper
      bb(-0.29, 0.94, -0.31, 0.29, 1.0, 0.3, BINL); bb(-0.27, 0.9, 0.26, 0.27, 0.97, 0.31, BINL);   // lid + its lip
      bb(-0.24, 0.88, -0.33, 0.24, 0.93, -0.27, 0x2a4a32);                                 // handle bar
      for (const sx of [-1, 1]) cyl(0.1, 0.1, 0.06, 10, 0x1c1c1c, sx * 0.285, 0.1, -0.22, 0, H);
      bb(-0.27, 0.06, -0.27, 0.27, 0.12, -0.21, 0x24442c);                                 // axle housing
      tq(0.3, 0.15, A_BIN, 0, 0.66, 0.249, 0, -0.035);
    }, [BIN[0], 0, BIN[1]]));
    // red tinsel tied round the railing post at x 3 (the knot on the land side; the two tails flutter)
    R.tinsel = add(new THREE.Group()); R.tinsel.name = 'tinsel_rail'; R.tinsel.position.set(TINSEL_X, 0, 6.5);
    // a garland: a thin red core with tufts of needles (7 crossed slivers each, silver flecks), two turns round the post
    const fuzz = (x, y, z, r) => { for (let k = 0; k < 7; k++) boxR(r * (1.6 + rnd() * 0.6), 0.005, 0.005, rnd() < 0.18 ? TSIL : TRED, x, y, z, rnd() * PI, rnd() * PI, rnd() * PI); };
    gain = 1.6;   // tinsel is shiny: lifted so it reads red against the backlit railing
    R.tinsel.add(part('tinsel_wrap', () => {
      seed = 61; const N = 22, P = [];
      for (let i = 0; i <= N; i++) { const a = PI + i / N * TAU * 1.5, y = 0.84 + 0.06 * i / N; P.push([Math.sin(a) * 0.054, y, Math.cos(a) * 0.054]); }
      for (let i = 0; i < N; i++) { seg(P[i][0], P[i][1], P[i][2], P[i + 1][0], P[i + 1][1], P[i + 1][2], 0.011, TRED); fuzz(P[i][0], P[i][1], P[i][2], 0.024); }
      for (const [x, y, z] of [[0, 0.9, -0.07], [0.02, 0.888, -0.066]]) fuzz(x, y, z, 0.03);   // the knot
    }, null, 0, { floor: false }));
    R.tail = part('tinsel_tail', () => {   // pivot at the knot; two short tails hanging toward the land
      seed = 67;
      for (const [sx, n] of [[-1, 6], [1, 5]]) {
        let px = 0, py = 0, pz = 0;
        for (let i = 1; i <= n; i++) { const x = sx * i * 0.012, y = -i * 0.026, z = 0; seg(px, py, pz, x, y, z, 0.01, TRED); fuzz(x, y, z, 0.024); px = x; py = y; pz = z; }
      }
    }, [0, 0.9, -0.07], 0, { floor: false });
    gain = 1;
    R.tinsel.add(R.tail);
    // the two takeaway coffees (separate meshes so content can put one in a hand: hold())
    R.coffees = add(new THREE.Group()); R.coffees.name = 'coffees';
    R.cups = {};
    for (const who of ['luka', 'chase']) { const h = CUP_HOME[who]; const g = part('coffee_' + who, cup, h, who === 'luka' ? 0.6 : -0.4, { floor: false }); R.coffees.add(g); R.cups[who] = { mesh: g, held: null, ry: g.rotation.y }; }
    R.coffees.userData.show = (who, on = true) => { for (const k in R.cups) if (who === 'both' || who === k || who == null) { R.cups[k].mesh.visible = !!on; cupBlob(k); } };
    R.coffees.userData.hold = (who, on = true, hand = 'L') => holdCup(who, on, hand);
    R.coffees.userData.home = () => releaseCups();
    R.wjetty = add(part('woody_jetty', () => {
      bb(24.8, -1.3, 4, 27.2, -1.0, 40, TIMBER); for (let z = 4.5; z < 40; z += 0.9) bb(24.81, -1.005, z, 27.19, -0.996, z + 0.04, 0x847664);
      for (const x of [24.85, 27.15]) for (const y of [-0.45, 0.0]) bb(x - 0.04, y, 4, x + 0.04, y + 0.06, 40, 0xb8aa94);
      for (let k = 0; k < 4; k++) bb(25.2, -1.0 + k * 0.25 - 0.25, 1.2 + k * 0.7, 26.8, -1.0 + k * 0.25, 1.9 + k * 0.7, 0xc8c0b0);
    }));
    R.buoy = add(part('bell_buoy', () => {
      cyl(0.9, 1.1, 0.7, 10, 0xd8323a, 0, 0.1, 0); for (let k = 0; k < 4; k++) { const a = k / 4 * TAU + 0.4; boxR(0.08, 2.2, 0.08, 0xc82a32, Math.sin(a) * 0.55, 1.4, Math.cos(a) * 0.55, Math.cos(a) * 0.22, 0, -Math.sin(a) * 0.22); }
      bb(-0.5, 2.4, -0.5, 0.5, 2.5, 0.5, 0xc82a32); cyl(0.2, 0.28, 0.4, 8, 0x5a5a5a, 0, 1.8, 0); cyl(0.05, 0.05, 0.6, 6, 0x3a3a3a, 0, 2.8, 0); cyl(0.12, 0.12, 0.1, 8, 0xf2f2ee, 0, 3.1, 0);
    }, BUOY, 0, { floor: false }));
    // ---- three gulls over the water (bodies + two wings each; matrices written by update)
    gain = 2.4; const gbG = geoOf(gullBody), gwG = geoOf(gullWing); gain = 1;   // white even from below (seen against the sky)
    R.gullB = dyn(IM(gbG, M.vc, [[0, -60, 0, 0], [0, -60, 0, 0], [0, -60, 0, 0]], 'gulls', root));
    R.gullW = dyn(IM(gwG, M.vc2, new Array(6).fill(0).map(() => [0, -60, 0, 0]), 'gull_wings', root));
    // ---- water + rock foam
    R.water = add(part('water', () => waterPlane(WY, -90, 1000), null, 0, { floor: false }));
    R.foam = add(part('foam', () => { for (let i = 2; i < 7; i++) { const [ax, az] = COAST[i], [bx, bz] = COAST[i + 1], L = Math.hypot(bx - ax, bz - az); const g = new THREE.PlaneGeometry(L, 1.6); g.rotateX(-H); g.rotateY(-Math.atan2(bz - az, bx - ax)); g.translate((ax + bx) / 2 - (bz - az) / L * 2.6, -2.56, (az + bz) / 2 + (bx - ax) / L * 2.6); put(wuv(g, 5), 0xffffff, M.foam); } }, null, 0, { floor: false }));
    // ---- far group
    buildFar(root);

    COL.push([-22, 6.3, 22, 6.7], [-17, -10.4, -16, 6.7], [16, -10.4, 17, 6.7], [-17, -10.4, 17, -10],
      [SIGN[0] - 0.2, SIGN[1] - 0.15, SIGN[0] + 0.2, SIGN[1] + 0.15], [BIN[0] - 0.3, BIN[1] - 0.3, BIN[0] + 0.3, BIN[1] + 0.3]);
    if (!R.hooked && typeof on === 'function') { R.hooked = true; on('flow:stop', () => releaseCups()); }   // never leave a cup in a rig's hand
    R.scene = typeof state !== 'undefined' && state ? state.scene : null;
    R.wind = R.windTo = 1; R.phase = 0; R.dressed = null;
    dress(AUTO[R.scene] || 'xmas26');
    return root;
  }

  // ---------------------------------------------------------- dressing + prop APIs
  const AUTO = { A2: 'xmas26' };
  const skipping = () => typeof flow !== 'undefined' && flow && flow.skipping;
  function gust(on) {   // step 20 "Wind.": uWind 1 -> 1.8 over 1 s (and back when off)
    R.windTo = on ? 1.8 : 1;
    if (skipping()) R.wind = R.windTo;
  }
  function holdCup(who, on, hand) {
    const c = R.cups && R.cups[who]; if (!c) return;
    if (!on) { releaseCup(c, who); return; }
    const a = typeof world !== 'undefined' && world.actors ? world.actors.get(who) : null;
    const g = a && a.rig && a.rig.attach ? a.rig.attach[hand === 'R' ? 'gripR' : 'gripL'] : null;
    if (!g) return;
    g.add(c.mesh); c.held = g;
    c.mesh.position.set(0, -0.02, -0.04); c.mesh.rotation.set(H, 0, 0);   // as the rigs' mug: upright when the forearm is c.mesh.scale.setScalar(1 / ((a.rig.d && a.rig.d.s) || 1));
    c.mesh.visible = true; cupBlob(who);
  }
  function releaseCup(c, who) {
    if (c.held) { R.coffees.add(c.mesh); c.held = null; }
    const h = CUP_HOME[who]; c.mesh.position.set(h[0], h[1], h[2]); c.mesh.rotation.set(0, c.ry, 0); c.mesh.scale.setScalar(1);
    cupBlob(who);
  }
  function cupBlob(who) {   // the contact shadow shows while the cup stands on the grass
    if (!R.blobs) return;
    const c = R.cups[who], i = R.cupBlob0 + (who === 'luka' ? 0 : 1), h = CUP_HOME[who], sc = c.mesh.visible && !c.held ? 0.17 : 0.0001;
    v1.set(h[0], 0.012, h[2]); q1.identity(); sv.set(sc, sc, sc); R.blobs.setMatrixAt(i, m4.compose(v1, q1, sv)); R.blobs.instanceMatrix.needsUpdate = true;
  }
  function releaseCups() { if (R.cups) for (const k in R.cups) releaseCup(R.cups[k], k); }
  function dress(st) {
    if (st !== 'xmas26' && st !== 'xmas26_empty') st = 'xmas26';
    if (!R.root) return;
    R.dressed = st;
    const empty = st === 'xmas26_empty';
    releaseCups();
    R.coffees.userData.show('both', !empty);
    gust(empty);
    if (empty) R.wind = Math.max(R.wind, 1);
  }

  // ---------------------------------------------------------- ambient life (no allocation)
  const GULL = [   // centre x, y, z, radius, angular speed (rad/s, sign = direction), phase
    [-6, 11, 34, 22, 0.32, 0.0], [14, 9, 48, 28, -0.26, 2.1], [2, 13, 26, 18, 0.38, 4.0],
  ];
  function gullTick(t) {
    for (let i = 0; i < 3; i++) {
      const G = GULL[i], th = t * G[4] + G[5], x = G[0] + Math.cos(th) * G[3], z = G[2] + Math.sin(th) * G[3], y = G[1] + 0.8 * Math.sin(th * 2 + i);
      const sg = G[4] > 0 ? 1 : -1, yaw = Math.atan2(-Math.sin(th) * sg, Math.cos(th) * sg);   // the tangent
      const cyc = (t + i * 3.7) % 6.5, flapping = cyc < 1.3, flap = flapping ? 0.5 * Math.sin(cyc * TAU * 2.6) : 0.1;
      eY.set(0, yaw, -0.32 * sg); q1.setFromEuler(eY); sv.set(1, 1, 1); v1.set(x, y, z); mA.compose(v1, q1, sv);
      R.gullB.setMatrixAt(i, mA);
      for (let s = 0; s < 2; s++) {
        e2.set(0, 0, s ? PI - flap : flap); mB.makeRotationFromEuler(e2); mB.setPosition(s ? -0.05 : 0.05, 0.03, 0.02);
        m4.multiplyMatrices(mA, mB); R.gullW.setMatrixAt(i * 2 + s, m4);
      }
    }
    R.gullB.instanceMatrix.needsUpdate = true; R.gullW.instanceMatrix.needsUpdate = true;
  }
  function carTick(dt) {
    const B = R.br;
    for (let i = 0; i < 8; i++) {
      const c = R.carS[i];
      c.u += c.dir * c.v * dt / B.L; if (c.u > 1) c.u -= 1; else if (c.u < 0) c.u += 1;
      const u = c.u, k = Math.min(1, u / 0.03, (1 - u) / 0.03), sl = dhdu(u) / B.L * c.dir;
      v1.set(BR_A[0] + B.dx * u + B.nx * c.lane, hAt(u), BR_A[2] + B.dz * u + B.nz * c.lane);
      eY.set(-Math.atan(sl), c.dir > 0 ? B.yaw : B.yaw + PI, 0); q1.setFromEuler(eY); sv.set(c.s[0] * k, c.s[1] * k, c.s[2] * k);
      R.carIM.setMatrixAt(i, m4.compose(v1, q1, sv));
    }
    R.carIM.instanceMatrix.needsUpdate = true;
  }
  function update(dt, ctx) {
    if (!R.root) return;
    const t = ctx.t;
    const sid = typeof state !== 'undefined' && state ? state.scene : null;
    if (sid !== R.scene) { R.scene = sid; dress(AUTO[sid] || 'xmas26'); }
    const W_ = typeof world !== 'undefined' ? world : null;
    if (W_ && W_.scene && W_.scene.fog && W_.setId === 'foreshore26') { SKY.skirt.color.copy(W_.scene.fog.color); SKY.haze.color.copy(W_.scene.fog.color); }
    // wind: eases toward its target at 0.8 / s (1 -> 1.8 in a second); the sway phase speeds up with it
    const dw = R.windTo - R.wind, mx = 0.8 * dt; R.wind += dw > mx ? mx : dw < -mx ? -mx : dw;
    R.phase += dt * (0.55 + 0.45 * R.wind);
    GRASSM.userData.uTime.value = R.phase; GRASSM.userData.uWind.value = R.wind;
    // tinsel: the tails stream downwind (toward -X: screen right in wp_canon / a2_grass), ±0.08 rad at 1.1 Hz × wind
    const w = R.wind, f = Math.sin(t * TAU * 1.1);
    R.tail.rotation.z = -0.5 - 0.5 * (w - 1) + 0.08 * w * f; R.tail.rotation.x = 0.2 + 0.06 * w * Math.sin(t * TAU * 1.43 + 1.2);
    // bell buoy: bob ±0.15, tilt ±0.12 rad, 4.2 s
    const ph = t * TAU / 4.2;
    R.buoy.position.y = WY + 0.15 * Math.sin(ph); R.buoy.rotation.z = 0.12 * Math.sin(ph + 1.1); R.buoy.rotation.x = 0.06 * Math.sin(ph * 0.7);
    gullTick(t);
    carTick(dt);
    // water ripple + foam scroll, a little lap at the rocks, cloud drift
    T.ripple.offset.set(t * 0.012, t * 0.02); T.foam.offset.x = t * 0.04;
    R.foam.position.z = 0.22 * Math.sin(t * 0.9);
    R.clouds.position.x = Math.sin(t * 0.0021) * 30;
  }

  // ---------------------------------------------------------- data
  return {
    env: {
      xmas_morning: { bg: 0xa8d4ee, fog: [0xdfe8ec, 0.0044], hemi: [0xeef4fa, 0x7aa05a, 1.00], dir: [0xfff0dc, 1.25, [14, 6, 10]], spot: [0xffffff, 0], rain: 0 },
    },
    build,
    marks: {
      a2_luka: [-0.32, 0, 0.35, 0], a2_chase: [0.36, 0, 0.35, 0], bench_spot: [0, 0, 0, 0],
      path_w: [-15.0, 0, -8.0, H], path_e: [15.0, 0, -8.0, -H],
    },
    anchors: {
      wp_canon:       { at: [-0.5, 0.7, 4.0], from: [1.5, 2.0, -13.0], fov: 40 },      // the angle from 2.3 (parade wp_canon - W0)
      a2_phone_chase: { at: [0.36, 0.72, 0.62], from: [0.2, 1.25, 1.25], fov: 30 },
      a2_topdown:     { at: [0.36, 0.85, 0.35], from: [0.36, 3.2, 0.37], fov: 40 },
      a2_two_front:   { at: [0.02, 0.8, 0.35], from: [0.25, 1.1, 3.0], fov: 40 },
      a2_lanyard:     { at: [-0.32, 0.65, 0.55], from: [-0.7, 1.0, 1.4], fov: 30 },
      a2_phone_luka:  { at: [-0.32, 0.72, 0.62], from: [-0.55, 1.25, 1.25], fov: 30 },
      a2_grass:       { at: [0.0, 0.25, 1.5], from: [0.6, 0.55, -3.2], fov: 34 },
      a2_bridge:      { at: [0.0, 4.0, 368], from: [0.0, 1.6, 5.5], fov: 14 },
      // inspection only (not in the script)
      council_sign:   { at: [-8.5, 1.57, -9.77], from: [-8.3, 1.6, -7.4], fov: 36 },
      tinsel:         { at: [2.0, 0.84, 6.44], from: [1.4, 1.15, 5.2], fov: 34 },
      bin:            { at: [4.5, 0.6, -9.3], from: [4.3, 1.2, -7.4], fov: 40 },
    },
    cams: {
      wp_canon: { type: 'fixed', pos: [1.5, 2.0, -13.0], look: [-0.5, 0.7, 4.0], fov: 40 },
      wp_west:  { type: 'fixed', pos: [3.4, 2.9, -10.7], look: [-8.0, 0.4, -1.4], fov: 46 },
      wp_east:  { type: 'fixed', pos: [-2.4, 2.9, -10.7], look: [9.0, 0.4, -1.4], fov: 46 },
    },
    zones: [   // first match wins; together they tile the walkable headland x -16..16, z -10..6.2
      { box: [-3, -6.5, 5, -2], cam: 'wp_canon' },
      { box: [-8, -2, 9, 6.2], cam: 'wp_canon' },
      { box: [-16, -10, 1, 6.2], cam: 'wp_west' },
      { box: [1, -10, 16, 6.2], cam: 'wp_east' },
    ],
    colliders: COL,
    props: [
      'grass_f26', 'grass_fine', 'coffees', 'coffee_luka', 'coffee_chase', 'tinsel_rail', 'tinsel_tail', 'council_sign_26', 'bin_26', 'bell_buoy',
      'gulls', 'gull_wings', 'bridge_cars', 'woody_jetty', 'woody_jetty_piles', 'railing_w', 'pines', 'shelter', 'houses', 'street_trees', 'rocks', 'blobs',
      'water', 'foam', 'band', 'haze', 'skirt', 'bridge', 'bridge_lamps', 'sun', 'clouds',
    ],
    ambience: { loops: ['birds', 'wind_soft', 'water_lap'], room: 'none' },
    update,
    // extras (spec §12)
    dress, dressed: () => R.dressed,
  };
})();
