# ENGINE — index and quick reference

> **TWO's engine has since moved on** (engine phase + integration): where this page or a manual disagrees with
> `docs/ARCHITECTURE.md` §5 (CRASH `fov`/`zoom`, OTS, LOW/HIGH `size`, `liveMax` 3 by default, the split's live right
> half, `camR.aspect`, line numbers), **ARCHITECTURE §5 and the source headers win**.

TWO runs on RUE's engine: one HTML file, Three.js r186 and synthesised audio and textures. The manuals in
`docs/engine/` document that engine from `ref/rue/` with `file:line` citations. TWO's `src/` engine fragments are
verbatim copies (renames only: `RUE_TEST` → `TWO_TEST`, `'rue.save'` → `'two.save'`, log prefix `RUE:` → `TWO:`) with
the **same line numbers**. None of TWO's own APIs exist yet: `bark`, SafeSense pop-ups, `hud.hack`, CHIP input,
three-way follow and time cards (ARCHITECTURE §5), and `scene.next` (§3.3). Each manual's "How to extend for TWO"
section says where they go.

| Rue (`ref/rue/`) | TWO (`src/`) | Manual |
| --- | --- | --- |
| `00-head.html`, `01-config.js`, `02-core.js`, `36-main.js` | same names, `99-main.js` | 01-core |
| `03-audio.js` / `04-art.js` | same (byte-identical) | 02-audio / 03-art |
| `09-world-engine-b1.js`, `05-set-reddy-…js` (+ sets 06–08) | `30-world.js`, `10-set-reddy26.js` (still `SETS.reddy`) | 04-world |
| `10-ui.js` / `11-flow.js` | `31-ui.js` / `32-flow.js` | 05-ui / 06-flow |
| `12-…22-minigame*.js` | not ported (TWO writes `40-59-mg-*.js`) | 07, 08 |
| `23-…35-content-*.js` | not ported (TWO writes `60-89-content-*.js`) | 09 |

## 1. The manuals

**[01-core](engine/01-core.md)**: the DOM skeleton (every id, class, z-index), `CONFIG`, registries,
`state`/`options`/`profile`, test hooks and the build's scope rules; the renderer, event bus and the fixed-step clock
(`addUpdate`, `wait`, `waitUntil` under pause, skip and multi-tick frames); input, saves, F2 and adaptive pixel ratio;
`boot()` with loader jobs, character warm-up, portrait baking and the mid-game shader warning.

**[02-audio](engine/02-audio.md)**: the Web Audio graph and bake-at-boot lifecycle; every public call with options
(`sfx`, `AUDIO.loop` and its handle, `ambience`/`setRoom`, `blip`, `music`, `song`, `seq`, `stopAll`); all 48
one-shots, 13 loops and 9 baked cues; the Pudding song player; voice baking; recipes for adding each kind of sound;
and what TWO's audio ("two", the Manager's motif, the laugh, lures) needs from the engine.

**[03-art](engine/03-art.md)**: `canvasTex`, `mat`/`matTex` and their cache keys, `bakeLight`, `Builder`,
`instanced`, `blobShadow`, `makeRain`; the rig (16 bones, dimensions, body atlas, painted face, 15 hair styles,
attachments, the `pose()` blend); every `LOOKS` field and all 47 built-in `ANIMS`; and how to build TWO's cast and
special items (trench coat, hood, Santa hat, headphones, chip light) and its new animations.

**[04-world](engine/04-world.md)**: sets (build, the two-set LRU, warm-up, the fixed light rig, env presets, rain,
puffs, torch) and the full SET contract with `SETS.reddy` worked through; actors, the player and follower, gameplay
cameras; **every shot kind, option and move**, the framing helper, split screen, time-lapse and interpolation. Read
§2 (world promises vs skip) before awaiting anything from the world.

**[05-ui](engine/05-ui.md)**: the `ui` object (fades, flash, letterbox, title/act cards, INSERT cards, toast, prompt,
swap indicator, inventory panel); `say`/`choose`/`ask` (beats, typing speeds, blips, censor); `popup` (every option,
positioning, input precedence, pooling hazards); `hud`, `objective`, `portraitURL`, menus, the 19 built-in `CARDS`;
behaviour under skip, autoplay and pause.

**[06-flow](engine/06-flow.md)**, the reference for writing scenes: the scene and step runners and the generation
counter; every scene field, all 13 scene step kinds and all 37 cutscene step kinds with await and skip behaviour;
hotspots (fields, firing order, kettle saves, doors, sample recording), inventory, roam, the mini-game host and `api`,
grants and Continue; and an authoring cookbook built from Rue's 1.1–1.3.

**[07-minigames-a](engine/07-minigames-a.md)**: the host contract and Rue's mini-games 12–16 (`jarvis_sale`,
`restart_ritual`, `keypad`, `buglist`, `dial`, `tether`, `wiring`, `pedal`, `pitch_cards`, `journey`, `sequencer`)
with params, results, input, autoplay and lifecycle guards; how each maps onto TWO (Chip Sale, Wiring, "two", Hack,
Piano/Hum, reason cards, keypads); and the host changes TWO needs (skip after two failures, SWAP, nested Hack).

**[08-minigames-b](engine/08-minigames-b.md)**: `final_yes` and the memory recorder (`snap`/`still`), `credits`,
`blend_in`, `keep_up`, `rue_walk` (and its camera rig), `role_play`, `torchlight`; a catalogue of reusable pieces
(hold curve, cone test, route projection, the draining battery); how they map to TWO's Hold NO, Choice, credits, Blend
In, Teddy, stealth, scooter and boss camera; and what each `end()` must undo.

**[09-content-patterns](engine/09-content-patterns.md)**, the cookbook for content writers: file layout and step
idioms (line factories, `par`, awaited vs fire-and-forget `do`, cueing at a word, poses, hand props, the spot as a
lamp, `tween`/`watch`); 23 shot recipes (ORBIT speeding up, JARVIS-CAM, TOP-DOWN, long push, crane, split, match cut,
time-lapse, dissolve); the set pieces TWO echoes; every INSERT card and local helper; TWO echo → Rue recipe.

**Where to start:** writing a scene → 06 §4–5 and §13, then 09. A set → 04 §4–5 and §15, then 03 §5–7. A mini-game →
06 §10, then 07 §2–3. A sound or cue → 02 §13. A look or animation → 03 §12–13. Timing or skip bugs → 01 §7.3, 04 §2.

## 2. Cheat sheet: the 40 most-used forms

How to read it:
- `x = v` is a default, and `a | b` lists alternatives.
- "Skip" means `flow.skipping` (Pause → Skip Scene, or `&fast=1`).
- A *where* is a mark name, an actor id, an anchor name, `[x, z]`, `[x, y, z]` or `[x, y, z, rotY]`. Names are looked
  up as mark first, then actor, then anchor (04 §4.10).

```js
// ── Scene data and scene steps (06 §4, §9, §10, §11) ───────────────────────────────────────────────────────────
/* 1*/ SCENES['1.1'] = { title, set: 'reddy26', env: 'day', playable: ['luka', 'chase'], swap: false, hud: null, music: 'radio',
         spawn: { luka: 'where', chase: { at: 'where', look: 'chase', set } }, hotspots: [/*25*/], steps: [/*2-7*/],
         grants: { flags: {}, items: [], names: [], samples: [], removeItems: [], battery, bars, pattern, active } };
       // omit set/music = keep current; omit hud = re-show from state; hud: null hides it AND nulls state.battery/bars; grants feed only Chapter Select / &scene=
/* 2*/ ['cutscene', 'id' | [steps], { letterbox: false }]   // keeps bars + last shot when it is the last step or a letterboxed cutscene follows
/* 3*/ ['steps', [steps]]                                    // a cutscene without bars (still skippable, still freezes the player)
/* 4*/ ['control', 'luka'], ['follow', 'chase' | null], ['swap', true]
/* 5*/ ['roam', { until: 'flag' | ['f1', 'f2'] | (s) => bool, hint: { after: 120, steps }, auto: async (c) => { await c.hotspots.trigger('id'); } }]
/* 6*/ ['minigame', 'id', { shot: LENS, ...params }]         // awaited; result in flow.result; disables the player
/* 7*/ ['set', 'id', { env, spawn }] /*fades*/, ['cam', 'fixed', { pos, look, fov }], ['cam', null], ['objective', 'text' | [{ text, done }] | null],
       ['do', (c) => promise], ['save'], ['wait', 2]
// ── Cutscene steps: ONE key per object, first match wins (06 §5.3-5.4) ─────────────────────────────────────────
/* 8*/ { shot: 'CLOSE', on: 'luka', move: 'push', amount: 0.75, dur: 6, card: ['postit', { text }] }   // not awaited; ignored on skip
/* 9*/ { say: 'luka', text: 'Line. ^ After a 0.8 s beat.', tag: 'off', speed: 'slow', auto: 0.5, name: 'LABEL', portrait: false,
         censor: true | 'pop-up msg', expr: 'worried', act: 'point' }                // expr/act cues are dropped on skip
/*10*/ { choice: ['One', 'Two'], flag: 'pick', disabled: [1], test: 0 }        // flow.result = index
/*11*/ { ask: 'Put the kettle on?', yes: [steps], no: [steps], flag, test = true, yesDisabled, noDisabled }
/*12*/ { popup: { msg, title = 'JARVIS', icon = 'warn' | 'error' | 'info' | 'none', buttons = ['OK'], at: [0.5, 0.4] | 'center' | { actor: 'id' },
         w, dur, spinner, progress: { from, to, dur }, dodge: [i], cls: 'big' | 'crash', shake, ding = true, z }, wait: true }
       { popup: null, clear: true }                                             // pop-ups are dropped on skip; clear still applies
/*13*/ { move: 'luka', to: 'where', run: true, speed, face: false, nowait: true }   // awaited unless nowait; teleports on skip
/*14*/ { face: 'luka', to: 'where' | rotY, dur = 0.3 }, { place: 'luka', at: 'where' }   // face is NOT awaited
/*15*/ { act: [['luka', 'nod'], ['chase', 'sit', { h: 0.45 }], ['x', 'wave', { dur: 2, loop: false, speed, still, yaw }]] }, { expr: [['luka', 'worried']] }
/*16*/ { spawn: 'id', at: 'where', look: 'lookId', set: 'otherSet' }, { despawn: 'id' }, { hold: 'luka', prop: 'mug' | null, hand: 'R' | 'L' }
/*17*/ { prop: 'name', visible: true, pos: [x, y, z], rotY, fn: (o) => o.userData.show('mode') }
/*18*/ { set: 'id', env, spawn: { ... } } /*instant cut, no fade*/, { env: 'night' | { bg, fog, hemi, dir, spot, rain }, dur: 2 } /*not awaited*/
/*19*/ { sfx: 'ding', vol, rate, lp: 650, at: 'anchor' | [x, y, z], pan } /*dropped on skip*/, { music: 'cue' | null, fade, cut } /*a cut on skip*/,
       { loop: 'alarm', vol, fade = 0.15, rate, lp, at } /*starts even on skip*/, { loop: 'alarm', stop: true, fade = 0.5 }
/*20*/ { wait: 1.2 }, { par: [stepA, { do: (c) => c.runSteps([...]) }] }, { if: (state) => bool, then: [...], else: [...] }, { do: (c) => ... }
/*21*/ { fade: 'out' | 'in' | 0.5, dur = 0.5, color: '#fff' }, { flash: 0.6, color = '#fff' }, { letterbox: true }, { title: 'Tuesday', dur = 2.5 }, { actCard: 'ACT — Sub' }
/*22*/ { hud: { battery: 1, bars: 0 } | null, anim: 2 }, { objective: 'text' | [{ text, done }] | null }
/*23*/ { flag: 'x', value = true }, { item: 'remote' }, { item: 'remote', remove: true }, { name: 'Des' }, { sample: 'kettle' }   // state steps: always applied
/*24*/ { stare: 3 /*max 4*/, ambient: [['tick', 1.5]] }, { split: { left: { set, shot }, right: { set /*required*/, shot } } }, { split: null, slide: true },
       { timelapse: { from: 'day', to: 'night', dur = 8, cycles = 3, keys: [{ t: 1.4, steps: [...] }] } }   // follow it with an explicit { env }
// ── Hotspots, items, mini-games (06 §7, §8, §10; 07 §2) ────────────────────────────────────────────────────────
/*25*/ { id, at = id, r = 1.2, verb = 'Examine' /* 'NO' makes NO the key */, by, when: (s) => bool, only: 'chase', once, flag,
         text: 'line' | ['cycles', '...'] | { luka: '..', chase: '..' }, kettle: true, ask: { q, yes, no, test }, steps,
         door: { to: 'mark' | [x, y, z, rotY] | { set, mark, env }, kind = 'jarvis' | 'wood' | 'slide', first: [steps] },
         do: async (c) => ..., use: { remote: [steps] | ((c) => ...) }, sample: 'kettle' }   // fires text → kettle → ask → steps → door → do
/*26*/ ITEMS.remote = { name, desc, icon: (cx, w, h) => {}, examine: [steps] | fn, flip: { q, steps }, combine: { other: steps | fn } };
       c.inventory.selected = 'remote'; await c.hotspots.trigger('spot');   // trigger ignores when/only/once/distance
/*27*/ MINIGAMES.polish = { start(params, api) {}, update(dt) {}, draw() {}, end(result) {}, autoplay(api) {} };   // draw runs while paused: pure
/*28*/ api.finish(result); api.params; api.state; api.overlay.{ canvas, ctx, w, h, show(b) }; api.ui /* #mg, emptied on finish */;
       await api.play([steps]) /* pauses update; not a cutscene */; api.world, cam, input, sfx, AUDIO, say, ask, choose, popup, hud
/*29*/ const r = await c.flow.minigame('keypad', { digits: 4, test: '1158', onSubmit });   // from a do/hotspot (player NOT disabled)
// ── UI (05) ──────────────────────────────────────────────────────────────────────────────────────────────────
/*30*/ await say(id, text, o); const i = await choose(labels, { disabled, test }); const yes = await ask(q, { test, yesDisabled, noDisabled });
/*31*/ const p = popup(spec); const btn = await p.done /* index, -1 = closed */; p.close(); popup.clear(); popup.count();
/*32*/ ui.card('kind', data); ui.card(null); ui.toast('Saved.'); ui.prompt('YES — Open' /* em dash */); ui.prompt(null); await ui.fade(1, 0.5, '#fff');
/*33*/ objective('Find Chase'); objective.list([{ text, done }]); hud.set({ battery, bars } | null); await hud.animate({ bars: 4 }, 2);
// ── World, actors, camera (04) ─────────────────────────────────────────────────────────────────────────────────
/*34*/ await world.load('id', { env }); world.preload('id') /*sync build: under black*/; world.liveMax = 3; world.env(p, dur, setId);
       world.prop('name'); world.anchor('n'); world.mark('n'); world.puff('where', { n: 14, color, speed: 0.6, life: 1.2, gravity: -0.5 });
       world.torch /* the set's one spot */; world.torchAuto = false /* global: restore it */
/*35*/ const a = world.spawn('id', 'where', { look, set }); world.actor('id'); world.despawn('id'); frame(subjects, 'MID', opts) /* shared result */
/*36*/ await a.moveTo('where', { run, speed, face }); a.face(target, 0.3); await a.play('nod', { dur, loop: false, speed, still, h, yaw });
       a.place('where'); a.hold('prop' | obj | null, 'R'); a.setExpr('sad'); a.mood = 'anxious'; a.habit = 'glance'; a.walkAnim = 'carry'; a.rig.seated = false
/*37*/ cam.shot(step); await cam.release(0.8); cam.lock(true); cam.project(v3) /* shared {x, y, visible}, CSS px */; cam.cutscene = false /* see into() */
       cam.override('follow', { dist: 2.4, height: 1.7, lag: 0.35, fov: 50 }); cam.override('fixed', { pos, look, fov }); cam.override('set', { name }); cam.override(null)
/*38*/ player.control('id'); player.follower('id' | null); player.enabled; player.frozen(1.5); player.speedMul; player.actor
// ── Core and audio (01, 02) ────────────────────────────────────────────────────────────────────────────────────
/*39*/ await wait(s); await waitUntil(() => cond || c.flow.skipping); addUpdate(fn); removeUpdate(fn) /* keep fn in a variable */;
       on('flag:set', fn); emit(name, data); input.pressed('yes'); input.held('no'); input.consume('yes'); clock.t; saveGame() /* -> bool */
/*40*/ sfx('ding', { vol, rate, lp, at, pan }); music('cue' | null, { fade, cut }); music.silence(true);
       const h = AUDIO.loop('rain', { vol, fade, rate, lp, at }); h.vol(v); h.rate(r); h.pos(x, y, z); h.stop(0.3);
       AUDIO.ambience({ rain, loops: [] }); AUDIO.setRoom('room' | 'wet' | 'none'); AUDIO.song(pattern, { samples, bars, ending, onEnd }).stop()
```

`c`, passed to every `do`, roam `auto`, hotspot `do` and `use` function, is `{ world, cam, flow, state, ui, say, ask,
choose, popup, hud, wait, sfx, music, AUDIO, player, inventory, hotspots, runSteps, playCutscene }`. `objective`,
`input`, `clock` and `TEST` are plain globals. To hold a shot into a mini-game or a roam, use
`into = (s) => ({ do: (c) => { c.cam.shot(s); c.cam.cutscene = false; } })` (06 §13.7).

### Shot vocabulary (04 §9)

| Kind | Inputs | Notes |
| --- | --- | --- |
| `ECU` `CLOSE` `MID` `WIDE` | `on` (id, list, anchor, mark, point; omitted = everyone) | Distances 0.35 / 0.9 / 1.8 / 7 m; FOV 30 for ECU, else 40. A WIDE group is auto-fit |
| `TWO` `THREE` (`TWO-SHOT`, `THREE-SHOT`) | `on: [a, b(, c)]` | Auto-fit across the line (two facing each other: the first is frame-left). `dist` turns the fit off |
| `TOP` (`TOP-DOWN`) | `on`, `dist = 1.5`, `offset` | Straight down; screen-up = the subject's facing; never reaims |
| `LOW` `HIGH` | `on` | Same as `MID` with `angle`, and **`size` is ignored**. Use `{ shot: 'CLOSE', angle: 'low' }` |
| `OTS` | `on`, `side: 'ots:<id>'` | Plain MID unless `side` names the shoulder |
| `INSERT` | `at`: anchor, actor id or `[x,y,z]`; `angle: 'top'` | Lens = `anchor.from`. Carries `card` |
| `JARVIS` (`JARVIS-CAM`) | `at`: screen anchor (required), `on`: faces | Borrows the set's spot. Restores colour, intensity and angle but **not its position** |
| `POV` | `from`: actor or anchor, `at` | Pan with a target `to`, never with degrees (NaN) |
| `CAM` | `pos`, `look`, `fov`, `to: { pos, look, fov }`, `dur` | Explicit lens; with `to` it glides |
| `SET` | `cam` | A set camera, evaluated live |

Options for every size kind: `dist`, `height`, `angle` (`'high'`, `'low'`, `'side'` or `'top'`), `side` (`'left'`,
`'right'`, `'back'` or `'ots:<id>'`), `offset` (positive puts the subject frame-left), `facing` (no group logic, no
raycasts), `locked` and `fov`. A move goes in `move`, or is the `shot` name with the framing in `size`. Every move
takes `dur = 3` and `ease` (`'linear'`, `'in'` or `'out'`; default smoothstep):

| Move | Parameters and defaults |
| --- | --- |
| `push` / `pull` | `amount = 0.6` |
| `crane` | `from = 0`, `to = 2` (metres of lens rise), `amount = 1` |
| `orbit` | `from = 0`, `to = 90` (degrees) |
| `pan` | `to`: a target, or degrees (+ = right, default 30) |
| `tilt` | `to`: a target, or degrees (+ = up, default 25) |
| `track` | `track: 'alongside' \| 'behind' \| 'ahead'`, `side: 'right'`. **Ignores `dur`**: runs until the next shot |
| `whip` | 0.2 s |
| `crash` | 0.12 s; zooms to half the FOV. **Passing `fov` cancels the zoom** |

A move holds its end frame until the next shot. Since `cam.shot` is not awaited, follow a move with `{ wait: dur }`.

## 3. Cross-cutting gotchas (the ones that span manuals)

1. **Skip runs `do` steps and drops presentation.** While skipping, `shot`, `say` (with its `expr`/`act` cues), `sfx`,
   `stare`, `title` and new pop-ups are dropped. State steps, `loop`, `music` (as a cut), `env` and every `do` still
   run, so each `do` must check `c.flow.skipping`: snap cosmetics to their end and apply state either way. Test every
   scene with `&fast=1` **and** without it (06 §5.6, 09 §7.5).
2. **Poll loops hang the page.** `while (x) await c.wait(t)` never yields while skipping, and `wait(0)` never yields
   at all. Use one `waitUntil(() => cond || c.flow.skipping)` with a time cap (01 §7.3.4).
3. **Two kinds of promise.** `wait`/`waitUntil` resolve when a skip starts, `waitUntil` **even if its condition is
   false**. World promises (`moveTo`, `play`, `face`, `env`, `release`) resolve when superseded, without reaching
   their target. A skip does not release them, and on an actor or set that isn't shown they hang forever. Prefer
   `{move}`/`{face}` steps to awaiting world calls inside a `do` (04 §2).
4. **One key per step.** `{ wait: 1, flag: 'x' }` only waits. Not awaited: `face`, `act`, `env`, `split`, `hud`
   with `anim`, every camera move, and a block-bodied `do`. An expression-bodied `do` *is* awaited (06 §5.3).
5. **A throw in any updater or `waitUntil` predicate freezes the canvas.** `clock.step` has no try/catch.
   Mini-game `update`/`draw` are protected; your systems updaters are not (01 §7.3.5).
6. **`clock.scale` belongs to the flow.** It is rewritten every tick: ×3 while NO is held in a cutscene, otherwise 1.
   Slow motion needs a flow hook. Holding NO also speeds up a mini-game started from inside a cutscene (06 §1.3, 07 §16).
7. **Continue restarts the scene at step 0 with the saved flags**, and kettle saves happen mid-scene. Re-dress props
   from `state.flags` in the first cutscene, or reset the scene's flags. Grants feed only Chapter Select and
   `&scene=`, accumulating linearly through `SCENE_ORDER`. TWO's A/B branches need branch-aware grants and a
   `next(state)` hook (06 §11, §14).
8. **Cleanup is your job.** `flow.stop()` bumps the generation counter; `flow.start()` then despawns actors and clears
   pop-ups, cards and splits. Neither cancels your promises or updaters, or restores `torchAuto`, the spot,
   `liveMax`, colliders, `AUDIO.loop` handles (only `{loop}` steps are stopped), or pooled-rig state (`seated`,
   attachments, `mood`, `habit`, `walkAnim`, root rotation, tears). Guard deferred code with `c.flow.sceneId` and
   restore in a `watch` updater (09 §2.8).
9. **Nothing may be built mid-game.** Everything a scene reveals must exist, hidden if need be, in the set's
   `build()`, with materials from `mat()` and keyed textures, so `world.warm` compiles it at boot. Never add lights.
   Boot pre-builds **one rig per look**, so a second simultaneous actor of that look builds a rig mid-game. The
   "shader compiled mid-game" message is an autoplay-only warning: read the runner output (01 §8, 04 §15.6).
10. **Set loads are synchronous and the cache is small.** `load`, `preload`, `show`, `spawn({set})` and the `{set}`
    step all build immediately, and the `{set}` step cuts with no fade, so do them under black. With `liveMax = 2`
    the cache prunes before the new set becomes current, so a third set preloaded during a split is disposed at once.
    Use `liveMax = 3` (04 §3.3).
11. **No allocation per tick** in updaters, `when`/`until` predicates, set `update`, `floor()`, or mini-game
    `update`/`draw`. `frame()` and `cam.project()` return shared objects. `frame()` raycasts the set, so call it only
    on cuts (04 §15.6).
12. **Input precedence.** Any left click or tap outside a `button` or `[data-noyes]` is a YES; a right click is a NO.
    Dialogue sees YES first and, while busy, blocks keyboard input to pop-ups. Input goes to the newest pop-up with
    buttons. NO presses only a `'NO'`/`'Cancel'` button, and never in a cutscene. The open BAG freezes dialogue and
    pop-ups. CHIP needs entries in the hard-coded action list `A` (`02-core.js:51`), `CONFIG.keys`, `CONFIG.pad`, a
    touch button and `menus.keys` (01 §10.1, 05 §5.4).
13. **Things that never close themselves.** A `buttons: []` pop-up without `dur` survives a skip, and with
    `wait: true` it hangs the cutscene. A card shown with `c.ui.card()` stays until `ui.card(null)`: there is no
    `card` step, cards ride on shots. `hud.set()` during `hud.animate()` leaves the animate promise pending (05 §5.6, §6).
14. **`{ hud: null }` sets `state.battery` and `state.bars` to null.** Restate them afterwards. TWO's HUD needs a hide
    that keeps its state (05 §6).
15. **Camera state isn't put back.** JARVIS-CAM leaves the spot parked at the screen; re-park it. A `do` that sets a
    shot must release it, because only `playCutscene` releases. Cameras a mini-game or roam relies on must come from
    `into()` or `['cam', 'fixed', …]`. A split's right half is static, and `camR.aspect` is wrong until the one-line
    fix in `world.split` (04 §11, 09 §3.2).
16. **Mini-game host limits.** One mini-game at a time (a nested `minigame()` orphans the outer one). No skip. SWAP
    is off. `update` runs before the world's interpolation copy, so move actors from the set's `update` instead.
    `api.finish` empties `#mg`. Rue's autoplays are only safe at start (07 §15.9, §16).
17. **Audio fails silently.** Nothing plays or queues before `AUDIO.init()`. Unknown names are no-ops, and
    `music('typo')` becomes a silent current cue. One throwing recipe aborts every later bake stage. The song player
    is Rue-specific: 4 lanes × 16 steps, no `dur`, and `stop()` never calls `onEnd` (02 §15).
18. **Reduce Flashing is automatic only** for `{flash}`, and for a `{fade}` up to a colour matching `/^#f/`. Prop,
    emissive and light flashes need an explicit `options.reduceFlashing` branch (09 §4.4).
19. **Memory stills are fragile.** `snap()` does nothing while skipping, and stills live in memory, so they are gone
    after a reload or Continue. Always have a painted fallback (08 §2.3).
20. **Module scope.** Leaf fragments are block-scoped and evaluate before `30-world`/`31-ui`/`32-flow`, so touch
    engine globals only inside functions called later (temporal dead zone). `state` is a reassigned `let`, so never
    cache it. `loadGame()` does not merge old saves with new fields (01 §1.3, §7.6).
21. **The docs disagree in one place.** ARCHITECTURE §4 gives a set's update as `update(dt, t)`. The real signature is
    `update(dt, ctx)` with `ctx = { t, player, running, env, props }` (04 §4.7). `src/10-set-reddy26.js` still
    registers `SETS.reddy`.

Test hooks: `?autoplay=1&scene=1.1&stop=1.3&speed=8&fast=1` (`&ending=A|B` is not implemented yet).
`window.TWO_TEST = { ready, done, scene, step, log }`. `npm test` = build + `autoplay=1&fast=1&speed=8`.
