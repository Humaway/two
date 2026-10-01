// ============================================================ DEV: the engine test scene (integration; keep this file)
// ?autoplay=1&scene=DEV&stop=DEV runs every TWO engine feature in sequence on the store set, each with an autoplay
// path: time card, the shot vocabulary (ORBIT speeding up, CRANE down, TOP-DOWN, WHIP, CRASH ZOOM, roll 180, an eased
// override), a live split screen, say with tags, a bark, the Manager -> Luka (2040) name glitch, SafeSense (emptySlot)
// and JARVIS pop-ups, the HUD (NO SERVICE, QUIET IN, Samples, bars filling, HACK %), a three-way SWAP with followers,
// a sample take, Chip View (AR labels, Signal), drones (patrol, lure with the cone collapsing to a disc, a moving
// collider blinding a cone, capture -> Safe Room -> retry), a strength hold, slow motion, "two" muffled (first verse),
// the laugh and the voicemail. ?autoplay=1&scene=DEV_LINEUP&stop=DEV_LINEUP lines up every LOOKS entry for a screenshot.
// Neither scene is in SCENE_ORDER (Chapter Select never lists them).
(() => {
  const SET = SETS.reddy26 ? 'reddy26' : 'reddy';
  const RIGHT = ['reddy40', 'parade', 'valley', 'sandgate', 'flat', 'bridge'].find((k) => SETS[k]) || SET;
  const rightMark = () => { const m = SETS[RIGHT].marks; const k = m && Object.keys(m)[0]; return k ? m[k] : [0, 0, 0]; };
  const log = (m) => testLog('dev ' + m);
  const sk = (c) => c.flow.skipping;
  // a moving collider (a pushed bin): an extra box in the set's live colliders array, moved in place
  const BIN = [-1.4, -9.2, -0.6, -8.6];

  SCENES.DEV = {
    title: 'Engine test', set: SET, env: 'day',
    time: 'Tuesday 22 December 2026, 11:31', place: 'Optus Redcliffe',
    playable: ['luka', 'chase', 'chase40'], swap: false,
    hud: { noService: true, quiet: '46:58:00', samples: true, bars: 0 },
    spawn: { luka: 'floor_center', chase: [4.3, 0, -6.6, PI2(0.5)], chase40: [2.2, 0, -6.2, PI2(-0.6)], luka40: [-6.0, 0, -9.0, 1.2] },
    hotspots: [
      { id: 'dev_radio', at: [5.35, 0, -7.85], r: 1.4, sample: 'radio', text: 'The store radio.' },
      { id: 'dev_lift', at: [1.2, 0, -6.2], r: 1.4, verb: 'Lift', only: 'luka',
        do: async () => { const ok = await strengthHold({ who: 'luka', label: 'Lift', dur: 1.2 }); log('hold ' + ok); } },
    ],
    steps: [
      // ---- 1. cameras: the shot vocabulary
      ['cutscene', [
        { shot: 'WIDE', on: ['luka', 'chase', 'chase40'] }, { wait: 1.2 },
        { shot: 'ORBIT', on: 'chase', size: 'MID', from: 0, to: 70, dur: 2.5, ease: 'in', spin: true },   // the idea engine
        { say: 'chase', text: 'What if we just… ^ asked it nicely?', tag: 'quietly' },
        { wait: 1.2 },
        { shot: 'CRANE', on: 'luka', size: 'WIDE', dir: 'down', dur: 2.5 }, { wait: 2.5 },
        { shot: 'TOP-DOWN', on: 'luka', dist: 2.6 }, { wait: 1.2 },
        { shot: 'WHIP', on: 'chase40', size: 'MID' }, { wait: 0.8 },
        { shot: 'CRASH ZOOM', on: 'luka' }, { wait: 1 },
        { shot: 'LOW', on: 'chase', from: 'luka', roll: 180 },                     // Luka's view, upside down
        { say: 'luka', text: 'Why is the ceiling on the floor?', tag: 'off' },
        { shot: 'OTS', on: 'chase40', over: 'luka' },
        { slowmo: 0.3, dur: 1.2 },                                                 // slow motion (1.2 step 17)
        { wait: 0.6 },
        // split screen: two live halves, each with its own moving shot
        { spawn: 'jordan40', at: rightMark(), set: RIGHT },
        { split: { left: { shot: { shot: 'PUSH', on: 'luka', size: 'CLOSE', dur: 2.5 } }, right: { set: RIGHT, shot: { shot: 'ORBIT', on: 'jordan40', size: 'MID', to: 40, dur: 2.5 } } }, slide: true },
        { wait: 2.4 },
        { shot: 'CLOSE', on: 'jordan40', half: 'right' }, { wait: 0.8 },
        { split: null, slide: true, keep: 'left' }, { wait: 0.8 },
        { despawn: 'jordan40' },
      ]],
      // ---- 2. dialogue: tags, a bark, the name glitch, both pop-up styles
      ['cutscene', [
        { shot: 'TWO', on: ['luka', 'chase40'] },
        { say: 'chase40', text: "Don't move. ^ They can hear you think.", tag: 'whisper' },
        { say: 'manager', text: 'Are you sure?', tag: 'filtered' },
        { bark: 'drone', text: 'For your safety!', wait: 1 },
        { shot: 'CLOSE', on: 'luka40' },
        { nameGlitch: ['manager', 'luka40'] },
        { say: 'luka40', text: 'I was always sure.' },
        { popup: { style: 'safesense', title: 'SafeSense', msg: 'This message may upset the recipient. Send anyway?', buttons: ['YES'], emptySlot: true, at: 'center', w: 380 }, wait: true },
        { popup: { msg: 'JARVIS has updated your preferences.', buttons: ['OK'], icon: 'info' }, wait: true },
        // HUD: NO SERVICE, QUIET IN, Samples, the bars filling, the HACK bar
        { do: (c) => { c.hud.set({ noService: true, quiet: '46:58:00', samples: true, bars: 0 }); c.hud.hack(12); } },
        { hud: { bars: 4 }, anim: 2 }, { wait: 0.8 },
        { quiet: '46:57:59' },
        { do: (c) => { c.hud.hack(64, { back: true }); } }, { wait: 0.8 },
        { do: (c) => { c.hud.hack(null); log('hud bars ' + c.state.bars + ' quiet ' + c.state.quiet); } },
      ]],
      // ---- 3. three-way SWAP with followers, a sample take
      ['control', 'luka'], ['swap', true], ['follow', true],
      ['roam', { until: 'dev_swapped', auto: async (c) => {
        const order = [];
        for (let i = 0; i < 3; i++) {
          const nx = c.flow.swapNext(); order.push(nx);
          if (nx === 'chase') await c.hotspots.trigger('dev_radio');   // Chase's phone records the store radio
          await c.wait(0.4);
        }
        log('swap ' + order.join(' ') + ' followers ' + player.followers.map((a) => a.id).join(','));
        if (!c.state.samples.includes('radio')) console.error('TWO dev: sample not recorded');
        c.state.flags.dev_swapped = true;
      } }],
      // ---- 4. Chip View: AR labels + Signal
      ['control', 'chase40'],
      ['roam', { until: 'dev_chip', auto: async (c) => {
        AR.add({ id: 'dev_sign', kind: 'sign', text: 'OPTUS · 2040', at: [-2.0, 2.4, -14.2] });
        AR.add({ id: 'dev_price', kind: 'price', text: '$0.00 · FREE WITH CLOUD+', at: [-2.0, 1.6, -13.8] });
        AR.add({ id: 'dev_name', kind: 'name', text: 'LUKA · 39 · CUSTOMER', on: 'luka' });
        AR.add({ id: 'dev_code', kind: 'code', text: '1158', at: [-4.4, 1.6, -0.6] });
        AR.add({ id: 'dev_thought', kind: 'thought', text: 'he looks tired', on: 'chase', oy: 0.5 });
        AR.add({ id: 'dev_path', kind: 'path', points: [[-2, -4], [-2, -12], [1.5, -12]], loop: false });
        c.cam.shot({ shot: 'WIDE', on: ['chase40', 'luka', 'chase'] }); c.cam.cutscene = false;
        await chip.peek(2.2);
        log('signal ' + chip.signal.toFixed(2));
        if (!(chip.signal > 0.2)) console.error('TWO dev: signal did not fill');
        AR.clear(); await c.cam.release(0);
        c.state.flags.dev_chip = true;
      } }],
      // ---- 5. drones: patrol, a lure (cone collapses to a disc), a moving collider blinding a cone, capture -> Safe Room -> retry
      ['control', 'luka'],
      ['roam', { until: 'dev_drones', auto: async (c) => {
        const W = c.world;
        DRONES.spawn('dev_a', { path: [[-2.5, -5], [-2.5, -12], [0.8, -12], [0.8, -5]], speed: 1.4 });
        DRONES.spawn('dev_b', { at: [-1.0, 0, -11.0], face: [-1.0, 0, -5.0], cone: { len: 4.5, half: 0.35 } });
        c.cam.shot({ shot: 'CAM', pos: [4.6, 3.0, -1.4], look: [-1.0, 0, -8.6], fov: 58 }); c.cam.cutscene = false;   // high in the store's corner, under the ceiling (3.2 m)
        await c.wait(1.5);
        // a moving collider: a bin pushed across dev_b's cone blinds it (sets write their colliders in place)
        const cl = W.colliders, n0 = cl.length;
        cl.push(BIN);
        for (let k = 0; k <= 10; k++) { BIN[0] = -3.2 + k * 0.18; BIN[2] = BIN[0] + 0.8; await c.wait(0.08); }
        const b = DRONES.get('dev_b');
        log('cone blinded ' + (b.rays[8] < 3).toString() + ' (' + b.rays[8].toFixed(2) + ' m)');
        cl.length = n0;
        // the lure: the laugh on the floor; the investigating drone's cone collapses to a disc
        const lure = DRONES.lure([-0.8, 0, -7.5], 'laugh', { over: true, hover: 2.0 });
        await c.wait(2.5);
        log('lured ' + lure.n + ' disc ' + (DRONES.get('dev_a').half > 3 ? 'yes' : 'no'));
        // the noise drone's claw
        const nz = DRONES.spawn('dev_noise', { at: [2.5, 0, -11.5], kind: 'noise', cone: { len: 3.4, half: 0.6 } });
        DRONES.claw('dev_noise', 1); await c.wait(0.5); DRONES.claw('dev_noise', 0);
        log('noise claw ' + (nz && nz.obj.userData.setClaw ? 'yes' : 'no'));
        // capture: stealth with autoCapture, Luka walks into dev_b's cone
        stealth.begin({ autoCapture: true });
        W.actor('luka').place([-1.0, 0, -8.6, PI2(1)]);
        await waitUntil(() => stealth.captures > 0 || c.flow.skipping);
        await waitUntil(() => !stealth.busy || c.flow.skipping);
        log('captures ' + stealth.captures);
        stealth.end(); DRONES.clear(); await c.cam.release(0);
        c.state.flags.dev_drones = true;
      } }],
      // ---- 6. a strength hold (the roller door)
      ['roam', { until: 'dev_lifted', auto: async (c) => {
        player.actor.place([1.2, 0, -5.2, PI2(1)]);
        await c.hotspots.trigger('dev_lift');
        c.state.flags.dev_lifted = true;
      } }],
      ['swap', false], ['follow', null],
      // ---- 7. audio: every set bed and room (docs/sets ambience), "two" muffled (first verse), the laugh, the voicemail
      ['do', async (c) => {
        const A = c.AUDIO;
        if (!A || !A.loopNames) return;
        const names = A.loopNames(), hs = names.map((n) => A.loop(n, { vol: 0.02, fade: 0.05 }));
        for (const r of A.rooms) A.setRoom(r);
        A.setRoom('room');
        const t0 = clock.t;
        await waitUntil(() => names.every(A.loopReady) || clock.t - t0 > 20 || c.flow.skipping);
        const notReady = names.filter((n) => !A.loopReady(n));
        if (notReady.length && !c.flow.skipping) console.error('TWO dev: beds not baked: ' + notReady.join(', '));
        hs.forEach((h) => h.stop(0.05));
        log('beds ' + names.length + ' rooms ' + A.rooms.length + ' failed ' + A.stats.failed.length);
        if (A.stats.failed.length) console.error('TWO dev: audio bakes failed: ' + A.stats.failed.join(', '));
      }],
      ['cutscene', [
        { shot: 'MID', on: 'chase' },
        { do: (c) => { if (sk(c) || !c.AUDIO) return; const h = c.AUDIO.song({ pattern: null, from: 'VERSE', to: 'VERSE', muffled: true }); log('song ' + h.duration.toFixed(1) + ' s'); c.flow.devSong = h; } },
        { wait: 3 },
        { do: (c) => { if (c.flow.devSong) { c.flow.devSong.stop(0.5); c.flow.devSong = null; } } },
        { do: (c) => { if (!sk(c) && c.AUDIO) log('laugh ' + c.AUDIO.laugh().toFixed(2) + ' s'); } },
        { act: [['luka', 'laugh_big', { dur: 2 }]] }, { wait: 2 },
        { do: (c) => { if (sk(c) || !c.AUDIO) return; const v = c.AUDIO.voicemail("Hi, you've reached Luka. ^ Leave a message."); log('voicemail ' + v.dur.toFixed(1) + ' s'); } },
        { say: 'voicemail', text: "Hi, you've reached Luka. ^ Leave a message." },
        { fade: 'out', dur: 0.6 },
      ]],
    ],
  };

  // ---- every LOOKS entry in a row, labelled (screenshot: run without fast=1)
  SCENES.DEV_LINEUP = {
    title: 'Lineup', set: SET, env: 'day', timeCard: false, hud: null,
    steps: [
      ['do', async (c) => {
        const ids = Object.keys(LOOKS).filter((k) => LOOKS[k]), per = 12;
        const rows = Math.ceil(ids.length / per);
        log('lineup ' + ids.length);
        for (let r = 0; r < rows; r++) {
          c.world.actors.forEach((a, id) => { if (id.startsWith('lu_')) c.world.despawn(id); });
          AR.clear(); AR.show(true);
          const row = ids.slice(r * per, r * per + per);
          row.forEach((id, i) => {
            const x = -2.0 + (i - (row.length - 1) / 2) * 0.95;
            c.world.spawn('lu_' + id, [x, 0, 11.5, 0], { look: id });
            AR.add({ id: 'lu_' + id, kind: 'name', text: id, on: 'lu_' + id, size: 0.8 });
          });
          c.cam.shot({ shot: 'CAM', pos: [-2.0, 1.35, 19.6], look: [-2.0, 0.95, 11.5], fov: 42 });
          c.ui.letterbox(false);
          await c.wait(2.5);
        }
        AR.show(null); AR.clear();
        await c.cam.release(0);
      }],
    ],
  };
  function PI2(k) { return Math.PI * k; }
})();
