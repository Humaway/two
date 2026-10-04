# SET `reddy40` — Optus Redcliffe, Christmas 2040

File: `src/11-set-reddy40.js` · id `reddy40` · built with the shared shell from `reddy26`
(`SETS.reddy40 = SETS.reddy26.make('2040', EXT40)`, see `docs/sets/reddy26.md` §13). **The shell's layout,
coordinates, Rue marks, `backroom_wide`, `split_a`, `split_b` and the roam cams are identical to reddy26** — this
document gives the 2040 dressing, the walkable back yard, and everything scenes 1.3 (right half), 1.4, 1.5, 1.6, the
title screen and the B1 2040 frame code against.

---

## 1. Purpose, scenes, time, env, dressing

The same store fourteen years on. The joke is how little has changed (layout, queue machine 000, the LANYARD REQUESTS
paper, the plant, the tree still on the floor); the menace is what has (chips on pillows, blank AR tags, SafeSense,
Courtesy Drones, a locked front door, a drone tower out the back).

| Scene / beat | Story time | Weather / light | `env` | `dress()` | Areas |
| --- | --- | --- | --- | --- | --- |
| 1.3 `1.3_call` split, **right half** | Sat 22 Dec 2040, ~12:03 | backroom only, "darker" | `dim` | `split13` | backroom: machine, Des ECU, four scorch marks |
| 1.4 `1.4_arrival` + PLAY | Sat 22 Dec 2040, 12:04 | 34 °C, clear (storm due at four) | `day` | `arrival` → `store40` | backroom → corridor → floor → counter |
| 1.5 setup / Chip Sale / after | 12:20 | day | `day` | `store40` | counter, terminal, office door |
| 1.6 address | 13:00 | day | `day` | `address` | floor, big screen |
| 1.6 lockdown + PLAY "Get out the back." | 13:00+ | store dims to "safe brightness" | `lockdown` | `lockdown` | floor → staff aisle → corridor → backroom → **back yard** → gate onto Redcliffe Parade |
| Title screen (menus) | dusk | storm over the bay, distant lightning | `dusk` | `title` | exterior, slow 360° orbit, ring of drones |
| B1 montage **2040** frame | Sat 22 Dec 2040, early morning (before the call) | backroom tube only | `dim` | `b1_build` | backroom: machine half-built, Des asks for a name |

Default dress per scene (auto on `state.scene` change, also when this set is a split's right half):
`1.3 → split13`, `1.4 → arrival`, `1.5 → store40`, `1.6 → store40`, `B1 → b1_build`. `address`, `lockdown` and
`title` are explicit `SETS.reddy40.dress(state)` calls (1.6 content; the title code in `31-ui`).

---

## 2. Layout

Shell: exactly reddy26 §2 (metres, Y up, **+Z west/front**, **−Z east/rear to the bay**, +X south). Store floor x −9…11,
z −14.5…0; counter x 3.15…7.85 at z −9.45…−8.55; staff aisle x 2.6…11, z −12.5…−9.45; corridor x 5.4…7.4,
z −12.75…−23.75; office x 7.65…11, z −12.75…−17; backroom x 2.4…10.4, z −30…−24; roller door x 6.6…8.9 in the
back wall; rear wall z −30.25.

**New in 2040: the back yard is walkable** (1.6 only). Footprint of the walkable yard x −6…20, z −30.25…−46
(26 × 15.75 m); everything past the fence is scenery.

```
 -Z (east) ··· bay (z < -60.5) ··· railing z-60 · pelicans ··· palms+lights z-57 ··· road z-48.5..-55 (hover-cars) ··· footpath
 z-46  ┌colourbond────────────────────┬chain-link┬══GATE 9.5..13.5══┬chain-link┬─────colourbond┐
       │ pallets(4.6,-43.2)            6.0       │ ajar: gap 12.1..13.5        17.0      L3(16,-44)│
       │ L2(-1,-44)          drone_e ←→ x7..15.5 at z-43.6                                         │
       │                                                                  hover-van (16.8,-40.5)  │
       │   TOWER (0.5,-39.5)  ping r≤14                                                           │
       │ hover-car(-2.8,-36.4)   drone_d ←→ x1.5..18 at z-37.0        SKIP BIN (12.8,-36.6)       │
x -6   │                                                                       cage (18.4,-33) x20│
       │          apron x2..14, z-30.25..-33        L1 POLE (8.2,-32.6)                           │
 z-30.25└─────rear wall──────── bollard(6.35) [ROLLER DOOR 6.6..8.9] bollard(9.15) ── AC units ───┘
       │ BACKROOM … machine+Des on the front wall (x3.35..5.15) … plant (9.3,-29.55) … (see reddy26 §2)
```

### 2.1 Key coordinates (2040 additions / changes)

| Thing | Coordinates |
| --- | --- |
| Big screen | on the display wall, 4.6 × 1.5, centre (−2.0, 1.85, −14.36), black bezel 0.06; replaces Rue's line-up backboard and the THE LATEST header |
| Display-wall chips | four velvet pillows on the ledge at x −3.35, −2.45, −1.55, −0.65, z −13.95, top y 1.04; "3%" LCD tags + blank price tags at z −13.73 |
| Chip kiosk | where the Hero Table stood: (5.6, 0, −5.3); screen faces +Z |
| Hover-trolley | floats y 0.30 on an ellipse centred (8.6, −3.4), rx 1.3, rz 0.9 |
| Waiting chairs | x 2.0 (**Margaret's**, plaque), 2.65, 3.3; z −0.85; ry π; padded cream |
| Plastic tree | **lying on the floor**: base (9.25, 0, −1.0), top toward −X at (7.65, 0.15, −1.0) |
| Plant | **moved to the backroom**: (9.3, 0, −29.55), beside the roller door; a ring stain on the floor at its old spot (10.3, −0.85) |
| Terminals | two glass SafeSense panels on the counter at x 4.3 and 6.4 (Rue monitor positions) |
| Old counter speaker | the 2026 store radio, dusty, same place (7.55, 1.0, −8.78); **the 1.6 lure source** |
| Counter phone | **gone** (the number rings the kettle now); clean rectangle on the counter top |
| The Machine | against the backroom front wall under the old wall phone: frame x 3.35…5.15, z −24.05…−24.65, h 1.25 |
| Des (the kettle) | on the machine's top shelf at (4.25, 0.95, −24.38); screen faces −Z (into the room) at (4.25, 1.075, −24.47) |
| Scorch marks | P1 (5.3, −26.2), P2 (7.6, −27.3), P3 (5.2, −27.7) "from Christmas", **P4 (7.7, −25.6) "Mine"**; DO NOT PAINT sign still there, yellowed |
| Roller door | jammed: bottom rail at y 0.45 (gap 0.45 m); daylight leaks under it |
| Backroom door | wedged open (rubber wedge at (6.75, 0, −23.95)) |
| Yard fence | colourbond 2.1 m at x −6, x 20, z −46 (x −6…6 and 17…20); chain-link z −46 x 6…9.5 and 13.5…17; sliding gate x 9.5…13.5 |
| Drone tower | (0.5, 0, −39.5), 7.0 m mast, head pod at y 7.3 |
| Pole (the one he walks into) | L1 (8.2, 0, −32.6), 4.5 m steel lamp pole |

---

## 3. Look

**Palette (spec §14, 2040 day):** the 2026 palette slightly cooler — whites `#eef2f6`, navy `#141d3a`, store blue
`#1f6fe0`; **glassy blue-white accent `#bfe6ff`** on chips, chip lights, drones, SafeSense screens; **padded surfaces
in soft cream `#efe6d2`** (chairs, bollard sleeves, table bumpers, kiosk base); deep velvet blue `#2a2f7a` (chip
pillows). Yes yellow `#ffd21f` only on the Yes sign and the scooter battery's end caps. No tinsel (2040 Christmas is
"safe"): cool-white LED strings, a wreath on the Wall, SafeSense Christmas posters, coloured lights round the
Parade palms. Interior tint `[0.84, 0.97, 1.14]` (cooler LED), back-of-house `[0.88, 0.97, 1.08]`, outside as 2026.

**Materials** (shell + new): `screenAddr` (shared canvas: every screen in 'address' mode uses it), `bigAd`, `glassUI`
(terminals, kiosk; emissive, edges transparent), `des` (canvas), `velvet` (vc), `chipGlow` (emissive `#bfe6ff`,
instanced), `ledString` (emissive, instanced), `palmLights` (emissive, instanced), `hover` + `hoverGlow`
(instanced bodies / emissive underglow + lamps), `ringDrone` + `ringLight` (instanced, title), `ping` (additive
`#bfe6ff`), `chain` (alpha-tested chain-link, double), `sky` (vertex-coloured dome, `fog:false`), `cloud` (vertex
colour + emissive for lightning), `bay` (texture scroll).

### 3.1 Textures to paint (text must read at the named anchor)

| Key | Size | Content (exact text in quotes) | Read at |
| --- | --- | --- | --- |
| `fascia40` | 256×64 | Navy, Yes glyph in yellow, beneath it small white italic **"(Are you sure?)"**, "optus", yellow underline. (The Optus sign is physical; neighbours' signs are **blank** grey panels — their names exist only in AR) | `title_front`, orbit |
| `office40` | 256×320 | Printed: **"JORDAN"** · **"— MANAGER —"**; in blue biro under it: **"KNOCK. PLEASE."**; under that, newer biro: **"ESPECIALLY CHASE."** | `office40_sign` |
| `bigAd` | 256×96 | navy → glassy blue gradient; **"THE YES OF YOU"** (white) / **"— NEURAL CHIP 9"** (yellow); a velvet pillow with a chip glyph on the right | `big_screen`, `chip_display` |
| `screenAddr` | 256×128 | **shared by all screens** in mode `address`: bruise-coloured storm sky, the Valley skyline with dimmed magenta/teal neon dots, the dark glass-wall mullions, six white drone dots, a desk edge, the hooded silhouette (head drawn as its own layer for `glance(k)`). **No text, no name.** Mode `safe`: white field, soft blue glow, **"STAY SAFE."** | `big_screen`, `terminal`, `kiosk` |
| `posters40` | 256×192 | Two poster faces 128×192 (same text, two layouts): **"ARE YOU SURE YOU'RE SURE?"** headline / **"STAY SAFE THIS CHRISTMAS"** subline, a padded bauble icon, small "SafeSense" wordmark | `posters40` |
| `plaque` | 256×80 | Brass gradient, engraved: **"MARGARET'S CHAIR"** (bold) / **"Reserved since it was a video shop."** | `margaret_plaque` |
| `notice40` | 256×192 | Cork. **The same LANYARD REQUESTS paper at the same position, pin and rotation as 2026** (top-left (12,12), rot −0.04, red pin), now yellowed (`#e8d27a`, brown edges), same text **"LANYARD REQUESTS / please allow / 6–8 weeks"**; plus "QUIET HOURS 24/7 — THE VALLEY", "SAFE ROOM DRILL · THURSDAYS", "ROSTER" with "Chase — SENIOR CASUAL" (the last two words handwritten) | `noticeboard` |
| `targets40` | 256×192 | **"SAFETY TARGETS"**: Incidents 0, Complaints 0, Calls 0, Raised voices 0 — every bar full green with a tick; "Everyone safe!" | `targets_board` |
| `trolleySign` | 128×32 | yellow card **"CAUTION: TROLLEY"** | `trolley_home` |
| `des` | 256×128 | Des's screen (dark glass, soft blue text ≥ 18 px). States: `off`; `name` **"NAME YOUR KETTLE:"** + blinking cursor (typed letters appear via `type()`); `des` **"DES"** glowing; `boiling` **"DES · Boiling…"** (dots animate); `boil_q` **"Would you like to boil?"** + pill **[YES]**; `boil_yes` the [YES] pill ticked; `tea` **"Tea?"** | `des_screen` |
| `terminal40` | 256×160 | SafeSense glass desktop: a rounded white window "Chip swap" with four rows "Customer · Verify · Swap · Opt in" and a blue pill "NEXT" (idle state; the Chip Sale mini-game draws its own card) | `terminal_screen` |
| `kiosk` | 128×160 | **"NEURAL CHIP 9"** / **"Are you sure?"** / blue pill **[YES]** | `kiosk` |
| `chipLcd` | 32×16 | red **"3%"** | `chip_display` |
| `towerPanel` | 64×64 | **"SIGNAL CHECK"** + a wave icon | `tower` |
| `wallAtlas` | — | reddy26's atlas reused (Polaroid, PUDDING label), drawn with a faded/yellowed vertex tint | `wall40_all` |
| `chain` | 64×64 | chain-link diamonds (alpha test) | — |
| `bay` | 128×128 | water with sparse white glints (scrolls) | — |
| keep (shell) | — | `queue` (000), `sim` (now "CHIP STARTER PACKS"), `slat`, `floor` (cooler), `asphalt`, `atlas` (STAFF ONLY etc.), `keypad`, `clock`, `scorch`, `spin` | — |

### 3.2 Lighting rig and fog

| `env` | `bg` | `fog` | `hemi` [sky, ground, i] | `dir` [colour, i, pos] | spot | interior (set applies on env change) |
| --- | --- | --- | --- | --- | --- | --- |
| `day` | `0x9ad6ff` | `[0xe6e4d6, 0.012]` | `[0xeef6ff, 0xa89a80, 1.1]` | `[0xf6f8ff, 1.6, [3,14,4]]` | free (JARVIS-cam) | panels 0.95 (`#eaf4ff`), chips 0.8, LED string 0.5 |
| `lockdown` | `0x9ad6ff` | `[0xb8c4d8, 0.016]` | `[0xd8e6ff, 0x606a80, 0.75]` | `[0xe6eeff, 1.0, [3,14,4]]` | free | panels 0.45 — darker floor so the **soft-blue scan cones read**; chips 1.0 |
| `dim` | `0x2a3448` | `[0x2a3040, 0.03]` | `[0x9fb0d0, 0x2a2e38, 0.55]` | `[0xb0c4ff, 0.35, [3,14,4]]` | free | panels 0.1; backroom tube steady 1.0 (an LED tube now: no flicker in 2040); machine chips 1.2 |
| `dusk` | `0x2b3f73` | `[0x5a5a7a, 0.010]` | `[0xffc9a0, 0x30304a, 0.7]` | `[0xff9a60, 0.9, [-4,3,14]]` (low sun from the west/front) | free | panels 0.3; Yes sign 1.0; palm lights 1.4; drone ring lights 1.6; `sky_dome` + `storm_clouds` visible |

**Sky/backdrop:** `day`/`lockdown`/`dim` use the flat `bg`; `dusk` shows `sky_dome` (low-poly hemisphere r 300,
vertex colours `#f39a5b` at the west horizon (+Z), `#2b3f73` overhead, `#18264a` over the bay; `fog:false`,
`depthWrite:false`, renderOrder −1) and five flat `storm_clouds` cards over the bay at z −120…−180, y 30–60 with
lightning (§10). The bay plane (z < −60.5), headland silhouette, Parade and palms are shell scenery (reddy26 §3.2);
in 2040 the palms get lights and the road gets hover-cars.

---

## 4. PROPS (2040 dressing and the yard)

All APIs are `userData.*`, allocation-free, and finish instantly when skipping.

### 4.1 Shop floor and counter

| id | Description | Scenes | States / animation |
| --- | --- | --- | --- |
| `big_screen` | §2.1 | 1.4–1.6, title | `show('ad'\|'address'\|'safe'\|'off')`; `glance(k)` k 0→1→0: repaints only the head layer — the head turns a few degrees to **his own left** (he faces camera, so screen-right, toward an unseen empty chair), ≤ 15 Hz, only while k changes |
| `screens_all` | helper group: `big_screen`, both `terminal_*`, `kiosk`, `tv_screen` | 1.6 | `show(mode)` switches every screen at once ("Every screen in the store blinks to the same image") — they share the `screenAddr` canvas, so one repaint updates all |
| `chips_wall` | four pillows + chips + tethers + LCD tags on the display-wall ledge | 1.4–1.6 | chip lights pulse 0.6–1.0 at 0.5 Hz (instanced `chipGlow`) |
| `chips_tables` | 8 pillows+chips on the four display tables (2 each, padded cream bumpers on the tables, blank tent cards) | 1.4–1.6 | pulse |
| `chips_showcase` | 6 pillows+chips on the counter showcase's glass shelf x 4.95…6.25 | 1.4–1.6 | pulse |
| `chip_kiosk` | white pillar: disc base Ø 0.5, column 0.32 × 1.25 × 0.22, glass screen 0.30 × 0.36 at y 1.05–1.41 tilted back 0.2, faces +Z. Collider [5.3,−5.5,5.9,−5.1]. **Sample source "Chip chime"** | 1.4–1.6 | `chime()` — a soft blue ring pulses out from the screen (0.6 s); auto every 12 s while the floor is roamable |
| `hover_trolley` | wire basket 0.55 × 0.45 × 0.9, white handle with `trolleySign`, no wheels, soft blue underglow quad; floats at y 0.30 | 1.4–1.6 | drifts its ellipse at 0.12 m/s facing travel, bob ±0.02; `settle(true)` eases to y 0.02 and stops (1.6 address), `settle(false)` resumes; carries its own hotspot (r 0.9) |
| `posters40` | three SafeSense posters: right wall at z −2.4 and −7.6 (Rue's poster quads) and the corridor poster (x 7.39, z −17.8) | all | static |
| `led_string` | **InstancedMesh, 60** cool-white bulbs along the front transom inside (y 2.5) | all | slow shimmer |
| `chairs_wait40` | (static) padded cream chairs; Margaret's has the `plaque` on its backrest's front face at (2.0, 0.80, −0.64) | all | — |
| `xmas_tree_floor` | the 2026 tree, faded, lying on its side (shell `xmas_tree` in state `fallen`) | 1.4 | static |
| `terminal_l`, `terminal_r` | glass SafeSense panels 0.5 × 0.32 on thin stands at x 4.3 / 6.4, z −9.0, screens face −Z (staff) | 1.5 | `show('idle'\|'address'\|'safe'\|'off')` |
| `counter_speaker` | = shell `store_radio` (dusty, LCD dark) | 1.6 | `playing` → cones pulse, LCD shows "AUX" |
| `front_doors` | shell doors + a small lock light box above at (−2.0, 2.68, −0.18) | 1.6, title | `lock(true\|false)`: light green → red, soft clunk is content's SFX; while locked, doors never open (also not for drones unless `door_l.hold(true)`) |
| `locals` | four pooled rigs (look ids `local40_a…d`, chip lights): `local40_a` woman staring at nothing (−6.3, 0, −6.4, −π/2); `local40_b` man at the left table (−3.4, 0, −9.4, −π/2); `local40_c` old man **seated next to Margaret's chair** (2.65, 0, −0.85, π); `local40_d` teen by the posters (9.6, 0, −5.0, π/2) | 1.4–1.6 | idle "staring" (tiny sway, no browsing); `lookUp(on)` all turn their heads/bodies to the big screen and tilt up; `pulse(on)` chip lights pulse in sync; `applaud(on)` polite slow clap (`local40_c` doesn't clap: he cries quietly, smiling — content sets his expression) |
| `jordan_office_door` | shell `office_door` with `office40` | 1.4, 1.5 | open in 1.5 (Jordan watches from it) |
| `the_wall40` | corridor left wall (x 5.415), same slots as 2026: **Polaroid** (5.415, 1.62, −19.55) and **PUDDING cassette** box frame (5.43, 1.58, −20.05), both faded; at the MISSING slot a dark frame 0.42 × 0.32 (landscape, its face is **never textured or shown**) at (5.415, 1.55, −20.95) under a **Christmas wreath** Ø 0.55 (vertex-coloured greenery ring, red bow, hung from a nail at y 1.86) that covers it completely; pale unfaded rectangles where the note (z −20.45) and the hold flyer (z −21.5) used to hang | 1.4 | static; the wreath never lifts (the "lift" verb only triggers CHASE (2040)'s line) |

### 4.2 Backroom

| id | Description | States / animation |
| --- | --- | --- |
| `machine` | Old chrome display-gondola frame x 3.35…5.15, z −24.05…−24.65, h 1.25, shelves at y 0.12 / 0.62 / 0.95. **Four display Neural Chips in tethered cradles** on short posts at x 3.6, 3.9, 4.6, 4.9 (y 1.0–1.04, pillow + chip + glow + black coiled tether + "3%" tag). **Hover-scooter battery** on the bottom shelf (4.25, 0.12, −24.35): 0.55 × 0.28 × 0.30, grey, Yes-yellow end caps, 5-LED charge bar. **Nest of cables** (40 thin segments, merged) in 2040 colours — teal-ish `#2aa6a0`, warm grey `#8a8178`, Yes yellow, "the other blue" `#4f6fd8`, plus black/red — from the chips into Des, the battery, the open junction box (4.3, 0.95) and up to the yellowed wall phone (4.3, 1.45), whose handset hangs on its hook with the cord running into the machine. Collider [3.3,−24.7,5.2,−24.0] | `set('built'\|'half')` — `half` (B1): frame, Des, battery, chips at x 3.6 and 3.9 only; the other two chips in small white boxes on the floor at (5.0, 0, −25.0) and (5.25, 0, −24.85); cables in a loose coil on the floor at (4.6, 0, −25.1). `flare(on)`: chips 2.0 + Des screen bright + battery LEDs chase (the call / arrival). Idle chips pulse |
| `des` | Chrome kettle on the top shelf: body tapered cylinder r 0.085→0.075, h 0.24, handle on +X, spout on −X, base puck with a blue ring light; **screen** quad 0.07 × 0.035 on the −Z face at y 1.075, `des` canvas | `screen(state)` (§3.1); `type(text, dur)` types letters into the `name` state (B1 "DES"); `boil()` → `boiling` + steam puff (engine `puff`) + ring light brightens, then clicks off to `des`; `glow(on)` |
| `wall_phone40` | the 2026 wall phone, yellowed; `jbox_lid` open | static |
| `plant40` | Rue's plastic plant model, browner, at (9.3, 0, −29.55). Collider [9.0,−29.85,9.6,−29.25] | static |
| `scorch` | shell decals; count 4 (P1–P4) | `count(n)`: 4 default; **3 in `b1_build`** (P4 is made when Chase (2040) leaves) |
| `do_not_paint` | the 2026 sign, yellowed | static |
| `roller_door` | shell shutter | `set(gap)` metres (0…2.3), eased 0.25 s; `slam()` drops to 0 in 0.35 s with a 3 cm bounce; `userData.gap` readable. **Collider is solid while gap < 1.2 m.** `jammed` = 0.45 (default 2040) |
| `door_light_leak` | warm emissive strip on the floor inside under the door (x 6.6…8.9, z −29.98…−29.6), opacity ∝ gap | follows `gap` |
| `door_wedge` | rubber wedge holding the backroom door open | visible in `store40`, `arrival`, `address`, `lockdown`, `split13` |
| `tv_screen` | shell TV | `show('off'\|'address'\|'safe')` |
| `smoke_backroom` | shell instanced puffs | `amount(k)`: `arrival` starts 1.0; content eases to 0 |
| `kitchen40` | (static) the kitchenette without a kettle: a clean ring on the benchtop where one stood, three mugs | — |

### 4.3 Back yard (walkable in 1.6) and outside

| id | Description | States / animation |
| --- | --- | --- |
| `yard_static` | (merged) apron, asphalt, line markings (hatched NO STANDING by the roller door), colourbond + chain-link fences with posts every 2.5 m, two yellow steel bollards beside the roller door (6.35 and 9.15, z −30.6), three lamp poles L1 (8.2, −32.6) **[the pole]**, L2 (−1.0, −44.0), L3 (16.0, −44.0), neighbours' rear doors (x −3.0, 13.5, 18.0), AC condensers (11.0 / 15.0, z −30.6), a security light over the roller door (7.75, 3.0, −30.35), pallet stack (4.6, −43.2) 1.2 × 1.0 × 1.0, recycling cage (18.4, −33.0) 1.4 × 1.8 × 1.0. Colliders for all | — |
| `yard_gate` | chain-link sliding panel 4.0 × 2.0 on a ground track at z −46 | `set('ajar'\|'shut'\|'open')` — **`ajar` (1.6): slid 1.4 m toward −X, gap x 12.1…13.5**; collider follows |
| `drone_tower` | base cabinet 0.9 × 1.1 × 0.7 (cream, `towerPanel` facing +X), lattice mast 0.5→0.3 m to 7.0 m, white head pod r 0.5 at y 7.3, scanner ring r 0.75, six `#bfe6ff` lights. Collider [0.0,−40.0,1.0,−39.0] | scanner ring rotates 0.8 rad/s; `ping()` (auto every 3.0 s while `on`): flat ring at y 0.03 grows r 0 → 14 in 2.4 s, opacity 0.6 → 0; `alert(on)` → lights and the next pings amber (content calls on "Signal detected"); `on(bool)` |
| `skip_bin` | green skip 2.0 (x) × 1.3 (h) × 1.3 (z) at (12.8, 0, −36.6), yellow lift brackets. **Pushable by Luka** along X (cover against drone_d's cone); collider moves with it | `push(dx)` (systems call; clamped x 9.5…16.5) |
| `hover_parked_yard` | white hover-van at (16.8, 0.3, −40.5) facing −Z (2.0 × 1.9 × 4.6) and a hover-car at (−2.8, 0.3, −36.4) facing +X — instances of `hover_cars` | bob ±0.02 |
| `hover_cars` | **InstancedMesh ×13** (body) + **×13** (`hoverGlow`: underglow + lamps): 2 parked in the yard, 3 parked in the front car park (bays at x −10.25, 6.25, 8.95, z 9.3), 2 gliding on the front road (z 29.6 / 32.4), 4 gliding on the Parade (lanes z −50.2 / −53.3), 2 spare | parked bob; moving ones glide x −70…70 at 4–6 m/s and wrap; facing travel |
| `bollard_pads` | (static) cream foam sleeves on Rue's five front bollards; padded bollards along the Parade kerb every 3 m (merged) | — |
| `palm_lights` | **InstancedMesh, 8 palms × 24 = 192** warm coloured bulbs spiralled round the Parade palm trunks (z −57, x −24…24 every 8 m) and Rue's 5 front palms (+120 → total **312**) | twinkle 4 Hz (instanceColor); brightness per env |
| `drone_ring` | **InstancedMesh ×32** Courtesy Drone bodies (04-art's drone geometry, merged once) + **×32** `ringLight` dots: ring centre (1.0, 0, −14.0), r 30, y 5.0 | `title` only: circles at 0.035 rad/s, each bob ±0.15 m on its own phase, all face the store; matrices written from preallocated Vector3/Quaternion/Matrix4 |
| `pelicans` | 2 on the foreshore railing (4.0, 1.05, −60.0) and (15.0, 1.05, −60.0); 1 gliding a loop r 25 round (0, 14, −90) | idle bob / head turn / bill clack every 8–15 s; glider banks |
| `storm_clouds` | 5 flat cloud cards (vertex-coloured bruise grey/purple) over the bay | `dusk` only; lightning (§10) |
| `sky_dome` | §3.2 | `dusk` only |

---

## 5. MARKS — `[x, y, z, ry]`

All reddy26 shell marks exist here with the same coordinates (`counter_luka`, `counter_customer`, `office_door`,
`backroom_door_in`, `floor_luka`, `floor_chase`, `kettle` (unused in 2040 — Des replaces it) …).

| id | Position | Used by |
| --- | --- | --- |
| `s14_pile_chase` | [6.2, 0, −27.2, 0.4] | 1.4 arrival: Chase at the bottom of the heap ("…Yes, please.") |
| `s14_pile_luka` | [6.7, 0, −26.8, −2.1] | 1.4 heap |
| `s14_pile_c40` | [6.4, 0, −27.5, 1.2] | 1.4 heap |
| `s14_c40_point` | [6.0, 0, −25.7, π] | 1.4 "Yours. ^ Also yours…" — points at anchors `scorch_1…4` in order P1, P2, P3, P4 |
| `s14_luka_look` | [7.3, 0, −26.4, −2.6] | 1.4 looking round |
| `s14_chase_look` | [6.8, 0, −27.6, 2.2] | 1.4 looking round / at the plant |
| `s14_chase_machine` | [5.0, 0, −25.7, −0.35] | 1.4 "You built it out of displays." (facing the machine) |
| `s14_c40_switch` | [5.7, 0, −24.55, 0] | 1.4 flicks the light switch (facing the front wall) |
| `s14_luka_kettle` | [4.9, 0, −25.3, −0.4] | 1.4 "Why's your kettle called Des?" |
| `s14_start_chase` | [6.4, 0, −25.6, 0] | 1.4 PLAY start (player Chase); Luka follows |
| `s14_c40_wait` | [8.4, 0, −7.6, −2.6] | 1.4 Chase (2040) walks ahead and waits by the counter |
| `s14_jordan` | [6.4, 0, −10.0, 0] | 1.4/1.5 Jordan (2040) behind the counter |
| `s14_meet_chase` | [6.2, 0, −7.75, π] | 1.4 "Chase! You're forty minutes late—" (trigger zone [3.2,−8.55,9.0,−6.6] for player Chase) |
| `s14_meet_luka` | [5.2, 0, −7.1, π] | 1.4 Luka behind Chase; Jordan "goes pale" at him |
| `s14_c40_between` | [5.75, 0, −7.5, 2.8] | 1.4 Chase (2040) steps between Jordan's line of sight and Luka |
| `s14_aside_jordan` | [9.75, 0, −11.6, −2.3] | 1.4 Jordan takes Chase (2040) aside (by the office door) |
| `s14_aside_c40` | [9.2, 0, −11.0, 0.8] | 1.4 |
| `s14_chips_chase` / `s14_chips_luka` | [5.3, 0, −7.95, π] / [4.6, 0, −7.95, π] | 1.4 pretending to look at chips (the showcase) |
| `s15_c40_terminal` | [6.4, 0, −10.0, 0] | 1.5 Chase (2040) at the terminal (POV / TOP-DOWN) |
| `s15_chase_side` | [5.6, 0, −10.2, 0.4] | 1.5 "…Move." |
| `s15_chase_terminal` | [6.4, 0, −10.0, 0] | 1.5 Chip Sale (player Chase) |
| `s15_c40_aside` | [7.3, 0, −10.35, −0.4] | 1.5 Chase (2040) beside him (SWAP for Chip View) |
| `s15_luka` | [5.0, 0, −7.5, −0.6] | 1.5 Luka watching, customer side |
| `s15_jayden_door` | [−2.0, 0, −1.2, π] | 1.5 Jayden stomps in |
| `s15_jayden_counter` | [6.4, 0, −7.85, π] | 1.5 Jayden at the counter (= `counter_customer`) |
| `s15_jordan_pass_a` / `_b` | [9.9, 0, −11.9, 0] / [9.0, 0, −6.2, 0.3] | 1.5 "Chase, you're on the floor till one." (passing) |
| `s15_jordan_watch` | [9.85, 0, −12.25, −2.5] | 1.5 "He's good." (watching from the office door) |
| `s16_addr_luka` | [1.6, 0, −6.55, −2.65] | 1.6 watching the big screen |
| `s16_addr_chase` | [2.25, 0, −6.2, −2.7] | 1.6 |
| `s16_addr_c40` | [2.85, 0, −6.95, −2.6] | 1.6 |
| `s16_addr_jordan` | [3.8, 0, −7.3, −2.6] | 1.6 Jordan stops; doesn't clap |
| `s16_jordan_close` | [3.35, 0, −7.35, −0.64] | 1.6 "Back door. ^ Go. ^ I didn't see you." (beside Chase (2040), not looking at him) |
| `d_in_a` / `d_in_b` / `d_in_c` | [−2.6, 1.8, 5.0] / [−2.0, 1.9, 5.6] / [−1.4, 1.8, 5.0] | 1.6 drone entry starts (outside); through the doors (`door_l.hold(true)` for 2 s) to `d_in_mid` [−2.0, 1.8, −2.5], then to posts |
| `s16_cp_floor` | [1.6, 0, −8.6, −2.8] | stealth checkpoint 1 (start) |
| `s16_cp_alcove` | [1.95, 0, −13.1, π/2] | checkpoint 2: the alcove between the display wall and the aisle opening (out of every cone) |
| `s16_cp_backroom` | [6.4, 0, −25.2, π] | checkpoint 3 |
| `s16_cp_yard` | [7.75, 0, −31.4, π] | checkpoint 4 |
| `s16_zap_luka` | [2.2, 0, −10.9, π/2] | 1.6 the zap: Luka at the aisle opening watching the cones, "Go left—" |
| `s16_zap_chase_from` / `_to` | [2.9, 0, −10.5, π/2] / [3.3, 0, −11.45, 2.2] | 1.6 Chase steps "left" (−Z) into `drone_b`'s courtesy field (content places drone_b at [3.85, 1.7, −11.75] for the beat) |
| `s16_speaker` | [7.85, 0, −8.05, π] | 1.6 Chase plays a sample through the old counter speaker (customer side) |
| `s16_wait_luka` / `s16_wait_c40` | [1.95, 0, −13.1, π/2] / [1.6, 0, −13.6, π/2] | 1.6 the others wait in the alcove while Chase sets the lure |
| `s16_roller_luka` | [7.75, 0, −29.55, π] | 1.6 Luka lifts the roller door (strain) |
| `s16_roller_under_1` / `_2` | [7.2, 0, −30.9, π] / [8.3, 0, −30.9, π] | 1.6 Chase, Chase (2040) through under the door |
| `s16_roller_luka_out` | [7.75, 0, −31.4, π] | 1.6 Luka lets go and rolls under before it slams |
| `s16_chip_prompt` | [7.0, 0, −31.6, π] | 1.6 "Switch chip off? [YES] [NO]" over Chase (2040) |
| `s16_bonk_from` / `s16_bonk_at` | [7.4, 0, −31.6, 2.47] / [8.0, 0, −32.35, 2.47] | 1.6 "Aeroplane mode." → walks straight into pole L1 |
| `s16_gate` | [12.8, 0, −45.6, π] | 1.6 exit onto Redcliffe Parade |
| `b1_c40_wire` | [4.25, 0, −25.15, 0] | B1 2040 frame: Chase (older) crouched wiring the machine |

---

## 6. ANCHORS — `{ at, from, fov }`

Shell anchors (identical to reddy26): `backroom_wide`, `split_a`, `split_b`, `backroom_door`, `backroom_window`,
`corridor_wide`, `noticeboard`, `queue_machine`, `targets_board`, `display_wall`, `doors`, `door_sign`, `keypad`,
`accessories`, `sim_rack`, `office_door`, `yes_wall`, `front_glass`, `sign`, `sky`, `tv`, `bench`, `lost_property`,
`wall_clock`, `clock_floor`, `ots_chase`, `ots_luka`, `ceiling_corner`, `store_back`, `luke_call`, `wall_polaroid`,
`wall_cassette`, `wall_all` (as `wall40_all`). Rue's `monitor` / `monitor_screen` are kept and aliased as
`terminal` (JARVIS-cam, behind the screen looking out at the face) / `terminal_screen`.

| id | at | from | fov | Shot |
| --- | --- | --- | --- | --- |
| `des_screen` | [4.25, 1.075, −24.47] | [4.25, 1.085, −24.78] | 22 | ECU Des's screen (1.3 right half, 1.4 step 1, B1) |
| `des` | [4.25, 1.08, −24.4] | [4.45, 1.25, −25.05] | 30 | CLOSE · the kettle, DES glows |
| `machine40` | [4.25, 0.85, −24.35] | [5.6, 1.45, −26.4] | 42 | MID · the machine |
| `b1_machine` | [4.25, 1.0, −24.4] | [5.7, 1.5, −26.2] | 44 | B1 2040 frame |
| `scorch_tilt` | [6.3, 2.8, −26.6] | [6.9, 1.1, −24.6] | 55 | TILT UP from the heap to the four marks |
| `scorch_1` … `scorch_4` | [5.3,2.79,−26.2] · [7.6,2.79,−27.3] · [5.2,2.79,−27.7] · [7.7,2.79,−25.6] | — | — | look/point targets (Yours · Also yours · from Christmas · Mine) |
| `plant40` | [9.3, 0.8, −29.55] | [8.3, 1.3, −28.6] | 38 | CLOSE · the plastic plant, in a corner now |
| `backroom_front` | [5.2, 1.3, −24.2] | [8.9, 1.9, −29.3] | 55 | WIDE · he flicks the switch (nothing changes) |
| `big_screen` | [−2.0, 1.85, −14.35] | [−2.0, 1.75, −10.4] | 32 | MID · the big screen (the address, the glance) |
| `chip_display` | [−2.0, 1.08, −13.95] | [−2.0, 1.45, −12.4] | 36 | chips on pillows, 3% ×4 |
| `price_tag` | [0.4, 0.95, −4.95] | [0.9, 1.35, −4.15] | 30 | a blank tent card |
| `margaret_plaque` | [2.0, 0.80, −0.64] | [2.0, 1.02, −1.25] | 28 | the plaque |
| `wall_wreath` | [5.42, 1.55, −20.95] | [6.3, 1.6, −20.95] | 34 | the wreath over something rectangular |
| `office40_sign` | [9.9, 1.55, −12.59] | [9.9, 1.58, −11.85] | 32 | JORDAN — MANAGER… ESPECIALLY CHASE. |
| `tree_floor` | [8.45, 0.25, −1.0] | [7.2, 1.3, −2.4] | 42 | the same tree, on the floor |
| `trolley_home` | [8.6, 0.6, −3.4] | [7.0, 1.4, −1.6] | 40 | the hover-trolley (content may re-aim at the prop) |
| `kiosk` | [5.6, 1.23, −5.2] | [5.6, 1.45, −4.4] | 32 | kiosk screen / chip chime |
| `speaker` | [7.55, 1.1, −8.78] | [7.4, 1.45, −8.05] | 32 | the old counter speaker |
| `doors_lock` | [−2.0, 1.4, −0.2] | [3.4, 2.2, −7.2] | 50 | WIDE · doors lock, three drones float in; the trio in the foreground |
| `s16_pan` / `s16_pan_end` | [−6.3, 1.4, −6.4] / [2.65, 1.05, −0.9] | [6.8, 1.75, −3.2] (both) | 46 | PAN across the store: from `local40_a` to the old man by Margaret's chair |
| `s16_floor_wide` | [1.0, 1.0, −8.0] | [10.4, 2.9, −0.8] | 56 | WIDE · the store floor (screens blink, chip lights pulse, trolley settles) |
| `roller` | [7.75, 1.0, −30.0] | [6.6, 1.6, −27.6] | 46 | Luka strains at the door ("Let me—" / "I've got it.") |
| `roller_out` | [7.75, 0.6, −30.25] | [9.6, 1.3, −33.2] | 44 | outside: rolling under before it slams |
| `tower` | [0.5, 6.8, −39.5] | [5.8, 1.6, −33.0] | 40 | the drone tower pinging |
| `pole_bonk` | [8.2, 1.6, −32.6] | [6.2, 1.5, −33.6] | 40 | he walks into the pole |
| `gate` | [11.5, 1.2, −46.0] | [10.5, 1.8, −41.5] | 45 | the gate, the Parade beyond (a hover-car passes) |
| `title_center` | [1.0, 2.5, −14.0] | [1.0, 16.0, 30.0] | 38 | **title orbit**: `cam.shot({ shot:'INSERT', at:'title_center', move:'orbit', from:0, to:360, dur:240 })` (radius 44, height 16 — clears every roof) |
| `title_front` | [−2.0, 3.5, 0.0] | [6.0, 4.5, 24.0] | 40 | static fallback title frame: lit Yes sign, ring of drones, dusk |

---

## 7. Dressing states — `SETS.reddy40.dress(state, opts)`

| key | `store40` | `arrival` | `address` | `lockdown` | `split13` | `title` | `b1_build` |
| --- | --- | --- | --- | --- | --- | --- | --- |
| big_screen / screens_all | ad | ad | **address** | safe | ad | off | off |
| locals | idle | idle | lookUp + pulse | idle (frozen, safe) | hidden | hidden | hidden |
| hover_trolley | drifting | drifting | **settled** | settled | drifting | settled | hidden |
| front_doors | open/auto | auto | auto | **locked** | auto | locked | locked |
| machine | built | built (flare 2 s) | built | built | built (flare) | built | **half** |
| des screen | des | **boiling** | des | des | **boil_q** | off | **name** |
| scorch count | 4 | 4 | 4 | 4 | 4 | 4 | **3** |
| smoke_backroom | 0 | **1.0** | 0 | 0 | 0 | 0 | 0 |
| roller_door gap | 0.45 | 0.45 | 0.45 | 0.45 | 0.45 | 0.45 | 0.45 |
| backroom door | wedged | wedged | wedged | wedged | wedged | shut | shut |
| yard_gate | ajar | ajar | ajar | ajar | ajar | shut | shut |
| drone_tower | on | on | on | on | on | on | on |
| drone_ring | — | — | — | — | — | **on** | — |
| store lights (panels) | per env | per env | per env | per env | per env | 0.3 | per env |
| zone table | ROAM | ROAM | ROAM | **STEALTH** | ROAM | ROAM | ROAM |

`dress()` swaps the exported `zones` array **in place** (splice the ROAM or STEALTH table in; no per-frame allocation).
Courtesy Drones are **not** set props: content spawns them with `DRONES.spawn` using the marks/paths in §8.

---

## 8. GAMEPLAY ZONES, FIXED CAMS, DRONES

### 8.1 Roam (1.4, 1.5) — identical to reddy26 §9

Same 13 zones and cams (`staff`, `corridor`, `office`, `backroom`, `backroom_rev`, `entrance`, `counter`, `aisle`,
`accessories`, `shopfront`, `carpark`). The roller door is solid (gap 0.45), so the yard is unreachable.

### 8.2 Stealth (1.6, `lockdown`) — every walkable area, one fixed camera each, cones readable

All `type: 'fixed'` (no pan: the frame must not move while the player reads a cone).

| Cam | pos | look | fov | Why |
| --- | --- | --- | --- | --- |
| `st_floor` | [10.7, 3.0, −0.5] | [1.0, 0.0, −8.8] | 60 | high front-right corner: the whole customer floor, the counter front, the aisle opening |
| `st_back` | [−8.6, 3.0, −9.0] | [0.5, 0.0, −12.4] | 55 | high over the accessories wall: display-wall end, the alcove (checkpoint 2) at frame right |
| `st_staff` | [10.85, 3.0, −9.6] | [3.2, 0.0, −11.4] | 52 | down the staff aisle from its right end: **drone_a/drone_b crossing cones run left–right across the frame**, the corridor mouth on the right, the lure cluster under the lens |
| `st_corridor` | [6.4, 2.55, −12.95] | [6.4, 0.0, −22.0] | 44 | down the corridor from its mouth (low ceiling 2.7): **drone_c's cone is a fan on the floor ahead of it** |
| `office` | Rue's pan | | 55 | (hiding spot) |
| `backroom` | [3.2, 2.1, −24.3] | [6.8, 0.9, −28.6] | 55 | the roller door is centre frame |
| `backroom_rev` | Rue's pan | | 55 | the machine corner |
| `cp_dock` | [2.6, 4.6, −30.7] | [10.5, 0.0, −35.5] | 55 | on the rear wall left of the roller door: apron, the chip prompt, the pole |
| `cp_lot` | [17.5, 4.8, −30.8] | [5.0, 0.0, −41.5] | 55 | on the rear wall's right end: the lot, the tower's pings, drone_d's sweep, the skip bin, the gate far side |
| `cp_gate` | [12.0, 3.4, −50.0] | [9.5, 0.3, −40.5] | 50 | from the Parade footpath through the chain-link/gate: drone_e's beat, the last dash |

| # | Zone box [x0, z0, x1, z1] | Cam |
| --- | --- | --- |
| 1 | [2.6, −12.5, 11, −9.45] | st_staff |
| 2 | [5.4, −12.75, 7.4, −12.5] | st_staff |
| 3 | [5.4, −23.75, 7.4, −12.75] | st_corridor |
| 4 | [7.4, −17, 11, −12.5] | office |
| 5 | [2.4, −26.2, 5.2, −23.75] | backroom_rev |
| 6 | [2.4, −30, 10.4, −23.75] | backroom |
| 7 | [6.6, −30.25, 8.9, −30.0] | cp_dock (under the roller door) |
| 8 | [6.0, −46.0, 17.0, −41.5] | cp_gate |
| 9 | [−6.0, −35.0, 20.0, −30.25] | cp_dock |
| 10 | [−6.0, −46.0, 20.0, −35.0] | cp_lot |
| 11 | [−9, −14.5, 2.6, −9.45] | st_back |
| 12 | [−9, −9.45, 11, 0] | st_floor |

### 8.3 Drone posts, paths and lure points (for `DRONES.spawn`)

| Drone | Spawn / post | Path (ping-pong) | y | speed | cone {len, half} | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `drone_a` | [3.6, 1.7, −10.45] heading +X | [[3.6,−10.45],[10.2,−10.45]] | 1.7 | 0.9 | {2.6, 0.45} | staff aisle; crosses drone_b at x ≈ 6.9 every ~7.3 s |
| `drone_b` | [10.2, 1.7, −11.75] heading −X | [[10.2,−11.75],[3.6,−11.75]] | 1.7 | 0.9 | {2.6, 0.45} | staff aisle; the zap drone |
| `drone_c` | [6.4, 1.6, −15.2], face π (toward the backroom) | parked | 1.6 | — | {2.8, 0.42} | covers corridor z −15.2…−18.0; after its first lure it returns to `post_c2` [9.8, 1.6, −10.95], face −π/2, so nobody is trapped in the corridor |
| `drone_d` | [1.5, 1.8, −37.0] | [[1.5,−37.0],[18.0,−37.0]] | 1.8 | 1.0 | {2.8, 0.5} | yard: sweeps across the route; the skip bin breaks its cone |
| `drone_e` | [15.5, 1.8, −43.6] | [[7.0,−43.6],[15.5,−43.6]] | 1.8 | 0.8 | {2.6, 0.45} | yard: in front of the gate |

**The lure (counter speaker):** `DRONES.lure([7.55, 1.1, −8.78], sampleId)`. Investigation hover points facing +Z
(over the counter's right end, cones onto the empty floor): `lure_1` [7.15, 1.7, −10.0], `lure_2` [7.95, 1.7, −10.05],
`lure_3` [7.55, 2.0, −10.6]. Distances from the speaker: drone_c 6.5 m, drone_a/b ≤ 5.2 m. **Requirement for the
scene writer:** the speaker amplifies — a lure through it must use `r ≥ 7 m` (e.g. `max(sample.r × 2, 7)`) so every
sample Chase can have here (alarm, kettle, store radio fallback) pulls all three, and `dur ≥ 9 s`.
Intended solve: Chase plays from `s16_speaker` (customer side), walks back left along the counter front (z −7.6) to the
alcove; drones converge facing +Z; the group goes from the alcove along the staff aisle's back wall (z −12.2, behind
the drones) into the corridor and down to the backroom.

**The zap** (scripted, once, first time Chase enters zone 1 from the alcove/aisle opening): marks `s16_zap_*`.

**The roller door:** strength hold at `s16_roller_luka` raises `roller_door.set(1.6 × strain)`; the collider opens at
gap ≥ 1.2 m; releasing calls `slam()`.

**The tower:** entering zone 9 as/with Chase (2040) triggers the chip prompt (content); with the chip on, the tower's
pings count as Signal (content/systems); `drone_tower.alert(true)` on "Signal detected".

**Exit:** hotspot `gate` at `s16_gate` once all three are in zone 8.

---

## 9. HOTSPOTS

| id | Stand at | r | Verb | By | Scene | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `des` | [4.25, 0, −25.05, 0] | 0.8 | record / kettle (save) | record: chase; save: any | 1.4–1.6 | `{ sample: 'kettle' }` with Chase active ("Des obligingly boils again": `des.boil()`); otherwise "Put the kettle on? [YES] [NO]" after DES: "Tea?" |
| `chip_display` | [−2.0, 0, −13.1, π] | 0.9 | examine | chase | 1.4 | + CHASE (2040) reply |
| `queue_machine` | [0.2, 0, −1.9, π/2] | 0.7 | examine | chase | 1.4 | "Now serving: 000. ^ Fourteen years." |
| `noticeboard` | [10.25, 0, −11.55, π/2] | 0.8 | examine | chase | 1.4 | |
| `xmas_tree_floor` | [8.1, 0, −1.7, 0.6] | 0.9 | examine | chase | 1.4 | "Same tree." / LUKA: "Same tree." |
| `price_tags` | [0.9, 0, −4.2, −2.6] | 0.7 | examine | chase | 1.4 | anchor `price_tag` |
| `margaret_chair` | [2.0, 0, −1.6, 0] | 0.7 | examine | chase | 1.4 | anchor `margaret_plaque` |
| `wall_wreath` | [6.0, 0, −20.95, −π/2] | 0.5 | examine, then lift | chase | 1.4 | second use = "tries to lift it" → CHASE (2040): "Leave it, mate." |
| `hover_trolley` | follows the prop | 0.9 | examine | chase | 1.4 | |
| `local40_a` | actor | 1.0 | talk | chase | 1.4 | "Hello?" (no answer) |
| `office_door` | [9.9, 0, −11.9, π] | 0.8 | examine | chase | 1.4 | anchor `office40_sign` |
| `chip_kiosk` | [5.6, 0, −4.5, π] | 0.7 | record | chase | 1.4–1.6 | `{ sample: 'chip' }` (Chip chime) |
| `terminal` | `s15_chase_terminal` | 0.8 | use → Chip Sale | chase | 1.5 | mini-game `chip_sale` (SWAP to chase40 for Chip View mid-game) |
| `speaker` | `s16_speaker` | 0.7 | play (lure) | chase | 1.6 | sample wheel: what he has (alarm, kettle) or `radio` fallback |
| `roller_door` | `s16_roller_luka` | 0.8 | lift (hold) | luka | 1.6 | `strengthHold({ who:'luka', label:'Lift', dur })` |
| `skip_bin` | [12.8, 0, −35.6, π] | 0.9 | push | luka | 1.6 | optional cover |
| `gate` | `s16_gate` | 1.2 | exit | any (all three present) | 1.6 | ends 1.6 |

Zone triggers (not hotspots): `s14_meet` [3.2,−8.55,9.0,−6.6] (player Chase → meeting Jordan); `s16_chip`
(zone 9 entered by Chase (2040) or with him following → chip prompt).

---

## 10. CUTSCENE NEEDS

| Cutscene / beat | Shots | Geometry / props that must exist |
| --- | --- | --- |
| `1.3_call` right half | SPLIT: the same backroom, darker, four scorch marks, the machine, the kettle; RIGHT ECU kettle screen DES → "Would you like to boil? [YES]" ticks itself | `split_a`/`split_b` (identical to reddy26 so the halves mirror), env `dim`, `machine.flare(true)`, `des.screen('boil_q')` → `('boil_yes')`, `des_screen`. reddy40 must be **built before 1.3's call** (`world.ensure('reddy40')` during the 1.3 setup cutscene) |
| `1.4_arrival` | ECU DES · Boiling…; **WIDE · locked** cramped backroom, white flash, smoke, three men tangled; stare 2 s, kettle clicks off; MID untangle; **TILT UP** to four scorch marks + pointing; CLOSE plant; MID machine; WIDE light switch; CLOSE kettle DES glows | `des_screen`, `backroom_wide` (the roller door's leaking light strip is in this frame), `smoke_backroom` 1 → 0, `s14_pile_*`, `scorch_tilt` + `scorch_1…4`, `plant40`, `machine40`, `backroom_front`, `des`; light switch at (5.7, 1.3, −24.01) |
| 1.4 meeting Jordan | counter two/three-shots, Jordan pales at Luka, Chase (2040) steps between, aside by the office door | `s14_*` marks; Jordan's office door |
| 1.5 setup | POV Chase (2040)'s chip view over the terminal (UI pop-ups); TOP-DOWN on him, hands rising | `terminal` (JARVIS-cam), `terminal_screen`; ceiling clear above `s15_c40_terminal` for a top-down (nothing hangs over x 6.4, z −10) |
| 1.5 Chip View tutorial | AR phrase over Jayden's head | content `AR.add` at the actor; store AR points §11 |
| 1.6 address | WIDE floor (screens blink, chip lights pulse, trolley settles, Jordan stops); MID big screen + **the glance**; PAN across the store (applause, old man crying by Margaret's chair); TWO-SHOT Luka & Chase (no chip lights); WIDE doors lock + three drones float in | `s16_floor_wide`, `screens_all.show('address')`, `locals.lookUp/pulse/applaud`, `hover_trolley.settle`, `big_screen` + `glance(k)`, `s16_pan`/`s16_pan_end`, `doors_lock`, `front_doors.lock(true)`, `d_in_*` |
| 1.6 PLAY beats | the zap (static discharge, smoking fingertip); Luka at the roller door; chip prompt; the pole | `s16_zap_*`, `roller`, `roller_out`, `tower`, `pole_bonk`, pole L1 must be a single readable vertical in `cp_dock` |
| 1.6 exit | the gate onto Redcliffe Parade | `gate` anchor sees through the gap to the footpath, road (a hover-car glides past), palms, the bay — matches 1.7's parade |
| Title | slow 360° orbit of the store at dusk, ring of drones outside | `title_center`, `drone_ring`, `sky_dome`, `storm_clouds`, lit fascia40, hover-cars, palm lights, front + rear + sides all dressed (the orbit sees every side: neighbour rear doors, AC units, the yard, tower) |
| B1 2040 frame | held frame: Chase (older) wiring four chips into the machine; the kettle's screen asks for a name; he types DES | `b1_build`, `b1_machine`, `des_screen`, `des.type('DES', 1.6)`, `b1_c40_wire`, scorch ×3 |

---

## 11. AR anchors (Chip View, for `AR.add`)

| id | at | kind | Suggested text | When |
| --- | --- | --- | --- | --- |
| `ar_chip_1…4` | [x, 1.06, −13.72] for x −3.35, −2.45, −1.55, −0.65 | price | "NEURAL CHIP 9 · $49/mth" · "CHIP 9 MINI · $39/mth" · "CHIP 8 REFURB · $19/mth" · "CLOUD+ READY · $14.99/mth" | 1.4–1.6 |
| `ar_table_1…4` | tent cards [−4.4,1.05,−4.95] · [0.4,1.05,−4.95] · [−4.4,1.05,−8.95] · [0.4,1.05,−8.95] | price | "CHIP COSY $29" · "EAR PILLOW $12" · "SAFETY BUNDLE $0*" · "ARE YOU SURE? COVER $9" | 1.4–1.6 |
| `ar_accessories` | [−8.8, 2.7, −7.8] | sign | "SAFETY ACCESSORIES" | 1.4–1.6 |
| `ar_welcome` | [−2.0, 2.85, −0.3] | sign | "WELCOME TO OPTUS REDCLIFFE" | 1.4–1.6 |
| `ar_doors_locked` | [−2.0, 2.3, −0.25] | sign | "DOORS LOCKED FOR YOUR SAFETY" | 1.6 lockdown |
| `ar_path_a…e` | the §8.3 paths at y 0.02 | path | (patrol lines) | 1.6 |
| `ar_tower` | [0.5, 8.1, −39.5] | sign | "SIGNAL CHECK · STAY SAFE" | 1.6 |
| `ar_gate` | [11.5, 2.5, −46.0] | sign | "REDCLIFFE PARADE" | 1.6 |

(Cloud+ ads are added automatically by the Chip View system whenever it is on.)

---

## 12. AMBIENCE and `update()` (allocation-free)

`ambience: { loops: ['aircon', 'fluoro'], room: 'room' }` (the 2040 store hums the same). In the yard content switches
`AUDIO.setRoom('none')` and adds `city` (the Parade, hover hum) at the roller door. Music is content's (`store40`,
`stealth`, silence for the address, the Manager motif). Thunder for the title's lightning is the title code's.

`update(dt, ctx)` runs the shell update (clocks, doors, tube, smoke, hinges, pelicans) and then:
1. Auto-dress on scene change; env change → interior emissives (§3.2); `dress()` zone-table swap only on change.
2. Chip lights pulse (instanced colour, 8 Hz updates), LED string shimmer, kiosk `chime()` every 12 s.
3. Hover-trolley drift/bob/settle; locals' stare sway, `lookUp`, `pulse`, `applaud` (their rigs' `pose()`), chip lights.
4. Big screen: `ad` gently scrolls its gradient (texture offset); `glance(k)` repaint only while k changes.
5. Des: screen state animation (dots, cursor blink, typing), boil puff timing; machine `flare` and idle pulse; battery LED chase.
6. Roller door gap easing + slam bounce + light-leak opacity; gate slide easing.
7. Drone tower: scanner ring rotation, ping ring scale/opacity (one reusable ring mesh), amber when alerted.
8. Hover-cars: parked bob; moving cars glide and wrap (instance matrices from preallocated temporaries; `needsUpdate` once per frame).
9. Palm lights twinkle (4 Hz); pelicans; glider loop.
10. `title`: `drone_ring` circling + bob (32 matrices/frame); `dusk`: lightning on `storm_clouds` — every 6–14 s (from a precomputed table), `cloud` emissive 0 → 1 → 0 in 0.15 s with a second 0.1 s flicker; **Reduce Flashing: peak 0.3 over 0.8 s, no second flicker**. Optionally `emit('reddy40:lightning')` for thunder.

---

## 13. Performance budget (target < 300; this set ≈ 190 worst case, ≈ 120 in any single stealth frame)

- Static: shell (≈ 30 calls) + yard/Parade merged into the shell's `vc` (no extra calls) + `chain`, `bay`, `sky`,
  `cloud` (4).
- Instanced (1 call each): `chipGlow` (22 chips: wall 4 + tables 8 + showcase 6 + machine 4), pillows (22, merged
  static except the machine's), `led_string` 60, `palm_lights` 312, `hover_cars` 13 + `hoverGlow` 13, `drone_ring` 32 +
  `ringLight` 32 (title only), `smoke_backroom` 20, pelicans 3.
- Props: ≈ 55 groups (≈ 80 calls); screens share one `screenAddr` texture in address mode.
- Characters: up to 4 story rigs (Luka, Chase, Chase (2040), Jordan or Jayden) + 4 `local40_*` ≈ 48 calls.
  Locals are pooled rigs built once at `build()` (Rue's CUST pattern) and hidden outside 1.4–1.6.
- Courtesy Drones (DRONES system): 5 in 1.6, ≈ 3 calls each incl. cones.
- Split (1.3): this set renders the backroom only (frustum culls the floor and yard props); keep backroom props as
  separate small groups. Pre-build during 1.3 setup; keep reddy26 alive through 1.4 (LRU of three).
- Textures ≤ 256 px except `office40` (256×320); `des` repainted only on state change / typing.
- Title: orbit radius 44 sees the whole strip; the ground plane is 400 × 400 and fog hides its edge — no extra
  geometry beyond a low silhouette ring of trees/houses at r 70–90 on the land sides (merged, static).
