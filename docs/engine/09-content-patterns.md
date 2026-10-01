# 09 — Content patterns: shot recipes, step idioms, set pieces, INSERT cards and local helpers

A cookbook for the people writing TWO's scenes (`src/60-…89-content-*.js`, ARCHITECTURE §6). It catalogues how Rue's
content files turn script tags into steps: every reusable **shot recipe**, every **step idiom**, the **set pieces TWO
deliberately echoes** (Lights Out, Storage Full, Opt Us In and the final YES, Torchlight, the idea-engine ORBIT, the split
screen, the reverse-charge call, the arrival flash, the Three Weeks homecoming, the epilogue, credits and post-credits),
every **INSERT card** Rue shows, and every **helper** the content files define locally, with the reason it exists.

It does not re-document the engine. The step runner, skip rules and scene runner are in `06-flow.md` (§4–§5); every
shot option and move is in `04-world.md` (§9–§12); cards, pop-ups, HUD and dialogue are in `05-ui.md`; the final-YES
mini-game, credits and torchlight are mini-games (07/08 manuals). Read `06-flow.md` §5.4–§5.6 first.

**Citations.** `29:97` is line 97 of `ref/rue/29-content-…js`. Other numbers: `09:` world, `10:` UI, `11:` flow,
`17:` final YES, `18:` credits, `22:` torchlight. TWO's `src/` has **no content files yet**; Rue's content is not in
`src/`. Everything below is about patterns to copy into new leaves. In tables, `‖` stands for JavaScript `||`.

| File | Scenes | Lines |
| --- | --- | --- |
| `23-content-prologue-not-yet-and-1-1-8-52.js` | P "Not Yet", 1.1 "8:52" | 368 |
| `24-content-1-2-margarine-and-1-3-language-detected.js` | 1.2, 1.3 | 413 |
| `25-content-1-4-tethers-and-1-5-it-s-genius.js` | 1.4, 1.5 | 631 |
| `26-content-1-6-1987-and-1-7-reverse-charges.js` | 1.6, 1.7 | 396 |
| `27-content-2-1-are-yous-the-call-2-2-plastic-money-2-3-roll-cal.js` | 2.1, 2.2, 2.3 | 651 |
| `28-content-2-4-the-answer-s-no-2-5-what-s-a-jarvis-2-6-second-i.js` | 2.4, 2.5, 2.6 | 649 |
| `29-content-2-7-scam-call-2-8-the-deal-2-9-lights-out.js` | 2.7, 2.8, 2.9 | 490 |
| `30-content-2-10-nobody-s-nobody.js` | 2.10 | 725 |
| `31-content-2-11-the-phone-that-never-rings-2-12-black-monday-2-.js` | 2.11, 2.12, 2.13 "Torchlight" | 750 |
| `32-content-3-1-the-pitch-3-2-storage-full.js` | 3.1, 3.2 "Storage Full" | 639 |
| `33-content-3-3-note-to-self-3-4-opt-us-in.js` | 3.3, 3.4 "Opt Us In" | 655 |
| `34-content-3-5-11-58-3-6-three-weeks-3-7-sorry-for-the-wait.js` | 3.5–3.9 | 1152 |
| `35-content-epilogue-restart-credits-post-credits-the-original-s.js` | E, C, PC | 516 |

---

## 1. Anatomy of a content file

Every file is one IIFE with no top-level names (the leaf rule). Order inside, as in 29:4-23:

```js
(() => {
  const PI = Math.PI, H = PI / 2;
  const say = (id, text, o) => Object.assign({ say: id, text }, o);          // step factories
  const slow = (id, text, o) => say(id, text, Object.assign({ speed: 'slow' }, o));
  const snap = (name) => ({ do: () => { if (MINIGAMES.final_yes && MINIGAMES.final_yes.snap) MINIGAMES.final_yes.snap(name); } });
  const actor = (c, id) => c.world.actor(id);
  function glanceAt(c, id, at, dur = 1.3) { … }                             // helpers: "from `do` steps, never per frame"
  function tween(c, dur, fn) { … }
  // CARDS.x = …; ANIMS.x (guarded); ITEMS (Object.assign)
  // per scene: named shot constants, a dress function, SCENES[id], CUTSCENES[id]
})();
```

| Convention | Example | Why |
| --- | --- | --- |
| The script line is a comment above its steps, shot tags quoted: `// [PUSH IN · slow, from slightly above Luka]` | 29:207 | The comment is the spec; reviewers diff steps against it |
| Shots that recur are **named constants**, named by their tag: `LEFT`, `RIGHT`, `LOW`, `PUSH`, `TOP_DOWN`, `JCAM`, `HANDS`, `CORRIDOR`, `TWO_BAR` | 29:93-97, 32:435-442 | The "exact frame from …" echoes reuse the same object |
| A lens without `shot:` (`{pos, look, fov}`) so it can be both a glide target and a shot | `CAR_SIDE` 34:253, used as `to:` (34:254) and as `Object.assign({ shot: 'CAM' }, CAR_SIDE)` (34:386) | One source for both uses |
| A shot whose value depends on options is a **factory**, evaluated in a `do` | `ORBIT()` 29:97, `pitchOrbit()` 25:597 | Text speed is read when the step runs |
| Staging goes **under the cut**: `place`/`act`/`expr` immediately before the next `shot` | 29:208-211, 33:540 "(under the cut)" | Nothing visibly pops |
| A `xxxDress(c)` per scene, run first, idempotent, driven by `state.flags` | `lodgeDress` 29:26, `squareDress` 33:383 | Continue (kettle save) and Chapter Select restart the scene from its first step |
| A `watch()` updater that puts pooled rigs and props back when the scene id leaves the file's range | 31:60-72, 33:114-125, 34:186-202, 35:67-85 | Rigs are pooled across scenes; quit/scene select skip the cutscene that would clean up |
| `grants` lists every flag, item, name, sample, battery/bars a player would have after the scene | 29:124 | Chapter Select (`06-flow.md` §11) |

Scene steps seen in the content files (all documented in `06-flow.md` §4.2): `['cutscene', id | steps]` (an inline
array is allowed: 27:513), `['steps', steps]` (no bars: 27:139, 28:147, 29:292), `['do', fn]`, `['control', id]`,
`['follow', id]`, `['objective', …]`, `['roam', {until, hint, auto}]`, `['minigame', id, params]`, `['set', id, {env,
spawn}]` (fades), `['cam', 'fixed', lens]` / `['cam', null]`, `['swap', bool]`. A step array can be spread in:
`['do', pedal(1)], ...rest` (28:492-494).

---

## 2. Step idioms (the grammar Rue's writers used)

### 2.1 Lines

| Idiom | Code | Notes |
| --- | --- | --- |
| Factories | `say(id, text, o)`, `slow(id, text, o)` (29:6-7), `tape(id, text)` = `{tag: 'tape', speed: 'slow'}` (34:8) | Every honest moment in Rue uses `slow` (2.9, 3.2, 3.8) |
| Beat | `'…It\'s still a long story. ^ I just want…'` | `^` = `CONFIG.beat` 0.8 s |
| Tags | `{ tag: 'off' }`, `'through the door'` (29:292), `'down the line'` (34:357), `'on video'` (23:343), `'intercom'` (23:176), `'muffled'` (28:336), `'whisper'`, `'quietly'`, `'off, astonished'` (30:718) | Free text after the name |
| Label override | `{ say: 'radio', text, name: 'RADIO' }` (27:121); `name: 'PROFESSOR HARTIGAN'` (27:540) | |
| Two speakers at once | `say('luka_chase', …)` (27:573), `say('chase_luka', …)` (34:357) | Split portrait (`CHARACTERS[id].voice.also`) |
| Auto-advance | `slow('rue19', 'Opt… us… in. ^ Optus.', { auto: 0.5 })` (33:562); `{ say: 'hartigan', …, auto: 0.4 }` (27:547) | The next step lands without a YES press |
| Cues on a line | `say('luka', '…', { act: 'point' })` (29:168), `{ expr: 'worried' }` (25:175) | **Dropped when skipping**: never put lasting state here |
| "The one who noticed says it" | `const me = (text) => ({ do: (c) => c.say(c.state.active, text) })` (34:396) | Speaker chosen at run time (swap scenes) |

### 2.2 Parallel lines and pictures

```js
{ par: [say('chase', IDEA), { do: (c) => c.runSteps([ORBIT()]) }] },                                   // 29:222
{ par: [say('rue19', LINE[n]), { do: (c) => c.runSteps([{ wait: 1.1 }, INS(n), ...REACT[n]]) }] },    // 32:226: cut to the listener mid-line
{ par: [{ say: 'chase', text: 'No service. No service. No service. No—' },
  { do: (c) => c.runSteps([{ wait: 0.26 }, { shot: 'INSERT', at: MACHINE_FLOOR, from: […], card: phoneCard('light') }, …]) }] },  // 27:209-216
```

`par` children are single steps; a sequence inside `par` is `{ do: (c) => c.runSteps([...]) }`. Shots inside that
`runSteps` are still ignored while skipping, so the idiom stays skip-safe.

### 2.3 `do` steps: awaited or not

| Form | Awaited | Used for |
| --- | --- | --- |
| `{ do: (c) => c.ui.fade('out', 1.4, '#fff') }` (expression body) | yes, returns the promise | 26:367 |
| `{ do: (c) => { lean(c); } }` (block body) | **no** | fire-and-forget: 26:340, 31:117 (`chatter`), 31:317 (`readAloud`) |
| `{ do: async (c) => { … } }` | yes | timed cosmetic sequences (25:618, 28:179) |
| `{ do: (c) => waitUntil(() => c.flow.skipping ‖ near(c, 'rue58', -0.15, -4.05, 0.1)) }` | yes | **wait for a fire-and-forget walk** (34:757, 34:765) |

The "walk in the background, wait with a skip escape" pattern (3.7, 34:754-765):

```js
{ do: (c) => { walkTo(c, 'rue58', RUE_WALK_A, 1.1); walkTo(c, 'luke', LUKE_WALK_A, 1.1); } },   // not awaited
say('luke', "Rue! Welcome to Redcliffe, we weren't— …"),                                        // talk while walking
{ do: (c) => waitUntil(() => c.flow.skipping || near(c, 'rue58', -0.15, -4.05, 0.1)) },
```

`walkTo` (34:669) awaits each `moveTo` and bails if the scene changed. A later `{place}` supersedes any move still
running (superseded world promises resolve, `04-world.md` §2).

### 2.4 Cue something at a word (one long line, one shot)

| Helper | Code | Use |
| --- | --- | --- |
| `typed(s)` | `document.querySelector('#dlg .txt').textContent.includes(s)` (31:34) | `emptySmile` (31:248-254) changes the face as "Mr Fenwick", "Frozen", "No, of", "Thank you" type out; each wait has a 30 s escape and `c.flow.skipping` |
| `onText(line, sub, fn)` | waits until the typewriter's text node length reaches `line.indexOf(sub)` (34:888-894) | 3.8: Chase's head goes into his hands at "Chase, you're definitely", comes up at "Lift it up" (34:935-938), inside a `par` with the line |
| Blips timed to the typewriter | `await c.wait((n.length + 1) / cps + 0.25)` per name, `cps = CONFIG.text[options.textSpeed]` (27:548-555) | 2.3 roll call: a student's "He-re" lands in each `^` beat |

### 2.5 Bodies

| Idiom | Code | Notes |
| --- | --- | --- |
| Head turn without moving the feet | `a.play('glance', { yaw: clamp(relative, ±1.3 or ±1.4), dur })` (`glanceAt`, 29:10-15) | One-shot: returns to the previous anim. "They stare at each other" = two `glanceAt` (28:271) |
| Seated + upper-body anim | `a.play('sit', { h }); a.rig.seated = true; a.play(anim, { h })` (`seatIn` 32:11-16) | Upper anims keep the seated legs only once `seated` is set (27:21 comment) |
| Stand up | `a.rig.seated = false; a.play('idle')` (`stand` 32:18) | |
| Pose without its prop | `play('reading')` then hide `rig.attach.textbook` 0.05 s later (`hideBook` 32:19, `holdUp` 31:27-32) or scale it to 1e-4 (`noBook` 35:28). 3.5–3.9 register `reading_bare`, `drink_bare`, `phone_bare`, `pour_bare`, `mouth_bare` (34:30-31) | The `reading` pose shows a textbook; content repurposes it for "holding X up in front of the chest" |
| Face parts directly | `const face = (id, fn) => ({ do: (c) => { const a = actor(c, id); if (a) fn(a.rig.face, a); } })` (32:9); `f.eyes('closed')`, `f.mouth('smile')`, `f.brows('worried')`; tears: `face.tears = 1; face.redraw()` (34:292) | Finer than `setExpr`. "The first real smile he's had all game" = `setExpr('neutral'); face.mouth('smile')` (33:563) |
| A body roll (lying on his side, leaning on a wall) | `r.root.rotation.z = -H` (29:395), `lean(k)` sets `root.rotation.z = -k` (33:95) | **Must be undone** (`unroll` 29:65, `lean(0)` 33:268, `watch` 33:123): the rig is pooled |
| Moods/habits | `a.mood = 'anxious'` (lanyard fidget when idle, 29:209), `a.habit = 'glance'` (27:20) | Reset in the next dress (`l.mood = null; l.habit = null`, 34:440) |
| One-shot custom anim | `{ act: [['finalist', 'bow', { dur: 1.8, loop: false }]] }` (32:332) | `loop: false` makes any anim a one-shot |

### 2.6 Hand props built by content

```js
function prop(c, name) {                       // 33:26-45: built once with a Builder, cached in `kit`
  let g = kit[name];
  if (!g) { const b = new Builder(); … g = kit[name] = b.done(); g.name = 'kit_' + name; }
  if (g.parent !== c.world.scene) { if (g.parent) g.parent.remove(g); g.position.set(0, -30, 0); c.world.scene.add(g); delete g.userData.home; }   // a home for hold(null)
  g.visible = true; return g;
}
function hand(c, id, name) { for (const a of c.world.actors.values()) if (a.held && a.held.name === 'kit_' + name) a.hold(null); … a.hold(prop(c, name), 'R'); }   // 33:46-49
```

- `hold()` remembers a **home** the first time; re-homing the kit under `world.scene` (off at y −30) gives `hold(null)` a
  harmless place to send it. `drop(c, id)` = `hold(null)` + hide (33:50).
- Putting a rig attachment **down in the world**: `putDown(c, 'brick', at, rot)` clones the rig's own mesh into a
  centred pivot group (31:37-51); `pickUp` removes the clone. The rig's own copy is hidden meanwhile (`show(c, id, part,
  false)`, 31:10). Rue uses this for the brick phone on the stone (2.11) and the table (2.12), the Walkman on the cobbles.
- Moving a mesh **between rigs** (the lanyard over Rue's head, 3.4): `r.rig.parts.torso.attach(m)` keeps its world pose,
  then a tween eases position/quaternion/scale to the new rig's chest, scaled by the two rigs' `d.nr` and `d.chestZ`
  (33:140-152). `delete l.rig.attach.lanyard` first, "no anim toggles it from here on" (33:130). A **copy** fitted the
  same way when the original must stay on the other set: `rueLanyard` (35:130-138).
- A prop that follows an actor every tick (the bike being wheeled, 28:379-391): one updater writing
  `b.position.set(...)` from `l.pos`/`l.rotY`; removed on stop, skipped entirely while skipping.

### 2.7 Practical light: the set's one spot

Each set has one spot (`world.torch`) that normally rides in the player's hand (`world.torchAuto`, `torchTick` 09:541-547). Content
parks it as a lamp, a screen, a window or a torch:

```js
function lamp(c, on, pos, tgt, color = 0xffd6a0, power = 4, angle = 0.7) {   // 32:21-29 (and 33:64-72)
  const s = c.world.torch; if (!s) return;
  c.world.torchAuto = !on; s.intensity = on ? power : 0; if (!on) return;
  s.color.set(color); s.angle = angle; s.distance = 30; s.penumbra = 0.6;
  s.position.set(...pos); s.target.position.set(...tgt); s.target.updateMatrixWorld();
}
```

Uses: the desk lamp (23:8), the window light on two faces (32:485), the gate lamp (32:486), Chase's green screen
(33:182), the lodge lit white from inside (33:613), the machine's blue glow (31:433), Luka's phone torch (31:441), the
torch beam sliding to Rue (31:532-545, an updater), the torches dying (31:547-557, a flicker list), the one lamp over the
steps (31:558), the red alarm beacon (25:116-121), Rue's eyes in the dark (29:416). **Always restore**: `intensity = 0;
torchAuto = true` (and angle/penumbra/colour, 31:727).

### 2.8 Time and scene scoping

```js
function tween(c, dur, fn) {                          // 33:12-23, 34:15-26, 35:12-23
  const sid = c.flow.sceneId;
  if (c.flow.skipping || !(dur > 0)) { fn(1); return; }
  let t = 0;
  const f = (dt) => { t = Math.min(1, t + dt / dur); if (flow.sceneId !== sid) t = 1; fn(t * t * (3 - 2 * t)); if (t >= 1) removeUpdate(f); };
  addUpdate(f);
}
```

The older copy (29:17-22, 27:23-35 `slide`) lacks the scene-change escape. Use the 33/34/35 form.

`scope(id, fn, off)` (25:8-16): one updater per scene that runs `fn(dt)` while `flow.sceneId === id` and calls `off()`
once when it isn't (scene end, quit, select). 1.4 uses it for the alarm beacon and to remove a collider it pushed into
`SETS.reddy.colliders` (25:85-100). `watch()` (33:115-125, 34:188-202) is the same idea for a range of scenes.

### 2.9 Audio idioms

| Idiom | Code | Notes |
| --- | --- | --- |
| Layered loops | four `{ loop: 'alarm', vol: 0.45, fade: 0.4 }` (25:231); stop all: `{ loop: 'alarm', stop: true, fade: 0.05 }` (25:288) | Loops start even when skipped |
| Muffled through a door | `const through = (name, vol, rate = 1) => ({ sfx: name, vol, rate, at: DOOR, lp: 650 })` (33:98) | Positional + low-pass; "voices, never the words" |
| Stop the music dead | `{ music: null, cut: true }` (34:347), earbud out (23:284) | |
| Change the music on an action | `{ act: [['rue19', 'tap', …]] }, { wait: 0.5 }, { music: 'pudding_walkman', fade: 0.6 }` (33:630-632) | "The score becomes Chase's song" |
| Override a set's ambience | `amb(rain, loops)` → `c.AUDIO.ambience({ rain, loops })` (35:25) | Rain inside, silence in the sun |
| A ring every 3 s until answered | updater on a counter, ends on a flag/scene/skip (`ring` 34:264-277, `ringThird` 35:158-167); loop with a token (`ring` 31:211-214) | Reuse the options object; don't build `{vol}` per tick (30:185 `BUSK.o`) |
| Hold YES to record during a ring | `ringing(c)` 29:68-88, `recordBell` 30:244-261 | `waitUntil` that is true while skipping; `TEST.auto` counts as held; `input.consume('yes')` after |
| Tape hiss under a voice | `c.AUDIO.loop('rain', { vol: 0.05, rate: 2.1 })`, then `hiss.vol(0.2); hiss.rate(1)` for "rain in the background" (34:909-912, 34:952-954) | Stop it in `watch` too (34:199) |
| A song that must end on its own | `playSong` (33:307-316): `AUDIO.song(pattern, {bars: 8, ending: true, onEnd})`, a glide timed to it, `waitUntil(ended ‖ skipping ‖ timeout)`, stop only if the ending never played | |
| Music cut when JARVIS crashes in a mini-game | `cutOnCrash` (35:89-96) watches a flag the mini-game sets | |

### 2.10 Pop-up idioms

| Idiom | Code | Notes |
| --- | --- | --- |
| A burst on a beat pattern | `storm(c, msgs, beats, grow)` (24:27-33) | Loop guarded by `!c.flow.skipping` |
| A pop-up that lands on a speaker's face | `{ popup: { …, at: { actor: 'luka' } } }` (23:296, 35:509) | |
| A pop-up where a 3D thing is on screen | `const p = c.cam.project(v)` → `at: [p.x / innerWidth, p.y / innerHeight]` clamped (24:41-45, 35:190) | `project` returns a shared object |
| A censored line + its pop-up | `cuss(id, text, msg)` (24:57-61): `say(..., { censor: msg })`, then add the pop-up only if the censor didn't | |
| A slide-in (Web Animation) | `p.el.firstChild.animate([...], { duration: 650 })` (23:92) | Cosmetic: guarded by skipping |
| Drawn-but-inert buttons | `buttons: []`, then append `<span class="jv-b">` (or `<button>`) to `.jv-btns` (32:445-450, 33:425-431) | The cutscene's YES advances talk, not the pop-up |
| Keep a pop-up through a close-up | park it off screen with a CSS transform, restore after (32:452-454) | The pool's `place()` resets it if reused |
| Player decides inside a cutscene | `choice(c)` (32:456-475): live buttons, YES greyed and clunking, `waitUntil` on input / click / `TEST.auto` / skipping | Not a `{choice}` step: it's a pop-up with a dead button |
| A cursor that clicks YES by itself | `restartClick` (35:186-214): a DOM arrow with a CSS transform transition, hover then click | Returns at once when skipping; closes the pop-up |
| Clear | `{ popup: null, clear: true }` (24:306) | Applies even while skipping |

### 2.11 HUD and objective as storytelling

- The 1987 bars are an emotional meter: `{ hud: { bars: 1 }, anim: 1.5 }` when they drift apart (32:558),
  `{ hud: { bars: 4 }, anim: 2.4 }` when they're one shot again (32:600), bars climbing as Rue says yes (31:667, 695,
  714). The "first time in 2026" bars fill on the tape (34:971-973). Partial objects keep the other field.
- `{ hud: null }` **also nulls `state.battery/bars`**: restate after (29:161 → 29:179).
- `objective.list([...])` with ticks from flags (`duties`/`tick`, 23:97-105).
- `['objective', null]` before a full-screen mini-game (33:469).

---

## 3. Shot recipe catalogue

Each recipe: the script tag, Rue's step(s), then the rules that make it work.

### 3.1 ORBIT · speeding up (Chase's idea engine)

```js
const PITCH = "Okay okay okay, hear me out. JARVIS is broken, right? …";                                     // 25:594
const pitchOrbit = () => ({ shot: 'ORBIT', size: 'MID', on: 'chase', dist: 2.4, height: 0.05, from: 25, to: -8, ease: 'in',
  dur: PITCH.length / CONFIG.text[options.textSpeed] + 1 });                                                  // 25:597-598
{ do: (c) => c.runSteps([pitchOrbit()]) },                                                                    // 25:606
{ say: 'chase', text: PITCH },                                                                                // 25:607
```

- **Speeding up = `ease: 'in'`** (accelerates until the end). The arc is small (25° → −8°, 33°, clockwise seen from
  above: `to < from`); the acceleration sells it, not the distance.
- **Duration = the line's typing time + 1 s.** Typing speed is `CONFIG.text[options.textSpeed]` (24/48/110 cps). Add
  `CONFIG.beat` × the number of `^` if the line has beats (Rue's two orbit lines have none). The factory runs at step time,
  so a text-speed change in the menu applies.
- Started with `runSteps` from a `do` so the shot step is still skipped when skipping.
- Composition: the listener stays in every angle. "Luka, 1.9 m behind him, drifts from ~60° to ~27° off Chase's back
  axis: in the background of every angle, never hidden" (25:595-602). `place` both first; clear floor all round (the lens
  orbits at `dist`, it does not avoid walls once moving).
- 2.7 reprise at a smaller room's distance: `dist: 1.8, from: 16, to: -16` inside a `par` with the line (29:97, 29:222).
- Plain orbits (not the motif): `{ shot: 'MID', on: 'chase', move: 'orbit', from: -40, to: 80, dur: 10 }` "the idea
  arrives" (28:571); the heist reveal `{ shot: 'ORBIT', size: 'WIDE', on: 'machine', angle: 'high', dist: 2.6, height:
  0.9, from: -80, to: 10, dur: 8 }` around a prop/anchor (25:556).

### 3.2 JARVIS-CAM (from behind a screen, faces lit by it, a pop-up landing over them)

```js
{ shot: 'JARVIS', at: 'monitor', on: 'luka' },                                                       // 23:295
{ popup: { msg: 'Loading…', spinner: true, buttons: [], icon: 'none', at: { actor: 'luka' }, w: 170 } },
const JCAM = { shot: 'JARVIS', at: 'machine_back', on: ['chase', 'luka'] };                          // 32:442
{ shot: 'JARVIS', at: 'monitor', on: ['luka', 'chase'], locked: true },                              // 24:376: locked for the cuss drum pattern
```

- `at` is a **screen anchor whose `from` sits behind the screen**; `on` the faces. The engine aims at the faces'
  centre −5 cm, widens the FOV to fit every face, pushes the near plane past the screen, and **borrows the spot**:
  blue (0x7fb0ff) at the screen (09:950-961; restored by `endShotExtras`, 09:907-910).
- The borrowed spot's colour/intensity/angle come back on the next shot, **but its position and target don't**. A scene
  that lights faces with the spot must re-park it after every JARVIS-CAM: `winLight(true)` after `JCAM` (32:540,
  "(the JARVIS-CAM borrowed the spot)"), again at 32:552, 32:598, 32:631.
- Darken around it so only the screen lights him: an `env` to dim hemi/dir + `torch.intensity *= 1.8`, then "the screen
  goes black, and so does he": `lightsOut` (spot to 0) and a darker env (24:264-273).
- **When the screen isn't where its anchor is** (3.4: the machine moved to Des's desk), frame it by hand (33:433-443):
  average the faces' `headPos`, `JL.y -= 0.05`, the widest face angle + 0.14 rad → vertical FOV at the canvas aspect,
  clamped to 56–70°, then `cam.shot({ shot: 'JARVIS', at: JL.toArray(), from: JF.toArray(), fov })`. With an array
  `at` there is no near-plane push and the spot sits at the lens. Preallocated vectors; skipped when skipping.
- The pop-up "lands over their faces": a big centred pop-up `cls: 'big', at: [0.5, 0.43]` (32:446), or at an actor.

### 3.3 TOP-DOWN · hands to head (Chase's tell)

```js
const SLUMP = [4.2, 0, -9.8, -H];                                   // 24:23: a fixed spot AND facing
const TOP_DOWN = { shot: 'TOP', on: 'chase', dist: 1.5, offset: 0.25 };   // 24:24 (copied verbatim in 32:441, 35:261; 2.13 uses it on rue19, 31:635)
{ place: 'chase', at: SLUMP }, TOP_DOWN, …, { act: [['chase', 'head_hands']] },   // 24:290-293
```

- TOP puts the lens straight above the eyes; **screen-up = the subject's facing**. Place him at a fixed mark with a fixed
  `rotY` (SLUMP) so the frame is identical every time it recurs. `offset` slides the lens sideways (0.25 m toward the
  monitor). TOP never reaims.
- Anims: `head_hands` = head bowed into the hands (the slump; loops). `hands_head` = both hands up on top of the head
  (1.6's "hands drift up", 26:243; also pushing goggles up, 25:371; taking headphones off, 33:329).
- **"His hands rise, he stops them, he puts them down"**: content anim `hands_halt` (32:48-58): every joint slerps from
  `idle` toward `head_hands` to 75% and back over `p.dur` (2.8 s), with preallocated quaternions. Play it
  `{ act: [['chase', 'hands_halt', { dur: 2.8, loop: false }]] }` then `{ wait: 3.0 }` (32:606-609). TWO's "start to
  rise … and stop halfway, and come down" (3.6) and "stop halfway … laughs instead" (A2) are this anim.
- **"…and he laughs instead; the head lifts, the camera rises with it"** (E, 35:341-347): TOP, `handsUp` (`reading`
  pose without the book), `laugh`, then the same shot with a crane move:
  `Object.assign({ move: 'crane', from: 0, to: 0.55, dur: 2.2 }, TOP_DOWN)`.
- **TOP, then down and round to his eyes as he lifts his head** (2.13, 31:575-580): capture the head-up eye line
  earlier (`actor.eyePos(EYE)`, 31:657), play `lift_head` (31:398-405), and glide a CAM from the live lens to
  `[EYE.x, EYE.y + 0.03, EYE.z + 0.95]`.
- Two people from above: `{ shot: 'TOP', on: ['luka', 'chase'], dist: 2.5 }` (34:519); a tighter single
  `{ shot: 'TOP', on: 'chase', dist: 1.05 }` (26:241).
- Rule from 2.12 (31:382): head-in-hands only from above.

### 3.4 LOW · heroic (funny) and LOW · sincere (Torchlight)

```js
const LOW_LUKA = { shot: 'CAM', pos: [8.15, 0.95, -26.1], look: [7.35, 1.62, -25.3], fov: 40 };   // 26:133: "from low beside Chase", used twice (26:255, 26:265)
{ shot: 'CLOSE', on: 'luka', angle: 'low', dist: 1.1, locked: true },                              // 31:498: "the first sincere low angle", repeated exactly in 3.6 (34:595)
{ shot: 'LOW', on: 'rue19' },                                                                       // 27:624: alias = MID + angle 'low'
{ shot: 'CLOSE', on: 'rue19', angle: 'low' },                                                       // 33:643 "eyes closed, sun on his face"
const LOW = { shot: 'CAM', pos: [-12.72, 1.52, 3.14], look: [-14.6, 1.9, 3.06], fov: 40 };         // 29:268: a lens under his eyes so the poster sits behind his head
```

TWO 3.5 step 53 "the sincere low angle from Rue's Torchlight" is the 31:498 step verbatim. When the frame must contain
something specific behind the head, hand-place a `CAM` (29:268) instead of the framing helper.

### 3.5 One long locked push (Lights Out, The Tape)

```js
const FLOOR = { pos: [-14.95, 0.78, 3.1], look: [-17.3, 0.45, 3.1], fov: 50 };       // 29:382 (= the set's floor_wide anchor)
const FLOOR_END = { pos: [-15.3, 0.8, 3.1], look: [-16.75, 0.47, 3.1], fov: 46 };
const PUSH = { shot: 'CAM', pos: FLOOR.pos, look: FLOOR.look, fov: FLOOR.fov, to: FLOOR_END, dur: 80, ease: 'linear' };   // 29:384
function settlePush(c) {                                                              // 29:398-404
  if (c.flow.skipping) return;
  const cm = c.world.camera, p = cm.position, d = new THREE.Vector3(); cm.getWorldDirection(d);
  if (p.distanceTo(new THREE.Vector3(...FLOOR_END.pos)) < 0.02) return;
  c.cam.shot({ shot: 'CAM', pos: [p.x, p.y, p.z], look: [p.x + d.x * 1.4, p.y + d.y * 1.4, p.z + d.z * 1.4], fov: cm.fov, to: FLOOR_END, dur: 2.4 });
}
```

- "Pushes in so slowly nobody notices": a `CAM` glide with a long `dur` and `ease: 'linear'`, started once; every line
  plays over it with no other shot.
- **The reading speed varies**, so the scene may outlast or undershoot the glide. Before the end beat, `settlePush`
  glides from wherever the lens is to the end frame (or returns if already there). 3.8's version computes the progress
  from time instead of reading the camera: `tapeRest` (34:883-886) lerps start→end by `(clock.t − t0)/TAPE_LEN` and
  glides the rest with `ease: 'out'` (`dur: 0.01` if already done).
- Start the long glide from a `do` with `c.cam.shot(...)` when you need its start time (`tapeT0 = clock.t`, 34:927).
- The one cut at the end is preceded by black: `{ fade: 'out', dur: 0.9 }, { wait: 2 }, { do: rueInTheDark }, { fade:
  'in', dur: 0.6 }` (29:477-481).

### 3.6 CRANE · down out of the sky / up and away

A crane is a `CAM` glide (two chained glides for an S-curve):

```js
{ shot: 'CAM', pos: [-2.0, 30, 30], look: [-2.0, 50, -20], fov: 50, to: { pos: [-3.2, 2.2, 22], look: [-2.0, 2.6, 1.0], fov: 45 }, dur: 7 },   // 23:273 down out of a blue sky
{ shot: 'CAM', pos: [3, 44, 18], look: [0, 9, 0], fov: 45, to: { pos: [-7.5, 4.2, 10.5], look: [0, 8.2, 0], fov: 50 }, dur: 6.5, ease: 'in' },   // 33:481
{ env: 'sun', dur: 6 }, { wait: 6.5 },
{ shot: 'CAM', pos: [-7.5, 4.2, 10.5], look: [0, 8.2, 0], fov: 50, to: { pos: [8.2, 2.1, 7.0], look: [13.2, 1.3, 12.3], fov: 48 }, dur: 4, ease: 'out' },   // 33:485 (starts exactly where the first ended)
```

- Chain glides by starting the second at the first's `to`; `ease: 'in'` then `'out'` reads as one move.
- Up and away: 31:723 (+ `{ env: { rain: 0.25, fog: … }, dur: 7 }` "the rain thins", then fade while still rising),
  33:648-650 (two legs, Rue → bell → square). Up to a silent bell and back: 31:378-384.
- A subject crane (`{ shot: 'CRANE', size: 'MID', on: 'chase', angle: 'low', from: 0, to: 0.65, dur: 5 }`, 25:239) for
  "LOW · slow crane up" on a person.

### 3.7 Glide from wherever the camera is (no cut)

```js
function glideFromHere(c, to, dur, ease) {                    // 34:48-53
  c.ui.card(null);
  const cm = c.world.camera; cm.getWorldDirection(V1);
  c.cam.shot({ shot: 'CAM', pos: cm.position.toArray(), look: V1.multiplyScalar(3).add(cm.position).toArray(), fov: cm.fov, to, dur, ease });
}
```

Used for "PULL OUT" from an ECU (34:254), the start of the 3.9 pull-out (34:994), from a track into a tilt-up under an
arch (27:488-492), and in `settlePush`/`craneUp`. It reads the camera at step time, so it is meaningless while skipping
(Rue's callers either return when skipping or accept the end frame).

### 3.8 INSERT · slow track along a desk

```js
{ shot: 'CAM', pos: [1.3, 0.97, -1.1], look: [0.55, 0.84, -1.62], fov: 34, to: { pos: [0.17, 1.04, -1.0], look: [0.15, 0.8, -1.36], fov: 32 }, dur: 3.5, ease: 'out' },   // 23:168
{ wait: 3.5 },
{ shot: 'CAM', pos: [0.17, 1.04, -1.0], look: [0.15, 0.8, -1.36], fov: 32, to: { pos: [-0.05, 0.97, -1.0], look: [-0.9, 0.95, -1.22], fov: 40 }, dur: 3.5, ease: 'in' },
```

"One continuous move that eases through the set's `cassette` lens, so the label reads upright" (23:166-167): the
middle node is a framing you want to pass through slowly (ease out into it, ease in out of it). TWO's prologue step 3 and
3.3 step 1 echo this.

### 3.9 TRACK · alongside / behind / ahead

```js
{ shot: 'MID', on: 'chase', move: 'track', track: 'behind' },                                                    // 23:276
{ shot: 'MID', on: 'rue58', move: 'track', track: 'ahead', dist: 2.6, dur: 6 },                                  // 34:753 "backwards, ahead of Rue"
{ shot: 'MID', on: 'luka', move: 'track', track: 'alongside', side: 'right', height: -0.12, dist: 1.7, offset: 0.5, dur: 60 },   // 30:696
```

`track` reframes every tick and ignores `dur` (it runs until the next shot). `offset` leaves room ahead of the subject
for people who turn into frame (30:693-695). For a track in a space too narrow for the framing helper (a stairwell, a
row of seats), use an explicit `CAM` glide instead: 28:512, the knee-height dolly 27:582-583.

### 3.10 POV and pans

| Recipe | Code |
| --- | --- |
| POV pan across a room, target to target | `{ shot: 'POV', from: 'chase', at: 'desk_phone', move: 'pan', to: 'radio', dur: 6 }` (28:327); a 16 s pan under a long line (31:189) |
| POV in two quick pans ("The polos. The badge.") | 29:342-344 |
| POV that is "us" (the party hidden) | `unseen(false)`, `{ shot: 'POV', from: 'display_wall', at: 'display_wall', move: 'push', amount: 0.6, dur: 6, fov: 26 }`, `unseen(true)` (34:414-416, same step as 25:67) |
| "Through the window", long lens | a `CAM` with `fov: 30–32` (29:240, 32:440); across a square at `fov: 12–15` (28:354, 31:128) |
| A pan as a glide of the look only | `{ shot: 'CAM', pos, look, fov, to: { look: [...] }, dur: 8 }` (31:315); tilt up from the floor: `to: { look: [...] }` (24:325) |
| Look from the active player's eyes at an anchor | `eyeLens(c, at, o)`: face it, move the follower behind, lens 0.22 m from the eyes toward the anchor (34:404-411) |

### 3.11 Shot-reverse-shot through a frame bar (3.2)

```js
const CH_ONE = { shot: 'CAM', pos: [-18.7, 2.55, 5.95], look: [-21.45, 1.95, 4.95], fov: 24 };   // 32:435: outside the glass, long lens
const LU_ONE = { shot: 'CAM', pos: [-18.9, 1.7, 5.3], look: [-21.45, 2.1, 6.1], fov: 24 };
CH_ONE, say('chase', "What if we don't go?"), LU_ONE, say('luka', 'Chase.'), CH_ONE, …            // 32:561-574
{ ...TWO_BAR, locked: true },                                                                    // the bar between them
TWO_IN,                                                                                          // inside, no bar: "in one shot again"
```

Singles alternate per line. The window mullion is placed at the frame edge between them; the reunion is a reverse angle
from inside with no bar. (`locked` on a `CAM` is harmless: CAM never reaims.)

### 3.12 Computed lenses on hands, eyes and props

| Helper | What | Where |
| --- | --- | --- |
| `handShot(c, id, fwd, up, side, fov)` | CAM from in front of a hand (`rig.attach.gripR` world pos after `updateMatrixWorld`) | 33:55-61, 34:126-133 |
| `faceAndHands(c, id, dist, fov)` | CAM on the midpoint between eyes and right hand | 34:135-143 |
| `carClose(c, dy, fov)` | CLOSE from between the front seats ("a computed close lands in the roof") | 34:256-262 |
| `ecu(c)` | The prologue's lens re-expressed in the handset's own frame (`applyMatrix4` / `transformDirection`) | 34:243-251 |
| `receiverECU(c)` | Close on a handset grille, looking past it to the rain | 27:74-80 |
| `rueInTheDark(c)` | Eyes in the dark: spot above the eyes, CAM from the wall side | 29:412-418 |
| `finalClose(c)` | CLOSE on the line the next pull-out will take | 34:1020-1025 |
| Computed push on a look | `CAM` from 1.25 m along the look direction + `move: 'push', amount: 0.72, dur: 6` | 34:605-610 |

All read poses at step time, so wait one tick after an `act` (`{ wait: 0.1 }`, 34:322-326) and allocate nothing per
frame (module-level `V1`, `V2`, 33:54, 34:11).

### 3.13 WHIP pans, CRASH zooms

```js
{ shot: 'INSERT', at: 'calendar', move: 'whip' }, { wait: 0.55 },        // 34:573-576: three whips, the last onto a waving actor
{ shot: 'INSERT', at: 'halloween', move: 'whip' }, { wait: 0.55 },
{ shot: 'MID', on: 'jordan', move: 'whip' }, { wait: 1.0 },
{ shot: 'CRASH', size: 'MID', on: 'luka' }, { wait: 0.55 }, { shot: 'CRASH', size: 'MID', on: 'chase' },   // 27:617-619 (plays 'sting'; never pass fov)
{ shot: 'WHIP', size: 'MID', on: 'luka' },                                // 25:175, a mini-game line
```

### 3.14 Stares

```js
{ stare: 3, ambient: [['kettle_click', 1.8]] },                                                     // 27:199 "Somewhere, a kettle clicks off."
{ par: [{ stare: 3.5, ambient: [['tube_flicker', 0.7], ['spark', 1.7], ['truck_reverse', 2.1]] },
        { do: async (c) => { await c.wait(0.7); await flicker(c, 2); await c.wait(0.6); sparks(c, [6.3, 0.72, -27.1]); } }] },   // 25:616-619
{ do: (c) => { glanceAt(c, 'luka', 'chase', 2.8); glanceAt(c, 'chase', 'luka', 2.8); } },
{ par: [{ stare: 2 }, { do: async (c) => { …rue19 glances, chews… } }] },                           // 28:271-272
{ loop: 'hold_music', vol: 0.45 }, { do: …luke glances one face, then the other… }, { stare: 3 },   // 34:771-773
```

A stare locks the camera, silences music, hides `#hud`, capped at 4 s, YES ends it after 1 s; the world and its
ambience keep going (`11:199-211`). Set the shot and the faces **before** it; put movement in a `par` sibling. A loop
started just before (hold music) keeps playing because loops aren't music. Stares are skipped entirely when skipping.
"Hold 2 s" in a script that isn't marked as a stare is a `{ wait: 2 }` (music keeps playing).

### 3.15 The "exact frame" echo: anchors as named frames

Any composed static frame can live in the set as an **anchor** (`at`, `from`, `fov`) and be shot with
`{ shot: 'INSERT', at: name }`, even a WIDE:

| Anchor | First use | Echo |
| --- | --- | --- |
| `backroom_wide` (reddy) | `EMPTY`, the end of Act One (26:276, 26:363) | 3.6 opens on it (34:515, 34:549) |
| `doorway_wide` (rooms) | 2.8 "from the doorway" (29:323) | 2.13's end, "the frame from 2.8" (31:738) |
| `lodge_window_out` (square) | 2.1 three figures in the lit window (27:233) | 2.10 (30:558) |
| `ceiling_corner`, `calendar_ots`, `rue_back`, `bed_view`, `car_window`, `front_glass`, `exterior`, `sky`, `tiers`, `lab_wide`, `bell_low`, `judge`, `lodge_window_pov` | composed wides/inserts named in the set | |

Hand-written lenses that recur are constants instead: `CORRIDOR` (33:176) mirrored in 3.7 (34:660) "composed exactly
like the corridor in 3.3"; `SIDE` (28:367) reused in 3.1 (32:138); the lab time-lapse lens (28:619 = 30:498 = 32:139);
`OTS_CHASE`, `TOP_DOWN`, `MARGARET`, `SLUMP` copied from 1.2 into the epilogue (35:259-262).

### 3.16 MATCH CUT (same angle, different place and time)

```js
const SAME = (id) => ({ shot: 'CLOSE', on: id, angle: 'low' });                  // 35:124: the same CLOSE, low, on whoever tilts his face up
const SAME_DESK = { shot: 'CAM', pos: [0.1, 1.0, -1.5], look: [0, 1.33, -2.32], fov: 40 };   // 35:126: the same lens by hand where a computed close fails
c.world.liveMax = 3; c.world.preload('square'); c.world.preload('office');      // 35:269-270 in dressE, under black
SAME('chase'), { do: lanyardOn }, { wait: 2.1 }, { act: [['chase', 'look_up']] }, …,
{ set: 'square', env: 'sun', spawn: { rue19: 'under_bell' } }, { do: squareUp }, SAME('rue19'), { wait: 2.7 },   // 35:392-395
{ set: 'office', env: 'day', spawn: { rue58: 'rue_desk' } }, { do: officeUp }, SAME_DESK, …,                     // 35:398-400
{ set: 'reddy', env: 'rain', spawn: { chase: COUNTER.chase, luka: COUNTER.luka } }, { do: storeBack }, …         // 35:410-411
```

- The cutscene step `{set}` has **no fade** (the scene step `['set']` fades). With every set preloaded and
  `liveMax = 3`, it is an instant cut. `watch` restores `liveMax = 2` (35:78).
- Each set's ambience comes with it; override it per frame (`squareUp` silences the rain, 35:140; `storeBack` restores it,
  35:176). The leaving set stays live: put back what you changed there (`storeBack`, 35:177-181).

### 3.17 PULL OUT through the whole set (3.9)

```js
const PULL = ['pull_1', 'pull_2', 'pull_3', 'pull_4', 'pull_5', 'crane_end', 'crane_top'], PULL_DUR = [1.4, 1.9, 2.2, 2.2, 2.6, 5];   // 34:991
function pullOut39() {                       // 34:992-1002: one glide per pair of anchors, the last one eased out, music faded on the penultimate
  const A = SETS.reddy.anchors, n = PULL_DUR.length;
  const steps = [{ do: (c) => { const a = A.pull_1; glideFromHere(c, { pos: a.from, look: a.at, fov: a.fov }, 2.2, 'in'); } }, { wait: 2.2 }];
  for (let i = 0; i < n; i++) { const a = A[PULL[i]], b = A[PULL[i + 1]];
    steps.push({ shot: 'CAM', pos: a.from, look: a.at, fov: a.fov, to: { pos: b.from, look: b.at, fov: b.fov }, dur: PULL_DUR[i], ease: i === n - 1 ? 'out' : 'linear' });
    if (i === n - 2) steps.push({ music: null, fade: 7 });
    steps.push({ wait: PULL_DUR[i] }); }
  return steps;
}
...pullOut39(),                              // 34:1149
```

Waypoints are anchors in the set (`pull_1…`), and the last two reuse the 1.1 crane's end and top frames: "the reverse of
the crane that opened Act One". The close before it is framed on the line to `pull_1` (`finalClose`, 34:1020).

### 3.18 SPLIT SCREEN (2.7, the only split in Rue)

```js
['do', (c) => { lodgeDress(c); desReads(c); c.world.preload('reddy'); c.world.env('day', 0, 'reddy'); }],   // 29:110: build and light the right half's set at scene start
const LEFT = { shot: 'CAM', pos: [-21.8, 1.76, 7.0], look: [-21.35, 1.5, 5.05], fov: 56 };                // 29:93: the boys facing right, across the divide
const RIGHT = { shot: 'INSERT', at: 'luke_call' };                                                         // 29:94: Luke facing left (mirrored)
LEFT, { do: ringing }, …                                                                                   // full-frame first: the cut into the split keeps the lens
{ spawn: 'luke', at: 'luke_phone', set: 'reddy' }, { act: [['luke', 'phone']] },                           // 29:159-160: an actor in the right-hand set
{ hud: null },                                                                                             // 29:161: the 1987 HUD would sit over the 2026 half
{ split: { left: { set: 'square', shot: LEFT }, right: { set: 'reddy', shot: RIGHT } } },                 // 29:162
{ sfx: 'clunk', vol: 0.35 }, { wait: 0.6 }, say('luke', 'Optus Redcliffe, Luke speaking.'), …
{ sfx: 'clunk' }, { split: null, slide: true }, { wait: 0.8 },                                             // 29:175-177: "the right half cuts to black and the left slides across"
{ despawn: 'luke' }, { hud: { battery: 4, bars: 1 } },                                                     // restore the nulled HUD state
```

- The two halves face each other across the divide: compose `LEFT` looking frame-right and `RIGHT` frame-left.
- The left half is the main camera (all moves work, aspect = half width; the `fov` is a vertical FOV, so a half-width
  frame shows less sideways). The right half is posed once: to recut it, call `{ split: { right: { set, shot } } }`
  again (`right.set` is **required on every call**). `{split}` is not awaited; the slide takes 0.6 s.
- Known engine bug: `camR.aspect` is stale (≈13% stretch) until the window resizes (`04-world.md` §11). Fix it before
  TWO's 1.3 and A1/B1.
- `liveMax` 2 is enough for one split (current + right set). Preload while the screen is black or at scene start.

### 3.19 TIME-LAPSE (2.6, 2.10, 3.1)

```js
TIMELAPSE,                                    // the locked lab wide (32:139)
{ fade: 'in', dur: 0.5 },
{ timelapse: { dur: 12, cycles: 3, from: 'day', to: 'night', keys: [                                            // 32:310-318
  { t: 1.8, steps: [{ hud: { battery: 1, bars: 3 } }] },
  { t: 3.6, steps: [{ place: 'luka', at: 'bike_rig' }, { act: [['luka', 'pedal', { speed: 0.9 }]] }, { place: 'rue19', at: 'floor_sleep' }, { act: [['rue19', 'lie']] }] },
  …
] } },
{ hud: { battery: 4, bars: 3 } },             // restate the end state: a skip runs every key but never touches env
```

- Keys swap who is where (bodies teleport between frames, which reads as days passing) and step the HUD.
- `cycles` 3 ends on `from`; 1.5 ends on `to` (2.10 dark→dawn, 30:508). After a skip the env is **not** advanced: restate
  it if later steps care.
- Start loops for the duration (`{ loop: 'dynamo' }`) and stop them in a key and after (30:507-517).
- A timelapse outside a cutscene: `c.runSteps([{ timelapse: {...} }])` from a scene `do` (28:405); not skippable there.

### 3.20 DISSOLVE within the same frame (time compression)

```js
function dissolve(c, dur = 1.4) {             // 33:82-93: snapshot this frame over the live view, fade the snapshot out on the game clock
  if (c.flow.skipping) return;
  const g = renderer.domElement;
  if (!DZ.el) { DZ.el = document.createElement('canvas'); DZ.el.style.cssText = 'position:fixed;…;pointer-events:none;opacity:0;z-index:0'; g.after(DZ.el); }
  try { c.world.render(1); DZ.el.width = g.width >> 1; DZ.el.height = g.height >> 1; DZ.el.getContext('2d').drawImage(g, 0, 0, DZ.el.width, DZ.el.height); } catch (e) { return; }
  DZ.el.style.opacity = '1'; DZ.t = 0; DZ.dur = dur; removeUpdate(dzTick); addUpdate(dzTick);
}
{ do: (c) => dissolve(c) }, { do: lean(0.1) }, { act: [['rue19', 'look_down']] },   // 33:258: change the pose under the snapshot
```

The corridor in 3.3 compresses twenty minutes into three dissolves, each changing Rue's lean/pose under the snapshot
(33:254-266). A card cross-fade on a readable screen is a different trick: repaint the card with a `mix` value
(`dissolve` in 24:35-37, `09:14 → 09:31`).

### 3.21 Letterbox handling

| Situation | What Rue does |
| --- | --- |
| A normal cutscene | `['cutscene', id]`: bars in at the start; bars and last shot kept if the next scene step is another letterboxed cutscene or there is none (`06-flow.md` §4.3) |
| Lines with no bars between cutscenes | `['steps', [...]]` (27:139-145, 28:147, 29:292) |
| A UI prompt must show where the bottom bar would be | `{ letterbox: false }` … `{ letterbox: true }` inside the cutscene (29:153-156, the record prompt) |
| A hotspot's `steps`, `c.playCutscene(steps, { letterbox: false })` | no bars (23:121, 25:454) |
| Cards | sized to `0.62 × innerHeight` with bars, `0.7×` without (`10:73`) |
| Snapshots (`snap`) | cropped to 2.35:1 whatever the canvas (17:171-173) |
| End a scene on black | last step `{ fade: 'out' }`; the next scene's `start` fades from black (24:297, 32:635) |
| A shot held into a mini-game | `into(shot)` (24:9) or `['cam', 'fixed', lens]` before the cutscene (§3.22) |

### 3.22 Handing the camera to a mini-game or to play without a jump

- `into(shot)` = `{ do: (c) => { c.cam.shot(shot); c.cam.cutscene = false; } }` (24:9, 35:258): a `do` runs even while
  skipping, so the mini-game never opens over a stale angle, and `cam.cutscene = false` stops the cutscene's end from
  easing back to the gameplay camera.
- `['cam', 'fixed', TETHER_SHOT]` **before** `['cutscene', '1.4_wall']` whose last shot is the same lens: the release
  eases into the same angle, no jump (25:169, 33:226 `GREEN`, 33:466 `DIALING`, 33:470 `HANDS`). Clear with `['cam',
  null]` after.
- A `['do', (c) => { place…; c.cam.shot(lens); }]` right before `['minigame', …]` (29:116-120, 26:307-312) sets the
  mini-game's backdrop outside any cutscene.
- A mini-game that ends on its own camera (torchlight's follow cam, `22:11`) is cut from by the next cutscene.

### 3.23 Narrow screens

```js
const fit = (fov) => Math.min(80, Math.max(fov, 2 * Math.atan(Math.tan(fov * PI / 360) * 16 / 9 * innerHeight / innerWidth) * 180 / PI));   // 23:66
{ shot: 'CAM', pos: [5.5, 1.1, -12.2], look: [4.6, 1.35, -2.2], get fov() { return fit(50); } },                                              // 23:288
```

Only 1.1 does this; TWO should move it into the engine (`04-world.md` §15.4 item 5).

---

## 4. Set pieces TWO echoes, annotated

### 4.1 The reverse-charge call

The operator's line is split by an interjection; the em-dashes are part of the text:

| Rue | Steps |
| --- | --- |
| 1.7 (26:331-358) | `{ sfx: 'trill' }` + crackle (`spark` at low vol) twice, `say('operator', 'You have a reverse-charge call from—')`, Chase leans into the lens (`lean`, 26:282-285), `say('chase', 'Chase and Luka! Optus Redcliffe!')`, …, `say('operator', '—Chase and Luka, Optus Redcliffe. Will you accept the charges?')`, slow push on the grille + `{ loop: 'rain', vol: 0.12 }`, `say('voice', '…Ah, go on. Yes.', { speed: 'slow' })` |
| 2.7 (29:163-176) | split; `clunk`; Luke answers; operator; Luka interjects with `{ act: 'point' }`; `'—1987. Will you accept the charges?'`; a 1.1 s pause; "Is this a scam? We get these. …No."; `clunk` + split slides away |
| 3.4 (33:597-604) | ECU INSERT on the grille, `{ sfx: 'trill' }`, `{ wait: 2.2 }`, the operator's full line, `{ flag: 'called_home' }`, `{ wait: 3 }` ("a silence on the line thirty-nine years long") |
| 3.5 (34:345-372) | ECU, `{ music: null, cut: true }`, `ring(c, true)` (brick trill every 3 s, LCD lit, handset buzz), close eyes, answer; operator `'…from—'`, `say('chase_luka', '…', { tag: 'down the line' })`, operator `'—Will you accept the charges?'`, "I will.", operator "Please answer yes or no.", half-sob, "Yes." |
| E (35:396-407) | match cut, `ringThird` (two rings on his face), smile, `answer`, "Yes?" |

Sounds: `trill` is the 1987 line's double trill; `brick_ring` is the brick phone's harsh trill (Black Monday's cadence:
every 3 s). Keep both for TWO (the double trill begins A2 step 18 and ends on a cut).

### 4.2 Departure: white fills the frame

```js
EMPTY, { sfx: 'flash_hum' }, { wait: 0.5 }, { sfx: 'zap' },                                       // 26:363-366 (1.7)
{ do: (c) => c.ui.fade('out', options.reduceFlashing ? 1.4 : 0.5, '#fff') },
{ despawn: 'chase' }, { despawn: 'luka' }, …hide the machine…, { prop: 'machine_chair', fn: (o) => { o.userData.spin = 2.6; } },
{ do: (c) => { smoke(c); } }, { do: (c) => c.ui.fade('in', 1.3) },                                // the empty room fades up out of the white
LODGE_WIDE, { sfx: 'flash_hum' }, { fade: 'out', dur: 1.3, color: '#fff' },                        // 33:606-608 (3.4)
{ despawn: 'luka' }, { despawn: 'chase' }, { prop: 'machine', visible: false }, …, { wait: 0.5 },
{ shot: 'CAM', … }, { do: (c) => lamp(c, true, …, 0xfff8e8, 40, 1.2) }, { fade: 'in', dur: 0.4 },  // the window glows, then tweens to 0 (33:612-619)
```

Everything that changes happens **under the white**. A fade-in without a colour keeps the last colour (white), so the
scene fades up out of white (`10:30-33`).

### 4.3 Arrival: the flash, the smoke, the stare (2.1)

```js
{ fade: 'out', dur: 0 }, { flag: 'machine_hidden', value: false },                                 // 27:170-171 (reset for Continue)
{ do: landingDress }, { do: handset },
{ act: [['luka', 'lie_tangled'], ['chase', 'lie_tangled'], ['des', 'phone']] },
{ title: 'Tuesday, 6 October 1987' },                                                              // date card over black
{ do: receiverECU }, { fade: 'in', dur: 0.6 }, { wait: 1.0 },
{ say: 'des', text: '…Ah, go on. Yes.', speed: 'slow' },                                           // the last line of Act One, from this end
{ face: 'des', to: [-22.9, 4.2] },
{ sfx: 'smoke_pop' }, puff([-22.9, 0.7, 4.2], 30),
{ shot: 'CAM', pos: [-20.7, 2.3, 6.05], look: [-23.2, 1.0, 3.95], fov: 58 },
{ flash: 1.4 },                                                                                    // the white flash, then the smoke clears on two bodies
{ wait: 0.8 },
{ shot: 'CLOSE', on: 'des' }, { say: 'des', text: '…Are yous the call?' },
… { stare: 3, ambient: [['kettle_click', 1.8]] }, { say: 'des', text: 'Tea?' }, { say: 'chase', text: '…Yes, please.' },   // 27:198-201
```

TWO 1.4 step 1-5 is this sequence (ECU the kettle's screen, WIDE locked, flash, smoke, "Stare, 2 s. The kettle clicks
off.", "Tea?", "…Yes, please."). The bodies are posed (`lie_tangled`) **before** the flash.

### 4.4 Flashes and Reduce Flashing

| Rue moment | Step | Under Reduce Flashing |
| --- | --- | --- |
| Spark (1.5, 25:553) | `{ flash: 0.12, color: '#fff3c0' }` | `ui.flash` peaks at 0.35 and fades slowly: a dim bloom (10:36-42) |
| Arrival (2.1, 27:186) | `{ flash: 1.4 }` | same |
| Polaroid (3.1, 32:412) | `{ par: [{ flash: 0.5 }, { fade: 'out', dur: 0.3, color: '#fff' }] }` | the white fade is stretched to ≥ 1.2 s automatically (`ui.fade`, colour starting `#f`, 10:33) |
| Censor storm (1.3, 24:387) | `{ fade: 'out', dur: 0.2, color: '#fff' }` | stretched to 1.2 s |
| Departure (1.7, 26:367) | `ui.fade('out', options.reduceFlashing ? 1.4 : 0.5, '#fff')` | explicit |
| Departure (3.4, 33:608) | `{ fade: 'out', dur: 1.3, color: '#fff' }` | already ≥ 1.2. The window glow after it (spot at 40) is not gated |
| Every window of the store (3.5, 34:295-309) | `flashWindows`: shows the set's `window_flash` prop for 0.3 s | **RF branch**: the prop's shared material set to black with `emissiveIntensity = 0.35·sin(πk)` over 1.2 s ("a slow, dim grey glow"), then restored |
| Alarm beacon (1.4, 25:85-91) | spot spinning red | RF: spins at 1.5 instead of 5, intensity 25 instead of 60 |
| Final YES montage (17:182, 17:212) | stills burning to white | RF: no additive "lighter" burn |
| Restart (E, 35:415) | `{ fade: 'out', dur: 0.7, color: '#fff' }` | stretched |

Rules: `{ flash }` and white `{ fade }` steps are RF-safe by construction **only if the colour string starts with `#f`**
(`'#fff'`, `'#fff3c0'`; `'white'` or `'rgb(…)'` is not caught). Anything else that flashes (props, emissives, lights,
lightning, the 1.2 BAM, the boss detonation) must branch on `options.reduceFlashing` like `flashWindows`, and must
modify shared materials only through uniforms and restore them.

### 4.5 Lights Out (2.9, 29:378-489) → TWO 2.9

| Beat | Steps |
| --- | --- |
| Dress | `bedDress` (29:385-396): coats, lamp off, door shut, both boys `lie`, Rue placed on the bed, `lie`, then **`root.rotation.z = -H`** (rolled to the wall), blob shadow hidden |
| One setup | `PUSH` (80 s linear glide from the set's `floor_wide` frame), `{ wait: 1.5 }`, `snap('floor')` |
| Every line slow | `slow(...)` × 30, `{ wait: 0.6–1.4 }` for the marked pauses |
| A sound in the dark | `{ sfx: 'tick', vol: 0.6 }, { wait: 0.35 }, { sfx: 'tick', vol: 0.45 }` (the lanyard clasp) |
| "They both laugh, quietly" | `{ expr: laugh }`, `{ do: laugh }` (talk mouths + a few blips at offsets; 29:406-410), `{ wait: 1.3 }`, `{ expr: neutral }` |
| Finish the push | `{ do: settlePush }, { wait: 1.4 }` |
| Two seconds of dark | `{ fade: 'out', dur: 0.9 }, { wait: 2 }` |
| The only cut | `{ do: rueInTheDark }` (spot above the eyes, cold blue, angle 0.3, intensity 1.1; CAM from the wall side), `{ fade: 'in', dur: 0.6 }` |
| Out | lines, `{ fade: 'out', dur: 0.8 }`, restore the torch and unroll Rue (29:488) |

TWO's "2.9_floor" and "2.9_lights_out" share the one setup: define the two lens objects once (as Rue's `FLOOR` /
`FLOOR_END`, ideally an anchor in `valley`), start the glide in each, and settle it. "The only cut … His eyes are open"
is `rueInTheDark` on `chase40`. `laugh` uses `setTimeout` (real time; see §7.6): use `c.wait` chains in TWO.

### 4.6 Storage Full (3.2, 32:427-638) → TWO 3.7

| Beat | Steps |
| --- | --- |
| Pre-call check | over-the-shoulder CAM into the cupboard, wrap off (`rip`), `type`, three `key_beep`/`beep` sfx (32:521-525) |
| HUD INSERT | `{ shot: 'INSERT', at: MACHINE, from: M_FROM, fov: 40, card: ['battery', { pct: 4, bars: 3 }] }` (32:527: point + `from` because the open door blocks the anchor's lens) |
| JARVIS-CAM + pop-up | `JCAM`, `{ wait: 0.5 }`, `{ do: (c) => { HELD.el = storagePopup(c, false).p.el; } }` (32:531-533) |
| Close-up while "the pop-up waits" | `park` (32:537), `winLight(true)`, CLOSE, lines; back: `JCAM, unpark, { wait: 2.4 }, { popup: null, clear: true }` (32:548-551) |
| Apart | high wide, `{ move: …, nowait: true }` then `{ move }`, faces, `{ hud: { bars: 1 }, anim: 1.5 }`, `{ music: 'emotional', fade: 3 }` |
| Singles through the bar | §3.11 |
| One shot again | `TWO_IN` + bars to 4 |
| The tell, stopped | `TOP_DOWN` + `hands_halt` (§3.3) |
| The player's NO | `{ music: null, fade: 1.5 }`, place at the machine, `JCAM`, `{ do: choice }` (32:456-475) |
| Thumb on NO | `{ shot: 'INSERT', at: MACHINE, from: M_FROM, fov: 40, card: ['storage_no', {}] }` (32:626) |
| Out | CLOSE "Not yet.", `{ wait: 1.4 }`, `{ fade: 'out', dur: 1.2 }`, `winLight(false)`, HUD restated |

TWO 3.7 step 25 "JARVIS-CAM · from behind the Remote's little screen, the framing from Rue's Storage Full": a JARVIS
anchor on the Remote in `hq_roof` with `from` behind its screen, faces = the party, and a **SafeSense** pop-up (engine API
`popup({ style: 'safesense', … })`) where Rue used `storagePopup`. Re-park the spot after each JARVIS-CAM. The Choice is
not Rue's `choice()`: both buttons live, hold 3 s (ARCHITECTURE: `MINIGAMES.choice`), so hand it a `['minigame']`
step with the camera held by a `['cam', 'fixed', …]` scene step on the hands lens before the cutscene (§3.22).

### 4.7 Opt Us In and the final YES (3.4, 33:368-654) → TWO 3.6, 3.7, A1

| Beat | Steps |
| --- | --- |
| Weather turns | crane down in two glides + `{ env: 'sun', dur: 6 }` (33:481-486) |
| Goodbye roam | `waves(c)` updater: wavers turn and wave once when the player is within 6 m (33:398-412), squared distance, no allocation |
| The lanyard | CLOSE on the hands, `lanyardOff` (hands over head then held at the chest: two tweens, 33:127-138); MID from behind Rue, `{ move }`, `lanyardOn` (re-parent and fit, §2.6); `{ item: 'lanyard', remove: true }` |
| PUDDING tape | `Object.assign({ card: ['label', { text: 'PUDDING' }] }, PUD)` (a card on a CAM shot), then `PUD` again for the following lines (33:530-532) |
| The Walkman swap | `tape` card on an actor INSERT, the tape changes hands **under the cut** (33:539-540), the bin drop tween (33:445-449), the `label` card |
| The clock | `{ shot: 'INSERT', at: 'lodge_clock', card: ['clock', { time: '11:55' }] }` |
| The name | CLOSE push 10 s + `slow(…, { auto: 0.5 })`, smile, `{ flag: 'optus_named' }` |
| Stare | locked two-shot CAM, faces turned, Des `drink`, `{ stare: 2 }` |
| Dial | moves, faces, `type`, `DIALING` (also set as `['cam', 'fixed', DIALING]` before the cutscene: 33:466) |
| STORAGE FULL again | `{ do: jarvisCam }`, `{ do: storage }` (NO drawn greyed), `{ wait: 2.6 }`, clear, `HANDS` "Together?" "Together." (33:582-594) |
| The final YES | `['cam', 'fixed', HANDS]`, `['minigame', 'final_yes', {}]` (33:470-472): hold YES 3 s while the snapped stills burn by in reverse (17:1-5) |
| The call and the white | §4.1, §4.2 |
| After | bell `ring(c, true)` updater (33:414-423), TRACK alongside Rue, `tap` → music to `pudding_walkman`, LOW from the cobbles, CLOSE low "Let it ring.", two-leg crane up; cleanup `ring(false)` + `lanyardHome` (33:653) |

**The memory stills.** `snap(name)` (17:167-178) renders the current frame, crops 2.35:1 and keeps a 480×204 canvas in
memory. Rue snaps at the moments the final YES replays: `'wall'` (1.4, 25:211), `'crash'` (2.3, 27:620), `'pedal'` (2.6,
28:624, a timelapse key), `'floor'` (2.9, 29:432), `'torch'` (2.13, 31:632), plus 2.10's flashback stills
`'glance_lodge'`, `'glance_theatre'`, `'glance_step'` (27:252, 27:589, 28:360). Snaps are **not taken while skipping**
and **don't survive a reload**: the final YES paints a silhouette fallback (17:17-30); 2.10 **re-stages each missing
moment under black and snaps it** before it needs them (`RESTAGE`, 30:522-551, gated by `{ if: () => MEM.some((n) =>
!still(n)), then: RESTAGE }`, 30:557). TWO 3.6's "Hold NO 3 s, a filling ring, as with Rue's final YES" reuses the
mini-game's shape; any TWO montage of earlier moments needs the same snap + restage + fallback trio.

TWO 3.6 step 5 "the way Luka once put a lanyard over Rue's head": the `lanyardOn` re-parenting technique on the
headphones (`chase` rig → `luka40` rig), and step 9 "one unbroken slow push-in through the whole first verse": a §3.5
glide with `dur` = the verse length (`(60 / 92) * 4 * 8` s for 8 bars at 92 BPM, Rue's `SONG`, 33:185) and a
settle before the next beat.

### 4.8 Torchlight (2.13, 31:394-749) → TWO 3.5 step 53

| Beat | Steps |
| --- | --- |
| Lights out | INSERT `lodge_window_pov`, `LAMPS_OUT` = for each lamp `{ prop: 'lamp_n', visible: false }, { sfx: 'kettle_click', vol: 0.45 }, { wait: 0.5 }` (31:440), `{ env: 'dark', dur: 0.5 }` |
| The machine glowing between them | `machineGlow` (spot as a blue screen light, 31:433-439) |
| The decision | INSERT on Luka's hand (`lanyard` anim), the sincere LOW (31:498), CLOSE locked "^Torches on." |
| Torches on | `give` anims, `tick` sfx, phones shown, `torchOn` (spot in the hand, 31:441-448), fade |
| Search | `['minigame', 'torchlight', { walkman: WALKMAN_COBBLES }]` (the rig's spot rides in the player's hand, `22:1-11`) |
| Found | `findSetup` (31:521-529), WIDE, `beam` slides the spot to Rue (31:532-546), `snap('torch')` |
| From above | TOP on `rue19` (`dist: 1.5, offset: 0.25`: Chase's 1.2 frame on Rue) |
| 0% | `holdUp` phone, INSERT on Chase, `torchesDie` (flicker list on the spot, 31:547-557), HUD 0, `sad_beep`, `battery` card |
| One lamp | `oneLamp` (31:558-568), TOP again, the gap shot, `EYE` captured |
| Together | `THREE_SHOT`, `sitThree` (31:571-574), bars rise with `anim` |
| Head up | TOP → `craneUp` (§3.3) |
| Yes | INSERT `rue19` `dist: 1.0` on the brick in his hands, CLOSE locked "…Yes.", bars to 4 |
| Away | crane up and away + rain thinning, fade, `{ set: 'rooms' }`, pour, `doorway_wide`, `{ title: 'END OF ACT TWO', dur: 3.5 }`, restore the spot (31:744-748) |

### 4.9 Three Weeks: the homecoming (3.6, 34:392-624) → TWO A1/B1 "Home"

```js
CUTSCENES['3.6_wake'] = [
  { do: dress36 },                                         // both on the floor, 'lie_tangled', expr 'sleep'; lanyard gone; doors shut
  { shot: 'INSERT', at: 'backroom_wide' },                 // the exact frame that ended Act One (26:276)
  { do: smoke },                                           // 5 puffs, the tube flickering on alternate puffs (34:447-455)
  { wait: 3.2 },
  { shot: 'TOP', on: ['luka', 'chase'], dist: 2.5 },       // [TOP-DOWN]
  { expr: [['chase', 'worried']] }, say('chase', '…Why are we on the floor?'), …
  { place: 'luka', at: 'floor_luka' }, { act: [['luka', 'sit', { h: 0.1 }]] }, …,   // sit up under the cut
  { shot: 'INSERT', at: 'luka' },                          // "It goes to his lanyard. Nothing's there. He pats his chest twice."
  { act: [['luka', 'lanyard', { dur: 1.3, loop: false, still: true }]] }, { wait: 1.5 },
  { act: [['luka', 'lanyard', { dur: 0.35, loop: false, still: true }]] }, { wait: 0.5 }, …   // 34:530-534
  { shot: 'INSERT', at: 'wall_clock', card: ['clock', { time: '11:58' }] }, …
```

Then the roam of six differences (§6.3: `look`, `eyeLens`, `glowWatch`, `visit`, `me`) and `3.6_luke`: Luke out of the
office (`move` with `speed: 2.2`, stunned), three whip pans (§3.13), a locked TWO "two totally blank faces", TOP on Chase
+ `head_hands`, Luka steps in at the edge of the top-down and the cut lands on the sincere LOW (34:590-595), a computed
push on Luke (34:605-610), Luke leaves, TWO, "…Dunno. Felt right." TWO's A1 37-52 / B1 27-42 are this beat for beat:
`backroom_wide` in `reddy26`, smoke, TOP-DOWN, the lanyard pat (B1 31: "It goes to his chest. His lanyard is there,
snapped and knotted"), Luke "Where have you two BEEN?" "…Lunch?" "For TWO DAYS?".

### 4.10 The Tape (3.8, 34:877-986) → TWO "bars fill as they land home"

One low locked two-shot glide over 100 s (`TAPE0 → TAPE1`), Chase `tap` + `dictaphone` sfx, `tapeHiss` loop, the tape
lines (`tape()` factory) with `onText` cues, `glanceAt` turns inside the shot, laughter on the tape as filtered `titter`
sfx (`lp: 2600`), a pause with the hiss turned up, Rue's voice with `{ tag: 'tape' }`, a far bell (`lp: 1400`), hiss
off, `tapeRest`, `{ hud: { bars: 0 } }, { wait: 0.8 }, { hud: { bars: 4 }, anim: 2.4 }`, and the only cut: an INSERT
through the door's window at a point with `from` (34:984).

### 4.11 Epilogue "Restart" (E, 35:256-420) → TWO A2 and the title drop

- `E_open`: `amb(true, ['aircon', 'fluoro'])` (rain on the windows), the 1.1 car-park lens `CARPARK`, Margaret's walk in
  (`move … nowait` pairs), lines through wet glass, `into(OTS_CHASE)` for the JARVIS Sale reprise
  (`['minigame', 'jarvis_sale', { mode: 'reprise', …, shot: OTS_CHASE }]`).
- `E_end`: the TOP-DOWN that laughs (§3.3), `tapChime` (knocks on the restart chime's rhythm, `c.wait` loop guarded by
  skipping, 35:105-114), the hand on the shoulder (`shoulder`: `face` + a long `give` held, 35:116-121), the `parcel`
  card, `lanyardHeld` → CLOSE "…EIGHT MONTHS." → `SAME('chase')` + `lanyardOn` + `look_up` → match cuts (§3.16) → JARVIS
  on `monitor2` + `restartClick` → white → `{ par: [bigTitle, blackUnder] }`.
- **The title drop** (35:216-223): `bigTitle` enlarges `#acard b` and plays `ui.actCard('RUE')`; `blackUnder` waits 1.2 s
  then instantly swaps the white overlay to black (`ui.fade(1, 0, '#000')`) so the card fades out to black. TWO's
  "Title: **TWO**" (prologue 14, A2 21, B2 22) wants its own style ("white, lowercase-friendly type, a hairline yellow
  underline"): add a UI title-card variant rather than restyling `#acard` from content.

### 4.12 Credits (C) and post-credits (PC)

- `SCENES.C` is one scene step `['minigame', 'credits', {}]` (35:425-430). Its `title` is a getter: `''` while C
  runs, `'Credits'` otherwise (only Chapter Select reads scene titles, 10:734; the flow never shows them, 11:568). The
  mini-game is a DOM
  build with every element a paused Web Animation on one 0..1 timeline timed to the song (`18:1-5`); it leaves the
  screen black for PC.
- The grants patch (35:433-434): `(SCENES[id].grants ||= {}).samples ||= s` gives scene select the samples each scene
  offers, so C started from Chapter Select plays the song on them.
- `PC` (35:470-514): `{ fade: 'out', dur: 0 }`, dress (`fillSpec`), `{ shot: 'SET', cam: 'street_up' }`, fade in, two
  chained glides ("TRACK · slowly through the office"), a push glide onto a frame, `list` / `plaque` cards, a MID from
  behind "2.8's `rue_back` setup", lines, a `pointAside` pose wrapper (below), the `nameplate` card, JARVIS-CAM on one
  face + a pop-up at the actor, `{ fade: 'out', dur: 1.2 }`, `{ popup: null, clear: true }`. The flow marks the game
  completed when scene `'PC'` ends (`06-flow.md` §3.1). TWO keeps the id `PC` (ARCHITECTURE §3.3).
- `pointAside` (35:439-454) wraps a pooled rig's `pose` function once (`r.asideWrapped`) to add a torso turn to `point`
  **only while `flow.sceneId === 'PC'`**: an anim variant without a new ANIMS entry, inert elsewhere.

---

## 5. INSERT cards

### 5.1 How a card gets on screen, and off

| Way | Shown by | Hidden by |
| --- | --- | --- |
| `{ shot, card: [kind, data] }` (any shot kind: INSERT, CAM 26:326, POV 32:408, CLOSE 30:600) | the flow (`cardOn = true`, 11:118) | the next shot step without `card`; the end of the outermost cutscene (11:103); `flow.skip()` (11:598); `flow.start` (11:551) |
| `Object.assign({ card: […] }, LENS)` | same (a card on a named lens: 26:97, 26:231, 33:530) | same |
| `c.ui.card(kind, data)` from a `do` | the UI directly | **only `c.ui.card(null)`** or the next scene's `flow.start`. The end of the cutscene and Skip Scene hide it only if a step card was also up (`cardOn`): the flow tracks only its own |
| Repaint while up (animated card) | `c.ui.card(kind, nextData)` on a timer: `cardSteps` (26:65-67), `develop` (32:234-246), `dissolve` (24:35-37) | as above |
| Item `examine` | `card(kind, data)` helper: show, wait for YES (0.5 s under autoplay), hide (28:60-66, 30:60-66, 26:114-120) | itself |

A `{shot, card}` step is ignored entirely while skipping, so no card appears in a skipped cutscene. `c.cam.shot(...)`
from a `do` does not hide a step card: Rue's computed-lens helpers call `c.ui.card(null)` first (34:49, 131, 141, 249,
260). Cards are painted at native size and scaled to `0.62` (bars) or `0.7` × the window height, and ≤ 0.86 × width
(10:73).

### 5.2 Every card kind

Built in (`10-ui.js`, `05-ui.md` §10.3): `postit`, `clock`, `phone`, `brick`, `screen`, `newspaper` (unused by content),
`poster`, `badge`, `calendar`, `watch`, `label`, `list`, `polaroid`, `plaque`, `nameplate`, `tv`, `battery`, `filofax`,
`wheel` (19).

Defined in content files (16): all follow `CARDS.kind = (cx, w, h, d) => {…}; CARDS.kind.size = [w, h];`.

| Kind | File:line | Size | Data | Draws |
| --- | --- | --- | --- | --- |
| `flyer` | 23:128-139 | 800×500 | `text` "HEADING: small print" | yellow staff flyer with a pin |
| `jmon` | 24:66-122 | 960×600 | `mode` `'spin'` \| `'form'` \| `'crash'` \| `'optin'`, `time`, `from` + `mix` (clock dissolve), `name`, `click`, `zoom` | the counter monitor's JARVIS screen, readable |
| `deadphone` | 24:125-145 | 420×800 | — | `CARDS.phone(…, { tone: 'dead' })` + two faces reflected (composes a built-in) |
| `parts` | 25:315-334 | 800×480 | `done: [bool×3]` | Chase's parts list, struck through as parts arrive |
| `crash1987` | 26:72-93 | 880×568 | `on` `'year'` \| `'owner'`, `zoom`, `max`, `hold` | the crash screen; a push-in on one spot by repainting `zoom` |
| `masthead` | 27:82-93 | 900×420 | `name`, `date` | torn newspaper masthead with the date big |
| `usbc` | 28:18-30 | 800×500 | — | the bottom edge of an iPhone |
| `lab_sign` | 28:32-41 | 800×460 | `text` (one line per sentence, last in red) | enamel door sign |
| `keytag` | 28:43-56 | 800×500 | `text` | brass key on a paper tag |
| `memory` | 30:37-48 | 960×408 | `name` (a final-YES still) | a snapped still, desaturated with a vignette ("FLASHBACK INSERTS") |
| `placard` | 32:72-89 | 800×540 | `text` "Head: subtitle" | an easel placard |
| `viewfinder` | 32:91-100 | 640×640 | — | **transparent** camera finder corners over a POV shot |
| `storage_no` | 32:104-135 | 800×600 | — | the machine's STORAGE FULL screen, YES greyed, a thumb on NO |
| `tape` | 33:155-169 | (default 800×600) | `text` | a shop-bought cassette label |
| `missing` | 34:627-656 | 640×900 | — | MISSING poster drawing the live actors' face canvases (`world.actor(id).rig.face.canvas`) |
| `parcel` | 35:226-254 | 900×640 | — | an opened parcel; composes `CARDS.badge(cx, 640, 520, { name: 'CHASE' })` and a handwritten note |

### 5.3 Every INSERT card Rue shows, by scene

| Scene | Card (kind · data) | Where |
| --- | --- | --- |
| P | `calendar` · October 2026, circle 20, "20 OCT — 11:58 — REDCLIFFE" | 23:184 |
| 1.1 | `flyer` (noticeboard hotspot) · `postit` "JARVIS DOWN 8:52 — L." · `clock` (wall-clock hotspot, time read off the set's hands, 23:117-122) | 23:238, 23:307, 23:121 |
| 1.2 | `jmon` spin/form/crash/optin via `MON()` (INSERT at a point with `from`) and `jmon()` repaints · `deadphone` | 24:189-261, 24:226 |
| 1.3 | `screen` · style crash, ':(' / 'JARVIS ran into a problem.' / 'Error 4044' | 24:362 |
| 1.4 | `badge` front, then back '1158' (item examine + ask "Flip it?"; again in 1.4_disarm) | 25:33-34, 25:282 |
| 1.5 | `parts` (arrive, machine hotspot, open) | 25:454, 25:487, 25:585 |
| 1.6 | `crash1987` zoom push and held · `phone` Rue's bio · `list` the Bug List (on `SHEET_TOP`) · `clock` 11:57 | 26:172-191, 26:180, 26:231, 26:261 |
| 1.7 | `wheel` spinning years then 06/10/1987 (on a CAM) · `clock` 11:58, 11:59, 12:00 jump cuts | 26:326-328, 26:381-389 |
| 2.1 | `phone` ×6 (No Service burst) · `masthead` · `battery` 1% (and the HUD appears) | 27:206-217, 27:238, 27:247 |
| 2.2 | `poster` (gig poster hotspot; the Enterprise Prize on a tilting CAM glide + `tiltCard` CSS drift; the timetable) | 27:335, 27:452-460 |
| 2.5 | `list` (top-down on the Filofax) · `battery` (on a CAM) · `usbc` | 28:233, 28:316, 28:321 |
| 2.6 | `keytag` (drawer hotspot) · `lab_sign` · `list` (in Declan's hands) | 28:447, 28:520, 28:644 |
| 2.7 | `battery` 4% | 29:129 |
| 2.10 | `list` Luka's notebook (roam hint, open) · `memory` ×3 flashbacks on CLOSE shots | 30:480, 30:624, 30:599-601 |
| 2.11 | `brick` lit:false | 31:146 |
| 2.12 | `tv` news · `brick` lit:true | 31:312, 31:342 |
| 2.13 | `battery` 0% | 31:644 |
| 3.1 | `filofax` · `placard` · `viewfinder` (on a POV) · `polaroid` developing (repainted by `develop`) | 32:299, 32:338, 32:408, 32:416 |
| 3.2 | `battery` 4% · `storage_no` | 32:527, 32:626 |
| 3.3 | `label` PUDDING | 33:336 |
| 3.4 | `label` (on the `PUD` CAM) · `tape` "Winning Is a Decision" · `label` · `clock` 11:55 | 33:530, 33:539, 33:544, 33:548 |
| 3.5 | `watch` 11:57, 11:58 | 34:341-343 |
| 3.6 | `missing` (via `look()`, hidden by hand) · `clock` 11:58 | 34:480, 34:540 |
| 3.7 | `badge` old, then old with '1158' · `polaroid` front | 34:823-825, 34:836 |
| E | `parcel` | 35:373 |
| PC | `list` the original spec (frame) · `plaque` · `nameplate` | 35:488-504 |

Item examines (inventory): `badge`/`lanyard` → `badge` (25:38-61), `bug_list` → `list` (26:105-121), `recorder` →
`list` (samples notebook), `key_1979` → `keytag`, `cable` → `usbc` (28:67-87), `notebook` → `list` (30:68-72).

### 5.4 Card gotchas

- A card that must be read is held 1.6–3.8 s (`{ wait }` after it). Cards on a CAM or actor INSERT don't need the 3D
  frame to show the object: the card covers the centre.
- A card that moves (zoom, spin, develop, tilt) is a sequence of repaints on a timer, or a CSS transform on
  `#cardwrap canvas` (`tiltCard`, 27:37-44, reset after). Repaints allocate (gradients, canvases): keep them to ~0.06 s
  steps for under a second, or 0.25 s (`develop`).
- `missing` reads live face canvases: the actors must be spawned in the current set when it paints.
- `CARDS.memory` depends on snaps (§4.7); `CARDS.polaroid` is Rue-specific art.

---

## 6. Helper catalogue: functions content files define locally, and why

### 6.1 Shared vocabulary (copied file to file because leaves can't share top-level names)

| Helper | Files | Does | Why it exists |
| --- | --- | --- | --- |
| `say`, `slow`, `tape` | 26-35 | step factories | terser scripts; `slow` is the honest-moment default |
| `actor(c, id)` | 28-35 | `c.world.actor(id)` | brevity; callers null-check |
| `snap(name)`, `still(n)`, `snapMem` | 25, 27-31 | guarded `MINIGAMES.final_yes.snap/still` | memory stills (§4.7); content files can load before the mini-game in theory |
| `glance` / `glanceAt(c, id, at, dur)` | 27-31, 34 | relative-yaw `glance` one-shot, clamped | head turns without feet; "count heads" habit beats |
| `glanceSnap(name, after)` | 27 | glance then snap at the mid-turn (0.55 s) | "the camera keeps catching it" |
| `tween(c, dur, fn)`, `slide` | 27, 29, 33-35 | self-removing smoothstep updater, instant when skipping | skip-safe prop/pose animation |
| `scope(id, fn, off)` | 25 | scene-scoped updater with cleanup | beacons, idle hints, collider removal |
| `watch()` | 26, 31, 33-35 | restore pooled rigs/props/`liveMax`/loops when the scene id leaves the range | quit and Chapter Select skip cleanup cutscenes |
| `lamp(c, on, pos, tgt, color, power, angle)` (+ `winLight`, `gateLight`, `onFace`, `onRec`) | 23, 32, 33 | the set's spot as a practical light | sets have one movable light (§2.7) |
| `fit(fov)` | 23 | narrow-screen FOV | compositions survive 4:3 |
| `into(shot)` | 24, 35 | hold a shot into a mini-game | §3.22 |
| `seat`/`seatIn`/`sitDown`/`sitThen`/`stand`/`unsit` | 27, 28, 31-33, 35 | sit at a height, set `rig.seated`, upper anim on top | seated upper-body anims |
| `hideBook`/`hideTextbook`/`noBook`/`holdUp`/`playBare` | 28, 31-35 | the `reading` pose without its textbook | "holding X in both hands" |
| `face(id, fn)`, `eyes(e)` | 32, 34, 35 | drive eyes/brows/mouth directly | expressions finer than presets |
| `prop`/`kitProp`/`hand`/`drop`/`faceOut` | 33, 34 | hand props built once, re-homed, put in a hand | props that aren't set props or rig attachments |
| `putDown`/`pickUp`/`show` | 31 | clone a rig attachment into the world; toggle attachments | phone on a table, Walkman on the cobbles |
| `lanyard`/`lanyardHome`/`lanyardOff`/`lanyardOn`/`lanyardHeld`/`lanyardGone`/`rueLanyard` | 33-35 | move the lanyard mesh between torso, hands and another rig | the series' central prop |
| `handShot`/`faceAndHands`/`carClose`/`ecu`/`finalClose`/`eyeLens`/`look` | 33, 34 | computed lenses (§3.12) | anchors can't follow hands |
| `glideFromHere`, `settlePush`, `tapeRest`, `craneUp` | 29, 31, 34 | glides from the live camera (§3.5, §3.7) | no cut where the script says none |
| `card(kind, data)`, `icon(fn)` | 28, 30 | item examine card until YES; scaled icon painter | ITEMS defined in content |
| `flicker(c, n)`, `sparks`, `smoke`, `puff(at, n)` | 25-27, 34 | tube dropouts, spark/smoke puffs | atmosphere (all no-ops or skipped when skipping) |
| `cardSteps(c, kind, list, gap)` | 26 | repaint a card through a list | animated readable screens |
| `typed(s)`, `onText(line, sub, fn)` | 31, 34 | cue at a word | one long line in one shot (§2.4) |
| `through(name, vol, rate)`, `amb(rain, loops)`, `tapeHiss` | 33-35 | muffled sfx; ambience override; hiss loop | sound design beyond the set's ambience |
| `walkTo`, `near`, `waitX`, `visit` | 30, 34 | multi-point walks, position predicates, autoplay staging | walks under dialogue (§2.3) |
| `me(text)`, `swapText()` | 34, 30 | line by the active character; control-scheme swap hint | swap scenes |

### 6.2 Scene-specific helpers (one line each)

- **23**: `lamp`, `liftPolaroid`/`setDownPolaroid` (Polaroid between the hands, then set down with a tween),
  `openingDress` (props from flags + a temporary collider), `earbudOut` (`hold` an attachment in the left hand),
  `rueTalks` (repaint the set's TV canvas mouth open/closed), `videoError`, `duties`/`tick`, `tutorial`, `clockInsert`,
  `doorOpened` (a JARVIS door that swings shut behind them), `bop` (anim).
- **24**: `OTS_CHASE/OTS_LUKA`, `screen(mode)` (set monitor modes), `MON`/`jmon`, `MARGARET` ("one framing, reused"),
  `EXIT_WIDE`, `storm`, `dissolve` (card), `lightsOut`, `patience`, `whiteScreen` (paint a set canvas white),
  `cuss`, `mood(id, m)`.
- **25**: `scope`, `shut`/`open` (door rotation + `userData.open`), `spinner` (the JARVIS-door pop-up as a step),
  `badgeLook` (an examine with an `ask` and an `if`), `dress14`, `hugPhones` (clones of four props on the torso; `walkAnim
  = 'carry'`), `alarmsOn/Off` (beacon + swinging tethers updater), `keypad` (a mini-game from a hotspot with an async
  `onSubmit` that says lines and decides when to close), `goggles`/`pushGoggles`, `solderIron`/`wires` (Builder props
  added under the machine's parent), `machine`/`arrive`/`deliver`/`takeChair`/`wireUp`, `carrying`, `far`.
- **26**: `room` (collider + sheet/pen kit, removed by an updater), `phoneOut`, `clockAt(h, m)` (set clock hands),
  `cardSteps`, `CRASH`, `fillList`, `standCall`, `lean` (8-step position nudge toward the lens), `smoke`.
- **27**: `glance`/`glanceSnap`, `habit`, `sitThen`, `slide`, `tiltCard`, `landingDress`, `puff`, `tidy`, `phoneCard`,
  `handset` (a cream receiver built and attached as `rig.attach.brick` so the `phone` anim shows it), `receiverECU`,
  `note` (the $50 note in the grip), `enterButtery`, `tryBernie` (a `choose` with a disabled option), `BERNIE_AUTO`
  (a hotspot object fired by an updater after 20 s), `payBernie`.
- **28**: `has`, `fillList`, `card`, `icon`, `sitDown`/`unsit`, `glanceAt`, `squareDress`/`labDress`/`butteryDress`,
  `REC`/`PHONES` (attachment toggles as steps), `missing` (the hint line), `wheel` (bike), `pedal(n)` (retry a mini-game
  with a widened band until it passes, then a short timelapse), `rest` (scene-step array spread between sessions).
- **29**: `lodgeDress`, `desReads` (a canvas-textured newspaper put in a hand and re-posed in the torso frame with matrix
  math), `umbrella`/`unroll`, `ringing`, `roomDress`, `inRoom`/`inCorridor` (roam predicates), `bedDress`,
  `settlePush`, `laugh`, `rueInTheDark`.
- **30**: `newNames`, `swapText`, `still`, `glance`, `cap_tap` (anim), `fillNB`, `resetDay` (scene-start flag reset so
  Continue restarts the day), `carry`/`mug`, `notes` (paper sheets parented to an actor's root), `bookUnder`, `chalk`,
  `busk`/`tune` (positional whistle loop with a reused options object), `desComes`/`desSeat`/`desGoes`, `ring`,
  `BELL_SPOT` + `bellWatch` (an updater that fires a hotspot object once conditions hold), `recordBell`, `dayEnd`,
  `onBike`, `RESTAGE`, `morning`/`greetings`/`rueJoins` (a walking greeting sequence: wait for x thresholds, turn and
  wave, say with `auto`).
- **31**: `show`, `seat`, `stand`, `holdUp`, `typed`, `putDown`/`pickUp`/`facing`, `tidyRue`, `watch`, `chatter`,
  `dress211`, `setDown`, `ring`, `coat`, `readAloud`, `dress212`, `emptySmile`, `set_down` (anim) + `lowerPhone` (swap the
  rig's brick for a world copy exactly where the hand left it), `toWindow`, `lift_head`/`back_hand` (anims), `lodge213`,
  `machineGlow`, `LAMPS_OUT`, `torchOn`, `findSetup`, `beam`/`beamOff`, `torchesDie`, `oneLamp`, `sitThree`, `craneUp`,
  `teapot`/`pour`, `room213`.
- **32**: `face`, `seatIn`/`seat`/`stand`/`hideBook`, `lamp`, `bow`/`fold`/`hands_halt` (anims), `wrap` (canvas text
  wrap), `blinks`, `REACT`/`INS`/`order`/`speech()` (**steps generated from player data**: one line per pitch card in
  the player's order, each cutting to its listener mid-line), `hallDress`, `rueNotes`, `putDown` (notes tween),
  `develop`, `storagePopup`, `park`/`unpark`, `choice`, `lodgeDress`, `winLight`, `gateLight`.
- **33**: `tween`, `prop`/`hand`/`drop`/`hideTextbook`/`seat`, `handShot`, `lamp`, `dissolve`, `lean`, `through`,
  `lanyard*`, `watch`, `roomDress`/`labDress`, `phones(on)`, `playSong`, `squareDress`, `waves`, `ring`/`ringTick`,
  `storage`, `jarvisCam`, `binDrop`.
- **34**: `tween`, the `_bare` anims + `phone_mouth` + `collar`, `playBare`, `glideFromHere`, `contentsKit` (a box whose
  contents are separate children so `lift(n)` hides one as it's picked up), `kitProp`/`hand`/`handShot`/`faceAndHands`/
  `faceOut`/`drop`, `lanyard*`, `watch`, `rue`, `boxToCar`/`boxToBench` (re-parent a set prop between set parts),
  `dress35`, `lapPhone`, `ecu`, `pullOut`, `carClose`, `ring`, `answer`, `eyes`, `halfSob`, `flashWindows`, `found`,
  `me`, `behind`, `eyeLens`, `look`, `unseen`, `glowWatch` (after 60 s unfound differences shimmer with puffs every 1.3 s,
  only while roaming), `dress36`, `smoke`, `doorOpened`, `visit`, `walkTo`, `near`, `glanceAt`, `dress37`, `contentsOn`,
  `lift`, `kettleYes` (an `ask` the character answers himself by clicking the YES button, 34:707-714), `steam`, `lerp3`,
  `tapeRest`, `onText`, `dress38`, `tapeHiss`, `pullOut39`, `dress39`, `finalClose`.
- **35**: `tween`, `amb`, `face`, `noBook`, `seat`, `lanyard*`, `watch`, `cutOnCrash`, `handsUp`, `laugh`, `tapChime`,
  `shoulder`, `SAME`, `rueLanyard`, `squareUp`, `officeUp`, `ringThird`, `smileUp`, `answer`, `storeBack`, `restartClick`,
  `blackUnder`, `bigTitle`, `into`, `dressE`, `pointAside`, `fillSpec`.

### 6.3 Registries content files write to

| Registry | What content adds | Pattern |
| --- | --- | --- |
| `ANIMS` | `bop` (23:55), `fold` (27:19, 32:39), `bow`, `hands_halt` (32), `cap_tap` (30:26), `set_down`, `lift_head`, `back_hand` (31), `*_bare`, `mouth_bare`, `phone_mouth`, `collar` (34:30-40) | `if (!ANIMS.x)` guard; `ANIMS.x.upper = true` keeps seated/walking legs; `.shows = 'brick'` shows a rig attachment during it (31:271); compose by calling other ANIMS then offsetting `r.parts.*.rotation`; blend two poses with **preallocated** quaternion arrays (32:49, 31:259) |
| `CARDS` | §5.2 | `.size` |
| `ITEMS` | `badge`, `lanyard` (25), `bug_list` (26), `recorder`, `transformer`, `key_1979`, `cable` (28), `notebook`, `toast`, `key_brass`, `glasses` (30) | `{ name, desc, icon(cx, w, h), examine }` (steps or a function) |
| `SETS.<id>.colliders` | temporary boxes (locked office 23:48, 25:17; machine 26:11) | push, then splice in a scope/watch updater |
| `SCENES[id].grants` | samples patch (35:433-434) | after all scenes exist |
| `world.liveMax` | 3 for match cuts (35:269) | restored in `watch` |

---

## 7. How to extend for TWO

### 7.1 Put the shared vocabulary in one engine fragment

Rue duplicates `say`, `slow`, `tween`, `glanceAt`, `seat`, `lamp`, `hand`, `handShot`, `lanyard*`, `watch` in up to
eight files, with drift (two `tween`s, three `lamp` signatures, `glanceAt` clamps of 1.3 and 1.4). Leaves can't share
top-level names, but engine fragments can. Add a single `CONTENT`-style helper object to an engine fragment (e.g.
`33-systems.js`, owner's call) exposing the stable ones: `line(id, text, o)`, `slow`, `glanceAt`, `tween` (the 33/34
version), `seat`/`stand`, `bare(anim)`, `lamp`/`lampOff`, `glideFromHere`, `settleGlide(endLens, t0, dur)`, `handShot`,
`faceAndHands`, `eyeLens`, `into`, `snap`, `fitFov`, `moveMesh(mesh, toRig, fit)` (the lanyard/headphones re-parent),
`watchRange(ids, restore)`. Content files then destructure it at the top of their IIFE. Keep **scene-specific** dressing
in the content file.

### 7.2 TWO's echoes → Rue's recipe

| TWO (BUILD_PROMPT §8) | Rue recipe |
| --- | --- |
| P 3 "INSERT · slow track along the desk … ends on the face-down frame" | two chained CAM glides through a reading node (§3.8, 23:168-171) |
| P 4 / 3.3 1 "WIDE · high, from the far corner" | `{ shot: 'SET', cam: 'corner_high' }` or a named anchor (23:173); same frame both times (§3.15) |
| P 14, A2 21, B2 22 "Title: TWO" | the title drop (§4.11) with a new title-card style |
| 1.2 3, 1.3 26 "INSERT · the wall clock" | `{ shot: 'INSERT', at: 'wall_clock', card: ['clock', { time }] }` + `clockAt` for the 3D hands (26:57, 26:380-389) |
| 1.2 4-13 the call, "Just say yes" | the reverse-charge pattern (§4.1): `say('operator', '…from—')`, `say('voice', …)`, `say('operator', '—2040. Will you accept the charges?')` |
| 1.2 16 "BAM … white flash erupts (RF: slow grey bloom)" | `flashWindows`-style RF branch on a prop + `{ flash }`; four alarm loops (25:231); smoke puffs; tethers swinging (25:122-136) |
| 1.2 17 "SLOW MOTION 1.5 s" | not in Rue; needs an engine `slowmo` (`04-world.md` §15.4 item 4) |
| 1.2 19 "LOW · upside down" | not in Rue; camera roll (`04-world.md` §15.4 item 6) |
| 1.2 20, 1.4 3, 2.3, … "Stare, n s" | `{ stare: n, ambient }` (§3.14) |
| 1.3 2-6 SPLIT SCREEN, "RIGHT HALF · ECU · the kettle's screen", "LEFT HALF" | §3.18; recut the right with `{ split: { right: { set: 'reddy40', shot: { shot: 'INSERT', at: 'kettle_screen' } } } }`; "[LEFT HALF]" = a new `left.shot` with the same `right` |
| 1.3 22, 1.4 2 white / arrival | §4.2, §4.3 |
| 2.1, 2.7 "one locked two-shot, side-on" | a static CAM (`TWO_SIDE` 31:79) or `{ shot: 'TWO', on, locked: true }` |
| 2.3 8 "Three on the bench (Rue's three-shot, now in daylight)" | `THREE_SHOT` composition (31:569) + `sitThree` |
| 2.5 laugh at the halfway marker, always granted | a sample step `{ sample: 'laugh' }` applied unconditionally (steps still apply when skipped) |
| 2.8 3, 3.3 63 "ORBIT · around Chase, speeding up" | `pitchOrbit` (§3.1). 3.3's orbit runs under steps 63-69: size `dur` to the sum of those lines (+ beats) |
| 2.9 floor / lights out, "the only cut" | Lights Out (§4.5) |
| 2.10 sequencer, 3.6 the song | mini-games; for scripted playback, `playSong`'s end-or-timeout wait (33:307-316) |
| 3.3 12 "INSERT · slow: the badge swings and flips over: 1158" | actor INSERT + `badge` card front → back (34:823-825) |
| 3.3 15 the name label switches with a one-frame glitch | engine `ui.nameGlitch` (ARCHITECTURE §5) |
| 3.3 21 "TOP-DOWN · his hands rise to his head. This time they don't stop." | `TOP_DOWN` + `head_hands` (§3.3) |
| 3.5 53 "LOW · the sincere low angle from Rue's Torchlight" | 31:498 verbatim |
| 3.6 5 headphones over his head "the way Luka once put a lanyard over Rue's head" | `lanyardOn` re-parent and fit (33:140-152) |
| 3.6 9 "one unbroken slow push-in through the whole first verse" | §3.5 with `dur` from the song structure |
| 3.6 13, A2 3 hands rise and stop halfway | `hands_halt` (32:48-58); A2's laugh + crane (35:341-347) |
| 3.6 "Your call", hold NO 3 s | the final-YES mini-game's shape (§4.7), `MINIGAMES.hold_no` |
| 3.7 25 JARVIS-CAM "the framing from Rue's Storage Full" | `JCAM` + re-park the spot + SafeSense pop-up (§4.6) |
| 3.7 53 "TWO-SHOT · tight, their hands side by side … the framing from Rue's 3.4" | `HANDS` (33:381), set as `['cam', 'fixed', …]` before the cutscene so the Choice sits on it |
| A1 19-26 split call, "White pours across the roof … The split closes; the left half fills the frame" | §3.18 + §4.2: white on the left (a white `{ fade }` covers both halves; for "the left half only", a white emissive/prop or a DOM overlay clipped to the left half), then `{ split: null, slide: true }` |
| A1 37 / B1 27 "WIDE · locked, the backroom … the exact frame that ended Rue's Act One" | `backroom_wide` anchor in `reddy26` + `smoke` (§4.9) |
| A1 38 / B1 28 TOP-DOWN on both | `{ shot: 'TOP', on: ['luka', 'chase'], dist: 2.5 }` (34:519) |
| A2 18 "Calling: RUE (BRICK). The old double trill begins. (Cut before anyone answers.)" | `phone` card + `{ sfx: 'trill' }`, `{ wait }` < one trill, `{ fade: 'out', dur: 0 }` |
| A2 19, B1 47-56 montages of held frames with date cards | per frame: preload under black, `{ set }` + place + a CAM + a time card, ~2.5 s, `liveMax ≥ 3`; or Rue's same-frame `dissolve` (§3.20) where the place doesn't change |
| B1 57 "MATCH CUT · the exact frame of 1.2, step 1" | §3.16: store 1.2's opening lens as a shared constant, `liveMax = 3`, `{ set: 'reddy26' }` + that lens |
| B2 21 "CRANE · slowly up and away" | §3.6 |
| HUD: "the signal icon fills to four bars as they land home (Rue's tape moment)" | `{ hud: { bars: 0 } }, { wait: 0.8 }, { hud: { bars: 4 }, anim: 2.4 }` (34:971-973) with TWO's HUD API |
| C credits | Rue's DOM timeline mini-game (18); "People you met" Polaroid cards can use `snap` stills (§4.7) |
| PC "INSERT · He presses HOLD … the hold music starts" | `{ loop: 'hold', … }` or `music('hold')`; Rue's hold-music loop under a stare (34:771) |

### 7.3 New content-side needs (Rue has no pattern)

- **SafeSense pop-ups on glass and in Chip View**, the empty NO slot (`emptySlot: true`), and the NO slot filling
  (3.6 19): an engine pop-up style, not a content hack like `storagePopup`'s appended spans.
- **Barks during play** (boss lines, drones): `bark()` (ARCHITECTURE §5), never `say` (which blocks).
- **Three playables** (`flow.follow` list): every Rue helper that places "the follower behind the active one"
  (`behind`, `visit`, 34:398-403, 459-464) assumes one follower.
- **Time cards** at scene start (ARCHITECTURE §5) replace Rue's `{ title: '3:00 am' }` steps (33:288, 27:649); keep
  `{ title }` for in-scene date cards only if the style matches.
- **Pooled-rig attachments** TWO adds (Santa hat and beard, headphones, chip light, hood, bandages, the burned hand):
  set them in every scene's dress and restore them in a `watch` updater, as Rue does for the lanyard, earbud,
  headphones, Walkman, brick and tears (33:114-125, 34:186-202).

### 7.4 Performance rules for content

- **No allocation in per-tick code.** Updaters (`addUpdate`) and `when`/`until` predicates run every 60 Hz tick. Rue's
  good examples: module-level scratch vectors (`V1`, `V2`, 34:11; `JF/JL/JD/JE/JH`, 33:433), preallocated quaternion
  arrays in ANIMS (32:49, 31:259-260), the reused sfx options object (`BUSK.o`, 30:185), lists built once before the
  updater (`waves`, 33:399-401), squared distances. One-off `new THREE.Vector3()` inside a `do` is fine (29:400); inside an
  updater it is not.
- **Build props once**: Builder kits cached in a module variable (`kit`, `iron`, `tangle`, `COAT`, `POT`, `paper`,
  `NOTES`, `CHALK`) and textures with `canvasTex(…, { key })`. Re-home, don't rebuild.
- **Merged geometry and instancing belong to sets.** Content should toggle and move set props, not add many meshes. If
  a crowd or a ring of drones must change (the 400 yellow drones), the set exposes an API on `userData` (Rue's
  `crowd.userData.look/hideNear`, 27:607, 27:630; `prop.userData.show/ring/pullUp/go/flip/set`).
- **Shader warm-up at boot.** Every material that will ever render must exist at boot. Content-built meshes must use
  warmed families: `mat(color)` (Lambert), `matTex(canvasTex(...))`, the puff. Rue's one emissive (`mat(0x0a1a08,
  { emissive, key: 'off_lcd' })`, 34:113) is a Lambert variant. A new material kind built mid-cutscene compiles a program
  and hitches (the autoplay warning catches it). Never add lights: reuse the set's spot (§2.7).
- **Loads behind black.** `preload` the next set at scene start or under a fade (29:110, 32:267, 35:270). The
  cutscene `{set}` step has no fade: put `{ fade: 'out' }` before it unless every set is already live (§3.16).
- **Snaps and dissolves** call `world.render(1)` and draw the whole canvas: a few per scene, never per tick.
- DOM-reading cue helpers (`typed`, `onText`) query the DOM in a `waitUntil` each tick: acceptable for one line;
  don't leave them running.

### 7.5 Skip-safety checklist (every step must finish instantly and leave the right end state)

1. Cosmetic `do`s start with `if (c.flow.skipping) return;` (29:399, 32:236, 33:83, 35:192). State-changing `do`s
   apply their end state either way (`tween` calls `fn(1)`; `putDown` snaps the notes; `lowerPhone` places the copy).
2. Every loop with `await c.wait()` tests `!c.flow.skipping` (24:28, 26:66, 31:213, 35:108). Every `waitUntil` includes
   `c.flow.skipping ||` (29:75, 32:466, 34:757).
3. Shots, cards, `say` cues, `sfx`, stares, titles and pop-ups are dropped when skipping. Anything later steps rely on
   (camera for a mini-game, a prop's position, a flag) goes in an applied step or a `do` (`into`, `{prop}`, `{flag}`).
4. `snap()` does nothing while skipping: plan restaging (30:522-557) or a fallback.
5. A `{ do }` that awaits world promises (`moveTo`, `play`) keeps going in real time if a skip starts: prefer `{move}`
   steps, or fire-and-forget plus a `waitUntil` with a skip escape (§2.3).
6. Don't use `setTimeout` for cues (29:408-409): real time, ignores pause and `speed`, survives a scene change. Use
   `c.wait(...).then(() => { if (!c.flow.skipping && c.flow.sceneId === id) … })` (34:772).
7. Undo everything on pooled rigs and shared sets in the scene's own end steps **and** in a `watch`/`scope` updater
   (quit and Chapter Select never reach the end steps): `root.rotation.z`, attachments, `face.tears`, textbook scale,
   pose wrappers, `walkAnim`, `mood`, `habit`, `torchAuto` and the spot, `liveMax`, colliders, loops (`hiss`),
   ambience overrides.
8. Reset per-scene flags at the scene's start when Continue can resume mid-day (`resetDay` 30:81-87, 2.1's
   `{ flag: 'machine_hidden', value: false }` 27:171, `dress14`/`dress15` deleting flags 25:76, 25:419).
9. Never `{ popup: { buttons: [] }, wait: true }` without `dur`; always pair a no-button pop-up with a later
   `{ popup: null, clear: true }`.
10. Test every scene with `?autoplay=1&fast=1` (all cutscenes skipped) **and** without `fast` (real time), and give every
    roam an `auto()` and every custom wait a `TEST.auto` path (29:77, 32:467, 34:710).

### 7.6 Pitfalls Rue's writers hit

- **The JARVIS-CAM leaves the spot at the screen** (only colour/intensity/angle are restored): re-park it (§3.2).
- **`c.ui.card` from a `do` isn't hidden by the flow** (§5.1).
- **`{ hud: null }` nulls HUD state**; restate (§2.11).
- **`{ fade: 'in' }` keeps the last fade colour**; a later `{ fade: 'out' }` without a colour goes black (§4.2).
- **Reduce Flashing only catches white fades whose colour starts with `#f`** (§4.4).
- **A computed lens reads the pose of the last rendered frame**: wait 0.05–0.1 s after `act` before `handShot` /
  `eyePos` (34:1100-1102, 34:322-326).
- **`ANIMS` defined in a content file exist only after that file evaluates** (all content evaluates at boot, so it's
  fine in a single build; the guard `if (!ANIMS.x)` avoids clobbering an engine version). TWO should move animations
  that several scenes need (`hands_halt`, `lift_head`, `back_hand`, the bare poses) into `04-art.js`.
- **Orbit duration from text length** ignores beats and the time spent reading after typing; add 1 s (Rue) or more.
- **Long glides finish early or late with the reader**: settle them (§3.5).
- **A split's right half is static** and its aspect is wrong until the engine fix (§3.18).
- **Re-using a set anchor across very different staging** (3.4's machine moved off `machine_back`): compute the lens
  instead of trusting the anchor (§3.2).

---

## 8. The ten gotchas most likely to bite

1. Shot steps (and their cards) do nothing while skipping; a camera a mini-game needs must come from `into()` or
   `['cam', 'fixed', …]`.
2. `do` steps always run, even while skipping; cosmetic ones must return early, loops must test `c.flow.skipping`.
3. A block-bodied `do` is not awaited; an expression-bodied one is.
4. The JARVIS-CAM borrows the set's only spot and does not put it back where it was.
5. Cards shown with `c.ui.card` must be hidden with `c.ui.card(null)`.
6. Reduce Flashing is automatic only for `{flash}` and for `{fade}` with a colour starting `#f`; prop/emissive/light
   flashes need an explicit `options.reduceFlashing` branch.
7. Pooled rigs remember everything (roll, attachments, tears, wrappers): restore in the scene and in a `watch` updater.
8. Memory stills (`snap`) are lost on reload and never taken while skipping: restage or fall back.
9. A cutscene `{set}` is an instant cut with no fade; it is only clean under black or with the set preloaded and
   `liveMax ≥ 3`.
10. `setTimeout` and DOM-time animations run on real time, not the game clock: they ignore pause, `speed` and skip.
