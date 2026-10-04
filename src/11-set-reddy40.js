// ============================================================ SET: reddy40 — Optus Redcliffe, Christmas 2040
// The same store fourteen years on, built on reddy26's shared shell: SETS.reddy40 = SETS.reddy26.make('2040', EXT40).
// Spec: docs/sets/reddy40.md (every name and coordinate there is the contract); the shell is docs/sets/reddy26.md §2/§13.
//
// LAYOUT (metres, Y up; ry 0 faces +Z, π faces −Z, +π/2 faces +X). +Z west = front (car park z 3..23.4, road z 27..35),
// −Z east = rear (yard to the fence z −46, Redcliffe Parade z −48.5..−55, foreshore to the railing z −60, the bay),
// +X south. The shell is identical to reddy26: store floor x −9..11, z −14.5..0 · counter x 3.15..7.85, z −9.45..−8.55
// · staff aisle x 2.6..11, z −12.5..−9.45 · corridor x 5.4..7.4, z −12.75..−23.75 · office x 7.65..11, z −12.75..−17 ·
// backroom x 2.4..10.4, z −30..−24 (roller door x 6.6..8.9 in its back wall, jammed at 0.45 m) · rear wall z −30.25.
// 2040: the big screen (4.6 × 1.5, centre (−2.0, 1.85, −14.36)) over four chips on velvet pillows on the display ledge ·
// chips on the four display tables (2 each, cream bumpers, blank tent cards) and in the counter showcase (6) · the chip
// kiosk (5.6, −5.3) where the Hero Table stood · the hover-trolley drifting round (8.6, −3.4) · two glass SafeSense
// terminals on the counter (x 4.3 / 6.4) · Margaret's chair (x 2.0, plaque) · the plastic tree on the floor · a cool LED
// string along the front transom · the Machine + Des against the backroom front wall (x 3.35..5.15; Des at
// (4.25, 0.95, −24.38)) · the plant in the backroom (9.3, −29.55) · the walkable back yard x −6..20, z −30.25..−46:
// bollards x 6.35 / 9.15, pole L1 (8.2, −32.6), L2 (−1, −44), L3 (16, −44), AC units x 11 / 15, drone tower (0.5,
// −39.5), skip bin (12.8, −36.6, pushable x 9.5..16.5), hover-van (16.8, −40.5), hover-car (−2.8, −36.4), pallets
// (4.6, −43.2), recycling cage (18.4, −33.0), the sliding gate x 9.5..13.5 at z −46 onto Redcliffe Parade (ajar: gap
// x 12.1..13.5) · hover-cars on both roads · lights on the palms · the title's ring of 32 drones (centre (1, −14),
// r 30, y 5.5) · dusk sky dome and five storm clouds over the bay · a low ring of houses and trees at r 70–90 inland.
//
// ENV: day (default) · lockdown (the store at "safe brightness") · dim (backroom tube only: 1.3's right half, B1) ·
//   dusk (the title: sky dome, storm clouds and lightning, palm lights, lit Yes sign).
// AMBIENCE: loops aircon + fluoro, room 'room' (the yard's city bed is content's).
// DRESS: SETS.reddy40.dress(state) — store40 · arrival · address · lockdown · split13 · title · b1_build (§7 table).
//   Auto on scene change: 1.3 split13 · 1.4 arrival · 1.5 / 1.6 store40 · B1 b1_build (anything else: store40).
//   'lockdown' splices the stealth zone table into `zones` in place; every other state uses reddy26's roam table.
// MARKS: every reddy26 shell mark + s14_*, s15_*, s16_*, d_in_a/b/c, d_in_mid, b1_c40_wire, des_stand, post_c2,
//   lure_1..3, local40_a..d (data block at the end).
// ANCHORS: every shell anchor + terminal / terminal_screen (= monitor / monitor_screen), wall40_all (= wall_all),
//   des_screen, des, machine40, b1_machine, scorch_tilt, scorch_1..4, plant40, backroom_front, big_screen, chip_display,
//   price_tag, margaret_plaque, wall_wreath, office40_sign, tree_floor, trolley_home, kiosk, speaker, doors_lock,
//   s16_pan, s16_pan_end, s16_floor_wide, roller, roller_out, tower, pole_bonk, gate, title_center, title_front.
// CAMS: the shell's roam cams (staff, corridor, office, backroom, backroom_rev, entrance, counter, aisle, accessories,
//   shopfront, carpark) + the stealth fixed cams st_floor, st_back, st_staff, st_corridor, cp_dock, cp_lot, cp_gate.
// PROPS (userData API; every call is instant while skipping and allocation-free):
//   big_screen show('ad'|'address'|'safe'|'off') glance(k 0..1) mode caption(text|null) · screens_all show(mode)
//   caption(text|null) (a lower-third strip on the shared address canvas; reset by dress) (big screen, terminals,
//   kiosk, TV share one 'address'/'safe' canvas) · terminal_l / terminal_r show('idle'|'address'|'safe'|'off') ·
//   chip_kiosk chime() show('kiosk'|'address'|'safe'|'off') · chips_wall / chips_tables / chips_showcase on(bool) ·
//   hover_trolley settle(bool) at (live [x, y, z]: pass it as a hotspot's `at`) · led_string · front_doors lock(bool)
//   locked · locals lookUp(on) pulse(on) applaud(on) idle() freeze() hide() rigs {id: rig} (each rig root is a prop named
//   local40_a..d with userData.at) · machine set('built'|'half') flare(on) state · des screen('off'|'name'|'des'|
//   'boiling'|'boil_q'|'boil_yes'|'tea') type(text, dur) boil() glow(on) state · door_wedge · drone_tower on(b) ping()
//   alert(on) · skip_bin push(dx) x · hover_cars (13 bodies + 13 glows, instanced) · hover_parked_yard · palm_lights
//   (instanced 288) · drone_ring (32 + 32, title only) · pelican_glider · storm_clouds flash() · sky_dome · bay_glints.
//   Aliases (empty children sharing the shell prop's userData): counter_speaker = store_radio (playing),
//   jordan_office_door = office_door (open), wall_phone40 = wall_phone, xmas_tree_floor = xmas_tree.
//   Shell props kept: door_l hold(), door_r, door_sign, store_radio, office_door, swivel_chair, the_wall40,
//   backroom_door, tube, scorch count(n), tv_screen show('off'|'address'|'safe'), wall_phone, jbox_lid, roller_door
//   set(gap) slam() gap, door_light_leak, smoke_backroom amount(k, dur), yard_gate set('shut'|'ajar'|'open'), pelicans,
//   clock_hands, roof, sun, sky_horizon.
// EXTRA DATA on the def: ar (AR labels, 1.4–1.6) · ar16 (1.6 lockdown: doors, paths, tower, gate) · drones
//   (DRONES.spawn options per drone, §8.3) · paths (patrol lines by drone id) · lure ({ at, r, dur, points }) · roam /
//   stealth (the two zone tables).
// Deviations from the spec: the Parade has the shell's seven palms (7 × 24 + 5 × 24 = 288 bulbs, not 312); the backroom
// door is wedged back into the corridor (rotation −1.5, wedge at (6.13, −23.12)) — swung into the backroom it hid the
// light switch and s14_c40_switch from backroom_front; Margaret's plaque sits on the backrest's face (z −0.672); the
// drone ring flies at y 5.5 (at 5.0 its north end grazed the roof); st_floor (y 2.6) and s16_floor_wide (from
// [10.5, 2.5, −0.6]) sit lower and machine40 looks from [5.9, 1.55, −26.2] so Rue's ceiling dome camera and the
// s14_* marks stay out of frame; 'wall_phone40', 'counter_speaker', 'jordan_office_door', 'xmas_tree_floor' are
// aliases of the shell props; the shared address/safe canvas is cropped per screen, never stretched; a collider just
// past the gate line keeps the player in the yard (the exit is the gate hotspot).
// Draw calls (setshots, every cam and anchor, day / lockdown / dim / dusk): max 126 (carpark), stealth cams ≤ 121.
SETS.reddy40 = (() => {
  if (typeof SETS === 'undefined' || !SETS.reddy26 || typeof SETS.reddy26.make !== 'function') { console.warn('TWO: reddy40 needs SETS.reddy26.make'); return undefined; }
  const PI = Math.PI, H = PI / 2, TAU = PI * 2, DS = THREE.DoubleSide;
  const YEL = 0xffd21f, CREAM = 0xefe6d2, VELVET = 0x2a2f7a, CHROME = 0xc8ccd2;
  const skipping = () => typeof flow !== 'undefined' && !!flow.skipping;
  const reduceFx = () => typeof options !== 'undefined' && !!options.reduceFlashing;
  const smooth = (u) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const wrapA = (a) => { a = (a + PI) % TAU; if (a < 0) a += TAU; return a - PI; };
  const FL = { floor: false };

  // ---------------------------------------------------------- painters (pure)
  const FONT = (px, w = 'bold') => `${w} ${px}px Arial, "Liberation Sans", "DejaVu Sans", sans-serif`;
  function text(c, s, x, y, px, col, al = 'center', w = 'bold', maxW) {
    c.font = FONT(px, w); c.fillStyle = col; c.textAlign = al; c.textBaseline = 'middle'; c.fillText(s, x, y, maxW);
  }
  let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  function rrect(c, x, y, w, h, r) {
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  }
  function chipGlyph(c, x, y, s) {   // a chip on a velvet pillow, centre (x, y), s = pillow width
    c.fillStyle = '#2a2f7a'; rrect(c, x - s / 2, y - s * 0.18, s, s * 0.36, s * 0.16); c.fill();
    c.fillStyle = '#3a40a0'; rrect(c, x - s * 0.42, y - s * 0.18, s * 0.84, s * 0.14, s * 0.07); c.fill();
    c.fillStyle = '#f4f6f8'; c.beginPath(); c.ellipse(x, y - s * 0.2, s * 0.2, s * 0.09, 0, 0, TAU); c.fill();
    c.fillStyle = '#6fc8ff'; c.fillRect(x + s * 0.1, y - s * 0.24, Math.max(2, s * 0.05), Math.max(2, s * 0.05));
  }
  function paintFascia(c, w, h) {   // the Yes sign, 2040: "(Are you sure?)" under the Yes
    c.fillStyle = '#141d3a'; c.fillRect(0, 0, w, h); c.fillStyle = '#ffd21f'; c.fillRect(0, h - 4, w, 4);
    canvasTex.yes(c, 27, 3, 36, '#ffd21f');
    text(c, '(Are you sure?)', 57, 52, 11, '#ffffff', 'center', 'italic');
    text(c, 'optus', 178, 30, 40, '#ffffff');
  }
  function paintOffice(c, w, h) {   // Jordan's door
    c.fillStyle = '#fff'; c.fillRect(0, 0, w, h); c.strokeStyle = '#141d3a'; c.lineWidth = 4; c.strokeRect(5, 5, w - 10, h - 10);
    text(c, 'JORDAN', w / 2, 52, 46, '#141d3a', 'center', 'bold', w - 24); text(c, '— MANAGER —', w / 2, 98, 22, '#141d3a');
    c.save(); c.translate(w / 2, 166); c.rotate(-0.05); text(c, 'KNOCK. PLEASE.', 0, 0, 30, '#2b4aa8', 'center', 'italic bold', w - 22); c.restore();
    c.strokeStyle = 'rgba(43,74,168,0.55)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(34, 190); c.lineTo(214, 180); c.stroke();
    c.save(); c.translate(w / 2 + 4, 246); c.rotate(0.035); text(c, 'ESPECIALLY CHASE.', 0, 0, 25, '#0a2276', 'center', 'italic bold', w - 26); c.restore();
    c.strokeStyle = 'rgba(10,34,118,0.75)'; c.lineWidth = 2; c.beginPath(); c.moveTo(32, 268); c.lineTo(226, 276); c.stroke();
  }
  function paintNotice(c, w, h) {   // the same cork board; LANYARD REQUESTS at the same position, pin and rotation, yellowed
    c.fillStyle = '#b98a54'; c.fillRect(0, 0, w, h);
    seed = 11; for (let i = 0; i < 400; i++) { c.fillStyle = rnd() > 0.5 ? '#a8794a' : '#c89a66'; c.fillRect(rnd() * w, rnd() * h, 2, 2); }
    c.strokeStyle = '#6b4a2a'; c.lineWidth = 6; c.strokeRect(3, 3, w - 6, h - 6);
    const paper = (x, y, pw, ph, col, rot, lines, pin = '#d32f2f', aged = false) => {
      c.save(); c.translate(x + pw / 2, y + ph / 2); c.rotate(rot);
      c.fillStyle = col; c.fillRect(-pw / 2, -ph / 2, pw, ph);
      if (aged) {
        c.strokeStyle = 'rgba(122,80,32,0.6)'; c.lineWidth = 4; c.strokeRect(-pw / 2 + 2, -ph / 2 + 2, pw - 4, ph - 4);
        seed = 17; for (let i = 0; i < 16; i++) { c.fillStyle = 'rgba(150,100,40,0.22)'; c.beginPath(); c.arc(-pw / 2 + rnd() * pw, -ph / 2 + rnd() * ph, 1 + rnd() * 3, 0, TAU); c.fill(); }
      }
      lines.forEach(([s, px, cc, wt], i) => text(c, s, 0, -ph / 2 + 14 + i * (px + 5), px, cc || '#222', 'center', wt || 'bold', pw - 6));
      c.fillStyle = pin; c.beginPath(); c.arc(0, -ph / 2 + 4, 3, 0, TAU); c.fill(); c.restore();
    };
    paper(12, 12, 112, 84, '#e8d27a', -0.04, [['LANYARD', 12], ['REQUESTS', 12], ['please allow', 10, '#4a3a20'], ['6–8 weeks', 14, '#141d3a']], '#d32f2f', true);
    paper(134, 10, 110, 64, '#f4f8fa', 0.03, [['QUIET HOURS', 12, '#1f8a8a'], ['24/7', 15, '#141d3a'], ['— THE VALLEY', 10, '#555']], '#2f6fd6');
    paper(14, 106, 102, 74, '#d6ecff', 0.05, [['SAFE ROOM', 12, '#1f3a93'], ['DRILL', 12, '#1f3a93'], ['THURSDAYS', 11, '#333']], '#2e9d4a');
    c.save(); c.translate(186, 134); c.rotate(-0.03);   // the roster: "Chase —" printed, "SENIOR CASUAL" in biro
    c.fillStyle = '#ffffff'; c.fillRect(-58, -50, 116, 100);
    text(c, 'ROSTER', 0, -36, 13, '#c62828');
    text(c, 'Jordan — MANAGER', -52, -17, 9, '#333', 'left', 'bold', 106);
    text(c, 'Chase —', -52, 0, 10, '#222', 'left', 'bold');
    c.save(); c.translate(4, 17); c.rotate(-0.06); text(c, 'SENIOR CASUAL', 0, 0, 13, '#1f3a93', 'center', 'italic bold', 108); c.restore();
    text(c, 'Pri — CASUAL', -52, 38, 9, '#333', 'left', 'bold');
    c.fillStyle = '#2f6fd6'; c.beginPath(); c.arc(0, -46, 3, 0, TAU); c.fill(); c.restore();
  }
  function paintTargets(c, w, h) {
    c.fillStyle = '#f7f8f6'; c.fillRect(0, 0, w, h); c.strokeStyle = '#9aa0a6'; c.lineWidth = 3; c.strokeRect(2, 2, w - 4, h - 4);
    text(c, 'SAFETY TARGETS', w / 2, 22, 18, '#1f7a3a');
    ['Incidents', 'Complaints', 'Calls', 'Raised voices'].forEach((s, i) => {
      const y = 54 + i * 28;
      text(c, s, 12, y, 12, '#222', 'left');
      c.fillStyle = '#3ab45a'; c.fillRect(112, y - 8, 104, 16);
      c.strokeStyle = '#ffffff'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(158, y); c.lineTo(163, y + 5); c.lineTo(173, y - 5); c.stroke();
      text(c, '0', 236, y, 15, '#1f7a3a');
    });
    c.save(); c.translate(124, 174); c.rotate(-0.05); text(c, 'Everyone safe!', 0, 0, 16, '#1f3a93', 'center', 'italic bold'); c.restore();
    c.strokeStyle = '#1f3a93'; c.lineWidth = 1.5; c.beginPath(); c.arc(214, 172, 9, 0, TAU); c.stroke(); c.beginPath(); c.arc(214, 173, 5, 0.3, PI - 0.3); c.stroke();
    c.fillStyle = '#1f3a93'; c.fillRect(210, 168, 2, 2); c.fillRect(216, 168, 2, 2);
  }
  function bauble(c, x, y, r) {   // a padded bauble: quilted cream ball, a cap, a soft blue glow
    const g = c.createRadialGradient(x, y, r * 0.6, x, y, r * 1.6); g.addColorStop(0, 'rgba(191,230,255,0.75)'); g.addColorStop(1, 'rgba(191,230,255,0)');
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r * 1.6, 0, TAU); c.fill();
    c.fillStyle = '#efe6d2'; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
    c.save(); c.beginPath(); c.arc(x, y, r, 0, TAU); c.clip();
    c.strokeStyle = 'rgba(140,115,80,0.5)'; c.lineWidth = 1.5;
    for (let k = -3; k <= 3; k++) {
      c.beginPath(); c.moveTo(x + k * r * 0.45 - r, y - r); c.lineTo(x + k * r * 0.45 + r, y + r); c.stroke();
      c.beginPath(); c.moveTo(x + k * r * 0.45 + r, y - r); c.lineTo(x + k * r * 0.45 - r, y + r); c.stroke();
    }
    c.fillStyle = 'rgba(255,255,255,0.4)'; c.beginPath(); c.ellipse(x - r * 0.35, y - r * 0.4, r * 0.3, r * 0.18, -0.6, 0, TAU); c.fill();
    c.restore();
    c.fillStyle = '#c9ccd1'; c.fillRect(x - r * 0.3, y - r * 1.3, r * 0.6, r * 0.38);
    c.strokeStyle = '#9aa0a6'; c.lineWidth = 1.5; c.beginPath(); c.arc(x, y - r * 1.45, r * 0.18, 0, TAU); c.stroke();
  }
  function paintPosters(c) {   // two SafeSense Christmas posters, 128 × 192 each (same words, two layouts)
    c.fillStyle = '#eef4fa'; c.fillRect(0, 0, 128, 192); c.fillStyle = '#bfe6ff'; c.fillRect(0, 0, 128, 6);
    text(c, 'ARE YOU SURE', 64, 24, 14, '#141d3a', 'center', 'bold', 120); text(c, "YOU'RE SURE?", 64, 42, 14, '#141d3a', 'center', 'bold', 120);
    bauble(c, 64, 94, 24);
    text(c, 'STAY SAFE THIS', 64, 144, 12, '#1f6fe0', 'center', 'bold', 120); text(c, 'CHRISTMAS', 64, 160, 13, '#1f6fe0');
    text(c, 'SafeSense', 64, 181, 10, '#3a8ad8');
    c.fillStyle = '#141d3a'; c.fillRect(128, 0, 128, 192); c.fillStyle = '#1f2c5a'; c.fillRect(128, 128, 128, 64);
    bauble(c, 192, 54, 26);
    text(c, 'ARE YOU SURE', 192, 104, 14, '#ffffff', 'center', 'bold', 120); text(c, "YOU'RE SURE?", 192, 122, 14, '#ffffff', 'center', 'bold', 120);
    text(c, 'STAY SAFE THIS', 192, 147, 12, '#bfe6ff', 'center', 'bold', 120); text(c, 'CHRISTMAS', 192, 163, 13, '#bfe6ff');
    text(c, 'SafeSense', 192, 183, 10, '#8fd0ff');
  }
  function paintSim(c, w, h) {
    c.fillStyle = '#f5f6f7'; c.fillRect(0, 0, w, h); c.fillStyle = '#141d3a'; c.fillRect(0, 0, w, 26);
    text(c, 'CHIP STARTER PACKS', w / 2, 13, 10, '#ffffff', 'center', 'bold', w - 8);
    for (let r = 0; r < 6; r++) for (let k = 0; k < 3; k++) {
      const x = 8 + k * 40, y = 34 + r * 36;
      c.fillStyle = r % 2 ? '#e4eef8' : '#fff'; c.fillRect(x, y, 32, 30); c.strokeStyle = '#9aa0a6'; c.lineWidth = 1; c.strokeRect(x + 0.5, y + 0.5, 31, 29);
      chipGlyph(c, x + 16, y + 12, 20);
      text(c, '$0*', x + 16, y + 24, 9, '#c62828');
    }
  }
  function paintAdBg(c, w, h) {   // 64 × 8: navy → glassy blue → navy, tiling sideways (update scrolls it)
    for (let x = 0; x < w; x++) {
      const k = 0.5 - 0.5 * Math.cos(x / w * TAU);
      c.fillStyle = `rgb(${Math.round(20 + 58 * k)},${Math.round(29 + 116 * k)},${Math.round(58 + 156 * k)})`; c.fillRect(x, 0, 1, h);
    }
  }
  function paintAdFg(c, w, h) {   // 256 × 96, transparent: THE YES OF YOU — NEURAL CHIP 9 + a pillow with a chip
    c.clearRect(0, 0, w, h);
    text(c, 'THE YES OF YOU', 26, 36, 22, '#ffffff', 'left', 'bold', 156);
    text(c, '— NEURAL CHIP 9', 28, 63, 16, '#ffd21f', 'left', 'bold', 150);
    c.fillStyle = 'rgba(191,230,255,0.28)'; c.beginPath(); c.ellipse(208, 52, 30, 24, 0, 0, TAU); c.fill();
    chipGlyph(c, 208, 60, 50);
    c.fillStyle = '#ffffff'; for (const [x, y] of [[184, 30], [232, 36], [222, 22]]) { c.fillRect(x - 3, y, 7, 1); c.fillRect(x, y - 3, 1, 7); }
  }
  // the address (256 × 128): storm sky, the Valley's dimmed neon, the glass wall, six drones, a desk, the hooded body.
  // Every screen crops it (big screen rows 22..105, terminals cols 26..230, kiosk cols 74..182): keep the subject central.
  function paintAddrBg(c) {
    const w = 256, h = 128;
    const g = c.createLinearGradient(0, 0, 0, 96); g.addColorStop(0, '#221b30'); g.addColorStop(0.55, '#3e3050'); g.addColorStop(1, '#604664');
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.fillStyle = 'rgba(18,14,26,0.5)'; for (const [x, y, rx, ry] of [[40, 30, 60, 9], [150, 24, 84, 8], [232, 36, 50, 7], [104, 42, 70, 6]]) { c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, TAU); c.fill(); }
    seed = 211;
    for (let x = 0; x < w;) {
      const bw = 8 + rnd() * 16, bh = 16 + rnd() * 40;
      c.fillStyle = rnd() > 0.5 ? '#16121e' : '#1d1828'; c.fillRect(x, 96 - bh, bw, bh);
      for (let k = 0; k < 5; k++) if (rnd() > 0.35) { c.fillStyle = rnd() > 0.5 ? 'rgba(210,70,170,0.6)' : 'rgba(60,190,190,0.55)'; c.fillRect(x + 2 + rnd() * (bw - 4), 96 - bh + 3 + rnd() * (bh - 6), 2, 2); }
      x += bw + 1;
    }
    for (const [x, y] of [[34, 30], [62, 44], [98, 27], [164, 40], [200, 26], [228, 48]]) {
      c.fillStyle = 'rgba(220,240,255,0.25)'; c.beginPath(); c.arc(x, y, 3.5, 0, TAU); c.fill(); c.fillStyle = '#ffffff'; c.fillRect(x - 1, y - 1, 2, 2);
    }
    c.fillStyle = '#0b0910'; for (const x of [20, 72, 182, 234]) c.fillRect(x, 0, 3, 98); c.fillRect(0, 18, w, 2);
    c.strokeStyle = 'rgba(255,255,255,0.06)'; c.lineWidth = 6; c.beginPath(); c.moveTo(28, 96); c.lineTo(68, 22); c.moveTo(192, 96); c.lineTo(228, 24); c.stroke();
    c.fillStyle = '#0e0c12'; c.fillRect(0, 96, w, 32); c.fillStyle = '#3c3646'; c.fillRect(0, 96, w, 2);
    c.fillStyle = '#07060b'; c.beginPath(); c.moveTo(92, 98); c.quadraticCurveTo(96, 70, 116, 66); c.lineTo(140, 66); c.quadraticCurveTo(160, 70, 164, 98); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(160,116,180,0.5)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(94, 93); c.quadraticCurveTo(98, 72, 116, 67); c.stroke();
  }
  function paintCaption(c, s) {   // a lower-third strip over the desk, inside every screen's crop (kiosk cols 74..182, big screen rows ..105)
    c.fillStyle = 'rgba(178,24,34,0.94)'; c.fillRect(72, 92, 112, 13); c.fillStyle = 'rgba(255,255,255,0.85)'; c.fillRect(72, 92, 112, 1);
    text(c, s, 128, 98.8, 10, '#ffffff', 'center', 'bold', 106);
  }
  function paintHead(c, k) {   // the hood, turned k (0..1) a few degrees to his own left (screen-right)
    const hx = 128 + 2.5 * k, fx = 128.5 + 6 * k;
    c.fillStyle = '#07060b'; c.beginPath(); c.ellipse(hx, 50, 14, 18, 0.05 * k, 0, TAU); c.fill();
    c.beginPath(); c.moveTo(hx - 12, 58); c.lineTo(hx - 16, 70); c.lineTo(hx + 16, 70); c.lineTo(hx + 12, 58); c.closePath(); c.fill();
    c.fillStyle = '#14101b'; c.beginPath(); c.ellipse(fx, 54, 6.5 - 1.6 * k, 9.5, 0, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(170,124,190,0.6)'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(hx, 50, 14, 18, 0.05 * k, PI * 0.95, PI * 1.62); c.stroke();
  }
  function paintSafe(c) {
    c.fillStyle = '#f4f8fc'; c.fillRect(0, 0, 256, 128);
    const g = c.createRadialGradient(128, 64, 8, 128, 64, 92); g.addColorStop(0, 'rgba(191,230,255,1)'); g.addColorStop(1, 'rgba(191,230,255,0)');
    c.fillStyle = g; c.fillRect(0, 0, 256, 128);
    text(c, 'STAY', 128, 48, 28, '#1f4f9a'); text(c, 'SAFE.', 128, 80, 28, '#1f4f9a');
  }
  function paintTerm(c, w, h) {   // 256 × 160: the SafeSense glass desktop, the idle "Chip swap" window
    const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#dceaf7'); g.addColorStop(1, '#a6c4e4'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.fillStyle = 'rgba(255,255,255,0.32)'; c.beginPath(); c.arc(224, 26, 64, 0, TAU); c.fill();
    text(c, 'SafeSense', 8, 10, 9, '#2f6fd6', 'left');
    c.fillStyle = 'rgba(30,60,110,0.18)'; rrect(c, 27, 25, 210, 126, 12); c.fill();
    c.fillStyle = '#ffffff'; rrect(c, 23, 21, 210, 126, 12); c.fill();
    text(c, 'Chip swap', 37, 36, 14, '#141d3a', 'left');
    c.fillStyle = '#bfe6ff'; c.fillRect(23, 48, 210, 2);
    ['Customer', 'Verify', 'Swap', 'Opt in'].forEach((s, i) => {
      const y = 62 + i * 17;
      c.fillStyle = i === 0 ? '#2f6fd6' : '#c9d6e6'; c.beginPath(); c.arc(40, y, 4, 0, TAU); c.fill();
      text(c, s, 52, y, 11, '#1b2233', 'left', 'bold');
      c.fillStyle = '#eef3f9'; rrect(c, 118, y - 7, 102, 14, 7); c.fill();
    });
    c.fillStyle = '#2f6fd6'; rrect(c, 160, 127, 62, 15, 7.5); c.fill(); text(c, 'NEXT', 191, 135, 10, '#ffffff');
  }
  function paintKiosk(c, w, h) {   // 128 × 160: NEURAL CHIP 9 / Are you sure? / [YES]
    const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#f6f9fc'); g.addColorStop(1, '#d6e6f4'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    text(c, 'SafeSense', w / 2, 11, 9, '#3a8ad8');
    text(c, 'NEURAL', w / 2, 32, 18, '#141d3a'); text(c, 'CHIP 9', w / 2, 53, 20, '#141d3a');
    c.fillStyle = 'rgba(191,230,255,0.8)'; c.beginPath(); c.ellipse(64, 82, 34, 14, 0, 0, TAU); c.fill();
    chipGlyph(c, 64, 86, 46);
    text(c, 'Are you sure?', w / 2, 110, 14, '#1b2233', 'center', 'normal');
    c.fillStyle = '#2f6fd6'; rrect(c, 34, 124, 60, 24, 12); c.fill(); text(c, 'YES', w / 2, 137, 14, '#ffffff');
  }
  // atlas40 regions [x, y, w, h, W, H]
  const RG40 = {
    plaque: [0, 0, 256, 80, 256, 256], panel: [0, 80, 64, 64, 256, 256], lcd: [64, 80, 32, 16, 256, 256], tag: [96, 80, 32, 16, 256, 256],
    tent: [128, 80, 128, 40, 256, 256], box: [64, 96, 64, 32, 256, 256], nostand: [0, 144, 128, 32, 256, 256],
    keep: [128, 120, 128, 32, 256, 256], recyc: [128, 152, 128, 32, 256, 256],
  };
  function paintAtlas40(c) {
    c.fillStyle = '#d8d8d8'; c.fillRect(0, 0, 256, 256);
    // Margaret's plaque: brass, engraved
    const g = c.createLinearGradient(0, 0, 0, 80); g.addColorStop(0, '#ecca7a'); g.addColorStop(0.5, '#c99c42'); g.addColorStop(1, '#a87a2a'); c.fillStyle = g; c.fillRect(0, 0, 256, 80);
    c.strokeStyle = '#7a5418'; c.lineWidth = 3; c.strokeRect(3, 3, 250, 74);
    for (const [x, y] of [[11, 11], [245, 11], [11, 69], [245, 69]]) { c.fillStyle = '#7a5418'; c.beginPath(); c.arc(x, y, 3, 0, TAU); c.fill(); }
    text(c, "MARGARET'S CHAIR", 128, 31, 26, '#fff0c4', 'center', 'bold', 222); text(c, "MARGARET'S CHAIR", 128, 30, 26, '#3e2806', 'center', 'bold', 222);
    text(c, 'Reserved since it was a video shop.', 128, 58, 14, '#fff0c4', 'center', 'italic bold', 232); text(c, 'Reserved since it was a video shop.', 128, 57, 14, '#3e2806', 'center', 'italic bold', 232);
    // the tower's panel: SIGNAL CHECK + a wave icon
    c.fillStyle = '#eef2f6'; c.fillRect(0, 80, 64, 64); c.fillStyle = '#1f6fe0'; c.fillRect(0, 80, 64, 16);
    text(c, 'SIGNAL', 32, 88, 10, '#ffffff'); text(c, 'CHECK', 32, 135, 11, '#141d3a');
    c.strokeStyle = '#3a8ad8'; c.lineWidth = 3; c.lineCap = 'round';
    for (const r of [6, 12, 18]) { c.beginPath(); c.arc(32, 124, r, -PI * 0.78, -PI * 0.22); c.stroke(); }
    c.fillStyle = '#3a8ad8'; c.beginPath(); c.arc(32, 124, 3, 0, TAU); c.fill();
    // a chip's LCD tag: red 3%
    c.fillStyle = '#0a0a0c'; c.fillRect(64, 80, 32, 16);
    c.font = 'bold 13px "DejaVu Sans Mono", "Courier New", monospace'; c.fillStyle = '#ff3b30'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('3%', 80, 89);
    // a blank price tag; a blank tent card (the prices are in the chip)
    c.fillStyle = '#ffffff'; c.fillRect(96, 80, 32, 16); c.strokeStyle = '#b8c0c8'; c.lineWidth = 1; c.strokeRect(96.5, 80.5, 31, 15);
    c.fillStyle = '#ffffff'; c.fillRect(128, 80, 128, 40); c.fillStyle = '#bfe6ff'; c.fillRect(128, 113, 128, 7); c.strokeStyle = '#ccd3da'; c.strokeRect(129.5, 81.5, 125, 37);
    // the display chips' box label
    c.fillStyle = '#ffffff'; c.fillRect(64, 96, 64, 32); c.fillStyle = '#2a2f7a'; c.fillRect(64, 96, 64, 9);
    text(c, 'NEURAL CHIP 9', 96, 113, 8, '#141d3a', 'center', 'bold', 60); text(c, 'DISPLAY ONLY', 96, 123, 7, '#c62828', 'center', 'bold', 60);
    // NO STANDING (yellow stencil on concrete), KEEP CLEAR, RECYCLING ONLY
    c.fillStyle = '#c9c4ba'; c.fillRect(0, 144, 128, 32); text(c, 'NO STANDING', 64, 161, 18, '#f2c230', 'center', 'bold', 122);
    c.fillStyle = '#ffffff'; c.fillRect(128, 120, 128, 32); c.fillStyle = '#c62828'; c.fillRect(128, 120, 128, 7); text(c, 'KEEP CLEAR', 192, 140, 15, '#141d3a');
    c.fillStyle = '#2e7d4a'; c.fillRect(128, 152, 128, 32); text(c, 'RECYCLING ONLY', 192, 168, 13, '#ffffff', 'center', 'bold', 122);
  }
  function paintGlint(c, w, h) { c.clearRect(0, 0, w, h); seed = 97; for (let i = 0; i < 24; i++) { const x = rnd() * w, y = rnd() * h, l = 3 + rnd() * 6; c.fillStyle = `rgba(255,255,255,${(0.35 + rnd() * 0.5).toFixed(2)})`; c.fillRect(x, y, l, 1); } }
  // Des's screen (256 × 128), repainted only on a state change, a typed letter, the cursor blink or the boil dots
  const BOIL = ['DES · Boiling', 'DES · Boiling.', 'DES · Boiling..', 'DES · Boiling…'];
  const MONO44 = 'bold 44px "DejaVu Sans Mono", "Courier New", monospace';
  function paintDes(c) {
    const st = S.desSt;
    c.shadowBlur = 0; c.fillStyle = '#04101a'; c.fillRect(0, 0, 256, 128);
    if (st === 'off') { c.fillStyle = 'rgba(255,255,255,0.05)'; c.beginPath(); c.moveTo(24, 0); c.lineTo(96, 0); c.lineTo(44, 128); c.lineTo(0, 128); c.closePath(); c.fill(); return; }
    c.fillStyle = 'rgba(143,216,255,0.16)'; c.fillRect(0, 0, 256, 3);
    c.shadowColor = '#3fa8ff'; c.shadowBlur = 10;
    if (st === 'name') {
      text(c, 'NAME YOUR KETTLE:', 128, 28, 20, '#8fd8ff', 'center', 'bold', 244);
      const n = S.typed.length, cw = 26.5, x0 = 128 - n * cw / 2;
      c.font = MONO44; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = '#d8f2ff'; c.fillText(S.typed, x0, 80);
      if (S.cursorOn) { c.fillStyle = '#8fd8ff'; c.fillRect(x0 + n * cw + 3, 60, 4, 40); }
    } else if (st === 'des') text(c, 'DES', 128, 66, 62, '#d8f2ff');
    else if (st === 'boiling') {
      text(c, BOIL[S.dots], 24, 52, 28, '#bfe9ff', 'left');
      c.shadowBlur = 0; c.strokeStyle = '#8fd8ff'; c.lineWidth = 2; c.strokeRect(24, 82, 208, 14); c.fillStyle = '#8fd8ff'; c.fillRect(27, 85, 202 * S.boilK, 8);
    } else if (st === 'boil_q' || st === 'boil_yes') {
      text(c, 'Would you like', 128, 24, 22, '#bfe9ff'); text(c, 'to boil?', 128, 50, 22, '#bfe9ff');
      const yes = st === 'boil_yes';
      c.lineWidth = 3; c.strokeStyle = '#8fd8ff'; rrect(c, 74, 72, 108, 40, 20);
      if (yes) { c.fillStyle = '#3fa8ff'; c.fill(); } c.stroke();
      if (yes) { c.strokeStyle = '#ffffff'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(88, 92); c.lineTo(96, 100); c.lineTo(110, 84); c.stroke(); }
      text(c, 'YES', yes ? 140 : 128, 93, 22, yes ? '#ffffff' : '#8fd8ff');
    } else if (st === 'tea') text(c, 'Tea?', 128, 66, 58, '#d8f2ff');
    c.shadowBlur = 0;
  }

  // ---------------------------------------------------------- live state (reset by build; nothing allocated in update)
  const S = { built: false };
  const X = {};   // ext materials (filled in build; mat() caches them)
  const R40 = {}; // ext prop refs
  const sV = new THREE.Vector3(), sQ = new THREE.Quaternion(), sE = new THREE.Euler(), sS = new THREE.Vector3(), sM = new THREE.Matrix4(), sC = new THREE.Color(), YAX = new THREE.Vector3(0, 1, 0);
  const PARK = 1e4;
  let GLOWM = null, GLOWF = null, HGLOWM = null, SKYM40 = null, CLOUDM = null, CHIMEM = null, PINGM = null;
  let OCT_S = null, OCT_M = null, OCT_L = null, CARG = null, LOC = null, RINGGEO = null, CHIMEGEO = null;
  const CHIPS = [];   // chip light positions (x, y, z flat), filled during build: wall 0-3, tables 4-11, showcase 12-17, machine 18-21
  const LEDS = [], PALMS = [];
  const PALM_COLS = [0xff4a3a, 0x4ae070, 0xffb840, 0x5a8aff, 0xfff0c8, 0xff7ad8];
  const LIGHTNING = [7.3, 11.8, 6.4, 13.1, 9.2, 8.5, 12.4, 6.9, 10.6, 7.8];
  const SITP = { sit: true, h: 0.5 }, NOP = {}, PUFF_AT = [4.2, 1.26, -24.38], PUFF_O = { n: 6, speed: 0.25, life: 1.6, color: 0xf2f2f2 };

  // ---------------------------------------------------------- textures (ext.paint: before the shell builds its materials)
  function paint40(T) {
    const K = (k, o) => ({ key: 'reddy40_' + k, nearest: true, ...o });
    T.fascia = canvasTex(256, 64, paintFascia, K('fascia'));
    T.office = canvasTex(256, 320, paintOffice, K('office'));
    T.notice = canvasTex(256, 192, paintNotice, K('notice'));
    T.targets = canvasTex(256, 192, paintTargets, K('targets'));
    T.posters = canvasTex(256, 192, paintPosters, K('posters'));
    T.sim = canvasTex(128, 256, paintSim, K('sim'));
    T.adFg = canvasTex(256, 96, paintAdFg, K('ad_fg'));
    T.adBg = canvasTex(64, 8, paintAdBg, { key: 'reddy40_ad_bg', repeat: [1, 1] });
    T.addr = canvasTex(256, 128, (c) => paintAddrBg(c), K('addr'));
    T.des = canvasTex(256, 128, (c) => { c.fillStyle = '#04101a'; c.fillRect(0, 0, 256, 128); }, K('des'));
    T.term = canvasTex(256, 160, paintTerm, K('term'));
    T.kiosk = canvasTex(128, 160, paintKiosk, K('kiosk'));
    T.atlas40 = canvasTex(256, 256, paintAtlas40, K('atlas40'));
    T.glint = canvasTex(128, 128, paintGlint, { key: 'reddy40_glint', repeat: [36, 18] });
    // offscreen layers for the shared address canvas (painted once; update only drawImage()s them)
    const off = (fn) => { const cv = document.createElement('canvas'); cv.width = 256; cv.height = 128; fn(cv.getContext('2d')); return cv; };
    S.addrBg = off(paintAddrBg); S.addrSafe = off(paintSafe);
  }

  // ---------------------------------------------------------- small builders (static, into the shell's Builder through K)
  function chipOnPillow(K, x, y, z) {
    K.bb(x - 0.09, y, z - 0.075, x + 0.09, y + 0.008, z + 0.075, 0xe6eaee);   // the cradle tray
    K.box(0.15, 0.024, 0.11, VELVET, x, y + 0.008, z);                       // velvet pillow
    K.box(0.12, 0.01, 0.08, 0x363c94, x, y + 0.032, z);
    K.ico(0.022, 0xf4f6f8, x, y + 0.05, z, 0.42);                             // the chip
    CHIPS.push(x + 0.012, y + 0.058, z + 0.01);
  }
  function cable(K, a, b, sag, n, r, hex) {   // a sagging cable of n square segments (sag < 0 bulges up)
    let px = a[0], py = a[1], pz = a[2];
    for (let i = 1; i <= n; i++) {
      const u = i / n, x = a[0] + (b[0] - a[0]) * u, y = a[1] + (b[1] - a[1]) * u - 4 * sag * u * (1 - u), z = a[2] + (b[2] - a[2]) * u;
      K.rod(px, py, pz, x, y, z, r, hex); px = x; py = y; pz = z;
    }
  }
  function cable3(K, a, m, b, r, hex) { K.rod(a[0], a[1], a[2], m[0], m[1], m[2], r, hex); K.rod(m[0], m[1], m[2], b[0], b[1], b[2], r, hex); }
  function coil(K, x, y, z, hex, toY) {   // a black coiled tether hanging from a cradle down to y toY
    let px = x, py = y, pz = z;
    for (let i = 1; i <= 6; i++) { const u = i / 6, a = i * 2.1, nx = x + Math.cos(a) * 0.012, nz = z - 0.02 + Math.sin(a) * 0.012, ny = y + (toY - y) * u; K.rod(px, py, pz, nx, ny, nz, 0.006, hex); px = nx; py = ny; pz = nz; }
  }
  function mug(K, hex, x, y, z) { K.cyl(0.04, 0.036, 0.09, 8, hex, x, y + 0.045, z); K.box(0.012, 0.05, 0.035, hex, x + 0.045, y + 0.02, z); }
  function tent(K, x, y, z) {   // a blank tent card standing on a table, facing +Z
    K.quadR(0.16, 0.06, X.atlas, RG40.tent, x, y + 0.028, z + 0.012, 0, -0.42);
    K.quadR(0.16, 0.06, X.atlas, RG40.tent, x, y + 0.028, z - 0.012, PI, -0.42);
  }
  function chainPanel(K, w, h, x, y, z, ry) { K.quadUV(w, h, K.M.chain, x, y, z, ry, 0, 0xffffff, w / 0.32, h / 0.32); }

  // ---------------------------------------------------------- ext.build(K): static additions, then the props
  function build40(K) {
    const { box, bb, boxR, cyl, ico, tor, quad, quadR, quadUV, rod, part } = K, M = K.M, T = K.T, R = K.R, COL = K.COL;
    const P = (g) => K.P(g);
    CHIPS.length = 0; LEDS.length = 0; PALMS.length = 0;
    for (const k in R40) delete R40[k];
    // ---- materials
    const PAPER = { emissive: 0xffffff, emissiveIntensity: 0.28 };
    Object.assign(X, {
      atlas: matTex(T.atlas40, { ...PAPER, key: 'reddy40_atlas' }), atlasFlat: matTex(T.atlas40, { key: 'reddy40_atlasFlat' }),
      adFg: matTex(T.adFg, { emissive: 0xffffff, transparent: true, key: 'reddy40_adFg' }), adBg: matTex(T.adBg, { emissive: 0xffffff, key: 'reddy40_adBg' }),
      addr: matTex(T.addr, { emissive: 0xffffff, key: 'reddy40_addr' }), des: matTex(T.des, { emissive: 0xffffff, key: 'reddy40_desScr' }),
      term: matTex(T.term, { emissive: 0xffffff, emissiveIntensity: 0.85, key: 'reddy40_term' }), kiosk: matTex(T.kiosk, { emissive: 0xffffff, emissiveIntensity: 0.85, key: 'reddy40_kiosk' }),
      off: mat(0x0c0f15), glassUI: mat(0xdff0fa, { transparent: true, opacity: 0.28, side: DS, key: 'reddy40_glassUI' }),
      lockG: mat(0x0e2a14, { emissive: 0x3ae060, emissiveIntensity: 1.3, key: 'reddy40_lockG' }), lockR: mat(0x2a0a08, { emissive: 0xff3a30, emissiveIntensity: 1.4, key: 'reddy40_lockR' }),
      towerL: mat(0x203040, { emissive: 0xbfe6ff, emissiveIntensity: 1.3, key: 'reddy40_towerL' }), ringL: mat(0x203040, { emissive: 0xbfe6ff, emissiveIntensity: 1.0, key: 'reddy40_ringL' }),
      desRing: mat(0x102030, { emissive: 0x4fb8ff, emissiveIntensity: 0.8, key: 'reddy40_desRing' }), lamp: mat(0xfff6e0, { emissive: 0xfff2d0, emissiveIntensity: 0.15, key: 'reddy40_lamp' }),
      glint: matTex(T.glint, { emissive: 0xffffff, emissiveIntensity: 0.6, transparent: true, key: 'reddy40_glint' }),
    });
    GLOWM ||= new THREE.MeshBasicMaterial({ color: 0xffffff });
    GLOWF ||= new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false });
    HGLOWM ||= new THREE.MeshBasicMaterial({ color: 0xffffff, vertexColors: true, fog: false });
    SKYM40 ||= new THREE.MeshBasicMaterial({ vertexColors: true, fog: false, side: THREE.BackSide, depthWrite: false });
    CLOUDM ||= new THREE.MeshBasicMaterial({ vertexColors: true, fog: false });
    CHIMEM ||= new THREE.MeshBasicMaterial({ color: 0xbfe6ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: DS });
    PINGM ||= new THREE.MeshBasicMaterial({ color: 0xbfe6ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: DS });
    OCT_S ||= new THREE.OctahedronGeometry(0.011, 0); OCT_M ||= new THREE.OctahedronGeometry(0.024, 0); OCT_L ||= new THREE.OctahedronGeometry(0.055, 0);
    RINGGEO ||= new THREE.RingGeometry(0.95, 1.0, 56).rotateX(-H); CHIMEGEO ||= new THREE.RingGeometry(0.15, 0.19, 32);

    buildFloor40(K); buildBack40(K); buildYard40(K); buildOutside40(K);
    propsFloor40(K); propsBack40(K); propsYard40(K); propsOutside40(K);
    K.resetXF(); K.setTint(K.TINT.IN);
    resetState(K);
  }

  // ======================================================== static: the shop floor (cool LED)
  function buildFloor40(K) {
    const { box, bb, boxR, cyl, quad, quadR, rod } = K, M = K.M;
    K.setTint(K.TINT.IN);
    // the big screen's bezel and a cool LED line over it (THE LATEST header and the line-up board are gone)
    bb(-4.36, 1.04, -14.47, 0.36, 2.66, -14.385, 0x0b0d12);
    bb(-4.3, 2.76, -14.47, 0.3, 2.78, -14.43, 0xffffff, M.light);
    // the display-wall ledge: four chips on velvet pillows in tethered cradles, a "3%" LCD and a blank tag each
    for (let i = 0; i < 4; i++) {
      const x = -3.35 + i * 0.9;
      chipOnPillow(K, x, 1.0, -13.95);
      bb(x - 0.035, 1.0, -14.34, x + 0.035, 1.03, -14.26, 0x2a2c30);                                   // tether puck on the ledge's back edge
      rod(x, 1.02, -14.27, x + 0.03, 1.016, -14.15, 0.01, 0x1b1c20); rod(x + 0.03, 1.016, -14.15, x, 1.012, -14.03, 0.01, 0x1b1c20);
      bb(x - 0.035, 1.0, -13.77, x + 0.035, 1.034, -13.745, 0x111318); quadR(0.06, 0.026, X.atlas, RG40.lcd, x, 1.017, -13.743);
      boxR(0.07, 0.035, 0.004, 0xffffff, x + 0.09, 1.02, -13.74, -0.3); quadR(0.066, 0.033, X.atlas, RG40.tag, x + 0.09, 1.02, -13.737, 0, -0.3);
    }
    // the four display tables: padded cream bumpers, two chips each, a blank tent card at the door end
    for (const [tx, tz] of [[-4.4, -6], [-4.4, -10], [0.4, -6], [0.4, -10]]) {
      bb(tx - 0.6, 0.84, tz - 1.24, tx + 0.6, 0.95, tz - 1.19, CREAM); bb(tx - 0.6, 0.84, tz + 1.19, tx + 0.6, 0.95, tz + 1.24, CREAM);
      bb(tx - 0.6, 0.84, tz - 1.19, tx - 0.55, 0.95, tz + 1.19, CREAM); bb(tx + 0.55, 0.84, tz - 1.19, tx + 0.6, 0.95, tz + 1.19, CREAM);
      for (const dz of [-0.45, 0.45]) { chipOnPillow(K, tx, 0.91, tz + dz); bb(tx + 0.14, 0.91, tz + dz - 0.02, tx + 0.18, 0.925, tz + dz + 0.02, 0x2a2c30); rod(tx + 0.14, 0.918, tz + dz, tx + 0.09, 0.914, tz + dz, 0.008, 0x1b1c20); }
      tent(K, tx, 0.91, tz + 1.05);
    }
    // the counter showcase's glass shelf: six chips on pillows
    for (let i = 0; i < 6; i++) chipOnPillow(K, 4.95 + i * 0.26, 0.51, -8.98);
    // two glass SafeSense terminals on thin stands (screens face the staff side: props)
    for (const x of [4.3, 6.4]) {
      cyl(0.08, 0.09, 0.015, 12, 0xd8dde2, x, 1.0075, -9.05); cyl(0.012, 0.012, 0.13, 6, CHROME, x, 1.075, -9.05);
      bb(x - 0.25, 1.125, -9.016, x + 0.25, 1.14, -8.984, 0xeef2f6);
      box(0.5, 0.32, 0.012, 0xdff0fa, x, 1.14, -9.0, 0, X.glassUI);
    }
    // the cool LED string along the front transom (bulbs: led_string), its wire and hooks
    for (let s = 0; s < 10; s++) for (let k = 0; k < 6; k++) {
      const u = (k + 0.5) / 6, x = -8.9 + s * 2 + u * 2, y = 2.58 - 0.13 * Math.sin(u * PI);
      LEDS.push(x, y - 0.03, -0.24);
    }
    for (let s = 0; s < 10; s++) {
      let px = -8.9 + s * 2, py = 2.58;
      for (let k = 0; k <= 6; k++) { const u = k < 6 ? (k + 0.5) / 6 : 1, x = -8.9 + s * 2 + u * 2, y = 2.58 - 0.13 * Math.sin(u * PI); rod(px, py, -0.24, x, y, -0.24, 0.008, 0x2a2d33); px = x; py = y; }
      bb(-8.92 + s * 2, 2.56, -0.25, -8.88 + s * 2, 2.6, -0.14, 0x8d9296);
    }
    // Margaret's chair: a brass plaque on the backrest's face
    boxR(0.215, 0.075, 0.006, 0x8a6a2a, 2.0, 0.8, -0.668, -0.12, PI, 0);
    quadR(0.2, 0.0625, X.atlas, RG40.plaque, 2.0, 0.8, -0.6725, PI, -0.12);
    // the lock light's housing over the doors (lenses: front_doors)
    bb(-2.08, 2.64, -0.2, -1.92, 2.72, -0.14, 0x2a2d33);
  }

  // ======================================================== static: back of house
  function buildBack40(K) {
    const { box, bb, boxR, cyl, ico, tor, quadR, rod } = K, COL = K.COL;
    K.setTint(K.TINT.BOH);
    // the Machine: an old chrome display gondola against the front wall
    for (const x of [3.37, 5.13]) for (const z of [-24.07, -24.63]) bb(x - 0.02, 0, z - 0.02, x + 0.02, 1.25, z + 0.02, CHROME);
    for (const y of [0.12, 0.62, 0.95]) { bb(3.35, y - 0.025, -24.65, 5.15, y, -24.05, 0xb4bac2); bb(3.35, y - 0.025, -24.67, 5.15, y + 0.03, -24.645, CHROME); }
    bb(3.35, 1.23, -24.09, 5.15, 1.25, -24.05, CHROME); bb(3.35, 1.23, -24.65, 5.15, 1.25, -24.61, CHROME);
    for (const x of [3.37, 5.13]) bb(x - 0.03, 0, -24.67, x + 0.03, 0.03, -24.03, 0x2a2c30);
    // the hover-scooter battery on the bottom shelf: grey, Yes-yellow end caps, a 5-LED bar (LEDs: machine)
    box(0.55, 0.28, 0.3, 0x8a8f96, 4.25, 0.12, -24.35);
    for (const s of [-1, 1]) box(0.04, 0.3, 0.32, YEL, 4.25 + s * 0.295, 0.11, -24.35);
    bb(4.05, 0.4, -24.37, 4.45, 0.43, -24.33, 0x2a2c30); bb(4.05, 0.4, -24.37, 4.07, 0.45, -24.33, 0x2a2c30); bb(4.43, 0.4, -24.37, 4.45, 0.45, -24.33, 0x2a2c30);
    bb(4.07, 0.24, -24.505, 4.43, 0.32, -24.5, 0x1a1c20);
    // the middle shelf: spare coils, a controller box, a roll of tape
    tor(0.11, 0.018, 0x2aa6a0, 3.75, 0.64, -24.35, H); tor(0.09, 0.016, 0x8a8178, 3.78, 0.67, -24.33, H, 0.4);
    box(0.24, 0.12, 0.18, 0x3a3d42, 4.55, 0.62, -24.35); bb(4.5, 0.74, -24.42, 4.6, 0.75, -24.3, 0x6fc8ff);
    cyl(0.05, 0.05, 0.05, 10, 0x9aa0a6, 4.95, 0.645, -24.3);
    // the two chips that are always there (x 3.6, 3.9): posts, cradles, pillows, coiled tethers, "3%" tags
    for (const x of [3.6, 3.9]) machineChip(K, x);
    COL.push([3.3, -24.7, 5.2, -24.0]);
    // kitchenette without a kettle: a clean ring where it stood, three mugs
    cyl(0.085, 0.085, 0.002, 14, 0x9a958c, 10.08, 0.921, -28.55); tor(0.08, 0.005, 0xb8b2a8, 10.08, 0.923, -28.55, H);
    mug(K, 0xf4f4f0, 10.16, 0.92, -28.2); mug(K, 0x1f6fe0, 10.26, 0.92, -28.04); mug(K, 0xe8dcc0, 10.02, 0.92, -28.08);
  }
  function machineChip(K, x) {
    K.cyl(0.015, 0.015, 0.05, 6, CHROME, x, 0.975, -24.35);
    chipOnPillow(K, x, 1.0, -24.35);
    coil(K, x - 0.03, 1.0, -24.28, 0x15161a, 0.96);
    K.quadR(0.04, 0.02, X.atlas, RG40.lcd, x, 0.975, -24.367, PI);
  }

  // ======================================================== static: the yard (walkable in 1.6), outside
  function buildYard40(K) {
    const { box, bb, boxR, cyl, ico, tor, quad, quadR, quadUV, rod } = K, M = K.M, COL = K.COL;
    K.setTint(K.TINT.OUT);
    COL.push([-6.0, -30.3, 2.15, -29.9], [10.65, -30.3, 20.0, -29.9]);                         // the rear wall either side of the backroom
    // two yellow steel bollards beside the roller door
    for (const x of [6.35, 9.15]) {
      cyl(0.1, 0.1, 1.0, 10, YEL, x, 0.5, -30.6); cyl(0.11, 0.11, 0.05, 10, 0x3a3d42, x, 1.02, -30.6);
      for (const y of [0.32, 0.72]) cyl(0.103, 0.103, 0.06, 10, 0x2a2c30, x, y, -30.6);
      COL.push([x - 0.15, -30.75, x + 0.15, -30.45]);
    }
    // hatched NO STANDING in front of the roller door
    const HY = 0xf2c230, hx0 = 6.2, hx1 = 9.3, hz0 = -32.1, hz1 = -30.32;
    bb(hx0, 0.013, hz0, hx1, 0.017, hz0 + 0.08, HY); bb(hx0, 0.013, hz1 - 0.08, hx1, 0.017, hz1, HY);
    bb(hx0, 0.013, hz0, hx0 + 0.08, 0.017, hz1, HY); bb(hx1 - 0.08, 0.013, hz0, hx1, 0.017, hz1, HY);
    for (let s = hx0 - (hz1 - hz0); s < hx1; s += 0.42) {
      const t0 = Math.max(0, hx0 - s), t1 = Math.min(hz1 - hz0, hx1 - s);
      if (t1 - t0 < 0.05) continue;
      const len = (t1 - t0) * Math.SQRT2, cx = s + (t0 + t1) / 2, cz = hz0 + (t0 + t1) / 2;
      boxR(len, 0.004, 0.08, HY, cx, 0.015, cz, 0, -PI / 4, 0);
    }
    quadR(1.5, 0.375, X.atlasFlat, RG40.nostand, 7.75, 0.019, -31.62, PI, -H);
    // parking lines for the hover-car's bay
    bb(-5.6, 0.008, -35.0, -0.2, 0.014, -34.9, 0xf2f0e6); bb(-5.6, 0.008, -37.9, -0.2, 0.014, -37.8, 0xf2f0e6);
    // three steel lamp poles (L1 is the one he walks into)
    const pole = (x, z, dx, dz) => {
      cyl(0.17, 0.2, 0.25, 8, 0xb8b2a6, x, 0.125, z); cyl(0.055, 0.075, 4.5, 8, 0x8d9296, x, 2.25, z);
      const ex = x + dx * 0.9, ez = z + dz * 0.9;
      rod(x, 4.42, z, ex, 4.55, ez, 0.06, 0x8d9296);
      boxR(0.42, 0.1, 0.22, 0x5d6166, ex, 4.55, ez, 0, Math.atan2(dx, dz) + H, 0);
      boxR(0.34, 0.012, 0.16, 0xffffff, ex, 4.494, ez, 0, Math.atan2(dx, dz) + H, 0, X.lamp);
      COL.push([x - 0.16, z - 0.16, x + 0.16, z + 0.16]);
    };
    pole(8.2, -32.6, 0, -1); pole(-1.0, -44.0, 0.7, 0.7); pole(16.0, -44.0, -0.7, 0.7);
    // AC condensers on the rear wall, their pipes; the security light over the roller door
    for (const x of [11.0, 15.0]) {
      bb(x - 0.44, 0, -30.78, x - 0.38, 0.08, -30.42, 0x3a3d42); bb(x + 0.38, 0, -30.78, x + 0.44, 0.08, -30.42, 0x3a3d42);
      bb(x - 0.475, 0.08, -30.8, x + 0.475, 0.83, -30.4, 0xdadcde);
      cyl(0.27, 0.27, 0.012, 14, 0x3a3d42, x - 0.08, 0.455, -30.806, H); boxR(0.5, 0.05, 0.008, 0x6a6e72, x - 0.08, 0.455, -30.815, 0, 0, 0.6); boxR(0.5, 0.05, 0.008, 0x6a6e72, x - 0.08, 0.455, -30.815, 0, 0, -0.9);
      for (let k = 0; k < 5; k++) bb(x + 0.26, 0.2 + k * 0.12, -30.805, x + 0.44, 0.23 + k * 0.12, -30.8, 0x9aa0a6);
      rod(x + 0.475, 0.62, -30.5, x + 0.56, 0.62, -30.5, 0.03, 0xb88a5a); rod(x + 0.56, 0.62, -30.5, x + 0.56, 0.62, -30.3, 0.03, 0xb88a5a); rod(x + 0.56, 0.62, -30.3, x + 0.56, 2.9, -30.3, 0.03, 0xb88a5a); rod(x + 0.62, 0.5, -30.3, x + 0.62, 2.9, -30.3, 0.03, 0x2a2c30);
      COL.push([x - 0.5, -30.85, x + 0.5, -30.25]);
    }
    bb(7.6, 2.92, -30.45, 7.9, 3.08, -30.25, 0x3a3d42); quad(0.26, 0.12, X.lamp, 7.75, 2.915, -30.35, 0, H);
    quadR(0.9, 0.225, X.atlasFlat, RG40.keep, 7.75, 2.62, -30.27, PI);                           // KEEP CLEAR over the roller door
    // the pallet stack
    for (let i = 0; i < 6; i++) { const y = i * 0.16; bb(4.0, y, -43.7, 5.2, y + 0.03, -42.7, 0xb08a5a); for (const z of [-43.66, -43.2, -42.74]) bb(4.0, y + 0.03, z - 0.04, 5.2, y + 0.13, z + 0.04, 0x9a7650); }
    COL.push([3.9, -43.8, 5.3, -42.6]);
    // the recycling cage: a frame, chain-link sides, flattened boxes inside, a sign
    const cx0 = 17.7, cx1 = 19.1, cz0 = -33.5, cz1 = -32.5, CF = 0x9aa0a6;
    for (const x of [cx0, cx1]) for (const z of [cz0, cz1]) bb(x - 0.03, 0, z - 0.03, x + 0.03, 1.8, z + 0.03, CF);
    for (const y of [0.04, 1.78]) { bb(cx0, y - 0.02, cz0 - 0.02, cx1, y + 0.02, cz0 + 0.02, CF); bb(cx0, y - 0.02, cz1 - 0.02, cx1, y + 0.02, cz1 + 0.02, CF); bb(cx0 - 0.02, y - 0.02, cz0, cx0 + 0.02, y + 0.02, cz1, CF); bb(cx1 - 0.02, y - 0.02, cz0, cx1 + 0.02, y + 0.02, cz1, CF); }
    chainPanel(K, 1.4, 1.74, 18.4, 0.91, cz0, 0); chainPanel(K, 1.4, 1.74, 18.4, 0.91, cz1, 0); chainPanel(K, 1.0, 1.74, cx0, 0.91, -33.0, H); chainPanel(K, 1.0, 1.74, cx1, 0.91, -33.0, H);
    for (let i = 0; i < 7; i++) boxR(0.04, 0.9 + (i % 3) * 0.15, 0.8, i % 2 ? 0xb98d5a : 0xc8a476, 17.85 + i * 0.17, 0.5, -33.0, 0, 0, 0.12 * ((i % 3) - 1));
    quadR(0.8, 0.2, X.atlasFlat, RG40.recyc, cx0 - 0.035, 1.5, -33.0, -H);
    COL.push([17.65, -33.55, 19.15, -32.45]);
    // the drone tower's base cabinet and lattice mast (head, ring, lights: drone_tower)
    const TX = 0.5, TZ = -39.5;
    bb(TX - 0.45, 0, TZ - 0.35, TX + 0.45, 1.1, TZ + 0.35, CREAM); bb(TX - 0.47, 1.1, TZ - 0.37, TX + 0.47, 1.16, TZ + 0.37, 0xd8d0bc);
    bb(TX - 0.47, 0, TZ - 0.37, TX + 0.47, 0.08, TZ + 0.37, 0x8a8478);
    quadR(0.46, 0.46, X.atlas, RG40.panel, TX + 0.452, 0.66, TZ, H);
    for (let k = 0; k < 4; k++) bb(TX - 0.452, 0.3 + k * 0.08, TZ - 0.2, TX - 0.449, 0.33 + k * 0.08, TZ + 0.2, 0x9a9488);
    const y0 = 1.16, y1 = 7.0, NL = 8, hw = (y) => 0.25 - 0.1 * (y - y0) / (y1 - y0);
    const LEG = [[-1, -1], [1, -1], [1, 1], [-1, 1]], MC = 0xc8ccd0;
    for (const [sx, sz] of LEG) rod(TX + sx * 0.25, y0, TZ + sz * 0.25, TX + sx * 0.15, y1, TZ + sz * 0.15, 0.05, MC);
    for (let k = 0; k < NL; k++) {
      const ya = y0 + (y1 - y0) * k / NL, yb = y0 + (y1 - y0) * (k + 1) / NL, ha = hw(ya), hb = hw(yb);
      for (let i = 0; i < 4; i++) {
        const [ax, az] = LEG[i], [bx, bz] = LEG[(i + 1) % 4];
        if (k % 2) rod(TX + ax * ha, ya, TZ + az * ha, TX + bx * hb, yb, TZ + bz * hb, 0.025, MC);
        else rod(TX + bx * ha, ya, TZ + bz * ha, TX + ax * hb, yb, TZ + az * hb, 0.025, MC);
        rod(TX + ax * hb, yb, TZ + az * hb, TX + bx * hb, yb, TZ + bz * hb, 0.025, MC);
      }
    }
    rod(TX + 0.27, 1.16, TZ + 0.27, TX + 0.17, 6.9, TZ + 0.17, 0.016, 0x2a2c30);                    // a cable run up the mast
    COL.push([0.0, -40.0, 1.0, -39.0]);
    // the neighbours' rear doors get bins and a hose reel; a bike rack by the cage
    for (const [x, lid] of [[-3.9, 0x2e7d32], [-2.0, 0xc62828]]) { bb(x - 0.3, 0, -31.35, x + 0.3, 1.0, -30.75, 0x3a4a3e); bb(x - 0.32, 1.0, -31.4, x + 0.32, 1.06, -30.72, lid); COL.push([x - 0.35, -31.45, x + 0.35, -30.7]); }
    cyl(0.22, 0.22, 0.12, 12, 0x2e7d32, 1.6, 1.0, -30.3, H); bb(1.5, 0.0, -30.33, 1.7, 1.0, -30.27, 0x8d9296);
  }
  function buildOutside40(K) {
    const { bb, boxR, cyl, ico, rod } = K;
    K.setTint(K.TINT.OUT);
    // cream foam sleeves on Rue's five front bollards; padded bollards along the Parade kerb every 3 m
    for (const x of [-9, -6, 2, 5, 8]) { cyl(0.135, 0.135, 0.82, 10, CREAM, x, 0.45, 3.35); cyl(0.09, 0.135, 0.06, 10, CREAM, x, 0.89, 3.35); cyl(0.14, 0.14, 0.03, 10, 0xd8ccb0, x, 0.1, 3.35); }
    for (let x = -60; x <= 60; x += 3) { cyl(0.14, 0.14, 0.78, 8, CREAM, x, 0.41, -48.25); cyl(0.08, 0.14, 0.06, 8, 0x3a3e44, x, 0.83, -48.25); }
    // a low ring of houses and trees inland (r 70–90): the title orbit's horizon (fog softens it)
    seed = 401;
    const WALLS = [0xd8d0c0, 0xcfc8b8, 0xe0d8c8, 0xc8ccc4], ROOFS = [0x8a5040, 0x5a6470, 0x7a4a3a, 0x6a6a64];
    for (let i = 0; i < 52; i++) {
      const a = (i / 52) * TAU + rnd() * 0.08, r = 70 + rnd() * 18, x = 1 + Math.sin(a) * r, z = -14 + Math.cos(a) * r;
      if (z < -40) continue;
      if (rnd() < 0.42) {
        const s = 1.1 + rnd() * 0.8;
        cyl(0.15 * s, 0.2 * s, 2.2 * s, 6, 0x7b6a55, x, 1.1 * s, z); ico(1.6 * s, rnd() > 0.5 ? 0x5f7f40 : 0x6f8f4a, x, 2.9 * s, z, 0.8);
      } else {
        const w = 6 + rnd() * 4, d = 6 + rnd() * 2, h = 2.8 + rnd() * 1.6, wc = WALLS[i % 4], rc = ROOFS[(i * 3) % 4];
        K.at(x, z, a);
        bb(-w / 2, 0, -d / 2, w / 2, h, d / 2, wc);
        boxR(w + 0.4, 0.12, d * 0.58, rc, 0, h + 0.75, d * 0.24, 0.5); boxR(w + 0.4, 0.12, d * 0.58, rc, 0, h + 0.75, -d * 0.24, -0.5);
        bb(-0.5, 0, -d / 2 - 0.02, 0.5, 2.0, -d / 2, 0x6b4a36);
        K.resetXF();
      }
    }
  }

  // ======================================================== props: the floor
  function propsFloor40(K) {
    const { box, bb, boxR, cyl, quad, quadR, quadUV, tor, part } = K, R = K.R, COL = K.COL;
    const P = (g) => K.P(g);
    K.setTint(K.TINT.IN);
    // ---- big_screen: ad (scrolling gradient + words) | address | safe | off
    R40.screen = P(new THREE.Group()); R40.screen.name = 'big_screen';
    R40.scrBg = part('', () => quadUV(4.6, 1.5, X.adBg, -2.0, 1.85, -14.38, 0, 0, 0xffffff, 1, 1), null, 0, FL);
    R40.scrFg = part('', () => quadUV(4.6, 1.5, X.adFg, -2.0, 1.85, -14.372, 0, 0, 0xffffff, 1, 0.87, 0, 0.065), null, 0, FL);
    R40.scrAddr = part('', () => quadUV(4.6, 1.5, X.addr, -2.0, 1.85, -14.376, 0, 0, 0xffffff, 1, 0.65, 0, 0.18), null, 0, FL);
    R40.scrOff = part('', () => quad(4.6, 1.5, X.off, -2.0, 1.85, -14.376), null, 0, FL);
    R40.scrFg.renderOrder = 1;
    R40.screen.add(R40.scrBg, R40.scrFg, R40.scrAddr, R40.scrOff);
    R40.screen.userData.show = (m) => screenShow(m);
    R40.screen.userData.glance = (k) => { S.glK = clamp(+k || 0, 0, 1); if (skipping()) S.glK = 0; };
    Object.defineProperty(R40.screen.userData, 'mode', { get: () => S.scr, configurable: true });
    // ---- terminals: idle | address | safe | off (screens face the staff side)
    R40.terms = [['terminal_l', 4.3], ['terminal_r', 6.4]].map(([name, x]) => {
      const g = P(new THREE.Group()); g.name = name;
      const idle = part('', () => quad(0.46, 0.28, X.term, x, 1.3, -9.009, PI), null, 0, FL);
      const addr = part('', () => quadUV(0.46, 0.28, X.addr, x, 1.3, -9.009, PI, 0, 0xffffff, 0.8, 1, 0.1, 0), null, 0, FL);
      const off = part('', () => quad(0.46, 0.28, X.off, x, 1.3, -9.009, PI), null, 0, FL);
      g.add(idle, addr, off);
      const t = { g, idle, addr, off, mode: '' };
      g.userData.show = (m) => termShow(t, m);
      return t;
    });
    // ---- the chip kiosk (where the Hero Table stood): chime() rings a soft blue pulse off the screen
    R40.kiosk = P(part('chip_kiosk', () => {
      cyl(0.27, 0.27, 0.06, 18, CREAM, 0, 0.03, 0); cyl(0.25, 0.25, 0.02, 18, 0xf4f6f8, 0, 0.07, 0);
      box(0.32, 1.17, 0.22, 0xf4f6f8, 0, 0.08, 0); box(0.3, 0.02, 0.2, 0xe2e8ee, 0, 1.25, 0);
      for (const sx of [-1, 1]) box(0.02, 1.17, 0.18, 0xe6ebf0, sx * 0.165, 0.08, 0);
      boxR(0.3, 0.36, 0.02, 0xe8eef4, 0, 1.23, 0.122, -0.2, 0, 0);
      boxR(0.34, 0.4, 0.012, 0xdff0fa, 0, 1.23, 0.139, -0.2, 0, 0, X.glassUI);
      tor(0.255, 0.012, 0xffffff, 0, 0.065, 0, H, 0, 0, X.ringL);
    }, [5.6, 0, -5.3]));
    R40.kOwn = part('', () => quad(0.28, 0.336, X.kiosk, 0, 1.23, 0.1475, 0, -0.2), null, 0, FL);
    R40.kAddr = part('', () => quadUV(0.28, 0.336, X.addr, 0, 1.23, 0.1475, 0, -0.2, 0xffffff, 0.42, 1, 0.29, 0), null, 0, FL);
    R40.kOff = part('', () => quad(0.28, 0.336, X.off, 0, 1.23, 0.1475, 0, -0.2), null, 0, FL);
    R40.chime = new THREE.Mesh(CHIMEGEO, CHIMEM); R40.chime.position.set(0, 1.23, 0.16); R40.chime.rotation.x = -0.2; R40.chime.renderOrder = 4; R40.chime.visible = false;
    R40.kiosk.add(R40.kOwn, R40.kAddr, R40.kOff, R40.chime);
    R40.kiosk.userData.chime = () => { if (!skipping()) { S.chimeT = 0; R40.chime.visible = true; } };
    R40.kiosk.userData.show = (m) => kioskShow(m);
    COL.push([5.3, -5.5, 5.9, -5.1]);
    // ---- chip lights (instanced: wall 0-3, tables 4-11, showcase 12-17, machine 18-21); markers for the three groups
    // (the machine's two built-only chips are added in propsBack40, so the mesh is made there)
    for (const [name, i0, i1, x, y, z] of [['chips_wall', 0, 4, -2.0, 1.04, -13.95], ['chips_tables', 4, 12, -2.0, 0.95, -8.0], ['chips_showcase', 12, 18, 5.6, 0.55, -8.98]]) {
      const o = P(new THREE.Object3D()); o.name = name; o.position.set(x, y, z);
      o.userData.on = (b) => { for (let i = i0; i < i1; i++) S.chipOn[i] = b ? 1 : 0; S.chipClock = 1; S.chipDirty = true; };
    }
    // ---- the hover-trolley (PROPS.hover_trolley): drifts an ellipse round (8.6, -3.4); settle(true) eases it down
    R40.trolley = PROPS.hover_trolley(); R40.trolley.name = 'hover_trolley'; P(R40.trolley);
    R40.trBlob = blobShadow(); R40.trBlob.scale.set(0.85, 1, 1.25); P(R40.trBlob);
    S.trAt = [8.6, 0, -3.4]; S.trCol = [PARK, PARK, PARK, PARK]; COL.push(S.trCol);
    R40.trolley.userData.at = S.trAt;
    R40.trolley.userData.settle = (on) => { S.trSettle = !!on; if (skipping()) S.trY = on ? -0.23 : 0.04; };
    // ---- the LED string (60 cool-white bulbs, shimmer)
    R40.led = P(new THREE.InstancedMesh(OCT_M, GLOWM, LEDS.length / 3)); R40.led.name = 'led_string';
    for (let i = 0; i < LEDS.length / 3; i++) { R40.led.setMatrixAt(i, sM.makeTranslation(LEDS[i * 3], LEDS[i * 3 + 1], LEDS[i * 3 + 2])); R40.led.setColorAt(i, sC.setHex(0xe8f4ff)); }
    R40.led.instanceMatrix.needsUpdate = true; R40.led.instanceColor.setUsage(THREE.DynamicDrawUsage); R40.led.computeBoundingSphere();
    // ---- front_doors: the lock light (green -> red); while locked the doors never open unless door_l.hold(true)
    R40.doors = P(part('front_doors', () => { quad(0.1, 0.04, X.lockG, -2.0, 2.68, -0.202, PI); quad(0.1, 0.04, X.lockG, -2.0, 3.06, 0.142, 0); bb(-2.07, 3.03, 0.14, -1.93, 3.09, 0.141, 0x2a2d33); }, null, 0, FL));
    R40.doorLens = R40.doors.children[0];
    R40.doors.userData.lock = (on) => lockDoors(K, !!on);
    Object.defineProperty(R40.doors.userData, 'locked', { get: () => S.lockOn, configurable: true });
    const hold0 = R.doorL.userData.hold;
    R.doorL.userData.hold = (v) => { hold0(v); if (S.lockOn && R.doorHold === null) { R.doorHold = false; if (skipping()) R.doorT = 0; } };
    // ---- screens_all: one switch for every screen (they share the address canvas)
    const all = P(new THREE.Object3D()); all.name = 'screens_all';
    all.userData.show = (m) => { screenShow(m); for (const t of R40.terms) termShow(t, m === 'ad' ? 'idle' : m); kioskShow(m === 'ad' ? 'kiosk' : m); tvShow(K, m === 'ad' ? 'off' : m); };
    // caption(text | null): a lower-third name strip on the shared address canvas (every screen showing 'address');
    // none by default and after every dress (B1's 2037 frame: caption('THE MANAGER'))
    all.userData.caption = R40.screen.userData.caption = (txt) => { S.caption = txt ? String(txt) : null; if (S.addrMode === 'address') addrPaint('address'); };
    // ---- the TV: an address/safe face over the shell's (the shell's quad shows 'off')
    R40.tvAddr = part('', () => quadUV(0.32, 0.24, X.addr, -0.002, 0, 0, -H, 0, 0xffffff, 0.66, 1, 0.17, 0), null, 0, FL);
    R.tv.add(R40.tvAddr); R40.tvAddr.visible = false;
    R.tv.userData.show = (m) => tvShow(K, m);
    // ---- the locals: four pooled rigs (built once), posed here, never actors
    LOC ||= [['local40_a', -6.3, -6.4, -H, false], ['local40_b', -3.4, -9.4, -H, false], ['local40_c', 2.65, -0.85, PI, true], ['local40_d', 9.6, -5.0, H, false]].map(([id, x, z, ry, seat]) => {
      const rig = buildCharacter(id); rig.root.add(blobShadow()); rig.root.name = id;
      let chipM = null;
      if (rig.attach && rig.attach.chip_light) rig.attach.chip_light.traverse((o) => { if (o.material && o.material.emissive && !chipM) chipM = o.material; });
      const lookYaw = Math.atan2(-2.0 - x, -14.36 - z);
      return { id, rig, x, z, ry, seat, chipM, lookYaw: seat ? ry + clamp(wrapA(lookYaw - ry), -0.35, 0.35) : lookYaw, yaw: ry, anim: '', at: 0, col: [PARK, PARK, PARK, PARK], atA: [x, 0, z] };
    });
    const locals = P(new THREE.Object3D()); locals.name = 'locals'; locals.userData.rigs = {};
    for (const L of LOC) {
      R.root.add(L.rig.root); L.rig.root.position.set(L.x, 0, L.z); L.rig.root.rotation.y = L.ry; L.yaw = L.ry;
      L.rig.root.userData.at = L.atA; locals.userData.rigs[L.id] = L.rig;
      if (!L.seat) COL.push(L.col);
    }
    locals.userData.lookUp = (on) => { S.locLook = !!on; };
    locals.userData.pulse = (on) => { S.locPulse = !!on; };
    locals.userData.applaud = (on) => { S.locClap = !!on; };
    locals.userData.idle = () => localsMode('idle');
    locals.userData.hide = () => localsMode('hidden');
    locals.userData.freeze = () => localsMode('frozen');
    // ---- aliases: names the spec uses for shell props (they share the shell prop's userData)
    for (const [alias, o] of [['counter_speaker', R.radio], ['jordan_office_door', R.odoor], ['wall_phone40', R.wallPhone], ['xmas_tree_floor', R.tree]]) {
      const a = new THREE.Object3D(); a.name = alias; a.userData = o.userData; o.add(a);
    }
  }

  // ======================================================== props: back of house
  function propsBack40(K) {
    const { box, bb, boxR, cyl, ico, tor, quad, quadR, part } = K, R = K.R, COL = K.COL;
    const P = (g) => K.P(g);
    K.setTint(K.TINT.BOH);
    R40.mach = P(new THREE.Group()); R40.mach.name = 'machine';
    // the two built-only chips (x 4.6, 4.9)
    R40.chipsB = part('', () => { for (const x of [4.6, 4.9]) machineChip(K, x); }, null, 0, FL);
    // the nest of cables (2040 colours) from the chips into Des, the battery, the junction box and up to the wall phone
    const TEAL = 0x2aa6a0, WG = 0x8a8178, OB = 0x4f6fd8, BLK = 0x16171a, RED = 0xc62828, CRM = 0xd8c890;
    R40.cables = part('', () => {
      cable(K, [3.6, 1.0, -24.3], [4.17, 0.985, -24.33], 0.04, 4, 0.012, TEAL);
      cable(K, [3.9, 1.0, -24.3], [4.18, 0.99, -24.41], 0.03, 3, 0.012, YEL);
      cable(K, [4.6, 1.0, -24.3], [4.33, 0.99, -24.34], 0.03, 3, 0.012, OB);
      cable(K, [4.9, 1.0, -24.3], [4.34, 0.985, -24.42], 0.05, 4, 0.012, WG);
      cable(K, [4.25, 1.0, -24.27], [4.3, 0.93, -24.075], 0.03, 3, 0.014, BLK);
      cable(K, [4.33, 1.03, -24.045], [4.33, 1.34, -24.045], 0.0, 2, 0.012, RED);
      cable(K, [4.398, 1.37, -24.05], [4.45, 0.99, -24.2], 0.07, 4, 0.008, CRM);
      cable3(K, [4.1, 0.4, -24.3], [4.06, 0.7, -24.62], [4.15, 0.97, -24.3], 0.014, RED);
      cable3(K, [3.98, 0.3, -24.45], [3.7, 0.55, -24.7], [3.62, 0.99, -24.42], 0.012, TEAL);
      cable3(K, [4.52, 0.3, -24.45], [4.82, 0.56, -24.71], [4.88, 0.99, -24.42], 0.012, OB);
      cable(K, [4.0, 0.95, -24.62], [4.5, 0.95, -24.63], 0.18, 4, 0.01, OB);
      cable(K, [3.5, 0.95, -24.6], [3.85, 0.95, -24.62], 0.12, 3, 0.01, WG);
      cable(K, [4.6, 0.95, -24.6], [5.0, 0.95, -24.64], 0.1, 3, 0.01, YEL);
    }, null, 0, FL);
    // B1 (half-built): two chips still boxed on the floor, the cables in a loose coil
    R40.half = part('', () => {
      for (const [x, z, ry] of [[5.0, -25.0, 0.2], [5.25, -24.85, -0.3]]) {
        K.at(x, z, ry);
        box(0.2, 0.12, 0.16, 0xf4f6f8, 0, 0, 0); bb(-0.1, 0.12, -0.002, 0.1, 0.122, 0.002, 0xc8ccd2);
        quadR(0.16, 0.08, X.atlas, RG40.box, 0, 0.06, -0.081, PI);
        K.resetXF();
      }
      for (const [r, hex, y, dx] of [[0.17, TEAL, 0.012, 0], [0.14, OB, 0.03, 0.03], [0.12, YEL, 0.045, -0.02], [0.15, WG, 0.06, 0.02], [0.1, BLK, 0.075, 0]]) tor(r, 0.011, hex, 4.6 + dx, y, -25.1, H);
      K.rod(4.75, 0.02, -25.08, 4.95, 0.01, -25.3, 0.012, TEAL); K.rod(4.45, 0.05, -25.05, 4.3, 0.01, -24.85, 0.012, RED);
    }, null, 0, FL);
    // the battery's 5-LED charge bar (instanced, so it can chase)
    R40.batt = new THREE.InstancedMesh(OCT_S, GLOWM, 5); R40.batt.name = 'battery_leds';
    for (let i = 0; i < 5; i++) { R40.batt.setMatrixAt(i, sM.compose(sV.set(4.13 + i * 0.06, 0.28, -24.506), sQ.identity(), sS.set(2.2, 1.4, 0.5))); R40.batt.setColorAt(i, sC.setHex(0x5ae08a)); }
    R40.batt.instanceMatrix.needsUpdate = true; R40.batt.instanceColor.setUsage(THREE.DynamicDrawUsage); R40.batt.computeBoundingSphere();
    R40.mach.add(R40.chipsB, R40.cables, R40.half, R40.batt);
    R40.mach.userData.set = (st) => machSet(st);
    R40.mach.userData.flare = (on) => { S.flare = !!on; S.flareT = -1; S.chipClock = 1; S.chipDirty = true; };
    Object.defineProperty(R40.mach.userData, 'state', { get: () => S.mach, configurable: true });
    // the chip lights (all 22)
    R40.chips = P(new THREE.InstancedMesh(OCT_S, GLOWM, CHIPS.length / 3)); R40.chips.name = 'chip_lights';
    S.chipOn = new Float32Array(CHIPS.length / 3).fill(1);
    chipMatrices();
    for (let i = 0; i < CHIPS.length / 3; i++) R40.chips.setColorAt(i, sC.setHex(0xbfe6ff));
    R40.chips.instanceColor.setUsage(THREE.DynamicDrawUsage);
    // ---- Des, the kettle on a phone plan
    R40.des = P(buildDes());
    R40.des.userData.screen = (st) => desScreen(st);
    R40.des.userData.type = (txt, dur = 1.6) => desType(String(txt == null ? '' : txt), dur);
    R40.des.userData.boil = () => desBoil();
    R40.des.userData.glow = (on) => { S.desGlow = !!on; };
    Object.defineProperty(R40.des.userData, 'state', { get: () => S.desSt, configurable: true });
    // ---- the rubber wedge holding the backroom door open (corridor side, under the open door's free edge)
    R40.wedge = P(part('door_wedge', () => { boxR(0.15, 0.035, 0.065, 0x2a2a2c, 0, 0.02, 0, 0, 0, 0.16); box(0.05, 0.045, 0.065, 0x2a2a2c, 0.06, 0, 0); }, [6.13, 0, -23.12], 0));
    // the doorway's collider (the shell keeps Rue's door collider): parked while the door is wedged open
    S.doorway = null; for (const c of COL) if (c[0] === 5.95 && c[1] === -24 && c[2] === 6.85 && c[3] === -23.75) S.doorway = c;
    S.leafCol = [PARK, PARK, PARK, PARK]; COL.push(S.leafCol);
  }
  function buildDes() {
    const k = ART_KIT.kit();
    const chrome = (x, y, z, nx, ny, nz) => { const a = Math.atan2(nx, nz), v = 0.5 + 0.5 * Math.sin(a * 2 + 0.9) * Math.cos(y * 16); return v > 0.78 ? '#f4f6f8' : v > 0.5 ? '#c6cbd2' : v > 0.24 ? '#959ca6' : '#6a717a'; };
    k.cyl(0.098, 0.102, 0.022, 16, '#26282c', 0, 0.011, 0);
    k.lathe([[0.001, 0.022], [0.085, 0.022], [0.084, 0.06], [0.081, 0.16], [0.076, 0.24], [0.072, 0.258], [0.045, 0.266], [0.001, 0.268]], 16, null, 0, 0, 0, null, chrome);
    k.cyl(0.03, 0.034, 0.014, 10, '#2c2f34', 0, 0.272, 0); k.box(0.026, 0.012, 0.012, '#2c2f34', 0, 0.284, 0);
    k.box(0.02, 0.15, 0.022, '#2c2f34', 0.118, 0.15, 0); k.box(0.042, 0.02, 0.022, '#2c2f34', 0.097, 0.222, 0); k.box(0.042, 0.02, 0.022, '#2c2f34', 0.097, 0.08, 0);
    k.cyl(0.011, 0.02, 0.07, 8, null, -0.1, 0.225, 0, 0, 0, 0.75, null, chrome);
    k.box(0.088, 0.052, 0.01, '#101216', 0, 0.125, -0.08);
    k.plane(0.07, 0.035, '#ffffff', 0, 0.125, -0.0856, 0, PI, 0, X.des);
    k.torus(0.1, 0.0055, 4, 24, '#ffffff', 0, 0.022, 0, H, 0, 0, X.desRing);
    const g = k.done(); g.name = 'des'; g.position.set(4.25, 0.95, -24.38);
    return g;
  }

  // ======================================================== props: the yard
  function propsYard40(K) {
    const { box, bb, boxR, cyl, ico, tor, part } = K, COL = K.COL;
    const P = (g) => K.P(g);
    K.setTint(K.TINT.OUT);
    // ---- the drone tower: head pod, six lights, a turning scanner ring, the ping ring on the ground
    R40.tower = P(new THREE.Group()); R40.tower.name = 'drone_tower'; R40.tower.position.set(0.5, 0, -39.5);
    const head = part('', () => {
      cyl(0.12, 0.2, 0.22, 8, 0xc8ccd0, 0, 6.98, 0);
      cyl(0.5, 0.3, 0.2, 14, 0xe8ecf0, 0, 7.18, 0); cyl(0.5, 0.5, 0.08, 14, 0x1a2028, 0, 7.32, 0); cyl(0.22, 0.5, 0.24, 14, 0xf4f6f8, 0, 7.48, 0);
      cyl(0.025, 0.04, 0.5, 6, 0xc8ccd0, 0, 7.85, 0); ico(0.045, 0xd8dce2, 0, 8.12, 0);
    }, null, 0, FL);
    const lights = part('', () => { for (let i = 0; i < 6; i++) { const a = i * TAU / 6; box(0.1, 0.05, 0.03, 0xffffff, Math.sin(a) * 0.505, 7.295, Math.cos(a) * 0.505, a, X.towerL); } }, null, 0, FL);
    R40.scan = part('', () => {
      tor(0.75, 0.032, 0xd8dce2, 0, 0, 0, H);
      for (let i = 0; i < 3; i++) { const a = i * TAU / 3; box(0.1, 0.07, 0.13, 0x1a2028, Math.sin(a) * 0.75, -0.035, Math.cos(a) * 0.75, a); box(0.06, 0.02, 0.02, 0xffffff, Math.sin(a) * 0.82, -0.005, Math.cos(a) * 0.82, a, X.towerL); }
      for (let i = 0; i < 3; i++) { const a = i * TAU / 3 + PI / 3; K.rod(0, 0, 0, Math.sin(a) * 0.72, 0, Math.cos(a) * 0.72, 0.02, 0xc8ccd0); }
    }, [0, 7.0, 0], 0, FL);
    R40.ping = new THREE.Mesh(RINGGEO, PINGM); R40.ping.position.set(0, 0.035, 0); R40.ping.renderOrder = 4; R40.ping.visible = false; R40.ping.frustumCulled = false;
    R40.tower.add(head, lights, R40.scan, R40.ping);
    R40.tower.userData.on = (b) => { S.towerOn = !!b; if (!b) { S.pingT = -1; R40.ping.visible = false; } };
    R40.tower.userData.ping = () => { if (!skipping()) S.pingT = 0; };
    R40.tower.userData.alert = (on) => { S.alert = !!on; X.towerL.emissive.setHex(on ? 0xffb020 : 0xbfe6ff); };
    // ---- the skip bin: push(dx) slides it along X (x 9.5..16.5); its collider follows
    R40.skip = P(part('skip_bin', () => {
      const G = 0x2e6b3e, G2 = 0x245832, BR = 0xd8b030;
      bb(-0.82, 0.04, -0.6, 0.82, 0.14, 0.6, G2);
      for (const s of [-1, 1]) { boxR(0.06, 1.3, 1.26, G, s * 0.9, 0.72, 0, 0, 0, -s * 0.15); bb(-0.95, 0.1, s * 0.62 - 0.03, 0.95, 1.3, s * 0.62 + 0.03, G); }
      bb(-1.0, 1.26, -0.67, 1.0, 1.32, -0.6, G2); bb(-1.0, 1.26, 0.6, 1.0, 1.32, 0.67, G2); bb(-1.02, 1.26, -0.67, -0.94, 1.32, 0.67, G2); bb(0.94, 1.26, -0.67, 1.02, 1.32, 0.67, G2);
      bb(-0.86, 0.14, -0.58, 0.86, 0.16, 0.58, 0x1e2a22);
      for (const [x, z, w, h, c] of [[-0.4, -0.2, 0.5, 1.15, 0xb98d5a], [0.2, 0.15, 0.6, 1.05, 0xc8a476], [0.55, -0.25, 0.4, 1.22, 0x8a8f96]]) bb(x - w / 2, 0.16, z - 0.2, x + w / 2, h, z + 0.2, c);
      for (const s of [-1, 1]) { bb(s * 0.96 - 0.05, 0.55, -0.45, s * 0.96 + 0.05, 0.62, -0.3, BR); bb(s * 0.96 - 0.05, 0.55, 0.3, s * 0.96 + 0.05, 0.62, 0.45, BR); cyl(0.04, 0.04, 0.12, 8, BR, s * 1.03, 0.74, -0.37, 0, H); cyl(0.04, 0.04, 0.12, 8, BR, s * 1.03, 0.74, 0.37, 0, H); }
    }, [12.8, 0, -36.6]));
    S.skipCol = [11.8, -37.25, 13.8, -35.95]; COL.push(S.skipCol);
    R40.skip.userData.x = 12.8;
    R40.skip.userData.push = (dx) => { S.skipTo = clamp(S.skipTo + (+dx || 0), 9.5, 16.5); if (skipping()) S.skipX = S.skipTo; };
    // parked hover-car / van colliders (the bodies are hover_cars instances 0 and 1)
    COL.push([15.75, -42.85, 17.85, -38.15], [-4.95, -37.3, -0.65, -35.5]);
    COL.push([9.4, -46.8, 13.6, -46.5]);   // past the gate line: the exit is the gate hotspot, the footpath is scenery
  }

  // ======================================================== props: outside (cars, palm lights, the ring, sky, clouds)
  const CAR_COLS = [0xf2f4f6, 0xd8dce0, 0x2a3a6a, 0xb8262c, 0x2aa6a0, 0xe8e0cc, 0x3a3d44, 0xf2f4f6, 0x8aa0b8, 0xd0c8b8, 0x5a6a7a, 0xffffff, 0xc0c4c8];
  // [x, z, ry, scale y, lane speed (0 parked)]: 0 yard van, 1 yard car, 2-4 front car park, 5-6 front road, 7-10 Parade, 11-12 spare
  const CARS = [[16.8, -40.5, PI, 1.6, 0], [-2.8, -36.4, H, 1, 0], [-10.25, 9.3, PI, 1, 0], [6.25, 9.3, PI, 1, 0], [8.95, 9.3, PI, 1.25, 0],
    [0, 29.6, H, 1, 5.2], [0, 32.4, -H, 1, 4.4], [0, -50.2, H, 1, 5.6], [0, -50.2, H, 1.2, 5.6], [0, -53.3, -H, 1, 4.6], [0, -53.3, -H, 1, 4.6],
    [0, -1000, 0, 1, 0], [0, -1000, 0, 1, 0]];
  const CAR_PH = [0, 0, 0, 0, 0, 10, 70, 30, 100, 55, 125, 0, 0];
  function carGeos() {
    if (CARG) return CARG;
    const k = ART_KIT.kit(), dk = '#1a2430', trim = '#2a2c30', W = '#ffffff', PADS = [[0.62, 1.45], [-0.62, 1.45], [0.62, -1.45], [-0.62, -1.45]];
    k.box(1.76, 0.18, 4.2, W, 0, 0.12, 0); k.box(1.72, 0.48, 4.1, W, 0, 0.42, 0);
    k.box(1.52, 0.46, 2.2, W, 0, 0.88, -0.25); k.box(1.545, 0.3, 2.225, dk, 0, 0.9, -0.25);
    k.box(1.4, 0.42, 0.06, dk, 0, 0.84, 0.92, 0.6, 0, 0); k.box(1.4, 0.4, 0.06, dk, 0, 0.84, -1.42, -0.55, 0, 0);
    k.box(1.5, 0.06, 1.8, '#e8eaee', 0, 1.12, -0.25);
    k.box(1.78, 0.1, 0.12, trim, 0, 0.24, 2.08); k.box(1.78, 0.1, 0.12, trim, 0, 0.24, -2.08);
    for (const [x, z] of PADS) k.cyl(0.3, 0.34, 0.08, 10, '#3a3d44', x, 0.03, z);
    const gb = k.done().children[0].geometry;
    const l = ART_KIT.kit();
    for (const sx of [-1, 1]) { l.box(0.34, 0.1, 0.04, '#fff6d8', sx * 0.6, 0.48, 2.07); l.box(0.3, 0.08, 0.04, '#ff2a2a', sx * 0.62, 0.5, -2.07); }
    for (const [x, z] of PADS) l.cyl(0.25, 0.25, 0.02, 10, '#bfe6ff', x, -0.02, z);
    for (const sx of [-1, 1]) l.box(0.03, 0.03, 3.4, '#bfe6ff', sx * 0.885, 0.035, 0);
    l.box(1.5, 0.03, 0.03, '#bfe6ff', 0, 0.035, 2.105); l.box(1.5, 0.03, 0.03, '#bfe6ff', 0, 0.035, -2.105);
    const gl = l.done().children[0].geometry;
    CARG = [gb, gl]; return CARG;
  }
  function propsOutside40(K) {
    const { boxR, ico, part } = K, R = K.R;
    const P = (g) => K.P(g);
    K.setTint(K.TINT.OUT);
    // ---- hover-cars: 13 bodies (white geometry, instance colour) + 13 glows (lamps, underglow)
    const [gb, gl] = carGeos();
    R40.cars = P(new THREE.Group()); R40.cars.name = 'hover_cars';
    R40.carB = new THREE.InstancedMesh(gb, mat(0xffffff), CARS.length); R40.carB.name = 'hover_car_bodies';
    R40.carG = new THREE.InstancedMesh(gl, HGLOWM, CARS.length); R40.carG.name = 'hover_car_glows';
    for (const m of [R40.carB, R40.carG]) { m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false; }
    for (let i = 0; i < CARS.length; i++) { R40.carB.setColorAt(i, sC.setHex(CAR_COLS[i])); R40.carG.setColorAt(i, sC.setScalar(1)); }
    R40.carG.instanceColor.setUsage(THREE.DynamicDrawUsage);
    R40.cars.add(R40.carB, R40.carG);
    const parked = P(new THREE.Object3D()); parked.name = 'hover_parked_yard'; parked.position.set(16.8, 0.3, -40.5); parked.userData.instances = [0, 1];
    carsTick(0, 0);
    // ---- palm lights: 24 warm coloured bulbs spiralled round each Parade palm (7) and each front palm (5)
    const palms = [];
    for (let x = -24; x <= 24; x += 8) palms.push([x, -57, 6.4 + ((x / 8) % 2 ? 0.5 : 0)]);
    for (const [x, h] of [[-14, 6.5], [-4, 7.5], [9.5, 6.8], [19, 7.2], [-22, 7]]) palms.push([x, 24.4, h]);
    seed = 607;
    for (const [px, pz, h] of palms) {
      const segH = h / 6, ph = rnd() * TAU;
      for (let j = 0; j < 24; j++) {
        const u = j / 23, y = 0.9 + u * (h - 1.7), s = y / segH, r = 0.18 - 0.012 * s + 0.04, a = u * 3.5 * TAU + ph;
        PALMS.push(px + s * 0.04 + Math.cos(a) * r, y, pz + Math.sin(a) * r);
      }
    }
    const NP = PALMS.length / 3;
    R40.palm = P(new THREE.InstancedMesh(OCT_L, GLOWF, NP)); R40.palm.name = 'palm_lights';
    S.palmPh = new Float32Array(NP); S.palmCol = new Float32Array(NP * 3);
    for (let i = 0; i < NP; i++) {
      R40.palm.setMatrixAt(i, sM.makeTranslation(PALMS[i * 3], PALMS[i * 3 + 1], PALMS[i * 3 + 2]));
      sC.setHex(PALM_COLS[i % PALM_COLS.length]); S.palmCol[i * 3] = sC.r; S.palmCol[i * 3 + 1] = sC.g; S.palmCol[i * 3 + 2] = sC.b; S.palmPh[i] = rnd() * TAU;
      R40.palm.setColorAt(i, sC);
    }
    R40.palm.instanceMatrix.needsUpdate = true; R40.palm.instanceColor.setUsage(THREE.DynamicDrawUsage); R40.palm.computeBoundingSphere();
    // ---- the title's ring of Courtesy Drones (32 + 32 lights)
    R40.ring = DRONE_INSTANCED.make(32, { state: 'patrol' });
    R40.ring.group.name = 'drone_ring'; R40.ring.body.name = 'drone_ring_bodies'; R40.ring.light.name = 'drone_ring_lights';
    P(R40.ring.group); R40.ring.group.visible = false;
    S.ringPh = new Float32Array(32); seed = 619; for (let i = 0; i < 32; i++) S.ringPh[i] = rnd() * TAU;
    // ---- a pelican gliding a loop over the foreshore
    R40.glider = P(part('pelican_glider', () => {
      ico(0.25, 0xeceae4, 0, 0, 0, 0.62); boxR(0.13, 0.08, 0.4, 0xe8a040, 0, 0.0, 0.42, 0.12); ico(0.1, 0xf6f4ee, 0, 0.06, 0.22);
      for (const s of [-1, 1]) { boxR(1.1, 0.03, 0.34, 0xe6e4de, s * 0.62, 0.03, -0.02, 0, 0, s * -0.1); boxR(0.55, 0.03, 0.3, 0x3a3a3c, s * 1.38, -0.02, -0.05, 0, 0, s * 0.12); }
      boxR(0.2, 0.04, 0.22, 0xdedcd6, 0, 0, -0.34);
    }, null, 0, FL));
    R40.glider.scale.setScalar(1.5);
    // ---- the dusk sky dome (fog-free vertex colours: orange west horizon, navy overhead, darker over the bay)
    {
      const g = new THREE.SphereGeometry(300, 24, 12, 0, TAU, 0, PI * 0.6), p = g.attributes.position, col = new Float32Array(p.count * 3);
      const cW = new THREE.Color(0xf39a5b), cGlow = new THREE.Color(0xffc890), cTop = new THREE.Color(0x2b3f73), cBay = new THREE.Color(0x18264a), cFog = new THREE.Color(0x5a5a7a), c1 = new THREE.Color(), c2 = new THREE.Color();
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i), y = p.getY(i), z = p.getZ(i), r = Math.hypot(x, z) || 1, h = y / 300, w = Math.pow(Math.max(0, (z / r + 1) / 2), 1.7);
        c1.copy(cBay).lerp(cW, w); if (h < 0.08) c1.lerp(cGlow, w * (1 - Math.max(0, h) / 0.08) * 0.5);
        if (h < 0.1) c1.lerp(cFog, (1 - w) * (1 - smooth(Math.max(0, h) / 0.1)) * 0.85);
        if (h < 0) c2.copy(c1).lerp(cFog, Math.min(1, -h * 4)); else c2.copy(c1).lerp(cTop, smooth(h / 0.55));
        col[i * 3] = c2.r; col[i * 3 + 1] = c2.g; col[i * 3 + 2] = c2.b;
      }
      g.setAttribute('color', new THREE.BufferAttribute(col, 3));
      R40.dome = P(new THREE.Mesh(g, SKYM40)); R40.dome.name = 'sky_dome'; R40.dome.position.set(1, 0, -14); R40.dome.renderOrder = -1; R40.dome.frustumCulled = false; R40.dome.visible = false;
    }
    // ---- five storm clouds over the bay (faceted, fog-free; lightning brightens their material)
    {
      const parts = [], top = new THREE.Color(0x76668a), bot = new THREE.Color(0x2a2638), rim = new THREE.Color(0xc87a6a), c = new THREE.Color(), n = new THREE.Vector3(), a = new THREE.Vector3(), b = new THREE.Vector3(), cc = new THREE.Vector3();
      seed = 503;
      for (const [cx, cy, cz, s] of [[-70, 44, -140, 1.2], [-20, 54, -168, 1.4], [28, 38, -126, 1.0], [72, 58, -176, 1.5], [118, 46, -150, 1.1]]) {
        for (let k = 0; k < 7; k++) {
          let g = new THREE.IcosahedronGeometry((8 + rnd() * 8) * s, 1); if (g.index) g = g.toNonIndexed();
          g.scale(1.6, 0.42, 1.0); g.translate(cx + (rnd() - 0.5) * 34 * s, cy + (rnd() - 0.3) * 6, cz + (rnd() - 0.5) * 14 * s);
          const p = g.attributes.position, col = new Float32Array(p.count * 3);
          for (let t = 0; t < p.count; t += 3) {
            a.fromBufferAttribute(p, t); b.fromBufferAttribute(p, t + 1); cc.fromBufferAttribute(p, t + 2);
            n.subVectors(b, a).cross(cc.sub(a)).normalize();
            c.copy(bot).lerp(top, 0.5 + 0.5 * n.y); if (n.z > 0.15) c.lerp(rim, (n.z - 0.15) * 0.55 * Math.max(0, 0.4 + n.y));
            for (let v = 0; v < 3; v++) { col[(t + v) * 3] = c.r; col[(t + v) * 3 + 1] = c.g; col[(t + v) * 3 + 2] = c.b; }
          }
          g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.deleteAttribute('uv'); g.deleteAttribute('normal');
          parts.push(g);
        }
      }
      const merged = mergeGeometries(parts); for (const g of parts) g.dispose();
      R40.clouds = P(new THREE.Mesh(merged, CLOUDM)); R40.clouds.name = 'storm_clouds'; R40.clouds.frustumCulled = false; R40.clouds.visible = false;
      R40.clouds.userData.flash = () => { if (!skipping()) S.lightT = 0; };
    }
    // ---- glints on the bay (a transparent layer over the shell's flat water; scrolls)
    R40.glints = P(part('bay_glints', () => K.quad(400, 200, X.glint, 0, -0.42, -160.5, 0, -H), null, 0, FL));
  }

  // ======================================================== dynamic helpers (no allocation)
  function chipMatrices() {
    const n = CHIPS.length / 3, half = S.mach === 'half';
    for (let i = 0; i < n; i++) {
      const hide = half && i >= 20, flare = S.flare && i >= 18, s = hide ? 0 : flare ? 1.6 : 1;
      R40.chips.setMatrixAt(i, sM.compose(sV.set(CHIPS[i * 3], CHIPS[i * 3 + 1], CHIPS[i * 3 + 2]), sQ.identity(), sS.set(s, s, s)));
    }
    R40.chips.instanceMatrix.needsUpdate = true; R40.chips.computeBoundingSphere();
  }
  function screenShow(m) {
    if (m !== 'address' && m !== 'safe' && m !== 'off') m = 'ad';
    S.scr = m;
    R40.scrBg.visible = R40.scrFg.visible = m === 'ad'; R40.scrAddr.visible = m === 'address' || m === 'safe'; R40.scrOff.visible = m === 'off';
    if (m === 'address' || m === 'safe') addrPaint(m);
  }
  function termShow(t, m) {
    if (m !== 'address' && m !== 'safe' && m !== 'off') m = 'idle';
    t.mode = m; t.idle.visible = m === 'idle'; t.addr.visible = m === 'address' || m === 'safe'; t.off.visible = m === 'off';
    if (t.addr.visible) addrPaint(m);
  }
  function kioskShow(m) {
    if (m !== 'address' && m !== 'safe' && m !== 'off') m = 'kiosk';
    S.kiosk = m; R40.kOwn.visible = m === 'kiosk'; R40.kAddr.visible = m === 'address' || m === 'safe'; R40.kOff.visible = m === 'off';
    if (R40.kAddr.visible) addrPaint(m);
  }
  function tvShow(K, m) {
    const R = K.R, own = R.tv.children[0];
    const a = m === 'address' || m === 'safe';
    R40.tvAddr.visible = a; if (own) own.visible = !a;
    if (a) addrPaint(m);
  }
  function addrPaint(m) {   // the shared canvas: 'address' (background + the head at the current glance) or 'safe'
    const T = S.T; if (!T) return;
    const c = T.addr.image.getContext('2d');
    if (m === 'safe') { if (S.addrMode === 'safe') return; c.drawImage(S.addrSafe, 0, 0); }
    else { c.drawImage(S.addrBg, 0, 0); paintHead(c, S.glP = S.glK); if (S.caption) paintCaption(c, S.caption); }
    S.addrMode = m; T.addr.needsUpdate = true;
  }
  function desScreen(st) {
    S.desSt = st || 'des'; S.boilT = -1; S.typeT = -1; S.dots = 0; S.dotT = 0; S.cursorOn = true;
    if (st === 'name' && S.typed == null) S.typed = '';
    S.desDirty = true;
  }
  function desType(txt, dur) {
    S.desSt = 'name'; S.typeFull = txt; S.typeDur = Math.max(0.01, dur); S.boilT = -1;
    if (skipping()) { S.typed = txt; S.typeT = -1; } else { S.typed = ''; S.typeT = 0; }
    S.desDirty = true;
  }
  function desBoil() {
    if (skipping()) { desScreen('des'); return; }
    S.desSt = 'boiling'; S.boilT = 0; S.dots = 0; S.dotT = 0; S.boilK = 0; S.desDirty = true; S.puffT = 0;
  }
  function machSet(st) {
    S.mach = st === 'half' ? 'half' : 'built';
    const half = S.mach === 'half';
    R40.chipsB.visible = !half; R40.cables.visible = !half; R40.half.visible = half;
    chipMatrices();
  }
  function localsMode(m) {
    S.locMode = m;
    for (const L of LOC) {
      const vis = m !== 'hidden'; L.rig.root.visible = vis;
      if (vis && !L.seat) { L.col[0] = L.x - 0.28; L.col[1] = L.z - 0.28; L.col[2] = L.x + 0.28; L.col[3] = L.z + 0.28; } else L.col[0] = L.col[1] = L.col[2] = L.col[3] = PARK;
    }
    if (m !== 'look') { S.locLook = false; S.locClap = false; S.locPulse = false; }
  }
  function lockDoors(K, on) {
    const R = K.R;
    S.lockOn = on; R40.doorLens.material = on ? X.lockR : X.lockG;
    if (on) { if (R.doorHold === null) { R.doorHold = false; if (skipping()) R.doorT = 0; } }
    else if (R.doorHold === false) R.doorHold = null;
  }
  function backroomDoor(K, wedged) {
    const R = K.R;
    S.wedged = wedged; R40.wedge.visible = wedged;
    // wedged back into the corridor (a swing door): open into the backroom it would hide the light switch and Chase
    // (2040) at s14_c40_switch from backroom_front. userData.open stays undefined so the shell never eases it.
    R.bdoor.userData.open = undefined; R.bdoor.rotation.y = wedged ? -1.5 : 0;
    if (S.doorway) { if (wedged) S.doorway[0] = S.doorway[1] = S.doorway[2] = S.doorway[3] = PARK; else { S.doorway[0] = 5.95; S.doorway[1] = -24; S.doorway[2] = 6.85; S.doorway[3] = -23.75; } }
    if (wedged) { S.leafCol[0] = 5.92; S.leafCol[1] = -23.87; S.leafCol[2] = 6.07; S.leafCol[3] = -22.9; } else S.leafCol[0] = S.leafCol[1] = S.leafCol[2] = S.leafCol[3] = PARK;
  }
  function resetState(K) {
    S.T = K.T; S.env = null; S.dress = null; S.zoneKey = '';
    S.glK = 0; S.glP = 0; S.glT = 0; S.addrMode = ''; S.caption = null;
    S.chimeT = -1; S.chimeNext = 6; S.chipClock = 1; S.ledClock = 1; S.palmClock = 1;
    S.trTh = 0.6; S.trY = 0.04; S.trSettle = false; S.trBob = 0;
    S.locMode = 'idle'; S.locLook = false; S.locPulse = false; S.locClap = false;
    S.mach = 'built'; S.flare = false; S.flareT = -1;
    S.desSt = 'des'; S.typed = ''; S.typeFull = ''; S.typeT = -1; S.typeDur = 1; S.cursorOn = true; S.cursorT = 0; S.dots = 0; S.dotT = 0; S.boilT = -1; S.boilK = 0; S.puffT = -1; S.desGlow = false; S.desDirty = true;
    S.lockOn = false; S.wedged = false;
    S.towerOn = true; S.alert = false; S.pingT = -1; S.pingNext = 1.5;
    S.skipX = S.skipTo = 12.8;
    S.ringOn = false; S.lightT = -1; S.lightNext = 4; S.lightI = 0; S.lightK = 0;
    S.kiosk = 'kiosk'; S.scr = 'ad';
    S.ex = Object.assign({}, EX.day);
    X.towerL.emissive.setHex(0xbfe6ff);
  }

  // ======================================================== dressing (idempotent, instant)
  // scr: big screen + every other screen · loc: locals · tr: trolley settled · lock: front doors · mach / flare (s, true = on)
  // des: Des's screen · scorch · smoke · wedge: backroom door wedged open · gate · ring: title drones · zones
  const DR = {
    store40:  { scr: 'ad', loc: 'idle', tr: 0, lock: 0, mach: 'built', flare: 0, des: 'des', scorch: 4, smoke: 0, wedge: 1, gate: 'ajar', ring: 0, zones: 'roam' },
    arrival:  { scr: 'ad', loc: 'idle', tr: 0, lock: 0, mach: 'built', flare: 2, des: 'boiling', scorch: 4, smoke: 1, wedge: 1, gate: 'ajar', ring: 0, zones: 'roam' },
    address:  { scr: 'address', loc: 'look', tr: 1, lock: 0, mach: 'built', flare: 0, des: 'des', scorch: 4, smoke: 0, wedge: 1, gate: 'ajar', ring: 0, zones: 'roam' },
    lockdown: { scr: 'safe', loc: 'frozen', tr: 1, lock: 1, mach: 'built', flare: 0, des: 'des', scorch: 4, smoke: 0, wedge: 1, gate: 'ajar', ring: 0, zones: 'stealth' },
    split13:  { scr: 'ad', loc: 'hidden', tr: 0, lock: 0, mach: 'built', flare: true, des: 'boil_q', scorch: 4, smoke: 0, wedge: 1, gate: 'ajar', ring: 0, zones: 'roam' },
    title:    { scr: 'off', loc: 'hidden', tr: 1, lock: 1, mach: 'built', flare: 0, des: 'off', scorch: 4, smoke: 0, wedge: 0, gate: 'shut', ring: 1, zones: 'roam' },
    b1_build: { scr: 'off', loc: 'hidden', tr: -1, lock: 1, mach: 'half', flare: 0, des: 'name', scorch: 3, smoke: 0, wedge: 0, gate: 'shut', ring: 0, zones: 'roam' },
  };
  const AUTO40 = { '1.3': 'split13', '1.4': 'arrival', '1.5': 'store40', '1.6': 'store40', B1: 'b1_build' };
  function dress40(st, K, o = {}) {
    if (!R40.screen) return;
    const R = K.R, key = DR[st] ? st : 'store40', d = DR[key];
    S.dress = key; R.dressState = key; S.caption = null;
    // screens
    screenShow(d.scr);
    for (const t of R40.terms) termShow(t, d.scr === 'ad' ? 'idle' : d.scr);
    kioskShow(d.scr === 'ad' ? 'kiosk' : d.scr); tvShow(K, d.scr === 'ad' ? 'off' : d.scr);
    S.glK = S.glP = 0;
    // locals, trolley, doors
    localsMode(d.loc); S.locClap = false;
    if (d.loc === 'look') { S.locLook = true; S.locPulse = true; }
    for (const L of LOC) { L.rig.chip('on'); if (L.chipM) L.chipM.emissiveIntensity = 1.5; }
    R40.trolley.visible = R40.trBlob.visible = d.tr >= 0; S.trSettle = d.tr === 1; S.trY = S.trSettle ? -0.23 : 0.04;
    if (d.tr < 0) S.trCol[0] = S.trCol[1] = S.trCol[2] = S.trCol[3] = PARK;
    lockDoors(K, !!d.lock);
    // the machine and Des
    machSet(d.mach);
    S.flare = !!d.flare; S.flareT = typeof d.flare === 'number' && d.flare > 0 ? d.flare : -1;
    S.typed = d.des === 'name' ? '' : S.typed; desScreen(d.des);
    S.desGlow = false;
    R.scorch.userData.count(o.scorch ?? d.scorch);
    K.smokeTo(R.smB, d.smoke);
    backroomDoor(K, !!d.wedge);
    R.gate.userData.set(d.gate); R.gateX = R.gateTo;
    S.towerOn = true; S.alert = false; X.towerL.emissive.setHex(0xbfe6ff); S.pingT = -1; R40.ping.visible = false;
    S.skipX = S.skipTo = 12.8;
    S.ringOn = !!d.ring; R40.ring.group.visible = S.ringOn;
    S.chipClock = 1; S.chipOn.fill(1);
    // zones: roam or stealth, swapped in place
    if (d.zones !== S.zoneKey) { S.zoneKey = d.zones; const src = d.zones === 'stealth' ? STEALTH : ROAM; ZONES40.length = 0; for (const z of src) ZONES40.push(z); }
  }

  // ======================================================== ambient life (no allocation)
  // per-env extras: floor chips, machine chips, LED string, palm lights, hover-car glows, yard lamps, bay glints, ring lights
  const EX = {
    day:      { chips: 0.8, mach: 0.8, led: 0.5, palm: 0.35, hover: 0.55, lamp: 0.1, glint: 0.6, ring: 1.6 },
    lockdown: { chips: 1.0, mach: 0.8, led: 0.4, palm: 0.35, hover: 0.55, lamp: 0.1, glint: 0.55, ring: 1.6 },
    dim:      { chips: 1.0, mach: 1.2, led: 0.7, palm: 0.7, hover: 0.9, lamp: 0.9, glint: 0.15, ring: 1.6 },
    dusk:     { chips: 0.9, mach: 1.0, led: 0.9, palm: 1.4, hover: 1.3, lamp: 1.2, glint: 0.25, ring: 1.6 },
  };
  function env40(K) {
    const R = K.R, e = S.env, E = EX[e] || EX.day;
    Object.assign(S.ex, E);
    const dusk = e === 'dusk';
    R.sun.visible = e === 'day' || e === 'lockdown' || !e;
    R.sky.visible = !dusk; R40.dome.visible = dusk; R40.clouds.visible = dusk;
    X.lamp.emissiveIntensity = E.lamp; X.glint.emissiveIntensity = E.glint;
    for (let i = 0; i < CARS.length; i++) R40.carG.setColorAt(i, sC.setScalar(E.hover));
    R40.carG.instanceColor.needsUpdate = true;
    sC.setHex(0x6fc8ff).multiplyScalar(E.ring);
    for (let i = 0; i < 32; i++) R40.ring.light.setColorAt(i, sC);
    if (R40.ring.light.instanceColor) R40.ring.light.instanceColor.needsUpdate = true;
    S.chipClock = S.ledClock = S.palmClock = 1;
    if (!dusk) { CLOUDM.color.setScalar(1); SKYM40.color.setScalar(1); S.lightT = -1; }
  }
  function carsTick(t, dt) {
    for (let i = 0; i < CARS.length; i++) {
      const c = CARS[i], v = c[4];
      let x = c[0], ry = c[2];
      if (v) { const d = (t * v + CAR_PH[i]) % 140; x = ry > 0 ? d - 70 : 70 - d; }
      const y = c[1] < -500 ? -1000 : 0.3 + 0.02 * Math.sin(t * 1.7 + i * 1.3);
      sE.set(0, ry, 0); sQ.setFromEuler(sE); sS.set(c[3] > 1.3 ? 1.14 : 1, c[3], c[3] > 1.3 ? 1.1 : 1);
      sM.compose(sV.set(x, y, c[1]), sQ, sS);
      R40.carB.setMatrixAt(i, sM); R40.carG.setMatrixAt(i, sM);
    }
    R40.carB.instanceMatrix.needsUpdate = R40.carG.instanceMatrix.needsUpdate = true;
  }
  function update40(dt, ctx, K) {
    if (!R40.screen) return;
    const R = K.R, t = ctx.t, rf = reduceFx(), E = S.ex;
    if (ctx.env !== S.env) { S.env = ctx.env; env40(K); }
    // the lock holds the doors shut (door_l.hold(true) still opens them for the drones)
    if (S.lockOn && R.doorHold === null) R.doorHold = false;
    // ---- chip lights: 0.6–1.0 at 0.5 Hz (8 Hz updates); the machine's flare; the battery LEDs
    if (S.flareT > 0) { S.flareT -= dt; if (S.flareT <= 0) { S.flareT = -1; S.flare = false; S.chipDirty = true; } }
    if (S.chipDirty) { S.chipDirty = false; chipMatrices(); }
    S.chipClock += dt;
    if (S.chipClock >= 0.125) {
      S.chipClock = 0;
      const p = 0.8 + 0.2 * Math.sin(t * PI), a = R40.chips.instanceColor.array, n = a.length / 3;
      for (let i = 0; i < n; i++) {
        const m = i >= 18, k = S.chipOn[i] * (m ? (S.flare ? 2.0 : E.mach * p) : E.chips * p);
        a[i * 3] = 0.75 * k; a[i * 3 + 1] = 0.9 * k; a[i * 3 + 2] = 1.0 * k;
      }
      R40.chips.instanceColor.needsUpdate = true;
      const b = R40.batt.instanceColor.array, ch = Math.floor(t * 8) % 5;
      for (let i = 0; i < 5; i++) {
        const on = S.flare ? (i === ch ? 1.6 : 0.25) : i < 4 ? 1 : 0.15;
        b[i * 3] = 0.35 * on; b[i * 3 + 1] = 0.88 * on; b[i * 3 + 2] = 0.54 * on;
      }
      R40.batt.instanceColor.needsUpdate = true;
      // the locals' chip lights pulse in sync (address)
      if (S.locPulse) for (let i = 0; i < LOC.length; i++) if (LOC[i].chipM) LOC[i].chipM.emissiveIntensity = 1.5 * (0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * PI)));
    }
    // ---- the LED string: a slow shimmer
    S.ledClock += dt;
    if (S.ledClock >= 0.125) {
      S.ledClock = 0;
      const a = R40.led.instanceColor.array, n = a.length / 3;
      for (let i = 0; i < n; i++) { const k = E.led * (rf ? 0.92 : 0.84 + 0.16 * Math.sin(t * 1.3 + i * 0.9)); a[i * 3] = 0.91 * k; a[i * 3 + 1] = 0.96 * k; a[i * 3 + 2] = 1.0 * k; }
      R40.led.instanceColor.needsUpdate = true;
    }
    // ---- palm lights: twinkle (4 Hz)
    S.palmClock += dt;
    if (S.palmClock >= 0.25) {
      S.palmClock = 0;
      const a = R40.palm.instanceColor.array, n = a.length / 3, q = Math.floor(t * 4);
      for (let i = 0; i < n; i++) {
        const tw = rf ? 0.85 : ((q + i * 7) % 11 === 0 ? 0.3 : 0.7 + 0.3 * Math.sin(t * 2.1 + S.palmPh[i])), k = E.palm * tw;
        a[i * 3] = S.palmCol[i * 3] * k; a[i * 3 + 1] = S.palmCol[i * 3 + 1] * k; a[i * 3 + 2] = S.palmCol[i * 3 + 2] * k;
      }
      R40.palm.instanceColor.needsUpdate = true;
    }
    // ---- the big screen: the ad's gradient drifts; glance(k) repaints the head at <= 15 Hz while k changes
    if (S.scr === 'ad') K.T.adBg.offset.x = (t * 0.04) % 1;
    S.glT += dt;
    if (S.addrMode === 'address' && S.glK !== S.glP && S.glT >= 1 / 15) { S.glT = 0; addrPaint('address'); }
    // ---- the kiosk: a soft blue ring off the screen (auto every 12 s while the floor is roamable)
    if ((S.dress === 'store40' || S.dress === 'arrival') && S.kiosk === 'kiosk' && typeof player !== 'undefined' && player.enabled) {
      S.chimeNext -= dt; if (S.chimeNext <= 0) { S.chimeNext = 12; R40.kiosk.userData.chime(); }
    }
    if (S.chimeT >= 0) {
      S.chimeT += dt; const u = S.chimeT / 0.6;
      R40.chime.scale.setScalar(1 + 1.4 * u); CHIMEM.opacity = 0.75 * (1 - u) * (rf ? 0.6 : 1);
      if (u >= 1) { S.chimeT = -1; R40.chime.visible = false; CHIMEM.opacity = 0; }
    }
    // ---- the hover-trolley: drifts its ellipse at 0.12 m/s facing travel; bobs; settles
    {
      const th = S.trTh, dx = -1.3 * Math.sin(th), dz = 0.9 * Math.cos(th), sp = Math.hypot(dx, dz) || 1;
      if (!S.trSettle && R40.trolley.visible) S.trTh += 0.12 * dt / sp;
      const yT = S.trSettle ? -0.23 : 0.04 + 0.02 * Math.sin(t * 1.9);
      S.trY += (yT - S.trY) * Math.min(1, dt * (S.trSettle ? 2.2 : 4));
      const x = 8.6 + 1.3 * Math.cos(S.trTh), z = -3.4 + 0.9 * Math.sin(S.trTh);
      R40.trolley.position.set(x, S.trY, z); R40.trolley.rotation.y = Math.atan2(dx, dz);
      R40.trBlob.position.set(x, 0.012, z); R40.trBlob.rotation.y = R40.trolley.rotation.y;
      S.trAt[0] = x; S.trAt[2] = z;
      if (R40.trolley.visible) { S.trCol[0] = x - 0.42; S.trCol[1] = z - 0.42; S.trCol[2] = x + 0.42; S.trCol[3] = z + 0.42; }
    }
    // ---- the locals: staring (a tiny sway); lookUp turns them to the big screen; applaud = a slow polite clap
    if (S.locMode !== 'hidden') for (let i = 0; i < LOC.length; i++) {
      const L = LOC[i], r = L.rig.root;
      const anim = S.locLook ? (S.locClap && !L.seat ? 'clap' : 'look_up') : L.seat ? 'idle' : 'still';
      if (anim !== L.anim) { L.anim = anim; L.at = 0; }
      if (S.locMode !== 'frozen') L.at += dt;
      const yT = S.locLook ? L.lookYaw : L.ry;
      L.yaw += wrapA(yT - L.yaw) * Math.min(1, dt * 2.5);
      r.rotation.y = L.yaw + (S.locMode === 'frozen' ? 0 : 0.025 * Math.sin(t * 0.4 + i * 1.7));
      L.rig.pose(anim, anim === 'clap' ? L.at * 0.45 : L.at, L.seat ? SITP : NOP);
      L.rig.update(dt);
    }
    // ---- Des: typing, the cursor, the boil dots and its puff, the ring light
    if (S.typeT >= 0) {
      S.typeT += dt; const n = Math.min(S.typeFull.length, Math.floor(S.typeT / S.typeDur * S.typeFull.length + 0.0001));
      if (n !== S.typed.length) { S.typed = S.typeFull.slice(0, n); S.desDirty = true; }
      if (S.typeT >= S.typeDur) S.typeT = -1;
    }
    if (S.desSt === 'name') { S.cursorT += dt; if (S.cursorT >= 0.5) { S.cursorT = 0; S.cursorOn = !S.cursorOn; S.desDirty = true; } }
    if (S.desSt === 'boiling') {
      S.dotT += dt; if (S.dotT >= 0.33) { S.dotT = 0; S.dots = (S.dots + 1) % 4; S.desDirty = true; }
      if (S.boilT >= 0) {
        S.boilT += dt; S.boilK = Math.min(1, S.boilT / 2.2);
        if (S.puffT >= 0) { S.puffT -= dt; if (S.puffT <= 0) { S.puffT = 0.7; if (typeof world !== 'undefined' && world.puff) world.puff(PUFF_AT, PUFF_O); } }
        if (S.boilT >= 2.6) { S.puffT = -1; desScreen('des'); }
      }
    }
    if (S.desDirty) { S.desDirty = false; paintDes(K.T.des.image.getContext('2d')); K.T.des.needsUpdate = true; }
    const dg = S.flare || S.desGlow || S.desSt === 'boiling';
    X.des.emissiveIntensity += ((dg ? 1.5 : 1.0) - X.des.emissiveIntensity) * Math.min(1, dt * 6);
    X.desRing.emissiveIntensity = (dg ? 1.8 : S.desSt === 'off' ? 0.15 : 0.8) * (dg && !rf ? 0.85 + 0.15 * Math.sin(t * 6) : 1);
    // ---- the drone tower: the scanner turns; pings every 3 s while on; amber when alerted
    R40.scan.rotation.y += dt * 0.8;
    if (S.towerOn) { S.pingNext -= dt; if (S.pingNext <= 0) { S.pingNext = 3.0; S.pingT = 0; } }
    if (S.pingT >= 0) {
      S.pingT += dt; const u = S.pingT / 2.4;
      R40.ping.visible = true; R40.ping.scale.setScalar(0.05 + 14 * u); PINGM.opacity = 0.6 * (1 - u);
      PINGM.color.setHex(S.alert ? 0xffb020 : 0xbfe6ff);
      if (u >= 1) { S.pingT = -1; R40.ping.visible = false; }
    }
    X.towerL.emissiveIntensity = 1.1 + 0.4 * Math.sin(t * (S.alert ? 9 : 2.2));
    // ---- the skip bin
    if (S.skipX !== S.skipTo) { S.skipX += (S.skipTo - S.skipX) * Math.min(1, dt * 3); if (Math.abs(S.skipTo - S.skipX) < 0.002) S.skipX = S.skipTo; }
    R40.skip.position.x = S.skipX; R40.skip.userData.x = S.skipX; S.skipCol[0] = S.skipX - 1.0; S.skipCol[2] = S.skipX + 1.0;
    // ---- hover-cars glide, parked ones bob
    carsTick(t, dt);
    // ---- the title's drone ring: circles at 0.035 rad/s, bobs, faces the store
    if (S.ringOn) {
      const rg = R40.ring;
      for (let i = 0; i < 32; i++) {
        const a = i / 32 * TAU + t * 0.035, x = 1 + Math.sin(a) * 30, z = -14 + Math.cos(a) * 30;
        rg.set(i, x, 5.5 + 0.15 * Math.sin(t * 1.1 + S.ringPh[i]), z, Math.atan2(1 - x, -14 - z), 1.25);
      }
      rg.commit();
    }
    // ---- dusk: lightning on the storm clouds (every 6–14 s); Reduce Flashing: one soft 0.8 s bloom at 0.3
    if (S.env === 'dusk') {
      S.lightNext -= dt;
      if (S.lightNext <= 0 && S.lightT < 0) { S.lightT = 0; S.lightNext = LIGHTNING[S.lightI = (S.lightI + 1) % LIGHTNING.length]; }
      if (S.lightT >= 0) {
        const lt = (S.lightT += dt);
        let k;
        if (rf) { k = 0.3 * Math.sin(Math.min(1, lt / 0.8) * PI); if (lt >= 0.8) S.lightT = -1; }
        else {
          k = lt < 0.03 ? lt / 0.03 : lt < 0.15 ? 1 - (lt - 0.03) / 0.12 : lt < 0.22 ? 0 : lt < 0.32 ? 0.6 * Math.sin((lt - 0.22) / 0.1 * PI) : 0;
          if (lt >= 0.32) S.lightT = -1;
        }
        if (lt <= dt && typeof emit === 'function') emit('reddy40:lightning');
        CLOUDM.color.setScalar(1 + 2.4 * k); SKYM40.color.setScalar(1 + 0.35 * k);
      }
    }
    // ---- the pelican glider, the bay's glints
    { const a = t * 0.24, gx = Math.cos(a) * 25, gz = -90 + Math.sin(a) * 25;
      R40.glider.position.set(gx, 14 + 0.6 * Math.sin(a * 2), gz); R40.glider.rotation.set(0, Math.atan2(-Math.sin(a), Math.cos(a)), 0.32, 'YXZ'); }
    K.T.glint.offset.set((t * 0.004) % 1, (t * 0.0025) % 1);
  }

  // ======================================================== data
  const MARKS = {
    // 1.4
    s14_pile_chase: [6.2, 0, -27.2, 0.4], s14_pile_luka: [6.7, 0, -26.8, -2.1], s14_pile_c40: [6.4, 0, -27.5, 1.2],
    s14_c40_point: [6.0, 0, -25.7, PI], s14_luka_look: [7.3, 0, -26.4, -2.6], s14_chase_look: [6.8, 0, -27.6, 2.2],
    s14_chase_machine: [5.0, 0, -25.7, -0.35], s14_c40_switch: [5.7, 0, -24.55, 0], s14_luka_kettle: [4.9, 0, -25.3, -0.4],
    s14_start_chase: [6.4, 0, -25.6, 0], s14_c40_wait: [8.4, 0, -7.6, -2.6], s14_jordan: [6.4, 0, -10.0, 0],
    s14_meet_chase: [6.2, 0, -7.75, PI], s14_meet_luka: [5.2, 0, -7.1, PI], s14_c40_between: [5.75, 0, -7.5, 2.8],
    s14_aside_jordan: [9.75, 0, -11.6, -2.3], s14_aside_c40: [9.2, 0, -11.0, 0.8],
    s14_chips_chase: [5.3, 0, -7.95, PI], s14_chips_luka: [4.6, 0, -7.95, PI],
    // 1.5
    s15_c40_terminal: [6.4, 0, -10.0, 0], s15_chase_side: [5.6, 0, -10.2, 0.4], s15_chase_terminal: [6.4, 0, -10.0, 0],
    s15_c40_aside: [7.3, 0, -10.35, -0.4], s15_luka: [5.0, 0, -7.5, -0.6], s15_jayden_door: [-2.0, 0, -1.2, PI],
    s15_jayden_counter: [6.4, 0, -7.85, PI], s15_jordan_pass_a: [9.9, 0, -11.9, 0], s15_jordan_pass_b: [9.0, 0, -6.2, 0.3],
    s15_jordan_watch: [9.85, 0, -12.25, -2.5],
    // 1.6
    // (clear of display table 2 and the counter stool at (3.45, -7.95): 1.6's own blocking, A16)
    s16_addr_luka: [1.6, 0, -6.55, -2.65], s16_addr_chase: [2.25, 0, -6.2, -2.7], s16_addr_c40: [2.85, 0, -6.95, -2.6],
    s16_addr_jordan: [3.8, 0, -7.3, -2.6], s16_jordan_close: [3.35, 0, -7.35, -0.64],
    d_in_a: [-2.6, 1.8, 5.0, PI], d_in_b: [-2.0, 1.9, 5.6, PI], d_in_c: [-1.4, 1.8, 5.0, PI], d_in_mid: [-2.0, 1.8, -2.5, PI],
    s16_cp_floor: [1.6, 0, -8.6, -2.8], s16_cp_alcove: [1.95, 0, -13.1, H], s16_cp_backroom: [6.4, 0, -25.2, PI], s16_cp_yard: [7.75, 0, -31.4, PI],
    s16_zap_luka: [2.2, 0, -10.9, H], s16_zap_chase_from: [2.9, 0, -10.5, H], s16_zap_chase_to: [3.3, 0, -11.45, 2.2],
    s16_speaker: [7.85, 0, -8.05, PI],   // beside the stool at (7.25, -7.95), facing the counter speaker s16_wait_luka: [1.95, 0, -13.1, H], s16_wait_c40: [1.6, 0, -13.6, H],
    s16_roller_luka: [7.75, 0, -29.55, PI], s16_roller_under_1: [7.2, 0, -30.9, PI], s16_roller_under_2: [8.3, 0, -30.9, PI],
    s16_roller_luka_out: [7.75, 0, -31.4, PI], s16_chip_prompt: [7.0, 0, -31.6, PI],
    s16_bonk_from: [7.4, 0, -31.6, 2.47], s16_bonk_at: [8.0, 0, -32.35, 2.47], s16_gate: [12.8, 0, -45.6, PI],
    post_c2: [9.8, 1.6, -10.95, -H], lure_1: [7.15, 1.7, -10.0, 0], lure_2: [7.95, 1.7, -10.05, 0], lure_3: [7.55, 2.0, -10.6, 0],
    // B1, hotspot stands, the locals
    b1_c40_wire: [4.25, 0, -25.15, 0], des_stand: [4.25, 0, -25.05, 0],
    local40_a: [-6.3, 0, -6.4, -H], local40_b: [-3.4, 0, -9.4, -H], local40_c: [2.65, 0, -0.85, PI], local40_d: [9.6, 0, -5.0, H],
  };
  const SH_ANCH = SETS.reddy26.anchors;
  const ANCHORS = {
    terminal: SH_ANCH.monitor, terminal_screen: SH_ANCH.monitor_screen, wall40_all: SH_ANCH.wall_all,
    des_screen:     { at: [4.25, 1.075, -24.47], from: [4.25, 1.085, -24.78], fov: 22 },
    des:            { at: [4.25, 1.08, -24.4], from: [4.45, 1.25, -25.05], fov: 30 },
    machine40:      { at: [4.25, 0.85, -24.35], from: [5.9, 1.55, -26.2], fov: 42 },
    b1_machine:     { at: [4.25, 1.0, -24.4], from: [5.7, 1.5, -26.2], fov: 44 },
    scorch_tilt:    { at: [6.3, 2.8, -26.6], from: [6.9, 1.1, -24.6], fov: 55 },
    scorch_1: [5.3, 2.79, -26.2], scorch_2: [7.6, 2.79, -27.3], scorch_3: [5.2, 2.79, -27.7], scorch_4: [7.7, 2.79, -25.6],
    plant40:        { at: [9.3, 0.8, -29.55], from: [8.3, 1.3, -28.6], fov: 38 },
    backroom_front: { at: [5.2, 1.3, -24.2], from: [8.9, 1.9, -29.3], fov: 55 },
    big_screen:     { at: [-2.0, 1.85, -14.35], from: [-2.0, 1.75, -10.4], fov: 32 },
    chip_display:   { at: [-2.0, 1.08, -13.95], from: [-2.0, 1.45, -12.4], fov: 36 },
    price_tag:      { at: [0.4, 0.95, -4.95], from: [0.9, 1.35, -4.15], fov: 30 },
    margaret_plaque:{ at: [2.0, 0.80, -0.64], from: [2.0, 1.02, -1.25], fov: 28 },
    wall_wreath:    { at: [5.42, 1.55, -20.95], from: [6.3, 1.6, -20.95], fov: 34 },
    office40_sign:  { at: [9.9, 1.55, -12.59], from: [9.9, 1.58, -11.85], fov: 32 },
    tree_floor:     { at: [8.45, 0.25, -1.0], from: [7.2, 1.3, -2.4], fov: 42 },
    trolley_home:   { at: [8.6, 0.6, -3.4], from: [7.0, 1.4, -1.6], fov: 40 },
    kiosk:          { at: [5.6, 1.23, -5.2], from: [5.6, 1.45, -4.4], fov: 32 },
    speaker:        { at: [7.55, 1.1, -8.78], from: [7.4, 1.45, -8.05], fov: 32 },
    doors_lock:     { at: [-2.0, 1.4, -0.2], from: [3.4, 2.2, -7.2], fov: 50 },
    s16_pan:        { at: [-6.3, 1.4, -6.4], from: [6.8, 1.75, -3.2], fov: 46 },
    s16_pan_end:    { at: [2.65, 1.05, -0.9], from: [6.8, 1.75, -3.2], fov: 46 },
    s16_floor_wide: { at: [1.0, 1.0, -8.0], from: [10.5, 2.5, -0.6], fov: 56 },
    roller:         { at: [7.75, 1.0, -30.0], from: [6.6, 1.6, -27.6], fov: 46 },
    roller_out:     { at: [7.75, 0.6, -30.25], from: [9.6, 1.3, -33.2], fov: 44 },
    tower:          { at: [0.5, 6.8, -39.5], from: [5.8, 1.6, -33.0], fov: 40 },
    pole_bonk:      { at: [8.2, 1.6, -32.6], from: [6.2, 1.5, -33.6], fov: 40 },
    gate:           { at: [11.5, 1.2, -46.0], from: [10.5, 1.8, -41.5], fov: 45 },
    title_center:   { at: [1.0, 2.5, -14.0], from: [1.0, 16.0, 30.0], fov: 38 },
    title_front:    { at: [-2.0, 3.5, 0.0], from: [6.0, 4.5, 24.0], fov: 40 },
  };
  const CAMS = {
    st_floor:    { type: 'fixed', pos: [10.7, 2.6, -0.4], look: [1.0, 0.0, -8.8], fov: 60 },
    st_back:     { type: 'fixed', pos: [-8.6, 3.0, -9.0], look: [0.5, 0.0, -12.4], fov: 55 },
    st_staff:    { type: 'fixed', pos: [10.85, 3.0, -9.6], look: [3.2, 0.0, -11.4], fov: 52 },
    st_corridor: { type: 'fixed', pos: [6.4, 2.55, -12.95], look: [6.4, 0.0, -22.0], fov: 44 },
    cp_dock:     { type: 'fixed', pos: [2.6, 4.6, -30.7], look: [10.5, 0.0, -35.5], fov: 55 },
    cp_lot:      { type: 'fixed', pos: [17.5, 4.8, -30.8], look: [5.0, 0.0, -41.5], fov: 55 },
    cp_gate:     { type: 'fixed', pos: [12.0, 3.4, -50.0], look: [9.5, 0.3, -40.5], fov: 50 },
  };
  // zone tables: roam = reddy26's (§8.1); stealth (§8.2) tiles the floor, staff aisle, corridor, office, backroom and yard
  const ROAM = SETS.reddy26.zones.map((z) => ({ box: z.box.slice(), cam: z.cam }));
  const STEALTH = [
    { box: [2.6, -12.5, 11, -9.45], cam: 'st_staff' },
    { box: [5.4, -12.75, 7.4, -12.5], cam: 'st_staff' },
    { box: [5.4, -23.75, 7.4, -12.75], cam: 'st_corridor' },
    { box: [7.4, -17, 11, -12.5], cam: 'office' },
    { box: [2.4, -26.2, 5.2, -23.75], cam: 'backroom_rev' },
    { box: [2.4, -30, 10.4, -23.75], cam: 'backroom' },
    { box: [6.6, -30.25, 8.9, -30.0], cam: 'cp_dock' },
    { box: [6.0, -46.0, 17.0, -41.5], cam: 'cp_gate' },
    { box: [-6.0, -35.0, 20.0, -30.25], cam: 'cp_dock' },
    { box: [-6.0, -46.0, 20.0, -35.0], cam: 'cp_lot' },
    { box: [-9, -14.5, 2.6, -9.45], cam: 'st_back' },
    { box: [-9, -9.45, 11, 0], cam: 'st_floor' },
  ];
  const ZONES40 = ROAM.slice();
  // drones (§8.3: content spawns them with DRONES.spawn(id, SETS.reddy40.drones[id])), their paths, the lure
  const DRONES40 = {
    drone_a: { at: [3.6, 1.7, -10.45], face: H, path: [[3.6, -10.45], [10.2, -10.45]], hover: 1.7, speed: 0.9, cone: { len: 2.6, half: 0.45 } },
    drone_b: { at: [10.2, 1.7, -11.75], face: -H, path: [[10.2, -11.75], [3.6, -11.75]], hover: 1.7, speed: 0.9, cone: { len: 2.6, half: 0.45 } },
    drone_c: { at: [6.4, 1.6, -15.2], face: PI, hover: 1.6, cone: { len: 2.8, half: 0.42 } },
    drone_d: { at: [1.5, 1.8, -37.0], face: H, path: [[1.5, -37.0], [18.0, -37.0]], hover: 1.8, speed: 1.0, cone: { len: 2.8, half: 0.5 } },
    drone_e: { at: [15.5, 1.8, -43.6], face: -H, path: [[7.0, -43.6], [15.5, -43.6]], hover: 1.8, speed: 0.8, cone: { len: 2.6, half: 0.45 } },
  };
  const PATHS40 = { drone_a: DRONES40.drone_a.path, drone_b: DRONES40.drone_b.path, drone_c: [[6.4, -15.2], [6.4, -18.0]], drone_d: DRONES40.drone_d.path, drone_e: DRONES40.drone_e.path };
  const LURE40 = { at: [7.55, 1.1, -8.78], r: 7, dur: 9, points: { lure_1: [7.15, 1.7, -10.0], lure_2: [7.95, 1.7, -10.05], lure_3: [7.55, 2.0, -10.6] }, post_c2: [9.8, 1.6, -10.95] };
  const AR40 = [
    { id: 'ar_chip_1', kind: 'price', text: 'NEURAL CHIP 9 · $49/mth', at: [-3.35, 1.06, -13.72] },
    { id: 'ar_chip_2', kind: 'price', text: 'CHIP 9 MINI · $39/mth', at: [-2.45, 1.06, -13.72] },
    { id: 'ar_chip_3', kind: 'price', text: 'CHIP 8 REFURB · $19/mth', at: [-1.55, 1.06, -13.72] },
    { id: 'ar_chip_4', kind: 'price', text: 'CLOUD+ READY · $14.99/mth', at: [-0.65, 1.06, -13.72] },
    { id: 'ar_table_1', kind: 'price', text: 'CHIP COSY $29', at: [-4.4, 1.05, -4.95] },
    { id: 'ar_table_2', kind: 'price', text: 'EAR PILLOW $12', at: [0.4, 1.05, -4.95] },
    { id: 'ar_table_3', kind: 'price', text: 'SAFETY BUNDLE $0*', at: [-4.4, 1.05, -8.95] },
    { id: 'ar_table_4', kind: 'price', text: 'ARE YOU SURE? COVER $9', at: [0.4, 1.05, -8.95] },
    { id: 'ar_accessories', kind: 'sign', text: 'SAFETY ACCESSORIES', at: [-8.8, 2.7, -7.8] },
    { id: 'ar_welcome', kind: 'sign', text: 'WELCOME TO OPTUS REDCLIFFE', at: [-2.0, 2.85, -0.3] },
  ];
  const AR16 = [
    { id: 'ar_doors_locked', kind: 'sign', text: 'DOORS LOCKED FOR YOUR SAFETY', at: [-2.0, 2.3, -0.25] },
    { id: 'ar_path_a', kind: 'path', points: [[3.6, 0.02, -10.45], [10.2, 0.02, -10.45]] },
    { id: 'ar_path_b', kind: 'path', points: [[10.2, 0.02, -11.75], [3.6, 0.02, -11.75]] },
    { id: 'ar_path_c', kind: 'path', points: [[6.4, 0.02, -15.2], [6.4, 0.02, -18.0]] },
    { id: 'ar_path_d', kind: 'path', points: [[1.5, 0.02, -37.0], [18.0, 0.02, -37.0]] },
    { id: 'ar_path_e', kind: 'path', points: [[7.0, 0.02, -43.6], [15.5, 0.02, -43.6]] },
    { id: 'ar_tower', kind: 'sign', text: 'SIGNAL CHECK · STAY SAFE', at: [0.5, 8.1, -39.5] },
    { id: 'ar_gate', kind: 'sign', text: 'REDCLIFFE PARADE', at: [11.5, 2.5, -46.0] },
  ];

  const EXT40 = {
    paint: (T) => paint40(T),
    build: (K) => build40(K),
    dress: (st, K, o) => dress40(st, K, o),
    update: (dt, ctx, K) => update40(dt, ctx, K),
    autoDress: AUTO40,
    interior: {
      day:      { panel: 0.95, row: 0.95, ceil: 1.0, sign: 0.25, bay: 0x3d8fc4 },
      lockdown: { panel: 0.45, row: 0.45, ceil: 0.55, sign: 0.25, bay: 0x3d8fc4 },
      dim:      { panel: 0.1, row: 0.1, ceil: 0.15, sign: 0.6, bay: 0x24406a },
      dusk:     { panel: 0.3, row: 0.3, ceil: 0.35, sign: 1.0, bay: 0x2a4a7a },
    },
    env: {
      day:      { bg: 0x9ad6ff, fog: [0xe6e4d6, 0.012], hemi: [0xeef6ff, 0xa89a80, 1.1], dir: [0xf6f8ff, 1.6, [3, 14, 4]], rain: 0 },
      lockdown: { bg: 0x9ad6ff, fog: [0xb8c4d8, 0.016], hemi: [0xd8e6ff, 0x606a80, 0.75], dir: [0xe6eeff, 1.0, [3, 14, 4]], rain: 0 },
      dim:      { bg: 0x2a3448, fog: [0x2a3040, 0.03], hemi: [0x9fb0d0, 0x2a2e38, 0.55], dir: [0xb0c4ff, 0.35, [3, 14, 4]], rain: 0 },
      dusk:     { bg: 0x2b3f73, fog: [0x5a5a7a, 0.010], hemi: [0xffc9a0, 0x30304a, 0.7], dir: [0xff9a60, 0.9, [-4, 3, 14]], rain: 0 },
    },
    marks: MARKS, anchors: ANCHORS, cams: CAMS, zones: ZONES40,
    props: ['big_screen', 'screens_all', 'terminal_l', 'terminal_r', 'chip_kiosk', 'chips_wall', 'chips_tables', 'chips_showcase', 'chip_lights', 'hover_trolley',
      'led_string', 'front_doors', 'locals', 'local40_a', 'local40_b', 'local40_c', 'local40_d', 'counter_speaker', 'jordan_office_door', 'xmas_tree_floor',
      'machine', 'battery_leds', 'des', 'wall_phone40', 'door_wedge', 'drone_tower', 'skip_bin', 'hover_cars', 'hover_parked_yard', 'palm_lights', 'drone_ring',
      'pelican_glider', 'storm_clouds', 'sky_dome', 'bay_glints'],
    ambience: { loops: ['aircon'], room: 'room' },   // (no fluoro tube buzz)
  };
  const def = SETS.reddy26.make('2040', EXT40);
  Object.assign(def, { ar: AR40, ar16: AR16, drones: DRONES40, paths: PATHS40, lure: LURE40, roam: ROAM, stealth: STEALTH });
  return def;
})();
