# SET `flat` — Chase (2040)'s flat above the fish-and-chip shop

File `src/13-set-flat.js` · `SETS.flat` · Scenes **1.8** (19:40) and **2.1** (Sun 23 Dec 2040, 4:52 am → ~6:00).
Same contract as Rue's `SETS.reddy`: `{ env, build, marks, anchors, cams, zones, colliders, props, ambience, update }`
plus `dress(state)` (§12). Its exterior (the lit kitchen window seen from the street, 1.8 step 27) belongs to
`SETS.parade` (see `docs/sets/parade.md` §2.5 — the numbers below match it).

---

## 0. Decisions

1. **One small interior**, 8.0 × 6.4 m, ceiling 2.6 m: open living + kitchen at the front (bay side), bedroom, stair
   landing and bathroom at the back, and a 3.6 × 1.5 m balcony. Everything walkable is at y = 0 (no `floor()`).
2. **The flat's local frame = parade − (32, 3.6, −7)**, same axes. So the balcony, kitchen window, table and light string
   line up with what `parade` shows from the street, and the view out of the windows is the real Parade layout (road,
   promenade palms, the jetty off to the right, the bay, the Ted Smout Bridge far off to the right).
3. **The camera far plane is 600 m**: the exterior backdrop (band, bridge, water edge) sits inside 460 m.
4. **No Yes yellow.** Sticky notes are pastels; the "yellow" ones are pale lemon `#f4ec9a`.
5. `dress()` states: `evening18`, `dawn21`, `morning21` (auto by scene id; content switches to `morning21` at 2.1_plan).

---

## 1. Purpose and scenes

| Scene | Story time | Env | Dress | What happens |
| --- | --- | --- | --- | --- |
| 1.8 "Order of Service" | Sat 22 Dec 2040, 19:40 | `evening` | `evening18` | Short arrival (Chase (2040): chips, "Don't touch anything."); PLAY "Look around" (Luka ⇄ Chase): sticky wall, keyboard under the sheet, notebooks, balcony view, the fridge → 1.8_order (the order of service; no music; the stare; "Chips are getting cold."). Step 27 cuts to `parade` |
| 2.1 "Senior Casual" | Sun 23 Dec 2040, 4:52 am | `dawn` | `dawn21` | Dawn WIDE through the balcony door (Luka polishing the rail), Chase wakes on the couch; PLAY (Chase): slate, photo, kettle → 2.1_dont (bedroom doorway, burned hand) → 2.1_balcony (two teas, locked two-shot) |
| 2.1 (cont.) | ~5:40 | `morning` | `morning21` | 2.1_plan (toast, three sticky notes on the table) → PLAY (Luka): the box of decorations under the bed → Santa hat and beard; MID as he turns round |

Time cards: 1.8 `19:40` · place `Chase's flat, Redcliffe`; 2.1 `Sunday 23 December 2040, 4:52 am` · same place.
Both scenes keep `parade` live (liveMax 2): 1.8 step 27 shows the parade exterior with no build.

---

## 2. Layout

### 2.1 Axes

- Metres, Y up. **Origin = the inside face of the front wall at floor level, at the building's centre line**
  (= parade (32, 3.6, −7)).
- **+Z = out to the bay** (through the balcony door and kitchen window). The interior is z −6.4…0; the balcony z 0…1.5.
- **+X = the kitchen side** (toward parade's chip shop door end). From inside looking out (+Z), screen-right is −X:
  the balcony is on the right, the kitchen on the left; the bridge is far off to the right.
- Mark `ry`: facing `(sin ry, cos ry)` → 0 = +Z (the bay), PI = −Z, H = +X, −H = −X.

### 2.2 Plan

```
 z
+1.5  ┌──── railing (lights) ────┐                                   (outside: the Parade 3.6 m below,
      │  BALCONY x −4…−0.4        │                                    road z 4…12, promenade palms z 14.4,
 0.0 ─┴──[sliding door −3.4…−1.0]─┴─plant─┬──[ KITCHEN WINDOW 1.4…3.4 ]──┐  the jetty far right, the bay, the bridge)
      │                                    │      TABLE (2.3,−0.95)    │ bench/sink  x 3.4…4.0
      │ desk+slate │                       │   W chair    E chair      │ (z −2.7…−0.2)
      │ z −1.5…−0.4│      LIVING           │       S stool             │ kettle (3.72,−2.1)
      │ STICKY     │   couch x −2.8…−0.95  │      KITCHEN              │
      │ NOTE WALL  │   z −2.9…−2.2 (faces +Z)                          │ FRIDGE x 3.3…4.0, z −3.5…−2.8 (faces −X)
      │ keyboard   │                                                   │
−3.6 ─┴─ z −3.45…−2.15 ──[bedroom door −1.4…−0.5]─ bookshelf −0.35…0.85 ─[entry door 1.2…2.1]──┴──────
      │ BEDROOM x −4…0.9                    wardrobe │ LANDING x 0.9…2.4 │ BATHROOM x 2.4…4.0 (closed)
      │ bed x −3.7…−2.2, z −6.4…−4.4                 │  stair down ↓      │
−6.4  └──────────────────────────────────────────────┴───────────────────┴───────────
      x: −4                       −1.4  −0.5  0  0.4(zone split) 1.2 2.1 2.4        4
```

| Thing | Where (local) | Notes |
| --- | --- | --- |
| Front wall | z 0 (0.15 thick outward) | balcony door + kitchen window |
| **Balcony sliding door** | x −3.4…−1.0, h 2.1; two glass panels | `balcony_door.open(u)`: 0 closed · 0.5 half (opening x −3.4…−2.2) · 1 fully stacked (opening x −3.4…−1.4) |
| **Kitchen window** | x 1.4…3.4, sill y 0.95, head 2.1 | louvre glass; the light string runs along the eave outside it (y 2.45) |
| Balcony | x −4…−0.4, z 0…1.5; railing z 1.5 (balusters + timber top rail, top y 1.05); side rails at x −4 and x −0.4; awning above y 2.5 | walkable x −3.4…−1.0, z 0.1…1.3; a stacked plastic chair in the east corner |
| Partition (back) wall | z −3.6 (−3.65…−3.55) | bedroom door x −1.4…−0.5 (hinge at x −1.4, swings into the bedroom); entry door x 1.2…2.1 (hinge at x 2.1, swings onto the landing) |
| **Sticky note wall** | on the x −4 wall face (x −3.99), z −3.4…−0.3, y 0.95…2.45, faces +X | hundreds of notes (texture §3.3) |
| Keyboard stand + keyboard under a grey sheet | x −4.0…−3.55, z −3.45…−2.15, keys y 0.82 | `keyboard_sheet` |
| Desk (no chair: he works standing) | x −4.0…−3.35, z −1.5…−0.4, top 0.76 | the **music slate** lies on it at (−3.72, 0.77, −0.95); a desk lamp |
| Couch (faded teal) | x −2.8…−0.95, z −2.9…−2.2, seat 0.42, back 0.85, faces +Z | 0.65 m passage behind it to the bedroom door; blanket |
| Bookshelf | x −0.35…0.85, z −3.55…−3.25, h 1.8, 4 shelves | shelf 3 (y 1.15): 31 identical black notebooks "two 1 … two 31"; shelf 4 (y 1.6): the framed 2031 photo |
| Dying plant | pot at (−0.75, 0, −0.35) | droopy, brown tips |
| Kitchen bench | x 3.4…4.0, z −2.7…−0.2, top 0.92; overhead cupboards y 1.5…2.2 | sink at z −1.0; **kettle (normal, no screen)** at (3.72, 0.93, −2.1); toaster at z −2.45; parcel spot (3.7, 0.93, −1.5) |
| **Fridge** | x 3.3…4.0, z −3.5…−2.8, h 1.8, door faces −X (x 3.29) | magnets: takeaway menu, bin-day magnet, **pelican magnet at (3.29, 1.42, −3.12) holding the folded card** |
| Table | 0.8 × 0.8, h 0.75, centre (2.3, 0, −0.95); pendant lamp above at (2.3, 2.1, −0.95) | chairs: **W** (1.65, −0.95) facing +X · **E** (2.95, −0.95) facing −X · **S stool** (2.3, −1.6) facing +Z |
| Bedroom | x −4…0.9, z −6.4…−3.6 | bed (queen) x −3.7…−2.2, z −6.4…−4.4, mattress 0.55; bedside table (−1.95, −6.15); wardrobe x −0.4…0.85, z −6.4…−5.8; small dark back window x −3.2…−2.0 |
| **Box of Christmas decorations** | under the bed's +X side: home (−2.6, 0, −5.4); pulled out (−1.7, 0, −5.4) | `deco_box` |
| Landing + stair top | x 0.9…2.4, z −6.4…−3.6; stair descends −Z from z −4.8 | dim bulb; seen only through the open entry door |
| Bathroom | x 2.4…4.0 behind the partition | door closed, never entered |

### 2.3 Exterior (seen through the door, window and from the balcony)

All in flat-local coordinates (parade − (32, 3.6, −7)). Built simply, merged by material.

| Thing | Where | Notes |
| --- | --- | --- |
| Neighbouring facades | first floors at x < −4 and x > 4, parapet y 2.6…4.0 | frame the balcony view |
| Footpath / road / promenade / park / beach | y −3.6: footpath z 0…4, road z 4…12 (lane lines, zebra at x −10…−6), promenade z 12…15, grass z 15…25, sand z 25…31 sloping to the water at z 36 | painted, one mesh |
| Water | plane y −5.1, 900 × 900, centred (0, −5.1, 420) | fogged, ripple scroll |
| Palms (promenade) | x −36, −28, −20, −12, −4, 4 at z 14.4 (crowns ≈ y +1.5) | instanced, light sleeves blink |
| Street lamps | x −32, −24, −16, −8, 0, 8 at z 12.6 | lit at night/dawn |
| The jetty | deck x −45.75…−42.25, z 25…61, T-head x −52…−36, z 61…67, y −3.6; 6 lamps | far right from the balcony |
| Hover-cars (3) | +X lane z 6, −X lane z 10, y −3.28 | glide, headlights at night |
| **Bridge** | **A (−49, −5.1, 387) → B (−247, −5.1, 382)**; deck 5 m above water rising to 9 m at 55 %; piers every 18 m; 17 lamps; 12 drone lights | fog:false; "far off to the right" (7°–33° right of +Z) |
| Horizon band + skirt | r 450 around (0,0,0); skirt colour = live fog colour | islands left, mainland shore right |
| Dawn storm bank | 6 low dark cloud cards on the horizon, bearing −10°…+40°, z ≈ 420, y 10…45 | visible only in `dawn21`/`morning21` ("storm clouds sit far out on the horizon") |
| Sun | disc r 8 + halo at 420 m | `morning21` only, low over the bay |

---

## 3. Look

### 3.1 Palette

| Use | Hex |
| --- | --- |
| Walls / ceiling | cream `#e8e0cf` / `#f0ebe0` |
| Floor | timber boards `#9a7656` |
| Couch / blanket | faded teal `#4f7c7a` / oatmeal `#cbbfa6` |
| Kitchen laminate / splashback | `#d9d2c0` / pale blue tiles `#b8d8ee` |
| Fridge | `#e9ecee` |
| Desk / bookshelf | `#6b5a48` / `#5a4a3a` |
| Notebooks | black `#1d1f24`, white label strips |
| Sticky notes | pink `#f7a8c0`, mint `#a8e8c8`, blue `#a8d0f0`, peach `#f8c8a0`, pale lemon `#f4ec9a` |
| Dust sheet | `#c8c8c2` |
| Bed linen | `#8aa0b8` |
| Balcony rail / tiles | `#d0d4d8` / terracotta `#b86e4e` |
| Christmas lights | red `#d8323a`, green `#2f9a4a`, blue `#3a7ae0`, warm white `#fff1d0` |
| Slate glass / screen | `#0e1626` / glassy `#bfe6ff` |

### 3.2 Materials

- `M.vc` — one Lambert vertex-coloured mesh for all untextured interior statics (walls, furniture, kitchen, bed).
- `M.atlas` — Lambert, one 256 × 256 atlas (sticky wall tiles, fridge door, notebooks, slate screens, keys, photo,
  deco box contents, folded card).
- `M.glass` — Basic, transparent 0.25 (door, window).
- `M.glow` — Basic for bulbs, pendant shade, screens; colour driven by state.
- Exterior: `M.ext` vertex-coloured (street, facades, jetty), `M.water`, and `fog: false` Basic for band/bridge/sky.

### 3.3 Textures (128–256 px, nearest)

| Texture | Size | Content (readable text in **bold**) | Read at |
| --- | --- | --- | --- |
| `t_sticky_hero` | 256 × 256 | a centre band of five large notes, each ≈ 48 px, bold 10–11 px marker text: **two — bridge??** · **two — 2nd verse too long** · **two — make it better** · **two — NOT YET** · **two — for L.**; around them ~30 small notes with scribbled "two —" lines (illegible) | `s18_sticky` (the CARD `sticky_wall` overlays at 2×; the in-world layout must match it) |
| `t_sticky_fill` | 128 × 128 | dense tiny notes, pastel, scribbles; tiles around the hero band to fill the wall | wides |
| `t_fridge` | 128 × 256 | white door, chrome handle, magnets: a pelican (white, orange bill), a printed takeaway menu **SEA BREEZE FISH & CHIPS**, a bin-day magnet, the corner of a cream folded card under the pelican | `fridge_card` |
| `t_card_folded` | 64 × 32 | cream card, faint grey script (the CARD `order_of_service` carries the readable text) | `fridge_card` |
| `t_notebooks` | 256 × 64 | 31 identical black spines with white label strips "two 1" … "two 31" (suggestive at this size; the CARD `notebooks` is the readable INSERT) | `s18_notebooks` |
| `t_slate` | 4 cells of 128 × 96 | `off` dark glass + reflection · `folder` one folder **two** with **2,847 items** · `list` tiny filename rows (two_v1.wav, two_v2_FINAL.wav …) · `play` waveform + ▶ | `s21_slate` (the CARD `slate_list` does the scrolling INSERT) |
| `t_keys` | 128 × 32 | keyboard keys; a **thin grey line of dust** where a hand used to rest (only visible when the sheet is lifted) | `s18_keys` |
| `t_sheet` | 64 × 64 | grey dust-sheet folds | |
| `t_photo2031` | 64 × 48 | framed photo: two men behind a festival barrier, one with an ARTIST lanyard (the CARD `photo_2031` is the INSERT) | `s21_photo` |
| `t_deco` | 128 × 64 | top-down box: tinsel, a broken angel, sunglasses, a Santa hat with a fake white beard on elastic | `s21_box` |
| `t_floor`, `t_tiles`, `t_curtain` | 64 × 64 | boards, splashback/balcony tiles, sheer curtain | |
| `t_band_f`, `t_storm_bank`, `t_cloud` | 256 × 64 / 128 × 64 / 128 × 64 | horizon silhouettes; low dark storm bank with pink-lit tops; cumulus | outside |

### 3.4 Lighting rig and fog

Every preset defines `spot` (see parade §12 engine note).

```js
env: {
  evening: { bg: 0x22305c, fog: [0x2c3a66, 0.0050], hemi: [0xffe2c0, 0x2a2420, 0.75], dir: [0x8aa0d8, 0.35, [2, 6, 10]],  spot: [0xffd2a0, 3.0], rain: 0 },
  dawn:    { bg: 0xd2a6ae, fog: [0xc8a8b0, 0.0050], hemi: [0xc8c0d0, 0x403840, 0.60], dir: [0xffb8a0, 0.55, [-2, 3, 10]], spot: [0xffb0a0, 1.4], rain: 0 },
  morning: { bg: 0xf0c8a0, fog: [0xf0d0b0, 0.0048], hemi: [0xfff0e0, 0x5a4a40, 0.95], dir: [0xffd8b0, 0.90, [-1, 4, 10]], spot: [0xffe0c0, 0],   rain: 0 },
}
```

| Preset | Spot (position → target, angle / penumbra / distance) | Interior emissives | Outside |
| --- | --- | --- | --- |
| `evening` | the **pendant over the table**: (2.3, 2.05, −0.95) → (2.3, 0, −0.95), 0.9 / 0.6 / 5 | pendant shade glow, desk lamp glow, Christmas lights | blue twilight, street lamps + palm lights + jetty lamps on, bridge lamps + blinking drone lights, 2 hover-cars with lights |
| `dawn` | a pink dawn shaft through the balcony door: (−2.2, 2.3, 2.6) → (−1.4, 0, −2.4), 0.35 / 0.8 / 8 | Christmas lights still blinking; slate standby glow | pink-grey sky, storm bank far out, lamps still on (level 0.6), 1 hover-car |
| `morning` | off | Christmas lights only | warm low sun over the bay, lamps off |

Fog (FogExp2 0.005) only matters outside; the band skirt copies `world.scene.fog.color` each frame.

---

## 4. Props

| id | Description | Scenes | States / animation (`userData`) |
| --- | --- | --- | --- |
| `fridge_card` | the folded order of service under the pelican magnet | 1.8, 2.1 | `state('under')` slightly crooked (rot z 0.035) · `state('out')` hidden (in Luka's hands; content uses `hold`) · `state('back')` under the magnet, **perfectly straight** (rot z 0) — the millimetre |
| `pelican_magnet` | | 1.8 | static |
| `sticky_wall` | the wall of notes (hero band + fill) | 1.8 | static |
| `keyboard_sheet` | grey sheet over the keyboard | 1.8 | `lift(bool)`: covered ↔ folded back over the far end (0.4 s), revealing `t_keys` |
| `slate_desk` | the music slate on the desk | 2.1 | `screen('off'|'folder'|'list'|'play')`; standby glow pulse; content may `hold` it in Chase's hand for 2.1_dont and put it back |
| `notebooks`, `photo_2031` | on the bookshelf | 1.8, 2.1 | static |
| `kettle` | ordinary electric kettle (no screen) | 1.8, 2.1 | `steam()` puff (save) |
| `balcony_door` | two-panel slider | all | `open(u)` 0 / 0.5 / 1, eases 0.6 s; collider gap follows |
| `curtain` | sheer curtain gathered at the door's east side | all | sways when the door is open (more at dawn breeze) |
| `bedroom_door` | | all | `open(a)`: 0 closed · 0.45 ajar · 1.4 open, eases 0.5 s |
| `entry_door` | | 1.8 | `open(bool)` (C40 leaves and returns) |
| `deco_box` | cardboard box of decorations | 2.1 | `state('under'|'out'|'open')`: slides out 0.9 m in 0.5 s; flaps open |
| `santa_kit` | hat + beard inside the box | 2.1 | visible until Luka puts them on (the worn ones are a LOOKS attachment) |
| `chips_parcel` | paper parcel of fish and chips | 1.8 | hidden → carried by C40 (`hold`) → on the bench at (3.7, 0.93, −1.5) |
| `teas` | two mugs | 2.1 | on the bench (dawn) → in Chase's hands (`hold`) → on the balcony rail at (−2.3, 1.06, 1.45) |
| `tea_towel` | Luka's hand prop at dawn | 2.1 | `hold` by Luka |
| `toast` | two plates of toast + three mugs | 2.1 | visible in `morning21` |
| `plan_notes` | three sticky notes on the table | 2.1 | `show(n)` 0…3 (one per step as Chase (2040) lays them out) |
| `xmas_lights` | 3 InstancedMeshes (phases) of bulbs along the balcony rail, side posts and the eave over the kitchen window | all | 3-phase chase blink 0.9 Hz |
| `pendant` | kitchen pendant lamp | 1.8 | `on(bool)` (shade glow + the spot) |
| `couch_blanket` | | all | `state('folded'|'spread')` |
| `plant_dying` | | all | static |
| `snore_z` | small floating "z" sprite rising from the bedroom doorway | 2.1 | visible while C40 sleeps; rises and fades every 2.4 s |
| `street_f`, `traffic_f`, `palms_f`, `lamps_f`, `jetty_f`, `water_f`, `band_f`, `skirt_f`, `bridge_f`, `bridge_lights_f`, `clouds_f`, `storm_bank_f`, `sun_f` | exterior | all | see §10 |

**Instanced repeats**: Christmas bulbs 3 × 22; palms 6 (trunk + crown) + light sleeves 6; street lamps 6 (post + head);
jetty piles 30 + rail posts 40 + lamps 6; hover-cars 3; bridge piers 12 + lamps 17; notebooks are a texture, not
geometry.

---

## 5. Marks (`[x, y, z, ry]`, local)

Seated/lying marks keep y = 0; the animation supplies seat height (chair 0.45, couch 0.42, bed 0.55). Seated marks sit
inside furniture colliders by design: content `place`s actors there (no pathing).

**1.8**

| id | value | use |
| --- | --- | --- |
| `s18_landing_c40`, `s18_landing_luka`, `s18_landing_chase` | [1.65, 0, −4.3, 0], [1.4, 0, −5.0, 0], [1.9, 0, −5.5, 0] | spawn on the landing; they walk in |
| `s18_arr_c40` | [2.8, 0, −2.0, −2.2] | C40 turns back to them: "I'll get chips. ^ Don't touch anything." |
| `s18_arr_luka`, `s18_arr_chase` | [1.2, 0, −2.6, 0.9], [1.9, 0, −3.1, 0.6] | just inside |
| `s18_out_c40` | [1.65, 0, −4.6, PI] | he goes downstairs (despawn here) |
| `s18_sticky_chase` | [−3.2, 0, −1.8, −H] | at the sticky wall (also where Chase is when 1.8_order starts) |
| `s18_keys` | [−3.15, 0, −2.8, −H] | at the keyboard |
| `s18_shelf` | [0.25, 0, −2.75, PI] | at the bookshelf |
| `s18_balcony` | [−2.6, 0, 1.0, 0] | at the railing ("That's the bridge.") |
| `s18_fridge_luka` | [3.0, 0, −3.15, H] | Luka at the fridge (1.8_order steps 1–2, 23, 25) |
| `s18_read_chase` | [2.55, 0, −2.6, 2.18] | Chase reading over Luka's right shoulder (step 5) |
| `s18_door_c40` | [1.65, 0, −3.9, 0] | in the doorway with the parcel (step 7) |
| `s18_in_c40` | [1.6, 0, −3.05, 1.68] | one step in; the stare (step 8) |
| `s18_bench_c40` | [3.1, 0, −2.0, H] | puts the parcel down on the bench (by step 20) |

**2.1**

| id | value | use |
| --- | --- | --- |
| `s21_couch_chase` | [−1.9, 0, −2.55, −H] | asleep, lying along the couch, head at the east end (x ≈ −1.1) |
| `s21_bal_polish` | [−2.7, 0, 1.15, 0] | Luka at the railing polishing with the tea towel (dawn WIDE) |
| `s21_bed_c40` | [−2.95, 0, −5.4, PI] | C40 asleep on the bed (door ajar) |
| `s21_slate_chase` | [−3.05, 0, −0.95, −H] | Chase standing at the desk / slate |
| `s21_photo_chase` | [0.25, 0, −2.75, PI] | at the shelf photo |
| `s21_kettle` | [3.05, 0, −2.1, H] | at the kettle |
| `s21_door_c40` | [−0.95, 0, −3.75, −0.65] | C40 in the bedroom doorway, facing Chase at the desk; for step 10 he turns to ry −0.34 (through the glass at Luka) |
| `s21_bal_luka` | [−3.0, 0, 1.1, 0.7] | 2.1_balcony: Luka three-quarter to the rail, polishing |
| `s21_bal_chase` | [−1.55, 0, 1.0, −1.25] | Chase with two teas |
| `s21_plan_luka`, `s21_plan_c40`, `s21_plan_chase` | [1.65, 0, −0.95, H], [2.95, 0, −0.95, −H], [2.3, 0, −1.6, 0] | 2.1_plan: W chair, E chair, S stool |
| `s21_box_luka` | [−1.05, 0, −5.4, −H] | Luka kneels at the box (pulled out to (−1.7, 0, −5.4)) |
| `s21_turn_luka` | [−1.05, 0, −5.4, 0.34] | he turns round (MID) |
| `s21_watch_chase` | [−0.6, 0, −3.95, −2.80] | Chase just inside the bedroom door |
| `s21_watch_c40` | [−0.95, 0, −3.3, −3.10] | C40 in the living room looking in |

**General**: `kettle` [3.05, 0, −2.1, H] (save) · `centre` [0.0, 0, −1.8, 0].

---

## 6. Anchors (`{ at, from, fov }`, local)

| id | at | from | fov | for |
| --- | --- | --- | --- | --- |
| `s18_pan_a` | [−3.9, 1.4, −2.0] | [−0.8, 1.6, −0.8] | 48 | arrival PAN start: sticky notes everywhere, the keyboard under the sheet |
| `s18_pan_b` | [2.8, 1.1, −1.8] | [−0.8, 1.6, −0.8] | 48 | PAN end: kitchen, the kettle, the table, the window with blinking lights (couch and plant pass through frame) |
| `s18_sticky` | [−3.99, 1.7, −1.8] | [−3.0, 1.65, −1.8] | 44 | sticky wall (CARD `sticky_wall`) |
| `s18_keys` | [−3.78, 0.84, −2.8] | [−3.2, 1.45, −2.6] | 34 | the keys and the grey line (sheet lifted) |
| `s18_notebooks` | [0.25, 1.15, −3.3] | [0.25, 1.3, −2.6] | 32 | two 1 … two 31 (CARD `notebooks`) |
| `s18_balcony_view` | [−130, 2.0, 385] | [−2.6, 1.62, 1.0] | 40 | the bay at dusk, the bridge lit far off to the right, drone lights blinking |
| `fridge_card` | [3.29, 1.42, −3.12] | [2.75, 1.52, −2.95] | 28 | 1.8_order steps 1 and 25 INSERT (CARD `order_of_service` for step 1) |
| `s18_luka_close` | [3.0, 1.62, −3.15] | [3.15, 1.62, −2.25] | 34 | step 2 CLOSE · Luka, locked |
| `s18_room_wide` | [0.6, 1.1, −2.7] | [−1.7, 1.75, 0.9] | 56 | step 3 WIDE from the balcony threshold: Chase at the sticky wall (left), Luka at the fridge (right) |
| `s18_doorway_wide` | [2.0, 1.2, −3.3] | [−1.0, 1.65, −0.6] | 50 | step 7 WIDE · the doorway (entry door open, landing behind C40) |
| `s18_kitchen_locked` | [2.6, 1.1, −1.8] | [−1.6, 1.8, −1.2] | 56 | step 20 WIDE · locked: the three in the kitchen, the parcel on the bench, the lights blinking through the window |
| `s21_dawn_wide` | [−2.6, 1.1, 1.3] | [−1.9, 1.5, −3.3] | 50 | 2.1 step 1: from behind the couch (Chase asleep in the foreground), through the glass, Luka polishing, the pink-grey bay, storm bank far out |
| `s21_couch_close` | [−1.4, 0.65, −2.55] | [−0.6, 1.0, −1.5] | 38 | step 2 CLOSE · Chase on the couch |
| `s21_slate` | [−3.72, 0.78, −0.95] | [−3.3, 1.35, −0.95] | 34 | slate INSERT (CARD `slate_list` scrolls) |
| `s21_photo` | [0.0, 1.65, −3.32] | [0.0, 1.62, −2.75] | 30 | photo INSERT (CARD `photo_2031`) |
| `s21_kettle` | [3.72, 1.05, −2.1] | [3.0, 1.4, −2.0] | 34 | "Normal kettle. ^ Weird." |
| `s21_doorway_mid` | [−0.95, 1.4, −3.75] | [−1.9, 1.5, −1.4] | 40 | 2.1_dont step 1 MID · the bedroom doorway |
| `s21_hand_frame` | [−1.42, 1.35, −3.62] | [−1.0, 1.42, −2.95] | 26 | step 13 INSERT: C40's burned right hand on the doorframe (jamb at x −1.4) |
| `s21_balcony_two` | [−2.3, 1.45, 1.05] | [−2.3, 1.5, −1.9] | 46 | 2.1_balcony: the locked two-shot through the fully open door (the door frame frames them; bay behind, rail between them and the drop) |
| `s21_plan_wide` | [2.3, 1.0, −1.1] | [0.0, 1.75, −3.0] | 48 | 2.1_plan WIDE |
| `s21_plan_notes` | [2.3, 0.76, −0.95] | [2.3, 1.85, −0.75] | 40 | top-down on the three notes |
| `s21_box` | [−1.7, 0.25, −5.4] | [−0.8, 1.25, −4.6] | 40 | the box opened |
| `s21_santa_mid` | [−1.05, 1.5, −5.4] | [0.35, 1.6, −4.3] | 40 | MID · Luka turns round (beard over his beard) |

---

## 7. Zones and fixed cameras

Small rooms: high corner cameras looking across each room from the other room, RE style.

```js
cams: {
  living:  { type: 'pan', pos: [3.75, 2.35, -0.3],  base: [-2.4, 0.9, -2.0], look: 'player', fov: 58, limit: 0.45 },  // from the kitchen corner
  kitchen: { type: 'pan', pos: [-0.6, 2.35, -0.3],  base: [2.8, 0.9, -2.4],  look: 'player', fov: 58, limit: 0.45 },  // from the living corner
  balcony: { type: 'pan', pos: [-1.6, 1.85, -2.6],  base: [-2.4, 1.0, 1.0],  look: 'player', fov: 52, limit: 0.35 },  // from inside, out through the door
  bedroom: { type: 'pan', pos: [0.6, 2.35, -3.85],  base: [-2.4, 0.4, -5.4], look: 'player', fov: 62, limit: 0.40 },
},
zones: [
  { box: [-3.4, 0.0, -1.0, 1.5],  cam: 'balcony' },
  { box: [-4.0, -3.6, 0.4, 0.0],  cam: 'living' },
  { box: [0.4, -3.6, 4.0, 0.0],   cam: 'kitchen' },
  { box: [-4.0, -6.4, 0.9, -3.6], cam: 'bedroom' },
  { box: [0.9, -4.6, 2.4, -3.6],  cam: 'kitchen' },   // entry threshold / landing top (not roamable, actors only)
],
```

`living` sees the sticky wall (4.7° off-axis), couch, bedroom door, bookshelf and the balcony door; `kitchen` sees the
fridge (dead centre), entry door, table and window. No drones in this set.

### Colliders (`[x0, z0, x1, z1]`)

```
outer walls     [-4.2,-6.6, 4.2,-6.4] [-4.2,-6.6,-4.0, 0] [4.0,-6.6, 4.2, 0]
front wall      [-4.2, 0, -3.4, 0.15] [-1.0, 0, 1.4, 0.15] [3.4, 0, 4.2, 0.15]
                door panels (written in place by update): open 0 → [-3.4, 0,-1.0, 0.15]; 0.5 → [-2.2, 0,-1.0, 0.15]; 1 → [-1.4, 0,-1.0, 0.15]
                window [1.4, 0, 3.4, 0.15]
partition       [-4.0,-3.65,-1.4,-3.55] [-0.5,-3.65, 1.2,-3.55] [2.1,-3.65, 4.0,-3.55]
landing/bath    [2.4,-6.4, 2.5,-3.6] [0.9,-6.4, 2.4,-4.8] (stair void)
balcony         rail [-4.0, 1.5,-0.4, 1.6]  ends [-4.0, 0,-3.4, 1.5] [-1.0, 0,-0.4, 1.5]
furniture       keyboard [-4.0,-3.45,-3.55,-2.15] · desk [-4.0,-1.5,-3.35,-0.4] · couch [-2.8,-2.9,-0.95,-2.2]
                bookshelf [-0.35,-3.55, 0.85,-3.25] · plant [-0.95,-0.55,-0.55,-0.15]
                bench [3.4,-2.7, 4.0,-0.2] · fridge [3.3,-3.5, 4.0,-2.8] · table+chairs [1.4,-1.85, 3.2,-0.6]
                bed [-3.7,-6.4,-2.2,-4.4] · bedside [-2.15,-6.4,-1.75,-5.95] · wardrobe [-0.4,-6.4, 0.85,-5.8]
                deco box (when out) [-2.05,-5.65,-1.35,-5.15]
```

---

## 8. Hotspots

| id | at | r | verb | who | scene | does |
| --- | --- | --- | --- | --- | --- | --- |
| `h18_sticky` | `s18_sticky_chase` / `s18_sticky` | 0.9 | Examine | Chase | 1.8 | CARD `sticky_wall`; "…It's all one song." |
| `h18_keys` | `s18_keys` / `s18_keys` | 0.8 | Examine | any | 1.8 | "Hasn't been played in years."; if Chase: `keyboard_sheet.lift(true)` + the grey line |
| `h18_shelf` | `s18_shelf` / `s18_notebooks` | 0.9 | Examine | any | 1.8 | CARD `notebooks` (two 1 … two 31) |
| `h18_balcony` | `s18_balcony` / `s18_balcony_view` | 1.0 | Examine | any | 1.8 | "That's the bridge." |
| `h18_fridge` | `s18_fridge_luka` / `fridge_card` | 0.9 | Examine | **Luka** | 1.8 | → cutscene 1.8_order |
| `h_kettle` | `kettle` / `s21_kettle` | 0.9 | Kettle | any | 1.8, 2.1 | "Put the kettle on? [YES] [NO]" (2.1, Chase: "Normal kettle. ^ Weird.") |
| `h21_slate` | `s21_slate_chase` / `s21_slate` | 0.9 | Examine → Play | Chase | 2.1 | the 2,847 items INSERT + lines; reaching for play → cutscene 2.1_dont |
| `h21_photo` | `s21_photo_chase` / `s21_photo` | 0.9 | Examine | Chase | 2.1 | "Redcliffe Festival. 2031." |
| `h21_box` | `s21_box_luka` / `s21_box` | 1.0 | Search | **Luka** | 2.1 | `deco_box.state('out')` → `('open')` → hat + beard → MID turn |

---

## 9. Cutscene needs

- **1.8 arrival**: entry door opens from the landing (landing stub + stair top + dim bulb must exist); PAN `s18_pan_a`
  → `s18_pan_b` shows sticky notes, keyboard under the sheet, the plant, the kettle, the couch, the balcony lights.
  C40 exits by the entry door (`entry_door.open`).
- **1.8_order**: `fridge_card` INSERT (card out), `s18_luka_close` locked (fridge hum only, no music), `s18_room_wide`
  (needs line of sight from the balcony threshold to both the sticky wall and the fridge), CLOSE Chase (framing
  helper), `s18_doorway_wide` (entry door open, C40 with `chips_parcel` in hand), stare 3 s,
  `s18_kitchen_locked` (parcel on the bench, the eave lights blinking through the kitchen window), `fridge_card` again
  for the fold-and-straighten (`state('back')`). Then content cuts to `parade` anchor `s18_ext_window`.
- **2.1 dawn**: `s21_dawn_wide` (balcony door **closed** — he sees Luka "through the glass"; storm bank on the
  horizon; pink-grey bay), `s21_couch_close`.
- **2.1_dont**: `s21_doorway_mid`; CLOSE C40 looking past Chase through the glass at Luka (sight line from the doorway
  over the couch back to the balcony must be clear: couch back 0.85 < eye 1.6); `s21_hand_frame` (the jamb at x −1.4 is
  a real trimmed frame).
- **2.1_balcony**: `balcony_door.open(1)` first; `s21_balcony_two` locked; teas, tea towel; the rail between them and
  the drop; the bay and Parade behind.
- **2.1_plan**: `dress('morning21')`; `s21_plan_wide`, `s21_plan_notes` with `plan_notes.show(1..3)`.
- **Disguise**: `s21_box`, `s21_santa_mid` (bedroom door open; Chase and C40 at `s21_watch_*`).

---

## 10. Ambience and `update(dt, ctx)`

| State | Loops | Room |
| --- | --- | --- |
| `evening18` | `fridge` (hum), `parade_far` (muffled surf + glassy hover traffic through the open door) | `room` |
| `dawn21` | `birds_dawn`, `bay_far`, `snore` (soft; content stops it at 2.1_dont) | `room` |
| `morning21` | `birds_dawn`, `bay_far`, `fridge` | `room` |

`update` (no allocation; scratch objects preallocated; `for` loops only):

1. Scene change → `dress(AUTO[state.scene])` (`'1.8' → evening18`, `'2.1' → dawn21`).
2. Spot lamp per state → `world.torch` position/target + `world.torchAuto = false` while the lamp is on.
3. Christmas lights: 3 phases cycling at 0.9 Hz (swap the three materials' colours/brightness).
4. Doors (balcony slide, bedroom/entry hinge), deco box slide, keyboard sheet fold: ease toward targets.
5. Curtain sway when the balcony door is open (rotation of 3 vertical strips, ±0.06 rad).
6. Outside: 3 hover-cars glide along their lanes and wrap (x −60…+60); water ripple scroll; foam; clouds drift; bridge
   drone lights blink (night/dawn); palm light sleeves blink; storm bank creeps right 0.05 m/s.
7. Slate standby glow pulse; pendant on/off; `snore_z` rise/fade loop.
8. Band skirt colour = `world.scene.fog.color`.

---

## 11. Performance budget (target < 300; expected ≈ 60)

Interior: `M.vc` 1, atlas 1, glass 1, glow 1, light IMs 3, ~18 small named props → ~25. Exterior: street/facades 1,
water 1, band 2, bridge 2 + lights 2, palms 2 + sleeves 1, lamps 2, jetty 2, hover-cars 2, clouds 1, storm bank 1, sun 2
→ ~22. Rigs 3 × ≈ 3 = 9. Everything static merges per material; every repeat is instanced; textures ≤ 256 px; no
shadow maps (blob shadows only).

---

## 12. API summary

```js
SETS.flat = {
  env, build, marks, anchors, cams, zones, colliders, props, ambience, update,
  dress(state),   // 'evening18' | 'dawn21' | 'morning21'
};
```

| Dress | Shown / set |
| --- | --- |
| `evening18` | balcony door 0.5, bedroom door 0 (closed), entry door closed, pendant on, desk lamp on, `fridge_card` 'under' (crooked), keyboard covered, slate off, blanket folded, parcel/teas/toast/notes hidden, deco box 'under'; outside: traffic 2, lamps on, bridge lights on |
| `dawn21` | balcony door **0** (closed), bedroom door 0.45 (ajar), pendant off, `fridge_card` **'back'** (straight — continuity from 1.8), blanket spread, slate 'off', teas on the bench, `snore_z` on; outside: storm bank, lamps at 0.6, 1 hover-car |
| `morning21` | balcony door 1, bedroom door 1.4, toast + mugs on the table, `plan_notes.show(0)`, `snore_z` off; outside: sun disc low over the bay, lamps off |

Consistency: flat local = parade − (32, 3.6, −7). If either file moves the balcony, kitchen window, table or light
string, the other must follow (`docs/sets/parade.md` §2.5).
