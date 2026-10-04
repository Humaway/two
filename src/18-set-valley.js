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
//
// THE SET (SETS.valley): { env, build, marks, anchors, cams, zones, colliders, floor, props, ambience, update, dress(state),
// lamp(name), neon(k, dur = 2), VG, tower, skyline, countdown, creaks, paths, ar, state (getter) }.
// ENV presets: quiet (default; 2.8 street) · starlight (2.8 inside, dusty) · lights_out (2.9 inside) · annst (2.9 door,
//   outside) · three_am · dawn (2.10; the high window's neon patches ease over to a grey-blue daylight layer and the
//   glass greys to day) · lit (3.6, rain) · lit_dry (credits) · gig (credits). Spot intensities are scaled
//   for physical falloff (6–30, Rue's range); the env sets the spot's colour/intensity, lamp() its geometry.
// DRESS states (auto on scene change: 2.8 quiet28, 2.9 night29, 2.10 three210; with no scene, as in ?setview, the env
//   picks one): quiet28 · transit28 · dusty28 · night29 · three210 · lit36 · credits_neon · gig.
// LAMPS (the one spot): bench · torch · neon · door · slate · gig · off (picked from the env automatically too).
// MARKS: s28_enter_luka/_chase/_c40 s28_hear_luka/_chase s28_c40_stop s28_mia s28_plan_chase/_c40/_luka s28_cp
//   s28_c40_read s28_drop s28_pick s28_climb_0/_1/_2 s28_uke_back s28_uke_sample s28_leave_luka/_chase/_c40
//   whisper_bench_a/_b whisper_queue_a/_b · s28_t_head s28_t_gate_luka/_chase/_c40 s28_t_cross s28_door_out(_chase/_c40)
//   s28_in(_chase/_c40) · sl_posters sl_desk sl_stage_look sl_kettle sl_couch · s29_chase s29_luka s29_c40 s29_luka_reach
//   s29_bar s29_note_drop s29_door_in s29_doorway s29_luka_turn s29_chase_wing s29_chase_close s29_c40_eyes ·
//   s210_c40_desk s210_chase_amp s210_luka_sleep · cr_mia_stage s36_passerby s36_phone s36_laugh_1…4 · kettle kettle_sl.
//   Lying marks: ry 0 lays the head toward −Z (ANIMS.lie rotates the body back from the facing).
// ANCHORS: s28_crane_a/_b/_c s28_track_a/_b s28_mia_mid s28_c40_close s28_confiscate s28_safebox s28_db_meter s28_box_code
//   s28_box_keypad s28_plan_mid s28_c40_watch s28_cafe_table s28_climb s28_qr s28_leave napclub lanterns tower_countdown
//   tower_from_mall s28_gate_track_a/_b s28_stage_door_ext urn · sl_wide_dusty sl_posters sl_poster_hero sl_desk sl_stage
//   sl_kettle · s29_floor s29_floor_end s29_c40_dark s29_coaster s29_window s29_door_out s29_reverse s29_luka_close
//   s29_hands s29_door_wide · s210_wide_stage s210_desk_two s210_slate s210_chase_close s210_c40_close s210_locked sl_clock
//   · s36_passerby_pov s36_mall_above s36_lanterns cr_valley_neon cr_starlight_gig.
// CAMS (first = default): mall_head mall_puzzle (fixed: the noise drone's cone stays put) mall_south ct_gate
//   starlight_front tower_front · sl_hi_front sl_hi_back sl_stage sl_wing sl_green · sl_lo_front sl_lo_bar sl_lo_wing.
//   ZONES 0–4 (wing, green room, stage, floor stage half, floor bar half) switch high/low cams with dress (night29 = low);
//   5–14 the street (mall head / puzzle / south, S footpaths, Chinatown pocket, zebras, N footpath). The road has none.
// PROPS (world.prop(name).userData): pole_mia {meter(db|null), wobble(a)} · safebox_mia {door(u), content('uke'|null),
//   led('red'|'green'), press(key)} · safebox_b/_c · uke_prop {follow(obj, [ox,oy,oz]), place('safebox'|[x,y,z]), hide()}
//   · phone_drop {show(b), pulse(on, k)} · cafe · urn {steam()} · shush_drones {on(b)} · whisperers {on(b), mode('quiet'|
//   'lit'|''), rigs} · crowd_far {mode('quiet'|'look_up')} · neon_mall · neon_annst · napclub_sign · blade_starlight
//   {lit(b)} · karaoke_neon (skyline SW1) · reflections · lanterns {swing(on, amp?)} · gate · lions · gust · bollards ·
//   lamps · trees_mall · traffic {count(n), stop(b)} · tower · skyline · sky_flash {rate(r), flash(k)} · rain {at(x, z)} ·
//   stage_door {open(u)} · door_bulkhead {on(b)} · window_light {light(hex, k)} · window_glass · coats_sleep {show(mask:
//   1 Chase, 2 Luka, 4 Chase (2040)), lift(i, u)} · coaster {write(), place('bar'|'chest_chase'|[x,y,z])} · creak_boards
//   {show(b)} · foh_desk {state('dead'|'half'|'live'), level(k)} · desk_cables · slate_desk {screen('off'|'seq'|'export'|
//   'saved'), slide(u), scr (the raw screen)} · headphones_desk {show(b)} · amp_seat · mirror_ball {sparkle(k)} ·
//   truss_pars {on(b)} · crowd_gig {on(b)} · exit_signs {on(b)} · bulkheads {on(b)} · wall_clock_sl {set(h, m)} · posters
//   · green_room {kettle_steam()} · kettle_sl · region_m / m_ann / m_mall / m_ct / region_s / region_f (dress only).
// PATHS (V.paths, [x, z] or [x, y, z] lists): d28_swoop d28_high_a/_b walk_mall shush_loop gust traffic_east/_west
//   walk_starlight sneak29 to_desk to_posters to_stage. Inside, moveTo has no pathfinding: route via these.
// AMBIENCE (03-audio names): street crowd_whisper + thunder + hum + hover_traffic · inside hum/thunder (muffled) with the
//   rain kind 'roof' · night29 thunder (+ rain_street while the stage door is open) · lit city + rain 'street'.
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
    // tower window lights (additive): rows 0 + 3 dim-lit (a few warm rooms), 1 lit offices (cool), 2 L30 (docked-drone blue dots)
    ST.towerLit = canvasTex(256, 256, (c) => {
      const r = rng(77);
      c.fillStyle = '#000'; c.fillRect(0, 0, 256, 256);
      // lit rooms: runs of modules in one colour, a ceiling glow fading down, blinds on some (rows 0 and 3 dim, 1 offices)
      for (const row of [0, 1, 3]) {
        let m = 0;
        while (m < 8) {
          const run = 1 + ((r() * (row === 1 ? 4 : 2.5)) | 0);
          if (r() < (row === 1 ? 0.6 : 0.3)) {
            const warm = row === 1 ? r() < 0.25 : r() < 0.7, k = row === 1 ? 0.38 + r() * 0.3 : 0.25 + r() * 0.3, blinds = r() < 0.35;
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
      c.fillStyle = '#2a3a52'; c.fillRect(0, 0, 64, 64);
      for (let i = 0; i < 90; i++) { c.fillStyle = r() < 0.5 ? 'rgba(120,150,190,0.35)' : r() < 0.5 ? 'rgba(255,200,140,0.35)' : 'rgba(255,90,170,0.25)'; c.fillRect((r() * 64) | 0, (r() * 64) | 0, 3 + ((r() * 8) | 0), 1); }
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
        const k = r(), lrow = n === 30 ? 2 : k < 0.62 ? -1 : k < 0.76 ? 0 : k < 0.9 ? 3 : 1;
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
    storm:        { z: 0x14142a, h: 0x2a2440, b: 0x1a1830, c: 0x34304a, co: 0.85, u: 0.55, band: 0x16141f, sun: 0, day: 1 },
    midday_storm: { z: 0x3a4248, h: 0x6e6a78, b: 0x4a4852, c: 0x5a5e66, co: 0.9, u: 0.08, band: 0x3a3c44, sun: 0, day: 0.35 },
    golden:       { z: 0x6a86b0, h: 0xf0c890, b: 0xc8a070, c: 0xf4d8b0, co: 0.7, u: 0, band: 0x6a5850, sun: 1, day: 0.3 },
    clear_night:  { z: 0x04060f, h: 0x141a30, b: 0x0c1020, c: 0x1a1e30, co: 0.25, u: 0.3, band: 0x0c0e18, sun: 0, day: 1 },
    dawn:         { z: 0x3a4a68, h: 0xb8a8b8, b: 0x6a6878, c: 0x8a90a8, co: 0.7, u: 0.05, band: 0x2a2e3c, sun: 0.4, day: 0.6 },
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
        rv.color(0xb8c4dc).quad(rx0, ry, rz0, rx1, ry, rz1, lx1, ry, lz1, lx0, ry, lz0, u, 0, u + du, 1);
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
      st.mode = mode; st.cloudBase = P.c; st.day = P.day;
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
        S.neon.color.setScalar(lv); S.karaoke.color.setScalar(Math.min(1, lv * 1.1)); S.cityLit.color.setScalar(win * 0.9 * (st.day ?? 1)); S.bridgeLit.color.setScalar(0.4 + 0.6 * (st.day ?? 1));
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
  let T = null, M = null, WH = null, NAPP = [0.3, 0.42];

  // ---------------------------------------------------------- painted textures (128–256 px, nearest)
  const tube = (c, col, w, fn, glow = 0.28) => {   // a neon tube: a soft wide pass, then the core
    c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = col;
    c.globalAlpha = glow; c.lineWidth = w * 2.6; c.beginPath(); fn(); c.stroke();
    c.globalAlpha = 1; c.lineWidth = w; c.beginPath(); fn(); c.stroke();
  };
  const arglyph = (c, x, y, s = 1) => {   // the tiny AR glyph on blank 2040 signs (the words live in Chip View)
    c.strokeStyle = '#bfe6ff'; c.lineWidth = 1.2 * s; c.beginPath(); c.moveTo(x, y - 4 * s); c.lineTo(x + 4 * s, y); c.lineTo(x, y + 4 * s); c.lineTo(x - 4 * s, y); c.closePath(); c.stroke();
    c.fillStyle = '#bfe6ff'; c.fillRect(x - 1 * s, y - 1 * s, 2 * s, 2 * s);
  };
  function textures() {
    if (T) return T;
    T = {};
    const K = (k, o = {}) => ({ key: 'vl_' + k, nearest: true, ...o });
    // ---- shop window cards: 8 cells of 128 × 64 (2 columns × 4 rows)
    const shopCell = (c, i, fn) => { const x = (i % 2) * 128, y = (i >> 1) * 64; c.save(); c.translate(x, y); c.beginPath(); c.rect(0, 0, 128, 64); c.clip(); fn(c); c.restore(); };
    const lit = (c, top, bot) => { const g = c.createLinearGradient(0, 0, 0, 64); g.addColorStop(0, top); g.addColorStop(1, bot); c.fillStyle = g; c.fillRect(0, 0, 128, 64); };
    const shutter = (c, col, dk) => { c.fillStyle = col; c.fillRect(0, 0, 128, 64); for (let y = 2; y < 64; y += 4) { c.fillStyle = dk; c.fillRect(0, y, 128, 1); } c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(0, 58, 128, 6); };
    T.shops = canvasTex(256, 256, (c) => {
      const r = rng(41);
      shopCell(c, 0, (c) => {   // dumpling house: steam, bamboo baskets, a red lantern
        lit(c, '#f0c88a', '#b0784a');
        c.fillStyle = '#5a2a1a'; c.fillRect(0, 44, 128, 20);
        for (let i = 0; i < 6; i++) for (let k = 0; k < 3 - (i % 2); k++) { const x = 14 + i * 18, y = 40 - k * 7; c.fillStyle = '#c8a060'; c.fillRect(x, y, 15, 6); c.fillStyle = '#8a6a3a'; c.fillRect(x, y + 5, 15, 1); }
        c.fillStyle = 'rgba(255,255,255,0.5)'; for (let i = 0; i < 9; i++) { c.beginPath(); c.arc(20 + i * 11, 18 - (i % 3) * 3, 5 + (i % 2) * 2, 0, TAU); c.fill(); }
        c.fillStyle = '#c8261f'; c.beginPath(); c.ellipse(112, 12, 7, 9, 0, 0, TAU); c.fill(); c.fillStyle = '#c9a54a'; c.fillRect(106, 3, 12, 2); c.fillRect(106, 20, 12, 2);
      });
      shopCell(c, 1, (c) => {   // 24/7: cool shelves
        lit(c, '#d8f0ff', '#8ab0c8');
        for (let s = 0; s < 4; s++) { c.fillStyle = '#5a6a78'; c.fillRect(0, 12 + s * 13, 96, 2); for (let x = 2; x < 94; x += 5) { c.fillStyle = ['#e85a5a', '#5ab4e8', '#f0d050', '#6ad06a', '#e8e8e8', '#c86ad0'][(r() * 6) | 0]; c.fillRect(x, 4 + s * 13, 4, 8); } }
        c.fillStyle = '#bfe6ff'; c.fillRect(100, 4, 26, 56); c.fillStyle = '#7a9ab0'; c.fillRect(112, 4, 2, 56);
        for (let y = 8; y < 58; y += 9) for (let x = 102; x < 126; x += 6) { c.fillStyle = r() < 0.5 ? '#e8f8ff' : '#5ac8a0'; c.fillRect(x, y, 4, 6); }
      });
      shopCell(c, 2, (c) => {   // the closed bar: roller shutter + a sprayed SHHH tag
        shutter(c, '#5a5e64', '#43464c');
        c.font = FONT(30); c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
        c.lineWidth = 5; c.strokeStyle = '#1a6a64'; c.strokeText('SHHH', 64, 30); c.fillStyle = '#ff6ab8'; c.fillText('SHHH', 64, 30);
        c.fillStyle = '#ff6ab8'; for (const x of [34, 52, 71, 90]) c.fillRect(x, 42, 1, 6 + (x % 7));
      });
      shopCell(c, 3, (c) => {   // NAP CLUB: three pods, sleepers under blankets
        lit(c, '#6a5a9a', '#3a2e5a');
        for (let i = 0; i < 3; i++) {
          const x = 6 + i * 41; c.fillStyle = '#e8e4f4'; c.beginPath(); c.roundRect ? c.roundRect(x, 16, 36, 30, 12) : c.rect(x, 16, 36, 30); c.fill();
          c.fillStyle = '#3a3050'; c.beginPath(); c.roundRect ? c.roundRect(x + 3, 19, 30, 24, 10) : c.rect(x + 3, 19, 30, 24); c.fill();
          c.fillStyle = ['#8ab4e8', '#e8a0c0', '#a0d8b0'][i]; c.fillRect(x + 10, 30, 22, 9); c.fillStyle = '#e8c0a0'; c.beginPath(); c.arc(x + 9, 31, 4, 0, TAU); c.fill();
          c.fillStyle = 'rgba(255,240,200,0.7)'; c.beginPath(); c.arc(x + 30, 22, 2.5, 0.6, 5.2); c.fill();
        }
        c.fillStyle = '#2a2240'; c.fillRect(0, 52, 128, 12);
      });
      shopCell(c, 4, (c) => {   // records: shuttered, a padlock, stickers
        shutter(c, '#3e3a44', '#2c2930');
        c.fillStyle = '#c9a54a'; c.fillRect(60, 50, 8, 7); c.strokeStyle = '#c9a54a'; c.lineWidth = 2; c.beginPath(); c.arc(64, 50, 3, PI, 0); c.stroke();
        for (const [x, y, col] of [[12, 14, '#e85a9a'], [100, 22, '#5ae8d0'], [30, 36, '#f0d050'], [84, 10, '#ffffff']]) { c.fillStyle = col; c.globalAlpha = 0.6; c.fillRect(x, y, 10, 7); c.globalAlpha = 1; }
      });
      shopCell(c, 5, (c) => {   // bank ATM: stone surround, a blank screen
        c.fillStyle = '#8a8478'; c.fillRect(0, 0, 128, 64); c.fillStyle = '#7a7468'; for (let x = 0; x < 128; x += 32) c.fillRect(x, 0, 1, 64);
        c.fillStyle = '#2a2c30'; c.fillRect(44, 8, 40, 44); c.fillStyle = '#1a3a5a'; c.fillRect(50, 12, 28, 18); c.fillStyle = '#3a6a9a'; c.fillRect(52, 14, 24, 2);
        c.fillStyle = '#5a5c60'; for (let i = 0; i < 12; i++) c.fillRect(53 + (i % 3) * 8, 33 + ((i / 3) | 0) * 4, 6, 3);
        c.fillStyle = '#1a1c20'; c.fillRect(4, 6, 34, 52); c.fillRect(90, 6, 34, 52);
      });
      shopCell(c, 6, (c) => {   // QUIET CUP: chairs up on the tables, the machine on the counter
        lit(c, '#5a4a3a', '#2e2620');
        c.fillStyle = '#c8b090'; c.fillRect(0, 38, 128, 3);
        for (let i = 0; i < 4; i++) { const x = 8 + i * 30; c.fillStyle = '#8a6a4a'; c.fillRect(x, 26, 22, 3); c.fillRect(x + 10, 29, 2, 10); c.fillStyle = '#4a3a2e'; c.fillRect(x + 2, 14, 2, 12); c.fillRect(x + 16, 14, 2, 12); c.fillRect(x + 2, 14, 16, 2); c.fillRect(x + 2, 20, 16, 2); }
        c.fillStyle = '#9aa0a8'; c.fillRect(96, 44, 22, 14); c.fillStyle = '#2a2a2a'; c.fillRect(100, 48, 14, 6);
        c.fillStyle = 'rgba(255,220,170,0.25)'; c.fillRect(0, 0, 128, 10);
      });
      shopCell(c, 7, (c) => {   // kebabs: the spit, a counter, a blank menu board
        lit(c, '#e8b070', '#8a5030');
        c.fillStyle = '#6a3a1e'; c.beginPath(); c.moveTo(24, 10); c.lineTo(38, 10); c.lineTo(34, 50); c.lineTo(28, 50); c.fill();
        c.fillStyle = '#a05a2a'; for (let y = 12; y < 50; y += 5) c.fillRect(25 + (y - 10) * 0.1, y, 12 - (y - 10) * 0.15, 2);
        c.fillStyle = '#c0c4c8'; c.fillRect(30, 4, 2, 52); c.fillStyle = '#3a3a3a'; c.fillRect(56, 6, 64, 26);
        c.fillStyle = '#e8e0c8'; for (let i = 0; i < 5; i++) c.fillRect(60, 10 + i * 4.5, 30 + (i * 13) % 24, 2);
        c.fillStyle = '#d8d8d8'; c.fillRect(0, 50, 128, 14); c.fillStyle = '#9a9a9a'; c.fillRect(0, 50, 128, 2);
      });
    }, K('shops'));
    T.shops2 = canvasTex(256, 256, (c) => {
      const r = rng(43);
      shopCell(c, 0, (c) => {   // phone repairs: a wall of phones
        lit(c, '#cfe8ff', '#7a98b0');
        for (let y = 6; y < 40; y += 11) for (let x = 6; x < 120; x += 9) { c.fillStyle = '#20242a'; c.fillRect(x, y, 7, 10); c.fillStyle = r() < 0.4 ? '#6ab8ff' : '#2a3a4a'; c.fillRect(x + 1, y + 1, 5, 7); }
        c.fillStyle = '#e8ecf0'; c.fillRect(0, 46, 128, 18); c.fillStyle = '#9aa4ae'; c.fillRect(0, 46, 128, 2);
      });
      shopCell(c, 1, (c) => {   // whisper bar: dim teal, bottles, heads leaning in
        lit(c, '#1e4a48', '#0c2224');
        for (let i = 0; i < 20; i++) { const x = 4 + i * 6.2; c.fillStyle = '#0a1a1a'; c.fillRect(x, 10, 4, 12); c.fillStyle = '#5ae8d6'; c.fillRect(x + 1, 11, 1, 3); }
        c.fillStyle = '#2a1a14'; c.fillRect(0, 40, 128, 6);
        for (const x of [30, 44, 80, 93]) { c.fillStyle = '#0a1012'; c.beginPath(); c.arc(x, 32, 6, 0, TAU); c.fill(); c.fillRect(x - 6, 36, 12, 10); }
      });
      shopCell(c, 2, (c) => {   // Chinatown restaurant: red, lanterns, round tables
        lit(c, '#c84a2a', '#6a1a12');
        for (const x of [20, 64, 108]) { c.fillStyle = '#ff6a3a'; c.beginPath(); c.ellipse(x, 10, 6, 7, 0, 0, TAU); c.fill(); c.fillStyle = '#c9a54a'; c.fillRect(x - 5, 2, 10, 2); }
        for (const x of [28, 72, 112]) { c.fillStyle = '#f4ece0'; c.beginPath(); c.ellipse(x, 42, 16, 4, 0, 0, TAU); c.fill(); c.fillStyle = '#3a1a10'; c.fillRect(x - 1, 44, 2, 14); }
        c.fillStyle = '#c9a54a'; c.fillRect(0, 60, 128, 4);
      });
      shopCell(c, 3, (c) => {   // grocer: crates of produce under a red/gold trim
        lit(c, '#d8b070', '#7a5030');
        c.fillStyle = '#b0201e'; c.fillRect(0, 0, 128, 8); c.fillStyle = '#c9a54a'; c.fillRect(0, 8, 128, 2);
        for (let i = 0; i < 7; i++) { const x = 3 + i * 18, col = ['#e88a2a', '#6ab04a', '#d8382a', '#e8d04a', '#8a4ab0', '#5aa04a', '#e86a3a'][i]; c.fillStyle = '#6a4a2a'; c.fillRect(x, 40, 16, 20); c.fillStyle = col; for (let k = 0; k < 6; k++) { c.beginPath(); c.arc(x + 3 + (k % 3) * 5, 38 + ((k / 3) | 0) * 4, 2.6, 0, TAU); c.fill(); } }
        for (let i = 0; i < 8; i++) { c.fillStyle = '#e8d8a0'; c.fillRect(8 + i * 15, 12, 2, 10 + (i % 3) * 4); }
      });
      shopCell(c, 4, (c) => {   // the shuttered corner pub: green shutter, a big padlock
        shutter(c, '#2e4a3a', '#22382c');
        c.fillStyle = '#c9a54a'; c.fillRect(58, 48, 12, 9); c.strokeStyle = '#c9a54a'; c.lineWidth = 2.5; c.beginPath(); c.arc(64, 48, 4, PI, 0); c.stroke();
        c.fillStyle = 'rgba(230,220,200,0.35)'; c.fillRect(10, 10, 18, 24); c.fillRect(96, 14, 16, 20);
      });
      shopCell(c, 5, (c) => {   // the bank's front: closed glass doors, a dim lobby, a padded bench
        lit(c, '#3a4450', '#1e242c');
        c.fillStyle = '#5a6470'; c.fillRect(40, 4, 2, 56); c.fillRect(64, 4, 2, 56); c.fillRect(88, 4, 2, 56);
        c.fillStyle = '#efe6d0'; c.fillRect(8, 44, 26, 8); c.fillStyle = '#7a8a9a'; c.fillRect(100, 14, 20, 26);
        c.fillStyle = '#bfe6ff'; c.globalAlpha = 0.5; c.fillRect(104, 18, 12, 6); c.globalAlpha = 1;
      });
      shopCell(c, 6, (c) => {   // tea house: buns in the display, a steamer
        lit(c, '#f0d8a8', '#9a7048');
        c.fillStyle = '#e8eef2'; c.fillRect(6, 30, 116, 26); c.fillStyle = '#c8d0d8'; c.fillRect(6, 30, 116, 2);
        for (let i = 0; i < 12; i++) { c.fillStyle = i % 3 ? '#f4e8d0' : '#e8a0a0'; c.beginPath(); c.arc(14 + i * 9.4, 44 + (i % 2) * 5, 4, 0, TAU); c.fill(); }
        c.fillStyle = 'rgba(255,255,255,0.45)'; for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(90 + i * 6, 14 - (i % 2) * 4, 5, 0, TAU); c.fill(); }
        c.fillStyle = '#b0201e'; c.fillRect(0, 0, 128, 5);
      });
      shopCell(c, 7, (c) => {   // a dark shop with blinds down
        lit(c, '#4a4440', '#2a2624'); for (let y = 2; y < 60; y += 3) { c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(0, y, 128, 1); }
        c.fillStyle = 'rgba(255,220,170,0.25)'; c.fillRect(54, 0, 20, 64);
      });
    }, K('shops2'));
    // ---- signs and small printed things of the street: 256 × 256 (cells listed in SG below)
    T.signs = canvasTex(256, 256, (c) => {
      // CHINATOWN MALL plaque (0,0,128,32): gold on red, cloud scrolls (no CJK glyphs)
      c.fillStyle = '#9a1a18'; c.fillRect(0, 0, 128, 32); c.strokeStyle = '#c9a54a'; c.lineWidth = 2; c.strokeRect(2, 2, 124, 28);
      c.strokeStyle = '#c9a54a'; c.lineWidth = 1.5; for (const x of [10, 118]) { c.beginPath(); c.arc(x, 16, 5, 0, PI * 1.5); c.stroke(); c.beginPath(); c.arc(x + (x < 64 ? 4 : -4), 16, 2.5, PI, TAU * 0.9); c.stroke(); }
      text(c, 'CHINATOWN MALL', 64, 17, 12.5, '#e8c860');
      // QR tip sign (128,0,64,64): hand-lettered TIPS? :) over a printed QR
      c.fillStyle = '#f2ede0'; c.fillRect(128, 0, 64, 64);
      c.save(); c.translate(160, 13); c.rotate(-0.06); c.font = 'bold 15px "Comic Sans MS", "Chalkboard SE", "DejaVu Sans", sans-serif'; c.fillStyle = '#1a2a6a'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('TIPS? :)', 0, 0); c.restore();
      c.fillStyle = '#ffffff'; c.fillRect(141, 26, 38, 36); c.fillStyle = '#111';
      { const q = rng(99); for (let y = 0; y < 11; y++) for (let x = 0; x < 11; x++) if (q() < 0.5) c.fillRect(143 + x * 3, 28 + y * 3, 3, 3); for (const [x, y] of [[143, 28], [167, 28], [143, 52]]) { c.fillRect(x, y, 9, 9); c.fillStyle = '#fff'; c.fillRect(x + 2, y + 2, 5, 5); c.fillStyle = '#111'; c.fillRect(x + 3, y + 3, 3, 3); } }
      // 40 dB meter (192,0,64,64): LED column on the left, the 40 dB line, SafeSense
      c.fillStyle = '#e8eef4'; c.fillRect(192, 0, 64, 64); c.fillStyle = '#1a2028'; c.fillRect(198, 6, 14, 52);
      for (let i = 0; i < 12; i++) { const y = 54 - i * 4.2; c.fillStyle = i < 7 ? '#1e4a2a' : i < 9 ? '#4a3a12' : '#4a1616'; c.fillRect(200, y, 10, 3); }
      c.fillStyle = '#d02a2a'; c.fillRect(196, 24, 20, 1.5);
      text(c, '40', 234, 22, 15, '#1a2a3a'); text(c, 'dB', 234, 36, 11, '#1a2a3a'); text(c, 'SafeSense', 234, 54, 6.5, '#3a8ad8');
      // STAGE DOOR, outside (0,32,64,128): dark green steel, rust, the stencil
      c.fillStyle = '#2f4a3e'; c.fillRect(0, 32, 64, 128);
      { const q = rng(7); for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(${120 + q() * 40},${60 + q() * 20},30,${0.15 + q() * 0.3})`; c.fillRect(q() * 64, 32 + q() * 128, 2 + q() * 5, 1 + q() * 4); } }
      c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(0, 32, 2, 128); c.fillRect(62, 32, 2, 128);
      c.font = MONO(11); c.fillStyle = '#d8d4c4'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('STAGE', 32, 66); c.fillText('DOOR', 32, 80);
      c.fillStyle = 'rgba(216,212,196,0.15)'; c.fillRect(14, 60, 36, 26);
      c.fillStyle = '#3a3e44'; c.fillRect(48, 104, 8, 10); c.fillStyle = '#a8a8a0'; c.fillRect(50, 107, 4, 3);
      // stage door, inside face (64,32,64,128): the same steel, painted black, the push bar
      c.fillStyle = '#23262a'; c.fillRect(64, 32, 64, 128); c.fillStyle = '#5a5e64'; c.fillRect(70, 98, 52, 7); c.fillStyle = '#8a8e94'; c.fillRect(70, 98, 52, 2);
      c.fillStyle = 'rgba(255,255,255,0.05)'; c.fillRect(64, 32, 64, 2);
      // Safe Box: quilted face (128,64), the door face with its window frame (192,64), keypad (128,128), +X logo (192,128)
      const quilt = (x0, y0) => { c.fillStyle = '#efe6d0'; c.fillRect(x0, y0, 64, 64); c.strokeStyle = '#d0c4a8'; c.lineWidth = 1.5; for (let i = -64; i <= 64; i += 16) { c.beginPath(); c.moveTo(x0 + i, y0); c.lineTo(x0 + i + 64, y0 + 64); c.moveTo(x0 + i + 64, y0); c.lineTo(x0 + i, y0 + 64); c.stroke(); } c.fillStyle = 'rgba(255,255,255,0.4)'; for (let x = 0; x < 64; x += 16) for (let y = 0; y < 64; y += 16) c.fillRect(x0 + x + 7, y0 + y + 2, 3, 2); };
      c.save(); c.beginPath(); c.rect(128, 64, 128, 64); c.clip(); quilt(128, 64); quilt(192, 64); c.restore();
      c.strokeStyle = '#c0b498'; c.lineWidth = 2; c.strokeRect(194, 66, 60, 60);
      c.fillStyle = '#dfe4ea'; c.fillRect(128, 128, 64, 64); c.fillStyle = '#c8ced6'; c.fillRect(128, 128, 64, 4);
      { const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '✕', '0', '✓']; for (let i = 0; i < 12; i++) { const x = 128 + 6 + (i % 3) * 18, y = 128 + 8 + ((i / 3) | 0) * 14; c.fillStyle = i === 9 ? '#e8b0b0' : i === 11 ? '#b0e0b8' : '#f8fafc'; c.fillRect(x, y, 16, 12); c.fillStyle = 'rgba(0,0,0,0.2)'; c.fillRect(x, y + 11, 16, 1); text(c, keys[i], x + 8, y + 6.5, 10, '#1a2a3a'); } }
      c.save(); c.beginPath(); c.rect(192, 128, 64, 64); c.clip(); quilt(192, 128); c.restore();
      c.fillStyle = '#3a8ad8'; c.beginPath(); c.moveTo(224, 140); c.quadraticCurveTo(236, 156, 232, 164); c.arc(224, 162, 8, 0.25, PI - 0.25); c.quadraticCurveTo(212, 156, 224, 140); c.fill();
      c.fillStyle = '#f4f8fc'; c.beginPath(); c.arc(221, 160, 2.5, 0, TAU); c.fill(); arglyph(c, 244, 180, 0.9);
      // blank sign panels with the AR glyph: cream (0,160,64,32), dark (64,160,64,32)
      c.fillStyle = '#e8e2d4'; c.fillRect(0, 160, 64, 32); c.fillStyle = '#d0c8b8'; c.fillRect(0, 160, 64, 2); c.fillRect(0, 190, 64, 2); arglyph(c, 56, 168, 0.7);
      c.fillStyle = '#2a2c34'; c.fillRect(64, 160, 64, 32); c.fillStyle = '#3a3c44'; c.fillRect(64, 160, 64, 2); arglyph(c, 120, 168, 0.7);
      // peeling gig posters on the Starlight's frontage (0,192,128,64)
      { const q = rng(13); for (let i = 0; i < 9; i++) { const x = (i % 5) * 26 - 4 + q() * 6, y = 192 + ((i / 5) | 0) * 30 + q() * 6; c.fillStyle = ['#d8c8a0', '#c86a5a', '#5a8ab0', '#e8d890', '#8ab07a', '#c8a0c8'][(q() * 6) | 0]; c.fillRect(x, y, 24, 32); c.fillStyle = 'rgba(30,20,20,0.6)'; c.fillRect(x + 3, y + 4, 18, 3); c.fillRect(x + 4, y + 22, 12, 2); c.fillStyle = '#4a3a34'; c.beginPath(); c.moveTo(x + 24, y + 32); c.lineTo(x + 14, y + 32); c.lineTo(x + 24, y + 18); c.fill(); } }
      // a padded corner guard / foam strip (128,192,64,64)
      c.save(); c.beginPath(); c.rect(128, 192, 64, 64); c.clip(); quilt(128, 192); c.restore();
      // the lane marquee: an empty letter board, a few loose tiles (192,192,64,64)
      c.fillStyle = '#2a2628'; c.fillRect(192, 192, 64, 64); c.fillStyle = '#e8e0d0'; c.fillRect(196, 200, 56, 34);
      for (let i = 0; i < 6; i++) { c.fillStyle = '#d8d0c0'; c.fillRect(198, 204 + i * 5, 52, 1); }
      for (const [x, y, rr] of [[204, 208, 0.1], [226, 214, -0.2], [238, 224, 0.3]]) { c.save(); c.translate(x, y); c.rotate(rr); c.fillStyle = '#1a1a1a'; c.fillRect(-3, -4, 6, 8); c.restore(); }
      for (let i = 0; i < 8; i++) { c.fillStyle = '#6a6460'; c.beginPath(); c.arc(198 + i * 7.5, 242, 2, 0, TAU); c.fill(); }
    }, K('signs'));
    // ---- NAP CLUB in rounded tubes, a crescent moon, z z z (alpha; white = lit)
    T.napclub = canvasTex(256, 64, (c) => {
      c.clearRect(0, 0, 256, 64);
      tube(c, '#ffffff', 3, () => { c.arc(20, 32, 14, 0.9, TAU - 0.9 + PI * 0.4); });
      tube(c, '#ffffff', 2.5, () => { c.arc(27, 27, 10, PI * 0.35, PI * 1.75); });
      c.font = 'bold 34px "Arial Rounded MT Bold", "Arial", "DejaVu Sans", sans-serif'; c.textAlign = 'left'; c.textBaseline = 'middle';
      const s = 'NAP CLUB', x0 = 44, w = c.measureText(s).width, wN = c.measureText('NA').width, wP = c.measureText('NAP').width;
      NAPP = [(x0 + wN - 1) / 256, (x0 + wP + 1) / 256];
      c.lineJoin = 'round'; c.strokeStyle = '#ffffff';
      c.globalAlpha = 0.3; c.lineWidth = 7; c.strokeText(s, x0, 34); c.globalAlpha = 1; c.lineWidth = 2.6; c.strokeText(s, x0, 34);
      c.font = 'bold 11px "DejaVu Sans", sans-serif'; c.fillStyle = '#ffffff'; c.fillText('z', x0 + w + 6, 20); c.fillText('z', x0 + w + 13, 13); c.fillText('z', x0 + w + 20, 7);
    }, K('napclub'));
    // ---- neon shapes, 8 cells of 64 × 64: cocktail, guitar, dumpling, microphone, stars, fish, flame, note
    T.neon = canvasTex(256, 128, (c) => {
      c.clearRect(0, 0, 256, 128);
      const at = (i, fn) => { c.save(); c.translate((i % 4) * 64, (i >> 2) * 64); fn(); c.restore(); };
      const W = '#ffffff';
      at(0, () => { tube(c, W, 3, () => { c.moveTo(14, 14); c.lineTo(50, 14); c.lineTo(32, 34); c.closePath(); c.moveTo(32, 34); c.lineTo(32, 52); c.moveTo(22, 54); c.lineTo(42, 54); c.moveTo(40, 6); c.lineTo(34, 24); }); tube(c, W, 3, () => { c.arc(26, 19, 3, 0, TAU); }); });
      at(1, () => { tube(c, W, 3, () => { c.arc(24, 44, 11, 0, TAU); c.moveTo(34, 38); c.arc(30, 31, 7, 0.7, TAU - 0.4); c.moveTo(34, 30); c.lineTo(52, 8); c.moveTo(49, 6); c.lineTo(56, 11); }); tube(c, W, 2, () => { c.arc(24, 44, 3, 0, TAU); }); });
      at(2, () => { tube(c, W, 3, () => { c.moveTo(8, 44); c.quadraticCurveTo(32, 10, 56, 44); c.closePath(); for (let k = 0; k < 4; k++) { c.moveTo(18 + k * 9, 36 - (k === 1 || k === 2 ? 6 : 0)); c.lineTo(20 + k * 9, 30 - (k === 1 || k === 2 ? 6 : 0)); } }); tube(c, W, 2, () => { c.moveTo(24, 12); c.quadraticCurveTo(20, 6, 26, 2); c.moveTo(38, 12); c.quadraticCurveTo(34, 6, 40, 2); }); });
      at(3, () => { tube(c, W, 3, () => { c.arc(32, 20, 11, 0, TAU); c.moveTo(32, 31); c.lineTo(32, 52); c.moveTo(22, 54); c.lineTo(42, 54); c.moveTo(18, 24); c.quadraticCurveTo(20, 40, 32, 40); c.quadraticCurveTo(44, 40, 46, 24); }); });
      const star = (x, y, s) => { for (let i = 0; i <= 10; i++) { const a = -H + i * PI / 5, rr = i % 2 ? s * 0.45 : s; i ? c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : c.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } };
      at(4, () => { tube(c, W, 2.5, () => { star(22, 24, 13); star(46, 16, 8); star(44, 44, 10); }); });
      at(5, () => { tube(c, W, 3, () => { c.moveTo(8, 32); c.quadraticCurveTo(26, 12, 44, 32); c.quadraticCurveTo(26, 52, 8, 32); c.moveTo(44, 32); c.lineTo(56, 22); c.lineTo(56, 42); c.closePath(); }); tube(c, W, 2, () => { c.arc(18, 29, 2, 0, TAU); }); });
      at(6, () => { tube(c, W, 3, () => { c.moveTo(32, 6); c.quadraticCurveTo(54, 30, 46, 46); c.quadraticCurveTo(40, 58, 32, 58); c.quadraticCurveTo(24, 58, 18, 46); c.quadraticCurveTo(12, 32, 26, 20); c.quadraticCurveTo(26, 32, 32, 34); c.quadraticCurveTo(34, 20, 32, 6); }); });
      at(7, () => { tube(c, W, 3, () => { c.moveTo(22, 46); c.lineTo(22, 12); c.lineTo(46, 6); c.lineTo(46, 40); c.moveTo(22, 18); c.lineTo(46, 12); }); tube(c, W, 3, () => { c.ellipse(17, 46, 6, 4.5, -0.4, 0, TAU); }); tube(c, W, 3, () => { c.ellipse(41, 40, 6, 4.5, -0.4, 0, TAU); }); });
    }, K('neon'));
    // ---- the blade: a star, then S T A R L I G H T down it (white tubes; the material tints dead grey / pink)
    T.blade = canvasTex(64, 256, (c) => {
      c.clearRect(0, 0, 64, 256);
      tube(c, '#ffffff', 3, () => { for (let i = 0; i <= 10; i++) { const a = -H + i * PI / 5, rr = i % 2 ? 7 : 15; i ? c.lineTo(32 + Math.cos(a) * rr, 20 + Math.sin(a) * rr) : c.moveTo(32 + Math.cos(a) * rr, 20 + Math.sin(a) * rr); } });
      c.font = 'bold 22px "Arial", "DejaVu Sans", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.strokeStyle = '#ffffff';
      [...'STARLIGHT'].forEach((ch, i) => { const y = 48 + i * 23.5; c.globalAlpha = 0.3; c.lineWidth = 6; c.strokeText(ch, 32, y); c.globalAlpha = 1; c.lineWidth = 2.2; c.strokeText(ch, 32, y); });
    }, K('blade'));
    // ---- a red lantern (wraps round the lathe): gold bands, ribs, a soft highlight
    T.lantern = canvasTex(64, 64, (c) => {
      const g = c.createLinearGradient(0, 0, 64, 0); g.addColorStop(0, '#b01a14'); g.addColorStop(0.5, '#ff5a30'); g.addColorStop(1, '#b01a14');
      c.fillStyle = g; c.fillRect(0, 0, 64, 64);
      c.fillStyle = 'rgba(90,10,6,0.55)'; for (let x = 0; x < 64; x += 8) c.fillRect(x, 0, 1, 64);
      c.fillStyle = '#c9a54a'; c.fillRect(0, 0, 64, 7); c.fillRect(0, 57, 64, 7); c.fillStyle = '#8a6a2a'; c.fillRect(0, 7, 64, 1); c.fillRect(0, 56, 64, 1);
      c.fillStyle = 'rgba(255,230,160,0.35)'; c.fillRect(0, 26, 64, 12);
    }, K('lantern'));
    // ---- ground: wet bitumen, wet pavers (repeat 1 × 1; quads scale their uvs in metres)
    T.road = canvasTex(128, 128, (c) => {
      const r = rng(11);
      c.fillStyle = '#2a2b34'; c.fillRect(0, 0, 128, 128);
      for (let i = 0; i < 900; i++) { const v = 32 + r() * 20 | 0; c.fillStyle = `rgb(${v},${v},${v + 6})`; c.fillRect(r() * 128 | 0, r() * 128 | 0, 1, 1); }
      for (let i = 0; i < 14; i++) { c.fillStyle = `rgba(80,88,120,${0.12 + r() * 0.18})`; const x = r() * 128, y = r() * 128; c.beginPath(); c.ellipse(x, y, 6 + r() * 18, 1.5 + r() * 3, (r() - 0.5) * 0.4, 0, TAU); c.fill(); }
    }, K('road', { repeat: [1, 1] }));
    T.pave = canvasTex(128, 128, (c) => {
      const r = rng(19);
      c.fillStyle = '#2a2c34'; c.fillRect(0, 0, 128, 128);
      for (let y = 0; y < 8; y++) for (let x = 0; x < 4; x++) { const o = (y % 2) * 16, v = 70 + r() * 16 | 0; c.fillStyle = `rgb(${v},${v + 2},${v + 10})`; c.fillRect(((x * 32 + o) % 128) + 1, y * 16 + 1, 30, 14); if (o) c.fillRect(0, y * 16 + 1, 15, 14); }
      for (let i = 0; i < 10; i++) { c.fillStyle = `rgba(110,118,150,${0.15 + r() * 0.2})`; c.beginPath(); c.ellipse(r() * 128, r() * 128, 8 + r() * 14, 2 + r() * 4, (r() - 0.5) * 0.6, 0, TAU); c.fill(); }
    }, K('pave', { repeat: [1, 1] }));
    T.paveRed = canvasTex(128, 128, (c) => {
      const r = rng(21);
      c.fillStyle = '#26181a'; c.fillRect(0, 0, 128, 128);
      for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { const v = r() * 12; c.fillStyle = `rgb(${100 + v | 0},${58 + v | 0},${56 + v | 0})`; c.fillRect(x * 16 + 1, y * 16 + 1, 14, 14); }
      for (let i = 0; i < 8; i++) { c.fillStyle = `rgba(150,100,110,${0.15 + r() * 0.2})`; c.beginPath(); c.ellipse(r() * 128, r() * 128, 8 + r() * 14, 2 + r() * 4, 0, 0, TAU); c.fill(); }
    }, K('pave_red', { repeat: [1, 1] }));
    // ---- the glow streak a sign leaves on wet ground (additive; instanceColor tints it)
    T.reflect = canvasTex(64, 128, (c) => {
      c.clearRect(0, 0, 64, 128);
      for (let y = 0; y < 128; y++) {
        const u = y / 128, k = Math.pow(1 - u, 1.6) * Math.min(1, u * 8 + 0.3) * (0.8 + 0.2 * Math.sin(y * 0.9)), wdt = 0.32 + 0.12 * Math.sin(y * 0.37);
        const g = c.createLinearGradient(0, 0, 64, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5 - wdt / 2, `rgba(255,255,255,${0.25 * k})`); g.addColorStop(0.5, `rgba(255,255,255,${0.7 * k})`); g.addColorStop(0.5 + wdt / 2, `rgba(255,255,255,${0.25 * k})`); g.addColorStop(1, 'rgba(255,255,255,0)');
        c.fillStyle = g; c.fillRect(0, 127 - y, 64, 1);
      }
    }, { key: 'vl_reflect' });
    // ---- upper-floor facades: 4 cells of 128 × 128 (8 m × 7 m: two floors of two windows): brick, brick lit +
    //      fairy lights, render with AC units, plain dark brick (the Starlight)
    T.facade = canvasTex(256, 256, (c) => {
      const r = rng(29);
      const brick = (x0, y0, base, mortar) => {
        c.save(); c.beginPath(); c.rect(x0, y0, 128, 128); c.clip(); c.fillStyle = mortar; c.fillRect(x0, y0, 128, 128);
        for (let y = 0; y < 128; y += 6) for (let x = (y / 6) % 2 ? -6 : 0; x < 128; x += 12) { const v = r() * 18 - 9; c.fillStyle = base; c.fillRect(x0 + x, y0 + y, 11, 5); c.fillStyle = v > 0 ? `rgba(255,255,255,${v / 120})` : `rgba(0,0,0,${-v / 60})`; c.fillRect(x0 + x, y0 + y, 11, 5); }
        c.restore();
      };
      const win = (x, y, litc) => { c.fillStyle = '#d8d0c0'; c.fillRect(x - 2, y - 2, 28, 38); c.fillStyle = litc || '#1a2230'; c.fillRect(x, y, 24, 34); c.fillStyle = 'rgba(255,255,255,0.08)'; c.fillRect(x, y, 12, 34); c.fillStyle = '#b8b0a0'; c.fillRect(x - 3, y + 34, 30, 3); c.fillStyle = '#2a2a30'; c.fillRect(x + 11, y, 2, 34); };
      brick(0, 0, '#7a4a3c', '#4a3028'); for (const [x, y] of [[20, 14], [84, 14], [20, 78], [84, 78]]) win(x, y);
      c.fillStyle = '#9a9ea4'; c.fillRect(88, 106, 18, 10); c.fillStyle = '#6a6e74'; c.fillRect(90, 108, 14, 6);
      brick(128, 0, '#6e4236', '#462c26'); for (const [x, y, l] of [[148, 14, 0], [212, 14, 1], [148, 78, 0], [212, 78, 0]]) win(x, y, l ? '#e8c890' : null);
      c.strokeStyle = '#2a2a2a'; c.lineWidth = 1; c.beginPath(); c.moveTo(136, 8); c.quadraticCurveTo(192, 20, 248, 8); c.stroke();
      for (let i = 0; i < 12; i++) { const t = i / 11, x = 136 + t * 112, y = 8 + 12 * 4 * t * (1 - t) * 0.5 + 1; c.fillStyle = ['#ff5a8a', '#ffd25a', '#5ad8ff', '#8aff7a'][i % 4]; c.fillRect(x, y, 2, 2); }
      c.fillStyle = '#8a8490'; c.fillRect(0, 128, 128, 128); for (let i = 0; i < 300; i++) { c.fillStyle = `rgba(${r() < 0.5 ? 255 : 0},${r() < 0.5 ? 255 : 0},${r() < 0.5 ? 255 : 0},0.04)`; c.fillRect(r() * 128, 128 + r() * 128, 2, 2); }
      for (const [x, y] of [[20, 142], [84, 142], [20, 206], [84, 206]]) win(x, y);
      for (const [x, y] of [[50, 152], [50, 216]]) { c.fillStyle = '#c8ccd0'; c.fillRect(x, y, 22, 14); c.fillStyle = '#8a8e92'; c.beginPath(); c.arc(x + 11, y + 7, 5, 0, TAU); c.fill(); }
      c.fillStyle = '#6a6470'; c.fillRect(118, 128, 4, 128);
      brick(128, 128, '#5a3a32', '#3a2622');
      c.fillStyle = 'rgba(200,190,170,0.08)'; c.fillRect(140, 150, 104, 30);
      c.fillStyle = 'rgba(0,0,0,0.2)'; for (let i = 0; i < 6; i++) c.fillRect(130 + i * 21, 128, 1, 128);
    }, K('facade'));
    // ---- Region S: posters (16 cells of 64 × 64; 4 legible), the S atlas, floorboards, light patch, rain shadows, streaks
    T.posters = canvasTex(256, 256, (c) => {
      const r = rng(37);
      const legible = { 0: ['THE SOFT', 'CORNERS', 'FRI 14 MAR 2031', '#e8d8b0', '#c84a3a'], 5: ['MANGROVE', 'MILE', 'LIVE · SAT 2 AUG 2032', '#a8d0c0', '#1a4a3a'],
        10: ['FOUR', "O'CLOCK STORM", 'w/ BRAMBLE BAY · 2030', '#3a3a5a', '#e8d070'], 15: ['LOW TIDE', 'CHOIR', 'ALL AGES · 2033', '#d8c8e0', '#5a3a7a'] };
      for (let i = 0; i < 16; i++) {
        const x = (i % 4) * 64, y = (i >> 2) * 64, L = legible[i];
        if (L) {
          c.fillStyle = L[3]; c.fillRect(x, y, 64, 64); c.fillStyle = L[4];
          c.font = FONT(11); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(L[0], x + 32, y + 13, 60); c.fillText(L[1], x + 32, y + 26, 60);
          c.fillRect(x + 8, y + 34, 48, 2); c.font = FONT(6.2); c.fillText(L[2], x + 32, y + 44, 62);
          c.globalAlpha = 0.5; c.beginPath(); c.arc(x + 32, y + 56, 4, 0, TAU); c.fill(); c.globalAlpha = 1;
        } else {
          const cols = ['#c86a5a', '#5a8ab0', '#e8d890', '#8ab07a', '#c8a0c8', '#2a2a2a', '#e8a05a', '#5ac0c0'];
          c.fillStyle = cols[(r() * cols.length) | 0]; c.fillRect(x, y, 64, 64);
          c.fillStyle = 'rgba(0,0,0,0.45)'; c.fillRect(x + 6, y + 8, 52, 7); c.fillRect(x + 10, y + 18, 44, 4);
          c.fillStyle = 'rgba(255,255,255,0.35)'; c.beginPath(); c.arc(x + 32, y + 40, 10 + r() * 6, 0, TAU); c.fill();
          c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(x + 12, y + 54, 40, 3);
        }
        c.fillStyle = 'rgba(255,240,200,0.18)'; c.fillRect(x, y, 64, 64);                      // sun-faded
        c.fillStyle = 'rgba(0,0,0,0.18)'; c.fillRect(x + 62, y, 2, 64); c.fillRect(x, y + 62, 64, 2);
      }
    }, K('posters'));
    T.atlasS = canvasTex(256, 256, (c) => {
      const r = rng(53);
      // desk top, dead (0,0,128,64): 16 channel strips, faders, knobs, a meter bridge
      c.fillStyle = '#26282c'; c.fillRect(0, 0, 128, 64); c.fillStyle = '#18191c'; c.fillRect(0, 0, 128, 10);
      for (let i = 0; i < 16; i++) { const x = 3 + i * 7.6; c.fillStyle = '#121316'; c.fillRect(x, 2, 5, 7); c.fillStyle = '#3a3c40'; c.fillRect(x + 2, 34, 1, 26); c.fillStyle = '#c8c8c8'; c.fillRect(x, 40 + (r() * 14 | 0), 5, 3); for (let k = 0; k < 3; k++) { c.fillStyle = ['#c85a3a', '#5a8ac8', '#d8d8d8'][k]; c.beginPath(); c.arc(x + 2.5, 14 + k * 6.5, 2, 0, TAU); c.fill(); } }
      // back bar (128,0,128,64): dusty bottles, the dead BAR tube
      c.fillStyle = '#1a1416'; c.fillRect(128, 0, 128, 64); c.fillStyle = '#3a2a22'; c.fillRect(128, 30, 128, 3); c.fillRect(128, 54, 128, 3);
      for (let i = 0; i < 24; i++) { const x = 130 + i * 5.2, h = 10 + r() * 10, col = ['#3a5a3a', '#5a3a1a', '#8a8a7a', '#2a3a4a'][(r() * 4) | 0]; c.fillStyle = col; c.fillRect(x, 30 - h, 4, h); c.fillRect(x + 1, 30 - h - 4, 2, 4); c.fillStyle = 'rgba(200,200,180,0.25)'; c.fillRect(x, 30 - h, 1, h); }
      for (let i = 0; i < 18; i++) { const x = 132 + i * 6.8; c.fillStyle = '#4a4440'; c.fillRect(x, 42, 5, 12); }
      c.font = 'bold 15px "Arial", sans-serif'; c.lineWidth = 2; c.strokeStyle = '#5a4a52'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.strokeText('BAR', 192, 8);
      // green room wall (0,64,128,64): stickers, the dead bulb mirror
      c.fillStyle = '#4a4248'; c.fillRect(0, 64, 128, 64);
      c.save(); c.beginPath(); c.rect(0, 64, 64, 64); c.clip();
      for (let i = 0; i < 150; i++) { c.fillStyle = ['#e85a5a', '#5ab4e8', '#f0d050', '#6ad06a', '#e8e8e8', '#c86ad0', '#ff9a3a', '#2a2a2a'][(r() * 8) | 0]; c.save(); c.translate(r() * 64, 64 + r() * 64); c.rotate(r() * 2); c.fillRect(-1.5, -1, 2 + r() * 3, 2 + r() * 2); c.restore(); }
      c.restore();
      c.fillStyle = '#8a8478'; c.fillRect(70, 72, 52, 48); c.fillStyle = '#2a2e34'; c.fillRect(75, 77, 42, 38); c.fillStyle = 'rgba(200,220,255,0.12)'; c.fillRect(75, 77, 18, 38);
      for (let i = 0; i < 6; i++) { c.fillStyle = '#d8d0b8'; c.beginPath(); c.arc(73 + i * 9.2, 74, 2, 0, TAU); c.fill(); c.beginPath(); c.arc(73 + i * 9.2, 118, 2, 0, TAU); c.fill(); }
      // coasters (128,64) plain and (192,64) with the biro note
      for (const x of [128, 192]) {
        c.fillStyle = '#1a1a1a'; c.fillRect(x, 64, 64, 64);
        c.fillStyle = '#e8dcc0'; c.beginPath(); c.arc(x + 32, 96, 30, 0, TAU); c.fill(); c.strokeStyle = '#b02a2a'; c.lineWidth = 3; c.beginPath(); c.arc(x + 32, 96, 26, 0, TAU); c.stroke();
        if (x === 128) { text(c, 'VALLEY', x + 32, 88, 9, '#b02a2a'); text(c, 'DRAUGHT', x + 32, 100, 9, '#b02a2a'); c.fillStyle = '#c9a54a'; c.fillRect(x + 20, 107, 24, 2); }
        else { c.fillStyle = 'rgba(176,42,42,0.35)'; text(c, 'VALLEY', x + 32, 84, 8, 'rgba(176,42,42,0.35)'); c.save(); c.translate(x + 32, 96); c.rotate(-0.12); c.font = 'italic 11px "DejaVu Serif", "Times New Roman", serif'; c.fillStyle = '#1e2a8a'; c.textAlign = 'center'; c.fillText("I'll do it.", 0, 2); c.fillText('— L.', 6, 14); c.restore(); }
      }
      // EXIT (0,128,64,32): green, a running figure
      c.fillStyle = '#0c3a1c'; c.fillRect(0, 128, 64, 32); c.fillStyle = '#2fd06a'; c.fillRect(2, 130, 60, 28); text(c, 'EXIT', 38, 144, 13, '#062a12');
      c.fillStyle = '#062a12'; c.beginPath(); c.arc(12, 136, 2.5, 0, TAU); c.fill(); c.fillRect(10, 139, 3, 8); c.fillRect(13, 141, 5, 2); c.fillRect(6, 146, 5, 2); c.fillRect(12, 146, 2, 7);
      // the clock face (64,128,64,64)
      c.fillStyle = '#f2eee4'; c.beginPath(); c.arc(96, 160, 30, 0, TAU); c.fill(); c.strokeStyle = '#2a2a2a'; c.lineWidth = 3; c.stroke();
      for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; c.fillStyle = '#2a2a2a'; c.fillRect(96 + Math.sin(a) * 24 - 1, 160 - Math.cos(a) * 24 - 1, i % 3 ? 2 : 3, i % 3 ? 2 : 4); }
      // the stage door inside face (128,128,64,128): black steel, push bar, a grubby kick plate
      c.fillStyle = '#23262a'; c.fillRect(128, 128, 64, 128); c.fillStyle = '#5a5e64'; c.fillRect(134, 192, 52, 7); c.fillStyle = '#8a8e94'; c.fillRect(134, 192, 52, 2);
      c.fillStyle = '#3a3c40'; c.fillRect(128, 236, 64, 20);
      // the street glow behind the high window (192,128,64,64): pink/teal/red smudges
      c.fillStyle = '#0a0812'; c.fillRect(192, 128, 64, 64);
      for (const [x, y, rr, col] of [[204, 150, 16, 'rgba(255,79,174,0.8)'], [236, 146, 14, 'rgba(47,232,214,0.75)'], [222, 172, 12, 'rgba(255,90,48,0.6)'], [248, 176, 8, 'rgba(255,90,48,0.5)'], [196, 178, 9, 'rgba(47,232,214,0.4)']]) { const g = c.createRadialGradient(x, y, 0, x, y, rr); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(192, 128, 64, 64); }
      // flyers stapled to the columns (0,160,64,64)
      for (let i = 0; i < 6; i++) { c.fillStyle = ['#e8e0c8', '#e8a0a0', '#a0c8e8', '#e8e0a0'][i % 4]; c.fillRect((i % 3) * 21 + 1, 160 + ((i / 3) | 0) * 32 + 2, 19, 28); c.fillStyle = 'rgba(0,0,0,0.4)'; c.fillRect((i % 3) * 21 + 4, 160 + ((i / 3) | 0) * 32 + 6, 13, 3); }
      // stencils: GREEN ROOM (64,192,64,32), STAFF ONLY (64,224,64,32)
      c.fillStyle = '#26282c'; c.fillRect(64, 192, 64, 64); c.font = MONO(9); c.fillStyle = '#c8c4b4'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('GREEN', 96, 203); c.fillText('ROOM', 96, 213); c.fillText('STAFF', 96, 235); c.fillText('ONLY', 96, 245);
      // the amp grille (192,192,64,64)
      c.fillStyle = '#1a1a1c'; c.fillRect(192, 192, 64, 64); c.fillStyle = '#2e2c2a'; c.fillRect(196, 202, 56, 44);
      for (let y = 204; y < 246; y += 3) { c.fillStyle = '#3a3836'; c.fillRect(196, y, 56, 1); } c.fillStyle = '#c8c0a8'; c.fillRect(196, 194, 20, 5);
    }, K('atlas_s'));
    T.boards = canvasTex(128, 128, (c) => {
      const r = rng(61);
      for (let i = 0; i < 8; i++) { const v = r() * 14 - 7; c.fillStyle = `rgb(${74 + v | 0},${54 + v | 0},${40 + v | 0})`; c.fillRect(0, i * 16, 128, 16); c.fillStyle = 'rgba(20,12,8,0.6)'; c.fillRect(0, i * 16, 128, 1); const cut = (r() * 128) | 0; c.fillRect(cut, i * 16, 1, 16); }
      for (let i = 0; i < 260; i++) { c.fillStyle = `rgba(${r() < 0.5 ? 30 : 110},${r() < 0.5 ? 20 : 80},10,0.25)`; c.fillRect(r() * 128, r() * 128, 4 + r() * 10, 1); }
    }, K('boards', { repeat: [1, 1] }));
    T.patch = canvasTex(128, 64, (c) => {
      c.clearRect(0, 0, 128, 64);
      c.filter = 'blur(3px)';
      const g = c.createLinearGradient(0, 0, 128, 0); g.addColorStop(0, 'rgba(47,232,214,0.85)'); g.addColorStop(0.45, 'rgba(120,150,220,0.6)'); g.addColorStop(1, 'rgba(255,79,174,0.9)');
      c.fillStyle = g;
      for (const [x, w] of [[6, 30], [40, 26], [70, 26], [100, 22]]) c.fillRect(x, 8, w, 48);
      c.fillStyle = 'rgba(255,90,48,0.5)'; for (const [x, y] of [[20, 20], [60, 40], [90, 16], [110, 46]]) c.fillRect(x, y, 4, 3);
      c.filter = 'none';
    }, { key: 'vl_patch' });
    // the same window, at dawn: grey-blue daylight instead of the neon (2.10's last WIDE; faded in by the 'dawn' env)
    T.patchDawn = canvasTex(128, 64, (c) => {
      c.clearRect(0, 0, 128, 64);
      c.filter = 'blur(3px)';
      const g = c.createLinearGradient(0, 0, 128, 0); g.addColorStop(0, 'rgba(150,176,220,0.7)'); g.addColorStop(0.5, 'rgba(196,212,236,0.85)'); g.addColorStop(1, 'rgba(150,170,214,0.7)');
      c.fillStyle = g;
      for (const [x, w] of [[6, 30], [40, 26], [70, 26], [100, 22]]) c.fillRect(x, 8, w, 48);
      c.filter = 'none';
    }, { key: 'vl_patch_dawn' });
    T.rshadow = canvasTex(64, 128, (c) => {
      const r = rng(3);
      c.clearRect(0, 0, 64, 128);
      for (let i = 0; i < 26; i++) { let x = r() * 64; const y0 = r() * 128, len = 20 + r() * 60; c.strokeStyle = `rgba(12,8,16,${0.35 + r() * 0.35})`; c.lineWidth = 2 + r() * 2.5; c.beginPath(); c.moveTo(x, y0); for (let y = y0; y < y0 + len; y += 6) { x += (r() - 0.5) * 3; c.lineTo(x, y); } c.stroke(); c.beginPath(); c.arc(x, y0 + len, 2.5, 0, 7); c.fillStyle = c.strokeStyle; c.fill(); }
    }, { key: 'vl_rshadow', repeat: [1, 1] });
    T.streak = canvasTex(64, 128, (c, w, h) => {
      const r = rng(71);
      c.fillStyle = 'rgba(150,170,185,0.30)'; c.fillRect(0, 0, w, h);
      for (let i = 0; i < 22; i++) {
        let x = r() * w; const y0 = r() * h, len = 20 + r() * 70;
        c.strokeStyle = `rgba(235,242,248,${0.35 + r() * 0.4})`; c.lineWidth = 1 + r() * 1.5; c.beginPath(); c.moveTo(x, y0);
        for (let y = y0; y < y0 + len; y += 8) { x += (r() - 0.5) * 2; c.lineTo(x, y); }
        c.stroke(); c.fillStyle = 'rgba(240,246,250,0.8)'; c.fillRect(x - 1.5, y0 + len - 2, 3, 4);
      }
    }, { key: 'vl_streak', repeat: [1, 1] });
    // desk LEDs (additive overlay): per-channel meter dots + the bridge
    T.deskLed = canvasTex(128, 64, (c) => {
      c.clearRect(0, 0, 128, 64);
      for (let i = 0; i < 16; i++) { const x = 3 + i * 7.6; for (let k = 0; k < 4; k++) { c.fillStyle = k < 2 ? '#5aff7a' : k < 3 ? '#ffd23a' : '#ff4a3a'; c.fillRect(x + 1, 8 - k * 2, 3, 1); } c.fillStyle = i % 3 ? '#ff6a3a' : '#5ad0ff'; c.fillRect(x + 1, 31, 3, 2); }
      c.fillStyle = '#6ad0ff'; c.fillRect(2, 62, 124, 1);
    }, K('desk_led'));
    T.soft = canvasTex(64, 64, (c) => { c.clearRect(0, 0, 64, 64); const g = c.createRadialGradient(32, 32, 0, 32, 32, 31); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.5, 'rgba(255,255,255,0.45)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, 64, 64); }, { key: 'vl_soft' });
    T.ring = canvasTex(64, 64, (c) => { c.clearRect(0, 0, 64, 64); const g = c.createRadialGradient(32, 32, 14, 32, 32, 31); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.55, 'rgba(255,255,255,0.9)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, 64, 64); }, { key: 'vl_ring' });
    return T;
  }
  // atlas cells (uv rects)
  const SGC = (px, py, pw, ph) => cell(256, 256, px, py, pw, ph);
  const SG = {
    plaque: SGC(0, 0, 128, 32), qr: SGC(128, 0, 64, 64), meter: SGC(192, 0, 64, 64), doorOut: SGC(0, 32, 64, 128), doorIn: SGC(64, 32, 64, 128),
    quilt: SGC(128, 64, 64, 64), boxDoor: SGC(192, 64, 64, 64), keypad: SGC(128, 128, 64, 64), logo: SGC(192, 128, 64, 64),
    blank: SGC(0, 160, 64, 32), blankDk: SGC(64, 160, 64, 32), posters: SGC(0, 192, 128, 64), foam: SGC(128, 192, 64, 64), marquee: SGC(192, 192, 64, 64),
  };
  const SA = {   // Region S atlas
    desk: SGC(0, 0, 128, 64), bar: SGC(128, 0, 128, 64), green: SGC(0, 64, 128, 64), coaster: SGC(128, 64, 64, 64), coasterNote: SGC(192, 64, 64, 64),
    exit: SGC(0, 128, 64, 32), clock: SGC(64, 128, 64, 64), doorIn: SGC(128, 128, 64, 128), glow: SGC(192, 128, 64, 64), flyers: SGC(0, 160, 64, 64),
    greenSt: SGC(64, 192, 64, 32), staffSt: SGC(64, 224, 64, 32), amp: SGC(192, 192, 64, 64),
  };
  const SHOP = (i) => cell(256, 256, (i % 2) * 128, (i >> 1) * 64, 128, 64);
  const NEO = (i) => cell(256, 128, (i % 4) * 64, (i >> 2) * 64, 64, 64);
  const FAC = (i) => cell(256, 256, (i % 2) * 128, (i >> 1) * 128, 128, 128);
  const POS = (i) => cell(256, 256, (i % 4) * 64, (i >> 2) * 64, 64, 64);

  // ---------------------------------------------------------- small builders
  // a quad on an axis-aligned face: centre (a along the face, y), size w × h; face 'S' (+Z) 'N' (−Z) 'E' (+X) 'W' (−X) at p
  function wq(face, p, a, y, w, h, m, uv, hex = 0xffffff) {
    if (face === 'S') quad(w, h, m, a, y, p, 0, 0, hex, uv);
    else if (face === 'N') quad(w, h, m, a, y, p, PI, 0, hex, uv);
    else if (face === 'E') quad(w, h, m, p, y, a, H, 0, hex, uv);
    else quad(w, h, m, p, y, a, -H, 0, hex, uv);
  }
  const OUTD = { S: 1, N: -1, E: 1, W: -1 };   // outward sign along the face's axis
  // a textured ground quad: x0..x1, z0..z1 at y, uvs in tiles of `tile` metres
  function ground(x0, z0, x1, z1, y, m, tile = 4, hex = 0xffffff) {
    const w = x1 - x0, d = z1 - z0;
    quad(w, d, m, (x0 + x1) / 2, y, (z0 + z1) / 2, 0, -H, hex, [x0 / tile, -z1 / tile, x1 / tile, -z0 / tile]);
  }
  // upper-floor facade tiles (8 m × 7 m cells) over a face from a0..a1, y0..y1; pick(i, j) -> facade cell
  function facade(face, p, a0, a1, y0, y1, pick, hex = 0xffffff) {
    const e = OUTD[face] * 0.012, pp = p + e, TW = 8, TH = 7;
    for (let a = a0, i = 0; a < a1 - 0.01; a += TW, i++) {
      const w = Math.min(TW, a1 - a);
      for (let y = y0, j = 0; y < y1 - 0.01; y += TH, j++) {
        const h = Math.min(TH, y1 - y), c = FAC(pick(i, j)), uv = [c[0], c[1] + (c[3] - c[1]) * (1 - h / TH), c[0] + (c[2] - c[0]) * (w / TW), c[3]];
        // face E/W runs a along z; S/N along x. Reverse the along-axis for N/E so u reads left -> right from outside
        const ac = face === 'N' || face === 'E' ? a1 - (a - a0) - w / 2 : a + w / 2;
        wq(face, pp, ac, y + h / 2, w, h, M.facade, uv, hex);
      }
    }
  }
  // a row of shopfronts on one face at p (x for E/W, z for S/N), outward along the face's normal
  function shops(face, p, list, o = {}) {
    const out = OUTD[face], ax = face === 'E' || face === 'W';
    const pil = o.pilaster ?? 0x3a3a42, fas = o.fascia ?? 0x2e2e36;
    for (const s of list) {
      const { a0, a1 } = s, w = a1 - a0, ac = (a0 + a1) / 2, m = s.tex === 2 ? M.shops2 : M.shops;
      wq(face, p - out * 0.22, ac, 1.45, w - 0.3, 2.6, m, SHOP(s.cell));                // the window card, set back
      wq(face, p + out * 0.02, ac, 1.5, w - 0.3, 2.5, M.glass);                        // glazing
      if (ax) bb(Math.min(p, p + out * 0.12), 0, a0, Math.max(p, p + out * 0.12), 0.18, a1, pil); else bb(a0, 0, Math.min(p, p + out * 0.12), a1, 0.18, Math.max(p, p + out * 0.12), pil);
      for (const a of [a0, a1]) { if (ax) bb(Math.min(p - out * 0.3, p + out * 0.16), 0, a - 0.16, Math.max(p - out * 0.3, p + out * 0.16), 3.2, a + 0.16, pil); else bb(a - 0.16, 0, Math.min(p - out * 0.3, p + out * 0.16), a + 0.16, 3.2, Math.max(p - out * 0.3, p + out * 0.16), pil); }
      if (ax) bb(Math.min(p, p + out * 0.1), 2.75, a0, Math.max(p, p + out * 0.1), 3.2, a1, fas); else bb(a0, 2.75, Math.min(p, p + out * 0.1), a1, 3.2, Math.max(p, p + out * 0.1), fas);
      if (o.trim) { if (ax) bb(Math.min(p, p + out * 0.13), 3.12, a0, Math.max(p, p + out * 0.13), 3.2, a1, o.trim); else bb(a0, 3.12, Math.min(p, p + out * 0.13), a1, 3.2, Math.max(p, p + out * 0.13), o.trim); }
      if (s.sign !== false) wq(face, p + out * 0.105, ac + (s.signOff || 0), 2.97, Math.min(2.6, w * 0.5), 0.36, M.signs, s.sign === 'light' ? SG.blank : SG.blankDk);
      if (s.door) { const [d0, d1] = s.door; for (const a of [d0, d1]) if (ax) bb(Math.min(p, p + out * 0.06), 0, a - 0.05, Math.max(p, p + out * 0.06), 2.3, a + 0.05, 0x1a1a1e); else bb(a - 0.05, 0, Math.min(p, p + out * 0.06), a + 0.05, 2.3, Math.max(p, p + out * 0.06), 0x1a1a1e); if (ax) bb(Math.min(p, p + out * 0.06), 2.25, d0, Math.max(p, p + out * 0.06), 2.35, d1, 0x1a1a1e); else bb(d0, 2.25, Math.min(p, p + out * 0.06), d1, 2.35, Math.max(p, p + out * 0.06), 0x1a1a1e); }
    }
  }
  // a padded bench (local: centre at the origin, seat along Z, facing +X)
  function benchModel(len = 1.8) {
    const h = len / 2;
    for (const z of [-h + 0.15, h - 0.15]) { bb(-0.25, 0, z - 0.04, 0.2, 0.42, z + 0.04, 0x3a3a3e); bb(-0.32, 0, z - 0.04, -0.26, 0.9, z + 0.04, 0x3a3a3e); }
    for (let i = 0; i < 4; i++) bb(-0.25 + i * 0.115, 0.42, -h, -0.15 + i * 0.115, 0.46, h, i % 2 ? 0x8a6a4a : 0x7a5a3e);
    for (let i = 0; i < 3; i++) bb(-0.33, 0.55 + i * 0.12, -h, -0.29, 0.64 + i * 0.12, h, 0x7a5a3e);
    for (const z of [-h - 0.03, h + 0.03]) bb(-0.28, 0.42, z - 0.05, 0.22, 0.68, z + 0.05, 0xefe6d0);   // foam armrests
  }
  // the Safe Box (local: bottom centre at the origin; door on −Z, keypad on −Z right of it, logo on +X) -> parts
  function safeBox(name, kind) {
    const S = 0.62, h = S / 2, W = 0xffffff;
    const g = part(name, () => {
      quad(S, S, M.signs, 0, S, 0, 0, -H, W, SG.quilt);              // top
      quad(S, S, M.signs, h, h, 0, H, 0, W, SG.logo);                // +X: the SafeSense logo
      quad(S, S, M.signs, -h, h, 0, -H, 0, W, SG.quilt);             // −X
      quad(S, S, M.signs, 0, h, h, 0, 0, W, SG.quilt);               // +Z
      quad(S, S, M.signs, 0, 0.002, 0, 0, H, W, SG.quilt);           // bottom
      // −Z face: a frame round the door opening (x −0.29…−0.02, y 0.06…0.56) + the keypad panel
      const f = (x0, x1, y0, y1) => quad(x1 - x0, y1 - y0, M.signs, (x0 + x1) / 2, (y0 + y1) / 2, -h, PI, 0, W, SG.quilt);
      f(-h, -0.29, 0, S); f(-0.02, h, 0, S); f(-0.29, -0.02, 0, 0.06); f(-0.29, -0.02, 0.56, S);
      quad(0.17, 0.22, M.signs, 0.15, 0.32, -h - 0.004, PI, 0, W, SG.keypad);
      bb(0.055, 0.2, -h - 0.004, 0.245, 0.21, -h, 0xb8c0c8); bb(0.055, 0.43, -h - 0.004, 0.245, 0.44, -h, 0xb8c0c8);
      // the cavity behind the door (dark)
      const IN = 0x141418;
      quad(0.3, 0.52, M.vc, -0.155, 0.31, 0.25, PI, 0, IN); quad(0.5, 0.52, M.vc, -0.29, 0.31, 0, H, 0, IN); quad(0.5, 0.52, M.vc, -0.02, 0.31, 0, -H, 0, IN);
      quad(0.3, 0.5, M.vc, -0.155, 0.06, 0, 0, -H, IN); quad(0.3, 0.5, M.vc, -0.155, 0.56, 0, 0, H, IN);
      // the bracket it sits on
      bb(-0.27, -0.025, -0.27, 0.27, 0, 0.27, 0xa8b0b8);
      if (kind === 'trumpet') { cyl(0.012, 0.012, 0.34, 6, 0xc9a54a, -0.16, 0.3, 0.05, 0, H); cyl(0.07, 0.02, 0.12, 8, 0xd8b45a, -0.03, 0.3, 0.05, 0, H); bb(-0.24, 0.26, 0.0, -0.2, 0.34, 0.1, 0xb8943a); }
      if (kind === 'tambourine') { const tg = new THREE.TorusGeometry(0.12, 0.022, 4, 14); tg.rotateY(0.3); tg.translate(-0.15, 0.3, 0.08); put(tg, 0xc89a5a); for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; bb(-0.15 + Math.cos(a) * 0.12 - 0.015, 0.3 + Math.sin(a) * 0.12 - 0.015, 0.03, -0.15 + Math.cos(a) * 0.12 + 0.015, 0.3 + Math.sin(a) * 0.12 + 0.015, 0.06, 0xd8d8d0); } }
    }, null, 0, { floor: false });
    // the door: hinged at its bottom edge, swings down and out (rotation.x < 0)
    const door = part(name + '_door', () => {
      const fr = (x0, x1, y0, y1) => { bb(x0, y0, -0.02, x1, y1, -0.002, 0xd8ccb0); quad(x1 - x0, y1 - y0, M.signs, (x0 + x1) / 2, (y0 + y1) / 2, -0.0215, PI, 0, W, SG.quilt); };
      fr(-0.135, -0.09, 0, 0.5); fr(0.09, 0.135, 0, 0.5); fr(-0.09, 0.09, 0, 0.22); fr(-0.09, 0.09, 0.44, 0.5);
      bb(-0.092, 0.218, -0.024, 0.092, 0.222, -0.002, 0x8a9098); bb(-0.092, 0.438, -0.024, 0.092, 0.442, -0.002, 0x8a9098);
      quad(0.18, 0.22, M.glass, 0, 0.33, -0.011, PI);
      bb(-0.03, 0.1, -0.05, 0.03, 0.13, -0.02, 0x8a9098);
    }, [-0.155, 0.06, -h], 0, { floor: false });
    g.add(door); g.userData.doorObj = door;
    const led = new THREE.Mesh(artSharedGeo('vl_led', () => new THREE.BoxGeometry(0.06, 0.03, 0.06)), M.ledR); led.position.set(0.2, S + 0.015, -0.2); g.add(led); g.userData.ledObj = led;
    return g;
  }
  // a SafeSense pole with its meter, ring light and rungs; the box (built by safeBox) sits on top at y 3.0
  function poleModel() {
    cyl(0.09, 0.09, 3.0, 8, 0x8a9098, 0, 1.5, 0);
    cyl(0.16, 0.16, 1.0, 10, 0xefe6d0, 0, 0.5, 0); for (const y of [0.2, 0.5, 0.8]) cyl(0.165, 0.165, 0.025, 10, 0xd8ccb0, 0, y, 0);
    cyl(0.12, 0.14, 0.05, 8, 0x5a6068, 0, 0.025, 0);
    for (const y of [1.20, 1.55, 1.90, 2.25, 2.60]) { bb(-0.16, y - 0.0125, -0.215, 0.16, y + 0.0125, -0.19, 0x6a7078); for (const x of [-0.15, 0.15]) bb(x - 0.0125, y - 0.0125, -0.215, x + 0.0125, y + 0.0125, -0.06, 0x6a7078); }
    bb(0.08, 2.03, -0.12, 0.12, 2.37, 0.12, 0x2a3038);                                                  // meter housing
    quad(0.22, 0.32, M.signs, 0.121, 2.2, 0, H, 0, 0xffffff, SG.meter);
    bb(-0.2, 2.97, -0.2, 0.2, 3.0, 0.2, 0xa8b0b8);
  }

  // ---------------------------------------------------------- materials
  function materials() {
    const bs = blobShadow(), blob = bs.material.map;
    const nb = (key, map, col, o = {}) => basic(key, { map, color: col, transparent: true, depthWrite: false, fog: false, side: THREE.DoubleSide, forceSinglePass: true, ...o });
    return {
      vc: VC(),
      road: matTex(T.road), pave: matTex(T.pave), paveRed: matTex(T.paveRed), boards: matTex(T.boards),
      shops: matTex(T.shops, { emissive: 0xffffff, emissiveIntensity: 0.62 }), shops2: matTex(T.shops2, { emissive: 0xffffff, emissiveIntensity: 0.62 }),
      signs: matTex(T.signs, { emissive: 0xffffff, emissiveIntensity: 0.3 }),
      facade: matTex(T.facade, { emissive: 0xffffff, emissiveIntensity: 0.12 }),
      posters: matTex(T.posters, { emissive: 0xffffff, emissiveIntensity: 0.14 }),
      atlasS: matTex(T.atlasS, { emissive: 0xffffff, emissiveIntensity: 0.16 }),
      glass: basic('vl_glass', { color: 0x2a3444, transparent: true, opacity: 0.32, side: THREE.DoubleSide, depthWrite: false, forceSinglePass: true }),
      glow: basic('vl_glow', { color: 0xfff0d8 }),
      chrome: mat(0xffffff, { emissive: 0x2e333c, key: 'vl_chrome' }), paper: mat(0xffffff, { emissive: 0x34312c, key: 'vl_paper' }), urnHi: basic('vl_urn_hi', { color: 0xb8c2d0 }),
      skylight: basic('vl_skylight', { color: 0x7a6a58 }),
      neonM: nb('vl_neon_m', T.neon, 0xff3fa4), neonT: nb('vl_neon_t', T.neon, 0x2fe8d6), neonR: nb('vl_neon_r', T.neon, 0xff3a2a),
      nap: nb('vl_nap', T.napclub, 0xff3fa4), napP: nb('vl_nap_p', T.napclub, 0xff3fa4), blade: nb('vl_blade', T.blade, 0x4a4650),
      reflect: basic('vl_reflect', { map: T.reflect, transparent: true, blending: ADD, depthWrite: false, fog: false }),
      lantern: basic('vl_lantern', { map: T.lantern, fog: false }),
      lampHead: basic('vl_lamp_head', { color: 0xffd8b0 }),
      carGlow: basic('vl_car_glow', { map: T.soft, transparent: true, blending: ADD, depthWrite: false, color: 0x2a7aa8 }),
      carShadow: basic('vl_car_shadow', { map: blob, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }),
      shushRing: basic('vl_shush_ring', { map: T.ring, transparent: true, blending: ADD, depthWrite: false, fog: false, side: THREE.DoubleSide, forceSinglePass: true }),
      meter: basic('vl_meter', { color: 0x5aff7a }), ring: basic('vl_ring_light', { color: 0xffc8e0 }),
      ledR: basic('vl_led_r', { color: 0xff3020 }), ledG: basic('vl_led_g', { color: 0x40ff70 }),
      keyFlash: basic('vl_keyflash', { color: 0xbfe6ff, transparent: true, opacity: 0.85, depthWrite: false }),
      phoneScr: basic('vl_phone_scr', { color: 0x7ac0ff }),
      phoneRing: basic('vl_phone_ring', { map: T.ring, transparent: true, blending: ADD, depthWrite: false, color: 0x9fd8ff }),
      bulk: basic('vl_bulkhead', { color: 0xfff0e0 }),
      creak: basic('vl_creak', { color: 0x56607e, map: T.soft, transparent: true, blending: ADD, depthWrite: false }),
      pool: basic('vl_pool', { map: T.soft, vertexColors: true, transparent: true, blending: ADD, depthWrite: false }),
      poolS: basic('vl_pool_s', { map: T.soft, vertexColors: true, transparent: true, blending: ADD, depthWrite: false }),
      beam: basic('vl_beam', { vertexColors: true, transparent: true, blending: ADD, depthWrite: false, side: THREE.DoubleSide, forceSinglePass: true }),
      streak: matTex(T.streak, { transparent: true, side: THREE.DoubleSide, key: 'vl_streak' }),
      // Region S
      patch: basic('vl_patch', { map: T.patch, transparent: true, blending: ADD, depthWrite: false, color: 0xffffff }),
      patchDawn: basic('vl_patch_dawn', { map: T.patchDawn, transparent: true, blending: ADD, depthWrite: false, color: 0x000000 }),
      dawnGlass: basic('vl_dawn_glass', { transparent: true, blending: ADD, depthWrite: false, color: 0x000000, fog: false }),
      rshadow: basic('vl_rshadow', { map: T.rshadow, transparent: true, opacity: 0.6, depthWrite: false }),
      streetGlow: basic('vl_street_glow', { map: T.atlasS, fog: false }),
      exit: basic('vl_exit', { map: T.atlasS }),
      bulkS: basic('vl_bulk_s', { color: 0xf0e0c0 }),
      deskLed: basic('vl_desk_led', { map: T.deskLed, transparent: true, blending: ADD, depthWrite: false, color: 0x000000 }),
      meterS: basic('vl_desk_meter', { color: 0x5aff7a }),
      parOn: basic('vl_par_on', { vertexColors: true }),
      sparkle: BM.vl_sparkle || (BM.vl_sparkle = new THREE.PointsMaterial({ size: 3, sizeAttenuation: false, color: 0xffffff, transparent: true, opacity: 0, depthWrite: false })),
    };
  }

  // tiles(face, p, rects, cellFn): cover each rect [a0, a1, y0, y1] of a face with 8 × 7 m facade cells on a grid anchored
  // at (A0, Y0) so courses and windows line up across openings; cellFn(i, j) picks the cell of grid tile (i, j)
  function tiles(face, p, rects, cellFn, A0 = -200, Y0 = 0, hex = 0xffffff) {
    const e = OUTD[face] * 0.012, pp = p + e, TW = 8, TH = 7, flip = face === 'N' || face === 'E';
    for (const [a0, a1, y0, y1] of rects) {
      for (let i = Math.floor((a0 - A0) / TW); A0 + i * TW < a1 - 1e-3; i++) {
        const ta = A0 + i * TW, pa0 = Math.max(a0, ta), pa1 = Math.min(a1, ta + TW);
        if (pa1 - pa0 < 1e-3) continue;
        for (let j = Math.floor((y0 - Y0) / TH); Y0 + j * TH < y1 - 1e-3; j++) {
          const ty = Y0 + j * TH, py0 = Math.max(y0, ty), py1 = Math.min(y1, ty + TH);
          if (py1 - py0 < 1e-3) continue;
          const c = FAC(cellFn(i, j)), cw = c[2] - c[0], ch = c[3] - c[1];
          const f0 = (pa0 - ta) / TW, f1 = (pa1 - ta) / TW, u0 = flip ? c[0] + (1 - f1) * cw : c[0] + f0 * cw, u1 = flip ? c[0] + (1 - f0) * cw : c[0] + f1 * cw;
          const uv = [u0, c[1] + (py0 - ty) / TH * ch, u1, c[1] + (py1 - ty) / TH * ch];
          wq(face, pp, (pa0 + pa1) / 2, (py0 + py1) / 2, pa1 - pa0, py1 - py0, M.facade, uv, hex);
        }
      }
    }
  }
  const grp = (name, parent) => { const g = new THREE.Group(); g.name = name; parent.add(g); return g; };
  const FOAM = 0xefe6d0, SEAM = 0xd8ccb0;
  // instanced repeats: build a shape with the Builder helpers (one material, local coords) -> its geometry
  function shapeGeo(fn) { const g = part('', fn, null, 0, { floor: false }); const geo = g.children[0].geometry; return geo; }

  // ---------------------------------------------------------- build
  function build() {
    COL.length = 0; T = textures(); M = materials();
    const root = new THREE.Group(); R.root = root;
    const P = (g, parent = root) => (parent.add(g), g);
    const regM = grp('region_m', root), mAnn = grp('m_ann', regM), mMall = grp('m_mall', regM), mCt = grp('m_ct', regM);
    const regS = grp('region_s', root), regF = grp('region_f', root);
    R.regM = regM; R.mAnn = mAnn; R.mMall = mMall; R.mCt = mCt; R.regS = regS; R.regF = regF;
    tint = [1, 1, 1]; XF = null;

    // ======================================================== region F: the tower and the city (shared builders)
    R.tower = P(tower({ podium: 'night' }), regF);
    R.sky = P(skyline({ skip: ['STARLIGHT', 'S2', 'S3', 'CHINATOWN', 'TOWER', 'CROWD', 'TRAFFIC'], sky: 'storm', neon: 0.35 }), regF);

    // ======================================================== m_ann: Ann Street, its footpaths, the Starlight's frontage, the gate
    b = new Builder();
    ground(-120, -7, 120, 7, -0.10, M.road, 8);
    const onZebra = (x0, x1) => (x1 > -32.3 && x0 < -27.7) || (x1 > -2.3 && x0 < 2.3);
    for (let x = -120; x < 120; x += 3) if (!onZebra(x, x + 1.6)) for (const z of [-3.5, 3.5]) bb(x, -0.1, z - 0.06, x + 1.6, -0.092, z + 0.06, 0x8a8a84);
    for (const [x0, x1] of [[-120, -32.3], [-27.7, -2.3], [2.3, 120]]) { for (const z of [-0.14, 0.14]) bb(x0, -0.1, z - 0.05, x1, -0.092, z + 0.05, 0x9a9070); for (const z of [-6.6, 6.6]) bb(x0, -0.1, z - 0.05, x1, -0.092, z + 0.05, 0x7a7a74); }
    for (const [x0, x1] of [[-32, -28], [-2, 2]]) {                         // raised zebras, flush with the footpaths
      bb(x0, -0.12, -7, x1, -0.02, 7, 0x34353e);
      for (let z = -6.5; z < 6.6; z += 1.0) bb(x0 + 0.35, -0.02, z, x1 - 0.35, 0.0, z + 0.5, 0xd8d8d0);
      for (const sx of [x0 - 0.5, x1]) bb(sx, -0.1, -7, sx + 0.5, -0.06, 7, 0x2a2b32);
    }
    bb(-120, -0.14, -11, 120, -0.02, -7, 0x6a6a72); bb(-120, -0.14, 7, 120, -0.02, 11, 0x6a6a72);   // kerbs
    ground(-120, -11, 120, -7, 0, M.pave, 4); ground(-120, 7, 120, 11, 0, M.pave, 4);
    ground(-36, 11, -24, 19.4, 0, M.paveRed, 4);                           // the Chinatown pocket (stays with the strip)
    // ---- the Starlight: brick shell (black inside), its frontage
    const VB = 0x3a3442;
    for (const [x0, x1, y0, y1] of [[-44, -39, 0, 8.5], [-39, -32, 0, 4.0], [-39, -32, 5.2, 8.5], [-32, -28.9, 0, 8.5], [-28.9, -27.9, 2.1, 8.5], [-27.9, -26, 0, 8.5]]) bb(x0, y0, -11.3, x1, y1, -11.0, VB);
    for (const [z0, z1, y0, y1] of [[-33, -29.6, 0, 8.5], [-29.6, -27.8, 2.4, 8.5], [-27.8, -11.3, 0, 8.5]]) bb(-26.3, y0, z0, -26.0, y1, z1, VB);
    bb(-44, 0, -33, -43.7, 8.5, -11.3, VB); bb(-43.7, 0, -33, -26.3, 8.5, -32.7, VB);
    bb(-43.7, 6.0, -32.7, -26.3, 8.2, -11.3, 0x2a2628);                     // roof slab (its underside: the hall's black ceiling)
    bb(-44, 8.5, -11.35, -26, 8.75, -10.95, 0x5a4a44); bb(-26.35, 8.5, -33, -25.95, 8.75, -11, 0x5a4a44);
    for (const [x, z] of [[-40, -20], [-33, -27], [-29, -16]]) bb(x - 0.8, 8.2, z - 0.6, x + 0.8, 9.0, z + 0.6, 0x7a7e84);
    tiles('S', -11.0, [[-44, -39, 0, 8.5], [-39, -32, 0, 4.0], [-39, -32, 5.2, 8.5], [-32, -28.9, 0, 8.5], [-28.9, -27.9, 2.1, 8.5], [-27.9, -26, 0, 8.5]], () => 3, -44, 0, 0xc8b0a8);
    tiles('E', -26.0, [[-33, -29.6, 0, 8.5], [-29.6, -27.8, 2.4, 8.5], [-27.8, -11, 0, 8.5]], () => 3, -33, 0, 0xc8b0a8);
    quad(2.6, 1.3, M.signs, -41.6, 1.6, -10.975, 0, 0, 0xffffff, SG.posters); quad(2.0, 1.0, M.signs, -30.6, 1.4, -10.975, 0, 0, 0xd8d0c8, SG.posters);
    // the high window from outside: a dark frame, streaked glass
    bb(-39.1, 3.9, -11.05, -31.9, 4.0, -10.9, 0x3a3a3c); bb(-39.1, 5.2, -11.05, -31.9, 5.3, -10.9, 0x3a3a3c);
    for (let x = -39.1; x < -31.8; x += 1.75) bb(x, 4.0, -11.05, x + 0.1, 5.2, -10.95, 0x3a3a3c);
    quad(7.0, 1.2, M.streak, -35.5, 4.6, -11.15, 0, 0, 0x8a9aaa, [0, 0, 3, 0.6]);
    // the stage door's frame + step, the blade sign's cabinet and brackets
    bb(-29.0, 0, -11.06, -28.9, 2.2, -10.95, 0x2a2e2c); bb(-27.9, 0, -11.06, -27.8, 2.2, -10.95, 0x2a2e2c); bb(-29.0, 2.1, -11.06, -27.8, 2.2, -10.95, 0x2a2e2c);
    bb(-29.1, 0, -10.95, -27.7, 0.04, -10.5, 0x4a4a4e);
    bb(-26.78, 3.8, -11.0, -26.42, 11.2, -9.6, 0x4a4450); bb(-26.8, 3.74, -11.0, -26.4, 3.8, -9.56, 0x2a262e); bb(-26.8, 11.2, -11.0, -26.4, 11.26, -9.56, 0x2a262e);
    for (const y of [4.6, 10.4]) bb(-26.66, y, -11.0, -26.54, y + 0.12, -10.85, 0x3a3a3e);
    // the lane: barrier at its mouth, bins, the chained main doors + the little marquee
    ground(-26, -41, -18, -11.4, 0.0, M.road, 6, 0x9a9aa0); ground(18, -41, 24, -11.4, 0.0, M.road, 6, 0x9a9aa0);
    for (const [x0, x1] of [[-26, -18], [18, 24]]) { bb(x0, 0, -11.6, x1, 1.2, -11.2, FOAM); for (let x = x0 + 1; x < x1; x += 2) bb(x - 0.03, 0.05, -11.62, x + 0.03, 1.15, -11.18, SEAM); bb(x0, 1.2, -11.65, x1, 1.28, -11.15, SEAM); }
    for (const [x, z, c] of [[-24.6, -14.5, 0x2a4a3a], [-23.4, -14.6, 0x3a3a44], [-19.8, -18, 0x2a4a3a]]) { bb(x - 0.35, 0, z - 0.4, x + 0.35, 1.05, z + 0.4, c); bb(x - 0.38, 1.05, z - 0.43, x + 0.38, 1.12, z + 0.43, 0x1a1a1e); }
    bb(-25.95, 0.9, -29.0, -25.85, 1.5, -28.4, 0x9a9aa0); bb(-25.9, 0.95, -28.8, -25.8, 1.15, -28.6, 0xc9a54a);   // chain + padlock
    bb(-25.98, 1.0, -28.1, -25.9, 1.4, -27.95, 0x3a8ad8);                                                      // SafeSense seal
    bb(-26.0, 2.55, -30.0, -25.3, 2.65, -27.4, 0x2a2628); quad(2.4, 0.75, M.signs, -25.95, 3.0, -28.7, H, 0, 0xffffff, SG.marquee);
    // the N / S footpath ends: padded QUIET ZONE fences
    for (const [x, z0, z1] of [[-46, -11, -7.3], [20, -11, -7.3], [-40, 7.3, 11], [16, 7.3, 11]]) { bb(x - 0.2, 0, z0, x + 0.2, 1.1, z1, FOAM); for (let z = z0 + 0.5; z < z1; z += 0.9) bb(x - 0.22, 0.05, z - 0.03, x + 0.22, 1.05, z + 0.03, SEAM); }
    // ---- the corner buildings on the south side: S2 (x −24…−8, h 15) and S3 (x 8…30, h 12)
    bb(-23.7, 0, 11.3, -8.3, 3.2, 56.7, 0x1a1a1e); bb(-24, 3.2, 11, -8, 15, 57, 0x5a3a32);
    bb(8.3, 0, 11.3, 29.7, 3.2, 56.7, 0x1a1a1e); bb(8, 3.2, 11, 30, 12, 57, 0x6a6470);
    for (const [x0, x1, z0, z1, h] of [[-24, -8, 11, 57, 15], [8, 30, 11, 57, 12]]) {   // parapets, AC units, a water tank
      bb(x0, h, z0, x1, h + 0.5, z0 + 0.25, 0x4a4248); bb(x0, h, z1 - 0.25, x1, h + 0.5, z1, 0x4a4248); bb(x0, h, z0, x0 + 0.25, h + 0.5, z1, 0x4a4248); bb(x1 - 0.25, h, z0, x1, h + 0.5, z1, 0x4a4248);
      for (let i = 0; i < 6; i++) { const x = x0 + 2 + ((i * 5.3) % (x1 - x0 - 4)), z = z0 + 3 + i * 7; bb(x, h, z, x + 1.4, h + 0.9, z + 1.0, i % 2 ? 0x8a8e92 : 0x6a6e72); bb(x + 0.2, h + 0.9, z + 0.2, x + 1.2, h + 0.95, z + 0.8, 0x3a3a3e); }
      quad(x1 - x0 - 0.5, z1 - z0 - 0.5, M.vc, (x0 + x1) / 2, h + 0.01, (z0 + z1) / 2, 0, -H, 0x5a5a64);
      for (let z = z0 + 6; z < z1 - 8; z += 9) { bb(x0 + 4, h, z, x0 + 6.5, h + 0.35, z + 2.5, 0x3a3a40); quad(2.3, 2.3, M.skylight, x0 + 5.25, h + 0.36, z + 1.25, 0, -H, 0xffffff); }
      for (let i = 0; i < 4; i++) boxR(3.2, 0.08, 1.4, 0x2a3a5a, x1 - 4, h + 0.6, z0 + 8 + i * 2.2, 0.35);
      bb(x0 + 3, h + 1.2, z1 - 6, x0 + 5, h + 2.8, z1 - 4, 0x5a5048); for (const [dx, dz] of [[0.1, 0.1], [1.8, 0.1], [0.1, 1.8], [1.8, 1.8]]) bb(x0 + 3 + dx, h, z1 - 6 + dz, x0 + 3.1 + dx, h + 1.2, z1 - 5.9 + dz, 0x3a3a3a);
    }
    tiles('N', 11, [[-24, -8, 3.2, 15]], (i, j) => ((i + j) % 3 === 1 ? 1 : 0), -24, 3.2);
    tiles('N', 11, [[8, 30, 3.2, 12]], () => 2, 8, 3.2, 0xb8b8c8);
    shops('N', 11, [{ a0: -23.7, a1: -16, tex: 2, cell: 4 }, { a0: -16, a1: -8.3, tex: 2, cell: 4 }], { pilaster: 0x2e3a32 });
    shops('N', 11, [{ a0: 8.3, a1: 19, tex: 2, cell: 5, door: [12.5, 14.5] }, { a0: 19, a1: 29.7, tex: 1, cell: 5 }], { pilaster: 0x5a5868 });
    for (const [x0, x1] of [[-24, -8], [8, 30]]) { bb(x0, 3.1, 9.8, x1, 3.3, 11, 0x5a6272); bb(x0, 3.05, 9.7, x1, 3.35, 9.82, FOAM); }   // awnings over the S footpath
    for (const [x, z] of [[-8, 11], [-24, 11], [8, 11], [30, 11]]) bb(x - 0.22, 0, z - 0.22, x + 0.22, 2.0, z + 0.22, FOAM);                // padded corners
    // ---- the Chinatown gate (paifang): red columns, beams, green glazed roofs with upturned eaves, the plaque
    const RED = 0xb0201e, GRN = 0x2f7a4a, GOLD = 0xc9a54a, STONE = 0x6a6660;
    R.gate = P(part('gate', () => {
    for (const x of [-35, -32, -28, -25]) { bb(x - 0.42, 0, 11.38, x + 0.42, 0.45, 12.22, STONE); bb(x - 0.3, 0.45, 11.5, x + 0.3, 5.0, 12.1, RED); bb(x - 0.33, 4.6, 11.47, x + 0.33, 4.7, 12.13, GOLD); }
    bb(-35.5, 5.0, 11.45, -24.5, 5.55, 12.15, RED); bb(-35.5, 5.0, 11.43, -24.5, 5.08, 12.17, GOLD); bb(-35.5, 5.47, 11.43, -24.5, 5.55, 12.17, GOLD);
    bb(-32.2, 5.55, 11.5, -27.8, 6.85, 12.1, RED);                                             // the central bay's frieze
    for (let x = -31.9; x < -27.9; x += 0.5) bb(x, 5.6, 11.44, x + 0.25, 5.8, 12.16, GOLD);     // bracket blocks
    bb(-31.35, 5.95, 11.38, -28.65, 6.7, 11.5, RED); quad(2.6, 0.66, M.signs, -30, 6.32, 11.37, PI, 0, 0xffffff, SG.plaque);
    const roof = (x0, x1, y0, ridge, d) => {   // a hipped green roof with flared, upturned corners
      const xc = (x0 + x1) / 2, w = x1 - x0, zc = 11.8;
      bb(x0 - 0.2, y0, zc - d / 2 - 0.15, x1 + 0.2, y0 + 0.12, zc + d / 2 + 0.15, 0x24603a);
      for (const s of [-1, 1]) boxR(w + 0.5, 0.1, d / 2 + 0.35, GRN, xc, y0 + (ridge - y0) * 0.45, zc + s * (d / 4 + 0.05), -s * 0.62);
      bb(x0 + 0.3, ridge - 0.08, zc - 0.12, x1 - 0.3, ridge + 0.14, zc + 0.12, 0x1e5030);
      for (const sx of [x0 - 0.3, x1 + 0.3]) for (const sz of [-1, 1]) boxR(0.7, 0.1, 0.18, GRN, sx + (sx < xc ? 0.2 : -0.2), y0 + 0.2, zc + sz * (d / 2 + 0.05), 0, 0, (sx < xc ? 1 : -1) * 0.45);
      for (const sx of [x0 + 0.25, x1 - 0.25]) bb(sx - 0.1, ridge - 0.1, zc - 0.1, sx + 0.1, ridge + 0.35, zc + 0.1, 0x1e5030);
    };
    roof(-32.6, -27.4, 6.85, 7.8, 1.8); roof(-35.6, -32.0, 5.55, 6.4, 1.5); roof(-28.0, -24.4, 5.55, 6.4, 1.5);
    }), mAnn);
    // the pocket's padded barrier (z 19.4), pocket bollards come from the instanced set
    bb(-36, 0, 19.4, -24, 1.2, 19.8, FOAM); for (let x = -35.5; x < -24; x += 1.5) bb(x - 0.03, 0.05, 19.38, x + 0.03, 1.15, 19.82, SEAM); bb(-36, 1.2, 19.35, -24, 1.28, 19.85, SEAM);
    mAnn.add(b.done());

    // ---- the guardian lions with their foam mouthguards
    R.lions = P(part('lions', () => {
      for (const x of [-35.8, -24.2]) {
        at(x, 10.3, PI);
        bb(-0.45, 0, -0.45, 0.45, 0.8, 0.45, 0x5a5650); bb(-0.5, 0.8, -0.5, 0.5, 0.88, 0.5, 0x6a6660);
        const ST2 = 0xb0aa9c;
        bb(-0.28, 0.88, -0.32, 0.28, 1.28, 0.2, ST2);                           // haunches
        boxR(0.46, 0.55, 0.34, ST2, 0, 1.45, 0.12, -0.25);                      // chest
        for (const sx of [-0.15, 0.15]) bb(sx - 0.07, 0.88, 0.18, sx + 0.07, 1.35, 0.32, ST2);   // front legs
        ico(0.26, 0x9a9488, 0, 1.86, 0.18, 1.0);                                // mane
        bb(-0.17, 1.72, 0.22, 0.17, 1.98, 0.46, ST2);                           // head
        bb(-0.12, 1.66, 0.4, 0.12, 1.82, 0.55, FOAM); bb(-0.13, 1.7, 0.53, 0.13, 1.76, 0.56, SEAM);   // the foam mouthguard
        ico(0.09, 0x7a746a, 0.18, 0.98, 0.34, 1.0);                             // the ball under a paw
        for (const sx of [-0.1, 0.1]) bb(sx - 0.03, 1.88, 0.45, sx + 0.03, 1.93, 0.47, 0x2a2826);
        XF = null;
      }
    }), mAnn);

    // ======================================================== m_mall: Brunswick St Mall
    b = new Builder();
    ground(-8, 11, 8, 57, 0, M.pave, 4);
    for (let z = 12; z < 57; z += 6) bb(-0.2, -0.002, z, 0.2, 0.004, z + 2.5, 0x2a2c34);               // a drain line down the middle
    // west shopfronts (S2 east face, x −8) and east shopfronts (S3 west face, x 8)
    shops('E', -8, [{ a0: 11.3, a1: 20, cell: 0, door: [18.4, 19.5] }, { a0: 20, a1: 26, cell: 1, door: [24.7, 25.7] }, { a0: 26, a1: 36, cell: 2, sign: 'light' },
      { a0: 36, a1: 46, cell: 3, door: [40.4, 41.6], sign: false }, { a0: 46, a1: 56.7, cell: 4 }]);
    shops('W', 8, [{ a0: 11.3, a1: 18, cell: 5 }, { a0: 18, a1: 24, tex: 2, cell: 0, door: [22.6, 23.6] }, { a0: 24, a1: 36, cell: 6, door: [33.6, 34.8], sign: 'light' },
      { a0: 36, a1: 46, tex: 2, cell: 1, door: [43.0, 44.1] }, { a0: 46, a1: 56.7, cell: 7, door: [53, 54] }]);
    // QUIET CUP's takeaway hatch: an opening with a steel ledge (the urn stands on it)
    bb(7.55, 0.95, 28.9, 8.05, 1.0, 31.1, 0x9aa0a8); bb(7.6, 0.6, 28.95, 7.68, 0.95, 31.05, 0x5a5e64);
    tiles('E', -8, [[11, 57, 3.2, 15]], (i, j) => ((i * 3 + j) % 4 === 1 ? 1 : 0), 11, 3.2);
    tiles('W', 8, [[11, 57, 3.2, 12]], () => 2, 11, 3.2, 0xb8b8c8);
    // awnings, cantilevered 1.5 m with padded edges and warm downlights
    for (const [x0, x1, ex0, ex1] of [[-8, -6.5, -6.62, -6.5], [6.5, 8, 6.5, 6.62]]) {
      bb(x0, 3.15, 11.2, x1, 3.3, 56.8, 0x5a6272); for (let z = 11.6; z < 56.8; z += 1.6) bb(x0, 3.3, z, x1, 3.305, z + 0.8, 0x6a7282); bb(ex0, 3.08, 11.2, ex1, 3.36, 56.8, FOAM);
      for (let z = 12; z < 56.8; z += 1.2) bb(ex0 - 0.005, 3.08, z, ex1 + 0.005, 3.36, z + 0.04, SEAM);
      for (let z = 13; z < 56; z += 3) quad(0.35, 0.35, M.glow, (x0 + x1) / 2, 3.145, z, 0, H);
    }
    // the far barrier (z 57): padded cream wall
    bb(-8, 0, 56.8, 8, 1.2, 57.2, FOAM); for (let x = -7.5; x < 8; x += 1.0) bb(x - 0.03, 0.05, 56.78, x + 0.03, 1.15, 57.22, SEAM); bb(-8, 1.2, 56.75, 8, 1.28, 57.25, SEAM);
    // planters (trees are instanced), benches, Mia's QR tip sign
    for (const z of [16, 40, 46, 52]) { bb(-0.6, 0, z - 0.6, 0.6, 0.5, z + 0.6, 0x5a5048); bb(-0.66, 0.42, z - 0.66, 0.66, 0.5, z + 0.66, FOAM); bb(-0.5, 0.5, z - 0.5, 0.5, 0.52, z + 0.5, 0x2a2018); }
    at(-5.6, 30.4); benchModel(1.8); at(5.6, 18.0, PI); benchModel(1.8); at(-5.6, 44.0); benchModel(1.8); XF = null;
    at(-4.55, 31.7, H);                                                         // A-frame facing +X (local +Z)
    boxR(0.45, 0.62, 0.03, 0xe8e0d0, 0, 0.31, 0.1, -0.16); boxR(0.45, 0.62, 0.03, 0xe8e0d0, 0, 0.31, -0.1, 0.16);
    quad(0.4, 0.4, M.signs, 0, 0.36, 0.125, 0, -0.16, 0xffffff, SG.qr);
    cyl(0.05, 0.05, 0.08, 8, 0xb8bcc0, 0.12, 0.04, 0.32); XF = null;
    // padded bins
    for (const [x, z] of [[-6.8, 22.5], [6.8, 37.5], [-6.8, 50.5]]) { cyl(0.28, 0.26, 0.95, 10, FOAM, x, 0.475, z); cyl(0.3, 0.3, 0.06, 10, SEAM, x, 0.98, z); }
    mMall.add(b.done());

    // ======================================================== m_ct: the Chinatown vista (lanterns, shopfronts, wires)
    b = new Builder();
    ground(-36, 19.4, -24, 60, 0, M.paveRed, 4);
    shops('W', -24, [{ a0: 11.3, a1: 19.4, tex: 2, cell: 6, door: [16, 17] }, { a0: 19.4, a1: 28, tex: 2, cell: 2, door: [25.5, 26.6] }, { a0: 28, a1: 37, tex: 2, cell: 3 },
      { a0: 37, a1: 47, tex: 2, cell: 2, door: [44, 45] }, { a0: 47, a1: 56.7, tex: 2, cell: 7 }], { pilaster: 0x6a1a16, fascia: 0x8a1a16, trim: GOLD });
    tiles('W', -24, [[11, 57, 3.2, 15]], (i, j) => ((i + 2 * j) % 3 === 1 ? 1 : 0), 11, 3.2, 0xd8c0b8);
    for (let z = 11.5; z < 56.5; z += 4.5) { bb(-24.9, 2.95, z, -24, 3.12, z + 3.8, 0x8a1a16); bb(-24.95, 2.92, z, -24.85, 3.15, z + 3.8, GOLD); }
    // catenary wires for the lantern rows (a slight sag) between the facades
    { const { z0, z1, dz } = VG.chinatown.lanternRows; for (let z = z0; z <= z1 + 0.01; z += dz) { at(-30, z, H); for (let i = 0; i < 6; i++) { const x0 = -6 + i * 2, x1 = x0 + 2, s0 = 0.18 * (1 - (x0 / 6) ** 2), s1 = 0.18 * (1 - (x1 / 6) ** 2); seg(5.75 - s0, x0, 5.75 - s1, x1, 0.025, 0x141414); } XF = null; } }
    mCt.add(b.done());

    // ======================================================== neon (physical shapes; one material per colour)
    const neonGroup = (name, parent, fn) => { const pb = b, px = XF; b = new Builder(); XF = null; fn(); const g = b.done({ floor: false }); g.name = name; b = pb; XF = px; parent.add(g); return g; };
    R.neonMall = neonGroup('neon_mall', mMall, () => {
      wq('E', -7.9, 15.5, 4.3, 1.5, 1.5, M.neonR, NEO(2));              // dumpling house: red dumpling
      wq('E', -7.9, 51.5, 4.4, 1.3, 1.6, M.neonM, NEO(1));              // records: pink guitar (dimmed)
      wq('W', 7.9, 41.0, 4.6, 2.0, 1.6, M.neonT, NEO(0));               // whisper bar: teal cocktail
      wq('W', 7.9, 51.5, 4.4, 1.3, 1.5, M.neonR, NEO(6));               // kebabs: flame
      wq('W', 7.9, 21.0, 4.4, 1.1, 1.1, M.neonT, NEO(7));               // phone repairs: a note
      wq('E', -8.5, 30.0, 16.2, 1.8, 1.8, M.neonM, NEO(4));             // S2's rooftop stars (backing frame below)
      for (const [z, i] of [[24, 5], [34, 2], [46, 5]]) wq('W', -24.1, z, 4.2, 1.3, 1.3, M.neonR, NEO(i));   // Chinatown: fish / dumplings
      for (const [z, i] of [[28, 2], [40, 5], [52, 2]]) wq('E', -35.9, z, 4.2, 1.3, 1.3, M.neonR, NEO(i));
    });
    R.neonAnn = neonGroup('neon_annst', mAnn, () => {
      wq('N', 10.9, 19.0, 7.0, 2.0, 2.4, M.neonT, NEO(0));              // S3: the upstairs teal cocktail glass
      wq('N', 10.9, -16.0, 6.4, 1.6, 1.6, M.neonM, NEO(4));             // the corner pub's dead-ish stars
    });
    { const pb = b; b = new Builder(); bb(-8.62, 15.0, 29.0, -8.5, 17.2, 31.0, 0x2a2a30); for (const z of [29.2, 30.8]) bb(-8.6, 15.0, z - 0.05, -8.4, 15.4, z + 0.05, 0x3a3a3e); mMall.add(b.done()); b = pb; }
    // NAP CLUB (its own material so it can buzz), its P on a separate quad
    R.nap = P(new THREE.Group(), mMall); R.nap.name = 'napclub_sign';
    { const pb = b; b = new Builder(); const zA = 43.2, zB = 38.8, L = zA - zB, y0 = 4.2, y1 = 5.4;
      // facing +X: u runs from +Z (left) to −Z (right)
      const zu = (u) => zA - u * L, seg2 = (u0, u1, m) => quad((u1 - u0) * L, y1 - y0, m, -7.9, (y0 + y1) / 2, (zu(u0) + zu(u1)) / 2, H, 0, 0xffffff, [u0, 0, u1, 1]);
      seg2(0, NAPP[0], M.nap); seg2(NAPP[0], NAPP[1], M.napP); seg2(NAPP[1], 1, M.nap);
      bb(-8.0, 4.05, 38.6, -7.97, 5.55, 43.4, 0x1a1a20);
      R.nap.add(b.done({ floor: false })); b = pb; }
    // the STARLIGHT blade (dead until lit)
    R.blade = P(part('blade_starlight', () => {
      quad(1.3, 7.0, M.blade, -26.415, 7.5, -10.35, H, 0, 0xffffff); quad(1.3, 7.0, M.blade, -26.785, 7.5, -10.35, -H, 0, 0xffffff);
    }, null, 0, { floor: false }), mAnn);

    // ======================================================== instanced repeats
    // padded bollards: kerbs (both footpaths, gaps at the zebras), the mall-head row, Mia's step, the Chinatown pocket
    const BOL = [];
    for (let x = -60; x <= 40; x += 2) if (!(x > -33 && x < -27) && !(x > -3 && x < 3)) BOL.push([x, 0, -7.35, 0], [x, 0, 7.35, 0]);
    for (let x = -6; x <= 6.01; x += 1.5) BOL.push([x, 0, 11.6, 0]);
    BOL.push([-3.6, 0, 27.55, 0]);
    for (const [x, z] of [[-35.2, 15], [-35.2, 18], [-24.8, 15], [-24.8, 18]]) BOL.push([x, 0, z, 0]);
    const bolGeo = shapeGeo(() => {
      cyl(0.1, 0.1, 0.9, 8, 0x5a6068, 0, 0.45, 0); cyl(0.2, 0.2, 0.74, 10, FOAM, 0, 0.43, 0);
      for (const y of [0.18, 0.43, 0.68]) cyl(0.205, 0.205, 0.03, 10, SEAM, 0, y, 0);
      cyl(0.13, 0.13, 0.1, 8, 0x3a3e44, 0, 0.85, 0); cyl(0.21, 0.21, 0.05, 10, 0x4a4e54, 0, 0.025, 0);
    });
    R.bollards = instanced(bolGeo, M.vc, BOL); R.bollards.name = 'bollards'; mAnn.add(R.bollards);
    for (const p of BOL) if (Math.abs(p[2]) > 8) COL.push([p[0] - 0.22, p[2] - 0.22, p[0] + 0.22, p[2] + 0.22]);
    // street lamps: Ann St (6.5 m, arms over the road) + the mall (4.6 m, arms toward the centre)
    const LAMP = [];
    for (const x of [-56, -40, -24, -8, 8, 24, 40]) LAMP.push([x, 0, -9.6, 0, 1], [x, 0, 9.6, PI, 1]);
    for (const z of [16, 36, 52]) LAMP.push([-6.4, 0, z, H, [1, 4.6 / 6.5, 1]]);
    for (const z of [22, 40, 49]) LAMP.push([6.4, 0, z, -H, [1, 4.6 / 6.5, 1]]);
    const postGeo = shapeGeo(() => {
      cyl(0.16, 0.18, 0.2, 8, 0x3a3e44, 0, 0.1, 0); cyl(0.07, 0.09, 6.5, 8, 0x4a5058, 0, 3.25, 0);
      cyl(0.15, 0.15, 1.8, 10, FOAM, 0, 1.1, 0); for (const y of [0.5, 1.1, 1.7]) cyl(0.155, 0.155, 0.03, 10, SEAM, 0, y, 0);
      boxR(0.06, 0.06, 1.1, 0x4a5058, 0, 6.35, 0.5); boxR(0.3, 0.12, 0.5, 0x2a2e34, 0, 6.32, 1.05);
    });
    R.lampPosts = instanced(postGeo, M.vc, LAMP); R.lampPosts.name = 'lamps'; mAnn.add(R.lampPosts);
    const headGeo = new THREE.BoxGeometry(0.26, 0.04, 0.44); headGeo.translate(0, 6.25, 1.05);
    R.lampHeads = instanced(headGeo, M.lampHead, LAMP); R.lampHeads.name = 'lamp_heads'; mAnn.add(R.lampHeads);
    for (const p of LAMP) COL.push([p[0] - 0.15, p[2] - 0.15, p[0] + 0.15, p[2] + 0.15]);
    // fake light pools (additive soft discs) under the lamp heads and the awning downlights
    { const pm = mesher(), pool = (x, z, r, y, k, cr = 1, cg = 0.82, cb = 0.62) => pm.rgb(cr * k, cg * k, cb * k).top(x - r, z - r, x + r, z + r, y);
      for (const x of [-56, -40, -24, -8, 8, 24, 40]) { pool(x, -9.0, 2.3, 0.013, 0.42); pool(x, 9.0, 2.3, 0.013, 0.42); }
      for (const z of [16, 36, 52]) pool(-5.35, z, 2.6, 0.013, 0.36); for (const z of [22, 40, 49]) pool(5.35, z, 2.6, 0.013, 0.36);
      for (let z = 13; z < 56; z += 3) { pool(-7.25, z, 1.1, 0.014, 0.22, 1, 0.9, 0.75); pool(7.25, z, 1.1, 0.014, 0.22, 1, 0.9, 0.75); }
      R.pools = pm.mesh(M.pool, 'lamp_pools', false); R.pools.renderOrder = 1; mAnn.add(R.pools); }
    // the mall's trees (trunks foam-wrapped to 1.5 m; low-poly crowns that sway a little)
    const TREES = [16, 40, 46, 52].map((z) => [0, 0.5, z, 0]);
    const trunkGeo = shapeGeo(() => { cyl(0.11, 0.14, 2.6, 6, 0x5a4636, 0, 1.3, 0); cyl(0.18, 0.18, 1.0, 8, FOAM, 0, 0.5, 0); cyl(0.185, 0.185, 0.03, 8, SEAM, 0, 0.5, 0); });
    const crownGeo = shapeGeo(() => { ico(1.1, 0x6a9a64, 0, 2.6, 0, 0.8); ico(0.8, 0x7aaa70, 0.55, 2.35, 0.35, 0.8); ico(0.75, 0x5a8a5a, -0.55, 2.9, -0.25, 0.8); ico(0.6, 0x7aaa70, 0.1, 3.2, 0.5, 0.8); });
    R.trunks = instanced(trunkGeo, M.vc, TREES); R.trunks.name = 'trees_mall'; mMall.add(R.trunks);
    R.crowns = instanced(crownGeo, M.vc, TREES); R.crowns.name = 'tree_crowns'; R.crowns.instanceMatrix.setUsage(THREE.DynamicDrawUsage); mMall.add(R.crowns);
    // lanterns: 48 over Chinatown Mall + 6 under the gate (bodies glow; tassels plain)
    const LAN = [];
    { const { z0, z1, dz, xs, y } = VG.chinatown.lanternRows; for (let z = z0; z <= z1 + 0.01; z += dz) for (const x of xs) LAN.push([x, y + 0.48, z, 0]); }
    for (const x of [-34, -33, -31, -29, -27, -26]) LAN.push([x, 4.98, 11.8, 0]);
    const lanGeo = new THREE.LatheGeometry([[0.06, 0.0], [0.2, -0.08], [0.27, -0.22], [0.28, -0.36], [0.24, -0.5], [0.14, -0.58], [0.06, -0.6]].map(([x, y]) => new THREE.Vector2(x, y)), 10);
    R.lanterns = instanced(lanGeo, M.lantern, LAN); R.lanterns.name = 'lanterns'; R.lanterns.instanceMatrix.setUsage(THREE.DynamicDrawUsage); mCt.add(R.lanterns);
    const tasGeo = shapeGeo(() => { cyl(0.07, 0.07, 0.04, 8, 0xc9a54a, 0, -0.62, 0); bb(-0.02, -0.92, -0.02, 0.02, -0.62, 0.02, 0xb0201e); cyl(0.012, 0.012, 0.06, 4, 0x1a1a1a, 0, 0.03, 0); });
    R.tassels = instanced(tasGeo, M.vc, LAN); R.tassels.name = 'lantern_tassels'; R.tassels.instanceMatrix.setUsage(THREE.DynamicDrawUsage); mCt.add(R.tassels);
    R.LAN = LAN.map((p, i) => ({ x: p[0], y: p[1], z: p[2], ph: (i * 2.39) % TAU, f: 0.6 + ((i * 7) % 10) / 33 }));
    // ground glow streaks under the neon and the lantern rows (additive, tinted per instance)
    const REF = [
      [-7.6, 0.012, 15.5, H, 0xff3a2a, 1.4, 2.6], [-7.6, 0.012, 41.0, H, 0xff3fa4, 3.6, 3.4], [-7.6, 0.012, 51.5, H, 0xff3fa4, 1.2, 2.2],
      [7.6, 0.012, 41.0, -H, 0x2fe8d6, 1.8, 3.0], [7.6, 0.012, 51.5, -H, 0xff5a2a, 1.2, 2.2], [7.6, 0.012, 21.0, -H, 0x2fe8d6, 1.0, 1.8],
      [19.0, -0.09, 9.0, PI, 0x2fe8d6, 1.8, 4.0], [-39.5, -0.09, 9.2, PI, 0xff3fa4, 3.4, 5.0], [-39.5, -0.09, 4.0, PI, 0x2fe8d6, 2.2, 3.4],
      [-16.0, -0.09, 8.8, PI, 0xff3fa4, 1.2, 2.4], [-23.6, 0.012, 24, -H, 0xff3a2a, 1.0, 1.8], [-23.6, 0.012, 34, -H, 0xff3a2a, 1.0, 1.8], [-35.6, 0.012, 40, H, 0xff3a2a, 1.0, 1.8],
    ];
    { const { z0, z1, dz } = VG.chinatown.lanternRows; for (let z = z0; z <= z1 + 0.01; z += dz) REF.push([-30, 0.013, z, 0, 0xff5a30, 9.0, 1.2]); }
    for (const x of [-56, -40, -24, -8, 8, 24, 40]) REF.push([x, -0.09, -8.4 + 2.2, 0, 0xffc890, 1.0, 3.0], [x, -0.09, 8.4 - 2.2, PI, 0xffc890, 1.0, 3.0]);
    const refGeo = new THREE.PlaneGeometry(1, 1); refGeo.rotateX(-H); refGeo.translate(0, 0, 0.5);
    R.reflect = instanced(refGeo, M.reflect, REF.map((r) => [r[0], r[1], r[2], r[3], [r[5], 1, r[6]]])); R.reflect.name = 'reflections';
    for (let i = 0; i < REF.length; i++) R.reflect.setColorAt(i, tcol.setHex(REF[i][4]).multiplyScalar(0.6));
    R.reflect.instanceColor.needsUpdate = true; R.reflect.frustumCulled = false; mAnn.add(R.reflect);
    // hover-cars (body / underside glow / shadow) on Ann St
    const carGeo = shapeGeo(() => {
      const BODY = 0xe8eaee, GL = 0x3a4a5c;
      bb(-1.75, 0.1, -0.84, 1.75, 0.5, 0.84, BODY); bb(-1.95, 0.0, -0.74, 1.95, 0.14, 0.74, 0x6a7078);
      boxR(0.5, 0.36, 1.66, BODY, 1.85, 0.3, 0, 0, 0, 0.5); boxR(0.45, 0.36, 1.66, BODY, -1.85, 0.3, 0, 0, 0, -0.45);
      { const sh = new THREE.Shape(); sh.moveTo(-1.25, 0); sh.lineTo(1.2, 0); sh.lineTo(0.55, 0.42); sh.lineTo(-0.85, 0.42); sh.closePath();
        const eg = new THREE.ExtrudeGeometry(sh, { depth: 1.36, bevelEnabled: false }); eg.translate(0, 0.5, -0.68); put(eg, GL); }
      bb(-0.8, 0.92, -0.6, 0.5, 0.95, 0.6, BODY);
      bb(1.98, 0.26, -0.6, 2.04, 0.34, -0.3, 0xfffbe8); bb(1.98, 0.26, 0.3, 2.04, 0.34, 0.6, 0xfffbe8);
      bb(-2.02, 0.28, -0.66, -1.96, 0.34, 0.66, 0xc83030);
    });
    const CARS = [];
    for (let i = 0; i < 6; i++) { const lane = [-5.25, -1.75, 1.75, 5.25][i % 4], dir = lane < 0 ? 1 : -1; CARS.push({ x: -60 + i * 23, lane, dir, v: 2.0, stopT: 0, on: true, k: (i * 0.37) % 1 }); }
    const CI = CARS.map((c) => [c.x, 0.32, c.lane, c.dir > 0 ? 0 : PI]);
    R.carBody = instanced(carGeo, M.vc, CI); R.carBody.name = 'traffic';
    const cols = [0xe8e8ec, 0x6a8ab8, 0xc85a5a, 0xa8b0b8, 0x7aa08a, 0xe8d8b0];
    for (let i = 0; i < 6; i++) R.carBody.setColorAt(i, tcol.setHex(cols[i]));
    const glowGeo = new THREE.PlaneGeometry(4.0, 2.0); glowGeo.rotateX(-H); glowGeo.translate(0, -0.25, 0);
    R.carGlow = instanced(glowGeo, M.carGlow, CI); R.carGlow.name = 'traffic_glow';
    const shGeo = new THREE.PlaneGeometry(5.0, 2.4); shGeo.rotateX(-H);
    R.carShadow = instanced(shGeo, M.carShadow, CI.map((p) => [p[0], -0.085, p[2], p[3]])); R.carShadow.name = 'traffic_shadow';
    for (const im of [R.carBody, R.carGlow, R.carShadow]) { im.instanceMatrix.setUsage(THREE.DynamicDrawUsage); im.frustumCulled = false; mAnn.add(im); }
    R.CARS = CARS;
    // shush drones (decor) with their expanding rings
    R.shush = DRONE_INSTANCED.make(4, { state: 'patrol' }); R.shush.group.name = 'shush_drones'; mAnn.add(R.shush.group);
    const ringGeo = new THREE.PlaneGeometry(1, 1); ringGeo.rotateX(-H);
    R.shushRing = instanced(ringGeo, M.shushRing, [[0, -100, 0, 0], [0, -100, 0, 0], [0, -100, 0, 0], [0, -100, 0, 0]]);
    for (let i = 0; i < 4; i++) R.shushRing.setColorAt(i, tcol.setHex(0xbfe6ff));
    R.shushRing.name = 'shush_rings'; R.shushRing.frustumCulled = false; R.shushRing.instanceMatrix.setUsage(THREE.DynamicDrawUsage); mAnn.add(R.shushRing);
    // far crowd figures: the NAP CLUB queue (3, dressing gowns), the Chinatown pocket (5), the far mall (10)
    const CR = [[-7.0, 43.5, PI], [-7.0, 44.4, PI], [-7.0, 45.3, PI], [-33.0, 14.6, 0.4], [-31.4, 16.9, -2.8], [-27.6, 13.4, 2.6], [-26.3, 17.4, -0.6], [-29.9, 18.6, PI]];
    { const q = rng(818); for (let i = 0; i < 10; i++) CR.push([-5 + q() * 10, 46.5 + q() * 9.5, q() * TAU]); }
    const figGeo = shapeGeo(() => {
      bb(-0.15, 0.0, -0.06, -0.04, 0.05, 0.12, 0x5a5a5a); bb(0.04, 0.0, -0.06, 0.15, 0.05, 0.12, 0x5a5a5a);
      cyl(0.055, 0.06, 0.78, 6, 0xb8b8b8, -0.09, 0.42, 0); cyl(0.055, 0.06, 0.78, 6, 0xb8b8b8, 0.09, 0.42, 0);
      cyl(0.19, 0.23, 0.68, 8, 0xffffff, 0, 1.1, 0); cyl(0.24, 0.19, 0.1, 8, 0xffffff, 0, 1.47, 0);
      for (const s of [-1, 1]) { boxR(0.09, 0.62, 0.1, 0xf0f0f0, s * 0.26, 1.14, 0.0, 0, 0, s * 0.08); boxR(0.07, 0.08, 0.07, 0xe0c0a0, s * 0.29, 0.8, 0.0); }
      cyl(0.05, 0.06, 0.08, 6, 0xe0c0a0, 0, 1.55, 0);
    });
    const headG = new THREE.IcosahedronGeometry(0.12, 1); headG.scale(0.95, 1.1, 1); headG.translate(0, 0.17, 0);
    R.crowdBody = instanced(figGeo, M.vc, CR.map((c) => [c[0], 0, c[1], c[2]])); R.crowdBody.name = 'crowd_far';
    R.crowdHead = instanced(headG, M.vc, CR.map((c) => [c[0], 1.5, c[1], c[2]])); R.crowdHead.name = 'crowd_far_heads';
    { const q = rng(77); const gowns = [0xe8c0e8, 0xb8d8f0, 0xf0d8b0], wear = [0x5a6a7a, 0x8a5a5a, 0x4a4a58, 0x9a8a6a, 0x6a7a5a, 0x9a8aaa, 0x4a5a7a, 0xb0a090], skin = [0xe8c0a0, 0xc89a78, 0x8a6048, 0xf0d0b8, 0xa87858];
      for (let i = 0; i < CR.length; i++) { R.crowdBody.setColorAt(i, tcol.setHex(i < 3 ? gowns[i] : wear[(q() * wear.length) | 0])); R.crowdHead.setColorAt(i, tcol.setHex(skin[(q() * skin.length) | 0])); } }
    for (const im of [R.crowdBody, R.crowdHead]) { im.instanceMatrix.setUsage(THREE.DynamicDrawUsage); im.frustumCulled = false; mMall.add(im); }
    R.CR = CR.map((c, i) => ({ x: c[0], z: c[1], ry: c[2], ph: i * 1.7 }));

    // ======================================================== the puzzle corner's props (2.8)
    // the SafeSense pole beside Mia's bench: meter, ring light, rungs; the Safe Box on top (a child: it sways with the pole)
    R.pole = P(part('pole_mia', poleModel, [-3.6, 0, 28.2]), mMall);
    const meterGeo = new THREE.PlaneGeometry(0.035, 0.18); meterGeo.translate(0, 0.09, 0); meterGeo.rotateY(H);
    R.meterBar = new THREE.Mesh(meterGeo, M.meter); R.meterBar.position.set(0.123, 2.105, 0.07); R.meterBar.name = 'meter_bar'; R.pole.add(R.meterBar);
    const ringG = new THREE.TorusGeometry(0.12, 0.022, 4, 16); ringG.rotateX(H);
    R.ringLight = new THREE.Mesh(ringG, M.ring); R.ringLight.position.y = 2.9; R.ringLight.name = 'ring_light'; R.pole.add(R.ringLight);
    R.box = safeBox('safebox_mia', 'mia'); R.box.position.y = 3.0; R.pole.add(R.box);
    R.boxUke = PROPS.ukulele(); R.boxUke.name = 'safebox_uke'; R.boxUke.position.set(0.02, 0.16, 0.06); R.boxUke.rotation.set(0.15, 0.35, 2.25); R.boxUke.scale.setScalar(0.92); R.boxUke.visible = false; R.box.add(R.boxUke);
    R.keyFlash = new THREE.Mesh(artSharedGeo('vl_keyq', () => new THREE.PlaneGeometry(0.045, 0.04)), M.keyFlash); R.keyFlash.rotation.y = PI; R.keyFlash.visible = false; R.box.add(R.keyFlash);
    for (const [name, x, z, kind] of [['pole_b', 3.6, 18.0, 'trumpet'], ['pole_c', -3.6, 48.0, 'tambourine']]) {
      const pg = P(part(name, poleModel, [x, 0, z]), mMall), sb = safeBox(name === 'pole_b' ? 'safebox_b' : 'safebox_c', kind);
      sb.position.y = 3.0; pg.add(sb); sb.userData.ledObj.material = M.ledR;
      COL.push([x - 0.15, z - 0.15, x + 0.15, z + 0.15]);
    }
    COL.push([-3.75, 28.05, -3.45, 28.35]);
    // the confiscated ukulele (a copy owned by the set, for the swoop), Chase's phone on table C
    R.uke = PROPS.ukulele(); R.uke.name = 'uke_prop'; R.uke.visible = false; mMall.add(R.uke);
    R.phone = P(part('phone_drop', () => { bb(-0.038, 0, -0.078, 0.038, 0.009, 0.078, 0x15161a); bb(-0.032, 0.009, -0.07, 0.032, 0.0095, 0.07, 0x7ac0ff, M.phoneScr); }, [3.6, 0.745, 31.4], 0.3, { floor: false }), mMall);
    const prGeo = new THREE.PlaneGeometry(1, 1); prGeo.rotateX(-H);
    R.phoneRing = new THREE.Mesh(prGeo, M.phoneRing); R.phoneRing.position.y = 0.012; R.phoneRing.name = 'phone_ring'; R.phone.add(R.phoneRing);
    R.phone.visible = false;
    // QUIET CUP's café furniture: four round tables with padded rims, two chairs each, closed padded umbrellas
    R.cafe = P(part('cafe', () => {
      for (const [x, z] of [[3.4, 27.0], [5.6, 28.6], [3.6, 31.4], [5.8, 33.4]]) {
        at(x, z);
        cyl(0.2, 0.24, 0.04, 8, 0x3a3e44, 0, 0.02, 0); cyl(0.04, 0.04, 0.7, 6, 0x5a6068, 0, 0.37, 0);
        cyl(0.4, 0.4, 0.04, 14, 0xd8d0c0, 0, 0.72, 0); { const t = new THREE.TorusGeometry(0.4, 0.035, 4, 16); t.rotateX(H); t.translate(0, 0.72, 0); put(t, FOAM); }
        cyl(0.025, 0.025, 1.6, 6, 0x8a9098, 0, 1.5, 0); cyl(0.07, 0.16, 0.9, 8, FOAM, 0, 1.85, 0); cyl(0.05, 0.05, 0.12, 6, SEAM, 0, 2.36, 0);
        for (const s of [-1, 1]) {   // chairs north and south of the table, facing it
          bb(-0.2, 0.43, s * 0.6 - 0.2, 0.2, 0.47, s * 0.6 + 0.2, 0x6a5a4a); bb(-0.2, 0.47, s * 0.78 - 0.02, 0.2, 0.9, s * 0.78 + 0.02, 0x6a5a4a);
          for (const dx of [-0.17, 0.17]) for (const dz of [-0.17, 0.17]) bb(dx - 0.015, 0, s * 0.6 + dz - 0.015, dx + 0.015, 0.43, s * 0.6 + dz + 0.015, 0x3a3e44);
        }
        XF = null;
        COL.push([x - 0.5, z - 0.8, x + 0.5, z + 0.8]);
      }
    }), mMall);
    // the tea urn on QUIET CUP's takeaway ledge (the street's kettle)
    R.urn = P(part('urn', () => {
      cyl(0.17, 0.17, 0.03, 12, 0x2a2c30, 0, 0.015, 0); cyl(0.15, 0.155, 0.4, 12, 0xeef2f6, 0, 0.23, 0, 0, 0, M.chrome);   // foot, brushed body
      for (const y of [0.1, 0.38]) cyl(0.154, 0.154, 0.018, 12, 0x7a8088, 0, y, 0, 0, 0, M.chrome);                       // pressed bands
      cyl(0.16, 0.16, 0.03, 12, 0xb8bec6, 0, 0.445, 0, 0, 0, M.chrome); cyl(0.05, 0.14, 0.05, 12, 0xdce0e6, 0, 0.485, 0, 0, 0, M.chrome); cyl(0.028, 0.028, 0.045, 8, 0x1a1a1e, 0, 0.53, 0);
      bb(-0.143, 0.12, 0.034, -0.137, 0.37, 0.046, 0xffffff, M.urnHi); bb(-0.135, 0.12, -0.082, -0.129, 0.37, -0.074, 0xffffff, M.urnHi);   // the chrome's two highlights
      for (const s of [-1, 1]) bb(-0.02, 0.3, s * 0.15, 0.02, 0.34, s * 0.2, 0x1a1a1e);                    // handles
      bb(-0.2, 0.07, -0.028, -0.145, 0.125, 0.028, 0x1a1a1e); bb(-0.205, 0.035, -0.012, -0.185, 0.075, 0.012, 0x9aa0a8); bb(-0.215, 0.125, -0.01, -0.195, 0.17, 0.01, 0xb02a2a);   // tap, spout, red lever
      bb(-0.158, 0.15, -0.009, -0.149, 0.34, 0.009, 0x6a8ab0); bb(-0.159, 0.15, -0.004, -0.148, 0.27, 0.004, 0xb8c8d8);   // sight glass (2/3 full)
      bb(-0.158, 0.3, 0.05, -0.149, 0.316, 0.066, 0xffffff, M.ledG);                                      // READY
      bb(-0.27, 0, -0.07, -0.16, 0.012, 0.07, 0x3a3e44);                                                   // drip tray
      for (const [z, n] of [[0.3, 7], [0.42, 5]]) for (let i = 0; i < n; i++) cyl(0.042, 0.032, 0.09, 8, i === n - 1 ? 0xf4efe6 : 0xe8e0d0, -0.06, 0.045 + i * 0.03, z, 0, 0, M.paper);   // paper-cup stacks
      cyl(0.043, 0.043, 0.025, 8, 0xc83030, -0.06, 0.23, 0.3);
    }, [7.75, 1.0, 30.0], 0, { floor: false }), mMall);
    // the takeaway bag that tumbles across the Chinatown pocket under the still lanterns
    R.gust = P(part('gust', () => { bb(-0.11, 0, -0.07, 0.11, 0.26, 0.07, 0xd8c8a0); bb(-0.11, 0.26, -0.07, 0.11, 0.3, -0.03, 0xc8b890); bb(-0.06, 0.14, 0.07, 0.06, 0.2, 0.075, 0xb02a2a); }, [-26.0, 0, 18.6], 0, { floor: false }), mAnn);
    // the stage door (prop): steel, push bar, a wired-glass slit; outward about its east hinge
    R.door = P(part('stage_door', () => {
      bb(-1.0, 0, -0.06, 0, 2.08, 0, 0x2a3a32);
      quad(1.0, 2.08, M.signs, -0.5, 1.04, 0.001, 0, 0, 0xffffff, SG.doorOut);
      quad(1.0, 2.08, M.atlasS, -0.5, 1.04, -0.061, PI, 0, 0xffffff, SA.doorIn);
      quad(0.14, 0.5, M.streak, -0.75, 1.5, 0.003, 0, 0, 0x9aa8b8, [0, 0, 0.5, 1]);
      bb(-0.92, 0.98, -0.16, -0.08, 1.04, -0.12, 0x8a8e94); for (const x of [-0.88, -0.12]) bb(x - 0.02, 0.96, -0.12, x + 0.02, 1.06, -0.06, 0x5a5e64);
      bb(-0.2, 0.95, 0.0, -0.12, 1.05, 0.05, 0x3a3e44);
    }, [-27.9, 0, -11.0], 0, { floor: false }), mAnn);
    R.doorCol = [-28.9, -11.3, -27.9, -11.0]; COL.push(R.doorCol);
    R.door.userData.u = 0; R.door.userData.to = 0;
    // the caged bulkhead lamp over the stage door
    R.bulk = P(part('door_bulkhead', () => {
      bb(-0.16, 0.0, -0.1, 0.16, 0.04, 0.02, 0x2a2a2e); bb(-0.13, -0.18, -0.06, 0.13, 0.0, 0.0, 0xfff0e0, M.bulk);
      for (const x of [-0.14, -0.05, 0.05, 0.14]) bb(x - 0.008, -0.2, -0.07, x + 0.008, 0.0, 0.03, 0x1a1a1e); bb(-0.15, -0.21, -0.07, 0.15, -0.19, 0.03, 0x1a1a1e);
    }, [-28.4, 2.62, -10.92], 0, { floor: false }), mAnn);

    // ======================================================== region S: the Starlight's interior
    b = new Builder(); tint = [1, 1, 1];
    const BLK = 0x2e2a34, BLK2 = 0x3e3a46, STAGE = 0x34303a;
    // floor boards (the hall), the stage deck, the green room and the wing; walls' inner faces come from the shell
    ground(-43.7, -32.7, -26.3, -16.0, 0.0, M.boards, 2.0); ground(-43.7, -16.0, -40.0, -11.3, 0.0, M.boards, 2.0, 0xb0a090); ground(-31.0, -16.0, -26.3, -11.3, 0.0, M.boards, 2.0, 0x9a9080);
    bb(-40.0, 0, -16.0, -31.0, 0.9, -11.3, STAGE); quad(9.0, 4.7, M.vc, -35.5, 0.9005, -13.65, 0, -H, 0x3a3440);
    bb(-40.0, 0.88, -16.08, -31.0, 0.92, -16.0, 0x3a3a3e);                                          // the lip's nosing
    bb(-37.5, 0.9, -13.2, -35.5, 1.2, -11.6, 0x222024);                                             // drum riser (no kit)
    for (const x of [-37.5, -33.5]) boxR(0.6, 0.35, 0.4, 0x1a1a1c, x, 1.06, -15.7, 0.45);          // wedge monitors at the lip
    cyl(0.12, 0.14, 0.03, 8, 0x2a2a2e, -35.5, 0.92, -14.2); cyl(0.012, 0.012, 1.45, 6, 0x3a3a3e, -35.5, 1.62, -14.2); boxR(0.02, 0.02, 0.3, 0x3a3a3e, -35.5, 2.3, -14.3, -0.6);   // the empty mic stand
    // the wing steps (3 risers) from the deck down into the wing
    for (let i = 0; i < 3; i++) bb(-31.0 + i * 0.4, 0, -13.6, -30.6 + i * 0.4, 0.9 - i * 0.3, -12.2, 0x2a2628);
    // partitions: the green room (east side = stage side) and the wing's masking flats, both rooms ceilinged at 3.0
    bb(-43.7, 0, -16.15, -42.8, 3.0, -16.0, BLK2); bb(-41.9, 0, -16.15, -40.0, 3.0, -16.0, BLK2); bb(-42.8, 2.2, -16.15, -41.9, 3.0, -16.0, BLK2);
    bb(-40.15, 0, -16.0, -40.0, 3.0, -11.3, BLK2);
    bb(-31.15, 0, -16.0, -31.0, 3.0, -13.6, BLK2); bb(-31.15, 0, -12.2, -31.0, 3.0, -11.3, BLK2); bb(-31.15, 2.3, -13.6, -31.0, 3.0, -12.2, BLK2);
    bb(-31.0, 0, -16.15, -29.4, 3.0, -16.0, BLK2); bb(-27.6, 0, -16.15, -26.3, 3.0, -16.0, BLK2); bb(-29.4, 2.4, -16.15, -27.6, 3.0, -16.0, BLK2);
    bb(-43.7, 3.0, -16.15, -40.0, 3.1, -11.3, 0x1a181c); bb(-31.15, 3.0, -16.15, -26.3, 3.1, -11.3, 0x1a181c);
    for (let x = -29.3; x < -27.6; x += 0.18) bb(x, 0.02, -16.12, x + 0.16, 2.38, -16.06, 0x0e0c10);   // the curtain over the wing gap
    quad(0.8, 0.4, M.atlasS, -42.35, 2.5, -16.16, PI, 0, 0xffffff, SA.greenSt); quad(0.8, 0.4, M.atlasS, -28.5, 2.7, -16.16, PI, 0, 0xffffff, SA.staffSt);
    // the green room: sagging couch, bar fridge (the kettle sits on it), sticker wall, the dead bulb mirror
    bb(-43.4, 0, -12.2, -41.0, 0.38, -11.4, 0x4a3a44); bb(-43.4, 0.38, -11.75, -41.0, 0.85, -11.4, 0x52404c); for (const x of [-43.4, -41.25]) bb(x, 0.38, -12.2, x + 0.25, 0.62, -11.4, 0x52404c);
    bb(-43.2, 0.38, -12.15, -42.3, 0.45, -11.8, 0x5a4652); bb(-42.25, 0.36, -12.15, -41.3, 0.44, -11.8, 0x5a4652);
    bb(-43.7, 0, -14.4, -43.1, 0.85, -13.6, 0xd8d8d4); bb(-43.12, 0.6, -14.3, -43.1, 0.65, -13.9, 0x9a9a9a);
    { const g0 = SA.green, gm = (g0[0] + g0[2]) / 2; quad(3.6, 2.2, M.atlasS, -43.68, 1.75, -13.65, H, 0, 0xffffff, [g0[0], g0[1], gm, g0[3]]); quad(1.4, 2.2, M.atlasS, -40.17, 1.75, -12.0, -H, 0, 0xffffff, [g0[0], g0[1], gm - 0.06, g0[3]]); quad(0.95, 0.85, M.atlasS, -40.17, 1.6, -13.8, -H, 0, 0xffffff, [gm + 0.01, g0[1] + 0.01, g0[2] - 0.005, g0[3] - 0.01]); }
    // the bar: counter, back bar, stools, taps; the dead BAR neon over the bottles
    bb(-42.5, 0, -31.35, -34.0, 1.05, -30.6, 0x4a3428); bb(-42.6, 1.05, -31.4, -33.9, 1.1, -30.55, 0x6a4a36);
    bb(-43.7, 0, -32.7, -42.5, 1.1, -30.6, 0x4a3428);
    bb(-42.5, 0, -32.7, -34.0, 0.9, -32.2, 0x3a2a20); quad(8.5, 1.5, M.atlasS, -38.25, 1.65, -32.19, 0, 0, 0xffffff, SA.bar); bb(-42.5, 2.4, -32.7, -34.0, 2.48, -32.1, 0x2a1e18);
    for (let i = 0; i < 4; i++) { const x = -42.0 + i * 0.6; bb(x - 0.03, 1.1, -31.2, x + 0.03, 1.42, -31.14, 0xb8bcc0); bb(x - 0.05, 1.38, -31.25, x + 0.05, 1.42, -31.1, 0x2a2a2a); }
    for (const x of [-41.6, -40.2, -38.8, -37.4, -36.0, -34.6]) { cyl(0.18, 0.18, 0.05, 10, 0x3a2a24, x, 0.75, -30.1); cyl(0.025, 0.025, 0.72, 6, 0x5a5e64, x, 0.37, -30.1); cyl(0.15, 0.17, 0.02, 8, 0x5a5e64, x, 0.01, -30.1); }
    // FOH: riser, the desk (dead; LEDs and meters are an overlay), the rack of dead gear, a stool, the snake
    bb(-36.0, 0, -27.4, -33.4, 0.25, -25.6, 0x26222a);
    bb(-35.6, 0.25, -26.9, -33.8, 0.85, -26.1, 0x1e1e22); boxR(1.8, 0.06, 0.82, 0x2a2a2e, -34.7, 0.9, -26.5, 0.12);
    { const g2 = new THREE.PlaneGeometry(1.76, 0.76); g2.rotateX(-H + 0.12); g2.translate(-34.7, 0.935, -26.5); const uv = g2.attributes.uv; for (let i = 0; i < 4; i++) { uv.setX(i, uv.getX(i) > 0.5 ? SA.desk[2] : SA.desk[0]); uv.setY(i, uv.getY(i) > 0.5 ? SA.desk[3] : SA.desk[1]); } put(g2, 0xffffff, M.atlasS); }
    bb(-36.0, 0.25, -27.0, -35.6, 1.35, -26.0, 0x18181a); for (let y = 0.4; y < 1.3; y += 0.18) bb(-35.98, y, -26.95, -35.95, y + 0.12, -26.05, 0x2a2a2e);
    cyl(0.17, 0.17, 0.05, 10, 0x2a2a2e, -34.7, 1.0, -27.1); cyl(0.025, 0.025, 0.72, 6, 0x5a5e64, -34.7, 0.61, -27.1);
    for (let i = 0; i < 6; i++) { const z0 = -25.6 + i * 1.6, z1 = Math.min(-16.0, z0 + 1.6); bb(-34.62 + Math.sin(i) * 0.08, 0.0, z0, -34.52 + Math.sin(i) * 0.08, 0.03, z1, 0x0e0e10); }
    // the amp (Chase sits on it)
    bb(-33.0, 0, -26.65, -32.4, 0.5, -26.15, 0x161618); quad(0.56, 0.42, M.atlasS, -32.7, 0.26, -26.14, 0, 0, 0xffffff, SA.amp);
    // the poster wall (~40, 4 legible), columns with flyers, PA stacks, the lighting truss and its dead PARs
    { const q = rng(2031); let k = 0; for (let z = -29.3; z < -17.2; z += 0.68) for (let y = 0.6; y < 3.5; y += 0.82) { const i = k++ % 16, s = 0.62 + q() * 0.06, j = (q() - 0.5) * 0.08; if (z > -23.0 && z < -22.2 && y < 1.5 && y > 1.2) continue; quad(s, s, M.posters, -43.68, y + 0.4 + j, z + 0.32, H, 0, 0xffffff, POS(i)); } }
    quad(0.62, 0.62, M.posters, -43.66, 1.8, -22.6, H, 0, 0xffffff, POS(0));          // THE SOFT CORNERS at the hero anchor
    for (const x of [-40.5, -29.5]) { cyl(0.2, 0.2, 6.0, 8, 0x4a4e54, x, 3.0, -24.0); for (const s of [0, PI]) quad(0.3, 0.5, M.atlasS, x + Math.cos(s + H) * 0.205, 1.5, -24.0 + Math.sin(s + H) * 0.205, s + H, 0, 0xffffff, SA.flyers); }
    for (const [x0, x1] of [[-41.2, -40.0], [-31.0, -29.8]]) { bb(x0, 0, -17.6, x1, 2.2, -16.15, 0x26242a); for (let y = 0.3; y < 2.1; y += 0.7) bb(x0 + 0.1, y, -17.62, x1 - 0.1, y + 0.55, -17.6, 0x3a383e); }
    bb(-41.0, 4.9, -16.75, -30.0, 5.0, -16.45, 0x3a3a40); bb(-41.0, 5.18, -16.75, -30.0, 5.28, -16.45, 0x3a3a40);
    for (let x = -41; x < -30; x += 0.6) boxR(0.03, 0.3, 0.03, 0x3a3a40, x, 5.1, -16.6, 0, 0, 0.6);
    for (const x of [-41.0, -30.0]) bb(x - 0.05, 5.0, -16.65, x + 0.05, 6.0, -16.55, 0x3a3a40);
    const PARX = [-39.5, -38.2, -36.9, -35.9, -35.1, -34.1, -32.8, -31.5];
    for (const x of PARX) { cyl(0.1, 0.12, 0.28, 8, 0x1a1a1c, x, 4.72, -16.46, 2.47); bb(x - 0.01, 4.85, -16.62, x + 0.01, 4.95, -16.58, 0x2a2a2e); }
    // ceiling trusses (black), the emergency bulkhead housings, the toilets door, the main doors from inside, EXIT boxes
    for (let z = -31; z < -12; z += 3.2) { bb(-43.7, 5.6, z - 0.08, -26.3, 5.72, z + 0.08, 0x1a1a1e); for (let x = -43; x < -27; x += 1.2) boxR(0.04, 0.4, 0.04, 0x1a1a1e, x, 5.8, z, 0, 0, 0.7); }
    bb(-29.8, 0, -32.72, -28.9, 2.1, -32.68, 0x2a2628); bb(-29.0, 0.95, -32.74, -28.95, 1.05, -32.7, 0x6a6a6a);
    bb(-26.32, 0, -29.6, -26.28, 2.4, -27.8, 0x1e1c1a); bb(-26.34, 1.0, -29.4, -26.3, 1.06, -28.0, 0x5a5e64);
    bb(-26.4, 2.22, -29.0, -26.3, 2.48, -28.4, 0x1a1a1a); bb(-28.7, 2.22, -11.42, -28.1, 2.48, -11.3, 0x1a1a1a);
    bb(-38.3, 3.1, -32.68, -37.7, 3.3, -32.6, 0x2a2a2e); bb(-26.36, 3.1, -22.3, -26.3, 3.3, -21.7, 0x2a2a2e);
    // the high window from inside: frame, the streaked glass, the street glow behind it
    bb(-39.1, 3.9, -11.32, -31.9, 4.0, -11.15, 0x2a2a2c); bb(-39.1, 5.2, -11.32, -31.9, 5.3, -11.15, 0x2a2a2c);
    // the clock face (hands are a prop), the mirror ball's chain
    quad(0.5, 0.5, M.atlasS, -38.0, 3.4, -32.68, 0, 0, 0xffffff, SA.clock);
    bb(-35.51, 4.9, -23.01, -35.49, 6.0, -22.99, 0x6a6a6a);
    regS.add(b.done());
    // window light: the street's neon through the high window, on the floor and the stage, with crawling rain shadows
    R.winLight = P(part('window_light', () => {
      quad(9.0, 7.5, M.patch, -36.0, 0.012, -23.25, 0, -H); quad(9.0, 7.5, M.rshadow, -36.0, 0.016, -23.25, 0, -H, 0xffffff, [0, 0, 3, 2.5]);
      quad(7.0, 3.0, M.patch, -35.5, 0.912, -14.5, 0, -H); quad(7.0, 3.0, M.rshadow, -35.5, 0.916, -14.5, 0, -H, 0xffffff, [0, 0, 2.3, 1]);
      quad(9.0, 7.5, M.patchDawn, -36.0, 0.013, -23.25, 0, -H); quad(7.0, 3.0, M.patchDawn, -35.5, 0.913, -14.5, 0, -H);
    }, null, 0, { floor: false }), regS);
    R.winGlass = P(part('window_glass', () => {
      quad(7.0, 1.2, M.streak, -35.5, 4.6, -11.2, PI, 0, 0xa0b0c0, [0, 0, 3, 0.6]);
      quad(9.0, 3.0, M.streetGlow, -35.5, 4.8, -10.2, PI, 0, 0xffffff, SA.glow);
      quad(9.0, 3.0, M.dawnGlass, -35.5, 4.8, -10.25, PI, 0);   // grey-blue daylight over the street glow (2.10's dawn; black otherwise)
    }, null, 0, { floor: false }), regS);
    // EXIT signs + emergency bulkheads (steady; the bulkheads dip now and then)
    R.exits = P(part('exit_signs', () => { quad(0.5, 0.25, M.exit, -28.4, 2.35, -11.43, PI, 0, 0xffffff, SA.exit); quad(0.5, 0.25, M.exit, -26.42, 2.35, -28.7, -H, 0, 0xffffff, SA.exit); }, null, 0, { floor: false }), regS);
    { const pm = mesher(), q = pm;
      q.rgb(0.13, 0.11, 0.08).face('S', -32.66, -40.0, -36.0, 0.6, 5.8).rgb(0.13, 0.11, 0.08).face('W', -26.34, -24.0, -20.0, 0.6, 5.8);
      q.rgb(0.22, 0.18, 0.13).top(-28.4, -23.6, -26.4, -20.4, 0.014).rgb(0.08, 0.3, 0.12).face('N', -11.46, -29.2, -27.6, 1.6, 3.1).rgb(0.08, 0.3, 0.12).face('W', -26.34, -29.5, -27.9, 1.6, 3.1);
      q.rgb(0.05, 0.18, 0.07).top(-29.6, -13.2, -27.2, -11.4, 0.014).rgb(0.05, 0.16, 0.06).top(-28.0, -29.8, -26.4, -27.6, 0.014);
      R.poolsS = pm.mesh(M.poolS, 'emergency_pools', false); R.poolsS.renderOrder = 1; regS.add(R.poolsS); }
    R.bulkS = P(part('bulkheads', () => { bb(-38.25, 3.12, -32.6, -37.75, 3.28, -32.56, 0xffffff, M.bulkS); bb(-26.36, 3.12, -22.25, -26.32, 3.28, -21.75, 0xffffff, M.bulkS); }, null, 0, { floor: false }), regS);
    // the FOH desk's live layer: LED overlay + 8 channel meters (instanced bars)
    R.desk = P(new THREE.Group(), regS); R.desk.name = 'foh_desk';
    { const g2 = new THREE.PlaneGeometry(1.76, 0.76); g2.rotateX(-H + 0.12); g2.translate(-34.7, 0.94, -26.5); const led = new THREE.Mesh(g2, M.deskLed); led.name = 'desk_leds'; R.desk.add(led); }
    const mtrGeo = new THREE.BoxGeometry(0.035, 1, 0.01); mtrGeo.translate(0, 0.5, 0);
    R.deskMeters = instanced(mtrGeo, M.meterS, Array.from({ length: 8 }, (_, i) => [-35.45 + i * 0.1, 0.97, -26.86, 0, [1, 0.001, 1]]));
    R.deskMeters.name = 'desk_meters'; R.deskMeters.instanceMatrix.setUsage(THREE.DynamicDrawUsage); R.deskMeters.frustumCulled = false; R.desk.add(R.deskMeters);
    // the 2.10 kit: patch cables, the slate (plugged in), studio headphones, the amp seat (static, named)
    R.cables = P(part('desk_cables', () => {
      const C = [0xc83a3a, 0x3a8ac8, 0xe8d04a, 0x3ac85a, 0x1a1a1a, 0xe8e8e8];
      for (let i = 0; i < 9; i++) { at(-35.4 + i * 0.18, -26.2); seg(0.98, 0, 0.6 - i * 0.03, 0.25 + (i % 3) * 0.08, 0.018, C[i % 6]); seg(0.6 - i * 0.03, 0.25 + (i % 3) * 0.08, 0.27, 0.45 + i * 0.05, 0.018, C[i % 6]); XF = null; }
      at(-34.3, -26.4, H); seg(1.0, 0, 0.98, 0.25, 0.012, 0x1a1a1a); XF = null;
    }, null, 0, { floor: false }), regS);
    R.slate = PROPS.slate({ key: 'valley_slate' }); R.slate.name = 'slate_desk'; R.slateScr = R.slate.userData.screen; R.slate.userData.scr = R.slateScr; R.slate.position.set(-34.4, 1.06, -26.6); R.slate.rotation.set(0.12, PI, 0); regS.add(R.slate);
    R.phones = PROPS.headphones({ col: '#2a2a2e' }); R.phones.name = 'headphones_desk'; R.phones.position.set(-35.2, 1.04, -26.45); R.phones.rotation.set(H, 0, 0.3); regS.add(R.phones);
    R.amp = P(new THREE.Object3D(), regS); R.amp.name = 'amp_seat'; R.amp.position.set(-32.7, 0.5, -26.4);
    // the wall clock's hands
    R.clock = P(part('wall_clock_sl', () => {}, [-38.0, 3.4, -32.66], 0, { floor: false }), regS);
    for (const [n, w, l] of [['hourH', 0.025, 0.12], ['minH', 0.018, 0.19]]) { const hg = new THREE.BoxGeometry(w, l, 0.006); hg.translate(0, l / 2 - 0.02, 0.006); const hm = new THREE.Mesh(hg, M.vc); hm.name = 'clock_' + n; R.clock.add(hm); R.clock.userData[n] = hm; }
    // the mirror ball + its sparkles (Points, visible in dawn / gig)
    R.ball = P(part('mirror_ball', () => { const g2 = new THREE.IcosahedronGeometry(0.3, 1); put(g2, 0x9a9ea4); }, [-35.5, 4.6, -23.0], 0, { floor: false }), regS);
    { const n = 40, pa = new Float32Array(n * 3), q = rng(40); for (let i = 0; i < n; i++) { const a = q() * TAU, y = 0.3 + q() * 4.0, d = 3 + q() * 7; pa[i * 3] = Math.cos(a) * d; pa[i * 3 + 1] = y - 4.6; pa[i * 3 + 2] = Math.sin(a) * d; } const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(pa, 3)); R.sparkle = new THREE.Points(sg, M.sparkle); R.sparkle.name = 'ball_sparkles'; R.sparkle.frustumCulled = false; R.ball.add(R.sparkle); }
    // PAR lenses: dead (plain) / on (coloured, unlit)
    R.pars = P(new THREE.Group(), regS); R.pars.name = 'truss_pars';
    { const lens = (m, cols) => { const pb = b; b = new Builder(); PARX.forEach((x, i) => { const g2 = new THREE.CircleGeometry(0.085, 10); g2.rotateX(0.9); g2.translate(x, 4.62, -16.36); put(g2, cols ? cols[i % 4] : 0x2a2a30, m); }); const g = b.done({ floor: false }); b = pb; return g; };
      R.parsDead = lens(M.vc, null); R.parsOn = lens(M.parOn, [0xff4fae, 0x2fe8d6, 0xffb040, 0xfff4e0]); R.parsOn.visible = false; R.pars.add(R.parsDead, R.parsOn);
      const bm = mesher(), PC = [[1, 0.31, 0.68], [0.18, 0.9, 0.84], [1, 0.69, 0.25], [1, 0.95, 0.88]];
      PARX.forEach((x, i) => { const [r0, g0, b0] = PC[i % 4], tx = -35.5 + (x + 35.5) * 0.55, tz = -13.4 + ((i % 3) - 1) * 0.8, k = 0.16;
        for (let a = 0; a < 6; a++) { const a0 = a / 6 * TAU, a1 = (a + 1) / 6 * TAU, rr = 0.75; bm.rgb(r0 * k, g0 * k, b0 * k).quad(x, 4.6, -16.36, x, 4.6, -16.36, tx + Math.cos(a1) * rr, 0.92, tz + Math.sin(a1) * rr, tx + Math.cos(a0) * rr, 0.92, tz + Math.sin(a0) * rr); }
        bm.rgb(r0 * 0.5, g0 * 0.5, b0 * 0.5).top(tx - 1.0, tz - 1.0, tx + 1.0, tz + 1.0, 0.925); });
      R.parBeams = bm.mesh(M.beam, 'par_beams', false); R.parBeams.renderOrder = 2; R.parsOn.add(R.parBeams); }
    // the green room: the kettle (save) on the fridge
    R.green = P(new THREE.Group(), regS); R.green.name = 'green_room';
    R.kettle = PROPS.kettle(); R.kettle.name = 'kettle_sl'; R.kettle.position.set(-43.4, 0.85, -14.0); R.kettle.rotation.y = H; R.green.add(R.kettle);
    R.posters = P(new THREE.Object3D(), regS); R.posters.name = 'posters'; R.posters.position.set(-43.6, 1.9, -23.5);
    // the coaster on the bar (plain / with the biro note)
    R.coaster = P(part('coaster', () => { quad(0.1, 0.1, M.atlasS, 0, 0.0005, 0, 0, -H, 0xffffff, SA.coaster); }, [-37.0, 1.105, -30.95], 0.3, { floor: false }), regS);
    R.coasterNote = part('coaster_note', () => { quad(0.1, 0.1, M.atlasS, 0, 0.001, 0, 0, -H, 0xffffff, SA.coasterNote); }, null, 0, { floor: false }); R.coasterNote.visible = false; R.coaster.add(R.coasterNote);
    // the creak boards' faint sheen
    R.creaks = P(part('creak_boards', () => { for (const [x, z, r] of CREAKS) quad(r * 2, r * 1.4, M.creak, x, 0.008, z, 0, -H, 0xffffff); }, null, 0, { floor: false }), regS);
    // three draped coats over the sleepers (head toward −Z): Chase, Luka, Chase (2040)
    R.coats = P(new THREE.Group(), regS); R.coats.name = 'coats_sleep';
    R.coatParts = [[-35.6, -22.0, 0x2a4a8a, 1.35], [-36.6, -22.0, 0x1d2440, 1.35], [-38.3, -22.3, 0xa8865a, 1.6]].map(([x, z, col, L]) => {
      const piv = new THREE.Group(); piv.position.set(x, 0.0, z - 0.55); R.coats.add(piv);
      const g2 = new THREE.PlaneGeometry(0.7, L, 6, 8); g2.rotateX(-H); g2.translate(0, 0, L / 2);
      const p = g2.attributes.position; for (let i = 0; i < p.count; i++) { const px = p.getX(i), pz = p.getZ(i), u = pz / L, e = 1 - Math.pow(Math.min(1, Math.abs(px) / 0.33), 2); p.setY(i, 0.015 + e * (u < 0.12 ? 0.18 + u * 0.6 : u < 0.5 ? 0.26 : 0.26 - (u - 0.5) * 0.34) + 0.015 * Math.sin(pz * 9 + px * 7) * e); }
      g2.computeVertexNormals(); const pb = b; b = new Builder(); put(g2, col); const cg = b.done({ floor: false }); b = pb;
      cg.name = 'coat'; piv.add(cg); return piv;
    });
    // the gig crowd (credits): forty figures facing the stage, bouncing
    const GIG = []; { const q = rng(40); for (let i = 0; i < 40; i++) GIG.push([-41.5 + q() * 11, -23.8 + q() * 6.6, PI + (q() - 0.5) * 0.5]); }
    R.gigBody = instanced(figGeo, M.vc, GIG.map((c) => [c[0], 0, c[1], c[2]])); R.gigBody.name = 'crowd_gig';
    R.gigHead = instanced(headG, M.vc, GIG.map((c) => [c[0], 1.5, c[1], c[2]])); R.gigHead.name = 'crowd_gig_heads';
    { const q = rng(41); for (let i = 0; i < 40; i++) { R.gigBody.setColorAt(i, tcol.setHSL(q(), 0.35, 0.3 + q() * 0.25)); R.gigHead.setColorAt(i, tcol.setHex([0x2a1e18, 0x4a3022, 0x1a1a1e, 0x8a6a3a, 0x6a3a22][(q() * 5) | 0])); } }
    for (const im of [R.gigBody, R.gigHead]) { im.instanceMatrix.setUsage(THREE.DynamicDrawUsage); im.frustumCulled = false; regS.add(im); }
    R.GIG = GIG.map((c, i) => ({ x: c[0], z: c[1], ry: c[2], f: 1.5 + (i % 5) * 0.25, ph: i * 0.9, arms: i % 4 === 0 }));

    // ======================================================== rain (set-owned; moved per state), lightning controller
    R.rain = P(makeRain({ box: [-12, -9, 12, 9], top: 14, count: 4500 })); R.rain.name = 'rain';
    R.flash = P(new THREE.Object3D()); R.flash.name = 'sky_flash';
    // ======================================================== whisperers: six rigs built once (Rue's CUST), re-parented each build
    WH ||= ['whisper_a', 'whisper_b', 'whisper_c', 'whisper_d', 'whisper_e', 'whisper_f'].map((id, i) => {
      const rig = buildCharacter(id); rig.root.add(blobShadow());
      return { rig, i, a: 'idle', at: 0, x: 0, z: 0, yaw: 0, tx: 0, tz: 0, t: 2 + i, talk: 0, col: [1e4, 1e4, 1e4, 1e4], dir: 1, pause: 0, block: 0, ox: 0, mode: '' };
    });
    for (const w of WH) { mMall.add(w.rig.root); COL.push(w.col); }
    // dress-dependent colliders (parked at 1e4 when unused)
    R.cConf = [1e4, 1e4, 1e4, 1e4]; R.cN29a = [1e4, 1e4, 1e4, 1e4]; R.cN29b = [1e4, 1e4, 1e4, 1e4];
    COL.push(R.cConf, R.cN29a, R.cN29b);
    staticColliders();
    // ---- tower facade drones etc. are the tower's; the karaoke neon lives on SW1 in the skyline
    R.karaoke = R.sky.getObjectByName('karaoke_neon');
    R.scene = undefined; R.env = undefined; R.state = null; R.explicit = false; R.swing = 0; R.lanDirty = true; R.neonLv = null; R.slateMode = null; R.doorTo = 0;
    apis();
    dress(AUTO[typeof state !== 'undefined' && state ? state.scene : ''] || 'quiet28', true);
    return root;
  }

  // ---------------------------------------------------------- static colliders (spec §2.6)
  function staticColliders() {
    const C = (...a) => COL.push(a);
    // Region M: building faces, footpath ends, kerbs, zebra sides
    C(-70, -11.4, -44, -11.0); C(-18, -11.4, 18, -11.0); C(24, -11.4, 60, -11.0); C(-26, -11.4, -18, -11.0); C(18, -11.4, 24, -11.0);
    C(-60, 11.0, -36, 11.4); C(-24, 11.0, -8, 11.4); C(8, 11.0, 60, 11.4);
    C(-46.4, -11.0, -46.0, -7.2); C(20.0, -11.0, 20.4, -7.2); C(-40.4, 7.2, -40.0, 11.0); C(16.0, 7.2, 16.4, 11.0);
    C(-72, -7.5, -32, -7.2); C(-28, -7.5, -2, -7.2); C(2, -7.5, 62, -7.2); C(-72, 7.2, -32, 7.5); C(-28, 7.2, -2, 7.5); C(2, 7.2, 62, 7.5);
    C(-32.3, -7.2, -32.0, 7.2); C(-28.0, -7.2, -27.7, 7.2); C(-2.3, -7.2, -2.0, 7.2); C(2.0, -7.2, 2.3, 7.2);
    // the Chinatown pocket, the gate, the lions
    C(-36.4, 11.4, -35.6, 19.8); C(-24.4, 11.4, -23.6, 19.8); C(-36, 19.4, -24, 19.8);
    for (const x of [-35, -32, -28, -25]) C(x - 0.3, 11.5, x + 0.3, 12.1);
    C(-36.25, 9.85, -35.35, 10.75); C(-24.65, 9.85, -23.75, 10.75);
    // the mall
    C(-8.4, 11.0, -7.7, 57.2); C(7.7, 11.0, 8.4, 57.2); C(-8.0, 56.8, 8.0, 57.2);
    C(-6.05, 29.45, -5.15, 31.35); C(-4.8, 31.5, -4.3, 31.9); C(5.15, 17.1, 6.05, 18.9); C(-6.05, 43.1, -5.15, 44.9); C(-7.6, 43.1, -6.6, 45.6);
    for (const z of [16, 40, 46, 52]) C(-0.6, z - 0.6, 0.6, z + 0.6);
    for (const [x, z] of [[-6.8, 22.5], [6.8, 37.5], [-6.8, 50.5]]) C(x - 0.3, z - 0.3, x + 0.3, z + 0.3);
    // Region S: the shell (the stage door is dynamic), the green room, the wing, the stage, the bar, the floor objects
    C(-44.0, -33.0, -43.7, -11.0); C(-26.3, -33.0, -26.0, -11.0); C(-44.0, -33.0, -26.0, -32.7); C(-44.0, -11.3, -28.9, -11.0); C(-27.9, -11.3, -26.0, -11.0);
    C(-43.7, -16.15, -42.8, -16.0); C(-41.9, -16.15, -40.0, -16.0); C(-40.15, -16.0, -40.0, -11.3); C(-43.4, -12.3, -41.0, -11.3); C(-43.7, -14.4, -43.1, -13.6);
    C(-31.0, -16.15, -29.4, -16.0); C(-27.6, -16.15, -26.3, -16.0); C(-31.15, -16.0, -31.0, -13.6); C(-31.15, -12.2, -31.0, -11.3);
    C(-40.0, -16.15, -31.0, -16.0); C(-37.5, -13.2, -35.5, -11.6); C(-37.8, -15.9, -37.2, -15.5); C(-33.8, -15.9, -33.2, -15.5);
    C(-43.7, -32.7, -34.0, -30.6);
    C(-35.6, -26.9, -33.8, -26.1); C(-36.0, -27.0, -35.6, -26.0); C(-33.0, -26.65, -32.4, -26.15);
    C(-40.7, -24.2, -40.3, -23.8); C(-29.7, -24.2, -29.3, -23.8); C(-41.2, -17.6, -40.0, -16.15); C(-31.0, -17.6, -29.8, -16.15);
    for (const x of [-41.6, -40.2, -38.8, -37.4, -36.0, -34.6]) C(x - 0.16, -30.26, x + 0.16, -29.94);
  }

  // ---------------------------------------------------------- dress states, lamps, neon
  const AUTO = { '2.8': 'quiet28', '2.9': 'night29', '2.10': 'three210' };
  const ENV_DRESS = { quiet: 'quiet28', starlight: 'dusty28', lights_out: 'night29', annst: 'night29', three_am: 'three210', dawn: 'three210', lit: 'lit36', lit_dry: 'credits_neon', gig: 'gig' };
  const ENV_LAMP = { quiet: 'bench', starlight: 'torch', lights_out: 'neon', annst: 'door', three_am: 'slate', dawn: 'slate', lit: 'off', lit_dry: 'off', gig: 'gig' };
  const ENV_WIN = { quiet: [0xffffff, 0.6], starlight: [0xffffff, 0.55], lights_out: [0xffffff, 1.0], annst: [0xffffff, 1.0], three_am: [0x9ff0e8, 0.5], dawn: [0x6a7898, 0.25], lit: [0xffffff, 1.0], lit_dry: [0xffffff, 1.0], gig: [0xffd8f0, 0.6] };
  const LAMPS = {   // pos, target, angle, penumbra, distance, colour, intensity
    bench: [[-3.0, 5.4, 29.2], [-5.2, 0.4, 30.4], 0.75, 0.7, 12, 0xffb6d0, 14],
    torch: [null, null, 0.5, 0.5, 14, 0xe8f0ff, 6],
    neon: [[-35.5, 5.2, -11.8], [-36.6, 0.0, -23.0], 0.55, 0.85, 18, 0xff5fa8, 30],
    door: [[-28.4, 2.75, -10.6], [-28.4, 0.8, -11.9], 0.9, 0.6, 6, 0xfff0e0, 8],
    slate: [[-34.5, 1.10, -26.2], [-33.9, 1.55, -27.0], 1.2, 0.8, 3.5, 0xbfe6ff, 3.5],
    gig: [[-35.5, 5.0, -17.2], [-35.5, 0.9, -13.2], 0.6, 0.5, 10, 0xffd8f0, 30],
    off: [null, null, 0.5, 0.5, 14, 0xffffff, 0],
  };
  const D = {   // what each dress state shows / sets
    quiet28:      { m: 1, mall: 1, ct: 1, s: 0, wh: 'quiet', crowd: 'quiet', shush: 1, cars: 4, neon: 0.35, swing: 0, rainAt: null, conf: 1, n29: 0, box: [0, null, 'red'], lamp: 'bench', cd: [16, 28, 0], zones: 'high', flash: 'far', amb: 'street' },
    transit28:    { m: 1, mall: 1, ct: 1, s: 0, wh: 'quiet', crowd: 'quiet', shush: 1, cars: 4, neon: 0.35, swing: 0, rainAt: null, conf: 0, n29: 0, box: [1, null, 'green'], lamp: 'bench', cd: [15, 48, 0], zones: 'high', flash: 'far', amb: 'street' },
    dusty28:      { m: 1, mall: 0, ct: 0, s: 1, wh: '', crowd: '', shush: 0, cars: 2, neon: 0.35, swing: 0, rainAt: [-28.4, -2.0], conf: 0, n29: 0, box: [1, null, 'green'], lamp: 'torch', cd: [15, 38, 0], zones: 'high', flash: 'far', amb: 'dusty', desk: 'dead', coats: 0, creaks: 0, coaster: 'bar' },
    night29:      { m: 1, mall: 0, ct: 0, s: 1, wh: '', crowd: '', shush: 0, cars: 1, neon: 0.35, swing: 0, rainAt: [-28.4, -2.0], conf: 0, n29: 1, box: [1, null, 'green'], lamp: 'neon', cd: [10, 48, 0], zones: 'low', flash: 'window', amb: 'night', desk: 'dead', coats: 7, creaks: 1, coaster: 'bar' },
    three210:     { m: 1, mall: 0, ct: 0, s: 1, wh: '', crowd: '', shush: 0, cars: 0, neon: 0.35, swing: 0, rainAt: [-28.4, -2.0], conf: 0, n29: 0, box: [1, null, 'green'], lamp: 'slate', cd: [8, 58, 0], zones: 'high', flash: 'two', amb: 'three', desk: 'half', coats: 2, creaks: 0, coaster: 'chest_chase', kit: 1 },
    lit36:        { m: 1, mall: 1, ct: 1, s: 0, wh: 'lit', crowd: 'look_up', shush: 0, cars: 4, stop: 1, neon: 1.0, swing: 0.25, rainAt: [0, 32], conf: 0, n29: 0, box: [1, null, 'green'], lamp: 'off', cd: [0, 0, 5], zones: 'high', flash: 'far', amb: 'lit', blade: 1 },
    credits_neon: { m: 1, mall: 1, ct: 1, s: 0, wh: 'lit', crowd: 'quiet', shush: 0, cars: 4, neon: 1.0, swing: 0.1, rainAt: null, conf: 0, n29: 0, box: [1, null, 'green'], lamp: 'off', cd: [0, 0, 0], zero: 1, zones: 'high', flash: '', amb: 'neon', blade: 1 },
    gig:          { m: 1, mall: 0, ct: 0, s: 1, wh: '', crowd: '', shush: 0, cars: 0, neon: 1.0, swing: 0.1, rainAt: null, conf: 0, n29: 0, box: [1, null, 'green'], lamp: 'gig', cd: [0, 0, 0], zero: 1, zones: 'high', flash: '', amb: 'gig', desk: 'live', coats: 0, creaks: 0, coaster: 'bar', gig: 1, blade: 1 },
  };
  const AMBIENCE = { loops: [], room: 'none' };
  const AMBS = {   // loop names from 03-audio.js (crowd_whisper, thunder, hum, hover_traffic, city, rain_* via the rain kind)
    street: { loops: ['crowd_whisper', ['thunder', 0.55], ['hum', 0.2], ['hover_traffic', 0.4]], room: 'none', rain: 'street' },
    dusty: { loops: [['hum', 0.35], { name: 'thunder', vol: 0.45, lp: 700 }], room: 'room', rain: 'roof' },
    night: { loops: [['thunder', 0.85]], room: 'room', rain: 'roof' },
    nightOpen: { loops: [['thunder', 0.85], ['rain_street', 0.7]], room: 'room', rain: 'roof' },
    three: { loops: [['hum', 0.45], { name: 'thunder', vol: 0.25, lp: 600 }], room: 'room', rain: 'roof' },
    lit: { loops: [['city', 0.7], ['crowd_whisper', 0.2]], room: 'none', rain: 'street' },
    neon: { loops: [['city', 0.9], ['hover_traffic', 0.5]], room: 'none', rain: 'street' },
    gig: { loops: [], room: 'room', rain: 'roof' },
  };
  const ZH = { 0: 'sl_wing', 3: 'sl_hi_front', 4: 'sl_hi_back' }, ZL = { 0: 'sl_lo_wing', 3: 'sl_lo_front', 4: 'sl_lo_bar' };
  function dress(name, auto = false) {
    const d = D[name];
    if (!d) return;
    if (!auto) R.explicit = true;
    R.state = name; R.d = d;
    if (!R.root) return;
    R.regM.visible = !!d.m; R.mMall.visible = !!d.mall; R.mCt.visible = !!d.ct; R.regS.visible = !!d.s;
    // the street
    R.whMode = d.wh; R.crowdMode = d.crowd; R.crowdBody.visible = R.crowdHead.visible = !!d.crowd;
    R.shushOn = !!d.shush; R.shush.group.visible = R.shushRing.visible = R.shushOn;
    R.carsN = d.cars; R.carsStop = !!d.stop;
    R.neonTo = d.neon; R.neonFrom = R.neonLv ?? d.neon; R.neonT = R.neonLv == null ? 1 : 0; R.neonDur = 2; if (R.neonLv == null) R.neonLv = d.neon;
    R.sky.userData.lit(d.neon, R.neonT ? 0 : 2);
    R.swingTo = d.swing;
    R.bladeLit = !!d.blade;
    R.gust.visible = name === 'quiet28' || name === 'transit28'; R.gustT = 6;
    if (d.rainAt) { R.rain.position.set(d.rainAt[0], 0, d.rainAt[1]); } else R.rain.position.set(0, 0, 32);
    // dress-dependent colliders
    const P4 = (a, v) => { if (v) { a[0] = v[0]; a[1] = v[1]; a[2] = v[2]; a[3] = v[3]; } else a[0] = a[1] = a[2] = a[3] = 1e4; };
    P4(R.cConf, d.conf ? [-8.0, 11.0, 8.0, 11.3] : null);
    P4(R.cN29a, d.n29 ? [-44.0, -11.0, -43.6, -7.2] : null); P4(R.cN29b, d.n29 ? [-26.4, -11.0, -26.0, -7.2] : null);
    // the Safe Box, the phone, the ukulele
    const [du, cont, led] = d.box; R.boxDoorTo = du; R.boxDoor = du; R.boxUke.visible = cont === 'uke'; R.box.userData.ledObj.material = led === 'green' ? M.ledG : M.ledR;
    R.box.userData.doorObj.rotation.x = -du * 1.745;
    R.phone.visible = false; R.phonePulse = 0; R.uke.visible = false; R.ukeFollow = null;
    R.meterDb = -1; R.wob = 0;
    // the tower countdown
    const cd = R.tower.userData.countdown; cd.set(d.cd[0], d.cd[1], d.cd[2]).run(1); if (d.zero) cd.zero(0);
    // the interior
    if (d.s) {
      R.deskState = d.desk || 'dead'; R.cables.visible = R.slate.visible = R.phones.visible = !!d.kit; R.slideU = 0; R.slate.position.set(-34.4, 1.06, -26.6);
      screen(d.kit ? 'seq' : 'off');
      coatsShow(d.coats || 0); for (let i = 0; i < 3; i++) coatLift(i, 0);
      R.creaks.visible = !!d.creaks;
      coasterPlace(d.coaster || 'bar'); R.coasterNote.visible = name === 'three210';
      R.parsOn.visible = !!d.gig; R.parsDead.visible = !d.gig; R.gigBody.visible = R.gigHead.visible = !!d.gig;
      R.sparkleK = d.gig ? 1 : 0;
      setClock(name === 'three210' ? 3 : name === 'night29' ? 1 : name === 'dusty28' ? 20 : 21, name === 'three210' ? 0 : name === 'night29' ? 10 : name === 'dusty28' ? 10 : 30);
    }
    R.doorTo = 0; R.door.userData.u = 0;
    // interior zone cameras: high or low (mutated in place; the engine reads zone.cam every tick)
    const Z = d.zones === 'low' ? ZL : ZH; for (const k in Z) ZONES[k].cam = Z[k];
    R.flashMode = d.flash; R.flashT = 4 + Math.random() * 8; R.flashN = 0;
    R.lampName = d.lamp; R.lampDirty = true;
    R.amb = d.amb; R.audioDirty = true;
    R.whDirty = true;
  }
  function lamp(name) { if (!LAMPS[name]) return; R.lampName = name; R.lampDirty = true; if (R.root) applyLamp(); }
  function applyLamp() {
    if (typeof world === 'undefined' || world.setId !== 'valley' || !world.torch) return;
    R.lampDirty = false;
    const L = LAMPS[R.lampName] || LAMPS.off, s = world.torch;
    world.torchAuto = R.lampName === 'torch' || R.lampName === 'off';
    s.angle = L[2]; s.penumbra = L[3]; s.distance = L[4]; s.color.setHex(L[5]); s.intensity = L[6];
    if (L[0]) { s.position.set(L[0][0], L[0][1], L[0][2]); s.target.position.set(L[1][0], L[1][1], L[1][2]); s.target.updateMatrixWorld(); }
  }
  function neon(k, dur = 2) { R.neonFrom = R.neonLv ?? k; R.neonTo = k; R.neonDur = dur; R.neonT = dur > 0 ? 0 : 1; if (!(dur > 0)) R.neonLv = k; if (R.sky) R.sky.userData.lit(k, dur); }
  function sendAudio() {
    R.audioDirty = false;
    if (typeof AUDIO === 'undefined' || !AUDIO.ambience) return;
    const key = R.amb === 'night' && R.door && R.door.userData.u > 0.5 ? 'nightOpen' : R.amb, A = AMBS[key] || AMBS.street;
    AMBIENCE.loops.length = 0; for (const l of A.loops) AMBIENCE.loops.push(l); AMBIENCE.room = A.room; R.ambKey = key;
    const e = SETS.valley.env[R.env], wet = e && e.rain > 0;
    AUDIO.ambience({ rain: wet ? A.rain : false, loops: AMBIENCE.loops });
    if (AUDIO.setRoom) AUDIO.setRoom(A.room);
  }
  // ---- prop helpers used by dress and the userData APIs
  function coatsShow(mask) { R.coatMask = mask; for (let i = 0; i < 3; i++) R.coatParts[i].visible = !!(mask & (1 << i)); }
  const COATZ = [-22.55, -22.55, -22.85];
  function coatLift(i, u) { const c = R.coatParts[i]; if (!c) return; c.scale.z = 1 - 0.45 * u; c.position.z = COATZ[i] + 0.65 * u; c.position.y = 0.06 * u; }
  const COASTER = { bar: [-37.0, 1.105, -30.95], chest_chase: [-35.6, 0.25, -22.35] };
  function coasterPlace(w) { const p = Array.isArray(w) ? w : COASTER[w]; if (p) R.coaster.position.set(p[0], p[1], p[2]); }
  function setClock(h, m) { R.clockMin = h * 60 + m; }
  const SLATE = {
    off: (c, w, h) => { c.fillStyle = '#04060a'; c.fillRect(0, 0, w, h); },
    seq: (c, w, h) => {
      c.fillStyle = '#071018'; c.fillRect(0, 0, w, h);
      const r = rng(7); for (let row = 0; row < 5; row++) for (let s = 0; s < 16; s++) { const on = row === 4 ? s % 4 === 0 : r() < 0.35; c.fillStyle = on ? ['#ff6ab4', '#5ae8d6', '#ffd25a', '#8ab4ff', '#ffffff'][row] : 'rgba(120,170,220,0.15)'; c.fillRect(16 + s * 14, 26 + row * 22, 11, 16); }
      c.fillStyle = '#bfe6ff'; c.font = FONT(13); c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText('two', 16, 13);
      c.fillStyle = 'rgba(191,230,255,0.5)'; c.fillRect(16, 140, 224, 2);
    },
    export: (c, w, h) => {
      c.fillStyle = '#0a1420'; c.fillRect(0, 0, w, h); text(c, 'EXPORT', w / 2, 30, 20, '#bfe6ff');
      c.strokeStyle = '#5a8ab0'; c.lineWidth = 2; c.strokeRect(40, 54, 176, 26); text(c, 'two', 52, 67, 15, '#ffffff', 'left');
      c.strokeRect(40, 100, 176, 16); c.fillStyle = '#5ae8d6'; c.fillRect(43, 103, 120, 10);
    },
    saved: (c, w, h) => { c.fillStyle = '#0a1420'; c.fillRect(0, 0, w, h); text(c, 'two.wav', w / 2, 66, 26, '#ffffff'); text(c, 'saved', w / 2, 100, 18, '#5ae8d6'); },
  };
  function screen(mode) { if (!SLATE[mode] || R.slateMode === mode) return; R.slateMode = mode; const sc = R.slateScr; if (sc && sc.paint) sc.paint(SLATE[mode]); }
  // keypad key centres (box-local, on the −Z face; the quad is mirrored so '1' reads top-left from outside)
  function keyPos(d) {
    const idx = d === 'x' ? 9 : d === 'ok' ? 11 : d === 0 || d === '0' ? 10 : (+d - 1);
    const col = idx % 3, row = (idx / 3) | 0, u = (6 + col * 18 + 8) / 64, v = (8 + row * 14 + 6) / 64;
    return [0.15 - (u - 0.5) * 0.17, 0.32 + (0.5 - v) * 0.22];
  }

  // ---------------------------------------------------------- ambient life (no allocation per tick)
  const MAG = new THREE.Color(0xff3fa4), TEAL = new THREE.Color(0x2fe8d6), REDN = new THREE.Color(0xff3a2a), BLADE_DEAD = new THREE.Color(0x4a4650), BLADE_LIT = new THREE.Color(0xff4fa0);
  const tmpC = new THREE.Color(), winC = new THREE.Color(1, 1, 1), winTo = new THREE.Color(1, 1, 1), whiteC = new THREE.Color(1, 1, 1);
  const vA = new THREE.Vector3(), mA = new THREE.Matrix4(), qA = new THREE.Quaternion(), eA = new THREE.Euler(), sA = new THREE.Vector3(1, 1, 1), pA = new THREE.Vector3();
  const SITP = { h: 0.45 }, WALKP = { speed: 0.5 }, EMPTYP = {};
  const burst = (t, k) => (Math.sin(t * 1.7 + k) + Math.sin(t * 2.9 + k * 1.3) > 1.7 ? 0.6 : 1);
  let zW = false, zE = false, root0 = null;
  function onZebra(a) {   // hoisted: who is standing on a zebra (cars yield)
    if (!a.root.visible || a.root.parent !== root0) return;
    const x = a.pos.x, z = a.pos.z;
    if (z > -7.4 && z < 7.4) { if (x > -32.4 && x < -27.6) zW = true; else if (x > -2.4 && x < 2.4) zE = true; }
  }
  // shush loop: a closed polyline over the mall and Ann St
  const SH = [[0, 14], [0, 54], [-4, 54], [-4, 14], [-20, 2], [20, 2]], SHL = []; let SHT = 0;
  for (let i = 0; i < SH.length; i++) { const a = SH[i], c = SH[(i + 1) % SH.length], l = Math.hypot(c[0] - a[0], c[1] - a[1]); SHL.push(l); SHT += l; }
  function shushAt(s, out) {
    s = ((s % SHT) + SHT) % SHT;
    for (let i = 0; i < SH.length; i++) { if (s <= SHL[i]) { const a = SH[i], c = SH[(i + 1) % SH.length], u = s / SHL[i]; out.x = a[0] + (c[0] - a[0]) * u; out.z = a[1] + (c[1] - a[1]) * u; out.y = Math.atan2(c[0] - a[0], c[1] - a[1]); return out; } s -= SHL[i]; }
    return out;
  }
  // whisperer posts per mode: [x, z, ry, anim]
  const WHP = {
    quiet: [[5.45, 17.6, -H, 'sit'], [5.45, 18.4, -H, 'sit'], [-6.6, 41.8, -0.6, 'idle'], [-6.0, 42.4, -2.4, 'idle'], [1.6, 13.0, 0, 'walk'], [1.6, 38.0, 0, 'walk']],
    lit: [[2.4, 30.0, PI, 'laugh'], [-1.6, 26.0, 2.8, 'look_up'], [3.0, 42.0, -2.9, 'laugh'], [-4.2, 35.0, 2.6, 'look_up'], [-4.8, 47.0, 2.9, 'laugh'], [4.6, 23.5, -2.7, 'look_up']],
  };
  const WALK = [[13.0, 21.0], [38.0, 55.0]];
  const NEAR = [];   // actorsIn() scratch (no per-frame allocation)
  function update(dt, ctx) {
    if (!R.root) return;
    const t = ctx.t;
    const sc = typeof state !== 'undefined' && state ? state.scene : null;
    if (sc !== R.scene) { R.scene = sc; R.explicit = false; if (AUTO[sc]) dress(AUTO[sc], true); }
    if (ctx.env !== R.env) {
      R.env = ctx.env;
      if (!R.explicit && !AUTO[R.scene] && ENV_DRESS[R.env] && ENV_DRESS[R.env] !== R.state) dress(ENV_DRESS[R.env], true);
      if (ENV_LAMP[R.env]) { R.lampName = ENV_LAMP[R.env]; R.lampDirty = true; }
      const w = ENV_WIN[R.env]; if (w) { winTo.setHex(w[0]).multiplyScalar(w[1]); }
      R.audioDirty = true;
      if (R.env === 'three_am') { R.flashMode = 'two'; R.flashN = 0; R.flashT = 6; }
    }
    if (R.lampDirty) applyLamp();
    if (R.audioDirty && typeof world !== 'undefined' && world.setId === 'valley') sendAudio();
    const S = R.d || D.quiet28;
    // ---- neon: ease the level, flicker per material, NAP CLUB's P buzzes every ~9 s
    if (R.neonT < 1) { R.neonT = Math.min(1, R.neonT + dt / R.neonDur); R.neonLv = R.neonFrom + (R.neonTo - R.neonFrom) * smooth(R.neonT); }
    const lv = R.neonLv;
    M.neonM.color.copy(MAG).multiplyScalar(lv * burst(t, 0.3)); M.neonT.color.copy(TEAL).multiplyScalar(lv * burst(t, 2.1)); M.neonR.color.copy(REDN).multiplyScalar(lv * burst(t, 4.4));
    M.nap.color.copy(MAG).multiplyScalar(lv); const pb = t % 9; M.napP.color.copy(MAG).multiplyScalar(lv * (pb < 0.45 && !(typeof options !== 'undefined' && options.reduceFlashing) ? ((t * 23) % 1 < 0.5 ? 0.12 : 0.9) : 1));   // (Reduce Flashing: no stutter)
    M.blade.color.copy(R.bladeLit ? BLADE_LIT : BLADE_DEAD).multiplyScalar(R.bladeLit ? burst(t, 5.5) : 1);
    M.reflect.color.setScalar(Math.min(1, 0.45 + lv * 0.75));
    M.lampHead.color.setRGB(1, 0.85, 0.69).multiplyScalar(0.5 + 0.5 * lv); M.pool.color.setScalar(0.7 + 0.5 * lv);
    M.lantern.color.setScalar(0.8 + 0.2 * lv);
    // ---- lanterns: perfectly still (the wind has been asked not to) or swinging, each on its own phase
    R.swing += Math.max(-dt * 0.15, Math.min(dt * 0.15, (R.swingTo || 0) - (R.swing || 0))) || 0;
    if (R.swing > 1e-4 || R.lanDirty) {
      R.lanDirty = R.swing > 1e-4;
      for (let i = 0; i < R.LAN.length; i++) {
        const L = R.LAN[i], a = R.swing * Math.sin(t * TAU * L.f + L.ph);
        eA.set(a, 0, a * 0.5); mA.compose(pA.set(L.x, L.y, L.z), qA.setFromEuler(eA), sA.set(1, 1, 1));
        R.lanterns.setMatrixAt(i, mA); R.tassels.setMatrixAt(i, mA);
      }
      R.lanterns.instanceMatrix.needsUpdate = true; R.tassels.instanceMatrix.needsUpdate = true;
    }
    // ---- traffic: 2 m/s, yield at the zebras, wrap at x ±70
    if (R.regM.visible) {
      zW = zE = false; root0 = R.root.parent;
      if (typeof world !== 'undefined' && world.actors) world.actors.forEach(onZebra);
      for (let i = 0; i < R.CARS.length; i++) {
        const c = R.CARS[i], on = i < R.carsN;
        let want = on && !R.carsStop ? 2.0 : 0;
        if (on) {
          const front = c.x + c.dir * 2.1;
          if (zW && ((c.dir > 0 && front < -32.6 && front > -43) || (c.dir < 0 && front > -27.4 && front < -17))) { const stop = c.dir > 0 ? -33.0 : -27.0; if (c.dir * (stop - front) < 1.0) want = 0; c.wait = 0.8; }
          if (zE && ((c.dir > 0 && front < -2.6 && front > -13) || (c.dir < 0 && front > 2.6 && front < 13))) { const stop = c.dir > 0 ? -3.0 : 3.0; if (c.dir * (stop - front) < 1.0) want = 0; c.wait = 0.8; }
          if (want > 0 && c.wait > 0) { c.wait -= dt; if (c.v < 0.05) want = 0; }
          if (want === 0 && c.v > 1.5 && (zW || zE) && t - (R.chirpT || 0) > 0.5) { R.chirpT = t; if (typeof sfx === 'function') sfx('ss_chirp', { vol: 0.25, at: [c.x, 1, c.lane] }); }
        }
        c.v += Math.max(-dt * 1.4, Math.min(dt * 1.4, want - c.v));
        c.x += c.dir * c.v * dt; if (c.x > 70) c.x -= 140; else if (c.x < -70) c.x += 140;
        const y = on ? 0.32 + 0.02 * Math.sin(2 * t + i) : -50, ry = c.dir > 0 ? 0 : PI;
        mA.compose(pA.set(c.x, y, c.lane), qA.setFromAxisAngle(vA.set(0, 1, 0), ry), sA.set(1, 1, 1)); R.carBody.setMatrixAt(i, mA); R.carGlow.setMatrixAt(i, mA);
        mA.compose(pA.set(c.x, on ? -0.085 : -50, c.lane), qA, sA); R.carShadow.setMatrixAt(i, mA);
      }
      R.carBody.instanceMatrix.needsUpdate = R.carGlow.instanceMatrix.needsUpdate = R.carShadow.instanceMatrix.needsUpdate = true;
    }
    // ---- shush drones: drift along the loop; a ring expands and fades every 2.5 s
    if (R.shushOn) {
      for (let i = 0; i < 4; i++) {
        shushAt(t * 0.8 + i * SHT / 4, vA);
        const y = 7.2 + (i % 3) * 0.8 + 0.15 * Math.sin(t * 1.3 + i);
        R.shush.set(i, vA.x, y, vA.z, vA.y, 1.4);
        const u = ((t + i * 0.63) % 2.5) / 2.5, s = 1.2 + 2.6 * u;
        mA.compose(pA.set(vA.x, y - 0.3, vA.z), qA.identity(), sA.set(s, 1, s)); R.shushRing.setMatrixAt(i, mA);
        R.shushRing.setColorAt(i, tmpC.setRGB(0.75, 0.9, 1).multiplyScalar(0.7 * (1 - u)));
      }
      R.shush.commit(); R.shushRing.instanceMatrix.needsUpdate = true; R.shushRing.instanceColor.needsUpdate = true;
    }
    // ---- whisperers (rigs owned by the set)
    whispers(dt, t);
    // ---- far crowd: idle bob; heads tilt up in look_up
    if (R.crowdBody.visible) {
      const up = R.crowdMode === 'look_up';
      for (let i = 0; i < R.CR.length; i++) {
        const c = R.CR[i], bob = 0.02 * Math.sin(t * 1.6 + c.ph) + (up && R.whMode === 'lit' ? 0.03 * Math.max(0, Math.sin(t * 7 + c.ph)) : 0);
        mA.compose(pA.set(c.x, bob, c.z), qA.setFromAxisAngle(vA.set(0, 1, 0), c.ry), sA.set(1, 1, 1)); R.crowdBody.setMatrixAt(i, mA);
        eA.set(up ? -0.5 : 0.05 * Math.sin(t * 0.7 + c.ph), c.ry, 0, 'YXZ'); mA.compose(pA.set(c.x, 1.5 + bob, c.z), qA.setFromEuler(eA), sA); R.crowdHead.setMatrixAt(i, mA);
      }
      eA.order = 'XYZ';
      R.crowdBody.instanceMatrix.needsUpdate = R.crowdHead.instanceMatrix.needsUpdate = true;
    }
    // ---- tree crowns sway a little
    for (let i = 0; i < 4; i++) { eA.set(0.02 * Math.sin(t * 0.9 + i), 0, 0.02 * Math.sin(t * 0.7 + i * 2)); mA.compose(pA.set(0, 0.5, [16, 40, 46, 52][i]), qA.setFromEuler(eA), sA.set(1, 1, 1)); R.crowns.setMatrixAt(i, mA); }
    R.crowns.instanceMatrix.needsUpdate = true;
    // ---- tower + skyline (drones circling, the countdown ticking, clouds, lightning, lanterns far)
    R.tower.userData.update(dt, t);
    R.sky.userData.update(dt, t);
    // ---- lightning: far (clouds only), window (clouds + the high window flares, then thunder), two (2 flashes then none)
    if (R.flashMode) {
      R.flashT -= dt;
      if (R.flashT <= 0) {
        const mode = R.flashMode;
        if (mode === 'two' && R.flashN >= 2) R.flashMode = '';
        else {
          R.flashN++; R.sky.userData.flash(1);
          if (mode !== 'far') { R.winFlare = 0; R.thunderAt = t + 1.2 + Math.random() * 1.8; }
          R.flashT = mode === 'far' ? 14 + Math.random() * 12 : mode === 'two' ? 18 + Math.random() * 14 : 12 + Math.random() * 13;
        }
      }
    }
    if (R.thunderAt && t >= R.thunderAt) { R.thunderAt = 0; if (typeof sfx === 'function') sfx('thunder', { vol: 0.8 }); }
    // ---- the Starlight: window light tint + flare, rain shadows, glass streaks, the ball, the desk, bulkheads, the door
    if (R.regS.visible || R.d === D.night29) {
      winC.lerp(winTo, Math.min(1, dt * 0.8));
      let fl = 0;
      if (R.winFlare >= 0 && R.winFlare != null) {
        R.winFlare += dt; const rf = typeof options !== 'undefined' && options.reduceFlashing;
        fl = rf ? 0.4 * Math.sin(Math.min(1, R.winFlare / 1.5) * PI) : R.winFlare < 0.12 ? 1 : 0;
        if (R.winFlare > (rf ? 1.5 : 0.12)) R.winFlare = null;
      }
      M.patch.color.copy(winC).lerp(whiteC, fl).multiplyScalar(0.5 + fl * 1.3);
      R.dawnK = (R.dawnK || 0) + ((R.env === 'dawn' ? 1 : 0) - (R.dawnK || 0)) * Math.min(1, dt * 0.8);   // the daylight eases in with the env
      M.patchDawn.color.setScalar(R.dawnK * 0.9);
      M.streetGlow.color.setRGB(1 + 0.5 * R.dawnK, 1 + 0.7 * R.dawnK, 1 + 1.0 * R.dawnK);   // the glass itself greys to day
      M.dawnGlass.color.setRGB(0.30 * R.dawnK, 0.36 * R.dawnK, 0.48 * R.dawnK);
      const rainK = typeof world !== 'undefined' && world.set === SETS.valley && SETS.valley.env[R.env] ? SETS.valley.env[R.env].rain || 0 : 0;
      if (rainK > 0.05) { T.rshadow.offset.y = t * 0.06; T.streak.offset.y = (T.streak.offset.y + 0.12 * dt * rainK) % 1; }
      M.rshadow.opacity = 0.6 * Math.min(1, rainK * 1.4);
      R.ball.rotation.y += 0.05 * dt;
      M.sparkle.opacity += ((R.sparkleK || (R.env === 'dawn' ? 0.8 : 0)) * (0.6 + 0.4 * Math.sin(t * 3)) - M.sparkle.opacity) * Math.min(1, dt * 1.5);
      const ds = R.deskState;
      M.deskLed.color.setScalar(ds === 'live' ? 1 : ds === 'half' ? 0.4 + 0.1 * Math.sin(t * 3) : 0);
      for (let i = 0; i < 8; i++) {
        const k = ds === 'live' ? (R.deskLevel ?? 0.6) * (0.6 + 0.4 * Math.abs(Math.sin(t * 6 + i * 1.3))) : ds === 'half' ? (i % 3 === 0 ? 0.25 + 0.2 * Math.abs(Math.sin(t * 2.2 + i)) : 0.001) : 0.001;
        mA.compose(pA.set(-35.45 + i * 0.1, 0.97, -26.86), qA.identity(), sA.set(1, Math.max(0.001, k * 0.12), 1)); R.deskMeters.setMatrixAt(i, mA);
      }
      R.deskMeters.instanceMatrix.needsUpdate = true;
      M.meterS.color.setHex(ds === 'live' ? 0x7aff8a : 0x3ac85a);
      M.bulkS.color.setScalar((t % 30) < 0.2 ? 0.4 : 0.94); M.poolS.color.setScalar(R.bulkS.visible ? ((t % 30) < 0.2 ? 0.45 : 1) : 0);
      R.clockMin += dt / 60; R.clock.userData.hourH.rotation.z = -R.clockMin / 720 * TAU; R.clock.userData.minH.rotation.z = -(R.clockMin % 60) / 60 * TAU;
      if (R.slideU !== R.slideTo && R.slideTo != null) { R.slideU += Math.max(-dt, Math.min(dt, R.slideTo - R.slideU)) * 1.2; R.slate.position.set(-34.4 + 0.8 * smooth(R.slideU), 1.06, -26.6 + 0.1 * smooth(R.slideU)); }
      if (R.gigBody.visible) {
        for (let i = 0; i < R.GIG.length; i++) {
          const g = R.GIG[i], b2 = 0.06 * Math.abs(Math.sin(t * g.f * PI + g.ph));
          mA.compose(pA.set(g.x, b2, g.z), qA.setFromAxisAngle(vA.set(0, 1, 0), g.ry + 0.1 * Math.sin(t + g.ph)), sA.set(1, g.arms ? 1.06 : 1, 1)); R.gigBody.setMatrixAt(i, mA);
          mA.compose(pA.set(g.x, 1.5 + b2, g.z), qA, sA.set(1, 1, 1)); R.gigHead.setMatrixAt(i, mA);
        }
        R.gigBody.instanceMatrix.needsUpdate = R.gigHead.instanceMatrix.needsUpdate = true;
      }
    }
    // the stage door eases to its target (the collider opens at u >= 0.8), the bulkhead flickers in rain
    { const d = R.door.userData, was = d.u; d.u += Math.max(-dt * 0.9, Math.min(dt * 0.9, (R.doorTo || 0) - d.u)); R.door.rotation.y = 1.6 * smooth(d.u);
      if (was === 0 && d.u > 0 && typeof sfx === 'function') sfx('creak', { vol: 0.6, at: [-28.4, 1.2, -11.0] });
      const open = d.u >= 0.8; R.doorCol[0] = open ? 1e4 : -28.9; R.doorCol[1] = open ? 1e4 : -11.3; R.doorCol[2] = open ? 1e4 : -27.9; R.doorCol[3] = open ? 1e4 : -11.0;
      if ((was > 0.5) !== (d.u > 0.5) && R.amb === 'night') R.audioDirty = true; }
    { const wet = R.env === 'lights_out' || R.env === 'annst' || R.env === 'lit'; M.bulk.color.setRGB(1, 0.94, 0.88).multiplyScalar(R.bulkOn === false ? 0.05 : wet && Math.sin(t * 13) + Math.sin(t * 7.3) > 1.75 ? 0.35 : 1); }
    // ---- mall props: the 40 dB meter, the pole's wobble, the Safe Box door, the uke following its drone, the phone's ring, the gust
    if (R.mMall.visible) {
      const db = R.meterDb >= 0 ? R.meterDb : 36.5 + 2.5 * Math.sin(t * 1.3) + 1.0 * Math.sin(t * 3.7);
      R.meterShown = (R.meterShown ?? db) + (db - (R.meterShown ?? db)) * Math.min(1, dt * 6);
      const k = clamp((R.meterShown - 20) / 35, 0.02, 1); R.meterBar.scale.y = k; M.meter.color.setHex(R.meterShown > 45 ? 0xff4a3a : R.meterShown > 40 ? 0xffc83a : 0x5aff7a);
      R.wob *= Math.max(0, 1 - 3 * dt); R.pole.rotation.z = R.wob * Math.sin(t * 7); R.pole.rotation.x = R.wob * 0.6 * Math.sin(t * 5.3);
      R.boxDoor += Math.max(-dt * 2, Math.min(dt * 2, R.boxDoorTo - R.boxDoor)); R.box.userData.doorObj.rotation.x = -1.745 * smooth(R.boxDoor);
      if (R.keyT > 0) { R.keyT -= dt; if (R.keyT <= 0) R.keyFlash.visible = false; }
      if (R.ukeFollow) { R.ukeFollow.getWorldPosition(vA); R.uke.position.set(vA.x + R.ukeOff[0], vA.y + R.ukeOff[1], vA.z + R.ukeOff[2]); }
      if (R.phone.visible) { const u = R.phonePulse > 0 ? (t * 1.6) % 1 : 0, s = R.phonePulse > 0 ? 0.2 + u * (0.6 + 1.6 * R.phonePulse) : 0.001; R.phoneRing.scale.set(s, 1, s); M.phoneRing.color.setRGB(0.6, 0.85, 1).multiplyScalar((1 - u) * (R.phonePulse > 0 ? 1 : 0)); }
      if (R.gust.visible) {
        R.gustT -= dt;
        if (R.gustT <= 0) { R.gustT = 18 + Math.random() * 6; R.gustU = 0; }
        if (R.gustU >= 0 && R.gustU <= 1) { R.gustU += dt / 2.4; const u = Math.min(1, R.gustU); R.gust.position.set(-26.0 + (-33.6 + 26.0) * u, Math.abs(Math.sin(u * PI * 3)) * 0.35, 18.6 + (12.4 - 18.6) * u); R.gust.rotation.set(u * 9, u * 4, u * 7); }
        else R.gust.position.set(-26.0, -5, 18.6);
      }
    }
  }
  // whisperers: bench pair leans in and takes turns (mouths only, no blips); the queue pair shuffles; two walk the mall;
  // in lit36 / credits they stand in the rain looking up and laughing
  function whispers(dt, t) {
    const mode = R.whMode, P = WHP[mode], on = !!P && R.mMall.visible;
    for (let i = 0; i < WH.length; i++) {
      const w = WH[i], r = w.rig.root;
      if (!on) { if (r.visible) { r.visible = false; w.col[0] = w.col[1] = w.col[2] = w.col[3] = 1e4; w.rig.talk(false); } continue; }
      const p = P[i];
      if (R.whDirty || w.mode !== mode) { w.mode = mode; w.x = p[0]; w.ox = 0; w.z = p[1]; w.yaw = p[2]; w.tz = p[1]; w.a = p[3]; w.at = 0; w.t = 1 + i; w.dir = 1; w.pause = 0; r.visible = true; w.rig.talk(false); }
      let anim = p[3], pp = EMPTYP;
      if (mode === 'quiet') {
        if (i < 2) { anim = 'sit'; pp = SITP; if ((w.t -= dt) <= 0) { w.t = 1.2 + Math.random() * 1.4; const me = Math.random() < 0.5; WH[0].rig.talk(me); WH[1].rig.talk(!me); } }
        else if (i < 4) { if ((w.t -= dt) <= 0) { w.t = 6 + Math.random() * 4; w.tz = p[1] + (Math.random() - 0.5) * 0.3; if (i === 2) { const tk = Math.random() < 0.6; WH[2].rig.talk(tk); WH[3].rig.talk(!tk && Math.random() < 0.5); } } if (Math.abs(w.tz - w.z) > 0.02) { w.z += Math.sign(w.tz - w.z) * Math.min(Math.abs(w.tz - w.z), 0.4 * dt); anim = 'walk'; } else anim = 'idle'; }
        else {
          const [z0, z1] = WALK[i - 4];
          // give way to anyone (player or cast) within 1.7 m, coming or overtaking: sidestep off the lane while they pass
          // (east by default, west if they are east of it), stop only when someone is right in front; a long stand-off
          // turns the walker round
          const WA = typeof world !== 'undefined' && world.actorsIn;
          let side = 0, front = false;
          if (WA && world.actorsIn(p[0], w.z, 1.7, NEAR).length) side = w.ox > 0.05 ? 1.0 : w.ox < -0.05 ? -0.75 : NEAR[0].pos.x > p[0] + 0.3 ? -0.75 : 1.0;
          if (WA && world.actorsIn(w.x, w.z + w.dir * 0.55, 0.5, NEAR).length) front = true;
          w.ox += clamp(side - w.ox, -1.4 * dt, 1.4 * dt); w.x = p[0] + w.ox;
          if (front && w.pause <= 0) { anim = 'idle'; if ((w.block += dt) > 2.5) { w.block = 0; w.dir = -w.dir; } }
          else if (w.pause > 0) { w.pause -= dt; anim = 'idle'; }
          else { w.block = 0; w.z += w.dir * (side ? 0.4 : 0.55) * dt; anim = 'walk'; if (w.z > z1) { w.z = z1; w.dir = -1; w.pause = 2 + Math.random() * 3; } else if (w.z < z0) { w.z = z0; w.dir = 1; w.pause = 2 + Math.random() * 3; } }
          const want = w.dir > 0 ? 0 : PI; w.yaw += ((((want - w.yaw + PI) % TAU) + TAU) % TAU - PI) * Math.min(1, dt * 5);
        }
      } else {   // lit: alternate laughing and looking up
        if ((w.t -= dt) <= 0) { w.t = 2.5 + Math.random() * 2.5; w.a = w.a === 'laugh' ? 'look_up' : 'laugh'; w.at = 0; }
        anim = w.a;
      }
      if (anim !== w.cur) { w.cur = anim; w.at = 0; }
      w.at += dt;
      r.position.set(w.x, 0, w.z); r.rotation.y = w.yaw;
      w.rig.pose(anim, w.at, anim === 'walk' ? WALKP : pp); w.rig.update(dt);
      if (mode === 'quiet' && i < 2) { const side = i ? -1 : 1; w.rig.parts.head.rotation.y = side * 0.45; w.rig.parts.torso.rotation.z = -side * 0.08; }
      w.col[0] = w.x - 0.22; w.col[1] = w.z - 0.22; w.col[2] = w.x + 0.22; w.col[3] = w.z + 0.22;
    }
    R.whDirty = false;
  }

  // ---------------------------------------------------------- prop APIs (userData), attached on every build
  function apis() {
    const U = (o, api) => Object.assign(o.userData, api);
    U(R.pole, { meter: (db) => { R.meterDb = db == null ? -1 : db; }, wobble: (a = 0.035) => { R.wob = Math.max(R.wob || 0, a); } });
    U(R.box, {
      door: (u) => { R.boxDoorTo = clamp(u, 0, 1); },
      content: (id) => { R.boxUke.visible = id === 'uke'; },
      led: (c) => { R.box.userData.ledObj.material = c === 'green' ? M.ledG : M.ledR; },
      press: (d) => { const [x, y] = keyPos(d); R.keyFlash.position.set(x, y, -0.318); R.keyFlash.visible = true; R.keyT = 0.15; if (typeof sfx === 'function') sfx('key_beep', { vol: 0.35 }); },
    });
    U(R.uke, {
      follow: (obj, off = [0, 0, 0]) => { R.ukeFollow = obj && obj.isObject3D ? obj : null; R.ukeOff = off; R.uke.visible = !!R.ukeFollow; },
      place: (where) => {
        R.ukeFollow = null;
        if (where === 'safebox') { R.uke.visible = false; R.boxUke.visible = true; return; }
        const p = Array.isArray(where) ? where : null; if (p) { R.uke.position.set(p[0], p[1], p[2]); R.uke.visible = true; }
      },
      hide: () => { R.ukeFollow = null; R.uke.visible = false; },
    });
    U(R.phone, { show: (on) => { R.phone.visible = !!on; if (!on) R.phonePulse = 0; }, pulse: (on, k = 1) => { R.phonePulse = on ? clamp(k, 0.1, 1) : 0; } });
    U(R.urn, { steam: () => { if (typeof world !== 'undefined') world.puff([7.75, 1.5, 30.0], { n: 16, speed: 0.25, life: 1.8, color: 0xf2f2f2 }); } });
    U(R.green, { kettle_steam: () => { if (typeof world !== 'undefined') world.puff([-43.4, 1.15, -14.0], { n: 16, speed: 0.25, life: 1.8, color: 0xf2f2f2 }); } });
    U(R.shush.group, { on: (b2) => { R.shushOn = !!b2; R.shush.group.visible = R.shushRing.visible = R.shushOn; } });
    R.whObj = R.whObj && R.whObj.parent === R.mMall ? R.whObj : new THREE.Object3D(); R.whObj.name = 'whisperers'; R.mMall.add(R.whObj);
    U(R.whObj, { on: (b2) => { R.whMode = b2 ? (R.d && R.d.wh) || 'quiet' : ''; R.whDirty = true; }, mode: (m) => { R.whMode = m; R.whDirty = true; }, rigs: WH });
    U(R.crowdBody, { mode: (m) => { R.crowdMode = m; } });
    U(R.blade, { lit: (on) => { R.bladeLit = !!on; } });
    const lanApi = { swing: (on, amp) => { R.swingTo = on ? amp ?? (R.state === 'credits_neon' || R.state === 'gig' ? 0.1 : 0.25) : 0; } };
    U(R.lanterns, lanApi);
    U(R.carBody, { count: (n) => { R.carsN = clamp(n | 0, 0, 6); }, stop: (on) => { R.carsStop = !!on; } });
    U(R.flash, { rate: (r) => { R.flashMode = r > 0 ? 'window' : ''; R.flashT = r > 0 ? r : 0; }, flash: (k = 1) => { R.sky.userData.flash(k); R.winFlare = 0; R.thunderAt = 0; } });
    U(R.rain, { at: (x, z) => { R.rain.position.set(x, 0, z); } });
    U(R.door, { open: (u = 1) => { R.doorTo = clamp(u, 0, 1); } });
    U(R.bulk, { on: (b2) => { R.bulkOn = !!b2; } });
    U(R.winLight, { light: (hex, k = 1) => { winTo.setHex(hex).multiplyScalar(k); } });
    U(R.coats, { show: (mask) => coatsShow(mask), lift: (i, u) => coatLift(i, clamp(u, 0, 1)) });
    U(R.coaster, { write: () => { R.coasterNote.visible = true; }, place: (w) => coasterPlace(w) });
    U(R.creaks, { show: (on) => { R.creaks.visible = !!on; } });
    U(R.desk, { state: (s) => { R.deskState = s; }, level: (k) => { R.deskLevel = clamp(k, 0, 1); } });
    U(R.slate, { screen: (m) => screen(m), slide: (u = 1) => { R.slideTo = clamp(u, 0, 1); } });
    U(R.phones, { show: (on) => { R.phones.visible = !!on; } });
    U(R.ball, { sparkle: (k) => { R.sparkleK = clamp(k, 0, 1); } });
    U(R.pars, { on: (on) => { R.parsOn.visible = !!on; R.parsDead.visible = !on; } });
    U(R.gigBody, { on: (on) => { R.gigBody.visible = R.gigHead.visible = !!on; } });
    U(R.exits, { on: (on) => { R.exits.visible = !!on; } });
    U(R.bulkS, { on: (on) => { R.bulkS.visible = !!on; } });
    U(R.clock, { set: (h, m) => setClock(h, m) });
  }

  // ---------------------------------------------------------- data
  const CREAKS = [[-36.8, -26.0, 0.45], [-36.2, -28.6, 0.45], [-33.0, -19.2, 0.5], [-30.0, -18.0, 0.5], [-28.5, -14.2, 0.45]];
  const ZONES = [
    { box: [-31.0, -16.0, -26.3, -11.0], cam: 'sl_wing' },
    { box: [-43.7, -16.0, -40.0, -11.3], cam: 'sl_green' },
    { box: [-40.0, -16.0, -31.0, -11.3], cam: 'sl_stage' },
    { box: [-43.7, -24.0, -26.3, -16.0], cam: 'sl_hi_front' },
    { box: [-43.7, -32.7, -26.3, -24.0], cam: 'sl_hi_back' },
    { box: [-8.0, 11.0, 8.0, 22.5], cam: 'mall_head' },
    { box: [-8.0, 22.5, 8.0, 36.5], cam: 'mall_puzzle' },
    { box: [-8.0, 36.5, 8.0, 57.0], cam: 'mall_south' },
    { box: [-8.0, 7.0, 16.0, 11.0], cam: 'mall_head' },
    { box: [-40.0, 7.0, -8.0, 11.0], cam: 'ct_gate' },
    { box: [-35.0, 11.0, -25.0, 19.4], cam: 'ct_gate' },
    { box: [-32.0, -7.0, -28.0, 7.0], cam: 'starlight_front' },
    { box: [-46.0, -11.0, -18.0, -7.0], cam: 'starlight_front' },
    { box: [-2.0, -7.0, 2.0, 7.0], cam: 'tower_front' },
    { box: [-18.0, -11.0, 20.0, -7.0], cam: 'tower_front' },
  ];
  const ENV = {
    quiet:      { bg: 0x0c0e1c, fog: [0x1b1830, 0.016], hemi: [0x6a6aa0, 0x2a2026, 1.0], dir: [0x9aa2d8, 0.5, [-20, 30, 10]], spot: [0xffb6d0, 14], rain: 0 },
    starlight:  { bg: 0x07060c, fog: [0x15111c, 0.034], hemi: [0x6a6084, 0x241c22, 1.25], dir: [0x8a7ab0, 0.3, [-6, 12, 10]], spot: [0xe8f0ff, 6], rain: 0 },
    lights_out: { bg: 0x05060c, fog: [0x140f1e, 0.045], hemi: [0x4e4c7a, 0x18121a, 0.8], dir: [0x5ad8d0, 0.35, [-4, 10, 12]], spot: [0xff5fa8, 30], rain: 1 },
    annst:      { bg: 0x0a0b16, fog: [0x221c30, 0.030], hemi: [0x6a6a96, 0x1a1420, 0.9], dir: [0x7ae0d8, 0.45, [-6, 14, 16]], spot: [0xfff0e0, 8], rain: 1 },
    three_am:   { bg: 0x05060a, fog: [0x0f0e18, 0.032], hemi: [0x464c74, 0x141418, 0.95], dir: [0x6a7ab0, 0.22, [-4, 10, 12]], spot: [0xbfe6ff, 3.5], rain: 0.6 },
    dawn:       { bg: 0x2a3448, fog: [0x3a4458, 0.022], hemi: [0x8a9ac0, 0x1a1a22, 1.05], dir: [0xa8b8d8, 0.75, [-4, 10, 14]], spot: [0xbfe6ff, 2.0], rain: 0.15 },
    lit:        { bg: 0x14102a, fog: [0x2a1c3e, 0.012], hemi: [0x8a7ac0, 0x24141e, 1.05], dir: [0xd0a0ff, 0.6, [-10, 20, 10]], spot: [0xff6fb0, 0], rain: 1 },
    lit_dry:    { bg: 0x120e26, fog: [0x241a38, 0.012], hemi: [0x8a7ac0, 0x24141e, 1.05], dir: [0xd0a0ff, 0.6, [-10, 20, 10]], spot: [0xff6fb0, 0], rain: 0 },
    gig:        { bg: 0x0a0610, fog: [0x1a0f22, 0.030], hemi: [0x7a5a9a, 0x1a0e1a, 0.85], dir: [0xff9ad0, 0.4, [-4, 10, 12]], spot: [0xffd8f0, 30], rain: 0 },
  };
  const MARKS = {
    // 2.8 street
    s28_enter_luka: [-1.2, 0, 12.6, 0], s28_enter_chase: [0.6, 0, 12.2, 0], s28_enter_c40: [-0.75, 0, 11.9, 0],
    s28_hear_luka: [-0.2, 0, 25.6, -0.5], s28_hear_chase: [0.9, 0, 26.2, -0.7], s28_c40_stop: [-1.4, 0, 26.9, -1.05],
    s28_mia: [-5.55, 0, 30.4, H], s28_plan_chase: [0.4, 0, 27.0, -1.2], s28_plan_c40: [-1.2, 0, 25.0, 0.7], s28_plan_luka: [1.6, 0, 25.4, -0.9],
    s28_cp: [0.6, 0, 24.0, 0], s28_c40_read: [-0.8, 0, 28.4, -H], s28_drop: [2.7, 0, 31.4, H], s28_pick: [4.75, 0, 31.4, -H],
    s28_climb_0: [-3.6, 0, 26.95, 0], s28_climb_1: [-3.6, 0.9, 27.55, 0], s28_climb_2: [-3.6, 1.55, 27.85, 0],
    s28_uke_back: [-4.4, 0, 30.4, -H], s28_uke_sample: [-4.3, 0, 31.2, -1.9],
    s28_leave_luka: [-0.4, 0, 21.0, PI], s28_leave_chase: [0.8, 0, 21.6, PI], s28_leave_c40: [-1.0, 0, 22.4, PI],
    whisper_bench_a: [5.45, 0, 17.6, -H], whisper_bench_b: [5.45, 0, 18.4, -H], whisper_queue_a: [-6.6, 0, 41.8, -0.6], whisper_queue_b: [-6.0, 0, 42.4, -2.4],
    // 2.8 the walk to the Starlight
    s28_t_head: [0.0, 0, 9.0, -H], s28_t_gate_luka: [-27.2, 0, 9.0, -H], s28_t_gate_chase: [-26.0, 0, 9.6, -H], s28_t_gate_c40: [-28.4, 0, 8.6, -H],
    s28_t_cross: [-30.0, 0, 6.0, PI], s28_door_out: [-28.4, 0, -8.6, PI], s28_door_out_chase: [-27.2, 0, -8.2, PI], s28_door_out_c40: [-29.6, 0, -8.0, PI],
    s28_in: [-28.4, 0, -12.4, PI], s28_in_chase: [-27.4, 0, -13.2, PI], s28_in_c40: [-29.4, 0, -13.4, PI],
    // 2.8 the Starlight (dusty)
    sl_posters: [-42.3, 0, -23.5, -H], sl_desk: [-34.7, 0.25, -27.1, 0], sl_stage_look: [-35.5, 0, -17.3, 0], sl_kettle: [-42.6, 0, -14.0, -H], sl_couch: [-42.2, 0, -11.9, PI],
    // 2.9
    s29_chase: [-35.6, 0, -22.0, 0], s29_luka: [-36.6, 0, -22.0, 0], s29_c40: [-38.3, 0, -22.3, 0], s29_luka_reach: [-37.5, 0, -22.7, -H],
    s29_bar: [-37.0, 0, -29.9, PI], s29_note_drop: [-34.9, 0, -22.4, -H], s29_door_in: [-28.4, 0, -12.1, 0], s29_doorway: [-28.4, 0, -11.1, 0],
    s29_luka_turn: [-28.4, 0, -11.6, PI], s29_chase_wing: [-29.0, 0, -14.9, 0.1], s29_chase_close: [-28.6, 0, -12.6, 0.1], s29_c40_eyes: [-38.3, 0, -22.3, 0],
    // 2.10
    s210_c40_desk: [-34.7, 0.25, -27.1, 0], s210_chase_amp: [-32.7, 0, -26.4, -0.7], s210_luka_sleep: [-36.6, 0, -22.0, 0],
    // credits / 3.6
    cr_mia_stage: [-35.5, 0.9, -13.4, PI], s36_passerby: [1.6, 0, 33.0, PI], s36_phone: [-2.2, 0, 38.0, PI],
    s36_laugh_1: [2.4, 0, 30.0, PI], s36_laugh_2: [-1.6, 0, 26.0, 2.8], s36_laugh_3: [3.0, 0, 42.0, -2.9], s36_laugh_4: [-4.2, 0, 35.0, 2.6],
    kettle: [7.0, 0, 30.0, H], kettle_sl: [-42.6, 0, -14.0, -H],
  };
  const ANCHORS = {
    // 2.8 street
    s28_crane_a: { at: [0.0, 112.0, -10.7], from: [10.0, 118.0, 26.0], fov: 46 },
    s28_crane_b: { at: [-15.0, 0.0, 22.0], from: [-15.0, 27.0, -3.0], fov: 54 },
    s28_crane_c: { at: [0.0, 1.4, 20.0], from: [-1.5, 3.2, 8.5], fov: 48 },
    // TRACK a -> b (2.8_crane, ~10.5 s): ahead of the three on the café side, looking back at them, clear of table A's
    // umbrella (3.4, 27.0); b ends with them at their s28_hear_* / s28_c40_stop marks, 3/4 from the front
    s28_track_a: { at: [-0.5, 1.45, 13.9], from: [2.5, 1.62, 17.4], fov: 46 },
    s28_track_b: { at: [-0.8, 1.45, 25.0], from: [2.5, 1.62, 29.0], fov: 46 },
    s28_mia_mid: { at: [-5.5, 0.95, 30.4], from: [-2.6, 1.3, 31.6], fov: 40 },
    s28_c40_close: { at: [-1.50, 1.62, 26.98], from: [-2.21, 1.65, 27.97], fov: 34 },   // his face as he turns to Mia (at s28_c40_stop)
    s28_confiscate: { at: [-4.0, 2.0, 29.2], from: [3.8, 2.2, 22.5], fov: 50 },
    s28_safebox: { at: [-3.6, 3.3, 28.2], from: [-1.6, 2.6, 27.0], fov: 30 },
    s28_db_meter: { at: [-3.5, 2.2, 28.2], from: [-2.4, 2.0, 28.4], fov: 30 },
    s28_box_code: { at: [-3.28, 3.31, 28.2], from: [-0.8, 1.62, 28.4], fov: 22 },
    s28_box_keypad: { at: [-3.45, 3.25, 27.88], from: [-3.3, 3.45, 27.2], fov: 30 },
    s28_plan_mid: { at: [0.4, 1.55, 27.0], from: [2.2, 1.6, 25.0], fov: 40 },
    s28_c40_watch: { at: [-1.2, 1.6, 25.0], from: [-0.2, 1.62, 26.6], fov: 34 },
    s28_cafe_table: { at: [3.6, 0.8, 31.4], from: [2.6, 1.5, 30.2], fov: 36 },
    s28_climb: { at: [-3.6, 2.6, 28.0], from: [-2.2, 0.6, 25.8], fov: 46 },
    s28_qr: { at: [-4.55, 0.6, 31.7], from: [-3.2, 1.0, 32.2], fov: 32 },
    s28_leave: { at: [0.4, 1.4, 21.0], from: [-5.0, 1.4, 34.6], fov: 44 },
    napclub: { at: [-8.0, 4.8, 41.0], from: [-2.0, 2.0, 36.0], fov: 40 },
    lanterns: { at: [-30.0, 5.0, 22.0], from: [-29.0, 1.6, 9.0], fov: 40 },
    tower_countdown: { at: [0.0, 112.0, -10.7], from: [-2.0, 1.7, 30.0], fov: 18 },
    tower_from_mall: { at: [0.0, 50.0, -11.0], from: [4.0, 1.6, 47.0], fov: 50 },   // spec from [1, 1.6, 48] sat under the z 46 crown
    s28_gate_track_a: { at: [-26.0, 1.4, 9.0], from: [-21.5, 1.6, 5.8], fov: 44 },
    s28_gate_track_b: { at: [-34.0, 1.4, 9.0], from: [-31.5, 1.6, 5.8], fov: 44 },
    s28_stage_door_ext: { at: [-28.4, 1.3, -11.0], from: [-27.0, 1.6, -5.5], fov: 42 },
    urn: { at: [7.75, 1.1, 30.0], from: [6.6, 1.45, 30.0], fov: 34 },
    // 2.8 the Starlight
    sl_wide_dusty: { at: [-31.0, 1.0, -18.5], from: [-38.5, 3.0, -29.5], fov: 50 },   // from the bar end: the stage door, the floor, the stage
    sl_posters: { at: [-43.65, 1.9, -23.5], from: [-41.2, 1.7, -23.5], fov: 46 },
    sl_poster_hero: { at: [-43.65, 1.8, -22.6], from: [-42.6, 1.75, -22.6], fov: 30 },
    sl_desk: { at: [-34.7, 1.05, -26.5], from: [-34.2, 1.75, -28.2], fov: 40 },
    sl_stage: { at: [-35.5, 1.6, -13.5], from: [-35.5, 1.7, -21.0], fov: 44 },
    sl_kettle: { at: [-43.4, 1.0, -14.0], from: [-42.4, 1.4, -14.0], fov: 34 },
    // 2.9
    s29_floor: { at: [-36.6, 0.42, -18.5], from: [-36.9, 0.62, -25.4], fov: 50 },
    s29_floor_end: { at: [-36.6, 0.40, -18.5], from: [-36.8, 0.60, -24.4], fov: 46 },
    // a face lying on its back (s29_c40, head toward -Z): from above the face, nudged toward his feet so it reads upright
    s29_c40_dark: { at: [-38.24, 0.24, -23.03], from: [-37.99, 0.73, -22.72], fov: 40 },
    s29_coaster: { at: [-37.0, 1.11, -30.95], from: [-37.0, 1.45, -30.5], fov: 28 },
    s29_window: { at: [-35.5, 4.6, -11.35], from: [-35.5, 1.2, -20.0], fov: 40 },
    s29_door_out: { at: [-28.4, 1.4, -11.0], from: [-28.0, 1.55, -6.8], fov: 38 },
    // (2.9_door blocking: Luka at s29_luka_turn in the doorway facing in, Chase at s29_chase_wing -> _close)
    s29_reverse: { at: [-28.95, 1.42, -14.9], from: [-27.7, 1.6, -11.8], fov: 34 },        // past Luka's shoulder to Chase in the wing
    s29_luka_close: { at: [-28.40, 1.60, -11.73], from: [-28.74, 1.63, -13.09], fov: 34 },  // from inside: his face, the wet street behind
    s29_hands: { at: [-28.5, 1.15, -12.1], from: [-30.5, 1.4, -12.2], fov: 38 },             // side-on from the wing: hand to hand against the doorway
    s29_door_wide: { at: [-28.4, 2.0, -11.0], from: [-21.0, 1.4, 6.0], fov: 44 },
    // 2.10
    s210_wide_stage: { at: [-34.6, 0.7, -26.0], from: [-30.4, 2.9, -20.2], fov: 54 },   // from the stage lip: Luka asleep, the desk and both faces, the bar
    s210_desk_two: { at: [-34.0, 1.2, -26.8], from: [-33.2, 1.5, -24.2], fov: 42 },
    s210_slate: { at: [-34.4, 1.08, -26.6], from: [-34.4, 1.55, -27.1], fov: 28 },
    s210_chase_close: { at: [-32.7, 1.25, -26.4], from: [-33.6, 1.35, -25.4], fov: 34 },
    s210_c40_close: { at: [-34.7, 1.75, -27.1], from: [-34.2, 1.75, -25.9], fov: 34 },
    s210_locked: { at: [-36.0, 1.5, -17.5], from: [-28.2, 3.4, -31.0], fov: 58 },   // the whole venue: the desk and the amp, Luka on the floor, the high window
    sl_clock: { at: [-38.0, 3.4, -32.65], from: [-38.0, 2.6, -30.0], fov: 26 },
    // 3.6 / credits
    s36_passerby_pov: { at: [0.0, 112.0, -10.7], from: [1.6, 1.62, 33.0], fov: 30 },
    s36_mall_above: { at: [0.0, 0.0, 34.0], from: [0.0, 30.0, 4.0], fov: 55 },
    s36_lanterns: { at: [-30.0, 5.0, 24.0], from: [-27.0, 1.5, 12.0], fov: 44 },
    cr_valley_neon: { at: [-2.0, 3.0, 30.0], from: [5.4, 3.7, 52.5], fov: 48 },
    cr_starlight_gig: { at: [-35.5, 1.6, -13.5], from: [-35.5, 2.6, -29.0], fov: 46 },
  };
  const CAMS = {
    mall_head:       { type: 'pan',   pos: [-6.1, 5.6, 27.0],  base: [1.0, 0.8, 14.0],    look: 'player', fov: 48, limit: 0.50 },
    mall_puzzle:     { type: 'fixed', pos: [6.6, 6.6, 23.0],   look: [-3.0, 0.6, 30.0],  fov: 52 },
    mall_south:      { type: 'pan',   pos: [5.4, 4.8, 56.2],   base: [-1.0, 0.8, 40.0],   look: 'player', fov: 48, limit: 0.55 },
    ct_gate:         { type: 'pan',   pos: [-16.5, 4.4, 3.0],  base: [-30.0, 1.6, 13.5],  look: 'player', fov: 46, limit: 0.55 },
    starlight_front: { type: 'pan',   pos: [-21.0, 3.8, 9.8],  base: [-32.0, 1.4, -10.0], look: 'player', fov: 46, limit: 0.50 },
    tower_front:     { type: 'pan',   pos: [9.6, 2.4, 9.6],    base: [-1.0, 3.5, -11.0],  look: 'player', fov: 50, limit: 0.50 },
    sl_hi_front:     { type: 'fixed', pos: [-27.2, 5.2, -31.6], look: [-35.5, 0.4, -20.5], fov: 56 },
    sl_hi_back:      { type: 'fixed', pos: [-42.6, 5.0, -16.8], look: [-34.0, 0.4, -28.5], fov: 56 },
    sl_stage:        { type: 'fixed', pos: [-35.5, 4.6, -23.5], look: [-35.5, 1.0, -13.6], fov: 50 },
    sl_wing:         { type: 'fixed', pos: [-26.75, 2.6, -15.7], look: [-29.6, 0.6, -11.7], fov: 62 },
    sl_green:        { type: 'fixed', pos: [-40.4, 2.6, -15.7], look: [-43.0, 0.6, -12.0], fov: 64 },
    sl_lo_front:     { type: 'fixed', pos: [-43.3, 0.55, -19.2], look: [-29.0, 0.35, -21.0], fov: 40 },
    sl_lo_bar:       { type: 'fixed', pos: [-38.2, 1.28, -31.95], look: [-36.4, 0.45, -23.0], fov: 46 },
    sl_lo_wing:      { type: 'fixed', pos: [-26.8, 0.65, -11.75], look: [-29.0, 0.55, -17.5], fov: 56 },
  };
  const PATHS = {
    d28_swoop: [[-1.0, 7.0, 22.0], [-4.9, 1.5, 30.2], [-3.6, 4.2, 28.2], [-2.5, 2.6, 26.4]],
    d28_high_a: [[-3.0, 16.0], [-3.0, 50.0]], d28_high_b: [[3.5, 50.0], [3.5, 16.0]],
    walk_mall: [[1.6, 13.0], [1.6, 55.0]],
    shush_loop: SH,
    gust: [[-26.0, 18.6], [-33.6, 12.4]],
    traffic_east: [[-70, -3.5], [70, -3.5]], traffic_west: [[70, 3.5], [-70, 3.5]],
    walk_starlight: [[0, 9.0], [-27.0, 9.0], [-30.0, 6.0], [-30.0, -6.0], [-28.4, -8.6]],
    sneak29: [[-36.6, -22.4], [-37.0, -26.0], [-37.0, -29.9], [-35.0, -22.4], [-33.0, -19.2], [-28.5, -16.0], [-28.4, -12.1]],
    // inside, round the furniture (moveTo has no pathfinding): the FOH desk from the floor (east of the amp, behind the
    // desk), the poster wall (north of the column), up onto the stage (wing doorway, the wing step)
    to_desk: [[-32.0, -22.0], [-32.0, -27.6], [-34.7, -27.25]],
    to_posters: [[-38.0, -22.6], [-42.3, -23.5]],
    to_stage: [[-30.0, -19.0], [-28.5, -17.0], [-28.5, -14.8], [-29.6, -12.9], [-31.5, -12.9], [-35.5, -14.0]],
  };
  const AR = [
    { id: 'ar_quiet_head', at: [0.0, 3.6, 11.4], text: 'QUIET HOURS 24/7', kind: 'sign', w: 3.2 },
    { id: 'ar_quiet_mid', at: [0.0, 4.4, 30.0], text: 'QUIET HOURS 24/7 · PLEASE WHISPER', kind: 'sign', w: 4.0 },
    { id: 'ar_quiet_south', at: [0.0, 4.4, 48.0], text: 'QUIET HOURS 24/7', kind: 'sign', w: 3.2 },
    { id: 'ar_whisper_ct', at: [-30.0, 3.2, 12.4], text: 'PLEASE WHISPER', kind: 'sign', w: 2.4 },
    { id: 'ar_mall', at: [8.4, 3.0, 11.4], text: 'BRUNSWICK ST MALL', kind: 'sign', w: 2.4 },
    { id: 'ar_annst', at: [-8.5, 3.0, 7.4], text: 'ANN ST', kind: 'sign', w: 1.4 },
    { id: 'ar_chinatown', at: [-36.5, 3.0, 11.4], text: 'CHINATOWN MALL', kind: 'sign', w: 2.4 },
    { id: 'ar_box_code', at: [-3.27, 3.31, 28.2], text: '0000', kind: 'code', w: 0.5 },
    { id: 'ar_pole', at: [-3.6, 2.6, 28.4], text: 'NOISE DOCK · CONFISCATED ITEMS RELEASED AFTER REVIEW', kind: 'sign', w: 1.8 },
    { id: 'ar_cafe', at: [7.9, 3.4, 30.0], text: 'QUIET CUP · decaf after 6 (for your safety)', kind: 'sign', w: 2.6 },
    { id: 'ar_napclub', at: [-7.9, 3.2, 41.0], text: '45-minute power nap $19 · now booking 2041', kind: 'price', w: 2.4 },
    { id: 'ar_dumpling', at: [-7.9, 3.2, 15.5], text: 'DUMPLING HOUSE · steam level: safe', kind: 'sign', w: 2.2 },
    { id: 'ar_247', at: [-7.9, 3.2, 23.0], text: '24/7 · EASY MART', kind: 'sign', w: 1.8 },
    { id: 'ar_bar_closed', at: [-7.9, 3.2, 31.0], text: 'CLOSED FOR QUIET HOURS', kind: 'sign', w: 2.2 },
    { id: 'ar_records', at: [-7.9, 3.2, 51.5], text: 'RECORDS · CLOSED (NOISE)', kind: 'sign', w: 2.0 },
    { id: 'ar_whisper_bar', at: [7.9, 3.2, 41.0], text: 'WHISPER BAR · cocktails at a reasonable volume', kind: 'sign', w: 2.6 },
    { id: 'ar_kebab', at: [7.9, 3.2, 51.5], text: 'KEBABS · mild sauce only', kind: 'sign', w: 2.0 },
    { id: 'ar_starlight', at: [-35.0, 3.2, -10.9], text: 'THE STARLIGHT · CLOSED FOR QUIET HOURS', kind: 'sign', w: 3.2 },
    { id: 'ar_tower', at: [0.0, 6.2, -10.9], text: 'OPTUS · Yes (Are you sure?)', kind: 'sign', w: 3.4 },
    { id: 'ar_karaoke', at: [-39.5, 3.4, 11.0], text: 'SILENT KARAOKE · lips only', kind: 'sign', w: 2.6 },
  ];
  // floor(x, z): the stage deck, the wing steps, the FOH riser; 0 elsewhere (branches only)
  function floor(x, z) {
    if (z > -16.0 && z < -11.3) {
      if (x > -40.0 && x < -31.0) return 0.9;
      if (x >= -31.0 && x < -29.8 && z > -13.6 && z < -12.2) return 0.9 * (x + 29.8) / -1.2;
    }
    if (x > -36.0 && x < -33.4 && z > -27.4 && z < -25.6) return 0.25;
    return 0;
  }

  return {
    env: ENV, build, marks: MARKS, anchors: ANCHORS, cams: CAMS, zones: ZONES, colliders: COL, floor,
    props: ['region_m', 'region_s', 'region_f', 'm_ann', 'm_mall', 'm_ct', 'pole_mia', 'safebox_mia', 'safebox_b', 'safebox_c', 'uke_prop', 'phone_drop', 'cafe', 'urn',
      'shush_drones', 'whisperers', 'crowd_far', 'neon_mall', 'neon_annst', 'napclub_sign', 'blade_starlight', 'karaoke_neon', 'reflections', 'lanterns', 'gate', 'lions',
      'gust', 'bollards', 'lamps', 'trees_mall', 'traffic', 'tower', 'skyline', 'sky_flash', 'rain', 'stage_door', 'door_bulkhead', 'window_light', 'window_glass',
      'coats_sleep', 'coaster', 'creak_boards', 'foh_desk', 'desk_cables', 'slate_desk', 'headphones_desk', 'amp_seat', 'mirror_ball', 'truss_pars', 'crowd_gig',
      'exit_signs', 'bulkheads', 'wall_clock_sl', 'posters', 'green_room', 'kettle_sl', 'facade_countdown', 'yes_sign', 'tower_drones', 'lobby_card'],
    ambience: AMBIENCE, update,
    dress: (name) => dress(name), lamp, neon,
    VG, tower, skyline, countdown, creaks: CREAKS, paths: PATHS, ar: AR,
    get state() { return R.state; },
  };
})();
