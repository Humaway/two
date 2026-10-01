# SET `train` — one 2040 Shorncliffe-line carriage (Sunday 23 December 2040, 16:30, storm)

File `src/17-set-train.js` · `SETS.train` · Scene **2.7 "Shorncliffe Line"** (`2.7_board` from its second beat, the
PLAY "Ticket inspection", `2.7_talk`). Same contract as Rue's `SETS.reddy`
(`ref/rue/05-set-reddy-optus-redcliffe-2026.js`) plus `dress()`, `travel`, `doors()`, `lightning()`, `seat()`, `paths`
(§12). The ticket inspection is **roam** gameplay built from `33-systems.js` (drone + stealth), not a mini-game.

---

## 0. Decisions (read first)

1. **The carriage never moves; the world does.** The carriage interior sits at the origin. Everything outside is a
   **treadmill**: periodic layers translated by `−(offset mod period)` each frame (one `position.z` write per layer, no
   per-instance updates), plus UV-scrolled strips for the track bed and fences. Stations are a platform group that
   slides in and stops exactly at the doors. Unlimited ride length, zero allocation, cameras never leave the carriage.
2. **Eight bays of facing seats (2 + 2), three door vestibules.** The drone boards at the **far (−Z) end** and scans
   bay by bay toward +Z; the three start mid-carriage in bay **B2** and must end in **B4**, the last bay it reaches,
   before the next station (§7.3).
3. **Storm outside, soft blue inside.** Green-grey sky, rain sheets and rain on the glass, lightning; inside, cool LED
   strips (`#bfe0ff`). No world rain system (it would rain inside): `ambience.rain = false`, no preset name contains
   "rain".
4. **Station nameboards are blank** (AR only); the boys only know where they are from the announcements.
5. **Yes yellow is not used**: grab poles are white, the tactile strip is white, the seats are navy and teal.
6. **`dress(state)` applies its env preset** unless `{ keepEnv: true }`. Auto-dress: `'2.7' → 'board27'`.

---

## 1. Purpose and scenes

| Beat | Story time / weather | Env | Dress / travel | What happens |
| --- | --- | --- | --- | --- |
| `2.7_board` (after the gate INSERT on `sandgate`) | 16:30, storm, rain | `platform27` | `board27` · stopped at **SANDGATE** (platform −X, doors open) | TRAIN ANNOUNCEMENT "running three minutes late, for your safety"; "Is Cross River Rail finished?" "Don't."; the PASSENGER opposite leans in: "Is that your son?" "Nephew." "Brother." "Nephew." Doors chime and close; depart |
| (cut) | DEAGON passes | `storm27` | `run27` · cruising | (time skip: one station in) |
| PLAY "Ticket inspection" | 16:40 | `platform27` → `storm27` | `inspect27` · stopped at **BOONDALL** → cruise → arrive **NUDGEE** | the drone boards at the far end; Chase swaps seats, borrows the reindeer, wakes Luka; the drone leaves at Nudgee. Sample **Train chime** at the doors |
| `2.7_talk` | 16:50, darker, heavier rain | `dark27` | `talk27` · cruising | Chase asleep against the window; one locked two-shot side-on; thunder, the carriage lights flicker; "Next station: Fortitude Valley." |

Time card `place`: `Shorncliffe Line`. Music (content): none — "the rhythmic clack of the rails; thunder somewhere" is
this set's ambience.

Set lifetime: preloaded under 2.6's final black (`world.liveMax = 3` keeps `sandgate` for 2.7's first INSERT), current
from `2.7_board`'s second beat, retired after 2.8 (`valley`) is current.

---

## 2. Layout

### 2.1 Axes and conventions

- Metres, **Y up**. Carriage floor **y = 0** (platforms are at floor level). Ceiling 2.30 (centre), coving down to 2.02
  at the walls.
- **+Z = the direction of travel** (toward the city). The treadmill moves the outside world toward −Z.
- **−X = the platform side** at every station (left when facing +Z). +X = the other track and the street side.
- Mark facing `ry`: faces `(sin ry, cos ry)`: `0` faces +Z (forward), `PI` faces −Z (backward), `H` +X, `-H` −X.
- Boxes `[x0, z0, x1, z1]`.

### 2.2 Plan (interior x −1.42…+1.42, z −11.0…+11.0)

```
  +Z (travel, toward the Valley) ↑                        outside: treadmill moves −Z
 +11.0 ┌── end wall B (gangway door, shut) ──┐
 +10.4 │ VESTIBULE B   doors z 8.85…10.15 both sides     camera vest_B
  +8.6 ├▓glass▓▓┤  aisle  ├▓▓glass▓┤
       │ B4 L: [bw ba]│     │[ba bw] R   ← the talk bay: Luka B4Lfw, C40 B4Lbw; Chase asleep B4Rbw
  +6.7 │    [fw fa]   │     │[fa fw]
       │ B3 reindeer man B3Lfw · REINDEER on B3Lb (both seats)
  +4.8 │ B2 TRIO START: Chase B2Rba, C40 B2Rbw, PASSENGER B2Rfw (opposite C40), Luka dozing B2Lbw
  +2.9 │ B1
  +1.0 ├▓▓▓▓▓▓┤        ├▓▓▓▓▓▓┤
       │ VESTIBULE M   doors z −0.65…+0.65 both sides · TEA POINT on the −X partition face (z −0.98)
  −1.0 ├▓▓▓▓▓▓┤        ├▓▓▓▓▓▓┤
       │ A4 · A3 · A2 · A1   (scanned first)
  −8.6 ├▓▓▓▓▓▓┤        ├▓▓▓▓▓▓┤
       │ VESTIBULE A   doors z −10.15…−8.85  ← the drone boards here, from the platform (−X)
 −11.0 └── end wall A ──┘
        x: −1.42 [−1.38 … −0.40 seats] | aisle −0.40 … +0.40 | [+0.40 … +1.38 seats] +1.42
```

### 2.3 Key coordinates

| Thing | Where | Notes |
| --- | --- | --- |
| Shell | interior x −1.42…+1.42, z −11.0…+11.0; outer skin x ±1.55; floor y 0; ceiling 2.30 flat for \|x\| < 0.75, coving to 2.02 at \|x\| 1.42 | |
| LED strips | along the coving at x ±0.80, y 2.26, over each seating section (z −8.6…−1.0, +1.0…+8.6) and the vestibules (short) | `leds` (emissive, unique key) |
| Windows | per bay, both sides: glazing at x ±1.43, y 0.92…1.86, z (z0 + 0.25)…(z1 − 0.25); pillars at bay boundaries | `M.glassRain` (one material, rain-on-glass scroll) |
| Bays | **A1** −8.6…−6.7 · **A2** −6.7…−4.8 · **A3** −4.8…−2.9 · **A4** −2.9…−1.0 · **B1** 1.0…2.9 · **B2** 2.9…4.8 · **B3** 4.8…6.7 · **B4** 6.7…8.6 | bay length 1.9 |
| Seats (per bay, per side) | two 2-seat benches facing each other: bench **f** (faces +Z) cushion z0+0.08…z0+0.54, backrest z0…z0+0.10; bench **b** (faces −Z) cushion z1−0.54…z1−0.08, backrest z1−0.10…z1. Cushion top y 0.45, backrest top 1.22 (white head-cloth on each, a grab handle at the aisle corner) | side L x −1.38…−0.40, side R +0.40…+1.38 |
| Seat positions | window **w** x ±1.12, aisle **a** x ±0.66; f z = z0 + 0.31 (ry 0), b z = z1 − 0.31 (ry PI) | `seat()` §12 |
| Aisle | x −0.40…+0.40 (0.8 m) | the player walks it (radius 0.3) |
| Partitions | glass screens at z −8.6, −1.0, +1.0, +8.6 from x ±0.42 to ±1.42, y 0…1.90, steel top rail | `M.glass` |
| Vestibule doors | A z −10.15…−8.85, M −0.65…+0.65, B +8.85…+10.15; both sides; each a pair of 0.65 leaves with windows (y 1.0…1.85); amber door lamp above each | `doors_*` |
| Grab poles | white, floor to ceiling at (±0.62, −9.5), (±0.62, 0.0), (±0.62, 9.5) | colliders 0.1 sq |
| **Tea point** | wall unit on the M-vestibule face of the −X partition at z −1.0: (−1.00, 1.10, −0.97), 0.40 × 0.45 × 0.12: hot-water tap, cup stack, a pictogram (cup + steam) | `tea_point`: the set's kettle |
| PIDs | small screens over each partition's aisle opening, facing the seats, y 2.05: calm blue gradient + chip glyph (blank) | `pids` |
| End walls | z ±11.0 with gangway doors (shut, a window to the next carriage: a dim painted card) | |
| CCTV dome | ceiling (0, 2.28, 0.0) | static (the drone is the inspector) |

**Platform group** (outside, −X; local z 0 = platform centre, aligned to the carriage centre when stopped)

| Thing | Local |
| --- | --- |
| Platform deck | x −1.65…−7.0, z −50…+50, top y 0; white tactile strip x −1.65…−2.25 |
| Canopy | x −2.4…−6.5, z −30…+30, y 3.4; 8 columns |
| Nameboards (blank) | 3.6 × 0.6 at (−4.0, 2.4, −12) and (−4.0, 2.4, +12), facing +X; AR label = station name |
| Benches, padded bin, lamps | 4 benches at x −5.6; bin (−5.0, 0, 4); 6 lamp posts at x −6.6 |
| Waiting passengers | 5 standing dummies (IM) near z −4…+8 (Sandgate: 8) |
| Back fence + backdrop | x −7.5 fence; station buildings card beyond |

**Treadmill layers** (outside; R = 160 m visible range, fog-limited)

| Layer | Period T | Content (local z covers −R … R + T) | Motion |
| --- | --- | --- | --- |
| `track_bed` | 2.4 (UV) | one quad x −4.0…+8.0, z −160…+160: ballast, sleepers, our rails' edges, the second track's rails at x +4.2 | `map.offset.y = (off / 2.4) % 1` |
| `fences` | 3.0 (UV) | two long quads (h 1.8) at x −7.5 and +10.5: noise-wall panels / chain-link | UV scroll |
| `masts` | 60 | overhead-wire masts with cantilever arms at x −2.6 and +6.8, wires as thin boxes | group `position.z = −(off % 60)` |
| `suburbs` | 480 | east (+X): a parallel street at x +16 (bitumen strip, power poles every 40 m), Queenslanders and low brick houses x 18…48 every ~18 m, trees, a park, a **padded level-crossing** gate; west (−X): houses x −14…−48, trees, and a 120 m **wetland** stretch (dark water channels, mangrove clumps, a heron) for Boondall/Nudgee | group `position.z = −(off % 480)` |
| `street_cars` | inside `suburbs` | 3 hover-cars on the parallel street (local motion +Z 8 m/s on top of the treadmill) | 3 matrices |
| `far` | static | band: low hills west, distant Brisbane CBD towers ahead (+Z, hazy), the bay glint far east; storm dome, cloud cards | clouds UV drift |
| `rain_sheets` | UV | two vertical quads x −6 and +9, 400 × 30 m, alpha streaks | `offset.y += 3·dt`, `offset.x += off·k` |

---

## 3. Look

### 3.1 Palette (spec §14: storm; 2040 interior soft blue)

| Use | Hex |
| --- | --- |
| Storm sky (storm27 / dark27) | `#5d6f68` / `#46544f`; cloud bellies `#3f4a46`, rims `#9aa8a0` |
| Lightning tint | `#e8f0ff` (Reduce Flashing: never above 30% of it) |
| Interior walls / ceiling | cool white `#e6eef4` / `#f0f4f8` |
| LED strips | `#bfe0ff` |
| Seats (moquette) / head-cloths | navy `#22355e` with teal `#2f8a8a` chip-dot pattern / white `#f2f4f6` |
| Floor | grey speckle `#8a9096` with a pale-blue aisle line `#9fc4e0` |
| Poles / handles | white `#f4f6f8` |
| Door lamps | amber `#ffae3a` |
| Exterior wet bitumen / roofs / gums / wetland | `#3a3d40` / iron reds and greys `#8a4a3e` `#7d8a90` / `#4c6a4a` / `#2f3e3a` |
| Platform | concrete `#9a9a94`, tactile white `#e8e8e0`, canopy `#c8ccd0` |
| Passenger chip lights | `#bfe6ff` |
| Reindeer | vinyl brown `#8a5a36`, chest white `#f2ece0`, nose red `#d8323a`, antlers tan `#c8a878`, a tag `#ffffff` |

### 3.2 Materials

- `M.vc` (interior static: shell, seats frames, partitions' frames, doors' static parts; 1 call) · `M.seat` (moquette
  texture on seat cushions/backs; 1 call) · `M.atlas` (PIDs, tea point pictogram, door decals, nameboard blanks,
  reindeer tag, window-in-gangway card) · `M.glass` (Basic 0.18: partitions, door windows) · `M.glassRain` (Basic
  0.35 with `t_raindrops`, offset scrolls — all side windows share it) · `M.led` (emissive, unique key: flicker) ·
  `M.doorLamp` (emissive, unique key) · `M.out` (vertex-coloured Lambert for all treadmill geometry) · `M.track`,
  `M.fence` (scrolling maps, unique keys) · `M.sky*` (Basic `fog: false`: dome, band, clouds, flash) · `M.rain`
  (Basic transparent, alpha streaks).
- Passengers (`pax`): 3 IMs (bodies with `instanceColor`, heads with `instanceColor`, chip lights) — colours set at
  build.
- No vertex snapping, no affine warping, no wobble.

### 3.3 Textures to paint (128–256 px, nearest)

| Texture | Size | Content | Read at |
| --- | --- | --- | --- |
| `t_moquette` | 64 × 64 | navy with small teal chip-dots and a faint wave | seats |
| `t_raindrops` | 128 × 128 | droplets + diagonal rivulets (alpha) | every window |
| `t_track` | 64 × 128 | ballast, sleepers across, rail glints | track bed |
| `t_fence` | 64 × 32 | concrete noise-wall panels with a drain line / chain-link | fences |
| `t_pid` | 64 × 32 | blue gradient, chip glyph (blank) | PIDs |
| `t_teapoint` | 32 × 32 | cup + steam pictogram | tea point |
| `t_tag` | 32 × 16 | luggage tag in biro **TO THE GRANDKIDS** | `s27_reindeer` |
| `t_houses` | 4 cells of 64 × 64 | weatherboard, brick, fibro, Colorbond; lit windows (storm-dark afternoon) | outside |
| `t_band` | 256 × 64, repeat ×4 | alpha silhouettes: hills, CBD towers ahead, a wetland treeline | horizon |
| `t_dome` | 128 × 64 | vertical gradient: dark cloud base to a lighter band at the horizon | sky dome |
| `t_cloud` | 128 × 64 | ragged storm cloud (alpha) | clouds |
| `t_streaks` | 64 × 128 | rain streaks (alpha) | rain sheets |

### 3.4 Lighting rig and fog

```js
env: {
  storm27:    { bg: 0x5d6f68, fog: [0x6f807a, 0.0100], hemi: [0xb9d4ff, 0x3a4048, 1.00], dir: [0xc8d8d0, 0.55, [-6, 8, 2]], spot: [0xe8f0ff, 0], rain: 0 },
  platform27: { bg: 0x6c7e76, fog: [0x7d8c84, 0.0090], hemi: [0xc4dcff, 0x40464c, 1.05], dir: [0xd0dcd4, 0.65, [-6, 8, 2]], spot: [0xe8f0ff, 0], rain: 0 },
  dark27:     { bg: 0x46544f, fog: [0x56645e, 0.0120], hemi: [0xa8c4f4, 0x30363c, 0.95], dir: [0xb4c4bc, 0.40, [-6, 8, 2]], spot: [0xe8f0ff, 0], rain: 0 },
}
```

The hemisphere is the interior's soft blue (LED light); `dir` is the grey daylight coming in through the −X windows.
**The spot is the lightning**: fixed outside the −X windows at (−4.5, 2.6, 7.6) → (−0.5, 1.0, 7.6), angle 0.6,
penumbra 0.8, distance 9, intensity 0 at rest; `lightning(k)` pulses it (§10). The set sets `world.torchAuto = false`
for the whole scene and restores it on retire/`dress('none')`.

---

## 4. Props

| id | Description | Scenes | States / animation (`userData`) |
| --- | --- | --- | --- |
| `doors_L`, `doors_R` | each side's three door pairs (two meshes per side: the +Z-sliding leaves and the −Z-sliding leaves) | 2.7 | `open(u)` 0…1 (leaves slide 0.62 into pockets, 1.4 s); door lamps blink amber while moving |
| `door_lamps` | 6 amber lamps | 2.7 | blink 2 Hz while doors move |
| `leds` | ceiling LED strips | 2.7 | `level(u)`; `flicker(dur)` (pattern table 1, .2, 1, .1, .6, 1 …; Reduce Flashing: a single soft dip to 0.5) |
| `pids` | 4 small screens | 2.7 | static gradient; brighten slightly before announcements (`pulse()`) |
| `tea_point` | hot-water unit (the set's kettle) | 2.7 | save puff (`world.puff('tea_point', …)`) |
| `reindeer` | giant inflatable reindeer: 2.0 m tall incl. antlers, 1.5 long, bulbous brown body, white chest, red nose, a tag | 2.7 | `state('seat' \| 'aisle' \| 'held' \| 'flop')`: `seat` squeezed onto B3Lb (antlers against the ceiling), `aisle` standing in the aisle at a block mark, `held` (via `world.actor('chase').hold('reindeer')` — big hold), `flop` (falls sideways onto the B1L seats after the drone's wait); `wobble()` (squash-and-stretch 0.6 s, a squeak sfx); idle bob ±0.01 in `aisle` |
| `pax` | 30 seated passenger dummies (IM: bodies, heads, chip lights) | 2.7 | `nod(i)` tiny head tilt (heads IM matrix) — ambient: 2 random nods every few seconds; `scanFlash(i)` brightens a chip light when the drone scans it (systems may call) |
| `luka_beard_cover` | (art attachment, not set) | — | Luka's Santa beard pulled up over his eyes while dozing — art/content |
| `platform` | the platform group | 2.7 | positioned by `travel` (§12); `name(label)` sets the AR label of both nameboards |
| `scenery` | treadmill layers (`track_bed`, `fences`, `masts`, `suburbs`, `rain_sheets`) | 2.7 | driven by `travel` |
| `far` | dome, band, clouds, `flash` (a sky-flash quad) | 2.7 | `lightning(k)` |

**Instanced repeats**

| Repeat | Count | Mesh |
| --- | --- | --- |
| Seat benches | 32 benches (merged static; one `M.seat` mesh + frames in `M.vc`) | merged |
| Head-cloths | 64 | merged |
| Passenger dummies | 30 + 8 standing (platform) | 3 + 2 IM |
| Masts (per 60 m period, both sides) | 14 | 1 IM |
| Houses | 88 (walls IM + roofs IM) | 2 IM |
| Trees (gums, jacarandas, mangrove clumps) | 96 | 2 IM (trunk, canopy) |
| Power poles | 24 | 1 IM |
| Street hover-cars | 3 | 1 IM |
| Platform columns / benches / lamps | 8 / 4 / 6 | merged in the platform group |

---

## 5. Marks (`[x, y, z, ry]`, world)

Seated marks: y 0, sit anim `h 0.45`. `seat_<bay><side><row><pos>` for all 64 seats is generated by `seat()` (§12),
e.g. `seat_B2Rbw` = [1.12, 0, 4.49, PI]. The named ones:

**2.7 — `2.7_board`**

| id | value | who |
| --- | --- | --- |
| `s27_c40` | `seat_B2Rbw` [1.12, 0, 4.49, PI] | Chase (2040), window, facing back |
| `s27_chase` | `seat_B2Rba` [0.66, 0, 4.49, PI] | Chase, aisle, beside him |
| `s27_passenger` | `seat_B2Rfw` [1.12, 0, 3.21, 0] | PASSENGER (`passenger_a`) opposite Chase (2040) |
| `s27_luka_doze` | `seat_B2Lbw` [−1.12, 0, 4.49, PI] | Luka across the aisle, asleep against the −X window, beard over his eyes |

**2.7 — PLAY "Ticket inspection"**

| id | value | use |
| --- | --- | --- |
| `s27_chase_up` | [0.0, 0, 4.20, PI] | control: Chase stands into the aisle, facing the far end |
| `s27_reindeer_man` | `seat_B3Lfw` [−1.12, 0, 5.11, 0] | `passenger_b` ("taking it to his grandkids") |
| `rdeer_seat` | [−0.89, 0.45, 6.39, PI] | the reindeer's base on the B3Lb bench |
| `rdeer_aisle_M` | [0.0, 0, 0.0, PI] | **the block**: the reindeer in the M-vestibule aisle (the drone waits at `d27_wait_M`) |
| `rdeer_aisle_B1` | [0.0, 0, 1.95, PI] | alternative block point (drone waits at `d27_wait_B1`) |
| `rdeer_flop` | [−0.89, 0.45, 1.95, H] | where it flops after the wait (B1L seats, kept free) |
| `s27_pax_c` | `seat_B4Rbw` [1.12, 0, 8.29, PI] | `passenger_c` (swap: gives this seat to Chase) |
| `s27_pax_d` | `seat_B4Lbw` [−1.12, 0, 8.29, PI] | `passenger_d` (swap: gives this seat to Chase (2040)) |
| `s27_free_B4` | `seat_B4Lfw` [−1.12, 0, 7.01, 0] | the one free seat in B4 (Luka, once woken) |
| `s27_cp_carriage` | [0.0, 0, 4.20, PI] | stealth checkpoint ("restarting the carriage") |
| `d27_board_out`, `d27_board_in` | [−3.2, 1.9, −9.5], [0.0, 1.95, −9.5] | the drone floats in from the platform through door A (−X) |
| `d27_stop_A1…A4`, `d27_stop_M`, `d27_stop_B1…B4` | (0, 1.95, z) for z −7.65, −5.75, −3.85, −1.95, 0.0, 1.95, 3.85, 5.75, 7.65 | bay centres: scan left (cone −X) then right (+X) |
| `d27_wait_M`, `d27_wait_B1` | [0.0, 1.95, −1.6, 0], [0.0, 1.95, 0.6, 0] | where it waits for the reindeer to "pass" |
| `d27_exit_A`, `d27_exit_M`, `d27_exit_B` | [−3.2, 1.9, −9.5], [−3.2, 1.9, 0.0], [−3.2, 1.9, 9.5] | out through the nearest platform-side door at NUDGEE |

**2.7 — `2.7_talk`**

| id | value | who |
| --- | --- | --- |
| `s27_talk_luka` | `seat_B4Lfw` [−1.12, 0, 7.01, 0] | Luka, window, facing forward |
| `s27_talk_c40` | `seat_B4Lbw` [−1.12, 0, 8.29, PI] | Chase (2040), window, facing Luka |
| `s27_talk_chase` | `seat_B4Rbw` [1.12, 0, 8.29, PI] | Chase asleep against the +X window, earbud in |

---

## 6. Anchors (`{ at, from, fov }`, world)

| id | at | from | fov | for |
| --- | --- | --- | --- | --- |
| `s27_board_three` | [0.90, 1.10, 3.85] | [−0.55, 1.35, 3.85] | 52 | `2.7_board`: across the aisle at Chase (2040), Chase and the PASSENGER (platform and rain through the window behind them) |
| `s27_passenger_ots` | [0.90, 1.15, 4.49] | [1.05, 1.40, 2.80] | 44 | over the PASSENGER's shoulder: "Nephew." "Brother." "Nephew." — the two Chases side by side |
| `s27_platform_wide` | [−3.5, 1.4, 0.0] | [0.9, 1.9, 6.0] | 50 | the platform through the −X windows, blank nameboard, rain, the doors open |
| `s27_doors_chime` | [−1.42, 1.5, 0.0] | [0.6, 1.6, 1.6] | 40 | the M doors closing, amber lamp blinking (sample) |
| `s27_drone_boards` | [−0.6, 1.6, −9.5] | [0.3, 2.05, 1.2] | 40 | long view down the aisle: door A opens, the drone floats in |
| `s27_luka_doze` | [−1.10, 1.15, 4.49] | [−0.25, 1.30, 3.60] | 34 | Luka asleep, beard over his eyes |
| `s27_reindeer` | [−0.89, 1.30, 6.39] | [0.20, 1.50, 5.20] | 44 | the reindeer on the seat opposite the man (tag readable) |
| `s27_reindeer_block` | [0.0, 1.20, 0.0] | [0.25, 1.85, −3.2] | 44 | the drone politely waiting behind the reindeer in the aisle |
| `s27_chase_asleep` | [1.25, 1.10, 8.29] | [0.35, 1.30, 7.55] | 36 | `2.7_talk` open: Chase asleep against the window, earbud in |
| `s27_talk_two` | [−1.12, 1.05, 7.65] | [0.62, 1.22, 7.65] | 50 | **`2.7_talk`: the locked two-shot, side-on** — Luka (screen right, facing left) and Chase (2040) (screen left), the B4 window between and behind them with the storm moving across |
| `s27_window_storm` | [−40.0, 6.0, 20.0] | [−1.00, 1.25, 8.10] | 44 | optional cut: "(looking out of the window)" — the storm and the suburbs from Chase (2040)'s seat |
| `s27_carriage_wide` | [0.0, 1.0, −6.0] | [0.0, 2.10, 10.6] | 50 | establishing / announcement |

---

## 7. Gameplay zones, fixed cams, the inspection

### 7.1 Cams and zones

"Fixed angles down the aisle": high in the corners just under the coving (ceiling height at |x| 0.95 is 2.22, at
|x| 1.10 it is 2.15 — lenses sit ≥ 0.1 below it), chained along the carriage. Zone changes
use the 0.25 s chained-camera ease (`ease: 0.25`, spec §11) if the engine supports it (04-world §15.4 item 1); otherwise
they hard-cut.

```js
cams: {
  aisle_B_far:  { type: 'fixed', pos: [0.95, 2.12, 10.25],  look: [-0.30, 0.55, 1.40],  fov: 46, ease: 0.25 },  // first = default (zone B1–B2)
  aisle_B_near: { type: 'fixed', pos: [-0.95, 2.12, 1.20],  look: [0.30, 0.55, 8.90],   fov: 56, ease: 0.25 },  // B3–B4
  aisle_A_far:  { type: 'fixed', pos: [-0.95, 2.12, -10.25],look: [0.30, 0.55, -1.40],  fov: 46, ease: 0.25 },  // A3–A4
  aisle_A_near: { type: 'fixed', pos: [0.95, 2.12, -1.20],  look: [-0.30, 0.55, -8.90], fov: 56, ease: 0.25 },  // A1–A2
  vest_M:       { type: 'fixed', pos: [1.10, 2.05, 0.85],   look: [-0.90, 0.70, -0.50], fov: 64 },
  vest_A:       { type: 'fixed', pos: [1.10, 2.05, -8.75],  look: [-0.80, 0.70, -10.30], fov: 64 },
  vest_B:       { type: 'fixed', pos: [-1.10, 2.05, 8.75],  look: [0.80, 0.70, 10.30],  fov: 64 },
},
zones: [
  { box: [-1.42, -11.0, 1.42, -8.6], cam: 'vest_A' },
  { box: [-1.42, -8.6, 1.42, -4.8],  cam: 'aisle_A_near' },
  { box: [-1.42, -4.8, 1.42, -1.0],  cam: 'aisle_A_far' },
  { box: [-1.42, -1.0, 1.42, 1.0],   cam: 'vest_M' },
  { box: [-1.42, 1.0, 1.42, 4.8],    cam: 'aisle_B_far' },
  { box: [-1.42, 4.8, 1.42, 8.6],    cam: 'aisle_B_near' },
  { box: [-1.42, 8.6, 1.42, 11.0],   cam: 'vest_B' },
],
```

Readability: from `aisle_B_far` the whole of B1–B2 and, beyond the M partition, the approaching drone are on screen;
the drone's scan cone falls **sideways into a bay** (onto the seats and the people in them), so from a lens straight
down the aisle each cone is a wedge to the left or the right of the aisle — never pointing at the camera.

### 7.2 Colliders

```
side walls (incl. door leaves when shut) [-1.55, -11.0, -1.42, 11.0]  [1.42, -11.0, 1.55, 11.0]
end walls             [-1.55, -11.15, 1.55, -11.0]  [-1.55, 11.0, 1.55, 11.15]
seat blocks (per bay, per side — the player stays in the aisle):
   L: [-1.42, z0, -0.40, z1]   R: [0.40, z0, 1.42, z1]   for each of the 8 bays
partitions            [-1.42, -8.65, -0.42, -8.55] [0.42, -8.65, 1.42, -8.55] … and at z −1.0, +1.0, +8.6
poles                 0.1 sq at (±0.62, −9.5), (±0.62, 0.0), (±0.62, 9.5)
reindeer (dynamic)    [-0.40, z−0.35, 0.40, z+0.35] at its aisle mark while state 'aisle'; parked at 1e4 otherwise
```

Doors never open to the player (the platform is not walkable); when the doors are open their leaves' collider strips are
replaced by 0.1 m invisible strips across the openings.

### 7.3 The inspection (recommended layout and timing — content owns the logic)

| t (s) | Event |
| --- | --- |
| 0 | stopped at **BOONDALL** (`travel.stopNow('BOONDALL')`, `doors(true, 'L')`): the drone floats in `d27_board_out → d27_board_in` |
| 4 | doors chime and close (`doors(false)`, `chime()`); `travel.depart()` |
| 6 → | the drone scans A1, A2 … at each `d27_stop_*`: **2.2 s cone −X, 2.2 s cone +X, 1.2 s glide** = 5.6 s per bay; 2.0 s at M |
| ≈ 37 | it reaches **B2** (the trio's start) if nothing is done |
| 35 | content calls `travel.arrive('NUDGEE', 110)` (≈ 16.9 s of braking) |
| ≈ 52 | stopped at **NUDGEE**: the drone finishes its current side, leaves through the nearest platform-side door (`d27_exit_*`) |

Scan cone: `{ len: 1.9, half: 0.62 }` at y 1.95, pitched down into the bay. **Intended solve**: talk to `passenger_c`
(swap → Chase to B4Rbw), talk to `passenger_d` (swap → Chase (2040) to B4Lbw), wake Luka (`h27_luka` → he walks to
B4Lfw), and borrow the reindeer and stand it at `rdeer_aisle_M`: the drone waits ~8 s at `d27_wait_M`, then the reindeer
`flop`s onto the B1L seats and the drone resumes. With the three in B4 **and** the delay, B4's scan would start at
≈ 55 s > 52 s, so the drone leaves first. Either alone fails (B4 without the delay is scanned at ≈ 47 s; the delay
alone still reaches B2 at ≈ 45 s). Capture → the Safe Room → retry at `s27_cp_carriage` with everything reset (`dress('inspect27')`).

Seat population (`inspect27`): dummies in A1–A4 (16 of 32, alternating), B1 R side (4: B1Rfw, B1Rfa, B1Rbw, B1Rba),
B2 L front pair (B2Lfw, B2Lfa), B3 R side (B3Rfw, B3Rbw, B3Rba), B4 (B4Lfa, B4Lba, B4Rfw, B4Rfa, B4Rba). **Free and kept
free**: B1 L (the flop), B2Lba, B3Lfa, B3Rfa, B4Lfw.

---

## 8. Hotspots

| id | at | r | verb | who | scene | does |
| --- | --- | --- | --- | --- | --- | --- |
| `h27_kettle` | [−1.0, 0, −0.45] | 0.9 | Kettle | any | 2.7 | "Put the kettle on? [YES] [NO]" at the tea point; `world.puff('tea_point')` |
| `h27_chime` | [−0.9, 0, 0.0] | 1.2 | Hold to record | `only: 'chase'`, `sample: 'train'`, `when` `travel.state === 'stopped'` | 2.7 | `chime()` (the three-note door chime) — sample **Train chime**. Also available at BOONDALL before the doors close and at NUDGEE |
| `h27_luka` | actor `luka` | 1.1 | Talk | `only: 'chase'` | 2.7 PLAY | wake Luka (he pushes the beard up) → he moves to `s27_free_B4` |
| `h27_pax_c` | actor `passenger_c` | 1.1 | Talk | `only: 'chase'` | 2.7 PLAY | "Only if you're sure" → swap seats with Chase |
| `h27_pax_d` | actor `passenger_d` | 1.1 | Talk | `only: 'chase'` | 2.7 PLAY | swap seats with Chase (2040) (he moves when Chase asks; content) |
| `h27_pax_b` | actor `passenger_b` | 1.1 | Talk | `only: 'chase'` | 2.7 PLAY | borrow the reindeer → `reindeer.state('held')` |
| `h27_reindeer_put` | [0.0, 0, 0.0] (`rdeer_aisle_M`) | 1.0 | Put it down | `only: 'chase'`, `when` Chase holds it | 2.7 PLAY | `reindeer.state('aisle')` at M (or `rdeer_aisle_B1` via a second spot at [0, 0, 1.95]) |
| `h27_pax_a` | actor `passenger_a` | 1.1 | Talk | any | 2.7 | (no scripted line beyond `2.7_board`; optional) |
| `h27_c40` | actor `chase40` | 1.1 | Talk | `only: 'chase'` | 2.7 | content |

---

## 9. Cutscene needs (shots → geometry that must exist)

**`2.7_board`** (second beat onward; the INSERT at the station gate is on `sandgate`, §9 there)
- The carriage at **SANDGATE**: `travel.stopNow('SANDGATE')`, `doors(true, 'L')`, platform with 8 waiting dummies, blank
  nameboards, rain sheets and rain on the glass, `platform27`.
- TRAIN ANNOUNCEMENT (PA): `pids.pulse()`; `s27_carriage_wide` or `s27_board_three`.
- "Is Cross River Rail finished?" "Don't.": framing-helper TWO on the Chases.
- The PASSENGER leans in (art `lean`): `s27_board_three` → `s27_passenger_ots` for "Nephew." / "Brother." / "Nephew."
- End: `doors(false)` + `chime()`, `travel.depart()`; optional exterior-free cut via `s27_platform_wide` as the platform
  slides away.

**PLAY start**: a cut (time skip) to `inspect27` at BOONDALL; `s27_drone_boards` (door A opening, the drone gliding in
through the gap). **Requires** door A's leaves to open fully on the −X side and the platform deck flush outside.

**Reindeer block**: `s27_reindeer_block` (the drone's amber "?" at the reindeer; DRONE line is content's).

**`2.7_talk`**
1. Establish `s27_chase_asleep`.
2–9. `s27_talk_two` **locked**. Behind them the B4 −X window shows the treadmill (houses, masts, the wetland stretch
   sliding past right-to-left — the scenery moves −Z, which is screen-left-to-right? From this lens (looking −X)
   screen-right is −Z, so scenery moving −Z travels **left → right**), rain on the glass, clouds drifting.
   `travel` cruising; `dark27`.
10. "(Thunder. The carriage lights flicker.)": `SETS.train.lightning(1)` → sky flash, the window spot flash, `leds.flicker(1.2)`,
    `thunder` sfx 0.4 s later. Reduce Flashing: a soft 0.8 s brighten of the windows and a single LED dip.
14. Long beat (3 s): hold the locked frame.
16. "(looking out of the window)": stay locked (preferred) or cut to `s27_window_storm`.
17. TRAIN ANNOUNCEMENT "Next station: Fortitude Valley. ^ Quiet Hours are in effect. ^ Please whisper.": `pids.pulse()`;
    content may begin `travel.arrive('FORTITUDE VALLEY', 160)` under it; the next scene loads `valley` behind black.

---

## 10. Ambience and `update(dt, ctx)`

`ambience: { rain: false, loops: ['rail_clack', 'train_hum', 'rain_roof'], room: 'carriage' }`.

| Travel / state | Loops | Room |
| --- | --- | --- |
| cruising (any) | `rail_clack` (the rhythmic clack; content/audio may scale its rate with `travel.speed / travel.cruise`), `train_hum`, `rain_roof` | `carriage` (small, bright) |
| stopped | `train_idle`, `rain_roof`, `platform_murmur` | `carriage` |
| `talk27` | + `rain_heavy` | `carriage` |

One-shots fired by the set (rate-limited): `door_chime` (the three-note chime — the **Train chime** sample's recipe) on
every `chime()`, `door_slide` on open/close, `thunder_far` 1–3 s after each ambient flash, `thunder` after a scripted
`lightning(1)`, `reindeer_squeak` on `wobble()`.

**`update(dt, ctx)` — no allocation**

1. Scene change → `dress(AUTO[state.scene] || 'board27')`. Env change → LED level (`storm27` 1.0, `platform27` 1.0,
   `dark27` 0.92).
2. **Travel**: state machine `stopped | departing | cruising | arriving` on preallocated fields:
   `departing` v += 1.6·dt to `cruise` (13 m/s); `arriving` v = max(0, v − decel·dt) with `decel = v0² / (2d)`, and on
   reaching 0 snap `platform.position.z` to exactly 0; `off += v·dt`.
3. **Treadmill**: `masts.position.z = −(off % 60)`, `suburbs.position.z = −(off % 480)`; `track_bed`/`fences` map
   offsets; street cars advance in their layer (3 matrices); rain sheets scroll; `M.glassRain` offset (droplets slide
   back with speed: `offset.x += v·0.004·dt`, `offset.y −= 0.03·dt`); platform `position.z` moves with `off` while it is
   placed and hides beyond z −160.
4. Doors ease; door lamps blink while moving; dynamic door/reindeer collider strips written in place.
5. Lightning: ambient flashes from a precomputed interval table (12–25 s; `storm27` and `dark27` only): sky `flash`
   quad opacity 0 → 0.25 → 0 over 0.15 s, no spot. Scripted `lightning(k)`: flash 0.6·k, spot intensity 3·k for 0.1 s
   then 1.2·k for 0.08 s, `dir` boost via `world.env({ dir: [0xe8f0ff, 2.2] })` and back over 0.3 s, `leds.flicker`.
   **Reduce Flashing** (`options.reduceFlashing`): every flash becomes a 0.8 s smooth rise to ≤ 0.3 and fall; no double
   flicker; spot ≤ 0.8.
6. LED flicker pattern (when active): one emissive intensity write per tick.
7. Reindeer bob / wobble; follow the holder handled by the engine's `hold()`.
8. Passenger dummies: two random `nod`s every ~3 s (head IM: 2 matrices); chip lights pulse in instance colour every 0.5 s
   (one `instanceColor.needsUpdate`).
9. Clouds UV drift; dome tint follows the env.

---

## 11. Performance budget (target < 300; expected ≈ 70)

| Group | Draw calls |
| --- | --- |
| Interior static: `M.vc`, `M.seat`, `M.atlas`, `M.glass`, `M.glassRain`, `M.led`, `M.doorLamp` | 7 |
| Doors (4 leaf meshes) | 4 |
| Passenger dummies (3 IM) + platform standing (2 IM) | 5 |
| Treadmill: track bed, fences ×2, masts, houses ×2, trees ×2, poles, street cars, rain sheets ×2 | 12 |
| Platform group (deck/canopy merged + nameboards) | 3 |
| Far: dome, band, clouds, flash | 4 |
| Reindeer | 2 |
| Rigs: Luka, Chase, Chase (2040), passenger_a…d (≈ 3 each) | ~21 |
| Courtesy Drone (content) | ~3 |

Rules: the interior is one Builder (seats merged; 64 head-cloths merged); every outside repeat is an InstancedMesh in its
layer group (the group moves, never the instances); textures ≤ 256 px; `M.glassRain`, `M.led`, `M.track`, `M.fence`
have unique keys (animated); passenger dummy colours via `instanceColor` set at build; no shadow maps (blob shadows under
the standing rigs only); no per-frame allocation.

---

## 12. API summary, data exports, engine notes

```js
SETS.train = {
  env, build, marks, anchors, cams, zones, colliders, props, ambience, update,
  dress(state, opts),     // 'board27' | 'run27' | 'inspect27' | 'talk27' | 'valley27'
  seat(bay, side, row, pos),   // ('B2', 'R', 'b', 'w') → [1.12, 0, 4.49, PI]; marks seat_<bay><side><row><pos> are generated from it
  travel: {
    cruise: 13.0,         // m/s ("running three minutes late, for your safety")
    speed, state,         // read-only: current m/s; 'stopped' | 'departing' | 'cruising' | 'arriving'
    depart(),             // 0 → cruise over ~8 s; the platform slides away and hides
    arrive(name, d = 110),// platform placed d m ahead, constant braking to stop centred on the carriage; returns seconds; name → AR nameboards
    stopNow(name),        // skip-safe: stopped at that platform
    cruiseNow(),          // skip-safe: cruising, no platform
  },
  doors(open, side = 'L'),  // all three door pairs on that side
  chime(),                  // the three-note door chime (also sounds on every doors(false))
  lightning(k = 1),         // scripted flash (Reduce Flashing aware)
  paths: {
    d27_aisle: [[0, -9.5], [0, -7.65], [0, -5.75], [0, -3.85], [0, -1.95], [0, 0], [0, 1.95], [0, 3.85], [0, 5.75], [0, 7.65], [0, 9.5]],
    luka_to_B4: [[-0.66, 4.49], [0, 4.2], [0, 7.0], [-1.12, 7.01]],     // from his dozing seat, via the aisle
    c40_to_B4:  [[1.12, 4.49], [0, 4.2], [0, 8.0], [-1.12, 8.29]],
    chase_to_B4:[[0, 4.2], [0, 8.0], [1.12, 8.29]],
  },
  stations: ['SANDGATE', 'DEAGON', 'BOONDALL', 'NUDGEE', 'FORTITUDE VALLEY'],
};
```

**AUTO dress map**: `{ '2.7': 'board27' }`.

**Dress states**

| key | `board27` | `run27` | `inspect27` | `talk27` | `valley27` |
| --- | --- | --- | --- | --- | --- |
| env | `platform27` | `storm27` | `platform27` → `storm27` on depart | `dark27` | `dark27` |
| travel | `stopNow('SANDGATE')`, doors open L | `cruiseNow()` | `stopNow('BOONDALL')`, doors open L | `cruiseNow()` | `arrive('FORTITUDE VALLEY', 160)` |
| trio | B2 (`s27_c40`, `s27_chase`, `s27_luka_doze`) | B2 | B2, Chase at `s27_chase_up` | B4 (`s27_talk_*`) | B4 |
| passenger_a…d | a B2Rfw, b B3Lfw, c B4Rbw, d B4Lbw | same | same | a B2Rfw, b B3Lfw, c B2Rba, d B2Rbw (swapped) | same |
| reindeer | seat | seat | seat | flop (B1L) | flop |
| dummies | 30 + 8 on the platform | 30 | 30 (+5 on the platform) | 30 | 30 |
| rain | light on glass | medium | medium | heavy (sheets ×1.6) | heavy |
| ambient lightning | off | on | on (after depart) | on | on |

**Engine notes**: the set keeps `world.torchAuto = false` (its spot is the lightning) and restores it on leaving; every
preset defines `spot`; `ease: 0.25` on the aisle cams needs the chained-camera ease in `30-world.js` (04-world §15.4,
item 1) — without it they hard-cut, which is acceptable; the passengers `passenger_a…d` need distinct `LOOKS` (four
rigs in one scene, ARCHITECTURE §3.1 extras `passenger_a…`).
