# TWO — Architecture and contracts

TWO is the sequel to RUE and is built on Rue's engine (see `docs/ENGINE.md` and `docs/engine/*.md`, which document
Rue's engine; TWO's `src/` started as a verbatim copy). The spec is `docs/BUILD_PROMPT.md` — **section 8 is the game;
every line of dialogue is final and word for word.** This file is the contract between everyone working on `src/`.

## 1. Build, test, deliverable

- Source lives in `src/NN-name.(html|js)` fragments. `node tools/build.mjs` concatenates them (sorted by name) into
  **`two.html`** (the deliverable: one self-contained file; the only external fetch is Three.js r186 from jsDelivr
  through the import map). Use `--out <path>` to build somewhere else (always do this when other people may be building
  at the same time: `node tools/build.mjs --out out/<you>.html`).
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
  `&scene=2.3` starts there (with that scene's grants); `&stop=2.5` ends after it; `&speed=8`; `&fast=1` runs every
  cutscene as if skipped; `&ending=A|B` picks the Choice under autoplay. `window.TWO_TEST = { ready, done, scene, step, log }`.

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
| `24-set-safe-room.js` | `safe_room` | the Safe Room fail state (13.7), credits vignettes may borrow other sets |

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
`santa` (Luka wears the disguise), `chip_off` (Chase (2040)'s chip forced off), `headphones` (Chase wears them).

## 4. Sets

Follow Rue's `SETS.reddy` style (`docs/engine/04-world.md`): one Builder of vertex-coloured merged geometry per
material, painted canvas textures 128–256 px with nearest filtering, `InstancedMesh` for every repeat, colliders,
named props for anything content animates, `marks` for actor spots, `anchors` for INSERT/close-up lenses, fixed
gameplay `cams` + `zones` that tile every walkable area, `env` presets, `ambience`, `update(dt, t)` with **no
allocation**. Every set's header comment documents its layout (metres, axes) and lists marks/anchors/cams/props. Content
may also use raw coordinates. Look: low-poly PS1, **clean — no vertex snapping, no wobble, no affine warping**.
Palettes in spec §14. Under 300 draw calls.

## 5. TWO-specific engine APIs (provided by the engine phase; everyone else codes against these)

- **Speakers**: `CHARACTERS[id] = { name, voice, actor?, silhouette? }`. `say('manager', …)` animates actor `luka40`.
  `ui.nameGlitch(fromId, toId)` — one-frame glitch swapping the visible name label (3.3 reveal).
- **Tags**: `say(id, text, { tag })` shows a small italic tag after the name: `off`, `whisper`, `muffled`, `quietly`,
  `down the line`, `on the PA`, `filtered`, `gruff`, `together`, …
- **Barks**: `bark(id, text, o) → Promise` — a non-blocking line in a corner box with portrait over gameplay (boss lines,
  scooter chase, drones in stealth). Never pauses play.
- **Pop-ups**: `popup({ style: 'safesense', msg, title?, buttons, at, w, dur, emptySlot? })` — the 2040 SafeSense look
  (rounded translucent white glass, blue glow, pill buttons, two-note chirp). `emptySlot: true` draws the empty
  button-shaped space where NO should be. Default style stays JARVIS (2026).
- **HUD** (top-right pill): `hud.set({ noService: true, quiet: '46:58:00', samples: true, bars: 0..4 })`;
  `hud.hack(pct|null)` big centre-top HACK % bar; `hud.quiet(str)` updates the countdown.
- **Time cards**: scenes have `time` (e.g. `'Tuesday 22 December 2026, 11:31'`) and `place` (`'Optus Redcliffe'`);
  the flow shows a small time card at scene start unless `timeCard: false`. Act cards come from `ACTS`.
- **Swap**: `playable` may list three ids; SWAP cycles in that order. The swap indicator shows the next one.
  `flow.follow` becomes a list: the non-active playables follow (or `hold` a position when told).
- **Chip View** (`chip.*` in 33-systems): only when the active character is `chase40` and `chip.allowed`.
  Hold CHIP (Q / LB / CHIP button) → blue tint + scanlines, `AR.*` labels become visible, `chip.signal` fills
  (≈6 s to full; `chip.rate` per scene), full → `emit('signal:full')` (drones turn to him, soft fail).
  `chip.forceOff(true)` for scenes where the chip must stay off. `AR.add({ id, at:[x,y,z], text, kind, w?, color? })`,
  `AR.remove(id)`, `AR.clear()`; kinds: `sign`, `price`, `name`, `code`, `tag`, `ad`, `path` (a floor polyline),
  `thought`. Cloud+ ads are added automatically whenever Chip View is on (spec 1.7).
- **Drones** (`DRONES.*`): `spawn(id, { at:[x,y,z], path:[[x,z],…], speed, cone:{ len, half }, kind:'courtesy'|'guardian'|'popup'|'cleaning'|'noise'|'fun', face })`,
  `get(id)`, `remove(id)`, `clear()`, `lure(at, sampleId)`, states `patrol → curious (amber) → escort (red)`,
  `stealth.begin({ checkpoints })` / `stealth.end()`; capture → `safeRoom()` (13.7) → retry at the last zone
  checkpoint with drones reset. Courtesy drones are white pods with a soft blue light (amber/red by state).
- **Samples**: hotspot `{ sample: 'kettle' }` records when `state.active === 'chase'`: hold YES 1 s, a small waveform
  card shows the take, `learnSample(id)`. `state.samples` is the collected list.
- **Holds**: `strengthHold({ who:'luka', label, dur })` strain meter (roller door, brass plate); two-person switches
  via hotspot `{ pair: 'valves', … }` + "Hold this" context action (spec §9).
- **Audio**: `music(cue, { fade, cut })`; `AUDIO.song({ pattern, from, to, muffled, bleed })` plays "two" from the
  sequencer pattern (sections INTRO VERSE CHORUS VERSE2 BRIDGE CHORUS OUTRO, 92 bpm, B minor → D major final chorus);
  `AUDIO.laugh()` (or `LAUGH_CLIP` if set), `AUDIO.voicemail()` (or `VOICEMAIL_CLIP`).
- **State**: `{ scene, flags, inventory, active, samples, pattern, hack, choice, quiet, santa, … }`;
  `profile.endingsSeen = { A, B }`; options add `storyMode`, `holdToPress`.

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
