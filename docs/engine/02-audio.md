# 02 — Audio engine (`03-audio.js`)

Reference manual for Rue's audio subsystem, written so TWO can be built on it without re-reading the source.
Source: `ref/rue/03-audio.js` (944 lines). `src/03-audio.js` is byte-identical, so every line number below applies
to both. Other files are cited as `NN-file.js:line` under `ref/rue/`.

Everything is synthesised with Web Audio. No files are decoded or streamed. Every one-shot, loop, voice blip and music
stem is **baked once at boot** into an `AudioBuffer` with `OfflineAudioContext`. At runtime the engine only starts buffer
sources. The one exception is the Pudding song, which is **sequenced at runtime** from baked stems on the audio clock,
because it depends on the player's pattern and collected samples.

---

## 1. At a glance

| Thing | Value |
| --- | --- |
| Exports (globals) | `AUDIO`, `sfx(name, o)`, `music(cue, o)` (+ `music.silence(on)`) — `03-audio.js:8, 943` |
| Reads globals | `CONFIG.duck`, `options.{music,sfx,voice}`, `CHARACTERS[*].voice`, `SAMPLES`, `state.{pattern,samples,scene}`, `world.anchor(name)`, `on()` (event bus), `document.hidden` |
| Sample rates | `SR = 44100` one-shots, stems, voices · `MR = 32000` loops and music cues (`03-audio.js:9`) |
| Buffer stores | `B` one-shots · `L` loops · `M` music cues · `V` voices · `S` song stems `{pad, bass, bleep}` (`03-audio.js:11`) |
| Buses | `busM` music · `busS` sfx + loops · `busV` voices → `master` → limiter → destination |
| Lifecycle | `AUDIO.prerender()` during the loader → `AUDIO.init()` inside the first YES gesture → runtime |
| Before `init()` | **every call is a silent no-op** and nothing is remembered (`sfx`, `music`, `loop` returns a no-op handle, `ambience`, `blip`…) |
| Recipes | 48 one-shots, 13 loops, 9 baked cues, 3 virtual cues (`credits`, `pudding_walkman`, `pudding_warbly`), 12 song stems, 27 voices × 5 variants |
| Baked PCM at boot | ≈ 22 MB cues + 6.7 MB loops + 10 MB one-shots + ~3 MB stems + voices ≈ **42 MB** of Float32 |
| Offline renders at boot | ≈ 48 + 12 + 135 (voices) + 20 (loops) + 63 (cues) ≈ **280** small `OfflineAudioContext`s |

### Who calls what (Rue)

| Caller | Call | Where |
| --- | --- | --- |
| Boot loader | `AUDIO.prerender()` as one boot job | `36-main.js:94` |
| First YES (key/click/touch) | `AUDIO.init()` via `input.gesture` (fires once) | `36-main.js:122`, `02-core.js:118` |
| Autoplay tests | `AUDIO.init()` straight after the boot jobs | `36-main.js:109` |
| Flow `loadSet` | `AUDIO.ambience(set.ambience)`, `AUDIO.setRoom(set.ambience.room)` | `11-flow.js:39-40` |
| World env change (rain on/off) | `AUDIO.ambience({rain, loops})`, `AUDIO.setRoom(room)` | `09-world-engine-b1.js:78-83` |
| Every rendered frame | `AUDIO.listener(camera)` after the render | `09-world-engine-b1.js:1188` |
| Dialogue box show / hide | `AUDIO.duck(true/false)` | `10-ui.js:221, 226` |
| Typewriter, per letter | `AUDIO.blip(speakerId, rising)` | `10-ui.js:216, 306` |
| Options menu | `emit('options')` → `AUDIO.applyOptions` | `10-ui.js:659-662` |
| Cutscene steps | `{sfx}`, `{loop}`, `{music}` | `11-flow.js:140, 160-165` |
| Scene data | `scene.music` on scene start | `11-flow.js:563` |
| Stare step | `music.silence(true/false)` | `11-flow.js:199-213` |
| 3.3 Sequencer mini-game | `AUDIO.seq.play/stop` | `16-…-the-sequence.js:313-319` |
| 3.3 finished song, 2.6 timelapse, Extras, Credits | `AUDIO.song(pattern, o)` | `33-…:310`, `28-…:622`, `10-ui.js:756`, `18-…credits…:83` |
| UI everywhere | `ui.sfx(name, o)` → global `sfx` | `10-ui.js:28` |

---

## 2. Architecture

### 2.1 Signal graph (built in `init()`, `03-audio.js:762-776`)

```
 sfx() ─┐                                ┌─► sendRoom (gain 0|0.25) ─► Convolver 0.6 s, damp 0.3, stereo ─┐
 loop() ┼─► [o.lp filter] ─► [Panner|StereoPanner] ─► busS ─┼─► sendWet  (gain 0|0.35) ─► Convolver 2.2 s, damp 0.8, stereo ─┤
        │                                                    └──────────────────────────────────────────────┐              │
 music cue ─► cur.g (fade) ─┐                                                                              ▼              ▼
 AUDIO.song / seq player ─► p.out ─► busM ─────────────────────────────────────────────────────────────► master ─► DynamicsCompressor ─► destination
 blip() ─────────────────────────► busV ──────────────────────────────────────────────────────────────────►   (thr −6 dB, knee 6, ratio 12,
                                                                                                                 attack 3 ms, release 0.2 s)
```

- Bus gains start at 0 and glide to their option targets on `applyOptions()` (so audio fades in at init).
- Only `busS` feeds the reverb sends. Music and voices are always dry. **UI sounds (`ding`, `pop`, `clunk`) are on
  `busS` too, so they pick up the room reverb.**
- The limiter is a soft safety net, not a mix tool. Level is set in the recipes (one-shots) and by RMS
  normalisation (loops, cues, voices).

### 2.2 Lifecycle

1. `prerender()` runs while the loader shows "JARVIS is loading…". It needs no user gesture (offline contexts are
   allowed). It is a single boot job, so the progress bar only advances when the whole audio bake finishes
   (`36-main.js:94-101`).
2. The player presses YES. `input.gesture` calls `AUDIO.init()` **synchronously inside the event** (required for
   iOS/Safari unlock). `input.gesture` is nulled after the first call (`02-core.js:118`), so it is never called again.
3. Runtime: buffer sources only; the Pudding player runs a 25 ms `setInterval` look-ahead scheduler while a song plays.

---

## 3. Public API

### 3.1 `AUDIO.init()` — `03-audio.js:762`

```js
function init() {
  if (ctx) { if (ctx.state === 'suspended') ctx.resume().catch(() => {}); return; }
  ...
  try { ctx = new AC({ latencyHint: 'interactive' }); } catch (e) { return; }
```

- Creates the `AudioContext` (`latencyHint: 'interactive'`), master, limiter, the three buses, the two reverb sends
  (stereo impulses generated at `ctx.sampleRate`), applies options and subscribes `on('options', applyOptions)`.
- Idempotent: later calls only `resume()` a suspended context.
- **Gotcha:** nothing in Rue calls it again after the first gesture. If the OS suspends the context later (iOS
  interruption, Bluetooth switch), audio stays off. TWO should call `AUDIO.init()` from every gesture (it's cheap).

### 3.2 `AUDIO.prerender()` — `03-audio.js:703`

`async`, returns when everything is baked. Order (each group in parallel with `Promise.all`, a `setTimeout(0)` yield
between groups so the loader keeps animating):

1. JS textures: `WHITE`, `BROWN`, `DROPS`, `DRIPS`, `CRACKLE`, `PULSE`, `WARM`, `DIST` (§6).
2. Every `SFX` recipe → `B[name]` (44.1 kHz, not normalised).
3. Every song stem `STEMS()` → `S.pad[i]`, `S.bass[i]`, `S.bleep[i]` (44.1 kHz).
4. `renderVoices()` → `V[id]` for every `CHARACTERS` id.
5. Every `LOOPS` entry → `bake()` → `L[name]` (32 kHz, RMS-normalised).
6. Every `CUES` entry → `bake()` → `M[name]` (32 kHz, RMS-normalised).

- Guarded: runs once (`|| WHITE`), and is a no-op without `OfflineAudioContext`/`AudioBuffer`.
- **Gotcha (fatal-silent):** one throwing recipe rejects its `Promise.all` and **aborts every later group**. The boot
  loop catches and logs `'… boot job failed'` and the game carries on — with no voices, loops or music. Common causes:
  an `exponentialRampToValueAtTime` to 0 or a negative value, a `CHARACTERS` entry without a `voice` object
  (`renderVoices` reads `v.len`), a typo'd helper name.
- Not deterministic: recipes use `Math.random`; buffers differ between runs.

### 3.3 Volumes, ducking, silence — `03-audio.js:755-761, 909, 914`

```js
busM.gain.setTargetAtTime(silenced ? 0 : (options.music ?? 0.8) * (ducked ? CONFIG.duck : 1), t, silenced ? 0.05 : 0.12);
busS.gain.setTargetAtTime(options.sfx ?? 0.9, t, 0.05);
busV.gain.setTargetAtTime(options.voice ?? 0.9, t, 0.05);
```

| Call | Effect |
| --- | --- |
| `AUDIO.applyOptions()` | Re-reads `options.music/sfx/voice` (0–1, defaults 0.8/0.9/0.9). Called by the `'options'` event. |
| `AUDIO.duck(on)` | Music bus × `CONFIG.duck` (0.6 = the 40% duck, `01-config.js:13`), time constant 0.12 s. Called by the dialogue box. Affects **everything on `busM`**, including `AUDIO.song`/`seq` players. |
| `music.silence(on)` | Music bus to 0 (tc 0.05 s) / back. Used by the `stare` step. Ambience and sfx carry on. |

### 3.4 `sfx(name, o)` — `03-audio.js:795`

Plays baked one-shot `B[name]` once, now. Returns nothing (**a one-shot cannot be stopped**). Unknown name or
before init: silent no-op, no warning.

| Option | Default | Effect |
| --- | --- | --- |
| `vol` | 1 | Gain. |
| `rate` | 1 | `playbackRate` (pitch and length change together). |
| `lp` | — | Low-pass Hz ("through a door"). |
| `at` | — | Positional: `[x,y,z]`, `{x,y,z}`, a `THREE.Vector3`, or an anchor name of the **current** set (`world.anchor(name).at`). Equal-power `PannerNode`, `distanceModel 'inverse'`, `refDistance 2`, `rolloffFactor 1`. Unknown anchor → panner left at the origin. |
| `pan` | — | Stereo pan −1..1 (ignored when `at` is set). |

```js
// 33-content-3-3-note-to-self-3-4-opt-us-in.js:98 — a sound heard through a door
const through = (name, vol, rate = 1) => ({ sfx: name, vol, rate, at: DOOR, lp: 650 });
```

The flow passes the **whole step object** as options (`11-flow.js:160`), so `{ sfx: 'creak', vol: 0.5, at: 'door' }`
works as a cutscene step. Allocation: 2–4 audio nodes per call (unavoidable); pass a **reused** options object from
per-frame code:

```js
// 16-minigames-…-the-sequence.js:320 — one options object reused every step
const SO = { rate: 1, vol: 1 }; // reused: the fallback clock fires these every step
```

### 3.5 `AUDIO.loop(name, o)` → handle — `03-audio.js:810`

Starts looped buffer `L[name]` at a **random offset**, fading in. Returns a handle, or `NOOP` (all methods empty)
before init / for an unknown name.

| Option | Default | Effect |
| --- | --- | --- |
| `vol` | 1 | Target gain (linear ramp from 0). |
| `fade` | 0.15 | Fade-in seconds. |
| `rate` | 1 | Playback rate. |
| `lp` | — | Low-pass Hz (built as `band(20, lp)`). |
| `at` / `pan` | — | As `sfx`. `walkman` always uses an **HRTF** panner (refDistance 1, rolloff 1.3). |

| Handle method | Effect |
| --- | --- |
| `stop(f = 0.3)` | Linear fade to 0 over `f`, then stops. Idempotent. |
| `vol(v)` | `setTargetAtTime(v, now, 0.05)`. |
| `rate(r)` | `setTargetAtTime(r × detune, now, 0.05)`. |
| `pos(x, y, z)` | Moves a positional loop (same argument forms as `at`). No-op for non-positional loops. |

Hard-coded special names inside `loop()`:

| Name | Special behaviour |
| --- | --- |
| `buttery_radio` | Plays the **music cue** `M.buttery_radio` (not a loop) through `band(250, 3200)`: the café radio, diegetic. `o.lp` is ignored. |
| `alarm` | Each additional live alarm is detuned +1.3% (`det = 1 + 0.013 * alarms++`) so layered alarms beat. |
| `walkman` | HRTF panner. |

Every live handle is in a `Set` so `AUDIO.stopAll()` can stop it. Flow `{loop}` steps keep their own map by name
(`11-flow.js:161-165`): `{ loop: 'alarm', vol: 0.45, fade: 0.4 }` pushes a handle; `{ loop: 'alarm', stop: true,
fade: 0.05 }` stops **every** handle of that name; `flow.stop()` stops all step loops with 0.4 s (`11-flow.js:521`).

```js
// 15-minigame-pedal-power-2-6-reused-in-3-1.js:37, 87 — pitch follows the pedals; only re-target on real change
dyn = (a.AUDIO && a.AUDIO.loop && a.AUDIO.loop('dynamo', { vol: 0, rate: 0.5 })) || null;
if (dyn && Math.abs(r - lastRate) > 0.03) { lastRate = r; dyn.rate(r); dyn.vol(Math.min(1, m / 60) * 0.7); }
```

### 3.6 `AUDIO.ambience(a)` and `AUDIO.setRoom(r)` — `03-audio.js:836-845, 915-921`

`a = { rain, loops: [names], room }` (the `SETS[id].ambience` shape; `room` is only read by `setRoom`).

- Diffs against what is playing: loops no longer wanted stop with a 1 s fade; new ones start with `fade: 1`.
- `rain` truthy adds a rain loop: **`rain_heavy` (vol 0.7)** when `a.rain === 'heavy'` or the room is not `'room'`
  (outdoors); otherwise **`rain` at vol 0.6 through a 1800 Hz low-pass** (heard through the glass). Any truthy value
  works (Rue's HQ uses `rain: { box: [...], top: 14 }`, `08-…:1313`).
- Remembers `lastAmb`; `setRoom()` re-runs it when the room changes, so the rain follows indoors/outdoors.

`setRoom(r)`: `'room'` → room send 0.25, wet send 0; `'wet'` → wet send 0.35 (2.2 s tail, the rainy square);
anything else (`'none'`) → both 0. Glides with tc 0.2 s.

Set data examples: `{ rain: false, loops: ['aircon', 'fluoro'], room: 'room' }` (`05-set-reddy…:1175`),
`{ rain: true, loops: [], room: 'wet' }` (`06-set-square.js:998`).

**Ordering gotcha:** flow calls `ambience(amb)` then `setRoom(amb.room)`. If the room changes, rain is chosen with the
*old* room first and then swapped (a wasted 1 s crossfade). Calling `setRoom` first is worse: it re-applies the
*previous* set's `lastAmb`.

### 3.7 `AUDIO.listener(camera)` — `03-audio.js:861`

Copies the camera's `matrixWorld` (position, forward = −Z column, up = Y column) into `ctx.listener`. Writes
`AudioParam.value` directly: no allocation, safe every frame. Must run after the render so `matrixWorld` is current.

### 3.8 `AUDIO.blip(id, rising)` — `03-audio.js:847`

```js
const v = V[id] || V[String(id).split('_')[0]] || V.student;
if (t - v.last < (rising ? v.min * 0.6 : v.min)) return; // syllable rate, however fast the text types
```

- Resolves the voice: exact id → prefix before `_` → `student` → silent if none.
- Rate limit per voice: `v.min = len + 0.02 + gap` (×0.6 for rising blips), on the audio clock.
- Picks one of 4 vowel-coloured variants at random (or the rising variant `q` when `rising` and not `mono`), random
  ±8% `playbackRate` unless `mono`. Straight to `busV` (dry, unpositioned).
- `voice.also` blips a second voice too (duets `luka_chase`, `chase_luka`).
- The dialogue box passes `rising = true` for the last 6 characters of a line ending in `?` (`10-ui.js:277, 306`); in
  fast-forward only every other letter blips.

### 3.9 `music(cue, o)` — `03-audio.js:880`

One current cue at a time (`cur = { name, g, src[], p }`).

| Option | Default | Effect |
| --- | --- | --- |
| `fade` | out: 1; in: 1 if something was playing, else 0.05 | Crossfade seconds (one value for both). |
| `cut` | false | 12 ms switch (used by flow while skipping). |

Behaviour:

- `cue === cur.name` → **no-op** (no restart, options ignored).
- `cue == null` → fade the current cue out.
- `M[cue]` exists → loop the baked buffer from offset 0. `dublin` / `dublin_major` add the rain loop underneath on
  the music bus (`BED`, gains 0.6 / 0.35) **unless `state.scene === '3.4'`** (a Rue-scene hack, `03-audio.js:896`).
- `'credits'` → a Pudding player in credits mode (§9).
- `'pudding_walkman'` → the Pudding player looping forever through peaking +3 dB @ 1500 Hz and `band(120, 7000)`.
- `'pudding_warbly'` → the same player through a 12 ms delay whose time is wobbled by two LFOs (0.55 Hz ±4 ms wow,
  6.5 Hz ±0.6 ms flutter), `band(380, 2400)` at 0.5, a tanh `WaveShaper` (`DIST`), out at 1.2.
- `pudding_walkman` → `pudding_warbly` **keeps the same player** (re-patches `p.out`), so the song carries on in time
  across the cut; only the colour changes (`03-audio.js:886-891`).
- Any other name → a silent "current cue". **No warning**, and a later `music(sameName)` is a no-op.
- Before init: no-op and **not remembered**.
- Flow: `{ music: 'reddy', fade: 2 }` step (step object is the options); while skipping it becomes `{cut: true}`.
  Scene data `music:` is applied on scene start (`11-flow.js:140, 563`).

### 3.10 `AUDIO.song(pattern, o)` → `{ stop() }` — `03-audio.js:923`

Plays the Pudding song from a pattern (4 lanes × 16 booleans; `null` → default pattern) straight into `busM`
(independent of `music()`'s current cue, but ducked with it).

| Option | Default | Effect |
| --- | --- | --- |
| `samples` | `state.samples` | Which samples were collected (lane sounds, rain bed, trill intro, bell). |
| `bars` | — | Set → `'loop'` mode for that many bars (not counting a trill intro). Unset → **`'credits'` mode** (the full arrangement). |
| `ending` | false | With `bars`: finish on the coda (D chord + bass + bell if collected). Without: stop 1 s after the last bar. |
| `onEnd` | — | Called when the song ends **naturally** (not on `stop()`). |

`stop()` fades over 0.3 s and does **not** call `onEnd`. The returned object has **no `dur`**: Rue's credits code
checks `song.dur` and always falls back to its own estimate (`18-minigame-credits-scene-c.js:88`). `credits: true`
passed by the credits mini-game is ignored (absence of `bars` is what selects credits mode).

```js
// 33-content-3-3-note-to-self-3-4-opt-us-in.js:310 — 8 bars, then the coda
const h = c.AUDIO.song(state.pattern, { samples: state.samples, bars: 8, ending: true, onEnd: () => { ended = true; } });
```

### 3.11 `AUDIO.seq.play(pattern, samples, onStep)` / `AUDIO.seq.stop()` — `03-audio.js:928`

The 3.3 sequencer grid: drums + lead only, looping forever, **reading the pattern arrays live** (edits are heard
within the 0.2 s look-ahead). `onStep(i)` (i = 0..15) fires from the scheduler when the audio clock reaches that
step, for playhead drawing. Only one seq player exists; `play` stops the previous one. `stop` fades 0.05 s.

### 3.12 Misc

| Member | Notes |
| --- | --- |
| `AUDIO.stopAll()` | Cuts music, stops every player and live loop (0.05 s), forgets ambience. **Never called in Rue** (quit-to-title relies on `flow.stop()` and `music(null)`). |
| `AUDIO.sampleBuffer(k)` | `B[SAMPLES[k].sfx]` or `null`. Unused in Rue; the natural source for TWO's waveform card and lure durations. |
| `AUDIO.buffers` | `{ B, L, M, V, S }` for tests and the F2 overlay. |

---

## 4. Synth toolkit (works on any `BaseAudioContext`) — `03-audio.js:15-121`

All functions take `(c, d, t, …)`: context, destination node, start time. They build a graph and schedule it; they
return nothing unless noted. Use them only inside recipes (offline contexts) — at runtime only `lfo`, `band`, `bp` and
`gainTo` are used.

### 4.1 `env(param, t, dur, o)` → stop time

```js
p.setValueAtTime(0, t);
p.linearRampToValueAtTime(v, t + a);
if (o.d) p.setTargetAtTime(v * (o.s ?? 0), t + a, o.d);
p.setTargetAtTime(0, t + hold, r / 4);
return t + hold + r + 0.02; // stop time
```

| Field | Default | Meaning |
| --- | --- | --- |
| `v` | 0.3 | Peak level. |
| `a` | 0.004 | Linear attack (s). |
| `d` | — | Decay time constant toward `v × s` (no `d` = hold at `v`). |
| `s` | 0 | Sustain fraction (only with `d`). |
| `r` | 0.03 | Release: time constant `r/4` starting at `t + max(dur, a)`. |

### 4.2 Sources and processors

| Function | Signature | Options / notes |
| --- | --- | --- |
| `filt` | `(c, dest, o, t, dur)` → node to connect into | `o.lp` / `o.hp` / `o.bp` (Hz), `o.q` (0.7; bp 2), sweep to `o.fto` over `o.fgl ?? dur` (exponential). Returns `dest` if no filter. |
| `tone` | `(c, d, t, f, dur, o)` | Oscillator note. `o.type` ('sine'), `o.wave` (`PeriodicWave`), glide `o.to` over `o.gl ?? dur` (exponential), `o.det` cents, `o.vib = [Hz, cents]`, + `env` and `filt` fields. |
| `noise` | `(c, d, t, dur, o)` | Looped noise: `o.buf` (any texture), `o.brown`, else white; starts at a random offset (0–1.5 s). `env` + `filt` fields. |
| `fm` | `(c, d, t, f, dur, o)` | 2-op FM. `o.ratio` (1), `o.index` (2, × f Hz), index decays to `index × o.isus` (0.1) with tc `o.md` (0.3). `env` + `filt` fields. |
| `chord` | `(c, d, t, notes[], dur, o)` | MIDI notes, each a stack of oscillators detuned by `o.det` ([−8, 8] cents) through one low-pass `o.lp` (1200), `o.q` (0.6). `o.type` ('sawtooth'). Env: `v` 0.05, `a` 0.3, `r` 0.8, `d`, `s`. `o.wob` / `o.lfoF`: an `lfoOut` connected to pitch / cutoff detune. Each osc starts with ≤10 ms jitter. |
| `lfo` | `(c, param, rate, depth, t=0, end=0, type='sine')` → osc | Adds `depth × wave` to `param`. |
| `lfoOut` | `(c, rate, depth)` → gain node | A shared LFO signal to connect into several params. |
| `band` | `(c, d, lo, hi)` → input node | High-pass `lo` → low-pass `hi` → `d`. |
| `bp` | `(c, f, q)` → filter | Bare band-pass. |
| `impulse` | `(rate, sec, damp, ch=1)` → AudioBuffer | Cached reverb IR: noise through a one-pole low-pass that darkens over time (`damp` 0..1), −60 dB at the end, 4 ms fade-in. |
| `rev` | `(c, d, sec, mix, damp=0.6)` → input node | Dry to `d` + convolver (`impulse`) at `mix`. |

**Rule:** never pass 0 or a negative value to `to`, `fto` or anything that ends up in an exponential ramp — it
throws inside the offline render and aborts the bake (§3.2). `tone` and `filt` skip the ramp when the value is falsy,
so `to: 0` is safe ("no glide"); `to: -1` is not.

### 4.3 Instruments and recipe parts — `03-audio.js:123-251`

| Helper | Signature | Sound |
| --- | --- | --- |
| `kick` | `(c,d,t,v=0.7)` | Sine 140→42 Hz in 0.1 s. |
| `snare` | `(c,d,t,v=0.25)` | Band-passed noise @2 kHz + 210→150 Hz body. |
| `hat` | `(c,d,t,v=0.05,open)` | High-passed noise @7.5 kHz, 40 ms (open: 250 ms). |
| `pluck` | `(c,d,t,midi,v=0.06,lp=1800)` | 0.1 s square with the filter closing to 300 Hz. |
| `marimba` | `(c,d,t,midi,dur,v=0.14)` | Sine + 4th-harmonic click. |
| `piano` | `(c,d,t,midi,v=0.1)` | FM ratio 1, index 1.6 decaying; 3 s. |
| `flute` | `(c,d,t,midi,dur,v=0.1)` | Sine with 5 Hz/14 ct vibrato, 60 ms attack + faint octave. |
| `bassN` | `(c,d,t,midi,dur,v=0.3,lp=700)` | Triangle through LP + sine an equal half. |
| `bell` | `(c,d,t,f,v,len=8)` | Campanile: partials `BELL` = ratio 0.5 (hum), 1, 1.19 (minor third), 1.5, 2, 2.5, each doubled at ×1.003 for beating, decays proportional to `len`, + strike noise. |
| `whistle` | `(c,d,t,f,dur,v=0.28)` | Tin whistle: sine + vibrato 5.5 Hz/14 ct, 2nd harmonic, breath noise band-passed at 2f, a chiff. |
| `kclick` | `(c,d,t,v)` | Kettle switch: HP noise + 3400/1100 Hz ticks. |
| `twang` | `(c,d,t,v)` | Saw 196→174 Hz, LP sweep 3200→350, 11 Hz vibrato, + 98 Hz sine. |
| `siren` | `(c,d,t,dur,v)` | Square alternating 700/950 Hz every 0.25 s, LP 3 kHz. |
| `brickRing` | `(c,d,t)` | Two squares (0/14 ct) cycling C6-E6-G6 every 34 ms, tanh-distorted, LP 4.5 kHz. |
| `creak` | `(c,d,t)` | Stick-slip saw 70→130→85→115 Hz, 23 Hz square AM, resonators at 750/1600 Hz. |
| `fluoro` | `(c,d,t,dur,v,flick)` | 100 Hz saw buzz + 200 Hz square hiss, gated on/off at random inside the `flick` windows `[[from,to]]` with tick clicks. |
| `type1` | `(c,d,t,v)` | One keystroke: BP noise click (2.5–3.5 kHz) + 160 Hz thunk. |
| `babble` | `(c,d,t0,dur,o)` | Speech-like gibberish: saw at `o.f` + noise through two formant band-passes that jump between 6 vowels per syllable (2–7 syllables per phrase, pauses). `o.v`, `o.wob` (0.6 Hz)/`o.wobc` (30 ct) pitch wobble, `o.fast`. |
| `crowdGroan` | `(c,d,t)` | 5 saws (120–230 Hz) falling 22% through "aw" formants 650/1050 Hz. |
| `crowdTitter` | `(c,d,t)` | 3 voices × 5 falling triangle "hee"s through BP 1300 Hz. |
| `clockTick` | `(c,d,t,f)` | Resonant tick at `f`. |

---

## 5. One-shot catalogue (`SFX`, `03-audio.js:254-392`)

Format: `name: [seconds, (c, d, t) => recipe]`. Rendered at 44.1 kHz mono, **not normalised** (levels are the `v`s).
"Rue use" lists representative callers.

| Name | s | How it's made → what it sounds like | Rue use |
| --- | --- | --- | --- |
| `ding` | 0.22 | Sine 880 Hz then 1320 Hz 70 ms later → JARVIS pop-up ding | every pop-up (`10-ui.js:478`) |
| `crash` | 1.0 | Square diving 600→80 Hz (LP 2.6 k) + 0.45 s noise burst → JARVIS crash | 1.2/1.3 crashes |
| `restart_chime` | 1.3 | Sines C5–E5–G5, 0.2 s apart (§10) → JARVIS restart | crash cycle, restart ritual, epilogue |
| `alarm` | 1.0 | `siren` 700/950 Hz → display alarm (one-shot; see loop `alarm`) | 1.4 |
| `rip` | 0.7 | Noise BP swept 3000→700 Hz + `twang` → tether ripped off | 1.4 tether rip |
| `twang` | 0.8 | `twang` → elastic tether twang | 1.4 |
| `spark` | 0.5 | 9 random 12 ms HP crackles → electrical sparks | 1.4, 1.7, pedal power |
| `tick` | 0.06 | 6 ms HP click + 2.4 kHz blip → UI tick, spinner, toggles | everywhere |
| `trill` | 1.05 | Two 0.4 s bursts of 400 + 450 Hz sines → reverse-charge double trill (Trill sample) | 1.7, sequencer intro |
| `brick_ring` | 1.05 | `brickRing` → harsh brick-phone ring | 2.12, 3.5, epilogue (every 3 s) |
| `bell` | 8.5 | `bell(D4, 0.2)` → Campanile bell (Bell sample) | Square, song coda |
| `kettle` | 3.35 | Noise BP swept 350→2600 Hz with a 2.8 s attack + brown rumble + `kclick` at 3.02 s → kettle boils and clicks off (Kettle sample) | every save |
| `kettle_click` | 0.1 | `kclick` → just the switch (the song's hat lane) | sequencer |
| `beep` | 0.13 | 1 kHz square → computer beep (Beep sample; sequencer fallback) | many |
| `till` | 0.7 | Two FM bell tones (2349 Hz r 1.41, 3520 Hz r 2.76) + noise + thunk → cash-register "ching" (Till sample; snare lane) | 2.2, sequencer |
| `whistle` | 0.5 | `whistle(D5)` → tin whistle (Whistle sample; **the song's lead, re-pitched by playbackRate**) | 2.x, sequencer |
| `pigeons` | 1.1 | Two bursts of 9 BP noise flaps → pigeons taking off | Square |
| `creak` | 1.3 | `creak` → old wooden door | wood doors (`11-flow.js:328`) |
| `door_slide` | 1.3 | BP noise 500→1100 Hz + 120 Hz motor + thump at 1 s → automatic sliding door | store doors |
| `clunk` | 0.3 | 95→55 Hz thump + LP noise → disabled button / mechanical clunk | UI, many |
| `sad_beep` | 0.6 | Square 440 Hz then 330→300 Hz → error beep | keypad, dial |
| `key_beep` | 0.1 | 1400 Hz square, 60 ms → keypad press | keypad |
| `sting` | 1.0 | C-minor saw stab (C3 G3 C4 E♭4 G4) + noise hit + 65 Hz boom → dramatic sting | camera `CRASH` zoom (`09-…:932`) |
| `whoosh` | 0.8 | Noise BP swept 300→2000 Hz, slow attack → whoosh | 1.1 sign flip |
| `zap` | 0.45 | 120 Hz square with 31 Hz ±400 ct vibrato + crackles → electric zap | 1.7 time jump |
| `typewriter` | 0.1 | `type1` → one keystroke | 2.7–2.9 typewriter hotspot |
| `footstep` | 0.14 | LP thump + BP scuff → dry step (**unused in Rue**) | — |
| `footstep_wet` | 0.3 | Step + BP splash + 1400→900 Hz drip → wet step | 2.4 walks |
| `thud` | 0.5 | 80→40 Hz + LP noise → body/object thud | many |
| `pop` | 0.09 | Sine 380→1100 Hz in 30 ms → UI pop/select | UI |
| `applause` | 3.3 | 110 random BP claps with a swelling density + wash → applause | 3.1 |
| `groan` | 1.7 | `crowdGroan` → crowd groan | 2.3 |
| `titter` | 1.3 | `crowdTitter` → little crowd laugh | Blend In, 3.4, Act Three |
| `murmur` | 2.3 | Three `babble` voices (120/150/195 Hz) → crowd murmur | 2.12, 3.4 (through a door) |
| `knock` | 0.6 | Three knocks 0.16 s apart (190→140 Hz + BP noise) → door knock; also the chime taps | many |
| `bike_bell` | 1.2 | Two dings, partials 2300 Hz × [1, 1.006, 2.76, 5.4] → bicycle bell | 2.4 walks |
| `bus` | 3.7 | Saw 46→38 Hz + square 92→76 + brown noise + tyre hiss, swelling in and out → bus passing | 2.5 |
| `flash_hum` | 2.7 | Three detuned saws 55→220 Hz with LP opening 300→4000 + 880→1760 Hz whine → time-jump charge-up | 1.7, 3.4, Act Three |
| `dynamo_hit` | 0.4 | Kick 130→48 Hz + saw blip + click → Dynamo sample (kick lane) | sequencer |
| `rain_gutter` | 2.4 | Brown noise + `DRIPS` texture + BP trickle → gurgling gutter (Rain sample) | Square, positional every 2.4 s |
| `dictaphone` | 0.5 | Click + 180 Hz triangle motor with wobble → dictaphone button/record | recording samples |
| `cassette_eject` | 0.4 | Clunk + noise + three clicks + spring → cassette eject | 2.13, 3.3 |
| `polaroid` | 1.15 | Two shutter clicks + 330 Hz buzzing motor → Polaroid shot and eject | photos |
| `chime_ready` | 1.2 | Sines G5 then D6 (+3rd harmonic) → "JARVIS is ready" / success | boot YES, title, mini-game wins |
| `truck_reverse` | 2.5 | Three 1100 Hz square beeps 0.95 s apart → reversing truck | 1.4 stare |
| `tube_flicker` | 0.9 | `fluoro` gated for 0.8 s → fluorescent tube flicker | 1.4, 1.7 |
| `smoke_pop` | 1.1 | 140→45 Hz thump + LP-closing noise 2500→400 + crackles → smoke puff (time-travel arrivals) | 2.1, 2.7 |
| `umbrella` | 0.45 | Noise swish 800→2500 Hz + snap → umbrella opening | rain scenes |

---

## 6. JS-generated textures (`prerender`, `03-audio.js:706-715`)

| Name | Made by | Used for |
| --- | --- | --- |
| `WHITE` | 2 s white noise, end crossfaded into start over 2000 samples (`loopable`) | default `noise()` |
| `BROWN` | 2 s leaky-integrated noise ×3.5, 4000-sample crossfade | `noise(…, {brown: true})` |
| `DROPS` | `clicks(3.7 s, 30/s, 2–5 kHz, 1.5 ms decay, 0.5)` — damped-sine pings | rain loops |
| `DRIPS` | `clicks(5.3 s, 5/s, 700–1400 Hz, 20 ms, 0.6)` | `rain_gutter` |
| `CRACKLE` | `clicks(2.9 s, 25/s, 2.5–9 kHz, 0.3 ms, 0.8)` | vinyl/radio crackle |
| `PULSE` | Fourier coefficients of a 12.5% pulse (40 terms) | `pulse` voices |
| `WARM` | Sine + harmonics 0.5, 0.3, 0.18, 0.1, 0.06, 0.03 | **every `sine` voice** |
| `DIST` | 256-point `tanh(3x)` curve | `brickRing`, `pudding_warbly` |

Texture lengths are deliberately odd (2, 2.9, 3.7, 5.3 s) so layered loops never phase-lock.

---

## 7. Loop catalogue (`LOOPS`, `03-audio.js:400-446`)

Baked at 32 kHz by `bake()` (§8), RMS-normalised to `rms`.

| Name | len (s) | rms | How it's made | Rue use |
| --- | --- | --- | --- | --- |
| `rain` | 4 | 0.05 | Brown LP 1400 + hiss + `DROPS` (xf) | ambience (indoor, muffled), 1.7 call |
| `rain_heavy` | 4 | 0.09 | Two brown layers + hiss + two `DROPS` layers (xf) | ambience (outdoor) |
| `hum` | 2 | 0.02 | 100 Hz saw LP 350 + sines 100/200 + square hiss (xf) | Buttery, lab sets; dial + memory-recorder mini-games |
| `aircon` | 4 | 0.025 | Brown LP 500 + BP air + two ticks (xf) | store, theatre, JARVIS HQ |
| `radio` | 6 | 0.05 | `babble` announcer + A-major triangle chord, band 350–2800, + `CRACKLE` (xf) | Square lodge radio (positional) |
| `alarm` | 1 | 0.12 | `siren` (xf) | 1.4 (four layered, detuned) |
| `dynamo` | 1 | 0.1 | 220 Hz saw BP 700 + 440 triangle + noise (xf) | pedal power: `rate()` follows the pedals |
| `walkman` | 6 | 0.08 | Fast `babble` band 900–3500 + hiss (xf) — "leaking foam headphones" | 2.13 torchlight (HRTF, positional) |
| `clock_tick` | 2 | 0.01 | Two `clockTick`s (3.5 k / 2.6 k) — tick-tock | office, exam hall |
| `city` | 6 | 0.04 | Brown traffic with a 1/6 Hz swell + air (xf) | office |
| `hold_music` | 9.6 | 0.07 | 4 bars, 100 BPM, C major: FM e-piano C–Am–Dm–G, bass, marimba tune, hats; band 400–3000 (phone line) | 3.7 hold |
| `typing` | 4 | 0.03 | 4 × 1 s chunks of random `type1` bursts | HQ |
| `fluoro` | 3 | 0.03 | `fluoro` with two flicker windows (xf) | store, lab |

Hold-music tune (16th steps per bar): `E5·6 D5·2 C5·4 B4·4 | C5·6 B4·2 A4·8 | D5·6 C5·2 A4·4 F4·4 | G4·8 B4·4 D5·4`.

---

## 8. Baking (`bake`, `03-audio.js:648-701`)

### 8.1 Definition fields (loops and cues share them)

| Field | Default | Meaning |
| --- | --- | --- |
| `len` | — | Loop length in seconds (`dur(bars, bpm) = bars × 4 × 60 / bpm`, `03-audio.js:399`). |
| `rms` | 0.12 | Target RMS after normalisation (peak capped at 0.95). |
| `whole(c, d, len)` | — | Rendered in one offline context of `len + tail` (or `len + 0.3` with `xf`). |
| `bars: [count, fn(c, d, k)]` | — | Each bar rendered on **its own** context of `len/count + tail`, time 0 = bar start, added at `k × len/count`. ("One big graph renders many times slower.") |
| `tail` | 1.5 | Extra seconds rendered per chunk for releases/decays; everything past `len` **wraps onto the start**. |
| `xf` | — | For `whole` noise beds: render `len + 0.3`, then equal-power crossfade the 0.3 s continuation over the head (the head's attack is faded in). The recipe must keep sounding to `len + 0.3` (Rue uses `len + 0.5`). |
| `rev: [sec, mix, damp]` | — | One reverb pass over the assembled loop; the reverb tail wraps round too. |
| `band: [lo, hi]` | — | One band-limit pass (radio/phone colour). |

### 8.2 Algorithm

```js
const add = (d, at) => { for (let i = 0; i < d.length; i++) dry[(at + i) % n] += d[i]; };   // 03-audio.js:662
...
if (o.rev || o.band) { // one pass over the assembled loop; the reverb tail wraps round too
  out = await render(o.len + sec, MR, (c, d) => { ... s.buffer = buf(dry, MR); s.connect(x); s.start(0); });
  for (let i = n; i < out.length; i++) out[i - n] += out[i];
```

1. Allocate `dry` of `round(len × 32000)` samples.
2. Render `whole` and every bar chunk in parallel; mix them in with modular (wrap-around) addition, or the `xf`
   crossfade for `whole` beds.
3. Optional second render: the dry loop through `rev` and/or `band`; samples past `n` wrap to the head.
4. `scale(out, rms)`: RMS-normalise, never past 0.95 peak.
5. Wrap into a mono 32 kHz `AudioBuffer`.

Result: every loop and cue is seamless (note tails and reverb tails are already "inside" the loop start).

---

## 9. Music cue catalogue (`CUES`, `03-audio.js:448-545`)

All baked at 32 kHz, `rms` 0.12. Bars are 4/4; "st" = a 16th step.

| Cue | Key / BPM | Length | Structure and instrumentation | Rue use |
| --- | --- | --- | --- | --- |
| `title` | D (Dadd9 drone) / 64 | 8 bars = 30 s | One `whole`: saw pad D3 A3 E4 F♯4 A4 (cutoff LFO 2 cycles per loop), triangle D2+D3, one Campanile bell (D4) at the top. rev 3.5 s / 0.45. | title screen (`10-ui.js:827`) |
| `demo` | D / 88 | 4 bars = 10.9 s | Pudding's lo-fi demo. Bars: Dmaj9 (root D) – Bm9 (B) – Gmaj9 (G) – A9 (A). Wobbly detuned saw stabs at st 0 & 10, bass at 0/7/10, kick 0/7/10, snare 4/12, swung 8th hats, FM bell hook **D5 A5 G5 A5 D6 F♯5 at steps 0 2 5 7 10 13 every bar (= the default lead lane of the 1987 song)**. Whole: vinyl `CRACKLE` + hiss. band 30–5500, rev 1.2 s. | 1.1 arrival |
| `reddy` | F major / 112 | 8 bars = 17.1 s | F – Dm – B♭ – C – F – Am – B♭ – C7. Octave triangle bass on 8ths, muted square plucks on the offbeats (2 6 10 14), marimba tune, kick 0/8, rim-click 4/12, hats. | store gameplay |
| `reddy_frantic` | F major / 144 | 8 bars = 13.3 s | F – Dm – B♭ – C – F – Dm – D♭ – C. Saw bass 8ths (octave on 6 and 14), 16th arps (chord tones +12, pattern 0 1 2 3 2 1), stabs at 0 3 6 10, four-on-the-floor, snare 4/12 (fill 4 12 13 14 15 in bar 8), 16th hats. | JARVIS Sale |
| `dublin` | D minor / 72 | 8 bars = 26.7 s | Dm – B♭ – F – C – Dm – B♭ – Gm – A (`dublinBar`). Slow pad, sine+triangle root, FM "harp" 8th arpeggio (chord +12, order 0 1 2 3 2 1 2 3), flute tune in bars 5–8: `A4 D5 E5 F5 \| F5·2 D5 B♭4 \| D5·1.5 C5·.5 B♭4 G4 \| C♯5·2 A4·2` (beats). rev 3 s / 0.4. **Rain bed at 0.6.** | 1987 Dublin |
| `dublin_major` | D major / 76 | 8 bars = 25.3 s | D – G – Bm – A – D – G – Em – A (roots D2 G2 B1 A1 D2 G2 E2 A1); arp FM ratio 2 (brighter), LP 1400; tune `A4 D5 E5 F♯5 \| G5·2 F♯5 D5 \| E5·1.5 D5·.5 B4 G4 \| C♯5·2 E5·2`. **Rain bed at 0.35** (none in scene 3.4). | Act Three |
| `buttery_radio` | A minor / 116 | 8 bars = 16.6 s | Am – F – C – G ×2. Saw bass 8ths with filter pluck, pad, FM stabs at 3 6 11; bars 1–4 FM bell arpeggio, bars 5–8 square lead `E5 D5 C5 A4 C5 \| C5 D5 C5 A4 \| E5 D5 C5 G5 E5 \| D5 B4 D5 G4`; kick 0 8 10, **big 80s snare** (own 0.5 s reverb), open hat on 14. band 140–6000. | Buttery café (music or `loop('buttery_radio')`) |
| `emotional` | D major / 66 | 8 bars = 29.1 s | FM piano, sparse: D – Bm – G – A ×2 (e.g. bar 1: D3 D4 F♯4, then A4 on beat 3). rev 3.5 s / 0.45. | emotional scenes |
| `held_note` | A / — | 4 s | A3 sine + 220.25 Hz triangle (0.25 Hz beat = exactly one cycle per loop) + A2, 0.5 Hz tremolo (xf). | 2.12 Black Monday walk |
| `credits` | D / 92 | ≈ 61.8 s | *Virtual*: Pudding player, credits mode (§11.4). | unused as a cue in Rue (credits use `AUDIO.song`) |
| `pudding_walkman` | D / 92 | ∞ | *Virtual*: Pudding player, loop mode, through a Walkman EQ. | 3.4 end |
| `pudding_warbly` | D / 92 | ∞ | *Virtual*: same player, thin and warbly (wow + flutter + saturation). | 3.5 |

`dublinBar(bpm, CH, RT, MEL, lp, arpRatio)` (`03-audio.js:534`) is the shared bar renderer for both Dublin cues — a
good template for "same tune, different mood" pairs.

---

## 10. The JARVIS restart chime

```js
// 03-audio.js:260
restart_chime: [1.3, (c, d, t) => [72, 76, 79].forEach((m, i) => tone(c, d, t + i * 0.2, mtof(m), 0.4, { v: 0.16, a: 0.03, d: 0.3, s: 0.3, r: 0.5 }))],
```

- Three **sine** notes C5 (523.25 Hz), E5 (659.26 Hz), G5 (783.99 Hz) at 0, 0.2, 0.4 s.
- Each: 30 ms attack to 0.16, decay toward 0.048 (tc 0.3 s), held 0.4 s, release ≈ 0.5 s. Buffer 1.3 s.
- Played with plain `sfx('restart_chime')`. Rue moments: after the crash in 1.2 (`24-…:242`), the Restart Ritual's
  success (`12-…:621`), the JARVIS Sale reprise's tap phase (every 8 steps of 0.25 s, with `knock` taps on the
  player's pattern, `12-…:403-404`), and Chase tapping it on the counter in the epilogue (`35-…:105-111`: the chime
  once, then three `knock`s 0.2 s apart, twice).
- TWO spec §15.2: **keep it identical** — do not edit this recipe.

---

## 11. The Pudding song (1987) and the sequencer path — `03-audio.js:547-645`

### 11.1 Constants

```js
const STEP = 60 / 92 / 4, BAR = 16 * STEP;   // 0.16304 s, 2.6087 s
const MEL = [0, 4, 7, 4, 2, 5, 9, 7, 4, 7, 12, 9, 7, 4, 2, 0].map((n) => Math.pow(2, n / 12)); // D5 F#5 A5 F#5 E5 G5 B5 A5 F#5 A5 D6 B5 A5 F#5 E5 D5
const DEF = [[0, 4, 8, 12], [4, 12], [0, 2, 4, 6, 8, 10, 12, 14], [0, 2, 5, 7, 10, 13]].map(...);
const LANES = [['dynamo', 'dynamo_hit', 0.55, 0.35], ['till', 'till', 0.4, 0.35], ['kettle', 'kettle_click', 0.3, 0.3], ['whistle', 'whistle', 0.75, 0.5]]; // sample, sfx, gain, bleep gain
const SONG_PADS = [[50, 54, 57, 62], [50, 55, 59, 62], [50, 54, 59, 62], [49, 52, 57, 64]], SONG_BASS = [38, 43, 35, 33]; // D G Bm A
```

| Item | As implemented |
| --- | --- |
| Tempo | 92 BPM, 16 steps per bar, 4/4. |
| Key / chords | D major. Pads (one per bar, cycling): D (D3 F♯3 A3 D4) – G/D (D3 G3 B3 D4) – Bm/D (D3 F♯3 B3 D4) – A/C♯ (C♯3 E3 A3 E4). Bass roots D2 – G2 – B1 – A1. |
| Melody | **Pitch is fixed per step position**: step `s` of the lead lane always plays `MEL[s]` = D5 F♯5 A5 F♯5 E5 G5 B5 A5 \| F♯5 A5 D6 B5 A5 F♯5 E5 D5. The player toggles steps on/off; it cannot change pitches. The lead buffer (tin whistle or bleep) is a **D5** and is re-pitched with `playbackRate = MEL[s]`. |
| Default pattern `DEF` | Kick 0 4 8 12 · snare 4 12 · hat every 8th · lead 0 2 5 7 10 13 (D5 A5 G5 A5 D6 F♯5 — the `demo` hook). |
| Bass rhythm | Steps 0, 6, 8, 14 of every full bar; step 14 at rate 1.4983 (= 2^(7/12), a fifth up). |

### 11.2 Stems (`STEMS()`, `03-audio.js:553`), baked at 44.1 kHz

| Stem | Content |
| --- | --- |
| `S.pad[0..3]` | `chord(..., BAR)` saw pads, LP 1800, detune [−9, 0, 9], attack 0.25, release 0.7; buffer `BAR + 1` s (overlaps the next bar). |
| `S.bass[0..3]` | `bassN(root, 0.7 s, 0.35, LP 900)`; 1 s buffer. |
| `S.bleep[0]` | Kick bleep: square 98→65 Hz. |
| `S.bleep[1]` | Snare bleep: 294 Hz square + BP noise. |
| `S.bleep[2]` | Hat bleep: 2093 Hz (C7) square tick. |
| `S.bleep[3]` | Lead bleep: **D5** square (re-pitched like the whistle). |

### 11.3 How sample lanes map to sfx recipes

For lane `l`, if the lane's sample key is in `samples` **and** `B[sfx]` exists, the lane plays the one-shot buffer at
gain `v1`; otherwise the synth bleep `S.bleep[l]` at gain `v2` (`03-audio.js:579`):

| Lane | Role | Sample key → sfx recipe | Gain (sample / bleep) |
| --- | --- | --- | --- |
| 0 | Kick | `dynamo` → `dynamo_hit` | 0.55 / 0.35 |
| 1 | Snare | `till` → `till` | 0.4 / 0.35 |
| 2 | Hat | `kettle` → `kettle_click` (not `kettle`: the click only) | 0.3 / 0.3 |
| 3 | Lead | `whistle` → `whistle` (re-pitched by `MEL`) | 0.75 / 0.5 |

Extras driven by collected samples (not lanes):

| Sample | Effect |
| --- | --- |
| `rain` | `L.rain` loops under the whole song at 0.5. **Credits mode always adds it**, collected or not. |
| `trill` | An intro bar: `B.trill` on its downbeat (+ the D pad in band modes). Credits mode always has the intro bar. |
| `bell` | `B.bell` on the downbeat of every 4th bar (k = 0, 4, 8, … in loop and seq modes) and on the coda. Credits mode: only on the coda, always. |
| `beep` | Not used by the song (the sequencer's no-`AUDIO.seq` fallback uses `sfx('beep')`). |

Note that `SAMPLES[k].sfx` (`01-config.js:86-95`) and the song's `LANES` are separate tables: `SAMPLES.kettle.sfx`
is `'kettle'` (the full boil, used when a sample is "played" in the world), the song uses `'kettle_click'`.

### 11.4 Player modes and arrangement (`player`, `step`, `coda`; `03-audio.js:572-618`)

`step(p, t)` per 16th: `bar = i >> 4`, `s = i & 15`, `k = bar − p.first`; `sec` 0 intro / 1 full / 2 breakdown;
`band = mode !== 'seq'` (pads + bass on).

| Mode | Entered by | Arrangement |
| --- | --- | --- |
| `'seq'` | `AUDIO.seq.play` | Optional trill intro bar (trill only). Then forever: lanes 0–2 + lead from the live pattern; **no pads, no bass**; bell every 4 bars if collected; rain if collected. `onStep(s)` per step. |
| `'loop'` | `AUDIO.song(p, {bars})`, `pudding_*` cues (bars 0 = forever) | Optional trill intro bar (trill + D pad). Then full band: pad per bar (D G Bm A), lanes, lead, bass. After `bars` bars: coda if `ending`, else stop 1 s later. |
| `'credits'` | `AUDIO.song(p)` without `bars`, `music('credits')` | Intro bar (D pad, trill if collected) · bars 0–7 full · **bars 8–11 breakdown: rain + lead only** (the lead lane, or `DEF[3]` if the player's lead lane is empty: "never goes silent") · bars 12–19 full · bar 20 downbeat: **coda** (D pad + D bass + bell, always) and end 7 s later. Total ≈ 21 × 2.609 + 7 = **61.8 s**. |

```js
function coda(p, t) { // the ending: the D chord, the bass, and the bell if Chase recorded it
  play(S.pad[0], t, p.padG, 1); play(S.bass[0], t, p.bassG, 1);
  const bell = p.bell || p.mode === 'credits'; // the credits always end on the bell
  if (bell) play(B.bell, t, p.fxG, 1);
  p.done = true; p.endAt = t + (bell ? 7 : 4);
}
```

Player mix: lane gains per §11.3, bass 0.35, pad 0.7, fx (trill/bell) 0.45, rain 0.5, all into `p.out` →
`o.dest || busM`.

### 11.5 The scheduler (`pump`, `03-audio.js:619`)

```js
const now = ctx.currentTime, ahead = now + (document.hidden ? 1.2 : 0.2);
...
while (!p.done && p.t < ahead) { step(p, p.t); p.i++; p.t += STEP; }
while (p.qn && p.qt[p.qh] <= now) { const i = p.qi[p.qh]; p.qh = (p.qh + 1) & 63; p.qn--; p.onStep(i); }
```

- Classic look-ahead: a 25 ms `setInterval` (started with the first player, cleared when none remain) schedules
  every hit up to 0.2 s ahead **on the audio clock** — sample-accurate timing regardless of frame rate. 1.2 s ahead
  when the tab is hidden (background timers throttle to ~1 Hz).
- First step at `ctx.currentTime + 0.06`.
- `onStep` uses a preallocated 64-entry ring buffer (`Float64Array` times, `Int8Array` steps): no allocation per step.
  It fires 0–25 ms after the step's audio time (plus output latency).
- `stopPlayer` / `release`: hold and ramp `p.out` to 0, stop the rain bed, disconnect `p.out` after `fade + 0.3` s.
  Hits already scheduled inside the look-ahead play into the faded/disconnected gain (silent).
- Because the pattern arrays are read live, **mutating `state.pattern` while a song plays changes it** within 0.2 s.

### 11.6 The 3.3 sequencer mini-game (`16-…-the-sequence.js:282-413`)

- `play(on)` → `AUDIO.seq.play(PAT, state.samples, onStep)` / `AUDIO.seq.stop()`; `onStep = (i) => playRow = i`.
- If `AUDIO.seq` is missing it ticks its own clock in `update(dt)` and fires `sfx` per step (frame-quantised):
  sample lanes play their sfx at rate 1 (vol 0.8), missing ones play `beep` at rates [0.5, 0.8, 1.6, 1] (vol 0.6),
  the lead at `MELR[step]`.
- Toggling a step on while stopped previews it (`hitSfx`); otherwise `tick`.
- FINISH stores `state.pattern = PAT.map((l) => l.slice())` — 4 arrays × 16 booleans. This is the only pattern format
  `player` understands.

### 11.7 Other song entry points in Rue

| Where | Call | Result |
| --- | --- | --- |
| 2.6 timelapse (`28-…:622`) | `AUDIO.song(null, { samples: ['rain'], bars: 8 })` | Default pattern, all bleeps, rain bed, 8 bars. **Not guarded by `flow.skipping`.** |
| 3.3 finished (`33-…:310`) | `AUDIO.song(state.pattern, { samples, bars: 8, ending: true, onEnd })` | 8 bars + coda; skipped → never started. |
| 3.4 → 3.5 | `music('pudding_walkman')` → `music('pudding_warbly')` | One continuous player, recoloured. |
| Credits (`18-…:83`) | `AUDIO.song(st.pattern || DEF(), { samples, onEnd })` | Credits mode; roll length estimated as `20 × 240/92 + 3 (trill) + 5 (bell) + 1`. |
| Extras jukebox (`10-ui.js:750-757`) | `AUDIO.song(pattern, { samples, onEnd })` | Credits mode; stop restores `music('title')`. |

---

## 12. Voices (`renderVoices` + `blip`, `03-audio.js:728-752, 847-859`)

### 12.1 Voice definition (`CHARACTERS[id].voice`, `01-config.js:50-79`)

| Field | Required | Effect at bake time |
| --- | --- | --- |
| `wave` | yes | `'square'`, `'triangle'`, `'sawtooth'` (native), `'pulse'` (12.5% pulse `PeriodicWave`), `'sine'` (**not pure**: the `WARM` wave with harmonics, so low voices carry on small speakers). |
| `f` | yes | Base pitch, Hz. |
| `len` | yes | Blip length, s. Rising variant is 1.5 × len. |
| `gap` | no | Extra silence between blips (adds to the rate limit). |
| `filter` | no | Low-pass Hz (Q 1). |
| `soft` | no | Gentler attack (15 ms vs 3 ms), longer decay/release, normalised a touch quieter (RMS 0.06 vs 0.07). |
| `tumble` | no | Each variant at a different pitch (×1.1, 0.94, 1.04, 0.9) gliding to (×0.92, 1.06, 0.95, 1.08): a tumbling, excitable voice (Chase). |
| `mono` | no | No vowel EQ, no glide, no random rate, no rising variant: a flat machine voice (Operator). |
| `also` | no | Another speaker id blipped at the same time (duets). |

### 12.2 What gets baked per speaker

Five renders (`len + 0.06` s; the rising one `1.5 × len + 0.06`): variants k = 0..3 through a peaking EQ (+7 dB, Q 1.8) at 700 / 1100 / 1600 / 2300 Hz
(vowel colours), each with a slight downward glide to 0.96 f (unless `tumble`/`mono`); k = 4 is the **rising** blip
(EQ 1100 Hz, glide up to 1.35 f). All five are scaled together so their RMS through a ~290 Hz one-pole high-pass
equals 0.07 (0.06 soft): every voice is equally loud regardless of pitch. Stored as
`V[id] = { n: [4 buffers], q, min: len + 0.02 + gap, mono, also, last: 0 }`.

Every `CHARACTERS` entry is baked, whether or not it speaks. Rue has 27 (incl. the duet ids).

---

## 13. Recipes: how to add things

### 13.1 A new one-shot

Add an entry to `SFX` (`03-audio.js:254`). Example, a SafeSense two-note chirp:

```js
safesense: [0.35, (c, d, t) => {
  tone(c, d, t, mtof(84), 0.06, { type: 'triangle', to: mtof(88), gl: 0.05, v: 0.14, a: 0.003, r: 0.05 });
  tone(c, d, t + 0.09, mtof(91), 0.08, { type: 'triangle', v: 0.12, a: 0.003, d: 0.05, r: 0.08 });
}],
```

Rules:

1. The first number is the render length. It must cover the last stop time (`t + max(dur, a) + r + 0.02`) or the
   sound is truncated. Too long wastes memory (44.1 kHz × 4 B per second).
2. The recipe runs once, offline, at `t = 0`, at 44.1 kHz mono. Use the toolkit (§4) and textures (§6). Never touch
   the runtime `ctx`, the DOM or game state.
3. Level by ear against existing recipes (`v` 0.1–0.6; most peaks well under 1). One-shots are not normalised.
4. No exponential ramps to ≤ 0 (§4.2). A throw silently kills everything baked after it.
5. Play it: `sfx('safesense')`, `ui.sfx(...)`, `{ sfx: 'safesense', vol: 0.6 }`, `api.sfx(...)` in mini-games.
6. If it is a collectable sample, add `SAMPLES[key] = { label, sfx: 'safesense' }` and, for the song, a lane mapping.

### 13.2 A new loop (ambience)

```js
cicadas: { len: 4, rms: 0.03, xf: 1, whole: (c, d) => {          // render to len + 0.5 when xf is set
  const g = c.createGain(); g.gain.value = 0.6; lfo(c, g.gain, 0.5, 0.4); g.connect(d);  // 2 swells per loop: seamless
  noise(c, g, 0, 4.5, { v: 0.5, bp: 5200, q: 6 });
  noise(c, g, 0, 4.5, { v: 0.3, bp: 6100, q: 8 });
} },
```

- Choose `len` so any periodic modulation completes whole cycles (Rue's `held_note`: 0.25 Hz beat in 4 s; `title`:
  LFO at `2 / len`).
- Noise beds: `xf: 1` and sound for at least `len + 0.3`. Musical loops: `bars` + a `tail` long enough for releases.
- Set `rms` relative to the existing beds (0.01 clock … 0.09 heavy rain): ambience loops play at `vol` 1.
- Use it from set data (`ambience.loops`), a step (`{ loop: 'cicadas', vol: 0.5 }` / `{ loop: 'cicadas', stop: true }`)
  or code (`AUDIO.loop('cicadas', { at: [x, y, z] })` — keep the handle and `stop()` it in `end()`).

### 13.3 A new baked music cue

```js
store40: { len: dur(8, 96), rev: [1.4, 0.2, 0.5], bars: [8, (c, d, k) => {
  const st = 60 / 96 / 4, ch = [[50, 54, 57], ...][k];
  for (const s of [0, 6, 10]) for (const m of ch) fm(c, d, s * st, mtof(m + 12), st * 3, { ratio: 3.01, index: 0.8, v: 0.03, d: 0.4, r: 0.3 });
  bassN(c, d, 0, ch[0] - 12, st * 7, 0.25);
  ...
}] },
```

- `bars: [count, fn(c, d, k)]` — `k` is the bar index; time 0 is the bar's downbeat; one offline context per bar.
- Put whole-loop textures (crackle, hiss, drones) in `whole`; global reverb/band in `rev`/`band`.
- Keep cues short (8 bars). Memory: 32 kHz × 4 B ≈ 128 KB per second (a 30 s cue ≈ 3.8 MB).
- `music('store40', { fade: 2 })` or `music: 'store40'` on a scene/step. Add a `BED` entry if it should carry rain.
- To also hear it diegetically (a radio in the room), generalise the `buttery_radio` special case in `loop()`.

### 13.4 A new runtime (player-based) cue

Add a branch in `music()` after the `M[cue]` check (`03-audio.js:897-907`) that builds a filter chain into `g` and sets
`cur.p = player(...)` (or reuses `song(dest)` to keep a running player across a recolour). Any LFOs/oscillators you
start must be pushed to `cur.src` so `endCue` stops them.

### 13.5 A new voice

Add a speaker to `CHARACTERS` with a `voice` object (§12.1); it is baked automatically and `say(id, …)` blips it.

```js
// 01-config.js:54 — Chase (tumbling) and 71 — the Operator (flat machine voice)
chase:    { name: 'CHASE',    voice: { wave: 'triangle', f: 260, len: 0.035, tumble: true } },
operator: { name: 'OPERATOR', voice: { wave: 'square',   f: 330, len: 0.06, mono: true, filter: 2500 } },
```

A new voice *feature* (ring modulation, phone band, pure sine) goes in `renderVoices`, inside the per-variant render
callback (`03-audio.js:735-744`), e.g. a ring modulator:

```js
// after creating pk: route through a ring modulator when v.ring is set (Hz)
let into = pk;
if (v.ring) { const rm = c.createGain(); rm.gain.value = 0; lfo(c, rm.gain, v.ring, 1); rm.connect(pk); into = rm; }
tone(c, into, 0, f, len, { ... });
```

---

## 14. Timing and performance constraints

| Topic | Rule / fact |
| --- | --- |
| Per-frame cost | Only `AUDIO.listener()` runs every frame (param writes, no allocation). Everything else is event-driven. |
| Node allocation | `sfx` = 2–4 nodes, `blip` = 1, `loop` = 2–4, song hit = 1. Unavoidable (source nodes are single-use) — so bound the **call rate**, not the allocation. Never call `sfx` unconditionally from `update()`. |
| Options objects | Reuse them in per-frame code (`SO` in the sequencer, `GUT`/`RADIO` in `06-set-square.js:860, 979-980`). Flow steps reuse the step object. |
| Handle automation | `h.vol()/h.rate()` add an automation event each call; only call on real change (threshold, as pedal power does). |
| Scheduling | `sfx`/`blip` start "now" (+ output latency). There is **no public way to schedule a one-shot in the future or to read the audio clock**. Frame-driven rhythms (restart ritual, sequencer fallback) jitter by up to a frame. Sample-accurate rhythm = the player scheduler. |
| Game clock vs audio clock | Cutscene `wait`s use the game clock (`?speed=8` speeds them up, pause stops them); audio runs in real time and **is not paused by the pause menu**. Music/song lengths therefore don't line up with game timing under `speed` or pause. |
| Boot | ~280 offline renders and ~42 MB of PCM. Bar-chunked rendering keeps each graph small; groups yield to the loader. Never bake at runtime. |
| Panners | Equal-power for everything; HRTF only for `walkman` (much more expensive per voice). |
| Long one-shots | Can't be stopped (bell 8.5 s, bus 3.7 s, kettle 3.35 s); they ring on through a skip or scene change. |

### Skip-safety (cutscenes)

- `{sfx}` steps are **dropped** while `flow.skipping` (`11-flow.js:160`).
- `{music}` steps still run, as `{cut: true}` (12 ms switch) so the state after the skip is right.
- `{loop}` steps **still start and stop** while skipping (they are state). Every started loop needs a matching stop
  step, or it plays on after the skip (`flow.stop()` only cleans up step loops).
- `do` steps that call `c.sfx`/`AUDIO.*` in loops must check `c.flow.skipping` (Rue: `tapChime`, the blip loops in
  `27-…:552`, `31-…:232`, `playSong` returns early). The 2.6 `AUDIO.song` call is unguarded and plays 8 bars over
  whatever follows a skip.
- Mini-games must stop their own handles (`AUDIO.loop` alarms, dynamo, hum, walkman) in `end()`.

---

## 15. Gotchas (complete list)

1. **Silent before `init()`.** Calls are dropped, not queued. `music()` before init does not remember the cue.
2. **One bad recipe kills the rest of the bake** (§3.2): a throw in any SFX/stem/voice/loop/cue rejects its group and
   skips every later group. Symptom: some sounds work, all music is silent, console shows "boot job failed".
3. **Every `CHARACTERS` entry needs a `voice`** or `renderVoices` throws (gotcha 2).
4. **Unknown names are silent.** `sfx('typo')` and `loop('typo')` do nothing; `music('typo')` becomes a silent current
   cue that blocks re-requesting it.
5. **`music(sameCue)` is a no-op**, even with new options.
6. **Blip fallback is `V.student`.** If TWO has no `student` speaker, unknown/generic speaker ids are mute. Prefix
   matching splits on `_` (`door_drone` → `door`, then `student`).
7. **`wave: 'sine'` voices are not pure sines** (the `WARM` wave).
8. **Hard-coded names and scenes:** `loop()` special-cases `buttery_radio`, `alarm`, `walkman`; `music()` special-cases
   `credits`, `pudding_walkman`, `pudding_warbly`, the `BED` cues, and `state.scene === '3.4'` (in TWO, 3.4 is the boss).
   UI calls `music('title')` (`10-ui.js:751, 827`).
9. **Song lead pitch is per step index** (`MEL[s]`), and lead buffers must be tuned to **D5**.
10. **The song's pattern format is fixed**: exactly 4 lanes × 16 booleans; lane→sample mapping is the fixed `LANES`
    table, not the player's choice.
11. **`AUDIO.song` returns only `{stop}`** (no `dur`); `stop()` never calls `onEnd`; without `bars` it is always
    credits mode (61.8 s).
12. **Songs ignore `music()`**: `AUDIO.song` players are not the current cue; `music(null)` does not stop them, and
    they are ducked under dialogue because they share `busM`.
13. **One-shots can't be stopped**, and UI sounds get room reverb (they share `busS`).
14. **`ambience`/`setRoom` order** (§3.6) and rain choice depend on `room === 'room'`.
15. **Audio is never paused**; `input.gesture` (unlock) fires only once.
16. **Not deterministic**: `Math.random` in recipes, loop start offsets and blip variants.

---

## 16. How to extend for TWO

Targets from `docs/BUILD_PROMPT.md` §4, §9, §10, §13, §15, §16 and `docs/ARCHITECTURE.md` §3.4, §3.7, §5.

### 16.1 Keep as-is

- The bus/limiter graph, `sfx`, `loop`, `ambience`, `setRoom`, `listener`, `duck` (`CONFIG.duck = 0.6` is exactly the
  spec's 40% duck), the bake pipeline and the look-ahead scheduler.
- Rue recipes the spec reuses: `restart_chime` (**byte-identical**, §15.2), `trill` (reverse-charge double trill),
  `brick_ring` (brick phone), `kettle` + `kettle_click`, `ding` (JARVIS pop-ups), `clunk` (disabled options, §12),
  `alarm` + loop `alarm` (display alarms), `rain`/`rain_heavy`, `bell`, `whistle`, the operator voice, Margaret's voice.

### 16.2 Engine changes TWO needs

| Need (spec) | Change |
| --- | --- |
| Rhythm-accurate input: Public Piano at 92 BPM (§9.6), boss timings | Add `AUDIO.now()` (→ `ctx.currentTime`) and `sfx(name, { when })` (`s.start(when)`). Judge hits against the step times the player scheduled (extend the `onStep` ring buffer to pass the audio time), not frame time. |
| "two" (§15.3): sections INTRO·VERSE·CHORUS·VERSE 2·BRIDGE·CHORUS·OUTRO, 44 bars ≈ 1:55, B minor → D-major final chorus | Generalise `player()` to take a **song definition**: a section list (bars, chord stems, drum on/off, lead line), pad/bass stems for Bm, G, D, A, Em (and Rue's D G Bm A for the final chorus), and a lead **pitch per step** (not `MEL[s]`). Keep the scheduler, ring buffer and coda logic. The outro coda plays the D chord then `B.restart_chime`. |
| `AUDIO.song({ pattern, from, to, muffled, bleed })` (ARCHITECTURE §5) | New signature (Rue's is `song(pattern, o)`): `from`/`to` are section names; `muffled` routes `p.out` through a low-pass (2.10 "muffled, stops after the first chorus"); `bleed` = headphone leak (re-use the `pudding_walkman` chain). Return `{ stop, dur }` so the credits can time the roll; call `onEnd` on natural end. |
| Sample lanes chosen by the player (§9.10) | `state.pattern` becomes `{ lanes: [{ sample, steps[16] }…], lead: […], feature }`. Lane sound = `B[SAMPLES[sample].sfx]`, else that lane's bleep. Pitched samples (piano, ukulele "doubling the chords") need a root note per sample so the player can re-pitch them per chord (`rate = 2^((note − root)/12)`). Update the sequencer's pattern validation (`loadPattern` rejects anything not 4×16). |
| Bridge "feature" slot: Luka (laughing) on beat 1 of bridge bars 1 and 5; Drone whir swells as a pad | A per-section "feature" lane in the song definition; the whir as a long, slowly faded hit (or a `loop` handle started by the player at section start and stopped at section end — push it to the player so `release` stops it). |
| Music cues (ARCHITECTURE §3.7) | Baked `CUES`: `radio` (80s-rock Christmas pastiche: chugging square "guitar", sleigh bells), `tense`, `store40`, `seaside`, `stealth`, `checkpoint`, `sizzle`, `quiet`, `choir`, `hq`, `manager`. Player-based (one sequenced song, different stems/filters): `pudding`, `hold` (thin chiptune), `walkman`, `uke`, `lift`, `two`, `boss` (verse+chorus only), `pads`, `scooter` (fast chiptune chorus), `lullaby`, `lofi`, `credits`. Keep a `title` cue (or change `31-ui.js`). Replace the `BED`/`'3.4'` hack with a per-cue `bed` field. |
| The Manager's motif (§15.2): G5–E5–C5, slow, falling, soft sine, long tail | A new one-shot (or a short cue) — **do not touch `restart_chime`**: `[79, 76, 72]` at ~0.6 s spacing, `a` ~0.08, `r` ~2, through `rev`. Render length must cover the tail. |
| Restart chime only twice in TWO (Future Luka's NO; end of "two") | `sfx('restart_chime')` at the NO; the song coda schedules `B.restart_chime` on the audio clock. |
| Luka (laughing) (§15.4) | New SFX `laugh` (2–3 s): `babble`-style — a pulse at Luka's 110 Hz + noise through "ah" formants ≈700/1200 Hz, 8–12 "ha" bursts each falling slightly, irregular gaps, breaths (BP noise). `LAUGH_CLIP` (base64 data URI): in `prerender`, `await new OfflineAudioContext(1, 1, SR).decodeAudioData(bytes)` and store as `B.laugh` (so `sfx`, lures and the song all pick it up); fall back to the synth on error. |
| Voicemail (§15.4): Luka's blip through 300–3400 Hz + tape hiss | Add a `band: [lo, hi]` voice field (route the variant through `band(c, d, lo, hi)`) and a `voicemail` speaker `{ wave: 'square', f: 110, len: 0.045, band: [300, 3400] }`. Hiss: Rue's trick `AUDIO.loop('rain', { vol: 0.05, rate: 2.1 })` (`34-…:911`) or a dedicated `hiss` loop. `VOICEMAIL_CLIP` like `LAUGH_CLIP`. |
| New voice features (§4) | Manager: sawtooth 95 Hz, LP 900, "drone filter, pitched down, slightly ring-modulated" → `ring` field (§13.5). Des: "sine 300 Hz pure" → a `pure` flag that skips `WARM`. SafeSense "chirpy" → a `chirp` flag (rising glide on every variant). Teddy "slow" → larger `len` + `gap`. Drone: `mono` + `filter`. Generic speakers (HR, DESK, …): give each a `CHARACTERS` voice **and** keep a generic fallback id (gotcha 6). |
| Lures (§9.5, boss Lure wheel) | `SAMPLES[k].lure = { r, dur }`; play the sample positionally at the lure point: `sfx(SAMPLES[k].sfx, { at: pos })`; `dur` can default to `AUDIO.sampleBuffer(k).duration`. |
| Sample waveform card (§13.6) | Draw from `AUDIO.sampleBuffer(k).getChannelData(0)` (downsample once, cache). |
| Drones everywhere (hangar hundreds, roof ring of 400) | **Never one loop per drone.** Keep a pool of 2–4 positional `drone_hum` loop handles and move them to the nearest drones with `h.pos()` each frame (param writes, no allocation); add a non-positional bed whose `vol()` follows the drone count (threshold-gated). |
| Ambience variety: rain on glass / roof / street, thunder, cicadas, bay waves + pelican clack, sizzle, server hum | Loops + an `ambience.rain` vocabulary (`'glass'`, `'roof'`, `'street'`) mapped to loop names in `ambience()`; thunder as positional one-shots fired by the set's `update` on a timer (reuse an options object). |
| 3.5 "heartbeat-free ringing" | A tinnitus loop (pure high sine, ~6–8 kHz, `xf`) faded in with `vol()`, plus `music.silence(true)`. |
| Story timing in the boss (compressed countdown, lines over gameplay) | Drive timing from the game clock as Rue does; only rhythm-critical sound needs the audio clock. |
| Pause | Consider `ctx.suspend()` on pause / `resume()` on resume so songs and timed sequences stay aligned with the game clock (Rue does not). |
| `AUDIO.stopAll()` | Call it on Quit to Title and before the Safe Room retry so stray loops/songs don't survive. |

### 16.3 Pitfalls (performance and robustness)

- **Bake at boot, play buffers at runtime** (§16 of the spec). No `OfflineAudioContext` and no `decodeAudioData`
  mid-game. This is audio's equivalent of shader warm-up: anything first-used mid-game must already be in `B/L/M/V/S`.
- **Memory budget.** TWO's cue list is roughly twice Rue's. Keep baked cues to 8 bars at 32 kHz; prefer
  player-based cues (stems, ~1 s each) for every Pudding/"two" variant — a baked 44-bar "two" is ~15 MB and can't
  follow the player's pattern anyway.
- **Boot time.** Split `prerender` into several boot jobs (one per group) so the "JARVIS is loading your game" bar
  moves (and can go backwards for the joke) instead of stalling on one job. Keep heavy cues bar-chunked.
- **Guard the bake.** Wrap each recipe's render in `try/catch` (log the name) so one bad recipe can't silence the
  game (gotcha 2); add a `console.warn` in `music()`/`sfx()` for unknown names under `TEST.auto`.
- **No per-frame allocation**: reuse options objects; rate-limit `sfx` from `update()`; threshold `h.vol()/h.rate()`.
- **Skip-safety**: `{sfx}` is dropped on skip, `{loop}` and `{music}` are not; guard every `do`-step audio loop and
  every `AUDIO.song` start with `c.flow.skipping`; pair every loop start with a stop; stop handles in mini-game `end()`.
- **Instancing has an audio analogue**: a pool of N positional handles, never one per instance.
- **The 2.10 sequencer must still work without `AUDIO.seq`** (Rue's fallback clock) for headless tests where the
  context may be missing or suspended.
