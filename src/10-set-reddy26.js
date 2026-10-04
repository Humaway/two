// ============================================================ SET: reddy26 — Optus Redcliffe, Christmas 2026 (+ the shared shell)
// Rue's store (Rue's SETS.reddy) for TWO: Christmas dressing, the Hero Table (intact / blast / wreck / new / wrapped), the
// Wall, the scorch marks + DO NOT PAINT — L., Luke's door (ESPECIALLY YOU TWO), the roller door, the rear yard, the Parade
// and the bay. Spec: docs/sets/reddy26.md — every name and coordinate there is the contract.
//
// LAYOUT (metres, Y up; ry 0 faces +Z, π faces −Z, +π/2 faces +X). Compass (sun/sky only): +Z west = front (car park
// z 3..23.4, road z 27..35, houses z 45), −Z east = rear (yard to the fence z −46, Parade road z −48.5..−55, foreshore
// z −55..−60, railing z −60, the bay beyond), +X south. Building strip x −26..26, z −30.25..0, roof y 5.0.
//   shopfront glass z 0 (doors x −3.1..−0.9, leaves at −2.55/−1.45) · store floor x −9..11, z −14.5..0, ceiling 3.2
//   display wall z −14.5, x −5.3..1.3 · display tables (±) · accessories wall x −9 · queue machine (0.8, −1.9)
//   counter x 3.15..7.85, z −9.45..−8.55 (glass showcase x 4.75..6.45, open on the staff side; till x 6.85..7.3;
//   phone (7.55, −9.2) + radio (7.55, −8.78)) · Hero Table centre (5.6, −5.3) 1.6 × 0.9 · tree (9.25, −1.0) + plant
//   (10.3, −0.85) · waiting chairs x 2.0/2.65/3.3, z −0.85 · staff aisle x 2.6..11, z −12.5..−9.45 (Yes wall x
//   2.75..5.35, ladder (4.05, −11.75), targets + floor clock x 8.4, office door hinge (9.4, −12.62)) · office
//   x 7.65..11, z −12.75..−17 · corridor x 5.4..7.4, z −23.75..−12.75, ceiling 2.7 (the Wall on its left face
//   x 5.415, z −19.4..−22) · backroom x 2.4..10.4, z −30..−24, ceiling 2.8 (door hinge (5.95, −23.87); wall phone +
//   junction box x 4.3; roller door x 6.6..8.9 in the back wall; bench + laptop + clock x 2.9..5.9; kitchenette x 9.75)
//   · scorch P1 (5.3, −26.2) P2 (7.6, −27.3) P3 (5.2, −27.7) P4 (7.7, −25.6) · DO NOT PAINT (5.95, −26.45).
// Walkable in 2026: floor, staff aisle, corridor, office, backroom. The shopfront line and the shut roller door are
// colliders; the automatic doors open for every actor except the roaming player (Rue's JARVIS-door rule).
//
// ENV: day (default, white sun) · evening (golden, closed) · night (dark floor; the spot is free for `table_downlight`).
// AMBIENCE: loops aircon + fluoro, room 'room'. Diegetic music (radio, hold, alarm) is content's.
// DRESS: SETS.reddy26.dress(state, opts) — xmas · spotless · wrecked (opts.pc) · home · home_night · days_later ·
//   tinsel_down · wall_print · xmas27; opts { pc, ladder, smoke, alarms, officeDoor, scorch, radio, tinsel }.
//   Auto on scene change: 1.1 xmas · 1.2 spotless · 1.3 wrecked · PC wrecked{pc} · A1/B1 home · A2 days_later.
// MARKS (§6): Rue's generic marks + s11_*, s12_*, s13_*, pc_*, a1_*, b1_*, a2_*, b27_* (data block at the end).
// ANCHORS (§7): Rue's kept anchors + s11_crane_a..d, s11_mid_glass, hero_glass/top/phones, the Wall (wall_*), the
//   backroom (rue_mug, ceiling_scorch, do_not_paint, laptop, jbox, wall_phone, door_window, split_a/b, home_door),
//   1.2 (s12_*), floor_locked, floor_wreck_wide, counter_phone, a1_split_store, b1_night_floor, a2_*, table_downlight.
// CAMS (§9): staff, corridor, office, backroom (Rue's Act One frame), backroom_rev, entrance, counter, aisle,
//   accessories, shopfront, carpark. ZONES tile the walkable interior (first match wins).
// PROPS (userData API; every call is instant while skipping and allocation-free):
//   hero_table set('smudged'|'spotless'|'wrecked'|'new_wrapped'|'new'|'gone', {smudge1}) glint() handprint(on)
//     smudge1(on) smudge1At(x, z, scale = 1 | null) blast({instant, tree = true}) · hero_smudge · hero_smudge1 ·
//     hero_handprint · hero_phone_1..4 · hero_wreck
//   hero_tethers swing(amp) alarm(on) · tether_loose · alarm_beacon on(b) · glass_shards (instanced 80) · blast_flash
//   hero_wrap · plastic_heap · tinsel_yes set('hidden'|'half'|'hung'|'fallen') · tinsel_floor · tinsel_coil
//   tinsel_sign · tinsel_static · tinsel_strand · fairy_lights power(k) (instanced 160) · snow_spray
//   xmas_tree set('up'|'fallen'|'gone') fall() · aframe_sign · door_l hold(true|false|null) · door_r · door_sign
//     set(open) flip() · store_radio playing · store_phone ring(on, {sfx, every, vol, max}) · cash_tray · monitor_screen show(mode)
//   ladder set('yes_wall'|'folded'|'carried'|'hidden') wobble() ('carried' after actor.hold(ladder): along his right side) · clock_floor_hands · clock_hands set(h, m)
//   calendar set(day, month, weekday, year) · office_door open · swivel_chair spin · cust26_a/b (ambient rigs)
//   the_wall · print4 · backroom_door open request() bang() solid(on) · tube off flicker(n) · scorch count(n) · do_not_paint
//   kettle · rue_mug · tv_screen show('xmas'|'off') · laptop · wall_phone ring(on) · wall_phone_handset · jbox_lid open
//   remote_plugged · roller_door set(gap) slam() gap · door_light_leak · smoke_floor / smoke_backroom amount(k, dur)
//   yard_gate set('shut'|'ajar'|'open') · pelicans (instanced) · traffic · roof · sun · sky_horizon · shimmer
// SHELL: SETS.reddy26.make(era, ext) builds the shared shell (reddy40 = make('2040', EXT40)); see makeReddy below.
// Draw calls: static ≈ 35 meshes (one per material), props mostly 1–2 meshes; ≤ 115 from any cam or anchor (setshots).
// Set inspection (?setview=reddy26 only): TWO_TEST.dress(state, opts), TWO_TEST.call(prop, fn, ...args),
// TWO_TEST.shot(step), TWO_TEST.advance(sec) (freezes the clock and steps the world by hand), TWO_TEST.resume().
// Deviations from the spec: the ladder's "top" marks stand on its third tread (z −11.7, not −11.95); DO NOT PAINT
// sits at y 2.775 under the ceiling grid and reads from the door side; s12_midair looks from the staff side so the
// display is behind Luka; the blast leaves the radio playing (the music is content's; `wrecked` turns it off).
SETS.reddy26 = (() => {
  const PI = Math.PI, H = PI / 2, TAU = PI * 2, DS = THREE.DoubleSide;
  const NAVY = 0x141d3a, YEL = 0xffd21f, WHITE = 0xf2f3f4, WOOD = 0xc8a476, CARD = 0xb98d5a, DARK = 0x1d1f24;
  const TSIL = 0xd9dde3, TRED = 0xd6262e, TINSEL = [TSIL, 0xffffff, TRED, TSIL, 0xb9c0c8, TRED];
  const FAIRY_COLS = [0xff3a30, 0x3ae060, 0xffd21f, 0x3a86ff, 0xfff0c0];
  const skipping = () => typeof flow !== 'undefined' && !!flow.skipping;
  const reduceFx = () => typeof options !== 'undefined' && !!options.reduceFlashing;
  const smooth = (u) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));

  // ---------------------------------------------------------- painters (pure: no set state; shared by both eras)
  const FONT = (px, w = 'bold') => `${w} ${px}px Arial, "Liberation Sans", "DejaVu Sans", sans-serif`;
  function text(c, s, x, y, px, col, al = 'center', w = 'bold', maxW) {
    c.font = FONT(px, w); c.fillStyle = col; c.textAlign = al; c.textBaseline = 'middle'; c.fillText(s, x, y, maxW);
  }
  const yes = (c, x, y, h, col) => canvasTex.yes(c, x, y, h, col);
  let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  function santaHat(c, x, y, s, tilt = 0.4) {   // a tiny Santa hat: brim centre (x, y), size s
    c.save(); c.translate(x, y); c.rotate(tilt);
    c.fillStyle = '#d32f2f'; c.beginPath(); c.moveTo(-s, 0); c.quadraticCurveTo(-s * 0.2, -s * 1.9, s * 1.1, -s * 1.1); c.lineTo(s, 0); c.fill();
    c.fillStyle = '#ffffff'; c.fillRect(-s * 1.15, -s * 0.12, s * 2.3, s * 0.42);
    c.beginPath(); c.arc(s * 1.15, -s * 1.05, s * 0.32, 0, TAU); c.fill(); c.restore();
  }
  function skull(c, x, y, s, hat) {
    c.fillStyle = '#fff'; c.strokeStyle = '#111'; c.lineWidth = 1.5;
    c.beginPath(); c.arc(x, y, s, 0, TAU); c.fill(); c.stroke();
    c.fillRect(x - s * 0.55, y + s * 0.6, s * 1.1, s * 0.7); c.strokeRect(x - s * 0.55, y + s * 0.6, s * 1.1, s * 0.7);
    c.fillStyle = '#111'; c.beginPath(); c.arc(x - s * 0.38, y, s * 0.28, 0, TAU); c.arc(x + s * 0.38, y, s * 0.28, 0, TAU); c.fill();
    if (hat) santaHat(c, x + s * 0.1, y - s * 0.7, s * 0.95, 0.35);
  }
  function jwin(c, x, y, w, h, title = 'JARVIS', hat) {   // a JARVIS window: white panel, grey title bar (hat: an icon in a Santa hat)
    c.fillStyle = '#fff'; c.fillRect(x, y, w, h);
    c.fillStyle = '#d9dce1'; c.fillRect(x, y, w, 16);
    let tx = x + 6;
    if (hat) { c.fillStyle = '#2f6fd6'; c.fillRect(x + 4, y + 3, 10, 10); santaHat(c, x + 9, y + 4, 4.2, 0.3); tx = x + 18; }
    text(c, title, tx, y + 8, 10, '#2f6fd6', 'left');
    c.strokeStyle = '#8a909a'; c.lineWidth = 1; c.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  }
  function btn(c, x, y, w, h, s, px = 11) { c.fillStyle = '#2f6fd6'; c.fillRect(x, y, w, h); text(c, s, x + w / 2, y + h / 2 + 1, px, '#fff'); }
  function paintMonitor(c, w, h, mode) {   // 256 × 160: the JARVIS counter monitors
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.fillStyle = '#000'; c.fillRect(0, 0, w, h);
    if (mode === 'off') { c.fillStyle = 'rgba(255,255,255,0.05)'; c.beginPath(); c.moveTo(14, 10); c.lineTo(90, 10); c.lineTo(30, 90); c.lineTo(14, 90); c.fill(); return; }
    if (mode === 'crash') {
      c.fillStyle = '#0c1733'; c.fillRect(0, 0, w, h);
      text(c, 'JARVIS has stopped responding.', w / 2, 30, 14, '#cfd8ea');
      c.fillStyle = '#2f6fd6'; c.fillRect(40, 48, w - 80, 2);
      text(c, 'JARVIS © 1987–2026', w / 2, 82, 22, '#ffffff');
      return;
    }
    const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#3d7de0'); g.addColorStop(1, '#1d4fa8');
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    if (mode === 'xmas') {   // "JARVIS wishes you a Merry Christmas! Are you sure? [YES] [YES]"
      c.fillStyle = 'rgba(255,255,255,0.55)';
      seed = 61; for (let i = 0; i < 40; i++) { const x = rnd() * w, y = rnd() * h; c.fillRect(x, y, 2, 2); }
      jwin(c, 16, 16, w - 32, h - 32, 'JARVIS', true);
      text(c, 'JARVIS wishes you a', w / 2, 50, 14, '#1b2233');
      text(c, 'Merry Christmas!', w / 2, 69, 16, '#c62828');
      text(c, 'Are you sure?', w / 2, 93, 13, '#1b2233', 'center', 'normal');
      btn(c, 62, 108, 54, 22, 'YES', 12); btn(c, 140, 108, 54, 22, 'YES', 12);
      return;
    }
    jwin(c, 10, 10, w - 20, h - 20);
    if (mode === 'loading' || mode === 'ready') {
      c.strokeStyle = mode === 'ready' ? '#2e9d4a' : '#2f6fd6'; c.lineWidth = 7; c.lineCap = 'round';
      c.beginPath();
      if (mode === 'ready') { c.moveTo(106, 66); c.lineTo(122, 82); c.lineTo(152, 50); } else c.arc(w / 2, 64, 20, 0.3, PI * 1.7);
      c.stroke();
      text(c, mode === 'ready' ? 'JARVIS is ready!' : 'JARVIS is starting…', w / 2, 108, 15, '#1b2233');
    } else {   // 'app': the sale form
      c.fillStyle = '#eef1f6'; c.fillRect(11, 26, 56, h - 37);
      for (let i = 0; i < 5; i++) { c.fillStyle = i === 1 ? '#2f6fd6' : '#c9d0dc'; c.fillRect(17, 36 + i * 20, 44, 10); }
      ['Customer', 'Verify ID', 'Plan', 'Service', 'Opt in?'].forEach((s, i) => {
        text(c, s, 78, 38 + i * 21, 10, '#1b2233', 'left');
        c.strokeStyle = '#9aa3b2'; c.strokeRect(140.5, 31.5 + i * 21, 92, 14);
      });
      c.fillStyle = '#2f6fd6'; c.fillRect(186, 136, 46, 12); text(c, 'NEXT', 209, 142, 9, '#fff');
    }
  }
  function paintTV(c, w, h, mode) {   // 256 × 192: the backroom TV. Rue never appears on a screen.
    c.setTransform(1, 0, 0, 1, 0, 0);
    if (mode !== 'xmas') {
      c.fillStyle = '#1e2622'; c.fillRect(0, 0, w, h);
      c.fillStyle = 'rgba(255,255,255,0.07)'; c.beginPath(); c.moveTo(20, 16); c.lineTo(120, 16); c.lineTo(40, 120); c.lineTo(20, 120); c.fill();
      return;
    }
    const g = c.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, 170); g.addColorStop(0, '#c8262f'); g.addColorStop(1, '#7a1018');
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    seed = 13; c.strokeStyle = 'rgba(255,255,255,0.75)'; c.lineWidth = 1.5;
    for (let i = 0; i < 26; i++) {
      const x = rnd() * w, y = rnd() * h, r = 2 + rnd() * 4;
      for (let k = 0; k < 3; k++) { const a = k * PI / 3; c.beginPath(); c.moveTo(x - Math.cos(a) * r, y - Math.sin(a) * r); c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); c.stroke(); }
    }
    c.font = FONT(24); c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 4; c.strokeStyle = '#5a0c10';
    c.strokeText('MERRY CHRISTMAS', w / 2, 30); c.fillStyle = '#f2c84a'; c.fillText('MERRY CHRISTMAS', w / 2, 30);
    jwin(c, 30, 60, w - 60, 108, 'JARVIS');
    text(c, "Rue's Christmas Message", w / 2, 98, 15, '#1b2233');
    text(c, 'Video could not be played.', w / 2, 124, 13, '#1b2233', 'center', 'normal');
    btn(c, w / 2 - 24, 140, 48, 20, 'OK', 12);
  }
  const DAYS = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  function paintCal(c, w, h, day, mon, wd, year = 2026) {   // 128 × 160 desk-pad calendar
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.fillStyle = '#fbfbf8'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#d32f2f'; c.fillRect(0, 0, w, 42);
    text(c, mon, w / 2, 17, 20, '#fff', 'center', 'bold', w - 8); text(c, String(year), w / 2, 35, 12, '#ffd9d9');
    c.fillStyle = '#333'; for (let x = 14; x < w; x += 14) c.fillRect(x, 2, 4, 6);
    text(c, String(day), w / 2, 96, 72, '#1b1b1b');
    text(c, wd, w / 2, 144, 14, '#666');
  }
  function paintLaptop(c, w, h) {   // 256 × 160: Chase's folder of unfinished songs
    c.fillStyle = '#1c2a44'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#f4f6f9'; c.fillRect(6, 6, w - 12, h - 12);
    c.fillStyle = '#2a2f3a'; c.fillRect(6, 6, w - 12, 22);
    text(c, 'UNFINISHED — 213 items', 14, 18, 13, '#ffffff', 'left');
    for (const [x, col] of [[w - 40, '#e05a4e'], [w - 28, '#e8b84a'], [w - 16, '#5ac06a']]) { c.fillStyle = col; c.beginPath(); c.arc(x, 17, 4, 0, TAU); c.fill(); }
    const rows = ['track two (dont open)', 'kettle thing v3', 'bridge idea (no bridge)', 'untitled 211', 'pudding 2??', 'untitled 209'];
    rows.forEach((s, i) => {
      const y = 32 + i * 20;
      c.fillStyle = i === 0 ? '#2f6fd6' : i % 2 ? '#eceff4' : '#f8f9fb'; c.fillRect(8, y, w - 16, 20);
      c.fillStyle = i === 0 ? '#ffffff' : '#8a93a3'; c.fillRect(14, y + 5, 9, 11); c.fillStyle = i === 0 ? '#2f6fd6' : '#f8f9fb'; c.fillRect(19, y + 5, 4, 4);
      text(c, s, 30, y + 11, 12, i === 0 ? '#ffffff' : '#1b2233', 'left', i === 0 ? 'bold' : 'normal', 190);
    });
  }
  function paintMissing(c, x0, y0) {   // 128 × 192: Rue's MISSING poster, verbatim
    const w = 128, h = 192;
    c.save(); c.translate(x0, y0); c.beginPath(); c.rect(0, 0, w, h); c.clip();
    c.fillStyle = '#fff'; c.fillRect(0, 0, w, h);
    text(c, 'MISSING', w / 2, 20, 24, '#c62828');
    const face = (x, polo, hair, beard) => {
      c.fillStyle = '#dfe6ec'; c.fillRect(x, 38, 50, 58);
      c.fillStyle = polo; c.fillRect(x + 6, 80, 38, 16);
      c.fillStyle = '#e3b48f'; c.beginPath(); c.ellipse(x + 25, 62, 11, 14, 0, 0, TAU); c.fill();
      c.fillStyle = hair; c.beginPath(); c.ellipse(x + 25, 51, 12, 6, 0, PI, TAU); c.fill();
      if (beard) { c.beginPath(); c.ellipse(x + 25, 70, 10, 8, 0, 0, PI); c.fill(); c.fillRect(x + 12, 46, 3, 30); }
      c.fillStyle = '#ffd21f'; c.fillRect(x + 12, 84, 6, 3);
      c.fillStyle = '#222'; c.fillRect(x + 20, 60, 2, 2); c.fillRect(x + 28, 60, 2, 2);
    };
    face(9, '#15161a', '#4a2e1c', true); face(69, '#1f6fe0', '#6b4a2e', false);
    text(c, 'LUKA', 34, 104, 10, '#222'); text(c, 'CHASE', 94, 104, 10, '#222');
    ['Last seen 29/09.', 'Answers to Luka', 'and Chase.', 'Chase may ask', 'about his lanyard.'].forEach((s, i) => text(c, s, w / 2, 124 + i * 12, 10, '#333', 'center', 'normal'));
    c.fillStyle = '#141d3a'; c.fillRect(0, h - 10, w, 10);
    c.restore();
  }

  // atlas regions: [x, y, w, h, canvasW, canvasH] in canvas pixels (top-left origin)
  const RG = {
    polaroid: [0, 0, 64, 80, 256, 256], label: [64, 0, 64, 32, 256, 256], note: [64, 32, 64, 40, 256, 256],
    missing: [128, 0, 128, 192, 256, 256], flyer: [0, 80, 64, 96, 256, 256], dnp: [64, 72, 64, 48, 256, 256],
    mug: [64, 120, 64, 32, 256, 256], print4: [0, 184, 96, 72, 256, 256],
    poster: [0, 0, 128, 96, 256, 128], tent: [128, 0, 128, 40, 256, 128], fragile: [128, 40, 64, 32, 256, 128],
    lcdFM: [192, 40, 64, 16, 256, 128], lcdAUX: [192, 56, 64, 16, 256, 128], lcdOff: [192, 72, 64, 16, 256, 128],
    smudge: [0, 0, 128, 64, 128, 128], smudge1: [0, 64, 32, 32, 128, 128], hand: [32, 64, 32, 32, 128, 128],
  };
  function flake(c, x, y, r, sy = 0.55) {   // a stencilled six-armed snowflake (sy squashes it for a stretched tile)
    c.save(); c.translate(x, y); c.scale(1, sy); c.lineWidth = Math.max(1.5, r / 5);
    for (let k = 0; k < 6; k++) {
      c.rotate(PI / 3); c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -r);
      c.moveTo(0, -r * 0.55); c.lineTo(-r * 0.28, -r * 0.8); c.moveTo(0, -r * 0.55); c.lineTo(r * 0.28, -r * 0.8); c.stroke();
    }
    c.restore();
  }
  // the shell's textures: 2026 painted; reddy40 replaces era-specific ones in ext.paint(T, K). Shared keys ('reddy_*')
  // are identical in both eras; screens repainted at runtime (mon, tv, cal) get era-private keys.
  function shellTextures(KP) {
    const T = {};
    const K = (k, o) => ({ key: 'reddy_' + k, nearest: true, ...o });
    T.fascia = canvasTex(256, 64, (c, w, h) => {
      c.fillStyle = '#141d3a'; c.fillRect(0, 0, w, h); c.fillStyle = '#ffd21f'; c.fillRect(0, h - 4, w, 4);
      yes(c, 22, 8, 46, '#ffd21f'); text(c, 'optus', 176, 32, 40, '#fff');
    }, K('fascia'));
    T.yes = canvasTex(256, 192, (c, w, h) => {
      c.fillStyle = '#141d3a'; c.fillRect(0, 0, w, h); c.strokeStyle = '#ffd21f'; c.lineWidth = 4; c.strokeRect(8, 8, w - 16, h - 16);
      yes(c, 26, 22, 128, '#ffd21f');
    }, K('yes'));
    T.closed = canvasTex(128, 64, (c, w, h) => {
      c.fillStyle = '#c62828'; c.fillRect(0, 0, w, h); c.strokeStyle = '#fff'; c.lineWidth = 3; c.strokeRect(4, 4, w - 8, h - 8);
      text(c, 'CLOSED', w / 2, 28, 26, '#fff'); text(c, 'sorry!', w / 2, 50, 11, '#ffe0e0', 'center', 'normal');
    }, K('closed'));
    T.open = canvasTex(128, 64, (c, w, h) => {
      c.fillStyle = '#ffd21f'; c.fillRect(0, 0, w, h); c.strokeStyle = '#141d3a'; c.lineWidth = 3; c.strokeRect(4, 4, w - 8, h - 8);
      text(c, 'OPEN', w / 2, 28, 30, '#141d3a'); text(c, 'come in', w / 2, 50, 11, '#141d3a', 'center', 'normal');
    }, K('open'));
    T.queue = canvasTex(128, 128, (c, w, h) => {
      c.fillStyle = '#e9ebee'; c.fillRect(0, 0, w, h); c.fillStyle = '#111'; c.fillRect(14, 12, 100, 42);
      c.font = 'bold 34px "DejaVu Sans Mono", "Courier New", monospace'; c.fillStyle = '#ff3b30'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('000', 64, 34);
      text(c, 'NOW SERVING', 64, 64, 11, '#141d3a'); text(c, 'TAKE A NUMBER', 64, 84, 12, '#141d3a');
      c.fillStyle = '#ffd21f'; c.fillRect(24, 98, 80, 8); c.fillStyle = '#222'; c.fillRect(40, 112, 48, 5);
    }, K('queue'));
    T.targets = canvasTex(256, 192, (c, w, h) => {
      c.fillStyle = '#f7f7f4'; c.fillRect(0, 0, w, h); c.strokeStyle = '#9a9a9a'; c.lineWidth = 3; c.strokeRect(2, 2, w - 4, h - 4);
      text(c, 'CHRISTMAS TARGETS', w / 2, 22, 17, '#c62828');
      const rows = [['Postpaid', 0.62, '#2f6fd6'], ['NBN', 0.4, '#2e9d4a'], ['Recontracts', 0.12, '#d32f2f'], ['Accessories', 0.81, '#f28c1e'], ['Insurance', 0.3, '#7b3fb0']];
      rows.forEach(([s, p, col], i) => {
        const y = 52 + i * 27;
        text(c, s, 12, y, 12, '#222', 'left');
        c.fillStyle = '#dcdcdc'; c.fillRect(120, y - 7, 122, 14); c.fillStyle = col; c.fillRect(120, y - 7, 122 * p, 14);
        text(c, Math.round(p * 100) + '%', 246, y, 10, '#444', 'right', 'normal');
      });
      skull(c, 107, 106, 6, true);
      c.save(); c.rotate(-0.05); text(c, "C'mon team!", 186, 190, 13, '#1f3a93', 'center', 'italic bold'); c.restore();
    }, K('targets'));
    T.notice = canvasTex(256, 192, (c, w, h) => {
      c.fillStyle = '#b98a54'; c.fillRect(0, 0, w, h);
      seed = 11; for (let i = 0; i < 400; i++) { c.fillStyle = rnd() > 0.5 ? '#a8794a' : '#c89a66'; c.fillRect(rnd() * w, rnd() * h, 2, 2); }
      c.strokeStyle = '#6b4a2a'; c.lineWidth = 6; c.strokeRect(3, 3, w - 6, h - 6);
      const paper = (x, y, pw, ph, col, rot, lines, pin = '#d32f2f') => {
        c.save(); c.translate(x + pw / 2, y + ph / 2); c.rotate(rot);
        c.fillStyle = col; c.fillRect(-pw / 2, -ph / 2, pw, ph);
        lines.forEach(([s, px, cc, wt], i) => text(c, s, 0, -ph / 2 + 14 + i * (px + 5), px, cc || '#222', 'center', wt || 'bold'));
        c.fillStyle = pin; c.beginPath(); c.arc(0, -ph / 2 + 4, 3, 0, TAU); c.fill(); c.restore();
      };
      // LANYARD REQUESTS: same paper, position, pin and rotation in 2040 (reddy40 yellows it)
      paper(12, 12, 112, 84, '#fff2a8', -0.04, [['LANYARD', 12], ['REQUESTS', 12], ['please allow', 10, '#444'], ['6–8 weeks', 14, '#141d3a']]);
      paper(134, 14, 108, 92, '#ffffff', 0.03, [['XMAS ROSTER', 11, '#c62828'], ['Tue  L  C  J', 9, '#555'], ['Wed  L  C  J', 9, '#555'], ['Thu  L  C  J', 9, '#555'], ['Sat  L  C  J', 9, '#555']], '#2f6fd6');
      paper(16, 106, 96, 72, '#ffc8dc', 0.05, [['PLEASE WASH', 10], ['YOUR MUGS', 10], ['(Chase)', 9, '#a0305a']], '#2e9d4a');
      paper(128, 114, 96, 64, '#cfe6ff', -0.06, [['BOXING DAY', 11], ['7AM — ???', 13, '#1f3a93']]);
    }, K('notice'));
    T.office = canvasTex(256, 320, (c, w, h) => {   // Luke's door: four lines, the last in thin blue biro
      c.fillStyle = '#fff'; c.fillRect(0, 0, w, h); c.strokeStyle = '#141d3a'; c.lineWidth = 4; c.strokeRect(5, 5, w - 10, h - 10);
      text(c, 'LUKE', w / 2, 50, 50, '#141d3a'); text(c, '— MANAGER —', w / 2, 96, 22, '#141d3a');
      c.save(); c.translate(w / 2, 152); c.rotate(-0.06); text(c, 'KNOCK', 0, 0, 46, '#1f3a93', 'center', 'italic bold'); c.restore();
      c.save(); c.translate(w / 2 + 10, 208); c.rotate(0.05); text(c, 'PLEASE', 0, 0, 32, '#c62828', 'center', 'italic bold'); c.restore();
      c.save(); c.translate(w / 2 - 2, 262); c.rotate(-0.07); text(c, 'ESPECIALLY YOU TWO', 0, 0, 20, '#2a3f9a', 'center', 'italic', w - 24); c.restore();
      c.strokeStyle = 'rgba(42,63,154,0.6)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(48, 284); c.lineTo(200, 274); c.stroke();   // underlined, twice
      c.beginPath(); c.moveTo(56, 289); c.lineTo(196, 280); c.stroke();
    }, K('office'));
    T.slat = canvasTex(128, 128, (c, w, h) => {
      c.fillStyle = '#eceef0'; c.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 16) { c.fillStyle = '#b7bcc2'; c.fillRect(0, y + 12, w, 3); c.fillStyle = '#fafbfc'; c.fillRect(0, y, w, 2); }
    }, K('slat', { repeat: [8, 2] }));
    T.shutter = canvasTex(128, 128, (c, w, h) => {   // the roller door: grey steel slats
      c.fillStyle = '#a9aeb3'; c.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 8) { c.fillStyle = '#7d8388'; c.fillRect(0, y + 6, w, 2); c.fillStyle = '#c6cacd'; c.fillRect(0, y, w, 1); }
      seed = 9; for (let i = 0; i < 60; i++) { c.fillStyle = 'rgba(90,70,50,0.25)'; c.fillRect(rnd() * w, rnd() * h, 2, 1); }
    }, K('shutter'));
    T.sim = canvasTex(128, 256, (c, w, h) => {
      c.fillStyle = '#f5f6f7'; c.fillRect(0, 0, w, h); c.fillStyle = '#141d3a'; c.fillRect(0, 0, w, 26); text(c, 'SIM STARTER PACKS', w / 2, 13, 11, '#ffd21f');
      for (let r = 0; r < 6; r++) for (let k = 0; k < 3; k++) {
        const x = 8 + k * 40, y = 34 + r * 36;
        c.fillStyle = r % 2 ? '#ffd21f' : '#fff'; c.fillRect(x, y, 32, 30); c.strokeStyle = '#999'; c.strokeRect(x + 0.5, y + 0.5, 31, 29);
        text(c, 'SIM', x + 16, y + 11, 10, '#141d3a'); text(c, '$2', x + 16, y + 23, 9, '#c62828');
      }
    }, K('sim'));
    T.mon = canvasTex(256, 160, (c, w, h) => paintMonitor(c, w, h, 'xmas'), { key: KP + 'mon', nearest: true });
    T.tv = canvasTex(256, 192, (c, w, h) => paintTV(c, w, h, 'xmas'), { key: KP + 'tv', nearest: true });
    T.cal = canvasTex(128, 160, (c, w, h) => paintCal(c, w, h, 22, 'DECEMBER', 'TUESDAY', 2026), { key: KP + 'cal', nearest: true });
    T.clock = canvasTex(128, 128, (c, w, h) => {
      c.clearRect(0, 0, w, h);
      c.fillStyle = '#fff'; c.beginPath(); c.arc(64, 64, 60, 0, TAU); c.fill(); c.lineWidth = 6; c.strokeStyle = '#222'; c.stroke();
      for (let i = 0; i < 12; i++) { c.save(); c.translate(64, 64); c.rotate(i * PI / 6); c.fillStyle = '#222'; c.fillRect(-1.5, -54, 3, i % 3 ? 7 : 11); c.restore(); }
      text(c, '12', 64, 24, 14, '#222'); text(c, '3', 106, 64, 14, '#222'); text(c, '6', 64, 104, 14, '#222'); text(c, '9', 22, 64, 14, '#222');
    }, K('clock'));
    T.floor = canvasTex(128, 128, (c, w, h) => {
      c.fillStyle = '#e1e3e6'; c.fillRect(0, 0, w, h);
      seed = 5; for (let i = 0; i < 160; i++) { c.fillStyle = rnd() > 0.5 ? '#d3d6da' : '#eceef0'; c.fillRect(rnd() * w, rnd() * h, 2, 2); }
      c.fillStyle = '#c3c7cc'; c.fillRect(0, 0, w, 2); c.fillRect(0, 0, 2, h);
    }, K('floor', { repeat: [32, 24] }));
    T.asphalt = canvasTex(128, 128, (c, w, h) => {
      c.fillStyle = '#77787a'; c.fillRect(0, 0, w, h);
      seed = 3; for (let i = 0; i < 900; i++) { const v = rnd(); c.fillStyle = v > 0.66 ? '#8d8e90' : v > 0.33 ? '#67686b' : '#7f7f80'; c.fillRect(rnd() * w, rnd() * h, 2, 2); }
      c.fillStyle = 'rgba(40,40,42,0.25)'; c.beginPath(); c.moveTo(0, 90); c.lineTo(50, 80); c.lineTo(128, 96); c.lineTo(128, 99); c.lineTo(50, 83); c.lineTo(0, 93); c.fill();
    }, K('asphalt', { repeat: [20, 6] }));
    T.phone = canvasTex(64, 128, (c, w, h) => {   // the Hero Table phones: "3%. They come out of the box tired."
      c.fillStyle = '#05070a'; c.fillRect(0, 0, w, h);
      c.strokeStyle = '#fff'; c.lineWidth = 3; c.strokeRect(16, 42, 28, 16); c.fillStyle = '#fff'; c.fillRect(44, 46, 4, 8);
      c.fillStyle = '#ff3b30'; c.fillRect(19, 45, 3, 10);
      text(c, '3%', 32, 82, 20, '#ff5a4f');
    }, K('phone'));
    T.atlas = canvasTex(256, 256, (c, w) => {
      const rows = [['STAFF ONLY', '#141d3a', '#fff'], ['LOST PROPERTY', '#c49a62', '#1b1b1b'], ['THE LATEST', '#141d3a', '#fff'],
        ['BAKERY', '#f3e3c3', '#7a3e16'], ['PHARMACY', '#2e8b57', '#fff'], ['FOR LEASE', '#fafafa', '#c62828'],
        ['NOW SERVING  000', '#0a0a0a', '#ff3b30'], ['CUSTOMER PARKING', '#1f4fa3', '#fff']];
      rows.forEach(([s, bg, fg], i) => {
        c.fillStyle = bg; c.fillRect(0, i * 32, w, 32);
        text(c, s, w / 2, i * 32 + 17, 20, fg, 'center', 'bold', w - 12);
        if (i === 2) { c.fillStyle = '#ffd21f'; c.fillRect(70, i * 32 + 28, 116, 2); }
      });
    }, K('atlas'));
    T.lineup = canvasTex(256, 128, (c, w, h) => {
      c.fillStyle = '#eef0f3'; c.fillRect(0, 0, w, h);
      for (let y = 8, n = 20; y < h; y += 12, n--) { c.fillStyle = n % 5 ? '#d4d8de' : '#aeb4bd'; c.fillRect(0, y, w, n % 5 ? 1 : 2); if (!(n % 5)) text(c, (n / 10).toFixed(1), 10, y - 5, 8, '#8a919c'); }
    }, K('lineup'));
    T.posters = canvasTex(256, 192, (c) => {
      c.fillStyle = '#141d3a'; c.fillRect(0, 0, 128, 192);
      text(c, '5G', 64, 58, 64, '#ffd21f'); text(c, 'Say yes to', 64, 116, 13, '#fff', 'center', 'normal'); text(c, 'more data.', 64, 132, 13, '#fff', 'center', 'normal');
      yes(c, 40, 150, 26, '#ffd21f');
      c.fillStyle = '#ffd21f'; c.fillRect(128, 0, 128, 192);
      ['NEW', 'PHONES', 'IN STORE'].forEach((s, i) => text(c, s, 192, 30 + i * 24, 20, '#141d3a'));
      c.fillStyle = '#141d3a'; c.fillRect(170, 104, 44, 78); c.fillStyle = '#5a8fe8'; c.fillRect(174, 110, 36, 64);
    }, K('posters'));
    T.keypad = canvasTex(64, 96, (c, w, h) => {
      c.fillStyle = '#e3e5e8'; c.fillRect(0, 0, w, h); c.fillStyle = '#9fd18a'; c.fillRect(8, 6, 48, 18); text(c, 'ARMED', 32, 15, 10, '#1d3a12');
      const k = '123456789*0#';
      for (let i = 0; i < 12; i++) { const x = 8 + (i % 3) * 17, y = 30 + Math.floor(i / 3) * 16; c.fillStyle = '#3a3f46'; c.fillRect(x, y, 14, 13); text(c, k[i], x + 7, y + 7, 9, '#fff'); }
    }, K('keypad'));
    T.spin = canvasTex(64, 64, (c, w, h) => {
      c.fillStyle = '#10151f'; c.fillRect(0, 0, w, h);
      c.strokeStyle = '#2f6fd6'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.arc(32, 32, 18, 0.2, PI * 1.6); c.stroke();
    }, K('spin'));
    T.shim = canvasTex(128, 64, (c, w, h) => {
      c.clearRect(0, 0, w, h);
      seed = 29;   // mirage: broken dashes of reflected sky, fading out upward
      for (let y = 0; y < h; y += 2) for (let x = -8; x < w; x += 6 + rnd() * 10) {
        const k = y / h; c.fillStyle = `rgba(${rnd() > 0.5 ? '225,238,255' : '180,210,250'},${(k * k * 0.9 * rnd()).toFixed(3)})`;
        c.fillRect(x + Math.sin(y * 0.7) * 3, y, 6 + rnd() * 12, 2);
      }
    }, { key: 'reddy_shim', repeat: [10, 1] });
    T.scorch = canvasTex(128, 128, (c, w, h) => {
      const g = c.createRadialGradient(64, 64, 4, 64, 64, 62); g.addColorStop(0, 'rgba(10,8,6,0.95)'); g.addColorStop(0.5, 'rgba(25,20,15,0.7)'); g.addColorStop(1, 'rgba(40,30,20,0)');
      c.fillStyle = g; c.fillRect(0, 0, w, h);
      c.strokeStyle = 'rgba(15,12,10,0.8)'; c.lineWidth = 3; seed = 23;
      for (let i = 0; i < 14; i++) { const a = rnd() * TAU, r = 30 + rnd() * 28; c.beginPath(); c.moveTo(64, 64); c.lineTo(64 + Math.cos(a) * r, 64 + Math.sin(a) * r); c.stroke(); }
    }, K('scorch'));
    // the Wall (and the backroom's paper): one 256 × 256 atlas, regions in RG
    T.wall = canvasTex(256, 256, (c) => {
      c.fillStyle = '#e8e4da'; c.fillRect(0, 0, 256, 256);
      // Polaroid 64×80: Rue's gate arch, two blurry polos and young Rue — out of focus, never resolving
      c.fillStyle = '#f6f4ee'; c.fillRect(0, 0, 64, 80);
      c.save(); c.beginPath(); c.rect(4, 4, 56, 58); c.clip();
      const sky = c.createLinearGradient(0, 4, 0, 62); sky.addColorStop(0, '#9fc4d8'); sky.addColorStop(1, '#e2c99a'); c.fillStyle = sky; c.fillRect(4, 4, 56, 58);
      c.filter = 'blur(1.6px)';
      c.strokeStyle = '#7a5a3a'; c.lineWidth = 4; c.beginPath(); c.arc(32, 40, 22, PI, TAU); c.stroke(); c.fillStyle = '#7a5a3a'; c.fillRect(8, 38, 4, 26); c.fillRect(52, 38, 4, 26);
      c.fillStyle = '#b8a27a'; c.fillRect(4, 52, 56, 12);
      for (const [x, polo, hh] of [[18, '#2a2f44', 25], [32, '#d0a070', 19], [45, '#2f63b0', 24]]) {
        c.fillStyle = polo; c.fillRect(x - 5, 64 - hh, 10, hh - 6);
        c.fillStyle = '#dcae8a'; c.beginPath(); c.arc(x, 64 - hh - 3, 4, 0, TAU); c.fill();
      }
      c.filter = 'none'; c.fillStyle = 'rgba(255,240,200,0.18)'; c.fillRect(4, 4, 56, 58);
      c.restore();
      text(c, '1987', 32, 71, 8, '#4a4a6a', 'center', 'italic');
      // cassette label 64×32: PUDDING
      c.fillStyle = '#2a2a2e'; c.fillRect(64, 0, 64, 32);
      c.fillStyle = '#f4f1e8'; c.fillRect(68, 3, 56, 18); text(c, 'PUDDING', 96, 12, 11, '#1f3a93', 'center', 'italic bold');
      c.fillStyle = '#111'; c.fillRect(80, 22, 32, 8); c.fillStyle = '#d8d8d8'; c.beginPath(); c.arc(86, 26, 3, 0, TAU); c.arc(106, 26, 3, 0, TAU); c.fill();
      // note 64×40: "Sorry for the wait. — R."
      c.fillStyle = '#fbf6e2'; c.fillRect(64, 32, 64, 40);
      c.save(); c.translate(96, 52); c.rotate(-0.04);
      text(c, 'Sorry for', 0, -11, 11, '#1e2a5a', 'center', 'italic bold'); text(c, 'the wait.', 0, 1, 11, '#1e2a5a', 'center', 'italic bold'); text(c, '— R.', 6, 13, 10, '#1e2a5a', 'center', 'italic');
      c.restore();
      // MISSING 128×192 (Rue's poster, verbatim)
      paintMissing(c, 128, 0);
      // HOLD MUSIC flyer 64×96
      c.fillStyle = '#fdfdf6'; c.fillRect(0, 80, 64, 96);
      text(c, 'HOLD', 32, 92, 13, '#111'); text(c, 'MUSIC', 32, 106, 13, '#111');
      text(c, 'NOW FEATURING', 32, 119, 7, '#333');
      text(c, 'PUDDING', 32, 133, 12, '#c62828', 'center', 'italic bold');
      c.strokeStyle = '#222'; c.lineWidth = 1.5; c.strokeRect(16, 142, 32, 20); c.beginPath(); c.arc(25, 152, 3.5, 0, TAU); c.moveTo(42.5, 152); c.arc(39, 152, 3.5, 0, TAU); c.stroke();
      text(c, '— R.', 50, 170, 9, '#1e2a5a', 'center', 'italic');
      // DO NOT PAINT — L. 64×48 (laminated A4 on the ceiling)
      c.fillStyle = '#ffffff'; c.fillRect(64, 72, 64, 48);
      text(c, 'DO NOT', 96, 85, 14, '#111'); text(c, 'PAINT', 96, 101, 15, '#c62828'); text(c, '— L.', 108, 114, 9, '#111', 'center', 'italic bold');
      c.fillStyle = 'rgba(255,255,255,0.35)'; c.beginPath(); c.moveTo(66, 118); c.lineTo(90, 74); c.lineTo(98, 74); c.lineTo(74, 118); c.fill();
      c.fillStyle = 'rgba(210,200,160,0.75)'; for (const [x, y] of [[64, 72], [118, 72], [64, 114], [118, 114]]) c.fillRect(x, y, 10, 6);
      // Rue mug wrap 64×32: I'M ON MUGS — R. (text only, no face)
      c.fillStyle = '#ffffff'; c.fillRect(64, 120, 64, 32);
      text(c, "I'M ON", 96, 130, 10, '#141d3a'); text(c, 'MUGS', 96, 142, 11, '#141d3a'); text(c, '— R.', 118, 147, 6, '#555', 'center', 'italic');
      // print4 96×72: four men on a rooftop at golden hour inside a ring of yellow dots (the older two faint)
      c.save(); c.beginPath(); c.rect(0, 184, 96, 72); c.clip();
      const gh = c.createLinearGradient(0, 184, 0, 256); gh.addColorStop(0, '#f4a85c'); gh.addColorStop(0.6, '#e8806a'); gh.addColorStop(1, '#6a4a6a'); c.fillStyle = gh; c.fillRect(0, 184, 96, 72);
      c.fillStyle = '#4a3a4a'; c.fillRect(0, 236, 96, 20);
      for (let i = 0; i < 26; i++) { const a = i / 26 * TAU; c.fillStyle = '#ffd21f'; c.beginPath(); c.arc(48 + Math.cos(a) * 42, 222 + Math.sin(a) * 18, 1.6, 0, TAU); c.fill(); }
      const man = (x, h, col, alpha) => { c.globalAlpha = alpha; c.fillStyle = col; c.fillRect(x - 4, 238 - h, 8, h - 6); c.fillStyle = '#e0b090'; c.beginPath(); c.arc(x, 238 - h - 3, 3.4, 0, TAU); c.fill(); c.globalAlpha = 1; };
      man(30, 24, '#3a3a3e', 0.35); man(39, 23, '#a8865a', 0.35); man(55, 22, '#15161a', 1); man(64, 21, '#1f6fe0', 1);
      c.restore();
      c.strokeStyle = '#ffffff'; c.lineWidth = 3; c.strokeRect(1.5, 185.5, 93, 69);
    }, K('wall'));
    // Christmas atlas (256 × 128): A-frame poster, display-wall tent card, FRAGILE sticker, radio LCDs
    T.xmas = canvasTex(256, 128, (c) => {
      c.fillStyle = '#141d3a'; c.fillRect(0, 0, 128, 96);
      text(c, 'XMAS DEALS', 64, 16, 17, '#ffd21f');
      yes(c, 30, 26, 30, '#ffd21f'); santaHat(c, 44, 31, 9, 0.35);
      text(c, 'Say yes to', 64, 70, 12, '#fff', 'center', 'normal'); text(c, 'more data', 64, 85, 12, '#fff', 'center', 'normal');
      c.fillStyle = '#ffffff'; c.fillRect(128, 0, 128, 40); c.fillStyle = '#ffd21f'; c.fillRect(128, 36, 128, 4);
      text(c, 'DISPLAYS:', 192, 11, 12, '#141d3a'); text(c, 'SEE HERO TABLE →', 192, 26, 13, '#141d3a', 'center', 'bold', 122);
      c.fillStyle = '#d32f2f'; c.fillRect(128, 40, 64, 32); text(c, 'FRAGILE', 160, 50, 12, '#fff');
      c.strokeStyle = '#fff'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(152, 58); c.lineTo(168, 58); c.lineTo(165, 66); c.lineTo(155, 66); c.closePath(); c.stroke();
      c.fillStyle = '#2a1c08'; c.fillRect(192, 40, 64, 48);
      c.font = 'bold 12px "DejaVu Sans Mono", "Courier New", monospace'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillStyle = '#ffb030'; c.fillText('FM 97.3', 224, 48); c.fillText('AUX', 224, 64);
      c.fillStyle = '#1a1814'; c.fillRect(192, 72, 64, 16);
    }, K('xmas'));
    // fake-snow spray: one tile = one glass pane (2.5 × 2.3 m), so flakes are painted squashed to read round
    T.snow = canvasTex(256, 128, (c, w, h) => {
      c.clearRect(0, 0, w, h);
      for (const cx of [0, w]) {
        c.save(); c.translate(cx, h); c.scale(1, 0.55);
        const g = c.createRadialGradient(0, 0, 4, 0, 0, 118); g.addColorStop(0, 'rgba(255,255,255,0.88)'); g.addColorStop(0.5, 'rgba(255,255,255,0.5)'); g.addColorStop(1, 'rgba(255,255,255,0)');
        c.fillStyle = g; c.beginPath(); c.arc(0, 0, 118, 0, TAU); c.fill(); c.restore();
      }
      seed = 19; for (let i = 0; i < 300; i++) { const x = rnd() * w, y = h - Math.pow(rnd(), 2.2) * h * 0.6; c.fillStyle = `rgba(255,255,255,${(0.3 + rnd() * 0.45).toFixed(2)})`; c.fillRect(x, y, 2, 1); }
      c.strokeStyle = 'rgba(255,255,255,0.72)'; c.lineCap = 'round';
      for (const [x, y, r] of [[44, 26, 16], [206, 20, 12], [128, 50, 9], [80, 84, 10], [226, 74, 15], [168, 14, 7], [16, 66, 8]]) flake(c, x, y, r);
    }, K('snow'));
    T.greet = canvasTex(256, 64, (c, w, h) => {   // SEASON'S GREETINGS, an arch (reads correctly from the car park)
      c.clearRect(0, 0, w, h);
      const s = "SEASON'S GREETINGS", R0 = 260, cx = w / 2, cy = 284, span = 0.88;
      c.font = FONT(19); c.textAlign = 'center'; c.textBaseline = 'middle';
      for (let i = 0; i < s.length; i++) {
        const a = -span / 2 + span * (i + 0.5) / s.length;
        c.save(); c.translate(cx + Math.sin(a) * R0, cy - Math.cos(a) * R0); c.rotate(a);
        c.lineWidth = 2; c.strokeStyle = 'rgba(70,100,130,0.55)'; c.strokeText(s[i], 0, 0); c.fillStyle = 'rgba(255,255,255,0.97)'; c.fillText(s[i], 0, 0);
        c.restore();
      }
    }, K('greet'));
    // Hero Table glass: smudges (128×64), one fingerprint, Chase's handprint
    T.smudge = canvasTex(128, 128, (c) => {
      c.clearRect(0, 0, 128, 128);
      const print = (x, y, s, a) => { c.save(); c.translate(x, y); c.rotate(a); c.strokeStyle = 'rgba(232,238,244,0.55)'; c.lineWidth = 1; for (let k = 1; k < 5; k++) { c.beginPath(); c.ellipse(0, 0, s * k / 4, s * 1.3 * k / 4, 0, 0, TAU); c.stroke(); } c.restore(); };
      seed = 37; for (let i = 0; i < 9; i++) print(8 + rnd() * 112, 6 + rnd() * 52, 3 + rnd() * 2, rnd() * 3);
      c.strokeStyle = 'rgba(225,232,240,0.38)'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(24, 46); c.quadraticCurveTo(52, 22, 92, 30); c.stroke();
      c.lineWidth = 3; c.beginPath(); c.moveTo(30, 52); c.quadraticCurveTo(56, 32, 96, 38); c.stroke();
      const fh = c.createRadialGradient(98, 16, 2, 98, 16, 14); fh.addColorStop(0, 'rgba(235,240,246,0.45)'); fh.addColorStop(1, 'rgba(235,240,246,0)');
      c.fillStyle = fh; c.save(); c.translate(98, 16); c.scale(1.6, 1); c.translate(-98, -16); c.beginPath(); c.arc(98, 16, 14, 0, TAU); c.fill(); c.restore();
      print(16, 80, 6, 0.4);
      c.fillStyle = 'rgba(230,236,242,0.5)'; c.beginPath(); c.ellipse(48, 86, 7, 8, 0, 0, TAU); c.fill();
      for (const [x, y, r] of [[40, 74, 2.2], [45, 71, 2.4], [50, 71, 2.4], [55, 74, 2.2], [57, 84, 2]]) { c.beginPath(); c.ellipse(x, y, r, r * 1.8, (x - 48) * 0.06, 0, TAU); c.fill(); }
    }, K('smudge'));
    T.wrap = canvasTex(128, 128, (c, w, h) => {   // shrink-wrap: a milky film with white wrinkle streaks
      c.fillStyle = 'rgba(235,242,248,0.35)'; c.fillRect(0, 0, w, h);
      seed = 43; c.lineCap = 'round';
      for (let i = 0; i < 34; i++) {
        const x = rnd() * w, y = rnd() * h, l = 10 + rnd() * 34, a = (rnd() - 0.5) * 1.4;
        c.strokeStyle = `rgba(255,255,255,${(0.45 + rnd() * 0.5).toFixed(2)})`; c.lineWidth = 1 + rnd() * 2.5;
        c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + 4, y + Math.sin(a) * l * 0.5 - 4, x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke();
      }
    }, K('wrap'));
    T.puff = canvasTex(64, 64, (c, w, h) => {
      c.clearRect(0, 0, w, h);
      for (const [x, y, r, a] of [[32, 34, 26, 0.55], [22, 30, 14, 0.35], [42, 26, 15, 0.35], [34, 44, 13, 0.3]]) {
        const g = c.createRadialGradient(x, y, 1, x, y, r); g.addColorStop(0, `rgba(235,235,232,${a})`); g.addColorStop(1, 'rgba(235,235,232,0)');
        c.fillStyle = g; c.fillRect(0, 0, w, h);
      }
    }, { key: 'reddy_puff' });
    T.laptop = canvasTex(256, 160, paintLaptop, K('laptop'));
    T.chain = canvasTex(64, 64, (c, w, h) => {   // chain-link diamonds
      c.clearRect(0, 0, w, h); c.strokeStyle = '#a7adb2'; c.lineWidth = 2;
      for (let k = -64; k < 128; k += 16) { c.beginPath(); c.moveTo(k, 0); c.lineTo(k + 64, 64); c.stroke(); c.beginPath(); c.moveTo(k, 64); c.lineTo(k + 64, 0); c.stroke(); }
    }, K('chain', { repeat: [1, 1] }));
    return T;
  }

  // ========================================================== the shell factory
  // makeReddy(era, ext) -> a SET def. era '2026' builds reddy26 exactly as docs/sets/reddy26.md; '2040' builds the same
  // layout with the era switches of §13 (no cars, no Christmas, no Hero Table, no kettle/mug/laptop; blank neighbour
  // signs; cream chairs; dusty radio; faded Wall + wreath; scorch ×4; roller door jammed at 0.45; plant in the backroom;
  // cooler tints) and leaves the rest to ext:
  //   ext.paint(T, K)            before build: replace/add textures (T.fascia, T.office, T.notice, T.targets, T.posters, T.sim, T.tv …)
  //   ext.build(K)               inside build, after the shell's props, while the shell's static Builder is still open
  //                              (static geometry added through K merges with the shell's: no extra draw calls)
  //   ext.dress(state, K, opts)  after the shell's dress · ext.update(dt, ctx, K) after the shell's update
  //   ext.autoDress              { sceneId: state | [state, opts] } or (sceneId) -> state: the dress applied on scene change
  //   ext.interior               { envName: { panel, row, ceil, fairy, sign } } interior emissive targets per env
  //   ext.env / marks / anchors / cams / props / ambience: merged over the shell's (2040: the shell has no env presets);
  //   ext.zones replaces the shell's zone list (the same array object is exported, so ext.dress may splice it in place);
  //   ext.floor passes through.
  // K (the kit): box, bb, boxR, cyl, ico, tor, quad, quadR, quadUV, label, wall, part, at, seg, rod, garland, P (add a
  // named prop to the root), setTint(TINT.OUT|IN|BOH), text, FONT, yes, flake, canvasTex, mat, matTex, instanced, rnd,
  // seed(n), RG (atlas regions), skipping, reduceFx, smooth, and getters M (materials), T (textures), R (live prop refs:
  // R.root, R.doorL, R.tv, R.radio, R.roller, R.scorch, R.tree, R.wallPhone, R.jboxLid …), COL (colliders), era, E40.
  function makeReddy(era = '2026', ext = {}) {
    const E40 = era === '2040', E26 = !E40, ID = E40 ? 'reddy40' : 'reddy26', KP = ID + '_';
    const OUT = [1.15, 1.0, 0.76], IN = E40 ? [0.84, 0.97, 1.14] : [0.86, 0.96, 1.1], BOH = E40 ? [0.88, 0.97, 1.08] : [0.9, 0.97, 1.06];
    const PANEL = E40 ? 0xeaf4ff : 0xfff1dd;
    const COL = [];                // colliders (filled by build; dynamic ones are arrays mutated in place)
    const R = {};                  // live prop refs from the last build (update/dress use them)
    const tc = new THREE.Color(), m4 = new THREE.Matrix4(), vA = new THREE.Vector3(), qA = new THREE.Quaternion(), ZAX = new THREE.Vector3(0, 0, 1);
    const sV = new THREE.Vector3(), sQ = new THREE.Quaternion(), sE = new THREE.Euler(), sS = new THREE.Vector3(), sM = new THREE.Matrix4(), sC = new THREE.Color();   // update() scratch
    const PARK = 1e4;
    const park = (c) => { c[0] = c[1] = c[2] = c[3] = PARK; };
    const setBox = (c, x0, z0, x1, z1) => { c[0] = x0; c[1] = z0; c[2] = x1; c[3] = z1; };
    let b = null, tint = OUT, XF = null, T = null, M = null, CUST = null, FAIRYM = null, SUNM = null, SKYM = null;

    // -------------------------------------------------------- geometry helpers (into the current Builder `b`)
    function put(g, hex, m) {
      if (XF) g.applyMatrix4(XF);
      tc.set(hex);
      const r = tc.r * tint[0], gg = tc.g * tint[1], bl = tc.b * tint[2], n = g.attributes.position.count, a = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) { a[i * 3] = r; a[i * 3 + 1] = gg; a[i * 3 + 2] = bl; }
      g.setAttribute('color', new THREE.BufferAttribute(a, 3));
      b.geo(g, m || M.vc);
    }
    // box: y is the BOTTOM. bb: min/max corners. boxR: centred, rotation X then Z then Y. cyl/ico/tor: centred.
    function box(w, h, d, hex, x, y, z, ry = 0, m) { const g = new THREE.BoxGeometry(w, h, d); if (ry) g.rotateY(ry); g.translate(x, y + h / 2, z); put(g, hex, m); }
    function bb(x0, y0, z0, x1, y1, z1, hex, m) { box(x1 - x0, y1 - y0, z1 - z0, hex, (x0 + x1) / 2, y0, (z0 + z1) / 2, 0, m); }
    function boxR(w, h, d, hex, x, y, z, rx = 0, ry = 0, rz = 0, m) {
      const g = new THREE.BoxGeometry(w, h, d); g.rotateX(rx); g.rotateZ(rz); g.rotateY(ry); g.translate(x, y, z); put(g, hex, m);
    }
    function cyl(rt, rb, h, seg, hex, x, y, z, rx = 0, rz = 0, m) {
      const g = new THREE.CylinderGeometry(rt, rb, h, seg); if (rx) g.rotateX(rx); if (rz) g.rotateZ(rz); g.translate(x, y, z); put(g, hex, m);
    }
    function ico(r, hex, x, y, z, sy = 1, m) { const g = new THREE.IcosahedronGeometry(r, 0); g.scale(1, sy, 1); g.translate(x, y, z); put(g, hex, m); }
    function tor(R0, r, hex, x, y, z, rx = 0, ry = 0, rz = 0, m, ts = 14, rs = 4) {
      const g = new THREE.TorusGeometry(R0, r, rs, ts); g.rotateX(rx); g.rotateZ(rz); g.rotateY(ry); g.translate(x, y, z); put(g, hex, m);
    }
    // quad faces +Z before rotation (rx first, then ry): floor rx=-H, ceiling rx=H, a wall facing -X ry=-H, facing +X ry=H.
    function quad(w, h, m, x, y, z, ry = 0, rx = 0, hex = 0xffffff) {
      const g = new THREE.PlaneGeometry(w, h); if (rx) g.rotateX(rx); if (ry) g.rotateY(ry); g.translate(x, y, z); put(g, hex, m);
    }
    function uvMap(g, f) { const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) f(uv, i); }
    // quadR: a quad showing one atlas region rg = [x, y, w, h, W, H] (canvas pixels, top-left origin)
    function quadR(w, h, m, rg, x, y, z, ry = 0, rx = 0, hex = 0xffffff) {
      const g = new THREE.PlaneGeometry(w, h), u0 = rg[0] / rg[4], u1 = (rg[0] + rg[2]) / rg[4], v0 = 1 - (rg[1] + rg[3]) / rg[5], v1 = 1 - rg[1] / rg[5];
      uvMap(g, (uv, i) => uv.setXY(i, u0 + uv.getX(i) * (u1 - u0), v0 + uv.getY(i) * (v1 - v0)));
      if (rx) g.rotateX(rx); if (ry) g.rotateY(ry); g.translate(x, y, z); put(g, hex, m);
    }
    // quadUV: a quad whose UVs are scaled (us, vs) — tiling textures keep their density on odd-sized patches
    function quadUV(w, h, m, x, y, z, ry, rx, hex, us, vs, uo = 0, vo = 0) {
      const g = new THREE.PlaneGeometry(w, h); uvMap(g, (uv, i) => uv.setXY(i, uo + uv.getX(i) * us, vo + uv.getY(i) * vs));
      if (rx) g.rotateX(rx); if (ry) g.rotateY(ry); g.translate(x, y, z); put(g, hex, m);
    }
    // one row (0..7) of the 8-row label atlas
    function label(w, h, row, x, y, z, ry = 0, m = M.atlas) {
      const g = new THREE.PlaneGeometry(w, h), uv = g.attributes.uv;
      for (let i = 0; i < 4; i++) uv.setY(i, uv.getY(i) > 0.5 ? 1 - row / 8 : 1 - (row + 1) / 8);
      if (ry) g.rotateY(ry); g.translate(x, y, z); put(g, 0xffffff, m);
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
    const at = (x, z, ry = 0) => (XF = m4.makeRotationY(ry).setPosition(x, 0, z));
    // a cable segment in the local YZ plane (x = 0) from (y0,z0) to (y1,z1)
    function seg(y0, z0, y1, z1, r, hex) {
      const dy = y1 - y0, dz = z1 - z0, g = new THREE.BoxGeometry(r, r, Math.hypot(dy, dz) + r);
      g.rotateX(Math.atan2(-dy, dz)); g.translate(0, (y0 + y1) / 2, (z0 + z1) / 2); put(g, hex);
    }
    // a square rod between any two points (twist rolls it about its own axis)
    function rod(x0, y0, z0, x1, y1, z1, r, hex, m, twist = 0) {
      vA.set(x1 - x0, y1 - y0, z1 - z0); const len = vA.length(); if (len < 1e-5) return;
      const g = new THREE.BoxGeometry(r, r, len + r * 0.6);
      if (twist) g.rotateZ(twist);
      qA.setFromUnitVectors(ZAX, vA.normalize()); g.applyQuaternion(qA);
      g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); put(g, hex, m);
    }
    // tinsel: a twisted silver/red rope sagging (parabola) between two points, n segments
    function garland(x0, y0, z0, x1, y1, z1, sag, n, r = 0.075, m = M.tinsel, cols = TINSEL) {
      let px = x0, py = y0, pz = z0;
      for (let i = 1; i <= n; i++) {
        const t = i / n, x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t, y = y0 + (y1 - y0) * t - 4 * sag * t * (1 - t);
        rod(px, py, pz, x, y, z, r, cols[i % cols.length], m, i * 0.4);                   // three twisted squares: a fuzzy star section
        rod(px, py, pz, x, y, z, r * 0.9, cols[(i + 2) % cols.length], m, i * 0.4 + 0.52);
        rod(px, py, pz, x, y, z, r * 0.75, cols[(i + 4) % cols.length], m, i * 0.4 + 1.05);
        px = x; py = y; pz = z;
      }
    }
    function swags(x0, y0, z0, x1, y1, z1, k, sag, n = 7, r) {   // k swags hung between evenly spaced hooks
      for (let i = 0; i < k; i++) {
        const a = i / k, c = (i + 1) / k;
        garland(x0 + (x1 - x0) * a, y0 + (y1 - y0) * a, z0 + (z1 - z0) * a, x0 + (x1 - x0) * c, y0 + (y1 - y0) * c, z0 + (z1 - z0) * c, sag, n, r);
      }
    }

    // -------------------------------------------------------- reusable little models
    function phoneModel(kind) {         // a display phone standing up, its face on +Z, origin at its base (h 0.21)
      const edge = [0xc9ccd1, 0x1f2a44, 0x5b5f66, 0xf0f0ec][kind];
      box(0.11, 0.21, 0.014, edge, 0, 0, 0);
      box(0.1, 0.19, 0.004, 0x07090c, 0, 0.012, 0.007);
      box(0.03, 0.006, 0.004, 0x222222, 0, 0.198, 0.008);
    }
    function aframeModel() {     // metal A-frame sign, 0.62 wide, hinge at the top (0.95), feet spread along z
      const fr = 0x8d9398, s = 0.33;
      for (const sz of [1, -1]) {
        boxR(0.64, 1.0, 0.03, fr, 0, 0.48, sz * 0.14, -sz * s);
        const g = new THREE.PlaneGeometry(0.54, 0.4), rg = RG.poster, u0 = rg[0] / rg[4], u1 = (rg[0] + rg[2]) / rg[4], v0 = 1 - (rg[1] + rg[3]) / rg[5], v1 = 1 - rg[1] / rg[5];
        uvMap(g, (uv, i) => uv.setXY(i, u0 + uv.getX(i) * (u1 - u0), v0 + uv.getY(i) * (v1 - v0)));
        g.rotateX(-s); if (sz < 0) g.rotateY(PI); g.translate(0, 0.57, sz * 0.157); put(g, 0xffffff, E40 ? M.vc : M.xmas);
        boxR(0.56, 0.06, 0.035, fr, 0, 0.1, sz * 0.28, -sz * s);
      }
    }
    function chairModel(name) {           // Luke's swivel chair: static base + a `seat` child that spins
      const g = part(name, () => {
        for (let i = 0; i < 5; i++) boxR(0.3, 0.03, 0.04, 0x222326, Math.sin(i * 1.2566) * 0.15, 0.06, Math.cos(i * 1.2566) * 0.15, 0, i * 1.2566 + H);
        cyl(0.025, 0.025, 0.36, 6, 0x6d7076, 0, 0.26, 0);
      });
      const seat = part('', () => {
        box(0.48, 0.08, 0.46, 0x23252b, 0, 0.44, 0);
        box(0.46, 0.55, 0.07, 0x23252b, 0, 0.56, -0.23);
        box(0.04, 0.2, 0.3, 0x2c2e33, 0.25, 0.52, -0.02); box(0.04, 0.2, 0.3, 0x2c2e33, -0.25, 0.52, -0.02);
      });
      g.add(seat); g.userData.seat = seat; g.userData.spin = 0;
      return g;
    }
    function straightenerModel(name) {
      return part(name, () => {
        boxR(0.03, 0.022, 0.26, 0x3a2446, 0.018, 0.011, 0, 0, 0, 0.12); boxR(0.03, 0.022, 0.26, 0x3a2446, -0.018, 0.011, 0.01, 0, 0, -0.08);
        box(0.012, 0.004, 0.09, 0xd9d2cf, 0.018, 0.022, 0.07); cyl(0.005, 0.005, 0.3, 4, 0x111111, 0, 0.01, -0.26, H);
      }, null, 0, { floor: false });
    }
    function mug(hex, x, y, z) { cyl(0.04, 0.036, 0.09, 8, hex, x, y + 0.045, z); box(0.012, 0.05, 0.035, hex, x + 0.045, y + 0.02, z); }
    function car(hex, x, z, ry, ute) {   // parked car into the static builder (dark opaque windows)
      at(x, z, ry);
      const glass = 0x2f3b47;
      bb(-0.9, 0.3, -2.3, 0.9, 0.95, 2.3, hex);
      bb(-0.92, 0.22, 2.2, 0.92, 0.55, 2.38, 0x2a2a2a); bb(-0.92, 0.22, -2.38, 0.92, 0.55, -2.2, 0x2a2a2a);
      if (ute) { bb(-0.82, 0.95, 0.2, 0.82, 1.55, 1.2, hex); bb(-0.8, 1.02, 1.2, 0.8, 1.45, 1.22, glass); bb(-0.9, 0.95, -2.3, -0.84, 1.3, 0.1, hex); bb(0.84, 0.95, -2.3, 0.9, 1.3, 0.1, hex); bb(-0.9, 0.95, -2.3, 0.9, 1.3, -2.24, hex); }
      else { bb(-0.78, 0.95, -1.2, 0.78, 1.42, 0.8, hex); bb(-0.8, 1.0, -1.1, 0.8, 1.36, 0.7, glass); boxR(1.5, 0.05, 0.62, glass, 0, 1.2, 1.0, -0.62); boxR(1.5, 0.05, 0.5, glass, 0, 1.18, -1.38, 0.72); }
      bb(-0.7, 0.62, 2.3, -0.4, 0.74, 2.33, 0xfff3c4); bb(0.4, 0.62, 2.3, 0.7, 0.74, 2.33, 0xfff3c4);
      bb(-0.8, 0.66, -2.33, -0.5, 0.78, -2.3, 0xc0272d); bb(0.5, 0.66, -2.33, 0.8, 0.78, -2.3, 0xc0272d);
      for (const [wx, wz] of [[-0.82, 1.45], [0.82, 1.45], [-0.82, -1.45], [0.82, -1.45]]) cyl(0.33, 0.33, 0.22, 10, 0x151515, wx, 0.33, wz, 0, H);
      XF = null;
      const c = Math.cos(ry), s = Math.sin(ry), ex = Math.abs(c) * 0.95 + Math.abs(s) * 2.4, ez = Math.abs(s) * 0.95 + Math.abs(c) * 2.4;
      COL.push([x - ex, z - ez, x + ex, z + ez]);
    }
    function palm(x, z, h) {
      for (let i = 0; i < 6; i++) cyl(0.16 - i * 0.012, 0.18 - i * 0.012, h / 6, 6, i % 2 ? 0x8a6b4a : 0x7a5d3f, x + i * 0.04, h / 12 + i * h / 6, z);
      for (let i = 0; i < 7; i++) { const a = i * 0.9; boxR(0.35, 0.04, 2.2, i % 2 ? 0x4f8a3a : 0x5c9a42, x + 0.24 + Math.sin(a) * 1.0, h + 0.05, z + Math.cos(a) * 1.0, 0.45, a); }
    }
    function tree(x, z, s) {
      cyl(0.12 * s, 0.16 * s, 2 * s, 6, 0x7b6a55, x, s, z);
      ico(1.3 * s, 0x6f8f4a, x, 2.6 * s, z, 0.8); ico(0.9 * s, 0x7f9d55, x + 0.7 * s, 2.3 * s, z + 0.3 * s, 0.8); ico(0.9 * s, 0x5f7f40, x - 0.6 * s, 2.9 * s, z - 0.4 * s, 0.8);
    }
    function house(x, z, w, wallc, roofc) {
      bb(x - w / 2, 0, z - 4, x + w / 2, 3.1, z + 4, wallc);
      boxR(w + 0.6, 0.12, 4.9, roofc, x, 4.05, z + 2.15, 0.48); boxR(w + 0.6, 0.12, 4.9, roofc, x, 4.05, z - 2.15, -0.48);
      bb(x - w / 2 + 0.2, 3.1, z - 0.1, x + w / 2 - 0.2, 4.55, z + 0.1, roofc);
      for (const dx of [-w / 4, w / 4]) { bb(x + dx - 0.7, 1.0, z - 4.02, x + dx + 0.7, 2.1, z - 3.98, 0x3d4a57); bb(x + dx - 0.8, 0.95, z - 4.06, x + dx + 0.8, 1.0, z - 3.98, 0xf0f0f0); }
      bb(x - 0.45, 0, z - 4.03, x + 0.45, 2.1, z - 3.99, 0x7b5236);
      for (let i = -w / 2; i <= w / 2; i += 0.5) bb(x + i - 0.04, 0, z - 6.05, x + i + 0.04, 1.1, z - 5.95, 0xf4f1ea);
      bb(x - w / 2, 0.9, z - 6.03, x + w / 2, 0.98, z - 5.97, 0xf4f1ea);
    }
    // the glass shopfront's fake snow: one pane-local tile, UVs from world x/y so cut-outs keep the pattern continuous
    function snowRect(x0, x1, y0, y1, p0, p1) {
      const g = new THREE.PlaneGeometry(x1 - x0, y1 - y0);
      uvMap(g, (uv, i) => uv.setXY(i, ((uv.getX(i) ? x1 : x0) - p0) / (p1 - p0), ((uv.getY(i) ? y1 : y0) - 0.3) / 2.3));
      g.translate((x0 + x1) / 2, (y0 + y1) / 2, -0.02); put(g, 0xffffff, M.snow);
    }
    // fairy-light bulb positions (collected while building; one InstancedMesh at the end). tree bulbs are tree-local.
    const FAIRY = [], FAIRY_TREE = [];

    function textures() {
      if (T) return T;
      T = shellTextures(KP);
      if (ext.paint) ext.paint(T, KIT);
      return T;
    }
    const PAPER = { emissive: 0xffffff, emissiveIntensity: 0.28 };

    // -------------------------------------------------------- build: materials, then static geometry by area, then props
    function materials() {
      M = {
        vc: mat(0xffffff),
        glass: mat(0xcfe8f0, { transparent: true, opacity: 0.16, side: DS }),
        light: mat(0xffffff, { emissive: PANEL, emissiveIntensity: 0.95, key: KP + 'light' }),
        lightRow: mat(0xffffff, { emissive: PANEL, emissiveIntensity: 0.95, key: KP + 'lightRow' }),
        ceil: mat(0xffffff, { emissive: 0x8e949c, emissiveIntensity: 1, key: KP + 'ceil' }),
        exit: mat(0xffffff, { emissive: 0x22c55e, emissiveIntensity: 0.9 }),
        warm: mat(0xffffff, { emissive: 0xfff2d6, emissiveIntensity: 0.8 }),
        beam: mat(0xff3020, { emissive: 0xff2010, transparent: true, opacity: 0.35, side: DS }),
        tube: mat(0xffffff, { emissive: 0xeef6ff, emissiveIntensity: 1, key: KP + 'tube' }),
        flash: mat(0xffffff, { emissive: 0xffffff, side: DS }),
        asphalt: matTex(T.asphalt), floor: matTex(T.floor), slat: matTex(T.slat), shutter: matTex(T.shutter, { side: DS }),
        fascia: matTex(T.fascia, { emissive: 0xffffff, emissiveIntensity: 0.25, key: KP + 'fascia' }),
        yes: matTex(T.yes, { emissive: 0xffffff, emissiveIntensity: 0.35 }), closed: matTex(T.closed, { side: DS }), open: matTex(T.open, { side: DS }),
        queue: matTex(T.queue, PAPER), targets: matTex(T.targets, PAPER), notice: matTex(T.notice, PAPER), cal: matTex(T.cal, PAPER),
        office: matTex(T.office, PAPER), sim: matTex(T.sim, PAPER), clock: matTex(T.clock, { ...PAPER, transparent: true }),
        atlas: matTex(T.atlas), atlasLit: matTex(T.atlas, { emissive: 0xffffff, emissiveIntensity: 0.7 }), lineup: matTex(T.lineup),
        posters: matTex(T.posters, PAPER), keypad: matTex(T.keypad, PAPER),
        mon: matTex(T.mon, { emissive: 0xffffff }), tv: matTex(T.tv, { emissive: 0xffffff, emissiveIntensity: 0.9 }),
        phone: matTex(T.phone, { emissive: 0xffffff }), spin: matTex(T.spin, { emissive: 0xffffff }),
        shim: matTex(T.shim, { transparent: true, side: DS, emissive: 0xffffff, emissiveIntensity: 0.5 }),
        scorch: matTex(T.scorch, { transparent: true }),
        wall: matTex(T.wall, PAPER), xmas: matTex(T.xmas, PAPER), xmasLit: matTex(T.xmas, { emissive: 0xffffff, emissiveIntensity: 0.9 }),
        laptop: matTex(T.laptop, { emissive: 0xffffff, emissiveIntensity: 0.9 }),
        snow: matTex(T.snow, { transparent: true, side: DS }), greet: matTex(T.greet, { transparent: true, side: DS }),
        smudge: matTex(T.smudge, { transparent: true }), wrap: matTex(T.wrap, { transparent: true, side: DS }),
        chain: matTex(T.chain, { transparent: true, side: DS }),
        tinsel: mat(0xffffff, { emissive: 0x8c9198, emissiveIntensity: 0.25, key: KP + 'tinsel' }),
        puck: mat(0x3a0806, { emissive: 0xff2010, emissiveIntensity: 0.1, key: KP + 'puck' }),
        beacon: mat(0x5a0e0a, { emissive: 0xff2a1a, emissiveIntensity: 0.15, key: KP + 'beacon' }),
        blast: mat(0xffffff, { emissive: 0xffffff, transparent: true, opacity: 1, side: DS, key: KP + 'blast' }),
        glint: mat(0xffffff, { emissive: 0xffffff, transparent: true, opacity: 0.7, key: KP + 'glint' }),
        shard: mat(0xe6f6ff, { emissive: 0x5a6a78, transparent: true, opacity: 0.55, side: DS, key: KP + 'shard' }),
        smokeF: matTex(T.puff, { color: 0xd0d0ce, emissive: 0xffffff, emissiveIntensity: 0.45, transparent: true, opacity: 0, side: DS, key: KP + 'smokeF' }),
        smokeB: matTex(T.puff, { color: 0xd0d0ce, emissive: 0xffffff, emissiveIntensity: 0.45, transparent: true, opacity: 0, side: DS, key: KP + 'smokeB' }),
        leak: mat(0xffd9a0, { emissive: 0xffc070, emissiveIntensity: 1, transparent: true, opacity: 0, key: KP + 'leak' }),
        bay: mat(0x3d8fc4, { key: KP + 'bay' }),
        inst: mat(0xffffff, { key: 'reddy_inst' }),
      };
    }
    function buildOutside(root) {
      // ====================================================== outside (warm sun)
      tint = OUT;
      quad(400, 260.3, M.vc, 0, -0.02, 69.85, 0, -H, 0xb3ad7a);             // the ground, x ±200, z −60.3..200
      quad(80, 23.4, M.asphalt, 0, 0, 14.7, 0, -H);                          // car park z 3..26.4
      quad(80, 8, M.asphalt, 0, 0.004, 31, 0, -H, 0x9a9a9c);                 // road z 27..35
      quad(80, 3, M.vc, 0, 0.006, 1.5, 0, -H, 0xdcd3c3);                     // footpath under the awning
      for (let x = -39; x < 40; x += 2.4) bb(x, 0.006, 0, x + 0.03, 0.012, 2.95, 0xb9b1a2);
      bb(-40, 0, 2.95, -3.6, 0.1, 3.1, 0xcfc8ba); bb(-0.4, 0, 2.95, 40, 0.1, 3.1, 0xcfc8ba);
      bb(-3.6, 0, 2.95, -0.4, 0.02, 3.1, 0xf2c230);                          // kerb ramp at the crossing
      bb(-40, 0, 23.5, 40, 0.15, 25.5, 0x86ab55); bb(-40, 0, 23.4, 40, 0.18, 23.55, 0xcfc8ba);   // verge
      quad(80, 1.5, M.vc, 0, 0.16, 26.25, 0, -H, 0xd6cdbd); quad(80, 2.2, M.vc, 0, 0.01, 36.1, 0, -H, 0xd6cdbd);
      quad(80, 6, M.vc, 0, 0.012, 40.2, 0, -H, 0x8fb25d);                    // lawns over the road
      for (const [x, z, sc] of [[-45, -10, 1.5], [45, -5, 1.7], [-52, 18, 1.3], [54, 22, 1.4]]) tree(x, z, sc);
      for (let x = -39; x < 40; x += 6) bb(x, 0.006, 30.94, x + 3, 0.014, 31.06, 0xf2f0e6);     // centre line
      const fr = [-14.3, -11.6, -8.9, -6.2, -3.5, -0.5, 2.2, 4.9, 7.6, 10.3, 13, 15.7];
      for (const x of fr) bb(x - 0.05, 0.006, 6.5, x + 0.05, 0.014, 12, 0xf2f0e6);
      for (let x = -14.45; x < 16; x += 2.7) bb(x - 0.05, 0.006, 18, x + 0.05, 0.014, 23.4, 0xf2f0e6);
      bb(-15.5, 0.006, 11.95, 16, 0.014, 12.05, 0xf2f0e6); bb(-15.5, 0.006, 17.95, 16, 0.014, 18.05, 0xf2f0e6);
      for (const x of [-12.95, -10.25, -7.55, -4.85, 0.85, 3.55, 6.25, 8.95, 11.65]) bb(x - 0.8, 0, 6.6, x + 0.8, 0.12, 6.75, 0xbab4a9);
      for (const x of [-3.2, -2.4, -1.6, -0.8]) bb(x - 0.2, 0.006, 3.2, x + 0.2, 0.014, 6.4, 0xf4f2ea);
      bb(-3.5, 0.006, 6.5, -3.4, 0.014, 12, 0xf2c230); bb(-0.6, 0.006, 6.5, -0.5, 0.014, 12, 0xf2c230);
      for (let z = 7; z < 12; z += 0.8) boxR(0.07, 0.008, 3.9, 0xf2c230, -2, 0.01, z + 0.4, 0, 0.8);
      for (const x of [-9, -6, 2, 5, 8]) cyl(0.09, 0.09, 0.9, 8, YEL, x, 0.45, 3.35);           // bollards
      for (const sx of [-1, 1]) {                                                               // edge planters
        bb(sx * 16.1 - 0.5, 0, 3.4, sx * 16.1 + 0.5, 0.55, 23.4, 0xb4876a);
        for (let z = 4; z < 23.4; z += 1.3) ico(0.55, z % 2.6 < 1.3 ? 0x5f8a3e : 0x6d9a48, sx * 16.1, 0.8, z, 0.8);
        COL.push([sx * 16.1 - 0.5, 3.4, sx * 16.1 + 0.5, 23.4]); COL.push([sx * 16.1 - 0.5, -0.2, sx * 16.1 + 0.5, 3.4]);
        bb(sx * 16.1 - 0.5, 0, 0.3, sx * 16.1 + 0.5, 0.55, 2.8, 0xb4876a); ico(0.5, 0x5f8a3e, sx * 16.1, 0.75, 1.5, 0.8);
      }
      COL.push([-17, 23.4, 17, 24.5]);
      for (const [x0, z0, x1, z1] of [[13, 7, 13.06, 11.8], [15.8, 7, 15.86, 11.8], [13, 7, 15.86, 7.06]]) { bb(x0, 0.95, z0, x1, 1.0, z1, 0xb8bdc2); bb(x0, 0.45, z0, x1, 0.5, z1, 0xb8bdc2); }
      for (const [x, z] of [[13.03, 7.03], [15.83, 7.03], [13.03, 11.8], [15.83, 11.8], [13.03, 9.4], [15.83, 9.4]]) cyl(0.04, 0.04, 1.0, 6, 0xb8bdc2, x, 0.5, z);
      for (let i = 0; i < 5; i++) {
        const z = 7.7 + i * 0.32;
        bb(14.1, 0.35, z, 14.75, 0.95, z + 0.85, 0x9ea4aa); bb(14.13, 0.93, z + 0.03, 14.72, 0.96, z + 0.82, 0x6c7278);
        bb(14.05, 1.0, z + 0.9, 14.8, 1.05, z + 0.96, 0xd32f2f); cyl(0.05, 0.05, 0.03, 6, 0x222, 14.15, 0.07, z + 0.1, 0, H);
      }
      COL.push([12.9, 6.9, 15.9, 11.9]);
      if (E26) {   // parked cars (2040: reddy40 parks instanced hover-cars instead)
        car(0xf2f2ee, -10.25, 9.3, PI); car(0xa9adb3, 6.25, 9.3, PI); car(0xb3262c, 8.95, 9.3, PI);
        car(0x2f5da8, -13.1, 20.7, 0, true); car(0xe8e6de, 3.1, 20.7, 0); car(0x6a6e75, 8.5, 20.7, 0);
      }
      for (const x of [-8.3, 6.5]) { cyl(0.08, 0.1, 7, 6, 0x8d9296, x, 3.5, 24.2); bb(x - 0.05, 6.9, 22.9, x + 0.05, 7.0, 24.2, 0x8d9296); bb(x - 0.25, 6.75, 22.6, x + 0.25, 6.95, 23.3, 0x5d6166); COL.push([x - 0.2, 24, x + 0.2, 24.4]); }
      for (const [x, h] of [[-14, 6.5], [-4, 7.5], [9.5, 6.8], [19, 7.2], [-22, 7]]) palm(x, 24.4, h);
      cyl(0.04, 0.04, 2.2, 6, 0x8d9296, 12.2, 1.1, 24.1);
      if (E26) label(1.2, 0.15, 7, 12.2, 2.1, 24.16); else bb(11.6, 2.03, 24.13, 12.8, 2.18, 24.16, 0x9aa0a6);
      const hc = [[0xefe3c8, 0x9a4b32], [0xdfe8ee, 0x5a6470], [0xf3d9c4, 0x8c3f2c], [0xe6e9d8, 0x6b7a86], [0xf5ecd9, 0xa0553a], [0xdbe3d0, 0x535b63]];
      for (let i = 0; i < 9; i++) house(-36 + i * 9, 45, 7.2, hc[i % 6][0], hc[i % 6][1]);
      for (const [x, s] of [[-31, 1.2], [-13.5, 1.5], [4.5, 1.1], [14, 1.6], [31.5, 1.3]]) tree(x, 39.5, s);
      for (let x = -36; x < 40; x += 18) { cyl(0.1, 0.13, 9, 6, 0x6b5a48, x, 4.5, 35.4); bb(x - 0.9, 8.4, 35.35, x + 0.9, 8.5, 35.45, 0x6b5a48); }
      for (const dy of [0, 0.3]) bb(-40, 8.3 - dy, 35.39, 40, 8.33 - dy, 35.41, 0x222222);

      // shopfront + neighbours + awning (the facade is lit by the sun)
      bb(-26, 3.25, -0.3, 26, 3.45, 3.0, 0xc9c4ba, M.ceil); bb(-26, 3.2, 2.95, 26, 3.5, 3.05, 0x2a3350);
      for (const x of [-23, -16.5, -9.5, 4.5, 11.5, 16.5, 23]) { cyl(0.06, 0.06, 3.25, 6, 0x8d9296, x, 1.62, 2.8); COL.push([x - 0.12, 2.68, x + 0.12, 2.92]); }
      for (let x = -24; x < 26; x += 3) bb(x - 0.12, 3.24, 1.4, x + 0.12, 3.25, 1.64, 0xfff6d8, M.warm);
      bb(-9.25, 3.2, -0.3, 11.25, 5.3, 0.25, 0xe9e2d4);                                                  // store parapet
      bb(-5.1, 3.55, 0.25, 1.1, 5.1, 0.45, NAVY); quad(6, 1.5, M.fascia, -2, 4.32, 0.46);                // the Yes Optus sign
      if (E26) {   // a Santa hat jammed over the top of the Y (the back half sinks into the sign box)
        tor(0.32, 0.065, 0xf4f2ee, -4.06, 4.74, 0.5, H - 0.25, 0, -0.5);
        cyl(0.06, 0.29, 0.62, 9, 0xc8202a, -3.911, 5.012, 0.5, 0, -0.5);
        rod(-3.79, 5.26, 0.52, -3.66, 5.25, 0.55, 0.09, 0xb81c26); rod(-3.66, 5.25, 0.55, -3.62, 5.18, 0.55, 0.07, 0xb81c26);
        ico(0.09, 0xffffff, -3.62, 5.16, 0.55);
      }
      bb(-9.25, 0, -0.14, -3.1, 0.3, 0.14, 0x2b2f38); bb(-0.9, 0, -0.14, 11.25, 0.3, 0.14, 0x2b2f38);  // bulkheads
      bb(-9.25, 2.6, -0.14, 11.25, 3.2, 0.14, 0x2b2f38);                                                // transom
      for (const x of [-9.15, -6.6, -4.3, -3.15, -0.85, 1.6, 4.1, 6.6, 9.0, 11.15]) bb(x - 0.05, 0.3, -0.08, x + 0.05, 2.6, 0.08, 0xa8adb3);
      quad(6.15, 2.3, M.glass, -6.175, 1.45, 0); quad(12.15, 2.3, M.glass, 5.175, 1.45, 0);
      bb(-9.2, 1.02, -0.01, -3.15, 1.1, 0.01, NAVY); bb(-0.85, 1.02, -0.01, 3.8, 1.1, 0.01, NAVY); bb(7.4, 1.02, -0.01, 11.2, 1.1, 0.01, NAVY);   // manifestation band (clear at the 1.1 sightline)
      COL.push([-26, -0.16, 26, 0.16]);   // the whole shopfront line (neighbours too)
      const shop = (x0, x1, wallc, row, glass) => {
        bb(x0, 3.2, -0.3, x1, 4.9, 0.2, wallc); bb(x0, 0, -0.14, x1, 0.4, 0.14, 0x3a3a3a); bb(x0, 2.6, -0.14, x1, 3.2, 0.14, 0x3a3a3a);
        bb(x0 + 0.05, 0.4, -0.05, x1 - 0.05, 2.6, 0.05, glass);
        for (let x = x0 + 0.05; x < x1; x += 2.8) bb(x - 0.05, 0.4, -0.08, x + 0.05, 2.6, 0.08, 0x9aa0a6);
        if (row >= 0 && E26) label(4, 0.5, row, (x0 + x1) / 2, 4.1, 0.21); else bb((x0 + x1) / 2 - 2, 3.85, 0.2, (x0 + x1) / 2 + 2, 4.35, 0.23, E40 && row >= 0 ? 0xb4b8bc : 0x4a4f57);
      };
      shop(-26, -17.6, 0xd9b48f, 3, 0x2c3a44); shop(-17.6, -9.25, 0xd2d6cf, 4, 0x2c3a44);
      shop(11.25, 18.6, 0xcfc9bd, E26 ? 5 : -1, 0xe8e6df); shop(18.6, 26, 0xc4b59c, -1, 0x2c3a44);
      if (E26) label(2.4, 0.3, 5, 14.9, 1.6, 0.06);
      bb(-26.2, 0, -30.25, -26, 5.3, 0, 0xd8cfbf); bb(26, 0, -30.25, 26.2, 5.3, 0, 0xd8cfbf);
      bb(-62, 0, -30.25, -26.2, 4.6, -0.4, 0xd8d0c0); bb(-62, 3.0, -0.4, -26.2, 3.3, 2.4, 0xb9b3a8);        // the rest of the parade, both ways
      bb(26.2, 0, -30.25, 62, 4.2, -0.4, 0xcfd4cc); bb(26.2, 2.9, -0.4, 62, 3.2, 2.4, 0xb4b8b2);
      cyl(0.28, 0.25, 0.9, 10, 0x2e5b3a, 0.6, 0.45, 1.1); cyl(0.3, 0.3, 0.06, 10, 0x223a2a, 0.6, 0.93, 1.1); COL.push([0.3, 0.8, 0.9, 1.4]);
      // roof (its own mesh so tools can hide it) + AC units
      root.add(part('roof', () => {
        bb(-26, 5.0, -30.25, 26, 5.12, -0.3, 0xb9b4aa);
        bb(-26, 5.12, -30.25, 26, 5.3, -30.1, 0xc8c2b6);
        for (const [x, z] of [[-18, -10], [-4, -20], [5, -8], [8, -26], [19, -15]]) { bb(x - 0.8, 5.12, z - 0.6, x + 0.8, 6.0, z + 0.6, 0xd4d6d8); bb(x - 0.5, 6.0, z - 0.5, x + 0.5, 6.05, z + 0.5, 0x5a5e63); }
      }));

      // ====================================================== rear: the back of the strip, the yard, the Parade, the bay
      const RW = 0xd2cbbd;
      bb(-26, 0, -30.25, 2.15, 5.0, -30.0, RW); bb(10.65, 0, -30.25, 26, 5.0, -30.0, RW);
      bb(2.15, 0, -30.25, 6.6, 5.0, -30.15, RW); bb(8.9, 0, -30.25, 10.65, 5.0, -30.15, RW); bb(6.6, 2.3, -30.25, 8.9, 5.0, -30.15, RW);   // outer skin round the roller door
      for (const x of [6.48, 9.02]) bb(x - 0.06, 0, -30.33, x + 0.06, 2.42, -30.25, 0x8a8f94);   // door guides
      bb(6.42, 2.3, -30.33, 9.08, 2.42, -30.25, 0x8a8f94);
      for (const x of [-20.5, -2.8, 13.5, 18.0]) { bb(x - 0.45, 0, -30.31, x + 0.45, 2.1, -30.25, 0x6a6e66); bb(x + 0.28, 1.0, -30.36, x + 0.36, 1.06, -30.31, 0xb8bec4); }   // neighbours' back doors
      for (const x of [-12.0, 1.2, 21.5]) { bb(x - 0.06, 0, -30.36, x + 0.06, 5.0, -30.25, 0x9a9e98); }   // downpipes
      tint = OUT;
      quad(12, 2.75, M.vc, 8, 0.012, -31.625, 0, -H, 0xc9c4ba);                                // apron x 2..14
      quadUV(52, 15.75, M.asphalt, 0, 0.006, -38.125, 0, -H, 0xffffff, 0.65, 0.673);         // the yard, x −26..26, z −30.25..−46
      const FEN = 0x76807a, RIB = 0x606a64;
      const fenceX = (x, z0, z1) => { bb(x - 0.03, 0, z0, x + 0.03, 2.1, z1, FEN); for (let z = z0 + 0.12; z < z1; z += 0.25) bb(x - 0.045, 0, z, x + 0.045, 2.1, z + 0.04, RIB); for (let z = z0; z <= z1 + 0.01; z += 2.5) bb(x - 0.06, 0, z - 0.04, x + 0.06, 2.15, z + 0.04, 0x55605a); COL.push([x - 0.1, z0, x + 0.1, z1]); };
      const fenceZ = (z, x0, x1) => { bb(x0, 0, z - 0.03, x1, 2.1, z + 0.03, FEN); for (let x = x0 + 0.12; x < x1; x += 0.25) bb(x, 0, z - 0.045, x + 0.04, 2.1, z + 0.045, RIB); for (let x = x0; x <= x1 + 0.01; x += 2.5) bb(x - 0.04, 0, z - 0.06, x + 0.04, 2.15, z + 0.06, 0x55605a); COL.push([x0, z - 0.1, x1, z + 0.1]); };
      fenceX(-6, -46, -30.25); fenceX(20, -46, -30.25); fenceZ(-46, -6, 6); fenceZ(-46, 17, 20);
      for (const [x0, x1] of [[6, 9.5], [13.5, 17]]) {                                          // chain-link either side of the gate
        for (const x of [x0, (x0 + x1) / 2, x1]) cyl(0.03, 0.03, 2.1, 6, 0xb8bec4, x, 1.05, -46);
        bb(x0, 2.02, -46.02, x1, 2.06, -45.98, 0xb8bec4); bb(x0, 0.04, -46.015, x1, 0.07, -45.985, 0xb8bec4);
        quadUV(x1 - x0, 2.0, M.chain, (x0 + x1) / 2, 1.04, -46, 0, 0, 0xffffff, (x1 - x0) / 0.32, 2.0 / 0.32);
        COL.push([x0, -46.1, x1, -45.9]);
      }
      bb(5.2, 0, -46.16, 13.6, 0.03, -46.08, 0x707070);                                          // the gate's ground track
      if (E26) {   // 2026 yard: wheelie bins, a pallet stack, Luke's car
        for (const [x, lid] of [[11.3, 0x2e7d32], [12.0, 0xc62828], [12.7, 0xf2c230]]) { bb(x - 0.3, 0, -31.35, x + 0.3, 1.0, -30.75, 0x3a4a3e); bb(x - 0.32, 1.0, -31.4, x + 0.32, 1.06, -30.72, lid); }
        COL.push([10.95, -31.45, 13.05, -30.7]);
        for (let i = 0; i < 4; i++) { bb(4.0, i * 0.25, -43.7, 5.2, i * 0.25 + 0.04, -42.7, 0xb08a5a); for (const z of [-43.68, -43.2, -42.72]) bb(4.0, i * 0.25 + 0.04, z - 0.04, 5.2, i * 0.25 + 0.2, z + 0.04, 0x9a7650); }
        COL.push([3.9, -43.8, 5.3, -42.6]);
        car(0x6a1e22, -2.8, -36.4, H);
        for (const x of [-4.4, -1.6, 1.2]) bb(x - 0.05, 0.008, -39.5, x + 0.05, 0.014, -33.6, 0xf2f0e6);
      }
      quad(400, 2.5, M.vc, 0, 0.01, -47.25, 0, -H, 0xd6cdbd);                                    // Parade footpath
      bb(-200, 0, -48.6, 200, 0.12, -48.45, 0xcfc8ba); bb(-200, 0, -55.1, 200, 0.12, -54.95, 0xcfc8ba);
      quadUV(400, 6.5, M.asphalt, 0, 0.004, -51.75, 0, -H, 0x9a9a9c, 5, 0.278);                // Redcliffe Parade
      for (let x = -78; x < 80; x += 6) bb(x, 0.006, -51.81, x + 3, 0.014, -51.69, 0xf2f0e6);
      quad(400, 5.3, M.vc, 0, 0.008, -57.65, 0, -H, 0x8fb25d);                                   // foreshore grass
      quad(400, 1.2, M.vc, 0, 0.014, -59.3, 0, -H, 0xd8d0c0);                                    // the path by the railing
      for (let x = -24; x <= 24; x += 8) palm(x, -57, 6.4 + ((x / 8) % 2 ? 0.5 : 0));
      for (let x = -60; x <= 60; x += 2) cyl(0.035, 0.035, 1.0, 6, 0xb8bec4, x, 0.5, -60);      // foreshore railing
      bb(-60, 0.96, -60.03, 60, 1.02, -59.97, 0xc8ced2); bb(-60, 0.5, -60.02, 60, 0.54, -59.98, 0xb8bec4);
      bb(-200, -0.7, -60.6, 200, 0.02, -60.3, 0xbdb5a5);                                         // seawall
      quad(400, 200, M.bay, 0, -0.55, -160.5, 0, -H);                                            // the bay
      ico(34, 0x46684a, -130, -9, -190, 0.32); ico(26, 0x50744e, -96, -7, -176, 0.3); ico(18, 0x5a7c56, -72, -5, -168, 0.28);   // the headland (north)
      ico(46, 0x667a64, 170, -16, -240, 0.24); bb(60, 0, -150, 140, 0.6, -148, 0x8a8f94);        // far shore, a long low bridge line
    }

    function buildFloor() {
      // ====================================================== shop floor (cool fluoro)
      tint = IN;
      quad(20, 14.5, M.floor, 1, 0.01, -7.25, 0, -H);
      quad(20.5, 14.75, M.ceil, 1, 3.2, -7.35, 0, H, 0xd9dcdf);
      const panel = (x, z, m = M.light) => quad(0.6, 1.2, m, x, 3.19, z, 0, H);
      for (let z = -2.2; z > -14; z -= 2.4) { panel(-4.4, z); panel(-2, z); panel(0.4, z); panel(-7.2, z); }
      for (let z = -2.2; z > -12; z -= 2.4) { const m = Math.abs(z + 9.4) < 0.01 ? M.lightRow : M.light; panel(4.3, z, m); panel(6.4, z, m); panel(9.2, z, m); }
      for (const [x, z] of [[-5.6, -3.4], [1.4, -9], [8, -4.6], [-7.6, -12]]) bb(x - 0.3, 3.17, z - 0.3, x + 0.3, 3.2, z + 0.3, 0xcfd3d8);   // aircon vents
      cyl(0.12, 0.12, 0.12, 8, 0x2a2d33, 9.8, 3.12, -1.2);                                       // ceiling dome camera
      wall(-9.25, -14.75, -9, 0, 3.2, WHITE); wall(11, -17.25, 11.25, 0, 3.2, WHITE);
      wall(-9.25, -14.75, 2.85, -14.5, 3.2, WHITE); wall(2.6, -14.75, 2.85, -12.5, 3.2, WHITE);
      wall(2.6, -12.75, 5.4, -12.5, 3.2, WHITE); wall(7.4, -12.75, 9.4, -12.5, 3.2, WHITE); wall(10.4, -12.75, 11.25, -12.5, 3.2, WHITE);
      bb(5.4, 2.4, -12.75, 7.4, 3.2, -12.5, WHITE); bb(9.4, 2.2, -12.75, 10.4, 3.2, -12.5, WHITE);
      for (const [x0, z0, x1, z1] of [[-8.99, -14.5, -8.95, 0], [10.95, -12.5, 10.99, -0.14], [-9, -14.49, 2.6, -14.45], [2.6, -12.49, 5.4, -12.45], [7.4, -12.49, 9.4, -12.45]]) bb(x0, 0, z0, x1, 0.1, z1, 0x5a5f66);
      for (const [x0, x1] of [[5.3, 5.4], [7.4, 7.5], [9.3, 9.4], [10.4, 10.5]]) bb(x0, 0, -12.49, x1, x0 > 9 ? 2.2 : 2.4, -12.45, 0xd5d8dc);
      label(1.6, 0.2, 0, 6.4, 2.6, -12.48);                                                      // STAFF ONLY
      // display wall: navy feature wall, columns, the ledge (2026: line-up backboard, THE LATEST, four empty tether pucks)
      bb(-5.3, 0, -14.5, 1.3, 3.2, -14.47, NAVY);
      bb(-4.9, 0, -14.47, -4.55, 3.2, -14.05, 0xf7f7f7); bb(0.55, 0, -14.47, 0.9, 3.2, -14.05, 0xf7f7f7);
      bb(-4.2, 0, -14.37, 0.2, 0.95, -13.75, 0xf4f4f4); bb(-4.25, 0.95, -14.4, 0.25, 1.0, -13.7, WOOD);
      bb(-4.2, 0.08, -13.76, 0.2, 0.12, -13.74, YEL);
      COL.push([-4.9, -14.5, 0.9, -13.68]);
      if (E26) {
        bb(-4.55, 1.0, -14.47, 0.55, 2.35, -14.37, 0xf6f6f6); quad(5.1, 1.35, M.lineup, -2, 1.67, -14.365);
        bb(-4.55, 2.35, -14.47, 0.55, 2.95, -14.27, NAVY); label(4.8, 0.6, 2, -2, 2.65, -14.265, 0, M.atlasLit);
        bb(-4.56, 1.0, -14.3, -4.54, 2.35, -14.1, 0xffffff, M.light); bb(0.54, 1.0, -14.3, 0.56, 2.35, -14.1, 0xffffff, M.light);
        bb(-4.5, 2.32, -14.34, 0.5, 2.35, -14.26, 0xffffff, M.light);
        for (let i = 0; i < 4; i++) {
          const x = -3.35 + i * 0.9;
          cyl(0.045, 0.05, 0.022, 10, 0x15161a, x, 1.011, -13.98);                                // empty cradle puck
          bb(x - 0.045, 1.13, -14.37, x + 0.045, 1.23, -14.33, 0x2a2c30);                        // tether puck on the backboard
          rod(x, 1.15, -14.33, x + 0.01, 1.02, -14.12, 0.014, 0x1b1c20); rod(x + 0.01, 1.02, -14.12, x, 1.02, -13.99, 0.014, 0x1b1c20);
          rod(x + 0.03, 1.016, -13.97, x + 0.1, 1.008, -13.86, 0.012, 0x1b1c20);                  // the snipped stub
          bb(x + 0.098, 1.0, -13.865, x + 0.112, 1.014, -13.851, 0xc87533);
        }
        quadR(0.32, 0.1, M.xmas, RG.tent, -2.0, 1.048, -13.84, 0, -0.28);                      // DISPLAYS: SEE HERO TABLE →
        boxR(0.32, 0.1, 0.004, 0xffffff, -2.0, 1.048, -13.885, 0.28);
      }
      bb(0.95, 1.2, -14.5, 1.27, 1.52, -14.46, 0xe9e9e9); bb(1.0, 1.3, -14.47, 1.09, 1.42, -14.44, 0x3a3a3a); bb(1.13, 1.3, -14.47, 1.22, 1.42, -14.44, 0x3a3a3a);
      // display tables either side of the aisle (2026: dummy phones; 2040: reddy40 dresses them)
      for (const [tx, tz] of [[-4.4, -6], [-4.4, -10], [0.4, -6], [0.4, -10]]) {
        bb(tx - 0.5, 0, tz - 1.15, tx + 0.5, 0.85, tz + 1.15, 0xf1f1f1); bb(tx - 0.56, 0.85, tz - 1.2, tx + 0.56, 0.91, tz + 1.2, WOOD);
        bb(tx - 0.5, 0, tz - 1.15, tx + 0.5, 0.08, tz + 1.15, 0x4a4e55);
        if (E26) {
          for (let k = 0; k < 4; k++) {
            const z = tz - 0.9 + k * 0.6, c = [0x1f2a44, 0xc9ccd1, 0x111111, 0xe9e2d4][(k + (tx > 0 ? 1 : 0)) % 4];
            bb(tx - 0.06, 0.91, z - 0.06, tx + 0.06, 0.95, z + 0.06, 0x3a3d42);
            boxR(0.09, 0.17, 0.012, c, tx + 0.02 * Math.sign(tx), 1.03, z, -0.3, tx > -2 ? -H : H);
            boxR(0.08, 0.15, 0.004, 0x0d1016, tx + (tx > -2 ? -0.005 : 0.005) + 0.02 * Math.sign(tx), 1.035, z, -0.3, tx > -2 ? -H : H);
          }
          boxR(0.16, 0.1, 0.004, 0xffffff, tx, 0.95, tz + 1.05, 0.5, tx > -2 ? -H : H);
        }
        COL.push([tx - 0.6, tz - 1.25, tx + 0.6, tz + 1.25]);
      }
      // accessories wall (left wall): slatwall + rows of hanging packs + low cabinet + a spinner tower
      quad(10.4, 2.1, M.slat, -8.94, 1.4, -7.8, H);
      bb(-9, 2.45, -13, -8.9, 2.75, -2.6, NAVY); bb(-8.9, 2.45, -13, -8.89, 2.49, -2.6, YEL);
      seed = 41;
      const cases = [0x111111, 0x2a3a6a, 0xd93b5b, 0xf2f2f2, 0x6fb1e8, 0xf4c542, 0x3c8d5a, 0x8a5bd6, 0xe98a3c, 0xc9c9c9];
      for (let z = -12.7; z < -2.8; z += 0.34) for (let r = 0; r < 4; r++) {
        if (rnd() < 0.12) continue;
        const y = 0.75 + r * 0.42, c = cases[Math.floor(rnd() * cases.length)];
        bb(-8.94, y + 0.2, z - 0.005, -8.86, y + 0.21, z + 0.005, 0x777777);
        bb(-8.9, y - 0.02, z - 0.09, -8.86, y + 0.2, z + 0.09, 0xf5f5f5); bb(-8.905, y + 0.01, z - 0.07, -8.855, y + 0.15, z + 0.07, c);
      }
      bb(-9, 0, -13, -8.55, 0.5, -2.6, 0xe6e7e9); bb(-8.56, 0.1, -13, -8.55, 0.48, -2.6, 0xd0d3d7);
      for (let z = -12.6; z < -3; z += 0.7) bb(-8.8, 0.5, z, -8.6, 0.62, z + 0.3, [0x222222, 0xf5f5f5, 0x2a3a6a][Math.floor(rnd() * 3)]);
      COL.push([-9, -13, -8.55, -2.6]);
      cyl(0.25, 0.3, 0.08, 10, 0x3a3d42, -6.8, 0.04, -8.8); cyl(0.04, 0.04, 1.8, 6, 0x9aa0a6, -6.8, 0.9, -8.8);
      for (let k = 0; k < 8; k++) { const a = k * PI / 4; for (let r = 0; r < 3; r++) boxR(0.13, 0.19, 0.03, cases[(k + r * 3) % 10], -6.8 + Math.sin(a) * 0.2, 0.75 + r * 0.38, -8.8 + Math.cos(a) * 0.2, 0, a); }
      COL.push([-7.15, -9.15, -6.45, -8.45]);
      // right wall: posters, SIM starter-pack rack, noticeboard (staff side), calendar nail
      const poster = (z, u0) => { const g = new THREE.PlaneGeometry(0.9, 1.35), uv = g.attributes.uv; for (let i = 0; i < 4; i++) uv.setX(i, uv.getX(i) > 0.5 ? u0 + 0.5 : u0); g.rotateY(-H); g.translate(10.97, 1.65, z); put(g, 0xffffff, M.posters); };
      poster(-2.4, 0); poster(-7.6, 0.5);
      bb(10.9, 0.35, -6.35, 11, 2.15, -5.45, 0x9aa0a6); quad(0.8, 1.6, M.sim, 10.89, 1.25, -5.9, -H);
      for (let r = 0; r < 6; r++) for (let k = 0; k < 3; k++) bb(10.8, 1.97 - r * 0.225, -6.16 + k * 0.25, 10.89, 1.98 - r * 0.225, -6.15 + k * 0.25, 0x9aa0a6);
      bb(10.95, 1.05, -12.25, 11, 2.0, -10.95, 0x6b4a2a); quad(1.25, 0.9375, M.notice, 10.945, 1.525, -11.6, -H);
      if (E26) bb(10.97, 1.83, -10.37, 11, 1.85, -10.33, 0x888888);
      else bb(10.985, 1.3, -10.55, 10.995, 1.8, -10.15, 0xf6f8f6);                               // 2040: a pale rectangle where the calendar hung
      // queue-ticket machine by the entrance, NOW SERVING sign over the counter
      cyl(0.18, 0.2, 0.05, 10, 0x3a3d42, 0.8, 0.025, -1.9); cyl(0.05, 0.05, 1.0, 6, 0x9aa0a6, 0.8, 0.55, -1.9);
      bb(0.66, 1.0, -2.08, 0.94, 1.45, -1.72, 0xe9ebee); quad(0.34, 0.34, M.queue, 0.655, 1.24, -1.9, -H); bb(0.62, 1.15, -1.95, 0.66, 1.17, -1.85, 0xf5f5f5);
      COL.push([0.55, -2.15, 1.05, -1.65]);
      bb(4.5, 2.62, -8.4, 6.2, 2.86, -8.3, 0x0a0a0a); label(1.6, 0.2, 6, 5.35, 2.74, -8.295, 0, M.atlasLit);
      bb(4.7, 2.86, -8.36, 4.72, 3.2, -8.34, 0x888888); bb(5.98, 2.86, -8.36, 6.0, 3.2, -8.34, 0x888888);
      // keypad column left of the doors, door mat, brochure stand
      bb(-4.6, 0, -0.35, -4.2, 3.2, 0, WHITE); COL.push([-4.6, -0.35, -4.2, 0]);
      bb(-4.52, 1.28, -0.39, -4.28, 1.62, -0.35, 0xd8dade); quad(0.18, 0.27, M.keypad, -4.4, 1.45, -0.395, PI);
      bb(-2.15, 2.7, -0.17, -1.85, 3.0, -0.14, 0x2a2d33);
      bb(-3.1, 0, -1.9, -0.9, 0.015, -0.3, 0x2d2f33);
      boxR(0.04, 1.4, 0.5, 0xdcdfe3, -5.9, 0.7, -1.4, 0, 0, -0.12); bb(-6.1, 0, -1.7, -5.7, 0.04, -1.1, 0x3a3d42);
      for (let r = 0; r < 3; r++) for (let k = 0; k < 2; k++) { boxR(0.03, 0.08, 0.22, 0xc9ccd1, -5.82 + r * 0.05, 0.42 + r * 0.38, -1.53 + k * 0.26, 0, 0, -0.12); boxR(0.02, 0.28, 0.2, [YEL, 0xffffff, 0x2f6fd6][(r + k) % 3], -5.84 + r * 0.05, 0.56 + r * 0.38, -1.53 + k * 0.26, 0, 0, -0.3); }
      COL.push([-6.15, -1.75, -5.65, -1.05]);
      if (E26) {   // the plastic pot plant (dying), front-right corner (2040: moved to the backroom)
        cyl(0.26, 0.2, 0.5, 10, 0xf2f2f2, 10.3, 0.25, -0.85); cyl(0.22, 0.22, 0.02, 10, 0x4a3a2a, 10.3, 0.49, -0.85);
        for (let k = 0; k < 9; k++) { const a = k * 0.7, r = 0.18 + (k % 3) * 0.08; boxR(0.12, 0.02, 0.5, [0x5f8a3e, 0x7d9a44, 0xb59a4a, 0x8a7a3a][k % 4], 10.3 + Math.sin(a) * r, 0.75 + (k % 3) * 0.28, -0.85 + Math.cos(a) * r, k % 4 === 2 ? 0.9 : 0.3, a); }
        cyl(0.02, 0.02, 1.2, 5, 0x6b5a3a, 10.3, 1.0, -0.85);
        COL.push([9.95, -1.2, 10.65, -0.5]);
      } else cyl(0.27, 0.27, 0.004, 14, 0xc9ccc4, 10.3, 0.012, -0.85);   // its ring stain
      // counter: navy front either side of the glass showcase (x 4.75..6.45, open on the staff side), white top, yellow strip
      const CN = 0x20294a;
      bb(3.25, 0, -9.35, 4.75, 0.95, -8.65, CN); bb(6.45, 0, -9.35, 7.75, 0.95, -8.65, CN);
      bb(4.75, 0, -9.35, 6.45, 0.12, -8.66, CN); bb(4.75, 0.9, -8.72, 6.45, 0.95, -8.66, CN);
      quad(1.7, 0.78, M.glass, 5.6, 0.51, -8.66);                                                // showcase glass front (a clear middle: 1.2's upside-down POV)
      bb(4.76, 0.495, -9.33, 6.44, 0.51, -8.69, 0xdff0f6, M.glass);                              // glass shelf
      bb(3.15, 0.95, -9.45, 7.85, 1.0, -8.55, 0xf4f4f2);
      bb(3.25, 0.7, -8.66, 4.75, 0.78, -8.64, YEL); bb(6.45, 0.7, -8.66, 7.75, 0.78, -8.64, YEL);
      bb(3.25, 0, -8.67, 7.75, 0.1, -8.645, 0x0e1428);
      for (const x of [3.4, 4.05, 6.55, 7.15]) bb(x, 0.5, -9.37, x + 0.55, 0.9, -9.35, 0x2a3358);
      COL.push([3.15, -9.45, 7.85, -8.55]);
      if (E26) {
        for (const [x0, y0] of [[4.82, 0.12], [4.82, 0.51], [6.02, 0.12], [6.02, 0.51]]) for (let k = 0; k < 3; k++) {   // boxed accessories at the showcase's ends
          bb(x0 + k * 0.12, y0, -9.2, x0 + k * 0.12 + 0.1, y0 + 0.16 - (k % 2) * 0.03, -8.85, [0xf2f2f2, 0x2a3a6a, YEL, 0xd93b5b][(k + (x0 > 5 ? 1 : 0) + (y0 > 0.2 ? 2 : 0)) % 4]);
        }
        for (const x of [4.3, 6.4]) {   // JARVIS monitors (screens are the monitor_screen prop), keyboards, mice
          bb(x - 0.11, 1.0, -9.12, x + 0.11, 1.015, -8.95, 0x2a2c30); bb(x - 0.025, 1.0, -9.0, x + 0.025, 1.14, -8.96, 0x2a2c30);
          bb(x - 0.28, 1.12, -9.02, x + 0.28, 1.48, -8.97, DARK);
          bb(x - 0.22, 1.0, -9.34, x + 0.22, 1.02, -9.2, 0x2b2d31); bb(x + 0.27, 1.0, -9.3, x + 0.33, 1.02, -9.22, 0x2b2d31);
        }
        bb(6.85, 1.0, -9.4, 7.3, 1.1, -9.0, 0x3a3d42); bb(7.05, 1.1, -9.15, 7.09, 1.25, -9.1, 0x2a2c30); boxR(0.26, 0.18, 0.02, 0x111317, 7.07, 1.32, -9.12, -0.2);   // till
        boxR(0.08, 0.02, 0.14, 0x1b1d21, 5.35, 1.03, -8.78, 0.3);                                 // EFTPOS
        cyl(0.04, 0.04, 0.1, 8, 0x2a2c30, 3.7, 1.05, -9.25); for (let i = 0; i < 3; i++) cyl(0.004, 0.004, 0.14, 4, [0x2f6fd6, 0xd32f2f, 0x111111][i], 3.69 + i * 0.01, 1.1, -9.25);
        for (let i = 0; i < 5; i++) boxR(0.15, 0.004, 0.21, i % 2 ? YEL : 0xffffff, 3.45, 1.003 + i * 0.004, -8.8, 0, i * 0.05);
        bb(7.44, 1.0, -9.32, 7.66, 1.05, -9.08, 0x2a2c30); bb(7.44, 1.05, -9.32, 7.66, 1.07, -9.27, 0x2a2c30);   // store phone base
        for (let i = 0; i < 9; i++) bb(7.47 + (i % 3) * 0.05, 1.05, -9.25 + Math.floor(i / 3) * 0.045, 7.5 + (i % 3) * 0.05, 1.056, -9.23 + Math.floor(i / 3) * 0.045, 0xd8dadc);
      } else bb(7.44, 1.0, -9.32, 7.66, 1.003, -9.08, 0xfbfbf9);   // 2040: a clean rectangle where the phone sat
      for (const x of [3.45, 7.25]) { cyl(0.19, 0.19, 0.06, 10, 0x1d1f24, x, 0.72, -7.95); cyl(0.03, 0.03, 0.7, 6, 0x9aa0a6, x, 0.36, -7.95); cyl(0.2, 0.2, 0.03, 10, 0x3a3d42, x, 0.015, -7.95); COL.push([x - 0.2, -8.15, x + 0.2, -7.75]); }
      bb(4.5, 0, -10.9, 5.0, 0.45, -10.5, 0x3a3d42);                                             // printer under the staff side
      // the Yes wall graphic behind the counter, the targets board, the floor wall clock above it
      bb(2.75, 0.9, -12.5, 5.35, 3.0, -12.47, NAVY); quad(2.5, 1.875, M.yes, 4.05, 1.95, -12.465);
      bb(7.58, 1.02, -12.5, 9.22, 2.28, -12.47, 0xcfd2d6); quad(1.52, 1.14, M.targets, 8.4, 1.65, -12.465);
      cyl(0.19, 0.19, 0.04, 16, 0x2a2c30, 8.4, 2.62, -12.49, H); quad(0.34, 0.34, M.clock, 8.4, 2.62, -12.466);
      // waiting chairs: x 2.0 / 2.65 / 3.3, facing into the store (2026 black shells on chrome legs; 2040 padded cream)
      for (const x of [2.0, 2.65, 3.3]) {
        at(x, -0.85, PI);
        const sc = E40 ? 0xefe6d2 : 0x1a1b1f, lc = 0xb8bec4;
        for (const [lx, lz] of [[-0.2, -0.18], [0.2, -0.18], [-0.2, 0.18], [0.2, 0.18]]) bb(lx - 0.015, 0, lz - 0.015, lx + 0.015, 0.42, lz + 0.015, lc);
        bb(-0.24, 0.42, -0.22, 0.24, E40 ? 0.5 : 0.465, 0.22, sc);
        boxR(0.46, 0.44, E40 ? 0.08 : 0.04, sc, 0, 0.73, -0.215, -0.12);
        if (E40) { boxR(0.06, 0.2, 0.36, sc, -0.25, 0.6, -0.02); boxR(0.06, 0.2, 0.36, sc, 0.25, 0.6, -0.02); }
        XF = null;
      }
      bb(1.72, 0.36, -0.88, 3.58, 0.39, -0.82, 0x9aa0a6);
      COL.push([1.7, -1.15, 3.6, -0.55]);
    }

    function buildBack() {
      // ====================================================== back of house
      tint = BOH;
      // corridor x 5.4..7.4, z -23.75..-12.75 (the left wall's face x 5.4 carries the Wall, z -19.4..-22)
      quad(2, 11, M.vc, 6.4, 0.01, -18.25, 0, -H, 0x9ca1a6); quad(2, 11, M.ceil, 6.4, 2.7, -18.25, 0, H, 0xd9dcdf);
      wall(5.15, -23.75, 5.4, -12.75, 2.7, 0xe3e6e2); wall(7.4, -23.75, 7.65, -12.75, 2.7, 0xe3e6e2);
      bb(5.4, 0, -23.75, 5.44, 0.1, -12.75, 0x6b7077); bb(7.36, 0, -23.75, 7.4, 0.1, -12.75, 0x6b7077);
      for (const z of [-14.4, -17.0, -19.6, -22.2]) { bb(6.2, 2.62, z - 0.65, 6.6, 2.7, z + 0.65, 0xd9dcdf); bb(6.28, 2.6, z - 0.6, 6.52, 2.62, z + 0.6, 0xffffff, M.light); }
      if (E26) {   // one tall stack of stock boxes by the backroom door (right side: the window's sightline stays clear)
        bb(6.82, 0, -23.7, 7.38, 0.4, -23.05, CARD); bb(6.85, 0.4, -23.65, 7.35, 0.8, -23.1, 0xc49a62); bb(6.87, 0.8, -23.6, 7.33, 1.15, -23.15, CARD);
        COL.push([6.8, -23.75, 7.4, -23.0]);
      }
      cyl(0.08, 0.08, 0.5, 8, 0xc62828, 7.28, 0.6, -15.4); bb(7.36, 1.0, -15.55, 7.4, 1.3, -15.25, 0xc62828);   // extinguisher
      bb(5.4, 1.4, -17.2, 5.47, 1.7, -16.8, 0xf5f5f5); bb(5.465, 1.5, -17.03, 5.475, 1.6, -16.97, 0x2e9d4a); bb(5.465, 1.53, -17.07, 5.475, 1.57, -16.93, 0x2e9d4a);
      cyl(0.18, 0.16, 0.3, 8, YEL, 7.05, 0.15, -19.8); COL.push([6.85, -20.0, 7.25, -19.6]);                // mop bucket
      bb(6.15, 2.22, -23.74, 6.65, 2.38, -23.66, 0x2e9d4a, M.exit);                                          // exit sign
      { const g = new THREE.PlaneGeometry(0.7, 1.05), uv = g.attributes.uv; for (let i = 0; i < 4; i++) uv.setX(i, uv.getX(i) > 0.5 ? 1 : 0.5); g.rotateY(-H); g.translate(7.39, 1.5, -17.8); put(g, 0xffffff, M.posters); }
      // backroom front wall with the door opening (the doorway is a door hotspot: Rue's collider stays)
      wall(2.15, -24, 5.95, -23.75, 2.8, 0xd4dbd2); wall(6.85, -24, 10.65, -23.75, 2.8, 0xd4dbd2); bb(5.95, 2.1, -24, 6.85, 2.8, -23.75, 0xd4dbd2);
      COL.push([5.95, -24, 6.85, -23.75]);
      for (const [x0, x1] of [[5.85, 5.95], [6.85, 6.95]]) { bb(x0, 0, -23.74, x1, 2.15, -23.7, 0xb7c0c8); bb(x0, 0, -24.05, x1, 2.15, -24.0, 0xb7c0c8); }
      bb(5.85, 2.1, -23.74, 6.95, 2.2, -23.7, 0xb7c0c8); bb(5.85, 2.1, -24.05, 6.95, 2.2, -24.0, 0xb7c0c8);
      bb(7.02, 1.3, -23.75, 7.28, 1.6, -23.71, 0x2a2d33);                                                  // the JARVIS panel (spinner prop)
      // backroom x 2.4..10.4, z -30..-24, ceiling 2.8
      quad(8, 6, M.vc, 6.4, 0.01, -27, 0, -H, 0x8e9398); quad(8, 6, M.ceil, 6.4, 2.8, -27, 0, H, 0xcfd0ca);
      for (let x = 3.6; x < 10.4; x += 1.2) bb(x - 0.01, 2.78, -30, x + 0.01, 2.8, -24, 0xb9bab4);
      for (let z = -28.8; z < -24; z += 1.2) bb(2.4, 2.78, z - 0.01, 10.4, 2.8, z + 0.01, 0xb9bab4);
      const BW = 0xcfd6cc;
      wall(2.15, -30, 2.4, -24, 2.8, BW); wall(10.4, -30, 10.65, -24, 2.8, BW);
      bb(2.15, 0, -30.15, 6.6, 2.8, -30.0, BW); bb(8.9, 0, -30.15, 10.65, 2.8, -30.0, BW); bb(6.6, 2.3, -30.15, 8.9, 2.8, -30.0, BW);
      COL.push([2.15, -30.3, 6.6, -30.0]); COL.push([8.9, -30.3, 10.65, -30.0]);
      bb(2.4, 0, -30, 6.6, 0.1, -29.96, 0x6b7077); bb(8.9, 0, -30, 10.4, 0.1, -29.96, 0x6b7077); bb(2.4, 0, -30, 2.44, 0.1, -24, 0x6b7077); bb(10.36, 0, -30, 10.4, 0.1, -24, 0x6b7077);
      // roller door: guides, drum housing over the opening (the shutter is the roller_door prop)
      for (const x of [6.53, 8.97]) bb(x - 0.07, 0, -30.0, x + 0.07, 2.32, -29.93, 0x8a8f94);
      bb(6.45, 2.3, -30.0, 9.05, 2.62, -29.7, 0x9a9fa4); bb(6.42, 2.33, -29.98, 6.47, 2.6, -29.72, 0x7e8388); bb(9.03, 2.33, -29.98, 9.08, 2.6, -29.72, 0x7e8388);
      bb(4.1, 2.7, -29.5, 4.7, 2.78, -28.2, 0xd9dcdf); bb(4.2, 2.68, -29.45, 4.6, 2.7, -28.25, 0xffffff, M.light);   // steady batten over the bench
      bb(6.4, 2.72, -27.6, 6.8, 2.8, -26.0, 0xd9dcdf);                                   // housing of the flickering tube (prop)
      // repair bench along the back wall: pegboard, a meter, an iron, goggles, trays, a lamp (Chase's laptop is a prop)
      bb(2.9, 0.88, -30, 5.9, 0.93, -29.2, 0xa98b62); for (const x of [2.95, 5.8]) bb(x, 0, -29.95, x + 0.06, 0.88, -29.25, 0x55595f);
      bb(2.95, 0.25, -29.95, 5.85, 0.28, -29.25, 0x8a7050);
      quad(2.0, 0.5, M.vc, 4.4, 0.935, -29.55, 0, -H, 0x2f7a5a);
      bb(3.0, 1.1, -30, 5.8, 2.1, -29.97, 0xc9b28a);
      for (let x = 3.2; x < 5.7; x += 0.28) boxR(0.03, 0.22, 0.02, [0xd32f2f, 0x2a2c30, 0xf2c230][Math.floor(x * 7) % 3], x, 1.7 + Math.sin(x * 9) * 0.15, -29.94, 0, 0, 0.2);
      bb(3.0, 0.93, -29.85, 3.32, 1.03, -29.55, 0x3a3d42); cyl(0.02, 0.02, 0.02, 8, 0xd32f2f, 3.16, 1.0, -29.54, H);
      boxR(0.018, 0.018, 0.24, 0x2a2c30, 3.5, 0.95, -29.4, 0, 0.5); cyl(0.004, 0.004, 0.06, 4, 0xc0c0c0, 3.6, 0.95, -29.3, 0.6);
      for (let i = 0; i < 4; i++) bb(4.9 + (i % 2) * 0.2, 0.93, -29.9 + Math.floor(i / 2) * 0.2, 5.08 + (i % 2) * 0.2, 0.97, -29.72 + Math.floor(i / 2) * 0.2, [0xd32f2f, 0x2f6fd6, 0xf2c230, 0x2e9d4a][i]);
      bb(5.3, 0.93, -29.5, 5.42, 0.97, -29.3, 0xf2c230);
      cyl(0.03, 0.05, 0.03, 8, 0x3a3d42, 5.65, 0.945, -29.8); boxR(0.02, 0.5, 0.02, 0x3a3d42, 5.6, 1.18, -29.75, 0, 0, 0.4); cyl(0.08, 0.08, 0.03, 10, 0xe9e9e9, 5.48, 1.42, -29.72, 0, 0.9);
      cyl(0.03, 0.03, 0.03, 8, 0x9fd8e8, 4.55, 0.955, -29.4, H); cyl(0.03, 0.03, 0.03, 8, 0x9fd8e8, 4.62, 0.955, -29.4, H); bb(4.47, 0.945, -29.42, 4.7, 0.96, -29.39, 0x2a2c30);
      COL.push([2.9, -30, 5.9, -29.2]);
      cyl(0.18, 0.18, 0.05, 10, 0x1d1f24, 5.3, 0.65, -28.75); cyl(0.03, 0.03, 0.62, 6, 0x9aa0a6, 5.3, 0.31, -28.75); COL.push([5.1, -28.95, 5.5, -28.55]);   // stool
      cyl(0.19, 0.19, 0.04, 16, 0x2a2c30, 4.4, 2.35, -29.99, H); quad(0.34, 0.34, M.clock, 4.4, 2.35, -29.965);   // the backroom clock (moved over the bench)
      // kitchenette on the right wall: cabinet, benchtop, sink, microwave, cupboard (2026: the mug tree)
      bb(9.8, 0, -29.95, 10.4, 0.88, -27.9, 0xd8d8d0); bb(9.75, 0.88, -29.98, 10.4, 0.92, -27.87, 0x6f6a64);
      bb(9.9, 0.9, -29.88, 10.3, 0.925, -29.48, 0x9aa0a6); cyl(0.015, 0.015, 0.25, 6, 0xc0c0c0, 10.3, 1.05, -29.68); bb(10.18, 1.16, -29.7, 10.32, 1.18, -29.66, 0xc0c0c0);
      bb(9.9, 0.92, -29.38, 10.38, 1.2, -28.93, 0xf0f0f0); bb(9.88, 0.97, -29.36, 9.9, 1.15, -29.05, 0x222222);
      if (E26) {
        cyl(0.01, 0.01, 0.28, 4, 0x6b5a3a, 10.15, 1.06, -28.1); mug(0xd32f2f, 10.08, 0.92, -28.18); mug(0x2f6fd6, 10.22, 0.92, -28.02); mug(0xffffff, 10.25, 0.92, -28.25);
        cyl(0.05, 0.05, 0.14, 8, 0x2a2c30, 9.95, 0.99, -28.05); cyl(0.05, 0.05, 0.12, 8, 0xc0c0c0, 9.95, 0.98, -28.2);
      }
      bb(9.95, 1.55, -29.95, 10.4, 2.15, -27.9, 0xe2e2da); bb(9.94, 1.84, -29.9, 9.95, 1.86, -28.0, 0xb0b0a8);
      COL.push([9.75, -30, 10.4, -27.85]);
      bb(10.3, 1.6, -26.3, 10.4, 1.7, -26.1, 0x3a3d42); bb(9.93, 1.63, -26.43, 10.37, 2.0, -25.97, 0x3b3a38); bb(9.92, 1.64, -26.36, 9.93, 1.98, -26.04, 0x2a2928);   // TV
      bb(9.94, 1.66, -26.18, 9.95, 1.68, -26.15, 0xd32f2f);
      // left wall shelving, a stack of boxes by the door (2026), hooks + a hi-vis vest, the junction box, the light switch
      for (const z of [-28.6, -25.35]) bb(2.4, 0, z - 0.05, 2.95, 2.0, z, 0x7f858c);
      for (let s = 0; s < 4; s++) {
        const y = 0.12 + s * 0.6; bb(2.4, y, -28.65, 2.95, y + 0.03, -25.35, 0x9aa0a6);
        for (let k = 0; k < 5; k++) bb(2.45, y + 0.03, -28.55 + k * 0.66, 2.9, y + 0.03 + 0.25 + ((k + s) % 3) * 0.07, -28.0 + k * 0.66, (k + s) % 4 ? CARD : 0xe9e9e9);
      }
      COL.push([2.4, -28.7, 2.95, -25.3]);
      if (E26) { bb(2.45, 0, -25.15, 3.2, 0.5, -24.1, CARD); bb(2.5, 0.5, -25.1, 3.15, 0.9, -24.15, 0xc49a62); COL.push([2.4, -25.2, 3.25, -24.0]); }
      for (const x of [2.95, 3.2, 3.45]) bb(x, 1.6, -24.03, x + 0.03, 1.66, -23.98, 0x888888);
      boxR(0.36, 0.55, 0.05, 0xff8c1a, 3.2, 1.33, -24.05); bb(3.04, 1.2, -24.09, 3.36, 1.24, -24.07, 0xd8d8d8);
      bb(4.2, 0.87, -24.06, 4.4, 1.03, -24.0, 0x8d9296);                                               // junction box body (lid: jbox_lid)
      for (let i = 0; i < 4; i++) bb(4.24 + i * 0.035, 0.92, -24.065, 4.26 + i * 0.035, 0.98, -24.06, [0xd32f2f, 0x2f6fd6, 0x2e9d4a, 0xf2c230][i]);
      bb(5.64, 1.24, -24.02, 5.76, 1.36, -24.0, 0xeeeeea); bb(5.68, 1.28, -24.025, 5.72, 1.32, -24.02, 0x9a9a96);   // light switch
      bb(9.3, 0, -24.9, 10.05, 0.42, -24.15, CARD); label(0.7, 0.0875, 1, 9.295, 0.3, -24.525, -H);         // lost property
      bb(9.4, 0.42, -24.8, 9.95, 0.44, -24.25, 0x8a7050);
      boxR(0.24, 0.02, 0.1, 0x2f6fd6, 9.55, 0.46, -24.4, 0.1, 0.4); bb(9.75, 0.42, -24.7, 9.8, 0.55, -24.63, 0x7a7e84); ico(0.14, 0x6a4a7a, 9.8, 0.45, -24.35, 0.5);
      COL.push([9.25, -24.95, 10.1, -24.1]);
      quadR(0.3, 0.21, M.wall, RG.dnp, 5.95, 2.775, -26.45, 0, H, E40 ? 0xf0e2b8 : 0xffffff);           // DO NOT PAINT — L. (taped to the ceiling; reads from the door side)
      if (E40) {   // the plastic plant, in a corner now (by the roller door)
        cyl(0.26, 0.2, 0.5, 10, 0xe8e6e0, 9.3, 0.25, -29.55); cyl(0.22, 0.22, 0.02, 10, 0x4a3a2a, 9.3, 0.49, -29.55);
        for (let k = 0; k < 9; k++) { const a = k * 0.7, r = 0.18 + (k % 3) * 0.08; boxR(0.12, 0.02, 0.5, [0x7a7a40, 0x8a8040, 0xa08a48, 0x7a6a3a][k % 4], 9.3 + Math.sin(a) * r, 0.75 + (k % 3) * 0.28, -29.55 + Math.cos(a) * r, k % 4 === 2 ? 1.1 : 0.45, a); }
        cyl(0.02, 0.02, 1.2, 5, 0x6b5a3a, 9.3, 1.0, -29.55);
        COL.push([9.0, -29.85, 9.6, -29.25]);
      }
      // Luke's office x 7.65..11, z -17..-12.75: carpet, desk, filing cabinet, whiteboard, bookshelf, light
      quad(3.35, 4.25, M.vc, 9.325, 0.012, -14.875, 0, -H, 0x566173); quad(3.35, 4.25, M.ceil, 9.325, 2.7, -14.875, 0, H, 0xd9dcdf);
      wall(7.4, -17.25, 11.25, -17, 2.7, 0xe4e0d6); bb(9.0, 2.68, -15.6, 9.8, 2.7, -14.4, 0xffffff, M.light);
      bb(8.7, 0.72, -15.9, 10.1, 0.77, -15.1, 0x8a6a4a); bb(8.75, 0, -15.85, 8.81, 0.72, -15.15, 0x6a5038); bb(10.0, 0, -15.85, 10.06, 0.72, -15.15, 0x6a5038);
      bb(8.81, 0.2, -15.85, 10.0, 0.7, -15.8, 0x6a5038);
      bb(9.0, 0.77, -15.7, 9.5, 1.12, -15.66, DARK); bb(9.2, 0.77, -15.68, 9.3, 0.9, -15.6, DARK); bb(9.02, 0.79, -15.69, 9.48, 1.1, -15.655, 0x223a66);
      bb(8.9, 0.77, -15.45, 9.4, 0.79, -15.3, 0x2b2d31); mug(0xf4f4f0, 9.8, 0.77, -15.35);
      bb(9.55, 0.77, -15.75, 9.75, 0.82, -15.55, 0x2a2c30); boxR(0.06, 0.03, 0.2, 0x2a2c30, 9.68, 0.835, -15.62, 0, 0.3);   // the desk phone
      for (let i = 0; i < 3; i++) boxR(0.21, 0.01, 0.3, 0xf8f8f8, 8.95, 0.775 + i * 0.01, -15.5, 0, i * 0.12);
      COL.push([8.7, -15.9, 10.1, -15.1]);
      bb(7.68, 0, -13.45, 8.28, 1.3, -12.8, 0x9aa0a6); for (let i = 0; i < 4; i++) bb(8.28, 0.12 + i * 0.3, -13.35, 8.3, 0.36 + i * 0.3, -12.9, 0xb0b5ba);
      COL.push([7.65, -13.5, 8.3, -12.75]);
      bb(7.65, 1.1, -16.2, 7.7, 2.0, -14.6, 0xf5f5f5); for (let i = 0; i < 5; i++) bb(7.7, 1.8 - i * 0.14, -16.0, 7.71, 1.82 - i * 0.14, -15.0 + (i % 2) * 0.3, 0x2f6fd6);
      bb(10.95, 0, -16.9, 11, 1.8, -15.9, 0x6a5038); bb(10.62, 0, -16.9, 11, 1.8, -16.86, 0x8a6a4a); bb(10.62, 0, -15.94, 11, 1.8, -15.9, 0x8a6a4a);
      for (let s = 0; s < 4; s++) bb(10.62, 0.05 + s * 0.55, -16.86, 11, 0.08 + s * 0.55, -15.94, 0x8a6a4a);
      for (let s = 0; s < 3; s++) for (let k = 0; k < 7; k++) bb(10.7, 0.08 + s * 0.55, -16.82 + k * 0.12, 10.93, 0.38 + s * 0.55 - (k % 3) * 0.04, -16.72 + k * 0.12, [0x2f6fd6, 0xd32f2f, 0x141d3a, YEL, 0xf2f2f2][(k + s) % 5]);
      bb(8.2, 1.4, -16.99, 8.9, 1.9, -16.97, 0x8a6a4a); bb(8.25, 1.45, -16.97, 8.85, 1.85, -16.96, 0xf4efe0); bb(8.4, 1.6, -16.96, 8.7, 1.7, -16.955, YEL);
      COL.push([10.6, -16.95, 11, -15.85]);
    }

    // ======================================================== props (dynamic, named; nothing is created after build)
    const P = (g) => (R.root.add(g), g);
    const geoOf = (fn) => part('', fn, null, 0, { floor: false }).children[0].geometry;   // a one-material shape for instancing
    // dynamic colliders (arrays mutated in place; parked far away when off)
    const C = { table: [PARK, PARK, PARK, PARK], posts: [[], [], [], []].map(() => [PARK, PARK, PARK, PARK]), tree: [PARK, PARK, PARK, PARK],
      ladder: [PARK, PARK, PARK, PARK], roller: [PARK, PARK, PARK, PARK], gate: [PARK, PARK, PARK, PARK], bdoor: [PARK, PARK, PARK, PARK] };

    function propsFloor() {
      tint = IN;
      // front doors: glass leaves in an aluminium frame; the door sign hangs on the right leaf
      const leaf = () => { quad(1.02, 2.4, M.glass, 0, 1.3, 0); bb(-0.55, 0.05, -0.03, 0.55, 0.12, 0.03, 0xa8adb3); bb(-0.55, 2.5, -0.03, 0.55, 2.56, 0.03, 0xa8adb3); bb(0.49, 0.05, -0.03, 0.55, 2.56, 0.03, 0xa8adb3); bb(-0.55, 0.05, -0.03, -0.49, 2.56, 0.03, 0xa8adb3); };
      R.doorL = P(part('door_l', leaf, [-2.55, 0, -0.16])); R.doorR = P(part('door_r', leaf, [-1.45, 0, -0.16]));
      R.doorHold = null; R.doorT = 0;
      R.doorL.userData.hold = (v) => { R.doorHold = v === true || v === false ? v : null; if (skipping() && R.doorHold !== null) R.doorT = R.doorHold ? 1 : 0; };
      R.sign = part('door_sign', () => { bb(-0.005, 0.33, -0.004, 0.005, 0.5, 0.004, 0x333333); }, [0, 1.25, 0]);
      R.signC = part('', () => { quad(0.34, 0.17, M.closed, 0, 0.25, 0.006); quad(0.34, 0.17, M.closed, 0, 0.25, -0.006, PI); });
      R.signO = part('', () => { quad(0.34, 0.17, M.open, 0, 0.25, 0.006); quad(0.34, 0.17, M.open, 0, 0.25, -0.006, PI); });
      R.sign.add(R.signC, R.signO); R.doorR.add(R.sign);
      R.sign.userData.set = (open) => { R.signOpen = !!open; R.signO.visible = !!open; R.signC.visible = !open; R.sign.rotation.y = 0; R.flipT = 1; };
      R.sign.userData.flip = () => { if (skipping()) R.sign.userData.set(!R.signOpen); else { R.flipT = 0; R.flipTo = !R.signOpen; } };
      R.sign.userData.set(true); R.flipT = 1;
      // JARVIS spinners on the door panels (the front door's, and the backroom door's: "the door takes nine seconds")
      R.spins = [];
      for (const [x, y, z, ry] of [[-2.0, 2.85, -0.175, PI], [7.15, 1.45, -23.705, 0]]) R.spins.push(P(part('', () => quad(0.2, 0.2, M.spin, 0, 0, 0), [x, y, z], ry, { floor: false })));
      if (E26) {
        // the counter monitors share one canvas: show('xmas' | 'app' | 'off' | 'loading' | 'ready' | 'crash')
        R.mon = P(part('monitor_screen', () => { for (const x of [4.3, 6.4]) quad(0.52, 0.325, M.mon, x, 1.3, -9.025, PI); }, null, 0, { floor: false }));
        R.monMode = '';   // the shared canvas may hold another mode from an earlier build: the first show() repaints
        R.mon.userData.show = (mode) => { if (mode === R.monMode) return; R.monMode = mode; paintMonitor(T.mon.image.getContext('2d'), 256, 160, mode); T.mon.needsUpdate = true; };
        // the store phone's handset (content lifts it; ring(on) jiggles it)
        R.phoneH = P(part('store_phone', () => { box(0.06, 0.04, 0.2, 0x2a2c30, 0, 0, 0); box(0.07, 0.05, 0.05, 0x2a2c30, 0, -0.005, 0.08); box(0.07, 0.05, 0.05, 0x2a2c30, 0, -0.005, -0.08); }, [7.55, 1.05, -9.2], 0, { floor: false }));
        // ring(on, { sfx: 'phone_ring' | 'trill', every: 2.5, vol: 0.32, max }): with the options the set also plays the
        // ring at the phone every `every` s (first at once; never while skipping); without them it only jiggles (as before)
        R.phoneH.userData.ring = (on, o) => {
          R.phoneRing = !!on; R.phoneSnd = null;
          if (on && o && o.sfx) { R.phoneSnd = { name: o.sfx, every: o.every || 2.5, max: o.max ?? Infinity, o: { vol: o.vol ?? 0.32, at: [7.55, 1.05, -9.2] } }; R.phoneT = 0; R.phoneN = 0; }
        };
        R.phoneRing = false; R.phoneSnd = null; R.phoneT = 0; R.phoneN = 0;
        // the till's open cash drawer (A1/B1: Luke doing the count)
        R.cash = P(part('cash_tray', () => {
          bb(-0.2, -0.08, -0.5, 0.2, -0.01, -0.12, 0x3a3d42); bb(-0.19, -0.06, -0.49, 0.19, -0.015, -0.13, 0x22252a);
          for (let k = 0; k < 4; k++) bb(-0.17 + k * 0.09, -0.04, -0.47, -0.1 + k * 0.09, -0.012, -0.32, [0x5aa36a, 0x3a86c8, 0xe0904a, 0xc85a8a][k]);
          for (let k = 0; k < 5; k++) cyl(0.025, 0.025, 0.02, 8, 0xb8a060, -0.15 + k * 0.075, -0.03, -0.22);
        }, [7.05, 1.0, -9.25], 0, { floor: false }));
        // the calendar on the right wall: set(day, month, weekday, year)
        R.cal = P(part('calendar', () => quad(0.4, 0.5, M.cal, 0, 0, 0, -H), [10.965, 1.55, -10.35], 0, { floor: false }));
        R.calKey = '';
        R.cal.userData.set = (day, mon, wd, year = 2026) => {
          const k = day + mon + wd + year; if (k === R.calKey) return; R.calKey = k;
          paintCal(T.cal.image.getContext('2d'), 128, 160, day, mon, wd, year); T.cal.needsUpdate = true;
        };
        R.aframe = P(part('aframe_sign', () => aframeModel(), [-4.9, 0, 1.3], 0.15));
      }
      // the store radio at the counter's right end (2040: the dusty old counter speaker, the 1.6 lure source)
      R.radio = P(part('store_radio', () => {
        const bc = E40 ? 0xa8a49c : 0xc9ccd1;
        box(0.4, 0.2, 0.16, bc, 0, 0, 0); bb(-0.2, 0, -0.08, 0.2, 0.025, 0.08, 0x3a3d42);
        for (const x of [-0.12, 0.12]) cyl(0.07, 0.07, 0.006, 12, 0x2a2c30, x, 0.095, 0.082, H);
        bb(-0.05, 0.155, 0.079, 0.05, 0.19, 0.082, 0x1a1b1e);
        rod(-0.15, 0.2, 0, -0.15, 0.27, 0, 0.02, 0x3a3d42); rod(0.15, 0.2, 0, 0.15, 0.27, 0, 0.02, 0x3a3d42); rod(-0.16, 0.27, 0, 0.16, 0.27, 0, 0.026, 0x3a3d42);
        rod(0.17, 0.2, -0.05, 0.31, 0.58, -0.11, 0.008, 0xb8bec4);
        for (let k = 0; k < 4; k++) bb(-0.16 + k * 0.035, 0.2, -0.04, -0.14 + k * 0.035, 0.212, 0.0, k === 1 ? 0xd32f2f : 0x5a5e63);
      }, [7.55, 1.0, -8.78], 0, { floor: false }));
      R.cones = [-0.12, 0.12].map((x) => { const c = part('', () => { cyl(0.058, 0.03, 0.02, 10, 0x1a1b1e, 0, 0, 0, H); cyl(0.018, 0.018, 0.012, 8, 0x3a3d42, 0, 0, 0.008, H); }, [x, 0.095, 0.09], 0, { floor: false }); R.radio.add(c); return c; });
      R.lcd = {
        fm: part('', () => quadR(0.1, 0.025, M.xmasLit, RG.lcdFM, 0, 0.1725, 0.083), null, 0, { floor: false }),
        aux: part('', () => quadR(0.1, 0.025, M.xmasLit, RG.lcdAUX, 0, 0.1725, 0.083), null, 0, { floor: false }),
        off: part('', () => quadR(0.1, 0.025, M.xmas, RG.lcdOff, 0, 0.1725, 0.083), null, 0, { floor: false }),
      };
      R.radio.add(R.lcd.fm, R.lcd.aux, R.lcd.off);
      R.radio.userData.playing = false; R.radioLcd = '';
      // Luke's office door (four lines) and the backroom door (window, kick plate; the JARVIS spinner on the corridor side)
      R.odoor = P(part('office_door', () => {
        bb(0, 0, -0.025, 1.0, 2.18, 0.025, 0xc8b89a); bb(0.85, 1.0, 0.025, 0.93, 1.04, 0.07, 0xb0b5ba); bb(0.85, 1.0, -0.07, 0.93, 1.04, -0.025, 0xb0b5ba);
        bb(0.315, 1.32, 0.025, 0.685, 1.78, 0.029, 0xe8e8e6);
        quad(0.36, 0.45, M.office, 0.5, 1.55, 0.031);
      }, [9.4, 0, -12.62]));
      R.chair = P(chairModel('swivel_chair')); R.chair.position.set(9.25, 0, -16.35);
      tint = BOH;
      R.bdoor = P(part('backroom_door', () => {
        const c = 0xb7c2cc;
        bb(0, 0, -0.025, 0.9, 1.3, 0.025, c); bb(0, 1.75, -0.025, 0.9, 2.08, 0.025, c); bb(0, 1.3, -0.025, 0.3, 1.75, 0.025, c); bb(0.6, 1.3, -0.025, 0.9, 1.75, 0.025, c);
        quad(0.3, 0.45, M.glass, 0.45, 1.525, 0); bb(0.02, 0.02, 0.025, 0.88, 0.3, 0.03, 0x9aa0a6); bb(0.76, 1.0, 0.025, 0.84, 1.04, 0.07, 0xb0b5ba); bb(0.76, 1.0, -0.07, 0.84, 1.04, -0.025, 0xb0b5ba);
      }, [5.95, 0, -23.87]));
      R.reqT = -1; R.bangT = -1;
      R.bdoor.userData.request = () => { if (skipping()) { R.bdoor.userData.open = true; R.bdoor.rotation.y = 1.5; R.reqT = -1; } else R.reqT = 0; };
      R.bdoor.userData.bang = () => { R.bdoor.userData.open = true; if (skipping()) { R.bdoor.rotation.y = 1.5; R.bangT = -1; } else R.bangT = 0; };
      // solid(on = true): while the door is shut (not open, swung < 0.9 rad) a live collider fills the doorway; off by
      // default and on every dress (as before: the shut door doesn't block)
      R.bdoorSolid = false; R.bdoor.userData.solid = (on = true) => { R.bdoorSolid = !!on; };
      R.straightener = P(straightenerModel('straightener')); R.straightener.position.set(9.6, 0.42, -24.55); R.straightener.rotation.set(0.5, 0.6, 0);
    }

    // the Hero Table (centre (5.6, -5.3)): intact body, four phones, decals, glint; the wreck, tethers, beacon, flash, shards
    const PHONE_HOME = [[-0.6, 0.95, 0], [-0.2, 0.95, 0], [0.2, 0.95, 0], [0.6, 0.95, 0]];
    const PHONE_LAND = [[-0.7, 0.05, -5.0, -H + 0.08, 2.1], [-4.3, 0.05, -1.1, -H - 0.05, -0.7]];   // (4.9, -10.3) behind the counter, (1.3, -6.4) by the display table
    const NSH = 80, SH = new Float32Array(NSH * 12);   // shards: start xyz, rest xyz, arc, yaw, scale, tumble xyz
    function propsHero() {
      tint = IN;
      const TX = 5.6, TZ = -5.3, CH = 0xdfe3e7;
      R.table = P(new THREE.Group()); R.table.name = 'hero_table'; R.table.position.set(TX, 0, TZ);
      R.tBody = part('hero_body', () => {
        bb(-0.7, 0, -0.35, 0.7, 0.08, 0.35, YEL);
        bb(-0.72, 0.08, -0.37, 0.72, 0.73, 0.37, 0xf6f6f4);
        bb(-0.8, 0.73, -0.45, 0.8, 0.76, 0.45, 0xeeeeec);
        for (const sx of [-1, 1]) for (const sz of [-1, 1]) bb(sx * 0.8 - 0.012, 0.73, sz * 0.45 - 0.012, sx * 0.8 + 0.012, 0.95, sz * 0.45 + 0.012, CH);
        bb(-0.81, 0.935, -0.462, 0.81, 0.958, -0.44, CH); bb(-0.81, 0.935, 0.44, 0.81, 0.958, 0.462, CH);
        bb(-0.812, 0.935, -0.45, -0.79, 0.958, 0.45, CH); bb(0.79, 0.935, -0.45, 0.812, 0.958, 0.45, CH);
        bb(-0.62, 0.76, -0.16, -0.38, 0.84, 0.14, 0xf4f4f4); bb(-0.6, 0.84, -0.14, -0.4, 0.845, 0.12, YEL);   // boxed things in the vitrine
        bb(0.36, 0.76, -0.13, 0.62, 0.81, 0.13, 0x22305a);
        for (let i = 0; i < 4; i++) cyl(0.016, 0.016, 0.02, 8, 0x111111, -0.6 + i * 0.4, 0.94, 0.02);         // grommets
        quad(1.6, 0.17, M.glass, 0, 0.845, 0.45); quad(1.6, 0.17, M.glass, 0, 0.845, -0.45, PI);
        quad(0.9, 0.17, M.glass, 0.8, 0.845, 0, H); quad(0.9, 0.17, M.glass, -0.8, 0.845, 0, -H);
        bb(-0.8, 0.93, -0.45, 0.8, 0.95, 0.45, 0xe8f4f8, M.glass);
        for (let i = 0; i < 4; i++) rod(-0.6 + i * 0.4, 0.93, 0.02, -0.6 + i * 0.4 + 0.02, 0.765, 0.06, 0.01, 0x111111);   // tethers drop through the grommets
      });
      R.table.add(R.tBody);
      const PHC = [0x3a3d42, 0xc9ccd1, 0x1f6fe0, 0xf0ead8];
      R.tPhones = PHONE_HOME.map((h, i) => {
        const ph = part('hero_phone_' + (i + 1), () => {
          cyl(0.045, 0.05, 0.02, 10, 0x15161a, 0, 0.01, 0);
          const th = 0.35, cy = 0.02 + 0.075 * Math.cos(th), cz = -0.075 * Math.sin(th);
          boxR(0.075, 0.15, 0.009, PHC[i], 0, cy, cz, -th);
          quad(0.066, 0.135, M.phone, 0, cy + 0.005 * Math.sin(th), cz + 0.005 * Math.cos(th), 0, -th);
        }, h, 0, { floor: false });
        R.table.add(ph); return ph;
      });
      R.smudge = part('hero_smudge', () => quadR(1.56, 0.86, M.smudge, RG.smudge, 0, 0.953, 0, 0, -H), null, 0, { floor: false });
      R.smudge1 = part('hero_smudge1', () => quadR(0.07, 0.07, M.smudge, RG.smudge1, 0.45, 0.954, 0.2, 0.3, -H), null, 0, { floor: false });
      R.hand = part('hero_handprint', () => quadR(0.17, 0.17, M.smudge, RG.hand, 0.35, 0.955, 0.15, 0.5, -H), null, 0, { floor: false });
      R.glint = part('hero_glint', () => boxR(0.05, 0.003, 1.0, 0xffffff, 0, 0.957, 0, 0, 0.45, 0, M.glint), null, 0, { floor: false });
      for (const o of [R.smudge, R.smudge1, R.hand, R.glint]) { o.renderOrder = 2; R.table.add(o); }
      R.glint.visible = false; R.glintT = -1;
      // the wreck: a cracked-open plinth stub, four bent chrome posts, a scorched floor, phone fragments (the figure stands in it)
      R.postTops = [];
      R.wreck = P(part('hero_wreck', () => {
        seed = 71;
        quad(2.8, 2.8, M.scorch, 0, 0.014, 0, 0.6, -H);
        bb(-0.66, 0.0, -0.31, 0.66, 0.012, 0.31, 0x2a2622);
        const run = (ax, az, bx, bz, n) => { for (let k = 0; k < n; k++) { if (rnd() < 0.22) continue; const u0 = k / n, u1 = (k + 0.8) / n, h = 0.1 + rnd() * 0.25;
          const x0 = ax + (bx - ax) * u0, z0 = az + (bz - az) * u0, x1 = ax + (bx - ax) * u1, z1 = az + (bz - az) * u1;
          bb(Math.min(x0, x1) - 0.02, 0, Math.min(z0, z1) - 0.02, Math.max(x0, x1) + 0.02, h, Math.max(z0, z1) + 0.02, 0xe8e8e4);
          bb(Math.min(x0, x1) - 0.021, h, Math.min(z0, z1) - 0.021, Math.max(x0, x1) + 0.021, h + 0.015, Math.max(z0, z1) + 0.021, 0x2a2622);
          bb(Math.min(x0, x1) - 0.022, 0, Math.min(z0, z1) - 0.022, Math.max(x0, x1) + 0.022, 0.06, Math.max(z0, z1) + 0.022, YEL); } };
        run(-0.72, 0.37, 0.72, 0.37, 6); run(-0.72, -0.37, 0.72, -0.37, 6); run(-0.72, -0.37, -0.72, 0.37, 3); run(0.72, -0.37, 0.72, 0.37, 3);
        for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
          const cx = sx * 0.74, cz = sz * 0.39, kx = cx * 1.04 + sx * 0.02, kz = cz * 1.08, tx = cx * 1.16 + (rnd() - 0.5) * 0.1, tz = cz * 1.3 + (rnd() - 0.5) * 0.1;
          rod(cx, 0, cz, kx, 0.3, kz, 0.03, CH); rod(kx, 0.3, kz, tx, 0.55, tz, 0.03, CH);
          R.postTops.push([tx, 0.55, tz]);
        }
        for (let i = 0; i < 8; i++) {
          let a = rnd() * TAU, r = 0.9 + rnd() * 2.1, x = Math.sin(a) * r, z = Math.cos(a) * r;
          if (z < -3.0) z = -3.0 + rnd() * 0.4;
          boxR(0.05 + rnd() * 0.05, 0.008, 0.04 + rnd() * 0.06, [0x1a1c20, 0x2a2d33, 0x15161a][i % 3], x, 0.006, z, 0, rnd() * TAU);
        }
        for (let i = 0; i < 14; i++) { const a = rnd() * TAU, r = 0.4 + rnd() * 1.2; boxR(0.03 + rnd() * 0.04, 0.006, 0.02 + rnd() * 0.03, 0xd8eef6, Math.sin(a) * r, 0.005, Math.cos(a) * r, 0, rnd() * TAU); }
      }, [TX, 0, TZ]));
      // four tethers hang from the bent posts' tops, alarm pucks on the ends: swing(amp), alarm(on)
      R.tethers = P(new THREE.Group()); R.tethers.name = 'hero_tethers'; R.tethers.position.set(TX, 0, TZ);
      R.tPiv = R.postTops.map((p, i) => {
        const g = new THREE.Group(); g.position.set(p[0], p[1], p[2]);
        g.add(part('', () => {
          rod(0, 0, 0, 0.015, -0.2, 0.01, 0.014, 0x15161a); rod(0.015, -0.2, 0.01, -0.01, -0.42, 0.0, 0.014, 0x15161a);
          box(0.045, 0.028, 0.06, 0x2a2c30, -0.01, -0.47, 0); box(0.016, 0.01, 0.016, 0xff2010, -0.01, -0.443, 0.012, 0, M.puck);
        }, null, 0, { floor: false }));
        R.tethers.add(g); return g;
      });
      R.swingA = 0; R.alarmOn = false;
      R.tethers.userData.swing = (amp = 0.9) => { R.swingA = amp; };
      R.tethers.userData.alarm = (on) => { R.alarmOn = !!on; };
      R.looseT = P(part('tether_loose', () => {
        for (let k = 0; k < 9; k++) { const a = k * 0.8, b2 = (k + 1) * 0.8, r = 0.07 + k * 0.006; rod(Math.cos(a) * r, 0.01, Math.sin(a) * r, Math.cos(b2) * (r + 0.006), 0.01, Math.sin(b2) * (r + 0.006), 0.012, 0x15161a); }
        rod(0.12, 0.01, 0.0, 0.3, 0.01, 0.08, 0.012, 0x15161a); box(0.045, 0.026, 0.06, 0x2a2c30, 0.32, 0.0, 0.09); box(0.016, 0.01, 0.016, 0xff2010, 0.32, 0.026, 0.1, 0, M.puck);
      }, [6.3, 0.0, -10.1], 0.4, { floor: false }));
      // Rue's alarm beacon, now hanging over the table: on(bool)
      R.beacon = P(part('alarm_beacon', () => {
        rod(0, 0.1, 0, 0, 0.0, 0, 0.02, 0x2a2c30);
        cyl(0.1, 0.12, 0.05, 10, 0x2a2c30, 0, -0.02, 0); ico(0.09, 0xff2a1a, 0, -0.09, 0, 1.1, M.beacon);
      }, [TX, 3.1, TZ], 0, { floor: false }));
      R.beams = part('', () => { quad(0.9, 0.12, M.beam, 0.45, 0, 0, 0, H); quad(0.9, 0.12, M.beam, -0.45, 0, 0, 0, H); }, [0, -0.09, 0], 0, { floor: false });
      R.beacon.add(R.beams); R.beams.visible = false; R.beaconOn = false;
      R.beacon.userData.on = (on) => { R.beaconOn = !!on; };
      R.flash = P(part('blast_flash', () => ico(1, 0xffffff, 0, 0, 0, 1, M.blast), [TX, 0.95, TZ], 0, { floor: false }));
      R.flash.visible = false; R.flash.scale.setScalar(0.01);
      // glass shards: 80 instances, ballistic during the blast only (start / rest / arc precomputed here, once)
      const sg = new THREE.BufferGeometry();
      sg.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0.012, 0, 0.04, 0.038, 0, 0.012], 3)); sg.computeVertexNormals();
      sg.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 0, 1, 1, 0], 2)); bakeLight(sg, { floor: false });
      R.shards = P(new THREE.InstancedMesh(sg, M.shard, NSH)); R.shards.name = 'glass_shards';
      R.shards.instanceMatrix.setUsage(THREE.DynamicDrawUsage); R.shards.frustumCulled = false;
      seed = 83;
      for (let i = 0; i < NSH; i++) {
        const o = i * 12;
        SH[o] = TX + (rnd() - 0.5) * 1.5; SH[o + 1] = 0.95; SH[o + 2] = TZ + (rnd() - 0.5) * 0.8;
        let x, y = 0.004, z, arc;
        if (i < 50) {
          const a = rnd() * TAU, r = 0.95 + rnd() * 2.55; x = TX + Math.sin(a) * r; z = TZ + Math.cos(a) * r; arc = 0.3 + rnd() * 0.9;
          if (x > 3.1 && x < 7.9 && z < -8.5) z = -8.4 + rnd() * 0.3;
        } else if (i < 59) { x = 3.4 + rnd() * 4.2; y = 1.004; z = -9.35 + rnd() * 0.7; arc = 1.0 + rnd() * 0.6; }
        else if (i < 68) { x = 3.5 + rnd() * 4.0; z = -10.6 + rnd() * 1.0; arc = 1.4 + rnd() * 0.5; }
        else { const a = rnd() * TAU, r = rnd() * 0.7; x = 5.6 + Math.sin(a) * r; z = -10.35 + Math.cos(a) * r * 0.8; arc = 1.5 + rnd() * 0.4; }
        SH[o + 3] = x; SH[o + 4] = y; SH[o + 5] = z; SH[o + 6] = arc; SH[o + 7] = rnd() * TAU; SH[o + 8] = 0.6 + rnd() * 0.9;
        SH[o + 9] = (rnd() - 0.5) * 30; SH[o + 10] = (rnd() - 0.5) * 30; SH[o + 11] = (rnd() - 0.5) * 30;
      }
      R.blastT = -1;
      // shrink-wrap over the new table (A1/B1 split): a puffy translucent box, two tape strips, a FRAGILE sticker
      R.wrapP = P(part('hero_wrap', () => {
        const g = new THREE.BoxGeometry(1.7, 1.0, 1.0, 6, 4, 4), p = g.attributes.position;
        seed = 91;
        for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), k = 1 + 0.035 * Math.sin(x * 9 + y * 7) * Math.cos(z * 8) + (rnd() - 0.5) * 0.02; p.setXYZ(i, x * k, y * (1 + (y > 0 ? 0.02 : 0)), z * k); }
        g.translate(0, 0.5, 0); put(g, 0xffffff, M.wrap);
        bb(-0.025, 1.0, -0.515, 0.025, 1.026, 0.515, 0xc9a46a); bb(-0.025, 0.25, -0.516, 0.025, 1.0, -0.505, 0xc9a46a); bb(-0.025, 0.25, 0.505, 0.025, 1.0, 0.516, 0xc9a46a);
        bb(-0.865, 1.0, -0.025, 0.865, 1.024, 0.025, 0xc9a46a); bb(-0.866, 0.3, -0.025, -0.855, 1.0, 0.025, 0xc9a46a); bb(0.855, 0.3, -0.025, 0.866, 1.0, 0.025, 0xc9a46a);
        quadR(0.2, 0.1, M.xmas, RG.fragile, 0.45, 0.62, 0.515, 0, 0, 0xffffff);
      }, [TX, 0, TZ]));
      R.heap = P(part('plastic_heap', () => {
        seed = 93; for (let i = 0; i < 7; i++) ico(0.12 + rnd() * 0.12, 0xe6eef4, (rnd() - 0.5) * 0.7, 0.05, (rnd() - 0.5) * 0.5, 0.35);
        bb(-0.2, 0, -0.1, 0.25, 0.01, -0.06, 0xa8844e);
      }, [6.7, 0, -4.3]));
      R.table.userData.set = setTable;
      R.table.userData.glint = () => { if (skipping()) return; R.glintT = 0; R.glint.visible = true; R.glint.position.x = -0.8; };
      R.table.userData.handprint = (on) => { R.hand.visible = !!on; };
      R.table.userData.smudge1 = (on) => { R.smudge1.visible = !!on; };
      // smudge1At(x, z, scale = 1): the one fingerprint's centre to world (x, z) at `scale` (1.1 uses ×2.4: a 7 cm print
      // reads as a smudge from 1.5 m); smudge1At(null) puts it home. Placement only: show it with smudge1(true).
      R.table.userData.smudge1At = (x, z, sc = 1) => {
        if (x == null) { R.smudge1.position.set(0, 0, 0); R.smudge1.scale.set(1, 1, 1); return; }
        R.smudge1.scale.set(sc, 1, sc); R.smudge1.position.set(x - R.table.position.x - 0.45 * sc, 0, z - R.table.position.z - 0.2 * sc);
      };
      R.table.userData.blast = blast;
    }
    function setTable(st, o = {}) {
      const intact = st === 'smudged' || st === 'spotless' || st === 'new' || st === 'new_wrapped', wrecked = st === 'wrecked';
      R.tableState = st;
      R.tBody.visible = intact;
      for (let i = 0; i < 4; i++) {
        const ph = R.tPhones[i], h = PHONE_HOME[i];
        ph.position.set(h[0], h[1], h[2]); ph.rotation.set(0, 0, 0);
        ph.visible = st === 'smudged' || st === 'spotless' || st === 'new';
        if (wrecked && i < 2) { const l = PHONE_LAND[i]; ph.visible = true; ph.position.set(l[0], l[1], l[2]); ph.rotation.set(l[3], l[4], 0); }
      }
      R.smudge.visible = st === 'smudged';
      R.smudge1.visible = st === 'new' && o.smudge1 !== false;
      R.hand.visible = false; R.glint.visible = false; R.glintT = -1;
      R.wreck.visible = wrecked; R.tethers.visible = wrecked; R.shards.visible = wrecked;
      R.wrapP.visible = st === 'new_wrapped';
      if (intact) setBox(C.table, 4.75, -5.8, 6.45, -4.8); else park(C.table);
      for (let i = 0; i < 4; i++) { const c = C.posts[i], p = R.postTops[i]; if (wrecked) setBox(c, 5.6 + p[0] * 0.85 - 0.07, -5.3 + p[2] * 0.85 - 0.07, 5.6 + p[0] * 0.85 + 0.07, -5.3 + p[2] * 0.85 + 0.07); else park(c); }
      if (wrecked) shardsAt(1); else R.blastT = -1;
    }
    function shardsAt(u) {   // u 0..1 along the flight (1 = at rest); allocation-free
      const k = u >= 1 ? 1 : u * (2 - u);
      for (let i = 0; i < NSH; i++) {
        const o = i * 12;
        sV.set(SH[o] + (SH[o + 3] - SH[o]) * k, SH[o + 1] + (SH[o + 4] - SH[o + 1]) * u + 4 * SH[o + 6] * u * (1 - u), SH[o + 2] + (SH[o + 5] - SH[o + 2]) * k);
        const tu = 1 - u;
        sE.set(SH[o + 9] * tu * 0.1 + 0.05 * Math.sin(i), SH[o + 7] + SH[o + 10] * tu * 0.1, SH[o + 11] * tu * 0.1);
        sQ.setFromEuler(sE); sS.setScalar(SH[o + 8]);
        R.shards.setMatrixAt(i, sM.compose(sV, sQ, sS));
      }
      R.shards.instanceMatrix.needsUpdate = true;
    }
    // 1.2 step 16: the Hero Table blows apart (1.2 s); leaves the set in `wrecked` (the radio keeps playing: the music is content's)
    function blast(o = {}) {   // o.tree === false: the tree stays up (content fells it itself, e.g. at a real-time wide)
      setTable('wrecked'); R.blastTree = o.tree !== false;
      R.tethers.userData.swing(0.9); R.tethers.userData.alarm(true); R.beacon.userData.on(true);
      if (o.instant || skipping()) {
        R.flash.visible = false; R.blastT = -1;
        if (R.blastTree) setTree('fallen'); setTinselYes('fallen'); R.tinselFloor.visible = true; smokeTo(R.smF, 1, 0);
        return;
      }
      R.blastT = 0; R.blastStage = 0;
      for (let i = 0; i < 4; i++) R.tPhones[i].visible = i < 2;
      shardsAt(0);
      smokeTo(R.smF, 1, 1.0);
      const rf = reduceFx();
      M.blast.emissive.setHex(rf ? 0x8a8a8a : 0xffffff); M.blast.color.setHex(rf ? 0x8a8a8a : 0xffffff);
      R.flash.visible = true; R.flash.scale.setScalar(0.01); M.blast.opacity = rf ? 0.5 : 1;
    }

    // fairy bulbs along a line, k swags of sag s
    function bulbRun(x0, y0, z0, x1, y1, z1, n, s = 0, k = 1, ci = 0) {
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n, f = (t * k) % 1;
        FAIRY.push([x0 + (x1 - x0) * t, y0 + (y1 - y0) * t - 4 * s * f * (1 - f), z0 + (z1 - z0) * t, (i + ci) % FAIRY_COLS.length]);
      }
    }
    function propsXmas() {   // 2026 only: tinsel, fairy lights, fake snow, the Santa hat's tinsel, the ladder
      tint = IN;
      R.tinselStatic = P(part('tinsel_static', () => {
        swags(3.2, 0.95, -8.53, 7.8, 0.95, -8.53, 3, 0.12);
        swags(-4.5, 2.35, -14.24, 0.5, 2.35, -14.24, 3, 0.15);
        swags(-9.0, 2.58, -0.2, 11.0, 2.58, -0.2, 6, 0.22, 9);
        swags(7.6, 2.3, -12.44, 9.2, 2.3, -12.44, 1, 0.08);
        swags(10.92, 2.02, -12.2, 10.92, 2.02, -11.0, 1, 0.1);
        swags(-8.86, 2.45, -13.0, -8.86, 2.45, -2.6, 5, 0.18);
        swags(9.93, 1.55, -29.9, 9.93, 1.55, -27.95, 1, 0.14);
      }, null, 0, { floor: false }));
      bulbRun(-9.0, 2.5, -0.26, 11.0, 2.5, -0.26, 60, 0.16, 6, 0);
      bulbRun(3.25, 0.86, -8.49, 7.75, 0.86, -8.49, 30, 0.08, 3, 1);
      for (let i = 0; i < 20; i++) {   // round the Yes wall graphic
        const u = i / 20 * 8.76, x = u < 2.5 ? 2.8 + u : u < 4.38 ? 5.3 : u < 6.88 ? 5.3 - (u - 4.38) : 2.8, y = u < 2.5 ? 2.89 : u < 4.38 ? 2.89 - (u - 2.5) : u < 6.88 ? 1.01 : 1.01 + (u - 6.88);
        FAIRY.push([x, y, -12.44, (i + 2) % 5]);
      }
      bulbRun(5.84, 0.4, -24.08, 5.84, 2.1, -24.08, 4, 0, 1, 3); bulbRun(5.9, 2.24, -24.08, 6.9, 2.24, -24.08, 2, 0, 1, 1); bulbRun(6.96, 2.1, -24.08, 6.96, 0.4, -24.08, 4, 0, 1, 0);
      bulbRun(7.6, 2.24, -12.43, 9.2, 2.24, -12.43, 10, 0.05, 2, 4);
      bulbRun(9.92, 1.5, -29.9, 9.92, 1.5, -27.95, 10, 0.08, 1, 2);
      // one strand hanging from the aircon vent, swaying
      R.strand = P(part('tinsel_strand', () => { garland(0, 0, 0, 0.03, -0.6, 0.02, 0, 7, 0.036); }, [8.0, 3.18, -4.6], 0, { floor: false }));
      // the garland Jordan / Luka hang along the top of the Yes wall: set('hidden'|'half'|'hung'|'fallen')
      R.tyes = P(new THREE.Group()); R.tyes.name = 'tinsel_yes';
      R.tyL = part('', () => garland(2.85, 2.98, -12.42, 4.05, 2.98, -12.42, 0.16, 8), null, 0, { floor: false });
      R.tyR = part('', () => garland(4.05, 2.98, -12.42, 5.25, 2.98, -12.42, 0.16, 8), null, 0, { floor: false });
      R.tyF = part('', () => {
        garland(2.85, 2.98, -12.42, 3.25, 1.4, -12.36, 0.0, 6); garland(3.25, 1.4, -12.36, 3.6, 0.04, -12.15, 0.0, 5);
        garland(3.6, 0.04, -12.15, 4.9, 0.04, -11.85, -0.04, 7); bb(2.82, 2.94, -12.44, 2.88, 3.0, -12.4, 0xc0c0c0);
      }, null, 0, { floor: false });
      R.tyes.add(R.tyL, R.tyR, R.tyF);
      R.tyes.userData.set = setTinselYes;
      // fallen tinsel across the floor (after the blast)
      R.tinselFloor = P(part('tinsel_floor', () => {
        garland(3.6, 0.04, -7.6, 5.0, 0.04, -8.2, -0.05, 7); garland(5.4, 0.04, -7.3, 7.4, 0.04, -7.9, -0.06, 8);
        garland(3.4, 0.04, -10.3, 4.8, 0.04, -11.0, -0.04, 6); garland(6.8, 0.04, -10.8, 8.6, 0.04, -10.2, -0.05, 7);
        garland(1.8, 0.04, -5.2, 2.9, 0.04, -6.6, -0.05, 6);
      }, null, 0, { floor: false }));
      R.coil = P(part('tinsel_coil', () => {
        let px = 0.3, pz = 0;
        for (let k = 1; k <= 22; k++) { const a = k * 0.75, r = 0.3 - k * 0.006, x = Math.cos(a) * r, z = Math.sin(a) * r, y = 0.04 + (k % 7) * 0.012; rod(px, y, pz, x, y, z, 0.07, TINSEL[k % 6], M.tinsel, k); px = x; pz = z; }
      }, [4.6, 0, -11.3], 0, { floor: false }));
      // fake-snow spray inside the front glass, pane by pane; the 1.1 sightline (x 3.8..7.4, y 0.8..2.0) stays clear
      R.snowSpray = P(part('snow_spray', () => {
        const PX = [-9.15, -6.6, -4.3, -3.15], PR = [-0.85, 1.6, 4.1, 6.6, 9.0, 11.15], A0 = 3.8, A1 = 7.4;
        for (let i = 0; i < PX.length - 1; i++) snowRect(PX[i] + 0.05, PX[i + 1] - 0.05, 0.3, 2.6, PX[i], PX[i + 1]);
        for (let i = 0; i < PR.length - 1; i++) {
          const p0 = PR[i] + 0.05, p1 = PR[i + 1] - 0.05;
          if (p1 <= A0 || p0 >= A1) { snowRect(p0, p1, 0.3, 2.6, PR[i], PR[i + 1]); continue; }
          if (p0 < A0) snowRect(p0, A0, 0.3, 2.6, PR[i], PR[i + 1]);
          if (p1 > A1) snowRect(A1, p1, 0.3, 2.6, PR[i], PR[i + 1]);
          const m0 = Math.max(p0, A0), m1 = Math.min(p1, A1);
          snowRect(m0, m1, 2.0, 2.6, PR[i], PR[i + 1]); snowRect(m0, m1, 0.3, 0.8, PR[i], PR[i + 1]);
        }
        quad(3.6, 0.9, M.greet, 5.6, 2.15, -0.026);
      }, null, 0, { floor: false }));
      // limp tinsel on the Yes sign: four swags under the sign box, two ends lying on the awning (lift in gusts)
      tint = OUT;
      R.tsign = P(part('tinsel_sign', () => { swags(-5.08, 3.62, 0.5, 1.08, 3.62, 0.5, 4, 0.06, 8, 0.07); }, null, 0, { floor: false }));
      R.tsEnds = [-5.08, 1.08].map((x, i) => { const e = part('', () => { garland(0, 0, 0, i ? 0.06 : -0.06, -0.13, 0.62, 0.04, 6, 0.065); }, [x, 3.62, 0.5], 0, { floor: false }); R.tsign.add(e); return e; });
      tint = IN;
      // the aluminium stepladder: set('yes_wall'|'folded'|'carried'|'hidden'), wobble()
      R.ladder = P(new THREE.Group()); R.ladder.name = 'ladder';
      R.ladTilt = new THREE.Group(); R.ladder.add(R.ladTilt);
      const AL = 0xc3c8cc;
      R.ladFront = part('', () => {
        for (const sx of [-1, 1]) { rod(sx * 0.26, 0.0, -0.45, sx * 0.22, 1.68, 0.05, 0.034, AL); box(0.06, 0.03, 0.07, 0x1a1a1a, sx * 0.26, 0, -0.45); }
        for (const y of [0.42, 0.84, 1.26]) {
          const z = -0.45 + 0.5 * (y / 1.68), w = 0.5 - y * 0.024;
          bb(-w / 2, y - 0.03, z - 0.055, w / 2, y, z + 0.055, 0xa8adb2);
          for (let k = 0; k < 3; k++) bb(-w / 2 + 0.01, y, z - 0.04 + k * 0.035, w / 2 - 0.01, y + 0.004, z - 0.03 + k * 0.035, 0x7d8288);
        }
        bb(-0.27, 1.62, -0.06, 0.27, 1.72, 0.16, 0x50545c); bb(-0.2, 1.72, -0.02, 0.2, 1.73, 0.12, 0x3a3d42);
      }, null, 0, { floor: false });
      R.ladBack = part('', () => {
        for (const sx of [-1, 1]) { rod(sx * 0.23, 0, 0, sx * 0.26, -1.66, 0.37, 0.03, AL); box(0.06, 0.03, 0.06, 0x1a1a1a, sx * 0.26, -1.66, 0.37); }
        rod(-0.24, -0.62, 0.14, 0.24, -0.62, 0.14, 0.022, AL); rod(-0.25, -1.2, 0.27, 0.25, -1.2, 0.27, 0.022, AL);
      }, [0, 1.66, 0.08], 0, { floor: false });
      R.ladSpread = part('', () => { for (const sx of [-1, 1]) rod(sx * 0.25, 0.72, -0.24, sx * 0.25, 0.72, 0.3, 0.014, 0x8a8f94); }, null, 0, { floor: false });
      R.ladTilt.add(R.ladFront, R.ladBack, R.ladSpread);
      R.ladder.userData.set = setLadder;
      R.wobT = -1;
      R.ladder.userData.wobble = () => { if (!skipping()) R.wobT = 0; };
    }
    function setTinselYes(st) {
      R.tyesState = st;
      R.tyL.visible = st === 'half' || st === 'hung'; R.tyR.visible = st === 'hung'; R.tyF.visible = st === 'fallen';
    }
    // 'carried' (call it after actor.hold(ladder), which parents it to his root): folded, carried along his right side
    // (its length along his heading, its width upright, the upper rail at his right hand, 0.86 m up). Not held: folded,
    // its collider off, left where it stands. The folded ladder's own centre + the carry turn: worked out once.
    const LAD_CARRY = [-0.36, 0.58, 0.1];   // the folded ladder's centre in the holder's root (right = −X, ahead = +Z)
    let ladC = null; const ladQ = new THREE.Quaternion(), ladV = new THREE.Vector3();
    function ladCarryPose() {
      const L = R.ladder;
      if (!ladC) {
        const par = L.parent; if (par) par.remove(L);
        L.position.set(0, 0, 0); L.quaternion.identity(); L.updateMatrixWorld(true);
        ladC = new THREE.Box3().setFromObject(L).getCenter(new THREE.Vector3());
        if (par) par.add(L);
        // local X (width) -> up, Y (length) -> ahead, Z (depth) -> his left; the A-frame front's 0.29 rad lean undone first
        ladQ.setFromRotationMatrix(new THREE.Matrix4().set(0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1))
          .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -0.29));
      }
      L.quaternion.copy(ladQ);
      ladV.copy(ladC).applyQuaternion(ladQ);
      L.position.set(LAD_CARRY[0] - ladV.x, LAD_CARRY[1] - ladV.y, LAD_CARRY[2] - ladV.z);
    }
    function setLadder(st) {
      if (!R.ladder) return;
      R.ladState = st;
      if (st !== 'carried' && R.ladder.parent !== R.root) R.root.add(R.ladder);
      R.ladTilt.rotation.set(0, 0, 0); R.wobT = -1;
      R.ladder.visible = st !== 'hidden';
      if (st === 'yes_wall') { R.ladder.position.set(4.05, 0, -11.75); R.ladder.rotation.set(0, PI, 0); R.ladBack.rotation.x = 0; R.ladSpread.visible = true; setBox(C.ladder, 3.78, -12.22, 4.32, -11.28); }
      else if (st === 'folded') { R.ladder.position.set(7.71, 0, -8.7); R.ladder.rotation.set(0, -H, 0); R.ladBack.rotation.x = 0.508; R.ladSpread.visible = false; setBox(C.ladder, 7.84, -9.0, 8.25, -8.4); }
      else {
        if (st === 'carried') { R.ladBack.rotation.x = 0.508; R.ladSpread.visible = false; if (R.ladder.parent && R.ladder.parent !== R.root) ladCarryPose(); }
        park(C.ladder);
      }
    }
    // the sad plastic tree by the plant (2040: the same tree, faded, still on the floor): set('up'|'fallen'|'gone'), fall()
    function propsTree() {
      tint = E40 ? [IN[0] * 0.92, IN[1] * 0.9, IN[2] * 0.84] : IN;
      R.tree = P(new THREE.Group()); R.tree.name = 'xmas_tree'; R.tree.position.set(9.1, 0, -1.0);
      const ox = 0.15;
      R.tree.add(part('', () => {
        cyl(0.13, 0.15, 0.2, 8, 0xb02a2a, ox, 0.1, 0); cyl(0.02, 0.025, 1.45, 5, 0x5a4a3a, ox, 0.86, 0);
        for (const [y, r, n] of [[0.42, 0.5, 7], [0.72, 0.42, 7], [1.0, 0.32, 6], [1.26, 0.22, 5]]) for (let k = 0; k < n; k++) {
          const a = k * TAU / n + y * 3; boxR(0.08, 0.025, r, k % 2 ? 0x6f8a6a : 0x7d9479, ox + Math.sin(a) * r * 0.48, y - r * 0.12, Math.cos(a) * r * 0.48, 0.32, a);
        }
        seed = 101;
        for (let i = 0; i < 9; i++) { const y = 0.35 + rnd() * 0.95, r = 0.42 * (1 - (y - 0.3) / 1.3) + 0.04, a = rnd() * TAU; ico(0.038, i % 3 ? 0xc62828 : 0xd0d4da, ox + Math.sin(a) * r, y - 0.06, Math.cos(a) * r); }
        let px = ox + 0.44, py = 0.32, pz = 0;
        for (let k = 1; k <= 26; k++) { const u = k / 26, y = 0.32 + u * 1.12, r = 0.44 * (1 - u * 0.85), a = u * 3.2 * TAU, x = ox + Math.cos(a) * r, z = Math.sin(a) * r; rod(px, py, pz, x, y, z, 0.045, TINSEL[k % 6], M.tinsel, k); px = x; py = y; pz = z; }
        boxR(0.16, 0.035, 0.03, YEL, ox + 0.02, 1.6, 0, 0, 0, 0.45); boxR(0.035, 0.16, 0.03, YEL, ox + 0.02, 1.6, 0, 0, 0, 0.45); boxR(0.11, 0.11, 0.03, 0xffe680, ox + 0.02, 1.6, 0, 0, 0, 1.24);
      }, null, 0, { floor: false }));
      if (E26) for (let i = 0; i < 20; i++) { const u = (i + 0.5) / 20, a = u * 2.6 * TAU + 1, r = 0.46 * (1 - u * 0.82) + 0.02; FAIRY_TREE.push([ox + Math.cos(a) * r, 0.36 + u * 1.08, Math.sin(a) * r, i % 5]); }
      R.tree.userData.set = setTree;
      R.tree.userData.fall = () => { if (skipping()) setTree('fallen'); else { setTree('up'); R.fallT = 0; } };
      R.fallT = -1;
      tint = IN;
    }
    function setTree(st) {
      R.treeState = st; R.fallT = -1;
      R.tree.visible = st !== 'gone';
      R.tree.rotation.z = st === 'fallen' ? H : 0.06;
      if (st === 'up') setBox(C.tree, 8.95, -1.3, 9.55, -0.7); else if (st === 'fallen') setBox(C.tree, 7.45, -1.35, 9.3, -0.62); else park(C.tree);
      R.fairyDirty = true;
    }

    const SMOKE = { F: { n: 36, cx: 5.6, cz: -5.3, r: 3.0, y0: 0.3, y1: 2.2, rise: 0.9, drift: 0.1, size: 1.7 }, B: { n: 20, cx: 6.55, cz: -26.8, r: 1.2, y0: 0.2, y1: 2.5, rise: 2.1, drift: 0.05, size: 1.15 } };
    function makeSmoke(name, cfg, m) {
      const geo = geoOf(() => { for (let k = 0; k < 3; k++) quad(1, 1, M.vc, 0, 0, 0, k * PI / 3); });
      const im = P(new THREE.InstancedMesh(geo, m, cfg.n)); im.name = name;
      im.instanceMatrix.setUsage(THREE.DynamicDrawUsage); im.frustumCulled = false; im.renderOrder = 3;
      const d = new Float32Array(cfg.n * 5);   // base x, y, z, phase, scale
      for (let i = 0; i < cfg.n; i++) { const a = rnd() * TAU, r = Math.sqrt(rnd()) * cfg.r; d[i * 5] = cfg.cx + Math.sin(a) * r; d[i * 5 + 1] = cfg.y0 + rnd() * (cfg.y1 - cfg.y0) * 0.4; d[i * 5 + 2] = cfg.cz + Math.cos(a) * r; d[i * 5 + 3] = rnd(); d[i * 5 + 4] = 0.7 + rnd() * 0.6; }
      const s = { im, cfg, d, m, k: 0, from: 0, to: 0, t: 1, dur: 0 };
      im.userData.amount = (k, dur = 0) => smokeTo(s, k, dur);
      return s;
    }
    function smokeTo(s, k, dur = 0) {
      if (!s) return;
      s.from = s.k; s.to = Math.max(0, Math.min(1, k)); s.dur = dur; s.t = 0;
      if (dur <= 0 || skipping()) { s.k = s.to; s.t = 1; }
      s.im.visible = s.k > 0.001 || s.to > 0.001;
    }
    function smokeTick(s, dt, t) {
      if (s.t < 1) { s.t = Math.min(1, s.t + dt / Math.max(0.001, s.dur)); s.k = s.from + (s.to - s.from) * smooth(s.t); }
      const vis = s.k > 0.001; s.im.visible = vis; if (!vis) return;
      s.m.opacity = 0.5 * Math.sqrt(s.k);
      const c = s.cfg, n = Math.max(1, Math.ceil(c.n * s.k)); s.im.count = n;
      for (let i = 0; i < n; i++) {
        const o = i * 5, u = (t * 0.09 + s.d[o + 3]) % 1, f = Math.sin(u * PI);
        sV.set(s.d[o] + u * c.drift * 11, s.d[o + 1] + u * c.rise, s.d[o + 2] + Math.sin(t * 0.3 + i) * 0.15);
        sE.set(0, s.d[o + 3] * TAU + t * 0.05, 0); sQ.setFromEuler(sE); sS.setScalar(c.size * s.d[o + 4] * (0.4 + 0.6 * f) + 0.001);
        s.im.setMatrixAt(i, sM.compose(sV, sQ, sS));
      }
      s.im.instanceMatrix.needsUpdate = true;
    }
    function propsBack() {
      tint = BOH;
      // the Wall (corridor, left face x 5.4): 2026 as docs §5.4; 2040 faded, with a wreath over the MISSING slot
      if (E26) {
        R.theWall = P(part('the_wall', () => {
          bb(5.4, 1.5, -19.66, 5.416, 1.74, -19.44, 0x2a2622); quadR(0.172, 0.215, M.wall, RG.polaroid, 5.4175, 1.62, -19.55, H);
          bb(5.4, 1.47, -20.2, 5.405, 1.69, -19.9, 0x1e2a44);
          for (const [z0, z1, y0, y1] of [[-20.2, -20.18, 1.47, 1.69], [-19.92, -19.9, 1.47, 1.69], [-20.2, -19.9, 1.47, 1.49], [-20.2, -19.9, 1.67, 1.69]]) bb(5.4, y0, z0, 5.45, y1, z1, 0x111111);
          bb(5.405, 1.548, -20.1, 5.418, 1.612, -20.0, 0x2a2a2e); quadR(0.1, 0.05, M.wall, RG.label, 5.4185, 1.58, -20.05, H);
          quad(0.28, 0.2, M.glass, 5.449, 1.58, -20.05, H);
          quadR(0.15, 0.094, M.wall, RG.note, 5.406, 1.7, -20.45, H); ico(0.008, 0xd32f2f, 5.412, 1.74, -20.45);
          bb(5.4, 1.34, -21.1, 5.42, 1.76, -20.8, 0x111111); quadR(0.27, 0.39, M.wall, RG.missing, 5.4215, 1.55, -20.95, H);
          quadR(0.21, 0.315, M.wall, RG.flyer, 5.406, 1.62, -21.5, H);
          for (const [y, z] of [[1.77, -21.6], [1.77, -21.4]]) boxR(0.004, 0.02, 0.05, 0xe6dcb0, 5.408, y, z, 0, 0, 0.3);
        }));
        R.print4 = P(part('print4', () => { bb(5.4, 1.9, -19.96, 5.418, 2.14, -19.64, 0x3a2a1a); quadR(0.28, 0.21, M.wall, RG.print4, 5.4185, 2.02, -19.8, H); }));
      } else {
        const tb = tint; tint = [BOH[0] * 0.96, BOH[1] * 0.9, BOH[2] * 0.74];
        R.theWall = P(part('the_wall40', () => {
          bb(5.4, 1.5, -19.66, 5.416, 1.74, -19.44, 0x2a2622); quadR(0.172, 0.215, M.wall, RG.polaroid, 5.4175, 1.62, -19.55, H);
          bb(5.4, 1.47, -20.2, 5.405, 1.69, -19.9, 0x1e2a44);
          for (const [z0, z1, y0, y1] of [[-20.2, -20.18, 1.47, 1.69], [-19.92, -19.9, 1.47, 1.69], [-20.2, -19.9, 1.47, 1.49], [-20.2, -19.9, 1.67, 1.69]]) bb(5.4, y0, z0, 5.45, y1, z1, 0x111111);
          bb(5.405, 1.548, -20.1, 5.418, 1.612, -20.0, 0x2a2a2e); quadR(0.1, 0.05, M.wall, RG.label, 5.4185, 1.58, -20.05, H);
          bb(5.4, 1.39, -21.16, 5.425, 1.71, -20.74, 0x161616);
          tint = BOH;
          tor(0.17, 0.11, 0x2f5a32, 5.47, 1.55, -20.95, 0, H); seed = 111;
          for (let k = 0; k < 16; k++) { const a = k / 16 * TAU; ico(0.06, k % 2 ? 0x3a6a3c : 0x2a4a2c, 5.52, 1.55 + Math.sin(a) * 0.19, -20.95 + Math.cos(a) * 0.19, 0.8); }
          for (const [dy, dz] of [[0.2, 0.08], [-0.12, -0.17], [-0.17, 0.12]]) ico(0.022, 0xc62828, 5.56, 1.55 + dy, -20.95 + dz);
          boxR(0.03, 0.08, 0.12, 0xc62828, 5.56, 1.76, -20.95, 0, 0, 0); boxR(0.02, 0.12, 0.04, 0xc62828, 5.55, 1.68, -20.99, 0.3); boxR(0.02, 0.12, 0.04, 0xc62828, 5.55, 1.68, -20.91, -0.3);
          rod(5.43, 1.86, -20.95, 5.5, 1.76, -20.95, 0.006, 0x8a1a1a); bb(5.4, 1.85, -20.96, 5.43, 1.87, -20.94, 0x888888);
          bb(5.4, 1.65, -20.525, 5.402, 1.75, -20.375, 0xf4f4ee); bb(5.4, 1.465, -21.605, 5.402, 1.775, -21.395, 0xf4f4ee);   // unfaded patches
        }));
        tint = tb;
      }
      if (E26) {
        R.kettle = P(part('kettle', () => {
          cyl(0.08, 0.08, 0.02, 10, 0x2a2c30, 0, 0.01, 0); cyl(0.07, 0.085, 0.2, 10, 0xe9e9e9, 0, 0.12, 0); cyl(0.04, 0.07, 0.03, 10, 0xd0d0d0, 0, 0.235, 0);
          box(0.03, 0.16, 0.05, 0x2a2c30, 0.09, 0.05, 0); boxR(0.03, 0.03, 0.08, 0xe9e9e9, -0.1, 0.17, 0, 0, H, 0.6);
        }, [10.08, 0.92, -28.55], 0, { floor: false }));
        R.rueMug = P(part('rue_mug', () => {
          cyl(0.04, 0.036, 0.09, 10, 0xffffff, 0, 0.045, 0); box(0.012, 0.05, 0.035, 0xffffff, 0.045, 0.02, 0);
          const g = new THREE.CylinderGeometry(0.0408, 0.0372, 0.06, 10, 1, true, PI, PI), rg = RG.mug, u0 = rg[0] / rg[4], u1 = (rg[0] + rg[2]) / rg[4], v0 = 1 - (rg[1] + rg[3]) / rg[5], v1 = 1 - rg[1] / rg[5];
          uvMap(g, (uv, i) => uv.setXY(i, u0 + uv.getX(i) * (u1 - u0), v0 + uv.getY(i) * (v1 - v0)));
          g.translate(0, 0.048, 0); put(g, 0xffffff, M.wall);
        }, [9.98, 0.92, -28.78], 0, { floor: false }));
        R.laptop = P(part('laptop', () => {
          const th = 0.28, cy = 0.015 + 0.12 * Math.cos(th), cz = -0.12 - 0.12 * Math.sin(th);
          bb(-0.17, 0, -0.12, 0.17, 0.016, 0.12, 0x2a2c30); bb(-0.15, 0.016, -0.09, 0.15, 0.018, 0.04, 0x15161a); bb(-0.05, 0.016, 0.06, 0.05, 0.018, 0.11, 0x3a3d42);
          boxR(0.34, 0.24, 0.01, 0x2a2c30, 0, cy, cz, -th);
          quad(0.32, 0.22, M.laptop, 0, cy + 0.006 * Math.sin(th), cz + 0.006 * Math.cos(th), 0, -th);
          rod(0.17, 0.008, 0.05, 0.4, 0.002, 0.18, 0.008, 0x111111);
        }, [3.95, 0.93, -29.55], 0, { floor: false }));
      }
      R.tv = P(part('tv_screen', () => quad(0.32, 0.24, M.tv, 0, 0, 0, -H), [9.915, 1.815, -26.2], 0, { floor: false }));
      R.tvMode = '';
      R.tv.userData.show = (mode) => { if (mode === R.tvMode) return; R.tvMode = mode; paintTV(T.tv.image.getContext('2d'), 256, 192, mode); T.tv.needsUpdate = true; };
      if (E40) { R.tvMode = 'off'; paintTV(T.tv.image.getContext('2d'), 256, 192, 'off'); T.tv.needsUpdate = true; }
      // the backroom wall phone (+ handset on its left hook) and the junction box lid
      const cr = E40 ? 0xd8c890 : 0xe8dcc0;
      R.wallPhone = P(part('wall_phone', () => {
        bb(-0.06, -0.11, -0.035, 0.06, 0.11, 0.035, cr); bb(-0.045, -0.02, -0.037, 0.045, 0.08, -0.035, 0xd0c4a4);
        for (let i = 0; i < 12; i++) bb(-0.033 + (i % 3) * 0.024, 0.06 - Math.floor(i / 3) * 0.022, -0.04, -0.017 + (i % 3) * 0.024, 0.072 - Math.floor(i / 3) * 0.022, -0.036, 0x6a6458);
        bb(0.06, 0.03, -0.03, 0.078, 0.07, 0.03, cr);
        let px = 0.0, py = -0.11, pz = -0.02;
        for (let k = 1; k <= 14; k++) { const u = k / 14, a = k * 1.9, x = 0.05 * u + Math.cos(a) * 0.012, y = -0.11 - Math.sin(u * PI) * 0.22 - u * 0.02, z = -0.025 + Math.sin(a) * 0.012; rod(px, py, pz, x, y, z, 0.007, 0x8a7a5a); px = x; py = y; pz = z; }
      }, [4.3, 1.45, -24.035], 0, { floor: false }));
      R.wallHandset = part('wall_phone_handset', () => {
        box(0.04, 0.17, 0.035, cr, 0, -0.085, 0); box(0.05, 0.045, 0.05, cr, 0, -0.01, -0.01); box(0.05, 0.045, 0.05, cr, 0, -0.165, -0.01);
      }, [0.098, 0.08, -0.01], 0, { floor: false });
      R.wallPhone.add(R.wallHandset); R.wallHome = R.wallHandset.position.y;
      R.wallRing = false; R.wallPhone.userData.ring = (on) => { R.wallRing = !!on; };
      R.jbox = P(part('jbox_lid', () => { bb(0, -0.08, -0.012, 0.2, 0.08, 0.0, 0x9aa0a6); bb(0.17, -0.01, -0.016, 0.19, 0.01, -0.012, 0x6a6e72); }, [4.2, 0.95, -24.06], 0, { floor: false }));
      R.jbox.userData.open = false; R.jboxK = 0;
      if (E26 && typeof PROPS !== 'undefined' && PROPS.remote) {   // the Remote, plugged into the open box (from flag s13_wired)
        R.remote = PROPS.remote(); R.remote.name = 'remote_plugged'; R.remote.position.set(4.3, 0.75, -24.1); R.remote.rotation.set(0, 0.3, PI);
        P(R.remote); R.remote.visible = false;
      }
      // the roller door in the back wall: set(gap), slam(); gap readable; solid while gap < 1.2 m
      R.roller = P(part('roller_door', () => {
        const g = new THREE.BoxGeometry(2.3, 2.3, 0.04); g.translate(0, 1.15, 0); put(g, 0xffffff, M.shutter);
        bb(-1.16, 0, -0.035, 1.16, 0.07, 0.035, 0x6a6e72);
        bb(-0.12, 0.28, 0.02, 0.12, 0.31, 0.05, 0x3a3d42); bb(-0.12, 0.28, -0.05, 0.12, 0.31, -0.02, 0x3a3d42);
      }, [7.75, 0, -30.15], 0, { floor: false }));
      R.leak = P(part('door_light_leak', () => quad(2.3, 0.38, M.leak, 7.75, 0.013, -29.79, 0, -H), null, 0, { floor: false }));
      R.gap = 0; R.gapTo = 0; R.slamT = -1;
      R.roller.userData.gap = 0;
      R.roller.userData.set = (g) => { R.gapTo = Math.max(0, Math.min(2.3, g)); R.slamT = -1; if (skipping()) R.gap = R.gapTo; };
      R.roller.userData.slam = () => { R.gapTo = 0; if (skipping()) { R.gap = 0; R.slamT = -1; } else { R.slamFrom = R.gap; R.slamT = 0; } };
      // the yard gate (chain-link, slides toward -X): set('shut'|'ajar'|'open')
      tint = OUT;
      R.gate = P(part('yard_gate', () => {
        for (const x of [0, 2, 4]) rod(x, 0.06, 0, x, 2.0, 0, 0.04, 0xb8bec4);
        rod(0, 2.0, 0, 4, 2.0, 0, 0.04, 0xb8bec4); rod(0, 0.08, 0, 4, 0.08, 0, 0.04, 0xb8bec4); rod(0, 1.05, 0, 4, 1.05, 0, 0.025, 0xb8bec4);
        quadUV(4, 1.9, M.chain, 2, 1.04, 0, 0, 0, 0xffffff, 4 / 0.32, 1.9 / 0.32);
        for (const x of [0.4, 3.6]) cyl(0.05, 0.05, 0.03, 8, 0x333333, x, 0.05, 0, 0, H);
        bb(3.9, 0.95, -0.05, 4.0, 1.15, 0.05, 0xd0a020);
      }, [9.5, 0, -46.12], 0, { floor: false }));
      R.gateX = 9.5; R.gateTo = 9.5;
      R.gate.userData.set = (st) => { R.gateTo = st === 'open' ? 5.5 : st === 'ajar' ? 8.1 : 9.5; if (skipping()) R.gateX = R.gateTo; };
      tint = BOH;
      // the scorch marks on the backroom ceiling: count(n) (P1, P2 always; P3 "from Christmas"; P4 2040's)
      R.scorch = P(new THREE.Group()); R.scorch.name = 'scorch';
      R.scorchQ = [[5.3, -26.2, 1.3, 0.4], [7.6, -27.3, 1.5, 2.1], [5.2, -27.7, 1.2, 4.0], [7.7, -25.6, 1.4, 5.3]].map(([x, z, d, a], i) => {
        const q = part('', () => quad(d, d, M.scorch, 0, 0, 0, a, H), [x, 2.79 - i * 0.0015, z], 0, { floor: false }); R.scorch.add(q); return q;
      });
      R.scorch.userData.count = (n) => { for (let i = 0; i < 4; i++) R.scorchQ[i].visible = i < n; };
      // the flickering tube: userData.off, flicker(n) forces n bursts now (2040: a steady LED tube)
      R.tube = P(part('tube', () => bb(6.48, 2.69, -27.55, 6.72, 2.72, -26.05, 0xffffff, M.tube), null, 0, { floor: false }));
      R.flickN = 0; R.flickT = 0;
      R.tube.userData.flicker = (n = 3) => { R.flickN = n; R.flickT = 0; };
      // clock hands (backroom + floor): clock_hands.userData.set(h, m) sets the shared time
      const hands = (name, x, y, z) => {
        const g = P(new THREE.Group()); g.name = name; g.position.set(x, y, z);
        const hh = part('', () => bb(-0.008, 0, -0.003, 0.008, 0.09, 0.003, 0x111111), null, 0, { floor: false });
        const mh = part('', () => bb(-0.006, 0, 0.004, 0.006, 0.14, 0.008, 0x111111), null, 0, { floor: false });
        g.add(hh, mh); return [hh, mh];
      };
      R.hands = [hands('clock_hands', 4.4, 2.35, -29.955), hands('clock_floor_hands', 8.4, 2.62, -12.455)];
      R.clockMin = 11 * 60 + 31;
      R.hands[0][0].parent.userData.set = (h, m) => { R.clockMin = h * 60 + m; };
      // smoke over the wreck, smoke in the backroom (instanced crossed quads)
      seed = 121;
      R.smF = makeSmoke('smoke_floor', SMOKE.F, M.smokeF); R.smB = makeSmoke('smoke_backroom', SMOKE.B, M.smokeB);
      smokeTo(R.smF, 0); smokeTo(R.smB, 0);
    }

    function propsAmbient() {
      tint = OUT;
      // pelicans on the foreshore railing (bodies and heads instanced; heads turn, bob and clack)
      const body = geoOf(() => {
        ico(0.2, 0xeceae4, 0, 0.2, 0, 0.72); boxR(0.1, 0.06, 0.2, 0xd8d6d0, 0, 0.2, -0.22, -0.4);
        for (const sx of [-1, 1]) { boxR(0.05, 0.16, 0.36, 0x3a3a3c, sx * 0.16, 0.2, -0.05, 0.1, 0, sx * 0.18); rod(sx * 0.06, 0.08, 0.0, sx * 0.06, -0.02, 0.03, 0.02, 0xd8a040); }
      });
      const head = geoOf(() => {
        rod(0, 0, 0, 0, 0.22, 0.04, 0.06, 0xf2f0ea); ico(0.07, 0xf6f4ee, 0, 0.26, 0.05); ico(0.03, 0xf0c060, 0, 0.3, 0.05);
        rod(0, 0.25, 0.09, 0, 0.17, 0.44, 0.045, 0xe8a040); rod(0, 0.21, 0.1, 0, 0.14, 0.4, 0.05, 0xd89a50);
      });
      R.pel = [{ x: 4.0, z: -60.0, ry: PI - 0.35, next: 3 }, { x: 15.0, z: -60.0, ry: PI + 0.45, next: 9 }];
      R.pelB = P(instanced(body, M.inst, R.pel.map((p) => [p.x, 1.02, p.z, p.ry]))); R.pelB.name = 'pelicans';
      R.pelH = P(instanced(head, M.inst, R.pel.map((p) => [p.x, 1.3, p.z + 0.1, p.ry]))); R.pelH.instanceMatrix.setUsage(THREE.DynamicDrawUsage); R.pelH.frustumCulled = false;
      for (const p of R.pel) p.clack = -1;
      if (E26) {   // passing traffic on the front road
        R.traffic = P(new THREE.Group()); R.traffic.name = 'traffic';
        R.cars = [0xf2f2ee, 0xb3262c].map((c, i) => { const g = part('', () => car(c, 0, 0, 0)); g.rotation.y = i ? -H : H; g.position.set(0, 0, i ? 32.4 : 29.6); R.traffic.add(g); return g; });
        COL.length -= 2;   // the traffic cars pushed colliders at the origin: drop them
      }
      R.shimmer = P(part('shimmer', () => { for (const z of [3.6, 6.4]) quad(34, 0.4, M.shim, 0, 0.2, z); }, null, 0, { floor: false }));
      SUNM ||= [new THREE.MeshBasicMaterial({ color: 0xfffbea, fog: false }), new THREE.MeshBasicMaterial({ color: 0xfff6d0, fog: false, transparent: true, opacity: 0.3, depthWrite: false })];
      const sun = new THREE.Mesh(new THREE.CircleGeometry(3.6, 20), SUNM[0]), halo = new THREE.Mesh(new THREE.CircleGeometry(8, 20), SUNM[1]);
      R.sun = P(new THREE.Group()); R.sun.name = 'sun'; R.sun.add(sun, halo); halo.position.z = -0.3;
      R.sun.position.set(-2, 54, -26); R.sun.lookAt(-2, 2, 10);
      SKYM ||= new THREE.ShaderMaterial({   // the horizon: fog colour at the horizon up to the sky colour (no seam where the ground ends)
        uniforms: { uTop: { value: new THREE.Color(0x8fd0ff) }, uBot: { value: new THREE.Color(0xf4d8a8) } }, side: THREE.BackSide, depthWrite: false, fog: false,
        vertexShader: 'varying float vH; void main() { vec4 w = modelMatrix * vec4(position, 1.0); vH = normalize(w.xyz).y; gl_Position = projectionMatrix * viewMatrix * w; }',
        fragmentShader: 'uniform vec3 uTop; uniform vec3 uBot; varying float vH; void main() { gl_FragColor = vec4(mix(uBot, uTop, smoothstep(0.0, 0.2, vH)), 1.0);\n#include <colorspace_fragment>\n}',
      });
      R.sky = P(new THREE.Mesh(new THREE.SphereGeometry(320, 24, 12), SKYM)); R.sky.name = 'sky_horizon'; R.sky.renderOrder = -2; R.sky.frustumCulled = false;
      if (E26) {   // two browsing customers (A2 / 2027 frames): real rigs, built once, posed by update (not actors)
        CUST ||= [['cust26_a', -8.05, -12.2, -10.0, -H], ['cust26_b', -0.6, -10.6, -9.4, H]].map(([id, x, z0, z1, ry]) => {
          const rig = buildCharacter(id); rig.root.add(blobShadow()); rig.root.name = id;
          return { rig, x, z0, z1, ry, z: z1, to: z1, yaw: ry, a: 'idle', pick: 'idle', at: 0, t: 1, col: [PARK, PARK, PARK, PARK] };
        });
        for (const c of CUST) { R.root.add(c.rig.root); COL.push(c.col); c.rig.root.visible = false; }
      }
    }
    function propsFairy() {   // every fairy bulb in one InstancedMesh (unlit, per-bulb colour twinkling at 8 Hz)
      const n = FAIRY.length + FAIRY_TREE.length; if (!n) return;
      FAIRYM ||= new THREE.MeshBasicMaterial({ color: 0xffffff });
      R.fairy = P(new THREE.InstancedMesh(new THREE.OctahedronGeometry(0.032, 0), FAIRYM, n)); R.fairy.name = 'fairy_lights';
      R.fairy.instanceMatrix.setUsage(THREE.DynamicDrawUsage); R.fairy.frustumCulled = false;
      R.fairyBase = new Float32Array(n * 3); R.fairyPh = new Float32Array(n); R.fairyTree0 = FAIRY.length;
      R.fairyTreeL = new Float32Array(FAIRY_TREE.length * 3);
      seed = 131;
      for (let i = 0; i < n; i++) {
        const f = i < FAIRY.length ? FAIRY[i] : FAIRY_TREE[i - FAIRY.length];
        if (i < FAIRY.length) R.fairy.setMatrixAt(i, m4.makeTranslation(f[0], f[1], f[2]));
        else { const j = (i - FAIRY.length) * 3; R.fairyTreeL[j] = f[0]; R.fairyTreeL[j + 1] = f[1]; R.fairyTreeL[j + 2] = f[2]; R.fairy.setMatrixAt(i, m4.makeTranslation(f[0], f[1], f[2])); }
        tc.set(FAIRY_COLS[f[3]]); R.fairyBase[i * 3] = tc.r; R.fairyBase[i * 3 + 1] = tc.g; R.fairyBase[i * 3 + 2] = tc.b; R.fairyPh[i] = rnd() * TAU;
        R.fairy.setColorAt(i, tc);
      }
      R.fairy.instanceColor.setUsage(THREE.DynamicDrawUsage);
      R.fairyPow = null; R.fairyDirty = true; R.fairyClock = 0;
      R.fairy.userData.power = (k) => { R.fairyPow = k == null ? null : k; R.fairyClock = 1; };
    }

    function build() {
      COL.length = 0; FAIRY.length = 0; FAIRY_TREE.length = 0; textures();
      const root = new THREE.Group(); R.root = root;
      materials();
      b = new Builder(); XF = null;
      buildOutside(root); buildFloor(); buildBack();
      propsFloor(); if (E26) { propsHero(); propsXmas(); }
      propsTree(); propsBack(); propsAmbient(); propsFairy();
      COL.push(C.table, C.posts[0], C.posts[1], C.posts[2], C.posts[3], C.tree, C.ladder, C.roller, C.gate, C.bdoor);
      XF = null; tint = IN;
      if (ext.build) ext.build(KIT);
      XF = null;
      root.add(b.done()); b = null;
      R.env = null; R.wired = null;
      R.int = Object.assign({}, INT.day); R.radioLcd = '';
      R.scene = typeof state !== 'undefined' && state ? state.scene : null;
      autoDress(R.scene);
      if (typeof TEST !== 'undefined' && TEST.setview === ID && typeof window !== 'undefined' && window.TWO_TEST) {   // set inspection helpers (tools/setshots, dev)
        window.TWO_TEST.dress = (s, o) => dress(s, o || {});
        window.TWO_TEST.shot = (s) => { if (typeof cam !== 'undefined') cam.shot(s); };
        window.TWO_TEST.advance = (sec) => { clock.paused = true; for (let i = 0, n = Math.round(sec * 60); i < n; i++) world.update(1 / 60); };   // frozen clock, stepped by hand
        window.TWO_TEST.resume = () => { clock.paused = false; };
        window.TWO_TEST.call = (name, fn, ...a) => { const o = R.root.getObjectByName(name); return o && typeof o.userData[fn] === 'function' ? (o.userData[fn](...a), true) : false; };
      }
      return root;
    }

    // -------------------------------------------------------- dressing (idempotent, instant; nothing inherits from the last state)
    const DEC = (d, wd, y = 2026) => [d, 'DECEMBER', wd, y];
    const DR = {
      xmas:        { table: 'smudged', tin: 'hidden', tree: 'up', lad: 'yes_wall', radio: 1, open: 1, mon: 'xmas', tv: 'xmas', scorch: 2, cal: DEC(22, 'TUESDAY'), time: 691 },
      spotless:    { table: 'spotless', tin: 'hung', tree: 'up', lad: 'yes_wall', radio: 1, open: 1, mon: 'xmas', tv: 'xmas', scorch: 2, cal: DEC(22, 'TUESDAY'), time: 718 },
      wrecked:     { table: 'wrecked', tether: 0.9, alarms: 1, smoke: 0.8, tin: 'fallen', tfloor: 1, tree: 'fallen', lad: 'yes_wall', radio: 0, open: 1, mon: 'xmas', tv: 'xmas', scorch: 2, cal: DEC(22, 'TUESDAY'), time: 721, loose: 1, wired: 1 },
      wrecked_pc:  { table: 'wrecked', tether: 0.15, alarms: 0, smoke: 0.5, tin: 'fallen', tfloor: 1, tree: 'fallen', lad: 'folded', radio: 0, open: 1, office: 1, mon: 'xmas', tv: 'xmas', scorch: 2, cal: DEC(22, 'TUESDAY'), time: 730 },
      home:        { table: 'new_wrapped', tin: 'hung', tree: 'up', lad: 'hidden', radio: 0, open: 0, mon: 'off', tv: 'off', scorch: 3, extra: 'cash', cal: DEC(24, 'THURSDAY'), time: 1138 },
      home_night:  { table: 'new', smudge1: 1, tin: 'hung', tree: 'up', lad: 'hidden', radio: 0, open: 0, mon: 'off', tv: 'off', scorch: 3, extra: 'heap', cal: DEC(24, 'THURSDAY'), time: 1290 },
      days_later:  { table: 'new', smudge1: 1, tin: 'hung', tree: 'up', lad: 'hidden', radio: 1, open: 1, mon: 'app', tv: 'off', scorch: 3, cust: 1, cal: DEC(29, 'TUESDAY'), time: 615 },
      tinsel_down: { table: 'new', tin: 'half', tree: 'up', lad: 'yes_wall', radio: 1, open: 1, mon: 'app', tv: 'off', scorch: 3, extra: 'coil', cust: 1, cal: DEC(31, 'THURSDAY'), time: 1000 },
      wall_print:  { table: 'new', tin: 'hung', tree: 'up', lad: 'hidden', radio: 1, open: 1, mon: 'app', tv: 'off', scorch: 3, print4: 1, cal: DEC(29, 'TUESDAY'), time: 615 },
      xmas27:      { table: 'new', tin: 'half', tree: 'up', lad: 'yes_wall', radio: 1, open: 1, mon: 'xmas', tv: 'xmas', scorch: 3, cust: 1, cal: DEC(22, 'WEDNESDAY', 2027), time: 680 },
    };
    const AUTO26 = { '1.1': 'xmas', '1.2': 'spotless', '1.3': 'wrecked', PC: ['wrecked', { pc: true }], A1: 'home', B1: 'home', A2: 'days_later' };
    function sceneTime(id) {
      const s = typeof SCENES !== 'undefined' && SCENES[id] && SCENES[id].time, m = s && /(\d{1,2}):(\d{2})/.exec(s);
      return m ? +m[1] * 60 + +m[2] : null;
    }
    function autoDress(id) {
      const map = ext.autoDress || (E26 ? AUTO26 : {});
      let a = typeof map === 'function' ? map(id) : map[id];
      if (a == null) a = E26 ? 'xmas' : 'default';
      const st = Array.isArray(a) ? a[0] : a, o = Object.assign({}, Array.isArray(a) ? a[1] : null);
      const tm = sceneTime(id); if (tm != null && o.time == null) o.time = tm;
      dress(st, o);
    }
    function dressShared(o) {   // props both eras share, back to rest
      R.doorHold = null; R.flipT = 1;
      R.bdoor.rotation.y = 0; R.bdoor.userData.open = undefined; R.reqT = -1; R.bangT = -1; R.bdoorSolid = false; park(C.bdoor);
      R.chair.userData.seat.rotation.y = 0; R.chair.userData.spin = 0;
      R.tube.userData.off = false; R.flickN = 0;
      R.wallRing = false; R.wallHandset.position.y = R.wallHome;
      smokeTo(R.smB, 0);
      R.gateTo = R.gateX = 9.5;
      if (o.time != null) R.clockMin = o.time;
    }
    function dress(st, o = {}) {
      if (!R.root) return;
      if (st && typeof st === 'object') { o = st; st = st.state; }
      o = o || {};
      if (E40) {
        R.dressState = st; R.dressOpts = o;
        dressShared(o);
        setTree('fallen'); R.scorch.userData.count(o.scorch ?? 4);
        R.gap = R.gapTo = o.gap ?? 0.45; R.slamT = -1;
        R.radio.userData.playing = !!o.radio; R.sign.userData.set(true);
        R.odoor.rotation.y = o.officeDoor ? 1.5 : 0; R.odoor.userData.open = o.officeDoor ? true : undefined;
        R.jbox.userData.open = true; R.jboxK = 1;
        if (ext.dress) ext.dress(st, KIT, o);
        return;
      }
      const key = st === 'wrecked' && o.pc ? 'wrecked_pc' : st, d = DR[key] || DR.xmas;
      R.dressState = DR[key] ? key : 'xmas'; R.dressOpts = o;
      dressShared(o.time != null ? o : { time: d.time });
      setTable(d.table, { smudge1: !!d.smudge1 });
      R.swingA = d.tether || 0;
      R.alarmOn = R.beaconOn = o.alarms ?? !!d.alarms;
      R.flash.visible = false; R.blastT = -1;
      smokeTo(R.smF, o.smoke ?? (d.smoke || 0));
      setTinselYes(o.tinsel ?? d.tin); R.tinselFloor.visible = !!d.tfloor;
      R.coil.visible = d.extra === 'coil'; R.heap.visible = d.extra === 'heap'; R.cash.visible = d.extra === 'cash';
      setTree(d.tree); setLadder(o.ladder ?? d.lad);
      R.radio.userData.playing = o.radio ?? !!d.radio;
      R.sign.userData.set(!!d.open);
      const od = o.officeDoor ?? !!d.office; R.odoor.rotation.y = od ? 1.5 : 0; R.odoor.userData.open = od ? true : undefined;
      R.mon.userData.show(d.mon); R.tv.userData.show(d.tv);
      R.scorch.userData.count(o.scorch ?? d.scorch);
      R.print4.visible = !!d.print4;
      R.looseT.visible = !!d.loose;
      R.wired = null;
      const w = !!(d.wired && typeof state !== 'undefined' && state && state.flags && state.flags.s13_wired);
      if (R.remote) R.remote.visible = w;
      R.jbox.userData.open = w; R.jboxK = w ? 1 : 0;
      R.phoneRing = false; R.phoneSnd = null; R.phoneH.position.set(7.55, 1.05, -9.2); R.phoneH.rotation.set(0, 0, 0);
      R.gap = R.gapTo = 0; R.slamT = -1;
      R.cal.userData.set(d.cal[0], d.cal[1], d.cal[2], d.cal[3]);
      R.fairyPow = null; R.fairyClock = 1;
      for (const c of CUST) { c.rig.root.visible = !!d.cust; park(c.col); }
      if (ext.dress) ext.dress(st, KIT, o);
    }

    // -------------------------------------------------------- ambient life (no allocation)
    const INT = Object.assign({   // interior emissive targets per env (panels, the counter row, ceilings, fairy lights, the Yes sign, the bay)
      day:     { panel: 0.95, row: 0.95, ceil: 1.0, fairy: 0.6, sign: 0.25, bay: 0x3d8fc4 },
      evening: { panel: 0.55, row: 0.95, ceil: 0.6, fairy: 1.3, sign: 0.8, bay: 0x3a7cb0 },
      night:   { panel: 0.0, row: 0.0, ceil: 0.15, fairy: 1.6, sign: 1.0, bay: 0x1b3a66 },
    }, ext.interior || {});
    function envChanged() {
      const I = INT[R.env] || INT.day;
      R.int.panel = I.panel ?? 0.95; R.int.row = I.row ?? R.int.panel; R.int.ceil = I.ceil ?? 1; R.int.fairy = I.fairy ?? 0.6; R.int.sign = I.sign ?? 0.25;
      if (I.bay != null) M.bay.color.setHex(I.bay);
      const day = R.env === 'day' || !R.env;
      R.sun.visible = day; R.shimmer.visible = day && E26;
      R.fairyClock = 1;
    }
    let near = false, root0 = null, pl = null, plOn = false;
    function nearDoor(a) {
      if (a.root.parent !== root0 || !a.root.visible || (a === pl && plOn)) return;
      const dx = a.pos.x + 2, dz = a.pos.z;
      if (dx * dx + dz * dz < 5.3) near = true;
    }
    const WALKP = { speed: 0.42 };
    const ease = (v, to, k) => v + (to - v) * k;
    function update(dt, ctx) {
      if (!R.root) return;
      const t = ctx.t, rf = reduceFx();
      if (typeof state !== 'undefined' && state && state.scene !== R.scene) { R.scene = state.scene; autoDress(R.scene); }
      if (ctx.env !== R.env) { R.env = ctx.env; envChanged(); }
      const ek = Math.min(1, dt * 2.5), I = R.int;
      M.light.emissiveIntensity = ease(M.light.emissiveIntensity, I.panel, ek); M.lightRow.emissiveIntensity = ease(M.lightRow.emissiveIntensity, I.row, ek);
      M.ceil.emissiveIntensity = ease(M.ceil.emissiveIntensity, I.ceil, ek); M.fascia.emissiveIntensity = ease(M.fascia.emissiveIntensity, I.sign, ek);
      // the Remote appears in the junction box once it's wired (1.3)
      if (R.remote && R.dressState === 'wrecked') {
        const w = !!(state && state.flags && state.flags.s13_wired);
        if (w !== R.wired) { R.wired = w; R.remote.visible = w; if (w) R.jbox.userData.open = true; }
      }
      // automatic front doors: open for anyone near them except the player while they roam (Rue's JARVIS door); hold() overrides
      if (R.doorHold === null) {
        near = false; root0 = R.root.parent; pl = ctx.player; plOn = typeof player !== 'undefined' && !!player.enabled;
        if (typeof world !== 'undefined' && world.actors) world.actors.forEach(nearDoor);
      } else near = R.doorHold;
      R.doorT = Math.min(1, Math.max(0, R.doorT + (near ? dt : -dt) / 0.7));
      const dk = smooth(R.doorT);
      R.doorL.position.x = -2.55 - 1.02 * dk; R.doorR.position.x = -1.45 + 1.02 * dk;
      if (R.flipT < 1) {
        const was = R.flipT; R.flipT = Math.min(1, R.flipT + dt / 0.5);
        if (was < 0.5 && R.flipT >= 0.5) { R.signOpen = R.flipTo; R.signO.visible = R.flipTo; R.signC.visible = !R.flipTo; }
        R.sign.rotation.y = R.flipT * PI;
      }
      // hinged doors ease toward userData.open; the backroom door's request() (nine seconds) and bang()
      if (R.reqT >= 0) { R.reqT += dt; if (R.reqT >= 9) { R.bdoor.userData.open = true; R.reqT = -1; } }
      if (R.bangT >= 0) {
        R.bangT += dt; const u = R.bangT / 0.15;
        R.bdoor.rotation.y = u < 1 ? 1.62 * u : 1.5 + 0.12 * Math.cos((R.bangT - 0.15) * 22) * Math.max(0, 1 - (R.bangT - 0.15) / 0.5);
        if (R.bangT > 0.65) { R.bangT = -1; R.bdoor.rotation.y = 1.5; }
      } else if (R.bdoor.userData.open !== undefined) R.bdoor.rotation.y += ((R.bdoor.userData.open ? 1.5 : 0) - R.bdoor.rotation.y) * Math.min(1, dt * 5);
      if (R.odoor.userData.open !== undefined) R.odoor.rotation.y += ((R.odoor.userData.open ? 1.5 : 0) - R.odoor.rotation.y) * Math.min(1, dt * 5);
      if (R.bdoorSolid && !R.bdoor.userData.open && R.bdoor.rotation.y < 0.9) { if (C.bdoor[0] !== 5.95) setBox(C.bdoor, 5.95, -24.05, 6.85, -23.7); }
      else if (C.bdoor[0] !== PARK) park(C.bdoor);
      { const s = R.chair.userData.spin; if (s) { R.chair.userData.seat.rotation.y += s * dt; R.chair.userData.spin = Math.abs(s) < 0.05 ? 0 : s * (1 - 0.55 * dt); } }
      R.jboxK = ease(R.jboxK, R.jbox.userData.open ? 1 : 0, Math.min(1, dt * 4)); R.jbox.rotation.y = 1.745 * R.jboxK;
      // the backroom tube: bursts of flicker (2026); flicker(n) forces n bursts; userData.off; 2040's LED tube is steady
      let tube = 1;
      if (R.tube.userData.off) tube = 0.05;
      else if (R.flickN > 0) { R.flickT += dt; tube = R.flickT % 0.75 < 0.45 && (t * 17) % 1 < 0.45 && !reduceFx() ? 0.12 : 1; if (R.flickT >= 0.75) { R.flickT -= 0.75; R.flickN--; } }
      else if (E26 && Math.sin(t * 1.3) + Math.sin(t * 2.7 + 1) > 1.6 && (t * 17) % 1 < 0.45 && !reduceFx()) tube = 0.12;   // (Reduce Flashing: steady)
      M.tube.emissiveIntensity = tube;
      // the shared clock (both hand pairs), the JARVIS spinners
      R.clockMin += dt / 60;
      for (let i = 0; i < 2; i++) { R.hands[i][0].rotation.z = -R.clockMin / 720 * TAU; R.hands[i][1].rotation.z = -(R.clockMin % 60) / 60 * TAU; }
      R.spins[0].rotation.z -= dt * 6; R.spins[1].rotation.z -= dt * (R.reqT >= 0 ? 14 : 6);
      // the store radio: cones pulse to the beat while playing; LCD lit (2040: "AUX")
      const play = !!R.radio.userData.playing, lcd = play ? (E40 ? 'aux' : 'fm') : 'off';
      if (lcd !== R.radioLcd) { R.radioLcd = lcd; R.lcd.fm.visible = lcd === 'fm'; R.lcd.aux.visible = lcd === 'aux'; R.lcd.off.visible = lcd === 'off'; }
      const cs = play ? 1 + 0.06 * Math.pow(0.5 + 0.5 * Math.cos(t * TAU * 4), 4) : 1;
      R.cones[0].scale.setScalar(cs); R.cones[1].scale.setScalar(cs);
      if (R.wallRing) R.wallHandset.position.y = R.wallHome + 0.002 * Math.sin(t * TAU * 12);
      // the roller door (eased, slam with a bounce) + the light under it; the yard gate
      if (R.slamT >= 0) {
        R.slamT += dt; const u = R.slamT / 0.35;
        R.gap = u < 1 ? R.slamFrom * (1 - u * u) : 0.03 * Math.max(0, Math.sin((R.slamT - 0.35) / 0.25 * PI));
        if (R.slamT > 0.6) { R.slamT = -1; R.gap = 0; }
      } else R.gap = ease(R.gap, R.gapTo, Math.min(1, dt * 12));
      R.roller.position.y = R.gap; R.roller.userData.gap = R.gap;
      if (R.gap < 1.2) setBox(C.roller, 6.6, -30.3, 8.9, -29.95); else park(C.roller);
      M.leak.opacity = Math.min(0.5, R.gap * 1.2); R.leak.visible = R.gap > 0.01;
      R.gateX = ease(R.gateX, R.gateTo, Math.min(1, dt * 4)); R.gate.position.x = R.gateX; setBox(C.gate, R.gateX, -46.22, R.gateX + 4, -46.02);
      smokeTick(R.smB, dt, t);
      if (E26) update26(dt, t, rf);
      // pelicans: heads turn and bob; a bill clack every 8-15 s
      for (let i = 0; i < 2; i++) {
        const p = R.pel[i];
        if (t > p.next) { p.clack = 0; p.next = t + 8 + Math.random() * 7; }
        let pitch = 0.06 * Math.sin(t * 1.7 + i * 2);
        if (p.clack >= 0) { p.clack += dt; pitch -= 0.35 * Math.sin(Math.min(1, p.clack / 0.3) * PI); if (p.clack > 0.3) p.clack = -1; }
        const yaw = p.ry + 0.5 * Math.sin(t * 0.31 + i * 3) * Math.sin(t * 0.13 + i);
        sV.set(p.x + Math.sin(p.ry) * 0.12, 1.3 + 0.01 * Math.sin(t * 2.3 + i), p.z + Math.cos(p.ry) * 0.12);
        sE.set(pitch, yaw, 0, 'YXZ'); sQ.setFromEuler(sE); sS.setScalar(1);
        R.pelH.setMatrixAt(i, sM.compose(sV, sQ, sS));
      }
      R.pelH.instanceMatrix.needsUpdate = true;
      const sc = R.root.parent;
      if (sc && sc.background && sc.fog && R.sky.visible) { SKYM.uniforms.uTop.value.copy(sc.background); SKYM.uniforms.uBot.value.copy(sc.fog.color); }
      if (R.shimmer.visible) T.shim.offset.x = t * 0.035 + Math.sin(t * 2.3) * 0.01;
      if (ext.update) ext.update(dt, ctx, KIT);
    }
    function update26(dt, t, rf) {
      // fairy lights: each bulb twinkles on its own phase (instance colours rewritten at 8 Hz); the tree's bulbs follow the tree
      if (R.fairyDirty) {
        R.fairyDirty = false; R.tree.updateMatrix();
        const n0 = R.fairyTree0, nt = R.fairyTreeL.length / 3, vis = R.tree.visible;
        for (let i = 0; i < nt; i++) {
          if (vis) { sV.set(R.fairyTreeL[i * 3], R.fairyTreeL[i * 3 + 1], R.fairyTreeL[i * 3 + 2]).applyMatrix4(R.tree.matrix); sM.makeTranslation(sV.x, sV.y, sV.z); } else sM.makeScale(0, 0, 0);
          R.fairy.setMatrixAt(n0 + i, sM);
        }
        R.fairy.instanceMatrix.needsUpdate = true;
      }
      R.fairyClock += dt;
      if (R.fairyClock >= 0.125) {
        R.fairyClock = 0;
        const pw = R.fairyPow != null ? R.fairyPow : R.int.fairy, B = 0.3 + 0.7 * Math.min(1, pw / 1.6), a = R.fairy.instanceColor.array, n = R.fairyPh.length;
        for (let i = 0; i < n; i++) {
          const k = B * (rf ? 0.85 : 0.7 + 0.3 * Math.sin(t * (1.3 + (i % 7) * 0.37) + R.fairyPh[i]));
          a[i * 3] = R.fairyBase[i * 3] * k; a[i * 3 + 1] = R.fairyBase[i * 3 + 1] * k; a[i * 3 + 2] = R.fairyBase[i * 3 + 2] * k;
        }
        R.fairy.instanceColor.needsUpdate = true;
      }
      // tinsel shimmer, the hanging strand and the sign's ends in the gusts
      M.tinsel.emissiveIntensity = 0.275 + 0.075 * Math.sin(t * TAU * 0.7);
      R.strand.rotation.z = 0.12 * Math.sin(t * TAU * 0.6); R.strand.rotation.x = 0.05 * Math.sin(t * TAU * 0.43 + 1);
      const gust = Math.max(0, Math.sin(t * 0.37) * Math.sin(t * 0.91 + 1));
      R.tsEnds[0].rotation.x = -0.35 * gust * (0.6 + 0.4 * Math.sin(t * 7)); R.tsEnds[1].rotation.x = -0.3 * gust * (0.6 + 0.4 * Math.sin(t * 6 + 2));
      if (R.phoneRing) R.phoneH.position.y = 1.05 + 0.002 * Math.sin(t * TAU * 12);
      if (R.phoneRing && R.phoneSnd && !skipping() && R.phoneN < R.phoneSnd.max && (R.phoneT -= dt) <= 0) {
        R.phoneT = R.phoneSnd.every; R.phoneN++; if (typeof sfx === 'function') sfx(R.phoneSnd.name, R.phoneSnd.o);
      }
      // the Hero Table: the SPOTLESS glint, the blast timeline, the tethers' pendulums, the alarm pucks and the beacon
      if (R.glintT >= 0) { R.glintT += dt; const u = R.glintT / 0.5; R.glint.position.x = -0.85 + 1.7 * u; if (u >= 1) { R.glintT = -1; R.glint.visible = false; } }
      if (R.blastT >= 0) blastTick(dt);
      if (R.tethers.visible) {
        R.swingA *= Math.pow(0.85, dt);
        for (let i = 0; i < 4; i++) { const per = 1.1 + i * 0.1, ph = i * 1.7; R.tPiv[i].rotation.x = R.swingA * Math.sin(t * TAU / per + ph); R.tPiv[i].rotation.z = R.swingA * 0.6 * Math.sin(t * TAU / (per * 1.13) + ph * 2); }
      }
      M.puck.emissiveIntensity = R.alarmOn ? (rf ? 0.4 + 0.5 * (0.5 + 0.5 * Math.sin(t * PI)) : (t * 2) % 1 < 0.5 ? 1.8 : 0.15) : 0.1;
      R.beams.visible = R.beaconOn && !rf; if (R.beams.visible) R.beams.rotation.y += dt * 5;
      M.beacon.emissiveIntensity = R.beaconOn ? (rf ? 0.6 + 0.3 * Math.sin(t * PI) : 1.6 + 0.4 * Math.sin(t * 20)) : 0.15;
      smokeTick(R.smF, dt, t);
      // the ladder's wobble; the tree falling over
      if (R.wobT >= 0) { R.wobT += dt; const u = R.wobT / 0.6; R.ladTilt.rotation.z = u < 1 ? 0.04 * Math.sin(R.wobT * TAU * 4) * (1 - u) : 0; if (u >= 1) R.wobT = -1; }
      if (R.fallT >= 0) { R.fallT += dt; const u = Math.min(1, R.fallT / 0.6); R.tree.rotation.z = 0.06 + (H - 0.06) * u * u; R.fairyDirty = true; if (u >= 1) setTree('fallen'); }
      // traffic on the front road
      R.cars[0].position.x = ((t * 11) % 140) - 70; R.cars[1].position.x = 70 - ((t * 9 + 60) % 140);
      // customers (A2 / 2027): look at the stock, reach for something, drift a step along the display now and then
      for (let i = 0; i < CUST.length; i++) {
        const c = CUST[i], r = c.rig.root;
        if (!r.visible) continue;
        let want = c.pick, face = c.ry;
        if (Math.abs(c.to - c.z) > 0.02) { const sg = Math.sign(c.to - c.z); c.z += sg * Math.min(Math.abs(c.to - c.z), 0.7 * dt); want = 'walk'; face = sg > 0 ? 0 : PI; }
        else if ((c.t -= dt) <= 0) {
          const k = Math.random(); c.t = 2.5 + Math.random() * 3.5;
          if (k < 0.3) c.to = c.z0 + Math.random() * (c.z1 - c.z0); else c.pick = k < 0.5 ? 'point' : k < 0.7 ? 'look_down' : k < 0.8 ? 'phone' : 'idle';
        }
        if (want !== c.a) { c.a = want; c.at = 0; }
        c.at += dt; c.yaw += ((((face - c.yaw + PI) % TAU) + TAU) % TAU - PI) * Math.min(1, dt * 6);
        r.position.set(c.x, 0, c.z); r.rotation.y = c.yaw;
        c.rig.pose(c.a, c.at, WALKP); c.rig.update(dt);
        c.col[0] = c.x - 0.28; c.col[1] = c.z - 0.28; c.col[2] = c.x + 0.28; c.col[3] = c.z + 0.28;
      }
    }
    function blastTick(dt) {
      const bt = (R.blastT += dt), rf = reduceFx();
      if (rf) { const u = Math.min(1, bt / 1.2); R.flash.scale.setScalar(0.2 + 2.3 * smooth(u)); M.blast.opacity = 0.5 * (1 - smooth((bt - 0.6) / 0.6)); }
      else { R.flash.scale.setScalar(bt < 0.12 ? 0.01 + 2.5 * bt / 0.12 : 2.5 + (bt - 0.12) * 0.6); M.blast.opacity = bt < 0.12 ? 1 : Math.max(0, 1 - (bt - 0.12) / 0.4); }
      R.flash.visible = M.blast.opacity > 0.01;
      const u = Math.min(1, bt / 0.8);
      for (let i = 0; i < 2; i++) {
        const ph = R.tPhones[i], h = PHONE_HOME[i], l = PHONE_LAND[i], k = u * (2 - u);
        ph.position.set(h[0] + (l[0] - h[0]) * k, h[1] + (l[1] - h[1]) * u + 4 * (i ? 0.9 : 1.7) * u * (1 - u), h[2] + (l[2] - h[2]) * k);
        ph.rotation.set(l[3] * u + (1 - u) * bt * 14, l[4] * u + bt * 9 * (1 - u), (1 - u) * bt * 11);
      }
      shardsAt(u);
      if (bt >= 0.25 && R.blastStage < 1) { R.blastStage = 1; if (R.blastTree) R.tree.userData.fall(); }
      if (bt >= 0.3 && R.blastStage < 2) { R.blastStage = 2; setTinselYes('fallen'); R.tinselFloor.visible = true; }
      if (bt >= 1.2) { R.blastT = -1; R.flash.visible = false; shardsAt(1); }
    }

    // -------------------------------------------------------- the kit handed to ext (reddy40)
    const KIT = {
      era, E40, ID, PI, H, TAU, TINT: { OUT, IN, BOH }, RG, PARK,
      box, bb, boxR, cyl, ico, tor, quad, quadR, quadUV, label, wall, part, at, seg, rod, garland, swags, geoOf,
      P: (g) => P(g), setTint: (t) => { tint = t; }, resetXF: () => { XF = null; },
      text, FONT, yes, flake, santaHat, paintTV, paintCal, canvasTex: (...a) => canvasTex(...a), mat: (...a) => mat(...a), matTex: (...a) => matTex(...a),
      instanced: (...a) => instanced(...a), rnd: () => rnd(), seed: (n) => { seed = n; }, skipping, reduceFx, smooth, park, setBox,
      dress: (s, o) => dress(s, o), smokeTo: (s, k, d) => smokeTo(s, k, d),
      get M() { return M; }, get T() { return T; }, get R() { return R; }, get COL() { return COL; }, get C() { return C; }, get root() { return R.root; },
    };

    // -------------------------------------------------------- data
    const SHELL_ENV = E26 ? {
      day:     { bg: 0x8fd0ff, fog: [0xf4d8a8, 0.012], hemi: [0xf2f6ff, 0xb39070, 1.15], dir: [0xfff4e0, 1.7, [3, 14, 4]], spot: [0xffffff, 0], rain: 0 },
      evening: { bg: 0xf0a868, fog: [0xe8a070, 0.014], hemi: [0xffd9b0, 0x6a5a6a, 0.85], dir: [0xffb070, 1.0, [-2, 4, 14]], spot: [0xffffff, 0], rain: 0 },
      night:   { bg: 0x0f1a33, fog: [0x101a30, 0.02], hemi: [0x5a6a99, 0x1a1a26, 0.45], dir: [0x8fa8ff, 0.35, [-6, 12, 8]], spot: [0xfff2d6, 1.2], rain: 0 },
    } : {};

    const MARKS = {
      // Rue's generic marks (kept, same coordinates)
      carpark_start: [-2.0, 0, 20.5, PI], carpark_mid: [-2.0, 0, 9.0, PI], carpark_door: [-2.0, 0, 1.4, 0],
      door_in: [-2.0, 0, -1.2, PI], keypad: [-4.4, 0, -1.0, 0], window: [7.5, 0, -0.9, 0],
      aisle_end: [-2.0, 0, -4.6, PI], wall_front: [-2.0, 0, -13.2, PI], floor_center: [3.4, 0, -5.4, -2.6],
      counter_luka: [6.4, 0, -10.25, 0], counter_chase: [4.3, 0, -10.25, 0], jordan_counter: [5.35, 0, -10.25, 0],
      counter_customer: [6.4, 0, -7.85, PI], counter_customer2: [4.3, 0, -7.85, PI],
      noticeboard: [10.25, 0, -11.55, H], luke_phone: [9.4, 0, -10.55, -2.03], luke_out: [9.9, 0, -11.3, 0.4],
      office_door: [9.9, 0, -11.7, PI], office_door_in: [9.9, 0, -13.5, PI], office_desk: [9.25, 0, -16.35, 0],
      browse_1: [-7.0, 0, -6.0, -H], browse_2: [-3.3, 0, -6.2, -H], browse_3: [1.5, 0, -10.0, -H], browse_4: [10.3, 0, -5.9, H],
      corridor_start: [6.4, 0, -13.4, PI], backroom_door_out: [6.4, 0, -23.1, PI], backroom_door_in: [6.4, 0, -24.9, PI], doorway: [6.4, 0, -24.15, PI],
      bench: [4.4, 0, -28.75, PI], kettle: [9.45, 0, -28.6, H], tv_luka: [6.95, 0, -24.45, 2.09], tv_chase: [7.35, 0, -29.1, 0.77],
      floor_luka: [5.8, 0, -27.2, 0.3], floor_chase: [7.0, 0, -27.2, -0.3], bench_luka: [3.6, 0, -28.65, 2.0], bench_chase: [5.3, 0, -28.2, -2.2],
      // 1.1 (the ladder's third tread is at z -11.68: the "top" marks stand on it)
      s11_polish: [5.6, 0, -6.35, 0], s11_chase_phone: [7.15, 0, -9.95, 0], s11_chase_lean: [6.25, 0, -6.2, -0.4],
      s11_jordan_top: [4.05, 1.26, -11.7, PI], s11_jordan_down: [4.75, 0, -10.9, -2.5], s11_luka_ladder: [4.05, 0, -11.15, PI],
      s11_luka_top: [4.05, 1.26, -11.7, PI], s11_luka_counter: [6.6, 0, -7.75, PI], s11_chase_counter: [6.6, 0, -9.95, 0], s11_jordan_till: [6.0, 0, -7.8, PI],
      // 1.2
      s12_luka_admire: [5.6, 0, -7.05, 0], s12_luka_apex: [5.6, 1.6, -8.95, 0], s12_luka_land: [5.6, 0, -10.35, 0], s12_figure: [5.6, 0, -5.3, PI],
      s12_luka_over: [5.4, 0, -7.9, 0], s12_c40_brush: [5.5, 0, -7.25, PI], s12_chase_frozen: [7.15, 0, -9.95, 0],
      s12_exit_1: [8.7, 0, -9.0, PI], s12_exit_2: [6.4, 0, -12.2, PI],
      // 1.3
      s13_setup_c40: [5.7, 0, -26.4, 0.9], s13_setup_luka: [6.9, 0, -25.6, -2.4], s13_setup_chase: [7.2, 0, -26.7, -1.9],
      s13_window_c40: [6.6, 0, -24.6, 0], s13_luke_stare: [6.4, 0, -11.7, 0], s13_stall_luka: [6.4, 0, -18.2, 0], s13_stall_luke: [6.4, 0, -16.8, PI],
      s13_luke_door: [6.4, 0, -23.25, PI], s13_c40_pass_a: [5.2, 0, -24.65, H], s13_c40_pass_b: [7.9, 0, -24.65, H],
      s13_wire_chase: [4.3, 0, -24.6, 0], s13_wire_c40: [5.15, 0, -25.0, -0.5], s13_record: [6.4, 0, -24.45, 0],
      s13_call_c40: [4.3, 0, -24.65, 0], s13_call_luka: [3.55, 0, -24.95, 0.35], s13_call_chase: [5.05, 0, -24.95, -0.35],
      s13_luke_out: [6.4, 0, -12.0, 0], s13_jordan_ladder: [4.6, 0, -11.25, -2.8],
      // PC
      pc_jordan_mid: [6.0, 0, -6.9, -2.6], pc_jordan_phone: [7.15, 0, -8.05, PI - 0.22], pc_luke_desk: [9.25, 0, -16.35, 0],
      pc_ladder_pick: [8.35, 0, -8.25, -2.2], pc_ladder_path: [9.3, 0, -10.3, -1.9], pc_ladder_set: [4.05, 0, -11.15, PI],
      // endings
      a1_luke_count: [7.05, 0, -9.95, 0], a1_luke_door: [6.4, 0, -24.55, PI], b1_luka_polish: [5.6, 0, -6.35, 0], b1_chase_sit: [6.9, 1.0, -9.0, 0],
      a2_luka_polish: [5.6, 0, -6.35, 0], a2_chase: [6.75, 0, -6.6, -0.6], a2_jordan_top: [4.05, 1.26, -11.7, PI], a2_luka_hold: [4.05, 0, -11.15, PI],
      b27_luka_top: [4.05, 1.26, -11.7, PI], b27_jordan: [4.7, 0, -11.0, -2.6],
    };
    const ANCHORS = {
      // Rue's (kept)
      monitor:        { at: [6.4, 1.3, -9.03], from: [6.44, 1.36, -8.3], fov: 40 },
      monitor2:       { at: [4.3, 1.3, -9.03], from: [4.3, 1.33, -9.75], fov: 34 },   // from the staff side (the screen faces it)
      monitor_screen: { at: [6.4, 1.3, -9.03], from: [6.4, 1.32, -9.72], fov: 32 },
      display_wall:   { at: [-2.0, 1.3, -14.2], from: [-2.0, 1.62, -5.0], fov: 30 },
      door_sign:      { at: [-1.45, 1.5, -0.1], from: [-1.4, 1.56, -1.05], fov: 30 },
      doors:          { at: [-2.0, 1.3, 0], from: [-2.0, 1.6, -4.2], fov: 40 },
      keypad:         { at: [-4.4, 1.45, -0.4], from: [-4.4, 1.5, -0.95], fov: 30 },
      targets_board:  { at: [8.4, 1.65, -12.46], from: [8.4, 1.62, -11.1], fov: 42 },
      noticeboard:    { at: [10.95, 1.52, -11.6], from: [9.85, 2.12, -11.6], fov: 46 },   // over the reader's head, down onto the board
      calendar:       { at: [10.96, 1.55, -10.35], from: [10.0, 1.55, -10.35], fov: 34 },
      queue_machine:  { at: [0.66, 1.24, -1.9], from: [-0.4, 1.4, -1.9], fov: 32 },
      pot_plant:      { at: [10.3, 0.85, -0.85], from: [10.0, 1.35, -2.35], fov: 36 },   // past the tree's right, not through it
      accessories:    { at: [-8.9, 1.4, -7.8], from: [-5.9, 1.65, -7.8], fov: 48 },
      sim_rack:       { at: [10.9, 1.25, -5.9], from: [9.4, 1.45, -5.9], fov: 40 },
      office_door:    { at: [9.9, 1.35, -12.6], from: [9.7, 1.55, -10.4], fov: 42 },
      yes_wall:       { at: [4.05, 1.95, -12.46], from: [4.1, 1.8, -7.3], fov: 40 },
      front_glass:    { at: [-1.0, 1.1, 10], from: [1.6, 1.55, -2.6], fov: 50 },
      sign:           { at: [-2.0, 4.32, 0.4], from: [-2.0, 2.0, 13], fov: 30 },
      sky:            { at: [-2.0, 54, -26], from: [-2.0, 30, 34], fov: 50 },
      wall_clock:     { at: [4.4, 2.35, -29.96], from: [4.4, 2.2, -29.05], fov: 30 },
      tv:             { at: [9.92, 1.82, -26.2], from: [9.0, 1.72, -26.2], fov: 32 },
      bench:          { at: [4.4, 0.95, -29.6], from: [4.4, 1.85, -28.35], fov: 42 },
      lost_property:  { at: [9.65, 0.45, -24.5], from: [8.55, 1.4, -25.5], fov: 36 },
      kettle:         { at: [10.08, 1.05, -28.55], from: [9.25, 1.35, -28.5], fov: 32 },
      backroom_door:  { at: [6.4, 1.2, -23.9], from: [6.4, 1.5, -20.3], fov: 40 },
      backroom_window:{ at: [5.75, 1.25, -22.5], from: [6.76, 1.52, -25.25], fov: 22 },
      ots_chase:      { at: [4.2, 1.3, -7.85], from: [4.62, 1.72, -11.0], fov: 45 },
      ots_luka:       { at: [6.3, 1.3, -7.85], from: [6.72, 1.72, -11.0], fov: 45 },
      ceiling_corner: { at: [3.4, 1.0, -5.4], from: [10.7, 3.05, -0.4], fov: 42 },
      store_back:     { at: [-1.6, 1.2, -0.5], from: [1.9, 1.75, -13.6], fov: 45 },
      luke_call:      { at: [11, 1.5, -11.0], from: [7.3, 1.58, -10.0], fov: 40 },
      corridor_wide:  { at: [5.95, 0.95, -22.6], from: [7.15, 1.3, -18.3], fov: 42 },
      backroom_wide:  { at: [6.8, 0.9, -28.6], from: [3.2, 2.1, -24.3], fov: 55 },   // Rue's exact Act One frame: never move it
      // 1.1
      s11_crane_a:    { at: [-2.0, 50, -20], from: [-2.0, 30, 30], fov: 50 },
      s11_crane_b:    { at: [-4.0, 4.8, 0.5], from: [-3.3, 5.6, 4.4], fov: 40 },
      s11_crane_c:    { at: [-2.0, 1.2, 0.0], from: [-1.2, 1.4, 9.0], fov: 45 },
      s11_crane_d:    { at: [-2.0, 1.3, -6.0], from: [-2.0, 1.5, 1.6], fov: 48 },
      s11_mid_glass:  { at: [5.6, 1.15, -8.5], from: [5.6, 1.45, 2.6], fov: 34 },
      hero_glass:     { at: [5.5, 0.95, -5.3], from: [5.15, 1.35, -5.95], fov: 32 },
      hero_top:       { at: [5.6, 0.95, -5.3], from: [5.6, 1.9, -5.9], fov: 40 },
      hero_phones:    { at: [5.6, 1.05, -5.3], from: [5.6, 1.35, -4.35], fov: 34 },
      s11_ladder_low: { at: [4.05, 2.4, -11.9], from: [4.7, 0.45, -10.2], fov: 50 },
      s11_ladder_ots: { at: [4.05, 2.7, -12.3], from: [4.45, 1.0, -10.8], fov: 46 },
      xmas_tree:      { at: [9.25, 0.8, -1.0], from: [7.7, 1.45, -2.6], fov: 40 },
      office_door_sign: { at: [9.9, 1.55, -12.59], from: [9.9, 1.58, -11.85], fov: 32 },
      // the Wall's close-ups: lenses 0.42-0.5 m off the wall (the same framing, wider), between it and whoever reads it
      wall_polaroid:  { at: [5.42, 1.62, -19.55], from: [5.84, 1.62, -19.55], fov: 41 },
      wall_cassette:  { at: [5.43, 1.58, -20.05], from: [5.85, 1.6, -20.05], fov: 43 },
      wall_note:      { at: [5.42, 1.70, -20.45], from: [5.84, 1.7, -20.45], fov: 30 },
      wall_missing:   { at: [5.42, 1.55, -20.95], from: [5.92, 1.57, -20.95], fov: 54 },
      wall_flyer:     { at: [5.42, 1.62, -21.5], from: [5.87, 1.62, -21.5], fov: 44 },
      wall_all:       { at: [5.42, 1.6, -20.5], from: [7.3, 1.62, -20.5], fov: 50 },
      rue_mug:        { at: [9.98, 0.97, -28.78], from: [9.35, 1.2, -28.7], fov: 26 },
      ceiling_scorch: { at: [5.9, 2.8, -26.6], from: [6.9, 1.2, -25.0], fov: 52 },
      do_not_paint:   { at: [5.95, 2.78, -26.45], from: [5.95, 1.85, -25.6], fov: 28 },
      laptop:         { at: [3.95, 1.05, -29.65], from: [3.95, 1.3, -29.0], fov: 32 },
      clock_floor:    { at: [8.4, 2.62, -12.46], from: [8.4, 2.4, -11.5], fov: 28 },
      // 1.2
      s12_heroic:     { at: [5.6, 1.56, -7.05], from: [5.3, 1.02, -4.48], fov: 43 },   // just above the glass top (1.2 / B1's HEROIC)
      s12_twoshot:    { at: [6.1, 1.4, -8.4], from: [6.95, 1.45, -5.3], fov: 46 },     // from the table's right end: the monitor clear of Chase
      floor_locked:   { at: [4.6, 0.9, -8.2], from: [-8.6, 2.9, -0.6], fov: 55 },
      s12_midair:     { at: [5.6, 1.45, -7.6], from: [3.5, 1.45, -10.5], fov: 40 },   // side-on from the staff side: Luka mid-air, the display blowing apart behind him
      s12_pov_upside: { at: [5.55, 1.3, -5.3], from: [5.6, 0.32, -10.0], fov: 48 },
      // 1.3
      s13_window_pov: { at: [6.4, 1.35, -11.8], from: [6.4, 1.6, -25.1], fov: 20 },
      door_window:    { at: [6.4, 1.52, -23.87], from: [6.4, 1.6, -24.6], fov: 30 },
      jbox:           { at: [4.3, 0.95, -24.0], from: [4.3, 1.0, -24.45], fov: 34 },
      wall_phone:     { at: [4.3, 1.45, -24.0], from: [4.5, 1.5, -24.75], fov: 36 },
      split_a:        { at: [4.4, 1.55, -24.3], from: [8.4, 1.65, -29.3], fov: 50 },
      split_b:        { at: [6.4, 1.3, -27.5], from: [4.0, 1.6, -24.4], fov: 52 },
      floor_wreck_wide: { at: [6.4, 1.0, -10.0], from: [10.4, 2.5, -1.7], fov: 52 },   // PC: the wreck, the counter, the Yes wall, Luke at his desk through the open office door
      // PC, endings
      counter_phone:  { at: [7.55, 1.03, -9.24], from: [7.52, 1.9, -8.72], fov: 34 },   // over the counter, steep: hands in from both sides (the A coda's lens; PC's HOLD insert)
      a1_split_store: { at: [5.86, 1.1, -8.45], from: [8.2, 2.0, -0.8], fov: 50 },   // the split's right half: the wrapped table left, Luke at the till right
      home_door:      { at: [6.4, 1.35, -24.0], from: [7.4, 1.25, -28.9], fov: 46 },
      b1_night_floor: { at: [6.0, 1.1, -8.0], from: [2.0, 1.55, -2.4], fov: 46 },
      table_downlight:{ at: [5.6, 0.95, -5.3], from: [5.6, 3.1, -5.0] },
      a2_polish:      { at: [5.7, 0.95, -5.6], from: [3.4, 1.5, -3.3], fov: 40 },
      a2_ladder:      { at: [4.1, 2.25, -11.9], from: [6.7, 1.55, -9.9], fov: 54 },   // A2 frame 2 / B1 2027: the man up the ladder head to toe, the one holding it
      a2_wall:        { at: [5.42, 1.8, -19.8], from: [6.7, 1.75, -19.75], fov: 40 },
    };
    const CAMS = {
      staff:        { type: 'pan', pos: [1.6, 2.35, -5.6], base: [7.6, 1.1, -11.2], look: 'player', fov: 46, limit: 0.6 },
      corridor:     { type: 'push', pos: [6.4, 1.95, -11.0], to: [6.4, 1.85, -15.0], look: 'player', fov: 44, dur: 25 },
      office:       { type: 'pan', pos: [7.9, 2.45, -12.95], base: [9.6, 0.7, -16.0], look: 'player', fov: 55, limit: 0.5 },
      backroom:     { type: 'fixed', pos: [3.2, 2.1, -24.3], look: [6.8, 0.9, -28.6], fov: 55 },
      backroom_rev: { type: 'pan', pos: [9.9, 2.4, -29.6], base: [5.0, 0.8, -24.8], look: 'player', fov: 55, limit: 0.45 },
      entrance:     { type: 'pan', pos: [-8.3, 2.85, -5.9], base: [-2.0, 1.0, -0.6], look: 'player', fov: 50, limit: 0.5 },
      counter:      { type: 'pan', pos: [10.5, 2.7, -0.8], base: [4.8, 1.0, -8.6], look: 'player', fov: 48, limit: 0.6 },
      aisle:        { type: 'pan', pos: [-2.0, 1.95, -0.6], base: [-2.0, 1.3, -14.5], look: 'player', fov: 40, limit: 0.3 },
      accessories:  { type: 'pan', pos: [-8.4, 2.8, -3.6], base: [-6.2, 0.9, -11.5], look: 'player', fov: 50, limit: 0.65 },
      shopfront:    { type: 'pan', pos: [12.6, 1.35, 4.4], base: [-3.0, 1.3, 1.4], look: 'player', fov: 42, limit: 0.55 },
      carpark:      { type: 'pan', pos: [-9.6, 1.75, 22.9], base: [-1.0, 1.8, 3.0], look: 'player', fov: 42, limit: 0.6 },
    };
    const ZONES = [
      { box: [2.6, -12.5, 11, -9.45], cam: 'staff' },          // staff aisle (ladder, phone, till)
      { box: [5.4, -12.75, 7.4, -12.5], cam: 'staff' },        // corridor threshold
      { box: [5.4, -23.75, 7.4, -12.75], cam: 'corridor' },    // corridor + the Wall; 1.3 Stall
      { box: [7.4, -17, 11, -12.5], cam: 'office' },
      { box: [2.4, -26.2, 5.2, -23.75], cam: 'backroom_rev' }, // the wall phone corner (Wiring, 1.3_call)
      { box: [2.4, -30, 10.4, -23.75], cam: 'backroom' },
      { box: [-9, -3.5, 1.5, 0], cam: 'entrance' },
      { box: [1.5, -9.45, 11, 0], cam: 'counter' },            // Hero Table, tree, counter front
      { box: [-3.85, -14.5, 2.6, -8.6], cam: 'aisle' },
      { box: [-3.85, -8.6, 1.5, -3.5], cam: 'aisle' },
      { box: [-9, -14.5, -3.85, -3.5], cam: 'accessories' },
      { box: [-17, 0, 17, 8], cam: 'shopfront' },
      { box: [-17, 8, 17, 25], cam: 'carpark' },
    ];
    const PROPLIST = [
      'hero_table', 'hero_body', 'hero_phone_1', 'hero_phone_2', 'hero_phone_3', 'hero_phone_4', 'hero_smudge', 'hero_smudge1', 'hero_handprint', 'hero_glint',
      'hero_wreck', 'hero_tethers', 'tether_loose', 'alarm_beacon', 'glass_shards', 'blast_flash', 'hero_wrap', 'plastic_heap',
      'tinsel_static', 'tinsel_strand', 'tinsel_sign', 'tinsel_yes', 'tinsel_floor', 'tinsel_coil', 'fairy_lights', 'snow_spray', 'xmas_tree', 'aframe_sign',
      'door_l', 'door_r', 'door_sign', 'store_radio', 'store_phone', 'cash_tray', 'monitor_screen', 'ladder', 'clock_floor_hands', 'clock_hands',
      'calendar', 'office_door', 'swivel_chair', 'straightener', 'cust26_a', 'cust26_b',
      'the_wall', 'print4', 'backroom_door', 'tube', 'scorch', 'kettle', 'rue_mug', 'tv_screen', 'laptop', 'wall_phone', 'wall_phone_handset',
      'jbox_lid', 'remote_plugged', 'roller_door', 'door_light_leak', 'smoke_floor', 'smoke_backroom', 'yard_gate', 'pelicans', 'traffic', 'roof', 'sun', 'sky_horizon', 'shimmer',
    ];
    const zones = ext.zones || ZONES;
    const def = {
      env: Object.assign({}, SHELL_ENV, ext.env || {}),
      build,
      marks: Object.assign({}, MARKS, ext.marks || {}),
      anchors: Object.assign({}, ANCHORS, ext.anchors || {}),
      cams: Object.assign({}, CAMS, ext.cams || {}),
      zones,
      colliders: COL,
      props: E26 ? PROPLIST.slice() : PROPLIST.filter((n) => !/^(hero_|tinsel_|fairy|snow|aframe|tether_loose|alarm_beacon|glass_shards|blast_flash|plastic_heap|store_phone|cash_tray|monitor_screen|ladder|calendar|cust26|the_wall$|print4|kettle|rue_mug|laptop|remote_plugged|traffic|shimmer)/.test(n)).concat('the_wall40', ext.props || []),
      ambience: ext.ambience || { loops: ['aircon', 'fluoro'], room: 'room' },
      update,
      dress: (s, o) => dress(s, o),
      get dressState() { return R.dressState; },
      kit: KIT,
    };
    if (ext.floor) def.floor = ext.floor;
    return def;
  }

  const def = makeReddy('2026');
  def.make = makeReddy;
  return def;
})();
