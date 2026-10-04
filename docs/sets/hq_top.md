# SET `hq_top` — the Manager's office, top floor of Optus Tower (2040)

File `src/21-set-hq-top.js` · `SETS.hq_top` · Scenes **P** "Do Not Disturb", the **2.5_manager** cutaway, **3.3** "The
Manager", **3.4** "85%" (the boss arena, spec §10), **3.5** "99%", **3.6** "two". Same contract as Rue's `SETS.reddy`
(`ref/rue/05-set-reddy-optus-redcliffe-2026.js`): `{ env, build, marks, anchors, cams, zones, colliders, props,
ambience, update }` plus `dress(state)`, `lamp(name)`, `flash(k)`, `spawns`, `vents`, `bossCam`, `ar` (§12).

**Shared geography.** This set uses the **Valley Grid** (`docs/sets/valley.md` §0.1 / §12.3–12.6): metres, Y up,
**+X east, +Z south**. The office is inside the tower's top floor (VG y 125.5–131.0), so the local frame is
**`local = VG − (0, 125.5, 0)`**: the office floor is `y = 0` and x/z are exactly VG. The city through the glass is
`SETS.valley.skyline({ skip: ['TOWER'], sky, neon })`, added as a child group at **position (0, −125.5, 0)**, so the
mall the player walked in 2.8 runs due south from the glass and the Story Bridge sits ≈ 27° east of south.

---

## 0. Decisions (read first)

1. **The office is 24 m × 12 m** (spec §10): interior **x −12.0…+12.0, z −23.2…−11.2**, ceiling **y 5.2** (the roof
   slab is 5.2–5.5; the roof deck of `hq_roof` is local y 5.5 here = VG 131.0). The **glass wall is the long south side
   (z −11.2)**, the tower's south face, looking straight down Brunswick St Mall at the Valley in the storm.
2. **West end = the Manager's end** (desk, the face-down photo, the empty chair, where he stands at the glass).
   **East end = the intruders' end** (the maintenance hatch from the roof, the private lift). **Centre = the console**
   (Luka faces the glass from its north side). So "the two Lukas at opposite ends of the office" (§6 Two) is the
   room's natural axis, and every TWO-SHOT across the length reads left/right against the lit glass.
3. **The only chair is the empty one.** The Manager never sits. One desk (perpendicular to the glass, so a low track
   along it reflects the storm), one framed photo face down on it, one chair beside its south end, near the glass, to
   the **left** of where he stands (he faces south, so his left is east). Nothing else on the desk. No kettle, no mugs,
   nothing personal anywhere (the hint ledger allows exactly five clues; the set adds none — "spotless" is hint 5's
   job on `hq_floors`, and here it is only the absence of things).
4. **The glass carries the Manager's UI**: one world-space SafeSense panel on the inside of the glass at x −3.0 (the
   pop-up **OPT OUT ALL USERS? [YES] [   ]**, its Do Not Disturb moon, the drone footage in 2.5) and the **glass clock**
   above it (time of day + QUIET IN). These are painted canvases (`glass_ui`), authoritative for every shot; the
   3.6 Hold-NO mini-game drives the same canvas (cursor, hold ring) rather than a DOM pop-up.
5. **Drones are three different things here**: `fireflies` (14, instanced, outside the glass, always idle), `galaxy`
   (24, instanced, inside, the slow galaxy of 3.3 → the red light-up → the hang/ring/yellow/landing of 3.5–3.6) and
   the boss's gameplay drones (content `DRONES.spawn`, from the 4 ceiling hatches + 2 window ports). Handover at 85%:
   `galaxy.seed()` takes the frozen boss drones' positions.
6. **Mirror floor.** Polished black stone. Live low-res reflection (`SETS.hq_floors.makeMirror`, §3.2) in cutscenes;
   the cheap baked mirror during the 3.4 gameplay. Never both.
7. `dress(state)`: `p`, `s25`, `s33`, `s34`, `s35`, `s36` (auto by scene, §12.2). `lamp(name)` places the one spot.

---

## 1. Purpose and scenes

| Scene / beat | Story time / weather | Env preset(s) | Dress | What happens here |
| --- | --- | --- | --- | --- |
| **P** "Do Not Disturb" | Sat 22 Dec 2040, 11:52 · midday under a bruise-coloured storm sky, dry, neon dimmed | `midday` | `p` | ECU the pop-up on the glass (cursor stops short of YES); INSERT slow track along the desk to the face-down frame, the gloved hand; WIDE high from the far corner (the figure at the glass, the empty chair to his left, a drone glides to his shoulder); the glance (hint 1); DND moon |
| **2.5_manager** (cutaway) | Sun 23 Dec 2040, ~13:15 · hot haze, storm wall building over the bay | `cutaway` | `s25` | WIDE from behind the figure: low-res drone footage of two scooters vanishing into the mangroves on the glass; "…Bring them in. ^ Gently." / "Yes, sir." |
| **3.3** "The Manager" | Mon 24 Dec 2040, 11:41 · storm overhead; **rain begins** at step 1 | `storm_dry` → `storm` (lerp 4 s) | `s33` | the prologue's angle; the three climb down the hatch ladder; the reveal (lanyard 1158, hood down, name glitch); the long scene; INSERT the console's USB-C port; the ORBIT; `beforelunch`; every drone red |
| **3.4** "85%" (boss) | 11:43–11:54 · heavy rain; lightning + light flicker at 50% | `boss` (+ `storm_flash` pulses) | `s34` | spec §10: Luka hacks at the console; Chase ⇄ Chase (2040) defend; drones from 4 ceiling hatches + 2 window ports; cleaning-drone slicks; the glass clock runs compressed 15:00 → 04:00 |
| **3.5** "99%" | 11:54–11:57:30 · rain hammering | `storm` → `strike` → `yellow` | `s35` | 3.5_foam (vents open, foam), the pleas, 3.5_almost (the photo up, NO flickers, 11:57, photo down), 3.5_strike (the Guardian, Luka into the north wall), he gets up, the wave, IDENTITY CONFIRMED, the ring, red → blue → yellow, PAUSED |
| **3.6** "two" | 11:57:30 → 11:58 · the storm breaks; at 11:58 the Valley lights up | `yellow` → `lit` (lerp 2 s at 11:58) | `s36` | headphones; the song; Hold NO at the glass; YES/NO on the glass; 11:58; WIDE the Valley lighting up; the console's restart chime; the yellow drones land |

Time cards: P none · 2.5_manager none (cutaway) · 3.3 `11:41` · 3.4–3.6 none. HUD: P none; 3.3 QUIET IN 00:17:00;
3.4 HACK % + QUIET IN (compressed); 3.5 HACK % + QUIET IN 00:04:00; 3.6 none.

**Set lifetime.** P: `hq_top` is the first set loaded (warm at boot). 2.5_manager: preloaded under a short black
from `bridge` with `world.liveMax = 3` (bridge.md §1). 3.3: preloaded under the black at the end of the 3.2 roof
cutscene ("Below: dark.") while `hq_roof` is current; 3.3–3.6 stay on it; `hq_roof` is (re)built under the fade at
the end of 3.6. For 3.6 steps 26–27 content may preload `valley` at 3.3's start with `liveMax = 3` (valley.md §12.6);
if it doesn't, use this set's fallback anchors (§6, `s36_mall_fallback`).

---

## 2. Layout

### 2.1 Axes and conventions

- Local = VG − (0, 125.5, 0). Floor `y = 0` everywhere walkable (no `floor()` needed).
- Mark facing `ry`: the actor faces `(sin ry, cos ry)` → `0` faces **+Z (south, the glass)**, `PI` faces **−Z
  (north wall)**, `H = PI/2` faces **+X (east, the hatch/lift end)**, `-H` faces **−X (west, the desk end)**.
- Facing south (the glass), a person's **left is east (+X)**. Looking south, screen-right is −X (west).
- Boxes and colliders are `[x0, z0, x1, z1]`.

### 2.2 Plan (north at the top)

```
            x −12        −7.5      −2   0   2        7.5   8       12  12.4–15.0
 z −23.2  ┌──────────── north wall (charcoal panels; PALE PANEL x 1.0…5.0) ──────────────┐ shaft (private lift)
          │ ▣▣ cab                    ░░ planter ░░        [   SOFA   ]               ╞═ LIFT doors z −21.5…−19.9
 z −20.4  │ (−6.05,−20.4)   ○vent        ○vent        ○vent   (7.0,−20.8)   ○vent     │   MANAGER ONLY
          │         ⊠ hatch_w (−7.5,−19.0)                         ⊠ hatch_e (7.5,−19.0)│
 z −17.6  │ ┃desk┃           ⊠ hatch_cw (−2,−17.6)   ⊠ hatch_ce (2,−17.6)               │
 z −17.0  │ ┃    ┃  ○vent ●Chase(3.5)     ○vent  ●Luka  ○vent ●Chase40(3.5)  ○vent       │
          │ ┃x −10…−9.1┃                  ┌──CONSOLE──┐ USB-C ◂ (1.21, 0.80, −15.4)     │
 z −15.4  │ ┃z −17.6…−14.4┃               └ (0,−15.4) ┘                                 │
          │ ▫photo (−9.55,−15.0)                                          ⊡ maint hatch │
 z −13.6  │   ◜chair (−8.5,−13.6)  ○vent        ○vent        ○vent        (8.0, −12.9)  │
          │ ● MANAGER (−9.6,−12.0)  ◎ ring centre (−3.0,−13.8)            ladder ┇      │
 z −11.2  └─╫───────╫─ port_w ─╫──[ GLASS UI x −4.6…−1.4 ]─╫───────╫─ port_e ─╫──────╫─┘ GLASS (mullions every 3 m)
          x −12    −9   (−7.5)  −6    −3 (pop-up)      0    3       6  (7.5)  9      12
                         outside: 14 firefly drones z −10.6…−6.0 · set rain box · facade_glow below the sill
                         beyond: the Valley (skyline), the mall due south, the river ~300 m, Story Bridge SE
```

### 2.3 Key coordinates

| Thing | Where | Notes |
| --- | --- | --- |
| Interior | x −12.0…12.0, z −23.2…−11.2, y 0…5.2 | 24 × 12 m |
| **Glass wall** | inner face z −11.2, x −12…12, y 0.06…5.2 (slim black sill 0.06); **mullions** 0.10 × 0.18 at x −12, −9, −6, −3, 0, 3, 6, 9, 12 | smoked glass, the city behind |
| **Glass UI panel** (pop-up slot) | centre (−3.0, 2.15, −11.24), 3.2 × 1.8, facing −Z (into the room) | `glass_ui.popup` |
| **Glass clock** | centre (−3.0, 3.55, −11.24), 2.4 × 0.6 | `glass_ui.clock` |
| Window drone ports | `port_w` (−7.5, 3.8, −11.2), `port_e` (7.5, 3.8, −11.2); round, r 0.5, iris | boss spawns |
| North wall | z −23.2, charcoal acoustic panels with vertical seams; a **pale grey panel** x 1.0…5.0, y 0…3.0 | Luka's impact wall (high contrast for the strike) |
| West / east walls | x −12.0 / x +12.0, charcoal panels | |
| **Private lift** | doors in the east wall x 12.0, z −21.5…−19.9 (two dark leaves), plate **MANAGER ONLY** above (y 2.55); shaft x 12.4…15.0, z −22.0…−19.4 (shared with L30 and the roof headhouse) | closed always |
| **Console** | centre (0.0, 0, −15.4), 2.4 (x) × 0.8 (z) × 0.95 h; black gloss slab on a recessed plinth; glass screen 1.6 × 0.6 tilted 15° toward **north** (Luka's side) | wireless, no cables |
| **USB-C port** | east end face of the console, (1.21, 0.80, −15.4), facing +X; a hairline lit ring | "on its side, absurdly" |
| **Desk** | x −10.0…−9.1, z −17.6…−14.4, top y 0.74 (0.06 slab on two black panel legs) | long axis N–S, perpendicular to the glass; black gloss, painted storm reflection (§3.3) |
| **Photo frame** | (−9.55, 0.745, −15.0), 0.25 × 0.20 × 0.02, **face down** | `photo_frame` |
| **The empty chair** | (−8.5, 0, −13.6), facing ry −0.3 (toward the glass, turned a touch toward the desk) | swivel office chair, graphite |
| The Manager's spot at the glass | (−9.6, 0, −12.0), facing south | chair 1.1 m to his left, 1.6 m behind |
| Filing cabinets | island x −6.55…−5.55, z −20.75…−20.10, h 1.3 (two cabinets back to back) | |
| Planter of dead plants | x −3.0…−0.6, z −21.7…−21.1, h 0.6; brown stalks to 1.3 | the one imperfect thing in the room |
| Sofa | x 5.9…8.1, z −21.25…−20.35, seat 0.45, back 0.85 (back on the north side), faces south | |
| **Maintenance hatch** (from the roof) | ceiling opening 0.9 × 0.9 centred (8.0, 5.2, −12.9) (z −13.35…−12.45); fold-down steel **ladder** in the plane z −13.32, stiles x 7.75 / 8.25, rungs every 0.30 m from y 1.0 to 5.2 | climbers on its south side facing north; they drop the last metre |
| **Drone hatches** (ceiling) | `hatch_w` (−7.5, 5.2, −19.0), `hatch_cw` (−2.0, 5.2, −17.6), `hatch_ce` (2.0, 5.2, −17.6), `hatch_e` (7.5, 5.2, −19.0); 1.0 × 1.0 two-leaf flaps | boss spawns; the strike falls from `hatch_cw` |
| **Foam vents** (floor) | 14 round grilles r 0.35 on x ∈ {−8, −4, 0, 4, 8} × z ∈ {−20.4, −17.0, −13.6}, **minus (−8, −13.6)** (the chair) | `vents` |
| Ceiling light strips | 3 recessed strips E–W at z −14.0, −17.2, −20.4, x −11…11, y 5.18 | dim cold emissive; flicker at 50% |
| Outside | fireflies z −10.6…−6.0, x −11…11, y 0.8…4.8; rain box x −14…14, z −10.8…−4.0, y −8…6; `facade_glow` z −10.9, y −6…0 | |

### 2.4 Colliders (`[x0, z0, x1, z1]`)

```
shell      W [-12.2,-23.4,-12.0,-11.0]  E [12.0,-23.4,12.2,-11.0]  N [-12.2,-23.4,12.2,-23.2]  S glass [-12.2,-11.2,12.2,-11.0]
console    [-1.2,-15.8,1.2,-15.0]
desk       [-10.0,-17.6,-9.1,-14.4]
chair      [-8.8,-13.9,-8.2,-13.3]
cabinets   [-6.55,-20.75,-5.55,-20.10]
planter    [-3.0,-21.7,-0.6,-21.1]
sofa       [5.9,-21.25,8.1,-20.35]
foam       3 dynamic [x-0.5, z-0.5, x+0.5, z+0.5] at the foam blobs while they're up (parked at 1e4 otherwise)
```

The ladder hangs from 1.0 m up and has no collider (the boss AI routes around it as if it weren't there; it's clear of
every mark). The private-lift doors are part of `E`.

---

## 3. Look

### 3.1 Palette (spec §14: "Optus HQ … the top floor dark with storm light"; 2040 glassy accent)

| Use | Hex |
| --- | --- |
| Walls (charcoal acoustic panels) / seams | `#1c2024` / `#121518` |
| The pale impact panel (north wall x 1–5) | `#8a9098` |
| Floor (polished black stone) / reflection streaks | `#0c0e12` / `#3a4450` |
| Ceiling / light strips | `#121418` / `#dfe8ff` (emissive 0.35) |
| Mullions, sill, console plinth | `#2a2e34` |
| Glass (smoked) | `#223040` @ 0.22 |
| Console / desk (black gloss) | `#0a0b0d` with highlight `#2a3440` |
| SafeSense UI (pop-up, clock, console screen) | glass white `#f4f8fc` @ 0.85, glow `#bfe6ff`, deep `#4a8ab8`, text `#1a2a3a` |
| Chair (graphite) / sofa (charcoal felt) / cabinets (dark steel) | `#30343a` / `#2c2f36` / `#3a3e44` |
| Planter (concrete) / dead stalks | `#5a5c60` / `#6a5a40`, `#4a3e2e` |
| Safety foam (quilted) | cream `#efe6d0`, seams `#d8ccb0` |
| Drones: shell / lights | white `#eef2f6`; blue `#8fd8ff`, amber `#ffb040`, red `#ff4040`, **Yes yellow `#ffd21f`** |
| Rain streaks on glass | `#c8d4dc` @ 0.35 |
| Storm sky (via skyline) | bruise `#3b3346` (P), green-grey `#2c3432` (3.3–3.5) |

**Yes yellow** appears only on the drones from 3.5 step 54 (the ring), the `ring` lamp, and the `facade_glow` at 11:58.

### 3.2 Materials

- `M.vc` — Lambert, vertex colours: walls, ceiling, mullions, sill, furniture bodies, ladder, cabinet, sofa, planter
  → 1 draw call.
- `M.atlas` — Lambert + the 256 × 256 label atlas (MANAGER ONLY, the console's port ring decal, hatch stencils).
- `M.floor` — the mirror floor. **Live mode** (default in cutscenes, desktop): `SETS.hq_floors.makeMirror(24.2, 12.2,
  { res: 256, tint: 0x0c0e12, opacity: 0.62 })` placed at y 0.002 (hq_floors.md §3.2: an inlined, trimmed copy of
  three's `Reflector`, a 256² nearest-filtered target re-rendered in the mirror mesh's `onBeforeRender`). **Baked
  mode** (3.4 gameplay, touch devices, or when the adaptive pixel ratio is < 0.75): a Lambert floor (`t_floor`
  streaks, opacity 0.82) over a mirrored copy (`scale.y = −1`) of the merged static mesh. `reflect('live'|'baked')`
  switches; if `SETS.hq_floors` is missing, baked only.
- `M.desk` — Lambert + `t_desk` (black gloss with the painted storm-glass reflection), unique key.
- `M.glass` — Basic, transparent 0.22, DoubleSide, fog false (the panes).
- `M.ui` — Basic, transparent, fog false: `t_glass_ui` (one dynamic canvas for pop-up + clock, §3.3).
- `M.console` — Basic: `t_console` (dynamic screen).
- `M.glow` — Basic: light strips (unique key; `update` drives the colour for flicker), port ring, hatch lamps.
- `M.rainGlass` — Basic, transparent, `depthWrite: false`: `t_glass_rain` (scrolling streaks), one quad on the inner
  face of the glass, opacity × the set rain amount.
- `M.foam` — Lambert, `t_quilt` cream (shared with `safe_room`'s quilt look, own key).
- Drones: the shared drone geometry from art (`04-art.js` drone builder) — one white shell material + one unlit
  **instanceColor** light material per IM; set `setColorAt` on every instance at build (warm the variant).
- No vertex snapping, no affine warping, no wobble. Blob shadows only.

### 3.3 Textures to paint (128–256 px, nearest; **bold** = must read at the named anchor)

| Texture | Size | Content | Read at |
| --- | --- | --- | --- |
| `t_glass_ui` (dynamic) | 256 × 256 | two regions. **Pop-up** (256 × 160): rounded translucent white glass, soft blue glow, **OPT OUT ALL USERS?**, one pill **[YES]** on the left, to its right an **empty button-shaped outline** (dashed, faint), small text **Scheduled: Monday 24 December 2040 · 11:58**; variants `dnd` (moon icon top-right corner + "Do Not Disturb"), `no_flicker` (a **[NO]** pill in the slot), `yes_no` (both pills live, equal weight), `yes_grey` (YES greyed), `no_hold` (a ring filling around NO), `cancelled` (**Opt-Out cancelled.**), `footage` (a 64 × 36 low-res inset at 2× scale, see `t_footage`), `identity` unused here; a **cursor** arrow sprite drawn at (u, v). **Clock** (256 × 64): big **hh:mm** or **hh:mm:ss**, under it **QUIET IN hh:mm:ss** or **PAUSED** | `glass_popup`, `glass_popup_ecu`, `glass_moon`, `glass_clock` |
| `t_footage` | 3 frames of 64 × 36 | top-down drone footage: a boardwalk strip, dark mangrove canopy blobs, two scooter dots sliding under the canopy (frame 1→2→3 at 4 fps, loop), scanline + timestamp pixels | `s25_wide` |
| `t_console` (dynamic) | 256 × 96 | `idle` (dark glass, a slow SafeSense ripple); `password` (a field **Password:** + the typed dots/characters, content passes the string: shows **beforelunch** as typed); `granted` (**ACCESS GRANTED · HACK 0%**); `hack` (**HACK nn%** + a bar); `stall` (a frozen bar with a pop-up glyph); `restart` (black, the old JARVIS mark, three dots rising, one per chime note) | `console_screen` |
| `t_phone` (dynamic) | 64 × 128 | Luka's 2026 phone: `keyboard`, `hack` (**HACK nn%**), `cracked` (a crack overlay drawn over `hack`), `two` (a music player: **two** ▶) | `s35_phone`, `s35_cracked_phone` |
| `t_desk` | 128 × 128 | black gloss top with a soft vertical band of storm-glass reflection (bruise/green-grey light, mullion lines) brightest at the south end | `p_desk_track_*` |
| `t_photo_back` | 64 × 64 | the frame's back: black card, a stand, a small felt corner | `photo_frame` (face down) |
| `t_photo` | 64 × 48 | low-res version of the photo for wide shots: two blurred figures on a jetty at sunset (the readable INSERT is the CARD) | `desk_photo_turn` |
| `t_floor` | 128 × 128 | black stone, soft streaks (baked-mode floor) | |
| `t_glass_rain` | 128 × 256 (alpha) | rain rivulets + droplets, two layers, scroll-able | glass in every storm shot |
| `t_panel` | 128 × 128 | charcoal acoustic panel, vertical seams; a `pale` variant | walls |
| `t_quilt` | 64 × 64 | cream quilted foam with diamond stitching | foam |
| `t_crack` | 64 × 64 (alpha) | a dented, cracked panel spray | `wall_crack` |
| `t_atlas` | 256 × 256 (8 rows × 32 px) | row 0 **MANAGER ONLY**; row 1 ROOF ACCESS ▲; row 2 "SAFETY FOAM — DO NOT STAND ON VENT" (tiny, on the vent rims); row 3 hatch stencil "MAINTENANCE"; rows 4–7 spare | `lift_doors` |

### 3.4 Lighting rig (hemi + dir + **one** spot) and fog, per preset

No preset name contains "rain"; every preset sets `rain` explicitly (it drives the set-owned rain **outside** the
glass). Fog is light so the city reads to ~500 m (skyline contract, valley.md §12.6).

```js
env: {
  midday:      { bg: 0x3b3346, fog: [0x2c2836, 0.0022], hemi: [0x9a96b4, 0x16141c, 0.62], dir: [0xd0c8e0, 0.55, [8, 40, 60]],   spot: [0xe8f0ff, 1.6], rain: 0 },
  cutaway:     { bg: 0x5c6270, fog: [0x666a74, 0.0022], hemi: [0xbcc0cc, 0x24262a, 0.80], dir: [0xfff0d8, 0.80, [-12, 60, 40]], spot: [0xffffff, 0],   rain: 0 },
  storm_dry:   { bg: 0x2c3432, fog: [0x283030, 0.0026], hemi: [0x7c8e86, 0x121614, 0.62], dir: [0xb8ccc4, 0.45, [0, 30, 60]],   spot: [0xdfe8ff, 1.4], rain: 0 },
  storm:       { bg: 0x2c3432, fog: [0x283030, 0.0026], hemi: [0x7c8e86, 0x121614, 0.62], dir: [0xb8ccc4, 0.45, [0, 30, 60]],   spot: [0xdfe8ff, 1.4], rain: 0.7 },
  boss:        { bg: 0x2c3432, fog: [0x283030, 0.0026], hemi: [0x8fa29a, 0x161a18, 0.78], dir: [0xc0d4cc, 0.55, [0, 30, 60]],   spot: [0xdfe8ff, 1.4], rain: 0.85 },
  storm_flash: { bg: 0x8a9496, fog: [0x606a6a, 0.0026], hemi: [0xe8f0ff, 0x404850, 1.60], dir: [0xffffff, 2.2, [0, 30, 60]],    spot: [0xdfe8ff, 1.4], rain: 0.85 },
  strike:      { bg: 0x262a2a, fog: [0x202424, 0.0040], hemi: [0x6a7270, 0x101212, 0.50], dir: [0x98a4a0, 0.30, [0, 30, 60]],   spot: [0xcfd8e8, 1.2], rain: 0.85 },
  yellow:      { bg: 0x2c3030, fog: [0x2a2c28, 0.0030], hemi: [0xb8aa80, 0x1c1810, 0.72], dir: [0xc8c0a8, 0.45, [0, 30, 60]],   spot: [0xffd21f, 1.2], rain: 0.9 },
  lit:         { bg: 0x3a3048, fog: [0x30283a, 0.0018], hemi: [0xd8b8a0, 0x24182a, 0.85], dir: [0xffd8b0, 0.55, [0, 30, 60]],   spot: [0xffd21f, 1.2], rain: 1.0 },
}
```

First key `midday` is the build default (the prologue). Lightning in 3.4 at 50%: content `{env:'storm_flash'}` then
`{env:'boss', dur:0.5}` + `lights.flicker(1.2)`; **Reduce Flashing**: skip `storm_flash`, use `{env:'boss'}` with
`flash(0.35)` only (a 1.5 s dim swell). Ambient lightning (§10) never touches the env.

**The spot (`lamp(name)`)** — `world.torchAuto = false` while lit (restore `true` on `lamp('off')`; please also reset
in `showE()`, same request as `parade`/`valley`).

| `lamp()` | Position → target | Angle / penumbra / dist | Colour / intensity | Purpose |
| --- | --- | --- | --- | --- |
| `desk` (P default) | (−9.55, 4.9, −15.0) → (−9.55, 0.74, −15.0) | 0.32 / 0.6 / 7 | `#e8f0ff` / 1.6 | the frame and the gloved hand in a cold pool; the figure at the glass in its spill |
| `console` (3.3–3.4 default) | (0.0, 4.9, −15.6) → (0.0, 0.9, −15.6) | 0.42 / 0.6 / 8 | `#dfe8ff` / 1.4 | Luka at the console |
| `glass` | (−3.0, 4.9, −13.4) → (−3.0, 1.8, −11.3) | 0.50 / 0.7 / 8 | `#cfe6ff` / 1.0 | rim on whoever stands at the pop-up (3.3 step 41, 3.4 F.Luka) |
| `wall` (3.5 strike → 3.6) | (2.8, 4.9, −20.6) → (2.8, 0.4, −22.6) | 0.40 / 0.7 / 8 | `#cfd8e8` / 1.2 | Luka against the north wall |
| `ring` (3.5 step 54 → 3.6) | (−3.0, 4.9, −13.8) → (−3.0, 0.8, −13.8) | 0.55 / 0.8 / 8 | `#ffd21f` / 1.2 | the ring's warm light on F.Luka and Chase |
| `off` (2.5) | — | — | 0 | |

### 3.5 Sky and backdrop

`SETS.valley.skyline({ skip: ['TOWER'], sky: 'midday_storm', neon: 0.35 })` at (0, −125.5, 0). States by dress (the
valley.md §12.6 table): P `sky('midday_storm')`, `lit(0.35)`; 2.5 `sky('midday_storm')`, `lit(0.35)` (brighter env);
3.3–3.5 `sky('storm')`, `lit(0.35)`, `rain(true)` from 3.3 step 1; **3.6 at 11:58** `lit(1.0, 2)`, `swing(true)`,
`rain(true)`, `crowd('look_up')`, `bridgeLights(true)`. If `SETS.valley` is missing: a dark horizon band + 20 box
towers + a low bridge silhouette, never throw.

Plus, built here: **`facade_glow`** — an additive Yes-yellow vertical gradient quad just outside and below the
sill (x −14…14, z −10.9, y −6.0…0.0, bright at the bottom) and a horizontal haze quad (y −5.8, z −10.9…−7.0): the
tower's own facade countdown (16 m below, unseeable from inside) hitting zero reads as warm light rising up the glass.
Hidden until `zero()`.

---

## 4. Props

| id | Description | Scenes | States / `userData` |
| --- | --- | --- | --- |
| `glass_ui` | the SafeSense panel + clock on the glass (one dynamic canvas, two quads) | P, 2.5, 3.3–3.6 | `popup(mode)` mode ∈ `'yes_only'` (default, empty slot + Scheduled line), `'dnd'`, `'no_flicker'`, `'yes_no'`, `'yes_grey'`, `'cancelled'`, `'footage'`, `'off'`; `cursor(u, v)` / `cursor(null)` (u, v ∈ 0…1 over the pop-up; repaint ≤ 30 Hz, only on change); `hold(k)` ring around NO 0…1; `clock({ h, m, s, sec: bool, quiet: 'hh:mm:ss' \| null, paused: bool })`; `clockRun(rate)` (story seconds per real second; 0 = frozen); `clockOff()`; `glow(k)` overall brightness |
| `glass_rain` | streak overlay quad on the glass | 3.3–3.6 | follows the rain amount; `boost(k)` (3.5 hammering) |
| `console` | the black slab, plinth, tilted screen | 3.3–3.6 | `screen(mode, arg)` (`'idle'`, `'password'` + typed string, `'granted'`, `'hack'` + pct, `'stall'`, `'restart'`); `port(on)` the port ring glow (on from 3.3 step 52) |
| `luka_phone` | Luka's 2026 phone + a USB-C cable to the port | 3.3–3.6 | `state('hidden' \| 'docked' \| 'dangling' \| 'pulled')`: docked = lying on the console top east end (0.95, 0.96, −15.45), cable a taut 0.3 m curve to the port; dangling = hanging off the east end on the cable, pendulum ±0.15 rad decaying, cracked screen lit; `screen(mode, pct)` (`t_phone`) |
| `desk` | the desk (static in the merge) | all | — |
| `photo_frame` | the frame | all | `state('down' \| 'up' \| 'held')` (held = hidden; content attaches a copy to F.Luka's hand) |
| `empty_chair` | the chair; seat is a child | all | `spin` (rad/s, decays) — never sat in |
| `filing_cabinets`, `planter`, `sofa` | low furniture | 3.4 | static |
| `maint_hatch` | ceiling hatch + fold-down ladder | 3.3 | `open(u)` lid 0…1; `ladder(u)` extends 0…1 (folded y 4.4…5.2 → full 1.0…5.2) — opens/extends at 3.3's start (they've just opened it from above) |
| `drone_hatches` | 4 two-leaf flaps | 3.4–3.5 | `open(i, u)` (i 0–3 = w, cw, ce, e), eased; small red lamp inside while open |
| `drone_ports` | 2 iris ports in the glass | 3.4 | `open(i, u)` (6 blades rotate open) |
| `vents` | InstancedMesh 14 grilles | 3.5 | `open(k)` all (grille slides, a dark ring shows); `open(i, k)` one |
| `foam` | 3 quilted foam blobs (low-poly, cream) | 3.5 | `bloom(i, x, z, dur)` grows from the floor to chest height (h 1.25, r 0.55) over `dur`; `soften(k)` (scale wobble + slight shrink, step 19); `harden()`; `burst(i)` (Luka's: 10 puff fragments + `world.puff`); `sag(i, dur)` dissolves to a flat pool then gone (step 37); each blob has a dynamic collider |
| `galaxy` | InstancedMesh 24 drones inside (shell IM + light IM) | 3.3, 3.5, 3.6 | `mode('idle')` slow galaxy (§10); `watch(x, y, z, dur)` lights turn toward a point; `color(name, dur)` `'blue'\|'amber'\|'red'\|'yellow'`; `hang()` freeze in place with a tiny bob; `seed(arr, n)` positions from the boss's frozen drones (`arr` = flat `[x,y,z,…]`, up to 24; the rest stay at their galaxy slots); `ring(cx, cz, r, y, dur)` fly to a ring (two tiers: 14 at y 1.6, 10 at y 2.5, facing inward); `part(angle, width)` open a gap toward an angle (Chase walks in); `land(dur)` settle one by one onto the floor around them (staggered 0.12 s), lights dim to 40%; `visible` |
| `fireflies` | InstancedMesh 14 drones outside the glass | P, 2.5, 3.3–3.6 | drift (§10); `color(name)`; `scatter()` (3.6 at 11:58: they drift away down and out of frame over 6 s) |
| `aide_drone` | one drone model (shell + light) for the prologue and 2.5 | P, 2.5 | `fly(from, to, dur)` (marks or `[x,y,z]`, smoothstep, banked), `talk(on)` (light pulses with DRONE blips), `visible` |
| `slicks` | InstancedMesh 4 shiny floor streaks (1.6 × 0.5, additive white-blue) | 3.4 | `show(i, x, z, ry, dur = 6)` fades in 0.3 s, holds, fades out (boss cleaning drones) |
| `lights` | the 3 ceiling light strips | all | `level(k)`; `flicker(sec)` (random 15 Hz on/off bursts, then steady) |
| `lift_doors` | private lift doors + MANAGER ONLY plate | all | static (closed) |
| `wall_crack` | cracked/dented decal on the pale panel at (2.8, 1.1, −23.18), 1.4 × 1.6 | 3.5 strike | `visible` (shown at the impact) |
| `luka_badge` | Luka's snapped lanyard + badge lying face down | 3.5 | `place([x,y,z], ry)`, `visible` (content hides it when he picks it up, step 49) |
| `facade_glow` | §3.5 | 3.6 | `zero(dur = 2)` fades in; `off()` |
| `rain` | `makeRain({ box: [-14, -10.8, 14, -4.0], top: 6, bottom: -8, count: 1800 })` named `rain` — **outside the glass only** | 3.3–3.6 | driven by env `rain` |
| `skyline` | `SETS.valley.skyline({ skip: ['TOWER'] })` at (0, −125.5, 0) | all | valley.md §12.5 |
| `mirror` | the floor (`makeMirror` or baked) | all | `reflect('live' \| 'baked')` on the set (§12.1) |

**Instanced repeats (counts)**

| Repeat | Count | Mesh(es) |
| --- | --- | --- |
| Galaxy drones (inside) | 24 | 2 IM (shell, light — instanceColor) |
| Fireflies (outside) | 14 | 2 IM |
| Foam vents | 14 | 1 IM |
| Floor slicks | 4 | 1 IM |
| Mullions (merged into `M.vc`), light strips (merged into `M.glow`) | 9 / 3 | static |

Boss gameplay drones (Courtesy, Guardian, Pop-up, Cleaning) are **content-spawned** by the `boss` mini-game with
`DRONES.spawn` at `spawns` (§7.3). Keep at most 14 alive.

---

## 5. Marks (`[x, y, z, ry]`, local)

**Prologue and 2.5**

| id | value | use |
| --- | --- | --- |
| `mgr_glass` | [−9.6, 0, −12.0, 0] | the figure at the glass, back to the room; hood up |
| `p_mgr_desk` | [−10.5, 0, −15.0, H] | at the desk's west side, the gloved hand reaches to the frame (P step 3) |
| `p_drone_in` | [−2.0, 3.8, −21.0, 2.6] | `aide_drone` entry point (out of the dark north half) |
| `p_drone_shoulder` | [−10.25, 1.75, −12.35, 0.3] | at his **right** shoulder (west), so the chair side stays clear for the glance |
| `s25_mgr` | [−3.0, 0, −12.9, 0] | 2.5: the figure facing the footage on the glass |
| `s25_drone` | [−1.9, 2.0, −13.3, −2.4] | 2.5: the drone that answers "Yes, sir." |

**3.3**

| id | value | use |
| --- | --- | --- |
| `s33_ladder_top` | [8.0, 4.4, −13.05, PI] | climbing start (content `place`, then `moveTo` down with `play('climb')`) |
| `s33_ladder_foot` | [8.0, 1.0, −13.05, PI] | last rung; then a 0.3 s drop to the floor |
| `s33_drop_luka` | [8.0, 0, −12.9, −H] | on the floor, turned west down the room |
| `s33_drop_chase` | [8.9, 0, −12.15, −1.4] | |
| `s33_drop_c40` | [8.7, 0, −14.1, −1.75] | the north side of the group (the Manager's left when he faces them) |
| `mgr_turn` | [−9.6, 0, −12.0, 1.62] | he turns round to face the three (step 11) |
| `s33_c40_mid` | [6.4, 0, −17.6, −1.62] | Chase (2040) a few steps into the room (steps 18–21; the TOP-DOWN); also the ORBIT spot (clear radius 2.7 m) |
| `s33_luka_mid` | [4.0, 0, −13.8, −1.65] | Luka steps forward for "The drone on the bridge. Error 4044." (step 38) |
| `s33_chase_mid` | [5.2, 0, −13.0, −1.45] | Chase beside him |
| `s33_l40_glass` | [−4.0, 0, −11.95, 0] | "Future Luka walks to the glass" (step 41) |
| `s33_l40_turn` | [−4.0, 0, −11.95, 1.68] | "turning back to them, and the drones turn with him" (step 51) |
| `console_luka` | [0.0, 0, −16.2, 0] | Luka at the console, facing the glass (3.3 step 70 → 3.5) |

**3.4 (boss starts)**

| id | value | use |
| --- | --- | --- |
| `boss_chase` | [−3.0, 0, −18.6, 2.6] | Chase start |
| `boss_c40` | [3.0, 0, −18.6, −2.6] | Chase (2040) start |
| `boss_l40` | [−4.0, 0, −11.95, 0.4] | Future Luka at the glass for the whole fight ("He stands at the glass and talks"); content turns him toward Luka/the speaker per line |

**3.5**

| id | value | use |
| --- | --- | --- |
| `s35_chase` | [−8.0, 0, −17.0, 1.2] | Chase held in foam (on vent (−8, −17)) — content places him here at the cut into 3.5_foam |
| `s35_c40` | [4.0, 0, −17.0, −1.2] | Chase (2040) held in foam (on vent (4, −17)) |
| (Luka) | `console_luka` | Luka's foam blooms around him at the console (vent (0, −17.0) just behind) |
| `s35_l40_by_chase` | [−7.1, 0, −15.9, −2.5] | the plea beside Chase |
| `s35_l40_by_c40` | [3.0, 0, −15.9, 2.4] | the plea beside Chase (2040) |
| `s35_l40_by_luka` | [−1.6, 0, −16.4, 1.45] | "The two Lukas, face to face": at the console's west end; content turns Luka (in the foam) to face him (`face('luka', 's35_l40_by_luka')`) |
| `desk_l40` | [−10.5, 0, −15.0, H] | 3.5_almost: at the desk, picks up the frame (= `p_mgr_desk`) |
| `s35_l40_end` | [−3.0, 0, −13.8, 2.25] | after "Face down." he steps here, facing his past self at the console ("I'm sorry." / two fingers); later the **ring centre** |
| `s35_luka_wall` | [2.8, 0, −22.7, 0] | slumped seated against the pale panel, facing south (`sit` on the floor, back to the wall) |
| `s35_badge` | [3.35, 0.012, −22.25, 0.4] | the snapped lanyard + badge face down beside his open hand |
| `s35_luka_up` | [2.8, 0, −22.45, −0.59] | standing at the wall, facing Future Luka at `s35_l40_end` (steps 49–53; 3.6 step 14) |

**3.6**

| id | value | use |
| --- | --- | --- |
| `s36_chase_l40` | [−3.55, 0, −14.55, 0.64] | Chase inside the ring, face to face with Future Luka (who turns to ry −2.5) for the headphones |
| `s36_c40` | [4.0, 0, −17.0, −1.27] | Chase (2040) standing where the foam held him, facing the ring |
| `s36_l40_glass` | [−3.0, 0, −12.15, 0] | Future Luka at the glass for Hold NO (inside the ring) |
| `s36_chase_side` | [−4.25, 0, −12.9, 0.35] | Chase beside him during the play and the WIDE |
| `s36_luka_console` | `console_luka` | "He limps to the console" (from `s35_luka_up`, 7 m, slow) |
| `ring_centre` | [−3.0, 0, −13.8, 0] | `galaxy.ring(-3.0, -13.8, 2.3, …)`; the ring clears the glass by 0.3 m |

---

## 6. Anchors (`{ at, from, fov }`, local)

| id | at | from | fov | for |
| --- | --- | --- | --- | --- |
| `glass_popup` | [−3.0, 2.15, −11.24] | [−3.0, 2.15, −14.7] | 40 | ECU · locked the pop-up (P step 2, 3.3 step 1 insert, 3.6 steps 17/19/22); the whole 3.2 × 1.8 panel fills 16:9 |
| `glass_popup_ecu` | [−3.04, 1.915, −11.24] | [−3.04, 1.935, −12.95] | 31 | tighter on [YES] and the empty slot: the cursor stopping short (P), the one-frame [NO] (3.5 step 18) |
| `glass_moon` | [−3.8, 2.81, −11.24] | [−3.78, 2.78, −12.55] | 30 | ECU the moon icon: Do Not Disturb (P step 13) |
| `glass_clock` | [−3.0, 3.55, −11.24] | [−3.0, 3.2, −12.7] | 30 | INSERT the countdown on the glass: 11:57 (3.5 step 22); 11:57:30 PAUSED (step 55); 11:57:30 … 11:58 (3.6 step 24) |
| `p_desk_track_a` | [−9.55, 0.76, −15.0] | [−9.55, 0.86, −17.5] | 38 | INSERT slow track along the desk, start (low over the north end, the glass reflected in the gloss ahead) |
| `p_desk_track_b` | [−9.55, 0.745, −15.0] | [−9.55, 0.84, −15.75] | 34 | track end: on the face-down frame; the gloved hand enters from screen-left (west) |
| `photo_frame` | [−9.55, 0.76, −15.0] | [−9.0, 1.25, −15.65] | 34 | the frame on the desk (3.5 step 15 lead-in; the photo itself is the CARD `photo` in content) |
| `far_corner` | [−9.0, 1.0, −12.4] | [11.4, 4.75, −22.7] | 50 | **the prologue's angle**: WIDE high from the far (NE) corner — the long dark room, the console mid-frame, the glass on the left, the figure small at the glass, the empty chair to his left, fireflies outside, the storm (P step 4; 3.3 step 1) |
| `p_back_head` | [−9.6, 1.7, −12.0] | [−9.85, 1.85, −13.6] | 34 | CLOSE the back of his head, hood up (P step 6) |
| `p_shoulder_chair` | [−8.6, 1.05, −13.0] | [−11.2, 1.75, −14.6] | 44 | MID from behind: his left shoulder and the empty chair (P step 9, the glance) |
| `s25_wide` | [−3.0, 1.9, −11.3] | [−3.0, 2.5, −19.0] | 46 | 2.5 WIDE from behind the figure: the footage small on the glass, the storm city around it |
| `s33_ladder` | [8.0, 2.6, −13.1] | [5.4, 1.4, −15.6] | 50 | MID the hatch ladder: the three climbing down and dropping onto the mirror floor |
| `s33_from_behind` | [−9.6, 1.4, −12.0] | [11.0, 1.9, −13.6] | 34 | WIDE from behind them: down the length of the glass to the figure at the far end (rain on the glass, the drones turning) |
| `s33_badge` | [−9.6, 1.25, −12.0] | [−9.0, 1.3, −12.05] | 30 | INSERT · slow: his chest, the faded lanyard, the badge swinging and flipping: **1158** (valid at `mgr_turn`; the badge is the rig attachment) |
| `s33_two_lukas` | [−0.8, 1.45, −12.5] | [0.2, 2.0, −22.4] | 52 | TWO-SHOT · Luka and Luka (2040), the length of the office between them, in profile against the lit glass (step 23); reused for 3.5 step 51 when they're at those marks |
| `s33_glass_talk` | [−4.0, 1.6, −11.95] | [−1.6, 1.7, −14.6] | 40 | Future Luka at the glass, talking calmly (steps 41–50) |
| `console` | [0.4, 0.9, −15.4] | [2.6, 1.5, −17.2] | 40 | INSERT the console in the centre: sleek, black, wireless, nothing plugged in (step 52) |
| `usb_port` | [1.21, 0.80, −15.4] | [1.75, 0.92, −15.3] | 24 | INSERT the port: **USB-C** |
| `console_screen` | [0.0, 1.0, −15.4] | [0.0, 1.55, −16.55] | 34 | the password field, **beforelunch**, ACCESS GRANTED · HACK 0% (steps 70–72); 3.6 step 28 the restart |
| `s33_thumbs` | [0.25, 1.05, −16.0] | [0.15, 1.65, −16.6] | 36 | INSERT Luka's thumbs typing on his phone at the console |
| `s33_red` | [0.0, 2.2, −16.4] | [−11.4, 4.6, −22.6] | 58 | WIDE: every drone in the room lights up red at once (from the NW corner, the galaxy filling the frame, the intruders small at the east end) |
| `s35_foam_wide` | [−1.0, 0.9, −16.6] | [−1.0, 4.4, −22.4] | 66 | WIDE the vents open, foam blooms around all three |
| `s35_phone` | [1.0, 0.98, −15.45] | [1.4, 1.35, −16.4] | 30 | INSERT Luka's phone plugged into the console, the cable taut: HACK 85% … 86% |
| `s35_locked_low` | [−1.5, 1.0, −16.0] | [9.6, 0.45, −18.6] | 52 | WIDE · locked, low: Future Luka walks among them; rain hammers the glass |
| `desk_photo_turn` | [−9.9, 1.15, −15.1] | [−7.0, 1.6, −14.0] | 40 | MID: he walks to his desk, picks up the frame and turns it over (3.5 step 15) |
| `s35_strike_wide` | [1.2, 1.2, −19.2] | [9.6, 1.7, −15.2] | 58 | WIDE: the Guardian drops from `hatch_cw`; the hit; Luka thrown across the room into the pale panel |
| `s35_wall_low` | [2.4, 0.5, −21.4] | [−5.6, 0.35, −14.6] | 48 | WIDE · locked, low, across the floor: Luka slides down the wall; the badge by his hand; the phone dangling from the console (steps 33, 39, 49) |
| `s35_cracked_phone` | [1.3, 0.55, −15.4] | [2.0, 0.68, −15.9] | 30 | INSERT the cracked phone: HACK 99% / 100% |
| `s35_lukas_two` | [−0.1, 1.2, −18.15] | [7.2, 1.5, −13.0] | 60 | TWO-SHOT the two Lukas, the room between them: Past Luka wrecked and upright at the wall, Future Luka untouched (step 51) |
| `s35_luka_low` | [2.8, 1.6, −22.4] | [2.0, 0.35, −20.6] | 50 | LOW · the sincere low angle: he raises his arm and waves it once |
| `s35_ring_wide` | [−3.0, 1.8, −13.8] | [3.6, 3.2, −20.8] | 54 | WIDE: every drone turns, IDENTITY CONFIRMED over the nearest, they drift into a ring round Future Luka, red → blue → yellow |
| `s36_ring_wide` | [−3.0, 1.6, −12.8] | [−3.0, 2.4, −21.4] | 50 | WIDE the ring of yellow drones, Future Luka crying in the middle, Chase beside him, the city through the glass |
| `s36_valley` | [0.0, −120.0, 62.0] | [1.2, 2.4, −11.7] | 55 | WIDE the Valley from the office through the rain: the mall due south lighting up, the facade glow rising up the glass |
| `s36_mall_fallback` | [0.0, −125.5, 60.0] | [−6.0, −98.0, 34.0] | 50 | only if `valley` isn't live: "the mall from above" with `skyline().crowd('look_up')` |
| `hatch_cw` | [−2.0, 5.0, −17.6] | [−0.2, 1.6, −14.8] | 44 | the hatch the strike falls from (also spawn previews) |
| `ports` | [0.0, 3.8, −11.2] | [0.0, 2.2, −19.0] | 62 | both window drone ports |

---

## 7. Gameplay zones and fixed cameras

The only gameplay on this set is the **boss** (3.4, a tracking camera by spec §10) and **Hold NO** (3.6, one fixed
lens). The zones tile the room so the framing helper keeps every computed lens inside it.

### 7.1 Cameras

```js
cams: {
  far_corner: { type: 'fixed', pos: [11.4, 4.75, -22.7], look: [-9.0, 1.0, -12.4], fov: 50 },   // default (the prologue's angle)
  boss:       { type: 'rail',  from: [-8.5, 4.8, -22.6], to: [8.5, 4.8, -22.6], look: 'player',
                base: [0.0, 1.0, -14.6], limit: 0.6, fov: 60 },                                   // 3.4 (see bossCam)
  hold_no:    { type: 'fixed', pos: [-4.2, 2.05, -14.8], look: [-2.6, 2.0, -11.25], fov: 44 },   // 3.6 over his right shoulder onto the glass
},
```

**`bossCam`** (data for the boss's custom camera, ARCHITECTURE/§15.4 option b — mutate a `'fixed'` override from the
boss `update`, allocation-free): lens rides the north-wall rail **z −22.6, y 4.8, x ∈ [−8.5, 8.5]**; target =
`lerp(console (0, 1.0, −15.4), activeChase, 0.5)`; lens x = target.x + **3.2 × side**, where `side` (−1 / +1) eases
over **1.2 s** toward the half of the room the newest live drone came from (hatch_w/port_w → −1; hatch_e/port_e → +1;
centre hatches keep the current side); look damping 1.0 s, lens damping 1.5 s; FOV 60 (66 on narrow screens). From
there the whole floor from the console to the glass reads at 27–35° down, the drones' cones on the black floor read as
blue fans, and the storm city fills the top third.

### 7.2 Zones (first match wins; they tile the room)

| # | box | cam | covers |
| --- | --- | --- | --- |
| 1 | [−12.0, −23.2, −4.0, −11.2] | `boss` | west third (desk, chair, cabinets) |
| 2 | [−4.0, −23.2, 4.0, −11.2] | `boss` | centre (console, planter, the pop-up) |
| 3 | [4.0, −23.2, 12.0, −11.2] | `boss` | east third (sofa, hatch, lift) |

(One cam for all three = no cuts during the fight. In 3.6, content `cam.override('set', { name: 'hold_no' })`.)

### 7.3 Spawns (`spawns`, for the boss)

```js
spawns: {
  hatch_w:  { at: [-7.5, 5.0, -19.0], exit: [-7.5, 3.2, -18.4], side: -1 },
  hatch_cw: { at: [-2.0, 5.0, -17.6], exit: [-2.0, 3.0, -17.2], side:  0 },
  hatch_ce: { at: [ 2.0, 5.0, -17.6], exit: [ 2.0, 3.0, -17.2], side:  0 },
  hatch_e:  { at: [ 7.5, 5.0, -19.0], exit: [ 7.5, 3.2, -18.4], side: +1 },
  port_w:   { at: [-7.5, 3.8, -10.4], exit: [-7.5, 3.4, -12.4], side: -1 },   // flies in from outside through the iris
  port_e:   { at: [ 7.5, 3.8, -10.4], exit: [ 7.5, 3.4, -12.4], side: +1 },
},
```

The boss calls `drone_hatches.open(i, 1)` / `drone_ports.open(i, 1)` 0.6 s before a spawn and closes them 1 s after.
Waves by spec §10. Cleaning drones call `slicks.show(i, x, z, ry)` on the streak they polish (6 s slippery: the boss
owns the physics). **3.5 strike:** the Guardian falls from `hatch_cw` (5.0 → 1.2 m) straight onto `console_luka` in
0.45 s.

---

## 8. Hotspots

None. P, 2.5, 3.3 and 3.5 are cutscenes; 3.4 is the `boss` mini-game (it owns all input); 3.6's only action is the
`hold_no` mini-game on `glass_ui`. **No kettle on this set** (no roam, and the room must hold nothing personal;
`hq_floors` L21 is the last save before the top).

---

## 9. Cutscene needs (shots → geometry that must exist)

**P — "Do Not Disturb"** (`dress('p')`, env `midday`, `lamp('desk')`, music none; ambience storm far + drone hum)

1. BLACK.
2. ECU · locked `glass_popup` (→ `glass_popup_ecu`): `glass_ui.popup('yes_only')` with the **Scheduled** line; the
   cursor drifts from (0.85, 0.85) toward YES and stops 0.04 short (`cursor(u, v)` over 2.2 s, then hold 3 s). Needs:
   the pop-up's empty NO-shaped slot clearly drawn.
3. INSERT · slow track `p_desk_track_a → _b` (4 s): the black-gloss desk reflecting the storm (`t_desk`), ending on
   the face-down frame; the gloved hand (F.Luka at `p_mgr_desk`, hood up, `reach` arm pose) enters, rests 1.5 s, leaves.
4. WIDE · high `far_corner`: F.Luka at `mgr_glass`, back to camera; the empty chair to his left; fireflies drifting
   outside; `aide_drone.fly('p_drone_in', 'p_drone_shoulder', 3.5)` glides in through the dark and stops at his shoulder.
5. DRONE line (`aide_drone.talk(true)`).
6. CLOSE `p_back_head`. 7–8 lines.
9. MID `p_shoulder_chair` — **hint 1**: the glance (`act glance` to his left, ~25°, 0.6 s, back). No music.
10–12 lines (the 2 s pause is a `wait`, not a stare).
13. ECU `glass_moon`: `glass_ui.popup('dnd')`.
14. BLACK, title.

**2.5_manager** (`dress('s25')`, env `cutaway`, `lamp('off')`): `s25_wide` — F.Luka at `s25_mgr`, the footage
(`glass_ui.popup('footage')`: `t_footage` looping) small and low-res on the glass, the hazy city around it; a slow push
of 0.4 m over the shot. `aide_drone` at `s25_drone` says "Yes, sir." Needs nothing else.

**3.3 — "The Manager"** (`dress('s33')`, env `storm_dry` → `{env:'storm', dur:4}` during step 1, `lamp('console')`)

1. WIDE · high `far_corner` (the prologue's angle, exactly): rain begins on the glass (`glass_rain` follows), the
   pop-up `yes_only` (no Scheduled line now; the clock above reads 11:41 / QUIET IN 00:17:00, `clockRun(1)`), the desk,
   the face-down photo, the empty chair to its left; `galaxy.mode('idle')` — 24 drones hanging around the room.
2. MID `s33_ladder`: `maint_hatch` open + ladder extended; the three climb `s33_ladder_top → _foot` and drop to
   `s33_drop_*`. The live mirror shows their reflections on the black floor.
3. WIDE `s33_from_behind`: the figure at the far end at `mgr_glass`; `galaxy.watch(8.4, 1.4, −13.0, 1.2)` — every
   light turns toward the intruders; they don't move.
11. MID: he turns (`mgr_turn`). 12 INSERT `s33_badge` (rig badge flip, biro **1158**). 13–14 CLOSEs (framing; Luka's
    badge is his rig's). 15 CLOSE hood down (rig `hood(false)`); `ui.nameGlitch('manager', 'luka40')`.
16. The glance to his left at Chase (2040) (`s33_drop_c40` is the north/left side of the group); the empty chair sits
    at the frame edge (frame `luka40` CLOSE from the south-east, so the chair at (−8.5, −13.6), north-east of him, sits at the screen-right
    edge).
21. TOP-DOWN Chase (2040) at `s33_c40_mid`. 22 no music, rain on glass. 23 TWO-SHOT `s33_two_lukas`.
41. `s33_glass_talk` as he walks to `s33_l40_glass`. 51 `s33_l40_turn` + `galaxy.watch(…, 0.8)` (the drones turn with him).
52. INSERT `console`, then `usb_port` (`console.port(true)`: the hairline ring lights).
63. ORBIT around Chase (2040) at `s33_c40_mid` (speeding up; clear radius 2.7 m: nearest obstacles the sofa 2.75 m,
    the ladder 4.6 m).
70. MID Luka at `console_luka`: `luka_phone.state('docked')`, cable to the port; `console.screen('password', '')`.
71. INSERT `s33_thumbs` + `console_screen` typing `beforelunch` (content feeds the string letter by letter).
72. INSERT `console.screen('granted')`. 74. WIDE `s33_red`: `galaxy.color('red', 0)` at once.

**3.4 — boss** (`dress('s34')`, env `boss`, `reflect('baked')`, `lamp('console')`): `galaxy.visible = false`; the boss
mini-game owns drones, the glass clock (`clock({h:11, m:43, …, quiet:'00:15:00'})`, `clockRun(r)` so 15:00 → 04:00
by 85%), `console.screen('hack', pct)`, `luka_phone.screen('hack', pct)`; at 50% `storm_flash` → `boss` + `lights.flicker(1.2)`.

**3.5 — "99%"** (`dress('s35')`, env `storm`, `reflect('live')`)

- 3.5_foam: content freezes the boss drones and calls `galaxy.seed(positions)` + `galaxy.hang()` + `galaxy.visible =
  true` (then `DRONES.clear()`); the Chases are placed at `s35_chase` / `s35_c40` (cut on the CLOSE of F.Luka's closed
  eyes hides the snap). WIDE `s35_foam_wide`: `vents.open(1)`, `foam.bloom(0, 0, −16.2, 1.2)` (Luka), `bloom(1, −8, −17,
  1.2)`, `bloom(2, 4, −17, 1.2)`; the Tether drops (content). INSERT `s35_phone` (HACK 85% … 86%). WIDE · locked, low
  `s35_locked_low`: F.Luka walks among them; `glass_rain.boost(1.5)`.
- The pleas: slow push-ins on each speaker; reverses on F.Luka at `s35_l40_by_chase`, `_by_c40`, `_by_luka`.
- 3.5_almost: `desk_photo_turn` → `photo_frame.state('held')` (content attaches the frame to his hand) → INSERT the
  photo CARD → CLOSE his hand trembling → ECU `glass_popup_ecu` with `popup('no_flicker')` for exactly one frame, then
  `yes_only` → WIDE `foam.soften(0.3)` → CLOSE (hold 3 s) → INSERT `glass_clock` **11:57** (`clock({h:11, m:57,
  sec:false, quiet:'00:01:00'})`) + thunder → CLOSE → he puts the photo back `photo_frame.state('down')` → `foam.harden()`
  → INSERT `console_screen` HACK 98% → he steps to `s35_l40_end` → CLOSE "I'm sorry." → two fingers.
- 3.5_strike (no humour): WIDE `s35_strike_wide`: `drone_hatches.open(1, 1)`, a Guardian (content `DRONES.spawn` or a
  dedicated instance) falls to Luka; at impact: `ui.flash` (Reduce Flashing → dull orange bloom), `foam.burst(0)`, Luka
  thrown (content `moveTo` fast arc to `s35_luka_wall`, 0.35 s), `wall_crack.visible = true`, `luka_badge.place
  ('s35_badge')`, `luka_phone.state('dangling')` + `screen('cracked', 98)`, `{env:'strike', dur:0.3}`, `lamp('wall')`.
  WIDE · locked low `s35_wall_low`. CLOSEs. `foam.sag(1, 2.5)`, `foam.sag(2, 2.5)`. INSERT `s35_cracked_phone` 99%.
  `s35_wall_low` hold 4 s. … CLOSE his hand translucent (rig). INSERT 100%. ECU Luka's eye. WIDE · locked low
  `s35_wall_low`: he gets up to `s35_luka_up`; `luka_badge.visible = false` when he picks up the lanyard.
- TWO-SHOT `s35_lukas_two`. LOW `s35_luka_low` (the wave). WIDE `s35_ring_wide`: `galaxy.watch(F.Luka)`, a SafeSense
  pop-up **IDENTITY CONFIRMED: MANAGER** over the nearest drone (content `popup({ at: [x,y,z] })`), `galaxy.ring(-3.0,
  -13.8, 2.3, 1.9, 3.0)`, `galaxy.color('blue', 0.8)` then `('yellow', 1.2)`, `{env:'yellow', dur:1.5}`, `lamp('ring')`;
  `glass_ui.clock({h:11, m:57, s:30, sec:true, paused:true})`, `clockRun(0)`.

**3.6 — "two"** (`dress('s36')`)

- Chase walks to `s36_chase_l40`; `galaxy.part(angleTowardChase, 0.9)`. TWO-SHOT. Headphones (rig attachments move
  from Chase to F.Luka). INSERT Chase's thumb: Play, the file **two** — on **Chase's own phone** (an actor-held prop
  with a `CARDS.phone` INSERT), not `luka_phone`. The push-in on F.Luka (one unbroken push, framing). TOP-DOWN Chase (2040) at `s36_c40`. MID Luka at the wall.
- WIDE `s36_ring_wide`. INSERT `glass_popup` `yes_only`. CLOSE Luka limps to `console_luka`, pulls the cracked phone
  (`luka_phone.state('pulled')`), taps it → INSERT `glass_popup('yes_no')`. "Your call."
- PLAY Hold NO (`hold_no` mini-game): cam `hold_no`; F.Luka at `s36_l40_glass`; the mini-game drives
  `glass_ui.cursor(u, v)`, `popup('yes_grey')` after the second YES attempt, `hold(k)` for the 3 s ring.
- INSERT NO. SAFESENSE line; `popup('cancelled')`. INSERT `glass_clock`: `clock({h:11, m:57, s:30, sec:true})`,
  `clockRun(1)` → 11:57:59 (content may jump to 11:57:55 for the last beats) → **11:58** (`sec:false`, QUIET line off).
- WIDE `s36_valley` (env `{env:'lit', dur:2}`): `skyline.lit(1.0, 2)`, `swing(true)`, `crowd('look_up')`,
  `bridgeLights(true)`, `facade_glow.zero(2)`, `fireflies.scatter()`. Steps 26–27: cut to `valley` (`lit36`) if live,
  else `s36_mall_fallback`.
- INSERT `console_screen` `screen('restart')` on the three rising notes. CLOSE F.Luka, headphones off. WIDE
  `s36_ring_wide`: `galaxy.land(4)`.

---

## 10. Ambience and `update(dt, ctx)`

**Ambience** (default `ambience: { rain: false, loops: ['hq_hush', 'drone_idle', 'thunder_far'], room: 'room' }`; the
`room` stays `'room'` so env rain is heard muffled through the glass; `dress()` re-sends per state, guarded by `typeof
AUDIO !== 'undefined'`).

| State | Loops | Notes |
| --- | --- | --- |
| `p`, `s25` | `hq_hush` (HVAC hush, very low), `drone_idle` (2 positional handles moved to the nearest firefly/aide drone), `thunder_far` (one-shots on a timer: 14–28 s) | P music none |
| `s33` | + `rain_glass` (fades in with step 1), `drone_idle` (positional handles move to the nearest galaxy drones) | |
| `s34` | `rain_glass` heavy, `hq_hush`; the boss adds its own SFX | thunder at 50% |
| `s35` | `rain_glass` hammering; after the strike: content `music.silence(true)` + the `tinnitus` loop; rain ducked −18 dB ("as if heard through water") | |
| `s36` | `rain_glass`; at 11:58 + `valley_music_far` (bars bursting out along Brunswick St, through glass, 400 Hz LP) | the song is music |

**`update(dt, ctx)` — no allocation** (module-level `Matrix4`, `Vector3`, `Quaternion`, `Color`; named functions; no
closures in the loop).

1. Scene change → `dress(AUTO[state.scene] || R.state)`; env-name change → `lamp`/ambience per state.
2. **Rain on glass**: `M.rainGlass.opacity = 0.35 × R.rain.uniforms.uAmount.value × R.boost`; two texture offsets
   scroll down at 0.11 and 0.17 /s (droplet layer jitters by a seeded table).
3. **Ambient lightning** (storm states only, not in `p`/`s25`): every 12–25 s `skyline.flash(1)` (cloud cards only);
   the glass material's colour lifts to white for 0.12 s (Reduce Flashing: a 1.5 s swell to 40%); thunder one-shot
   1.2–3.0 s later (`AUDIO.sfx('thunder', {vol})` with a reused options object).
4. **Fireflies** (14): each on a Lissajous drift (amplitudes 0.4–0.9 m, periods 7–13 s, per-instance phase) around
   its home; lights breathe ±15%. `scatter()` adds a slow down-and-out velocity.
5. **Galaxy** (24) by mode: `idle` — each on a slow orbit around the room centre (0, y, −17.2): radii 4.0–10.5 m
   (x-scaled ×1.0, z-scaled ×0.48 so they stay inside), y 2.2–4.4, ω 0.02–0.05 rad/s, ±0.08 m bob; `watch` — yaw each
   instance toward the target (eased); `hang` — positions frozen, bob ±0.03; `ring` — each slot eases (smoothstep,
   per-instance stagger 0–0.6 s) to its ring position; `part` — slots within the gap angle slide ±0.6 rad aside;
   `land` — one by one to floor positions on a 2.9 m circle, y 0.12, lights to 40%. Colour transitions lerp
   instanceColor over `dur`. Write matrices only when moving; `instanceMatrix.needsUpdate` once per frame.
6. **Glass UI**: repaint the canvas only when its displayed content changes (mode, cursor moved > 1 px, clock second
   changed, hold ring step of 1/64); digits drawn from a pre-rendered digit atlas with `drawImage` (no string building
   in the frame loop).
7. **Console / phone screens**: repaint on change only; `luka_phone` dangling pendulum (decaying sine).
8. **Hatches / ports / vents / maint hatch**: ease to targets (smoothstep).
9. **Foam**: blob scale/wobble per state; colliders follow in place (parked at 1e4 when gone).
10. **Lights**: `flicker` table-driven bursts; else steady `level`.
11. **Slicks**: fade timers.
12. **Aide drone**: `fly` interpolation (banked toward travel), bob, `talk` pulse.
13. `skyline.userData.update(dt, ctx.t)`; `facade_glow` fade.
14. **Mirror**: live mode updates in the mirror mesh's `onBeforeRender` (hq_floors §3.2), nothing here.

---

## 11. Performance budget (target < 300; expected ≈ 95 baked / ≈ 180 live mirror)

| Group | Draw calls |
| --- | --- |
| Static: `M.vc` 1, `M.atlas` 1, `M.desk` 1, `M.glass` 1, `M.glow` 1, floor 1 (+ baked mirror copy 2) | 8 |
| Glass UI 2, glass rain 1, console 2, phone + cable 2, frame 1, chair 2, maint hatch + ladder 2, drone hatches 4, ports 2, lift plate 0 (merged) | 18 |
| Instanced: galaxy 2, fireflies 2, vents 1, slicks 1 | 6 |
| Foam 3, wall crack 1, badge 1, aide drone 2, facade glow 2 | 9 |
| `skyline()` | ~16 |
| Rain points | 1 |
| Rigs: up to 4 actors (≈ 3 each) | ~12 |
| Boss drones (≤ 14 × 2) + their blob shadows | ~30 |
| **Live mirror** (re-renders the visible scene minus the floor at 256²) | ×≈ 1.9 in cutscenes only |

Rules: merge everything static into `M.vc`; every repeat instanced; the mirror is `baked` during 3.4 gameplay and on
touch / low pixel ratio; no shadow maps; textures ≤ 256 px; no per-frame allocation; canvases repaint only on change.

---

## 12. API summary and data exports

### 12.1 `SETS.hq_top`

```js
SETS.hq_top = {
  env, build, marks, anchors, cams, zones, colliders, props, ambience, update,
  dress(state),          // 'p' | 's25' | 's33' | 's34' | 's35' | 's36'
  lamp(name),            // 'desk' | 'console' | 'glass' | 'wall' | 'ring' | 'mgr' (the chest at mgr_turn) | 'off'
  flash(k),              // a visual-only lightning pulse (sky + glass); respects Reduce Flashing
  reflect(mode),         // 'live' | 'baked'
  spawns,                // §7.3
  vents: [[-8,-20.4],[-4,-20.4],[0,-20.4],[4,-20.4],[8,-20.4],[-8,-17.0],[-4,-17.0],[0,-17.0],[4,-17.0],[8,-17.0],
          [-4,-13.6],[0,-13.6],[4,-13.6],[8,-13.6]],
  bossCam,               // §7.1
  ar,                    // §12.4
};
```

**AUTO dress map**: `{ 'P': 'p', '2.5': 's25', '3.3': 's33', '3.4': 's34', '3.5': 's35', '3.6': 's36' }` (2.5's cutaway
loads this set mid-scene: the AUTO entry applies when the set is shown during 2.5).

### 12.2 Dress states

| State | Env | Glass UI | Clock | Galaxy | Fireflies | Rain | Vents/foam | Console / phone | Photo | Mirror | Lamp |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `p` | `midday` | `yes_only` + Scheduled | off | hidden | 14 blue | 0 | closed | idle / hidden | down | live | `desk` |
| `s25` | `cutaway` | `footage` | off | hidden | 14 blue | 0 | closed | idle / hidden | down | live | `off` |
| `s33` | `storm_dry` → `storm` | `yes_only` | 11:41 · QUIET IN 00:17:00, run 1 | `idle` blue | 14 | 0 → 0.7 | closed | idle → password → granted / docked | down | live | `console` |
| `s34` | `boss` | `yes_only` | compressed (boss drives) | hidden | 8 (6 hidden: "they came in") | 0.85 | closed | hack % / docked | down | **baked** | `console` |
| `s35` | `storm` → `strike` → `yellow` | `yes_only` (+ one-frame `no_flicker`) | 11:5x → 11:57:30 PAUSED | seeded `hang` → `ring` → yellow | 8 | 0.85–0.9 | open, foam | hack → cracked / docked → dangling | down → up → down | live | `console` → `wall` → `ring` |
| `s36` | `yellow` → `lit` | `yes_only` → `yes_no` → `cancelled` | 11:57:30 → 11:58 | ring yellow → part → land | scatter at 11:58 | 0.9 → 1.0 | gone | restart / pulled | down | live | `ring` |

### 12.3 Story numbers

Glass clock: 3.3 start 11:41:00, QUIET IN 00:17:00 (real-time run). 3.4: the boss maps hack% to QUIET IN 15:00 →
04:00 and the clock 11:43 → 11:54. 3.5: 11:54 → 11:57 (INSERT at step 22) → **11:57:30 PAUSED** (step 55). 3.6:
11:57:30 → 11:58:00. HUD QUIET IN is story time (spec §13.4); the glass is cosmetic.

### 12.4 `ar` (Chip View — only relevant in 3.4 when Chase (2040) is active; content adds them with the boss)

```js
ar: [
  { id: 'ar_optout',  at: [-3.0, 4.4, -11.4],  text: 'OPT-OUT · ALL USERS · 11:58', kind: 'sign', w: 3.0 },
  { id: 'ar_console', at: [0.0, 1.8, -15.4],   text: 'MASTER CONSOLE · wireless (mostly)', kind: 'sign', w: 2.2 },
  { id: 'ar_vents',   at: [0.0, 0.3, -17.0],   text: 'SAFE MODE · FOAM READY', kind: 'sign', w: 1.8 },
  { id: 'ar_lift',    at: [11.9, 2.4, -20.7],  text: 'PRIVATE · L30 · ROOF', kind: 'sign', w: 1.6 },
]
```

(The pop-up hazards in Chase (2040)'s eyes are the boss's, spec §10.)

### 12.5 Engine / cross-set notes

1. Uses `SETS.valley.skyline` (valley.md §12.5) and `SETS.hq_floors.makeMirror` (hq_floors.md §3.2). Both optional:
   fall back to a horizon band and the baked mirror; never throw.
2. `world.torchAuto` is set `false` by `lamp()` and `true` by `lamp('off')`; please reset it in `showE()`.
3. The private lift shaft (VG x 12.4…15.0, z −22.0…−19.4) and the maintenance hatch (VG (8.0, −12.9)) are shared
   with `hq_floors` L30 and `hq_roof` — keep them identical if anything moves.
4. Speaker → actor: `say('manager', …)` animates `luka40` (ARCHITECTURE §5); the hood state and the name glitch are
   content's; the set only provides marks.
5. The boss camera needs the eased-override hook in `30-world.js` (world.md §15.4 item 2); `bossCam` is the data.
