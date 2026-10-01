# Set reports: reddy26, parade, flat (first run)

## reddy26
I've rebuilt Rue's store as `SETS.reddy26` and committed it as `1810af9` (only `src/10-set-reddy26.js`). It also provides `SETS.reddy26.make(era, ext)`, the shared shell `reddy40` is built from. All checks pass: no view goes over 300 draw calls, and nothing errors or compiles a shader mid-game.

**Verification**
- **Draw calls:** day setshots ran all 87 views, max 104 (cam `carpark`), 0 errors. Night ran all 87, max 103. Evening hit my 600 s timeout on its last view (86/87 done, none failed). The Christmas, wrecked, home, night and montage states, the blast and the 2040 shell peak at about 111.
- **Gameplay cams:** staff 64 · corridor 51 · office 41 · backroom 30 · backroom_rev 91 · entrance 51 · counter 85 · aisle 61 · accessories 56 · shopfront 34 · carpark 104.
- **Walk test:** zone cuts were correct everywhere. Every collider stopped Luka where it should: counter front, shopfront, roller door, backroom doorway, Hero Table, tree. Every dress state applied cleanly. `blast()` ended with the tree fallen and the wreck shown. Luka reads well in the fixed cams. I deleted the dev file afterwards.
- **Engine test scene:** the existing `DEV` scene ran on this set with 0 errors and 0 warnings.
- **2040 shell:** a throwaway `make('2040', …)` built correctly. It had no cars, Christmas or Hero Table, blank neighbour signs, the wreath on the Wall, four scorch marks, the roller door at 0.45 with light under it, and the plant in the backroom.

**Names**
- **Env presets:** `day` (default) · `evening` · `night`, with the spec's values. Panels, ceiling, fairy lights and the Yes sign brightness follow the env. The spot is off in day and evening, and on in night for `table_downlight`.
- **Ambience:** loops `aircon` and `fluoro`, room `room`.
- **Dress states:** `dress(state, opts)` takes `xmas · spotless · wrecked (opts.pc) · home · home_night · days_later · tinsel_down · wall_print · xmas27`. Opts are `{ pc, ladder, smoke, alarms, officeDoor, scorch, radio, tinsel, time }`.
  - Auto-dress on scene change: 1.1 xmas, 1.2 spotless, 1.3 wrecked, PC wrecked{pc}, A1/B1 home, A2 days_later. Anything else gets xmas.
  - Clocks take the time from `SCENES[id].time`, falling back to the state's time.
- **Marks:** all of Rue's kept marks plus every `s11_* s12_* s13_* pc_* a1_* b1_* a2_* b27_*` mark in §6. Rue-only marks are dropped.
- **Anchors:** all of Rue's kept anchors (`backroom_wide` unchanged, `wall_clock` updated) plus every §7 anchor.
- **Cams:** `staff, corridor, office, backroom, backroom_rev, entrance, counter, aisle, accessories, shopfront, carpark`.
- **Zones:** the 13 in §9, in the same order.

| Prop | `userData` API |
| --- | --- |
| `hero_table` | `set(st, {smudge1})` (`smudged·spotless·wrecked·new_wrapped·new·gone`), `glint()`, `handprint(on)`, `smudge1(on)`, `blast({instant})` |
| Hero Table children / wreck | `hero_phone_1..4`, `hero_smudge`, `hero_smudge1`, `hero_handprint`, `hero_wreck`, `blast_flash`, `glass_shards` (80 instanced), `hero_wrap`, `plastic_heap` |
| `hero_tethers` | `swing(amp)` (decays ×0.85/s), `alarm(on)` |
| `alarm_beacon` | `on(b)` |
| `tinsel_yes` | `set(hidden·half·hung·fallen)` |
| `xmas_tree` | `set(up·fallen·gone)`, `fall()` |
| `ladder` | `set(yes_wall·folded·carried·hidden)`, `wobble()` |
| `fairy_lights` | `power(k)` (160 instanced) |
| `door_l` / `door_sign` | `hold(true·false·null)` / `set(open)`, `flip()` |
| `store_radio` | `.playing` |
| `store_phone` / `wall_phone` | `ring(on)` |
| `monitor_screen` / `tv_screen` | `show(mode)` |
| `calendar` | `set(d, mon, wd, year)` |
| `clock_hands` | `set(h, m)` (shared with `clock_floor_hands`) |
| `office_door` | `.open` |
| `backroom_door` | `.open`, `request()` (9 s), `bang()` |
| `tube` | `.off`, `flicker(n)` |
| `scorch` | `count(n)` |
| `jbox_lid` | `.open` |
| `remote_plugged` | shown from flag `s13_wired` |
| `roller_door` | `set(gap)`, `slam()`, `.gap` (solid while gap < 1.2 m) |
| `smoke_floor` / `smoke_backroom` | `amount(k, dur)` |
| `yard_gate` | `set(shut·ajar·open)` |
| No API (visibility only) | `tinsel_static/strand/sign/floor/coil`, `snow_spray`, `aframe_sign`, `cash_tray`, `the_wall`, `print4`, `rue_mug`, `laptop`, `kettle`, `tether_loose`, `cust26_a/b` (ambient rigs), `pelicans`, `traffic`, `sun`, `sky_horizon` |

**Shell for `reddy40`**
- **Ext hooks:** `make('2040', ext)` takes `ext.paint(T, K)`, `ext.build(K)`, `ext.dress(state, K, opts)`, `ext.update(dt, ctx, K)` and `ext.autoDress`.
  - `ext.interior` sets per-env lighting.
  - `ext.env`, `marks`, `anchors`, `cams`, `props` and `ambience` are merged over the shell's.
  - `ext.zones` replaces the shell's list and is exported as the same array.
- **Static geometry:** `ext.build` runs while the shell's merged geometry is still open, so its plain geometry adds no draw calls.
- **2040 textures:** reddy40 has to paint its own 2040 textures through `ext.paint` (fascia, office door, noticeboard, targets, posters, SIM header).
- **Own sky dome:** if it adds its own dusk sky dome, it should hide mine (`K.R.sky`).

**Deviations from the spec**
- The ladder's "top" marks are at z −11.7, on its third tread, not −11.95, where Luka would float behind the step.
- The DO NOT PAINT sign sits at y 2.775 so the ceiling grid can't cut through it. It reads correctly from the door side; "up toward −Z" showed upside down and mirrored in its own anchor.
- `s12_midair` now looks from the staff side so the exploding table is behind Luka. The spec's lens couldn't see the table at all.
- `blast()` leaves the radio playing, because the script says it keeps playing; `wrecked` turns it off.
- I added a sky dome that blends the fog colour into the sky, because the 400 m ground plane left a hard horizon line in the high shots.
- The clear patch in the shopfront also leaves a gap in the navy strip across the glass, so the 1.1 shot through the window isn't cut.

**Known gaps**
- Tinsel is twisted boxes: it reads as tinsel at gameplay distance but looks like striped ribbon up close.
- A faint ceiling-grid line still shows through the DO NOT PAINT sign in its close-up.
- The 1.2 upside-down shot needs camera roll from the engine.
- If a set is rebuilt, content has to re-apply any montage dress state it set by hand; only the per-scene dress comes back automatically.
- In setview for this set only, `TWO_TEST.dress/call/shot/advance/resume` are available for inspection.
- I changed `set: 'reddy'` to `'reddy26'` in other people's uncommitted dev scenes (`89-content-dev-mg-polish`, `-stall`, `-wiring-hack`) and didn't commit them.

## reddy40
(failed)

## parade
The `parade` set is built and committed in two commits (`134b1ca`, `2206fda`). It's one file, `/home/user/two/src/12-set-parade.js` (1,805 lines), registering `SETS.parade`.

**Verification**
- **Renders:** I rendered all 68 views in all 8 env presets with `setshots`. Every run exited 0 with no console errors, and no view went over 300 draw calls. After the last few anchor and mural fixes I re-rendered only the views they touched; I did not repeat the full eight-preset run.
- **Walk test:** every collider and camera cut behaved as expected (shop line, barriers at x −44/42, beach limit, jetty and T-head rails, lane bollards, the 2.2 confinement, the Region W fences and bench).
- **Dress test:** each dress state ran in game, along with the hero car on `car18_ext`, the family exit, the plate/LED/keypad, the slate, the pelican landing, the storm and the bench glint.
- **Zebra test:** with Luka on zebra E, the +X car stopped at x 18.7 and the −X car at 29.3, and both moved off once he left.
- The throwaway dev scene is deleted, and only my file was committed.

**Draw calls:** the maximum is 120 (`carpark_fs`, in `wp_washed`). Region P cams use 44–119 and anchors up to 93 (`s22_luka_hiss`). Region W uses 22–31. These counts come from setview, so they don't include content actors; the set's own 6 strollers and 3 family rigs are included.

**Names**

| | |
|---|---|
| Marks | Everything in spec §5. Seat marks stay at y = 0, so the sit anim supplies the seat height. |
| Anchors | Everything in spec §6. |
| Cams → zones | `fp_far_west` `fp_west` `fp_mid` `fp_east` `chips` `carpark_fs` `jetty_plaza` `jetty_near` `jetty_end` `park_west` `park_east` `lane_mouth` `lane_end` `wp_canon` `wp_bench_close` `wp_bench_front`. The 18 zones match §7 and are listed first-match-wins. |
| Env | `day` `golden` `dusk` `evening` `morning` `wp_morning` `wp_washed` `wp_sunset` (as §3.4). |
| Dress | `day17` `evening18` `lane22` `festival31` (P) and `bench23` `xmas40` `sunset33` `credits` (W). They switch automatically by scene id, or content calls `SETS.parade.dress(name)`. |
| Ambience | day17: cicadas, surf, hover_far · dusk/evening: surf, hover_far, crickets · lane22: cicadas, hover_far, room `lane` · bench23: wind, water_lap, bell_buoy · xmas40 and credits: birds, water_lap, wind_soft. `ambience` is a getter, so the flow always gets the current state's loops. |
| Extras | `W0`, `dress`, `region()`, `paths` (§12), `ar` (§12 plus the 12 shop labels), `lightsLevel()` |

**Props with APIs**
- **Hover-cars:** `hovercar_hero.drive(pathId, speed)` → Promise, `indicate(on)`, `stop()`; it is hidden when idle. `hovercar_parked.highlight(on)`, `traffic.count(n)`.
- **Bay and people:** `lifeguard_drone.talk(on)`, `family.exit()`, `strollers.on(bool)`, `pelican_hero.clack()` and `land(at, dur)` → Promise, `kiosk.chime()`.
- **Chip shop and flat:** `chip_shop_window.open(bool)`, `urn.steam()`, `flat_door.open(bool)`, `flat_window.lit(bool)`.
- **Lane:** `limiter_light.set('red'|'green')`, `limiter_plate.lift(u)` and `prop(bool)`, `keypad.press(d)`, `lane_bollards.up(bool)`.
- **Woody Point:** `bench.glint(u)` and `polished(bool)`, `storm_clouds.build(u)` and `flicker(on)`, `slate_speaker.screen('off'|'drafts'|'sent'|'play')`, `skateboard.ride(actorId|null)`.
- **No API:** every other §4 prop exists under its spec name, for example `poster_2031`, `window_figures`, `awning_tinsel`, `bell_buoy`, `puddles` and `frangipani`. The far groups use `_p`/`_w` suffixes.

**Deviations from the spec**
1. **Limiter box:** the "MAX 40 dB" label is on the left half and the keypad on the right half, under a brass plate hinged at the top edge. A full-face plate would have hidden the label. `s22_keypad` now aims at (8.39, 0.86, −19.12).
2. **Lane bollards:** they stand across the exit pocket's mouth (x 11.4, collider [11.2, −35, 11.6, −31]). The spec's row at z −33 didn't block anything.
3. **Wrapped tree:** moved from (4, 13.5) to (8.4, 13.2), with its collider, `tree_look`, the `tree` anchor and `s17_patrol_park` moved too. In its old spot it blocked the view from the lane to the bridge. `s22_lane_bay` now sits on the lane's centre line.
4. **Layout nudges to clear cameras:** promenade lamps moved from x 0/24/40 to −4.6/21/44, and the palm at x 12 to 9.6. `carpark_fs` moved to (−46.5, 5, 11.4) because the spec's position was behind the stage. I re-aimed `s17_plaque`, `s17_lifeguard`, `s17_car_turn`, `jetty_waves`, `s22_piano_cam`, `s22_exit`, `s23_seat`, `b2_slate` and `b1_2031_poster`. `ar_lane` and `ar_jetty` now sit on their physical panels.
5. **Jetty mouth:** a blank sign on a post instead of an arch, and 2 bollards instead of 4.
6. **Horizon:** the band is built as low vertex-coloured land shapes rather than painted textures, which reads sharper at 470 m. I added a fog-coloured haze ring and a soft sun glow so the sky meets the sea with no seam.
7. **Spot lamp:** chosen by preset (golden/dusk → chip-shop pool, evening → pendant, morning → lane sunbeam) rather than by preset plus dress state.
8. **Smaller simplifications:** clouds drift on a slow ±30 m sine instead of wrapping; the kiosk uses the shared kiosk prop's screen, with no drop logo or scrolling bubbles.

**Known gaps and notes for others**
- **Art bug (`04-art.js` owner):** `PROPS.hover_car` builds its body long along X but puts its lights and bumpers on ±Z. I built the hero, parked and traffic cars in the set instead.
- **Traffic pop-in:** cars wrap at x ±100, so one can appear or vanish at the far end of a long view.
- **Rough models:** the bronze figures are deliberately generic and blocky. The pelicans are simple, and the folded wings only approximate.
- **No engine changes needed:** the spot is restored when the set is left, because the engine now resets `torchAuto` on every set shown.

## foreshore26
(failed)

## flat
`SETS.flat` is built and committed as `src/13-set-flat.js` (commit `83dbd5c`, nothing else committed, not pushed). The busiest view is 73 draw calls, against the 300 limit.

**Testing:**
- **Set shots:** all 27 views (4 cams, 23 anchors) were shot in each of the three env presets with no console errors. After that I changed one anchor (`s18_room_wide`) and two cosmetic details; that build was re-shot only for three views.
- **Prop states:** a second script set each prop state (sheet lifted, card out/straight, doors open, slate screens, plan notes 1–3, box out/open) and shot it.
- **Walk test:** every main route was walked under `run.mjs`. The player was stopped exactly where the colliders should stop him (between the table and the bench, the shut entry door, the stair void, the bedside table), and every zone switched to its camera.
- **Prop test:** a second dev scene placed Luka, Chase and Chase (2040) and ran every prop API, held props, and all three dress states. Both dev scenes were deleted afterwards.

**Names**

| | |
|---|---|
| Env presets | `evening` (default), `dawn`, `morning` |
| Dress states | `evening18`, `dawn21`, `morning21`. Set automatically by scene (1.8 → `evening18`, 2.1 → `dawn21`); content calls `SETS.flat.dress('morning21')`, or setting env `morning` during 2.1 also switches it. Outside 1.8/2.1 the dress follows the env. |
| Marks | all names in spec §5, plus `kettle`, `centre` |
| Anchors | all 23 in spec §6 |
| Cams | `living` (first, the default), `kitchen`, `balcony`, `bedroom` — all pan cams |
| Zones | spec §7, unchanged (landing top uses the kitchen cam) |
| Ambience | `evening18`: fridge + parade_far · `dawn21`: birds_dawn + bay_far + soft snore · `morning21`: birds_dawn + bay_far + fridge · room `room` |
| Entry extras | `dress(state)`, `snore(on)`, `floor(x, z)` (the stair), `lightsLevel()` |

**Prop APIs** (all on `userData`; instant while skipping):
- `fridge_card.state('under' | 'out' | 'back')` — crooked / hidden / perfectly straight. `'out'` also shows `order_card` (the opened card) for `hold('luka', 'order_card')`.
- `keyboard_sheet.lift(bool)` — folds back in 0.4 s, showing the keys and the grey line.
- `slate_desk.screen('off' | 'folder' | 'list' | 'play')` — standby glow at dawn.
- `kettle.steam()`
- `balcony_door.open(0 | 0.5 | 1)` — the collider gap follows.
- `bedroom_door.open(0 | 0.45 | 1.4)`, `entry_door.open(bool)`
- `deco_box.state('under' | 'out' | 'open')`, with `santa_kit` inside.
- `teas.state('bench' | 'rail' | 'hidden')`, holding `tea_1` and `tea_2` (one per hand).
- `plan_notes.show(0..3)`, `pendant.on(bool)` (also drives the spot), `desk_lamp.on(bool)`
- `couch_blanket.state('folded' | 'spread')`, `snore_z.on(bool)` (also the snore loop)
- No API: `chips_parcel` (hidden; home is the bench spot), `tea_towel`, `toast`, `xmas_lights`, `curtain`, `pelican_magnet`, `sticky_wall`, `notebooks`, `photo_2031`, `plant_dying`, and the exterior groups `*_f` plus `sky_f` and `foam_f`.

**Deviations from `docs/sets/flat.md`:**
- **`s18_room_wide`** moved to from `[-2.9, 1.72, 0.4]`, at `[-1.39, 1.1, -2.76]`, fov 60. The spec's lens was behind the solid wall section and showed neither the sticky wall nor the fridge.
- **`s21_dawn_wide`** moved to from `[-0.6, 2.0, -3.38]`, at `[-2.4, 0.55, 0.9]`, fov 56. From the spec's position the couch was below the frame.
- **`s21_box`** moved to from `[-1.95, 1.4, -4.5]`. Luka kneeling at his mark stood between the lens and the box.
- **`s18_notebooks`** look point raised to y 1.24 so the row of spines is centred.
- **`living` cam** moved to `[2.0, 2.45, -0.12]`. The spec's position sat on top of the overhead cupboards with the pendant in the middle of the frame.
- **Evening light** raised (hemisphere 0.75 → 0.9, ground colour `0x3a3028`); the ceiling has a per-env bounce colour so it isn't black.
- **Two landing marks** stand on the stair treads (`s18_landing_luka` y −0.144, `s18_landing_chase` y −0.504) and `floor()` describes the stair.
- **Fridge door** is geometry plus painted decals and a 3-D pelican magnet, not one 128×256 texture; this reads much better at the 28° close-up. The 2031 photo is 128×96 instead of 64×48 for the same reason.
- **Light string over the window** droops in scallops (y 2.0–2.36) so it shows through the window from inside. The Parade's version is a straight line; the two sets are never on screen together.
- **Extra colliders**: a wall between the bedroom and the landing (otherwise the bedroom opens onto the landing), moving colliders for both hinged doors and the pulled-out box, and the laundry basket.
- **Not instanced**: balusters are merged into the static mesh, and the bridge piers are part of the bridge mesh, as in the Parade set.

**Known gaps:**
- The `lie` animation puts the hips near floor level, so content must place Chase at couch height for 2.1. Marks keep y = 0, as the spec asks.
- The headless renderer shows faint dotted diagonals across large walls seen edge-on. The Parade's shots show the same thing, so it isn't specific to this set.
- The readable close-ups (`sticky_wall`, `notebooks`, `order_of_service`, `slate_list`, `photo_2031`) are content's job. Their in-world layout to match: five hero notes left to right — pink "two — bridge??", mint "two — 2nd verse too long", blue "two — make it better", peach "two — NOT YET" (underlined), lemon "two — for L.".
- The hover-cars are mostly hidden by the balcony rail from inside.
- The park's wrapped tree and kiosk are simple stand-ins.

## rue_house
(failed)

## bridge
(failed)
