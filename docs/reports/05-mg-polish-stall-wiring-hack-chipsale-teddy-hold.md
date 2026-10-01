# Mini-game reports: polish, stall, wiring, hack, chip sale, teddy, hold/choice

## polish_stall
# Report: Polish (9.1) and Stall (9.2)

Both mini-games are built and committed as `800acc3`, which contains only `src/40-mg-polish.js` and `src/41-mg-stall.js`. Nothing was pushed. The dev scenes have been deleted.

**Testing.** Each game passed four headless runs with 0 errors and 0 warnings, and no shader compiled mid-game:
- `autoplay=1&speed=2` at 1280×720, with a screenshot every second, which I looked at.
- `autoplay=1&fast=1&speed=8`.
- A portrait phone run at 390×844.
- A real-input run with autoplay switched off inside the game: mouse drags, holding Enter, and arrow keys for Polish; choosing with arrows and Enter for Stall.

The machine's load average was about 56, so each run took 2–9 minutes. Touch was not emulated.

**Lines.** `check-lines` confirms these lines are present: 1.1 L389 ("CHASE.", "Sorry.") and 1.3 L509–L532 (every round, reply, "…Who's that?" and "Chase's uncle"). The lines still missing in 1.1 and 1.3 belong to the scenes and to the Wiring game.

## MINIGAMES.polish
**Call:** `['minigame','polish',{ shot, lean, flag, anim }]`, or from a hotspot `await c.flow.minigame('polish', {...})`.

**Params:**
- `shot`: the camera under the card. It is re-applied after the lean. Default is `{shot:'INSERT', at:'hero_top'}` if the set has that anchor.
- `lean`: what happens at 99%.
  - Left out or `true`: the built-in beat runs, but only if actor `chase` is on the set. He walks to mark `s11_chase_lean` (fallback `[6.25,0,-6.2]`) and leans in with the `push` animation. The handprint lands, then LUKA "CHASE." / CHASE "Sorry.", and he walks back to where he was.
  - A list of steps: played with `api.play`.
  - A function `fn(api, handprint) → Promise`.
  - `false`: no lean.
  - Custom steps can land the print at the right moment with `{do: () => MINIGAMES.polish.handprint()}`. If nothing calls it, the print lands when the lean ends.
- `flag`: set on success or skip, e.g. `'s11_polished'`.
- `anim: false`: don't put Luka into the crouched polish loop.

**Result:** `{ spotless: true, shine: 1, leaned, secs }`, plus `skipped` or `auto`. There is no fail.

**Events:** `polish:lean`, `polish:spotless`.

**What the scene should set up:** Luka at `s11_polish` and Chase at the counter.

**Props it drives, if they exist:**
- `hero_table.userData.handprint(on)`, `glint()` and `set('spotless')`.
- `hero_smudge` fades with the shine. This only happens if its material is already transparent; switching transparency on would recompile a shader.

**How it plays:**
- The 1.6 × 0.9 glass is a painted card: fingerprints, a palm smear, sleeve swirls, specks, a mug ring and a ghostly forehead print. On portrait screens the card rotates 90°.
- The cloth follows a mouse drag or a finger, or Hold YES plus arrows or stick.
- Holding YES (or the mouse button, or a finger) still for 0.5 s polishes slowly on its own. The cloth circles and drifts to the nearest dirt.
- With "Hold to confirm: Press" on, YES puts the cloth down and lifts it again; NO also lifts it.
- Story Mode rubs 1.6× as hard.
- Chase's print knocks about 6% off the shine.
- If no progress is made for 4 s above 85%, a ring glints on the dirt that's left.
- At 100%: a sparkle band sweeps the glass (dimmer and slower with Reduce Flashing), a chime plays and SPOTLESS is stamped. The game finishes 2.4 s later.

**Autoplay:** it scrubs the densest dirt for real and the lean plays its lines. It took about 40 s of game time. With `fast=1` it jumps straight to the end state.

## MINIGAMES.stall
**Calls:** first `{ rounds:[1,2,3] }`, then the scene does the forced SWAP and Chase's wiring, then `{ rounds:[4,5], drift:true }`.

**Params:**
- `rounds`: which rounds to play. Default `[1,2,3]`; `[1,2,3,4,5]` also works in one call.
- `suspicion`: starting level. Default is 30, or wherever the last call left it.
- `drift`: either a number of seconds away, or `true` to measure the time since the last call ended. Suspicion rises 0.6 per second, by at most +30 and never past 92. The meter climbs at the start of the call, captioned "+N while you were away".
- `shot`: the base camera. Default is an over-the-shoulder shot past Luke onto Luka, with the backroom door behind him.
- `cams: false`: no per-line cuts. The door and trench-coat beats still cut.
- `testDoor`: autoplay only. Picks the worst answers until the first door event, to exercise it.

**Result:** `{ half: 1|2, done, suspicion, doors, round }`, where `round` is the next round to play. Event: `stall:door`.

**Helpers:** `MINIGAMES.stall.level()` returns the current level including drift, if the scene wants `ui.meter` while the player is on Chase's side. `.reset()` clears the memory between halves.

**What the scene should set up:**
- `luka` and `luke` facing each other at `s13_stall_luka` / `s13_stall_luke`.
- `chase40` in the backroom, `jordan` anywhere (his line is off-screen).
- If the set has them, it uses marks `s13_luke_door` and `s13_c40_pass_a`/`_b`, and prop `backroom_door.userData.open`. Otherwise it falls back to the coordinates in the spec.

**How it plays:**
- **The meter.** A panel in the dialogue-box style shows Luke's live face texture. `browLift` raises his left eyebrow, so it rises on the 3D model too, and it twitches above 75. A small SUSPICION bar sits under the portrait, plus pips for the five rounds.
- **Answers.** Luke asks, and the three answers open under the question. Luka says the chosen line, the replies play, then the eyebrow verdict: + is +18, ++ is +32, − is −12, −− is −25 (milder in Story Mode).
- **Hesitation.** Dithering over an answer for more than 6 s creeps the meter up 1.6 per second, never past 95. This is off in Story Mode.
- **Round 4.** "No." walks the trench coat past the door window.
- **Round 5.** Luke rubs his eyes before asking. "No." repeats the round; "Yes." and "Several." end the game.
- **The door event (meter at 100):**
  - It calls `api.fail()`, so two door events offer "Skip this?".
  - Luke pushes past and opens the door; Chase (2040) is behind it.
  - LUKE "…Who's that?" / LUKA "Chase's uncle."
  - They walk back, the meter drops to 50 and the same round restarts.
- **End of rounds 1–3.** The display alarms whoop and Luke turns toward the floor. Control then goes back to the scene for the forced SWAP.

**Autoplay:** the real game plays itself, because `say`/`choose` auto-advance and pick the best answer. With `fast=1` it goes straight to the end state.

## Deviations and engine problems
- **Set id:** `10-set-reddy26.js` at HEAD still registers `SETS.reddy` (Rue's set), with no hero table and no s11/s13 marks. I tested on `reddy` using raw coordinates. Both games fall back cleanly when marks or props are missing.
- **World (`actor.play`)**: it drops animation-specific options. `play('polish',{low:true})` never crouches. I work around it by setting `luka.p.low = true` after `play`. This needs a fix in `30-world.js`.
- **UI (`choose` after `say`)**: the dialogue box hides 0.07 s of game time after a line ends. On slow frames that run several ticks at once, the question disappears before `choose()` opens, and the answers show alone. I work around it by watching the typed length of `#dlg .txt` and opening the choice 0.25 s after the question is fully typed. The 0.25 s gap also stops a YES mashed through the typing from picking an answer. A proper fix would be `choose(labels, {prompt})` in `31-ui.js`.
- **Invented lines:** none. Luka speaks the chosen answer as his line, and "Which man?" plays as a silent 1.2 s stare from Luke.

## Missing sounds (nearest existing one used)
| Needed | Used instead |
| --- | --- |
| Cloth swish | `whoosh` at volume 0.1, rate 1.6–2.1 |
| Glass squeak when a patch comes clean | `whistle`, rate about 2 |
| Hand slapping the glass | `thud`, rate 1.5 |
| SPOTLESS chime | `chime_ready`, rate 1.12 |
| Meter rising | a `tick` every 4 points, pitch rising |
| Meter falling | `pop` |
| Meter hits 100 | `sting` |
| Backroom door | `creak` |
| Display alarms (end of half 1) | `alarm` |

## wiring_hack
I've built both mini-games and committed them as `a56d246` (only `src/42-mg-wiring.js` and `src/50-mg-hack.js`). Every test run finished with 0 errors and 0 warnings. The dev scene is deleted and nothing was pushed.

**Tests run** (on `DEV_MG_WIRING_HACK`, set `reddy`). This scene ran wiring halves 1 and 2, the kettle variant, the hack's L21 opening, `single: password`, `single: e4044`, a two-bug sequence, and a throwaway host that uses `embed()` the way the boss will:
- **`fast=1&speed=8`:** DONE, 0 errors, 0 warnings.
- **`speed=2` with screenshots every second:** DONE, 0 errors, 71 screenshots; I looked at them.
- **Phones with touch emulation:** 390×844 and 844×390 runs were clean. Screenshots led to fixes for the landscape-phone board size, the brick phone's width, the flood running off-screen and the ACCESS layout.
- **Real input:** a Playwright script drove both games with no autoplay. Mouse drag, tap-then-tap, the full keyboard path, cornering the runaway OK with the mouse, typing real passwords, YES-YES for 4044, holding NO. 0 failed checks.
- **Line check:** 9.3 is 5/5. "Teal's sort of blue now. Don't ask." and the L21 "Nobody can fix JARVIS. ^ But I know how it breaks." are present. "desktop" is present for 9.12.
- **Machine load:** it was around 60 on 4 cores the whole time (other agents' Chromes), so each run took 6–8 minutes.

## MINIGAMES.wiring (spec 9.3)
A pairing puzzle on the overlay canvas: an open junction box seen from above.
- **Left side:** the 2026 socket. Wires are labelled BLUE, GREEN, WHITE, RED.
- **Right side:** the Remote's 2040 adapter with "warm grey", "teal-ish", "Yes yellow", "the other blue".
- **Answers:** blue goes to teal-ish, green to the other blue, white to warm grey, red to Yes yellow.
- **Wrong pair:** it sparks harmlessly, the plug springs home, and Chase (2040) barks a hint (a corner box, so play doesn't pause). The first hint for teal-ish is the spec line. The other hints are mine, e.g. "Yes yellow is red. ^ Red was too alarming.", with shorter versions on repeat.

**Params**
- `half: 1 | 2` — 1.3's first two wires (blue, green), or the last two (white, red) with the first half already plugged in. Left out, all four are live.
- `variant: 'kettle'` — L21. The left side is the beige jack taped "JARVIS — 1987 — DO NOT UNPLUG" with blue, white and red, plus a kettle cord tagged "doesn't go anywhere". Its terminal is the kettle, which clicks on and steams when it goes in.
- `shot` — applied at start.
- `lines.kettle` — optional steps played the moment the kettle cord goes in.

**Result:** `{ ok: true, variant: 'remote'|'kettle', half: 1|2|0, wrong, connected }`. Skipped: `{ skipped: true, ok: true, variant, half }`. It calls `api.fail()` on every third wrong pair. No flags are set.

**Input:** drag a plug onto a terminal, or tap the plug and then the terminal (touch). Keys or pad: up/down chooses a wire, YES lifts it, up/down chooses a terminal, YES plugs it in, NO puts it back. Nothing has to be held.

**Autoplay:** makes one deliberate wrong pair so the hint plays (green into teal-ish; white into Yes yellow in half 2; the cord into teal-ish for the kettle), then plugs everything in correctly, about 0.6 s per move.

**How scenes call it**
- 1.3: `['minigame','wiring',{ half: 1, shot }]`, the stall rounds, then `['minigame','wiring',{ half: 2, shot }]`. The board covers the screen over an 80% dark backdrop, so any close shot of Chase at the phone works. No junction-box prop or `chase40` actor is needed; the bark only uses his portrait.
- L21: `['minigame','wiring',{ variant: 'kettle', shot }]`. "Kettle cord. ^ It's always the kettle cord." is left to the scene, either as a normal line or through `lines.kettle`.

## MINIGAMES.hack (spec 9.12)
A full-screen card showing a phone running the SafeSense desktop: wallpaper, locked app icons, background notification toasts, the 3% battery, and a Post-it from Luka's bug list naming the bug and its fix. Pop-ups use the engine's SafeSense glass classes but live inside the card.
- **`sure`:** YES, YES, and the third ask accepts anything. NO earlier gives "Cancelled. For your safety." and starts again.
- **`runaway`:** the OK flees the cursor (mouse, finger, or a stick-driven cursor) and can only be pressed once cornered. Pressing it in the open makes it hop away. After 10 hops or 40 s it gets tired and stops running.
- **`backwards`:** the bar drains. NO (tapped, or held; "press instead" works) pushes it forward. YES gives "Cancelling is not safe."
- **`password`:** the rule line changes mid-word on the first try, then every 4.2 s. You need three words, typed on a keyboard, or press YES / OK and Luka types a word that fits.
- **`e4044`:** YES twice within 0.9 s and it shows "…What was I asking?".

**Params**
- `seq` — a list of bug ids; L21's three (`sure`, `runaway`, `backwards`) is the default.
- `single` — one pop-up, no ACCESS screen.
- `green1987` — the L21 opening: Rue's brick phone (the engine's own card painter) types a green 1987 terminal, SafeSense pop-ups flood it, then Luka says "Nobody can fix JARVIS. ^ But I know how it breaks." The scene should not repeat that line; `intro: false` turns it off.
- `access` — the line under ACCESS; defaults to "Maintenance hatch".
- `hud` — when not `single`, the game drives the HACK % bar from 0 to 100 and hides it at the end. `hud: false` turns that off; `keepHud: true` leaves the bar up.
- `time` — the phone's clock; `shot` — applied at start.

**Result:** `{ ok: true, access, bugs, misses, bug? }`. Skipped: `{ skipped: true, ok: true, access, bug? }`. Two misses count as one `api.fail()`.

**Autoplay:** actually plays each pop-up: YES, YES, then NO on the third ask; herds the OK into the nearest corner and presses it; mashes NO; types each word right after a rule change; YES, YES.

**How scenes call it**
- L21: `['minigame','hack',{ green1987: true }]`.
- Boss (3.4): `const h = MINIGAMES.hack.embed(api, { bug: 'backwards' })`, which returns `{ done, update(dt), draw(), end(), active }`. The boss forwards `update` and `draw` while `h.active` and pauses its own input. The embed never touches the HUD and never calls `api.fail()`, and it plays itself under autoplay. The "SWAP — Luka" prompt and the stall lines stay with the boss. If preferred, `['minigame','hack',{ single: 'backwards' }]` works as a standalone call.

## Deviations
- **No flags set:** half 2 pre-connects the first half itself, so there's no `s13_wires` flag as 07-minigames suggested.
- **No new hints:** 4044 uses Rue's "User not found" wording and the passwords aren't Luka's, to stay inside the spec's five-hint list.
- **Doc vs code:** the committed reddy set still registers `SETS.reddy` (not `reddy26`), so the dev scene used `reddy`. ENGINE.md says mini-games can't be skipped; the TWO host now supports skipping and I used it.

## Missing sounds (nearest existing used, nothing added to audio)
- Plug-in click: `clunk` + `pop`.
- Access granted: `chime_ready`.
- Terminal typing: `tick`.
- Pop-up cleared: `pop` + `chip_on`.

## Engine notes for the integrator
- **Press position:** the core's pointer doesn't record where a press started. On a slow frame a whole drag can land in one tick, so wiring keeps its own capture `pointerdown` listener. A `pointer.downX/Y` in the core would be cleaner.
- **Rendering under the card:** the 3D world keeps rendering under the opaque hack card; skipping it would save GPU on phones.

Files are in /home/user/two/src:
- 42-mg-wiring.js
- 50-mg-hack.js

## chip_sale
MINIGAMES.chip_sale is built and committed as `3324ca8`, with only `/home/user/two/src/43-mg-chip-sale.js` in the commit. All runs were clean, the dev scene has been deleted, and nothing was pushed.

**Tests**
- Autoplay at `speed=2` with screenshots: 0 errors, 0 warnings. Autoplay finishes the game in 22.9 s of game time.
- Autoplay with `fast=1&speed=8`: 0 errors, 0 warnings.
- Playwright probes driving real input (autoplay switched off), all finishing with `{ok:true}` and 0 errors:
  - keyboard and mouse at 1280×720, including clicking a pop-up and herding the OK with the mouse;
  - touch on a 390×844 phone in portrait (taps, letter taps, a real touch hold on the CHIP button, finger herding, the NO button);
  - Story Mode plus "hold to press".
- An autoplayed 844×390 landscape-phone run was clean too. I looked at the screenshots at every step.
- `check-lines`: 9.4 has 3/3 lines present. All three 1.5 lines that belong inside the game are present. The other 18 missing 1.5 lines are in the scene's own cutscenes.

**API**
- **Call:** `['minigame', 'chip_sale', { time: '12:20' }]`.
- **Params** (all optional):
  - `shot`: the terminal camera. The default is computed from the actors and placed over Chase's right shoulder, with Jayden on the right; on a portrait phone, Jayden sits above the terminal.
  - `c40Shot`: the Chip View camera. The default is over Chase (2040)'s shoulder; on a portrait phone it's his point of view.
  - `time`, `avg` (the store average, default 47:12), `player` (default `chase`), `other` (default `chase40`), `customer` (default `jayden`).
- **Result:** `{ ok: true, time, slips, pops, consent: true }`, plus `auto` under autoplay. A skip from the pause menu returns `{ skipped: true, ok: true, … }`, though it is never offered because the game can't fail and never calls `api.fail()`.
- **Flags it sets:** `s15_sold`, `s15_consent`, `s15_chipview`.
- **Events:** it emits `swap` for each swap. It logs `chip_sale <step>`, `chip_sale tutorial`, `chip_sale swap <id>`, `chip_sale chip view` and `chip_sale done <s>`.
- **Test hook:** `MINIGAMES.chip_sale.peek()`.

**How scene 1.5 should enter it**
- Use the reddy40 marks: Chase at `s15_chase_terminal`, Chase (2040) at `s15_c40_aside`, Jayden at `s15_jayden_counter`, Luka at `s15_luka`.
- Set `['playable', ['chase','chase40']]` and `['control','chase']` first.
- The setup cutscene (the point-of-view pop-ups, the top-down, "…Move.") and the after-sale cutscene are yours to write.
- When it ends, `state.active` is back to `chase`, Chip View and the AR labels are off, and Chase is back to idle.

**What the game does:** Customer → Verify → Swap → Opt in, each as described in your brief: the JADE PLANT fix from a letter strip, the brain-on-3% MFA wait while Jayden eats his muesli bar, the Chip View tutorial, the backwards progress bar, the runaway OK. SafeSense pop-ups land on the field you need, stack so each one's button stays visible, and must be dismissed oldest first. YES always takes the oldest; clicking a newer one shakes it. Jayden's three THOUGHT pop-ups follow the soft timer. The terminal shows "This swap 01:12" next to the store average, which is how it makes Chase look good at this.

**What autoplay does:** it gives the same inputs a player would, with seeded pop-ups so every run is the same. It picks the letters, dismisses pop-ups in order, presses SWAP, holds CHIP, lets the two lines play, swaps back, mashes NO and corners the OK. It runs faster with `fast=1`.

**Deviations**
- **SWAP inside the game:** the host only handles SWAP while roaming, and `flow.swapNext()` would hand control to the other character and re-route the followers mid-sale. So the game does its own swap: it changes `state.active`, updates the swap indicator, emits `swap`, cuts the camera, and uses `chip.show()` for Chip View (no Signal meter in this tutorial).
- **Touch CHIP button:** it normally only appears while roaming, so the game adds `body.chipable` itself while it wants CHIP and removes it at the end.
- **Invented UI text:** the "Opt in" step (the runaway OK, then "Are you sure you're sure?"), the extra SafeSense nags, the timer and Jayden's repeat line ("I say yes to my chip.") are my additions.
- **Prompt pill on portrait phones:** I skip it during the tutorial, because the engine places it on top of the swap portraits there. That overlap is in the engine's touch layout (UI owner).

**Missing sounds:** there is no crunch for the muesli bar, so I used `knock` pitched up. Everything else uses existing sounds (`ss_chirp`, `key_beep`, `tick`, `pop`, `sad_beep`, `whoosh`, `chip_chime`, `chime_ready`).

**Not checked:** I only tested on reddy26, because reddy40 isn't built yet. It shares the same coordinates, so the scene author should still check the default shots once reddy40 lands.

## teddy_hold
I've built all four mini-games and committed them as `c345225`: roleplay and reason_cards in `src/45-mg-teddy.js`, hold_no and choice in `src/52-mg-hold.js`. The dev scenes are deleted and nothing is pushed.

**Testing.**
- **Autoplay runs:** all four came back clean (0 errors, 0 warnings), both at `speed=2` with screenshots every second and at `fast=1&speed=8`, plus one run with `&ending=B`.
- **Stand-in sets:** the bridge, hq_top and hq_roof sets aren't built yet, so the dev scenes used stand-ins:
  - Teddy's booth was the Sandgate sizzle table.
  - The glass for hold_no was the reddy26 shopfront.
  - The Choice was played on parade at sunset.
- **Input probes:** separate Playwright scripts drove real mouse and keyboard input through:
  - every card path: drag, tap, a drag that falls short, arrow keys + Enter;
  - all three ways of writing CHRISTMAS: holding YES, drawing on the card, typing;
  - both reaches toward YES in hold_no, and the NO hold with the mouse and with Esc;
  - mouse and keyboard holds in the Choice, letting go early, and switching buttons.
- **"Press instead" option:** I ran hold_no and the Choice with it on.
- **Phone screenshots:** I checked phone portrait (390×844) and landscape (844×390) with touch on.
- **Lines:** check-lines shows all five 9.7 topic lines present. Every 2.5 line these games deliver, and the 3.6 "…No.", is in my files. The `--scene 2.5` and `--scene 3.6` totals will stay incomplete until the rest of those scenes are written.

**How each game works and how to call it**

| Game | Call | Result | What the scene needs |
|---|---|---|---|
| `roleplay` | `{ shot, cams, greet, flag = 's25_name', learn }` | `{ done, name: true, asked: [topics] }` | `luka` (in the Santa outfit) at the hatch, `teddy` facing him. Uses the bridge anchors `s25_roleplay`, `s25_teddy_hatch`, `s25_roleplay_rev`, `s25_no_button` and prop `no_button`; falls back to TWO / CLOSE / OTS shots on the actors. |
| `reason_cards` | `{ shot, deskShot, flag = 's25_reason' }` | `{ ok, reason: 'CHRISTMAS', tried: [...] }` | `chase` nearby. Uses anchors `s25_panel`, `s25_desk_card`, `s25_screen` and props `reason_panel`, `desk_card`, `booth_screen`, `booth_speaker`. |
| `hold_no` | `{ shot, glass, actor = 'luka40', line }` | `{ done, no: true, attempts, yesGreyed }` | `luka40` at the glass. Defaults to hq_top's glass panel when the set has prop `glass_ui`. Events: `hold_no:attempt`, `hold_no:done`. |
| `choice` | `{ shot, hands, test }` | `{ choice: 'A' \| 'B' }` | Uses the `s37_hands` anchor, else a close two-shot of Luka and Chase. Sets `state.choice` and `profile.endingsSeen`, saves, and emits `choice`. Never offered for skip. |

- **roleplay:** Luka picks from the four topics. The three topics that aren't "Your name" get a short closed reply I wrote (no spec lines exist for them), then Teddy presses NO and greets him again with "Afternoon, Santa." as if he'd never seen him.
  - That way "Afternoon. ^ What's your name?" always follows straight on, and the spec's lines play word for word, in order.
  - "…Teddy." adds Teddy's name to `state.names`; topics already asked are greyed out.
  - Autoplay asks "The computer" first, then "Your name" (just "Your name" with `fast=1`).
- **reason_cards:** the JARVIS-era panel is a painted insert. SafeSense rejects each card and it comes back greyed.
  - Once all five are rejected, Chase writes CHRISTMAS on the blank card and puts it in the reader, which accepts it.
  - My MEDICAL line is "Medical is a risk factor. ^ Please see a doctor."
- **hold_no:** reaching toward YES shakes his hand and the cursor drifts back. The second time, LUKA (2040) says "…No." and YES greys out.
  - NO fills a ring over 3 s using Rue's final-YES timing.
  - I added one animation, `ANIMS.glass_reach`, for his reaching, trembling arm.
  - The game never touches music.
  - Autoplay reaches for YES twice, then holds NO (straight to NO with `fast=1`).
- **choice:** STORAGE FULL with every line from the spec, with "Keep the memories" under YES and "Clear the memories" under NO.
  - Under it, Rue's painted hands rest on the Remote: Luka's grazed hand, the receiver taped to the chip, the brick phone, the soggy present.
  - Both buttons work the same way, with no timer.
  - Letting go early empties the ring. A quiet "Hold to confirm" appears only after that has happened once.
  - Autoplay picks `TEST.ending`, else A.

None of the four can fail, so none ever calls `api.fail()`. A skip is still handled: the state is applied as if the game had finished.

**Things that differ from what you might expect**
- **The 3.6 pop-up is painted on screen, not only on the glass.** It sits over the glass's position on screen and is kept at a readable size. The game also keeps hq_top's `glass_ui` in step: pop-up mode, cursor and the NO ring.
- **The Choice paints the hands and Remote itself.** Pass `hands: false` if the 3D `s37_hands` shot already shows them. It also clears any open pop-ups at start, so content's STORAGE FULL makes way.
- **"Press instead" works as a toggle.** One press starts the 3-second fill and a second press stops it. In the Choice, pressing the other button switches. I didn't use the engine's 5-second latch here, so the player can cancel.
- **Small extras on screen.** hold_no shows a "LUKA (2040)" tag for 4 seconds. The card game shows a one-line title, "Find a reason the computer likes" (the spec's phrase). Each game also has a `debug()` method for tests.
- **Prop names are from the docs.** The bridge, hq_top and hq_roof props and anchors are taken from `docs/sets/*`, since those sets aren't built. Every call is guarded, so a missing prop does nothing.

**Missing sounds and the stand-ins I used:**
- Marker squeak: `creak` (rate 2.6, quiet).
- Card slide: `whoosh`.
- Card going into the reader: `clunk`.
- Reason accepted: `chime_ready`.
- Teddy's NO button: `clunk`.

I found no engine bugs that blocked anything.
