# 18 — Release QA against §17 (acceptance + systems)

All checks ran in headless Chromium against a fresh build (`out/qa.html`). The test scripts lived in the session scratchpad: `qa/lib.mjs` served the page the way `tools/run.mjs` does and exposed engine internals as `window.__Q`, for the tests only. Fix commits: `36983da`, `f4e6903`, `19a959b`. All three are engine/UI, apart from two one-line set guards.

## §17 checklist

**Story and script** (content; not re-audited here)
- **PASS — every line present:** `node tools/check-lines.mjs` → 1123/1123.
- **PASS — every scene P→PC exists and both endings run:** see the A/B autoplay runs under Systems. The narrative items (Rue once, joke counts, ledger hints, boss beats, how the Choice is framed) were not re-verified.

**Feel**
- **PASS — PS1 look:** checked in screenshots of the title, 1.1, 1.6, Chip View, the Safe Room and the menus. Wobble and jitter can't be judged from stills.
- **PASS — letterbox in cutscenes:** the bars stay up for the whole prologue. 1.6's opening cutscene sets `#ui.lbon`, and roaming clears it.
- **PASS — no pause over 4 s, no stare counter:**
  - The `stare` step is capped at 4 s (`STARE_MAX = 4` in 32-flow) and hides every UI layer while it runs.
  - There is no STARE text anywhere in the UI.
  - Content has 21 `wait` steps longer than 4 s. 17 of them were checked in context, and every one sits under a moving camera with action, not a silent stare.
  - The other four were not opened: 60:179, 67:891, 71:1584, 72:568.
- **Not assessable by QA:** whether jokes land; how the honest moments play.

**Systems**
- **PASS — kettle save survives a reload:**
  - Flow: "Put the kettle on? [YES][NO]" → YES → "Saved." The save holds the scene (1.1), flags, samples and items.
  - After a reload, Continue resumes 1.1 with the same state. The text-speed option also survives the reload.
- **PASS — storage blocked** (`window.localStorage` throws on access): boots, plays the prologue, reaches the title, starts a New Game and uses the kettle. No "Saved." appears, and there are 0 errors.
- **PASS (hardened) — corrupt saves:** bad JSON, a v99 save and a garbage save all boot with 0 errors.
- **PASS after fixes — keyboard:**
  - The loader shows "JARVIS is loading your game." then "JARVIS is ready." [YES].
  - Prologue, then the title: lowercase "two", the Yes-yellow rule, reddy40 at dusk, orbit camera, drones.
  - New Game → 1.1. WASD/arrows and Shift-run work. YES examines. I opens the inventory. P pauses.
- **PASS after fixes — gamepad** (emulated through `navigator.getGamepads`):
  - A, B, X (BAG), Y (SWAP: luka → chase → chase40), LB (Chip View), Start, the left stick and RB (run) all work.
  - Polish works with hold-A plus the stick.
- **PASS after fixes — touch** (390×844 and 844×390):
  - The YES, NO, SWAP, BAG, CHIP and pause buttons and the virtual stick all work; pushing the stick further runs.
  - Menus and Chapter Select work by tap. Polish works by dragging.
- **FIXED — Reduce Flashing:**
  - Every flash, lightning, explosion and flicker path has a reduced variant.
  - A white flash peaks at opacity 0.3 in muted grey (1.0 with the option off), and `body.calm` stops the CSS pulses.
  - The parade chip-shop tube and the valley "nap" sign are now guarded. The reddy26 backroom tube is still open (below).
- **PASS — `?autoplay=1&fast=1&speed=8&ending=A` and `&ending=B`:** both DONE, 0 errors, 0 warnings. These ran on the build with the first two fix commits. The third was checked with shorter range runs.
- **PASS — Safe Room:** forced capture in 1.6 → room → "Would you like to try again? [YES]" → back at the checkpoint, about 5–6 s capture-to-control under SwiftShader. Needed fix `f4e6903`.
- **PASS — skip after two failures:** two wrong keypad codes → the toast "Skip this? It's in the pause menu." → "Skip this mini-game" appears in the pause menu → `{skipped:true, ok:true}`.

**Performance**
- **PASS — F2 overlay:** shows frame time, max, pixel ratio, draw calls, triangles, textures, scene, step and camera.
- **PASS — draw calls < 300:** a per-frame probe over a full autoplay with every frame rendered peaked at 278 in steady play (3.4); 1.1 peaked at 272. The only frames over 300 are single set-building frames during scene transitions.
- **Not measurable here:** 50 ms hitches (CPU rendering).

**Other checks**
- **PASS — only three.js is fetched:** the build contains no `url()`, `@font-face`, `fetch` or `new Image`, and the runtime request log shows only the page and three.
- **PASS — storage access is guarded:** all 3 `localStorage` accesses are in try/catch (02-core).
- **PASS — options:**
  - Tank controls: A turns Luka in place, W moves along his facing, S backs up.
  - Text speed and size, the objective-line toggle, Story Mode and Hold/Press all work. Press latches a held YES until NO.
  - Options persist across a reload.
- **PASS — Quit to Title** works mid-roam, mid-mini-game and mid-Safe-Room, and New Game works afterwards.
- **PASS — Chapter Select and Extras:**
  - Chapter Select lists all 32 scenes.
  - Endings shows each as seen or not seen.
  - The Jukebox lists the 1987 song, "two" and 15 samples, and all play.
  - Also checked: the Bug List 2040 card, People (13 cards, Rue's brick phone last with no caption), Pudding Discography ("two (2026)" after ending A) and Credits.

## Fixes

- `36983da`:
  - **Audio for gamepad-only players:** the AudioContext is now also created after the loader's YES and on pad presses, and keeps retrying (99-main, 02-core).
  - **Ghost taps:** a trusted click only counts on a button its own press started on (02-core).
  - **Menu values on touch:** tapping a value now steps it (31-ui).
  - **Save hardening:** stored options are validated, and an unknown saved scene resumes at 1.1 (02-core).
  - **Audio listener:** a NaN camera is ignored instead of throwing (03-audio).
- `f4e6903`: the Safe Room hides the scene's own pop-ups and prompt until the retry (33-systems).
- `19a959b`:
  - Menus fit at ≤600 px and scroll the list only, not the page (00-head, 31-ui).
  - The ghost-tap guard now also covers inventory slots (02-core).
  - The parade chip-shop tube and the valley "nap" sign respect Reduce Flashing.

After the fixes, these all ran DONE with 0 errors and 0 warnings: DEV, `scene=1.7&stop=2.2` and `scene=2.8&stop=2.10`.

## Left open (routed to owners)

1. `src/10-set-reddy26.js` ~1956–1958: the backroom tube flickers at 17 Hz with no Reduce Flashing guard. Fix: add `&& !reduceFx()` to both flicker branches. → endings polish (owns reddy26).
2. 1.1 at 390×844 portrait: the starting roam camera shows a dark blob in the top-left, probably a prop or ceiling object clipping the lens. → Act 1 polish.
3. Gamepad detection relies on `gamepadconnected`; there is no polling fallback.
4. Not covered: hitch measurement, and full pad-only or touch-only playthroughs (only autoplay plays the whole game).
