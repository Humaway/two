// ============================================================ CONFIG
// Tuning numbers, colours, text speeds, bindings, shared registries and the
// game state. Every other fragment fills these registries; the engine plays them.

const CONFIG = {
  step: 1 / 60, maxFrame: 0.25,                  // fixed update step, clamp for long frames
  walk: 1.7, run: 3.4, carry: 1.0, turn: 3.2,    // m/s, m/s, m/s, rad/s (tank turn)
  radius: 0.3,                                   // actor collision radius (m)
  text: { slow: 24, normal: 48, fast: 110 },     // typewriter chars per second
  beat: 0.8,                                     // seconds for a '^' beat inside a line
  fov: 40, ecuFov: 30,
  dist: { ECU: 0.35, CLOSE: 0.9, MID: 1.8, WIDE: 7 },
  duck: 0.6,                                     // music gain under dialogue (40% duck)
  record: 1,                                     // hold YES this long (s) to record a sample (spec 13.6)
  latch: 5,                                      // options.holdToPress: a press "holds" for at most this long (s)
  colors: {
    navy: '#141d3a', yes: '#ffd21f', chaseBlue: '#1f6fe0', polo: '#15161a',
    lanyard: '#3fb6e8', jarvis: '#2f6fd6', jarvisBar: '#d9dce1',
    safe: '#7fc8ff', fadedLanyard: '#8fb4c8',    // SafeSense glow / Luka's thirty-nine-years-in-a-box lanyard
  },
  // Every action is derived from these two maps (input's action list is built from their keys).
  keys: {
    yes: ['Enter', 'Space', 'NumpadEnter'], no: ['Escape', 'Backspace'], swap: ['Tab'], chip: ['KeyQ'],
    inventory: ['KeyI'], run: ['ShiftLeft', 'ShiftRight'], pause: ['KeyP'],
    up: ['KeyW', 'ArrowUp'], down: ['KeyS', 'ArrowDown'], left: ['KeyA', 'ArrowLeft'], right: ['KeyD', 'ArrowRight'],
  },
  // standard gamepad: A yes, B no, X inventory (BAG), Y swap, LB chip, RB run, Start pause, d-pad
  pad: { yes: 0, no: 1, inventory: 2, swap: 3, chip: 4, run: 5, pause: 9, up: 12, down: 13, left: 14, right: 15 },
};

// ------------------------------------------------------------ registries
const SETS = {};        // SETS[id] = { env, build(), marks, anchors, cams, zones, colliders, exits, floor?, update? }
const LOOKS = {};       // LOOKS[charId] = art description used by buildCharacter(); `warm: n` pre-builds n rigs at boot
const ANIMS = {};       // ANIMS[name] = (rig, t, p) => pose
const ITEMS = {};       // ITEMS[id] = { name, desc, icon?, examine?, flip?, combine? } (the nine of spec 13.2 are below)
const SCENES = {};      // SCENES[id] = { title, set, env, time, place, timeCard?, playable, swap, hud, music, spawn, hotspots, steps, grants, next?, branch? }
const CUTSCENES = {};   // CUTSCENES[id] = [ step, step, ... ]
const STRINGS = {};     // UI strings
const MINIGAMES = {};   // MINIGAMES[id] = { start(params, api), update(dt), draw(), end(result), autoplay?(api), noSkip?, skipResult? }
const CARDS = {};       // CARDS[kind] = (ctx, w, h, data) => paints a readable INSERT card

// Play order. After 3.7 the flow branches on state.choice ('A' -> A1, A2, C, PC; 'B' -> B1, B2, C, PC);
// any scene may also define next(state) -> id. A1/A2/B1/B2 stay in the list for Chapter Select.
const SCENE_ORDER = [
  'P', '1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '1.7', '1.8',
  '2.1', '2.2', '2.3', '2.4', '2.5', '2.6', '2.7', '2.8', '2.9', '2.10',
  '3.1', '3.2', '3.3', '3.4', '3.5', '3.6', '3.7',
  'A1', 'A2', 'B1', 'B2', 'C', 'PC',
];

// Act cards (spec section 7), shown on black before these scenes. ui.actCard splits on ' — '.
const ACTS = {
  '1.1': 'ACT ONE — Will You Accept the Charges?',
  '2.1': "ACT TWO — Are You Sure You're Sure?",
  '3.1': 'ACT THREE — Two',
};

// Speaker ids (ARCHITECTURE 3.1). `name` is what the dialogue box shows; `voice` is the blip (spec section 4).
//   wave: 'square' | 'triangle' | 'sine' | 'sawtooth' | 'pulse' (narrow square), f: base Hz, len: blip seconds,
//   gap: extra silence between blips, filter: lowpass Hz, soft: gentler attack, tumble: pitch varies per blip (Chase),
//   mono: flat, no formant/glide (operator, drones), pure: no harmonic body (Des),
//   ring: ring-modulation Hz (the masked Manager), band: [lo, hi] Hz phone band + hiss: 0..1 tape hiss (voicemail).
// `actor`: the actor that speaks the line (expressions, acts, mouth) when it isn't the speaker id itself.
// `silhouette`: the dialogue portrait is a silhouette, never a face (THE MANAGER until the reveal, FIGURE, VOICE).
// `duo`: two speakers saying one line together (both mouths, split portrait, both blips).
const V_LUKA = { wave: 'square', f: 110, len: 0.045 };
const V_CHASE = { wave: 'triangle', f: 260, len: 0.035, tumble: true };
const V_CHASE40 = { wave: 'triangle', f: 200, len: 0.055, soft: true, filter: 2600 };
const CHARACTERS = {
  luka:      { name: 'LUKA',          actor: 'luka',    voice: V_LUKA },
  chase:     { name: 'CHASE',         actor: 'chase',   voice: V_CHASE },
  chase40:   { name: 'CHASE (2040)',  actor: 'chase40', voice: V_CHASE40 },
  figure:    { name: 'FIGURE',        actor: 'chase40', silhouette: true, voice: V_CHASE40 },   // 1.2, out of the smoke
  voice:     { name: 'VOICE',         actor: 'chase40', silhouette: true, voice: V_CHASE40 },   // 1.2, down the line
  manager:   { name: 'THE MANAGER',   actor: 'luka40',  silhouette: true,                       // hooded; drone filter
    voice: { wave: 'sawtooth', f: 95, len: 0.06, filter: 900, ring: 47 } },
  luka40:    { name: 'LUKA (2040)',   actor: 'luka40',  voice: { wave: 'square', f: 100, len: 0.055, soft: true } },
  jordan:    { name: 'JORDAN',        actor: 'jordan',  voice: { wave: 'triangle', f: 230, len: 0.04 } },
  jordan40:  { name: 'JORDAN',        actor: 'jordan40', voice: { wave: 'sine', f: 225, len: 0.05, soft: true } },
  luke:      { name: 'LUKE',          actor: 'luke',    voice: { wave: 'square', f: 160, len: 0.045 } },
  luke40:    { name: 'LUKE',          actor: 'luke40',  voice: { wave: 'square', f: 150, len: 0.05 } },
  rue:       { name: 'RUE',           actor: 'rue',     voice: { wave: 'sine', f: 130, len: 0.07, soft: true } },    // 2.4 only
  des:       { name: 'DES',           voice: { wave: 'sine', f: 300, len: 0.03, pure: true } },     // the kettle: polite
  teddy:     { name: 'TEDDY',         actor: 'teddy',   voice: { wave: 'sine', f: 120, len: 0.08, gap: 0.03, soft: true } },
  mia:       { name: 'MIA',           actor: 'mia',     voice: { wave: 'triangle', f: 270, len: 0.035 } },
  nadia:     { name: 'NADIA',         actor: 'nadia',   voice: { wave: 'triangle', f: 225, len: 0.04 } },
  jayden:    { name: 'JAYDEN',        actor: 'jayden',  voice: { wave: 'square', f: 125, len: 0.045, filter: 1100 } },
  drone:     { name: 'DRONE',         voice: { wave: 'square', f: 420, len: 0.04, mono: true, filter: 2200 } },
  safesense: { name: 'SAFESENSE',     voice: { wave: 'triangle', f: 350, len: 0.03, tumble: true } },   // chirpy
  operator:  { name: 'OPERATOR',      voice: { wave: 'square', f: 330, len: 0.06, mono: true, filter: 2500 } },
  margaret:  { name: 'MARGARET',      voice: { wave: 'sine', f: 220, len: 0.07, soft: true } },   // voice only (PC)
  voicemail: { name: "LUKA'S VOICEMAIL", voice: { wave: 'square', f: 110, len: 0.045, band: [300, 3400], hiss: 0.35 } },
  // minor speakers: simple generic blips
  hr:        { name: 'HR',            voice: { wave: 'triangle', f: 240, len: 0.04 } },
  desk:      { name: 'DESK',          voice: { wave: 'sine', f: 210, len: 0.045, soft: true } },
  passenger: { name: 'PASSENGER',     voice: { wave: 'triangle', f: 205, len: 0.04 } },
  lifeguard: { name: 'LIFEGUARD DRONE', voice: { wave: 'square', f: 380, len: 0.04, mono: true, filter: 1800 } },
  hovercar:  { name: 'HOVER-CAR',     voice: { wave: 'triangle', f: 440, len: 0.03, mono: true } },
  door_drone: { name: 'DOOR DRONE',   voice: { wave: 'square', f: 400, len: 0.04, mono: true, filter: 2400 } },
  train:     { name: 'TRAIN ANNOUNCEMENT', voice: { wave: 'square', f: 290, len: 0.05, mono: true, filter: 1600 } },
  voice1:    { name: 'VOICE 1',       silhouette: true, voice: { wave: 'square', f: 102, len: 0.05, soft: true } },   // A2 coda: we never see faces
  voice2:    { name: 'VOICE 2',       silhouette: true, voice: { wave: 'triangle', f: 215, len: 0.045, soft: true } },
  // together (2.2): "—not right."
  chases:    { name: 'CHASE AND CHASE (2040)', duo: ['chase', 'chase40'], voice: V_CHASE },
};
// The actor a speaker id animates ('manager' -> 'luka40'); itself when it has none.
const speakerActor = (id) => (CHARACTERS[id] && CHARACTERS[id].actor) || id;

// People you can meet, in story order (state.names, the People extras, the credits' Polaroids).
const NAMES = ['Jordan', 'Luke', 'Des', 'Teddy', 'Mia', 'Nadia', 'Jayden'];

// Chase's phone samples (spec 13.6). `sfx` is the AUDIO recipe that doubles as the sample ('smp_' + id);
// `where` is the credits line ("Samples collected"); `lure` = how far (m) and how long (s) a thrown sample pulls drones.
const SAMPLES = {
  alarm:   { label: 'Display alarm',     sfx: 'smp_alarm',   where: 'Optus Redcliffe, 2026',                    lure: { r: 8, dur: 5 } },
  radio:   { label: 'Store radio',       sfx: 'smp_radio',   where: 'Optus Redcliffe, 2026',                    lure: { r: 6, dur: 6 } },
  kettle:  { label: 'Kettle (“Tea?”)',   sfx: 'smp_kettle',  where: 'Des, Optus Redcliffe, 2040',               lure: { r: 3, dur: 2.5 } },
  chip:    { label: 'Chip chime',        sfx: 'smp_chip',    where: 'The Neural Chip kiosk, Optus Redcliffe',   lure: { r: 4, dur: 3 } },
  hover:   { label: 'Hover hum',         sfx: 'smp_hover',   where: 'A parked hover-car, Redcliffe Parade',     lure: { r: 5, dur: 5 } },
  bay:     { label: 'Bay',               sfx: 'smp_bay',     where: 'Under Redcliffe Jetty',                    lure: { r: 6, dur: 5 } },
  piano:   { label: 'Piano',             sfx: 'smp_piano',   where: 'The public piano, Bee Gees Way',           lure: { r: 6, dur: 5 } },
  cicadas: { label: 'Cicadas',           sfx: 'smp_cicadas', where: 'The laneway palm, Bee Gees Way',           lure: { r: 7, dur: 6 } },
  brick:   { label: 'Brick phone trill', sfx: 'smp_brick',   where: "Rue's front room, Scarborough",            lure: { r: 6, dur: 4 } },
  boom:    { label: 'Boom gate',         sfx: 'smp_boom',    where: "Teddy's checkpoint, Clontarf",             lure: { r: 10, dur: 7 } },
  whir:    { label: 'Drone whir',        sfx: 'smp_whir',    where: 'Ted Smout Bridge',                         lure: { r: 5, dur: 4 } },
  laugh:   { label: 'Luka (laughing)',   sfx: 'smp_laugh',   where: 'Ted Smout Bridge, 25 km/h',                lure: { r: 7, dur: 10 } },
  sizzle:  { label: 'Sizzle',            sfx: 'smp_sizzle',  where: 'The sausage sizzle, Sandgate station',     lure: { r: 4, dur: 5 } },
  train:   { label: 'Train chime',       sfx: 'smp_train',   where: 'The Shorncliffe line',                     lure: { r: 6, dur: 4 } },
  uke:     { label: 'Ukulele',           sfx: 'smp_uke',     where: 'Brunswick Street Mall',                    lure: { r: 5, dur: 6 } },
};

// Inventory (spec 13.2). `examine` runs as steps or a function of c (a line from whoever it belongs to, else the active
// character); content may replace it with a card INSERT: ITEMS.invite.examine = [{ shot: 'INSERT', ..., card }, ...].
Object.assign(ITEMS, (() => {
  const line = (text, by) => (c) => c.say(by || c.state.active, text);
  return {
    remote:        { name: 'The Remote', desc: 'A cream phone receiver gaffer-taped to a display Neural Chip. The jack fits nothing in 2026.',
      examine: line('A phone, taped to a chip, taped to a cable. ^ It rang 2026.') },
    invite:        { name: "Luke's invitation", desc: 'MANDATORY FUN · Christmas Eve Morning Tea · Optus Tower · Admits: LUKE + 2',
      examine: line('Mandatory fun. ^ Safety goggles provided.') },
    brick_phone:   { name: 'The brick phone', desc: "Rue's phone. The line's from 1987. He wants it back.",
      examine: line('Still works. ^ Rue wants it back.') },
    nadia_lanyard: { name: "Nadia's lanyard", desc: 'An Optus HQ lanyard: NETWORK SAFETY. It opens the service lift.',
      examine: line('No six to eight weeks.') },
    tether:        { name: 'Tether', desc: 'A broken display security tether off the Hero Table.',
      examine: line('A display tether. Not sure why I took it. ^ Felt right.', 'chase') },
    headphones:    { name: 'Headphones', desc: 'Big over-ear headphones off the confiscated wall. HEARING PROTECTION INITIATIVE 2038.',
      examine: line('For later.', 'chase') },
    santa:         { name: 'Santa hat and beard', desc: 'A cheap Santa hat and a fake white beard on elastic. Worn over a real beard.',
      examine: line('It slips when I talk too fast.', 'luka') },
    coaster:       { name: 'Coaster', desc: "A beer coaster from the Starlight. In biro: I'll do it. — L.",
      examine: line("“I'll do it. — L.”", 'chase') },
    lanyard40:     { name: 'Faded lanyard', desc: 'Fourteen more years of faded. Biro on the back of the badge: 1158.',
      examine: line('1158.', 'luka') },
  };
})());

// The Bug List, 2040 Edition (Extras card): Rue's classics, still there, plus what SafeSense added. `y` = year found.
const BUGS_2040 = [
  { y: 2026, text: 'Pop-ups before every action' },
  { y: 2026, text: "Asks if you're sure you're sure" },
  { y: 2026, text: 'Turns the name Margaret into margarine' },
  { y: 2026, text: 'Crashes on opt-in' },
  { y: 2026, text: 'Random restarts' },
  { y: 2026, text: 'Password rules change while you type' },
  { y: 2026, text: 'Buttons that run away' },
  { y: 2026, text: 'Progress bar goes backwards' },
  { y: 2026, text: 'Sends MFA codes to dead phones' },
  { y: 2026, text: 'Error 4044' },
  { y: 2026, text: 'Flags swearing for coaching' },
  { y: 2026, text: '"Video could not be played"' },
  { y: 2026, text: 'Door takes nine seconds' },
  { y: 2040, text: "Asks if you're sure you're sure you're sure" },
  { y: 2040, text: 'Error 4044 — Identity conflict' },
  { y: 2040, text: '"This message may upset the recipient. Send anyway? [NO]"' },
  { y: 2040, text: 'Do Not Disturb on by default' },
  { y: 2040, text: 'Hover-cars lowered to one foot, for safety' },
  { y: 2040, text: '"Turning left. Are you sure?"' },
  { y: 2040, text: '40 dB limiters on pianos' },
  { y: 2040, text: 'Safety goggles for crackers' },
  { y: 2040, text: 'Escorts you to a Safe Room, for your safety' },
  { y: 2040, text: 'Pop-ups in your eyes' },
  { y: 2040, text: 'Batteries still on 3%' },
  { y: 2040, text: 'Opt-in still crashes. Opt-out works perfectly.' },
];
// Rue's Bug List (kept so Rue-era UI/minigame code still finds its names; TWO's card reads BUGS_2040).
const BUGS = [];
const DOOR_BUG = 'Door takes nine seconds';

// ------------------------------------------------------------ state
// One playthrough (saved). HUD fields: null hides them. Story-wide flags (ARCH 3.8): flags.santa (Luka's disguise),
// flags.chip_off, flags.headphones; flags.tut_swap once the SWAP tutorial prompt has been taken.
const newState = () => ({
  scene: 'P', flags: {}, inventory: [], active: 'luka',
  samples: [], names: [], bugs: [],   // collectibles (samples in the order recorded)
  pattern: null,                      // the 2.10 sequencer pattern for "two" (3.6, the credits, the jukebox)
  hack: 0,                            // HACK % (L21, 3.4–3.5)
  choice: null,                       // 'A' (YES: keep) | 'B' (NO: clear), set by the Choice in 3.7
  quiet: null,                        // 'hh:mm:ss' for the HUD's QUIET IN (story time); null hides it
  noService: false,                   // the HUD's NO SERVICE (from 1.6)
  battery: null, bars: null,          // signal bars (0..4) for the endings; Rue's battery (unused, null)
  hud: null,                          // which optional HUD parts are on (31-ui keeps it: { samples, hack, ... })
});
let state = newState();

// Options and completion live outside the game state and persist across New Game.
const options = {
  controls: 'modern', textSpeed: 'normal', textSize: 'normal',
  music: 0.8, sfx: 0.9, voice: 0.9, reduceFlashing: false, objective: true,
  storyMode: false,                   // boss: half the spawns, double the hack rate (spec 10, 13.9)
  holdToPress: false,                 // every hold-to-confirm can be a press instead (input.holding)
};
const profile = { completed: false, seenPrologue: false, endingsSeen: { A: false, B: false } };

// ------------------------------------------------------------ test hooks
// ?autoplay=1 auto-advances everything; &scene=2.3 starts there; &stop=2.5 ends after it; &speed=8;
// &fast=1 runs every cutscene as if skipped (state steps still apply); &ending=A|B picks the Choice under autoplay
// (and the branch for &scene=C / PC). ?setview=<setId>&env=<preset> boots straight into a set for inspection
// (TWO_TEST.views / view / envs / setEnv; see tools/setshots.mjs).
const TEST = (() => {
  const q = new URLSearchParams(location.search), e = (q.get('ending') || '').toUpperCase();
  return { auto: q.has('autoplay'), scene: q.get('scene'), stop: q.get('stop'), speed: +q.get('speed') || 1, fast: q.has('fast'),
    ending: e === 'A' || e === 'B' ? e : null, setview: q.get('setview'), env: q.get('env') };
})();
window.TWO_TEST = { ready: false, done: false, scene: null, step: null, log: [] };
const testLog = (msg) => { if (TEST.auto) TWO_TEST.log.push(msg); };
