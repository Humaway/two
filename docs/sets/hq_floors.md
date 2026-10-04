# SET `hq_floors` — Optus Tower service floors L12, L21, L30 (Christmas Eve 2040, 10:40)

File `src/20-set-hq-floors.js` · `SETS.hq_floors` · Scene **3.2** "Spotless" (everything before the roof): **L12**
"Confiscated for Your Safety" (robotic archive, two-person shelf controls, the trampoline bin, the headphones wall),
**L21** "The Oldest Line" (server rows, the 1987 wall jack, the kettle cord, the Hack, the cooling interlock, the
maintenance hatch), **L30** "The Hangar" (hundreds of docked drones, drone stealth hard mode, the charging rack on a
rail, the MANAGER ONLY lift and its ROOF ACCESS panel). Same contract as Rue's `SETS.reddy`
(`ref/rue/05-set-reddy-optus-redcliffe-2026.js`): `{ env, build, marks, anchors, cams, zones, colliders, props,
ambience, update }` plus `dress(state)`, `lamp(name)`, `paths`, `checkpoints`, `ar`, and the shared helper
**`makeMirror()`** (§3.2) that `hq_top` also uses.

**Shared geography.** Plans follow the **Valley Grid** (`docs/sets/valley.md` §12.3): metres, Y up, **+X east, +Z
south**, tower footprint VG x −18…18, z −41…−11. The engine's zones and colliders are **XZ-only**, so three stacked
floors can't share XZ. Each floor is therefore a **pad laid side by side along X, every floor at y = 0**:

| Floor | VG floor level | Set X range | **set x = VG x + OX** | Ceiling |
| --- | --- | --- | --- | --- |
| **L12** | y 49.5 | −66…−30 | OX = **−48** | 3.6 |
| **L21** | y 85.5 | −18…+18 | OX = **0** | 3.2 |
| **L30** | y 121.5 | +30…+66 | OX = **+48** | 3.9 |

z is VG z on every floor. Only the active floor's group is visible (`dress`). Vertical links keep VG XZ: the service
lift (VG x −6.1…−3.9, z −43.0…−40.8, same car as `hq_atrium`), the stair core (VG x 13.0…17.6, z −24.0…−16.0), the
L21→L30 maintenance hatch (VG (−11.8, −16.6)), and the private-lift shaft (VG x 12.4…15.0, z −22.0…−19.4, shared with
`hq_top` and `hq_roof`).

---

## 0. Decisions (read first)

1. **Three compact floors, one route each.** L12: lift → control aisle → the gap → bins hall → stair door. L21: stair
   landing → east strip (tea point) → the AR trail through the rack aisles → the jack (SW) → back for the kettle cord →
   wiring + Hack → the two valves (NW / NE) → the hatch (SW). L30: floor hatch (W) → band A → lane L1 → push the rack →
   lane L2 → band C → the MANAGER ONLY lift (E). Everything beyond the route is fenced or racked off and sinks into fog,
   so the floors feel vast while the walkable areas stay small and readable.
2. **Spotless (hint 5).** Every floor is **mirror-polished** and has small disc **cleaning drones** gliding over it.
   Floors are real planar reflections (`makeMirror`, live) on desktop, baked mirrored geometry elsewhere. The L12
   arrival shot is composed on the reflection: "a floor so clean it reflects them".
3. **Physical vs AR.** Physical (readable at anchors): the bank's category plates, **HEARING PROTECTION INITIATIVE
   2038**, **REDCLIFFE 2038 · NOISE**, SKATEBOARDS, KITCHEN KNIVES · BRISBANE, LADDERS, FIREWORKS, SCISSORS,
   TRAMPOLINES, the stair signs, **STAIRWELL SEALED · for your safety**, the masking-tape **JARVIS — 1987 — DO NOT
   UNPLUG**, TEA POINT, **MANAGER ONLY**, the side panel **ROOF ACCESS — SANTA PHOTO 11:30 — AUTHORISED: SANTA**, the
   lift panel **G · 12 · 21 · 30**. AR only (Chip View): area signs, the "old" cable trail, patrol paths (§12.4).
4. **Two-person switches are 21–27 m apart** (the shelf controls at both ends of the control aisle; the valves on the
   west and east walls), each end with its own fixed camera, so the swap is the only way to see both.
5. **Stealth is L21-light and L30-hard.** L21: two courtesy patrols on the trail's aisle/cross-aisle + Signal risk.
   L30: five drones (two lane patrols, a long-coned sentinel, a band patrol, a lift "doorman"), one push-rack, two
   dropped phones and a speaker as lure points. Every stealth zone's camera is high (3.5–3.7 m) and looks along or
   across the lane so the floor cones read as fans.
6. `dress(state)`: `l12`, `l21`, `l30` (one floor visible; §12.2). Puzzle progress lives on prop APIs (gap, bin,
   valves, hatch, rack) so retries never undo it.

---

## 1. Purpose and scenes

| Beat (3.2) | Story time | Env preset | Dress | What happens |
| --- | --- | --- | --- | --- |
| L12 arrival | Mon 24 Dec 2040, 10:40 | `lift` → `l12` | `l12` | inside the service lift (matches `hq_atrium`'s car); the doors open on a floor so clean it reflects them; LUKA "…Someone's got standards."; PA: "You shouldn't be here." |
| ▶ L12 PLAY | ~10:41 | `l12` | `l12` | examine skateboards / guitars / knives / ladders; take the headphones (required); the two-person shelf controls open the gap; Luka pushes the trampoline bin out of the stair doorway; stairs to L21 |
| L21 arrival | ~10:48 | `l21` | `l21` | the stair landing, the up-flight sealed; the door to the server floor; PA: "Go home. ^ You're not safe here." |
| ▶ L21 PLAY | ~10:49 | `l21` | `l21` | Chip View trail to the oldest port; the kettle cord from the tea point; **Wiring** (kettle cord); **Hack** (intro, 3 pop-ups, HACK % HUD); the cooling interlock; fog rolls out (`l21_fog`); the hatch opens |
| L21 → L30 | ~11:05 | `l21_fog` → `l30` | `l21` → `l30` | up the hatch ladder; emerge through L30's floor hatch; WIDE the hangar; PA: "Chase. ^ Go home. ^ Please." |
| ▶ L30 PLAY | ~11:06 | `l30` | `l30` | drone stealth (hard): Chip View patrol paths, lures, Luka pushes the charging rack M1; reach the private lift |
| The private lift | ~11:35 | `l30` → `car30` | `l30` | MANAGER ONLY; the side panel **ROOF ACCESS — SANTA PHOTO 11:30 — AUTHORISED: SANTA**; "…Santa's got roof access." / "Santa's got roof access."; the lift takes Santa and his elves up → `hq_roof` |

Time card `Monday 24 December 2040, 10:40` · place `Optus Tower, Level 12`. HUD: QUIET IN 01:18:00 (story time); HACK %
on L21 during the Hack only. Music `hq` (sterile synth, hum, the slow swish of cleaning drones); `stealth` on L30.
Weather outside (seen only through L30's south glass): the storm sitting on the city, dark green-grey, dry.

**Set lifetime.** Built under the 3.1_lift fade (`hq_atrium` stays live, liveMax 2; `valley` retires). During the L30
lift ride content preloads `hq_roof` under the black (liveMax 3); `hq_floors` retires when `hq_top` loads.

---

## 2. Layout

### 2.1 Axes and conventions

- Set coordinates: x = VG x + OX (per floor), y = height above that floor's slab, z = VG z. Every walkable surface is
  `y = 0` (no `floor()` needed; the stair landing and the hatch climbs are scripted).
- Mark facing `ry`: the actor faces `(sin ry, cos ry)` → `0` faces **+Z (south)**, `PI` **−Z (north)**, `H` **+X
  (east)**, `-H` **−X (west)**.
- Looking north (−Z), screen-right is +X (east); looking west (−X), screen-right is −Z (north).
- Boxes and colliders `[x0, z0, x1, z1]`.

### 2.2 L12 — "Confiscated for Your Safety" (set x −66…−30)

```
 z −43.0            ┌ lift car x −54.1…−51.9 ┐
 z −40.6 ═══════════╧═══[DOORS x −53.8…−52.2]╧═══════ north wall ═════════════════════════════════════
         │ deep archive │ block A (static shelving)│   LOBBY x −57…−49   │ block B (static shelving)        │
         │  (fenced,    │ ▤ SKATEBOARDS (−59)      │   PA ◎ (−53,−38.4)  │ ▤ KNIVES (−45)  ▤ LADDERS (−41)  │
 z −36.4 │  fog)        ├──────────────── CONTROL AISLE x −61…−39, z −36.4…−34.0 ────────────────────────┤
         │  robot lane  │[CTRL W] x −60.9                                                   [CTRL E] x −39.1│
 z −34.0 │  x −64.5…−62 ├─ MOBILE SHELF BANK: 12 units 1.7 × 7.0 × 2.8 on E–W rails ──────┬───────────────┤
         │  2 shelf     │  ▥▥▥▥▥▥ ░gap░ ▥▥▥▥▥▥    gap opens at x −50.8…−49.2             │ wall          │
 z −27.0 │  robots      ├───────────────────── BINS HALL x −61…−35, z −27…−15.4 ─────────┴────────┬──────┤
         │  glide N–S   │ ▣FIREWORKS(−58.8,−18.6)   ▣ GUITARS · REDCLIFFE 2038 · NOISE (−55.5,−21.8)│STAIR │
         │              │                           ▣ SCISSORS (−51.6,−18.6)    [TRAMPOLINE BIN]═╡DOOR  │
         │              │                                                      (−35.5,−20.0)    │x −35 │
 z −15.4 │              └── HEADPHONES WALL x −60…−48, y 0.4…2.6 · HEARING PROTECTION INITIATIVE 2038 ──┘core │
          x −66      −61       −57             −50            −45          −39        −35      −30.4
```

| Thing | Where (set) | Notes |
| --- | --- | --- |
| **Service lift car** | x −54.1…−51.9, z −43.0…−40.8, y 0…2.5; doors in the north wall x −53.8…−52.2 (one steel leaf sliding west); **panel** on the east wall (−51.92, 1.25, −41.15): **SERVICE LIFT · G · 12 · 21 · 30**; ceiling speaker grille (−53.0, 2.48, −41.9); quilted grey blankets | identical to `hq_atrium`'s car (VG −6.1…−3.9) |
| Lobby | x −57.0…−49.0, z −40.6…−36.4 | PA grille (−53.0, 3.58, −38.4) |
| Static shelving | block A x −66…−57, block B x −49…−30, z −40.6…−36.4; 2.9 h; open-fronted **labelled bins** on the aisle faces | the aisle's north side |
| Examine bins (block faces, z −36.42) | **SKATEBOARDS** (−59.0, 1.0); **KITCHEN KNIVES · BRISBANE** (−45.0, 1.25); **LADDERS** rack x −42.6…−39.4 (aluminium ladders on brackets at y 0.6 / 1.2 / 1.8) | |
| **Control aisle** | x −61.0…−39.0, z −36.4…−34.0 (2.4 wide, 22 long) | |
| **Shelf controls** | `ctrl_w` panel on the fence post (−60.9, 1.1, −35.2) facing +X; `ctrl_e` on the east wall (−39.1, 1.1, −35.2) facing −X; each a SafeSense panel with a big hold button and a "HOLD BOTH" pictogram | 21.8 m apart |
| West fence | x −61.2…−61.0, z −36.4…−15.4; mesh, 2.4 h | the robot lane behind it |
| **Mobile shelf bank** | x −61.0…−39.0, z −34.0…−27.0; **12 units** 1.7 (x) × 7.0 (z) × 2.8 h on two floor rails (z −33.0, −28.0); end plates (both ends) carry category labels; amber beacon on each top; a big hand wheel on each north end | closed: unit `i` centre `x = −61.0 + 0.973 + 1.823 i` (0.123 slivers); **open**: units 0–5 centre `−60.15 + 1.7 i`, units 6–11 centre `−48.35 + 1.7 (i−6)` → **gap x −50.8…−49.2** (VG −2.0) |
| Bank labels (north ends, west→east) | SKATEBOARDS (OVERFLOW) · POOL NOODLES · PARTY POPPERS · WHISTLES · BICYCLE BELLS · TRUMPETS · SPARKLERS · MEGAPHONES · WIND CHIMES · DRUMS · CAP GUNS · BALLOONS (south ends repeat them) | flavour |
| **Bins hall** | x −61.0…−35.0, z −27.0…−15.4 | |
| **Guitars bin** | cage bin (−55.5, 0, −21.8), 1.8 × 1.0 × 0.9 h; plate **REDCLIFFE 2038 · NOISE** on its north face (z −22.3, y 0.75); 9 guitars sticking up; **Chase (2040)'s battered acoustic** at the front (stickers, a scorch on the headstock) | |
| Fireworks / scissors bins | (−58.8, 0, −18.6) / (−51.6, 0, −18.6), 1.6 × 1.0 × 0.8 h, plates FIREWORKS / SCISSORS | |
| **Headphones wall** | pegboard on the south partition z −15.4, x −60.0…−48.0, y 0.4…2.6, **≈ 300 headphones** (IM); sign **HEARING PROTECTION INITIATIVE 2038** at (−54.0, 2.95, −15.42), 6.0 × 0.4 | the pair Chase takes: `headphones_pick` at (−54.0, 1.45, −15.35) |
| **Stair door** | east wall x −35.0, z −20.6…−19.4, 2.2 h, leaf opens east; sign **STAIRWELL** (y 2.35); stair core x −35.0…−30.4, z −24.0…−16.0 (a dark landing stub, steps up) | |
| **Trampoline bin** | rolling cage 1.0 (x) × 1.6 (z) × 1.7 h, folded round trampolines (black mats, blue padded rims), plate TRAMPOLINES; parked **in the doorway**: x −36.0…−35.0, z −20.8…−19.2 | pushed north 3.4 m to z −24.2…−22.6 |
| Robot lane (behind the fence) | x −64.5…−62.0, z −40…−16; two shelf robots (squat white bases carrying 0.9 × 0.9 × 2.6 shelf towers, blue status light) | ambient, ping-pong 0.6 m/s |
| Ceiling | y 3.6, white panels, 4 cold LED strips E–W | |

### 2.3 L21 — "The Oldest Line" (set x = VG)

```
 z −37.0 ┌─W STRIP x −14…−10──┬─────────────── A0 (north cross-aisle) z −37…−34.2 ─────────────┬─E STRIP x 8…13──┐
         │ ⊛VALVE W           │ ═══════ R1 z −34.2…−33.0 ═══════ ▯gap x 1.0…2.4 ══════════════ │      ⊛VALVE E  │
 z −32.4 │ (−13.8,1.15,−32.4) │ A1 z −33.0…−30.2                                              │ (12.8,1.15,…)  │
         │                    │ ═════ R2 ═════ ▯gap x −5.4…−4.0 ═══════════════════════════════ │                │
 z −27.6 │                    │ A2 z −29.0…−26.2   ← d21_a2 patrols                           │                │
         │                    │ ══════════════════════════════════ ▯gap x 3.6…5.0 ═══ R3 ══════ │                │
 z −24.4 │ ▓brick 1987▓       │ A3 z −25.0…−22.2                                              │  PA ◎ (11,−21) │
 z −23.4 │ ◈ JACK (−13.96,0.45)│ ══════════ R4 + CRAC units (solid) x −10…8, z −22.2…−15.4 ════ │ ▮DOOR x 13.0  ║landing
         │                    │                                                               │ z −20.6…−19.4 ║(sealed
 z −16.6 │ ⊡ HATCH (−11.8,−16.6)│                                                              │ ▭ TEA POINT    ║ up-flight)
 z −15.4 └────────────────────┴───────────────────────────────────────────────────────────────┴ x 12.4…13.0 ──┘
        x −14               −10                          0                                    8              13   17.6
```

| Thing | Where | Notes |
| --- | --- | --- |
| Floor | walkable x −14.0…13.0, z −37.0…−15.4; raised-floor tiles 0.6 grid, dark blue-grey, mirror-polished | ceiling 3.2, cable trays at y 2.95 over every aisle |
| **Rack rows** (E–W, 2.2 h, glass doors with LED dots, both faces) | R1 z −34.2…−33.0 (gap x 1.0…2.4); R2 z −30.2…−29.0 (gap x −5.4…−4.0); R3 z −26.2…−25.0 (gap x 3.6…5.0); R4 z −22.2…−21.0 solid; all x −10.0…8.0 | aisles A0 z −37.0…−34.2, A1 −33.0…−30.2, A2 −29.0…−26.2, A3 −25.0…−22.2 (2.8 wide) |
| CRAC block | x −10.0…8.0, z −21.0…−15.4 (big cooling cabinets, louvres, merged with R4) | so the south is no shortcut |
| West strip / east strip | x −14.0…−10.0 / x 8.0…13.0, full depth | |
| **Stair landing** (arrival) | core x 13.0…17.6, z −24.0…−16.0; door x 13.0, z −20.6…−19.4 (opens west); the **up-flight** (x 14.6…17.4, z −23.8…−21.2) closed by a padded steel shutter at z −21.2 with a SafeSense lock pad and the plate **STAIRWELL SEALED · for your safety**; the down-flight (z −18.8…−16.2) drops into dark | |
| **The 1987 brick patch** | west wall x −14.0, z −24.4…−22.4, y 0…2.2, beige-painted brick, faded stencil **LINE ROOM · 1987** | the original exchange wall the tower was built round |
| **The jack** | (−13.96, 0.45, −23.4) facing +X: a beige 1987 wall socket (600-series), 0.08 × 0.08; **masking-tape label** above it at y 0.62: **JARVIS — 1987 — DO NOT UNPLUG** (biro); an old beige copper cable runs along the skirting to z −22.4 and up the wall into the tray | lit by `lamp('jack')` |
| **Tea point** | counter on the east wall x 12.4…13.0, z −19.0…−15.8, top 0.9; **kettle** (13.1 save) at (12.7, 0.9, −17.2); sink (12.7, 0.9, −16.2); 4 mugs; a coiled spare **kettle cord** at (12.7, 0.9, −18.2); poster **TEA POINT · one cup at a time (for your safety)** at (12.98, 1.5, −17.4) | right beside the arrival door |
| **Cooling valves** | big blue pipes (dia 0.3) down the walls from the trays; steel hand-wheels (r 0.25) with a blue hub: **valve W** (−13.8, 1.15, −32.4) facing +X, **valve E** (12.8, 1.15, −32.4) facing −X | 26.6 m apart |
| Floor vents (fog) | 12 perforated tiles: x ∈ {−7, −1, 5} × z ∈ {−35.6, −31.6, −27.6, −23.6} | fog rolls out after the interlock |
| **Maintenance hatch** | ceiling (−11.8, 3.2, −16.6), 0.9 × 0.9; SafeSense lock lamp (−11.8, 3.18, −17.2) red → green; a telescoping **ladder** in the plane z −17.0 (north edge) drops to the floor when unlocked; climbers on its south side facing north | a black shaft stub with rungs above |
| PA grille | (11.0, 3.15, −21.0) | |

### 2.4 L30 — "The Hangar" (set x = VG + 48)

```
 z −37.6 ══════════════ R5 wall rack (single face, 2 tiers, facing south) x 33…60.4 ═════════════════════════════
 z −37.0 ┌──BAND A x 33…40.4──┬─R1─┬── LANE L1 x 41.3…47.0 ──┬─R2─┬─ LANE L2 x 47.9…53.0 ──┬─R3─┬── BAND C x 53.9…60.4 ─┐
 z −36.2 │                    │    │ ↕ D30b x 44.2           │    │ ◆ D30c sentinel (50.45) │    │                        │
 z −34.6 │                    │ ▯  │       M1 ▤▤▤▤ parked ═══╪bay═╪═══ rail ═══▶ pushed     │ ▯  │                        │
 z −33.0 │ ↕ D30a x 38.6      │ ▯  │                         │    │      ▼ cone len 11      │ ▯  │ ↕ D30d x 56.8          │
 z −31.0 │ ◎ S1 on R1 (40.3)  │    │                         │    │      ▼                  │    │                        │
 z −26.2 │                    │    │                         │ ▯  │  crossing z −27…−25.4   │ ▯  │                        │
 z −22.0 │                    │    │                         │    │                         │    │ ▫ P2 (55.0)  ◆ D30e ▐ LIFT
 z −19.6 │                    │ ▯  │ (R1 crossing −20.4…−18.8)    │                         │    │   doorman (58.8)  ▐ x 60.4
 z −16.6 │ ⊡ HATCH (36.2)     │    │ ▫ P1 (45.4,−15.6)       │    │                         │    │       MANAGER ONLY ▐
 z −13.0 └────────────────────┴────┴─────────────────────────┴────┴─────────────────────────┴────┴────────────────────────┘
 z −12.6 ═══ R0 rack along the south glass (facing north, 2 tiers) · glass z −11.0 · the storm city beyond ══════════
        x 33              40.4 41.3                    47.0 47.9                    53.0 53.9                   60.4   63
```

| Thing | Where | Notes |
| --- | --- | --- |
| Floor | walkable x 33.0…60.4, z −37.0…−13.0; dark epoxy, mirror-polished, white dashed lane lines down the middle of L1/L2 | ceiling 3.9, exposed steel beams, cable trays, rows of tiny blue status lights |
| **Static racks** (open steel frames 2.9 h, charging cradles at y 0.55 / 1.35 / 2.15 on both faces, slot every 0.62 m) | **R1** x 40.4…41.3 with crossings z −34.6…−33.0 and −20.4…−18.8; **R2** x 47.0…47.9 with a **bay** z −35.2…−34.0 (the rail runs through) and a crossing z −27.0…−25.4; **R3** x 53.0…53.9 with crossings z −35.0…−33.4 and −27.0…−25.4; **R0** single face along the south glass x 33…60.4, z −12.6…−11.8 (2 tiers); **R5** single face along the north wall z −37.6…−37.0 (2 tiers) | rows of docked drones, blue lights |
| **Mobile rack M1** | 2.6 (x) × 0.9 (z) × 2.9 h, 24 docked drones on its faces; on a floor rail along **z −34.6** from x 44.9 to 51.75; **parked** x 44.9…47.5 (centre 46.2, half in R2's bay); **pushed** x 49.15…51.75 (centre 50.45), directly in front of the sentinel | Luka pushes east (4.25 m). Reads as the cover at a glance: an amber outline (corner posts, base bumper, top edges) and an amber charge glow on the floor round it (moves with it); the rail carries a dim amber dashed push path with lit end stops |
| **Arrival floor hatch** | (36.2, 0, −16.6), 0.9 × 0.9, lid hinged on its west edge, two steel grab rails 1.0 m up | the L21 ladder comes up here |
| Speaker S1 | wall PA unit on R1's west face (40.3, 1.5, −31.0), facing −X, a jack panel | lure point A |
| Dropped phones | P1 (45.4, 0.01, −15.6) lane L1 south; P2 (55.0, 0.01, −22.0) band C, against R3's east face | confiscated phones lying where a drone dropped them; screens dark until played |
| **Private lift** | lobby x 57.6…60.4, z −23.6…−17.6; doors in the east wall **x 60.4, z −21.5…−19.9** (two black leaves); plate **MANAGER ONLY** (60.38, 2.55, −20.7); card reader (60.38, 1.2, −19.35) **red/green**; **side panel** (SafeSense screen 0.5 × 0.36) at (60.38, 1.45, −22.4): **ROOF ACCESS — SANTA PHOTO 11:30 — AUTHORISED: SANTA**; car x 60.6…62.8, z −21.8…−19.6: black mirror walls, a warm strip light, one button **ROOF** | shaft VG x 12.4…15.0. The way out reads from across the floor: cool light lines down the surround's edges (with its top strip) and round the doorway, light spilling under the doors, runway studs along z −20.7 from band C (x 54.6…59.9), a soft pool on the floor in front |
| South glass | z −11.0, x 30…66: storm city panorama card behind (`t_storm_l30`), rain-free, the occasional distant flash | |
| PA grille | (37.0, 3.85, −18.4) | |

### 2.5 Colliders (`[x0, z0, x1, z1]`)

```
L12  lift car   [-54.3,-43.2,-54.1,-40.8] [-51.9,-43.2,-51.7,-40.8] [-54.3,-43.2,-51.7,-43.0]
     north wall [-66.0,-41.0,-53.8,-40.6] [-52.2,-41.0,-30.0,-40.6]; lift door (dynamic) [-53.8,-40.8,-52.2,-40.6]
     blocks     A [-66.0,-40.6,-57.0,-36.4]   B [-49.0,-40.6,-30.0,-36.4]
     fence      [-61.2,-36.4,-61.0,-15.4]     aisle E end [-39.0,-36.4,-30.0,-27.0]
     bank       12 dynamic [cx-0.85,-34.0,cx+0.85,-27.0] (mutated in place as units slide)
     hall       E [-35.2,-27.0,-35.0,-20.6] [-35.2,-19.4,-35.0,-15.4]; stair door (dynamic) [-35.1,-20.6,-35.0,-19.4]
                S [-61.0,-15.4,-35.0,-15.0]
     bins       guitars [-56.4,-22.3,-54.6,-21.3]  fireworks [-59.6,-19.1,-58.0,-18.1]  scissors [-52.4,-19.1,-50.8,-18.1]
     tramp bin  (dynamic) [-36.0,-20.8,-35.0,-19.2] → [-36.0,-24.2,-35.0,-22.6]
L21  outer      W [-14.2,-37.2,-14.0,-15.2]  N [-14.2,-37.2,13.2,-37.0]  S [-14.2,-15.4,13.2,-15.2]
                E [13.0,-37.2,13.2,-20.6] [13.0,-19.4,13.2,-15.2]; door (dynamic) [13.0,-20.6,13.1,-19.4]
     racks      R1 [-10.0,-34.2,1.0,-33.0] [2.4,-34.2,8.0,-33.0]   R2 [-10.0,-30.2,-5.4,-29.0] [-4.0,-30.2,8.0,-29.0]
                R3 [-10.0,-26.2,3.6,-25.0] [5.0,-26.2,8.0,-25.0]   R4+CRAC [-10.0,-22.2,8.0,-15.4]
     tea        [12.4,-19.0,13.0,-15.8]     valve pipes [-14.0,-32.7,-13.5,-32.1] [12.5,-32.7,13.0,-32.1]
     landing    [13.0,-24.2,17.8,-24.0] [17.4,-24.0,17.8,-16.0] [13.0,-16.0,17.8,-15.8]
                shutter [14.6,-21.3,17.4,-21.1]  down-flight [14.6,-18.8,17.4,-16.0]
L30  outer      W [32.8,-37.2,33.0,-12.8]  N [33.0,-37.6,60.6,-37.0]  S [33.0,-13.0,60.6,-12.6]
                E [60.4,-37.2,60.6,-21.5] [60.4,-19.9,60.6,-12.8]; lift doors (dynamic) [60.4,-21.5,60.5,-19.9]
     R1         [40.4,-37.0,41.3,-34.6] [40.4,-33.0,41.3,-20.4] [40.4,-18.8,41.3,-13.0]
     R2         [47.0,-37.0,47.9,-35.2] [47.0,-34.0,47.9,-27.0] [47.0,-25.4,47.9,-13.0]
     R3         [53.0,-37.0,53.9,-35.0] [53.0,-33.4,53.9,-27.0] [53.0,-25.4,53.9,-13.0]
     M1         (dynamic) [cx-1.3,-35.05,cx+1.3,-34.15]
     car        [60.6,-22.0,62.8,-21.8] [62.8,-22.0,63.0,-19.4] [60.6,-19.6,62.8,-19.4]
     hatch      open lid only: [35.75,-17.05,36.65,-16.15] (parked at 1e4 when closed)
```

---

## 3. Look

### 3.1 Palette (spec §14: "Optus HQ: sterile white and mirror-floor reflections"; 2040 glassy accent)

| Use | Hex |
| --- | --- |
| L12 walls, shelving, ceiling (sterile white) / shadow | `#f2f4f6` / `#d4d8de` |
| L12 floor (white stone) / reflection streaks | `#e8eaee` / `#c8d0dc` |
| Bins (grey plastic) / label plates (white, black type) | `#9aa2aa` / `#f8f8f8` + `#1a1a1a` |
| L21 racks / aisle floor / cold LED | `#1a2433` / `#0e1622` (gloss `#3a5a78`) / `#6fd0ff` |
| L21 1987 brick / beige jack and cable | `#d8c8a0` / `#cdbb94` |
| Cooling pipes / valve wheels | `#2a6aa8` / steel `#b8bec6` with a `#bfe6ff` hub |
| L30 floor / racks / beams | `#18202c` (mirror tint 1.6) / `#56606e` (spines `#242c38`) / `#2a3038`; walls `#4a5668`; ceiling deck unlit `#101824` |
| L30 light accents | lane floor light `#0a1220` (additive, under the ceiling strips); M1 amber `#d08a30`; private lift cool `#8ab8e0` (doorway) / `#a8c8e8` (surround), its floor pool `#2a3c58` |
| Drones (shell / light) | `#eef2f6` / docked blue `#8fd8ff`, awake brighter `#bfe6ff`; amber `#ffb040`; red `#ff4040` |
| Cleaning drones | white disc `#e8ecf0`, a soft cyan underglow `#9fe8ff` |
| SafeSense panels | glass `#f4f8fc` @ 0.85, glow `#bfe6ff`, deep `#4a8ab8` |
| Headphones (instanceColor set) | black `#1a1a1c`, white `#e8e8ea`, red `#c8323a`, blue `#1f6fe0`, pink `#e88ab0`, teal `#2fb8a8`, silver `#b8bcc4` |
| Storm outside (L30) | green-grey `#3a4848`, neon dots dimmed |
| Lift car quilts | `#5a6068` |

**Yes yellow** does not appear on these floors.

### 3.2 Materials and the mirror

- `M.vc` — Lambert, vertex colours: all untextured static geometry (walls, shelving, racks' frames, CRAC, pipes,
  counters, fences) → 1 draw call per floor group (one Builder per floor, so hidden floors cost nothing).
- `M.atlas` — Lambert + `t_signs` (8 rows × 32 px) for the readable signs; `M.labels` — `t_labels` (16 rows × 16 px)
  for the bank's category plates; `M.lit` — the same atlases emissive (the SafeSense panels, the side panel).
- `M.leds` — Basic, `t_rack_led` with a scrolling offset (L21 rack doors), unique key.
- `M.glow` — Basic: light strips, lamps (valve hubs, hatch lock, beacons, reader), PA rings.
- `M.glass` — Basic, transparent 0.25 (L30 south glass), and `M.sky30` — Basic, fog false, `t_storm_l30`.
- `M.fog` — Basic, additive, `depthWrite: false`, `t_fog` (L21 fog cards).
- `M.pool` — Basic, vertex colours, additive, `depthWrite: false`, no fog, never reflected: soft Gouraud pools of light
  on L30's floor (the mirror shader is unlit), 1 draw call for the floor's (`pools30`) + 1 for M1's (`m1_pool`).
- Drones (docked, cleaning, M1's) — the shared drone geometry from art; one white shell material + one unlit
  instanceColor light material per IM (`setColorAt` at build).
- **Floors — `makeMirror(w, d, opts)`** (exported as `SETS.hq_floors.makeMirror`, used by every floor here and by
  `hq_top`): an **inlined, trimmed copy of three r186's `examples/jsm/objects/Reflector.js`** (no addon import): a
  `PlaneGeometry(w, d)` mesh rotated flat, a `WebGLRenderTarget(res, res, { minFilter/magFilter: NearestFilter })`
  (`res` 256, 128 on touch), a virtual mirrored camera computed in the mesh's `onBeforeRender` (renders the scene
  with the mirror mesh and anything flagged `userData.noReflect` hidden, `clipBias` 0.003, recursion-guarded), and a
  `ShaderMaterial` that projects the target with the texture matrix and mixes it with a tint: `gl_FragColor =
  vec4(mix(tint, refl.rgb, reflect), 1.0)` with `reflect` 0.55 (L12, white stone), 0.6 (L21), 0.62 (L30), 0.62
  (`hq_top`). It is created **once** at build (warmed at boot), re-parented on rebuild. Options `{ res, tint,
  reflect }`. **Fallback/baked mode** (`reflect('baked')`; touch devices, adaptive pixel ratio < 0.75, or any shader
  failure): the floor becomes a Lambert `t_floor_*` at opacity 0.8 over a **mirrored copy** (`scale.y = −1`, same
  geometry and materials) of that floor's merged static mesh and its instanced racks/drones (+3 draw calls). Never
  both at once.
- No vertex snapping, no affine warping, no wobble. Blob shadows only.

### 3.3 Textures to paint (128–256 px, nearest; **bold** = must read at the named anchor)

| Texture | Size | Content | Read at |
| --- | --- | --- | --- |
| `t_signs` | 256 × 256 (8 × 32 px) | row 0 **HEARING PROTECTION INITIATIVE 2038**; 1 **REDCLIFFE 2038 · NOISE**; 2 **SKATEBOARDS**; 3 **KITCHEN KNIVES · BRISBANE**; 4 **LADDERS**; 5 **MANAGER ONLY**; 6 **STAIRWELL SEALED · for your safety**; 7 **TEA POINT · one cup at a time (for your safety)** | `headphones_sign`, `guitars`, `skateboards`, `knives`, `ladders`, `lift30_doors`, `shutter`, `tea_point` |
| `t_labels` | 256 × 256 (16 × 16 px) | FIREWORKS · SCISSORS · TRAMPOLINES · STAIRWELL · the 12 bank labels (§2.2) · LINE ROOM · 1987 | |
| `t_jack` | 64 × 32 | masking tape, biro: **JARVIS — 1987 — DO NOT UNPLUG** (two lines, slightly crooked) | `jack` |
| `t_side_panel` | 128 × 96 | SafeSense screen: **ROOF ACCESS** / **SANTA PHOTO 11:30** / **AUTHORISED: SANTA** + a little sleigh icon; variant `recognised` (a soft green tick, "Welcome, Santa!") | `side_panel` |
| `t_reader` | 32 × 48 | a card reader with a red/green LED window; tiny MANAGER ONLY | `lift_reader` |
| `t_ctrl` | 64 × 64 | shelf control panel: a big round hold button, "HOLD BOTH", a two-hands pictogram, a progress ring (dynamic overlay) | `ctrl_w`, `ctrl_e` |
| `t_lift_panel` | 64 × 128 | **SERVICE LIFT**, buttons **G · 12 · 21 · 30**, a reader slot, "Are you sure?" under the alarm button (same as `hq_atrium`) | `l12_panel` |
| `t_rack_led` | 64 × 64 | a server rack glass door: dark, LED dot columns in cyan/blue with a few amber; tiling | L21 racks |
| `t_brick87` | 64 × 64 | beige-painted brick with flaking; faint stencil | `jack_wide` |
| `t_cradle` | 64 × 32 | the charging cradle row (dark steel, blue contact glints) | L30 racks |
| `t_floor_l12` / `_l21` / `_l30` | 128 × 128 | baked-mode floors: white stone streaks / blue-grey tiles / dark epoxy with dashes | |
| `t_storm_l30` | 256 × 64 | storm panorama for the south glass: green-grey cloud, the Valley's dimmed neon dots, a far river glint | `hangar_reveal` |
| `t_fog` | 64 × 64 (alpha) | soft noise wisp | L21 fog |
| `t_pa` | 32 × 32 | round speaker grille with a ring | PA grilles |
| `t_quilt` | 64 × 64 | grey quilted lift blanket | L12 car |
| `t_phone_drop` | 32 × 64 | a dropped phone face: dark; `play` variant (a waveform) | P1, P2 |

### 3.4 Lighting rig (hemi + dir + **one** spot) and fog, per preset

No preset name contains "rain" and every preset sets `rain: 0`.

```js
env: {
  l12:     { bg: 0xdfe4ea, fog: [0xe8ecf0, 0.028], hemi: [0xf4f8ff, 0xc8ccd4, 1.15], dir: [0xe8f0ff, 0.45, [6, 14, 8]],   spot: [0xf0f6ff, 1.2], rain: 0 },
  lift:    { bg: 0x101214, fog: [0x202428, 0.020], hemi: [0xd8e2ea, 0x404448, 0.80], dir: [0xffffff, 0.15, [0, 10, 0]],   spot: [0xfff6e8, 1.4], rain: 0 },
  l21:     { bg: 0x0a1420, fog: [0x10223a, 0.035], hemi: [0x8fb8e8, 0x0a1018, 0.75], dir: [0x9cc4ff, 0.35, [-6, 10, 4]],  spot: [0xbfe6ff, 1.4], rain: 0 },
  l21_fog: { bg: 0x40586e, fog: [0x6a8aa8, 0.075], hemi: [0xa8c8e8, 0x1a2430, 0.90], dir: [0x9cc4ff, 0.30, [-6, 10, 4]],  spot: [0xbfe6ff, 1.2], rain: 0 },
  l30:     { bg: 0x0b0f16, fog: [0x141c28, 0.030], hemi: [0x7f9cc8, 0x0c1018, 0.70], dir: [0xa8b8c8, 0.50, [0, 12, 20]],  spot: [0xbfe6ff, 1.2], rain: 0 },
  car30:   { bg: 0x08080a, fog: [0x101012, 0.030], hemi: [0x8a8070, 0x101010, 0.60], dir: [0xffe8c8, 0.20, [0, 10, 0]],   spot: [0xffe8c8, 1.3], rain: 0 },
}
```

First key `l12` is the build default. L12's fog (0.028) eats the deep archive past ~25 m; L21's (0.035) makes the
rows recede into blue; `l21_fog` is the interlock (lerp 3 s); L30's dir comes from the south glass (storm light).

**The spot (`lamp(name)`)** (`world.torchAuto = false` while lit; `lamp('off')` restores it):

| `lamp()` | Position → target | Angle / pen. / dist | Colour / int. | Purpose |
| --- | --- | --- | --- | --- |
| `lift12` | (−53.0, 2.45, −41.9) → (−53.0, 0, −41.9) | 1.1 / 0.5 / 4 | `#fff6e8` / 1.4 | the car's ceiling light (arrival) |
| `gap` (L12 default) | (−50.0, 3.5, −30.5) → (−50.0, 0, −30.5) | 0.50 / 0.7 / 6 | `#f0f6ff` / 1.2 | the gap as it opens |
| `headphones` | (−54.0, 3.4, −18.2) → (−54.0, 1.3, −15.45) | 0.55 / 0.7 / 6 | `#f0f6ff` / 1.3 | the headphones wall and the pick |
| `jack` (L21 default) | (−12.6, 3.0, −23.4) → (−13.96, 0.45, −23.4) | 0.32 / 0.6 / 5 | `#fff0d0` / 1.6 | the oldest port, warm in a cold room |
| `hatch21` | (−11.8, 0.4, −15.6) → (−11.8, 3.2, −16.6) | 0.50 / 0.6 / 5 | `#c8ffd8` / 1.2 | the hatch unlocking (green-white uplight) |
| `lift30` (L30 default) | (57.4, 3.7, −20.7) → (60.4, 1.4, −20.7) | 0.45 / 0.6 / 6 | `#e8f0ff` / 1.2 | MANAGER ONLY, the side panel |
| `car30` | (61.7, 2.5, −20.7) → (61.7, 0, −20.7) | 1.0 / 0.6 / 4 | `#ffe8c8` / 1.3 | the private car |
| `off` | — | — | 0 | |

### 3.5 Sky and backdrop

Only L30 sees outside: a curved strip of `M.sky30` (`t_storm_l30`) 6 m beyond the south glass (radius 30 m arc, x 26…70,
y −8…10, fog false), plus a flat dark city silhouette band below it; distant lightning every 18–35 s lifts `M.sky30`'s
colour for 0.12 s (Reduce Flashing: a 1.5 s swell to 40%). L12/L21's perimeter is behind partitions and blackout film.
(We do **not** build `skyline()` here: three floors at three heights would need three placements; the strip is cheaper
and the L30 glass is mostly blocked by R0 anyway.)

---

## 4. Props

| id | Floor | Description | States / `userData` |
| --- | --- | --- | --- |
| `l12_lift` | 12 | car (quilts, rail, ceiling panel, speaker grille, panel) + the steel leaf | `doors(u)` 0…1 (leaf slides west 1.6 m, 1.2 s); `light(on)`; `panel(floor)` lights a button; collider follows |
| `pa12`, `pa21`, `pa30` | all | ceiling speaker grilles | `talk(on)` a soft blue ring pulses with the Manager's PA blips |
| `bank` | 12 | the 12 mobile units (12 small Groups: merged body + label quads) | `open(u, { instant })` 0…1 (units ease from closed to open centres over 3 s, or jump with `instant`; `SETS.hq_floors.reset()` finishes every eased prop's move at once, e.g. after re-dressing on Continue; beacons blink while moving, servo whine); `jiggle()` a 0.1 m twitch (when one control is held alone); dynamic colliders follow; `isOpen` |
| `ctrl_w`, `ctrl_e` | 12 | the two control panels | `held(on)` (button lights, ring fills); `progress(k)` the shared "both held" ring 0…1 (1.5 s to open) |
| `lane_bots` | 12 | IM 2 shelf robots behind the fence | ping-pong 0.6 m/s (ambient) |
| `bins_l12` | 12 | the labelled bins (merged static) + guitars IM (9) + skateboards IM (12) + knives IM (40 thin blades in a rack) + ladders (merged) | static |
| `chase_guitar` | 12 | the battered acoustic in the REDCLIFFE 2038 · NOISE bin | static (examine target) |
| `headphones_wall` | 12 | IM ≈ 300 headphones on the pegboard (instanceColor) | `take()` hides instance `PICK` (the pair at `headphones_pick`) — content attaches the rig's headphones to Chase |
| `tramp_bin` | 12 | the rolling trampoline cage | `push(u)` 0…1 → z offset 0 … −3.4 (driven by the strength hold's progress); castor squeak; collider follows; `done` |
| `stair_door12` | 12 | the stair door | `open(u)`; collider removed at u ≥ 0.8 |
| `landing21` | 21 | the stair landing + shutter + door | `door(u)`; `shutter.pulse()` (the lock pad flashes red when someone tries it) |
| `tea_point` | 21 | counter, kettle, sink, mugs, poster | `steam()` puff (save); `kettle_cord.visible` (taken → hidden) |
| `jack` | 21 | the beige socket + tape label + copper cable | `state('bare' \| 'adapter' \| 'phone')`: adapter = the kettle-cord adapter bodged into the socket (tape, exposed wires); phone = Rue's **brick phone** lying on the floor below it, plugged in, its little screen glowing **green** (1987 terminal) then SafeSense white (pop-up flood) |
| `valves` | 21 | 2 hand-wheels on the pipes | `turn(i, u)` wheel rotation 0…2.5 turns; `held(i, on)`; when both ≥ 1 within 1.5 s → `emit('valves:open')` (systems/content) |
| `fog21` | 21 | IM 12 fog cards at the vents (additive) + `world.puff` bursts | `roll(k)` 0…1 over 3 s: cards rise 0 → 0.9 m and spread ×3, drift along the aisles; pairs with env `l21_fog` |
| `hatch21` | 21 | ceiling hatch, lock lamp, telescoping ladder, the shaft stub | `lock(red \| green)`; `open(u)`; `ladder(u)` (0 = stowed in the ceiling, 1 = foot on the floor) |
| `racks21` | 21 | rack rows (merged) + `M.leds` | LED scroll |
| `docked` | 30 | IM **≈ 790** docked drones on R0/R1/R2/R3/R5 (shell IM + light IM) | `wake(i, on)` 12 "awake" indices pulse brighter and turn ±0.3 rad slowly; `tint(name, k)` all lights (amber flicker on `signal:full` / an escort); static matrices otherwise |
| `m1` | 30 | the mobile charging rack + 24 drones (child IMs) + its rail | `push(u)` 0…1 → centre x 46.2 … 50.45 (driven by the strength hold); rumble; collider follows; `done` |
| `hatch30` | 30 | the floor hatch lid + grab rails + the shaft stub below | `open(u)` (lid swings up to 100° about its west edge); collider while open |
| `s1`, `p1`, `p2` | 30 | the speaker and the two dropped phones | `play(on)` (speaker cone pulses / phone screen shows a waveform) — the lure itself is `DRONES.lure(at, sampleId)` |
| `lift30` | 30 | doors, MANAGER ONLY plate, reader, side panel, the car | `doors(u)`; `reader('red' \| 'green')` + `beep()`; `panel('booking' \| 'recognised')`; `car.light(on)`; `car.button(on)` (ROOF) |
| `sky30` | 30 | the storm strip | `flash(k)` |
| `cleaners` | all | IM 17 cleaning drones (disc body IM + underglow IM): L12 5, L21 6, L30 6 | follow `paths.clean_*`; only the active floor's instances animate (others scaled to 0) |
| `mirror` | all | one `makeMirror` mesh per floor (3, only the visible one renders) | `reflect('live' \| 'baked')` on the set |

**Instanced repeats (counts)**

| Repeat | Count | Mesh(es) |
| --- | --- | --- |
| Docked drones (L30 racks R0 88, R1 ≈ 186, R2 ≈ 204, R3 ≈ 198, R5 88 → cap **800**) | ≈ 790 | 2 IM (shell, light) |
| M1's drones | 24 | 2 IM (children of `m1`) |
| Headphones | 300 | 1 IM (instanceColor) |
| Cleaning drones | 17 | 2 IM |
| Fog cards | 12 | 1 IM |
| Guitars / skateboards / knives (L12 bins) | 9 / 12 / 40 | 3 IM |
| Shelf robots | 2 | 1 IM |
| Cable-tray rungs (L21) | ~180 | merged static |

**Docked slot rule** (deterministic at build): along each rack face, a slot every 0.62 m starting 0.31 m in from the
row end, skipping any slot whose centre falls in a crossing or the bay ± 0.2 m; tiers y 0.55 / 1.35 / 2.15 (R0 and R5:
0.55 / 1.35); each pod faces out of its face, light lens forward; light colour `#8fd8ff` × (0.7…0.9) (seeded); the 12
"awake" indices are chosen among slots visible from `l30_l1_s`, `l30_l2_s`, `l30_c_s` (so the player sees them stir).

---

## 5. Marks (`[x, y, z, ry]`, set)

**L12**

| id | value | use |
| --- | --- | --- |
| `l12_car_luka`, `l12_car_chase`, `l12_car_c40` | [−53.0, 0, −42.4, 0], [−52.4, 0, −41.5, 0], [−53.6, 0, −41.5, 0] | inside the lift (same spots as `hq_atrium`'s `lift_*`) |
| `s32_l12_out_luka`, `_chase`, `_c40` | [−53.0, 0, −39.0, 0], [−52.0, 0, −38.4, 0.2], [−54.0, 0, −38.4, −0.2] | out into the lobby ("…Someone's got standards.") |
| `s32_cp_l12` | [−53.0, 0, −37.6, 0] | scene start / PLAY start |
| `s32_skate` | [−59.0, 0, −35.4, PI] | examine skateboards |
| `s32_knives` | [−45.0, 0, −35.4, PI] | examine knives |
| `s32_ladders` | [−41.0, 0, −35.3, PI] | examine ladders (LUKA's line) |
| `s32_ctrl_w` | [−60.3, 0, −35.2, −H] | holding the west control |
| `s32_ctrl_e` | [−39.7, 0, −35.2, H] | holding the east control |
| `s32_gap_n`, `s32_gap_s` | [−50.0, 0, −34.6, 0], [−50.0, 0, −26.4, 0] | through the gap (followers walk it in a line) |
| `s32_guitars_c40` | [−55.0, 0, −23.0, 0.1] | Chase (2040) at the NOISE bin ("That's mine.") |
| `s32_guitars_chase` | [−56.3, 0, −23.2, 0.45] | Chase beside him |
| `s32_headphones` | [−54.0, 0, −16.25, 0] | Chase at the wall: "Take them? [YES]" → "For later." |
| `s32_bin_luka` | [−35.5, 0, −18.4, PI] | Luka behind the trampoline bin, pushing north |
| `s32_bin_done` | [−35.5, 0, −21.8, PI] | Luka after the push |
| `s32_stair_in` | [−34.2, 0, −20.0, H] | through the door into the landing stub (fade) |

**L21**

| id | value | use |
| --- | --- | --- |
| `s32_l21_land_luka`, `_chase`, `_c40` | [14.0, 0, −20.0, −H], [14.6, 0, −19.0, −1.8], [14.6, 0, −20.9, −1.3] | the stair landing (PA line; the sealed shutter behind them) |
| `s32_cp_l21` | [11.6, 0, −20.0, −H] | PLAY start; stealth checkpoint 1 |
| `kettle` | [12.0, 0, −17.2, H] | the kettle (save) |
| `s32_cord` | [12.0, 0, −18.2, H] | Chase takes the kettle cord |
| `s32_trail_start` | [10.5, 0, −20.6, PI] | Chase (2040) turns the chip on ("There's a cable on the map that's just labelled 'old'") |
| `s32_cp_l21_w` | [−12.0, 0, −29.0, PI] | stealth checkpoint 2 (west strip) |
| `s32_jack_chase` | [−13.25, 0, −23.4, −H] | Chase kneeling at the jack (Wiring) |
| `s32_jack_luka` | [−12.8, 0, −22.5, −1.9] | Luka at the jack with the brick phone (Hack) |
| `s32_jack_c40` | [−12.4, 0, −24.4, −1.2] | Chase (2040) |
| `s32_valve_w` | [−13.1, 0, −32.4, −H] | at valve W |
| `s32_valve_e` | [12.1, 0, −32.4, H] | at valve E |
| `s32_hatch` | [−11.8, 0, −16.7, PI] | ladder foot (climb north-facing) |
| `s32_hatch_top` | [−11.8, 3.0, −16.75, PI] | top of the climb (content `moveTo` with y; fade) |

**L30**

| id | value | use |
| --- | --- | --- |
| `s32_l30_up` | [36.2, −0.8, −16.75, PI] | emerging through the floor hatch (content `place` then `moveTo` up to y 0) |
| `s32_l30_luka`, `_chase`, `_c40` | [36.2, 0, −18.0, PI], [35.4, 0, −18.6, 2.8], [37.0, 0, −18.6, −2.8] | standing in the hangar (PA line; the reveal) |
| `s32_cp_a` | [36.2, 0, −18.4, PI] | stealth checkpoint A |
| `s32_s1` | [39.7, 0, −31.0, H] | Chase at speaker S1 |
| `s32_cp_l1` | [42.6, 0, −33.8, H] | checkpoint L1 (after the R1 north crossing) |
| `m1_push` | [44.35, 0, −34.6, H] | Luka behind M1, pushing east |
| `m1_done` | [48.6, 0, −34.6, H] | Luka after the push |
| `s32_p1` | [45.4, 0, −15.0, PI] | Chase at phone P1 |
| `s32_cp_c` | [55.0, 0, −34.2, H] | checkpoint C (band C entry) |
| `s32_p2` | [55.6, 0, −22.0, −H] | Chase at phone P2 |
| `s32_reader_luka` | [59.6, 0, −19.35, H] | Luka at the reader (Nadia's lanyard: red) |
| `s32_panel_chase` | [59.6, 0, −22.4, H] | Chase reads the side panel: "…Santa's got roof access." |
| `s32_lift_c40` | [58.4, 0, −20.7, H] | Chase (2040) behind them |
| `car30_luka`, `car30_chase`, `car30_c40` | [61.7, 0, −20.7, −H], [62.3, 0, −20.1, −H], [62.3, 0, −21.3, −H] | inside the private car |

---

## 6. Anchors (`{ at, from, fov }`, set)

| id | at | from | fov | for |
| --- | --- | --- | --- | --- |
| `l12_lift_inside` | [−53.0, 0.8, −37.0] | [−53.0, 1.6, −42.6] | 60 | from the back of the car over their shoulders as the doors open on the mirror floor |
| `s32_doors_open` | [−53.0, 1.0, −41.6] | [−51.4, 0.35, −36.6] | 50 | **the arrival**: low on the lobby floor looking into the lift as the doors open; the three and their reflections ("…Someone's got standards.") |
| `l12_panel` | [−51.92, 1.25, −41.15] | [−52.6, 1.35, −41.15] | 30 | the lift panel G · 12 · 21 · 30 |
| `pa12` | [−53.0, 3.58, −38.4] | [−52.0, 1.7, −37.0] | 40 | the PA grille: "You shouldn't be here." |
| `l12_wide` | [−50.0, 1.0, −31.0] | [−56.6, 3.3, −40.2] | 62 | the archive from the lobby: the aisle, the bank, the deep shelves into fog, cleaning drones |
| `skateboards` | [−59.0, 1.0, −36.42] | [−58.6, 1.5, −34.8] | 38 | examine: SKATEBOARDS |
| `knives` | [−45.0, 1.25, −36.42] | [−44.6, 1.5, −34.8] | 36 | examine: KITCHEN KNIVES · BRISBANE |
| `ladders` | [−41.0, 1.2, −36.42] | [−42.2, 1.5, −34.4] | 44 | examine: LADDERS |
| `ctrl_w` | [−60.9, 1.1, −35.2] | [−59.6, 1.5, −34.6] | 36 | the west control |
| `ctrl_e` | [−39.1, 1.1, −35.2] | [−40.4, 1.5, −34.6] | 36 | the east control |
| `gap` | [−50.0, 1.2, −30.5] | [−49.6, 2.2, −35.8] | 50 | the bank sliding apart: the gap opening |
| `guitars` | [−55.5, 0.9, −21.8] | [−55.7, 1.55, −23.9] | 40 | the bin, **REDCLIFFE 2038 · NOISE**, the battered acoustic |
| `s32_guitars_two` | [−55.6, 1.4, −23.1] | [−53.4, 1.6, −24.4] | 42 | two-shot CHASE (2040) / CHASE at the bin |
| `headphones_wall` | [−54.0, 1.5, −15.4] | [−54.0, 1.7, −19.6] | 52 | the whole wall + **HEARING PROTECTION INITIATIVE 2038** |
| `headphones_sign` | [−54.0, 2.95, −15.42] | [−54.0, 2.4, −17.6] | 34 | the sign |
| `s32_headphones_close` | [−54.0, 1.5, −16.25] | [−53.0, 1.6, −17.4] | 38 | CLOSE Chase hanging them round his neck, the way Chase (2040) wears his |
| `tramp_bin` | [−35.5, 0.9, −20.0] | [−38.6, 1.6, −18.6] | 44 | the bin in the doorway; Luka pushing |
| `stair_door12` | [−35.0, 1.2, −20.0] | [−38.0, 1.6, −21.6] | 42 | the stair door |
| `l21_landing_wide` | [13.4, 1.0, −21.0] | [17.1, 2.9, −16.6] | 64 | the landing: the door, the sealed shutter |
| `shutter` | [16.0, 1.4, −21.2] | [15.6, 1.6, −19.4] | 40 | **STAIRWELL SEALED · for your safety** |
| `pa21` | [11.0, 3.15, −21.0] | [11.6, 1.6, −19.6] | 40 | the PA: "Go home. ^ You're not safe here." |
| `l21_reveal` | [−2.0, 1.0, −27.6] | [12.4, 2.6, −27.6] | 44 | the server floor reveal: down aisle A2, row after row, cleaning drones polishing the glass |
| `tea_point` | [12.7, 1.1, −17.4] | [11.0, 1.5, −17.4] | 40 | the tea point, the kettle, the cord |
| `kettle` | [12.7, 1.05, −17.2] | [12.0, 1.35, −17.2] | 32 | save |
| `kettle_cord` | [12.7, 0.95, −18.2] | [12.1, 1.3, −18.0] | 30 | "Kettle cord. ^ It's always the kettle cord." |
| `jack_wide` | [−13.9, 0.8, −23.4] | [−11.4, 1.5, −25.4] | 46 | the brick patch, the beige jack, the copper line into the ceiling |
| `jack` | [−13.96, 0.52, −23.4] | [−13.45, 0.65, −23.4] | 26 | INSERT the socket and the tape: **JARVIS — 1987 — DO NOT UNPLUG** |
| `brick_phone_floor` | [−13.6, 0.08, −23.2] | [−13.0, 0.6, −23.0] | 32 | the brick phone plugged in, the green terminal (the Hack card opens over it) |
| `valve_w` | [−13.8, 1.15, −32.4] | [−12.0, 1.5, −31.2] | 40 | valve W |
| `valve_e` | [12.8, 1.15, −32.4] | [11.0, 1.5, −31.2] | 40 | valve E |
| `fog_wide` | [−2.0, 0.5, −31.6] | [−13.4, 2.9, −31.6] | 44 | fog rolls out of the vents down aisle A1 |
| `hatch21` | [−11.8, 3.2, −16.6] | [−11.0, 1.0, −18.2] | 48 | looking up at the hatch: red → green, the ladder dropping |
| `ladder21` | [−11.8, 2.0, −16.8] | [−9.8, 1.6, −19.0] | 46 | MID: up the hatch ladder |
| `l30_hatch_up` | [36.2, 0.6, −16.6] | [38.6, 1.4, −19.6] | 46 | they climb out of the floor hatch |
| `hangar_reveal` | [52.0, 1.0, −32.0] | [36.6, 3.7, −14.2] | 60 | WIDE: the huge floor, hundreds of docked drones, rows of blue lights receding, a few awake |
| `pa30` | [37.0, 3.85, −18.4] | [36.4, 1.6, −20.6] | 40 | the PA: "Chase. ^ Go home. ^ Please." |
| `sentinel` | [50.45, 1.8, −36.2] | [50.0, 1.6, −29.6] | 40 | the sentinel drone at the end of lane L2 |
| `m1` | [47.5, 1.4, −34.6] | [43.2, 2.0, −31.0] | 48 | the rack on its rail; Luka pushing |
| `lift30_doors` | [60.4, 1.4, −20.7] | [56.4, 1.7, −20.7] | 40 | MANAGER ONLY |
| `lift_reader` | [60.38, 1.2, −19.35] | [59.8, 1.35, −19.35] | 26 | Nadia's lanyard: red |
| `side_panel` | [60.38, 1.45, −22.4] | [59.75, 1.5, −22.4] | 26 | INSERT **ROOF ACCESS — SANTA PHOTO 11:30 — AUTHORISED: SANTA** |
| `s32_santa_two` | [59.6, 1.5, −21.0] | [57.0, 1.7, −22.4] | 44 | two-shot Chase / Luka: "…Santa's got roof access." / "Santa's got roof access." |
| `car30` | [62.8, 1.2, −20.7] | [60.9, 2.0, −21.6] | 70 | inside the private car (doors close; up) |

---

## 7. Gameplay zones and fixed cameras

High lenses (3.2–3.7 m, just under each ceiling) looking **along** aisles and lanes, 25–40° down, so drone cones read
as fans on the mirror floor; the shelf controls and the valves each get the camera at the opposite end looking toward
them, so the holder is always in frame.

### 7.1 Cameras

```js
cams: {
  // L12
  l12_lobby:   { type: 'fixed', pos: [-56.6, 3.3, -40.2], look: [-51.0, 0.4, -34.8], fov: 60 },   // default (first key)
  l12_lift_in: { type: 'fixed', pos: [-52.05, 2.25, -40.95], look: [-53.4, 1.1, -42.6], fov: 72 },
  l12_aisle_w: { type: 'fixed', pos: [-44.0, 3.3, -34.4], look: [-60.6, 0.5, -35.6], fov: 42 },     // long lens W; gap on screen-left
  l12_aisle_e: { type: 'fixed', pos: [-56.0, 3.3, -34.4], look: [-39.4, 0.5, -35.6], fov: 42 },
  l12_gap:     { type: 'fixed', pos: [-48.7, 3.2, -25.8], look: [-50.0, 0.6, -32.6], fov: 54 },     // from the hall, looking up the gap
  l12_hall_w:  { type: 'fixed', pos: [-47.6, 3.3, -26.6], look: [-56.0, 0.5, -17.4], fov: 56 },     // guitars, headphones wall
  l12_hall_e:  { type: 'fixed', pos: [-42.4, 3.3, -26.4], look: [-35.8, 0.5, -19.4], fov: 58 },     // the bin, the stair door
  // L21
  l21_landing: { type: 'fixed', pos: [17.1, 2.9, -16.6], look: [13.4, 0.8, -21.6], fov: 64 },
  l21_east_s:  { type: 'fixed', pos: [8.4, 2.9, -23.6], look: [12.6, 0.5, -17.4], fov: 58 },       // door + tea point
  l21_east_n:  { type: 'fixed', pos: [12.6, 2.9, -24.4], look: [9.6, 0.4, -36.0], fov: 50 },       // valve E at frame right
  l21_a0:      { type: 'fixed', pos: [12.4, 2.9, -35.6], look: [-12.0, 0.4, -35.6], fov: 40 },
  l21_a1:      { type: 'fixed', pos: [-13.4, 2.9, -31.6], look: [8.0, 0.4, -31.6], fov: 40 },
  l21_a2:      { type: 'fixed', pos: [12.4, 2.9, -27.6], look: [-10.0, 0.4, -27.6], fov: 40 },     // the patrolled trail aisle
  l21_a3:      { type: 'fixed', pos: [-13.4, 2.9, -23.6], look: [8.0, 0.4, -23.6], fov: 40 },
  l21_west_n:  { type: 'fixed', pos: [-10.4, 2.9, -24.0], look: [-12.6, 0.4, -36.0], fov: 50 },     // valve W
  l21_west_s:  { type: 'fixed', pos: [-10.4, 2.9, -30.0], look: [-12.8, 0.4, -17.0], fov: 54 },     // jack (screen-right) + hatch
  // L30
  l30_a_s:     { type: 'fixed', pos: [39.9, 3.6, -13.6], look: [35.6, 0.2, -23.0], fov: 60 },
  l30_a_n:     { type: 'fixed', pos: [33.5, 3.6, -23.5], look: [38.4, 0.2, -34.8], fov: 56 },
  l30_l1_s:    { type: 'fixed', pos: [46.6, 3.6, -13.4], look: [43.8, 0.2, -25.0], fov: 50 },
  l30_l1_n:    { type: 'fixed', pos: [41.8, 3.6, -24.6], look: [45.8, 0.2, -35.6], fov: 52 },     // M1 parked + the push
  l30_l2_s:    { type: 'fixed', pos: [52.6, 3.6, -13.4], look: [50.0, 0.2, -28.0], fov: 50 },     // the sentinel's long cone toward camera
  l30_l2_n:    { type: 'fixed', pos: [48.4, 3.6, -27.4], look: [51.6, 0.3, -36.0], fov: 56 },     // M1 in front of the sentinel
  l30_c_n:     { type: 'fixed', pos: [54.4, 3.6, -20.6], look: [58.6, 0.2, -34.0], fov: 54 },
  l30_c_s:     { type: 'fixed', pos: [54.4, 3.6, -35.6], look: [59.4, 0.4, -20.0], fov: 50 },     // the lift lobby, the goal
  l30_lobby:   { type: 'fixed', pos: [55.6, 2.9, -25.2], look: [60.4, 1.3, -20.6], fov: 52 },
  l30_car:     { type: 'fixed', pos: [60.9, 2.0, -21.6], look: [62.8, 1.2, -20.4], fov: 70 },
},
```

### 7.2 Zones (first match wins; they tile every walkable area of every floor)

| # | box | cam | covers |
| --- | --- | --- | --- |
| 1 | [−54.1, −43.0, −51.9, −40.6] | `l12_lift_in` | L12 lift car |
| 2 | [−57.0, −40.6, −49.0, −36.4] | `l12_lobby` | lobby |
| 3 | [−61.0, −36.4, −50.0, −34.0] | `l12_aisle_w` | control aisle, west half (ctrl W) |
| 4 | [−50.0, −36.4, −39.0, −34.0] | `l12_aisle_e` | control aisle, east half (ctrl E) |
| 5 | [−50.8, −34.0, −49.2, −27.0] | `l12_gap` | the gap |
| 6 | [−61.0, −27.0, −45.0, −15.4] | `l12_hall_w` | hall west (guitars, headphones) |
| 7 | [−45.0, −27.0, −35.0, −15.4] | `l12_hall_e` | hall east (bin, stair door) |
| 8 | [−35.0, −24.0, −30.4, −16.0] | `l12_hall_e` | L12 stair stub (exit fade) |
| 9 | [13.0, −24.0, 17.6, −16.0] | `l21_landing` | L21 landing |
| 10 | [8.0, −25.0, 13.0, −15.4] | `l21_east_s` | door, tea point |
| 11 | [8.0, −37.0, 13.0, −25.0] | `l21_east_n` | east strip north, valve E |
| 12 | [−14.0, −27.5, −10.0, −15.4] | `l21_west_s` | the jack, the hatch |
| 13 | [−14.0, −37.0, −10.0, −27.5] | `l21_west_n` | valve W |
| 14 | [−10.0, −37.0, 8.0, −34.2] | `l21_a0` | A0 (+ R1's band) |
| 15 | [−10.0, −34.2, 8.0, −30.2] | `l21_a1` | A1 (+ R1 gap) |
| 16 | [−10.0, −30.2, 8.0, −26.2] | `l21_a2` | A2 (+ R2 gap) |
| 17 | [−10.0, −26.2, 8.0, −22.2] | `l21_a3` | A3 (+ R3 gap) |
| 18 | [57.6, −23.6, 60.4, −17.6] | `l30_lobby` | lift lobby |
| 19 | [60.4, −22.0, 63.0, −19.4] | `l30_car` | private car |
| 20 | [33.0, −25.0, 40.4, −13.0] | `l30_a_s` | band A south (hatch) |
| 21 | [33.0, −37.0, 40.4, −25.0] | `l30_a_n` | band A north (S1) |
| 22 | [40.4, −25.0, 47.0, −13.0] | `l30_l1_s` | L1 south (+ R1 south crossing, P1) |
| 23 | [40.4, −37.0, 47.0, −25.0] | `l30_l1_n` | L1 north (+ R1 north crossing, M1 parked) |
| 24 | [47.0, −29.0, 53.0, −13.0] | `l30_l2_s` | L2 south (+ R2 mid crossing) |
| 25 | [47.0, −37.0, 53.0, −29.0] | `l30_l2_n` | L2 north (+ R2 bay) |
| 26 | [53.0, −37.0, 60.4, −27.0] | `l30_c_n` | band C north (+ R3 north crossing) |
| 27 | [53.0, −27.0, 60.4, −13.0] | `l30_c_s` | band C south (+ R3 mid crossing, P2) |

(Floors are 36 m apart in X, so no box of one floor overlaps another's.) The aisle cams on L21 are chained
corridor cameras: give `l21_a0…a3` `ease: 0.25` if the eased-cut hook exists (world.md §15.4 item 1).

### 7.3 Drones (content spawns them with `DRONES.spawn`; `stealth.begin({ checkpoints })` per floor)

| Drone | Floor | Kind | Post / spawn | Path | y | speed | cone {len, half} | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `d21_a0` | 21 | courtesy | (−8.5, −35.6) | ping-pong [[−8.5, −35.6], [6.5, −35.6]] | 1.9 | 0.8 | {4.6, 0.42} | stays in A0; at the turns its cone reaches the strips but not the valve marks (z −32.4) |
| `d21_a2` | 21 | courtesy | (−9.0, −27.6) | ping-pong [[−9.0, −27.6], [6.8, −27.6]] | 1.9 | 0.7 | {5.0, 0.42} | patrols the trail's long aisle; `l21_a2` looks straight down its beat |
| `d30a` | 30 | courtesy | (38.6, −31.0) | ping-pong [[38.6, −31.0], [38.6, −15.4]] | 1.9 | 0.8 | {4.5, 0.42} | guards band A and the R1 south crossing |
| `d30b` | 30 | courtesy | (44.2, −36.2) | ping-pong [[44.2, −36.2], [44.2, −14.0]] | 1.9 | 1.0 | {5.0, 0.42} | lane L1; passes 0.7 m west of M1's parked face — Luka's push needs it lured or timed |
| `d30c` | 30 | courtesy (**sentinel**) | post (50.45, 1.8, −36.2), face 0 (south) | parked, sweep ±0.18 rad at 0.2 Hz | 1.8 | — | **{11.0, 0.30}** | covers lane L2 to z −25.2 including both mid crossings; **blinded** when M1 is pushed (M1's north face is 1.15 m in front of it: the cone is fully occluded — systems must test cone occlusion against dynamic colliders) |
| `d30d` | 30 | courtesy | (56.8, −33.0) | ping-pong [[56.8, −33.0], [56.8, −16.0]] | 1.9 | 0.9 | {4.5, 0.42} | band C west |
| `d30e` | 30 | courtesy (**doorman**) | post (58.8, 1.9, −21.6), face −H (west) | parked, sweep ±0.9 rad at 0.12 Hz | 1.9 | — | {4.2, 0.45} | the lift lobby; lure it with P2 (3.8 m away) |

**Lure points** (`DRONES.lure(at, sampleId)`; investigate hover 1.6 m above): S1 (40.3, 1.5, −31.0) — reaches `d30a`
(1.7 m) and `d30b` (3.9 m) with any sample r ≥ 4; P1 (45.4, 0.01, −15.6) — `d30b`'s south end (r ≥ 3, even the
Kettle); P2 (55.0, 0.01, −22.0) — `d30e` 3.8 m and `d30d` 1.8 m (r ≥ 4: everything but the Kettle). The guaranteed
samples (Kettle 3, Luka (laughing) 7, Display alarm 8 / Store radio 6) always solve every lure; the **Luka (laughing)**
lure fires its own drone line (systems). **Checkpoints** (`checkpoints` export): L21 `s32_cp_l21`, `s32_cp_l21_w`; L30
`s32_cp_a`, `s32_cp_l1`, `s32_cp_c` (Safe Room retry → the latest reached; Signal full → the current zone's).

**Patrol-path AR** (Chip View, Chase (2040) only): each path above as an `AR.add({ kind: 'path' })` polyline on the
floor; the sentinel as a straight dashed line down L2; the doorman as an arc (§12.4).

---

## 8. Hotspots

`who`: L = Luka, C = Chase, C40 = Chase (2040), any = active. Lines are the script's; the set adds none.

| id | at (mark / anchor) | r | verb | who | does |
| --- | --- | --- | --- | --- | --- |
| `h32_skate` | `s32_skate` / `skateboards` | 1.2 | Examine | any | "That kid's board is in here somewhere." |
| `h32_knives` | `s32_knives` / `knives` | 1.2 | Examine | any | "Every knife in Brisbane." |
| `h32_ladders` | `s32_ladders` / `ladders` | 1.2 | Examine | any | LUKA: "…He took the ladders." |
| `h32_guitars` | `s32_guitars_c40` / `guitars` | 1.4 | Examine | any (needs C and C40 present) | CHASE (2040) "That's mine." … "I wasn't using it." |
| `h32_headphones` | `s32_headphones` / `headphones_wall` | 1.2 | Take | C | "Take them? [YES]" → CHASE: "For later." → `headphones_wall.take()`, item `headphones`, flag `headphones` (**required** before the stair door opens) |
| `h32_ctrl_w`, `h32_ctrl_e` | `s32_ctrl_w` / `s32_ctrl_e` | 1.0 | Hold (pair `shelves`, "Hold this") | any | both held 1.5 s → `bank.open(1)` (one alone → `bank.jiggle()`) |
| `h32_bin` | `s32_bin_luka` / `tramp_bin` | 1.0 | Push | L | `strengthHold({ who: 'luka', label: 'Push', dur: 2.5 })` → `tramp_bin.push(u)` |
| `h32_stairs` | `stair_door12` | 1.2 | Door | any (bin done + headphones) | → L21 landing (fade) |
| `h32_kettle` | `kettle` | 1.2 | Kettle | any | "Put the kettle on? [YES] [NO]" + `tea_point.steam()` |
| `h32_cord` | `s32_cord` / `kettle_cord` | 1.0 | Take | C | the kettle cord (flag `s32_cord`) — CHASE: "Kettle cord. ^ It's always the kettle cord." plays at the jack (Wiring) |
| `h32_jack` | `s32_jack_chase` / `jack` | 1.2 | Examine → Wire (C, with the cord) → Plug in (L, brick phone) | C / L | INSERT `jack`; **Wiring** (`wiring`, the kettle-cord variant) → `jack.state('adapter')`; **Hack** (`hack`, 3 pop-ups, `hud.hack`) → `jack.state('phone')` → ACCESS |
| `h32_valve_w`, `h32_valve_e` | `s32_valve_w` / `s32_valve_e` | 1.0 | Turn (pair `valves`, "Hold this") | L / C (either side) | both together → `fog21.roll(1)`, `{env:'l21_fog', dur:3}`, `hatch21.lock('green')`, `hatch21.ladder(1)` |
| `h32_hatch` | `s32_hatch` / `hatch21` | 1.2 | Climb | any (after unlock) | the climb cutscene → L30 |
| `h32_s1`, `h32_p1`, `h32_p2` | `s32_s1` / `s32_p1` / `s32_p2` | 1.2 | Play sample | C | sample wheel → `DRONES.lure(at, id)`, `s1/p1/p2.play(true)` for `lure.dur` |
| `h32_m1` | `m1_push` / `m1` | 1.0 | Push | L | `strengthHold({ who: 'luka', label: 'Push', dur: 3.0 })` → `m1.push(u)` (Luka moves with it to `m1_done`) |
| `h32_lift` | `s32_reader_luka` / `lift_reader` | 1.2 | Use lanyard | L (Nadia's lanyard) | `lift30.reader('red')`, MANAGER ONLY; the side panel beat → cutscene |

---

## 9. Cutscene needs (shots → geometry that must exist)

**L12 arrival** (`dress('l12')`, env `lift`, `lamp('lift12')`, then `{env:'l12', dur:0.6}` as the doors open,
`lamp('gap')`): 3.1 ended inside `hq_atrium`'s car, so open on the identical car interior (`l12_lift_inside`: quilts,
panel with 12 lit, speaker grille, music `lift` cutting to `hq`). `l12_lift.doors(1)`; cut to `s32_doors_open` — the
three framed in the doorway **and reflected in the white floor** (live mirror required; in baked mode the mirrored
static copy shows the doorway, not the people — accept it). LUKA's line. `pa12.talk(true)` + `pa12` for "You
shouldn't be here." `l12_wide` to establish (cleaning drones gliding; the robots behind the fence).

**Examines.** `guitars` + `s32_guitars_two` (the acoustic in the NOISE bin must be readable as "battered", stickers);
`s32_headphones_close` as Chase hangs them round his neck (rig attachment `headphones` on Chase).

**The gap.** On both held: `gap` anchor while `bank.open(1)` (3 s, beacons blinking amber, the servo whine). The
followers walk `s32_gap_n → s32_gap_s`.

**The bin + stairs.** `tramp_bin` while Luka strains; `stair_door12.open(1)`; walk to `s32_stair_in`; fade.

**L21 arrival** (`dress('l21')`, env `l21`, `lamp('off')` until the party reaches the jack, then `lamp('jack')`): the landing
`l21_landing_wide`, `shutter` (STAIRWELL SEALED), `landing21.door(1)`, `pa21` line. `l21_reveal` down aisle A2.

**The jack.** `jack_wide` (`lamp('jack')`), INSERT `jack` (the tape label must read). Wiring is full-screen
(`MINIGAMES.wiring`, kettle-cord variant). The Hack: `brick_phone_floor` then the `hack` card full-screen;
`hud.hack(pct)` on L21 only; LUKA: "Nobody can fix JARVIS." ^ "But I know how it breaks."

**The interlock.** Cut between `valve_w` and `valve_e` (the player holds one, the AI the other); then `fog_wide` as
the fog rolls out (`fog21.roll(1)` + env `l21_fog`); `hatch21` looking up: lock red → green (`lamp('hatch21')`), the
ladder drops. `ladder21` MID: up the ladder; they vanish into the black shaft stub; fade.

**L30 arrival** (`dress('l30')`, env `l30`, `lamp('lift30')`): `l30_hatch_up` — `hatch30.open(1)`, they climb out
(`s32_l30_up` → `s32_l30_*`); `hangar_reveal` (≈ 790 docked drones, rows of blue lights, a few awake turning, the
storm through the south glass); `pa30` for "Chase. ^ Go home. ^ Please."

**The private lift** (end of PLAY): `lift30_doors` (MANAGER ONLY) → Luka at `s32_reader_luka` → INSERT `lift_reader`
(red; MANAGER ONLY) → Chase at `s32_panel_chase` → INSERT `side_panel` (**ROOF ACCESS — SANTA PHOTO 11:30 —
AUTHORISED: SANTA**) → `s32_santa_two` for the two lines → `lift30.panel('recognised')` as Santa steps up,
`reader('green')`, `doors(1)` → they file in (`car30_*`), `car30` inside (env `car30`, `lamp('car30')`, `car.button`
ROOF lit, "Are you sure?" chirp), doors close → black → `hq_roof` (`storm32`).

---

## 10. Ambience and `update(dt, ctx)`

**Ambience** (default `ambience: { rain: false, loops: ['hq_hush', 'cleaner_swish'], room: 'room' }`; `dress()`
re-sends per floor, guarded by `typeof AUDIO !== 'undefined'`).

| Floor | Loops | Room |
| --- | --- | --- |
| L12 | `hq_hush` (HVAC), `cleaner_swish` (2 positional handles moved to the nearest cleaning drones), `shelf_servo` (positional at the robot lane; the bank's whine is a one-shot) | `room` (big, soft) |
| L21 | `server_hum` (deep, 100/120 Hz with fan hiss), `cleaner_swish`, `drone_idle` (2 positional handles at the courtesy drones) | `room` (dry) |
| L30 | `hangar_charge` (a wide bed of hundreds of tiny charging whines, gated by `docked` count), `drone_idle` (positional, the patrols), `thunder_far` (one-shots with the strip flashes) | `room` (large) |
| Lift / car | `lift_hum` | `none` |

**`update(dt, ctx)` — no allocation** (module-level scratch `Matrix4`, `Vector3`, `Quaternion`, `Color`; named
functions; only the visible floor's blocks run).

1. Scene / env change → `dress(AUTO[state.scene] || R.state)`, lamp and ambience per floor.
2. **Cleaning drones** (active floor only): follow `paths.clean_*` (L12 5, L21 6 — hovering at rack height along the
   rack faces, polishing; L30 6) at 0.25–0.5 m/s with a slow spin; underglow breathes; write matrices once per frame.
3. **L12**: `bank` units ease to their targets (smoothstep, 3 s), colliders mutated in place, beacons blink while
   moving; `ctrl_*` rings; the two lane robots ping-pong; `tramp_bin` follows `push(u)` (eased), collider in place;
   lift door / stair door easing.
4. **L21**: rack LED texture offset scroll (two speeds); `fog21` cards rise/spread with `roll(k)` and drift along the
   aisles (sine), opacity × k; valve wheels ease to `turn`; hatch lid/ladder ease; the jack's phone screen blink;
   tea-point steam.
5. **L30**: 12 awake docked drones — instanceColor pulse + slow yaw (12 `setMatrixAt` per frame max); `tint` lerps all
   docked lights when systems call it; `m1` follows `push(u)` (eased) with its child IMs (they move with the group, no
   per-instance writes), collider in place; hatch lid; lift doors; side panel repaint on mode change only; `sky30`
   flash timer.
6. **PA grilles**: `talk` ring pulse driven by a per-frame level the content sets (0…1).
7. **Mirror**: live mode updates in the mirror mesh's `onBeforeRender` — nothing here.

---

## 11. Performance budget (target < 300; expected ≈ 60 baked / ≈ 120 live on L30, the heaviest floor)

| Group (active floor) | Draw calls |
| --- | --- |
| Static: `M.vc` 1, `M.atlas` 1, `M.labels` 1, `M.lit` 1, `M.glow` 1, floor 1 (+ baked mirror copy 3) | 6–9 |
| L12 extras: bank 12 groups × 2 = 24, lift 2, ctrls 2, bins IM 3, headphones 1, bin 1, robots 1 | ~34 |
| L21 extras: `M.leds` 1, tea point 2, jack 2, valves 2, fog 1, hatch 2, landing 2 | ~12 |
| L30 extras: docked 2, M1 3 (+ its floor light 1), hatch 1, lure props 3, lift + car 4, sky strip 2, floor light 1 | ~17 |
| Cleaning drones 2, PA 1 | 3 |
| Rigs: 3 actors (≈ 3 each) | ~9 |
| Content drones (≤ 5 × 2) + cones (systems) | ~15 |
| **Live mirror** (re-renders the visible floor minus the floor at 256²) | ×≈ 1.9 |

Rules: one Builder per floor (hidden floors cost nothing); every repeat instanced (docked drones are 2 IMs with
static matrices; only 12 move); the bank units are the only per-unit groups (they slide); no shadow maps; textures ≤
256 px; canvases repaint only on change; no per-frame allocation. L12 is the busiest in draw calls (the bank) and the
cheapest in pixels; L30 the reverse.

---

## 12. API summary and data exports

### 12.1 `SETS.hq_floors`

```js
SETS.hq_floors = {
  env, build, marks, anchors, cams, zones, colliders, props, ambience, update,
  dress(state),        // 'l12' | 'l21' | 'l30'
  lamp(name),          // 'lift12' | 'gap' | 'headphones' | 'jack' | 'hatch21' | 'lift30' | 'car30' | 'off'
  reflect(mode),       // 'live' | 'baked'
  makeMirror(w, d, opts),   // shared with hq_top (§3.2); returns a Mesh; re-entrant; one ShaderMaterial created once
  paths,               // §12.3
  checkpoints: { l21: ['s32_cp_l21', 's32_cp_l21_w'], l30: ['s32_cp_a', 's32_cp_l1', 's32_cp_c'] },
  lures: { s1: [40.3, 1.5, -31.0], p1: [45.4, 0.01, -15.6], p2: [55.0, 0.01, -22.0] },
  ar,                  // §12.4
};
```

**AUTO dress map**: `{ '3.2': 'l12' }`; content calls `dress('l21')` and `dress('l30')` under the transition blacks.

### 12.2 Dress states

| State | Visible floor | Env | Lamp | Ambience | Drones (content) | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `l12` | L12 group + its mirror | `l12` (`lift` for the arrival) | `gap` | L12 | none (cleaners only) | `bank` closed unless already opened |
| `l21` | L21 group + landing | `l21` (`l21_fog` after the interlock) | `off` → `jack` | L21 | `d21_a0`, `d21_a2` | the jack/valves/hatch keep their state |
| `l30` | L30 group + sky strip | `l30` (`car30` in the car) | `lift30` | L30 | `d30a…e` | `m1` keeps its state |

### 12.3 `paths` (`[x, z]`)

```js
paths: {
  clean_l12: [[[-56,-39.8],[-50,-39.8],[-50,-37.0],[-56,-37.0]], [[-60,-35.2],[-40,-35.2]], [[-60,-26],[-37,-26],[-37,-16.4],[-60,-16.4]],
              [[-58,-23],[-48,-20],[-40,-23]], [[-59,-17],[-49,-17]]],
  clean_l21: [[[-9.5,-34.55],[7.5,-34.55]], [[-9.5,-32.65],[7.5,-32.65]], [[-9.5,-28.65],[7.5,-28.65]],
              [[-9.5,-26.55],[7.5,-26.55]], [[-9.5,-24.65],[7.5,-24.65]], [[-9.5,-22.55],[7.5,-22.55]]],   // y 1.2–1.8, polishing rack glass
  clean_l30: [[[34,-36],[39.5,-36],[39.5,-14],[34,-14]], [[42,-36],[46,-14]], [[48.5,-30],[52.5,-14]], [[54.5,-36],[59.5,-36],[59.5,-24],[54.5,-24]],
              [[35,-20],[39,-28]], [[55,-16],[59,-18]]],
  d21_a0: [[-8.5,-35.6],[6.5,-35.6]], d21_a2: [[-9.0,-27.6],[6.8,-27.6]],
  d30a: [[38.6,-31.0],[38.6,-15.4]], d30b: [[44.2,-36.2],[44.2,-14.0]], d30d: [[56.8,-33.0],[56.8,-16.0]],
  old_trail: [[12.2,-20.0],[10.5,-20.0],[10.5,-27.6],[-4.7,-27.6],[-4.7,-31.6],[-12.0,-31.6],[-12.0,-23.4],[-13.6,-23.4]],
  lane_bots: [[-63.3,-40.0],[-63.3,-16.0]],
},
```

### 12.4 `ar` (Chip View; content: `for (const a of SETS.hq_floors.ar[floor]) AR.add(a)` when Chip View is allowed)

```js
ar: {
  l12: [
    { id: 'ar_l12',     at: [-53.0, 2.9, -36.6], text: 'ARCHIVE L12 · CONFISCATED FOR YOUR SAFETY', kind: 'sign', w: 3.4 },
    { id: 'ar_returns', at: [-50.0, 2.9, -34.2], text: 'RETURNS · please allow 6–8 weeks', kind: 'sign', w: 2.4 },
    { id: 'ar_stairs',  at: [-35.2, 2.6, -20.0], text: 'STAIRS · L12 → L21 (lift will not stop)', kind: 'sign', w: 2.4 },
  ],
  l21: [
    { id: 'ar_l21',     at: [11.0, 2.6, -24.6],  text: 'SERVER FLOOR L21 · COLD AISLES', kind: 'sign', w: 2.6 },
    { id: 'ar_old',     path: 'old_trail', y: 0.03, text: 'old', kind: 'path' },          // "a cable on the map that's just labelled 'old'"
    { id: 'ar_old_tag', at: [10.5, 0.6, -20.4],  text: 'old', kind: 'tag', w: 0.5 },
    { id: 'ar_hatch',   at: [-11.8, 2.8, -16.6], text: 'MAINT HATCH · INTERLOCK: COOLING W + E', kind: 'sign', w: 2.6 },
  ],
  l30: [
    { id: 'ar_l30',     at: [36.2, 2.9, -19.0],  text: 'HANGAR L30 · COURTESY FLEET · CHARGING', kind: 'sign', w: 3.0 },
    { id: 'ar_p_d30a',  path: 'd30a', kind: 'path' }, { id: 'ar_p_d30b', path: 'd30b', kind: 'path' },
    { id: 'ar_p_d30c',  path: [[50.45,-36.2],[50.45,-25.2]], kind: 'path' },            // the sentinel's sight line
    { id: 'ar_p_d30d',  path: 'd30d', kind: 'path' },
    { id: 'ar_p_d30e',  arc: { c: [58.8, -21.6], r: 4.2, a0: -2.47, a1: -0.67 }, kind: 'path' },   // the doorman's sweep
    { id: 'ar_lift',    at: [60.3, 2.9, -20.7],  text: 'PRIVATE LIFT · MANAGER ONLY', kind: 'sign', w: 2.2 },
  ],
},
```

(AR `path` entries reference `paths` by name or carry their own polyline; the systems' `AR.add` takes polylines —
content resolves the name. Cloud+ ads are added automatically by Chip View.)

### 12.5 Engine / cross-set notes

1. **`makeMirror`** is exported for `hq_top`. It is self-contained (an inlined Reflector, no addon import); its
   `ShaderMaterial` must be created once and kept (boot warm-up compiles it). If a future engine adds a shared mirror
   to `04-art.js`, switch both sets to it.
2. Drone stealth needs **cone occlusion by dynamic colliders** (M1 blinding the sentinel; racks blocking cones). If
   `33-systems.js` only tests distance/angle, add a 2-D ray-vs-collider test from the drone to the target (the
   colliders array is already live).
3. `world.torchAuto` is set `false` by `lamp()` and `true` by `lamp('off')`; please reset it in `showE()`.
4. The service-lift car must stay identical to `hq_atrium`'s (hq_atrium.md §12.6 item 3); the private-lift shaft and
   the L21/L30 hatch are shared with `hq_top`/`hq_roof`.
5. Optional eased chained cams on L21's aisles (`ease: 0.25`) need the world.md §15.4 item 1 hook.
