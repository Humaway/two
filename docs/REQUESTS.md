# Cross-owner requests ledger

Requests raised by one owner against files they don't own. A maintenance pass applies them and ticks them off.
Source reports are in `docs/reports/`.

## Sets

- [x] **parade** — add `s17_pass`, `s17_turn`, `s18_pass` to `SETS.parade.paths` (1.7/1.8 currently inject them at runtime in `63-content-1-7-1-8.js`; remove the injection after). **Done:** in `PATHS` with the same values (the content's `if (!p[k])` fill is now a no-op; `paths()`/`PATHS17` can go).
- [x] **parade** — Region W (Woody Point) has no kettle/urn: add a save point mark + hotspot spot (e.g. a kiosk urn) for 2.3/B2. **Done:** a coffee cart by the picnic shelter (local (11, −10.6)) with prop `urn_w` (`steam()`), mark `kettle_w`, anchor `urn_w`; hotspot `{ at: 'urn_w', r: 1.2, kettle: true }`.
- [x] **parade** — anchor `s23_plaque` camera sits inside an actor standing at `s23_plaque_look`: move the lens to ≈ `[-300.48, 1.02, -0.6]` (or the mark back to z −1.2). **Done:** lens moved to `[-300.48, 1.02, -0.6]`, fov 30 (2.3's own `PLAQUE` lens).
- [x] **parade** — `s22_c40_close` frames the back of Chase (2040)'s head at `s22_c40_edge`; `s22_piano_cam` / `s22_drone_piano` put the drone between camera and bench, seated heads below the 1.3 m lid. **Done:** `s22_c40_close` now frontal (from `[7.3, 1.62, -16.35]`); `s22_piano_cam` = 2.2's `BOTH_FRONT` lens high over the lid; `s22_drone_piano` → `[8.35, 1.9, -21.6]` (2.2's `PIANO_TOP`, off the bench lenses).
- [x] **flat** — the `s21_*` anchors don't match `docs/sets/flat.md`; floor setup doesn't allow lying down on couch/bed (2.1 sleepers sit up). **Done:** code wins: `s21_dawn_wide` / `s21_box` (moved by the set builder to clear the couch and Luka) now use 2.1's tested `DAWN_WIDE` / `BOX` lenses and `docs/sets/flat.md` matches the code; lying: `SETS.flat.lie(true)` makes the couch seat (0.42) and the mattress (0.56) `floor(x, z)` (off by default and on every `dress()`), new marks `s21_couch_lie` / `s21_bed_lie` for `lie` / `sleep_back` (checked in setview: both lie on top).
- [ ] **sandgate** — `queue.bubble` returns head + 0.28 m, the doc says + 0.4 m (sizzle compensates).

- [ ] **reddy26** — anchor `s12_heroic` (y 0.85) sits under the Hero Table glass (0.93–0.95): raise to ≈ y 1.02; from `s12_twoshot` the JARVIS monitor hides Chase at `s11_chase_phone` (content uses pos [6.95,1.45,−5.3] → [6.1,1.4,−8.4]); `floor_wreck_wide` puts the wreck under the dialogue box.
- [ ] **reddy26** — `blast()` fells the tree at 0.25 s (inside the slow-motion close): add `blast({ tree: false })` or a delayed fall (1.2 calls `xmas_tree.userData.fall()` again at the real-time wide).

- [ ] **reddy40** — 1.6 address marks: `s16_addr_luka [0.9,-6.4]` is inside display table 2 → luka `[1.6,-6.55]`, chase `[2.25,-6.2]`, c40 `[2.85,-6.95]`; `s16_addr_jordan [3.6,-7.6]` overlaps a stool → `[3.8,-7.3]`; `s16_jordan_close` → `[3.35,-7.35]`; `s16_speaker [7.55,-8.0]` is 0.1 m from a stool (content uses its own coordinates).

- [ ] **hq_roof** — from the Remote's screen the `s37_st_*` marks put Future Luka behind Luka; the `s37_crane_a`→`b` glide passes through the Yes letters; `s37_sorry_two` looks at the lift house, not the city.

- [ ] **reddy26** — a second fingerprint decal or `smudge1At(x, z, scale)` (1.1 moves/scales `hero_smudge1`); `pot_plant` anchor looks through the tree; `monitor2` sees the monitor's back; Wall/noticeboard anchors put the lens where the player stands; the backroom door has no collider when shut.
- [ ] **hq_top** — docs §6 vs code for `glass_popup_ecu`/`glass_moon` (code wins: update doc); `glass_popup` is cropped by the letterbox (P uses [−3.0, 2.15, −14.7]); the ECU shows a title sliver (P uses [−3.04,1.935,−12.95]→[−3.04,1.915,−11.24], fov 31).

- [ ] **bridge** — the `ch_shoulder` camera ([-5.8, 0.5, 214]) has the west barrier filling ~⅓ of the frame during the chase.

- [ ] **train** — `aisle_B_far`/`aisle_B_near` (and the A pair) face opposite ways but both `ease`: crossing z ±4.8 swoops through a 0.25 s top-down over the player — drop `ease` on those cams; `passenger_b` is a woman but the reindeer owner is a man (2.7 spawns `reindeer_man`, look local40_c); no `lean` anim.
- [ ] **sandgate** — `h26_sizzle` sample spot sits inside the gazebo collider (2.6 uses its own spot at the table front).

- [ ] **hq_floors** — no `reset()`; `bank.open(0)` eases 3 s outside a skip so on Continue the bank slides shut on arrival: add `SETS.hq_floors.reset()` or an instant option; `drones` data uses `y` + path names (3.2 maps them to `hover` + point arrays).
- [ ] **hq_roof** — `roof_hatch` anchor sits south of the hatch so the lid fills the frame (3.2 uses a lens from the east).
- [ ] **hq_atrium** — a hand prop for Luke's invitation (3.1 builds a card mesh at load).

- [ ] **hq_top** — optional lamp preset near `mgr_turn` (the 3.3 badge insert is dark).

- [x] **parade** — a `coffees` prop in Region W for B2 (B2 builds two cups in its file, like foreshore26 has). **Done:** `coffees` (+ `coffee_luka40`, `coffee_chase40`) with foreshore26's API `show(who|'both', on)`, `hold(who, on, hand)`, `home()`; homes = B2's spots (seat by Luka (2040)'s hip, pad by Chase (2040)'s foot); hidden by every `dress()`, so B2's own cups are unaffected until it switches; anchor `coffees_w`.
- [ ] **reddy40** — an optional caption mode for the address canvas ("THE MANAGER" for the B1 2037 frame).
- [ ] **sets (optional)** — a funeral frame for B1's 2035 (B1 builds a small hall at load, parked in reddy26 at (40, −60, −40)).

- [ ] **reddy26** — `store_phone.ring()` is visual only (A1 plays the ring sfx itself); the `counter_phone` angle shows the showcase rail (A coda uses its own lens).

## Engine

- [ ] **systems** — a lured drone's collapsing cone sweeps a wide fan and can spot nearby actors: keep it narrow or skip detection until collapsed.
- [ ] **systems** — `stealth.end()` always calls `DRONES.calm()` (sends lured drones home): make it optional (`stealth.end({ calm: false })`).
- [ ] **systems** — `chip.show(true)` auto-places a Cloud+ ad: an option to suppress auto ads during scripted Chip View POVs.
- [ ] **flow** — `{ face }` steps don't wait for the turn; add `{ face, to, wait: true }` (close-ups right after a face frame the back of the head).
- [ ] **config** — confirm speaker ids MAN, KID, WOMAN (1.7 human moments; currently defined in `63-content-1-7-1-8.js`) or move them to `01-config.js`.
- [ ] **art** — Chase (2040) T-shirt outfit for 2.1 dawn (currently: coat, lanyard and headphones hidden).
- [ ] **art** — chip light renders as a fairly large bright square (engine C note).
- [ ] **core** — `wait`/`waitUntil` resolve immediately while skipping, which traps autoplay code: document it and add a variant that keeps checking (1.6 uses its own per-tick `until()`).
- [ ] **art** — hair-on-end for the 1.6 zap (uses soot mark + fingertip smoke); a card attachment (1.5's bonus card mesh lives in the content file).
- [ ] **ui** — pop-ups sit under the letterbox bars (`#pops` z 5 < `.lb` z 6): on portrait phones cutscene pop-ups are mostly hidden. Raise `#pops` above `.lb` or limit bar height in portrait (3.7 slides the bars away while STORAGE FULL shows).
- [ ] **art/world** — `idle`/upper-body anims don't clear `rig.seated`/`rig.floorSit`; a skipped walk leaves a floor-sitter sitting (3.7 resets on stand + flow:stop). Clear them on `idle`/`stand` and on despawn.
- [ ] **world** — `eyePos` is stale in the same tick as `place()`: refresh matrices in `place()` (3.7 waits a tick).
- [ ] **world/docs** — JARVIS shot with `on` re-aims at MID height every frame (faces at the top): document `size: 'CLOSE'`.
- [ ] **art** — anims used in 3.7 registered content-side as `s37_*`: wiring, forearms on parapet, hand on shoulder, wiping face, hand on table, hurt walk, leaning back on parapet — promote to 04-art.js.
- [ ] **art** — `polish` hands land at ≈0.46 m crouched / 0.8 m standing, below the Hero Table glass (0.95 m): calibrate (1.1 uses its own `s11_polish`, calls polish with `anim:false`).
- [ ] **docs** — `world.anchor()` returns `{ at, from }` as Vector3s (not arrays).
- [ ] **art** — a laughing-and-crying expression (2.5 uses `laugh` + `face.tears = 1`); a hand-on-rail descent for Rue (2.4).
- [ ] **flow** — under autoplay, `move` steps on the leader don't make followers trail (2.5's autoplay walks them itself).
- [ ] **flow** — hotspot `text` runs before `kettle`, so a kettle line can't get its own shot (2.4 runs line + ask + saveGame by hand).
- [ ] **ui** — speaker `passenger` always shows the old-man portrait; per-actor portraits for generic speakers (2.7 uses passenger_c/passenger_d labelled PASSENGER).
- [ ] **art** — a hand-held card prop (1.5 bonus card and 2.6 invitation are built content-side from `mat()`).
- [ ] **BUG world** — `a.hold`: dropping/despawning an object that had no parent when picked up crashes (`h.parent.add` on null): guard `if (h.parent)`.
- [ ] **BUG flow/ui** — the `{quiet}` step sets `state.quiet` before `hud.quiet()`, which then sees no change and never repaints: let `hud.quiet` assign it.
- [ ] **art** — anims' `.expr` (e.g. `still`, `hurt_stand`) overwrite an explicit expression set in the same tick: let an explicit `expr` step win (3.5 uses wrappers `s3_still`, `s3_hurt`).
- [ ] **art** — per-part opacity, e.g. `rig.ghost(part, alpha)` (3.5 fakes the erased hand by scaling the `handR` bone).
- [ ] **art** — `luka40` needs `headphones_held` + a `phones_off` anim (3.6 hides `headphones_head`).
- [ ] **art** — `lanyard_snapped` dressing must also hide `lanyard2` (Nadia's) when the inventory holds `nadia_lanyard`.
- [ ] **ui** — the HACK bar sits over the top letterbox in 3.4–3.5 cutscenes: move it below the letterbox while a cutscene runs.
- [ ] **audio** — `AUDIO.seq` (and song handles) don't pause with the pause menu: pause/resume them from the flow's pause (3.6's song + conductor keep running while paused).
- [ ] **world** — `{shot:'TWO'}` in a split's left half frames the whole room instead of the two subjects (1.3 uses explicit lenses).
- [ ] **world** — orbits in tight rooms shrink to 20% radius → cramped, head-cropped frames (engine C note).
- [ ] **systems** — drone floor cones are low-contrast on the bright 2026 store floor (engine C note).
- [ ] **docs** — ENGINE.md cheat sheet + ARCHITECTURE §5: mini-game host (api.fail, api.fails, noSkip, skipResult, flow.skipMinigame, flow.minigameId), `AUDIO.bakeSong(pattern, {samples})`, `pattern.bridge` null semantics, `choose({prompt})`, `api.opaque`, `input.pointer.downX/downY`, new SFX names.
- [ ] **regression** — `DEV_MG` scene in `89-content-devtest.js` that autoplays every MINIGAMES entry.

## Mini-games

- [ ] **polish** — the default lean walks Chase straight through the counter: use `collide: true` or a waypoint (1.1 parks him at (8.3, −8.1) first).

- [ ] **stall** — release the cutscene camera when the mini-game returns (1.3 calls `cam.release()` itself), or document it in the header.

- [ ] **keypad** — no keypad mini-game exists; `64-content-2-1-2-3.js` registers a port of Rue's alarm keypad as `MINIGAMES.keypad` if absent. Move it into a mini-game file (`54-mg-keypad.js`) and drop the content-side copy.
- [ ] **world** — a per-set render hook (`def.render(alpha)`) called by `world.render` before drawing; `15-set-bridge.js` currently wraps `world.render` once to interpolate scooters/cars/pelicans between ticks.

## Engine (second batch, from Ending A — for the next maintenance pass)

- [ ] **art** — `rig.fade(k, wash)` with prebuilt transparent variants (A1 wraps `world.adopt` from its file for luka/chase/luka40/chase40 to build per-rig transparent copies at boot; then drop the wrapper).
- [ ] **art** — a `santa_hat` attachment on `luke` (A1/B1 parent `PROPS.santa_hat()` clones to his head bone).
- [ ] **art** — `glance` and upper anims on seated/lying rigs re-pose with `sit` (h 0.46 lifts a parapet sitter; a lying rig stands): respect the current seat height / lying state.
- [ ] **world** — expose `world.pool` (or a rig lookup by look) so content needn't keep boot rig refs.
- [ ] **art** — a hand-held lanyard prop (A1 uses Future Luka's lanyard attachment via `actor.hold`).

- [ ] **keypad** — `title` / `prompt` / `okText` params (2.8 wraps it as `MINIGAMES.safebox_keypad` and renames labels in the DOM). (sent to the engine maintainer)
- [ ] **systems** — `DRONES.lure(..., { transfixed: true })`: a lured drone sees nothing until done (2.8 toggles its `ai` off). (sent)
- [ ] **systems** — a `y` hover option on `DRONES.goTo` (2.8 eases `d.hover` itself). (sent)
- [ ] **valley** — anchors `s28_c40_close`, `s28_track_*`, `s29_luka_close` (door leaf blocks), `s29_reverse` (lens inside Luka at his turn mark), `s29_c40_dark` (back of head) frame badly with the scene's blocking (2.8–2.9 use computed lenses); no anchor for a face lying on its back.

- [ ] **main** — `warmRig` bakes portraits by cropping the centre square of the screen canvas; on portrait screens that zooms to just the face (Polaroids, dialogue faces): render portraits from a fixed-aspect target.

## Visual QA (integration pass)

- [ ] **B1** — real-time screenshot pass of the montage (2029 → match cut) and the post-screenshot framing fixes; **B2** entirely (fast autoplay passes; frames unviewed).
