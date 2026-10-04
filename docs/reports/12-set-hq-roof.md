# Set report: hq_roof (resumed run, commit d4bb572)

Names in the header of src/22-set-hq-roof.js. Key points for 3.2-roof / 3.7 / A1 / B1 / C writers:
- Env: storm_roof, golden, afterglow, whiteout, credits_dusk. Dress: storm32, golden37, a1_after, credits (AUTO by scene: 3.2→storm32, 3.7/A1/B1→golden37, C→credits; applied on the first tick or content's first dress/lamp/prop call). Lamps: sleigh, ring, parapet, sitters, off.
- Cams: roof_wide (default), roof_car. New mark s32r_doorway (walk the car's back marks through it).
- Props: lift_doors open(u); maint_hatch open(u), dark; sleigh state('intact'|'collapsed'), drop(), wind(k); santa_hat/santa_beard/earbuds .visible; ring_light on/state/wobble; presents moveTo('table'|'sleigh'); ring (400 drones) level(k,dur), flicker(on), pulse(k), flare(k,dur), settle(); remote_rig screen('off'|'check'|'call'|'white'), trill(on); whiteout pour(dur=2), reset(); countdown_glow color/level; sun y(dy); steam level(k).
- Data: SETS.hq_roof.ring (centre, radii, counts, gap). Split: left half a1_split_roof, right half a1_split_store (reddy26).
- Gaps: a1_hands_slate needs Chase (2040) seated with the slate in his lap; s37_check is framed for Chase kneeling at the Remote (shoot it before the four gather).
