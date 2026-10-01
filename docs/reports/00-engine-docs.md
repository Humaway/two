# Engine documentation reports

## summaries

### 01-core
I wrote `/home/user/two/docs/engine/01-core.md` (985 lines). It covers `01-config.js`, `02-core.js`, `36-main.js` (TWO's `99-main.js`) and `00-head.html`, with `file:line` citations; citations were spot-checked against the source and nothing was run.

- **Build and DOM:** the ref-to-src rename map, the build scope rules (leaf fragments become block-scoped and load before world/ui/flow), and a frame/tick order diagram. Every DOM id and class is listed with its z-index, state classes, owning module and purpose, including the `.jv*` popup family and the `data-noyes` rule.
- **Config and state:** every `CONFIG` field with its readers, every registry's contract, the `CHARACTERS.voice` fields, `state`/`options`/`profile`, and the test hooks with what sets `TWO_TEST`.
- **Core:** the renderer, the event bus with a catalogue of all events, and the clock (`addUpdate`/`removeUpdate`/`wait`/`waitUntil`, including how they behave under pause, skip and multi-tick frames). Also input (keyboard, pointer, touch, gamepad), resize and the overlay canvas, saves, and the F2 overlay with its adaptive pixel-ratio rules.
- **Main:** the `boot()` steps, the fixed-step loop, loader jobs, `warmCharacter` and portrait baking, the mid-game shader warning, and what boot needs from the other subsystems.
- **How to extend for TWO:** adding the CHIP action, the hold-to-press and Story Mode options, ending branches in `SCENE_ORDER`, versioned and merged saves, kettle-save caveats, `&ending=A|B`, new DOM elements, and the warm-up, pixel-ratio and no-per-frame-allocation rules. It ends with 17 numbered gotchas.

The three most important gotchas:
1. **Polling loops hang the page.** `while (…) await wait(0)`, or any `wait()` loop while a cutscene is being skipped, never gives the browser a frame. Also, `waitUntil` resolves during a skip even if its condition is false. Every cutscene step has to snap its own end state when skipped.
2. **One throwing updater freezes the canvas.** There is no try/catch in `clock.step`, so any exception from an updater, a `waitUntil` check, `ui.update` or `world.update` skips the render every frame. Also, `clock.scale` is overwritten every tick by `flow.tick`, so it can't be set from anywhere else.
3. **New inputs need several edits.** The action list `A` in `02-core.js:51` is hard-coded, so CHIP needs `A`, `CONFIG.keys`, `CONFIG.pad`, a touch button and the menus' key list. Separately, any left click or tap outside buttons counts as a YES press, so drag minigames get a YES when the drag starts.

### 02-audio
I wrote `/home/user/two/docs/engine/02-audio.md` (889 lines), a reference manual for the audio engine in `ref/rue/03-audio.js`. `src/03-audio.js` is byte-identical to it, so all line citations apply to both.

**What it documents:**
- **Architecture:** the signal graph (three buses, two reverb sends, limiter) and the lifecycle (bake at boot, unlock on the first YES).
- **Public API:** every function with signatures, options and defaults. This covers `init`, `prerender`, volumes and ducking, `sfx`, `loop` and its handle, `ambience`/`setRoom`, `listener`, `blip`, `music` and `music.silence`, `song`, `seq`, `stopAll`, `sampleBuffer`, plus a who-calls-what table.
- **Sounds:** all 48 one-shot recipes, the 13 loops, the 9 baked music cues and 3 runtime cues, each with key, tempo, length, chords and melody as implemented. The synth toolkit and the generated noise textures are covered too.
- **Baking and songs:** how loops are baked and kept seamless, and the Pudding 1987 song. That includes its melody, chords and stems, how sample lanes map to recipes, the three playback modes with the credits timeline (about 61.8 s), the scheduler, and the 3.3 sequencer path.
- **Voices, the restart chime and how-tos:** voice baking, the JARVIS restart chime, and step-by-step recipes for adding a sound, loop, music cue, runtime cue or voice.
- **Constraints and TWO:** timing, performance and skip-safety rules, 16 gotchas, and a table mapping each BUILD_PROMPT / ARCHITECTURE audio requirement to the engine change it needs.

**The 3 most important gotchas:**
1. **One bad recipe silences the rest of the bake.** A recipe that throws (for example an exponential ramp to 0, or a `CHARACTERS` entry with no `voice`) aborts every later stage of `prerender()`. The boot loop only logs "boot job failed", so the game runs with no voices, loops or music.
2. **Missing names fail silently.** Nothing plays before `init()`, and nothing is queued for later. Unknown names do nothing. `music('typo')` also becomes a silent current cue that blocks asking for that cue again. The voice fallback is `V.student`, so if TWO has no `student` speaker, generic speakers will be mute.
3. **The song player is hard-wired to Rue.**
   - The lead's pitch is fixed per step position, and the lead sound must be tuned to D5.
   - Patterns are exactly 4 lanes × 16 steps, and each lane's sample is fixed.
   - `AUDIO.song` returns only `{stop}` (no `dur`), and `stop()` never calls `onEnd`.
   - The code special-cases certain cue names and scene `'3.4'`, which is the boss fight in TWO.
   - There is no public audio clock or future-scheduled sound, which the piano rhythm game will need.

   "two", the sections and the bridge feature slot need a generalised song player, and the 2.10 sequencer also needs a new pattern format. Skip handling is uneven: sound-effect steps are dropped on skip, but loop and music steps still run.

### 03-art
I wrote `/home/user/two/docs/engine/03-art.md` (1084 lines). `src/04-art.js` is byte-identical to Rue's, so every `04-art.js:N` citation holds for TWO too; nothing under `ref/` or `src/` was changed.

**What's documented:**
- **Textures and materials:** `canvasTex` and `canvasTex.yes`, plus `mat`/`matTex` with the exact cache key, every option and default.
- **Static geometry:** `bakeLight`, the `Builder` API and how `done()` merges by material, `instanced`, `blobShadow`, and `makeRain` with its uniforms and how the world drives them.
- **The rig:** the 16-bone skeleton with every dimension formula, and the object graph and draw-call costs. It also covers the private geometry helpers, the body atlas layout (including what space is free), the face canvas mapping, and head landmarks in head units.
- **Faces, hair, attachments:** all 10 expressions and every eyes/brows/mouth value, blink and talk flap, the 15 hair styles, and the full attachment and grip table, plus `hold()`.
- **`pose()`:** the step-by-step algorithm, including the 0.2 s blend.
- **LOOKS:** every field the builder reads, with defaults, and a summary of all 34 Rue looks.
- **ANIMS:** the contract and flags, all 47 built-in animations with one-line descriptions, the private IK helpers, and the animations Rue registered from content files. Those last ones are not in TWO's `src/` yet, including `hands_halt`, which TWO needs.
- **Recipes and TWO plan:** how to add a look, an attachment and an animation, and a proposed TWO cast. It also covers how to build each special item: trench coat with sway (and how to make it throwable), hood up/down, Santa hat and beard over the painted beard, headphones, gloves, burn scars, chip light, lanyards/badges and drones. It ends with the needed animations, performance rules and skip-safety.

**Three most important gotchas:**
1. **Clothes, hair and the down-hood can't be hidden.** They are baked into one skinned body mesh. Anything TWO needs to toggle or take off (the throwable trench coat, hood up/down, Santa hat and beard) has to be built as an attachment or as a second skinned mesh on the same skeleton. Adding a bone for coat sway also means changing the hard-coded offsets 48/51/54 in `pose()` (`04-art.js:993` and `1013`).
2. **Two kinds of change aren't safe when a cutscene is skipped, because skipping never runs the animation.** `rig.seated` stays on after a skipped `stand` or walk, so the actor keeps sitting; and `lanyard_on` only makes the lanyard visible partway through its pose. Content must set end states itself (`a.rig.seated = false; a.play('idle')`, `attach.lanyard.visible = true`). Rigs are also pooled, so every change content makes carries into the next scene unless it's reset.
3. **The atlas has no room for new lanyard badges.** An unknown badge name renders a blank white badge with no error. Separately, `L.gloves` leaves the thumb skin-coloured (`04-art.js:815`), and the IK helpers are private to the animation code. Badges should get their own keyed textures (no extra draw call), and the helpers should be exposed (e.g. a top-level `RIGKIT` with `arm`/`leg`/`ik`) so TWO's ~20 new animations can use them.

### 04-world
I wrote `/home/user/two/docs/engine/04-world.md` (about 1,370 lines, so over the 1,200 guide; the shot options section is the bulk). Every claim cites `file:line`, and `src/30-world.js` has the same line numbers as Rue's world file. One real engine bug turned up (gotcha 3).

- **Sets:** building, the two-set cache and disposal, boot warm-up, the fixed three-light rig, environment presets and how they lerp, auto-rain, puffs and the torch.
- **Set contract:** every field a set provides, with exact formats. It notes that the `props` list is documentation only, and that `update` is really `update(dt, ctx)`, not the `update(dt, t)` ARCHITECTURE.md says.
- **Worked example (`SETS.reddy`):** its layout, the helpers (put/box/bb/boxR/cyl/ico/quad/label/wall/part/at/seg), the label atlas, repaintable screens, `dress`/`update`, and a ready-to-copy skeleton for TWO's sets.
- **Actors and player:** spawning and rig pooling, every actor method and option, mood/habit/glanceAt/walkAnim, modern vs tank controls with the input lock across cuts, collision, and the single follower.
- **Cameras:** the gameplay camera types and overrides, then every shot kind, alias, option and move with defaults and units, plus how the framing helper avoids walls and stays inside zones. A table maps the script's shot tags to steps.
- **Also:** split screen, time-lapse, the update/render pipeline, a "How to extend for TWO" section (sets, loading budget, missing camera features, three playables, perf and skip-safety checklists) and 30 consolidated gotchas.

The 3 most important gotchas:
1. **World promises can stall a cutscene.** An interrupted `moveTo`/`play`/`face`/`env` resolves early, so code after the `await` runs anyway. These promises are ticked by `world.update`, not the clock, so a skip doesn't release them. On an actor or set that isn't on screen they hang forever.
2. **The set cache can throw away a set you just preloaded.** With the default limit of two live sets, pruning runs before the new set becomes current. During a split screen, a third set is built and then disposed immediately. TWO needs `world.liveMax = 3`, with every build (which is synchronous) hidden behind black.
3. **Shot options have traps, and split screen has a bug:**
   - `OTS` is just MID unless you pass `side:'ots:<id>'`.
   - `LOW` ignores `size`.
   - `from`/`to` mean different things per move, so POV with a numeric pan or orbit gives NaN.
   - CRASH with `fov` doesn't zoom.
   - The split screen's right half is static and needs `right.set` on every call.
   - Bug: the right-half camera's aspect stays at 1 unless the window is resized mid-split, which distorts it (about 13% at 1280×720). The fix is one line in `world.split`.

### 05-ui
I wrote `/home/user/two/docs/engine/05-ui.md` (967 lines), a reference manual for the UI layer in `ref/rue/10-ui.js`. TWO's `src/31-ui.js` has identical line numbers; only the `RUE:`/`TWO:` log prefixes differ.

It covers:
- **`ui.*`**: every member with its signature, defaults and side effects, plus how they're ordered inside `ui.update`, the opacity tween engine, card sizing, the prompt regex and the inventory panel's input state machine.
- **`say` / `choose` / `ask`**: every option, `^` beats, the typing-speed matrix, voice blips and question inflection, mouths, ducking, how YES advances, NO-held fast-forward (3× clock), `auto`, the censor, and autoplay and skip answers.
- **`popup`**: every spec option (`at` forms, `w`, `icon`, `spinner`, `progress`, `buttons`, `dur`, `dodge` for runaway buttons, `cls`, `shake`, `ding`, `z`), the `{el, done, close}` handle, pooling hazards and the input routing rules.
- **The rest**: `hud`, `objective` (string and list forms), `portraitURL`, every menu screen, and all 19 built-in `CARDS` kinds with their data fields and defaults.
- **The CSS in `00-head.html`** that the UI relies on: stacking order and state classes.
- **Cross-cutting tables**: how each UI piece behaves when skipping, under autoplay and while paused, plus a performance table.
- **"How to extend for TWO"**: concrete, line-level changes. These cover speaker-to-actor mapping and silhouettes, `nameGlitch`, barks, the SafeSense pop-up style and empty slot, world-anchored pop-ups, dismissing pop-ups in arrival order, 2× card painting, the new HUD, menus and options, and accessibility, followed by a pitfalls checklist.

The three most important gotchas:
1. **Input precedence.** While the inventory panel is open, dialogue and pop-ups stop updating, so a pending line can't finish even when skipping. While dialogue is busy, keyboard input never reaches pop-ups. When it does, it goes to the newest pop-up with buttons, and NO only presses a button labelled `'NO'` or `'Cancel'`, never during a cutscene. TWO's "dismiss in arrival order" (9.4) and its NO-based mechanics (Hold NO in 3.6, the hack bar, the boss's pop-up drones) need care for this reason.
2. **Skip-safety holes.**
   - Pop-ups with `buttons: []` never close themselves, and skipping doesn't close them either.
   - Cards shown with `ui.card` from a `do` step aren't cleared by the flow. There is no standalone `card` step; cards ride on `shot` steps.
   - `hud.set()` leaves any running `hud.animate()` promise unresolved forever.
   - A fade already running when a skip starts still plays at normal speed.
3. **Portraits and cards need TWO work.** Any speaker id that isn't baked at boot falls back to building a whole character mid-game, so map every TWO speaker to a baked look or a silhouette. Cards are painted at 1× and stretched by CSS, and the painting helpers aren't exported. Several built-in cards have Rue-specific text or pictures hard-coded. Tags also render lower-case and upright, so "on the PA" shows as "on the pa".

### 06-flow
I wrote `/home/user/two/docs/engine/06-flow.md` (1155 lines). It covers all of `11-flow.js`, and its line citations also hold for `src/32-flow.js`, which has identical line numbers.

**What it documents:**
- **Scene runner:** the exports, the context object `c`, the generation counter `G` (what it cancels and what it doesn't), the `flow` fields and methods, and the full `flow.start` sequence including autosave, act cards and the special cases for `P` and `PC`.
- **Contracts:** every scene field, all 13 scene step kinds, and the `keep` rule for letterbox continuity.
- **Cutscene steps:** the fixed key-dispatch order and all 37 step kinds, each with its options, whether it is awaited, and what happens when skipped. `move`, `stare` and `timelapse` are covered in detail.
- **Hotspots and inventory:** `busyRun`, every hotspot field (liveness, location, prompts and keys, the order actions fire in, the four text forms, `ask`, `use`, kettle, door kinds, `do`, sample recording, `trigger`), and the inventory and `ITEMS` contract.
- **Roam and mini-games:** roam in real play and under autoplay (`until` / `hint` / `auto`); the mini-game host with its lifecycle, every `api` member and Rue's patterns.
- **Saves and testing:** grants, scene select and Continue, plus a table of how each piece behaves under autoplay.
- **Cookbook (§13):** built from files 23 and 24. It covers file layout, a table mapping script shot tags to steps, `fit()`, `into()`, `tick()`, `duties()`, `cuss()`, `storm()`, how to write hotspots and examine lines, `auto()`, entering a mini-game from a held shot, dressing props from flags so Continue works, and a template for a TWO scene.
- **"How to extend for TWO" (§14):** where each change goes in `32-flow.js` (branching with `next(state)`, grants that know about the A/B branches, time cards, three playables, phone samples, mini-game skip after two failures, barks, two-person switches, Chip View, the Safe Room, cleanup on stop, the boss, the HUD). It also has the performance rules and a skip-safety checklist, and §15 lists 18 gotchas.

**The 3 most important gotchas:**
1. **`do` steps still run when a cutscene is skipped or `&fast=1` is set.** Any loop inside one that awaits `c.wait()` without checking `c.flow.skipping` freezes the page, because the wait resolves instantly. Shots, lines, sound effects and pop-ups are dropped on skip, and so are a `say` step's `expr`/`act` cues. Anything that must persist belongs in its own state step.
2. **Each step object only does one thing.** Only the first matching key is handled, in a fixed order. For example, `{ wait: 1, flag: 'x' }` waits but never sets the flag.
3. **Continue restarts the scene from step 0 with the saved flags**, including flags set after a mid-scene kettle save. Scenes must re-dress props from the flags or reset their own flags. Grants only matter for Chapter Select and `?scene=`, and they pile up in a straight line through `SCENE_ORDER`. TWO's A/B endings need grants that know about the branches, plus a `next(state)` hook.

### 07-minigames-a
I wrote `/home/user/two/docs/engine/07-minigames-a.md` (967 lines). Nothing under `ref/` or `src/` was changed.

- **Host contract:** the full `MINIGAMES` contract from `11-flow.js:406-457`, which is the same file as TWO's `src/32-flow.js`. It covers the `api` fields, when update and draw run, what `finish` clears, and how autoplay behaves under `TEST.auto`.
- **Shared patterns:** the DOM and overlay-canvas helpers, the guards every minigame uses against stale async callbacks and double input, and how clicks become YES.
- **Each of the 11 minigames** (`jarvis_sale`, `restart_ritual`, `keypad`, `buglist`, `dial`, `tether`, `wiring`, `pedal`, `pitch_cards`, `journey`, `sequencer`): params with defaults, results, side effects on `state`, phases, tuning constants, rendering, input on every device, autoplay, gotchas and line ranges.
- **Sequencer:** `state.pattern` is 4 lanes × 16 booleans, null until the minigame finishes. The doc covers the lane-to-sample table, the fixed melody pitch per step, and the four places that consume it. It also explains the `AUDIO.seq` live-array hookup, the playhead callback and the fallback clock.
- **Mapping to TWO (§9):** JARVIS Sale → Chip Sale 9.4, Restart Ritual and the pop-up bugs → Hack 9.12, Wiring → 9.3, Sequencer → 9.10, and Pedal → Piano 9.6 and Hum 9.11. Smaller reuses: Keypad for the 2.2 limiter and 2.8 Safe Box, the card table for the 2.5 reason cards, the Dial wheel for the JAYDEN letter strip, and the Pray hold for Hold NO. Each gets numbered reuse/change steps and a proposed v2 `state.pattern` that matches `02-audio.md`.
- **Pitfalls:** a TWO checklist on perf (no per-frame allocation, warm-up), skip safety and touch layouts, plus the engine changes TWO needs. Those changes are a "Skip this mini-game" option, SWAP during a minigame, and an embeddable Hack component for the boss stalls.

Top 3 gotchas:
1. **The host runs one minigame at a time and has no skip.** Calling `minigame()` from inside another, such as Hack stalls during the boss, leaves the outer one stranded. SWAP is also disabled while any minigame runs, so the Wiring halves and the Chip Sale's Chip View step need either split calls around a `roam` or an embedded component.
2. **Rue's autoplays only work at minigame start, so they can't be reused as the TWO "Skip" button as they are.** Called mid-game, `tether` leaks the alarm loops already playing and `sequencer` leaves `AUDIO.seq` running, because `end()`'s `play(false)` returns early. A minigame started from a `do` step inside a cutscene (`journey`) isn't skipped by Skip Scene, and holding NO runs it 3× faster.
3. **Input in DOM minigames needs care.**
   - A click outside the window is a YES press.
   - Engine pop-ups take input newest-first, so Rue relies on a one-tick debounce.
   - `api.finish` empties `#mg`, so DOM roots must be re-attached on every start.
   - Pedal beats and the sequencer fallback are timed in frames. TWO's Piano needs judging against the audio clock.

### 08-minigames-b
I wrote `/home/user/two/docs/engine/08-minigames-b.md` (1103 lines). It documents all seven part-B Rue mini-games plus the memory recorder hidden inside `final_yes`. These mini-game files are not in `src/`: TWO writes its own in `src/40-59-mg-*.js`, so the doc says what to copy into which file.

**What it covers:**
- **Overview and shared patterns:** a summary table of all seven games (§0), then the patterns they share (§1): cancelling async loops with a token, the `busy` flag, globals vs `api`, the overlay-canvas idiom, and a checklist of what `end()` must undo.
- **Per game (§2-§8):** `final_yes` and `snap`/`still`, `credits`, `blend_in`, `keep_up`, `rue_walk` (walks 1-3 and its custom camera rig), `role_play` and `torchlight`. Each has its id, params, what the player does, rendering, input, how it finishes, autoplay, helpers and line ranges.
- **Reuse catalogue (§9):** pieces worth lifting, such as the hold curve, the cone test, route projection, the formation steering, the battery that drains to zero exactly at the find, and the camera rig.
- **TWO mapping (§10):**
  - `final_yes` → 3.6 Hold NO and 3.7 the Choice.
  - The memory recorder → its own engine-level object.
  - `credits` → C.
  - `blend_in` → 9.11, plus the 2.9 sneak and 2.7 inspection.
  - `role_play` → 9.7 Teddy, with a reason-cards design.
  - The walks, Keep Up and Torchlight → followers for three playables, drone stealth (9.5), the scooter (9.8) and the boss camera (§10).
  - Perf rules, skip-safety and autoplay; 18 consolidated gotchas close the doc (§11).

Two gaps in the spec are flagged for the script owner: it has no MEDICAL rejection line for the reason cards, and no Teddy replies for the topics asked before "Your name".

**The 3 most important gotchas:**
1. **Memory stills are fragile.** `snap()` does nothing while a cutscene is being skipped (so `&fast=1` runs never take any), and stills live in memory only, so they're lost on reload, Continue or Chapter Select. Every consumer needs a painted fallback or has to re-stage the moment.
2. **Hold-to-confirm input traps (3.6/3.7).**
   - `input.held()` is never consumed.
   - A left click or finger held anywhere counts as YES and a right click as NO, except over a `<button>` or `[data-noyes]`, where it counts as nothing. DOM pill buttons therefore need their own pointer handling.
   - Holding NO inside a cutscene runs the game at 3×, so these holds must never run inside a cutscene.
   - TWO's hold must not start Rue's `hum` loop or call `music()`, or it will cut off "two".
3. **Rue leaks state and builds things mid-game.**
   - `torchlight` never restores `world.torchAuto`, and `role_play.end()` leaves the letterbox and the stage shot on.
   - `AUDIO.song` returns no `dur`, so the credits always guess their length, and they hold the last card 25 s when there is no audio context.
   - `rue_walk`'s smears (built in `start` with `compileAsync`) and `role_play`'s hats (plain meshes built on first start) are created mid-game. TWO must build such props hidden in the set's `build()` so they are compiled at boot.

### 09-content
I wrote `/home/user/two/docs/engine/09-content-patterns.md` (about 1,195 lines). I read all of content files 23–35 in full, plus the parts of the flow, world, UI, final-YES, credits and torchlight files they depend on. I spot-checked the line citations against the source.

- **Content idioms (§1–2):** how a Rue content file is laid out (named shot constants, idempotent dress functions, a cleanup watcher, grants), and the step idioms: line factories, `par` lines with pictures, awaited vs fire-and-forget `do` steps, cueing actions at a word, head glances, seated and prop-free poses, hand props, using the set's one spot as a lamp, self-removing tweens, audio and pop-up tricks, and HUD bars used as an emotional meter.
- **Shot recipes (§3, 23 of them):** the speeding-up idea-engine ORBIT (`ease: 'in'`, duration taken from the line's typing time), JARVIS-CAM (from the anchor, locked, or framed by hand), the TOP-DOWN hands-to-head (fixed `SLUMP` spot, `hands_halt`, crane-up and laugh variants), the heroic and sincere LOWs, the 80 s Lights Out push with `settlePush`/`tapeRest`, cranes as chained glides, the anchor pull-out chain, the split screen, time-lapse, same-frame dissolve, match cuts with `liveMax = 3`, letterbox handling, and holding a shot into a mini-game.
- **Set pieces TWO echoes (§4), step by step:** the reverse-charge call, departure white, arrival flash, a Reduce Flashing table, Lights Out, Storage Full, Opt Us In and the final YES (including snap/restage of memory stills), Torchlight, the Three Weeks homecoming, The Tape, the epilogue title drop, credits and post-credits.
- **Cards (§5):** when a card is hidden, all 19 built-in and 16 content-defined kinds, and a table of every INSERT card by scene.
- **Helpers (§6):** every locally defined helper and why it exists, plus the `ANIMS`, `ITEMS`, colliders and grants patches content makes.
- **TWO (§7):** put the shared helpers in one engine fragment; a table mapping each TWO echo to its Rue recipe; what Rue has no pattern for; performance and skip-safety checklists.

The three gotchas most likely to bite:
1. Shot steps and their cards do nothing while skipping, but `do` steps always run. Any camera a mini-game needs must come from `into()` or `['cam','fixed',…]`, and cosmetic `do`s and `wait` loops must check `c.flow.skipping`.
2. JARVIS-CAM borrows the set's only spot and puts back only its colour, intensity and angle, not its position. Rue re-parks the light after every JARVIS shot (`winLight(true)`, 32:540). Also, a card shown with `c.ui.card` is only hidden by an explicit `c.ui.card(null)` or the next scene's start.
3. Reduce Flashing is automatic only for `{flash}` steps and white `{fade}` steps whose colour string starts with `#f`. Prop, emissive or light flashes (TWO's 1.2 BAM, lightning, the boss detonation) need an explicit `options.reduceFlashing` branch like `flashWindows` (34:295-309).

## idx

I wrote `/home/user/two/docs/ENGINE.md` (255 lines). I checked more than 25 claims across all nine manuals against `ref/rue/` and the `src/` diffs. They were almost all correct; I fixed the three errors I found directly in the manuals.

**What `ENGINE.md` contains:**
- **File map:** each `ref/rue` file → its `src/` copy → its manual. It also notes that none of TWO's own APIs exist yet (`bark`, SafeSense pop-ups, `hud.hack`, CHIP input, three-way follow, time cards, `scene.next`).
- **Index:** one paragraph per `docs/engine/*.md`, plus a "where to start" line for each kind of task.
- **Cheat sheet:** the 40 most-used forms with exact syntax and defaults. It covers scene data and scene steps, every cutscene step key, hotspots, `ITEMS`, the mini-game contract and `api`, the UI calls, the world/actor/camera/player calls, the core clock and input calls, and `sfx`/`music`/`AUDIO`. A table of shot kinds and moves follows.
- **Cross-cutting gotchas:** 21 of them, each citing the manual section it comes from.

**Corrections made:**
1. **`docs/engine/05-ui.md` line 10:** it said the only differences between `src/31-ui.js` and Rue's file were the `RUE:` log prefixes at lines 60 and 826. It now also lists `RUE_TEST` → `TWO_TEST` at lines 813-814 (the title screen's autoplay hand-off).
2. **`docs/engine/01-core.md` line 27:** the import map was cited as `00-head.html:275-277`, but it is on line 274. The text now gives line 274 for the import map and 275-277 for the module and its two imports.
3. **`docs/engine/04-world.md` line 300:** the citation `(05:1060, 1064)` had its two line numbers swapped relative to the marks it cites. It now reads `(05:1064, 1060)`: `counter_luka` is on 1064 and `car_backseat` on 1060.

**Three most important gotchas:**
1. **Skipping still runs `do` steps.** Shots, lines, sound effects, stares and pop-ups are dropped, but every `do` runs. A `while (…) await c.wait()` loop never yields during a skip and freezes the page. `waitUntil` resolves on a skip even when its condition is false.
2. **World promises ignore skips.** `moveTo`, `play`, `face` and `env` resolve early when interrupted, a skip doesn't release them, and on an actor or set that isn't on screen they never resolve. Use `{move}`/`{face}` steps instead of awaiting these inside a `do`.
3. **Nothing may be built mid-game.** Every material, texture and second same-look rig must exist at boot, and set builds are synchronous with a two-set cache that can throw away a set you just preloaded. Use `world.liveMax = 3` and build or load under black.
