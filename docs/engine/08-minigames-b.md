# 08 — Mini-games B: Final YES + memory recorder, Credits, Blend In, Keep Up, Rue's walks, Role Play, Torchlight

Reference manual for the second half of Rue's mini-games. It covers seven `MINIGAMES` entries and one engine-grade
utility hidden inside one of them, the **memory recorder** (`MINIGAMES.final_yes.snap` / `.still`). For each game it
gives the id, the params, what the player does, how it renders, how it reads input, how it finishes, how autoplay works,
the helpers worth stealing, and line ranges. §10 maps every game onto what TWO needs (BUILD_PROMPT §9, §10, §13.7, 3.6,
3.7, C) and §11 lists the gotchas in one place.

| Rue (`ref/rue/`) | Lines | `MINIGAMES` ids | Scene(s) in Rue |
| --- | --- | --- | --- |
| `17-minigame-the-final-yes-3-4-the-memory-recorder.js` | 253 | `final_yes` (+ `snap`, `still`) | 3.4; snaps taken in 1.4, 2.3, 2.5, 2.6, 2.9, 2.13, 2.10 |
| `18-minigame-credits-scene-c.js` | 112 | `credits` | C |
| `19-minigame-blend-in-2-3.js` | 137 | `blend_in` | 2.3 |
| `20-minigames-keep-up-2-4-and-rue-s-walks-2-4-2-12-3-1.js` | 419 | `keep_up` (19-129), `rue_walk` (131-419) | 2.4 / 2.4, 2.12, 3.1 |
| `21-minigame-role-play-2-8-rue-s-room.js` | 143 | `role_play` | 2.8 |
| `22-minigame-torchlight-2-13.js` | 119 | `torchlight` | 2.13 |

**These files are not in TWO's `src/`.** TWO's `src/` holds only the engine fragments (core, audio, art, world, ui, flow,
main) plus sets. TWO writes its own mini-games in `src/40-…59-mg-*.js` (ARCHITECTURE §3.6: `45-mg-teddy.js`,
`49-mg-blend-in.js`, `52-mg-hold.js`, `53-mg-credits.js`, …). Port code from here by copying it into those leaf files.
Everything these games call (the host `api`, `player`, `cam`, `ui`, `say`/`ask`/`choose`, `AUDIO`) exists unchanged in
TWO's `src/`, except that `RUE_TEST` is `TWO_TEST` and the save key is `two.save`.

Citations: `17:NNN` is line NNN of `17-minigame-…js`, and likewise `18:` to `22:`. `20:` covers both `keep_up` and
`rue_walk`. `09:` is the world, `10:` the UI, `11:` the flow, `03:` audio, `06:` the square set, `07:` the
theatre/rooms sets, and `25:`–`35:` content files. Related manuals: `06-flow.md` §10 (the mini-game host contract and
`api`), `04-world.md` (actors, `player`, `cam.override`, the torch), `05-ui.md` (`say`/`ask`/`choose`, `ui.prompt`,
`ui.fade`, `hud`, CARDS), `02-audio.md` (`AUDIO.loop`, `AUDIO.song`), `03-art.md` (`ANIMS`, `instanced`, `mat`). The
first half of Rue's mini-games (files 12-16) is `07-minigames-a.md`. In tables, `‖` stands for JavaScript `||`.

---

## 0. At a glance

| id | Params | Player does | Renders with | Input | Finishes with | Can fail? | Autoplay |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `final_yes` | none | Holds YES for 3 s; letting go rewinds | Overlay 2-D canvas (full screen) over a fixed 3-D shot | `input.held('yes')` | `{done:true}` after the screen is white; the white is handed to `#fade` | No | Fills at 4× speed |
| `credits` | none | Watches. NO after 3 s asks "Skip credits?" | DOM in `api.ui`, paused Web Animations scrubbed by time | `input.pressed('no')` + `api.ask` | `{done:true}` or `{done:true, skipped:true}`, screen left black | No | Timeline compressed to 0.8 s |
| `blend_in` | none | Walks Luka down the theatre while Hartigan reads; holds NO to duck when he looks up; can take a textbook | 3-D (set zone camera) + overlay HUD panel | Player movement, `held('no')`, `pressed('yes')` | `{ok:true, fails}` | Soft: reset to the door | Finishes at once with `{ok:true, auto:true}` |
| `keep_up` | `{lines: [[id, text], …]}` | Steers Chase to keep up with Rue (who never waits) while lines play | 3-D: a TRACK shot, then `cam.override('follow')` | Player movement | `{done:true}` when Rue has arrived and every line has played | No | Chase steered to Rue's shoulder |
| `rue_walk` | `{walk: 1\|2\|3}` | Walks Rue across Front Square; people stop him; one key answers them | 3-D: a custom camera rig fed through `cam.override('fixed', view)` | Player movement (walk 2: any stick = forward), `pressed('no'/'yes')` | `{done:true}` at the route end | No | Walks the route; walk 2 auto-walks |
| `role_play` | none | Picks one of five cards before each of Rue's answers | 3-D locked stage shot + dialogue `choose` | `api.choose` | `{done:true}` | No | `choose`'s `test` picks, scripted to walk every wrong path once |
| `torchlight` | `{walkman: [x,y,z]}` | Follows a trail in the dark with a phone torch; NO toggles the torch, SWAP swaps | 3-D: the set's spot light as the torch, follow camera, HUD battery | Movement, `pressed('no')`, `pressed('swap')` | `{found:true}` when the beam lands on Rue | No | Walks the trail |

---

## 1. Conventions shared by these files

### 1.1 Lifecycle guards

| Pattern | Where | Why |
| --- | --- | --- |
| `done` flag set in `start` (false) and in `end`/`finish`/`win` (true); `update` and `draw` return early when it is set | every file | `api.finish` calls `end` synchronously; a later `update` tick or a resolved promise must not act on a dead game |
| `tok` generation token: `start` does `const t = ++tok`; async loops check `t !== tok` after every `await`; `end` does `tok++` | 20 (both), 21, 22 | Kills every detached `async` loop (steering, meets, scripts) when the game ends or is aborted by `flow.stop()` |
| `ABORT` sentinel: `const live = () => { if (t !== tok) throw ABORT; }` wrapped round every await, caught at the top | 21:38, 74-77, 132-136 | Linear scripts without an `if (t !== tok) return` after every line |
| `busy` flag: `update` returns while a scripted beat (line, fail, meet) runs | 19:30-53, 20:200-262 | `api.play` already pauses `update`; `busy` also covers `api.say`/`moveTo` beats that do not pause it |
| `if (done) return;` after every `await` in a fail/take beat | 19:49, 52 | `flow.stop()` → `finish({aborted:true})` can land in the middle of `api.play` |

### 1.2 Globals vs `api`

The host's `api` (06-flow.md §10.3) is used for `finish`, `overlay`, `ui`, `world`, `cam`, `input`, `sfx`, `AUDIO`, `say`,
`ask`, `choose`, `hud`, `play`, `params`, `state`. These files also reach straight for globals, which is fine in
one-module TWO but worth knowing when porting:

| Global | Used by | For |
| --- | --- | --- |
| `player` | 19, 20, 22 | `control`, `follower`, `enabled`, `speedMul`, `frozen`, `actor` |
| `ui` | 17, 18, 19, 20, 21, 22 | `fade`, `prompt`, `letterbox`, `toast`, `swapIndicator`, `paintCard` |
| `input` | 20 (`rue_walk`), 22 | the same object as `api.input` |
| `state` | 18, 19, 20, 22 | `names`, `pattern`, `samples`, `flags`, `active`, `battery`, `bars` |
| `options.reduceFlashing` | 17 | the montage's flicker and burn |
| `TEST.auto` | 20:181 | `key()` waits 0.4 s instead of a press |
| `flow` | 17:168 (`skipping`), 22 (`busy`, `follow`) | |
| `clock.t`, `wait`, `waitUntil` | 20, 21 | timers and async beats |
| `music` | 18:80, 20:353 | stop the cue / start `held_note` |
| `renderer`, `world` | 17:168-177, 20:355 | the memory recorder; `compileAsync` |
| `SETS.square` | 20:90, 339, 370 | `puddles`, `floor(x, z)` |
| `ANIMS` | 19:13-14 | registers `book_walk` at evaluation |
| `CONFIG.walk`, `CONFIG.colors.yes` | 19, 20, 22 | 1.7 m/s; `#ffd21f` |

### 1.3 The overlay canvas idiom

Every overlay game paints in CSS pixels with the device-pixel transform derived from the canvas itself, and clears
before painting:

```js
const k = ov.canvas.width / w;                        // the overlay is CSS px × raw devicePixelRatio (01-core.md §7.5)
ctx.setTransform(k, 0, 0, k, 0, 0); ctx.clearRect(0, 0, w, h);   // 19:105-106
```

`end()` resets the transform to identity and clears the whole backing store (`17:249`, `19:128`). The host also clears and
hides `#overlay` after `end` (11:423), but the games do it themselves because `end` runs first.

### 1.4 What each `end()` must undo (checklist distilled from these files)

`player.enabled = false`, `player.follower(null)`, `player.speedMul = 1`, `ui.prompt(null)`, `ui.letterbox(false)`,
`ui.swapIndicator(null)`, `cam.override(null)` (unless the next cutscene cuts from it on purpose, 22:111), own audio
handles stopped (`hum`, `song`, `loop`), props/actors this game spawned despawned (20:120, 408), `walkAnim` restored
(19:126, 20:407), set props restored (20:406), DOM pokes restored (20:403), `world.torchAuto` restored (**22 forgets**,
§8.7).

---

## 2. `final_yes` (3.4) and the memory recorder — `17:1-253`

### 2.1 What it is

Luka's and Chase's hands rest on the machine's big yellow YES (painted on the overlay). The player holds YES for 3 s.
While held, five stills of earlier moments flicker past in reverse order (`torch → floor → pedal → crash → wall`), each
pushing in and burning out to white. Letting go rewinds smoothly. At 3 s the screen is fully white; 0.35 s later the game
finishes and hands the white to `#fade`, which eases off over 1.6 s into the next shot.

Call site (33:472): `['cam', 'fixed', HANDS], ['cutscene', '3.4_storage'], ['minigame', 'final_yes', {}],
['cutscene', '3.4_ring']`. The fixed camera behind the overlay is barely visible (the vignette darkens it to 72% at the
edges, and the montage covers it in black once the hold starts).

### 2.2 Constants and state (`17:8-17`)

| Name | Value | Meaning |
| --- | --- | --- |
| `SW`, `SH` | 480, 204 | Still size (2.35:1, the letterbox frame) |
| `HOLD` | 3 | Seconds of holding to fill |
| `ORDER` | `['torch','floor','pedal','crash','wall']` | Montage order: 2.13, 2.9, 2.6, 2.3, 1.4 (newest first) |
| `BURN_X` | `[0.7, 0.35, 0.55, 0.45, 0.6]` | Where each still starts to burn, as a fraction of the band width |
| `shots` | `{}` | Snapped stills by name (canvases) |
| `fallback` | `{}` | Painted silhouettes by name, made on demand |
| `p` | 0..1 | Hold progress |
| `whiteT` | s | Time spent fully white |
| `hum`, `humV` | handle, last volume | The `hum` loop that swells with the hold |
| `R`, `bx`, `by` | px | Button radius and centre |
| `bandX/Y/W/H`, `bs` | px, scale | The montage window and the cover-scale of a still into it |
| `handsCv`, `vig`, `cap`, `capDown`, `burnG`, `yesFont`, `hintW` | | Cached per screen size by `layout()` |

`smooth(a, b, x)` (`17:16`) is smoothstep between `a` and `b`. `still(n)` (`17:17`, private) returns the snapped canvas,
else a fallback, painting it on first use.

### 2.3 The memory recorder: `snap(name)` and `still(name)`

```js
MINIGAMES.final_yes.snap(name)   // → undefined. Keeps a 480×204 still of the current frame, in memory only (17:167-179)
MINIGAMES.final_yes.still(name)  // → HTMLCanvasElement | null. The snapped still, never a fallback (17:166)
```

`snap(name)`:

1. Returns at once if `world` or `world.render` is missing, or **`flow.skipping` is true** (a skipped cutscene never
   snaps; `&fast=1` therefore never snaps anything).
2. `world.render(1)`: renders the current tick's state right now (interpolation alpha 1), so the snap shows the frame
   the step runs on, even mid-frame.
3. Crops the **centre 2.35:1** of the WebGL drawing buffer (`renderer.domElement`, device pixels): full width and
   `width / 2.35` tall, or full height when the screen is wider than 2.35:1.
4. `drawImage`s that crop into `shots[name]` (one canvas per name, created once and reused; re-snapping overwrites) at
   480×204 with `imageSmoothingQuality = 'high'`.
5. Any exception deletes `shots[name]` (so `still(name)` returns `null`, not a half-drawn canvas).

It works without `preserveDrawingBuffer` only because the render and the copy happen in the same task. Never split them
across frames.

Every content call is a `do` step guarded against a missing module:

```js
const snap = (name) => ({ do: () => { if (MINIGAMES.final_yes && MINIGAMES.final_yes.snap) MINIGAMES.final_yes.snap(name); } });   // 28:7
{ do: () => MINIGAMES.final_yes?.snap?.('wall') },   // 25:211, after the WALL_PUSH shot and 3.2 s of waits
```

| Name | Taken at | Read by |
| --- | --- | --- |
| `wall` | 25:211 (1.4, the display wall push-in) | `final_yes` montage |
| `crash` | 27:620 (2.3, crash zoom in the theatre) | `final_yes` |
| `pedal` | 28:624 (2.6, inside a time-lapse beat `{ t: 1.4, steps: [snap('pedal')] }`) | `final_yes` |
| `floor` | 29:432 (2.9, Lights Out floor shot) | `final_yes` |
| `torch` | 31:632 (2.13, the beam resting on Rue) | `final_yes` |
| `glance_lodge`, `glance_theatre`, `glance_step` | 27:17 (`glanceSnap`), 28:360, re-staged in 30:524-554 | `CARDS.memory` flashback inserts in 2.10 (30:37-48) |

**Stills live in memory only.** A reload, Continue or Chapter Select loses them, and a skipped cutscene never takes
them. Rue handles that two ways:

- `final_yes` falls back to painted silhouettes (`paintFallback`, below).
- 2.10 re-stages each missing moment under black at the top of the scene and snaps it then (30:520-554), with a
  `{ if: () => MEM.some((n) => !still(n)), then: RESTAGE }` step. If even that failed, the flashback step plays a
  `CLOSE` with a glance instead of the card (30:599-602).

Cost: one extra full `world.render` plus a GPU→CPU readback of the canvas (the 2-D `drawImage` of a WebGL canvas forces a
sync). Fine inside a cutscene `do`; never call it from per-frame code.

### 2.4 Fallback stills: `paintFallback(n)` (`17:20-103`)

Paints a 480×204 canvas per name with local helpers `lin` (vertical gradient), `rad` (radial gradient), `poly` (filled
polygon from a flat array), `blob` (filled ellipse). No text. Each is a silhouette of the moment:

| Name | Lines | Picture |
| --- | --- | --- |
| `torch` | 27-41 | Night fog, two Campanile arches, steps, a torch beam across them finding Rue hunched in his blazer and scarf |
| `floor` | 42-54 | Rue's room at night: two lads asleep on the floor under coats, heads to camera, window glow |
| `pedal` | 55-70 | The basement lab, a high window cycling day colours, green screens, Luka on the bike rig |
| `crash` | 71-86 | The theatre's tiers of heads, one gap, Luka ducking behind a textbook, speed lines, vignette |
| any other (`wall`) | 87-101 | The display wall: four tethered phones (one ripped off), the yellow sign, a red beacon wash |

`start` paints every missing fallback for `ORDER` up front (`17:183`: "not mid-hold"), so the draw loop never builds a
canvas.

### 2.5 The hand painter: `capsule()` and `hand()` (`17:106-132`)

```js
capsule(c, x, y, ang, len, w, skin, dark, nail)   // one finger: a rounded bar from (x,y) up -y, with a shaded half and an optional nail
hand(c, x, y, ang, s, mir, skin, dark, nail, sleeve, cuff, hairy, broad)
```

| `hand` arg | Meaning |
| --- | --- |
| `x, y` | Wrist position in px. Fingers point to −y (up) before rotation |
| `ang` | Rotation in radians |
| `s` | Pixels per unit (Rue uses `R × 0.19`) |
| `mir` | `true` mirrors it into a left hand |
| `skin`, `dark`, `nail` | Fill, shade-side and nail colours |
| `sleeve`, `cuff` | Sleeve and cuff colours (the sleeve covers the forearm from 6.2 units down) |
| `hairy` | Draws 26 deterministic forearm hairs (`i*37 % 45`, `i*53 % 70`) |
| `broad` | x scale (1.1 for Luka, 0.92 for Chase) |

It draws a blurred contact shadow (`c.filter = 'blur(…)'`, ignored by browsers without canvas filters), the forearm and
its shade strip, hairs, the sleeve and cuff, the thumb, the palm, four fingers with nails, and knuckle creases. Rue's two
calls (`17:158-159`):

| Hand | Position | Angle | Skin / dark / nail | Sleeve / cuff | Hairy | Broad |
| --- | --- | --- | --- | --- | --- | --- |
| Luka's right | `(bx − 1.2R, by + 1.9R)` | 0.38 | `#d6a27c` / `#b47f5c` / `#e9c3a8` | `#15161a` / `#2a2b31` (black polo) | yes | 1.1 |
| Chase's left (mirrored) | `(bx + 1.2R, by + 1.9R)` | −0.38 | `#ecc4a2` / `#cc9f7c` / `#f6dccb` | `#1f6fe0` / `#4b8df0` (store blue) | no | 0.92 |

Both are painted **once per screen size** into `handsCv` (device-pixel resolution) and blitted each frame.

### 2.6 `layout()` (`17:134-160`)

Runs from `draw` whenever `innerWidth`/`innerHeight` differ from the cached `W`/`H` (and on the first draw, since `start`
sets `W = 0`).

| Value | Formula |
| --- | --- |
| `touch` | `api.input.scheme === 'touch'` (read only here) |
| `R` | `min(W × 0.17, H × 0.13)` |
| `bx`, `by` | `W/2`, `H × (touch ? 0.56 : 0.5)` |
| band aspect | 2.35, or 1.7 in portrait (`W < H`) |
| `bandW`, `bandH` | Full width at that aspect, fitted to `H` if taller |
| `bs` | `max(bandW/SW, bandH/SH)`: cover-scale |
| `bandY` | Centred at `H × (portrait ? 0.24 : 0.42)`, clamped on screen |
| gradients | `vig` (radial from the button out, to 72% black), `cap`/`capDown` (button face up/pressed), `burnG` (unit-radius radial white → amber → transparent; scaled by `setTransform` at draw time) |
| `yesFont` | `bold round(R × 0.4)px` Trebuchet stack |
| `hintW` | measured width of "Hold for three seconds" + 70 |

`burnG` is built with radius 1 and drawn as `fillRect(-1, -1, 2, 2)` under a `setTransform(d·r, 0, 0, d·r, d·cx, d·cy)`, so
a single cached gradient serves every radius and centre without allocation (`17:150-152, 213-214`).

### 2.7 Lifecycle

| Member | Lines | Behaviour |
| --- | --- | --- |
| `start(params, a)` | 180-186 | Resets `p`, `whiteT`, `auto`, `humV`, `W`; `reduce = !!options.reduceFlashing`; paints missing fallbacks; `hum = a.AUDIO.loop('hum', { vol: 0 })` (try/catch); `ov.show(true)`. No params read |
| `update(dt)` | 187-194 | See §2.8 |
| `draw()` | 195-243 | See §2.9 |
| `end()` | 244-250 | `done = true`; `hum.stop(0.6)`; **if `p >= 1`**: `ui.fade(1, 0, '#fff'); ui.fade(0, 1.6)` (snap `#fade` to white, then ease off: the second call omits the colour and so keeps white, 05-ui.md §3.2); `p = 0`; clear the overlay |
| `autoplay()` | 251 | `auto = true` |
| `finish()` (private) | 162 | Idempotent `api.finish({ done: true })` |
| `still(name)`, `snap(name)` | 166-179 | §2.3 (callable any time, game running or not) |

### 2.8 The hold curve (`17:187-194`)

```js
if (p >= 1) { if ((whiteT += dt) >= 0.35) finish(); return; }   // full: no way back
const held = auto || api.input.held('yes');
p = held ? Math.min(1, p + dt * (auto ? 4 : 1) / HOLD) : Math.max(0, p - dt * 0.9);
const v = p * 0.7;
if (hum && Math.abs(v - humV) > 0.02) { humV = v; hum.vol(v); if (hum.rate) hum.rate(0.75 + p * 0.9); }
```

| Property | Value |
| --- | --- |
| Fill time | 3 s held (0.75 s under autoplay) |
| Rewind | 0.9 progress per second (a full rewind takes 1.1 s); smooth, not a reset |
| Completion | Irreversible at `p = 1`; finishes 0.35 s later |
| Input | `held('yes')`: Enter/Space, pad A, the touch YES button, **or a left mouse button / finger held anywhere** not on a button (01-core.md §7.4). `input.consume` does not clear `held`, so nothing can steal the hold |
| Audio | `hum` volume 0 → 0.7 and rate 0.75 → 1.65 with `p`, only re-targeted on a change of more than 0.02 |

### 2.9 Draw layers (`17:195-243`), back to front

| # | Layer | Driven by |
| --- | --- | --- |
| 1 | Vignette (radial, transparent at the button → 72% black) | always |
| 2 | Black fill, alpha `min(1, p × 14)` | `p > 0` (black within 0.21 s of holding) |
| 3 | The still for this fifth: `f = min(4.999, p×5)`, `i = f|0`, `k = f − i`. Clipped to the band. Flicker-in for `k < 0.16` (alpha alternates 1 / 0.25 on `(k×45|0) % 2`; Reduce Flashing: a linear fade-in instead). Push-in: scale `bs × (1 + 0.08k)` | `p > 0` |
| 4 | Burn, `b = smooth(0.5, 1, k)` (× 0.35 under Reduce Flashing): an additive (`lighter`) redraw of the still at `0.8b` (not under Reduce Flashing), the burn gradient of radius `1.3·bandW·b` at `BURN_X[i]`, then white over the band at `b³` | `b > 0` |
| 5 | The machine's YES: bezel, four screws, rim, cap (pressed: `capDown`, shifted down `R × 0.05`), "YES" in navy on the upper cap, the hands bitmap shifted with it. Whole group at alpha `1 − 0.7·smooth(0, 0.06, p)`: a ghost over the memories once the hold starts | always |
| 6 | Progress ring: a 16% white track and a yellow arc from 12 o'clock, radius `1.34R`, width `0.07R`, round caps | `p > 0` for the arc |
| 7 | House prompt pill above the ring: navy pill, yellow `YES` chip, "Hold for three seconds"; alpha `1 − smooth(0, 0.04, p)` | until the hold starts |
| 8 | Full-screen white at `smooth(0.82, 1, p)` (Reduce Flashing: `smooth(0.6, 1, p)`, a slower bloom) | `wAll > 0` |

`draw` returns early when `done && p < 1`. Everything it uses is cached in `layout()`; per frame it allocates nothing
(the `setTransform` trick above, no gradient creation, fixed font strings).

### 2.10 Gotchas

- **Snaps are a memory, not a save.** Plan for missing stills (fallbacks, re-staging) in every consumer.
- **`snap` is skip-aware**: under `flow.skipping` it does nothing. A cutscene that is skipped never records its moment,
  and `&fast=1` test runs only ever see fallbacks.
- The crop is the centre 2.35:1 of the **whole** canvas. Under `world.split` the crop spans both halves.
- `snap` must run after the shot step that frames the moment and after any move has settled; Rue puts a `wait` before it
  (25:209-211: 3.2 s of waits; 30:529: `{ wait: 0.1 }, glance, { wait: 0.45 }`).
- `layout()` reads `input.scheme` only on resize, so switching to touch mid-hold does not move the button.
- `ui.fade(1, 0, '#fff')` happens in `end()`, so it also runs when the game is aborted after completion. With `p < 1` (an
  abort mid-hold) nothing is faded.
- The montage assumes exactly five stills: the index is `p × 5`.
- `c.roundRect` and `c.filter` need a modern browser (`filter` is a no-op where unsupported: the hand shadow just loses
  its blur).

---

## 3. `credits` (scene C) — `18:1-112`

### 3.1 What it is

All DOM, no 3-D. Left half: the Polaroid (warmed), then Luka's notebook of Names (only if `state.names` is non-empty).
Right half: the credits roll, scrolling once through a masked column. Then a parody disclaimer card, centred, until the
song ends. Music: Pudding's song from `state.pattern` and `state.samples`. NO (after 3 s) asks "Skip credits?". Ends
faded to black; PC's `flow.start` fades in from that black.

Scene (35:425-430):

```js
SCENES.C = {
  get title() { return flow.sceneId === 'C' ? '' : 'Credits'; },   // no time card while playing; a label in Chapter Select
  playable: [], swap: false, hud: null, music: null,
  steps: [['minigame', 'credits', {}]],
  grants: {},
};
```

C has no `set`, so the previous set stays loaded and keeps rendering behind the opaque `.crd` background.

### 3.2 Data (`18:8-31`)

| Name | Content |
| --- | --- |
| `PARODY` | The disclaimer paragraph |
| `CAST` | `[[heading, [[name, role?], …]], …]`: STARRING (3), WITH (8), DUBLIN, 1987 (5, no roles) |
| `CSS` | Injected once as `<style id="crd-css">` in `<head>` (never removed) |
| `LANE(on)` / `DEF()` | A 16-step boolean lane / the default 4-lane pattern used when `state.pattern` is missing |
| `D` | 100000: the Web Animations timeline length in ms. Game time `t / T` maps onto it |

CSS highlights: `.crd` fills `#mg` with a radial dark-brown background, `font-family: var(--game)`; `.crd-pic` is the
left 50%; `.crd-txt` the right 50% with a top/bottom fade mask; `#ui.touchui .crd-txt { bottom: 170px }` keeps the roll
clear of the touch buttons; `@media (max-aspect-ratio: 1/1)` stacks the picture above the text.

### 3.3 Helpers (`18:34-36`)

```js
el(tag, cls, parent, text)        // createElement + className + textContent + append, → element
anim(e, frames)                   // e.animate(frames, { duration: D, fill: 'both' }), paused, pushed to anims[]
fades(e, pts, move)               // anim() from [[offset, opacity], …]; move(k) → a transform string per keyframe,
                                  // where k = keyframe index / (count − 1), NOT the time offset
```

### 3.4 `build(root, names)` (`18:38-65`)

Creates the DOM under `api.ui`, paints the cards, and creates one paused animation per moving element:

| Element | Keyframes (fraction of the roll) | Transform |
| --- | --- | --- |
| Polaroid (`ui.paintCard(cv, 'polaroid', { front: true })`, then a `source-atop` warm wash `rgba(255,168,84,.17)`) | in 0 → 0.04, out `pEnd − 0.04` → `pEnd`; `pEnd = 0.48` with a notebook, else 0.83 | `scale(0.96 + 0.07k) rotate(−1.5 + 2k deg)` |
| Notebook (`ui.paintCard(cv, 'list', { title: 'Names', paper: 'notebook', items: names })`) | in 0.46 → 0.51, out 0.79 → 0.83 | `translateY(10 − 20k px) rotate(1 − 2k deg)` |
| Roll window `.crd-w` | `translateY(100%)` until 0.03, `0` at 0.82 | |
| Roll `.crd-roll` | `translateY(0)` until 0.03, `−100%` at 0.82 | Together: the roll enters from below and leaves at the top |
| Parody `.crd-par` | opacity 0 until 0.85, 1 at 0.89 | |

The roll's content: `RUE`, MUSIC ("Opt Us In (Dublin '87)" by Pudding), the `CAST` sections, "Made with Three.js, Canvas
2D and Web Audio".

### 3.5 Timing (`18:76-99`)

| Variable | Value |
| --- | --- |
| `T` (roll length) | No song: 90 s. With a song: `song.dur` if > 0, else `20 × 240 / 92` (52.2 s) + 3 if `trill` collected + 5 if `bell` collected + 1. **`AUDIO.song` never returns `dur`** (02-audio.md §3.10), so it is always the estimate: 53.2–61.2 s |
| `endAt` | No song: `T`. With a song: `T + 25` (a cap for a song that never reports) |
| `onEnd` | `endAt = max(t + 1.5, T × 0.89 + 5)`: the parody card holds until 1.5 s after the song ends, and at least 5 s |

`start(params, a)` (`18:76-90`): resets, `build(a.ui, state.names.slice())`, `music(null, { fade: 0.8 })`, then
`a.AUDIO.song(st.pattern ‖ DEF(), { samples, credits: true, onEnd })` (the `credits` flag is ignored by AUDIO; the absence
of `bars` selects credits mode).

`update(dt)` (`18:91-99`): `t += dt`; `t >= endAt` → `close({ done: true })`. After 3 s, `pressed('no')` → consume,
`asking = true`, `api.ask('Skip credits?', { test: false })` → YES closes with `{ done: true, skipped: true }`.

`draw()` (`18:100-103`): `currentTime = min(1, t / T) × D` on every animation. That is the whole renderer: transforms and
opacity only, so the browser composites without layout, and pausing the game (no `update`) freezes the roll exactly.

`close(r)` (`18:67-73`): once only; on a skip stops the song; fades to black over 1 s (`ui.fade(1, 1).then(fin)`), or
finishes at once under autoplay.

`end()` (`18:104-109`): stops the song, cancels every animation. The screen is left black.

`autoplay()` (`18:110`): `auto = true; T = 0.8; endAt = 0.9`: the whole roll in 0.8 s, finish at 0.9 s, no fade.

### 3.6 Gotchas

- **No audio context → the parody card holds 25 s.** `AUDIO.song` returns `{ stop() {} }` before `AUDIO.init()`, which
  is truthy, so `endAt = T + 25` and `onEnd` never fires.
- `close()` does not dismiss a pending "Skip credits?" `ask`. If the timeline ends while it is up, the ask stays in the
  dialogue state until the next `say`/`ask` finishes it (`10:322, 334`: `if (D.res) finish()`); answering it then does
  nothing. Call `say.reset()` in `close()` in a port.
- The update keeps running during the ask (it is not `api.play`), so the roll continues behind the question.
- The Names notebook and the warmed Polaroid depend on Rue's `CARDS.polaroid` (a fixed Front Gate photograph,
  10:1373-1408) and `CARDS.list`.
- A click on the credits is a YES press (the `.crd` div is not `[data-noyes]`); nothing listens for it.

---

## 4. `blend_in` (2.3) — `19:1-137`

### 4.1 What it is

Luka (with Chase following) must get from the top door of the lecture theatre to two seats eight rows down while
Professor Hartigan takes roll. Hartigan reads a name (safe to move), then looks up to hear "Here" (moving raises
suspicion), with a quick double take after every third name. Holding NO ducks (can't move, can't be seen). Ronan's
textbook on a desk by the aisle can be taken (YES) and held up, which halves the suspicion gain. Full suspicion: "Can I
help you, gentlemen?", a titter, a fade, back to the door; after two failures Hartigan reads 1.5× slower. Win: reach the
seats. The camera is the set's own zone camera `lectern_view` (`07:814`: `type 'pan'`, `look: 'player'`), not the game's.

Call site (27:526): `['objective', 'Blend in.'], ['minigame', 'blend_in', {}], ['cutscene', '2.3_roll']`. Result
`{ ok: true, fails }`. Taking the book sets `state.flags.took_textbook`.

### 4.2 Hartigan's state machine (`19:22-23, 76-81`)

| Mode | Entered by | Duration | Hartigan anim | Moving costs |
| --- | --- | --- | --- | --- |
| `read` | `read()`: `names++`, `t = rnd(2.5, 4) × slow`; if `names % 3 === 0`, a double take is scheduled at `dbl = t × rnd(0.35, 0.6)` (time remaining) | `t` | `look_down` | nothing |
| `dbl` | `t <= dbl` during `read` | 0.45 s (`d2`); `sfx('tick', {vol: 0.5})` | `idle` | yes |
| `look` | `lookUp()` when `t <= 0` in `read` | `rnd(1.5, 2.5)`; `AUDIO.blip('student')` (the "Here") | `idle` | yes |

`t` keeps counting down during `dbl`, so a double take eats into the read.

### 4.3 Suspicion and ducking (`19:83-93`)

```js
const dn = I.held('no');
if (dn !== duck) { duck = dn; player.enabled = !duck; L.play(duck ? 'duck' : book ? 'reading' : 'idle'); if (C) C.play(duck ? 'duck' : 'idle'); }
const moved = Math.abs(L.pos.x - lx) + Math.abs(L.pos.z - lz) > 0.004;   // per tick, L1: ≈ 0.24 m/s at 60 Hz
if (mode !== 'read' && moved && !duck) sus += (book ? 20 : 40) * dt; else sus -= 15 * dt;
```

| Rule | Value |
| --- | --- |
| Gain while moving in view | 40 %/s, 20 %/s with the book |
| Decay otherwise | 15 %/s |
| Ducking | `player.enabled = false`: no movement, no gain. Because the follower only moves while the player is enabled (04-world.md §7.4), Chase stops and ducks too |
| Fail | `sus >= 100` → `fail()` |

### 4.4 Beats

| Function | Lines | Does |
| --- | --- | --- |
| `hints()` | 21 | Builds the hint line for the current scheme: "Move while he reads · Hold B / NO / NO (Esc) to duck when he looks up" |
| `toDoor()` | 24-29 | `L.place('top_entry')`, Chase to `[0.55, 5.7, 15.05, π]`, `sus = 0`, `duck = false`, anims, `read()` |
| `take()` | 30-37 | `busy`; player off; hide prop `textbook`; `book = true`; `state.flags.took_textbook = true`; `L.walkAnim = 'book_walk'`; `L.play('reading')`; `api.play([{ say: 'luka', … }])`; `player.enabled = !duck` |
| `fail()` | 38-53 | `busy`; `fails++` (≥ 2 → `slow = 1.5`); player off; every head in the `crowd` prop turns to Luka's head (`crowd.userData.look(HEAD)`, `07:198`); `api.play` the lines, `{ sfx: 'titter' }`, `{ wait: 1.1 }`, `{ fade: 'out', dur: 0.4 }`; `toDoor()`; heads back (`look(null)`); fade in; `busy = false` |
| `win()` | 54-57 | `done`; player off; `follower(null)`; `api.finish({ ok: true, fails })` |

The textbook: within 1.0 m of the `textbook` anchor (and not yet taken) the prompt is `'YES — Take'`; `pressed('yes')`
→ consume → `take()`. The seats: win when `|x − sx| < 0.65` and `|z − sz| < 0.4`, with `sx = seat_luka.x + 0.3`,
`sz = seat_luka.z − 0.14`.

`ANIMS.book_walk` (`19:13-14`) is registered when the file evaluates: `walk` legs plus `reading` arms, `.shows =
'textbook'`. It is **not** in the world's `LOCO` list, so neither `moveTo` nor the player returns it to idle. Rue does
that by hand (`19:88`: back to `reading` when the stick is under 0.15) and restores `walkAnim = 'walk'` in `end()`.

### 4.5 Rendering (`19:101-123`)

An overlay HUD panel, top centre (`py = 58`, width `min(460, w − 24)`): navy rounded box with a yellow top rule,
"BLEND IN" left, "HARTIGAN IS READING" (green) / "HARTIGAN IS LOOKING" (red) right, a suspicion bar (grey under 35%,
amber to 70%, red above), "SUSPICION n%" under it, "DUCKING" / "BEHIND A TEXTBOOK" right, and the hint below the panel.
The percentage string is rebuilt only when the integer changes (`susN`), and the hint only on resize or a scheme change.

### 4.6 Lifecycle, autoplay

| Member | Lines | Notes |
| --- | --- | --- |
| `start` | 60-71 | Looks up `luka`, `chase`, `hartigan` actors and the `crowd` prop; reads `seat_luka` mark and `textbook` anchor (with numeric fallbacks); `player.control('luka')`, `player.follower('chase')`, enabled; `read()`; overlay shown |
| `update` | 72-100 | Returns while `busy`; order: Hartigan → duck → book anim fix → suspicion → textbook → seats |
| `end` | 124-130 | Restores `walkAnim`; player off, follower off, prompt off; clears and hides the overlay |
| `autoplay(a)` | 131-135 | Sets `took_textbook`, hides the prop, `a.finish({ ok: true, auto: true })` immediately. **The game logic is never exercised under autoplay** |

---

## 5. `keep_up` (2.4) — `20:19-129`

### 5.1 What it is

Rue strides out of the Arts Building and round the west of Front Square at 1.1× walking speed, never waiting. The
first line plays under a TRACK shot walking backwards ahead of Rue while the boys scramble in at his shoulders. Then the
player controls Chase on a follow camera; the remaining lines are a walk-and-talk that pauses while Chase is more than
4 m behind ("Rue! Wait—"). Puddles slow Chase, umbrellas cross his path, a cyclist rings and knocks him aside. Luka
keeps to Rue's other shoulder by script. Can't fail.

Call site (28:142): `['minigame', 'keep_up', { lines: KEEP }]` with `KEEP = [['chase', 'Rue! Mr Rue! Rue.'], …]`
(28:123-132).

### 5.2 Data (`20:20-27`)

| Name | Value |
| --- | --- |
| `P` | 10 waypoints `[x, 0, z]` from `(0, −14.1)` to `(−11.4, 0.85)` |
| `CUM` | Cumulative path length per waypoint |
| `CROSS` | `[[segment, side, look], …]`: three umbrella walkers, built at start, triggered by progress |
| `TRACK` | `{ shot: 'MID', on: 'rue19', move: 'track', track: 'ahead', dist: 2.6, dur: 6 }` (a track ignores `dur`, 04-world.md §9.5) |
| `FOLLOW` | `{ dist: 4.6, height: 2.3, lag: 0.45, fov: 55 }` for `cam.override('follow')` |
| `RANGE` | 4 m: the talking distance |
| `A`, `B` | Preallocated `[x, y, z]` targets for Chase and Luka |

### 5.3 Helpers

| Helper | Lines | Signature → result |
| --- | --- | --- |
| `walkSpeed()` | 29 | `CONFIG.walk × 1.1` |
| `gap()` | 30 | Chase ↔ Rue distance (xz) |
| `along()` | 31 | Rue's metres along `P`: `CUM[K] − dist(Rue, P[K])` (cheap; valid because Rue walks the path exactly) |
| `shoulder(s, back, out)` | 32-36 | Writes into `out` the point `back` m behind Rue and 0.75 m to his left (`s = 1`) or right (`s = −1`), from `rotY`. Returns `out` |
| `toward(a, p)` | 37 | `a.moveTo(p, dist > 1.2 ? { run: true } : { speed: walkSpeed() })` |
| `stride(t)` | 39-42 | `await rue.moveTo(P[K], { speed: walkSpeed() })` for each waypoint; sets `arrived` |
| `crossing(i)` | 71-79 | Places walker `ku_i` 3 m to one side of the segment midpoint, plays `umbrella`, walks it 6.4 m across at 1.25 m/s |

### 5.4 `run(t)` (`20:43-70`)

1. `ui.letterbox(true)`, `api.cam.shot(TRACK)`, `stride(t)` (not awaited).
2. A steering loop (detached `async` IIFE) every 0.25 s: Chase to `shoulder(1, 0.9)` while `steer`, Luka always to
   `shoulder(−1, 0.9)`.
3. `wait(0.8)`, `api.say(L[0][0], L[0][1], { auto: 0.6 })`, `wait(1.2)`. Then `steer = false`, `intro = false`.
4. Letterbox off, `cam.override('follow', FOLLOW)`, `cam.release(0.8)`, `chase.place(chase.pos)` (stops his scripted move
   so `playerTick` takes over, 04-world.md §7.2), `player.control('chase')`, no follower, enabled.
5. For each remaining line: while `gap() > RANGE`, say "Rue! Wait—" (`auto: 0.5`) at most every 3.2 s; then
   `api.say(id, text, { auto: 1.3 })`.
6. `waitUntil(arrived)` → `api.finish({ done: true })`.

### 5.5 `update(dt)` (`20:96-116`): hazards, all allocation-free

| Hazard | Rule |
| --- | --- |
| Puddles (`SETS.square.puddles`, `[x, z, rx, rz]` ellipses) | Inside `((x−qx)/rx)² + ((z−qz)/rz)² < 1` → `player.speedMul = 0.55` (after the intro); `footstep_wet` every 0.33 s while moving |
| Cyclist (`cyclist` prop, moved by the square set's `update` at 3.6 m/s while visible, 06:973) | Within 5 m: `bike_bell` (6 s cooldown). Within 0.95 m after the intro: `thud`, `player.frozen(0.7)`, Chase pushed 0.4 m away by writing `chase.pos` (2 s cooldown) |
| Umbrellas | When `along()` passes a crossing segment's midpoint − 1.2 m, `crossing(i)` |

### 5.6 `start`, `end`, `autoplay`

- `start` (`20:82-95`): `tok++`; `rue19` actor (spawned if missing) placed at `P[0]`; spawns `ku_0..2` with looks
  `student_c/f/a` at `(0, 0, −40)`, hidden ("built now, not mid-walk"); shows the cyclist; `player.enabled = false`;
  `run(t)`.
- `end` (`20:117-123`): `tok++`; hides the cyclist; despawns `ku_*`; `speedMul = 1`; follower off; player off;
  `cam.override(null)`; letterbox off.
- `autoplay` (`20:124-127`): every 0.3 s after the intro, `chase.moveTo(shoulder(1, 1.4), { speed: walk × 1.5 })`.

---

## 6. `rue_walk` (2.4, 2.12, 3.1) — `20:131-419`

### 6.1 What it is

The player walks Rue (`rue19`) across Front Square. One module, three variants:

| `walk` | Scene | Route | Who stops him | Prompt | Camera | Special |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 2.4 | `(−9, 0.9)` round the north of the Campanile to the Buttery door | Siobhán, Fiachra, Des (route fractions 0.1, 0.3, 0.78) | `NO` | High and far behind (`FAR`) | Steering at the Campanile makes him veer round it ("Absolutely not.") as the camera rises; the fake call at half way |
| 2 | 2.12 | Buttery door straight under the Campanile to `(0.35, 2.6)` | nobody: 8 translucent smears of colour | `NO`, greyed, does nothing | Starts close behind, falls back and rises with progress | Input only walks him forward at a fixed 1.15 m/s; `music('held_note')` |
| 3 | 3.1 | Arts Building, then straight under the Campanile to the Buttery | the same three, all before the Campanile (0.04, 0.13, 0.23) | `YES` | Each YES brings it lower and closer, ending at eye level beside him | He walks with `walk`, not `swagger` |

Every variant ends with Rue standing at the route end and the camera override cleared. Result `{ done: true }`.

### 6.2 Data (`20:132-152`)

| Name | Value |
| --- | --- |
| `ROUTE[1..3]` | Polylines of `[x, z]` |
| `AUTO1` | Autoplay route for walk 1; its first point `(−5.2, 0.6)` is inside the veer radius, so the veer runs once |
| `PEOPLE` | `[{ id, ask, no, yes }]` for `siobhan`, `fiachra`, `des` |
| `AT` | Route fractions at which each person comes up, per walk |
| `CALL` | 0.5: the fake call's route fraction (walk 1) |
| `DOOR` | `[7.27, 14.3]`, reached within 1.7 m |
| `RC`, `RA` | 7.2 (veer trigger radius from the origin), 7.7 (veer arc radius) |
| `EXIT` | `atan2(7.27, 13.7)`: the angle round the tower the veer walks to |
| `FAR`, `EYE`, `VEER` | Camera rigs `{ d: back, h: up, s: side, a: look-ahead, y: look height }`: `{12, 7.5, 0, 3, 0.4}`, `{1.9, 1.6, 1.05, 4, 1.4}`, `{12, 17, 0, 0, 0}` |
| `view` | `{ pos: [], look: [], fov: 50 }`: the object handed to `cam.override('fixed', view)` and mutated in place |
| `cp`, `tg` | Current and target rig |
| `pt`, `M`, `EV`, `CALLSHOT` | Preallocated scratch |

### 6.3 Route helpers (reusable as-is)

| Helper | Lines | Signature → result |
| --- | --- | --- |
| `lerpCam(o, a, b, k)` | 155 | Lerps the five rig keys into `o` |
| `progress(x, z)` | 156-165 | Projection of `(x, z)` onto the route → 0..1 (nearest segment, clamped `u`) |
| `at(s, out)` | 166-171 | The point `s` metres along the route → `out[0] = x`, `out[2] = z`, **`out[1]` = heading** (`atan2(dx, dz)`) |
| `spot(side, ahead, out)` | 172-179 | A point beside/ahead of Rue on open cobbles: clamped to the square, pushed out of the Campanile box (4.8) |
| `gapTo(a)` | 180 | Actor ↔ Rue xz distance |
| `key(k)` | 181 | `TEST.auto ? wait(0.4) : waitUntil(pressed(k) → consume → true)` |
| `stop()` | 182 | `player.enabled = false; rue.place(rue.pos)` |
| `inBox(x, z, r)` | 183 | `|x| < r && |z| < r` |
| `hitsTower(ax, az, bx, bz)` | 184-187 | 9 samples along a→b against the Campanile box (4.4): does the lens line cross the tower? |
| `clearAt(x, z, m)` | 227-228 | Outside the tower box (4.2), inside the square, and no visible person within `m` |

### 6.4 Beats

| Function | Lines | Does |
| --- | --- | --- |
| `standBy(i)` | 188-198 | Puts person `i` 6 m to the side of their stretch of route (away from the tower), facing it. Walk 1's Fiachra starts at the gate and wanders over |
| `meet(i, t)` | 200-226 | Re-issues `a.moveTo('rue19', { run: true })` every 0.25 s until within 1.8 m (max 8 s; `coming` flag); then `busy`, `stop()`, a short `moveTo` raced against `wait(1.5)`, `rue.face`, the ask line (walk 3 skips Des's), `ui.prompt('YES'|'NO')`, `key(...)`, Rue's anim (`nod`/`give` in walk 3, else `shake`), his answer, walk 3's Fiachra whistle (`sfx('whistle')`, `play('whistle', { dur: 3 })`), walk 3: `yes++; lerpCam(tg, FAR, EYE, yes / 3)`, the person walks off to `spot(…)`, control back |
| `fakeCall(t)` | 229-250 | Walk 1 at half way: `busy`, `stop()`, wait up to 3 s for a clear spot; turn 180° if his left side is blocked; letterbox; `fake_call` anim; `CALLSHOT` placed 1.5 m to his **left** at eye height (profile: the phone in his right hand stays hidden behind his head); `key_beep`; the line; release 0.7 s |
| `veer(t)` | 251-262 | `tg` → `VEER` (camera rises to 17 m); "Absolutely not." (`auto: 1.2`, not awaited); walks Rue round an arc of radius 7.7 from his angle to `EXIT` in ≤ 0.3 rad steps; `tg` → `FAR`; control back |
| `run(t)` | 316-328 | Walks 1 and 3: an event loop over `waitUntil`: fake call first when due (and before a person due after it), else the next meet, else at the door: `stop()` + `api.finish({ done: true })` |
| `driver(t)` | 263-273 | Autoplay: walks each waypoint (walk 1: `AUTO1`), waiting while `busy`/`veering`/`coming`, retrying a waypoint up to 20 times when interrupted |

Veer trigger (`20:392-395`): walk 1, not busy, moving, `r = |pos| < RC`, and heading·(toward origin)/r > 0.5.

### 6.5 The camera rig: `camTick(dt)` (`20:291-314`)

A custom follow camera that lives entirely in content, fed to the world through `cam.override('fixed', view)` (the
world re-reads `opts.pos`/`opts.look` every tick and does no damping of its own, 04-world.md §8.2):

1. `cp` eases toward `tg` (`1 − e^(−dt·1.6)`, walk 2 `2.5`).
2. Default yaw: behind Rue's **smoothed heading** `hy` (which follows `rotY` at 1.1 rad/s only while he moves, 20:389), so
   stick wiggles don't swing the lens.
3. Veering: yaw = outward from the tower (rise over the outside of the curve, look at 0.55 of his position).
4. Under the Campanile (`inBox(x, z, 5)` and `h < 3`): tuck in (`side × 0.3`, `d ≤ 1.7`).
5. Otherwise high: search 9 yaws alternating ±0.35 rad steps for the first lens position whose line to Rue does not cross
   the tower (`hitsTower`).
6. `rot` eases toward the yaw (`min(1, 2dt)` per tick after the first frame). The lens is clamped inside the square
   (±17.5 × ±12.8 when `h > 9`, else ±19.2 × ±14.2).
7. `view.pos`/`view.look` ease (`1 − e^(−3dt)`; snapped on the first tick, `ready` flag).

Walk 2 drives `tg` from progress `u`: `d = 2.4 + 9u`, `h = 1.75 + 6.5u`, `a = 2 − 2u`, `y = 1.2 − 1.2u`.

### 6.6 Walk 2's smears (`20:275-289, 377-386`)

`smears()` builds an `InstancedMesh` of 8 boxes (0.45 × 1.6 × 3.2) with `mat(0xffffff, { transparent: true, opacity:
0.32, key: 'rue_smear' })` and a colour per instance (`setColorAt`), `frustumCulled = false`. Per tick each smear moves in
`SM.x/z/vx/vz` (`Float32Array`s), bounces off the square's edges, speeds through the tower box ×3, and writes its matrix
via one shared `Object3D` (`D`). Any smear within √12 m of Rue greys the prompt: `ui.prompt('NO')` plus
`promptEl.style.opacity = '0.35'`. NO presses are consumed and ignored.

It is **built mid-game** (in `start`) and its program (Lambert + instanced + instanceColor + transparent) compiled with
`renderer.compileAsync(s, W.camera, sc)` before being added to the scene (`20:354-356`); disposed in `end`.

### 6.7 `start`, `update`, `end`, `autoplay`

- `start` (`20:331-362`): builds `cum`/`len`; `tok++`; `rue19` (walk 1 keeps him where 2.4 left him if within 4 m of the
  start); `pos.y = SETS.square.floor(...)`; spawns any missing person (remembered in `mine` for despawn) and stands them
  by (not walk 2); initialises the rig (walk 2 close: `d 2.4, h 1.75`); `cam.override('fixed', view)`; releases any
  cutscene camera (walk 2: 0 s, else 1.2 s); hides `umbrella_crowd` (walks 1, 2; visibility remembered); walk 2:
  `player.control(null)`, `music('held_note', { fade: 2 })`, smears; walks 1/3: `player.control('rue19')`, no follower,
  enabled, `run(t)`.
- `update` (`20:363-399`): walk 2: `go = autoOn ‖ |input.move| > 0.25` → `s2 += 1.15 dt`, position from `at(s2)` written
  straight into `rue.pos`/`rotY` (+ `floor`), `walk` anim at speed 0.75 when starting / `idle` when stopping; rig from
  progress; smears; finish at `s2 >= len`. Walks 1/3: smoothed heading, `pmax = max(pmax, progress(x, z))`, the veer
  trigger. Always `camTick(dt)`.
- `end` (`20:400-412`): `tok++`; prompt, letterbox, prompt opacity, smears disposed, crowd restored,
  `rue.walkAnim = 'swagger'`, `rue.place(rue.pos)`, despawn `mine`, `cam.override(null)`, player off,
  `player.control(state.active)` if that actor exists.
- `autoplay` (`20:413-417`): walk 2 → `autoOn = true`; else `driver(t)`.

---

## 7. `role_play` (2.8, Rue's room) — `21:1-143`

### 7.1 What it is

One locked mid-shot, like a stage: Luka plays the customer on the left, Rue sells on the right, Chase heckles from
behind the lens. A scripted failure first, then three customers (each with a different hat on Luka), four steps each.
Before each of Rue's answers the player picks the card Luka whispers: GREET, ASK, LISTEN, RECOMMEND or CLOSE HARD. The
right card is always the next step in order; done steps are greyed. A wrong card plays its line, Luka walks out of frame
for 1.5 s and back in ("Again."). After two wrong cards on a step Chase whispers it. Can't fail.

Call site (29:301): after a roam that ends with the `practise_go` flag, `['cam', null], ['minigame', 'role_play', {}],
['objective', null], ['cutscene', '2.8_floor']`.

### 7.2 Data (`21:9-39`)

| Name | Value |
| --- | --- |
| `LABELS` | `['GREET', 'ASK', 'LISTEN', 'RECOMMEND', 'CLOSE HARD']` |
| `LUKA`, `RUE`, `OFF`, `CHASE` | Stage marks `[x, y, z, rotY]`; `OFF` is out of frame |
| `STAGE` | `{ shot: 'CAM', pos: [-13.95, 1.76, 3.1], look: [-16.3, 1.8, 3.1], fov: 36 }` |
| `cust(text)` | `['luka', text, { tag: 'as the customer' }]` |
| `C` | `[{ hat, open, steps: [step0..step3] }]`; a step is a list of `[id, text, opts?]` lines or the string `'point'` |
| `WRONG` | Card index → Rue's wrong line. Index 2 (LISTEN) has none: 1.6 s of silence |
| `WHISPER` | Chase's whisper per step |
| `AUTO` | `{ 'customer,step': [wrong picks…] }` for autoplay: `'0,0': [4, 1]`, `'0,1': [2]` |
| `ABORT` | The sentinel thrown on a stale token |

### 7.3 The hats (`21:42-70`)

| Function | Does |
| --- | --- |
| `makeHats()` | Built **once, lazily on the first start** (`if (!hats) hats = makeHats()`): `cap` (cylinder crown + brim), `helmet` (half sphere + visor), `scarf` (torus wrap + box tail), plain `THREE.Mesh` with `mat(color)`, all hidden |
| `dress(rig)` | Parents `cap` and `helmet` to `rig.parts.head` (scaled by `rig.d.hs`), the scarf to `rig.parts.torso` fitted by `rig.d.nr`, `T`, `chestZ` |
| `wear(name)` | Shows one hat (or none) |
| `undress()` | Hides and un-parents all three (from `end`) |
| `stand(a, at)` | `rig.seated = false; place(at); play('idle')` |

### 7.4 `run(t)` (`21:73-115`)

Local wrappers make every await abort-safe:

```js
const live = () => { if (t !== tok) throw ABORT; };
const S = async (id, text, o) => { live(); await api.say(id, text, o || {}); live(); };
const W = async (s) => { live(); await wait(s); live(); };
const walk = async (to) => { live(); await luka.moveTo(to); live(); };
const again = async () => { await walk(OFF); await W(1.5); await walk(LUKA); await S('luka', 'Again.'); };
```

The card loop (`21:96-111`):

```js
for (let wrong = 0; ; wrong++) {
  if (!told) { told = true; ui.toast('Pick the card Luka whispers to Rue.'); }
  const dis = []; for (let i = 0; i < s; i++) dis.push(i);   // steps already done are greyed (picking one clunks)
  const pick = await api.choose(LABELS, { disabled: dis, test: (AUTO[k + ',' + s] || [])[wrong] ?? s });
  if (pick === s) break;
  if (WRONG[pick]) await S('rue19', WRONG[pick]); else await W(1.6);
  await again();
  if (wrong >= 1) await S('chase', WHISPER[s], { tag: 'whisper' });
}
```

A hat change happens out of frame: `walk(OFF)`, `wear(c.hat)`, `W(0.5)`, `walk(LUKA)`. The `'point'` step: `rue.face('luka',
0.2); rue.play('point', { dur: 1.4 }); W(0.6)`.

### 7.5 Lifecycle, autoplay

- `start` (`21:118-137`): `tok++`; missing `luka`/`rue19` → finish at once; hats; `dress(luka.rig)`, `wear('cap')`;
  `luka.mood = null`; stand all three; `ui.letterbox(true)`; `a.cam.shot(STAGE)`; `run(t).then(finish, err)`: `ABORT` is
  swallowed, any other error is logged as `RUE: role_play` and the game finishes `{ done: true }` anyway.
- `update`/`draw`: empty. `end`: `tok++; undress()`. It leaves the letterbox on and the cutscene camera active: the next
  cutscene (`2.8_floor`) takes both over.
- `autoplay()`: empty. Under `TEST.auto`, `say` auto-advances after 0.15 s and `choose` picks its `test` index after
  0.3 s (10:361-372), so the script plays itself and walks every wrong path once: CLOSE HARD, then ASK (→ the whisper),
  then GREET on the first step; then LISTEN too early on the second step (ASK).

---

## 8. `torchlight` (2.13) — `22:1-119`

### 8.1 What it is

Front Square at night (env `night`, lamps off, heavy fog). The only light is the set's spot as a phone torch in the
player's right hand. A linear trail: wet footprints only visible in the beam (`footprints` prop, `06:828-832`, built at
set build), Rue's Walkman on the cobbles playing a positional HRTF loop you find by ear, his scarf on `lamp_4`, then the
Campanile's north steps and Rue. NO switches the torch off (the battery drain pauses; you can follow the sound). SWAP
swaps Luka and Chase. Random barks. Finishes `{ found: true }` when the lit beam lands on Rue; the follow camera stays
on for the cutscene to cut from.

Call site (31:459): `['control', 'luka'], ['follow', 'chase'], ['objective', 'Find Rue.'], ['minigame', 'torchlight',
{ walkman: WALKMAN_COBBLES }], ['objective', null], ['cutscene', '2.13_steps']` with `WALKMAN_COBBLES = [4, 0.018, 11.5]`.

### 8.2 Data (`22:13-19`)

| Name | Value |
| --- | --- |
| `WAY` | 8 trail waypoints from the gate `(−19.8, 0.9)` to the north steps `(0.6, 4.9)` |
| `CUM`, `LEN` | Cumulative and total trail length |
| `SCARF`, `RUE` | `[10, 9]`, `[0.45, 3.97]` |
| `FIND` | 2.9 m: trail metres left when the beam finds Rue |
| `FOLLOW` | `{ dist: 2.3, height: 2.05, lag: 0.3, fov: 55 }` |
| `BEAM` | 34: spot intensity |
| `BARKS` | Three `[id, text]` lines, started at a random index |

### 8.3 Helpers

| Helper | Lines | Does |
| --- | --- | --- |
| `along(x, z)` | 21-30 | Metres along the trail of the nearest point on it (same projection as `rue_walk.progress`, unnormalised) |
| `aim(a, s)` | 31-35 | Spot at the right hand (0.3 forward, 0.18 right, 1.2 up), target 4.6 m ahead at 0.05 m (the world's `torchAuto` aims 7 m ahead, too far for the fog) |
| `prompt()` | 36 | `ui.prompt(on ? 'NO — Torch off' : 'NO — Torch on')` |
| `swap()` | 37-42 | Its own swap (the flow's SWAP only runs while roaming, 11:449-452): `state.active`, `player.control`, `player.follower(prev)`, `flow.follow`, `ui.swapIndicator`, `sfx('pop')` |
| `bark()` | 43-47 | `api.say(id, text, { auto: 1.4 })`, then `barkT = 13 + rnd·8` |

### 8.4 The rubber-banded battery (`22:79-84`)

```js
const rem = Math.max(0, LEN - along(x, z));
if (on) B -= B / Math.max((rem - FIND) / CONFIG.walk, 1.5) * dt;   // drain rate = battery / (seconds to the find at walking pace)
```

`dB/dt = −B / τ` with `τ` = walking time left to the find. Walking the trail, `τ` falls at 1 s/s, so `B` falls in a
straight line to about 0 exactly at the find. Standing still it decays exponentially with that time constant, so the
battery never dies early. The HUD shows `max(1, ceil(B))` (4 → 3 → 2 → 1%; 1% for the last quarter) via `hud.set({
battery: n })` only when `n` changes; the find cutscene takes it to 0%. Below 1.3 the beam gutters
(`intensity = BEAM × (0.75 + 0.25·random)` per tick).

### 8.5 `update(dt)` (`22:73-105`)

Returns when `done`, no `player.actor`, or `flow.busy`. Then: SWAP → `swap()`; NO → toggle `on`, `sfx('tick')`, prompt;
battery; torch intensity and `aim`; the Walkman (within 1.5 m: stop the loop, `cassette_eject`, hide `rue_walkman`, a
0.7 s `duck` one-shot, `player.frozen(0.7)`); the scarf (within 1.7 m: hide the `scarf` prop, `rip`, `give`,
`frozen(0.6)`); the find; barks (only while not talking and `rem > 14`).

The find (`22:100-103`), a cone test worth reusing:

```js
const dx = RUE[0] - x, dz = RUE[1] - z, d = Math.hypot(dx, dz);
if (d < 3.4 && (Math.sin(a.rotY) * dx + Math.cos(a.rotY) * dz) > 0.72 * d) { done = true; api.finish({ found: true }); }   // range 3.4 m, half-angle acos(0.72) ≈ 44°
```

### 8.6 `start`, `end`, `autoplay`

- `start` (`22:50-72`): `tok++`; `params.walkman` → `W`; `B = state.battery > 0 ? state.battery : 4`; the active actor
  (`state.active` if it exists, else `luka`) and the other one are unseated, idle, with their `phone` attachment shown,
  placed at `WAY[0]`; control and follower; the torch: `world.torchAuto = false`, colour `0xf2f4ff`, angle 0.42, penumbra
  0.5, intensity 34, aimed; `wm = scene.getObjectByName('rue_walkman')` (content placed it); `AUDIO.loop('walkman', { at:
  W, vol: 3, fade: 1.5 })` (the only HRTF loop, 02-audio.md §3.5); `cam.override('follow', FOLLOW)`, cutscene camera
  released at 0; HUD; swap indicator; prompt; enabled; `ui.fade(0, 1.2)`.
- `end(r)` (`22:106-112`): `tok++`; stop the loop; prompt and swap indicator off; player off; `cam.override(null)` **only
  if not found**.
- `autoplay()` (`22:113-117`): `await a.moveTo(WAY[i])` for each waypoint, then `finish({ found: true })` unless `update`
  already found him. The route passes within the pickup radii, so the Walkman and scarf are collected as in play.

### 8.7 Gotchas

- **`world.torchAuto` is left `false`.** Nothing in Rue restores it after 2.13. A port must restore it in `end()`
  (04-world.md §3.8: it is global, not per set).
- Barks use `say`, which owns the dialogue box and YES. Fine here (YES does nothing), wrong for TWO's gameplay barks.
- `update` stops entirely while `flow.busy` (a hotspot or inventory run).

---

## 9. Reusable pieces, catalogued

| Piece | Source | Reuse for |
| --- | --- | --- |
| Hold-to-confirm curve (fill 1/3 per s, rewind 0.9/s, irreversible at 1, short white hold) | 17:187-194 | Hold NO (3.6), the Choice (3.7), Luka's strength holds (roller door 1.6, brass plate), sample recording (hold YES 1 s, §13.6) |
| Progress ring + house prompt pill painted on the overlay | 17:229-240 | Every hold in TWO |
| Unit-radius gradient scaled with `setTransform` | 17:150-152, 213-214 | Any glow, burn, bloom or scan blob drawn on the overlay without allocation |
| Memory recorder `snap`/`still` + painted fallbacks + re-staging | 17:166-179, 20-103; 30:520-602 | Credits vignettes, flashback inserts, "the framing from Rue's …" callbacks |
| Hand painter `hand()`/`capsule()` | 17:106-132 | 3.7's "their hands side by side on the Remote" INSERT |
| Paused Web Animations scrubbed by `currentTime` | 18:34-36, 100-103 | Credits, any long DOM sequence that must pause with the game |
| Gaze state machine + suspicion meter + duck + soft reset to a spot + slow-down after two fails | 19:22-29, 72-100 | Blend In (3.1), the Starlight sneak (2.9), the train ticket inspection (2.7) |
| `crowd.userData.look(point|null)` (every head turns) | 19:42, 07:198 | The atrium staff when the Fun Monitor asks; the Starlight sleepers |
| Composite anim (`walk` legs + upper anim, `.shows`) | 19:13-14 | Walking while humming / holding a cracker / Santa sack |
| `shoulder(s, back, out)` formation point + steering re-issued every 0.25 s | 20:32-37, 49 | Two AI followers at once (TWO has three playables), Chase (2040) walking ahead, escorts |
| Walk-and-talk gated by distance ("Wait—") | 20:60-67 | Lines while walking anywhere (1.4, 1.7) |
| Ellipse slow zones; telegraphed knock (`bell` at 5 m, `frozen` + push at 0.95 m) | 20:102-114 | Cleaning drone streaks, scooter hazards, drone "hugs" |
| Route projection `progress`/`along`/`at` | 20:156-171, 22:21-30 | Patrol paths, scooter lanes on the bridge deck, progress markers (the laugh at half way) |
| Content-side camera rig through `cam.override('fixed', view)` with own damping and occlusion search | 20:291-314 | The boss camera (§10), the scooter tracking camera |
| Event loop `await waitUntil(any condition)` → dispatch beat | 20:316-328 | Scripted encounters during free movement (Secret Santa deliveries) |
| `meet()` approach-then-prompt | 20:200-226 | NPCs coming up to the player (HR, the door drone) |
| Cone test `d < R && dot > cos·d` | 22:100-102 | Drone scan cones (9.5), the Fun Monitor beam (9.11) |
| Rubber-band drain | 22:79-80 | Boss assist, any meter that must "almost" run out on time |
| Own `swap()` inside a mini-game | 22:37-42 | Sizzle, Blend In, the boss (flow's SWAP only works in roam) |
| Positional HRTF loop found by ear | 22:65 | Lures (a sample at a position) |
| `tok` / `ABORT` cancellation | 20, 21 | Every async mini-game |

---

## 10. How to extend for TWO

### 10.1 Map

| Rue | TWO target (BUILD_PROMPT) | TWO file (ARCH §3.6) | Verdict |
| --- | --- | --- | --- |
| `final_yes` hold + ring + white hand-off | 3.6 **Hold NO** (`hold_no`), 3.7 **The Choice** (`choice`) | `52-mg-hold.js` | Port the hold curve, ring, pill, Reduce Flashing path and `end()` hand-off. Drop the hum and the montage. Add a cursor (3.6), two live rings (3.7), `holdToPress`, `noSkip` |
| memory recorder | Credits vignettes (C), flashback-style inserts | engine-grade: move to `33-systems.js` or `31-ui.js` | Port `snap`/`still` as a standalone `MEMORY` object |
| `credits` | C — Credits | `53-mg-credits.js` | Port the Web Animations engine and skip flow. Replace all content; time the roll to "two" + coda; fix the `dur` gap |
| `blend_in` | 9.11 Blend In (3.1), also 2.9 sneak, 2.7 inspection | `49-mg-blend-in.js` (+ `33-systems.js` drones) | Port the shape (state machine, meter HUD, fail/reset, adaptive ease). Replace the global gaze with a moving beam, ducking with festive actions, one character with three |
| `role_play` | 9.7 Teddy (`roleplay`, `reason_cards`) | `45-mg-teddy.js` | Port the abort-safe script runner, `choose` with greyed options, stage shot, `test`-driven autoplay. Replace cards with topics; add Chase's card puzzle |
| `keep_up` | Follow/lead AI (1.4, 2.4), scooter hazards (9.8) | `33-systems.js` helpers, `46-mg-scooter.js` | Lift `shoulder`, steering, hazards |
| `rue_walk` | Boss camera (§10), scooter camera (9.8), route maths | `51-mg-boss.js`, `46-mg-scooter.js`, systems | Lift `camTick`, `progress`/`at`, the event loop |
| `torchlight` | Drone stealth (9.5): cones, lures, swap, barks | `33-systems.js` | Lift the cone test, own swap, positional loops; replace barks with `bark()` |

### 10.2 Hold NO (3.6) and the Choice (3.7) from `final_yes`

**What the spec asks.** 3.6: control passes to Future Luka (`luka40`, the only time). A cursor on the glass; the
SafeSense pop-up `OPT OUT ALL USERS? [YES] [NO]`; both buttons live. Moving toward YES: his hand shakes and the cursor
drifts back toward NO by itself; on a second attempt **LUKA (2040):** "…No." and YES greys out. NO: hold to confirm, 3 s,
a filling ring "as with Rue's final YES". The song "two" keeps playing throughout. 3.7: the STORAGE FULL pop-up over the
frame; YES and NO both live, no greying, no timer, no hint, a single sustained chord; hold to confirm 3 s; releasing
before the ring fills cancels without penalty. Result → `state.choice = 'A' | 'B'`, `profile.endingsSeen`. §13.9: every
hold can be set to press instead (`options.holdToPress`). §9: the Choice is never skippable.

**Reuse as-is:** the hold maths (§2.8), the ring and pill drawing (§2.9 layers 6-7), `layout()`'s cache-per-size
structure, the Reduce Flashing branches, `finish()` idempotence, and the white hand-off in `end()` if a white cut follows
(3.6 → "[INSERT] NO." does not need one; keep it optional via a param).

**Must change:**

| Topic | Rue | TWO |
| --- | --- | --- |
| Audio | Starts its own `hum` loop and swells it | **Start nothing.** "two" is playing from 3.6's cutscene (`music('two')` / `AUDIO.song`); `music()` or `AUDIO.stopAll()` here would cut it. 3.7's sustained chord comes from the scene's `music` |
| Montage | Five stills burning out | None in the spec. Do not add one to the Choice ("no hint") |
| What is held | `held('yes')` | 3.7: `held('yes')` fills YES, `held('no')` fills NO, each with its own ring (symmetrical, no cursor needed). 3.6: hold NO (`held('no')`), or hold YES while the cursor is on NO |
| Cursor (3.6 only) | none | `cx` 0 (NO) … 1 (YES) from `input.move.x` (copy the numbers; `move` is shared) and `input.pointer.x` mapped onto the glass. Past 0.5: count an attempt (once per excursion; re-arm under 0.3), play a hand-shake anim on `luka40` and spring `cx` back toward NO. Attempt 2: the "…No." line (`api.play([{ say: 'luka40', text: '…No.' }])`, or `bark`), then `yesOff = true`: YES drawn grey, `cx` clamped to the NO half |
| Rendering | All on the overlay | The pop-up belongs **on the glass**: either an overlay drawing in the SafeSense look (rounded translucent white, blue glow, pill buttons) placed over a fixed shot of the glass via `cam.project`, or `popup({ style: 'safesense', … })` for the box and the ring on the overlay. Don't let `popup`'s own buttons handle YES/NO presses: they answer on press, not hold |
| Rewind | 0.9/s | 3.7: "cancels without penalty": rewind is fine, but zero the other ring when the player switches buttons, and never let both fill at once |
| `holdToPress` | n/a | A press latches the hold (`auto`-style flag at 1× speed) and the ring fills over 3 s; a press of the other button or NO cancels. Keep the ring visible so the moment still lands |
| Skip | n/a | `MINIGAMES.choice.noSkip = true`. Hold NO can't fail, so it never offers a skip |
| Result | `{ done: true }` | 3.6 `{ done: true }`. 3.7 `{ choice: 'A' \| 'B' }` + `state.choice` + `profile.endingsSeen[choice] = true` (+ save the profile) in the **same** function the autoplayer calls |
| Autoplay | `auto = true` (4× fill) | 3.6: fill NO at 4×. 3.7: `const c = TEST.ending ‖ 'A'`, fill that ring at 4×, finish through the same path |

Input pitfalls: a left click/finger anywhere is a YES hold and a right click a NO hold (01-core.md §7.4), **unless the
pointer is over a `button` or `[data-noyes]`**. If TWO draws the pills as DOM `<button>`s, mouse holds on them produce no
`held()` at all: give them their own `pointerdown`/`pointerup` handlers or mark the overlay area `data-noyes` and read
`input.pointer`. Never run either game inside a cutscene: holding NO there sets `clock.scale = 3` (11:445).

For 3.7's "**[TWO-SHOT · tight, their hands side by side on the Remote, the framing from Rue's 3.4]**", `hand()` paints
the hands exactly as Rue's final YES did. Luka's right: `hairy`, broad 1.1, his polo sleeve; add grazes as a few short
red-brown strokes after `hand()` returns (it restores the context). Chase's left: TWO's Chase sleeve colour from his
LOOKS entry.

### 10.3 The memory recorder in TWO

Lift `snap`/`still` out of the mini-game into an engine object (e.g. `MEMORY.snap(name)`, `MEMORY.still(name)`,
`MEMORY.has(name)`) so content does not depend on a mini-game module being present. Keep:

- the skip guard (`flow.skipping` → no snap), and the render-then-copy-in-one-task rule;
- 2.35:1 crops at 480×204, or larger for the credits (e.g. 960×408; the readback cost scales with the source, not the
  target);
- painted fallbacks or re-staging for every still a consumer needs, because stills die on reload, Continue and Chapter
  Select, and are never taken under `&fast=1`.

### 10.4 Credits (C)

**What the spec asks:** "two" full length with the player's samples (missing → bleeps), then the 1987 Pudding song as a
short coda. A slow scroll over simple low-poly vignettes (the bench, the bridge, the Valley in neon, the Starlight
stage, the roof's ring of yellow drones). Cards: **TWO**; Starring (Luka · Chase · Luka (2040) · Chase (2040)); With (…
and Rue); **Samples collected** (each sample with where it came from, ending with *Luka (laughing) — Ted Smout Bridge, 25
km/h*); **People you met** (a Polaroid-style card per named character except Rue, one line each; Rue's brick phone on the
final card of the sequence, no caption); three parody cards (white on black, one each); the last card per ending (A:
*Pudding — two · Plays:* with a slowly ticking counter; B: *Pudding — two · Sent 25 December 2040 · "Sorry for the
wait."*).

**Reuse:** `el`/`anim`/`fades`, the scrubbed timeline (`draw` sets `currentTime` only), the CSS-injected-once pattern,
the NO-after-3-s skip ask, `close()`'s fade, `end()` leaving black for PC, the `SCENES.C` `get title()` trick, the
compressed autoplay timeline.

**Change:**

| Topic | TWO |
| --- | --- |
| Length | Make TWO's `AUDIO.song(...)` return `dur` (Rue's never did). "two" is 44 bars at 92 bpm = 114.8 s, plus the coda. Drive `T` from it; keep the `onEnd` hold but cap it at a few seconds past `T`, and cap hard (not +25 s) when there is no audio context |
| Samples card | `state.samples` → `SAMPLES[id].label` + `SAMPLES[id].where` (ARCH §3.4), with `laugh` forced last |
| People cards | A generic Polaroid painter: Rue's `CARDS.polaroid` paints one fixed photograph (10:1373-1408). Paint a frame + an image (a baked portrait from `portraitURL`, or a `MEMORY` still) + caption. Paint them all in `start`, never in `draw` |
| Rue | No card for him: the brick phone card ends the sequence with no caption |
| Vignettes | Don't load sets during the credits (hitches; at most three live sets). Use `MEMORY` stills snapped during play at those places (with painted fallbacks), or painted canvases made in `start` |
| Last card | `state.choice`. The A counter: a DOM text node updated from `draw` only when its integer changes |
| Skip | Keep the ask, but `say.reset()` in `close()` so a pending ask cannot leak into PC |
| Background | C has no set: the last set keeps rendering behind the opaque DOM. Hide it (e.g. load a trivial set or skip `world.render` while a full-screen DOM game is up) if F2 shows the cost |

### 10.5 Blend In (9.11, 3.1)

**What the spec asks:** a Fun Monitor drone's beam sweeps the atrium. Inside the beam the active character must be doing
a festive action, each a context prompt next to a prop: **Pull cracker** (both pullers put goggles on first: two
characters), **Hum** (hold YES to hold a note; a volume needle must stay under 40 dB), **Mince pie**, **"Merry
Christmas!"** to a nearby staffer. Idle in the beam for 3 s → "Are you having fun?" → YES (it leaves) or NO (a strike).
Two strikes → the Quiet Corner (a Safe Room variant). Swap to keep all three covered as it passes. Mini-game skip after
two failures (§9).

**Reuse:** the update order (watcher → player state → meter → prompts → win), the meter panel on the overlay with cached
strings, the `busy` + `api.play` fail beat with `if (done) return` after each await, the reset-to-checkpoint (`toDoor`),
adaptive easing after two failures (`slow = 1.5`) which TWO turns into "offer Skip this?", `crowd.userData.look` for every
staffer turning to the drone's target, composite anims for walking festively.

**Change:**

| Rue | TWO |
| --- | --- |
| Global gaze timer (Hartigan reads/looks) | A drone (`DRONES.spawn(…, { kind: 'fun', path, cone })` from `33-systems.js`) whose beam sweeps; per character, `inBeam = d < len && dot > cos(half)·d` (§8.5) |
| One player character, one follower | Three characters. Each has a `festive` timer (the action keeps them covered for a few seconds after you swap away); swapping is the puzzle. In a mini-game the flow's SWAP is dead: copy `torchlight`'s `swap()` and extend it to cycle three |
| Suspicion % fills while moving | An idle-in-beam timer: 3 s → the drone asks. Freeze the drone while asking (`busy`), since `ask()` does not pause `update` |
| Duck (hold NO) | Festive actions as hotspot-like prompts near props: Cracker (needs the second character goggled and adjacent), Hum (hold YES; the needle rises while held and falls on release, over 40 dB = a strike or a squeak), Mince pie, Merry Christmas |
| `fail()` → back to the door | Strike 1: a line. Strike 2: the Quiet Corner beat (TWO's `safeRoom()` variant, under 6 s), then checkpoint reset |
| Autoplay finishes instantly | TWO's autoplay should still set every flag the real game sets (ARCH: grants and Chapter Select depend on them). Instant finish is acceptable; exercising the loop is better |

The drone is moved by systems code: moving it from the mini-game's `update` runs before the world's interpolation copy
(04-world.md §13, 06-flow.md §10.1), so move it in the systems/set updater or keep its `prev` in sync, or it will
stutter.

Rue's Blend In also fits two roams TWO keeps out of the mini-game list: **2.9 "Leave"** (fixed low angles, creaky boards
with a sheen, "move too fast and someone stirs", soft fail back to his spot): measure speed instead of any movement
(e.g. `player.running`), use ellipse zones for the boards (§5.5), and `toDoor()` for the reset. **2.7 "Ticket
inspection"**: the row-by-row scan is the read/look state machine made spatial.

### 10.6 Role Play → Teddy (9.7, 2.5)

**What the spec asks:** "Rue's Role Play, simplified." Luka (as Santa) picks topics from a small list: "The gate" · "The
computer" · "Your name" · "How long have you been here?". Teddy only opens up after "Your name". The 2.5 lines after the
name are given word for word ("Afternoon, Santa." … "Computer needs a reason it likes…"). Then the reason-card puzzle
belongs to Chase: five physical cards (WORK · FAMILY · MEDICAL · LEISURE · OTHER), each rejected by SafeSense ("Family is
a risk factor." etc.), then the blank card he writes CHRISTMAS on ("…Christmas is a protected holiday. ^ Reason
accepted."). The whole checkpoint needs all three (chip off, Luka talks, Chase writes).

**Reuse:** `run(t)` with `live()`/`S`/`W`/`ABORT` and the top-level catch; `api.choose(labels, { disabled, test })` with
already-asked topics greyed (picking one clunks); a one-time `ui.toast` tutorial; `stand()`; a locked `STAGE` shot through
the booth window; an `AUTO` table so autoplay walks the "wrong" topics once before "Your name".

**Change:**

| Rue | TWO |
| --- | --- |
| Five cards, the right one is the next step | Four topics; only "Your name" advances. Other topics before it get a closed reply (the spec gives no lines for those replies: get them from the script owner rather than inventing; after the name, the spec's own lines cover the rest) |
| "Again." walk-out loop, whispers | Not needed (no fail loop) |
| Hats as plain meshes built on first start and hung on bones | Luka's Santa hat and beard are a LOOKS attachment (ARCH §3.1, spec §14): built with the rig, warmed at boot, toggled by `attach.*.visible`. Never `new THREE.Mesh` in a mini-game |
| Leaves letterbox and shot on | Fine if a cutscene follows; if a roam follows (Chase's card puzzle), turn the letterbox off and `cam.release()` in `end()` |
| `reason_cards` (new) | Chase's half: an INSERT card of the booth panel (`ui.card`/`paintCard`) plus `api.choose(['WORK','FAMILY','MEDICAL','LEISURE','OTHER','The blank card'], { disabled: tried })`, each rejection said by `safesense`, the blank → a CHRISTMAS insert → accepted. The spec gives no MEDICAL rejection line: flag it to the script owner. Autoplay `test` = the blank card's index |

### 10.7 Walks, Keep Up and Torchlight → follow, stealth (9.5), scooter (9.8), boss (§10)

**Followers and leaders (three playables).** Rue has one breadcrumb follower (04-world.md §7.4). TWO needs two at once
(spec §9: "the others follow as AI or hold a position when told"). The cheap route: keep the breadcrumb follower for the
first and steer the second with `keep_up`'s pattern: `toward(actor, shoulder(±1, back, out))` every 0.25 s, run when
more than 1.2 m off. Preallocate the `out` arrays (`A`, `B`) and the option objects (Rue allocates `{ run: true }` per
call: fine at 4 Hz, not per tick). Remember that a scripted `moveTo` on the **player** actor disables input
(`playerTick` returns), so `place(pos)` it before handing control over (20:57). "Chase (2040) walks ahead and waits by
the counter" (1.4) is `keep_up`'s lead + `gap() > RANGE` wait inverted.

**Drone stealth (9.5).** From `torchlight`: the cone test (precompute `cos(half)`), positional loops for lures
(`AUDIO.loop(name, { at })`; only `walkman` is HRTF in Rue, and HRTF panners are CPU-heavy, so keep one live lure, as the
boss already says), an own swap inside mini-games, and the rubber-band idea for meters that should "nearly" run out.
Not from `torchlight`: **scan cones are not lights.** Each set has exactly one spot (04-world.md §3.8); draw cones as
transparent additive floor meshes (instanced, built with the set, warmed at boot). The Signal meter (≈6 s to full,
drains when released) is a plain fill/drain timer, not a rubber band. Barks over stealth must use TWO's `bark()`, not
`say` (which blocks YES and the dialogue box).

**Soft fail → Safe Room.** Blend In's `fail()` is the in-mini-game version: `busy`, player off, a short `api.play`
(line, sfx, fade out), reset positions and meters, fade in, control back. Under 6 s total (13.7). In roams, the systems
updater does the same inside `busyRun`.

**Hover-scooter chase (9.8).** `rue_walk` walk 2's "input only drives forward" is the scooter: `s += speed·dt; at(s,
pt)` along the bridge deck polyline, plus a lane offset perpendicular to `pt[1]`. Keep Up's hazards map directly: the
cyclist's bell at 5 m → the drone's drop-in shadow telegraph; the knock (`player.frozen` + push) → "hugged" costs 2 s
(`frozen(2)`); puddle ellipses → slow zones. The laugh cutscene at the half-way marker is `rue_walk`'s `CALL` pattern
(`pmax >= 0.5` once). The camera "tracks low behind them, then cuts to fixed bridge-side angles at intervals": a
`camTick`-style rig for the track, swapped for `'fixed'` overrides at intervals.

**Boss camera (§10).** "A high, slow, three-quarter tracking camera that keeps Luka at the console and the active Chase
in frame, easing toward whichever side the drones are coming from" is `rue_walk.camTick`: a content-side rig `{d, h, s,
a, y}` eased toward a target, fed through `cam.override('fixed', view)` with `view.pos`/`view.look` mutated in place, its
own exponential damping, a yaw search to keep an obstacle out of the lens line (the console, pillars), and bounds clamps
to keep the lens inside the room. Frame the midpoint of Luka and the active Chase; bias the yaw toward the spawn side
with the largest live drone count.

**Strength holds** (roller door 1.6, brass plate): `final_yes`'s hold curve with a strain meter instead of a ring;
`holdToPress` again latches.

### 10.8 Performance rules as they apply here

| Rule | In these files | TWO action |
| --- | --- | --- |
| No per-frame allocation | Clean: `final_yes` (cached gradients, fixed fonts, `setTransform` trick), `blend_in.draw` (strings rebuilt only on change), `keep_up.update`, `rue_walk.camTick` and smears (typed arrays, one shared `Object3D`), `torchlight.update`. Allocations happen only in beats (array literals for `api.play`, closures for `waitUntil`) | Keep beats out of per-tick paths; preallocate move targets and option objects for 4 Hz steering |
| No building mid-game | Violations: `rue_walk` builds and `setColorAt`s the smears in `start` and relies on `compileAsync`; `role_play` builds three hat groups on first start; `keep_up` spawns three walkers whose looks may build rigs at start | Build every mini-game 3-D prop (beam meshes, cones, festive props, Teddy's cards) **hidden in the set's `build()`**, with `instanceColor` present from the build if it will be used (06:835 does exactly that for ripples), so `world.warm` compiles the program at boot. Spawn only looks the boot adopted |
| Merged / instanced | Smears instanced; hats are separate meshes | Drones, cones, crowds: InstancedMesh (spec §16) |
| Shader warm-up | `compileAsync` as a mitigation | Watch the autoplay warning `shader compiled mid-game in <scene>`; fix at the set, not with `compileAsync` |
| DOM per frame | `credits` touches only `currentTime`; `rue_walk` pokes `#prompt` opacity only on change | Same: DOM writes on change only |
| Overlay | Cleared and re-transformed every frame | Same; size-dependent caches rebuilt on resize only |

### 10.9 Skip-safety and autoplay

- Mini-games are not cutscenes: they are never skipped by holding NO, and `&fast=1` does not shorten them. Under
  `?autoplay=1` the host calls `autoplay(api)` right after `start` (06-flow.md §10.2).
- Every `autoplay` must leave **the same state** as a real win: Blend In sets `took_textbook` and hides the prop like
  `take()` does; Torchlight's walk collects the Walkman and scarf through `update`. TWO's Choice must set `state.choice`
  and `profile.endingsSeen` from `TEST.ending`.
- `api.play` inside a mini-game is not a cutscene either (no letterbox, no skip, no hold-NO), but its steps honour
  `flow.skipping` if it is set. After every `await` of `api.play`, `api.say`, `moveTo` or `wait`, check `done`/`tok`.
- Anything a later scene needs from a mini-game must not depend on in-memory state alone (the memory-recorder lesson).
  Flags go in `state.flags` and grants; images need fallbacks.
- `say`/`ask`/`choose` resolve instantly while `flow.skipping`; under `TEST.auto` they auto-advance after
  0.15 / 0.3 / 0.3 s and use their `test` values (`ask` defaults to `true`, so pass `test: false` for "Skip credits?"-type
  questions, as Rue does).

---

## 11. Gotchas, consolidated

1. **`snap` silently does nothing while `flow.skipping`,** and stills never survive a reload, Continue or Chapter Select.
   Every consumer needs a fallback (17:17, 30:520-602).
2. **`snap` must render and copy in one task** (no `preserveDrawingBuffer`), and costs a full extra render plus a GPU
   readback. Only from cutscene `do` steps.
3. **`AUDIO.song` returns no `dur`.** The credits always estimate 53-61 s; and before `AUDIO.init()` the song object is
   still truthy, so the parody card holds 25 s (18:83-89).
4. **`close()` doesn't dismiss a pending `ask`** in the credits (18:67-73).
5. **`torchlight` leaves `world.torchAuto = false`** forever (22:63, no restore).
6. **`held()` is never consumed.** Good for holds (nothing steals them); bad if a hold mechanic runs while a dialogue
   box is up and the player expects their YES to only advance the line.
7. **A held left click or finger anywhere is YES; right click is NO;** except over `button`/`[data-noyes]`, where it is
   nothing (01-core.md §7.4). DOM buttons for hold UIs need their own pointer handling.
8. **Holding NO inside a cutscene runs the game at 3×.** Never put a hold-NO mechanic inside `playCutscene`; mini-games
   and `api.play` are safe.
9. **`book_walk` (and any custom walk anim) is not in `LOCO`,** so it doesn't return to idle by itself; reset it by
   hand and restore `walkAnim` in `end()` (19:88, 126).
10. **`rue_walk.end()` always sets `rue.walkAnim = 'swagger'`,** even after walk 3 deliberately used `walk` (20:358, 407).
11. **A scripted `moveTo` on the player actor blocks input** until it ends or the actor is `place`d (20:57).
12. **The flow's SWAP only works while roaming.** Mini-games that want SWAP implement it (22:37-42).
13. **`api.play` pauses `update`; `api.say`/`ask`/`moveTo` don't.** Use a `busy` flag for the latter (19:30-53, 20:208).
14. **`role_play.end()` leaves the letterbox and the stage shot on.** Correct only because a cutscene follows (21:130-140).
15. **`blend_in.autoplay` finishes instantly,** so autoplay never exercises its logic. Test such games by hand.
16. **Mid-game builds:** `rue_walk`'s smears (with `instanceColor`, a separate program), `role_play`'s hats, `keep_up`'s
    walker rigs. TWO: build hidden at set build, warm at boot.
17. **`keep_up` knocks Chase by writing `pos` directly,** which skips `prev` and smears one frame (20:112). Acceptable
    for a knock; use `place` for anything else.
18. **Overlay HUDs must clear and set the DPR transform every frame,** and `end()` must clear the backing store with the
    identity transform (17:249, 19:128).
