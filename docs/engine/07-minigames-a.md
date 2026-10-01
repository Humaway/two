# 07 — Mini-games A: JARVIS Sale, Restart Ritual, Keypad, Bug List, Dial, Tether, Wiring, Pedal, Pitch Cards, Journey, Sequencer

Reference for Rue's mini-game fragments `12` to `16` and how TWO reuses them. Line numbers are `ref/rue/NN-…js:LINE`.

| File (short name used below) | Lines | Registers |
| --- | --- | --- |
| `12-minigames-jarvis-sale-restart-ritual.js` (**12**) | 776 | `MINIGAMES.jarvis_sale`, `MINIGAMES.restart_ritual` |
| `13-minigames-alarm-keypad-bug-list-dial.js` (**13**) | 587 | `MINIGAMES.keypad`, `MINIGAMES.buglist`, `MINIGAMES.dial` |
| `14-minigames-tether-rip-1-4-wiring-1-5-2-6.js` (**14**) | 439 | `MINIGAMES.tether`, `MINIGAMES.wiring`, `ANIMS.stumble` (side effect) |
| `15-minigame-pedal-power-2-6-reused-in-3-1.js` (**15**) | 169 | `MINIGAMES.pedal` |
| `16-minigames-pitch-cards-3-1-customer-journey-2-10-the-sequence.js` (**16**) | 431 | `MINIGAMES.pitch_cards`, `MINIGAMES.journey`, `MINIGAMES.sequencer` |

**Not in `src/` yet.** TWO's `src/` holds only the engine fragments (`00–04`, `10`, `30–32`, `99`). The mini-game host
(`src/32-flow.js:406-457`) is a verbatim copy of Rue's (`11-flow.js:406-457`). None of these mini-games exists in
`src/`. Porting one means copying it into a `src/40-…59-mg-*.js` leaf (ARCHITECTURE §2, §3.6) and changing it there.
Leaf rule: no top-level names; only assign into `MINIGAMES` / `ANIMS`.

Related docs: `01-core.md` §7.3–7.5 (clock, waits, input, overlay canvas), `02-audio.md` §3.4–3.5, §11 (sfx, loops,
the Pudding player, `AUDIO.seq`), `04-world.md` §6, §9 (actors, `cam.shot`, `cam.project`), `05-ui.md` §4–6
(`say`, `popup`, `hud`).

---

## 1. At a glance

| id | Spec scene (Rue) | Lines | Rendering | Params | Result | Autoplay |
| --- | --- | --- | --- | --- | --- | --- |
| `jarvis_sale` | 1.2 ×3, 1.3, epilogue | 12:124-497 | DOM JARVIS window in `#mg` + engine pop-ups + 3D shot | `{cycle, cap, mode, short, time, shot}` | `{crashed:true, reason, beat?}` | Sets bug flags, crashes, finishes after 0.6 s |
| `restart_ritual` | 1.3 | 12:499-775 | DOM JARVIS window (5-step wizard) + engine pop-ups | `{time}` | `{done:true}` | Sets flags, finishes after 0.5 s |
| `keypad` | 1.4 | 13:149-227 | DOM keypad | `{digits=4, onSubmit?, test?}` | `{code}` or `{cancel:true}` | Types `test`, calls `onSubmit`, finishes |
| `buglist` | 1.6 | 13:229-296 | DOM paper sheet | `{extra?}` | `{bugs:[ids]}` + `state.bugs` | Ticks all, finishes after 0.5 s |
| `dial` | 1.7, 2.7, 3.4 | 13:298-586 | DOM: two phone screens + info card | `{mode:'1987'\|'home'\|'final'}` | `{number, date, tries?}` | Snaps to goal, calls after 0.5 s |
| `tether` | 1.4 | 14:4-171 | Overlay canvas bar + 3D props/actor + alarm loops | `{shot, keepAlarms=true, lines:{after1, after3}}` | `{rips:4, alarms:[handles]}` | End state at once |
| `wiring` | 1.5, 2.6 | 14:173-439 | Overlay canvas (full screen) | `{layout:'machine'\|'charger'}` | `{zaps}` | `{zaps:0}` at once |
| `pedal` | 2.6 (×3), 3.1 | 15:6-169 | Overlay canvas panel + rider anim + dynamo loop | `{band=[55,80], session=1, rider='luka'}` | `{ok:true}` or `{failed:true}` | `win()` + `{ok:true}` at once |
| `pitch_cards` | 3.1 | 16:26-280, 416-423 | Overlay canvas card table | none | `{order:[names]}` + `state.flags.pitchOrder` | Notebook order at once |
| `journey` | 2.10 | 16:26-280, 424-428 | Overlay canvas card table | none | `{ok:true}` | At once |
| `sequencer` | 3.3 | 16:282-413 | Overlay canvas tracker grid + `AUDIO.seq` | none | `{pattern}` + `state.pattern` | Stores current/default pattern at once |

Rue's content mostly **ignores result objects**. Lasting outcomes are written to `state`: `state.bugs`,
`state.pattern`, `state.flags.pitchOrder`, `state.battery` (pedal), and the `seen_*` bug flags. Exceptions: the
keypad's `code` (1.4 branches on it) and the tether's `alarms` handles.

---

## 2. The host contract (`11-flow.js:406-457`, TWO `32-flow.js` same lines)

### 2.1 Registry entry

```js
const MINIGAMES = {};   // 01-config.js:34
// MINIGAMES[id] = { start(params, api), update(dt), draw(), end(result), autoplay?(api) }
```

| Method | Called | Notes |
| --- | --- | --- |
| `start(params, api)` | Once, synchronously inside `minigame()` | `params === api.params` (`params \|\| {}`). A throw → `finish({error:true})` |
| `update(dt)` | Every fixed tick (`dt = CONFIG.step`, 1/60) from flow's updater, **only while** `!mg.paused && !panelOpen` | Not called while `clock.paused` (pause menu), while `api.play()` runs, or while the BAG is open. A throw → `finish({error:true})` |
| `draw()` | Every **rendered frame** (`on('render')`), including while paused and during `api.play()` | Must not advance game state. A throw → `finish({error:true})` |
| `end(result)` | Inside `api.finish(r)`, before the host clears `#overlay` and `#mg` | Stop loops, remove listeners, reset props. Receives the result (the tether uses it) |
| `autoplay(api)` | Under `TEST.auto` (`?autoplay=1`), right after `start()` | May return a promise. Without it the host finishes `{auto:true}` after `wait(0.5)` |

### 2.2 `minigame(id, params)` → `Promise<result>`

```js
// scene step:            ['minigame', 'jarvis_sale', { cycle: 1, cap: 50, mode: 'margaret', time: '09:14', shot: OTS_CHASE }]
// from a do / hotspot:   const r = await c.flow.minigame('keypad', { digits: 4, test: '1158', onSubmit })
```

1. Missing id → `console.warn`, resolves `{missing:true}`.
2. `testLog('minigame ' + id)`, `clearOverlay()`, un-hides `#overlay`, empties `#mg` (`mgEl.textContent = ''`).
3. Builds `api` (below), sets the single slot `mg = me`, calls `start`, then `autoplay` under `TEST.auto`.
4. The scene step form also sets `player.enabled = false` (`11-flow.js:501`). `c.flow.minigame()` does not.

### 2.3 The `api` object

| Field | Value |
| --- | --- |
| `finish(r)` | Idempotent per run (`if (mg !== me) return`). Clears `mg`, calls `m.end(r)` (try/catch), clears + hides `#overlay`, **empties `#mg`**, sets `flow.result = r`, resolves the promise |
| `overlay` | `{ canvas: #overlay, ctx, w (getter innerWidth), h (getter innerHeight), show(b) }`. The canvas is CSS px × raw `devicePixelRatio`; `show(b)` toggles `.off` |
| `ui` | The `#mg` element (`z-index:1` inside `#ui`; `#mg > *` gets `pointer-events:auto`) |
| `world`, `cam`, `input` | The engine singletons |
| `sfx` | `sfx(name, o)` (falls back to `ui.sfx`) |
| `AUDIO` | The AUDIO object (`loop`, `seq`, `blip`, `song`, …), or `null` if audio is absent: guard with `a.AUDIO && a.AUDIO.loop` as Rue does |
| `say`, `ask`, `choose`, `popup`, `hud` | The UI functions. `say` works over a running mini-game (the keypad and dial use it) |
| `play(steps)` | Runs cutscene steps with `me.paused++` (update suspended, draw continues). Returns a promise |
| `params` | `params \|\| {}` |
| `state` | The global `state` (some mini-games use the global directly; same object) |

**Single slot.** `mg` holds one mini-game. Starting a second while one runs overwrites `mg`; the first is never
finished. `flow.stop()` (quit to title) calls `mg.api.finish({aborted:true})`. There is **no skip** for mini-games
in Rue.

### 2.4 Where input comes from inside a mini-game

| Source | What the mini-game sees |
| --- | --- |
| Keyboard / pad / touch buttons | `api.input.pressed/held('yes'\|'no'\|'up'\|'down'\|'left'\|'right')`, `input.move` |
| Left click / tap **not** on `button, [data-noyes], input, textarea` | A YES press (and `held('yes')` until release) **plus** `input.pointer.pressed` |
| Right click (anywhere) | A NO press + `pointer.pressed` |
| Click on a DOM `<button>` | Only the button's `onclick` (no YES) |
| Raw `keydown` listeners | Digits (keypad, dial), modifier combos (restart ritual). Unbound keys reach the page untouched |

`focusin` on any BUTTON blurs it (core), and every DOM mini-game also cancels `mousedown` default on its root, so
Enter/Space stay the engine's YES and never fire a native button click.

---

## 3. Shared patterns (read once, used everywhere)

### 3.1 Three rendering approaches

| Approach | Used by | How |
| --- | --- | --- |
| **DOM in `#mg`** | jarvis_sale, restart_ritual, keypad, buglist, dial | Root built **once per module** on first `start` (`if (!F) build()`), re-attached with `a.ui.appendChild(root)` every start (the host empties `#mg` on finish). Each root carries its **own `<style>`** with the CSS string, so the CSS only applies while attached |
| **Overlay canvas** | tether, wiring, pedal, pitch_cards, journey, sequencer | `ov.show(true)` in start; draw every frame in CSS px after `ctx.setTransform(s,0,0,s,0,0)` with `s = ov.canvas.width / W`; `end()` resets the transform to identity and clears the whole canvas |
| **3D world** | tether (props + Chase anims), pedal (rider anim), jarvis_sale (`cam.shot`, bark bubble projected from Chase's head) | `api.world.prop/actor`, `api.cam.shot/project` |

### 3.2 DOM helpers (private copies in 12:94-122 and 13:123-147)

| Helper | Signature | Behaviour |
| --- | --- | --- |
| `h(tag, cls, parent, text)` | → Element | `createElement`; sets `className`, `textContent` (if `text != null`), appends to `parent` |
| `button(parent, text, fn, cls)` | → `<button>` | `type='button'`, `tabIndex=-1`, `onclick=fn`. In 12 the class is `'mg-btn' + cls`; in 13 just `cls` |
| `frame()` (12:107-119) | → `{root, win, ttl, clk, body}` | The JARVIS app window: `.mg-j > style + .mg-win > (.mg-bar: logo "JARVIS", .mg-ttl, .mg-clk, three fake window buttons `– □ ×`) + .mg-body`. `win.dataset.noyes = ''`. `root` mousedown → `preventDefault` unless the target is an INPUT |
| `shell(cls)` (13:135-140) | → root | `div.cls` + `<style>`; mousedown → `preventDefault` |
| `setFocus(old, el)` | → `el` | Moves the `.mg-f` focus ring (yellow outline) from `old` to `el` |
| `openPops(api)` | → number | `api.popup.count()` (0 if absent) |
| `narrow()` (12:122) | → bool | `innerWidth < 700 \|\| innerWidth < innerHeight * 0.8`; mirrors the CSS media query `(max-width:700px),(max-aspect-ratio:4/5)` |
| `digitOf(e)` (13:144) | → `'0'…'9'` or `''` | From `e.code` `Digit7` / `Numpad7` |
| `gridMove(I, i)` (13:146) | → new index or −1 | 3×4 grid with wrap on all four edges |

### 3.3 Overlay helpers (file 16 only, 16:9-24; 14 and 15 inline the same logic)

| Helper | Behaviour |
| --- | --- |
| `open(a, layout)` | Binds `api/ov/ctx`, `W = H = 0`, remembers the layout callback, captures `#touch` and the pointer position, `ov.show(true)` |
| `close()` | Identity transform, clear the full canvas, `ov.show(false)` |
| `size()` | Re-runs `layout` when `innerWidth/innerHeight` or `input.scheme` changed (touch adds bottom margin for the on-screen controls) |
| `clear()` | `setTransform(s…)` then `clearRect(0,0,W,H)` |
| `ptrOk()` | False if `pointer.over` is inside `#touch`. **Redundant**: core already ignores pointer events on `#touch` (`02-core.js:144-148`). Harmless |
| `inRect(x,y,rx,ry,rw,rh)` | Point-in-rect |

### 3.4 Lifecycle guards used by every mini-game

```js
function fin(res) { if (phase === 'end') return; phase = 'end'; api.finish(res); }        // 12:304, 13:195 …
M.start = (params, a) => { api = a; …; run++; … };                                       // run id per start
p.done.then(() => { if (id === run && phase === 'form') { busy = false; fn(); } });      // 12:225: stale-promise guard
```

- `run` is incremented in `start` and `end`. Any async continuation (pop-up answers, `say`, `wait`) captures
  `const id = run` and checks `id === run` before touching state. Copy this for every awaited thing in TWO.
- **One-tick pop-up debounce** (12:415-416, 695-696): `const n = openPops(api), block = n > 0 || blocked; blocked = n > 0;`
  Input stays blocked for one extra tick after the last pop-up closes, so the YES that closed it does not also act on
  the form.
- **Row-change guard** (12:447): `if (r !== rows[cur]) return;` after timers that may complete a row, so a YES in
  the same tick belongs to the old row.
- Autoplay re-entry guard: `if (phase === 'end' || api !== a) M.start(a.params || {}, a);` (12:486, 13:220 …).
  The host always calls `start` first, so this only matters if something calls `autoplay` directly.

### 3.5 Input conventions

| Action | Meaning in DOM games | Meaning in canvas games |
| --- | --- | --- |
| Arrows / stick flicks | Move the `.mg-f` focus ring (grid or list) | Move focus (cards, cells) or the cursor (`input.move`, wiring) |
| YES | Press the focused control | Press / grab / toggle |
| NO | Delete / back / cancel | Take back, play/stop (sequencer), second pedal |
| Pointer | Native `onclick` on `<button>`s; holdable buttons use `onpointerdown/up/leave/cancel` | `input.pointer` (`x, y, down, pressed`) |
| Hint text | Static strings | Recomputed when `input.scheme` changes (`'kb'`, `'pad'`, `'touch'`) |

Touch layouts push panels up by 190-200 px (`scheme === 'touch'`) so the virtual stick and YES/NO buttons do not
cover them. DOM games pad their root bottom by 19-21 vh so dialogue (`say`) from the mini-game does not cover them.

### 3.6 Clicks outside the window are YES

`.mg-j`, `.mg-k` and `.mg-dl` roots are `pointer-events:none!important`; only the window/keypad/rig takes the
pointer and carries `data-noyes`. A click on the scene around them falls through to `#gl` and becomes a **YES
press** for the focused control (e.g. a stray click beside the JARVIS window acts on the current row). `.mg-bl`
(bug list) is the exception: a full-screen dimmed `pointer-events:auto` root with `data-noyes`.

---

## 4. JARVIS Sale (`jarvis_sale`, 12:124-497)

### 4.1 Summary

| | |
| --- | --- |
| Rue uses | 1.2 Margaret cycles 1-3 (`24-…:156-160`), 1.3 Dazza (`24-…:313`), epilogue reprise (`35-…:288`) |
| Params | `cycle` 1\|2\|3 (default 1) · `cap` s (default dazza 40, reprise 25, else 50) · `mode` `'margaret'` (default) \| `'dazza'` \| `'reprise'` · `short` bool (implied by `cycle === 3`) · `time` string for the title-bar clock · `shot` a `cam.shot` step applied at start |
| Result | `{crashed:true, reason:'optin'\|'cap'\|'e4044'}`; reprise adds `beat: [8 bools]`; autoplay adds `auto:true` |
| Side effects | `state.flags`: `seen_popups`, `seen_margarine`, `seen_runaway`, `seen_backwards`, `seen_mfa`, `seen_optin`, `seen_restarts` (feed the Bug List); `popup.clear()` on crash and end |
| Rendering | DOM window (`frame()`), plus engine pop-ups (`api.popup`) on top, plus a speech bubble positioned from Chase's projected head |

The player fights a sales form that cannot be finished. Every mode ends in a crash. The form is a column of rows;
the current row is highlighted (`.mg-row.on`) and its first button has the focus ring.

### 4.2 Data (12:128-152)

| Const | Content |
| --- | --- |
| `ROWS[k] = [label, buttonLabel]` | `search` Customer search/Search · `dob` Date of birth/'' · `id` ID scan/Scan ID · `mfa` MFA code/Send code · `plan` Plan/Choose plan · `service` Add service/Add line · `optin` Marketing opt-in/'' · `verify` ID verification/Verify ID · `verify2` Verification of ID verification/Verify |
| `DONE[k]` | Value text written when the row completes (`MARGARINE`, `12 / 04 / 1947`, …). Not applied in dazza mode |
| `POPS` | 10 random nags `[msg, buttons, icon]` |
| `BARKS` | 4 Chase lines, each used once per 1.2 run |
| `YEAR = 1947, DODGE = [0], STEP = 0.25, BARS = 5` | DOB target, runaway button index, reprise beat step (s), reprise bars |
| `pat` | 8 booleans, the reprise beat (module-level, reused) |

Row sets: margaret/reprise `['search','dob','id','mfa','plan','service','optin']`; dazza `['search','verify','verify2']`
(`.mg-rows.few` centres fewer than 5 rows).

### 4.3 Phases

`'form'` → (`'spin'`, dazza only) → `'crash'` → (`'tap'`, reprise only) → `'end'`.

| Row | YES / button does | Completes when |
| --- | --- | --- |
| `search` | Types `MARGARET` (dazza: `DARREN`) at 0.09 s/char | MARGARET → pop-up "Did you mean: MARGARINE?" `['YES','YES']` (title "JARVIS Autocorrect", sets `seen_margarine`) → answered. DARREN → at once |
| `dob` | Starts a hold: ◀/▶ buttons (pointer), → or YES (+1), ← (−1). First step immediate, then 0.4 s, then `max(0.02, 0.12 − holdT·0.04)` s per year. Year clamps 1900-2026 | Year is 1947, not holding, and 0.4 s settled |
| `id` | 1st: "Scanner not found" + pop-up "Did you mean: Scanner?". 2nd: "Scanning…" for 1.2 s | After 1.2 s |
| `mfa` | 1st: "Code sent to customer's phone", button becomes Resend, info pop-up (`seen_mfa`). 2nd: pop-up "Too many attempts. Verification skipped." | That pop-up answered |
| `plan` | — | At once |
| `service` / `verify` | "Please wait…" 1.3 s | `service` at once after; `verify` after the pop-up "ID verified. Please verify your ID verification." |
| `verify2` | "Verifying verification…", phase `'spin'`, wait cursor, big spinner cover | Never: after 2.6 s → `crash('e4044')` |
| `optin` | ←/→ toggles focus YES/NO; NO (styled disabled) plays `clunk`; YES → `crash('optin')` | — |

Interference (all in `update`, 12:379-468):

| Bug | Mechanism |
| --- | --- |
| Pop-ups before every action | `nextPop` timer: first after 2.5 s (short: 1.5), then every 4-7 s, only if fewer than 4 are open. `pop()` (12:217) positions at random percentages `[28..72, 24..64]` (narrow: x = 50) |
| "Progress saved!" | 40% of nags when the current row is partial (`dob > 1900`, or `id`/`mfa` pressed once): resets that row |
| Runaway buttons | Two-button nags dodge with 50% probability (`dodge: [0]`: the first button runs away). Until `seen_runaway` is set, every nag from the second one of a run on is forced to be a two-button runaway, so the first cycle always shows one |
| Progress bar goes backwards | `idle` resets on any direction/YES/NO press or `pointermove` over the window. Idle > 1.2 s: bar drains 5%/s; else rises 40%/s to `100·done/rows`. `seen_backwards` when the bar is 4+ points under target |
| Crash on opt-in | The optin YES |
| Time cap | `t` counts in `'form'` and `'spin'`; `t >= cap` → `crash('cap')` |

Chase's barks (12:323-342, margaret mode only): first after 5-8 s, then every 12-18 s; picks an unused line from
`BARKS` (bitmask `barkUsed`, reset when `cycle === 1`); a `.mg-bub` bubble placed at Chase's head
(`actor.headPos(V)`, `V.y += 0.3`, `cam.project`) clamped to the screen, else at (4% W, 74% H); shown 2.3 s; voice
blips `AUDIO.blip('chase', rising)` every 0.07 s, `ceil(len/3)` blips, the last one rising if the line ends in "?".
`V` is allocated lazily once.

Crash (12:288-303): sets `seen_restarts` (+`seen_optin`), clears pop-ups. **Quiet** modes (`dazza`, and margaret
`short`) show no crash screen (dazza shows the spinner) and finish 0.25 s later: the next cutscene carries the
crash. Otherwise `sfx('crash')`, blue ":(" screen (dazza text mentions Error 4044), fade to black at 1.4 s,
finish at 1.9 s.

### 4.4 Mode differences (start, 12:345-377)

| Mode | Pre-filled rows | Notes |
| --- | --- | --- |
| margaret cycle 1 | none | Full game; barks |
| margaret cycle 2 | `search` (shows MARGARINE: "remembers exactly the wrong thing") | |
| margaret cycle 3 (`short`) | none, but `fillT = 0.4` autopilot ticks one row every 0.15 s (`busy` while filling) down to optin | Quiet crash on optin |
| dazza | none | 3 rows; quiet; ends in `'spin'` → `e4044` (or cap 40) |
| reprise | everything but `search` and `optin` | After the crash: the **tap** phase |

Reprise tap phase (12:309-322, 394-405): the window shows "JARVIS is restarting…", 8 dots and a big YES. Steps of
0.25 s; `restart_chime` every 8 steps; a YES press plays `knock`, records `pat[round(phaseT/STEP) % 8] = true` and
lights a dot; recorded steps replay `knock` each bar (except the step just tapped). After 5 bars (10 s) finishes
with `beat: pat.slice()`. All timing is game time (frame-quantised).

### 4.5 Rendering

The window is fixed at `left:50%; top:43%; width:min(66vw,880px); height:min(64vh,540px)`; narrow screens
`calc(100vw - 32px) × 62vh`. Covers inside `.mg-body`: `.mg-crash` (blue screen), `.mg-cover` ×2 (spinner, tap),
`.mg-black` (opacity transition). `draw()` (12:470-477) writes the progress bar only when the rounded percent
changes: `fill.style.transform = 'scaleX(' + p / 100 + ')'`.

### 4.6 Autoplay (12:485-494)

Sets `seen_popups`, `seen_margarine` (not dazza), and for a full margaret run also `seen_runaway`,
`seen_backwards`, `seen_mfa`; calls `crash('e4044' | 'optin' | 'cap')`; finishes after `wait(0.6)` with
`{crashed:true, reason, auto:true, beat}`. Because `crash()` sets the flags exactly as a player would, the Bug
List after autoplay offers the same items.

### 4.7 Gotchas

- `after(p, fn)` (12:223) leaves `busy = true` if the cycle crashes while the pop-up is open (deliberate: the phase
  check prevents `fn`).
- The NO button on opt-in looks disabled but is clickable (clunk). Keyboard focus can sit on it.
- Clicks outside the window are YES (§3.6).
- `popup.clear()` in `crash()` and `end()` closes **every** pop-up, including any a cutscene opened.
- The bubble is DOM inside `F.root`, not an engine pop-up; it ignores the letterbox.

---

## 5. Restart Ritual (`restart_ritual`, 12:499-775)

### 5.1 Summary

| | |
| --- | --- |
| Rue uses | 1.3 (`24-…:310`), before the Dazza sale |
| Params | `{time}` (title-bar clock) |
| Result | `{done:true}` (autoplay adds `auto:true`) |
| Side effects | `state.flags.seen_sure`, `seen_password`; a capture-phase `keydown` listener on `window` while running |
| Rendering | DOM JARVIS window: a left step list (`.mg-side`, numbered 1-5, `.on`/`.ok`) and one `.mg-pane` per step. Narrow screens stack the step list on top |

Five steps, each repeating until done: **Alt-tab · Clear cache · Log out · Log in · Pray**. `done()` (12:616) plays
`pop` and shows the next step; after Pray it plays `restart_chime`, says "JARVIS has restarted. Welcome back, LUKA."
and finishes 1.2 s later. Timers use a private `after(sec, fn)` (12:593: `later`/`laterFn`, ticked in `update`),
not the engine `wait`.

### 5.2 Steps

| # | Step | Player does | Mechanism |
| --- | --- | --- | --- |
| 0 | Alt-tab (12:625-636, 699-707) | Keyboard: the shown combo within 1.5 s. Touch/pad (or anyone): YES then NO within 0.6 s | `COMBOS` = Ctrl+R, Ctrl+S, Ctrl+Z, Alt+J, Shift+Del ("all combos a browser tab can capture"). `onKey` (capture listener) checks the modifier flag and `e.code`, and `preventDefault`s (no reload/save/undo). Countdown bar quantised to 50 steps. Hit → "Switched. JARVIS is awake. Ish." 0.6 s → next. Timeout → "Too slow." + `sad_beep`, 0.8 s, new random combo |
| 1 | Clear cache (12:637-650) | Navigate a 4-button menu: Settings › Advanced › More Advanced › **Clear Cache** (decoys: Clear Cash, Clear Catch, Clear Cookies…) | `MENU[level] = [breadcrumb, parent, [[label, reply]]]`; reply `'>lvl'` opens a level, `'<'` goes back, `'!'` is the answer (1 s "Clearing cache…"), any other string is printed. NO goes up a level |
| 2 | Log out (12:651-665) | Confirm two pop-ups | `popup('Are you sure?')` → YES → `seen_sure` → `popup("Are you sure you're sure?")` → YES → 0.8 s → next. Any other answer: "Logout cancelled." |
| 3 | Log in (12:666-678, 714-729) | Type passwords (real `<input>`) or press YES to let Luka type | Rules: "Must contain a number" → "Must not contain a number" → "Must contain the name of your first pet" (4 letters, not the previous value) → "Must not be Biscuit" (never satisfiable). Once a rule has been shown for 0.7 s and the field satisfies it (auto-typing finished), it turns green (✓) and advances 0.5 s later. After 3 changes the **Forgot password?** link appears, gets focus and `ding`s; it logs him in (`seen_password`). "Log in" always fails (`sad_beep`). YES auto-types `TRIES[rule]` = hunter2 / hunter / Biscuit / Biscuit at 0.08 s/char, backspacing first if needed |
| 4 | Pray (12:709-713, 748-756) | Hold YES and NO together for 2 s | `pray += dt/2` while both held, else decays 1.2/s. Two SVG hands slide together. The window's `data-noyes` is **removed** for this step so mouse left+right buttons on the window count |

The password field (12:563-573): `tabIndex -1`, spellcheck/autocomplete off. Core ignores keys typed into an INPUT,
so the field handles Enter (YES), ↓/Esc (focus Log in), ↑ (focus last) itself. It is focused only when
`input.scheme === 'kb'` (avoids the phone keyboard).

### 5.3 Autoplay

Sets `seen_sure` and `seen_password`; finishes after `wait(0.5)`.

### 5.4 Gotchas

- The capture `keydown` listener must be removed in `end()` (12:761). Any TWO port that listens to raw keys must do the same.
- Ctrl+W/T/N and F5 cannot be captured reliably; keep combos to the list above.
- The `armed` YES-then-NO path also works on keyboard: it is the accessible fallback.

---

## 6. Alarm Keypad (`keypad`, 13:149-227)

| | |
| --- | --- |
| Rue uses | 1.4 from a hotspot (`25-…:144`): `c.flow.minigame('keypad', { digits: 4, test: '1158', async onSubmit(code) {…} })` |
| Params | `digits` (default 4) · `onSubmit(code)` → `true`/`Promise<true>` closes, falsy rejects (optional; without it any full code finishes) · `test` the autoplay code (default `'1158'`) |
| Result | `{code}` (submitted and accepted), `{cancel:true}` (NO on an empty code), `{code, auto:true}` |
| Rendering | DOM "SECURA 3000" keypad: LEDs, LCD (`ENTER CODE` / `CHECKING…` / `WRONG CODE` / `DISARMED`), 3×4 keys `1-9 C 0 OK`, hint "YES — enter · NO — delete". Root padded 20 vh at the bottom for dialogue |
| Input | Arrows: `gridMove` focus. YES: press the focused key, or submit if the code is full. NO: delete a digit, or cancel when empty. Digit/Numpad keys: a `window` keydown listener (`onKey`). Clicks on keys |

`submit()` (13:182-194): `busy` while `onSubmit` resolves (input ignored, run-guarded). Rejected → `sad_beep`,
"WRONG CODE", code cleared. 1.4's `onSubmit` says a line per wrong code (`say` runs over the keypad) and returns
`true` on the 3rd and 6th wrong code to close the pad with a **wrong** code; content then branches on `r.code`.

Autoplay (13:219-224): shows `test`, waits 0.4 s, calls `onSubmit(test)` and finishes regardless of its answer.

---

## 7. The Bug List (`buglist`, 13:229-296)

| | |
| --- | --- |
| Rue uses | 1.6 (`26-…:150`) |
| Params | `extra`: strings already written on the page (shown under the list, not tickable) |
| Result | `{bugs: [ids]}`; also writes `state.bugs = ids` |
| Data | `BUGS` (`01-config.js:98-111`): `{id, text, seen}`. Offered = bugs whose `seen` flag is set; **all** if none is |
| Rendering | DOM: a tilted paper sheet in biro handwriting, with the week's sales-target sheet showing through mirrored (`scaleX(-1)`, 10% opacity, with an SVG skull), checkboxes drawn in CSS (`.mg-bug.on i:after` tick), an oval-circled DONE. Full-screen dim root with `data-noyes` |
| Input | ↓/→ next, ↑/← previous (wrap); NO jumps to DONE; YES toggles (`tick` sfx) or finishes on DONE; clicks |

Autoplay ticks every offered bug and finishes after 0.5 s.

---

## 8. Dial (`dial`, 13:298-586)

### 8.1 Summary

| | |
| --- | --- |
| Rue uses | 1.7 `{mode:'1987'}` (`26-…:313`), 2.7 `{mode:'home'}` (`29-…:121`), 3.4 `{mode:'final'}` (`33-…:468`) |
| Result | `{number: NUM[mode], date: [dd, mm, yyyy, hh, mi], tries}` (`tries` only in home mode) |
| Rendering | DOM rig: left a cracked smartphone (number display, 12-key pad with letters, pulsing CALL), right a second screen with a 5-column date wheel (DD / MM / YYYY  hh : mm, `.mg-cur` big middle value, `.mg-nb` neighbours above/below, ▲▼ arrows), duct tape. A tilted info card on the left |

### 8.2 Data

```js
const NUM   = { 1987: '01 555 1592', home: '07 5550 1987', final: '088 555 2026' };
const START = { 1987: [29, 9, 2026, 11, 58], home: [7, 10, 2026, 14, 10], final: [27, 10, 1987, 11, 57] };
const GOAL  = { 1987: [6, 10, 1987, 11, 58], final: [20, 10, 2026, 11, 58] };
const NOW = START.home;   // 2.7: the present the wheel springs back to
```

`COLS = [['DD',1,31],['MM',1,12],['YYYY',1900,2099],['hh',0,23],['mm',0,59]]`. Day max follows
`dim(year, month)` (leap years correct). Year clamps; other columns wrap. Changing month/year clamps the day.

### 8.3 Phases

`'num'` (type the number) → `'talk'` → `'date'` / `'wheel'` → `'roll'` → `'call'` → `'end'`; final mode: `'auto'` →
`'autoroll'` → `'hold'`.

| Mode | Flow |
| --- | --- |
| `1987` | Type `01 555 1592` (wrong key: `sad_beep`, red flash 0.35 s; only the correct next digit is accepted). Chase: "When was he there?" → card becomes Rue's bio → "Uni goes back in October." → wheel at the year column. SET with year ≠ 1987 or month ≠ 10 → a Chase line. Correct → smooth roll to 6 Oct 1987 11:58 (1.1 s) → Luka "Tuesday. Nothing happens on a Tuesday." → CALL |
| `home` | Card in "say" style (Luka recites the store's number). Type it → wheel, caption "Set: 29 / 09 / 2026 · 11:59". The wheel **cannot go below NOW** (7 Oct 2026 14:10): 0.6 s after the last change, if below, `spring()`: `clunk`, snap to NOW, shake. After 3 springs: "It won't go back." / "It's probably broken. Just call." → CALL |
| `final` | No input. `hum` loop (vol 0.6); the number dials itself (0.12 s/digit, `key_beep` vol 0.5, highlighted keys); roll to 20 Oct 2026 11:58 (1.3 s); "Connecting…"; finish 0.5 s later |

`talk(who, text)` (13:408-414): `busy = true; await api.say(…)`; returns false if the run ended. `roll(to, dur, fn)`
(13:446-450) interpolates all five columns with smoothstep `k*k*(3-2k)`, rounding, ticking `tick` per change
(throttled to one per 0.05 s); a year jump of more than 3 blurs the year column (`.fast`).

### 8.4 Wheel input

| Input | Effect |
| --- | --- |
| ←/→ | Focus column (wraps) |
| ↑/↓ (held) | `startRep(±1)`: immediate step, then 0.35 s, then `max(0.025, 0.12 − repT·0.05)`; `.fast` blur under 0.07 s/step |
| ▲/▼ buttons | Same, pointer-held (`holdable`) |
| Mouse wheel | ±1 per event (`passive:false`, `preventDefault`) |
| Drag | Pointer capture on the column; every 22 px down = +1 (rolls the higher number, shown above, into the window) |
| YES | SET (`setDate`); in home mode SET just forces the spring check |

### 8.5 Autoplay

Fills the number and the goal date (home: NOW and `tries = 3`), then `call()` after 0.5 s.

### 8.6 Gotchas

- `tickSfx` passes a fresh `{ vol: 0.35 }` per call (≤20/s while rolling): the only per-tick allocation in these files.
- The `hum` loop must be stopped in both `fin` and `end` (it is).
- The dial is the only Rue mini-game that holds the YES-to-call until dialogue finishes: `update` returns early
  while `busy` (13:550).

---

## 9. Tether Rip (`tether`, 14:4-171)

### 9.1 Summary

| | |
| --- | --- |
| Rue uses | 1.4 (`25-…:171`): `{ shot: TETHER_SHOT, keepAlarms: false, lines: { after1: [steps], after3: [steps] } }` |
| Params | `shot` (applied at start and after each interlude) · `keepAlarms` (default true: hand the alarm loops to the content) · `lines.after1`, `lines.after3` cutscene steps played after the 1st/3rd rip |
| Result | `{rips: 4, alarms: keepAlarms !== false ? [loop handles] : []}` |
| World needs | Actor `chase`; props `tether_1..4` (rotated about x), `display_phone_1..4` (hidden on rip), `alarm_light` (shown and spun) |
| Side effect at load | Registers `ANIMS.stumble` (14:23-32), a 0.35 s stagger used on a miss |

### 9.2 Mechanics

A needle sweeps a bar back and forth; YES while it is inside the green zone rips the current phone.

| Phone | Speed (bar/s) | Zone width | Zone centre |
| --- | --- | --- | --- |
| 1 | 1.2 | 0.22 | 0.50 |
| 2 | 1.5 | 0.18 | 0.64 |
| 3 | 1.9 | 0.14 | 0.38 |
| 4 | 2.4 | 0.10 | 0.57 |

- Each phone starts with a 0.2 s lock-out. A miss: `twang`, Chase plays `stumble`, the bar shakes 0.3 s, 0.35 s
  lock-out. Three misses on one phone double that phone's zone.
- A rip (14:34-51): `rip` sfx, hides `display_phone_n`, starts an `alarm` loop (vol 0.45; `AUDIO.loop` detunes each
  layered alarm by 1.3%), shows the light, Chase `pull`, the hit zone flashes. After rip 1 and 3, `api.play(steps)`
  pauses `update` and runs the lines, then re-applies `shot`.
- After the 4th: 0.9 s, then `finish()` (Chase plays `carry`).

### 9.3 Rendering (14:84-151)

- **Cosmetic 3D runs in `draw()` on wall time** (`performance.now()`), so tethers keep twanging while `api.play()`
  suspends `update`: each tether's `rotation.x = base + amp·e^(−1.4a)·sin(11a)` (amp 0.6 ripped, 0.18 twanged)
  for 4 s.
- Red vignette (`createRadialGradient`, rebuilt only on resize) pulsing at 2 Hz, alpha rising with the number of
  alarms. **Reduce Flashing**: 0.5 Hz and much lower alpha; the light spins at 1.5 instead of 6 rad/s.
- The bar panel sits at `H − 92` (touch `H − 252`), with four phone icons (yellow = ripped) and a hint line.

### 9.4 End, autoplay

`end(r)` stops every alarm loop **not** handed over in `r.alarms`, resets tether rotations, clears the canvas.
Autoplay re-runs `init`, hides all phones, starts four alarms, shows the light, plays `rip`, finishes.

### 9.5 Gotchas

- `init()` resets `alarms = []` **without stopping** existing handles. Calling `autoplay` mid-game (e.g. as a TWO
  "skip") would leak the alarms already started.
- With `keepAlarms` true the content owns the handles and must stop them.

---

## 10. Wiring (`wiring`, 14:173-439)

### 10.1 Summary

| | |
| --- | --- |
| Rue uses | 1.5 `{layout:'machine'}` (`25-…:541`), 2.6 `{layout:'charger'}` (`28-…:490`) |
| Params | `layout`: key of `L` (default `machine`) |
| Result | `{zaps}` (total shocks) |
| Rendering | Full-screen overlay canvas: dark backdrop, header (title, "n / N connected · zaps k", hint), a metal plate in **design units 800 × 480**, components, corridors, wires, plugs, sparks, cursor |

Each wire is a **corridor** (a polyline). The player drags the plug along its own corridor from the start terminal
to the end terminal without touching the metal. There is no choice of pairing: plug *i* only ever goes to
terminal *i*.

### 10.2 Layout data (14:177-197)

```js
const L = {
  machine: { title: 'WIRE THE MACHINE', colors: ['#ef4b4b', '#ffd21f', '#3b8cff', '#34c96b'],
    wires: [[118, 75, 200, 75, 200, 53, … 712, 75], …] },          // 4 wires, left to right
  charger: { title: 'WIRE THE CHARGER', colors: ['#ef4b4b', '#3b8cff', '#f4f4f4'],
    wires: [[140, 196, …, 318, 200], [140, 284, …], [736, 240, …, 482, 240]] },   // 3 wires, the last runs right to left
};
```

A wire is a flat `[x0, y0, x1, y1, …]` array in design units; the first point is the plug's start, the last is
its terminal. Components (phones, the machine with a hand-written "Yes"; dynamo, transformer, cable) are drawn
by hard-coded `box()` calls per layout in `draw()` (14:360-391).

### 10.3 Geometry

- `layout()` (14:218-238): margins top 78 / bottom 20 (touch 118 / 200). **Portrait (`H > W`) rotates the board 90°**:
  `mx(x,y) = rot ? ox + (BH − y)·sc : ox + x·sc`, `my(x,y) = rot ? oy + x·sc : oy + y·sc`. Converts every wire to
  screen points in preallocated `SP[i]` (`Float32Array(32)`: max **16 points**) with cumulative arc length `CUM[i]`.
- Corridor half-width `HW[i] = 13` **screen px** (not scaled), ×1.5 after 3 zaps on that wire.
- `near(i, x, y)` (14:241-251): distance to the polyline, leaving the closest point (`qx, qy`) and its arc length
  (`qs`) in module variables (no allocation).
- Drag (14:325-338): the plug moves toward `cursor + grab offset` in ≤3 px sub-steps; any sub-step farther than
  `HW` from the centreline → `zap(i)`. Within 9 px of the terminal → connected (`pop`); all connected → finish
  after 0.8 s.
- `zap(i)` (14:262-272): `zap` sfx, 24 sparks into `SPK` (`Float32Array(120)`: x, y, vx, vy, life), a "ZAP!"
  flash, plug back to the start, 1 s stun (no grabbing).
- The drawn wire follows the corridor up to the plug's projected arc length, then to the projected point, then to
  the plug: it looks laid along the path.

### 10.4 Input (14:304-338)

| Device | Grab | Move | Drop |
| --- | --- | --- | --- |
| Mouse / touch | Press within 34 px of an unconnected plug | Cursor = pointer | Release (the plug stays where dropped) |
| Keys / pad | YES: nearest plug within 40 px, else the cursor **jumps** to the next unconnected plug and grabs it | `input.move` × 230 px/s | Release YES |

`down = held('yes') || pointer.down`. The cursor ring turns yellow while grabbing, red while stunned.

### 10.5 The flickering tube (machine layout only)

A 0.5 s blackout every 6.5-10.5 s (`tube_flicker` sfx); input continues in the dark. Reduce Flashing turns the
strobe into a soft `sin` fade.

### 10.6 Autoplay, gotchas

- Autoplay: `done = true; a.finish({ zaps: 0 })`.
- A resize or a touch↔non-touch scheme change re-runs `layout()`: **unconnected plugs jump back to their start**
  and any grab is dropped.
- Arrays are sized for **4 wires × 16 points**. A TWO layout with more needs bigger buffers.
- Corridors stay 26 px wide while the board shrinks: on a phone the 66-unit metal gaps can close.

---

## 11. Pedal Power (`pedal`, 15:6-169)

### 11.1 Summary

| | |
| --- | --- |
| Rue uses | 2.6, one session per day ×3 (`28-…:393-404`), retried with the band widened ±5 on failure; reused in 3.1 |
| Params | `band` `[lo, hi]` (default `[55, 80]`) · `session` (label "SESSION n / 3") · `rider` actor id (default `luka`) |
| Result | `{ok:true}` or `{failed:true}` (70 s without filling) |
| Side effects | On success `state.battery += 1` and `hud.set({battery, bars})`; `dynamo` loop (rate/vol follow speed); rider `play('pedal', {speed})` |
| Rendering | Overlay panel (560 px max) at the bottom: spinning bike wheel + dynamo + sparks, SPEED meter (green band, red zone > 90, needle, status word), two beat keys, CHARGE bar with % |

### 11.2 Tuning (15:7)

```js
const BEAT = 0.6, T0 = 1.2, WIN = 0.16, FAIL = 70, FILL = 100 / 42;   // 100 BPM, first beep at 1.2 s, ±0.16 s, 42 s in band
```

| Rule | Code |
| --- | --- |
| Beat | `beep` sfx at `T0 + k·BEAT` of game time (`t`), key glow 0.12 s |
| Judge | A press of the **other** button: nearest beat `k = round((t−T0)/BEAT)`; `\|off\| < WIN` and not already hit → `m += (target − m)·0.35`, "In time". Otherwise `m += 6`, "Early"/"Late". Same button twice → "Alternate!" (no effect) |
| Missed beats | Each beat past its window without a hit (after the first two) → `m −= 8` |
| Friction | `m −= 6/s`, clamped 0-100 |
| Target | `(lo + hi)/2 + 10` (77.5 by default: in-time play settles near the top of the band) |
| Progress | Only while `lo ≤ m ≤ hi`: `+FILL·dt` |
| Overspeed | `m > 90` for 1 s → sparks, `spark` sfx, progress −10 |
| Win | progress 100 → `chime_ready`, `win()`, 1.2 s spin-down, `{ok:true}` |

Buttons: left/YES = 0, right/NO = 1. With a mouse, left and right clicks alternate. Labels per scheme: kb ← →,
pad A B, touch YES NO.

### 11.3 Gotchas

- Beat timing is frame-quantised game time, and the beep is a plain `sfx` (not scheduled on the audio clock):
  up to ~17 ms jitter at 60 Hz, more on 30 Hz phones. Fine at ±160 ms windows, not for a real rhythm game.
- `rider.play('pedal', {speed})` is re-called whenever speed changes by > 0.1. `play` restarts the pose time
  (`poseT = 0`, `09-world…:248`), so the crank phase jumps back and blends over 0.2 s.
- `win()` uses the global `state`, not `api.state` (same object).

---

## 12. The card table: Pitch Cards (`pitch_cards`) and Customer Journey (`journey`) (16:26-280)

Two modes of one implementation that shares module state with the sequencer (only one runs at a time).

### 12.1 Summary

| | `pitch_cards` (3.1, `32-…:257`) | `journey` (2.10, `30-…:284`, from a `do` inside a hotspot cutscene) |
| --- | --- | --- |
| Left column | "RUE'S SPEECH": pinned cards Des, Bernie, Declan (red pin, can't be removed) | "IN ORDER": 4 numbered dashed slots |
| Right column | "LUKA'S NOTEBOOK": every name in `state.names` (in `NAMES` order) with a one-line note | "SIOBHÁN'S NOTES": GREET ASK LISTEN RECOMMEND, shuffled to LISTEN GREET RECOMMEND ASK |
| Goal | Any order; press the "YES — That's the speech" button | Place all four; correct order = GREET ASK LISTEN RECOMMEND |
| Finish | `{order}` + `state.flags.pitchOrder = order` | 0.5 s after the 4th card: right → `chime_ready`, green cards, `{ok:true}` 1.1 s later; wrong → `clunk`, cards drift back slowly (in the order 1,0,3,2) |
| Look | Wood table; continuous-form printout with tractor holes and "JARVIS ERR 4044" | Slate table; lined paper with a red margin |
| Autoplay | `order` = fixed three + collected names in notebook order | `{ok:true}` |

Cards are `{id, label, sub, fixed, x, y, tx, ty, wob}` in two arrays `Lst` (left, ordered) and `Rst` (pool).

### 12.2 Input

| Device | Action |
| --- | --- |
| Pointer | Press on a card starts a drag; release after < 6 px movement = **tap** (pool → list, list → pool, pinned → refuse wobble + `clunk`); a real drag inserts at the row under the card on the side under the pointer (pinned cards always left). Click on the confirm button (pitch). Right click: nothing. `tablePointer()` returns true for any table click, so it never falls through as YES |
| Keys / pad | ←/→ switch column, ↑/↓ move; ↓ past the left list reaches the confirm button (pitch, `fside = 2`). YES on the pool adds the card; YES on the list picks it up (`held`), then ↑/↓ swaps it through the list and YES/NO drops it. NO on the list returns a card (pinned: refuse) |

Hints switch between pointer and key text (`kb` flag) on the last device used.

### 12.3 Layout and animation

`tableLayout()` (16:46-61): `rowsN` rows fit between the header and the footer (touch adds 190 px); `cardH` 34-68
px; fonts scaled to `cardH`/`cw`; positions recomputed on resize. `place()` (16:171-181) eases each card toward
its slot every tick (`k = min(1, dt·16)`, 5 while shuffling back) and leaves a gap where a dragged card would
land. `wob` decreases by a hard-coded 1/60 per tick.

### 12.4 Gotchas

- `journey` is launched from a `do` step **inside a cutscene**: skipping that cutscene does not skip the mini-game,
  and while a cutscene runs, holding NO sets `clock.scale = 3` (`11-flow.js:445`), so NO (take a card back) also
  runs the table 3× faster while held.
- `state.flags.pitchOrder` stores an array in `flags`. 3.1's `order()` (`32-…:177`) falls back to the notebook order.

---

## 13. The Sequencer (`sequencer`, 16:282-413)

### 13.1 Summary

| | |
| --- | --- |
| Rue uses | 3.3 (`33-…:228`), after the player sits at the computer (`roam until seq_go`) |
| Params | none |
| Result | `{pattern}`, and `state.pattern = PAT.map((l) => l.slice())` |
| Rendering | Full-screen overlay: green-on-black tracker "PUDDING.SEQ", 92 BPM, an extras line (RAIN BED / TRILL INTRO / BELL ON or --), 4 lane headers (sample name or BLEEP, role), 16 numbered rows (every 4th bright), [PLAY]/[STOP] and [FINISH] buttons, a help line |
| Audio | `AUDIO.seq.play(PAT, state.samples, onStep)` / `AUDIO.seq.stop()`; fallback clock with `sfx` |

### 13.2 Data model

```js
const DEF = [[0, 4, 8, 12], [4, 12], [0, 2, 4, 6, 8, 10, 12, 14], [0, 2, 5, 7, 10, 13]];   // step indices per lane
const LANE = [ // sample key, name, role, cell tag, sfx, bleep rate
  ['dynamo', 'DYNAMO', 'KICK', 'DYN', 'dynamo_hit', 0.5], ['till', 'TILL', 'SNARE', 'TIL', 'till', 0.8],
  ['kettle', 'KETTLE', 'HAT', 'KET', 'kettle_click', 1.6], ['whistle', 'WHISTLE', 'LEAD', '', 'whistle', 1],
];
const MEL  = ['D-5', 'F#5', 'A-5', 'F#5', 'E-5', 'G-5', 'B-5', 'A-5', 'F#5', 'A-5', 'D-6', 'B-5', 'A-5', 'F#5', 'E-5', 'D-5'];
const MELR = [0, 4, 7, 4, 2, 5, 9, 7, 4, 7, 12, 9, 7, 4, 2, 0].map((n) => Math.pow(2, n / 12));
const PAT = [[], [], [], []];       // the live pattern: PAT[lane][step] = boolean, 4 × 16
const STEP = 60 / 92 / 4;           // 0.1630 s per 16th
```

**`state.pattern`** (declared in `newState()`, `01-config.js:119`): `null` until the sequencer finishes, then an
array of **4 lanes × 16 booleans** (JSON-saved with the game).

| Lane | Role | Sample key (in `state.samples`) | Sound if collected / missing | Pitch |
| --- | --- | --- | --- | --- |
| 0 | Kick | `dynamo` | `dynamo_hit` / kick bleep | — |
| 1 | Snare | `till` | `till` / snare bleep | — |
| 2 | Hat | `kettle` | `kettle_click` / hat bleep | — |
| 3 | Lead | `whistle` | `whistle` / D5 square bleep | **Fixed per step**: step *s* plays `MEL[s]` (re-pitched D5). The player toggles notes, never pitches |

Sample-driven extras (not lanes): `rain` (rain bed), `trill` (one intro bar), `bell` (every 4th bar). They are
shown as text; `AUDIO.seq` applies them. `beep` is not used by the song.

`loadPattern()` (16:331-334) accepts `state.pattern` only if it is exactly 4 arrays of length 16; otherwise `DEF`.
So re-entering the sequencer shows the last finished pattern.

Consumers of `state.pattern` (all through the audio player, which reads `pattern || DEF`):

| Where | Call |
| --- | --- |
| 3.3 after the sequencer (`33-…:310`) | `AUDIO.song(state.pattern, { samples, bars: 8, ending: true, onEnd })`, guarded by `flow.skipping` |
| 3.4 → 3.5 | `music('pudding_walkman')` → `music('pudding_warbly')` (one continuous player) |
| Credits (`18-…:83`) | `AUDIO.song(st.pattern \|\| DEF(), { samples, credits: true, onEnd })` |
| Extras jukebox (`10-ui.js:750-757`) | `AUDIO.song(s.pattern \|\| <inline DEF>, { samples, onEnd })` |

`DEF` is duplicated four times (sequencer, audio, credits, jukebox). Chapter Select into 3.4+ grants no pattern,
so those scenes play `DEF`.

### 13.3 Audio hookup

```js
function play(on) {                                   // 16:313-319
  const q = api.AUDIO && api.AUDIO.seq;
  if (on === playing) return;
  playing = on; playRow = -1;
  if (q) { own = false; if (on) q.play(PAT, state.samples, onStep); else q.stop(); }
  else { own = on; acc = STEP; }
}
const onStep = (i) => { playRow = i % 16; };          // 16:297
```

- **The live `PAT` arrays are handed to the player by reference.** `player()` (`03-audio.js:572`) reads
  `pat[l][s]` at schedule time, so a toggle while playing is heard within the 0.2 s look-ahead. No restart needed.
- `AUDIO.seq` mode `'seq'` (`02-audio.md` §11.4): drums lanes 0-2 + lead re-pitched by `MEL[s]`; **no pads, no
  bass**; rain bed if collected; with `trill`, one intro bar (trill only) first, during which `onStep` never fires
  (`playRow` stays −1 for 2.6 s); bell on the downbeat of every 4th bar if collected. Gains: sample/bleep 0.55/0.35,
  0.4/0.35, 0.3/0.3, 0.75/0.5.
- The audio player schedules hits 0.2 s ahead on `ctx.currentTime` (25 ms `setInterval` pump, 1.2 s ahead when
  hidden). `onStep(s)` comes from a preallocated 64-entry ring buffer, fired 0-25 ms after the step's audio time:
  the playhead row follows what is heard, not frame time.
- `AUDIO.seq.play` stops any previous seq player first; `stop()` fades it out in 0.05 s.
- **Fallback** (no `AUDIO.seq`; 16:349-352): `update` accumulates `acc += dt` and fires `hitSfx` for each step
  (frame-quantised). `hitSfx(l, r)` reuses one options object `SO`: rate = `MELR[r]` for the lead, 1 for collected
  samples, the lane's bleep rate otherwise; vol 0.8 / 0.6; sound = the lane sfx, or `beep` when missing.
- Toggling a step **on while stopped** previews it with `hitSfx`; otherwise `tick` (vol 0.5).
- `seqFinish()` and `end()` call `play(false)`.

The minigame's `LANE` table and the audio engine's `LANES` (`03-audio.js:551`) are **separate copies** of the same
lane→sample mapping. Change both or neither.

### 13.4 Input (16:346-373)

| Input | Effect |
| --- | --- |
| Pointer move | Cursor follows the cell (or button) under the pointer |
| Left click | Toggle the cell / PLAY-STOP / FINISH |
| Right click, NO | Play / stop |
| Arrows | Move the cursor; ↓ from row 15 enters the button row (row 16), selecting PLAY if the cursor was in lanes 0-1, else FINISH; ←/→ there switches buttons |
| YES | Toggle the cell, or press the selected button |

### 13.5 Rendering

`seqLayout()` (16:299-311): grid top 108 (+40 touch), `rowH` 16-30 px to fit 16 rows above an 84 px footer (+190
touch), number column 34-56 px, lane columns 62-150 px, centred. All strings are precomputed (`ROWS`, `MEL`,
`MELL` (lower-case "off" note names), `TAG`, `NAME`); `draw()` allocates nothing. The play row is a dark green bar.

### 13.6 Autoplay and gotchas

- Autoplay: `loadPattern()`, store a copy in `state.pattern`, finish. **It sets `playing = false` without stopping
  `AUDIO.seq`**, and `end()` → `play(false)` then returns early (`on === playing`). Harmless under `TEST.auto`
  (nothing is playing yet); a leak if TWO calls `autoplay` as a mid-game "skip".
- Autoplay also discards unsaved edits (`loadPattern()` reloads from `state.pattern`).

---

## 14. Performance and skip-safety review (Rue as shipped)

| Concern | Status in these files |
| --- | --- |
| Per-frame allocation | None in `draw()` of any canvas game (strings and fonts precomputed, `Float32Array` buffers for wires, sparks). DOM games write styles only when a quantised value changes (`shown`, `drawn`, `painted`). Exceptions: `dial` `tickSfx` `{vol}` object; `pedal` `rider.play()` promise on speed change; per-event objects (`{vol: 0.5}` toggles, pop-up specs) |
| First-start cost | DOM built lazily on first `start()` (`build()`), including a `<style>` parse and layout. Canvas gradients on first resize. No shaders compiled (no new 3D materials) |
| 3D | Only existing props/actors are touched. `ANIMS.stumble` is defined at load |
| Reduce Flashing | Tether vignette/light and wiring blackout honour `options.reduceFlashing` |
| Skip-safety | Mini-games are **not** cutscene steps; Skip Scene does not end them. Autoplay exists for every one (TEST only). `api.play(steps)` interludes are normal cutscene steps (skippable) |
| Pause | `update` stops; `draw` continues (must stay pure). Tether's cosmetic wobble uses wall time and keeps moving while paused. `AUDIO.seq` keeps playing while paused (no `ctx.suspend`) |

---

## 15. How to extend for TWO

### 15.1 Mapping: Rue mini-game → TWO (BUILD_PROMPT §9, ARCHITECTURE §3.6)

| Rue | TWO target | Reuse | Must change |
| --- | --- | --- | --- |
| `jarvis_sale` | **9.4 Neural Chip Sale** `chip_sale` (1.5) | `frame()` window, rows model, `act/done/next`, timers (`rowT`, typing), progress bar + quantised `draw()`, run/stale guards, one-tick debounce, `pop()`, bark bubble | SafeSense skin; 4 rows; FIFO in-window pop-ups; corner-able runaway OK; NO pushes the bar forward; JADE PLANT letter strip; brain MFA wait; Chip View swap mid-game; no crash/cap; Jayden THOUGHTs |
| `restart_ritual` | **9.12 Hack** `hack` (L21, boss stalls) | Wizard shell (steps list + panes), logout's "Are you sure → sure you're sure" chain, password-rule engine (`RULES/sat/showRule`), auto-typer (`typeTo`), `after()` timer | Full-screen phone "desktop" card instead of a JARVIS window; Error 4044 (YES twice); rules change *while typing* (timed); progress backwards / runaway pop-ups; embeddable in the boss |
| `restart_ritual` alt-tab (step 0) | **9.8 scooter dash prompts** `scooter` | 1.5 s countdown bar (`subT`), "Too slow" miss path, two-press `armed` window | YES within 1.5 s (else slow down); every 4th "sure you're sure" = YES twice (`armed` with YES/YES) |
| `restart_ritual` pray (step 4) | **3.6 Hold NO** `hold_no` (3 s ring), accessibility `holdToPress` | `pray` fill/decay + quantised `draw()` | NO only, 3 s, ring instead of hands; `options.holdToPress` → a single press completes |
| `wiring` | **9.3 Wiring** `wiring` (1.3 halves, L21 kettle cord) | Design-space board + portrait rotation (`mx/my/box`), touch-aware `layout()`, pointer + keys/pad grab model, cursor, sparks `SPK`, `zap` feedback, header/status/hint, tube blackout, end delay | Pairing puzzle (any left plug to any right terminal) instead of corridors; wrong pair = harmless spark + Chase (2040) hint; halves across calls; L21 layout (3 + kettle) |
| `sequencer` | **9.10 Sequencer "two"** `sequencer` (2.10) | Tracker grid, input model, cursor/button row, `AUDIO.seq` live-pattern hookup, fallback clock, preview on toggle, `loadPattern` validation | Lanes chosen from collected samples; lead lane pre-written ("two" melody, pitch per step per section); section strip; bridge feature slot + audition + 60 s auto-place; muffled playback stopping after the first chorus; ONE MORE PASS / IT'S DONE loop; new `state.pattern` format |
| JARVIS pop-up bugs (`POPS`, runaway, backwards, "Progress saved!") | **9.12 Hack pop-ups**, boss Pop-up drones (§10), Chip Ping 2 s flood | `pop()` random placement, nag list, `dodge`, `popup.clear()` on end | SafeSense `style`, `dur`/`ding:false` floods, NO dismissal |
| `pedal` | **9.6 Public Piano** `piano`; **9.11 Hum** (Blend In); **9.9 Sizzle** timers | Beat clock (`T0 + k·BEAT`, `WIN`, missed-beat sweep), feedback text, meter-in-band + progress-in-band, overspeed rule, panel drawing | 92 BPM; audio-clock judging; 5 falling-note lanes; misses lower piano volume (no fail); Hum = hold YES, needle must stay under 40 dB |
| `pitch_cards` / `journey` | **2.5 reason cards** `reason_cards`; **3.1 Secret Santa** `secret_santa` | Card table, drag/tap/keys, `place()` easing, refuse wobble, check-and-return, `drawCard` | Reason cards: tap a card into the slot → SafeSense rejection line; the blank card + "write CHRISTMAS" accepts |
| `keypad` | 2.2 limiter (type 2032), 2.8 Safe Box (4-digit code that changes each attempt) | Whole component; `onSubmit` promise contract; `say` over the pad | SafeSense/2040 skin; Safe Box: `onSubmit` re-rolls the AR code on a wrong guess. Not in ARCHITECTURE §3.6: add an id (e.g. `keypad` in a new `40-…59` file) |
| `buglist` | Extras "The Bug List, 2040 Edition" (a **card**, §13.8) | The paper/biro CSS look, `BUGS` + `seen_*` flags | Becomes a `CARDS` painter (canvas), not a mini-game |
| `dial` wheel column | 9.4 "pick letters from a strip" (JADE PLANT → JAYDEN) | `holdable`, mouse wheel, 22 px drag, hold-repeat acceleration, `.fast` blur, `paint()` on change | Values A–Z instead of numbers |
| `dial` number pad | Brick-phone dialling if ever playable (A1 dials in a cutscene) | `key()` accepts only the correct next digit | — |
| `tether` | Nothing directly (the boss Tether is 3D aim/throw/yank, §10) | `AUDIO.loop('alarm')` layering for the 1.3 display alarms; cosmetic-on-wall-time trick; Reduce Flashing vignette; `ANIMS.stumble` | — |

### 15.2 Neural Chip Sale (9.4, 1.5) from `jarvis_sale`

Port `12:1-497` into `src/43-mg-chip-sale.js` as `MINIGAMES.chip_sale`, then:

1. **Rows.** `['customer', 'verify', 'swap', 'optin']` with `ROWS`/`DONE` entries. Keep `makeRows`, `act`, `done`,
   `next`, `partial`, the `rowT` "Please wait…" timer and the row-change guard.
2. **Skin.** Replace `.mg-j/.mg-win/.mg-bar` CSS with SafeSense glass (rounded translucent white, blue glow, pill
   buttons) under a **new class prefix**. Keep `data-noyes` on the window and the mousedown `preventDefault`.
3. **Pop-ups in arrival order, landing on the field you need.** Rue's engine pop-ups route input to the **newest**
   one (`05-ui.md` §5.4) and position by viewport percent. Build them inside the window instead (like `.mg-cover`):
   a module-level pool of N pre-built pop-up elements, a FIFO array of open ones, YES/NO/click apply to `fifo[0]`
   only, spawn position from the current row's `getBoundingClientRect()` read **once at spawn**. Keep the
   one-tick debounce.
4. **Runaway OK you corner.** Local logic: on pointer approach (or YES on a focused OK), move the button away from
   the pointer, clamped to the pop-up/window rect; when clamped on two sides ("cornered"), stop dodging. Keys/pad:
   after N YES presses it gives up (keep it finishable without a mouse).
5. **Progress bar goes backwards; NO makes it go forwards.** Reuse `prog/target` and quantised `draw()`. Drive
   `prog -= k·dt` while a "backwards" bug is active; `if (I.pressed('no')) prog = Math.min(target, prog + 8)`. NO is
   free here (mini-games are not cutscenes), but gate it with `block` so it doesn't also dismiss a pop-up.
6. **JAYDEN → JADE PLANT.** Reuse the `typing`/`typeT` typewriter (0.09 s/char) for the autocorrect reveal. Fix by
   retyping from a letter strip: port the dial wheel column (`13:342-367`, `372-375`, `389-397`) with 26 values
   and a SET/next-letter action; complete when the field reads JAYDEN.
7. **MFA to the customer's brain (3%).** A 3 s `rowT` wait with "Customer's brain is on 3%"; trigger Jayden's
   muesli-bar anim once via `api.world.actor('jayden').play(…)` (an anim id from `04-art`).
8. **Chip View tutorial mid-game.** The host disables SWAP and the player during a mini-game (flow `tick` handles
   swap only while `flow.roaming`). Split the sale in two calls, like Rue's cycles:
   `['minigame','chip_sale',{part:1}]` (ends at the consent-phrase row, result `{phase:'consent'}`) →
   `['roam',{until:'s15_consent', auto}]` (SWAP to Chase (2040), hold CHIP, `AR.add` the phrase over Jayden) →
   `['minigame','chip_sale',{part:2}]`, which pre-completes rows silently with `done(r, true)` exactly as Rue's
   cycle 2 / reprise do (`12:361-364`).
9. **THOUGHT pop-ups.** `popup({ style:'safesense', msg:'THOUGHT: …', buttons:[], dur:2.5, ding:false, at:{actor:'jayden'} })`
   (actor-tracked positioning exists in `popup`). Pick the pool from the soft timer `t` (replace `crash('cap')`).
10. **Barks.** Replace the private bubble (`12:323-342`) with TWO's `bark(id, text)` API. If an in-window bubble is
    kept, keep the shared `V` vector and the `cam.project` clamp.
11. **No fail, no crash.** Finish `{ok:true}` when the last row completes. Keep `autoplay` setting the TWO bug
    flags the script needs, then `fin({ok:true, auto:true})` after `wait(0.6)`.

### 15.3 Wiring (9.3) from `wiring`

Port `14:173-439` into `src/42-mg-wiring.js`:

- **Data:** `L[layout] = { title, left: [{color, at:[x,y]}…], right: [{color, at:[x,y], hint}…], pairs: [rightIndex per left] }`
  in the same 800×480 design space. Keep `mx/my/box` and portrait rotation.
- **Drag:** keep the grab model (§10.4) and cursor; drop on a terminal within ~20 px. Correct pair → `pop`,
  connected. Wrong pair → reuse `zap()` sparks/sfx but **no stun and no plug reset** ("spark harmlessly"); then
  `api.say('chase40', hint)` or `bark` with that terminal's hint ("Teal's sort of blue now. Don't ask."). Remove
  the corridor/`near()` test (or keep it as an optional `maze: true` layout flag).
- **Halves around the swap (1.3):** params `{ layout:'remote', wires:[0,1] }` then `{ …, wires:[2,3] }`. Persist
  connected wires in `state.flags.s13_wires` (array) and pre-connect them on start; `finish` when the requested
  subset is done.
- **L21 kettle cord:** a layout with 3 real pairs plus a 4th plug whose terminal is the kettle (precedent: Rue's
  `charger` has 3 wires, one running right to left).
- Fix the Rue gotchas: don't reset unconnected plugs on resize (store plug positions in design units and map
  them in `layout()`), size buffers for the largest layout.

### 15.4 Sequencer "two" (9.10) from `sequencer`

Keep: the grid draw/layout, cursor + button-row navigation, pointer hover/click, NO = play/stop, preview on
toggle, the fallback clock (headless tests may have no `AUDIO.seq`), `loadPattern` validation, FINISH copying the
pattern into `state`.

Change:

| Need | Implementation |
| --- | --- |
| Lanes from collected samples, any order | A picker per lane header (YES on a header cycles/opens a list of `state.samples`); `lanes[l] = sampleId \| null` (null → bleep). Lane sound = `SAMPLES[id].sfx`; replace the fixed `LANE[l][0]` lookup and keep `HAS/NAME/TAG` precomputed per change |
| Lead lane pre-written ("two", §15.3) | Pitch per step **per section** (verse and chorus lines, eighth notes), not `MEL[s]`. Show note names from a precomputed table per section; toggling only switches notes on/off |
| Section strip INTRO · VERSE · CHORUS · VERSE 2 · BRIDGE · CHORUS · OUTRO | A row of 7 cells above the grid; selecting one shows that section's 16 steps (grooves are per song, the lead per section). Everything but the bridge is pre-arranged |
| Bridge feature slot | Auditioning a sample: `sfx(SAMPLES[id].sfx)` (or a one-bar bridge preview via the player); every sample except `laugh` → `bark('chase40', 'Fine.' / 'Yeah, fine.' / "That's fine.")`; `laugh` → stop input, run the 2.10 lines via `api.play(steps)` (update pauses, draw continues), lock `bridge = 'laugh'`. A 60 s game-time timer auto-places it (same `api.play` path) |
| Playback muffled, stops after the first chorus | `AUDIO.song({ pattern, from:'intro', to:'chorus', muffled:true })` (`02-audio.md` §16.2) instead of `AUDIO.seq`; keep `onStep` → `playRow` for the playhead, extended with the section index |
| ONE MORE PASS / IT'S DONE | Not part of the grid: finish the mini-game with `{pattern}` and run the loop as content (`choose([...])`, disabled option after the 2nd pass; `05-ui.md` §4.2). The clock jumps are time cards/`hud.quiet` |
| `state.pattern` format | Align with `02-audio.md` §16.2: `{ v: 2, lanes: [{ sample, steps: [16 bools] } ×4], lead: { [section]: [16 bools] }, feature: 'laugh' }`. Update every consumer at once: the "two" player (3.6, credits, Extras jukebox, 3.4 `boss` cue). Keep Rue's 4×16 array **only** for the 1987 Pudding song (hold music, Walkman, jukebox), and give it one shared `PUDDING_DEF` constant instead of four copies |
| Chapter Select | Grant a default `state.pattern` for scenes after 2.10 (Rue grants none) and always include `laugh` in it, since §17 requires the laugh in the bridge of 3.6 |

Pitfalls specific to the sequencer:

- Pass the **live** arrays to the player (as Rue does) so toggles are heard within 0.2 s; never rebuild the pattern
  object per toggle while playing.
- Stop the player in `end()` **unconditionally** (fix Rue's `play(false)` early-return when `playing` was cleared).
- A trill-like intro bar delays the first `onStep`; don't treat `playRow === -1` as "stopped".
- The audio player's lane→sample table and the mini-game's table must come from one shared definition.

### 15.5 Hack (9.12) from `restart_ritual` + JARVIS pop-up bugs

- **Shell:** a full-screen phone "desktop" card (DOM in `#mg`, or canvas) with a queue of SafeSense pop-ups. Each
  pop-up type is a small state machine with `update(dt)`, `draw()`, `done`:
  - **sure:** Rue's `logout()` chain (`12:652-665`), but the third ask accepts anything.
  - **runaway:** see 15.2 step 4.
  - **backwards:** see 15.2 step 5.
  - **password:** reuse `RULES/sat/showRule/typeTo`, but the rule changes on a **timer while typing** and the
    player must finish one of three short words before it changes. Keep the auto-typer as the keys/pad/touch path.
  - **e4044:** YES twice within a short window (Rue's `armed` pattern, `12:702-703`, with YES/YES).
- **L21:** params `{ bugs: ['sure', 'runaway', 'backwards'] }` in a row → ACCESS → `{ok:true}`.
- **Boss stalls (3.4):** the boss is itself a mini-game and the host has **one slot** (`mg`), so `flow.minigame('hack')`
  from inside the boss would orphan the boss. Expose the stall as an embeddable component, e.g.
  `MINIGAMES.hack.embed(api, { bug }) → { update(dt), draw(), end(), done: Promise }`, and have `boss.update/draw`
  forward to it while a stall is active (the boss keeps rendering; its hack % stays frozen). Use the same
  component from `hack.start` so L21 and the boss share one implementation.
- **Restart chime:** TWO allows it only twice (NO in 3.6, end of "two"). Do not reuse Rue's `restart_chime` on
  success (`12:621`); use a SafeSense chirp.

### 15.6 Public Piano (9.6), Hum (9.11) from `pedal`

- Keep the judging loop shape (`15:53-66`): beat times `T0 + k·BEAT`, nearest-beat matching, a sweep that marks
  missed beats, feedback text with a fade.
- **Judge on the audio clock**, not frame time: schedule the click/notes with `AUDIO.seq`-style look-ahead and
  compare `AUDIO.now()` at the press (core input timestamps are per tick) against the scheduled times
  (`02-audio.md` §16.2). At 92 BPM with 16ths (0.163 s apart) frame quantisation matters.
- Five lanes of falling notes over four bars; misses scale the piano's volume (`loop.vol()` or per-note `sfx` vol),
  never fail; the result feeds the drone's investigate delay.
- Hum (Blend In): reuse the meter (`m`, needle, band, colour words) with an upper limit of 40 dB: holding YES raises
  `m`, release lowers it; the band is `[0, 40]`.
- Don't call `actor.play()` on every speed change (crank-phase reset); drive a pedal/hum anim parameter instead.

### 15.7 Reason cards (2.5) and Secret Santa (3.1) from the card table

- Reason cards: one slot (left, `rowsN = 1`), five cards plus a blank one in the pool. Tapping a card into the slot
  triggers `api.play([{ say:'safesense', text:'Family is a risk factor.' }])` and the card drifts back (Rue's
  journey "shuffle back" path, `16:195-199`). The blank card needs the marker (an inventory/flag check) and becomes
  CHRISTMAS (change `label`, re-layout fonts) → accepted → `{ok:true}`.
- Reuse `tablePointer` (swallows table clicks so they don't become YES), `tableKeys`, `place()`, `drawCard`. Make
  `wob` decay use `dt`.

### 15.8 Keypad (2.2 limiter, 2.8 Safe Box)

- Port `13:149-227` as is (it already supports async `onSubmit`, wrong-code feedback and dialogue over the pad).
  Reskin the CSS. Safe Box: `onSubmit` compares against the current AR code and re-rolls it (`AR` label update) on a
  miss; return `false` to keep the pad open.
- The limiter/Safe Box are roam puzzles: call `c.flow.minigame('keypad', …)` from the hotspot (like 1.4), and set
  `player.enabled = false` yourself if needed (only the scene-step form does it).

### 15.9 Engine-level changes the mini-games need

| Need (spec) | Change |
| --- | --- |
| "Skip this mini-game" after two failures (§9, §13.8) | Count failures per mini-game run in the mini-game (`api.fail()` → `flow.mgFails++`); the pause menu offers Skip when ≥ 2 and calls `m.autoplay(api)`. **Every autoplay must be safe mid-game**: stop loops/players it didn't start fresh (fix tether's alarm leak and the sequencer's seq leak), not re-`init` running state, and produce the same end state as success |
| SWAP inside a mini-game (Wiring halves, Chip Sale, boss) | Either split into several `minigame` calls around a `roam` (preferred, §15.2-8), or let the mini-game read `input.pressed('swap')` and call the flow's swap function (export it from `32-flow.js`) |
| Nested mini-games (boss stalls) | Embeddable components (§15.5), not a second `minigame()` call |
| `holdToPress` option (§13.9) | Every hold (pray-style fills, Hold NO, record-hold) checks `options.holdToPress` and completes on one press |
| Story Mode | Wider timing windows / slower interference in each mini-game (read `options.storyMode` in `start`) |
| Pop-up ordering / SafeSense style | `05-ui.md` §13.2 (style, `emptySlot`, FIFO option) |

### 15.10 Pitfalls checklist for every TWO mini-game

- **No per-frame allocation.** Precompute strings and fonts in `layout()`; keep particle buffers in `Float32Array`s
  (Rue's `SPK`); reuse sfx option objects (Rue's `SO`, not `{vol}` literals in `update`); write DOM styles only when a
  quantised value changes (Rue's `shown`/`drawn`/`painted` pattern); never call `actor.play()` per tick.
- **Warm up at boot.** Rue builds DOM on first `start()`. TWO should call each DOM mini-game's `build()` (expose
  `warm()`) behind the loader so the first open doesn't parse CSS and lay out mid-scene. Pre-warm the pop-up pool
  for pop-up storms. Any 3D the mini-game shows (Jayden, the junction box, the slate) must already be compiled by the
  set build: mini-games must not create new materials.
- **Instancing/merging:** canvas mini-games draw 2D only; 3D props they animate (tethers, phones) belong to the set's
  merged/instanced geometry rules. Don't add per-mini-game meshes at runtime.
- **Skip-safety of cutscene steps.** `api.play(steps)` interludes and lines launched from mini-games are ordinary
  cutscene steps: they must snap to their end state when skipped. A mini-game launched from a `do` step inside a
  cutscene (Rue's journey) is **not** skipped by Skip Scene, and holding NO speeds it 3× (`clock.scale`): launch
  mini-games as scene steps, or guard with `c.flow.skipping` and apply the autoplay end state.
- **Guard async continuations** with the `run` id; check `phase` after every `await`.
- **`draw()` must be pure**: it runs while paused and during `api.play()`. Only cosmetic wall-time effects belong
  there (Rue's tether wobble).
- **Stop everything in `end()`**: loops (`h.stop()`), `AUDIO.seq`/songs, raw `keydown` listeners, focused inputs,
  `popup.clear()` if you opened pop-ups, prop transforms you changed.
- **Clicks outside a DOM window are YES**: put `data-noyes` on everything clickable that isn't a `<button>`, and
  decide whether the root should be click-through.
- **Reduce Flashing** for every blackout, strobe and flash (Rue's tether/wiring pattern).
- **Touch:** add ~190-200 px bottom margin when `input.scheme === 'touch'`; re-layout on scheme change; never focus
  a text input on touch.
- **One class prefix per mini-game** in its `<style>`; the root's style applies only while attached.

---

## 16. Gotchas, consolidated

1. `api.finish` empties `#mg`: DOM roots must be re-appended in every `start()`.
2. Only one mini-game at a time; a nested `minigame()` orphans the outer one.
3. `update` pauses during `api.play()`, the BAG and the pause menu; `draw` never pauses.
4. Clicks/taps outside a DOM window are YES presses (§3.6).
5. Rue's autoplays are TEST-only: tether leaks alarms and the sequencer leaks `AUDIO.seq` if called mid-game.
6. Engine pop-ups take input newest-first; Rue relies on `popup.count()` plus a one-tick debounce.
7. `jarvis_sale` crash and end call `popup.clear()` (closes every pop-up).
8. Wiring re-layout resets unconnected plugs; buffers cap at 4 wires × 16 points; corridor width is not scaled.
9. Pedal beat and sequencer fallback timing are frame-quantised; `AUDIO.seq` timing is sample-accurate.
10. The sequencer passes live arrays to the audio player: mutations are heard within 0.2 s.
11. `DEF` exists in four places and the lane→sample table in two (sequencer `LANE`, audio `LANES`).
12. A mini-game started from a `do` step inside a cutscene isn't skipped and runs 3× while NO is held.
13. The restart ritual installs a capture-phase `keydown` listener; the keypad and dial install bubbling ones;
    all are removed in `end()`.
14. `pedal`'s `rider.play` restarts the crank pose on every speed change.
15. `state.flags.pitchOrder` is an array inside `flags`; `state.pattern` is `null` until the sequencer finishes and
    Chapter Select grants none.
