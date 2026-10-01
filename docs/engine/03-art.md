# 03 — Art: textures, materials, Builder, instancing, blob shadows, rain, the character rig, LOOKS, ANIMS

Reference manual for `ref/rue/04-art.js` (1416 lines). It covers everything that turns data into pixels below the world
engine: painted canvas textures, the cached material library, baked vertex lighting, the static-geometry `Builder`,
`instanced()`, blob shadows, GPU rain, and the character system: `buildCharacter()` (one parameterised rig), the `LOOKS`
registry that describes every character, and the `ANIMS` registry of procedural poses.

TWO's `src/04-art.js` is byte-identical to Rue's (verified with `diff`), so every line citation `04-art.js:N` holds for
`src/04-art.js` too. Other citations: `09-world-engine-b1.js` = TWO `src/30-world.js`, `36-main.js` = TWO
`src/99-main.js` (same line numbers), `01-config.js` = TWO `src/01-config.js`. Content files (`23-…35-*.js`) exist only
in `ref/rue/`. **Anything Rue registered from content (extra ANIMS, props) is NOT in TWO yet.**

---

## 1. Conventions you need everywhere

| Thing | Convention |
| --- | --- |
| Look | Clean faceted low-poly. Every lit surface is `MeshLambertMaterial` with `flatShading: true` and `vertexColors: true` (one program family). Light is baked into vertex colours so sets read under the hemi + directional rig (04-art.js:1-5). |
| Colour space | `THREE.Color(hexString)` converts sRGB to linear. Vertex colours, material colours and canvas textures (`SRGBColorSpace`) are therefore all consistent. |
| Up / forward | +Y up. **An actor faces +Z. The character's left is +X** (04-art.js:209). |
| Limb bones | Point down −Y from their joint. **Negative `rotation.x` swings a limb forward** (04-art.js:210). |
| Other rotations | `torso/head.rotation.x > 0` leans/tilts forward (nod down). `head.rotation.y > 0` turns the face toward +X (character's left). `armL.rotation.z > 0` and `armR.rotation.z < 0` lift the arms outward. Euler order is the default XYZ everywhere. |
| Body units | Rig geometry and every `rig.d` metric are in **body units**, before `body.scale = s`. `s = L.h / total` and is ≈ 1.0 for an average build (default look: total 1.751, s = 1.017). Convert world metres to body units with `m / rig.d.s` (ANIMS' `hipsY`, 04-art.js:1141). |
| No allocation | Per-frame code (ANIMS, `rig.update`, set `update`) allocates nothing. ANIMS use module-level scratch vectors (04-art.js:1111). |

---

## 2. Public API at a glance

| Name | Kind | Lines | One line |
| --- | --- | --- | --- |
| `canvasTex(w, h, paint, o)` | fn | 9-21 | Paint a canvas, return an sRGB `CanvasTexture` (optionally cached by key, optionally repeating). |
| `canvasTex.yes(ctx, x, y, h, color)` | fn | 228-239 | The handwritten "Yes" logo painter, shared with sets and cards. |
| `mat(color, o)` | fn | 27-43 | Cached `MeshLambertMaterial` (flat, vertex colours). |
| `matTex(tex, o)` | fn | 44 | `mat()` with a map. |
| `bakeLight(g, o)` | fn | 49-65 | Write/multiply a baked lambert + AO colour attribute. |
| `Builder` | class | 72-115 | Accumulate static geometry per material, merge, bake, return a `Group`. |
| `instanced(g, m, list)` | fn | 119-131 | `InstancedMesh` from a transform list (bakes light into `g` once). |
| `blobShadow()` | fn | 134-151 | A small shared soft-shadow quad to parent under an actor. |
| `makeRain(o)` | fn | 155-205 | GPU rain `Points` with `uTime` / `uAmount` uniforms. |
| `buildCharacter(id)` | fn | 211-1021 | Build a rig from `LOOKS[id]`; returns the rig object (§9). |
| `LOOKS` | registry | 01-config.js:28, filled 1031-1101 | Character descriptions (§10). |
| `ANIMS` | registry | 01-config.js:29, filled 1108-1416 | `(rig, t, p) => void` pose functions (§11). |

`mergeGeometries` is imported once in `00-head.html:277` and used only by `Builder.done()`.

---

## 3. Textures — `canvasTex`

```js
canvasTex(w, h, paint /* (ctx, w, h) => void */, o = {}) -> THREE.CanvasTexture      // 04-art.js:9-21
```

| Option | Default | Effect |
| --- | --- | --- |
| `key` | none | Cache key. A second call with the same key returns **the cached texture and ignores `w`, `h` and `paint`**. |
| `repeat: [x, y]` | none | Sets `wrapS = wrapT = RepeatWrapping` and `repeat.set(x, y)`. |

Always: a new `<canvas>` of `w×h`, `paint(ctx, w, h)` runs once synchronously, `colorSpace = SRGBColorSpace`,
`anisotropy = 4`. Filtering is three's default (**linear + mipmaps**; Rue never sets `NearestFilter` anywhere).

Gotchas
- Without `key`, every call makes a new canvas, texture and GPU upload. Key anything built more than once (a prop that is
  re-built per scene, a texture shared by several sets).
- A keyed texture is shared. Repainting its canvas (`tex.image.getContext('2d')`, then `tex.needsUpdate = true`) changes
  every user.
- `mat()` keys on `map.uuid` (§4), so two un-keyed textures painted identically produce two materials, which also splits
  Builder meshes (more draw calls).
- TWO's spec (§14) asks for nearest-neighbour filtering. Rue's look is smooth and mipmapped. If TWO wants nearest, set
  `t.magFilter = THREE.NearestFilter` (keep mip minification, or text shimmers) on the textures that need it, ideally
  as a new `o.nearest` option, rather than globally.
- Paint text at 2× (spec §12 asks this of cards) and keep sizes power-of-two (128-512) so mips are clean.

### `canvasTex.yes(ctx, x, y, h, color)` (04-art.js:228-239)

Strokes the handwritten "Yes" (three quadratic strokes, `lineWidth 6.5` scaled, round caps) into an existing 2D context.
`(x, y)` is the top-left of the box, `h` is the box height in px. The word is about `1.6 × h` wide. It is attached as a
property when the `buildCharacter` IIFE evaluates, so it exists as soon as `04-art.js` has run (sets alias it:
`const yes = (c, x, y, h, col) => canvasTex.yes(c, x, y, h, col);`, 05-set-reddy-optus-redcliffe-2026.js:70).
Colour convention: `CONFIG.colors.yes` (`#ffd21f`) on `CONFIG.colors.polo` or `chaseBlue`.

---

## 4. Materials — `mat` / `matTex`

```js
mat(color = 0xffffff, o = {}) -> MeshLambertMaterial (cached)       // 04-art.js:27-43
matTex(tex, o = {}) -> mat(o.color ?? 0xffffff, { ...o, map: tex })  // 04-art.js:44
```

| Option | Default | Effect |
| --- | --- | --- |
| `emissive` | none | If not null: `m.emissive.set(emissive)`, `emissiveIntensity = o.emissiveIntensity ?? 1`. **With a `map`, the map also becomes the `emissiveMap`** (self-lit screens: `matTex(t, { emissive: 0xffffff })`). |
| `emissiveIntensity` | 1 | See above. |
| `transparent` | false | Also sets `depthWrite = o.depthWrite ?? false` and `forceSinglePass = true` (double-sided glass renders in one pass; two passes re-pick the program every frame, 04-art.js:37). |
| `opacity` | 1 | |
| `side` | `FrontSide` (0) | `THREE.DoubleSide` (2) for glass and thin cards. |
| `map` | null | Texture. Use `matTex`. |
| `depthWrite` | (false if transparent) | Only applied when `transparent`. |
| `key` | none | Extra string in the cache key: the way to get a **private** material you may animate. |
| `color` (matTex only) | white | Tint multiplied with the map. |

Fixed: `flatShading: true`, `vertexColors: true`, `defaultAttributeValues = { color: [1, 1, 1] }` (04-art.js:39), so
geometry **without** a colour attribute renders as if its vertex colour were white (a plain `BoxGeometry` works).

Cache key (04-art.js:31-32):

```js
[c.getHexString(), o.emissive, o.emissiveIntensity, !!o.transparent, o.opacity ?? 1, o.side ?? 0,
 o.map ? o.map.uuid : '', o.depthWrite, o.key].join('|')
```

Gotchas
- **Cached materials are shared.** Never change `color`, `opacity`, `emissiveIntensity` of a `mat()` result unless you
  passed a unique `key` (`mat(0x6fc8ff, { emissive: 0x6fc8ff, key: 'chip_' + id })`).
- `emissive` goes into the key raw: `0xffffff` and `'#ffffff'` make two materials. Use numeric hex consistently.
- Program families: Lambert ± map, ± emissiveMap, ± transparent, Mesh vs SkinnedMesh vs InstancedMesh (± instanceColor)
  are all different shader programs. A combination that no set or look contains at boot compiles when it first appears
  (a hitch). See §13.7.
- `MeshBasicMaterial` is used only for the blob shadow and a few unlit sky elements in sets; each is its own program.

---

## 5. Baked light — `bakeLight`

```js
bakeLight(g, { dir = [0.45, 0.8, 0.35], ambient = 0.72, floor = true, y0 = 0 } = {}) -> g   // 04-art.js:49-65
```

Per vertex: `c = ambient + (1 - ambient) * max(0, n · dir)`; undersides (`ny < -0.5`) × 0.82; if `floor` and the vertex
is not up-facing (`ny < 0.7`), an AO ramp `0.7 + 0.3 * smoothstep((y - y0) / 1.4)` darkens walls and props toward the
floor (70% at `y0`, full brightness 1.4 m above it). The result **multiplies** into an existing `color` attribute (so you
can pre-tint vertices) or creates one. Computes normals if missing.

Gotchas
- Cumulative: baking the same geometry twice darkens it twice.
- AO uses the vertex's absolute `y`. For geometry that is not standing on `y = 0` in its own space (a shelf item, a
  hovering drone), pass `y0` or `floor: false`.
- Baked light is fixed. Dynamic lighting (hemi, dir, spot) still applies on top through Lambert.

---

## 6. Static geometry — `Builder`

```js
const b = new Builder();                                                     // 04-art.js:72-115
b.box(w, h, d, m, [x, y, z] = [0,0,0], rotY = 0)
b.cyl(rTop, rBot, h, seg = 8, m, [x, y, z], rotY = 0)        // seg comes BEFORE m: pass it explicitly
b.plane(w, h, m, [x, y, z], [rx, ry, rz]?)                    // faces +Z before rotation
b.geo(geometry, m, Matrix4 | [x, y, z])                       // clones the input
b.add(geometry, m)                                            // raw: takes ownership (disposed by done)
const group = b.done({ dir, ambient, floor, y0 })            // -> Group, one Mesh per material
```

Positions are **centres** (like a `Mesh` at that position). All adders return `this`.

`done()` (04-art.js:93-114), per material (the `Map` key is the material **object**):
1. `toNonIndexed()` every geometry; compute normals if missing; add a zero `uv` if missing; if any geometry of this
   material has a `color` attribute, give the others white colours; delete every attribute except
   `position/normal/uv/color`; clear morph attributes.
2. `mergeGeometries(parts)`, dispose all inputs, `bakeLight(merged, o)`, `new Mesh(merged, m)`.
3. Clear the list. **Builders are single-use.**

Examples from Rue
- Sub-part pattern (a named prop with local coordinates), 05-set-reddy-optus-redcliffe-2026.js:49-57:
  ```js
  function part(name, fn, pos, ry = 0, o) {
    const pb = b, px = XF; b = new Builder(); XF = null;
    fn();
    const g = b.done(o); b = pb; XF = px;
    if (name) g.name = name; if (pos) g.position.set(pos[0], pos[1], pos[2]); g.rotation.y = ry; return g;
  }
  ```
- A runtime hand prop (Des's handset, 27-content-…:64-72): `const b = new Builder(), cream = mat(0xd8cbae); b.box(…); const h = b.done(); d.rig.attach.gripR.add(h);`

Gotchas
- Merging is by material identity: always get materials from `mat()` so equal materials merge.
- One draw call per material per `done()`. A set should end up with a handful of materials, not dozens.
- `box` only rotates about Y; for arbitrary transforms use `geo(g, m, matrix4)`.
- Cylinder normals are smooth around the side, so their *baked* light is smooth while the live light is faceted. Fine
  for props; use `seg` 6-8.
- Never call `done()` per frame. Builders run at set build (boot warm) or, rarely, at a scene boundary.

---

## 7. Instancing — `instanced`

```js
instanced(g, m, [[x, y, z, rotY, scale | [sx, sy, sz]], ...]) -> THREE.InstancedMesh   // 04-art.js:119-131
```

- If `g` has no `color` attribute it is **mutated**: `bakeLight(g, { y0: g.boundingBox.min.y })` (local y = height).
- Missing `rotY` = 0, missing `scale` = 1. Matrices composed with scratch objects; `instanceMatrix.needsUpdate = true`;
  `computeBoundingSphere()` so the whole batch frustum-culls as one.
- Per-instance tint: `im.setColorAt(i, color)` afterwards (06-set-square.js:813). That adds `instanceColor`, which is a
  different program (boot warms the instanced ± colour ± transparent ± map families, 36-main.js:68-74).

Gotchas
- The count is fixed at `list.length`. For moving instances (drones), update with preallocated `Matrix4/Quaternion`,
  call `setMatrixAt`, set `instanceMatrix.needsUpdate = true`, and either recompute the bounding sphere or set
  `frustumCulled = false` (the sphere computed at creation no longer covers moved instances).
- After `setColorAt` changes, set `im.instanceColor.needsUpdate = true`.
- To use a Builder-made shape as an instance, build it with **one** material (pre-tint parts with a `color` attribute),
  call `done({ floor: false })`, take `group.children[0].geometry`, and pass it to `instanced()` (already baked, so it is
  not re-baked).

---

## 8. Blob shadows and rain

### `blobShadow()` (04-art.js:134-151)

Returns a **new** `Mesh` that shares one 0.8 × 0.8 m flat plane and one `MeshBasicMaterial` (radial-gradient texture
keyed `'blob'`, `transparent`, `depthWrite: false`, `polygonOffset -2/-2`). `position.y = 0.01`, `renderOrder = 1`,
`name = 'blob'`. The world adds one under every actor's `rig.root` if none exists (09-world-engine-b1.js:252-253). Scale
it for big or small things. Never dispose the shared geometry or material. For something that hovers (a drone), the
shadow must stay on the floor: keep it in the set at floor height, or counter-offset its `y` every frame.

### `makeRain({ box = [-10,-10,10,10], top = 10, count = 2500, bottom = 0 })` (04-art.js:155-205)

`box` is `[minX, minZ, maxX, maxZ]`. Returns `THREE.Points` (`name 'rain'`, `frustumCulled = false`) with a fog-aware
`ShaderMaterial`. Drops fall in the vertex shader at 7.5-11 m/s, wrap between `bottom` and `top`, slant slightly in +x,
point size `clamp(90 / depth, 2, 90)`, drawn as thin streaks at 50% alpha. `pts.uniforms === material.uniforms`:

| Uniform | Meaning |
| --- | --- |
| `uTime` | Seconds. Advance it yourself (the world does `e.rain.uniforms.uTime.value += dt` while visible, 09-world-engine-b1.js:1132). |
| `uAmount` | 0..1, the fraction of drops drawn (`step(aRnd.y, uAmount)`). The world drives it from the env's `rain` (09-world-engine-b1.js:54). |
| `uTop`, `uBottom` | From the options. |
| `uColor` | `Color(0xd4dde6)`. |

The world auto-creates rain for any set whose env names mention rain or set `rain > 0`, sized from the zones plus 12 m
or `def.ambience.rain = { box, top, bottom, count }` (09-world-engine-b1.js:155-167). A set may supply its own
(`props.rain`). Counts used in Rue's sets: 260-5200 (auto-sized rain is clamped to 1500-6000). Rain is its own shader program, so it must exist at boot (`world.warm` compiles every set and renders it with hidden
objects temporarily shown, 09-world-engine-b1.js:1209).

---

## 9. The character rig — `buildCharacter(id)`

```js
const rig = buildCharacter(lookId);   // LOOKS[lookId] || LOOKS.customer_a   (04-art.js:674-675)
```

**Never call it mid-game.** It builds geometry, two canvases and a texture. `36-main.js:60-92` builds **every** `LOOKS`
entry at boot (`warmCharacter`), compiles it, bakes its portrait, then `world.adopt(id, rig)` pools it, so the first
`world.spawn` of each look builds nothing. A second simultaneous actor with the same look *does* build (the pool holds one).

### 9.1 Object graph and draw calls

```
rig.root (Group, name = look id)                      <- world moves/rotates this; blob shadow added here by world
└─ rig.body (Group, scale = s)
   ├─ parts.hips (Bone) ── torso ── neck ── head ── face (Mesh, painted head)
   │                       │                  └── head-worn attachments (glasses, cap, earbud, ...)
   │                       ├─ armL ─ foreL ─ handL ─ gripL (Object3D) ── mug / handbag ...
   │                       ├─ armR ─ foreR ─ handR ─ gripR (Object3D) ── phone, textbook, umbrella, brick ...
   │                       └── torso-worn attachments (lanyard + badge, scarf, headphones_neck)
   │   ├─ legL ─ shinL ─ footL      └── hips-worn attachments (walkman)
   │   └─ legR ─ shinR ─ footR
   └─ mesh (SkinnedMesh 'body', frustumCulled = false)
```

| Mesh | Material | Draw calls |
| --- | --- | --- |
| `mesh` (body, clothes, hair, hands, shoes) | `skinMat`, a clone of the atlas material reserved for skinned meshes (04-art.js:853) | 1 |
| `face` (head) | `matTex(faceTexture)`, unique per rig | 1 |
| each **visible** attachment | `atlas()` (shared, non-skinned) | 1 each |

A typical actor is 2-5 draw calls (Luka: body, face, lanyard, badge). The body is never frustum-culled: hide or despawn
actors that are off-camera in busy sets.

### 9.2 Skeleton

16 bones, `PART` order (04-art.js:213) — the order matters (skin indices and the pose snapshot use it):

| # | Bone | Parent | Rest position (parent space, body units) |
| --- | --- | --- | --- |
| 0 | `hips` | body | `(0, hipY, 0)`, `hipY = footH + shin + thigh + 0.02` |
| 1 | `torso` | hips | `(0, 0.06, 0)` (the waist) |
| 2 | `neck` | torso | `(0, T, 0)` |
| 3 | `head` | neck | `(0, neckL, 0)` |
| 4/7 | `armL` / `armR` | torso | `(±shX, armY, 0)`, `armY = 0.405·k − 0.03` |
| 5/8 | `foreL` / `foreR` | arm | `(0, −upper, 0)` |
| 6/9 | `handL` / `handR` | fore | `(0, −fore, 0)` |
| 10/13 | `legL` / `legR` | hips | `(±hipX, −0.03, 0)` |
| 11/14 | `shinL` / `shinR` | leg | `(0, −thigh, 0)` |
| 12/15 | `footL` / `footR` | shin | `(0, −shin, 0)` |

Dimensions (04-art.js:678-683), all body units:

| Symbol | Formula | Default |
| --- | --- | --- |
| `legF` | `(L.leg ?? 1) · 0.95` | 0.95 |
| `footH`, `shin`, `thigh` | `0.08`, `0.42·legF`, `0.43·legF` | 0.08, 0.399, 0.4085 |
| `T` (torso length) | `0.47 · (L.torso ?? 1)`; `k = T / 0.47` | 0.47 |
| `neckL` | `0.036 · (L.neckLen ?? 1)` | 0.036 |
| `upper`, `fore` | `0.29 · (L.arm ?? 1)`, `0.26 · (L.arm ?? 1)` | |
| `hs` (head scale) | `(L.head ?? 1) · 1.1` | 1.1 |
| `ar` (arm radius) | `0.05 · w · (L.arms ?? 1)` | |
| `chestRx`, `shX` | `0.158·w·sh + belly·0.012`, `chestRx + ar·0.35` | |
| `hipRx`, `hipX` | `0.15·w·(1 + fem·0.12 + (L.hips ?? 0)) + belly·0.02`, `hipRx · 0.6` | |
| `nr` (neck radius) | `0.055 · (L.neck ?? 1) · √w` | |
| `s` | `(L.h ?? 1.78) / (hipY + 0.06 + T + neckL + 0.252·hs)` | 1.017 |

Skinning is rigid with at most two influences: each vertex belongs to the bone it was built on, and an optional
`G.blend(p) → [bone, weight]` adds a second bone (used for the waist seam, coat/skirt fronts, the ponytail, the apron).

### 9.3 Build pipeline (04-art.js:674-1020)

1. `L = LOOKS[id] || LOOKS.customer_a`; create the shared atlas once; seed the deterministic RNG from `id`.
2. Compute dimensions; torso profile `TP` (5 rings: waist, belly, chest, shoulder, neck base) shaped by `w`, `fem`,
   `belly`, `pads`; helpers `tpAt(y)`, `tRing(y, grow, a0, a1)`, `fz(y)` (front surface z), `sz(x, y)` (surface z at x).
3. Create bones at rest, `body.updateMatrixWorld(true)`.
4. `geoOf(() => {...}, bone matrixWorlds)` lofts, **in each bone's local space**, the torso (+ open/vneck front strip,
   collar skin), hi-vis bands, pelvis, skirt/coat hem, untucked tail, apron, belt, collar/placket/lapels/tie/buttons/zip,
   logo, neck, down-hood, arms (sleeve type), hands + thumb, legs (bottom type), shins (wellies), shoes, then `hair()`.
5. `SkinnedMesh(geo, skinMat)` added to `body`, bound to a `Skeleton` of the 16 bones, **then** `body.scale = s`.
6. Head mesh from `headGeo(L, hs)` with the painted face texture (`faceKit(L, size)`) on `parts.head`.
7. Grips and attachments (§9.7). `L.hide` hides named attachments.
8. Rig object; `face.set(L.expr || 'neutral')`; `rig.pose('idle', 1)`.

### 9.4 Geometry helpers (private to the closure; usable only inside `04-art.js`'s `buildCharacter`)

| Helper | Signature | Notes |
| --- | --- | --- |
| `geoOf` | `geoOf(fn, mats?)` → BufferGeometry | Runs `fn`, collecting into `G`. With `mats` (bone matrixWorlds) adds `skinIndex/skinWeight` and transforms points by the bone's matrix. Without `mats` (attachments) everything is in the mesh's local space and the bone argument `b` is ignored. |
| `tri` | `tri(b, p0, p1, p2, color, u0?, u1?, u2?)` | Default UVs sample the white atlas point. Counter-clockwise = front. |
| `quad` | `quad(b, p0, p1, p2, p3, color, uv?)` | `uv` = a `REG` tile `[u0, v0, u1, v1]`. |
| `ring` | `ring(n, y, rx, rz, zc = 0, xc = 0, a0 = 0, a1 = a0 + TAU)` | Angle 0 = +Z (front), increasing toward +X. Open arcs get `n+1` points and `.open = true`. |
| `ringZ` | `ringZ(n, z, rx, ry, yc = 0)` | Ring across Z (shoes, headphone cups). |
| `loft` | `loft(b, rings, color, { down, capB, capT })` | Rings bottom→top, or top→bottom with `down: true` (limbs). Caps on closed rings unless disabled. `color` is a value or `(segment, side) => colour` or `[colour, tile]` (the face then maps that atlas tile). Side is −1 for caps. |
| `box` | `box(b, x, y, z, w, h, d, color, rotX = 0)` | Centre + size, optional pitch. |
| `bar` | `bar(b, p0, p1, t, color)` | Square-section rod. |
| `wire` | `wire(b, pts, t, color)` | Double-sided ribbon through points (chains, cords). |
| `onFace` | `onFace(rings, s, i, u0, u1, v0, v1, off = 0.003)` → 4 points | A quad lying on loft face (ring `s`, side `i`), for logos and patches. |
| `G.blend` | `(p) => [bone, w] \| null` | Set before a `loft`, reset to `null` after. |
| `shade(c, k)`, `mix(a, b, k)` | → `'#rrggbb'` | Darken/lighten, lerp. |

### 9.5 The body atlas (04-art.js:222-285)

One 256 px canvas (`key 'char_atlas'`) shared by every body and attachment. Vertex colour × atlas texel. Tiles are
**greyscale** so the vertex colour tints them. `REG[name] = [u0, v0, u1, v1]`.

| Tile | Pixel rect (x, y, w, h) | Use |
| --- | --- | --- |
| `white` | point (192, 96) | Default UV for plain faces. Sits in a pure-white 128×128 block (x 128-255, y 0-127). **Keep that block white** or every plain surface tints at low mips. |
| `denim` | 2, 2, 58, 58 | Jeans (`bottom: 'jeans'`). |
| `knee_up`, `knee_dn` | 66, 2 / 2, 66 | Faded knees (with `L.fade`). |
| `hair` | 66, 66, 58, 58 | Hair strands (all hair). |
| `tweed`, `knit` | 166, 138, 40, 40 / 212, 138, 40, 40 | `L.topTex`. |
| `yes_black`, `yes_blue` | 10, 139, 60, 34 / 90, 139, 60, 34 | Polo chest logo (`L.logo`), painted in colour on `CONFIG.colors.polo` / `chaseBlue`. |
| `badge_LUKA`, `badge_CHASE`, `badge_LUKE`, `badge_JORDAN` | 2+64i, 196, 60, 36 | Lanyard badges. |

Free space: the strip y 232-255 (full width) and y 182-195. Not enough for another badge row (badges are 36 px tall).

### 9.6 Head and the painted face

**Geometry** (`headGeo`, 04-art.js:387-419): 8 rings × 10 sides from chin (`y = −0.004·hs`) to crown (`0.254·hs`), a
3-triangle nose, ear wedges. The colour attribute is deleted; the texture supplies all colour. Planar UVs from the
front; faces turned away (`nz < −0.35`) sample the back-of-head skin patch; ears sample an ear tile.

**Head-local landmarks** (head bone origin = top of the neck; multiply by `hs`):

| Landmark | Position |
| --- | --- |
| Crown | y 0.254 |
| Brow line | y 0.157 |
| Eye line / glasses | y 0.134, face surface z ≈ 0.104, glasses z 0.118 |
| Nose tip | y 0.078, z 0.104 + 0.022·`nose` |
| Mouth | y 0.043, z ≈ 0.104 |
| Chin | y ≈ 0, z ≈ 0.088 |
| Ears | x ±0.0865·hw, y 0.086-0.156, z +0.004 to −0.03 (`hw = (L.headW ?? 1)·1.08`) |
| Half-width `HX` | 0.095·hw |

**Canvas mapping.** 128 "units" square, drawn at 256 px (128 px for ids matching `/^(student|customer)_/`, 04-art.js:863).
Canvas x 0..128 maps to head x −HX..+HX, so **the canvas left is the character's right**. Canvas y 0 is the crown,
y 128 is just below the chin: `headY = 0.25·hs − (cy / 128)·0.27·hs`. Constants: eyes at `64 ± EX` (`EX = 21`), `EY = 55`;
brows `BY = 44`; mouth `MY = 98`. The beard path reaches the canvas edges, which wrap the sides of the head (sideburns).
Back-of-head patch: canvas (0-10, 118-128). Ear tile: (116-128, 116-128).

**`faceKit(L, S)`** (04-art.js:421-576) paints a static **base** canvas once (skin, blush, nose line + nostrils,
freckles, age lines, tired bags, beard/stubble, moustache, hairline per style, patches) and returns
`{ canvas, tex, draw(e, b, m, tears) }`. `draw` copies the base and overlays eyes, brows, mouth and tears, then sets
`tex.needsUpdate` (a GPU upload). It returns early if nothing changed.

**Expressions** (`EXPR`, 04-art.js:380-385; private):

| Name | Eyes | Brows | Mouth | Tears |
| --- | --- | --- | --- | --- |
| `neutral` | open | neutral | closed | |
| `talk` | open | raised | closed | |
| `worried` | open | worried | frown | |
| `stunned` | wide | raised | O | |
| `laugh` | happy | raised | smile | |
| `sad` | half | worried | frown | |
| `crying` | closed | worried | grimace | yes |
| `determined` | open | angry | closed | |
| `smug` | half | smug | smirk | |
| `sleep` | closed | neutral | closed | |

Component values:
- **Eyes:** `open` (default; `L.lids` covers the top), `wide`, `half` (55% lid), `closed` (down-curved line + lid crease),
  `happy` (up-curved line). Anything else draws as `open`. Pupils are fixed in the centre (no eye direction).
- **Brows:** `neutral`, `worried`, `raised`, `angry`, `smug` (character's left brow raised, right flattened). Anything
  else is `neutral`.
- **Mouths:** `closed`, `frown`, `smirk`, `O`, `grimace` (teeth), `smile` (open grin), and `A` (open). **Any other string
  draws the open `A` mouth** (`face.mouth('neutral')` gives an open mouth).

**The `face` object** (`rig.face`, 04-art.js:972-978):

| Member | Effect |
| --- | --- |
| `canvas`, `tex` | Live face canvas/texture (UI uses the canvas as a portrait fallback, 10-ui.js:625). |
| `expr, e, b, m, tears, over` | Current state. `over` overrides the mouth (talk flap, `chew`). |
| `set(name)` | Apply an `EXPR` entry (unknown → `neutral`), including `tears`. Redraws. |
| `eyes(e)`, `brows(b)`, `mouth(m)` | Change one component, redraw. |
| `tears = 0/1` then `redraw()` | Tears are a field, not a method. |
| `redraw()` | Draw with blink applied (`closed` while blinking). |
| `flap()` | Next talk-flap mouth (`A, closed, O, A, closed, A, O, closed`). |

`rig.update(dt)` (04-art.js:983-987) blinks (0.12 s closed every 2-6 s) and, while `rig.talking`, flaps the mouth every
0.07-0.13 s; when talking stops it clears `over`. The world calls it every tick for shown actors and sets `talking`
from the dialogue typewriter (`world.talk(id, on)` → `rig.talk(on)`). Content composes faces:
`a.setExpr('sad'); a.rig.face.mouth('smile'); a.rig.face.tears = 1; a.rig.face.redraw();`
(34-content-…:1141).

### 9.7 Hair (`hair(L, hs)`, 04-art.js:579-627)

Hair is part of the **skinned body mesh** (bone `HEAD`), coloured `L.hair` × the `hair` tile; the face canvas paints a
matching hairline. The shell is the upper head rings scaled by `f`.

| `hairStyle` | Shell `f` | Mesh | Canvas hairline |
| --- | --- | --- | --- |
| `short` (default), `tidy` | 1.065 | Cap shell | Hairline at 16 (`tidy` 20) |
| `crop` | 1.03 | Tight shell | as short |
| `cap` | 1.04 | Slim shell to sit under a hat | as short |
| `slick` | 1.055 | Front lifted (quiff) | 25 |
| `messy` | 1.09 | Ragged rim + swept fringe with ragged tips | Jagged fringe |
| `ponytail` | 1.06 | Shell + 8-ring tail with a dark tie, lower end blended to the torso | as short |
| `bun` | 1.065 | Shell + bun at the back of the crown | as short |
| `long` | 1.09 | Curtain to y −0.12 (past the jaw) | Sides to 100 |
| `big` | 1.28 | Wide curtain to −0.02 | Sides to 100 |
| `bob` | 1.12 | Curtain to 0.02 | Bob shape |
| `curly`, `set` | 1.17 / 1.16 | Rippled shell, short curtain to 0.06, sides lowered | Sides to 100 |
| `mullet` | 1.065 | Back-only curtain to −0.06 | Sides to 100 |
| `bald` | 1.04 | Side/back band only | Side patches + scalp shine |
| `none` | — | No mesh | **Still paints the default hairline** (cover it with a hat/hood) |

Hair cannot be hidden at runtime (it is in the body mesh).

### 9.8 Attachments and attach points

Attach points: any bone in `rig.parts`, plus `rig.attach.gripL` / `gripR`, `Object3D`s at `(0, −0.085, 0)` under each
hand (the palm centre; 04-art.js:873). Hand props are built with their origin at the grip point.

```js
att(name, bone /* PART name or Object3D */, fn, vis = true, pos?, rot?)   // 04-art.js:868-872 (private)
```
Builds `new Mesh(geoOf(fn), atlas())`, sets name/visibility/pos/rot, parents it, stores it as `rig.attach[name]`.
Coordinates inside `fn` are the bone's local space in body units (head-worn things scale by `hs`).

| `rig.attach.*` | Bone | Default visible | Created when | Notes |
| --- | --- | --- | --- | --- |
| `gripL`, `gripR` | handL/handR | — | always | `Object3D` hold points |
| `phone` | gripR | no | always | Smartphone. Shown by `phone` anim unless the rig has a `brick` |
| `mug` | gripL | only if `L.mug === 'cup'` | always | `mug` (colour `L.mugCol`) or takeaway `cup` |
| `textbook` | gripR | no | always | `L.bookCol`; `L.book === 'newspaper'` makes a newspaper |
| `umbrella` | gripR | no | always | `L.umbrellaCol` |
| `brick` | gripR | no | `attach` has `brick` | 1980s brick phone |
| `stick` | gripR | yes | `stick` | Walking stick |
| `handbag` | gripL | yes | `handbag` | `L.bagCol` |
| `whistle` | gripR | yes | `whistle` | |
| `recorder` | gripR | no | `recorder` | Pocket voice recorder |
| `glasses` | head | yes | `L.glasses` | `'thick'`, `'reading'`, `'sun'`, anything else = thin rectangle. `L.frameCol`; `L.chain` adds a gold chain |
| `sunnies` | head | yes | `L.sunnies` | `'head'` (pushed up on the hair) or `'cap'` (on a cap's front) |
| `earbud` | head | yes | `earbud` | White bud in the left (+X) ear |
| `pen` | head | yes | `pen` | Biro behind the right ear |
| `goggles` | head | no | `goggles` | Band + lens |
| `headphones` | head | no | `headphones_head` | Band over the crown + two cups |
| `cap` | head | yes | `L.cap` | `porter`/`chauffeur` (peaked; porter has a badge), `flat`, `beanie`, else baseball cap. `L.capCol` |
| `scarf` | torso | yes | `L.scarf` | Array of stripe colours; wrap + two hanging ends |
| `headphones` | torso | yes | `headphones_neck` | Grey band + orange cups round the neck. **Same attach name as above** (last built wins) |
| `walkman` | hips | yes | `walkman` | Clipped on the right hip, outside a coat hem |
| `lanyard` | torso | `L.lanyardOn !== false` | `L.lanyard` | Strap in `CONFIG.colors.lanyard`; child `badge` mesh (`rig.attach.lanyard.userData.badge`) at chest `y = 0.24·k` using tile `badge_<L.lanyard>` |

Lanyard gotcha: a name without a `badge_<NAME>` atlas tile renders a **blank white badge** (no error).

Showing and hiding: `rig.attach.x.visible = bool`; `L.hide: ['walkman']` at build; an animation's `.shows` while it
plays (§11.2). The world's `actor.hold(obj | propName | null, 'L' | 'R')` (09-world-engine-b1.js:322-341) reparents any
object to a grip (centred on its bounding box) or, if it is bigger than 0.45 m, carries it in front of the root (player
speed × 0.6, `carry` gait). It remembers the object's home and puts it back on the next `hold`. Rue moves Chase's earbud
to his hand with `a.hold(a.rig.attach.earbud, 'L')` (23-content-…:53).

**Rigs are pooled across scenes.** Whatever content changes on a rig (visibility, reparented meshes, `tears`,
`root.rotation`, `seated`) persists into the next scene that spawns that look. Rue's 3.3 restores everything when the
scene is left (33-content-…:106-125, "leave it as found").

### 9.9 The rig object

| Field / method | Meaning |
| --- | --- |
| `id` | The look id (not the actor id). |
| `look` | The `LOOKS` entry (shared object; do not mutate). |
| `root`, `body`, `mesh`, `parts`, `face`, `attach` | See above. |
| `d` | Metrics for ANIMS: `T, shX, upper, fore, thigh, shin, footH, hipY, neckL, hs, hipX, s, nr, armY`, `chestZ = fz(0.28k)`, `bellyZ = fz(0.13k)`, `headC = T + neckL + 0.12·hs` (head centre, torso space), `armOut = L.armOut ?? 0.06 + belly·0.1`. Anims may temporarily change `d.headC` (Rue's `cap_tap`) but must restore it. |
| `height` | `L.h ?? 1.78` (metres). |
| `eye` | Eye height above the root in metres. |
| `seated`, `lying` | Set by poses (`sit` sets `seated`; gaits, `stand`, `lie`, `turn`, `pedal`, `pull`, `duck`, `back_turn` clear it). `lying` is reset every pose. |
| `talking`, `talk(on)` | Mouth flap. |
| `anim` | Name of the last posed animation. |
| `update(dt)` | Blink + talk flap. |
| `pose(name, t, p = {})` | Apply an animation (below). |

**`pose(name, t, p)`** (04-art.js:989-1015), called once per rendered frame per visible actor by the world with
`t = poseT + alpha·step` (09-world-engine-b1.js:1162):
1. `A = ANIMS[(name === 'idle' && L.idle) || name] || ANIMS.idle` — a look may substitute its own idle.
2. If `name` changed or `t` went backwards (a replay): snapshot all bone rotations + hips/armL/armR positions into a
   preallocated `Float32Array`; restore the previously shown attachment's visibility; restore a saved expression;
   clear a mouth override if not talking; show `A.shows`; save the expression and apply `A.expr`.
3. Reset every bone rotation to 0, the lanyard badge rotation, `lying = false`, and hips/armL/armR positions to rest.
4. If `A.upper`: run `ANIMS.sit` first when `p.sit || rig.seated`, else `ANIMS.walk` when `p.walk`.
5. `A(rig, t, p)`.
6. `L.stoop` (unless lying): torso +stoop, neck −0.45·stoop, head −0.35·stoop.
7. For `t < 0.2`: smoothstep-lerp every Euler component and the three positions from the snapshot (a 0.2 s cross-fade).

Rigs owned by a set (not the world) pose themselves: Rue's Redcliffe customers call
`c.rig.pose(c.a, c.at, WALKP); c.rig.update(dt);` from the set's `update` with a preallocated `WALKP`
(05-set-reddy-optus-redcliffe-2026.js:931-933, 1043).

### 9.10 Actor wrappers (world; see 04-world.md)

| Call | Effect on the rig |
| --- | --- |
| `world.spawn(id, where, { look })` | Pops a pooled rig of that look (or builds one), applies `LOOKS[look].expr`. Respawning an id with a different look despawns and swaps rigs. |
| `a.setExpr(name)` | `a.expr = name; rig.face.set(name)`. |
| `a.play(anim, { dur, loop, speed, still, h, yaw })` | Sets the actor's anim; one-shots (world table `ONE`: `nod 0.9, shake 1, shrug 1.2, give 1.4, lanyard_on 2, knock 1.2, glance 1.3, stand 1`, 09-world-engine-b1.js:220) and `loop: false` return to the previous anim after `dur`. While skipping, nothing is posed: the actor jumps straight to the return anim. |
| `a.p` | Persistent params passed to every pose: `{ dur, speed, walk, still, yaw, h }`. **`h` persists** until another `play` passes `h`. |
| `a.hold(obj, hand)` | §9.8. |
| idle substitutions | `poseOf` (09-world-engine-b1.js:360-366) poses `turn` while an idle actor turns > 0.4 rad, and `lanyard` while `a.mood === 'anxious'`. |
| upper + moving | `isUpper(n)` = upper and not a one-shot: such anims keep playing while the actor walks (`p.walk = true`, legs from `walk`). |

---

## 10. LOOKS

`LOOKS[lookId] = { ...fields }` (registry declared at 01-config.js:28). Every entry is built and warmed at boot.
Actor ids and look ids usually match; `world.spawn(id, at, { look })` decouples them.

### 10.1 Field reference (every field the builder reads)

**Build**

| Field | Default | Effect |
| --- | --- | --- |
| `h` | 1.78 | Height in metres (sets `s`). |
| `w` | 1 | Girth: torso, hips, limbs, neck (√w), hands, feet. |
| `sh` | 1 | Shoulder width. |
| `pads` | 0 | Shoulder pads (chest/shoulder rings and sleeve caps). |
| `belly` | 0 | Belly (can exceed 1; Luka is 1.25): torso depth, waist, pelvis, arm hang. |
| `fem` | false | Narrower waist, fuller chest, wider hips. (The shorter stride comes from `bottom: 'skirt'`, not `fem`.) |
| `stoop` | 0 | Radians of forward stoop applied after every pose; shortens the stride. |
| `head`, `headW`, `jaw`, `nose` | 1 | Head size, head width, jaw width, nose width/length. |
| `leg`, `torso`, `arm` | 1 | Leg, torso, arm **length** (`torso`, `arm` unused in Rue). |
| `arms`, `thighs`, `hands`, `feet`, `neck` | 1 | Thickness / size multipliers. |
| `neckLen` | 1 | Neck length. |
| `hips` | 0 | Extra hip width (unused in Rue). |
| `armOut` | 0.06 + belly·0.1 | Idle arm splay (radians). |

**Garments** (all baked into the skinned body mesh: cannot be toggled at runtime)

| Field | Values / default | Effect |
| --- | --- | --- |
| `top` | `'#777'` | Shirt/jacket colour: torso, sleeves, coat hem. |
| `top2` | `top` | Inner shirt, shown by `open`, `vneck`, and as the default collar colour for `shirt`/`open`. |
| `topTex` | none, `'tweed'`, `'knit'` | Atlas texture on torso, long sleeves and coat hem. |
| `open` | false | Front strip (face 9) shows `top2`; open coats get a dark front gap. |
| `vneck` | false | V of `top2` at the neck. |
| `lapels` | false | Notched lapels (lighter `top`). |
| `sleeve` | `'short'` | `'short'`, `'long'`, `'rolled'`, `'none'`. |
| `sleeveW` | 1 | Baggy sleeves. |
| `cuff` | skin | Colour at the wrist end of long sleeves (shirt cuffs). |
| `patches` | none | Elbow-patch colour (long sleeves). |
| `collar` | none | `'polo'` (collar + placket + 2 buttons), `'shirt'`, `'open'` (skin at the throat). |
| `collarCol` | polo: `top`, else `top2` | |
| `tie` | none | Tie colour. |
| `buttons` | none | `1` = one column, `2` = double-breasted. `buttonCol` default `'#c9a23a'`. |
| `zip` | none | Zip colour (front line). |
| `logo` | none | Atlas tile on the chest (`'yes_black'`, `'yes_blue'`). |
| `hivis` | false | Two reflective bands. |
| `hood` | none | Colour of a **down** hood behind the neck (body mesh). |
| `apron` | none | Apron colour (bib + skirt blended to the legs). |
| `untuck` | none | Length of an untucked shirt tail. |
| `belt` | none | Belt colour (a ring at the waist; also colours the pelvis band). |
| `coat` | none | **Hem length below the waist** (body units): a flared skirt around the hips in `top` (or `topTex`), front blended up to 60% to the thighs. Rue uses 0.12-0.5. |
| `bottom` | `'trousers'` | `'jeans'` (denim + faded knees from `fade`), `'shorts'`, `'skirt'` (`skirtLen` default 0.5; colour `pants`; bare legs `legCol`). |
| `pants` | `'#333'` | Trousers/shorts/skirt colour. |
| `fade` | `pants` | Jeans knee fade colour. |
| `pleats` | false | Front crease on trousers. |
| `legCol` | skin | Bare legs / tights. |
| `socks` | none | Sock colour with bare legs. |
| `shoes` | `'shoe'` | `'sneaker'`, `'shoe'`, `'loafer'`, `'boot'`, `'welly'` (shin becomes boot), `'thong'` (flip-flops). |
| `shoeCol` / `soleCol` / `toeCol` | `'#222'` / `shade(shoeCol, 0.6)` / none | |
| `gloves` | skin | Palm colour. **The thumb stays `L.skin`** (04-art.js:815). |
| `neckCol` | skin | Neck colour. |

**Face**

| Field | Default | Effect |
| --- | --- | --- |
| `skin` | **required** | Skin colour. |
| `eyes` | `'#5a3b28'` | Iris colour. |
| `eyeScale` | 1 | Eye size. |
| `lids` | 0 | Heavy upper lids 0..1. |
| `lash` | false | Heavier line + outer flick. |
| `lineCol` | `'#2a1b15'` | Eye line colour. |
| `brow`, `browW` | `shade(hair, 0.8)`, 3.3 | Brow colour, thickness. |
| `lips`, `mouthInk` | mix(skin, red), shade(lips) | |
| `blush` | 0 | Cheek alpha 0..1. |
| `freckles` | false | |
| `age` | 0 | 0..1 lines (nasolabial, crow's feet, forehead). |
| `tired` | false | Eye bags. |
| `beard` | none | `'full'` (painted beard + moustache, lower lip showing) or `'stubble'`. |
| `beardCol` | hair | |
| `moustache` | none | Colour of a painted moustache. |
| `hair`, `hairStyle` | `'#3a2a1e'`, `'short'` | §9.7. |

**Accessories and behaviour**

| Field | Effect |
| --- | --- |
| `glasses`, `frameCol`, `chain` | §9.8. |
| `sunnies` | `'head'` / `'cap'`. |
| `cap`, `capCol` | §9.8. |
| `scarf` | Array of stripe colours. |
| `lanyard`, `lanyardOn` | Badge name; `false` = start hidden. |
| `attach` | Array of optional attachments: `brick, stick, handbag, whistle, recorder, earbud, pen, goggles, headphones_head, headphones_neck, walkman`. |
| `hide` | Array of attach names hidden at build. |
| `mug` (`'cup'`), `mugCol`, `book` (`'newspaper'`), `bookCol`, `umbrellaCol`, `bagCol` | Prop variants/colours. |
| `expr` | Default expression (applied at build and at every spawn). |
| `idle` | Anim used whenever `'idle'` is posed. |

### 10.2 Rue's LOOKS (04-art.js:1031-1101)

Shared presets: `polo = { top: polo black, sleeve: 'short', collar: 'polo', logo: 'yes_black' }`,
`blue = { top: chaseBlue, …, logo: 'yes_blue' }`.

| Look | h | Build / face | Hair | Outfit | Attachments / behaviour |
| --- | --- | --- | --- | --- | --- |
| `luka` | 1.78 | w 1.3, sh 1.08, belly 1.25, big neck/arms/hands/feet, jaw 1.12, armOut 0.2 | ponytail; beard full | black Yes polo untucked, black trousers, black sneakers white soles | lanyard LUKA |
| `chase` | 1.80 | w 0.88, headW 0.95, jaw 0.92, blush | messy; stubble | blue Yes polo, jeans, white sneakers | lanyard CHASE (off), earbud, goggles, headphones_head, recorder |
| `rue19` | 1.82 | w 0.95, sh 1.16, pads, lids | slick | navy open jacket with lapels, rolled sleeves, pink shirt, coat 0.27, pleated chinos, belt, loafers, scarf | brick, walkman, headphones_neck; expr smug; walks with `swagger` (world) |
| `rue58` | 1.80 | age 0.8 | tidy grey | navy suit, open collar, coat 0.16 | glasses reading; brick, walkman, headphones_neck (walkman/headphones hidden) |
| `des` | 1.72 | belly 0.5, age 0.9 | cap; moustache | porter's coat 0.34, vneck, double buttons | cap porter |
| `bernie` | 1.63 | fem, age 0.45, lash | bun | knit vneck, apron, skirt | glasses reading + chain |
| `declan` | 1.75 | freckles | messy | zip hoodie (hood down), coat 0.12 | glasses thick, pen |
| `declan58` | 1.74 | age 0.75 | short grey | knit vneck over shirt | glasses thick |
| `hartigan` | 1.76 | age 0.9, lids | bald | tweed jacket, lapels, elbow patches, tie | glasses reading |
| `margaret` | 1.55 | fem, age 1, stoop 0.18 | set | knit cardigan, skirt | stick, handbag |
| `dazza` | 1.80 | belly 0.6 | crop; stubble | hi-vis orange polo, shorts, socks, boots | cap, sunnies on cap |
| `luke` | 1.83 | tired, lids | short | Yes polo | lanyard LUKE; `mug: 'cup'`; idle `carry_mug` |
| `jordan` | 1.72 | | curly | blue Yes polo, khaki trousers | lanyard JORDAN; expr talk |
| `siobhan` | 1.66 | fem, freckles, lash | big | knit jumper, jeans, boots | |
| `ronan` | 1.90 | leg 1.05, lids | messy | tweed duffle coat 0.35, hood down, scarf | |
| `fiachra` | 1.74 | | long; stubble | open shirt jacket | beanie, whistle; idle `whistle` |
| `mick` | 1.78 | belly 0.5, age 0.6 | cap; stubble | knit zip jumper, wellies | flat cap |
| `nuala` | 1.70 | fem, lash | bob | open coat 0.5, skirt | glasses `round` (renders as default rectangles) |
| `driver` | 1.80 | | crop | black suit, tie, coat 0.16 | |
| `young_dev` | 1.76 | | messy | grey hoodie (hood down), jeans | glasses thick |
| `grandson` | 1.74 | head 1.03 | messy | maroon tee, shorts | |
| `finalist` | 1.80 | | slick blond | grey suit, tie, double buttons | expr smug |
| `student_a`…`h` | 1.62-1.84 | 1987 extras (128 px faces) | big, mullet, long, short, bob, curly, curly, slick | knitwear, duffles, scarves, jeans/skirts | |
| `customer_a`…`d` | 1.66-1.79 | 2026 Redcliffe extras (128 px faces) | crop, long, cap, messy | singlets/tees, shorts/skirt, thongs/sneakers | sunnies on heads, a cap. **`customer_a` is the fallback look for unknown ids.** |

---

## 11. ANIMS

### 11.1 Contract

```js
ANIMS[name] = (rig, t, p) => { /* write rig.parts.*.rotation, maybe hips/armL/armR .position */ };
ANIMS[name].upper = true;       // optional flags
ANIMS[name].shows = 'mug';      // or (rig) => attachName
ANIMS[name].expr  = 'laugh';
```

- `t` = seconds since this animation started (resets on a replay). `p` = the actor's params (`dur, speed, walk, still,
  yaw, h`) or `{}`.
- The pose is reset to rest before the call (§9.9 step 3). Write absolute values to override, `+=` to layer on a base.
- Only `hips.position`, `armL.position`, `armR.position` are reset and blended. Do not move other bones' positions.
- Set `r.seated` / `r.lying` if the pose is seated/lying (or clears sitting).
- **No allocation.** Preallocate at registration (Rue's `set_down` keeps its quaternion arrays outside the closure).
- One-shots read `p.dur` with a default: `const u = once(t, p, 0.9)`. Register the default duration in the world's `ONE`
  table so `play()` returns automatically, or call `play(name, { dur, loop: false })`.

### 11.2 Flags

| Flag | Effect |
| --- | --- |
| `.upper` | Upper-body only: `pose()` first runs `sit` (if `p.sit` or `rig.seated`) or `walk` (if `p.walk`). Non-one-shot upper anims keep playing while the actor moves. |
| `.shows` | Attachment made visible while the anim plays; its previous visibility is restored when the anim changes. A function receives the rig (`phone` shows `brick` if the rig has one). |
| `.expr` | Expression applied while playing; the previous expression is restored on change (overwriting any `setExpr` made meanwhile). |

### 11.3 Built-in animations (04-art.js:1162-1414)

U = upper, 1 = one-shot (world `ONE`), S = shows, E = expr.

| Name | Flags | What it does |
| --- | --- | --- |
| `idle` | U | Arms hang (unless seated), breathing, slight hip sway, slow head drift. |
| `walk` | | Gait at 7.2·`p.speed` rad/s; skirts/stoops shorten the stride. |
| `run` | | Faster, longer stride, forearms bent, lean 0.18. |
| `carry` | | Slow gait, both arms forward at chest height (big held objects). |
| `swagger` | | Rue's walk: hip and torso twist, arms out, chin up. |
| `sit` | | Hips at `p.h` m (default 0.46) seat height; IK legs to the floor; hands on thighs; sets `seated`. |
| `stand` | 1 (1 s) | From seat height `p.h` to standing; torso leans forward through the rise; clears `seated`. |
| `lie` | | Flat on the back on the floor. |
| `lie_tangled` | | Sprawled on the floor, limbs tangled. |
| `turn` | | Stepping on the spot (the world picks it while an idle actor turns). |
| `point` | U | Right arm points forward, slight torso turn. |
| `phone` | U, S `brick`/`phone` | Right hand at the ear, head tilted. |
| `type` | U | Both hands typing at desk height (seated) or counter height (standing), head down. |
| `pedal` | | Pedalling on a saddle at `p.h` (default 0.84 m), `p.speed`; hands on bars. |
| `pull` | | Braced legs, leaning back, both hands yanking rhythmically. |
| `hands_head` | U | Both hands on top of the head (exasperation; Chase's top-down). |
| `head_hands` | U | Head in hands, leaning forward (deeper when seated). |
| `lanyard` | U | Fiddles with the lanyard badge at the chest (anxious tell); `p.still` stops the badge spin. |
| `nod` | U, 1 (0.9) | Two nods. |
| `shake` | U, 1 (1) | Decaying head shake. |
| `shrug` | U, 1 (1.2) | Shoulders up, palms out, head tilt. |
| `laugh` | U, E `laugh` | Leaning back, hand on belly, shaking. |
| `cry` | U, E `crying` | Hunched, hands to the face, sobbing shake. |
| `wave` | U | Right arm up, waving. |
| `pour` | U, S `mug` | Left hand holds the mug at the chest, right hand raised and tilted, pouring into it (give it a kettle/jug via content). |
| `drink` | U, S `mug` | Sips every 4 s. |
| `carry_mug` | U, S `mug` | Mug held at the chest (Luke's idle). |
| `look_up` / `look_down` | U | Head and neck up / down. |
| `write` | U | Left hand flat, right hand scribbling, head down. |
| `give` | U, 1 (1.4) | Right arm reaches out to hand something over and back. |
| `lanyard_on` | U, 1 (2) | Both hands lift the lanyard over the head and down; **makes `attach.lanyard` visible at 55%**. |
| `hug` | U | Arms round someone; **rig id `luka`** instead flaps his hands, not knowing where to put them. |
| `knock` | U, 1 (1.2) | Three knocks at head height. |
| `duck` | | Crouch, torso forward, arms forward. |
| `sleep` | E `sleep` | Seated: slumped, head lolled. Otherwise lying on the side, curled. |
| `fake_call` | U, S `brick` | Phone at the ear, other hand gesturing wildly. |
| `back_turn` | | Hips turn 180° over 0.6 s, arms tucked in front (hiding something). |
| `chew` | U | Head bob + mouth override `closed`/`O`. |
| `tap` | U | Right hand taps (a desk, a screen). |
| `clap` | U | Claps at the chest. |
| `wipe` | U | Leaning forward wiping a surface in circles with the right hand. |
| `umbrella` | U, S `umbrella` | Holding an umbrella up. |
| `reading` | U, S `textbook` | Book held in both hands, head down. |
| `glance` | U, 1 (1.3) | Head + neck turn to `p.yaw` (default 0.9 rad) and back. |
| `whistle` | U | Hands at the mouth blowing a whistle (Fiachra's idle). |

The `.upper` list is a space-separated string at 04-art.js:1411. **Every name in it must exist**: a typo throws while
`04-art.js` evaluates, which (as an engine fragment) takes the whole game down.

### 11.4 Private helpers inside the ANIMS IIFE (04-art.js:1109-1161)

Not reachable from other fragments. Content anims in Rue therefore *compose* existing anims instead (see §11.5).

| Helper | Signature | Notes |
| --- | --- | --- |
| `ik` | `ik(up, lo, tx, ty, tz, a, b, px, py, pz, knee)` | Two-bone IK: aims `up` so the end of `lo` lands on the target in `up`'s parent space; pole hint `p`. |
| `arm` | `arm(r, sd, x, y, z, px = 0.5, py = -1, pz = -0.4)` | Hand target in **torso space** (`sd` +1 left / −1 right; x is mirrored by `sd`). Default elbow down, back, out. |
| `leg` | `leg(r, sd, x, y, z, pz = 1)` | Ankle target in **hips space**. |
| `flat` | `flat(r)` | Feet flat to the floor. |
| `hang(r, t)` | | Arms hanging with `armOut` and a slight sway. |
| `breathe(r, t, a = 1)` | | Torso/head breathing (`+=`). |
| `base(r, t)` | | `hang` unless seated, + `breathe`. |
| `once(t, p, def)` | | `clamp(t / (p.dur ‖ def), 0, 1)`. |
| `hipsY(r, m)` | | Metres → body units. |
| `gait(r, t, sp, legA, knee, armA, fore, bob, lean)` | → `sin(phase)` | Shared walk cycle; clears `seated`. |
| `sit(r, t, p)` | | Also `ANIMS.sit`. |

Useful torso-space hand targets (body units; `y = 0` is the waist): ear `(0.1·hs, headC − 0.17, 0.07)`; top of the
head `(0.1·hs, headC + 0.1·hs, −0.02)`; chest front `(0.1, 0.26, chestZ + 0.22)`; counter (standing) `(0.1, −0.02, 0.36)`;
desk (seated) `(0.1, 0.2, 0.36)`; knock height `(0.12, headC − 0.12, 0.44)`. A world height maps to standing torso
space as `y = worldY / d.s − d.hipY − 0.06`.

### 11.5 Animations Rue registered from content (NOT in TWO's `src/`)

| Name | File | Pattern worth copying |
| --- | --- | --- |
| `stumble` | 14-minigames-…:23 | Raw one-shot written with `sin(u·π)` (no helpers). |
| `book_walk` | 19-minigame-blend-in…:13 | `walk` + `reading`, `.shows = 'textbook'`. |
| `bop` | 23-content-…:55 | Upper loop layered on `idle` unless walking (head nod at 88 bpm). |
| `fold` | 27/32-content | `clap` frozen at t = 0 (hands together). |
| `cap_tap` | 30-content-…:26 | Temporarily raise `r.d.headC`, call `ANIMS.phone`, restore. Reuses the IK from outside. |
| `set_down` | 31-content-…:258 | Slerp between snapshots of other anims with preallocated quaternions. |
| `lift_head`, `back_hand` | 31-content-…:398-413 | `idle` + `+=` offsets eased over `p.dur`. |
| `bow`, `hands_halt` | 32-content-…:33-58 | `hands_halt` = Chase's hands rising toward his head and stopping (TWO needs it). |
| `*_bare`, `mouth_bare`, `phone_mouth`, `collar` | 34-content-…:30-40 | Wrapper without `.shows` to play a pose without its prop. |

Guard registrations with `if (!ANIMS.x)` so a re-evaluated fragment doesn't double-register.

---

## 12. Recipes

### 12.1 Add a character look

1. Add the entry to the `LOOKS` `Object.assign` block in `src/04-art.js` (TWO's ARCHITECTURE puts all LOOKS there).
   Start from the closest Rue look; required in practice: `h, w, skin, hair, hairStyle, eyes, brow, top, sleeve, pants,
   shoes, shoeCol`.
   ```js
   jayden: { h: 1.82, w: 1.12, belly: 0.3, skin: '#c98a5f', hair: '#4a3020', hairStyle: 'crop', beard: 'stubble', beardCol: '#3a2418',
     eyes: '#4a5a3a', brow: '#3a2416', top: '#ff7b1c', hivis: true, sleeve: 'short', collar: 'polo', pants: '#3e4450',
     shoes: 'boot', shoeCol: '#8a5a2b', toeCol: '#9aa0a6', cap: 'cap', capCol: '#2c3440' },
   ```
2. Add the speaker to `CHARACTERS` (01-config) if it talks. The portrait is baked at boot from the 3D bust.
3. Extras: use a prefix that gets the 128 px face (update the regex at 04-art.js:863 for TWO's prefixes, §13.7).
4. Spawn: `world.spawn('jayden', 'mark', {})` or `{ look: 'jayden' }` for another actor id.
5. Check it: `node tools/run.mjs --q "scene=1.5&…" --shots out/x` and read the PNGs (face, hairline, hem vs legs while
   walking, attachments at the right bone).

### 12.2 Add an attachment

Pick the tier:

| Tier | When | How |
| --- | --- | --- |
| A. LOOKS-driven, built with the rig | Worn things that belong to a look and only toggle visibility (hat, beard, chip light, headphones) | In `buildCharacter` after line 959: `if (has('santa')) att('santa', 'head', () => { …loft/box/ring… }, false);`. Coordinates in bone space (body units, × `hs` on the head). Toggle `rig.attach.santa.visible`. |
| B. Built at runtime by content | One-off props handed to someone | `const b = new Builder(); …; const g = b.done(); g.name = 'x'; a.rig.attach.gripR.add(g)` once, then toggle. Or `a.hold(g, 'R')`. Remove/restore it when the scene ends (pooled rig). |
| C. Skinned and toggleable | Garments that must deform **and** come off (trench coat, hood down) | A second `SkinnedMesh` bound to the same skeleton (§13.2). |

Material: `att()` always uses `atlas()`. For emissive or a private texture, create the mesh yourself:
`const m = new THREE.Mesh(geoOf(fn), mat(…)); parts.head.add(m); attach.name = m;`.

### 12.3 Add an animation

Engine side (preferred, so it can use `arm/leg/ik`): add a property to the `A` object in the ANIMS IIFE and its name to
the `.upper` string if upper-body. Example (proposal for TWO's `polish`):

```js
polish(r, t) {   // two hands rubbing a counter-height surface in counter-phase circles
  const P = r.parts, d = r.d, y = r.seated ? 0.2 : -0.02, c = C(t * 6), s = S(t * 6); breathe(r, t);
  arm(r, 1, 0.14 + 0.05 * c, y, 0.42 + 0.05 * s, 1, -0.6, -0.4);
  arm(r, -1, 0.14 - 0.05 * c, y, 0.42 - 0.05 * s, 1, -0.6, -0.4);
  P.handL.rotation.x = 0.9; P.handR.rotation.x = 0.9; P.torso.rotation.x += 0.3; P.head.rotation.x = 0.25;
},
```

Content side: compose (`cap_tap`, `bop`, `lift_head` patterns), or ask the engine owner to expose the kit. Then add
one-shots to the world's `ONE` table with their default duration.

---

## 13. How to extend for TWO

### 13.1 The cast

Delete Rue-only looks from TWO's `LOOKS` (every entry costs a rig build, a compile, a portrait and memory at boot, and
a stray `world.spawn('des')` would build Rue's porter, while TWO's Des is a kettle): `rue19, rue58, des, bernie, declan,
declan58, hartigan, margaret, dazza, siobhan, ronan, fiachra, mick, nuala, driver, young_dev, grandson, finalist,
student_*`. Keep `customer_a…d` (they are the "2026 Redcliffe customers in shorts and thongs") or rename them, **but
keep a fallback**: 04-art.js:675 falls back to `LOOKS.customer_a`, and an unknown id with no fallback crashes.

Proposed TWO looks (fields marked NEW need the builder changes in §13.2):

| Look | Base | Key fields |
| --- | --- | --- |
| `luka` | Rue `luka` | + `lanyardCol` faded blue (NEW), badge back "1158" (NEW), `attach: ['santa']` hidden until flag `santa` |
| `chase` | Rue `chase` | `lanyardOn: true`, bright `lanyardCol`; earbud; `headphones_head` hidden (shown from L12) |
| `chase40` | new | h 1.8, w 0.9; `hairStyle: 'bob'` or `'long'` (longer), stubble greying, `age: 0.35, tired, lids: 0.25`; trench: `top` tan, `top2` grey, `open, lapels, buttons: 2, sleeve: 'long', sleeveW: 1.15`, long coat (NEW `coatLen`/sway); `headphones_neck` (recoloured); `chipLight` (NEW); `scarHand: 'R'` (NEW); lanyard `CHASE40` + scorch (NEW) |
| `luka40` | Rue `luka` | grey-streaked ponytail, stubble greying, `scar: 'jawR'` (NEW), long dark coat with high collar (NEW), `gloves: '#111'` (+ thumb fix), faded lanyard flipped to "1158" (NEW), hood up/down (NEW) |
| `jordan` | Rue `jordan` | khaki trousers already; lanyard JORDAN |
| `jordan40` | `jordan` | `age: 0.35`, lanyard MANAGER (NEW badge), `chipLight` |
| `luke` | Rue `luke` | as is |
| `luke40` | `luke` | sunburnt skin, `blush: 0.45, age: 0.6`, greyer hair, `apron` + text (NEW), tongs prop (NEW), maybe `idle: 'sizzle'` |
| `rue` | Rue `rue58` | 72: `age: 1`, white `hair`, cardigan: `topTex: 'knit', open: true, buttons: 1`, `glasses: 'reading'`, brick in a pocket (NEW small torso attachment) |
| `teddy` | `margaret`-style stoop | 84: `stoop: 0.15, age: 1`, cardigan, `cap: 'flat'` |
| `mia` | | 16, `fem`, `cap: 'beanie'`, oversized flannel (`sleeveW: 1.3, open: true`, NEW `topTex: 'plaid'` tile), jeans; ukulele prop (NEW) |
| `nadia` | | `fem`, cardigan, `tired, lids`, corporate lanyard (NEW colour/badge), antler headband (NEW) |
| `jayden` | Rue `dazza` | younger, hi-vis, cap, boots (§12.1) |
| extras `cust26_*`, `local40_*`, `staff_*`, `whisper_*`, `passenger_*` | Rue customers/students | 128 px faces; `local40_*` get `chipLight`; `staff_*` antlers + `goggles` |

### 13.2 Building each special item

**Trench coat with sway (chase40, and luka40's long coat).** Today `coat` is one flared ring segment from the waist to
`−coat`, front vertices blended ≤ 60% to the thighs, back rigid on the hips (04-art.js:731-739). Fine to ~0.35; a knee-
or calf-length coat (0.6-0.75) will be crossed by the shins when walking. Steps, cheapest first:
1. Multi-ring hem: 4-5 rings down to `−len`, flare growing with depth, and a blend that grows with depth for the front
   (to ~0.8) **and** the back (to ~0.3, to the same-side leg). The back then swings with the stride: that is most of
   the "sway". Keep `open` (dark front gap at face 9) for an open trench.
2. Inertial sway: add a bone `coat` **at the end of `PART`** (index 16, parent hips at `(0, −0.02, −0.06)`), skin the
   back panel to it via `G.blend`, and in `pose()` after the anim (before the 0.2 s blend) set
   `parts.coat.rotation.x/z` from a damped spring advanced in `rig.update(dt)` (input: the root's world velocity and
   yaw rate, read with a preallocated `Vector3`). **Fix the hard-coded snapshot offsets** `48/51/54` in `pose()`
   (04-art.js:993, 1013) to `PART.length * 3 + 0/3/6` first, or the hips/arm positions blend into garbage.
3. Throwable coat (boss "Coat" ability): the coat must be removable, so build it as **tier C**: a second skinned mesh.
   Build it before `body.scale.setScalar(s)` (04-art.js:859) so the bone matrices are still at rest scale:
   ```js
   const cg = geoOf(() => { /* hem rings, coat sleeves (sleeveW 1.2 over the body sleeves), lapels, pockets */ },
     PART.map((n) => parts[n].matrixWorld));
   const coat = new THREE.SkinnedMesh(cg, skinMat); coat.frustumCulled = false; coat.name = 'coat';
   body.add(coat); coat.bind(mesh.skeleton, mesh.bindMatrix); attach.coat = coat;
   ```
   +1 draw call for chase40 only. The thrown coat is a separate Builder prop in the world; hide `attach.coat` during the
   15 s cooldown. Sticky notes, cables and the music slate in the pockets: small boxes in the same geometry.

**Hoods.** `L.hood` is a down hood baked into the body mesh (cannot toggle). For luka40:
- `hood_down`: a torso attachment copying 04-art.js:791 (`ring(8, T − 0.03, nr + 0.05, …, 1.4, TAU − 1.4)`), and
- `hood_up`: a head attachment: an outer shell + slightly smaller reversed inner shell (like `hair`'s `cur`,
  04-art.js:609-612) with radius factor ≈ 1.25 (clears the ponytail's 1.06 shell), open over the face (arc ≈ 0.9 to
  TAU − 0.9), dropping to the neck at the back. Toggle the two.
- The ponytail tail sticks out at z −0.17·hs. Either let the high collar hide its lower end, or use two looks
  (`luka40_hood` with `hairStyle: 'crop'` + hood up, `luka40` with ponytail) and swap at a cut with
  `world.spawn('luka40', at, { look: 'luka40_hood' })` (both pooled at boot, so the swap builds nothing).
- Silhouette shots: the face is a lit texture. For pure silhouette, darken via env/lighting, or give the masked look a
  very dark `skin` and no face detail (separate look id).

**Santa hat + beard over the real beard (luka from 2.1).** Luka's beard is paint on the face canvas (no geometry), so the
fake beard is simply a mesh in front of it. Two head attachments, hidden by default, shown when flag `santa`:
- `santa_hat`: fur brim `loft` (rings at y 0.17-0.215·hs, radius ≈ 0.11·hs·hw, slightly outside the ponytail shell),
  red cone of 4-5 rings drifting toward −z and +x as they shrink (the flop), a white pom-pom. For a little bounce, put
  the cone tip + pom-pom on a child pivot and rotate it from a spring in `rig.update` (no allocation).
- `santa_beard`: outer + reversed inner curtain (`ring(10, y, …, a0 = −1.9, a1 = 1.9)`, front arc) from y ≈ −0.09·hs
  (hangs onto the chest) up to y ≈ 0.035·hs, and a separate moustache band y 0.05-0.075·hs, each ~0.01 in front of
  the face surface. **Leave the slit at y 0.035-0.05·hs** (the painted mouth is at 0.043·hs) so talk flaps stay visible;
  a `wire` hook over each ear. White with a faint `shade` on the lower ring.
- Pooled rig: set both visibilities from the flag at every spawn, not once.

**Headphones.** Use the existing `headphones_head` (hidden) and `headphones_neck` (visible), but (1) give them distinct
attach names (both are stored as `headphones`; a rig with both keeps only the last), (2) add `L.phonesCol` (Rue's
neck pair has orange 1980s foam cups), and (3) for chase40 "never on his ears", use only the neck pair. "Hold
headphones up" / "put headphones on someone" need a free-standing copy: clone the mesh (Rue's `putDown` pattern,
31-content-…:36-48), `hold()` it in a grip, then reparent it to the other rig's `parts.head` at the `headphones_head`
offset, and put everything back when the scene ends.

**Gloves.** `L.gloves` colours the palm loft only; the thumb loft uses `L.skin` (04-art.js:815). Change it to `hc`.
Gloves are body mesh (cannot come off); if a glove must come off on screen, make a gloved hand an attachment.

**Burn scars.**
- Back of chase40's **right** hand: the right hand is at −X and the paddle is thin in X, so the back of the hand is
  the `ring(6, …, a0 = 0)` sides `i = 3, 4, 5` (outward, −X). Make the hand loft's colour a function:
  `(sg, i) => sx < 0 && L.scarHand && i >= 3 && i <= 5 ? (sg % 2 ? '#c98274' : '#b06a5f') : hc`, or return
  `[colour, 'scar']` with a small greyscale scar tile painted in the atlas's free strip (y 232-255).
- luka40's jaw-to-neck scar: paint the jaw part on the face **base** canvas in `faceKit` (canvas left = his right;
  jaw edge around x 0-20, y 95-128) as mottled pink/shiny strokes behind an `L.scar` field; continue it down the neck
  by making the neck loft colour (04-art.js:790, ring of 6, side `i = 4` faces −X) a function.
- The face base is painted once per rig: a scar that appears/disappears needs a second look or a decal mesh.

**Chip light** (chase40, jordan40, 2040 locals). A tiny emissive dot behind the **right** ear (−X):
```js
if (L.chipLight) {
  const sx = -(0.083 * hs * hwOf(L) + 0.005);   // head surface behind the right ear (-X), not HX (the head's widest point)
  const m = new THREE.Mesh(geoOf(() => box(0, sx, 0.115 * hs, -0.04 * hs, 0.012, 0.012, 0.008, '#bfe6ff')),
    mat(0xffffff, { emissive: 0x6fc8ff, emissiveIntensity: 1.4, key: 'chip_' + id }));   // white: the vertex colour tints
  m.name = 'chip'; parts.head.add(m); attach.chip = m;
}
```
Lambert without a map (a program the sets already compile). Keyed per look so its intensity can pulse or switch off
(`chip.forceOff`) without touching other rigs. If it must be visible in the dark, add a tiny additive sprite later, but
warm that program at boot.

**Lanyards and badges.** Needs: faded blue (luka), bright (chase), scorched old "CHASE · SENIOR CASUAL" (chase40),
MANAGER (jordan40), faded flipped "1158" (luka40), corporate (nadia). The atlas has room for none of these. Recommended:
- `L.lanyardCol` replacing `CONFIG.colors.lanyard` in the strap (04-art.js:939); a scorch = a dark colour on one strap
  segment (the strap is built per segment, 04-art.js:946-947).
- Give the badge its own texture: the badge is already a separate mesh (04-art.js:952-958), so
  `matTex(canvasTex(128, 80, paintBadge, { key: 'badge_' + text }))` costs no extra draw call and no new program. Paint
  at 2× for the long "CHASE · SENIOR CASUAL". Add a back quad facing −Z with the biro "1158" (Luka's badge back;
  luka40's "flipped" badge = rotate the badge mesh `rotation.y = π`).
- Lanyard twist is the existing `lanyard` anim (`a.mood = 'anxious'` makes it his idle).

**Other worn/held items.** Antler headband: head attachment, a band ring at y ≈ 0.2·hs plus `bar()` branches.
Safety goggles: existing `goggles` (pushed up on the forehead with `pos`). Bandages (3.7): white band rings on the
head or the forearm (`foreR` attachment), not paint. Apron text "KISS THE COOK (SAFELY)": `L.apron` gives the shape;
add a textured quad attachment on the torso at `fz(y) + 0.012`. Tongs, ukulele (stickers = a small keyed canvas
texture), the Remote, the music slate, a muesli bar: `HELD`-style builders on `gripR`/`gripL`, hidden by default and
shown by an anim's `.shows` or by content. The Tether: a coiled loop prop in the grip; the extended cable is a world
object (a thin box re-scaled along the throw vector every frame with preallocated vectors), not part of the rig.

### 13.3 Animations TWO needs (spec §14)

| Needed | Build it as |
| --- | --- |
| polish (two-handed rub) | New upper anim (§12.3). |
| lift-strain (roller door, brass plate) | New: hips lowered (`duck`-like, 0.75), legs IK, both hands IK to a bar rising with `once()`, tremble `0.01·sin(t·30)`, `.expr = 'determined'`. |
| climb (ladder, pole) | New full-body loop: alternating arm targets on rungs above `headC`, alternating leg IK; the world's `moveTo` already interpolates y toward a higher mark. |
| lanyard twist | Existing `lanyard`. |
| glance | Existing `glance` (`play('glance', { yaw })`). |
| head-in-hands / top-down | Existing `head_hands` / `hands_head`. |
| hands-rise-and-stop | Port Rue's `hands_halt` (32-content-…:48-58). It lacks `.upper` in Rue; decide deliberately. |
| scooter ride (driver / pillion) | Driver: `pedal`-like standing (legs IK to a deck at `p.h`, hands on bars). Pillion: `sit` with `p.h` + hands IK to the driver's waist. |
| tether throw and yank | One-shot throw (arm wind-up overhead, release forward ~0.6 s) then a one-armed `pull` variant. Register both in `ONE`. |
| chip ping (hand to the temple) | `phone` with the target raised toward the temple (the `cap_tap` trick) + a flinch; one-shot. |
| coat throw | One-shot: both arms sweep from the shoulders forward/up; hide `attach.coat` at release (in content, not the anim, for skip-safety). |
| type on phone | `type` with targets at chest height and close (`z ≈ chestZ + 0.12`), `.shows = 'phone'`. |
| hold headphones up / put on someone | Upper anims with both hands at face height; target height from `p.h`. |
| cry / big helpless laugh | Existing `cry`; `laugh` plus a doubled-over variant (torso +0.5, hands to the knees). |
| bandage | Left hand circling the right forearm (`arm()` targets orbiting the right wrist). |
| sit on bench / on the floor against a wall | `sit` with `{ h: 0.45 }`; floor: new pose, `hips.position.y = hipsY(r, 0.12)`, knees up via `leg()` to feet near the hips, torso −0.1 (leaning back). |
| get up hurt | `stand` variant from floor height, one hand on the ribs, `.expr = 'worried'`. |
| wave arm (swatting drones / pop-ups) | `wave` with a wide fast sweep. |
| sizzle-flip | `tap` variant with the wrist turning (`handR.rotation.z`), `.shows = 'tongs'`. |
| hum | `idle` + head sway + mouth override `closed` (the `chew` pattern), eyes `half`. |
| pull cracker | Upper one-shot: both hands forward at chest, a yank near the end; two actors face each other. |

New expressions TWO will want (edit the private `EXPR` table): `hurt` (half / worried / grimace), `suspicious` (half /
smug / closed), `tired` (half / neutral / closed). Luke's rising left eyebrow (9.2) needs a numeric brow parameter in
`faceKit.brow` (and in `draw()`'s change check), or do it on the UI portrait.

### 13.4 Drones (art side)

Build the drone body once with a Builder using **one** white material and pre-tinted parts, take the merged geometry,
and render fleets with `instanced()`: the L30 hangar's hundreds (static) and the roof ring of 400 (moving: per-frame
`setMatrixAt` with preallocated objects, `frustumCulled = false`). State colours (blue / amber / red / Yes yellow) via
`setColorAt` on a separate small "light" InstancedMesh. Emissive is a material uniform, not per instance, so use one
material per state colour, or an unlit material with `instanceColor` (a new program: warm it at boot). A handful of
patrol drones can be individual meshes from `.clone()` of one built group (shared geometry and materials). Blob shadows
for hovering drones stay on the floor (§8).

### 13.5 Performance rules and pitfalls

- **No per-frame allocation** in ANIMS, `rig.update`, spring/sway code, set `update`. Scratch objects at module or
  registration scope.
- **Merged geometry**: one Builder per set (and per animated prop), materials from `mat()`; target < 300 draw calls.
  Each actor costs 2 + visible attachments. A crowd of 15 rigged extras is 30-60 calls plus 15 face canvases.
- **Instancing** for every repeat (railings, lamps, lanterns, bollards, drones, cobbles, docked drones).
- **Big crowds** (choir, HQ staff): prefer a few rigged extras in front and static stand-ins behind (a posed rig baked
  to static geometry, or simple instanced low-detail figures).
- **Faces**: every face redraw re-uploads its texture (blink every few seconds; ~10/s while talking). Use 128 px faces
  for extras (§13.7).
- **Pool rigs**: one pooled rig per look exists after boot. If a scene shows two actors with the same look at once,
  warm an extra rig at boot (`world.adopt(look, buildCharacter(look))` in the warm jobs) or give them distinct looks.

### 13.6 Skip-safety (cutscenes skipped with NO, `&fast=1`)

While skipping, `play()` never poses the requested anim; it jumps to the return anim. So:
- Side effects inside a pose are not skip-safe: `lanyard_on` sets `attach.lanyard.visible` only at 55% of its pose.
  After any such anim, set the end state in content (`a.rig.attach.lanyard.visible = true`).
- `rig.seated` is set by the `sit` pose and cleared only by poses that clear it. A skipped `stand` or a skipped walk
  (moveTo teleports) leaves the rig seated, and `idle` (upper) keeps sitting. Rue's content always unsits explicitly:
  `a.rig.seated = false; a.play('idle');` (28-content-…:92, 32-content-…:18). Do the same in TWO.
- `.shows` and `.expr` are transient by design; never rely on them for an end state.
- Expressions set with `setExpr` during an anim that has `.expr` are overwritten when that anim ends.

### 13.7 Engine changes worth making in TWO's `04-art.js`

1. Face size regex (04-art.js:863): `/^(student|customer|cust26|local40|staff|whisper|passenger)_/` (or a `L.small`
   flag) so extras get 128 px faces.
2. `warmCharacter` (99-main.js:60-92) calls `renderer.compile` (r186 compiles **every** object's material, hidden or not)
   and then renders once, which uploads only **visible** geometry and textures. A hidden attachment therefore uploads its
   buffers, and any private texture (a per-badge canvas on Chase's initially hidden lanyard), on first show mid-game.
   Temporarily show every hidden attachment for that warm render, as `world.warm` does for sets
   (09-world-engine-b1.js:1209).
3. Expose the IK kit, e.g. a top-level `const RIGKIT = { arm, leg, ik, flat, hang, breathe, base, once, hipsY, gait }`
   assigned inside the ANIMS IIFE, so content anims stop needing tricks. Do not put non-functions in `ANIMS` itself.
4. Gloves thumb fix; `L.lanyardCol`; per-badge textures; distinct headphones attach names; `L.phonesCol`.
5. The extra `coat` bone needs the snapshot offset fix (§13.2).
6. Keep `canvasTex.yes` and the `yes_*` tiles (TWO's 2026 polos, the Yes sign).

---

## 14. Gotchas (summary)

1. `canvasTex` with a `key` returns the cached texture and ignores the new size/painter.
2. `mat()` results are shared; animate only keyed materials. `0xffffff` and `'#ffffff'` emissive are different keys.
3. A `map` + `emissive` material uses the map as the emissive map (self-lit). Without `emissive`, screens are lit by the scene.
4. `bakeLight` multiplies; baking twice darkens twice. `instanced()` bakes into (mutates) its geometry if uncoloured.
5. `Builder.cyl(rt, rb, h, seg, m, …)`: `seg` is positional before the material. Builders are single-use.
6. Moving instances need `instanceMatrix.needsUpdate` and a valid bounding sphere (or `frustumCulled = false`).
7. Never use the atlas material on a SkinnedMesh or `skinMat` on a plain mesh (program re-pick at every switch, 04-art.js:240).
8. Garments, hair and the down-hood are in the skinned body mesh: they cannot be hidden. Toggleable things must be attachments.
9. A lanyard name without a `badge_<NAME>` tile renders a blank badge; the atlas has no room for more.
10. `L.gloves` leaves the thumb skin-coloured.
11. `hairStyle: 'none'` still paints a hairline on the face canvas.
12. Unknown mouth names draw an open mouth; unknown eyes draw `open`; pupils never move.
13. Two attachments are both named `headphones`; the last one built wins.
14. `pose()`'s blend snapshot uses hard-coded offsets 48/51/54 (= 16 bones × 3): adding bones requires changing them.
15. The `.upper` name list must only contain defined anims, or the game fails to boot.
16. `ANIMS` helpers (`arm`, `leg`, `ik`) are private to the IIFE.
17. `rig.seated` is sticky and not skip-safe; `a.p.h` persists between plays.
18. Pooled rigs keep every change content makes; restore on scene exit.
19. Every `LOOKS` entry is built, compiled and portrait-baked at boot; prune unused looks; keep a `customer_a` fallback.
20. Face canvases are 256 px unless the id matches `/^(student|customer)_/`.
21. `warmCharacter` compiles hidden attachments but does not upload their geometry/textures (only visible things are rendered).
22. The body mesh is never frustum-culled.
