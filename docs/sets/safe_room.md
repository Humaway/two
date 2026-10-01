# SET `safe_room` — the Safe Room (fail state, spec §13.7) and the Quiet Corner variant (3.1)

File `src/24-set-safe-room.js` · `SETS.safe_room` · Used by **every drone-stealth capture** (1.6, 1.7, 2.2, 2.5, 2.7,
2.8, 3.2) and as the fallback for Blend In's **Quiet Corner** (3.1). Same contract as Rue's `SETS.reddy` (`{ env,
build, marks, anchors, cams, zones, colliders, props, ambience, update }`), plus the extras that let it be shown
**without loading a set**: `mount(scene, def)`, `unmount()`, `ref(name)`, `envObj`, `ORIGIN`, `dress(state)`,
`sequence` (timing data for `33-systems.js`'s `safeRoom()`).

---

## 0. Decisions (read first)

1. **It is mounted, not loaded.** A capture must reach the room and return in under 6 s, mid-roam, on any set. Loading a
   set would retire/rebuild the stealth set and blow `liveMax`. So the room is a tiny closed box built **once**
   (`MG ||= buildRoom()`) and parented into the **current set's scene at `ORIGIN = (1000, 0, 1000)`** — far outside
   every set's geometry, zones, colliders, rain box and skyline (r ≤ 500). Inside a closed box nothing of the host is
   visible. On retry it's hidden (`visible = false`) and left parented (re-parented if the host was rebuilt:
   `if (MG.parent !== world.scene) world.scene.add(MG)`).
2. **Self-lit.** All room surfaces are `MeshBasicMaterial` (vertex-coloured / textured, `fog: false`), so the room
   looks identical whatever the host's lights and fog are. The actors are lit by the host's rig, so `safeRoom()`
   applies `envObj` (a bright, even, near-fogless object preset) for the duration and restores the host's preset name
   after.
3. **Its marks and anchors are injected into the host set's tables** at mount time with an `sr_` prefix, already
   offset by `ORIGIN`, so content and systems use plain names: `place('chase', 'sr_bean')`, `{ shot: 'INSERT', at:
   'sr_wide' }`. The `sr_` prefix is reserved for this set.
4. **Funny and quick.** One locked-off-but-pushing wide from the high corner: the captured character sat on a beanbag in
   a padded white room, the others (if any are in the scene) on floor cushions, a poster **YOU ARE SAFE NOW**, a kettle,
   one drone in the corner. One drone line, one pop-up with one button, back. ≤ 6 s from capture to retry.
5. **Quiet Corner (3.1).** `hq_atrium` builds its own in-set Quiet Corner (beanbag behind a partition, `quiet_beanbag`,
   `quiet_drone`, `quiet_corner` — hq_atrium.md §5, §9), so in 3.1 `safeRoom()` uses the host's corner when
   `world.set.marks.quiet_beanbag` exists. Only if it doesn't does it mount this room with `dress('quiet')`.

---

## 1. Purpose and scenes

| Use | When | Env | Dress | What happens |
| --- | --- | --- | --- | --- |
| Safe Room (fail state) | any stealth roam: 1.6 (tutorial, first time), 1.7, 2.2, 2.5, 2.7, 2.8, 3.2 (L21, L30) | `envObj` applied to the host (standalone: `safe`) | `safe` | escort → white → the room → DRONE: "You are not in trouble. ^ You are in danger." → **"Would you like to try again? [YES]"** (the only button) → white → retry at the last zone checkpoint, drones reset |
| Quiet Corner (fallback) | 3.1 Blend In, two "no"s, only if the host has no corner | as above | `quiet` | the same sequence in the Quiet Corner dressing |
| Standalone | tests (`?scene=` debug), never in the story flow | `safe` | `safe` | the set loads like any other (origin at 0,0,0) |

No time card, no HUD change (the HUD stays as it was), music ducked −12 dB (the stealth loop keeps its place).

---

## 2. Layout

### 2.1 Axes and conventions

- **Local** frame (standalone): the room's floor centre is (0, 0, 0); **mounted**: world = local + `ORIGIN`
  (1000, 0, 1000). Y up, +X east, +Z south, floor y 0.
- Mark facing `ry`: actor faces `(sin ry, cos ry)`: `0` → +Z (south, the door), `PI` → −Z (north, the poster wall).
- The camera sits in the **south-east upper corner** looking north-west; screen-right is north-east, screen-left
  south-west.

### 2.2 Plan (north at the top; local metres)

```
 z −2.0 ┌─◜──────────── north wall ── [ YOU ARE SAFE NOW ] (0.15, 1.55) ───────────────◝─┐
        │ ◉ drone (−1.45, 2.15, −1.45)                                                 │
        │ ▣ side table + KETTLE (−1.5, −1.5)                    ◯ cushion A (0.95,−0.95)│
        │                                                                              │
 z −0.35│              (●) BEANBAG (−0.35, −0.35) r 0.62                        ⊙ clock │
        │                                                               (east wall,   │
        │  ◯ cushion B (−1.2, 0.5)                                       no hands)    │
        │                                                                              │
        │                                                           📷 sr_wide (1.6, 2.35, 1.6)
 z +2.0 └─◟───────────────────────── [ padded DOOR x −0.45…0.45 ] ─────────────────◞─┘
        x −2.0                                0                                    +2.0
        corners: quarter-round padded columns r 0.40 · ceiling 2.8 with a round soft light panel r 0.5
```

### 2.3 Key coordinates (local)

| Thing | Where | Notes |
| --- | --- | --- |
| Room | x −2.0…2.0, z −2.0…2.0, y 0…2.8; closed on all six sides | 4 × 4 m |
| Walls | quilted padded panels (diamond stitch), cream-white; a 0.4 m padded skirting bolster | |
| **Rounded corners** | four quarter-round padded columns r 0.40, full height, at the inner corners | "rounded corners" |
| Floor | padded mats 1.0 × 1.0 with soft seams | |
| Ceiling | padded; a round soft **light panel** r 0.5 at (0, 2.79, 0) (emissive) | |
| **Door** | south wall, x −0.45…0.45, y 0…2.0, padded, a round frosted porthole r 0.15 at y 1.55; above it a small plate **SAFE ROOM · occupancy: you** | the way out (never opened on screen) |
| **Beanbag** | centre (−0.35, 0, −0.35), r 0.62, squashed (h 0.55), pale SafeSense blue | seat height 0.35 |
| Cushion A / B | (0.95, 0, −0.95) / (−1.2, 0, 0.5); round floor cushions r 0.32, h 0.12 | for the non-captured playables |
| **Side table + kettle** | rounded padded cube 0.55 at (−1.5, 0, −1.5); a chrome **kettle** with a soft blue light at (−1.5, 0.55, −1.5), one cup, a tissue box | not a save point (no interaction in the sequence) |
| **Poster YOU ARE SAFE NOW** | north wall, (0.15, 1.55, −1.97), 0.70 × 0.95, in a padded frame | |
| **The drone** | north-west upper corner, (−1.45, 2.15, −1.45), facing the beanbag (ry 0.8) | the speaker |
| Clock (gag) | east wall (1.97, 1.9, −0.3), r 0.22, padded rim, **no hands**, face reads **TIME: SAFE** | |
| `quiet` dressing | a three-panel cream partition screen standing at x −0.9…1.3, z 0.55 (angled 0.25 rad), the beanbag behind it; the poster swapped for **QUIET CORNER** + a tiny SafeSense 40 dB meter; the kettle swapped for a plate of pre-screened mince pies | 3.1 fallback |

### 2.4 Colliders (local; injected offset by `ORIGIN` only in standalone mode — mounted, the player is frozen)

```
walls  [-2.2,-2.2,2.2,-2.0] [-2.2,2.0,2.2,2.2] [-2.2,-2.0,-2.0,2.0] [2.0,-2.0,2.2,2.0]
table  [-1.78,-1.78,-1.22,-1.22]
```

---

## 3. Look

### 3.1 Palette (spec §14: 2040 padded surfaces in soft cream; the glassy accent on drones and SafeSense)

| Use | Hex |
| --- | --- |
| Padded walls / stitch shadow | `#f4f2ec` / `#dcd8ce` |
| Floor mats / seams | `#e8e6e0` / `#cfcbc2` |
| Corner columns, bolsters | `#efece4` |
| Beanbag | `#cfe8f6` (pale SafeSense blue), shadow `#a8c8dc` |
| Cushions | `#e6dcc8`, `#d8e4ee` |
| Light panel (emissive) | `#ffffff` |
| Kettle (chrome) / its light | `#c8ccd4` / `#8fd8ff` |
| Poster | white ground, `#4a8ab8` type, the SafeSense drop smiling in `#bfe6ff` |
| Drone | shell `#eef2f6`, light `#8fd8ff` |
| Door porthole (frosted) | `#dfe8ee` |

### 3.2 Materials

- `M.room` — `MeshBasicMaterial({ vertexColors: true, fog: false })`: every padded surface, furniture, door, columns
  (light baked into vertex colours at build: a soft top-down gradient + darker stitch rows; the Builder's `bakeLight`
  is fine) → 1 draw call.
- `M.atlas` — `MeshBasicMaterial({ map: t_sr_atlas, fog: false })`: poster, door plate, clock face, QUIET CORNER sign,
  the 40 dB meter, the quilt detail strip → 1 draw call.
- `M.glow` — `MeshBasicMaterial({ color: 0xffffff, fog: false })`: the ceiling panel, the drone's light, the kettle's
  light (unique key; `update` pulses the drone light while it talks).
- The drone: the shared drone geometry from art, but with this set's own fog-free shell material (created once).
- Created **once** (module-level `||=`), warmed at boot through the standalone build.

### 3.3 Textures to paint (128–256 px, nearest)

| Texture | Size | Content | Read at |
| --- | --- | --- | --- |
| `t_sr_atlas` | 256 × 256 | region A (128 × 176): the poster **YOU ARE SAFE NOW** (big, two lines) + the smiling SafeSense drop; region B (128 × 32): **SAFE ROOM · occupancy: you**; region C (64 × 64): the clock face **TIME: SAFE**; region D (128 × 48): **QUIET CORNER**; region E (64 × 64): a little 40 dB meter dial; region F (64 × 64): a quilt stitch tile | `sr_poster`, `sr_wide` |

### 3.4 Lighting and env

Standalone preset (first key) and the object the mounted sequence applies to the host:

```js
env: {
  safe: { bg: 0xf4f2ec, fog: [0xf4f2ec, 0.0005], hemi: [0xffffff, 0xd8d6d0, 1.25], dir: [0xffffff, 0.35, [2, 6, 3]], spot: [0xffffff, 0], rain: 0 },
},
envObj: { bg: 0xf4f2ec, fog: [0xf4f2ec, 0.0005], hemi: [0xffffff, 0xd8d6d0, 1.25], dir: [0xffffff, 0.35, [2, 6, 3]], spot: [0xffffff, 0] },
```

`world.env(envObj, 0)` keeps the host's rain amount (the host's rain falls ~1 km away, unseen). The spot is turned off
(`spot` 0) — remember the host's torch state and restore it. No lamp: the room is evenly, softly lit (no shadows,
nothing dramatic — it's "safe").

### 3.5 Sky / backdrop

None (a closed padded box). The porthole in the door is frosted (no view out).

---

## 4. Props

| id | Description | States / `userData` |
| --- | --- | --- |
| `sr_drone` | the corner drone (shell + light) | `talk(on)` (light pulses with DRONE blips); idle bob ±0.03 m at 0.4 Hz, a slow ±0.15 rad yaw; `turnTo(x, z)` (eased; faces whoever's on the beanbag) |
| `sr_beanbag` | the beanbag | `squash(k)` 0…1 — a short "sigh" squash when someone lands on it (0.35 s, eased back to 0.6) |
| `sr_kettle` | kettle + cup + tissue box on the table | `steam()` (a `world.puff` at the spout: `{ n: 10, speed: 0.2, life: 1.6, color: 0xf2f2f2 }`) — every visit |
| `sr_poster` | the poster in its padded frame | static (swapped to QUIET CORNER in `quiet`) |
| `sr_clock` | the handless clock | static |
| `sr_door` | the padded door | static (never opens on screen) |
| `sr_light` | the ceiling panel | `level(k)` (the white-in/white-out is UI, not this) |
| `sr_partition`, `sr_pies`, `sr_meter` | the `quiet` dressing | visible only in `quiet` |

No instanced repeats. `ref(name)` returns these (they live in the cached mounted group, which isn't in the host's
prop map, so `world.prop()` won't find them).

---

## 5. Marks (`[x, y, z, ry]`, local — injected as world coordinates `+ ORIGIN` when mounted)

| id | value | use |
| --- | --- | --- |
| `sr_bean` | [−0.35, 0, −0.35, 0.8] | **the captured character**, seated on the beanbag (`play('sit', { h: 0.35 })`), facing the camera corner |
| `sr_cush_a` | [0.95, 0, −0.95, −2.4] | a second playable (if spawned in the scene), cross-legged on a cushion, facing the beanbag (`sit`, h 0.12) |
| `sr_cush_b` | [−1.2, 0, 0.5, 2.2] | a third playable, facing the beanbag |
| `sr_drone_at` | [−1.45, 2.15, −1.45, 0.8] | the drone's post (not an actor; for framing) |
| `sr_door_in` | [0.0, 0, 1.6, PI] | standalone spawn |

Order of filling: the captured one → `sr_bean`; the other playables present in the scene, in `playable` order →
`sr_cush_a`, `sr_cush_b` (so in 1.6 all three are in the room; in 2.7 just Chase). Non-playable followers aren't placed.

---

## 6. Anchors (`{ at, from, fov }`, local — injected `+ ORIGIN`)

| id | at | from | fov | for |
| --- | --- | --- | --- | --- |
| `sr_wide` | [−0.5, 0.65, −0.6] | [1.6, 2.35, 1.6] | 68 | **the** shot: high in the south-east corner; the beanbag centre, the poster above it, the drone in the far corner over the kettle, cushions left/right |
| `sr_wide_push` | [−0.5, 0.65, −0.6] | [1.25, 2.2, 1.25] | 64 | the end of the slow push (2.5 s, ease-out) |
| `sr_drone` | [−1.45, 2.15, −1.45] | [−0.4, 1.7, −0.3] | 40 | CLOSE the drone (on every third capture in a scene, as the opening beat) |
| `sr_bean_close` | [−0.35, 0.8, −0.35] | [0.6, 1.2, 0.6] | 44 | CLOSE the captured character (spare) |
| `sr_poster` | [0.15, 1.55, −1.97] | [0.15, 1.5, −0.6] | 40 | INSERT **YOU ARE SAFE NOW** (spare; the 1.6 tutorial may hold on it 1 s) |
| `sr_kettle` | [−1.5, 0.7, −1.5] | [−0.8, 1.1, −0.8] | 36 | the kettle steaming (spare) |

---

## 7. Gameplay zones and fixed cameras

There's no play in the room (the player is frozen; the only input is the pop-up's YES). For standalone loading and for
any framing fallback:

```js
cams:  { sr_cam: { type: 'fixed', pos: [1.6, 2.35, 1.6], look: [-0.5, 0.65, -0.6], fov: 68 } },
zones: [{ box: [-2.0, -2.0, 2.0, 2.0], cam: 'sr_cam' }],
```

When mounted, `mount()` also pushes the zone (offset) into the host's `zones` **at the front** (first match) and
removes it on `unmount()`, so the framing helper treats the room as inside; the host's gameplay camera never sees it
because the player is frozen and the camera is in a shot.

---

## 8. Hotspots

None. (The kettle is set dressing here — saving happens at the stealth set's own kettle.)

---

## 9. The sequence (what `33-systems.js`'s `safeRoom(o)` does with this set)

`o = { who, variant: 'safe' | 'quiet', checkpoint }`. Timings in seconds from the moment the escort's hug completes;
target **≤ 6 s total including a prompt press** (autoplay presses after 0.3 s).

| t | Step |
| --- | --- |
| 0.00 | `player.control(null)`; input frozen; AI followers stop. `ui` fades to white over 0.30 s (Reduce Flashing: to cream `#f4f2ec`, 0.45 s). |
| 0.30 | Under white: **3.1 check** — if `world.set.marks.quiet_beanbag` exists, use the host's corner (`quiet_beanbag`, `quiet_drone`, `quiet_corner`) and skip the mount; else `SETS.safe_room.mount(world.scene, world.set)` + `dress(o.variant)`. Remember the host's env name and torch; `world.env(envObj, 0)`. `place` the captured one at `sr_bean` (`play('sit', { h: 0.35 })`, `expr('neutral')`), others at `sr_cush_a/b` (`sit`, h 0.12). `sr_drone.turnTo(sr_bean)`. `sr_kettle.steam()`. `cam.shot({ shot: 'INSERT', at: 'sr_wide', move: 'push', to: 'sr_wide_push', dur: 2.5 })` (on every third capture in the same scene: 0.8 s on `sr_drone` first). Ambience ducked −12 dB, `AUDIO.setRoom('none')`. |
| 0.35 | `sr_beanbag.squash(1)` + a soft "pff" sfx. Fade from white over 0.30 s. |
| 0.70 | DRONE: **"You are not in trouble. ^ You are in danger."** (`say('drone', …)`, `sr_drone.talk(true)` while it types; text speed at least *normal*; auto-advance 0.9 s after the line completes). |
| ≈ 3.4 | **"Would you like to try again? [YES]"** — `popup({ style: 'safesense', msg: 'Would you like to try again?', buttons: ['YES'], at: 'center' })` and await it (the only button). |
| press | Fade to white 0.25 s; under it: `SETS.safe_room.unmount()` (or nothing, for the host's corner), restore the host's env preset by name and its torch, `AUDIO` room/ambience back, stand the actors up, systems reset drones and place the party at `o.checkpoint`, `player.control(active)`; fade from white 0.25 s. |

Total without the press ≈ 3.9 s; with a quick press ≈ 4.5 s.

`mount(scene, def)`:
1. `MG ||= buildRoom()` (once per page; materials created once).
2. `MG.position.set(1000, 0, 1000)`; `MG.visible = true`; `if (MG.parent !== scene) scene.add(MG)`.
3. If `!def.marks.sr_bean`: copy every `sr_*` mark and anchor into `def.marks` / `def.anchors` with `ORIGIN` added
   (precomputed arrays, built once; no per-capture allocation). Push the offset zone to the front of `def.zones`.

`unmount()`: `MG.visible = false`; remove the zone from the host's `zones` (by reference). Marks/anchors may stay.

---

## 10. Ambience and `update(dt, ctx)`

**Ambience** (standalone): `{ rain: false, loops: ['padded_hush'], room: 'none' }` — a dead, very dry room; a faint
fan hum. Mounted: the sequence ducks the host's loops −12 dB and adds `padded_hush` for its duration.

**`update(dt, ctx)`** (the standalone `update`, and `SETS.safe_room.tick(dt)` which `safeRoom()` calls each frame while
mounted — the host's `update` doesn't know about it). No allocation:

1. `sr_drone`: bob, slow yaw toward its `turnTo` target, light pulse while `talk`.
2. `sr_beanbag` squash easing.
3. `sr_light` steady (a very slow ±3% breathe).

---

## 11. Performance budget

| Group | Draw calls |
| --- | --- |
| `M.room` 1, `M.atlas` 1, `M.glow` 1, drone shell 1 | 4 |
| Rigs (1–3 playables, ≈ 3 each) | 3–9 |
| Puff | 1 |

The host set keeps rendering behind the closed box only if it isn't culled — the camera is inside the room and the
host's geometry is ~1 km away, outside the far plane's useful range and fully occluded; to be safe `safeRoom()` may set
the host root `visible = false` for the duration (one flag, restored on exit) — recommended on phones.

---

## 12. API summary

```js
SETS.safe_room = {
  env,                       // { safe }
  envObj,                    // the object preset applied to the host while mounted
  ORIGIN: [1000, 0, 1000],
  build,                     // standalone: returns a Group at the origin (also warms the materials at boot)
  marks, anchors, cams, zones, colliders, props, ambience, update,
  dress(state),              // 'safe' | 'quiet'
  mount(scene, def),         // §9
  unmount(),
  tick(dt),                  // ambient life while mounted
  ref(name),                 // 'sr_drone' | 'sr_beanbag' | 'sr_kettle' | 'sr_poster' | 'sr_clock' | 'sr_door' | 'sr_light' | 'sr_partition'
  sequence: { whiteIn: 0.30, whiteOut: 0.30, lineAt: 0.70, popupAfterLine: 0.9, push: 2.5, exitFade: 0.25 },
};
```

**Engine / systems notes.** (1) `safeRoom()` lives in `33-systems.js` (ARCHITECTURE §2); this set only provides the
room, its data and `mount`/`unmount`/`tick`. (2) The host's env name must be restorable — if `world` doesn't expose
the current preset name, please add `world.envName` (the engine already keeps `e.envName`). (3) While mounted, keep
`player.control(null)` so no host `floor()` is evaluated at (1000, 1000). (4) The `sr_` mark/anchor prefix is
reserved. (5) In 3.1, `hq_atrium`'s own Quiet Corner wins whenever its marks exist.
