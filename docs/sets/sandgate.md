# SET `sandgate` — Sandgate station forecourt, the sausage sizzle (Sunday 23 December 2040)

File `src/16-set-sandgate.js` · `SETS.sandgate` · Scene **2.6 "Snag"** (cutscenes `2.6_luke`, `2.6_invite`, the
**Sausage Sizzle** mini-game) and the first shot of **2.7** (`2.7_board`: INSERT at the station gate). Same contract as
Rue's `SETS.reddy` (`ref/rue/05-set-reddy-optus-redcliffe-2026.js`) plus `dress()`, `paths`, `sizzle`, `queue` (§12).
The mini-game is `sizzle` (`47-mg-sizzle.js`): this set gives it the hotplate, the front table, the queue of
customers, their APIs and two fixed cameras; the rules are the mini-game's.

---

## 0. Decisions (read first)

1. **One plaza, one gazebo, one entrance hall.** Forecourt 32 × 20 m in front of the station; the charity gazebo on
   its west half; the entrance portal and the fare-gate hall behind. The platform and a standing train are visible
   through the hall's back glazing (a static prop), never walked.
2. **The only readable signs are hand-made.** In 2040 every printed sign is blank (AR only). Luke's sign is hand-painted
   on board: **DOLPHINS JUNIORS SIZZLE — SUNDAYS** reads to everyone (the joke: the one sign the boys can read was
   painted by a retiree). Also physical: the fare gate's little screen (it's a screen), the "GOLD COIN" tin label in
   marker, and Luke's apron (art).
3. **Customers are set-owned ambient rigs** (Rue's `CUST` pattern), not actors: five rigs with distinct looks
   `sizzle_a…e`, built once at `build()`, walked by the set's queue logic. Ten customers are served by cycling the
   five (each comes back once with a different hat/bag swap). The mini-game drives the queue through `SETS.sandgate.queue`.
4. **Pre-storm.** 15:00, hot and bright, but the storm wall stands behind the station (to −Z) and grows through the
   scene; the first gusts arrive as they head for the station (`gust26`). No rain on this set.
5. **Yes yellow is not used.** The gazebo is Dolphins red and white; the mustard is not on the menu.
6. **`dress(state)` applies its env preset** (instant) unless `{ keepEnv: true }`. Auto-dress: `'2.6' → 'luke26'`,
   `'2.7' → 'gates27'` (only if this set is current; see §9 for how 2.7 reaches it).

---

## 1. Purpose and scenes

| Beat | Story time / weather | Env | Dress | What happens |
| --- | --- | --- | --- | --- |
| `2.6_luke` | Sun 23 Dec 2040, 15:00, hot sun, storm wall behind the station | `arvo26` | `luke26` | WIDE under the gazebo: Luke (2040) turning sausages, a queue of three; Chase marches up: "We know it's you." … "It's not Luke." |
| PLAY Sausage Sizzle (mini-game `sizzle`, needs both) | same | `arvo26` | `sizzle26` | Luka on the hotplate (six snags, onions), Chase on the front (orders, assembly, hand-over), Chase (2040) lost at the cash tin, Luke beside Luka. Ten served. Banter at set customers. Sample **Sizzle** |
| `2.6_invite` | 15:25, wind getting up | `arvo26` → `gust26` (lerp 8 s from step 4) | `invite26` | Luke's card (INSERT is a CARD); "Plus two." "You look after yourself, Chase."; WIDE: they head for the station entrance, Luke looks at Santa's back a second too long |
| `2.7_board` step 1 | 16:28, overcast, gusty | `gust26` | `gates27` | **INSERT · the station gate**: Chase (2040) taps Jordan's Christmas bonus card. Three fares. **Balance: $4.** (then the scene continues in `train`) |

Time card `place`: `Sandgate Station`. Music (content): `sizzle` (sunny, ukulele bass) plus the diegetic hotplate.

Set lifetime: built under black at the start of 2.6 (`bridge` live behind). Kept live through 2.7's first shot
(`world.liveMax = 3` during 2.6–2.7), then retired after `train` is current.

---

## 2. Layout

### 2.1 Axes and conventions

- Metres, **Y up**, plaza y = 0 everywhere walkable (no `floor()` needed).
- **+Z = toward the street** (the plaza opens to Brighton Road). The station facade is at **z = −10** and faces +Z.
  **+X** runs along the street toward the corner the three arrive from (they walked from Brighton).
- Mark facing `ry`: faces `(sin ry, cos ry)`: `0` faces +Z (the street), `PI` faces −Z (the station), `H` +X, `-H` −X.
- Boxes `[x0, z0, x1, z1]`.

### 2.2 Plan (footprint x −40…+40, z −30…+40 incl. backdrop; walkable x −15.5…+15.5, z −13.4…+9.3)

```
 z (+Z, the street, up the page)
 30  · shops across the road (backdrop): a pub verandah, a bakery, a closed bank — all signs blank
 16.8 ── far footpath ────────────────────────────────────────────────────────────────
  9.8 ═══ ROAD (z 9.8…16.8): hover-cars both ways ═══════════════════════════════════════
  9.6 ── kerb · padded bollards every 1.6 m ──────────── bus shelter (8, 8.6) ──── corner → arrivals (+X)
                       q5 (−5.6, 3.75)
                       q4 (−5.6, 2.85)                     MORETON BAY FIG (10, 0, 2) r 5, bench ring
                       q3 / q2 / q1 (z 1.95 / 1.05 / 0.15)
                       serve point (−5.6, 0.15)
 −0.4 ┌─────────── GAZEBO x −8.4…−3.6 (red/white) ───────────┐   A-frame SIGN (−2.9, 0.3)
      │ urn(−7.3) bread  snags  onions  [build]  sauces  tin │   C40 at the tin (−4.1, −1.6)
 −1.15│═══════════ FRONT TABLE x −7.6…−4.4 ═══════════════════│
      │                    Chase (−5.6, −1.75)                │
 −2.4 │ ═══ HOTPLATE x −8.0…−6.2 (6 snags + onions) ═══  esky │
 −3.25│  Luka (−7.55)  Luke (−6.65)                           │
 −3.6 └───────────────────────────────────────────────────────┘
 −6.0  ● canopy columns (padded bases) at x −12, −4, +4, +12 ●      bike rack (−13, −8)   palm (13.5, −7)
 −10.0 ═══ STATION FACADE (brick + glass) ═══╡ PORTAL x −3…+3 ╞═══════ bubbler (5.5, −9.3) ═══
 −13.0           readers ▣   ▣   ▣
 −13.6           FARE GATES: lanes x −2.45…−1.15 | −0.65…+0.65 | +1.15…+2.45
 −16.0 ═══ back glazing → platform (z −18…−24) with a standing 2040 train ═══
        x: −16 ……… −8.4 ……… −3.6 … 0 … 3 ……… 10 ……… 16
```

### 2.3 Key coordinates

| Thing | Where | Notes |
| --- | --- | --- |
| Plaza | pavers x −16…+16, z −10…+9.6 | warm sandstone pavers |
| Station canopy | curved metal roof over x −13…+13, z −10…−5.6, underside y 4.4, top 5.0; columns at (−12, −6.0), (−4, −6.0), (4, −6.0), (12, −6.0) with padded cream bases (2040) | Christmas bunting along its front edge (red/green/white flags, 24) |
| Station building | x −16…+16, z −24…−10, roof y 6.5; brick base to y 1.2, glazing above; a blank name panel over the portal (AR SANDGATE STATION) | |
| Entrance portal | x −3.0…+3.0, y 0…3.4 at z −10, sliding glass doors parked open | |
| Entrance hall | x −6…+6, z −16…−10, ceiling y 3.6; floor tiles | small decorated Christmas tree (−4.8, 0, −11.2); a padded bench (4.6, −12.0) |
| **Fare gates** | line z −13.6: cabinets (0.25 × 1.4 × 1.0) at x −2.70, −0.90, +0.90, +2.70 → three lanes x −2.45…−1.15, −0.65…+0.65, +1.15…+2.45; paddles (glass, 0.5) on each cabinet; **readers** (a pad + tiny screen) on the cabinet tops at the lane entries, z −13.0 | `fare_gates`; the INSERT uses lane 2's reader at (0.90, 1.05, −13.0) |
| Back glazing | z −16, x −6…+6, y 0…3.6 | through it: the platform (z −18…−24, y 0) with a canopy and a standing 2-car 2040 train (`train_standing`, doors open, interior lit soft blue) |
| **Gazebo** | pop-up canopy 4.8 × 3.2: legs (−8.4, −3.6), (−3.6, −3.6), (−8.4, −0.4), (−3.6, −0.4); roof eaves y 2.35, peak y 3.0; red/white striped canopy with a front valance printed **DOLPHINS** (fabric print, pre-AR) | tinsel twisted round the two front legs (Luke's touch) |
| **Hotplate** (BBQ trolley) | plate x −8.0…−6.2, z −3.0…−2.4, top y 0.92; frame + gas bottle under; a splash-back on the −Z side | `hotplate` |
| Snags | six along x at −7.85, −7.66, −7.47, −7.28, −7.09, −6.90; z −2.72; y 0.945; each 0.22 long (along z) × 0.045 | `snags` IM (instanceColor) |
| Onion pile | x −6.55…−6.25, z −2.95…−2.50 on the plate | `onions` |
| Tongs | two pairs: one hung on the trolley rail (−6.3, 0.95, −3.05), one in Luke's hand (art hand prop) | `tongs_spare` |
| **Front table** | trestle x −7.6…−4.4, z −1.15…−0.45, top y 0.76, white cloth | |
| Front table items (left → right, z −0.80) | **tea urn** (−7.30, the set's kettle) · bread stack (−6.90) · tray of cooked snags (−6.45) · tray of onions (−6.05) · **build spot** (−5.60, −0.75) · sauce bottles tomato (−5.15, −0.90) + BBQ (−5.00, −0.90) · napkins (−4.95, −0.60) · **cash tin** (−4.65) with a marker label **GOLD COIN** | `sizzle_table` group; `order_build`, `sauces`, `cash_tin`, `urn` |
| Esky | (−8.10, 0, −1.60) (between the urn end and the hotplate) | static |
| Bin | (−3.3, 0, −3.4), padded | static |
| **The sign** | A-frame board (−2.90, 0, 0.30), ry 0.35 (angled toward the arrivals): hand-painted **DOLPHINS JUNIORS SIZZLE — SUNDAYS**, a painted dolphin holding a sausage in bread | `sizzle_sign` |
| Queue | serve point (−5.60, 0, 0.15) facing −Z; spots every 0.9 m in +Z: q1 0.15, q2 1.05, q3 1.95, q4 2.85, q5 3.75 (x −5.6 + jitter ±0.12) | `queue` |
| Exit route for served customers | from the serve point, step left (−X) to (−9.8, 0, 1.0), walk to (−15, 0, 6.5) and off behind the palm (−14, 0, 4) | they re-enter from (16, 0, 6) along the street side |
| Fig tree | trunk (10, 0, 2), canopy r 5 at y 4…9; circular bench r 2.0 round the trunk | |
| Bus shelter | (8, 0, 8.6), 4 × 1.4, faces +Z; blank timetable panel | |
| Kerb + bollards | kerb z 9.6…9.8; padded bollards (cream) every 1.6 m from x −15.2 to +15.2 at z 9.45 | |
| Bike rack / bubbler / palms | (−13, −8.0) / (5.5, −9.3) / (−14, 4), (13.5, −7) | |
| Street | road z 9.8…16.8; far footpath 16.8…19; shops z 19…30 (backdrop, merged) | hover-cars glide past (§10) |

### 2.4 Far groups (`fog: false`, Basic)

| Piece | Where |
| --- | --- |
| Band | r 380 centred (0, 0, 0): suburb roofs, trees, power poles; the Sandgate foreshore glimpse to +X+Z (a strip of grey bay) |
| Storm wall | 6 anvil cards behind the station (−Z, slightly −X) at 220–320 m, y 40–180; `storm.build(u)` |
| Sun disc + halo | per env, high in the west-north-west (−X) |
| Cumulus | 5 cards over the street side |

### 2.5 Colliders

```
station facade       [-16, -10.3, -3.0, -10.0]   [3.0, -10.3, 16, -10.0]
hall walls           [-6.3, -16.3, -6.0, -10.0]  [6.0, -16.3, 6.3, -10.0]  back glazing [-6.0, -16.3, 6.0, -16.0]
fare-gate cabinets   [-2.825, -14.3, -2.575, -12.9] [-1.025, -14.3, -0.775, -12.9] [0.775, -14.3, 1.025, -12.9] [2.575, -14.3, 2.825, -12.9]
fare-gate side walls [-6.0, -13.7, -2.825, -13.5] [2.825, -13.7, 6.0, -13.5]
paddles (dynamic)    [-2.45, -13.65, -1.15, -13.55] [-0.65, -13.65, 0.65, -13.55] [1.15, -13.65, 2.45, -13.55]  → parked at 1e4 while open
plaza west / east    [-16.3, -10, -16.0, 9.6]    [16.0, -10, 16.3, 9.6]
kerb (bollard strip) [-16, 9.3, 16, 9.6]
canopy columns       0.5 sq at (−12, −6), (−4, −6), (4, −6), (12, −6)
gazebo service area  [-8.4, -3.6, -3.6, -0.45]   (closed to the player: the front table + legs; servers stand in it under mini-game control)
sign                 [-3.25, 0.05, -2.55, 0.55]
fig tree + bench     [7.8, -0.2, 12.2, 4.2]
bus shelter          [6.0, 8.0, 10.0, 9.3]
tree (hall), bench   [-5.2, -11.6, -4.4, -10.8]  [4.0, -12.3, 5.2, -11.7]
bike rack, bubbler   [-14.0, -8.3, -12.0, -7.7]  [5.3, -9.5, 5.7, -9.1]
palms                0.5 sq at (−14, 4), (13.5, −7)
customers (dynamic)  5 × 0.56 m squares, moved by update; parked at 1e4 when hidden
```

The player never needs to enter the gazebo service area: the mini-game places Luka and Chase at their stations.

---

## 3. Look

### 3.1 Palette (spec §14: 2040 day, turning to storm)

| Use | Hex |
| --- | --- |
| Sky (arvo26 / gust26) | `#9ec6dc` / `#7a9298` |
| Storm wall | `#4e5a56` body, `#cfd6cf` rim, green-grey underside `#5e6e5c` |
| Pavers / kerb | `#d9b98f` / `#cfc8ba` |
| Station brick / glazing frames / canopy | `#a8604a` / `#3a4250` / `#d8dce0` |
| Padded 2040 foam (bollards, column bases, bin) | `#efe6d0` |
| Gazebo canopy | Dolphins red `#c8262e` + white `#f6f4ee` stripes; legs `#b8bec4` |
| Hotplate steel / grime | `#5d5f63` / `#2f2b28` |
| Snags (state colours) | raw `#e7a2a0` · browning `#c87850` · **ready** `#8a4a2a` · burning `#4a2a1a` · burnt `#1e1612` |
| Onions | raw `#f0e6c8` → golden `#c99a50` (not Yes yellow) → dark `#6a4a28` |
| Bread / tomato sauce / BBQ sauce | `#f4ead2` / `#c8302c` / `#5a2e1e` |
| Cloth / urn | white `#f6f4ee` / steel `#c8ccd0` |
| Sign board / paint | plywood `#d8c49a`, paint navy `#141d3a`, red `#c8262e`, dolphin blue `#5aa0d8` |
| Fig leaves / trunk | `#3f6a3a` / `#8a7c6a` |
| Glassy accent (fare-gate screens, chip lights) | `#bfe6ff` |

### 3.2 Materials

- `M.vc` (all static, vertex-coloured; 1 call) · `M.atlas` (256 × 256: sign, reader screens, GOLD COIN label, urn
  label, bus-shelter panel, the hall's blank panels, `t_shops` cells) · `M.canopy` (gazebo stripes; unique key: its
  valance flaps in `update`) · `M.glass` (Basic 0.22: portal, hall glazing, train windows) · `M.glow` (train interior,
  reader screens, hall lights; unique key) · `M.snag` (Lambert for the snag IM with `instanceColor`, set at build so the
  program warms) · `M.sky*` (Basic, `fog: false`).
- No vertex snapping, no affine warping, no wobble.

### 3.3 Textures to paint (128–256 px, nearest; **text must read at the named anchor**)

| Texture | Size | Content (readable in **bold**) | Read at |
| --- | --- | --- | --- |
| `t_sign` | 128 × 96 cell | plywood, hand-painted, slightly uneven letters: **DOLPHINS JUNIORS** / **SIZZLE** / **— SUNDAYS —**; a cartoon dolphin holding a snag in bread; small at the bottom **$3 SNAG · $1 DRINK** | `s26_sign`, `s26_luke_wide` |
| `t_reader` | 64 × 32, repaintable | the fare-gate reader screen: idle (a chip glyph, **TAP**) · `tap3` (**3 FARES** / **Balance: $4**) · `ok` (a tick) | `s27_gate_tap` |
| `t_goldcoin` | 32 × 16 cell | marker on masking tape: **GOLD COIN** | `s26_tin` |
| `t_valance` | 128 × 16 | white printed **DOLPHINS** on the red valance (repeat ×2) | wides |
| `t_bread`, `t_onion` | 32 × 32 cells | white-bread slice; onion strands | close cams |
| `t_shops` | 4 cells of 128 × 64 | backdrop shopfronts across the road (blank signs) | street side |
| `t_train_side` | 128 × 64 | 2040 suburban train side: white, navy and teal stripes, lit blue windows | through the back glazing |
| `t_pavers`, `t_brick`, `t_tiles` | 64 × 64 | tiles | |
| `t_band`, `t_storm`, `t_cloud` | 256 × 64 / 128 × 128 / 128 × 64 | as in §2.4 | sky |

The invitation (2.6_invite step 2) is a **CARD** (`invite`, content/UI), not set art: **MANDATORY FUN · Christmas Eve
Morning Tea · Optus Tower, Ann Street, Fortitude Valley · 10:00 · Countdown to Quiet at 11:58! · Safety goggles
provided · Admits: LUKE + 2**. The set provides only `s26_apron` for the CLOSE as Luke pulls it out.

### 3.4 Lighting rig and fog

```js
env: {
  arvo26:  { bg: 0x9ec6dc, fog: [0xdcd6c0, 0.0070], hemi: [0xfff6e6, 0xa08a66, 1.05], dir: [0xffe6c0, 1.55, [-12, 14, 4]], spot: [0xffd8a8, 0.6], rain: 0 },
  gust26:  { bg: 0x7a9298, fog: [0xa8b0a4, 0.0085], hemi: [0xdfe6e0, 0x6e705c, 0.95], dir: [0xf4ecd8, 1.05, [-12, 10, 4]], spot: [0xffd8a8, 0.4], rain: 0 },
  gates27: { bg: 0x6c8288, fog: [0x98a29a, 0.0090], hemi: [0xd8e2e6, 0x60645a, 0.90], dir: [0xe8ece4, 0.85, [-12, 10, 4]], spot: [0xd8ecff, 1.2], rain: 0 },
}
```

| Preset | Spot | Purpose |
| --- | --- | --- |
| `arvo26`, `gust26` | (−6.0, 2.7, −2.0) → (−6.0, 0.8, −1.8), angle 0.9, penumbra 0.7, dist 5 | warm fill under the gazebo canopy so the hotplate, the table and the faces read in its shade |
| `gates27` | (0.9, 3.3, −11.8) → (0.9, 1.0, −13.0), angle 0.45, penumbra 0.6, dist 5 | cool pool on the fare gates for the INSERT |

Sun disc (unit ×400): `arvo26` (−0.62, 0.70, 0.35) · `gust26` dimmed, partly behind the storm's edge (−0.70, 0.55, 0.45)
· `gates27` hidden. Fog 0.007: the far end of the street fades by ≈ 200 m.

---

## 4. Props

| id | Description | Scenes | States / animation (`userData`) |
| --- | --- | --- | --- |
| `hotplate` | BBQ trolley + plate | 2.6 | `sizzle(level)` 0…1: heat shimmer + puff rate (steam/smoke from the plate) |
| `snags` | 6 sausages (IM with instanceColor) | 2.6 | `set(i, state)` with state `'raw' \| 'browning' \| 'ready' \| 'burning' \| 'burnt' \| 'gone'`; `turn(i)` rolls it 180° about its long axis over 0.25 s (colour of the down side swaps); `reset()` six raw |
| `onions` | onion pile | 2.6 | `stir()` wobble 0.3 s + puff; `cook(u)` 0…1 colours raw → golden → dark |
| `tongs_spare` | spare tongs on the trolley rail | 2.6 | hold prop (`hold('luka', 'tongs_spare')`) |
| `order_build` | the sandwich being assembled at the build spot: bread slice, snag, onions, sauce stripe | 2.6 | `show({ bread, snag, onions, sauce })` with `sauce: null \| 'tomato' \| 'bbq'`; `give()` slides it +Z 0.3 m and hides (the customer takes it) |
| `sauces` | tomato and BBQ squeeze bottles | 2.6 | `squeeze(kind)` tilt 0.4 s |
| `cash_tin` | old tin with GOLD COIN tape | 2.6 | `open(bool)`: lid up — there is no change in it |
| `urn` | tea urn on the table's left end (the set's kettle) | 2.6 | save puff (`world.puff('urn', …)`) |
| `sizzle_sign` | the A-frame | 2.6 | gentle rock in `gust26` (±0.03 rad) |
| `gazebo` | canopy + legs | 2.6 | valance flap (vertex-free: the valance strip's `rotation.x` sine, amplitude 0.05 → 0.25 in `gust26`); tinsel sway |
| `bunting` | 24 flags along the canopy edge (IM) | 2.6, 2.7 | sway (rotation per instance from a sine table, 24 matrices) |
| `customers` | 5 ambient rigs `sizzle_a…e` (2040 locals with chip lights: a tradie in shorts, a mum with a pram-less hover-pram, an old man with a dog lead and no dog, a teen with a skateboard under the arm, a woman in netball kit) | 2.6 | driven by `queue` (§12); speech-bubble anchors at head + 0.4 m for the mini-game's order bubbles |
| `fare_gates` | 4 cabinets, 6 paddles, 3 readers | 2.6 (bg), 2.7 | `open(lane, on)` paddles swing 1.3 rad (0.4 s), colliders follow; `reader(lane, 'idle' \| 'tap3' \| 'ok')` repaints `t_reader` (one shared canvas; only lane 2 changes) |
| `train_standing` | 2-car train at the platform behind the glazing, doors open, interior glow | 2.6, 2.7 | static; `glow(on)` |
| `traffic` | 4 hover-cars (IM, instanceColor) | 2.6 | glide along the road both ways (z 11.5 / 15.0), wrap at x ±60 |
| `fig` | fig tree (canopy group) | 2.6 | sway ±0.01 rad; leaf puffs in `gust26` (green puff, 3 per gust) |
| `far` | band, skirt, sun, clouds, `storm` | all | `storm.build(u)`; `storm.flicker(on)` (off by default; Reduce Flashing → dim pulse) |

**Instanced repeats**

| Repeat | Count | Mesh |
| --- | --- | --- |
| Padded bollards | 20 | 1 IM |
| Bunting flags | 24 | 1 IM |
| Pavers detail (kerb blocks) | merged | — |
| Snags | 6 | 1 IM (instanceColor) |
| Hover-cars | 4 | body IM + glow IM |
| Backdrop houses/shops | 10 | 2 IM |
| Street trees / power poles | 8 / 6 | 2 IM |
| Customer rigs | 5 | rigs (not IM) |

---

## 5. Marks (`[x, y, z, ry]`, world)

**General**

| id | value | use |
| --- | --- | --- |
| `kettle` | [−7.30, 0, 0.35, PI] | in front of the urn (customer side) — save |
| `luke_hot` | [−7.10, 0, −3.25, 0] | Luke cooking alone (centre of the plate) |
| `q_serve`, `q_1…q_5` | [−5.60, 0, 0.15, PI], then z 1.05, 1.95, 2.85, 3.75 (x −5.6) | customer queue |
| `q_exit` | [−9.80, 0, 1.00, −1.9] → `paths.cust_out` | |
| `q_enter` | [16.0, 0, 6.0, −H] → `paths.cust_in` | |

**2.6 — `2.6_luke`**

| id | value | step |
| --- | --- | --- |
| `s26_arrive_chase`, `s26_arrive_luka`, `s26_arrive_c40` | [12.0, 0, 5.4, −H], [13.2, 0, 6.2, −H], [14.0, 0, 4.9, −H] | entering from the street corner (+X) |
| `s26_chase_march` | [−5.15, 0, 0.55, PI] | Chase marches up to the table, beside the queue, in Luke's face |
| `s26_luka_back` | [−2.60, 0, 1.40, −2.4] | Luka (Santa) hangs back by the sign — "And who's Santa?" "…Ho ho." |
| `s26_c40_back` | [−3.40, 0, 2.30, −2.6] | Chase (2040) behind, "Don't." |
| `s26_c40_aside` | [−3.10, 0, 1.15, −2.2] | step 18: quietly, to Chase |

**2.6 — Sausage Sizzle (the mini-game places them)**

| id | value | station |
| --- | --- | --- |
| `sz_luka` | [−7.55, 0, −3.25, 0] | Luka at the hotplate (west half) |
| `sz_luke` | [−6.65, 0, −3.25, 0] | Luke beside him (east half; "flipping beside him") |
| `sz_luke_takeover` | [−7.30, 0, −3.25, 0] | Luke takes the tongs after three burnt ("Easy, Santa."); Luka steps to `sz_luka_aside` [−8.10, 0, −3.30, 0.3] |
| `sz_chase` | [−5.60, 0, −1.75, 0] | Chase at the build spot, facing the customers |
| `sz_c40` | [−4.10, 0, −1.60, −0.5] | Chase (2040) at the cash tin, looking lost |
| `s26_sample_sizzle` | [−6.40, 0, −2.05, PI] | Chase holds his phone over the onions (between the table and the plate, facing −Z) |

**2.6 — `2.6_invite` and the exit**

| id | value | step |
| --- | --- | --- |
| `s26_luke_invite` | [−4.00, 0, −0.10, 0.5] | Luke comes round the table's east end, wiping his hands |
| `s26_inv_chase`, `s26_inv_luka`, `s26_inv_c40` | [−3.20, 0, 0.90, −2.6], [−2.20, 0, 0.40, −2.3], [−2.60, 0, 1.70, −2.5] | receiving the card |
| `s26_go_1`, `s26_go_2`, `s26_go_3` | [−0.6, 0, −6.5, PI], [0.4, 0, −7.0, PI], [1.2, 0, −6.2, PI] | walking to the portal (step 5) |
| `s26_luke_watch` | [−7.10, 0, −3.25, 0.9] | back at the plate, looking at Santa's back (head turned toward the portal) |

**2.7 — `2.7_board` step 1**

| id | value | |
| --- | --- | |
| `s27_gate_c40` | [0.90, 0, −12.35, PI] | Chase (2040) at reader 2 (lane 3: x 1.15…2.45 — he taps with his left hand onto the cabinet at x 0.90) |
| `s27_gate_chase`, `s27_gate_luka` | [0.40, 0, −11.60, PI], [1.70, 0, −11.40, PI] | behind him |

---

## 6. Anchors (`{ at, from, fov }`, world)

| id | at | from | fov | for |
| --- | --- | --- | --- | --- |
| `s26_luke_wide` | [−6.0, 1.3, −1.8] | [−1.2, 2.2, 6.4] | 46 | `2.6_luke` 1 WIDE: the gazebo, Luke at the plate in real happiness, a queue of three, the sign in the right foreground, the station and the storm wall behind |
| `s26_table_two` | [−5.6, 1.45, −1.8] | [−3.4, 1.6, 2.2] | 40 | Chase vs Luke across the table (Chase's OTS) |
| `s26_luke_ots` | [−5.15, 1.55, 0.55] | [−7.0, 1.75, −3.6] | 40 | reverse: over Luke's shoulder at Chase |
| `s26_sign` | [−2.90, 0.85, 0.30] | [−2.40, 1.20, 1.70] | 34 | the hand-painted sign |
| `s26_tin` | [−4.65, 0.82, −0.80] | [−4.30, 1.30, 0.10] | 30 | the cash tin (Chase (2040) looking lost at it) |
| `sz_hot` | [−7.40, 0.85, −2.55] | [−6.90, 2.25, −4.55] | 50 | mini-game hotplate view: over Luka's shoulder, the six snags and the onions large in the lower frame, the table and the queue beyond |
| `sz_front` | [−5.90, 1.00, 1.00] | [−6.40, 2.00, −2.60] | 52 | mini-game front view: over Chase's shoulder, the build spot lower frame, the customer at the serve point, the queue receding |
| `s26_snags_insert` | [−7.38, 0.95, −2.72] | [−7.38, 1.55, −2.05] | 30 | close on the row of snags (a burn, a turn) |
| `s26_onions` | [−6.40, 0.95, −2.72] | [−6.40, 1.40, −2.10] | 30 | sample Sizzle (phone held over the onions) |
| `s26_apron` | [−4.00, 1.15, −0.05] | [−3.10, 1.45, 0.90] | 30 | `2.6_invite` 1: Luke pulls the card from his apron pocket (CARD `invite` follows) |
| `s26_exit_wide` | [−1.0, 1.4, −8.0] | [−1.2, 1.7, 3.8] | 48 | `2.6_invite` 5 WIDE: Luke at the plate frame-left (`s26_luke_watch`), the three walking away toward the portal centre-right, the storm wall above the station |
| `s27_gate_tap` | [0.90, 1.05, −13.00] | [0.55, 1.42, −12.45] | 26 | `2.7_board` INSERT: the reader screen **3 FARES · Balance: $4**, Chase (2040)'s card at the pad |
| `s27_hall_wide` | [0.6, 1.3, −14.0] | [3.8, 2.4, −10.6] | 46 | optional: the three through the gates, the standing train beyond the glazing |
| `credits_sizzle` | [−6.0, 1.2, −1.8] | [−0.5, 2.6, 5.8] | 44 | optional credits frame (Luke still does sausages) |

---

## 7. Gameplay zones and fixed cameras

No stealth here. Gameplay cams are used for any free control in 2.6 (before/after the sizzle, the sample, the save);
the mini-game uses `sz_hot` / `sz_front` through `cam.override('set', { name })`.

```js
cams: {
  plaza_w:  { type: 'pan',   pos: [2.5, 4.6, 8.8],    base: [-6.0, 1.0, -2.0],  look: 'player', fov: 50, limit: 0.50 },  // first = default
  plaza_e:  { type: 'pan',   pos: [-12.0, 4.4, 8.0],  base: [6.0, 1.0, -1.0],   look: 'player', fov: 50, limit: 0.50 },
  entrance: { type: 'fixed', pos: [4.8, 3.6, -4.4],   look: [-0.6, 0.9, -13.2], fov: 52 },   // under the canopy into the hall: gates visible
  hall:     { type: 'fixed', pos: [-5.4, 3.3, -10.6], look: [1.4, 0.9, -15.2],  fov: 54 },   // inside the hall, high corner by the tree
  sz_hot:   { type: 'fixed', pos: [-6.90, 2.25, -4.55], look: [-7.40, 0.85, -2.55], fov: 50 },
  sz_front: { type: 'fixed', pos: [-6.40, 2.00, -2.60], look: [-5.90, 1.00, 1.00],  fov: 52 },
},
zones: [   // first match wins
  { box: [-6.0, -16.0, 6.0, -10.0],  cam: 'hall' },
  { box: [-6.0, -10.0, 6.0, -5.6],   cam: 'entrance' },
  { box: [-16.0, -10.0, -1.5, 9.6],  cam: 'plaza_w' },      // gazebo side
  { box: [-1.5, -10.0, 16.0, 9.6],   cam: 'plaza_e' },      // fig / corner side
  { box: [-40.0, 9.6, 40.0, 30.0],   cam: 'plaza_w' },      // street (filmable only)
],
```

`sz_hot` sits 0.95 m behind the gazebo's back edge at y 2.25, between the back legs; its view passes under the back
valance (the sight line is at y ≈ 1.6 where it crosses z −3.6, the valance hangs 2.05…2.35), so nothing needs hiding.
`sz_front` sits inside the canopy above the east end of the plate, behind and left of Chase.

---

## 8. Hotspots

| id | at | r | verb | who | scene | does |
| --- | --- | --- | --- | --- | --- | --- |
| `h26_tongs` | [−5.6, 0, 0.6] (the table front) | 1.2 | Grab some tongs | any, after `2.6_luke` | 2.6 | starts the mini-game `sizzle` (Luke's "Nobody gets a favour from me on an empty stomach. Grab some tongs." is content's) |
| `h26_sizzle` | [−6.40, 0, −2.05] (`s26_sample_sizzle`) | 0.8 | Hold to record | `only: 'chase'`, `sample: 'sizzle'` | 2.6 (inside the mini-game as a Chase action, or after it) | sample **Sizzle**; `onions.stir()` + `hotplate.sizzle(1)` |
| `h26_urn` | [−7.30, 0, 0.35] (`kettle`) | 0.9 | Kettle | any | 2.6 | "Put the kettle on? [YES] [NO]" (the urn); `world.puff('urn')` |
| `h26_sign` | [−2.90, 0, 1.00] | 1.0 | Examine | any | 2.6 | no scripted line: a silent INSERT `s26_sign` (optional; content may omit) |
| `h26_portal` | trigger box [−3.0, −11.0, 3.0, −9.6] | — | — | all three | 2.6 end | ends 2.6 (if content gives control after `2.6_invite` instead of the cutscene walk) |

---

## 9. Cutscene needs (shots → geometry that must exist)

**`2.6_luke`**
1. WIDE `s26_luke_wide`: the gazebo with the hotplate smoking (`hotplate.sizzle(0.6)`), six snags browning, Luke at
   `luke_hot` turning them (art anim `sizzle_flip`), three customers at `q_1…q_3` (`queue.reset(3)`), the hand-painted
   sign readable in the right foreground, bunting, the station facade and **the storm wall above the station**
   (`storm.build(0.35)`).
2–19: `s26_table_two` / `s26_luke_ots` and framing-helper CLOSEs. The gazebo's eave (y 2.35) must not cut the faces in
   the OTS: both lenses sit outside the canopy line or below the eave.

**Sausage Sizzle** — `sz_hot` / `sz_front` (mini-game), the `snags`/`onions`/`order_build`/`sauces`/`queue` APIs.
Banter plays as barks over play (content). "Luka turns a sausage that doesn't need turning": `snags.turn(i)` on a
`ready` snag. Luke's takeover: Luke to `sz_luke_takeover`, Luka to `sz_luka_aside`.

**`2.6_invite`**
1. `s26_apron` CLOSE as Luke pulls the card (art: a small card hand prop).
2. INSERT = CARD `invite`.
4. Luke to Chase (2040) as they go: framing-helper two-shot.
5. WIDE `s26_exit_wide` (env lerps to `gust26` from step 4; `storm.build(0.6)`; bunting and valance pick up): Luke at
   `s26_luke_watch`, the three walking `s26_go_*` into the portal; the hall lights and the standing train visible
   through the portal glass. Luke "looks at Santa's back for a second too long, then shakes his head" (art: `glance` +
   `shake`), then back to the plate.

**`2.7_board` step 1** (scene 2.7's set is `train`): content shows this set for the INSERT —
`{ do: c => { c.world.show('sandgate'); SETS.sandgate.dress('gates27'); } }`, actors placed at `s27_gate_*`,
`fare_gates.reader(2, 'tap3')` on the tap, INSERT `s27_gate_tap`, `fare_gates.open(2, true)`, then
`c.world.show('train')` for the rest of the cutscene. Requires `world.liveMax ≥ 3` from 2.6's end (sandgate + bridge +
train, or sandgate + train + next) so nothing rebuilds mid-cutscene; preload `train` under 2.6's final black.

---

## 10. Ambience and `update(dt, ctx)`

`ambience: { loops: ['street_arvo', 'sizzle_plate', 'crowd_low', 'birds'], room: 'none' }`.

| State | Loops | Room |
| --- | --- | --- |
| `luke26`, `sizzle26` | `street_arvo` (distant hover hum, a bus pulling in), `sizzle_plate` (diegetic hotplate, louder near the gazebo), `crowd_low`, `birds` (ibis, mynas) | `none` |
| `invite26` | as above + `wind_gust` rising | `none` |
| `gates27` | `wind_gust`, `hall_hum` (the station hall), a far `thunder_far` | `room` (tiled hall) |

One-shots (rate-limited): `snag_turn` (a sizzle pop on `turn`), `tongs_click`, `sauce_squirt`, `tin_open`,
`gate_paddle`, `reader_beep` (tap), `bus_pssh` (rare).

**`update(dt, ctx)` — no allocation**

1. Scene change → `dress(AUTO[state.scene] || 'luke26')`. Env change → spot placement (`world.torchAuto = false`
   while the gazebo fill / gate spot is used), sun, wind level (`arvo26` 0.2, `gust26` 1.0, `gates27` 0.8).
2. Far group: skirt = fog colour; storm cards ease to `build`; clouds drift with the wind.
3. Hotplate: puff smoke/steam at `0.15 + 0.6·sizzle` s intervals from preallocated positions over the plate (uses
   `world.puff('hotplate', …)`); snag `turn` timelines (≤ 6, matrices written only while turning); onion wobble.
4. **Queue** (§12): each customer rig `{ slot, x, z, yaw, state: 'wait' | 'step' | 'served' | 'leave' | 'loop' }`;
   walk at 1.2 m/s between slots (Rue's CUST logic: `rig.pose(anim, t, WALKP)`, `rig.update(dt)`), idle anims
   (`phone`, `look_down`, chip ping, shuffle), collider squares written in place.
5. Gazebo valance flap and tinsel sway; bunting (24 matrices from a sine table indexed by i + t); sign rock; fig sway
   and leaf puffs in gusts.
6. Hover-car traffic (4 matrices, wrap at ±60), chirp `hover_chirp` when one passes x ≈ 0 (rare).
7. Fare-gate paddles ease; reader screen repaint only on change.

---

## 11. Performance budget (target < 300; expected ≈ 85)

| Group | Draw calls |
| --- | --- |
| Static: `M.vc`, `M.atlas`, `M.canopy`, `M.glass`, `M.glow` | 5 |
| Instanced: bollards, bunting, snags, cars ×2, backdrop ×2, trees, poles | 9 |
| Props: hotplate, onions, tongs, order_build (4 parts in one mesh, toggled by draw-range or child visibility: ≤ 4), sauces, tin (+lid), urn, sign, valance, fare gates (cabinets static; paddles 1 IM, readers 1), train_standing 2 | ~16 |
| Far: band, skirt, sun ×2, clouds, storm | 6 |
| Rigs: Luka, Chase, Chase (2040), Luke + 5 customers (≈ 3–4 each) | ~32 |

Rules: everything static in one Builder per material; customers are five rigs built **once** (`CUST ||=`) and
re-parented on rebuild (distinct looks so no rig-pool clash); snags as one IM with `instanceColor` set at build; one
shared reader canvas; no per-frame allocation.

---

## 12. API summary, data exports, engine notes

```js
SETS.sandgate = {
  env, build, marks, anchors, cams, zones, colliders, props, ambience, update,
  dress(state, opts),          // 'luke26' | 'sizzle26' | 'invite26' | 'gates27' | 'credits'
  sizzle: {                    // thin wrappers over the props for 47-mg-sizzle.js
    snag(i, state), turn(i), reset(),          // i 0..5, x = −7.85 + 0.19·i
    onions(u), stir(),
    build({ bread, snag, onions, sauce }), give(),
    heat(level),                               // hotplate.sizzle
  },
  queue: {
    reset(n),                  // n customers (1..5) placed at q_1…q_n, others hidden at q_enter
    front(),                   // → index of the customer at q_serve (or −1)
    advance(),                 // front customer takes the sandwich → walks `cust_out`; others step up one slot; a
                               //   hidden customer re-enters at the tail from `cust_in` (with an accessory swap the 2nd time)
    count,                     // served so far
    bubble(i, out),            // writes the head+0.4 m world position of customer i into `out` (Vector3) for UI bubbles
  },
  paths: {
    cust_out:  [[-5.6, 0.15], [-9.8, 1.0], [-15.0, 6.5]],
    cust_in:   [[16.0, 6.0], [2.0, 6.5], [-5.6, 4.65], [-5.6, 3.75]],
    arrive:    [[14.0, 5.4], [4.0, 3.0], [-4.6, 0.8]],
    to_portal: [[-2.4, 0.8], [-0.6, -4.0], [0.0, -9.6], [0.4, -11.6]],
  },
};
```

**AUTO dress map**: `{ '2.6': 'luke26', '2.7': 'gates27', 'C': 'credits' }`; otherwise `'luke26'`.

**Dress states**

| key | `luke26` | `sizzle26` | `invite26` | `gates27` | `credits` |
| --- | --- | --- | --- | --- | --- |
| env | `arvo26` | `arvo26` | `arvo26` (content lerps to `gust26`) | `gates27` | `arvo26` |
| customers | 3 (q_1…q_3) | 5, queue live | 2 drifting off | hidden | 3 |
| snags | 6 browning/ready | mini-game | 4 ready, 2 gone | hidden (plate cold) | 6 browning |
| hotplate heat | 0.6 | mini-game | 0.4 | 0 | 0.6 |
| order_build | hidden | live | hidden | hidden | hidden |
| cash tin | shut | open (C40 looking in) | shut | shut | shut |
| fare gates | shut, readers idle | shut | shut | lane 2 `tap3` → open | shut |
| storm build | 0.35 | 0.4 | 0.45 → 0.6 | 0.75 | 0 |
| wind | 0.2 | 0.2 | 0.2 → 1.0 | 0.8 | 0.2 |
| spot | gazebo fill | gazebo fill | gazebo fill | gate pool | gazebo fill |

**Engine notes**: `world.torchAuto` restored in `dress()` for states without a fixed spot (and please reset it in
`showE()`); every preset defines `spot`; customer rigs are not actors (the framing helper ignores them; their
colliders are dynamic boxes as in Rue's reddy).
