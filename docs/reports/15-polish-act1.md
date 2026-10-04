# 15 — Polish pass: Prologue and Act One (P, 1.1–1.8)

Files: `src/60-content-prologue-1-1.js`, `src/61-content-1-2-1-3.js`, `src/62-content-1-4-1-6.js`,
`src/63-content-1-7-1-8.js` (+ my ticks in `docs/REQUESTS.md`). Sets used: hq_top, reddy26, reddy40, parade, flat.
Commits: `12ba7b2` (P–1.3), `4e02090` (1.4–1.8), and the commit carrying this report.

## Method

A shot-aware harness (a scratch copy of `tools/run.mjs` kept in `out/`, not committed): it hooks `cam.shot` /
`world.split` and takes one frame 0.6 s after every cut, a second ~2 s in, and one every few game-seconds between,
pausing the game clock for each screenshot. Every scene was played in real time (`autoplay=1&speed=2`) at 1280×720
and the frames read cut by cut (contact sheets, full frames where it mattered). Fixed, rebuilt (`--mine` with my four
files), re-shot. 1.3 and the 1.4 roam were reviewed from this morning's real-time captures (unchanged since apart from
the wiring hand-back) plus a fresh real-time autoplay run; 1.1 was also checked at 390×844 (release QA item).

## What changed, per scene

**P — Do Not Disturb.** The SafeSense cursor started *on* the "Scheduled … 11:58" line, hiding the time: it now
drifts in from the right under the empty, button-shaped NO slot and stops just short of YES. The hint-1 MID ("his
shoulder and the empty chair in frame") was framed from behind the desk with half the pop-up in the corner and the
hood lost against the dark room: re-aimed so the hood is a silhouette against the sky between two mullions, the empty
chair at frame-left, the aide drone at his shoulder, no pop-up sliver — the glance now reads. Lenses come from the
set's `glass_popup` / `glass_popup_ecu` / `glass_moon` anchors (same frames). The desk track, the gloved hand on the
face-down frame, the high wide and the back-of-the-hood close were good and are unchanged.

**1.1 — Spotless** (most care: the first playable minutes).
- [CLOSE · the glass]: the old insert was a wall of Luka's forearms; it is now a steep top-down between the 3% phones,
  the fingerprint (×3: `smudge1At(x, z, 3)`) mid-frame, his cloth coming in, room for Chase's finger.
- "Chase." (not looking up): Chase's head, bent over him, was cut by the top bar; the lens backs off and rises.
- The Bon Jovi exchange: Luka's crouched closes had his face high under the bar; lowered (`ly`).
- The ladder: Jordan stood inside Luka for the hand-off; restaged (they face each other, nobody hides anybody). The
  climbs used `{move}` with the `climb` anim, which the engine swaps to `walk` (open engine item): both now set
  `walkAnim = 'climb'` for the move, so Jordan climbs down and Luka climbs up/down the treads.
- First talk ("Still?"): the auto two-shot looked between them at the window; now side-on along the counter front,
  both in profile, the finger up.
- The real conversation: the lanyard beat ("Chase fiddles with his new lanyard") showed a close face only; the lens now
  starts wider/lower on the hands and pushes in to his face for "…And I'm doing screen protectors."
- The Hero Table examine tilts from the four phones up to Luka.
- Every roam interaction (examines, talks, ladder, polish) and the opening now hand back with a **cut**: the 0.8 s
  release glide from a close-up passed through Luka's head (Luka stands just behind every examine lens).
- Cleanups: `smudge1At` (no moving/scaling the set's decal by hand), `monitor2` / `pot_plant` anchors (local LENS table
  gone), `backroom_door.userData.solid(true)` (the content-owned doorway collider and its bookkeeping are gone; the
  watcher only creaks and sets `s11_door` when it opens), P's anchors above.
- Unchanged and good: the crane through the doors, the MID through the glass, the wide on the radio chorus, the low
  ladder wobble, the OTS wobble from below, the Wall cards, the door sign, the JARVIS monitor, the TV, the laptop, the
  clock at 11:58.

**1.2 — Accept the Charges.** First frame (`HEROIC`) unchanged — now built from `s12_heroic` with the same push, so
Ending B's match cut still lands. `TWOSHOT` from `s12_twoshot` (same). `blast({ tree: false })`: the tree no longer
falls inside the slow-motion close; it goes over once, in the real-time wide. The ring is the set's
(`store_phone.ring(true, { sfx: 'trill', every: 1.6, vol: 0.55, max: 4 })`; the content updater is gone).
"…Should we call the manager?" / "It's Luke." used an auto TWO that framed Chase's back; now an explicit two-shot
across the counter's corner (both three-quarter on), picked up a little closer for the Luke argument.
Checked and kept: the BAM wide, the slow-motion close, the upside-down POV, the stare, the collar, "Hey, mate.",
the over-the-counter climb, the brush, the tether scoop and pocket.

**1.3 — Before Lunch.** The Wiring halves hand back with a cut (the box lens sits in front of Chase).
Everything else (the Remote insert, "I've got hand.", the window POV, the split with Des, the white-out, "…Lunch?",
12:04) checked from the real-time capture and kept.

**1.4 — All the Bulbs Are LED Now.** "Dunno. Felt right." three-shot from the machine: Chase was hidden behind Luka;
moved between and behind them so three faces read. The arrival hands over to play with a cut. The heap, Des, the
tilt to four scorch marks, the pointing, the plant, the switch, the roam examines and the Jordan meeting were good.

**1.5 — Cred.** "Done? Already?": the OTS put Chase's head over Jayden's face; now past Chase's left shoulder with
Jayden clear. "Mate. Move.": an explicit two across the counter. The bonus hand-over is a profile two-shot (was an auto
TWO from behind). Chase (2040) now holds **his own `rig.attach.card`** (painted: chip-blue glow, a chip glyph, CRED;
shown by `hold_card`), and the card insert looks over his shoulder onto it (the old one framed his forearm from the
front). Jordan's hand still carries the small content card — `jordan40`'s look has no `card` attachment (request below).

**1.6 — Safety Address.** The old man by Margaret's chair (crying quietly, smiling) was framed on his chin; the close
is now computed from his head at the cut. [TWO-SHOT · Luka and Chase, the only faces without chip lights]: the
auto-TWO showed the back of Luka's head; now a two-shot with both cheated open toward the lens — both faces read.
Cleanups: autoplay's own `until()` → `waitUntil(fn, { skip: false })`; `rig.show('hair_static')` at the zap (with the
soot; a pooled rig's `dress()` resets both on its next spawn); `A16` → the set's `s16_addr_*` / `s16_jordan_close`
marks. The address (the glance on the big screen before he speaks), the pan, the drones in, "Back door.", the zap, the
lure, the roller door, the chip prompt and the pole were good. `&s16fail=1` still passes.

**1.7 — One Foot Off the Ground.** Cleanups: the `Object.assign(CHARACTERS, …)` aliases (now in `01-config.js`) and
the `PATHS17` / `paths()` injection (the parade set has the paths) are gone. The crane hands over to play with a cut.
The crane, lifeguard, track, plaque, the Cloud+ POV, the human moments and the dusk exit were good.

**1.8 — Order of Service** (played straight: no music, one stare, no release; nothing added). The arrival hands
over with a cut. The [WIDE · locked] kitchen frame cropped the balcony's blinking Christmas lights out under the top
bar; it now tilts up enough to keep the light string in frame. The insert of his hands, the order-of-service card, the
locked close, the shot–reverse closes, the millimetre and the exterior were good.

## Cleanups (REQUESTS "Content cleanups now possible") — all ticked in the ledger

| Item | Result |
| --- | --- |
| 63: drop `Object.assign(CHARACTERS, …)` | done |
| 1.5: `rig.attach.card` + `paint` + `hold_card` | done for Chase (2040); Jordan's side kept (no `card` on `jordan40`) |
| 1.6: `waitUntil(fn, { skip: false })`; `hair_static` | done |
| 1.7/1.8: drop `PATHS17` / `paths()` | done |
| 1.1: `smudge1At`, `monitor2`, `pot_plant`, `backroom_door.solid(true)`, P's `glass_popup(_ecu)` | done (+ `glass_moon`; the print at ×3) |
| 1.2/1.3: `s12_heroic`, `s12_twoshot`, `blast({ tree: false })`, `store_phone.ring(…)` | done (1.2's first frame unchanged) |
| 1.6: `A16` → `s16_addr_*`, `s16_jordan_close` | done |

## Verification (on `--mine` builds of my four files)

- `node tools/check-lines.mjs` → 1123/1123 present; `--scene` P 5/5, 1.1 64/64, 1.2 48/48, 1.3 72/72, 1.4 45/45,
  1.5 21/21, 1.6 35/35, 1.7 18/18, 1.8 28/28.
- `autoplay=1&fast=1&speed=8&scene=P&stop=1.8` → DONE, 0 errors, 0 warnings (and again per range after the last
  edits: P→1.3, 1.4→1.8, 1.6 with `&s16fail=1`).
- Real time (`speed=2`, with screenshots): P, 1.1, 1.2, 1.5, 1.6, 1.7, 1.8, 1.4 (arrival) → 0 errors, 0 warnings;
  `speed=4` 1.3→1.4 → 0 errors, 0 warnings (no mid-game shader compiles).
- Script: no line, speaker or `^` touched; Bon Jovi once (1.1), calc/cred once each; stares only where written
  (1.2's 3 s, 1.4's 2 s, 1.8's 3 s); 1.8 gets nothing new. Skip-safety: every new `do` step is a no-op or snaps while
  skipping; every new updater is the set's or scene-scoped. Continue: 1.1's door/smudge come from flags in `dress11`
  (the set's dress resets `solid` and runs first, so `doorShut` re-applies it).

## Requests for other owners (also in REQUESTS.md, "From the Act One polish")

1. **reddy26 (set)** — release QA's portrait blob in 1.1: the ceiling **dome camera** (`cyl(0.12, 0.12, 0.12, 8,
   0x2a2d33, 9.8, 3.12, -1.2)`, static build, ~line 886) is 0.85 m from the **`counter`** zone camera's lens
   `[10.5, 2.7, -0.8]`. Landscape keeps it just outside the frame; on portrait phones `fitNarrow` opens the vertical FOV
   toward 100° and the dome fills the top-left of every counter-zone frame (seen on the 1.1 roam's first frame at
   390×844, and it applies to any scene roaming that zone). Move the dome away from the lens (e.g. (8.6, 3.12, −2.6))
   or lower the lens a little (e.g. `[10.5, 2.45, -0.6]`). Content can't compose around a zone camera (a content
   `cam.override` would replace the set's zoning for the whole roam), so 1.1 is left as is.
2. **art (04-art.js)** — add `'card'` to `jordan40`'s `attach` list, so 1.5's bonus hand-over can use
   `rig.attach.card` + `hold_card` on both sides and 62's small content card for Jordan's grip can go.
3. (Existing open item, engine) `climb` as a move's loco: 1.1 works around it with `walkAnim = 'climb'` for the ladder
   moves; nothing needed for Act One.

## Not fixed / notes

- The portrait dome (request 1).
- 1.5's card insert reads as "a little glowing card" in his hand at an angle (the face is legible as CRED only up
  close); acceptable, not a readable INSERT (the script doesn't ask for one).
- Shots that are framed by the engine's size kinds (OTS/CLOSE/TWO) and looked right at 16:9 were kept; at very narrow
  screens `fitNarrow` keeps the horizontal field, so they hold.
