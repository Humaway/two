# Set breakdown reports

I wrote both set specs: `/home/user/two/docs/sets/reddy26.md` and `/home/user/two/docs/sets/reddy40.md`. I didn't commit them, and nothing in them has been built or checked in the engine yet.

**reddy26.md** (Optus Redcliffe, Christmas 2026)
- **Scenes:** maps every beat to an env preset (`day`, `evening`, `night`) and a dressing state. The states are `xmas`, `spotless`, `wrecked` (plus a PC variant), `home`, `home_night`, `days_later`, `tinsel_down`, `wall_print` and `xmas27`, set through `dress(state, opts)`. Scenes 1.1, 1.2, 1.3, PC, A1 and B1 get a default state automatically.
- **Layout:** metric plan with an ASCII drawing, compass directions and key coordinates. It also defines the shell shared with reddy40.
- **Changes from Rue's set:** an exact keep / remove / change / add list.
- **Hero Table:** centre (5.6, 0, −5.3), with smudged, spotless, wrecked, wrapped and new states. `blast()` covers the flash, glass shards, swinging tethers, the tree falling, tinsel dropping and smoke.
- **Other additions:**
  - Christmas dressing: the Santa hat on the Y of the sign, tinsel, fairy lights and fake snow on the windows.
  - The Wall, on the corridor's left wall.
  - The office door's fourth line, "ESPECIALLY YOU TWO".
  - Two ceiling scorch marks plus the DO NOT PAINT sign, with a third mark from the `home` state on.
  - A floor clock, the ladder, the laptop, the mug, and the backroom wall phone with its junction box.
- **The rest:** about 60 marks, 45 anchors (Rue's exact Act One backroom frame is kept), Rue's camera zones, hotspots, cutscene needs, `update()` animations and a performance budget of about 170 draw calls.

**reddy40.md** (the same store in 2040)
- **States:** `store40`, `arrival`, `address`, `lockdown`, `split13`, `title` and `b1_build`, with env presets `day`, `lockdown`, `dim` and `dusk`.
- **Backroom:** the machine sits against the front wall under the old wall phone, with Des on it. There are four scorch marks, the plant, a jammed roller door, and a half-built `b1_build` version for the B1 frame.
- **Back yard (playable in 1.6):** car park, drone tower with ground pings, the pole, a pushable skip bin, and the gate onto Redcliffe Parade with hover-cars and the bay beyond.
- **Title:** a 360° orbit anchor around the store at dusk, with a ring of 32 drones outside and lightning in the clouds.
- **1.6 stealth:** a separate set of 12 zones and fixed cameras chosen so the scan cones read clearly. It includes drone posts, paths and cones, the lure points, the zap and roller-door marks, the chip prompt, the pole, the gate, and four checkpoints.
- **The rest:** AR anchor points for Chip View, hotspots, cutscene needs, `update()` animations and a budget of about 190 draw calls.

**Decisions the builder and scene writers need to know**
- **Shared factory:** reddy40 is built through `SETS.reddy26.make('2040', EXT40)` so the two eras share one layout. If reddy26 fails to parse, reddy40 fails with it.
- **Through-glass shot:** part of the counter becomes a glass showcase, open at the back. This is so Luka's upside-down view from behind the counter in 1.2 can see the figure. That shot also needs a 180° camera roll, which may need an engine hook or a canvas flip.
- **Lure requirement for 1.6:** the counter speaker lure only works if any sample played through it uses a radius of at least 7 m and a duration of at least 9 s. Otherwise it won't pull all three drones. The scene writer has to apply this.
- **No Rue on screens:** the TV and the mug show only text; Rue's face never appears.

---

I wrote three set specs in `/home/user/two/docs/sets/`, one per set. I did not commit them, and other agents have since added `reddy26.md` and `reddy40.md` to the same folder.

**Decision you asked for:** Woody Point is not a far zone inside the Parade. It is a separate region of the `parade` set, placed 300 m to the side (`W0 = [-300, 0, 0]`) and reached only by a fade. `dress()` shows one region at a time, so only one ever draws. The two regions' colliders and camera zones are 300 m apart, so they can't clash.

- **`/home/user/two/docs/sets/parade.md`** (1.7, the 1.8 exterior shot, 2.2, 2.3, B2, plus optional B1 frames and credits shots):
  - **Parade region:** the shops and chip shop with the flat's door, road, promenade, park, Suttons Beach, the jetty, and Bee Gees Way with the piano, limiter, brass plate, statues and exit.
  - **Woody Point region:** the path, the memorial bench with its plaque, the railing, the bell buoy and the jetty.
  - **Behind both:** each region has its own horizon backdrop and its own Ted Smout Bridge. The bridge reads "far off to the right" from the flat's balcony, shows through the mouth of the lane, and sits dead ahead from the bench.
  - **Dressing:** eight named `dress()` states, chosen automatically by scene.
- **`/home/user/two/docs/sets/flat.md`** (1.8, 2.1): an 8 × 6.4 m flat with a balcony. Its coordinates are the parade's shifted by (32, 3.6, −7), so the balcony, kitchen window, table and Christmas lights line up with the exterior shot. It has three states (`evening18`, `dawn21`, `morning21`) and a view of the Parade below.
- **`/home/user/two/docs/sets/foreshore26.md`** (A2): the Woody Point region in 2026, rebuilt from the same layout numbers with no bench. Signs are readable, there are real cars on the bridge, and the 2.3 camera angle is the same one.

Each spec covers all 11 sections you listed.

**For the engine owner:**
- **Spotlight leak:** these sets use the scene's one spotlight as a fixed lamp. The engine moves that spotlight to the player's hand whenever `world.torchAuto` is true, so the sets switch it off while a lamp is lit. I asked for `showE()` to reset `torchAuto = true`, so the setting can't carry over into the next set.
- **Spot in every preset:** every lighting preset sets the spotlight explicitly, because a preset that leaves it out keeps the previous one.
- **Backdrop distance:** the camera's far plane is 600 m, so every backdrop is kept within about 520 m.

**For the audio owner:** the sound loop names in the specs (`cicadas`, `surf`, `bell_buoy`, `fridge`, a `lane` reverb and others) don't exist in the audio code yet.

---

I wrote four set specs, one per assigned set, in the same format as the existing `parade.md` and `reddy40.md`. Each covers all 11 requested sections, has a `dress(state)` table for the different dressings, and gives coordinates and IDs that set builders and scene writers can code against. I checked every quoted script line against `BUILD_PROMPT.md`, worked the camera sight lines through by hand and checked the bridge ones with a script. I didn't commit anything.

- **`/home/user/two/docs/sets/rue_house.md`** (2.4, plus an optional 2031 corkboard frame for the B1 montage)
  - Rue's house is the only set with no drones, no AR and no padded surfaces. Chase (2040) leans on the closed front gate, so you can see him through the louvres during `2.4_tea`. The verandah posts and armchairs are placed so the two sight lines from inside to the gate stay clear.
  - On the corkboard, Sundays from November 2026 to 17 December 2034 are ticked **LADS**. I left Sunday 24 December 2034 (the fire) blank; that's my choice, and the script doesn't say either way.
  - Dress states: `knock24`, `explore24`, `tea24`, `gate24`, `cork31`.

- **`/home/user/two/docs/sets/bridge.md`** (2.5, plus a credits frame)
  - **The deck is a fixed 720 m, not looping or streaming as the brief suggested.** At 25 km/h, 720 m covers the ~90 s of chase plus the laugh cutscene on autopilot. Instanced railings, lamps and piers keep the whole deck to about 10 draw calls, so streaming would add code for no gain.
  - The navigation hump peaks at z 400 and is the "halfway" landmark; the laugh fires at z 360. Its height matches the bridge seen from Woody Point and the flat.
  - Also specified: the checkpoint (three gates, Teddy's booth with the NO button and the reason-card panel, both drone towers, 12 queued hover-cars), a chase API (lanes, autopilot for cutscenes, end swerve, camera schedule), and the mangrove boardwalk.
  - A script check showed two of my first chase cameras (`ch_pier`, `ch_channel`) were blocked by the solid barrier. I replaced `ch_pier` with `ch_shoulder` and raised `ch_channel`, and wrote the sight-line rule into the doc.
  - Dress states: `checkpoint25`, `gate25`, `alarm25`, `chase25`, `end25`, `credits25` (all gates up: Teddy says yes to everyone).

- **`/home/user/two/docs/sets/sandgate.md`** (2.6, plus the first shot of 2.7)
  - The gazebo, hotplate and front table have state APIs for the sizzle mini-game, plus two fixed cameras.
  - Customers are five ambient figures owned by the set, which the mini-game drives through a queue API.
  - The fare-gate screen reads "3 FARES · Balance: $4" for the 2.7 boarding insert. That shot needs content to briefly switch to this set and needs `world.liveMax = 3`; the doc explains how.

- **`/home/user/two/docs/sets/train.md`** (2.7)
  - The carriage never moves: the suburbs, track and stations scroll past outside, so it costs no allocation and the cameras never leave the carriage.
  - The 64 seats are in eight named bays, the cameras are chained down the aisle, and lightning is reduced when Reduce Flashing is on.
  - I proposed a timed solve for the ticket inspection: the three must reach the last bay **and** block the drone with the reindeer before the next station. The content writer can change it.

---

I wrote production specs for both of my sets:

- `/home/user/two/docs/sets/valley.md` (about 1,100 lines). This covers 2.8, 2.9 and 2.10, the 3.6 street cutaway and two credits vignettes (the Valley in neon, and Mia's gig at the Starlight).
  - **Street:** Brunswick St Mall with the exact puzzle corner (Mia's bench, the 3 m pole with rungs and the Safe Box on top, the foam bollard Luka steps from, four café tables with table C as the phone-lure table), NAP CLUB, the Chinatown gate with 54 lanterns, and Ann Street.
  - **The Starlight:** full metric plan of the stage, wing and stage door, green room with kettle, bar, mixing desk, amp, poster wall and the high window.
  - **Per-scene setup:** eight dressing states via `dress(state)` and seven named positions for the single spot light via `lamp(name)`. The venue cameras switch between high angles (2.8, 2.10) and low angles (the 2.9 sneak).
  - **2.9 specifics:** the creaky-floorboard positions with a suggested "someone stirs" rule for the sneak, and a rain object that moves to wherever the shot is, so no rain ever falls inside the venue.
  - It also has every section you asked for: props, marks, anchors, zones and fixed cameras, drone posts, hotspots, cutscene needs, ambience, an allocation-free `update()`, and a budget of about 150 draw calls in the mall and about 90 inside.
- `/home/user/two/docs/sets/hq_atrium.md` (about 670 lines). This covers 3.1.
  - **Exterior:** the crane up the tower (canopy, about 30 storeys of curtain wall, the QUIET IN 01:58:00 facade countdown, the Yes sign, 12 circling drones).
  - **Atrium:** the 13 m bubble-wrapped tree, the MANDATORY FUN banner, cracker table with goggles, Secret Santa table with 20 identical parcels whose AR tags include five real recipients, the choir under the SafeSense meter, the lanyard desk, the far-wall countdown, the Quiet Corner, and the morning-tea urn as the save point.
  - **Gameplay:** the Fun Monitor drone's patrol loop and sweeping beam, Blend In action spots in every area, Secret Santa marks for all five deliveries, and Nadia's scene.
  - **Service lift:** a steel door behind the tree with a real lift car directly behind it. The lift panel reads G · 12 · 21 · 30.
  - Budget is about 95 draw calls.

**Decisions that other set owners need to know:**
- **Shared map:** both specs use one shared coordinate frame for the Valley (+X east, +Z south, Ann Street at z = 0). Optus Tower stands on the north side of Ann Street at the head of the mall, with its south glass looking straight down it. The Starlight is two lots west, and its stage door faces the Chinatown gate.
- **Shared builders:** `valley.md` §12 defines three functions in `18-set-valley.js`: `SETS.valley.VG` (the map data), `tower()` (the tower exterior with its facade countdown) and `skyline()` (the surrounding city, river and Story Bridge). `hq_atrium` uses them. `hq_top` and `hq_roof` should too, so the 3.6 "Valley lights up" view, the prologue view and the 3.2 roof countdown match what the player walked in 2.8. The contract for them is in valley.md §12.6.
- **3.6 cutaway:** I recommend playing steps 26–27 on the `valley` set itself. That means preloading it at the start of 3.3 with `world.liveMax = 3`.
- **Engine requests:**
  - Reset `world.torchAuto` to true whenever a set is shown (the same request `parade.md` makes).
  - Two drone behaviours for `33-systems.js`: the `noise` drone needs a claw, and a drone investigating a lure should collapse its cone to a small disc.

None of this is built or tested yet; it is spec only. I didn't commit anything.

---

I wrote four set specs to `docs/sets/`, one for each assigned set. Each follows the `hq_atrium.md` layout: decisions, scenes with env presets, a metric plan with ASCII map, look, props, marks, anchors, zones and fixed cams, hotspots, cutscene needs, ambience and `update()`, the draw-call budget, and the `dress()` API. I ran a script to check that floor-level marks sit inside a zone and outside every collider. It found one conflict, the roof's lift-car marks sat inside the headhouse collider, and I fixed it. Nothing is committed.

- **`/home/user/two/docs/sets/hq_top.md`** — the Manager's office, for P, the 2.5_manager cutaway (it wasn't in the brief, but the script needs it), and 3.3–3.6.
  - The room is 24 × 12 m in Valley Grid coordinates, shifted down 125.5 m so the floor is at y 0. The glass wall is the south side, with the desk and empty chair at the west end, the console with its USB-C port in the centre, and the roof hatch at the east end.
  - The pop-up and clock are painted on the glass itself, and the Hold NO mini-game drives that same canvas.
  - There are three drone groups: 14 outside the glass, 24 inside the room (the ring and the landing), and the boss mini-game's own drones, which come from four ceiling hatches and two window ports.
  - It also covers the foam vents, the camera rail for the boss fight, and a yellow glow rising up the glass at 11:58.
- **`/home/user/two/docs/sets/hq_roof.md`** — the roof, for 3.2 in the storm and for 3.7, A1, B1 and the credits at golden hour.
  - The lift arrives in a headhouse, and the maintenance hatch sits beside the cardboard sleigh near the south parapet.
  - The ring is exactly 400 drones in five rows around the Remote, with a gap facing the parapet.
  - There's a camera for the left half of the A1/B1 split screen, a white pour from the Remote, the parapet seats, and a drone's-eye angle that `reddy26` can paint the A2 rooftop photo from.
- **`/home/user/two/docs/sets/hq_floors.md`** — L12, L21 and L30 for 3.2.
  - The engine's zones and colliders ignore height, so stacked floors would clash. I laid the three floors side by side along X, offset by −48, 0 and +48, all at y 0.
  - L12 has a 12-unit sliding shelf bank, two shelf controls 22 m apart, the trampoline bin and the headphones wall.
  - L21 has the stair landing, a winding "old" cable trail, the 1987 jack, the tea point and kettle cord, two valves 27 m apart, and the hatch.
  - L30 has about 790 docked drones in instanced racks, five patrol drones including a long-sighted sentinel, a rack Luka pushes along a rail to blind it, three lure points, and the MANAGER ONLY lift with its ROOF ACCESS side panel.
  - This file also defines `makeMirror`, a low-res real reflection for the mirror floors, which `hq_top` reuses. It falls back to cheaper mirrored geometry on phones and during the boss fight.
- **`/home/user/two/docs/sets/safe_room.md`** — the fail-state room. It is built once and dropped into whatever set is current, far from the playable area, rather than loaded as a set, so a capture never forces a set reload.
  - It covers the timed sequence, under 6 s from capture to retry.
  - In 3.1 it defers to `hq_atrium`'s own Quiet Corner and only uses its own `quiet` dressing if that corner is missing.

Other owners need to act on these:
- **Valley set:** the Yes letters on the tower crown sit partly inside the plant box. They need lifting to VG y 134.2–142.2, or the sign moving to z −34.8.
- **Drone systems:** a drone's view cone must be blocked by moving colliders, or Luka's pushed rack won't blind the sentinel.
- **World engine:**
  - Reset `world.torchAuto` when a set is shown.
  - Expose the current env preset name as `world.envName`.
  - Add the eased override for the boss camera.
- **Shared geometry:** three cross-set shared positions are now fixed and must stay identical in every set that uses them: the private-lift shaft (VG x 12.4–15.0, z −22.0 to −19.4), the roof hatch at VG (8.0, −12.9), and the service-lift car, which matches `hq_atrium`'s.
