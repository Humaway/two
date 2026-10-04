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
        { do: (c) => { if (c.flow.result !== 0) console.error('TWO dev: popup result ' + c.flow.result + ' (skipped or played, it must be 0)'); } },
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
      ['control', 'chase40'],   // the party keeps its shape: Luka (who led) takes Chase (2040)'s place in the follow list
      ['do', () => { const f = player.followers.map((a) => a.id).join(','); log('control followers ' + f); if (player.followers.length !== 2) console.error('TWO dev: control dropped a follower: ' + f); }],
      ['roam', { until: 'dev_chip', auto: async (c) => {
        AR.add({ id: 'dev_sign', kind: 'sign', text: 'OPTUS · 2040', at: [-2.0, 2.4, -14.2], w: 2.4 });   // the sets' ar lists: w in metres
        AR.add({ id: 'dev_red', kind: 'sign', text: 'ALL CROSSINGS REQUIRE HUMAN CONFIRMATION', at: [0.8, 2.5, -1.2], w: 3, color: 0xff3a3a });
        AR.add({ id: 'dev_arc', kind: 'path', arc: { c: [3.0, -3.0], r: 2.2, a0: -2.4, a1: -0.6 } });
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
        // a goTo taken over half-way (release) still resolves
        const gp = DRONES.goTo('dev_noise', [2.5, 0, -9.5], { speed: 0.4 }); await c.wait(0.3); DRONES.release('dev_noise'); await gp;
        log('goTo released resolves');
        // capture: stealth with autoCapture, Luka walks into dev_b's cone
        stealth.begin({ autoCapture: true });
        W.actor('luka').place([-1.0, 0, -8.6, PI2(1)]);
        await waitUntil(() => stealth.captures > 0 || c.flow.skipping);
        await waitUntil(() => !stealth.busy || c.flow.skipping);
        log('captures ' + stealth.captures);
        stealth.end(); DRONES.clear(); await c.cam.release(0);
        // the Quiet Corner (3.1): drawn by systems, then the host set's own corner when it has the marks (hq_atrium)
        await safeRoom({ variant: 'quiet', who: 'luka' });
        const mk = W.set.marks;
        mk.quiet_beanbag = [-6.0, 0, -6.0, 0.6]; mk.quiet_drone = [-7.0, 2.1, -4.6, 2.5];
        await safeRoom({ variant: 'quiet', who: 'luka', onRetry: () => log('host corner retry') });
        delete mk.quiet_beanbag; delete mk.quiet_drone;
        c.state.flags.dev_drones = true;
      } }],
      // ---- 6. a strength hold (the roller door)
      ['roam', { until: 'dev_lifted', auto: async (c) => {
        player.actor.place([1.2, 0, -5.2, PI2(1)]);
        await c.hotspots.trigger('dev_lift');
        c.state.flags.dev_lifted = true;
      } }],
      // ---- 6b. an eased tracking override (the boss camera): mutate a 'fixed' override in place, damped; ease out
      ['roam', { until: 'dev_cam', auto: async (c) => {
        const o = { pos: [4.0, 2.7, -1.2], look: 'player', fov: 55, lag: 1.5, lookLag: 1, ease: 1 };
        c.cam.override('fixed', o);
        player.actor.moveTo([-1.0, 0, -9.5]);
        for (let k = 0; k < 30; k++) { o.pos[0] = 4.0 - k * 0.12; await c.wait(0.1); }   // the lens rides its rail, allocation-free
        c.cam.override(null, { ease: 0.8 }); await c.wait(1);
        log('override ' + c.cam.name);
        c.state.flags.dev_cam = true;
      } }],
      ['swap', false], ['follow', null],
      // ---- 6c. the maintenance pass (docs/REQUESTS.md Engine): every new path once, each with a check
      ['do', async (c) => {
        const W = c.world, L = W.actor('luka'), C = W.actor('chase'), F = W.actor('luka40'), V = new THREE.Vector3(), V2 = new THREE.Vector3();
        c.cam.shot({ shot: 'WIDE', on: ['luka', 'chase', 'luka40'] }); c.cam.cutscene = false;
        // eyePos right after place() + play(): the pose it will have (not last frame's)
        C.play('sit_floor_wall'); await c.wait(0.3);
        C.place([3.0, 0, -6.0, 0]); C.play('idle'); C.eyePos(V); await c.wait(0.4); C.eyePos(V2);
        log('eye after place ' + V.distanceTo(V2).toFixed(3) + ' m, seated ' + C.rig.seated);
        if (V.distanceTo(V2) > 0.06 || C.rig.seated) console.error('TWO dev: eyePos stale after place / idle kept the floor-sit');
        // a skipped walk stands a sitter up
        C.play('sit', { h: 0.45 }); flow.skipping = true; await C.moveTo([3.4, 0, -6.4]); flow.skipping = false;
        if (C.rig.seated || C.anim !== 'idle') console.error('TWO dev: a skipped walk left him seated (' + C.anim + ')');
        // { face, wait: true }
        await c.runSteps([{ face: 'chase', to: 'luka', dur: 0.6, wait: true }]);
        const want = Math.atan2(L.pos.x - C.pos.x, L.pos.z - C.pos.z), dy = Math.abs(Math.atan2(Math.sin(C.rotY - want), Math.cos(C.rotY - want)));
        log('face wait ' + dy.toFixed(3)); if (dy > 0.05) console.error('TWO dev: face wait returned before the turn');
        // an explicit expr beats the anim's own (same tick, either order)
        await c.runSteps([{ expr: [['luka40', 'tearful']] }, { act: [['luka40', 'still']] }]); await c.wait(0.2);
        log('expr pin ' + F.rig.face.expr); if (F.rig.face.expr !== 'tearful') console.error('TWO dev: anim expr overwrote an explicit one');
        // wait / waitUntil that keep going through a skip
        const t0 = clock.t; flow.skipping = true; await waitUntil(() => clock.t - t0 >= 0.3, { skip: false }); await wait(0.2, { skip: false }); flow.skipping = false;
        log('waits through skip ' + (clock.t - t0).toFixed(2)); if (clock.t - t0 < 0.49) console.error('TWO dev: waitUntil { skip: false } resolved early');
        // hold: an object that never had a parent, dropped and despawned
        const loose = new THREE.Object3D(); L.hold(loose); L.hold(null); L.hold(new THREE.Object3D());
        W.spawn('dev_tmp', [0.5, 0, -4.5, 0], { look: 'chase40_tee' }); W.actor('dev_tmp').hold(new THREE.Object3D()); W.despawn('dev_tmp');
        // the {quiet} step repaints; say / bark with a generic speaker wearing an actor's face
        c.hud.set({ quiet: '00:10:00' }); await c.runSteps([{ quiet: '00:09:59' }]);
        if (c.state.quiet !== '00:09:59' || !/00:09:59/.test(document.getElementById('hud').textContent)) console.error('TWO dev: quiet step did not repaint');
        c.hud.set(null);
        await c.runSteps([{ say: 'passenger', actor: 'chase', text: 'Is that your son?' }, { bark: 'jettyman', text: 'Morning.', wait: 0.5 }]);
        // new anims and wardrobe: polish calibrated, the 3.7 set promoted, rails, phones_off, a painted card, hair on end, ghost
        const play = async (a, n, o, t = 0.5) => { a.play(n, o || {}); if (!sk(c)) c.cam.shot({ shot: 'MID', on: a.id, angle: 'side' }); await c.wait(t); };
        await play(L, 'polish', { h: 0.95 }); await play(L, 'polish', { low: true, h: 0.95 }); await play(L, 'kneel_work'); await play(L, 'lean_rail', { hand: true });
        await play(C, 'wipe_face', { rail: 1.2 }); await play(C, 'hand_rest', { sd: -1 }); await play(C, 'peer'); await play(C, 'lean_back'); await play(C, 'hand_rail');
        F.rig.show('headphones_head', true); await play(F, 'phones_off', null, 2.4);
        if (F.rig.attach.headphones_head.visible) console.error('TWO dev: phones_off left the headphones on');
        C.rig.attach.card.userData.paint((x, w, h) => { x.fillStyle = '#8ee9ff'; x.fillRect(0, 0, w, h); x.fillStyle = '#123'; x.font = 'bold 22px sans-serif'; x.fillText('BONUS', 14, 48); });
        await play(C, 'hold_card', null, 0.6); await play(C, 'hold_card', { show: true }, 0.4); C.rig.attach.card.userData.paint(null);
        C.rig.show('hair_static', true); C.setExpr('laugh_cry'); C.rig.ghost(['handR', 'foreR'], 0.3); c.cam.shot({ shot: 'CLOSE', on: 'chase' }); await c.wait(0.8);
        C.rig.ghost(null, 1); C.rig.show('hair_static', false); C.setExpr('neutral'); C.play('idle');
        // batch 2: a glance over a lying pose keeps him lying; rig.fade; the held lanyard; Luke's hat; the rig pool
        await play(C, 'sleep_back', null, 0.3); await play(C, 'glance', { yaw: 0.6 }, 0.4);
        log('glance lying ' + C.rig.lying); if (!C.rig.lying) console.error('TWO dev: a glance stood a lying rig up');
        C.play('idle'); L.rig.fade(0.4, 0.5); await c.wait(0.3); L.rig.fade(1, 0);
        await play(L, 'hold_lanyard', { out: true }, 0.4);
        W.spawn('luke', [-0.5, 0, -4.5, 0]); W.actor('luke').rig.show('santa_hat'); c.cam.shot({ shot: 'CLOSE', on: 'luke' }); await c.wait(0.6); W.despawn('luke');
        log('rigs luka ' + W.rigsOf('luka').length + ', pooled looks ' + Object.keys(W.pool).length);
        C.walkAnim = 'walk_rail'; await C.moveTo([2.4, 0, -6.0]); C.walkAnim = 'limp'; await C.moveTo([3.2, 0, -6.4]); C.walkAnim = 'walk';
        if (C.anim !== 'idle') console.error('TWO dev: a walkAnim move did not end in idle (' + C.anim + ')');
        // drones: goTo with a hover height, a transfixed lure, stealth.end({ calm: false }) keeps the lure; chip view without ads
        DRONES.spawn('dev_m', { at: [-1.0, 0, -11.0], face: [-1.0, 0, -5.0] });
        await DRONES.goTo('dev_m', [-1.0, 0, -9.0], { speed: 3, y: 2.4 });
        log('goTo y ' + DRONES.get('dev_m').hover.toFixed(2)); if (Math.abs(DRONES.get('dev_m').hover - 2.4) > 0.01) console.error('TWO dev: goTo y');
        DRONES.release('dev_m'); stealth.begin({});
        const lu = DRONES.lure([-1.0, 0, -7.0], 'laugh', { transfixed: true });
        stealth.end({ calm: false }); await c.wait(0.2);
        log('lure ' + lu.n + ' after end: ' + DRONES.state('dev_m')); if (lu.n && DRONES.state('dev_m') !== 'lured') console.error('TWO dev: stealth.end({ calm: false }) sent the lured drone home');
        chip.show(true, { ads: false }); await c.wait(0.3); chip.show(false); DRONES.clear();
        // a TWO in a split's narrow left half: a dirty two-shot, not the set's own wide camera (screenshot)
        L.place([1.6, 0, -6.0, PI2(-0.5)]); C.place([0.4, 0, -6.0, PI2(0.5)]);
        await W.split({ left: { shot: { shot: 'TWO', on: ['luka', 'chase'] } }, right: { set: RIGHT, shot: { shot: 'WIDE' } } });
        await c.wait(1.2); log('split TWO ' + c.cam.name); await W.split(null);
        // audio: a song holds its place while paused (the pause menu calls AUDIO.pause)
        const A = c.AUDIO;
        if (A && A.pause && !c.flow.skipping) {
          const h = A.song({ pattern: null, from: 'VERSE', to: 'VERSE' }); await h.ready; await c.wait(0.4);
          A.pause(true); const t1 = h.t; await new Promise((r) => setTimeout(r, 400)); const t2 = h.t; A.pause(false); await new Promise((r) => setTimeout(r, 300));
          log('song paused ' + t1.toFixed(2) + ' -> ' + t2.toFixed(2) + ', then ' + h.t.toFixed(2));
          if (Math.abs(t2 - t1) > 0.01 || !(h.t > t2)) console.error('TWO dev: AUDIO.pause did not hold the song');
          h.stop(0.1);
        }
        await c.cam.release(0);
      }],
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
        // a time-lapse (day -> night -> day) with a key; played or skipped, the key fires once
        { shot: 'WIDE', on: ['luka', 'chase'] },
        { timelapse: { from: 'day', to: 'night', dur: 1.6, cycles: 1, keys: [{ t: 0.6, steps: [{ do: () => log('timelapse key') }] }] } },
        { fade: 'out', dur: 0.6 },
      ]],
    ],
  };

  // ---- DEV_MG: every MINIGAMES entry present at run time, one after another under autoplay, each on the set (env,
  // spawn) of the scene that uses it (HOME), else the store; a summary line per mini-game ('dev_mg <id> ...') and a
  // total. A mini-game that throws, hangs (MG_CAP s of game time) or reports { error } is a console.error.
  // ?autoplay=1&fast=1&speed=8&scene=DEV_MG&stop=DEV_MG   (&mg=polish,stall: only those)
  const HOME = { polish: '1.1', stall: '1.3', wiring: '1.3', chip_sale: '1.5', piano: '2.2', keypad: '2.2', roleplay: '2.5', reason_cards: '2.5',
    scooter: '2.5', sizzle: '2.6', safebox_keypad: '2.8', sequencer: '2.10', blend_in: '3.1', secret_santa: '3.1', hack: '3.2', boss: '3.4',
    hold_no: '3.6', choice: '3.7', credits: 'C' };
  const PARAMS = { polish: { anim: true }, stall: { rounds: [1, 2, 3, 4, 5] }, wiring: { half: 1 }, chip_sale: { time: '12:20' }, keypad: { digits: 4, code: '2032', test: '2032' },
    safebox_keypad: { digits: 4, code: '1987', test: '1987' }, sizzle: { intro: false }, blend_in: { need: 3 }, secret_santa: { intro: true }, credits: { autoLen: 8 } };
  const FALLBACK = { credits: { set: 'parade', env: 'wp_washed' } };
  const MG_CAP = 300;
  SCENES.DEV_MG = {
    title: 'Mini-game regression', set: SET, env: 'day', playable: [], swap: false, hud: null, music: null, timeCard: false,
    steps: [
      ['do', async (c) => {
        const only = new URLSearchParams(location.search).get('mg'), want = only ? only.split(',') : null;
        const ids = Object.keys(MINIGAMES).filter((k) => MINIGAMES[k] && (!want || want.includes(k)));
        for (const k of ['alarm', 'radio', 'kettle', 'chip', 'hover', 'bay', 'piano', 'brick', 'boom', 'whir', 'laugh', 'sizzle', 'uke']) if (SAMPLES[k] && !c.state.samples.includes(k)) c.state.samples.push(k);
        const sid = c.flow.sceneId, rows = [];
        let bad = 0;
        log('mg list ' + ids.join(' '));
        for (const id of ids) {
          if (c.flow.sceneId !== sid) return;
          const sc = SCENES[HOME[id]] || null, fb = FALLBACK[id] || {};
          const set = (sc && sc.set && SETS[sc.set] && sc.set) || (fb.set && SETS[fb.set] && fb.set) || SET;
          const env = (sc && sc.set === set && sc.env) || (fb.set === set && fb.env) || undefined;
          // a clean slate: systems clear on flow:stop (drones, AR, Chip View, barks, switches), no actors, no shot
          emit('flow:stop'); popup.clear(); c.ui.card(null); c.ui.letterbox(false); c.hud.set(null);
          (c.world.actors instanceof Map ? [...c.world.actors.keys()] : []).forEach((a) => c.world.despawn(a));
          await c.cam.release(0);
          try { await c.runSteps([{ set, env, spawn: (sc && sc.set === set && sc.spawn) || null }]); } catch (e) { console.error('TWO dev_mg: ' + id + ' set ' + set, e); bad++; continue; }
          const lead = sc && sc.set === set && sc.playable && sc.playable.find((p) => c.world.actor(p));
          if (lead) { c.state.active = lead; player.control(lead); }
          const t0 = clock.t;
          let r = null, threw = null, done = false;
          const p = Promise.resolve().then(() => c.flow.minigame(id, Object.assign({}, PARAMS[id] || {}))).then((x) => { r = x; }, (e) => { threw = e; }).finally(() => { done = true; });
          await waitUntil(() => done || clock.t - t0 > MG_CAP || c.flow.sceneId !== sid, { skip: false });
          if (c.flow.sceneId !== sid) return;
          if (!done) {   // hung: finish it as skipped so the run goes on
            console.error('TWO dev_mg: ' + id + ' did not finish in ' + MG_CAP + ' s');
            c.flow.skipOffer = true; if (!c.flow.skipMinigame()) return;
            await p;
          }
          const secs = (clock.t - t0).toFixed(1);
          const keys = r && typeof r === 'object' ? Object.keys(r).filter((k) => typeof r[k] !== 'object').map((k) => k + '=' + r[k]).join(' ') : String(r);
          const fail = !!threw || !r || r.error || r.missing;
          if (fail) { bad++; console.error('TWO dev_mg: ' + id + ' failed ' + (threw ? threw.message : keys)); }
          rows.push(id);
          log('mg ' + id + ' on ' + set + (env ? '/' + env : '') + ' ' + secs + ' s: ' + (fail ? 'FAILED ' : 'ok ') + keys);
          await c.cam.release(0);
        }
        log('mg total ' + rows.length + ' run, ' + bad + ' failed');
      }],
    ],
  };

  // ---- every LOOKS entry in a row, labelled (screenshot: run without fast=1)
  SCENES.DEV_LINEUP = {
    title: 'Lineup', set: SET, env: 'day', timeCard: false, hud: null,
    steps: [
      ['do', async (c) => {
        const ids = Object.keys(LOOKS).filter((k) => LOOKS[k]), per = 8;
        const rows = Math.ceil(ids.length / per);
        log('lineup ' + ids.length);
        for (let r = 0; r < rows; r++) {
          c.world.actors.forEach((a, id) => { if (id.startsWith('lu_')) c.world.despawn(id); });
          AR.clear(); AR.show(true);
          const row = ids.slice(r * per, r * per + per);
          row.forEach((id, i) => {
            const x = -2.0 + (i - (row.length - 1) / 2) * 0.9;
            c.world.spawn('lu_' + id, [x, 0, 11.5, 0], { look: id });
            AR.add({ id: 'lu_' + id, kind: 'name', text: id, on: 'lu_' + id, size: 0.8 });
          });
          c.cam.shot({ shot: 'CAM', pos: [-2.0, 1.2, 17.3], look: [-2.0, 0.92, 11.5], fov: 40 });
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
