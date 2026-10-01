// ============================================================ SET: valley — Fortitude Valley in Quiet Hours + the Starlight (2040)
// Scenes 2.8 (the mall, the Safe Box puzzle, the walk to the Starlight), 2.9 (the floor, the sneak, the stage door),
// 2.10 (the desk at 3 am), the 3.6 street cutaway and the credits vignettes. Spec: docs/sets/valley.md.
//
// LAYOUT — the Valley Grid (VG): metres, Y up, +X east (along Ann St toward New Farm), +Z south (down the malls, toward
// the river). Ann Street's centreline is z = 0 (road x −120…120, z −7…7, surface y −0.10; raised zebras y 0 at
// W x −32…−28 and E x −2…2); footpaths N z −11…−7 and S z 7…11. Brunswick St Mall x −8…8, z 11…57 (walkable
// x −7.6…7.6, z 11.3…56.8), its centreline x = 0. Optus Tower x −18…18, z −41…−11 on the north side at the head of the
// mall (countdown band on its south face, y 108…116). The Starlight x −44…−26, z −33…−11 (interior x −43.7…−26.3,
// z −32.7…−11.3, hall ceiling 6.0, stage deck y 0.9 at z −16…−11.3); its stage door (x −28.9…−27.9) opens onto Ann St
// opposite the Chinatown gate (columns x −35, −32, −28, −25 at z 11.8). Chinatown Mall x −36…−24 runs south (walkable
// pocket z 11…19.4, lantern vista beyond). Facing ry: 0 = +Z (south), PI = −Z (north), H = +X (east), −H = −X (west).
// Boxes and colliders are [x0, z0, x1, z1]. Three regions: region_m (the street: m_ann Ann St strip, m_mall, m_ct
// Chinatown vista), region_s (the Starlight interior), region_f (tower() + skyline()).
//
// SHARED BUILDERS (also used by hq_atrium, hq_top, hq_roof — call them from your build(); they are re-entrant, every
// material and texture is cached with a stable 'vg_*' key so programs are warmed once at boot):
//   SETS.valley.VG                      the shared geography (data; §12.3 of the spec) incl. VG.lots, VG.river.path, VG.bridge
//   SETS.valley.tower({ podium: 'night' | 'none', drones = 12, countdown = true }) -> Group 'tower' (VG coordinates)
//     children: 'facade_countdown' (userData: set(h, m, s), run(rate = 1), text('quiet' | 'none'), zero(dur = 3: shows
//     00:00:00, holds, cross-fades to a Yes-yellow band; zero(0) = instantly yellow), ctl), 'yes_sign' (userData.lit(bool);
//     letters VG x −12…12, y 134.2…142.2, z −35.95, facing +Z), 'tower_drones' (userData.count(n), color(hex | state)),
//     'lobby_card' (podium 'night' only). tower.userData: update(dt, t) — the HOST calls it every tick; lit(k) window
//     light level (night 0.6; day 0); countdown (the controller).
//   SETS.valley.skyline({ skip = [], sky = 'storm', neon = 0.35 }) -> Group 'skyline' (VG coordinates; add it at
//     (0, −125.5, 0) / (0, −131, 0) in a local frame). skip ids: any VG.lots key ('N1' 'N2' 'STARLIGHT' 'N3' 'SW0' 'SW1'
//     'SW2' 'S2' 'S2b' 'S3' 'S3b' 'S4' 'S4b'; 'TOWER' is never built here), and features 'CHINATOWN' (gate + lanterns),
//     'CITY' (procedural lots), 'CBD', 'RIVER', 'BRIDGE', 'CROWD', 'TRAFFIC'. skyline.userData: lit(k, dur = 0) neon +
//     window level (0.35 Quiet … 1.0), swing(on), rain(on), crowd('quiet' | 'look_up' | 'none'), sky('storm' |
//     'midday_storm' | 'golden' | 'clear_night' | 'dawn'), flash(k = 1) (respects Reduce Flashing), bridgeLights(on),
//     update(dt, t) — the HOST calls it every tick (no allocation). Named children: 'karaoke_neon' (on SW1),
//     'lanterns_far', 'bridge_lights', 'crowd_dots', 'traffic_dots', 'sky_dome', 'clouds'.
//   SETS.valley.countdown({ key, label = 'QUIET IN' }) -> controller { tex, mat, set, run, text, zero, update(dt), yes }
//     — the facade countdown's generator (256 × 64 LED canvas repainted from a pre-rendered digit atlas at most once a
//     second). Use your own key (e.g. 'atrium_wall') for a second, independent display.
//   If SETS.valley is missing (its leaf failed), callers fall back to their own horizon band (never throw).
//
// The rest of this header (marks, anchors, cams, zones, props, env, dress) is completed below the shared builders.
SETS.valley = (() => {
  const PI = Math.PI, H = PI / 2, TAU = PI * 2;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const smooth = (u) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
  // seeded LCG: repaints and the procedural city come out identical on every build, in every set
  function rng(seed) { let s = (seed >>> 0) % 2147483647 || 1; return () => ((s = (s * 16807) % 2147483647) / 2147483647); }

  // ---------------------------------------------------------- VG: the shared Valley geography (data)
  const RIVER = [[-500, 395], [-330, 372], [-190, 340], [-60, 306], [60, 300], [140, 312], [181.6, 330.4], [215, 395], [240, 470], [256, 545]];
  const VG = {
    axes: '+X east, +Z south, Y up, metres',
    annSt: { road: [-120, -7, 120, 7], roadY: -0.10, fpN: [-120, -11, 120, -7], fpS: [-120, 7, 120, 11],
      zebraW: [-32, -7, -28, 7], zebraE: [-2, -7, 2, 7], lanes: { east: [-5.25, -1.75], west: [1.75, 5.25] } },
    mall: { box: [-8, 11, 8, 110], detailTo: 57 },
    chinatown: { box: [-36, 11, -24, 110], gate: [-30, 0, 11.8],
      lanternRows: { z0: 13, z1: 57, dz: 4, xs: [-34.5, -31.5, -28.5, -25.5], y: 5.2 } },
    wickham: { z: [110, 124] },
    starlight: { box: [-44, -33, -26, -11], h: 8.5, stageDoor: [-28.4, 0, -11.0], blade: [-26.6, 4.0, -11.0, 11.0], hiWindow: [-39, 4.0, -32, 5.2] },
    tower: { box: [-18, -41, 18, -11], podiumTop: 13.5, floorY: (n) => 13.5 + 4 * (n - 3),
      top: { floorY: 125.5, ceilY: 131.0 }, roofY: 131.0, parapetY: 132.2,
      countdown: { x0: -16, x1: 16, y0: 108, y1: 116, z: -10.7 },
      yes: { x0: -12, x1: 12, y0: 134.2, y1: 142.2, z: -35.95 },   // lifted from 133…141 so the crown box doesn't hide it (hq_roof request)
      crown: [-14, -41, 14, -35, 131, 134], canopy: [-8, -11, 8, -8, 5.0], doors: [-2, 2] },
    lots: {   // box [x0, z0, x1, z1], h; street faces get shopfronts (N, S, E, W)
      N1: { box: [-70, -41, -44, -11], h: 14, faces: 'S' },
      N2: { box: [-44, -41, -26, -33], h: 11, faces: '' },
      STARLIGHT: { box: [-44, -33, -26, -11], h: 8.5, faces: '' },
      TOWER: { box: [-18, -41, 18, -11] },
      N3: { box: [24, -41, 60, -11], h: 18, faces: 'S' },
      SW0: { box: [-72, 11, -60, 40], h: 9, faces: 'N' },
      SW1: { box: [-60, 11, -36, 40], h: 11, faces: 'NE' },
      SW2: { box: [-72, 40, -36, 110], h: 13, faces: 'E' },
      S2: { box: [-24, 11, -8, 57], h: 15, faces: 'NEW' },
      S2b: { box: [-24, 57, -8, 110], h: 12, faces: 'EWS' },
      S3: { box: [8, 11, 30, 57], h: 12, faces: 'NW' },
      S3b: { box: [8, 57, 30, 110], h: 14, faces: 'WS' },
      S4: { box: [30, 11, 60, 40], h: 16, faces: 'N' },
      S4b: { box: [30, 40, 62, 110], h: 10, faces: 'S' },
    },
    river: { path: RIVER, half: 55, y: -2, z0: 245, z1: 355 },   // a ribbon round the bend under the bridge (~z 300 down the mall)
    bridge: { a: [100.5, 0, 371.7], b: [262.7, 0, 289.1], deckY: 30, towers: [[156.7, 343.1], [206.5, 317.7]], towerH: 74 },   // side-on from the tower, ≈27° E of S
    cbd: { centre: [-240, 0, 228], r: 62, count: 22, hMin: 60, hMax: 200 },
    cootha: { bearing: 'W', masts: 3, at: [-492, 0, 18] },
    neon: [
      { id: 'napclub', at: [-7.95, 4.8, 41.0], w: 4.4, h: 1.2, color: 0xff3fa4 },
      { id: 'karaoke', at: [-39.5, 7.5, 11.0], w: 5.0, h: 5.0, color: 0xff3fa4 },
      { id: 'blade', at: [-26.6, 7.5, -10.4], w: 1.3, h: 7.0, color: 0xff4fa0 },
      { id: 'whisper', at: [7.95, 4.6, 41.0], w: 2.0, h: 1.6, color: 0x2fe8d6 },
      { id: 'cocktail', at: [19.0, 7.0, 11.0], w: 2.0, h: 2.4, color: 0x2fe8d6 },
    ],
  };

  // ---------------------------------------------------------- build-time state + geometry helpers (reddy's style)
  // Every helper ends in put(): the current transform XF, a vertex colour of hex × tint, into the current Builder `b`
  // with material m (default: the shared white vertex-colour Lambert). part() runs fn into a fresh Builder -> a named Group.
  const tcol = new THREE.Color(), m4 = new THREE.Matrix4();
  let b = null, tint = [1, 1, 1], XF = null;
  const VC = () => mat(0xffffff);
  function put(g, hex, m) {
    if (XF) g.applyMatrix4(XF);
    tcol.set(hex);
    const r = tcol.r * tint[0], gg = tcol.g * tint[1], bl = tcol.b * tint[2], n = g.attributes.position.count, a = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { a[i * 3] = r; a[i * 3 + 1] = gg; a[i * 3 + 2] = bl; }
    g.setAttribute('color', new THREE.BufferAttribute(a, 3));
    b.add(g, m || VC());
  }
  // box: y is the BOTTOM. bb: min/max corners. boxR: centred, any rotation (X, then Z, then Y). cyl/ico/cone: centred.
  function box(w, h, d, hex, x, y, z, ry = 0, m) { const g = new THREE.BoxGeometry(w, h, d); if (ry) g.rotateY(ry); g.translate(x, y + h / 2, z); put(g, hex, m); }
  function bb(x0, y0, z0, x1, y1, z1, hex, m) { box(x1 - x0, y1 - y0, z1 - z0, hex, (x0 + x1) / 2, y0, (z0 + z1) / 2, 0, m); }
  function boxR(w, h, d, hex, x, y, z, rx = 0, ry = 0, rz = 0, m) {
    const g = new THREE.BoxGeometry(w, h, d); g.rotateX(rx); g.rotateZ(rz); g.rotateY(ry); g.translate(x, y, z); put(g, hex, m);
  }
  function cyl(rt, rb, h, seg, hex, x, y, z, rx = 0, rz = 0, m) {
    const g = new THREE.CylinderGeometry(rt, rb, h, seg); if (rx) g.rotateX(rx); if (rz) g.rotateZ(rz); g.translate(x, y, z); put(g, hex, m);
  }
  function ico(r, hex, x, y, z, sy = 1, m) { const g = new THREE.IcosahedronGeometry(r, 0); g.scale(1, sy, 1); g.translate(x, y, z); put(g, hex, m); }
  // quad faces +Z before rotation (rx first, then ry): floor rx=-H, ceiling rx=H, wall facing -X ry=-H. uv = [u0, v0, u1, v1]
  function quad(w, h, m, x, y, z, ry = 0, rx = 0, hex = 0xffffff, uv = null) {
    const g = new THREE.PlaneGeometry(w, h);
    if (uv) { const a = g.attributes.uv; for (let i = 0; i < 4; i++) { a.setX(i, a.getX(i) > 0.5 ? uv[2] : uv[0]); a.setY(i, a.getY(i) > 0.5 ? uv[3] : uv[1]); } }
    if (rx) g.rotateX(rx); if (ry) g.rotateY(ry); g.translate(x, y, z); put(g, hex, m);
  }
  // pixel rect of a W×H canvas -> uv rect (CanvasTexture flipY: canvas row 0 is v = 1)
  const cell = (W, Hh, px, py, pw, ph) => [px / W, 1 - (py + ph) / Hh, (px + pw) / W, 1 - py / Hh];
  function wall(x0, z0, x1, z1, h, hex, COL) { bb(x0, 0, z0, x1, h, z1, hex); if (COL) COL.push([x0, z0, x1, z1]); }
  function part(name, fn, pos, ry = 0, o) {
    const pb = b, px = XF, pt = tint; b = new Builder(); XF = null;
    fn();
    const g = b.done(o); b = pb; XF = px; tint = pt;
    if (name) g.name = name;
    if (pos) g.position.set(pos[0], pos[1], pos[2]);
    g.rotation.y = ry;
    return g;
  }
  const at = (x, z, ry = 0, y = 0) => (XF = m4.makeRotationY(ry).setPosition(x, y, z));
  // a square beam between two points in the local YZ plane (x = 0): cables, braces
  function seg(y0, z0, y1, z1, r, hex, m) {
    const dy = y1 - y0, dz = z1 - z0, g = new THREE.BoxGeometry(r, r, Math.hypot(dy, dz) + r);
    g.rotateX(Math.atan2(-dy, dz)); g.translate(0, (y0 + y1) / 2, (z0 + z1) / 2); put(g, hex, m);
  }

  // ---------------------------------------------------------- the mesher: raw quads for the city's thousands of faces
  // (no BoxGeometry/merge per face: plain arrays, one BufferGeometry). quad(a, b, c, d) is counter-clockwise from the
  // front; uv rect maps a=(u0,v0) b=(u1,v0) c=(u1,v1) d=(u0,v1). face('S'|'N'|'E'|'W', p, a0, a1, y0, y1, uv) is an
  // axis-aligned wall at z = p (S/N) or x = p (E/W) spanning a0…a1 along it; u runs left -> right seen from the front.
  function mesher() {
    const P = [], N = [], U = [], Cl = [], c = new THREE.Color();
    let nx = 0, ny = 1, nz = 0;
    const v = (x, y, z, u, w) => { P.push(x, y, z); N.push(nx, ny, nz); U.push(u, w); Cl.push(c.r, c.g, c.b); };
    const k = {
      color(hex) { c.set(hex); return k; },
      rgb(r, g, bl) { c.setRGB(r, g, bl); return k; },
      quad(ax, ay, az, bx, by, bz, cx, cy, cz, dx, dy, dz, u0 = 0, v0 = 0, u1 = 1, v1 = 1) {
        const ux = bx - ax, uy = by - ay, uz = bz - az, wx = dx - ax, wy = dy - ay, wz = dz - az;
        nx = uy * wz - uz * wy; ny = uz * wx - ux * wz; nz = ux * wy - uy * wx;
        const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
        v(ax, ay, az, u0, v0); v(bx, by, bz, u1, v0); v(cx, cy, cz, u1, v1);
        v(ax, ay, az, u0, v0); v(cx, cy, cz, u1, v1); v(dx, dy, dz, u0, v1);
        return k;
      },
      face(f, p, a0, a1, y0, y1, uv) {
        const u0 = uv ? uv[0] : 0, v0 = uv ? uv[1] : 0, u1 = uv ? uv[2] : 1, v1 = uv ? uv[3] : 1;
        if (f === 'S') return k.quad(a0, y0, p, a1, y0, p, a1, y1, p, a0, y1, p, u0, v0, u1, v1);
        if (f === 'N') return k.quad(a1, y0, p, a0, y0, p, a0, y1, p, a1, y1, p, u0, v0, u1, v1);
        if (f === 'E') return k.quad(p, y0, a1, p, y0, a0, p, y1, a0, p, y1, a1, u0, v0, u1, v1);
        return k.quad(p, y0, a0, p, y0, a1, p, y1, a1, p, y1, a0, u0, v0, u1, v1);
      },
      top(x0, z0, x1, z1, y, uv) { return k.quad(x0, y, z1, x1, y, z1, x1, y, z0, x0, y, z0, uv ? uv[0] : 0, uv ? uv[1] : 0, uv ? uv[2] : 1, uv ? uv[3] : 1); },
      bottom(x0, z0, x1, z1, y) { return k.quad(x0, y, z0, x1, y, z0, x1, y, z1, x0, y, z1); },
      // a box; mask bits: 1 S, 2 N, 4 E, 8 W, 16 top, 32 bottom
      box(x0, y0, z0, x1, y1, z1, mask = 31) {
        if (mask & 1) k.face('S', z1, x0, x1, y0, y1); if (mask & 2) k.face('N', z0, x0, x1, y0, y1);
        if (mask & 4) k.face('E', x1, z0, z1, y0, y1); if (mask & 8) k.face('W', x0, z0, z1, y0, y1);
        if (mask & 16) k.top(x0, z0, x1, z1, y1); if (mask & 32) k.bottom(x0, z0, x1, z1, y0);
        return k;
      },
      // a square beam of width w between two points (four sides; ends left open)
      beam(x0, y0, z0, x1, y1, z1, w) {
        let dx = x1 - x0, dy = y1 - y0, dz = z1 - z0; const L = Math.hypot(dx, dy, dz) || 1; dx /= L; dy /= L; dz /= L;
        let sx = dz, sy = 0, sz = -dx; let sl = Math.hypot(sx, sz);
        if (sl < 1e-3) { sx = 1; sy = 0; sz = 0; sl = 1; }
        sx = sx / sl * w / 2; sz = sz / sl * w / 2;
        const tx = sy * dz - sz * dy, ty = sz * dx - sx * dz, tz = sx * dy - sy * dx;   // t = s × d (|t| = w/2)
        const C = [[1, 1], [-1, 1], [-1, -1], [1, -1]];
        for (let i = 0; i < 4; i++) {
          const [a1, b1] = C[i], [a2, b2] = C[(i + 1) % 4];
          const p1x = sx * a1 + tx * b1, p1y = sy * a1 + ty * b1, p1z = sz * a1 + tz * b1;
          const p2x = sx * a2 + tx * b2, p2y = sy * a2 + ty * b2, p2z = sz * a2 + tz * b2;
          k.quad(x0 + p2x, y0 + p2y, z0 + p2z, x0 + p1x, y0 + p1y, z0 + p1z, x1 + p1x, y1 + p1y, z1 + p1z, x1 + p2x, y1 + p2y, z1 + p2z);
        }
        return k;
      },
      get count() { return P.length / 3; },
      geometry() {
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
        g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
        g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2));
        g.setAttribute('color', new THREE.Float32BufferAttribute(Cl, 3));
        g.computeBoundingSphere();
        return g;
      },
      // -> Mesh with this material; bake = bakeLight options (false: keep the raw colours, for unlit layers)
      mesh(m, name, bake = {}) { const g = k.geometry(); if (bake) bakeLight(g, bake); const me = new THREE.Mesh(g, m); if (name) me.name = name; return me; },
    };
    return k;
  }

  // ---------------------------------------------------------- unlit materials (cached by key: created once, warmed at boot)
  const BM = {};
  const basic = (key, o) => BM[key] || (BM[key] = new THREE.MeshBasicMaterial(o));
  const ADD = THREE.AdditiveBlending;
  const FONT = (px, w = 'bold') => `${w} ${px}px Arial, "Liberation Sans", "DejaVu Sans", sans-serif`;
  const MONO = (px) => `bold ${px}px "DejaVu Sans Mono", "Liberation Mono", "Courier New", monospace`;
  function text(c, s, x, y, px, col, al = 'center', w = 'bold', maxW) {
    c.font = FONT(px, w); c.fillStyle = col; c.textAlign = al; c.textBaseline = 'middle'; c.fillText(s, x, y, maxW);
  }
  const hexs = (n) => '#' + n.toString(16).padStart(6, '0');

  // ---------------------------------------------------------- the countdown generator (facade band + hq_atrium's wall)
  // A 256 × 64 LED canvas: a 'QUIET IN' header line and hh:mm:ss drawn with drawImage from a pre-rendered digit atlas
  // (no strings in the frame loop), repainted only when the shown second changes (or another controller painted the
  // shared canvas last). zero(dur): 00:00:00, a short hold, then `yes` (0..1) rises: the host fades a Yes-yellow layer.
  const GW = 26, GH = 40, CW = 12, DIGX0 = (256 - (GW * 6 + CW * 2)) / 2, DIGY = 22;
  let DIG = null, DIGBG = null;
  function digitAtlas() {
    if (DIG) return DIG;
    const c = document.createElement('canvas'); c.width = GW * 10 + CW; c.height = GH;
    const x = c.getContext('2d');
    x.fillStyle = '#e4f4ff'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = MONO(40);
    for (let i = 0; i < 10; i++) x.fillText(String(i), i * GW + GW / 2, GH / 2 + 2, GW);
    x.fillText(':', 10 * GW + CW / 2, GH / 2 + 1, CW);
    x.globalCompositeOperation = 'destination-out'; x.fillStyle = 'rgba(0,0,0,0.6)';   // LED matrix gaps
    for (let yy = 2; yy < GH; yy += 3) x.fillRect(0, yy, c.width, 1);
    for (let xx = 2; xx < c.width; xx += 3) x.fillRect(xx, 0, 1, GH);
    const bg = document.createElement('canvas'); bg.width = 256; bg.height = GH;     // the dark digit strip with faint LED dots
    const y = bg.getContext('2d'); y.fillStyle = '#04070d'; y.fillRect(0, 0, 256, GH);
    y.fillStyle = 'rgba(80,120,160,0.10)'; for (let yy = 0; yy < GH; yy += 3) for (let xx = 0; xx < 256; xx += 3) y.fillRect(xx, yy, 2, 2);
    DIG = c; DIGBG = bg;
    return c;
  }
  function countdown(o = {}) {
    const key = o.key || 'vg_countdown', label = o.label || 'QUIET IN';
    const tex = canvasTex(256, 64, (c) => { c.fillStyle = '#04070d'; c.fillRect(0, 0, 256, 64); }, { key, nearest: true });
    const cv = tex.image, cx = cv.getContext('2d'), atlas = digitAtlas();
    const material = basic(key, { map: tex, fog: false });
    function head() {
      cx.fillStyle = '#04070d'; cx.fillRect(0, 0, 256, DIGY);
      if (ctl.mode !== 'quiet') return;
      cx.font = FONT(15); cx.fillStyle = '#9fd4ff'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
      if ('letterSpacing' in cx) cx.letterSpacing = '6px';
      cx.fillText(label, 128 + 3, 11);
      if ('letterSpacing' in cx) cx.letterSpacing = '0px';
      cx.fillStyle = 'rgba(159,212,255,0.25)'; cx.fillRect(40, DIGY - 2, 176, 1);
    }
    function glyph(i, x) { cx.drawImage(atlas, i * GW, 0, i === 10 ? CW : GW, GH, x, DIGY, i === 10 ? CW : GW, GH); }
    function paint(s) {
      if (cv.owner !== ctl || ctl.dirty) { head(); cv.owner = ctl; ctl.dirty = false; }
      const hh = Math.min(99, Math.floor(s / 3600)), mm = Math.floor(s / 60) % 60, ss = s % 60;
      cx.drawImage(DIGBG, 0, DIGY);
      let x = DIGX0;
      glyph((hh / 10) | 0, x); x += GW; glyph(hh % 10, x); x += GW; glyph(10, x); x += CW;
      glyph((mm / 10) | 0, x); x += GW; glyph(mm % 10, x); x += GW; glyph(10, x); x += CW;
      glyph((ss / 10) | 0, x); x += GW; glyph(ss % 10, x);
      ctl.shown = s; tex.needsUpdate = true;
    }
    const ctl = {
      tex, mat: material, secs: 0, rate: 1, shown: -1, mode: 'quiet', yes: 0, zt: -1, zdur: 3, dirty: true,
      set(h, m = 0, s = 0) { ctl.secs = h * 3600 + m * 60 + s; ctl.zt = -1; ctl.yes = 0; ctl.shown = -1; return ctl; },
      run(rate = 1) { ctl.rate = rate; return ctl; },
      text(mode = 'quiet') { if (mode !== ctl.mode) { ctl.mode = mode; ctl.dirty = true; ctl.shown = -1; } return ctl; },
      zero(dur = 3) { ctl.secs = 0; ctl.rate = 0; ctl.shown = -1; if (!(dur > 0)) { ctl.zt = -1; ctl.yes = 1; } else { ctl.zt = 0; ctl.zdur = dur; ctl.yes = 0; } return ctl; },
      update(dt) {
        if (ctl.rate && ctl.secs > 0) ctl.secs = Math.max(0, ctl.secs - dt * ctl.rate);
        if (ctl.zt >= 0) {
          ctl.zt += dt; const hold = Math.min(1, ctl.zdur / 3);
          ctl.yes = clamp((ctl.zt - hold) / Math.max(0.01, ctl.zdur - hold), 0, 1);
          if (ctl.zt >= ctl.zdur) { ctl.zt = -1; ctl.yes = 1; }
        }
        const s = Math.ceil(ctl.secs - 1e-6);
        if (s !== ctl.shown || cv.owner !== ctl) paint(s);
      },
    };
    ctl.set(16, 28, 0);
    return ctl;
  }

  // ---------------------------------------------------------- shared textures + materials (tower and skyline)
  let ST = null, SM = null;
  const hillTop = (x) => 64 - 14 - 14 * Math.sin(x / 128 * PI) - 2 * Math.sin(x * 0.3), MASTS = [[50, 16], [62, 20], [76, 14]];
  function sharedTex() {
    if (ST) return ST;
    ST = {};
    const K = (k, o = {}) => ({ key: 'vg_' + k, nearest: true, ...o });
    // tower curtain wall: 4 rows of one floor (4 m) × 8 modules (16 m): 0 night glass, 1 smoked (top floor), 2 podium
    // stone with a glass band, 3 crown louvres. Spandrel at the bottom of each floor so the floor lines run unbroken.
    ST.tower = canvasTex(256, 256, (c) => {
      const r = rng(31);
      for (let row = 0; row < 4; row++) {
        const y0 = row * 64;
        if (row === 2) {   // podium stone: panels + a glass band
          c.fillStyle = '#8c9096'; c.fillRect(0, y0, 256, 64);
          c.fillStyle = '#7c8086'; for (let x = 0; x < 256; x += 32) c.fillRect(x, y0, 1, 64);
          c.fillStyle = '#2c3440'; c.fillRect(0, y0 + 22, 256, 20); c.fillStyle = '#4a5866'; for (let x = 0; x < 256; x += 16) c.fillRect(x, y0 + 22, 1, 20);
          continue;
        }
        if (row === 3) {   // louvres
          c.fillStyle = '#5a6068'; c.fillRect(0, y0, 256, 64);
          for (let y = y0 + 2; y < y0 + 64; y += 5) { c.fillStyle = '#7a8088'; c.fillRect(0, y, 256, 2); c.fillStyle = '#3a4048'; c.fillRect(0, y + 2, 256, 1); }
          continue;
        }
        const g = c.createLinearGradient(0, y0, 0, y0 + 54);
        if (row === 0) { g.addColorStop(0, '#5f7484'); g.addColorStop(1, '#4a5d6c'); } else { g.addColorStop(0, '#262d36'); g.addColorStop(1, '#1c2229'); }
        c.fillStyle = g; c.fillRect(0, y0, 256, 54);
        // sky reflections: soft diagonal bands, a little different per module
        for (let m = 0; m < 8; m++) {
          const a = 0.05 + r() * 0.08; c.fillStyle = `rgba(200,220,240,${row ? a * 0.5 : a})`;
          c.beginPath(); const x = m * 32, s = r() * 30; c.moveTo(x + s, y0); c.lineTo(x + s + 10, y0); c.lineTo(x + s - 8, y0 + 54); c.lineTo(x + s - 18, y0 + 54); c.fill();
        }
        c.fillStyle = row ? '#3a3e44' : '#9aa2aa'; c.fillRect(0, y0 + 54, 256, 10);            // spandrel
        c.fillStyle = row ? '#2a2e34' : '#7e868e'; c.fillRect(0, y0 + 54, 256, 1); c.fillRect(0, y0 + 63, 256, 1);
        c.fillStyle = '#3a4048'; for (let x = 0; x < 256; x += 32) c.fillRect(x, y0, 2, 54);   // mullions
        c.fillStyle = 'rgba(58,64,72,0.7)'; c.fillRect(0, y0 + 30, 256, 1);                        // transom
      }
    }, K('tower', { repeat: [1, 1] }));
    ST.tower.wrapT = THREE.ClampToEdgeWrapping;
    // tower window lights (additive): rows 0 dim-lit (a few warm), 1 lit offices (cool), 2 L30 (docked-drone blue dots), 3 dark
    ST.towerLit = canvasTex(256, 256, (c) => {
      const r = rng(77);
      c.fillStyle = '#000'; c.fillRect(0, 0, 256, 256);
      // lit rooms: runs of modules in one colour, a ceiling glow fading down, blinds on some
      for (let row = 0; row < 2; row++) {
        let m = 0;
        while (m < 8) {
          const run = 1 + ((r() * (row ? 4 : 2.5)) | 0);
          if (r() < (row ? 0.6 : 0.3)) {
            const warm = row ? r() < 0.25 : r() < 0.7, k = row ? 0.38 + r() * 0.3 : 0.25 + r() * 0.3, blinds = r() < 0.35;
            const rgb = warm ? [255, 196 + ((r() * 30) | 0), 130] : [190, 220 + ((r() * 25) | 0), 255];
            for (let j = m; j < Math.min(8, m + run); j++) {
              const x = j * 32 + 3, y = row * 64 + 3, gr = c.createLinearGradient(0, y, 0, y + 49);
              gr.addColorStop(0, `rgba(${rgb},${k})`); gr.addColorStop(0.25, `rgba(${rgb},${k * 0.75})`); gr.addColorStop(1, `rgba(${rgb},${k * 0.3})`);
              c.fillStyle = gr; c.fillRect(x, y, 27, 49);
              if (blinds) { c.fillStyle = 'rgba(0,0,0,0.45)'; for (let yy = y + 2; yy < y + 49; yy += 4) c.fillRect(x, yy, 27, 1); }
              c.fillStyle = `rgba(${rgb},${Math.min(1, k * 1.6)})`; c.fillRect(x + 2, y, 23, 2);
            }
          }
          m += run;
        }
      }
      for (let x = 2; x < 256; x += 5) { c.fillStyle = r() < 0.85 ? '#5ab4ff' : '#9fd8ff'; c.fillRect(x, 128 + 40, 2, 2); }   // docked drones
      c.fillStyle = 'rgba(60,140,255,0.18)'; c.fillRect(0, 128 + 30, 256, 22);
    }, K('tower_lit', { repeat: [1, 1] }));
    ST.towerLit.wrapT = THREE.ClampToEdgeWrapping;
    // the atrium seen through the podium glass at night: the bubble-wrapped tree, MANDATORY FUN, the countdown wall
    ST.lobby = canvasTex(256, 128, (c, w, h) => {
      const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#1a2230'); g.addColorStop(1, '#2a3240');
      c.fillStyle = g; c.fillRect(0, 0, w, h);
      c.fillStyle = '#3a4250'; c.fillRect(0, 40, 42, 3); c.fillRect(214, 40, 42, 3); c.fillRect(0, 78, 42, 3); c.fillRect(214, 78, 42, 3);   // mezzanines
      c.fillStyle = '#0c1018'; c.fillRect(96, 30, 64, 9); text(c, 'QUIET IN', 128, 35, 6, '#7fb8e8');               // countdown wall
      c.fillStyle = '#e8e4dc'; c.fillRect(40, 8, 176, 16); text(c, 'MANDATORY FUN', 128, 16, 13, '#c4202a');     // the banner
      c.fillStyle = '#5a6e80'; c.beginPath(); c.moveTo(128, 34); c.lineTo(160, 120); c.lineTo(96, 120); c.fill(); // the wrapped tree
      c.fillStyle = 'rgba(220,235,255,0.35)'; for (let i = 0; i < 40; i++) { const y = 40 + (i * 37) % 78, sp = (y - 34) * 0.37; c.fillRect(128 - sp + ((i * 53) % (2 * sp + 1)), y, 3, 2); }
      c.fillStyle = '#ffd890'; for (let i = 0; i < 26; i++) { const y = 44 + (i * 29) % 72, sp = (y - 34) * 0.36; c.fillRect(128 - sp + ((i * 71) % (2 * sp + 1)), y, 2, 2); }
      c.fillStyle = '#efe6d0'; c.beginPath(); c.arc(128, 32, 4, 0, TAU); c.fill();
      c.fillStyle = '#c8ccd2'; c.fillRect(0, 120, w, 8);
    }, K('lobby'));
    // the Yes sign: the handwritten logo in white (the material tints it)
    ST.yes = canvasTex(256, 96, (c) => { canvasTex.yes(c, 128 - 0.8 * 82, 7, 82, '#ffffff'); }, K('yes'));
    // city facade: one floor (3.5 m) × 16 m, four punched windows; light neutral (vertex colours tint it)
    ST.city = canvasTex(128, 32, (c) => {
      c.fillStyle = '#c4c0b8'; c.fillRect(0, 0, 128, 32);
      c.fillStyle = '#b0aca4'; c.fillRect(0, 30, 128, 2);
      for (let m = 0; m < 4; m++) {
        const x = m * 32 + 8;
        c.fillStyle = '#d8d4cc'; c.fillRect(x - 1, 8, 17, 16);
        c.fillStyle = '#2a3240'; c.fillRect(x, 9, 15, 14);
        c.fillStyle = '#3a4456'; c.fillRect(x, 9, 7, 14);
        c.fillStyle = '#9c988f'; c.fillRect(x - 2, 23, 19, 2);
      }
    }, K('city', { repeat: [1, 1] }));
    // city window lights (additive), 4 rows matching the facade grid: 0 shopfront glow (+ a solid warm patch at the left
    // for street lamps), 1 sparse, 2 busier, 3 office grid
    ST.cityLit = canvasTex(128, 128, (c) => {
      const r = rng(5);
      c.fillStyle = '#000'; c.fillRect(0, 0, 128, 128);
      for (let m = 0; m < 4; m++) { const k = 0.35 + r() * 0.4, warm = r() < 0.6; c.fillStyle = warm ? `rgba(255,214,150,${k})` : `rgba(190,230,255,${k})`; c.fillRect(m * 32 + 2, 4, 28, 26); }
      c.fillStyle = '#fff2d8'; c.fillRect(0, 0, 4, 4);
      for (let row = 1; row < 4; row++) for (let i = 0; i < 8; i++) {
        const m = i % 4, half = i >> 2, p = row === 1 ? 0.22 : row === 2 ? 0.42 : 0.72;
        if (r() > p) continue;
        const x = m * 32 + 8 + (half ? 7 : 0), warm = row === 3 ? r() < 0.25 : r() < 0.7, k = 0.5 + r() * 0.5;
        c.fillStyle = warm ? `rgba(255,${190 + (r() * 50) | 0},120,${k})` : r() < 0.15 ? `rgba(120,160,255,${k})` : `rgba(200,230,255,${k})`;
        c.fillRect(x, row * 32 + 9, half ? 8 : 7, 14);
      }
    }, K('city_lit', { repeat: [1, 1] }));
    ST.cityLit.wrapT = THREE.ClampToEdgeWrapping;
    // horizon band: a far city silhouette with lit specks (repeats round the cylinder); top half transparent
    ST.band = canvasTex(256, 64, (c) => {
      const r = rng(9);
      c.clearRect(0, 0, 256, 64);
      c.fillStyle = '#ffffff';
      let x = 0;
      while (x < 256) { const w = 4 + r() * 14, h = 6 + r() * (r() < 0.12 ? 34 : 16); c.fillRect(x, 64 - h, w + 1, h); x += w; }
      c.fillStyle = 'rgba(255,255,255,0.0)';
      const id = c.getImageData(0, 0, 256, 64);
      for (let i = 0; i < 260; i++) { const px = (r() * 256) | 0, py = 30 + ((r() * 34) | 0), o = (py * 256 + px) * 4; if (id.data[o + 3] > 0) { id.data[o] = 255; id.data[o + 1] = 230; id.data[o + 2] = 170; } }
      c.putImageData(id, 0, 0);
    }, K('band', { repeat: [10, 1] }));
    ST.band.wrapT = THREE.ClampToEdgeWrapping;
    // Mt Coot-tha: a long low hill with three TV masts
    ST.cootha = canvasTex(128, 64, (c) => {
      c.clearRect(0, 0, 128, 64); c.fillStyle = '#ffffff';
      c.beginPath(); c.moveTo(0, 64); for (let x = 0; x <= 128; x += 4) c.lineTo(x, hillTop(x)); c.lineTo(128, 64); c.fill();
      for (const [x, h] of MASTS) { const y = hillTop(x) + 2; c.fillRect(x, y - h, 2, h); c.fillRect(x - 3, y - h * 0.45, 8, 1); }
    }, K('cootha'));
    ST.cloud = canvasTex(128, 64, (c) => {
      const r = rng(3);
      c.clearRect(0, 0, 128, 64);
      for (let i = 0; i < 26; i++) {
        const x = 14 + r() * 100, y = 22 + r() * 22, rr = 8 + r() * 16, g = c.createRadialGradient(x, y, 0, x, y, rr);
        g.addColorStop(0, 'rgba(255,255,255,0.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, 128, 64);
      }
    }, { key: 'vg_cloud' });
    ST.river = canvasTex(64, 64, (c) => {
      const r = rng(17);
      c.fillStyle = '#1a2436'; c.fillRect(0, 0, 64, 64);
      for (let i = 0; i < 60; i++) { c.fillStyle = r() < 0.5 ? 'rgba(120,150,190,0.35)' : r() < 0.5 ? 'rgba(255,200,140,0.35)' : 'rgba(255,90,170,0.25)'; c.fillRect((r() * 64) | 0, (r() * 64) | 0, 3 + ((r() * 8) | 0), 1); }
    }, K('river', { repeat: [1, 3] }));
    ST.haze = canvasTex(64, 128, (c) => {
      const r = rng(23);
      c.clearRect(0, 0, 64, 128);
      for (let i = 0; i < 70; i++) { c.fillStyle = `rgba(210,220,235,${0.08 + r() * 0.18})`; c.fillRect((r() * 64) | 0, (r() * 128) | 0, 1, 10 + r() * 30); }
    }, K('haze', { repeat: [3, 2] }));
    // the karaoke bar's neon on SW1: a pink microphone with teal stars round it (tubes; white = lit, the material tints)
    ST.karaoke = canvasTex(128, 128, (c) => {
      c.clearRect(0, 0, 128, 128); c.lineCap = 'round'; c.lineJoin = 'round';
      const tube = (col, wdt, fn) => { c.strokeStyle = col; c.lineWidth = wdt + 4; c.globalAlpha = 0.25; c.beginPath(); fn(); c.stroke(); c.globalAlpha = 1; c.lineWidth = wdt; c.beginPath(); fn(); c.stroke(); };
      tube('#ff4fae', 5, () => { c.arc(64, 44, 18, 0, TAU); });
      tube('#ff4fae', 4, () => { c.moveTo(52, 34); c.lineTo(76, 54); c.moveTo(76, 34); c.lineTo(52, 54); });
      tube('#ff4fae', 5, () => { c.moveTo(64, 62); c.lineTo(64, 96); c.moveTo(50, 96); c.lineTo(78, 96); });
      tube('#ff4fae', 4, () => { c.moveTo(42, 50); c.quadraticCurveTo(44, 78, 64, 80); c.quadraticCurveTo(84, 78, 86, 50); });
      const star = (x, y, s) => tube('#2fe8d6', 3, () => { for (let i = 0; i <= 10; i++) { const a = -H + i * PI / 5, rr = i % 2 ? s * 0.45 : s; i ? c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : c.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } });
      star(20, 22, 11); star(108, 30, 9); star(16, 92, 8); star(106, 98, 12); star(34, 116, 6);
    }, K('karaoke'));
    return ST;
  }
  function sharedMats() {
    if (SM) return SM;
    const T = sharedTex();
    SM = {
      vc: VC(),
      tower: matTex(T.tower),
      towerLit: basic('vg_tower_lit', { map: T.towerLit, transparent: true, blending: ADD, depthWrite: false, fog: false }),
      lobby: matTex(T.lobby, { emissive: 0xffffff, emissiveIntensity: 0.55 }),
      podiumGlass: basic('vg_podium_glass', { color: 0x1a2c3c, transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false }),
      yes: basic('vg_yes', { map: T.yes, transparent: true, fog: false, side: THREE.DoubleSide }),
      yesGlow: basic('vg_countdown_yes', { color: 0xffd21f, transparent: true, opacity: 0, fog: false, depthWrite: false }),
      city: matTex(T.city),
      cityLit: basic('vg_city_lit', { map: T.cityLit, transparent: true, blending: ADD, depthWrite: false, fog: false }),
      neon: basic('vg_neon', { vertexColors: true, fog: false }),
      blade: basic('vg_blade_far', { color: 0x4a4650, fog: false }),
      karaoke: basic('vg_karaoke', { map: T.karaoke, transparent: true, depthWrite: false, fog: false, side: THREE.DoubleSide }),
      lantern: basic('vg_lantern_far', { color: 0xff6a3a, fog: false }),
      river: basic('vg_river', { map: T.river, vertexColors: true }),
      bridgeLit: basic('vg_bridge_lit', { vertexColors: true, fog: false }),
      sky: basic('vg_sky', { vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false }),
      band: basic('vg_band', { map: T.band, transparent: true, fog: false, side: THREE.BackSide, depthWrite: false }),
      cootha: basic('vg_cootha', { map: T.cootha, transparent: true, fog: false, depthWrite: false }),
      masts: basic('vg_masts', { color: 0xff2a1a, fog: false }),
      cloud: basic('vg_cloud', { map: T.cloud, vertexColors: true, transparent: true, fog: false, depthWrite: false, side: THREE.DoubleSide }),
      haze: basic('vg_haze', { map: T.haze, transparent: true, opacity: 0.5, fog: false, depthWrite: false, side: THREE.DoubleSide }),
      dots: BM.vg_dots || (BM.vg_dots = new THREE.PointsMaterial({ size: 2.5, sizeAttenuation: false, vertexColors: true, fog: false })),
    };
    return SM;
  }

  // ---------------------------------------------------------- tower(opts): the Optus Tower exterior (shared)
  const TQ = new THREE.Quaternion(), TE = new THREE.Euler(0, 0, 0, 'YXZ'), TP = new THREE.Vector3(), TS = new THREE.Vector3(), TM = new THREE.Matrix4(), TC = new THREE.Color();
  function tower(o = {}) {
    const podium = o.podium || 'night', nD = o.drones ?? 12, S = sharedMats(), TV = VG.tower;
    const g = new THREE.Group(); g.name = 'tower';
    const r = rng(1158);
    const [X0, Z0, X1, Z1] = TV.box, mb = mesher(), ml = mesher(), mv = mesher();
    const row = (i) => [0, 1 - (i + 1) / 4, 0, 1 - i / 4];   // uv rect of a texture row (u set per face)
    const FACES = [['S', Z1, X0, X1], ['N', Z0, X0, X1], ['E', X1, Z0, Z1], ['W', X0, Z0, Z1]];
    const y0 = podium === 'none' ? TV.podiumTop : 0;
    // curtain wall: one quad per floor per face (body) + window lights (a few floors, chosen once)
    const floors = [];
    if (podium !== 'none') floors.push([0, 4.5, 2], [4.5, 9.0, 2], [9.0, 13.5, 2]);
    for (let n = 3; n <= 30; n++) floors.push([TV.floorY(n), TV.floorY(n) + 4, 0, n]);
    floors.push([TV.top.floorY, TV.top.ceilY, 1, 31]);
    for (const [fy0, fy1, rw, n] of floors) {
      for (const [f, p, a0, a1] of FACES) {
        if (rw === 2 && f === 'S') continue;                   // the podium's south face is the atrium glass
        const uv = row(rw), off = (r() * 8 | 0) / 8, span = (a1 - a0) / 16;
        uv[0] = off; uv[2] = off + span;
        mb.color(0xffffff).face(f, p + (f === 'S' || f === 'E' ? 0 : 0), a0, a1, fy0, fy1, uv);
        if (rw !== 0) continue;
        const k = r(), lrow = n === 30 ? 2 : k < 0.62 ? -1 : k < 0.9 ? 0 : 1;
        if (lrow < 0) continue;
        const lu = row(lrow), lo = r(); lu[0] = lo; lu[2] = lo + span;
        const e = 0.05, pp = f === 'S' || f === 'E' ? p + e : p - e;
        ml.color(0xffffff).face(f, pp, a0, a1, fy0, fy1, lu);
      }
    }
    // parapet glass (smoked) to 132.2 and the roof slab (top just under 131 so a roof deck built at 131 never z-fights)
    for (const [f, p, a0, a1] of FACES) { const uv = row(1); uv[2] = (a1 - a0) / 16; mb.face(f, p, a0, a1, TV.roofY, TV.parapetY, uv); }
    mv.color(0x4a4e54).top(X0 + 0.3, Z0 + 0.3, X1 - 0.3, Z1 - 0.3, TV.roofY - 0.08);
    mv.color(0x3a3e44).box(X0, TV.parapetY, Z0, X1, TV.parapetY + 0.08, Z0 + 0.3, 31).box(X0, TV.parapetY, Z1 - 0.3, X1, TV.parapetY + 0.08, Z1, 31)
      .box(X0, TV.parapetY, Z0, X0 + 0.3, TV.parapetY + 0.08, Z1, 31).box(X1 - 0.3, TV.parapetY, Z0, X1, TV.parapetY + 0.08, Z1, 31);
    // corner fins: the silhouette reads as one tall slab with crisp edges
    for (const [x, z] of [[X0, Z0], [X1, Z0], [X0, Z1], [X1, Z1]]) mv.color(0x2e3238).box(x - 0.25, y0, z - 0.25, x + 0.25, TV.parapetY, z + 0.25);
    // crown plant box (louvred south face) + the Yes lattice
    const [cx0, cz0, cx1, cz1, cy0, cy1] = TV.crown;
    { const uv = row(3); uv[2] = (cx1 - cx0) / 16; mb.face('S', cz1, cx0, cx1, cy0, cy1, uv); }
    mv.color(0x4a5058).box(cx0, cy0, cz0, cx1, cy1, cz1, 2 | 4 | 8 | 16);
    const Y = TV.yes;
    for (const x of [Y.x0 - 0.4, Y.x1 + 0.4]) mv.color(0x3a3e44).box(x - 0.2, cy1, Y.z - 0.5, x + 0.2, Y.y1 + 0.5, Y.z - 0.1);
    for (const y of [Y.y0 - 0.1, (Y.y0 + Y.y1) / 2, Y.y1 + 0.3]) mv.color(0x3a3e44).box(Y.x0 - 0.6, y - 0.12, Y.z - 0.45, Y.x1 + 0.6, y + 0.12, Y.z - 0.2);
    for (let i = 0; i < 6; i++) { const xa = Y.x0 + i * 4, xb = xa + 4; mv.color(0x34383e).beam(xa, Y.y0, Y.z - 0.35, xb, Y.y1, Y.z - 0.35, 0.14); }
    // podium ('night'): the atrium glass front, its mullions, the canopy, the closed doors, the lobby card behind
    if (podium !== 'none') {
      const pg = mesher();
      pg.color(0xffffff).face('S', Z1 + 0.02, X0, X1, 0, TV.podiumTop);
      g.add(pg.mesh(S.podiumGlass, 'podium_glass', false));
      for (let x = X0; x <= X1 + 0.01; x += 2) mv.color(0x3a4048).box(x - 0.06, 0, Z1, x + 0.06, TV.podiumTop, Z1 + 0.12, 1 | 4 | 8);
      for (const y of [4.5, 9.0, 13.5]) mv.color(0x3a4048).box(X0, y - 0.15, Z1, X1, y + 0.15, Z1 + 0.14, 1 | 16 | 32);
      const [kx0, kz0, kx1, kz1, ky] = TV.canopy;
      mv.color(0xd8dce0).box(kx0, ky, kz0 + 3, kx1, ky + 0.4, kz1, 31 | 32);
      mv.color(0xefe6d0).box(kx0 - 0.08, ky - 0.05, kz1 - 0.15, kx1 + 0.08, ky + 0.45, kz1 + 0.08, 31 | 32);   // padded edge
      for (let x = kx0 + 1; x < kx1; x += 2) mv.color(0xf0e8d0).box(x - 0.3, ky - 0.02, kz0 + 3.5, x + 0.3, ky, kz1 - 0.6, 32);   // soffit lights (baked bright)
      const [dx0, dx1] = TV.doors;
      mv.color(0x22262c).box(dx0 - 0.15, 0, Z1, dx0, 2.6, Z1 + 0.16).box(dx1, 0, Z1, dx1 + 0.15, 2.6, Z1 + 0.16).box(dx0, 2.5, Z1, dx1, 2.65, Z1 + 0.16).box(-0.04, 0, Z1, 0.04, 2.5, Z1 + 0.14);
      mv.color(0xc8ccd2).box(-0.5, 1.0, Z1 + 0.14, -0.1, 1.06, Z1 + 0.2).box(0.1, 1.0, Z1 + 0.14, 0.5, 1.06, Z1 + 0.2);
      // inside: floor, ceiling and sides so the glass reads as a deep room, the painted interior card 6 m back
      mv.color(0x6c7076).top(X0 + 0.2, Z1 - 6.2, X1 - 0.2, Z1, 0.01);
      mv.color(0x2a2e34).bottom(X0 + 0.2, Z1 - 6.2, X1 - 0.2, Z1, TV.podiumTop - 0.3);
      mv.color(0x3a3e46).face('E', X0 + 0.2, Z1 - 6.2, Z1, 0, TV.podiumTop).face('W', X1 - 0.2, Z1 - 6.2, Z1, 0, TV.podiumTop);
      const lc = mesher(); lc.color(0xffffff).face('S', Z1 - 6.0, X0 + 0.2, X1 - 0.2, 0, TV.podiumTop - 0.3);
      g.add(lc.mesh(S.lobby, 'lobby_card', { floor: false }));
    }
    g.add(mb.mesh(S.tower, 'tower_body', { floor: podium !== 'none' }));
    g.add(ml.mesh(S.towerLit, 'tower_lights', false));
    g.add(mv.mesh(S.vc, 'tower_frame', { floor: false }));
    // the facade countdown band (+ its Yes-yellow layer) on the south face
    const CD = TV.countdown, ctl = countdown({ key: 'vg_countdown' });
    const fc = new THREE.Group(); fc.name = 'facade_countdown'; g.add(fc);
    { const m1 = mesher(); m1.color(0xffffff).face('S', CD.z, CD.x0, CD.x1, CD.y0, CD.y1); fc.add(m1.mesh(ctl.mat, 'countdown_band', false)); }
    { const m2 = mesher(); m2.color(0xffffff).face('S', CD.z + 0.05, CD.x0 - 0.2, CD.x1 + 0.2, CD.y0 - 0.2, CD.y1 + 0.2); const yg = m2.mesh(S.yesGlow, 'countdown_yes', false); yg.renderOrder = 2; fc.add(yg); fc.userData.glow = yg; }
    fc.userData = { ...fc.userData, ctl, set: (h, m, s) => ctl.set(h, m, s), run: (k) => ctl.run(k), text: (m) => ctl.text(m), zero: (d) => ctl.zero(d) };
    fc.visible = o.countdown !== false;
    // the Yes sign
    const ys = mesher(); ys.color(0xffffff).face('S', Y.z, Y.x0, Y.x1, Y.y0, Y.y1);
    const yes = ys.mesh(S.yes, 'yes_sign', false); g.add(yes);
    yes.userData.on = true; yes.userData.lit = (on) => { yes.userData.on = !!on; };
    // circling drones, "like gulls"
    const fleet = DRONE_INSTANCED.make(Math.max(1, nD), { state: 'patrol' });
    fleet.group.name = 'tower_drones'; g.add(fleet.group);
    const D = [];
    for (let i = 0; i < Math.max(1, nD); i++) D.push({ r: 26 + r() * 14, y: 95 + r() * 55, w: (0.15 + r() * 0.15) * (r() < 0.5 ? -1 : 1), ph: r() * TAU, bob: r() * TAU });
    const U = { n: nD, color: 'patrol', dirty: true, lit: 0.6 };
    fleet.group.userData.count = (n) => { U.n = clamp(n | 0, 0, D.length); };
    fleet.group.userData.color = (c) => { U.color = c; U.dirty = true; };
    g.userData = {
      countdown: ctl, drones: fleet,
      lit(k) { U.lit = k; },
      update(dt, t) {
        ctl.update(dt);
        S.yesGlow.opacity = ctl.yes;
        fc.userData.glow.visible = ctl.yes > 0.001;
        S.yes.color.setHex(yes.userData.on ? 0xffd21f : 0x2a2a24);
        S.towerLit.color.setScalar(U.lit);
        if (U.dirty) { for (let i = 0; i < D.length; i++) fleet.glow(i, U.color); U.dirty = false; }
        for (let i = 0; i < D.length; i++) {
          const d = D[i];
          if (i >= U.n) { TM.makeScale(0, 0, 0); TM.setPosition(0, -1000, 0); fleet.body.setMatrixAt(i, TM); fleet.light.setMatrixAt(i, TM); continue; }
          const a = d.ph + d.w * t, x = Math.cos(a) * d.r, z = -26 + Math.sin(a) * d.r;
          const vx = -Math.sin(a) * d.w, vz = Math.cos(a) * d.w;
          TE.set(0, Math.atan2(vx, vz), d.w > 0 ? -0.2 : 0.2);
          TM.compose(TP.set(x, d.y + Math.sin(t * 0.7 + d.bob) * 1.2, z), TQ.setFromEuler(TE), TS.set(2.4, 2.4, 2.4));
          fleet.body.setMatrixAt(i, TM); fleet.light.setMatrixAt(i, TM);
        }
        fleet.commit();
      },
    };
    g.userData.update(0, 0);
    return g;
  }

  // ---------------------------------------------------------- skyline(opts): the Valley and the city as backdrop (shared)
  const riverDist = (x, z) => {   // distance from (x, z) to the river's centreline polyline
    let best = 1e9;
    for (let i = 0; i < RIVER.length - 1; i++) {
      const [ax, az] = RIVER[i], [bx, bz] = RIVER[i + 1], dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz;
      const u = clamp(((x - ax) * dx + (z - az) * dz) / l2, 0, 1), ex = ax + dx * u - x, ez = az + dz * u - z;
      best = Math.min(best, Math.hypot(ex, ez));
    }
    return best;
  };
  const SKY = {   // zenith, horizon, below; cloud colour, cloud opacity, underbelly neon; band colour; sun glow
    storm:        { z: 0x14142a, h: 0x2a2440, b: 0x1a1830, c: 0x34304a, co: 0.85, u: 0.55, band: 0x16141f, sun: 0 },
    midday_storm: { z: 0x3a4248, h: 0x6e6a78, b: 0x4a4852, c: 0x5a5e66, co: 0.9, u: 0.08, band: 0x3a3c44, sun: 0 },
    golden:       { z: 0x6a86b0, h: 0xf0c890, b: 0xc8a070, c: 0xf4d8b0, co: 0.7, u: 0, band: 0x6a5850, sun: 1 },
    clear_night:  { z: 0x04060f, h: 0x141a30, b: 0x0c1020, c: 0x1a1e30, co: 0.25, u: 0.3, band: 0x0c0e18, sun: 0 },
    dawn:         { z: 0x3a4a68, h: 0xb8a8b8, b: 0x6a6878, c: 0x8a90a8, co: 0.7, u: 0.05, band: 0x2a2e3c, sun: 0.4 },
  };
  const SUN = new THREE.Vector3(-0.9, 0.04, 0.42).normalize();
  function skyline(o = {}) {
    const skip = new Set(o.skip || []), has = (id) => !skip.has(id), S = sharedMats();
    const g = new THREE.Group(); g.name = 'skyline';
    const r = rng(2040);
    const body = mesher(), lit = mesher(), vc = mesher(), neon = mesher();
    const LITROW = (i) => [0, 1 - (i + 1) / 4, 1, 1 - i / 4];
    const STREETLAMP = [0.01, 0.985, 0.02, 0.995];
    const TINTS = [0xb05a48, 0x8a5040, 0xc8b8a0, 0xa8a8b0, 0x6a7a8a, 0x8a8478, 0xd0c8b8, 0x7a6a8a, 0x5a6a5a];
    const core = [-74, -47, 64, 112];
    // ---- one lot: facade body, roof, shopfront band, window lights, rooftop clutter
    function lot(x0, z0, x1, z1, h, o2 = {}) {
      const col = o2.tint ?? TINTS[(r() * TINTS.length) | 0], shopH = 3.6, faces = o2.faces ?? 'NSEW', near = !!o2.near;
      const ctrx = (x0 + x1) / 2, ctrz = (z0 + z1) / 2, fl = 3.5;
      const F = [['S', z1, x0, x1, 0, 1], ['N', z0, x0, x1, 0, -1], ['E', x1, z0, z1, 1, 0], ['W', x0, z0, z1, -1, 0]];
      for (const [f, p, a0, a1, fx, fz] of F) {
        const street = faces.includes(f), span = (a1 - a0) / 16, uo = (r() * 4 | 0) / 4;
        const yb = street ? shopH : -1;
        body.color(col).face(f, p, a0, a1, yb, h, [uo, 0, uo + span, (h - yb) / fl]);
        // window lights only on faces that look back toward the Valley (or every face of the named lots)
        const toward = o2.allLit || ((-ctrx) * fx + (-ctrz + 30) * fz) > -40;
        if (toward) {
          const e = 0.06, pp = f === 'S' || f === 'E' ? p + e : p - e;
          for (let y = yb; y + fl <= h + 0.01; y += fl) { const lr = o2.office ? 3 : 1 + ((r() * 2.2) | 0); if (r() < 0.3) continue; const lo = (r() * 4 | 0) / 4; lit.face(f, pp, a0, a1, y, y + fl, [lo, LITROW(lr)[1], lo + span, LITROW(lr)[3]]); }
        }
        if (street) {   // shopfront: dark glass, pilasters, a fascia; the glow comes from the lights layer
          const e = 0.04, pp = f === 'S' || f === 'E' ? p + e : p - e, pe = f === 'S' || f === 'E' ? p + 0.08 : p - 0.08;
          vc.color(0x1c2230).face(f, p, a0, a1, -1, shopH);
          lit.face(f, pp, a0, a1, 0.3, 3.0, [uo, LITROW(0)[1], uo + span, LITROW(0)[3]]);
          vc.color(near ? 0x3a3a42 : 0x2a2a30).face(f, pe, a0, a1, 3.0, shopH);
          if (near) {   // awning + foam on the corners
            const d = 1.4, ax0 = f === 'E' ? p : f === 'W' ? p - d : a0, ax1 = f === 'E' ? p + d : f === 'W' ? p : a1;
            const az0 = f === 'S' ? p : f === 'N' ? p - d : a0, az1 = f === 'S' ? p + d : f === 'N' ? p : a1;
            vc.color(o2.awning ?? 0x2a3038).box(ax0, 3.1, az0, ax1, 3.3, az1, 31 | 32);
            const ex0 = f === 'E' ? p + d - 0.12 : ax0, ex1 = f === 'W' ? p - d + 0.12 : ax1, ez0 = f === 'S' ? p + d - 0.12 : az0, ez1 = f === 'N' ? p - d + 0.12 : az1;
            vc.color(0xefe6d0).box(ex0, 3.05, ez0, ex1, 3.35, ez1, 31 | 32);   // its padded edge
          }
          if (r() < (near ? 0.5 : 0.2)) {   // a neon strip over the shops (magenta / teal)
            const nc = r() < 0.5 ? 0xff3fa4 : 0x2fe8d6, L = Math.min(a1 - a0 - 1, 3 + r() * 6), a = a0 + 0.5 + r() * (a1 - a0 - 1 - L);
            neon.color(nc).face(f, f === 'S' || f === 'E' ? p + 0.1 : p - 0.1, a, a + L, 3.75, 4.05);
          }
        }
      }
      body.color(col);
      vc.color(0x2c2c32).top(x0, z0, x1, z1, h);
      if (near || h > 30) vc.color(0x3a3a40).box(x0, h, z0, x1, h + 0.5, z0 + 0.3, 1 | 2 | 16).box(x0, h, z1 - 0.3, x1, h + 0.5, z1, 1 | 2 | 16).box(x0, h, z0, x0 + 0.3, h + 0.5, z1, 4 | 8 | 16).box(x1 - 0.3, h, z0, x1, h + 0.5, z1, 4 | 8 | 16);
      const nAC = near ? 3 : r() < 0.5 ? 1 : 0;
      for (let i = 0; i < nAC; i++) { const ax = x0 + 1 + r() * (x1 - x0 - 3), az = z0 + 1 + r() * (z1 - z0 - 3); vc.color(r() < 0.5 ? 0x8a8e92 : 0x6a6e72).box(ax, h, az, ax + 1.2 + r(), h + 0.8 + r() * 0.6, az + 1 + r(), 31); }
      if (near && r() < 0.5) { const tx = x0 + 2 + r() * (x1 - x0 - 4), tz = z0 + 2 + r() * (z1 - z0 - 4); vc.color(0x5a5048).box(tx - 0.8, h + 1.4, tz - 0.8, tx + 0.8, h + 2.8, tz + 0.8, 31); for (const [dx, dz] of [[-0.7, -0.7], [0.7, -0.7], [-0.7, 0.7], [0.7, 0.7]]) vc.color(0x3a3a3a).box(tx + dx - 0.05, h, tz + dz - 0.05, tx + dx + 0.05, h + 1.4, tz + dz + 0.05, 15); }
    }
    // ---- ground: a dark base, the street grid, the malls
    vc.color(0x2a2a30).top(-520, -520, 520, 520, -1.0);
    const XS = [-500], ZS = [-500];
    for (let x = -440; x <= -80; x += 60) XS.push(x); for (let x = 70; x <= 490; x += 60) XS.push(x); XS.push(520); XS.sort((a, c) => a - c);
    for (let z = -470; z <= -50; z += 60) ZS.push(z); ZS.push(0, 117); for (let z = 177; z <= 500; z += 60) ZS.push(z); ZS.push(520); ZS.sort((a, c) => a - c);
    const HW = (z) => (z === 0 ? 11 : z === 117 ? 7 : 6);
    // (levels well apart so nothing z-fights from 300 m up: base -1.0, bitumen -0.5, malls -0.4; hosts build at >= -0.1)
    for (const x of XS) if (Math.abs(x) < 500) vc.color(0x111216).top(x - 4.5, -500, x + 4.5, 500, -0.5);
    for (const z of ZS) if (Math.abs(z) < 500) { const hw = HW(z); vc.color(0x111216).top(-500, z - hw + 4, 500, z + hw - 4, -0.5); }
    vc.color(0x3a3c44).top(-8, 11, 8, 110, -0.4);                                // Brunswick St Mall (pavers)
    vc.color(0x4a3436).top(-36, 11, -24, 110, -0.4);                             // Chinatown Mall
    vc.color(0x1a1a20).top(-26, -41, -18, -11, -0.4).top(18, -41, 24, -11, -0.4);   // the lanes
    // street lamps along the grid (warm specks in the lights layer)
    const lamp = (x, z) => lit.top(x - 0.5, z - 0.5, x + 0.5, z + 0.5, 6, STREETLAMP);
    for (const x of XS) if (Math.abs(x) < 480) for (let z = -470; z < 480; z += 30) if (riverDist(x - 7, z) > 60) { lamp(x - 6.5, z); }
    for (const z of ZS) if (Math.abs(z) < 480) for (let x = -470; x < 480; x += 30) if (riverDist(x, z - 7) > 60 && (z !== 0 || Math.abs(x) > 64)) lamp(x, z - HW(z) + 0.5);
    // ---- the named lots round the Valley (mid detail: shopfronts, awnings, foam)
    for (const id in VG.lots) {
      if (id === 'TOWER' || !has(id)) continue;
      const L = VG.lots[id], [x0, z0, x1, z1] = L.box;
      if (id === 'STARLIGHT') {   // dark brick, the dead blade sign, the posters, the stage door
        body.color(0x6a4438);
        for (const [f, p, a0, a1] of [['S', z1, x0, x1], ['E', x1, z0, z1], ['W', x0, z0, z1], ['N', z0, x0, x1]]) body.face(f, p, a0, a1, 0, L.h, [0, 0, (a1 - a0) / 16, L.h / 3.5]);
        vc.color(0x2c2a2e).top(x0, z0, x1, z1, L.h).color(0x3a3436).box(x0, L.h, z1 - 0.3, x1, L.h + 0.6, z1, 31);
        vc.color(0x2f4a3e).face('S', z1 + 0.03, -28.9, -27.9, 0, 2.1).color(0x10141c).face('S', z1 + 0.03, -39, -32, 4.0, 5.2);
        vc.color(0x2a2628).box(-26.75, 3.8, -11.1, -26.45, 11.2, -9.6, 31 | 32);
        const bm = mesher(); bm.color(0xffffff).face('E', -26.42, -11.0, -9.7, 4.0, 11.0).face('W', -26.78, -11.0, -9.7, 4.0, 11.0);
        const blade = bm.mesh(S.blade, 'blade_far', false); g.add(blade);
        continue;
      }
      if (id === 'N2') { lot(x0, z0, x1, z1, L.h, { faces: '', tint: 0x6a5a50 }); continue; }
      const sub = id === 'S2' || id === 'S2b' || id === 'S3' || id === 'S3b' || id === 'SW2';
      if (sub) {   // the long mall lots read as a row of narrower shop buildings
        let z = z0;
        while (z < z1 - 0.1) {
          let w = Math.min(z1 - z, 7 + r() * 6); if (z1 - z - w < 4) w = z1 - z;
          const fc = L.faces.replace(/[NS]/g, '') + (z === z0 && L.faces.includes('N') ? 'N' : '') + (z + w >= z1 - 0.01 && L.faces.includes('S') ? 'S' : '');
          lot(x0, z, x1, z + w, L.h + (r() * 3 - 1.5), { faces: fc, near: true, allLit: true, awning: r() < 0.5 ? 0x5a2a2a : 0x2a3a3a });
          z += w;
        }
      } else lot(x0, z0, x1, z1, L.h, { faces: L.faces, near: true, allLit: true, awning: id === 'SW1' ? 0x4a2030 : undefined });
      if (id === 'SW1') {
        const kq = mesher(); kq.color(0xffffff).face('N', 10.92, -42, -37, 5.0, 10.0);
        const kk = kq.mesh(S.karaoke, 'karaoke_neon', false); g.add(kk);
      }
    }
    // landmark neon for far views (the lots the host didn't skip)
    for (const n of VG.neon) {
      const owner = n.id === 'napclub' ? 'S2' : n.id === 'whisper' || n.id === 'cocktail' ? 'S3' : null;
      if (!owner || !has(owner)) continue;
      const [x, y, z] = n.at;
      if (n.id === 'cocktail') neon.color(n.color).face('N', z - 0.1, x - n.w / 2, x + n.w / 2, y - n.h / 2, y + n.h / 2);
      else neon.color(n.color).face(x < 0 ? 'E' : 'W', x < 0 ? x + 0.1 : x - 0.1, n.at[2] - n.w / 2, n.at[2] + n.w / 2, y - n.h / 2, y + n.h / 2);
    }
    if (has('S2')) for (let z = 15; z < 56; z += 10) { neon.color(z % 20 < 10 ? 0xff3fa4 : 0x2fe8d6).face('E', -7.9, z, z + 1.6, 4.2, 5.0); }
    if (has('S3')) for (let z = 20; z < 56; z += 12) { neon.color(z % 24 < 12 ? 0x2fe8d6 : 0xff3fa4).face('W', 7.9, z, z + 1.4, 4.2, 5.0); }
    // the near mall's dressing for views from above (only when the host doesn't build the mall itself)
    if (has('S2')) {
      for (const z of [16, 40, 46, 52]) { vc.color(0x6a5a48).box(-0.6, -0.15, z - 0.6, 0.6, 0.5, z + 0.6, 31); vc.color(0x2a4a30).box(-1.4, 2.0, z - 1.4, 1.4, 4.0, z + 1.4, 31); }
      for (const [x, z] of [[3.4, 27], [5.6, 28.6], [3.6, 31.4], [5.8, 33.4]]) vc.color(0xefe6d0).box(x - 0.3, 0, z - 0.3, x + 0.3, 2.3, z + 0.3, 31);
      for (let z = 12; z < 57; z += 1) { vc.color(z % 2 ? 0xd8ccb0 : 0xefe6d0).box(-8, 3.1, z, -6.5, 3.3, z + 1, 16).box(6.5, 3.1, z, 8, 3.3, z + 1, 16); }
    }
    // ---- Chinatown: the gate (low poly) and the lantern rows (one InstancedMesh, swinging)
    let LAN = null;
    if (has('CHINATOWN')) {
      for (const x of [-35, -32, -28, -25]) vc.color(0xb0201e).box(x - 0.3, 0, 11.5, x + 0.3, 5.0, 12.1, 31);
      vc.color(0xb0201e).box(-35.6, 5.0, 11.4, -24.4, 5.6, 12.2, 31 | 32).color(0x2f7a4a).box(-32.6, 6.6, 11.0, -27.4, 7.2, 12.6, 31 | 32).box(-36.2, 5.6, 11.1, -32, 6.2, 12.5, 31 | 32).box(-28, 5.6, 11.1, -23.8, 6.2, 12.5, 31 | 32);
      vc.color(0xc9a54a).box(-31.2, 5.9, 11.3, -28.8, 6.6, 11.45, 31);
      for (let z = 13; z <= 57; z += 4) vc.color(0x1a1a1a).box(-36, 5.75, z - 0.02, -24, 5.79, z + 0.02, 31);
      const pos = [];
      const { z0, z1, dz, xs, y } = VG.chinatown.lanternRows;
      for (let z = z0; z <= z1 + 0.01; z += dz) for (const x of xs) pos.push([x, y, z, 0, 1]);
      for (const x of [-34, -33, -31, -29, -27, -26]) pos.push([x, 5.4, 11.8, 0, 1]);
      const lg = new THREE.OctahedronGeometry(0.45, 0); lg.scale(1, 1.15, 1); lg.translate(0, -0.45, 0);
      const im = instanced(lg, S.lantern, pos); im.name = 'lanterns_far'; im.frustumCulled = false;
      im.instanceMatrix.setUsage(THREE.DynamicDrawUsage); g.add(im);
      LAN = { im, pos, ph: pos.map(() => r() * TAU), fq: pos.map(() => 0.6 + r() * 0.3) };
    }
    // ---- the procedural city (seeded): a 60 m street grid out to r 480, lots 2–6 storeys, the odd tall one
    if (has('CITY')) {
      const C = VG.cbd.centre;
      for (let i = 0; i < XS.length - 1; i++) for (let j = 0; j < ZS.length - 1; j++) {
        const bx0 = XS[i] + 6, bx1 = XS[i + 1] - 6, bz0 = ZS[j] + HW(ZS[j]), bz1 = ZS[j + 1] - HW(ZS[j + 1]);
        if (bx1 - bx0 < 8 || bz1 - bz0 < 8) continue;
        const cx = (bx0 + bx1) / 2, cz = (bz0 + bz1) / 2;
        if (Math.hypot(cx, cz) > 470) continue;
        if (bx0 < core[2] && bx1 > core[0] && bz0 < core[3] && bz1 > core[1]) continue;
        if (Math.hypot(cx - C[0], cz - C[2]) < VG.cbd.r + 30) continue;
        const along = bx1 - bx0 >= bz1 - bz0, n = 2 + ((r() * 3) | 0), Lb = along ? bx1 - bx0 : bz1 - bz0;
        let a = along ? bx0 : bz0;
        for (let k = 0; k < n; k++) {
          const w = k === n - 1 ? (along ? bx1 : bz1) - a : Lb / n * (0.7 + r() * 0.6);
          const lx0 = along ? a : bx0, lx1 = along ? a + w : bx1, lz0 = along ? bz0 : a, lz1 = along ? bz1 : a + w;
          a += w;
          if (lx1 - lx0 < 4 || lz1 - lz0 < 4) continue;
          const mx = (lx0 + lx1) / 2, mz = (lz0 + lz1) / 2;
          if (riverDist(mx, mz) < VG.river.half + 8 + Math.max(lx1 - lx0, lz1 - lz0) / 2) continue;
          const tall = r() < 0.1, h = tall ? 40 + r() * 50 : 6 + ((r() * 5) | 0) * 3.5;
          // street faces: the ones on the block's boundary
          let faces = '';
          if (lz1 >= bz1 - 0.01) faces += 'S'; if (lz0 <= bz0 + 0.01) faces += 'N'; if (lx1 >= bx1 - 0.01) faces += 'E'; if (lx0 <= bx0 + 0.01) faces += 'W';
          lot(lx0 + 0.3, lz0 + 0.3, lx1 - 0.3, lz1 - 0.3, h, { faces: Math.hypot(mx, mz) < 260 ? faces : '', office: tall });
        }
      }
    }
    // ---- the CBD: towers with lit window grids, south-west across the river bend
    if (has('CBD')) {
      const C = VG.cbd.centre, rc = rng(4041);
      for (let i = 0; i < VG.cbd.count; i++) {
        const a = rc() * TAU, d = Math.sqrt(rc()) * VG.cbd.r, x = C[0] + Math.cos(a) * d, z = C[2] + Math.sin(a) * d;
        const w = 14 + rc() * 14, dd = 14 + rc() * 12, h = VG.cbd.hMin + rc() * (VG.cbd.hMax - VG.cbd.hMin);
        lot(x - w / 2, z - dd / 2, x + w / 2, z + dd / 2, h, { faces: '', office: true, tint: rc() < 0.5 ? 0x8a96a4 : 0x6a7684, allLit: true });
        if (rc() < 0.4) vc.color(0x3a4048).box(x - 1, h, z - 1, x + 1, h + 8 + rc() * 10, z + 1, 31);
      }
    }
    // ---- the river and its banks
    if (has('RIVER')) {
      const rv = mesher(), hw = VG.river.half, ry = VG.river.y;
      const side = (i, sg) => { const [ax, az] = RIVER[Math.max(0, i - 1)], [bx, bz] = RIVER[Math.min(RIVER.length - 1, i + 1)], dx = bx - ax, dz = bz - az, l = Math.hypot(dx, dz); return [RIVER[i][0] - dz / l * hw * sg, RIVER[i][1] + dx / l * hw * sg]; };
      let u = 0;
      for (let i = 0; i < RIVER.length - 1; i++) {
        const [lx0, lz0] = side(i, 1), [rx0, rz0] = side(i, -1), [lx1, lz1] = side(i + 1, 1), [rx1, rz1] = side(i + 1, -1);
        const du = Math.hypot(RIVER[i + 1][0] - RIVER[i][0], RIVER[i + 1][1] - RIVER[i][1]) / 40;
        rv.color(0x8a9ab8).quad(rx0, ry, rz0, rx1, ry, rz1, lx1, ry, lz1, lx0, ry, lz0, u, 0, u + du, 1);
        // banks (concrete) as vertical walls on both edges
        vc.color(0x4a4a50).quad(lx0, ry, lz0, lx1, ry, lz1, lx1, -1.0, lz1, lx0, -1.0, lz0).quad(rx1, ry, rz1, rx0, ry, rz0, rx0, -1.0, rz0, rx1, -1.0, rz1);
        u += du;
      }
      g.add(rv.mesh(S.river, 'river', false));
    }
    // ---- the Story Bridge: a cantilever truss, side-on from the tower
    let BL = null;
    if (has('BRIDGE')) {
      const B = VG.bridge, [ax, , az] = B.a, [bx, , bz] = B.b, L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, px = -uz, pz = ux;
      const P = (s, y, side) => [ax + ux * s + px * side * 9, y, az + uz * s + pz * side * 9];
      const sT = [Math.hypot(B.towers[0][0] - ax, B.towers[0][1] - az), Math.hypot(B.towers[1][0] - ax, B.towers[1][1] - az)];
      const Y0 = B.deckY, top = (s) => {   // top chord: low at the ends, peaks over the towers, dips at mid-span
        const m = (sT[0] + sT[1]) / 2;
        if (s <= sT[0]) return Y0 + 6 + (B.towerH - Y0 - 6) * Math.pow(s / sT[0], 1.6);
        if (s >= sT[1]) return Y0 + 6 + (B.towerH - Y0 - 6) * Math.pow((L - s) / (L - sT[1]), 1.6);
        const k = Math.abs(s - m) / (m - sT[0]); return Y0 + 10 + (B.towerH - Y0 - 10) * k * k;
      };
      const bl = mesher();
      // deck + approach ramps
      const deck = (s0, s1, y0, y1) => { const a0 = P(s0, y0, -1.1), a1 = P(s1, y1, -1.1), b0 = P(s0, y0, 1.1), b1 = P(s1, y1, 1.1); vc.color(0x3a3a40).quad(a0[0], a0[1], a0[2], a1[0], a1[1], a1[2], b1[0], b1[1], b1[2], b0[0], b0[1], b0[2]).quad(b0[0], b0[1] - 1.4, b0[2], b1[0], b1[1] - 1.4, b1[2], a1[0], a1[1] - 1.4, a1[2], a0[0], a0[1] - 1.4, a0[2]); vc.color(0x2a2a30).quad(a0[0], a0[1] - 1.4, a0[2], a1[0], a1[1] - 1.4, a1[2], a1[0], a1[1], a1[2], a0[0], a0[1], a0[2]).quad(b1[0], b1[1] - 1.4, b1[2], b0[0], b0[1] - 1.4, b0[2], b0[0], b0[1], b0[2], b1[0], b1[1], b1[2]); };
      deck(-90, 0, 0.5, Y0); deck(0, L, Y0, Y0); deck(L, L + 90, Y0, 0.5);
      for (const s of [-60, -30, L + 30, L + 60]) { const q = P(s, 0, 0), yy = s < 0 ? 0.5 + (Y0 - 0.5) * (1 + s / 90) : 0.5 + (Y0 - 0.5) * (1 - (s - L) / 90); vc.color(0x5a5a60).box(q[0] - 2, -2, q[2] - 2, q[0] + 2, yy - 1.4, q[2] + 2, 15); }
      for (const s of sT) for (const sd of [-1, 1]) { const q = P(s, 0, sd); vc.color(0x6a6a70).box(q[0] - 2.2, -2, q[2] - 2.2, q[0] + 2.2, Y0 - 1.4, q[2] + 2.2, 15); }
      // the two trusses
      const STEP = L / 24;
      for (const sd of [-1, 1]) {
        for (let i = 0; i < 24; i++) {
          const s0 = i * STEP, s1 = s0 + STEP, t0 = top(s0), t1 = top(s1);
          let p = P(s0, t0, sd), q = P(s1, t1, sd); vc.color(0x4a5058).beam(p[0], p[1], p[2], q[0], q[1], q[2], 1.2);
          p = P(s0, Y0, sd); q = P(s1, Y0, sd); vc.beam(p[0], p[1], p[2], q[0], q[1], q[2], 1.0);
          p = P(s0, Y0, sd); q = P(s0, t0, sd); vc.beam(p[0], p[1], p[2], q[0], q[1], q[2], 0.6);
          p = i % 2 ? P(s0, Y0, sd) : P(s0, t0, sd); q = i % 2 ? P(s1, t1, sd) : P(s1, Y0, sd); vc.beam(p[0], p[1], p[2], q[0], q[1], q[2], 0.5);
          if (i % 2 === 0) { const lp = P(s0 + STEP / 2, (t0 + t1) / 2 + 0.8, sd); bl.color(0xcfe0ff).box(lp[0] - 0.5, lp[1] - 0.5, lp[2] - 0.5, lp[0] + 0.5, lp[1] + 0.5, lp[2] + 0.5, 31); }
        }
        for (let s = 0; s <= L; s += 9) { const lp = P(s, Y0 + 1.2, sd * 1.05); bl.color(0xffe0a8).box(lp[0] - 0.35, lp[1] - 0.35, lp[2] - 0.35, lp[0] + 0.35, lp[1] + 0.35, lp[2] + 0.35, 31); }
      }
      for (const s of sT) for (let y = Y0 + 6; y < top(s) - 2; y += 9) { const p = P(s, y, -1), q = P(s, y, 1); vc.color(0x4a5058).beam(p[0], p[1], p[2], q[0], q[1], q[2], 0.6); }
      BL = bl.mesh(S.bridgeLit, 'bridge_lights', false); g.add(BL);
    }
    // ---- assemble the city meshes
    g.add(body.mesh(S.city, 'city_facades', {}));
    g.add(lit.mesh(S.cityLit, 'city_lights', false));
    g.add(vc.mesh(S.vc, 'city_ground', {}));
    if (neon.count) g.add(neon.mesh(S.neon, 'city_neon', false));
    // ---- sky dome, horizon band, Mt Coot-tha, clouds, rain haze
    const domeG = new THREE.SphereGeometry(540, 32, 14, 0, TAU, 0, 1.78);
    domeG.setAttribute('color', new THREE.BufferAttribute(new Float32Array(domeG.attributes.position.count * 3), 3));
    const dome = new THREE.Mesh(domeG, S.sky); dome.name = 'sky_dome'; dome.renderOrder = -10; dome.frustumCulled = false; g.add(dome);
    const bandG = new THREE.CylinderGeometry(500, 500, 70, 48, 1, true); bandG.translate(0, 27, 0);
    const band = new THREE.Mesh(bandG, S.band); band.name = 'horizon_band'; band.renderOrder = -9; band.frustumCulled = false; g.add(band);
    const ct = mesher(), [cxo, , czo] = VG.cootha.at, CZ0 = czo - 110, CZ1 = czo + 110, CY0 = -4, CY1 = 106;
    ct.color(0xffffff).face('E', cxo, CZ0, CZ1, CY0, CY1);
    const cth = ct.mesh(S.cootha, 'cootha', false); cth.renderOrder = -8; g.add(cth);
    const ms = mesher();
    for (const [px, h] of MASTS) { const y = CY1 - (hillTop(px) + 2 - h) / 64 * (CY1 - CY0), z = CZ1 - (px + 1) / 128 * (CZ1 - CZ0); ms.color(0xffffff).box(cxo + 1, y - 1.2, z - 1.2, cxo + 3.4, y + 1.2, z + 1.2, 31); }
    const masts = ms.mesh(S.masts, 'masts', false); g.add(masts);
    // heavy cloud cards all round (denser over the mall's two ends); their bottom edges take the city's neon underbelly
    const cl = mesher(), rcl = rng(66), UW = [], UT = [];
    for (let i = 0; i < 9; i++) {
      const a = i * TAU / 9 + (rcl() - 0.5) * 0.4, d = 260 + rcl() * 150, y = 140 + rcl() * 100, w = 200 + rcl() * 140, hh = 70 + rcl() * 40;
      const cx = Math.cos(a) * d, cz = -Math.sin(a) * d, tx = -Math.sin(a) * w / 2, tz = -Math.cos(a) * w / 2, tt = i % 2;
      cl.color(0xffffff).quad(cx - tx, y - hh / 2, cz - tz, cx + tx, y - hh / 2, cz + tz, cx + tx, y, cz + tz, cx - tx, y, cz - tz, 0, 0, 1, 0.5)
        .quad(cx - tx, y, cz - tz, cx + tx, y, cz + tz, cx + tx, y + hh / 2, cz + tz, cx - tx, y + hh / 2, cz - tz, 0, 0.5, 1, 1)
        .quad(cx + tx * 0.2, y + hh * 0.15, cz + tz * 0.2, cx + tx * 1.0, y + hh * 0.15, cz + tz * 1.0, cx + tx * 1.0, y + hh * 0.85, cz + tz * 1.0, cx + tx * 0.2, y + hh * 0.85, cz + tz * 0.2, 1, 0, 0, 1);
      UW.push(1, 1, 0.25, 1, 0.25, 0.25, 0.25, 0.25, 0, 0.25, 0, 0, 0.8, 0.8, 0, 0.8, 0, 0);
      for (let k = 0; k < 18; k++) UT.push(tt);
    }
    const clouds = cl.mesh(S.cloud, 'clouds', false); clouds.renderOrder = -7; clouds.frustumCulled = false; g.add(clouds);
    const hz = mesher();
    for (let i = 0; i < 7; i++) { const a = -H + (i - 3) * 0.45, d = 160 + (i % 3) * 70, cx = Math.cos(a) * d, cz = -Math.sin(a) * d, tx = -Math.sin(a) * 90, tz = -Math.cos(a) * 90; hz.color(0xffffff).quad(cx - tx, -1, cz - tz, cx + tx, -1, cz + tz, cx + tx, 170, cz + tz, cx - tx, 170, cz - tz, 0, 0, 1, 1); }
    const haze = hz.mesh(S.haze, 'rain_haze', false); haze.visible = false; haze.renderOrder = 3; g.add(haze);
    // ---- street life (far): crowd dots in the two malls, traffic dots on Ann St / Wickham St
    let CROWD = null, TRAF = null;
    if (has('CROWD')) {
      const n = 160, pa = new Float32Array(n * 3), ca = new Float32Array(n * 3), base = new Float32Array(n * 3), rr = rng(160);
      for (let i = 0; i < n; i++) {
        const ct2 = i % 3 === 0, x = ct2 ? -35 + rr() * 10 : -7 + rr() * 14, z = 12 + rr() * 96;
        pa[i * 3] = x; pa[i * 3 + 1] = 1.0; pa[i * 3 + 2] = z;
        const k = 0.35 + rr() * 0.4; base[i * 3] = k * (0.8 + rr() * 0.4); base[i * 3 + 1] = k * (0.7 + rr() * 0.3); base[i * 3 + 2] = k * (0.8 + rr() * 0.4);
        ca.set([base[i * 3], base[i * 3 + 1], base[i * 3 + 2]], i * 3);
      }
      const cg = new THREE.BufferGeometry(); cg.setAttribute('position', new THREE.BufferAttribute(pa, 3)); cg.setAttribute('color', new THREE.BufferAttribute(ca, 3));
      cg.attributes.position.setUsage(THREE.DynamicDrawUsage); cg.attributes.color.setUsage(THREE.DynamicDrawUsage);
      const pts = new THREE.Points(cg, S.dots); pts.name = 'crowd_dots'; pts.frustumCulled = false; g.add(pts);
      CROWD = { pts, pa, ca, base, n, mode: 'quiet', sp: Array.from({ length: n }, () => (rr() - 0.5) * 1.2) };
    }
    if (has('TRAFFIC')) {
      const n = 24, pa = new Float32Array(n * 3), ca = new Float32Array(n * 3), rr = rng(24);
      const lanes = [-3.5, 3.5, 113.5, 120.5];
      const T = [];
      for (let i = 0; i < n; i++) { const ln = lanes[i % 4]; T.push({ z: ln, x: -480 + rr() * 960, v: (ln < 0 || ln === 113.5 ? 1 : -1) * (7 + rr() * 4) }); ca[i * 3] = 1; ca[i * 3 + 1] = i % 2 ? 0.95 : 0.25; ca[i * 3 + 2] = i % 2 ? 0.8 : 0.2; pa[i * 3 + 1] = 0.6; }
      const tg = new THREE.BufferGeometry(); tg.setAttribute('position', new THREE.BufferAttribute(pa, 3)); tg.setAttribute('color', new THREE.BufferAttribute(ca, 3));
      tg.attributes.position.setUsage(THREE.DynamicDrawUsage);
      const pts = new THREE.Points(tg, S.dots); pts.name = 'traffic_dots'; pts.frustumCulled = false; g.add(pts);
      TRAF = { pts, pa, T };
    }
    // ---- state + API
    const st = { lv: o.neon ?? 0.35, from: o.neon ?? 0.35, to: o.neon ?? 0.35, lt: 1, ldur: 0, swing: false, sw: 0, rain: false, mode: '', flash: 0, flashT: -1, flashDur: 0.12, flashK: 1, bridge: true, crowd: 'quiet' };
    function paintSky(mode) {
      const P = SKY[mode] || SKY.storm, za = new THREE.Color(P.z), ho = new THREE.Color(P.h), be = new THREE.Color(P.b), out = new THREE.Color(), sun = new THREE.Color(0xffd8a0);
      const pos = domeG.attributes.position, col = domeG.attributes.color;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), y = pos.getY(i) / 540, z = pos.getZ(i);
        if (y >= 0) out.lerpColors(ho, za, smooth(Math.min(1, y / 0.55))); else out.lerpColors(ho, be, smooth(Math.min(1, -y / 0.2)));
        if (P.sun) { const l = Math.hypot(x, z) || 1, d = Math.max(0, (x * SUN.x + z * SUN.z) / l); out.lerp(sun, P.sun * Math.pow(d, 6) * (1 - Math.min(1, Math.abs(y) * 2.5))); }
        col.setXYZ(i, out.r, out.g, out.b);
      }
      col.needsUpdate = true;
      const cc = clouds.geometry.attributes.color, uc = new THREE.Color(0xff6ab4), tcc = new THREE.Color(0x4ae8d8);
      for (let i = 0; i < cc.count; i++) {
        const k = UW[i] * P.u, base = UT[i] ? tcc : uc;
        cc.setXYZ(i, 1 + (base.r * 2.2 - 1) * k, 1 + (base.g * 2.2 - 1) * k, 1 + (base.b * 2.2 - 1) * k);
      }
      cc.needsUpdate = true;
      S.cloud.color.setHex(P.c); S.cloud.opacity = P.co; S.band.color.setHex(P.band); S.cootha.color.setHex(P.band);
      st.mode = mode; st.cloudBase = P.c;
    }
    paintSky(o.sky || 'storm');
    const cBase = new THREE.Color(), cFlash = new THREE.Color(0xd8e0ff);
    g.userData = {
      lit(k, dur = 0) { st.from = st.lv; st.to = k; st.ldur = dur; st.lt = dur > 0 ? 0 : 1; if (!(dur > 0)) st.lv = k; },
      swing(on) { st.swing = !!on; },
      rain(on) { st.rain = !!on; haze.visible = st.rain; },
      crowd(mode) { st.crowd = mode; if (CROWD) { CROWD.pts.visible = mode !== 'none'; CROWD.pts.geometry.setDrawRange(0, mode === 'quiet' ? 70 : CROWD.n); } },
      sky(mode) { if (SKY[mode] && mode !== st.mode) paintSky(mode); },
      flash(k = 1) { st.flashK = k; st.flashT = 0; st.flashDur = typeof options !== 'undefined' && options.reduceFlashing ? 1.5 : 0.12; },
      bridgeLights(on) { st.bridge = !!on; if (BL) BL.visible = st.bridge; },
      get level() { return st.lv; },
      update(dt, t) {
        if (st.lt < 1) { st.lt = Math.min(1, st.lt + dt / st.ldur); st.lv = st.from + (st.to - st.from) * smooth(st.lt); }
        const lv = st.lv, win = 0.5 + 0.5 * clamp((lv - 0.35) / 0.65, 0, 1);
        S.neon.color.setScalar(lv); S.karaoke.color.setScalar(Math.min(1, lv * 1.1)); S.cityLit.color.setScalar(win * 0.9);
        S.blade.color.setHex(lv > 0.7 ? 0xff4fa0 : 0x4a4650); S.lantern.color.setRGB(1.0 * (0.75 + 0.25 * lv), 0.42 * (0.75 + 0.25 * lv), 0.23);
        // lightning on the clouds (a short spike, or the Reduce Flashing swell to <= 40%)
        cBase.setHex(st.cloudBase);
        if (st.flashT >= 0) {
          st.flashT += dt; const u = st.flashT / st.flashDur, rf = st.flashDur > 1;
          const k = rf ? 0.4 * st.flashK * Math.sin(Math.min(1, u) * PI) : st.flashK * (u < 1 ? 1 - u * 0.5 : 0);
          cBase.lerp(cFlash, clamp(k, 0, 1));
          if (u >= 1) st.flashT = -1;
        }
        S.cloud.color.copy(cBase);
        clouds.rotation.y = t * 0.0015;
        masts.visible = (t % 1.6) < 0.5;
        if (st.rain) ST.haze.offset.y = -t * 0.35;
        if (LAN) {
          const tgt = st.swing ? 1 : 0;
          if (st.sw !== tgt || st.swing) {
            st.sw += clamp(tgt - st.sw, -dt * 0.5, dt * 0.5);
            for (let i = 0; i < LAN.pos.length; i++) {
              const p = LAN.pos[i], a = st.sw * 0.25 * Math.sin(t * TAU * LAN.fq[i] + LAN.ph[i]);
              TE.set(a, 0, a * 0.4); TM.compose(TP.set(p[0], p[1], p[2]), TQ.setFromEuler(TE), TS.set(1, 1, 1)); LAN.im.setMatrixAt(i, TM);
            }
            LAN.im.instanceMatrix.needsUpdate = true;
          }
        }
        if (CROWD && CROWD.pts.visible) {
          const n = st.crowd === 'quiet' ? 70 : CROWD.n, lu = st.crowd === 'look_up';
          for (let i = 0; i < n; i++) {
            if (!lu) { let z = CROWD.pa[i * 3 + 2] + CROWD.sp[i] * dt; if (z > 109) z = 12; else if (z < 12) z = 109; CROWD.pa[i * 3 + 2] = z; }
            const blink = lu && ((t * 1.3 + i * 0.37) % 1) < 0.25;
            CROWD.ca[i * 3] = blink ? 0.6 : CROWD.base[i * 3]; CROWD.ca[i * 3 + 1] = blink ? 0.85 : CROWD.base[i * 3 + 1]; CROWD.ca[i * 3 + 2] = blink ? 1 : CROWD.base[i * 3 + 2];
          }
          CROWD.pts.geometry.attributes.position.needsUpdate = true; CROWD.pts.geometry.attributes.color.needsUpdate = true;
        }
        if (TRAF) {
          for (let i = 0; i < TRAF.T.length; i++) { const c = TRAF.T[i]; c.x += c.v * dt; if (c.x > 480) c.x -= 960; else if (c.x < -480) c.x += 960; TRAF.pa[i * 3] = c.x + (i % 2 ? 0 : -c.v * 0.3); TRAF.pa[i * 3 + 2] = c.z; }
          TRAF.pts.geometry.attributes.position.needsUpdate = true;
        }
      },
    };
    g.userData.crowd('quiet');
    g.userData.update(0, 0);
    return g;
  }

  // ============================================================ THE SET
  const COL = [], R = {};
  function build() {
    COL.length = 0;
    const root = new THREE.Group(); R.root = root;
    b = new Builder(); XF = null; tint = [1, 1, 1];
    const regF = new THREE.Group(); regF.name = 'region_f'; root.add(regF);
    R.tower = tower({ podium: 'night' }); regF.add(R.tower);
    R.sky = skyline({ skip: ['STARLIGHT', 'S2', 'S3', 'CHINATOWN', 'TOWER', 'CROWD', 'TRAFFIC'] }); regF.add(R.sky);
    // (placeholder ground until the street is built)
    bb(-120, -0.2, -11, 120, -0.1, 11, 0x1a1a20);
    root.add(b.done());
    R.tower.userData.countdown.set(16, 28, 0).run(1);
    return root;
  }
  function update(dt, ctx) {
    if (!R.root) return;
    R.tower.userData.update(dt, ctx.t);
    R.sky.userData.update(dt, ctx.t);
  }
  return {
    env: {
      quiet:      { bg: 0x0c0e1c, fog: [0x1b1830, 0.016], hemi: [0x5a5a8e, 0x1a1218, 0.62], dir: [0x9aa2d8, 0.32, [-20, 30, 10]], spot: [0xffb6d0, 1.6], rain: 0 },
    },
    build,
    marks: {},
    anchors: {
      s28_crane_a: { at: [0.0, 112.0, -10.7], from: [10.0, 118.0, 26.0], fov: 46 },
      tower_countdown: { at: [0.0, 112.0, -10.7], from: [-2.0, 1.7, 30.0], fov: 18 },
      tower_from_mall: { at: [0.0, 50.0, -11.0], from: [1.0, 1.6, 48.0], fov: 50 },
      t_city_s: { at: [0, 20, 300], from: [0, 127, -12], fov: 60 },
      t_city_sw: { at: [-240, 40, 230], from: [0, 127, -12], fov: 50 },
      t_bridge: { at: [181, 40, 330], from: [0, 127, -12], fov: 40 },
      t_roof: { at: [0, 137, -36], from: [0, 133, -14], fov: 60 },
      t_atrium_out: { at: [-20, 4, 20], from: [0, 1.7, -14], fov: 60 },
    },
    cams: { mall_head: { type: 'fixed', pos: [-6.8, 5.4, 27.0], look: [1.0, 3.0, 14.0], fov: 48 } },
    zones: [],
    colliders: COL,
    VG, tower, skyline, countdown,
    ambience: { loops: [], room: 'none' },
    update,
  };
})();
