// ============================================================ SET: hq_roof — the roof of Optus Tower, Fortitude Valley (2040)
// Scenes 3.2 (the roof cutscene "3.2_roof", storm), 3.7 "Storage Full" (golden hour, the ring of 400 yellow drones, the
// Choice), A1 "Keep" / B1 "Again" (the goodbyes, the call, the split screen's left half, A1's long "after") and the
// credits vignette. Spec: docs/sets/hq_roof.md (every name and coordinate there is what content codes against).
//
// LAYOUT (metres, Y up, +X east, +Z south; ry 0 faces +Z = south (the parapet, the city), PI faces -Z = north (the Yes
// sign), H faces +X (east), -H faces -X (west)). Local = Valley Grid - (0, 131.0, 0): the deck is y = 0, x/z are VG.
// Looking south, screen-right is -X (west: the CBD and the low sun), screen-left is +X (east: the Story Bridge).
//   Deck x -17.55..17.55, z -35.0..-11.45 (walkable; plus the strips x ±14..±17.55, z -40.55..-35 beside the crown).
//   South parapet (the stage): concrete z -11.45..-11.02, cap top y 1.2 (the tower's smoked parapet glass is its outer
//   skin at z -11.0); W/E parapets x ∓17.55..∓17.98. The crown's plant box x -14..14, z -41..-35, y 0..3 and the Yes
//   sign (letters x -12..12, y 3.2..11.2 on z -35.95, facing south) come from SETS.valley.tower({ podium: 'none' }); the
//   city from SETS.valley.skyline({ skip: ['TOWER'] }); both added at (0, -131, 0). The tower's roof slab and parapet
//   lips are trimmed out of this copy (the deck/parapets here replace them; the hatch shaft shows black, not a slab).
//   Lift headhouse x 12.0..15.4, z -22.4..-19.0, h 3.2; doors in its west face (x 12.0, z -21.5..-19.9), plate MANAGER
//   ONLY (y 2.55), reader (11.98, 1.2, -19.35); the private car x 12.4..15.0, z -22.0..-19.4 (black mirror, warm strip,
//   ROOF button). Maintenance hatch: curb x 7.4..8.6, z -13.5..-12.3 (0.3 high), opening 0.9 × 0.9 at (8.0, -12.9), lid
//   hinged on the south edge; below a black shaft 1.4 deep with 4 rungs (plane z -13.32). Santa photo set (SE): the
//   cardboard sleigh x 9.4..12.6, z -13.1..-11.7 facing north; ring light (11.0, -16.4); queue rope z -15.2 (posts x 9.0,
//   10.5, 12.0, 13.5); A-frame (13.9, -16.4); presents P1 (13.6, -12.4) / P2 (13.5, -13.3). The ring (golden+): 400
//   drones, rows r 4.0/4.45/4.9/5.35/5.8 (65/73/80/87/95) round (0, -19.0), a 1.4 m gap facing the parapet; inside, P1 as
//   the table with the Remote wired to the brick phone and 8 cables to the inner row.
//
// ENV: storm_roof (default) · golden · afterglow · whiteout · credits_dusk.
// DRESS: dress('storm32' | 'golden37' | 'a1_after' | 'credits'); AUTO: 3.2 storm32, 3.7/A1/B1 golden37, C credits, applied
//   by the first of the set's first tick in a scene or content's first dress / lamp / prop call in it (so a step-0 call is
//   never clobbered a tick later; flow:stop forgets the scene, so Continue gets the start state back). With no scene (as in
//   ?setview) the env picks the dress. Content calls dress('a1_after') at A1 step 27.
// LAMP: lamp('sleigh' | 'ring' | 'parapet' | 'sitters' | 'off') parks the one spot (re-asserted every tick while lit,
//   except while a JARVIS shot borrows it); dress picks storm32 sleigh · golden37 ring · a1_after sitters · credits ring.
// MARKS: s32r_car_luka/_chase/_c40 s32r_doorway s32r_out_luka/_chase/_c40 s32r_hatch_luka s32r_drop s32r_chase s32r_c40
//   s32r_hatch_in · s37_chase_remote s37_luka_sit s37_l40_kneel s37_l40_edge s37_c40_edge s37_l40_sit s37_st_chase/_luka/
//   _l40/_c40 s37_f_chase/_luka/_l40/_c40 · a1_luka a1_l40 a1_chase a1_c40 a1_dial a1_sit_l40 a1_sit_c40 a1_earbuds
//   b1_luka_lanyard. (s32r_doorway is extra: walk the car's back two through it; straight lines to s32r_out_chase/_c40
//   clip the door jambs.)
// ANCHORS: s32r_lift_open s32r_crane_a s32r_crane_b s32r_feet facade_countdown roof_hatch s32r_drop_shot sleigh yes_sign ·
//   s37_crane_a s37_crane_b s37_remote_mid s37_bandage s37_sorry_two s37_c40_close s37_staying_two s37_check
//   remote_screen s37_fears_wide s37_hands s37_roof_wide_low · a1_split_roof a1_parapet_wide a1_hands_slate a1_behind
//   a1_earbuds · credits_ring_a credits_ring_b a2_print.
// CAMS: roof_wide (default; = s37_roof_wide_low) · roof_car (inside the private car). ZONES: the car, then the deck.
// PROPS (world.prop(name).userData; every call is instant while skipping and allocates nothing per frame):
//   lift_doors open(u) · maint_hatch open(u), dark · sleigh state('intact'|'collapsed'), drop(), wind(k) · santa_hat ·
//   santa_beard · ring_light on(b), state('up'|'fallen'), wobble(k) · presents moveTo('table'|'sleigh') · photo_set
//   (aframe child) · ring level(k, dur), flicker(on), pulse(k), flare(k, dur), settle() (+ .visible) · remote_rig
//   screen('off'|'check'|'call'|'white'), trill(on) · whiteout pour(dur = 2), reset() · earbuds (.visible) ·
//   countdown_glow color(hex), level(k) · sun y(dy) (+ .visible) · puddles · steam level(k) · vents · anchors_ring ·
//   flyer · storm_clouds · ring_pools (child of ring) · garland (child of sleigh) · tower (valley.md §12.4) · skyline (§12.5).
// AMBIENCE (getter, per dress): storm32 wind_high + drone_swarm + thunder_far + city_far_quiet + lift_hum · golden37
//   wind_soft + valley_music_far + drone_ring + drip · a1_after valley_music_far + wind_soft + drone_ring · credits none.
// Draw calls: one Builder for the static roof (vc + st + deck + atlas + glow), props a few each, every repeat instanced
//   (ring 2 + its light pools 1, puddles, steam, vents, eyes, tinsel), tower() + skyline() ≈ 25: max 61 from any
//   cam/anchor in any env empty (setshots), 87 with four actors, 136 in the A1 split with reddy26; ~40k tris storm /
//   ~170k golden (the skyline's lit city).
// DEVIATIONS from the spec (for the picture): env storm_roof/golden brighter (three's physical lights made the spec's
//   values murky), lamp intensities × LAMP_GAIN; the storm's black-green comes from our own dome repaint + a ring of low
//   dark cloud cards (storm_clouds, they flash with the lightning) since skyline() has no green storm sky; golden /
//   afterglow tint our dome copy gold -> peach / pink (skyline's 'golden' keeps a blue zenith); a mood emissive on the
//   structures (the parapet's inner face is in its own shade); the ring's candle look adds a light pool on the deck under
//   every drone (ring_pools); the tower's slab + parapet lips are trimmed out of our tower copy; countdown_glow is one quad
//   y -15..4.5 (no haze quad: it reads ~0.5 over the cap) and hides while the camera is outside the parapet (from out
//   there the band itself is the glow); whiteout pours to r 16 (the split lens is 13.7 m out) with no depth test (from
//   inside, its far wall is behind the deck); P1 is red paper with a green ribbon (as the Choice's painted present); the
//   sleigh's front board is low (top 0.7) so the dropped hat/beard read on the seat (hat (10.45, 0.62, -12.6), beard
//   (9.95, 0.645, -12.35)); the brick phone is art's PROPS.brick_phone (no t_brick); re-aimed anchors: s32r_crane_a (the
//   letters are now y 3.2..11.2), s32r_feet, roof_hatch, s32r_drop_shot, sleigh, s37_bandage (both heads in, Luka 3/4
//   front), s37_sorry_two (3/4 front from beyond the parapet: side-on profiles 0.8 m apart hide each other),
//   s37_staying_two (lens 1.4 m further north so the outer row glows along the bottom), s37_check (over kneeling Chase's
//   right shoulder: the spec's lens stood on s37_st_l40 and saw only his back; use it before the four gather),
//   remote_screen (lens 0.25 m further back so standing faces fit the JARVIS fov), a1_hands_slate (from in front and
//   above: from behind, his back hides his lap), a1_behind (high enough to see the city).
SETS.hq_roof = (() => {
  const PI = Math.PI, H = PI / 2, TAU = PI * 2, DS = THREE.DoubleSide, ADD = THREE.AdditiveBlending;
  const YES = 0xffd21f, FLARE = 0xfff4c0;
  // ---------------------------------------------------------- palette (spec §3.1; structures are neutral, M.st tints them per mood)
  const CONC = 0x8a8c8a, CAP = 0x9a9c9a, PANEL = 0xb4b8ba, SEAM = 0x8a8e92, STEEL = 0x9aa0a6, STEELD = 0x4a5058,
    RED = 0xc8323a, GOLD = 0xc8a040, TINSEL = 0xc8ccd4, CREAM = 0xefe6d0, BLACK = 0x050607, CARD = 0x9a7a52;
  const COL = [];                                         // colliders (filled by build; dynamic boxes mutated in place)
  const R = {                                             // live refs + state (survives rebuilds)
    state: 'storm32', scene: null, env: null, lamp: 'sleigh', lampUser: false, lampOff: false,
    doorU: 0, doorTo: 0, hatchU: 0, hatchTo: 0, clunked: true, sleigh: 'intact', dropped: false, rl: 'up', rlOn: true, rlWob: 1,
    p1: 'sleigh', aframe: 'up', lv: 1, lvTo: 1, lvRate: 0, flicker: true, pulse: 0, flare: 0, flareTo: 0, flareRate: 0,
    screen: 'off', trill: false, trillT: 0, whiteT: -1, whiteDur: 2, whiteR: 0, glowHex: 0xbfe6ff, glowK: 1, sunDy: 0,
    steamK: 0, cflash: -1, cflashDur: 0.14, wind: 1, windMul: 1, flashT: 12, gustT: 9, fly: 0, ambKey: '', lastT: -1, rr: 0,
  };
  const tc = new THREE.Color(), tc2 = new THREE.Color(), m4 = new THREE.Matrix4(), m5 = new THREE.Matrix4();
  const qv = new THREE.Quaternion(), ev = new THREE.Euler(0, 0, 0, 'YXZ'), pv = new THREE.Vector3(), sv = new THREE.Vector3();
  const ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
  let b = null, GL = null, XF = null, T = null, M = null;
  const skipping = () => typeof flow !== 'undefined' && !!flow && !!flow.skipping;
  const reduceFx = () => typeof options !== 'undefined' && !!options && !!options.reduceFlashing;
  const smooth = (u) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
  const clamp01 = (u) => (u < 0 ? 0 : u > 1 ? 1 : u);
  const isCur = () => typeof world !== 'undefined' && world.setId === 'hq_roof';
  const SETVIEW = () => typeof TEST !== 'undefined' && TEST && TEST.setview === 'hq_roof';
  let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  // ---------------------------------------------------------- geometry helpers (into the current Builder `b`)
  // put(): colour every vertex hex; M.glow geometry goes to the unlit list GL (merged without baked light).
  function put(g, hex, m) {
    if (XF) g.applyMatrix4(XF);
    tc.set(hex);
    const n = g.attributes.position.count, a = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { a[i * 3] = tc.r; a[i * 3 + 1] = tc.g; a[i * 3 + 2] = tc.b; }
    g.setAttribute('color', new THREE.BufferAttribute(a, 3));
    if (m && m === M.glow) GL.push(g); else b.add(g, m || M.vc);
  }
  function box(w, h, d, hex, x, y, z, ry = 0, m) { const g = new THREE.BoxGeometry(w, h, d); if (ry) g.rotateY(ry); g.translate(x, y + h / 2, z); put(g, hex, m); }
  function bb(x0, y0, z0, x1, y1, z1, hex, m) {   // min/max corners (either order)
    const ax = Math.min(x0, x1), ay = Math.min(y0, y1), az = Math.min(z0, z1), bx = Math.max(x0, x1), by = Math.max(y0, y1), bz = Math.max(z0, z1);
    box(bx - ax, by - ay, bz - az, hex, (ax + bx) / 2, ay, (az + bz) / 2, 0, m);
  }
  function boxR(w, h, d, hex, x, y, z, rx = 0, ry = 0, rz = 0, m) {   // centred; rotation X, then Z, then Y
    const g = new THREE.BoxGeometry(w, h, d); g.rotateX(rx); g.rotateZ(rz); g.rotateY(ry); g.translate(x, y, z); put(g, hex, m);
  }
  function cyl(rt, rb, h, seg, hex, x, y, z, rx = 0, rz = 0, m, ry = 0) {   // centred
    const g = new THREE.CylinderGeometry(rt, rb, h, seg); if (rx) g.rotateX(rx); if (rz) g.rotateZ(rz); if (ry) g.rotateY(ry); g.translate(x, y, z); put(g, hex, m);
  }
  function torus(R0, r, rs, ts, hex, x, y, z, rx = 0, ry = 0, m, arc = TAU) {
    const g = new THREE.TorusGeometry(R0, r, rs, ts, arc); if (rx) g.rotateX(rx); if (ry) g.rotateY(ry); g.translate(x, y, z); put(g, hex, m);
  }
  function sph(r, hex, x, y, z, sx = 1, sy = 1, sz = 1, m, ws = 8, hs = 6) { const g = new THREE.SphereGeometry(r, ws, hs); g.scale(sx, sy, sz); g.translate(x, y, z); put(g, hex, m); }
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
  // a floor rect with world-space UVs (the texture repeats every `tile` metres)
  function floorRect(x0, z0, x1, z1, y, m, tile, hex = 0xffffff) {
    const w = x1 - x0, d = z1 - z0, g = new THREE.PlaneGeometry(w, d), uv = g.attributes.uv, p = g.attributes.position;
    for (let i = 0; i < 4; i++) uv.setXY(i, (x0 + (p.getX(i) + w / 2)) / tile, (-(z0 + d / 2) + p.getY(i)) / tile);
    g.rotateX(-H); g.translate((x0 + x1) / 2, y, (z0 + z1) / 2); put(g, hex, m);
  }
  // a square-section bar of w × h between two points
  function beam(x0, y0, z0, x1, y1, z1, w, h, hex, m) {
    const dx = x1 - x0, dy = y1 - y0, dz = z1 - z0, L = Math.hypot(dx, dy, dz) || 1e-3, hz = Math.hypot(dx, dz);
    const g = new THREE.BoxGeometry(w, h, L); g.rotateX(-Math.atan2(dy, hz)); g.rotateY(Math.atan2(dx, dz)); g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); put(g, hex, m);
  }
  const atlas = (rc, w, h, x, y, z, ry = 0, rx = 0, hex = 0xffffff) => rquad(w, h, M.atlas, rc, x, y, z, ry, rx, hex);
  const row = (r) => [1, r * 32 + 1, 255, r * 32 + 31];
  // merge the unlit list into one MeshBasic (vertex colours) mesh: lamps, strips, LEDs, the black hatch lining
  function glowMesh(list) {
    const parts = list.map((g0) => {
      const g = g0.index ? g0.toNonIndexed() : g0;
      for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'color') g.deleteAttribute(k);
      g.morphAttributes = {}; return g;
    });
    const merged = mergeGeometries(parts);
    for (const g of list) g.dispose(); for (const g of parts) g.dispose();
    const me = new THREE.Mesh(merged, M.glow); me.name = 'glow'; return me;
  }
  // a separate Builder (+ glow list) -> named Group (a prop). Coordinates inside fn are local.
  function part(name, fn, pos, ry = 0, o) {
    const pb = b, pg = GL, px = XF; b = new Builder(); GL = []; XF = null;
    fn();
    const g = b.done({ floor: false, ...o });
    if (GL.length) g.add(glowMesh(GL));
    b = pb; GL = pg; XF = px;
    if (name) g.name = name;
    if (pos) g.position.set(pos[0], pos[1], pos[2]);
    g.rotation.y = ry;
    return g;
  }
  const at = (x, z, ry = 0, y = 0) => (XF = m4.makeRotationY(ry).setPosition(x, y, z));
  const geoOf = (fn, o) => part('', fn, null, 0, { floor: false, ...o }).children[0].geometry;   // a one-material part's geometry (baked)
  function wall(x0, z0, x1, z1, h, hex, m) { bb(x0, 0, z0, x1, h, z1, hex, m); COL.push([x0, z0, x1, z1]); }

  // ---------------------------------------------------------- painted textures (32–256 px; nearest where text must read)
  const FONT = (px, w = 'bold') => `${w} ${px}px Arial, "Liberation Sans", "DejaVu Sans", sans-serif`;
  function text(c, s, x, y, px, col, al = 'center', w = 'bold', maxW) {
    c.font = FONT(px, w); c.fillStyle = col; c.textAlign = al; c.textBaseline = 'middle';
    if (maxW) c.fillText(s, x, y, maxW); else c.fillText(s, x, y);
  }
  function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  // the sleigh's side profile (local z: -0.7 back .. +0.78 front; y up), shared by the canvas art and the ShapeGeometry
  const SIDE = [[-0.70, 0.16], [-0.70, 1.42], [-0.63, 1.52], [-0.52, 1.52], [-0.45, 1.42], [-0.43, 0.66], [0.28, 0.66], [0.38, 0.72],
    [0.48, 0.88], [0.58, 1.02], [0.68, 1.10], [0.77, 1.06], [0.78, 0.96], [0.70, 0.90], [0.64, 0.74], [0.58, 0.46], [0.48, 0.16]];
  const SZ0 = -0.70, SZ1 = 0.78, SY0 = 0.16, SY1 = 1.52;
  function sidePath(c, ox, oy, w, h, sag = 0) {   // the profile mapped into the canvas rect (ox, oy, w, h)
    c.beginPath();
    SIDE.forEach(([z, y], i) => {
      const u = (z - SZ0) / (SZ1 - SZ0), v = (y - SY0) / (SY1 - SY0), px = ox + u * w, py = oy + h - v * h + sag * Math.sin(u * PI) * v * 6;
      i ? c.lineTo(px, py) : c.moveTo(px, py);
    });
    c.closePath();
  }
  function reindeer(c, x, y, s, body, dark) {
    c.fillStyle = body;
    c.beginPath(); c.ellipse(x, y, 13 * s, 7 * s, 0, 0, TAU); c.fill();                         // body
    c.fillRect(x - 10 * s, y + 3 * s, 3 * s, 10 * s); c.fillRect(x + 7 * s, y + 3 * s, 3 * s, 10 * s);   // legs
    c.save(); c.translate(x + 12 * s, y - 7 * s); c.rotate(-0.5); c.fillRect(-2 * s, -6 * s, 5 * s, 10 * s); c.restore();   // neck
    c.beginPath(); c.ellipse(x + 17 * s, y - 13 * s, 6 * s, 4 * s, 0.2, 0, TAU); c.fill();       // head
    c.strokeStyle = dark; c.lineWidth = 1.6 * s; c.beginPath();
    c.moveTo(x + 15 * s, y - 16 * s); c.lineTo(x + 12 * s, y - 24 * s); c.lineTo(x + 8 * s, y - 27 * s); c.moveTo(x + 12 * s, y - 24 * s); c.lineTo(x + 15 * s, y - 28 * s);
    c.moveTo(x + 18 * s, y - 16 * s); c.lineTo(x + 19 * s, y - 25 * s); c.lineTo(x + 23 * s, y - 28 * s); c.stroke();   // antlers
    c.fillStyle = '#e8202a'; c.beginPath(); c.arc(x + 23 * s, y - 13 * s, 2.2 * s, 0, TAU); c.fill();   // the nose
    c.fillStyle = '#1a1210'; c.beginPath(); c.arc(x + 17 * s, y - 14 * s, 1 * s, 0, TAU); c.fill();
  }
  function paintRemote(mode) {   // the Remote's little screen (128 × 96): off · check · call · white
    return (c, w, h) => {
      if (mode === 'white') { c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h); return; }
      c.fillStyle = mode === 'off' ? '#050709' : '#061420'; c.fillRect(0, 0, w, h);
      if (mode === 'off') { c.fillStyle = 'rgba(160,190,210,0.10)'; c.beginPath(); c.moveTo(10, 0); c.lineTo(40, 0); c.lineTo(14, h); c.lineTo(0, h); c.fill(); return; }
      c.fillStyle = 'rgba(143,216,255,0.16)'; c.fillRect(0, 0, w, 4); c.fillRect(0, h - 4, w, 4);
      if (mode === 'check') {
        text(c, 'LINE OPEN', w / 2, 17, 17, '#8fd8ff');
        c.fillStyle = '#8fd8ff'; c.fillRect(14, 31, w - 28, 2);
        // a little drone pod with its yellow eye, then the battery
        c.fillStyle = '#eef2f6'; c.beginPath(); c.ellipse(34, 62, 17, 13, 0, 0, TAU); c.fill();
        c.fillStyle = '#1a2028'; c.fillRect(17, 58, 34, 6); c.fillStyle = '#ffd21f'; c.fillRect(27, 59, 14, 4);
        text(c, '3%', 88, 62, 34, '#ffd21f');
        c.strokeStyle = '#8fd8ff'; c.lineWidth = 2; c.strokeRect(62, 82, 52, 9); c.fillStyle = '#ff6a4a'; c.fillRect(64, 84, 3, 5);
      } else if (mode === 'call') {
        c.fillStyle = '#8fd8ff'; c.save(); c.translate(w / 2, 44); c.rotate(-0.55);
        rr(c, -30, -8, 60, 16, 7); c.fill(); rr(c, -34, -14, 18, 22, 6); c.fill(); rr(c, 16, -14, 18, 22, 6); c.fill(); c.restore();
        c.strokeStyle = 'rgba(143,216,255,0.6)'; c.lineWidth = 2;
        for (const r0 of [38, 46]) { c.beginPath(); c.arc(w / 2, 44, r0, -2.6, -2.0); c.stroke(); c.beginPath(); c.arc(w / 2, 44, r0, -1.1, -0.5); c.stroke(); }
        text(c, 'CALLING…', w / 2, 82, 15, '#8fd8ff');
      }
    };
  }
  function textures() {
    if (T) return T;
    T = {};
    // deck concrete: near-white so M.deck's colour sets the mood (wet charcoal / washed gold)
    T.deck = canvasTex(128, 128, (c, w, h) => {
      seed = 31;
      c.fillStyle = '#c6c6c2'; c.fillRect(0, 0, w, h);
      for (let i = 0; i < 70; i++) { const x = rnd() * w, y = rnd() * h, r = 4 + rnd() * 16; c.fillStyle = `rgba(${rnd() < 0.5 ? '90,92,94' : '235,235,230'},${0.03 + rnd() * 0.05})`; c.beginPath(); c.ellipse(x, y, r, r * (0.5 + rnd() * 0.5), rnd() * PI, 0, TAU); c.fill(); }
      for (let i = 0; i < 6; i++) { const x = rnd() * w, y = rnd() * h; c.fillStyle = 'rgba(60,64,66,0.09)'; c.beginPath(); c.ellipse(x, y, 10 + rnd() * 22, 6 + rnd() * 10, rnd() * PI, 0, TAU); c.fill(); }   // water stains
      for (let i = 0; i < 900; i++) { c.fillStyle = rnd() < 0.5 ? 'rgba(70,72,72,0.25)' : 'rgba(250,250,245,0.25)'; c.fillRect(rnd() * w | 0, rnd() * h | 0, 1, 1); }   // aggregate
      c.strokeStyle = 'rgba(40,42,44,0.55)'; c.lineWidth = 1; c.beginPath(); c.moveTo(12, 96); for (let x = 12; x < 120; x += 9) c.lineTo(x, 96 + Math.sin(x * 0.3) * 4 + (rnd() - 0.5) * 4); c.stroke();   // a hairline crack
      c.strokeStyle = 'rgba(30,32,34,0.30)'; c.lineWidth = 1; c.strokeRect(0.5, 0.5, w - 1, h - 1);   // the slab joint
    }, { key: 'roof_deck', nearest: true, repeat: [1, 1] });
    // the sign atlas (256 × 256): rows 0–3 (8 × 32 px), the A-frame poster [0,128,128,256], the lift's ROOF panel [128,128,256,192]
    T.atlas = canvasTex(256, 256, (c) => {
      const rowBg = (r, bg) => { c.fillStyle = bg; c.fillRect(0, r * 32, 256, 32); };
      rowBg(0, '#15181d'); c.fillStyle = '#3a4048'; c.fillRect(2, 2, 252, 1); text(c, 'MANAGER ONLY', 128, 17, 22, '#eef2f6');
      rowBg(1, '#b02830'); c.fillStyle = '#c8a040'; c.fillRect(0, 32, 256, 2); c.fillRect(0, 62, 256, 2); text(c, 'SANTA PHOTOS · 11:30 · Smile (safely)', 128, 48, 17, '#ffffff', 'center', 'bold', 248);
      rowBg(2, '#1c1d1f'); text(c, 'ROOF HATCH · KEEP CLEAR', 128, 81, 19, '#f2f2ee', 'center', 'bold', 244);
      c.fillStyle = '#f0f0ec'; for (let x = 0; x < 256; x += 16) { c.fillRect(x, 66, 8, 3); c.fillRect(x + 8, 93, 8, 3); }
      rowBg(3, '#f4ecd8'); c.fillStyle = '#c8a040'; c.beginPath(); c.arc(14, 112, 6, 0, TAU); c.fill(); c.fillStyle = '#f4ecd8'; c.beginPath(); c.arc(14, 112, 3, 0, TAU); c.fill();
      text(c, 'To: Everyone · From: HR', 136, 112, 18, '#8a1a22', 'center', 'italic bold', 220);
      // A-frame poster
      c.fillStyle = '#fbf8f0'; c.fillRect(0, 128, 128, 128); c.fillStyle = '#c8323a'; c.fillRect(0, 128, 128, 30);
      text(c, 'SANTA', 64, 138, 15, '#ffffff'); text(c, 'PHOTOS', 64, 152, 13, '#ffffff');
      text(c, '11:30', 64, 184, 30, '#1a2a4a');
      text(c, 'Smile', 64, 212, 18, '#c8323a', 'center', 'italic bold'); text(c, '(safely)', 64, 230, 14, '#c8323a', 'center', 'italic bold');
      c.fillStyle = '#c8323a'; c.beginPath(); c.moveTo(98, 205); c.lineTo(118, 205); c.lineTo(112, 186); c.fill(); c.fillStyle = '#f4f0e6'; c.fillRect(96, 204, 24, 5); c.beginPath(); c.arc(112, 185, 3.5, 0, TAU); c.fill();   // a hat
      c.fillStyle = '#9aa0a6'; c.fillRect(0, 248, 128, 8); text(c, 'OPTUS TOWER · ROOF', 64, 252, 7, '#ffffff');
      // the car's button panel: ROOF
      c.fillStyle = '#20242a'; c.fillRect(128, 128, 128, 64); c.fillStyle = '#3a4048'; c.fillRect(130, 130, 124, 2);
      c.fillStyle = '#ffe6b0'; c.beginPath(); c.arc(166, 160, 17, 0, TAU); c.fill(); c.fillStyle = '#2a2420'; text(c, 'R', 166, 161, 20, '#2a2420');
      text(c, 'ROOF', 220, 160, 20, '#eef2f6');
      c.fillStyle = '#c8ccd2'; c.fillRect(128, 192, 128, 64); text(c, 'PRIVATE', 192, 212, 18, '#1a1e24'); text(c, 'ROOF ACCESS', 192, 236, 14, '#1a1e24');
    }, { key: 'roof_atlas', nearest: true });
    // the cardboard sleigh (256 × 128): [0..256 × 0..48] the front board; [0..128 × 48..128] side, intact; [128..256 × 48..128] side, collapsed
    T.sleigh = canvasTex(256, 128, (c) => {
      c.fillStyle = '#c8323a'; c.fillRect(0, 0, 256, 48);
      c.strokeStyle = '#c8a040'; c.lineWidth = 3; rr(c, 4, 4, 248, 40, 8); c.stroke();
      c.lineWidth = 2; for (const sx of [1, -1]) { const x0 = sx > 0 ? 14 : 242; c.beginPath(); c.arc(x0, 24, 7, 0, PI * 1.6 * sx, sx < 0); c.stroke(); }
      c.font = FONT(25); c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 4; c.strokeStyle = '#7a1a1e'; c.strokeText('SANTA EXPRESS', 128, 19, 200); c.fillStyle = '#ffffff'; c.fillText('SANTA EXPRESS', 128, 19, 200);
      text(c, '· OPTUS ·', 128, 38, 11, '#e8c860');
      for (const [x, y] of [[28, 12], [228, 12], [40, 36], [216, 36]]) { c.fillStyle = '#ffffff'; c.fillRect(x - 1, y - 3, 2, 6); c.fillRect(x - 3, y - 1, 6, 2); }
      // side, intact
      c.fillStyle = '#7a5a3a'; c.fillRect(0, 48, 256, 80);
      sidePath(c, 0, 48, 128, 80); c.fillStyle = '#c8323a'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#c8a040'; c.stroke();
      c.lineWidth = 1.5; c.beginPath(); c.arc(102, 72, 6, 0.3, PI * 1.7); c.stroke(); c.beginPath(); c.arc(16, 70, 4, 0, PI * 1.5); c.stroke();
      reindeer(c, 58, 104, 0.9, '#8a5a32', '#4a2a12');
      // side, collapsed: water-darkened, a torn back corner, stains
      sidePath(c, 128, 48, 128, 80, 1); c.fillStyle = '#8a2a2e'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#8a7438'; c.stroke();
      c.save(); sidePath(c, 128, 48, 128, 80, 1); c.clip();
      for (let i = 0; i < 9; i++) { c.fillStyle = 'rgba(40,10,12,0.22)'; c.beginPath(); c.ellipse(140 + i * 13, 120 - (i % 3) * 8, 12, 22, 0.2, 0, TAU); c.fill(); }
      reindeer(c, 186, 106, 0.9, '#5a3e26', '#2a1a0a');
      c.fillStyle = '#9a7a52'; c.beginPath(); c.moveTo(128, 48); c.lineTo(150, 48); c.lineTo(146, 56); c.lineTo(150, 61); c.lineTo(140, 66); c.lineTo(136, 76); c.lineTo(128, 74); c.closePath(); c.fill();   // torn corner: bare card
      c.restore();
    }, { key: 'roof_sleigh', nearest: true });
    T.remote = canvasTex(128, 96, paintRemote('off'), { key: 'roof_remote', nearest: true });
    T.puddle = canvasTex(64, 64, (c, w, h) => {
      const g = c.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2);
      g.addColorStop(0, 'rgba(255,255,255,0.85)'); g.addColorStop(0.55, 'rgba(255,255,255,0.6)'); g.addColorStop(0.85, 'rgba(255,255,255,0.22)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = g; c.beginPath(); for (let i = 0; i <= 24; i++) { const a = i / 24 * TAU, r = w / 2 * (0.82 + 0.18 * Math.sin(a * 3 + 1) * Math.cos(a * 2)); i ? c.lineTo(w / 2 + Math.cos(a) * r, h / 2 + Math.sin(a) * r) : c.moveTo(w / 2 + Math.cos(a) * r, h / 2 + Math.sin(a) * r); } c.fill();
      c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(w * 0.42, h * 0.46, 9, 7, 0, 0, TAU); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,0.3)'; c.beginPath(); c.ellipse(w * 0.42, h * 0.46, 15, 12, 0, 0, TAU); c.stroke();
    }, { key: 'roof_puddle' });
    T.wisp = canvasTex(32, 64, (c, w, h) => {
      for (let i = 0; i < 14; i++) { const u = i / 13, y = h - 6 - u * (h - 14), x = w / 2 + Math.sin(u * 4.2) * 3, r = 7 + u * 6, g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(255,255,255,${0.16 * (1 - u * 0.6)})`); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); }
    }, { key: 'roof_wisp' });
    T.glow = canvasTex(32, 128, (c, w, h) => {
      const g = c.createLinearGradient(0, h, 0, 0);
      // the quad spans y -15 (the band) .. 4.5; the cap (y 1.2) sits at v 0.83, so the glow still reads ~0.5 over the parapet
      g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.5, 'rgba(255,255,255,0.75)'); g.addColorStop(0.83, 'rgba(255,255,255,0.5)'); g.addColorStop(0.92, 'rgba(255,255,255,0.2)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = g; c.fillRect(0, 0, w, h);
      const s = c.createLinearGradient(0, 0, w, 0); s.addColorStop(0, 'rgba(0,0,0,1)'); s.addColorStop(0.12, 'rgba(0,0,0,0)'); s.addColorStop(0.88, 'rgba(0,0,0,0)'); s.addColorStop(1, 'rgba(0,0,0,1)');
      c.globalCompositeOperation = 'destination-out'; c.fillStyle = s; c.fillRect(0, 0, w, h);
    }, { key: 'roof_glow' });
    T.cloud = canvasTex(128, 64, (c, w, h) => {
      seed = 77;
      for (let i = 0; i < 26; i++) { const x = 30 + rnd() * (w - 60), r = 8 + rnd() * 14, y = Math.max(r + 2, 30 + rnd() * 16 - Math.abs(x - w / 2) * 0.2), g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(255,255,255,0.75)'); g.addColorStop(0.6, 'rgba(235,240,236,0.45)'); g.addColorStop(1, 'rgba(220,226,222,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); }
      const fd = c.createLinearGradient(0, 0, 0, h); fd.addColorStop(0, 'rgba(0,0,0,0)'); fd.addColorStop(0.75, 'rgba(0,0,0,0)'); fd.addColorStop(1, 'rgba(0,0,0,0.6)');
      c.globalCompositeOperation = 'source-atop'; c.fillStyle = fd; c.fillRect(0, 0, w, h);   // a darker underbelly
      const em = c.createRadialGradient(w / 2, h * 0.6, 8, w / 2, h * 0.6, w / 2); em.addColorStop(0, 'rgba(0,0,0,1)'); em.addColorStop(0.8, 'rgba(0,0,0,0.9)'); em.addColorStop(1, 'rgba(0,0,0,0)');
      c.globalCompositeOperation = 'destination-in'; c.fillStyle = em; c.fillRect(0, 0, w, h);   // never a hard card edge
    }, { key: 'roof_cloud' });
    T.sun = canvasTex(64, 64, (c, w, h) => {
      const g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
      g.addColorStop(0, 'rgba(255,250,230,1)'); g.addColorStop(0.22, 'rgba(255,236,190,1)'); g.addColorStop(0.3, 'rgba(255,200,120,0.55)'); g.addColorStop(0.6, 'rgba(255,170,90,0.16)'); g.addColorStop(1, 'rgba(255,160,80,0)');
      c.fillStyle = g; c.fillRect(0, 0, w, h);
    }, { key: 'roof_sun' });
    return T;
  }
  function materials() {
    if (M) return M;
    M = {
      vc: mat(0xffffff),
      st: mat(0xffffff, { key: 'roof_st' }),                       // parapets, headhouse, curb: tinted per mood
      deck: matTex(T.deck, { key: 'roof_deck' }),                   // its colour lerps between moods
      atlas: matTex(T.atlas),
      card: matTex(T.sleigh, { side: DS }),
      screen: matTex(T.remote, { emissive: 0xffffff, key: 'roof_screen' }),
      glow: new THREE.MeshBasicMaterial({ vertexColors: true }),
      puddle: new THREE.MeshBasicMaterial({ map: T.puddle, transparent: true, blending: ADD, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }),
      steam: new THREE.MeshBasicMaterial({ map: T.wisp, transparent: true, blending: ADD, depthWrite: false }),
      fx: new THREE.MeshBasicMaterial({ map: T.glow, transparent: true, blending: ADD, depthWrite: false, fog: false, side: DS, color: 0xbfe6ff }),
      sun: new THREE.MeshBasicMaterial({ map: T.sun, transparent: true, blending: ADD, depthWrite: false, fog: false }),
      halo: new THREE.MeshBasicMaterial({ map: T.sun, transparent: true, blending: ADD, depthWrite: false, fog: false, color: 0xd8e8ff, opacity: 0.4, side: DS }),
      cloud: new THREE.MeshBasicMaterial({ map: T.cloud, transparent: true, depthWrite: false, fog: false, side: DS, color: 0x3a4a40 }),
      pool: new THREE.MeshBasicMaterial({ map: T.sun, transparent: true, blending: ADD, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 }),
      white: new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, blending: ADD, depthWrite: false, depthTest: false, fog: false, side: DS, opacity: 0 }),   // no depth test: from inside, the far wall is behind the deck
      buds: mat(0xffffff, { emissive: 0x585856, key: 'roof_buds' }),   // white earbuds that still read at dusk
    };
    M.glow.defaultAttributeValues = { color: [1, 1, 1] };
    return M;
  }

  // ---------------------------------------------------------- tower() + skyline() from the valley (or a plain fallback)
  // The roof slab and parapet lips of our tower copy are trimmed: the deck and parapets here replace them, so the hatch
  // shows its own black shaft (not a slab 8 cm down) and the cap is flush.
  function trimTower(tw) {
    const fr = tw.getObjectByName('tower_frame');
    if (!fr || !fr.geometry || fr.geometry.index) return;
    const g = fr.geometry, P = g.attributes.position, n = P.count, keep = [];
    for (let t = 0; t < n; t += 3) {
      let drop = true, cx = 0, cz = 0;
      for (let k = 0; k < 3; k++) {
        const x = P.getX(t + k), y = P.getY(t + k), z = P.getZ(t + k); cx += x / 3; cz += z / 3;
        if (y < 130.85 || y > 132.35 || Math.abs(x) > 18.31 || z < -41.31 || z > -10.69) drop = false;
      }
      if (drop && Math.abs(cx) > 17.74 && (Math.abs(cz + 41) < 0.26 || Math.abs(cz + 11) < 0.26)) drop = false;   // the corner fins' tops stay
      if (!drop) keep.push(t);
    }
    if (keep.length * 3 === n) return;
    const ng = new THREE.BufferGeometry();
    for (const name of Object.keys(g.attributes)) {
      const a = g.attributes[name], s = a.itemSize, out = new Float32Array(keep.length * 3 * s);
      let o = 0;
      for (const t of keep) for (let k = 0; k < 3; k++) for (let j = 0; j < s; j++) out[o++] = a.array[(t + k) * s + j];
      ng.setAttribute(name, new THREE.BufferAttribute(out, s));
    }
    g.dispose(); fr.geometry = ng;
  }
  function fallbackTower() {   // SETS.valley missing: a dark glass top, a static band, a flat Yes sign (never throws)
    const g = new THREE.Group(); g.name = 'tower';
    const pb = b, pg = GL, px = XF; b = new Builder(); GL = []; XF = null;
    bb(-18, 100, -41, 18, 130.9, -11, 0x22303a); bb(-14, 131, -41, 14, 134, -35, 0x4a5058);
    quad(32, 8, M.glow, 0, 112, -10.7, 0, 0, 0x8fd8ff);
    quad(24, 8, M.glow, 0, 138.2, -35.95, 0, 0, YES);
    const st = b.done(); if (GL.length) st.add(glowMesh(GL)); g.add(st);
    b = pb; GL = pg; XF = px;
    const fc = new THREE.Group(); fc.name = 'facade_countdown'; g.add(fc);
    fc.userData = { set() {}, run() {}, text() {}, zero() {} };
    const ys = new THREE.Group(); ys.name = 'yes_sign'; ys.userData.lit = () => {}; g.add(ys);
    const td = new THREE.Group(); td.name = 'tower_drones'; td.userData = { count() {}, color() {} }; g.add(td);
    g.userData = { update() {}, lit() {}, countdown: { secs: 0 } };
    return g;
  }
  function fallbackSky() {
    const g = new THREE.Group(); g.name = 'skyline';
    const pb = b, pg = GL, px = XF; b = new Builder(); GL = []; XF = null;
    const band = new THREE.CylinderGeometry(480, 480, 60, 24, 1, true); band.translate(0, 20, 0);
    put(band, 0x3a3c44); const st = b.done({ floor: false }); st.children.forEach((m) => { m.material = mat(0x3a3c44, { side: THREE.BackSide }); }); g.add(st);
    b = pb; GL = pg; XF = px;
    g.userData = { update() {}, lit() {}, swing() {}, rain() {}, crowd() {}, sky() {}, flash() {}, bridgeLights() {} };
    return g;
  }
  // the storm over the roof is black-green (11:41): repaint our own dome copy (its geometry is per instance)
  const SKYG = { z: new THREE.Color(0x0c120f), h: new THREE.Color(0x3a4a40), b: new THREE.Color(0x26302a) };
  function greenSky() {
    const dome = R.sky && R.sky.getObjectByName('sky_dome');
    if (!dome || !dome.geometry.attributes.color) return;
    const p = dome.geometry.attributes.position, col = dome.geometry.attributes.color;
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i) / 540;
      if (y >= 0) tc.lerpColors(SKYG.h, SKYG.z, smooth(Math.min(1, y / 0.5))); else tc.lerpColors(SKYG.h, SKYG.b, smooth(Math.min(1, -y / 0.2)));
      col.setXYZ(i, tc.r, tc.g, tc.b);
    }
    col.needsUpdate = true;
  }
  // golden hour after the storm is washed gold -> peach overhead (valley's 'golden' keeps a blue zenith); A1's after is pinker
  const SKYT = { golden: [new THREE.Color(0xf2c48a), new THREE.Color(0xd8a890), 0.6], afterglow: [new THREE.Color(0xeaa088), new THREE.Color(0xa07a98), 0.7] };
  function tintSky(T0) {
    const dome = R.sky && R.sky.getObjectByName('sky_dome');
    if (!dome || !dome.geometry.attributes.color) return;
    const p = dome.geometry.attributes.position, col = dome.geometry.attributes.color;
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i) / 540; if (y < -0.02) continue;
      tc2.lerpColors(T0[0], T0[1], smooth(Math.min(1, Math.max(0, y) / 0.55)));
      tc.setRGB(col.getX(i), col.getY(i), col.getZ(i)).lerp(tc2, T0[2] * smooth(Math.min(1, Math.max(0, y) / 0.12 + 0.35)));
      col.setXYZ(i, tc.r, tc.g, tc.b);
    }
    col.needsUpdate = true;
  }
  function skyMode(mode) {
    const s = R.sky && R.sky.userData; if (!s || !s.sky) return;
    if (mode === 'storm') { s.sky('dawn'); s.sky('midday_storm'); greenSky(); }
    else if (SKYT[mode]) { s.sky('dawn'); s.sky('golden'); tintSky(SKYT[mode]); }
    else s.sky(mode);
  }
  const TW = {   // tower calls (tolerant of the fallback)
    fc: () => R.tower && R.tower.getObjectByName('facade_countdown'),
    drones: () => R.tower && R.tower.getObjectByName('tower_drones'),
    yes: () => R.tower && R.tower.getObjectByName('yes_sign'),
  };

  // ---------------------------------------------------------- the ring of 400 (spec §4: deterministic placement)
  const RING = { centre: [0, -19.0], radii: [4.0, 4.45, 4.9, 5.35, 5.8], counts: [65, 73, 80, 87, 95], gap: 1.4 };
  const NR = 400, ANG = new Float32Array(NR), BR = new Float32Array(NR), NOISE = new Float32Array(64);
  const YESL = new THREE.Color(YES), FLAREL = new THREE.Color(FLARE);
  for (let i = 0; i < 64; i++) NOISE[i] = 0.5 + 0.5 * Math.sin(i * 12.9898) * Math.cos(i * 4.1414 + 1.7);
  function ringPlace(fleet) {
    seed = 400; let i = 0;
    for (let rw = 0; rw < 5; rw++) {
      const r = RING.radii[rw], n = RING.counts[rw], g = (RING.gap / 2) / r;
      for (let k = 0; k < n; k++, i++) {
        const a = g + (TAU - 2 * g) * (k + 0.5) / n, x = r * Math.sin(a), z = RING.centre[1] + r * Math.cos(a);
        ANG[i] = a; BR[i] = 0.85 + 0.15 * rnd();
        ev.set((rnd() - 0.5) * 0.1, a + (rnd() - 0.5) * 0.16, (rnd() - 0.5) * 0.1);
        m5.compose(pv.set(x, 0.13, z), qv.setFromEuler(ev), sv.set(0.76, 0.76, 0.76));
        fleet.body.setMatrixAt(i, m5); fleet.light.setMatrixAt(i, m5);
        fleet.tint(i, 0xeef2f6); fleet.glow(i, YES);
      }
    }
    fleet.commit();
    for (const im of [fleet.body, fleet.light]) { im.computeBoundingSphere(); im.frustumCulled = true; }
  }
  function ringColours(t, all) {   // round-robin: 100 lights a frame (all 400 while a pulse or a flare runs)
    const F = R.fleet; if (!F) return;
    const arr = F.light.instanceColor.array, lv = R.lv, fl = R.flare, pu = R.pulse;
    const n = all ? NR : 100, i0 = all ? 0 : R.rr;
    for (let j = 0; j < n; j++) {
      const i = (i0 + j) % NR;
      let k = lv * BR[i];
      if (R.flicker) k *= 0.86 + 0.14 * NOISE[(i * 13 + ((t * 5 + i * 0.37) | 0)) & 63];
      if (pu > 0) { const d = Math.cos(ANG[i] - t * 2.4); if (d > 0) { const d2 = d * d, d4 = d2 * d2; k *= 1 + pu * 0.9 * d4 * d2; } }
      k *= 1 + fl * 0.6;
      arr[i * 3] = (YESL.r + (FLAREL.r - YESL.r) * fl) * k; arr[i * 3 + 1] = (YESL.g + (FLAREL.g - YESL.g) * fl) * k; arr[i * 3 + 2] = (YESL.b + (FLAREL.b - YESL.b) * fl) * k;
    }
    if (!all) R.rr = (R.rr + 100) % NR;
    F.light.instanceColor.needsUpdate = true;
    if (R.pools) { const pa = R.pools.instanceColor.array; for (let j = 0; j < n; j++) { const i = ((i0 + j) % NR) * 3; pa[i] = arr[i] * 0.42; pa[i + 1] = arr[i + 1] * 0.42; pa[i + 2] = arr[i + 2] * 0.42; } R.pools.instanceColor.needsUpdate = true; }
  }

  // ---------------------------------------------------------- data blocks used by build and update
  const PUDDLES = [[-9, -14.5, 0.9], [-4.2, -23.2, 0.9], [3.5, -28, 0.8], [9.3, -14.6, 0.6], [14, -26, 1.0], [-13, -21, 1.1],
    [6.5, -31.5, 1.0], [-11, -30.5, 0.9], [10.6, -17.9, 0.7], [-15.2, -13.0, 0.6], [-3.4, -26.4, 0.7], [16.0, -14.4, 0.6]];
  const VENTS = [[-12, -32], [-6, -33], [4, -33], [-15.5, -16], [15.5, -30], [-15.5, -26]];
  const EYES = [[-15, -11.47, PI], [-9, -11.47, PI], [-3, -11.47, PI], [3, -11.47, PI], [9, -11.47, PI], [15, -11.47, PI],
    [-17.53, -16, H], [-17.53, -26, H], [-17.53, -34, H], [17.53, -16, -H], [17.53, -26, -H], [17.53, -34, -H]];
  const NST = 18, STM = { x: new Float32Array(NST), y: new Float32Array(NST), z: new Float32Array(NST), age: new Float32Array(NST), life: new Float32Array(NST), vx: new Float32Array(NST), s: new Float32Array(NST) };
  const NTU = 26, TUFT = [];   // garland tufts on the sleigh (local): [x, y, z, phase, freq]
  for (let i = 0; i < 14; i++) TUFT.push([-1.5 + i * 0.2308, 1.5, -0.63, i * 1.7, 2 + (i % 3) * 0.4]);
  for (let i = 0; i < 12; i++) TUFT.push([-1.5 + i * 0.2727, 0.71, 0.62, i * 2.3 + 0.5, 2.4 + (i % 2) * 0.5]);
  const FLY = { x: 13.2, z: -16.6, x0: 0, z0: 0, x1: 0, z1: 0, t: -1, dur: 2.5, over: false };

  // ---------------------------------------------------------- build
  function build() {
    COL.length = 0; textures(); materials();
    const root = new THREE.Group(); root.name = 'hq_roof_root'; R.root = root;
    b = new Builder(); GL = []; XF = null;
    // ---- the deck (the hatch curb and the headhouse footprint are cut out)
    const DT = 4.0;
    for (const [x0, z0, x1, z1] of [[-17.55, -35, 7.4, -11.45], [7.4, -35, 8.6, -13.5], [7.4, -12.3, 8.6, -11.45], [8.6, -35, 12.0, -11.45],
      [12.0, -35, 15.4, -22.4], [12.0, -19.0, 15.4, -11.45], [15.4, -35, 17.55, -11.45], [-17.55, -40.55, -14, -35], [14, -40.55, 17.55, -35]]) floorRect(x0, z0, x1, z1, 0, M.deck, DT);
    // painted walkway lines (the lift to the hatch) and drains
    const LINE = 0xd8d8d0;
    bb(7.3, 0.006, -21.4, 12.0, 0.012, -21.3, LINE); bb(8.6, 0.006, -20.1, 12.0, 0.012, -20.0, LINE);
    bb(7.3, 0.006, -21.3, 7.4, 0.012, -14.2, LINE); bb(8.6, 0.006, -20.0, 8.7, 0.012, -14.2, LINE);
    for (const [x, z] of [[-16.9, -12.1], [-7.5, -12.0], [6.0, -12.0], [16.9, -34.4]]) {
      bb(x - 0.22, 0.004, z - 0.22, x + 0.22, 0.014, z + 0.22, 0x2a2c2e);
      for (let k = -2; k <= 2; k++) bb(x - 0.16, 0.014, z + k * 0.07 - 0.015, x + 0.16, 0.016, z + k * 0.07 + 0.015, 0x101112);
    }
    // ---- parapets (concrete, cap at 1.2; the outer faces stop 2 cm inside the tower's glass skin)
    const par = (x0, z0, x1, z1, capIn) => { bb(x0, 0, z0, x1, 1.12, z1, CONC, M.st); bb(capIn[0], 1.12, capIn[1], capIn[2], 1.2, capIn[3], CAP, M.st); };
    par(-17.74, -11.45, 17.74, -11.02, [-17.74, -11.5, 17.74, -11.02]);          // (the tower's corner fins close the ends)
    par(-17.98, -40.74, -17.55, -11.45, [-17.98, -40.74, -17.5, -11.45]);
    par(17.55, -40.74, 17.98, -11.45, [17.5, -40.74, 17.98, -11.45]);
    par(-17.75, -40.98, -14.0, -40.55, [-17.75, -40.98, -14.0, -40.5]);
    par(14.0, -40.98, 17.75, -40.55, [14.0, -40.98, 17.75, -40.5]);
    COL.push([-18.0, -11.45, 18.0, -11.0], [-18.0, -41.0, -17.55, -11.0], [17.55, -41.0, 18.0, -11.0],
      [-14.0, -41.0, 14.0, -35.0], [-17.55, -41.0, -14.0, -35.0], [14.0, -41.0, 17.55, -35.0]);
    for (let x = -16.5; x <= 16.6; x += 3) bb(x - 0.01, 0.15, -11.47, x + 0.01, 1.1, -11.45, 0x6a6c6a, M.st);    // formwork joints
    for (const x of [-12, 0, 12]) bb(x - 0.12, 0.0, -11.5, x + 0.12, 0.05, -11.45, 0x3a3c3e);                      // scuppers
    // the crown's foot (a dark kerb where the plant box meets the deck) + an access ladder up its face
    bb(-14.0, 0, -35.12, 14.0, 0.12, -34.98, 0x3a3e44);
    for (const x of [-13.0, -12.4]) bb(x - 0.03, 0, -34.98, x + 0.03, 3.1, -34.92, STEEL);
    for (let y = 0.3; y < 3.0; y += 0.3) bb(-13.0, y - 0.015, -34.97, -12.4, y + 0.015, -34.93, STEEL);
    // ---- the lift headhouse (white-grey panels) and its private car
    const HX0 = 12.0, HX1 = 15.4, HZ0 = -22.4, HZ1 = -19.0, HH = 3.2;
    wall(HX0, HZ0, HX1, HZ0 + 0.4, HH, PANEL, M.st); wall(HX0, HZ1 - 0.4, HX1, HZ1, HH, PANEL, M.st); wall(HX1 - 0.4, HZ0 + 0.4, HX1, HZ1 - 0.4, HH, PANEL, M.st);
    wall(HX0, HZ0 + 0.4, HX0 + 0.4, -21.5, HH, PANEL, M.st); wall(HX0, -19.9, HX0 + 0.4, HZ1 - 0.4, HH, PANEL, M.st);
    bb(HX0, 2.3, -21.5, HX0 + 0.4, HH, -19.9, PANEL, M.st);
    bb(HX0 - 0.04, HH, HZ0 - 0.04, HX1 + 0.04, HH + 0.1, HZ1 + 0.04, CAP, M.st);
    for (const [x0, z0, x1, z1] of [[HX0 - 0.04, HZ0 - 0.04, HX1 + 0.04, HZ0 + 0.08], [HX0 - 0.04, HZ1 - 0.08, HX1 + 0.04, HZ1 + 0.04], [HX0 - 0.04, HZ0, HX0 + 0.08, HZ1], [HX1 - 0.08, HZ0, HX1 + 0.04, HZ1]]) bb(x0, HH + 0.1, z0, x1, HH + 0.24, z1, CAP, M.st);
    for (let x = HX0 + 0.85; x < HX1 - 0.1; x += 0.85) { bb(x - 0.012, 0.05, HZ1, x + 0.012, HH, HZ1 + 0.012, SEAM, M.st); bb(x - 0.012, 0.05, HZ0 - 0.012, x + 0.012, HH, HZ0, SEAM, M.st); }
    for (let z = HZ0 + 0.85; z < HZ1 - 0.1; z += 0.85) bb(HX1, 0.05, z - 0.012, HX1 + 0.012, HH, z + 0.012, SEAM, M.st);
    for (const [z0, z1] of [[HZ0, -21.5], [-19.9, HZ1]]) for (let z = z0 + 0.42; z < z1 - 0.05; z += 0.85) bb(HX0 - 0.012, 0.05, z - 0.012, HX0, HH, z + 0.012, SEAM, M.st);
    for (const [x0, z0, x1, z1] of [[HX0 - 0.03, HZ0 - 0.03, HX1 + 0.03, HZ0], [HX0 - 0.03, HZ1, HX1 + 0.03, HZ1 + 0.03], [HX1, HZ0, HX1 + 0.03, HZ1],
      [HX0 - 0.03, HZ0, HX0, -21.62], [HX0 - 0.03, -19.78, HX0, HZ1]]) bb(x0, 0, z0, x1, 0.12, z1, 0x5a5e62);              // plinth (not across the door)
    // the door frame, the plate, the reader, the bulkhead lamp
    bb(HX0 - 0.06, 0, -21.62, HX0 + 0.02, 2.42, -21.5, STEELD); bb(HX0 - 0.06, 0, -19.9, HX0 + 0.02, 2.42, -19.78, STEELD); bb(HX0 - 0.06, 2.3, -21.62, HX0 + 0.02, 2.42, -19.78, STEELD);
    bb(HX0 - 0.03, 2.47, -21.32, HX0 - 0.01, 2.63, -20.08, 0x1a1e24);
    atlas(row(0), 1.2, 0.15, HX0 - 0.035, 2.55, -20.7, -H);
    bb(HX0 - 0.05, 1.12, -19.42, HX0, 1.28, -19.28, 0x1c2026);
    quad(0.06, 0.03, M.glow, HX0 - 0.052, 1.24, -19.35, -H, 0, 0xff4a3a);
    quad(0.07, 0.07, M.glow, HX0 - 0.052, 1.17, -19.35, -H, 0, 0x6fc8ff);
    bb(HX0 - 0.16, 2.72, -20.85, HX0, 2.84, -20.55, 0x3a3e44); quad(0.26, 0.05, M.glow, HX0 - 0.08, 2.715, -20.7, 0, H, 0xfff0d0);
    // up top: a condenser and the lift's vent pipe
    bb(13.0, HH + 0.1, -21.9, 14.4, HH + 0.85, -20.9, 0x8a8e92); bb(13.05, HH + 0.85, -21.85, 14.35, HH + 0.87, -20.95, 0x2a2c30);
    cyl(0.09, 0.09, 0.9, 8, STEEL, 14.9, HH + 0.55, -19.5); cyl(0.16, 0.16, 0.08, 8, STEEL, 14.9, HH + 1.02, -19.5);
    // the car: dark floor, black mirror walls, a warm strip, the ROOF panel, a handrail
    const CX0 = 12.4, CX1 = 15.0, CZ0 = -22.0, CZ1 = -19.4, CH = 2.6;
    bb(CX0, 0.0, CZ0, CX1, 0.02, CZ1, 0x34363a); bb(12.9, 0.02, -21.6, 14.6, 0.026, -19.8, 0x4a4036);               // floor + a mat
    bb(HX0 - 0.02, 0.0, -21.5, CX0, 0.025, -19.9, 0x8a9098); bb(HX0 + 0.18, 0.025, -21.5, HX0 + 0.22, 0.03, -19.9, 0x2a2c30);   // the door sill
    quad(CX1 - CX0, CH, M.vc, (CX0 + CX1) / 2, CH / 2, CZ0 + 0.005, 0, 0, 0x2c323a);
    quad(CX1 - CX0, CH, M.vc, (CX0 + CX1) / 2, CH / 2, CZ1 - 0.005, PI, 0, 0x2c323a);
    quad(CZ1 - CZ0, CH, M.vc, CX1 - 0.005, CH / 2, (CZ0 + CZ1) / 2, -H, 0, 0x283038);
    quad(0.5, CH, M.vc, CX0 + 0.005, CH / 2, -21.75, H, 0, 0x2c323a); quad(0.5, CH, M.vc, CX0 + 0.005, CH / 2, -19.65, H, 0, 0x2c323a);
    quad(1.6, CH - 2.3, M.vc, CX0 + 0.005, (2.3 + CH) / 2, -20.7, H, 0, 0x2c323a);
    for (const [z, w] of [[-21.4, 0.08], [-20.5, 0.05], [-19.9, 0.12]]) quad(w, CH - 0.2, M.vc, CX1 - 0.007, CH / 2, z, -H, 0, 0x4a5664);   // mirror streaks
    for (const x of [12.9, 13.9]) quad(0.07, CH - 0.2, M.vc, x, CH / 2, CZ0 + 0.007, 0, 0, 0x4a5664);
    bb(CX0, CH, CZ0, CX1, CH + 0.04, CZ1, 0x14161a);
    quad(1.9, 0.5, M.vc, 13.7, CH - 0.003, -20.7, 0, H, 0x6a6458); quad(1.8, 0.1, M.glow, 13.7, CH - 0.006, -20.7, 0, H, 0xffd8a0);
    bb(CX1 - 0.08, 0.92, CZ0 + 0.2, CX1 - 0.04, 0.96, CZ1 - 0.2, STEEL);
    rquad(0.16, 0.08, M.atlas, [129, 129, 255, 191], CX0 + 0.012, 1.2, -19.68, H);
    // ---- the hatch shaft lining (pure black, unlit) and its four rungs; the curb/lid are the maint_hatch prop
    const HCX = 8.0, HCZ = -12.9, HI = 0.45;
    quad(0.9, 1.4, M.glow, HCX, -0.7, HCZ - HI + 0.002, 0, 0, BLACK); quad(0.9, 1.4, M.glow, HCX, -0.7, HCZ + HI - 0.002, PI, 0, BLACK);
    quad(0.9, 1.4, M.glow, HCX - HI + 0.002, -0.7, HCZ, H, 0, BLACK); quad(0.9, 1.4, M.glow, HCX + HI - 0.002, -0.7, HCZ, -H, 0, BLACK);
    quad(0.9, 0.9, M.glow, HCX, -1.4, HCZ, 0, -H, BLACK);
    for (const x of [7.76, 8.24]) bb(x - 0.02, -1.4, -13.33, x + 0.02, 0.28, -13.29, 0x5a6068);
    for (let i = 0; i < 4; i++) { const y = -0.12 - i * 0.3; bb(7.76, y - 0.015, -13.32, 8.24, y + 0.015, -13.27, 0x7a8088); }
    // ---- fall-arrest eyes and mushroom vents (instanced)
    root.add(b.done());
    if (GL.length) root.add(glowMesh(GL));
    b = null; GL = null;
    const P = (g) => (root.add(g), g);
    const eyeGeo = geoOf(() => { bb(-0.07, -0.07, 0, 0.07, 0.07, 0.02, STEEL); torus(0.045, 0.012, 4, 10, 0xb8bec6, 0, 0, 0.05, 0, 0); });
    R.eyes = P(instanced(eyeGeo, M.vc, EYES.map(([x, z, ry]) => [x, 0.9, z, ry, 1]))); R.eyes.name = 'anchors_ring';
    const ventGeo = geoOf(() => { cyl(0.16, 0.18, 0.62, 10, 0x9a9ea2, 0, 0.31, 0); cyl(0.13, 0.13, 0.06, 10, 0x1a1c1e, 0, 0.64, 0); cyl(0.32, 0.3, 0.1, 10, 0xb0b4b8, 0, 0.72, 0); cyl(0.1, 0.32, 0.12, 10, 0xb8bcc0, 0, 0.83, 0); });
    R.vents = P(instanced(ventGeo, M.vc, VENTS.map(([x, z], i) => [x, 0, z, i * 0.7, 1]))); R.vents.name = 'vents';
    for (const [x, z] of VENTS) COL.push([x - 0.3, z - 0.3, x + 0.3, z + 0.3]);

    // ---- props ------------------------------------------------------------------------------------------------
    // lift doors: two dark leaves sliding into the wall (0.8 m each)
    R.doors = P(new THREE.Group()); R.doors.name = 'lift_doors';
    R.leafN = part('leaf_n', () => { bb(-0.025, 0, -0.4, 0.025, 2.3, 0.4, 0x2a2e34); bb(-0.028, 0, 0.38, 0.028, 2.3, 0.4, 0x14161a); bb(-0.03, 1.0, -0.3, 0.03, 1.04, -0.05, 0x8a9098); });
    R.leafS = part('leaf_s', () => { bb(-0.025, 0, -0.4, 0.025, 2.3, 0.4, 0x2a2e34); bb(-0.028, 0, -0.4, 0.028, 2.3, -0.38, 0x14161a); bb(-0.03, 1.0, 0.05, 0.03, 1.04, 0.3, 0x8a9098); });
    R.doors.add(R.leafN, R.leafS);
    R.doorCol = [12.0, -21.5, 12.1, -19.9]; COL.push(R.doorCol);
    R.doors.userData.open = (u = 1) => { R.doorTo = clamp01(u); if (skipping()) R.doorU = R.doorTo; };
    // the maintenance hatch: curb, lid (hinged on the south edge), the stencil on the lid
    R.hatch = P(part('maint_hatch', () => {
      const CURB = 0x8a8e90;
      bb(-0.6, 0, -0.6, 0.6, 0.3, -0.45, CURB, M.st); bb(-0.6, 0, 0.45, 0.6, 0.3, 0.6, CURB, M.st);
      bb(-0.6, 0, -0.45, -0.45, 0.3, 0.45, CURB, M.st); bb(0.45, 0, -0.45, 0.6, 0.3, 0.45, CURB, M.st);
      for (const x of [-0.2, 0.2]) bb(x - 0.04, 0.22, 0.6, x + 0.04, 0.3, 0.66, STEELD);   // hinge knuckles
    }, [8.0, 0, -12.9]));
    R.lidPivot = new THREE.Object3D(); R.lidPivot.position.set(0, 0.31, 0.6); R.hatch.add(R.lidPivot);
    R.lid = part('hatch_lid', () => {
      bb(-0.6, 0, -1.2, 0.6, 0.05, 0, 0x7a7e82); bb(-0.62, -0.04, -1.22, 0.62, 0.0, 0.02, 0x5a5e62);
      for (const z of [-0.95, -0.6, -0.25]) bb(-0.55, 0.05, z - 0.02, 0.55, 0.06, z + 0.02, 0x6a6e72);
      bb(-0.16, 0.05, -1.17, -0.13, 0.15, -1.13, STEEL); bb(0.13, 0.05, -1.17, 0.16, 0.15, -1.13, STEEL); bb(-0.16, 0.13, -1.17, 0.16, 0.16, -1.13, STEEL);   // the handle
      rquad(1.0, 0.125, M.atlas, row(2), 0, 0.062, -0.42, PI, -H);
    });
    R.lidPivot.add(R.lid);
    R.hatch.userData.open = (u = 1) => { const to = clamp01(u); if (to > R.hatchTo + 0.01) R.clunked = false; R.hatchTo = to; if (skipping()) { R.hatchU = to; R.clunked = true; } };
    R.hatch.userData.dark = true;
    COL.push([7.4, -13.5, 8.6, -12.3]);
    // the cardboard sleigh (local frame: front +Z; placed ry PI so it faces north), intact + collapsed
    R.sleigh = P(new THREE.Group()); R.sleigh.name = 'sleigh'; R.sleigh.position.set(11.0, 0, -12.4); R.sleigh.rotation.y = PI;
    const sideGeo = (uo, sag = 0) => {
      const sh = new THREE.Shape(SIDE.map(([z, y]) => new THREE.Vector2(z, y))), g = new THREE.ShapeGeometry(sh), p = g.attributes.position, uv = g.attributes.uv;
      for (let i = 0; i < p.count; i++) {
        const z = p.getX(i), y = p.getY(i), u = (z - SZ0) / (SZ1 - SZ0), v = (y - SY0) / (SY1 - SY0);
        uv.setXY(i, uo + u * 0.5, v * (80 / 128));
        if (sag) p.setY(i, y - sag * Math.sin(u * PI) * v * 0.12);
      }
      g.rotateY(-H); return g;
    };
    R.sleighA = part('sleigh_intact', () => {
      for (const sx of [-1.6, 1.6]) {   // printed outside, bare card inside (a second skin 1 cm in, so the print never shows mirrored)
        const g = sideGeo(0); g.translate(sx, 0, 0); put(g, 0xffffff, M.card);
        const gi = sideGeo(0); gi.translate(sx - Math.sign(sx) * 0.012, 0, 0); put(gi, CARD);
      }
      rquad(3.2, 0.5, M.card, [0, 0, 256, 48], 0, 0.45, 0.66, 0, -0.18, 0xffffff, 256, 128);                     // the front board (low: the seat reads over it)
      { const g = new THREE.PlaneGeometry(3.2, 0.5); g.rotateY(PI); g.rotateX(-0.18); g.translate(0, 0.45, 0.648); put(g, CARD); }
      bb(-1.6, 0.66, -0.66, 1.6, 1.44, -0.6, RED); bb(-1.62, 1.42, -0.68, 1.62, 1.5, -0.58, GOLD);                 // the back panel
      bb(-1.5, 0.75, -0.6, 1.5, 0.78, -0.596, GOLD); bb(-1.55, 0.4, -0.45, 1.55, 0.62, 0.3, 0xa82830);              // the seat
      bb(-1.55, 0.18, -0.45, 1.55, 0.4, 0.3, 0x7a5a3a);
      for (const sx of [-1.45, 1.45]) {                                                                             // gold runners with a front curl
        bb(sx - 0.04, 0.0, -0.75, sx + 0.04, 0.06, 0.62, GOLD);
        for (const z of [-0.5, 0.3]) bb(sx - 0.02, 0.06, z - 0.02, sx + 0.02, 0.18, z + 0.02, GOLD);
        torus(0.12, 0.03, 4, 10, GOLD, sx, 0.15, 0.62, 0, H, M.vc, PI * 1.3);
      }
      bb(-1.62, 0.0, -0.72, 1.62, 0.02, 0.62, 0x6a4e30);   // a cardboard base sheet
    });
    R.sleigh.add(R.sleighA);
    { // the tinsel garland: tufts that flutter (instanced, one draw)
      const tg = geoOf(() => { for (let k = 0; k < 3; k++) { const g = new THREE.OctahedronGeometry(0.07, 0); g.scale(1.5, 0.75, 0.75); g.rotateY(k * 1.05); g.rotateZ((k - 1) * 0.5); put(g, k === 1 ? 0xe8ecf2 : TINSEL); } });
      R.tufts = instanced(tg, M.vc, TUFT.map(([x, y, z]) => [x, y, z, 0, 1])); R.tufts.name = 'garland';
      R.tufts.instanceMatrix.setUsage(THREE.DynamicDrawUsage); R.sleighA.add(R.tufts);
    }
    R.sleighB = part('sleigh_collapsed', () => {
      { const g = sideGeo(0.5, 1); g.rotateZ(1.32); g.translate(-1.62, 0.04, 0); put(g, 0xd8d0d0, M.card); }   // west side flat on the deck
      { const g = sideGeo(0.5, 1); g.rotateZ(-0.62); g.translate(1.62, 0.02, 0); put(g, 0xc8c0c0, M.card); }    // east side leaning out
      { const g = new THREE.PlaneGeometry(3.0, 0.6), uv = g.attributes.uv; for (let i = 0; i < 4; i++) uv.setXY(i, uv.getX(i) * 0.94, 1 - 48 / 128 + uv.getY(i) * (48 / 128));
        g.rotateX(-H + 0.06); g.rotateY(0.08); g.translate(0.1, 0.03, 1.02); put(g, 0xa89898, M.card); }        // the front board fallen flat, soggy
      boxR(3.1, 0.8, 0.06, 0x8a2228, 0, 0.55, -0.3, 1.25, 0, 0.04);                                              // the back panel folded over the seat
      bb(-1.5, 0.0, -0.45, 1.5, 0.36, 0.3, 0x7a2026);                                                              // the seat, sagged
      for (const sx of [-1.45, 1.45]) bb(sx - 0.04, 0.0, -0.75, sx + 0.04, 0.06, 0.62, 0x9a7a3a);
      bb(-1.62, 0.0, -0.72, 1.62, 0.02, 0.62, 0x4a3420);
      for (let i = 0; i < 7; i++) { const g = new THREE.OctahedronGeometry(0.06, 0); g.scale(1.6, 0.6, 0.8); g.rotateY(i); g.translate(-1.2 + i * 0.42, 0.04, 0.95 + (i % 2) * 0.12); put(g, 0x9a9ea4); }   // the garland in the wet
    });
    R.sleigh.add(R.sleighB);
    R.sleigh.userData.state = (s) => { R.sleighS = s === 'collapsed' ? 'collapsed' : 'intact'; applySleigh(); };
    R.sleigh.userData.drop = () => { R.dropped = true; applySleigh(); };
    R.sleigh.userData.wind = (k) => { R.windMul = k; };
    COL.push([9.4, -13.1, 12.6, -11.7]);
    // the disguise as loose props
    R.hat = P(PROPS.santa_hat()); R.hat.name = 'santa_hat';
    R.beard = P(PROPS.santa_beard()); R.beard.name = 'santa_beard';
    // the ring light (up: tripod + ring facing south; fallen: lying on the deck pointing west)
    R.rl = P(new THREE.Group()); R.rl.name = 'ring_light'; R.rl.position.set(11.0, 0, -16.4);
    R.rlUp = part('rl_up', () => {
      for (let i = 0; i < 3; i++) { const a = i * TAU / 3 + 0.3; beam(Math.sin(a) * 0.38, 0, Math.cos(a) * 0.38, 0, 0.75, 0, 0.025, 0.025, 0x1a1c20); }
      cyl(0.015, 0.015, 0.85, 6, 0x2a2c30, 0, 1.12, 0); bb(-0.03, 1.08, -0.06, 0.03, 1.14, 0.0, 0x2a2c30);
      torus(0.42, 0.045, 5, 24, 0x2a2c30, 0, 1.55, 0, 0, 0);
      cyl(0.04, 0.04, 0.06, 8, 0x1a1c20, 0, 1.55, -0.02, H, 0);                                                      // the phone clamp
      torus(0.42, 0.03, 4, 24, 0xffffff, 0, 1.55, 0.035, 0, 0, M.glow); torus(0.42, 0.016, 4, 24, 0xd8e4f0, 0, 1.55, -0.05, 0, 0, M.glow);   // the lit face (+ the diffuser's back rim)
    });
    R.rlLit = R.rlUp.getObjectByName('glow');
    { const h = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.2), M.halo); h.position.set(0, 1.55, 0.07); h.name = 'rl_halo'; R.rlUp.add(h); R.rlHalo = h; }
    R.rlDown = part('rl_down', () => {
      beam(0, 0.05, 0, -1.1, 0.05, 0.1, 0.05, 0.05, 0x1a1c20); beam(0, 0.05, 0, -1.05, 0.05, -0.1, 0.03, 0.03, 0x1a1c20);
      torus(0.42, 0.045, 5, 24, 0x2a2c30, -1.5, 0.08, 0.05, H + 0.15, 0);
    });
    R.rl.add(R.rlUp, R.rlDown);
    R.rl.userData.on = (on) => { R.rlOn = !!on; applyRingLight(); };
    R.rl.userData.state = (s) => { R.rlS = s === 'fallen' ? 'fallen' : 'up'; applyRingLight(); };
    R.rl.userData.wobble = (k) => { R.rlWob = k; };
    R.rlCol = [10.7, -16.7, 11.3, -16.1]; COL.push(R.rlCol);
    // presents: P1 (the Remote's table in golden) and P2
    R.presents = P(new THREE.Group()); R.presents.name = 'presents';
    const gift = (s, body, ribbon, soggy, wet) => () => {   // wet: the darker soak on the top and the tide line
      bb(-s / 2, 0, -s / 2, s / 2, s, s / 2, body);
      bb(-s / 2 - 0.004, 0, -0.04, s / 2 + 0.004, s + 0.004, 0.04, ribbon); bb(-0.04, 0, -s / 2 - 0.004, 0.04, s + 0.004, s / 2 + 0.004, ribbon);
      if (!soggy) { boxR(0.16, 0.08, 0.04, ribbon, -0.06, s + 0.04, 0, 0, 0.6, 0.4); boxR(0.16, 0.08, 0.04, ribbon, 0.06, s + 0.04, 0, 0, -0.6, -0.4); }
      else { bb(-s / 2 + 0.03, s, -s / 2 + 0.03, s / 2 - 0.03, s + 0.006, s / 2 - 0.03, wet); bb(-s / 2 - 0.006, s - 0.12, -s / 2 - 0.006, s / 2 + 0.006, s - 0.1, s / 2 + 0.006, wet); }
    };
    // P1 is red paper with a green ribbon (the Choice's painted hands-on-the-Remote layer paints the same soggy present)
    R.p1 = part('p1', () => {}); R.presents.add(R.p1);
    R.p1dry = part('p1_dry', () => { gift(0.6, 0xb8282e, 0x2a7a4a, false)(); rquad(0.36, 0.045, M.atlas, row(3), 0.08, 0.42, 0.302, 0); });
    R.p1wet = part('p1_wet', () => { gift(0.6, 0x7e2a26, 0x24563a, true, 0x5e1e1c)(); rquad(0.36, 0.045, M.atlas, row(3), 0.08, 0.40, 0.302, 0, 0, 0x9a9090); });
    R.p1.add(R.p1dry, R.p1wet);
    R.p2 = part('p2', () => gift(0.45, 0x2a4a8a, 0xe8e2d0, false)(), [13.5, 0, -13.3], 0.3); R.presents.add(R.p2);
    R.p2wet = part('p2_wet', () => gift(0.45, 0x2a4278, 0xa8a294, true, 0x1e3058)()); R.p2.add(R.p2wet);
    R.p1Col = [13.3, -12.7, 13.9, -12.1]; COL.push(R.p1Col);
    COL.push([13.27, -13.53, 13.73, -13.07]);
    R.presents.userData.moveTo = (w) => { R.p1S = w === 'table' ? 'table' : 'sleigh'; applyPresents(); };
    // the photo set: queue rope + padded stanchions, the hanging banner, the A-frame
    R.photo = P(part('photo_set', () => {
      const PX = [9.0, 10.5, 12.0, 13.5], Z = -15.2;
      for (const x of PX) { cyl(0.16, 0.18, 0.04, 10, 0x3a3c40, x, 0.02, Z); cyl(0.06, 0.06, 0.86, 8, CREAM, x, 0.47, Z); sph(0.09, 0xf4ecd8, x, 0.94, Z, 1, 0.8, 1); }
      for (let i = 0; i < 3; i++) {
        const xa = PX[i] + 0.06, xb = PX[i + 1] - 0.06, N = 6;
        for (let k = 0; k < N; k++) { const u0 = k / N, u1 = (k + 1) / N, s0 = 0.88 - 0.16 * Math.sin(u0 * PI), s1 = 0.88 - 0.16 * Math.sin(u1 * PI); beam(xa + (xb - xa) * u0, s0, Z, xa + (xb - xa) * u1, s1, Z, 0.035, 0.035, 0xb81e28); }
      }
      rquad(1.3, 0.16, M.atlas, row(1), 9.75, 0.62, Z - 0.03, PI); rquad(1.3, 0.16, M.atlas, row(1), 9.75, 0.62, Z + 0.03, 0);
    }));
    R.aframe = part('aframe', () => {
      for (const s of [-1, 1]) {
        boxR(0.62, 0.86, 0.025, 0xe8e2d4, 0, 0.42, s * 0.11, -s * 0.13, 0, 0);
        const g = new THREE.PlaneGeometry(0.56, 0.56), uv = g.attributes.uv;
        for (let i = 0; i < 4; i++) uv.setXY(i, uv.getX(i) * 0.5, 0.5 * uv.getY(i));
        g.translate(0, 0, 0.0135); if (s < 0) g.rotateY(PI); g.rotateX(-s * 0.13); g.translate(0, 0.46, s * 0.11); put(g, 0xffffff, M.atlas);
      }
      bb(-0.3, 0.84, -0.03, 0.3, 0.88, 0.03, 0x5a5e62);
    });
    R.photo.add(R.aframe);
    COL.push([9.0, -15.3, 13.5, -15.1]);
    R.afCol = [13.6, -16.7, 14.2, -16.1]; COL.push(R.afCol);
    // the ring of 400 (shell IM + light IM; matrices static, lights recoloured round-robin)
    R.ring = P(new THREE.Group()); R.ring.name = 'ring';
    R.fleet = DRONE_INSTANCED.make(NR, { tint: 0xeef2f6, state: 'yes' });
    R.fleet.body.name = 'ring_shells'; R.fleet.light.name = 'ring_lights';
    R.ring.add(R.fleet.group); ringPlace(R.fleet);
    { const g = new THREE.PlaneGeometry(0.95, 0.95).rotateX(-H);   // candle-light pools on the wet deck, one per drone (recoloured with the lights)
      R.pools = new THREE.InstancedMesh(g, M.pool, NR); R.pools.name = 'ring_pools';
      for (let i = 0; i < NR; i++) { R.fleet.light.getMatrixAt(i, m5); m5.decompose(pv, qv, sv); m5.compose(pv.set(pv.x + Math.sin(ANG[i]) * 0.1, 0.018, pv.z + Math.cos(ANG[i]) * 0.1), qv.identity(), sv.set(1, 1, 1)); R.pools.setMatrixAt(i, m5); R.pools.setColorAt(i, YESL); }
      R.pools.computeBoundingSphere(); R.ring.add(R.pools); }
    R.ring.userData = {
      level(k, dur = 0.6) { R.lvTo = Math.max(0, k); R.lvRate = dur > 0 && !skipping() ? 1 / dur : 0; if (!R.lvRate) R.lv = R.lvTo; },
      flicker(on) { R.flicker = !!on; },
      pulse(k) { R.pulse = Math.max(0, k || 0); },
      flare(k, dur = 0) { R.flareTo = clamp01(k); R.flareRate = dur > 0 && !skipping() ? 1 / dur : 0; if (!R.flareRate) R.flare = R.flareTo; },
      settle() {},
    };
    // the Remote rig on P1's top: the Remote (taped receiver + its screen), the brick phone, the coil, 8 cables to the ring
    R.rig = P(part('remote_rig', () => {
      // the cables (a slight wiggle), from the box's foot to the inner row
      for (let k = 0; k < 8; k++) {
        const want = (22.5 + 45 * k) * PI / 180, r0 = RING.radii[0], n0 = RING.counts[0], g0 = (RING.gap / 2) / r0;
        let a = want, best = 9; for (let j = 0; j < n0; j++) { const aj = g0 + (TAU - 2 * g0) * (j + 0.5) / n0, d = Math.abs(aj - want); if (d < best) { best = d; a = aj; } }
        let px = Math.sin(a) * 0.32, pz = Math.cos(a) * 0.32;
        for (let s = 1; s <= 6; s++) {
          const r = 0.32 + (3.86 - 0.32) * s / 6, w = (s < 6 ? Math.sin(s * 1.9 + k) * 0.12 : 0), nx = Math.sin(a) * r + Math.cos(a) * w, nz = Math.cos(a) * r - Math.sin(a) * w;
          beam(px, 0.012, pz, nx, 0.012, nz, 0.028, 0.022, 0x18191c); px = nx; pz = nz;
        }
      }
      bb(0.25, 0.0, 0.0, 0.29, 0.6, 0.03, 0x18191c);                                                               // the phone's lead down the box
      // the screen slab (the display chip, enlarged), facing south, tilted up 25°
      boxR(0.15, 0.115, 0.018, 0x1a1e24, -0.12, 0.69, 0.19, -0.44, 0, 0);
      boxR(0.03, 0.09, 0.03, 0x2a2e34, -0.12, 0.64, 0.16, 0, 0, 0);
      { const g = new THREE.PlaneGeometry(0.128, 0.096); g.rotateX(-0.44); g.translate(-0.12, 0.69 + 0.0045, 0.19 + 0.0095); put(g, 0xffffff, M.screen); }
      for (const y of [0.655, 0.72]) boxR(0.16, 0.02, 0.025, 0x9aa0a6, -0.12, y, 0.183 - (y - 0.69) * 0.47, -0.44, 0, 0);   // gaffer tape
      { const pts = []; for (let i = 0; i <= 40; i++) { const u = i / 40, a = u * 9 * TAU; pts.push(new THREE.Vector3(-0.05 + u * 0.19 + Math.cos(a) * 0.01, 0.612 + Math.sin(a) * 0.01, 0.12 - u * 0.12)); }
        put(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.0025, 4, false), 0xd8cfb2); }             // the coil, Remote -> phone
      quad(0.045, 0.024, M.glow, 0.1525, 0.765, -0.032, -0.25, 0, 0xc8ffb8);                                           // the LCD flash (trill)
    }, [0, 0, -19.0]));
    R.lcd = R.rig.getObjectByName('glow');
    R.remote = PROPS.remote(); R.remote.name = 'remote'; R.remote.position.set(-0.15, 0.625, 0.08); R.remote.rotation.set(-H, 0, H + 0.2); R.rig.add(R.remote);
    R.brick = PROPS.brick_phone(); R.brick.name = 'brick_phone'; R.brick.position.set(0.16, 0.6, -0.06); R.brick.rotation.y = -0.25; R.rig.add(R.brick);
    R.rig.userData.screen = (mode) => { const md = ['off', 'check', 'call', 'white'].includes(mode) ? mode : 'off'; if (md === R.screen && R.painted) return; R.screen = md; paintScreen(); };
    R.rig.userData.trill = (on) => { R.trill = !!on; R.trillT = 0; if (R.lcd) R.lcd.visible = false; };
    // the whiteout: an additive white sphere poured from the Remote
    R.white = P(new THREE.Mesh(new THREE.SphereGeometry(1, 20, 12), M.white)); R.white.name = 'whiteout'; R.white.position.set(0, 0.7, -19.0); R.white.renderOrder = 5;
    R.white.userData.pour = (dur = 2.0) => { R.whiteDur = reduceFx() ? Math.max(3.0, dur) : dur; R.whiteT = 0; if (skipping()) R.whiteT = R.whiteDur; };
    R.white.userData.reset = () => { R.whiteT = -1; applyWhite(0); };
    // the earbuds on the cap (A1's after)
    R.buds = P(part('earbuds', () => {
      sph(0.012, 0xf4f4f2, -0.05, 0.012, 0, 1, 0.8, 1.4, M.buds); sph(0.012, 0xf4f4f2, 0.06, 0.012, 0.03, 1, 0.8, 1.4, M.buds);
      const pts = [[-0.05, 0.004, 0.02], [-0.02, 0.003, 0.07], [0.03, 0.003, 0.06], [0.06, 0.004, 0.045]].map((p) => new THREE.Vector3(p[0], p[1], p[2]));
      put(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 10, 0.0018, 3, false), 0xe8e8e4, M.buds);
      bb(-0.0, 0.0, 0.07, 0.02, 0.006, 0.11, 0xe8e8e4, M.buds);
    }, [0.05, 1.2, -11.3], 0.4)); R.buds.visible = false;
    // the countdown glow rising over the south parapet (+ the haze in front of the band 15 m below)
    R.glow = P(new THREE.Group()); R.glow.name = 'countdown_glow';
    { const q = new THREE.Mesh(new THREE.PlaneGeometry(32, 19.5), M.fx); q.position.set(0, -15 + 9.75, -10.9); q.renderOrder = 2; R.glow.add(q); }
    R.glow.userData.color = (hex) => { R.glowHex = hex; M.fx.color.setHex(hex); };
    R.glow.userData.level = (k) => { R.glowK = Math.max(0, k); };
    // the sun disc (golden, a1_after): a fog-free billboard low in the WSW
    R.sun = P(new THREE.Mesh(new THREE.PlaneGeometry(26, 26), M.sun)); R.sun.name = 'sun'; R.sun.position.set(-426, 19, 199); R.sun.lookAt(0, 2, -20); R.sun.renderOrder = -6;
    R.sun.userData.y = (dy) => { R.sunDy = dy; R.sun.position.y = 19 + dy; };
    // puddles (12 decals, tinted per mood) and steam (18 wisps rising off them)
    { const g = new THREE.PlaneGeometry(2, 2).rotateX(-H);
      R.puddles = P(new THREE.InstancedMesh(g, M.puddle, PUDDLES.length)); R.puddles.name = 'puddles';
      PUDDLES.forEach(([x, z, r], i) => { m5.compose(pv.set(x, 0.015, z), qv.setFromAxisAngle(sv.set(0, 1, 0), i * 1.3), sv.set(r, 1, r * 0.8)); R.puddles.setMatrixAt(i, m5); R.puddles.setColorAt(i, tc.set(0x4a5a58)); });
      R.puddles.instanceMatrix.setUsage(THREE.DynamicDrawUsage); R.puddles.computeBoundingSphere(); }
    { const g = new THREE.PlaneGeometry(0.9, 1.8); g.translate(0, 0.9, 0);
      R.steam = P(new THREE.InstancedMesh(g, M.steam, NST)); R.steam.name = 'steam';
      for (let i = 0; i < NST; i++) { R.steam.setMatrixAt(i, ZERO); R.steam.setColorAt(i, tc.setRGB(0, 0, 0)); steamSpawn(i, true); }
      R.steam.instanceMatrix.setUsage(THREE.DynamicDrawUsage); R.steam.frustumCulled = true; R.steam.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 1.5, -24), 23);
      R.steam.userData.level = (k) => { R.steamK = Math.max(0, k); }; }
    // a loose flyer (storm gusts)
    { seed = 91; const pos = [], idx = [], uvs = [];
      const card = (cx, cy, cz, w, h, nx, nz, flat) => {
        const k = pos.length / 3, tx = -nz, tz = nx;   // tangent along the horizon
        if (flat) { pos.push(cx - w / 2, cy, cz - h / 2, cx + w / 2, cy, cz - h / 2, cx + w / 2, cy, cz + h / 2, cx - w / 2, cy, cz + h / 2); }
        else pos.push(cx - tx * w / 2, cy - h / 2, cz - tz * w / 2, cx + tx * w / 2, cy - h / 2, cz + tz * w / 2, cx + tx * w / 2, cy + h / 2, cz + tz * w / 2, cx - tx * w / 2, cy + h / 2, cz - tz * w / 2);
        uvs.push(0, 0, 1, 0, 1, 1, 0, 1); idx.push(k, k + 1, k + 2, k, k + 2, k + 3);
      };
      for (let i = 0; i < 14; i++) { const a = i / 14 * TAU + rnd() * 0.3, d = 200 + rnd() * 110, y = 22 + rnd() * 55, w = 170 + rnd() * 110, h = 55 + rnd() * 35; card(Math.sin(a) * d, y, -20 + Math.cos(a) * d, w, h, -Math.sin(a), -Math.cos(a), false); }
      for (const [x, z, y, w] of [[-60, -40, 150, 420], [120, 60, 170, 380], [-80, 170, 160, 400], [90, -180, 175, 360]]) card(x, y, z, w, w * 0.6, 0, 1, true);
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); g.setIndex(idx);
      R.clouds = P(new THREE.Mesh(g, M.cloud)); R.clouds.name = 'storm_clouds'; R.clouds.renderOrder = -5; R.clouds.frustumCulled = false; }
    R.flyer = P(part('flyer', () => { const g = new THREE.PlaneGeometry(0.21, 0.3); g.rotateX(-H); put(g, 0xf4f0e6); const h = new THREE.PlaneGeometry(0.21, 0.3); h.rotateX(H); put(h, 0xd8d4ca); }));
    R.flyer.position.set(FLY.x, 0.01, FLY.z);
    // the tower and the city (valley's shared builders), at (0, -131, 0)
    const V = SETS.valley;
    try { R.tower = V && V.tower ? V.tower({ podium: 'none', drones: 12 }) : fallbackTower(); trimTower(R.tower); } catch (e) { console.warn('TWO: hq_roof tower', e); R.tower = fallbackTower(); }
    try { R.sky = V && V.skyline ? V.skyline({ skip: ['TOWER'], sky: 'midday_storm', neon: 0.35 }) : fallbackSky(); } catch (e) { console.warn('TWO: hq_roof skyline', e); R.sky = fallbackSky(); }
    R.tower.position.set(0, -131, 0); R.sky.position.set(0, -131, 0); root.add(R.tower, R.sky);
    R.skyMode = ''; R.cloudsM = (R.sky.getObjectByName('clouds') || {}).material || null;
    // put every prop where its (persisting) state says, then dress
    R.painted = false; paintScreen();
    dress(R.state, { build: true, keepLamp: R.lampUser });
    applyDoors(); applyHatch();
    // content's prop calls apply the scene's AUTO dress first (touch()); internal code calls the appliers directly
    for (const o of [R.doors, R.hatch, R.sleigh, R.rl, R.presents, R.ring, R.rig, R.white, R.glow, R.sun, R.steam]) {
      const u = o.userData;
      for (const k of Object.keys(u)) { const f = u[k]; if (typeof f === 'function') u[k] = (a0, a1, a2) => { touch(); return f(a0, a1, a2); }; }
    }
    return root;
  }

  // ---------------------------------------------------------- prop state appliers (no allocation)
  function applySleigh() {
    if (!R.sleighA) return;
    const col = R.sleighS === 'collapsed';
    R.sleighA.visible = !col; R.sleighB.visible = col;
    const st = R.state, show = R.dropped || st !== 'storm32';
    R.hat.visible = show && st !== 'credits'; R.beard.visible = show;
    if (st === 'storm32') {
      R.hat.position.set(10.45, 0.62, -12.6); R.hat.rotation.set(0.25, 0.4, 0.15);
      R.beard.position.set(9.95, 0.645, -12.35); R.beard.rotation.set(-0.12, 0.3, 0.06);
    } else {
      R.hat.position.set(10.4, 0.42, -12.4); R.hat.rotation.set(0.9, 1.2, 0.5); R.hat.scale.set(1.05, 0.8, 1.05);
      R.beard.position.set(9.25, 0.022, -14.6); R.beard.rotation.set(0.04, 0.8, -0.03);
    }
    if (st === 'storm32') R.hat.scale.set(1, 1, 1);
  }
  function applyRingLight() {
    if (!R.rlUp) return;
    const up = R.rlS !== 'fallen';
    R.rlUp.visible = up; R.rlDown.visible = !up;
    R.rl.position.set(11.0, 0, up ? -16.4 : -15.8);
    if (R.rlLit) R.rlLit.visible = up && R.rlOn;
    if (R.rlHalo) R.rlHalo.visible = up && R.rlOn;
    const c = R.rlCol; if (up) { c[0] = 10.7; c[1] = -16.7; c[2] = 11.3; c[3] = -16.1; } else { c[0] = 9.4; c[1] = -16.0; c[2] = 11.1; c[3] = -15.6; }
  }
  function applyPresents() {
    if (!R.p1) return;
    const table = R.p1S === 'table', wet = R.state !== 'storm32';
    R.p1dry.visible = !wet; R.p1wet.visible = wet; R.p2wet.visible = wet; R.p2.children[0].visible = !wet;
    if (table) { R.p1.position.set(0, 0, -19.0); R.p1.rotation.y = 0; R.p1.scale.set(1, wet ? 0.985 : 1, 1); }
    else { R.p1.position.set(13.6, 0, -12.4); R.p1.rotation.y = PI - 0.2; R.p1.scale.set(1, 1, 1); }
    const c = R.p1Col; if (table) { c[0] = -0.3; c[1] = -19.3; c[2] = 0.3; c[3] = -18.7; } else { c[0] = 13.3; c[1] = -12.7; c[2] = 13.9; c[3] = -12.1; }
  }
  function applyAframe() {
    if (!R.aframe) return;
    const c = R.afCol;
    if (R.afS === 'flat') { R.aframe.position.set(13.6, 0.05, -17.0); R.aframe.rotation.set(-H + 0.02, -0.7, 0, 'YXZ'); c[0] = c[2] = 1e4; }
    else { R.aframe.position.set(13.9, 0, -16.4); R.aframe.rotation.set(0, -0.5, 0); c[0] = 13.6; c[1] = -16.7; c[2] = 14.2; c[3] = -16.1; }
  }
  function applyDoors() {
    if (!R.leafN) return;
    const u = smooth(R.doorU);
    R.leafN.position.set(12.2, 0, -21.1 - 0.78 * u); R.leafS.position.set(12.2, 0, -20.3 + 0.78 * u);
    const c = R.doorCol; if (R.doorU > 0.5) { c[0] = c[2] = 1e4; } else { c[0] = 12.0; c[1] = -21.5; c[2] = 12.1; c[3] = -19.9; }
  }
  function applyHatch() { if (R.lidPivot) R.lidPivot.rotation.x = smooth(R.hatchU) * (105 * PI / 180); }
  const WHITE_R = 16;   // spec 12 m; 16 swallows the split's lens (13.4 m out) and roof_wide (11.2 m) so the frame goes white
  function applyWhite(u) {
    if (!R.white) return;
    const r = 0.01 + WHITE_R * (1 - (1 - u) * (1 - u)), op = (reduceFx() ? 0.85 : 1) * smooth(Math.min(1, u * 1.6));
    R.white.scale.setScalar(r); M.white.opacity = op; R.white.visible = u > 0.001;
  }
  function paintScreen() {
    if (!T) return;
    const cv = T.remote.image, cx = cv.getContext('2d');
    paintRemote(R.screen)(cx, cv.width, cv.height); T.remote.needsUpdate = true; R.painted = true;
    if (M) M.screen.emissiveIntensity = R.screen === 'off' ? 0.3 : 1;
  }
  function steamSpawn(i, first) {
    const p = PUDDLES[(i * 7 + ((Math.random() * 12) | 0)) % PUDDLES.length], a = Math.random() * TAU, r = Math.random() * p[2] * 0.7;
    STM.x[i] = p[0] + Math.cos(a) * r; STM.z[i] = p[1] + Math.sin(a) * r; STM.y[i] = 0.02;
    STM.life[i] = 4 + Math.random() * 3; STM.age[i] = first ? Math.random() * STM.life[i] : 0; STM.vx[i] = (Math.random() - 0.5) * 0.12; STM.s[i] = 0.6 + Math.random() * 0.45;
  }

  // ---------------------------------------------------------- the spot as a lamp (lamp(name)), per spec §3.4
  const LAMPS = {
    sleigh:  { p: [11.0, 1.55, -16.3], t: [11.0, 0.8, -12.4], a: 0.45, pen: 0.5, d: 7, c: 0xffffff, i: 1.1 },
    ring:    { p: [0.0, 0.35, -19.0], t: [0.0, 1.5, -16.6], a: 0.9, pen: 1.0, d: 6, c: YES, i: 0.9 },
    parapet: { p: [-1.0, 0.4, -14.2], t: [-2.6, 0.8, -11.9], a: 0.7, pen: 1.0, d: 5, c: YES, i: 0.8 },
    sitters: { p: [0.0, 0.4, -14.0], t: [0.0, 1.6, -11.3], a: 0.8, pen: 1.0, d: 6, c: YES, i: 1.0 },
  };
  const LAMP_GAIN = 3.0;   // the engine's spot (decay 1.5) needs more than the spec's nominal values to read
  const STATE_LAMP = { storm32: 'sleigh', golden37: 'ring', a1_after: 'sitters', credits: 'ring' };
  function lamp(name) { setLamp(name); R.lampUser = true; }
  function setLamp(name) {
    R.lamp = LAMPS[name] ? name : 'off'; R.lampOff = false;
    if (isCur() && R.lamp === 'off' && typeof world !== 'undefined') world.torchAuto = true;
    holdLamp();
  }
  const jarvisShot = () => typeof cam !== 'undefined' && cam && typeof cam.name === 'string' && cam.name.startsWith('JARVIS');
  function holdLamp() {
    if (!isCur() || typeof world === 'undefined' || jarvisShot()) return;
    const s = world.torch; if (!s) return;
    if (R.lamp === 'off') { if (!R.lampOff) { R.lampOff = true; s.intensity = 0; } return; }
    R.lampOff = false;
    const L = LAMPS[R.lamp];
    world.torchAuto = false;
    s.position.set(L.p[0], L.p[1], L.p[2]); s.target.position.set(L.t[0], L.t[1], L.t[2]);
    s.angle = L.a; s.penumbra = L.pen; s.distance = L.d; s.color.setHex(L.c); s.intensity = L.i * LAMP_GAIN;
  }

  // ---------------------------------------------------------- dressing (spec §12.2) + moods
  const MOOD = {   // deck colour, structure tint (r, g, b), puddle tint, glow colour/level, steam, wind, sky, neon/window level
    // em: an emissive lift on the structures (the parapet's inner face is in its own shade against a low WSW sun)
    storm32:  { deck: 0x4e5a58, st: [0.72, 0.8, 0.78], em: 0x000000, pud: 0x111a18, glow: 0xbfe6ff, gk: 1.0, steam: 0, wind: 1.0, sky: 'storm', lit: 0.35 },
    golden37: { deck: 0xb8a088, st: [1.5, 1.3, 1.08], em: 0x4a3624, pud: 0x7a5630, glow: YES, gk: 0.4, steam: 1, wind: 0.2, sky: 'golden', lit: 1.0 },
    a1_after: { deck: 0xa88c88, st: [1.38, 1.16, 1.08], em: 0x42302e, pud: 0x6a4040, glow: YES, gk: 0.4, steam: 0.7, wind: 0.2, sky: 'afterglow', lit: 1.0 },
    credits:  { deck: 0x6a6878, st: [0.9, 0.88, 1.0], em: 0x16141e, pud: 0x3a3450, glow: YES, gk: 0.4, steam: 0.15, wind: 0.1, sky: 'clear_night', lit: 1.0 },
  };
  const AUTO = { '3.2': 'storm32', '3.7': 'golden37', A1: 'golden37', B1: 'golden37', C: 'credits' };
  const ENV_DRESS = { storm_roof: 'storm32', golden: 'golden37', afterglow: 'a1_after', whiteout: 'golden37', credits_dusk: 'credits' };
  // The scene's start (AUTO) vs content's own calls: the first of the set's first tick in a scene or content's first
  // dress / lamp / prop call in it applies the scene's AUTO dress (and its default lamp), so a lamp('parapet') or a
  // ring.level(0.35) in a scene's first step is never clobbered by the auto dress a tick later. flow:stop forgets the
  // scene, so Continue (which restarts it at step 0) gets the scene's starting state back.
  function touch() {
    if (SETVIEW()) return;
    const sc = typeof state !== 'undefined' && state ? state.scene : null;
    if (sc === R.scene) return;
    R.scene = sc; R.lampUser = false;
    if (AUTO[sc]) dress(AUTO[sc]);
  }
  if (typeof on === 'function') on('flow:stop', () => { R.scene = undefined; });
  const DECKC = new THREE.Color(), STC = new THREE.Color();
  function dress(st, o = {}) {
    if (!MOOD[st]) st = 'storm32';
    R.state = st;
    if (!R.root) return;
    const Mo = MOOD[st], storm = st === 'storm32';
    // props
    R.sleighS = storm ? 'intact' : 'collapsed'; if (storm && !o.build) R.dropped = false;
    R.rlS = storm ? 'up' : 'fallen'; R.rlOn = storm;
    R.p1S = storm ? 'sleigh' : 'table'; R.afS = storm ? 'up' : 'flat';
    applySleigh(); applyRingLight(); applyPresents(); applyAframe();
    R.ring.visible = !storm; R.rig.visible = !storm;
    if (!o.build) {
      R.lv = R.lvTo = 1; R.lvRate = 0; R.flicker = true; R.pulse = 0; R.flare = R.flareTo = 0; R.flareRate = 0;
      R.screen = 'off'; R.trill = false; paintScreen(); if (R.lcd) R.lcd.visible = false;
      R.whiteT = -1; applyWhite(0); R.buds.visible = false; R.sunDy = 0;
      R.doorU = R.doorTo = 0; R.hatchU = R.hatchTo = 0; R.clunked = true; applyDoors(); applyHatch();
      R.windMul = 1; R.rlWob = 1;
    } else { if (R.lcd) R.lcd.visible = false; applyWhite(R.whiteT >= 0 ? Math.min(1, R.whiteT / R.whiteDur) : 0); }
    if (R.lv !== undefined) ringColours(0, true);
    R.sun.visible = st === 'golden37' || st === 'a1_after'; R.sun.position.y = 19 + R.sunDy;
    R.steam.visible = Mo.steam > 0; R.steamK = Mo.steam; R.wind = Mo.wind;
    R.flyer.visible = storm; R.clouds.visible = storm;
    // the glow, the tower, the sky
    R.glowHex = Mo.glow; M.fx.color.setHex(Mo.glow); R.glowK = Mo.gk;
    const fc = TW.fc(), dr = TW.drones(), ys = TW.yes();
    if (fc && fc.userData.set) { if (storm) { fc.userData.text('quiet'); fc.userData.set(0, 17, 0); fc.userData.run(1); } else fc.userData.zero(0); }
    if (dr && dr.userData.count) { dr.userData.count(storm ? 12 : 0); dr.userData.color('patrol'); }
    if (ys && ys.userData.lit) ys.userData.lit(true);
    const sk = R.sky.userData;
    if (R.skyMode !== Mo.sky) { skyMode(Mo.sky); R.skyMode = Mo.sky; }
    sk.lit(Mo.lit); sk.rain(false); sk.crowd(storm ? 'quiet' : 'quiet'); sk.swing(!storm); sk.bridgeLights(st === 'a1_after' || st === 'credits');
    if (R.tower.userData.lit) R.tower.userData.lit(storm ? 0.6 : st === 'credits' ? 0.8 : 0.2);
    // puddle tint + the mood targets (snapped now; update eases them if content re-dresses mid-shot)
    tc.set(Mo.pud); for (let i = 0; i < PUDDLES.length; i++) R.puddles.setColorAt(i, tc); R.puddles.instanceColor.needsUpdate = true;
    DECKC.set(Mo.deck); STC.setRGB(Mo.st[0], Mo.st[1], Mo.st[2]);
    M.deck.color.copy(DECKC); M.st.color.copy(STC); M.st.emissive.setHex(Mo.em);
    R.flashT = 10 + Math.random() * 10; R.gustT = 4 + Math.random() * 6;
    if (!o.keepLamp) setLamp(STATE_LAMP[st]);
    if (isCur()) applyAmbience(true);
  }

  // ---------------------------------------------------------- ambience per dress (the getter feeds the flow's loadSet)
  const AMB = {
    storm32: { rain: false, loops: [['wind_high', 0.85], { name: 'drone_swarm', vol: 0.5, at: [0, 12, -26] }, ['thunder_far', 0.8], ['city_far_quiet', 0.5], { name: 'lift_hum', vol: 0.35, at: [13.7, 1.2, -20.7] }], room: 'none' },
    golden37: { rain: false, loops: [['wind_soft', 0.6], ['valley_music_far', 0.7], { name: 'drone_ring', vol: 0.5, at: [0, 0.3, -19] }, { name: 'drip', vol: 0.6, at: [12.0, 3.0, -19.0] }], room: 'none' },
    a1_after: { rain: false, loops: [['valley_music_far', 0.9], ['wind_soft', 0.5], { name: 'drone_ring', vol: 0.45, at: [0, 0.3, -19] }], room: 'none' },
    credits: { rain: false, loops: [], room: 'none' },
  };
  function applyAmbience(force) {
    const k = R.state; if (!force && R.ambKey === k) return;
    R.ambKey = k;
    if (typeof AUDIO === 'undefined' || !AUDIO.ambience) return;
    const a = AMB[k]; AUDIO.ambience(a); if (AUDIO.setRoom) AUDIO.setRoom(a.room);
  }

  // ---------------------------------------------------------- update (no allocation)
  function update(dt, ctx) {
    if (!R.root || !R.fleet) return;
    const t = ctx.t, cur = isCur(), sk = skipping();
    if (SETVIEW()) { if (ctx.env !== R.env) { R.env = ctx.env; const d = ENV_DRESS[ctx.env]; if (d && d !== R.state) dress(d); R.buds.visible = d === 'a1_after'; } }   // (inspection: the earbuds lie on the cap in a1_after)
    else { touch(); R.env = ctx.env; }
    const reshown = R.lastT >= 0 && t - R.lastT > 0.5; R.lastT = t;
    if (cur) { applyAmbience(reshown); holdLamp(); }
    // tower + city
    if (R.tower.userData.update) R.tower.userData.update(dt, t);
    if (R.sky.userData.update) R.sky.userData.update(dt, t);
    if (R.skyMode === 'storm' && R.cloudsM) { R.cloudsM.color.multiplyScalar(0.55); R.cloudsM.color.g *= 1.14; }   // black-green cloud cards (reset by skyline.update every tick)
    // lightning on the far cloud cards (storm)
    if (R.state === 'storm32' && (R.flashT -= dt) <= 0) { R.flashT = 10 + Math.random() * 10; R.cflash = 0; R.cflashDur = reduceFx() ? 1.5 : 0.14; if (R.sky.userData.flash) R.sky.userData.flash(0.8 + Math.random() * 0.4); }
    if (R.clouds.visible) {   // our low storm cards take the flash too (a short spike, or the Reduce Flashing swell to <= 40%)
      let k = 0; if (R.cflash >= 0) { R.cflash += dt; const u = R.cflash / R.cflashDur; k = R.cflashDur > 1 ? 0.4 * Math.sin(Math.min(1, u) * PI) : (u < 1 ? 1 - u * 0.5 : 0); if (u >= 1) R.cflash = -1; }
      M.cloud.color.setRGB(0.06 + 0.6 * k, 0.09 + 0.6 * k, 0.075 + 0.65 * k);
    }
    // the ring: level / flare easing, then the lights
    if (R.ring.visible) {
      if (R.lvRate) { const s = dt * R.lvRate; R.lv += Math.sign(R.lvTo - R.lv) * Math.min(Math.abs(R.lvTo - R.lv), s); if (R.lv === R.lvTo) R.lvRate = 0; }
      if (R.flareRate) { R.flare += Math.sign(R.flareTo - R.flare) * Math.min(Math.abs(R.flareTo - R.flare), dt * R.flareRate); if (R.flare === R.flareTo) R.flareRate = 0; }
      ringColours(t, R.pulse > 0 || R.flare > 0 || R.lvRate > 0 || R.flareRate > 0);
    }
    // wind: garland tufts, the ring light, the A-frame, the flyer
    const wk = R.wind * R.windMul;
    if (R.sleighA.visible) {
      for (let i = 0; i < NTU; i++) {
        const u = TUFT[i], a = wk * 0.25 * Math.sin(t * TAU * u[4] * 0.5 + u[3]);
        ev.set(a, 0, a * 0.6); m5.compose(pv.set(u[0], u[1], u[2]), qv.setFromEuler(ev), sv.set(1, 1, 1)); R.tufts.setMatrixAt(i, m5);
      }
      R.tufts.instanceMatrix.needsUpdate = true;
    }
    if (R.rlUp.visible) { const w = wk * R.rlWob; R.rlUp.rotation.set(0.04 * w * Math.sin(t * 2.3), 0, 0.04 * w * Math.sin(t * 1.7 + 1)); }
    if (R.afS !== 'flat') R.aframe.rotation.x = 0.035 * wk * Math.sin(t * 2.9) * Math.max(0, Math.sin(t * 0.7));
    if (R.flyer.visible) flyerTick(dt, t);
    // the hatch, the lift doors
    if (R.hatchU !== R.hatchTo) {
      const s = dt / 1.4; R.hatchU = R.hatchTo > R.hatchU ? Math.min(R.hatchTo, R.hatchU + s) : Math.max(R.hatchTo, R.hatchU - s);
      if (!R.clunked && R.hatchU >= 0.9) { R.clunked = true; if (!sk && typeof sfx === 'function') sfx('clunk', { vol: 0.9, at: [8.0, 0.3, -12.9] }); }
      applyHatch();
    }
    if (R.doorU !== R.doorTo) { const s = dt / 1.2; R.doorU = R.doorTo > R.doorU ? Math.min(R.doorTo, R.doorU + s) : Math.max(R.doorTo, R.doorU - s); applyDoors(); }
    // the whiteout
    if (R.whiteT >= 0) { R.whiteT = Math.min(R.whiteDur, R.whiteT + dt); applyWhite(R.whiteT / R.whiteDur); }
    // puddles: a slow turn of the ripple decal (storm faster)
    { const sp = R.state === 'storm32' ? 0.05 : 0.015;
      for (let i = 0; i < PUDDLES.length; i++) { const p = PUDDLES[i]; m5.compose(pv.set(p[0], 0.015, p[1]), qv.setFromAxisAngle(sv.set(0, 1, 0), i * 1.3 + t * sp * (i & 1 ? 1 : -1)), sv.set(p[2], 1, p[2] * 0.8)); R.puddles.setMatrixAt(i, m5); }
      R.puddles.instanceMatrix.needsUpdate = true; }
    // the countdown glow breathes with the band's seconds (storm)
    if (world.camera) R.glow.visible = world.camera.position.z < -10.95;   // from outside, the band itself is the glow (the quad would veil the facade)
    { let k = R.glowK; if (R.state === 'storm32') { const cd = R.tower.userData.countdown, s = cd ? cd.secs : t; k *= 0.9 + 0.1 * Math.cos((s % 1) * TAU); } M.fx.opacity = Math.min(1, k * 0.55); }
    // steam
    if (R.steam.visible) steamTick(dt);
    // the brick phone's LCD at the double trill's rhythm (0.4 on, 0.2 off, 0.4 on, 2.0 off)
    if (R.trill && R.lcd) { R.trillT = (R.trillT + dt) % 3.0; const x = R.trillT; R.lcd.visible = x < 0.4 || (x > 0.6 && x < 1.0); }
    if (R.screen === 'call') M.screen.emissiveIntensity = 0.75 + 0.25 * Math.sin(t * 5);
    if (R.lcd && !R.trill && R.lcd.visible) R.lcd.visible = false;
  }
  function steamTick(dt) {
    const cam0 = typeof world !== 'undefined' ? world.camera : null; if (!cam0) return;
    const k = R.steamK;
    for (let i = 0; i < NST; i++) {
      STM.age[i] += dt;
      if (STM.age[i] >= STM.life[i]) steamSpawn(i, false);
      const u = STM.age[i] / STM.life[i];
      STM.y[i] += 0.22 * dt; STM.x[i] += STM.vx[i] * dt;
      const a = Math.sin(u * PI) * k * 0.3, s = STM.s[i] * (1.0 + 0.8 * u);   // spec: #fff2dc @ 0.25 additive
      m5.compose(pv.set(STM.x[i], STM.y[i], STM.z[i]), cam0.quaternion, sv.set(s, s, s)); R.steam.setMatrixAt(i, m5);
      R.steam.setColorAt(i, tc.setRGB(a, a * 0.95, a * 0.86));
    }
    R.steam.instanceMatrix.needsUpdate = true; R.steam.instanceColor.needsUpdate = true;
  }
  function flyerTick(dt, t) {
    const f = R.flyer;
    if (FLY.t < 0) {
      if ((R.gustT -= dt) > 0) return;
      R.gustT = 8 + Math.random() * 7;
      FLY.x0 = f.position.x; FLY.z0 = f.position.z;
      if (FLY.over || FLY.x0 < -12) { FLY.x0 = 13.2; FLY.z0 = -16.6; FLY.over = false; }
      const d = 5 + Math.random() * 4, a = -H - 0.25 + Math.random() * 0.6;   // westward, a bit north or south
      FLY.x1 = FLY.x0 + Math.sin(a) * d; FLY.z1 = Math.min(-11.9, Math.max(-34, FLY.z0 + Math.cos(a) * d));
      FLY.over = FLY.z1 > -12.4 && Math.random() < 0.5; FLY.t = 0; FLY.dur = 2.0 + Math.random() * 1.2;
      f.visible = true;
    }
    FLY.t += dt; const u = Math.min(1, FLY.t / FLY.dur), e = 1 - (1 - u) * (1 - u);
    const lift = FLY.over ? u * u * 3.5 : Math.abs(Math.sin(u * PI * 2.5)) * 0.35 * (1 - u);
    f.position.set(FLY.x0 + (FLY.x1 - FLY.x0) * e, 0.012 + lift, FLY.z0 + (FLY.z1 - FLY.z0) * e + (FLY.over ? u * u * 2 : 0));
    f.rotation.set(Math.sin(t * 9) * 0.8 * (1 - u), t * 3, Math.cos(t * 7) * 0.6 * (1 - u));
    if (u >= 1) { FLY.t = -1; if (FLY.over) f.position.set(13.2, 0.012, -16.6); f.rotation.set(0, f.rotation.y, 0); }
  }

  // ---------------------------------------------------------- data
  return {
    env: {
      storm_roof:   { bg: 0x1c2420, fog: [0x26302c, 0.0024], hemi: [0x8aa496, 0x1a201c, 1.35], dir: [0xb4ccbc, 0.9, [-20, 60, 30]], spot: [0xffffff, 1.1], rain: 0 },
      golden:       { bg: 0xe2a860, fog: [0xe8b47a, 0.0019], hemi: [0xffe6c8, 0x4a3a44, 1.1], dir: [0xffa850, 2.1, [-60, 8, 28]], spot: [0xffd21f, 0.9], rain: 0 },
      afterglow:    { bg: 0xc8848a, fog: [0xc89090, 0.0019], hemi: [0xf0c4b8, 0x3a2c3a, 0.80], dir: [0xff9a78, 0.70, [-60, 3, 28]], spot: [0xffd21f, 1.1], rain: 0 },
      whiteout:     { bg: 0xffffff, fog: [0xffffff, 0.0800], hemi: [0xffffff, 0xffffff, 2.00], dir: [0xffffff, 1.00, [0, 10, 0]], spot: [0xffffff, 0], rain: 0 },
      credits_dusk: { bg: 0x2a2a4a, fog: [0x3a3450, 0.0022], hemi: [0x8a88b0, 0x18141c, 0.60], dir: [0xd8a0a0, 0.25, [-60, 2, 28]], spot: [0xffd21f, 1.0], rain: 0 },
    },
    build, dress(st) { touch(); dress(st); }, lamp(name) { touch(); lamp(name); }, ring: RING,
    marks: {
      // 3.2_roof
      s32r_car_luka: [13.2, 0, -20.7, -H], s32r_car_chase: [13.9, 0, -20.1, -H], s32r_car_c40: [13.9, 0, -21.3, -H],
      s32r_doorway: [11.6, 0, -20.7, -H],   // (not in the spec) a via-point: the car's marks reach s32r_out_chase/_c40 through the doors
      s32r_out_luka: [11.1, 0, -20.7, -2.2], s32r_out_chase: [11.4, 0, -19.5, -2.4], s32r_out_c40: [11.5, 0, -21.9, -2.0],
      s32r_hatch_luka: [8.0, 0, -13.95, 0], s32r_drop: [9.3, 0, -13.75, 0.79],
      s32r_chase: [6.6, 0, -14.4, 1.2], s32r_c40: [7.0, 0, -15.6, 0.8],
      s32r_hatch_in: [8.0, -0.6, -13.05, PI],
      // 3.7
      s37_chase_remote: [0.0, 0, -18.3, PI], s37_luka_sit: [-2.4, 0, -11.9, PI], s37_l40_kneel: [-1.65, 0, -12.35, -1.03],
      s37_l40_edge: [3.8, 0, -11.95, 0], s37_c40_edge: [4.6, 0, -11.95, 0], s37_l40_sit: [-3.2, 0, -11.9, PI],
      s37_st_chase: [-0.3, 0, -18.25, PI], s37_st_luka: [0.5, 0, -17.9, -2.66], s37_st_l40: [0.95, 0, -17.45, -2.6], s37_st_c40: [-0.95, 0, -17.45, 2.6],
      s37_f_chase: [-0.9, 0, -18.95, H], s37_f_luka: [0.9, 0, -18.95, -H], s37_f_l40: [3.8, 0, -11.95, PI], s37_f_c40: [4.6, 0, -11.95, PI],
      // A1 / B1
      a1_luka: [0.6, 0, -17.6, -2.4], a1_l40: [1.3, 0, -16.9, 0.75], a1_chase: [-0.6, 0, -17.6, 2.4], a1_c40: [-1.3, 0, -16.9, -0.75],
      a1_dial: [0.0, 0, -18.3, PI], a1_sit_l40: [-0.45, 1.2, -11.25, 0], a1_sit_c40: [0.45, 1.2, -11.25, 0],
      a1_earbuds: [0.05, 1.205, -11.3, 0], b1_luka_lanyard: [0.6, 0, -17.6, -2.4],
    },
    anchors: {
      s32r_lift_open:   { at: [12.0, 1.3, -20.7], from: [7.6, 1.6, -18.6], fov: 46 },
      s32r_crane_a:     { at: [2.0, 0.5, -24.0], from: [-4.6, 6.5, -38.5], fov: 50 },
      s32r_crane_b:     { at: [6.0, -6.0, 6.0], from: [-6.0, 9.5, -31.0], fov: 54 },
      s32r_feet:        { at: [6.0, -7.0, -11.0], from: [4.0, 1.0, 24.0], fov: 46 },
      facade_countdown: { at: [0.0, -19.0, -10.7], from: [0.0, -17.0, 26.0], fov: 36 },
      roof_hatch:       { at: [8.0, 0.1, -12.9], from: [9.1, 1.95, -14.8], fov: 44 },
      s32r_drop_shot:   { at: [9.6, 1.15, -13.2], from: [8.05, 1.6, -12.0], fov: 46 },
      sleigh:           { at: [11.1, 0.85, -12.4], from: [9.7, 1.7, -17.8], fov: 46 },
      yes_sign:         { at: [0.0, 6.0, -36.0], from: [0.0, 2.0, -20.0], fov: 40 },
      s37_crane_a:      { at: [0.0, 0.0, -16.0], from: [2.0, 15.0, -44.0], fov: 52 },
      s37_crane_b:      { at: [0.0, -4.0, 10.0], from: [-3.0, 6.0, -33.0], fov: 56 },
      s37_remote_mid:   { at: [0.0, 0.7, -18.9], from: [-2.2, 1.5, -16.6], fov: 44 },
      s37_bandage:      { at: [-2.05, 0.72, -12.1], from: [-3.15, 1.18, -14.0], fov: 42 },
      s37_sorry_two:    { at: [4.25, 1.45, -11.95], from: [1.5, 1.75, -9.75], fov: 32 },
      s37_c40_close:    { at: [4.6, 1.6, -11.95], from: [5.6, 1.62, -9.9], fov: 34 },
      s37_staying_two:  { at: [-2.8, 0.68, -11.9], from: [-2.8, 0.78, -16.0], fov: 32 },
      s37_check:        { at: [-0.12, 0.72, -18.81], from: [0.65, 1.55, -17.85], fov: 40 },
      remote_screen:    { at: [-0.12, 0.72, -18.78], from: [-0.12, 0.9, -19.5], fov: 46 },
      s37_fears_wide:   { at: [0.0, 1.1, -17.0], from: [0.0, 2.6, -23.4], fov: 52 },
      s37_hands:        { at: [0.0, 0.66, -18.9], from: [0.0, 1.35, -19.75], fov: 36 },
      s37_roof_wide_low: { at: [0.0, 1.0, -17.0], from: [-9.0, 1.6, -25.6], fov: 56 },
      a1_split_roof:    { at: [0.2, 1.0, -18.2], from: [-6.5, 3.4, -7.2], fov: 50 },
      a1_parapet_wide:  { at: [0.0, 1.2, -11.3], from: [0.0, 5.2, -27.0], fov: 46 },
      a1_hands_slate:   { at: [0.42, 1.48, -11.0], from: [1.0, 2.4, -10.3], fov: 36 },
      a1_behind:        { at: [0.0, -10.1, 40.0], from: [0.0, 5.0, -20.5], fov: 48 },
      a1_earbuds:       { at: [0.05, 1.21, -11.3], from: [0.6, 1.5, -12.0], fov: 30 },
      credits_ring_a:   { at: [0.0, 0.0, -19.0], from: [0.0, 9.0, -30.0], fov: 50 },
      credits_ring_b:   { at: [0.0, 0.4, -19.0], from: [-8.0, 3.0, -8.0], fov: 50 },
      a2_print:         { at: [0.0, 0.8, -18.0], from: [6.0, 8.5, -7.0], fov: 48 },
    },
    cams: {
      roof_wide: { type: 'fixed', pos: [-9.0, 1.6, -25.6], look: [0.0, 1.0, -17.0], fov: 56 },
      roof_car:  { type: 'fixed', pos: [14.8, 2.3, -21.8], look: [12.0, 1.2, -20.4], fov: 70 },
    },
    zones: [
      { box: [12.4, -22.0, 15.0, -19.4], cam: 'roof_car' },
      { box: [-17.55, -35.0, 17.55, -11.45], cam: 'roof_wide' },
    ],
    colliders: COL,
    props: [
      'lift_doors', 'maint_hatch', 'sleigh', 'santa_hat', 'santa_beard', 'ring_light', 'presents', 'photo_set', 'aframe', 'ring',
      'remote_rig', 'whiteout', 'earbuds', 'countdown_glow', 'sun', 'puddles', 'steam', 'vents', 'anchors_ring', 'flyer', 'storm_clouds',
      'ring_pools', 'garland', 'tower', 'skyline',
    ],
    get ambience() { return AMB[R.state] || AMB.storm32; },
    update,
  };
})();
