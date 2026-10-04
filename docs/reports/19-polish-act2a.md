# 19 — Polish pass: Act Two, first half (2.1–2.5)

Files: `src/64-content-2-1-2-3.js`, `src/65-content-2-4-2-5.js`, `src/15-set-bridge.js` (the render-hook cleanup only)
(+ my ticks in `docs/REQUESTS.md`). Sets used: flat, parade (Region P lane22, Region W bench23), rue_house, bridge,
hq_top (the 2.5 cutaway). Commits: `8d6e1bf` (the resumed pass: the crashed agent's uncommitted cleanups, judged and
finished), `0378323` (real-time QA fixes), `a8b24aa` (ledger), `d63fdba` + the commit carrying this report (2.3's
bench).

## Method

Resumed after a container restart: the previous agent had left ~280 uncommitted lines across my three files. I read the
whole diff against the brief and the script, kept all of it (every change was a ledger cleanup or a framing fix that
its own screenshots supported), simplified the bridge hook, built `--mine`, ran check-lines and a fast 2.1–2.5 autoplay
and committed it straight away.

Then every scene was played in real time (`autoplay=1&speed=2`, 1280×720) through a shot-aware harness (a scratch copy
of `tools/run.mjs` in `out/`: a frame 0.5 s after every cut and every few game-seconds between, the game clock paused
for each screenshot) and the frames read cut by cut on contact sheets, full size where it mattered. Where a frame was
wrong I opened a "studio" session (the build booted once, paused at the beat, actors placed by hand, candidate lenses
screenshotted side by side) and picked the lens from real frames, not from arithmetic. Fixed, rebuilt, re-shot.

## What changed, per scene

**2.1 — Senior Casual** (the morning after).
- Chase (2040) spawns in the dawn T-shirt look (`chase40_tee`); the content helper that hid his coat, lanyard and
  headphones (and put them back at the plan) is gone. He stays in the T-shirt through toast and the Santa beat.
- Both sleepers lie down now: `SETS.flat.lie(true)` with `s21_couch_lie` (`lie`) and `s21_bed_lie` (`sleep_back`).
  The [CLOSE · Chase on the couch] is computed from his eyes as he lies there (his face on the couch arm, the new CHASE
  lanyard on his chest, the earbud), he wakes (tired), glances to the glass, and the over-the-head shot finds Luka
  polishing beyond the glass; he sits up under the cut to the room and stands into control.
- The dawn wide starts from the set's `s21_dawn_wide` and eases toward the glass.
- The balcony's locked two-shot was cutting both heads at the top bar: raised (both heads and the bridge in frame).
- The plan's master widened (all three faces and the toast inside the bars).
- The decoration box: the lens (from the set's `s21_box`) looked down at the box and lost Luka's kneeling head above
  the letterbox; it now starts a little higher and wider so his face and the open box (the hat and beard on top) are
  both in frame.
- Checked and kept: the slate folder + the scrolling 2,847 list, the 2031 photo, "Don't." at the doorway (T-shirt, hair
  everywhere), the shot/reverse at the doorway, his look past Chase to Luka, the burn-scar insert, the Santa turn.

**2.2 — Bee Gees Way** (the piano).
- The lane opening now tracks in from the Parade footpath behind all three, the statues at the far end.
- "Olympics. Everything's 2032." framed the back of Chase (2040)'s head: he turns to the tag first.
- The drone's piano post comes from the set's `s22_drone_piano`. The café urn's steam rises from the urn's lid.
- The bay shot ("…I cancel everything because of a bridge.") re-aimed between the lamp and the palm, the bridge on the
  horizon.
- The mirror two-shot over the lid is content's own lens, lower and tighter than the set's `s22_piano_cam` (whose
  faces read small); during the slump both heads bow (the same posture, by design), and the faces read in the later
  side-by-side cuts.
- Checked and kept: the limiter card + keypad, the plate lift, the playing-on montage cut to the bars, the hiss.

**2.3 — The Bench** (the plaque).
- The plaque insert uses the set's `s23_plaque` (the card covers it).
- Hint 2: Luka's hand now actually runs along the top rail (engine `hand_rest`, its reach eased from his right to his
  left under the panning rail lens, the glint following); the content `s23_finger` anim is gone.
- A save point at last: the coffee cart's urn (`urn_w`), steam from its lid; autoplay uses it.
- "…I don't come here.": a pine stood on Chase (2040)'s head; the close swings to a clean background.
- The nod at the bench: his head was cut by the top bar; the shot now sees all of him from behind, the bench beyond.
- [WIDE · locked, from behind the bench]: Chase (2040) was a cropped figure at the right edge; the lens moved back up
  the path, so the two on the bench sit against the bay and the bridge and he stands alone on the path, whole, holding
  his elbow; he walks over and sits inside the same locked frame.
- Sitting down: each of the three used to stand *inside* the bench (shins in the seat) and then pop half a metre
  backward onto the seat mark; now they stop just in front of it, turn, and sit back onto it (the seated pose at once,
  eased onto the mark over half a second). [MID · from the front] starts high enough for Luka standing and comes down
  with him as he sits, then the beard comes down under his chin.
- Checked and kept: the three-shot, every close of the story (played straight), the scorch-mark insert, the slate +
  voicemail card, the closing locked wide with the storm building.

**2.4 — Every Sunday** (most care: Rue's only appearance).
- The door: kept — Rue in the doorway between the two boys' shoulders (cardigan, glasses on his head, the brick phone in
  his pocket, the LADS corkboard behind him), the 3 s look, then his close for the beard.
- Rue's examine lines in the front room are shot from Chase's eyeline: under the cut the two face each other at a
  talking distance (if Rue is right beside him he steps onto open floor), Luka steps out of the line, and Rue is a
  single, head and shoulders, with the room behind him (the old lens could sit behind a chair or between them).
- The kettle: `kettle: { steps, boil }` — Rue's "Put the kettle on? ^ I've just put it on. You can put it on again."
  in its own shot, then the ask, the kettle boils and steams from its own spout; the hand-rolled save is gone.
- The tea: a new master (Luka's Santa profile at the left, Chase across the coffee table, Rue in his armchair at the
  right, the louvres and the verandah behind) — the set's `s24_tea_wide` sat right behind Luka's head. The boys'
  two-shot is wider (Chase whole). Rue's look through the louvres is from standing height, so Chase (2040) at the gate
  reads over the verandah rail (the seated eyeline saw him only through the dowels). Rue's long "I promoted you…" close
  sits a little lower so his face stays clear of the three-line box (the '87 Polaroid copy beside him on the mantel).
- The gate: Rue comes down his stairs with his hand sliding down the rail (`walk_rail`) and watches them go with a hand
  on the verandah rail (`hand_rail`).
- The hand-over was two arms waving past each other at the top of the frame: now Rue and Chase (2040) square up across
  the gate under the cut, Rue's hand comes out over the top rail with the brick, the scarred hand comes up under it,
  the phone passes and Rue's hand stays over his — its own insert, high from the north side (a side-on lens has the gate
  post between it and the hands; the set's `s24_hands` sees Rue's back) — then they step back for the closes.
- The verandah wide is from behind Rue, high under the roof (the set's `s24_verandah_wide` sat in his hair).
- Checked and kept: the house wide and the walk in, "I'll wait here.", the bell, the corkboard + LADS card, PUDDING
  (COPY 4), the brick phone + trill + Record?, the Polaroid copy, the 2036 card, the tin, the bics beat, every close
  of the tea and the gate (played straight: no gag, no sting), "Go on. ^ Yes."

**2.5 — Are You Sure You're Sure?** (the laughing-crying beat).
- Chase (2040)'s explanation was shot from behind him (the set's `s25_explain`), then from a lens that put a roadside
  pine on his head: now past Chase's back and Luka's shoulder, the pine in the gap between them.
- The chip prompt sat over Chase (2040)'s face in its close: it now floats beside his head (frame-left, his eyeline),
  and he faces the checkpoint before it (a `{ face, wait }` step).
- "Error 4044.": the scan drone's white cone hung across Luka's face in his close; the drone bobs up under the cut.
- The laughing-crying beat: `laugh_cry` (the engine expression) replaces the content's tears hack and its reset. The
  [WIDE] was a small figure in the middle of the road: now a wide lens two metres ahead of him, his face (laughing,
  tears) at frame-left and Luka and Chase laughing on the other scooter at frame-right, the bridge running away behind.
- The dock: autoplay's followers trail by themselves now (`player.trail`), so the scripted follower walks are gone; the
  roam's own dock check (`docked()`) is shared by the play watcher and auto().
- Checked and kept: the checkpoint wide, the gantry AR, Teddy and the NO button, Role Play and the reason cards,
  the scan pops, the gate lift, the alarm and the peel, the side-on track, Luka's and Chase (2040)'s closes,
  the drones at the edge, the boardwalk, the Manager cutaway.

**Bridge set.** `SETS.bridge.render(alpha)` places the scooters, cars and pelicans between ticks (the engine calls it
before drawing; the `world.render` wrapper and its `hooked` flag are gone); `update()` still places them while the
set isn't current. Same visuals (2.5 and the credits' bridge frames checked).

## Cleanups (ledger)

Applied: 2.1 `chase40_tee`, `SETS.flat.lie(true)` + `s21_couch_lie` / `s21_bed_lie`, `s21_dawn_wide`; 2.2
`s22_drone_piano`; 2.3 `s23_plaque`, the `urn_w` save; 2.4 `kettle: { steps, boil }`, `walk_rail` / `hand_rail`; 2.5
`laugh_cry`, autoplay follower walks dropped; bridge `render(alpha)`.
Kept as is: `s21_box` (its lens loses the kneeling Luka's head above the letterbox), `s22_piano_cam` (higher and wider
than the mirror two-shot needs: the faces read small).

## Verification

On the `--mine` build (my three files):
- `node tools/check-lines.mjs` → 1123/1123 present (and `--scene` for 2.1–2.5: all present).
- `autoplay=1&fast=1&speed=8&scene=2.1&stop=2.5` → DONE, 0 errors, 0 warnings.
- `scene=C&stop=C&ending=A` (the credits' bridge frames) → DONE, 0 errors, 0 warnings.
- Real-time runs (speed 2) of every scene → DONE, 0 errors, 0 warnings.

## Requests for other owners (optional, low priority)

- **rue_house** — anchors content no longer uses because the frame was wrong with the blocking: `s24_tea_wide` (sits
  behind Luka's seated head: a red Santa-hat blob in the corner; content: from `[-4.2, 4.25, -4.7]` → `[-3.05, 3.1,
  -0.7]`, fov 62), `s24_verandah_wide` (inside Rue's hair at `s24_rue_watch`; content: `[-2.3, 4.45, 0.75]` →
  `[14.0, 1.6, 16.5]`, fov 46), `s24_hands` (sees Rue's back; content: `[1.05, 2.0, 12.95]` → `[-0.15, 1.05, 13.22]`,
  fov 30, with Rue at `[-0.15, 0, 12.7]` and Chase (2040) at `[-0.15, 0, 13.75]`), `s24_louvre_pov` (the seated eyeline
  sees the gate only through the dowels; content stands: `[-3.2, 4.35, -0.4]` → `[-0.35, 1.5, 13.95]`, fov 14). If
  the set wants them to be the reference lenses, take content's values.
- **bridge** — `s25_explain` frames Chase (2040)'s back at the start marks; content: `[7.4, 1.6, -44.9]` →
  `[9.7, 1.45, -40.9]`, fov 42 with him turned to `[7.9, 0, -42.6]` (the Norfolk pine at (20.5, −8) stands behind any
  head on the old line).
- **flat** — `s21_box`: content's lens is `[-2.2, 1.55, -3.95]` → `[-1.4, 0.88, -5.35]`, fov 50 (Luka's face + the box).

## Not fixed / notes

- 2.2's bay shot: the Parade's Christmas tree sits in the middle of the lane's opening; the bridge reads on the horizon
  beside it (the lane walls leave no cleaner angle).
- Under autoplay a hotspot is triggered where the player stands, so some examine lines in the test frames are said
  away from the thing (e.g. 2.1's kettle); in play the player walks up to it.
