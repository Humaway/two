# SET `hq_roof` — the roof of Optus Tower, Fortitude Valley (2040)

File `src/22-set-hq-roof.js` · `SETS.hq_roof` · Scenes **3.2** (the roof cutscene "3.2_roof", storm), **3.7** "Storage
Full" (golden hour, the ring of 400 yellow drones, the Choice), **A1** "Keep" and **B1** "Again" (the goodbyes, the
call, the split screen's left half, A1's long "after"), and the **credits** vignette "the roof's ring of yellow
drones". Same contract as Rue's `SETS.reddy` (`ref/rue/05-set-reddy-optus-redcliffe-2026.js`): `{ env, build, marks,
anchors, cams, zones, colliders, props, ambience, update }` plus `dress(state)`, `lamp(name)`, `ring` (§12).

**Shared geography.** The **Valley Grid** (`docs/sets/valley.md` §0.1 / §12.3–12.6): metres, Y up, **+X east, +Z
south**. The roof deck is VG y 131.0, so **`local = VG − (0, 131.0, 0)`**: the deck is `y = 0`, x/z are VG. The
tower itself comes from `SETS.valley.tower({ podium: 'none', drones: 12 })` and the city from
`SETS.valley.skyline({ skip: ['TOWER'] })`, both added as children at **position (0, −131.0, 0)**. So the facade
countdown band sits 15–23 m below the south parapet (local y −23…−15), the **Yes sign** stands on the crown at the
north edge (letters local y 2…10, z −36, facing south), the mall runs due south, the river shines ~300 m out and the
**Story Bridge** is ≈ 27° east of south. The maintenance hatch at VG (8.0, −12.9) is the same hole as `hq_top`'s
ceiling hatch; the lift headhouse sits on the private-lift shaft shared with `hq_floors` L30 and `hq_top`.

---

## 0. Decisions (read first)

1. **One roof, two moods.** `storm32` (11:41, black-green storm overhead, wind, no rain yet, blue countdown glowing
   under their feet) and `golden37` (18:40, washed, steaming, gold; the facade band has gone Yes yellow since 11:58).
   Same geometry; dressing changes (the sleigh collapsed, the beard in a puddle, the ring of drones, the Remote rig).
2. **Walkable deck** x −17.55…17.55, z −35.0…−11.45 (south of the crown's plant box), y 0. Nobody roams here: every
   beat is a cutscene or the Choice pop-up, so zones exist only to keep framed lenses on the roof.
3. **The south parapet is the stage.** It is concrete, **1.2 m high, 0.45 m deep** (inner face z −11.45; its outer
   skin is the tower's parapet glass to the same height). Luka sits **against** it (3.7); the two older men lean on it
   (3.7_sorry) and finally sit **on** its cap facing the city, legs over the drop (A1 27–35).
4. **The ring** of 400 Yes-yellow drones sits on the deck like candles: an annulus **r 4.0…5.8 around (0, −19.0)**, five
   rows, with a **1.4 m entry gap facing the parapet** (south). Inside the clear 8 m disc: one soggy present box as a
   table, the **Remote** wired into the **brick phone**, cables out to the inner row. The ring's south edge is 1.75 m
   from the parapet, so the parapet shots always have the ring glowing in front of/around the people.
5. **Santa's photo set** sits in the south-east corner next to the maintenance hatch: a cardboard sleigh with its back to
   the parapet (the city is the photo backdrop), a ring light on a tripod facing it, a queue rope, two presents. In
   3.2 Luka drops the beard and hat on the sleigh beside the hatch; in 3.7 it has collapsed in the rain.
6. **Yes yellow** is the drones, the Yes sign, the facade band after 11:58 and the `ring` lamp. Nothing else on the roof
   is yellow (the sleigh's trim is a duller printed gold `#c8a040`).
7. `dress(state)`: `storm32`, `golden37`, `a1_after`, `credits` (§12.2). `lamp(name)` places the one spot.

---

## 1. Purpose and scenes

| Scene / beat | Story time / weather | Env preset | Dress | What happens here |
| --- | --- | --- | --- | --- |
| **3.2_roof** | Mon 24 Dec 2040, ~11:41 · the storm right overhead, black and green; wind; dry | `storm_roof` | `storm32` | the private lift opens on the roof; WIDE the roof (Brisbane spread out, the empty sleigh set, the countdown glowing under their feet: **QUIET IN 00:17:00**); CLOSE the maintenance hatch, Luka hauls it open, below dark; beard and hat dropped on the sleigh: "Right." |
| **3.7_roof** | 18:40 · golden hour after the storm, everything washed and steaming | `golden` | `golden37` | WIDE the roof at golden hour; MID the ring of 400 drones, the Remote wired to the brick phone; CLOSE Luka against the parapet being bandaged |
| **3.7_sorry / _staying / _storage / _fears** | ~18:45 | `golden` | `golden37` | the locked two-shot at the parapet; the two Lukas against the parapet; the pre-call check, JARVIS-CAM STORAGE FULL; the four; the hands on the Remote |
| **The Choice** | — | `golden` | `golden37` | the pop-up over `s37_hands`; both buttons live (mini-game `choice`) |
| **A1** "Keep" (roof part) | ~18:50 → just after sunset | `golden` → `afterglow` | `golden37` → `a1_after` | JARVIS-CAM Cloud+ activated; the goodbyes; the call (**split screen left half**); white pours from the Remote; the two older men on the parapet, "Why Pudding?", the earbuds, they fade; hold 4 s; white |
| **B1** "Again" (roof part) | ~18:50 | `golden` | `golden37` | JARVIS-CAM Clearing… Error 4044; the slate insert; the goodbyes; the call (split, as A1); white |
| **C** credits vignette | dusk | `credits_dusk` | `credits` | the empty roof, the ring of yellow drones glowing, a slow crane |

Time cards: 3.2 is mid-scene (none); 3.7 `18:40` (place `Optus Tower, the roof`). HUD: 3.2 QUIET IN 00:17:00; 3.7
onward none (the endings fill the signal icon to four bars as they land home — that's on `reddy26`).

**Set lifetime.** 3.2: content preloads `hq_roof` under the black as the L30 private-lift doors close
(`hq_floors` stays live), shows it, then preloads `hq_top` under the black at "Below: dark." (liveMax 3 during the
handover). 3.7: (re)built under the fade at the end of 3.6. A1/B1: `reddy26` must be live before the split (preload
it under the black between 3.7's Choice and A1/B1 step 1, liveMax 3).

---

## 2. Layout

### 2.1 Axes and conventions

- Local = VG − (0, 131.0, 0). Deck `y = 0`. The parapet cap top is y 1.2 (VG 132.2, the tower's parapet glass top).
- Mark facing `ry`: the actor faces `(sin ry, cos ry)` → `0` faces **+Z (south, the parapet, the city)**, `PI` faces
  **−Z (north, the Yes sign)**, `H` faces **+X (east)**, `-H` faces **−X (west)**.
- Looking south, screen-right is −X (west: the CBD and the low sun); screen-left is +X (east: the Story Bridge).
- Boxes and colliders are `[x0, z0, x1, z1]`.

### 2.2 Plan (north at the top)

```
 z −41 ┌──────────────────────── tower crown: PLANT BOX x −14…14, z −41…−35, y 0…3 ───────────────────────┐
       │                 Yes sign lattice z −36, letters x −12…12, y 2…10 (local), facing south              │
 z −35 ├──┐ vents ◍            ◍                         ◍                            ◍            ┌──────┤
       │W │                                                                                       │      │
       │  │                          ·  ·  ring band r 4.0…5.8  ·  ·                ┌─HEADHOUSE─┐ │  E   │
 z −22 │  │                     ·                               ·                  │ x 12…15.4 │ │      │
       │  │                  ·        ┌───────────────┐            ·       DOORS ▐ z −22.4…−19 │ │      │
 z −19 │  │                 ·         │ ▣ box + REMOTE │ (0,−19)    ·      (x 12.0)└───────────┘ │      │
       │  │                  ·        │   brick phone  │            ·             ○ ring light   │      │
 z −16 │  │                     ·     └───────────────┘         ·                (11.0,−16.4)    │      │
       │  │                          ·   ·  ·   gap ·  ·  ·              ═══ rope z −15.2 ═══    │      │
 z −13 │  │                                 ↓ (x ±0.7)            ⊡ HATCH (8.0,−12.9)  [ SLEIGH ] ▣▣│      │
       │  │  ● Luka sits (−2.4,−11.9)   ● ●                      curb x 7.4…8.6       x 9.4…12.6     │
 z −11.45 ═══════════════════ SOUTH PARAPET (concrete, cap y 1.2, 0.45 deep) ══════════════════════════════
 z −11.0  outer skin: tower parapet glass · below: the facade countdown band y −23…−15 · then the Valley, the
          river, the Story Bridge (SE)                                                                    
        x −17.55             −6                 0                 6                 12           17.55
```

### 2.3 Key coordinates

| Thing | Where | Notes |
| --- | --- | --- |
| Deck | x −17.55…17.55, z −40.55…−11.45, y 0; walkable z −35.0…−11.45 | wet charcoal concrete, drains, painted white walkway lines |
| **Parapet** (built here) | inner faces: S z −11.45, W x −17.55, E x 17.55; 0.45 deep to the tower's glass skin; top cap y 1.2 | the N edge is the crown's plant box |
| Crown plant box (from `tower()`) | x −14…14, z −41…−35, y 0…3.0, louvred south face | |
| **Yes sign** (from `tower()`) | lattice frame at z −36.0, letters x −12…12, local y 2…10, facing +Z, Yes yellow emissive | the roof's backdrop looking north |
| **Lift headhouse** | x 12.0…15.4, z −22.4…−19.0, h 3.2, flat top with a parapet lip; doors on the **west face (x 12.0), z −21.5…−19.9**, plate **MANAGER ONLY** (y 2.55), reader at (11.98, 1.2, −19.35) | over the shared private-lift shaft (VG x 12.4…15.0, z −22.0…−19.4); car interior x 12.4…15.0 visible when open |
| **Maintenance hatch** | opening 0.9 × 0.9 centred (8.0, 0, −12.9) (x 7.55…8.45, z −13.35…−12.45); curb 0.3 high, outer 1.2 × 1.2 (x 7.4…8.6, z −13.5…−12.3); lid hinged on the **south** edge, handle on the north edge, opens up and over to 105° | below: a black-lined shaft 1.4 m deep with the top 4 rungs of `hq_top`'s ladder (plane z −13.32) |
| **Santa sleigh** | x 9.4…12.6, z −13.1…−11.7, facing north (ry PI): seat y 0.6, back panel (south) to 1.5, front curl (north) to 1.1; flat printed cardboard (red `#c8323a`, gold trim `#c8a040`, a tinsel garland) | photo set; `storm32` intact, `golden37` collapsed |
| Ring light | tripod at (11.0, 0, −16.4), ring r 0.42 centred y 1.55, facing south (ry 0) | on, white, wobbling in the wind (3.2); knocked over (3.7) |
| Presents | P1 0.6 cube at (13.6, 0, −12.4) (`storm32`) → moved to **(0, 0, −19.0)** in `golden37` (the Remote's table); P2 0.45 cube at (13.5, 0, −13.3) | soggy in 3.7 |
| Queue rope + 4 padded stanchions | posts at x 9.0, 10.5, 12.0, 13.5 on z −15.2; rope Christmas red | |
| A-frame sign | (13.9, 0, −16.4), facing ry −0.5 | **SANTA PHOTOS · 11:30 · Smile (safely)** |
| **The ring** (`golden37`+) | centre (0, 0, −19.0); rows r 4.00 / 4.45 / 4.90 / 5.35 / 5.80 with **65 / 73 / 80 / 87 / 95 = 400** drones, each row spread evenly over the arc that skips the south gap (gap width 1.4 m: half-angle `0.7 / r` about +Z) | spacing ≈ 0.37 m; pods 0.32 wide, y 0.13 centre |
| **Remote rig** (`golden37`+) | on P1's top (y 0.6): the **Remote** (cream receiver gaffer-taped to a display chip) at (−0.12, 0.62, −18.86), its little screen facing **south**, tilted up 25°; the **brick phone** at (0.16, 0.62, −19.06), antenna up; a coiled cable between; **8 cables** from the box's base out to the inner row at angles 22.5° + k·45° | |
| Luka against the parapet | (−2.4, 0, −11.9) | 1.35 m from the ring's south edge |
| The parapet seats (A1) | cap at (±0.45, 1.2, −11.25) | facing south, legs over the edge |
| Earbuds (A1) | (0.05, 1.205, −11.3) on the cap | |
| Roof furniture | 6 mushroom vents (IM) at (−12, −32), (−6, −33), (4, −33), (−15.5, −16), (15.5, −30), (−15.5, −26); 4 drain grates; 12 fall-arrest eyes (IM) along the parapets | |
| Puddles | 12 decals (IM), e.g. (−9, −14.5) r 0.9, (−5, −24) r 1.2, (3.5, −28) r 0.8, (9.3, −14.6) r 0.6 (the beard's), (14, −26) r 1.0, (−13, −21) r 1.1 … | dark/sheen in storm, gold in golden |
| Outside | the countdown band (tower) y −23…−15 at z −10.7; `countdown_glow` quads at z −10.9; sun disc at (−426, 19, 199) | |

### 2.4 Colliders (`[x0, z0, x1, z1]`)

```
parapet   S [-18.0,-11.45,18.0,-11.0]  W [-18.0,-41.0,-17.55,-11.0]  E [17.55,-41.0,18.0,-11.0]
crown     [-14.0,-41.0,14.0,-35.0]   plus the deck strips N of z −35 outside the box: [-17.55,-41.0,-14.0,-35.0] [14.0,-41.0,17.55,-35.0]
headhouse shell N [12.0,-22.4,15.4,-22.0]  S [12.0,-19.4,15.4,-19.0]  E [15.0,-22.0,15.4,-19.4]
          W [12.0,-22.0,12.4,-21.5] [12.0,-19.9,12.4,-19.4]; doors (dynamic) [12.0,-21.5,12.1,-19.9] — open → parked at 1e4
          (the car interior x 12.4…15.0, z −22.0…−19.4 stays free for the `s32r_car_*` marks)
hatch     curb [7.4,-13.5,8.6,-12.3]
sleigh    [9.4,-13.1,12.6,-11.7]     ring light [10.7,-16.7,11.3,-16.1]     presents P1, P2 (P1 dynamic: moves to [-0.3,-19.3,0.3,-18.7])
stanchions [9.0,-15.3,13.5,-15.1]    a-frame [13.6,-16.7,14.2,-16.1]       vents 6 × 0.6 m squares
```

---

## 3. Look

### 3.1 Palette (spec §14: "Optus HQ … the roof gold after the rain"; storm: green-grey, wet)

| Use | `storm32` | `golden37` |
| --- | --- | --- |
| Deck (wet concrete) / sheen | `#2a2e30` / `#4a5a58` | `#6a5a4a` / gold `#ffcf80` |
| Parapet concrete / cap | `#5a5e60` / `#6a6e70` | `#9a8670` / `#b8a080` |
| Headhouse (white-grey panels) | `#7a8288` | `#c8b49a` |
| Sky (skyline) | black-green `#1c2420`, cloud underbelly neon tint | washed gold `#e2a860` → peach |
| Drones (shell / light) | — (tower drones blue `#8fd8ff`) | shell `#eef2f6`, light **Yes yellow `#ffd21f`** |
| Cardboard sleigh | red `#c8323a`, gold trim `#c8a040`, tinsel silver `#c8ccd4` | soggy, darker ×0.75 |
| Ring light | white `#ffffff` emissive | off |
| Countdown glow | SafeSense `#bfe6ff` | Yes yellow `#ffd21f` @ 0.4 |
| Steam | — | `#fff2dc` @ 0.25 additive |

### 3.2 Materials

- `M.vc` — Lambert, vertex colours: parapet, headhouse, curb, vents, stanchion posts, presents (pre-tinted), drains →
  1 draw call.
- `M.deck` — Lambert + `t_deck` (repeat 12 × 10) for the walkable deck; unique key (its colour lerps between moods).
- `M.atlas` — Lambert + `t_atlas` (MANAGER ONLY, the A-frame, hatch stencil, the presents' tags).
- `M.cardboard` — Lambert + `t_sleigh` (sleigh intact and collapsed share it).
- `M.glow` — Basic: ring light, headhouse reader, the car strip, the Remote's little screen (dynamic canvas `t_remote`).
- `M.puddle` — Basic additive, `depthWrite: false`: `t_puddle` (instanceColor = sky tint per mood).
- `M.steam` — Basic additive, `depthWrite: false`: `t_wisp`, instanceColor = alpha.
- `M.glowFx` — Basic additive: `countdown_glow`, `whiteout`, the sun disc (`fog: false`).
- Drones (the ring): the shared drone geometry from art; one white shell IM + one unlit instanceColor light IM
  (`setColorAt` at build).
- Tower and skyline materials come from the shared builders (stable keys).
- No vertex snapping, no affine warping, no wobble. Blob shadows only. No mirror floor here: the wet sheen and the
  puddles are painted.

### 3.3 Textures to paint (128–256 px, nearest; **bold** = must read at the named anchor)

| Texture | Size | Content | Read at |
| --- | --- | --- | --- |
| `t_deck` | 128 × 128 | concrete with water-stain blotches, a hairline crack, a faint white walkway line | |
| `t_sleigh` | 256 × 128 | the printed cardboard sleigh: red body, gold scroll trim, "SANTA EXPRESS · OPTUS" in fat type, a cartoon reindeer; right half the **collapsed** version (sagging, water-darkened, torn corner) | `sleigh` |
| `t_atlas` | 256 × 256 (8 × 32 px) | row 0 **MANAGER ONLY**; row 1 **SANTA PHOTOS · 11:30 · Smile (safely)**; row 2 "ROOF HATCH · KEEP CLEAR"; row 3 gift tag "To: Everyone · From: HR"; rows 4–7 spare | `s32r_lift_open`, `sleigh` |
| `t_remote` (dynamic) | 64 × 48 | the Remote's little screen: `off`, `check` (**LINE OPEN** · drone icon **3%**), `call` (a pulsing handset), `white` (blank white) | `s37_check`, `remote_screen` |
| `t_brick` | 32 × 64 | the brick phone face: green-lit LCD, rubber keys | `s37_remote_mid` |
| `t_puddle` | 64 × 64 (alpha) | soft-edged puddle with a ripple ring | puddles |
| `t_wisp` | 32 × 64 (alpha) | a soft vertical steam wisp | steam |
| `t_glow` | 32 × 128 (alpha) | vertical soft gradient | `countdown_glow` |
| `t_sun` | 64 × 64 (alpha) | a soft gold disc with a halo | sun |

The STORAGE FULL pop-up, the Cloud+ / Clearing / Error 4044 pop-ups and the Choice are SafeSense **UI pop-ups**
(content `popup`), not set textures; the slate and the email are CARDS.

### 3.4 Lighting rig (hemi + dir + **one** spot) and fog, per preset

Golden-hour sun: 24 Dec in Brisbane sets ≈ 18:45 at azimuth ≈ 245° (WSW), so at 18:40 the key light comes in low from
the **west-south-west**: dir position **[−60, 8, 28]** — faces on the roof are lit from screen-right in south-facing
shots, the CBD sits against the sun.

```js
env: {
  storm_roof:   { bg: 0x1c2420, fog: [0x26302c, 0.0024], hemi: [0x6e8478, 0x0e1210, 0.72], dir: [0x9fb8a8, 0.50, [-20, 60, 30]], spot: [0xffffff, 1.1], rain: 0 },
  golden:       { bg: 0xe2a860, fog: [0xe8b47a, 0.0019], hemi: [0xffe2b8, 0x5a4030, 0.95], dir: [0xffb05a, 1.50, [-60, 8, 28]],  spot: [0xffd21f, 0.9], rain: 0 },
  afterglow:    { bg: 0xc8848a, fog: [0xc89090, 0.0019], hemi: [0xf0c4b8, 0x3a2c3a, 0.80], dir: [0xff9a78, 0.70, [-60, 3, 28]],  spot: [0xffd21f, 1.1], rain: 0 },
  whiteout:     { bg: 0xffffff, fog: [0xffffff, 0.0800], hemi: [0xffffff, 0xffffff, 2.00], dir: [0xffffff, 1.00, [0, 10, 0]],    spot: [0xffffff, 0],   rain: 0 },
  credits_dusk: { bg: 0x2a2a4a, fog: [0x3a3450, 0.0022], hemi: [0x8a88b0, 0x18141c, 0.60], dir: [0xd8a0a0, 0.25, [-60, 2, 28]],  spot: [0xffd21f, 1.0], rain: 0 },
}
```

First key `storm_roof` is the build default. Lightning in `storm32` is distant (cloud cards only, no light on the
deck) every 10–20 s: `skyline.flash(1)`; Reduce Flashing → a 1.5 s dim swell.

**The spot (`lamp(name)`)** (`world.torchAuto = false` while lit; `lamp('off')` restores it):

| `lamp()` | Position → target | Angle / penumbra / dist | Colour / intensity | Purpose |
| --- | --- | --- | --- | --- |
| `sleigh` (`storm32` default) | (11.0, 1.55, −16.3) → (11.0, 0.8, −12.4) | 0.45 / 0.5 / 7 | `#ffffff` / 1.1 | the ring light's beam on the empty sleigh (and on Luka as he drops the beard) |
| `ring` (`golden37` default) | (0.0, 0.35, −19.0) → (0.0, 1.5, −16.6) | 0.90 / 1.0 / 6 | `#ffd21f` / 0.9 | warm under-light from the drones on anyone at the Remote (JARVIS-CAM borrows the spot automatically) |
| `parapet` | (−1.0, 0.4, −14.2) → (−2.6, 0.8, −11.9) | 0.70 / 1.0 / 5 | `#ffd21f` / 0.8 | the ring's bounce on Luka and Future Luka against the parapet (3.7 CLOSE, 3.7_staying) |
| `sitters` (`a1_after` default) | (0.0, 0.4, −14.0) → (0.0, 1.6, −11.3) | 0.80 / 1.0 / 6 | `#ffd21f` / 1.0 | the two on the parapet, rim-lit by the ring |
| `off` | — | — | 0 | |

### 3.5 Sky and backdrop

- `skyline({ skip: ['TOWER'], sky, neon })` at (0, −131.0, 0) — `storm32`: `sky('storm')`, `lit(0.35)`, `rain(false)`,
  `crowd('quiet')`; `golden37`: `sky('golden')`, `lit(1.0)`, `rain(false)`, `swing(true)` (gently),
  `bridgeLights(false)`, `crowd('quiet')`; `a1_after`: `sky('golden')` → content may lerp `sky('dawn')`-like peach is
  not needed — keep golden, `bridgeLights(true)`; `credits`: `sky('clear_night')`, `lit(1.0)`.
- `tower({ podium: 'none', drones: 12 })` at (0, −131.0, 0): `storm32` — `facade_countdown.set(0, 17, 0)`, `run(1)`,
  `yes_sign.lit(true)`, `tower_drones.count(12)` blue; `golden37`+ — `facade_countdown.zero(0)` (instantly the
  Yes-yellow band), `tower_drones.count(0)` (they're all on the roof).
- **`countdown_glow`** (built here): an additive vertical gradient quad on z −10.9, x −16…16, y −15.0…0.8 (bright at
  the bottom) + a horizontal haze quad at y −14.8, z −10.9…−7.5: from the roof the band 15 m below reads as a glow rising
  over the south parapet "under their feet". Blue in `storm32`, Yes yellow @ 0.4 after.
- **Sun disc** (`golden37`, `a1_after`): a fog-free billboard at (−426, 19, 199), 26 m, just above the horizon band, WSW.
- The **Valley's music drifting up** is audio (§10); the lanterns swing in `skyline`.

---

## 4. Props

| id | Description | Scenes | States / `userData` |
| --- | --- | --- | --- |
| `lift_doors` | two dark leaves in the headhouse's west face + the car interior (black mirror walls, a warm strip light, one button **ROOF**) | 3.2 | `open(u)` 0…1 (leaves slide 0.8 m each, 1.2 s, eased); collider follows |
| `maint_hatch` | lid + curb + the dark shaft with 4 rungs | 3.2 | `open(u)` lid rotation 0 → 105° about the south edge (eased, with a heavy clunk at 0.9); `dark` (the shaft is pure black, no lights) |
| `sleigh` | the cardboard sleigh + tinsel garland | 3.2, 3.7 | `state('intact' \| 'collapsed')`; `drop()` shows `santa_hat` + `santa_beard` lying on its seat (3.2 step 3); `wind(k)` garland flutter |
| `santa_hat`, `santa_beard` | Luka's disguise, as loose props | 3.2, 3.7 | 3.2: on the sleigh seat at (10.3, 0.62, −12.5) / (10.8, 0.62, −12.4) after `drop()`; `golden37`: the hat soggy on the collapsed sleigh at (10.4, 0.5, −12.4), **the beard in a puddle** at (9.25, 0.012, −14.6) |
| `ring_light` | tripod + ring | 3.2, 3.7 | `on(bool)`; `state('up' \| 'fallen')` (fallen: lying at (11.0, 0.1, −15.8) pointing west); `wobble(k)` |
| `presents` | P1, P2 | 3.2, 3.7 | P1 `moveTo('table')` (golden: at (0, 0, −19.0), soggy); P2 stays |
| `photo_set` | rope, stanchions, A-frame | 3.2, 3.7 | static (golden: the A-frame blown flat at (13.6, 0.05, −17.0)) |
| `ring` | **InstancedMesh 400** drones (shell IM + light IM) | 3.7, A1, B1, C | `visible`; `level(k)` light brightness 0…1 (the "3%" pre-call check dims to 0.35, back to 1); `flicker(on)` candle flicker; `pulse(k)` a travelling brightness wave round the ring (the call); `flare(k)` all lights to white-gold (the whiteout); `settle()` no-op (they're already down) |
| `remote_rig` | P1 as a table, the Remote, the brick phone, the coiled cable, 8 cables to the ring | 3.7, A1, B1, C | `screen(mode)` (`t_remote`); `trill(on)` the brick phone's LCD flashes with the double trill; `visible` |
| `whiteout` | additive white sphere at (0, 0.7, −19.0) | A1, B1 | `pour(dur = 2.0)`: r 0 → 12 m, opacity 0 → 1 (Reduce Flashing: opacity ≤ 0.85, 3.0 s); `reset()` |
| `earbuds` | two white earbuds + a short cable on the cap | A1 | `visible` (content shows them as the two fade, step 35) |
| `countdown_glow` | §3.5 | all | `color(hex)`, `level(k)`; breathes ±10% with the band's seconds (storm) |
| `sun` | sun disc | golden, a1_after | `visible`, `y(dy)` (content may sink it 1 m across A1's after, behind the horizon band) |
| `puddles` | IM 12 decals | all | sky tint per mood; ripple scroll |
| `steam` | IM 18 additive wisps | golden37, a1_after | rising, fading; `level(k)` |
| `vents`, `anchors_ring` | IM 6 / IM 12 | all | static |
| `tower` | `SETS.valley.tower({ podium: 'none', drones: 12 })` | all | valley.md §12.4 (`facade_countdown`, `yes_sign`, `tower_drones`) |
| `skyline` | `SETS.valley.skyline({ skip: ['TOWER'] })` | all | valley.md §12.5 |

**Instanced repeats (counts)**

| Repeat | Count | Mesh(es) |
| --- | --- | --- |
| Ring drones | **400** | 2 IM (shell, light — instanceColor, static matrices) |
| Puddles | 12 | 1 IM |
| Steam wisps | 18 | 1 IM (billboarded from the camera quaternion each frame, scratch only) |
| Mushroom vents / fall-arrest eyes | 6 / 12 | 2 IM |
| Tower drones (circling) | 12 | inside `tower()` |

**Ring drone placement** (build-time, deterministic): for row `i` (r = 4.00 + 0.45 i, n = [65, 73, 80, 87, 95][i]),
`g = 0.7 / r`; for k in 0…n−1, `a = g + (2π − 2g) · (k + 0.5) / n` measured from +Z (south) toward +X; position
`(r·sin a, 0.13, −19.0 + r·cos a)`; yaw so the light faces **outward**; per-instance tilt ±0.05 rad and yaw jitter ±0.08
from a seeded RNG (they landed one by one). Lights `setColorAt` Yes yellow × (0.85…1.0).

---

## 5. Marks (`[x, y, z, ry]`, local)

**3.2_roof**

| id | value | use |
| --- | --- | --- |
| `s32r_car_luka`, `s32r_car_chase`, `s32r_car_c40` | [13.2, 0, −20.7, −H], [13.9, 0, −20.1, −H], [13.9, 0, −21.3, −H] | inside the private car as the doors open |
| `s32r_out_luka` | [11.1, 0, −20.7, −2.2] | out onto the roof (Santa leads) |
| `s32r_out_chase`, `s32r_out_c40` | [11.4, 0, −19.5, −2.4], [11.5, 0, −21.9, −2.0] | |
| `s32r_hatch_luka` | [8.0, 0, −13.95, 0] | Luka north of the curb, facing south: hauls the lid open (it swings away from him toward the parapet) |
| `s32r_drop` | [9.3, 0, −13.75, 0.79] | Luka turned to the sleigh: pulls off the beard and hat, drops them on the seat: "Right." |
| `s32r_chase`, `s32r_c40` | [6.6, 0, −14.4, 1.2], [7.0, 0, −15.6, 0.8] | waiting by the hatch |
| `s32r_hatch_in` | [8.0, −0.6, −13.05, PI] | first rung going down (content `moveTo` with y; continues in `hq_top`) |

**3.7** (the ring centre is (0, −19.0); inside disc r < 4.0)

| id | value | use |
| --- | --- | --- |
| `s37_chase_remote` | [0.0, 0, −18.3, PI] | Chase kneeling at the Remote's south side (the screen faces him), wiring it into the brick phone; the pre-call check |
| `s37_luka_sit` | [−2.4, 0, −11.9, PI] | Luka sitting on the deck, back against the south parapet, facing north (`sit` on the floor), torn polo pulled up |
| `s37_l40_kneel` | [−1.65, 0, −12.35, −1.03] | Future Luka kneeling beside him, wrapping the bandage |
| `s37_l40_edge`, `s37_c40_edge` | [3.8, 0, −11.95, 0], [4.6, 0, −11.95, 0] | 3.7_sorry: side by side at the parapet, facing the city, forearms on the cap |
| `s37_l40_sit` | [−3.2, 0, −11.9, PI] | 3.7_staying: Future Luka sits next to his past self against the parapet |
| `s37_st_chase` | [−0.3, 0, −18.25, PI] | 3.7_storage: at the Remote (JARVIS-CAM faces) |
| `s37_st_luka` | [0.5, 0, −17.9, −2.66] | |
| `s37_st_l40` | [0.95, 0, −17.45, −2.6] | leaning in, reading the small print |
| `s37_st_c40` | [−0.95, 0, −17.45, 2.6] | |
| `s37_f_chase`, `s37_f_luka` | [−0.9, 0, −18.95, H], [0.9, 0, −18.95, −H] | 3.7_fears: the two past selves face each other across the Remote; also the **hands** two-shot and the Choice |
| `s37_f_l40`, `s37_f_c40` | [3.8, 0, −11.95, PI], [4.6, 0, −11.95, PI] | the two older men side by side, leaning back on the parapet, watching (Luka nods at them) |

**A1 / B1**

| id | value | use |
| --- | --- | --- |
| `a1_luka`, `a1_l40` | [0.6, 0, −17.6, −2.4], [1.3, 0, −16.9, 0.75] | the goodbyes (two-shots; content turns each pair to face) — the lanyard handover |
| `a1_chase`, `a1_c40` | [−0.6, 0, −17.6, 2.4], [−1.3, 0, −16.9, −0.75] | |
| `a1_dial` | `s37_chase_remote` | Chase dials on the brick phone |
| `a1_sit_l40`, `a1_sit_c40` | [−0.45, 1.2, −11.25, 0], [0.45, 1.2, −11.25, 0] | sitting **on** the parapet cap, shoulder to shoulder, facing the city (content `place` + `sit` h 0) |
| `a1_earbuds` | [0.05, 1.205, −11.3, 0] | where the earbuds lie |
| `b1_luka_lanyard` | [0.6, 0, −17.6, −2.4] | Luka reaching for his snapped lanyard ("Keep your lanyard.") |

---

## 6. Anchors (`{ at, from, fov }`, local)

| id | at | from | fov | for |
| --- | --- | --- | --- | --- |
| `s32r_lift_open` | [12.0, 1.3, −20.7] | [7.6, 1.6, −18.6] | 46 | the private lift opens on the roof: wind, the storm, Santa and his elves step out |
| `s32r_crane_a` | [2.0, 2.4, −24.0] | [−4.0, 3.2, −37.4] | 50 | WIDE (crane start): low behind the Yes sign's lattice, the yellow letter backs in the foreground, the dark deck beyond |
| `s32r_crane_b` | [6.0, −6.0, 6.0] | [−6.0, 9.5, −31.0] | 54 | crane end (6 s rise over the sign): the deck, the three at the hatch and the empty sleigh, the parapet with the countdown glow rising over it, the Valley's dimmed neon below, the river, the Story Bridge left of centre, the black-green storm overhead |
| `s32r_feet` | [6.0, −10.0, −11.0] | [4.0, −4.0, 24.0] | 40 | (optional cut) from outside: **QUIET IN 00:17:00** glowing on the facade in the lower half, the parapet and the three's heads and shoulders above it — "under their feet" (they must be at `s32r_hatch_luka`/`s32r_drop`/`s32r_chase`, ≤ 2.5 m from the parapet) |
| `facade_countdown` | [0.0, −19.0, −10.7] | [0.0, −17.0, 26.0] | 36 | INSERT the band alone (spare) |
| `roof_hatch` | [8.0, 0.1, −12.9] | [7.2, 1.9, −14.6] | 44 | CLOSE the maintenance hatch: Luka hauls it open; below, dark |
| `s32r_drop_shot` | [9.8, 1.3, −13.0] | [7.4, 1.6, −15.4] | 42 | Luka pulls off the beard and hat and drops them on the cardboard sleigh: "Right." |
| `sleigh` | [11.0, 0.8, −12.4] | [10.2, 1.6, −17.4] | 46 | the photographer's view: the empty sleigh in the ring light's beam, the parapet and the storm city behind |
| `yes_sign` | [0.0, 6.0, −36.0] | [0.0, 2.0, −20.0] | 40 | the Yes sign from the deck |
| `s37_crane_a` | [0.0, 0.0, −16.0] | [2.0, 15.0, −44.0] | 52 | WIDE the roof at golden hour (crane start): high behind the crown, down over the Yes sign onto the roof, the ring glowing, the Valley to the shining river, the Story Bridge left, the CBD and the low sun right |
| `s37_crane_b` | [0.0, −4.0, 10.0] | [−3.0, 6.0, −33.0] | 56 | crane end: lower, over the deck; steam rising from the puddles, the collapsed sleigh and the beard in its puddle at frame left |
| `s37_remote_mid` | [0.0, 0.7, −18.9] | [−2.2, 1.5, −16.6] | 44 | MID: the ring of four hundred, the Remote on the soggy present, Chase wiring it into the brick phone |
| `s37_bandage` | [−2.1, 0.75, −12.0] | [−0.6, 0.95, −13.9] | 40 | CLOSE: Luka against the parapet, Future Luka wrapping his ribs (the lens sits in the ring's gap) |
| `s37_sorry_two` | [4.2, 1.45, −11.8] | [−0.6, 1.6, −12.3] | 34 | 3.7_sorry: **one locked two-shot**, side-on along the parapet: both in profile, the city falling away screen-right |
| `s37_c40_close` | [4.6, 1.6, −11.95] | [5.6, 1.62, −9.9] | 34 | CLOSE Chase (2040): he laughs and it turns into something else (a floating lens 1 m beyond the parapet) |
| `s37_staying_two` | [−2.8, 0.75, −11.9] | [−2.8, 1.0, −14.6] | 42 | the two Lukas against the parapet, the ring's pods glowing in the lower frame |
| `s37_check` | [0.0, 0.75, −18.9] | [0.9, 1.25, −17.2] | 40 | MID: Chase at the Remote, the pre-call check ("Drones are at… ^ 3%") |
| `remote_screen` | [−0.12, 0.72, −18.78] | [−0.12, 0.86, −19.25] | 46 | **JARVIS-CAM** from behind the Remote's little screen: faces at `s37_st_*` lit by it, the parapet and the gold city behind them; the pop-up lands over them (3.7 step 25, A1 step 2, B1 step 2) |
| `s37_fears_wide` | [0.0, 1.1, −17.0] | [0.0, 2.6, −23.4] | 52 | the four: the past selves in profile across the Remote, the older two side by side at the parapet behind (screen-left), the city |
| `s37_hands` | [0.0, 0.66, −18.9] | [0.0, 1.35, −19.75] | 36 | TWO-SHOT · tight: Luka's grazed hand and Chase's hand side by side on the Remote (Rue's 3.4 framing); **the Choice** sits over this |
| `s37_roof_wide_low` | [0.0, 1.0, −17.0] | [−9.0, 1.6, −25.6] | 56 | A1 step 3 / B1: WIDE the roof — nobody speaks; Future Luka nods once |
| `a1_split_roof` | [0.2, 1.0, −18.2] | [−6.5, 3.4, −7.2] | 50 | **SPLIT left half** (≈ 0.89 aspect): the 2040 roof at golden hour, four men inside the ring, the Yes sign above; also "white pours across the roof from the Remote" |
| `a1_parapet_wide` | [0.0, 1.2, −11.3] | [0.0, 5.2, −27.0] | 46 | A1 27: two men on the parapet, shoulder to shoulder, the ring glowing around them |
| `a1_hands_slate` | [0.45, 1.35, −11.4] | [1.2, 1.9, −12.6] | 34 | CLOSE Chase (2040)'s hands: the slate, untangling the earbuds, one each |
| `a1_behind` | [0.0, −8.0, 40.0] | [0.0, 2.2, −16.6] | 48 | WIDE · **locked**, from behind them, the city ahead: they fade over the last chorus; the empty parapet; the earbuds; hold 4 s |
| `a1_earbuds` | [0.05, 1.21, −11.3] | [0.6, 1.5, −12.0] | 30 | INSERT the earbuds on the wet concrete, still playing (spare) |
| `credits_ring_a` | [0.0, 0.0, −19.0] | [0.0, 9.0, −30.0] | 50 | credits vignette start: high over the empty roof at dusk, the ring glowing |
| `credits_ring_b` | [0.0, 0.4, −19.0] | [−8.0, 3.0, −8.0] | 50 | crane down to the parapet edge, the ring and the lit Valley |
| `a2_print` | [0.0, 0.8, −18.0] | [6.0, 8.5, −7.0] | 48 | the composition of the drone's photo on the A2 Wall ("four men on a rooftop at golden hour inside a ring of yellow lights") — `reddy26` paints the print to match |

---

## 7. Gameplay zones and fixed cameras

There is **no roam on this set**. The Choice is a pop-up over `s37_hands` (mini-game `choice`, which owns the camera).
Zones tile the deck only so the framing helper keeps computed lenses on the roof and inside the parapet.

```js
cams: {
  roof_wide: { type: 'fixed', pos: [-9.0, 1.6, -25.6], look: [0.0, 1.0, -17.0], fov: 56 },   // default (= s37_roof_wide_low)
  roof_car:  { type: 'fixed', pos: [14.8, 2.3, -21.8], look: [12.0, 1.2, -20.4], fov: 70 },  // inside the private car
},
zones: [
  { box: [12.4, -22.0, 15.0, -19.4], cam: 'roof_car' },
  { box: [-17.55, -35.0, 17.55, -11.45], cam: 'roof_wide' },
],
```

(If a later revision adds a roam here, split the deck into W [−17.55…−6], C [−6…6], E [6…17.55] with high corner cams
on the headhouse roof and the crown.)

---

## 8. Hotspots

None. Every beat is a cutscene; the Choice is the `choice` mini-game (hold to confirm, both buttons live). **No kettle
on this set** — the only tea here is spoken ("…Tea?" "Yes, please.").

---

## 9. Cutscene needs (shots → geometry that must exist)

**3.2_roof** (`dress('storm32')`, env `storm_roof`, `lamp('sleigh')`)

0. (Bridge from `hq_floors`) INSIDE the car `roof_car`, then `lift_doors.open(1)` on `s32r_lift_open`: wind gusts in
   (the garland, the ring light wobbling), the three step out to `s32r_out_*`.
1. **WIDE · the roof** — `s32r_crane_a → s32r_crane_b` (6 s, ease in-out): needs the Yes sign's back lattice, the
   wet deck, the headhouse, the hatch curb, the sleigh set lit by the ring light with **nobody there**, the parapet,
   the blue `countdown_glow` rising over it, `skyline` storm (the Valley's dimmed neon below, the river, the Story
   Bridge, Chinatown's still lanterns), the black-green cloud cards right overhead, 12 tower drones circling, a distant
   flash. Optional cut `s32r_feet`: the facade band **QUIET IN 00:17:00** (`tower().facade_countdown.set(0, 17, 0)`) with
   their heads above the parapet — for that the three must already stand at `s32r_hatch_luka` / `s32r_chase` /
   `s32r_c40` (≤ 2.5 m from the parapet).
2. **CLOSE · the maintenance hatch** `roof_hatch`: Luka at `s32r_hatch_luka`, `act` lift-strain → `maint_hatch.open(1)`
   (1.4 s, clunk); below, pure black (no geometry visible but four rungs).
3. Luka turns to `s32r_drop` (`s32r_drop_shot`): pulls off the beard and hat (rig attachments off) → `sleigh.drop()`;
   "Right." Then they go down (`s32r_hatch_in`); fade to black; `hq_top` 3.3.

**3.7_roof** (`dress('golden37')`, env `golden`, `lamp('ring')`)

1. **WIDE** `s37_crane_a → s37_crane_b` (7 s): the storm gone, the deck washed and steaming (`steam`), gold puddles,
   the river shining, the Story Bridge, the Valley loud (lanterns swinging), the **collapsed sleigh**, the **beard in a
   puddle**, the sun disc low WSW, the facade band below gone Yes yellow.
2. **MID** `s37_remote_mid`: the ring (400, `flicker(true)`), the Remote rig, Chase at `s37_chase_remote` (`act` wiring).
3. **CLOSE** `s37_bandage` (`lamp('parapet')`): Luka at `s37_luka_sit`, Future Luka at `s37_l40_kneel` (`act bandage`).

**3.7_sorry**: one **locked** two-shot `s37_sorry_two` (Future Luka walks into frame to `s37_l40_edge` beside Chase
(2040) at `s37_c40_edge`); CLOSE `s37_c40_close` for the laugh; the hand on the shoulder (rig).

**3.7_staying**: Future Luka sits at `s37_l40_sit`; `s37_staying_two` (`lamp('parapet')`).

**3.7_storage**: MID `s37_check` — `remote_rig.screen('check')`; at "Drones are at… ^ 3%" `ring.level(0.35)` then back
to 1 on "Four hundred drones at 3% is enough." **JARVIS-CAM** `remote_screen` (the faces at `s37_st_*`; content lands
the STORAGE FULL pop-up with `popup({ style: 'safesense', … })` — YES keeps, NO clears, the question plain). CLOSE Chase
(2040) — "It lands" (framing; the gold sun behind him).

**3.7_fears**: `s37_fears_wide` (the four; the past selves at `s37_f_chase` / `s37_f_luka`; the older two at
`s37_f_l40` / `s37_f_c40` leaning on the parapet); TWO-SHOT · tight `s37_hands` (both hands on the Remote) — the
**Choice** pop-up over this frame, a single sustained chord, no timer.

**A1 "Keep"** — INSERT YES (UI). JARVIS-CAM `remote_screen` (Cloud+ activated pop-up). WIDE `s37_roof_wide_low`.
The goodbyes at `a1_*` marks as short two-shots (framing helper; keep lenses inside the ring disc, `on:[a, b]`, side
chosen so the city or the Yes sign is behind them). **The call**: MID Chase dials (`remote_rig.trill(true)`, the double
trill); **SPLIT** — left `{ set: 'hq_roof', shot: { shot: 'INSERT', at: 'a1_split_roof' } }`, right `reddy26`
`a1_split_store` (reddy26.md). On "Obviously yes.": LEFT HALF `ring.pulse(1)`, `whiteout.pour(2.0)`, `{env:'whiteout',
dur:2}`, Luka and Chase fade (actor fade); `{split: null, slide: true}`. **After** (`dress('a1_after')`, `{env:'afterglow',
dur:6}`, `lamp('sitters')`, `whiteout.reset()`): the two older men at `a1_sit_l40`/`a1_sit_c40` — WIDE `a1_parapet_wide`;
"Why Pudding?" two-shot; CLOSE `a1_hands_slate`; WIDE · locked `a1_behind`: over the last chorus they fade (actor
fades), `earbuds.visible = true`, hold 4 s. Fade to white.

**B1 "Again"** — as A1 up to the call: JARVIS-CAM (Clearing… / Error 4044 pop-ups); INSERT the slate (CARD); goodbyes
(`b1_luka_lanyard` for "Keep your lanyard."); the call exactly as A1 (split, white).

**C — credits vignette** (`dress('credits')`, env `credits_dusk`): `credits_ring_a → credits_ring_b` slow crane over the
empty roof; the ring glowing; the Remote rig on its box; no people, no earbuds.

---

## 10. Ambience and `update(dt, ctx)`

**Ambience** (default `ambience: { rain: false, loops: ['wind_high', 'drone_swarm', 'thunder_far'], room: 'none' }`;
`dress()` re-sends per state, guarded by `typeof AUDIO !== 'undefined'`).

| State | Loops | Notes |
| --- | --- | --- |
| `storm32` | `wind_high` (gusty, 0.1 Hz swell), `drone_swarm` (2 positional handles moved along the circling tower drones), `thunder_far` (one-shots every 10–20 s), `city_far_quiet` (a near-silent Valley 130 m below) | the lift's `lift_hum` while the doors are shut |
| `golden37` | `wind_soft`, `valley_music_far` (the Valley's music drifting up: bass-heavy, 600 Hz low-pass, panned wide), `drone_ring` (a low warm hum bed, 2 positional handles at the nearest ring drones), `drip` (sparse water drips, positional at the headhouse edge) | "quiet"; the pad under the Choice is music |
| `a1_after` | `valley_music_far` (slightly louder), `wind_soft`, `drone_ring` | the earbuds' tinny "two" is content (a positional sfx at `a1_earbuds`) |
| `credits` | none (the credits music) | |

**`update(dt, ctx)` — no allocation** (module-level scratch `Matrix4`, `Vector3`, `Quaternion`, `Color`).

1. Scene change → `dress(AUTO[state.scene] || R.state)`; env-name change → lamp/ambience.
2. `tower.userData.update(dt, ctx.t)` (countdown, circling drones), `skyline.userData.update(dt, ctx.t)`.
3. **Ring** (400): candle flicker — each frame recompute the light colour of 100 instances (round-robin; every instance
   every 4 frames) as `level × (0.86 + 0.14 · noise(i, t))` from a precomputed 64-entry noise table;
   `instanceColor.needsUpdate` once; `pulse` adds a travelling wave (angle-based); `flare` lerps every light to
   `#fff4c0`. Matrices never change.
4. **Steam** (18): rise 0.22 m/s with a slight lateral drift, fade in/out over life 4–7 s, respawn over the puddles;
   billboard by copying the camera quaternion into each matrix (scratch); `instanceColor` brightness = alpha.
5. **Wind** (`storm32` k 1.0, golden 0.2): garland flutter (vertex-free: child segments rotate ±0.25 rad at 2–3 Hz),
   ring-light wobble (±0.04 rad), the A-frame rocking; a single loose flyer quad skitters across the deck on a gust
   every 8–15 s (storm only).
6. **Hatch / lift doors**: ease to targets (smoothstep); colliders follow in place.
7. **Whiteout**: radius/opacity tween while pouring.
8. **Puddles**: ripple offset scroll (storm faster); `countdown_glow` breathes with the band's second.
9. **Remote rig**: `trill` flashes the brick phone's LCD at the trill's rhythm; screen repaints only on mode change.

---

## 11. Performance budget (target < 300; expected ≈ 70, ≈ 170 during the A1/B1 split with `reddy26`)

| Group | Draw calls |
| --- | --- |
| Static: `M.vc` 1, `M.deck` 1, `M.atlas` 1, `M.glow` 1 | 4 |
| Props: lift doors + car 3, hatch 2, sleigh 1 (one state visible), hat/beard 2, ring light 2, presents 1, photo set 1, Remote rig 3, cables 1, earbuds 1, whiteout 1, countdown glow 2, sun 1 | 21 |
| Instanced: ring 2, puddles 1, steam 1, vents 1, eyes 1 | 6 |
| `tower()` | ~6 |
| `skyline()` | ~16 |
| Rigs: up to 4 actors (≈ 3 each) | ~12 |
| Blob shadows | ~4 |

Rules: merge all static geometry; the 400 drones are **two** InstancedMeshes with static matrices (only light colours
update, a quarter per frame); no shadow maps; textures ≤ 256 px; no per-frame allocation. During the split the
`reddy26` half is the bigger cost — keep this set's steam off-screen-culled (bounding sphere around the deck).

---

## 12. API summary and data exports

### 12.1 `SETS.hq_roof`

```js
SETS.hq_roof = {
  env, build, marks, anchors, cams, zones, colliders, props, ambience, update,
  dress(state),        // 'storm32' | 'golden37' | 'a1_after' | 'credits'
  lamp(name),          // 'sleigh' | 'ring' | 'parapet' | 'sitters' | 'off'
  ring: { centre: [0, -19.0], radii: [4.0, 4.45, 4.9, 5.35, 5.8], counts: [65, 73, 80, 87, 95], gap: 1.4 },
};
```

**AUTO dress map**: `{ '3.2': 'storm32', '3.7': 'golden37', 'A1': 'golden37', 'B1': 'golden37', 'C': 'credits' }`;
content calls `dress('a1_after')` at A1 step 27.

### 12.2 Dress states

| State | Env | Sleigh | Hat / beard | Ring light | P1 | Ring | Remote rig | Tower | Glow | Steam / sun | Wind | Lamp |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `storm32` | `storm_roof` | intact | hidden until `drop()` | up, on | by the sleigh | hidden | hidden | countdown 00:17:00 running; 12 drones blue | blue | off / off | 1.0 | `sleigh` |
| `golden37` | `golden` | collapsed | hat on the sleigh, **beard in the puddle** | fallen, off | the table at (0, −19) | 400, flicker | visible, `off` | band Yes yellow (`zero(0)`); 0 drones | yellow 0.4 | on / on | 0.2 | `ring` |
| `a1_after` | `afterglow` | collapsed | as golden | fallen | table | 400 | visible, screen `off` | as golden | yellow | on / on (lowering) | 0.2 | `sitters` |
| `credits` | `credits_dusk` | collapsed | beard in the puddle | fallen | table | 400 | visible | as golden | yellow | faint / off | 0.1 | `ring` |

### 12.3 Engine / cross-set notes

1. Uses `SETS.valley.tower` and `SETS.valley.skyline` (valley.md §12.4–12.5). If `SETS.valley` is missing: a plain
   dark glass box for the tower's top 30 m with a static countdown canvas, a flat Yes-yellow sign, and a horizon band
   with a few boxes; never throw.
2. **Request to `valley`** (`tower()`): valley.md §12.4 puts the Yes letters at VG y 133…141 on z −36.0, inside the
   crown's plant box (z −41…−35, top VG 134.0), so its bottom metre would be hidden from the deck. Please lift the
   letters to VG 134.2…142.2 **or** move the lattice to z −34.8. This set's anchors work with either.
3. The maintenance hatch (VG (8.0, −12.9)) and the private-lift headhouse (shaft VG x 12.4…15.0, z −22.0…−19.4) are
   shared with `hq_top` and `hq_floors` — keep them identical if anything moves.
4. `world.torchAuto` is set `false` by `lamp()`, `true` by `lamp('off')`; please reset it in `showE()`.
5. The split's right half (`reddy26`) is posed once (world.md §11; fix the `camR.aspect` bug there). Nothing on the
   roof needs to move in the right half.
6. Actor fades (Luka and Chase into the white; the 2040 selves over the last chorus) are art/world features (material
   opacity on a rig), not set features.
