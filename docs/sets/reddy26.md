# SET `reddy26` — Optus Redcliffe, Christmas 2026

File: `src/10-set-reddy26.js` · id `reddy26` · built from Rue's `SETS.reddy` (`ref/rue/05-set-reddy-optus-redcliffe-2026.js`).
This file also owns the **shared shell** that `reddy40` is built from (§2, §13). Every coordinate in this document is
the contract: scene writers code against the mark/anchor/prop/cam names below; the builder places geometry at them.

---

## 1. Purpose, scenes, time, env, dressing

Optus Redcliffe in Christmas week 2026: Rue's store, beat for beat, plus Christmas, the Hero Table and the Wall. It is
the opening of the game, the place the boys come home to, and the last thing the player sees (PC).

| Scene / beat | Story time | Weather / light | `env` | `dress()` state | Areas seen |
| --- | --- | --- | --- | --- | --- |
| 1.1 `1.1_open` + PLAY | Tue 22 Dec 2026, 11:31 | blazing 34 °C, clear, white sun | `day` | `xmas` | sky → Yes sign → car park → floor; roam floor, staff aisle, corridor, backroom |
| 1.2 | 11:58 (continuous) | same | `day` | `spotless` → `blast()` → `wrecked` | floor, behind counter |
| 1.3 setup / PLAY / `1.3_call` | 12:01–12:04 | same (alarms inside) | `day` | `wrecked` | backroom, corridor (Stall), door window, floor (end) |
| 1.3 split, **left half** | 12:03 | same | `day` | `wrecked` | backroom (wall phone) |
| PC | Tue 22 Dec 2026, 12:10 | same | `day` | `wrecked` + `{ pc: true }` | floor (locked wide), office through its door, counter phone |
| A1 split, **right half** | Thu 24 Dec 2026, 18:58 | golden evening, store closed | `evening` | `home` | floor, counter, new Hero Table in plastic |
| A1 "Home" | Thu 24 Dec, 18:58 | same (backroom is windowless) | `evening` | `home` | backroom (Rue's exact Act One frame), backroom door |
| A2 montage ×3 | ~Tue 29 Dec 2026, day | clear | `day` | `days_later`, `tinsel_down`, `wall_print` | floor/table; Yes wall + ladder; the Wall |
| B1 split right + "Home, without memories" | Thu 24 Dec, 18:58 | evening | `evening` | `home` | as A1 |
| B1 step 43 "later, the dark shop floor" | Thu 24 Dec, ~21:30 | night | `night` | `home_night` | floor, new table, counter |
| B1 montage **2027** frame | Wed 22 Dec 2027, day | clear | `day` | `xmas27` | Yes wall + ladder (mirror of A2 frame 2) |
| B1 step 57 **match cut** | Tue 22 Dec 2026, 11:58 | day | `day` | `spotless` | the exact `s12_heroic` frame |

Default dress per scene (applied automatically when `state.scene` changes, as Rue's `dress(id)` did):
`1.1 → xmas`, `1.2 → spotless`, `1.3 → wrecked`, `PC → wrecked {pc:true}`, `A1 → home`, `B1 → home`, `A2 → days_later`.
Montage frames, `home_night`, `xmas27` and the match cut are explicit `SETS.reddy26.dress(state)` calls from content.

---

## 2. Layout (shared shell — identical in `reddy40`)

Metres, **Y up**. Compass (used for sun/sky only): **+Z = west** (front: car park, road, houses), **−Z = east**
(rear: back yard, Redcliffe Parade, the bay), **+X = south**, **−X = north**. Overall footprint of the building strip
x −26…26, z −30.25…0 (store x −9.25…11.25); front car park to z 26, road z 27–35, houses z 45; rear yard to z −46,
Parade z −46…−55, foreshore z −55…−60, bay beyond.

Rotation convention (engine): `ry = 0` faces **+Z**, `π` faces −Z, `+π/2` faces +X, `−π/2` faces −X.

```
  -Z (east)  ··· bay ··· foreshore railing z-60 ··· palms ··· Parade road z-48.5..-55 ··· footpath z-46
            ┌fence x-6─────────────────────chainlink x6..17 [GATE 9.5..13.5]────────────fence x20┐ z-46
            │ (rear yard: scenery in 2026, walkable in reddy40 1.6)          tower(2040) (0.5,-39.5)│
            └──────────────────────────────── rear wall z-30.25 ─────────────────────────────────┘
 z-30 ┌ BACKROOM x2.4..10.4 ───────────────────────────────────────────┐
      │ [bench+pegboard 2.9..5.9][clock 4.4]  [ROLLER DOOR 6.6..8.9]  [kitchen 9.75..10.4: kettle,mug]
      │ shelves x2.4..2.95    P3(5.2,-27.7)    tube(6.6,-26.8)  P2(7.6,-27.3)      TV (9.92,-26.2)
      │ z-28.65..-25.35       P1(5.3,-26.2)  [DO NOT PAINT]    (P4 only in 2040)   lost property
      │ boxes  hooks  [WALL PHONE+JBOX x4.3]  switch 5.7  [DOOR 5.95..6.85]        (9.3..10.05,-24.5)
 z-24 └────────────────────────────────────────┬door┬────────────────────────┘
                                   CORRIDOR    │ W  │ x5.4..7.4, ceiling 2.7
                                   the Wall on │ A  │ x=5.4 face, z-19.4..-22.0
                                               │ L  │ extinguisher, mop bucket (right side)
 z-17                                          │ L  │┌ OFFICE x7.65..11, z-12.75..-17 ┐
                                               │    ││ desk (9.4,-15.5) chair        │
z-12.75 ┌──────────display wall x-5.3..1.3──┐ ┌┘    └┤ door x9.4..10.4 (hinge 9.4)   ┘
z-12.5  │ THE LATEST / ledge / 4 empty pucks│ │ YES WALL 2.75..5.35  targets 7.6..9.2 [clock 8.4]
        │                                   │ │  ladder (4.05,-11.75)        STAFF AISLE x2.6..11
 z-9.45 │ table(-4.4,-10)   table(0.4,-10)  ←open→ ┌── COUNTER x3.15..7.85 ──┐ phone+radio (7.55)
 z-8.55 │ accessories       AISLE x=-2      │      └─[glass showcase 4.75..6.45]┘
        │ wall x=-9  spinner(-6.8,-8.8)     │            ┌HERO TABLE┐ centre (5.6,-5.3) 1.6×0.9
        │ table(-4.4,-6)    table(0.4,-6)   │            └──────────┘           SIM rack (11,-5.9)
        │ brochures      queue(0.8,-1.9)  chairs x2.0/2.65/3.3 z-0.85   tree(9.25,-1.0) plant(10.3,-0.85)
 z 0    └keypad(-4.4)─[DOORS x-3.1..-0.9]──────── front glass x-9.2..11.2 (snow spray) ──────────┘
        A-frame (-4.9,1.3)   footpath / awning z0..3   bollards z3.35
 +Z     car park z3..23.4 (Rue's bays, cars, trolley bay)   road z27..35   houses z45   (west)
```

### 2.1 Key coordinates (shell)

| Thing | Coordinates |
| --- | --- |
| Shopfront glass line | z = 0 (glass quads x −9.2…−3.15 and −0.85…11.2, y 0.3–2.6) |
| Front doors | auto sliding, leaves at x −2.55 / −1.45, slide ±1.02; opening x −3.1…−0.9 |
| Store floor | x −9…11, z −14.5…0, ceiling 3.2 (Rue) |
| Display wall | navy feature wall z −14.5, x −5.3…1.3, ledge top y 1.0, header "THE LATEST" y 2.65 |
| Display tables | centres (−4.4,−6), (−4.4,−10), (0.4,−6), (0.4,−10); 1.0 × 2.3, top 0.91 |
| Counter | x 3.15…7.85, z −9.45…−8.55, top y 1.0; terminals at x 4.3 and 6.4 |
| Counter **glass showcase** (new) | counter body x 4.75…6.45 becomes a showcase: glass front z −8.66, y 0.12–0.92, glass shelf y 0.5, **open on the staff side** |
| Counter phone (store phone) | base centre (7.55, 1.0, −9.2) 0.22 × 0.07 × 0.24; handset prop `store_phone` |
| Store radio / counter speaker (new) | centre (7.55, 1.0, −8.78), 0.40 × 0.22 × 0.16, cones face +Z |
| Till | moved to x 6.85…7.3, z −9.4…−9.0 |
| Staff aisle | x 2.6…11, z −12.5…−9.45; **open to the floor on its left side** (x = 2.6) and through the gap at the counter's right end (x 7.85…11) |
| Yes wall graphic | quad 2.5 × 1.875 centred (4.05, 1.95, −12.465) on navy x 2.75…5.35 |
| Targets board | (8.4, 1.65, −12.465); **floor wall clock** (new) above it at (8.4, 2.62, −12.465), Ø 0.34 |
| Office | x 7.65…11, z −12.75…−17, ceiling 2.7; door hinge (9.4, −12.62), 1.0 wide |
| Corridor | x 5.4…7.4, z −23.75…−12.75, ceiling 2.7 |
| **The Wall** (new) | corridor left wall face x = 5.415 (facing +X), items z −19.4…−22.0, y 1.3–2.1 |
| Backroom | x 2.4…10.4, z −30…−24, ceiling 2.8; door hinge (5.95, −23.87), 0.9 wide, window y 1.3–1.75 |
| Backroom wall phone (new) | (4.3, 1.45, −24.035) on the front wall's room face; junction box (4.3, 0.95, −24.03) |
| Backroom light switch (new) | (5.7, 1.3, −24.01) |
| **Roller door** (new) | back wall x 6.6…8.9, opening h 2.3; drum housing x 6.5…9.0, y 2.3…2.62 |
| Backroom clock | moved to (4.4, 2.35, −29.965) above the bench (was 7.45) |
| Kettle | (10.08, 0.92, −28.55) (Rue) |
| Tube (flickers) | x 6.48…6.72, z −27.55…−26.05, y 2.7 (Rue) |
| Scorch marks | P1 (5.3, −26.2) Ø1.3 · P2 (7.6, −27.3) Ø1.5 · P3 (5.2, −27.7) Ø1.2 (2026 'home' on) · P4 (7.7, −25.6) Ø1.4 (2040 only) — all at y 2.79 |
| DO NOT PAINT sign | ceiling, (5.95, 2.788, −26.45), 0.30 × 0.21, text "up" toward −Z |
| Rear wall (strip) | z = −30.25 for x −26…26 (Rue had −31; moved so the roller door opens outdoors) |
| Rear yard | apron x 2…14, z −30.25…−33; asphalt x −26…26, z −30.25…−46; fence x −6, x 20, z −46 (chain-link x 6…17, gate x 9.5…13.5) |

### 2.2 Walkable area (2026)

Only the interior is walkable in reddy26: floor, staff aisle, corridor, office (door closed except PC), backroom.
The player never leaves through the front doors (Rue's door rule stays: the automatic doors open for every actor
**except the roaming player**). The roller door is shut in 2026. Car park/rear yard are scenery.

---

## 3. Look

**Palette (spec §14, 2026 Redcliffe):** hot white sun; Yes yellow `#ffd21f` (the Yes sign, the Yes wall, kick strips —
reserved for meaning); navy `#141d3a`; store blue `#1f6fe0`; tinsel silver `#d9dde3` with `#ffffff` glints and
tinsel red `#d6262e`; sky `#8fd0ff`. Interior whites `#f2f3f4`, warm wood `#c8a476`, cardboard `#b98d5a`.
Vertex tints as Rue: outside warm `[1.15,1.0,0.76]`, floor cool fluoro `[0.86,0.96,1.10]`, back-of-house `[0.90,0.97,1.06]`.
Clean PS1: no snapping, no wobble, no affine warp; nearest filtering; blob shadows only.

**Materials** (one merged mesh per material, Rue's Builder): `vc` (all vertex-coloured static, 1 draw), `glass`
(opacity 0.16, double), `light` (panel emissive), `ceil`, `tube`, `exit`, `warm`, `red`, `beam`, textured materials
listed below, plus new: `tinsel` (vertex-coloured, emissive 0.25, shimmer by animating emissiveIntensity),
`fairy` (emissive, instanced), `snow` (transparent, double), `wallAtlas`, `xmas` (A-frame + tent card atlas),
`smoke` (transparent, depthWrite false), `shard` (glass, opacity 0.5), `wrap` (shrink-wrap, opacity 0.35, double).

### 3.1 Textures to paint (128–256 px, nearest; **text must read at the named anchor**)

| Key | Size | Content (exact text in quotes) | Read at |
| --- | --- | --- | --- |
| `fascia` | 256×64 | Rue's: navy, Yes glyph, "optus", yellow underline (unchanged; the Santa hat is geometry) | `s11_crane_b`, `sign` |
| `office` | **256×320** | "LUKE" · "— MANAGER —" · "KNOCK" (blue italic, rotated −0.06) · "PLEASE" (red italic) · **new 4th line in thin blue biro, slanted, smaller: "ESPECIALLY YOU TWO"** | `office_door_sign` |
| `mon` (JARVIS) | 256×160 | Rue's JARVIS look. New mode `xmas`: blue desktop, JARVIS window, "JARVIS wishes you a Merry Christmas!", "Are you sure?", two square buttons **[YES] [YES]**; a tiny Santa hat on the window icon. Modes kept: `app`, `off` | `monitor_screen` |
| `tv` | 256×192 | New mode `xmas`: red card, white snowflakes, "MERRY CHRISTMAS" in gold, centred JARVIS window: title "JARVIS", "Rue's Christmas Message", "Video could not be played.", [OK]. **No face. Rue never appears on a screen.** Mode `off` (Rue's) | `tv` |
| `laptop` | 256×160 | File window titled **"UNFINISHED — 213 items"**; rows (newest first, top row highlighted blue): **"track two (dont open)"**, "kettle thing v3", "bridge idea (no bridge)", "untitled 211", "pudding 2??", "untitled 209" | `laptop` |
| `wallAtlas` | 256×256 | Regions: Polaroid 64×80 (Rue's gate arch, three soft figures — two blurry polos + young Rue — **all slightly out of focus, never resolving**); cassette label 64×32 "PUDDING" (Rue's `pudding`); note 64×40 handwriting **"Sorry for the wait. — R."**; MISSING poster 128×192 (Rue's texture verbatim: "MISSING", LUKA / CHASE, "Last seen 29/09." …); flyer 64×96 **"HOLD MUSIC" / "NOW FEATURING" / "PUDDING" / "— R."** with a cassette doodle; DO NOT PAINT sign 64×48 **"DO NOT PAINT — L."** (laminated sheen, tape corners); Rue mug wrap 64×32 **"I'M ON MUGS"** + small "— R." (**text only, no face**); `print4` 96×72 (A2: four men on a rooftop at golden hour inside a ring of yellow dots; the two older men at 35% opacity, double-exposed) | wall_* anchors, `do_not_paint`, `rue_mug`, `a2_wall` |
| `notice` | 256×192 | Rue's board, changed: keep **"LANYARD REQUESTS / please allow / 6–8 weeks"** (yellow paper, red pin, top-left at (12,12), rotation −0.04 — reddy40 reuses this exact paper yellowed); "ROSTER" → "XMAS ROSTER" (rows L/C/J); keep "PLEASE WASH YOUR MUGS (Chase)"; "STAFF BBQ Friday!" → **"BOXING DAY 7AM — ???"** | `noticeboard` |
| `targets` | 256×192 | Rue's, title → "CHRISTMAS TARGETS"; skull doodle wears a Santa hat; "C'mon team!" | `targets_board` |
| `cal` | 128×160 | `paintCal(day, month, weekday, year)` — **add the year parameter** (Rue hard-coded 2026). Values in §8 | `calendar` |
| `clock` | 128×128 | Rue's face (both clocks share it) | `clock_floor`, `wall_clock` |
| `snow` | 256×128 tile | Stencilled fake-snow spray: white flakes (70% alpha), frosted lower corners; on the right panel's centre an arc **"SEASON'S GREETINGS" painted mirrored** so it reads correctly **from the car park** (it's sprayed on the inside). **Keep x 3.8…7.4, y 0.8…2.0 of the right panel clear** (the `s11_mid_glass` sightline) | `s11_crane_c`, `s11_mid_glass` |
| `xmasAtlas` | 256×128 | A-frame poster "XMAS DEALS" / "Say yes to more data" with the Yes glyph wearing a Santa hat; display-wall tent card **"DISPLAYS: SEE HERO TABLE →"**; FRAGILE sticker (red) for the shrink-wrap; radio LCD "FM 97.3" (amber) | `aframe`, `display_wall` |
| `smudge` | 128×64 alpha | Hero Table glass: fingerprints, palm swipe, one ghostly forehead print (soft alpha blobs); `smudge1` 32×32 one fingerprint (A2/B1); `handprint` 32×32 (Chase, 1.1 at 99%) | `hero_glass` |
| `wrap` | 128×128 alpha | shrink-wrap wrinkles (white streaks), tape strips | `a1_split_store` |
| `phone` | 64×128 | Rue's "3%" screen (Hero Table phones) | `hero_phones` |
| `puff` | 64×64 alpha | soft smoke blob | — |
| keep | — | `queue` (000), `sim`, `slat`, `floor`, `asphalt`, `atlas` (STAFF ONLY, LOST PROPERTY, THE LATEST, BAKERY, PHARMACY, FOR LEASE, NOW SERVING 000, CUSTOMER PARKING), `lineup`, `posters`, `keypad`, `spin`, `shim`, `scorch` | — |

### 3.2 Lighting rig (hemi + dir + the one spot) and fog

| `env` | `bg` | `fog` | `hemi` [sky, ground, i] | `dir` [colour, i, pos] | spot | interior emissives (set applies on env change) |
| --- | --- | --- | --- | --- | --- | --- |
| `day` | `0x8fd0ff` | `[0xf4d8a8, 0.012]` | `[0xf2f6ff, 0xb39070, 1.15]` | `[0xfff4e0, 1.7, [3,14,4]]` | off | panels 0.95, ceil 1.0, fairy 0.6, Yes sign 0.25 |
| `evening` | `0xf0a868` | `[0xe8a070, 0.014]` | `[0xffd9b0, 0x6a5a6a, 0.85]` | `[0xffb070, 1.0, [-2,4,14]]` (low sun from the west/front) | off | panels 0.55 (counter row only 0.95), ceil 0.6, fairy 1.3, Yes sign 0.8 |
| `night` | `0x0f1a33` | `[0x101a30, 0.02]` | `[0x5a6a99, 0x1a1a26, 0.45]` | `[0x8fa8ff, 0.35, [-6,12,8]]` (streetlight/moon) | `[0xfff2d6, 1.2]` — content aims `world.torch` with anchor `table_downlight` | panels 0.0, ceil 0.15, fairy 1.6, exit signs 0.9 |

The spot ("torch") is otherwise free for content (JARVIS-cam borrows it). Sun disc + halo (Rue's `sun`) visible in `day`
only. Heat `shimmer` over the car park in `day` only. **No rain in reddy26** (drop Rue's `rain`/`streaks`).

**Sky/backdrop:** flat `bg` colour plus Rue's houses/trees to the west; to the east, behind the store, the rear yard,
Parade, palms, a 400 × 200 bay plane (`0x3d8fc4` day, `0x1b3a66` night; fog does the horizon) and a far headland
silhouette, so the 1.1 crane and any high shot see water past the roof. Ground plane enlarged to 400 × 400.

---

## 4. Changes from Rue's `reddy` (exact list)

**Keep (verbatim geometry):** car park, road, houses, awning, neighbours, roof part; floor, walls, panels, display wall
shell, display tables, accessories wall, spinner tower, posters, SIM rack, queue machine (000), keypad column (1158),
brochure stand, plant (dying), counter shell, terminals, stools, Yes wall graphic, targets board frame, office (desk,
filing cabinet, whiteboard, bookshelf, swivel chair `swivel_chair`), corridor shell, extinguisher, mop bucket, exit sign,
backroom shell, repair bench + pegboard, left-wall shelving, kitchenette, TV bracket, lost property box (+ Rue's
straightener inside), front doors + door sign, spinners, tube flicker logic, clock hand logic, traffic cars, sun, shimmer.

**Remove:** `halloween` + `hween`; the machine (`machine`, `machine_sign`, `machine_phones`, `machine_straightener`,
`machine_chair`) and its `wreck`; `car_black`, `car_door`, `rue_box`; `box_contents`, `dictaphone`, `teas`, `parcel`,
`margaret_phone`, `bag_spot`, `incident_report`, `postit` ("JARVIS DOWN 8:52"); Rue's 4 display-wall phones,
`tethers`, `wall_screens` and `alarm_light` on the display wall; `rain`, `streaks`, `window_flash`; env `halloween`,
`rain`; Rue's single `scorch`; the **left-side corridor stock boxes** (x 5.42…6.02 — frees the Wall); the back-wall
shelving x 6.35…8.55 (now the roller door); the backroom stock boxes x 3.3…3.85 by the door (keep one stack x 2.45…3.2);
Rue's customers `customer_a/b` (replaced, see props); Rue's scene-index `dress()`; Rue-only marks/anchors listed in §6–7.

**Change:**
1. Office door texture: **fourth line in biro, "ESPECIALLY YOU TWO"** (texture 256×320, quad 0.36 × 0.45).
2. TV: no Rue portrait ever; modes `xmas` (Christmas card + "Rue's Christmas Message — Video could not be played.") and `off`.
3. Monitors: new JARVIS mode `xmas` ("JARVIS wishes you a Merry Christmas! Are you sure? [YES] [YES]").
4. Calendar: December, with a year argument.
5. Noticeboard: BOXING DAY sheet, XMAS ROSTER (LANYARD REQUESTS paper unchanged).
6. Targets board title; A-frame poster (Christmas).
7. MISSING poster: off the right wall, **framed on the Wall**.
8. Display wall: empty — four tether pucks with snipped cable stubs, no phones, tent card "DISPLAYS: SEE HERO TABLE →".
9. Counter: showcase section x 4.75…6.45 (glass front, open back); till moved to x 6.85…7.3; radio + phone at the right end.
10. Backroom: roller door in the back wall; clock to x 4.4; hooks + hi-vis vest to x 2.9…3.5; wall phone + junction box at x 4.3; light switch at x 5.7.
11. Rear wall to z −30.25; Rue's dry-suburb backdrop behind the store → rear yard, Parade, foreshore, bay.
12. `dress()` is state-based (§8), `update()` per §10.

**Add:** Hero Table (+ blast, wreck, new/wrapped/new variants), Christmas dressing (Santa hat on the Y, tinsel ×6 kinds,
fairy lights, fake-snow spray, the sad tree), floor wall clock, the Wall, two scorch marks + DO NOT PAINT sign (+ P3 for
`home`), Rue mug, Chase's laptop, store radio, ladder, waiting chairs ×3, smoke layers, glass shards, alarm beacon over
the table, loose tether, cash tray, four-men print, tinsel coil, plastic heap, `cust26_a/b` browsers (A2/2027 only).

---

## 5. PROPS

Named groups (`world.prop(name)`); every API is `userData.*` and must be allocation-free and instant when skipping.

### 5.1 The Hero Table and the blast

| id | Description | Scenes | States / animation |
| --- | --- | --- | --- |
| `hero_table` | Freestanding glass display. Centre (5.6, 0, −5.3), 1.6 (x) × 0.9 (z). White plinth x 4.88…6.32, z −5.67…−4.93, h 0.75, Yes-yellow kick strip; glass vitrine sides y 0.75…0.93; glass top 1.6 × 0.9 at y 0.93…0.95 with a chrome edge trim. Four phones (graphite, silver, store blue, cream) in black cradle pucks on the top in a row at x 5.0, 5.4, 5.8, 6.2, z −5.3, tilted 20° back, **screens face +Z** (customers); coiled black tethers drop through grommets. Collider [4.75,−5.8,6.45,−4.8] | 1.1–1.2, PC (wreck), endings (new) | `set('smudged'\|'spotless'\|'wrecked'\|'new_wrapped'\|'new'\|'gone')`; `glint()` — a 0.08 m white emissive strip sweeps x 4.8→6.4 over 0.5 s (the SPOTLESS sparkle); `handprint(on)` — Chase's print at (5.95, 0.952, −5.15); `blast({ instant })` (below) |
| `hero_smudge` | Decal quad 1.56 × 0.86 at y 0.952 on the glass, `smudge` texture | 1.1 until polished | visible in `smudged`; `smudge1` (single fingerprint at (6.05, 0.952, −5.1)) visible in `new` |
| `hero_wreck` | What's left: plinth stub 0.35 h cracked open, four bent chrome corner posts (0.3–0.7 m) at the plinth corners, scorched floor decal Ø 2.8 (Rue's `scorch` texture), phone fragments ×8 (dark slabs) scattered r ≤ 3. Figure stands **in** it (mark `s12_figure`). Collider: four posts only | 1.2 (after blast), 1.3, PC | visible in `wrecked` |
| `hero_tethers` | Four tether cables hanging from the corner posts' tops (0.55 m) with alarm pucks on the ends (red emissive dots) | 1.2–1.3, PC | `swing(amp)` pendulum on each (x/z sway, slightly different periods 1.1–1.4 s), amplitude decays ×0.85/s ("slower and slower"); `alarm(on)` pucks blink 2 Hz (Reduce Flashing: 0.5 Hz soft pulse) |
| `tether_loose` | One broken tether (coil + puck) on the **staff side** floor at (6.3, 0.02, −10.1) — Chase scoops it in 1.2 | 1.2 | `visible`; content hides it when scooped |
| `alarm_beacon` | Rue's `alarm_light` model moved to hang under the ceiling over the table at (5.6, 3.1, −5.3); two red beam quads rotate | 1.2–1.3 | `on(bool)`; Reduce Flashing: beams off, dot pulses |
| `glass_shards` | **InstancedMesh, 80** small triangles (shard material). Rest positions: 50 on the floor within r 3.5 of the table, 18 on the counter top and the staff-side floor to z −10.6, 12 around `s12_luka_land` (Luka is "covered in glass dust") | 1.2–PC | animated only during `blast()` (ballistic, 0.8 s, precomputed per-instance start/velocity/rest arrays built once), then static; hidden outside `wrecked` |
| `blast_flash` | Emissive icosphere at (5.6, 0.95, −5.3) | 1.2 | `blast()` scales 0 → 2.5 m in 0.12 s, fades 0.4 s; Reduce Flashing: mid-grey, 1.2 s slow bloom |
| `hero_wrap` | Shrink-wrap: inflated translucent box 1.7 × 1.0 × 1.0 over the new table (no phones yet), two brown tape strips, a red FRAGILE sticker | A1/B1 split | visible in `home` |
| `plastic_heap` | Crumpled wrap on the floor at (6.7, 0, −4.3) | B1 `home_night` | visible in `home_night` |

**`hero_table.userData.blast({ instant })`** (1.2 step 16), 1.2 s timeline: t 0 `blast_flash`; phones and glass top
hidden, `hero_wreck` shown; shards fly; phone meshes 1–2 fly (one lands behind the counter at (4.9, 0, −10.3), one by
the display table at (1.3, 0, −6.4)), 3–4 vanish; `hero_tethers.swing(0.9)` + `alarm(true)`; `alarm_beacon.on(true)`;
t 0.25 `xmas_tree.fall()`; t 0.3 `tinsel_yes.set('fallen')`; t 0–1.0 `smoke_floor.amount` 0 → 1. Leaves the set
exactly in `wrecked`. With `instant` (skip / `fast=1`) jump to the end state.

### 5.2 Christmas dressing

| id | Description | States / animation |
| --- | --- | --- |
| `santa_hat_sign` | (static, merged into outside geometry) Santa hat jammed over the top of the **Y** on the fascia: brim ring Ø 0.64 centred (−4.06, 4.74, 0.50); red cone r 0.30, h 0.62, leaning +X 0.5 rad, flopped tip with white pompom r 0.09 at (−3.62, 5.22, 0.55); back half sinks into the navy sign box | always (reddy26) |
| `tinsel_sign` | 4 limp swags hanging off the sign box bottom edge (y 3.55, x −5.1…1.1) + two dangling ends 0.6 m | sways (gusts) |
| `tinsel_static` | Merged garlands (silver/red twist, 0.08 thick, two materials max): counter front (y 0.95, z −8.53, x 3.2…7.8, 3 swags); display-wall header (y 2.35, z −14.25, x −4.5…0.5, 3 swags); front transom inside (y 2.58, z −0.18, x −9…11, 6 swags); targets board top (y 2.3); noticeboard top (x 10.93, y 2.02); accessories header (x −8.88, y 2.45, z −13…−2.6, 5 swags); one sad strand over the kitchenette (y 1.55) | shimmer (material emissive 0.2–0.35, 0.7 Hz) |
| `tinsel_strand` | One strand hanging 0.8 m from the ceiling at the aircon vent (8.0, 3.2, −4.6) | sways ±0.12 rad, 0.6 Hz |
| `tinsel_yes` | The garland Jordan/Luka hang: two swags along the top of the Yes wall from (2.85, 2.98, −12.44) to (5.25, 2.98, −12.44), sag to 2.82 | `set('hidden'\|'half'\|'hung'\|'fallen')` — `half` = left swag only |
| `tinsel_floor` | Fallen tinsel: strands across the floor in front of the counter and in the staff aisle | visible in `wrecked` |
| `tinsel_coil` | A loose coil on the floor at (4.6, 0, −11.3) | A2 `tinsel_down` |
| `fairy_lights` | **InstancedMesh, 160** bulbs (0.03 m), colours red/green/yellow/blue/warm white: front transom inside (60), under the counter-front garland (30), spiral on the tree (20), border of the Yes wall graphic (20), backroom door frame (10), targets board (10), kitchenette (10) | `power(k)` 0…1.6 (per env, §3.2); twinkle: each bulb's colour scaled 0.4–1.0 on its own phase, updated at 8 Hz into the preallocated `instanceColor` |
| `snow_spray` | Two transparent quads on the inside of the front glass (z −0.02): x −9.2…−3.15 and −0.85…11.2, 2.3 h, `snow` texture repeated | static |
| `xmas_tree` | The sad plastic tree next to the plant: base (9.25, 0, −1.0), 1.6 m, four sparse grey-green tiers, few red/silver baubles, a tinsel spiral, crooked star, leans 0.06 rad. Collider [8.95,−1.3,9.55,−0.7] | `set('up'\|'fallen'\|'gone')`; `fall()` rotates 90° about its base edge in 0.6 s (ease-in), top toward −X, ending lying along z −1.0 from x 9.25 to 7.65; collider follows |
| `aframe_sign` | Rue's A-frame at (−4.9, 0, 1.3), ry 0.15, poster → `xmasAtlas` "XMAS DEALS" | static |

### 5.3 Floor, counter, staff aisle, office

| id | Description | States / animation |
| --- | --- | --- |
| `door_l`, `door_r`, `door_sign` | Rue's | `door_sign.userData.set(open)` / `flip()`; new **`door_l.userData.hold(true\|false\|null)`** forces both leaves open/shut (null = auto) — the crane passes through them |
| `store_radio` | Silver boombox at the counter's right end (§2.1) with handle, antenna, two cones, LCD | `playing` (bool): cones pulse ×1.06 at the music beat (4 Hz); LCD lit. On in 1.1–1.2, off from the blast |
| `store_phone` | Rue's handset on the base at (7.55, 1.05, −9.2) | content lifts/sets it; `ring(on)` jiggles it 12 Hz ±2 mm |
| `cash_tray` | Till drawer open with a cash tray at (7.05, 1.0, −9.25) | `home` |
| `monitor_screen` | Both counter monitors (Rue) | `show('xmas'\|'app'\|'off')` |
| `ladder` | Aluminium A-frame stepladder: h 1.8, treads y 0.42 / 0.84 / 1.26, top cap 1.68, footprint 0.55 × 0.9 open. Collider when standing [3.8,−12.2,4.3,−11.4] | `set('yes_wall'\|'folded'\|'carried'\|'hidden')`: `yes_wall` = open at (4.05, 0, −11.75), ry π (climber faces the wall); `folded` = leaning on the counter's right end at (8.05, 0, −8.7); `carried` = content parents it to an actor; `wobble()` ±0.04 rad roll for 0.6 s |
| `clock_floor_hands` | Hands for the new floor clock (8.4, 2.62, −12.455) | driven by the shared clock (below) |
| `clock_hands` | Backroom clock hands (moved to (4.4, 2.35, −29.955)) | `set(h, m)` sets the **shared** time for both clocks; the time otherwise advances in real time from `SCENES[id].time` |
| `calendar` | Rue's, on the right wall (10.965, 1.55, −10.35) | `set(day, month, weekday, year)` |
| `office_door` | Rue's hinged door + 4-line sign | `userData.open` (Rue easing); open in PC |
| `swivel_chair` | Rue's (Luke's chair) at (9.25, 0, −16.35) | Rue's `spin` |
| `chairs_wait` | (static) three black shell chairs on chrome legs, ry π, at x 2.0, 2.65, 3.3, z −0.85; collider [1.7,−1.15,3.6,−0.55] | — |
| `cust26_a`, `cust26_b` | Browsing customers (look ids `cust26_a/b`: shorts, thongs), Rue's CUST logic: `cust26_a` drifts along the accessories wall x −8.05, z −12.2…−10.0; `cust26_b` at the right display table x −0.6, z −10.6…−9.4 | visible only in `days_later`, `tinsel_down`, `xmas27` |

### 5.4 Corridor, the Wall, backroom

| id | Description | States / animation |
| --- | --- | --- |
| `the_wall` | One group (wallAtlas quads + frames, merged): **Polaroid** frame 0.20 × 0.24 at (5.415, 1.62, −19.55); **PUDDING cassette** box frame 0.30 × 0.22 × 0.05 at (5.43, 1.58, −20.05) with the cassette inside; **"Sorry for the wait. — R." note** 0.15 × 0.10 pinned at (5.415, 1.70, −20.45); **MISSING poster** A4 portrait in a black frame 0.30 × 0.42 at (5.415, 1.55, −20.95); **hold-music flyer** A5 0.21 × 0.30 at (5.415, 1.62, −21.5) | static |
| `print4` | Framed four-men print 0.30 × 0.22 above the Polaroid/cassette pair at (5.415, 2.02, −19.8) | visible in `wall_print` only |
| `backroom_door` | Rue's hinged door with window + spinner panel on the corridor side (the JARVIS door) | `userData.open` (Rue); new `request()` spins the panel 9 s then opens ("the door takes nine seconds") |
| `tube` | Rue's flickering tube | `userData.off`; new `flicker(n)` forces n bursts (A1/B1 "smoke curling up to the flickering tube") |
| `scorch` | Ceiling decals P1, P2, P3 (y 2.79, transparent `scorch` texture, random rotation) | `count(n)`: 2 (P1, P2) default; 3 (adds P3, "from Christmas") in `home`, `home_night`, `days_later`, `tinsel_down`, `wall_print`, `xmas27` |
| `do_not_paint` | (static) laminated A4 taped to the ceiling, §2.1 | — |
| `kettle` | Rue's kettle (save point) | Rue |
| `rue_mug` | White mug with the "I'M ON MUGS" wrap at (9.98, 0.92, −28.78), print facing −X (the room) | static |
| `tv_screen` | Rue's TV quad | `show('xmas'\|'off')` |
| `laptop` | Chase's laptop open on the bench at (3.95, 0.93, −29.55), screen 0.32 × 0.22 facing +Z (the room), `laptop` texture | screen emissive 0.9 |
| `wall_phone` | Cream wall phone body 0.12 × 0.22 × 0.07 + handset on its left hook + coiled cord | content lifts the handset; `ring(on)` |
| `jbox_lid` | Junction box lid hinged on its left edge (x 4.2), grey | `open` (bool) eases 0 → 100° |
| `remote_plugged` | The Remote (cream receiver gaffer-taped to a display chip + coil of 2040 cable) hanging from the open box at (4.3, 0.75, −24.1) | visible from flag `s13_wired` |
| `roller_door` | Slatted steel shutter in the back wall (Rue's `slat` texture, vertical), bottom rail with a handle. In 2026: shut | `set(gap)` (shared API, see reddy40) — 0 in 2026 |
| `smoke_floor` | **InstancedMesh, 36** crossed-quad puffs (3 planes each, `puff` texture) in r 3 around the wreck, y 0.3–2.2, drifting +X 0.1 m/s and rising, wrapping | `amount(k)` 0…1 (opacity + count); 1.2 → 1.0, 1.3 → 0.8, PC → 0.5 |
| `smoke_backroom` | **InstancedMesh, 20** puffs under the tube rising to it | `amount(k)`; A1/B1 home: content sets 1 then eases to 0 over 3 s ("it clears") |

---

## 6. MARKS — `[x, y, z, ry]`

Rue's generic marks are kept with their coordinates: `carpark_start/mid/door`, `door_in`, `keypad`, `window`,
`aisle_end`, `wall_front`, `floor_center`, `counter_luka` [6.4,0,−10.25,0], `counter_chase` [4.3,0,−10.25,0],
`jordan_counter` [5.35,0,−10.25,0], `counter_customer` [6.4,0,−7.85,π], `counter_customer2` [4.3,0,−7.85,π],
`noticeboard`, `luke_phone`, `luke_out`, `office_door`, `office_door_in`, `office_desk` [9.25,0,−16.35,0],
`browse_1…4`, `corridor_start`, `backroom_door_out` [6.4,0,−23.1,π], `backroom_door_in` [6.4,0,−24.9,π], `doorway`,
`bench`, `kettle` [9.45,0,−28.6,π/2], `tv_luka`, `tv_chase`, **`floor_luka` [5.8,0,−27.2,0.3], `floor_chase`
[7.0,0,−27.2,−0.3]** (the home frame), `bench_luka`, `bench_chase`. **Dropped** (Rue-only): `aframe`, `margaret_start`,
`car_*`, `rue_path_*`, `corridor_boxes`, `machine_spot`, `machine_seat`, `bench_rue`.

New marks:

| id | Position [x,y,z,ry] | Used by |
| --- | --- | --- |
| `s11_polish` | [5.6, 0, −6.35, 0] | 1.1 Luka crouched polishing, facing the table (+Z); Polish start; also A2/B1 polish frames |
| `s11_chase_phone` | [7.15, 0, −9.95, 0] | 1.1 Chase leaning on the counter, store phone to ear; 1.2 answers |
| `s11_chase_lean` | [6.25, 0, −6.2, −0.4] | 1.1 Chase leans over the glass (new smudge / 99% handprint) |
| `s11_jordan_top` | [4.05, 1.26, −11.95, π] | 1.1 Jordan on the 3rd tread, fistful of tinsel |
| `s11_jordan_down` | [4.75, 0, −10.9, −2.5] | 1.1 Jordan after climbing down ("You could've let me do that.") |
| `s11_luka_ladder` | [4.05, 0, −11.15, π] | 1.1 Luka at the ladder base (climb start / end) |
| `s11_luka_top` | [4.05, 1.26, −11.95, π] | 1.1 Luka hanging the tinsel |
| `s11_luka_counter` | [6.6, 0, −7.75, π] | 1.1 two-shot across the counter (Luka customer side) |
| `s11_chase_counter` | [6.6, 0, −9.95, 0] | 1.1 two-shot (Chase staff side); "check the calc" at the till |
| `s11_jordan_till` | [6.0, 0, −7.8, π] | 1.1 Jordan at the counter for the bundle price |
| `s12_luka_admire` | [5.6, 0, −7.05, 0] | 1.2 step 1 "Spotless." (one step back); B1 match cut |
| `s12_luka_apex` | [5.6, 1.6, −8.95, 0] | 1.2 mid-air point (slow motion) |
| `s12_luka_land` | [5.6, 0, −10.35, 0] | 1.2 Luka lands on his back behind the showcase, head toward +Z |
| `s12_figure` | [5.6, 0, −5.3, π] | 1.2 the figure stands where the table was, facing the counter |
| `s12_luka_over` | [5.4, 0, −7.9, 0] | 1.2 Luka after climbing back over the counter |
| `s12_c40_brush` | [5.5, 0, −7.25, π] | 1.2 Chase (2040) brushing dust off Luka's shoulder |
| `s12_chase_frozen` | [7.15, 0, −9.95, 0] | 1.2 Chase with the receiver (= `s11_chase_phone`) |
| `s12_exit_1` / `s12_exit_2` | [8.7, 0, −9.0, π] / [6.4, 0, −12.2, π] | 1.2 "Backroom. Now." route (round the counter's right end, into the corridor); Chase scoops `tether_loose` at [6.3,0,−10.1] |
| `s13_setup_c40` | [5.7, 0, −26.4, 0.9] | 1.3 setup: Chase (2040) produces the Remote |
| `s13_setup_luka` / `s13_setup_chase` | [6.9, 0, −25.6, −2.4] / [7.2, 0, −26.7, −1.9] | 1.3 setup |
| `s13_window_c40` | [6.6, 0, −24.6, 0] | 1.3 "(Through the backroom door window, Luke…)" |
| `s13_luke_stare` | [6.4, 0, −11.7, 0] | 1.3 Luke out of his office, staring at the wreck (seen through the window), then turns −Z |
| `s13_stall_luka` | [6.4, 0, −18.2, 0] | 1.3 Stall: Luka blocks the corridor, facing Luke |
| `s13_stall_luke` | [6.4, 0, −16.8, π] | 1.3 Stall: Luke |
| `s13_luke_door` | [6.4, 0, −23.25, π] | 1.3 suspicion full: Luke at the backroom door ("…Who's that?") |
| `s13_c40_pass_a` / `_b` | [5.2, 0, −24.65, π/2] / [7.9, 0, −24.65, π/2] | 1.3 round 4 "No.": the trench coat walks past the door window |
| `s13_wire_chase` | [4.3, 0, −24.6, 0] | 1.3 Chase at the junction box (Wiring) |
| `s13_wire_c40` | [5.15, 0, −25.0, −0.5] | 1.3 Chase (2040) reading out the colours |
| `s13_record` | [6.4, 0, −24.45, 0] | 1.3 Chase at the door window, recording Display alarm |
| `s13_call_c40` | [4.3, 0, −24.65, 0] | 1.3_call: Chase (2040) dials the wall phone |
| `s13_call_luka` / `s13_call_chase` | [3.55, 0, −24.95, 0.35] / [5.05, 0, −24.95, −0.35] | 1.3_call: crowding round the phone |
| `s13_luke_out` | [6.4, 0, −12.0, 0] | 1.3 end: Luke steps out of the corridor |
| `s13_jordan_ladder` | [4.6, 0, −11.25, −2.8] | 1.3 end: Jordan holding the ladder |
| `pc_jordan_mid` | [6.0, 0, −6.9, −2.6] | PC: Jordan alone in the middle of it all |
| `pc_jordan_phone` | [7.5, 0, −8.05, π] | PC: answering the counter phone over the counter |
| `pc_luke_desk` | [9.25, 0, −16.35, 0] | PC: Luke shouting into the desk phone (= `office_desk`) |
| `pc_ladder_pick` | [8.35, 0, −8.25, −2.2] | PC: picks up the folded ladder |
| `pc_ladder_path` | [9.3, 0, −10.3, −1.9] | PC: carrying it round the counter end |
| `pc_ladder_set` | [4.05, 0, −11.15, π] | PC: at the Yes wall (ladder `set('yes_wall')`), then climbs to `s11_jordan_top` |
| `a1_luke_count` | [7.05, 0, −9.95, 0] | A1/B1 split: Luke (Santa hat) at the till, doing the count |
| `a1_luke_door` | [6.4, 0, −24.55, π] | A1/B1 home: the door bangs open, Luke inside the doorway |
| `b1_luka_polish` | [5.6, 0, −6.35, 0] | B1 step 43: Luka with a cloth at the new table |
| `b1_chase_sit` | [6.9, 1.0, −9.0, 0] | B1 step 43: Chase sitting on the counter top, legs over the customer side, humming |
| `a2_luka_polish` | [5.6, 0, −6.35, 0] | A2 frame 1 |
| `a2_chase` | [6.75, 0, −6.6, −0.6] | A2 frame 1 ("You missed a bit.") |
| `a2_jordan_top` | [4.05, 1.26, −11.95, π] | A2 frame 2: Jordan taking the tinsel down |
| `a2_luka_hold` | [4.05, 0, −11.15, π] | A2 frame 2: Luka holding the ladder |
| `b27_luka_top` | [4.05, 1.26, −11.95, π] | B1 2027: Luka up the ladder hanging tinsel |
| `b27_jordan` | [4.7, 0, −11.0, −2.6] | B1 2027: Jordan at the bottom ("I could've—") |

---

## 7. ANCHORS — `{ at, from, fov }` (INSERT / ECU / examine / fixed cutscene lenses)

Rue anchors **kept**: `monitor`, `monitor2`, `monitor_screen`, `display_wall`, `door_sign`, `doors`, `keypad`,
`targets_board`, `noticeboard`, `calendar`, `queue_machine`, `pot_plant`, `accessories`, `sim_rack`, `office_door`,
`yes_wall`, `front_glass`, `sign`, `sky`, `wall_clock` (update: at [4.4,2.35,−29.96], from [4.4,2.2,−29.05], fov 30),
`tv`, `bench`, `lost_property`, `kettle`, `backroom_door`, `backroom_window`, `ots_chase`, `ots_luka`, `ceiling_corner`,
`store_back`, `luke_call`, `corridor_wide`, **`backroom_wide` { at [6.8,0.9,−28.6], from [3.2,2.1,−24.3], fov 55 }
(Rue's exact Act One frame — never move it)**. Dropped: `postit`, `phones`, `tethers`, `wall_switch`, `aframe`,
`halloween`, `car_window`, `machine`, `speaker`, `missing_poster`, `parcel`, `dictaphone`, `box_contents`,
`crane_top/end`, `pull_1…6`, `ceiling_scorch` (replaced below).

| id | at | from | fov | Shot |
| --- | --- | --- | --- | --- |
| `s11_crane_a` | [−2.0, 50, −20] | [−2.0, 30, 30] | 50 | 1.1 CRANE start: blazing sky |
| `s11_crane_b` | [−4.0, 4.8, 0.5] | [−3.3, 5.6, 4.4] | 40 | crane passes the Yes sign: Santa hat on the Y, limp tinsel |
| `s11_crane_c` | [−2.0, 1.2, 0.0] | [−1.2, 1.4, 9.0] | 45 | low over the shimmering car park, snow-sprayed windows ahead |
| `s11_crane_d` | [−2.0, 1.3, −6.0] | [−2.0, 1.5, 1.6] | 48 | at the doors as they slide open (`door_l.hold(true)`), through to the floor. Chain a→b→c→d as CAM glides (2.5 / 2.5 / 2 s) |
| `s11_mid_glass` | [5.6, 1.15, −8.5] | [5.6, 1.45, 2.6] | 34 | MID through the window: Luka at the table (centre), Chase at the counter behind (right), Jordan up the ladder (left, top) — stacked in depth through the clear patch of the snow spray |
| `hero_glass` | [5.5, 0.95, −5.3] | [5.15, 1.35, −5.95] | 32 | CLOSE · the glass (smudge, breath, Chase's finger) |
| `hero_top` | [5.6, 0.95, −5.3] | [5.6, 1.9, −5.9] | 40 | Polish: top-down (`angle:'top'`, frame-up = +Z) before the card takes over |
| `hero_phones` | [5.6, 1.05, −5.3] | [5.6, 1.35, −4.35] | 34 | examine phones ("3%") |
| `s11_ladder_low` | [4.05, 2.4, −11.9] | [4.7, 0.45, −10.2] | 50 | LOW · Jordan up the ladder, reaching (wobble) |
| `s11_ladder_ots` | [4.05, 2.7, −12.3] | [4.45, 1.0, −10.8] | 46 | OTS from below: Luka on the ladder, holding still |
| `xmas_tree` | [9.25, 0.8, −1.0] | [7.7, 1.45, −2.6] | 40 | examine tree |
| `office_door_sign` | [9.9, 1.55, −12.59] | [9.9, 1.58, −11.85] | 32 | the four lines |
| `wall_polaroid` | [5.42, 1.62, −19.55] | [6.05, 1.62, −19.55] | 28 | The Wall — Polaroid |
| `wall_cassette` | [5.43, 1.58, −20.05] | [6.05, 1.6, −20.05] | 30 | PUDDING cassette |
| `wall_note` | [5.42, 1.70, −20.45] | [5.95, 1.7, −20.45] | 24 | "Sorry for the wait. — R." |
| `wall_missing` | [5.42, 1.55, −20.95] | [6.25, 1.57, −20.95] | 34 | MISSING poster |
| `wall_flyer` | [5.42, 1.62, −21.5] | [6.1, 1.62, −21.5] | 30 | HOLD MUSIC flyer |
| `wall_all` | [5.42, 1.6, −20.5] | [7.3, 1.62, −20.5] | 50 | the whole Wall |
| `rue_mug` | [9.98, 0.97, −28.78] | [9.35, 1.2, −28.7] | 26 | "He's on mugs." |
| `ceiling_scorch` | [5.9, 2.8, −26.6] | [6.9, 1.2, −25.0] | 52 | "Two scorch marks…" (P1, P2 + sign) |
| `do_not_paint` | [5.95, 2.788, −26.45] | [5.95, 1.85, −25.6] | 28 | reading the sign |
| `laptop` | [3.95, 1.05, −29.65] | [3.95, 1.3, −29.0] | 32 | "UNFINISHED — 213 items" |
| `clock_floor` | [8.4, 2.62, −12.46] | [8.4, 2.4, −11.5] | 28 | INSERT wall clock 11:58 (1.1 end, 1.2 step 3), 12:04 (1.3 end) |
| `s12_heroic` | [5.6, 1.5, −7.05] | [5.25, 0.85, −4.6] | 46 | LOW · heroic, up past the glittering table edge; **B1 match cut uses this exact frame** |
| `s12_twoshot` | [6.6, 1.25, −8.9] | [4.4, 1.3, −6.0] | 44 | Luka foreground admiring the table, back to Chase at the counter |
| `floor_locked` | [4.6, 0.9, −8.2] | [−8.6, 2.9, −0.6] | 55 | WIDE · locked, the whole floor (BAM) |
| `s12_midair` | [5.6, 1.5, −8.6] | [3.9, 1.5, −8.3] | 38 | SLOW MOTION CLOSE, side-on, the display disintegrating behind |
| `s12_pov_upside` | [5.55, 1.3, −5.3] | [5.6, 0.32, −10.0] | 48 | LOW · Luka's view upside down: **through the showcase glass** to the figure in the smoke. **Roll 180°** (if the camera has no roll, flip the canvas for the shot) |
| `s13_window_pov` | [6.4, 1.35, −11.8] | [6.4, 1.6, −25.1] | 20 | through the backroom door window down the corridor to Luke |
| `door_window` | [6.4, 1.52, −23.87] | [6.4, 1.6, −24.6] | 30 | sample: Record? at the little window |
| `jbox` | [4.3, 0.95, −24.0] | [4.3, 1.0, −24.45] | 34 | junction box (Wiring card hand-off) |
| `wall_phone` | [4.3, 1.45, −24.0] | [4.5, 1.5, −24.75] | 36 | the wall phone / dialling |
| `split_a` | [4.4, 1.55, −24.3] | [8.4, 1.65, −29.3] | 50 | 1.3 split half, toward the wall phone (top edge catches P1). **Identical in reddy40** (shows the machine) |
| `split_b` | [6.4, 1.3, −27.5] | [4.0, 1.6, −24.4] | 52 | 1.3 split half, reverse: faces of the trio / the empty 2040 room. **Identical in reddy40** |
| `floor_wreck_wide` | [7.0, 1.0, −9.0] | [1.6, 2.2, −1.4] | 52 | WIDE · locked: wreck, smoke, tinsel, counter, Yes wall, **office door (open in PC) right of frame** — 1.3 end and PC step 1/12 (deliberately the same frame) |
| `counter_phone` | [7.55, 1.05, −9.2] | [7.3, 1.45, −8.55] | 30 | PC INSERT: he presses HOLD |
| `a1_split_store` | [6.6, 1.15, −9.2] | [9.4, 1.9, −3.0] | 50 | A1/B1 split right half: wrapped table foreground-left, Luke at the till |
| `home_door` | [6.4, 1.35, −24.0] | [7.4, 1.25, −28.9] | 46 | "the corridor door bangs open" |
| `b1_night_floor` | [6.0, 1.1, −8.0] | [2.0, 1.55, −2.4] | 46 | B1 step 43 WIDE: Luka at the table, Chase on the counter |
| `table_downlight` | [5.6, 0.95, −5.3] | [5.6, 3.1, −5.0] | — | where content aims `world.torch` in `night` |
| `a2_polish` | [5.7, 0.95, −5.6] | [3.4, 1.5, −3.3] | 40 | A2 frame 1 |
| `a2_ladder` | [4.05, 1.9, −11.9] | [6.7, 1.6, −9.9] | 50 | A2 frame 2 **and** B1 2027 (same frame, roles reversed) |
| `a2_wall` | [5.42, 1.8, −19.8] | [6.7, 1.75, −19.75] | 40 | A2 frame 3: Polaroid, cassette, the new print above |

---

## 8. Dressing states — `SETS.reddy26.dress(state, opts)`

`dress()` is idempotent and instant. It sets every prop below (nothing inherits from the previous state).
`opts` may override single keys: `{ ladder, smoke, alarms, officeDoor, scorch, radio, tinsel }`.

| key | `xmas` | `spotless` | `wrecked` | `wrecked {pc}` | `home` | `home_night` | `days_later` | `tinsel_down` | `wall_print` | `xmas27` |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| hero_table | smudged | spotless | wrecked | wrecked | new_wrapped | new (smudge1) | new (smudge1) | new | new | new (spotless) |
| tethers / alarms | — | — | swing 0.9 / on | swing 0.15 / off | — | — | — | — | — | — |
| smoke_floor | 0 | 0 | 0.8 | 0.5 | 0 | 0 | 0 | 0 | 0 | 0 |
| tinsel_yes | hidden | hung | fallen | fallen | hung | hung | hung | half | hung | half |
| tinsel_floor | — | — | on | on | — | — | — | — | — | — |
| xmas_tree | up | up | fallen | fallen | up | up | up | up | up | up |
| ladder | yes_wall | yes_wall | yes_wall | folded | hidden | hidden | hidden | yes_wall | hidden | yes_wall |
| store_radio | on | on | off | off | off | off | on | on | on | on |
| door_sign | OPEN | OPEN | OPEN | OPEN | CLOSED | CLOSED | OPEN | OPEN | OPEN | OPEN |
| office_door | shut | shut | shut | **open** | shut | shut | shut | shut | shut | shut |
| monitors | xmas | xmas | xmas | xmas | off | off | app | app | app | xmas |
| tv | xmas | xmas | xmas | xmas | off | off | off | off | off | xmas |
| scorch count | 2 | 2 | 2 | 2 | 3 | 3 | 3 | 3 | 3 | 3 |
| print4 | — | — | — | — | — | — | — | — | **on** | — |
| tinsel_coil / plastic_heap / cash_tray | — | — | — | — | cash_tray | plastic_heap | — | tinsel_coil | — | — |
| customers | — | — | — | — | — | — | cust26_a,b | cust26_a,b | — | cust26_a,b |
| calendar | 22 DEC TUE 2026 | same | same | same | 24 DEC THU 2026 | same | 29 DEC TUE 2026 | 31 DEC THU 2026 | 29 DEC TUE 2026 | **22 DEC WED 2027** |
| clocks (explicit calls; auto-dress uses `SCENES[id].time`) | 11:31 | 11:58 | 12:01 | 12:10 | 18:58 | 21:30 | 10:15 | 16:40 | 10:15 | 11:20 |
| tether_loose | — | — | on (until scooped) | — | — | — | — | — | — | — |
| remote_plugged / jbox_lid | — | — | per flag `s13_wired` | — | — | — | — | — | — | — |

All Christmas dressing (tinsel_static, tinsel_sign, fairy_lights, snow_spray, santa_hat_sign, tinsel_strand) is on in
**every** state (the store stays decorated through the holidays; A2 frame 2 is the take-down). Env is set by content,
not by `dress()`, but the interior emissives follow the env (§3.2).

---

## 9. GAMEPLAY ZONES + FIXED CAMS

Rue's cameras and zone list are kept (they tile every walkable area; order matters — first match wins). Only
`counter` gains the Hero Table in its mid-ground. All are gameplay cams (not used in cutscenes, which have anchors).

| Cam | type | pos | look / base | fov | limit |
| --- | --- | --- | --- | --- | --- |
| `staff` | pan | [1.6, 2.35, −5.6] | base [7.6, 1.1, −11.2] | 46 | 0.6 — over the counter: the Yes wall + ladder, Chase at the phone |
| `corridor` | push | [6.4, 1.95, −11.0] → [6.4, 1.85, −15.0] | player | 44 | dur 25 — the Wall reads on the left |
| `office` | pan | [7.9, 2.45, −12.95] | base [9.6, 0.7, −16.0] | 55 | 0.5 |
| `backroom` | fixed | [3.2, 2.1, −24.3] | [6.8, 0.9, −28.6] | 55 | — (the Act One frame) |
| `backroom_rev` | pan | [9.9, 2.4, −29.6] | base [5.0, 0.8, −24.8] | 55 | 0.45 — the wall phone / junction box corner |
| `entrance` | pan | [−8.3, 2.85, −5.9] | base [−2.0, 1.0, −0.6] | 50 | 0.5 |
| `counter` | pan | [10.5, 2.7, −0.8] | base [4.8, 1.0, −8.6] | 48 | 0.6 — tree foreground right, Hero Table mid, counter behind |
| `aisle` | pan | [−2.0, 1.95, −0.6] | base [−2.0, 1.3, −14.5] | 40 | 0.3 |
| `accessories` | pan | [−8.4, 2.8, −3.6] | base [−6.2, 0.9, −11.5] | 50 | 0.65 |
| `shopfront` / `carpark` | pan | Rue | Rue | 42 | (unused in TWO, kept) |

| # | Zone box [x0, z0, x1, z1] | Cam | Covers |
| --- | --- | --- | --- |
| 1 | [2.6, −12.5, 11, −9.45] | staff | staff aisle (ladder, phone, till) |
| 2 | [5.4, −12.75, 7.4, −12.5] | staff | corridor threshold |
| 3 | [5.4, −23.75, 7.4, −12.75] | corridor | corridor + the Wall; 1.3 Stall |
| 4 | [7.4, −17, 11, −12.5] | office | office (PC only reachable) |
| 5 | [2.4, −26.2, 5.2, −23.75] | backroom_rev | wall phone corner (1.3 Wiring, 1.3_call) |
| 6 | [2.4, −30, 10.4, −23.75] | backroom | backroom |
| 7 | [−9, −3.5, 1.5, 0] | entrance | doors, queue machine, chairs |
| 8 | [1.5, −9.45, 11, 0] | counter | Hero Table, tree, counter front |
| 9 | [−3.85, −14.5, 2.6, −8.6] | aisle | display wall end |
| 10 | [−3.85, −8.6, 1.5, −3.5] | aisle | aisle |
| 11 | [−9, −14.5, −3.85, −3.5] | accessories | accessories wall |
| 12 / 13 | [−17, 0, 17, 8] / [−17, 8, 17, 25] | shopfront / carpark | outside (unreachable in TWO) |

Roam scenes: **1.1** (Luka: everything inside), **1.3** (Luka in zones 1–3, Chase in 5–6; SWAP cuts between the two
cams). No drones/stealth in reddy26.

---

## 10. HOTSPOTS

`by`: who may use it (`luka`, `chase`, `any`). Examine lines are in the script (§8 1.1/1.3); this table fixes placement.

| id | Stand at (mark / point) | r | Verb | By | Scene | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `hero_table` | `s11_polish` | 1.0 | examine → Polish | luka | 1.1 until `s11_polished` | first use plays the examine line, then mini-game `polish` (anchor `hero_top`) |
| `hero_phones` | [5.6, 0, −4.45] (customer side) | 0.6 | examine | luka | 1.1 | "3%. They come out of the box tired." |
| `xmas_tree` | [8.7, 0, −1.6] | 0.8 | examine | luka | 1.1 | |
| `pot_plant` | [9.7, 0, −1.5] | 0.7 | examine | luka | 1.1 | |
| `queue_machine` | [0.2, 0, −1.9, π/2] | 0.7 | examine | luka | 1.1 | |
| `noticeboard` | [10.25, 0, −11.55, π/2] | 0.8 | examine | luka | 1.1 | anchor `noticeboard` |
| `office_door` | [9.9, 0, −11.9, π] | 0.8 | examine | luka | 1.1 | anchor `office_door_sign` |
| `wall_polaroid` | [6.0, 0, −19.55, −π/2] | 0.45 | examine | luka | 1.1 | |
| `wall_cassette` | [6.0, 0, −20.05, −π/2] | 0.45 | examine | luka | 1.1 | |
| `wall_note` | [6.0, 0, −20.45, −π/2] | 0.4 | examine | luka | 1.1 | |
| `wall_missing` | [6.0, 0, −20.95, −π/2] | 0.45 | examine | luka | 1.1 | |
| `hold_flyer` | [6.0, 0, −21.5, −π/2] | 0.45 | examine | luka | 1.1 | |
| `rue_mug` | [9.45, 0, −28.8, π/2] | 0.5 | examine | luka | 1.1 | |
| `backroom_ceiling` | [6.0, 0, −26.3] | 0.9 | examine | luka | 1.1 | anchor `ceiling_scorch` |
| `tv` | [9.3, 0, −26.2, π/2] | 0.8 | examine | luka | 1.1 | `tv_screen.show('xmas')` already on |
| `monitor` | [6.4, 0, −9.95, 0] | 0.7 | examine | luka | 1.1 | anchor `monitor_screen` |
| `laptop` | [3.95, 0, −28.95, π] | 0.6 | examine | luka | 1.1 | |
| `kettle` | `kettle` mark | 0.7 | kettle (save) | any | 1.1, 1.3 | "Put the kettle on? [YES] [NO]" |
| `chase` | actor | 1.2 | talk | luka | 1.1 | twice (hold / label conversation), then idle line |
| `jordan` | actor (ladder) | 1.2 | talk | luka | 1.1 | Jordan climbs down; `ladder` becomes usable |
| `ladder` | `s11_luka_ladder` | 0.7 | climb / hang tinsel | luka | 1.1 after Jordan is down | climb → `s11_luka_top`, `ladder.wobble()`, `tinsel_yes.set('hung')` |
| `backroom_door` | [6.4, 0, −23.2] / [6.4, 0, −24.6] | 0.8 | door | any | 1.1, 1.3 | `request()` = the nine-second spinner |
| `luke` | actor at `s13_stall_luke` | 1.2 | talk → Stall | luka | 1.3 | mini-game `stall` |
| `jbox` | `s13_wire_chase` | 0.7 | use → Wiring | chase | 1.3 | mini-game `wiring` (two halves); sets `s13_wired` → `remote_plugged` |
| `door_window` | `s13_record` | 0.6 | record | chase | 1.3 | `{ sample: 'alarm' }` (hold YES 1 s) |

---

## 11. CUTSCENE NEEDS (geometry that must exist)

| Cutscene / beat | Shots asked for | Needs |
| --- | --- | --- |
| `1.1_open` | CRANE from the sky past the Yes sign, Santa hat on the Y, limp tinsel, down to the shimmering car park, past fake snow, through the glass doors | sky colour + sun disc; fascia + `santa_hat_sign` + `tinsel_sign`; car park + `shimmer`; `snow_spray`; `door_l.hold(true)`; anchors `s11_crane_a…d` |
| `1.1_open` 2 | MID through the glass: Luka at the table, Chase at the counter with the phone, Jordan up the ladder at the Yes wall | `s11_mid_glass`; clear patch in the spray; ladder `yes_wall`; Chase at `s11_chase_phone` |
| `1.1_open` 3–23 | CLOSE glass (smudge, breath, Chase's finger), TWO-SHOT counter (hold music from the phone), WIDE, LOW Jordan on the wobbling ladder, CLOSE Luka | `hero_glass`, `hero_smudge`, `store_phone`, `s11_ladder_low`, `ladder.wobble()` |
| 1.1 PLAY | OTS from below the ladder; top-down Polish; SPOTLESS glint; wall clock 11:58 | `s11_ladder_ots`, `hero_top`, `hero_table.glint()`, `clock_floor` |
| 1.2 | LOW heroic past the glittering edge; INSERT clock; CLOSE Chase; TWO-SHOT; CLOSE Luka's reflection; WIDE locked BAM; SLOW-MO mid-air; WIDE real time (alarms, tree falls, smoke, tethers, radio keeps playing — **the radio is diegetic music: content keeps `music('radio')` playing until 1.3's synth loop**); LOW upside-down from behind the counter; CLOSE figure; MID climb over; WIDE; TWO-SHOT | `s12_heroic`, `clock_floor`, `s12_twoshot`, `hero_glass` (no real reflections: the "reflection" CLOSE is played on Luka's face looking down, lit from below by a `glint()` sweep), `floor_locked`, `blast()`, `s12_midair`, `s12_pov_upside` (needs the **showcase glass with a clear middle**), `tether_loose` |
| 1.3 setup | backroom MID; Luke seen through the door window staring at the wreck, turning | `s13_window_pov` sightline: door window → corridor → staff aisle at x 6.4 must be clear (no boxes in the corridor centre line) |
| 1.3 PLAY | corridor two-shot (Stall), door window prompt, junction box | `corridor_wide`, `door_window`, `jbox`, `remote_plugged` |
| `1.3_call` | MID trio at the wall phone; **SPLIT SCREEN** left 2026 / right 2040 (same backroom); RIGHT ECU kettle screen (reddy40); WIDE white; **WIDE · locked the store floor** (smoke, tinsel, tethers swinging slower), Luke out of the corridor, Jordan with the ladder; INSERT clock 12:04 | `wall_phone`, `split_a`/`split_b` (identical coordinates in both sets), `floor_wreck_wide`, tether decay, `clock_floor` |
| PC | WIDE locked shop floor (smoke, tinsel, Luke shouting through the open office door, Jordan alone); counter phone rings; CLOSE Jordan; INSERT HOLD; WIDE locked: ladder → Yes wall → climb → hang tinsel | `floor_wreck_wide` (office door in frame, open, Luke at `pc_luke_desk`), `store_phone.ring()`, `counter_phone`, ladder `folded` → carried → `yes_wall`, `tinsel_yes.set('half')` as he works |
| A1/B1 split right | 18:58, closed, Christmas lights on, new table in plastic, Luke in a Santa hat doing the count, phone rings; RIGHT CLOSE Luke | `a1_split_store`, `hero_wrap`, `cash_tray`, door sign CLOSED, `evening` env + fairy lights 1.3 |
| A1/B1 home | **the exact frame that ended Rue's Act One** (empty backroom, smoke curling up to the flickering tube); TOP-DOWN two men on the floor; WIDE door bangs open; CLOSE Luke | `backroom_wide` (unchanged), `smoke_backroom`, `tube.flicker()`, `floor_luka/chase`, `home_door`, `backroom_door.open` with a bang (snap 0.15 s, not the nine-second spinner) |
| B1 43–46 | WIDE later, dark shop floor: Luka with a cloth at the new table, Chase on the counter humming | `b1_night_floor`, `night` env, torch on `table_downlight`, `plastic_heap` |
| A2 montage | three held frames: polishing at 98%; Jordan up the ladder taking tinsel down, Luka holding it; the Wall with the new print | `a2_polish`, `a2_ladder`, `a2_wall`, `print4`, `tinsel_coil` |
| B1 2027 | Luka up the ladder hanging tinsel, Jordan below | `a2_ladder` (mirror), `xmas27` |
| B1 57 | MATCH CUT to 1.2 step 1 | `spotless`, `s12_heroic`, `s12_luka_admire` |

---

## 12. AMBIENCE and `update()` (allocation-free)

`ambience: { loops: ['aircon', 'fluoro'], room: 'room' }`. Diegetic music is content's: `music('radio')` (1.1–1.2,
the store radio; `store_radio.playing` follows it), alarms are content's loop `alarm` (1.2–1.3, muffled through the
backroom door). The hold music from Chase's phone is `music('hold')` or a quiet SFX bed — content.

`update(dt, ctx)` does, with preallocated temporaries only:
1. Auto-dress on `state.scene` change (also when the set is the right half of a split); env-change → interior emissives (§3.2).
2. Front doors: Rue's proximity logic + `hold` override.
3. Clocks: shared `clockMin += dt/60` → both hand pairs.
4. Tube flicker (Rue's burst formula; `off`, `flicker(n)`).
5. Fairy lights twinkle (8 Hz, `setColorAt` on the existing `instanceColor`), tinsel shimmer (material emissive), `tinsel_strand` + `tinsel_sign` sway (rotation only).
6. Store radio cone pulse; `store_phone`/`wall_phone` ring jiggle.
7. Hero Table: glint sweep; blast timeline; tethers pendulum + decay; alarm puck/beacon blink (Reduce Flashing → slow pulse).
8. Smoke instances drift/rise/wrap; shard flight during the blast only.
9. Ladder wobble; tree fall; door hinge easing (Rue); backroom door spinner (9 s).
10. Heat shimmer texture offset (`day`); traffic cars on the front road (Rue); pelicans on the rear foreshore (2, idle bob/head turn, a bill clack every 8–15 s).
11. `cust26_*` browsing (Rue's CUST loop) when visible.

---

## 13. Shared factory for `reddy40`

Leaf files may not share top-level names, so the shell is exposed through the registry:

```js
SETS.reddy26 = makeReddy('2026');          // inside 10-set-reddy26.js's IIFE
SETS.reddy26.make = makeReddy;             // used by 11-set-reddy40.js
// 11-set-reddy40.js:
SETS.reddy40 = SETS.reddy26.make('2040', EXT40);
```

`makeReddy(era, ext)` builds the shell of §2 with era-dependent palette/tints and the era's textures (`ext.paint(T, K)`
may override any shell texture before build), then calls `ext.build(K)`. **K** (the kit) exposes the Rue helpers bound to
the current Builder: `box, bb, boxR, cyl, ico, quad, label, wall, part, at, seg, P` (add a named prop), `text`, `canvasTex`,
`M` (materials), `T` (textures), `COL` (colliders), `R` (live prop refs). The returned set merges `ext.env`,
`ext.marks`, `ext.anchors`, `ext.cams`, `ext.zones` (ext zones **replace** the shell's), `ext.props`, `ext.ambience`;
`dress(state)` runs the shell dress then `ext.dress(state, K)`; `update` runs the shell update then `ext.update(dt, ctx, K)`.
`backroom_wide`, `split_a`, `split_b`, `ceiling_scorch`, all shell marks and Rue's cams are **identical** in both sets.

Shell items switched by `era` inside the factory (`'2026'` → built as in this doc; `'2040'` → as below, or left to
`ext.build`):

| Shell item | 2026 | 2040 |
| --- | --- | --- |
| Parked cars (Rue's 6) + 2 traffic cars | built (static / props) | **omitted** (reddy40 adds instanced hover-cars) |
| Neighbour signs (atlas BAKERY / PHARMACY / FOR LEASE), CUSTOMER PARKING | painted | blank grey panels |
| Fascia, office door, noticeboard, targets, posters, SIM header, calendar | 2026 textures | `ext.paint` overrides; calendar → pale rectangle on the wall |
| Hero Table family, Christmas dressing (tinsel, fairy lights, snow spray, Santa hat, A-frame poster) | built | **omitted** (tree only, as `fallen`) |
| Display wall | empty pucks + tent card | big screen + chips (ext) |
| Counter terminals / phone / showcase contents | JARVIS monitors, phone base, boxed accessories | glass SafeSense panels, no phone, chips on pillows |
| Waiting chairs | black shells | padded cream, plaque on Margaret's |
| Store radio | new, LCD lit | dusty, LCD dark ("the old counter speaker") |
| The Wall | §5.4 | Polaroid + cassette (faded), wreath over a frame at the MISSING slot, pale rectangles where the note and flyer hung |
| Scorch | P1–P3 | P1–P4 |
| Roller door | shut (0) | jammed (0.45) |
| Kettle / Rue mug / laptop / stock boxes by the backroom door | built | omitted (Des, the machine and the plant instead) |
| Interior tint / panel colour | `[0.86,0.96,1.10]`, warm-white | `[0.84,0.97,1.14]`, cool LED `#eaf4ff` |

---

## 14. Performance budget (target < 300 draw calls; this set ≈ 170 worst case)

- Static: **1** vertex-coloured mesh (everything without a texture, incl. tinsel garlands as `vc`+`tinsel` = 2) +
  ~26 textured materials merged per material (floor, asphalt, slat, fascia, yes, queue, targets, notice, sim, atlas,
  atlasLit, lineup, posters, keypad, clock ×2, wallAtlas, xmasAtlas, snow, scorch, laptop, tv, mon, phone, spin,
  shim, bay) → ≈ 30 calls.
- Props: ≈ 60 named groups, most 1–2 meshes → ≈ 90 calls; frustum culling drops the far half in any shot (keep floor,
  corridor and backroom props as separate small groups — never one giant prop group).
- Instanced: `fairy_lights` 160 (1), `glass_shards` 80 (1), `smoke_floor` 36 (1), `smoke_backroom` 20 (1),
  pelicans 2 (1), cars (Rue, merged static).
- Characters: up to 5 rigs (Luka, Chase, Chase (2040), Jordan, Luke) ≈ 30 calls; `cust26_*` only in montage states.
- **Split screens** render this set and another (1.3: reddy40; A1/B1: hq_roof). Both must be live before the split
  (`world.ensure` during the previous shot); each half sees ~⅓ of the props; keep each set's worst view < 150.
- Textures: ≤ 32 canvases, all ≤ 256 px except `office` (256×320); shared `clock`, `puff`, `scorch`.
- No allocation in `update()`; blast arrays (shard start/vel/rest, 80 × 9 floats) built once in `build()`.
