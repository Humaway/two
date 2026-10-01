# Engine B reports (ui, audio, world, systems)

## ui (src/00-head.html, src/31-ui.js)
The UI work is finished and committed as `c0030e5` (only `src/00-head.html` and `src/31-ui.js`). Everything in the assignment is built. Both the fast and real-time runs finished with 0 errors. The one warning is "scene P is not built", which is expected with no scenes yet.

**APIs (all safe when `flow.skipping`; per-tick setters only touch the DOM when a value changes)**
- `bark(id, text, o = {}) → Promise`: a top-level function like `say`. It shows a corner box with portrait, name, tag and typed text, and handles `^` beats.
  - Lines queue in order; `o.now` drops the queue and speaks at once. Other options: `name`, `tag`, `portrait: false`, `speed`, `hold`.
  - It never takes YES, never ducks the music and never makes `say.busy()` true.
  - Skipping, a scene change or `flow:stop` resolves and drops all barks. Under autoplay the hold is at most 0.5 s.
- `popup({ style: 'safesense', msg, title, buttons, at, w, dur, emptySlot, note, moon, … })`: same pool as JARVIS; the default is still Rue's JARVIS look and ding. SafeSense plays `ss_chirp`.
  - `emptySlot` draws the dashed empty pill where NO should be. `note` is small text under the message. `moon` is the Do Not Disturb icon.
  - `at: { pos: [x, y, z] }` pins a pop-up to a world point; it hides when that point is behind the camera.
  - The handle now also has `progress(pct)`, `setMsg(text)` and `moon(on)`. `popup.prewarm(n)` builds windows ahead; boot builds 16.
- `ui.timeCard(time, place, dur = 3) → Promise`: small, low left, fades in and out, never blocks.
- `ui.nameGlitch(fromId, toId)`: label and portrait swap with a one-or-two-frame glitch, and the tag clears. Later `say(toId)` lines show the new name.
- `ui.chipView(on)`, `ui.signal(v 0..1 | null)`, `ui.meter(label, v 0..1 | null)`, `ui.sampleCard(id, o)`.
- `ui.flash(dur, color)`: with Reduce Flashing it becomes a slow, dim bloom in a muted version of the colour (works for orange too). White-out fades are slowed and greyed the same way.
- `ui.title(text, dur, o)`: `o.logo`, or the text `'two'`, shows the logo style.
- `ui.prompt` now also gives a pill to SWAP, CHIP and HOLD.
- HUD:
  - `hud.set({ noService, quiet, samples, bars, hack } | null)`; `hud.quiet(str | seconds)`; `hud.samples(n | true | false)`, where no argument shows the live count of `state.samples`.
  - `hud.bars(n)`, `hud.noService(b)`, `hud.hack(pct | null, { stalled, back })`, `hud.animate`, `hud.show()`, `hud.hide()`, `hud.refresh()`.
  - The model is your committed state fields (`state.noService`, `state.quiet`, `state.bars`, `state.hack`) plus a new `state.hud = { samples, hack }` for which parts are shown.
  - When the signal bars are above 0 the pill reads "Optus" instead of NO SERVICE.
- `portraitURL.canvas(id)`. Portraits now handle `silhouette`, `actor` aliases and `duo`, and have painted stand-ins for speakers with no body: Des the kettle, SafeSense, drones, line voices, the PA and the hover-car.
- New cards: `person`, `take`, `discography`, `buglist40`. All cards now paint at 2×. The card painters' helpers are exposed as `CARDS._kit`.

**Menus**
- **Title:** lowercase white "two" with a 2px Yes-yellow underline. It uses `reddy40` at dusk, calls `SETS.reddy40.dress('title')`, and orbits the `title_center` anchor. Without `reddy40` it falls back to `reddy26` or `reddy`.
- **Options:** Story Mode and "Hold to confirm: Hold / Press" are added. Fixed a bug where cycling an option that was undefined never changed it.
- **Chapter Select:** greys out scenes that aren't built yet.
- **Extras:**
  - Endings: shows seen or not, replay either; the branch goes into `state.choice`.
  - Jukebox: Opt Us In (Dublin ’87), "two" via `AUDIO.song({ pattern, samples, onEnd })`, and every sample.
  - Bug List 2040: two columns, still there since 2026 and new in 2040.
  - People: 12 people, then Rue's brick phone with no caption.
  - Pudding Discography and Credits (TWO's text, with the parody lines and the Cloud+ disclaimer).
- **Pause:** Resume, Inventory (only while roaming), Skip this mini-game (when `flow.skipOffer`, calls `flow.skipMinigame()`), Skip Scene, Options, Controls with CHIP, Quit to Title. CHIP is consumed while a menu is open.
- **Touch:** the CHIP button shows only while Chase (2040) is active and roaming; the UI toggles `body.chipable` itself and hides it when `chip.allowed === false`. There are separate layouts for phone landscape and portrait.

**How I tested**
- Isolated builds with `--mine 00-head.html,31-ui.js`, against your committed core.
- A throwaway `DEV_UI` scene, run with `autoplay=1&fast=1` and in real time.
- Default autoplay from the start.
- Playwright scripts in my scratchpad took stills of every menu and Extras screen, the pop-up styles, HUD, HACK bar, bark, Chip View, meter, take card, dialogue, choices, pause, flashes and cards. I checked them at 1280×720, 844×390 and 390×844 with touch on.
- The dev scene is deleted.

**Still open**
- **Not seen on real sets:**
  - The title orbit has only run on the `reddy` fallback, because `reddy40` isn't built yet.
  - `luka40` and `chase40` portraits show silhouettes until the uncommitted character art lands.
- **Audio (pending your audio changes):**
  - The title plays `title` if that cue was baked, otherwise `pads`, otherwise `store40`.
  - I use the sfx `ss_chirp` and, if they exist, `glitch` and `thunder`. The Jukebox also needs the `pudding` cue and the `smp_*` sample sounds; missing ones are silent.
- **Optional hook (sets):** if `reddy40` emits `reddy40:lightning`, the title plays thunder.
- **Full-tree build:** with everyone's working files, boot currently logs `TWO boot job failed … isObject3D` from `buildCharacter`. That is in the uncommitted `04-art.js`, not my files.

## audio (src/03-audio.js)
I've rewritten `src/03-audio.js` (the only file I changed) and committed it as `6f92700`. Booting the game still bakes as fast as Rue's original did, even though it now has about twice the content. Everything ran with 0 errors, but I can't listen to anything here, so I checked the sound with spectrograms and level measurements only; nobody has heard it yet.

**What's in it**
- **Voice blips** are read from `CHARACTERS`, so new speakers work automatically. It supports the config's new fields (`ring`, `band` + `hiss`, `pure`, `duo`, `chirp`), lets a voice be another speaker's id as a string, and falls back to a generic blip when a voice is missing.
- **Sound effects**: everything in §15.5, plus a few extras (`wall_hit`, `blast`, `claw`, `drone_ok`/`drone_red`, `chip_on`, `train_doors`, `line_click`, `manager_motif`). The Rue sounds TWO reuses (`restart_chime`, `ding`, `trill`, `alarm`, `kettle`, `kettle_click`, `clunk`, `brick_ring`) are byte-identical to Rue's.
- **The 15 samples** are named `smp_<id>`, which matches the config. Each is 2.5 s or shorter.
- **The laugh** is synthesised as voiced "ha" bursts with formants around 700/1200 Hz, falling pitch, breaths and an irregular rhythm, 2.48 s long.
- **The voicemail** uses Luka's blips through a 300–3400 Hz phone band with tape hiss. `LAUGH_CLIP` and `VOICEMAIL_CLIP` are top-level constants; I tested with generated WAVs that a filled-in clip is decoded and used everywhere.
- **Music**: all 23 cues. `title`, `manager` and `radio` bake during loading; the rest bake in the background starting at the first YES (or 3 s after loading). A cue asked for before it's ready fades in once baked.
- **"two"**: 44 bars, 1:55, sections, chords and leads as §15.3. The bridge has the laugh on bars 1 and 5, plus the whir as a pad if collected. The outro rings the D, then plays the identical restart chime. If the song isn't baked yet, `song()` plays the same arrangement live from pre-made parts straight away.
- **Ambience**: all the new loops. A set's `rain` can be `'glass'`, `'roof'`, `'street'` or `'heavy'`.

**API signatures**
- `sfx(name, { vol, rate, lp, at, pan, when, offset })` returns the length in seconds; `music(cue, { fade, cut })` and `music.silence(on)` are unchanged.
- `AUDIO.song({ pattern, samples, from, to, muffled, bleed, speaker, gain, fade, coda, dest, onEnd })` returns `{ t, duration, section, sectionAt(t), playing, stop(fade), ready, done }`.
- `AUDIO.bakeSong(pattern, { samples })` returns a `Promise<AudioBuffer>`, cached for the last two patterns.
- `music('two')` plays `state.pattern`, or a default pattern if it's null. `music('credits')` plays "two" followed by the 1987 coda.
- `AUDIO.seq.play(pattern, samples, onStep(step, bar), { section, bars, muffled, speaker, gain })`, plus `.stop()`, `.section(name)` and `.playing`. Lane and bridge edits are picked up on the next bar.
- `AUDIO.hit(sampleId|null, lane, { chord, vol })` previews one lane hit.
- `AUDIO.TWO` gives `{ bpm, step, bar, duration, lanes, sections[{ name, bars, firstBar, start, end, chords }], lead{ verse, chorus, pudding }, defaultSteps(), defaultPattern(samples), sectionAt(t) }`.
- `AUDIO.pudding({ loops, bars, speaker, onEnd })` plays the 1987 song as a handle.
- `AUDIO.laugh(o)` returns its length; `AUDIO.voicemail(text?, { vol, cps })` returns `{ dur, clip, stop, done }` and mutes the `voicemail` speaker's dialogue blips while it plays.
- `AUDIO.note(midi, o)` plays a piano note; `AUDIO.now()` returns the audio clock.
- `AUDIO.playSample(k, o)` returns the length; `AUDIO.sampleBuffer(k)`; `AUDIO.peaks(k, n)` returns `n` peak heights for the waveform card.
- `AUDIO.muffle(hz | null, dur)`, `AUDIO.ringing(on, { vol, fade })` (for 3.5), `AUDIO.warm(cues)`, `AUDIO.stats`.
- `AUDIO.loop(name, o)` also accepts a cue name, which plays it as a sound in the room through a small speaker (for example `'radio'`, `'hold'`, `'walkman'`, `'uke'`, `'choir'`). Its `o.bus` can be `'music'` or `'voice'`.

**The pattern shape for the sequencer engineer to agree:** `state.pattern = { lanes: [sampleId|null ×4], steps: [[bool×16]×4], lead?: [bool×16|×64], bridge: 'laugh' }`. Lane 0 is hats, 1 snare, 2 texture, 3 chords. Empty lanes play synth bleeps. Ukulele or piano in the chord lane play real chords; other pitched samples follow the chord's root. The `lead` mask switches verse and chorus notes off by step.

**How I tested**
- **Boot time**: loading bakes in 1.6–3.7 s here, varying with the other engineer's CPU load. Run alternately under the same load, mine took 1.8–2.3 s and Rue's 2.1–4.7 s.
- **Throwaway dev scene** (`DEV_AUDIO`), with `fast=1` and in real time with screenshots: it called every runtime API with 0 errors. The 2 warnings were deliberate unknown-name tests.
- **Default run**: `autoplay=1&fast=1&speed=8` passed.
- **Bake checks**: every buffer baked with no silence, no NaN and nothing failed.
- **Spectrograms**: they confirm the song's structure, the verse lead and the final-chorus Pudding quote note for note, every cue, and the laugh. "two" bakes in about 0.5–2 s, off the main thread.

**Interpretations and gaps**
- **Pudding melody**: I played the 16-note 1987 melody as eighth notes over two bars, as §15.3 quotes it, not in Rue's step-sequencer rhythm.
- **Final chorus**: it plays that two-bar melody twice per four-bar pass, with the tin whistle doubling it. The second pass adds a harmony a third below.
- **Removed Rue items**: Rue's 1987-only cues (`demo`, `dublin`, `dublin_major`, `buttery_radio`, `reddy_frantic`, `held_note`) and the rain-under-music hack are gone.
- **Renamed loop**: Rue's lodge-radio loop is now `transistor`.
- **Kept but on demand only**: `reddy` and `emotional` still exist, but only bake if something asks for them.
- **Rain type on weather changes**: when the weather changes, 30-world passes a plain true/false for rain, so I remember the set's rain type from its ambience. Passing `rain: e.env.rain > 0 && (a.rain || true)` from 30-world would make this exact; that's an optional one-line change in another engineer's file.
- **Not done, by design**: audio doesn't pause with the pause menu, same as Rue. `docs/engine/02-audio.md` still describes Rue's audio engine; I didn't edit it because it isn't my file.

## world (src/30-world.js)
I've rebuilt and committed `src/30-world.js` (commit `3ba5e7a`). All six parts of the assignment work in headless tests, with 0 errors and 0 warnings, including no "shader compiled mid-game" warning. I touched no other file; the dev scene `src/89-content-dev-world.js` and its throwaway test set are deleted, never committed.

The top of `30-world.js` now has a full reference block covering every option below.

**1. Party (followers)**
- `player.follower(id | [ids] | null)`: single id and null still work. Followers walk one breadcrumb trail in a loose line. The k-th one that isn't waiting stops 1.3 + 0.9·k m behind the leader.
- They step sideways out of the leader's path and keep 0.6 m apart. When the leader turns round on the trail, they join it at the nearest crumb instead of walking the whole loop.
- The player walks through his own followers, so they never block a doorway. They never cause a camera cut, because zones only follow `player.actor`.
- A follower left more than 8 m behind and off screen reappears on the trail.
- `player.wait(id, on = true)`: that follower stays put; it isn't moved, pushed aside or teleported. `player.wait(id, false)` makes it pick the trail up from where the leader went after it stopped. The hold also ends on `player.control(id)` or a despawn.
- Also: `player.waiting(id)`, `player.followers` (read-only list), `player.fol` (the first follower).

**2. Gameplay cameras and movement**
- Modern controls keep the stick direction locked across a cut until it's released. While released, they now read the direction from the camera you're actually seeing (or the one the gameplay camera is easing to).
- Tank controls, walk 1.7 m/s and run 3.4 m/s are measured exactly in tests.
- A set cam with `ease: true | secs` eases into the next cam over 0.25 s (max 0.5) instead of cutting, but only when both cams have the flag (chained corridor cameras).

**3. Shot vocabulary** (`cam.shot(step)`)
- **Names:** case-insensitive, and spaces count as hyphens, so `'crash zoom'` and `'PULL OUT'` work.
- **Kinds:** ECU, CLOSE, MID, WIDE, TWO(-SHOT), THREE(-SHOT), TOP(-DOWN), INSERT, JARVIS(-CAM), POV, CAM, SET and a new `LOCKED` (never moves, never re-aims).
- **Framed at `size` (default MID):** LOW, HIGH, OTS and the moves PUSH, PULL, TRACK, PAN, TILT, CRANE, ORBIT, WHIP, CRASH.
- **Rue's options still work:** `on at from to size dist height angle side offset facing locked fov move dur ease amount track card`.
- **New options:**
  - `half: 'right'` sends the shot to the right half of a split.
  - `roll: deg` (180 gives "Luka's view, upside down").
  - `shake: amp | {amp, dur}`, also `cam.shake(amp = 0.04, dur = 0.45)`. There is no shake by default.
  - OTS: `over: id`, or `from: id`, or `on: [subject, shoulder]`. With none of those it uses the nearest other actor. `shoulder: 'left' | 'right'`, and `angle: 'low'` for "from below".
  - CRASH: `zoom: fov` is the target lens. **This changes Rue's behaviour:** `fov` is now the starting lens and no longer cancels the zoom.
  - ORBIT: `spin: true` keeps turning after `dur` at its final speed. `ease: 'in'` plus `spin` gives the speeding-up idea-engine shot.
  - CRANE: `dir: 'down'` goes from 2 m above down to the framing.
  - JARVIS: `on` is now optional (defaults to everyone just beyond the screen), and the borrowed spot is fully restored, position included.
  - WHIP adds a 1.6 px canvas blur for about 0.2 s (`world.whipBlur`; 0 turns it off).
- **Wall-safe framing:**
  - It checks rays from the lens to the subject and from the subject back to the lens, so a lens inside a wall or above a ceiling is caught. Group shots also check every face.
  - If a framing is blocked it swings round. If no angle works, it moves in front of the nearest wall surface, accounting for thick walls. As a last resort it uses the zone's set camera.
  - Crane rises, orbit radii and pull-outs on framed shots shrink at the cut to what the room allows.
  - A mesh with `userData.noOcclude` is ignored by these checks.
  - Large set meshes get a coarse grid built when the set is built. In reddy (40k triangles) a framing now costs about 0.3–5 ms instead of up to 20 ms.
- **Narrow screens:** compositions are fitted at 16:9 and the render widens the field of view so the same horizontal view shows. Inside the 2.35:1 letterbox a portrait phone shows the identical frame. Caps are 140° for shots and 100° for gameplay; `world.fitNarrow` turns it off.

**4. Split screen**
- `world.split({ left: {set, shot|cam, env}, right: {set, shot|cam, env}, ratio = 0.5 }, { slide, dur })` opens it; `slide` makes the right half slide in.
- Both halves are live sets with their own actors and their own moving shots. `right.set` is optional once the split is open.
- `world.split(null, { slide, keep: 'left' | 'right' })` closes it. Keep left is A1 step 26 (the left half fills the frame). Keep right makes the right set the current world, keeping its shot.
- `cam.project(v, 'right')` projects through the right half.
- Rue's stretched right half (the `camR.aspect` bug) is fixed.

**5. Live sets**
- `world.liveMax` defaults to 3. A set not on screen for more than two scenes is disposed when the next scene starts.
- `world.prebuild(id)` returns a Promise and spreads the build over three frames: build, then upload, then prime. `load`, `show` and `spawn({set})` finish a pending prebuild at once, and while skipping it is instant.
- `world.prop/anchor/mark(name, setId?)` can look in a named live set, since reddy26 and reddy40 share names.

**6. Helpers for the systems engineer**
- `world.actorsIn(x, z, r, out)`, `world.colliders`, `world.collide(actorOrId, x, z)`, `world.resolve(x, z, r, out)`, `world.lineClear(x0, z0, x1, z1, pad)`, `world.floorAt(x, z)`.
- `actor.moveTo(where, { collide: true })`: an AI move that slides along walls and ends where it stalls for 0.6 s.
- Debug only: `world.liveIds`, `world.pendingIds`, `world.splitId`, `cam.cameraR`.
- The systems WIP already calls `player.wait` and `world.floorAt`, and both match.

**How I tested**
- A Playwright harness drove real key presses through a dev set: two opposite-facing zone cameras, a long corridor with three chained eased cameras, a screen, and a crate.
- Movement: the input lock holds across the 180° cut, and followers come through the doorway and corridor. The eases measured about 0.25 s. Hold and resume work, the leader walking back passes through the party, and tank, walk and run speeds were checked.
- I screenshotted every shot kind and every wall case in the dev set and in reddy.
- I ran the split with moving shots on both halves through open, keep-right close and keep-left close.
- Prebuild staging and set aging were checked through fake scene changes.
- Portrait (390×844) and landscape were compared.
- A flow cutscene using all of the above passed with `fast=1` and in real time with `--shots`.
- Allocation sampling showed the world's per-frame code allocates nothing measurable; the remaining small items are three.js internals and number boxing.
- `setshots` on reddy and the standard `autoplay=1&fast=1&speed=8` run both pass.

**Known gaps**
- Slow motion for 1.2 step 17 isn't here; the flow owns `clock.scale`.
- `track` shots aren't wall-checked (they reframe every tick with no raycasts), and explicit lenses (CAM, INSERT, POV, JARVIS, SET, or `facing: true`) are left as the author placed them.
- An orbit near walls can shrink to 20% of its radius, which gets tight.
- A set's `def.build()` is still one synchronous frame, even inside a prebuild.
- While walking the trail, followers ignore walls (the trail is the leader's own path). After a trail reset, a follower returning from a hold can cut corners.
- `lineClear` treats every collider as full height.
- Content must not use Rue's `fit()` FOV helper, or the lens gets widened twice.
- `flow.holdPos` (which takes the actor out of the follower list, so it blocks the player again) and `player.wait` (which keeps it in the party) both exist; the systems file prefers `player.wait`.
- I didn't edit `docs/engine/04-world.md` or the `docs/ENGINE.md` cheat sheet, which I don't own. They are now out of date on line numbers, the CRASH `fov`/`zoom` meaning, "OTS is just MID", LOW/HIGH ignoring size, `liveMax` 2, and the `camR` aspect bug.

## systems (src/33-systems.js (new file). Do NOT edit src/32-flow.js (another engineer owns it right now): hook in from 33-systems.js instead (it loads after flow: wrap flow.stop/flow.start at load time, use addUpdate, the event bus, and world/player APIs); list any flow hook you still need in your report for the integrator)
I've built `src/33-systems.js` and committed it as `bba31d0`. That commit holds only that file. The dev scene is deleted and nothing was pushed. It runs clean in an isolated build and in a build of everyone's current working tree: 0 errors, and no "shader compiled mid-game" warnings with or without `fast=1`.

**What it exposes** (full docs in the file header; all are top-level names):
- **`chip`**: holding CHIP works only when `state.active === 'chase40'`, in a roam, `chip.allowed`, and not forced off. Holding it turns on the tint, shows AR, places the Cloud+ ads in view and turns his chip light on. `chip.signal` fills at `chip.rate` (1/6, so about 6 s), faster inside `chip.hot` areas, and drains on release. When full it fires `emit('signal:full', { who })`.
  - `forceOff(on = true, msg)`, `lightOn(on | null)`, `show(on)` (cosmetic, for POV shots), `peek(sec)` → Promise (the autoplay version of CHIP), `reset()`.
- **`AR`**: `add({ id, kind, text, title, at | on: actorId | prop, oy, w, color, size, maxD })` → id. Kinds: sign, price, name, code, tag, ad, thought, popup, and path (`{ points, loop }`, a crawling dashed floor line). Also `set(id, patch)`, `remove(id)`, `clear()`, `show(true | false | null)`, `visible`. Labels are pooled DOM elements projected after each render; ads draw behind everything else; every drone's patrol route shows as an AR path automatically. Everything is dropped when the set changes.
- **`DRONES`**: `spawn(id, { path, loop, speed, pause, at, face, hover, kind, cone: { len, half } | false, sweep, showPath, ai })`.
  - States: patrol → curious (amber, faces you, '?' chirp) → escort (red, glides in, the hug) → capture. Out of the cone for 2 s while amber, it goes back to patrol.
  - Cones are fans on the floor, clipped by set colliders and `cover(id, box)` boxes; a faint beam links each drone to its cone.
  - `lure(at, sampleId, { r, dur, line })` → thenable `{ n, ids, done }`; the laugh sample gives "Excuse me! Someone is having too much fun!". `lureMenu(at, { fallback, test })` lets Chase pick a sample.
  - Also `goTo`, `face`, `release`, `light`, `inCone`, `alert`, `turn`, `calm`, `reset`, `pause`, `zap(droneId, actorId, { line })` (1.6's static discharge) and `warm(warmObject)` (called at boot).
- **`stealth`**: `begin({ checkpoints: [{ box | zone, at }], onCapture, onRetry, variant, safeRoom: false, targets, escortAfter, forgetAfter, autoCapture })`, `end()`, `capture(who)`, `softFail(who)`, `checkpoint()`. Without checkpoints, it saves the party's positions each time the player enters a new set zone.
- **`safeRoom({ variant: 'room' | 'quiet', who, onRetry })`** → Promise. It's its own small scene drawn full-screen while the set is hidden, never unloaded. The captured actor sits on the beanbag. The drone says "You are not in trouble. ^ You are in danger.", the lights dim, then the SafeSense "Would you like to try again? [YES]" pop-up. About 4 s plus the YES press.
- **`strengthHold({ who, label, dur, keep, at, anim, onProgress, onFull, onRelease, autoHold })`** → thenable. `keep` means it stays up only while YES is held (the roller door). A tap or NO gives up.
- **`pairSwitch({ id, ends | adopts scene hotspots { pair: id }, label, who, hold, keep, onDone, onChange })`** → thenable. At a free end, YES sends the nearest partner there ("Hold this"), otherwise you hold it yourself and can SWAP away. YES at the other end completes it.

Under autoplay, `strengthHold` and `pairSwitch` complete themselves, and drones never go past curious unless the scene passes `autoCapture`. Everything is cleaned up on `flow:stop`, and every call finishes at once while a cutscene is skipped.

**Hooks into other files (no edits):** I wrap `world.render` at load, add one `addUpdate` ticker, listen to `flow:stop`, `swap` and `signal:full`, and use `player.wait` / `flow.holdPos` and `flow.busy`. The integrator doesn't need to add anything to flow. I also inject an `#ar` layer and its CSS from JS.

**How I tested:**
- A dev scene on `reddy` ran under `autoplay=1`, with and without `fast=1`, with screenshots. It covered the Chip View with all label kinds, the routes, ads and Signal; the laugh lure; a keep-while-held lift; a pair switch; a capture through the Safe Room and retry; the Signal-full soft fail; the Quiet Corner; and the zap.
- A Playwright script then drove the dev scene with real key presses, no autoplay: SWAP, holding Q, forced off, holding and tapping the door, "Hold this" then "Turn", and being caught and pressing YES. All checks pass.

**Known gaps and notes for the integrator:**
- ARCHITECTURE still lists a `24-set-safe-room.js` set; it isn't needed now.
- Colliders have no height, so low counters also cut cones. A scene can use `DRONES.walls = false` and rely on `cover()` boxes instead.
- The escort is deliberately faster than running, so once a drone turns red you can't outrun it.
- The HUD and swap indicator stay visible in the Safe Room.
- The UI's "CHIP VIEW" corner label overlaps the swap indicator (that's in the UI file, not mine).
- The hangar's hundreds of drones and the roof ring are set work using the art's instanced drones. `DRONES` is for the handful of live AI drones: 8 prewarmed, more on demand.
- I didn't look at sound mixing (the single drone hum, lure repeats); headless runs are silent.
