# SET `hq_atrium` — Optus Tower ground-floor atrium, Ann Street (Christmas Eve 2040, 10:00)

File `src/19-set-hq-atrium.js` · `SETS.hq_atrium` · Scene **3.1** "Mandatory Fun" (the exterior crane up the tower,
the atrium party, Blend In, Secret Santa, Nadia, the service lift). Same contract as Rue's `SETS.reddy`
(`ref/rue/05-set-reddy-optus-redcliffe-2026.js`): `{ env, build, marks, anchors, cams, zones, colliders, props,
ambience, update }` plus `dress(state)`, `lamp(name)`, `paths`, `ar`, `gifts` (§12).

**Shared geography.** This set uses the **Valley Grid (VG)** from `docs/sets/valley.md` §0.1 / §12.3 directly:
metres, Y up, **+X east, +Z south**; Ann Street centreline z = 0; the tower footprint VG x −18…18, z −41…−11. The
tower above the podium, its facade countdown, Yes sign and circling drones come from `SETS.valley.tower({ podium:
'none' })`; the city around it from `SETS.valley.skyline({ skip: ['TOWER'] })` (valley.md §12.4–12.6). So the street
the player walked in 2.8 (the Starlight two lots west, the mall head across Ann Street, Chinatown's gate) is exactly
what's outside the atrium glass.

---

## 0. Decisions (read first)

1. **The atrium is the whole ground floor**, three storeys (13.5 m) under the L3 slab: interior VG **x −17.6…+17.6,
   z −40.6…−11.4**. The glass facade and doors face **south onto Ann Street**; the far (north) wall is a white feature
   wall with the **countdown** and the **service lift**; mezzanine balconies (L1 y 4.5, L2 y 9.0) run along the west
   and east walls only, so the north wall reads full height from the entrance.
2. **One big room, five readable areas**: entrance (south centre), west (cracker table, choir under the SafeSense
   meter, the Quiet Corner), centre (under the MANDATORY FUN banner), east (morning tea + urn, lanyard desk, staff
   lifts), north (the bubble-wrapped tree, Secret Santa table, the service lift behind the tree). Each has its own
   high fixed camera so the Fun Monitor's beam reads on the floor.
3. **The service lift is real geometry**: a 2.2 × 2.2 m goods car built directly behind the steel door in the north
   wall (VG x −6.1…−3.9, z −43.0…−40.8), so "the doors close on the humming choir" and the inside shot are one
   continuous place.
4. **Corporate Christmas, the Manager's way**: sterile white, mirror-bright floor, foam on every corner, very little
   colour — Christmas red only on the crackers, the banner lettering and a few baubles under the bubble wrap. **Yes
   yellow** appears only on the corporate **Yes (Are you sure?)** sign on the north wall and the tower's Yes sign
   outside.
5. **Physical vs AR**: printed/physical — MANDATORY FUN banner, LANYARD REQUESTS · please allow 6–8 weeks (an acrylic
   desk sign, the same words as the yellowed Redcliffe flyer), the countdown, the SafeSense dB meter, YOU ARE SAFE NOW
   poster, the lift panel (G · 12 · 21 · 30), Yes (Are you sure?). **AR only** — staff name badges, gift tags, area
   signs (Chip View, §12.4).
6. `dress(state)`: `party31` (auto for scene 3.1), `crane31` (the exterior crane), `lift31` (3.1_lift).

---

## 1. Purpose and scenes

| Scene / beat | Story time | Env preset | Dress | What happens here |
| --- | --- | --- | --- | --- |
| 3.1 "3.1_tower" step 1 | Mon 24 Dec 2040, 10:00, storm overhead, rain paused | `storm_ext` | `crane31` | CRANE up the outside of Optus Tower: Ann Street, the canopy, ~30 storeys of curtain wall, the **QUIET IN 01:58:00** facade countdown, the Yes sign, drones circling like gulls |
| 3.1_tower steps 2–9 | 10:00 | `atrium` | `party31` | WIDE the atrium; TRACK the three at the entrance; DOOR DRONE reads Luke's invitation ("Welcome, Luke!") |
| ▶ PLAY "Get to the service lift" | 10:00–10:30 | `atrium` | `party31` | lanyard desk exchange; **Blend In** (Fun Monitor drone + festive actions; Quiet Corner = Safe Room); **Secret Santa** (5 deliveries; Chip View tags/badges); kettle = the morning-tea urn |
| 3.1_nadia | ~10:30 | `atrium` | `party31` | the fifth gift; "…His nephew."; "Service lift's behind the tree."; her lanyard over Santa's head |
| 3.1_lift | ~10:32 | `atrium` → `lift` (inside shot) | `lift31` | behind the tree, the steel door, the reader, the doors close on the choir, lift muzak, Chase (2040) stares at the ceiling speaker |

Time card: `Monday 24 December 2040, 10:00` · place `Optus Tower, Ann Street, Fortitude Valley`.
HUD: QUIET IN 01:58:00 (the facade and the atrium countdown show the same and tick in real time).

**Set lifetime.** 2.10 (valley) → 3.1 builds `hq_atrium` under the act card; `valley` stays live (liveMax 2) until
3.2 builds `hq_floors` behind the lift doors' close.

---

## 2. Layout

### 2.1 Axes and conventions

- VG (see header). Ground y = 0 everywhere walkable (no `floor()`); the road surface outside is y −0.10.
- Mark facing `ry`: the actor faces `(sin ry, cos ry)` → `0` faces **+Z (south, toward the glass/Ann St)**, `PI`
  faces **−Z (north, toward the tree and the countdown)**, `H` faces **+X (east)**, `-H` faces **−X (west)**.
- Looking north (−Z) from the entrance, screen-right is +X (east).

### 2.2 Plan (north at the top)

```
 z −43.0                ┌ lift car ┐ x −6.1…−3.9 (2.2 × 2.2, ceiling 2.5)
 z −40.6 ┌──────────────┴─[ SVC ]──┴───── north feature wall ─────────────────────────────────────────────┐
         │  "Yes (Are you sure?)" x −13.4…−7.4, y 10.2–12.4   │   COUNTDOWN x 1…13, y 5.6–9.6               │
         │W MEZZ  reader (−3.55, 1.2)   ← behind-tree passage z −40.6…−37.6 →                    E MEZZ   │
 −37.6   │L1 y4.5            ╱‾‾‾‾‾‾‾╲                                                       L1 y 4.5    │
         │L2 y9.0           │  TREE   │ (−5.0, −34.0) base r 3.6, h 13,          ▭▭▭▭▭▭▭▭▭  L2 y 9.0    │
 −34     │x −17.6…          │ bubble  │ padded star y 12.4–13.2    priya●  SECRET SANTA     x 13.6…17.6 │[lift] −33.5
         │   −13.6           ╲_______╱                              (3.5, −33.6) HR ●            │
 −31     │ ┌─ choir ─┐                     ◘ col (−9, −31)            ◘ col (9, −31)  nadia●      │[lift] −30.5
         │ │ risers  │ ◉ meter (−13.75, 3.6, −28.0)                                 ▮ DESK ▮     │
 −27     │ │10 singer│ wen●                                                 gaz●   (13.4, −27)   │
 −25     │ └─────────┘                                                                            │[lift] −23.5
 −22.5   │   ═══════════════════ MANDATORY FUN banner, y 5.9–7.5, x −13.6…13.6 ═══════════════    │
 −21     │  ▯ cracker table (−12.0, −20.5)  tom●                                                  │[lift] −20.5
 −19     │                     ◘ col (−9, −19)                    ◘ col (9, −19)                  │
 −16.4   │ ┌QUIET ─┐                                                         ▭ tea (12.5, −16.0)  │
 −15     │ │CORNER │            ▯   ▯   ▯   ▯   ▯   ▯   speed gates (open)        urn ●(13.6)     │
 −11.4   └─┴beanbag┴──────── glass ─────────────── [ DOORS x −2…+2 ] ────────────── glass ────────┘
 −11 … −8                         canopy x −8…8, y 5.0  ·  DOOR DRONE (0, 1.9, −10.5)
 −7      ══ N footpath ═══ padded bollards ════════════ zebra E x −2…2 ═══════════════════════════
  0      ── ANN STREET ──   (opposite: the mall head, bollard row z 11.6; the Starlight lot x −44…−26 to the west)
        x −17.6                               0                                                17.6
```

### 2.3 Key coordinates

| Thing | Where | Notes |
| --- | --- | --- |
| Interior | x −17.6…17.6, z −40.6…−11.4, floor y 0, ceiling 13.5 (white coffered soffit = L3 slab) | |
| **South glass facade** | inner face z −11.4, outer z −11.0, x −18…18, y 0…13.5; mullions every 2 m; transoms at 4.5 and 9.0 | storm daylight in; Ann St and the mall head visible through it |
| **Entrance doors** | x −2.0…+2.0 in the facade; two glass leaves slide to x ±4.0; padded leading edges | closed during PLAY (collider) |
| Canopy (outside) | x −8…8, z −11.0…−8.0, slab y 5.0–5.4, padded edge strip | the Door Drone hovers under it |
| Speed gates (open for the party) | z −15.6…−14.4; 6 cabinets 0.24 × 1.2 × 1.0 h at x −4.5, −2.7, −0.9, 0.9, 2.7, 4.5 | flaps retracted; padded tops |
| Columns | (−9.0, −19.0), (9.0, −19.0), (−9.0, −31.0), (9.0, −31.0); r 0.6, foam-wrapped to 2.2 m | |
| **Mezzanines** | west x −17.6…−13.6 and east x 13.6…17.6, full depth z −40.6…−11.4; L1 slab y 4.3–4.5, L2 y 8.8–9.0; glass balustrades at x ±13.6, h 1.1, padded top rails | not walkable; 6 onlookers |
| **MANDATORY FUN banner** | strung between the L1 balustrades: x −13.6…13.6, y 5.9…7.5, z −22.5; printed both sides | sags 0.25 m mid-span |
| **The tree** | centre (−5.0, 0, −34.0); stacked cone tiers to 13.0 m, base r 3.6; wrapped entirely in bubble wrap (taped seams); faint red/silver baubles and warm lights under the wrap; a **padded cream star** y 12.4–13.2 | three storeys |
| **Service lift door** | in the north wall, x −5.8…−4.2, y 0…2.4; plain brushed steel, one leaf sliding west into the wall; card **reader** at (−3.55, 1.2, −40.55) | directly behind the tree (3.0 m passage) |
| **Lift car** | x −6.1…−3.9, z −43.0…−40.8, y 0…2.5 | grey quilted goods-lift blankets on the walls, a stainless handrail, an emissive ceiling panel, a **ceiling speaker grille** at (−5.0, 2.48, −41.9), a **panel** on the east wall at (−3.92, 1.25, −41.15): buttons **G · 12 · 21 · 30**, a reader, "SERVICE LIFT" |
| **Countdown (far wall)** | north wall x 1.0…13.0, y 5.6…9.6, z −40.55; LED, SafeSense blue-white on dark grey | QUIET IN hh:mm:ss, ticking |
| **Yes (Are you sure?)** | north wall x −13.4…−7.4, y 10.2…12.4, facing +Z | the Yes logo in Yes yellow + "(Are you sure?)" in SafeSense blue |
| **Secret Santa table** | centre (3.5, 0, −33.6), 3.2 (x) × 1.0 (z), top y 0.8; white skirt with a blue PRE-SCREENED ribbon | **20 identical parcels** (§12.5), 2 rows × 10 |
| **Choir** | risers x −15.4…−13.0 (tier 1 y 0.3 at x −14.2…−13.0; tier 2 y 0.6 at x −15.4…−14.2), floor row x −13.0…−12.0, all z −31.0…−25.0; 10 singers facing +X | under the west mezzanine |
| **SafeSense meter** | hung from the W mezzanine L1 soffit edge: dial centre (−13.75, 3.6, −28.0), r 0.7, facing +X | needle 0–60 dB, red zone > 40 |
| **Cracker table** | x −12.45…−11.55, z −22.0…−19.0, top 0.78 | 24 crackers in a pile + **12 pairs of safety goggles** laid out in pairs |
| **Morning-tea table** | x 11.0…14.0, z −16.45…−15.55, top 0.78 | **tea urn** at (13.6, 0.78, −16.0) = the kettle; 16 pre-screened mince pies on trays (each with a tiny sticker); cups |
| **Lanyard desk** | x 13.0…13.8, z −28.2…−25.8, top 1.05; acrylic sign on its −X face | DESK woman behind it at (14.4, −27.0) |
| Staff lifts | east wall x 17.6; doors (1.2 × 2.4) centred z −33.5, −30.5, −23.5, −20.5 | SafeSense floor indicators above each scroll "Are you sure?" |
| **Quiet Corner** | x −17.6…−13.2, z −16.4…−11.4; padded cream partitions 2.0 h along z −16.4 (x −17.6…−13.2) and x −13.2 (z −16.4…−13.6); entry gap z −13.6…−11.4 | **beanbag** at (−15.8, 0, −14.4); **YOU ARE SAFE NOW** poster on the inner face of the z −16.4 partition at (−15.4, 1.4, −16.35); a floor lamp; a fake plant |
| Pendant stars | 6 padded stars at y 10.5–12.0 over the centre (x −6, 0, 6; z −18, −26) | slow turn |
| Floor | polished white stone, mirror sheen (painted reflections, no real reflection pass) | |

**Outside (near detail built by this set)**: Ann Street x −40…+40 (road y −0.10, lane lines, wet sheen), N footpath
z −11…−7 and S footpath z 7…11 with padded kerb bollards every 2 m (gap at zebra E x −2…2), 6 street lamps
(x −24, −8, 8, 24 on the N footpath; x −16, 16 on the S), the mall-head bollard row (9 at z 11.6, x −6…6), 4 slow
hover-cars. Everything else outside comes from `skyline({ skip: ['TOWER'] })` (the Starlight lot with its dead blade
sign two lots west, the mall faces, Chinatown's gate and lanterns, the rest of the Valley, the CBD, the river, the
Story Bridge) and `tower({ podium: 'none' })` (the tower from y 13.5 up). This set builds the **podium exterior**:
the glass south face (above), stone W/E/N podium faces to y 13.5 with a glass band at 4.5–9.0.

### 2.4 Colliders (`[x0, z0, x1, z1]`)

```
shell        S glass [-18.0,-11.4,-2.0,-11.0] [2.0,-11.4,18.0,-11.0]    doors (dynamic) [-2.0,-11.4,2.0,-11.0]
             W [-18.0,-41.0,-17.6,-11.0]  E [17.6,-41.0,18.0,-11.0]
             N [-18.0,-41.0,-5.8,-40.6] [-4.2,-41.0,18.0,-40.6]      svc door (dynamic) [-5.8,-40.8,-4.2,-40.6]
lift car     [-6.3,-43.2,-6.1,-40.8] [-3.9,-43.2,-3.7,-40.8] [-6.3,-43.2,-3.7,-43.0]
tree         [-8.6,-35.6,-1.4,-32.4] [-6.6,-37.6,-3.4,-30.4]   (a cross approximating r 3.6)
columns      [-9.7,-19.7,-8.3,-18.3] [8.3,-19.7,9.7,-18.3] [-9.7,-31.7,-8.3,-30.3] [8.3,-31.7,9.7,-30.3]
tables       santa [1.9,-34.1,5.1,-33.1] · cracker [-12.45,-22.0,-11.55,-19.0] · tea [11.0,-16.45,14.0,-15.55]
desk         [13.0,-28.6,17.6,-25.4]  (desk + the DESK woman's aisle)
choir        [-17.6,-31.0,-12.0,-25.0]
quiet corner [-17.6,-16.5,-13.2,-16.3] [-13.3,-16.5,-13.1,-13.6]   beanbag (soft, no collider)
gates        6 × [x-0.12,-15.6,x+0.12,-14.4] at x -4.5, -2.7, -0.9, 0.9, 2.7, 4.5
crowd        12 floor figures, 0.5 sq each (static, at their instance positions §4)
outside      N footpath ends [-10.4,-11.0,-10.0,-7.2] [10.0,-11.0,10.4,-7.2]
             kerb N [-40,-7.5,-2,-7.2] [2,-7.5,40,-7.2] · zebra sides [-2.3,-7.2,-2.0,7.2] [2.0,-7.2,2.3,7.2]
             S footpath stub [-2.0,7.2,2.0,7.5]   (the zebra ends at the S kerb; nothing beyond is walkable)
dynamic      HR / DESK / recipient rigs are actors (no colliders); content parks them
```

---

## 3. Look

### 3.1 Palette (spec §14: "Optus HQ: sterile white and mirror-floor reflections"; 2040 glassy accent; padded cream)

| Use | Hex |
| --- | --- |
| Walls, soffits, desks | sterile white `#f2f4f6`, shadow `#d8dce2` |
| Floor stone / reflection streaks | `#e8eaee` / `#ffffff` with `#c8d0dc` |
| Steel (lift doors, rails, gates) | `#b8bec6`, dark `#7a8088` |
| Glass (facade, balustrades) | `#cfe0ea` @ 0.25 |
| Foam (corner guards, sleeves, partitions, beanbag, star) | soft cream `#efe6d0`, seams `#d8ccb0` |
| SafeSense blue-white (countdown, meter, indicators, AR glyphs, chip lights) | `#bfe6ff`, deep `#4a8ab8` |
| Bubble wrap / under-wrap tree / baubles | `#eef6fa` highlights over `#3a6a4a`, baubles `#d8323a` / `#c8ccd4` |
| Christmas red (crackers, banner letters) | `#d8323a` |
| Antler headbands | brown `#6a4a32`, a few with felt red noses |
| Staff clothing (instanceColor set) | navy `#1e2a44`, grey `#6a7078`, white `#e8eaee`, black `#202226`, cardigan beige `#b8a888` |
| Quilted lift blankets | `#5a6068` |
| Tower glass / mullions (outside) | `#5f7484` / `#3a4048` |
| Storm sky (outside) | green-grey `#47524f`, darker `#2e3634` |
| **Yes yellow** (Yes sign only) | `#ffd21f` |

### 3.2 Materials

- `M.vc` — Lambert, vertex colours: all untextured static geometry (walls, mezzanines, tables, risers, columns,
  partitions, gates, the street) → 1 draw call.
- `M.atlas` — Lambert + one 256 × 256 atlas (nearest) for every printed sign/label/poster (§3.3).
- `M.floor` — Lambert, 128 × 128 polished stone with soft vertical reflection streaks (repeat), and a second, darker
  "reflection" quad set under the tree, tables and columns (baked, no real reflections).
- `M.glass` — Basic transparent 0.25 (facade, balustrades).
- `M.wrap` — Lambert, bubble-wrap texture on the tree tiers (opaque; the twinkle is a separate emissive IM of tiny
  bulbs just under the wrap).
- `M.glow` — Basic: lift indicators, ceiling panel, lamp heads, chip lights.
- `M.count` — Basic, the dynamic countdown canvas (shared generator with `tower().facade_countdown`).
- Exterior: the tower and skyline materials come from the shared builders (stable `key`s, warmed at boot).
- No vertex snapping, no affine warping, no wobble. Blob shadows only.

### 3.3 Textures to paint (128–256 px, nearest; **bold** = must read at the named anchor)

| Texture | Size | Content | Read at |
| --- | --- | --- | --- |
| `t_banner` | 256 × 32 (×2, one per side) | **MANDATORY FUN** in Christmas red, a thin SafeSense-blue border, two small padded stars | `banner`, `at_entry`, `s31_wide` |
| `t_lanyard_sign` | 128 × 64 | **LANYARD REQUESTS** / **please allow 6–8 weeks** (acrylic, the same wording as the yellowed Redcliffe flyer) | `lanyard_sign` |
| `t_countdown` | 256 × 64 (dynamic) | **QUIET IN 01:58:00** LED dots — drawn from the shared digit atlas | `countdown_wall` |
| `t_meter` | 128 × 128 | round dial 0–60, red arc above 40, **40 dB MAX**, "SafeSense"; the needle is a separate quad | `choir_meter` |
| `t_quiet_poster` | 64 × 96 | **YOU ARE SAFE NOW** + the SafeSense drop smiling | `quiet_poster` |
| `t_yes_unsure` | 256 × 64 | the Yes logo (`canvasTex.yes`) in Yes yellow + **(Are you sure?)** in SafeSense blue | `yes_unsure` |
| `t_gift` | 64 × 64 | white wrap, blue ribbon, **PRE-SCREENED** sticker; blank paper tag (names are AR) | `santa_table` |
| `t_cracker` | 64 × 32 | red/silver cracker wrap | `crackers` |
| `t_goggles` | 32 × 16 | clear safety goggles with a blue strap | `crackers` |
| `t_pie` | 32 × 32 | mince pie with a tiny **PRE-SCREENED** sticker | `mince_pies` |
| `t_bubblewrap` | 128 × 128 | bubble grid with specular dots over dark green, red/silver bauble blurs beneath, tape seams | `tree` |
| `t_floor` | 128 × 128 | white stone with soft reflection streaks | |
| `t_lift_panel` | 64 × 128 | **SERVICE LIFT**, buttons **G · 12 · 21 · 30**, a reader slot, "Are you sure?" under the alarm button | `lift_panel` |
| `t_reader` | 32 × 48 | card reader face with a red/green LED window | `lift_reader` |
| `t_lift_ind` | 128 × 16 | indicator strip "Are you sure?" (scrolls) | |
| `t_quilt` | 64 × 64 | grey quilted moving blanket | lift car |
| `t_steel` | 64 × 64 | brushed steel with a few fingerprints (nobody's polished the service lift) | svc door |
| `t_podium_stone` | 128 × 128 | white stone podium exterior | |

### 3.4 Lighting rig (hemi + dir + **one** spot) and fog, per preset

Every preset defines `spot`. No preset name contains "rain".

```js
env: {
  atrium:    { bg: 0xdfe6ea, fog: [0xe6edf2, 0.008],  hemi: [0xf6f8ff, 0xc4c8d2, 1.20], dir: [0xdfe8f0, 0.55, [8, 20, 30]],   spot: [0xfff0d8, 1.5], rain: 0 },
  storm_ext: { bg: 0x47524f, fog: [0x56625f, 0.0032], hemi: [0xa8b6b0, 0x2a302e, 0.85], dir: [0xc8d6d2, 0.60, [-30, 60, 40]], spot: [0xffffff, 0],   rain: 0 },
  lift:      { bg: 0x101214, fog: [0x202428, 0.020],  hemi: [0xd8e2ea, 0x404448, 0.80], dir: [0xffffff, 0.15, [0, 10, 0]],    spot: [0xfff6e8, 1.4], rain: 0 },
}
```

First key `atrium` is the build default; content sets `storm_ext` for the crane and back to `atrium` at the WIDE.
`storm_ext`'s low density (0.0032) keeps the tower top (140 m) and the city to ~450 m visible.

**The spot (`lamp(name)`)** — position/target from preallocated values; `world.torchAuto = false` while lit.

| `lamp()` | Position → target | Angle / penumbra / dist | Colour / intensity | Purpose |
| --- | --- | --- | --- | --- |
| `tree` (default in `party31`) | (−10.0, 11.0, −24.0) → (3.0, 0.8, −32.5) | 0.45 / 0.7 / 30 | `#fff0d8` / 1.5 | a warm pool from the west L2 balcony over the tree's base, the Secret Santa table and Nadia's spot: the 3.1_nadia close-ups |
| `car` (`lift31`) | (−5.0, 2.45, −41.9) → (−5.0, 0.0, −41.9) | 1.1 / 0.5 / 4 | `#fff6e8` / 1.4 | the lift car's ceiling light |
| `off` (`crane31`) | — | — | 0 | |

### 3.5 Sky and backdrop

Outside: `skyline({ skip: ['TOWER'], sky: 'storm', neon: 0.35 })` — "dark and heavy, but the rain has paused": wet
streets, no rain, a slow lightning flicker deep in the cloud cards every 25–40 s (no light on the set; Reduce
Flashing → a dim swell). `tower({ podium: 'none' })` supplies the curtain wall from y 13.5, the facade countdown
(`01:58:00`, running), the Yes sign and **12 drones circling** (orbits r 26–40 m, y 95–150).

---

## 4. Props

| id | Description | States / `userData` |
| --- | --- | --- |
| `tree_wrapped` | the 13 m bubble-wrapped tree + padded star + under-wrap bulbs (IM 60, emissive) | bulbs twinkle (slow, warm); `star.turn` 0.05 rad/s |
| `banner_fun` | MANDATORY FUN, two-sided | gentle sway (rotation.x ±0.02, 0.3 Hz) |
| `countdown_wall` | far-wall LED countdown | `set(h, m, s)`, `run(rate)` (default 1), `zero()` (not used in 3.1) — same generator as `tower().facade_countdown` |
| `yes_unsure` | Yes (Are you sure?) wall sign | `lit(bool)` |
| `choir_meter` | the SafeSense dial | `level(db)` eases the needle (idle 38–40 wobble with the hum; content drives it during **Hum**; > 40 → the red arc pulses) |
| `choir` | InstancedMesh, 10 simple singer figures (body + head-with-antlers + chip light: 3 IM) on the risers | hum bob (0.5 Hz, ±0.015 m, heads sway ±0.05 rad); `hush(bool)` freezes them (when the lift doors close, content may hush) |
| `crowd_staff` | InstancedMesh, 12 floor figures + 6 mezzanine onlookers (same 3 IMs as the choir, separate instance ranges) | idle bob, slow head turns toward the nearest playable every 4–8 s (polite smiles); three of them are the "Merry Christmas!" partners (§7.4) |
| `cracker_table` | table + crackers IM (24) + goggles IM (12 pairs) | `pull(i)` hides cracker i and its partner's half; `goggles(i, on)` hides a pair from the table (content puts goggles on the actors via art) |
| `santa_table` | table + gifts IM (20) | `take(i)` hides gift i; `left()` → count; `slot(i, out)` writes the parcel's world position into `out` |
| `tea_table` | table, urn, mince pies IM (16), cups (merged) | `pie(i)` hides one; `steam()` puffs the urn (save) |
| `lanyard_desk` | desk + acrylic sign + a tray of empty lanyard hooks | static |
| `staff_lifts` | 4 steel doors + indicator strips | indicators scroll; doors never open (MANAGER says no) |
| `quiet_corner` | partitions, beanbag, poster, lamp, plant | static (the Safe Room variant; the drone is content's) |
| `entrance_doors` | two sliding glass leaves | `open(u)` 0…1 eases (leaves slide to x ±4.0); collider opens at u ≥ 0.8 |
| `speed_gates` | 6 cabinets, flaps retracted | static |
| `svc_lift` | the steel leaf + its frame | `open(u)` slides the leaf west 1.6 m over 1.2 s (eased); collider opens at u ≥ 0.8 |
| `svc_reader` | card reader | `set('red'|'green')`; `beep()` (flash) |
| `lift_car` | car interior: quilts, rail, ceiling panel, speaker grille, panel | `light(on)`; `speaker(k)` pulses the grille glow with the muzak; `panel(floor)` lights a button (`'G'`, `12`, `21`, `30`) |
| `columns`, `corner_foam` | foam-wrapped columns; corner guards IM (60) on every desk/table/riser/partition/mezzanine corner | static |
| `mezz` | mezzanine slabs, balustrade glass, padded rails | static |
| `pendant_stars` | IM 6 | slow turn |
| `canopy` | the entrance canopy (outside) | static |
| `ext_street` | Ann Street strip, footpaths, kerb bollards IM (38), lamps IM (6 + 6), mall-head bollard row (9, shared IM) | static |
| `ext_traffic` | IM 4 hover-cars at 2 m/s | yield at zebra E |
| `tower` | `SETS.valley.tower({ podium: 'none' })` → includes `facade_countdown`, `yes_sign`, `tower_drones` | see valley.md §12.4 |
| `skyline` | `SETS.valley.skyline({ skip: ['TOWER'] })` | see valley.md §12.5 |

**Instanced repeats (counts)**

| Repeat | Count | Mesh(es) |
| --- | --- | --- |
| Staff figures (choir 10 + floor 12 + mezzanine 6) | 28 | 3 IM (body, head+antlers, chip light) |
| Gifts | 20 | 1 IM |
| Crackers / goggle pairs | 24 / 12 | 2 IM |
| Mince pies | 16 | 1 IM |
| Corner foam guards | ~60 | 1 IM |
| Tree bulbs | 60 | 1 IM |
| Pendant stars | 6 | 1 IM |
| Kerb + mall-head bollards (outside) | 47 | 1 IM |
| Street lamps (posts / heads) | 6 / 6 | 2 IM |
| Hover-cars (body / glow / shadow) | 4 | 3 IM |
| Tower drones | 12 | inside `tower()` |

**Instance positions of the floor staff (`crowd_staff` 0–11, `[x, z, ry]`)**: 0 (−3.0, −21.0, −H) partner for
`bi_merry_1`; 1 (3.2, −19.0, H) partner for `bi_merry_2`; 2 (8.2, −37.0, 0) partner for `bi_merry_3`; 3 (5.0, −24.5,
2.6); 4 (−6.6, −26.0, 0.9); 5 (1.6, −25.4, −2.2); 6 (6.8, −21.8, −1.4); 7 (−3.4, −16.6, 2.9); 8 (11.0, −34.4, −0.6);
9 (−10.4, −35.8, 1.2); 10 (1.8, −38.6, 0.3); 11 (−7.4, −21.8, 1.2). Mezzanine onlookers: W L1 (−13.9, 4.5, −20 / −33),
E L1 (13.9, 4.5, −18 / −30), E L2 (13.9, 9.0, −24), W L2 (−13.9, 9.0, −26), all leaning on the rails facing the centre.

Gameplay drones (Fun Monitor, Door Drone, the Quiet Corner drone) are **content-spawned** with `DRONES.spawn` (§7.3).

---

## 5. Marks (`[x, y, z, ry]`, VG)

**Outside / entrance**

| id | value | use |
| --- | --- | --- |
| `s31_ext_luka`, `s31_ext_chase`, `s31_ext_c40` | [−1.1, 0, −4.0, PI], [1.0, 0, −3.6, PI], [0.0, 0, −4.8, PI] | on zebra E, crossing to the tower (TRACK start) |
| `s31_door_luka`, `s31_door_chase`, `s31_door_c40` | [−1.0, 0, −9.4, PI], [1.0, 0, −9.2, PI], [0.0, 0, −9.8, PI] | under the canopy, facing the Door Drone (Chase (2040) in front with the invitation) |
| `door_drone` | [0.0, 1.9, −10.5, 0] | Door Drone post, facing +Z (out at them) |
| `s31_in_luka`, `s31_in_chase`, `s31_in_c40` | [−1.0, 0, −13.4, PI], [1.0, 0, −13.2, PI], [0.0, 0, −13.9, PI] | just inside the doors ("You're Luke now." / "Don't.") |
| `s31_cp` | [0.0, 0, −17.5, PI] | PLAY start + Safe Room retry point (followers ±1.0 m x) |

**Lanyard desk**

| id | value | use |
| --- | --- | --- |
| `desk_chase` | [12.2, 0, −27.0, H] | Chase at the desk |
| `desk_woman` | [14.4, 0, −27.0, −H] | DESK behind it |

**Secret Santa** (recipient look/speaker ids suggested: `priya`, `tom`, `wen`, `gaz`, `nadia`)

| id | value | use |
| --- | --- | --- |
| `hr` | [1.5, 0, −32.8, 1.0] | HR at the west end of the gift table, watching the door for Santa |
| `hr_meet` | [0.4, 0, −26.0, PI] | where HR intercepts Luka ("Oh thank god.") if he hasn't come to the table |
| `santa_pick` | [4.0, 0, −32.5, PI] | Luka at the table taking a gift |
| `c40_tags` | [5.6, 0, −32.6, −2.4] | Chase (2040) reading the AR tags (chip on) |
| `gift_priya` | [−1.2, 0, −29.4, 0.5] | "Antlers, by the tree, that's Priya" |
| `gift_tom` | [−10.9, 0, −20.6, H] | at the cracker table, back to it |
| `gift_wen` | [−12.5, 0, −27.0, H] | front row of the choir |
| `gift_gaz` | [11.6, 0, −22.6, −H] | waiting by the south lifts |
| `gift_nadia` | [7.6, 0, −30.4, −2.3] | alone by the column, looking at the tree |
| `give_priya` | [−0.8, 0, −28.6, −2.64] | Luka handing over (0.9 m in front, facing them) |
| `give_tom` | [−10.0, 0, −20.6, −H] | |
| `give_wen` | [−11.6, 0, −27.0, −H] | |
| `give_gaz` | [10.7, 0, −22.6, H] | |
| `give_nadia` | [6.9, 0, −31.0, 0.84] | |
| `s31_c40_nadia` | [5.2, 0, −28.8, −2.2] | Chase (2040) a few steps behind Santa (Nadia "looks at Chase (2040), recognises him") |
| `s31_chase_nadia` | [5.8, 0, −27.6, −2.5] | Chase |

**Blend In action spots** (each with a partner or a prop; §7.4)

| id | value | action |
| --- | --- | --- |
| `bi_cracker` | [−11.0, 0, −19.8, −H] | Pull cracker (with Tom across the table end, or another playable) — goggles first |
| `bi_hum` | [−11.4, 0, −29.4, −H] | Hum (beside the choir's front row, under the meter) |
| `bi_pie` | [11.8, 0, −15.0, PI] | Mince pie |
| `bi_merry_1` | [−4.0, 0, −21.0, H] | "Merry Christmas!" to the staffer at (−3.0, −21.0) |
| `bi_merry_2` | [4.2, 0, −19.0, −H] | … to the staffer at (3.2, −19.0) |
| `bi_merry_3` | [8.2, 0, −36.0, PI] | … to the staffer at (8.2, −37.0) |
| `kettle` | [13.0, 0, −15.0, PI] | the urn (save) |

**Quiet Corner (Safe Room variant)**

| id | value | use |
| --- | --- | --- |
| `quiet_beanbag` | [−15.8, 0, −14.4, 0.6] | the captured character, seated (`sit`, h 0.3) |
| `quiet_drone` | [−17.0, 2.1, −12.0, 2.5] | the drone in the corner |

**The service lift**

| id | value | use |
| --- | --- | --- |
| `s31_lift_luka` | [−4.0, 0, −39.8, PI] | Luka holding Nadia's lanyard to the reader |
| `s31_lift_chase`, `s31_lift_c40` | [−3.0, 0, −38.9, −2.6], [−5.6, 0, −39.0, 2.6] | waiting behind him |
| `lift_luka` | [−5.0, 0, −42.4, 0] | inside, back centre, facing the doors |
| `lift_chase`, `lift_c40` | [−4.4, 0, −41.5, 0], [−5.6, 0, −41.5, 0] | inside, squeezed in |
| `fun_home` | [0.0, 2.6, −26.0, PI] | Fun Monitor spawn |

---

## 6. Anchors (`{ at, from, fov }`, VG)

| id | at | from | fov | for |
| --- | --- | --- | --- | --- |
| `s31_crane_a` | [0.0, 7.0, −11.0] | [−4.0, 1.2, 8.5] | 50 | CRANE start: low on the S footpath (mall-head bollards in the foreground), up at the canopy and the glass; the Starlight's dead blade sign at frame left |
| `s31_crane_b` | [0.0, 92.0, −11.0] | [9.0, 70.0, 26.0] | 48 | mid-rise: the curtain wall streaming past, floor bands, a drone crossing |
| `s31_crane_c` | [0.0, 120.0, −11.0] | [14.0, 124.0, 44.0] | 50 | CRANE end: the **QUIET IN 01:58:00** band (y 108–116) lower-middle, the roof crown and the **Yes sign** (133–141) at the top, drones circling, the storm, the Valley below |
| `s31_wide` | [−2.0, 3.2, −34.0] | [6.4, 5.0, −12.0] | 60 | WIDE the atrium: the tree, the banner, the choir (left), staff in antlers, the countdown on the far wall (right), Yes (Are you sure?) (upper left) |
| `s31_track_a` / `s31_track_b` | [0.0, 1.3, −4.6] / [0.0, 1.3, −9.6] | [5.0, 1.5, −2.0] / [4.6, 1.5, −7.4] | 44 | TRACK the three to the doors (camera in the road, moving −Z with them) |
| `door_drone` | [0.0, 1.9, −10.5] | [0.8, 1.7, −7.6] | 36 | DOOR DRONE "Welcome! Please present your invitation." |
| `s31_invite` | [0.0, 1.4, −9.9] | [1.4, 1.6, −8.4] | 36 | the invitation held up to the drone (the CARD of Luke's invite overlays if content wants) |
| `s31_inside` | [0.5, 1.5, −13.5] | [−2.4, 1.6, −16.6] | 40 | "You're Luke now." / "Don't." just inside (choir and tree behind them) |
| `lanyard_sign` | [12.98, 0.85, −27.0] | [11.2, 1.2, −27.0] | 30 | INSERT LANYARD REQUESTS · please allow 6–8 weeks |
| `s31_desk_two` | [13.3, 1.4, −27.0] | [11.4, 1.6, −29.6] | 42 | Chase and DESK ("IT'S BEEN FOURTEEN YEARS.") |
| `banner` | [0.0, 6.7, −22.5] | [0.0, 2.0, −13.5] | 44 | MANDATORY FUN |
| `countdown_wall` | [7.0, 7.6, −40.55] | [7.0, 4.0, −27.0] | 40 | the far-wall countdown |
| `yes_unsure` | [−10.4, 11.3, −40.55] | [−8.0, 2.0, −24.0] | 32 | Yes (Are you sure?) |
| `choir` | [−13.8, 1.4, −28.0] | [−7.0, 2.2, −26.5] | 48 | the choir humming at 40 dB |
| `choir_meter` | [−13.75, 3.6, −28.0] | [−11.2, 2.6, −28.0] | 34 | the SafeSense meter |
| `crackers` | [−12.0, 0.85, −20.5] | [−10.6, 1.5, −20.5] | 38 | crackers and goggles |
| `mince_pies` | [12.3, 0.84, −16.0] | [12.3, 1.4, −14.9] | 32 | pre-screened mince pies |
| `urn` | [13.6, 1.05, −16.0] | [13.0, 1.45, −14.9] | 32 | save |
| `santa_table` | [3.5, 0.9, −33.6] | [3.6, 1.7, −31.6] | 42 | 20 identical pairs of socks |
| `gift_tags` | [3.5, 0.9, −33.6] | [5.6, 1.62, −32.6] | 34 | Chip View read of the tags (Chase (2040)'s eye) |
| `s31_hr` | [1.5, 1.5, −32.8] | [3.4, 1.6, −30.2] | 40 | HR: "Oh thank god. ^ You're late." |
| `tree` | [−5.0, 6.0, −34.0] | [2.0, 2.0, −20.0] | 50 | the bubble-wrapped tree |
| `tree_star` | [−5.0, 12.8, −34.0] | [−2.0, 1.6, −24.0] | 22 | the padded star |
| `s31_nadia_mid` | [7.25, 1.45, −30.7] | [9.4, 1.6, −29.0] | 40 | 3.1_nadia step 1 MID: Santa hands Nadia the parcel (side-on) |
| `s31_nadia_close` | [7.6, 1.6, −30.4] | [6.9, 1.62, −31.3] | 34 | CLOSE Nadia (over Santa's shoulder) |
| `s31_luka_close` | [6.9, 1.62, −31.0] | [7.5, 1.6, −30.0] | 34 | CLOSE Luka, frozen |
| `s31_lanyard` | [6.9, 1.7, −31.0] | [8.2, 1.6, −30.6] | 36 | her lanyard looped over Santa's head |
| `quiet_corner` | [−15.6, 0.8, −14.6] | [−13.6, 2.4, −11.9] | 60 | Safe Room variant shot |
| `quiet_poster` | [−15.4, 1.4, −16.35] | [−15.4, 1.45, −14.6] | 34 | YOU ARE SAFE NOW |
| `s31_behind_tree` | [−5.0, 1.2, −40.6] | [−0.6, 1.6, −37.2] | 44 | the plain steel door behind the tree (bubble wrap at frame left) |
| `lift_reader` | [−3.55, 1.2, −40.55] | [−3.55, 1.35, −39.95] | 26 | INSERT Nadia's lanyard against the reader (red → green) |
| `s31_lift_doors` | [−5.0, 1.2, −40.6] | [−0.6, 1.5, −37.0] | 44 | **the doors close on the humming choir** (the three inside, the tree's wrap in the foreground) |
| `lift_inside` | [−5.0, 1.3, −42.2] | [−4.05, 2.25, −40.95] | 72 | inside: the three squeezed in, facing the lens |
| `lift_speaker` | [−5.2, 2.2, −41.8] | [−4.4, 1.1, −41.0] | 46 | Chase (2040) staring up at the ceiling speaker |
| `lift_panel` | [−3.92, 1.25, −41.15] | [−4.6, 1.35, −41.15] | 30 | the panel: G · 12 · 21 · 30 |
| `facade_countdown` | [0.0, 112.0, −10.7] | [0.0, 104.0, 40.0] | 34 | the facade band (spare) |
| `yes_sign` | [0.0, 137.0, −36.0] | [0.0, 128.0, 30.0] | 26 | the Yes sign on the crown (spare) |

---

## 7. Gameplay zones and fixed cameras

High, fixed lenses hung from the facade transoms and the mezzanine edges (a building full of cameras), 27–36° down so
the Fun Monitor's beam reads as a clear fan on the white floor; one low corner behind the tree; one into the Quiet
Corner; one in the lift.

### 7.1 Cameras

```js
cams: {
  at_entry:  { type: 'fixed', pos: [6.8, 5.4, -12.0],   look: [-2.0, 0.8, -24.0],  fov: 56 },   // default
  at_west:   { type: 'fixed', pos: [3.0, 8.6, -14.0],   look: [-12.0, 0.4, -19.5], fov: 50 },
  at_choir:  { type: 'fixed', pos: [-2.0, 8.4, -20.0],  look: [-13.5, 0.8, -28.5], fov: 50 },
  at_centre: { type: 'fixed', pos: [0.0, 9.0, -12.2],   look: [0.0, 0.0, -24.5],   fov: 52 },
  at_east:   { type: 'fixed', pos: [-3.0, 8.6, -14.0],  look: [12.0, 0.4, -22.0],  fov: 50 },
  at_tree:   { type: 'fixed', pos: [11.0, 9.6, -22.0],  look: [-1.0, 0.6, -34.5],  fov: 52 },
  at_svc:    { type: 'fixed', pos: [1.6, 2.3, -39.4],   look: [-6.0, 1.1, -40.2],  fov: 54 },
  at_quiet:  { type: 'fixed', pos: [-13.6, 2.6, -11.9], look: [-16.4, 0.5, -15.6], fov: 62 },
  lift_in:   { type: 'fixed', pos: [-4.05, 2.25, -40.95], look: [-5.4, 1.1, -42.6], fov: 72 },
  ext_door:  { type: 'fixed', pos: [6.4, 2.2, -2.0],    look: [-0.6, 1.8, -10.6],  fov: 50 },
},
```

Sight-line checks: the west/east mezzanine soffits (y 4.3) never cut the floor from `at_west`, `at_choir` or `at_east`
(the rays pass x ±13.6 below 2.6 m); `at_centre` sees the banner's south face across the top of frame; `at_tree`
holds the tree base, the Santa table, Nadia's spot and the countdown at frame right.

### 7.2 Zones (first match wins; they tile the floor)

| # | box | cam | covers |
| --- | --- | --- | --- |
| 1 | [−6.1, −43.0, −3.9, −40.6] | `lift_in` | the lift car |
| 2 | [−11.0, −40.6, 1.0, −37.6] | `at_svc` | behind the tree (the steel door) |
| 3 | [−17.6, −16.4, −13.2, −11.4] | `at_quiet` | the Quiet Corner |
| 4 | [−6.0, −17.0, 6.0, −11.4] | `at_entry` | entrance, gates |
| 5 | [−17.6, −24.0, −6.0, −11.4] | `at_west` | cracker table, Quiet Corner approach |
| 6 | [−17.6, −40.6, −6.0, −24.0] | `at_choir` | the choir, the tree's west flank |
| 7 | [−6.0, −30.0, 6.0, −17.0] | `at_centre` | under the banner |
| 8 | [6.0, −30.0, 17.6, −11.4] | `at_east` | tea table, lanyard desk, lifts |
| 9 | [−6.0, −40.6, 17.6, −30.0] | `at_tree` | the tree front, Secret Santa, Nadia, the NE corner |
| 10 | [−10.0, −11.0, 10.0, −7.0] | `ext_door` | the forecourt under the canopy |
| 11 | [−2.0, −7.0, 2.0, 7.0] | `ext_door` | zebra E |

### 7.3 Drones (content spawns them)

| Drone | Kind | Post / spawn | Path | y | speed | cone {len, half} | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `fun_monitor` | `fun` (a larger white pod with a party-hat-shaped top light; beam colour SafeSense blue) | `fun_home` | loop `paths.fun_loop` | 2.6 | 1.1 | {5.0, 0.42}, **sweeping ±0.6 rad** about its heading at 0.4 Hz ("a beam") | one loop ≈ 59 s; passes every area once; idle-in-beam 3 s → "Are you having fun?" (systems) |
| `door_drone` | `courtesy` | `door_drone` (outside under the canopy) | parked | 1.9 | — | none | speaker for DOOR DRONE; despawn when they're inside |
| `quiet_drone` | `courtesy` | `quiet_drone` | parked | 2.1 | — | none | only during the Quiet Corner capture (content) |

`paths.fun_loop = [[-10.6, -16.5], [-10.6, -27.5], [-1.0, -29.5], [10.6, -27.5], [10.6, -16.5], [0.0, -17.5]]` —
it clears every column by ≥ 1.6 m and the tree by ≥ 5 m; it flies over people (y 2.6).

### 7.4 Blend In and Secret Santa stations

- Every zone with floor play (5, 6, 7, 8, 9) has at least one festive action within 4 m: zone 5 `bi_cracker`; zone 6
  `bi_hum`; zone 7 `bi_merry_1`, `bi_merry_2`; zone 8 `bi_pie`; zone 9 `bi_merry_3` (and HR at the table). The two
  non-active playables "hold" at the nearest station when the player swaps away (content: `flow.follow` hold
  positions = these marks).
- **Cracker**: both pullers put goggles on first (`cracker_table.goggles(i, false)` + an art attachment), then pull
  (`pull(i)`, `world.puff('cracker_table', { n: 10, color: 0xd8323a, speed: 0.8 })`, sfx `cracker_snap`).
- **Hum**: the active character holds YES; content drives `choir_meter.level(db)`; > 40 dB = fail (a SafeSense chirp).
- **Mince pie**: `tea_table.pie(i)`.
- **Merry Christmas!**: the partner staffer (a `crowd_staff` instance) nods (instance head tilt).
- **Secret Santa** (needs all three): Luka takes a gift at `santa_pick` (`santa_table.take(i)`); Chase (2040) at
  `c40_tags` with the chip on reads the tag (`ar_tag_<i>`, Signal fills); Chase walks the room — AR name badges over
  every staffer (`ar_name_*`) — and "points out" the recipient (hotspot); Luka gives it at `give_<name>`. Five
  deliveries; the fifth is always Nadia (→ 3.1_nadia).

---

## 8. Hotspots

`who`: L = Luka, C = Chase, C40 = Chase (2040), any = active character. Lines are the script's.

| id | at (mark / anchor) | r | verb | who | does |
| --- | --- | --- | --- | --- | --- |
| `h31_desk` | `desk_chase` / `s31_desk_two` | 1.2 | Talk | C | the LANYARD REQUESTS exchange (CHASE / DESK) |
| `h31_kettle` | `kettle` / `urn` | 1.2 | Kettle | any | "Put the kettle on? [YES] [NO]" + `tea_table.steam()` |
| `h31_cracker` | `bi_cracker` / `crackers` | 1.2 | Pull cracker | any | festive action (goggles first) |
| `h31_hum` | `bi_hum` / `choir_meter` | 1.4 | Hum | any | festive action (hold YES; needle ≤ 40 dB) |
| `h31_pie` | `bi_pie` / `mince_pies` | 1.2 | Mince pie | any | festive action |
| `h31_merry_1…3` | `bi_merry_1…3` | 1.2 | "Merry Christmas!" | any | festive action |
| `h31_gifts` | `santa_pick` / `santa_table` | 1.2 | Take a gift | L (after HR) | `santa_table.take(i)` |
| `h31_tags` | `c40_tags` / `gift_tags` | 1.6 | Read tags (Chip View) | C40, chip on | shows `ar_tag_*` for the gift Luka holds |
| `h31_point_<name>` | `gift_<name>` | 1.6 | Point out | C | marks the recipient (Chase (2040) calls them out, e.g. "Antlers, by the tree, that's Priya") |
| `h31_give_<name>` | `give_<name>` | 1.0 | Give | L (holding the right gift) | the recipient's line; 5th = Nadia → 3.1_nadia |
| `h31_lift` | `s31_lift_luka` / `lift_reader` | 1.2 | Use lanyard | L (Nadia's lanyard) | → 3.1_lift |

(No examine lines are scripted for 3.1; the set adds none.)

---

## 9. Cutscene needs (shots → geometry that must exist)

**3.1_tower step 1 — CRANE up the outside** (`s31_crane_a` → `_b` → `_c`, ~8 s, ease in-out; `dress('crane31')`,
env `storm_ext`): Ann Street wet but not raining (puddles reflecting the dim neon), the mall-head bollard row in the
foreground, the **canopy and glass doors**, the lit atrium behind the glass (the tree visible through it), then the
**curtain wall to y 131 with continuous floor bands** (`tower()`), the **L30 strip of docked-drone blue dots**, the
smoked top floor, the **facade countdown QUIET IN 01:58:00** (running), the roof crown and the **Yes sign** (Yes
yellow), **12 drones circling like gulls**, the heavy green-grey storm with cloud cards close above the tower, and the
Valley spread below (`skyline`: the mall running south, Chinatown's still lanterns, the Starlight's dead blade sign
two lots west, the river and the Story Bridge in the distance).

**Steps 2–9.** WIDE `s31_wide` (env `atrium`, `dress('party31')`): the tree, banner, choir under the meter, cracker
table with goggles, Secret Santa table, staff in antlers with chip lights, the countdown on the far wall. TRACK
`s31_track_a → _b` (outside, `ext_door` area): the three cross zebra E and stop under the canopy; the **Door Drone**
at `door_drone`; `s31_invite`; `entrance_doors.open(1)`; they walk in to `s31_in_*`; `s31_inside` for "You're Luke
now."

**Lanyard desk.** `s31_desk_two` + `lanyard_sign` INSERT.

**Secret Santa intro.** HR (`s31_hr`) — "Oh thank god. ^ You're late. Gifts are on the table. Names are on the tags." /
"…Ho ho."

**Quiet Corner capture** (Blend In fail): place the captured character at `quiet_beanbag`, the drone at
`quiet_drone`, cut to `quiet_corner` (DRONE: "You are not in trouble. ^ You are in danger." → "Would you like to try
again? [YES]"), retry at `s31_cp`. Under 6 s.

**3.1_nadia.** `s31_nadia_mid` (side two-shot, the spot `lamp('tree')` warming them), `s31_nadia_close`,
`s31_luka_close`, a framing two-shot that holds Chase (2040) at `s31_c40_nadia` in the background for "She looks at
Chase (2040), recognises him", `s31_lanyard` as her lanyard goes over Santa's head. Objective ticks.

**3.1_lift.** `dress('lift31')`: walk to `s31_lift_*` (cut `s31_behind_tree`), INSERT `lift_reader`
(`svc_reader.set('green')`, `beep()`), `svc_lift.open(1)`, they squeeze in to `lift_*`; `s31_lift_doors` as
`svc_lift.open(0)` — the choir hum audible and ducking as the door closes (`choir.hush` optional); cut inside
`lift_inside` (env `lift`, `lamp('car')`, music `lift`), `lift_speaker` on Chase (2040) staring at the grille
(`lift_car.speaker(k)` pulses with the muzak), `lift_panel` optional (`panel(12)` lit). Fade. 3.2 opens on
`hq_floors` (L12) — its lift interior should match this car (quilts, panel G · 12 · 21 · 30, speaker).

---

## 10. Ambience and `update(dt, ctx)`

**Ambience** (default `ambience: { loops: ['atrium_air', 'crowd_polite', 'clink'], room: 'atrium' }`; `dress()`
re-sends on state change, guarded by `typeof AUDIO !== 'undefined'`). The choir is the music cue `choir` (40 dB hum);
the lift is the music cue `lift`.

| State | Loops | Room |
| --- | --- | --- |
| `party31` | `atrium_air` (HVAC hush), `crowd_polite` (a murmur held at 40 dB, no words), `clink` (polite cup/plate clinks, sparse) | `atrium` (large, bright, glassy reverb) |
| `crane31` | `wind_high`, `drone_swarm` (the circling drones, panned), `thunder_far` | `none` |
| `lift31` | inside: `lift_hum`; the choir and crowd duck to −18 dB as the door closes | `small` |

**`update(dt, ctx)` — no allocation** (preallocated `Matrix4`, `Vector3`, `Quaternion`, `Color`; named functions only).

1. Scene change → `dress(AUTO[state.scene] || R.state)`; env change → lamp and ambience per state.
2. **Countdown**: `countdown_wall` (and the tower's band via `tower.userData.update`) tick at `run` rate; repaint the
   canvas only when the displayed second changes, using the digit atlas (`drawImage`), one `needsUpdate`.
3. **Tree**: 60 bulbs under the wrap — per-instance brightness via instanceColor on a slow sine (phase per bulb);
   star turns 0.05 rad/s.
4. **Choir**: 10 instance matrices — bob ±0.015 m at 0.5 Hz with small head sway (frozen when `hush(true)`).
5. **Staff**: 18 instances — idle bob; every 4–8 s one turns its head toward the nearest playable (eased), then back;
   the Merry Christmas partners nod on request.
6. **Meter**: needle eases to its target (idle 38–40 wobble; content level during Hum); the red arc pulses > 40.
7. **Banner** sway; pendant stars turn; staff-lift indicators scroll (texture offset).
8. **Doors**: `entrance_doors`, `svc_lift` ease to targets (smoothstep), colliders follow in place; `svc_reader` LED.
9. **Lift car**: `speaker(k)` → grille glow; ceiling panel steady.
10. **Outside**: `ext_traffic` (4 cars, 2 m/s, yield at zebra E), `tower.userData.update(dt, t)` (drones circling,
    countdown), `skyline.userData.update(dt, t)` (cloud drift, distant flicker).

---

## 11. Performance budget (target < 300; expected ≈ 95)

| Group | Draw calls |
| --- | --- |
| Static: `M.vc` 1, `M.atlas` 1, `M.floor` 2, `M.glass` 1, `M.glow` 1, `M.wrap` 1, banner 1, countdown 1, meter 2 | 11 |
| Instanced: staff 3, gifts 1, crackers 2, pies 1, corner foam 1, tree bulbs 1, stars 1, bollards 1, lamps 2, traffic 3 | 16 |
| Named props: entrance doors 1, svc door 1, reader 1, lift car 2, star 1, yes sign 1 | 7 |
| `tower({ podium: 'none' })` | ~6 |
| `skyline({ skip: ['TOWER'] })` | ~16 |
| Rigs: heroes 3, Priya/Tom/Wen/Gaz/Nadia 5, HR, DESK (≈ 3 each) | ~30 |
| Content drones (Fun Monitor, Door Drone; 2 each) | 4 |
| Blob shadows, puff | 2 |

Rules: merge all static untextured geometry into `M.vc`; every repeat is an `InstancedMesh`; `crane31` pauses the
interior instance updates (the camera is outside); no shadow maps; textures ≤ 256 px; no per-frame allocation.

---

## 12. API summary and data exports

### 12.1 `SETS.hq_atrium`

```js
SETS.hq_atrium = {
  env, build, marks, anchors, cams, zones, colliders, props, ambience, update,
  dress(state),       // 'party31' | 'crane31' | 'lift31'
  lamp(name),         // 'tree' | 'car' | 'off'
  paths: { fun_loop: [[-10.6,-16.5],[-10.6,-27.5],[-1.0,-29.5],[10.6,-27.5],[10.6,-16.5],[0.0,-17.5]],
           traffic_east: [[-50,-3.5],[50,-3.5]], traffic_west: [[50,3.5],[-50,3.5]] },
  gifts,              // §12.5
  ar,                 // §12.4
};
```

**AUTO dress map**: `{ '3.1': 'party31' }`; content calls `dress('crane31')` before the crane (then `party31` at the
WIDE) and `dress('lift31')` at 3.1_lift.

### 12.2 Dress states

| State | Env | Shown / on | Off | Lamp |
| --- | --- | --- | --- | --- |
| `party31` | `atrium` | everything; doors closed; svc door closed, reader red; countdown running from 01:58:00; tower drones 12 | — | `tree` |
| `crane31` | `storm_ext` | outside + tower + skyline; interior visible through the glass but its instance updates paused | — | `off` |
| `lift31` | `atrium` / `lift` | as `party31`; lift car light on; reader green after the beep | — | `car` (inside shots) / `tree` |

### 12.3 Story numbers

Countdown at scene start `01:58:00` (both `countdown_wall` and `tower().facade_countdown`), `run(1)`. The HUD's
QUIET IN is story time; the walls tick in real time — by the lift they read roughly 01:45; 3.2 sets its own.

### 12.4 `ar` (Chip View; content adds them when Chip View is allowed — Chase (2040) with the chip on)

```js
ar: [
  { id: 'ar_welcome', at: [0.0, 3.2, -11.6],    text: 'WELCOME TO MANDATORY FUN', kind: 'sign', w: 3.6 },
  { id: 'ar_santa',   at: [3.5, 2.6, -34.2],    text: 'SECRET SANTA · every gift pre-screened', kind: 'sign', w: 3.0 },
  { id: 'ar_quiet',   at: [-15.4, 2.4, -16.2],  text: 'QUIET CORNER', kind: 'sign', w: 2.0 },
  { id: 'ar_crackers',at: [-12.0, 2.0, -20.5],  text: 'CRACKERS · GOGGLES MANDATORY', kind: 'sign', w: 2.6 },
  { id: 'ar_pies',    at: [12.5, 2.0, -16.0],   text: 'MINCE PIES · PRE-SCREENED', kind: 'sign', w: 2.4 },
  { id: 'ar_choir',   at: [-13.0, 3.0, -25.0],  text: 'STAFF CHOIR · 40 dB', kind: 'sign', w: 2.0 },
  { id: 'ar_lifts',   at: [17.4, 3.0, -27.0],   text: 'LIFTS · Are you sure?', kind: 'sign', w: 2.2 },
  { id: 'ar_svc',     at: [-5.0, 2.8, -40.5],   text: 'SERVICE LIFT · L30 MAX', kind: 'sign', w: 2.0 },
  // name badges (kind 'name') at y 2.05 over each recipient mark and staff instance:
  //   PRIYA (gift_priya) · TOM (gift_tom) · WEN (gift_wen) · GAZ (gift_gaz) · NADIA (gift_nadia) · HR: KYLIE (hr) · DESK: BEC (desk_woman)
  //   decoys over crowd_staff 0–11 + choir 0–9: MARCUS, JO, DEV, SAM, RAJ, LIAM, MEI, TROY, ANH, CLAIRE, PRIYA S., TOM K., …
  // gift tags (kind 'tag') at gifts[i] + (0, 0.14, 0): see §12.5
]
```

### 12.5 `gifts` (20 parcels; positions on the table; AR tag text)

Row A (z −33.85) and row B (z −33.35), x = 2.05 + 0.32·k for k 0…9, y 0.86 (parcel 0.24 × 0.12 × 0.18).
Tags: the five real recipients are scattered — `A2: PRIYA`, `A7: TOM`, `B1: WEN`, `B5: GAZ`, `B8: NADIA`; the other
15 carry decoy names (MARCUS, JO, DEV, SAM, KYLIE, RAJ, LIAM, MEI, TROY, ANH, CLAIRE, BEC, PRIYA S., TOM K., WEN L.)
so Chase (2040) really has to read them. `santa_table.slot(i, out)` gives a parcel's world position.

### 12.6 Engine / cross-set notes

1. Uses `SETS.valley.tower` and `SETS.valley.skyline` (valley.md §12.4–12.5). If `SETS.valley` is missing, build a
   plain glass box for the tower (with a static countdown canvas and the Yes sign) and a dark horizon band; never throw.
2. `world.torchAuto` is set to `false` while `lamp('tree')` / `lamp('car')` are on; please reset it in `showE()`
   (same request as `parade`, `valley`).
3. `hq_floors` (3.2) should reuse this set's lift-car look (quilted walls, panel **G · 12 · 21 · 30**, ceiling speaker)
   for its lift arrivals; `hq_roof` (3.2 roof) reads the facade countdown at **00:17:00** from `tower()`.
