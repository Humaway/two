# Engine C reports (integration, review)

## rep

The six owner reports are in docs/reports/01-engine-a.md (core, art) and docs/reports/02-engine-b.md (ui, audio, world, systems). Read both fully.

## integ

The engine boots clean with your files, and every task you listed is done and committed. Final runs: `scene=DEV&stop=DEV` with `fast=1` gives 0 errors and 0 warnings; the same scene at `speed=2` without `fast` gives 0 errors and 0 warnings; the default `autoplay=1&fast=1&speed=8` gives 0 errors and the one expected warning ("scene P is not built"). I also ran the whole working tree, including everyone's in-progress sets and mini-games, through DEV with 0 errors.

**API surface:** ARCHITECTURE §5 is rewritten to match the code exactly (§5.1–5.10). `docs/ENGINE.md` now says §5 wins where the old manuals disagree.

**API mismatches fixed**
- **AR labels vs the set specs:** the specs pass `w` in metres (2.4, 16) and colours as hex numbers (`0xff3a3a`). The code treated `w` as pixels, so those labels collapsed to slivers. `w` below 40 is now metres in the world and wraps its text; above that it is pixels. Hex colours work.
- **AR paths vs the set specs:** paths in the specs use `path: 'name'` (the set's own `paths` table) or `arc: {c, r, a0, a1}`. Both now work, alongside `points`.
- **Art's one-shot animations:** the world now merges `ANIM_ONE`, which the art owner asked for, so TWO's one-shots stop holding their last frame.
- **Rain kind:** the world now passes the set's rain kind ('glass', 'roof', …) to audio on weather changes.
- **3.1 Quiet Corner:** `safeRoom({ variant: 'quiet' })` now uses `hq_atrium`'s own corner when the set has the `quiet_beanbag` / `quiet_drone` marks. Otherwise systems draws one.
- **Safe Room clean-up:** the HUD, objective, swap indicator and Signal hide in the Safe Room, and the escort's "Gotcha!" bark no longer talks over it.
- **Layout overlaps:** the CHIP VIEW label no longer sits under the swap indicator, and the time card moves above the dialogue box while someone talks.

**Engine requests implemented**
- `world.torchAuto` resets to true whenever a set is shown. Sets that use the spot as a lamp should re-assert `false` in `update` while it's lit, because a re-show within a scene also resets it; I put that in §5.5.
- `world.envName` gives the current set's env preset name.
- `cam.override(mode, { ease })` blends into or out of an override instead of cutting. A `'fixed'` override can have its `pos`/`look` arrays changed every tick with `lag`/`lookLag` damping; that is the hook the boss camera needs.
- Camera roll already existed (`roll: 180`); I tested it.
- I added slow motion: a `{ slowmo: 0.3, dur: 1.5 }` cutscene step and `flow.slowmo`. 1.2 needs it.
- Drone cones read the set's colliders live every tick, so moving, added or spliced boxes block sight. The DEV run shows a pushed bin blinding a cone.
- The noise drone's claw: `DRONES.claw(id, k, dur)`.
- `DRONES.lure(at, id, { over, y, disc })`: while investigating, the drone's cone shrinks to a 0.6 m disc on the lure's surface (a café table, in valley).
- Every ambience loop name in `docs/sets/*.md` now exists:
  - 31 are variants of existing loops and cost nothing to bake.
  - 19 are new loops baked in the background after the first YES, so boot time is unchanged.
  - My script checked the specs against the code: all names and rooms are present.
  - New rooms: `small`, `carriage`, `hall`, `atrium` and `lane` (a short slapback echo).
  - I also added a `phone_ring` sound effect.
- `world.liveMax` defaults to 3; this was already done.

**`src/89-content-devtest.js` (keep this file)** runs scene `DEV` on `reddy26` (falls back to `reddy`) and covers every item on your list. On top of that it tests:
- roll 180, an over-the-shoulder shot and slow motion
- the moving-collider blind, the noise drone's claw and both Quiet Corners
- the eased override
- every ambience loop and room

`DEV_LINEUP` shows all 49 looks with name labels.

I looked at the screenshots: all the shots, the split screen, both pop-ups, the HUD, the swap, Chip View with metre-wide labels, the drones, both Safe Room styles and the lineup look right. Two problems I found that way are fixed: a dev camera above the ceiling, and lineup framing. All commits contain only engine files, the docs and the devtest file.

**Remaining gaps**
- **Orbits in tight rooms:** an orbit can shrink to 20% of its radius, which gives cramped, head-cropped frames.
- **Cone readability:** drone cones are low-contrast on the bright 2026 store floor.
- **`SETS.safe_room` mount path:** `safeRoom()` doesn't use it. Systems draws its own room, so ARCHITECTURE now marks that set as optional.
- **Late-baked ambience:** a loop that a scene asks for before its background bake finishes fades in when ready.
- **Slow motion under autoplay:** autoplay's `speed` overrides slow motion.
- **Engine manuals:** `docs/engine/*.md` are not updated; §5 and the source file headers are the reference.
- **Chip light:** Chase (2040)'s chip light renders as a fairly large bright square. That is in the art file.
- **Headless speed:** the test machine is heavily loaded, so a full real-time DEV run takes about 4–5 minutes.

## review

The review is done: I found 21 confirmed problems in the engine and fixed them all. After the fixes, every test run passed. The engine test (`scene=DEV`) gave 0 errors and 0 warnings fast, played at speed 8, and in real time at speed 2. The default `autoplay=1&fast=1&speed=8` run gave 0 errors and only the expected "scene P is not built" warning. Everything is committed as `00f0b9a`, which contains only engine files, `src/89-content-devtest.js` and `docs/ARCHITECTURE.md`.

**Input**
1. **Gamepad unplugged mid-press:** its buttons stayed held and its stick stayed deflected, so the player kept walking. Disconnecting, or no pad being found, now clears all pad state.
2. **Touch buttons and the virtual stick:** a control hidden while held (CHIP when Chase (2040) stops being playable, SWAP/BAG under the dialogue box) could miss its release and stay held for good. They now also release on `lostpointercapture`.
3. **Three-way SWAP:** with a single follower who wasn't the new leader, a swap replaced him with the old leader, so Chase (2040) stopped following. Now the old leader only takes the new leader's place if the new leader was following.
4. **`['control', id]`** now changes leader the same way, so the party keeps its shape. Before, a follower was dropped after a control change; DEV now checks this.
5. **CHIP with "Hold to confirm: Press":** a press could only end by NO or a 5-second timeout. A second CHIP press now turns Chip View off.

**Scene changes (generation counter)**
6. **Hotspot actions:** after Quit to Title, a hotspot that was still running carried on. Its door could load a set over the title, and its `do`, flag and save still ran. Every await is now followed by a check.
7. **Timelapse keys:** keys from the old scene could run in the next scene. They no longer do.
8. **Drone zap:** it could puff smoke and bark in the next scene. It now stops when the scene changes.

**Skip-safety and promises that never resolve**
9. **Timelapse:** it kept running after a skip or a scene change, animating the next set's lighting, and restarting one could leave the camera locked. It now finishes at once on a skip, and stops cleanly on a scene or set change.
10. **`DRONES.goTo`:** its promise never resolved if `face`, `release`, `turn` or `calm` took the drone over. It now always resolves (DEV checks this). A `goTo` sent from a cutscene lands at once when that cutscene is skipped.
11. **Lures:** an awaited lure in a skipped cutscene now resolves at once, and the drones keep investigating.
12. **Strength holds and two-person switches:** they now complete when the cutscene they were made in is skipped. A switch running during a roam is not completed by skipping some other hotspot's little cutscene.
13. **Pop-up answers:** a skipped `{ popup, wait }` left `flow.result` stale, and skipping an open pop-up returned -1. Both now give the answer autoplay would (DEV checks this).

**State leaks**
14. **Quiet Corner interrupted:** quitting mid-corner left the HUD hidden for good (the page kept its `saferoom` class). That is now cleared when the flow stops.
15. **Safe Room re-dress:** moving the actor in and out of the Safe Room re-dressed him. That undid the scene's wardrobe toggles and lit a chip light that had been forced off. It no longer re-dresses.
16. **Quit to Title audio:** songs, the 3.5 muffle, the ringing and ambience beds carried over into the title. The title now calls `AUDIO.stopAll()`.
17. **Rain at load:** a rainy set loaded in a dry preset played rain with no rain on screen. The rain bed now follows the env, using a new `world.raining` getter.

**Spec §13.9 and §16**
18. **Reduce Flashing:** it didn't cover the blinking red Signal or the AR flicker. Both now go still.
19. **Background audio bake:** the 19 late-baked ambience loops all built their node graphs in a single main-thread block at the start of play. That is a likely hitch over 50 ms; they now bake one at a time.
20. **Slow motion under autoplay:** autoplay's speed overrode it. Speed now multiplies it.

**Test coverage**
21. **Timelapse test:** DEV now runs a timelapse with a key, played and skipped.

**Files touched:** `src/00-head.html`, `02-core.js`, `03-audio.js`, `04-art.js`, `30-world.js`, `31-ui.js`, `32-flow.js`, `33-systems.js`, `99-main.js`, `src/89-content-devtest.js` (kept; I added checks), and `docs/ARCHITECTURE.md` §5, updated for the changed behaviour. There is one small cross-file hook: art's re-dress on spawn now skips when `root.userData.noDress` is set, which only the Safe Room uses. Built with `--mine`; I also looked at the real-time screenshots of both Safe Room styles and the cutscenes, and they render correctly.

**Checked and found fine:** no per-frame allocations in update or render beyond DOM writes that only happen on change; no shaders compiling mid-game (no warnings in played runs); every `localStorage` access is inside try/catch; listeners and updaters are registered once.

**Left as is:**
- Orbit shots in tight rooms still shrink to cramped frames.
- AR labels and actor-pinned pop-ups are placed at tick positions, not interpolated ones, so they can trail by up to one tick (negligible).
- Skipping while a fade or title tween is mid-way waits up to 0.8 s for it, as in Rue.
- Under autoplay, every scene start still saves over a real save in that browser.
- Chase (2040)'s chip light still renders as a fairly large bright square (art).
- `docs/engine/*.md` is still not updated; §5 is the reference.
