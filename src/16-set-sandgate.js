// ============================================================ SET: sandgate — Sandgate station forecourt, Sunday 23 December 2040
// Scene 2.6 "Snag" (2.6_luke, the Sausage Sizzle mini-game, 2.6_invite) and the first INSERT of 2.7 (the fare gate).
// Spec: docs/sets/sandgate.md. Layout (metres, Y up, plaza y = 0 everywhere walkable, no floor()):
//   +Z = toward the street (Brighton Road, kerb z 9.6, road z 9.8..16.8, shops across the road z 19..30).
//   The station facade is the line z = -10 facing +Z (brick base, glazing, a blank name panel over the 6 m portal
//   x -3..3, y 0..3.4); the canopy (x -13..13, z -10..-5.6, underside y 4.4) carries 24 Christmas bunting flags.
//   Entrance hall x -6..6, z -16..-10 (ceiling 3.6): fare gates on the line z -13.6, lanes 0/1/2 = x -2.45..-1.15 |
//   -0.65..0.65 | 1.15..2.45 (lane 2 is the one 2.7 uses: its reader sits on the cabinet at x 0.90, z -13.0). Back
//   glazing z -16 -> the platform (z -16..-20.3) and a standing 2-car train (z -20.4..-23.2), never walked.
//   The charity gazebo (red/white, DOLPHINS valance) x -8.4..-3.6, z -3.6..-0.4: hotplate x -8.0..-6.2 z -3.0..-2.4
//   (top 0.92, six snags at x -7.85 + 0.19 i, z -2.72), front table x -7.6..-4.4 z -1.15..-0.45 (top 0.76, items at
//   z -0.80: urn -7.30, bread -6.90, snag tray -6.45, onion tray -6.05, build spot -5.60, sauces -5.15/-5.00, napkins,
//   cash tin -4.65). Queue: serve point (-5.6, 0.15) facing -Z, q_1..q_5 every 0.9 m toward +Z. A-frame sign (-2.9, 0.3).
//   Moreton Bay fig (10, 2) with a ring bench; bus shelter (8, 8.6); bollards z 9.45; palms (-14, 4), (13.5, -7).
//   Far: suburb band r 380, the storm wall (6 anvil cards 220-320 m to -Z), cumulus over the street, sun disc.
// Env: arvo26 (default, 15:00 hot) · gust26 (wind up, storm closer) · gates27 (16:28 overcast, cool gate pool).
// Dress (dress(state, {keepEnv})): luke26 · sizzle26 · invite26 · gates27 · credits. AUTO: 2.6 -> luke26, 2.7 -> gates27, C -> credits.
// Marks: kettle luke_hot q_serve q_1..q_5 q_exit q_enter s26_arrive_chase/luka/c40 s26_chase_march s26_luka_back
//   s26_c40_back s26_c40_aside sz_luka sz_luke sz_luke_takeover sz_luka_aside sz_chase sz_c40 s26_sample_sizzle
//   s26_luke_invite s26_inv_chase/luka/c40 s26_go_1..3 s26_luke_watch s27_gate_c40 s27_gate_chase s27_gate_luka.
// Anchors: s26_luke_wide s26_table_two s26_luke_ots s26_sign s26_tin sz_hot sz_front s26_snags_insert s26_onions
//   s26_apron s26_exit_wide s27_gate_tap s27_hall_wide credits_sizzle.
// Cams: plaza_w (default) plaza_e corner entrance hall sz_hot sz_front. Zones: hall, entrance, plaza_w (x < -1.5),
//   corner (x 6..16, z -1..9.6: the fig and the arrivals corner), plaza_e (the rest of the east half), street (plaza_w).
// Deviations from the spec (docs/sets/sandgate.md), all for composition: sz_hot (and its anchor) looks from the customer
//   side over the plate at Luka and Luke (the spec lens sat behind both cooks' backs); entrance is a pan cam on the portal
//   axis (the spec position had the (4, -6) column dead centre); the corner cam/zone is new; s26_exit_wide aims further
//   left so Luke at the plate is in frame; the hotplate's wind guard is on its +Z (customer) side.
// Queue (SETS.sandgate.queue): reset(n, live?) · front() · advance() · count · bubble(i, out) · look(i) · visits(i) · length()
//   · live(on, target) · leave(i). Customers are queue indices 0..4 = looks sizzle_a..e.
// Props (userData APIs): hotplate.sizzle(level) · snags.set(i, state|u, side?) / turn(i) / reset() · onions.stir() /
//   cook(u) · tongs_spare · order_build.show({bread, snag, onions, sauce}) / give() · sauces.squeeze(kind) ·
//   cash_tin.open(bool) · urn · sizzle_sign · sizzle_table · gazebo · bunting · customers (= queue API) ·
//   fare_gates.open(lane, on) / reader(lane, mode) · train_standing.glow(on) · traffic · fig ·
//   far.storm.build(u, dur) / flicker(on). Set-level: SETS.sandgate.sizzle / queue / paths / storm / wind / dress.
// Static geometry is vertex-coloured into one material (one draw call); painted 64-256 px textures (nearest) only
// where something must read. Customers are five set-owned rigs (sizzle_a..e, built once). No per-frame allocation.
SETS.sandgate = (() => {
  const PI = Math.PI, H = PI / 2, TAU = PI * 2;
  // palette (spec §3.1)
  const KERB = 0xcfc8ba, BRICK = 0xa8604a, FRAME = 0x3a4250, CANOPY = 0xd8dce0, FOAM = 0xefe6d0, LEG = 0xb8bec4,
    STEEL = 0x5d5f63, BREADC = 0xf4ead2, TOM = 0xc8302c, BBQ = 0x5a2e1e, URN = 0xc8ccd0, LEAF = 0x3f6a3a, TRUNK = 0x8a7c6a,
    ASPH = 0x5c5e62, GLASSD = 0x4d6274, CREAM = 0xf2ede2;   // pavers, canopy red/white, sign paint: in the painted textures
  const OUT = [1.05, 1.0, 0.92], SHADE = [0.97, 0.95, 0.93], HALL = [0.88, 0.91, 0.97], PLAT = [0.93, 0.95, 1.0], ONE = [1, 1, 1];
  const COL = [];                // colliders (filled by build)
  const R = { state: 'luke26', scene: null, env: null };   // live prop refs + runtime state (survives rebuilds)
  const tc = new THREE.Color(), tc2 = new THREE.Color(), m4 = new THREE.Matrix4(), m5 = new THREE.Matrix4();
  const qv = new THREE.Quaternion(), ev = new THREE.Euler(), pv = new THREE.Vector3(), sv = new THREE.Vector3(), yUp = new THREE.Vector3(0, 1, 0);
  let b = null, tint = OUT, XF = null, T = null, M = null, SKYM = null, CUST = null;

  // ---------------------------------------------------------- geometry helpers (into the current Builder `b`)
  function put(g, hex, m) {
    if (XF) g.applyMatrix4(XF);
    tc.set(hex);
    const r = tc.r * tint[0], gg = tc.g * tint[1], bl = tc.b * tint[2], n = g.attributes.position.count, a = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { a[i * 3] = r; a[i * 3 + 1] = gg; a[i * 3 + 2] = bl; }
    g.setAttribute('color', new THREE.BufferAttribute(a, 3));
    b.geo(g, m || M.vc);
  }
  // box: y is the BOTTOM. bb: min/max corners. boxR: centred, any rotation. cyl/ico: centred.
  function box(w, h, d, hex, x, y, z, ry = 0, m) { const g = new THREE.BoxGeometry(w, h, d); if (ry) g.rotateY(ry); g.translate(x, y + h / 2, z); put(g, hex, m); }
  function bb(x0, y0, z0, x1, y1, z1, hex, m) { box(x1 - x0, y1 - y0, z1 - z0, hex, (x0 + x1) / 2, y0, (z0 + z1) / 2, 0, m); }
  function boxR(w, h, d, hex, x, y, z, rx = 0, ry = 0, rz = 0, m) {
    const g = new THREE.BoxGeometry(w, h, d); g.rotateX(rx); g.rotateZ(rz); g.rotateY(ry); g.translate(x, y, z); put(g, hex, m);
  }
  function cyl(rt, rb, h, seg, hex, x, y, z, rx = 0, rz = 0, m) {
    const g = new THREE.CylinderGeometry(rt, rb, h, seg); if (rx) g.rotateX(rx); if (rz) g.rotateZ(rz); g.translate(x, y, z); put(g, hex, m);
  }
  function ico(r, hex, x, y, z, sy = 1, m) { const g = new THREE.IcosahedronGeometry(r, 0); g.scale(1, sy, 1); g.translate(x, y, z); put(g, hex, m); }
  // quad faces +Z before rotation (rx first, then ry): floor rx=-H, ceiling rx=H, wall facing -X ry=-H.
  function quad(w, h, m, x, y, z, ry = 0, rx = 0, hex = 0xffffff) {
    const g = new THREE.PlaneGeometry(w, h); if (rx) g.rotateX(rx); if (ry) g.rotateY(ry); g.translate(x, y, z); put(g, hex, m);
  }
  // a quad showing the pixel rect [x0, y0, x1, y1] (top-left origin) of a W x Hh canvas texture
  function rquad(w, h, m, rc, x, y, z, ry = 0, rx = 0, hex = 0xffffff, W = 256, Hh = 256) {
    const g = new THREE.PlaneGeometry(w, h), uv = g.attributes.uv;
    for (let i = 0; i < 4; i++) uv.setXY(i, uv.getX(i) > 0.5 ? rc[2] / W : rc[0] / W, uv.getY(i) > 0.5 ? 1 - rc[1] / Hh : 1 - rc[3] / Hh);
    if (rx) g.rotateX(rx); if (ry) g.rotateY(ry); g.translate(x, y, z); put(g, hex, m);
  }
  // a tiled quad: the texture repeats every `tile` metres (textures made with repeat [1, 1])
  function tquad(w, h, m, x, y, z, ry = 0, rx = 0, tile = 1, hex = 0xffffff, ox = 0, oy = 0) {
    const g = new THREE.PlaneGeometry(w, h), uv = g.attributes.uv;
    for (let i = 0; i < 4; i++) uv.setXY(i, ox + uv.getX(i) * w / tile, oy + uv.getY(i) * h / tile);
    if (rx) g.rotateX(rx); if (ry) g.rotateY(ry); g.translate(x, y, z); put(g, hex, m);
  }
  // a convex polygon (fan) with explicit uvs: pts [[x,y,z]...], uvs [[u,v]...]
  function poly(pts, uvs, m, hex) {
    const n = pts.length - 2, p = new Float32Array(n * 9), u = new Float32Array(n * 6);
    for (let k = 0; k < n; k++) for (const [j, s] of [[0, 0], [1, k + 1], [2, k + 2]]) {
      p.set(pts[s], k * 9 + j * 3); u.set(uvs[s], k * 6 + j * 2);
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('uv', new THREE.BufferAttribute(u, 2));
    g.computeVertexNormals(); put(g, hex, m);
  }
  function wall(x0, z0, x1, z1, h, hex) { bb(x0, 0, z0, x1, h, z1, hex); COL.push([x0, z0, x1, z1]); }
  // a separate Builder -> named Group (a prop). Coordinates inside fn are local.
  function part(name, fn, pos, ry = 0, o) {
    const pb = b, px = XF, pt = tint; b = new Builder(); XF = null;
    fn();
    const g = b.done(o); b = pb; XF = px; tint = pt;
    if (name) g.name = name;
    if (pos) g.position.set(pos[0], pos[1], pos[2]);
    g.rotation.y = ry;
    return g;
  }
  const at = (x, z, ry = 0) => (XF = m4.makeRotationY(ry).setPosition(x, 0, z));
  // a tapered limb from (x0,y0,z0) to (x1,y1,z1) (branches, roots)
  function limb(x0, y0, z0, x1, y1, z1, r0, r1, hex, seg = 6) {
    const d = new THREE.Vector3(x1 - x0, y1 - y0, z1 - z0), L = d.length(), g = new THREE.CylinderGeometry(r1, r0, L, seg);
    g.translate(0, L / 2, 0); g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize())); g.translate(x0, y0, z0); put(g, hex);
  }
  // the geometry of a one-material part (for InstancedMesh repeats; already baked)
  const geoOf = (fn) => part('', fn, null, 0, { floor: false }).children[0].geometry;

  // ---------------------------------------------------------- painted textures (64–256 px, nearest)
  const FONT = (px, w = 'bold') => `${w} ${px}px Arial, "Liberation Sans", "DejaVu Sans", sans-serif`;
  function text(c, s, x, y, px, col, al = 'center', w = 'bold', maxW) {
    c.font = FONT(px, w); c.fillStyle = col; c.textAlign = al; c.textBaseline = 'middle'; c.fillText(s, x, y, maxW);
  }
  let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  // hand-painted lettering: each glyph a little off its baseline and angle (seeded, so it repaints identically)
  function hand(c, s, x, y, px, col, outline, track = 0) {
    c.font = FONT(px); c.textAlign = 'left'; c.textBaseline = 'middle';
    let wsum = 0; for (const ch of s) wsum += c.measureText(ch).width + track;
    let cx = x - (wsum - track) / 2;
    for (const ch of s) {
      const cw = c.measureText(ch).width;
      c.save(); c.translate(cx + cw / 2, y + (rnd() - 0.5) * px * 0.1); c.rotate((rnd() - 0.5) * 0.12);
      if (outline) { c.lineWidth = Math.max(2, px * 0.12); c.strokeStyle = outline; c.lineJoin = 'round'; c.strokeText(ch, -cw / 2, 0); }
      c.fillStyle = col; c.fillText(ch, -cw / 2, 0); c.restore();
      cx += cw + track;
    }
  }
  // atlas rects (pixels, top-left origin)
  const A = {
    shop: [[0, 0, 128, 64], [128, 0, 256, 64], [0, 64, 128, 128], [128, 64, 256, 128]],
    train: [0, 128, 128, 192], coin: [128, 128, 192, 160], urn: [192, 128, 256, 160],
    bread: [128, 160, 160, 192], onion: [160, 160, 192, 192], bus: [192, 160, 256, 224],
    panel: [0, 192, 128, 224], cloth: [128, 192, 192, 256], tray: [0, 224, 64, 256],
  };
  const G = {   // glow atlas (256 x 128)
    idle: [0, 0, 128, 64], live: [128, 0, 256, 64], win: [0, 64, 64, 96], door: [64, 64, 96, 96], light: [96, 64, 128, 96],
    blank: [128, 64, 192, 128], arrow: [192, 64, 224, 96], dots: [224, 64, 256, 96], bus: [192, 96, 256, 128], warm: [0, 96, 64, 128],
  };
  const CN = { stripes: [0, 0, 128, 64], valance: [0, 64, 128, 96], trim: [0, 96, 128, 128] };   // canopy (128 x 128)
  function chipGlyph(c, x, y, s, col) {
    c.strokeStyle = col; c.lineWidth = Math.max(1.5, s * 0.12); c.strokeRect(x - s / 2, y - s / 2, s, s);
    c.fillStyle = col; c.fillRect(x - s * 0.22, y - s * 0.22, s * 0.44, s * 0.44);
    for (let k = -1; k <= 1; k++) { c.fillRect(x + k * s * 0.25 - 1, y - s * 0.75, 2, s * 0.22); c.fillRect(x + k * s * 0.25 - 1, y + s * 0.53, 2, s * 0.22); }
  }
  function paintReader(c, mode) {   // the lane-2 reader screen, 128 x 64 at G.live
    c.save(); c.beginPath(); c.rect(G.live[0], G.live[1], 128, 64); c.clip(); c.translate(G.live[0], G.live[1]);
    c.fillStyle = '#0c1830'; c.fillRect(0, 0, 128, 64);
    if (mode === 'tap3') {
      c.fillStyle = '#16305a'; c.fillRect(0, 0, 128, 4);
      text(c, '3 FARES', 64, 20, 21, '#ffffff');
      text(c, 'Balance: $4', 64, 46, 18, '#bfe6ff');
    } else if (mode === 'ok') {
      c.strokeStyle = '#5ae08a'; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(42, 34); c.lineTo(58, 48); c.lineTo(88, 16); c.stroke();
    } else { chipGlyph(c, 40, 32, 22, '#bfe6ff'); text(c, 'TAP', 88, 33, 22, '#bfe6ff'); }
    c.restore();
  }
  function textures() {
    if (T) return T;
    T = {};
    const K = (k, o) => Object.assign({ key: 'sandgate_' + k, nearest: true }, o);
    T.pave = canvasTex(64, 64, (c) => {
      c.fillStyle = '#b7976d'; c.fillRect(0, 0, 64, 64); seed = 3;
      for (let r = 0; r < 4; r++) for (let k = -1; k < 5; k++) {
        const x = k * 16 + (r % 2 ? 8 : 0), y = r * 16, v = rnd();
        c.fillStyle = v < 0.3 ? '#d9b98f' : v < 0.55 ? '#d3b187' : v < 0.8 ? '#dec29b' : '#cfaa80';
        c.fillRect(x + 1, y + 1, 15, 15);
      }
      for (let i = 0; i < 220; i++) { c.fillStyle = rnd() > 0.5 ? 'rgba(255,240,215,0.35)' : 'rgba(150,115,80,0.25)'; c.fillRect(rnd() * 64 | 0, rnd() * 64 | 0, 1, 1); }
    }, K('pave', { repeat: [1, 1] }));
    T.brick = canvasTex(64, 64, (c) => {
      c.fillStyle = '#c7b9a3'; c.fillRect(0, 0, 64, 64); seed = 5;
      for (let r = 0; r < 8; r++) for (let k = -1; k < 5; k++) {
        const x = k * 16 + (r % 2 ? 8 : 0), y = r * 8, v = rnd();
        c.fillStyle = v < 0.35 ? '#a8604a' : v < 0.6 ? '#9c5642' : v < 0.85 ? '#b36a52' : '#8e4e3c';
        c.fillRect(x + 1, y + 1, 15, 7);
      }
    }, K('brick', { repeat: [1, 1] }));
    T.tiles = canvasTex(64, 64, (c) => {
      c.fillStyle = '#b9bcb8'; c.fillRect(0, 0, 64, 64); seed = 9;
      for (let i = 0; i < 2; i++) for (let k = 0; k < 2; k++) { c.fillStyle = (i + k) % 2 ? '#d9dbd6' : '#d2d4cf'; c.fillRect(i * 32 + 1, k * 32 + 1, 31, 31); }
      for (let i = 0; i < 90; i++) { c.fillStyle = rnd() > 0.5 ? 'rgba(255,255,255,0.4)' : 'rgba(120,120,115,0.25)'; c.fillRect(rnd() * 64 | 0, rnd() * 64 | 0, 1, 1); }
    }, K('tiles', { repeat: [1, 1] }));
    T.sign = canvasTex(256, 256, (c, w, h) => {
      c.setTransform(256 / 200, 0, 0, 1, 0, 0);   // painted in board units 200 x 256 (the board is 0.66 x 0.85 m)
      c.fillStyle = '#d8c49a'; c.fillRect(0, 0, 200, 256); seed = 41;
      for (let i = 0; i < 26; i++) { c.fillStyle = rnd() > 0.5 ? 'rgba(170,140,95,0.35)' : 'rgba(240,225,190,0.35)'; c.fillRect(0, rnd() * 256, 200, 1 + rnd() * 2); }
      c.strokeStyle = '#141d3a'; c.lineWidth = 4; c.strokeRect(7, 6, 186, 244);
      hand(c, 'DOLPHINS', 100, 27, 31, '#141d3a', null, 1);
      hand(c, 'JUNIORS', 100, 58, 29, '#141d3a', null, 1);
      hand(c, 'SIZZLE', 100, 98, 44, '#c8262e', '#141d3a', 2);
      // the dolphin, holding a snag in bread
      c.save(); c.translate(84, 160);
      c.fillStyle = '#5aa0d8'; c.strokeStyle = '#141d3a'; c.lineWidth = 2.5;
      c.beginPath(); c.moveTo(-46, 10); c.quadraticCurveTo(-30, -26, 10, -22); c.quadraticCurveTo(34, -20, 40, -6); c.lineTo(58, -2);
      c.lineTo(40, 4); c.quadraticCurveTo(24, 22, -8, 18); c.quadraticCurveTo(-28, 16, -38, 22); c.lineTo(-56, 30); c.lineTo(-50, 14); c.lineTo(-62, 2); c.closePath(); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(-4, -20); c.lineTo(4, -36); c.lineTo(12, -21); c.fill(); c.stroke();          // dorsal fin
      c.fillStyle = '#e8f2fa'; c.beginPath(); c.ellipse(16, 10, 20, 6, -0.1, 0, TAU); c.fill();            // belly
      c.fillStyle = '#141d3a'; c.beginPath(); c.arc(30, -10, 2.6, 0, TAU); c.fill();                        // eye
      c.beginPath(); c.moveTo(42, 0); c.quadraticCurveTo(48, 4, 54, 0); c.stroke();                         // smile
      c.fillStyle = '#5aa0d8'; c.beginPath(); c.ellipse(8, 14, 12, 5, 0.7, 0, TAU); c.fill(); c.stroke();     // flipper
      c.restore();
      c.save(); c.translate(150, 150); c.rotate(-0.25);
      c.fillStyle = '#f4ead2'; c.strokeStyle = '#141d3a'; c.lineWidth = 2.5; c.beginPath(); c.ellipse(0, 6, 30, 13, 0, 0, TAU); c.fill(); c.stroke();
      c.fillStyle = '#8a4a2a'; c.beginPath(); c.ellipse(0, -2, 34, 7, 0, 0, TAU); c.fill(); c.stroke();
      c.strokeStyle = '#c8262e'; c.lineWidth = 3; c.beginPath(); for (let i = -26; i <= 26; i += 6) c.lineTo(i, -4 + ((i / 6) % 2 ? 3 : -2)); c.stroke();
      c.restore();
      hand(c, '— SUNDAYS —', 100, 208, 22, '#141d3a', null, 0);
      hand(c, '$3 SNAG · $1 DRINK', 100, 236, 15, '#141d3a', null, 0);
      c.setTransform(1, 0, 0, 1, 0, 0);
    }, K('sign'));
    T.atlas = canvasTex(256, 256, (c) => {
      seed = 13;
      const shop = (rc, base, sign, body) => { c.save(); c.translate(rc[0], rc[1]); c.beginPath(); c.rect(0, 0, 128, 64); c.clip(); c.fillStyle = base; c.fillRect(0, 0, 128, 64); body(c); c.fillStyle = sign; c.fillRect(6, 4, 116, 11); c.strokeStyle = 'rgba(0,0,0,0.35)'; c.lineWidth = 1; c.strokeRect(6.5, 4.5, 115, 10); c.restore(); };
      const win = (x, y, w, hh, col, mull) => { c.fillStyle = '#2a2f36'; c.fillRect(x - 1, y - 1, w + 2, hh + 2); c.fillStyle = col; c.fillRect(x, y, w, hh); if (mull) { c.fillStyle = '#2a2f36'; for (let i = 1; i < mull; i++) c.fillRect(x + (w * i) / mull, y, 1, hh); } };
      shop(A.shop[0], '#2f5a44', '#e8dcc0', (c) => {   // the pub: green tiles, warm windows, double doors
        win(8, 22, 40, 26, '#d8a860', 3); win(80, 22, 40, 26, '#d8a860', 3); c.fillStyle = '#5a3a24'; c.fillRect(52, 20, 24, 44); c.fillStyle = '#c89048'; c.fillRect(55, 24, 8, 36); c.fillRect(65, 24, 8, 36);
        c.fillStyle = '#244636'; c.fillRect(0, 52, 128, 12); c.fillStyle = '#2a2420'; for (let x = 10; x < 46; x += 9) c.fillRect(x, 34, 3, 6);
      });
      shop(A.shop[1], '#efe4cc', '#f8f2e4', (c) => {   // the bakery: big window, loaves, striped blind
        for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#c8262e' : '#f6f4ee'; c.fillRect(i * 16, 16, 16, 6); }
        win(6, 24, 82, 30, '#f2e2c0', 2); c.fillStyle = '#a8703a'; for (let i = 0; i < 6; i++) { c.beginPath(); c.ellipse(16 + i * 12, 46, 5, 3, 0, 0, TAU); c.fill(); }
        c.fillStyle = '#7a5a3a'; c.fillRect(96, 24, 24, 40); c.fillStyle = '#e8d8b8'; c.fillRect(99, 28, 18, 18);
      });
      shop(A.shop[2], '#bdb8ae', '#d0ccc4', (c) => {   // the closed bank: stone, roller shutter down
        c.fillStyle = '#9a968e'; for (let x = 0; x < 128; x += 16) c.fillRect(x, 16, 1, 48);
        c.fillStyle = '#8a8d90'; c.fillRect(10, 22, 108, 40); c.fillStyle = '#7a7d80'; for (let y = 24; y < 62; y += 3) c.fillRect(10, y, 108, 1);
        c.fillStyle = '#6a6d70'; c.fillRect(10, 22, 108, 3);
      });
      shop(A.shop[3], '#3a8a8a', '#f2efe6', (c) => {   // the café: teal frame, chairs in the window
        win(6, 22, 60, 32, '#e8e0cc', 2); win(90, 22, 32, 42, '#d8d0bc', 1); c.fillStyle = '#5a3a2a';
        for (let i = 0; i < 3; i++) { c.fillRect(12 + i * 18, 42, 8, 2); c.fillRect(13 + i * 18, 44, 1, 8); c.fillRect(18 + i * 18, 44, 1, 8); }
        c.fillStyle = '#2a6a6a'; c.fillRect(66, 22, 24, 42);
      });
      // train side panel (5.25 m of a 2040 suburban car): white, navy skirt band, teal stripe, dark window band
      c.save(); c.translate(A.train[0], A.train[1]);
      c.fillStyle = '#eef0f0'; c.fillRect(0, 0, 128, 64); c.fillStyle = '#c4c8cc'; c.fillRect(0, 0, 128, 5);
      c.fillStyle = '#26323e'; c.fillRect(0, 17, 128, 20); c.fillStyle = '#141d3a'; c.fillRect(0, 48, 128, 16); c.fillStyle = '#2aa8a0'; c.fillRect(0, 43, 128, 4);
      c.fillStyle = '#d0d4d8'; c.fillRect(0, 38, 128, 1); c.restore();
      // GOLD COIN: marker on masking tape
      c.save(); c.translate(A.coin[0], A.coin[1]);
      c.fillStyle = '#efe4c0'; c.beginPath(); c.moveTo(2, 4); c.lineTo(62, 2); c.lineTo(63, 29); c.lineTo(1, 30); c.closePath(); c.fill();
      c.fillStyle = 'rgba(160,140,100,0.25)'; c.fillRect(0, 2, 64, 3); seed = 77; hand(c, 'GOLD COIN', 32, 17, 12, '#111111', null, 0); c.restore();
      c.save(); c.translate(A.urn[0], A.urn[1]);
      c.fillStyle = '#efe4c0'; c.fillRect(3, 6, 58, 22); seed = 78; hand(c, 'HOT!', 32, 17, 15, '#b01818', null, 1); c.restore();
      // bread slice (top), onion strands
      c.save(); c.translate(A.bread[0], A.bread[1]);
      c.fillStyle = '#c99050'; c.beginPath(); c.moveTo(2, 30); c.lineTo(2, 10); c.quadraticCurveTo(2, 1, 16, 2); c.quadraticCurveTo(30, 1, 30, 10); c.lineTo(30, 30); c.closePath(); c.fill();
      c.fillStyle = '#f6eedb'; c.beginPath(); c.moveTo(5, 27); c.lineTo(5, 11); c.quadraticCurveTo(5, 5, 16, 5); c.quadraticCurveTo(27, 5, 27, 11); c.lineTo(27, 27); c.closePath(); c.fill();
      c.fillStyle = 'rgba(200,180,140,0.5)'; for (let i = 0; i < 14; i++) c.fillRect(6 + rnd() * 20 | 0, 7 + rnd() * 19 | 0, 1, 1); c.restore();
      c.save(); c.translate(A.onion[0], A.onion[1]);
      c.fillStyle = '#7a5226'; c.fillRect(0, 0, 32, 32); c.lineWidth = 2;
      for (let i = 0; i < 16; i++) { c.strokeStyle = rnd() > 0.5 ? '#e0b060' : '#c99a50'; c.beginPath(); const x = rnd() * 32, y = rnd() * 32; c.arc(x, y, 3 + rnd() * 6, rnd() * 3, rnd() * 3 + 2); c.stroke(); }
      c.restore();
      // bus shelter timetable: a blank e-paper panel (AR only in 2040)
      c.save(); c.translate(A.bus[0], A.bus[1]); c.fillStyle = '#3a4250'; c.fillRect(0, 0, 64, 64); c.fillStyle = '#e4e6e4'; c.fillRect(5, 5, 54, 54);
      c.fillStyle = '#d4d8d6'; c.fillRect(5, 5, 54, 8); c.restore();
      // blank station name panel (AR SANDGATE STATION)
      c.save(); c.translate(A.panel[0], A.panel[1]); c.fillStyle = '#3a4250'; c.fillRect(0, 0, 128, 32); c.fillStyle = '#e8eae6'; c.fillRect(3, 3, 122, 26);
      c.fillStyle = 'rgba(191,230,255,0.35)'; c.fillRect(3, 26, 122, 3); c.restore();
      // table cloth weave, foil tray
      c.save(); c.translate(A.cloth[0], A.cloth[1]); c.fillStyle = '#f7f5ef'; c.fillRect(0, 0, 64, 64);
      for (const [x, wd, a] of [[9, 5, 0.1], [22, 3, 0.07], [37, 6, 0.1], [51, 4, 0.08]]) { c.fillStyle = `rgba(150,145,135,${a})`; c.fillRect(x, 0, wd, 64); c.fillStyle = `rgba(255,255,255,${a * 2})`; c.fillRect(x + wd, 0, 2, 64); }
      c.fillStyle = 'rgba(180,176,166,0.18)'; c.fillRect(0, 31, 64, 1); c.restore();
      c.save(); c.translate(A.tray[0], A.tray[1]); const fg = c.createLinearGradient(0, 0, 64, 32); fg.addColorStop(0, '#d8dadc'); fg.addColorStop(0.5, '#f4f6f8'); fg.addColorStop(1, '#b8bcc0');
      c.fillStyle = fg; c.fillRect(0, 0, 64, 32); c.strokeStyle = 'rgba(120,124,128,0.6)'; for (let i = 4; i < 64; i += 6) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i - 4, 32); c.stroke(); } c.restore();
    }, K('atlas'));
    T.glow = canvasTex(256, 128, (c) => {
      // idle reader screens (lanes 0 and 1), and the live lane-2 one
      c.save(); c.translate(G.idle[0], G.idle[1]); c.fillStyle = '#0c1830'; c.fillRect(0, 0, 128, 64); chipGlyph(c, 40, 32, 22, '#bfe6ff'); text(c, 'TAP', 88, 33, 22, '#bfe6ff'); c.restore();
      paintReader(c, 'idle');
      // train window (lit soft blue, seat backs), open door (lit interior, grab pole), hall light panel
      c.save(); c.translate(G.win[0], G.win[1]); const wg = c.createLinearGradient(0, 0, 0, 32); wg.addColorStop(0, '#e4f2ff'); wg.addColorStop(1, '#a8c8e8');
      c.fillStyle = wg; c.fillRect(0, 0, 64, 32); c.fillStyle = '#5a7aa8'; for (let i = 0; i < 4; i++) c.fillRect(4 + i * 16, 18, 10, 14);
      c.fillStyle = '#3a4a68'; c.beginPath(); c.arc(26, 15, 4, 0, TAU); c.fill(); c.fillRect(22, 18, 8, 14); c.fillStyle = '#c8d8ec'; c.fillRect(0, 2, 64, 1); c.restore();
      c.save(); c.translate(G.door[0], G.door[1]); const dg = c.createLinearGradient(0, 0, 0, 32); dg.addColorStop(0, '#eef6ff'); dg.addColorStop(1, '#b8cce4');
      c.fillStyle = dg; c.fillRect(0, 0, 32, 32); c.fillStyle = '#7890b0'; c.fillRect(0, 27, 32, 5); c.fillStyle = '#c0c8d0'; c.fillRect(15, 0, 2, 27); c.restore();
      c.save(); c.translate(G.light[0], G.light[1]); c.fillStyle = '#c8c4bc'; c.fillRect(0, 0, 32, 32); c.fillStyle = '#fffaf0'; c.fillRect(2, 2, 28, 28); c.restore();
      // blank AR screen (2040: printed and screen signage is empty unless you have the chip)
      c.save(); c.translate(G.blank[0], G.blank[1]); c.fillStyle = '#06090e'; c.fillRect(0, 0, 64, 64); c.strokeStyle = 'rgba(191,230,255,0.55)'; c.lineWidth = 2; c.strokeRect(1, 1, 62, 62);
      c.fillStyle = 'rgba(191,230,255,0.08)'; c.beginPath(); c.moveTo(4, 4); c.lineTo(30, 4); c.lineTo(8, 40); c.lineTo(4, 40); c.fill(); c.restore();
      c.save(); c.translate(G.arrow[0], G.arrow[1]); c.fillStyle = '#081008'; c.fillRect(0, 0, 32, 32); c.fillStyle = '#5ae08a';
      c.beginPath(); c.moveTo(16, 5); c.lineTo(27, 17); c.lineTo(20, 17); c.lineTo(20, 27); c.lineTo(12, 27); c.lineTo(12, 17); c.lineTo(5, 17); c.closePath(); c.fill(); c.restore();
      c.save(); c.translate(G.dots[0], G.dots[1]); c.fillStyle = '#fff4d0'; c.fillRect(0, 0, 32, 32); c.restore();
      c.save(); c.translate(G.bus[0], G.bus[1]); c.fillStyle = '#dfe8ee'; c.fillRect(0, 0, 64, 32); c.fillStyle = '#c8d4dc'; c.fillRect(0, 0, 64, 5); c.restore();
      c.save(); c.translate(G.warm[0], G.warm[1]); const hg = c.createLinearGradient(0, 0, 0, 32); hg.addColorStop(0, '#fff2d8'); hg.addColorStop(1, '#f0d8b0'); c.fillStyle = hg; c.fillRect(0, 0, 64, 32); c.restore();
    }, K('glow'));
    T.canopy = canvasTex(128, 128, (c) => {
      for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#f6f4ee' : '#c8262e'; c.fillRect(i * 16, 0, 16, 64); }
      c.fillStyle = 'rgba(0,0,0,0.12)'; for (let i = 1; i < 8; i++) c.fillRect(i * 16 - 1, 0, 1, 64);
      c.fillStyle = '#c8262e'; c.fillRect(0, 64, 128, 32); c.fillStyle = '#f6f4ee'; c.fillRect(0, 65, 128, 2);
      c.fillStyle = '#a81e26'; for (let x = 0; x < 128; x += 16) { c.beginPath(); c.arc(x + 8, 96, 8, PI, TAU); c.fill(); }
      text(c, 'DOLPHINS', 64, 80, 17, '#f6f4ee', 'center', 'bold', 118);
      c.fillStyle = '#c8262e'; c.fillRect(0, 96, 128, 32); c.fillStyle = '#f6f4ee'; c.fillRect(0, 97, 128, 2); c.fillRect(0, 122, 128, 2);
      c.fillStyle = '#a81e26'; for (let x = 0; x < 128; x += 16) { c.beginPath(); c.arc(x + 8, 128, 8, PI, TAU); c.fill(); }
    }, K('canopy'));
    T.heat = canvasTex(64, 32, (c) => {
      c.clearRect(0, 0, 64, 32); seed = 31;
      for (let y = 0; y < 32; y += 2) for (let x = -4; x < 64; x += 5 + rnd() * 8) { c.fillStyle = `rgba(255,240,220,${(0.25 * rnd() * (1 - y / 32)).toFixed(3)})`; c.fillRect(x + Math.sin(y * 0.8) * 2, y, 3 + rnd() * 6, 1); }
    }, K('heat', { repeat: [1, 1] }));
    // sky: band of suburb roofs and trees (grey values; the material tints it toward the haze), storm anvil, cumulus
    T.band = canvasTex(256, 64, (c) => {
      c.clearRect(0, 0, 256, 64); seed = 19;
      c.fillStyle = '#ffffff'; c.fillRect(0, 50, 256, 14);
      for (let x = 0; x < 256;) {   // roofs
        const w = 5 + rnd() * 9, h = 3 + rnd() * 4; c.fillStyle = rnd() > 0.5 ? '#9aa09c' : '#aeb2ac';
        c.fillRect(x, 51 - h * 0.45, w, h * 0.45 + 1);
        c.beginPath(); c.moveTo(x - 1, 51 - h * 0.45); c.lineTo(x + w * 0.5, 51 - h); c.lineTo(x + w + 1, 51 - h * 0.45); c.fill(); x += w + rnd() * 4;
      }
      for (let i = 0; i < 34; i++) { c.fillStyle = rnd() > 0.5 ? '#7c8a7a' : '#8a9686'; const x = rnd() * 256, r = 2 + rnd() * 5; c.beginPath(); c.arc(x, 50 - r * 0.5, r, 0, TAU); c.fill(); }
      c.fillStyle = '#8a8e8a'; for (let x = 12; x < 256; x += 42) { c.fillRect(x, 32, 1, 19); c.fillRect(x - 3, 34, 7, 1); }
      c.fillStyle = 'rgba(138,142,138,0.7)'; c.fillRect(0, 35, 256, 1);
      c.fillStyle = '#a4b0ba'; c.fillRect(196, 48, 60, 4);   // a glimpse of the bay
    }, { key: 'sandgate_band', repeat: [1, 1] });
    T.storm = canvasTex(128, 128, (c) => {
      c.clearRect(0, 0, 128, 128); seed = 23;
      const blob = (x, y, r, col) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); };
      for (let i = 0; i < 26; i++) blob(8 + rnd() * 112, 22 + rnd() * 16, 7 + rnd() * 9, rnd() > 0.5 ? '#66726c' : '#5c6862');   // the anvil, spreading
      for (let i = 0; i < 22; i++) blob(10 + rnd() * 108, 14 + rnd() * 8, 4 + rnd() * 6, rnd() > 0.4 ? '#cfd6cf' : '#aeb8b2');   // its sunlit rim
      for (let i = 0; i < 34; i++) { const y = 34 + rnd() * 70, half = 16 + (y - 34) * 0.32; blob(64 + (rnd() - 0.5) * 2 * half, y, 9 + rnd() * 11, rnd() > 0.5 ? '#4e5a56' : '#46524e'); }   // the tower
      for (let i = 0; i < 10; i++) blob(40 + rnd() * 48, 40 + rnd() * 30, 6 + rnd() * 7, '#7e8a84');   // lit bulges on the tower
      for (let i = 0; i < 18; i++) blob(10 + rnd() * 108, 100 + rnd() * 10, 8 + rnd() * 8, '#5e6e5c');  // the green-grey shelf underneath
      c.globalCompositeOperation = 'destination-in';
      const gx = c.createLinearGradient(0, 0, 128, 0); gx.addColorStop(0, 'rgba(0,0,0,0)'); gx.addColorStop(0.14, 'rgba(0,0,0,1)'); gx.addColorStop(0.86, 'rgba(0,0,0,1)'); gx.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = gx; c.fillRect(0, 0, 128, 128);
      const gy = c.createLinearGradient(0, 0, 0, 128); gy.addColorStop(0, 'rgba(0,0,0,0)'); gy.addColorStop(0.06, 'rgba(0,0,0,1)'); gy.addColorStop(0.84, 'rgba(0,0,0,1)'); gy.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = gy; c.fillRect(0, 0, 128, 128);
      c.globalCompositeOperation = 'source-over';
    }, { key: 'sandgate_storm' });
    T.cloud = canvasTex(128, 64, (c) => {
      c.clearRect(0, 0, 128, 64); seed = 29;
      for (let i = 0; i < 14; i++) { const x = 20 + rnd() * 88, y = 30 + rnd() * 16, r = 8 + rnd() * 12; c.fillStyle = '#dfe4e6'; c.beginPath(); c.arc(x, y + 3, r, 0, TAU); c.fill(); }
      for (let i = 0; i < 14; i++) { const x = 20 + rnd() * 88, y = 26 + rnd() * 14, r = 7 + rnd() * 10; c.fillStyle = '#ffffff'; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); }
      c.fillStyle = '#d4dadc'; c.fillRect(14, 48, 100, 3);
    }, { key: 'sandgate_cloud' });
    return T;
  }

  // ---------------------------------------------------------- reusable little models (into the current builder)
  function palm(x, z, h) {
    for (let i = 0; i < 6; i++) cyl(0.16 - i * 0.012, 0.18 - i * 0.012, h / 6, 6, i % 2 ? 0x8a6b4a : 0x7a5d3f, x + i * 0.04, h / 12 + i * h / 6, z);
    for (let i = 0; i < 7; i++) { const a = i * 0.9; boxR(0.35, 0.04, 2.2, i % 2 ? 0x4f8a3a : 0x5c9a42, x + 0.24 + Math.sin(a) * 1.0, h + 0.05, z + Math.cos(a) * 1.0, 0.45, a); }
    cyl(0.5, 0.55, 0.3, 8, FOAM, x, 0.15, z);                                   // padded tree surround (2040)
  }
  function bikeRack(x, z) {
    for (let i = 0; i < 4; i++) { const xx = x - 0.75 + i * 0.5; cyl(0.025, 0.025, 0.7, 5, 0x8d9398, xx, 0.35, z - 0.2); cyl(0.025, 0.025, 0.7, 5, 0x8d9398, xx, 0.35, z + 0.2); boxR(0.05, 0.05, 0.44, 0x8d9398, xx, 0.72, z); }
    boxR(0.8, 0.04, 1.6, 0xa0a6aa, x, 0.02, z, 0, H);
  }
  function bench(x, z, ry, len = 1.6) {   // a padded 2040 bench (cream foam seat on steel)
    at(x, z, ry);
    bb(-len / 2, 0, -0.22, -len / 2 + 0.06, 0.42, 0.22, 0x6a7078); bb(len / 2 - 0.06, 0, -0.22, len / 2, 0.42, 0.22, 0x6a7078);
    bb(-len / 2, 0.38, -0.25, len / 2, 0.5, 0.25, FOAM); bb(-len / 2, 0.5, -0.27, len / 2, 0.85, -0.17, FOAM);
    XF = null;
  }
  // hover-car for the traffic IM: long axis X, nose at +X; white body (instanceColor tints it) + a glow part
  const carBody = () => {
    bb(-2.05, 0.3, -0.86, 2.05, 0.82, 0.86, 0xffffff); bb(-2.1, 0.22, -0.8, 2.1, 0.4, 0.8, 0xe8e8e8);
    bb(-1.15, 0.82, -0.76, 1.0, 1.28, 0.76, 0xffffff); bb(-1.1, 0.86, -0.78, 0.95, 1.2, 0.78, 0x2a3440);
    boxR(0.06, 0.5, 1.48, 0x2a3440, 1.16, 1.02, 0, 0, 0, -0.62); boxR(0.06, 0.46, 1.48, 0x2a3440, -1.3, 1.0, 0, 0, 0, 0.6);
    for (const [x, z] of [[1.4, 0.55], [1.4, -0.55], [-1.4, 0.55], [-1.4, -0.55]]) cyl(0.3, 0.34, 0.08, 8, 0x3a3d44, x, 0.2, z);
  };
  const carGlow = () => {
    for (const [x, z] of [[1.4, 0.55], [1.4, -0.55], [-1.4, 0.55], [-1.4, -0.55]]) cyl(0.25, 0.25, 0.02, 8, 0xffffff, x, 0.15, z);
    for (const s of [-1, 1]) { bb(2.05, 0.52, s * 0.45 - 0.16, 2.1, 0.6, s * 0.45 + 0.16, 0xffffff); bb(-2.1, 0.55, s * 0.5 - 0.15, -2.05, 0.62, s * 0.5 + 0.15, 0xff4a3a); }
  };
  const houseGeo = () => {   // backdrop house for the IM: walls + pitched roof (instanceColor tints the walls)
    bb(-4, 0, -3.5, 4, 3.0, 3.5, 0xf2f0ea); boxR(8.6, 0.14, 4.4, 0x8a5a48, 0, 3.85, 1.9, 0.5); boxR(8.6, 0.14, 4.4, 0x8a5a48, 0, 3.85, -1.9, -0.5);
    bb(-3.9, 3.0, -0.08, 3.9, 4.75, 0.08, 0x8a5a48);
    for (const dx of [-2, 2]) bb(dx - 0.7, 1.0, 3.5, dx + 0.7, 2.1, 3.56, 0x3d4a57);
  };
  const treeGeo = () => {
    cyl(0.14, 0.2, 2.4, 6, 0x7b6a55, 0, 1.2, 0);
    ico(1.6, 0x5f7f48, 0, 3.2, 0, 0.8); ico(1.1, 0x6f8f52, 0.8, 2.8, 0.4, 0.8); ico(1.1, 0x4f6f3e, -0.7, 3.5, -0.4, 0.8);
  };
  const poleGeo = () => { cyl(0.11, 0.14, 9, 6, 0x6b5a48, 0, 4.5, 0); bb(-1.0, 8.3, -0.06, 1.0, 8.42, 0.06, 0x6b5a48); for (const x of [-0.8, 0.8]) cyl(0.04, 0.05, 0.14, 5, 0xd8d8d0, x, 8.5, 0); };

  // ---------------------------------------------------------- build
  const SNAG_X = [-7.85, -7.66, -7.47, -7.28, -7.09, -6.90], SNAG_Y = 0.945, SNAG_Z = -2.72;
  const SNAG_COL = [0xe7a2a0, 0xc87850, 0x8a4a2a, 0x4a2a1a, 0x1e1612].map((h) => new THREE.Color(h));
  const SNAG_U = { raw: 0, browning: 0.25, ready: 0.5, burning: 0.75, burnt: 1, gone: -1 };
  const ONI_COL = [0xf0e6c8, 0xc99a50, 0x6a4a28].map((h) => new THREE.Color(h));
  const CAR_COL = [0xd84a3a, 0xf2f2ee, 0x3a6ab0, 0x2aa8a0].map((h) => new THREE.Color(h));
  const BUNT_COL = [0xc8262e, 0x2e8a4a, 0xf6f4ee].map((h) => new THREE.Color(h));
  const SNAGS = { up: new Float32Array(6), dn: new Float32Array(6), t: new Float32Array(6).fill(-1), swapped: new Uint8Array(6) };
  const BUNT = new Float32Array(24 * 3);
  const PAD = { a: new Float32Array(6), to: new Float32Array(6), hx: new Float32Array(6), base: new Float32Array(6), on: false };
  const LANE_COL = [[-2.45, -13.65, -1.15, -13.55], [-0.65, -13.65, 0.65, -13.55], [1.15, -13.65, 2.45, -13.55]];
  const CARS = [{ x: -40, z: 11.5, v: 11, d: 1 }, { x: 15, z: 11.5, v: 9.5, d: 1 }, { x: 30, z: 15.0, v: 12, d: -1 }, { x: -25, z: 15.0, v: 10, d: -1 }];
  function build() {
    COL.length = 0; T = textures();
    const root = new THREE.Group(); R.root = root; R.spot = null;
    M = {
      vc: mat(0xffffff),
      pave: matTex(T.pave), brick: matTex(T.brick), tiles: matTex(T.tiles), atlas: matTex(T.atlas), sign: matTex(T.sign),
      glow: matTex(T.glow, { emissive: 0xffffff, key: 'sandgate_glow' }),
      canopy: matTex(T.canopy, { key: 'sandgate_canopy' }),
      glass: mat(0xcfe4ee, { transparent: true, opacity: 0.22, side: THREE.DoubleSide }),
      gate: mat(0xbfe6ff, { transparent: true, opacity: 0.38, side: THREE.DoubleSide, key: 'sandgate_paddle' }),
      snag: mat(0xffffff, { key: 'sandgate_snag' }),
      onion: mat(0xf0e6c8, { key: 'sandgate_onion' }),
      plate: mat(0xffffff, { emissive: 0x3a1206, emissiveIntensity: 0, key: 'sandgate_plate' }),
      heat: matTex(T.heat, { transparent: true, opacity: 0, side: THREE.DoubleSide, key: 'sandgate_heat' }),
      carGlow: mat(0x000000, { emissive: 0xbfe6ff, emissiveIntensity: 1.2, key: 'sandgate_carglow' }),
      tail: mat(0x000000, { emissive: 0xff4030, emissiveIntensity: 1, key: 'sandgate_tail' }),
      lamp: mat(0xffffff, { emissive: 0xfff2d6, emissiveIntensity: 0.85 }),
      ceil: mat(0xffffff, { emissive: 0x8a8880, emissiveIntensity: 1 }),
      canopyIn: matTex(T.canopy, { emissive: 0xffffff, emissiveIntensity: 0.42, key: 'sandgate_canopy_in' }),
    };
    b = new Builder(); XF = null;

    // ======================================================== ground: plaza, footpaths, road, the far side
    tint = OUT;
    tquad(32, 19.6, M.pave, 0, 0, -0.2, 0, -H, 2);                                              // plaza pavers x -16..16, z -10..9.6
    quad(600, 600, M.vc, 0, -0.2, 0, 0, -H, 0x9a9a82);                                          // suburbs round about (fogs out)
    for (const s of [-1, 1]) {
      tquad(24, 3.6, M.pave, s * 28, 0, 7.8, 0, -H, 2, 0xe8e2d8);                               // footpath along the street beyond the plaza
      quad(24, 16, M.vc, s * 28, 0.0, -2, 0, -H, 0x8fa060);                                     // garden / lawn beyond the plaza edges
      bb(s * 16.0 - 0.3, 0, -10, s * 16.0 + 0.3, 0.45, 5.9, 0xb4876a);                          // planter edge (the plaza's side wall)
      for (let z = -9.4; z < 5.8; z += 1.15) ico(0.5, z % 2.3 < 1.15 ? 0x5f8a3e : 0x6d9a48, s * 16.0, 0.75, z, 0.8);
    }
    COL.push([-16.3, -10, -16.0, 9.6], [16.0, -10, 16.3, 9.6], [-16, 9.3, 16, 9.6]);             // plaza west / east edges, the kerb (bollard strip)
    bb(-60, -0.15, 9.6, 60, 0.005, 9.8, KERB);                                                  // kerb
    quad(120, 7.0, M.vc, 0, -0.12, 13.3, 0, -H, ASPH);                                          // the road
    for (let x = -58; x < 60; x += 6) bb(x, -0.115, 13.24, x + 3, -0.105, 13.36, 0xe8e6dc);    // centre line
    bb(-60, -0.115, 10.1, 60, -0.105, 10.18, 0xe8e6dc); bb(-60, -0.115, 16.42, 60, -0.105, 16.5, 0xe8e6dc);
    bb(-60, -0.15, 16.8, 60, 0.005, 17.0, KERB); tquad(120, 2.0, M.pave, 0, 0, 18.0, 0, -H, 2, 0xe6ddd0);   // far footpath
    // shops across the road (z 19..30): the pub (verandah), the bakery, the closed bank, a café; blank signs (AR)
    const shops = [[-22, -12, 0, 0xd8cdb8, 7.4], [-12, -2, 1, 0xefe6d4, 5.6], [-2, 9, 2, 0xc4beb2, 6.2], [9, 20, 3, 0xe4dccc, 5.2]];
    for (const [x0, x1, k, wc, ht] of shops) {
      bb(x0, 0, 19, x1, ht, 30, wc); bb(x0 - 0.05, ht, 18.9, x1 + 0.05, ht + 0.35, 19.6, 0xb8ae9c);
      rquad(x1 - x0 - 0.2, 4.6, M.atlas, A.shop[k], (x0 + x1) / 2, 2.3, 18.98, PI);
      for (let x = x0 + 1.2; x < x1 - 0.8; x += 2.2) bb(x, 3.4, 18.97, x + 1.2, 4.6, 19.0, 0x3d4a57);   // upper windows
    }
    bb(-22, 3.3, 17.6, -12, 3.45, 19, 0x4a5a4e);                                                // pub verandah roof + posts
    for (let x = -21.6; x < -12; x += 2.4) cyl(0.06, 0.06, 3.3, 6, 0xe8e2d4, x, 1.65, 17.7);
    bb(-22, 3.45, 17.6, -12, 4.3, 17.7, 0xe8e2d4);                                              // lace balcony rail
    bb(20, 0, 19, 40, 4.5, 30, 0xd8d0c0); bb(-40, 0, 19, -22, 4.0, 30, 0xcfc4b0);
    // padded bollards along the kerb (IM below), bus shelter, the Moreton Bay fig with its ring bench
    at(8, 8.6);
    bb(-2.0, 0, -0.75, 2.0, 0.05, 0.6, 0xbab4a8);
    quad(4.0, 2.2, M.glass, 0, 1.25, -0.6); bb(-2.0, 2.35, -0.75, 2.0, 2.5, 0.75, 0xd8dce0);
    for (const x of [-1.95, 1.95]) bb(x - 0.05, 0, -0.65, x + 0.05, 2.35, -0.55, 0x8d9398);
    bb(-1.4, 0.42, -0.5, 1.4, 0.52, -0.15, FOAM); bb(1.98, 0.3, -0.55, 2.02, 2.0, 0.55, 0x8d9398);
    rquad(0.9, 0.9, M.atlas, A.bus, 2.03, 1.3, 0.05, H);
    XF = null;
    COL.push([6.0, 8.0, 10.0, 9.3]);
    for (let i = 0; i < 5; i++) { const a = i * 1.26 + 0.2; limb(10 + Math.sin(a) * 0.42, 0, 2 + Math.cos(a) * 0.42, 10 + Math.sin(a) * 0.3, 4.4, 2 + Math.cos(a) * 0.3, 0.5, 0.36, i % 2 ? TRUNK : 0x7e705e, 7); }   // fluted fig trunk
    for (let i = 0; i < 7; i++) {   // buttress roots: thin fins radiating over the ground
      const a = i * 0.9 + 0.5, g = new THREE.ConeGeometry(1, 1, 4); g.scale(0.16, 1.15, 1.25); g.translate(0, 0.575, 0); g.rotateY(a); g.translate(10 + Math.sin(a) * 0.95, 0, 2 + Math.cos(a) * 0.95); put(g, i % 2 ? 0x7e705e : TRUNK);
    }
    for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU; boxR(1.06, 0.1, 0.42, FOAM, 10 + Math.sin(a) * 2.0, 0.42, 2 + Math.cos(a) * 2.0, 0, a); boxR(0.1, 0.42, 0.1, 0x6a7078, 10 + Math.sin(a) * 2.0, 0.2, 2 + Math.cos(a) * 2.0); }
    COL.push([7.8, -0.2, 12.2, 4.2]);
    palm(-14, 4, 6.8); palm(13.5, -7, 7.4); COL.push([-14.25, 3.75, -13.75, 4.25]); COL.push([13.25, -7.25, 13.75, -6.75]);
    bikeRack(-13, -8.0); COL.push([-14.0, -8.3, -12.0, -7.7]);
    cyl(0.16, 0.2, 0.9, 8, 0x8d9398, 5.5, 0.45, -9.3); cyl(0.22, 0.2, 0.1, 8, 0xb8bec4, 5.5, 0.95, -9.3); COL.push([5.3, -9.5, 5.7, -9.1]);   // bubbler
    // the padded bin by the gazebo
    cyl(0.3, 0.28, 0.95, 10, FOAM, -3.3, 0.475, -3.4); cyl(0.31, 0.31, 0.06, 10, 0x6a7078, -3.3, 0.98, -3.4); COL.push([-3.6, -3.7, -3.0, -3.1]);

    // ======================================================== the station: facade, canopy, wings
    tint = OUT;
    for (const [x0, x1] of [[-16, -3], [3, 16]]) {
      bb(x0, 0, -10.3, x1, 6.5, -10.0, BRICK);
      tquad(x1 - x0, 1.2, M.brick, (x0 + x1) / 2, 0.6, -9.995, 0, 0, 1);
      tquad(x1 - x0, 1.5, M.brick, (x0 + x1) / 2, 5.75, -9.995, 0, 0, 1, 0xffffff, 0, 0.2);
      bb(x0, 1.2, -9.99, x1, 1.3, -9.95, 0xc9c4ba);
      for (let x = x0 + (x0 < 0 ? 0 : 0.0); x < x1 - 0.1; x += 2.0) {
        const xe = Math.min(x + 2.0, x1);
        bb(x + 0.08, 1.35, -9.99, xe - 0.08, 4.2, -9.97, GLASSD);
        bb(x - 0.05, 1.3, -9.98, x + 0.05, 4.25, -9.92, FRAME);
      }
      bb(x0, 4.2, -9.98, x1, 4.42, -9.9, FRAME);
      COL.push([x0, -10.3, x1, -10.0]);
    }
    bb(-3, 3.4, -10.3, 3, 6.5, -10.0, BRICK);                                                     // over the portal
    tquad(6, 1.5, M.brick, 0, 5.75, -9.995, 0, 0, 1, 0xffffff, 0.5, 0.2);
    rquad(4.8, 0.62, M.atlas, A.panel, 0, 3.82, -9.99);                                          // blank name panel (AR: SANDGATE STATION)
    for (const x of [-3.0, 3.0]) bb(x - 0.15, 0, -10.35, x + 0.15, 3.55, -9.94, FRAME);           // portal jambs + head
    bb(-3.15, 3.38, -10.35, 3.15, 3.55, -9.94, FRAME);
    bb(-16.2, 6.5, -16.4, 16.2, 6.85, -9.85, 0xb8b2a6);                                          // roof slab + cornice
    bb(-16.2, 6.85, -9.95, 16.2, 7.1, -9.85, 0xc9c4ba);
    for (const [x0, x1] of [[-16, -6.3], [6.3, 16]]) bb(x0, 0, -16.3, x1, 6.5, -10.3, BRICK);    // the wings (offices)
    bb(-16.02, 0, -16.3, -15.98, 6.5, -10.3, BRICK);
    // canopy: a curved metal roof on four columns with padded bases, bunting along its front edge
    const cz = [-10, -8.9, -7.8, -6.7, -5.6], cy = [4.95, 5.0, 4.98, 4.9, 4.75];
    for (let i = 0; i < 4; i++) {
      const z0 = cz[i], z1 = cz[i + 1], y0 = cy[i], y1 = cy[i + 1], len = Math.hypot(z1 - z0, y1 - y0), ang = Math.atan2(y1 - y0, z1 - z0);
      boxR(26, 0.1, len, CANOPY, 0, (y0 + y1) / 2, (z0 + z1) / 2, -ang);
      boxR(26, 0.04, len, 0xb8bcc0, 0, (y0 + y1) / 2 - 0.5, (z0 + z1) / 2, -ang);               // soffit
    }
    bb(-13, 4.2, -5.7, 13, 4.5, -5.5, 0xb8bcc0);                                                  // gutter / front beam
    for (let x = -12; x <= 12; x += 3) bb(x - 0.06, 4.38, -10, x + 0.06, 4.45, -5.6, 0x9aa0a6);  // ribs under
    for (const x of [-12, -4, 4, 12]) {
      cyl(0.11, 0.11, 4.4, 8, 0x8d9398, x, 2.2, -6.0); cyl(0.26, 0.28, 1.0, 10, FOAM, x, 0.5, -6.0); cyl(0.27, 0.27, 0.05, 10, 0xd8ccb0, x, 1.0, -6.0);
      COL.push([x - 0.25, -6.25, x + 0.25, -5.75]);
    }
    for (let x = -11; x <= 11; x += 5.5) { bb(x - 0.3, 4.36, -8.2, x + 0.3, 4.4, -7.4, 0xffffff, M.lamp); }   // downlights
    bb(-13, 4.33, -5.56, 13, 4.35, -5.54, 0x3a3a3a);                                              // bunting string anchor line

    // ======================================================== entrance hall (cool, indoor tint)
    tint = HALL;
    tquad(12, 6, M.tiles, 0, 0.004, -13, 0, -H, 1.2);
    bb(-6, 3.6, -16.05, 6, 3.75, -10.3, 0xe4e2dc, M.ceil);                                        // ceiling (lit)
    for (const [x, z] of [[-3.5, -11.4], [0, -11.4], [3.5, -11.4], [-3.5, -14.6], [0, -14.6], [3.5, -14.6]]) rquad(1.2, 0.6, M.glow, G.light, x, 3.59, z, 0, H, 0xffffff, 256, 128);
    for (const s of [-1, 1]) {
      wall(s > 0 ? 6.0 : -6.3, -16.3, s > 0 ? 6.3 : -6.0, -10.0, 3.6, CREAM);
      bb(s > 0 ? 5.96 : -6.0, 0, -16, s > 0 ? 6.0 : -5.96, 1.0, -10.3, 0x8a929a);                 // dado
      rquad(1.4, 0.8, M.glow, G.blank, s * 5.94, 2.2, -12.0, -s * H, 0, 0xffffff, 256, 128);       // blank AR screens on the side walls
    }
    // the inside of the facade (the portal from the hall side) and the parked sliding doors
    bb(-6, 0, -10.32, -3, 3.6, -10.3, CREAM); bb(3, 0, -10.32, 6, 3.6, -10.3, CREAM);
    for (const s of [-1, 1]) for (const k of [0, 1]) { quad(1.45, 3.3, M.glass, s * (3.8 + k * 0.08), 1.65, -10.4 - k * 0.06); bb(s * 3.08 - 0.03, 0, -10.48, s * 4.55 + 0.03, 0.05, -10.36, 0x7a8088); }
    bb(-3.1, 3.3, -10.5, 3.1, 3.38, -10.36, 0x7a8088);                                            // door track
    // fare gates: four cabinets (static), the readers on lanes 0..2 (screens in the fare_gates prop)
    for (const x of [-2.7, -0.9, 0.9, 2.7]) {
      bb(x - 0.125, 0, -14.3, x + 0.125, 1.0, -12.9, 0xc8ccd0); bb(x - 0.13, 0.96, -14.32, x + 0.13, 1.02, -12.88, 0x2a2e34);
      bb(x - 0.135, 0.1, -12.92, x + 0.135, 0.6, -12.85, FOAM); bb(x - 0.135, 0.1, -14.37, x + 0.135, 0.6, -14.28, FOAM);   // padded ends
      rquad(0.12, 0.12, M.glow, G.arrow, x, 0.8, -12.84, 0, 0, 0xffffff, 256, 128);
      COL.push([x - 0.125, -14.3, x + 0.125, -12.9]);
    }
    for (const x of [-2.7, -0.9, 0.9]) { boxR(0.17, 0.11, 0.035, 0x1c2026, x, 1.065, -13.0, -0.6); bb(x - 0.06, 1.02, -13.06, x + 0.06, 1.05, -12.96, 0x1c2026); }   // reader pads, sloped toward the approach
    for (const s of [-1, 1]) {                                                                    // the glass barrier either side of the gates
      const x0 = s > 0 ? 2.825 : -6.0, x1 = s > 0 ? 6.0 : -2.825;
      quad(x1 - x0, 1.0, M.glass, (x0 + x1) / 2, 0.6, -13.6); bb(x0, 1.08, -13.66, x1, 1.14, -13.54, 0x9aa0a6); bb(x0, 0, -13.66, x1, 0.1, -13.54, 0x6a7078);
      for (let x = x0; x <= x1 + 0.01; x += (x1 - x0) / 3) bb(x - 0.03, 0, -13.64, x + 0.03, 1.1, -13.56, 0x9aa0a6);
      COL.push([x0, -13.7, x1, -13.5]);
    }
    for (const x of [-1.6, 1.6]) {                                                                // blank departure screens over the gates (AR)
      rquad(1.3, 0.5, M.glow, G.blank, x, 2.75, -12.2, 0, 0, 0xffffff, 256, 128); rquad(1.3, 0.5, M.glow, G.blank, x, 2.75, -12.26, PI, 0, 0xffffff, 256, 128);
      bb(x - 0.68, 2.48, -12.27, x + 0.68, 3.02, -12.19, 0x2a2e34); bb(x - 0.02, 3.02, -12.24, x + 0.02, 3.6, -12.22, 0x6a7078);
    }
    // small decorated Christmas tree in a padded tub (-4.8, -11.2) and a padded bench (4.6, -12.0)
    cyl(0.32, 0.28, 0.45, 10, FOAM, -4.8, 0.225, -11.2);
    for (let i = 0; i < 4; i++) cyl(0.02, 0.62 - i * 0.14, 0.55, 8, i % 2 ? 0x2f5a3a : 0x2a5234, -4.8, 0.7 + i * 0.36, -11.2);
    seed = 51; for (let i = 0; i < 16; i++) { const a = rnd() * TAU, y = 0.6 + rnd() * 1.2, r = (0.62 - (y - 0.45) * 0.38) * 0.92; ico(0.045, [0xc8262e, 0xd8b440, 0xbfe6ff, 0xf6f4ee][i % 4], -4.8 + Math.sin(a) * r, y, -11.2 + Math.cos(a) * r); }
    ico(0.09, 0xd8b440, -4.8, 2.12, -11.2, 1.2);
    COL.push([-5.2, -11.6, -4.4, -10.8]);
    bench(4.6, -12.0, -H, 1.2); COL.push([4.0, -12.3, 5.2, -11.7]);
    // the back glazing (z -16) and its frames
    quad(12, 3.6, M.glass, 0, 1.8, -16.0);
    for (let x = -6; x <= 6.01; x += 2) bb(x - 0.06, 0, -16.06, x + 0.06, 3.6, -15.94, FRAME);
    bb(-6, 2.5, -16.06, 6, 2.6, -15.94, FRAME); bb(-6, 0, -16.06, 6, 0.12, -15.94, FRAME);
    COL.push([-6.0, -16.3, 6.0, -16.0]);

    // ======================================================== platform behind the glazing (never walked)
    tint = PLAT;
    bb(-30, -1.1, -20.3, 30, 0.0, -16.0, 0xb8b4ac);                                               // platform slab
    for (const sx of [-1, 1]) boxR(4.2, 0.12, 4.3, 0xb0aca4, sx * 32.0, -0.55, -18.15, 0, 0, sx * 0.26);   // ramps down at the ends
    bb(-30, 0.0, -20.1, 30, 0.008, -19.85, 0xc9a83a);                                             // tactile edge line
    for (const sx of [-1, 1]) for (let x = 16.3; x < 60; x += 0.3) bb(sx * x - 0.02, 0, -16.25, sx * x + 0.02, 1.8, -16.2, 0x4a5058);   // palisade along the rail corridor
    for (const sx of [-1, 1]) bb(sx > 0 ? 16.3 : -60, 1.55, -16.27, sx > 0 ? 60 : -16.3, 1.6, -16.18, 0x4a5058);
    quad(80, 6, M.vc, 0, -1.1, -23.3, 0, -H, 0x6a6258);                                           // ballast
    for (const z of [-21.1, -22.5]) bb(-40, -1.1, z - 0.04, 40, -0.95, z + 0.04, 0x8a8a8a);
    bb(-28, 3.9, -20.0, 28, 4.1, -16.0, 0xc8ccd0);                                                // platform canopy
    for (let x = -27; x <= 27; x += 6) cyl(0.08, 0.08, 3.9, 6, 0x8d9398, x, 1.95, -18.6);
    for (let x = -24; x <= 24; x += 12) rquad(1.6, 0.5, M.glow, G.blank, x, 2.9, -17.6, 0, 0, 0xffffff, 256, 128);
    bb(-40, -1.1, -26.4, 40, 0.6, -26.3, 0x7a8088);                                               // far fence
    for (let x = -40; x < 40; x += 2.5) bb(x - 0.03, -1.1, -26.38, x + 0.03, 0.9, -26.32, 0x6a7078);

    // ======================================================== the gazebo (shade tint) — static bits around it
    tint = SHADE;
    bb(-8.25, 0, -1.92, -7.95, 0.42, -1.28, 0x3a7ac0); bb(-8.27, 0.42, -1.94, -7.93, 0.47, -1.26, 0xf6f4ee);   // esky (-8.10, -1.60)
    for (const [x0, z0, x1, z1] of [[-8.4, -3.6, -3.6, -0.45]]) COL.push([x0, z0, x1, z1]);

    // ======================================================== IM: bollards, backdrop houses, street trees, poles
    root.add(b.done());
    const P = (g) => (root.add(g), g);
    const bol = []; for (let x = -15.2; x <= 15.21; x += 1.6) bol.push([x, 0, 9.45, 0, 1]);
    for (const pp of PROPS.parts('padded_bollard')) P(instanced(pp.geometry, pp.material, bol));
    const hs = []; seed = 61;
    const hrow = (x0, z0, dx, dz, n, ry) => { for (let i = 0; i < n; i++) hs.push([x0 + dx * i + (rnd() - 0.5) * 3, 0, z0 + dz * i + (rnd() - 0.5) * 3, ry + (rnd() - 0.5) * 0.3, [0.9 + rnd() * 0.3, 0.8 + rnd() * 0.4, 0.9]]); };
    hrow(-54, 40, 12, 0, 10, 0); hrow(-54, 52, 15, 0, 7, 0);                                   // across the road, behind the shops
    hrow(-30, -6, 0, 9, 3, H); hrow(-42, -12, 0, 10, 4, H); hrow(30, -6, 0, 9, 3, -H); hrow(42, -12, 0, 10, 4, -H);   // the sides
    hrow(-54, -38, 12, 0, 10, PI); hrow(-48, -50, 16, 0, 7, PI);                               // beyond the rail corridor
    const houses = P(instanced(geoOf(houseGeo), M.vc, hs)); houses.name = 'backdrop';
    const HC = [0xefe3c8, 0xdfe8ee, 0xf3d9c4, 0xe6e9d8, 0xf5ecd9, 0xdbe3d0];
    for (let i = 0; i < hs.length; i++) houses.setColorAt(i, tc.set(HC[i % 6]));
    const ts = [[-30, 0, 20.6, 0, 1.1], [-6, 0, 20.4, 1, 0.9], [14, 0, 20.6, 2, 1.0], [32, 0, 20.4, 0.5, 1.2], [-20, 0, -12, 1, 1.3], [22, 0, -12, 2, 1.4], [-26, 0, 2, 0.3, 1.2], [26, 0, 0, 1.2, 1.3]];
    for (let i = 0; i < 26; i++) { const sx = i % 2 ? 1 : -1, k = i >> 1; ts.push([sx * (20 + rnd() * 26), 0, -30 + k * 4.8 + rnd() * 2, rnd() * 3, 0.9 + rnd() * 0.6]); }
    for (let i = 0; i < 12; i++) ts.push([-55 + i * 10 + rnd() * 4, 0, -29 - rnd() * 4, rnd() * 3, 1.0 + rnd() * 0.5]);
    P(instanced(geoOf(treeGeo), M.vc, ts.filter((t) => !(Math.abs(t[0]) < 17 && t[2] > -27 && t[2] < 10))));
    P(instanced(geoOf(poleGeo), M.vc, [[-45, 0, 18.6, 0, 1], [-27, 0, 18.6, 0, 1], [-9, 0, 18.6, 0, 1], [9, 0, 18.6, 0, 1], [27, 0, 18.6, 0, 1], [45, 0, 18.6, 0, 1]]));
    for (const dy of [0, 0.35]) { const g = new THREE.Mesh(new THREE.BoxGeometry(100, 0.025, 0.025), M.vc); g.position.set(0, 8.45 - dy, 18.6); g.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(g.geometry.attributes.position.count * 3).fill(0.12), 3)); root.add(g); }

    // ======================================================== props: the gazebo
    tint = SHADE;
    R.gazebo = P(new THREE.Group()); R.gazebo.name = 'gazebo';
    const GX0 = -8.4, GX1 = -3.6, GZ0 = -3.6, GZ1 = -0.4, EY = 2.35, PY = 3.0, RX0 = -7.2, RX1 = -4.8, RZ = -2.0, OV = 0.06;
    const cu = (x) => (x - GX0) / (GX1 - GX0), cuZ = (z) => (z - GZ0) / (GZ1 - GZ0), V0 = 0.5, V1 = 1;
    R.gazebo.add(part('', () => {
      const ex0 = GX0 - OV, ex1 = GX1 + OV, ez0 = GZ0 - OV, ez1 = GZ1 + OV;
      const roof = (pts, uvs) => { tint = ONE; poly(pts, uvs, M.canopy, 0xffffff); poly(pts.slice().reverse(), uvs.slice().reverse(), M.canopyIn, 0xd8d0c8); tint = SHADE; };
      roof([[ex0, EY, ez1], [ex1, EY, ez1], [RX1, PY, RZ], [RX0, PY, RZ]], [[0, V0], [1, V0], [cu(RX1), V1], [cu(RX0), V1]]);           // front
      roof([[ex1, EY, ez0], [ex0, EY, ez0], [RX0, PY, RZ], [RX1, PY, RZ]], [[0, V0], [1, V0], [1 - cu(RX0), V1], [1 - cu(RX1), V1]]);   // back
      roof([[ex0, EY, ez0], [ex0, EY, ez1], [RX0, PY, RZ]], [[0, V0], [1, V0], [0.5, V1]]);                                            // west
      roof([[ex1, EY, ez1], [ex1, EY, ez0], [RX1, PY, RZ]], [[0, V0], [1, V0], [0.5, V1]]);                                            // east
      // side valances (static): outer face trim, inner plain
      for (const s of [-1, 1]) {
        const x = s < 0 ? ex0 : ex1;
        rquad(ez1 - ez0, 0.3, M.canopy, CN.trim, x, EY - 0.15, (ez0 + ez1) / 2, s * H, 0, 0xffffff, 128, 128);
        rquad(ez1 - ez0, 0.3, M.canopyIn, CN.trim, x - s * 0.005, EY - 0.15, (ez0 + ez1) / 2, -s * H, 0, 0xd8d0c8, 128, 128);
      }
      // legs (padded sleeves, 2040), feet, scissor truss under the eaves
      for (const [x, z] of [[GX0, GZ0], [GX1, GZ0], [GX0, GZ1], [GX1, GZ1]]) {
        bb(x - 0.025, 0, z - 0.025, x + 0.025, EY, z + 0.025, LEG); bb(x - 0.12, 0, z - 0.12, x + 0.12, 0.02, z + 0.12, 0x7a8088);
        cyl(0.07, 0.07, 0.7, 8, FOAM, x, 0.38, z);
      }
      for (const [x0, z0, x1, z1] of [[GX0, GZ1, GX1, GZ1], [GX0, GZ0, GX1, GZ0], [GX0, GZ0, GX0, GZ1], [GX1, GZ0, GX1, GZ1]]) {
        const n = Math.round(Math.hypot(x1 - x0, z1 - z0) / 1.2);
        for (let i = 0; i < n; i++) {
          const ax = x0 + (x1 - x0) * i / n, az = z0 + (z1 - z0) * i / n, bx = x0 + (x1 - x0) * (i + 1) / n, bz = z0 + (z1 - z0) * (i + 1) / n;
          const len = Math.hypot(bx - ax, bz - az, 0.3), ry = Math.atan2(bx - ax, bz - az), tilt = Math.atan2(0.3, Math.hypot(bx - ax, bz - az));
          boxR(0.02, 0.02, len, LEG, (ax + bx) / 2, EY - 0.17, (az + bz) / 2, tilt, ry); boxR(0.02, 0.02, len, LEG, (ax + bx) / 2, EY - 0.17, (az + bz) / 2, -tilt, ry);
        }
      }
      // tinsel twisted round the two front legs (Luke's touch)
      for (const x of [GX0, GX1]) for (let k = 0; k < 3; k++) for (let i = 0; i < 30; i++) { const a = i * 0.75 + k * 2.1, y = 0.74 + i * 0.053 + k * 0.012; boxR(0.032, 0.022, 0.032, k === 0 ? 0xc8262e : k === 1 ? 0xd8dce0 : 0x2e8a4a, x + Math.sin(a) * 0.05, y, GZ1 + Math.cos(a) * 0.05, a, a * 0.7, i * 0.4); }
    }));
    // front / back valances flap (pivot on the eave line)
    const val = (name, z, out) => {
      const g = part(name, () => {
        tint = ONE;
        for (const k of [0, 1]) {
          rquad(2.46, 0.3, M.canopy, CN.valance, -1.23 + k * 2.46, -0.15, out * 0.003, out > 0 ? 0 : PI, 0, 0xffffff, 128, 128);
          rquad(2.46, 0.3, M.canopyIn, CN.trim, -1.23 + k * 2.46, -0.15, -out * 0.003, out > 0 ? PI : 0, 0, 0xd8d0c8, 128, 128);
        }
      }, [-6.0, EY, z], 0, { floor: false });
      R.gazebo.add(g); return g;
    };
    R.valF = val('valance_front', GZ1 + OV + 0.004, 1); R.valB = val('valance_back', GZ0 - OV - 0.004, -1);
    R.tinsel = [GX0, GX1].map((x, i) => {
      const g = part('', () => { for (let k = 0; k < 14; k++) boxR(0.03, 0.022, 0.03, k % 2 ? 0xd8dce0 : 0xc8262e, Math.sin(k * 1.3) * 0.02, -0.03 - k * 0.032, Math.cos(k * 1.3) * 0.02, k, k); }, [x + (i ? -0.04 : 0.04), EY - 0.3, GZ1 + 0.04], 0, { floor: false });
      R.gazebo.add(g); return g;
    });

    // ======================================================== props: hotplate trolley, snags, onions, tongs
    tint = SHADE;
    R.hotplate = P(part('hotplate', () => {
      for (const [x, z] of [[-8.02, -3.02], [-6.18, -3.02], [-8.02, -2.38], [-6.18, -2.38]]) { bb(x - 0.025, 0.08, z - 0.025, x + 0.025, 0.88, z + 0.025, 0x6a7078); cyl(0.06, 0.06, 0.05, 8, 0x1a1a1a, x, 0.06, z, H); }
      bb(-8.05, 0.28, -3.05, -6.15, 0.31, -2.35, 0x6a7078);                                       // lower shelf
      cyl(0.15, 0.15, 0.38, 10, 0x3a6ab0, -7.75, 0.5, -2.72); cyl(0.09, 0.15, 0.06, 10, 0x3a6ab0, -7.75, 0.72, -2.72); cyl(0.035, 0.035, 0.05, 6, 0xd8d8d0, -7.75, 0.775, -2.72);   // gas bottle
      bb(-8.05, 0.8, -3.05, -6.15, 0.9, -2.35, 0x3a3d42);                                         // firebox
      bb(-8.0, 0.9, -3.0, -6.2, 0.92, -2.4, STEEL, M.plate);                                      // the plate (glows with heat)
      bb(-8.05, 0.9, -2.38, -6.15, 1.04, -2.35, 0x8a8e94); bb(-8.05, 0.9, -3.05, -8.02, 1.0, -2.35, 0x8a8e94); bb(-6.18, 0.9, -3.05, -6.15, 1.0, -2.35, 0x8a8e94);   // wind guard (customer side + ends)
      for (let i = 0; i < 3; i++) cyl(0.025, 0.025, 0.03, 8, 0x1a1a1a, -7.7 + i * 0.5, 0.84, -3.07, H);   // knobs (cook side)
      bb(-7.95, 0.82, -3.13, -6.25, 0.835, -3.115, 0xb8bec4); for (const x of [-7.95, -6.25]) bb(x - 0.01, 0.82, -3.13, x + 0.01, 0.835, -3.05, 0xb8bec4);   // rail
    }));
    {
      const sg = new THREE.CapsuleGeometry(0.0225, 0.175, 3, 8); sg.rotateX(H);
      const pa = sg.attributes.position, ca = new Float32Array(pa.count * 3);
      for (let i = 0; i < pa.count; i++) { const k = pa.getY(i) > 0.002 ? 1 : 0.74; ca[i * 3] = ca[i * 3 + 1] = ca[i * 3 + 2] = k; }
      sg.setAttribute('color', new THREE.BufferAttribute(ca, 3)); bakeLight(sg, { floor: false, ambient: 0.8 });
      R.snags = P(instanced(sg, M.snag, SNAG_X.map((x) => [x, SNAG_Y, SNAG_Z, 0, 1])));
      R.snags.name = 'snags'; R.snags.instanceMatrix.setUsage(THREE.DynamicDrawUsage); R.snags.frustumCulled = false;
      for (let i = 0; i < 6; i++) R.snags.setColorAt(i, SNAG_COL[0]);
      R.snags.userData = { set: snagSet, turn: snagTurn, reset: snagReset, get: (i) => SNAGS.up[i] };
    }
    R.onions = P(part('onions', () => {
      tint = ONE; seed = 83;
      { const g = new THREE.IcosahedronGeometry(0.15, 1); g.scale(0.95, 0.2, 1.4); g.translate(0, 0.0, 0); put(g, 0xe8e8e8, M.onion); }
      for (let i = 0; i < 30; i++) { const a = rnd() * TAU, r = Math.sqrt(rnd()), x = Math.cos(a) * r * 0.13, z = Math.sin(a) * r * 0.19, v = 0.82 + rnd() * 0.18; boxR(0.04 + rnd() * 0.04, 0.01, 0.01, (v * 255 | 0) * 0x10101, x, 0.02 + (1 - r) * 0.02, z, rnd() * 0.4, rnd() * PI, rnd() * 0.4, M.onion); }
    }, [-6.4, 0.92, -2.725], 0, { floor: false }));
    R.onions.userData = { stir: onionStir, cook: onionCook };
    R.heatQ = P(part('', () => { tint = ONE; quad(1.7, 0.5, M.heat, 0, 0.25, 0); quad(1.7, 0.5, M.heat, 0, 0.25, 0, H); }, [-7.1, 0.95, -2.7], 0, { floor: false }));
    R.tongs = P(PROPS.tongs()); R.tongs.name = 'tongs_spare'; R.tongs.position.set(-6.3, 0.95, -3.12); R.tongs.rotation.set(0, 0, PI);

    // ======================================================== props: the front table and everything on it
    R.table = P(new THREE.Group()); R.table.name = 'sizzle_table';
    R.table.add(part('', () => {
      bb(-7.62, 0.72, -1.17, -4.38, 0.76, -0.43, 0xe8e8e2);                                       // top
      for (const x of [-7.4, -4.6]) { boxR(0.04, 0.78, 0.04, 0x7a8088, x, 0.36, -0.95, 0.35); boxR(0.04, 0.78, 0.04, 0x7a8088, x, 0.36, -0.65, -0.35); }
      rquad(3.3, 0.76, M.atlas, A.cloth, -6.0, 0.7615, -0.8, 0, -H, 0xffffff);                     // cloth: top, front drop, sides
      rquad(3.3, 0.34, M.atlas, A.cloth, -6.0, 0.59, -0.42, 0, 0, 0xffffff);
      for (const s of [-1, 1]) rquad(0.76, 0.34, M.atlas, A.cloth, -6.0 + s * 1.65, 0.59, -0.8, s * H, 0, 0xffffff);
      // bread stack + bag, cooked-snag tray, onion tray, napkins, the build spot's paper plate
      bb(-6.98, 0.762, -0.88, -6.82, 0.84, -0.72, BREADC); rquad(0.16, 0.16, M.atlas, A.bread, -6.9, 0.842, -0.8, 0, -H);
      bb(-7.06, 0.762, -1.02, -6.74, 0.79, -0.9, 0xd8dce4);
      for (const x of [-6.45, -6.05]) { bb(x - 0.16, 0.762, -0.92, x + 0.16, 0.8, -0.68, 0xd8dadc); rquad(0.3, 0.22, M.atlas, A.tray, x, 0.801, -0.8, 0, -H); }
      for (let i = 0; i < 5; i++) boxR(0.2, 0.04, 0.04, 0x8a4a2a, -6.45, 0.81, -0.88 + i * 0.04, 0, 0.1 * (i % 2 ? 1 : -1));
      rquad(0.26, 0.18, M.atlas, A.onion, -6.05, 0.803, -0.8, 0, -H);
      bb(-5.03, 0.762, -0.67, -4.87, 0.81, -0.53, 0xf8f8f4);
      bb(-5.7, 0.761, -0.84, -5.5, 0.764, -0.66, 0xf8f8f4);
    }, null, 0, { floor: false }));
    R.urn = part('urn', () => {
      cyl(0.15, 0.16, 0.4, 12, URN, 0, 0.2, 0); cyl(0.13, 0.15, 0.05, 12, 0xb8bcc0, 0, 0.425, 0); cyl(0.03, 0.03, 0.04, 8, 0x1a1a1a, 0, 0.47, 0);
      bb(-0.02, 0.06, 0.15, 0.02, 0.1, 0.21, 0x2a2a2a); bb(-0.03, 0.035, 0.19, 0.03, 0.06, 0.22, 0x2a2a2a);
      for (const s of [-1, 1]) bb(s * 0.16, 0.3, -0.015, s * 0.19, 0.33, 0.015, 0x2a2a2a);
      tint = ONE; rquad(0.13, 0.065, M.atlas, A.urn, 0, 0.27, 0.152, 0, 0); tint = SHADE;
    }, [-7.3, 0.76, -0.8], 0, { floor: false });
    R.table.add(R.urn);
    R.sauces = part('sauces', () => {}, null, 0, { floor: false });
    R.bottles = [[-5.15, TOM, 'sauce_tomato'], [-5.0, BBQ, 'sauce_bbq']].map(([x, col, nm]) => {
      const g = part(nm, () => { cyl(0.032, 0.032, 0.16, 8, col, 0, 0.08, 0); cyl(0.032, 0.02, 0.03, 8, 0xf6f4ee, 0, 0.175, 0); cyl(0.006, 0.01, 0.04, 6, 0xf6f4ee, 0, 0.21, 0); }, [x, 0.76, -0.9], 0, { floor: false });
      R.sauces.add(g); return g;
    });
    R.sauces.userData = { squeeze: sauceSqueeze };
    R.table.add(R.sauces);
    R.tin = part('cash_tin', () => {
      bb(-0.11, 0, -0.08, 0.11, 0.07, 0.08, 0x46564a); bb(-0.1, 0.005, -0.07, 0.1, 0.066, 0.07, 0x1e2420);
      tint = ONE; rquad(0.13, 0.04, M.atlas, A.coin, 0, 0.038, 0.0805, 0, 0); tint = SHADE;
    }, [-4.65, 0.762, -0.8], 0, { floor: false });
    R.lid = part('cash_tin_lid', () => { bb(-0.112, 0, 0, 0.112, 0.012, 0.162, 0x52645a); bb(-0.03, 0.012, 0.13, 0.03, 0.02, 0.15, 0x8a8e94); }, [0, 0.07, -0.081], 0, { floor: false });
    R.tin.add(R.lid); R.tin.userData = { open: tinOpen, isOpen: false };
    R.table.add(R.tin);
    R.order = part('order_build', () => {}, [-5.6, 0.765, -0.75], 0, { floor: false });
    R.ob = {
      bread: part('ob_bread', () => { bb(-0.055, 0, -0.055, 0.055, 0.012, 0.055, 0xc99050); tint = ONE; rquad(0.11, 0.11, M.atlas, A.bread, 0, 0.0125, 0, 0, -H); tint = SHADE; boxR(0.11, 0.05, 0.012, BREADC, 0, 0.035, -0.05, -0.5); }, null, 0, { floor: false }),
      snag: part('ob_snag', () => { const g = new THREE.CapsuleGeometry(0.022, 0.16, 3, 8); g.rotateX(H); g.rotateY(0.6); g.translate(0, 0.034, 0); put(g, 0x8a4a2a); }, null, 0, { floor: false }),
      onions: part('ob_onions', () => { seed = 91; for (let i = 0; i < 9; i++) boxR(0.04, 0.008, 0.01, i % 2 ? 0xc99a50 : 0xd8b070, (rnd() - 0.5) * 0.08, 0.06, (rnd() - 0.5) * 0.08, 0, rnd() * PI); }, null, 0, { floor: false }),
      tomato: part('ob_sauce_tomato', () => { for (let i = 0; i < 6; i++) boxR(0.035, 0.008, 0.01, TOM, -0.05 + i * 0.02, 0.064, (i % 2 ? 0.012 : -0.012) - 0.0, 0, i % 2 ? 0.8 : -0.8); }, null, 0, { floor: false }),
      bbq: part('ob_sauce_bbq', () => { for (let i = 0; i < 6; i++) boxR(0.035, 0.008, 0.01, BBQ, -0.05 + i * 0.02, 0.064, (i % 2 ? 0.012 : -0.012), 0, i % 2 ? 0.8 : -0.8); }, null, 0, { floor: false }),
    };
    for (const k in R.ob) { R.ob[k].rotation.y = 0.6; R.order.add(R.ob[k]); }
    R.ob.bread.rotation.y = 0;
    R.order.userData = { show: orderShow, give: orderGive };
    R.table.add(R.order);

    // ======================================================== props: the hand-painted A-frame sign
    tint = OUT;
    R.sign = P(new THREE.Group()); R.sign.name = 'sizzle_sign'; R.sign.position.set(-2.9, 0, 0.3); R.sign.rotation.y = 0.35;
    R.signRock = part('', () => {
      const s = 0.2, hh = 1.3, cz = Math.tan(s) * hh / 2;   // two leaves hinged at the top (y 1.3), feet spread along local z
      for (const sz of [1, -1]) {
        boxR(0.72, hh / Math.cos(s), 0.03, 0xb8a47a, 0, hh / 2, sz * cz, -sz * s);
        quad(0.66, 0.85, M.sign, 0, 0.8, sz * (Math.tan(s) * (hh - 0.8)) + sz * 0.017 / Math.cos(s), sz > 0 ? 0 : PI, -s, 0xffffff);
        boxR(0.6, 0.04, 0.03, 0x8a7a5a, 0, 0.12, sz * Math.tan(s) * (hh - 0.12), -sz * s);
      }
      boxR(0.72, 0.05, 0.08, 0x6a5a40, 0, hh, 0);
    });
    R.sign.add(R.signRock);
    COL.push([-3.25, 0.05, -2.55, 0.55]);

    // ======================================================== props: bunting (24 flags, IM with instanceColor)
    {
      const fg = new THREE.BufferGeometry();
      fg.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-0.14, 0, 0, 0.14, 0, 0, 0, -0.32, 0, 0.14, 0, 0, -0.14, 0, 0, 0, -0.32, 0]), 3));
      fg.computeVertexNormals(); fg.setAttribute('color', new THREE.BufferAttribute(new Float32Array(18).fill(1), 3));
      const list = [];
      for (let i = 0; i < 24; i++) {
        const sw = Math.floor(i / 8), k = (i % 8 + 0.5) / 8, x0 = -12 + sw * 8, x = x0 + k * 8, y = 4.34 - 0.42 * Math.sin(k * PI), z = -5.52;
        BUNT[i * 3] = x; BUNT[i * 3 + 1] = y; BUNT[i * 3 + 2] = z; list.push([x, y, z, 0, 1]);
      }
      R.bunting = P(instanced(fg, M.vc, list)); R.bunting.name = 'bunting'; R.bunting.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      for (let i = 0; i < 24; i++) R.bunting.setColorAt(i, BUNT_COL[i % 3]);
      // the string's sag between the columns
      R.bunting.add(part('', () => {
        tint = ONE;
        for (let sw = 0; sw < 3; sw++) for (let j = 0; j < 8; j++) {
          const xa = -12 + sw * 8 + j, xb = xa + 1, ya = 4.34 - 0.42 * Math.sin((j / 8) * PI), yb = 4.34 - 0.42 * Math.sin(((j + 1) / 8) * PI);
          boxR(1.02, 0.015, 0.015, 0x2a2a2a, xa + 0.5, (ya + yb) / 2, -5.52, 0, 0, Math.atan2(yb - ya, 1));
        }
      }, null, 0, { floor: false }));
    }

    // ======================================================== props: fare gates (paddles IM, reader screens)
    R.gates = P(new THREE.Group()); R.gates.name = 'fare_gates';
    {
      const pg = new THREE.BoxGeometry(0.6, 0.78, 0.025); pg.translate(0.3, 0.74, 0);
      pg.setAttribute('color', new THREE.BufferAttribute(new Float32Array(pg.attributes.position.count * 3).fill(1), 3));
      const list = [];
      for (let i = 0; i < 6; i++) {
        const L = i >> 1, right = i & 1, hx = right ? -1.15 + 1.8 * L + 0.01 : -2.45 + 1.8 * L - 0.01;
        PAD.hx[i] = hx; PAD.base[i] = right ? PI : 0; PAD.a[i] = PAD.to[i] = 0;
        list.push([hx, 0, -13.6, PAD.base[i], 1]);
      }
      R.paddles = instanced(pg, M.gate, list); R.paddles.instanceMatrix.setUsage(THREE.DynamicDrawUsage); R.paddles.name = 'gate_paddles';
      R.gates.add(R.paddles);
      R.gates.add(part('gate_readers', () => {
        tint = ONE;
        for (let L = 0; L < 3; L++) rquad(0.13, 0.065, M.glow, L === 2 ? G.live : G.idle, -2.7 + 1.8 * L, 1.065 + 0.0186 * 0.565, -13.0 + 0.0186 * 0.825, 0, -0.6, 0xffffff, 256, 128);
      }, null, 0, { floor: false }));
      R.gateCol = LANE_COL.map((c) => c.slice());
      for (const c of R.gateCol) COL.push(c);
      R.gates.userData = { open: gateOpen, reader: gateReader, mode: 'idle' };
    }

    // ======================================================== props: the standing train behind the glazing
    tint = PLAT;
    R.train = P(new THREE.Group()); R.train.name = 'train_standing';
    R.train.add(part('', () => {
      for (const [x0, x1] of [[-22.2, -0.4], [0.4, 22.2]]) {
        bb(x0, -0.85, -23.15, x1, -0.15, -20.45, 0x3a3e44);                                       // underframe
        bb(x0, -0.15, -23.1, x1, 3.25, -20.42, 0xeef0f0);                                         // body
        bb(x0 + 0.1, 3.25, -22.95, x1 - 0.1, 3.55, -20.6, 0xc4c8cc);                              // roof
        for (let x = x0; x < x1 - 0.1; x += 5.45) rquad(Math.min(5.45, x1 - x), 3.0, M.atlas, A.train, x + Math.min(5.45, x1 - x) / 2, 1.35, -20.415, 0, 0, 0xffffff);
      }
      bb(-0.4, 0.3, -22.4, 0.4, 2.9, -21.2, 0x2a2e34);                                            // gangway
    }));
    const tglow = () => {
      for (const [x0] of [[-22.2], [0.4]]) {
        for (let k = 0; k < 4; k++) {
          const dx = x0 + 2.6 + k * 5.45;
          rquad(1.3, 2.05, M.glow, G.door, dx, 1.03, -20.40, 0, 0, 0xffffff, 256, 128);
          rquad(1.6, 0.85, M.glow, G.win, dx + 2.0, 1.85, -20.40, 0, 0, 0xffffff, 256, 128);
          rquad(1.1, 0.85, M.glow, G.win, dx - 1.75, 1.85, -20.40, 0, 0, 0xffffff, 256, 128);
        }
      }
    };
    R.trainGlow = part('train_glow', () => { tint = ONE; tglow(); }, null, 0, { floor: false });
    R.trainDark = part('train_dark', () => {
      for (const [x0] of [[-22.2], [0.4]]) for (let k = 0; k < 4; k++) { const dx = x0 + 2.6 + k * 5.45; bb(dx - 0.65, 0.0, -20.42, dx + 0.65, 2.05, -20.39, 0x1e242c); bb(dx + 1.2, 1.42, -20.42, dx + 2.8, 2.27, -20.39, 0x26323e); bb(dx - 2.3, 1.42, -20.42, dx - 1.2, 2.27, -20.39, 0x26323e); }
    }, null, 0, { floor: false });
    R.train.add(R.trainGlow, R.trainDark); R.trainDark.visible = false;
    R.train.userData = { glow: (on) => { R.trainGlow.visible = !!on; R.trainDark.visible = !on; } };

    // ======================================================== props: hover-car traffic (IM body + glow)
    {
      const bodyG = geoOf(carBody), glowG = geoOf(carGlow);
      const list = CARS.map((c) => [c.x, 0, c.z, c.d > 0 ? 0 : PI, 1]);
      R.traffic = P(new THREE.Group()); R.traffic.name = 'traffic';
      R.carBody = instanced(bodyG, M.vc, list); R.carGlow = instanced(glowG, M.carGlow, list);
      for (const im of [R.carBody, R.carGlow]) { im.instanceMatrix.setUsage(THREE.DynamicDrawUsage); im.frustumCulled = false; R.traffic.add(im); }
      for (let i = 0; i < 4; i++) R.carBody.setColorAt(i, CAR_COL[i]);
    }

    // ======================================================== props: the fig canopy (sways), urn-side extras
    R.fig = P(part('fig', () => {
      tint = OUT; seed = 97;
      const blobs = [[0, 6.8, 0, 3.0], [2.6, 6.2, 1.2, 2.4], [-2.5, 6.3, 0.8, 2.5], [0.8, 6.0, -2.6, 2.4], [-1.2, 6.4, 2.8, 2.3], [2.2, 7.6, -1.0, 2.2], [-2.0, 7.4, -1.6, 2.1], [0.4, 8.2, 1.4, 2.0], [3.4, 5.6, -1.4, 1.8], [-3.4, 5.7, -1.0, 1.8]];
      for (const [x, y, z, r] of blobs) ico(r, rnd() > 0.5 ? LEAF : rnd() > 0.5 ? 0x35603a : 0x4a7640, x, y, z, 0.7);
      for (const [x, z, l] of [[1.4, 0.6, 2.2], [-1.2, 1.1, 1.8], [0.4, -1.5, 2.0], [-0.6, -0.4, 2.4]]) cyl(0.025, 0.025, l, 4, 0x7e705e, x, 4.6 - l / 2, z);   // aerial roots
      for (let i = 0; i < 6; i++) { const a = i * 1.05 + 0.4; limb(0, 4.1, 0, Math.sin(a) * 2.6, 6.0 + (i % 2) * 0.6, Math.cos(a) * 2.6, 0.32, 0.12, i % 2 ? TRUNK : 0x7e705e); }
    }, [10, 0, 2], 0, { floor: false }));

    // ======================================================== far: band, storm wall, clouds, sun (Basic, no fog)
    SKYM ||= {
      band: new THREE.MeshBasicMaterial({ map: T.band, transparent: true, fog: false, depthWrite: false }),
      storm: new THREE.MeshBasicMaterial({ map: T.storm, transparent: true, fog: false, depthWrite: false }),
      cloud: new THREE.MeshBasicMaterial({ map: T.cloud, transparent: true, fog: false, depthWrite: false }),
      sun: new THREE.MeshBasicMaterial({ color: 0xfffbea, fog: false, transparent: true }),
      halo: new THREE.MeshBasicMaterial({ color: 0xfff6d0, fog: false, transparent: true, opacity: 0.3, depthWrite: false }),
    };
    R.far = P(new THREE.Group()); R.far.name = 'far';
    {
      const bg = new THREE.CylinderGeometry(380, 380, 60, 48, 1, true), uv = bg.attributes.uv;
      for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * 6);
      bg.translate(0, 22, 0); const band = new THREE.Mesh(bg, SKYM.band); band.renderOrder = -3; band.scale.set(-1, 1, 1); band.rotation.y = 0.45; R.far.add(band); R.band = band;
      // storm wall: six anvil cards to -Z (slightly -X), one merged mesh; build(u) scales the group up from y 30
      const parts = [];
      for (const [x, z, w, hh] of [[-150, -235, 190, 150], [-40, -265, 230, 170], [70, -250, 200, 150], [-90, -320, 240, 190], [170, -300, 220, 160], [-230, -280, 200, 140]]) {
        const g = new THREE.PlaneGeometry(w, hh); g.translate(0, hh / 2, 0); g.lookAt(new THREE.Vector3(-x, 0, -z)); g.translate(x, 0, z); parts.push(g);
      }
      const sm = new THREE.Mesh(mergeGeometries(parts), SKYM.storm); for (const g of parts) g.dispose();
      R.stormG = new THREE.Group(); R.stormG.position.y = 26; R.stormG.add(sm); sm.renderOrder = -2; R.far.add(R.stormG);
      const cp = [];
      for (const [x, y, z, w] of [[-120, 70, 210, 90], [-20, 92, 240, 120], [90, 64, 200, 80], [200, 84, 230, 110], [-230, 88, 180, 100]]) {
        const g = new THREE.PlaneGeometry(w, w * 0.45); g.lookAt(new THREE.Vector3(-x, 0, -z)); g.translate(x, y, z); cp.push(g);
      }
      R.clouds = new THREE.Mesh(mergeGeometries(cp), SKYM.cloud); for (const g of cp) g.dispose(); R.clouds.renderOrder = -2; R.far.add(R.clouds);
      R.sun = new THREE.Group(); R.sun.name = 'sun';
      const disc = new THREE.Mesh(new THREE.CircleGeometry(10, 20), SKYM.sun), halo = new THREE.Mesh(new THREE.CircleGeometry(26, 20), SKYM.halo);
      halo.position.z = -0.5; disc.renderOrder = halo.renderOrder = -4; R.sun.add(disc, halo); R.far.add(R.sun);
      R.far.userData.storm = STORM;
    }

    // ======================================================== the five customers (set-owned rigs, built once)
    R.customers = P(new THREE.Group()); R.customers.name = 'customers';
    CUST ||= CUSTL.map((id, i) => makeCustomer(id, i));
    for (const c of CUST) { R.customers.add(c.rig.root); COL.push(c.col); }
    R.customers.userData = QUEUE;

    // first dressing (no env/audio changes inside a build)
    R.scene = typeof state !== 'undefined' && state ? state.scene : null;
    dress(AUTO[R.scene] || R.state || 'luke26', { build: true });
    if (!R.watch && typeof addUpdate === 'function') { R.watch = true; addUpdate(torchWatch); }
    return root;
  }

  // ---------------------------------------------------------- customers: sizzle_a..e with their bits
  const CUSTL = ['sizzle_a', 'sizzle_b', 'sizzle_c', 'sizzle_d', 'sizzle_e'];
  const JIT = [0.08, -0.1, 0.12, -0.05, 0.03];
  const IDLES = [['idle', 'hands_hips', 'phone', 'chip_ping', 'look_down'], ['phone', 'idle', 'look_down', 'chip_ping', 'idle'],
    ['arms_crossed', 'idle', 'look_down', 'idle', 'chip_ping'], ['phone', 'phone', 'idle', 'look_down', 'chip_ping'], ['idle', 'hands_hips', 'chip_ping', 'look_down', 'idle']];
  function accessory(fn) { return part('', () => { tint = ONE; fn(); }, null, 0, { floor: false }); }
  function makeCustomer(id, i) {
    const rig = buildCharacter(id); rig.root.add(blobShadow());
    const hs = (rig.d && rig.d.hs) || 1, head = rig.parts.head, gl = rig.attach.gripL, gr = rig.attach.gripR;
    const c = { i, id, rig, st: 'hidden', slot: -1, x: 1e4, z: 1e4, yaw: PI, face: PI, tx: 0, tz: 0, path: null, pi: 0, sp: 1.25,
      a: 'idle', at: 0, t: 2 + i * 0.7, pick: 'idle', pt: 0, visits: 0, cool: 0, col: [1e4, 1e4, 1e4, 1e4], P: { speed: 0.74, walk: false },
      acc0: null, keep0: true, acc1: null, hide1: [], food: null, pram: null };
    // the sandwich they walk off with: shown by the 'eat' anim (attach.food) and at the hand-over
    c.food = accessory(() => {
      box(0.11, 0.03, 0.06, BREADC, 0, -0.015, 0); const g = new THREE.CapsuleGeometry(0.018, 0.12, 2, 6); g.rotateZ(H); g.translate(0, 0.022, 0); put(g, 0x8a4a2a);
      boxR(0.1, 0.006, 0.012, TOM, 0, 0.042, 0, 0, 0, 0);
    });
    c.food.position.set(0, -0.01, 0.04); c.food.visible = false; gr.add(c.food); rig.attach.food = c.food;
    if (i === 0) { c.acc1 = accessory(() => { const g = new THREE.SphereGeometry(0.125 * hs, 10, 6, 0, TAU, 0, H); g.scale(1, 0.85, 1.08); g.translate(0, 0.2 * hs, 0); put(g, 0xf2f2ee); cyl(0.16 * hs, 0.16 * hs, 0.012, 12, 0xe8e8e2, 0, 0.2 * hs, 0.01); }); c.hide1 = ['cap']; head.add(c.acc1); }
    if (i === 1) {
      c.pram = accessory(() => {   // the pram-less hover-pram: a padded pod floating at her side
        const g = new THREE.SphereGeometry(0.26, 10, 6); g.scale(0.8, 0.55, 1.3); put(g, 0xf4f2ee);
        const h = new THREE.SphereGeometry(0.24, 10, 6, 0, TAU, 0, H * 0.9); h.scale(0.82, 0.9, 0.7); h.translate(0, 0.02, -0.12); put(h, 0x2aa8a0);
        cyl(0.16, 0.16, 0.02, 10, 0xffffff, 0, -0.15, 0, 0, 0, M.carGlow); boxR(0.02, 0.28, 0.02, 0xb8bec4, 0, 0.18, -0.3, -0.5);
      });
      c.pram.position.set(0.52, 0.52, 0.15); rig.root.add(c.pram);
      c.acc1 = accessory(() => { const g = new THREE.CylinderGeometry(0.1 * hs, 0.11 * hs, 0.08 * hs, 12); g.translate(0, 0.27 * hs, 0); put(g, 0xe8d8a8); cyl(0.24 * hs, 0.24 * hs, 0.012, 14, 0xe0cc98, 0, 0.225 * hs, 0); cyl(0.112 * hs, 0.112 * hs, 0.025 * hs, 12, 0xc8262e, 0, 0.24 * hs, 0); });
      c.hide1 = ['sunnies']; head.add(c.acc1);
    }
    if (i === 2) {
      c.acc0 = accessory(() => { box(0.012, 0.72, 0.02, 0xc8262e, 0, -0.74, 0.02); const g = new THREE.TorusGeometry(0.06, 0.012, 4, 10); g.rotateX(0.3); g.translate(0, -0.79, 0.06); put(g, 0xc8262e); });   // the lead, no dog
      gl.add(c.acc0);
      c.acc1 = accessory(() => { const g = new THREE.CylinderGeometry(0.1 * hs, 0.125 * hs, 0.09 * hs, 12); g.translate(0, 0.265 * hs, 0); put(g, 0x8a9a6a); const br = new THREE.CylinderGeometry(0.17 * hs, 0.19 * hs, 0.04 * hs, 12, 1, true); br.translate(0, 0.21 * hs, 0); put(br, 0x7a8a5a); });
      c.hide1 = ['cap']; head.add(c.acc1);
    }
    if (i === 3) {
      c.acc0 = accessory(() => { box(0.2, 0.78, 0.02, 0x2a2a2a, 0, -0.62, 0.0); box(0.19, 0.76, 0.006, 0xd84a3a, 0, -0.61, 0.012); for (const y of [-0.3, -0.92]) for (const x of [-0.07, 0.07]) cyl(0.025, 0.025, 0.03, 6, 0xe8e2c8, x, y, -0.025, H); });
      c.acc0.rotation.y = H; gl.add(c.acc0);
      c.acc1 = accessory(() => { const g = new THREE.SphereGeometry(0.112 * hs, 10, 5, 0, TAU, 0, H); g.scale(1, 0.7, 1.05); g.translate(0, 0.19 * hs, 0); put(g, 0xc8262e); box(0.12 * hs, 0.012, 0.09 * hs, 0xa81e26, 0, 0.19 * hs, -0.13 * hs); });
      head.add(c.acc1);
    }
    if (i === 4) {
      c.acc0 = accessory(() => { const g = new THREE.IcosahedronGeometry(0.11, 1); g.translate(0, -0.08, 0.06); put(g, 0xe8e2d4); box(0.22, 0.012, 0.012, 0x1e3a8a, 0, -0.08, 0.06); });   // a netball
      c.keep0 = false; gl.add(c.acc0);
      c.acc1 = accessory(() => { box(0.5, 0.26, 0.24, 0x1e3a8a, 0, -0.34, 0); box(0.51, 0.04, 0.25, 0xf0f0f0, 0, -0.26, 0); box(0.04, 0.2, 0.03, 0x1a1a1a, 0, -0.12, 0); });
      c.acc1.rotation.y = H; gl.add(c.acc1);
    }
    if (c.acc1) c.acc1.visible = false;
    return c;
  }
  function custLook(c) {   // visit 1: base kit; visit 2 (and 4...): the hat/bag swap
    const sw = c.visits % 2 === 1;
    if (c.acc1) c.acc1.visible = sw;
    if (c.acc0) c.acc0.visible = c.keep0 || !sw;
    for (let k = 0; k < c.hide1.length; k++) { const a = c.rig.attach[c.hide1[k]]; if (a) a.visible = !sw; }
  }

  // ---------------------------------------------------------- the queue (driven by 47-mg-sizzle through SETS.sandgate.queue)
  const Q = [];                    // customer indices in slot order (Q[0] = at the serve point)
  const SLOT_Z = [0.15, 1.05, 1.95, 2.85, 3.75], SERVE_X = -5.6;
  const P_OUT = [[-9.8, 1.0], [-15.0, 6.5], [-21.0, 8.6]];               // cust_out after the serve point (+ off the plaza)
  const P_IN = [[22.0, 8.6], [16.0, 6.0], [2.0, 6.5], [-5.6, 4.65]];     // cust_in up to the tail approach
  // while the queue is live (the mini-game: sz_hot / sz_front only) they vanish and reappear just out of those shots,
  // so the five can keep a queue going at a real serving pace (a full loop is ~20 s instead of ~35 s)
  const P_OUT_LIVE = [[-9.8, 1.0], [-15.0, 6.5]];
  const P_IN_LIVE = [[9.5, 7.6], [2.0, 6.5], [-5.6, 4.65]];
  const QS = { live: false, target: 0, count: 0 };
  function hideCust(c) { c.st = 'hidden'; c.rig.root.visible = false; c.x = c.z = 1e4; c.slot = -1; c.col[0] = c.col[1] = c.col[2] = c.col[3] = 1e4; c.food.visible = false; c.cool = 1.2; }
  function slotXZ(c, s) { c.tx = SERVE_X + JIT[c.i]; c.tz = SLOT_Z[Math.min(4, s)]; }
  function placeAt(c, s) {
    c.slot = s; slotXZ(c, s); c.x = c.tx; c.z = c.tz; c.yaw = c.face = PI; c.st = 'wait'; c.path = null;
    c.rig.root.visible = true; c.a = ''; c.pick = 'idle'; c.t = 1 + Math.random() * 3; c.food.visible = false; custLook(c);
  }
  function queueReset(n = 3, live = R.state === 'sizzle26') {
    n = Math.max(0, Math.min(5, n | 0)); Q.length = 0; QS.count = 0; QS.live = !!live; QS.target = live ? 5 : n;
    for (let i = 0; i < CUST.length; i++) { const c = CUST[i]; c.visits = 0; if (i < n) { Q.push(i); placeAt(c, i); } else hideCust(c); c.cool = 0; }
  }
  function queueFront() { if (!Q.length) return -1; const c = CUST[Q[0]]; return c.st === 'wait' && c.slot === 0 ? c.i : -1; }
  function startLeave(c, served) {
    c.st = served ? 'served' : 'leave'; c.at = 0; c.pt = 0; c.slot = -1; c.path = QS.live ? P_OUT_LIVE : P_OUT; c.pi = 0; c.sp = QS.live ? 1.4 : 1.25;
    if (!served) { c.a = ''; }
  }
  function queueAdvance() {
    if (!Q.length) return -1;
    const i = Q.shift(), c = CUST[i];
    c.visits++; QS.count++; startLeave(c, true);
    for (let k = 0; k < Q.length; k++) { const o = CUST[Q[k]]; o.slot = k; slotXZ(o, k); if (o.st === 'wait') { o.st = 'step'; o.sp = 0.95; } }
    if (isCur()) snd('murmur', 0.18, 1.1, MURMUR_AT);
    return i;
  }
  function startEnter(c) {
    Q.push(c.i); c.slot = Q.length - 1; slotXZ(c, c.slot);
    c.st = 'enter'; c.path = QS.live ? P_IN_LIVE : P_IN; c.pi = 0; c.x = c.path[0][0]; c.z = c.path[0][1]; c.yaw = c.face = -H; c.sp = 2.6;
    c.rig.root.visible = true; c.a = ''; custLook(c);
  }
  const QUEUE = {
    reset: (n, live) => queueReset(n, live === undefined ? R.state === 'sizzle26' : live), front: queueFront, advance: queueAdvance,
    get count() { return QS.count; },
    bubble(i, out) { const c = CUST && CUST[i]; if (!c || !out) return out; out.set(c.x, c.rig.height + 0.28, c.z); return out; },   // head + 0.4 m
    look: (i) => CUSTL[i], visits: (i) => (CUST && CUST[i] ? CUST[i].visits : 0), length: () => Q.length,
    live(on, target = 5) { QS.live = !!on; QS.target = on ? target : Q.length; },
    leave(i) { const c = CUST && CUST[i]; if (!c || c.st === 'hidden') return; const k = Q.indexOf(i); if (k >= 0) { Q.splice(k, 1); for (let j = 0; j < Q.length; j++) { const o = CUST[Q[j]]; o.slot = j; slotXZ(o, j); if (o.st === 'wait') o.st = 'step'; } } startLeave(c, false); },
  };
  const WALK_ANIM = 'walk';
  function custTick(c, dt, t) {
    const r = c.rig.root;
    if (c.st === 'hidden') {
      if (c.cool > 0) c.cool -= QS.live ? dt * 2 : dt;
      else if (Q.length < QS.target) startEnter(c);
      return;
    }
    let want = c.pick, moving = false;
    if (c.st === 'served') {   // the hand-over: reach, take it, turn away
      want = 'give'; c.pt += dt;
      if (c.pt > 0.5) c.food.visible = true;
      if (c.pt > 0.85) { c.st = 'leave'; c.pt = 0; }
    }
    if (c.st === 'enter' || c.st === 'step' || c.st === 'leave') {
      let tx = c.tx, tz = c.tz;
      if (c.path && c.pi < c.path.length) { tx = c.path[c.pi][0]; tz = c.path[c.pi][1]; }
      const dx = tx - c.x, dz = tz - c.z, d = Math.hypot(dx, dz), st = c.sp * dt;
      if (d <= st) {
        c.x = tx; c.z = tz;
        if (c.path && c.pi < c.path.length) { c.pi++; if (c.st === 'enter' && c.pi >= c.path.length - 2) c.sp = QS.live ? 1.45 : 1.25; }
        else if (c.st === 'leave') { hideCust(c); return; }
        else { c.st = 'wait'; c.face = PI; c.t = 1.5 + Math.random() * 2.5; c.pick = 'idle'; }
        if (c.st === 'leave' && c.path && c.pi >= c.path.length) { hideCust(c); return; }
      } else { c.x += (dx / d) * st; c.z += (dz / d) * st; c.face = Math.atan2(dx, dz); moving = true; }
      if (moving) { want = c.st === 'leave' ? 'eat' : c.sp > 2 ? 'run' : WALK_ANIM; }
    }
    if (c.st === 'wait') {   // idle life: phone, chip ping, look down, a shuffle
      if ((c.t -= dt) <= 0) {
        const k = Math.random(); c.t = 2.5 + Math.random() * 3.5;
        c.pick = k < 0.12 ? 'shuffle' : IDLES[c.i][(Math.random() * 5) | 0];
        if (c.pick === 'chip_ping') c.t = 1.0;
        if (c.pick === 'shuffle') c.t = 0.6;
      }
      want = c.pick === 'shuffle' ? WALK_ANIM : c.pick;
      c.face = PI + (c.pick === 'shuffle' ? 0.25 * Math.sin(t * 3 + c.i) : 0.05 * Math.sin(t * 0.4 + c.i * 2));
    }
    if (want !== c.a) { c.a = want; c.at = 0; }
    c.at += dt;
    c.yaw += ((((c.face - c.yaw + PI) % TAU) + TAU) % TAU - PI) * Math.min(1, dt * 6);
    r.position.set(c.x, 0, c.z); r.rotation.y = c.yaw;
    const pp = c.P; pp.walk = c.a === 'eat' && moving; pp.speed = c.a === 'run' ? c.sp / 3.4 : c.a === WALK_ANIM && c.pick === 'shuffle' && !moving ? 0.35 : c.sp / 1.7;
    c.rig.pose(c.a, c.at, pp); c.rig.update(dt);
    if (c.pram) c.pram.position.y = 0.52 + 0.03 * Math.sin(t * 2.1 + c.i);
    c.col[0] = c.x - 0.28; c.col[1] = c.z - 0.28; c.col[2] = c.x + 0.28; c.col[3] = c.z + 0.28;
  }

  // ---------------------------------------------------------- prop APIs (no allocation)
  function snagColor(u, out) {
    if (u <= 0) return out.copy(SNAG_COL[0]);
    if (u >= 1) return out.copy(SNAG_COL[4]);
    const k = Math.min(3, (u * 4) | 0), f = u * 4 - k;
    return out.copy(SNAG_COL[k]).lerp(SNAG_COL[k + 1], f);
  }
  const toU = (s) => (typeof s === 'number' ? Math.max(0, Math.min(1, s)) : s in SNAG_U ? SNAG_U[s] : 0);
  function snagMatrix(i, ang, lift) {
    const gone = SNAGS.up[i] < 0;
    ev.set(0, 0, ang); qv.setFromEuler(ev); pv.set(SNAG_X[i], SNAG_Y + lift, SNAG_Z); sv.setScalar(gone ? 0.0001 : 1);
    R.snags.setMatrixAt(i, m5.compose(pv, qv, sv)); R.snags.instanceMatrix.needsUpdate = true;
  }
  function snagSet(i, s, side) {
    if (!R.snags || i < 0 || i > 5) return;
    const u = toU(s);
    if (side === 'down') { SNAGS.dn[i] = u; return; }
    const wasGone = SNAGS.up[i] < 0;
    SNAGS.up[i] = u; if (side !== 'up' || u < 0) SNAGS.dn[i] = u;
    if (u >= 0) { R.snags.setColorAt(i, snagColor(u, tc2)); R.snags.instanceColor.needsUpdate = true; }
    if (wasGone !== (u < 0)) snagMatrix(i, 0, 0);
  }
  function snagTurn(i) {
    if (!R.snags || i < 0 || i > 5 || SNAGS.up[i] < 0 || SNAGS.t[i] >= 0) return;
    SNAGS.t[i] = 0; SNAGS.swapped[i] = 0;
    snd('sizzle', 0.22, 1.5, SNAG_AT); snd('tick', 0.5, 0.7, SNAG_AT);
  }
  function snagReset() { for (let i = 0; i < 6; i++) { SNAGS.t[i] = -1; SNAGS.up[i] = -2; snagSet(i, 'raw'); snagMatrix(i, 0, 0); } }
  function onionCook(u) {
    u = Math.max(0, Math.min(1, u)); R.onionU = u;
    if (u < 0.5) M.onion.color.copy(ONI_COL[0]).lerp(ONI_COL[1], u * 2); else M.onion.color.copy(ONI_COL[1]).lerp(ONI_COL[2], (u - 0.5) * 2);
  }
  function onionStir() { R.stirT = 0; snd('sizzle', 0.3, 1.1, ONION_AT); puff(ONION_AT, PUFF_STEAM); }
  function orderShow(o) {
    if (!R.ob) return;
    o = o || {};
    R.order.visible = true; R.order.position.z = -0.75; R.giveT = -1;
    R.ob.bread.visible = !!o.bread; R.ob.snag.visible = !!o.snag; R.ob.onions.visible = !!o.onions;
    R.ob.tomato.visible = o.sauce === 'tomato'; R.ob.bbq.visible = o.sauce === 'bbq';
  }
  function orderHide() { for (const k in R.ob) R.ob[k].visible = false; R.order.position.z = -0.75; R.giveT = -1; }
  function orderGive() { if (R.order) R.giveT = 0; }
  function sauceSqueeze(kind) { const k = kind === 'bbq' ? 1 : 0; R.sqT[k] = 0; snd('pop', 0.35, 0.55, SAUCE_AT); }
  function tinOpen(on) { if (!R.tin) return; on = !!on; if (R.tin.userData.isOpen !== on) snd('clunk', 0.3, 1.7, TIN_AT); R.tin.userData.isOpen = on; R.tinTo = on ? -1.75 : 0; }
  function gateOpen(lane, on) {
    lane |= 0; if (lane < 0 || lane > 2 || !R.gateCol) return;
    on = !!on;
    PAD.to[lane * 2] = on ? 1.3 : 0; PAD.to[lane * 2 + 1] = on ? -1.3 : 0; PAD.on = true;
    const cc = R.gateCol[lane], src = LANE_COL[lane];
    for (let k = 0; k < 4; k++) cc[k] = on ? 1e4 : src[k];
    snd('door_slide', 0.35, 1.8, GATE_AT);
  }
  function gateReader(lane, mode) {
    if ((lane | 0) !== 2 || !T) return;   // only lane 2's reader has a live screen (the others always show TAP)
    mode = mode === 'tap3' || mode === 'ok' ? mode : 'idle';
    if (R.gates && R.gates.userData.mode === mode) return;
    paintReader(T.glow.image.getContext('2d'), mode); T.glow.needsUpdate = true;
    if (R.gates) R.gates.userData.mode = mode;
    if (mode !== 'idle') snd('beep', 0.4, 1.3, GATE_AT);
  }
  function hotSizzle(level) { R.heat = Math.max(0, Math.min(1, +level || 0)); }
  const STORM = {
    build(u, dur = 3) { R.stormTo = Math.max(0, Math.min(1, +u || 0)); R.stormRate = dur > 0 ? Math.max(0.02, Math.abs(R.stormTo - R.storm) / dur) : 99; },
    flicker(on) { R.flick = !!on; R.flickT = 1.5; },
    get u() { return R.storm; },
  };

  // ---------------------------------------------------------- audio + puffs (preallocated, rate-limited, current set only)
  const SO = { vol: 1, rate: 1, at: null };
  const SNAG_AT = [-7.4, 1.0, -2.7], ONION_AT = [-6.4, 1.0, -2.72], SAUCE_AT = [-5.1, 0.9, -0.9], TIN_AT = [-4.65, 0.85, -0.8],
    GATE_AT = [0.9, 1.0, -13.2], MURMUR_AT = [-5.6, 1.5, 2.0], BUS_AT = [8, 1.5, 9.5], CAR_AT = [0, 0.6, 12];
  const PUFF_AT = [[-7.75, 0.98, -2.68], [-7.35, 0.98, -2.76], [-6.98, 0.98, -2.7], [-6.4, 0.98, -2.72]];
  const PUFF_SMOKE = { n: 2, color: 0xe8e4dc, speed: 0.22, life: 1.7, gravity: -0.55 };
  const PUFF_STEAM = { n: 6, color: 0xf2efe8, speed: 0.3, life: 1.3, gravity: -0.7 };
  const PUFF_LEAF = { n: 3, color: 0x4a7640, speed: 0.9, life: 1.4, gravity: 1.2 };
  const LEAF_AT = [[7.5, 5.2, 0.5], [12.5, 5.6, 3.5], [9.0, 6.0, 5.5], [11.0, 5.0, -1.5]];
  const isCur = () => typeof world !== 'undefined' && world.setId === 'sandgate';
  const skip = () => typeof flow !== 'undefined' && flow && flow.skipping;
  function snd(name, vol, rate, atp) {
    if (!isCur() || skip() || typeof sfx !== 'function') return;
    SO.vol = vol; SO.rate = rate; SO.at = atp; sfx(name, SO);
  }
  function puff(atp, o) { if (isCur() && typeof world !== 'undefined' && world.puff) world.puff(atp, o); }
  // Once another set is current, give back what this set took: torchAuto (the engine does not reset it in showE) and the
  // audio ambience (2.7 shows this set for one INSERT with world.show, which sets no ambience, then shows the train).
  function torchWatch() {
    if (typeof world === 'undefined' || world.setId === 'sandgate') return;
    if (R.torchTaken) { world.torchAuto = true; R.torchTaken = false; }
    if (R.ambTaken) {
      R.ambTaken = false; R.amb = null;
      const a = world.set && world.set.ambience;
      if (a && typeof AUDIO !== 'undefined' && AUDIO.ambience) { AUDIO.ambience(a); if (AUDIO.setRoom) AUDIO.setRoom(a.room || 'none'); }
    }
  }

  // ---------------------------------------------------------- ambience per dress state (the getter feeds the flow's loadSet)
  const HOT_LOOP = { name: 'hotplate', vol: 0.9, at: [-7.1, 1.0, -2.7] };
  const AMB = {
    day: { rain: false, loops: [['hover_traffic', 0.75], ['city', 0.35], HOT_LOOP, ['birds', 0.8]], room: 'none' },
    gust: { rain: false, loops: [['hover_traffic', 0.75], ['city', 0.3], HOT_LOOP, ['birds', 0.5], ['wind', 0.7]], room: 'none' },
    gates: { rain: false, loops: [['wind', 0.45], ['hum', 0.5], ['thunder', 0.6]], room: 'room' },
  };
  const AMB_OF = { luke26: 'day', sizzle26: 'day', credits: 'day', invite26: 'gust', gates27: 'gates' };
  function applyAmbience() {
    R.amb = R.state; R.ambEnv = R.env;
    if (typeof AUDIO === 'undefined' || !AUDIO.ambience) return;
    R.ambTaken = true;
    const k = R.env === 'gust26' && AMB_OF[R.state] === 'day' ? 'gust' : AMB_OF[R.state] || 'day', a = AMB[k];
    AUDIO.ambience(a); if (AUDIO.setRoom) AUDIO.setRoom(a.room);
  }

  // ---------------------------------------------------------- scene dressing
  const AUTO = { '2.6': 'luke26', '2.7': 'gates27', C: 'credits' };
  const DRESS = {
    luke26:   { env: 'arvo26', cust: 3, live: false, snags: ['browning', 'ready', 'browning', 'ready', 'browning', 'browning'], heat: 0.6, tin: false, storm: 0.35, onion: 0.45 },
    sizzle26: { env: 'arvo26', cust: 5, live: true, snags: ['raw', 'raw', 'raw', 'raw', 'raw', 'raw'], heat: 0.6, tin: true, storm: 0.4, onion: 0.1 },
    invite26: { env: 'arvo26', cust: 2, live: false, drift: true, snags: ['ready', 'ready', 'gone', 'ready', 'gone', 'ready'], heat: 0.4, tin: false, storm: 0.45, onion: 0.7 },
    gates27:  { env: 'gates27', cust: 0, live: false, snags: ['gone', 'gone', 'gone', 'gone', 'gone', 'gone'], heat: 0, tin: false, storm: 0.75, onion: -1 },
    credits:  { env: 'arvo26', cust: 3, live: false, snags: ['browning', 'browning', 'browning', 'browning', 'browning', 'browning'], heat: 0.6, tin: false, storm: 0, onion: 0.45 },
  };
  function dress(st, o = {}) {
    if (!DRESS[st]) st = 'luke26';
    R.state = st; R.autoAt = -1;
    if (typeof state !== 'undefined' && state) R.scene = state.scene;   // an explicit dress acknowledges the scene (no auto re-dress later)
    if (!R.root || !R.snags) return;
    const D = DRESS[st];
    for (let i = 0; i < 6; i++) { SNAGS.t[i] = -1; SNAGS.up[i] = -2; snagSet(i, D.snags[i]); snagMatrix(i, 0, 0); }
    R.onions.visible = D.onion >= 0; onionCook(Math.max(0, D.onion)); R.stirT = -1;
    R.heat = D.heat; orderHide(); R.order.visible = st === 'sizzle26';
    R.sqT[0] = R.sqT[1] = -1; for (const g of R.bottles) g.rotation.set(0, 0, 0);
    R.tin.userData.isOpen = D.tin; R.tinTo = D.tin ? -1.75 : 0; R.lid.rotation.x = R.tinTo;
    for (let L = 0; L < 3; L++) { PAD.to[L * 2] = PAD.to[L * 2 + 1] = 0; const cc = R.gateCol[L], src = LANE_COL[L]; for (let k = 0; k < 4; k++) cc[k] = src[k]; }
    for (let i = 0; i < 6; i++) PAD.a[i] = 0; PAD.on = true;
    if (R.gates.userData.mode !== 'idle') { paintReader(T.glow.image.getContext('2d'), 'idle'); T.glow.needsUpdate = true; R.gates.userData.mode = 'idle'; }
    R.train.userData.glow(true);
    R.storm = R.stormTo = D.storm; R.stormRate = 99; R.flick = false;
    R.windOver = null;
    queueReset(D.cust, D.live);
    if (D.drift) for (let i = 0; i < Q.length; i++) { const c = CUST[Q[i]]; c.pt = 0; }
    if (D.drift) { QS.target = 0; const k = Q.slice(); for (const i of k) QUEUE.leave(i); for (const i of k) { const c = CUST[i]; c.food.visible = true; c.sp = 0.9 + 0.2 * i; } }
    if (o.build) { R.pendingEnv = D.env !== 'arvo26' && !o.keepEnv ? D.env : null; return; }
    if (!o.keepEnv && typeof world !== 'undefined' && world.env) world.env(D.env, 0, 'sandgate');
    if (isCur()) applyAmbience();
  }

  // ---------------------------------------------------------- env-driven: the lamp (spot), sun, wind, haze tint
  const ENVX = {
    arvo26:  { wind: 0.2, sun: [-0.62, 0.70, 0.35], sunA: 1, spot: 0, band: 0xd6d0bc },
    gust26:  { wind: 1.0, sun: [-0.70, 0.55, 0.45], sunA: 0.55, spot: 0, band: 0xa8b0a4 },
    gates27: { wind: 0.8, sun: [-0.70, 0.55, 0.45], sunA: 0, spot: 1, band: 0x98a29a },
  };
  const SPOTS = [{ p: [-6.0, 2.7, -2.0], t: [-6.0, 0.8, -1.8], angle: 0.9, pen: 0.7, dist: 5 }, { p: [0.9, 3.3, -11.8], t: [0.9, 1.0, -13.0], angle: 0.45, pen: 0.6, dist: 5 }];
  const BANDC = new THREE.Color(0xd6d0bc), SUNV = new THREE.Vector3(-0.62, 0.70, 0.35);
  function findSpot() {
    R.spot = null; const sc = R.root && R.root.parent; if (!sc) return;
    for (let i = 0; i < sc.children.length; i++) if (sc.children[i].isSpotLight) { R.spot = sc.children[i]; break; }
  }
  function placeSpot() {
    const s = R.spot; if (!s) return;
    const X = ENVX[R.env] || ENVX.arvo26, S = SPOTS[X.spot];
    s.position.set(S.p[0], S.p[1], S.p[2]); s.target.position.set(S.t[0], S.t[1], S.t[2]);
    s.angle = S.angle; s.penumbra = S.pen; s.distance = S.dist;
  }

  // ---------------------------------------------------------- ambient life (no allocation)
  const smooth = (u) => u * u * (3 - 2 * u);
  R.sqT = [-1, -1]; R.storm = 0.35; R.stormTo = 0.35; R.stormRate = 99; R.wind = 0.2; R.heat = 0.6; R.puffT = 0; R.giveT = -1; R.stirT = -1;
  R.tinTo = 0; R.flick = false; R.flickT = 0; R.flash = 0; R.gustT = 3; R.busT = 30; R.murT = 9; R.lastT = -1; R.onionU = 0.45; R.carChirp = 0; R.autoAt = -1; R.autoTo = 'luke26';
  function update(dt, ctx) {
    if (!R.root || !R.snags) return;
    const t = ctx.t, cur = isCur();
    if (cur && typeof world !== 'undefined' && world.torchAuto) { world.torchAuto = false; R.torchTaken = true; }
    // a new scene while this set is on screen: re-dress once the flow's 0.5 s fade to black is done (or at once if this
    // set was off screen and is shown again), so nothing pops during the fade; an explicit dress() wins
    const reshown = R.lastT >= 0 && t - R.lastT > 0.5;
    if (typeof state !== 'undefined' && state && state.scene !== R.scene) { R.scene = state.scene; R.autoTo = AUTO[R.scene] || 'luke26'; R.autoAt = t + 0.45; }
    if (R.autoAt >= 0 && (t >= R.autoAt || reshown)) { R.autoAt = -1; dress(R.autoTo); }
    if (R.pendingEnv) { const p = R.pendingEnv; R.pendingEnv = null; if (typeof world !== 'undefined' && world.env) world.env(p, 0, 'sandgate'); }
    if (!R.spot || R.spot.parent !== R.root.parent) findSpot();
    if (ctx.env !== R.env) {
      R.env = ctx.env; const X = ENVX[R.env] || ENVX.arvo26;
      R.sunTo = X; BANDC.set(X.band);
    }
    if (cur && (R.amb !== R.state || R.ambEnv !== R.env || reshown)) applyAmbience();
    R.lastT = t;
    if (cur) placeSpot();
    const X = ENVX[R.env] || ENVX.arvo26;
    // wind eases to the env's level (or an override), the storm to its build
    const wTo = R.windOver != null ? R.windOver : X.wind;
    R.wind += (wTo - R.wind) * Math.min(1, dt * 0.35);
    const w = R.wind;
    if (R.storm !== R.stormTo) { const d = R.stormTo - R.storm, st = R.stormRate * dt; R.storm = Math.abs(d) <= st ? R.stormTo : R.storm + Math.sign(d) * st; }
    // far: storm cards, clouds drift, sun, haze tint
    const su = R.storm, sg = R.stormG;
    sg.visible = su > 0.02; sg.scale.set(0.8 + 0.35 * su, 0.35 + 0.95 * su, 1);
    SKYM.storm.opacity = Math.min(1, 0.35 + 1.2 * su);
    if (R.flick) {
      R.flickT -= dt;
      if (R.flickT <= 0) { R.flash = 1; R.flickT = 3 + Math.random() * 5; }
      if (R.flash > 0) R.flash = Math.max(0, R.flash - dt * (typeof options !== 'undefined' && options.reduceFlashing ? 1.2 : 6));
      const k = typeof options !== 'undefined' && options.reduceFlashing ? 0.25 * Math.sin(R.flash * PI) : (R.flash > 0.55 || (R.flash > 0.1 && R.flash < 0.3) ? 0.9 : 0);
      SKYM.storm.color.setScalar(1 + k);
    } else if (SKYM.storm.color.r !== 1) SKYM.storm.color.setScalar(1);
    R.clouds.position.x = ((t * (1.2 + 5 * w)) % 300) - 150;
    if (R.sunTo) {
      const S = R.sunTo; SUNV.x += (S.sun[0] - SUNV.x) * Math.min(1, dt); SUNV.y += (S.sun[1] - SUNV.y) * Math.min(1, dt); SUNV.z += (S.sun[2] - SUNV.z) * Math.min(1, dt);
      SKYM.sun.opacity += (S.sunA - SKYM.sun.opacity) * Math.min(1, dt); SKYM.halo.opacity = 0.3 * SKYM.sun.opacity;
      R.sun.visible = SKYM.sun.opacity > 0.02;
      R.sun.position.set(SUNV.x * 400, SUNV.y * 400, SUNV.z * 400); R.sun.lookAt(0, 0, 0);
      SKYM.band.color.lerp(BANDC, Math.min(1, dt));
    }
    // hotplate: heat glow, shimmer, smoke/steam puffs
    M.plate.emissiveIntensity = R.heat * 0.45;
    M.heat.opacity = R.heat * 0.55; R.heatQ.visible = R.heat > 0.05;
    T.heat.offset.y = -t * 0.6; T.heat.offset.x = Math.sin(t * 1.7) * 0.05;
    if (R.heat > 0.05 && (R.puffT -= dt) <= 0) {
      R.puffT = 0.75 - 0.6 * R.heat;
      const k = (Math.random() * 4) | 0; if (k < 3 || R.onions.visible) puff(PUFF_AT[k], PUFF_SMOKE);
    }
    // snag rolls (matrices only while turning)
    for (let i = 0; i < 6; i++) {
      if (SNAGS.t[i] < 0) continue;
      SNAGS.t[i] += dt / 0.25;
      const u = Math.min(1, SNAGS.t[i]);
      if (u >= 0.5 && !SNAGS.swapped[i]) { SNAGS.swapped[i] = 1; const a = SNAGS.up[i]; SNAGS.up[i] = SNAGS.dn[i]; SNAGS.dn[i] = a; R.snags.setColorAt(i, snagColor(SNAGS.up[i], tc2)); R.snags.instanceColor.needsUpdate = true; }
      if (u >= 1) { SNAGS.t[i] = -1; snagMatrix(i, 0, 0); } else snagMatrix(i, PI * smooth(u), 0.035 * Math.sin(PI * u));
    }
    // onions: the stir wobble
    if (R.stirT >= 0) {
      R.stirT += dt / 0.3; const u = Math.min(1, R.stirT), k = Math.sin(u * PI * 3) * (1 - u);
      R.onions.rotation.y = 0.35 * k; R.onions.scale.set(1 + 0.12 * k, 1 + 0.4 * Math.abs(k), 1 - 0.1 * k);
      if (u >= 1) { R.stirT = -1; R.onions.rotation.y = 0; R.onions.scale.set(1, 1, 1); }
    }
    // the order slides across to the customer and is gone
    if (R.giveT >= 0) {
      R.giveT += dt / 0.35; const u = Math.min(1, R.giveT);
      R.order.position.z = -0.75 + 0.3 * smooth(u);
      if (u >= 1) orderHide();
    }
    for (let k = 0; k < 2; k++) if (R.sqT[k] >= 0) {
      R.sqT[k] += dt / 0.4; const u = Math.min(1, R.sqT[k]), g = R.bottles[k];
      g.rotation.z = 1.9 * Math.sin(PI * u); g.position.y = 0.76 + 0.12 * Math.sin(PI * u);
      if (u >= 1) { R.sqT[k] = -1; g.rotation.z = 0; g.position.y = 0.76; }
    }
    R.lid.rotation.x += (R.tinTo - R.lid.rotation.x) * Math.min(1, dt * 7);
    // queue
    for (let i = 0; i < CUST.length; i++) custTick(CUST[i], dt, t);
    // gazebo valances, tinsel tails, bunting, sign rock, fig sway, leaf puffs
    const amp = 0.05 + 0.2 * w;
    R.valF.rotation.x = -amp * (0.55 + 0.45 * Math.sin(t * (2.2 + w * 2.5))) - 0.02 * Math.sin(t * 7.1) * w;
    R.valB.rotation.x = amp * (0.5 + 0.5 * Math.sin(t * (2.0 + w * 2.2) + 1.3)) + 0.02 * Math.sin(t * 6.3) * w;
    for (let i = 0; i < 2; i++) { const tl = R.tinsel[i]; tl.rotation.x = (0.1 + 0.5 * w) * Math.sin(t * 1.9 + i * 2); tl.rotation.z = (0.05 + 0.3 * w) * Math.sin(t * 2.6 + i); }
    for (let i = 0; i < 24; i++) {
      ev.set((0.08 + 0.45 * w) * Math.sin(t * (2.0 + 0.35 * (i % 3) + w * 2) + i * 0.9) - 0.25 * w, 0, 0.05 * Math.sin(t * 1.3 + i));
      qv.setFromEuler(ev); pv.set(BUNT[i * 3], BUNT[i * 3 + 1], BUNT[i * 3 + 2]); sv.setScalar(1);
      R.bunting.setMatrixAt(i, m5.compose(pv, qv, sv));
    }
    R.bunting.instanceMatrix.needsUpdate = true;
    R.signRock.rotation.x = 0.03 * Math.max(0, (w - 0.3) / 0.7) * Math.sin(t * 1.7);
    R.fig.rotation.z = 0.01 * (0.3 + w) * Math.sin(t * 0.55); R.fig.rotation.x = 0.006 * (0.3 + w) * Math.sin(t * 0.43 + 1);
    if (w > 0.6 && (R.gustT -= dt) <= 0) { R.gustT = 2.5 + Math.random() * 2; puff(LEAF_AT[(Math.random() * 4) | 0], PUFF_LEAF); }
    // traffic: four hover-cars both ways, wrap at +-60
    for (let i = 0; i < 4; i++) {
      const c = CARS[i], px = c.x; c.x += c.v * c.d * dt;
      if (c.x > 60) c.x -= 120; else if (c.x < -60) c.x += 120;
      if (cur && ((px < 0) !== (c.x < 0)) && Math.abs(c.x) < 5 && (R.carChirp -= 1) <= 0) { R.carChirp = 3; CAR_AT[0] = c.x; CAR_AT[2] = c.z; snd('hover_by', 0.25, 1, CAR_AT); }
      ev.set(0, c.d > 0 ? 0 : PI, 0.012 * Math.sin(t * 3 + i)); qv.setFromEuler(ev); pv.set(c.x, 0.04 * Math.sin(t * 2.3 + i * 1.7), c.z); sv.setScalar(1);
      m5.compose(pv, qv, sv); R.carBody.setMatrixAt(i, m5); R.carGlow.setMatrixAt(i, m5);
    }
    R.carBody.instanceMatrix.needsUpdate = true; R.carGlow.instanceMatrix.needsUpdate = true;
    // fare-gate paddles ease (1.3 rad in 0.4 s), colliders follow in gateOpen
    if (PAD.on) {
      let busy = false;
      for (let i = 0; i < 6; i++) {
        const d = PAD.to[i] - PAD.a[i], st = 3.6 * dt;
        PAD.a[i] = Math.abs(d) <= st ? PAD.to[i] : PAD.a[i] + Math.sign(d) * st; if (PAD.a[i] !== PAD.to[i]) busy = true;
        m5.makeRotationY(PAD.base[i] + PAD.a[i]); m5.setPosition(PAD.hx[i], 0, -13.6); R.paddles.setMatrixAt(i, m5);
      }
      R.paddles.instanceMatrix.needsUpdate = true; PAD.on = busy;
    }
    // rare one-shots: a bus sighs at the shelter, the queue murmurs
    if (cur && (R.busT -= dt) <= 0) { R.busT = 40 + Math.random() * 30; snd('steam', 0.22, 0.7, BUS_AT); }
    if (cur && R.state !== 'gates27' && (R.murT -= dt) <= 0) { R.murT = 12 + Math.random() * 10; if (Q.length) snd('murmur', 0.14, 1.05, MURMUR_AT); }
  }

  // ---------------------------------------------------------- data
  return {
    env: {
      arvo26:  { bg: 0x9ec6dc, fog: [0xdcd6c0, 0.0070], hemi: [0xfff6e6, 0xa08a66, 1.05], dir: [0xffe6c0, 1.55, [-12, 14, 4]], spot: [0xffd8a8, 0.6], rain: 0 },
      gust26:  { bg: 0x7a9298, fog: [0xa8b0a4, 0.0085], hemi: [0xdfe6e0, 0x6e705c, 0.95], dir: [0xf4ecd8, 1.05, [-12, 10, 4]], spot: [0xffd8a8, 0.4], rain: 0 },
      gates27: { bg: 0x6c8288, fog: [0x98a29a, 0.0090], hemi: [0xd8e2e6, 0x60645a, 0.90], dir: [0xe8ece4, 0.85, [-12, 10, 4]], spot: [0xd8ecff, 1.2], rain: 0 },
    },
    build, dress,
    marks: {
      kettle: [-7.30, 0, 0.35, PI], luke_hot: [-7.10, 0, -3.25, 0],
      q_serve: [-5.60, 0, 0.15, PI], q_1: [-5.60, 0, 0.15, PI], q_2: [-5.60, 0, 1.05, PI], q_3: [-5.60, 0, 1.95, PI], q_4: [-5.60, 0, 2.85, PI], q_5: [-5.60, 0, 3.75, PI],
      q_exit: [-9.80, 0, 1.00, -1.9], q_enter: [16.0, 0, 6.0, -H],
      // 2.6_luke
      s26_arrive_chase: [12.0, 0, 5.4, -H], s26_arrive_luka: [13.2, 0, 6.2, -H], s26_arrive_c40: [14.0, 0, 4.9, -H],
      s26_chase_march: [-5.15, 0, 0.55, PI], s26_luka_back: [-2.60, 0, 1.40, -2.4], s26_c40_back: [-3.40, 0, 2.30, -2.6], s26_c40_aside: [-3.10, 0, 1.15, -2.2],
      // the Sausage Sizzle (the mini-game places them)
      sz_luka: [-7.55, 0, -3.25, 0], sz_luke: [-6.65, 0, -3.25, 0], sz_luke_takeover: [-7.30, 0, -3.25, 0], sz_luka_aside: [-8.10, 0, -3.30, 0.3],
      sz_chase: [-5.60, 0, -1.75, 0], sz_c40: [-4.10, 0, -1.60, -0.5], s26_sample_sizzle: [-6.40, 0, -2.05, PI],
      // 2.6_invite and the exit
      s26_luke_invite: [-4.00, 0, -0.10, 0.5], s26_inv_chase: [-3.20, 0, 0.90, -2.6], s26_inv_luka: [-2.20, 0, 0.40, -2.3], s26_inv_c40: [-2.60, 0, 1.70, -2.5],
      s26_go_1: [-0.6, 0, -6.5, PI], s26_go_2: [0.4, 0, -7.0, PI], s26_go_3: [1.2, 0, -6.2, PI], s26_luke_watch: [-7.10, 0, -3.25, 0.9],
      // 2.7_board step 1 (the gate INSERT)
      s27_gate_c40: [0.90, 0, -12.35, PI], s27_gate_chase: [0.40, 0, -11.60, PI], s27_gate_luka: [1.70, 0, -11.40, PI],
    },
    anchors: {
      s26_luke_wide:    { at: [-6.0, 1.3, -1.8], from: [-1.2, 2.2, 6.4], fov: 46 },
      s26_table_two:    { at: [-5.6, 1.45, -1.8], from: [-3.4, 1.6, 2.2], fov: 40 },
      s26_luke_ots:     { at: [-5.15, 1.55, 0.55], from: [-7.0, 1.75, -3.6], fov: 40 },
      s26_sign:         { at: [-2.90, 0.85, 0.30], from: [-2.40, 1.20, 1.70], fov: 34 },
      s26_tin:          { at: [-4.65, 0.82, -0.80], from: [-4.30, 1.30, 0.10], fov: 30 },
      sz_hot:           { at: [-7.20, 1.05, -3.00], from: [-7.15, 2.05, -1.50], fov: 50 },   // spec lens (-6.90, 2.25, -4.55) sat behind both cooks' backs
      sz_front:         { at: [-5.90, 1.00, 1.00], from: [-6.40, 2.00, -2.60], fov: 52 },
      s26_snags_insert: { at: [-7.38, 0.95, -2.72], from: [-7.38, 1.55, -2.05], fov: 30 },
      s26_onions:       { at: [-6.40, 0.95, -2.72], from: [-6.40, 1.40, -2.10], fov: 30 },
      s26_apron:        { at: [-4.00, 1.15, -0.05], from: [-3.10, 1.45, 0.90], fov: 30 },
      s26_exit_wide:    { at: [-3.4, 1.4, -8.0], from: [-1.2, 1.7, 3.8], fov: 50 },
      s27_gate_tap:     { at: [0.90, 1.05, -13.00], from: [0.55, 1.42, -12.45], fov: 26 },
      s27_hall_wide:    { at: [0.6, 1.3, -14.0], from: [3.8, 2.4, -10.6], fov: 46 },
      credits_sizzle:   { at: [-6.0, 1.2, -1.8], from: [-0.5, 2.6, 5.8], fov: 44 },
    },
    cams: {
      plaza_w:  { type: 'pan', pos: [2.5, 4.6, 8.8], base: [-6.0, 1.0, -2.0], look: 'player', fov: 50, limit: 0.50 },
      plaza_e:  { type: 'pan', pos: [-12.0, 4.4, 8.0], base: [6.0, 1.0, -1.0], look: 'player', fov: 50, limit: 0.50 },
      corner:   { type: 'pan', pos: [15.4, 3.6, -5.0], base: [10.5, 1.0, 6.5], look: 'player', fov: 50, limit: 0.55 },   // added: the fig / arrivals corner was 25 m from plaza_e
      entrance: { type: 'pan', pos: [0.6, 3.3, -3.6], base: [-0.2, 1.0, -12.0], look: 'player', fov: 52, limit: 0.55 },   // spec pos had the (4, -6) column dead centre
      hall:     { type: 'fixed', pos: [-5.4, 3.3, -10.6], look: [1.4, 0.9, -15.2], fov: 54 },
      sz_hot:   { type: 'fixed', pos: [-7.15, 2.05, -1.50], look: [-7.20, 1.05, -3.00], fov: 50 },   // the plate large in the lower frame, Luka (Santa) and Luke behind it
      sz_front: { type: 'fixed', pos: [-6.40, 2.00, -2.60], look: [-5.90, 1.00, 1.00], fov: 52 },
    },
    zones: [
      { box: [-6.0, -16.0, 6.0, -10.0], cam: 'hall' },
      { box: [-6.0, -10.0, 6.0, -5.6], cam: 'entrance' },
      { box: [-16.0, -10.0, -1.5, 9.6], cam: 'plaza_w' },
      { box: [6.0, -1.0, 16.0, 9.6], cam: 'corner' },      // added (see cams.corner)
      { box: [-1.5, -10.0, 16.0, 9.6], cam: 'plaza_e' },
      { box: [-40.0, 9.6, 40.0, 30.0], cam: 'plaza_w' },
    ],
    colliders: COL,
    props: [
      'hotplate', 'snags', 'onions', 'tongs_spare', 'order_build', 'sauces', 'sauce_tomato', 'sauce_bbq', 'cash_tin', 'cash_tin_lid', 'urn',
      'sizzle_table', 'sizzle_sign', 'gazebo', 'valance_front', 'valance_back', 'bunting', 'customers', 'fare_gates', 'gate_paddles',
      'gate_readers', 'train_standing', 'train_glow', 'train_dark', 'traffic', 'fig', 'far', 'sun', 'backdrop',
    ],
    get ambience() { return AMB[AMB_OF[R.state] || 'day']; },
    update,
    // ---- for 47-mg-sizzle.js and the 2.6/2.7 content
    sizzle: {
      snag: snagSet, turn: snagTurn, reset: snagReset, state: (i) => SNAGS.up[i],
      onions: onionCook, stir: onionStir,
      build: orderShow, give: orderGive, squeeze: sauceSqueeze, tin: tinOpen,
      heat: hotSizzle,
    },
    queue: QUEUE,
    paths: {
      cust_out: [[-5.6, 0.15], [-9.8, 1.0], [-15.0, 6.5], [-21.0, 8.6]],
      cust_in: [[22.0, 8.6], [16.0, 6.0], [2.0, 6.5], [-5.6, 4.65], [-5.6, 3.75]],
      arrive: [[14.0, 5.4], [4.0, 3.0], [-4.6, 0.8]],
      to_portal: [[-2.4, 0.8], [-0.6, -4.0], [0.0, -9.6], [0.4, -11.6]],
    },
    storm: STORM,
    wind(level) { R.windOver = level == null ? null : Math.max(0, Math.min(1, +level)); },
    hotspots: {
      h26_tongs: { at: [-5.6, 0, 0.6], r: 1.2 }, h26_sizzle: { at: [-6.40, 0, -2.05], r: 0.8 }, h26_urn: { at: [-7.30, 0, 0.35], r: 0.9 },
      h26_sign: { at: [-2.90, 0, 1.00], r: 1.0 }, h26_portal: { box: [-3.0, -11.0, 3.0, -9.6] },
    },
    ar: [   // AR labels for Chip View (systems): everything printed in 2040 is blank without the chip
      { id: 'sg_name', at: [0, 3.82, -9.9], text: 'SANDGATE STATION', kind: 'sign' },
      { id: 'sg_gates', at: [0, 2.75, -12.1], text: 'PLATFORM 1 · SHORNCLIFFE LINE · CITY 16:31', kind: 'sign' },
      { id: 'sg_bus', at: [10.05, 1.3, 8.65], text: 'BUS 315 · 4 MIN', kind: 'sign' },
      { id: 'sg_pub', at: [-17, 4.7, 18.9], text: 'THE SEABREEZE', kind: 'sign' },
      { id: 'sg_bakery', at: [-7, 4.7, 18.9], text: 'BAKERY · FRESH TODAY', kind: 'ad' },
    ],
  };
})();
