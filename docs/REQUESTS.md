# Cross-owner requests ledger

Requests raised by one owner against files they don't own. A maintenance pass applies them and ticks them off.
Source reports are in `docs/reports/`.

## Sets

- [ ] **parade** — add `s17_pass`, `s17_turn`, `s18_pass` to `SETS.parade.paths` (1.7/1.8 currently inject them at runtime in `63-content-1-7-1-8.js`; remove the injection after).
- [ ] **parade** — Region W (Woody Point) has no kettle/urn: add a save point mark + hotspot spot (e.g. a kiosk urn) for 2.3/B2.
- [ ] **parade** — anchor `s23_plaque` camera sits inside an actor standing at `s23_plaque_look`: move the lens to ≈ `[-300.48, 1.02, -0.6]` (or the mark back to z −1.2).
- [ ] **parade** — `s22_c40_close` frames the back of Chase (2040)'s head at `s22_c40_edge`; `s22_piano_cam` / `s22_drone_piano` put the drone between camera and bench, seated heads below the 1.3 m lid.
- [ ] **flat** — the `s21_*` anchors don't match `docs/sets/flat.md`; floor setup doesn't allow lying down on couch/bed (2.1 sleepers sit up).
- [ ] **sandgate** — `queue.bubble` returns head + 0.28 m, the doc says + 0.4 m (sizzle compensates).

- [ ] **reddy26** — anchor `s12_heroic` (y 0.85) sits under the Hero Table glass (0.93–0.95): raise to ≈ y 1.02; from `s12_twoshot` the JARVIS monitor hides Chase at `s11_chase_phone` (content uses pos [6.95,1.45,−5.3] → [6.1,1.4,−8.4]); `floor_wreck_wide` puts the wreck under the dialogue box.
- [ ] **reddy26** — `blast()` fells the tree at 0.25 s (inside the slow-motion close): add `blast({ tree: false })` or a delayed fall (1.2 calls `xmas_tree.userData.fall()` again at the real-time wide).

- [ ] **reddy40** — 1.6 address marks: `s16_addr_luka [0.9,-6.4]` is inside display table 2 → luka `[1.6,-6.55]`, chase `[2.25,-6.2]`, c40 `[2.85,-6.95]`; `s16_addr_jordan [3.6,-7.6]` overlaps a stool → `[3.8,-7.3]`; `s16_jordan_close` → `[3.35,-7.35]`; `s16_speaker [7.55,-8.0]` is 0.1 m from a stool (content uses its own coordinates).

- [ ] **hq_roof** — from the Remote's screen the `s37_st_*` marks put Future Luka behind Luka; the `s37_crane_a`→`b` glide passes through the Yes letters; `s37_sorry_two` looks at the lift house, not the city.

- [ ] **reddy26** — a second fingerprint decal or `smudge1At(x, z, scale)` (1.1 moves/scales `hero_smudge1`); `pot_plant` anchor looks through the tree; `monitor2` sees the monitor's back; Wall/noticeboard anchors put the lens where the player stands; the backroom door has no collider when shut.
- [ ] **hq_top** — docs §6 vs code for `glass_popup_ecu`/`glass_moon` (code wins: update doc); `glass_popup` is cropped by the letterbox (P uses [−3.0, 2.15, −14.7]); the ECU shows a title sliver (P uses [−3.04,1.935,−12.95]→[−3.04,1.915,−11.24], fov 31).

- [ ] **bridge** — the `ch_shoulder` camera ([-5.8, 0.5, 214]) has the west barrier filling ~⅓ of the frame during the chase.

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
