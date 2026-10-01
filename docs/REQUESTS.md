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

## Engine

- [ ] **systems** — a lured drone's collapsing cone sweeps a wide fan and can spot nearby actors: keep it narrow or skip detection until collapsed.
- [ ] **systems** — `stealth.end()` always calls `DRONES.calm()` (sends lured drones home): make it optional (`stealth.end({ calm: false })`).
- [ ] **systems** — `chip.show(true)` auto-places a Cloud+ ad: an option to suppress auto ads during scripted Chip View POVs.
- [ ] **flow** — `{ face }` steps don't wait for the turn; add `{ face, to, wait: true }` (close-ups right after a face frame the back of the head).
- [ ] **config** — confirm speaker ids MAN, KID, WOMAN (1.7 human moments; currently defined in `63-content-1-7-1-8.js`) or move them to `01-config.js`.
- [ ] **art** — Chase (2040) T-shirt outfit for 2.1 dawn (currently: coat, lanyard and headphones hidden).
- [ ] **art** — chip light renders as a fairly large bright square (engine C note).
- [ ] **world** — orbits in tight rooms shrink to 20% radius → cramped, head-cropped frames (engine C note).
- [ ] **systems** — drone floor cones are low-contrast on the bright 2026 store floor (engine C note).
- [ ] **docs** — ENGINE.md cheat sheet + ARCHITECTURE §5: mini-game host (api.fail, api.fails, noSkip, skipResult, flow.skipMinigame, flow.minigameId), `AUDIO.bakeSong(pattern, {samples})`, `pattern.bridge` null semantics, `choose({prompt})`, `api.opaque`, `input.pointer.downX/downY`, new SFX names.
- [ ] **regression** — `DEV_MG` scene in `89-content-devtest.js` that autoplays every MINIGAMES entry.

## Mini-games

- [ ] **keypad** — no keypad mini-game exists; `64-content-2-1-2-3.js` registers a port of Rue's alarm keypad as `MINIGAMES.keypad` if absent. Move it into a mini-game file (`54-mg-keypad.js`) and drop the content-side copy.
