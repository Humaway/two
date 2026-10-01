# Mini-game reports: piano, sizzle, sequencer

## piano
## Report: MINIGAMES.piano (spec 9.6 and 2.2)

The Public Piano mini-game is built and committed as `8939f9e`. That commit holds only `/home/user/two/src/44-mg-piano.js`, and nothing was pushed. All test runs finished with 0 errors and 0 warnings. The dev scene has been deleted.

### Entering it from 2.2

The scene needs to set up four things first:
- **Limiter:** green (`limiter_light.set('green')`) before the game starts.
- **Chase:** placed at `s22_piano_chase` and seated with `act sit { h: 0.48 }`. The game switches him to `piano_play`.
- **Music:** off or quiet. The click and the piano are the music, and `seaside` would clash.
- **Drone:** the lane drone spawned, with its id passed as `drone`.

```js
// hotspot h22_piano do (Chase):
const r = await c.flow.minigame('piano', { continue: true, drone: '<laneDroneId>' });
// 2.2_piano step 1:
{ do: (c) => waitUntil(() => !MINIGAMES.piano.playing || c.flow.skipping) },
{ do: () => MINIGAMES.piano.stop() },   // needed when the cutscene is skipped
// back to play for the sneak:
['minigame', 'piano', { sneak: true }]  // returns at once; stops itself when Chase walks off the stool
```

The camera defaults to `{ shot: 'INSERT', at: 's22_piano_play' }` when that anchor exists; `shot: false` leaves the camera alone. While the game runs it sets `player.enabled = false` (A, S and D are lanes) and restores it afterwards.

After `goTo` the drone ends idle at `s22_drone_piano`. The scene needs to release it or give it a new path for the sneak.

### Params
| Param | What it does |
| --- | --- |
| `shot` | Camera shot; default as above, `false` = don't touch the camera |
| `continue` | `true`: after the phrase Chase plays on by himself (verse bars 5–8, chorus, verse 2) and stops dead at bar 1 of the bridge. `{ to: bar }` stops earlier. The game finishes about 0.5 s after the phrase, and `result.handle` is the playback still running. |
| `drone` | A `DRONES` id. After the last note the drone turns amber and drifts toward `droneTo` at `droneSpeed`. |
| `droneTo` | Default `s22_drone_piano`, else the `piano` prop |
| `droneLine` | `false` = no bark. Otherwise it barks DRONE "Excuse me! That's quite loud!" after the last note. |
| `player` | The actor at the keys; default `'chase'` |
| `at` | Optional point for positional sound; default is flat |
| `sneak` | Sneak mode; also takes `from`, `loop` (default `[0, 16]`, verse plus chorus round and round), `loudness`, `vol` and `stopOnMove` (default true) |

### Result
```
{ ok, loudness 0..1, level, dB, perfect, good, misses, hits, total: 28, droneSpeed, continuing, handle | null, auto? }
```
- **`loudness`:** each note counts 1 in time, 0.75 close, 0 missed, averaged over the 28 notes.
- **`droneSpeed`:** a suggested speed in m/s, `0.2 + 0.6 × loudness`.
- **Sneak mode:** `{ sneak: true, handle, loudness }`.
- **Skipped:** `{ skipped: true, ok, loudness ≥ 0.6, … }`. With `continue`, Chase plays the rest of the phrase himself.
- **Never fails:** the game never calls `api.fail()`, because the spec says misses don't fail. So the skip offer only appears if a scene somehow counts two failures; the skip path is still handled.

### Playback API
- `MINIGAMES.piano.play({ from, to = 24, loop, loudness, vol, lead, player, at, stopOnMove })` returns a handle. Bars count from the verse: 0–7 VERSE, 8–15 CHORUS, 16–23 VERSE2, and 24 is the dead stop.
- The handle has `mode`, `playing`, `bar`, `section`, `reason` (`bridge`, `end`, `stop`, `moved`, `flow`, `replaced`, `abort` or `skip`), `stop()`, `vol(v)` and a `done` Promise.
- Also on the object: `MINIGAMES.piano.stop()`, `.playing`, `.handle`, `.loudness` and `.droneSpeed(l)`.
- Events: `piano:start`, `piano:section` and `piano:stop` (with the reason). Everything stops on `flow:stop`.

### Controls
- **Keyboard:** A S D F G, also 1–5 and ← ↓ Space ↑ →. Keys and taps are timed on the audio clock inside their event handlers.
- **Gamepad:** d-pad ◀ ▼ ▶, then A and B.
- **Mouse and touch:** click or tap a lane or its key.
- **Story Mode:** wider timing windows, and any key, YES or tap plays the next note.
- **Hold to confirm:** not applicable; there are no holds.

### What the autoplay does
It plays the phrase on game time (so `&speed` applies) and hits every note in time except notes 12 and 23. The result is always loudness 0.93 and droneSpeed 0.76. The drone line runs as in play. Chase's playing-on runs at 6× under autoplay, so a test reaches the dead stop in about 9 s of game time. There is no Choice here, so `TEST.ending` doesn't apply.

### Tests
- **Autoplay, speed 2, screenshots:** the phrase, then the continuation to the dead stop (reason `bridge`), then sneak mode stopping with reason `moved` once Chase walked off. I read the screenshots.
- **Fast pass (`fast=1&speed=8`):** clean.
- **Scripted keys and mouse:** the tally matched exactly: 19 in time, 4 close, 5 missed, loudness 0.79. Story Mode got all 28.
- **Pause-menu skip and bare `play()`:** both worked.
- **Phones:** I took touch-emulated screenshots at 390×844 and 844×390 and made layout fixes for the stick, the buttons and the pause button.
- **Forced live audio clock:** clean, but on this heavily loaded machine the scripted presses arrive late, so that run scored 17/4/7.
- **Line check:** "Excuse me! That's quite loud!" is now present for 2.2.

### Deviations
- **Bark timing:** the drone line comes after the last note, not mid-phrase. On landscape phones the bark box sits over the keys.
- **Call-and-response:** I read this as the phrase's own shape (bars 1–2 call, bars 3–4 answer) and added no extra mechanic.
- **Misses:** a missed note isn't sounded, so the piano gets quieter and the left hand follows a live level. A press with no note to match plays a soft wrong note.
- **Sneak:** this mode finishes the mini-game immediately and hands back the playback.

### Sounds
Nothing is missing. I used `AUDIO.note` (the piano voice), `tick` for the 92 bpm click (pitched down on the downbeat, since there is no dedicated metronome sound) and `drone_q`.

### Engine notes
- **Docs vs code:**
  - ENGINE.md still says mini-games have no skip, but the code has `flow.skipMinigame` and `skipResult`.
  - The art report asked for a world hook to merge `ANIM_ONE` into the one-shot table; that is already done in `30-world`.
- **Seated hands:** `actor.play()` can't set `p.sit`. An upper-body anim started in the same tick as `sit` would stand Chase up, so I set `rig.seated = true` myself when he is in `sit`.
- **Isolated builds:** `--mine` still pulls in other agents' untracked files. That includes the parade set, the other mini-games and `89-content-devtest.js`, which doesn't match the `89-content-dev-` prefix.

## sizzle
Sausage Sizzle is done and committed as `f7b5e56`, which contains only `src/47-mg-sizzle.js` (`MINIGAMES.sizzle`, an IIFE with no top-level names). Both required runs on the final code were clean (0 errors, 0 warnings): `autoplay=1&speed=2` with screenshots, and `fast=1&speed=8`. Every line this game owns is present: `check-lines --scene 9.9` reports 3/3, and the misses left in 2.6 are only the two cutscenes, which belong to content. I deleted the dev scene and did not push.

## API
`['minigame', 'sizzle', {}]`. All params are optional:
- **`target`**: customers to serve, default 10.
- **`start`**: `'chase'` (default) or `'luka'`.
- **`banter`**: steps keyed by served count, default `MINIGAMES.sizzle.BANTER` (2.6's lines word for word); `false` turns it off. Each entry is `{ at: n, steps: [...] }`. A step can be:
  - `{ bark: id, text, tag?, act? }`
  - `{ turn: true }` (Luka turns a sausage that doesn't need turning)
  - `{ wait }`, `{ act: [id, anim] }` or `{ do: async api => {} }`
  - By default "Why's it called a snag?" plays after customer 2 and the 2IC exchange after customer 5, ending with the turn.
- **`intro`**: plays Luke's "Nobody gets a favour from me on an empty stomach. Grab some tongs." as a bark at start. **Pass `intro: false` if the scene already says it** (the set doc assigns that line to content). I left it on by default so the line can't silently go missing just because check-lines finds it in my file.
- **`shots: { luka, chase }`**: overrides the 3D lens for each station.
- **`place`** and **`dress`**: both `true` by default. `place` puts the actors on the `sz_*` marks; `dress` calls `SETS.sandgate.dress('sizzle26', { keepEnv: true })`.
- **`tray`**: cooked snags in the tray at start, default 2.
- **`onServe`, `onBurnt`, `onTakeover`**: optional callbacks.

**Result:** `{ ok: true, served, burnt, takeovers, wrong, turns, stirs, active }`. The game never fails, so there is no `api.fail()`. A pause-menu skip returns `{ skipped: true, ok: true, served: target, … }` via `skipResult`; I tested that path by forcing the offer. The game sets `state.flags.s26_sizzle` unless the run was aborted.

**Events:** `sizzle:swap`, `sizzle:served`, `sizzle:burnt`, `sizzle:takeover`, `sizzle:done`. There is also a read-only `MINIGAMES.sizzle.peek()` snapshot for tests.

## How 2.6 should enter it
- Have sandgate current, with `luka` (with `flags.santa`), `chase`, `chase40` and `luke40` spawned anywhere.
- Start the game at least one frame into 2.6 (any cutscene does this). On the first frame of a new scene the set re-dresses itself to `luke26`, which would undo the game's `sizzle26` dress.
- The game handles placement and camera itself:
  - **Actors:** Luka takes the set's `tongs_spare`; Luke flips beside him; Chase (2040) stands at the open cash tin looking into it.
  - **Camera:** its own lenses — across the plate for Luka, and from the queue for Chase, showing the whole team. They are re-aimed for landscape and portrait phones.
- **After it ends:**
  - The tongs are back on the rail.
  - The queue has stopped refilling.
  - The set is still in `sizzle26`, so 2.6_invite should dress `invite26`.
- The Sizzle sample isn't inside the game. Use the set's `h26_sizzle` hotspot (Chase only) in a short roam afterwards.

## Autoplay
A deterministic bot plays with the same actions as a player, at 2× game time; the whole game takes about 34 s of game clock. Along the way it serves one deliberately wrong sauce, and once two customers have been served it lets three snags burn so Luke takes over ("Easy, Santa."). Before finishing it waits for the banter to end. Each serve is logged as `sizzle: served n at t`, followed by `sizzle: done …`.

## Deviations from the spec
- **Two-sided snags.** Only the side facing down cooks. "TURN!" means turn it; once both sides are done the label reads "READY!" and YES lifts it into the tray. Turning early is harmless, which is what makes the "turn a sausage that doesn't need turning" banter beat work.
- **The stations depend on each other.** The front sells from a tray of cooked snags. If the onions aren't stirred they catch, and the front can't add onions until Luka stirs them. Stirring is hold YES (or a single press with hold-to-press on).
- **Customer lines are mine.** I wrote ten customer orders, their 2040 quirks, and three SafeSense chip pop-ups, one of which is "No dog detected." for the man with the dog lead.
- **Other UI moves while the game runs.** The bark box moves to the top of the screen, the objective line is hidden, and the touch stick and BAG are hidden. This is done with a `<style>` inside `#mg`, so it disappears when the game finishes.

## Engine notes
- **Docs lag the code.** `docs/engine/06-flow.md` §10.3 and the ENGINE.md cheat sheet ("No skip") don't list `api.fail`, `noSkip` or `skipResult`, which the code has. I followed the code.
- **`queue.bubble` height.** It returns head + 0.28 m, not the + 0.4 m the set doc says; I compensate for it.

## Testing
- **Screen sizes:** I checked screenshots at 1280×720, 844×390 (touch) and 390×844 (touch, portrait).
- **Real input:** I drove the game with key presses, mouse and touch in Playwright. Every action tested worked: Enter/Esc/Tab/arrows, hold to stir, hold-to-press, clicking a snag, clicking the other card to swap, dragging onto the bread, right-click to take back, and skip.

## Missing sounds
Nothing was added to audio. Where a sound doesn't exist I used the nearest one:

| Missing sound | Used instead |
| --- | --- |
| tongs click / snag turn | `tick` + `sizzle` |
| sauce squirt | `pop` |
| bin scrape | `smoke_pop` / `thud` |
| chip tap-to-pay | `chip_chime` |
| station swap | `whoosh` |

## sequencer
The sequencer mini-game is done and committed as `2515ca6`. That commit contains only `src/48-mg-sequencer.js`; nothing was pushed and the dev scene is deleted.

On the final build, both required runs on the valley Starlight desk finished with 0 errors and 0 warnings: `autoplay=1&speed=2` with screenshots every second, and `autoplay=1&fast=1&speed=8`. Earlier builds also passed:
- the variant where Chase (2040) drags the laugh in himself;
- a real-keyboard run with the autoplayer disabled;
- a landscape-phone (844×390) run with real taps, which took the "…That was quick." path.

The portrait layout (390×844) was checked by screenshot. All 2.10 lines that happen inside the mini-game are present verbatim (L1375–L1389, including "one more pass"). The other 16 missing 2.10 lines belong to the scene's own cutscenes.

**How the scene enters it.** In 2.10, after 2.10_promise, add `['minigame', 'sequencer', {}]`. The defaults pick up valley's names when they exist:
- the slate sits over the `s210_desk_two` shot;
- the bridge beat cuts to `s210_c40_close`;
- each clock jump cuts to `sl_clock` with a time card;
- set props used: `slate_desk.screen('seq')`, `foh_desk.state('live')` during playback (then `'half'`), `wall_clock_sl.set(h, m)`.

The scene needs `chase40` seated at `s210_c40_desk` and `chase` on the amp at `s210_chase_amp`, with valley dressed `three210`. It fades out the current music cue (the slate is the music) and hides the touch stick while it runs. QUIET IN on the HUD counts down with the clock, from 08:58:00 to 08:06:00 after two passes. 2.10_bounce follows.

**Parameters** (all optional):
- `shot`: the camera behind the slate; `false` leaves the camera alone.
- `shots: { c40, clock }`: the two cutaway cameras. If the set has no `sl_clock`, the time jumps big on the slate instead.
- `onBridge`: replaces the inline bridge beat. It can be a step list, or `(api, { dragged }) => Promise` for a scene cutscene; `false` means no beat. The laugh locks in when it resolves.
- `lines: { stop, quick }`: replace the "Stop." exchange or the "…That was quick." exchange.
- `time` (default `'3:00'`), `clock` (default `[['3:14'], ['3:31', '3:52']]`), `place`, `dragAfter` (default 60 s), `gain`, `music: false`.

**Result:** `{ ok, pattern, lanes, passes, quick, stopped, dragged, auditioned, time }`.
- `state.pattern` is stored as `{ lanes: [id | null ×4], steps: [[bool×16]×4], lead: [bool×64] | null, bridge: 'laugh' }`, which is exactly what `AUDIO.song`, `AUDIO.bakeSong` and `music('two')` read.
- `AUDIO.bakeSong(state.pattern, { samples })` starts in the background when it finishes.
- `MINIGAMES.sequencer.pattern(samples)` returns a complete pattern without playing, for Chapter Select grants after 2.10.
- Events: `sequencer:lane`, `sequencer:audition`, `sequencer:bridge`, `sequencer:playback`, `sequencer:pass`, `sequencer:done`.

There is no fail state, so it never calls `api.fail()` and the skip offer can't come up. If it is skipped anyway, empty lanes get Chase's own picks and the laugh goes in the bridge. An aborted run stores nothing.

**Autoplay** plays it like a player:
1. Picks Chase's four lanes from the list.
2. Toggles two steps and a lead note.
3. Auditions one other sample ("Fine."), then the laugh, which plays the beat and locks in.
4. Plays back for about 2.5 s.
5. Presses ONE MORE PASS twice, through to "Stop.", then IT'S DONE.

`&seq=quick` (or `test: 'quick'`) presses IT'S DONE first instead.

**Deviations and interpretations:**
- **Lead editing is shared.** The audio engine's lead mask is indexed by bar of the 4-bar line and step, and applies to both verses and the first chorus alike. Toggling a note therefore affects all three. The last chorus (the 1987 melody) and the bridge lead are shown read-only. A per-section lead would need a change in `03-audio.js`.
- **Clock jumps:** pass 1 goes to 3:14; pass 2 goes 3:31 then 3:52, then "Stop.".
- **Lanes start empty** (synth bleeps) on Chase's default groove, unless a stored pattern exists. "Pick a sample for each lane" is the first task.
- **"Fine." is a bark,** given about 1.5 s after an audition. A quick burst of auditions gets one reaction.
- **Bridge line tag:** "…That's the bridge. ^ That's what was missing." uses the tag `barely`.
- **Headphones:** "puts the headphones down" stops the monitor and shows `headphones_desk`. `chase40` has no on-head headphones attachment, so for anything richer the scene should use `onBridge`.
- **Previews go through the muffled desk monitor** too, so the clean song is first heard in 3.6.
- **The pass loop lives in the mini-game** as assigned, rather than in content as `docs/engine/07-minigames-a.md` §15.4 suggested; `lines` lets the scene override it.

**Where the code differs from the docs:**
- `bakeSong` takes `(pattern, { samples })`; ARCHITECTURE §5.9 shows only `(pattern)`.
- An undefined `pattern.bridge` is read by the engine as the laugh, so the empty slot is kept as `null`.
- The per-section lane levels aren't exported by the audio engine, so I copied them to show which lanes rest in each section.

**Sounds:** nothing essential was missing. I used `thud` for the hand flat on the desk and `whoosh` for the time jump, as the nearest existing sounds. Otherwise `tick`, `pop`, `clunk` and `ss_chirp`.

**Testing notes:**
- No engine bug blocked me.
- The machine was very heavily loaded (load average about 50 on 4 cores, so game frames ran about 0.2 s). Under that load Playwright occasionally merged key presses into one game tick and caught mixed canvas/DOM frames. I sampled the game state directly and confirmed neither was a bug in the game.
- Game globals are module-scoped, so a headless probe needs the dev scene to expose them (I used `window.__dev`).
- Test hooks on the module: `.phase`, `.focus`, `.takes`, `.at(kind, i, j)`.
