# 04 — World: sets, actors, player, cameras, split screen, time-lapse

Reference manual for Rue's WORLD subsystem (`ENGINE-B1`), written so TWO can be built on it without re-reading the
source. It covers set building, caching and disposal, the environment presets, the SET contract (with `SETS.reddy` as
the worked example), actors, the player and follower, collision, the gameplay and cutscene cameras (every shot kind and
option), the `frame()` helper, split screen, time-lapse, puffs, the torch, and the update/render pipeline.

| Rue (`ref/rue/`) | TWO (`src/`) | Differences |
| --- | --- | --- |
| `09-world-engine-b1.js` (1266 lines) | `30-world.js` | Only three error strings say `TWO:` instead of `RUE` (lines 138, 414, 1101). **Line numbers are identical.** |
| `05-set-reddy-optus-redcliffe-2026.js` (1178 lines) | `10-set-reddy26.js` | Byte-identical. It still registers `SETS.reddy`, which TWO will rename to `reddy26`. |

Citations: `09:NNN` is a line in the world file (the same line in `src/30-world.js`). `05:NNN` is the reddy set,
`11:` is `11-flow.js`, `04:` is `04-art.js`, `01:` is `01-config.js`, and `NN:` is any other `ref/rue/NN-*.js`.

---

## 1. Overview

### 1.1 Exports and dependencies

```js
const { world, cam, frame, player } = (() => { … return { world: W, cam: C, frame: frameFn, player: P }; })();   // 09:7, 09:1264
```

| Export | What it is |
| --- | --- |
| `world` | Sets, environment, actors, props, puffs, torch, split, time-lapse, and `update` / `render` (§3, §6, §11–§13) |
| `cam` | The camera director: cutscene shots, release, lock, gameplay overrides, projection (§8–§10) |
| `frame(subjects, size, opts)` | The framing helper. It returns a **shared** `{pos, look, fov, up}` (§9.4) |
| `player` | Player control, the follower and freezes (§7) |

It reads these names **at call time only**, never while the fragment evaluates: `THREE`, `CONFIG` (`step, walk, run, carry,
turn, radius, fov, ecuFov, dist`), `SETS`, `LOOKS`, `ANIMS`, `CHARACTERS`, `renderer`, `clock.t`, `input.move`,
`input.run`, `options.controls`, `canvasTex`, `makeRain`, `blobShadow`, `buildCharacter` and `testLog`. Behind
`typeof` guards it also reads `AUDIO` (`ambience`, `setRoom`, `listener`), `flow.skipping`, `sfx` and `runSteps`.

### 1.2 Conventions

- Units are metres, with Y up. One tick is `CONFIG.step = 1/60` s.
- **`rotY`** is a heading in radians, `Math.atan2(dx, dz)`. `0` faces +Z and `+π/2` faces +X. A rig faces +Z, and the
  character's **left is +X** at `rotY = 0` (04:208-210).
- **Floor rectangles** are `[x0, z0, x1, z1]` with `x0 < x1` and `z0 < z1`. Zones, colliders and the rain box all use them.
- A **mark** is `[x, y, z, rotY]`. An **anchor** is `{ at:[x,y,z], from:[x,y,z], fov }`.

### 1.3 Internal helpers that shape behaviour

| Helper | Line | Meaning |
| --- | --- | --- |
| `smooth(u)` | 09:11 | Smoothstep, clamped. It is the default ease for shots, env lerps, face turns and the release blend |
| `EASE` | 09:12 | `linear`; `in` = u³; `out` = 1−(1−u)³ |
| `angTo(a, b)` | 09:13 | Shortest signed angle from a to b |
| `damp(rate, dt)` | 09:14 | `1 − e^(−rate·dt)`: frame-rate-independent exponential smoothing |
| `skipping()` | 09:15 | `flow.skipping`, guarded by `typeof` |
| `settle(o, k)` | 09:16 | `const r = o[k]; o[k] = null; if (r) r();` **Every superseded world promise is resolved, never rejected** |
| `t1…t5, tc, size2, box3` | 09:17 | Shared scratch objects. Any function may overwrite them, so never hold one across a call |

### 1.4 Where the world runs in a frame

```
tick (60 Hz, 36-main.js:22):  input.tick → menus → ui.update → clock.step (updaters, waits) → world.update(1/60)
world.update(dt)  09:1135      envTick(cur) · envTick(splitE) · tlTick
                               copy prev ← pos for every shown actor        ← interpolation baseline
                               playerTick · followerTick · actorTick (shown actors)
                               setTick(cur) · setTick(splitE)   (def.update, rain time, puffs)
                               torchTick · camTick · split slide
frame (rAF):  world.render(alpha) 09:1152  → emit('render', alpha) (popups, minigame draw)
```

"Shown" means `a.set === cur || a.set === splitE` (09:1127). Actors in any other live set are **frozen**: they are not
ticked, not interpolated and not posed.

---

## 2. Promises, supersession and skipping

Every async world call resolves from `world.update`, **not** from `clock.waits`. So a world promise is **not** released
when a skip starts. `wait`/`waitUntil` are (02-core:29). If a skip is active *at call time*, most calls jump straight to
their end state.

| Call | Resolves when | Superseded (resolved early) by | `flow.skipping` at call time |
| --- | --- | --- | --- |
| `world.load(id, o)` | Immediately (it is `async`, but the build inside is synchronous) | — | Same |
| `world.preload(id)` | Immediately, after a synchronous build | — | Same |
| `world.env(p, dur, setId)` | The lerp ends | The next `env` on the same set, or retirement | Instant |
| `actor.moveTo(where, o)` | Arrival, plus a 0.3 s turn if the target has a facing | `moveTo`, `place`, `despawn`, `spawn` (re-place) | Teleport + face, resolved |
| `actor.face(target, dur)` | The turn ends | `face`, `moveTo`, `place`, `despawn` | Instant |
| `actor.play(anim, o)` | After `playT` (a one-shot's length, or `o.dur`). A looping anim with no `dur` resolves at once | `play`, `spawn`, `despawn` | Final anim set, resolved |
| `cam.release(dur)` | The blend ends | `cam.shot`, `cam.release` | Instant cut |
| `world.split(spec)` | Immediately | — | Same |
| `world.split(null, {slide:true})` | After the 0.6 s slide | — | Immediate unsplit |
| `world.timelapse(o)` | `dur` elapsed | The next `timelapse` | Keys fired, env set to **`from`** (§12) |
| `cam.shot(step)` | — (returns `undefined`) | — | Lands on the move's end state, except `track` |

Consequences:

- `await a.moveTo(…)` inside a `do` step keeps walking in real time if a skip starts mid-walk. The flow's own
  `{move}` step avoids this because it waits with `waitUntil` and then re-issues `moveTo` (11:188-196). Prefer steps.
- A superseded `moveTo` **resolves**, so code after `await a.moveTo(x)` runs even though the actor never reached `x`.
- An awaited move, face, play or env on an actor or set that is **not shown** never resolves. That hangs the cutscene.

---

## 3. Sets: lifecycle, caching and the light rig

### 3.1 The live entry (09:168-171)

`build(id)` returns one entry per set, kept in `live: Map<setId, entry>` (oldest first, LRU).

| Field | Meaning |
| --- | --- |
| `id`, `def` | Set id and `SETS[id]` |
| `scene` | Its own `THREE.Scene`, with `background: Color` and `fog: FogExp2(0x808080, 0.01)` |
| `group` | What `def.build()` returned (added to `scene`) |
| `props` | `{name: Object3D}`: **every named descendant** of `group`, first occurrence wins (09:148-149) |
| `anchors` | `{name: {at: Vector3, from: Vector3\|null, fov: number\|null}}`, parsed from `def.anchors` |
| `hemi`, `dir`, `spot` | The fixed light rig. `spot.name = 'torch'`; `spot.target` is in the scene |
| `rain` | The rain `Points` (set-provided or auto-made), or `null` |
| `puff` | A pooled 64-particle `Points` (§3.9) |
| `firstCam` | The first key of `def.cams` (or `''`) |
| `env`, `from`, `to`, `envName`, `envT`, `envDur`, `envRes` | Environment state (§3.7) |
| `ctx` | `{t, player, running, env, props}`, passed to `def.update` every tick (§4.9) |

### 3.2 `build(id)` (09:136-176)

1. `SETS[id]` must exist, or it throws `'RUE: no SETS.<id>'`.
2. It creates a scene and **the fixed light rig**: `HemisphereLight`, `DirectionalLight`, and `SpotLight(0xffffff, 0, 30,
   0.33, 0.5, 1.5)` (white, intensity 0, distance 30, angle 0.33 rad, penumbra 0.5, decay 1.5). The comment at 09:141
   says it plainly: *never add/remove lights later (shader recompiles), only change values*.
3. `group = def.build()` goes into the scene, then `twins(group)` runs (§3.5).
4. It builds `props` (every named object) and parses `anchors` (an anchor may be a bare `[x,y,z]` or `{at, from, fov}`).
5. **Rain.** If the group contains an object named `rain` with `.uniforms` (a `makeRain` result), that object is used.
   Otherwise, if `ambience.rain` is truthy, or any env preset is named `*rain*` or has `rain > 0`, it calls `makeRain`
   with:
   - `box`: `ambience.rain.box` if given, else the union of all zone boxes plus a 12 m margin, else the group's bounds
     capped to ±30 m
   - `top` 12, `bottom` 0 (or `ambience.rain.top` / `.bottom`), and
     `count = clamp(area × 2.5, 1500, 6000)` unless `ambience.rain.count` is given.
6. It adds the puff `Points`, applies the default env, then **applies the first preset in `def.env`** instantly
   (`envSet(e, names[0])`, 09:174).

### 3.3 LRU, `trim`, `retire`, `liveMax` (09:197-216)

```js
function ensure(id) {             // live entry for id (builds it), marked most recently used
  let e = live.get(id);
  if (e) { live.delete(id); live.set(id, e); return e; }
  e = build(id); live.set(id, e); upload(e); prime(e); trim();
  return e;
}
```

- `trim()` walks oldest-first while `live.size > world.liveMax` and retires every entry that is neither `cur` nor
  `splitE`.
- `retire(e)` despawns every actor in that set (their rigs return to the pool), resolves the pending env promise,
  **disposes every geometry** in its scene, and removes it from `live`. Materials and textures are **not** disposed,
  because they live in ART's caches, so their compiled programs survive.
- `world.liveMax` defaults to `2`. Rue's epilogue raises it to 3 so its match cuts are cuts and not loads (35:269), and
  restores it on leaving (35:78).

**Gotcha: `trim` runs inside `ensure`, before the new set becomes `cur`.** With `liveMax = 2`, `live = [A(cur), B]`
and `preload(C)`, the result is `[A, B, C]`, so `B` is retired at once. During a split (`cur` and `splitE` are both
protected), preloading a third set with `liveMax = 2` builds it, uploads it and **retires it immediately**. Raise
`liveMax` before preloading.

### 3.4 Uploading: `upload`, `prime`, `warm`

| Function | Line | What it does |
| --- | --- | --- |
| `upload(e)` | 09:187 | `renderer.compile(scene, camera)`, then `renderer.initTexture` for every texture slot (`map, emissiveMap, alphaMap, lightMap, aoMap, bumpMap, normalMap, specularMap`) and every texture uniform |
| `prime(e)` | 09:189-196 | Makes **everything** visible and un-culled, renders the scene into a **1×1 scissor**, then restores visibility and culling. Every buffer uploads inside the build's (faded) frame, not when a prop first appears |
| `world.warm(id)` | 09:1207-1220 | Boot only (one loader job per `SETS` key, 36:95). Builds the set (or reuses the live one), un-hides everything, adds a blob shadow (to compile its program), aims the main camera at the bounds, `upload`s, renders once under the loader, re-hides, and **disposes the geometry if the set was not live**. Sets `snap = true` and `lastLW = 0` |

Programs are cached by three.js per shader key. Materials come from the `mat()` cache and textures from the
`canvasTex(…, {key})` cache. So a later rebuild reuses the programs warm compiled, and only rebuilds and re-uploads
geometry. **Any material or texture a set creates outside those caches, or creates only on some builds, can compile
mid-game.** The boot loop warns in autoplay with `'shader compiled mid-game in <scene> step <i> (<cam.name>)'`
(36:43-46).

### 3.5 Material twins (09:121-134)

When one material is shared by meshes of different "variants" (plain `1`, instanced `2`, instanced with
`instanceColor` `4`, skinned `8`), three.js re-picks the program at every switch, every frame. `twins(group)` gives each
**instanced** user of a multi-variant material a cached clone (`TW: Map<material, {variant: clone}>`).

- **Gotcha:** after `twins`, an `InstancedMesh`'s `.material` may be a clone. Animating the original material (for
  example `M.tube.emissiveIntensity`) does **not** change the instanced copy. Give animated materials a unique `key`
  and use them on one kind of mesh only.
- Only `def.build()`'s group is twinned, at build time. Instanced meshes added later are not.

### 3.6 Public set API

| Call | Signature → return | Behaviour |
| --- | --- | --- |
| `world.load(id, o={})` | `async` → `Promise<void>` | `ensure(id)` (a **synchronous** build if not live); `o.env` → instant `envSet`; `showE` (`cur`, `world.set = def`, `world.setId`, gameplay camera re-cut, `snap`); `trim()`. **It does not set audio ambience.** The flow's `loadSet` does that (11:37-41) |
| `world.preload(id)` | → `Promise.resolve()` | `ensure(id)` now. **A synchronous CPU hitch: call it only under black** |
| `world.show(id)` | → `undefined` | `ensure` + `showE` + `trim`. Like `load`, but with no env option |
| `world.warm(id)` | → `undefined` | §3.4 (boot) |
| `world.adopt(look, rig)` | → `undefined` | Pushes a pre-built rig into `pool[look]`. Boot builds **one** rig per `LOOKS` key for the portraits and adopts it (36:91) |
| `world.set` / `world.setId` | fields | The current def and id. `world.set.ambience` is read by the flow |
| `world.scene` | getter | `cur.scene` or `null` |
| `world.liveMax` | field | 2 |

Content may add temporary objects to `world.scene` (29:47). **Gotcha:** if that set is later retired and rebuilt, the
object is still parented to the *dead* scene. An `if (!obj.parent)` guard then never re-adds it. Test
`obj.parent !== world.scene` instead.

### 3.7 Environment presets

**Preset format** (one entry of `def.env`). Each key overrides only what it names; everything else is inherited from the
set's current env (09:34-42):

| Key | Format | Applies to |
| --- | --- | --- |
| `bg` | hex | `scene.background` |
| `fog` | `[color, density?]` | `FogExp2` colour and density |
| `hemi` | `[sky, ground?, intensity?]` | Hemisphere light |
| `dir` | `[color, intensity?, [x,y,z]?]` | Directional light colour, intensity, position |
| `spot` | `[color, intensity?]` | Torch colour and intensity. **If absent, the spot is left untouched** (`o.sp = !!p.spot`) |
| `rain` | `0..1` | `rain.uniforms.uAmount`; the rain is visible above 0.01 |

If a named preset has no `rain` key, the amount comes from `rainFor` (09:33): `0` for a preset named `'sun'`, else `1` if
`ambience.rain` is truthy or the name contains `rain`, else `0`. An **object** preset (not a name) keeps the current rain.

Defaults before any preset (09:26-27): bg/fog `0x808080`, density 0.01, hemi white/`0x444444` at 1, dir white at 1 from
`(5,10,5)`, spot off.

**`envSet(e, p, dur = 0)`** (09:56-66), exposed as `world.env(p, dur = 0, setId)` (09:1221):

- `p` is a preset name or a preset object. An unknown name logs `world.env: no preset X in <set>` and resolves.
- `setId` targets another **live** set (for example, dressing the next set before cutting to it, 29:110). A set that is
  not live is silently ignored.
- A name updates `e.envName` and `e.ctx.env` (what `def.update` sees). An object does not.
- `dur ≤ 0` or skipping applies the preset instantly. Otherwise it lerps every value with smoothstep (`envLerp`, colours
  via `lerpColors`, `sp` switching to the target's at once) and resolves at the end. A new `envSet` resolves the
  previous promise and lerps on from wherever the env is now.
- When the lerp ends (`envEnd`), and rain flipped between on and off on the current set, it re-sends audio ambience:
  `AUDIO.ambience({rain, loops: ambience.loops})` and `AUDIO.setRoom(ambience.room || 'none')`.
- The flow's `{env: name, dur}` step (11:180) **does not await** the lerp.

### 3.8 The fixed light rig and the torch

Each set has exactly one hemisphere, one directional and one spot light (TWO §14 asks for the same). The spot is the
**torch**:

- `world.torch` is `cur.spot` (or `null`). Content turns it on by setting `.intensity`, `.color`, `.angle` and
  `.penumbra` (25:117-124, 28:307-319).
- `torchTick` (09:542-548) runs while `world.torchAuto` (default `true`), `spot.intensity > 0`, no JARVIS shot owns the
  spot, and the player actor is in this set. It puts the spot at the player's right hand (0.3 m forward, 0.18 m right,
  1.25 m up) and aims it 7 m ahead at 0.1 m height.
- To place it by hand (a lamp, a screen, an alarm beacon): set `world.torchAuto = false`, then position
  `torch.position` and `torch.target.position`. **`torchAuto` is global, not per set. Always restore it** (Rue does so
  at 25:123 and 28:319).
- JARVIS shots borrow the spot and restore it on the next shot or release (§9.2).
- Never add lights. More "lamps" means emissive materials plus baked vertex colour.

### 3.9 `world.puff(where, o = {})` (09:1243-1260)

Pooled smoke or sparks. Each set has one 64-particle `Points` with a shared radial-gradient `PointsMaterial` (size 0.22,
vertex colours, no depth write). It is created at build, so its program is warmed.

| Option | Default | Meaning |
| --- | --- | --- |
| `where` | — | A prop name (its world position), or any place (§4.12) |
| `n` | 14 | Particles, taken from a ring buffer (the oldest are overwritten) |
| `color` | `0xb8b8b8` | Hex. Sparks: `{color: 0xffd060, gravity: 6}` |
| `speed` | 0.6 | m/s. The direction is random, biased upward |
| `life` | 1.2 | Seconds ×(0.7–1.3). Alpha fades with life |
| `gravity` | −0.5 | Negative values rise |

It is a no-op while skipping and when there is no current set. There is no size option. The kettle hotspot uses
`{n:16, speed:0.25, life:1.8, color:0xf2f2f2}` (11:309).

---

## 4. The SET contract

`SETS[id]` is an object. The engine reads exactly these fields:

| Field | Read by | Required | Meaning |
| --- | --- | --- | --- |
| `build()` | `build` / `warm` | **yes** | Returns a `THREE.Group`. It runs at boot (warm) and on **every** rebuild after retirement, so it must be re-entrant |
| `env` | `envSet`, `build`, `timelapse` | recommended | `{name: preset}`. **The first key is applied at build** |
| `marks` | `resolveWhere`, framing | recommended | `{name: [x, y, z, rotY]}` |
| `anchors` | framing, INSERT/JARVIS/POV, `resolveWhere` | recommended | `{name: {at, from?, fov?} \| [x,y,z]}` |
| `cams` | gameplay camera, `SET` shots, fallbacks | recommended | `{name: camDef}`. **The first key is the default** (`firstCam`) |
| `zones` | gameplay camera, framing (`fitZones`, zone fallback), rain box | recommended | `[{box:[x0,z0,x1,z1], cam}]`. The first match wins |
| `colliders` | player `collide`, framing `blocked` | recommended | `[[x0,z0,x1,z1], …]`, read live every tick |
| `floor(x, z)` | player, follower, `moveTo` | optional | → ground height. Must be cheap and allocation-free |
| `update(dt, ctx)` | `setTick` | optional | Per tick while the set is `cur` or `splitE` |
| `ambience` | flow `loadSet`, `envEnd`, rain | optional | `{rain: bool \| {box, top, bottom, count}, loops: [names], room}` |
| `props` | **nobody** | doc only | A list of prop names for authors. The engine finds props by traversal |

Any other field is free for content (for example `square.puddles`, 06:994).

### 4.1 `marks`

A mark is `[x, y, z, rotY]`, with `y` usually 0 (the floor). Actors stand on them (`spawn`, `place`, `moveTo`), and the
framing helper can frame them (it aims 1.55 m above). Reddy: `counter_luka: [6.4, 0, -10.25, 0]`, and
`car_backseat: [-2.72, 0.16, 21.37, PI]` for a seated height (05:1064, 1060).

### 4.2 `anchors`

`{at, from, fov}`: `at` is the thing (screen, poster, prop), `from` is a good lens position for an INSERT of it, and
`fov` is its lens. Used by INSERT (lens = `from`, look = `at`), by JARVIS (lens = `from`, behind the screen), and by POV
`from: <anchor>`. They are also framing subjects (their facing is toward `from`) and places (`at`). Example (05:1079-1081):

```js
monitor:        { at: [6.4, 1.3, -9.03], from: [6.44, 1.36, -8.3], fov: 40 },   // from the customer side: JARVIS-CAM
monitor_screen: { at: [6.4, 1.3, -9.03], from: [6.4, 1.32, -9.72], fov: 32 },   // from the staff side: INSERT of the screen
```

Reddy also uses anchors as stored compositions: `crane_top`/`crane_end`, `pull_1…6`, `ots_chase` and
`corridor_wide`.

### 4.3 `cams`: gameplay cameras

| Field | Used by type | Meaning |
| --- | --- | --- |
| `type` | — | `'fixed'`, `'pan'`, `'rail'`, `'push'`. Only `rail`, `push` and `pan` (default limit) change the code path |
| `pos` | fixed, pan, push | Lens position |
| `look` | all | `[x,y,z]` = a static look-at. `'player'` (any non-array) = look at the player's head (pos + 1.2), damped |
| `base` | pan, rail | The rest direction the pan is clamped around. If missing, the player position at the cut is used |
| `limit` | pan, rail | ± radians the look may swing from `base` (yaw and pitch each). Default **0.5 for `pan`**, 0 otherwise (unclamped follow) |
| `from`, `to` | rail | Rail ends. The lens sits at the player's projection onto the segment (clamped), lerping Y |
| `to`, `dur` | push | The lens moves from `pos` to `to` over `dur` s (default 20, smoothstep) after **entering** the zone |
| `fov` | all | Default 45 |

| Behaviour | Fixed (array look) | Pan / fixed with `'player'` look | Rail | Push |
| --- | --- | --- | --- | --- |
| Lens | static | static | slides along the rail, damped `damp(5)` | timed glide |
| Look | static | follows the player, damped `damp(5)`, clamped to `±limit` around `base` | same as pan | same as pan (or static) |
| On cut | snap | snap; `base` captured | snap | timer reset to 0 |

Reddy (05:1137-1147):

```js
carpark:  { type: 'pan',  pos: [-9.6, 1.75, 22.9], base: [-1.0, 1.8, 3.0], look: 'player', fov: 42, limit: 0.6 },
corridor: { type: 'push', pos: [6.4, 1.95, -11.0], to: [6.4, 1.85, -15.0], look: 'player', fov: 44, dur: 25 },
backroom: { type: 'fixed', pos: [3.2, 2.1, -24.3], look: [6.8, 0.9, -28.6], fov: 55 },
// square (06:103): n_out: { type: 'rail', from: [-19.5, 4.6, 20], to: [19.5, 4.6, 20], look: 'player', base: [0, 4, 0], limit: 0.26, fov: 55 },
```

Avoid near-vertical gameplay cameras. The modern control's camera yaw becomes unstable straight down (§7.2).

### 4.4 `zones`

`[{box: [x0, z0, x1, z1], cam: 'name'}]`. The **first** box containing the player's XZ wins, so list small special
zones before big ones (reddy lists the staff door strip before `counter`, 05:1149-1163). Zones do several jobs:

1. The gameplay camera follows the player's zone (§8.2). **Outside every zone the previous camera stays**, and after a
   `release()` or a load it falls back to `firstCam`.
2. The framing helper keeps a computed lens **inside the zones** (pad 0.6 m) when the subject is inside them
   (`fitZones`, §9.4). The zones are the engine's only notion of "inside the building". If they don't tile a room,
   shots in it can put the lens outside the walls.
3. A WIDE group shot in a room too small for it falls back to the zone's own camera (§9.4).
4. The auto-made rain box (§3.2).

They do **not** restrict movement. Colliders do that.

### 4.5 `colliders`

Axis-aligned XZ rectangles with no height (09:452-472, 09:626-632).

- The **player only** is pushed out by radius `CONFIG.radius = 0.3` (two iterations; a centre inside a box exits
  through the nearest side). Scripted `moveTo` and the follower **ignore colliders**.
- The framing helper treats a lens **below 1.1 m** inside a collider (+8 cm) as blocked. It assumes colliders are
  furniture or walls that would fill a low lens.
- The array is read every tick, so **dynamic colliders** work by mutating a 4-element array in place. Reddy's browsing
  customers update theirs each tick and park them at `1e4` when hidden (05:933-935, 962, 1044).
- Walls must have thickness, and every edge of the walkable area must be closed. There is no world bound.

Reddy's `wall()` helper pushes its own collider. `car()` pushes one sized from its rotation, and the two traffic cars
built at the origin pop theirs again with `COL.length -= 2` (05:920).

### 4.6 `floor(x, z)`

This optional function returns the ground height. The player, the follower and `moveTo` (during and at the end of a
move) use it. `place()` does **not**: it keeps the `y` of the place it was given. Stairs and plinths are piecewise
functions (06:148-155, 07:1438-1446). It runs per tick per moving actor, so keep it to branches and arithmetic.

### 4.7 `update(dt, ctx)`

`setTick` (09:1128-1134) fills `ctx` and calls `def.update(dt, ctx)` for `cur` and `splitE` every tick, after actors and
before the camera. It then advances the rain's `uTime` and the puffs.

| `ctx` field | Value |
| --- | --- |
| `t` | `clock.t` (seconds of game time) |
| `player` | `player.actor` (an actor object or `null`) |
| `running` | `player.running` |
| `env` | The last env preset **name** applied to this set (`e.envName`) |
| `props` | The set's props map |

(ARCHITECTURE.md §4 writes `update(dt, t)`. The real signature is `update(dt, ctx)`, with `ctx.t`.) It must not allocate.
`def.update` is not called for preloaded sets that are not shown.

### 4.8 `ambience`

`{ rain: false | true | {box, top, bottom, count}, loops: ['aircon', 'fluoro'], room: 'room' }`. The flow passes it to
`AUDIO.ambience` and `AUDIO.setRoom` on every set load (11:37-41). `rain` also drives auto-rain (§3.2) and `rainFor`
(§3.7).

### 4.9 Props

A prop is any **named** `Object3D` under the build group. `world.prop(name)` (09:1235-1239) searches the current set
first, then every live set in LRU order, and returns `undefined` if absent. The flow's `{prop}` step warns
(`11:151-159`: `{prop, visible, pos:[x,y,z], rotY, fn(o)}`).

- The map is built by traversing the **build group** (not the scene) at build time. So it also holds incidental names
  inside the group, such as bones of rigs added in build, their `'blob'` shadows, and a set-provided `'rain'`. The
  engine's own puff and auto-made rain sit outside the group and are not in it. The first occurrence wins, so keep prop
  names unique.
- Interactive props expose their own API on `userData` (reddy: `door_sign.userData.set(open)` / `.flip()`,
  `monitor_screen.userData.show(mode)`, `calendar.userData.set(day, mon, wd)`, `car_black.userData.pullUp()`,
  `clock_hands.userData.set(h, m)`, and `backroom_door.userData.open = true`, which `update` eases).
- Sets that share prop names (TWO's `reddy26`/`reddy40`) are ambiguous when both are live. Use `cur`, unique names, or
  `world.scene.getObjectByName`.

### 4.10 Places ("where") and lookup order

`resolveWhere(w, out, e)` (09:224-237) turns any place into a position and an optional facing. It is used by `spawn`,
`place`, `moveTo`, `face`, `puff`, the POV `from` fallback and pan targets.

| `w` | Position | Facing (`rotY`) |
| --- | --- | --- |
| `null` / `undefined` | origin | — |
| `[x, z]` | `(x, 0, z)` | — |
| `[x, y, z]` | as given | — |
| `[x, y, z, rotY]` | as given | `rotY` |
| `Vector3` | copied | — |
| mark name | `[m0, m1‖0, m2]` | `m[3]` |
| actor id | that actor's `pos` | — |
| anchor name | `anchor.at`. **Its y is the prop's height, so `place(anchor)` floats the actor** | — |
| unknown | origin + `testLog('world: unknown place X')` | — |

**Lookup order differs by caller.** The same name can be both a mark and an anchor (reddy has both `kettle`, `bench`,
`keypad`, `aframe`, `office_door`, `noticeboard`). That lets an actor walk to the mark while the camera shoots the anchor:

| Caller | Order | Height used for a mark |
| --- | --- | --- |
| `resolveWhere` (stand, walk, face, puff) | mark → actor → anchor | `m[1]` |
| `pointOf` (pan targets, POV look) | actor (eyes) → anchor → mark | `m[1] + 1.3` (chest) |
| `addSubj` (framing subjects) | actor (eyes) → anchor → mark | `m[1] + 1.55` |

---

## 5. Worked example: `SETS.reddy` (05, 1178 lines)

TWO's sets should copy this structure. Reddy is one set holding a car park, a shop floor, a corridor, a backroom,
an office and a car.

### 5.1 File layout

| Lines | Section |
| --- | --- |
| 1-8 | **Header comment**: layout in metres, axes, where everything is ("the glass shopfront is the line z=0 facing +Z…"), and the draw-call policy |
| 9-16 | `SETS.reddy = (() => {`: palette constants, the tints `OUT`/`IN`/`BOH` (warm sun, cool fluoro, back of house), `COL` (colliders), `R` (live prop refs), scratch, build-time state `b, tint, XF, T, M, SUNM, CUST` |
| 18-63 | Geometry helpers (§5.2) |
| 65-163 | Canvas painters reused at runtime (`paintMonitor`, `paintTV`, `paintCal`) and the small drawing helpers `text`, `skull`, `jwin` |
| 164-348 | `textures()`: every painted texture, built once (`if (T) return T`) |
| 350-416 | Reusable little models: `phoneModel`, `aframeModel`, `chairModel` (static base + spinning `seat` child), `straightenerModel`, `mug`, `car` (static, with collider), `palm`, `tree`, `house` |
| 419-940 | `build()` |
| 943-974 | `dress(id)`: per-scene dressing |
| 977-1046 | `update(dt, ctx)`: ambient life, no allocation |
| 1049-1177 | Data: `env`, `marks`, `anchors`, `cams`, `zones`, `colliders: COL`, `props`, `ambience`, `update` |

### 5.2 Geometry helpers (into the current Builder `b`)

Every helper ends in `put()`. It applies the current transform `XF`, writes a vertex colour of `hex × tint` to every
vertex, and adds the geometry to `b` with material `m || M.vc` (05:19-26). `M.vc = mat(0xffffff)` is one vertex-coloured
Lambert, so **all plain static geometry is one draw call**. `Builder.done()` then merges per material and **bakes light
into the vertex colours** (04:93-114, `bakeLight` 04:49-65).

| Helper | Signature | Notes |
| --- | --- | --- |
| `put` | `(g, hex, m?)` | As above |
| `box` | `(w, h, d, hex, x, y, z, ry = 0, m?)` | **`y` is the bottom** |
| `bb` | `(x0, y0, z0, x1, y1, z1, hex, m?)` | Min/max corners, axis-aligned. The workhorse |
| `boxR` | `(w, h, d, hex, x, y, z, rx = 0, ry = 0, rz = 0, m?)` | **Centred**. Rotation order: X, then Z, then Y |
| `cyl` | `(rt, rb, h, seg, hex, x, y, z, rx = 0, rz = 0, m?)` | Centred |
| `ico` | `(r, hex, x, y, z, sy = 1, m?)` | Detail-0 icosahedron (bushes, heads, pumpkins), `sy` squash |
| `quad` | `(w, h, m, x, y, z, ry = 0, rx = 0, hex = 0xffffff)` | A plane facing +Z before rotation (rx first, then ry): floor `rx = -H`, ceiling `rx = H`, a wall facing −X `ry = -H`. **The material comes before the position** |
| `label` | `(w, h, row, x, y, z, ry = 0, m = M.atlas)` | One row (0..7) of the 8-row label atlas, done by remapping V (05:42-46) |
| `wall` | `(x0, z0, x1, z1, h, hex)` | `bb` from the floor to `h`, **plus a collider** |
| `part` | `(name, fn, pos?, ry = 0, o?)` | Runs `fn` into a **fresh Builder** (`XF` cleared), then `b.done(o)` gives a Group named `name` at `pos` with `rotation.y = ry`. Coordinates inside `fn` are local. `o = {floor: false}` turns off the floor AO for props not standing on y = 0. Restores the outer `b`/`XF` |
| `at` | `(x, z, ry = 0)` | `XF = m4.makeRotationY(ry).setPosition(x, 0, z)`: every following `put` is placed by it. **Reset with `XF = null`.** `m4` is shared, so `at` does not nest |
| `seg` | `(y0, z0, y1, z1, r, hex)` | A square cable segment in the local YZ plane (tethers) |

```js
function wall(x0, z0, x1, z1, h, hex) { bb(x0, 0, z0, x1, h, z1, hex); COL.push([x0, z0, x1, z1]); }      // 05:47
function part(name, fn, pos, ry = 0, o) {                                                                    // 05:49-57
  const pb = b, px = XF; b = new Builder(); XF = null;
  fn();
  const g = b.done(o); b = pb; XF = px;
  if (name) g.name = name;
  if (pos) g.position.set(pos[0], pos[1], pos[2]);
  g.rotation.y = ry;
  return g;
}
```

### 5.3 Textures, atlases and materials

- Every texture is a `canvasTex(w, h, paint, {key: 'reddy_<name>'})` of **128–256 px**. The `key` caches it across
  rebuilds and makes boot warm-up count. Tiling textures pass `repeat: [x, y]` (`floor` `[32, 24]`, `asphalt`
  `[20, 6]`, `slat` `[8, 2]`).
- `text(c, s, x, y, px, col, al = 'center', w = 'bold', maxW)` uses a font stack with Linux fallbacks
  (`Arial, "Liberation Sans", "DejaVu Sans"`, 05:66-69). Randomised paint uses a seeded LCG
  (`seed = N; rnd()`, 05:71) so it repaints identically.
- **Label atlas** (05:294-303): a 256×256 canvas with 8 rows of 32 px, each a sign (`STAFF ONLY`, `LOST PROPERTY`,
  `THE LATEST`, `BAKERY`, `PHARMACY`, `FOR LEASE`, `NOW SERVING 000`, `CUSTOMER PARKING`). Every sign is one
  `label()` quad on one material, so it is one draw call. `M.atlasLit` (the same texture, emissive) serves backlit
  signs. The posters texture works the same way with two poster halves (U 0–0.5 / 0.5–1, 05:602).
- **Runtime-repainted screens**: the texture is painted by a function that can run again. A prop exposes
  `userData.show(mode)`, which repaints the same canvas and sets `needsUpdate` (monitor 05:785, TV 05:840, calendar
  05:793). No new textures are made at runtime.
- **Materials** (05:422-447) are all `mat()`/`matTex()`, so they are cached. Paper uses
  `{emissive: 0xffffff, emissiveIntensity: 0.28}`, screens `{emissive: 0xffffff}`, and glass
  `{transparent, opacity 0.16, DoubleSide}`. `M.tube` has a unique `key` because `update` animates its intensity
  (05:431, 1016). The sun discs are `MeshBasicMaterial({fog:false})` cached in `SUNM ||=` (05:925).

### 5.4 `build()` order (05:419-940)

1. `COL.length = 0; T = textures();` then a new `root` group and `R.root = root`, the `M` materials, and
   `b = new Builder(); XF = null`.
2. Static geometry by area, each with its own `tint`: outside (`OUT`), shop floor (`IN`), back of house (`BOH`).
   `wall()`/`COL.push` sit beside the geometry they bound.
3. `root.add(b.done())`: **one mesh per material for all static geometry**.
4. **Props**: `const P = (g) => (root.add(g), g);` then `R.x = P(part('name', () => {…}, [x, y, z], ry, {floor:false}))`.
   Nested parts make hinged or flipping sub-objects (door sign children, chair seat, car door). Prop APIs go on
   `userData`.
5. Special objects: `R.rain = P(makeRain({box, top, count}))` named `rain` (the engine adopts it, §3.2), a sun group, and
   two traffic cars.
6. **Ambient extras** (05:931-935): two browsing customers are real rigs (`buildCharacter`) built **once**
   (`CUST ||= …`). They are re-parented to each new root and posed directly by `update`. They are **not actors**, so
   they are not in `world.actors`, the framing ignores them, doors don't open for them, and they cost no rig-pool entry.
   Each has a live collider.
7. `dress(state.scene)` and `return root`.

### 5.5 `dress(id)` and `update(dt, ctx)`

`dress` (05:943-974) makes the set right for a scene. It computes `n = SCENE_ORDER.indexOf(id)` with helpers
`from(s)` (on or after scene `s`) and `during(a, z)`, then sets visibility, repaints screens and the calendar, and sets
the clock from `SCENES[id].time`. `update` calls it whenever `state.scene` changes (05:987). It also reacts to
`ctx.env` changes (rain shows streaks and hides the sun and shimmer).

`update` (05:984-1046) is the model for allocation-free ambient life:

- **Automatic doors**: `world.actors.forEach(nearDoor)` uses a hoisted function, so no closure is allocated. The doors
  open for any visible actor in this scene within ~2.3 m, **except the player while roaming** (the JARVIS door joke).
  They ease with smoothstep.
- The door sign flips (swapping faces at the half turn). Hinged doors ease toward `userData.open` (only once content
  set it). Swivel chairs coast (`userData.spin`, rad/s, decaying).
- The flickering tube: `M.tube.emissiveIntensity` driven by a sine burst (`userData.off` forces it dark).
- The clock hands advance from `R.clockMin`. Spinners rotate. Texture offsets scroll (`T.shim`, `T.streak`).
- `car_black.userData.pullUp()` drives the car in over 5 s with an ease-out. Traffic loops on the road.
- Customers: a tiny state machine (walk a step along the display, point, look down, phone) that calls
  `rig.pose(anim, t, WALKP)` and `rig.update(dt)`, and writes its collider.

### 5.6 Data blocks (05:1049-1177)

```js
env: {
  day:       { bg: 0x6ab8f6, fog: [0xf4d09a, 0.013], hemi: [0xeef4ff, 0xb09068, 1.1], dir: [0xfff0dc, 1.6, [3, 14, 4]], rain: 0 },
  halloween: { … },
  rain:      { bg: 0x8b96a1, fog: [0x959fa9, 0.022], hemi: [0xdde4ec, 0x56606a, 1.05], dir: [0xc8d4e0, 0.5, [4, 12, 6]], rain: 1 },
},
marks:   { carpark_start: [-2.0, 0, 20.5, PI], counter_luka: [6.4, 0, -10.25, 0], /* ~60 */ },
anchors: { monitor: {…}, display_wall: { at: [-2.0, 1.3, -14.2], from: [-2.0, 1.62, -5.0], fov: 30 }, /* ~55 */ },
cams:    { carpark: {…pan}, …, corridor: {…push}, backroom: {…fixed}, backroom_rev: {…pan} },   // first = default
zones:   [{ box: [2.6, -12.5, 11, -9.45], cam: 'staff' }, …, { box: [-17, 8, 17, 25], cam: 'carpark' }],
colliders: COL, props: [ … doc … ], ambience: { rain: false, loops: ['aircon', 'fluoro'], room: 'room' }, update,
```

### 5.7 A TWO set skeleton in reddy's style

```js
// ============================================================ SET: flat — Chase (2040)'s flat
// Layout (metres, Y up): front door at z=0 facing +Z; kitchen x -4..0; balcony z -6..-8 …
// Marks: … Anchors: … Cams: … Props: …
SETS.flat = (() => {
  const PI = Math.PI, H = PI / 2;
  const COL = [], R = {};
  const tc = new THREE.Color(), m4 = new THREE.Matrix4(), v = new THREE.Vector3();   // scratch for update()
  let b = null, tint = [1, 1, 1], XF = null, T = null, M = null;
  /* put, box, bb, boxR, cyl, ico, quad, label, wall, part, at, seg: copy 05:19-63 verbatim */
  function textures() { if (T) return T; T = {}; T.atlas = canvasTex(256, 256, (c, w) => { /* 8 rows */ }, { key: 'flat_atlas' }); return T; }
  function build() {
    COL.length = 0; T = textures();
    const root = new THREE.Group(); R.root = root;
    M = { vc: mat(0xffffff), atlas: matTex(T.atlas) /* … all via mat()/matTex() */ };
    b = new Builder(); XF = null;
    /* static geometry … wall(…) … */
    root.add(b.done());
    const P = (g) => (root.add(g), g);
    R.door = P(part('flat_door', () => { bb(0, 0, -0.025, 0.9, 2.05, 0.025, 0xc8b89a); }, [1.2, 0, 0]));
    return root;
  }
  function update(dt, ctx) { if (!R.root) return; /* no allocation: scratch only */ }
  return {
    env: { day: { … }, night: { … } },          // first = default
    build, marks: { … }, anchors: { … }, cams: { … }, zones: [ … ], colliders: COL,
    props: ['flat_door' /* … */], ambience: { loops: ['fridge'], room: 'room' }, update,
  };
})();
```

---

## 6. Actors

### 6.1 Spawning, pooling, lookup

| Call | Behaviour |
| --- | --- |
| `world.spawn(id, where, o = {})` → actor | `o.set` → `ensure(o.set)` (it **builds** if not live; used for the split's right half, 11:137), else the current set. It **throws** `'RUE: world.spawn before world.load'` if there is no set. `look = o.look ‖ id`. If the actor exists with a different look, it is despawned first. A new actor takes a rig from `pool[look]`, else **builds one** (`buildCharacter(look)`, a CPU hitch plus first-render upload). Its expression is `LOOKS[look].expr ‖ 'neutral'`. Then: moved into the set's scene if needed, made visible, anim reset to `idle`, any `play` promise resolved, `place(where)` |
| `world.despawn(id)` | Drops a held prop (sends it home), stops the move, resolves `play`, `rig.talk(false)`, removes it from the scene and maps, clears `player.actor`/`player.fol` if they pointed at it, `rig.seated = false`, rig back to `pool[look]` |
| `world.actor(id)` | The actor object or `undefined` |
| `world.actors` | `Map<id, actor>` (live) |

- **Re-spawning an existing actor** keeps its expression, `mood`, `habit`, `walkAnim`, held prop and **`rig.seated`**.
  `idle` is an "upper" anim, so a seated rig stays seated. Unsit by hand:
  `a.rig.seated = false; a.play('idle')` (28:92).
- **Pooled rigs keep their state**: attachment visibility, scales and face overrides survive despawn. Content that
  changes them must restore them (35:68-80).
- Boot adopts **one** rig per look. A second simultaneous actor with the same look builds a rig mid-game.
- The flow's `placeParty` uses `spawn` (not `place`) so the party moves across sets through doors (11:314-319).

### 6.2 The actor object (09:255-264)

| Field | Meaning |
| --- | --- |
| `id`, `look`, `rig`, `root`, `set` | `root = rig.root`. `set` is the live entry it is in |
| `pos` | **`root.position` itself** (the tick position). Writing it teleports without resetting `prev`, which smears for one frame. Use `place` |
| `rotY` | Logical heading. `root.rotation.y` is written in render (interpolated) and by `place` |
| `anim` | The current anim name. `poseName`/`poseT` are what is posed |
| `expr` | The last `setExpr` |
| `visible` | Property → `root.visible` |
| `held`, `heldBig`, `carry` | The held object, whether it is big, and its name (or `true`) |
| `mood` | `null` \| `'anxious'` (§6.4) |
| `habit` | `null` \| `'glance'` (§6.4) |
| `glanceAt` | The actor id the habit glances at (default `'chase'`) |
| `walkAnim` | The loco anim for walking (default `'walk'`, `'swagger'` for look `rue19`) |
| `follow` | The leader's id when this actor is the follower (informational) |
| `p` | Pose params passed to `ANIMS`: `{dur, speed, walk, still, yaw, h}`. `p.sit` is also honoured by ART |
| `shadow` | The blob mesh (added if the rig has none) |
| `prev`, `prevRot`, `keep` | Interpolation state (§13) |

### 6.3 Methods

**`a.place(where)`** (09:268-274): stops any move/face (resolving them), writes `pos` from `resolveWhere` (§4.10),
takes `rotY` if the place has one, syncs `prev`/`prevRot`/`root.rotation.y` (no smear), and resets the follower trail if
this is the player or follower. **It ignores `def.floor`.** Rue stops an actor with `a.place(a.pos)` (20:182).

**`a.moveTo(where, o = {})` → Promise** (09:275-298)

| Option | Default | Meaning |
| --- | --- | --- |
| `run` | false | Run speed + `run` anim |
| `speed` | `CONFIG.walk` 1.7 (`carry` 1.0 when `heldBig`, `run` 3.4 with `run`) | m/s |
| `face` | the place's facing | `false` keeps the travel heading on arrival |

- Target an **actor** and the actor walks up to it, stops **0.9 m** short and faces it. Target an **anchor** and it stops
  **0.6 m** short and faces it. Both keep the walker's own y.
- The path is a straight line: **no pathfinding, no colliders**. The heading turns toward travel at a rate of 10/s. Y
  interpolates from start to target by progress, then `floor()` overrides it.
- Anim: if the current anim is an "upper" anim (not `idle`, not a one-shot, e.g. `phone`, `reading`), it keeps playing
  with walking legs (`p.walk = true`). Otherwise the loco anim is `carry` (heldBig), `run`, or `walkAnim`.
  `p.speed` = speed/base speed.
- On arrival, a LOCO anim returns to `idle`, then a 0.3 s smooth turn to `face` runs, and the promise resolves after it.
  With no facing it resolves at once.
- Skipping, or a distance under 2 cm, teleports to the target (with `floor`), faces, and resolves.
- AI chasing pattern: re-issue `moveTo(targetId, {run})` every 0.25–0.3 s (20:126, 205). Each call resolves the last.

**`a.face(target, dur = 0.3)` → Promise** (09:299-307): `target` is an absolute `rotY` (number) or any place. It
takes the shortest arc with smoothstep. A target within 1 cm, `dur ≤ 0`, or skipping is instant. While idle, a
turn larger than 0.4 rad (not seated) shows the `turn` stepping anim (`poseOf`, 09:360-366).

**`a.play(anim, o = {})` → Promise** (09:308-321)

| Option | Meaning |
| --- | --- |
| `dur` | Seconds. For a looping anim the promise resolves after `dur` but **the anim keeps playing**. For a one-shot it overrides the default length (and is passed to ANIMS as `p.dur`) |
| `loop: false` | Treat any anim as a one-shot: play it for `dur` (default **1.2 s**), then return |
| `speed` | `p.speed` (default 1) |
| `still` | `p.still` (lanyard fidget without the swing) |
| `h` | `p.h`, seat or saddle height in metres. **It persists** on the actor |
| `yaw` | `p.yaw`, the glance angle. **It persists** |

- **One-shots** (`ONE`, 09:220): `nod 0.9, shake 1, shrug 1.2, give 1.4, lanyard_on 2, knock 1.2, glance 1.3, stand 1`
  (seconds). They return automatically to the **previous** anim. A one-shot played over `sit`, `phone` or `type`
  returns there. One played over a loco anim or another one-shot returns to `idle` (or to that one-shot's own return
  target). `stand` always returns to `idle`.
- `play` restarts the anim even if it is the same (`poseT = 0`). ART blends from the previous pose over 0.2 s.
- `sit` sets `rig.seated` (ART). "Upper" anims (04:1411: `idle phone type point hands_head head_hands lanyard nod shake
  shrug laugh cry wave pour drink carry_mug look_up look_down write give lanyard_on hug knock fake_call chew tap clap wipe
  umbrella reading glance whistle`) keep the seated lower body. Walking (`gait`) and `stand` clear it.
- Skipping sets the final anim (the return target for one-shots) and resolves.

**`a.hold(obj, hand = 'R')`** (09:322-340): first sends any held object back to its **home** (the parent, position and
quaternion recorded at first pickup). `obj` may be a prop name (`world.prop`, so any live set), an `Object3D`, or `null`
(just drop). The object is measured at the origin. If its largest dimension is **over 0.45 m** (`heldBig`) it is
parented to the actor root at chest height in front (`(0, 1.0, 0.45)`, centred), the player's `speedMul` drops to 0.6,
and loco becomes `carry`. Otherwise it goes to `rig.attach['grip' + hand]` (or `parts['hand' + hand]`), centred. Flow
step: `{hold: 'luka', prop: 'mug', hand: 'L'}`. `{hold: 'luka'}` drops (11:139).

**Other methods:** `a.setExpr(name)` → `rig.face.set(name)`. `a.eyePos(v)` / `a.headPos(v)` → `v` (world position;
forces `updateMatrixWorld(true)`, uses the last rendered pose).

### 6.4 Behaviour properties (plain fields, write directly)

| Property | Effect | Rue usage |
| --- | --- | --- |
| `mood = 'anxious'` | While `idle`, poses `lanyard` (the fidget) instead | `{do: (c) => { const a = c.world.actor('luka'); if (a) a.mood = 'anxious'; }}` (23:297) |
| `habit = 'glance'` | While idle, not moving and not playing, glances every 3–7 s at `glanceAt` if that actor is in the same set (head yaw clamped ±1.3 rad, a 1.3 s `glance`). Also glances when he **starts talking** (`world.talk`) | Luka in 1987 (27:20) |
| `glanceAt = 'id'` | The habit's target | default `'chase'` |
| `walkAnim = 'name'` | Used by `moveTo`, the player and the follower. **Must be in `LOCO`** (`walk run carry swagger turn`, 09:221) to return to `idle` on arrival or stop. Rue's `book_walk` is reset by hand (19:126) | `'carry'` (25:113), `'book_walk'` |

A content-side head turn without moving the feet, used throughout Rue (28:93-98):
`a.play('glance', { yaw: clampedRelativeAngle, dur })`.

### 6.5 `world.talk(id, on)` (09:1225-1234)

The UI calls it per line (10:215). It sets `rig.talk(on)` (mouth flaps, ART). On `on`, an idle actor with
`habit 'glance'` glances first. If there is no actor `id` but `CHARACTERS[id].voice.also` exists (a combined speaker
like `luka_chase`), every `_`-separated part that is an actor talks.

### 6.6 `actorTick` (09:367-400)

In order: the scripted move step, the face turn, the `playT` countdown (one-shots go back to `ret`), the habit glance,
the pose name/time bookkeeping (`poseOf`), and `rig.update(dt)` (blink, mouth flap). **Posing happens in `render`**, once
per frame, at interpolated time (§13).

---

## 7. Player, collision, follower

### 7.1 `player` (09:435-451)

| Member | Meaning |
| --- | --- |
| `player.actor` | The controlled actor (or `null`) |
| `player.enabled` | Master switch. The flow sets it `false` in cutscenes and busy runs, and `true` while roaming |
| `player.control(id)` | Takes control. The previous actor's loco anim → idle. If `id` was the follower, the follower is cleared. `speedMul = heldBig ? 0.6 : 1`. Trail reset |
| `player.follower(id)` | Sets the **single** follower (or `null`). `fol.follow = leader id`. Trail reset |
| `player.frozen(sec)` | Ignore input for `max(remaining, sec)` s (idle). Used for stumbles (20:111, 22:91) |
| `player.running` | `true` this tick if the player ran (read by `ctx.running` and the follower) |
| `player.speedMul` | 1, or 0.6 when carrying something big |
| `player.ctrlYaw` | The camera yaw used to map input |
| `player.fol` | The follower actor |

### 7.2 `playerTick` (09:473-506): modern vs tank, and the input lock across cuts

Nothing happens (except loco → idle, and `ctrlYaw` tracking the camera) when there is no actor, the player is disabled,
the actor is not in the current set, or **a scripted `moveTo` is running on it** (scripts win).

- **Modern** (`options.controls !== 'tank'`): `mag = min(1, |input.move|)`. Below 0.15 the stick counts as released,
  and **only then** is `ctrlYaw` re-read from the camera (`cs.look − cs.pos`). While held, the direction is the stick
  rotated by the **locked** `ctrlYaw`, so a zone cut never flips the player round (TWO §11):

  ```js
  if (mag < 0.15) { P.ctrlYaw = Math.atan2(cs.look.x - cs.pos.x, cs.look.z - cs.pos.z); mag = 0; }   // re-read the camera only while released (09:489)
  ```

  The heading turns toward the direction at 14/s. Speed = `(run ? 3.4 : 1.7) × speedMul × mag`, so it is analog.
- **Tank**: |x| > 0.2 turns at `CONFIG.turn` 3.2 rad/s (the `turn` anim when not moving). |y| > 0.2 moves along `rotY`:
  forward ×1, backward ×0.6, and never runs backward.
- Run = `input.run && !heldBig` (and not tank-backward). The anim is `carry`, `run` or `walkAnim`, with
  `p.speed = sp / base`.

### 7.3 `collide(a, x, z, e)` (09:452-472)

Two iterations: (1) each collider rectangle pushes the circle (r = 0.3) out, or out through the nearest side if the
centre is inside; (2) every other visible actor in the same set, **except the follower**, is a circle of combined radius
0.6. Then `y = floor(x, z)`. Only `playerTick` calls it, and it is not exported.

### 7.4 Follower breadcrumbs (09:432-434, 511-540)

A 128-entry `Float32Array` ring of the leader's positions, one crumb every 0.35 m of leader movement.

- Active when both actors exist, differ, are in the same set, the follower has no scripted move, and `player.enabled`.
- More than 8 m away and **off camera** (chest projected outside ±1.05 NDC): it teleports onto the trail about 1.5 m
  behind the leader (or 1.4 m directly behind if there is no trail).
- Within 1.3 m: idle. Otherwise it walks to the oldest crumb that is more than 0.3 m away (consuming crumbs). It runs if
  more than 3.5 m away or the leader runs, turns at 10/s, and applies `floor`. **No collision.**
- One follower only. `flow.follow` is a single id in Rue (11:509), and SWAP makes the previous actor follow (11:69-75).

---

## 8. Gameplay camera

### 8.1 Camera state (09:742-746)

| Object | Meaning |
| --- | --- |
| `cs` | The current camera `{pos, look, fov}` at this tick |
| `cp` | The previous tick's camera. Render interpolates `cp → cs` |
| `gs` | The gameplay target, computed **every tick, even during cutscenes** (so a release can blend into it) |
| `snap` | When set, `cp = cs`, so no frame is ever drawn between two shots |

`camTick` (09:1024-1036): `cp ← cs`. Then `gameTick` computes `gs`. Then, if a shot is active, `shotTick`. Else, if a
release is blending, `cs` is the smoothstep of the frozen start toward the live `gs`. Else `cs ← gs` (a zone change
sets `snap`).

### 8.2 `gameTick` (09:803-821): which camera

1. `override('follow')` with the player in the set → `followInto`.
2. `override('fixed')` → `opts.pos`, `opts.look` (array, or the player's head), `opts.fov ?? 45`. **Re-read every
   tick**, so mutating the same `opts.pos`/`opts.look` arrays in place moves it (no damping).
3. `override('set')` → the set cam `opts.name`.
4. Otherwise: the player's zone cam, else the **previous** cam (`G.name`), else `firstCam`, else `'(overview)'` (a WIDE
   high framing of all actors, or `(0,6,10)` looking at `(0,1,0)`).

A change of name is a **cut** (a snap, base capture, push timer reset). Set cams are evaluated by `setCamInto`
(09:756-793, §4.3). Damping uses `damp(5, dt)`.

`followInto` (09:794-802), options for `override('follow', o)`:

| Option | Default | Meaning |
| --- | --- | --- |
| `dist` | 2.4 | Metres behind the player (along `rotY`) |
| `height` | 1.7 | Lens height above the player's feet |
| `lag` | 0.35 (min 0.05) | Position damping `damp(1/lag)`, look damping `damp(1.5/lag)` |
| `look` | — | `'player'` looks at the head (1.35 m). Anything else looks 3 m ahead at 1.1 m |
| `fov` | 50 | |

Rue: Keep Up `{dist: 4.6, height: 2.3, lag: 0.45, fov: 55}` (20:24), Torchlight `{dist: 2.3, height: 2.05, lag: 0.3, fov: 55}` (22:17).

### 8.3 `cam.override(mode, opts = {})` (09:1055-1059)

`mode` is `'follow' | 'fixed' | 'set' | null`. A new mode, `'fixed'` or `'set'` forces a cut. `'follow'` → `'follow'`
with new opts eases to the new distance. `null` returns to zones (with a cut). An override persists until cleared;
`flow.start` clears it (11:553). It only changes `gs`, so during a cutscene it shows after `release` (which blends into
it). Scene step: `['cam', 'fixed', {pos, look, fov}]`, then `['cam', null]` (11:504; 25:169-178).

### 8.4 `cam.release(dur = 0.8)` → Promise and `cam.lock(on)`

`release` (09:1045-1054) ends a cutscene camera: it restores a borrowed JARVIS spot, sets `cam.cutscene = false`, clears
`lock`, re-cuts the gameplay camera (`G.name = ''`, `gameTick(0)`), then either snaps (skipping or `dur ≤ 0`) or blends
from the current camera into the live `gs` over `dur` with smoothstep. `playCutscene` calls it at the end of every
letterboxed cutscene (`0.8`, or `0` when skipped, 11:106). `flow.start` calls `release(0)`.

`lock(on)` (09:1044) freezes **cutscene** camera updates: `shotTick` returns at once, so there are no moves and no
reaim. The gameplay camera is unaffected. Stares (11:199-211) and time-lapses use it. `release` and `flow.stop` clear it.

---

## 9. Cutscene camera: `cam.shot(step)`

The flow calls `cam.shot(s)` for every step with a `shot` key, **and does nothing at all for shot steps while
skipping** (11:115-120). The step may also carry `card: [kind, data]` (an INSERT card, flow-handled).

### 9.1 Pipeline (09:911-963)

1. `endShotExtras()` restores a JARVIS-borrowed spot. A pending release is resolved and stopped.
2. `S.start ← cs` (the camera before the cut, used by `whip`).
3. `baseInto(S, step, cur)` computes the **base framing** `pos0/look0/fov0/up` (§9.2). On failure (no anchor, a named
   subject not found) the shot **holds the current angle** as a static `CAM`.
4. The move: `step.move` lower-cased, cut at its first non-letter (`'push in'` → `push`, `'PULL OUT'` → `pull`), else
   the shot name if it is a move (`PUSH…CRASH`). `CAM` with `to` becomes `glide`.
5. The move's parameters are set (§9.5). The duration is `dur ?? 3` (whip 0.2, crash 0.12). The ease is `EASE[ease]`
   or smoothstep.
6. `cam.cutscene = true`. If skipping (it can still be reached via `world.split`), the move jumps to its end
   (except `track`).
7. **Cut**: `cs ← pos0/look0/fov0` (except `whip`, which departs from the old camera), `snap = true`, and the first
   `shotTick(0)`.
8. JARVIS extras (§9.2). `cam.name = 'SHOT move on|at'`.

### 9.2 Shot kinds

`shot` is case-insensitive. Aliases (09:829): `TWO-SHOT→TWO`, `THREE-SHOT→THREE`, `TOP-DOWN→TOP`,
`JARVIS-CAM→JARVIS`, `LOW→MID` + `angle 'low'`, `HIGH→MID` + `angle 'high'`, and **`OTS→MID` with no shoulder**
(pass `side: 'ots:<id>'`). Move names as shots (`PUSH PULL TRACK PAN TILT CRANE ORBIT WHIP CRASH`) frame at
`step.size` (default MID). An unknown kind logs `cam: unknown shot X` and frames MID.

| Kind | Inputs | Base framing | Reaims | Default FOV |
| --- | --- | --- | --- | --- |
| `ECU` | `on` | Size shot (§9.4): dist **0.35**, aim eyes −0.03 | yes | `CONFIG.ecuFov` **30** |
| `CLOSE` | `on` | dist **0.9**, aim −0.08 | yes | **40** |
| `MID` | `on` | dist **1.8**, aim −0.35 | yes | 40 |
| `WIDE` | `on` (optional) | One subject dist **7**. A group is auto-fit (≥ 7 m, margin 1 m). Aim feet + 1.0, lens feet + 1.55 | yes | 40 |
| `TWO` | `on: [a, b]` | Auto-fit across the line (≥ 1.5 m, margin 0.6 m) unless `dist`. Aim −0.3 | yes | 40 |
| `THREE` | `on: [a, b, c]` | Same, aim −0.35 | yes | 40 |
| `TOP` | `on` | Lens **straight above** the aim (eyes) at `dist` (default **1.5**) + `height`. Screen-up = the subject's facing | **no** | 40 |
| `INSERT` | `at` (or `on`): anchor | lens `anchor.from` (or `at` + (0, 0.35, 0.6)), look `anchor.at`. `angle:'top'`: straight above at `dist ?? 0.7`, screen-up toward `from` | no | `fov ?? anchor.fov ?? 35` |
| `INSERT` | `at`: actor id | A high CLOSE at `dist ?? 0.8`, `fov ?? 35`, lowered 0.3 m (lens) and 0.35 m (look): hands/chest | no | 35 |
| `INSERT` | `at: [x,y,z]` | look = point, lens = `from` or point + (0, 0.3, 0.6) | no | `fov ?? 35` |
| `JARVIS` | `at`: screen anchor, `on`: faces | Lens = `anchor.from` (behind the screen), look = the faces' centre −5 cm, FOV widened to fit every face (`clamp(…, 20, 70)`). **Borrows the spot**: at the screen, aimed at the look, colour `0x7fb0ff`, intensity `2.5·max(0.3, d)^1.5`, angle 0.7. **Near plane pushed** just past the screen (`sd + 0.15`) when the screen is between lens and faces. `at` is required: `on` alone is looked up as an anchor and fails | no | `fov ?? anchor.fov ?? 40` |
| `POV` | `from`, `at` (or `on`) | Lens: from-actor's eyes + 6 cm forward, or an anchor's `from ?? at`, or any point. Look: `at` (actor eyes / anchor / mark chest / point), else 5 m ahead of the actor | no | `fov ?? 45` |
| `CAM` | `pos`, `look`, `fov`, `to: {pos?, look?, fov?}` | Explicit. With `to` it **glides** from `pos/look/fov` to `to` over `dur` | no | `fov ?? 40` |
| `SET` | `cam` | The set camera `cam`, evaluated **live every tick** (a pan follows the player), damped. Moves are ignored | — | cam's `fov ?? 45` |

**Reaim** (size kinds only, with at least one actor subject, and not `locked`, not TOP): with no move, the lens stays
put and the look follows the subject with `damp(2.5)`, "the operator keeps the subject framed" (09:1019).
`locked: true` makes the shot fully static (TWO's **LOCKED**).

For non-size kinds, `up` is set to the shot's horizontal view direction, so straight-down CAM/INSERT/POV views stay
stable (`aimCam` blends `up` only when the view is within ~22° of vertical, 09:1071-1076).

### 9.3 Every shot option

| Option | Used by | Meaning | Default |
| --- | --- | --- | --- |
| `shot` | all | Kind, alias or move name | `'MID'` |
| `size` | move-named shots | The framing size for `PUSH`…`CRASH` | `'MID'` |
| `on` | size kinds, moves, JARVIS (faces), INSERT/POV (target fallback) | Subjects (§9.4). Omitted = every visible actor in the set | all actors |
| `at` | INSERT, JARVIS (anchor), POV (look target) | Anchor name, actor id or `[x,y,z]` | — |
| `from` | POV (lens source), INSERT-at-point (lens), crane/orbit/pan/tilt (start value) | **Overloaded**: see the gotcha below | — |
| `to` | CAM (glide target), pan/tilt (target or degrees), crane (metres), orbit (degrees) | **Overloaded** | — |
| `cam` | SET | Set camera name | — |
| `pos`, `look` | CAM | `[x,y,z]` | — |
| `fov` | all | Vertical FOV in degrees. For **CRASH** it is also the zoom target | per kind |
| `dist` | size kinds; INSERT-on-actor; INSERT top | Lens distance (m). Turns off auto-fit for TWO/THREE/WIDE | `CONFIG.dist` |
| `height` | size kinds (incl. TOP, OTS) | Metres added to the lens Y (the look is unchanged) | 0 |
| `angle` | size kinds; INSERT | `'high'` (25° above the aim), `'low'` (20° below, never under feet + 0.15), `'side'` (profile, on whichever side the current camera is), `'top'` (= TOP) | eye level |
| `side` | size kinds; `track` | `'left'`/`'right'` (**the subject's** side, or the group line's), `'back'` (reverse), `'front'` (= default), `'ots:<actorId>'` | front |
| `offset` | size kinds | Shifts lens + look sideways (m). **Positive puts the subject frame-left**. Kept while reaiming and during moves | 0 |
| `facing` | size kinds | `true`: no across-the-line group logic, **no occlusion avoidance** | false |
| `locked` | size kinds | No reaim | false |
| `move` | all but SET | Move name (§9.5) | from `shot` |
| `dur` | moves | Seconds | 3 (whip 0.2, crash 0.12) |
| `ease` | moves | `'linear'`, `'in'`, `'out'`. Anything else is smoothstep | smoothstep |
| `amount` | push, pull, crane | §9.5 | 0.6 / 0.6 / 1 |
| `track` | track | `'alongside'`, `'behind'`, `'ahead'` | `'alongside'` |
| `card` | flow | `[kind, data]`: shows `CARDS[kind]` over the shot. The next shot without `card` hides it | — |

**Gotchas in option combinations:**

- `from` and `to` are read as **numbers** by crane, orbit, tilt, and pan-by-degrees. A POV (`from: 'luka'`) or
  INSERT-at-point (`from: [..]`) combined with those moves gives `NaN`. POV pans must use a **target** `to`, as Rue
  does: `{shot:'POV', from:'chase', at:'desk_phone', move:'pan', to:'radio', dur:6}` (28:327).
- `{shot:'CRASH', fov: 20}` sets **both** the base framing FOV and the zoom target to 20, so nothing zooms. Leave `fov`
  out (the target is half the base) or set `dist`.
- Never pass `move: 'glide'` by hand. It lerps to a stale `S.end` (only a `CAM` with `to` sets it).
- A move on a `SET` shot is ignored.

### 9.4 The framing helper (`frameInto`, 09:659-730)

It is used by every size kind, by `track` (per tick, with `facing: true`), by INSERT-on-actor and by the overview. It is
also exported as **`frame(subjects, size = 'MID', opts = {})`**, which frames in the current set and returns the
**shared** `F = {pos, look, fov, up}`. Copy the values out before calling again. It **raycasts**, so call it on cuts
only, never per frame.

1. **Subjects** (`gather`, max 8). An array whose first element is not a number is a list. Otherwise it is one subject.
   - actor id → its **eyes**, facing `rotY`, counted for the feet/eye averages
   - anchor → `at`, facing toward `from`
   - mark → `y + 1.55`, facing `m[3]`
   - `[x,y,z]` / `Vector3` → no facing
   - `null` → every visible actor in the set
2. **Aim** = the average point. With actors, `WIDE` uses feet + 1.0, others eyes + `DY[size]` (`ECU −0.03, CLOSE
   −0.08, MID −0.35, TWO −0.3, THREE −0.35, TOP 0`, default −0.3).
3. **Direction** `f` = the summed facing. For a **group** (unless `facing`), it is perpendicular to the line from the
   first to the last subject, on the side most of them face. When they face each other, the side is chosen so the
   **first subject is frame-left**. No facing at all → from the current camera, else +Z.
4. **`side: 'ots:<id>'`** (09:680-690): the lens is at that actor's eye level, 0.95 m behind them (away from the
   subject) and 0.38 m to camera-right (their right shoulder in frame-left), +0.06 m (+`height`). The look moves 12%
   toward the shoulder so the subject sits right of centre. FOV `fov ?? 40`. No occlusion test. Rue:
   `{shot:'MID', on:'chase', side:'ots:declan'}` (28:636).
5. **Lens direction** `d`: `back` = −f; `left`/`right` = the subject's left/right; `angle:'side'` = profile on the
   camera's side; else f.
6. **Distance** `D`: `dist`, else `CONFIG.dist[size]` (`ECU 0.35, CLOSE 0.9, MID 1.8, WIDE 7`, TOP 1.5). TWO, THREE and
   WIDE groups without `dist` are **auto-fit**: the smallest D (≥ 1.5, or ≥ 7 for WIDE) that fits every subject's
   lateral spread + margin inside the horizontal FOV at the **current aspect** (half width under a split).
7. **A clean frame** (`blocked`, 09:628-644; skipped for TOP and `facing`). The lens counts as blocked if:
   (a) it is under 1.1 m inside a collider, (b) a visible actor who is **not a subject** stands within 0.45 m of the
   lens–aim line, or (c) a raycast from lens to aim hits a set surface **facing the lens** (back faces, invisible
   objects, skinned meshes and transparent materials under 0.6 opacity don't count). Then it swings round the subject by
   ±35°, ±70°, ±90° (groups only ±35°/±70°). If nothing is clean, it keeps the intended angle and **pulls the lens in
   front of the occluding surface** (to ≥ 25% of the distance). A **group** in that situation (a WIDE, or any group
   whose pull would be below 30%) takes **the set's zone camera for where they stand** instead.
8. **Lens position** (`lensAt`): default at eye level (WIDE: feet + 1.55). `angle:'high'` 25° up, `'low'` 20° down. Then
   `+height`. TOP is straight up. Then `offset`.
9. **Stay inside** (`fitZones`): if the aim is inside the zones (±0.6) but the lens is not, move the lens in 10% steps
   toward the aim until it is. A WIDE group squeezed under 60% uses the zone camera.
10. **FOV**: if the lens was pulled in by factor `s < 1`, the FOV widens to show the same field
    (`2·atan(tan(fv/2)/s)`, max 75°).

### 9.5 Moves

| Move | Parameters | Behaviour per tick (09:964-1021) | `dur` |
| --- | --- | --- | --- |
| *(none)* | — | Static lens. If reaim, the look follows the subject (`damp 2.5`) | — |
| `push` | `amount` 0.6 | Lens = live aim + offset × lerp(1 → amount): ends at 60% of the distance. Look = the live aim | 3 |
| `pull` | `amount` 0.6 | Offset × lerp(1 → 1/amount): ends at 167% | 3 |
| `crane` | `from` 0, `to` 2 (metres added to lens Y), `amount` 1 (distance scale at the end) | The lens rises from `from` to `to` above the framing height (or falls if `to < from`) while the distance scales 1 → amount. The look stays on the aim | 3 |
| `orbit` | `from` 0, `to` 90 (degrees) | The lens circles the live aim at constant radius and height. Positive = counter-clockwise seen from above. Rue's "speeding up" orbit is `ease: 'in'` | 3 |
| `track` | `track` `alongside` (side `left`, or `right` with `side:'right'`), `behind`, `ahead` | **Reframes the subject every tick** from that side (`facing: true`, no raycasts). The position follows exactly, and only the angle change eases (`damp 3`). It **ignores `dur`** and runs until the next shot | — |
| `pan` | `to`: target (any place) **or** degrees (+ = right, default 30); `from` degrees start offset | Lens fixed. The look's yaw, pitch and length interpolate | 3 |
| `tilt` | `to` degrees (+ = up, default 25) or a target; `from` degrees start offset | Same, in pitch | 3 |
| `whip` | — | From the **previous** camera to this framing: lens lerp, yaw overshoot 0.16 rad·sin(πu), FOV breath +9°·sin(πu). Snaps exactly at the end | 0.2 |
| `crash` | `fov` target (default half the base FOV) | Lens fixed. FOV narrows with ease-out while the look slides onto the subject's CLOSE aim. Plays `sfx('sting')` unless skipping | 0.12 |
| `glide` | (automatic: `CAM` + `to`) | Lerp of `pos`, `look`, `fov` from start to `to` | 3 |

Every move except `track`, `whip`, `crash` and `glide` uses the **live** aim, so it follows a subject who moves. A move
holds its end state after `dur` until the next shot. `cam.shot` returns nothing, so follow it with `{wait: dur}` to
watch it.

### 9.6 Examples from Rue

```js
{ shot: 'CLOSE', on: 'luka', locked: true },                                                // LOCKED close (25:578)
{ shot: 'CLOSE', on: 'luka', move: 'push', amount: 0.75, dur: 7 },                         // slow push (28:251)
{ shot: 'TWO', on: ['luka', 'chase'], dist: 1.3 },                                          // tighter two-shot (27:558)
{ shot: 'MID', on: 'siobhan', side: 'ots:luka' },                                           // OTS (30:282)
{ shot: 'TOP', on: 'chase', dist: 1.5, offset: 0.25 },                                      // TOP-DOWN motif (24:24)
{ shot: 'CLOSE', on: 'luka', angle: 'low', dist: 1.1, locked: true },                       // LOW close (31:498)
{ shot: 'CRANE', size: 'MID', on: 'chase', angle: 'low', from: 0, to: 0.65, dur: 5 },       // 25:239
{ shot: 'ORBIT', size: 'MID', on: 'chase', dist: 2.4, height: 0.05, from: 25, to: -8, ease: 'in', … },   // idea engine (25:597)
{ shot: 'MID', on: 'luka', move: 'track', track: 'alongside', side: 'right', height: -0.12, dist: 1.7, offset: 0.5, dur: 60 },   // 30:696
{ shot: 'TILT', size: 'CLOSE', on: 'luka', to: -30, dur: 1.4 },                             // tilt down (25:271)
{ shot: 'WHIP', size: 'MID', on: 'luka' },  { shot: 'CRASH', size: 'MID', on: 'chase' },    // 25:175, 27:619
{ shot: 'JARVIS', at: 'monitor', on: ['luka', 'chase'], locked: true },                     // 24:376
{ shot: 'POV', from: 'rue19', at: [4, 1.5, 14.5], move: 'pan', to: [22.3, 1.3, 5.6], dur: 16 },   // 31:189
{ shot: 'INSERT', at: 'postit', card: ['postit', { text: 'JARVIS DOWN 8:52 — L.' }] },      // 23:307
{ shot: 'CAM', pos: [-2.0, 30, 30], look: [-2.0, 50, -20], fov: 50,
  to: { pos: [-3.2, 2.2, 22], look: [-2.0, 2.6, 1.0], fov: 45 }, dur: 7 },                  // crane down from the sky as a glide (23:273)
{ shot: 'SET', cam: 'corner_high' },                                                        // 23:173
```

Narrow screens: Rue widens explicit FOVs with a content helper and a getter, so the value is computed at shot time
(23:66, 23:288):

```js
const fit = (fov) => Math.min(80, Math.max(fov, 2 * Math.atan(Math.tan(fov * PI / 360) * 16 / 9 * innerHeight / innerWidth) * 180 / PI));
{ shot: 'CAM', pos: [5.5, 1.1, -12.2], look: [4.6, 1.35, -2.2], get fov() { return fit(50); } },
```

---

## 10. The `cam` object (09:1040-1068)

| Member | Meaning |
| --- | --- |
| `cam.shot(step)` | §9 |
| `cam.release(dur = 0.8)` → Promise | §8.4 |
| `cam.lock(on)` | §8.4 |
| `cam.override(mode, opts)` | §8.3 |
| `cam.cutscene` | `true` from a shot until release. The flow checks it before releasing |
| `cam.name` | The current shot description, or the gameplay cam name. Used in the mid-game-shader warning |
| `cam.camera` | The main `PerspectiveCamera` (fov 40, near 0.05, far 600). Also `world.camera` |
| `cam.project(v3)` → `{x, y, visible}` | Projects a world point with the last rendered camera into **CSS pixels** (left-half width under a split). Returns a **shared** object. `visible` = inside the frustum and on screen (10:425, 24:42) |

---

## 11. Split screen: `world.split(spec, o = {})` (09:1079-1095)

```js
{ spawn: 'luke', at: 'luke_phone', set: 'reddy' },                                          // an actor in the right-hand set (29:159)
{ split: { left: { set: 'square', shot: LEFT }, right: { set: 'reddy', shot: RIGHT } } },  // 29:162
…
{ split: null, slide: true },                                                               // the left half slides across to fill (29:176)
```

| `spec` | Meaning |
| --- | --- |
| `left.set` | Optional. If it differs from the current set, it becomes current (`ensure` + `showE`). **No ambience or env change** |
| `left.shot` / `left.cam` | Optional. An object goes to `cam.shot`. A string is `{shot:'SET', cam}`. If omitted, the current camera keeps playing on the left |
| `right.set` | **Required on every call** (`ensure(R.set)`; undefined throws `no SETS.undefined`) |
| `right.shot` / `right.cam` | Any shot step (`baseInto` into the set `SR`), or a cam name. Default `{shot:'WIDE'}` of the right set's actors. On failure: `(0,2,6)` looking at `(0,1,0)`, FOV 40 |

- The left half is the main camera, with full shot behaviour (moves, reaim) and an aspect of half the width. Fits use
  `aspectNow()`, which halves under a split.
- The **right half is a second camera, `camR`, posed once**. No moves, no reaim, no SET-cam follow. To recut the right
  half, call `world.split` again with `right: {set, shot}` and no `left`.
- Both sets tick: actors in `splitE` are updated and rendered, and `splitE`'s env and `def.update` run. A 2 px black
  divider separates the halves.
- `world.split(null)` ends it at once. `world.split(null, {slide: true})` widens the left half to full over 0.6 s
  (smoothstep), with nothing drawn on the right, and resolves when done. The flow passes the whole step as `o`
  (11:181) and does not await.
- `flow.start` calls `world.split(null)` (11:553).
- **Bug (confirmed): `camR.aspect` is only updated when the window size changes during a split** (09:1181). It starts
  at 1 (09:20), so the right half is horizontally distorted (≈13% at 1280×720) unless the window was resized
  mid-split. TWO should set `camR.aspect = (w − w/2 − 2)/h` inside `split()` before `updateProjectionMatrix()`.

---

## 12. Time-lapse: `world.timelapse(o = {})` → Promise (09:1096-1124)

| Option | Default | Meaning |
| --- | --- | --- |
| `from` | `'day'` | A preset name (or object), applied over the current env |
| `to` | `'night'` | A preset name (or object), applied over `from` |
| `dur` | 8 | Seconds |
| `cycles` | 3 | The env oscillates `from ↔ to` with `k = 0.5 − 0.5·cos(2π·cycles·u)`. Integer cycles end at `from`, half cycles at `to` |
| `keys` | `[]` | `[{t, do()}]` or `[{t, steps}]` (via `runSteps`), fired in time order once `t` passes. Keys past `dur` fire at the end. Errors are caught and logged |

- It locks the cutscene camera for its duration (moves and reaim freeze), then restores the previous lock state.
- It does **not** update `envName`/`ctx.env`, so sets that key off `ctx.env` don't follow it.
- Called directly while skipping, it fires every key at once and sets the env to **`from`**. A real run with 1.5 cycles
  ends at `to`. The flow's `{timelapse: {...}}` step (11:213-221) never calls `world.timelapse` while skipping: it runs
  the keys' steps in order and **leaves the env untouched**. So follow a time-lapse with an explicit `{env: 'day'}` if
  later steps depend on the light.
- Rue: `{ timelapse: { dur: 13, cycles: 3, from: 'day', to: 'night', keys: [{ t: 1.4, steps: [...] }, …] } }` (28:623).

---

## 13. Update and render: interpolation

`update(dt)` is §1.4. `render(alpha)` (09:1152-1190), where `alpha = acc/step` is in [0, 1):

1. For every shown actor: `keep ← pos`, `pos ← lerp(prev, keep, alpha)`,
   `root.rotation.y ← prevRot + angTo(prevRot, rotY)·alpha`, and, if visible,
   **`rig.pose(poseName, poseT + alpha·step, a.p)`**. Posing happens once per frame at interpolated time.
2. If `snap`, then `cp ← cs`. The camera position and look lerp `cp → cs` by alpha, FOV too. `aimCam` uses the shot's
   `up` (or −Z for gameplay) only for near-vertical views. `near` = the JARVIS value during shots, else 0.05.
3. The projection updates when FOV, left width or height change. Without a split: `renderer.render(cur.scene,
   camera)`. With a split: clear to black, then scissor/viewport the left half (`lw − 2` px), then the right half with
   `camR`.
4. `AUDIO.listener(camera)` (after render, so `matrixWorld` is current). Then **`pos ← keep`** for every shown actor,
   so outside `render` `a.pos` is always the tick position.

**Consequence for custom movers.** `prev` is copied at the **start** of `world.update`. Code that moves an actor from a
clock updater (minigame `update`, flow tick) runs **before** that copy, so the move is not interpolated and stutters on
high-refresh displays. Smooth custom motion should be written from the set's `update(dt, ctx)` (which runs after the
copy) or through `moveTo`.

---

## 14. Flow steps that drive the world (cross-reference, 11:113-186)

| Step | World call |
| --- | --- |
| `{shot, …, card}` | `cam.shot(s)`. **Skipped entirely when skipping** |
| `{say, text, expr, act}` | `actor.setExpr(expr)`, `actor.play(act)`, then `say` (which calls `world.talk`) |
| `{spawn: id, at, look, set}` / `{despawn: id}` | `world.spawn(id, at, s)` / `world.despawn` |
| `{set, env, spawn: {id: where \| {at, look, set}}}` | `changeSet` → `world.load` + ambience + spawns + `player.control` |
| `{move: id, to, run, speed, face, nowait}` | `actor.moveTo(to, s)`. Awaited unless `nowait`. Skip-safe re-issue |
| `{face: id, to, dur}` / `{place: id, at}` | `actor.face(to, skipping ? 0 : dur)` / `actor.place(at)` |
| `{act: [[id, anim, opts], …]}` / `{expr: [[id, expr], …]}` | `actor.play` (not awaited) / `actor.setExpr` |
| `{hold: id, prop, hand}` | `actor.hold(prop ?? null, hand)` |
| `{prop: name, visible, pos, rotY, fn}` | `world.prop(name)` then edit |
| `{env: name, dur}` | `world.env(name, skipping ? 0 : dur)`. Not awaited |
| `{split: spec, slide}` | `world.split(spec, s)`. Not awaited |
| `{timelapse: {...}}` | Flow wrapper → `world.timelapse` (awaited; skip runs the keys only) |
| `{stare: sec, ambient}` | `cam.lock(true)` for ≤ 4 s |
| scene `['cam', mode, opts]`, `['control', id]`, `['follow', id]` | `cam.override`, `player.control`, `player.follower` |

---

## 15. How to extend for TWO

### 15.1 Building TWO's sets (BUILD_PROMPT §14, ARCHITECTURE §3.2/§4)

- **One file per set** (`src/10-…24-set-*.js`). Each registers `SETS.<id> = (() => {…})();`. Copy reddy's helper
  block (05:18-63) and the §5.7 skeleton. Rename `SETS.reddy` to `reddy26`, and every scene's `set:` with it.
- **Header comment** with the layout (metres, axes, landmarks) and the lists of marks, anchors, cams and props, as at
  05:1-8.
- **Static geometry goes through one Builder.** One vertex-coloured `M.vc` holds everything plain. Textured materials
  (atlas, floor, signs) each add one draw call. Use `part()` only for things content moves, toggles or repaints.
- **Repeats use `instanced(geometry, material, [[x,y,z,rotY,scale], …])`** (04:119-131): bollards, railings and lamps
  (the bridge), lanterns (the valley), the hangar's hundreds of docked drones, the roof's ring of 400 yellow drones,
  crowds and cobbles. If instances will **ever** change colour at runtime (drones turning Yes yellow), call `setColorAt`
  on every instance **during build**. That bakes the instanced-colour program variant into boot warm-up; adding
  `instanceColor` later compiles a new program mid-game. Give per-tick animated instanced meshes their own material
  (see twins, §3.5) and set `instanceMatrix.setUsage(THREE.DynamicDrawUsage)` at build.
- **Labels and signs** go in one atlas per set (8 rows × 32 px, `label()`). AR labels are a systems concern
  (`33-systems`), not set geometry.
- **Under 300 draw calls**: count materials in the static builder + parts + instanced meshes + rigs (about 3–6 each).
  Check with F2.
- **Zones must tile every walkable and filmable area.** They drive the gameplay camera, keep framed lenses inside the
  building (§9.4 step 9), and are the fallback for crowded WIDEs. For drone stealth zones (§9.5: "every zone has a fixed
  camera angle chosen so the cones are readable"), use `type:'fixed'` cams with **array** looks, high and steep enough
  to see the floor cones, but not vertical (§7.2).
- **Colliders** must close every edge, because zones don't restrict movement. Furniture under 1.1 m that a lens could
  sit inside needs a collider too, or the framing helper won't see it.
- **Anchors for every INSERT, ECU-of-a-thing and JARVIS-CAM the script names**: the Hero Table glass, the kettle's screen
  (DES), the glass-wall pop-up (P, 3.5 ECU), the Remote's screen (3.7 / A1 / B1 JARVIS-CAM, whose `from` sits behind the
  screen), the Yes sign with its Santa hat, the scorch marks, the calendar. Put `from` where the composition works, and
  `fov`.
- **Marks** for every spot the script stands someone on. Pair marks and anchors with the same name (walk to the mark,
  shoot the anchor, §4.10).
- **`env` presets**: the first is the default. A preset named `*rain*` auto-makes rain. Palettes per §14: `reddy26` hot
  white sun; `reddy40` cooler day **and `dusk`** (the title screen); storm presets (green-grey, wet); valley `quiet`
  (dark, neon via emissive materials, not lights); `hq_top` dark storm; `hq_roof` gold. Lightning can be a short
  `world.env({dir: [0xffffff, 4], hemi: [...]})` and back with `dur`, under Reduce Flashing rules, or `ui.flash`.
- **Re-entrant `build()`**: it runs at boot (warm) and again after every retirement. Reset module arrays (`COL.length =
  0`), cache textures by `key`, keep materials in `mat()`'s cache (or `||=`), and build ambient rigs once (`CUST ||=`).
  A set-private `ShaderMaterial` or `MeshBasicMaterial` must be created once.
- **`reddy26` and `reddy40` share a layout.** Leaf fragments can't share top-level helpers (each is wrapped in its own
  block). Have `10-set-reddy26` expose a layout builder on its registry entry (e.g. `SETS.reddy26.shell = (helpers) =>
  …`) and call it **inside** `reddy40`'s `build()` (10 evaluates before 11, and build runs at boot after both), or
  duplicate it.
- **`dress(id)` by scene**: TWO's `SCENE_ORDER` branches after 3.7 (A1 A2 / B1 B2), so reddy's index arithmetic
  (`from('3.5')`) is wrong across the branch. Use explicit scene lists.
- **Set code never references `world`/`cam`/`player` at top level** (TDZ: sets evaluate before `30-world`). Inside
  `build`/`update` they are fine.

### 15.2 Live sets, loading and match cuts (§16: "keep at most three sets alive")

- Set `world.liveMax = 3` for TWO, and preload the next scene's set **under black** (`{fade: 'out'}` →
  `{do: c => c.world.preload('valley')}`), never during a visible shot. The build is synchronous.
- Splits protect `cur` and `splitE`. Preloading during a split needs `liveMax ≥ 3` (§3.3).
- **1.3 SPLIT SCREEN** (reddy26 | reddy40) and **A1** (roof | reddy26): spawn right-half actors with
  `{spawn, at, set}`, then `{split: {left: {set, shot}, right: {set, shot}}}`. "RIGHT HALF · ECU · the kettle's screen" is
  `{split: {right: {set: 'reddy40', shot: {shot: 'INSERT', at: 'kettle_screen'}}}}`. "The split closes; the left half
  fills the frame" is `{split: null, slide: true}`.
- **MATCH CUT** (B1 57 → the frame of 1.2 step 1): keep the target set preloaded (`liveMax` 3). Store the shot as a
  shared constant (as Rue's epilogue does, 35:263-267) and cut with `{set: 'reddy26', env}`, then the same `CAM` step.
- **Title screen** ("slowly orbits … the 2040 Redcliffe store at dusk"): Rue's title already does this with a cutscene
  shot outside any cutscene. It calls `world.load('office', {env: 'dark'})`, then
  `cam.shot({shot: 'MID', on: 'brick_phone', angle: 'high', move: 'orbit', from: 0, to: 360, dur: 240})` (an anchor as
  the subject), and re-issues it every 240 s (10:796-799, 835). Its fallback is the static
  `cam.override('set', {name: 'title_orbit'})`. For TWO, use `reddy40` with env `dusk`, an anchor at the store, and
  `size: 'WIDE'` (or a large `dist`) so the drone ring outside is in frame.

### 15.3 Script shot tags → steps

| Script tag (BUILD_PROMPT §8, §11) | Step |
| --- | --- |
| ECU · face | `{shot:'ECU', on:'luka'}` |
| ECU · a thing (pop-up on the glass, kettle screen, an eye) | `{shot:'INSERT', at:'<anchor>'}` with a tight anchor `fov`, or `card` |
| CLOSE / MID / WIDE | `{shot:'CLOSE', on}` … `WIDE` may omit `on` (everyone) |
| TWO-SHOT / THREE-SHOT | `{shot:'TWO', on:[a,b]}` / `{shot:'THREE', on:[a,b,c]}` |
| OTS · from behind X | `{shot:'MID', on:subject, side:'ots:X'}` |
| OTS · from below | `{shot:'MID', on, angle:'low'}` or a `CAM` |
| POV · X's view | `{shot:'POV', from:'X', at:target}`. Chase (2040)'s chip view adds the Chip View overlay (systems) |
| LOW · heroic | `{shot:'LOW', on}` or `{shot:'CLOSE', on, angle:'low'}`. **LOW ignores `size`** |
| TOP-DOWN | `{shot:'TOP', on, dist:1.5, offset:0.25}` (Rue's motif constant) |
| CRANE · down out of the sky | A `CAM` glide from the sky to the ground (23:273), or anchors `crane_top → crane_end` |
| CRANE (on a subject) | `{shot:'CRANE', size, on, from, to, amount}` |
| CRANE · up the outside of the tower | A `CAM` glide upward |
| ORBIT · speeding up | `{shot:'ORBIT', size:'MID', on, dist, from, to, ease:'in', dur}` |
| PUSH / PULL OUT | `move:'push'` / `move:'pull'`, with `amount`, `dur` |
| TRACK · alongside / behind / side-on | `move:'track', track:'alongside' \| 'behind' \| 'ahead'`, `side:'right'` |
| PAN · across the store | `{shot:'CAM' or 'MID', …, move:'pan', to:target \| degrees}` |
| TILT UP | `{shot:'TILT', size, on, to: 25}` (degrees, + = up) |
| WHIP | `{shot:'WHIP', size, on}` |
| CRASH ZOOM | `{shot:'CRASH', size, on}` (don't pass `fov`, §9.3) |
| REVERSE | the same subject with `side:'back'` |
| JARVIS-CAM | `{shot:'JARVIS', at:'<screen anchor>', on:[faces]}`, with a `popup` step for the pop-up landing |
| LOCKED / `[ECU · locked]` | `locked: true` (the shot is static). Stares use `{stare}` |
| SPLIT SCREEN / LEFT HALF / RIGHT HALF | §11, §15.2 |
| MATCH CUT | §15.2 |
| SLOW MOTION (1.2 step 17) | **Not supported** (§15.4) |

### 15.4 Camera features TWO needs that Rue doesn't have

1. **Eased chained corridor cameras** (§11: "a short ease (0.25 s) … only on chained cameras in long corridors"). Zone
   changes always hard-cut. Add a cam field such as `ease: 0.25`. In `camTick`, when `gameTick` reports a cut and the
   new cam has `ease`, start the `rel` blend (already there for release) instead of setting `snap`.
2. **The boss camera** (§10: "a high, slow, three-quarter tracking camera that keeps Luka at the console and the
   active Chase in frame, easing toward whichever side the drones are coming from"). Options: (a) a new override mode
   that calls `frameInto(out, ['luka', active], 'WIDE', {angle:'high', facing:true, …})` every tick (**`facing:true`
   is mandatory**: it skips the raycasts), then damps toward it; (b) from the boss's set `update`, mutate the arrays of a
   `'fixed'` override in place with your own damping. Both are allocation-free if the vectors are preallocated.
3. **Right-half moves in splits.** `camR` is static. If the script needs motion on the right, tick `SR` with a
   `shotTick` variant that writes `camR`. Also fix the `camR.aspect` bug (§11).
4. **Slow motion** (1.2, 17: 1.5 s). The flow overwrites `clock.scale` every tick (11:445: 3 while NO is held, else
   1), so a content-side `clock.scale = 0.3` does not stick. Add a `flow.slowmo` factor multiplied into that line, or
   a `{slowmo: 0.3, dur}` step. World motion is tick-based, so a slower clock slows everything uniformly.
5. **FOV fit on narrow screens** (§11: "widen the FOV on narrow screens so compositions survive phones"). Size shots
   only auto-fit TWO, THREE and WIDE groups. Move Rue's `fit()` (23:66) into `baseKind` for CAM, INSERT, POV and
   fixed-distance size shots when `aspectNow() < 16/9`.
6. **Camera roll** ("LOW · from behind the counter, Luka's view, upside down", 1.2). `aimCam` has no roll. Add a `roll`
   option applied after `lookAt` in `render` (`camera.rotateZ(roll)`), or fake it with a POV from a lying `luka` whose
   `up` is inverted.
7. **`world.prop` with duplicate names** across `reddy26`/`reddy40` (§4.9). Consider an optional `setId` argument.

### 15.5 Actors and the three playables (§7, §9)

- **Three-way SWAP and two followers.** `player` supports **one** follower and one breadcrumb trail. TWO needs "the
  others follow as AI or hold a position when told". Extend `P.fol` to a list: each follower uses the same trail with a
  stop distance of 1.3 m + 0.9 m × index, and followers must collide with each other. "Hold" = take that actor out of the
  list. `flow.follow` becomes a list (ARCHITECTURE §5). `player.control` must keep the others' trail state sane (it
  resets `crumbN`).
- **AI movement has no collision.** The AI Chase in the boss, drones escorting, and Teddy's walks all use `moveTo`, a
  straight line through furniture. Either route through marks as waypoints, or export `collide` (e.g.
  `world.collide(a, x, z)`) and give `moveTo` a `{collide: true}` option. Keep Rue's re-target pattern (re-issue
  `moveTo` every 0.25 s).
- **Fast custom motion** (the hover-scooter chase at 25 km/h ≈ 6.9 m/s, hover-cars, the train scenery). Write positions
  from the set's `update` so interpolation works (§13). For the scooter riders, parent the actor roots to the scooter
  prop, or move them in `update` with `p.sit`/`play('sit', {h})`.
- **New animations** (§14: polish, lift-strain, climb, tether throw/yank, chip ping, coat throw, scooter ride,
  sizzle-flip, hum, pull cracker, …) go in `ANIMS` (ART). If one is a **one-shot that should return** to the previous
  anim, add it to `ONE` in `30-world.js` (09:220) with its length, or always play it with `{loop: false, dur}`. If it
  is a **locomotion** cycle (`climb`, `scooter`, `lift_walk`), add it to `LOCO` (09:221) so stops return to idle.
  Upper-body anims set `.upper = true` to keep seated or walking legs.
- **Climbing** (the ladder in 1.1, pole rungs). `floor()` can't express vertical climbs. Script it: `place` at the
  ladder foot, `play('climb')`, then a `moveTo` with a raised `y` target (`moveTo` interpolates y by progress).
- **Speaker → actor mapping** (ARCHITECTURE §5: `say('manager', …)` animates `luka40`). `world.talk(id)` looks up
  `actors.get(id)` directly. Resolve `CHARACTERS[id].actor` before calling it (in UI), or extend `world.talk`.
- **Rig pool.** One adopted rig per look. Crowds of extras (`cust26_a…`, `local40_a…`, `staff_a…`, `passenger_a…`)
  each need a distinct look id (each warmed at boot), or must be non-actor ambient rigs built once in the set (reddy's
  `CUST`), or must be instanced low-poly figures. Never let a cutscene spawn a second actor with an already-used look.
- **Attachments on pooled rigs** (Santa hat and beard from 2.1, headphones, the chip light, the hood up or down, the
  bandages in 3.7) persist across despawn. Set them explicitly on every spawn, or in the scene's opening `do`.
- **Drones are not actors.** They have no rig and are not in `world.actors`. The framing helper accepts `[x,y,z]` and
  `Vector3` subjects, so `on: [drone.pos]` or `on: ['chase40', drone.pos]` frames them. Doors in reddy-style sets open
  only for actors, so drones flying through doors must poke the set's door state themselves.

### 15.6 Performance rules (§16), as they apply to this subsystem

- **No allocation per tick or frame.** Set `update`s, `floor`, systems updaters and minigame updates use preallocated
  scratch (`const v = new THREE.Vector3()` at module level), `for` loops or hoisted callbacks (reddy's
  `world.actors.forEach(nearDoor)`), and in-place array mutation (dynamic colliders). `frame()` and `cam.project()`
  return shared objects, so copy the numbers out.
- **Never call `frame()` or unfaced framing per tick.** It raycasts the whole set. `track` already passes
  `facing:true`.
- **Merged geometry + instancing.** Count draw calls per set (≤ 300 with actors).
- **Shader warm-up at boot.** Every set is warmed (36:95), so everything that will ever render must exist (possibly
  hidden) in `build()`, using cached `mat()` materials and keyed textures. Never add lights. Never create a new
  material kind at runtime (the autoplay warning catches it). If content attaches meshes at runtime, use materials from
  the warmed families (Lambert via `mat()`, the blob, the puff).
- **Loads behind black.** `world.load`, `preload`, `show` and `spawn({set})` build synchronously, and a first
  `buildCharacter` is a hitch. The flow's `['set', id]` scene step fades to black first (11:503). Door transitions fade
  (11:330).
- **The rain point count** is clamped to 6000. For big outdoor storm sets, pass `ambience.rain.box` to limit it to the
  playable area.

### 15.7 Skip-safety rules for content using the world

- Use flow steps (`move`, `face`, `act`, `env`, `place`) rather than awaiting world promises inside `do` (§2).
- A `do` step that animates over time must check `c.flow.skipping` and jump to its end state (Rue: 28:179, 28:382).
- Never await anything on an actor or set that is not shown (§2).
- `cam.shot` never runs while skipping, so the camera stays where it was and `playCutscene` releases it. Never make a
  later step depend on camera state.
- Use the step `{timelapse}` (not `world.timelapse`), and restate the final env after it (§12).
- `world.puff` is suppressed while skipping. Don't use it to signal state.
- Leave the world clean for the next scene: `torchAuto = true`, torch intensity, `liveMax`, actor `mood`/`habit`/
  `walkAnim`, rig attachments. `flow.start` despawns every actor and clears overrides and splits, but **not** these.

---

## 16. Gotchas, consolidated

1. **Superseded promises resolve, never reject** (`settle`). Code after `await a.moveTo(x)` runs even if the move was
   interrupted.
2. **World promises are ticked by `world.update`, not `clock.waits`.** A skip doesn't release them, and they hang
   forever on actors or sets that are not shown.
3. **`trim()` runs inside `ensure`** before the new set is current. With `liveMax = 2`, preloading can retire the set you
   just preloaded, especially during a split (§3.3).
4. **Build, load, preload, show and `spawn({set})` are synchronous**: hide them behind black.
5. **The first env preset is applied at build.** A preset without `spot` doesn't touch the torch. A named preset
   without `rain` uses `rainFor`.
6. **Animated materials must be unique** (keyed) and not shared between instanced and plain meshes (twins clone them,
   §3.5).
7. **`def.props` is documentation only.** The prop map comes from traversal, includes incidental names, and the first
   name wins. `world.prop` also searches other live sets.
8. **Lookup order** for a name is mark → actor → anchor when standing, but actor → anchor → mark when framing
   (§4.10). `place('<anchor>')` puts the actor at the anchor's height.
9. **`place` ignores `floor()`.** `moveTo`, the player and the follower apply it.
10. **Only the player collides.** `moveTo` and the follower walk through walls and furniture. The player ignores the
    follower.
11. **Zones don't block movement**, and outside all zones the previous camera stays (after a release, `firstCam`).
    Zones are also the framing helper's "inside".
12. **The modern input lock**: `ctrlYaw` updates only while the stick is released (or the player is disabled). Avoid
    vertical gameplay cameras.
13. **Re-spawn keeps state** (expression, mood, habit, `walkAnim`, held prop, `rig.seated`). Pooled rigs keep
    attachment visibility.
14. **One rig per look is pre-built.** A second simultaneous actor of a look builds mid-game.
15. **A custom `walkAnim` not in `LOCO`** keeps playing after arrival. A new one-shot not in `ONE` doesn't return
    unless played with `{loop:false}`.
16. **`play()`'s `h` and `yaw` persist** in `a.p`. A looping anim with `dur` resolves after `dur` but keeps playing.
17. **`OTS` is just MID**: pass `side:'ots:<id>'`. **`LOW`/`HIGH` ignore `size`**: use `angle`.
18. **`from`/`to` are overloaded** (POV source, glide target, degrees, metres). POV + numeric pan or orbit gives NaN.
19. **CRASH with `fov`** doesn't zoom. **`move:'glide'`** by hand is broken. Moves on `SET` shots are ignored.
20. **JARVIS needs `at`** (the screen anchor) **and `on`** (the faces). It borrows the torch until the next shot or
    release.
21. **`track` ignores `dur`** and runs until the next shot. It also doesn't jump on skip.
22. **`frame()` and `cam.project()` return shared objects.** `frame()` raycasts, so never call it per tick.
23. **Split: `right.set` is required on every call. The right half is static, and `camR.aspect` is stale** (bug, §11).
    `left.set` changes the current set without ambience.
24. **Time-lapse skip asymmetry**: a direct skip ends at `from`, the flow-step skip doesn't touch the env, and a real
    half-cycle run ends at `to`. It never updates `ctx.env`.
25. **`clock.scale` is overwritten by the flow every tick**, so slow motion needs a flow hook.
26. **Moving actors from clock updaters isn't interpolated.** Move them in the set's `update` (§13).
27. **`torchAuto` is global.** Restore it after hand-placing the torch.
28. **Objects added to `world.scene`** stay parented to a retired scene after a rebuild. Re-add them by comparing
    against `world.scene`.
29. **`world.env` with a `setId` that isn't live** is silently ignored. `world.mark`/`world.anchor` only look in the
    current set (`spawn({set})` resolves in the actor's own set).
30. **`cam.lock` freezes cutscene shots only**, not the gameplay camera. `release()` clears it.
