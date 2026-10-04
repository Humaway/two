# 20 — Polish pass: Act Two, second half (2.6–2.10)

Files: `src/66-content-2-6-2-7.js`, `src/67-content-2-8-2-10.js`, `src/18-set-valley.js` (additive: anchors re-aimed to
the blocking, a dawn layer on the Starlight's high window, three env tweaks for the Starlight's own envs) (+ my ticks in
`docs/REQUESTS.md`). Sets used: sandgate, train, valley. Commits: `bb72bcf` (the resumed pass: the crashed agent's
uncommitted work, judged and kept), `f5eed0d` and `3501a15` (real-time QA fixes), `e29e9ae` (ledger), and the commit
carrying this report (the last door fix).

## Method

Resumed after a container restart. The previous agent had left ~330 uncommitted lines across my three files and five
screenshot runs in `out/p-act2b-*` (its last one, `r5`, stopped mid-2.10 when the container went down; it was built from
the current 67/18). I read the whole diff against the script and the ledger, checked it against its own frames (`r4`
for 2.6–2.7, `r5` for 2.8–2.9), kept all of it, built `--mine`, ran check-lines and a fast 2.6–2.10 autoplay plus the
3.3–3.6 re-test (the valley set is shared), and committed it at once.

Then every scene was looked at in real time (`autoplay=1&speed=2`, 1280×720) through the previous agent's shot-aware
harness (`out/act2b-shotrun.mjs`: the clock pauses 0.8 s after every cut and every few game-seconds between, one
screenshot each, an index of the lens and the line on screen), and where a frame was wrong a probe session
(`out/act2b-probe.mjs`: the build booted once, frozen at the step, actors placed by hand, candidate lenses screenshotted
side by side) picked the replacement from real frames. Fixed, rebuilt, re-shot.

## What changed, per scene

**2.6 — Snag.**
- Closes are a little wider (1.2–1.3 m: chin and collar inside the bars, nobody's face cut by the top bar), the Santa
  close sits just above the queue's heads, the "He's not even on the network" two-shot is turned toward both Chases'
  faces (it was the backs of their heads from the street), "…It's not Luke." is from his right (Luka no longer stands
  in his shoulders).
- The invitation: Luke puts the tongs down first (they were still in his hand under the card), takes the card out in
  his right hand and holds it up with the engine's `hold_card { show }`; the "Plus two" two-shot is from the table's
  front (his face as he holds it out, not his back).
- "They go": the shot from the street side had Chase (2040)'s back filling the middle of the frame as he set off; it now
  looks down from higher over the A-frame sign: Luke at the table, the sign, the three heading for the station.
- The exit WIDE: Chase (2040) walks east of the A-frame sign (he crossed it). The "second too long": Luke stops, turns to
  Luka (`{ face, wait }`), and his face gets its own close before the head shake.
- The sign examine is a tighter push.

**2.7 — Shorncliffe Line.**
- The fare gate: Jordan's bonus card comes out of Chase (2040)'s coat in the wide, taps, and the reader close shows
  3 FARES · $4 (the card is now his own painted `attach.card`).
- "Is Cross River Rail finished?": Chase turns to him in a close from the front (it was the back of his head in the
  three-shot).
- Luka dozing with the beard over his eyes: low from the aisle, level with his slumped head (from above, the lens saw
  only the Santa hat; from the facing seats it sat inside their passengers). Chase waking him and the reindeer man:
  the lenses are higher and wider (faces, not the tops of heads).
- 2.7_talk opens on Chase asleep against the window from under his lolled head (his face, the earbud); the locked
  side-on two-shot is the set's `s27_talk_two` (unchanged, it was right).

**2.8 — Quiet Hours** (the stealth).
- The crane and the TRACK: the track is the set's `s28_track_a` → `_b`, now leading the three down the mall on the
  café side and ending 3/4-front at their hearing marks, so the whispered lines play on faces.
- Chase (2040)'s "He stops dead" close is the set's `s28_c40_close` (his face as he turns to Mia).
- Mia's "third one this month" is low: Mia, the bench and the pole going up to the Safe Box.
- The stealth reads from the roam cam: the noise drone at its post with its cone on the ground, the Safe Box on the
  pole above it, the café tables (the lure) across the mall, the two high drones overhead (no cones: they only come down
  when the Signal fills). Checked frames: the code in Chip View (the AR card), the lure (the drone floats over with a
  "?" and its cone collapses to a disc on the table while Luka climbs, the bark exchange on screen), the keypad.
- The phone drop: the set's `s28_cafe_table` looked down at the bare table past Chase's elbow; the lens is now across
  the table at him (his face, the phone in his hand over the table, Mia on her bench behind), mirrored when he comes
  from the east side. The lure glide that follows starts clear of table D's umbrella.
- The Starlight: the three stop where the interior wide (`sl_wide_dusty`, now from the bar end: the stage door, the
  floor, the stage) frames them, both on the way in and at 2.8_end; the dusty env is a little brighter (they read by
  torch), and "Finish it, yeah?" waits for him to turn before his close.
- Cleanups (all three ledger items): `DRONES.lure(…, { transfixed: true })`, `goTo(…, { y })` for the swoop's legs and
  the Signal descent, and the plain `keypad` mini-game with `title` / `prompt` / `okText` / `badText` (the
  `safebox_keypad` wrapper and its DOM relabel are gone).

**2.9 — Lights Out** (played straight).
- The floor: Luka takes the brick phone from sitting (shuffled over), not from a kneel that put his head out of the low
  locked frame. Leaving the coaster on Chase's chest is framed from above, Luka kneeling over him.
- The stage door: Luka stood *through* the shut door in the opening MID (he was placed 0.15 m behind its plane, so his
  chest showed in front of the leaf). He now waits behind it (far enough that his pushing hands stay behind the leaf too): the door swings open on him as
  he pushes the bar, he steps into the doorway
  with the rain in front of him, "Where are you going?" comes from behind and he turns back into the dark before the
  REVERSE. Chase waits deeper in the wing while that shot runs (he was visible through the open doorway behind Luka,
  and the line is "off") and is on his wing mark under the cut to the REVERSE.
- The REVERSE, Luka's closes and the INSERT are the set's (re-aimed) `s29_reverse`, `s29_luka_close` (from inside: his
  face, the wet street behind; the door leaf no longer blocks it) and `s29_hands`; the side-on two-shot is from the wing
  (both profiles, the doorway's light behind Luka). The long beat is a narrow lens on the doorway from across Ann St.
- The brick hand-off: both reached past each other over the brick; Chase is a step back under the cut so the two hands
  meet over it.
- [CLOSE · Chase (2040), in the dark]: the set's `s29_c40_dark` (re-aimed: from above a face lying on its back, nudged
  toward his feet so it reads upright); content's own `faceCam` maths is gone. He sits up in a short glide.

**2.10 — 3:00 am.**
- The opening WIDE (`s210_wide_stage`) is from the stage lip: Luka asleep, the desk with both faces, the bar.
- The promise's closes, "…I will.", the slide of the slate, the sequencer (its own lenses: `s210_desk_two`,
  `s210_c40_close` with the tears at the bridge, `sl_clock` on each ONE MORE PASS), EXPORT, "Backup.", the headphones
  and "Not yet." checked frame by frame. The sequencer now starts on the held `s210_desk_two` lens (no ease back to the
  room camera in between); after it Chase's headphones are on the desk, not on his head.
- The locked WIDE (`s210_locked`, from behind the desk end: the desk and the amp, Luka on the floor, the stage and the
  high window): the `dawn` env now fades the window's neon patches into a grey-blue daylight layer on the floor and a
  grey-blue wash over the glass (both black/no-op in every other env), so "a grey-blue dawn starts" reads in the
  window as well as in the room.

## The ledger (docs/REQUESTS.md)

- **valley** anchors (Engine second batch) — ticked: `s28_track_*`, `s28_c40_close`, `s29_reverse`, `s29_luka_close`,
  `s29_hands`, `s29_c40_dark` re-aimed to the blocking and used by 2.8–2.9; `sl_wide_dusty`, `s210_wide_stage`,
  `s210_locked` re-aimed too. None of them is used by 3.3–3.6 (grep of `src/69-content-3-3-3-6.js`: 3.6 only switches
  to the valley with `env: 'lit'` / `dress('lit36')`); 3.3–3.6 re-run clean after the set changes.
- 2.6 sample spot `s26_sample_sizzle` — done. 2.6 `rig.attach.card` — kept as is (`luke40` has no `card` attachment,
  and the invitation is one card passing from Luke's grip to Chase's, so it stays one content mesh; Luke holds it with
  `hold_card`). 2.7's bonus card now is Chase (2040)'s `attach.card`.
- 2.7 `say('passenger', …, { actor })` — done. 2.8 `lure({ transfixed })`, `goTo({ y })`, keypad params — done.

## Verification

- `node tools/check-lines.mjs` → 1123/1123 present; `--scene` 2.6 34/34, 2.7 26/26, 2.8 39/39, 2.9 27/27, 2.10 34/34.
- `node tools/run.mjs --file out/p-act2b.html --q "autoplay=1&fast=1&speed=8&scene=2.6&stop=2.10"` → DONE, 0 errors,
  0 warnings (after every commit).
- The valley set re-test: `scene=3.3&stop=3.6` (fast) → DONE, 0 errors, 0 warnings.
- Real-time shot runs (`speed=2`): 2.6–2.7 and 2.8–2.9 (the previous agent's `r4` / `r5`, current code apart from the
  fixes above), 2.10 in full, 2.9 again after the door and hand-off fixes (stopped at 2.9_lights_out: the machine was
  slow and 2.10 had been shot already); probes for each replaced lens (2.6 "they go", 2.7 the doze, 2.8 the phone drop,
  the 2.9 door frame by frame, the 2.10 dawn on the locked wide and on the glass).
- Skip / Continue: every new `do` step is a placement or a lens (lenses do nothing while skipping; the door's actor
  placements happen under skips too); 2.9's door move is a `{ move }` (teleports on skip).

## Requests for other owners

- **art** — `luke40` has no `card` attachment (`attach: ['food']`): add `'card'` so 2.6's invitation can be his own
  painted `attach.card` with `hold_card { show }` (added to the ledger; same as the open `jordan40` item).
- **docs** — `docs/sets/valley.md`'s anchor rows are out of date for the anchors this pass re-aimed (code wins):
  `s28_track_a/_b`, `s28_c40_close`, `sl_wide_dusty`, `s29_c40_dark`, `s29_reverse`, `s29_luka_close`, `s29_hands`,
  `s210_wide_stage`, `s210_locked`; the `dawn` env row and the `window_light` row (the dawn layer `vl_patch_dawn`, the
  glass wash `vl_dawn_glass`; `ENV_WIN.dawn` is now `0x6a7898 × 0.25`).

## Not fixed / notes

- 2.6 "Here.": a sliver of Chase's shoulder stays at the right edge of Luke's close (the two Chases stand on his eyeline
  to the card; any lens that loses them turns Luke into profile).
- 2.8 Starlight: the hotspot closes on Chase (2040) are computed at the moment (followers stand wherever the trail left
  them), so one can have Luka's Santa hat at the frame edge.
