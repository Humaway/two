# SET `foreshore26` — Woody Point headland, Christmas morning 2026 (no bench)

File `src/23-set-foreshore26.js` · `SETS.foreshore26` · Scene **A2 "Christmas Morning"** (Fri 25 Dec 2026, 7:10 am),
steps 1–18 and 20 (step 19 is a montage on `reddy26`). Same contract as Rue's `SETS.reddy`:
`{ env, build, marks, anchors, cams, zones, colliders, props, ambience, update }` + `dress(state)`.

---

## 0. Decisions

1. **This is `parade`'s Region W, fourteen years earlier, with the bench removed.** Same headland, same path, same
   railing, same pines, same bay, same bridge, same camera angles. Build it from the **identical layout constants** as
   `docs/sets/parade.md` §2.3–2.4, in **local coordinates with the origin at the bench spot** (parade world =
   this local + (−300, 0, 0)). Copy the layout constants verbatim into `23-set-foreshore26.js` (leaf fragments cannot share code).
2. **No bench, no concrete pad, no plaque, no frangipani.** "Only grass" — the spot where the bench will be is plain,
   unmarked grass with the same tufts as everywhere else.
3. **2026 dressing, not 2040**: physical signs carry readable text (no AR), a normal green-lid council bin, no padded
   anything, no drones, no chip lights. Real cars (on wheels) cross the Ted Smout Bridge.
4. "Christmas morning, cool for once": a fresh, pale, slightly cool palette; birds; a little wind.
5. Camera far plane 600 m: all backdrops within 480 m of the origin (same numbers as parade's Region W).

---

## 1. Purpose and scenes

| Scene / step | Env | Dress | What happens |
| --- | --- | --- | --- |
| A2 steps 1–18 | `xmas_morning` | `xmas26` | WIDE (the angle from 2.3): Luka and Chase on the grass with takeaway coffees where the bench will never be; Chase posts **two** (phone INSERTs, TOP-DOWN hands stop halfway); Luka's phone pings; the email "Sorry for the wait."; the lanyard; "Then I'll be awake."; Luka rings RUE (BRICK) |
| A2 step 20 | `xmas_morning` | `xmas26_empty` | WIDE · Woody Point: the grass where the bench would have been. Wind. (Nobody in shot.) Then the title **TWO** |

Time card: `Friday 25 December 2026, 7:10 am` · place `Woody Point`. The set is built behind A1's last white.

---

## 2. Layout (local; +Z = the bay; Y up; ry convention as parade: 0 faces +Z)

```
  z (bay, +Z)              Ted Smout Bridge dead ahead: 16° LEFT to 15° RIGHT, ~370 m; cars on it
 +70                · bell buoy (10, −2.6, 70)
 ~~~~ water y −2.6 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Woody jetty x 24.8…27.2, z 2…40
 +9   rocks
 +6.5 ═════ railing x −22…+22 (tinsel tied to one post at x 3) ═════   pandanus (−18,4) (17,5)
      grass
  0              ·  (0,0,0) — where the bench will be: just grass  ·
                 Luka (−0.32, 0.35)   Chase (0.36, 0.35), coffees
 −8   ════ concrete PATH x −40…+40 ═════   sign "WOODY POINT FORESHORE" (−8.5,−9.8)   green bin (4.5,−9.6)
 −10  shrubs                               picnic shelter (14,−12)
 −16  Norfolk pine (−14,−16)      Norfolk pine (12,−22)
 −46  road · low houses z −55…−65
```

| Thing | Where (local) | Notes |
| --- | --- | --- |
| Grass headland | x −40…40, z −60…6.5, y 0 | walkable x −16…16, z −10…6.2 |
| Path | z −9.1…−6.9, x −40…40 | concrete |
| Railing | z 6.5, x −22…22, posts every 2 m, rails y 0.55 / 1.05 | a strand of red tinsel tied round the post at x 3 (someone's Christmas) |
| Headland edge | sandstone wall z 6.6…7.0 (y 0 → −1.2), rocks to the water at z 9…11 | |
| Shoreline (water y −2.6) | (−40,−30) → (−30,−4) → (−22,6.8) → (22,6.8) → (30,0) → (40,−20) | |
| Norfolk pines | (−14,−16), (12,−22), (−24,−4), (28,−12), (−6,−34) | 18–24 m |
| Picnic shelter | (14, 0, −12) | |
| Council sign (readable) | (−8.5, 0, −9.8) facing +Z | **WOODY POINT FORESHORE** / "Please take your rubbish home" |
| Bin | (4.5, 0, −9.6) | green-lid wheelie bin |
| Pandanus | (−18, 0, 4), (17, 0, 5) | |
| Woody jetty (not walkable) | deck x 24.8…27.2, z 2…40, y −1.0 | |
| Bell buoy | (10, −2.6, 70) | |
| Inland | road z −46, 12 low houses z −55…−65 | |
| Water | plane y −2.6, 1100 × 1100 centred (0, −2.6, 450) | |
| Horizon band + skirt | r 480 around the origin; skirt = live fog colour | mainland shore behind the bridge; the peninsula curving away left |
| **Bridge** | **A (105, −2.6, 365) → B (−100, −2.6, 372)**; deck 5 m above water rising to 9 m at 55 %; piers every 18 m (12); lamps every 12 m (17) | fog:false; plus **8 tiny cars** (2026: wheels, headlights off at 7 am) sliding along the deck both ways |

Colliders (`[x0, z0, x1, z1]`): railing `[-22, 6.3, 22, 6.7]` · west `[-17, -10.4, -16, 6.7]` · east `[16, -10.4, 17, 6.7]` ·
inland `[-17, -10.4, 17, -10]` · sign post `[-8.7, -9.95, -8.3, -9.65]` · bin `[4.2, -9.9, 4.8, -9.3]`. No collider at the
bench spot.

---

## 3. Look

### 3.1 Palette (2026: the Rue palette, morning, cool for once)

| Use | Hex |
| --- | --- |
| Sky | `#a8d4ee` (2026 `#8fd0ff`, paled by the early hour) |
| Grass / dew highlights | `#86b552` / `#b8d890` |
| Path concrete | `#cfc8ba` |
| Sandstone / rocks | `#d8b98a` / `#8a7a66` |
| Norfolk pine | `#2e5a3a` |
| Railing | `#b8bec4` |
| Water near / far | `#7cc8dc` / `#4aa4c6` |
| Council sign | brown `#5a3a26` with cream letters `#f2ead6` |
| Bin | dark green `#2f5a3a`, lid `#3a7a4a` |
| Tinsel | red `#d8323a`, silver `#c8ccd4` |

No Yes yellow; no 2040 glassy accent anywhere (there are no chips yet).

### 3.2 Materials and textures

- `M.vc` (all static, vertex-coloured), `M.atlas` 256 × 128 (sign, bin decal, band), `M.water`, backdrop Basic
  `fog: false`, `M.grass` (InstancedMesh with the wind-sway shader, uniforms `uTime`, `uWind`).
- `t_sign26` 128 × 64: **WOODY POINT FORESHORE** (big) / **Please take your rubbish home** (small) — readable in
  `a2_grass` if the lens finds it; never the subject.
- `t_ripple`, `t_band_w`, `t_cloud`, `t_bridge`, `t_grass` as parade.
- INSERT cards (content paints them): Chase's phone upload page (**Pudding — two** / **POST**), **Posted** with the
  **Plays** counter 0 → 1 → 2, the email to Moreton Bay Records ("Re: what else have you got?", **two.wav**,
  **Sorry for the wait.**, Sent), Luka's phone **Calling: RUE (BRICK)**. The set provides only the anchors.

### 3.3 Lighting rig and fog

```js
env: {
  xmas_morning: { bg: 0xa8d4ee, fog: [0xdfe8ec, 0.0044], hemi: [0xeef4fa, 0x7aa05a, 1.00], dir: [0xfff0dc, 1.25, [14, 6, 10]], spot: [0xffffff, 0], rain: 0 },
}
```

Sun disc (r 9 + halo r 26) at 420 m toward (0.80, 0.28, 0.53) — low, to the left over the water (east). Spot unused.
Six cumulus cards, thin and high; no storm.

---

## 4. Props

| id | Description | States / animation |
| --- | --- | --- |
| `grass_f26` | 320 tufts, one InstancedMesh, wind sway shader | `gust(on)` raises `uWind` 1 → 1.8 over 1 s (step 20 "Wind."), back down when off |
| `coffees` | two takeaway cups (white, brown sleeves) | on the grass at (−0.05, 0, 0.75) and (0.6, 0, 0.75) by default; content may `hold` them |
| `tinsel_rail` | red tinsel round the railing post at x 3 | flutters (rotation ±0.08 rad, 1.1 Hz; × wind) |
| `council_sign_26` | readable sign | static |
| `bin_26` | green-lid wheelie bin | static |
| `bell_buoy` | red cage buoy | bob ±0.15, tilt ±0.12 rad, 4.2 s |
| `gulls` | 3 gulls gliding in wide circles over the water (InstancedMesh) | circles r 18–30 m, y 8–14, occasional flap |
| `bridge_cars` | 8 tiny 2026 cars on the bridge deck (InstancedMesh) | slide along the deck at a scaled 60 km/h equivalent, wrap |
| `woody_jetty`, `railing_w`, `pines`, `shelter`, `houses` | static | |
| `water`, `foam`, `band`, `skirt`, `bridge`, `bridge_lamps`, `sun`, `clouds` | backdrop | ripple scroll, foam on rocks, cloud drift; lamps off (7 am) |

Instanced: grass 320 · pine tiers 30 · railing posts 23 · rocks 40 · jetty piles 24 · houses 12 · bridge piers 12 +
lamps 17 · bridge cars 8 · gulls 3.

---

## 5. Marks (`[x, y, z, ry]`, local)

| id | value | use |
| --- | --- | --- |
| `a2_luka` | [−0.32, 0, 0.35, 0] | Luka sitting on the grass (sit-on-ground pose), facing the bay |
| `a2_chase` | [0.36, 0, 0.35, 0] | Chase sitting beside him (screen-left from behind, as on the bench in 2.3) |
| `bench_spot` | [0, 0, 0, 0] | where the bench will be (reference only) |
| `path_w`, `path_e` | [−15.0, 0, −8.0, H], [15.0, 0, −8.0, −H] | path ends (if content wants a passer-by; none scripted) |

---

## 6. Anchors (`{ at, from, fov }`, local)

| id | at | from | fov | for |
| --- | --- | --- | --- | --- |
| `wp_canon` | [−0.5, 0.7, 4.0] | [1.5, 2.0, −13.0] | 40 | **"the angle from 2.3"** — step 1 (WIDE · locked). Identical to parade's `wp_canon` minus W0 |
| `a2_phone_chase` | [0.36, 0.72, 0.62] | [0.2, 1.25, 1.25] | 30 | steps 2, 4, 7 INSERTs on Chase's phone (cards overlay) |
| `a2_topdown` | [0.36, 0.85, 0.35] | [0.36, 3.2, 0.37] | 40 | step 3 TOP-DOWN · Chase: hands rise, stop halfway, he laughs, presses POST |
| `a2_two_front` | [0.02, 0.8, 0.35] | [0.25, 1.1, 3.0] | 40 | steps 5–6, 9–17: two-shot from the bay side (railing behind the lens) |
| `a2_lanyard` | [−0.32, 0.65, 0.55] | [−0.7, 1.0, 1.4] | 30 | step 9: Luka turning the faded 2040 lanyard in his hands |
| `a2_phone_luka` | [−0.32, 0.72, 0.62] | [−0.55, 1.25, 1.25] | 30 | step 18 INSERT: Calling RUE (BRICK) (card overlays) |
| `a2_grass` | [0.0, 0.25, 1.5] | [0.6, 0.55, −3.2] | 34 | step 20 WIDE · Woody Point: low over the empty grass where the bench would have been, the bay and the bridge beyond, grass bending (`grass_f26.gust(true)`) |
| `a2_bridge` | [0.0, 4.0, 368] | [0.0, 1.6, 5.5] | 14 | spare: long lens on the bridge with the 2026 cars |

TOP-DOWN, MID and CLOSE shots not listed use the framing helper; there are no walls to avoid here.

---

## 7. Zones and fixed cameras

A2 has no roam. One fixed camera and one zone keep the engine happy (first cam = `wp_canon`) and cover the walkable
area if a debug start or Chapter Select ever drops the player here.

```js
cams:  { wp_canon: { type: 'fixed', pos: [1.5, 2.0, -13.0], look: [-0.5, 0.7, 4.0], fov: 40 } },
zones: [ { box: [-16, -10, 16, 6.2], cam: 'wp_canon' } ],
```

---

## 8. Hotspots

None (A2 is cutscene only).

---

## 9. Cutscene needs

- Step 1 `wp_canon` locked: the path in the foreground, two men on the grass mid-frame at the bench spot, coffees,
  the railing, the bay, the bridge ahead with tiny cars, low morning sun to the left. It must read as the same frame as
  2.3/B2 with the bench missing: keep every other object where parade's Region W has it.
- Steps 2, 4, 7, 18 phone INSERTs (cards) over `a2_phone_chase` / `a2_phone_luka`.
- Step 3 `a2_topdown`.
- Steps 5–17 `a2_two_front` and framing-helper singles.
- Step 20 `a2_grass` with `gust(true)` and `tinsel_rail` fluttering; no people (`dress('xmas26_empty')` hides both
  actors' coffees; content despawns the actors). Then title **TWO**.

---

## 10. Ambience and `update(dt, ctx)`

`ambience: { loops: ['birds', 'wind_soft', 'water_lap'], room: 'none' }` (the A2 music line: "birds; then **two**,
from a phone speaker" — the song is content's `AUDIO.song` through a phone-speaker filter). Step 20 adds a wind gust
(`sfx('wind_gust')`, content).

`update` (no allocation): grass `uTime += dt`, `uWind` eases toward its target; tinsel flutter × wind; bell buoy
bob/tilt; gulls circle; bridge cars slide and wrap (instance matrices, one `needsUpdate`); water ripple and foam
scroll; clouds drift; band skirt colour = `world.scene.fog.color`.

---

## 11. Performance budget (target < 300; expected ≈ 35)

`M.vc` 1, atlas 1, grass 1, pines 1, posts 1, rocks 1, jetty 1, houses 1, water 2, buoy 1, gulls 1, tinsel 1,
coffees 1, band 2, bridge 2 + lamps 1 + cars 1, sun 2, clouds 1 → ≈ 24, plus two rigs (≈ 6). Everything static
merged; every repeat instanced; textures ≤ 256 px.

---

## 12. API

```js
SETS.foreshore26 = {
  env, build, marks, anchors, cams, zones, colliders, props, ambience, update,
  dress(state),   // 'xmas26' (default) | 'xmas26_empty' (step 20: coffees hidden, gust on)
};
```

AUTO: `'A2' → 'xmas26'`. Content calls `dress('xmas26_empty')` before step 20.

**Consistency**: any change to parade Region W's layout (path, railing, pines, shelter, sign, bin, jetty, buoy, bridge
endpoints, `wp_canon`) must be mirrored here, and vice versa (`docs/sets/parade.md` §2.3–2.4).
