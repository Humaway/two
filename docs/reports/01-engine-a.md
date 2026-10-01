# Engine A reports (core, art)

## core (src/01-config.js, src/02-core.js, src/32-flow.js, src/99-main.js, tools/setshots.mjs (new), docs/ARCHITECTURE.md §1)
I've finished config, core, flow, main and the set-inspection tool, and committed them as `1618416` (only my files: `src/01-config.js`, `src/02-core.js`, `src/32-flow.js`, `src/99-main.js`, `tools/setshots.mjs`, and ARCHITECTURE §1). All the isolated runs listed under Testing pass with no errors.

**Config (`01-config.js`)**
- **Bindings:** CHIP is Q on the keyboard and LB (button 4) on the pad. Rue's other bindings are unchanged.
- **`SCENE_ORDER`** follows ARCHITECTURE §3.3. **`ACTS`** has the exact act titles from §7.
- **`CHARACTERS`:** every speaker in §3.1, Rue-only characters removed. Each is `{ name, voice, actor?, silhouette?, duo? }`.
  - `figure`/`voice` map to actor `chase40`; `manager` maps to `luka40` with a silhouette and `voice.ring: 47`.
  - `voicemail` has `band: [300, 3400], hiss: 0.35`; Des has `pure: true`.
  - `chases` = `'CHASE AND CHASE (2040)'` uses `duo: ['chase','chase40']`, not `voice.also`. With no underscore in the id, Rue's `also` handling recurses forever. The UI work in progress already reads `duo`.
  - New helper: `speakerActor(id)`.
- **`SAMPLES`:** the 15 samples as `{ label, sfx: 'smp_'+id, where, lure: { r, dur } }`. Kettle is 3 m / 2.5 s, boom 10 m / 7 s, laugh 10 s (longest), with `where: 'Ted Smout Bridge, 25 km/h'`.
- **`ITEMS`:** the nine items with name, desc and examine; examine is a function that says the line. Content can replace examine with a card shot.
- **`BUGS_2040`:** 25 entries as `{ y, text }`. `BUGS = []`, `DOOR_BUG` and `NAMES` are kept defined so older UI code doesn't break.
- **`newState()`:** `{ scene, flags, inventory, active: 'luka', samples, names, bugs, pattern, hack: 0, choice: null, quiet: null, noService: false, battery, bars, hud: null }`.
  - The Santa disguise lives in `flags.santa` (ARCHITECTURE §3.8 and the art manual), not `state.santa`.
- **Options** add `storyMode`, `holdToPress`. **Profile** adds `endingsSeen: { A, B }`.
- **`TEST`** adds `ending`, `setview` and `env`. A non-numeric `speed` now falls back to 1.

**Core (`02-core.js`)**
- **Actions:** the action list is derived from `CONFIG.keys` and `CONFIG.pad`, so `chip` works everywhere. A `#t-chip` touch button is picked up automatically if the page has it.
- **`input.holding(a)`** is for every hold-to-confirm mechanic. Normally it equals `held(a)`. With `options.holdToPress` on, a press keeps it held until `input.unlatch(a?)`, a NO press, or 5 s.
- **Saves:** stored as `{ v: 1, state, options, profile }`. A save from a newer version is ignored.
  - `loadGame()` merges the saved state over `newState()` and repairs bad arrays and flags.
  - `loadPrefs()` merges stored options and profile, `endingsSeen` key by key.
- **F2 overlay** adds textures, geometries, programs and a `(!)` marker over 300 calls.
- **Pixel ratio:** touch devices start at 1 or below. Phones can drop to 0.75; the controller raises it again when there's headroom.

**Flow (`32-flow.js`)**
- **Speaker → actor:** `say`/`expr`/`act`/`move`/`face`/`place`/`hold` fall back to `CHARACTERS[id].actor` when there's no actor with that id.
- **Swap:** cycles `playable` in order, skipping anyone not on the current set.
  - `flow.follow` can be null, one id, or a list. `['follow', true]` or a scene field `follow: true` means everyone else follows.
  - `player.follower` gets one id, or an array when there are two or more followers.
  - New: `['playable', ids]` scene step, `flow.setFollow(x)`, `flow.holdPos(id, on = true)`, `flow.swapNext()`, and an `emit('swap', id)` event.
- **Swap tutorial:** "SWAP — Tab / Y / Tap SWAP" shows as a prompt the first time swap is live in a playthrough (`flags.tut_swap`).
- **Time cards:** after any act card, `ui.timeCard(sc.time, sc.place)` runs without blocking, unless the scene sets `timeCard: false`.
- **Branching:**
  - A scene's `next(state)` (or a string) wins. Otherwise 3.7 goes to A1/B1 by `state.choice`, falling back to `&ending`, then A. A2/B2 go to C.
  - A1/B1 starting marks `profile.endingsSeen` and saves it immediately.
  - PC sets `profile.completed`, then returns to the title, or sets `TWO_TEST.done` under autoplay.
  - Grants for Chapter Select follow the target's branch. C/PC use `o.choice`, else a choice already in state, else `&ending`, else A.
  - Grants also accept `hack`, `choice`, `quiet`, `noService` and a generic `g.state`.
- **Samples:** only Chase can record. Hold YES for 1 s, or press it if hold-to-press is on. Recording calls `ui.sampleCard` (falls back to a toast), then `learnSample`, then a HUD refresh. `hotspots.trigger(id)` records too, which gives autoplay a path.
- **Kettle:** a hotspot with `des: true` has DES say "Tea?" before "Put the kettle on?".
- **Mini-game skip:** `api.fail()` and `api.fails` count failures; a `{ failed }` result counts once.
  - After two failures `flow.skipOffer` turns on and a toast points to the pause menu.
  - `flow.skipMinigame()` finishes the game with `{ skipped: true, ...skipResult }`. A game with `noSkip` never offers.
  - `flow.minigameId` exposes the running game.
- **New cutscene steps:** `{bark, text, wait?}`, `{nameGlitch: [from, to]}`, `{timeCard, place?, wait?}` and `{quiet}` (which also sets `state.quiet`). All are guarded and skip-safe.
- **Stares:** capped at 4 s, with the HUD, objective, swap indicator, prompt, toast, hack bar, bark box, sample card, time card and signal meter hidden.
- **Also new:** `emit('flow:stop')`, `emit('sample:add')`, `emit('ending')`, and `c.bark` in the step context.
- I also fixed an old Rue bug where the "Recording…" prompt stayed on screen after a take.

**Main (`99-main.js`)**
- **Loader:** "JARVIS is loading your game." with a bar that slips back a few percent now and then, purely cosmetic (seen in one probe going 23→20→19→16%). Then "JARVIS is ready." [YES].
- **Start:** the prologue on first launch, then the title. Under autoplay it starts at `TEST.scene` and passes the `&ending` choice.
- **Warm-up:**
  - **Sets:** every set is warmed.
  - **Characters:** every look is warmed, and `LOOKS[id].warm = n` pre-builds n rigs. The world's existing pool already hands them out.
  - **Drones:** warmed from the first hook that exists: `DRONES.warm(warmObject)`, then `DRONE_MODELS`, then `buildDrone(kind)` for each of `DRONE_KINDS`.
- **`?setview=<set>&env=<preset>`:** boots straight into one set with no scene, UI, letterbox or other warm-up. It exposes:
  - `TWO_TEST.views()`
  - `await TWO_TEST.view(kind, name)` → `{ calls, tris, textures, geometries }`. Cams are shown as a SET shot, anchors as an INSERT.
  - `TWO_TEST.envs()`
  - `await TWO_TEST.setEnv(name)`
- **`tools/setshots.mjs`:** `--file --set [--env] [--only a,b] [--dir] [--w --h]` writes `<kind>-<name>.png` per view and prints a calls/tris table. It flags views over 300 calls and exits 1 on any console error. It's documented in ARCHITECTURE §1.

**Testing**
- I ran a throwaway dev scene (now deleted) under autoplay with `fast=1` and in real time, with screenshots. It covered every API above.
- I ran the branch chain with `&scene=3.6&ending=B` (3.7 → B1 → B2 → C → PC), Chapter Select into C with `&ending=B`, and into A2 and PC.
- A keyboard-driven real-play probe checked the swap tutorial prompt, Tab cycling through all three, the 1 s record hold and the F2 overlay. The stare measured exactly 4.0 s.
- `setshots` on the reddy set covered 66 views, all under 60 calls, and I looked at the PNGs. A missing set exits 1.
- An integration run with the UI engineer's uncommitted head and UI files showed the time card and bark working. A full build of everyone's working tree currently fails at boot inside the art engineer's unfinished `buildCharacter`, not in my code.

**What other engineers need to know**
- **World:**
  - `player.follower` must accept an array. Until it does, a list just results in no follower.
  - The title screen still loads Rue's office set, which doesn't exist in TWO.
- **UI:**
  - The prompt-pill regex needs `SWAP` added.
  - `ui.timeCard`, `ui.sampleCard`, `ui.nameGlitch`, `bark` and `hud.quiet`/`hud.refresh`/`hud.show` are all called only if they exist.
- **Systems:** should consume CHIP outside free play and listen for `flow:stop`.
- **Audio:** needs to implement the `smp_*` recipes and the voice fields `ring`, `band`, `hiss` and `pure`.
- **Content:**
  - The Choice must set `state.choice`.
  - Scenes need `time`/`place`.
  - Item examine lines other than the tether and the headphones are my placeholders, and content can replace them.

## art (src/04-art.js)
I've finished the art layer in `src/04-art.js` and committed it in two commits: 284e2e4, then 8485d50, which renames my shared helpers so they can't collide with other files' names. The headless test passes with 0 errors, and no shaders compile mid-game. Two things need the world owner (`30-world.js`): the one-shot hook below, and a pool-reset note.

**Hook request for `30-world.js` (one line):** make its one-shot table read mine:
`const ONE = { nod: 0.9, …, stand: 1, ...(typeof ANIM_ONE !== 'undefined' ? ANIM_ONE : {}) };`
Until then, play the new one-shots with `a.play(name, { dur, loop: false })`, or they hold their last frame.

**Characters (`LOOKS`, 49 entries)**
- **Heroes:** `luka` (faded lanyard, LUKA badge with "1158" in biro on the back), `chase` (bright lanyard, worn), `chase40` (removable trench coat with sway, shaggy greying hair, greying stubble, chip light behind the right ear, scorched "CHASE / SENIOR CASUAL" badge, scarred right hand), `luka40` (long dark coat with high collar, hood, gloves, close grey beard, jaw scar, paler flipped badge showing 1158).
- **Supporting:** `jordan`, `jordan40` (store-manager badge, chip), `luke` (mug), `luke40` (KISS THE COOK (SAFELY) apron, tongs), `rue`, `teddy`, `mia`, `nadia`, `jayden`, `hr`, `desk`, `passenger`, `priya`.
- **Extras:** `cust26_a–d`, `local40_a–f`, `staff_a–f` (antlers, some in goggles), `whisper_a–f`, `passenger_a–d`, `sizzle_a–e`, `kid40`. The set specs asked for `whisper_e/f` and `sizzle_a–e`, so I added them.
- Rue-only looks are gone. Unknown ids fall back to `cust26_a`, and Rue's `customer_a–d` map to `cust26_a–d`.
- I checked a lineup, close-ups and the baked portraits of all 49 in screenshots; they read clearly at PS1 resolution.

**Wardrobe API (on `a.rig`)**
- `show(name, on = true)` toggles any attachment, or a group: `'santa'`, `'hood'` (up hides the ponytail), `'hurt'` (torn polo plus blood at the hairline), `'chip'`, `'goggles'`, `'goggles_up'`.
- `dress(state)` resets the look and applies story state. It runs by itself every time an actor is spawned into a set, so reused rigs never carry over a previous scene's toggles. It reads flags `santa`, `headphones`, `chip_off`, `hurt`, `bandaged`, `lanyard_snapped` and inventory `tether`, `nadia_lanyard`. `hurt`, `bandaged` and `lanyard_snapped` are names I made up, so content writers need to know to set them.
- `chip('on'|'off'|'ping'|'amber'|'red'|'dim')`, `badgeFlip(on, which)`, `face.mark('blood'|'soot'|'bruise'|'graze', on)`, `face.browLift(0..1)` (Luke's suspicious eyebrow).
- Santa beard: `attach.santa_beard.userData.state('on'|'slip'|'chin'|'eyes'|'ear')`.
- New expressions: happy, hurt, suspicious, tired, sheepish, scared, tearful, fond, still, hum, wince.
- Main attachment names: `santa`, `santa_beard`, `coat`, `collar_up`, `gloves`, `hood_up`, `hood_down`, `ponytail`, `headphones_head`, `headphones_neck`, `headphones_held`, `earbud`, `chip_light`, `antlers`, `goggles`, `torn`, `bandage`, `lanyard`, `lanyard2` (Nadia's), `tether`, `tether_pocket`, `slate`, `remote`, `brick`, `brick_pocket`, `phone`, `mug`, `tongs`, `ukulele`, `coaster`, `notepad`, `biro`, `food`, `cracker`, `box`. Full list is in the file.

**Animations (about 45 new)**
- **Spec list:** `polish` (`{low}` for crouched), `lift_strain` (`{h0, h1, dur}`), `climb`, `hands_rise` (`{stop}` stops halfway and comes down), `scooter_drive`, `scooter_laugh`, `scooter_pillion` (`{rec}`), `tether_throw`, `tether_yank`, `chip_ping`, `coat_throw`, `type_phone`, `hold_headphones_up`, `put_headphones_on` (`{h, z}`), `laugh_big`, `bandage`, `sit_bench`, `sit_floor_wall` (`{slump}`; upper-body anims keep the floor sit), `sleep_back`, `get_up_hurt`, `wave_arm`, `sizzle_flip`, `hum`, `pull_cracker`, `swat`, `brush_shoulder`, `piano_play`, `carry_box`, `write_note`, `eat`.
- **Extras I added:** `kneel`, `hurt_stand`, `uke`, `still`, `push`, `reach_up`, `shush`, `think`, `arms_crossed`, `hands_hips`, `gesture`, `brick_call`.
- **Ported from Rue:** `hands_halt`, `stumble`, `bop`, `fold`, `bow`, `lift_head`, `back_hand`, the `*_bare` variants.
- `RIGKIT` exposes the IK helpers for content-written anims.
- Behaviour change: `phone` now always shows the smartphone; use `brick_call` for the brick phone.

**Drones and props**
- `buildDrone(kind)` for courtesy, guardian, popup, cleaning, noise, fun, lifeguard and door. Each returns a group with `userData.setLight('patrol'|'curious'|'escort'|'yes'|'white'|'green'|'off')`, plus `setShield`, `setBeam`, `setClaw`, `brush` or `show(text)` depending on kind. `DRONE_KINDS` is exported for the core's boot warm-up.
- `DRONE_INSTANCED`: `geo`, `mat`, `lightGeo`, `lightMat`, and `make(n, {state, tint})` returning `{group, body, light, set, tint, glow, commit}` for the hangar and the roof ring.
- `PROPS[id](opts)`: des (screen shows DES / boil / tea / off / any text), kettle, brick_phone, remote, slate (screen API), neural_chip, hover_car (`{col}`), hover_scooter (seat, pillion, bars and feet positions included), hover_trolley, padded_bollard, safesense_kiosk, tether_coil, tether_line (`span(a, b)` stretches it between two points), scan_cone, hug_field, foam, santa_hat, santa_beard, headphones, ukulele, coat_thrown and the small hand props. `PROPS.parts(id)` gives the pieces for instanced repeats.

**Boot warm-up:** every look is still warmed by the existing boot code. On top of that, every drone, prop and instanced variant, plus every hidden attachment, is rendered once at boot at zero scale, so it compiles and uploads without appearing in the portraits.

**How I tested:** isolated builds (`--mine 04-art.js` plus a throwaway dev scene, since deleted), headless runs with screenshots of every section, scripted checks that the spawn-time re-dressing works, a check that my top-level names don't clash with other files, and the default `autoplay=1&fast=1&speed=8` run.

**Known gaps**
- Chase (2040)'s hand scar and Future Luka's jaw/neck scar are painted on, not toggleable, and the high collar hides most of the neck part.
- The long coats only approximate correctly when seated or lying, and the legs can poke through slightly at full running stride.
- Props share geometry across sets, so when the world drops an old set their GPU buffers are freed and re-upload on next use. That's a small upload, not a shader compile.
- Two actors of the same look on screen at once still builds a rig mid-game unless the look sets `warm: 2` (the core's existing option).
- The chip light is a small glowing dot with no glow effect.
- `docs/engine/03-art.md` is not updated.
