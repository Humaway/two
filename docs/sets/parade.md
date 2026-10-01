# SET `parade` — Redcliffe Parade, the jetty, Suttons Beach, Bee Gees Way, Woody Point (2040)

File `src/12-set-parade.js` · `SETS.parade` · Scenes **1.7, 1.8 (one exterior shot), 2.2, 2.3, B2** (+ optional B1 montage
frames and credits vignettes). Same contract as Rue's `SETS.reddy` (see `ref/rue/05-set-reddy-optus-redcliffe-2026.js`):
`{ env, build, marks, anchors, cams, zones, colliders, props, ambience, update }` plus the extras in §12 (`dress`,
`paths`, `ar`, `W0`).

---

## 0. Decisions (read first)

1. **Two regions in one set, never on screen together.**
   - **Region P — the Parade** (shops, road, promenade, foreshore park, Suttons Beach, the jetty, Bee Gees Way) around
     the world origin.
   - **Region W — the Woody Point headland** (path, grass, memorial bench, railing, the bay, the Ted Smout Bridge ahead)
     built in its own local frame and placed at **`W0 = [-300, 0, 0]`** (world = W-local + W0). It is reached only by a
     fade (2.2 → 2.3; B1 → B2). Region groups are toggled by `dress()` (`R.regionP.visible` / `R.regionW.visible`), so
     only one region ever draws. Colliders and zones of both regions are always registered (they are 300 m apart and
     cannot overlap).
2. **The camera's far plane is 600 m** (`30-world.js`). Every backdrop (horizon band, bridge, sun, clouds, water edge)
   is built **per region** and kept within 520 m of that region's origin. Backdrop materials are `fog: false`.
3. **The Ted Smout Bridge** is a low-poly silhouette, one copy per region:
   from the Parade it lies **2.5°–30° right of +Z** (so it shows "far off to the right" from the flat's balcony and
   through the mouth of Bee Gees Way); from Woody Point it lies **dead ahead** (16° left to 15° right).
   `flat` and `foreshore26` copy these numbers (see §2.4).
4. **Blank signs.** In 2040 every sign, street name, price and ad exists only in Chip View (AR). Physical signs are
   blank pale panels with a tiny AR glyph in one corner. The only readable physical text on this set: the bronze
   **BRISBANE 2032** plaque, the limiter's **MAX 40 dB**, the keypad digits, the memorial plaque, and one old
   painted *ghost sign* on the chip shop's brick (paint pre-dates AR).
5. **Yes yellow (#ffd21f) is not used anywhere on this set.** Creams, sand and brass stay warm but never that yellow.
6. **`dress(state)`** sets everything scene-specific (regions, extras, traffic, props, spot lamp, ambience). It runs
   automatically when `state.scene` changes (as Rue's `reddy` does) and can be called by content:
   `SETS.parade.dress('evening18')`.

---

## 1. Purpose and scenes

| Scene | Region | Story time | Env preset(s) | Dress state | What happens here |
| --- | --- | --- | --- | --- | --- |
| 1.7 "One Foot Off the Ground" | P | Sat 22 Dec 2040, 13:40 → dusk | `day` → `golden` (slow, during roam) → `dusk` (at the flat door) | `day17` | Crane from the sky; TRACK with a hover-car; plaque; Chip View POV + Cloud+ billboard; free roam with gentle drone patrols, 3 samples, 4 human moments, examines; exit by the door beside the chip shop |
| 1.8 "Order of Service" (one shot) | P | 19:40 | `evening` | `evening18` | Step 27: WIDE exterior from the Parade up at the flat's lit kitchen window, three figures eating, a hover-car glides past chirping "Are you sure?" |
| 2.2 "Bee Gees Way" | P (lane) | Sun 23 Dec 2040, 07:30 | `morning` | `lane22` | TRACK into the lane; drone at the far end; limiter (AR code + brass plate + keypad); Public Piano; the two Chases on the bench; sneak to the exit |
| 2.3 "The Bench" | W | 08:40 | `wp_morning` | `bench23` | Locked long-lens path shot; Luka walks to his memorial bench; plaque + rail INSERTs; sit; three on the bench; storm building behind the bridge |
| B2 "Christmas Morning" | W | Tue 25 Dec 2040, 07:10 | `wp_washed` | `xmas40` | Luka (2040) and Chase (2040) on the bench; the slate plays **two** out loud; a small crowd stops; kid on a skateboard; a pelican lands on the railing; CRANE up and away |
| B1 montage (optional frames) | P / W | 2031 / 2033 | `day` / `wp_sunset` | `festival31` / `sunset33` | 2031 festival poster at the jetty stage (PUDDING · 4:10 pm · CANCELLED); 2033 Woody Point jetty at sunset (no bench yet) |
| C credits (optional vignettes) | W | — | `wp_washed` | `credits` | the bench; the bridge |

Time card `place` strings: 1.7 `Redcliffe Parade` · 2.2 `Bee Gees Way, Redcliffe` · 2.3 `Woody Point` · B2 `Woody Point`.

Set lifetime: 1.7 → 1.8 (flat) → 1.8 step 27 (parade again) → 2.1 (flat) → 2.2/2.3 (parade). With `world.liveMax = 2`
`parade` and `flat` stay live across 1.7–2.3; nothing rebuilds. B2 rebuilds `parade` behind B1's last white.

---

## 2. Layout

### 2.1 Axes and conventions

- Metres, **Y up**. Ground of every walkable surface is **y = 0** (no `floor()` function needed).
- **+Z = the bay** (seaward). The shopfronts face +Z. **+X runs along the Parade toward the chip shop** (the far end).
  Looking out to sea (+Z), screen-right is **−X** (that is where the bridge is).
- Mark facing `ry`: the actor faces `(sin ry, cos ry)` → `0` faces +Z (the bay), `PI` faces −Z (the shops),
  `H = PI/2` faces +X, `-H` faces −X.
- Zone boxes `[x0, z0, x1, z1]`. Colliders are boxes `[x0, z0, x1, z1]` in `COL` as in Rue.

### 2.2 Region P — plan (footprint x −46…+46, z −37…+60; walkable x −44…+42)

```
 z  (bay, +Z, up the page)                       Ted Smout Bridge on the horizon, 2.5°–30° to the RIGHT (−X)
+60        ┌──── T-head x −20…−4 ───┐  (bench + man at −12,59.2)
           │          ║             │
+54        └───┐      ║      ┌──────┘
               │  JETTY deck x −13.75…−10.25 (y 0, water y −1.5)
+29  ~~~~~~~~~~~~~~~~~║~~~~~~~~~~~~~ waterline ~~~~~~~~~~~~~~~~~~~~ family (13.6…16.2, 30.5)  lifeguard drone (15, 3.2, 32.6)
+24   rocks/seawall   ║  rocks │ SUTTONS BEACH sand (x −4…42, z 18…24 walkable) ..........................
+18 ═════════╗ PLAZA  ║ ═══════╡  park bench(−1,17)   park bench(9,17)            park bench(34,17)
    stage    ║ pavers x −20…−4 │ GRASS PARK x −4…42, z 8…18
+12 2031 ────╢ blank sign(−16.5,15.5) tree(4,13.5)     kiosk(12,8.4)      skate bowl (27,13.5) r3.4
 +8 car park ║                  plaque(−2,8.5)
    x−42…−22 ║                                                                                 
 +5 ═PROMENADE═ lamps z 5.6 · palms z 7.4 · padded bollards on the kerb z 5.15 ════════════════════════════════
    ── −X lane z 3.0 (hover-cars ←)        zebra W x −16…−12               zebra E x 22…26 ──
    ── +X lane z −1.0 (hover-cars →)                                                     ──
 −3 ═ padded bollards z −3.15 ═════════════════════════════════════════════════════════════════════════════
    FOOTPATH (awnings to z −5)                     café urn(3.2,−7)                       door 36.2…37.4
 −7 |surf|pharm|gelato|news|dentist|bakery|op shop|CAFÉ |LANE |boutique|barber|ice cream| CHIP SHOP |▯|real est.|
    −46  −39.5  −33  −26.5  −20  −13.5   −7  −0.5   6    11    17.5     22       28  (flat above) 36 37.6     46
−20                                                  │ piano(8.3,−20) bench x 9.2…9.7
−31                                                  │ drone(10,1.9,−31)  ┌─ exit pocket x 11…14, z −35…−31
−35                                                  └ statues (z −33.9) ─┘→ back street (not walkable)
     x: −44 (barrier)                 −12 (jetty axis)  0   6–11 (Bee Gees Way)     28–36 (chip shop)  42 (barrier)
```

**Key coordinates — Region P**

| Thing | Where | Notes |
| --- | --- | --- |
| Shop row facade | z = −7, x −46…+6 (Block A) and +11…+46 (Block C); 9 m deep (to z −16); parapets 6.5–7.6 m | Cantilevered awnings y 3.0, out to z −5.0. Flat roofs with AC boxes (seen from the crane) |
| Block A units (6.5 m each) | surf −46…−39.5 · pharmacy −39.5…−33 · gelato −33…−26.5 · newsagent −26.5…−20 · dentist −20…−13.5 · bakery −13.5…−7 · op shop −7…−0.5 · **café** −0.5…+6 | Café = corner shop at the lane mouth with a takeaway window x 2.0…4.4 and the **tea urn (the set's kettle)** at (3.2, 1.05, −7.05) |
| Bee Gees Way | x +6…+11, z −7…−35; exit pocket x +11…+14, z −35…−31 | Walls 7 m. Brick pavers. Festoon lights zig-zag across at y 4.2 |
| Block C units | boutique 11…17.5 · barber 17.5…22 · ice cream 22…28 · **chip shop 28…36** · flat street door pier 36…37.6 · real estate 37.6…46 | |
| Chip shop building | x 28…36, two storeys + parapet to y 7.6, brick | Ground: glass shopfront x 28.4…35.6, **service window x 29.6…32.0, y 0.9…2.1**, shop door x 33.0…34.0. First floor = Chase (2040)'s flat (§2.5). Ghost sign on the parapet y 6.6…7.6 |
| Flat street door | x 36.2…37.4 at z −7 (navy timber, brass "1A") | Hotspot `h17_flat_door` |
| Footpath (shop side) | z −7…−3, x −44…+42 | Barriers (padded "SAFETY ZONE" foam walls) at x −44 and +42 |
| Kerbs + padded bollards | shop side z −3.15, bay side z +5.15, every 1.6 m from x −44 to +42, gaps at both zebras | Colliders are continuous strips with the gaps |
| Road | z −3…+5. Lanes: **+X traffic z −1.0** (shop side, keep-left), **−X traffic z +3.0** | Hover-cars at y 0.32 ("a foot"). Painted lane lines, two zebras |
| Zebra W / Zebra E | x −16…−12 / x +22…+26, z −3…+5 | Stop lines 1.5 m before each zebra; cars yield (§10) |
| Promenade | z +5…+8, x −44…+42 | Lamps z 5.6 at x −40, −32, −24, −8, 0, 8, 16, 24, 32, 40; palms z 7.4 at x −36, −28, −4, 4, 12, 20, 28, 36 |
| Foreshore car park | x −42…−22, z 8…12 (6 nose-in bays facing +Z) | Idling hover-car at (−27, 0.32, 10.4, ry 0). Vehicle access is off-region at x < −44 |
| Jetty stage (band shell) | x −31…−25, z 13…19, faces +X; poster board on its −Z side at (−24.6, 1.6, 13.2) | Not walkable (behind the car park's low wall at z 12) |
| Plaza (jetty entrance) | pavers x −20…−4, z 8…18 | Palms at (−19.4, 17.3), (−5.5, 16.5); lamps (−18, 12), (−6, 12); **blank welcome sign** (3.0 × 1.6 on two posts) at (−16.5, 0, 15.5) facing −Z, beside the jetty entrance (kept off the 1.7 TRACK line) |
| **Jetty** | deck x −13.75…−10.25, z 18…54, y 0 (top), 0.3 thick; **T-head** x −20…−4, z 54…60 | Timber rails 1.1 m; piles to y −4; 6 jetty lamps; mooring poles to y 1.2 at (−9.4, 23.8) and (−14.6, 40.0); bench at the T-head (−12, 59.2) facing +Z |
| Under the jetty | sea wall z 18, rocks z 18…21, water from z 21 | Waves break on the rocks under the first spans (sample **Bay**) |
| Park | grass x −4…+42, z 8…18 | Bubble-wrapped tree (4, 0, 13.5), 4.2 m; kiosk (12, 0, 8.4) facing −Z; plaque plinth (−2.0, 0, 8.5) facing −Z; skate bowl centre (27, 0, 13.5), rim r 3.4, 1.2 deep (not walkable); park palms (−1.5, 15.5), (16, 15.5), (34, 12.5), (38, 16.0); beach palm (10, 20.5); benches (−1, 17.2), (9, 17.4), (34, 17.4) facing +Z |
| Suttons Beach | sand x −4…+42: flat y 0 for z 18…24 (walkable), slopes to the waterline y −1.5 at z 29 | Foam line at z ≈ 29 slides in and out |
| Water (Region P) | plane y −1.5, 1100 × 1100, centred (0, −1.5, 450) | Opaque, fogged, ripple texture scrolls |
| Rooftop billboard (blank) | x −12…+4, y 8…14, at z −12, facing +Z, on the roof of Block A | Physically blank; the Cloud+ AR ad sits on it in Chip View (1.7 step 12) |
| Inland town backdrop | z −16…−140: 24 instanced low blocks + 6 Norfolk pines + a water tower | Seen from the crane only |

**Bee Gees Way details**

| Thing | Where |
| --- | --- |
| Public piano (upright, painted) | body x 8.0…8.6, z −20.75…−19.25, h 1.3; **keyboard on the +X face**; bench x 9.2…9.7, z −20.7…−19.3, seat y 0.48 |
| Limiter box (SafeSense) | on the piano's **+Z end face**, centre (8.3, 0.85, −19.19), 0.34 × 0.26 × 0.12, white rounded, LED on top |
| Brass plate | hinged at the box's top edge (y 0.98), covers the keypad; lift angle 0 → −1.9 rad (about X) |
| Keypad | under the plate, (8.3, 0.82, −19.13), 3 × 4 keys |
| Lane palm (cicadas) | planter 0.9 × 0.9 at (10.3, 0, −26.5) against the right wall; palm 5 m |
| Statues | plinth x 6.8…10.2, z −34.7…−33.1, h 0.4; three generic bronze young men with guitars at x 7.4, 8.5, 9.6 (z −33.9), facing +Z, 1.8 m |
| Lane exit | pocket x 11…14, z −35…−31, opens east onto a back street (painted backdrop, not walkable). **Retractable padded bollards** at z −33, x 11.6 / 12.6 / 13.6 (up in 1.7, down in 2.2) |
| Drone home (2.2) | (10.0, 1.9, −31.0) facing +Z |
| Mural | both lane walls, z −8…−34, y 0.4…4.0 |

**The view down the lane** from the piano (8.3, −20) toward the bay: the mouth (x 6…11 at z −7) spans ±10.9°; the
bridge's near end is at 3.6° right — it shows on the horizon past the Parade and the foreshore palms.

### 2.3 Region W — Woody Point headland (local coordinates; **world = local + (−300, 0, 0)**)

```
  z (bay, +Z)                         Ted Smout Bridge dead ahead: from 16° LEFT to 15° RIGHT, ~370 m
 +70                 · bell buoy (10, −2.6, 70)
 ~~~~ water y −2.6 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Woody jetty x 24.8…27.2, z 2…40
 +9   rocks ..................................................
 +6.5 ═════ railing x −22…+22 (galvanised, 2 rails) ═════        pandanus (−18,4) (17,5)
      grass                                                     
  0             [ BENCH 1.9 m, faces +Z ] (0,0,0)  concrete pad 2.4 × 1.2
      grass
 −8   ════ concrete PATH (2.2 m wide), x −40…+40 ═══════  sign (−8.5,−9.8)  bin (4.5,−9.6)
 −10  shrubs / garden bed (collider)          picnic shelter (14,−12)
 −16  Norfolk pine (−14,−16)          Norfolk pine (12,−22)
 −46  road (backdrop) · low houses z −55…−65
      x: −40 … −16 (walkable from) … 0 … +16 (walkable to) … +40
```

| Thing | Local | World |
| --- | --- | --- |
| Bench centre (faces +Z) | (0, 0, 0) | (−300, 0, 0) |
| Bench: length 1.9 (x ±0.95), seat y 0.45, depth z −0.25…+0.25, backrest to y 0.9, **top rail** y 0.86 at z −0.24, arms at x ±0.98 (y 0.65) | | |
| **Memorial plaque** (brass, 0.30 × 0.07) on the **rear face of the top rail** | (0, 0.84, −0.275) | (−300, 0.84, −0.275) |
| Concrete pad | x ±1.2, z ±0.6 | |
| Path (concrete) | z −9.1…−6.9, x −40…+40 | |
| Walkable area | x −16…+16, z −10…+6.2 | x −316…−284 |
| Railing | z 6.5, x −22…+22, posts every 2 m, rails at y 0.55 and 1.05 | |
| Headland edge | sandstone wall face z 6.6…7.0 (y 0 → −1.2), rocks down to water at z 9…11 | |
| Shoreline (water y −2.6) | polygon (−40,−30) → (−30,−4) → (−22,6.8) → (22,6.8) → (30,0) → (40,−20) | |
| Norfolk pines (18–24 m) | (−14,−16), (12,−22), (−24,−4), (28,−12), (−6,−34) | |
| Picnic shelter (4 × 4 roof) | (14, 0, −12) | (−286, 0, −12) |
| Council sign (blank in 2040) | (−8.5, 0, −9.8) facing +Z | |
| Bin (padded cream) | (4.5, 0, −9.6) | |
| Pandanus clumps | (−18, 0, 4), (17, 0, 5) | |
| Woody jetty (stub, not walkable) | deck x 24.8…27.2, z 2…40, y −1.0 | x −275.2…−272.8 |
| Bell buoy (red, bobbing) | (10, −2.6, 70) | (−290, −2.6, 70) |
| Inland backdrop | road z −46, 12 low houses z −55…−65 | |
| Water (Region W) | plane y −2.6, 1100 × 1100 centred local (0, −2.6, 450) | |

### 2.4 Far groups (per region, `fog: false`, `MeshBasicMaterial`)

| Piece | Region P (world) | Region W (local) |
| --- | --- | --- |
| Horizon band (cylinder, open) | r 480, centre (0, 0, 0), y −2…+60, seaward arc 220° + inland arc | r 480, centre local (0,0,0) |
| Band skirt (opaque, colour = live fog colour) | same cylinder y −80…−2 | same |
| **Bridge** deck polyline | **A (−17, −1.5, 380) → B (−215, −1.5, 375)** | **A (105, −2.6, 365) → B (−100, −2.6, 372)** |
| Bridge profile | deck top 5 m above water, rising to a hump of 9 m at 55 % along; deck 1.6 m thick; piers every 18 m (12); lamp posts every 12 m (17) | same |
| Distant land on the band | Moreton Bay islands low and long to the left (+X); mainland shore + tiny Brisbane towers right (−X) beyond the bridge; inland arc: hills + trees | mainland shore behind the bridge, Redcliffe peninsula curving off to the left |
| Sun disc r 9 + additive halo r 26 | per env (§3.4) at distance 420 | per env |
| Clouds | 8 cumulus cards 300–460 m out, y 50–140 | same + `storm_clouds` group (5 dark anvil cards) behind the bridge at local (−20…+40, 30…140, 430) |

`flat` copies the Region P bridge into its own frame (flat local = parade − (32, 3.6, −7)):
A (−49, −5.1, 387) → B (−247, −5.1, 382). `foreshore26` copies Region W exactly (its origin is the bench spot).

### 2.5 The flat seen from outside (consistency with `SETS.flat`)

The flat's local frame sits at **parade (32, 3.6, −7)** with the same axes (flat local x 0 = parade x 32; flat floor =
parade y 3.6; flat front wall = parade z −7). So, on the chip shop's first floor:

| Flat feature | Flat local | Parade world |
| --- | --- | --- |
| Balcony (projects over the footpath like an awning) | x −4…−0.4, z 0…1.5, floor y 0, rail top 1.05 | x 28…31.6, z −7…−5.5, y 3.6, rail top 4.65 |
| Balcony sliding door | x −3.4…−1.0 | x 28.6…31.0 |
| **Kitchen window** | x 1.4…3.4, sill y 0.95, head 2.1 | **x 33.4…35.4, y 4.55…5.7** |
| Kitchen table (centre) | (2.3, 0, −0.95) | (34.3, 3.6, −7.95) |
| Christmas light string | along the balcony rail and on along the eave over the kitchen window (y 2.45) | eave y 6.05 |

Region P builds a **stub room** behind the kitchen window glass only (x 32.4…36.0, y 3.6…6.2, z −10…−7): cream walls, a
pendant lamp at (34.3, 6.0, −7.95), the table, three chairs and a half-down blind. Through the balcony door: a dark
painted interior card. The stub room is the only interior of the chip shop building.

### 2.6 Colliders

Region P (all `[x0, z0, x1, z1]`):

```
shops            [-46,-16, 6,-7]  [11,-16, 46,-7]
footpath ends    [-46,-7,-44,-3]  [42,-7, 46,-3]
kerb, shop side  [-44,-3.3,-16,-3.0]  [-12,-3.3, 22,-3.0]  [26,-3.3, 42,-3.0]
kerb, bay side   [-44, 5.0,-16, 5.3]  [-12, 5.0, 22, 5.3]  [26, 5.0, 42, 5.3]
zebra sides      [-16.3,-3,-16, 5]  [-12,-3,-11.7, 5]  [21.7,-3, 22, 5]  [26,-3, 26.3, 5]
promenade W end  [-46, 5,-44, 12]   car park W  [-46, 8,-42, 13]   car park N wall [-44, 12,-20, 12.4]
plaza W edge     [-20.4, 12.4,-20, 18]
sea wall         [-20, 18,-13.75, 18.4]  [-10.25, 18,-4, 18.4]
jetty rails      [-14.05, 18,-13.75, 54]  [-10.25, 18,-9.95, 54]
T-head rails     [-20.3, 53.7,-13.75, 54]  [-10.25, 53.7,-3.7, 54]  [-20.3, 54,-20, 60.3]  [-4, 54,-3.7, 60.3]  [-20.3, 60,-3.7, 60.3]
T-head bench     [-13.0, 58.95,-11.0, 59.5]
beach limit      [-4, 24, 42, 24.4]   park W edge [-4.4, 18,-4, 24]   park E edge [42, 5, 42.4, 24.4]
lane walls       [4,-37, 6,-16]  [11,-31, 13,-16]  [6,-37, 11,-35]  [11,-37, 16,-35]  [14,-35, 16,-31]
objects          tree [2.6, 12.1, 5.4, 14.9] · kiosk [11.4, 8.1, 12.6, 8.9] · plaque plinth [-2.5, 8.2,-1.5, 8.8]
                 sign posts [-18.1, 15.4,-17.9, 15.6] [-15.1, 15.4,-14.9, 15.6] · skate bowl [23.6, 10.1, 30.4, 16.9]
                 park benches (1.8 × 0.6 each) · palms (0.5 sq) · lamps (0.3 sq) · parked cars (2.0 × 4.2)
                 piano [7.95,-20.8, 8.95,-19.2] · piano bench [9.15,-20.75, 9.75,-19.25]
                 statues [6.7,-34.8, 10.3,-33.0] · lane palm planter [9.8,-27.0, 10.8,-26.0]
dress-dependent  lane bollards (day17 only) [11.2,-33.2, 14,-32.8]
                 lane22 confinement [1.3,-7, 1.5,-3]  [13.5,-7, 13.7,-3]   (keeps 2.2 to the lane + the footpath stub x 1.5…13.5, which includes the café urn)
dynamic          strollers (0.56 m squares, moved by update, parked at 1e4 when hidden as in Rue)
```

Region W (world):

```
railing [-322, 6.3,-278, 6.7] · west [-317,-10.4,-316, 6.7] · east [-284,-10.4,-283, 6.7] · inland [-317,-10.4,-283,-10]
bench [-301.0,-0.3,-299.0, 0.3] · sign post [-308.7,-9.95,-308.3,-9.65] · bin [-295.8,-9.9,-295.2,-9.3]
pandanus [-318.6, 3.4,-317.4, 4.6] (outside walkable; harmless)
```

---

## 3. Look

### 3.1 Palette (spec §14, 2040 day: the 2026 palette slightly cooler + glassy accent)

| Use | Hex |
| --- | --- |
| Sky (day) | `#8ccff8` (2026's `#8fd0ff`, cooler) |
| Sun / hot whites | `#fffbea` |
| Navy (awnings, door, trims) | `#141d3a` |
| Glassy 2040 accent (kiosk, hover-car glow, drones, AR glyphs) | `#bfe6ff` |
| Padded surfaces (bollards, bins, barriers, the tree's star) | soft cream `#efe6d0`, seams `#d8ccb0` |
| Tinsel / Christmas lights | silver `#c8ccd4`, red `#d8323a`, green `#2f9a4a`, warm white `#fff1d0` |
| Bitumen / lines | `#4a4d52` / faded `#d9d9d0` |
| Concrete footpath / pavers | `#cfc8ba` / `#d9b98f` |
| Grass (P, dry summer) / grass (W 2.3) / grass (W B2 washed) | `#8db255` / `#86b552` / `#6fbf4a` |
| Sand / wet sand | `#e9d8a6` / `#c9b484` |
| Water near / far | `#6cc3dc` / `#3d9fc4` |
| Jetty timber (weathered) | `#9c8c78` |
| Shopfront pastels | mint `#9fd8c4`, salmon `#f2a98c`, butter-cream `#f3e2b0`, pale blue `#b8d8ee`, white `#f2f3f4` |
| Chip shop brick | `#b5654a` |
| Bronze (statues, 2032 plaque) | `#8a5a2b` → highlights `#b8844a` |
| Brass (memorial plaque, limiter plate) | `#c9a54a` (warm brass, *not* Yes yellow) |
| Bench timber (varnished) | `#8a5a36` |
| Sandstone / Norfolk pine | `#d8b98a` / `#2e5a3a` |
| Railing (galvanised) | `#b8bec4` |

### 3.2 Materials

- `M.vc` — one Lambert, vertex colours: all untextured static geometry of a region (one per region → 1 draw call each).
- `M.atlas` — one Lambert with a **256 × 256 atlas** (nearest filtering) for every painted label/screen of Region P
  (grid of 128 × 64 cells, see §3.3). Region W has its own small atlas.
- `M.mural` — Lambert, 256 × 128 lane mural, repeat 4× along each wall.
- `M.glass` — Basic, transparent 0.35, shopfront glazing; interiors are painted cards behind it (in the atlas).
- `M.glow` — Basic (emissive look) for lamp heads, window glows, palm-light bulbs; colour/opacity driven by the
  "lights level" (§10).
- `M.water` — Lambert, vertex colours + 128 × 128 ripple texture, `fog: true`, offset scrolls.
- `M.sky*` — Basic `fog: false` for band, skirt, bridge, sun, clouds.
- `M.bench` — Lambert with the 128 × 64 varnished-timber texture whose top rail strip has **painted gloss streaks**
  (the mirror shine); no Phong. A small additive glint sprite (`bench.userData.glint(u)`) runs along the rail.
- No vertex snapping, no affine warping, no wobble.

### 3.3 Textures to paint (128–256 px, nearest; text must read at the stated shot)

| Texture | Size | Content (readable text in **bold**) | Read at |
| --- | --- | --- | --- |
| `t_plaque2032` | 128 × 64 | bronze plate, raised border, **BRISBANE 2032**, a small stylised flame | `s17_plaque` MID/INSERT |
| `t_limiter` | 128 × 64 | white rounded face, small "SafeSense", big **MAX 40 dB**, "for your safety", LED socket | `s22_limiter` |
| `t_keypad` | 128 × 64 | brass surround, **1 2 3 / 4 5 6 / 7 8 9 / ✱ 0 #** | `s22_keypad` |
| `t_blank` | 128 × 64 | pale sign panel `#eef1f3`, faint edge, a tiny 8 px AR glyph (dotted square + chip dot) in the bottom-right | every blank sign; `blank_sign` |
| `t_ghostsign` | 256 × 32 | faded white paint on brick: **FISH · CHIPS · OYSTERS · EST. 1971** | `chips` cam, `s17_dusk_exit` |
| `t_chipshop` | 128 × 64 | through-the-glass interior: steel fryers, a lit fluoro tube, a blank menu board, a tea towel | `chips_window` |
| `t_kiosk` | 64 × 128 | rounded glass screen: **SafeSense**, a smiling drop logo, **Here for you.**; idle bubbles (scroll) | `kiosk` |
| `t_piano` | 128 × 64 | sky-blue piano with painted flowers and notes, faded **PLAY ME** on the fallboard | lane cams |
| `t_mural_a`, `t_mural_b` | 256 × 128 each | generic seaside-music mural: waves, a sun, palms, guitars, stars, records; a row of framed **sepia photographs** of blurred generic figures (no likenesses, no song titles) | lane cams |
| `t_statue_plaque` | 64 × 32 | bronze, **illegible** engraved lines | (never read) |
| `t_poster2031` (festival31) | 64 × 128 | **REDCLIFFE FESTIVAL 2031 · JETTY STAGE · PUDDING 4:10 pm** + a diagonal sticker **CANCELLED** | `b1_2031_poster` |
| `t_shopfronts` | 4 cells of 128 × 64 | window displays: surfboards, pharmacy shelves, gelato tubs, newspapers, a dental chair, bread, racks, café cups | fp cams |
| `t_memorial` (Region W) | 256 × 64 | brass: **IN MEMORY OF LUKA · 2IC** / **"I'll do it."** / **He was the one who could.** Same layout as the CARD `memorial_plaque` so the INSERT cut is seamless | `s23_plaque` |
| `t_bench` | 128 × 64 | varnished timber slats, top-rail strip with white-blue reflection streaks (sky + bay) | `s23_rail_*` |
| `t_frangipani` | 64 × 64 | three white-and-pale-yellow-centred blossoms (alpha) | `s23_seat` |
| `t_ripple` | 128 × 128 | soft ripple noise, two blues | all water |
| `t_band_p`, `t_band_w` | 256 × 64 each, repeat ×4 | alpha silhouettes: low islands, far shore, tiny towers; inland: hills + trees | horizon |
| `t_cloud` / `t_storm` | 128 × 64 / 128 × 128 | soft cumulus / dark anvil with a lighter rim | sky |
| `t_bridge` | 64 × 16 | deck side: concrete with a dark underside line and lamp dots | bridge |
| `t_palmlights` | 64 × 64 | spiral of bulbs on a dark wrap (alpha) | palms |
| `t_bubblewrap` | 64 × 64 | translucent bubble grid with faint baubles beneath | tree |
| `t_window_figs` | 128 × 64, 2 frames | warm-lit kitchen: three seated silhouettes at a table under a pendant, frame B has one hand raised (a chip) | `s18_ext_window` |
| `t_grass`, `t_sand`, `t_pavers` | 64 × 64 | noise tiles | ground |

INSERTs that are CARDS (content/UI paint them at 2×; the set only provides the anchor and matching in-world art):
the memorial plaque (2.3), the slate screens (2.3, B2), the email draft (B2). Everything else listed in §6 is an
in-world close-up.

### 3.4 Lighting rig (hemi + dir + one spot) and fog, per preset

**Every preset defines `spot`** (intensity 0 when unused): `envFill` keeps the previous spot values when a preset omits it.

```js
env: {
  day:        { bg: 0x8ccff8, fog: [0xcfe6ef, 0.0044], hemi: [0xeef6ff, 0xb59c74, 1.10], dir: [0xfff6e6, 1.75, [10, 18, 12]],  spot: [0xffffff, 0],   rain: 0 },
  golden:     { bg: 0x9cc6ea, fog: [0xf2d6b0, 0.0046], hemi: [0xfff0dc, 0xa08060, 1.00], dir: [0xffc890, 1.35, [-4, 7, -16]],  spot: [0xffd6a0, 0.8], rain: 0 },
  dusk:       { bg: 0x4d5f8f, fog: [0x8a7f9a, 0.0050], hemi: [0xb8b8e0, 0x3a3040, 0.75], dir: [0xff9a70, 0.45, [-4, 3, -16]],  spot: [0xffc890, 2.2], rain: 0 },
  evening:    { bg: 0x1f2c55, fog: [0x2c3a66, 0.0055], hemi: [0x6f80b8, 0x1a1820, 0.60], dir: [0x8aa0d8, 0.25, [6, 10, 10]],   spot: [0xffcf98, 2.6], rain: 0 },
  morning:    { bg: 0x9fd4f4, fog: [0xf3e2c8, 0.0046], hemi: [0xf4f6ff, 0xa89070, 1.00], dir: [0xffe2b8, 1.40, [3, 5, 16]],    spot: [0xffe6c0, 1.2], rain: 0 },
  wp_morning: { bg: 0x98c4de, fog: [0xc8d6dc, 0.0044], hemi: [0xe8f0f6, 0x8a9a70, 1.00], dir: [0xfff0d8, 1.30, [6, 9, 14]],    spot: [0xffffff, 0],   rain: 0 },
  wp_washed:  { bg: 0x88cdf6, fog: [0xd8eef4, 0.0040], hemi: [0xf0fbff, 0x6f9a4c, 1.10], dir: [0xfff4e0, 1.50, [14, 7, 10]],   spot: [0xffffff, 0],   rain: 0 },
  wp_sunset:  { bg: 0xe89a6a, fog: [0xf0b080, 0.0046], hemi: [0xffd8b8, 0x6a4a40, 0.85], dir: [0xff9a50, 1.10, [-10, 3, 6]],   spot: [0xffffff, 0],   rain: 0 },
}
```

No preset name may contain "rain" (the world would build a rain system). The first key (`day`) is the default.

**Spot placement** (the set positions `world.torch` itself; see §12 engine note):

| Preset / state | Spot position → target | Angle / penumbra / distance | Purpose |
| --- | --- | --- | --- |
| `golden`, `dusk` in `day17` | (32.0, 2.9, −5.4) → (32.0, 0, −3.6) | 0.9 / 0.6 / 9 | warm pool in front of the chip shop: the destination glows |
| `evening` in `evening18` | (34.3, 6.0, −7.95) → (34.3, 3.6, −7.95) | 1.0 / 0.5 / 4 | the pendant over the flat's table (lights the three figures) |
| `morning` in `lane22` | (8.6, 8.0, −11.0) → (8.4, 0, −20.0) | 0.45 / 0.7 / 16 | a morning sunbeam down the lane onto the piano |
| others | intensity 0 | | |

**Sun disc** (the `sun` prop, at 420 m from the region origin along this direction):
`day` (0.19, 0.80, 0.55) · `golden` (−0.14, 0.21, −0.97) · `dusk` hidden · `evening` hidden · `morning` (0.35, 0.28, 0.89) ·
`wp_morning` (0.52, 0.62, 0.59) · `wp_washed` (0.80, 0.30, 0.52) · `wp_sunset` (−0.60, 0.06, 0.80).

**Fog**: FogExp2. Density ≈ 0.0044 makes the water fully fog-coloured at ≈ 450 m, so the water's edge meets the band
skirt (which copies the live fog colour every frame) with no seam. Backdrops ignore fog.

---

## 4. Props

Named props (content reaches them with `world.prop(name)`; animated ones expose `userData` functions; all animation
runs in `update()`). Region tag: P / W / F (far, per region).

| id | Region | Description | Scenes | States / animation (`userData`) |
| --- | --- | --- | --- | --- |
| `region_p`, `region_w` | — | the two region groups | all | visibility via `dress()` only |
| `hovercar_hero` | P | white 2040 hatch, rounded, no wheels, soft blue under-glow, indicator lamps, blob shadow | 1.7 TRACK + turn, 1.8 ext | `drive(pathId, speed) → Promise` along `paths[pathId]` (y 0.32, bob ±0.02); `indicate(on)` blinks the left lamps 1.6 Hz; `stop()`; hidden when idle |
| `hovercar_parked` | P | idling car in bay at (−27, 0.32, 10.4), ry 0 | 1.7 (sample Hover hum) | glow pulses 0.5 Hz; `highlight(on)` brightens glow while recording |
| `traffic` | P | InstancedMesh, 6 hover-cars (+ instanceColor: white, pale blue, silver, coral, mint, navy) | 1.7, 1.8, 2.2 | `count(n)` 0–6; cars loop x −70…+70 on their lane, yield at zebras (§10) |
| `cars_parked` | P | 2 static hover-cars in the foreshore car park (instances of the traffic geometry, separate IM) | 1.7–2.2 | static |
| `lifeguard_drone` | P | larger pod, red and white halves, speaker grille, flashing red top light, 0.9 m | 1.7 | hover bob, slow yaw sway; `talk(on)` pulses the grille light; hidden outside `day17` |
| `family` | P | group of 3 set-owned rigs (adult, adult, kid) waist-deep in the shallows | 1.7 | idle bob; `exit()` → they wade to `family_out_*` over 6 s and stand on the sand |
| `pelicans_p`, `pelicans_w` | P / W | one InstancedMesh pair per region: P bodies 6 + wings 12 (4 perched, 2 gliding circles); W bodies 2 + wings 4 (perched on the rocks) | 1.7, 2.2 (P: 2 far on the beach), B2 (W) | perched head-bob/clack every 5–8 s; gliders circle r 14 m at y 7–9 over the beach, period 30 s |
| `pelican_hero` | P / W | one separate pelican; `dress()` reparents it into the active region | 1.7 (on the mooring pole at the Bay sample), B2 (lands on the railing) | `clack()` (bill clack anim + sfx `pelican_clack`); `land(at, dur=3) → Promise` glide-in + flare + fold |
| `strollers` | P | 6 set-owned rigs with chip lights (looks `local40_a…f`) | 1.7 | walk the footpath/promenade lines in `paths.walk_fp` / `paths.walk_prom`, pause to "chip ping" or look at blank signs; one sits on the park bench at (9, 17.4); `on(bool)` |
| `palm_lights_a`, `palm_lights_b` | P | spiral light sleeves on even / odd palm trunks (InstancedMesh each) | 1.7, 1.8, 2.2 | alternate blink 0.8 Hz; brightness × lights level |
| `lane_festoon` | P | 40 bulbs zig-zag across Bee Gees Way at y 4.2 (InstancedMesh) | 1.7, 2.2 | slow twinkle |
| `lamps` | P | 18 lamp posts (promenade 10, plaza 2, jetty 6): post IM + head IM | all P | heads glow × lights level |
| `xmas_tree_wrapped` | P | 4.2 m cone tree wrapped in bubble wrap, padded cream star | 1.7 | static (examine) |
| `plaque_2032` | P | bronze plaque on a sandstone plinth, tilted 30°, facing −Z | 1.7 | static |
| `blank_sign` | P | freestanding 3.0 × 1.6 blank sign on two posts at (−16.5, 0, 15.5), facing −Z | 1.7 | static |
| `billboard_blank` | P | huge blank rooftop billboard x −12…+4, y 8…14, z −12 | 1.7 | static |
| `kiosk` | P | SafeSense kiosk (glass pillar, 2.1 m, screen faces −Z) | 1.7 | screen bubbles scroll; `chime()` pulses the screen (sample Chip chime) |
| `chip_shop_window` | P | the lit interior card + glass | 1.7, 1.8, 2.2 | `open(bool)`: lit/dark; fluoro tube flicker inside (Rue tube logic) |
| `awning_tinsel` | P | silver + red tinsel garland along the chip shop awning | 1.7, 1.8, 2.2 | gentle sway (rotation.z ±0.04 rad, 0.6 Hz) |
| `urn` | P | café tea urn on the takeaway ledge (the set's kettle) | 1.7, 2.2 | `steam()` puff on save (or `world.puff('urn')`) |
| `flat_door` | P | navy street door beside the chip shop | 1.7 | `open(bool)` swings 1.4 rad inward in 0.5 s |
| `flat_window` | P | the stub room: lit glass + pendant + blind | 1.7 (dark→lit at dusk), 1.8 | `lit(bool)` |
| `window_figures` | P | 2-frame card of three seated silhouettes behind the kitchen window glass, at (34.4, 4.9, −7.4) | 1.8 | visible in `evening18`; frame flips every 2.6 s (someone eats a chip). Content may hide it and seat real actors at `s18x_*` instead |
| `flat_balcony_lights` | P | the flat's balcony + eave light string (parade side) | 1.7 (dusk), 1.8 | 3-phase blink |
| `stage_2031` | P | band shell + empty poster board | all P | static |
| `poster_2031` | P | the festival poster with CANCELLED sticker on the stage board | B1 frame | visible only in `festival31` |
| `piano` | P | public piano + bench (static mesh) | 1.7, 2.2 | static; the piano mini-game reads keys on the HUD, not on the mesh |
| `limiter_light` | P | LED on the limiter box | 2.2 (1.7 red) | `set('red'|'green')`; red blinks slowly (0.5 Hz) |
| `limiter_plate` | P | hinged brass plate over the keypad | 2.2 | `lift(u)` 0 = closed … 1 = fully up (−1.9 rad); `prop(bool)` = stays up after the code |
| `keypad` | P | the keypad face | 2.2 | `press(d)` flashes a key (cosmetic) |
| `lane_bollards` | P | 3 retractable padded bollards across the exit pocket | 1.7 up / 2.2 down | `up(bool)` slides them y 0 ↔ −0.9 over 0.6 s; collider follows |
| `statues` | P | three bronze figures with guitars on the plinth (static merged) | 1.7, 2.2 | static |
| `lane_palm` | P | the cicada palm | 2.2 | fronds sway ±0.03 |
| `water_p`, `foam_p`, `glitter_p` | P | water plane, beach foam line, sun-glitter strip | all P | ripple offset scroll; foam z oscillates ±0.6 m, 7 s period; glitter offset under the sun bearing |
| `bench` | W | the memorial bench (own material) | 2.3, B2, credits | `glint(u)` 0…1 moves the glint along the top rail (INSERT); `polished(bool)` (always true in 2040) |
| `memorial_plaque` | W | brass plate on the rear of the top rail | 2.3, B2 | static |
| `frangipani` | W | three fresh blossoms on the seat at (−0.25, 0.47, 0.05) local | 2.3 | visible only in `bench23` |
| `bench_pad` | W | concrete pad | 2.3, B2 | hidden with the bench in `sunset33` |
| `railing_w` | W | posts IM + merged rails | W | static |
| `bell_buoy` | W | red cage buoy with a bell | 2.3, B2 | bob ±0.15, tilt ±0.12 rad, 4.2 s; bell sfx on each tilt peak when audible state allows |
| `storm_clouds` | W | 5 anvil cards behind the bridge | 2.3 | `build(u)` 0…1 scales/raises them (2.3 runs 0.2 → 0.8 over the scene); `flicker(on)` faint inner lightning (OFF by default; Reduce Flashing → slow dim pulse) |
| `puddles` | W | 6 sky-reflecting puddle decals on the path + pad | B2 | visible in `xmas40` |
| `slate_speaker` | W | Chase (2040)'s slate propped on the bench arm at local (−0.98, 0.68, 0.02) with a tiny speaker | B2 | `screen('off'|'drafts'|'sent'|'play')`; while 'play', the screen pulses with the music |
| `skateboard` | W | a deck with four wheels | B2 | `ride(actorId|null)` follows that actor's feet each frame |
| `woody_jetty` | W | jetty stub (piles IM + deck) | B2 crane, B1 frame | static |
| `council_sign_w` | W | blank council sign | W | static |
| `grass_w` | W | 320 grass tufts, one InstancedMesh with a wind sway shader (`uTime`) | W | sway |
| `water_w`, `foam_w` | W | water + rock foam | W | scroll |
| `band`, `band_skirt`, `bridge`, `bridge_lights`, `sun`, `clouds` | F (P and W copies, suffixed `_p` / `_w`) | backdrop | all | `bridge_lights`: lamp heads glow × lights level; 12 drone lights (Points) blink along the deck at night |

**Instanced repeats (counts)**

| Repeat | Count | Mesh(es) |
| --- | --- | --- |
| Padded bollards (kerbs + plaza) | 102 | 1 IM |
| Palms (promenade 8, park 4, plaza 2, lane 1, beach 1) | 16 | trunk IM + crown IM; light sleeves 2 IM (8 + 8) |
| Lamp posts / heads | 18 / 18 | 2 IM |
| Jetty piles | 68 | 1 IM |
| Jetty rail posts | 78 | 1 IM (rails merged into `M.vc`) |
| Traffic hover-cars | 6 | body IM (instanceColor) + glow IM + shadow IM |
| Parked hover-cars | 2 | 1 IM (shares geometry) |
| Pelicans | P 6 bodies / 12 wings · W 2 / 4 | 2 IM per region |
| Park/promenade benches | 3 (+ T-head bench merged) | merged static |
| Rocks (sea wall + under jetty) | 30 | 1 IM |
| Rooftop AC units | 20 | 1 IM |
| Inland town blocks / pines | 24 / 6 | 2 IM |
| Festoon bulbs | 40 | 1 IM |
| Grass tufts (P park) | 120 | 1 IM (no sway) |
| W: grass tufts | 320 | 1 IM (sway shader) |
| W: Norfolk pine tiers | 5 trees × 6 tiers | 1 IM |
| W: railing posts | 23 | 1 IM |
| W: rocks | 40 | 1 IM |
| W: jetty piles | 24 | 1 IM |
| W: inland houses | 12 | 1 IM |
| Bridge piers / lamps (per copy) | 12 / 17 | 2 IM |
| Clouds (per copy) | 8 | merged into 1 mesh |

Courtesy drones are **not** set props: content spawns them with `DRONES.spawn` on `paths.*` (§12).

---

## 5. Marks (`[x, y, z, ry]`, world coordinates)

Seated marks keep y = 0; the sit animation supplies the seat height (bench 0.45, piano bench 0.48). Region W marks are
world (local x − 300).

**General (Region P)**

| id | value | use |
| --- | --- | --- |
| `kettle` | [3.2, 0, −5.9, PI] | café urn save point (1.7, 2.2) |
| `flat_door` | [36.8, 0, −5.8, PI] | in front of the street door |
| `flat_door_in` | [36.8, 0, −7.8, PI] | just inside (actors vanish up the stairs) |
| `chips_window` | [30.8, 0, −6.0, PI] | at the service window |
| `kiosk` | [12.0, 0, 7.2, 0] | at the kiosk screen (sample Chip chime) |
| `tree_look` | [4.0, 0, 11.3, 0] | examine the bubble-wrapped tree |
| `plaque_look` | [−2.0, 0, 7.3, 0] | examine the 2032 plaque |
| `sign_look` | [−16.5, 0, 13.6, 0] | examine the blank sign |
| `bollard_look` | [−10.4, 0, 6.3, PI] | examine a padded bollard (the one at (−10.4, 5.15)) |
| `sample_hover` | [−25.6, 0, 10.4, −H] | beside the idling hover-car |
| `sample_bay` | [−11.0, 0, 23.2, H] | jetty east rail over the waves; `pelican_hero` on the pole at (−9.4, 1.2, 23.8) |
| `jetty_man` | [−12.0, 0, 59.2, 0] | the man on the T-head bench (seated, faces the bay) |
| `jetty_man_talk` | [−13.4, 0, 57.8, 0.79] | where the player stands to talk to him |
| `skate_kid` | [23.2, 0, 14.0, H] | the kid at the bowl's rim, "standing on" nothing |
| `skate_kid_talk` | [22.0, 0, 12.8, 0.75] | |
| `chips_woman` | [30.8, 0, −6.0, PI] | the woman at the chip window |
| `chips_woman_talk` | [32.3, 0, −5.1, −2.2] | |
| `family_1`, `family_2`, `family_3` | [13.6, −2.35, 30.4, PI], [15.0, −2.35, 30.9, PI], [16.2, −2.1, 30.3, PI] | set-owned, in the shallows |
| `family_out_1…3` | [13.4, 0, 23.0, PI], [14.6, 0, 23.4, PI], [15.8, 0, 22.9, PI] | after `family.exit()` |
| `lifeguard` | [15.0, 3.2, 32.6, PI] | drone home (prop) |

**1.7**

| id | value | step |
| --- | --- | --- |
| `s17_luka_start` | [−19.6, 0, 6.3, H] | after the crane: start of the TRACK (promenade, by the car park) |
| `s17_chase_start` | [−19.0, 0, 7.1, H] | |
| `s17_c40_start` | [−20.6, 0, 6.8, H] | |
| `s17_luka_plaque` | [−2.6, 0, 6.7, 0.35] | end of the TRACK, at the plaque (steps 9–13) |
| `s17_chase_plaque` | [−1.3, 0, 6.6, −0.3] | |
| `s17_c40_plaque` | [−3.4, 0, 6.0, 0.6] | |
| `s17_c40_pov` | [−3.1, 0, 6.1, PI] | Chase (2040) turns to the shops for the Chip View POV (eye y 1.62) |
| `s17_cp_plaza`, `s17_cp_park`, `s17_cp_fp`, `s17_cp_chips` | [−12.0, 0, 9.0, H], [0.0, 0, 9.0, H], [7.0, 0, −4.8, H], [24.0, 0, −4.8, H] | stealth checkpoints (Safe Room retry points) |
| `s17_exit_luka`, `s17_exit_chase`, `s17_exit_c40` | [35.6, 0, −4.6, PI], [37.6, 0, −4.4, −2.6], [36.8, 0, −5.8, PI] | gathered at the door for "Dusk. Cut." |

**1.8 (exterior shot)** — inside the stub room; flat-local seats + (32, 3.6, −7)

| id | value | |
| --- | --- | --- |
| `s18x_luka` | [33.65, 3.6, −7.95, H] | west chair |
| `s18x_chase` | [34.95, 3.6, −7.95, −H] | east chair |
| `s18x_c40` | [34.3, 3.6, −8.6, 0] | back stool, facing the window/street |

**2.2**

| id | value | step |
| --- | --- | --- |
| `s22_enter_luka`, `s22_enter_chase`, `s22_enter_c40` | [7.6, 0, −4.4, PI], [9.4, 0, −4.2, PI], [8.5, 0, −3.5, PI] | lane mouth, TRACK start |
| `s22_stop_luka`, `s22_stop_chase`, `s22_stop_c40` | [7.5, 0, −12.0, PI], [9.4, 0, −12.4, PI], [8.5, 0, −11.2, PI] | where they stop when the drone speaks |
| `s22_drone` | [10.0, 1.9, −31.0, 0] | drone home at the exit, facing in |
| `s22_drone_piano` | [8.3, 2.2, −20.0, H] | drone hovering over the piano, facing the keys (+X) |
| `s22_chip_c40` | [7.0, 0, −16.8, 2.64] | Chase (2040) reads the AR tag |
| `s22_plate_luka` | [8.05, 0, −18.5, PI] | Luka lifts the brass plate |
| `s22_keypad` | [8.6, 0, −18.5, PI] | whoever types 2032 |
| `s22_piano_chase` | [9.45, 0, −20.3, −H] | Chase at the keys (seated) — also the Piano sample spot |
| `s22_piano_c40` | [9.45, 0, −19.6, −H] | Chase (2040) on the other end of the bench (step 6) |
| `s22_c40_edge` | [6.6, 0, −15.4, 2.61] | Chase (2040) "at the edge of the lane" (step 2); for step 20 he turns to ry −0.05 (down the lane to the bay) |
| `s22_luka_hide` | [7.0, 0, −21.5, 0.6] | Luka hissing from behind the piano (step 21), crouched on the sneak side |
| `s22_sneak_1`, `_2`, `_3` | [6.8, 0, −17.0, PI], [6.8, 0, −25.0, PI], [7.0, 0, −31.5, PI] | the sneak line along the west wall (behind the drone) |
| `s22_exit` | [13.2, 0, −33.0, H] | in the exit pocket |
| `s22_cp_lane` | [8.5, 0, −9.0, PI] | stealth checkpoint |
| `s22_sample_cicadas` | [9.4, 0, −26.5, H] | facing the lane palm |

**2.3 (Region W, world)**

| id | value | step |
| --- | --- | --- |
| `s23_walk_luka`, `s23_walk_chase`, `s23_walk_c40` | [−315.0, 0, −7.6, H], [−316.0, 0, −8.4, H], [−317.0, 0, −7.9, H] | path entry (they walk in from frame left) |
| `s23_c40_stop` | [−305.0, 0, −8.0, 0.56] | "stops where the path meets the grass" |
| `s23_chase_stop` | [−303.8, 0, −8.7, 0.45] | |
| `s23_luka_stop` | [−304.2, 0, −7.3, 0.5] | control to Luka here |
| `s23_plaque_look` | [−300.0, 0, −0.85, 0] | behind the bench reading the plaque / running a finger along the rail |
| `s23_sit_prompt` | [−300.0, 0, 0.8, PI] | in front of the bench facing it (the "Sit down?" hotspot) |
| `s23_seat_luka` | [−300.0, 0, 0.08, 0] | centre seat |
| `s23_seat_chase` | [−299.36, 0, 0.08, 0] | Chase sits beside him (screen-left from behind) |
| `s23_seat_c40` | [−300.64, 0, 0.08, 0] | Chase (2040) on Luka's other side |
| `s23_c40_elbow` | [−303.0, 0, −8.0, 0.36] | on the path holding his own elbow (step 6) |

**B2 (Region W, world)**

| id | value | |
| --- | --- | --- |
| `b2_luka40` | [−300.0, 0, 0.08, 0] | sits on his own plaque (centre) |
| `b2_c40` | [−300.64, 0, 0.08, 0] | beside him, on the slate's side |
| `b2_crowd_1…5` | [−309.0, 0, −8.2, H], [−306.6, 0, −7.7, H], [−296.5, 0, −8.3, −H], [−294.2, 0, −7.8, −H], [−291.8, 0, −8.1, −H] | walkers on the path (content spawns `local40_*` actors) |
| `b2_stop_1…5` | [−306.0, 0, −7.6, 0.4], [−304.4, 0, −7.2, 0.3], [−296.8, 0, −7.4, −0.3], [−295.2, 0, −7.9, −0.35], [−293.6, 0, −7.5, −0.4] | where they slow and stop, facing the bench (crowd 3 takes the chip off her ear) |
| `b2_kid_start`, `b2_kid_stop` | [−315.0, 0, −8.2, H], [−302.2, 0, −8.4, 0.3] | kid rolls in on `skateboard` and stops |
| `b2_pelican_land` | [−294.4, 1.07, 6.5, PI] | `pelican_hero.land()` target on the railing (inside `b2_wide_path`) |

**Optional (B1 frames)**: `b1_33_luka` [−274.5, −1.0, 21.6, 0.3], `b1_33_chase` [−273.6, −1.0, 21.9, −0.4] (on the Woody jetty, `sunset33`).

---

## 6. Anchors (`{ at, from, fov }`, world)

**Region P**

| id | at | from | fov | for |
| --- | --- | --- | --- | --- |
| `s17_crane_a` | [80, 336, 231] | [−8, 62, −36] | 55 | 1.7 step 1 start: looking up into the blazing sun |
| `s17_crane_b` | [−12, 0.5, 46] | [−17, 7.0, 0.5] | 50 | 1.7 step 1 end: over the road behind a lit palm, the jetty running into the bay, the bridge at the horizon right |
| `s17_lifeguard` | [15.0, 2.2, 31.0] | [11.2, 1.7, 22.6] | 38 | step 2 (drone + family in the shallows) |
| `s17_track` | [−19.6, 1.2, 6.6] | [−17.6, 1.5, 10.4] | 44 | step 3 TRACK start (camera on the grass side, moves +X with them; road + car + blank shopfronts behind) |
| `s17_car_turn` | [−44.0, 0.8, 4.0] | [−36.0, 1.4, 9.2] | 40 | step 8 hover-car turning left (off the west end) |
| `s17_plaque` | [−2.0, 0.78, 8.36] | [−2.05, 1.05, 7.35] | 34 | step 9 close on BRISBANE 2032 |
| `s17_plaque_mid` | [−2.2, 0.95, 7.6] | [−0.2, 1.45, 4.8] | 42 | step 9–11 MID: plaque + the boys |
| `s17_pov_chip` | [−4.0, 6.5, −12.0] | [−3.1, 1.62, 6.1] | 60 | step 12 POV across the road at the shops and the rooftop billboard (Cloud+ AR sits on it) |
| `blank_sign` | [−16.5, 1.9, 15.45] | [−16.4, 1.7, 12.6] | 44 | examine |
| `tree` | [4.0, 1.7, 13.5] | [3.4, 1.6, 9.6] | 46 | examine |
| `bollard` | [−10.4, 0.45, 5.15] | [−9.6, 1.0, 6.7] | 36 | examine |
| `kiosk` | [12.0, 1.35, 8.3] | [12.0, 1.45, 6.9] | 38 | kiosk line + sample |
| `hover_parked` | [−27.0, 0.6, 10.4] | [−24.6, 1.3, 8.4] | 40 | sample |
| `jetty_waves` | [−11.6, −1.2, 21.4] | [−9.2, 1.4, 25.0] | 44 | sample Bay (waves on the rocks under the jetty) |
| `pelican_pole` | [−9.4, 1.4, 23.8] | [−10.9, 1.5, 22.4] | 34 | the clack |
| `jetty_man` | [−12.0, 1.0, 59.2] | [−13.6, 1.5, 56.4] | 40 | talk |
| `skate_kid` | [23.2, 1.0, 14.0] | [21.0, 1.4, 11.8] | 40 | talk |
| `chips_window` | [30.8, 1.4, −7.0] | [32.6, 1.6, −4.4] | 42 | talk |
| `flat_door` | [36.8, 1.2, −7.0] | [35.0, 1.6, −3.6] | 40 | exit |
| `s17_dusk_exit` | [34.5, 3.2, −7.0] | [24.0, 2.0, 6.5] | 46 | exit WIDE: chip shop, lit flat window, lamps, the three at the door |
| `urn` | [3.2, 1.15, −7.05] | [3.0, 1.45, −5.9] | 34 | save |
| `s18_ext_window` | [34.3, 4.9, −7.9] | [33.2, 1.5, 4.2] | 32 | 1.8 step 27: up at the window; `hovercar_hero` crosses frame on `car18_ext` |
| `s22_lane_track` | [8.5, 1.2, −9.0] | [8.6, 1.7, −1.2] | 44 | 2.2 TRACK behind them entering (statues at the end) |
| `s22_statues` | [8.5, 1.4, −33.8] | [8.5, 1.7, −24.0] | 34 | the statues |
| `s22_drone_end` | [10.0, 1.9, −31.0] | [8.6, 1.6, −26.5] | 36 | "This lane is closed for your safety." |
| `s22_ar_tag` | [8.3, 1.55, −19.1] | [7.2, 1.62, −16.9] | 36 | Chip View read of SERVICE CODE 2032 |
| `s22_limiter` | [8.3, 0.9, −19.19] | [8.3, 1.1, −18.5] | 34 | MAX 40 dB box, plate, LED |
| `s22_keypad` | [8.3, 0.82, −19.13] | [8.3, 1.05, −18.75] | 28 | typing 2032 |
| `s22_piano_play` | [8.6, 0.95, −20.0] | [10.4, 1.75, −20.9] | 40 | mini-game background (over Chase's shoulder at the keys) |
| `s22_piano_cam` | [9.5, 1.1, −19.95] | [7.15, 1.55, −19.95] | 44 | step 6 TWO-SHOT: the mirror, from behind the piano (piano top in the lower foreground) |
| `s22_c40_close` | [6.6, 1.6, −15.4] | [7.8, 1.6, −14.2] | 36 | step 2 CLOSE |
| `s22_lane_bay` | [−17.0, 3.0, 380] | [6.7, 1.62, −15.2] | 30 | step 20: down the lane to the bay, the bridge on the horizon through the mouth |
| `s22_luka_hiss` | [7.0, 1.0, −21.5] | [7.6, 1.3, −23.2] | 40 | step 21 |
| `s22_exit` | [12.6, 1.1, −33.0] | [8.0, 2.4, −27.0] | 44 | the sneak out |
| `b1_2031_poster` | [−24.6, 1.6, 13.2] | [−24.6, 1.6, 11.2] | 32 | optional B1 frame (`festival31`) |
| `crane_sky_p` | [−12, 0, 120] | [−6, 48, −30] | 50 | spare high establishing |

**Region W (world)**

| id | at | from | fov | for |
| --- | --- | --- | --- | --- |
| `wp_canon` | [−300.5, 0.7, 4.0] | [−298.5, 2.0, −13.0] | 40 | **"the angle from 2.3"**: 2.3 PLAY wide, 2.3 steps 6 and 35, B2 step 1. Path in the foreground, bench mid, bay + bridge ahead |
| `s23_path_wide` | [−306.0, 1.0, −8.0] | [−304.0, 1.7, −30.0] | 22 | 2.3_path step 1 (locked, long lens; they walk in from frame left, the bench small in the background) |
| `s23_plaque` | [−300.0, 0.84, −0.27] | [−300.0, 0.95, −0.78] | 26 | INSERT plaque (CARD `memorial_plaque` overlays) |
| `s23_rail_a` / `s23_rail_b` | [−300.7, 0.86, −0.24] / [−299.3, 0.86, −0.24] | [−301.2, 1.08, −0.82] / [−299.8, 1.08, −0.82] | 30 | INSERT finger along the top rail: TRACK a → b while `bench.glint(0→1)` |
| `s23_seat` | [−300.2, 0.47, 0.05] | [−300.2, 1.1, −0.6] | 34 | the frangipani on the seat |
| `s23_bench_front` | [−300.0, 0.95, 0.05] | [−299.6, 1.25, 3.0] | 40 | 2.3_bench step 1 MID from the front |
| `s23_c40_close` | [−300.64, 1.2, 0.08] | [−301.6, 1.3, 1.4] | 34 | step 25 (slate held up between them; voicemail) |
| `s23_storm` | [−290.0, 40, 420] | [−300.0, 1.4, −2.0] | 30 | the bridge with storm clouds building (step 35 cutaway if wanted) |
| `b2_slate` | [−300.98, 0.70, 0.02] | [−300.98, 1.15, 0.5] | 30 | B2 step 4 INSERT (CARD overlays) and step 9 MID |
| `b2_wide_path` | [−301.0, 0.8, −6.5] | [−290.5, 2.2, 8.5] | 48 | B2 step 10 WIDE from just beyond the railing: pelican lands on the rail in the left foreground, bench mid, crowd and kid on the path behind |
| `b2_crane_a` | [−300.5, 0.8, 2.0] | [−299.0, 2.4, −11.0] | 40 | B2 step 21 CRANE start |
| `b2_crane_b` | [−300.0, 0.0, 60.0] | [−296.0, 34.0, −40.0] | 46 | CRANE end: bench tiny at the bottom, the bay, the bridge on the horizon |
| `credits_bench` | [−300.0, 0.6, 0.0] | [−296.2, 1.4, −4.6] | 40 | credits vignette |
| `credits_bridge` | [−300.0, 4.0, 368] | [−300.0, 1.6, 5.5] | 14 | credits vignette (long lens on the bridge) |
| `b1_2033_jetty` | [−274.0, −0.2, 22.0] | [−282.0, 0.4, 12.0] | 38 | optional B1 frame (`sunset33`) |

---

## 7. Gameplay zones and fixed cameras

Silent Hill / RE: high corners, low lens down the jetty, long lenses across the park. All `pan` cams follow the player
within `limit` radians of `base`; `fixed` cams never move. Every drone patrol of 1.7 and the lane guard of 2.2 sit in a
zone whose camera is ≥ 3.6 m high, so the floor cones read.

```js
cams: {
  fp_far_west: { type: 'pan', pos: [-27.0, 4.6, 2.2],  base: [-40.0, 0.8, -5.2], look: 'player', fov: 44, limit: 0.55 },
  fp_west:     { type: 'pan', pos: [-11.0, 4.8, 1.6],  base: [-25.0, 0.8, -5.2], look: 'player', fov: 44, limit: 0.55 },
  fp_mid:      { type: 'pan', pos: [-18.6, 5.0, 3.2],  base: [-3.0, 0.8, -5.2],  look: 'player', fov: 42, limit: 0.60 },
  fp_east:     { type: 'pan', pos: [12.8, 5.6, 4.6],   base: [14.0, 0.8, -5.4],  look: 'player', fov: 50, limit: 0.60 },
  chips:       { type: 'pan', pos: [22.8, 3.4, 7.0],   base: [33.0, 2.4, -6.8],  look: 'player', fov: 46, limit: 0.50 },
  carpark_fs:  { type: 'pan', pos: [-43.0, 4.4, 15.0], base: [-30.0, 0.6, 7.0],  look: 'player', fov: 46, limit: 0.55 },
  jetty_plaza: { type: 'pan', pos: [-7.2, 6.0, -6.2],  base: [-12.0, 0.6, 13.0], look: 'player', fov: 44, limit: 0.50 },
  jetty_near:  { type: 'pan', pos: [-12.0, 2.3, 13.5], base: [-12.0, 0.8, 50.0], look: 'player', fov: 28, limit: 0.15 },
  jetty_end:   { type: 'pan', pos: [-4.6, 4.0, 61.6],  base: [-12.0, 0.4, 45.0], look: 'player', fov: 46, limit: 0.50 },
  park_west:   { type: 'pan', pos: [-3.0, 5.4, 3.0],   base: [8.0, 0.6, 18.0],   look: 'player', fov: 48, limit: 0.55 },
  park_east:   { type: 'pan', pos: [41.4, 5.0, 4.6],   base: [27.0, 0.6, 16.0],  look: 'player', fov: 48, limit: 0.55 },
  lane_mouth:  { type: 'pan', pos: [10.6, 3.6, -5.6],  base: [8.2, 0.8, -26.0],  look: 'player', fov: 42, limit: 0.40 },
  lane_end:    { type: 'pan', pos: [6.5, 4.6, -34.6],  base: [8.8, 0.6, -16.0],  look: 'player', fov: 46, limit: 0.45 },
  wp_canon:       { type: 'fixed', pos: [-298.5, 2.0, -13.0], look: [-300.5, 0.7, 4.0], fov: 40 },
  wp_bench_close: { type: 'fixed', pos: [-302.9, 1.5, -3.4],  look: [-300.0, 0.65, 0.2], fov: 42 },
  wp_bench_front: { type: 'fixed', pos: [-301.8, 1.35, 4.6],  look: [-300.0, 0.7, 0.0],  fov: 44 },
},
zones: [   // first match wins; boxes tile every walkable area
  { box: [-16, -3, -12, 5],      cam: 'jetty_plaza' },   // zebra W
  { box: [22, -3, 26, 5],        cam: 'chips' },         // zebra E
  { box: [-44, -7, -30, -3],     cam: 'fp_far_west' },
  { box: [-30, -7, -16, -3],     cam: 'fp_west' },
  { box: [-16, -7, 6, -3],       cam: 'fp_mid' },
  { box: [6, -7, 22, -3],        cam: 'fp_east' },       // includes the lane mouth threshold
  { box: [22, -7, 42, -3],       cam: 'chips' },
  { box: [-44, 5, -20, 12],      cam: 'carpark_fs' },    // west promenade + foreshore car park
  { box: [-20, 5, -4, 18],       cam: 'jetty_plaza' },
  { box: [-13.75, 18, -10.25, 36], cam: 'jetty_near' },
  { box: [-20, 36, -4, 60],      cam: 'jetty_end' },     // far deck + T-head
  { box: [-4, 5, 17, 24],        cam: 'park_west' },     // promenade + park + beach (west)
  { box: [17, 5, 42, 24],        cam: 'park_east' },
  { box: [6, -20, 11, -7],       cam: 'lane_mouth' },
  { box: [6, -35, 14, -20],      cam: 'lane_end' },      // incl. the exit pocket
  { box: [-316, -10, -284, -3.5],  cam: 'wp_canon' },    // 2.3: path + back grass
  { box: [-316, -3.5, -284, 0.4],  cam: 'wp_bench_close' },
  { box: [-316, 0.4, -284, 6.2],   cam: 'wp_bench_front' },
],
```

Foreground framing is intended in two places: the promenade palm at (36, 7.4) frames the left of `park_east`, and the
1.7 TRACK camera passes behind the palm at (−4, 7.4) (a natural wipe). No other cam has geometry within 2 m of its lens.

1.7's four zone families named in the script map as: **Parade footpath** = `fp_*`, `chips`; **jetty entrance** =
`jetty_plaza`, `jetty_near`, `jetty_end`; **foreshore park** = `carpark_fs`, `park_west`, `park_east`; **the laneway
behind the shops** = `lane_mouth`, `lane_end`. 2.3's "single fixed wide from behind the bench" is `wp_canon`; "a closer
angle" as Luka nears is `wp_bench_close`, then `wp_bench_front` when he walks round to sit.

**Stealth readability**

- 1.7 gentle patrols (content spawns 3 courtesy drones): `paths.s17_patrol_park` (seen by `park_west`, 5.2 m high),
  `paths.s17_patrol_plaza` (`jetty_plaza`, 6.0 m), `paths.s17_patrol_fp` (`fp_east`, 5.6 m). Cones len 4.5, half 0.5.
- 2.2 lane guard at `s22_drone` facing +Z, cone len 7.5, half 0.35: from `lane_end` the cone fans away from the lens;
  from `lane_mouth` it fans toward it. When it moves to `s22_drone_piano` (facing +X) the cone falls on the piano bench
  and the east half of the lane, leaving the sneak line along the west wall (x ≈ 6.8) clear and visibly outside it.

---

## 8. Hotspots

`who`: L = Luka, C = Chase, C40 = Chase (2040), any = active character. Lines are the script's; this table only fixes
place and verb.

| id | at (mark / anchor) | r | verb | who | scene | does |
| --- | --- | --- | --- | --- | --- | --- |
| `h17_blank_sign` | `sign_look` / `blank_sign` | 1.4 | Examine | any (+C40 answers) | 1.7 | "That sign's blank." / CHASE (2040): "It says 'Welcome to Redcliffe'. And an ad for teeth." |
| `h17_tree` | `tree_look` / `tree` | 1.6 | Examine | any | 1.7 | "They've bubble-wrapped Christmas." |
| `h17_bollard` | `bollard_look` / `bollard` | 1.0 | Examine | any | 1.7 | "It's soft. The bollard's soft." |
| `h17_kiosk` | `kiosk` / `kiosk` | 1.2 | Talk / Record | any (talk) · C (sample `chip`) | 1.7 | SAFESENSE: "Feeling lonely? Have you tried being safe?"; `kiosk.chime()` |
| `h17_hover` | `sample_hover` / `hover_parked` | 1.4 | Record | C | 1.7 | sample `hover` |
| `h17_bay` | `sample_bay` / `jetty_waves` | 1.2 | Record | C | 1.7 | sample `bay`; `pelican_hero.clack()` |
| `h17_jetty_man` | `jetty_man_talk` / `jetty_man` | 1.6 | Talk | any | 1.7 | his one exchange |
| `h17_skate_kid` | `skate_kid_talk` / `skate_kid` | 1.4 | Talk | any | 1.7 | "Confiscated. ^ I'm practising standing on it." |
| `h17_chips_woman` | `chips_woman_talk` / `chips_window` | 1.4 | Talk | any | 1.7 | "I tried to message my sister…" |
| `h17_flat_door` | `flat_door` / `flat_door` | 1.2 | Go in | any | 1.7 | exit: `world.env('dusk', 3)` → `s17_dusk_exit` → fade → 1.8 |
| `h_urn` | `kettle` / `urn` | 1.2 | Kettle | any | 1.7, 2.2 | "Put the kettle on? [YES] [NO]" save |
| `h22_tag` | `s22_chip_c40` / `s22_ar_tag` | 2.5 | Read (Chip View) | C40, chip on | 2.2 | AR `ar_lane_tag` becomes readable; "Olympics. Everything's 2032." |
| `h22_plate` | `s22_plate_luka` / `s22_limiter` | 1.0 | Lift | L | 2.2 | `strengthHold` → `limiter_plate.lift(u)` |
| `h22_keypad` | `s22_keypad` / `s22_keypad` | 0.9 | Type | any (plate up) | 2.2 | code 2032 → `limiter_light.set('green')` |
| `h22_piano` | `s22_piano_chase` / `s22_piano_play` | 1.0 | Play | C (limiter green) | 2.2 | mini-game `piano` |
| `h22_sample_piano` | `s22_piano_chase` | 1.0 | Record | C (limiter green) | 2.2 | sample `piano` |
| `h22_cicadas` | `s22_sample_cicadas` | 1.2 | Record | C | 2.2 | sample `cicadas` |
| `h22_exit` | trigger box [12.4, −35, 14, −31] | — | (walk in) | each | 2.2 | counts L and C40 out; Chase last |
| `h23_plaque` | `s23_plaque_look` / `s23_plaque` | 1.0 | Examine | L | 2.3 | INSERT plaque card |
| `h23_rail` | `s23_plaque_look` / `s23_rail_a→b` | 1.0 | Examine | L | 2.3 | INSERT finger + glint; "Someone's done a good job." |
| `h23_sit` | `s23_sit_prompt` | 1.1 | Sit | L | 2.3 | "Sit down? [YES] [NO]" (NO: "…Yeah. In a sec.", prompt returns) → 2.3_bench |

---

## 9. Cutscene needs (shots → geometry that must exist)

**1.7 "1.7_crane"**
1. CRANE down out of a blazing sky (`s17_crane_a` → `s17_crane_b`, ~6 s, ease in-out): needs the sun disc + halo in
   the `day` direction, sky colour, cumulus cards; then, as it descends: shop **roofs** with AC units and the blank
   rooftop billboard (lower frame), the inland town backdrop behind, the **full jetty with T-head** reaching into a
   flat blue bay, the bridge at the horizon right, palm trunks with Christmas lights in the foreground, `traffic` (6
   cars) gliding, strollers with chip lights, the lifeguard drone over Suttons Beach, the pelican gliders.
2. LIFEGUARD DRONE line: `s17_lifeguard` — drone, family waist-deep, foam line, beach. Optionally `family.exit()` after
   the line.
3. TRACK alongside the three (`s17_track`, camera moving +X at their speed on the grass side): road behind them,
   `hovercar_hero` on `paths.car17_track` (−X lane, walking pace) glides past between them and the blank shopfronts.
8. "Turning left. Are you sure?": `hovercar_hero.indicate(true)`; optional cutaway `s17_car_turn` as it turns +Z off
   the west end.
9. MID plaque (`s17_plaque_mid`, or `s17_plaque` for the plate itself).
12. POV Chip View (`s17_pov_chip`), 1 s: the engine's Chip View tint + `SETS.parade.ar` labels (signs, prices, street
   names) + `ar_cloud_billboard` filling the rooftop billboard. Pop-up "Signal detected." Then plain again.
- Exit (end of roam): `world.env('dusk', 3)` while the three gather at `s17_exit_*`; `s17_dusk_exit` WIDE (lamps on,
  palm lights bright, chip shop lit, flat window lit, the spot pool at the door); fade.

**1.8 step 27** (flow loads `parade` while in scene 1.8; `dress('evening18')` is automatic for scene id '1.8'):
`s18_ext_window` locked-ish slow push. Needs: the chip shop facade and awning (tinsel), the ghost sign, the flat's
balcony with blinking lights, the **stub room** with pendant, table and `window_figures` (or real actors at `s18x_*`),
the street lamps, `hovercar_hero` on `paths.car18_ext` (+X lane, 2 m/s, indicator on) crossing frame — content fires
the HOVER-CAR "Are you sure?" chirp as it passes x ≈ 33.

**2.2 "2.2_lane" and "2.2_piano"**
- TRACK behind them entering the lane (`s22_lane_track`, moving −Z behind them): lane walls with mural, festoon lights,
  the piano mid-lane with the SafeSense box, the statues at the end, the drone hovering by the exit. Needs the morning
  sunbeam spot on the piano.
- "This lane is closed for your safety." `s22_drone_end`.
- Piano cutscene: Chase plays on; the drone drifts from `s22_drone` toward `s22_drone_piano` during it.
  Step 2 `s22_c40_close`; step 6 `s22_piano_cam` (mirror two-shot; needs the piano top/back finished, both ends of the
  bench, and the lane wall behind them); step 20 `s22_lane_bay` — **requires the Parade, the promenade palms, the bay
  and the bridge to be visible through the lane mouth** (Region P is whole, so they are); step 21 `s22_luka_hiss`.

**2.3 "2.3_path" and "2.3_bench"**
- `s23_path_wide` locked long lens: the path running across frame, the blank council sign, Norfolk pines and shelter
  out of frame, **the bench small against the bay and the bridge** in the background.
- PLAY: `wp_canon` → `wp_bench_close` → `wp_bench_front`.
- Plaque INSERT (`s23_plaque`), rail INSERT (`s23_rail_a→b` + `bench.glint`), frangipani (`s23_seat`).
- Step 1 `s23_bench_front` (needs grass to the railing in front of the bench and the camera space at z +3).
- Steps 6 and 35 `wp_canon` locked: bench backs, Chase (2040) on the path in the foreground, the bay, **the bridge on
  the horizon with `storm_clouds` building behind it** (content raises `storm_clouds.build()` from 0.2 to 0.8 across the
  scene; no flicker during dialogue).
- Step 25 `s23_c40_close` (slate is a hand prop from art).
- Bell buoy visible in the wides; its bell is the scene's only "music".

**B2**
- Step 1 `wp_canon` locked (`wp_washed`: greener grass, puddles, clear sky, no storm clouds).
- Step 4 INSERT `b2_slate` (card); step 9 MID on the slate on the bench arm (`slate_speaker` visible, `screen('play')`).
- Step 10 `b2_wide_path`: crowd actors walk in from `b2_crowd_*` and slow to `b2_stop_*`; the kid on `skateboard`
  (`skateboard.ride('kid')`) stops at `b2_kid_stop`; `pelican_hero.land(b2_pelican_land)`; crowd 3 takes her chip off.
- Step 16 INSERT brick phone: framing helper on Chase (2040)'s hand.
- Step 21 CRANE `b2_crane_a` → `b2_crane_b` (~8 s): needs Region W's whole surroundings to ±80 m (pines, shelter,
  houses, road, rocks, Woody jetty), the water to the horizon, the bridge, a pelican on the railing, the crowd.

**B1 frames (optional)**: `festival31` (`b1_2031_poster`) and `sunset33` (`b1_2033_jetty`, **bench hidden** — 2033 is
before the fire).

---

## 10. Ambience and `update(dt, ctx)`

**Ambience** (`ambience: { loops: ['cicadas', 'surf', 'hover_far'], room: 'none' }` default; `dress()` switches with
`AUDIO.ambience({ loops })` + `AUDIO.setRoom(room)` when it changes state, guarded by `typeof AUDIO !== 'undefined'`).
Loop names are requests to the audio owner (`03-audio.js`).

| State | Loops | Room |
| --- | --- | --- |
| `day17` | `cicadas`, `surf` (gentle waves + occasional pelican clack), `hover_far` (distant glassy hum) | `none` |
| `day17` at `dusk` | `surf`, `hover_far`, `crickets` | `none` |
| `evening18` | `surf`, `hover_far`, `crickets` | `none` |
| `lane22` | `cicadas`, `hover_far` | `lane` (short slapback; until the audio owner adds it, it falls back to dry) |
| `bench23` | `wind`, `water_lap`, `bell_buoy` (one clank every 6–9 s) | `none` |
| `xmas40` | `birds`, `water_lap`, `wind_soft` | `none` |

One-shot SFX the set fires itself (rate-limited, never more than one per 0.5 s): `hover_chirp` when a traffic car
stops at a zebra; `pelican_clack` from `pelican_hero.clack()`; `bell` from the buoy only if the loop is absent.

**`update(dt, ctx)` — no allocation.** Preallocate one `Matrix4`, `Vector3`, `Quaternion`, `Color` scratch each; iterate
arrays with `for`; pass named functions to `world.actors.forEach` (as Rue's `nearDoor`), never inline lambdas.

1. Scene change → `dress(AUTO[state.scene] || 'day17')`. Env change (`ctx.env !== R.env`) → set the **lights level**
   `{ day 0, morning 0, golden 0.4, dusk 1, evening 1, wp_morning 0, wp_washed 0, wp_sunset 0.6 }` and apply it to
   `M.glow` (lamp heads, windows, palm lights, festoon), `bridge_lights`, sun visibility/direction.
2. Band skirt colour copies `world.scene.fog.color` every frame (only while this set is current).
3. Spot lamp: if the current state has a fixed lamp, write `world.torch.position/target` from preallocated vectors and
   set `world.torchAuto = false` (see §12).
4. Traffic: 6 cars, each `{ lane, x, v, vMax 5–7 m/s }`; advance, wrap at ±70; **yield**: if any actor stands inside a
   zebra box, cars within 12 m upstream decelerate to stop at the stop line (fire `hover_chirp` once); resume 0.8 s
   after it clears. Bob y 0.32 + 0.02·sin(2t + i). Write instance matrices; one `needsUpdate`.
5. `hovercar_hero`: when driving, advance along its path at its speed (precomputed segment lengths), yaw eases into
   the turn, indicator blinks; resolve its Promise at the end and hide.
6. Pelicans: 2 gliders on circles (wings rigid, a flap burst every ~9 s); 4 perched with head-bob; `pelican_hero` runs
   its land/clack timeline.
7. Lifeguard drone bob (±0.08, 1.3 Hz) + yaw sway; family bob (±0.03); family exit walk if requested.
8. Strollers (Rue `CUST` logic): walk their line, pause 2.5–6 s to `look_down` / chip ping; update colliders.
9. Palm lights A/B alternate (0.8 Hz), festoon twinkle, balcony lights 3-phase, lamp heads steady.
10. Water ripple offset (0.012, 0.02)·t; foam line z = 29 + 0.6·sin(t·0.9); glitter offset; clouds drift x 0.4 m/s
    wrapping.
11. Chip shop tube flicker; kiosk bubbles scroll; limiter LED blink when red; awning tinsel sway; `window_figures`
    frame flip every 2.6 s; lane palm fronds sway.
12. Region W: grass `uTime += dt`; bell buoy bob/tilt; `storm_clouds` ease toward their target `build` value
    (0.02/s) and optional faint flicker (respect `options.reduceFlashing`: slow 2 s dim pulse instead); bench glint
    sprite position from `glint(u)`; `skateboard` follows its rider's feet.
13. Lane bollards ease toward up/down; their collider box follows (written in place).

---

## 11. Performance budget (target < 300 draw calls; expected ≈ 110 in P, ≈ 70 in W)

| Group | Draw calls |
| --- | --- |
| Region P static: `M.vc` 1, `M.atlas` 1, `M.mural` 1, `M.glass` 1, `M.glow` 1, water 1, foam 1, glitter 1 | 8 |
| P instanced: bollards 1, palms 2 + lights 2, lamps 2, piles 1, rail posts 1, traffic 3, parked 1, pelicans 2, rocks 1, AC 1, town 2, festoon 1, grass 1 | 22 |
| P named props: hero car 2, parked car glow 1, lifeguard 2, kiosk 1, limiter/plate/keypad 3, lane bollards 1, stub room 2, window figures 1, balcony lights 1, tinsel 1, poster 1, pelican hero 1 | ~17 |
| P far: band 1, skirt 1, bridge 2 + lights 2, sun 2, clouds 1 | 9 |
| Rigs: strollers 6, family 3, content NPCs 3, heroes 3 (≈ 3 calls each) | ~45 |
| Courtesy drones (content, 3 × 2) | 6 |
| Region W: static 2, bench 1, plaque 0 (atlas), grass 1, pines 1, posts 1, rocks 1, jetty 1, houses 1, water 2, buoy 1, puddles 1, slate 1, skateboard 1, storm 1, far 9 | ~26 |
| W rigs: heroes 2–3, crowd 5, kid 1 | ~27 |

Rules: everything static and untextured in a region merges into its one `M.vc` mesh; every repeat above is an
`InstancedMesh`; the hidden region costs nothing (group invisible); backdrops are `MeshBasicMaterial` `fog: false`;
textures ≤ 256 px, one atlas per region; no shadow maps (blob shadows under rigs, hover-cars and the hero car only);
no per-frame allocation; the stroller rigs are built once at `build()` and reused.

---

## 12. API summary, data exports, engine notes

```js
SETS.parade = {
  env, build, marks, anchors, cams, zones, colliders, props, ambience, update,
  W0: [-300, 0, 0],
  dress(state),            // 'day17' | 'evening18' | 'lane22' | 'bench23' | 'xmas40' | 'festival31' | 'sunset33' | 'credits'
  region() → 'P' | 'W',
  paths: {                 // [[x, z], ...] (y implied: drones use their own height, cars 0.32)
    car17_track:  [[10, 3.0], [-44, 3.0], [-47, 6.5], [-47, 14]],          // −X lane, turns left (+Z) off the west end
    car18_ext:    [[14, -1.0], [48, -1.0]],                                // +X lane past the chip shop, indicator on
    walk_fp:      [[-40, -5.4], [40, -5.4]],  walk_prom: [[-40, 6.7], [40, 6.7]],
    s17_patrol_park:  [[0, 11], [8, 11], [8, 16.5], [0, 16.5]],             // loop round the wrapped tree
    s17_patrol_plaza: [[-18, 10], [-7, 10], [-7, 16], [-18, 16]],
    s17_patrol_fp:    [[4, -5.0], [20, -5.0]],                              // ping-pong past the lane mouth
    s22_guard:        [[10.0, -31.0], [9.0, -31.0]],                        // a slow sway at the exit
    s22_to_piano:     [[10.0, -31.0], [8.6, -24.0], [8.3, -20.0]],
  },
  ar: [   // content: for (const a of SETS.parade.ar) AR.add(a) whenever Chip View is allowed on this set
    { id: 'ar_cloud_billboard', at: [-4, 11, -11.8], text: 'OPTUS CLOUD+ · NEVER FORGET ANYTHING AGAIN · $14.99/month', kind: 'ad', w: 16 },
    { id: 'ar_welcome', at: [-16.5, 2.2, 15.4], text: 'WELCOME TO REDCLIFFE', kind: 'sign', w: 3 },
    { id: 'ar_teeth', at: [-16.5, 1.45, 15.4], text: 'SMILE BRIGHTER · teeth whitening $9.99', kind: 'ad', w: 2.6 },
    { id: 'ar_parade', at: [-16, 3.6, -3.2], text: 'REDCLIFFE PDE', kind: 'sign', w: 2 },
    { id: 'ar_lane', at: [8.5, 4.0, -7.2], text: 'BEE GEES WAY', kind: 'sign', w: 2.4 },
    { id: 'ar_chips', at: [32, 3.6, -6.9], text: 'FISH & CHIPS', kind: 'sign', w: 3.2 },
    { id: 'ar_chips_price', at: [30.8, 2.3, -6.9], text: 'Flake & chips $11.50 · Potato scallop $1.20', kind: 'price', w: 2.2 },
    { id: 'ar_jetty', at: [-12, 2.6, 18.2], text: 'REDCLIFFE JETTY · No fishing (for your safety)', kind: 'sign', w: 3 },
    { id: 'ar_beach', at: [14, 2.4, 18.5], text: 'SUTTONS BEACH · Swimming is a risk', kind: 'sign', w: 3 },
    { id: 'ar_kiosk', at: [12, 2.5, 8.4], text: 'Have you tried being safe?', kind: 'ad', w: 2.2 },
    { id: 'ar_hover', at: [-30, 2.6, 12.2], text: 'HOVERSURE · One foot is plenty', kind: 'ad', w: 2.6 },
    { id: 'ar_lane_tag', at: [8.3, 1.55, -19.1], text: 'SERVICE CODE 2032', kind: 'code', w: 1.2 },   // 2.2 only
    // one label per shopfront sign panel: { id: 'ar_shop_<name>', at: [unitCentreX, 3.6, -6.9], text, kind: 'sign', w: 3.2 }
    //   SURF −42.75 · PHARMACY −36.25 · GELATO −29.75 · NEWSAGENT −23.25 · DENTIST −16.75 · BAKERY −10.25 · OP SHOP −3.75
    //   CAFÉ 2.75 · BOUTIQUE 14.25 · BARBER 19.75 · ICE CREAM 25.0 · REAL ESTATE 41.8
  ],
};
```

**AUTO dress map**: `{ '1.7': 'day17', '1.8': 'evening18', '2.2': 'lane22', '2.3': 'bench23', 'B2': 'xmas40', 'C': 'credits' }`;
anything else → `'day17'`. Content may call `dress()` explicitly (e.g. B1 frames); the auto map only fires on a
scene change.

**Dress states**

| State | Region | Env (content sets it; listed for reference) | Shown | Hidden / changed |
| --- | --- | --- | --- | --- |
| `day17` | P | `day` (→ `golden` → `dusk`) | strollers, traffic 6, lifeguard drone, family, pelicans 6, palm lights, chip shop open, lane bollards **up**, limiter **red**, plate closed | window figures, poster, stub room dark until lights level ≥ 0.4 |
| `evening18` | P | `evening` | traffic 2, stub room lit + `window_figures`, balcony lights, lamps, chip shop open | strollers, lifeguard, family, gliders |
| `lane22` | P | `morning` | traffic 3 (far), lane bollards **down**, limiter red, plate closed, confinement colliders, 2 pelicans far on the beach, lane spot | strollers, lifeguard, family |
| `bench23` | W | `wp_morning` | bench, plaque, frangipani, storm clouds (build 0.2), buoy | crowd props, puddles, slate, skateboard |
| `xmas40` | W | `wp_washed` | bench, puddles, `slate_speaker` (hidden until content shows it), `skateboard`, pelicans 2 on the rocks, `pelican_hero` ready | frangipani, storm clouds |
| `festival31` | P | `day` | `poster_2031`, a little bunting on the stage | drones, AR, strollers |
| `sunset33` | W | `wp_sunset` | Woody jetty | **bench, plaque, pad, frangipani** (no bench in 2033) |
| `credits` | W | `wp_washed` | bench | people props |

**Engine notes (for `30-world.js` owner; minimal hooks)**

1. `world.torchAuto` is a global; `torchTick` moves the spot to the player's hand whenever it is lit and `torchAuto`
   is true. This set uses the spot as a fixed lamp, so its `update()` sets `world.torchAuto = false` while a lamp state
   is on. Please reset `W.torchAuto = true` in `showE()` so no set can leak it to the next.
2. Every env preset here defines `spot`, because `envFill` leaves the previous spot colour/intensity when a preset
   omits it.
3. Camera far plane 600 m: this set keeps all backdrops inside 520 m of each region's origin.

**Consistency with the other two specs**

- `docs/sets/flat.md`: flat local = parade − (32, 3.6, −7); balcony, kitchen window, table and light string positions
  in §2.5 must match exactly.
- `docs/sets/foreshore26.md`: Region W's local layout (§2.3), far group (§2.4), `wp_canon` and the 2.3 anchors are
  copied verbatim into `foreshore26` with the bench removed; its origin is the bench spot.
