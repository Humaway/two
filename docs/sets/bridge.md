# SET `bridge` — Clontarf checkpoint, the Ted Smout Memorial Bridge, the Brighton mangroves (Sunday 23 December 2040)

File `src/15-set-bridge.js` · `SETS.bridge` · Scene **2.5 "Are You Sure You're Sure?"** (checkpoint, scooter chase,
mangrove boardwalk) + the **credits** vignette "the bridge" (`credits25`). Same contract as Rue's `SETS.reddy`
(`ref/rue/05-set-reddy-optus-redcliffe-2026.js`): `{ env, build, marks, anchors, cams, zones, colliders, floor, props,
ambience, update }` plus `dress()`, `paths`, `ar`, `chase`, `mount()` (§12). The chase **mini-game** is `scooter`
(`46-mg-scooter.js`); Teddy's dialogue and the reason cards are `roleplay` / `reason_cards` (`45-mg-teddy.js`). This set
gives them geometry, props with state APIs, marks, cameras and an autopilot for the cutscenes; the game rules are
theirs.

---

## 0. Decisions (read first)

1. **One straight world along +Z, three regions, real coordinates.** Region **C** (Clontarf checkpoint, on land)
   z −60…+36 · Region **D** (the deck over Bramble Bay) z 40…760 · Region **B** (Brighton end + mangrove boardwalk)
   z 760…900. All three are built at once (instanced and merged: cheap). Scooters really travel +Z.
2. **The deck is 720 m, not 2.7 km, and it is not streamed.** At 25 km/h (6.94 m/s) the script's 2.7 km would take
   6½ minutes; the chase is ~90 s of play plus the laugh cutscene. 720 m covers it: s 14 → 360 (play, ~50 s), laugh
   cutscene on autopilot (~20 s, ~140 m), s ≈ 500 → 735 (play, ~34 s), then the swerve. Building all 720 m costs
   ~10 draw calls (instanced railings/lamps/piers, merged slab), so a looping/streaming deck would add code and risk
   for nothing. The story length lives in the far backdrop: from the checkpoint the deck runs into haze and the band
   carries the Brighton shore on the horizon. Float precision is fine to ±1 km.
3. **The navigation hump is the halfway landmark.** Deck top y = 0 except a smooth hump between z 300 and 500, peak
   **+4.0 m at z 400** (9 m above the water — matches the silhouette in `parade` §2.4). `chase.LAUGH = 360` fires the
   laugh just before the crest, so the side-on TRACK rides over the top with the whole bay and the storm behind.
4. **The far group follows the camera.** Band, skirt, sun, cumulus and the storm wall are re-centred on the camera's
   x/z every frame (skybox behaviour, r 470), because the set is longer than the 600 m far plane. Real geometry
   (Brighton shore, mangroves, the old bridge, the deck) emerges from the fog in front of it.
5. **Blank signs.** Every sign is blank to the boys; PENINSULA LOCKDOWN and the rest exist only as AR (§12 `ar`),
   readable only while Chase (2040) is active with his chip on — i.e. before the chip-off prompt. Physical readable
   text on this set: the **NO** button plate, the JARVIS-era reason-card panel labels, the scooters' **25** speed
   stickers, and one old routed-timber council sign **MANGROVE BOARDWALK** at the Brighton end (pre-AR).
6. **Yes yellow (#ffd21f) is not used anywhere.** Teddy's button is red; hazard stripes are red/white; the hire
   scooters are cream and glassy blue.
7. **`dress(state)` also applies its env preset** (instant, `world.env(name, 0, 'bridge')`) unless `{ keepEnv: true }`.
   Auto-dress on a scene change: `'2.5' → 'checkpoint25'`, `'C' → 'credits25'`.

---

## 1. Purpose and scenes

| Beat | Story time / weather | Env | Dress | What happens |
| --- | --- | --- | --- | --- |
| `2.5_checkpoint` | Sun 23 Dec 2040, 13:00. Hot, hazy; sun high in the north; a storm wall building to the south and east over the bay | `noon25` | `checkpoint25` | WIDE low on the checkpoint; Teddy in his booth pressing NO; SafeSense from the booth speaker; Chase (2040) explains |
| PLAY "Cross the bridge." | same | `noon25` | `checkpoint25` | Walk the footpath beside the queue; **chip-off prompt**; one sweeper drone to time; Luka talks to Teddy at the hatch (Role Play); Chase works the reason-card panel and Teddy's desk (CHRISTMAS); the scan (Hint 4, ERROR 4044); Teddy says yes; gate L lifts (sample **Boom gate**) |
| `2.5_alarm` | same | `noon25` | `alarm25` | At the scooters behind the booth both towers turn red; six drones peel off; "Go." |
| PLAY chase (mini-game `scooter`) | 13:10, the storm closer ahead | `chase25` (lerp 20 s from `noon25`) | `chase25` | Three-lane straight; drones drop in; hover-cars yield in the left lane; dash prompts; Chase records **Drone whir** |
| `2.5_laugh` | on the hump | `chase25` | `chase25` (`chase.cruise(true)`) | TRACK side-on, six drones in a neat line; CLOSEs; Luka's laugh (**Luka (laughing)** granted) |
| End of chase | Brighton end, 13:14, first far thunder | `mangrove25` (lerp 6 s) | `end25` | Swerve onto the boardwalk into the mangroves; the drones stop at the edge (the DRONE line: "Uneven terrain detected. ^ For your safety, pursuit has ended. ^ Have a lovely day!") |
| `2.5_manager` | (hq_top cutaway) | — | — | The glass shows low-res drone footage of two scooters disappearing into the mangroves (§9) |
| Credits vignette (optional) | an evening after rain | `credits25` | `credits25` | All three gates up, cars gliding through one by one: *Teddy has said yes to everyone since Monday.* |

Time card `place`: `Ted Smout Bridge, Clontarf`. Music (content): `checkpoint` for C, `scooter` for D, none at the end.

Set lifetime: built under the fade at the end of 2.4 (`rue_house` still live behind it). `2.5_manager` cuts to
`hq_top`: content preloads `hq_top` under a short black after the DRONE line, with `world.liveMax = 3` so `bridge` stays
live for the optional drone-footage render (§9). 2.6 loads `sandgate` under black; `bridge` may then retire.

---

## 2. Layout

### 2.1 Axes and conventions

- Metres, **Y up**. Land and checkpoint y = 0. **Water y = −5.0.** Deck top y = `deckY(z)` (0 except the hump).
- **+Z = south, toward Brighton (the direction of travel).** −Z = north (Clontarf, the Redcliffe peninsula).
- **+X = east, Bramble Bay's open water.** −X = west (Hays Inlet; the old Houghton Highway bridge). **Facing +Z, +X is
  on your LEFT.** Australian keep-left: the slow lane is the +X lane ("the left lane").
- Mark facing `ry`: faces `(sin ry, cos ry)`: `0` faces +Z (toward Brighton), `PI` faces −Z, `H` faces +X, `-H` −X.
- Boxes `[x0, z0, x1, z1]`.

```js
deckY(z) = (z <= 300 || z >= 500) ? 0 : 2.0 * (1 - Math.cos(2 * Math.PI * (z - 300) / 200));   // peak 4.0 at z 400
```

### 2.2 Cross-section (deck and approach road)

| x | Thing |
| --- | --- |
| −6.70…−6.45 | west deck edge fascia; concrete barrier −6.45…−6.10 (0.85 high) with a steel railing on top to 1.30 |
| −6.10…−5.25 | west shoulder |
| −5.25…−1.75 | **lane R**, centre **−3.5** |
| −1.75…+1.75 | **lane M**, centre **0** |
| +1.75…+5.25 | **lane L** (the left/slow lane), centre **+3.5** |
| +5.25…+6.10 | east shoulder |
| +6.10…+6.40 | barrier (0.85, cream foam cap — 2040) |
| +6.40…+8.40 | shared path (deck) |
| +8.40…+8.55 | outer railing (1.30); deck edge +8.70 |

On land (Region C) the east side is kerb + **footpath x 6.1…9.6** + **grass verge 9.6…13.0** + a low hedge-fence at
13.0, then the foreshore park to the sea wall at x 22. The west side has a closed footpath (padded fence at x −6.3)
and houses beyond x −12.

### 2.3 Plan

```
 z (+Z south → Brighton, up the page)                                   +X east (Bramble Bay) →
 900 ┌ Brighton land (road curves −X) ┐
 880 │ houses, Norfolk pines, park    │   mangrove flats (mud y −4.4) x 10…70, z 745…860
 800 │ blank gantry (AR BRIGHTON)     │    ╔══ W3 z 800, x 24→44 ══ scooters stop (31,800)(27.6,800)
     │                                │    ║W2 x 24, z 777→800
 777 │                     path ──────╞════╝W1 ramp z 777, x 8.4→24, y 0 → −2.6
 766…776 barrier gap (x 6.1–6.4)  ← drones stop at the edge (x 8–11, z 769–774)
 760 ╞════════ Brighton abutment ═════╡
     ║  DECK  x −6.7 … +8.7           ║        ch_channel cam (26, −2.6, 650) on a channel marker
 500 ║  hump ends                     ║
 424 ║  nav-span pier                 ║   channel markers (±26, 380/420)       old Houghton Hwy bridge
 400 ║  CREST y +4.0  (the halfway)   ║                                          x −46…−36, y −1.0, closed
 376 ║  nav-span pier                 ║
 360 ║  ← chase.LAUGH                 ║
 300 ║  hump starts                   ║
  40 ╞════════ Clontarf abutment ═════╡  shore/sea wall z 36
 14  │  ← chase.START (scooters drop onto lane L)
  8  ┤ dock ┐ scooter_1 (7.9,4.6)  scooter_2 (9.2,4.6)      ▲ tower_E (12.2, 3.0)
  0  ▲tower_W(−9.2,3)  ═gate_R═╪═gate_M═╪═gate_L══════╪pass┤
 −0.6                                               ┌─booth─┐▓▓ padded fence ▓▓ x 13
 −3.0                                               └ hatch ┘ panel on the E face
 −5.6 … −23   QUEUE: 12 hover-cars, lanes x −3.6 / 0 / +3.6         PLAZA x 6.1–13.0
 −20  ~ ~ ~ sweeper drone line (x −3 … 13.5) ~ ~ ~                  FOOTPATH x 6.1–9.6 + VERGE to 13.0
 −30  gantry (blank; AR PENINSULA LOCKDOWN)                          chip-off trigger z −33…−29
 −42  start marks                                                    foreshore park x 13.3–21.5, sea wall x 22
 −46.5 padded "SAFETY ZONE" foam wall across the footpath
        x: −6.1 ……… 0 ……… +6.1 | +9.6 | +13.0
```

### 2.4 Region C — the Clontarf checkpoint (key coordinates)

| Thing | Where | Notes |
| --- | --- | --- |
| Gate line | z = 0 | |
| Traffic islands | x −2.0…−1.5 and +1.5…+2.0, z −5…+3, kerb 0.15 | padded bollard on each north nose |
| **gate_R** | post (−6.3, 0, 0) on the west kerb, arm along +X to x −2.1 | pivot y 1.05 |
| **gate_M** | post (−1.75, 0, 0) on the west island, arm to x +1.45 | |
| **gate_L** | post (+1.75, 0, 0) on the east island, arm to **x +6.95** (spans lane L, the shoulder and the passage beside the booth) | lifts in the scene |
| Gate arms | 0.10 × 0.10, white with red bands, cream foam tip cube 0.25 | `lift(on)`: rotation.z 0 → +1.45 rad over 2.6 s, ease + small bounce |
| **Booth** | x 7.0…9.0, z −3.0…−0.6, walls to y 2.70, roof overhang to 2.85 | old white steel toll booth, faded blue stripe, padded foam corner strips (2040 retrofit) |
| Front hatch (north face) | x 7.3…8.7, y 1.00…2.05, open; outside counter shelf y 1.02 | Luka talks to Teddy here |
| Side window (west face) | z −2.7…−1.0, y 1.0…2.05 | Teddy can see the gates |
| Door (south face) | x 7.3…8.1 | Teddy's side, beyond the fence |
| **Reason-card panel** (east face) | x 9.00…9.06, z −2.5…−1.1, y 0.95…1.75 | grey JARVIS-era panel: five card slots in a row (WORK FAMILY MEDICAL LEISURE OTHER, labels printed below) at z −2.35, −2.13, −1.91, −1.69, −1.47; a reader slot + LED at z −1.22 |
| Teddy's desk | along the north wall inside, x 7.1…8.9, z −2.95…−2.45, top y 0.80 | |
| **NO button** | (7.95, 0.80, −2.70): grey box, red mushroom cap r 0.07, a red plate with white **NO** | `no_button` |
| Desk fan | (8.65, 0.80, −2.75), oscillating | `desk_fan` |
| Transistor radio | on the hatch sill inside (7.40, 1.02, −2.92) | |
| Teddy's kettle | on the desk's west end (7.25, 0.80, −2.70) | the set's save point (`h25_kettle`) |
| Blank card + marker | on the desk (8.55, 0.80, −2.60) | `desk_card` |
| SafeSense screen | west wall (7.06, 1.40, −2.20), 0.30 × 0.20, facing +X | `booth_screen` |
| Teddy's chair | (8.0, 0, −1.75), faces −Z (the queue) | mark `teddy_seat` |
| Booth speaker horn | roof front (8.0, 2.95, −2.95) facing −Z | SafeSense addresses each car |
| Desk lamp (the set's spot) | (8.0, 2.55, −2.0) → (8.0, 0.8, −2.6) | §3.4 |
| **Passage** | x 6.1…7.0, z −3.0…+0.1 (between the kerb and the booth's west wall) | the only way through the gate line on foot; gate_L's arm blocks it until lifted |
| Padded fence | from the booth's SE corner (9.0, −0.6) east to (13.0, −0.6), 1.1 high | closes the plaza |
| **Dock** (behind the booth) | x 6.1…10.5, z 0.1…8.0; low charging rail x 7.3…9.8 at z 3.7 | `scooter_1` (7.9, 0.28, 4.6, ry 0), `scooter_2` (9.2, 0.28, 4.6, ry 0); kerb ramp to lane L at z 8…12 |
| **tower_W** | (−9.2, 0, 3.0): padded cream base r 0.9 h 1.0, lattice mast to y 9.0, three docking arms at y 7.6, scanner ring y 9.2, beacon y 9.6 | docked drones `dock_w1…3` |
| **tower_E** | (12.2, 0, 3.0) | `dock_e1…3` |
| Docked drones | `dock_w1` (−9.2, 7.75, 4.1), `dock_w2` (−10.15, 7.75, 2.45), `dock_w3` (−8.25, 7.75, 2.45), `dock_e1` (12.2, 7.75, 4.1), `dock_e2` (11.25, 7.75, 2.45), `dock_e3` (13.15, 7.75, 2.45) | set-owned IM until `alarm25` |
| Queue (12 hover-cars) | lanes x −3.6 / 0 / +3.6 at z −5.6, −11.4, −17.2, −23.0; y 0.32 | instances 0–11 of `cars` |
| Gantry | z −30, posts (−7.2, −30) and (10.2, −30) (east post on the verge), beam y 6.0…6.6; three blank 3.2 × 1.6 panels over x −3.6, 0, +3.6 | AR `ar_lockdown` |
| Footpath / verge | x 6.1…9.6 / 9.6…13.0, z −46.5…−0.6 | the walkable approach |
| Foam wall | across the footpath+verge at z −46.5 | north limit |
| Verge furniture | bench (11.5, −34.0) facing −X; bin (11.6, −9.0); lamps (east, x 10.0) at z −42, −18, +18; (west, x −6.8) at z −54, −30, −6, +18 | |
| Foreshore park | x 13.3…21.5: Norfolk pines (17, −40), (18, −12); picnic table (16.5, −26) | not walkable |
| Sea wall / rocks | x 22 (z −60…36) and z 36 (x −80…22 except under the deck) | rocks to x 25 / z 39 |
| West side | closed footpath x −9.0…−6.1 behind a padded fence; houses x −12…−60 (IM) | |

### 2.5 Region D — the deck (z 40…760)

| Thing | Where | Count |
| --- | --- | --- |
| Slab | x −6.7…+8.7, top `deckY(z)`, 1.4 thick; flat runs as single boxes, the hump in 20 segments of 10 m | merged |
| Road surface | x −6.1…+6.1, `t_road` (lane dashes, edge lines) repeated every 12 m | 1 textured strip |
| Piers | z = 40 + 24k (k = 1…29), **skipping z 400** → navigation span 376…424 (taller, thicker piers there); two columns at x −3.0 and +5.0 (1.2 sq) from y −5.5 to the slab underside, cap beam x −6.5…+8.5 | 28 piers: 56 columns, 28 caps (2 IM) |
| Lamps | east barrier x 6.25 at z = 58 + 36k (k 0…19); west barrier x −6.30 at z = 76 + 36k (k 0…18); 9 m pole, 2.2 m arm over the road, LED head | 39 (pole IM + head IM) |
| Railing posts | east outer railing x 8.48 and west railing x −6.28, every 2.4 m | 602 (1 IM), y from `deckY` |
| Rails / barriers | merged boxes per 10 m segment on the hump, long boxes elsewhere | static |
| Channel markers | posts with lit tops at (−26, 380), (+26, 380) green; (−26, 420), (+26, 420) red; and **(26, 650)**, a taller beacon pole to y 3.2 (the `ch_channel` camera sits just above it) | 5 (1 IM + lights) |
| Old Houghton Highway bridge | x −46…−36, deck top y −1.0, z 36…760, piers every 20 m; low railings; padded barrier at its north end (closed) | merged + 36 piers IM |
| Moored boats | (60, −5, 300), (90, −5, 520), (−80, −5, 610) | 3 (1 IM) |
| Water | plane x −700…700, z −600…1400, y −5.0 | 1 quad, ripple scroll |

### 2.6 Region B — the Brighton end and the boardwalk

| Thing | Where | Notes |
| --- | --- | --- |
| Abutment | z 760; road continues on land to z 880 then curves to −X | lamps continue (west) |
| Barrier gap (the swerve) | east barrier missing at **z 766…776** | the scooters cross the shoulder onto the path here |
| Outer railing gap | x 8.4…8.55 at z 775.9…778.1 | where W1 leaves the path |
| **Boardwalk W1** | z 775.9…778.1 (centre 777), x 8.4 → 24.0, ramp y 0 → −2.6 | timber, low rails 0.9, posts every 2 m |
| **W2** | x 22.9…25.1 (centre 24), z 777 → 800, y −2.6 | |
| **W3** | z 798.9…801.1 (centre 800), x 24 → 44, y −2.6 | ends at a small lookout platform (44…47, 798…803) |
| Old council sign | (9.2, 0, 774.6), routed timber **MANGROVE BOARDWALK** + a painted crab, facing −Z | pre-AR, readable |
| Mud flats | plane y −4.4, x 8.6…90, z 730…880 (wet sheen); an embankment slope x 8.6…12 from y 0 to −4.4 | |
| Mangroves | 70 trees (stilt-root cluster + grey-green canopy blob, 3–5 m) x 10…70, z 745…860, clear of the W1 corridor; canopies overhang W2/W3 (intended: the drone's camera loses them under the leaves) | 2 IM + 300 pneumatophores IM |
| Brighton land | x −80…8.6, z 760…900 grass; Norfolk pines (−14, 790), (−22, 840), (−8, 870), (−40, 820); 6 houses (IM) x −30…−70; a blank sign gantry at z 800 (AR) | |

### 2.7 Colliders (walkable: footpath, verge, plaza, passage, dock — everything else is ridden or filmed)

```
road kerb (east)      [5.90, -46.5, 6.10, 8.2]          continuous; nobody walks into the lanes
north foam wall       [6.0, -46.8, 13.3, -46.5]
verge hedge-fence     [13.0, -46.5, 13.3, -0.45]
plaza fence (padded)  [9.0, -0.75, 13.3, -0.45]
booth                 [7.0, -3.0, 9.0, -0.6]
gate_L arm (dynamic)  [6.10, -0.10, 7.00, 0.10]         parked at 1e4 while gate_L is up
dock east fence       [10.5, -0.45, 10.7, 8.2]
dock south rail       [6.0, 8.0, 10.7, 8.2]
dock charging rail    [7.3, 3.6, 9.8, 3.8]
scooters (dynamic)    0.5 × 1.3 boxes at each scooter while parked; parked at 1e4 when ridden
gantry post           [10.0, -30.2, 10.4, -29.8]
lamps (verge)         0.3 sq at (10.0, -42), (10.0, -18)
bench                 [11.2, -34.9, 11.8, -33.1]
bin                   [11.35, -9.25, 11.85, -8.75]
framing-only (deck)   east railing [8.40, 40, 8.60, 760] · west railing [-6.50, 40, -6.25, 760] ·
                      boardwalk rails: W1 [8.4, 775.7, 24.0, 775.9] [8.4, 778.1, 24.0, 778.3] ·
                      W2 [22.7, 777, 22.9, 800] [25.1, 777, 25.3, 800] · W3 [24, 798.7, 44, 798.9] [24, 801.1, 44, 801.3]
```

`floor(x, z)`:

```js
function floor(x, z) {
  if (z > 40 && z < 760 && x > -6.7 && x < 8.7) return deckY(z);
  if (z > 775.9 && z < 778.1 && x >= 8.4 && x <= 24.0) return -2.6 * (x - 8.4) / 15.6;   // W1 ramp
  if ((x > 22.9 && x < 25.1 && z >= 777 && z <= 801.1) || (z > 798.9 && z < 801.1 && x >= 24 && x <= 47)) return -2.6;
  return 0;
}
```

---

## 3. Look

### 3.1 Palette (spec §14: 2040 day, turning to storm)

| Use | Hex |
| --- | --- |
| Sky (noon25 / chase25 / mangrove25) | `#9cc8e0` / `#8aa8b4` / `#6f8a88` |
| Storm wall | `#4f5c58` body → `#c9d2cc` rim; green-grey underside `#5e6e5c` |
| Water near / far | `#5aa9c4` / `#3f86a8` (greyer `#4f7f8c` in `chase25`) |
| Bitumen / lane lines | `#4a4d52` / `#e8e8e0` |
| Concrete deck, barriers, piers | `#c8c4bb`, shadowed `#9a978f` |
| Railings / lamp poles | galvanised `#b8bec4` |
| Padded 2040 foam (barrier caps, tower bases, fence, booth corners) | soft cream `#efe6d0`, seams `#d8ccb0` |
| Glassy accent (drones, scooter glow, SafeSense screen) | `#bfe6ff` |
| Booth | white `#f2f3f4`, faded stripe `#5b86b8` |
| Gate arms | white + red `#d8323a` |
| NO button | red `#c8302c`, plate white text |
| Tower beacon | blue `#6fb8ff` → alarm red `#ff3a3a` |
| Hire scooters | cream `#f3ecdc`, navy deck `#141d3a`, glow `#9fd8ff` |
| Grass (Clontarf park, dry) / Brighton (greener) | `#8db255` / `#7bae4e` |
| Mud / mangrove canopy / bark | `#5d5244` (wet sheen `#8a8070`) / `#5f7a4a` / `#7a6e5e` |

### 3.2 Materials

- `M.vc` — vertex-coloured Lambert, all static untextured geometry (1 call).
- `M.road` — Lambert + `t_road` (repeat along the deck): lanes, dashes, edge lines, the stop line at z −2.5.
- `M.atlas` — 256 × 256 atlas (nearest): NO plate, reason-panel face + card faces, scooter **25** sticker, booth
  details (calendar 2037, a photo), the council sign, the SafeSense screen idle face, dash faces.
- `M.glow` — emissive (lamp heads, channel lights, beacons-idle); unique key.
- `M.beacon` — emissive, unique key, colour driven per state (blue / red); used only by the two beacons + scanner rings.
- `M.glass` — Basic transparent 0.25 (booth windows).
- `M.alpha` — `alphaTest 0.5` (mangrove leaf clusters, railing mesh panels on the old bridge).
- `M.water`, `M.mud` (ripple/sheen scroll), `M.sky*` (Basic, `fog: false`).
- Hover-cars: one InstancedMesh (body, `instanceColor` for 6 paint colours, set during build), one glow IM.
- No vertex snapping, no affine warping, no wobble.

### 3.3 Textures to paint (128–256 px, nearest; **text must read at the named anchor**)

| Texture | Size | Content (readable in **bold**) | Read at |
| --- | --- | --- | --- |
| `t_road` | 64 × 128 (repeat) | bitumen, two dashed lane lines, solid edge lines, faint tyre-free sheen (hover-cars leave no tyre marks) | everywhere |
| `t_panel` | 128 × 64 cell | grey plastic panel, blue JARVIS logo, five slots with labels **WORK · FAMILY · MEDICAL · LEISURE · OTHER**, reader slot, LED socket, a sticker **BACKUP — DO NOT REMOVE** | `s25_panel` (the mini-game CARD `reason_cards` paints its own at 2×) |
| `t_cards` | 5 × (32 × 20) cells | the five plastic reason cards, each with its word | in the slots |
| `t_nobutton` | 32 × 32 cell | red plate, white **NO** | `s25_no_button` |
| `t_booth_in` | 128 × 64 cell | inside wall: a 2037 calendar, a photo of a dog, a crossword, a sticky note in shaky biro **TEDDY** (he wrote his own name; nobody asks) | Role Play two-shot background |
| `t_ss_screen` | 64 × 32, repaintable | SafeSense screen: drop logo idle / **Reason rejected** / **Reason accepted** / **Crossing confirmed** | `booth_screen` |
| `t_dash` | 64 × 32 per scooter, repaintable | scooter dash: speed **25**, a battery bar at 3%, SafeSense mini-states (idle / ask / ask×2 / ok) — the actual pop-up is the UI's | follow cam |
| `t_sticker25` | 16 × 16 cell | white circle, red ring, **25** | scooters |
| `t_council` | 64 × 32 cell | routed timber, cream letters **MANGROVE BOARDWALK**, a painted crab | `s25_edge` |
| `t_blank` | 64 × 32 | pale blank sign panel + 8 px AR glyph (as `parade`) | gantry, booth roof box, Brighton gantry |
| `t_ripple`, `t_mud` | 128 × 128 | water / wet mud with sheen streaks | water, flats |
| `t_band` | 256 × 64, repeat ×4 | alpha silhouettes: north — the peninsula (Redcliffe's low skyline, trees); south — Brighton/Sandgate shore, a tiny Brisbane CBD far SW; east — open bay, Moreton Island's low line; west — Hays Inlet mangroves, low hills | horizon |
| `t_storm`, `t_cloud` | 128 × 128 / 128 × 64 | anvil with a lit rim; cumulus | sky |

### 3.4 Lighting rig and fog

```js
env: {
  noon25:     { bg: 0x9cc8e0, fog: [0xd8dccc, 0.0042], hemi: [0xf2f4ee, 0x9a8a6a, 1.05], dir: [0xfff0d6, 1.60, [-3, 18, -8]],  spot: [0xffd8a0, 1.1], rain: 0 },
  chase25:    { bg: 0x8aa8b4, fog: [0xc4cabc, 0.0040], hemi: [0xe6ebe6, 0x7f7a62, 1.00], dir: [0xfff2dc, 1.40, [-6, 14, -10]], spot: [0xffffff, 0],   rain: 0 },
  mangrove25: { bg: 0x6f8a88, fog: [0x9aa89a, 0.0085], hemi: [0xcfdcd0, 0x4a5a40, 0.90], dir: [0xe8ecd8, 0.90, [-6, 10, 4]],   spot: [0xffffff, 0],   rain: 0 },
  credits25:  { bg: 0xe6b884, fog: [0xf0caa0, 0.0040], hemi: [0xffe8cc, 0x6a5a48, 0.95], dir: [0xffb070, 1.20, [-14, 5, 6]],  spot: [0xffd8a0, 0.9], rain: 0 },
}
```

| Preset / state | Spot | Purpose |
| --- | --- | --- |
| `noon25` (checkpoint) | (8.0, 2.55, −2.0) → (8.0, 0.8, −2.6), angle 0.70, penumbra 0.6, dist 4 | Teddy's desk lamp: lights Teddy and the NO button inside the shaded booth (`world.torchAuto = false`) |
| `credits25` | same | the booth glowing at evening |
| others | 0 | |

Sun disc (unit ×420 from the camera): `noon25` (−0.15, 0.95, −0.27) (almost overhead, north) · `chase25`
(−0.25, 0.88, −0.40) · `mangrove25` hidden behind the storm · `credits25` (−0.85, 0.20, 0.48).
Fog density 0.0042 hides the deck beyond ≈ 400 m; the Brighton shore appears from the haze at the hump's crest.
`mangrove25` fog 0.0085 closes the world in under the storm.

---

## 4. Props

| id | Description | Scenes | States / animation (`userData`) |
| --- | --- | --- | --- |
| `gate_R`, `gate_M`, `gate_L` | boom gate post + arm | 2.5, C | `lift(on)` (2.6 s, ease, bounce); `cycle()` = down then up again (for the Boom gate sample); gate_L drives its collider |
| `booth` | the booth group (static) | 2.5, C | — |
| `no_button` | Teddy's big NO | 2.5 | `press()` cap depresses 0.03 m for 0.25 s, plate flashes; fired by the ask loop (§10) and by content |
| `desk_fan` | oscillating fan | 2.5, C | blades spin 18 rad/s; head yaws ±0.6 rad, 0.15 Hz |
| `booth_screen` | the computer | 2.5 | `show('idle' \| 'reject' \| 'accept' \| 'confirmed')` (repaints `t_ss_screen`) |
| `booth_speaker` | horn on the roof | 2.5 | `pulse()` (scale 1.05 for 0.2 s) when SafeSense talks |
| `reason_panel` | the JARVIS-era panel with five card meshes + reader LED | 2.5 | `pull(i)` (0–4: the card slides out 0.08 m), `insert(i \| 'xmas')`, `led('off' \| 'red' \| 'green')` |
| `desk_card` | blank card + marker on Teddy's desk | 2.5 | `show(bool)`; `written(bool)` swaps the card face to **CHRISTMAS** (atlas cell) |
| `kettle_booth` | Teddy's kettle | 2.5 | save puff |
| `radio_booth` | transistor radio | 2.5 | static (its murmur is the ambience) |
| `tower_W`, `tower_E` | towers: mast static; `ring` child rotates; `beacon` child | 2.5, C | `alarm(on)`: beacon + ring blue → red, beacon strobes 2 Hz (Reduce Flashing: steady red); ring spins 0.8 → 3 rad/s |
| `tower_drones` | 6 docked drones (IM body + IM light) at `dock_*` | 2.5 | idle bob ±0.05 m; `hide(i)` (scale 0) when content spawns a real drone there; `release()` hides all; `show()` |
| `cars` | 18 hover-cars: instances 0–11 = the queue, 12–17 = deck traffic (white, pale blue, silver, coral, mint, navy; drivers' heads + chip lights in the same mesh) | 2.5, C | queue: bob ±0.02; `ask(lane)` nudge (front car of lane 0/1/2 creeps 0.4 m and back); deck: §10 yield logic; `deckReset()` places 12–17 at z [43, 82, 116, 150, 180, 205] in lane L |
| `scooter_1`, `scooter_2` | hire hover-scooters: navy deck 1.3 × 0.42 on a cream fairing, stem + T-bar, dash screen, blue under-glow disc, rear light, **25** stickers; hover 0.28 | 2.5 | `pose(x, z, yaw, lean)` (y = `floor()` + 0.28 + bob); `dash(state)`; `glow(on)`; `seat.driver` [0, 0.30, 0.18], `seat.pillion` [0, 0.30, −0.40] (local, scooter faces local +Z) |
| `drop_marks` | 3 soft dark discs (IM) | 2.5 chase | `show(i, x, z, r)` (y from `deckY` + 0.02), `hide(i)` — telegraph a drone drop-in |
| `pelicans` | 2 pelicans (IM bodies + wings) | 2.5 chase, C | `flyby(z0)`: glide past the scooters at 12 m/s, y deck+6, x +9 (overtaking the chase) |
| `channel_lights` | lit tops of the 5 markers | all | blink 0.5 Hz (green/red) |
| `council_sign` | the old sign | 2.5 end | static |
| `mangroves` | trunks IM, canopy IM, pneumatophores IM | 2.5 end | static (canopy has no per-frame work) |
| `lamps` | 39 deck + 7 land lamps (pole IM + head IM) | all | heads `M.glow` intensity 0 (noon) … 0.6 (mangrove25) … 1 (credits25) |
| `far` | band, skirt, sun, cumulus, **storm** cards (one group, follows the camera) | all | `storm.build(u)` (0 low/far … 1 towering, close); `storm.flicker(on)` (Reduce Flashing → slow dim pulse) |
| `water`, `mud` | | all | ripple / sheen scroll |

**Instanced repeats**

| Repeat | Count | Mesh(es) |
| --- | --- | --- |
| Railing posts (deck) | 602 | 1 IM |
| Lamps (deck 39 + land 7) | 46 | pole IM + head IM |
| Pier columns / caps | 56 / 28 | 2 IM |
| Old bridge piers | 36 | 1 IM |
| Hover-cars | 18 | body IM (instanceColor) + glow IM + blob IM |
| Docked drones | 6 | body IM + light IM |
| Padded bollards (islands, plaza edge) | 10 | 1 IM |
| Mangroves / pneumatophores | 70 / 300 | 3 IM |
| Norfolk pine tiers | 6 trees × 6 | 1 IM |
| Houses (west side, Brighton) | 14 | 2 IM |
| Rocks (sea walls) | 60 | 1 IM |
| Boardwalk posts | 60 | 1 IM |
| Channel markers / boats | 5 / 3 | 2 IM |
| Pelicans | 2 bodies / 4 wings | 2 IM |

Courtesy Drones that move (patrols, the scan drone, the six chasers) are **not** set props: content spawns them with
`DRONES.spawn` using the marks/paths in §7.3.

---

## 5. Marks (`[x, y, z, ry]`, world)

**General**

| id | value | use |
| --- | --- | --- |
| `teddy_seat` | [8.0, 0, −1.75, PI] | Teddy at his desk, facing the queue (seated; h 0.5) |
| `kettle` | [7.30, 0, −3.75, 0] | at the hatch's west end (save) |
| `dock_w1…3`, `dock_e1…3` | §2.4 (ry 0) | docked drone positions |
| `gate_L_post` | [1.75, 0, 0.0, 0] | |

**2.5 — checkpoint and PLAY**

| id | value | step |
| --- | --- | --- |
| `s25_start_luka`, `s25_start_chase`, `s25_start_c40` | [7.4, 0, −41.5, 0], [8.6, 0, −42.2, 0], [9.8, 0, −41.6, −0.2] | arrival at the north end; `2.5_checkpoint` 4 (Chase (2040) explains) |
| `s25_chip` | [9.0, 0, −31.0, 0] | the chip-off prompt (trigger zone `t25_chip`) |
| `s25_cp_start`, `s25_cp_cross`, `s25_cp_plaza` | [8.0, 0, −42.0, 0], [8.0, 0, −25.0, 0], [9.0, 0, −10.0, 0] | stealth checkpoints (Safe Room retry points) |
| `s25_hatch` | [8.0, 0, −3.85, 0] | Luka at the hatch (Role Play; "…Am I?" "Yeah.") |
| `s25_panel_chase` | [9.75, 0, −1.80, −H] | Chase at the reason-card panel |
| `s25_desk_chase` | [8.60, 0, −3.75, 0] | Chase at the hatch's east end (the blank card) |
| `s25_wait_c40` | [11.4, 0, −6.2, −0.6] | Chase (2040) waits on the plaza, hands in pockets |
| `s25_scan_luka`, `s25_scan_chase`, `s25_scan_c40` | [8.0, 0, −5.0, 0.4], [9.7, 0, −4.6, 0.2], [10.9, 0, −4.9, −0.1] | lined up for the scan (all face the descending drone, roughly SE) |
| `d25_scan_1`, `d25_scan_2`, `d25_scan_3` | [9.7, 2.5, −3.7, PI], [10.9, 2.5, −4.0, PI], [8.0, 2.6, −4.1, PI] | the scan drone over Chase, Chase (2040), Luka (cone down onto each) |
| `d25_confused` | centre [8.0, 2.6, −4.6], r 1.0 | slow circle, then off along `paths.d25_drift` |
| `s25_pass` | [6.55, 0, −1.5, 0] | entering the passage after the gate lifts |
| `s25_boom_rec` | [6.55, 0, 0.6, -H] | Chase records the Boom gate (facing the arm) |
| `s25_dock_luka`, `s25_dock_chase`, `s25_dock_c40` | [7.9, 0, 3.3, 0], [7.2, 0, 3.0, 0.3], [9.2, 0, 3.3, 0] | at the scooters (`2.5_alarm`) |

**2.5 — chase, laugh, end** (riders are `mount`ed; these are scooter poses)

| id | value | |
| --- | --- | --- |
| `s25_launch_1`, `s25_launch_2` | [3.5, 0.28, 14.0, 0], [0.0, 0.28, 12.0, 0] | scooters on lane L / M at `chase.START` |
| `s25_bw_stop_1`, `s25_bw_stop_2` | [31.0, −2.32, 800.0, H], [27.6, −2.32, 800.0, H] | parked under the mangroves (single file on W3) |
| `s25_bw_luka`, `s25_bw_chase`, `s25_bw_c40` | [31.4, −2.6, 800.3, −2.4], [30.4, −2.6, 799.6, −2.0], [27.2, −2.6, 800.4, −2.2] | dismounted, looking back at the drones |
| `d25_edge_1…6` | [8.2, 2.3, 771.5], [9.4, 2.6, 772.5], [10.6, 2.3, 773.5], [8.2, 2.9, 769.5], [9.6, 3.1, 770.0], [11.0, 2.8, 771.2] (all ry 1.9) | the six drones stopped at the edge, facing the boardwalk |
| `credits_teddy` | [8.0, 0, −1.75, PI] | (= `teddy_seat`) waving through the hatch in `credits25` |

---

## 6. Anchors (`{ at, from, fov }`, world)

| id | at | from | fov | for |
| --- | --- | --- | --- | --- |
| `s25_wide_low` | [2.5, 2.8, 0.0] | [−1.2, 0.7, −36.0] | 46 | `2.5_checkpoint` 1 WIDE low: the queue in the foreground, gates, booth (frame left), both towers, drones over the cars, the deck into haze, the storm wall |
| `s25_teddy_hatch` | [8.0, 1.25, −1.75] | [8.0, 1.52, −4.20] | 40 | Teddy through the hatch (MID) |
| `s25_no_button` | [7.95, 0.86, −2.70] | [7.95, 1.40, −3.35] | 26 | INSERT: the weary thumb on NO / "Teddy's thumb hovers" |
| `s25_speaker` | [8.0, 2.95, −2.95] | [6.4, 1.8, −7.5] | 36 | SafeSense from the booth speaker |
| `s25_explain` | [8.5, 1.5, −41.8] | [11.8, 1.6, −38.0] | 44 | `2.5_checkpoint` 4: Chase (2040) explains, the checkpoint behind them |
| `s25_roleplay` | [8.0, 1.35, −2.8] | [6.2, 1.70, −5.6] | 40 | Role Play TWO-SHOT through the hatch (Luka's three-quarter back, Teddy inside under the lamp) |
| `s25_roleplay_rev` | [8.0, 1.55, −3.9] | [8.25, 1.35, −2.3] | 42 | reverse from inside over Teddy's shoulder: Luka at the hatch, the queue behind him |
| `s25_panel` | [9.06, 1.35, −1.80] | [9.95, 1.50, −1.80] | 34 | reason-card panel |
| `s25_desk_card` | [8.55, 0.82, −2.60] | [8.40, 1.45, −3.45] | 28 | the blank card and marker on Teddy's desk |
| `s25_screen` | [7.06, 1.40, −2.20] | [7.70, 1.50, −2.20] | 30 | "Reason accepted." on the booth screen |
| `s25_scan_wide` | [9.6, 1.6, −4.4] | [13.6, 3.0, −9.5] | 44 | the scan: the drone gliding down from tower_E and over each of them |
| `s25_gate_lift` | [4.3, 1.4, 0.0] | [7.6, 1.6, −5.2] | 40 | gate_L lifting (clear of the booth's west wall) |
| `s25_towers_red` | [11.6, 7.2, 3.0] | [8.6, 1.3, 9.8] | 48 | `2.5_alarm`: tower_E goes red against the storm, drones lifting off over the scooters |
| `s25_launch` | [3.5, 0.8, 20.0] | [9.6, 1.4, 6.0] | 46 | "Go." — the scooters dropping onto lane L |
| `s25_crest_wide` | [2.0, 5.0, 420.0] | [−30.0, 12.0, 380.0] | 44 | `2.5_laugh` 9 WIDE: the crest, both scooters and the drone line, the bay and the storm wall (when the lead is at s ≈ 415) |
| `s25_edge` | [9.6, 2.6, 772.0] | [20.0, −0.6, 777.0] | 42 | the drones stopped at the edge (from the boardwalk); the council sign in frame |
| `s25_bw_hide` | [29.5, −1.8, 800.0] | [36.0, −1.6, 806.0] | 44 | under the mangroves: they look back |
| `drone_footage` | [30.0, −2.6, 800.0] | [14.0, 24.0, 774.0] | 46 | the drone's-eye view for `2.5_manager` (see §9) |
| `credits_checkpoint` | [4.0, 1.5, 0.0] | [−2.0, 3.0, −20.0] | 44 | credits: gates up, cars gliding through, the booth lit |

Moving shots in the chase are framed on actors (`move:'track'`) — see §9.

---

## 7. Gameplay zones, fixed cams, the chase camera schedule, drones

### 7.1 Cams and zones

```js
cams: {
  cp_north:   { type: 'fixed', pos: [10.5, 6.5, -50.0], look: [7.5, 0.0, -32.0], fov: 46 },  // first = default
  cp_cross:   { type: 'fixed', pos: [9.5, 7.0, -33.0],  look: [6.5, 0.0, -18.0], fov: 50 },  // the sweeper crosses L–R at z −20
  cp_plaza:   { type: 'fixed', pos: [14.2, 4.6, -14.5], look: [7.8, 0.8, -2.6],  fov: 50 },  // hatch AND panel faces in one frame
  cp_passage: { type: 'fixed', pos: [3.4, 3.4, 5.0],    look: [6.6, 0.8, -1.5],  fov: 48 },  // from lane L south of the gate
  cp_dock:    { type: 'fixed', pos: [3.2, 4.2, 12.5],   look: [8.3, 0.6, 3.6],   fov: 50 },
  cp_overview:{ type: 'fixed', pos: [-4.0, 9.0, -46.0], look: [4.0, 0.0, -10.0], fov: 50 },  // filmable land outside the walk
  ch_launch:  { type: 'fixed', pos: [11.6, 3.6, 30.0],  look: [4.0, 0.6, 12.0],  fov: 50 },
  ch_shoulder:{ type: 'fixed', pos: [-4.9, 0.7, 214.0], look: [1.8, 0.95, 168.0], fov: 40 },  // low on the W shoulder (1.2 m off the barrier), looking back up the road
  ch_lamp:    { type: 'fixed', pos: [6.2, 12.0, 364.0], look: [0.5, 2.2, 336.0], fov: 50 },  // from a lamp head on the hump
  ch_channel: { type: 'fixed', pos: [26.0, 3.5, 650.0], look: [2.0, 1.2, 598.0], fov: 32 },  // long lens from the channel-marker beacon
  ch_end:     { type: 'fixed', pos: [16.5, 5.2, 790.0], look: [4.0, 0.4, 750.0], fov: 46 },
  bw_end:     { type: 'fixed', pos: [36.0, 0.6, 806.0], look: [24.0, -2.0, 786.0], fov: 48 },
},
zones: [   // first match wins
  { box: [6.0, -3.0, 7.0, 0.1],      cam: 'cp_passage' },
  { box: [6.0, 0.1, 10.6, 8.2],      cam: 'cp_dock' },
  { box: [6.0, -12.0, 13.3, -0.45],  cam: 'cp_plaza' },
  { box: [6.0, -28.0, 13.3, -12.0],  cam: 'cp_cross' },
  { box: [6.0, -46.5, 13.3, -28.0],  cam: 'cp_north' },
  { box: [8.4, 774.0, 60.0, 840.0],  cam: 'bw_end' },
  { box: [-60, 8.2, 60, 100],        cam: 'ch_launch' },    // deck zones: framing + fallback only (the chase drives the camera)
  { box: [-60, 100, 60, 260],        cam: 'ch_shoulder' },
  { box: [-60, 260, 60, 460],        cam: 'ch_lamp' },
  { box: [-60, 460, 60, 690],        cam: 'ch_channel' },
  { box: [-60, 690, 60, 900],        cam: 'ch_end' },
  { box: [-60, -60, 60, 8.2],        cam: 'cp_overview' },
],
```

**Sight-line rule (checked):** the deck has a solid 0.85 m barrier and a 1.30 m railing on both edges, so any lens
outside the deck must cross them above deck + 1.30 (`ch_channel`, `ch_end`, the laugh TRACK and `s25_crest_wide` do; a
low lens must sit on the road itself, like `ch_shoulder`). Keep a 3 m radius clear of mangrove canopies around the
`bw_end`, `s25_bw_hide` and `s25_edge` lenses.

The deck zones are deliberately wide (x ±60, over the water) so the framing helper can put a side-on lens off the
deck edge during `2.5_laugh` without being pulled back inside.

**Stealth readability (checkpoint).** All checkpoint cams are `fixed` and ≥ 3.4 m high. `cp_cross` looks along −Z…+Z
down the footpath from behind and above, so the sweeper's cone travels **left–right across the frame** and its
direction (pointing at the footpath or back over the road) is obvious.

### 7.2 The chase camera schedule (for `46-mg-scooter.js`)

The mini-game owns the camera during play: in FOLLOW segments it holds a `cam.override('fixed', …)` whose `pos`/`look`
arrays it mutates each tick (allocation-free); in side segments it calls `cam.override('set', { name })` once on entry.
`s` = scooter_1's z.

| s from | s to | camera | why |
| --- | --- | --- | --- |
| 10 | 60 | `ch_launch` | the scooters drop onto lane L; drones peel off tower_E behind them |
| 60 | 150 | FOLLOW | low behind |
| 150 | 215 | `ch_shoulder` | low on the west shoulder (x −4.9, 0.7 m up, clear of the barrier): scooters and drones approach and blast past, railing posts and lamps receding |
| 215 | 330 | FOLLOW | |
| 330 | 360 | `ch_lamp` | high on the rising hump: the drone formation reads from above |
| 360 | (laugh) | `2.5_laugh` cutscene; `chase.cruise(true)` | |
| resume | 560 | FOLLOW | |
| 560 | 640 | `ch_channel` | long lens from the channel-marker beacon (3.5 m above the deck, 8.5 m above the water): the bridge in profile, the chase coming toward the lens |
| 640 | 735 | FOLLOW | |
| 735 | end | `ch_end` | the swerve; `chase.swerve()`; the drones stop at the edge |

`chase.follow = { offset: [-0.8, 1.55, -7.0], look: [0, 0.9, 12.0], fov: 52, damp: 4 }` (offset/look relative to
scooter_1, y added to `deckY(z)`; lateral follow damped so lane changes swing the frame gently).

### 7.3 Drones (for `DRONES.spawn`)

| Drone | Spawn | Path / behaviour | y | speed | cone {len, half} | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `d25_sweep` | [−3.0, 2.2, −20.0] | ping-pong [[−3.0, −20.0], [13.5, −20.0]] | 2.2 | 1.3 | {3.8, 0.50} along heading | the one to time: heading +X its cone sweeps the footpath and verge; heading −X it points back over the road (≈ 10 s window) |
| `d25_queue` | [0, 3.0, −24.0] | ping-pong [[0, −24], [0, −6]] | 3.0 | 0.8 | {4.0, 0.45} | over lane M only; ambient menace, never reaches x > 2.5 |
| `d25_gate` | [3.6, 2.6, 1.8] | hover, face PI | 2.6 | — | {3.0, 0.45} | over lane L at the gate; cone on the road |
| `d25_scan` | `dock_e1` (hide IM 3) | glide [12.2, 7.75, 4.1] → `d25_scan_1` → `_2` → `_3`, then circle `d25_confused`, then `paths.d25_drift` | — | 1.2 | scan beam (systems) | Hint 4 |
| `d25_c1…c6` | `dock_e1…3`, `dock_w1…3` (`tower_drones.release()`) | the six chasers: mini-game control; formation in cutscenes (`chase.formation`) | — | 6.94 | — | `2.5_alarm` onward |

Signal (Chase (2040)'s chip) fills faster here ("faster at checkpoints"): systems' `chip.rate` for 2.5 — a content
setting; the chip is forced off at `t25_chip` anyway.

---

## 8. Hotspots

| id | at | r | verb | who / `by` | scene | does |
| --- | --- | --- | --- | --- | --- | --- |
| `t25_chip` (trigger box, not a hotspot) | [6.0, −33, 13.3, −29] | — | — | entered by Chase (2040) or with him following | 2.5 PLAY 1 | chip-off prompt (YES → `chip.forceOff(true)`; NO → immediate soft-fail escort) |
| `h25_teddy` | [8.0, 0, −3.4] | 0.9 | Talk | `only: 'luka'` | 2.5 PLAY 2 | Role Play (mini-game `roleplay`); Teddy's lines as scripted |
| `h25_teddy_other` | [8.0, 0, −3.4] | 0.9 | Talk | Chase or Chase (2040) | 2.5 | (no scripted line: Teddy presses NO; a nod) — optional, content may omit |
| `h25_panel` | [9.45, 0, −1.80] | 0.8 | Use | `only: 'chase'`, `when: s => s.flags.s25_name` (set by `roleplay` once Luka has asked Teddy's name) | 2.5 PLAY 3 | mini-game `reason_cards` (`reason_panel.pull/insert/led`; SafeSense rejections) |
| `h25_desk_card` | [8.60, 0, −3.40] | 0.6 | Take | `only: 'chase'`, `when` all five rejected | 2.5 PLAY 3 | `desk_card.show(false)` → CARD write **CHRISTMAS** → `insert('xmas')`, `led('green')`, `booth_screen.show('accept')` |
| `h25_kettle` | [7.30, 0, −3.40] | 0.6 | Kettle | any | 2.5 | "Put the kettle on? [YES] [NO]" (Teddy's kettle) |
| `h25_boom` | [6.55, 0, 0.4] | 1.2 | Hold to record | `only: 'chase'`, `sample: 'boom'`, `when` gate_L up | 2.5 PLAY 5 | `gate_L.cycle()` (Teddy obligingly lowers and lifts it again) — sample **Boom gate** |
| `t25_dock` (trigger box) | [6.6, 2.5, 10.4, 7.5] | — | — | all three inside | 2.5 | → `2.5_alarm` |
| `h25_c40` | actor `chase40` | 1.4 | Talk | any | 2.5 | generic (content) |

The scan (PLAY 4) and Teddy's yes (PLAY 5) are scripted beats, not hotspots: content runs them after
`s25_reason_ok`.

---

## 9. Cutscene needs (shots → geometry that must exist)

**`2.5_checkpoint`**
1. WIDE low `s25_wide_low`: 12 queued cars with drivers (heads + chip lights in the car IM), three gates down, both
   towers with 3 docked drones each (beacons blue, rings turning), `d25_queue` and `d25_gate` hovering over the cars,
   the booth with Teddy lit by the desk lamp, the blank gantry overhead (AR PENINSULA LOCKDOWN in red only if content
   shows Chip View here), **the deck running into haze** with lamps receding, the storm wall `far.storm.build(0.35)`.
   The ask loop (§10) gives the "pressing NO every few seconds" rhythm under the shot.
2. SafeSense line: `s25_speaker` + `booth_speaker.pulse()`.
3. Teddy: `s25_teddy_hatch`, INSERT `s25_no_button` + `no_button.press()`.
4. Chase (2040)'s explanation: `s25_explain` (or a THREE at `s25_start_*`).

**PLAY beats**
- Role Play: `s25_roleplay` / `s25_roleplay_rev` (the `t_booth_in` wall with the sticky note **TEDDY** behind him).
- Reason cards: `s25_panel`, `reason_panel` API; the desk: `s25_desk_card`; acceptance: `s25_screen`.
- The scan: `s25_scan_wide`; "[CLOSE · the drone, its light flickering blue to white]" = framing on the drone's
  position (`on: [drone.pos]`), with the pop-up **ERROR 4044 — IDENTITY CONFLICT** (systems/UI floating pop-up) over it;
  the drone's light flicker is the drone system's. The confused circle and drift: `d25_confused`, `paths.d25_drift`.
- Teddy says yes: `s25_teddy_hatch` / `s25_no_button` (his thumb hovers — he says "Yes." aloud; the button is not
  pressed); `booth_screen.show('confirmed')`; `gate_L.lift(true)` on `s25_gate_lift`. Sample: `h25_boom`.

**`2.5_alarm`** — `s25_towers_red`: `tower_E.alarm(true)`, `tower_W.alarm(true)`, `tower_drones.release()` and six
`DRONES` spawned at the docks rising to y 9 then turning toward the dock; "Go.": `s25_launch` (CLOSE Chase (2040) by
framing helper). Then `SETS.bridge.mount()` the riders (Luka driver + Chase pillion on scooter_1, Chase (2040) on scooter_2) and hand over to the mini-game.

**`2.5_laugh`** (content; `chase.cruise(true, { drones: ['d25_c1', …, 'd25_c6'] })` before step 1, `false` after)
1. TRACK side-on: `{ shot: 'WIDE', on: ['luka', 'chase40'], move: 'track', track: 'alongside', side: 'right' }`
   (subject's right = −X): lens over the water west of the deck (x ≈ −12) **at deck + 2.0** (it must clear the west
   railing's top rail at deck + 1.30; at deck + 1.4 it grazes it), looking east: scooters in lanes L/M, the
   six drones in a neat line behind at `chase.formation`, the bay and the storm wall behind them, lamps ticking past.
   **Requires** the west railing to be see-through at lens height (railing posts every 2.4 m + two rails — yes) and
   the deck zones wide enough (§7.1).
5. CLOSE Luka driving (framing helper; the Santa beard flaps off one ear — art).
6. CLOSE Chase (2040) on scooter_2.
8. CLOSE Chase on the pillion, phone up.
9. WIDE `s25_crest_wide` (or a framing-helper WIDE high) as they crest the hump at z ≈ 400–420.
   Skip-safety: if skipped, cruise for the skipped duration is not simulated; scooters stay where they were and the
   chase resumes (`s` < 500 just means a slightly longer second half).

**End of chase** — `chase.swerve()` (autopilot along `paths.swerve_1/2`, ≈ 7 s; skip → snaps to `s25_bw_stop_*`);
cams `ch_end` → `s25_edge` (the drones arrive at `d25_edge_*` and stop; the council sign in frame); DRONE line;
`s25_bw_hide` for the three looking back. **Requires** the barrier gap (z 766–776), the railing gap at W1, the ramp,
mangrove canopies overhanging W2/W3.

**`2.5_manager`** (hq_top owns the shot) — "small and low-res drone footage: two hover-scooters disappearing into the
mangroves". Recommended: hq_top paints a 3-frame canvas loop (top-down boardwalk, two scooter dots sliding under
canopy blobs). Optional richer route: while `bridge` is still live, hq_top renders this set once per 0.25 s from
anchor `drone_footage` into a 160 × 90 render target (nearest, no fog change) with `dress('end25')` and the scooters
on `swerve` — the set stays allocation-free; the cost is one extra small render. hq_top decides; this set guarantees the
anchor and the end state.

**Credits** (`credits25`): `credits_checkpoint` locked: all three gates up, the 12 queue cars gliding through at walking
pace one after another in a loop (§10), tower beacons calm blue, the booth lamp on, Teddy (if content spawns him) at
`teddy_seat` playing `wave`.

---

## 10. Ambience and `update(dt, ctx)`

`ambience: { loops: ['wind_bay', 'hover_idle', 'drone_hum', 'water_lap', 'gulls'], room: 'none' }` (default).
`dress()` switches loops per state (`AUDIO.ambience({ loops })`, guarded).

| State | Loops | Room |
| --- | --- | --- |
| `checkpoint25`, `gate25` | `wind_bay`, `hover_idle` (the queue's glassy idle), `drone_hum` (towers), `water_lap`, `gulls`, `radio_tinny` (Teddy's transistor: murmured talkback, **no music**; audible near the booth only) | `none` |
| `alarm25` | + `alarm_soft` (the towers' polite two-tone) | `none` |
| `chase25` | `wind_fast` (gain from scooter speed), `water_lap` (low) | `none` |
| `end25` | `mangrove` (clicks, crabs, insects), `wind_soft`, distant `thunder_far` every 15–25 s | `none` |
| `credits25` | `wind_bay`, `gulls`, `hover_idle` | `none` |

One-shots fired by the set (rate-limited ≥ 0.5 s): `no_press` (button clunk), `safesense_chirp` (booth speaker on each
ask), `boom_gate` (lift/cycle — the sample's own recipe), `hover_chirp` (a yielding car), `pelican_clack` (flyby).

**`update(dt, ctx)` — no allocation** (preallocated `Matrix4`/`Vector3`/`Quaternion`/`Color`; `for` loops; hoisted
callbacks; dynamic collider arrays written in place):

1. Scene change → `dress(AUTO[state.scene] || 'checkpoint25')`. Env change → lamp-head intensity, sun direction,
   spot on/off (`world.torchAuto = false` while the desk lamp is used; restored otherwise).
2. **Far group re-centre**: `far.position.set(camera.x, 0, camera.z)`; skirt colour = fog colour; storm cards ease to
   their `build` target (0.02/s); clouds drift.
3. **Ask loop** (`checkpoint25` until gate_L lifts): every 6.5 s pick the next lane (0, 1, 2, …): the front car eases
   forward 0.4 m over 0.6 s, `booth_speaker.pulse()` + `safesense_chirp`, 1.2 s later `no_button.press()` +
   `no_press`, the car eases back. `emit('bridge:ask', lane)` (if `emit` exists) so content can sync Teddy's thumb anim.
   Paused while dialogue is on screen (content: `SETS.bridge.askLoop(false)` around cutscenes).
4. Queue bob (12 matrices, one `needsUpdate`); deck cars (6) — see 6.
5. Gates ease toward their targets; gate_L's collider follows; `cycle()` timeline.
6. **Deck traffic** (`chase25` only): each car `{ z, x, v }` cruises lane L (x 3.5) at 4.5 m/s. If a scooter's |x − 3.5|
   < 1.2 and it is 0…14 m behind the car: target x 5.5 (shoulder), v 2.0, call `cars.userData.onYield?.(i)` once
   (the mini-game barks "After you!"; suppressed while `chase.cruise` is on); 10 m after the scooter passes: back to
   x 3.5 and 4.5 m/s. Yaw eases with the lane change. Car y = `deckY(z)` + 0.32 + bob.
7. **Scooters**: bob ±0.02 (2.3 Hz), under-glow pulse, lean decays; then **mounts**: for each of ≤ 3 mounted actors,
   write `a.pos` = scooter world position + rotated seat offset, `a.rotY` = scooter yaw (continuous per-tick writes
   interpolate cleanly).
8. **Autopilot** (`chase.cruise` / `chase.swerve`): advance scooter_1/2 at `SPEED` along their lanes (or along
   `paths.swerve_*` by arc length); if drone ids were given, write each drone's position to its `formation` slot
   (`DRONES.get(id)`, guarded) at the same speed.
9. Towers: rings rotate; beacon pulse (alarm: strobe or, with Reduce Flashing, steady); docked drones bob (6 matrices).
10. Desk fan spin + oscillation; booth screen/dash repaint only on state change.
11. Drop marks fade in/out (opacity 0.6 at full); pelicans flyby timeline (2 bodies + 4 wings matrices).
12. Channel lights blink; water/mud UV scroll; `end25`/`chase25` storm flicker if enabled (Reduce Flashing → 2 s dim
    pulse, no white).
13. `credits25`: queue cars glide through the open gates one at a time (z −23 → +60 at 2 m/s, then re-enter at the
    back of their lane) — 12 matrices.

---

## 11. Performance budget (target < 300; expected ≈ 110 at the checkpoint, ≈ 95 in the chase)

| Group | Draw calls |
| --- | --- |
| Static: `M.vc`, `M.road`, `M.atlas`, `M.glow`, `M.glass`, `M.alpha`, water, mud | 8 |
| Instanced (§4 table) | ~26 |
| Named props: gates 3, booth bits (button, fan, screen, speaker, panel + cards, desk card, kettle) ~8, towers (ring + beacon) 4, scooters (body, glow, dash) 6, drop marks 1 | ~22 |
| Far group: band, skirt, sun ×2, clouds, storm | 6 |
| Rigs: Luka, Chase, Chase (2040), Teddy (≈ 3–4 each) | ~15 |
| Courtesy Drones (content): checkpoint 3 + scan 1; chase 6 (≈ 3 each incl. cones) | ~12–18 |

Rules: one Builder per region merged by material (the three regions can share `M.vc` — one mesh each is fine: 3 calls);
every repeat is an InstancedMesh with `frustumCulled` left on for static batches (their spheres cover the whole deck,
so they always draw — acceptable at these counts) and `frustumCulled = false` only for the moving car/pelican/drone IMs
with `DynamicDrawUsage`; `instanceColor` on the car IM is set at build (warm program at boot); textures ≤ 256 px;
blob shadows only (cars, scooters, rigs); no per-frame allocation.

---

## 12. API summary, data exports, engine notes

```js
SETS.bridge = {
  env, build, marks, anchors, cams, zones, colliders, floor, props, ambience, update,
  dress(state, opts),       // 'checkpoint25' | 'gate25' | 'alarm25' | 'chase25' | 'end25' | 'credits25'
  askLoop(on),              // Teddy's NO rhythm (§10.3)
  mount(actorId, scooter, seat),   // scooter: 'scooter_1' | 'scooter_2'; seat: 'driver' | 'pillion'
  unmount(actorId),
  chase: {
    LANES: [3.5, 0, -3.5],  // L, M, R centres (x)
    START: 14, LAUGH: 360, END: 735, SPEED: 6.94,   // metres (z), m/s = 25 km/h
    deckY,                  // (z) → deck top height
    follow: { offset: [-0.8, 1.55, -7.0], look: [0, 0.9, 12.0], fov: 52, damp: 4 },
    schedule: [ [10, 60, 'ch_launch'], [60, 150, 'FOLLOW'], [150, 215, 'ch_shoulder'], [215, 330, 'FOLLOW'],
                [330, 360, 'ch_lamp'], [360, 560, 'FOLLOW'], [560, 640, 'ch_channel'], [640, 735, 'FOLLOW'], [735, 900, 'ch_end'] ],
    formation: [[1.8, 2.2, -5], [1.8, 2.3, -7], [1.8, 2.2, -9], [1.8, 2.3, -11], [1.8, 2.2, -13], [1.8, 2.3, -15]],
                            // [x (absolute), y above deck, dz behind scooter_1]: "six drones in a neat line behind them"
    cruise(on, o),          // autopilot at SPEED; o.drones = ids kept in formation
    swerve(),               // end autopilot → Promise; skip-safe (snaps to s25_bw_stop_*)
  },
  paths: {
    d25_sweep:  [[-3.0, -20.0], [13.5, -20.0]],
    d25_queue:  [[0, -24], [0, -6]],
    d25_drift:  [[8.0, -4.6], [12.0, -9.0], [18.0, -14.0]],                       // y rising 2.6 → 7
    walk_in:    [[8.0, -42.0], [8.0, -10.0], [8.0, -4.5]],
    to_dock:    [[6.55, -2.5], [6.55, 0.6], [7.6, 2.4]],
    swerve_1:   [[3.5, 735], [3.6, 760], [5.2, 768], [6.9, 771.5], [7.6, 776.0], [9.0, 777.0], [24.0, 777.0], [24.0, 799.0], [31.0, 800.0]],
    swerve_2:   [[0.0, 735], [1.0, 758], [4.4, 768.5], [6.6, 772.6], [7.4, 777.0], [8.8, 777.0], [23.6, 777.0], [23.6, 798.5], [27.6, 800.0]],
    credits_flow: [[3.6, -23], [3.6, 60]],                                         // per lane x −3.6 / 0 / 3.6
  },
  ar: [   // only while Chase (2040) is active with his chip on (before t25_chip)
    { id: 'ar_lockdown', at: [0, 6.3, -30.1],   text: 'PENINSULA LOCKDOWN', kind: 'sign', w: 9, color: 0xff3a3a },
    { id: 'ar_lockdown2', at: [0, 5.6, -30.1],  text: 'All crossings require human confirmation', kind: 'sign', w: 6, color: 0xff3a3a },
    { id: 'ar_booth',    at: [8.0, 3.2, -3.0],  text: 'CHECKPOINT 3 · CLONTARF', kind: 'sign', w: 2.6 },
    { id: 'ar_tower_w',  at: [-9.2, 10.2, 3.0], text: 'COURTESY TOWER · Have a safe day', kind: 'sign', w: 3 },
    { id: 'ar_tower_e',  at: [12.2, 10.2, 3.0], text: 'COURTESY TOWER · Have a safe day', kind: 'sign', w: 3 },
    { id: 'ar_bridge',   at: [0, 3.0, 40.0],    text: 'TED SMOUT MEMORIAL BRIDGE · 2.7 km · 25 km/h', kind: 'sign', w: 6 },
    { id: 'ar_hire',     at: [8.5, 1.6, 4.6],   text: 'HOVER HIRE · 25 km/h · Are you sure?', kind: 'ad', w: 2.4 },
    { id: 'ar_queue',    at: [0, 2.4, -11.4],   text: 'ESTIMATED WAIT: indefinite (for your safety)', kind: 'tag', w: 3.4 },
  ],
};
```

**AUTO dress map**: `{ '2.5': 'checkpoint25', 'C': 'credits25' }`; anything else → `'checkpoint25'`.

**Dress states**

| key | `checkpoint25` | `gate25` | `alarm25` | `chase25` | `end25` | `credits25` |
| --- | --- | --- | --- | --- | --- | --- |
| env | `noon25` | `noon25` | `noon25` | `chase25` (content lerps 20 s) | `mangrove25` | `credits25` |
| gates | all down | **L up** | L up | L up | L up | **all up** |
| ask loop | on | off | off | off | off | off |
| towers | blue | blue | **red** | red | red | blue |
| tower_drones | 6 docked | 6 docked (1 hidden after the scan launch) | released (hidden) | hidden | hidden | hidden |
| queue cars | stopped (12) | stopped | stopped | stopped | stopped | **flowing** |
| deck cars | hidden | hidden | hidden | **6 active** (`deckReset()`) | parked at the shoulder | hidden |
| scooters | docked | docked | docked, glow on | ridden | parked on W3 | docked |
| reason panel | 5 cards in, LED off | CHRISTMAS card in, LED green | same | same | same | 5 cards in |
| desk_card | shown | hidden | hidden | hidden | hidden | shown |
| booth_screen | idle | confirmed | confirmed | idle | idle | idle |
| storm build | 0.35 | 0.40 | 0.45 | 0.55 → 0.8 | 0.9 (+flicker) | 0 |
| spot | desk lamp | desk lamp | desk lamp | off | off | desk lamp |
| zones | all (checkpoint cams) | all | all | all | all | all |

**Engine notes**

1. `world.torchAuto` is global: the set sets it false for the desk lamp and restores it in `dress()`; please also reset
   it in `showE()`.
2. Every preset defines `spot`.
3. The far group is re-centred on the camera in `update()`; it never exceeds r 470 from the camera (far plane 600).
4. Actor mounting writes `a.pos`/`a.rotY` every tick from `update()` (§10.7); content should not `moveTo` a mounted
   actor (unmount first).
