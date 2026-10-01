# SET `rue_house` — Rue's Queenslander, Scarborough (Sunday 23 December 2040)

File `src/14-set-rue-house.js` · `SETS.rue_house` · Scene **2.4 "Every Sunday"** (the only scene with Rue in it), plus
one optional **B1 montage frame** (2031, Rue's corkboard, no people). Same contract as Rue's `SETS.reddy`
(`ref/rue/05-set-reddy-optus-redcliffe-2026.js`): `{ env, build, marks, anchors, cams, zones, colliders, floor, props,
ambience, update }` plus `dress(state)` and `paths` (§12).

---

## 0. Decisions (read first)

1. **One compact lot.** Front yard, front stairs, verandah, front room and the kitchen alcove behind a fretwork arch.
   Nothing else of the house is built inside (the hallway door stays shut). The street and the foreshore reserve
   across it are filmable but **not walkable** (the front gate is closed during play; Chase (2040) leans on it from the
   outside).
2. **High-set house.** Floor of the verandah and every room is **y = 2.40**. The yard and street are y = 0. The front
   stairs are a ramp in `floor()` (14 painted treads).
3. **Rue's house is analogue.** No padded surfaces, no AR, no chip lights, no SafeSense anywhere on the lot. The 2040
   world (a padded speed hump, a hover-car, a blank street sign) stops at the fence. It is the only set with no Courtesy
   Drones and no stealth.
4. **Rue appears only here, and only while `state.scene === '2.4'`.** The B1 frame (`cork31`) shows his room with
   nobody in it. The set never spawns Rue; content does.
5. **Yes yellow (#ffd21f) is not used.** Brass is warm brass (#c9a54a), the frangipani centres are pale butter
   (#f3dc8a), the Optus Christmas card is navy and silver.
6. **`dress(state)` also applies its env preset** (instantly, via `world.env(name, 0, 'rue_house')`) unless called
   with `{ keepEnv: true }`. Auto-dress on a scene change: `'2.4' → 'knock24'`.

---

## 1. Purpose and scenes

| Beat | Story time / weather | Env preset | Dress state | What happens |
| --- | --- | --- | --- | --- |
| 2.4 opening + PLAY "Knock." | Sun 23 Dec 2040, 10:30. Hot (34 °C), bright, hazy; a low storm bank far out over the bay | `morning24` | `knock24` | Time card. Chase (with Luka following) crosses the yard, climbs the stairs, rings the brass bell. Chase (2040) stays outside the closed gate ("I'll wait here."). The Walkman plays Pudding very quietly inside |
| Cutscene `2.4_door` | same | `morning24` | `knock24` | Screen door opens; Rue in the doorway; "That's a terrible beard." … "Tea?" "…Yes, please." |
| PLAY "Rue's front room" | same, interior | `inside24` | `explore24` | Short explore while Rue makes tea: Polaroid, corkboard, Walkman, Christmas card, biscuit tin, kettle (save), brick phone on the side table (sample **Brick phone trill**) |
| Cutscene `2.4_tea` | same, interior | `inside24` | `tea24` | Three in armchairs; Chase (2040) visible at the gate through the louvres |
| Cutscene `2.4_gate` | ~11:20, the storm bank has grown and darkened | `building24` | `gate24` | Rue comes down the stairs, meets Chase (2040) at the gate, gives him the brick phone; the three walk off down the street toward the water; Rue watches from the verandah |
| B1 montage frame "2031" (optional) | a Sunday morning, 2031 | `cork31` | `cork31` | Held frame: the corkboard, Sundays ticked LADS LADS LADS; empty armchair, the brick phone on the side table |

Time card `place`: `Scarborough`. Music (content): `walkman` cue diegetic from the side table (muffled while the
player is outside), stops when Rue opens the door (content calls `walkman.play(false)` on step 1 of `2.4_door`).

Set lifetime: built under the fade at the end of 2.3 (parade). Live through 2.5's start (LRU of three), then retired.

---

## 2. Layout

### 2.1 Axes and conventions

- Metres, **Y up**. Yard/street ground **y = 0**; house floor **y = 2.40**; interior ceiling **y = 5.40**.
- **+Z = east, toward the street and Moreton Bay.** The house front faces +Z. **+X = north**, down the street toward
  the point where the street meets the water. Looking out from the verandah (+Z), screen-right is −X.
- Mark facing `ry`: the actor faces `(sin ry, cos ry)`: `0` faces +Z (out to the street), `PI` faces −Z (into the
  house), `H = PI/2` faces +X, `-H` faces −X.
- Zone/collider boxes `[x0, z0, x1, z1]`.

### 2.2 Plan (footprint x −120…+90, z −120…+600 incl. backdrop; walkable x −8.8…+8.8, z −8.85…+13.0)

```
 z (east, the bay, +Z up the page)
 600 ~~~~~~~~~~~~~~~~~~~~~ Moreton Bay (water y −2.0) ~~~~~~ storm bank cards z 300…420 ~~~~~~~~~~~~~~~
  46 ═══════ sea wall + rocks ════════════════════════════════════════════════════╗ (x 76: sea wall, water N of it)
  40   foreshore reserve (grass)  · Norfolk pines (−14,30) (2,35) (18,31) (34,36) · picnic shelter (8,30)
  24 ── kerb ─────────────────────────────────────────────────────────────────────╢ street ends at a T, x 70
  17   ROAD (z 17.15…24.0)   padded speed hump x 12          hover-car glides →  (street runs +X to the water)
  15.6 ── concrete footpath z 14.2…15.6 ──  lamp (−8,16.6)                    lamp (22,16.6)
  13.2 ┄┄┄┄┄┄┄┄ picket fence ┄┄┄┄┄┄┄┄┄┄ ╪GATE╪ ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄  letterbox (1.2, 13.45)   C40 at (−1.0, 13.9)
          garden bed                    │ x −0.55…+0.55 (hinged at −0.55, opens −Z)
  10   frangipani (−4.2, 9.0) r 2.4     │ concrete path x −0.5…+0.5
          lawn                          │                                  Hills hoist (5.6, 5.4)
   6.44 ┄┄ lattice skirt ┄┄┄┄┄┄┄┄┄┄┄ ╔═╧═╗ stair foot (newels at x ±0.65)
          (under-house, unreachable)    ║ ║ 14 treads, run 3.64, rise 2.40
   2.8 ═══ balustrade ═══════════════ ╝ ╚ ══════ balustrade ═══  (verandah edge, posts)
   0.0 VERANDAH (y 2.40)  cane chair   [screen door] bell●            (front wall z −0.15…0)
          louvres x −6.4…−1.2           door x −0.45…+0.45   small louvres x 1.0…2.5
  −0.15┌─────────────────────────────────────────────────────────────┐
       │ side table(−5.55,−0.85)  Chase chair (−2.3,−1.05)            │ sideboard + framed 2036 card
  MANTEL│ Rue chair (−5.4,−2.1)  coffee table (−3.7,−2.3)  FRONT ROOM │ (x 2.35…2.85, z −3.8…−2.0)
  (x−6.85)          Luka chair (−2.35,−3.5)    ceiling fan (−2.4,−2.4)│
  −4.85├──── FRETWORK ARCH x −5.6…−2.4 ────┤ CORKBOARD x −1.9…+0.3 │ hall door x 1.2…2.1 (shut)
       │ KITCHEN  table (−4.3,−6.7)        │▌fridge                 │ (hallway: not built)
  −8.85│ bench x −6.7…−2.05: sink(−5.5) stove(−4.4) KETTLE(−3.2) │
       └───────────────────────────────────┘
        x: −7.0 (house W)  −4  −2  0 (door/stairs/gate axis)  +3.0 (house E)  +9 (lot)
```

### 2.3 Key coordinates

| Thing | Where | Notes |
| --- | --- | --- |
| Lot | x −9…+9, z −14…+13.2 | Paling side fences 1.8 m at x ±9 |
| House body | x −7.0…+3.0, z −9.0…0.0; walls 0.15 thick; floor y 2.40; ceiling y 5.40 | Weatherboard cream, white trims; hipped red corrugated roof, eaves y 5.6, ridge point y 8.2 at (−2.0, −4.5) |
| Front wall | z −0.15…0.0 | Door opening x −0.45…+0.45 (y 2.40…4.50); louvre banks x −6.4…−3.9 and −3.7…−1.2 (sill y 3.20, head y 4.50); small bank x 1.0…2.5 |
| Screen door | hinged at x +0.45 on the verandah face (z 0.02), 0.9 × 2.1, flyscreen mesh; opens **outward** to −1.6 rad | `screen_door` |
| Front door (inner) | hinged at x −0.45, opens inward to +1.5 rad | `front_door`, open in all 2.4 states |
| **Brass bell** | bracket on the front wall at (0.95, 4.35, 0.04); bell (r 0.09, h 0.14) hangs centre (0.95, 4.12, 0.10); red cord to y 3.62 | `brass_bell`. Chase (1.80 m) reaches the cord from mark `bell` |
| Verandah | z 0…2.8, x −7.0…+3.0, floor y 2.40 (grey-blue boards) | Balustrade z 2.65…2.8 (top rail y 3.40) along the front except the stair gap x −0.65…+0.65, and along both ends x −7.0 / +3.0 |
| Verandah posts | x −6.92, −4.70, −2.45, −0.72, +0.72, +2.92 at z 2.72, y 2.40…4.70 (spaced so the louvre→gate sight lines miss them, §9) | Fretwork brackets at the tops; bullnose iron roof from y 5.10 at z 0 down to 4.55 at z 3.0 |
| Verandah dressing | cane chair + side table (−5.6, 2.40, 1.2); fern baskets (−4.5, 4.3, 2.4), (2.1, 4.3, 2.4); two pot plants by the door | static |
| **Front stairs** | x −0.6…+0.6, top z 2.8 (y 2.40) → foot z 6.44 (y 0); 14 treads, run 0.26, rise 0.1714 | Handrails at x ±0.65, top y = tread + 0.9; newels at top (z 2.8, to y 3.50) and foot (z 6.44, to y 1.1) |
| Under-house | stumps 0.2 sq on a 2.5 m grid, lattice skirt (alpha-cut diamond) at z 2.75 and the sides | Dark behind the lattice; unreachable |
| Path | concrete x −0.5…+0.5, z 6.44…13.2 | |
| **Frangipani** | trunk (−4.2, 0, 9.0); four grey limbs; canopy y 2.0…4.2, r 2.4; 40 blossoms; 12 fallen blossoms on the lawn | `frangipani` |
| Hills hoist | pole (5.6, 0, 5.4), arms r 2.1 at y 1.9; three tea towels | `hills_hoist` |
| Side gates (paling, shut) | z 2.3: x −9.0…−7.0 and +3.0…+9.0 | Close the side yards |
| Front fence | white pickets 1.0 m at z 13.2 (x −9…−0.55 and +0.55…+9); gate posts with caps | |
| **Front gate** | picket gate x −0.55…+0.55, hinged at x −0.55, opens inward (−Z) to +1.5 rad | `gate`, closed except in `gate24` when content opens it |
| Letterbox | old milk-can letterbox on a post (1.2, 0, 13.45), outside the fence | |
| Street | grass verge z 13.2…14.2, footpath z 14.2…15.6, verge 15.6…17.0, kerb z 17.0, road z 17.15…24.0 (x −80…+70) | Street lamps (−8, 0, 16.6), (22, 0, 16.6), (46, 0, 16.6); a **padded speed hump** (cream foam) across the road at x 12 |
| Street end | road meets the Esplanade at a T at x 70; grass x 70…76; sea wall at x 76 | "Down the street toward the water" = +X |
| Foreshore reserve | across the road: grass z 24…46, Norfolk pines (−14, 30), (2, 35), (18, 31), (34, 36); picnic shelter (8, 0, 30) | Not walkable |
| Sea wall / water | rock wall at z 46 (x < 76) and x 76 (z < 46); water plane y −2.0 | |
| Neighbours | low-set and high-set houses (instanced shells) centred x −24, −42, +22, +40, +58 at z −4 | Seen in wides only |

**Interior**

| Thing | Where | Notes |
| --- | --- | --- |
| Front room | x −6.85…+2.85, z −4.85…−0.15 (9.7 × 4.7) | VJ walls (pale sage cream), hoop-pine floor, white ceiling |
| Mantel (disused fireplace) | left wall, surround x −6.85…−6.55, z −3.4…−1.6, shelf top y 3.60 (shelf x −6.85…−6.60) | Items: **Polaroid copy** frame (−6.72, 3.60, −2.30), mantel clock (−6.72, 3.60, −2.80), candle, a dish |
| **Rue's armchair** | (−5.40, 2.40, −2.10), ry 1.32 (faces +X, slightly toward the louvres) | Faded floral, crocheted rug over the back |
| **Side table** | x −5.78…−5.33, z −1.25…−0.45, top y 3.00 | **Walkman** (−5.55, 3.00, −1.08); **brick phone** (−5.55, 3.00, −0.62); reading lamp (−5.70, 3.00, −0.52) |
| Coffee table | oval 1.0 × 0.6 at (−3.70, 2.40, −2.30), top y 2.82; rug beneath (2.4 × 1.8) | **Biscuit tin** (−3.50, 2.82, −2.25); tea set in `tea24` |
| Luka's armchair | (−2.35, 2.40, −3.50), ry −1.00 | sage |
| Chase's armchair | (−2.30, 2.40, −1.05), ry −2.10 | rust (not yellow) |
| Sideboard | right wall x 2.35…2.85, z −3.8…−2.0, top y 3.25 | **Framed Optus Christmas card 2036**, standing, (2.62, 3.25, −2.90) facing −X; a lamp; a stack of cassettes; a bowl |
| **Corkboard** | back wall (front face z −4.84), x −1.9…+0.3, y 3.30…4.50 | `corkboard`, 256 × 128 repaintable texture |
| Hallway door | back wall x 1.2…2.1, shut | |
| Fretwork arch | back wall opening x −5.6…−2.4, y 2.40…4.60; fretwork panel y 4.60…5.40 (alpha-cut) | |
| Ceiling fan | (−2.4, 5.25, −2.4), blades r 0.65 | `ceiling_fan` |
| Standard lamp | (−6.4, 2.40, −4.4) | static |
| Kitchen | x −6.85…−1.35, z −8.85…−4.85; partition wall x −1.50…−1.35 (z −8.85…−4.85) | |
| Kitchen bench | x −6.70…−2.05, z −8.85…−8.25, top y 3.30 | sink x −5.5, stove x −4.4, **kettle** (−3.20, 3.30, −8.50), tea tray (−4.60, 3.30, −8.50) in `knock24/explore24`, a **Rue mug** ("I'm on mugs") by the kettle |
| Fridge | x −2.0…−1.5, z −8.85…−8.15, y 2.40…4.10 | retro, cream |
| Kitchen window | louvres x −6.0…−3.6 in the back wall (z −8.95), sill y 3.45 | backyard card: a mango tree, the neighbour's roof |
| Kitchen table | round r 0.45 at (−4.30, 2.40, −6.70), two chairs | |

### 2.4 Far groups (`fog: false`, `MeshBasicMaterial`)

| Piece | Where |
| --- | --- |
| Horizon band (open cylinder) | r 460 centred (0, 0, 0), y −2…+55. East arc (+Z): open bay, **Moreton Island** as a long low pale dune line on the horizon (z 400+, x −160…+200). North arc (+X): the bay curving round past the point. West/south arcs: the peninsula's roofs and trees, low hills |
| Band skirt | same cylinder y −80…−2, colour = live fog colour every frame |
| Sun disc r 8 + halo r 24 | per env direction at 420 m |
| Cumulus | 6 cards 280–440 m out, y 60–150 |
| **Storm bank** | 6 dark anvil cards over the bay at x −200…+200, z 300…420, y 30…160 (`storm_bank.build(u)`: u 0 low and grey-white, 1 tall, bruise-green-grey with a lighter rim) |

### 2.5 Colliders

```
house + verandah shell (blocks the under-house from the yard):
  lattice front       [-7.0, 2.70, -0.65, 2.85]   [0.65, 2.70, 3.0, 2.85]
  stair sides         [-0.75, 2.80, -0.62, 6.44]  [0.62, 2.80, 0.75, 6.44]
  side gates          [-9.0, 2.20, -7.0, 2.40]    [3.0, 2.20, 9.0, 2.40]
  lot fences          [-9.2, -14, -9.0, 13.3]     [9.0, -14, 9.2, 13.3]
  front fence         [-9.0, 13.15, -0.55, 13.30] [0.55, 13.15, 9.0, 13.30]
  gate (dynamic)      [-0.55, 13.15, 0.55, 13.30] → parked at 1e4 while gate.open(u) > 0.5
verandah (y 2.40):
  balustrade          [-7.0, 2.65, -0.65, 2.85]   [0.65, 2.65, 3.0, 2.85]
  ends                [-7.15, 0, -7.0, 2.85]      [3.0, 0, 3.15, 2.85]
  front wall          [-7.0, -0.15, -0.45, 0.0]   [0.45, -0.15, 3.0, 0.0]
  cane chair + table  [-6.1, 0.8, -5.1, 1.6]
interior:
  side walls          [-7.0, -9.0, -6.85, 0.0]    [2.85, -9.0, 3.0, 0.0]
  back wall           [-7.0, -9.0, 3.0, -8.85]
  front-room back wall[-6.85, -5.0, -5.6, -4.85]  [-2.4, -5.0, 2.85, -4.85]   (arch gap x −5.6…−2.4)
  kitchen partition   [-1.50, -8.85, -1.35, -5.0]
  mantel              [-6.85, -3.4, -6.55, -1.6]
  Rue chair           [-5.85, -2.55, -4.95, -1.65]
  side table          [-5.78, -1.25, -5.33, -0.45]
  coffee table        [-4.20, -2.60, -3.20, -2.00]
  Luka chair          [-2.80, -3.95, -1.90, -3.05]
  Chase chair         [-2.75, -1.50, -1.85, -0.60]
  sideboard           [2.35, -3.8, 2.85, -2.0]
  standard lamp       [-6.55, -4.6, -6.25, -4.25]
  kitchen bench+fridge[-6.85, -8.85, -1.35, -8.15]
  kitchen table       [-4.75, -7.15, -3.85, -6.25]
yard objects:
  frangipani trunk    [-4.45, 8.75, -3.95, 9.25]
  Hills hoist pole    [5.5, 5.3, 5.7, 5.5]
  garden beds (low, along the fence) [-8.8, 12.4, -1.0, 13.15] [1.0, 12.4, 8.8, 13.15]
```

`floor(x, z)` (branches only):

```js
function floor(x, z) {
  if (x > -7.0 && x < 3.0 && z > -9.0 && z <= 2.8) return 2.40;                 // house + verandah
  if (x > -0.62 && x < 0.62 && z > 2.8 && z < 6.44) return 2.40 * (6.44 - z) / 3.64;   // the stairs (ramp)
  return 0;
}
```

---

## 3. Look

### 3.1 Palette (spec §14, 2040 day, but Rue's lot is warm and old)

| Use | Hex |
| --- | --- |
| Sky (morning24) / (building24) | `#8fcff6` / `#7fa9c4` |
| Weatherboards / trims | cream `#f1e7cf` / white `#f6f4ee` |
| Roof iron (faded heritage red) / verandah roof underside | `#9b3b2e` / `#e9e2d2` |
| Verandah boards | grey-blue `#7d8c94` |
| Lattice / stumps | white `#eeeeea` / grey timber `#8f8a80` |
| Lawn (dry December) / garden | `#90b25c` / `#5f8a3c` |
| Frangipani bark / leaves / flowers / centres | `#9a9488` / `#2f6a35` / `#fbf8f0` / `#f3dc8a` |
| Hibiscus | `#d8323a` |
| Interior VJ walls / ceiling / floor | `#dfe6cf` / `#f4f2ec` / hoop pine `#b98a55` |
| Fretwork / furniture timber | dark stain `#5a3a24` |
| Armchairs | Rue: faded rose floral `#c98f86`; Luka: sage `#9fb08f`; Chase: rust `#b86b4b` |
| Brass (bell, door handle) | `#c9a54a` |
| Cork | `#c69a62`, calendar pages `#fbfaf4`, ticks red `#c8302c`, LADS in blue biro `#2a3f8f` |
| Water near / far | `#5fb7d4` / `#3d8fb8` |
| Storm bank | `#5d6a66` → rim `#c9d2cc` |
| 2040 street accents (only past the fence) | padded cream `#efe6d0`, glassy `#bfe6ff` |

### 3.2 Materials

- `M.vc` — vertex-coloured Lambert for all plain static geometry (one draw call). Three bake tints: **OUT** (warm
  sun, ×1.0), **SHADE** (under the verandah roof, ×0.86, slightly blue), **IN** (interior, ×0.80, warm).
- `M.atlas` — 256 × 256 label/small-art atlas (nearest), 8 rows × 32 px plus a 128 × 128 corner for small faces:
  Polaroid face, cassette label, Christmas card front, biscuit-tin lid, brick-phone keypad + LCD, mantel clock face,
  bay print, letterbox number, kitchen-window backyard card.
- `M.alpha` — Lambert with `alphaTest 0.5`, one 128 × 128 atlas of alpha-cut patterns: dowel balustrade, diamond
  lattice, fretwork, frangipani leaf cluster, flyscreen mesh. (Cut-outs, not blended: no sorting, see-through.)
- `M.cork` — the corkboard's own repaintable 256 × 128 texture (`key: 'rue_house_cork'`).
- `M.glass` — Basic transparent 0.25 (louvre slats, kitchen-window glass).
- `M.glow` — emissive (lamp shades, the LCD of the brick phone when tested, street lamps): one material, unique key.
- `M.water`, `M.sky*` (Basic `fog: false` for band, skirt, sun, clouds, storm bank).
- No vertex snapping, no affine warping, no wobble.

### 3.3 Textures to paint (128–256 px, nearest; **text must read at the named anchor**)

| Texture | Size | Content (readable text in **bold**) | Read at |
| --- | --- | --- | --- |
| `t_cork` (2040) | 256 × 128 | cork ground; 15 columns (2026 … 2040) of overlapping month pages, 12 per column, pinned. Every Sunday cell from **Nov 2026 to 17 Dec 2034** has a red tick and a tiny blue **LADS**; Sun 24 and Sun 31 Dec 2034 are **blank**; every page from Jan 2035 to Dec 2040 is clean and blank. The last column (2040) is only half pinned (pages up to December) | `corkboard` (whole), `corkboard_end` (Dec 2034 → blank). Content's INSERT CARD `rue_corkboard` paints the close-up at 2× with the same layout |
| `t_cork` (2031) | same canvas, repainted | columns 2026 … 2031 only; every Sunday ticked **LADS**; December 2031 the newest page, on top | `b1_cork31` |
| `t_polaroid` | 64 × 80 cell | white Polaroid border, a soft blurred image: two figures in polos and a young man, never resolving; biro on the bottom border: **'87** | `polaroid_copy` (CARD `polaroid_1987` overlays for the INSERT) |
| `t_cassette` | 64 × 32 cell | the Walkman's window: a clear cassette with a white label in biro: **PUDDING (COPY 4)** | `walkman` |
| `t_xmas2036` | 64 × 80 cell | navy card in a thin silver frame: a silver hand-drawn **Yes** (silver, not yellow), a small star, **Season's Greetings 2036**, below in a looping hand **— The Board** | `xmas_card_2036` |
| `t_tin` | 64 × 64 cell | red lid with a painted rosella on a branch and **ASSORTED** in cream serif (generic, no brand) | `bic_tin` |
| `t_brick` | 64 × 32 cell | 1987 brick phone face: dark grey, 15 rubbery keys, a red **TEST** key, a tiny green LCD (blank / **LINE OK** when tested) | `brick_phone_table` |
| `t_clock` | 32 × 32 cell | mantel clock face, hands painted at 10:30 (the hands are separate meshes) | mantel |
| `t_bayprint` | 64 × 48 cell | framed watercolour of the bay and the jetty | room wides |
| `t_backyard` | 128 × 64 cell | backyard through the kitchen louvres: mango tree, a shed, the neighbour's red roof | kitchen cam |
| `t_vj` | 64 × 64 | vertical-joint boards (walls), tile 0.6 m | interior |
| `t_boards` | 64 × 64 | hoop-pine floorboards; verandah variant tinted grey-blue | floors |
| `t_iron` | 64 × 64 | corrugated iron stripes (roof) | roofs |
| `t_weatherboard` | 64 × 64 | horizontal weatherboards | exterior walls |
| `t_alpha` | 128 × 128 | four alpha cells: dowel balustrade, diamond lattice, fretwork (scrolls and a sunburst), frangipani leaf cluster; plus flyscreen | see §3.2 |
| `t_grass`, `t_path` | 64 × 64 | noise tiles | yard |
| `t_ripple` | 128 × 128 | two blues | bay |
| `t_band` | 256 × 64, repeat ×4 | alpha silhouettes: Moreton Island dunes (east), roofs/trees (west) | horizon |
| `t_cloud`, `t_storm` | 128 × 64 / 128 × 128 | cumulus / anvil with a pale rim | sky |
| `t_louvrelight` | 64 × 32 | soft-edged bright stripes (additive) | floor light under the louvres |

INSERTs that are CARDS (content paints at 2×; the set provides the matching in-world art and anchor): the corkboard
close-up, the Polaroid, the cassette label. Everything else in §6 is an in-world close-up.

### 3.4 Lighting rig (hemi + dir + one spot) and fog

Every preset defines `spot` (intensity 0 when unused), because `envFill` keeps the previous spot when a preset omits it.
No preset name contains "rain".

```js
env: {
  morning24:  { bg: 0x8fcff6, fog: [0xd6e8ee, 0.0060], hemi: [0xf0f6ff, 0xb39a70, 1.05], dir: [0xfff4e2, 1.70, [8, 18, 12]], spot: [0xffffff, 0],   rain: 0 },
  inside24:   { bg: 0x8fcff6, fog: [0xd6e8ee, 0.0060], hemi: [0xfff2e0, 0x8a7458, 0.95], dir: [0xffe8c8, 0.95, [4, 10, 12]],  spot: [0xffe2b0, 1.4], rain: 0 },
  building24: { bg: 0x7fa9c4, fog: [0xb8c6c4, 0.0068], hemi: [0xdfe8ee, 0x8c8a72, 0.95], dir: [0xfff0d8, 1.30, [6, 14, 10]],  spot: [0xffffff, 0],   rain: 0 },
  cork31:     { bg: 0x9fd4f4, fog: [0xd9eaf0, 0.0058], hemi: [0xfff4e4, 0x8a7458, 0.95], dir: [0xffe8c8, 0.90, [4, 10, 12]],  spot: [0xfff0d0, 1.6], rain: 0 },
}
```

**Spot placement** (the set writes `world.torch` position/target itself and sets `world.torchAuto = false` while a
lamp state is on; see §12 engine notes):

| Preset | Position → target | angle / penumbra / distance | Purpose |
| --- | --- | --- | --- |
| `inside24` | (−3.8, 6.6, 3.6) → (−3.6, 2.4, −2.6) | 0.40 / 0.75 / 14 | the late-morning sunbeam through the louvres onto the three armchairs and the coffee table |
| `cork31` | (−0.8, 5.2, −2.6) → (−0.8, 3.9, −4.8) | 0.35 / 0.6 / 6 | a pool of light on the corkboard |
| `morning24`, `building24` | intensity 0 | | |

Interior readability comes from the **IN** bake tint plus `t_louvrelight` stripes on the floor under each louvre bank
(additive quads, opacity 0.35 in `inside24`, 0.15 in `building24`, 0 at night). Sun disc direction (unit, ×420 m):
`morning24` (0.30, 0.78, 0.55) · `building24` (0.32, 0.70, 0.62), dimmed halo · `cork31` (0.35, 0.60, 0.72).

**Fog:** FogExp2 0.006 hides the far street and the bay beyond ≈ 300 m; the band (fog: false) carries the horizon.

---

## 4. Props

Content reaches them with `world.prop(name)`; animated ones expose `userData` functions; all animation runs in
`update()`.

| id | Description | Scenes | States / animation (`userData`) |
| --- | --- | --- | --- |
| `screen_door` | flyscreen door on the verandah face, hinged at x +0.45 | 2.4 | `open(u)` 0 shut … 1 open (−1.6 rad), eases 0.5 s; small bang-shut bounce when u → 0 |
| `front_door` | inner timber door with a glass panel | 2.4, B1 | `open(u)` (open 1 in all 2.4 states, 0 in `cork31`) |
| `brass_bell` | small brass ship's bell on a bracket, red cord | 2.4 | `ring()` → damped swing (0.5 rad, 2.2 Hz, decays in 1.5 s); fires sfx `bell_brass` on the first two swing peaks (rate-limited) |
| `gate` | picket gate | 2.4 | `open(u)` 0…1 (+1.5 rad inward), eases 0.6 s; collider follows (§2.5) |
| `walkman` | grey-blue cassette Walkman with a tiny speaker grille, on the side table | 2.4, B1 | `play(on)`: spools rotate (2 rad/s), red LED on; the label `PUDDING (COPY 4)` reads through the window |
| `brick_phone` | the 1987 brick phone lying on the side table | 2.4 (explore, tea), B1 | `show(bool)`; `test()` → the TEST key depresses, the LCD lights **LINE OK** for 2 s (sfx `brick` trill is the sample's) |
| `polaroid_copy` | small standing frame on the mantel | 2.4 | static |
| `corkboard` | the corkboard of calendar pages | 2.4, B1 | `paint('2040' \| '2031')` repaints `t_cork` once |
| `xmas_card_2036` | standing frame on the sideboard | 2.4 | static |
| `bic_tin` | biscuit tin on the coffee table | 2.4 | `open(bool)`: lid lifts and leans against the tin (0.4 s) |
| `kettle_rue` | old stainless electric kettle on the kitchen bench | 2.4 | `boil(on)`: steam puffs every 0.6 s, rumble; `click()` ends it. Save puff via `world.puff('kettle_rue', {…})` |
| `tea_tray` | tray with teapot, three cups, milk jug, on the kitchen bench | 2.4 | visible in `knock24`, `explore24` |
| `tea_set` | the same set laid on the coffee table, cups half full | 2.4 | visible in `tea24`, `gate24` |
| `rue_mug` | "I'm on mugs" mug by the kettle | 2.4 | static |
| `mantel_clock` | clock with hands | 2.4, B1 | hands from scene time (10:30 → advances 1:1 with `ctx.t`); `cork31` shows 9:55 |
| `ceiling_fan` | four wooden blades | 2.4, B1 | rotates 3.2 rad/s in every state |
| `frangipani` | the tree (trunk static, canopy group) + 40 blossoms (IM) + 12 fallen (IM) | 2.4 | canopy sways ±0.015 rad at 0.4 Hz; `drop()` lets one blossom fall (content, optional) |
| `hills_hoist` | rotary clothes line with three tea towels | 2.4 | rotates 0.12 rad/s ± gusts; towels flap (scale.z sine) |
| `lorikeets` | 2 rainbow lorikeets (IM bodies + wings) | 2.4 exterior | cross the yard on a curve every 22–30 s (2.6 s flight), chatter sfx `lorikeet` |
| `hovercar_street` | one white 2040 hover-car (same proportions as parade's: 4.2 m, rounded, no wheels, blue under-glow) | 2.4 | glides x −80 → +70 along z 21.5 at 6 m/s every ~45 s; slows over the padded hump; `pass()` triggers one now; `off()` |
| `storm_bank` | the anvil cards over the bay | 2.4 | `build(u)` target 0…1; eases at 0.02/s; `flicker(on)` faint inner lightning (default off; Reduce Flashing → slow dim pulse) |
| `louvre_light` | additive stripe quads on the floor | 2.4 | opacity by env (§3.4) |
| `water`, `band`, `band_skirt`, `sun`, `clouds` | backdrop | all | ripple scroll; skirt colour = fog colour |

**Instanced repeats**

| Repeat | Count | Mesh |
| --- | --- | --- |
| Verandah posts | 6 | 1 IM |
| Stair treads | 14 | merged into `M.vc` (static) |
| Pickets (front fence) | 140 | 1 IM |
| House stumps | 20 | 1 IM |
| Frangipani blossoms (on tree / fallen) | 40 / 12 | 2 IM |
| Lawn tufts | 160 | 1 IM |
| Hibiscus flowers | 30 | 1 IM |
| Neighbour houses | 5 | 2 IM (walls, roofs) |
| Norfolk pine tiers | 4 trees × 6 tiers | 1 IM |
| Sea-wall rocks | 50 | 1 IM |
| Street lamps | 3 | 1 IM (+ heads in `M.glow`) |
| Lorikeets | 2 bodies / 4 wings | 2 IM |

The armchairs, tables, mantel, sideboard and all static dressing merge into `M.vc` / `M.atlas` (they are never moved).

---

## 5. Marks (`[x, y, z, ry]`, world)

Seated marks keep the floor y (2.40); the sit anim supplies the seat height (armchairs 0.45).

**General**

| id | value | use |
| --- | --- | --- |
| `bell` | [0.95, 2.40, 0.72, PI] | in front of the bell, reaching up to the cord |
| `kettle` | [−3.20, 2.40, −7.75, PI] | at the bench facing the kettle (save) |
| `gate_in` | [0.0, 0, 12.5, 0] | inside the gate, facing out |
| `gate_out` | [0.0, 0, 14.0, PI] | outside the gate, facing the house |
| `stair_foot` | [0.0, 0, 7.0, PI] | |
| `stair_top` | [0.0, 2.40, 2.4, PI] | |

**2.4 — PLAY "Knock." and `2.4_door`**

| id | value | step |
| --- | --- | --- |
| `s24_start_chase` | [0.15, 0, 11.6, PI] | control starts here (inside the gate, facing the house) |
| `s24_start_luka` | [−0.75, 0, 12.4, PI] | follower start |
| `s24_c40_gate` | [−1.00, 0, 13.90, PI] | Chase (2040) outside the fence, leaning on the left gatepost, facing the house. Stays here through the explore and tea (seen through the louvres) |
| `s24_chase_door` | [0.30, 2.40, 1.15, PI] | Chase steps back from the bell to face the door |
| `s24_luka_door` | [−0.75, 2.40, 1.55, 2.75] | Luka behind him, half-turned |
| `s24_rue_door` | [0.00, 2.40, −0.30, 0] | Rue in the doorway (spawned inside, screen door opens in front of him) |

**2.4 — PLAY "Rue's front room"**

| id | value | step |
| --- | --- | --- |
| `s24_in_chase` | [0.10, 2.40, −1.35, −2.36] | control after `2.4_door` (just inside the door) |
| `s24_in_luka` | [0.85, 2.40, −1.00, −2.20] | follower |
| `s24_rue_kettle` | [−3.20, 2.40, −7.75, PI] | Rue at the kettle |
| `s24_rue_side` | [−4.85, 2.40, −0.85, −H] | Rue setting the brick phone down on the side table |
| `s24_rue_arch` | [−4.00, 2.40, −4.60, 0.25] | Rue in the arch, watching them look round |
| `s24_rue_tray` | [−3.70, 2.40, −1.65, PI] | Rue setting the tea set on the coffee table |
| `s24_look_polaroid` | [−6.05, 2.40, −2.30, −H] | stand to examine the mantel |
| `s24_look_cork` | [−0.80, 2.40, −3.90, PI] | stand to examine the corkboard |
| `s24_look_walkman` | [−4.75, 2.40, −1.15, −H] | |
| `s24_look_brick` | [−4.75, 2.40, −0.55, −H] | also the Brick phone sample spot |
| `s24_look_card` | [2.00, 2.40, −2.90, H] | |
| `s24_look_tin` | [−3.70, 2.40, −1.55, PI] | |

Rue's pottering route (content walks him slowly, `speed 0.8`): `s24_rue_kettle` → `s24_rue_side` (sets the phone
down; `brick_phone.show(true)`) → `s24_rue_arch` → `s24_rue_kettle` …, waiting 6–10 s at each.

**2.4 — `2.4_tea`**

| id | value | |
| --- | --- | --- |
| `s24_seat_rue` | [−5.40, 2.40, −2.10, 1.32] | Rue's armchair (faces the boys, louvres to his right) |
| `s24_seat_luka` | [−2.35, 2.40, −3.50, −1.00] | |
| `s24_seat_chase` | [−2.30, 2.40, −1.05, −2.10] | |

**2.4 — `2.4_gate`**

| id | value | step |
| --- | --- | --- |
| `s24_rue_stair_top` | [−0.35, 2.40, 2.60, 0] | step 1 start (left hand on the left rail, x −0.65) |
| `s24_rue_stair_foot` | [−0.35, 0, 6.75, 0] | step 1 end |
| `s24_rue_gate` | [−0.15, 0, 12.55, 0] | Rue at the closed gate (steps 2–13) |
| `s24_c40_gate_face` | [−0.15, 0, 13.95, PI] | Chase (2040) steps in front of the gate, the gate between them |
| `s24_luka_yard` | [−1.90, 0, 11.40, 0.50] | Luka hangs back in the yard |
| `s24_chase_yard` | [1.50, 0, 11.30, −0.55] | Chase hangs back |
| `s24_walk_wp` | [1.00, 0, 14.90, H] | through the gate, turn right (+X) |
| `s24_walk_luka`, `s24_walk_chase`, `s24_walk_c40` | [26.0, 0, 14.7, H], [25.2, 0, 15.3, H], [27.0, 0, 15.0, H] | where they have got to when step 14 cuts in; content keeps them walking +X (to x 60) |
| `s24_rue_watch` | [−0.95, 2.40, 2.45, 0.85] | step 14–15: Rue at the verandah edge by the left stair post, left hand on the balustrade rail |

---

## 6. Anchors (`{ at, from, fov }`, world)

| id | at | from | fov | for |
| --- | --- | --- | --- | --- |
| `house_wide` | [−1.6, 3.4, 1.0] | [7.4, 1.65, 20.8] | 44 | scene open: from across the road — fence, gate, frangipani, stairs, verandah, roof |
| `bell` | [0.95, 4.12, 0.10] | [0.70, 4.02, 0.92] | 30 | INSERT the brass bell (Chase's hand on the cord) |
| `s24_door_mid` | [0.00, 3.95, −0.25] | [0.62, 3.88, 2.35] | 40 | `2.4_door` 1: MID, the screen door opens, Rue in the doorway |
| `s24_door_rev` | [−0.25, 3.95, 1.40] | [0.15, 4.00, −0.45] | 44 | reverse: Rue's view of Chase and Luka (lens just inside the door) |
| `polaroid_copy` | [−6.72, 3.70, −2.30] | [−6.05, 3.80, −2.25] | 26 | examine (CARD overlays) |
| `corkboard` | [−0.80, 3.90, −4.83] | [−0.80, 3.88, −3.20] | 46 | examine: the whole board |
| `corkboard_end` | [0.05, 3.55, −4.83] | [−0.15, 3.65, −4.15] | 28 | "…Every Sunday." the last ticked page (Dec 2034) and the blank ones after |
| `walkman` | [−5.55, 3.04, −1.08] | [−5.05, 3.40, −0.80] | 24 | cassette label PUDDING (COPY 4) |
| `brick_phone_table` | [−5.55, 3.04, −0.62] | [−5.05, 3.42, −0.30] | 24 | examine + TEST key (sample); `2.4_tea` 16 "nodding at the brick phone" |
| `xmas_card_2036` | [2.62, 3.42, −2.90] | [1.80, 3.50, −2.85] | 28 | examine |
| `bic_tin` | [−3.50, 2.90, −2.25] | [−3.05, 3.52, −1.62] | 30 | examine; `2.4_tea` 6 "reaching for the tin" |
| `kettle_rue` | [−3.20, 3.42, −8.50] | [−3.05, 3.78, −7.55] | 30 | save |
| `s24_explore_room` | [−3.5, 3.0, −3.0] | [2.4, 4.9, −0.5] | 56 | establishing the front room (Rue slow in the arch) |
| `s24_tea_wide` | [−3.6, 3.25, −0.5] | [−3.0, 4.25, −4.55] | 56 | `2.4_tea` master: from the arch toward the louvres — Rue left, Luka's back, Chase right, **the louvres behind them with Chase (2040) small at the gate** |
| `s24_tea_rue` | [−5.40, 3.55, −2.10] | [−2.60, 3.65, −2.00] | 40 | over the boys toward Rue, mantel behind him |
| `s24_twoshot_boys` | [−2.30, 3.45, −2.30] | [−4.75, 3.62, −2.05] | 40 | `2.4_tea` 7 TWO-SHOT: Luka and Chase look at each other (from beside Rue's chair) |
| `s24_rue_to_luka` | [−5.40, 3.55, −2.10] | [−3.10, 3.60, −3.20] | 34 | `2.4_tea` 17 CLOSE Rue, to Luka (Luka's eyeline) |
| `s24_louvre_pov` | [−1.00, 1.55, 13.90] | [−5.25, 3.55, −1.95] | 30 | `2.4_tea` 11 POV: Rue looks through the louvres at the man at his gate |
| `s24_yard_wide` | [−0.3, 1.6, 8.6] | [7.4, 2.3, 12.2] | 52 | `2.4_gate` 1 WIDE: Rue coming down the stairs (hand on the rail), Chase (2040) at the gate, frangipani between |
| `s24_gate_two` | [−0.15, 1.45, 13.25] | [2.6, 1.6, 11.2] | 40 | the two of them at the gate, gate between them (steps 2–6) |
| `s24_hands` | [−0.15, 1.12, 13.25] | [0.75, 1.40, 12.55] | 28 | step 8 INSERT: the brick phone into the scarred hand, fingers closed over it |
| `s24_verandah_wide` | [18.0, 0.9, 17.0] | [−3.6, 4.35, 2.15] | 46 | step 14 WIDE from the verandah: Rue's shoulder in the right foreground, the yard, the gate, the three on the footpath walking +X, the street running to the water, the storm bank over the bay |
| `s24_storm` | [60, 50, 420] | [0.2, 1.7, 13.6] | 40 | cutaway: the storm building over the bay |
| `b1_cork31` | [−0.95, 3.95, −4.83] | [−0.85, 3.90, −3.85] | 34 | B1 2031 frame: ticks, LADS LADS LADS |
| `b1_room31` | [−4.6, 3.0, −1.6] | [−1.2, 3.9, −4.3] | 46 | optional alt 2031 frame: the empty armchair, the brick phone on the side table, sunbeam |

---

## 7. Gameplay zones and fixed cameras

No stealth on this set. Exterior cams sit high on the street side and on the verandah; interior cams sit just under the
3 m ceiling in opposite corners (Rue's house is small and warm: wide lenses, high corners).

```js
cams: {
  yard:       { type: 'pan',   pos: [-8.2, 3.4, 14.6],  base: [0.4, 1.4, 6.0],   look: 'player', fov: 52, limit: 0.50 },  // first = default
  stairs:     { type: 'fixed', pos: [1.6, 1.0, 9.0],    look: [-0.1, 3.3, 2.0],  fov: 48 },   // low, looking up the steps to the door
  verandah:   { type: 'fixed', pos: [-6.6, 4.6, 2.55],  look: [0.6, 3.3, 0.6],   fov: 50 },   // verandah W end: door, bell, stair top
  street:     { type: 'pan',   pos: [7.5, 2.4, 22.0],   base: [0.0, 1.2, 13.5],  look: 'player', fov: 46, limit: 0.50 },  // filmable only
  room_left:  { type: 'fixed', pos: [2.55, 5.05, -0.45], look: [-4.6, 2.6, -3.6], fov: 56 },  // mantel, Rue's chair, the arch
  room_right: { type: 'fixed', pos: [-6.50, 5.05, -0.45], look: [1.4, 2.7, -4.2], fov: 56 },  // corkboard, sideboard, hall door
  kitchen:    { type: 'fixed', pos: [-1.65, 5.00, -5.15], look: [-5.2, 2.9, -8.3], fov: 58 }, // bench, kettle, the window
},
zones: [   // first match wins; tiles every walkable and filmable area
  { box: [-0.65, 2.80, 0.65, 6.44],   cam: 'stairs' },
  { box: [-7.00, -0.15, 3.00, 2.80],  cam: 'verandah' },      // incl. the threshold
  { box: [-6.85, -8.85, -1.35, -4.85], cam: 'kitchen' },
  { box: [-6.85, -4.85, -2.60, -0.15], cam: 'room_left' },
  { box: [-2.60, -4.85, 2.85, -0.15],  cam: 'room_right' },
  { box: [-8.80, 2.30, 8.80, 13.20],  cam: 'yard' },          // front yard + the strips beside the stairs
  { box: [-12.0, 13.20, 12.0, 24.0],  cam: 'street' },        // footpath + road (cutscene framing only)
],
```

Foreground framing: `yard` has the frangipani canopy in its top-left (intended); `room_right` looks past Rue's side
table lamp in the lower-left. No other lens has geometry within 1.5 m.

---

## 8. Hotspots

`who`: C = Chase (playable), L = Luka, any = active. Lines are the script's; this table fixes place, radius and verb.

| id | at | r | verb | who / `by` | scene | does |
| --- | --- | --- | --- | --- | --- | --- |
| `h24_c40` | actor `chase40` (at `s24_c40_gate`) | 1.6 | Talk | any; `by: 'chase40'` | 2.4 Knock | CHASE (2040): "I'll wait here." (the first time and every time) |
| `h24_bell` | [0.95, 2.40, 0.40] (mark `bell`) | 0.9 | Ring | `only: 'chase'` | 2.4 Knock | `brass_bell.ring()` → cutscene `2.4_door` |
| `h24_polaroid` | [−6.40, 2.40, −2.30] | 0.9 | Examine | C; `by: 'rue'` | 2.4 room | RUE: "I had a copy made before I gave yous the real one. ^ Des took it." (INSERT `polaroid_copy`) |
| `h24_corkboard` | [−0.80, 2.40, −4.40] | 1.0 | Examine | C | 2.4 room | INSERT `corkboard` → `corkboard_end`; CHASE: "…Every Sunday." |
| `h24_walkman` | [−5.20, 2.40, −1.10] | 0.7 | Examine | C; `by: 'rue'` | 2.4 room | RUE: "Fourth copy. I wore the others out. ^ Still the only song I listen to. It's got a kettle in it." |
| `h24_brick` | [−5.20, 2.40, −0.55] | 0.7 | Examine · hold to record | C; `by: 'rue'`; `sample: 'brick'`; `flag: 's24_brick'`; `when: s => s.flags.s24_phone_down` | 2.4 room | RUE: "Go on. Ring it. ^ Still works." → `brick_phone.test()`; hold YES records **Brick phone trill** |
| `h24_card` | [2.30, 2.40, −2.90] | 0.9 | Examine | C; `by: 'rue'` | 2.4 room | RUE: "Year before they let me go. ^ 'Let me go.' Lovely way to put it." |
| `h24_tin` | [−3.70, 2.40, −1.80] | 0.8 | Examine | C | 2.4 room | no scripted line (the script's "see below" is `2.4_tea` 6): a silent INSERT `bic_tin`, 1.5 s |
| `h24_kettle` | [−3.20, 2.40, −8.00] (mark `kettle`) | 1.0 | Kettle | any | 2.4 room | RUE: "Put the kettle on? ^ I've just put it on. You can put it on again." then the save ask; `kettle_rue.boil(true)` + puff |
| (roam `until`) | — | — | — | — | 2.4 room | the explore ends when the brick phone has been examined (flag `s24_brick`, sample taken or declined) **and** two other items have been examined, or after 120 s → `2.4_tea` (Rue: tray to `s24_rue_tray`, everyone to the seats on a straight cut) |

Rue's lines play from his current spot; he does not have to walk to the item (he is slow; let him be).

---

## 9. Cutscene needs (shots → geometry that must exist)

**Opening** (time card): `house_wide` — needs the full street front: fence + gate + letterbox, frangipani with
blossoms, the high-set house on its stumps and lattice, stairs, verandah with ferns, the red roof, the neighbours left
and right, Norfolk pines across the road in the foreground edge, the bay strip to frame-right. The Walkman is audible
only as a faint muffled loop (content: `music('walkman', { muffled: true })`).

**`2.4_door`**
1. MID `s24_door_mid`: `screen_door.open(1)`; the dim front room visible behind Rue through the open inner door (the
   IN-tinted interior and the sunbeam spot must already exist — `inside24`'s spot is off outside, so the interior reads
   via bake tints only). Hold 3 s (stare).
3. CLOSE Rue (framing helper) — the verandah ceiling and fern basket behind Chase's side; the door frame behind Rue.
- Reverse `s24_door_rev` for Chase/Luka (the yard and gate behind them, Chase (2040) small at the gate).

**`2.4_tea`**
- Master `s24_tea_wide` **requires**: louvre slats as alpha/glass (see-through), the dowel balustrade alpha-cut, the
  yard and the gate built, and Chase (2040) standing at `s24_c40_gate`. Line of sight from the camera through the
  louvres (x ≈ −2.5, y 3.6 at z 0) to the gate passes x −2.2 at the balustrade (through the dowels), clear of the
  verandah posts at x −4.70 and −2.45. Rue's POV (`s24_louvre_pov`) crosses the louvres at x −4.7 and the balustrade
  at x −4.0. **Do not move those posts, Chase (2040)'s gate mark or the armchairs without re-checking both lines.**
- 6 "Pass the bics": `bic_tin.open(true)` (anchor `bic_tin` or a MID on Rue).
- 7 TWO-SHOT `s24_twoshot_boys`.
- 11 POV `s24_louvre_pov` (Rue's eye, seated) — the gate, Chase (2040) at it, the street, the storm bank low over the
  bay beyond (`storm_bank.build(0.45)`).
- 16 the brick phone on the side table: `brick_phone_table`.
- 17 CLOSE Rue to Luka: `s24_rue_to_luka`; 19 Luka twisting his lanyard: framing helper CLOSE on `luka`.

**`2.4_gate`** (content sets `{env: 'building24', dur: 0}` and `dress('gate24')`)
1. WIDE `s24_yard_wide`: Rue down the stairs, left hand on the rail (`s24_rue_stair_top` → `s24_rue_stair_foot`, speed
   0.7), then down the path to `s24_rue_gate`. Chase (2040) at the gate cannot look at him (faces away, ry ≈ 2.6).
   Luka and Chase at `s24_luka_yard` / `s24_chase_yard`.
2–6 `s24_gate_two` and framing-helper CLOSEs; the closed gate between them (it is waist-high: both faces clear).
8 INSERT `s24_hands`: Rue's hand prop (the brick phone, from art) → Chase (2040)'s right (scarred) hand; then
   `inventory.add('brick_phone')`.
13 "…I will." — CLOSE Chase (2040).
14 WIDE `s24_verandah_wide`: content opens the gate (`gate.open(1)`), walks the three through `s24_walk_wp` and on +X,
   cuts to the wide with them already at `s24_walk_*` and still walking; Rue at `s24_rue_watch`. **Needs**: the street
   running +X to the T at x 70 and the sea wall/water beyond (the "toward the water"), the foreshore reserve and the
   bay to the right, the **storm bank** large and dark (`storm_bank.build(0.85)` over the cutscene, starting 0.55), the
   padded speed hump and a street lamp mid-frame. `hovercar_street.off()` during the cutscene (a hover-car crossing
   between Rue and the three would step on the moment).
15 "Go on. ^ Yes." — hold on the wide or a CLOSE on Rue from the verandah side (framing helper; the verandah zone keeps
   the lens on the verandah).

**B1 frame (optional)**: `dress('cork31')`, `b1_cork31` held 2.5 s (or `b1_room31`). No actors.

---

## 10. Ambience and `update(dt, ctx)`

`ambience: { loops: ['cicadas', 'birds', 'surf_far', 'wind_soft'], room: 'none' }` (default, exterior).
`dress()` switches with `AUDIO.ambience({ loops })` + `AUDIO.setRoom(room)` when the state changes (guarded by
`typeof AUDIO !== 'undefined'`). Loop names are requests to the audio owner (`03-audio.js`).

| State | Loops | Room |
| --- | --- | --- |
| `knock24` | `cicadas`, `birds` (lorikeets, a butcherbird), `surf_far`, `wind_soft` | `none` |
| `explore24`, `tea24` | `fan` (ceiling fan tick), `clock` (mantel), `cicadas` (muffled), `birds` (muffled) | `room` (small, warm) |
| `gate24` | `cicadas`, `wind_soft` (rising), `surf_far`, one `thunder_far` rumble at step 1 (content) | `none` |
| `cork31` | `fan`, `clock`, `birds` | `room` |

One-shot SFX fired by the set (rate-limited, ≥ 0.5 s apart): `bell_brass` (bell peaks), `lorikeet` (each flight),
`hover_hum_pass` (the street car), `screen_door_bang` (screen door shutting), `gate_latch`.

**`update(dt, ctx)` — no allocation** (preallocated `Matrix4`, `Vector3`, `Quaternion`, `Color` scratch; `for` loops;
hoisted callbacks):

1. Scene change → `dress(AUTO[state.scene] || 'knock24')`. Env change → louvre-light opacity, sun direction/halo,
   spot placement (`world.torchAuto = false` while `inside24`/`cork31`; true otherwise).
2. Band skirt colour copies `world.scene.fog.color`.
3. Doors and gate ease toward their `userData` targets (smoothstep); gate collider follows (array written in place).
4. Bell: damped swing angle `a = A·e^(−t/0.6)·sin(2π·2.2·t)`; fire `bell_brass` on the first two peaks.
5. Ceiling fan rotation; mantel clock hands from `R.clockMin` (+ dt/60).
6. Walkman spools (when playing); brick phone LCD timer.
7. Kettle steam (puff every 0.6 s while `boil`), click after 25 s or on `click()`.
8. Frangipani canopy sway; blossoms IM is static (no per-frame matrix writes); Hills hoist rotation + towel flap
   (3 child scales).
9. Lorikeets: one shared timer; when due, both fly a precomputed Bézier across the yard (positions from a 32-sample
   table, no allocation); wing IM scale-y flips at 12 Hz.
10. Street hover-car: x += v·dt; bob y 0.32 + 0.02 sin(2t); slows to 2 m/s for |x − 12| < 4 (the padded hump); wraps
    and waits 45 s.
11. Water ripple offset; clouds drift 0.3 m/s; `storm_bank` eases toward its `build` target (scale.y and darkness via
    the cards' vertex colour lerp — one material, colour attribute rewritten only while easing).

---

## 11. Performance budget (target < 300; expected ≈ 75 worst case)

| Group | Draw calls |
| --- | --- |
| Static: `M.vc`, `M.atlas`, `M.alpha`, `M.cork`, `M.glass`, `M.glow`, louvre light | 7 |
| Instanced: posts, pickets, stumps, blossoms ×2, tufts, hibiscus, neighbours ×2, pines, rocks, lamps, lorikeets ×2 | 15 |
| Named props: screen door, front door, bell (+cord), gate, Walkman, brick phone, tin lid, kettle, tea tray, tea set, clock hands, fan, Hills hoist (+towels), hover-car (body + glow) | ~18 |
| Far: water, band, skirt, sun ×2, clouds, storm bank | 7 |
| Rigs: Rue, Luka, Chase, Chase (2040) (≈ 3–4 each incl. attachments: Santa beard, the brick phone in Rue's hand) | ~16 |

Rules: everything static merges into `M.vc` per material in one Builder; furniture is static; textures ≤ 256 px and
one atlas; `M.alpha` cut-outs (no blending) for lattice/balustrade/fretwork/leaves; no shadow maps (blob shadows under
rigs and the hover-car); no per-frame allocation.

---

## 12. API summary, data exports, engine notes

```js
SETS.rue_house = {
  env, build, marks, anchors, cams, zones, colliders, floor, props, ambience, update,
  dress(state, opts),   // 'knock24' | 'explore24' | 'tea24' | 'gate24' | 'cork31'; opts.keepEnv skips the env
  paths: {
    rue_pottering: [[-3.2, -7.75], [-4.85, -0.85], [-4.0, -4.6], [-3.2, -7.75]],   // y 2.40
    rue_to_gate:   [[-0.35, 2.6], [-0.35, 6.75], [-0.15, 12.55]],                  // y from floor()
    walk_off:      [[0.0, 13.6], [1.0, 14.9], [26.0, 14.9], [60.0, 14.9]],
    street_car:    [[-80, 21.5], [70, 21.5]],
  },
};
```

**AUTO dress map**: `{ '2.4': 'knock24' }`; anything else → `'knock24'` (except an explicit `cork31`).

**Dress states**

| key | `knock24` | `explore24` | `tea24` | `gate24` | `cork31` |
| --- | --- | --- | --- | --- | --- |
| env | `morning24` | `inside24` | `inside24` | `building24` | `cork31` |
| gate | shut | shut | shut | shut (content opens it at step 14) | shut |
| screen_door | shut | shut | shut | open (Rue came out) | shut |
| front_door | open | open | open | open | open |
| walkman | **playing** (content stops it at `2.4_door` 1) | stopped | stopped | stopped | stopped |
| brick_phone (table) | hidden (in Rue's cardigan: art attachment) | hidden until Rue sets it down (`show(true)`, flag `s24_phone_down`) | shown | hidden (Rue carries it down) | shown |
| kettle_rue | off | **boiling** | off | off | off |
| tea_tray / tea_set | tray / — | tray / — | — / **set** | — / set | — / — |
| bic_tin | shut | shut | shut → open (step 6) | open | shut |
| corkboard | 2040 | 2040 | 2040 | 2040 | **2031** |
| storm_bank build | 0.25 | 0.30 | 0.45 | 0.55 → 0.85 | 0 |
| hovercar_street | on | on | on | off during the cutscene | off |
| lorikeets | on | on (seen through the louvres) | off | off | off |
| ambience | ext | room | room | ext | room |

**Engine notes (for `30-world.js` owner; minimal hooks)**

1. `world.torchAuto` is global: this set sets it false while it places the spot as a sunbeam/lamp, and restores it in
   `dress()` for exterior states. Please reset `torchAuto = true` in `showE()` so no set can leak it.
2. Every preset defines `spot` (see §3.4).
3. The set never spawns Rue. `CHARACTERS.rue` / `LOOKS.rue` are used by content in 2.4 only.
