# 01 — Core: DOM skeleton, CONFIG, registries, state, test hooks, CORE, MAIN

Reference manual for the parts of Rue's engine that every other subsystem stands on. It covers the HTML/CSS skeleton, the
tuning constants and registries, the save state, the test hooks, the renderer, the event bus, the fixed-step clock and
waits, input, resize, saves, the F2 perf overlay with adaptive pixel ratio, and `boot()`: loader, warm-up jobs, portrait
baking, the frame loop and the autoplay start.

Everything here applies to TWO's `src/` as well. Those fragments are verbatim copies with only these renames:

| Rue (`ref/rue/`) | TWO (`src/`) | Differences |
| --- | --- | --- |
| `00-head.html` | `00-head.html` | `<title>TWO</title>`, `#title .logo` text `two` |
| `01-config.js` | `01-config.js` | `window.TWO_TEST`, `testLog` pushes to `TWO_TEST.log` |
| `02-core.js` | `02-core.js` | save key `'two.save'` (4 places) |
| `36-main.js` | `99-main.js` | `'two.save'`, `TWO_TEST`, log prefixes `TWO:`. **No closing `</script></body></html>`**; `tools/build.mjs` appends it |

Line citations below are `file:line` in `ref/rue/`. The same lines hold in `src/` for 00–02, and in `src/99-main.js` for
`36-main.js`.

---

## 1. How the file is put together

### 1.1 One module, many fragments

`00-head.html` holds the doctype, the whole stylesheet and the DOM skeleton. It ends **inside** an open
`<script type="module">` (import map at 00-head.html:274, the module and its two imports at 275-277):

```html
<script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.186.1/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.186.1/examples/jsm/"}}</script>
<script type="module">
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
```

Every JS fragment is concatenated after it into that one module. The last fragment calls `boot()` (36-main.js:135), and the
file closes with `</script></body></html>`. `THREE` and `mergeGeometries` are the only imports. Everything else is a
top-level binding in module scope (strict mode).

### 1.2 TWO's build (`tools/build.mjs`)

- `src/NN-*.{js,html}` are concatenated **sorted by filename**.
- **Engine fragments** (00–09, 30–39, 99) share one module scope. Their top-level `const`/`function` names are visible to
  everyone.
- **Leaf fragments** (10–29 sets, 40–59 minigames, 60–89 content) are each syntax-checked and wrapped in
  `try { … } catch (e) { console.error('TWO: fragment X failed', e); }`. Their top-level declarations are therefore
  **block-scoped and invisible to other fragments** (the module is strict, so even function declarations stay in the
  block). Leaves may only *register* into registries (`Object.assign(SETS, …)`, `CUTSCENES['x'] = …`).
- A leaf that fails to parse is skipped with a warning. With `--strict`, or for an engine fragment, the build fails.
- `npm test` = build + `node tools/run.mjs --q "autoplay=1&fast=1&speed=8"`. The runner polls `window.TWO_TEST` every
  500 ms and exits 1 on any console error, page error or timeout. Console **warnings** are printed but do not fail the run.

### 1.3 Evaluation order and the TDZ

Top-level code runs in file order, and `boot()` runs last. In TWO the leaves `10-*` evaluate **before** `30-world`,
`31-ui` and `32-flow`. Any top-level (not deferred-into-a-function) reference from a leaf to `world`, `ui`, `flow`,
`popup`, `cam`, `say`… hits the temporal dead zone and throws. The wrapper catches it and **the whole fragment is lost**.
The `typeof x !== 'undefined'` guards used throughout the engine (e.g. 02-core.js:29, 41, 45) only protect against a
name that is *not declared at all*, such as a fragment that was removed. They do not protect against a `const` declared
later: `typeof` on a TDZ binding throws.

---

## 2. Architecture at a glance

```
requestAnimationFrame → frame(now)                                   36-main.js:30
 ├─ perf.frame(ms)            ring buffer + adaptive pixel ratio
 ├─ input.poll()              gamepad → queued edges
 ├─ acc += min(ms/1000, CONFIG.maxFrame) × clock.scale  (× max(scale, TEST.speed) under autoplay)
 ├─ up to 12×, while acc ≥ 1/60:  tick()                             36-main.js:22
 │    ├─ input.tick()         pressed/released edges, move vector, pointer latches
 │    ├─ menus.update()       title / pause / menus (runs even while paused)
 │    ├─ if (clock.paused) return
 │    ├─ ui.update(1/60)      tweens, toast, objective, hud, inventory | dialogue + popups
 │    ├─ clock.step()         clock.t += 1/60; updaters (addUpdate order); resolve waits
 │    └─ world.update(1/60)   only once world.set exists
 ├─ renderer.info.reset()
 ├─ world.render(alpha)       alpha = acc/step, interpolates actors + camera
 ├─ emit('render', alpha)     popup.render, minigame draw()
 ├─ perf.draw()
 └─ mid-game shader-compile check
[microtask checkpoint: continuations of every wait() resolved in the ticks above run HERE, after the render]
```

---

## 3. DOM skeleton and CSS (`00-head.html`)

### 3.1 Head

| Line | What |
| --- | --- |
| 4-6 | `charset utf-8`. Viewport `width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover`. `<title>` |
| 8-14 | `:root` tokens: `--navy #141d3a`, `--yes #ffd21f`, `--jv #2f6fd6` (JARVIS blue), `--jvbar #d9dce1`, fonts `--game` (Trebuchet stack), `--sys` (system-ui stack), `--mono` (Courier stack), `--ts: 22px` (dialogue text size) |
| 15 | `body.large { --ts: 28px }`, the Text Size option (toggled by `boot()` and `menus.applyOptions`) |
| 17-18 | `html, body`: full height, black, `overflow:hidden`, `overscroll-behavior:none`, **`touch-action:none`**, no text selection, no tap highlight, `font-family: var(--game)`, white text |
| 23 | **`.off { display:none !important }`**, the universal hide class. Every element is shown and hidden by toggling `off` |
| 24 | `button` reset: inherits font and colour, no border or background, `pointer-events:auto` (needed because `#ui` is `pointer-events:none`) |

`viewport-fit=cover` is set, but no rule uses `env(safe-area-inset-*)`. On notched phones in landscape, the stick and
buttons can sit under the notch or the home bar.

### 3.2 Top-level layers

| Element | CSS | Purpose / owner |
| --- | --- | --- |
| `canvas#gl` | fixed, 100vw×100vh (19) | The WebGL canvas. `renderer` is created on it (02-core.js:5). The size comes from CSS: `setSize(…, false)` never writes styles |
| `canvas#overlay` | fixed, full screen, `pointer-events:none`, `z-index:1` (19-20) | A 2D canvas above the 3D view for minigames. Its backing store is CSS px × dpr and its transform is pre-scaled so painters draw in CSS px (02-core.js:199-210). Flow clears it and toggles `off` around minigames (11-flow.js:408-423); it is exposed as `api.overlay` |
| `div#ui` | fixed `inset:0`, `z-index:2`, `pointer-events:none`, `overflow:hidden`; `#ui > * { position:absolute }` (21-22) | Root of all DOM UI. Children opt back in with `pointer-events:auto` |

**State classes on `#ui`:**

| Class | Set by | Effect |
| --- | --- | --- |
| `lbon` | `ui.letterbox(on)` (10-ui.js:43) | Letterbox bars slide in (39). `ui.card` sizes cards smaller while it is on |
| `talking` | dialogue box shown/hidden (10-ui.js:220/225) | Hides `#prompt` and `#swap` (71), lifts `#toast` above the box (75), hides stick/SWAP/BAG on touch (226) |
| `invopen` | `ui.inventoryPanel` (10-ui.js:98) | Hides `#swap`, and on touch also the stick and SWAP (226) |
| `touchui` | `input.setScheme('touch')` / startup on touch devices (02-core.js:76, 194) | Touch layout: prompt raised, dialogue and inventory narrowed beside YES/NO, swap raised, toast moved under pause (224-234) |
| `menuon` | menus `show()` / title (10-ui.js:680, 817) | Hides `#touch` entirely (229). Menus are tapped directly |

### 3.3 Children of `#ui`, in DOM order

z-index values are inside `#ui`'s stacking context.

| Element (initial classes) | z | Purpose / owner | Sub-parts and state classes |
| --- | --- | --- | --- |
| `#mg` | 1 | Minigame DOM layer (`api.ui`). Children get `pointer-events:auto` (28). Flow empties it on minigame start and finish | anything a minigame appends |
| `#cardwrap.off` > `canvas#card` | 2 | INSERT card: flex-centred, drop shadow (29-30). `ui.card(kind, data)` paints `CARDS[kind]` and sizes the canvas in CSS | – |
| `#obj.off` | 3 | Objective, top left, max 46vw (42-49). Owned by `objective()` (10-ui.js:563) | `.line` (yellow bar via `::before`), `.it` (☐ item), `.it.done` (☑, yellow strike-through), `.hide` (opacity 0: in a cutscene or with the option off) |
| `#hud.off` | 7 | 1987 HUD pill, top right (52-64). Owned by `hud` (10-ui.js:517) | `.bat > i` (fill, `scaleX`), `.pct`, `.bars > i×4` (heights 25/50/75/100%, `.on` = lit), `.ns` ("No Service"). Classes `.low` (red fill, ≤5%) and `.nobat` (hide battery and %) |
| `#swap.off` | 3 | Swap indicator, bottom left (76-80). `ui.swapIndicator(active, other)` | `img.b` (other, 40 px, behind), `img.a` (active, 64 px, yellow border), `span` (key label: TAB / Y / SWAP) |
| `#prompt.off` | 3 | Interaction pill, bottom centre (67-70). `ui.prompt(text)` | JS appends `b` (YES/NO badge; `b.no` = grey) + `span`. The text `"YES — Open"` is split into badge + label |
| `#pops` | 5 | Popup layer (115). The `popup` pool appends `.jvw` wrappers here (10-ui.js:389) | see 3.4 |
| `#lbt.lb`, `#lbb.lb` | 6 | Letterbox bars for 2.35:1: `height: max(0px, calc((100vh - 100vw/2.35)/2))`, off-screen via `translateY(∓100%)`, 0.4 s ease (36-39) | shown by `#ui.lbon` |
| `#dlg.off` | 7 | Dialogue box, bottom 3.5vh, 80% wide, `pointer-events:auto` (83-104). Owned by `say/choose/ask` (10-ui.js:207) | `img.face` (96 px portrait), `.col > .who > span` (name) + `i` (lower-case tag), `.txt` (typewriter, `font-size: var(--ts)`, `pre-wrap`), `.opts` (choice buttons: `.sel` ▶, `.dis` grey), `.opts.ask` (YES/NO pills in a row, first one filled yellow), `.more` (bobbing ▼, `@keyframes bob`). Box classes `.noface` and `.noname` |
| `#tcard` | 11 | Title/date card text, **above `#fade`** so it reads over black (107-108). `ui.title()` | opacity tween |
| `#acard` | 11 | Act card on black (109-112). `ui.actCard('ACT ONE — Subtitle')` splits on `' — '` | `b` (ACT ONE), `hr` (yellow rule), `i` (subtitle) |
| `#flash` | 9 | White flash layer (31-32). `ui.flash()` | opacity |
| `#fade` | 10 | Black fade layer. **Starts at `opacity:1`** (33), so the game is black until something calls `ui.fade(0)` | background colour set per fade |
| `#toast` | 11 | Toast, bottom right (72-75). `ui.toast(text)`, 2.2 s | `.show` |
| `#inv.off[data-noyes]` | 12 | Inventory panel (153-167). `ui.inventoryPanel(spec)`, modal | `.hd` (INVENTORY + `.hint`), `.row` (scrolling slots), `.slot` (canvas 72 px + span; `.sel` yellow, `.pick` blue = first of a combine), `.desc`, `.acts` (Examine/Use/Combine; `.sel`; `.acts.dim`), `.empty` |
| `#title.off` | 13 | Title screen (170-180). Owned by `menus` | `.logo` ("RUE" / "two"), `.rule`, `.press` (PRESS YES, `@keyframes pulse`), `.disc` (disclaimer). `.withmenu` hides `.press`, shrinks the logo and top-aligns |
| `#menu.off[data-noyes]` | 14 | Menu panel (181-206), `pointer-events:auto` | `.panel > .head` (hidden if empty), `.body` (free HTML: `table`, `canvas`, `p`, `.cr b` credits heads), `.list` (buttons: `span` label + `em` value, `small`, `.sel` ▶, `.dis`), `.foot`. Root classes: `.dim` (dark backdrop) and `.low` (panel at the bottom, no backdrop, over the title) |
| `#touch.off` | 15 | Touch controls (213-223). Owned by `input` | `#stick > i` (150 px base, 64 px knob), `button.tb[data-a]`: `#t-yes` (84 px, yellow), `#t-no`, `#t-swap`, `#t-bag` (`data-a="inventory"`), `#t-pause`. `.tb.on` = held |
| `#loader` | 20 | Boot loader: black, centred JARVIS window (209-210, 269-271). Owned by `boot()` | `.jv > .jv-bar` (`.jv-logo` JARVIS, `.jv-t`, `.jv-x` ×), `.jv-body` (`.ic.info` "i", `.jv-msg` "JARVIS is loading your game."), `.jv-prog.anim` (`div > i` striped bar, `span` %), `.jv-btns` (empty; YES is added at ready) |
| `#perf.off` | 30 | F2 overlay (237-239, 272) | `canvas` 240×64 graph, `pre` text |

**`data-noyes`**: a left click or tap whose target is inside `button, [data-noyes], input, textarea` does **not** become
a YES press (02-core.js:152). `#inv` and `#menu` carry it, and minigames set it on their own windows
(12-minigames…:613). Their buttons handle clicks themselves.

### 3.4 JARVIS popup classes (`.jv*`, 115-150)

The `popup` pool and the loader both use these.

| Class | Meaning |
| --- | --- |
| `.jvw` | Absolutely positioned wrapper (placed by JS), pooled, `off` when free |
| `.jv` | The window: white, 340 px (`max-width: calc(100vw - 20px)`), system font, `pointer-events:auto`, pops in with `@keyframes jvpop` |
| `.jv.shake` / `.jv.big` / `.jv.crash` | Shake-in (`jvshake`) / 460 px, 16 px text / pink body for crashes |
| `.jv-bar`, `.jv-logo`, `.jv-t`, `.jv-x` | Grey gradient title bar, blue JARVIS logo, title text (ellipsis), fake close × |
| `.jv-body`, `.jv-msg` | Icon + message row (`pre-line`) |
| `.ic` + `.error` / `.info` / `.warn` / `.none` | Red circle / blue italic "i" / yellow triangle (clip-path) / hidden |
| `.jv-spin` | Spinner (`@keyframes spin`) |
| `.jv-prog` (+ `.anim`), `div > i`, `span` | Striped progress bar (`scaleX` on `i`); `.anim` scrolls the stripes (`@keyframes stripes`) |
| `.jv-btns` (`:empty` hidden), `.jv-b`, `.jv-b.foc` | Footer and blue square buttons; `.foc` = yellow focus ring (keyboard/pad selection) |

### 3.5 Media queries

- `@media (max-width:600px)`: menu tables shrink (202). With `touchui`, the dialogue box and inventory go full width above
  YES/NO, and the face shrinks to 64 px (231-234).

### 3.6 Body markup (243-272)

Elements are created in exactly the order of the table in 3.3. The inventory's action buttons and the touch buttons are
static markup. Everything else inside the dialogue box, menus and popups is built or pooled by JS.

---

## 4. CONFIG (`01-config.js:5-24`)

| Key | Value | Unit / meaning | Read by |
| --- | --- | --- | --- |
| `step` | `1/60` | Fixed update step (s). Every updater receives exactly this `dt` | core, main, ui (menus orbit), world, minigames |
| `maxFrame` | `0.25` | Clamp on one frame's real time before it is converted to ticks | main:36 |
| `walk`, `run`, `carry` | `1.7`, `3.4`, `1.0` | m/s: walk, run, carrying something heavy | world player, walk minigames |
| `turn` | `3.2` | rad/s, tank-control turn rate | world |
| `radius` | `0.3` | Actor collision radius (m) | world |
| `text` | `{slow:24, normal:48, fast:110}` | Typewriter chars/s, keyed by `options.textSpeed` | ui `say` and some content |
| `beat` | `0.8` | Seconds for a `^` beat inside a line | ui `say` |
| `fov`, `ecuFov` | `40`, `30` | Default camera FOV and ECU FOV (degrees) | world camera |
| `dist` | `{ECU:.35, CLOSE:.9, MID:1.8, WIDE:7}` | Shot-size framing distances (m) | world framing helper |
| `duck` | `0.6` | Music gain multiplier under dialogue (a 40% duck) | AUDIO `applyOptions` |
| `colors` | `navy, yes, chaseBlue, polo, lanyard, jarvis, jarvisBar` | Palette hex strings (`colors.yes` is used 17×) | art, sets, ui, minigames |
| `keys` | action → `KeyboardEvent.code[]` | See 7.4 | input (`codeTo` map, keyup) |
| `pad` | action → standard-gamepad button index | `yes:0 (A) no:1 (B) inventory:2 (X) swap:3 (Y) run:5 (RB) pause:9 (Start) up/down/left/right:12-15 (d-pad)`. Index 4 (LB) is free | input.poll |

`keys` (01-config.js:18-22): `yes: Enter, Space, NumpadEnter` · `no: Escape, Backspace` · `swap: Tab` ·
`inventory: KeyI` · `run: ShiftLeft, ShiftRight` · `pause: KeyP` · `up: KeyW, ArrowUp` · `down: KeyS, ArrowDown` ·
`left: KeyA, ArrowLeft` · `right: KeyD, ArrowRight`. Codes are layout-independent, so `KeyW` is the physical W
position, which is Z on AZERTY.

---

## 5. Registries (`01-config.js:27-112`)

All are plain `const` objects or arrays in engine scope. Leaves fill them; the engine reads them.

| Registry | Shape (from the comments plus actual use) | Filled by | Read by |
| --- | --- | --- | --- |
| `SETS[id]` | `{ env, build(), marks, anchors, cams, zones, colliders, exits, floor?, update?, ambience… }` | set fragments | world (`world.warm(id)` for **every** key at boot) |
| `LOOKS[charId]` | Art description for `buildCharacter(id)` | art | boot warms every **truthy** entry; portraits; world spawn |
| `ANIMS[name]` | `(rig, t, p) => pose` | art, content | rig/world |
| `ITEMS[id]` | `{ name, desc, icon?, examine?, flip?, combine? … }` | content | inventory, ui |
| `SCENES[id]` | `{ title, set, env, time, act, playable, swap, hud, music, spawn, hotspots, steps, grants }` | content | flow |
| `CUTSCENES[id]` | `[step, step, …]` | content | flow `playCutscene` |
| `STRINGS` | UI strings. **Declared but never used in Rue** | – | – |
| `MINIGAMES[id]` | `{ start(params, api), update(dt), draw(), end(result), autoplay?(api) }` | minigames | flow minigame host |
| `CARDS[kind]` | `(ctx, w, h, data) => void`, optional `.size = [w, h]` (default 800×600) | ui, content | `ui.card`, `ui.paintCard` |
| `SCENE_ORDER` | Array of scene ids `'P' … 'PC'` (37-41) | config | `flow.next()` (linear), scene select, `select` grants |
| `ACTS` | `{ '1.1': 'ACT ONE — …', '2.1': …, '3.1': … }` (43-47) | config | `flow.start` shows `ui.actCard` when entering that scene id |
| `CHARACTERS[id]` | `{ name, voice: {…} }` (52-80) | config | dialogue name label, AUDIO voice baking, portraits, `world.talk` |
| `NAMES` | Notebook names, in order (83) | config | ui extras, minigames, content |
| `SAMPLES[key]` | `{ label, sfx }`; `sfx` is the AUDIO recipe doubling as the sample (86-95) | config | flow `learnSample` toast, `AUDIO.sampleBuffer(k)` |
| `BUGS`, `DOOR_BUG` | Bug List entries `{ id, text, seen }` and an extra string (98-112) | config | sets, ui extras, minigames, content |

### 5.1 `CHARACTERS[id].voice` fields

Voices are baked at boot by `AUDIO.prerender()` → `renderVoices()` (03-audio.js:730).

| Field | Type | Meaning |
| --- | --- | --- |
| `wave` | `'square' \| 'triangle' \| 'sine' \| 'sawtooth' \| 'pulse'` | `pulse` is a narrow-square periodic wave. `sine` gets a little harmonic body |
| `f` | Hz | Base pitch |
| `len` | s | Blip length |
| `gap` | s | Extra silence between blips |
| `filter` | Hz | Optional lowpass |
| `soft` | bool | Gentler attack and release, slightly quieter |
| `tumble` | bool | Pitch varies per blip variant (Chase) |
| `mono` | bool | Flat: no formant peak, no glide (the operator) |
| `also` | character id | A **duo speaker**: `id` must be `a_b`. Both actors' mouths move (`world.talk`) and the portrait is split down the middle |

`name` is exactly what the dialogue box shows. Two ids may share a name (`rue19`/`rue58` → `RUE`).

---

## 6. State, options, profile (`01-config.js:115-128`)

```js
const newState = () => ({
  scene: 'P', flags: {}, inventory: [], active: 'chase',
  battery: null, bars: null,          // 1987 HUD; null hides it
  names: [], samples: [], bugs: [],   // collectibles
  pattern: null,                      // the 3.3 sequencer pattern (4 lanes x 16 booleans), used by the credits
});
let state = newState();
```

| Object | Lifetime | Persisted | Notes |
| --- | --- | --- | --- |
| `state` (`let`) | One playthrough. **Reassigned** by `boot` (autoplay, prologue), `menus.start/cont`, `flow.start(id, {select:true})` | `saveGame()` | `state.scene` is set by `flow.start`. `active` is the controlled character |
| `options` (`const`) | Session plus storage | `saveOptions()`, `saveGame()` | `controls: 'modern'\|'tank'`, `textSpeed: 'slow'\|'normal'\|'fast'`, `textSize: 'normal'\|'large'`, `music/sfx/voice: 0..1`, `reduceFlashing`, `objective` |
| `profile` (`const`) | Forever | same | `completed` (set after `PC`), `seenPrologue` (set by `menus.title`) |

**Gotcha: `state` is a `let` binding that gets replaced.** Never cache `const s = state` at load time or in a closure that
outlives a scene. Always read the global. The minigame `api.state` is captured at minigame start, which is safe only
because a minigame never outlives its scene.

`boot()` merges stored options and profile with `Object.assign` (36-main.js:6-10). This is shallow, so new option keys
added in code keep their defaults when an old save lacks them, and stored arrays or objects replace the defaults whole.

---

## 7. CORE (`02-core.js`)

### 7.1 Renderer (5-10)

```js
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gl'), antialias: true, powerPreference: 'high-performance' });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setClearColor(0x000000, 1);
renderer.info.autoReset = false; // reset once per frame in the loop so split-screen counts add up
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, matchMedia('(pointer: coarse)').matches ? 1.5 : 2));
renderer.setSize(innerWidth, innerHeight, false);
```

- It is the single global renderer. There are no shadow maps, no tone mapping (default) and no post-processing.
- The initial pixel-ratio cap must match `perf`'s `top` (02-core.js:233-234), which recomputes the same formula. Change both
  together.
- `info.autoReset = false`: the loop calls `renderer.info.reset()` once per frame **after the ticks and before
  `world.render`** (36-main.js:39). Renders done inside ticks (e.g. a set built and primed in an updater) therefore do not
  appear in the F2 counts. Renders from `'render'` listeners do.
- Other users: `world` (render, split-screen viewports/scissor, `compile`, `initTexture`), minigames reading
  `renderer.domElement`, and the 2.12 walk's `compileAsync` (20-minigames…:355).

### 7.2 Event bus (12-16)

```js
const bus = {};
function on(name, fn)   { (bus[name] ||= []).push(fn); }
function off(name, fn)  { const l = bus[name]; if (l) { const i = l.indexOf(fn); if (i >= 0) l.splice(i, 1); } }
function emit(name, data) { const l = bus[name]; if (l) for (let i = 0; i < l.length; i++) l[i](data); }
```

| Semantics | Detail |
| --- | --- |
| Synchronous | Listeners run inline, in registration order |
| Duplicates | `on` does not dedupe. The same fn registered twice runs twice |
| No isolation | A throwing listener aborts the remaining listeners **and the emitter**. In the frame loop, a throw in a `'render'` listener skips `perf.draw()` and the shader check for that frame |
| `off` during `emit` | `splice` shifts the array, so **the next listener is skipped** for that emit. Defer removals, or remove from a different event |
| `on` during `emit` | Appended and called in the same emit |
| No `once`, no wildcard, no return values | Anonymous listeners can never be removed |

**Event catalogue (Rue):**

| Event | Payload | Emitted by | Listeners |
| --- | --- | --- | --- |
| `'key'` | `KeyboardEvent.code` | core keydown, non-repeat, every key except F2, **even in text fields and for unbound keys** (02-core.js:124) | menus: typing J-A-R-V-I-S on the title opens scene select (10-ui.js:802) |
| `'resize'` | `{ w, h }` CSS px | core resize handler (204) | **none in Rue**. World re-reads `renderer.getSize()` every render |
| `'render'` | `alpha` (0..1) | main, every rAF frame after `world.render`, **also while paused, on the title and during loading** (36-main.js:41) | `ui.init` → `popup.render` (anchors popups to actors); flow → active minigame's `draw()` |
| `'options'` | `options` | menus `applyOptions` (10-ui.js:662) | AUDIO `applyOptions` (registered in `AUDIO.init`) |
| `'flag:set'` | `{ name, value }` | flow `setFlag` (11-flow.js:21). `grant()` uses `Object.assign` and does **not** emit | none |
| `'item:add'` | item id | flow `inventory.add` (11-flow.js:375) | none |
| `'scene:end'` | `{ id }` | flow, after a scene's last step (11-flow.js:582) | main: under autoplay sets `RUE_TEST.done` at `TEST.stop` or `'PC'` (36-main.js:13-16) |

### 7.3 Clock, updaters, waits (18-47)

```js
const clock = { t: 0, dt: CONFIG.step, frame: 0, scale: 1, paused: false, fns: [], waits: [], dirty: false, step() { … } };
```

| Field | Meaning |
| --- | --- |
| `clock.t` | Game time in seconds. Advances **only** in fixed ticks of `CONFIG.step`, never while paused. Use it for timestamps (`const t0 = clock.t`) |
| `clock.frame` | Number of **ticks** (not render frames) since boot |
| `clock.dt` | Constant `CONFIG.step`. Unused |
| `clock.scale` | Ticks per real second ÷ 60. Read by the loop (36-main.js:36). **Overwritten every tick by `flow.tick`**: `clock.scale = cutDepth && input.held('no') ? 3 : 1` (11-flow.js:445). `flow.stop` and `menus.title` reset it to 1 |
| `clock.paused` | Set by `menus.pause/resume/title`. While true, `tick()` returns after `menus.update()`, so ui, updaters, waits and `world.update` freeze. **Rendering, `'render'` listeners, input and menus keep running** |
| `fns`, `waits`, `dirty` | Internal |

#### `clock.step()` (23-36)

Called once per tick by the loop:

1. `clock.t += CONFIG.step; clock.frame++`.
2. Calls every updater `f(CONFIG.step)` in **registration order**. Slots nulled by `removeUpdate` are skipped and
   compacted after the loop.
3. Resolves waits. For each pending wait: if `flow.skipping` is true, **resolve it regardless**. Otherwise resolve when
   `x.fn ? x.fn() : clock.t >= x.t`. Unresolved waits are kept in order.

There is no try/catch around updaters or `waitUntil` predicates. See the gotcha in 7.3.5.

#### `addUpdate(fn)` / `removeUpdate(fn)` (38-39)

| | Behaviour |
| --- | --- |
| `addUpdate(fn)` | Appends unless `fn` is already present (identity, `includes`). Added during a tick, it **runs in the same tick** (the loop reads `fns.length` live). Returns nothing |
| `removeUpdate(fn)` | Nulls its slot and sets `dirty`. Safe to call from inside the updater itself or any other. Removing an absent fn is a no-op |
| Signature | `fn(dt)` with `dt === CONFIG.step` always. Under hold-NO ×3 the fn runs 3× per frame, not with a bigger dt |
| Identity | Removal is by reference, so keep the function in a variable. `addUpdate((dt) => …)` can never be removed |

Rue's skip-safe updater pattern (23-content-prologue…:31-36):

```js
const f = (dt) => {
  t = Math.min(1, t + dt / 0.5);
  p.position.set(0.62, 0.783 + 0.09 * (1 - t) * (1 - t), -1.7);
  if (t >= 1) removeUpdate(f);
};
if (c.flow.skipping) f(1); else addUpdate(f);   // skipped: jump straight to the end state
```

A scene-scoped updater that cleans itself up when the scene changes (23-content…:50-51):

```js
const u = () => { if (flow.sceneId === '1.1') return; removeUpdate(u); cols.splice(cols.indexOf(box), 1); };
addUpdate(u);
```

#### `wait(sec)` → `Promise<void>` (40-43)

- Resolves on the first tick where `clock.t >= (clock.t at call) + sec`, give or take a tick of floating-point drift.
- Returns an **already-resolved** promise if `flow.skipping` is true, or if `!(sec > 0)` (0, negative, NaN, undefined).
- Pauses with `clock.paused`. Runs 3× faster under hold-NO.
- It allocates a Promise and a record, so do not call it in per-tick code.

#### `waitUntil(fn)` → `Promise<void>` (44-47)

- `fn()` is evaluated **every tick from the next tick on**, inside `clock.step`, after the updaters. It must be cheap,
  side-effect-free and non-throwing.
- Returns a resolved promise if `flow.skipping` is true. A pending one is **resolved on the next tick once skipping
  starts, even if `fn()` is false**. Code after `await waitUntil(…)` must not assume the condition holds; under skip it
  must snap state itself.
- There is no timeout. Add one in the predicate: `waitUntil(() => cond() || clock.t - t0 > 3)` (20-minigames…:232).

#### 7.3.1 When continuations run

`res()` is called inside `clock.step()`, which is inside the rAF callback. Promise continuations are microtasks and run
**after `frame()` returns**: after all of this frame's ticks and after the render. Consequences:

- Code after `await wait(x)` takes effect on screen one frame later.
- With N ticks per frame (hold-NO ×3, 30 Hz phones, autoplay `speed=8`), a continuation from tick 1 starts its next
  `wait()` from the clock of tick N. Chained waits drift by up to N−1 ticks each. Schedule music-synced events against
  `clock.t` or audio time, not against chains of waits.

#### 7.3.2 Pause semantics

While `clock.paused`, waits, updaters, ui tweens (`ui.fade`, the typewriter, toasts) and world simulation all freeze.
Rendering and `'render'` listeners continue, so a minigame's `draw()` must not advance state. **Never `await ui.fade()`
while paused**: it only completes in `ui.update`. `menus.title` sets `clock.paused = false` first for exactly this reason
(10-ui.js:809). The AudioContext is not suspended on pause, and there is no `visibilitychange` handling. A hidden tab
stops rAF, and on return the first frame is clamped to 0.25 s (≤12 ticks).

#### 7.3.3 Skip semantics (`flow.skipping`)

`flow.skipping` is true while a cutscene is being skipped (pause → Skip Scene → `flow.skip()`), and **for every cutscene
under `&fast=1`** (11-flow.js:96). Flow clears it when the outermost cutscene ends (11-flow.js:109) and in `flow.stop()`.
Core's part: `wait`/`waitUntil` resolve immediately and pending waits flush. The ui's part: `fadeTo`, `flash`, `title`,
`actCard` and `hud.animate` finish instantly (10-ui.js:19, 38, 45, 50, 543), and `say`/`choose`/`ask` resolve at once (10-ui.js:262, 324, 336).

#### 7.3.4 The poll-loop hang (critical)

```js
while (!input.pressed('yes')) await wait(0);     // HANGS THE PAGE: wait(0) is pre-resolved, so the loop never yields
while (far(a)) { a.moveTo(x); await wait(0.25); } // HANGS while flow.skipping: wait() is pre-resolved and clock.t never advances
```

Every `await` of an already-resolved promise re-enters as a microtask in the same checkpoint. The event loop never runs
another frame, so input and `clock.t` never change. Rue's walk loop at 20-minigames…:205
(`while (… && clock.t - t0 < 8) { …; await wait(0.25); }`) is safe only because it never runs while skipping. Use
`waitUntil(pred)` (one promise, checked per tick), or check `flow.skipping` inside the loop.

#### 7.3.5 One throwing updater freezes the screen

An exception in an updater, a `waitUntil` predicate, `ui.update` or `world.update` propagates out of `tick()` and
`frame()`. The frame's remaining ticks **and its render** are skipped. The next frame calls `requestAnimationFrame` first
(36-main.js:31), so the loop survives, but a deterministic throw repeats every frame. The canvas freezes while DOM menus
still work. Flow wraps minigame `update/draw` in try/catch (11-flow.js:446-456). Do the same in every updater TWO adds.

### 7.4 Input (49-196)

#### Actions

`A = ['yes','no','swap','inventory','run','pause','up','down','left','right']` (02-core.js:51) is a **hard-coded list**.
`tick()` only computes edges for these. Adding a key to `CONFIG.keys` without adding it to `A` makes the key
`preventDefault` and switch the scheme, but `input.pressed()` never reports it.

#### Public API (`input`)

| Member | Type | Meaning |
| --- | --- | --- |
| `pressed(a)` | `→ bool` | True for **exactly one tick** per press (rising edge, or one queued press). Every consumer checking in that tick sees it unless someone calls `consume` first |
| `held(a)` | `→ bool` | Currently down from any source: keyboard, pad, touch button, or mouse (`yes` = left button, `no` = right button) |
| `released(a)` | `→ bool` | Falling edge this tick. Unused in Rue |
| `consume(a)` | `void` | Clears `pressed(a)` for the rest of this tick. Queued extra presses still arrive on later ticks |
| `move` | `{x, y}` | Analogue move vector, `y` up = forward, length ≤ 1. A **shared mutable object**: copy the numbers, don't keep the reference |
| `run` | bool | `held('run')`, or the touch stick pushed past its rim |
| `scheme` | `'kb' \| 'pad' \| 'touch'` | Last-used device, for prompt labels ("TAB"/"Y"/"SWAP") and layouts. Initially `'touch'` on touch devices |
| `setScheme(s)` | `void` | Shows `#touch` and adds `#ui.touchui` only if `s === 'touch'` and this is a touch device. Any other scheme hides them |
| `pointer` | `{x, y, down, pressed, released, over}` | CSS px (`clientX/Y`). `pressed`/`released` latch per tick. `over` = DOM element under the pointer. **Not updated by touches on `#touch`** |
| `gesture` | `fn \| null` | A one-shot callback run **synchronously inside** the first bound keydown or any pointerdown, then cleared. `boot()` uses it for `AUDIO.init()` (the autoplay-policy unlock) |
| `lastKey` | string | `KeyboardEvent.key` of the last keydown. Unused in Rue |
| `poll()` | `void` | Called by the loop once per frame. Reads the gamepad |
| `tick()` | `void` | Called by the loop once per tick. Computes edges, the move vector and pointer latches |

#### Edge model (`tick`, 99-115)

- Each source writes a "down" map (`kb`, `pad`, `tch`, `ms`). Each press also calls `push(a)` → `hit[a]++`.
- Per tick: `pressed = hit[a] > 0 || (down && !prev)`, then `hit[a]--`. **Presses queued within one frame come out on
  successive ticks**, and a tap that goes down and up between two ticks is never lost: `pressed` and `released` are both
  true on the same tick.
- Ticks run in this order: `input.tick` → `menus.update` → `ui.update` (dialogue, inventory) → updaters (flow tick:
  inventory/swap/hotspots, content updaters) → `world.update` (player). The first to `consume` wins.
- Menus consume all of `M.keys` every tick while a menu is open (10-ui.js:852), so presses never leak into the game
  across pause/resume.

#### Keyboard (121-142)

- **F2** always toggles the perf overlay (`preventDefault`) and is not emitted as `'key'`.
- Every other keydown sets `lastKey` and emits `'key'` (non-repeat).
- If the target is an `INPUT`, `TEXTAREA` or contentEditable element, the handler stops there: a focused text field
  never generates actions, so Backspace does not trigger NO.
- Unbound keys are left alone, with no `preventDefault`, so browser shortcuts work.
- Bound keys: `preventDefault`, `setScheme('kb')`, `gesture()`. On first press: `kb[a] = true; push(a)`. On auto-repeat:
  directions only push again (menu scrolling); other repeats are ignored.
- keyup: `kb[a]` stays true while any other key bound to the same action is still down.
- `window blur` clears keyboard, mouse and touch-button state (not the pad), so no stuck keys after alt-tab.
- `focusin` on any BUTTON blurs it immediately (163), so Enter and Space are always YES and never a native click.

#### Mouse / pointer (144-165)

- `pointerdown`: touch → `setScheme('touch')`, otherwise `'kb'`; then `gesture()`. Events on `#touch` stop here.
  Otherwise the handler updates `pointer` and sets `pPtr`. **Right button → NO (press + held)**. **Left button (or a
  touch contact) → YES (press + held)** unless the target is inside `button, [data-noyes], input, textarea`.
- **So a tap or click anywhere on the scene is a YES press.** Drag-based minigames get a YES on drag start. Ignore or
  consume it, or put the minigame's DOM under `data-noyes`.
- `pointerup` releases the mouse YES/NO. `pointercancel` clears them. `contextmenu` is suppressed.

#### Touch controls (167-194)

- `[data-a]` buttons: pointer capture, `tch[a]`, `push(a)`, `.on` class while held.
- Virtual stick: `R = 60` px. The vector is offset ÷ R, clamped to the rim, with a 0.15 deadzone. **Run** when the finger
  is beyond `1.15 R`. Flicks past 0.6 (re-armed under 0.35) push `up/down/left/right` edges for menus and grids. The knob
  follows via `transform`.
- `touchDevice = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window`, evaluated once. **Touchscreen
  laptops count**: they start in the touch scheme until the first key press or mouse click.

#### Gamepad (78-98, 164-165)

- Only polled when a `gamepadconnected` event has been seen (Chrome fires it on the first button press). It uses the
  **first connected pad only** and reads buttons `CONFIG.pad[*]`; that list is automatic, unlike `A`.
- Left stick only (`axes[0]`, `axes[1]`, y inverted): radial deadzone 0.2, rescaled to 0..1. Flicks push direction edges
  like the touch stick. The right stick is ignored.
- `setScheme('pad')` on any new button press or stick deflection.
- **A gamepad press never calls `gesture()`**, so a pad-only player who confirms the "JARVIS is ready" prompt with A never
  triggers `AUDIO.init()`. Whether audio then starts depends on the browser's activation rules (gamepad input is
  generally not a user activation).

#### Move vector (109-114)

- Digital directions give a vector normalised on diagonals.
- The pad stick, then the touch stick, replaces it if its L1 magnitude is larger.
- Camera-relative or tank interpretation happens in world (`options.controls`, 09-world…:481).

### 7.5 Resize and the overlay canvas (198-210)

On `resize`, core calls `renderer.setSize(innerWidth, innerHeight, false)`. It then resizes `#overlay` to CSS px × raw
`devicePixelRatio` (not the adaptive ratio), resets its transform to `setTransform(d,0,0,d,0,0)`, and emits
`'resize' {w,h}`. The same overlay sizing runs once at load.

- Resizing a canvas clears it and resets all 2D context state, so overlay painters must redraw every frame and set their
  styles each time.
- A `devicePixelRatio` change (browser zoom, moving to another monitor) does not reset `renderer.setPixelRatio`.
- `ui.card` computes its CSS size only when shown and does not re-layout on rotation. Minigames re-layout by comparing
  `innerWidth/innerHeight` each frame (14-minigames…:291).

### 7.6 Saves (212-227)

Storage format: `localStorage['rue.save']` (TWO: `'two.save'`) = `JSON.stringify({ state, options, profile })`.

| Function | Returns | Behaviour |
| --- | --- | --- |
| `saveGame()` | `true` / `false` | Writes all three. `false` if storage throws (blocked, quota). Callers use the result to avoid a false "Saved." toast (11-flow.js:358) |
| `loadGame()` | `state \| null` | Parses and returns `s.state`. **No validation, no version, no merge with `newState()`** |
| `hasSave()` | bool | `!!loadGame()`, which parses the JSON on every call |
| `saveOptions()` | `void` | Read-modify-write: keeps the stored `state`, replaces `options` and `profile`. Silent on failure |

Call sites: `flow.start` autosaves at the start of every scene except `'P'` (11-flow.js:566). There are also a scene step
`['save']` (11-flow.js:511), a hotspot `kettle` (11-flow.js:358), content (34-content…:713), and `saveOptions()` from
options, title and completion. **Continue** = `state = loadGame(); flow.start(state.scene)` (10-ui.js:790): the scene
restarts from step 0 **with the mid-scene flags of a kettle save**. Rue copes by "dressing" props from flags at scene
start (23-content…:40-46).

Gotchas:

- An old save lacks new state fields. `state = s` makes them `undefined`. Merge on load.
- Autoplay runs write saves too (harmless in the headless runner's fresh profile, but they will overwrite a developer's
  save in their own browser).
- Every access is inside try/catch, so the game runs with storage blocked (a BUILD_PROMPT non-negotiable). Keep it that
  way.

### 7.7 Perf: F2 overlay and adaptive pixel ratio (229-273)

```js
const perf = { adapt: false, toggle(), frame(ms), draw() };
```

| Member | Behaviour |
| --- | --- |
| `toggle()` | Shows/hides `#perf` (F2) |
| `frame(ms)` | Called by the loop every rAF frame with the real frame time. Writes into a 1200-entry `Float32Array` ring (≥10 s at 120 Hz). If `adapt` is on, runs the controller below |
| `draw()` | Returns at once when hidden. Otherwise draws the last 240 frames as 1 px bars (height: 50 ms = full; green < 17.5 ms, yellow < 33.4 ms, red above) with guides at 16.7 and 33.3 ms. Every 15th draw it rewrites the text: last ms, max over the last 10 s, current pixel ratio, `calls`, `tris`, scene id and step index, camera name, and all true flags |
| `adapt` | `false` during loading. `boot()` sets it `true` when the loader finishes (36-main.js:104) |

**Pixel-ratio levels** (233-236): `top = min(dpr, touch ? 1.5 : 2)`, then `levels = [2, 1.5, 1].filter(v => v <= top)`,
with `top` prepended if it is not first. Level 0 = `top`. The floor is **always 1**.

| Device | levels |
| --- | --- |
| desktop dpr 1 | `[1]`: no adaptation possible |
| desktop dpr 1.25 | `[1.25, 1]` |
| desktop dpr 2+ | `[2, 1.5, 1]` |
| phone dpr 3 (coarse) | `[1.5, 1]` |

**Controller** (241-251):

- Accumulates `min(ms, 50)` per frame, so one hitch can't trigger a drop, over windows of ≥2000 ms.
- At each window end, `avg = winT / winN`:
  - `avg > 18` and not at the floor → drop one level, `good = 0`, **`need *= 2`**.
  - `avg < 17.2` and above the top level → `++good`; after `need` consecutive good windows (initially 3, so ≈6 s), raise
    one level.
  - Otherwise `good = 0`.
- `need` never resets, so each drop doubles the wait before the next raise. That prevents see-sawing, but after a few
  drops the resolution effectively stays down.
- A 60 Hz display can never average below 16.7 ms, so 17.2 means "keeping up with vsync".
- It also runs on the title and while paused.

---

## 8. MAIN (`36-main.js` / TWO `99-main.js`)

### 8.1 `boot()` sequence

`async function boot()`, called once at the end of the module (36-main.js:135). It is not awaited, so a throw before the
loop starts shows up as an unhandled rejection.

| # | Step | Lines |
| --- | --- | --- |
| 1 | Read the save JSON; `Object.assign(options, s.options)` and `Object.assign(profile, s.profile)` in try/catch | 6-10 |
| 2 | `body.large` from `options.textSize` | 11 |
| 3 | `ui.init()` (on render → popup.render); `menus.init()` (on key → JARVIS cheat) | 12 |
| 4 | `on('scene:end')`: under autoplay, `RUE_TEST.done = true` at `TEST.stop` or `'PC'` | 13-16 |
| 5 | **Start the frame loop** (`requestAnimationFrame(frame)`) while still loading. `progN = Infinity` disables the shader check for now | 20-49 |
| 6 | Loader: `setP(0)`; build the `jobs` list; `await nextFrame()` so 0% paints | 52-97 |
| 7 | Run each job: `try { await job() } catch { console.error }`; `setP((i+1)/n)`; `await nextFrame()` | 98-102 |
| 8 | `renderer.setRenderTarget(null); renderer.clear(); perf.adapt = true; progN = renderer.info.programs.length` | 103-105 |
| 9a | **Autoplay**: hide the loader, `AUDIO.init()` (no gesture; the runner launches Chromium with `--autoplay-policy=no-user-gesture-required`), `state = newState()`, `RUE_TEST.ready = true`, `flow.start(TEST.scene \|\| 'P', { select: !!TEST.scene })`, return | 107-114 |
| 9b | **Normal**: message "JARVIS is ready.", hide the progress bar, append `<button class="jv-b foc">YES</button>`, `input.gesture = () => AUDIO.init()`, `RUE_TEST.ready = true` | 117-123 |
| 10 | Wait for YES: an updater that checks `input.pressed('yes')` (then `consume`), **or** the button's `onclick` | 124-129 |
| 11 | `ui.sfx('chime_ready')`, hide the loader. First launch (`!profile.seenPrologue`) → `state = newState(); flow.start('P')`. Otherwise `menus.title()` | 130-132 |

Clicking the YES button: pointerdown on a `button` → `gesture()` runs `AUDIO.init()` but no YES press is queued, then
`onclick` → `done()`. Pressing Enter: keydown → `gesture()` → YES queued → the updater sees `pressed('yes')`.

### 8.2 The frame loop and fixed step (20-49)

```js
function tick() {
  input.tick();
  menus.update();
  if (clock.paused) return;
  ui.update(step);
  clock.step();
  if (hasWorld()) world.update(step);
}
function frame(now) {
  requestAnimationFrame(frame);
  const ms = now - last; last = now;
  perf.frame(ms);
  input.poll();
  acc += Math.min(ms / 1000, CONFIG.maxFrame) * (TEST.auto ? Math.max(clock.scale, TEST.speed) : clock.scale);
  for (let n = 0; acc >= step && n < 12; n++) { tick(); acc -= step; }
  if (acc >= step) acc %= step; // more than 12 ticks behind: drop it rather than spiral
  renderer.info.reset();
  if (hasWorld()) world.render(acc / step);
  emit('render', acc / step);
  perf.draw();
  if (renderer.info.programs.length > progN) { … }
}
```

| Rule | Detail |
| --- | --- |
| Fixed 60 Hz | Each tick is `1/60` s of game time. Game logic never sees a variable dt |
| Clamp | Real frame time is clamped to `CONFIG.maxFrame` (0.25 s) before scaling |
| Tick cap | **12 ticks per frame**. Any whole ticks beyond that are dropped (`acc %= step`); the fractional part is kept. At ≤5 fps, or when `speed × scale` asks for more than 12 ticks, game time runs slower than requested |
| Scale | `clock.scale` (1, or 3 while holding NO in a cutscene). Under autoplay, `max(clock.scale, TEST.speed)`. `TEST.speed` has **no effect outside autoplay** |
| Interpolation | `alpha = acc/step ∈ [0,1)`. `world.render(alpha)` lerps actors and camera between the previous and current tick (09-world…:1152-1167) |
| `hasWorld()` | `typeof world !== 'undefined' && world.set`. World update and render are skipped until the first `world.load`/`show` (`world.warm` does not set it) |
| During loading | The loop already ticks: `clock.t` advances, `ui.update` runs, `'render'` fires. Long synchronous jobs block it; each job is followed by `nextFrame()` |
| While paused | `menus.update` + render + `'render'` + perf only |
| Exception safety | `requestAnimationFrame` is re-armed first, so the loop survives throws (see 7.3.5) |

### 8.3 Loader and jobs (52-102)

```js
const jobs = [];
if (typeof AUDIO !== 'undefined') jobs.push(() => AUDIO.prerender());
if (typeof world !== 'undefined') for (const id in SETS) jobs.push(() => world.warm(id));
if (typeof buildCharacter === 'function') for (const id in LOOKS) if (LOOKS[id]) jobs.push(() => warmCharacter(id));
```

- Jobs run in order: **audio, then every set, then every character**. Each job gets equal weight on the bar
  (`setP((i+1)/jobs.length)` → `.jv-prog i` `scaleX`, `span` %).
- `AUDIO.prerender()` is one async job that yields internally (`OfflineAudioContext` renders plus `setTimeout(0)` between
  groups, 03-audio.js:703-724). It bakes every SFX, stem, voice, loop and music cue.
- `world.warm(id)` (09-world…:1207-1220) builds the set (or reuses a live one) and makes every hidden object visible. It
  then compiles programs with the set's own lights and fog, uploads all material textures (`initTexture`), and renders
  once under the loader. Afterwards it **disposes the geometry if the set was not live**: programs and uploaded textures
  survive, and the set is rebuilt on its real load.
- A failing job is logged (`console.error('RUE boot job failed', e)`), which **fails the headless test**, and boot
  continues.
- After the jobs: `setRenderTarget(null); clear()` wipes whatever the last warm-up drew.

### 8.4 `warmCharacter(id)` and portrait baking (57-92)

The warm scene is created once, lazily. It mirrors the set lighting so the **same shader programs** are compiled:

```js
sc.background = new THREE.Color(0x2c3868);
sc.fog = new THREE.FogExp2(0x2c3868, 0.002);
sc.add(new THREE.HemisphereLight(0xfff2e0, 0x404058, 1.4));
const dl = new THREE.DirectionalLight(0xffffff, 1.7); dl.position.set(1.2, 2.5, 3); sc.add(dl);
const sp = new THREE.SpotLight(0xffffff, 0); sc.add(sp, sp.target);
```

It also adds **8 tiny `InstancedMesh` variants**: `transparent ∈ {false,true}` × `map ∈ {null, 4×4 canvasTex 'warm_px'}` ×
`instanceColor ∈ {no, yes}`, all from `mat(0xffffff, {…, key:'warm_family'})`, `frustumCulled = false`. They compile the
program families that only mid-game effects use (Rue's walk smears) and stay in the warm scene for every later character.
The camera is `PerspectiveCamera(30, 1, 0.05, 30)`.

Per character:

1. `rig = buildCharacter(id)`, add it to the warm scene, `rig.face.set('neutral')`, `updateMatrixWorld(true)`.
2. Focus `v = (0, rig.eye − 0.04, 0)`, or the head's world position + 0.08 if `rig.eye` is not a number.
3. `cam.aspect = gl.width / gl.height`; camera at `v + (0.12, 0.05, 0.8)` looking at `v + (0, 0.01, 0)`.
4. `renderer.compile(scene, cam)`, then `renderer.render(scene, cam)` to the **visible** canvas, hidden behind `#loader`.
5. Copy the **centre square** of `renderer.domElement` into a new 128×128 canvas, then `portraitURL.bake(id, canvas)`.
   This works without `preserveDrawingBuffer` only because the copy is **in the same task as the render**. Never put an
   `await` between them.
6. Remove the rig from the warm scene; `world.adopt(id, rig)` pools it, so the first spawn of that look builds nothing.

Portrait facts (10-ui.js:583-632):

- `portraitURL(id)` → data URL. It uses a baked canvas, an alias (`student → student_a`; `voice/operator/assistant →
  null` = silhouette), a duo split for `voice.also` ids, a fallback painted from the face texture, or a silhouette.
- `bake()` **overrides aliases**: any id with a `LOOKS` entry gets its 3D bust.
- **The framing depends on the boot-time window shape.** The crop is `min(w,h)` of a frame whose vertical FOV is 30°.
  On a portrait phone the square covers only `w/h` of the vertical view, so portraits come out more tightly zoomed than
  on landscape.
- Only **one** rig per look is pooled. A second simultaneous instance of a look is built mid-game.

### 8.5 Mid-game shader detector (43-48)

After loading, `progN` = number of compiled programs. In any later frame where `renderer.info.programs.length > progN`,
the code updates `progN`. Under autoplay it also logs:

```
console.warn('RUE: shader compiled mid-game in ' + flow.sceneId + ' step ' + flow.stepIndex + ' (' + cam.name + ')')
```

- It is a **warning**, so it does not fail `npm test`. Read the runner's output for it.
- Disposed materials shrink `programs.length`, so a later compile that only climbs back to the old count is not reported.
- Outside autoplay it updates silently.

### 8.6 What `boot()` requires from other subsystems

| Symbol | Used for | Guarded? |
| --- | --- | --- |
| `ui.init()`, `ui.update(dt)`, `ui.sfx(name)` | init, tick, ready chime | no |
| `menus.init()`, `menus.update()`, `menus.title()` | init, tick, after YES | no |
| `world.update(dt)`, `world.render(alpha)`, `world.set` | loop | `hasWorld()` |
| `world.warm(id)`, `world.adopt(id, rig)` | jobs | `typeof world` / `world.adopt` |
| `AUDIO.prerender()`, `AUDIO.init()` | jobs, gesture | `typeof AUDIO` |
| `buildCharacter(id)`, `canvasTex`, `mat`, `portraitURL.bake` | warmCharacter | only `buildCharacter` |
| `flow.start(id, o)`, `flow.sceneId`, `flow.stepIndex`, `cam.name` | start, detector | no |
| `rig.root`, `rig.face.set`, `rig.eye`, `rig.parts.head` | portrait framing | partly |

---

## 9. Test hooks (`01-config.js:130-138`)

```js
const TEST = (() => {
  const q = new URLSearchParams(location.search);
  return { auto: q.has('autoplay'), scene: q.get('scene'), stop: q.get('stop'), speed: +(q.get('speed') || 1), fast: q.has('fast') };
})();
window.RUE_TEST = { ready: false, done: false, scene: null, step: null, log: [] };
const testLog = (msg) => { if (TEST.auto) RUE_TEST.log.push(msg); };
```

| Param | Field | Effect | Gotcha |
| --- | --- | --- | --- |
| `autoplay` | `TEST.auto` | Skip the YES gate; dialogue auto-advances (0.15 s), choices pick `opt.test` or the first enabled option, asks answer `opt.test ?? true`, popups press their first button, inventory closes, `roam` runs `o.auto` or sets its `until` flags, minigames run `autoplay(api)` or finish after 0.5 s, the title never shows | **Presence**, not value: `?autoplay=0` still enables it |
| `scene=ID` | `TEST.scene` | Start there with `{select:true}`: fresh state plus the `grants` of every earlier scene in `SCENE_ORDER` | – |
| `stop=ID` | `TEST.stop` | `done` after that scene ends | – |
| `speed=N` | `TEST.speed` | Ticks per frame multiplier (max 12 ticks per frame), autoplay only | Non-numeric → `NaN` → `acc` becomes NaN → **no ticks ever** |
| `fast` | `TEST.fast` | Every cutscene runs as if skipped (state steps still apply) | Presence only |

`RUE_TEST` / `TWO_TEST`:

| Field | Set by |
| --- | --- |
| `ready` | boot, after loading (both paths) |
| `done` | main `'scene:end'` at stop/PC; flow at stop/PC (11-flow.js:584); flow `theEnd()` (unbuilt next scene); `menus.title` under autoplay unless P → 1.1 |
| `scene`, `step` | `flow.start` (`scene = id`), and per scene step (`step = 'i kind'`) |
| `log` | `testLog(msg)`: scene starts and steps, cutscene ids, minigames, world warnings. **Autoplay only, unbounded** |

`tools/run.mjs` prints new `log` lines, takes screenshots with `--shots dir --every s`, and exits 0 only if
`done && no console errors`.

---

## 10. How to extend for TWO

The items below are what BUILD_PROMPT §§9-16 need from this subsystem. Each has the concrete change and its pitfalls.

### 10.1 CONFIG and registries

- **CHIP action** (§11: Q / LB / CHIP button). All four places are needed:
  ```js
  // 01-config.js
  keys: { …, chip: ['KeyQ'] },  pad: { …, chip: 4 },          // LB (index 4 is free)
  // 02-core.js:51 — better: derive it so this can't drift again
  const A = [...new Set([...Object.keys(CONFIG.keys), ...Object.keys(CONFIG.pad)])];
  // 00-head.html, inside #touch
  <button class="tb" id="t-chip" data-a="chip">CHIP</button>   // + CSS position; hide unless Chase (2040) is active
  // 31-ui.js menus: add 'chip' to M.keys (else a chip press leaks out of the pause menu) and to CONTROLS
  ```
- **Hold-to-press option** (§13.9 "every hold-to-confirm can be set to press instead"): add `options.holdToPress`. Add
  one helper used by every hold mechanic (record a sample for 1 s, Hum, Coat, Tether yank):
  `const holding = (a) => options.holdToPress ? latch(a) : input.held(a)`. Don't sprinkle `input.held` across content.
- **Story Mode** (§10, §13.8): `options.storyMode = false`. The boss reads it.
- `CHARACTERS`: `luka`, `chase`, `chase40` (`'CHASE (2040)'`), **`manager` (`'THE MANAGER'`) and `luka40`
  (`'LUKA (2040)'`) as separate ids**. Switching the speaker id is the name-label switch at the reveal.
  - For the silhouette portrait, give the Manager's 3D look a **different** `LOOKS` id (e.g. `luka40_hood`). Alias
    `manager → null` in `portraitURL`. A `LOOKS.manager` would be baked into a real portrait.
  - Duo ids need `voice.also` and an `a_b` id. Avoid underscores in single ids that do have `also`.
- `SCENE_ORDER`: `P, 1.1–1.8, 2.1–2.10, 3.1–3.7, A1, A2, B1, B2, C, PC`. `flow.next()` is linear, so the endings need a
  branch:
  - Add an optional `SCENES[id].next` (id or `(state) => id`) honoured by `flow.next()`. 3.7 → A1/B1 by `state.choice`;
    A2 → C.
  - Make `{select:true}` grants skip the other branch: scene select into B1 must not grant A1/A2.
  - Main's `'scene:end'` treats `'PC'` as the end. Keep that id.
- `ACTS`: keys `'1.1'`, `'2.1'`, `'3.1'`, text `'ACT ONE — Will You Accept the Charges?'` etc. `actCard` splits on
  `' — '` (spaces around an em dash).
- `SAMPLES`: the 14 samples of §13.6, `{ label, sfx }`. The `sfx` recipe must exist in AUDIO or `sampleBuffer()` returns
  null. **Keep `NAMES`, `BUGS` and `DOOR_BUG` defined** (empty is fine) until the ui extras and the Rue minigames that
  reference them are rewritten. Removing them is a ReferenceError at menu time.
- `STRINGS` is free to use (Rue never did).

### 10.2 State, profile, saves

- `newState()` per §16: `{ scene:'P', flags:{}, inventory:[], active:'luka', samples:[], names:[], pattern:null,
  hack:0, choice:null, battery:null, bars:null, … }`. Keep `null hides it` for HUD fields (QUIET IN, Samples, HACK %).
- `profile`: add `endingsSeen: []` (Extras → Endings). Persist with `saveOptions()` the moment an ending is seen, not at
  PC, so a quit after A2 still counts.
- **Version and merge on load** so older saves never produce `undefined` fields:
  ```js
  function loadGame() {
    try { const s = JSON.parse(localStorage.getItem('two.save'));
          return s && s.state ? Object.assign(newState(), s.state) : null; } catch (e) { return null; }
  }
  ```
  Write `{ v: 1, state, options, profile }` and ignore unknown versions.
- **Kettle saves (§13.1)**: Rue's hotspot `kettle` already saves mid-scene. Continue restarts the scene from step 0 with
  mid-scene flags. Either snapshot `state` at `flow.start` and have the kettle write that snapshot plus
  inventory/samples, or make every scene's opening idempotent and flag-driven (Rue's "dress from flags" pattern). Don't
  mix both.
- Never let a failed write show "Saved.". Branch on `saveGame()`'s boolean (11-flow.js:358).

### 10.3 Test hooks

- `&ending=A|B` (§16, §17):
  `ending: (q.get('ending') || '').toUpperCase() || null` in `TEST`. Feed it to the Choice through the existing autoplay
  answer: `ask(q, { test: TEST.ending !== 'B' })` or `choose(labels, { test: TEST.ending === 'B' ? 1 : 0 })`.
- Consider turning the mid-game shader warning into `console.error` in TWO, so `npm test` fails on a missed warm-up.
- Every new minigame needs `autoplay(api)`. Without it the host finishes after 0.5 s with `{auto:true}`, which won't set
  the flags later scenes expect.
- Run both `autoplay=1&fast=1` (skip paths) **and** plain `autoplay=1` (timed paths). They exercise different code.

### 10.4 Event bus

Useful new events are `'swap'` (active changed), `'chip'` (on/off), `'hack'` (percent, from the boss), `'ending'` and
`'sample:add'`. Rules:

- Pass a primitive or a **reused** payload object for anything per-tick (`emit('hack', pct)`, not `emit('hack', {pct})`).
- Don't `off()` inside the same event's emit (it skips the next listener).
- A listener must not throw.

### 10.5 Clock, waits and skip-safety

Every cutscene step must **finish instantly when skipped** (§16):

- Use `wait()` / `waitUntil()` only. Never `setTimeout`, `setInterval`, an audio `onended` or a raw Promise in a
  cutscene: they ignore skip, pause and hold-NO.
- An updater started by a step must apply its end state immediately when `flow.skipping`
  (`if (c.flow.skipping) f(1); else addUpdate(f);`) and must remove itself.
- After `await waitUntil(cond)`, assume nothing. Under skip, snap actors to their marks yourself.
- **No poll loops** (7.3.4). Put a time cap in every `waitUntil` predicate.
- `stare` (§16, capped at 4 s) = `wait(Math.min(sec, 4))`. It is skipped automatically.
- `clock.scale` belongs to flow. For slow motion or timelapse, add a flow-owned multiplier read in `flow.tick` instead of
  writing `clock.scale` elsewhere (it is overwritten every tick).
- Boss timers (hack %, cooldowns, hug 3 s, Signal fill, the cosmetic QUIET IN countdown) belong in updaters that
  accumulate the `dt` argument, so they pause with the menu automatically. Derive the countdown from hack %, not wall
  time.
- In per-tick code, never call `wait()` or allocate closures.

### 10.6 Input for TWO's mechanics

- **Tether aim (mouse)**: `pointer.x/y` are CSS px. NDC = `(x / innerWidth) * 2 - 1`, `-(y / innerHeight) * 2 + 1`, then a
  preallocated `Raycaster` with `world.camera`. For split screen, use the half-width.
- **Tether aim (stick)**: only the left stick is read. Either aim with `input.move` or add `axes[2..3]` in `poll()` as
  `input.aim` (reuse an object).
- **Polish (drag)**: the press that starts a drag is also a YES. Read `pointer.down/x/y` and treat YES as "rub". The
  accessibility rule (hold YES to polish slowly) then falls out naturally. On touch, the drag must start outside
  `#touch`.
- **Rhythm (piano, sequencer)**: `pressed()` has 1-tick (16.7 ms) resolution and may lag a frame. Judge hits against
  `clock.t` of the tick with generous windows (§9.6 already asks for that).
- Prompt labels: switch on `input.scheme` (`'pad'` → A/B/Y/LB, `'touch'` → button names, `'kb'` → keys), as
  `ui.swapIndicator` does.
- Consider calling `AUDIO.init()` on the first gamepad press too (harmless if the browser refuses), and/or keep the
  loader's YES requiring a key, click or tap.

### 10.7 DOM and CSS additions

| Need (BUILD_PROMPT) | Suggested element |
| --- | --- |
| SafeSense popups (§12) | A second class family (`.ss`, `.ss-bar`, `.ss-b` pill buttons, translucent white, blue glow, `backdrop-filter` optional) in `#pops`, pooled like `.jv`. The Manager's prompt is an `.ss` with an empty NO slot |
| HUD: NO SERVICE, QUIET IN hh:mm:ss, Samples n (§13.4) | Extend `#hud` markup (`.quiet`, `.samples`). Add `.off` per part, driven from `state` |
| HACK % bar (§13.4, §10) | New `#hack.off`, centre-top, z ≈ 7 (above the letterbox) |
| Chip View tint and scanlines, Signal meter (§13.5) | A CSS layer `#chipview.off` (blue tint + `repeating-linear-gradient` scanlines, `pointer-events:none`, z below `#dlg`) and a meter. No extra WebGL pass and **no new shader program** |
| CHIP touch button | `#t-chip[data-a=chip]`, positioned clear of `#t-swap`/`#t-bag` and hidden under `talking`/`invopen` like SWAP |
| Loader: "a progress bar that sometimes goes backwards" (§15) | Purely cosmetic inside `setP`: occasionally show `f − 0.02..0.05` for a few frames. Never slow down or reorder jobs |
| Title "two" with an orbit of the 2040 store (§13.8) | Already `two` in `src/00-head.html`. The orbit lives in menus/world |
| Safe areas | `padding: env(safe-area-inset-*)` on `#touch` children and `#dlg` |

Keep `.off` as the only show/hide mechanism, and keep every new interactive panel under `data-noyes` so clicks on it
aren't also YES.

### 10.8 Boot, warm-up and performance (§16)

- **Warm every program family at boot.** The warm scene must have the **same light rig and fog type** as the sets (one
  hemi, one directional, one spot, `FogExp2`). If any TWO set adds a light (a second spot, a point light) or uses `Fog`
  instead of `FogExp2`, every material in that set compiles new programs. Mirror it in the warm scene or keep the rig
  fixed (§14 says: one hemi + one dir + one movable spot).
- Add to the warm scene's family list whatever TWO introduces:
  - instanced drones with `instanceColor` (hundreds in the hangar, 400 on the roof, turning yellow)
  - transparent emissive glass (SafeSense, scan cones, hug field, `side: DoubleSide` → `forceSinglePass`)
  - emissive `map` screens
  - any `MeshBasicMaterial`, `Points`, `Sprite` or `ShaderMaterial` (AR signs, rain, foam)

  Each distinct material type × `map` × `transparent` × `instancing` × `instanceColor` × `vertexColors` × fog is its own
  program.
- **Characters**: TWO has more looks and attachment variants (Santa hat and beard, headphones, coat, hood up and down).
  Toggling visibility of attachments on one rig adds no programs. **Separate looks each need a warm job.** For crowds
  (choir, staffers, parade), add a `warmRig(id, n)` that builds and adopts `n` rigs without re-baking the portrait, or
  use instancing.
- **Portraits**: to make them orientation-independent, render the bust with `cam.aspect = 1` into a square
  viewport/scissor (or a 128² render target plus `readRenderTargetPixels`), instead of cropping the full canvas.
- **Boot time**: 14 sets plus all characters. `world.warm` builds each set fully and then throws the geometry away, so
  set build cost is paid twice (boot plus real load).
  - Keep each set build well under ~150 ms, or split heavy sets into several jobs so the loader keeps animating.
  - Set textures are only reused if `canvasTex` returns the same cached Texture, so pass a `key`. Otherwise the real load
    creates and uploads new textures mid-game.
- **Loads behind black** (§16): use `world.preload(next)` during the last shot or a fade. Keep `world.liveMax` sets alive
  (Rue 2; §16 allows 3).
- **Adaptive pixel ratio** (§16 asks: drop if >20 ms for 1 s; raise when there's headroom; start lower on touch):
  - Rue's controller (2 s windows, >18 ms drop, <17.2 ms raise, exponential back-off) meets the intent and is proven.
  - If you change it, keep the 50 ms per-frame clamp and the back-off.
  - Consider a `0.75` floor level on touch only, for the 400-drone roof and the storm sets.
  - Change the cap in both places (02-core.js:9 and 233-234).
- **F2 overlay** (§16 lists textures): add `renderer.info.memory.textures` and `geometries` to the `pre` text. The draw-call
  target is < 300; the overlay already shows `calls`.
- **No per-frame allocation** in anything the loop calls: updaters, `'render'` listeners, minigame `update/draw`, world
  hooks.
  - Preallocate `Vector3`s and pools.
  - Pass primitives through `emit`.
  - Don't build strings per frame. `perf.draw` only does so when visible and every 15 frames.
  - Avoid `Object.keys`, `filter`, `map` and spread in tick code.
- **Merged geometry and instancing** are the art/world subsystem's job. From core's side: a set's `update` runs every tick
  inside `world.update`, so keep it O(changed things).
- **Never build a rig or a set mid-cutscene.** The shader detector (autoplay) and F2's max(10 s) are the tools to verify
  this. Run `npm test` and grep the output for `shader compiled mid-game`.

---

## 11. Gotchas, consolidated

1. **`await wait(0)` (or any `wait` while `flow.skipping`) in a loop hangs the page.** Pre-resolved promises never yield to
   the next frame. Use `waitUntil`.
2. **`waitUntil` resolves under skip even when its condition is false.** Snap state after it.
3. **A throwing updater, `waitUntil` predicate, `ui.update` or `world.update` freezes the canvas every frame.** There is
   no try/catch in `clock.step`.
4. **The input action list `A` is hard-coded** (02-core.js:51). New actions need `A`, `CONFIG.keys`, `CONFIG.pad`, the touch
   button and the menus' `M.keys`.
5. **Any left click or tap outside buttons/`[data-noyes]` is a YES press**, right click is NO, and drags start with a YES.
6. **`clock.scale` is overwritten every tick by `flow.tick`.** Don't set it elsewhere.
7. **Pause freezes `ui.fade` and every wait, but not rendering or `'render'` listeners.** Don't await fades while paused.
   Don't advance state in `draw()`.
8. **Wait continuations run after the frame's render, as microtasks.** Chained waits drift by up to (ticks per frame − 1)
   ticks.
9. **`state` is a reassigned `let`.** Don't hold references to it across scenes. Old saves are loaded unmerged.
10. **The portrait bake reads the WebGL canvas in the same task as the render.** No `await` in between. Framing depends
    on the boot-time aspect ratio.
11. **The warm-up light rig and fog must match the sets**, or every program compiles again mid-game. One rig is pooled per
    look.
12. **`off()` during `emit()` skips the next listener.** Listeners run synchronously with no isolation.
13. **`?autoplay=0` still means autoplay.** A non-numeric `speed` stops the game clock under autoplay.
14. **Leaf fragments in TWO's build are block-scoped** and evaluate before `30-world/31-ui/32-flow`. Register only; touch
    engine globals only inside functions called later.
15. **The gamepad never triggers the audio-unlock gesture.**
16. **The shader-compile detector only warns under autoplay**, and disposals can mask it.
17. **Renders inside ticks aren't counted** by F2 (`info.reset()` happens after the ticks).
