# Mini-game report: boss (commit ef9442f)

Enter in 3.4: `['minigame', 'boss', {}]` on hq_top (env boss, dress s34 — the set auto-dresses s34 for 3.4). Expects luka at console_luka (plays `type`), chase at boss_chase, chase40 at boss_c40, luka40 at boss_l40 (spawned if missing). start() sets cam.override('fixed', …) and eases out of 3.3's last shot.
Params: from (default state.hack if valid), to 85, active ('chase'|'chase40'), rate 0.3 (×2 Story), back 0.5, stalls [[31,'backwards'],[52,'runaway'],[67,'sure']], lines:false mutes the 3.4 lines, music 'boss'|false, musicOut (true: fades at 85%), keepCam, clearDrones (default false: live drones hang frozen for 3.5), autoRate 4.
Result: { done, hack: 85, time, stalls, touches, wraps, downs, by:{tether,ping,coat,wall}, lures, swaps, fails, drones:[x,y,z,…] } — pass drones to galaxy.seed(drones, drones.length/3); MINIGAMES.boss.positions() gives the same. Skipped: { skipped, done, hack:85, drones }. End state: HUD HACK 85, QUIET IN 00:04:00, glass clock 11:54, Chase (2040)'s coat back on.
For 3.5: freeze from result.drones → galaxy.seed, hang(), DRONES.clear(); downed drones are already gone; music faded unless musicOut:false.
Events: boss:line(pct), boss:stall{pct,bug}, boss:stall_done, boss:touch, boss:wrap, boss:down{kind,by}, boss:done, swap.
