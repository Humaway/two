# 17 — Polish pass: Act Three (3.1–3.7)

Files: `src/68-content-3-1-3-2.js`, `src/69-content-3-3-3-6.js`, `src/70-content-3-7.js` (+ my ticks in
`docs/REQUESTS.md`). Sets used: hq_atrium, hq_floors, hq_top, valley (3.6's two cutaways, not mine), hq_roof.
Commits: `631fa97` (3.7), `207ae00` (3.5, 3.6, the 3.3 badge lamp), `6cbb1f2` (the resumed cleanups + 3.3 work in
progress), `6034947` (3.1), `a6bc286` (ledger), `15f059c` (3.2), and the commits after it (3.3, this report).

This pass was done in two sittings: the first agent shot and fixed 3.7, 3.5 and 3.6 and was then lost to a container
restart with its 3.1–3.4 edits uncommitted; I judged those edits (kept: all of them), committed them, and did 3.1–3.4,
the final checks over 3.1→3.7 and this report.

## Method

A cut-aware harness (a scratch copy of `tools/run.mjs`, not committed): it wraps `cam.shot` and takes one frame 0.6 s
after every cut and one every few seconds inside long shots or roams. Each scene was played in real time
(`autoplay=1&speed=2`, `&mgskip=1` in 3.1 so Blend In / Secret Santa skip after their intros — both had been shot
whole in an earlier real-time run) at 1280×720 on a `--mine` build, and read cut by cut from contact sheets (full frames
where it mattered). Fixed, rebuilt, re-shot.

## What changed, per scene

**3.1 — Mandatory Fun.**
- The countdowns: both started at 01:58:00 with the scene, so the facade insert read 01:57:46 and the wall 01:57:36
  (the script and the HUD say 01:58:00). `dressTower` now starts them a few seconds ahead: the facade reads 01:58:00
  as the push lands on it, the wall as the atrium opens, and both keep counting down (no jump between shots).
- [WIDE · the atrium] tilts down from the MANDATORY FUN banner (it sat above every frame) to the tree, the choir, the
  countdown.
- [TRACK · the three at the entrance]: the side-on track lined them up — Luka was hidden behind Chase for the whole
  walk. Now low, just ahead and east of them, backing off as they come: three faces, the invitation in his hand; it
  cuts before the doors so the Door Drone's lens sees them arrive.
- "Guest: LUKE, plus two": the computed close sat under the drone's light (a cyan blob filling a corner; its first frame
  was the back of his head). Now the guest and the drone face to face, side on, the drone's screen in frame; "…Thanks."
  is a close from the east, clear of the drone.
- Nadia: the hand-over is side-on (`s31_nadia_mid`; over Luka's back the parcel was hidden); "Merry Christmas, Santa."
  was still on the over-her-shoulder lanyard shot (she stands 0.7 m from him after the loop and the close sat on his
  side): a closer, wider-yawed close on her face.
- The service lift: the reader insert (the set's lens was all knuckle once his hand came in) is his profile at the
  reader; "Chase (2040) stares at the speaker" is from under his chin with the speaker over him (it was a ceiling with
  a chin in the bottom edge).
- Kept (checked): the crane, the meter, the crackers, the Door Drone, the invitation card, the whisper OTS pair, the
  lanyard desk, the Fun Monitor's arrival, Nadia's closes and the loop, the lift entry, the lift's last frame. Blend In
  and Secret Santa (49-mg-blend-in.js) read well from the set's high cams (beams, festive tags, badges, Chip View).
- Cleanup: the set's `invite` prop.

**3.2 — Spotless.**
- L12: the car's lens had Luka's Santa hat filling a corner; for that shot he stands in the car's back east corner.
  The doors-open frame with the three reflected in the white floor (hint 5) is unchanged. The guitars' two-shot was
  shot through the cage (black guitar tops along the bottom): the lens now looks over it. "For later." swings round the
  side of the headphones he holds up (they covered his face).
- L21: checked and kept (the landing, the sealed shutter, the PA close, the reveal, the jack/cord/Wiring/Hack, the
  interlock pop-up, the valves, the fog, the hatch, the climb). The aisle cams read the patrols well: blue cones, amber
  with a "?" when someone is seen, Chip View's AR trail and ads.
- L30: the PA moment ("Chase. ^ Go home. ^ Please.") had three black faces turned up in the dark hangar: the spot now
  comes from up by the speaker onto them (back to `lift30` after). The hangar reveal, the stealth (lures, M1, patrol
  routes) and the closes are kept.
- The private lift: after "Santa's got roof access." Luka walked out of his own close and left it empty for ~3 s; it
  now cuts to the doors' lens for his step to the panel. The panel card, the reader, the car and the ROOF pop-up kept.
- The roof: the crane started behind the Yes letters (their tops a yellow blob in the corner): it starts south of
  them. The hatch shot eases up as he straightens (his head was cut). The lift doors, the facade countdown, the unmask
  at the sleigh, "Right." and the descent are kept.
- Cleanups: `spawnDrones(floor)`, `reset()` after `dress32`.

**3.3 — The Manager.** (the first agent's uncommitted work, judged and kept: the wider, lower WIDE from behind them;
the two Lukas the length of the office on a long lens; the orbit under its own spot in the dark by the north wall;
the two Chases face to face side-on; the console's lamp for the typing; the USB-C insert ending on the set's
`usb_port` lens.)
- The `mgr` spot now stays on him from the badge insert through the reveal and the talk (he was dark at the far end of
  the long frames); the glass lamp takes over when he walks to the glass.
- Hint 1 paid off: the glance was a small figure in a dark frame; now a MID with him at frame-left and the empty chair
  in the right foreground.
- At the glass his face was a close-up filling the frame from 0.6 m (the glass is 0.75 m in front of him). Now: "I rang
  him…" from outside, through the glass, onto the face he turns to the city; then his two profiles (from the
  east; from the west with the room and his past self behind him), head and shoulders.
- "Every Sunday" / "You kept paying for it": the long-lens OTS framed him small and dark (the lens clamps at 12°);
  now 6°, waist up.
- Kept: the high wide (the prologue's angle), the pop-up with its empty NO, the hatch ladder drops, the back of the
  hood, "Take the hood off, Luke—", the turn, the badge insert (1158 reads), Chase's and Luka's closes, his own badge
  turned over, the hood coming down with the name glitch, the top-down, the rain on the glass, every close of the
  dialogue, the turn back with the drones, the thumbs card, ACCESS GRANTED, every drone red.

**3.4 — 85%.** Played in real time (the boss, 51-mg-boss.js): the tracking camera keeps Luka at the console and the
active Chase in frame; drones, cones, lures and the Coat read; the barks land in the corner box by hack %. Nothing to
change in my file (`dress34` hands 3.3's last frame to the boss camera).

**3.5 — 99%** (first agent, `207ae00`). Played straight, no gag, no sting: his close-ups off the pop-up's glare, the
desk and the eye in their own light, his view of the photo, the [YES] + the empty slot ECU, the flick against the
glass, the low wide close on the body at the wall, both Chases staring across at him, the two Lukas from the glass
side, the turn from the prologue's corner, the ring from behind the console; engine `still` / `hurt_stand`, `rig.ghost`
for the erased hand over the pop-up's YES.

**3.6 — two** (first agent, `207ae00`). The two-shot with his face and the slot, Luka limps, a closer ring wide, "Your
call" / "He did" closes, the mall from above over the crowd; `phones_off`.

**3.7 — Storage Full** (first agent, `631fa97`). Engine anims and set marks/anchors; recomposed frames (the Remote from
inside the ring, shot-reverse for the bandage lines, the parapet two-shot with faces, a real close on Chase (2040), the
two Lukas face on, a static JARVIS-CAM that keeps all four faces, no cropped Yes letters). The Choice plays straight.

## Cleanups (docs/REQUESTS.md, "Content cleanups now possible")

All Act Three items are applied and ticked:
- 3.1/3.2: the set's `invite` prop (`hold('chase40')` / `home()`, homed on `flow:stop` too; 3.1's own card mesh is
  gone), `SETS.hq_floors.spawnDrones('l21' | 'l30')` (3.2's local `spawnDrone` is gone), `S.reset()` right after
  `dress32` (on Continue nothing slides on arrival).
- 3.3: `lamp('mgr')` for the badge insert (and now through the reveal).
- 3.5: engine `still` / `hurt_stand` with explicit `expr` (no wrappers), `rig.ghost(['handR', 'foreR'], k)` for the
  erased hand. 3.6: `phones_off`.
- 3.7: engine anims (`kneel_work`, `lean_rail`, `wipe_face`, `hand_rest`, `peer`, `limp`, `lean_back`), the set's
  `s37_st_*` marks and `s37_crane_a` → `s37_crane_b`, no one-tick waits, no manual seat resets, no bar slide.

## Verification

- `node tools/check-lines.mjs` → 1123/1123 present; `--scene` 3.1 28/28, 3.2 4/4, 3.3 61/61, 3.4 18/18, 3.5 21/21,
  3.6 13/13, 3.7 55/55.
- `node tools/run.mjs --file out/p-act3.html --q "autoplay=1&fast=1&speed=8&scene=3.1&stop=3.7&ending=A"` → DONE,
  0 errors, 0 warnings; the same with `&ending=B` → DONE, 0 errors, 0 warnings (the Choice runs in both).
- Real-time (`speed=2`) runs of 3.1, 3.2, 3.3 and 3.4 on the final build: 0 errors, 0 warnings.


## Requests for other owners

- **art (04-art.js)** — the `desk` look is a man ("DEV · FRONT DESK"), but 3.1's script says "*(to the woman at the
  desk)*": make the look `fem: true` (any hair style; the name badge can stay).
- **hq_floors (20-set-hq-floors.js)** — L30 is very dark from the gameplay cams: the drones and their cones read, but
  Luka's cover (the M1 charging rack on its rail) and the private lift (doors, MANAGER ONLY) are hard to find. A touch
  more hemi in env `l30`, or emissive edge strips on M1 and round the lift doors, would make the stealth goal and the
  cover readable.
- **hq_top (21-set-hq-top.js)** — optional: the `usb_port` insert is near-black apart from the port's ring (the
  console's east face gets no light); a faint rim/emissive on that face would let the console's shape read around it.
- **hq_atrium (19-set-hq-atrium.js)** — optional: the `door_drone` mark hovers at y 1.9, at the guests' eye height 0.7 m
  in front of them, so any lens in front of them sits under its light; 3.1 now frames around it (side-on), nothing
  needed unless other content uses that spot.

## Not fixed / notes

- The 3.2 roof hatch shot was re-aimed once more after the last real-time capture (the look rises to his head as he
  straightens); the fast runs cover it, no fresh frame of it.
- The harness in this pass is a scratch script (not committed); `tools/run.mjs --shots` gives the same pictures on a
  time basis.
