# Set reports: valley, sandgate (first run)

## valley
SET valley: REPORT

File: /home/user/two/src/18-set-valley.js. It registers `SETS.valley`. Commits are bb4497b (shared builders, committed early), 2655f14 (street, interior and dress states) and c4dc6c8 (fixes from the walk test). I committed only this file and did not push. The throwaway src/89-content-dev-set-valley.js is deleted. The header comment documents the layout, the shared-builder contract and every name below.

VERIFICATION
- Build: `node tools/build.mjs --out out/set-valley.html --mine src/18-set-valley.js` builds cleanly. Note that `--mine` takes a comma-separated list.
- setshots: all 9 env presets, 68 views each, in out/shots-valley-final/<env>/. No console errors, and no view is over 300 draw calls.
- Walk test (run.mjs, out/walk-valley, out/walk-valley3):
  - Collider, zone and camera-cut checks pass on the mall, transit, interior and sneak routes.
  - Inserts with the cast on their marks look good.
  - Fixed after the test: the mall walkers had colliders on the same lane as the cast's route and stalled the cast's moveTo. They now step aside for any actor within 1.7 m and stop only when someone is right in front of them.
  - There is no pathfinding inside the Starlight, so I added the interior paths to_desk, to_posters and to_stage. All three pass.

DRAW CALLS (max per env / view): overall max is 139.
- quiet: 139 (s210_locked)
- lit: 136 (s210_locked)
- lit_dry: 135 (s210_locked)
- three_am: 77 (cam mall_south)
- dawn: 77 (cam mall_south)
- lights_out: 75 (cam mall_south)
- annst: 75 (cam mall_south)
- gig: 73 (cam mall_south)
- starlight: 70 (cam mall_south)
- Typical: interior views about 55–76; street cams 81–137 in quiet; shared builders seen from the HQ viewpoints about 18–22.

NAMES
- **SET API:**
  - env, build, marks, anchors, cams, zones, colliders (a live array), floor, props, ambience, update, dress(state), lamp(name), neon(k, dur), state (getter).
  - Shared: VG, tower(o), skyline(o), countdown({key,label}), creaks, paths, ar.
- **ENV presets** (first is the default):
  - quiet (2.8 street), starlight (2.8 inside), lights_out (2.9 inside), annst (2.9 at the door).
  - three_am and dawn (2.10), lit (3.6, rain), lit_dry and gig (credits).
- **DRESS states:**
  - quiet28, transit28, dusty28, night29, three210, lit36, credits_neon, gig.
  - Picked automatically by scene: 2.8 gives quiet28, 2.9 night29, 2.10 three210. With no scene (setview), the env picks the state.
- **LAMPS** (the single spot): bench, torch, neon, door, slate, gig, off. The env also picks one automatically.
- **MARKS:**
  - 2.8: s28_enter_luka/_chase/_c40, s28_hear_luka/_chase, s28_c40_stop, s28_mia, s28_plan_chase/_c40/_luka, s28_cp, s28_c40_read, s28_drop, s28_pick, s28_climb_0/_1/_2, s28_uke_back, s28_uke_sample, s28_leave_luka/_chase/_c40.
  - Whisperers: whisper_bench_a/_b, whisper_queue_a/_b.
  - Transit: s28_t_head, s28_t_gate_luka/_chase/_c40, s28_t_cross, s28_door_out(_chase/_c40), s28_in(_chase/_c40).
  - Starlight: sl_posters, sl_desk, sl_stage_look, sl_kettle, sl_couch.
  - 2.9: s29_chase, s29_luka, s29_c40, s29_luka_reach, s29_bar, s29_note_drop, s29_door_in, s29_doorway, s29_luka_turn, s29_chase_wing, s29_chase_close, s29_c40_eyes.
  - 2.10: s210_c40_desk, s210_chase_amp, s210_luka_sleep.
  - Credits and 3.6: cr_mia_stage, s36_passerby, s36_phone, s36_laugh_1…4.
  - kettle, kettle_sl.
  - Lying marks: ry 0 puts the head toward −Z.
- **ANCHORS:**
  - 2.8: s28_crane_a/_b/_c, s28_track_a/_b, s28_mia_mid, s28_c40_close, s28_confiscate, s28_safebox, s28_db_meter, s28_box_code, s28_box_keypad, s28_plan_mid, s28_c40_watch, s28_cafe_table, s28_climb, s28_qr, s28_leave.
  - Street: napclub, lanterns, tower_countdown, tower_from_mall, s28_gate_track_a/_b, s28_stage_door_ext, urn.
  - Starlight: sl_wide_dusty, sl_posters, sl_poster_hero, sl_desk, sl_stage, sl_kettle.
  - 2.9: s29_floor, s29_floor_end, s29_c40_dark, s29_coaster, s29_window, s29_door_out, s29_reverse, s29_luka_close, s29_hands, s29_door_wide.
  - 2.10: s210_wide_stage, s210_desk_two, s210_slate, s210_chase_close, s210_c40_close, s210_locked, sl_clock.
  - 3.6 and credits: s36_passerby_pov, s36_mall_above, s36_lanterns, cr_valley_neon, cr_starlight_gig.
- **CAMS** (first is the default):
  - Street: mall_head, mall_puzzle (fixed), mall_south (pan), ct_gate, starlight_front, tower_front.
  - Interior, high: sl_hi_front, sl_hi_back, sl_stage, sl_wing, sl_green.
  - Interior, low (night29): sl_lo_front, sl_lo_bar, sl_lo_wing.
- **ZONES** (15; the first match wins):
  - 0 wing (sl_wing), 1 green room (sl_green), 2 stage (sl_stage), 3 floor stage half (sl_hi_front), 4 floor bar half (sl_hi_back). Dress swaps zones 0–4 to the low cams in night29.
  - 5 mall head and 8 S footpath east (mall_head); 6 puzzle (mall_puzzle); 7 mall south (mall_south); 9 S footpath west and 10 Chinatown pocket (ct_gate); 11 zebra W and 12 N footpath W (starlight_front); 13 zebra E and 14 N footpath E (tower_front).
  - The road itself has no zone; kerb colliders keep the player off it.
- **PROPS and userData APIs:**
  - Puzzle props:
    - pole_mia {meter(db|null), wobble(a)}
    - safebox_mia {door(u), content('uke'|null), led('red'|'green'), press(key)}; safebox_b/_c
    - uke_prop {follow(obj, off), place('safebox'|[x,y,z]), hide()}
    - phone_drop {show, pulse(on, k)}
    - cafe; urn {steam()}
  - Street life:
    - shush_drones {on}
    - whisperers {on, mode('quiet'|'lit'|''), rigs}
    - crowd_far {mode('quiet'|'look_up')}
    - neon_mall, neon_annst, napclub_sign
    - blade_starlight {lit}; karaoke_neon; reflections
    - lanterns {swing(on, amp?)}
    - gate, lions, gust, bollards, lamps, trees_mall
    - traffic {count(n), stop(b)}
  - Tower and sky:
    - tower; skyline; sky_flash {rate, flash}; rain {at(x, z)}
    - facade_countdown, yes_sign, tower_drones, lobby_card
  - Stage door and window:
    - stage_door {open(u)}; door_bulkhead {on}
    - window_light {light(hex, k)}; window_glass
  - Interior:
    - coats_sleep {show(mask: 1 Chase, 2 Luka, 4 Chase (2040)), lift(i, u)}
    - coaster {write(), place('bar'|'chest_chase'|[x,y,z])}
    - creak_boards {show}
    - foh_desk {state('dead'|'half'|'live'), level(k)}; desk_cables
    - slate_desk {screen('off'|'seq'|'export'|'saved'), slide(u), scr}
    - headphones_desk {show}; amp_seat
    - mirror_ball {sparkle(k)}; truss_pars {on}; crowd_gig {on}
    - exit_signs {on}; bulkheads {on}
    - wall_clock_sl {set(h, m)}
    - posters, green_room {kettle_steam()}, kettle_sl
  - Dress only: region_m, m_ann, m_mall, m_ct, region_s, region_f.
  - Everything is built at build() and hidden until needed; nothing is created mid-game.
- **Shared builders:**
  - tower(o) returns Group 'tower' with userData {countdown, drones, lit(k), update(dt, t)}.
  - skyline(o) returns Group 'skyline' with userData {lit(k, dur), swing, rain, crowd, sky('storm'|'midday_storm'|'golden'|'clear_night'|'dawn'), flash, bridgeLights, level, update}.
  - countdown ctl: {set(h, m, s), run(rate), text(mode), zero(dur), update}.
- **PATHS:** d28_swoop, d28_high_a/_b, walk_mall, shush_loop, gust, traffic_east/_west, walk_starlight, sneak29, to_desk, to_posters, to_stage.
- **AMBIENCE** (03-audio loops; I mutate the AMBIENCE.loops array in place):
  - Street: crowd_whisper, thunder, hum, hover_traffic.
  - Inside: hum and muffled thunder, rain kind 'roof'.
  - night29: thunder, plus rain_street while the stage door is open.
  - lit: city, rain kind 'street'.
  - Room is 'room' inside, 'none' outside.

DEVIATIONS from docs/sets/valley.md, and why
- **Shared geography:**
  - The Yes letters sit at VG y 134.2–142.2 (hq_roof needed them higher).
  - VG.river is a polyline (half-width 55, about z 300 at x 0) instead of a straight band.
  - Bridge endpoints are a [100.5, 0, 371.7] and b [262.7, 0, 289.1], so the Story Bridge reads side-on from the tower.
  - CBD centre is [-240, 0, 228], r 62. The spec position was in the river.
- **Skyline() lots and skip ids:**
  - I added filler lots N2/SW0/SW2/S4b and per-lot facades.
  - I added skip ids CROWD/TRAFFIC/CITY/CBD/RIVER/BRIDGE.
  - The countdown generator is exposed as SETS.valley.countdown.
- **Lighting:**
  - Env hemi/dir are brighter than spec, and spot intensities are scaled for physical falloff (bench 14, torch 6, neon 30, door 8, slate 3.5, gig 30).
  - The env drives the spot colour and intensity, and lamp() sets its geometry.
  - transit28 and dusty28 countdowns read 15:48:00 and 15:38:00.
- **Walkers:** the walking lanes are split to z 13–21 and 38–55 to keep the puzzle corner clear. They now sidestep for actors.
- **Positions moved for composition or collisions:**
  - Gate lanterns hang at y 4.98 (5.4 put them in the beam).
  - mall_head cam pos is [-6.1, 5.6, 27.0].
  - s28_crane_b is at [-15, 0, 22] from [-15, 27, -3], fov 54.
  - cr_valley_neon is shot from [5.4, 3.7, 52.5].
  - tower_from_mall is shot from [4, 1.6, 47]. The spec's [1, 1.6, 48] was under the z 46 tree crown.
  - The east mall lamp moved from z 54 to 49.
  - s28_enter_c40 is at [-0.75, 0, 11.9].
- **Colliders:**
  - Café tables use [x±0.5, z±0.8].
  - Bar stools are 0.32 m square.
  - The wing zone extends to z -11.0, so s29_doorway is inside a zone.
- **Small changes:**
  - Kerb bollards: 90 instead of 92.
  - The shush rig is 3 instanced meshes.
  - I added light pools and PAR beams.
  - The tower roof slab top is at 130.92.
  - Rain is set through the ambience rain kind, and the interior uses room 'room' instead of 'hall'.
- **Camera limit:** s29_door_wide cannot show the lions; they are behind its lens.

KNOWN GAPS
- Coats without sleepers under them look like low tents.
- The interiors are intentionally dark in the moody presets (lights_out, three_am, dawn).
- The far crowd, lions, cars and whisperer bodies are simple low-poly.
- Interior moveTo needs PATHS; there is no pathfinding. A straight move through the FOH desk, a column or the stage-corner stacks stalls.
- Gameplay drones and the whisperers' dialogue belong to content.
- Some marks deliberately touch colliders because they are seated or climbing positions: s28_mia, s28_climb_1/_2, whisper_bench_a/_b, sl_couch, s210_chase_amp, and s29_doorway (only while the door is closed).

ENGINE REQUESTS (not changed, since I don't own those files)
- showE() should reset world.torchAuto = true when a set is shown. valley sets it false for the fixed lamps.
- Zone cam fields are changed by dress() for the high/low interior cams. This works because the engine reads zone.cam every tick; please keep that behaviour.

## sandgate
The sandgate set is built and committed as `3b2a2e4`. That commit contains only `/home/user/two/src/16-set-sandgate.js`; the throwaway dev scene is deleted.

**Testing:**
- **Isolated build:** builds cleanly.
- **Set shots:** taken in all three env presets with 0 errors, and I read every PNG.
- **Walk test:** done with real key presses, with Luka leading and Chase and Chase (2040) following. Every collider held: the kerb stops the player at z 9.0, the east plaza edge at x 15.7, and the fig bench, the gazebo service area and the closed lane-2 paddles all block. Once lane 2 is opened, the player walks through. Every zone cut to the right camera.
- **Dress and API tour:** I served ten customers through the queue API, watched the hat and bag swaps on the second visits, and stepped through the invite, gate and credits dress states. 0 errors.

**Draw calls:** the most in any set view is 74. In-game with actors and the five customers the most is 108, on `plaza_w` while the queue is live.

**Ambience:** the loop names in the spec don't exist in `src/03-audio.js`, so I used the nearest ones: `hover_traffic` + `city`, `hotplate` (positioned at the plate), `birds`, `wind`, `hum` and `thunder`. One-shots are `sizzle`, `tick`, `pop`, `clunk`, `door_slide`, `beep`, `steam`, `murmur` and `hover_by`, rate-limited.

| Kind | Names |
| --- | --- |
| Marks | All spec marks: `kettle`, `luke_hot`, `q_serve`, `q_1…q_5`, `q_exit`, `q_enter`, `s26_arrive_chase/luka/c40`, `s26_chase_march`, `s26_luka_back`, `s26_c40_back`, `s26_c40_aside`, `sz_luka`, `sz_luke`, `sz_luke_takeover`, `sz_luka_aside`, `sz_chase`, `sz_c40`, `s26_sample_sizzle`, `s26_luke_invite`, `s26_inv_chase/luka/c40`, `s26_go_1..3`, `s26_luke_watch`, `s27_gate_c40`, `s27_gate_chase`, `s27_gate_luka` |
| Anchors | All 14 spec anchors: `s26_luke_wide`, `s26_table_two`, `s26_luke_ots`, `s26_sign`, `s26_tin`, `sz_hot`, `sz_front`, `s26_snags_insert`, `s26_onions`, `s26_apron`, `s26_exit_wide`, `s27_gate_tap`, `s27_hall_wide`, `credits_sizzle` |
| Cams | `plaza_w` (default), `plaza_e`, `corner` (new), `entrance`, `hall`, `sz_hot`, `sz_front` |
| Zones | `hall`, `entrance`, `plaza_w`, `corner` (x 6..16, z −1..9.6), `plaza_e`, street (filmed by `plaza_w`) |
| Env presets | `arvo26` (default), `gust26`, `gates27`; each sets the spot (gazebo fill or gate pool), sun and wind |
| Dress states | `luke26`, `sizzle26` (live queue, tin open), `invite26` (two customers drift off), `gates27`, `credits`. Auto: 2.6 → `luke26`, 2.7 → `gates27`, C → `credits` |
| Ambience | By state: day / gusty / station hall (`room`) |

**Prop APIs (on `userData` unless noted):**
- `hotplate.sizzle(level)`
- `snags`: `set(i, state | 0..1, side?)` where side is `'up'` or `'down'`; `turn(i)`; `reset()`; `get(i)`
- `onions`: `stir()`, `cook(u)`
- `tongs_spare`: plain hold prop, no API
- `order_build`: `show({bread, snag, onions, sauce})`, `give()`
- `sauces.squeeze(kind)`
- `cash_tin.open(bool)`
- `fare_gates`: `open(lane, on)` and `reader(lane, 'idle' | 'tap3' | 'ok')`. Lanes are numbered 0–2 from west; lane 2 is the one with the live screen, on the cabinet at x 0.90.
- `train_standing.glow(on)`
- `far.storm`: `build(u, dur)`, `flicker(on)` (respects Reduce Flashing)
- Static props with no API: `urn`, `sizzle_table`, `sizzle_sign`, `gazebo`, `bunting`, `traffic`, `fig`

**Set-level APIs:**
- `SETS.sandgate.sizzle`: `snag`, `turn`, `reset`, `state`, `onions`, `stir`, `build`, `give`, `squeeze`, `tin`, `heat`
- `SETS.sandgate.queue`: `reset(n, live?)`, `front()`, `advance()`, `count`, `bubble(i, out)`, `look(i)`, `visits(i)`, `length()`, `live(on, target)`, `leave(i)`
- Also exported: `paths`, `storm`, `wind(level)`, `dress`, `hotspots` (positions), `ar` (label data)

The new `src/47-mg-sizzle.js` in the working tree already calls these (`front`, `advance`, `visits`, `bubble`, `live`, and `snag` with up/down sides), and they all exist.

**Deviations from `docs/sets/sandgate.md`, all for composition:**
- **`sz_hot` cam and anchor:** the spec lens sat directly behind Luka and Luke, so the plate was hidden by their backs. It now looks from the customer side across the plate at both cooks. The mini-game's own Luka lens is nearly the same.
- **`entrance`:** the spec position put the canopy column at (4, −6) dead centre. It is now a pan cam on the portal axis, at (0.6, 3.3, −3.6).
- **New `corner` cam and zone:** around the fig and the arrivals corner the player was 25 m from `plaza_e`.
- **`s26_exit_wide`:** now aims at (−3.4, 1.4, −8.0) with fov 50. The spec lens left Luke at the plate out of frame.
- **Hotplate wind guard:** on the +Z (customer) side, not −Z.
- **Customer paths:** `cust_out` and `cust_in` are extended off the plaza so customers don't pop in and out in view. While the queue is live, they vanish and reappear just outside the two mini-game shots, so five customers can keep the queue fed. A full loop takes about 20 s.
- **Reader screen:** painted at 128×64 rather than 64×32 so it reads in the INSERT.
- **Bin collider:** added; the spec list didn't have one.

**Engine requests (other people's files):**
- `30-world.js` `showE()` still doesn't reset `world.torchAuto`. My set adds one small global updater that gives it back as soon as another set is current.
- That same updater re-applies the next set's ambience. 2.7 shows this set with `world.show`, which sets no ambience, so without it the hall loops would carry on into the train.
- In `04-art.js`, `PROPS.hover_car` looks mis-built: the body is long along X but the lights, pads and bumpers are laid out along Z. I built my own traffic cars instead.

**Known gaps:**
- If content cuts to a plaza camera while the queue is live, customers will be seen vanishing and reappearing. Call `queue.live(false)` or dress `luke26` first.
- In the `invite26` exit, the `s26_exit_wide` lens only shows a thin band of storm above the station roof.
- Customers' chip lights read a bit like glowing eyes at a distance. That comes from the art looks.
- The `h26_sizzle` hotspot (r 0.8 at −6.4, −2.05) sits inside the gazebo service-area collider, so a free-roaming player can't reach it. It only works as an action inside the mini-game.

## hq_floors
(failed)

## train
(failed)

## hq_atrium
(failed)

## hq_top
(failed)

## hq_roof
(failed)
