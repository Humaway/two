# 16 — Polish: the endings (A1, A2, B1, B2, C, PC)

Final polish pass over `src/71-content-ending-a.js`, `src/72-content-ending-b.js`, `src/73-content-credits-pc.js` and
the third-batch items in `src/10-set-reddy26.js`. Every scene was shot in real time (`speed=2`, a frame a second) and
read frame by frame; B1, B2, A1, A2 and PC were re-shot after the fixes (B1 twice). No line, speaker or `^` beat was
touched; no new jokes, no stings on the honest moments, no stares added.

## What I fixed, per scene

### B1 — "Again" (first real-time review; ledger "Visual QA")
- **Goodbyes / the Chases' exchange**: the pairs faced each other square-on, so every two-shot showed one face and one
  back of a head. Both pairs are cheated 0.2 rad toward their lens (`E_IN/E_OUT/W_IN/W_OUT`): both faces 3/4 in every
  two-shot. Luka (2040)'s closes (`Let them wonder.`, `…Into the fire.`) came round behind his ear: `yaw` −0.55 → −0.7.
- **"Keep your lanyard."**: `LENS_E_TIGHT` cropped both heads off; now the faces and the hands between them.
- **The call**: Chase stood bent double over the Remote (a content `b1_dial` pose, his hand nowhere near the phone).
  He now kneels at it (`kneel_work`, engine) under the set's pre-call lens `s37_check` (over his shoulder onto his
  hands on the brick phone), as 3.7's check. `b1_dial` is gone.
- **The split's right half**: `a1_split_store` framed the counter's end, Luke as a speck and no table. Re-aimed in the
  set (`[8.2, 2.0, -0.8]` → `[5.86, 1.1, -8.45]`): the wrapped Hero Table left, Luke at the till right (A1 uses the
  same anchor). `LUKE_MID` raised over the monitor (his face was half behind it); the sigh close pulled back a little.
- **Home**: they now come up out of the smoke with `rig.fade` (they popped in before). The `[TOP-DOWN]` was a lens
  looking down their bodies from the head end (two faces against a "wall"); now straight down, turned a quarter: both
  of them across the wide frame, heads right, Luka above Chase, clear of the dialogue box (A1's too).
  `[CLOSE · Luka's hand]` aimed at the floor beside him; it is now computed on the knot (straight down over it: the
  knotted strap, his hand, the badge). Luke's `UP_AT_LUKE` moved to his right (his mug hand was a giant blur);
  `FROM_DOOR` is over his shoulder in the doorway (it looked at the floor between them; nobody's eyeline).
- **The dark shop floor**: Luka was a silhouette and Chase sat in mid-air in front of the counter. The table's
  downlight comes from the customer side (both faces read); Chase sits on the counter's front edge (`sit h 1.0`, feet
  down the customer side, humming); `polish { h: 0.95 }` puts the cloth on the glass; the smudge is placed with
  `smudge1At(5.78, -5.62, 2.2)` in front of him and the close looks down at it with his cloth hand stopped beside it
  (new `b1_stop` pose instead of `look_down`, which dropped his hands).
- **The montage**: 2027 uses the set's `a2_ladder` (the same frame as A2's, roles reversed; re-aimed to show the man up
  the ladder head to toe). 2031's poster had the CANCELLED card painted over the set's own CANCELLED poster (two
  posters): the card is gone, the set's poster carries the frame. 2031's corkboard card now sits over Rue's empty front
  room (`b1_room31`) instead of over a second corkboard. 2033 was the backs of two heads from far behind; now frontal
  on the jetty, the two of them mid-laugh (the photo's angle). 2035: the figure in the long coat stood in the empty
  aisle; he now stands behind the last row, hood up, in the right foreground (`still`). 2037: the screens carry the
  caption themselves (`screens_all.caption('THE MANAGER')`), framed on the big screen; the date card is just "2037".
  2040: the kettle was a grey shape behind his coat; now over his shoulder onto the kettle, then an INSERT of its
  screen as he types (NAME YOUR KETTLE: D… E… S), then the low on his face.
- **Match cut**: `HEROIC` → the set's `s12_heroic` (the very lens 1.2 step 1 uses). Checked against
  `scene=1.2&stop=1.2`: same lens, same blocking (Luka at `LUKA_START`, the step back, Chase at `s11_chase_phone`,
  Jordan at `J12`), same Christmas dressing, same time card. The phone rings through the set (`ring(true, { sfx:
  'trill', every: 1.6, … })`, as 1.2). Cut to white before the explosion.

### B2 — "Christmas Morning" (first real-time review)
- The two content-built cups → parade's `coffees.show('both')`.
- `[INSERT · the slate]`: the card sat over a close of his knee; now over the slate in his lap, from above.
- `[WIDE]` (the crowd): from over the railing's east end; the crowd stops in a loose half-ring on the grass behind
  the bench, each facing it (they stopped on the path, side-on, before); the pelican lands on the railing in the
  foreground; the chip comes off an ear.
- `[CLOSE · Chase (2040)] He looks at him.`: the lens was on the wrong side (back of his head); now frontal, Luka
  (2040) at his side.
- `[CRANE]` ended over open water (no bench, no crowd); it now ends with the bench and the crowd in the lower third,
  the pelican on the rail, the bay and the bridge on the horizon, and the TWO title over the water.

### A1 — "Keep"
- Same pair cheat and tight-lens fix as B1 for the goodbyes and the lanyard changing hands (both faces and the hands).
- `[WIDE · the roof]` (Future Luka nods, Chase (2040) breathes out): Future Luka stood hidden behind Luka; the lens is
  now at the ring's north edge: the four side by side round the Remote, nobody hidden.
- The call: the same kneel at the Remote under `s37_check` as B1 (A1 already used the lens).
- `[LEFT/RIGHT]` split: the re-aimed `a1_split_store`, raised `LUKE_MID`, the ring through the set.
- After: "He looks at his hand. The edges of it are starting to fade": his left glove and forearm now dither out
  (`rig.ghost(['handL','foreL'])`) while the whole of him fades to 0.86, under a lens computed on the raised hand.
- Home: the quarter-turned top-down, `TOP_LUKA` on his face and the two lanyards, Luke's eyeline / low angle as B1.
- `Luke` wears the rig's fitted `santa_hat` (the content-parented hat is gone).

### A2 — "Christmas Morning"
- `[TOP-DOWN · Chase]`: the set anchor looked down on both of them from 2.8 m (hands too small to read). Now computed
  straight down over his head, close, rising slowly; the phone card is cleared at the cut.
- Luka's nod close (15) cropped to his chin; now his face and hands.
- Montage frame 2 uses `a2_ladder` (the set frame shared with B1 2027).

### C (credits) and the A-only coda
- The credits mini-game (`src/53-mg-credits.js`, not mine) plays clean; nothing to report.
- The A coda: the counter was so dark that the hands read as orange blobs, and both hands landed on the same spot (one
  on top of the other). A warm lamp over the counter (the spot, restored after), the hands side by side on the
  handset, the shot from the set's `counter_phone` (re-aimed steeper: both hands come in from the sides; no faces).

### PC — "Hold"
- `floor_wreck_wide` (set) is now PC's tested lens (Luke at his desk through the open office door); PC uses it for both
  `[WIDE · locked]` shots. The ladder's side carry lives in the set (`ladder.set('carried')` after `actor.hold`); PC's
  carry maths and its `J_PHONE` are gone; `pc_jordan_phone` = `[7.15, 0, -8.05, π − 0.22]`. Checked in real time: the
  folded ladder rides along his right side, top rail in his hand, then stands open at the Yes wall.

## Set: `src/10-set-reddy26.js`
- Third batch: `floor_wreck_wide` (only PC uses it; 1.3 has its own `FLOOR_LOCK`), the ladder's `'carried'` side carry
  (one-time maths per call, `LAD_CARRY` = the folded ladder's centre at the holder's right side; 1.1 never carries it),
  `pc_jordan_phone`.
- Re-aimed for the endings: `a1_split_store`, `a2_ladder`, `counter_phone` (comments say who uses them).
- Release QA item (coordinator): the backroom tube's 17 Hz flicker now honours Reduce Flashing (`&& !reduceFx()` on
  both flicker branches: steady while the option is on).
- Re-tested 1.1 → 1.2 (fast, clean) and the first seconds of 1.2 in real time (match cut reference).

## Cleanups (REQUESTS.md "Content cleanups now possible")
- A1/B1 `rig.fade` — **done**: A1's `world.adopt` wrapper, boot warm-up and per-rig material copies are gone (the
  file's fade tween now drives `rig.fade(k, wash)`); B1's homecoming uses it too.
- `world.rigsOf` — **done** (A1 finds Future Luka's lanyard via `world.rigsOf('luka40')[0]` when he isn't spawned).
- `santa_hat` on luke — **done** (A1 and B1; both cleanups hide it again).
- `lanyard_held` — **kept as is**: A1 hands over Future Luka's *worn* lanyard (it must leave his chest in the same
  move) and places it itself (badge up in Luka's palm, on his chest on the floor, turning over in A2, looped round the
  coda's wrist); B1's is a *snapped* strap in Luka's left fist (his right hand is on his ribs). `lanyard_held` is a
  whole loop on the right grip: neither scene gains.
- A1 `ring(true, { sfx, every, max })` — **done** (with `'trill'`, the counter phone's 1.2 double trill, in A1, B1's
  call and B1's match cut). Coda → `counter_phone` — **done**.
- B2 cups → `coffees.show('both')` — **done**. B1 `HEROIC` → `s12_heroic` — **done**. 2037
  `screens_all.caption('THE MANAGER')` — **done**.
- Ticked in `docs/REQUESTS.md`: the third-batch reddy26 item, the B1/B2 Visual QA item, and the three endings cleanup
  lines.

## Verification (on `--mine` builds of my four files)
- `node tools/check-lines.mjs` → 1123/1123; `--scene` A1 43/43, A2 16/16, B1 57/57, B2 14/14, C 1/1, PC 11/11.
- `autoplay=1&fast=1&speed=8`: `scene=A1&stop=PC&ending=A`, `scene=B1&stop=PC&ending=B`, `scene=1.1&stop=1.2`,
  `scene=3.7&stop=A2&ending=A`, `scene=3.7&stop=B2&ending=B` → all DONE, 0 errors, 0 warnings.
- Real time (`speed=2`, screenshots every second): B1 ×3, B2 ×2, A1 ×2, A2 ×2, C (ending A, with the coda), PC, the
  opening of 1.2 → all DONE, 0 errors, 0 warnings.
- Skip / Continue: every new `do` snaps under `flow.skipping` (lenses are skipped, tweens snap, the arrive fade ends on
  the originals); dress still comes from flags at step 0; no per-frame allocation added; cleanups on `flow:stop`
  restore `rig.fade`, `rig.ghost`, the santa hat and the coda's lamp.

## Requests for other owners
- **docs (set docs owner)** — `docs/sets/reddy26.md` is not mine: please update its rows for `floor_wreck_wide`
  (`at [6.4, 1.0, -10.0]`, `from [10.4, 2.5, -1.7]`, fov 52: PC only), `a1_split_store` (`at [5.86, 1.1, -8.45]`,
  `from [8.2, 2.0, -0.8]`, fov 50), `a2_ladder` (`at [4.1, 2.25, -11.9]`, `from [6.7, 1.55, -9.9]`, fov 54),
  `counter_phone` (`at [7.55, 1.03, -9.24]`, `from [7.52, 1.9, -8.72]`, fov 34), `pc_jordan_phone`
  (`[7.15, 0, -8.05, π − 0.22]`), the ladder row (`carried` = folded along the holder's right side, call
  `set('carried')` after `actor.hold(ladder)`), and the tube (steady under Reduce Flashing).
- **art (04-art.js)** — optional: a standing side-carry arm pose for a long object (PC keeps its own `pc_ladder`
  right-arm pose; the engine's `carry` loco holds both arms forward, which suits boxes, not a ladder).

## Not fixed / notes
- A1's "looks at his hand" reads (the raised hand dithers at his chin, he fades) but his eyes stay near the lens; a
  dedicated "look at your palm" head target would need an engine look-at for seated rigs.
- PC's climb still uses the timed position change (the `climb` upper-body item is the art/world owner's, as assigned).
