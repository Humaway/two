# TWO — Architecture and contracts

TWO is the sequel to RUE and is built on Rue's engine (see `docs/ENGINE.md` and `docs/engine/*.md`, which document
Rue's engine; TWO's `src/` started as a verbatim copy). The spec is `docs/BUILD_PROMPT.md` — **section 8 is the game;
every line of dialogue is final and word for word.** This file is the contract between everyone working on `src/`.

## 1. Build, test, deliverable

- Source lives in `src/NN-name.(html|js)` fragments. `node tools/build.mjs` concatenates them (sorted by name) into
  **`two.html`** (the deliverable: one self-contained file; the only external fetch is Three.js r186 from jsDelivr
  through the import map). Use `--out <path>` to build somewhere else (always do this when other people may be building
  at the same time: `node tools/build.mjs --out out/<you>.html --mine <your files>`: only your files come from the working tree, every other tracked fragment from the last commit, so a colleague's half-finished edit can't break your build).
- **Engine fragments** (`00–09`, `30–39`, `99`) share one module scope and may declare top-level names.
  **Leaf fragments** (`10–29` sets, `40–59` mini-games, `60–89` content) must not declare top-level names that others
  rely on: they only register into the registries (`SETS.x = (() => {...})();`, `(() => { SCENES[...] = ...; })();`).
  The build syntax-checks every leaf and wraps it in `try/catch`, and skips a leaf that fails to parse (with a warning),
  so one broken leaf can't stop the game booting.
- `node tools/run.mjs --file out/<you>.html --q "autoplay=1&fast=1&speed=8&scene=1.1&stop=1.3" [--timeout 600]
  [--shots out/<you>-shots --every 2] [--w 1280 --h 720]` runs headless Chromium (SwiftShader WebGL; three.js is served
  from `node_modules`, the CDN is blocked here), prints `TWO_TEST.log`, console warnings and errors, and exits 1 on any
  error or timeout. Use `--shots` to look at the game (Read the PNGs). Without `fast=1` cutscenes play in real time
  (scaled by `speed`), which is what you want for screenshots.
- `node tools/check-lines.mjs [--scene 2.3] [--all] [--counts]` checks that every quoted line of section 8–13 appears
  verbatim in some string literal in `src/` (curly quotes/apostrophes and spacing around `^` are normalised; nothing else).
- Test hooks (spec §16): `?autoplay=1` auto-advances everything and plays every mini-game with its autoplayer;
  `&scene=2.3` starts there (with the grants of every scene before it, **along the target's ending branch**: `A1`/`A2`
  skip B's grants and vice versa; `C`/`PC` follow `&ending`, else A); `&stop=2.5` ends after it; `&speed=8`; `&fast=1`
  runs every cutscene as if skipped; `&ending=A|B` is `TEST.ending`: the Choice's autoplayer must answer with it, and
  after 3.7 the flow goes to `A1` or `B1` by `state.choice` (falling back to `TEST.ending`, then A).
  `window.TWO_TEST = { ready, done, scene, step, log }`. Logs worth grepping: `scene <id> step <i> <kind>`, `hotspot <id>`,
  `sample <id>`, `minigame <id> [skipped]`, and the warning `TWO: shader compiled mid-game in <scene> step <n> (<cam>)`
  (something wasn't warmed at boot: run without `fast=1` too).
- **Set inspection** (for set builders): `?setview=<setId>&env=<preset>` boots straight into that set (no scene, no UI,
  no letterbox, no warm-up of anything else, fixed pixel ratio) and exposes `TWO_TEST.views()` →
  `[{ kind: 'cam' | 'anchor', name }]` for every cam and anchor, `await TWO_TEST.view(kind, name)` (a cam is shown as a
  `{ shot: 'SET' }` with its fixed/pan/rail base framing, an anchor as an `{ shot: 'INSERT' }`: from → at with its fov;
  renders two frames, resolves `{ calls, tris, textures, geometries }`), `TWO_TEST.envs()` → preset names,
  `await TWO_TEST.setEnv(name)`. The tool:
  `node tools/setshots.mjs --file out/<you>.html --set parade [--env day] [--only name,name] [--dir out/shots-parade]
  [--w 1280 --h 720]` writes one PNG per view (`cam-<name>.png`, `anchor-<name>.png`), prints a table of
  calls/tris/textures/geometries per view, flags every view over **300 draw calls**, and exits 1 on any console error.
  Build with your set file in `--mine` first. Read the PNGs.
- **Engine test**: `node tools/run.mjs --file out/<you>.html --q "autoplay=1&fast=1&speed=8&scene=DEV&stop=DEV"` (and
  without `fast=1`, with `--shots`) runs `src/89-content-devtest.js`, which exercises every TWO engine API (§5) on the
  store set; `scene=DEV_LINEUP&stop=DEV_LINEUP` lines up every look with its id for a screenshot.
- **Boot warm-up** (`99-main.js`): audio, every `SETS` entry, every `LOOKS` entry (one rig each, its portrait baked;
  `LOOKS[id].warm = n` pre-builds `n` rigs for a look seen twice at once, and `world.spawn` takes them from the pool),
  and every drone model, from the first hook that exists: `DRONES.warm(warmObject)` (systems builds its own pool and
  passes each model to `warmObject(obj3d)`), else `DRONE_MODELS` (`kind → () => Object3D`), else `buildDrone(kind)` for
  each of `DRONE_KINDS` (default `courtesy guardian popup cleaning noise fun`).

## 2. File map and ownership

One owner per file at a time. Never edit a file you weren't assigned unless your task says so; if you need something
from another file, use its documented API, or add a clearly marked minimal hook and say so in your report.

| File | Contents |
| --- | --- |
| `00-head.html` | DOM skeleton, all CSS, import map |
| `01-config.js` | `CONFIG`, registries, `CHARACTERS` (speakers + voice blips), `SAMPLES`, `SCENE_ORDER`, `ACTS`, state, options, profile, `TEST` |
| `02-core.js` | renderer, bus, clock, input (incl. CHIP), saves, perf |
| `03-audio.js` | AUDIO engine, every SFX recipe, voice blips, music cues, the songs ("two", Pudding 1987, hold music) |
| `04-art.js` | textures/materials/Builder, `buildCharacter`, all `LOOKS`, all `ANIMS`, drone model builders |
| `10-…29-set-*.js` | one set per file (see §4) |
| `30-world.js` | world, actors, player, cam, split screen |
| `31-ui.js` | ui, dialogue, pop-ups (JARVIS + SafeSense), HUD, objective, portraits, menus, built-in CARDS |
| `32-flow.js` | scene flow, cutscene step runner, hotspots, inventory, mini-game host, roam |
| `33-systems.js` | TWO systems: drones + stealth + Safe Room, Chip View + AR + Signal, samples/lures, two-person switches, AI helpers |
| `40-…59-mg-*.js` | one mini-game (or a small family) per file |
| `60-…89-content-*.js` | scenes + cutscenes + their CARDS/helpers, grouped by act (see §6) |
| `99-main.js` | boot, loader, loop |

## 3. IDs (use exactly these)

### 3.1 Characters — speaker ids (`say(id, …)`) and actor ids (`world.spawn(id, …)`)

A speaker id is a key of `CHARACTERS` (name label + voice blip). Most speakers are also actors with the same id and a
`LOOKS` entry. `CHARACTERS[id].actor` maps a speaker to a different actor (expressions/acts go to that actor).

| Speaker id | Label | Actor / look | Voice (spec §4) |
| --- | --- | --- | --- |
| `luka` | LUKA | `luka` (2026; Santa hat+beard attachment from 2.1) | square 110 Hz 0.045 s |
| `chase` | CHASE | `chase` (2026; CHASE lanyard, one earbud; headphones from L12) | triangle 260 Hz 0.035 s tumble |
| `chase40` | CHASE (2040) | `chase40` (trench coat, headphones round neck, chip light, burned right hand) | triangle 200 Hz 0.055 s soft, lowpass |
| `figure` | FIGURE | actor `chase40`, silhouette portrait (1.2 only) | as chase40 |
| `voice` | VOICE | actor `chase40`, silhouette portrait (1.2, down the line) | as chase40 |
| `manager` | THE MANAGER | actor `luka40` (hooded, filtered), silhouette portrait | sawtooth 95 Hz 0.06 s lowpass 900 |
| `luka40` | LUKA (2040) | `luka40` (hood down) | square 100 Hz 0.055 s soft |
| `jordan` | JORDAN | `jordan` (2026) | triangle 230 Hz |
| `jordan40` | JORDAN | `jordan40` (MANAGER lanyard, chip light) | sine 225 Hz soft |
| `luke` | LUKE | `luke` (2026, mug) | square 160 Hz |
| `luke40` | LUKE | `luke40` (apron KISS THE COOK (SAFELY), tongs) | square 150 Hz |
| `rue` | RUE | `rue` (72; 2.4 ONLY) | sine 130 Hz 0.07 s soft |
| `des` | DES | the kettle (no actor) | sine 300 Hz 0.03 s pure |
| `teddy` | TEDDY | `teddy` | sine 120 Hz slow |
| `mia` | MIA | `mia` | triangle 270 Hz |
| `nadia` | NADIA | `nadia` | triangle 225 Hz |
| `jayden` | JAYDEN | `jayden` | square 125 Hz lowpass |
| `drone` | DRONE | drones (no rig) | square 420 Hz mono filtered |
| `safesense` | SAFESENSE | none | triangle 350 Hz chirpy |
| `operator` | OPERATOR | none | square 330 Hz mono filtered |
| `margaret` | MARGARET | none (voice only, PC) | sine 220 Hz soft |
| `voicemail` | LUKA'S VOICEMAIL | none | Luka's blip through a phone band |
| `hr`, `desk`, `passenger`, `lifeguard`, `hovercar`, `door_drone`, `train`, `voice1`, `voice2` | HR, DESK, PASSENGER, LIFEGUARD DRONE, HOVER-CAR, DOOR DRONE, TRAIN ANNOUNCEMENT, VOICE 1, VOICE 2 | generic | generic blips |

Extras (look ids, spawned by sets or content): `cust26_a…`, `local40_a…`, `staff_a…` (HQ antlers), `whisper_a…`,
`passenger_a…`, `priya` and other gift recipients in 3.1.

### 3.2 Sets (`SETS[id]`, one file each)

| File | id | Used by |
| --- | --- | --- |
| `10-set-reddy26.js` | `reddy26` | 1.1, 1.2, 1.3, PC, A1/B1 home, A2/B1 montage frames, A1 split right half |
| `11-set-reddy40.js` | `reddy40` | 1.3 split right half, 1.4, 1.5, 1.6, title screen (dusk), B1 montage 2040 frame |
| `12-set-parade.js` | `parade` | 1.7, 2.2 (Bee Gees Way), 2.3 (Woody Point bench), B2 |
| `13-set-flat.js` | `flat` | 1.8, 2.1 |
| `14-set-rue-house.js` | `rue_house` | 2.4 |
| `15-set-bridge.js` | `bridge` | 2.5 (checkpoint, bridge deck, mangroves) |
| `16-set-sandgate.js` | `sandgate` | 2.6 |
| `17-set-train.js` | `train` | 2.7 |
| `18-set-valley.js` | `valley` | 2.8, 2.9, 2.10 (mall, Chinatown, Ann St, the Starlight) |
| `19-set-hq-atrium.js` | `hq_atrium` | 3.1 |
| `20-set-hq-floors.js` | `hq_floors` | 3.2 (L12, L21, L30) |
| `21-set-hq-top.js` | `hq_top` | P, 3.3–3.6 |
| `22-set-hq-roof.js` | `hq_roof` | 3.2 roof, 3.7, A1, B1 |
| `23-set-foreshore26.js` | `foreshore26` | A2 |
| `24-set-safe-room.js` | `safe_room` | optional: `safeRoom()` in 33-systems draws its own padded room and Quiet Corner (§5.7), so the fail state needs no set; built per `docs/sets/safe_room.md` it is a standalone set only |

### 3.3 Scenes

`SCENE_ORDER = ['P','1.1',…,'1.8','2.1',…,'2.10','3.1',…,'3.7','A1','A2','B1','B2','C','PC']`. After `3.7` the flow
branches on `state.choice` (`'A'` → A1, A2, C, PC; `'B'` → B1, B2, C, PC); a scene may define `next(state) → id`.
Act cards before `1.1`, `2.1`, `3.1`.

### 3.4 Samples (`SAMPLES[id]`, spec §13.6)

`alarm` Display alarm · `radio` Store radio (fallback) · `kettle` Kettle ("Tea?") · `chip` Chip chime · `hover` Hover hum ·
`bay` Bay · `piano` Piano · `cicadas` Cicadas · `brick` Brick phone trill · `boom` Boom gate · `whir` Drone whir ·
`laugh` Luka (laughing) · `sizzle` Sizzle · `train` Train chime · `uke` Ukulele.
Each: `{ label, sfx, where, lure: { r, dur } }` (`where` is the credits line, e.g. 'Ted Smout Bridge, 25 km/h').

### 3.5 Items (`ITEMS[id]`, spec §13.2)

`remote` · `invite` · `brick_phone` · `nadia_lanyard` · `tether` · `headphones` · `santa` · `coaster` · `lanyard40`.

### 3.6 Mini-games (`MINIGAMES[id]`)

| id | spec | file |
| --- | --- | --- |
| `polish` | 9.1 | `40-mg-polish.js` |
| `stall` | 9.2 | `41-mg-stall.js` |
| `wiring` | 9.3 (1.3 halves, L21 kettle cord) | `42-mg-wiring.js` |
| `chip_sale` | 9.4 | `43-mg-chip-sale.js` |
| `piano` | 9.6 | `44-mg-piano.js` |
| `roleplay`, `reason_cards` | 9.7 | `45-mg-teddy.js` |
| `scooter` | 9.8 | `46-mg-scooter.js` |
| `sizzle` | 9.9 | `47-mg-sizzle.js` |
| `sequencer` | 9.10 | `48-mg-sequencer.js` |
| `blend_in`, `secret_santa` | 9.11 + 3.1 | `49-mg-blend-in.js` |
| `hack` | 9.12 | `50-mg-hack.js` |
| `boss` | §10 | `51-mg-boss.js` |
| `hold_no`, `choice` | 3.6, 3.7 | `52-mg-hold.js` |
| `credits` | C | `53-mg-credits.js` |

Drone stealth, Chip View, lures, roller door / brass plate strength holds, two-person switches, the train carriage and
the Starlight sneak are **roam** gameplay built from `33-systems.js`, not mini-games.

### 3.7 Music cues (`music(id)`, spec §15.1)

`radio` (1.1 store radio, 80s-rock Christmas pastiche) · `tense` (1.3 bouncy synth under alarms) · `store40` ·
`seaside` · `stealth` · `checkpoint` · `scooter` · `sizzle` · `quiet` · `pads` (2.1 "two" motif, pads only) ·
`boss` (two verse+chorus, never the bridge) · `manager` (G5–E5–C5 motif) · `hold` (Pudding as thin chiptune hold music) ·
`pudding` (1987 song) · `walkman` (Pudding through a tiny speaker) · `uke` (Mia's whisper-volume Pudding) ·
`choir` (40 dB hum) · `lift` (muzak Pudding) · `hq` (sterile synth) · `lullaby` (A1: two bridge slowed) ·
`lofi` (B1: stripped two) · `two` (full song from `state.pattern`) · `credits`.

### 3.8 Flags

Lower-case, prefixed by scene: `s11_polished`, `s13_wired`, `s25_laugh` … Story-wide flags without a prefix:
`santa` (Luka wears the disguise), `chip_off` (Chase (2040)'s chip forced off), `headphones` (Chase wears them),
`hurt` (Chase's torn polo and blood), `bandaged`, `lanyard_snapped`, `tut_swap` (the SWAP prompt has been shown). The
rigs re-dress from `state.flags` and `state.inventory` (`tether`, `nadia_lanyard`) every time an actor is spawned.

## 4. Sets

Follow Rue's `SETS.reddy` style (`docs/engine/04-world.md`): one Builder of vertex-coloured merged geometry per
material, painted canvas textures 128–256 px with nearest filtering, `InstancedMesh` for every repeat, colliders,
named props for anything content animates, `marks` for actor spots, `anchors` for INSERT/close-up lenses, fixed
gameplay `cams` + `zones` that tile every walkable area, `env` presets, `ambience`, `update(dt, ctx)` (`ctx = { t, player, running, env, props }`) with **no
allocation**. Every set's header comment documents its layout (metres, axes) and lists marks/anchors/cams/props. Content
may also use raw coordinates. Look: low-poly PS1, **clean — no vertex snapping, no wobble, no affine warping**.
Palettes in spec §14. Under 300 draw calls.

## 5. TWO-specific engine APIs (implemented: this section is the reference everyone codes against)

Every call below is safe while `flow.skipping` (it finishes at once, or drops what is only cosmetic) and has an
autoplay path. **`src/89-content-devtest.js`** (scene `DEV`: `?autoplay=1&scene=DEV&stop=DEV`; `DEV_LINEUP` lines up
every look) exercises all of it: read it for working examples. Rue's APIs (`docs/engine/*.md`) still apply unless
changed here.

### 5.1 Speakers, dialogue, barks

- `CHARACTERS[id] = { name, voice, actor?, silhouette?, duo? }` (§3.1). `say('manager', …)` animates actor `luka40`;
  `speakerActor(id)` → the actor id. `duo: ['chase', 'chase40']` (speaker `chases`): both mouths, a split portrait, both
  blips. Voice fields: `wave f len gap filter soft tumble mono pure ring band hiss`.
- Line steps: `{ say: id, text, tag, expr, act, speed, auto, name, portrait: false, censor }`. `tag` is the small italic
  tag after the name: `off`, `whisper`, `muffled`, `quietly`, `down the line`, `on the PA`, `filtered`, `gruff`,
  `together`, …
- `ui.nameGlitch(fromId, toId)`, step `{ nameGlitch: [from, to] }`: the label and portrait glitch for a frame or two;
  later `say(toId)` lines carry the new name (3.3: `['manager', 'luka40']`).
- `bark(id, text, o = {}) → Promise`: a non-blocking corner line with a portrait over gameplay, queued in order.
  `o: { name, tag, portrait: false, speed: 'slow' | 'normal' | 'fast', hold (s after typing), now (drop the queue) }`.
  Never takes YES, never ducks music, never makes `say.busy()` true. `bark.clear()`, `bark.busy()`. Step
  `{ bark: id, text, tag?, wait?: true | secs }` (not awaited unless `wait`). A skip, a scene change or `flow:stop`
  drops every bark.

### 5.2 Pop-ups

`popup(spec) → { el, done: Promise<button index | -1>, close(), progress(pct), setMsg(text), moon(on) }`. spec:
`style: 'jarvis'` (default, 2026) `| 'safesense'` (2040: rounded translucent glass, blue glow, pill buttons, two-note
chirp), `msg`, `title`, `icon: 'warn' | 'error' | 'info' | 'none'`, `buttons = ['OK']`, `at: 'center' | [x, y]` (0..1)
`| { actor } | { pos: [x, y, z] }` (pinned to a world point, hidden behind the camera), `w`, `dur`, `spinner`,
`progress: { from, to, dur }`, `dodge`, `cls`, `shake`, `ding: false`, `z`, `emptySlot` (the dashed empty space where
NO should be), `note` (small text under the message), `moon` (the Do Not Disturb moon). `popup.clear()`,
`popup.count()`, `popup.prewarm(n)`. Step `{ popup: spec, wait: true }` → `flow.result` = the index. Autoplay presses
the first button after 0.3 s.

### 5.3 HUD, time cards, UI bits

- HUD (top-right pill: NO SERVICE, or "Optus" with bars · QUIET IN · Samples): `hud.set({ noService, quiet:
  'hh:mm:ss' | seconds, samples: true (the live count) | n | false, bars: 0..4 | null, hack } | null)` (null hides it
  all and clears those fields); `hud.quiet(str | seconds | null)`; `hud.samples(n | true | false)`; `hud.bars(n)`;
  `hud.noService(on)`; `hud.hack(pct 0..100 | null, { stalled, back })` (the big centre-top HACK bar; writes
  `state.hack`); `hud.animate({ bars, hack }, dur) → Promise` (whole steps); `hud.show()`, `hud.hide()`,
  `hud.refresh()`. The model is `state.noService`, `state.quiet`, `state.bars`, `state.hack` and `state.hud = { samples,
  hack }`. Steps: `{ hud: {…} | null, anim }`, `{ quiet: 'hh:mm:ss' | null }` (applied when skipping too).
- Time cards: scene `time` + `place` → `ui.timeCard(time, place, dur = 3)` at scene start (after an act card), not
  awaited, unless the scene says `timeCard: false`. Step `{ timeCard: 'Thursday 24 December 2026, 18:58', place?,
  wait? }`. It sits low left and moves above the dialogue box while someone talks.
- `ui.title(text, dur, { logo })` (the text `'two'` shows the logo), `ui.flash(dur, color)` (Reduce Flashing: a slow
  dim bloom), `ui.chipView(on)`, `ui.signal(v 0..1 | null)`, `ui.meter(label | null, v)`, `ui.sampleCard(id)`,
  `ui.prompt('SWAP — Tab')` (pills for YES/NO/SWAP/CHIP/HOLD). New cards: `person`, `take`, `discography`,
  `buglist40`; every card paints at 2× (helpers: `CARDS._kit`).

### 5.4 Flow: scenes, steps, the party, samples, endings

- Scene fields add `time`, `place`, `timeCard: false`, `follow: true | id | [ids]` (start with followers), `next: id |
  (state) => id`, `branch: 'A' | 'B'`; `grants` also takes `hack`, `choice`, `quiet`, `noService`, `removeItems` and
  `state: {…}`.
- Scene steps add `['playable', ids]` (who SWAP cycles mid-scene) and `['follow', true | id | [ids] | null]`.
- Cutscene steps add `{ bark }`, `{ nameGlitch }`, `{ timeCard }`, `{ quiet }` and `{ slowmo: 0.3, dur: 1.5 }` (slow
  motion for `dur` on-screen seconds, not awaited; `wait`s inside it are game time, so `{ wait: 0.5 }` lasts 1.7 s at
  0.3; it ends with the cutscene; nothing while skipping). `flow.slowmo` is the factor.
- SWAP: `playable` may list three ids; SWAP (Tab / Y / the SWAP button) cycles them in order, skipping anyone not on
  this set, and `emit('swap', id)`. `flow.follow` is null, an id or a list: the non-active playables follow (the one you
  leave takes the new one's place). `flow.swapNext()` (code, autoplay) → the new id or null; `flow.setFollow(x)`;
  `flow.holdPos(id, on = true)` (leaves the follow list); `player.wait(id, on = true)` (stays in the party but holds
  its spot: "Hold this"); `player.waiting(id)`; `player.follower(id | [ids] | null)`; `player.followers`.
- Samples: a hotspot `{ sample: 'kettle' }` records when `state.active === 'chase'`: hold YES `CONFIG.record` (1 s; a
  press with `options.holdToPress`), the take card shows, `flow.learnSample(id)` (also callable from code),
  `emit('sample:add', id)`. `hotspots.trigger(id)` records too (autoplay). `state.samples` keeps the order. A kettle
  hotspot with `des: true` has DES say "Tea?" first.
- Endings: after 3.7 the flow goes to A1 / B1 by `state.choice` (else `&ending`, else A); A2 / B2 → C;
  `profile.endingsSeen[A | B]` is set (and saved) when A1 / B1 starts; `emit('ending', 'A' | 'B')`.
- Mini-games: `api.fail()` counts a failure (a `{ failed }` result counts once); after two in a scene `flow.skipOffer`
  turns on and Pause → "Skip this mini-game" calls `flow.skipMinigame()` (finishes `{ skipped: true,
  ...m.skipResult }`; never for `noSkip`). `flow.minigameId`.
- Events: `flow:stop` (every scene change and quit: systems clear themselves), `scene:end`, `swap`, `sample:add`,
  `ending`, `minigame:skipoffer`, `signal:full`, `stealth:capture`, `stealth:retry`, `stealth:checkpoint`, `lure`,
  `chip:view`, `saferoom`.
- Input: CHIP is an action (Q / LB / the CHIP touch button, shown only while Chase (2040) can use it):
  `input.pressed('chip')`, `input.held('chip')`. Every hold-to-confirm reads `input.holding(a)` (with
  `options.holdToPress` a press latches until `input.unlatch(a)`, NO, or 5 s).

### 5.5 World and camera

- Shots, `cam.shot(step)` (names case-insensitive, spaces = hyphens: `'crash zoom'`, `'top-down'`): ECU CLOSE MID WIDE
  TWO THREE TOP INSERT JARVIS POV CAM SET, plus LOW HIGH OTS LOCKED and the moves PUSH PULL TRACK PAN TILT CRANE ORBIT
  WHIP CRASH, framed at `size` (default MID). TWO's options: `half: 'right'` (the right half of a split), `roll: deg`
  (180 = upside down), `shake: amp | { amp, dur }` (also `cam.shake(amp = 0.04, dur = 0.45)`; none by default); OTS
  `over: id` / `from: id` / `on: [subject, shoulder]`, `shoulder: 'left' | 'right'`, `angle: 'low' | 'high'`; CRASH
  `zoom: fov` (the lens it punches to; `fov` is the starting lens); ORBIT `spin: true` (keeps turning after `dur`;
  with `ease: 'in'` it speeds up: the idea engine); CRANE `dir: 'down'` (from 2 m above down to the framing; numeric
  `from` / `to` = metres of rise); JARVIS `on` optional; WHIP blurs for 0.2 s (`world.whipBlur` px, 0 = off). Framing
  never leaves the lens inside or behind a wall (`userData.noOcclude` lets rays through a mesh); narrow screens keep the
  16:9 horizontal field (`world.fitNarrow`): don't use Rue's `fit()` helper.
- `cam.override(mode, opts)`: `'follow' { dist, height, lag, fov, look }`, `'fixed' { pos, look: [x, y, z] | 'player' |
  actorId, fov, lag, lookLag }` (a mini-game may mutate the `pos` / `look` arrays in place every tick for a tracking
  camera, e.g. the boss's `bossCam`; `lag` / `lookLag` are damping time constants in seconds), `'set' { name }`, or
  `null`. `opts.ease: secs` blends from the current view into it instead of cutting (also `cam.override(null, { ease })`).
- Set cams may have `ease: true | secs`: chained corridor cameras ease (0.25 s) instead of cutting when both have it.
- Split screen: `world.split({ left: { set, shot | cam, env }, right: { set, shot | cam, env }, ratio = 0.5 }, { slide,
  dur = 0.6 })` (step `{ split: {…}, slide }`): two live sets, each half with its own moving shot (`cam.shot({ …,
  half: 'right' })` recuts the right one); `world.split(null, { slide, keep: 'left' | 'right' })` closes it (`keep:
  'right'` makes the right set current, shot and all). `cam.project(v, 'right')`. Spawn into the right set with
  `{ spawn: id, at, set: rightSetId }`.
- Sets: `world.liveMax = 3` (the default); a set not on screen for more than two scenes is disposed when a scene
  starts; `world.prebuild(id) → Promise` builds over three frames (in a cutscene's last shot or under a fade);
  `world.prop / anchor / mark(name, setId?)`. `world.envName` = the current set's env preset name. `world.torchAuto` is
  reset to `true` whenever a set is shown (a set that parks the spot as a lamp sets it `false` again in its
  `dress` / `update`).
- Colliders are live: a set may push, splice or move boxes in its `colliders` array (or write a box's numbers in place)
  at runtime (pushed bins and racks, doors that open); collisions, drone cones and `lineClear` read them every tick.
  Splice a box out to remove it.
- Helpers: `world.actorsIn(x, z, r, out)`, `world.colliders`, `world.collide(actorOrId, x, z)`, `world.resolve(x, z, r,
  out)`, `world.lineClear(x0, z0, x1, z1, pad)`, `world.floorAt(x, z)`, `actor.moveTo(where, { collide: true })`.
- TWO's one-shot anims (`ANIM_ONE` in 04-art: `tether_throw`, `chip_ping`, `coat_throw`, `put_headphones_on`,
  `get_up_hurt`, `brush_shoulder`, `pull_cracker`, `stumble`, `bow`, `hands_halt`) play once and go back, like `nod`.
  Wardrobe: `a.rig.show(name, on)`, `a.rig.dress(state)` (automatic on spawn), `a.rig.chip('on' | 'off' | 'ping' |
  'amber' | 'red' | 'dim')`, `a.rig.badgeFlip(on)`, `a.rig.face.mark(kind, on)`, `a.rig.face.browLift(k)`.

### 5.6 Chip View, AR, the Signal (`chip`, `AR`)

- Only when `state.active === 'chase40'`, in a roam, `chip.allowed` and not forced off: hold CHIP → blue tint and
  scanlines, AR labels, the Cloud+ ads placed in view (automatic), his chip light on; `chip.signal` fills at
  `chip.rate` (1/6 per s: ~6 s; faster in `chip.hot = [{ at: [x, z] | box: [x0, z0, x1, z1], r, mul }]`) and drains at
  `chip.drainRate` on release; full → `emit('signal:full', { who: 'chase40' })` (stealth on: the drones turn to him,
  Safe Room; else `DRONES.alert`). All of it resets every scene.
- `chip.forceOff(on = true, msg)` (CHIP only shows a toast; his light goes dark), `chip.lightOn(on | null)`,
  `chip.show(on)` (the view for POV shots / cutscenes, no Signal), `chip.peek(sec = 1.5) → Promise` (autoplay's CHIP),
  `chip.reset()`.
- `AR.add({ id?, kind = 'sign', text, title?, at: where | on: actorId | prop: name, oy, w, color, size = 1, maxD }) →
  id` (`w` = the label's width in metres in the world, kept within readable limits, px when ≥ 40; `color` = CSS or
  `0xRRGGBB`; the sets' `ar` lists go straight in: `for (const a of SETS.x.ar) AR.add(a)`); kinds `sign price name code tag ad thought popup path` (`path`: `{ points | path: [[x, z] | [x, y, z], …] | the name of one of the set's `paths`, or arc: { c: [x, z], r, a0,
  a1 } (yaw radians), loop, w }`, a crawling dashed floor line; a patrolling drone's route shows as `path:<droneId>`). `AR.set(id, patch)`,
  `AR.remove(id)`, `AR.clear()`, `AR.show(true | false | null)` (null = follow Chip View). A `where` is a mark, actor,
  anchor, prop, `[x, z]` or `[x, y, z]`. Labels belong to the set they were made in.

### 5.7 Drones, stealth, the Safe Room (`DRONES`, `stealth`, `safeRoom`)

- `DRONES.spawn(id, { path: [[x, z], …], loop, speed = 1, pause = 0.5, at, face, hover = 1.55, kind = 'courtesy' |
  'guardian' | 'popup' | 'cleaning' | 'noise' | 'fun' | 'lifeguard' | 'door', cone: { len = 3.2, half = 0.42 } | false,
  sweep (deg), sweepPeriod = 5, showPath = true, ai = true }) → { id, kind, obj, x, z, yaw, st }` (3+ points loop, 2
  ping-pong, none = parked at `at` facing `face`). States `patrol` (blue) → `curious` (amber, '?') → `escort` (red;
  needs `stealth.active`) → the hug → capture. Cones are floor fans clipped by the set's live colliders and by
  `DRONES.cover(id, box | null)` boxes (`DRONES.walls = false`: cover boxes only).
- `DRONES.get(id)`, `remove(id)`, `clear()`, `all`, `reset()`, `pause(on)`, `calm()`, `alert(who)`, `turn(who)`,
  `goTo(id, at, { speed, then }) → Promise`, `face(id, where)`, `release(id)`, `light(id, state)`, `state(id)`,
  `inCone(id, who) → bool`, `claw(id, k = 1, dur = 0.4)` (the noise drone's claw, 0 closed … 1 open; the model is
  `DRONES.get(id).obj` for a prop to follow), `zap(droneId, actorId, { line }) → Promise` (1.6's static),
  `lines = { escort, laugh }`.
- `DRONES.lure(at, sampleId, { r, dur, line, over, y, disc = 0.6 }) → thenable { n, ids, done }`: drones within
  `SAMPLES[id].lure.r` (or `r`) investigate for `lure.dur` (or `dur`) and go back; they hover a metre short of it (`over`:
  right above it; `y`: at that height); while they investigate their cone collapses to a disc of radius `disc`
  (`false` keeps the cone) lying on the lure's surface when `at` is `[x, y, z]`; the laugh gets DRONE: "Excuse me!
  Someone is having too much fun!". `DRONES.lureMenu(at, { fallback, test, …lure options }) → Promise<sampleId |
  null>` (Chase picks one of `state.samples`).
- `stealth.begin({ checkpoints: [{ id, box: [x0, z0, x1, z1] | zone: camName, at: where | { luka: where, … } }],
  onCapture(who), onRetry(key), variant: 'room' | 'quiet', safeRoom: false (fade and retry), targets: [ids],
  escortAfter = 1.4, forgetAfter = 2, escortSpeed = 3.6, zoneR = 16, autoCapture })`, `stealth.end()`,
  `stealth.capture(who, o) → Promise`, `stealth.softFail(who) → Promise`, `stealth.checkpoint()`, `stealth.active /
  busy / captures`. Without checkpoints the party's positions are saved whenever the player enters a new zone. Under
  autoplay drones never go past curious unless `autoCapture`.
- `safeRoom({ variant: 'room' | 'quiet', who, onRetry }) → Promise` (13.7): drawn by 33-systems over the hidden set (no
  set load; the HUD hides): white, the padded room, DRONE "You are not in trouble. ^ You are in danger.", SafeSense
  "Would you like to try again? [YES]", retry at the checkpoint with drones reset. ~4 s plus the YES. `variant: 'quiet'`
  (3.1, Blend In) uses the current set's own Quiet Corner when it has marks `quiet_beanbag` + `quiet_drone` (and anchor
  `quiet_corner` for the shot), as `hq_atrium` does; otherwise systems draws one.

### 5.8 Holds and two-person switches

- `strengthHold({ who = 'luka', label = 'Lift', dur = 1.6, keep, at, anim, onProgress(k), onFull(), onRelease(full),
  autoHold }) → thenable { k, full, held, done, cancel() }` (resolves true when lifted): hold YES, the strain meter
  fills, letting go rewinds it, a tap or NO gives up (false); `keep`: it stays up only while held (the roller door).
  Call it from a hotspot's `do`.
- `pairSwitch({ id, ends: [{ id, at, r, stand }, { … }] (or it adopts the scene's hotspots `{ id, at, pair: id }`),
  label = 'Turn', who: [ids], hold = 0.5, keep, onDone(), onChange(n) }) → thenable { id, done, end(), auto() }`: at a
  free end YES ("Hold this") sends the nearest partner there (he stays: `player.wait`), else the player holds it and can
  SWAP away; YES at the other end does it. A hotspot with only `pair` does nothing until `pairSwitch({ id })` adopts it.
  `pairSwitch.get(id)`, `pairSwitch.clear()`.

### 5.9 Audio

- `sfx(name, { vol, rate, lp, at, pan, when, offset }) → seconds`; `music(cue, { fade, cut })`, `music.silence(on)`;
  cues in §3.7 (`music('two')` plays `state.pattern`; `'credits'` adds the 1987 coda).
- `AUDIO.song({ pattern, samples, from, to, muffled, bleed, speaker, gain, fade, coda, dest, onEnd }) → { t, duration,
  section, sectionAt(t), playing, stop(fade), ready, done }`: "two" from the sequencer pattern (sections `INTRO VERSE
  CHORUS VERSE2 BRIDGE CHORUS OUTRO`, 92 bpm, B minor → D major final chorus; `from` / `to` = section names or
  indices). `AUDIO.bakeSong(pattern) → Promise<AudioBuffer>`; `AUDIO.seq.play(pattern, samples, onStep(step, bar), {
  section, bars, muffled, speaker, gain })` (+ `.stop()`, `.section(name)`, `.playing`); `AUDIO.hit(sampleId | null,
  lane, { chord, vol })`; `AUDIO.TWO` (bpm, sections, lead, `defaultPattern(samples)`, …). Pattern: `{ lanes: [sampleId |
  null × 4], steps: [[bool × 16] × 4], lead?: [bool …], bridge: 'laugh' }` (lane 0 hats, 1 snare, 2 texture, 3 chords).
- `AUDIO.laugh(o) → seconds` (`LAUGH_CLIP` if set), `AUDIO.voicemail(text?, { vol, cps }) → { dur, clip, stop, done }`
  (`VOICEMAIL_CLIP`), `AUDIO.pudding({ loops, bars, speaker, onEnd })`, `AUDIO.note(midi, o)`, `AUDIO.playSample(id,
  o)`, `AUDIO.sampleBuffer(id)`, `AUDIO.peaks(id, n)`, `AUDIO.muffle(hz | null, dur)`, `AUDIO.ringing(on, { vol, fade
  })`, `AUDIO.warm(cues)`, `AUDIO.now()`.
- Beds: `AUDIO.loop(name, { vol, fade, rate, lp, at, bus }) → { stop(f), vol(v), rate(r), pos(x, y, z) }`; a set's
  `ambience: { rain: true | 'glass' | 'roof' | 'street' | 'heavy', loops: [name | [name, vol] | { name, vol, lp, at }],
  room }` (or `AUDIO.ambience(a)` + `AUDIO.setRoom(room)` from `dress`). Every loop name in `docs/sets/*.md` exists
  (`AUDIO.loopNames()`); some bake in the background after boot and fade in when ready. A music cue name also works as
  a loop, heard through a small speaker (`'radio'`, `'hold'`, `'walkman'`, `'uke'`, `'choir'`, `'lift'`). Rooms
  (`AUDIO.rooms`): `none room small carriage hall atrium wet lane`.

### 5.10 State, options, profile

`state = { scene, flags, inventory, active, samples, names, bugs, pattern, hack, choice, quiet, noService, battery,
bars, hud }` (Luka's disguise is `flags.santa`, §3.8); `options` add `storyMode` and `holdToPress`; `profile = {
completed, seenPrologue, endingsSeen: { A, B } }`. Saves are versioned and merged over `newState()`.

## 6. Content files (scenes + cutscenes, word for word)

| File | Scenes |
| --- | --- |
| `60-content-prologue-1-1.js` | P, 1.1 |
| `61-content-1-2-1-3.js` | 1.2, 1.3 |
| `62-content-1-4-1-6.js` | 1.4, 1.5, 1.6 |
| `63-content-1-7-1-8.js` | 1.7, 1.8 |
| `64-content-2-1-2-3.js` | 2.1, 2.2, 2.3 |
| `65-content-2-4-2-5.js` | 2.4, 2.5 |
| `66-content-2-6-2-7.js` | 2.6, 2.7 |
| `67-content-2-8-2-10.js` | 2.8, 2.9, 2.10 |
| `68-content-3-1-3-2.js` | 3.1, 3.2 |
| `69-content-3-3-3-6.js` | 3.3, 3.4, 3.5, 3.6 |
| `70-content-3-7.js` | 3.7 |
| `71-content-ending-a.js` | A1, A2 |
| `72-content-ending-b.js` | B1, B2 |
| `73-content-credits-pc.js` | C, PC |

Rules: every quoted line in section 8 appears verbatim (`^` kept as `^`); shot tags become composed, moving cutscene
cameras (letterboxed, never a static CCTV angle unless the script says "locked"); stares only where marked, 2–4 s, no
UI; Rue appears only in 2.4; Bon Jovi once; calc/cred/bics once each; no real lyrics; honest moments play straight.
Every roam has an `auto()` for autoplay; every mini-game has `autoplay()`. `grants` must give everything a player would
have after the scene (for Chapter Select).
