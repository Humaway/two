# Mini-game report: scooter (commit 6362ced)

Call: `['minigame', 'scooter', { onHalfway, drones, mount, dress, endLine, swerveSpeed, objective }]` — all optional.
- onHalfway: fn(api) → Promise awaited, or a cutscene id / step array (play the 2.5_laugh cutscene here; the game already cruises both scooters).
- drones: default d25_c1…d25_c6 (re-spawned in place with cone:false, ai:false so the game flies them; missing ones spawned).
- mount (true): luka driver + chase pillion on scooter_1, chase40 on scooter_2, scooter_drive/scooter_pillion poses.
- dress (true): dress('chase25', {keepEnv:true}); env chase25 over 20 s if unset.
- endLine (true): the DRONE's end line as a bark during the swerve; false = the scene says it; string replaces it.
- objective: default 'The slowest chase in history.'
Result: { done, hugs, dodges, asks, answered, doubles, missed, blocked, yields, whir, laugh:true, swerved:true, time, story }; skip snaps the end state (dress end25, riders mounted, drones at d25_edge_*). Always grants the laugh sample + flags s25_laugh, s25_chase.
Scene duties: bridge set current; luka (flags.santa), chase, chase40 spawned; six chaser drones spawned at the towers and tower_drones.release() called; music('scooter'); afterwards SETS.bridge.unmount() and re-set follow (the game sets flow.setFollow(null), player.enabled=false); end() clears cam.override.
Events: scooter:hug/dodge/ask/miss/swap/whir/halfway/resume/swerve/done. Lines inside: "Are you sure?", "Are you sure you're sure?", "Gotcha! ^ For your safety!", "After you!", the DRONE end line.
