# 06 — Flow: scenes, cutscene steps, hotspots, inventory, roam, mini-game host

Reference manual for Rue's FLOW subsystem: the scene runner, the cutscene step runner, the generation counter, skipping,
hotspots (examine, talk, ask, use-item, kettle saves, doors, sample recording), the inventory, free roam (`until` /
`hint` / `auto`), the mini-game host and its `api`, grants and scene select. Section 13 is an **authoring cookbook** built
from Rue's two content files `23-content-prologue-not-yet-and-1-1-8-52.js` and
`24-content-1-2-margarine-and-1-3-language-detected.js`. Section 14 is what TWO needs from this subsystem.

| Rue (`ref/rue/`) | TWO (`src/`) | Differences |
| --- | --- | --- |
| `11-flow.js` (603 lines) | `32-flow.js` (603 lines) | Console prefixes say `TWO:` instead of `RUE:`, and `RUE_TEST` is `TWO_TEST` (11:527, 540, 576, 584). **Line numbers are identical.** |

Citations: `11:NNN` is a line in the flow file (the same line in `src/32-flow.js`). `23:` and `24:` are the two content
files above, `10:` is `10-ui.js`, `09:` the world, `02:` core, `01:` config, and `NN:` any other `ref/rue/NN-*.js`.
Related manuals: `01-core.md` (clock, `wait`, skip semantics), `04-world.md` (every shot option, actors, split,
time-lapse), the UI manual (`say`/`ask`/`choose`/`popup`/`hud`/`objective`), `02-audio.md` (`music`, `AUDIO.loop`).
In tables and inline code below, `‖` stands for JavaScript `||` (a literal pipe would break the Markdown table).

---

## 1. Overview

### 1.1 Exports and dependencies

```js
const { flow, hotspots, inventory, runSteps, playCutscene } = (() => { … return { flow, hotspots, inventory, runSteps, playCutscene }; })();   // 11:5, 11:602
```

| Export | What it is |
| --- | --- |
| `flow` | The scene runner and its live state: `start`, `next`, `stop`, `skip`, `minigame` and the fields in §3 |
| `hotspots` | `{ list, used, update, reset, trigger }` (§7) |
| `inventory` | `{ selected, has, add, remove, open }` (§8) |
| `runSteps(steps, o)` | Runs a step list in order, without the cutscene wrapper (§5.2) |
| `playCutscene(c, o)` | Runs a step list (or `CUTSCENES[id]`) as a cutscene (§5.1) |

It reads these globals **at call time only**: `world`, `cam`, `player` (09); `ui`, `say`, `ask`, `choose`, `popup`,
`hud`, `objective`, `menus` (10); `clock`, `wait`, `waitUntil`, `addUpdate`, `on`, `emit`, `input`, `saveGame` (02);
`state`, `newState`, `TEST`, `RUE_TEST`, `testLog`, `SCENES`, `CUTSCENES`, `SCENE_ORDER`, `ACTS`, `ITEMS`, `SAMPLES`,
`MINIGAMES`, `profile`, `saveOptions` (01). Behind `typeof` guards: `AUDIO`, `music`, `music.silence`, `sfx`.

### 1.2 Private module state (11:6-9)

| Name | Meaning |
| --- | --- |
| `G` | **Generation counter.** Bumped by `stop()`. Every async run captures it and stops when it changes (§2) |
| `cutDepth` | Number of `playCutscene` calls currently running (nesting allowed). `flow.cutscene` is `cutDepth > 0` |
| `cardOn` | An INSERT card shown by a `{shot, card}` step is up. Cleared by the next shot without `card`, by `flow.skip`, by the end of the outermost cutscene and by `flow.start` |
| `inited` | `tick` / `draw` registered (first `flow.start`) |
| `mg` | The running mini-game record `{ m, paused, api }`, or `null` |
| `panelOpen` | The inventory panel is open |
| `loops` | `name → [AUDIO.loop handles]` started by `{loop}` steps. All stopped (0.4 s) by `stop()` |
| `hudEl`, `ovEl`, `mgEl` | `#hud` (the top-right HUD pill), `#overlay` (mini-game 2D canvas), `#mg` (mini-game DOM layer) |
| `NOAMB` | `{ rain: false, loops: [], room: 'none' }`: ambience for a set that defines none |

### 1.3 Where flow runs in a tick

`flow.start` registers `tick` with `addUpdate` and `draw` with `on('render')` the first time it runs (11:536). So the
flow tick runs **inside `clock.step()`**, every fixed 60 Hz tick, after `ui.update` (dialogue, pop-ups) and before
`world.update` (see `01-core.md` §8.2 and `04-world.md` §1.4). `draw` runs once per rAF frame after `world.render`.

`tick(dt)` (11:444-453), in order:

1. `clock.scale = cutDepth && input.held('no') ? 3 : 1`: hold NO to fast-forward a cutscene at ×3. It is **written every
   tick**, so content can never set `clock.scale` and have it stick.
2. The mini-game's `update(dt)` if one is running, not paused by `api.play`, and the inventory panel is closed. A throw
   finishes the mini-game with `{ error: true }`.
3. Return unless `flow.roaming && !flow.busy && !panelOpen && !cutDepth`. **Hotspots, the inventory key and SWAP only
   work while roaming.**
4. `inventory` pressed → `inventory.open()`, return.
5. `flow.swap` and `swap` pressed → `doSwap()`.
6. `hotspots.update(dt)`.

Steps themselves run as promise continuations, so they take effect after the frame's ticks and render (see
`01-core.md` §7.3.1).

### 1.4 The context object `c` (11:15-16)

Every `do` step, `use`/`examine`/`combine` function, hotspot `do`, roam `auto`, and scene `['do', fn]` receives
`c = ctx()`, built fresh on each call:

| Member | Is |
| --- | --- |
| `c.world`, `c.cam`, `c.player` | World, camera director, player (`04-world.md`) |
| `c.flow`, `c.hotspots`, `c.inventory` | This subsystem |
| `c.state` | The global `state` **at call time** (it is a `let` that menus and scene select replace; never cache it across scenes) |
| `c.ui`, `c.say`, `c.ask`, `c.choose`, `c.popup`, `c.hud` | UI (`c.popup.count()`, `c.popup.clear()` exist) |
| `c.wait` | `wait(sec)` (resolves at once while skipping) |
| `c.sfx(name, o)` | `ui.sfx` (no-op before audio init) |
| `c.music(cue, o)` | `music` if defined |
| `c.AUDIO` | `AUDIO` or `null` |
| `c.runSteps`, `c.playCutscene` | §5 |

Not on `c`: `objective`, `input`, `clock`, `TEST`, `addUpdate`. Content uses the globals (23:99, 23:111).

---

## 2. The generation counter `G`

`stop()` does `G++` (11:517) and `start()` calls `stop()` first. Every async run records `const g = G` and returns
as soon as `g !== G`:

| Where | Check |
| --- | --- |
| `runSteps` | Before every step (11:85) |
| `playCutscene` | After its steps, and after the closing `cam.release` (11:100, 107) |
| `busyRun` | After the action, before clearing `flow.busy` (11:228) |
| `roam` | In the poll predicate and after it (11:478, 484) |
| Scene step `set` | After the fade out (11:503) |
| `start` | After every `await` and before every scene step (11:550, 556, 570, 574, 580) |

What `G` does **not** cancel:

- A promise already awaited inside a `do` function. `await c.wait(5)` still resolves 5 s later; the code after it runs
  in the new scene unless it checks.
- Content updaters (`addUpdate`) and `.then` chains.
- A pending `say` box. `stop()` does not reset dialogue (only `menus.title → ui.reset()` does).

`G` is private. Content guards with the scene id instead (23:113, 23:50):

```js
c.wait(1.2).then(() => { if (c.flow.sceneId === '1.1') { duties(); c.ui.toast('Objectives: top left'); } });
const u = () => { if (flow.sceneId === '1.1') return; removeUpdate(u); cols.splice(cols.indexOf(box), 1); };
```

---

## 3. The `flow` object (11:590-600)

| Member | Type | Meaning |
| --- | --- | --- |
| `skipping` | bool | The current cutscene is being skipped (§3.3). `wait`, `waitUntil`, UI tweens, `say`, world moves all short-circuit on it |
| `scene` | object\|null | `SCENES[sceneId]` |
| `sceneId` | string\|null | The running scene. `null` after `stop()` |
| `stepIndex` | number | Index of the running scene step (F2 overlay, shader warning) |
| `result` | any | Last result of a `choice` (index), `ask` (bool), `popup … wait` (button index, −1 if closed) or mini-game (its `finish` value) |
| `swap` | bool | SWAP enabled (scene `swap`, scene step `['swap', bool]`) |
| `follow` | string\|null | The follower actor id (scene step `['follow', id]`; swaps exchange it) |
| `roaming` | bool | A `roam` step is in free play (never true under autoplay) |
| `busy` | bool | A `busyRun` (hotspot action, inventory action, hint) is running |
| `cutscene` | getter | `cutDepth > 0`. The pause menu offers **Skip Scene** only then (10:774); NO does not answer pop-ups then (10:508) |
| `start(id, o)` | async | §3.1 |
| `next()` | | Start the next scene in `SCENE_ORDER`, else `theEnd()` (11:529-533) |
| `stop()` | | §3.2 |
| `skip()` | | §3.3 |
| `minigame(id, params)` | → Promise | §10 |

### 3.1 `flow.start(id, o = {})` (11:535-588)

| Option | Meaning |
| --- | --- |
| `o.select` | Scene select: a fresh `state = newState()` plus the `grants` of every scene **before** `id` in `SCENE_ORDER` (§11). Used by Chapter Select (10:734) and `?scene=` (36:112) |

Sequence:

1. First call only: `addUpdate(tick)`, `on('render', draw)`.
2. `stop()` (bumps `G`, §3.2).
3. `flow.sceneId = id`, `flow.scene = SCENES[id]`, `stepIndex = 0`, `result = null`; `RUE_TEST.scene/step`; log `scene <id>`.
4. **Scene not built** → warn and `theEnd()`. The run ends there; it does not skip ahead.
5. `o.select` → fresh state + grants. Then `state.scene = id`.
6. `await ui.fade(1, 0.5)` to black.
7. Clean slate: `popup.clear()`, card off, `objective(null)`, letterbox off, `cam.release(0)` if a shot is up,
   `cam.override(null)`, `world.split(null)`, **despawn every actor**.
8. `sc.set` → `loadSet(sc.set, sc.env)` = `world.load` + `AUDIO.ambience(set.ambience ‖ NOAMB)` + `AUDIO.setRoom`. No
   `set` → the previous set stays.
9. `spawnMap(sc.spawn)`: each `id: where` → `world.spawn(id, where)`; each `id: { at, look, set }` →
   `world.spawn(id, at, opts)` (11:42-47).
10. If `sc.playable` is non-empty and does not contain `state.active`, `state.active = playable[0]`.
11. `flow.swap = !!sc.swap`, `flow.follow = null`, `player.follower(null)`, then `player.control(state.active)` if that
    actor exists.
12. HUD: `'hud' in sc ? hud.set(sc.hud) : hud.set({ battery: state.battery, bars: state.bars })`.
13. `'music' in sc` → `music(sc.music)` (`null` fades out). Absent → the previous cue keeps playing.
14. Hotspots: `list.length = 0`, `used.clear()`, push `sc.hotspots`.
15. **Autosave**: `saveGame()` unless `id === 'P'`. Continue resumes at the start of this scene.
16. `ACTS[id]` → `await ui.actCard(text)` (`'ACT ONE — Title'` splits at `' — '`; 0.8 + 2.8 + 0.8 s).
17. `ui.fade(0, 0.8)` **not awaited**: the first step runs in the same tick, so an opening `{fade}` or shot wins
    (a new tween on the same element replaces the old one, 10:18).
18. Each scene step in order, `await sceneStep(st, steps[i+1])` (§4.2). A throw is logged and the next step runs.
19. `emit('scene:end', { id })`; log `scene <id> end`.
20. Autoplay and (`id === TEST.stop` or `'PC'`) → `RUE_TEST.done = true`. `'PC'` → `profile.completed = true`,
    `saveOptions()`, title. `'P'` outside autoplay → title (the prologue plays once, on first launch). Otherwise
    `next()`.

`start` is not re-entrant-safe by design: a second `start` bumps `G` and the first run quietly unwinds.

### 3.2 `stop()`, `toTitle()`, `theEnd()` (11:516-527)

`stop()`: `G++`; finish a running mini-game with `{ aborted: true }`; `skipping = roaming = busy = false`,
`sceneId = null`; `panelOpen = false`, `cutDepth = 0`, `clock.scale = 1`, `inventory.selected = null`; stop every
`{loop}` handle (0.4 s); `player.enabled = false`; close the inventory panel, prompt and swap indicator; un-hide `#hud`;
`music.silence(false)`; `cam.lock(false)`. It does **not** clear pop-ups, cards, the objective or the letterbox (the next
`start` does, after its fade), and it does not touch content updaters.

`toTitle()` = `stop(); menus.title()`. `theEnd()` logs `end of built content`, then `RUE_TEST.done = true` under
autoplay, else `toTitle()`.

### 3.3 Skipping, fast-forward and `&fast=1`

| Mechanism | Code | Effect |
| --- | --- | --- |
| Pause → Skip Scene → YES | 10:774 → `flow.skip()` (11:595-599) | Only if `cutDepth > 0`: `skipping = true`, `popup.clear()`, card off |
| Hold NO | 11:445 | ×3 game speed while `cutDepth > 0` |
| `?fast=1` | 11:96 | Every `playCutscene` sets `skipping = true` at its start |
| Reset | 11:109, 11:519 | When the **outermost** cutscene ends, and in `stop()` |

What a skip touches: the rest of the current outermost cutscene runs instantly. Waits resolve, typewriters close,
tweens snap, moves teleport. Steps that change state still apply (§5.6). The **next** `['cutscene']` scene step plays
normally: a skip never carries across scene steps. Sequences run through `runSteps` outside a cutscene (an `ask` branch
in a hotspot, `api.play` in a mini-game) cannot be skipped and are not fast-forwarded.

---

## 4. Scenes

### 4.1 The scene object (`SCENES[id]`)

| Field | Type | Read by | Meaning |
| --- | --- | --- | --- |
| `title` | string | menus (10:734) | Scene select subtitle. **Never shown in-game** (11:568: several titles are punchlines) |
| `set` | set id | start | Loaded behind the fade. Omit to keep the current set |
| `env` | preset name \| env object | start | Passed to `world.load(set, { env })` |
| `time` | string | not flow | Documentation of the script's time; `SETS.reddy` reads it for its wall clock (05:972). Date cards are authored as `{title}` steps |
| `playable` | id[] | start, swap | Who the player may control. `[]` = nobody (prologue). SWAP cycles in list order |
| `swap` | bool | start | Initial `flow.swap` |
| `hud` | object\|null | start | `null` hides the 1987 HUD **and sets `state.battery = state.bars = null`** (10:536). Absent = re-show from `state` |
| `music` | cue\|null | start | `null` fades the music out. Absent = keep the current cue |
| `spawn` | `{ id: where }` or `{ id: { at, look, set } }` | start | `where` = mark name, anchor, actor id or `[x, y, z, rotY]` |
| `hotspots` | hotspot[] | start | §7. Replaces the list; `once` memory is cleared |
| `steps` | scene step[] | start | §4.2 |
| `grants` | object | scene select | §11 |

`act` appears in the registry comment (01:31) but nothing reads it; act cards come from `ACTS[id]`.

Real examples (23:146-152, 24:148-151):

```js
SCENES.P = {
  title: 'Not Yet', set: 'office', env: 'dark', time: 'Tue 29 Sep 2026, 6:10 am',
  playable: [], swap: false, hud: null, music: null,       // no music: the set's ambience is a clock ticking and far traffic
  spawn: { rue58: 'rue_desk' },
  steps: [['cutscene', 'P']],
  grants: {},
};
SCENES['1.2'] = {
  title: 'Margarine', set: 'reddy', env: 'day', time: 'Tue 29 Sep 2026, 09:14',
  playable: ['chase'], swap: false, hud: null, music: 'reddy',
  spawn: { chase: 'counter_chase', margaret: [1.0, 0, 7.8, -2.7] }, …
```

### 4.2 Scene steps (`sceneStep`, 11:490-514)

A scene step is a tuple `[kind, arg, opts]`. Unknown kinds warn and are skipped.

| Kind | Form | Behaviour | Awaited |
| --- | --- | --- | --- |
| `cutscene` | `['cutscene', id \| steps, { letterbox }]` | `playCutscene(arg, { letterbox, keep })`. `letterbox` defaults to `true`; `keep` per §4.3 | yes |
| `steps` | `['steps', steps \| id]` | `playCutscene(arg, { letterbox: false })`: no bars, but still a cutscene (player frozen, skippable, hold-NO, closing `cam.release(0.8)` if a shot was used) | yes |
| `objective` | `['objective', text \| items[] \| null]` | String → `objective(text)` (**clears any sub-item list**). Array of `{ text, done }` → `objective.list(items)` (keeps the line). `null` hides | — |
| `control` | `['control', id]` | `state.active = id`; `player.control(id)` if the actor exists (warns if not); refresh swap indicator | — |
| `roam` | `['roam', { until, hint, auto }]` | §9 | yes |
| `minigame` | `['minigame', id, params]` | `player.enabled = false`, then `flow.minigame(id, params)` (§10). Result in `flow.result` | yes |
| `wait` | `['wait', sec]` | `wait(sec)` | yes |
| `set` | `['set', id, { env, spawn }]` | Fade to black (0.4 s), `changeSet` (load, ambience, spawn map, re-control player and follower), fade in (0.5 s, not awaited) | yes |
| `cam` | `['cam', mode, opts]` | `cam.override(mode, opts)`: `'fixed'` with `{ pos, look, fov }`, `'follow'`, `'set'`, or `null` for zone cameras (`04-world.md` §8.3) | — |
| `swap` | `['swap', bool]` | `flow.swap`; on `true` a toast `TAB — Swap` / `Y — Swap` / `SWAP — Swap` | — |
| `follow` | `['follow', id \| null]` | `flow.follow`, `player.follower(id)` | — |
| `do` | `['do', fn]` | `fn(c)`; a returned promise is awaited. A **block-bodied arrow returns nothing**, so it is not awaited (24:309) | if it returns a promise |
| `save` | `['save']` | `saveGame()` | — |

### 4.3 Letterbox continuity: the `keep` rule (11:493-496)

```js
const lb = o.letterbox !== false;
return playCutscene(a, { letterbox: lb, keep: lb && (!nx || (nx[0] === 'cutscene' && !(nx[2] && nx[2].letterbox === false))) });
```

A letterboxed cutscene **keeps** its bars and its last shot when it is the scene's last step, or when the next scene step
is another letterboxed cutscene. Otherwise its last shot eases back into the gameplay camera (0.8 s, 0 when skipped)
while the bars slide away.

- 1.1: `1.1_arrival` is followed by `['control', 'chase']` → bars away, ease to the zone camera, roam. `1.1_video` is
  last → bars and shot held; the next scene's `start` fades to black and resets them (23:250-262).
- A last cutscene that ends on `{ fade: 'out' }` (24:297, 24:411) hands a black screen to the next scene's fade.
- To hold a shot into a following mini-game, see `into()` (§13.7).

---

## 5. Cutscenes

### 5.1 `playCutscene(c, o = {})` → Promise (11:90-111)

| Param | Meaning |
| --- | --- |
| `c` | `CUTSCENES` id (logged as `cutscene <id>`) or a step array. Missing id → warn, resolve |
| `o.letterbox` | Default `true`: bars slide in at the start and out at the end. `false` for hotspot and inline sequences |
| `o.keep` | Leave bars and camera as they are at the end (only the scene runner sets it) |

1. `cutDepth++`; `?fast=1` → `skipping = true`.
2. `player.enabled = false`, prompt off, `hotspots.reset()`, bars on if `letterbox`.
3. `await runSteps(steps)`. Stale generation → return without touching anything.
4. `cutDepth--`. **Nested** (`cutDepth > 0` still) → return now: no release, no unfreeze.
5. Outermost: card off. Unless `keep`: bars off (if it had them) and `await cam.release(skipping ? 0 : 0.8)` if a shot is
   up. A letterbox-free cutscene that used a shot also eases back.
6. `skipping = false`, `clock.scale = 1`. If roaming and not busy, `player.enabled = true`.

### 5.2 `runSteps(steps, o)` → Promise (11:80-88)

Runs each step with `await step(s)`, checking `G` before every step. `o.letterbox` turns the bars on (never off). Each
step is in its own try/catch: a throw logs `RUE: step failed` and **the next step runs**. It does not touch `cutDepth`,
the player, or skipping. `ask` branches, `if`/`par` children, time-lapse keys and `api.play` use it.

`runAny(x)` (11:78): a function → `x(c)`; anything else → `playCutscene(x, { letterbox: false })`. Used for hotspot
`use` and `ask` branches and item `examine` / `flip` / `combine`.

### 5.3 Step dispatch: one key per step (11:113-186)

`step(s)` tests keys **in this fixed order** and handles the first match only:

`shot` → `say` → `choice` → `ask` → `popup` → `spawn` (string only) → `set` → `hold` → `music` → `par` → `if` → `do` →
`stare` → `move` → `face` → `expr` → `act` → `despawn` → `place` → `prop` → `sfx` → `loop` → `wait` → `flash` →
`fade` → `letterbox` → `hud` → `flag` → `item` → `name` → `sample` → `objective` → `env` → `split` → `timelapse` →
`title` → `actCard` → warn `unknown step`.

So `{ wait: 1, flag: 'x' }` only waits, `{ hold: 'luka', prop: 'mug' }` is a hold (not a prop edit), `{ spawn: {…} }`
without `set` falls through to `unknown step`, and option keys must never collide with an earlier step key. Write one
step per object.

### 5.4 Every cutscene step

"Skip" is what happens while `flow.skipping`. "Await" = the runner waits for it.

**Camera and screen**

| Step | Options | Effect | Await | Skip |
| --- | --- | --- | --- | --- |
| `{ shot, …, card: [kind, data] }` | Every shot option (`04-world.md` §9.3) | `cam.shot(s)`. `card` shows `CARDS[kind]`; a later shot without `card` hides it | no | **Ignored entirely** (no camera change, no card) |
| `{ fade: 'out'\|'in'\|0..1, dur = 0.5, color }` | `color` sets the fade colour (else black when fading out) | `ui.fade`. Reduce Flashing stretches white fades to ≥ 1.2 s | yes | Snaps to the target |
| `{ flash: dur = 0.6, color = '#fff' }` | | Full-screen flash | yes | Instant 0 |
| `{ letterbox: bool }` | | Bars on/off | — | Applied |
| `{ title: text, dur = 2.5 }` | | Centre title card: 0.5 in, `dur − 1` hold, 0.5 out (26:394 "END OF ACT ONE"; 27:174 a date card) | yes | Ignored |
| `{ actCard: text }` | | Act card (4.4 s). Normally automatic from `ACTS` | yes | Ignored |
| `{ hud: null }` / `{ hud: { battery, bars } }` / `{ hud: {…}, anim: dur }` | | `hud.set(null)` (hides, nulls state) / `hud.set(v)` / `hud.animate(v, dur)` counting one step at a time (27:266) | **no** (animate is not awaited) | Applied instantly |
| `{ objective: text \| items[] \| null }` | | As the scene step | — | Applied |
| `{ split: spec \| null, slide }` | | `world.split(spec, s)` (`04-world.md` §11) | no | Applied |
| `{ stare: sec, ambient: [[sfx, t], …] }` | `sec` default 3, **capped at 4** | §5.5 | yes | Ignored |

**Dialogue and pop-ups**

| Step | Options | Effect | Await | Skip |
| --- | --- | --- | --- | --- |
| `{ say: id, text, … }` | `tag`, `speed: 'slow'\|'normal'\|'fast'`, `name` (label override, 27:540), `portrait: false`, `censor: true\|'msg'`, `auto: sec` (auto-advance), `expr`, `act` (string) | `expr`/`act` cues go to `world.actor(id)` first, then `say(id, text, s)`. `^` in text = 0.8 s beat | yes | **Ignored, including the `expr`/`act` cues** |
| `{ choice: labels[], flag, disabled: [i], test }` | `test` = autoplay/skip pick | `choose`; `flow.result = index`; `flag` → `state.flags[flag] = index` | yes | Resolves to `test` or the first enabled option |
| `{ ask: q, yes: steps, no: steps, flag, test, yesDisabled, noDisabled }` | | `ask`; `flow.result = bool`; `flag` → bool; then `runSteps(yes or no)` | yes | Resolves to `test ?? true` (honouring disabled); the branch still runs |
| `{ popup: spec, wait, clear }` | `spec` per the UI manual (`msg, title, icon, buttons, at, w, dur, shake, spinner, progress, dodge, ding, z, cls`) | `clear` → `popup.clear()` first. `spec` → `popup(spec)`. `wait: true` → await its button, `flow.result = index` (−1 when closed by `dur`/clear) | only with `wait` | `clear` applies; **no pop-up is shown** |
| `{ popup: null, clear: true }` | | Clear every open pop-up (23:306) | — | Applied |

**Actors, props and world**

| Step | Options | Effect | Await | Skip |
| --- | --- | --- | --- | --- |
| `{ spawn: id, at, look, set }` | `set` = spawn into a live set (split right half, 29:159) | `world.spawn(id, at, s)` | — | Applied |
| `{ despawn: id }` | | `world.despawn` | — | Applied |
| `{ place: id, at }` | | `actor.place(at)` (teleport, no smear) | — | Applied |
| `{ move: id, to, run, speed, face, nowait }` | `moveTo` options (`04-world.md` §6.3); `face: false` keeps the travel heading | §5.5 | unless `nowait` | Teleports |
| `{ face: id, to, dur }` | `to` = rotY number or any place; `dur` default 0.3 | `actor.face(to, dur)` | **no** | Instant |
| `{ act: [[id, anim, opts], …] }` | `opts`: `dur, loop, speed, still, h, yaw` | `actor.play` for each | no | Applied (final anim) |
| `{ expr: [[id, expr], …] }` | | `actor.setExpr` for each | — | Applied |
| `{ hold: id, prop, hand }` | `prop` name/Object3D/`null`; `hand` `'R'`\|`'L'` | `actor.hold(prop ?? null, hand)`. `{ hold: 'chase', prop: null }` drops (23:328) | — | Applied |
| `{ prop: name, visible, pos: [x,y,z], rotY, fn(o) }` | | Edit a named set prop; warns if missing | — | Applied |
| `{ set: id, env, spawn: {…} }` | | `changeSet`: load, ambience, spawn map, re-control. **No fade** (the scene step fades) | yes | Applied |
| `{ env: preset \| object, dur = 0 }` | | `world.env(env, dur)` | **no** (runs under what follows, 23:174) | Instant |
| `{ timelapse: { from, to, dur, cycles, keys: [{ t, steps }] } }` | | §5.5 | yes | Keys' steps run in order; env untouched |

**Audio**

| Step | Options | Effect | Await | Skip |
| --- | --- | --- | --- | --- |
| `{ music: cue \| null, fade, cut }` | The step is the options object | `music(cue, s)`; same cue = no-op | — | Applied with `{ cut: true }` |
| `{ sfx: name, vol, … }` | The step is the options object | `ui.sfx(name, s)` | — | **Ignored** |
| `{ loop: name, vol, fade, rate, lp, at }` | | `AUDIO.loop(name, s)`; handle kept in `loops[name]` (several per name allowed, 25:231) | — | **Applied** (loops start even when skipped) |
| `{ loop: name, stop: true, fade = 0.5 }` | | Stops every handle of that name | — | Applied |

Loops live until stopped or until `flow.stop()` (scene change). A mini-game's own `AUDIO.loop` handles are **not**
tracked here; its `end()` must stop them.

**State**

| Step | Effect | Skip |
| --- | --- | --- |
| `{ flag: name, value = true }` | `state.flags[name] = value`; `emit('flag:set', { name, value })` (nothing in Rue listens) | Applied |
| `{ item: id }` / `{ item: id, remove: true }` | `inventory.add` + toast `New item: <name>` (if new) / `inventory.remove` | Applied |
| `{ name: 'Des' }` | `state.names` + toast `Name learned: Des` (if new) | Applied |
| `{ sample: key }` | `state.samples` + toast `Sample recorded: <SAMPLES[key].label>` (if new) | Applied |

**Control flow**

| Step | Effect | Await | Skip |
| --- | --- | --- | --- |
| `{ wait: sec }` | `wait(sec)` | yes | Resolves at once |
| `{ par: [step, step, …] }` | `Promise.all(par.map((x) => runSteps([x])))`. **Each element is one step**; a sequence needs `{ do: (c) => c.runSteps([...]) }` (27:209-216) | yes (all) | Children follow their own rules |
| `{ if: (state) => bool, then: steps, else: steps }` | `runSteps(then or else)`; either may be omitted. It receives `state`; read `flow.result` from the global | yes | Branch runs |
| `{ do: (c) => … }` | Calls `fn(c)`; a returned promise is awaited | if promise | **Runs.** Content must handle skipping itself (§5.6) |

### 5.5 The three helpers with their own logic

**`move` (11:188-196).** `actor.moveTo(to, s)` (it teleports if already skipping). `nowait` or skipping → return at
once. Otherwise it waits with `waitUntil(() => done)`, not on the world promise, because world promises are not released
by a skip (`04-world.md` §2). If a skip begins mid-walk, `waitUntil` resolves, the walk is still running, and `moveTo` is
re-issued while skipping, which teleports the actor to the target. This is why content should prefer `{move}` steps over
`await a.moveTo()` inside a `do`.

**`stare` (11:199-211).** The script's "stare" beat: camera locked (`cam.lock(true)`), music silenced
(`music.silence(true)`), prompt off, `#hud` hidden; the world and its ambience carry on. `ambient` cues `[sfx, t]` play
at `t` seconds (sorted). It lasts `min(4, stare ‖ 3)` s; YES ends it after 1 s. Then unlock, unsilence, re-show the HUD.
Skipped entirely while skipping; a skip mid-stare resolves it next tick and the cleanup still runs. Combine with a `do`
in a `par` for things that happen during the stare (25:616-619).

**`timelapse` (11:213-221).** Wraps `world.timelapse` (`04-world.md` §12). Each key's `steps` fire once through
`runSteps`. Normal play: the world fires them at their `t`, and when the time-lapse ends any keys not yet fired run in
order. Skipping (at the start, or mid-way): the world call is not made (or is abandoned), and every unfired key runs in
order. The env is **not** set to the end state, so follow it with an explicit `{ env: … }` if later steps depend on the
light.

### 5.6 Skip-safety rules for content

Every step must finish instantly and leave the right end state when skipped (BUILD_PROMPT §16). The engine steps already
do. `do` steps are where content breaks it.

1. **`do` always runs.** Gate cosmetics on `c.flow.skipping` and apply state unconditionally (23:74, 23:90, 24:28):

   ```js
   function videoError(c) {
     if (c.flow.skipping) return;
     const p = c.popup({ msg: 'Video could not be played.', icon: 'error', buttons: [], at: [0.5, 0.44] }); …
   ```
2. **Loops with `await c.wait()` must test `c.flow.skipping`.** Under a skip `wait` is pre-resolved, so
   `while (x) await c.wait(0.1)` never yields and freezes the page (`01-core.md` §7.3.4). Rue's pattern (24:28, 24:36):
   `for (let i = 0; i < beats.length && !c.flow.skipping; i++) { …; await c.wait(beats[i]); }`.
3. **Tweens jump to their end state when skipping** (23:36): `if (c.flow.skipping) f(1); else addUpdate(f);`. A tween
   already running when a skip starts must check `c.flow.skipping` per tick and snap (23:77).
4. **Never put state in a `say` step's `expr`/`act` cue.** They are dropped when skipping. Use separate `{expr}` /
   `{act}` steps for anything that must hold after the cutscene.
5. **A camera that a mini-game needs must be set from a `do`**, not a `shot`, because shots are ignored when skipping
   (`into()`, §13.7).
6. **Avoid `{ popup: { buttons: [] }, wait: true }`** with no `dur`: nothing can ever close it in normal play, so the
   cutscene hangs.
7. Use `{move}` / `{face}` steps rather than awaiting world promises in a `do` (§5.5).

---

## 6. `busyRun(fn)` (11:224-231)

The wrapper for player-initiated actions during roam: hotspot actions, inventory actions, roam hints, `hotspots.trigger`.

```js
async function busyRun(fn) {
  const g = G;
  flow.busy = true; player.enabled = false; ui.prompt(null); hotspots.reset();
  try { await fn(); } catch (e) { console.error('RUE: action failed', e); }
  if (g !== G) return;
  flow.busy = false;
  if (flow.roaming) player.enabled = true;
}
```

- While busy: no hotspots, no inventory key, no SWAP, and **roam's `until` is not tested**. A flag that ends a roam,
  set mid-action, ends it only after the whole action finishes.
- It is not a cutscene (`cutDepth` unchanged): no Skip Scene, no hold-NO, unless the action calls `playCutscene` (hotspot
  `steps` do).
- **Nested busyRun clears `busy` early.** `c.hotspots.trigger(id)` from inside another hotspot's action (25:504) ends
  with `flow.busy = false` and re-enables the player while the outer action is still finishing.

---

## 7. Hotspots

### 7.1 Fields

| Field | Type | Default | Meaning |
| --- | --- | --- | --- |
| `id` | string | required | Name for `trigger`, logs (`hotspot <id>`), the door's `door_seen_<id>` flag. Also the location if `at` is absent |
| `at` | `[x, y, z]` \| actor id \| anchor \| mark | `id` | §7.2 |
| `r` | m | 1.2 | Trigger radius (2-D, x/z only) |
| `verb` | string | `'Examine'` | Prompt `YES — <verb>`. `'YES'` / `'NO'` show bare; `verb: 'NO'` makes **NO** the key |
| `by` | speaker id | `state.active` | Who speaks `text` |
| `when` | `(state) => bool` | — | Live only while true. **Called every tick for every spot**: cheap, no allocation |
| `only` | actor id | — | Live only when `state.active === only` |
| `once` | bool | false | After a completed fire it is never live again this scene. With `flag`, it is also dead whenever that flag is already set (e.g. after Continue) |
| `flag` | string | — | Set to `true` when the fire completes (§7.4) |
| `text` | string \| string[] \| `{ actorId: string }` \| array of those | — | Spoken line(s) (§7.5) |
| `kettle` | true | — | The save ask (§7.8) |
| `ask` | `{ q, yes, no, test, yesDisabled, noDisabled }` | — | A YES/NO question (§7.6) |
| `steps` | steps \| cutscene id | — | `playCutscene(steps, { letterbox: false })` |
| `door` | `{ to, kind, first }` | — | §7.9 |
| `do` | `(c) => …` | — | Arbitrary action, awaited |
| `use` | `{ itemId: steps \| fn }` | — | Item-on-spot actions (§7.7) |
| `sample` | `SAMPLES` key | — | Hold YES 1 s to record (§7.11) |
| `_n`, `_set`, `_x`, `_z` | internal | | Written onto the object by the engine (§7.13) |

A spot needs at least one action (`text`, `steps`, `ask`, `use`, `kettle`, `door`, `do`) or a recordable `sample`, or it
is never live (11:238, 11:243).

### 7.2 Liveness and location (11:239-257)

`live(h)` is false if: the spot is in `used`; or `once && flag && state.flags[flag]`; or `only` is set and isn't the
active character; or `when(state)` is false; or it has no action and can't record.

`where(h)` resolves `at ?? id`:

| `at` | Position | Note |
| --- | --- | --- |
| `[x, y, z]` | `x, z` | Fixed |
| actor id | that actor's live `pos` | Follows the actor. **Hidden when that actor is the player** (you can't talk to yourself; after a swap the other one becomes talkable) |
| anchor name | `anchor.at` | Resolved once per set (cached on the spot) |
| mark name | the mark's position | Same |
| none of these | — | Not live in this set (NaN) |

The actor lookup comes first, so an actor id shadows an anchor of the same name (`at: 'luka'` follows Luka, 23:248).

### 7.3 Picking, prompts and keys (`update`, 11:265-298)

Every roaming tick: the nearest live spot within `r` of the player (x/z distance) is `best`. When `best` or the selected
item changes, the prompt is re-labelled:

| Situation | Prompt |
| --- | --- |
| An item is selected | `YES — Use <item name>` |
| Normal | `YES — <verb>` (`YES`/`NO` verbs bare) |
| Recordable and has an action | `YES — <verb> · hold to record` |
| Recordable only | `YES — Hold to record` |

- NO with an item selected puts the item away, near a spot or not.
- The key is NO for `verb: 'NO'` (and no item selected), else YES. On the key: a recordable spot (no item) starts the
  record hold (§7.11); otherwise `busyRun(() => fire(best))`.
- The prompt only changes on a change of `best`, so a prompt set by content (the 1.1 controls tutorial, 23:111) stays
  until the first spot comes into range.

### 7.4 Firing (`fire`, 11:334-359)

```
sel = inventory.selected; inventory.selected = null; log 'hotspot <id> [use <sel>]'
if sel:  u = h.use?.[sel]
         no u  → say(active, "That won't work.")  → return (no flag, no once)
         u     → runAny(u)                         → done = true
else:    text  → speak
         kettle→ ask "Put the kettle on?"  NO → return
         ask   → ask(q, h.ask); run yes/no branch;  NO → return
         steps → playCutscene(steps, { letterbox: false })
         door  → door(h)
         do    → await h.do(c)
         done = !h.use          (a spot with `use` only completes through the right item)
if done && flag → setFlag(flag, true)
if done && once → used.add(h)
if the kettle boiled → saveGame() and toast 'Saved.' (only if storage worked)
```

Actions combine in that order: `text` then `kettle` then `ask` then `steps` then `door` then `do`. Examples:
`{ text: 'Close enough.', kettle: true }` (27:350); `door` + `do` for a dressing step after arriving (23:226, 27:352).

### 7.5 Text forms (`speak`, 11:299-304)

| Form | Behaviour |
| --- | --- |
| `'line'` | `say(by ‖ active, line)` |
| `['a', 'b', 'c']` | One per fire, cycling (`h._n`); **wraps around** after the last |
| `{ chase: '…', luka: '…' }` | The active character's line; otherwise the **first key's**. Without `by`, the key is the speaker |
| `[{…}, {…}]` | Cycles, then picks per character |

`say` is called with no options: no `tag`, `speed`, `name`. Use `steps` for anything styled. Rue's talk spot
(23:248): `{ id: 'luka', at: 'luka', r: 2.5, verb: 'Talk', by: 'luka', text: ['Morning.', 'Still down.', "Don't touch the monitor. It can smell fear."] }`.

### 7.6 `ask`

`{ q, yes, no, …askOptions }`. `ask(q, h.ask)` (so `test`, `yesDisabled`, `noDisabled` work), then `runAny` of the
chosen branch (steps or function). **NO stops the fire**: nothing after it (`steps`, `door`, `do`) runs, and no
`flag`/`once`. Rue (23:218-221):

```js
{ id: 'door_sign', at: 'door_sign', r: 1.0, verb: 'Flip sign', once: true, flag: 'sign_open',
  ask: { q: 'Flip it to OPEN?',
    yes: [{ face: 'chase', to: 'door_sign' }, { prop: 'door_sign', fn: (o) => o.userData.flip() }, { sfx: 'whoosh', vol: 0.3 }, { wait: 0.5 }, ...tick('sign_open')],
    no: [{ say: 'chase', text: 'Tempting.' }] } },
```

### 7.7 `use`: an item on a spot

Select an item in the inventory (Use), walk to a spot, press YES. `use[itemId]` runs (`runAny`), and the fire completes
(flag, once). A wrong item says "That won't work." and the spot stays. A spot that has `use` **never completes without
it**: its plain YES actions run but set no flag (11:354). Rue (25:500-505) mixes a plain locked-door line with the
lanyard key. Autoplay selects the item by hand: `c.inventory.selected = 'lanyard'; await c.hotspots.trigger('office_locked');` (25:532).

### 7.8 `kettle`: the save point (11:305-313)

`ask('Put the kettle on?')`. YES: the player faces the spot, `sfx('kettle')`, two steam puffs at `at ?? id` (1.8 s and
3.2 s in), then after flags are set, `saveGame()` and `Saved.`. The save stores the **whole `state` with
`state.scene` = this scene**. Continue restarts the scene from its first step with these flags already set, so content
must be written to re-enter (§13.8). Under autoplay the ask answers YES, so kettles save during test runs.

### 7.9 `door` (11:314-333)

`door: { to, kind = 'jarvis', first }`. `to` is a mark name, a `[x, y, z, rotY]` array, or `{ set, mark, env }`.

| Kind | Sequence |
| --- | --- |
| `'jarvis'` (default) | Pop-up "JARVIS is loading this door." with a spinner and no buttons. The first time (flag `door_seen_<id>`, written directly into `state.flags`), `first` steps play alongside. Waits `max(2 s, first)`, closes the pop-up, then a **jump cut** |
| `'wood'` | `sfx('creak')`, fade to black 0.35 s |
| anything else (`'slide'`) | `sfx('door_slide')`, no fade |

Then: if `to.set` differs from the current set, fade to black (0.25 s, unless wood already did) and `loadSet(set, env)`.
Then `placeParty(mark)`: **`world.spawn`** the active character at the mark (spawn, not place, so actors move across
sets) and the follower 0.8 m behind the mark's facing, re-take control, then fade in (0.35 s, not awaited) if wood or a
set change. Notes:

- `to` must contain a mark; `{ set }` alone spawns at `undefined`.
- The follower offset needs a mark **array or a mark name** (`world.mark`). An anchor name puts the leader right but not
  the follower.
- Put the landing point a step past the doorway so the follower lands on the right side too (25:506-507).

### 7.10 `do`

`do: (c) => …`, awaited, after everything else. Used for one-off logic (`clockInsert`, 23:247), for mini-games launched
from a spot (`keypad`, 25:166), and for dressing after a door. A `do` that sets a camera shot must release it itself
(`return c.cam.release()`, 25:158): only `playCutscene` releases.

### 7.11 Sample recording (11:237, 11:268-282, 11:296)

`canRecord(h) = !!h.sample && inventory.has('recorder') && !state.samples.includes(h.sample)`.

Press YES (no item selected) on a recordable spot → the player freezes. Held 0.2 s → prompt `YES — Recording…` and
`sfx('dictaphone')`. Held 1 s → `sfx(SAMPLES[k].sfx ‖ 'beep')`, `learnSample(k)` (toast), player free. Released earlier
→ the spot's normal action (if it has one). Recording sets no `flag` and no `once`. Under autoplay, record with
`c.runSteps([{ sample: 'beep' }])` (28:412).

### 7.12 The `hotspots` object (11:360-368)

| Member | Meaning |
| --- | --- |
| `list` | The live array. `start` replaces its contents. Content may `push` spots at runtime (they persist until the next `start`) |
| `used` | `Set` of spent `once` spots |
| `update(dt)` | The per-tick picker (called by `tick` while roaming) |
| `reset()` | Forget the nearest spot and any record hold, so the prompt is re-evaluated next tick |
| `trigger(idOrSpot)` → Promise | `busyRun(() => fire(h))`. **Ignores `when`, `only`, `once`, `used` and distance.** Honours `inventory.selected`. Unknown id → warn, resolve |

### 7.13 Hotspot gotchas

- State written onto hotspot objects survives scene restarts: the `text` array index `_n` keeps cycling after Continue,
  and the anchor cache keys on the set id.
- Distance is 2-D. Spots on different floors at the same x/z overlap.
- `when` and `where` run every tick for every spot; keep lists short and predicates allocation-free.
- The prompt for `kettle` reads `YES — Use` only if `verb: 'Use'` is given (23:246).
- `trigger` fires spots that the player could not (good for autoplay, dangerous in content).

---

## 8. Inventory and `ITEMS`

### 8.1 `inventory` (11:372-404)

| Member | Meaning |
| --- | --- |
| `selected` | Item id armed by **Use**, or `null`. The next hotspot fire consumes it; NO puts it away; roam end and `stop()` clear it |
| `has(id)` | `state.inventory.includes(id)` |
| `add(id)` | Push if new, `emit('item:add', id)` (no toast; the `{item}` step toasts) |
| `remove(id)` | Remove; clear `selected` if it was it |
| `open()` | Open the BAG panel (modal) |

`open()`: `free = (flow.roaming || mg) && !flow.busy && !cutDepth`. The player is frozen while it is open and restored
to its previous `enabled` on close. Actions:

| Panel action | Effect (only when `free`; otherwise it just closes) |
| --- | --- |
| Examine | `busyRun`: `ITEMS[id].examine` via `runAny`, else `say(active, desc ‖ name)`. Then if `flip`: `ask(flip.q ‖ 'Flip it?', flip)` → `runAny(flip.steps)` |
| Use | `inventory.selected = id`, toast `Using: <name>` |
| Combine a + b | `ITEMS[a].combine[b] ‖ ITEMS[b].combine[a]` via `runAny`, else "That won't work." |

The `inventory` key works only while roaming; the pause menu's Inventory calls `open()` at any time, but outside free
play its actions silently do nothing. Under autoplay the panel closes itself after 0.5 s (10:182).

### 8.2 `ITEMS[id]`

| Field | Meaning |
| --- | --- |
| `name` | Label (slot, toasts, prompts) |
| `desc` | One-line description (panel; default Examine line) |
| `icon(cx, w, h)` | Painter for the 96 px slot. Absent → a tag with the initial |
| `examine` | Steps or `(c) => …` (25:31-36, 26:115-121 waits for YES on a card) |
| `flip` | `{ q, steps, …askOptions }` |
| `combine` | `{ otherId: steps \| fn }` (either side may define it) |

Rue's content never uses `flip` or `combine`; both work.

---

## 9. Roam (11:460-487)

`['roam', { until, hint, auto }]` hands control to the player until a goal is met.

| Option | Form | Meaning |
| --- | --- | --- |
| `until` | flag \| flag[] (all) \| `(state) => bool` \| omitted | The goal. Tested every tick while not busy. **Omitted = never ends** in real play |
| `hint` | `{ after = 120, steps }` | Once, `after` s of game time from roam start, `busyRun(playCutscene(steps, { letterbox: false }))` |
| `auto` | `async (c) => …` | Autoplay's way of solving the roam |

**Real play:** if a cutscene camera is still up, `cam.release()` (0.8 s, not awaited: a mini-game's shot straight into
play eases back). `flow.roaming = true`, player enabled, hotspots reset, swap indicator. Then `waitUntil`: stale `G` →
out; busy, inventory open or a cutscene running → keep waiting; `until` solved → out; hint due → fire it. On exit:
`roaming = false`, player disabled, `inventory.selected = null`, prompt and swap indicator off.

**Autoplay (`TEST.auto`):** `flow.roaming` is **never set**. If `auto` exists, `await auto(c)`; else, unless `until` is a
function, every `until` flag is set. Then a warning if `until` is still unsolved. Rue's `auto` patterns:

```js
async auto(c) {                                                   // trigger every spot, optional ones too, for coverage (23:257-259)
  for (const id of ['door_sign', 'wall_switch', 'monitor', 'noticeboard', 'luka', 'backroom_door', 'bag', 'wall_clock']) await c.hotspots.trigger(id);
},
async auto(c) { const a = c.world.actor(state.active); await a.moveTo([6, 0, -6]); },   // positional `until` (27:370)
async auto(c) { await c.runSteps([{ sample: 'beep' }, { sample: 'dynamo' }]); await c.hotspots.trigger('bike_next'); },   // samples (28:412)
```

Hints, from Rue (27:153, 27:361, 28:211): a character points or speaks; an `if` picks the nudge by progress; a toast
teaches a control.

---

## 10. The mini-game host

### 10.1 `MINIGAMES[id]` contract (01:34)

| Member | Called | Notes |
| --- | --- | --- |
| `start(params, api)` | Once, synchronously, by `flow.minigame` | `params` is also `api.params`. Set up DOM in `api.ui`, the overlay, the camera (`api.cam.shot(params.shot)`) |
| `update(dt)` | Every fixed tick from the flow tick, unless paused by `api.play` or the inventory panel | Game logic. Runs **before** `world.update` (so moving actors here is not interpolated, `04-world.md` §13) |
| `draw()` | Every rendered frame (`'render'`), even while paused | Paint only; no state advance (it also runs while the game is paused from the menu) |
| `end(result)` | Once, from `api.finish` | Remove DOM, stop own audio handles, restore props. Wrapped in try/catch |
| `autoplay(api)` | Under `?autoplay=1`, after `start` | Reach the same end state and `api.finish(…)`. May be async |

### 10.2 `flow.minigame(id, params)` → Promise\<result\> (11:411-441)

1. Unknown id → warn, resolve `{ missing: true }`.
2. Log `minigame <id>`. Clear and **show** `#overlay`, empty `#mg`.
3. Build `api`, set `mg`, call `m.start(api.params, api)`. A throw → `finish({ error: true })`.
4. Autoplay: `autoplay(api)` (a rejection → `finish({ error: true })`), or, with no autoplayer, `finish({ auto: true })`
   after 0.5 s.
5. `api.finish(r)` (first call only): `mg = null`, `m.end(r)`, clear and hide the overlay, empty `#mg`,
   `flow.result = r`, resolve `r`.

`update`/`draw` throws also finish with `{ error: true }`; `flow.stop()` finishes with `{ aborted: true }`. The host
does not touch `player.enabled` (the scene step disables it; a hotspot `do` is inside a busyRun).

### 10.3 `api` members (11:418-431)

| Member | Is |
| --- | --- |
| `finish(result)` | End the game (idempotent per run) |
| `params` | `params ‖ {}` |
| `state` | `state` at start |
| `overlay` | `{ canvas, ctx, w, h, show(bool) }`: the full-screen 2-D canvas. `w`/`h` are getters in CSS px; the context already has the DPR transform (02:203). Shown at start, hidden at finish |
| `ui` | The `#mg` DOM element. Append your DOM here (it is emptied at start and finish) |
| `world`, `cam`, `input` | As usual |
| `sfx(name, o)` | Global `sfx` |
| `AUDIO` | `AUDIO` or `null` |
| `say`, `ask`, `choose`, `popup`, `hud` | UI |
| `play(steps)` → Promise | Runs steps with `runSteps` while `update` is paused (a counter, so nests). **Not a cutscene**: no letterbox, no skip, no hold-NO, no closing camera release. Re-apply your shot afterwards (14:49) |

### 10.4 Patterns from Rue

- **Shot param.** Every overlay game takes `params.shot` and applies it in `start` (12:376, 14:63), so the camera is
  right even if the cutscene before it was skipped.
- **Lines inside a game.** `params.lines` step lists played with `api.play`, then the shot re-applied (14:46-50; the
  1.4 call site is 25:171-176).
- **Results.** Anything: `{ crashed, reason }`, `{ rips, alarms }` (handing live alarm loops back to content),
  `{ order }`, `{ failed: true }`.
- **Autoplay re-entry.** `start` has already run when `autoplay` is called; Rue's games either re-init
  (`if (phase === 'end' || api !== a) M.start(a.params || {}, a);`, 12:486) or jump to the end state and finish
  (14:160-169). Autoplay must set the same flags/state the real game sets (12:487-490).
- **Retry until success** from a `do` (28:399-403):

  ```js
  for (;;) {
    const r = await c.flow.minigame('pedal', { session: n, band, rider: 'luka' });
    if (!r || !r.failed) break;
    band = [band[0] - 5, band[1] + 5];
  }
  ```
- **From a hotspot**, with a callback param the game awaits (25:140-158): `onSubmit(code)` says a line and returns
  whether to close. Afterwards the `do` plays a follow-up cutscene or `return c.cam.release()`.
- **No allocation in `update`/`draw`.** Cache gradients by size (14:96-100), touch the DOM only on change (12:470-477).

---

## 11. Grants, scene select, Continue, saves

`grant(g)` (11:28-34), applied for every scene **before** the target in `SCENE_ORDER` on `start(id, { select: true })`:

| Key | Effect |
| --- | --- |
| `flags` | `Object.assign(state.flags, g.flags)` |
| `items`, `names`, `samples`, `bugs` | Pushed into `state.inventory` / `names` / `samples` / `bugs` if missing |
| `removeItems` | Removed from `state.inventory` (given away in that scene, 33:475) |
| `battery`, `bars`, `pattern`, `active` | Copied if present |

Rules: grants are **only** used by scene select and `?scene=`, never in normal play, so they must mirror everything a
real playthrough leaves behind that later scenes read (flags set by roams and mini-games included, e.g. 24:164). A
scene's own grants are not applied when it is selected. Grants don't emit events or toast.

| Save path | What happens |
| --- | --- |
| Scene start (not `P`) | `saveGame()` (11:566) |
| Kettle YES | `saveGame()` after the spot's flags (11:358) |
| `['save']` | `saveGame()` |
| Continue | `state = loadGame(); flow.start(state.scene)`: the scene restarts **from its first step with the saved flags** (10:790) |

---

## 12. Autoplay and test behaviour, by piece

| Piece | Under `?autoplay=1` |
| --- | --- |
| `say` | Advances 0.15 s after typing ends |
| `choose` / `ask` | After 0.3 s: `test`, else the first enabled option / `test ?? true` |
| Pop-ups with buttons | Press the first non-dodging button after 0.3 s |
| Inventory panel | Closes after 0.5 s |
| Roam | `auto(c)` or set the `until` flags; warn if unsolved |
| Mini-game | `start`, then `autoplay(api)` or `finish({ auto: true })` after 0.5 s |
| `P` | Runs into `1.1` instead of the title |
| End | After `TEST.stop` or `PC`, or an unbuilt scene: `RUE_TEST.done = true` |
| `&fast=1` | Every cutscene runs skipped: no shots, no lines, no sfx; all state steps and `do`s apply |
| Logs | `scene <id>`, `scene <id> step <i> <kind> [<arg>]`, `cutscene <id>`, `hotspot <id> [use <item>]`, `minigame <id>`, `scene <id> end`, `end of built content` |

---

## 13. Authoring cookbook (from Rue's 23 and 24)

### 13.1 How a content file is laid out

```js
// ============================================================ CONTENT: 1.2 ("Margarine") and 1.3 ("Language Detected")
// SPEC §9. Every line is final and word for word; '^' = a (beat). Shot tags are quoted in the comments.
(() => {
  const PI = Math.PI, H = PI / 2;
  // ---- shared shots and helpers (run from `do` steps, never per frame)
  // ---- CARDS painters this file owns (CARDS.jmon, CARDS.deadphone), with .size
  // ==== 1.2 — "Margarine"
  SCENES['1.2'] = { … };
  CUTSCENES['1.2_open'] = [ … ];
  …
})();
```

- One IIFE, **no top-level names**. Everything registers into `SCENES`, `CUTSCENES`, `CARDS`, `ANIMS`, `ITEMS`.
- Order inside: constants, helper functions, shared shot constants and step factories, CARDS, then per scene the
  `SCENES[id]` and its `CUTSCENES[id_…]`. Cutscene ids are `<scene>_<beat>` (`1.1_arrival`, `1.2_wait1`).
- A new anim is registered guarded, and flagged as an upper-body anim so legs keep walking (23:55-62):
  `if (!ANIMS.bop) { ANIMS.bop = (r, t, p) => { if (!p.walk) ANIMS.idle(r, t, p); … }; ANIMS.bop.upper = true; }`.
- A new card painter: `CARDS.flyer = (cx, w, h, d) => { … }; CARDS.flyer.size = [800, 500];` (23:128-139).

### 13.2 How shot tags in a script become steps

Each script tag stays as a `// [TAG] description` comment above its steps. The translations Rue used:

| Script tag | Steps | Where |
| --- | --- | --- |
| `[BLACK]` sound only | `{ fade: 'out', dur: 0 }` … `{ fade: 'in', dur: 0.5 }` | 23:160-164 |
| `[ECU · locked]` on a prop | An explicit `CAM` constant, reused for the bookend shot | 23:143, 161, 202 |
| `[INSERT · slow track along the desk]` | Two chained `CAM` glides (`to`, `dur: 3.5`, `ease: 'out'` then `'in'`), each followed by `{ wait: 3.5 }` | 23:168-171 |
| `[WIDE · high, from the far corner]` | `{ shot: 'SET', cam: 'corner_high' }` | 23:173 |
| `[OTS · behind Rue]` at a calendar | `{ shot: 'INSERT', at: 'calendar_ots' }` (an anchor used as a lens) | 23:181 |
| `[INSERT]` readable object | `{ shot: 'INSERT', at: 'postit', card: ['postit', { text: 'JARVIS DOWN 8:52 — L.' }] }` | 23:307 |
| `[CLOSE · Rue]` | `{ shot: 'CLOSE', on: 'rue58' }` | 23:190 |
| `[CLOSE · slow push-in]` | `{ shot: 'CLOSE', on: 'rue58', move: 'push', amount: 0.85, dur: 6, dist: 1.25 }` | 23:194 |
| `[CLOSE · Chase, chest-up]` | `{ shot: 'CLOSE', on: 'chase', dist: 1.4 }` | 23:311 |
| `[CRANE · down out of a blazing blue sky]` | `CAM` glide from `[−2, 30, 30]` to street level, `dur: 7`, then `{ wait: 7 }` | 23:273-274 |
| `[TRACK · behind Chase]` | `{ shot: 'MID', on: 'chase', move: 'track', track: 'behind' }` + an awaited `{move}` | 23:276-277 |
| `[WIDE · low, from behind the counter]` | `CAM` with `get fov() { return fit(50); }` | 23:288 |
| `[JARVIS-CAM]` | `{ shot: 'JARVIS', at: 'monitor', on: 'luka' }` | 23:295 |
| `[JARVIS-CAM · locked]` | `{ shot: 'JARVIS', at: 'monitor', on: ['luka', 'chase'], locked: true }` | 24:376 |
| `[PUSH IN · slow, into the TV]` | `CAM` glide `dur: 4.5`, and the line in a `par` with `{ wait: 4.5 }` so the move always lands | 23:345-347 |
| `[TWO-SHOT]` where a fitted TWO lands behind a wall | An explicit `CAM` with `fit(60)` | 23:349-350 |
| `[MID · Chase, from slightly above]` | `{ shot: 'MID', on: 'chase', height: 0.45 }` | 24:211 |
| `[CLOSE · Margaret, eye level]`, reused | `const MARGARET = { shot: 'CLOSE', on: 'margaret' }` | 24:18 |
| `[WIDE · locked, from the back of the store]` | `const EXIT_WIDE = { shot: 'CAM', … }` | 24:20 |
| `[TOP-DOWN · directly above Chase]` | `{ place: 'chase', at: SLUMP }`, then `{ shot: 'TOP', on: 'chase', dist: 1.5, offset: 0.25 }` | 24:23-24, 290-291 |
| `[LOW · floor level, TILT UP]` | A low `CAM`, then the same `CAM` with `to: { look: […] }`, `dur: 2.2`, `{ wait: 2.3 }` | 24:322-326 |
| `[PULL OUT · slowly]` | `CAM` glide `dur: 6, ease: 'out'` | 24:400 |
| `[ECU]` on a screen | `MON(data, 26)`: an INSERT at a point with a zoomed card | 24:15, 259 |

Patterns around shots:

- **A `CAM` move is not awaited.** Follow it with `{ wait: dur }` or put the next line in a `par` with a wait.
- **Place under the cut.** Teleport actors before the shot that reveals them (24:328: Dazza is at the counter by the time
  we're on Luka; 24:278 before `EXIT_WIDE`).
- **Reused framings as constants** keep a character's eye level identical every time (24:17-18).
- **`fit(fov)` with a getter** (23:66): the FOV is computed when the shot runs, at the current window size:

  ```js
  const fit = (fov) => Math.min(80, Math.max(fov, 2 * Math.atan(Math.tan(fov * PI / 360) * 16 / 9 * innerHeight / innerWidth) * 180 / PI));
  { shot: 'CAM', pos: [5.5, 1.1, -12.2], look: [4.6, 1.35, -2.2], get fov() { return fit(50); } },
  ```

### 13.3 Lines

- Every line is a `{ say, text }` step, word for word; `^` is a beat (23:308, 23:319).
- Speaker styling on the step: `tag: 'intercom'` / `'on video'` / `'off'`, `speed: 'slow'` (23:176, 343, 191).
- Timed exchanges: `auto: 0.7` advances by itself (24:380).
- The censor: `{ say: id, text, censor: msg }` types to the dash and slams a pop-up on the speaker. `cuss()` wraps it so
  a dismissed pop-up comes straight back (24:57-61):

  ```js
  function cuss(id, text, msg = LANG) {
    let n = 0;
    return [{ do: (c) => { n = c.popup.count(); } }, { say: id, text, censor: msg },
      { do: (c) => { if (!c.flow.skipping && c.popup.count() <= n) c.popup({ msg, icon: 'warn', buttons: ['OK'], at: { actor: id }, ding: false }); } }];
  }
  …cuss('luka', 'You absolute useless piece of—'),        // spread into the cutscene (24:379)
  ```

### 13.4 Step factories and helpers

Helpers return **steps or step arrays** so cutscenes stay declarative, and do work only from `do` steps, never per frame.

| Helper | Code | Use |
| --- | --- | --- |
| `tick(flag)` | `[{ flag }, { sfx: 'pop', vol: 0.5 }, { do: duties }]` (23:105) | Spread at the end of a duty's steps: `...tick('wall_on')` |
| `duties()` | `objective.list([{ text, done: !!f.sign_open }, …])` (23:97-104) | Objective sub-items computed from flags |
| `into(shot)` | `({ do: (c) => { c.cam.shot(shot); c.cam.cutscene = false; } })` (24:9) | Hold a shot into the next mini-game (§13.7) |
| `screen(mode)` | `{ prop: 'monitor_screen', fn: (o) => o.userData.show(mode) }` (24:13) | Drive a prop's own state API |
| `MON(data, fov)` / `jmon(data)` | INSERT shot with `card: ['jmon', data]` / `{ do: (c) => c.ui.card('jmon', data) }` (24:15-16) | Repaint the card in the same frame without a new shot |
| `mood(id, m)` | `{ do: (c) => { const a = c.world.actor(id); if (a) a.mood = m; } }` (24:62) | Actor fields that have no step |
| `storm(c, msgs, beats, grow)` | Pop-up per beat, loop ends on skip (24:27-33) | Rhythmic pop-up bursts |
| `dissolve(c)` | Card repaint loop with `mix`, ends on skip (24:35-37) | In-frame dissolves |
| `lamp(c, on)`, `lightsOut(c)` | Set the set's `world.torch` spot (23:8-13, 24:39) | Lighting beats |
| `setDownPolaroid(c)` | Self-removing `addUpdate` tween, `f(1)` when skipping (23:26-37) | Prop animation |
| `rueTalks(c, sec)` | Repaints a TV canvas on a self-removing updater; stops on skip (23:70-87) | Screen animation |
| `clockInsert(c)` | Computes the time from the clock prop, then `c.playCutscene([{ shot: 'INSERT', …, card }, { wait: 2 }], { letterbox: false })` (23:117-122) | A hotspot `do` that builds its steps at fire time |
| `patience(c)` | `c.cam.project(v)` → a pop-up placed over a 3-D point (24:41-45) | Screen-space UI on world objects |

### 13.5 Hotspots and examine lines (1.1 excerpt, 23:216-249)

```js
hotspots: [
  // --- the three duties: once + flag, each ends with ...tick(flag)
  { id: 'wall_switch', at: 'wall_switch', r: 1.0, verb: 'Use', once: true, flag: 'wall_on',
    steps: [{ face: 'chase', to: 'wall_switch' }, { sfx: 'clunk' }, { prop: 'wall_screens', visible: true }, { sfx: 'beep', vol: 0.5 },
      { shot: 'INSERT', at: 'phones' }, { wait: 1.4 }, ...tick('wall_on')] },
  // --- a JARVIS door with a first-time line and a follow-up
  { id: 'backroom_door', at: [6.4, 0, -23.3], r: 0.8, verb: 'Open',
    door: { to: [6.1, 0, -25.4, PI], kind: 'jarvis', first: [{ say: 'chase', text: 'Every. Single. Day.' }] }, do: doorOpened },
  // --- optional examine lines: one string each, gated with `when` where the joke needs a precondition
  { id: 'phones', at: 'phones', r: 1.2, when: (s) => !!s.flags.wall_on, text: "3%. It's always 3%. Nobody knows how." },
  { id: 'plant', at: 'pot_plant', r: 1.1, text: "It's plastic. It's still dying." },
  // --- a readable card, then a line
  { id: 'noticeboard', at: 'noticeboard', r: 1.0,
    steps: [{ shot: 'INSERT', at: 'noticeboard', card: ['flyer', { text: 'LANYARD REQUESTS: please allow 6–8 weeks' }] }, { say: 'chase', text: "It's been thirty-four weeks." }] },
  // --- a pop-up the player must dismiss, which also sets a bug flag
  { id: 'monitor', at: 'monitor2', r: 1.1,
    steps: [{ popup: { msg: 'JARVIS is starting… (this may take a while)', spinner: true, buttons: ['OK'] }, wait: true }, { flag: 'seen_popups' }] },
  { id: 'kettle', at: 'kettle', r: 1.0, verb: 'Use', kettle: true },
  { id: 'wall_clock', at: 'wall_clock', r: 1.1, do: clockInsert },
  { id: 'luka', at: 'luka', r: 2.5, verb: 'Talk', by: 'luka', text: ['Morning.', 'Still down.', "Don't touch the monitor. It can smell fear."] },
],
```

Conventions: `at` names a set anchor or mark whenever one exists (raw coordinates for doors); radius about 1.0 for
props, 2.0–2.5 for people and things seen through glass (23:241); `verb` only when "Examine" is wrong; examine lines are
one string, said by the active character.

### 13.6 Writing the scene's step list (1.1, 23:250-262)

```js
steps: [
  ['cutscene', '1.1_arrival'],
  ['control', 'chase'],
  ['objective', 'Open up the store.'],
  ['do', tutorial],                                         // controls prompt + music; duties() 1.2 s later
  ['roam', {
    until: ['sign_open', 'wall_on', 'bag_dropped'],
    async auto(c) {
      for (const id of ['door_sign', 'wall_switch', 'monitor', 'noticeboard', 'luka', 'backroom_door', 'bag', 'wall_clock']) await c.hotspots.trigger(id);
    },
  }],
  ['cutscene', '1.1_video'],
],
grants: { flags: { sign_open: true, wall_on: true, bag_dropped: true, seen_video: true } },
```

`auto()` rules: trigger the required spots in a valid order (doors before what's behind them), add optional spots so
their steps are exercised by every test run, select items with `c.inventory.selected = id` before a `use` spot, move the
active actor for positional goals, and make sure `until` is solved at the end (autoplay warns otherwise).

### 13.7 Entering a mini-game from a held shot

The cutscene before the game ends on the game's camera; the game's `params.shot` re-applies it (24:11, 24:180-183, 24:156):

```js
const into = (shot) => ({ do: (c) => { c.cam.shot(shot); c.cam.cutscene = false; } });
const OTS_CHASE = { shot: 'CAM', pos: [5.0, 1.74, -10.58], look: [2.92, 1.35, -8.33], fov: 45 };

CUTSCENES['1.2_open'] = [ …,
  { music: 'reddy_frantic', fade: 0.6 },
  into(OTS_CHASE),
];
steps: [
  ['cutscene', '1.2_open'],
  ['control', 'chase'],
  ['objective', "Add Margaret's grandson to her plan."],
  ['minigame', 'jarvis_sale', { cycle: 1, cap: 50, mode: 'margaret', time: '09:14', shot: OTS_CHASE }],
  ['cutscene', '1.2_wait1'],
  …
```

Why it works: a `do` runs even when the cutscene is skipped, so the shot is always set; `cam.cutscene = false` makes the
end of `playCutscene` skip its `cam.release(0.8)`, so there is no ease toward the gameplay camera between the cutscene
and the game. The alternative (25:169, 33:226): `['cam', 'fixed', SHOT]` **before** the cutscene, so the closing release
eases into the identical angle, then `['cam', null]` after the game. Side work during a game goes in a scene `do` that
does not return a promise: `['do', (c) => { const a = c.world.actor('chase'); if (a) a.moveTo([5.75, 0, -10.4, 0.35]); }]`
(24:309, Chase walks over while the Restart Ritual starts).

### 13.8 Continue-safety: dress from flags

Continue restarts a scene at step 0 with the saved flags and in a set that may still be live from before. The first
cutscene therefore re-dresses every prop the scene changes, from `state.flags` (23:40-52):

```js
function openingDress(c) {
  const P = (n) => c.world.prop(n), f = state.flags;
  P('door_sign')?.userData.set?.(!!f.sign_open);
  for (const [n, k] of [['wall_screens', 'wall_on'], ['bag_spot', 'bag_dropped']]) { const o = P(n); if (o) o.visible = !!f[k]; }
  …
}
CUTSCENES['1.1_arrival'] = [{ do: openingDress }, …];
```

Or it resets the scene's flags so the roam replays (27:171: `{ flag: 'machine_hidden', value: false }`; 30:81-89:
`resetDay()` deletes a list of flags, names and items). Scene-scoped runtime changes (a temporary collider, 23:47-51)
undo themselves from an updater that checks `flow.sceneId`.

### 13.9 Template for a TWO scene file

```js
// ============================================================ CONTENT: 1.1 ("Spotless")
// BUILD_PROMPT §8. Every line is final and word for word; '^' = a (beat). Shot tags are quoted in the comments.
(() => {
  const PI = Math.PI;
  const into = (shot) => ({ do: (c) => { c.cam.shot(shot); c.cam.cutscene = false; } });
  const POLISH = { shot: 'CAM', pos: [0, 2.2, 0], look: [0, 0.9, 0.01], fov: 40 };   // placeholder numbers
  function dress(c) { const f = state.flags; /* set every prop this scene changes from f */ }

  SCENES['1.1'] = {
    title: 'Spotless', set: 'reddy26', env: 'day', time: '…',
    playable: ['luka'], swap: false, hud: null, music: 'radio',
    spawn: { luka: 'hero_table' },
    hotspots: [ /* examine lines, the kettle, duties with once + flag */ ],
    steps: [
      ['cutscene', '1.1_open'],
      ['minigame', 'polish', { shot: POLISH }],
      ['cutscene', '1.1_call'],
      ['control', 'luka'],
      ['roam', { until: 's11_…', hint: { after: 90, steps: [/* a nudge */] }, async auto(c) { /* trigger spots */ } }],
      ['cutscene', '1.1_bam'],
    ],
    grants: { flags: { /* everything later scenes read */ } },
  };
  CUTSCENES['1.1_open'] = [
    { do: dress },
    // [WIDE · …]
    { shot: 'WIDE', on: 'luka' },
    { say: 'luka', text: '…' },
    into(POLISH),
  ];
})();
```

---

## 14. How to extend for TWO

### 14.1 What the spec needs from FLOW, and where to put it

| TWO need (BUILD_PROMPT / ARCHITECTURE) | Change in `32-flow.js` |
| --- | --- |
| **Branching after 3.7** (`state.choice` → A1… or B1…), `next(state)` on a scene (ARCH §3.3) | In `next()` (11:529): `const sc = SCENES[flow.sceneId]; const nx = sc && sc.next ? sc.next(state) : SCENE_ORDER[SCENE_ORDER.indexOf(flow.sceneId) + 1];`. Keep A1, A2, B1, B2 in `SCENE_ORDER` for Chapter Select; give A2 `next: () => 'C'` so it does not fall into B1 |
| **Branch-aware grants** for Chapter Select | `grant` walks `SCENE_ORDER` linearly (11:546): selecting B1 would apply A1 and A2 grants. Give branch scenes a `branch: 'A'\|'B'` field, skip the other branch's scenes, and set `state.choice` |
| TWO state in grants (`choice`, `hack`, `quiet`, `pattern`, `santa`, …) | Extend the scalar list at 11:33, or add a generic `g.state` merge |
| **Time cards** (`time`, `place`, `timeCard: false`) (ARCH §5) | In `start`, after the act card (11:567-571), e.g. `if (sc.time && sc.timeCard !== false) await ui.timeCard(sc.time, sc.place)`; it must snap when skipping and not be awaited longer than ~2 s |
| **Three playables**; SWAP cycles; the others follow or hold (§9, ARCH §5) | `otherPlayable` already cycles a list (11:61-64). `flow.follow` must become a list and `player.follower` must support several followers (a world change); `doSwap` (11:69-75) then rotates the list. Add a per-actor "hold here" state for "Hold this" |
| **Samples** recorded by Chase with his phone, hold YES 1 s, a waveform card (§13.6) | `canRecord` (11:237): replace `inventory.has('recorder')` with `state.active === 'chase'`. Show the card in `learnSample` (11:23-27). Honour `options.holdToPress` (§13.9) by recording on press |
| **Kettle** in every set, Des says "Tea?" first (§13.1) | Already composes: `{ id: 'kettle', at: 'kettle', verb: 'Use', by: 'des', text: 'Tea?', kettle: true }` (text runs before the ask) |
| **Mini-game skip after two failures** ("Skip this?"), except the Choice (§9, §13.8) | Host: count failures (`api.failed()` or a `fails` field on `me`), expose `flow.mgSkippable`; the pause menu offers "Skip this mini-game" and calls `mg.api.finish({ skipped: true, ...m.skipResult })`. `MINIGAMES.choice.noSkip = true`. The skip result must leave the same state as a win (like `autoplay`) |
| **`&ending=A\|B`** under autoplay | Parse into `TEST.ending` (01:133-136); `MINIGAMES.choice.autoplay` finishes with it and sets `state.choice` |
| **Barks**: lines over gameplay that never pause it (boss, scooter, drones) | Not `say` (it owns the dialogue box and YES) and not `api.play` (it pauses `update`). Call `bark()` from `update` timers or roam `do`s |
| **Two-person switches** and the "Hold this" context action | A hotspot has one action key. Add a second action (e.g. `alt: { verb: 'Hold this', key: 'no', do }`) to `label`/`update`/`fire`, or model the pair as two spots with `only` and a shared flag |
| **Chip View** (CHIP key, only `chase40`, only while allowed) | Add `chip` to `CONFIG.keys`/`pad`/touch; read it in `tick` beside SWAP (11:449-452) so it only works in free play, and consume it otherwise |
| **Drone stealth roams**, the Safe Room and checkpoint retry (§9.5, §13.7) | Keep them inside a `roam`: the systems updater captures → `busyRun(safeRoom)` (blocks hotspots and `until`), then places the party at the zone checkpoint and resets drones. **Not** a scene restart (no `G` bump, no autosave) |
| Cleanup of systems on scene change / Quit to Title | `stop()` knows nothing about drones, Chip View, AR labels or content updaters. Add `emit('flow:stop')` in `stop()` (11:516) and have systems clear on it, or guard every updater with `flow.sceneId` like Rue |
| **The boss** (3.4–3.5): live hack %, waves, lines on schedule, then cutscenes at 85% | Either a mini-game (`update` drives the fight; `draw` the HACK bar) or a roam plus a systems updater. Moving drones from `update` runs before the interpolation copy (`04-world.md` §13): move them from the set's `update(dt, ctx)` or keep their `prev` in sync. The camera is a `cam.override('follow', …)`-style mode, not zones |
| **HUD** (NO SERVICE, QUIET IN, Samples, HACK %) | `start` (11:562) re-shows `{ battery, bars }` from state; change it to TWO's HUD fields, and make `hud: null` hide without wiping persistent HUD state |
| `CHARACTERS[id].actor` (e.g. `manager` → `luka40`) | The `say` step's `expr`/`act` cues use `world.actor(s.say)` (11:123). Map through `CHARACTERS[s.say].actor` |
| `'P'` and `'PC'` special cases | Hard-coded (11:566, 585-586, 584). TWO uses the same ids, so they keep working: no autosave on P, P goes to the title on first launch, PC completes the profile (TWO also records `profile.endingsSeen[state.choice]` there) |
| Hold NO (3.6 minigame "Hold NO") | `clock.scale` ×3 applies only while `cutDepth > 0`, so a mini-game can read `input.held('no')` freely. Don't play it inside a cutscene |

### 14.2 Performance rules as they apply to FLOW

- **No per-frame allocation** in: hotspot `when`, roam `until` functions, mini-game `update`/`draw`, content updaters.
  The flow tick itself allocates nothing (prompt strings are built only on change, 11:290). Never call `wait()` or
  `popup()` from per-tick code.
- **No building mid-game.** Steps and mini-games must not create materials, geometry or rigs. Everything a scene reveals
  (`{ prop, visible: true }`, a mini-game's 3-D props, a puff colour family) is built hidden in the set's `build()` and
  merged/instanced there, so `world.warm` compiles it at boot. Spawn only looks that boot adopted; a second simultaneous
  actor with the same look builds a rig mid-game (`04-world.md` §6.1).
- **Shader warm-up check.** Under autoplay the loop warns `shader compiled mid-game in <scene> step <n> (<cam>)`
  (36:43-46). Run every scene with `?autoplay=1` **without** `fast=1` too, because fast skips every shot, so a program
  that only a cutscene camera reveals is never compiled in a fast run.
- **Load behind black.** `['do', (c) => c.world.preload('lab')]` during the scene before (33:220), so a
  `set` step or the next scene's `start` finds the set built.
- **Mini-game DOM**: build once, reuse across runs (12:347), write styles only when values change.
- Keep hotspot lists per scene short; split big sets with `when` predicates on location (27:350).

### 14.3 Skip-safety checklist for every TWO cutscene

1. Test each scene with `&fast=1`: final state (props, flags, items, actor places and anims, env, music) must equal the
   unskipped run.
2. Every `do` either is pure state (safe), or returns early / snaps when `c.flow.skipping`.
3. No `while (…) await c.wait(…)` without `&& !c.flow.skipping`.
4. Poses that must persist are `{act}` / `{expr}` steps, not `say` cues.
5. Shots a mini-game or roam depends on are set from a `do` (`into`) or a scene `['cam', …]` step.
6. A time-lapse is followed by an explicit `{ env }`.
7. Stares stay ≤ 4 s (the engine caps them) and are marked in the script.

---

## 15. Gotchas, consolidated

1. **`do` steps run while skipping.** Every cosmetic `do` must check `c.flow.skipping`; loops that `await c.wait()`
   without that check freeze the page under a skip or `&fast=1`.
2. **A step object is dispatched on its first matching key** in the order of §5.3. One step per object.
3. **Shots, lines, sfx, stares, titles and pop-ups vanish when skipped**, including a `say` step's `expr`/`act` cues.
   State never belongs on them.
4. **Continue restarts the scene at step 0 with the saved flags** (kettle saves are mid-scene). Dress props from flags or
   reset the scene's flags in the first cutscene.
5. **Grants only matter for scene select and `?scene=`,** and they accumulate linearly through `SCENE_ORDER`. Missing
   grants break only those paths; TWO's branches need branch-aware accumulation.
6. **`G` cancels the runner, not your promises.** Guard deferred content with `flow.sceneId`.
7. **A roam without `until` never ends** in real play and ends at once under autoplay.
8. **`hotspots.trigger` ignores `when`, `only` and `once`**; nested `trigger` inside an action clears `flow.busy` early.
9. **A spot with `use` never completes by plain YES**; `ask` NO stops the fire before `steps`/`door`/`do`.
10. **`face`, `act`, `env`, `hud … anim`, `split`, and every `CAM` move are not awaited**; add waits.
11. **`hud: null` on a scene nulls `state.battery` and `state.bars`.**
12. **`{ popup: { buttons: [] }, wait: true }` without `dur` hangs** in real play.
13. **`api.play` is not a cutscene**: no letterbox, no skip, no release; the mini-game must re-apply its shot.
14. **Mini-game `update` runs before the world's interpolation copy**; actors moved there stutter.
15. **`flow.stop()` leaves pop-ups, cards, objective and letterbox** until the next `start`'s clean slate, and knows
    nothing about content systems.
16. **An unbuilt scene ends the run** (`theEnd`) instead of skipping to the next built one.
17. Hotspot objects carry engine state (`_n`, `_set`): text cycles don't reset on Continue.
18. `clock.scale` is rewritten every tick by the flow; content cannot change game speed through it.
