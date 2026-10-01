# SET `valley` — Fortitude Valley in Quiet Hours, Ann Street, and the Starlight (2040)

File `src/18-set-valley.js` · `SETS.valley` · Scenes **2.8, 2.9, 2.10** (+ the **3.6** street cutaway, the **credits**
vignettes "the Valley in neon" and "the Starlight stage"). Same contract as Rue's `SETS.reddy`
(`ref/rue/05-set-reddy-optus-redcliffe-2026.js`): `{ env, build, marks, anchors, cams, zones, colliders, floor, props,
ambience, update }` plus the extras in §12 (`dress`, `lamp`, `neon`, `paths`, `ar`, `creaks`) and the **shared
builders** `VG`, `tower()` and `skyline()` that `hq_atrium`, `hq_top` and `hq_roof` use (§12.3–12.6).

---

## 0. Decisions (read first)

1. **One world frame for the whole Valley: the Valley Grid (VG).** Metres, **Y up**, **+X = east** (along Ann Street
   toward New Farm), **+Z = south** (down the malls, toward the river and the Story Bridge). Ann Street's centreline is
   `z = 0`; Brunswick Street Mall's centreline is `x = 0`. This set's world coordinates **are** VG. `hq_atrium` also
   uses VG directly; `hq_top` / `hq_roof` place their far views in VG (§12.6).
2. **Geography (game, not survey).** Ann Street runs east–west. **Optus Tower stands on the north side of Ann Street
   directly at the head of Brunswick Street Mall**, its south face (with the huge countdown) looking straight down the
   mall. **The Starlight** is two lots west of the tower on the same side; **its stage door opens onto Ann Street right
   opposite the Chinatown gate**. HQ is literally up the street from where they sleep. Chinatown Mall runs south from
   Ann Street parallel to Brunswick Street Mall, 30 m west of it.
3. **Three regions in one scene graph** (all always registered, visibility by `dress()` for cost only):
   **M** — the street: Brunswick St Mall, Ann Street, the Chinatown gate pocket and its lantern vista;
   **S** — the Starlight interior (a closed box; walls are real, so interior and exterior can share a cutscene, e.g.
   the 2.9 stage-door shot); **F** — far: the Optus Tower (`tower()`), the city (`skyline()`), sky, storm.
4. **Neon is physical; words are AR.** The Manager dims neon to "safe brightness" (×0.35) — he doesn't remove it.
   Neon *shapes* (cocktail glass, guitar, dumpling, microphone, stars, fish) glow in the real world. The only neon
   **words** are **NAP CLUB** (lit, dimmed) and the Starlight's vertical **STARLIGHT** blade (dead until 3.6 / credits).
   Every other sign, shop name and street name is a blank panel with a tiny AR glyph (as on `parade`); its text is in
   Chip View (§12.8). Physical readable text on this set: NAP CLUB, STARLIGHT (blade), the Safe Box keypad and the
   pole's **40 dB** meter, Mia's hand-lettered QR tip sign, the carved **CHINATOWN MALL** gate plaque (English only — no
   CJK glyphs, so no font dependency), the **STAGE DOOR** stencil, the gig posters, the coaster, and the tower's
   **QUIET IN hh:mm:ss** facade countdown.
5. **Yes yellow (#ffd21f) appears only on the tower's Yes sign** and, in 3.6, on the facade band after it reaches zero.
6. **Rain is set-owned.** The set builds its own `rain` (`makeRain`) with a 24 × 18 m box and **moves it** per state
   (`rain.userData.at(x, z)`), so rain never falls inside the Starlight and is dense where the lens is.
7. **`dress(state)`** runs automatically when `state.scene` changes (`AUTO` map, §12.1) and can be called by content.
   **`lamp(name)`** places the one spot light (`world.torch`) for that moment (§3.4).
8. **Walkable areas are small.** 2.8's puzzle is confined to the mall (x −7.6…7.6, z 11.3…56.8). After the puzzle
   (`transit28`) the mall head opens onto Ann Street's footpaths, the two zebras and the Chinatown gate pocket, so
   content may run the walk to the Starlight as a short roam *or* as a cutscene (both are supported). The Starlight
   interior is the only walkable area in 2.8 (end), 2.9 and 2.10.

---

## 1. Purpose and scenes

| Scene | Region | Story time | Env preset(s) | Dress | What happens here |
| --- | --- | --- | --- | --- | --- |
| 2.8 "Quiet Hours" (street) | M | Sun 23 Dec 2040, 19:30, dry (the 4 pm storm has passed; streets wet), storm grumbling | `quiet` | `quiet28` → `transit28` | CRANE down past the tower's countdown into the Valley; TRACK the three down the mall; Mia on her bench; the noise drone confiscates the ukulele into the Safe Box on the lamp pole; the idea-engine ORBIT; PLAY "Get the ukulele back" (AR code / phone lure on a café table / Luka climbs); sample **Ukulele**; Mia sends them to the Starlight |
| 2.8 (the Starlight) | M → S | ~20:10 | `quiet` → `starlight` | `dusty28` | the walk past the Chinatown gate, across Ann St to the stage door (cutscene or roam); short PLAY inside: posters, desk, stage, green-room kettle (save) |
| 2.9 "Lights Out" | S (+ M at the door) | Mon 24 Dec 2040, 01:10, storm, heavy rain | `lights_out` (inside) / `annst` (door exterior shots) | `night29` | the locked low floor setup; PLAY "Leave" (the sneak, the coaster note); 2.9_door on Ann St in the rain; 2.9_lights_out |
| 2.10 "3:00 am" | S | 03:00 → first light ~04:40 | `three_am` → `dawn` (final WIDE) | `three210` | 2.10_promise at the half-alive mixing desk; Sequencer (full-screen mini-game over `s210_desk_two`); 2.10_bounce; locked WIDE of the whole venue as the rain thins and dawn starts |
| 3.6 cutaway (optional, recommended) | M | Mon 24 Dec, 11:58, the storm breaks | `lit` | `lit36` | step 26 INSERT: a passer-by's POV up the mall at the tower countdown hitting zero (chip-view pop-up over it); step 27 WIDE "the mall from above": neon full, lanterns swinging, rain pouring, people laughing, a phone answered. (Step 25, "the Valley from the office", is `hq_top` + `skyline()`.) |
| C credits vignettes | M / S | — | `lit_dry` / `gig` | `credits_neon` / `gig` | "the Valley in neon" (mall at full neon, dry); "the Starlight stage" (Mia's gig: stage lit, forty people) |

Time card `place` strings: 2.8 `Fortitude Valley` · 2.9 `The Starlight, Ann Street` · 2.10 `The Starlight`.

**Set lifetime.** 2.7 (train) → 2.8 loads `valley` under the act's black/title card. 2.8 → 2.9 → 2.10 stay on `valley`
(no rebuild). 3.1 loads `hq_atrium`; `valley` stays live (liveMax 2) until 3.2 builds `hq_floors`. For the 3.6
cutaway, content preloads `valley` under the black at the start of 3.3 with `world.liveMax = 3` (restore 2 after 3.6);
if that's not wanted, steps 26–27 can be played on `hq_top` with `skyline()` alone (§12.6).

---

## 2. Layout

### 2.1 Axes and conventions

- VG (§0.1). Walkable ground is `y = 0` everywhere except the Starlight stage (0.9), its steps and the FOH riser
  (0.25) — see `floor()` §2.7. The road surface sits at `y = −0.10` and is not walkable except on the two raised zebras
  (`y = 0`).
- Mark facing `ry`: the actor faces `(sin ry, cos ry)` → `0` faces **+Z (south, down the mall)**, `PI` faces **−Z
  (north, toward Ann St / the tower)**, `H = PI/2` faces **+X (east)**, `-H` faces **−X (west)**.
- Looking south (+Z), screen-right is −X (west). Looking north (−Z), screen-right is +X (east).
- Zone boxes and colliders are `[x0, z0, x1, z1]`.

### 2.2 Region M — plan (footprint x −72…+62, z −45…+62; walkable listed in §2.3)

```
 z  NORTH (−Z) at the top
 −41 ┌──── N1 ────┬──── THE STARLIGHT ────┬ lane ┬──────────── OPTUS TOWER ────────────┬E ln┬───── N3 ─────┐
     │ x −70…−44  │ x −44…−26, h 8.5      │−26…  │ x −18…+18, z −41…−11, to y 132      │18… │ x 24…60      │
     │ 4 storeys  │ (interior: §2.5)      │ −18  │ countdown band y 108–116 (S face)   │ 24 │ 5 storeys    │
     │            │ blade sign STARLIGHT ─┤►     │ Yes sign y 133–141 · lobby card     │    │              │
 −11 └────────────┴─[hi window]─[STAGE DOOR]┴─▒▒▒─┴──── canopy x −8…8, y 5.0 ───────────┴─▒▒─┴──────────────┘
  −7 ═══ N footpath z −11…−7 ═ padded bollards z −7.35 ══════════════╤═ zebra E ═╤════════════════════════
   0 ── ANN STREET (wet bitumen y −0.10) ═ eastbound z −5.25/−1.75 → ║ x −2…+2  ║ ← westbound z +1.75/+5.25 ──
                        ╤═ zebra W x −32…−28 ═╤                     ║          ║
  +7 ═══ S footpath z 7…11 ═ padded bollards z 7.35 ═════════════════╧══════════╧════════════════════════════
 +11 ── SW1 ─────[lion]┬[ CHINATOWN GATE ]┬[lion]─── S2 (corner pub) ──┬ ○○○○○○○○○ ┬──── S3 (bank) ──┬─ S4 ──
     x −60…−36         │  x −36…−24      │   x −24…−8, h 15          │ bollards  │ x 8…30, h 12    │ 30…60
     karaoke neon      │  12 lantern rows│                           │ z 11.6    │                 │
     (pink mic, teal   │  z 13…57        │  W shopfronts of the mall │ BRUNSWICK │ E shopfronts    │
      stars) x −42…−37 │ ▒barrier z 19.4▒│  dumpling · 24/7 · shut   │ ST MALL   │ bank · ATM      │
 +28                   │ (vista beyond)  │  bar (Mia's bench) ·      │ x −8…+8   │ QUIET CUP café  │
                       │                 │  NAP CLUB z 36…46 ·       │ (§2.4)    │ (tables) ·      │
 +46                   │                 │  records (shuttered)      │           │ whisper bar ·   │
 +57                   │                 │                           │▒barrier▒  │ kebabs          │
 +60                   └─────────────────┴───────────────────────────┴ z 57 ─────┴─────────────────┘
     beyond: skyline() — the mall and Chinatown continue to z 110 (Wickham St), the river ~z 300, the Story Bridge
```

### 2.3 Key coordinates — Region M

| Thing | Where | Notes |
| --- | --- | --- |
| Ann Street road | x −120…+120, z −7…+7, surface y −0.10 | Lanes: **eastbound (+X) z −5.25, −1.75** (keep-left = north half), **westbound z +1.75, +5.25**. Painted lines faded; wet sheen |
| Zebra W / Zebra E (raised, y 0) | x −32…−28 / x −2…+2, z −7…+7 | W: Chinatown gate ↔ Starlight stage door. E: mall head ↔ tower doors |
| North footpath | z −11…−7, built x −72…+62; **walkable x −46…+20** in `transit28` / `night29` | padded "QUIET ZONE" fences at x −46 and +20 |
| South footpath | z +7…+11, built x −72…+62; **walkable x −40…+16** in `transit28` | fences at x −40 and +16 |
| Kerb bollards (padded) | every 2.0 m along z −7.35 and z +7.35, x −60…+40, gaps at both zebras | 92 instances |
| Ann St lamps | 7 per footpath at x −56, −40, −24, −8, 8, 24, 40; z −9.6 / +9.6; 6.5 m, foam sleeve to 2 m | heads at "safe brightness" |
| **Optus Tower** | footprint x −18…+18, z −41…−11; shared `tower()` (§12.4) | lobby glass x −18…18 at z −11 (podium y 0…13.5); canopy x −8…8, z −11…−8, slab y 5.0–5.4 with a padded edge; doors closed at night |
| Lane (Starlight / tower) | x −26…−18, z −41…−11 | not walkable; padded barrier at the mouth (z −11.4); bins; the Starlight's chained main doors + small marquee at (−26.0, 0, −28.7) on its west side |
| **The Starlight** | x −44…−26, z −33…−11, parapet 8.5 m | Ann St facade: dark brick, peeling posters; **high window** x −39…−32, y 4.0…5.2; **stage door** x −28.9…−27.9 (centre x −28.4), y 0…2.1, opens **outward** (+Z), hinge on its east edge; bulkhead lamp over it (−28.4, 2.6, −10.85); **blade sign** STARLIGHT on the east corner: plane in YZ at x −26.6, z −11.0…−9.7, y 4.0…11.0 |
| N1 / N3 | x −70…−44 (h 14) / x 24…60 (h 18) | mid-detail blocks from `skyline()` lots (§12.5) |
| SW1 | x −60…−36, z 11…40, h 11 | mid-detail lot from `skyline()`, **with the karaoke neon**: pink microphone + teal stars, x −42…−37, y 5.0…10.0 on its Ann St face (z 11.0) — this is the light that comes through the Starlight's high window |
| **Chinatown gate** (paifang) | 4 red columns at x −35.0, −32.0, −28.0, −25.0 (z 11.8, 0.6 sq, h 5.0); central bay x −32…−28 roof to y 7.8; side bays roofs to y 6.4; green glazed tiles, upturned eaves; plaque **CHINATOWN MALL** centred (−30, 6.3, 11.75) facing −Z | 6 lanterns hang under the bays at y 5.4: x −34.0, −33.0, −31.0, −29.0, −27.0, −26.0 |
| Guardian lions | plinths 0.9 sq, h 0.8, at (−35.8, 10.3) and (−24.2, 10.3), facing −Z | **foam mouthguards** on both |
| Chinatown Mall vista | x −36…−24, z 11.8…60 (walkable only z 11…19.4); padded barrier at z 19.4 | **lantern rows** every 4 m z 13…57 (12 rows) × x −34.5, −31.5, −28.5, −25.5 at y 5.2 on catenary wires (48); shopfronts with red/gold trims, blank signs, red neon fish/dumpling shapes |
| S2 (corner block) | x −24…−8, z 11…57, h 15 (4 storeys) | Ann St face: shuttered corner pub. East face = the mall's west shopfronts; west face = Chinatown's east shopfronts |
| S3 | x 8…30, z 11…57, h 12 (3 storeys) | Ann St face: bank + an upstairs teal cocktail-glass neon. West face = the mall's east shopfronts |
| S4 | x 30…60, z 11…40, h 16 | mid-detail lot from `skyline()` |
| **Brunswick St Mall** | x −8…+8, z 11…57; walkable x −7.6…+7.6, z 11.3…56.8 | pavers dark grey, wet; awnings y 3.2 cantilevered 1.5 m from both facades (to x ±6.5), padded edges; far end: padded cream barrier wall z 57 (h 1.2) — the mall continues beyond it in `skyline()` |
| Mall head bollard row | 9 padded bollards at z 11.6, x −6…+6 every 1.5 m | |

**The mall, west side (x −8 face), north → south:** dumpling house z 11…20 (red neon dumpling, steam card) · 24/7
convenience z 20…26 (cool lit shelves) · closed bar z 26…36 (roller shutter, sprayed **SHHH** tag; Mia's bench in
front) · **NAP CLUB** z 36…46 (door z 40.4…41.6; windows show nap pods with sleepers; **neon NAP CLUB** on a plane
facing +X at x −7.95, y 4.2…5.4, z 38.8…43.2) · record shop z 46…57 (shuttered, dimmed pink neon guitar).

**The mall, east side (x +8 face):** bank/ATM z 11…18 · phone repairs z 18…24 · **QUIET CUP café** z 24…36 (takeaway
window z 29.0…31.0 with the **tea urn** on its ledge at (7.75, 1.0, 30.0) — the set's kettle; chairs-up interior card)
· whisper bar z 36…46 (teal neon cocktail) · kebabs z 46…57 (neon flame shape, dimmed).

### 2.4 The puzzle corner (2.8) — exact

```
        x: −6   −5   −4   −3   −2   −1    0    1    2    3    4    5    6        (mall west face x −8, east face x +8)
 z 26.4               ·drone post (−2.5, y 2.6, 26.4), faces ry −0.9 → cone over the bollard + pole base
 z 27.0                                                               (A) table 3.4,27.0
 z 27.55          ● bollard (−3.6, 27.55), foam, h 0.9
 z 28.2           ◉ POLE (−3.6, 28.2) h 3.0 · rungs on its −Z face · Safe Box on top y 3.0–3.62     (B) 5.6,28.6
 z 30.4   ▬ Mia's bench (−5.6, 30.4) faces +X                                      urn (7.75, 1.0, 30.0) ▸ café
 z 31.4                                                                   (C) PHONE TABLE 3.6,31.4
 z 31.7        ▲ QR tip sign (−4.55, 31.7)
 z 33.4                                                                             (D) 5.8,33.4
```

| Thing | Where | Notes |
| --- | --- | --- |
| **Mia's bench** | centre (−5.6, 0, 30.4), 1.8 long along Z, seat y 0.45, faces +X | timber slats, foam armrests |
| QR tip sign | small A-frame (0.45 × 0.6) at (−4.55, 0, 31.7) facing +X | hand-lettered **TIPS? :)** + a printed QR; a tin with nothing in it |
| **SafeSense pole `pole_mia`** | (−3.6, 0, 28.2), r 0.09, h 3.0, foam sleeve 0…1.0 m | **40 dB meter** on its +X face at y 2.2 (0.22 × 0.32); **ring light** at y 2.9 (safe brightness); **maintenance rungs** on the −Z face at y 1.20, 1.55, 1.90, 2.25, 2.60 (U-shaped, 0.30 wide, 0.12 proud → foothold z ≈ 28.0) |
| **Safe Box `safebox_mia`** | on top of the pole: 0.62 cube, y 3.00…3.62, centred (−3.6, 3.31, 28.2) | quilted cream padding; **door on the −Z face** (hinged at its bottom edge, swings down 100°) with a small window; **keypad** (3 × 4) on the −Z face right of the door; the **AR code** floats on the **+X face** (seen from the mall centre); red/green LED on top |
| Padded bollard (the step) | (−3.6, 0, 27.55), r 0.22 with foam, h 0.9 (top y 0.9) | one of the bollard instances; Luka stands on it |
| Café tables A–D | (3.4, 27.0), (5.6, 28.6), **C (3.6, 31.4)**, (5.8, 33.4) | round r 0.4, top y 0.74, padded rims, two chairs each, a closed padded umbrella through the centre (to y 2.3). **C is the phone table** (8.0 m from the pole) |
| Other SafeSense poles | `pole_b` (3.6, 0, 18.0), `pole_c` (−3.6, 0, 48.0) | same model; their boxes' windows show a confiscated **trumpet** (b) and **tambourine** (c) |
| Mall lamps (4.6 m) | W x −6.4 at z 16, 36, 52 · E x +6.4 at z 22, 40, 54 | foam sleeves 0…2 m |
| Planter trees | x 0 at z 16, 40, 46, 52 (planters 1.2 sq, h 0.5; trunks foam-wrapped to 1.5 m; crowns low-poly) | none in z 20…36 (puzzle space) |
| Benches | Mia's; (5.6, 0, 18.0) facing −X; (−5.6, 0, 44.0) facing +X | |
| NAP CLUB queue | 3 instanced figures in dressing gowns at (−7.0, 0, 43.5 / 44.4 / 45.3) facing −Z | |

Distances (for drone tuning): drone post → bollard 1.3 m; pole → table C 8.0 m; table C → drone post 7.9 m;
checkpoint `s28_cp` (0.6, 24.0) → pole 5.9 m.

### 2.5 Region S — the Starlight interior

Building x −44…−26, z −33…−11; walls 0.3 → **interior x −43.7…−26.3, z −32.7…−11.3**. Hall ceiling y 6.0 (black,
exposed trusses); a lighting truss over the stage front at y 5.0 (z −16.6), dead PAR cans. The green room and the wing
are rooms built under the hall with their own ceiling at y 3.0.

```
 z −32.7 ┌──────────────────────────────── north wall ─────────────────────── clock (−38, 3.4) ──┐
         │▓▓▓▓▓▓▓ back bar (bottles, dead BAR neon) ▓▓▓▓▓▓▓▓▓│ emergency light (−38.0, 3.2)   toilets▯│
 −31.35  │███████ BAR counter x −42.5…−34.0, top y 1.10 █████│ coaster (−37.0, 1.11, −30.95)         │
 −30.6   │ ·  ·  ·  ·  ·  · stools                                                                 │
         │P                                                                                        ║ main doors
 −27.4   │O                     ┌─ FOH riser x −36.0…−33.4 (y 0.25) ─┐                             ║ (chained)
         │S                     │  desk x −35.6…−33.8, z −26.9…−26.1 │ ▫ amp (−32.7, −26.4)       ║ z −29.6…−27.8
 −25.6   │T                     └────────────────────────────────────┘                             │
 −24     │E   ◘ col (−40.5, −24.0)            ◎ mirror ball (−35.5, y 4.6, −23.0)    ◘ col (−29.5) │
 −22     │R           ≡ C40 (−38.3)   ≡ LUKA (−36.6)  ≡ CHASE (−35.6)   ← sleepers, heads to −Z      │
 −19.5   │S   creak · · ·  (window light patch on the floor x −40.5…−31.5, z −27…−19.5)              │
 −17.6   │      [PA W x −41.2…−40.0]                                [PA E x −31.0…−29.8]            │
 −16.0   ├──── GREEN ROOM ── door ──┬════════════ STAGE LIP z −16.0 ════════════┬─ curtain ─┬──────┤
         │ kettle (−43.4, 0.9, −14.0)│ STAGE deck x −40…−31, y 0.9; drum riser   │ steps    │ WING │
         │ mirror, stickers          │ x −37.5…−35.5, z −13.2…−11.6; mic stand   │ x −31… │ EXIT │
 −11.3   └ couch (x −43.4…−41.0) ────┴───[ HIGH WINDOW x −39…−32, y 4.0–5.2 ]────┴ −29.8 ─[STAGE DOOR]┘
        x −43.7                    −40.0                                       −31.0     −28.4    −26.3
                                                    ANN STREET (south, +Z) beyond the wall
```

| Thing | Where | Notes |
| --- | --- | --- |
| **Stage** | deck x −40.0…−31.0, z −16.0…−11.3, y 0.9; black; front lip at z −16.0 (collider) | 2 wedge monitors at the lip (x −37.5, −33.5), an empty mic stand at (−35.5, 0.9, −14.2), drum riser (no kit) x −37.5…−35.5, z −13.2…−11.6, h 0.3 |
| **Wing** (backstage passage) | x −31.0…−26.3, z −16.0…−11.3, ceiling 3.0 | **stage door** in the south wall at x −28.9…−27.9; **EXIT** sign over it inside (−28.4, 2.35, −11.35); **steps** from the deck down into the wing: x −31.0…−29.8 (3 risers) within z −13.6…−12.2; opening to the hall: a black curtain gap at z −16.0, x −29.4…−27.6 (stencil STAFF ONLY) |
| **Green room** | x −43.7…−40.0, z −16.0…−11.3, ceiling 3.0 | door from the hall at z −16.0, x −42.8…−41.9 (stencil GREEN ROOM); **sagging couch** x −43.4…−41.0 against the south wall (z −12.2…−11.4), faces −Z; **kettle** on a bar fridge at (−43.4, 0.9, −14.0); bulb mirror (dead) on the east partition (x −40.05, y 1.6, z −13.8); band stickers |
| **Bar** | counter x −42.5…−34.0, front face z −30.6, depth 0.75, top y 1.10; back bar z −32.7…−32.2 | 6 stools at x −41.6, −40.2, −38.8, −37.4, −36.0, −34.6 (z −30.1); beer taps; dusty bottles; dead **BAR** neon; **coaster** at (−37.0, 1.11, −30.95) |
| **FOH mixing desk** | riser x −36.0…−33.4, z −27.4…−25.6, y 0.25; desk x −35.6…−33.8, z −26.9…−26.1, top y 1.00 (0.75 above the riser), faces +Z (the stage) | a rack of dead gear at its west end; a stool behind at (−34.7, 0.25, −27.1); the snake cable runs along the floor to the stage lip |
| **Amp** (Chase sits on it in 2.10) | (−32.7, 0, −26.4), 0.6 × 0.45, h 0.5 | |
| **Gig poster wall** | west wall x −43.7, z −29.5…−17.0, y 0.4…3.6 | ~40 posters, 4 legible (§3.3) |
| **High window** | south wall x −39.0…−32.0, y 4.0…5.2 | glass with rain streaks; outside it, across Ann St, the karaoke neon (pink/teal) and the Chinatown lanterns (red) |
| Columns | (−40.5, −24.0), (−29.5, −24.0), r 0.2 | steel, flyers stapled |
| PA stacks | W x −41.2…−40.0, E x −31.0…−29.8, both z −17.6…−16.0, h 2.2 | |
| **Main doors** (chained) | east wall at x −26.3, z −29.6…−27.8 | chain + padlock + a SafeSense seal on the outside; **EXIT** sign over them (−26.35, 2.35, −28.7) |
| Emergency bulkheads | (−38.0, 3.2, −32.6) on the north wall, (−26.4, 3.2, −22.0) on the east wall | dim warm-white, always on |
| Toilets door | north wall x −29.8…−28.9 (dark, not openable) | |
| Wall clock | north wall (−38.0, 3.4, −32.65), r 0.25 | `set(h, m)` for the 2.10 ONE MORE PASS jumps |
| Mirror ball | (−35.5, 4.6, −23.0), r 0.3, on a chain from the ceiling | turns 0.05 rad/s (draught); sparkles only in `dawn` / `gig` |
| Floor | timber boards, worn; the 2.9 **creaks** (§12.7) | |

### 2.6 Colliders (`[x0, z0, x1, z1]`)

**Region M** (always unless marked):

```
building faces   N1 [-70,-11.4,-44,-11.0]   tower [-18,-11.4,18,-11.0]   N3 [24,-11.4,60,-11.0]
                 lane mouth [-26,-11.4,-18,-11.0]   E lane mouth [18,-11.4,24,-11.0]
                 SW1 [-60,11.0,-36,11.4]   S2 [-24,11.0,-8,11.4]   S3+S4 [8,11.0,60,11.4]
footpath ends    N [-46.4,-11.0,-46.0,-7.2] [20.0,-11.0,20.4,-7.2]   S [-40.4,7.2,-40.0,11.0] [16.0,7.2,16.4,11.0]
kerbs (bollards) N [-72,-7.5,-32,-7.2] [-28,-7.5,-2,-7.2] [2,-7.5,62,-7.2]
                 S [-72,7.2,-32,7.5] [-28,7.2,-2,7.5] [2,7.2,62,7.5]
zebra sides      [-32.3,-7.2,-32.0,7.2] [-28.0,-7.2,-27.7,7.2] [-2.3,-7.2,-2.0,7.2] [2.0,-7.2,2.3,7.2]
Chinatown pocket walls [-36.4,11.4,-35.6,19.8] [-24.4,11.4,-23.6,19.8]   barrier [-36,19.4,-24,19.8]
                 gate columns 0.6 sq at x -35.0, -32.0, -28.0, -25.0 (z 11.5…12.1)   lions [-36.25,9.85,-35.35,10.75] [-24.65,9.85,-23.75,10.75]
mall walls       W [-8.4,11.0,-7.7,57.2]   E [7.7,11.0,8.4,57.2]   far barrier [-8.0,56.8,8.0,57.2]
mall head row    9 bollards 0.44 sq at z 11.6, x -6…+6 step 1.5
mall objects     pole_mia [-3.75,28.05,-3.45,28.35] · bollard_mia [-3.82,27.33,-3.38,27.77] · Mia's bench [-6.05,29.45,-5.15,31.35]
                 QR sign [-4.8,31.5,-4.3,31.9] · café tables A–D each [x-0.75,z-0.75,x+0.75,z+0.75]
                 pole_b [3.45,17.85,3.75,18.15] · pole_c [-3.75,47.85,-3.45,48.15] · lamps 0.3 sq · planters 1.2 sq
                 benches [5.15,17.1,6.05,18.9] [-6.05,43.1,-5.15,44.9] · NAP queue [-7.6,43.1,-6.6,45.6]
dress-dependent  quiet28 confinement: mall head [-8.0,11.0,8.0,11.3]
                 night29/three210: N footpath only between the Starlight and the lane: [-44.0,-11.0,-43.6,-7.2] [-26.4,-11.0,-26.0,-7.2]
dynamic          whisperer rigs (0.56 sq, moved in update, parked at 1e4 when hidden, as Rue's CUST)
```

**Region S:**

```
shell            W [-44.0,-33.0,-43.7,-11.0]  E [-26.3,-33.0,-26.0,-11.0]  N [-44.0,-33.0,-26.0,-32.7]
                 S [-44.0,-11.3,-28.9,-11.0] [-27.9,-11.3,-26.0,-11.0]      stage door (dynamic) [-28.9,-11.3,-27.9,-11.0]
green room       [-43.7,-16.15,-42.8,-16.0] [-41.9,-16.15,-40.0,-16.0]  (east side = stage side) [-40.15,-16.0,-40.0,-11.3]
                 couch [-43.4,-12.3,-41.0,-11.3] · fridge/kettle [-43.7,-14.4,-43.1,-13.6]
wing             [-31.0,-16.15,-29.4,-16.0] [-27.6,-16.15,-26.3,-16.0]   masking flat [-31.15,-16.0,-31.0,-13.6] [-31.15,-12.2,-31.0,-11.3]
stage            lip [-40.0,-16.15,-31.0,-16.0] · drum riser [-37.5,-13.2,-35.5,-11.6] · monitors 0.6 × 0.4 each
bar              [-43.7,-32.7,-34.0,-30.6]  (counter + bartender aisle + back bar in one)
floor objects    desk [-35.6,-26.9,-33.8,-26.1] · rack [-36.0,-27.0,-35.6,-26.0] · amp [-33.0,-26.65,-32.4,-26.15]
                 columns 0.4 sq · PA W [-41.2,-17.6,-40.0,-16.15] · PA E [-31.0,-17.6,-29.8,-16.15] · stools 0.4 sq
```

### 2.7 `floor(x, z)` (branches only, no allocation)

```js
floor(x, z) {
  if (z > -16.0 && z < -11.3) {
    if (x > -40.0 && x < -31.0) return 0.9;                                    // stage deck
    if (x >= -31.0 && x < -29.8 && z > -13.6 && z < -12.2) return 0.9 * (x + 29.8) / -1.2;  // wing steps
  }
  if (x > -36.0 && x < -33.4 && z > -27.4 && z < -25.6) return 0.25;           // FOH riser
  return 0;
}
```

### 2.8 Region F — far (summary; full spec §12.3–12.6)

The Optus Tower (from `tower({ podium: 'night' })`) fills the north end of every view up the mall: glass curtain wall
to y 132, the **countdown band** on its south face at y 108–116 (QUIET IN hh:mm:ss), the **Yes sign** on the roof crown
(y 133–141), 12 drones circling it. Beyond the near set, `skyline({ skip: ['STARLIGHT', 'S2', 'S3', 'CHINATOWN',
'TOWER'] })` supplies N1, N3, SW1, S4, the mall and Chinatown continuing south to z 110, the rest of the Valley, the
CBD towers to the south-west, the river, the Story Bridge, Mt Coot-tha's TV masts on the horizon band, and the storm.

---

## 3. Look

### 3.1 Palette (spec §14: "dimmed magenta and teal neon, red Chinatown lanterns, black wet bitumen, foam everywhere")

| Use | Hex |
| --- | --- |
| Neon magenta (full / safe ×0.35) | `#ff3fa4` / reads ≈ `#5a1639` |
| Neon teal (full / safe) | `#2fe8d6` / ≈ `#10514b` |
| Lantern red body / glow | `#c8261f` / `#ff6a3a` |
| Gate red lacquer / green tiles / brass trim | `#b0201e` / `#2f7a4a` / `#c9a54a` (brass, never Yes yellow) |
| Wet bitumen / sheen streaks | `#0e0f14` / `#3a3f52` |
| Mall pavers (wet) | `#2a2c34` with `#4a4e60` sheen |
| Foam (bollards, sleeves, corner guards, barriers, the Safe Box) | soft cream `#efe6d0`, seams `#d8ccb0` |
| Shopfront glass (dark) / lit interiors | `#1a2230` / warm `#e8c890`, cool `#bfe6ff` |
| Facades (upper floors) | brick `#5a3a32`, render `#6a6470`, painted `#3e4a5a` |
| Storm sky zenith / horizon / lightning | `#14142a` / `#2a2440` / `#d8e0ff` |
| Tower glass / mullions / spandrels | `#5f7484` / `#3a4048` / `#9aa2aa` |
| 2040 glassy accent (drones, SafeSense, AR glyphs, the slate) | `#bfe6ff` |
| Starlight brick / stage-door green / venue black | `#4e3028` / `#2f4a3e` / `#121014` |
| Floorboards / stage | `#4a3628` / `#18161a` |
| Emergency green (EXIT) / bulkhead warm | `#2fd06a` / `#f0e0c0` |
| Dawn through the window | `#8aa0c8` |
| **Yes yellow** (tower Yes sign; 3.6 facade band only) | `#ffd21f` |

### 3.2 Materials

- `M.vc` — Lambert, vertex colours: all untextured static geometry of Region M (1 draw call) and, separately,
  `M.vcS` for Region S (so the interior can hide as a unit).
- `M.atlas` / `M.atlasS` — Lambert + one 256 × 256 atlas each (nearest) for every painted label, shopfront card, poster
  and screen of M / S.
- `M.facade` — Lambert, 256 × 128 facade tiles (repeat) for S2/S3 upper floors and the Starlight's brick.
- `M.wet` — Lambert, 128 × 128 wet bitumen / paver texture with sheen streaks (two UV sets → two meshes: road, pavers).
- `M.neonM`, `M.neonT`, `M.neonR`, `M.neonNap` — Basic (unlit) emissive-look materials, alpha-textured where shaped:
  magenta, teal, red, and NAP CLUB's own (so it can flicker independently). **Their colour = full colour × neon level**
  (written into the material colour in `update` from preallocated values). Each has a unique `key` and is used by one
  kind of mesh only (the twins gotcha, engine doc §3.5).
- `M.reflect` — Basic, additive, `depthWrite: false`, the 64 × 128 vertical glow streak; one InstancedMesh of ground
  reflections (instanceColor = the sign's colour) under every neon sign and lantern row, opacity × neon level.
- `M.lantern` — Basic, lantern texture (red body + gold bands), colour × lantern level.
- `M.glass` — Basic transparent 0.4 (shopfront glazing); `M.streak` — Rue's `streakTex` (rain running down glass) for
  the high window and the stage door's wired-glass pane.
- `M.patch` (additive) and `M.rshadow` (alpha 0.6) — Rue's Lights Out recipe: a pink→teal light-patch texture and a
  crawling rain-shadow texture on the same quads (§4, `window_light`).
- `M.glow` — Basic for lamp heads, EXIT signs, bulkheads, ring lights, LEDs.
- Sky/backdrop materials live in `skyline()` (`fog: false`).
- No vertex snapping, no affine warping, no wobble. Blob shadows only.

### 3.3 Textures to paint (128–256 px, nearest; **bold** = must read at the named anchor)

| Texture | Size | Content | Read at |
| --- | --- | --- | --- |
| `t_napclub` | 256 × 64 (alpha) | **NAP CLUB** in rounded neon tubes, with a little crescent moon and "z z z" | `napclub` |
| `t_neon_shapes` | 256 × 128 (alpha), 8 cells | cocktail glass, guitar, dumpling, microphone, star cluster, fish, flame, music note | wides |
| `t_karaoke` | 128 × 128 (alpha) | pink microphone with teal stars around it (tubes) | through the high window |
| `t_blade` | 64 × 256 (alpha) | a star on top, then **S T A R L I G H T** vertically in tubes; painted white so the material tints it (dead grey `#4a4650` / lit pink) | `s28_stage_door_ext`, `cr_valley_neon` |
| `t_safebox` | 128 × 128, 4 cells | quilted cream face; door face with a small window; **keypad 1–9, ✕ 0 ✓**; the SafeSense drop logo + a tiny AR glyph | `s28_safebox`, `s28_box_keypad` |
| `t_dbmeter` | 64 × 64 | vertical LED bar (green→amber→red) + **40 dB** + "SafeSense" | `s28_db_meter` |
| `t_qr` | 64 × 64 | hand-lettered **TIPS? :)** in marker over a printed QR | `s28_qr` |
| `t_gate_plaque` | 128 × 32 | gold on red: **CHINATOWN MALL** with cloud scrolls (no CJK glyphs) | `lanterns`, `s28_gate_track` |
| `t_lantern` | 64 × 64 | red lantern, gold top/bottom bands, ribs, tassel | |
| `t_shops` | 256 × 256, 8 cells (128 × 64) | window cards: dumpling steam + bamboo baskets · lit 24/7 shelves · rolled shutter with sprayed **SHHH** · **nap pods** with sleepers under blankets · shuttered records · bank ATM (blank screen) · café chairs-up (QUIET CUP is AR) · kebab spit | mall cams |
| `t_facades` | 256 × 128, 4 tiles | upper-floor windows (dark / a few warm-lit / one with fairy lights), small balconies, AC units | |
| `t_wet` | 128 × 128 | black bitumen + faint lane-line variant; pavers variant; both with sheen streaks | ground |
| `t_reflect` | 64 × 128 (alpha) | vertical soft glow streak with horizontal ripple breaks | ground reflections |
| `t_posters` | 256 × 256, 16 cells | gig posters 2030–2033, sun-faded, 4 legible: **THE SOFT CORNERS · FRI 14 MAR 2031** · **MANGROVE MILE · LIVE · SAT 2 AUG 2032** · **FOUR O'CLOCK STORM w/ BRAMBLE BAY · 2030** · **LOW TIDE CHOIR · ALL AGES · 2033** — no Pudding, no real band names | `sl_posters`, `sl_poster_hero` |
| `t_stagedoor` | 64 × 128 | steel door, dark green, rust, **STAGE DOOR** stencil (outside face); push bar (inside face) | `s28_stage_door_ext`, `s29_door_out` |
| `t_coaster` | 64 × 64, 2 frames | round beer coaster ("VALLEY DRAUGHT", generic) / the same with biro **I'll do it. — L.** (matches the CARD) | `s29_coaster` |
| `t_desk` | 128 × 64 | mixing-desk top: 16 channel strips, faders, knobs, a meter bridge; overlay cells for the half/live LED states | `sl_desk`, `s210_*` |
| `t_slate` | 64 × 48, 3 frames | the slate on the desk: sequencer grid glow / EXPORT bar / **two.wav · saved** (the readable version is the CARD) | `s210_slate` |
| `t_greenroom` | 128 × 64 | sticker-bombed wall, the bulb mirror | `sl_kettle` |
| `t_bar` | 128 × 64 | back-bar bottles (dusty), the dead **BAR** tube | |
| `t_patch` | 128 × 64 | soft-edged light patch: teal band on the west side, pink on the east, faint red flecks | floor/stage |
| `t_rshadow` | 64 × 128 | crawling rain-drop shadows (Rue's recipe) | floor/stage/coats |
| `t_streak` | 64 × 128 | Rue's rain-on-glass streaks | high window |
| `t_exit` | 64 × 32 | green **EXIT** with a running figure | |
| `t_boards` | 128 × 128 | dark worn floorboards; the creak boards get a faint sheen variant | |
| Tower + skyline textures | — | owned by the shared builders (§12.4–12.5) | |

### 3.4 Lighting rig (hemi + dir + **one** spot) and fog, per preset

Every preset defines `spot` (intensity 0 when unused), because `envFill` keeps the previous spot values when a preset
omits it. **No preset name contains "rain"** (the set owns its rain object; names stay unambiguous).

```js
env: {
  quiet:      { bg: 0x0c0e1c, fog: [0x1b1830, 0.016], hemi: [0x5a5a8e, 0x1a1218, 0.62], dir: [0x9aa2d8, 0.32, [-20, 30, 10]],  spot: [0xffb6d0, 1.6], rain: 0 },
  starlight:  { bg: 0x07060c, fog: [0x15111c, 0.040], hemi: [0x4a4060, 0x120e14, 0.55], dir: [0x8a7ab0, 0.18, [-6, 12, 10]],   spot: [0xe8f0ff, 2.0], rain: 0 },
  lights_out: { bg: 0x05060c, fog: [0x140f1e, 0.045], hemi: [0x3c3a62, 0x0e0a10, 0.42], dir: [0x5ad8d0, 0.22, [-4, 10, 12]],   spot: [0xff5fa8, 2.2], rain: 1 },
  annst:      { bg: 0x0a0b16, fog: [0x221c30, 0.030], hemi: [0x5a5a86, 0x14101a, 0.60], dir: [0x7ae0d8, 0.35, [-6, 14, 16]],   spot: [0xfff0e0, 1.6], rain: 1 },
  three_am:   { bg: 0x05060a, fog: [0x0f0e18, 0.040], hemi: [0x343a5a, 0x0a0a0e, 0.38], dir: [0x6a7ab0, 0.12, [-4, 10, 12]],   spot: [0xbfe6ff, 1.3], rain: 0.6 },
  dawn:       { bg: 0x2a3448, fog: [0x3a4458, 0.030], hemi: [0x8a9ac0, 0x1a1a22, 0.60], dir: [0xa8b8d8, 0.40, [-4, 10, 14]],   spot: [0xbfe6ff, 0.8], rain: 0.15 },
  lit:        { bg: 0x14102a, fog: [0x2a1c3e, 0.012], hemi: [0x8a7ac0, 0x24141e, 0.75], dir: [0xd0a0ff, 0.40, [-10, 20, 10]],  spot: [0xff6fb0, 0],   rain: 1 },
  lit_dry:    { bg: 0x120e26, fog: [0x241a38, 0.012], hemi: [0x8a7ac0, 0x24141e, 0.75], dir: [0xd0a0ff, 0.40, [-10, 20, 10]],  spot: [0xff6fb0, 0],   rain: 0 },
  gig:        { bg: 0x0a0610, fog: [0x1a0f22, 0.030], hemi: [0x6a4a8a, 0x140a14, 0.60], dir: [0xff9ad0, 0.30, [-4, 10, 12]],   spot: [0xffd8f0, 3.0], rain: 0 },
}
```

First key `quiet` is the build default. Exterior fog density 0.016 keeps the mall readable to ~60 m and swallows
the near set's edges; `skyline()` and the tower ignore fog for their emissive parts (window lights, neon, countdown,
Yes sign) and use the live fog colour on their bodies.

**The spot (`lamp(name)`)** — sets `world.torchAuto` and the torch's position/target/angle/penumbra/distance from
preallocated values; `torchAuto` is restored to `true` by `lamp('torch')`, `lamp('off')` and (engine note §12.9) by
every set change.

| `lamp()` | Used in | Position → target | Angle / penumbra / dist | Colour / intensity | Purpose |
| --- | --- | --- | --- | --- | --- |
| `bench` | `quiet28`, `transit28` | (−3.0, 5.4, 29.2) → (−5.2, 0.4, 30.4) | 0.75 / 0.7 / 12 | `#ffb6d0` / 1.6 | the safe-brightness pool over Mia's bench and the pole base: Mia, the climb |
| `torch` | `dusty28` | (auto: the player's phone torch) | 0.5 / 0.5 / 14 | `#e8f0ff` / 2.0 | exploring the dark venue; `world.torchAuto = true` |
| `neon` | `night29` (inside shots) | (−35.5, 5.2, −11.8) → (−36.6, 0.0, −23.0) | 0.55 / 0.85 / 18 | `#ff5fa8` / 2.2 | the pink shaft through the high window onto the sleepers |
| `door` | `night29` (Ann St shots) | (−28.4, 2.75, −10.6) → (−28.4, 0.8, −11.9) | 0.9 / 0.6 / 6 | `#fff0e0` / 1.6 | the stage door's bulkhead: Luka in the doorway, rain lit in front of him |
| `slate` | `three210` | (−34.5, 1.10, −26.2) → (−33.9, 1.55, −27.0) | 1.2 / 0.8 / 3.5 | `#bfe6ff` / 1.3 | the slate's glow up on Chase (2040) and Chase on the amp |
| `gig` | `gig` | (−35.5, 5.0, −17.2) → (−35.5, 0.9, −13.2) | 0.6 / 0.5 / 10 | `#ffd8f0` / 3.0 | stage wash on Mia |
| `off` | `lit36`, `credits_neon` | — | — | intensity 0 | |

### 3.5 Fog, sky, storm

- Exterior sky and backdrop: `skyline({ sky: 'storm' })` — a dark storm dome (gradient `#14142a` → `#2a2440`), 6
  heavy cloud cards lit from below by the city's neon glow (magenta/teal underbelly), the horizon band (city
  silhouette, Mt Coot-tha masts with blinking red lights). **Lightning** (`sky_flash`): 2.8 — distant only (cloud cards
  flicker, no light on the set) every 14–26 s; 2.9 — closer: cloud flash + the high window's glass and patch flare
  white for 0.12 s, every 12–25 s, then thunder 1.2–3.0 s later; 2.10 — 2 flashes in the first minute, then none.
  **Reduce Flashing**: replace every flash with a 1.5 s dim swell to ≤ 40% of the flash level.
- Interior: bg/fog colour only (the hall is closed); the high window shows the street glow card (pink/teal/red
  smudges) behind its streaked glass.

---

## 4. Props

Named props (`world.prop(name)`); animated ones expose `userData` functions; all animation runs in `update()`.

| id | Region | Description | Scenes | States / `userData` |
| --- | --- | --- | --- | --- |
| `region_m`, `region_s`, `region_f` | — | the region groups | all | visibility via `dress()` only |
| `pole_mia` | M | the SafeSense pole: sleeve, rungs, ring light, 40 dB meter | 2.8 | `meter(db)` sets the LED bar (idle: wobbles 34–39); `wobble(a)` sways the pole ±a rad about its base (the climb's "wobble if he's slow"), eased back to 0 |
| `safebox_mia` | M | the Safe Box on top | 2.8 | `door(u)` 0 shut … 1 open (bottom-hinged); `content(id)` `'uke'`/`null` shows the ukulele behind the window; `led('red'|'green')`; `press(d)` flashes a key |
| `safebox_b`, `safebox_c` | M | the other poles' boxes (trumpet / tambourine visible in the windows) | 2.8 | static |
| `uke_prop` | M | a copy of Mia's sticker ukulele owned by the set (for the confiscation flight and the box) | 2.8 | `follow(obj, [ox, oy, oz])` copies obj's world position + offset each frame (preallocated vector); `place(where)`; `hide()`. Mia's own rig attachment is hidden while this is out |
| `phone_drop` | M | Chase's 2026 phone lying screen-up on table C, with a pulsing sound-ring decal | 2.8 | `show(bool)`; `pulse(on, strength)` ring radius/opacity ∝ lure strength |
| `cafe` | M | 4 tables + 8 chairs + 4 closed umbrellas (merged) | 2.8 | static |
| `urn` | M | QUIET CUP's tea urn on the takeaway ledge | 2.8 | `steam()` (or `world.puff('urn')`) |
| `shush_drones` | M | InstancedMesh, 4 small pods at y 7–9 drifting along the mall and Ann St, each with a "shush" ring light that expands and fades every 2.5 s | 2.8 | `on(bool)`; decor only (gameplay drones are content-spawned, §7.3) |
| `whisperers` | M | 6 set-owned rigs (looks `whisper_a…f`): pair on the bench (5.6, 18), pair by the NAP CLUB queue, 2 slow walkers on `paths.walk_mall` | 2.8 | `on(bool)`; idle/whisper (heads together, small mouth flaps, no blips) / walk; in `lit36` → `look_up` + `laugh` |
| `crowd_far` | M | InstancedMesh, 18 simple figures (body + head; instanceColor) — the NAP CLUB queue in dressing gowns (3), Chinatown pocket (5), far mall z 46…56 (10) | 2.8, 3.6, C | idle bob; `mode('quiet'|'look_up')` |
| `neon_mall`, `neon_annst` | M | all neon shapes (merged per colour) | all M | brightness = neon level (`SETS.valley.neon(k)`), slight per-sign flicker bursts |
| `napclub_sign` | M | NAP CLUB letters | 2.8, 3.6 | own flicker (one letter buzzes every ~9 s); × neon level |
| `blade_starlight` | M | the vertical STARLIGHT blade sign | 2.8–2.10 dead; 3.6, C lit | `lit(bool)`: dead grey tubes ↔ pink at full (ignores the safe level) |
| `karaoke_neon` | M | pink mic + teal stars on SW1 | all | × neon level (built inside `skyline()`'s SW1 lot — exposed under this name) |
| `reflections` | M | InstancedMesh (≈ 40) ground glow streaks under signs and lantern rows | all M | opacity × neon level; wet ripple offset scroll |
| `lanterns` | M | InstancedMesh: 48 mall + 6 gate = 54 lantern bodies + 54 tassels (2 IM) | all M | `swing(on)`: off = **perfectly still** (2.8: "the wind has been asked not to"); on = each swings ±0.25 rad, own phase, 0.6–0.9 Hz (3.6) |
| `gate` | M | the paifang (merged) + plaque | all M | static |
| `lions` | M | two stone guardian lions with foam mouthguards | all M | static |
| `gust` | M | a paper takeaway bag tumbling across the Chinatown pocket under the still lanterns | 2.8 | fires every ~20 s along `paths.gust` (2.4 s), then resets; hidden outside `quiet28` / `transit28` |
| `bollards` | M | InstancedMesh, padded bollards (kerbs 92 + mall head 9 + mall 1 (Mia's step) + Chinatown 4) = 106 | all M | static |
| `lamps` | M | InstancedMesh posts (20) + heads (20) | all M | heads glow × lamp level |
| `trees_mall` | M | InstancedMesh trunks (4) + crowns (4) + planters merged | all M | crowns sway ±0.02 rad |
| `traffic` | M | InstancedMesh, 6 hover-cars (body + glow + shadow IMs) on Ann St at 2.0 m/s | 2.8, 2.9, 3.6 | `count(n)`; cars yield at both zebras when anyone stands on them; `stop(bool)` (3.6: everyone stops) |
| `tower` | F | the shared `tower()` group (§12.4) incl. `facade_countdown`, `yes_sign`, `tower_drones`, `lobby_card` | all | see §12.4 |
| `skyline` | F | the shared `skyline()` group (§12.5) | all | see §12.5 |
| `sky_flash` | F | lightning controller (cloud cards + window flare + optional thunder call) | 2.8–2.10 | `rate(r)`, `flash(k)`; respects Reduce Flashing |
| `rain` | — | set-owned `makeRain({ box: [-12, -9, 12, 9], top: 14, count: 4500 })` | 2.9, 2.10, 3.6 | `at(x, z)` moves its group (the box follows); amount from the env's `rain` |
| `stage_door` | S | steel door + push bar + wired-glass slit (`M.streak`) | 2.8, 2.9 | `open(u)` 0 … 1 = 1.6 rad outward about its east hinge, eased; the collider opens at u ≥ 0.8 |
| `door_bulkhead` | M | the caged bulkhead lamp over the stage door outside | all | `on(bool)` (always on; flickers in rain) |
| `window_light` | S | the high window's light: patch quads on the floor (x −40.5…−31.5, z −27…−19.5, y 0.012) and on the stage deck (x −39…−32, z −16…−13, y 0.912), each doubled with a rain-shadow quad | 2.8–2.10, C | `light(hex, k)` tints + scales the patches (night: pink/teal k 1; 2.10: teal k 0.5 → dawn `#8aa0c8` k 0.8); rain shadows scroll while the rain amount > 0.05 |
| `window_glass` | S | the high window from inside (streaks) + the street-glow card behind it | all S | streak offset scrolls with rain amount |
| `coats_sleep` | S | 3 draped coats (two polo-coloured jackets, one long tan trench) over the sleeper marks | 2.9, 2.10 | `show(mask)` bit 0 Chase, 1 Luka, 2 Chase (2040); `lift(i, u)` peels a coat back as someone sits up |
| `coaster` | S | the beer coaster | 2.9 | `write()` swaps to the biro frame; `place(where)` (e.g. `'chest_chase'` → (−35.6, 0.24, −22.35) lying on the coat) |
| `creak_boards` | S | 5 faint sheen decals on the sneak route (§12.7) | 2.9 | `show(bool)` (only in `night29`) |
| `foh_desk` | S | the mixing desk + riser + rack + stool | 2.8–2.10 | `state('dead'|'half'|'live')`: dead = dark; half = a third of the LEDs on, meters bouncing on a sine; live = all LEDs, meters to the music (content passes a level) |
| `desk_cables` | S | the mess of patch cables over the desk and down to the slate | 2.10 | visible in `three210` |
| `slate_desk` | S | Chase (2040)'s slate lying on the desk, plugged in | 2.10 | `screen('off'|'seq'|'export'|'saved')`; `slide(u)` moves it from (−34.4, 1.06, −26.6) to (−33.6, 1.06, −26.5) ("sliding the slate across the desk to him") |
| `headphones_desk` | S | a pair of studio headphones plugged into the desk | 2.10 | `show(bool)` (content hides it when an actor "holds" them) |
| `amp_seat` | S | the amp Chase sits on | 2.10 | static |
| `mirror_ball` | S | dusty mirror ball + 40 sparkle points (Points) | all S | spins 0.05 rad/s; sparkles visible only in `dawn` / `gig` (`sparkle(k)`) |
| `truss_pars` | S | 8 PAR cans on the truss | C | `on(bool)`: dead ↔ coloured emissive (pink, teal, amber, white) |
| `crowd_gig` | S | InstancedMesh, **40** crowd figures on the floor z −24…−17 facing the stage (instanceColor) | C | `on(bool)`; bounce 1.5–2.5 Hz, arms-up subset |
| `exit_signs`, `bulkheads` | S | 2 EXIT + 2 emergency lights | all S | steady; `on(bool)` |
| `wall_clock_sl` | S | the clock over the bar | 2.10 | `set(h, m)` |
| `posters` | S | the poster wall (atlas quads, merged) | 2.8 | static |
| `green_room` | S | couch, fridge, kettle, mirror, stickers | 2.8 | `kettle_steam()` on save |
| `kettle_sl` | S | the green-room kettle | 2.8–2.10 | (hotspot target) |

**Instanced repeats (counts)**

| Repeat | Count | Mesh(es) |
| --- | --- | --- |
| Padded bollards | 106 | 1 IM |
| Lamp posts / heads (Ann St 14, mall 6) | 20 / 20 | 2 IM |
| Lanterns (bodies / tassels) | 54 / 54 | 2 IM |
| Ground reflections | ~40 | 1 IM (instanceColor) |
| Hover-cars (body / glow / shadow) | 6 | 3 IM |
| Shush drones (pod / ring) | 4 | 2 IM |
| Crowd figures (street) | 18 | 2 IM (body, head) |
| Crowd figures (gig) | 40 | 2 IM (body, head) |
| Café chairs | 8 | merged into `cafe` |
| Mall trees (trunk / crown) | 4 | 2 IM |
| Stools | 6 | merged into `M.vcS` |
| Posters | ~40 | merged quads (atlas) |
| Tower drones / skyline repeats | — | inside the shared builders (§12.4–12.5) |

Courtesy / noise drones are **not** set props: content spawns them with `DRONES.spawn` (§7.3).

---

## 5. Marks (`[x, y, z, ry]`, VG)

Seated marks keep y = 0 (the sit pose supplies the height: bench 0.45, amp 0.5, couch 0.42, stool 0.75 on the
riser). **Lying marks** are the hip point; the body must lie **head toward −Z** (the camera of `s29_floor`) — with
`ry = 0` if `ANIMS.lie` lays the head behind the facing direction, else `ry = PI` (verify once on the first build).

**2.8 — street**

| id | value | step / use |
| --- | --- | --- |
| `s28_enter_luka`, `s28_enter_chase`, `s28_enter_c40` | [−1.2, 0, 12.6, 0], [0.6, 0, 12.2, 0], [−0.3, 0, 11.7, 0] | where the crane lands: they've just come off Ann St into the mall |
| `s28_hear_luka`, `s28_hear_chase` | [−0.2, 0, 25.6, −0.5], [0.9, 0, 26.2, −0.7] | end of the TRACK, Mia's song reaches them |
| `s28_c40_stop` | [−1.4, 0, 26.9, −1.05] | Chase (2040) "stops dead", facing Mia |
| `s28_mia` | [−5.55, 0, 30.4, H] | Mia seated on her bench (spawned by content, look `mia`) |
| `s28_plan_chase` | [0.4, 0, 27.0, −1.2] | 2.8_plan: Chase looks drone → pole → tables; the ORBIT centre (clear radius 2.4 m) |
| `s28_plan_c40` | [−1.2, 0, 25.0, 0.7] | Chase (2040) watching his younger self |
| `s28_plan_luka` | [1.6, 0, 25.4, −0.9] | |
| `s28_cp` | [0.6, 0, 24.0, 0] | puzzle checkpoint: Safe Room / Signal soft-fail return point (followers at ±1.0 m x) |
| `s28_c40_read` | [−0.8, 0, 28.4, −H] | Chase (2040) reads the AR code on the box's +X face (3.0 m, outside the noise drone's cone) |
| `s28_drop` | [2.7, 0, 31.4, H] | Chase sets the phone on table C |
| `s28_pick` | [4.75, 0, 31.4, −H] | retrieving the phone (east side of table C) |
| `s28_climb_0` | [−3.6, 0, 26.95, 0] | Luka at the bollard, facing the pole |
| `s28_climb_1` | [−3.6, 0.9, 27.55, 0] | standing on the bollard top |
| `s28_climb_2` | [−3.6, 1.55, 27.85, 0] | feet on rung 2; hands at the box door (y 3.0–3.6) |
| `s28_uke_back` | [−4.4, 0, 30.4, −H] | Luka hands the ukulele back to Mia |
| `s28_uke_sample` | [−4.3, 0, 31.2, −1.9] | Chase records Mia's strum |
| `s28_leave_luka`, `s28_leave_chase`, `s28_leave_c40` | [−0.4, 0, 21.0, PI], [0.8, 0, 21.6, PI], [−1.0, 0, 22.4, PI] | walking off toward Ann St; at "Hey. Grandpa." Chase (2040) turns to ry −0.35 (back toward Mia) |
| `whisper_*` | bench pair [5.6, 0, 17.6, −H], [5.6, 0, 18.4, −H]; queue pair [−6.6, 0, 41.8, −0.6], [−6.0, 0, 42.4, −2.4]; walkers on `paths.walk_mall` | set-owned rigs |

**2.8 — the walk to the Starlight** (cutscene or `transit28` roam)

| id | value | use |
| --- | --- | --- |
| `s28_t_head` | [0.0, 0, 9.0, −H] | at the mall head, turning west along the S footpath |
| `s28_t_gate_luka`, `s28_t_gate_chase`, `s28_t_gate_c40` | [−27.2, 0, 9.0, −H], [−26.0, 0, 9.6, −H], [−28.4, 0, 8.6, −H] | passing the gate (lanterns over their heads to the left) |
| `s28_t_cross` | [−30.0, 0, 6.0, PI] | stepping onto zebra W |
| `s28_door_out` | [−28.4, 0, −8.6, PI] | on the N footpath facing the stage door |
| `s28_door_out_chase`, `s28_door_out_c40` | [−27.2, 0, −8.2, PI], [−29.6, 0, −8.0, PI] | |
| `s28_in`, `s28_in_chase`, `s28_in_c40` | [−28.4, 0, −12.4, PI], [−27.4, 0, −13.2, PI], [−29.4, 0, −13.4, PI] | just inside the wing (control starts here in `dusty28`) |

**2.8 — the Starlight (dusty)**

| id | value | use |
| --- | --- | --- |
| `sl_posters` | [−42.3, 0, −23.5, −H] | in front of the poster wall |
| `sl_desk` | [−34.7, 0.25, −27.1, 0] | behind the mixing desk, facing the stage |
| `sl_stage_look` | [−35.5, 0, −17.3, 0] | at the stage lip |
| `sl_kettle` | [−42.6, 0, −14.0, −H] | green room, facing the kettle |
| `sl_couch` | [−42.2, 0, −11.9, PI] | seated on the couch |

**2.9**

| id | value | use |
| --- | --- | --- |
| `s29_chase` | [−35.6, 0, −22.0, 0] | lying (head toward −Z) under his coat |
| `s29_luka` | [−36.6, 0, −22.0, 0] | lying; sits up here (`sit` with `h: 0`) |
| `s29_c40` | [−38.3, 0, −22.3, 0] | lying under the trench coat, a little apart |
| `s29_luka_reach` | [−37.5, 0, −22.7, −H] | kneeling beside Chase (2040), taking the brick phone from his coat |
| `s29_bar` | [−37.0, 0, −29.9, PI] | at the bar: "Write a note? [YES]" (the coaster is right in front of him) |
| `s29_note_drop` | [−34.9, 0, −22.4, −H] | kneeling at Chase's side to leave the coaster on his chest |
| `s29_door_in` | [−28.4, 0, −12.1, 0] | at the stage door, facing it (+Z) |
| `s29_doorway` | [−28.4, 0, −11.1, 0] | in the open doorway, rain beyond |
| `s29_luka_turn` | [−28.4, 0, −11.6, PI] | turned back toward Chase |
| `s29_chase_wing` | [−29.0, 0, −14.9, 0.1] | Chase in the dark of the wing, facing the door (south), coaster in hand |
| `s29_chase_close` | [−28.6, 0, −12.6, 0.1] | Chase steps in for "Just stay." and takes the brick phone |
| `s29_c40_eyes` | = `s29_c40` | the only cut in 2.9_lights_out |

**2.10**

| id | value | use |
| --- | --- | --- |
| `s210_c40_desk` | [−34.7, 0.25, −27.1, 0] | Chase (2040) on the stool behind the desk (seated, `h` 0.75 above the riser) |
| `s210_chase_amp` | [−32.7, 0, −26.4, −0.7] | Chase on the amp, angled toward him |
| `s210_luka_sleep` | [−36.6, 0, −22.0, 0] | Luka asleep under his coat, the Santa beard over his eyes |

**Credits / 3.6**

| id | value | use |
| --- | --- | --- |
| `cr_mia_stage` | [−35.5, 0.9, −13.4, PI] | Mia on stage facing the room (north) |
| `s36_passerby` | [1.6, 0, 33.0, PI] | the passer-by whose chip view we see, looking up the mall at the tower |
| `s36_phone` | [−2.2, 0, 38.0, PI] | "somewhere a phone rings, and someone answers" (`phone` anim) |
| `s36_laugh_1…4` | [2.4, 0, 30.0, PI], [−1.6, 0, 26.0, 2.8], [3.0, 0, 42.0, −2.9], [−4.2, 0, 35.0, 2.6] | people in the rain, faces up, laughing (the whisperer rigs re-used) |
| `kettle` | [7.0, 0, 30.0, H] | QUIET CUP's urn (save, 2.8 street) |
| `kettle_sl` | = `sl_kettle` | green-room kettle (save, 2.8–2.10) |

---

## 6. Anchors (`{ at, from, fov }`, VG)

**2.8 — street**

| id | at | from | fov | for |
| --- | --- | --- | --- | --- |
| `s28_crane_a` | [0.0, 112.0, −10.7] | [10.0, 118.0, 26.0] | 46 | CRANE start: the tower's countdown **QUIET IN 16:28:00** glowing in the storm (the drones circling) |
| `s28_crane_b` | [−14.0, 2.0, 30.0] | [−10.0, 22.0, 6.0] | 52 | descending over Ann St: Chinatown's still lanterns screen-right, the mall screen-left, foam everywhere, shush drones below the lens |
| `s28_crane_c` | [0.0, 1.4, 20.0] | [−1.5, 3.2, 8.5] | 48 | CRANE end over the mall-head bollards: NAP CLUB mid-distance right, whisperers, the three entering below |
| `s28_track_a` / `s28_track_b` | [−0.4, 1.3, 15.0] / [−0.4, 1.3, 24.0] | [4.2, 1.5, 13.0] / [4.2, 1.5, 22.0] | 44 | TRACK alongside the three walking the mall (camera on the café side, moving +Z with them) |
| `s28_mia_mid` | [−5.5, 0.95, 30.4] | [−2.6, 1.3, 31.6] | 40 | MID Mia on her bench (QR sign in frame) |
| `s28_c40_close` | [−1.4, 1.62, 26.9] | [0.2, 1.62, 28.0] | 34 | CLOSE Chase (2040) stopping dead |
| `s28_confiscate` | [−4.0, 2.0, 29.2] | [3.8, 2.2, 22.5] | 50 | WIDE: the swoop, the claw, the box on the pole (frame reaches y 4) |
| `s28_safebox` | [−3.6, 3.3, 28.2] | [−1.6, 2.6, 27.0] | 30 | the Safe Box with the ukulele neck behind its window |
| `s28_db_meter` | [−3.5, 2.2, 28.2] | [−2.4, 2.0, 28.4] | 30 | the 40 dB meter |
| `s28_box_code` | [−3.28, 3.31, 28.2] | [−0.8, 1.62, 28.4] | 22 | Chip View read of the AR code (Chase (2040)'s POV height) |
| `s28_box_keypad` | [−3.45, 3.25, 27.88] | [−3.3, 3.45, 27.2] | 30 | INSERT: Luka typing the code |
| `s28_plan_mid` | [0.4, 1.55, 27.0] | [2.2, 1.6, 25.0] | 40 | MID Chase looking drone → pole → tables (pan on him) |
| `s28_c40_watch` | [−1.2, 1.6, 25.0] | [−0.2, 1.62, 26.6] | 34 | CLOSE Chase (2040) "…I used to do that." |
| `s28_cafe_table` | [3.6, 0.8, 31.4] | [2.6, 1.5, 30.2] | 36 | the phone on table C |
| `s28_climb` | [−3.6, 2.6, 28.0] | [−2.2, 0.6, 25.8] | 46 | low angle up at Luka on the rungs ("Second-in-Climbing") |
| `s28_qr` | [−4.55, 0.6, 31.7] | [−3.2, 1.0, 32.2] | 32 | the QR tip sign (nobody tips) |
| `s28_leave` | [0.4, 1.4, 21.0] | [−5.0, 1.4, 34.6] | 44 | from behind Mia's shoulder as they walk away; "Hey. Grandpa." |
| `napclub` | [−8.0, 4.8, 41.0] | [−2.0, 2.0, 36.0] | 40 | NAP CLUB |
| `lanterns` | [−30.0, 5.0, 22.0] | [−29.0, 1.6, 9.0] | 40 | the still lanterns receding down Chinatown Mall |
| `tower_countdown` | [0.0, 112.0, −10.7] | [−2.0, 1.7, 30.0] | 18 | long lens up the mall to the facade countdown |
| `tower_from_mall` | [0.0, 50.0, −11.0] | [1.0, 1.6, 48.0] | 50 | the tower looming at the end of the mall |
| `s28_gate_track_a` / `_b` | [−26.0, 1.4, 9.0] / [−34.0, 1.4, 9.0] | [−21.5, 1.6, 5.8] / [−31.5, 1.6, 5.8] | 44 | TRACK along the S footpath past the gate (from the road side) |
| `s28_stage_door_ext` | [−28.4, 1.3, −11.0] | [−27.0, 1.6, −5.5] | 42 | the stage door, dry night, the dead blade sign above-right |
| `urn` | [7.75, 1.1, 30.0] | [6.6, 1.45, 30.0] | 34 | save |

**2.8 — the Starlight**

| id | at | from | fov | for |
| --- | --- | --- | --- | --- |
| `sl_wide_dusty` | [−37.0, 1.0, −17.0] | [−27.0, 4.6, −32.0] | 58 | establishing interior (torch beams) |
| `sl_posters` | [−43.65, 1.9, −23.5] | [−41.2, 1.7, −23.5] | 46 | examine the wall |
| `sl_poster_hero` | [−43.65, 1.8, −22.6] | [−42.6, 1.75, −22.6] | 30 | one legible poster (THE SOFT CORNERS) |
| `sl_desk` | [−34.7, 1.05, −26.5] | [−34.2, 1.75, −28.2] | 40 | examine the desk |
| `sl_stage` | [−35.5, 1.6, −13.5] | [−35.5, 1.7, −21.0] | 44 | examine the stage ("…Nearly.") |
| `sl_kettle` | [−43.4, 1.0, −14.0] | [−42.4, 1.4, −14.0] | 34 | save |

**2.9**

| id | at | from | fov | for |
| --- | --- | --- | --- | --- |
| `s29_floor` | [−36.6, 0.42, −18.5] | [−36.9, 0.62, −25.4] | 50 | **the locked low floor setup** (2.9_floor and 2.9_lights_out): three heads toward the lens, bodies receding to the stage, the high window top of frame with pink/teal rain-shadows crawling over them. Screen-left → right: Chase, Luka, Chase (2040) |
| `s29_floor_end` | [−36.6, 0.40, −18.5] | [−36.8, 0.60, −24.4] | 46 | the imperceptible push-in's end (Rue's `FLOOR_END` technique) |
| `s29_c40_dark` | [−38.3, 0.2, −23.1] | [−39.2, 0.55, −23.7] | 36 | CLOSE Chase (2040) in the dark, eyes open (torch-free: lit by the patch spill only) |
| `s29_coaster` | [−37.0, 1.11, −30.95] | [−37.0, 1.45, −30.5] | 28 | INSERT the coaster (CARD overlays) |
| `s29_window` | [−35.5, 4.6, −11.35] | [−35.5, 1.2, −20.0] | 40 | cutaway: rain on the high window, neon through it |
| `s29_door_out` | [−28.4, 1.4, −11.0] | [−28.0, 1.55, −6.8] | 38 | **MID the stage door from outside on Ann St, rain between camera and Luka** (rain box covers z −11…+7) |
| `s29_reverse` | [−29.0, 1.4, −14.9] | [−28.3, 1.6, −11.5] | 40 | REVERSE: Chase in the dark of the wing, coaster in hand (EXIT green on him) |
| `s29_luka_close` | [−28.4, 1.6, −11.4] | [−27.4, 1.6, −9.7] | 34 | CLOSE Luka in the doorway (hand to lanyard) |
| `s29_hands` | [−28.5, 1.1, −12.2] | [−27.6, 1.3, −11.6] | 30 | INSERT the brick phone into Chase's hand |
| `s29_door_wide` | [−28.4, 2.0, −11.0] | [−21.0, 1.4, 6.0] | 44 | optional WIDE from across Ann St (Chinatown lions in the foreground, the blade sign, the tower's base glowing at frame right) |

**2.10**

| id | at | from | fov | for |
| --- | --- | --- | --- | --- |
| `s210_wide_stage` | [−33.8, 1.0, −24.5] | [−39.5, 1.7, −29.5] | 50 | "[WIDE · the stage]": desk half-alive in the foreground, cables, Chase on the amp, the stage beyond |
| `s210_desk_two` | [−34.0, 1.2, −26.8] | [−33.2, 1.5, −24.2] | 42 | two-shot from the stage side, faces lit by the slate; **also the Sequencer's background** |
| `s210_slate` | [−34.4, 1.08, −26.6] | [−34.4, 1.55, −27.1] | 28 | INSERT the slate EXPORT (CARD overlays) |
| `s210_chase_close` | [−32.7, 1.25, −26.4] | [−33.6, 1.35, −25.4] | 34 | CLOSE Chase lit by the slate (headphones on / off) |
| `s210_c40_close` | [−34.7, 1.75, −27.1] | [−34.2, 1.75, −25.9] | 34 | CLOSE Chase (2040) ("…That's the bridge.") |
| `s210_locked` | [−33.0, 0.8, −17.5] | [−42.6, 4.6, −31.6] | 58 | **WIDE · locked, the whole venue**: bar edge in the foreground, the two at the desk/amp, Luka asleep before the stage, the high window going grey-blue |
| `sl_clock` | [−38.0, 3.4, −32.65] | [−38.0, 2.6, −30.0] | 26 | ONE MORE PASS time jumps (3:14 … 3:31 … 3:52) |

**3.6 / credits**

| id | at | from | fov | for |
| --- | --- | --- | --- | --- |
| `s36_passerby_pov` | [0.0, 112.0, −10.7] | [1.6, 1.62, 33.0] | 30 | step 26: POV up the mall at the countdown hitting zero (content lays the chip-view pop-up **Opt out? NO. ^ Thank you for staying.** over it) |
| `s36_mall_above` | [0.0, 0.0, 34.0] | [0.0, 30.0, 4.0] | 55 | step 27: the mall from above (rain box centred under it, neon full, lanterns swinging at frame right) |
| `s36_lanterns` | [−30.0, 5.0, 24.0] | [−27.0, 1.5, 12.0] | 44 | lanterns swinging (optional) |
| `cr_valley_neon` | [−2.0, 3.0, 30.0] | [6.5, 3.2, 52.0] | 48 | credits: the Valley in neon |
| `cr_starlight_gig` | [−35.5, 1.6, −13.5] | [−35.5, 2.6, −29.0] | 46 | credits: the Starlight stage (Mia, forty people) |

---

## 7. Gameplay zones and fixed cameras

Silent Hill / RE: high corners in the mall, long lenses across the street, **low** angles inside the venue for the
2.9 sneak. All exterior cams are `pan` (look follows the player within `limit` of `base`) except the puzzle cam, which
is `fixed` so the noise drone's cone never moves while the player reads it.

### 7.1 Cameras

```js
cams: {
  // ---- street (2.8)
  mall_head:       { type: 'pan',   pos: [-6.8, 5.4, 27.0],  base: [1.0, 0.8, 14.0],    look: 'player', fov: 48, limit: 0.50 },
  mall_puzzle:     { type: 'fixed', pos: [6.6, 6.6, 23.0],   look: [-3.0, 0.6, 30.0],  fov: 52 },
  mall_south:      { type: 'pan',   pos: [5.4, 4.8, 56.2],   base: [-1.0, 0.8, 40.0],   look: 'player', fov: 48, limit: 0.55 },
  ct_gate:         { type: 'pan',   pos: [-16.5, 4.4, 3.0],  base: [-30.0, 1.6, 13.5],  look: 'player', fov: 46, limit: 0.55 },
  starlight_front: { type: 'pan',   pos: [-21.0, 3.8, 9.8],  base: [-32.0, 1.4, -10.0], look: 'player', fov: 46, limit: 0.50 },
  tower_front:     { type: 'pan',   pos: [9.6, 2.4, 9.6],    base: [-1.0, 3.5, -11.0],  look: 'player', fov: 50, limit: 0.50 },
  // ---- the Starlight, high (2.8 dusty, 2.10, credits)
  sl_hi_front:     { type: 'fixed', pos: [-27.2, 5.2, -31.6], look: [-35.5, 0.4, -20.5], fov: 56 },
  sl_hi_back:      { type: 'fixed', pos: [-42.6, 5.0, -16.8], look: [-34.0, 0.4, -28.5], fov: 56 },
  sl_stage:        { type: 'fixed', pos: [-35.5, 4.6, -23.5], look: [-35.5, 1.0, -13.6], fov: 50 },
  sl_wing:         { type: 'fixed', pos: [-26.75, 2.6, -15.7], look: [-29.6, 0.6, -11.7], fov: 62 },
  sl_green:        { type: 'fixed', pos: [-40.4, 2.6, -15.7], look: [-43.0, 0.6, -12.0], fov: 64 },
  // ---- the Starlight, low (2.9 sneak)
  sl_lo_front:     { type: 'fixed', pos: [-43.3, 0.55, -19.2], look: [-29.0, 0.35, -21.0], fov: 40 },
  sl_lo_bar:       { type: 'fixed', pos: [-38.2, 1.28, -31.95], look: [-36.4, 0.45, -23.0], fov: 46 },
  sl_lo_wing:      { type: 'fixed', pos: [-26.8, 0.65, -11.75], look: [-29.0, 0.55, -17.5], fov: 56 },
},
```

The first key (`mall_head`) is the default.

### 7.2 Zones (first match wins; boxes tile every walkable area)

`dress()` rewrites the `cam` field of the interior zones in place (no allocation) — **high** set in `dusty28`,
`three210`, `gig`; **low** set in `night29`.

| # | box | cam (high / low) | covers |
| --- | --- | --- | --- |
| 1 | [−31.0, −16.0, −26.3, −11.3] | `sl_wing` / `sl_lo_wing` | the wing + stage door |
| 2 | [−43.7, −16.0, −40.0, −11.3] | `sl_green` / `sl_green` | green room |
| 3 | [−40.0, −16.0, −31.0, −11.3] | `sl_stage` / `sl_stage` | stage deck |
| 4 | [−43.7, −24.0, −26.3, −16.0] | `sl_hi_front` / `sl_lo_front` | floor, stage half (sleepers) |
| 5 | [−43.7, −32.7, −26.3, −24.0] | `sl_hi_back` / `sl_lo_bar` | floor, bar half (FOH, bar) |
| 6 | [−8.0, 11.0, 8.0, 22.5] | `mall_head` | mall head |
| 7 | [−8.0, 22.5, 8.0, 36.5] | `mall_puzzle` | **the puzzle corner** |
| 8 | [−8.0, 36.5, 8.0, 57.0] | `mall_south` | mall south (tower looms at frame top) |
| 9 | [−8.0, 7.0, 16.0, 11.0] | `mall_head` | S footpath at the mall head |
| 10 | [−40.0, 7.0, −8.0, 11.0] | `ct_gate` | S footpath west |
| 11 | [−35.0, 11.0, −25.0, 19.4] | `ct_gate` | Chinatown pocket |
| 12 | [−32.0, −7.0, −28.0, 7.0] | `starlight_front` | zebra W |
| 13 | [−46.0, −11.0, −18.0, −7.0] | `starlight_front` | N footpath (Starlight frontage) |
| 14 | [−2.0, −7.0, 2.0, 7.0] | `tower_front` | zebra E |
| 15 | [−18.0, −11.0, 20.0, −7.0] | `tower_front` | N footpath (tower forecourt) |

Cutscene-only areas the framing helper needs: the road outside zebras has **no zone** on purpose (lenses there are
explicit anchors such as `s29_door_out`).

### 7.3 Drones (content spawns them; posts, paths, cones)

| Drone | Kind | Post / spawn | Path | y | speed | cone {len, half} | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `d28_noise` | `noise` (a courtesy pod with a padded two-finger **claw** and a speaker-grille light) | swoop: `paths.d28_swoop`; then **post (−2.5, 2.6, 26.4), face ry −0.9** | parked | 2.6 | — | {3.4, 0.6} | the cone covers the bollard, the pole base and the front of Mia's bench; Chase (2040)'s read spot and the checkpoint are outside it. From `mall_puzzle` (6.6 m high, 27° down) the cone is a clean fan in the right-centre of frame |
| `d28_high_a` | `courtesy` | (−3.0, 7.5, 16.0) | ping-pong [[−3.0, 16.0], [−3.0, 50.0]] | 7.5 | 0.6 | none while high | **Signal converge**: on `signal:full` both high drones descend to y 1.8 and go to Chase (2040) (soft fail → `s28_cp`) |
| `d28_high_b` | `courtesy` | (3.5, 8.0, 50.0) | ping-pong [[3.5, 50.0], [3.5, 16.0]] | 8.0 | 0.6 | none while high | as above |

**The lure.** `DRONES.lure([3.6, 0.78, 31.4], sampleId)` (table C). Investigation hover point **(3.6, 2.1, 31.4)**
directly above the phone; while investigating, the drone's cone should collapse to a 0.6 m disc on the table (it's
transfixed by the noise). `s28_pick` is 1.15 m from the phone (hotspot r 1.3), so Chase can take it back from the
table's east side while it hovers. Recommended lure: `r ≥ 9` (the phone is "at full volume" on a hard table), `dur =
sample.lure.dur`; the climb + type takes ~9–12 s with a fast typist, so short samples (Kettle) are tight and long
ones (Luka (laughing)) are generous. The **Luka (laughing)** lure triggers DRONE: "Excuse me! Someone is having too
much fun!"

**The climb.** `s28_climb_0 → _1 → _2` (hold to climb). If the climb is slower than 4 s per stage, `pole_mia.wobble(0.035)`.
At `_2` the keypad hotspot activates (`safebox_mia.press()` per digit); correct code → `led('green')`, `door(1)`,
`content(null)` and the ukulele moves to Luka's hand.

**The swoop** (2.8_mia step 14): the drone flies `paths.d28_swoop`; at waypoint 2 content hides Mia's uke attachment
and calls `uke_prop.follow(drone, [0, −0.35, 0.1])`; at waypoint 3 `safebox_mia.door(1)`, `uke_prop.place('safebox')`,
`content('uke')`, `door(0)`; then the drone settles at its post.

---

## 8. Hotspots

`who`: L = Luka, C = Chase, C40 = Chase (2040), any = active character. The lines are the script's; this table fixes
place and verb only.

| id | at (mark / anchor) | r | verb | who | scene | does |
| --- | --- | --- | --- | --- | --- | --- |
| `h28_code` | `s28_c40_read` / `s28_box_code` | 2.6 | Read (Chip View) | C40, chip on | 2.8 | shows `ar_box_code` (a new 4-digit code each attempt); Signal fills |
| `h28_drop` | `s28_drop` / `s28_cafe_table` | 1.2 | Play a sample (phone on the table) | C | 2.8 | sample wheel → `phone_drop.show(true)`, `pulse(true, k)`, `DRONES.lure(...)` |
| `h28_climb` | `s28_climb_0` / `s28_climb` | 0.9 | Climb | L | 2.8 | the hold-to-climb sequence (§7.3) |
| `h28_keypad` | `s28_climb_2` / `s28_box_keypad` | — | Type code | L (at the top) | 2.8 | code entry → box opens |
| `h28_pick` | `s28_pick` / `s28_cafe_table` | 1.3 | Take phone | C | 2.8 | `phone_drop.show(false)` |
| `h28_uke_back` | `s28_uke_back` / `s28_mia_mid` | 1.2 | Give | L (holding the uke) | 2.8 | → 2.8_starlight |
| `h28_uke_sample` | `s28_uke_sample` | 1.2 | Record | C | 2.8 | sample `uke` (MIA: "Make it sound good.") |
| `h28_urn` | `kettle` / `urn` | 1.2 | Kettle | any | 2.8 street | "Put the kettle on? [YES] [NO]" |
| `h28_door` | `s28_door_out` / `s28_stage_door_ext` | 1.2 | Go in | any | 2.8 (`transit28`) | `stage_door.open(1)` → fade → `dress('dusty28')`, place at `s28_in*` |
| `h28_posters` | `sl_posters` / `sl_posters` | 1.6 | Examine | any (+C40 reply) | 2.8 | "Every band that played here before the Quiet." / CHASE (2040): "I saw half of these." |
| `h28_desk` | `sl_desk` / `sl_desk` | 1.4 | Examine | any (C and C40 lines) | 2.8 | CHASE: "Does it work?" / CHASE (2040): "Everything works if you shout at it." |
| `h28_stage` | `sl_stage_look` / `sl_stage` | 1.6 | Examine | any (C and C40 lines) | 2.8 | CHASE: "Ever played here?" / CHASE (2040): "…Nearly." |
| `h28_kettle` | `kettle_sl` / `sl_kettle` | 1.0 | Kettle | any | 2.8 (also usable 2.9/2.10 if content allows) | "Put the kettle on? [YES] [NO]" + `green_room.kettle_steam()` |
| `h29_note` | `s29_bar` / `s29_coaster` | 1.0 | Write a note | L | 2.9 | "Write a note? [YES]" → INSERT → `coaster.write()`; the coaster goes in Luka's hand |
| `h29_leave_note` | `s29_note_drop` | 0.9 | Leave it | L (has the coaster) | 2.9 | `coaster.place('chest_chase')` |
| `h29_door` | trigger box [−29.0, −12.6, −27.8, −11.3] | — | (walk in) | L (note left) | 2.9 | → 2.9_door |

Soft fails in 2.9 are not hotspots: see the stir rules (§12.7).

---

## 9. Cutscene needs (shots → geometry that must exist)

**2.8_crane.** CRANE down (`s28_crane_a` → `_b` → `_c`, ~8 s): needs the tower's south facade with the **countdown band
lit (QUIET IN 16:28:00)** and the circling drones in the storm; the storm dome with lit cloud underbellies; then Ann
Street from above (wet bitumen with neon reflections, slow hover-cars, padded bollards along both kerbs), the
**Chinatown gate and still lanterns** receding south (frame right), roofs of S2/S3 with AC units and dimmed rooftop
neon, the mall with **NAP CLUB**, foam on every bollard/pole/corner, whisperers (rigs + far crowd), and the 4 shush
drones gliding below the lens. Lightning: distant cloud flicker only.
**TRACK** `s28_track_a → _b`: the café side of the mall in the background (tables, closed umbrellas), the three walking.

**2.8_mia.** MID `s28_mia_mid` (bench, QR sign, the pole beside her with its ring light); CLOSE `s28_c40_close`; the
WIDE swoop `s28_confiscate` with `paths.d28_swoop` (needs `uke_prop` + `safebox_mia` door + content); "That's the
third one this month." — `safebox_b`/`_c` with their trumpet and tambourine are visible on the other poles (pole_b
at frame left in `s28_confiscate`).

**2.8_plan.** MID `s28_plan_mid` (a pan from the drone to the pole to the café tables — all three visible from the
mark); ORBIT around `s28_plan_chase` (2.4 m clear radius: nearest objects table A at 3.0 m, the drone at 2.9 m and
y 2.6); CLOSE `s28_c40_watch`.

**2.8_starlight.** Two-shot at the bench (framing helper); `s28_leave` from behind Mia as they go; then the walk:
`s28_gate_track_a → _b` (lanterns overhead, still; the `gust` bag tumbling past them is the only thing that moves),
across zebra W, `s28_stage_door_ext` as Luka pushes the stage door (it opens: "Back door doesn't lock."), fade;
inside, `sl_wide_dusty` with the phone torch.

**2.9_floor / 2.9_lights_out.** `s29_floor` locked with an 80 s linear push to `s29_floor_end` (Rue's technique; the
push "settles" if the reader is fast). Needs: `coats_sleep` (3 drapes), the **pink spot** (`lamp('neon')`) on the
sleepers, `window_light` patches with **crawling rain shadows**, the high window in the top of frame with streaks and
the street glow (pink/teal/red), rain-on-roof ambience, lightning flares through the window. Chase (2040) "snores
softly" (content: a slow chest rise on his rig + sfx). The only cut: `s29_c40_dark` (eyes open).

**2.9_door.** `lamp('door')` + env `annst` for the outside shots: `s29_door_out` — rain falling between the lens and
Luka (`rain.at(-28.4, -2.0)` so the box spans z −11…+7), the wet footpath reflecting the bulkhead, the stage door
swung open (`stage_door.open(1)`), the dark wing behind him with the EXIT glow. Ann Street behind the camera is not
seen; `s29_door_wide` optionally shows the street, the Chinatown lions, the blade sign and the tower base. REVERSE
`s29_reverse` with env back to `lights_out` and `lamp('neon')` (inside the wing the EXIT sign + the open door's
street light are what light Chase). CLOSE `s29_luka_close`; INSERT `s29_hands`.

**2.10_promise / 2.10_bounce.** `three210`: `foh_desk.state('half')`, `desk_cables` visible, `slate_desk` plugged in,
`headphones_desk`, `amp_seat`, Luka asleep under his coat (`coats_sleep.show(0b010)`), `lamp('slate')`, rain amount
0.6 on the roof (audio) and the high window. Shots: `s210_wide_stage`, `s210_desk_two`, CLOSEs; the Sequencer runs
full-screen over `s210_desk_two`; ONE MORE PASS time jumps via `wall_clock_sl.set(3, 14)` … `(3, 31)` … `(3, 52)` +
`sl_clock`; INSERT `s210_slate` (`slate_desk.screen('export')` → `'saved'`). The final **WIDE · locked**
`s210_locked`: `world.env('dawn', 3)`, `window_light.light(0x8aa0c8, 0.8)`, rain amount → 0.15, mirror ball
sparkles fade in — hold 3 s.

**3.6 cutaway (`lit36`).** `s36_passerby_pov` (the facade countdown visible up the mall: content calls
`facade_countdown.zero()` → 00:00:00 → Yes-yellow glow); `s36_mall_above` with `rain.at(0, 32)`, neon 1.0,
`lanterns.swing(true)`, `traffic.stop(true)`, whisperer rigs on the `s36_laugh_*` marks looking up and laughing,
`s36_phone` answering a ringing phone, `crowd_far.mode('look_up')`, `blade_starlight.lit(true)`, the shush drones gone.
Don't add competing music: the score is "two"; the set's ambience in `lit36` is rain, crowd laughter and one phone
ring.

**Credits.** `cr_valley_neon` (`credits_neon`: neon 1.0, dry, lanterns gently swinging, people) and
`cr_starlight_gig` (`gig`: `truss_pars.on(true)`, `crowd_gig.on(true)` (40), Mia at `cr_mia_stage`, `lamp('gig')`,
mirror ball sparkles).

---

## 10. Ambience and `update(dt, ctx)`

**Ambience** (`ambience: { loops: ['whisper_crowd', 'thunder_far', 'neon_hum', 'hover_far'], room: 'none' }` default;
`dress()` re-sends `AUDIO.ambience({ loops })` + `AUDIO.setRoom(room)` when the state changes, guarded by
`typeof AUDIO !== 'undefined'`). Loop names are requests to the audio owner (`03-audio.js`).

| State | Loops | Room |
| --- | --- | --- |
| `quiet28`, `transit28` | `whisper_crowd` (many soft sibilant voices, no words), `thunder_far` (distant rolls every 20–40 s), `neon_hum` (faint 100 Hz buzz near signs), `hover_far` | `none` (street) |
| `dusty28` | `room_tone` (dusty hum), `thunder_far` (muffled) | `hall` (medium-large, dull reverb) |
| `night29` | `rain_roof` (heavy, on a tin roof), `thunder` (with the flashes); when the stage door is open: `rain_street` crossfades up | `hall` |
| `three210` | `rain_roof` (thinning: its gain follows the env rain amount), `desk_hum` (a faint mains hum from the half-alive desk) | `hall` |
| `lit36` | `rain_street`, `crowd_laugh` (sparse), one `phone_ring` one-shot at `s36_phone` | `none` |
| `credits_neon` | `crowd_street` (happy, normal volume) | `none` |
| `gig` | — (the credits music plays) | `hall` |

One-shots the set fires (rate-limited ≥ 0.5 s): `hover_chirp_whisper` ("Turning left. Are you sure?" at a whisper is
content's; the set only plays the soft chirp when a car yields at a zebra), `thunder` 1.2–3.0 s after each 2.9
flash, `door_creak` on `stage_door.open`, `kettle_click` via the hotspot.

**`update(dt, ctx)` — no allocation.** Preallocate a `Matrix4`, `Vector3` ×2, `Quaternion`, `Color` scratch; iterate
arrays with `for`; pass hoisted named functions to `world.actors.forEach` (Rue's `nearDoor` pattern).

1. Scene change → `dress(AUTO[state.scene] || R.state)`. Env change (`ctx.env !== R.env`) → set rain amount target,
   lightning rate, `window_light` tint, lamp.
2. **Neon**: level `R.neon` eases toward its target (0.35 normally, 1.0 in `lit36`/`credits_neon`, 2 s ease);
   write `M.neonM/T/R/Nap.color` = full colour × level × flicker. Flicker: per material, a cheap burst function
   (`sin(t·1.7+k) + sin(t·2.9+k) > 1.7 → 0.6`); NAP CLUB's "P" buzzes every ~9 s for 0.4 s. Reflection opacity follows.
3. **Lanterns**: still (`swing` off — matrices untouched after build); swinging: write 54 + 54 instance matrices
   (rotation about the hang point, ±0.25 rad, own phase/frequency), one `needsUpdate` per IM.
4. **Traffic**: 6 cars at 2.0 m/s on their lanes, wrap at x ±70; yield when an actor stands on a zebra (cars within
   10 m upstream stop at the stop line; resume 0.8 s after it clears); bob y 0.32 + 0.02·sin(2t + i); `stop(true)`
   decelerates all to 0 over 1.5 s.
5. **Shush drones**: drift along a closed loop (mall + Ann St) at 0.8 m/s, gentle bob; ring scale 1 → 3 and opacity
   0.6 → 0 every 2.5 s (phase per drone).
6. **Whisperers** (Rue `CUST` logic, `WALKP` preallocated): bench pair lean together and flap mouths alternately (no
   blips); queue pair shuffle a step every 6–10 s; walkers traverse `paths.walk_mall` with pauses; colliders written
   in place; in `lit36` they turn to face −Z (the tower) and play `laugh`/`look_up` alternately.
7. **Crowd figures**: bob ±0.02 m; `look_up` tilts heads 0.5 rad.
8. **Tower / skyline**: call `R.tower.userData.update(dt, t)` and `R.sky.userData.update(dt, t)` (drones circling,
   countdown ticking, window flicker, cloud drift, lightning).
9. **Lightning** (`sky_flash`): a timer per rate; on fire, cloud flash material spikes for 0.12 s (or the Reduce
   Flashing swell), in `night29` also `window_glass` + `window_light` flare white; schedule `AUDIO.sfx('thunder')`.
10. **Rain**: the world advances `uTime`; the set only moves `rain` via `at(x, z)` and lerps its amount target.
11. **Interior**: `window_glass` streak offset.y += 0.12·dt·rainAmount; `rshadow` offset.y = t·0.06 (while rain >
    0.05); mirror ball rotation.y += 0.05·dt, sparkles rotate with it; desk LEDs/meters (`half`: sin-driven; `live`:
    content-fed level); bulkheads steady with a 0.2 s dip every ~30 s; `stage_door` and `safebox_mia.door` ease to
    their targets; `pole_mia` wobble decays (×(1 − 3·dt)); `uke_prop.follow` copies its target's world position.
12. **Mall props**: `pole_mia.meter` idle wobble (34–39 dB; in 2.8_mia it spikes to 52 for the confiscation, content
    calls `meter(52)`); `phone_drop` ring pulse; `gust` bag along `paths.gust`; tree crown sway; QUIET CUP urn steam
    only on save.

---

## 11. Performance budget (target < 300; expected worst ≈ 150 in the mall, ≈ 90 inside the Starlight)

| Group | Draw calls |
| --- | --- |
| Region M static: `M.vc` 1, `M.atlas` 1, `M.facade` 1, `M.wet` 2, `M.glass` 1, `M.glow` 1, neon 4, reflections 1 | 12 |
| M instanced: bollards 1, lamps 2, lanterns 2, traffic 3, shush drones 2, crowd 2, trees 2 | 14 |
| M named props: pole_mia + safebox 3, other boxes 2, uke 1, phone 1, cafe 1, gate 1, lions 1, blade 1, napclub 1, door 2, gust 1 | ~16 |
| Tower (`tower()`): shell 2, countdown 1, Yes 1, drones 2, lobby 1 | 7 |
| Skyline (`skyline()`): ≈ 16 (§12.5) | 16 |
| Rain 1, puff 1, blob shadows (batched per rig) | 2 |
| Rigs: whisperers 6, Mia 1, heroes 3 (≈ 3 calls each) | ~30 |
| Content drones (noise + 2 high, 2 calls each) | 6 |
| Region S (hidden from the mall by `dress`, frustum-culled anyway): `M.vcS` 1, `M.atlasS` 1, patches 4, streak glass 1, desk 2, slate 1, cables 1, coats 1, mirror ball 2, pars 1, crowd_gig 2, EXIT/bulkheads 1 | ~19 |

Rules: everything static and untextured in a region merges into its one `M.vc*` mesh; every repeat above is an
`InstancedMesh`; `dress()` hides Region S while the camera is on the street (except `night29`/`three210`, where Region
M's mall + Chinatown groups hide and only the Ann St strip near the door stays); textures ≤ 256 px; no shadow maps;
no per-frame allocation; whisperer rigs are built once in `build()` and reused (parked at 1e4 when hidden).

---

## 12. API summary, shared builders, data exports, engine notes

### 12.1 `SETS.valley`

```js
SETS.valley = {
  env, build, marks, anchors, cams, zones, colliders, floor, props, ambience, update,
  dress(state),        // 'quiet28' | 'transit28' | 'dusty28' | 'night29' | 'three210' | 'lit36' | 'credits_neon' | 'gig'
  lamp(name),          // 'bench' | 'torch' | 'neon' | 'door' | 'slate' | 'gig' | 'off'   (§3.4)
  neon(k, dur = 2),    // neon level target 0..1 (0.35 = safe brightness)
  VG,                  // §12.3 shared geography
  tower(opts),         // §12.4 shared builder → Group
  skyline(opts),       // §12.5 shared builder → Group
  creaks,              // §12.7
  paths,               // §12.2
  ar,                  // §12.8
};
```

**AUTO dress map**: `{ '2.8': 'quiet28', '2.9': 'night29', '2.10': 'three210' }`; content calls `dress('transit28')`
after the ukulele, `dress('dusty28')` on entering the Starlight, `dress('lit36')` for the 3.6 cutaway and the credits
states explicitly. The auto map fires only on a scene change.

**Dress states**

| State | Env (content sets it; listed for reference) | Shown / on | Hidden / off | Lamp | Zones (interior cams) |
| --- | --- | --- | --- | --- | --- |
| `quiet28` | `quiet` | Region M + F; whisperers, crowd, shush drones, traffic 4, neon 0.35, lanterns still, `gust`; Safe Box shut/empty; confinement at the mall head | Region S, rain, `phone_drop` | `bench` | — |
| `transit28` | `quiet` | as `quiet28`; footpaths, zebras and Chinatown pocket walkable; Safe Box open/empty | confinement | `bench` | — |
| `dusty28` | `starlight` | Region S (desk dead, coats hidden, no creaks), Ann St strip | mall + Chinatown groups, whisperers, shush drones | `torch` | high |
| `night29` | `lights_out` / `annst` | Region S with `coats_sleep` (all 3), `creak_boards`, coaster on the bar, window light pink/teal, rain `at(-28.4, -2.0)`, lightning rate 2.9; Ann St strip + tower; N footpath confinement (Starlight frontage only) | mall + Chinatown groups, whisperers, crowd | `neon` (inside) / `door` (outside shots) | low |
| `three210` | `three_am` → `dawn` | Region S: desk `half`, cables, slate, headphones, amp; Luka's coat only; window light teal 0.5; rain amount 0.6 | creaks, other coats | `slate` | high |
| `lit36` | `lit` | Region M + F; neon 1.0, lanterns swinging, rain `at(0, 32)`, traffic stopped, people in the rain (whisperer rigs on `s36_*`), crowd `look_up`, blade lit | shush drones, Region S, confinement | `off` | — |
| `credits_neon` | `lit_dry` | as `lit36` without rain; lanterns gently swinging (±0.1) | — | `off` | — |
| `gig` | `gig` | Region S: pars on, crowd_gig (40), desk `live`, mirror-ball sparkles | coats, creaks | `gig` | high |

### 12.2 `paths` (`[x, z]` for walkers/drones on the ground plan; 3-D where noted)

```js
paths: {
  d28_swoop: [[-1.0, 7.0, 22.0], [-4.9, 1.5, 30.2], [-3.6, 4.2, 28.2], [-2.5, 2.6, 26.4]],   // 3-D: high → Mia's uke → the box → post
  d28_high_a: [[-3.0, 16.0], [-3.0, 50.0]],   d28_high_b: [[3.5, 50.0], [3.5, 16.0]],          // y 7.5 / 8.0
  walk_mall: [[1.6, 13.0], [1.6, 55.0]],                                                      // whisperer walkers (ping-pong)
  shush_loop: [[0, 14], [0, 54], [-4, 54], [-4, 14], [-20, 2], [20, 2]],                      // decor drones, y 7–9
  gust: [[-26.0, 18.6], [-33.6, 12.4]],                                                       // the tumbling bag (2.4 s)
  traffic_east: [[-70, -3.5], [70, -3.5]],  traffic_west: [[70, 3.5], [-70, 3.5]],
  walk_starlight: [[0, 9.0], [-27.0, 9.0], [-30.0, 6.0], [-30.0, -6.0], [-28.4, -8.6]],        // the 2.8 walk (cutscene)
  sneak29: [[-36.6, -22.4], [-37.0, -26.0], [-37.0, -29.9], [-35.0, -22.4], [-33.0, -19.2], [-28.5, -16.0], [-28.4, -12.1]],
}
```

### 12.3 `VG` — the shared Valley geography (export as data)

```js
VG: {
  axes: '+X east, +Z south, Y up, metres',
  annSt:     { road: [-120, -7, 120, 7], roadY: -0.10, fpN: [-120, -11, 120, -7], fpS: [-120, 7, 120, 11],
               zebraW: [-32, -7, -28, 7], zebraE: [-2, -7, 2, 7], lanes: { east: [-5.25, -1.75], west: [1.75, 5.25] } },
  mall:      { box: [-8, 11, 8, 110], detailTo: 57 },                      // Brunswick St Mall
  chinatown: { box: [-36, 11, -24, 110], gate: [-30, 0, 11.8],
               lanternRows: { z0: 13, z1: 57, dz: 4, xs: [-34.5, -31.5, -28.5, -25.5], y: 5.2 } },
  wickham:   { z: [110, 124] },                                            // cross street at the far end of both malls
  starlight: { box: [-44, -33, -26, -11], h: 8.5, stageDoor: [-28.4, 0, -11.0], blade: [-26.6, 4.0, -11.0, 11.0],
               hiWindow: [-39, 4.0, -32, 5.2] },
  tower:     { box: [-18, -41, 18, -11], podiumTop: 13.5, floorY: n => 13.5 + 4 * (n - 3),   // L3..L30
               top: { floorY: 125.5, ceilY: 131.0 }, roofY: 131.0, parapetY: 132.2,
               countdown: { x0: -16, x1: 16, y0: 108, y1: 116, z: -10.7 },               // south face
               yes: { x0: -12, x1: 12, y0: 133, y1: 141, z: -36.0 },                     // on the roof crown, facing +Z
               crown: [-14, -41, 14, -35, 131, 134],                                     // plant box on the roof's north edge
               canopy: [-8, -11, 8, -8, 5.0], doors: [-2, 2] },
  lots: { /* §12.5 */ },
  river:     { z0: 290, z1: 360, y: -2 },
  bridge:    { a: [90, 0, 330], b: [260, 0, 395], deckY: 30, towers: [[147, 352], [203, 373]], towerH: 74 },   // Story Bridge
  cbd:       { centre: [-250, 0, 290], r: 70, count: 22, hMin: 60, hMax: 200 },
  cootha:    { bearing: 'W', masts: 3 },                                    // on the horizon band
  neon: [ /* landmark neon for far views: { id, at:[x,y,z], w, h, color } */
    { id: 'napclub',  at: [-7.95, 4.8, 41.0], w: 4.4, h: 1.2, color: 0xff3fa4 },
    { id: 'karaoke',  at: [-39.5, 7.5, 11.0], w: 5.0, h: 5.0, color: 0xff3fa4 },
    { id: 'blade',    at: [-26.6, 7.5, -10.4], w: 1.3, h: 7.0, color: 0xff4fa0 },   // dead until lit36
    { id: 'whisper',  at: [7.95, 4.6, 41.0],  w: 2.0, h: 1.6, color: 0x2fe8d6 },
    { id: 'cocktail', at: [19.0, 7.0, 11.0],  w: 2.0, h: 2.4, color: 0x2fe8d6 },
  ],
}
```

### 12.4 `tower(opts)` — the Optus Tower exterior (shared)

`SETS.valley.tower({ podium: 'night' | 'none', drones = 12, countdown = true }) → THREE.Group` named `tower`.

- **Shell**: footprint VG x −18…18, z −41…−11. Curtain wall on all four faces from `podium === 'none' ? 13.5 : 0` to
  the roof (y 131.0), parapet glass to 132.2. Module 2.0 m wide × 4.0 m floor height; mullions `#3a4048`; spandrel
  band 0.6 m per floor `#9aa2aa`; glass `#5f7484` with 3 texture variants (dark / dim-lit / lit) chosen per floor
  band (mostly dark at night, a few dim-lit; by day the reflections variant). **L30 band** (y 121.5–125.5): a strip
  of tiny blue dots (docked drones) visible through the glass. **Top floor** (y 125.5–131.0): smoked dark glass on all
  faces (the Manager's office looks out through the south face). Floor lines must stay continuous so a crane up the
  facade reads as ~30 storeys.
- **Podium** (`'night'`, used by `valley`): the 3-storey glass atrium front x −18…18, y 0…13.5 at z −11, dim, with
  `lobby_card` (a 256 × 128 painted interior: the 13 m bubble-wrapped tree, the MANDATORY FUN banner, the countdown
  wall) 6 m behind the glass; the canopy x −8…8, z −11…−8, y 5.0–5.4 with a padded edge; doors x −2…2 (closed).
  `hq_atrium` passes `'none'` and builds its own podium.
- **`facade_countdown`**: an LED band 32 × 8 m on the south face (x −16…16, y 108…116, z −10.7): `t_countdown`
  (256 × 64, nearest) repainted **from a pre-rendered digit atlas with `drawImage`** (no strings in the frame loop)
  at most once per second. `userData`: `set(h, m, s)`; `run(rate)` (seconds of countdown per real second; 0 = frozen;
  default 1); `text(mode)` `'quiet'` → "QUIET IN hh:mm:ss"; `zero()` → reads 00:00:00, holds 1 s, then cross-fades
  to a plain **Yes-yellow** glow band over 2 s (3.6). Emissive, fog-free. Story times: 2.8 `16:28:00`, 2.9 `10:48:00`,
  2.10 `08:58:00`, 3.1 `01:58:00`, 3.2 roof `00:17:00`.
- **`yes_sign`**: on a lattice frame on the roof's north part (VG x −12…12, z −36.0, letters y 133…141, facing +Z),
  the Yes logo (`canvasTex.yes`) in Yes yellow, emissive, fog-free; `lit(bool)`. A plant box x −14…14, z −41…−35,
  y 131…134 sits behind it.
- **`tower_drones`**: 12 drones circling (InstancedMesh pod + light), orbits r 26–40 m around (0, −26), y 95–150,
  0.15–0.3 rad/s, banked 0.2 rad, each with its own phase — "like gulls". `count(n)`, `color(hex)` (blue; amber
  alarm; Yes yellow after 3.5 if hq sets want it).
- `userData.update(dt, t)` — the host set calls it from its `update` (no allocation).

### 12.5 `skyline(opts)` — the Valley and the city as backdrop (shared)

`SETS.valley.skyline({ skip = [], sky = 'storm', neon = 0.35, detail = 'mid' }) → THREE.Group` named `skyline`.

**Lots** (`VG.lots`, built as textured boxes with facade tiles from `t_city` 256 × 256 and roof boxes; each lot
carries its neon from `VG.neon`):

| Lot | Box (VG) | h | Notes |
| --- | --- | --- | --- |
| `N1` | [−70, −41, −44, −11] | 14 | |
| `STARLIGHT` | [−44, −33, −26, −11] | 8.5 | blade sign (dead / lit with the lot) |
| `TOWER` | [−18, −41, 18, −11] | — | **never built by skyline** (`tower()` does it) |
| `N3` | [24, −41, 60, −11] | 18 | |
| `SW1` | [−60, 11, −36, 40] | 11 | **karaoke neon** (pink mic + teal stars) on the Ann St face |
| `S2`, `S2b` | [−24, 11, −8, 57], [−24, 57, −8, 110] | 15, 12 | mall west faces get neon shapes; S2 = NAP CLUB face |
| `S3`, `S3b` | [8, 11, 30, 57], [8, 57, 30, 110] | 12, 14 | mall east faces get neon shapes |
| `S4` | [30, 11, 60, 40] | 16 | |
| `CHINATOWN` (feature) | gate + 48 lanterns + the mall strip | — | low-poly gate, lantern IM (red emissive), `swing(on)` |
| procedural | a 60 m street grid out to r 480 (streets every 60 m on both axes, plus Ann St, Wickham St, the two malls), lots 2–6 storeys (6–22 m), 10% at 40–90 m; seeded RNG `seed = 2040` so every set gets the same city | | facade tile + lit-window variant per lot; rooftop AC boxes; 1 in 5 lots has a neon strip on its street face (magenta/teal) |
| `CBD` | towers around `VG.cbd` | 60–200 | lit window grids; fog-free emissive windows |
| river + `BRIDGE` | water plane z 290…360; the Story Bridge from `VG.bridge` (cantilever truss silhouette, 2 towers to 74 m, deck lights) | | |
| band + sky | horizon band r 500 (city silhouette, hills, Mt Coot-tha with 3 blinking masts), sky dome, 6 cloud cards | | `sky(mode)`: `'storm'` (dark green-grey / bruise, underbelly neon tint), `'midday_storm'` (prologue: bruise-coloured, brighter), `'golden'` (3.7: washed gold, steaming), `'clear_night'`, `'dawn'` |
| street life (far) | `crowd_dots` Points (160) in the two malls; `traffic_dots` (24) on Ann/Wickham streets | | `crowd(mode)`: `'quiet'` (few, slow), `'look_up'` (stopped, chip-light blink), `'none'` |

`skip` removes any lot/feature by id. Callers: `valley` → `['STARLIGHT', 'S2', 'S3', 'CHINATOWN', 'TOWER']`;
`hq_atrium` → `['TOWER']`; `hq_top` / `hq_roof` → `['TOWER']`.

**API (`userData`)**: `lit(k, dur)` neon + window-light level (0.35 Quiet; 1.0 the Valley lit up); `swing(on)`
(Chinatown lanterns); `rain(on)` (a few tall translucent rain-haze sheets over the city with scrolling streaks);
`crowd(mode)`; `sky(mode)`; `flash(k)` (lightning; respects Reduce Flashing); `bridgeLights(on)`;
`update(dt, t)` (allocation-free; the host calls it). Cost ≈ 16 draw calls: blocks 2 IM, roofs 1 IM, neon strips 1 IM,
CBD 1, ground 1, river 1, bridge 2, chinatown 3, band 1, clouds 1, crowd 1, traffic 1.

### 12.6 Contract for `hq_top`, `hq_roof` and `hq_atrium` (what the Valley backdrop must share)

1. **Frame**: place the backdrop in VG. Optus Tower occupies VG x −18…18, z −41…−11; the **top floor** is y
   125.5–131.0, the roof slab y 131.0, parapet 132.2. If your set uses a local frame, document `local = VG − origin`.
2. **The Manager's glass wall is the tower's south face (VG z −11)**; through it, the view is **due south straight
   down Brunswick St Mall** (x 0), Chinatown Mall parallel 30 m to the right (west), Ann Street across the foot of the
   tower, the river ~300 m out, the **Story Bridge** in the distance at bearing ≈ 27° east of south (VG
   (90…260, 330…395)), the CBD towers ≈ 40° west of south. Build it with
   `SETS.valley.skyline({ skip: ['TOWER'], sky, neon })` so the street layout, neon and lanterns match what the player
   walked in 2.8.
3. **States to drive** (all via the skyline API): prologue P and the 1.6 address background — `sky('midday_storm')`,
   `lit(0.35)`, lanterns still; 3.2 roof — `sky('storm')`, `lit(0.35)`; **the roof's "countdown under their feet"
   is `tower().facade_countdown` set to 00:17:00** (build `tower({ podium: 'none' })` or at least its countdown band);
   3.3–3.5 — storm, `lit(0.35)`, `rain(true)` after 3.3 step 1; **3.6 step 25 at 11:58**: `lit(1.0, 2)`,
   `swing(true)`, `rain(true)`, `crowd('look_up')`, `bridgeLights(true)`; 3.7 / A1 / B1 — `sky('golden')`,
   `lit(1.0)`, `rain(false)`, lanterns swinging gently, `crowd('quiet')` → normal.
4. **Yes yellow** in the skyline only on the tower (theirs) — none in the city.
5. **Fallback**: if `SETS.valley` is missing (its leaf failed to parse), build a plain dark horizon band and a few
   box towers; never throw.
6. **3.6 steps 26–27** are best played on `valley` itself (`lit36`, §9): preload under the black at 3.3's start with
   `world.liveMax = 3`.

### 12.7 `creaks` and the 2.9 stir rules (data + recommendation for content/systems)

```js
creaks: [[-36.8, -26.0, 0.45], [-36.2, -28.6, 0.45], [-33.0, -19.2, 0.5], [-30.0, -18.0, 0.5], [-28.5, -14.2, 0.45]],   // [x, z, r]
```

Recommended stir model (content owns it): `stir` 0…100, decays 12/s. Running: +60/s. Walking: +6/s within 1.2 m of a
sleeper's head (z −23.2 line). Stepping onto a creak (enter its radius at any speed): +40 and an `sfx('creak')`.
At 100: the nearest sleeper rolls over and mumbles; fade, Luka back at `s29_luka` (no game over). The intended route
(`paths.sneak29`) threads between the creaks; the sheen decals (`creak_boards`) make them readable from `sl_lo_front`
and `sl_lo_bar`.

### 12.8 `ar` (Chip View labels; content: `for (const a of SETS.valley.ar) AR.add(a)` when Chip View is allowed)

```js
ar: [
  { id: 'ar_quiet_head',   at: [0.0, 3.6, 11.4],    text: 'QUIET HOURS 24/7', kind: 'sign', w: 3.2 },
  { id: 'ar_quiet_mid',    at: [0.0, 4.4, 30.0],    text: 'QUIET HOURS 24/7 · PLEASE WHISPER', kind: 'sign', w: 4.0 },
  { id: 'ar_quiet_south',  at: [0.0, 4.4, 48.0],    text: 'QUIET HOURS 24/7', kind: 'sign', w: 3.2 },
  { id: 'ar_whisper_ct',   at: [-30.0, 3.2, 12.4],  text: 'PLEASE WHISPER', kind: 'sign', w: 2.4 },
  { id: 'ar_mall',         at: [8.4, 3.0, 11.4],    text: 'BRUNSWICK ST MALL', kind: 'sign', w: 2.4 },
  { id: 'ar_annst',        at: [-8.5, 3.0, 7.4],    text: 'ANN ST', kind: 'sign', w: 1.4 },
  { id: 'ar_chinatown',    at: [-36.5, 3.0, 11.4],  text: 'CHINATOWN MALL', kind: 'sign', w: 2.4 },
  { id: 'ar_box_code',     at: [-3.27, 3.31, 28.2], text: '0000', kind: 'code', w: 0.5 },     // content rewrites per attempt
  { id: 'ar_pole',         at: [-3.6, 2.6, 28.4],   text: 'NOISE DOCK · CONFISCATED ITEMS RELEASED AFTER REVIEW', kind: 'sign', w: 1.8 },
  { id: 'ar_cafe',         at: [7.9, 3.4, 30.0],    text: 'QUIET CUP · decaf after 6 (for your safety)', kind: 'sign', w: 2.6 },
  { id: 'ar_napclub',      at: [-7.9, 3.2, 41.0],   text: '45-minute power nap $19 · now booking 2041', kind: 'price', w: 2.4 },
  { id: 'ar_dumpling',     at: [-7.9, 3.2, 15.5],   text: 'DUMPLING HOUSE · steam level: safe', kind: 'sign', w: 2.2 },
  { id: 'ar_247',          at: [-7.9, 3.2, 23.0],   text: '24/7 · EASY MART', kind: 'sign', w: 1.8 },
  { id: 'ar_bar_closed',   at: [-7.9, 3.2, 31.0],   text: 'CLOSED FOR QUIET HOURS', kind: 'sign', w: 2.2 },
  { id: 'ar_records',      at: [-7.9, 3.2, 51.5],   text: 'RECORDS · CLOSED (NOISE)', kind: 'sign', w: 2.0 },
  { id: 'ar_whisper_bar',  at: [7.9, 3.2, 41.0],    text: 'WHISPER BAR · cocktails at a reasonable volume', kind: 'sign', w: 2.6 },
  { id: 'ar_kebab',        at: [7.9, 3.2, 51.5],    text: 'KEBABS · mild sauce only', kind: 'sign', w: 2.0 },
  { id: 'ar_starlight',    at: [-35.0, 3.2, -10.9], text: 'THE STARLIGHT · CLOSED FOR QUIET HOURS', kind: 'sign', w: 3.2 },
  { id: 'ar_tower',        at: [0.0, 6.2, -10.9],   text: 'OPTUS · Yes (Are you sure?)', kind: 'sign', w: 3.4 },
  { id: 'ar_karaoke',      at: [-39.5, 3.4, 11.0],  text: 'SILENT KARAOKE · lips only', kind: 'sign', w: 2.6 },
]
```

(Cloud+ ads are added automatically by the Chip View system whenever it is on.)

### 12.9 Engine notes (for `30-world.js` / `33-systems.js` owners; minimal hooks)

1. **`world.torchAuto` is global.** This set places the spot by hand (`lamp()`), sets `torchAuto = false` for fixed
   lamps and `true` for `'torch'`. Please reset `torchAuto = true` in `showE()` so no set leaks it (same request as
   `parade`).
2. **Set-owned rain that moves**: the engine uses a group child named `rain` with `.uniforms`; this set moves it with
   `rain.position` (the box is local). Nothing else needed.
3. **Zones' `cam` fields are mutated by `dress()`** (interior high/low). The engine reads `zone.cam` every tick, so
   this works; if the engine ever caches zone→cam, expose `world.recutCam()`.
4. Drone `kind: 'noise'` needs a claw (art: drone builders) and a "transfixed" investigate state (cone collapsed to a
   disc) — requested of `33-systems.js`.
5. Shared builders are called at other sets' build time; they must be re-entrant and use `mat()`/`canvasTex()` with
   stable `key`s (e.g. `'vg_countdown'`, `'vg_city'`) so programs are warmed once at boot.
