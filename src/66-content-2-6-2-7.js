// ============================================================ CONTENT: 2.6 ("Snag"), 2.7 ("Shorncliffe Line")
// BUILD_PROMPT §8. Every line is final and word for word; '^' = a beat. Shot tags are quoted in the comments.
// Sets: sandgate (docs/sets/sandgate.md: luke26 -> sizzle26 -> invite26; gates27 for 2.7's first INSERT) and train
// (docs/sets/train.md: board27 -> run27 -> inspect27 -> talk27 -> valley27; travel, doors, chime, the reindeer, lightning).
// 2.6: Luke (2040) at the sizzle: the misdirection ends ("…It's not Luke."); Luke's "Grab some tongs." and a short roam
//   at the front of the table (the urn = the kettle, the Sizzle sample with Chase's phone held out over the plate, the
//   hand-painted sign), the tongs -> MINIGAMES.sizzle (47-mg-sizzle.js says the banter and "Easy, Santa."; intro: false
//   because Luke says "Nobody gets a favour…" here), then the invitation (CARDS.s26_invite + ITEMS.invite) and the too-long
//   look at Santa's back.
// 2.7: the fare gate on sandgate (lane 2's reader: 3 FARES · Balance: $4), the carriage at Sandgate (nephew / brother /
//   nephew), then the ticket inspection: one Courtesy Drone scans bay by bay from the far end (ai off, driven here; its
//   cone sees whoever sits in the bay side it scans, or stands in the aisle ahead of it). Chase (the only playable) wakes
//   Luka (he moves to B4), swaps seats with two passengers in B4 ("Only if you're sure."; they move to B3's free pair) so
//   Chase (2040) and he get B4, and may borrow the inflatable reindeer and stand it in the aisle (M or B1): the drone
//   politely waits for it to pass (~8 s), then it flops onto B1 L. B4 is out of its path (the train stops at Nudgee at
//   ~45 s, before the drone gets there); everyone must be out of B2 by ~34 s, ~43 s with the reindeer. Caught (seen in a
//   scanned bay side, or in the aisle ahead of it): no Safe Room, the carriage restarts at Boondall (stealth with
//   safeRoom: false). Then the drone leaves at Nudgee, and the locked side-on two-shot with the storm in the window.
//   &s27fail=1 (autoplay only): Chase first walks into the drone's path, is caught, the carriage restarts, then it's solved.
// Music: 2.6 'sizzle' (out under the exit WIDE); 2.7 none (the rails, the rain and the thunder are the set's ambience).
// Honest moments play straight: "You look after yourself, Chase." and the whole of 2.7_talk (no music, no gag after).
// Continue restarts a scene at step 0: each first cutscene resets the scene's flags and re-dresses its set.
(() => {
  const PI = Math.PI, H = PI / 2;
  const say = (id, text, o) => Object.assign({ say: id, text }, o);
  const slow = (id, text, o) => say(id, text, Object.assign({ speed: 'slow' }, o));
  const sk = (c) => c.flow.skipping;
  const P = (c, n) => c.world.prop(n);
  const act = (c, id) => c.world.actor(id);
  const V1 = new THREE.Vector3(), V2 = new THREE.Vector3();
  // one tick later (even while skipping): a set re-dresses itself on its first tick in a new scene
  const nextTick = () => new Promise((res) => { const f = () => { removeUpdate(f); res(); }; addUpdate(f); });
  // autoplay's waits: checked every tick, even while a cutscene is being skipped (waitUntil resolves at once then)
  const until = (fn) => new Promise((res) => { const f = () => { if (fn()) { removeUpdate(f); res(); } }; addUpdate(f); });
  // fn after `sec` of game time (at once while skipping); never into another scene
  function later(c, sec, fn) {
    const sid = c.flow.sceneId;
    if (c.flow.skipping || !(sec > 0)) { fn(); return; }
    let t = 0;
    const f = (dt) => { t += dt; if (flow.sceneId !== sid) { removeUpdate(f); return; } if (t >= sec || flow.skipping) { removeUpdate(f); fn(); } };
    addUpdate(f);
  }
  // a scene-scoped updater: runs while the scene is `id`, removes itself (and calls off) as soon as it isn't
  function scope(id, fn, off) {
    const f = (dt) => { if (flow.sceneId !== id) { removeUpdate(f); if (off) off(); return; } fn(dt); };
    addUpdate(f);
    return f;
  }
  // a computed close-up: the lens `dist` m from his eyes, `yaw` rad off his facing (+ = toward his left), pushing in
  // `push` m over `dur` s. Read at step time (faces placed under the cut); nothing while skipping.
  function closeOn(c, id, o = {}) {
    if (sk(c)) return;
    const a = act(c, id);
    if (!a) return;
    a.eyePos(V1);
    const turning = !!(a.fc && a.fc.on);
    if (turning) {   // mid-turn (a face step is not awaited): frame where the turn ends
      const dr = a.fc.a1 - a.rotY, dx = V1.x - a.pos.x, dz = V1.z - a.pos.z, cs = Math.cos(dr), sn = Math.sin(dr);
      V1.x = a.pos.x + dx * cs + dz * sn; V1.z = a.pos.z - dx * sn + dz * cs;
    }
    const ry = (turning ? a.fc.a1 : a.rotY) + (o.yaw || 0), d = o.dist || 0.95, pu = o.push ?? 0.12, ly = V1.y - 0.05 + (o.ly || 0);
    const sx = Math.sin(ry), sz = Math.cos(ry), y = V1.y + (o.dy ?? -0.02), lx = V1.x + (o.lx || 0), lz = V1.z + (o.lz || 0);
    c.cam.shot({ shot: 'CAM', pos: [V1.x + sx * d, y, V1.z + sz * d], look: [lx, ly, lz], fov: o.fov || 36,
      to: { pos: [V1.x + sx * (d - pu), y + (o.rise || 0), V1.z + sz * (d - pu)], look: [lx, ly, lz], fov: o.fovTo || o.fov || 36 }, dur: o.dur || 7, ease: 'linear' });
  }
  const CLOSE = (id, o) => ({ do: (c) => closeOn(c, id, o) });
  // a two-shot of a and b: the lens off the line between their eyes on side `side` (+1 = to the left of a -> b, seen
  // from above), `dist` m from the midpoint, turned `yaw` rad about it; a slow push
  function twoOn(c, a, b, o = {}) {
    if (sk(c)) return;
    const A = act(c, a), B = act(c, b);
    if (!A || !B) return;
    A.eyePos(V1); B.eyePos(V2);
    const mx = (V1.x + V2.x) / 2 + (o.mx || 0), my = (V1.y + V2.y) / 2, mz = (V1.z + V2.z) / 2 + (o.mz || 0);
    let ux = V2.x - V1.x, uz = V2.z - V1.z;
    const L = Math.hypot(ux, uz) || 1; ux /= L; uz /= L;
    const s = o.side || 1, d = o.dist || Math.max(1.7, L * 1.3), nx = -uz * s, nz = ux * s;
    const cs = Math.cos(o.yaw || 0), sn = Math.sin(o.yaw || 0), px = nx * cs + nz * sn, pz = -nx * sn + nz * cs;
    const y = my + (o.dy ?? 0.04), ly = my + (o.ly ?? -0.1), pu = o.push ?? 0.15, f = o.fov || 40;
    c.cam.shot({ shot: 'CAM', pos: [mx + px * d, y, mz + pz * d], look: [mx, ly, mz], fov: f,
      to: { pos: [mx + px * (d - pu), y, mz + pz * (d - pu)], look: [mx, ly, mz], fov: o.fovTo || f }, dur: o.dur || 8, ease: 'linear' });
  }
  const TWO = (a, b, o) => ({ do: (c) => twoOn(c, a, b, o) });
  // a glide between two explicit lenses
  const glideCam = (pos, look, fov, to, dur = 6, o) => Object.assign({ shot: 'CAM', pos, look, fov, to: to ? { pos: to[0] || pos, look: to[1] || look, fov: to[2] ?? fov } : undefined, dur, ease: 'linear' }, o);
  // a set anchor's lens with a slow push of `push` m toward its look (read at step time: the set files come first)
  function aPush(setId, name, push = 0.2, dur = 8, o = {}) {
    return { do: (c) => {
      if (sk(c)) return;
      const S = SETS[setId], an = S && S.anchors && S.anchors[name];
      if (!an) { console.warn('TWO 2.6-2.7: no anchor ' + name); return; }
      const f = an.from, t = an.at, d = Math.hypot(t[0] - f[0], t[1] - f[1], t[2] - f[2]) || 1, k = push / d, fov = o.fov || an.fov || 40;
      const s = { shot: 'CAM', pos: f.slice(), look: t.slice(), fov, to: { pos: [f[0] + (t[0] - f[0]) * k, f[1] + (t[1] - f[1]) * k + (o.rise || 0), f[2] + (t[2] - f[2]) * k], look: t.slice(), fov: o.fovTo || fov }, dur, ease: 'linear' };
      if (o.card) s.card = o.card;
      c.cam.shot(s);
    } };
  }
  // Luka's tell (and anyone's look): a head turn toward someone or a point; the feet stay
  function glanceAt(c, from, to, dur = 1.0) {
    if (sk(c)) return;
    const a = act(c, from), b = typeof to === 'string' ? act(c, to) : null, tx = b ? b.pos.x : to[0], tz = b ? b.pos.z : to[2];
    if (!a || tx == null) return;
    let d = Math.atan2(tx - a.pos.x, tz - a.pos.z) - a.rotY; d = Math.atan2(Math.sin(d), Math.cos(d));
    a.play('glance', { yaw: Math.max(-1.3, Math.min(1.3, d)), dur });
  }
  const glance = (from, to, dur) => ({ do: (c) => glanceAt(c, from, to, dur) });
  // seat / unseat at once (state: kept under skips)
  function seatA(a, at, h = 0.45, anim = 'sit') { if (!a) return; if (at) a.place(at); a.rig.seated = true; a.play(anim, { h }); }
  function standA(a, at) { if (!a) return; a.rig.seated = false; a.rig.floorSit = false; if (at) a.place(at); a.play('idle'); }
  // Luka's Santa beard: 'on' | 'slip' | 'chin' | 'eyes' | 'ear'
  function beardSet(c, st) { const l = act(c, 'luka'), b = l && l.rig.attach.santa_beard; if (b) b.userData.state(st); }
  // autoplay: SWAP until `id` leads (bounded)
  function swapTo(c, id) { for (let i = 0; i < 3 && c.state.active !== id; i++) if (!c.flow.swapNext()) break; }
  // walk the active character through waypoints (autoplay solves the roams on foot)
  async function walk(c, pts, run = true) {
    const sid = c.flow.sceneId;
    c.player.enabled = true;   // followers walk the leader's trail only while the player is enabled
    for (const p of pts) {
      const a = act(c, c.state.active);
      if (!a || c.flow.sceneId !== sid) break;
      await a.moveTo(p, { run, collide: true });
    }
    await c.wait(run ? 0.5 : 0.35);
    c.player.enabled = false;
  }
  // an actor walks a route in the background (no collisions: scripted). The promise resolves on arrival, on a skip (it
  // lands at the end at once), on a scene change, or when GEN moves on (a retry); `then(a)` runs on arrival or landing.
  let GEN = 0;
  function route(c, id, pts, o = {}) {
    const a = act(c, id), sid = c.flow.sceneId, g = GEN;
    if (!a || !pts.length) return Promise.resolve();
    const last = pts[pts.length - 1], live = () => c.flow.sceneId === sid && g === GEN;
    let done = false;
    const land = () => { done = true; a.place(last); if (o.face != null) a.face(o.face, 0); if (o.then) o.then(a); };
    if (sk(c)) { land(); return Promise.resolve(); }
    (async () => {
      for (const p of pts) { if (!live() || done) return; await a.moveTo(p, { run: !!o.run, speed: o.speed, face: o.keepFace ? false : undefined }); }
      if (!live() || done) return;
      done = true;
      if (o.face != null) a.face(o.face, 0.35);
      if (o.then) o.then(a);
    })();
    return waitUntil(() => done || c.flow.skipping || !live()).then(() => { if (!done && c.flow.skipping && live()) land(); });
  }
  const yawTo = (from, to) => Math.atan2(to[0] - from[0], to[2] - from[2]);

  // ---------------------------------------------------------- hand props (built at load from art's cached materials)
  // Luke's invitation and Jordan's Christmas bonus card: two thin cards that live in a detached group between uses
  // (actor.hold puts a prop back where it came from)
  const CARD_HOME = new THREE.Group();
  CARD_HOME.name = 'cards_2627';
  function handCard(name, hex, edge) {
    const g = new THREE.Group(); g.name = name;
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.004, 0.06), mat(hex));
    const band = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.0045, 0.016), mat(edge));
    band.position.set(0, 0.0003, -0.021);
    g.add(body, band); g.rotation.x = -1.1;
    CARD_HOME.add(g);
    return g;
  }
  const INVITE_CARD = handCard('s26_invite_card', 0xf7f4ec, 0x1f3d8a);
  const BONUS_CARD = handCard('s27_bonus_card', 0x2a6fd8, 0xe8eef8);

  // ---------------------------------------------------------- CARDS (readable INSERTs this file owns)
  // 2.6: Luke's invitation. A glossy card: MANDATORY FUN · Christmas Eve Morning Tea · Optus Tower, Ann Street, Fortitude
  // Valley · 10:00 · Countdown to Quiet at 11:58! · Safety goggles provided · Admits: LUKE + 2
  CARDS.s26_invite = (cx, w, h) => {
    const K = CARDS._kit;
    K.seedOf('s26_invite');
    K.tilt(cx, w, h, -0.025);
    const x = w * 0.06, y = h * 0.07, cw = w * 0.88, ch = h * 0.86;
    K.shadow(cx, 28, 12, 0.45); cx.fillStyle = '#fbfaf6'; K.rr(cx, x, y, cw, ch, 18); cx.fill(); K.noShadow(cx);
    cx.save(); K.rr(cx, x, y, cw, ch, 18); cx.clip();
    // the navy band: MANDATORY FUN, festive bunting over it
    const bh = ch * 0.3;
    const g = cx.createLinearGradient(0, y, 0, y + bh); g.addColorStop(0, '#22409a'); g.addColorStop(1, '#141d3a');
    cx.fillStyle = g; cx.fillRect(x, y, cw, bh);
    for (let i = 0; i < 18; i++) {
      const fx = x + cw * (i + 0.5) / 18, fy = y + 6 + 6 * Math.sin(i * 0.9);
      cx.fillStyle = i % 3 === 0 ? '#c8262e' : i % 3 === 1 ? '#f2f2ee' : '#2e8a5a';
      cx.beginPath(); cx.moveTo(fx - 14, fy); cx.lineTo(fx + 14, fy); cx.lineTo(fx, fy + 24); cx.closePath(); cx.fill();
    }
    cx.textAlign = 'center'; cx.textBaseline = 'middle';
    cx.fillStyle = '#ffffff'; cx.font = `900 ${Math.round(ch * 0.13)}px ${K.SANS}`;
    cx.fillText('MANDATORY FUN', x + cw / 2, y + bh * 0.62, cw * 0.9);
    // the Optus mark, small: Yes (Are you sure?)
    const lx = x + cw * 0.86, ly = y + bh + ch * 0.12;
    cx.fillStyle = '#ffd21f'; cx.beginPath(); cx.arc(lx, ly, ch * 0.075, 0, 7); cx.fill();
    cx.fillStyle = '#141d3a'; cx.font = `bold ${Math.round(ch * 0.06)}px ${K.SANS}`; cx.fillText('Yes', lx, ly + 1);
    cx.font = `italic ${Math.round(ch * 0.028)}px ${K.SANS}`; cx.fillStyle = '#5a6380'; cx.fillText('(Are you sure?)', lx, ly + ch * 0.105);
    // the details
    cx.textAlign = 'left';
    const tx = x + cw * 0.07;
    cx.fillStyle = '#141d3a'; cx.font = `bold ${Math.round(ch * 0.085)}px ${K.SANS}`;
    cx.fillText('Christmas Eve Morning Tea', tx, y + bh + ch * 0.1, cw * 0.72);
    cx.fillStyle = '#3a4466'; cx.font = `${Math.round(ch * 0.05)}px ${K.SANS}`;
    cx.fillText('Optus Tower, Ann Street, Fortitude Valley', tx, y + bh + ch * 0.19, cw * 0.72);
    cx.fillStyle = '#1f3d8a'; cx.font = `900 ${Math.round(ch * 0.12)}px ${K.SANS}`;
    cx.fillText('10:00', tx, y + bh + ch * 0.33);
    cx.fillStyle = '#c8262e'; cx.font = `bold ${Math.round(ch * 0.055)}px ${K.SANS}`;
    cx.fillText('Countdown to Quiet at 11:58!', tx, y + bh + ch * 0.45, cw * 0.62);
    cx.fillStyle = '#3a4466'; cx.font = `italic ${Math.round(ch * 0.045)}px ${K.SANS}`;
    cx.fillText('Safety goggles provided', tx, y + bh + ch * 0.54, cw * 0.6);
    // the admit stub, perforated
    const sx = x + cw * 0.66, sy = y + bh + ch * 0.38, sw = cw * 0.29, sh = ch * 0.22;
    cx.setLineDash([8, 6]); cx.strokeStyle = '#8a92aa'; cx.lineWidth = 3; K.rr(cx, sx, sy, sw, sh, 10); cx.stroke(); cx.setLineDash([]);
    cx.textAlign = 'center'; cx.fillStyle = '#6a7290'; cx.font = `bold ${Math.round(ch * 0.034)}px ${K.SANS}`;
    cx.fillText('Admits:', sx + sw / 2, sy + sh * 0.28);
    cx.fillStyle = '#141d3a'; cx.font = `900 ${Math.round(ch * 0.066)}px ${K.SANS}`;
    cx.fillText('LUKE + 2', sx + sw / 2, sy + sh * 0.66, sw * 0.9);
    // gloss
    const gl = cx.createLinearGradient(x, y, x + cw * 0.7, y + ch);
    gl.addColorStop(0, 'rgba(255,255,255,0.0)'); gl.addColorStop(0.42, 'rgba(255,255,255,0.0)'); gl.addColorStop(0.5, 'rgba(255,255,255,0.32)'); gl.addColorStop(0.58, 'rgba(255,255,255,0.0)');
    cx.fillStyle = gl; cx.fillRect(x, y, cw, ch);
    cx.restore();
  };
  CARDS.s26_invite.size = [960, 600];
  // the BAG: the invitation's examine shows the card (the line stays config's)
  if (typeof ITEMS !== 'undefined' && ITEMS.invite) {
    const line = ITEMS.invite.examine;
    ITEMS.invite.examine = async (c) => {
      if (!sk(c)) c.ui.card('s26_invite');
      try { if (typeof line === 'function') await line(c); else await c.wait(2.4); } finally { c.ui.card(null); }
    };
  }

  // ============================================================ 2.6 — "Snag"
  const SG = () => SETS.sandgate;
  const S26_FLAGS = ['s26_tongs', 's26_sign', 's26_sizzle', 's26_invite'];
  // blocking (metres; the gazebo x -8.4..-3.6, z -3.6..-0.4; the plate x -8.0..-6.2, z -3.0..-2.4; the front table z
  // -1.15..-0.45; the queue at x -5.6 from z 0.15 back): the three come in behind the queue and up its west side
  const LUKE_HOT = [-7.10, 0, -3.25, 0];
  const C_MARCH = [-6.75, 0, 0.05], L_BACK = [-6.15, 0, 1.35], C4_BACK = [-7.55, 0, 1.7], C4_ASIDE = [-7.5, 0, 0.25];
  const ST_CHASE = [-10.4, 0, 6.6, 2.6], ST_LUKA = [-11.6, 0, 6.9, 2.6], ST_C40 = [-9.6, 0, 7.3, 2.6];   // behind the opening WIDE's lens
  const IN_CHASE = [[-8.0, 0, 3.0], C_MARCH], IN_LUKA = [[-8.4, 0, 3.5], [-6.7, 0, 2.4], L_BACK], IN_C40 = [[-8.8, 0, 3.7], C4_BACK];
  // the opening WIDE: from the front-west, Luke at the plate under the gazebo, the queue to the right, the storm wall
  const WIDE26 = { shot: 'CAM', pos: [-11.95, 2.2, 3.1], look: [-6.6, 1.45, -2.0], fov: 46, to: { pos: [-11.5, 2.14, 2.6], look: [-6.6, 1.4, -2.0], fov: 45 }, dur: 12, ease: 'linear' };
  const ROAM_SPOT = { sizzle: [-6.4, 0, 0.0], urn: [-7.3, 0, 0.0], tongs: [-7.95, 0, 0.1] };
  function dress26(st, keepEnv) { const S = SG(); if (S && S.dress && world.setId === 'sandgate') S.dress(st, keepEnv ? { keepEnv: true } : undefined); }
  // 15:00, the forecourt: Luke at the plate turning snags, three in the queue, the boys off to the east (the street)
  function open26(c) {
    for (const f of S26_FLAGS) delete c.state.flags[f];
    GEN++;
    c.state.flags.santa = true; c.state.flags.chip_off = true;
    dress26('luke26');
    const S = SG(); if (S && S.storm && S.storm.build) S.storm.build(0.35, 0);
    const lk = act(c, 'luke40'); if (lk) { lk.place(LUKE_HOT); lk.play('sizzle_flip'); lk.setExpr('happy'); lk.hold(null); }
    const ch = act(c, 'chase'), l = act(c, 'luka'), c4 = act(c, 'chase40');
    if (ch) { ch.place(ST_CHASE); ch.play('idle'); ch.setExpr('determined'); ch.hold(null); ch.rig.show('phone', false); }
    if (l) { l.place(ST_LUKA); l.play('idle'); l.setExpr('neutral'); l.habit = null; l.rig.show('santa', true); beardSet(c, 'on'); }
    if (c4) { c4.place(ST_C40); c4.play('idle'); c4.setExpr('tired'); c4.habit = null; }
    if (typeof chip !== 'undefined') chip.lightOn(null);
    listenSamples();
  }
  // the three cross the forecourt (Chase marching, the others behind); resolves when Chase is at the table
  function arrive26(c) {
    route(c, 'luka', IN_LUKA, { speed: 1.9, face: yawTo(L_BACK, LUKE_HOT) });
    route(c, 'chase40', IN_C40, { speed: 1.6, face: yawTo(C4_BACK, LUKE_HOT) });
    return route(c, 'chase', IN_CHASE, { speed: 2.3, face: yawTo(C_MARCH, LUKE_HOT) });
  }
  // the sample: Chase holds his phone out over the table toward the plate; the onions get a stir and spit
  let sampleHook = false;
  function listenSamples() {
    if (sampleHook) return;
    sampleHook = true;
    on('sample:add', (k) => {
      if (flow.sceneId === '2.6' && k === 'sizzle') {
        duties26();
        const S = SG();
        if (S && S.sizzle && world.setId === 'sandgate') { S.sizzle.stir(); S.sizzle.heat(1); }
        if (flow.skipping) return;
        const a = world.actor('chase');
        if (a) { a.face([-6.4, 0, -2.7], 0.2); a.rig.show('phone', true); a.play('give', { dur: 1.8, loop: false }); }
        wait(1.9).then(() => { if (flow.sceneId !== '2.6') return; const b = world.actor('chase'); if (b) b.rig.show('phone', false); if (S && S.sizzle) S.sizzle.heat(0.6); });
      }
      if (flow.sceneId === '2.7' && k === 'train') {
        duties27();
        if (!flow.skipping && TR() && TR().chime) TR().chime();
      }
    });
  }
  function duties26() {
    objective.list([{ text: 'Sizzle (optional)', done: state.samples.includes('sizzle') }]);
  }

  SCENES['2.6'] = {
    title: 'Snag', set: 'sandgate', env: 'arvo26', time: '15:00', place: 'Sandgate Station',
    playable: ['chase', 'luka'], swap: false, music: 'sizzle',
    hud: { noService: false, quiet: '20:58:00', samples: true, bars: null },
    spawn: { chase: ST_CHASE, luka: ST_LUKA, chase40: ST_C40, luke40: 'luke_hot' },
    hotspots: [
      // the urn on the front table: the save point (spec 13.1), steam off its lid
      { id: 'h26_urn', at: [-7.30, 1.12, -0.80], r: 0.95, verb: 'Use', kettle: true },
      // the Sizzle sample: the onions on the plate, across the table (Chase holds his phone out over it)
      { id: 'h26_sizzle', at: [-6.4, 0, -0.05], r: 0.7, only: 'chase', sample: 'sizzle' },
      // the hand-painted sign: the one sign anyone without a chip can read (a silent insert)
      { id: 'h26_sign', at: [-2.9, 0, 0.95], r: 0.95, verb: 'Examine', flag: 's26_sign',
        steps: [aPush('sandgate', 's26_sign', 0.18, 4), { wait: 2.6 }] },
      // the tongs: round the end of the table, where the volunteers go in
      { id: 'h26_tongs', at: [-7.95, 0, -0.05], r: 0.95, verb: 'Grab some tongs', flag: 's26_tongs', do: () => {} },
    ],
    steps: [
      ['cutscene', '2.6_luke'],
      ['control', 'chase'],
      ['follow', true],
      ['swap', true],
      ['objective', 'Grab some tongs.'],
      ['do', () => duties26()],
      ['roam', {
        until: 's26_tongs',
        async auto(c) {
          const T = (id) => c.hotspots.trigger(id);
          swapTo(c, 'chase');
          await walk(c, [ROAM_SPOT.sizzle], false);
          await T('h26_sizzle');
          if (!c.state.samples.includes('sizzle')) console.error('TWO 2.6: the Sizzle sample was not recorded');
          await walk(c, [ROAM_SPOT.urn], false);
          await T('h26_urn');
          await T('h26_sign');
          swapTo(c, 'luka');
          await walk(c, [ROAM_SPOT.tongs], false);
          await T('h26_tongs');
        },
      }],
      ['objective', null],
      ['follow', null],
      ['swap', false],
      ['minigame', 'sizzle', { intro: false }],
      ['cutscene', '2.6_invite'],
    ],
    grants: { flags: { santa: true, chip_off: true, s26_tongs: true, s26_sizzle: true, s26_invite: true }, items: ['invite'], samples: ['sizzle'], quiet: '20:58:00', noService: false },
  };

  // Cutscene — "2.6_luke."
  CUTSCENES['2.6_luke'] = [
    { do: (c) => nextTick().then(() => open26(c)) },
    { fade: 'out', dur: 0 },
    // [WIDE] Under the gazebo, LUKE (2040): retired, sunburnt, KISS THE COOK (SAFELY), turning sausages with real
    // happiness. A small queue.
    { do: (c) => { if (!sk(c)) c.cam.shot(WIDE26); } },
    { fade: 'in', dur: 0.9 },
    { wait: 2.6 },
    // CHASE (marching up): the three come in from the street behind the lens, Chase out in front
    { do: (c) => arrive26(c) },
    { face: 'luke40', to: 'chase', dur: 0.5 },
    { act: [['luke40', 'idle']] },
    { do: (c) => { if (!sk(c)) c.cam.shot(glideCam([-7.55, 1.72, -4.05], [-6.7, 1.5, 0.05], 38, [[-7.5, 1.72, -3.85], null, 36], 7)); } },
    say('chase', 'We know it’s you.', { expr: 'determined' }),
    CLOSE('luke40', { dist: 1.05, yaw: 0.1, fov: 34 }),
    say('luke40', '…Know what’s me?', { expr: 'neutral' }),
    CLOSE('chase', { dist: 1.0, yaw: -0.1, fov: 34, dy: -0.06 }),
    say('chase', 'The MANAGER.', { act: 'point' }),
    { act: [['chase', 'idle']] },
    // the side two-shot across the table, from its east end: Luke at the plate (right), Chase at the front (left)
    { do: (c) => { if (!sk(c)) c.cam.shot(glideCam([-2.75, 1.74, -1.5], [-6.9, 1.38, -1.55], 35, [[-3.15, 1.73, -1.52], null, 35], 12)); } },
    { act: [['luke40', 'gesture']] },
    say('luke40', 'I WAS a manager. I hated it. Retired in ’37. ^ I do sausages now. ^ Sausages don’t hang up on you.', { expr: 'fond' }),
    { act: [['luke40', 'sizzle_flip']] },
    CLOSE('chase', { dist: 1.0, yaw: -0.12, fov: 34, dy: -0.06 }),
    say('chase', 'You hung up on US.', { expr: 'determined' }),
    { act: [['luke40', 'idle']] },
    CLOSE('luke40', { dist: 1.05, yaw: 0.1, fov: 34 }),
    say('luke40', 'When?', { expr: 'neutral' }),
    CLOSE('chase', { dist: 1.0, yaw: -0.12, fov: 34, dy: -0.06 }),
    say('chase', '1987.'),
    { do: (c) => { if (!sk(c)) c.cam.shot(glideCam([-3.15, 1.73, -1.52], [-6.9, 1.38, -1.55], 35, [[-3.6, 1.72, -1.54], null, 34], 10)); } },
    say('luke40', '…I’ve never been to 1987.', { expr: 'suspicious' }),
    say('chase', 'We rang you FROM 1987.', { expr: 'determined' }),
    // (Luke looks past him at Chase (2040).)
    CLOSE('luke40', { dist: 1.05, yaw: 0.1, fov: 34 }),
    { do: (c) => glanceAt(c, 'luke40', 'chase40', 2.6) },
    { wait: 1.0 },
    say('luke40', 'Chase? ^ Is this your—', { expr: 'suspicious' }),
    { face: 'chase40', to: 'luke40', dur: 0.4 },
    CLOSE('chase40', { dist: 1.05, yaw: 0.05, fov: 32 }),
    slow('chase40', 'Don’t.', { expr: 'tired' }),
    CLOSE('luke40', { dist: 1.05, yaw: 0.1, fov: 34 }),
    say('luke40', '…Right.', { expr: 'neutral' }),
    // (Luke decides he doesn't want to know.)
    { face: 'luke40', to: 0, dur: 0.5 },
    { act: [['luke40', 'sizzle_flip']] },
    { wait: 1.1 },
    // LUKE (at Luka in the Santa hat and beard)
    { do: (c) => { glanceAt(c, 'luke40', 'luka', 3.4); if (!sk(c)) c.cam.shot(glideCam([-6.55, 1.62, -1.85], [-7.25, 1.55, -3.25], 36, [[-6.6, 1.62, -1.95], null, 35], 6)); } },
    say('luke40', 'And who’s Santa?', { expr: 'suspicious' }),
    { face: 'luka', to: 'luke40', dur: 0.3 },
    CLOSE('luka', { dist: 1.0, yaw: -0.15, fov: 32 }),
    glance('luka', 'chase', 0.9),
    { wait: 0.9 },
    say('luka', '…Ho ho.', { tag: 'gruff', expr: 'sheepish' }),
    { act: [['luke40', 'sizzle_flip']] },
    // CHASE (2040) (quietly, to Chase): he steps up to his shoulder
    { move: 'chase40', to: C4_ASIDE, speed: 1.3 },
    { face: 'chase40', to: 'chase', dur: 0.3 },
    { face: 'chase', to: 'chase40', dur: 0.4 },
    // from behind them (north): the two Chases close together, Luke between them at the plate in the background
    { do: (c) => { if (!sk(c)) c.cam.shot(glideCam([-7.2, 1.66, 2.05], [-7.12, 1.48, 0.1], 42, [[-7.2, 1.64, 1.75], null, 40], 9)); } },
    say('chase40', 'He’s not even on the network. Hasn’t been since he retired. ^ The Manager IS the network. ^ It’s not Luke.', { tag: 'quietly', expr: 'tired' }),
    { expr: [['chase', 'sad']] },
    { face: 'chase', to: 'luke40', dur: 0.7 },
    CLOSE('chase', { dist: 0.95, yaw: 0.35, fov: 32, push: 0.18 }),
    { wait: 0.4 },
    say('chase', '…It’s not Luke.', { tag: 'deflating', expr: 'sad' }),
    // ▶ Luke's volunteer hasn't turned up and the queue's growing.
    { do: (c) => { const S = SG(); if (S && S.queue) S.queue.reset(4, false); const lk = act(c, 'luke40'); if (lk) lk.face('chase', sk(c) ? 0 : 0.4); } },
    { do: (c) => { if (!sk(c)) c.cam.shot(glideCam([-11.6, 2.05, 2.75], [-6.6, 1.4, -2.0], 44, [[-11.25, 2.0, 2.35], null, 43], 8)); } },
    { wait: 0.8 },
    { act: [['luke40', 'gesture']] },
    say('luke40', 'Nobody gets a favour from me on an empty stomach. Grab some tongs.', { expr: 'happy' }),
    { act: [['luke40', 'sizzle_flip']] },
    { do: (c) => { const ch = act(c, 'chase'); if (ch) ch.setExpr('neutral'); } },
  ];

  // Cutscene — "2.6_invite."
  const INV = { luke: [-4.0, 0, -0.1, 0.5], chase: [-3.2, 0, 0.9, -2.6], luka: [-2.2, 0, 0.4, -2.3], c40: [-2.6, 0, 1.7, -2.5] };
  CUTSCENES['2.6_invite'] = [
    { do: (c) => {
      dress26('invite26', true);
      const S = SG(); if (S && S.storm && S.storm.build) S.storm.build(0.5, sk(c) ? 0 : 6);
      const lk = act(c, 'luke40'), ch = act(c, 'chase'), l = act(c, 'luka'), c4 = act(c, 'chase40');
      if (lk) { lk.hold(null); lk.place(INV.luke); lk.play('wipe'); lk.setExpr('fond'); }
      if (ch) { ch.hold(null); ch.place(INV.chase); ch.play('idle'); ch.setExpr('neutral'); }
      if (l) { l.hold(null); l.place(INV.luka); l.play('idle'); l.setExpr('tired'); }
      if (c4) { c4.place(INV.c40); c4.play('idle'); c4.setExpr('tired'); }
    } },
    // LUKE (wiping his hands, pulling a card from his apron pocket)
    aPush('sandgate', 's26_apron', 0.12, 6),
    { wait: 1.3 },
    { act: [['luke40', 'idle']] },
    { hold: 'luke40', prop: INVITE_CARD, hand: 'L' },
    { do: (c) => closeOn(c, 'luke40', { dist: 1.15, yaw: -0.35, fov: 36, dur: 9 }) },
    say('luke40', 'Here. ^ Got one every year since I retired. Optus Christmas morning tea at HQ. Mandatory fun. I never go.', { expr: 'fond' }),
    // [INSERT] A glossy card
    { do: (c) => { if (!sk(c)) { c.cam.shot(glideCam([-3.25, 1.52, 0.65], [-4.05, 1.3, -0.1], 38, [[-3.33, 1.5, 0.57], null, 36], 6)); c.ui.card('s26_invite'); } } },
    { wait: 4.4 },
    { do: (c) => c.ui.card(null) },
    TWO('luke40', 'chase', { side: -1, dist: 1.9, fov: 40 }),
    { act: [['luke40', 'give', { dur: 1.4, loop: false }]] },
    say('luke40', 'Plus two. Take it. ^ Don’t tell anyone I helped. I’m retired.', { expr: 'happy' }),
    { hold: 'luke40', prop: null, hand: 'L' },
    { hold: 'chase', prop: INVITE_CARD },
    { item: 'invite' },
    { flag: 's26_invite' },
    { act: [['chase', 'nod']] },
    { wait: 0.6 },
    // they go; LUKE (to Chase (2040), as they go)
    { hold: 'chase', prop: null },
    { do: (c) => { route(c, 'chase', [[-1.6, 0, -0.6]], { face: PI * 0.8 }); route(c, 'luka', [[-0.9, 0, -0.9]], { face: PI * 0.8 }); route(c, 'chase40', [[-2.2, 0, 0.6]], { speed: 1.2 }); } },
    { do: (c) => { if (!sk(c)) c.cam.shot(glideCam([-5.2, 1.7, 1.2], [-2.2, 1.35, -0.1], 44, [[-5.05, 1.68, 1.05], null, 43], 6)); } },
    { wait: 1.2 },
    { face: 'chase40', to: 'luke40', dur: 0.6 },
    { face: 'luke40', to: 'chase40', dur: 0 },
    CLOSE('luke40', { dist: 1.2, yaw: 0.3, fov: 34, push: 0.12, dur: 8 }),
    say('luke40', 'You look after yourself, Chase. ^ You never did, after Luka.', { expr: 'neutral' }),
    CLOSE('chase40', { dist: 1.05, yaw: 0.2, fov: 32, push: 0.1 }),
    { wait: 1.2 },
    { act: [['chase40', 'nod']] },
    { wait: 0.9 },
    // [WIDE] They head for the station entrance. Behind them Luke turns a sausage, looks at Santa's back for a second
    // too long, then shakes his head and goes back to the hotplate.
    { music: null, fade: 3.5 },
    { env: 'gust26', dur: 8 },
    { do: (c) => {
      const S = SG(); if (S && S.storm && S.storm.build) S.storm.build(0.65, sk(c) ? 0 : 8);
      const lk = act(c, 'luke40'); if (lk) { lk.place([-7.1, 0, -3.25, 0.25]); lk.play('sizzle_flip'); lk.setExpr('neutral'); }
      const pts = [[-0.6, 0, -4.0], [0.0, 0, -9.6], [0.4, 0, -11.6]];
      route(c, 'luka', [[-1.4, 0, -1.2]].concat(pts));
      route(c, 'chase', [[-2.0, 0, -0.9], [-0.9, 0, -4.4], [-0.3, 0, -9.8], [0.0, 0, -11.9]]);
      route(c, 'chase40', [[-2.7, 0, -0.5], [-1.4, 0, -4.2], [-0.6, 0, -9.7], [-0.4, 0, -12.0]], { speed: 1.5 });
    } },
    aPush('sandgate', 's26_exit_wide', 0.4, 9),
    { wait: 2.6 },
    // behind Luke at the plate: he turns a sausage; Santa's back going into the station; a second too long
    { do: (c) => { if (!sk(c)) c.cam.shot(glideCam([-8.45, 1.92, -1.95], [-1.4, 1.25, -7.0], 42, [[-8.35, 1.9, -2.05], null, 40], 9)); } },
    { act: [['luke40', 'sizzle_flip']] },
    { wait: 2.0 },
    { do: (c) => { const l = act(c, 'luka'), lk = act(c, 'luke40'); if (lk) { lk.play('idle'); if (l) lk.face([l.pos.x, 0, l.pos.z], sk(c) ? 0 : 0.7); } } },
    { do: (c) => glanceAt(c, 'luke40', 'luka', 2.4) },
    { wait: 2.6 },
    { act: [['luke40', 'shake']] },
    { wait: 1.0 },
    { face: 'luke40', to: 0.25, dur: 0.6 },
    { act: [['luke40', 'sizzle_flip']] },
    { wait: 1.8 },
    { fade: 'out', dur: 1.0 },
    { do: (c) => c.world.prebuild('train') },
  ];

  // ============================================================ 2.7 — "Shorncliffe Line"
  const TR = () => SETS.train;
  const DID = 'd27';
  const S27_FLAGS = ['s27_luka', 's27_luka_up', 's27_c40', 's27_pax_c', 's27_pax_d', 's27_seat', 's27_rd', 's27_rd_held', 's27_rd_down', 's27_gone', 's27_talk'];
  const STOPS = [-7.65, -5.75, -3.85, -1.95, 0.0, 1.95, 3.85, 5.75, 7.65];
  const BAYN = ['A1', 'A2', 'A3', 'A4', 'M', 'B1', 'B2', 'B3', 'B4'];
  // the inspection's clock (game seconds from the roam's start): the doors close, the drone composes itself, scans,
  // the train brakes for Nudgee (16.9 s from cruise over 110 m) and stops at ~45 s, when the drone is finishing B3
  const T_DEPART = 1.0, T_SCAN0 = 2.0, T_BRAKE = 28.0, SCAN_T = 2.2, LOOK_T = 1.6, RD_WAIT = 8.0, GLIDE_V = 1.5;
  const SEAT = (n) => { const s = TR(); return s && s.marks && s.marks['seat_' + n]; };
  const MK = (n) => { const s = TR(); return s && s.marks && s.marks[n]; };
  const CHASE_UP = [0.0, 0, 4.2, PI];
  // passengers this file spawns into the carriage (the speaker PASSENGER is actor 'passenger')
  const PAX = {
    passenger: { look: 'passenger', seat: 'B2Rfw' },
    reindeer_man: { look: 'local40_c', seat: 'B3Lfw' },
    passenger_c: { look: 'passenger_c', seat: 'B4Rbw' },
    passenger_d: { look: 'passenger_d', seat: 'B4Lbw' },
  };
  const I = { on: false, T: 0, op: '', opT: 0, k: -1, side: 0, departed: false, braking: false, stopped: false, scanned: false,
    toRd: false, rd: 0, rdOn: false, caught: '', ct: 0, c: null, beat: false };
  const RD_BOX = [1e4, 1e4, 1e4 + 0.1, 1e4 + 0.1];
  const SEEN = ['chase', 'luka', 'chase40'];
  // &s27fail=1 (autoplay only): first walk Chase into the drone's path (caught: the carriage restarts), then solve it
  const FAIL27 = (() => { try { return new URLSearchParams(location.search).get('s27fail') === '1'; } catch (e) { return false; } })();
  function dress27(st) { const S = TR(); if (S && S.dress && world.setId === 'train') S.dress(st); }
  function seatAt(c, id, n, anim) { const a = act(c, id), m = SEAT(n); if (a && m) seatA(a, m, 0.45, anim); }
  function spawnPax(c) {
    for (const id in PAX) {
      const m = SEAT(PAX[id].seat);
      if (!m) continue;
      const a = act(c, id) || c.world.spawn(id, m, { look: PAX[id].look });
      seatA(a, m);
      if (a) a.setExpr('neutral');
    }
  }
  // the carriage at a dress: everyone on their seat (talk27 swaps passengers c and d into B2)
  function cast27(c, st) {
    const S = TR(); if (!S) return;
    spawnPax(c);
    if (st === 'talk27') {
      seatAt(c, 'passenger_c', 'B2Rba'); seatAt(c, 'passenger_d', 'B2Rbw');
      seatAt(c, 'luka', 'B4Lfw'); seatAt(c, 'chase40', 'B4Lbw'); seatAt(c, 'chase', 'B4Rbw', 'sleep');
    } else {
      seatAt(c, 'chase40', 'B2Rbw'); seatAt(c, 'luka', 'B2Lbw', st === 'inspect27' ? 'sleep' : 'sit');
      if (st === 'inspect27') standA(act(c, 'chase'), CHASE_UP); else seatAt(c, 'chase', 'B2Rba');
    }
    const ch = act(c, 'chase'); if (ch) { ch.hold(null); ch.setExpr('neutral'); ch.rig.show('phone', false); }
    const l = act(c, 'luka'); if (l) { l.habit = null; l.rig.show('santa', true); l.setExpr(st === 'inspect27' ? 'sleep' : 'tired'); }
    beardSet(c, st === 'inspect27' ? 'eyes' : 'on');
    const c4 = act(c, 'chase40'); if (c4) { c4.habit = null; c4.setExpr('tired'); }
  }

  // ---- the inspection
  function duties27() {
    const F = state.flags;
    objective.list([
      { text: 'Luka out of its path', done: !!F.s27_luka },
      { text: 'Chase (2040) out of its path', done: !!F.s27_c40 },
      { text: 'Chase out of its path', done: !!F.s27_seat },
      { text: 'Train chime (optional)', done: state.samples.includes('train') },
    ]);
  }
  // back to the start of the carriage: stopped at Boondall, the drone just in, everyone where they were
  function reset27(c) {
    GEN++;
    const F = c.state.flags;
    for (const f of S27_FLAGS) if (f !== 's27_talk') delete F[f];
    dress27('inspect27');
    const S = TR();
    if (S && S.doors) S.doors(true, 'L');
    cast27(c, 'inspect27');
    const ch = act(c, 'chase'); if (ch) { ch.place(CHASE_UP); ch.play('idle'); }
    player.frozenT = 0;
    if (c.cam.override) c.cam.override(null);
    DRONES.cover('rd27', null);
    DRONES.walls = false;
    DRONES.spawn(DID, { at: [0, 0, -9.5], face: 0, hover: 1.95, cone: { len: 1.55, half: 0.62 }, ai: false, showPath: false });
    Object.assign(I, { on: true, T: 0, op: 'board', opT: 0, k: -1, side: 0, departed: false, braking: false, stopped: false, scanned: false, toRd: false, rd: 0, rdOn: false, caught: '', ct: 0, beat: false });
    duties27();
  }
  function droneZ() { const d = DRONES.get(DID); return d ? d.z : -9.5; }
  function glideTo(z) { DRONES.goTo(DID, [0, 0, z], { speed: GLIDE_V }); I.op = 'glide'; I.opT = 0; }
  function nextStop() {
    if (I.stopped) { finish27(); return; }
    I.k++;
    if (I.k >= STOPS.length) { finish27(); return; }
    toStop();
  }
  function toStop() {   // glide to stop k, or to a polite 1.6 m short of the reindeer when it stands in the aisle ahead
    const z = STOPS[I.k];
    if (I.rdOn && I.rd > droneZ() + 0.3 && I.rd - 1.6 < z + 0.01) { I.toRd = true; glideTo(I.rd - 1.6); }
    else { I.toRd = false; glideTo(z); }
  }
  function arrived() {
    if (I.toRd) { startRdWait(); return; }
    if (I.stopped) { finish27(); return; }
    if (BAYN[I.k] === 'M') { DRONES.face(DID, [-1.4, 0, 0]); I.op = 'look'; I.opT = 0; return; }
    startScan(-1);
  }
  function startScan(side) {
    I.side = side; I.op = 'scan'; I.opT = 0; I.scanned = false;
    DRONES.face(DID, [side * 1.12, 0, STOPS[I.k]]);
  }
  function scanFlash() {
    const S = TR(), p = S && world.setId === 'train' ? world.prop('pax') : null;
    if (p && p.userData.scanBay) p.userData.scanBay(BAYN[I.k], I.side < 0 ? 'L' : 'R');
    if (!flow.skipping) sfx('drone_scan', { vol: 0.32 });
  }
  function afterStop() { if (I.stopped) finish27(); else nextStop(); }
  // the reindeer stands in the aisle: the drone waits for it to "pass" (amber, a '?' chirp), then it flops onto B1 L
  function startRdWait() {
    I.op = 'rdwait'; I.opT = 0;
    DRONES.face(DID, [0, 0, I.rd]);
    DRONES.light(DID, 'curious');
    if (!flow.skipping) sfx('drone_q', { vol: 0.6 });
    testLog('2.7 the drone waits for the reindeer at ' + I.T.toFixed(1) + ' s');
    rdBeat();
  }
  // the gag, once, as soon as nobody's in a conversation: the drone, amber, face to face with an inflatable reindeer
  function rdBeat() {
    const c = I.c;
    if (c && !I.beat && !flow.busy && !flow.cutscene && !stealth.busy && world.setId === 'train') { I.beat = true; testLog('2.7 reindeer beat'); c.playCutscene(RD_BEAT, { letterbox: false }); }
  }
  function rdFlop() {
    const r = world.prop('reindeer');
    if (r && r.userData.state) { r.userData.state('flop'); if (r.userData.wobble) r.userData.wobble(); }
    DRONES.cover('rd27', null);
    DRONES.light(DID, 'patrol');
    I.rdOn = false; I.toRd = false;
    state.flags.s27_rd_down = false;
    toStop();
  }
  function finish27() { if (I.op === 'out') return; I.op = 'out'; I.on = false; state.flags.s27_gone = true; testLog('2.7 inspection over at ' + I.T.toFixed(1) + ' s (stop ' + (BAYN[I.k] || '-') + ')'); }
  function catchIt(who) {
    I.caught = who; I.ct = 1.0;
    DRONES.face(DID, who); DRONES.light(DID, 'curious');
    sfx('drone_q', { vol: 0.8 });
    testLog('2.7 caught ' + who + ' at ' + I.T.toFixed(1) + ' s (' + I.op + ' ' + (BAYN[I.k] || '-') + ')');
  }
  function tick27(dt) {
    if (!I.on || stealth.busy || world.setId !== 'train') return;
    const S = TR();
    if (!S) return;
    if (I.caught) {
      I.ct -= dt;
      if (I.ct <= 0) { const who = I.caught; I.caught = ''; I.on = false; DRONES.light(DID, 'escort'); stealth.capture(who, { drone: DID }); }
      return;
    }
    I.T += dt; I.opT += dt;
    if (!I.departed && I.T >= T_DEPART) { I.departed = true; S.travel.depart(); }
    if (!I.braking && I.T >= T_BRAKE) { I.braking = true; S.travel.arrive('NUDGEE', 110); }
    if (I.braking && !I.stopped && S.travel.state === 'stopped') { I.stopped = true; S.doors(true, 'L'); }
    const d = DRONES.get(DID);
    if (!d) return;
    switch (I.op) {
      case 'board': if (I.T >= T_SCAN0) nextStop(); break;
      case 'glide': if (d.st !== 'goto') arrived(); break;
      case 'rdwait':
        if (I.opT >= RD_WAIT) rdFlop();
        else { if (I.opT >= 3.2 && d.light === 'curious') DRONES.light(DID, 'patrol'); if (!I.beat && I.opT < RD_WAIT - 3) rdBeat(); }
        break;
      case 'look': if (I.opT >= LOOK_T) afterStop(); break;
      case 'scan':
        if (!I.scanned && I.opT >= 0.45) { I.scanned = true; scanFlash(); }
        if (I.opT >= SCAN_T) { if (I.side < 0 && !I.stopped) startScan(1); else afterStop(); }
        break;
    }
    // the cone: whoever is in the bay side it scans, or in the aisle ahead of it (not while a conversation is on)
    if (I.op === 'glide' || I.op === 'scan' || I.op === 'look') {
      if (flow.busy || flow.cutscene) return;
      for (let i = 0; i < SEEN.length; i++) if (DRONES.inCone(DID, SEEN[i])) { catchIt(SEEN[i]); break; }
    }
  }
  const RD_BEAT = [
    { do: (c) => { if (!sk(c)) c.cam.shot(glideCam([0.5, 1.6, -3.7], [0.0, 1.35, -0.1], 42, [[0.42, 1.58, -3.35], null, 40], 3)); } },
    { wait: 2.6 },
  ];
  function start27(c) {
    I.c = c;
    listenSamples();
    stealth.begin({
      safeRoom: false, escortAfter: 9, forgetAfter: 2,
      checkpoints: [{ id: 'carriage', box: [-1.6, -11.2, 1.6, 11.2], at: { chase: CHASE_UP } }],
      onRetry: () => { if (c.flow.sceneId === '2.7') reset27(c); },
    });
    I.on = true; I.T = 0; I.op = 'board'; I.opT = 0;
    duties27();
    if (!I.upd) I.upd = scope('2.7', tick27, () => { I.upd = null; I.on = false; I.c = null; });
  }
  function end27(c) {
    I.on = false;
    stealth.end();
    DRONES.walls = true;
    DRONES.cover('rd27', null);
    player.frozenT = 0;
    c.cam.override(null);
  }
  // hotspot actions (Chase): every one first walks him there (autoplay triggers them from anywhere)
  const F27 = () => state.flags;
  async function wakeLuka(c) {
    await c.runSteps([
      { move: 'chase', to: [0.12, 0, 4.0] }, { face: 'chase', to: 'luka', dur: 0.25 },
      { do: (cc) => { if (!sk(cc)) cc.cam.shot(glideCam([0.25, 1.5, 2.6], [-0.7, 1.1, 4.3], 46, [[0.22, 1.48, 2.8], null, 44], 4)); } },
      { act: [['chase', 'tap', { dur: 1.0, loop: false }]] },
      { wait: 0.8 },
      { do: (cc) => { beardSet(cc, 'chin'); const l = act(cc, 'luka'); if (l) { l.play('sit', { h: 0.45 }); l.setExpr('stunned'); } } },
      { wait: 0.5 },
      { do: (cc) => { beardSet(cc, 'on'); glanceAt(cc, 'luka', 'chase', 1.0); } },
      { act: [['chase', 'point']] },
      { wait: 0.7 },
      { do: (cc) => { const l = act(cc, 'luka'); if (l) { l.setExpr('tired'); l.play('nod', { dur: 0.8, loop: false }); } } },
      { wait: 0.5 },
    ]);
    F27().s27_luka_up = true;
    const l = act(c, 'luka');
    if (l) {
      standA(l, [-0.62, 0, 4.4, 0]);
      const m = SEAT('B4Lfw');
      route(c, 'luka', [[0.0, 0, 4.75], [0.0, 0, 6.95], [-0.7, 0, 7.0], m], { speed: 1.5, then: (a) => { seatA(a, m); a.setExpr('tired'); F27().s27_luka = true; duties27(); } });
    }
    const ch = act(c, 'chase'); if (ch) ch.play('idle');
    await c.cam.release(0.4);
  }
  async function borrowReindeer(c) {
    await c.runSteps([
      { move: 'chase', to: [0.1, 0, 5.15] }, { face: 'chase', to: 'reindeer_man', dur: 0.25 },
      { do: (cc) => { if (!sk(cc)) cc.cam.shot(glideCam([0.3, 1.52, 6.65], [-0.65, 1.15, 5.15], 50, [[0.28, 1.5, 6.5], null, 48], 4)); } },
      { act: [['chase', 'gesture']] },
      { wait: 1.0 },
      { act: [['reindeer_man', 'nod', { dur: 1.0, loop: false }]] },
      { do: (cc) => { const m = act(cc, 'reindeer_man'); if (m) m.setExpr('happy'); } },
      { wait: 0.9 },
      { do: (cc) => { const r = cc.world.prop('reindeer'); if (r && r.userData.state) { r.userData.state('held', null, 'chase'); if (!sk(cc) && r.userData.wobble) r.userData.wobble(); } } },
      { act: [['chase', 'idle']] },
      { wait: 0.4 },
    ]);
    F27().s27_rd = true; F27().s27_rd_held = true;
    await c.cam.release(0.4);
  }
  async function putReindeer(c, at) {
    const z = at === 'rdeer_aisle_B1' ? 1.95 : 0.0;
    await c.runSteps([{ move: 'chase', to: [0.0, 0, z + 0.85] }, { face: 'chase', to: PI, dur: 0.25 }]);
    const r = c.world.prop('reindeer');
    if (r && r.userData.state) { r.userData.state('aisle', at); if (!sk(c) && r.userData.wobble) r.userData.wobble(); }
    F27().s27_rd_held = false; F27().s27_rd_down = true;
    I.rd = z; I.rdOn = true;
    RD_BOX[0] = -0.4; RD_BOX[1] = z - 0.35; RD_BOX[2] = 0.4; RD_BOX[3] = z + 0.35;
    DRONES.cover('rd27', RD_BOX);
    const ch = act(c, 'chase'); if (ch) ch.play('idle');
  }
  // a passenger gives up a B4 seat: "Only if you're sure." Chase steps back into the vestibule to let them out; they go
  // and sit in B3 (the free front pair); `who` (Chase (2040)) then comes up the aisle from B2 and takes the seat
  async function swapSeat(c, pax, standAt, toSeat, who) {
    const a = act(c, pax);
    await c.runSteps([
      { move: 'chase', to: standAt }, { face: 'chase', to: pax, dur: 0.25 },
      { do: (cc) => { if (!sk(cc)) cc.cam.shot(glideCam([0.05, 1.55, 6.15], [a ? a.pos.x * 0.55 : 0, 1.1, 8.1], 50, [[0.05, 1.53, 6.35], null, 48], 4)); } },
      { act: [['chase', 'gesture']] },
      { wait: 0.9 },
      { do: (cc) => glanceAt(cc, pax, 'chase', 2.2) },
      say(pax, 'Only if you’re sure.', { name: 'PASSENGER' }),
      { act: [['chase', 'nod', { dur: 0.8, loop: false }]] },
      { move: 'chase', to: [0.0, 0, 9.3] }, { face: 'chase', to: PI, dur: 0.25 },
    ]);
    const g = GEN, m = SEAT(toSeat);
    let gone = Promise.resolve();
    if (a && m) {
      standA(a, [Math.sign(a.pos.x) * 0.6, 0, a.pos.z, PI]);
      gone = route(c, pax, [[0.0, 0, 7.95], [0.0, 0, 5.75], [m[0] * 0.92, 0, 5.5], m], { speed: 1.35, then: (b) => seatA(b, m) });
    }
    if (who === 'chase40') {
      gone.then(() => {
        const c4 = act(c, 'chase40'), m4 = SEAT('B4Lbw');
        if (!c4 || !m4 || g !== GEN || c.flow.sceneId !== '2.7') return;
        standA(c4, [0.62, 0, 4.4, PI]);
        route(c, 'chase40', [[0.0, 0, 4.5], [0.0, 0, 7.9], [-0.62, 0, 8.25], m4], { speed: 1.35, then: (b) => { seatA(b, m4); F27().s27_c40 = true; duties27(); } });
      });
    }
    await c.cam.release(0.4);
  }
  async function sitDown(c) {
    const m = SEAT('B4Rbw');
    await c.runSteps([{ move: 'chase', to: [0.05, 0, 8.25] }, { face: 'chase', to: H, dur: 0.2 }]);
    const ch = act(c, 'chase');
    if (ch && m) seatA(ch, m);
    player.frozen(1e6);
    F27().s27_seat = true; duties27();
    const S = TR(), an = S && S.anchors.s27_carriage_wide;
    if (an) c.cam.override('fixed', { pos: an.from.slice(), look: an.at.slice(), fov: an.fov });
  }
  function standUp(c) {
    const ch = act(c, 'chase');
    if (ch) { standA(ch, [0.05, 0, 8.25, PI]); }
    player.frozenT = 0;
    F27().s27_seat = false; duties27();
    c.cam.override(null);
  }

  SCENES['2.7'] = {
    title: 'Shorncliffe Line', set: 'sandgate', env: 'gates27', time: '16:30', place: 'Shorncliffe Line',
    playable: ['chase'], swap: false, music: null,
    hud: { noService: false, quiet: '19:28:00', samples: true, bars: null },
    spawn: { chase40: 's27_gate_c40', chase: 's27_gate_chase', luka: 's27_gate_luka' },
    hotspots: [
      // the tea point: the save point (spec 13.1)
      { id: 'h27_kettle', at: [-1.0, 1.1, -0.92], r: 0.8, verb: 'Use', kettle: true, when: (s) => !s.flags.s27_seat },
      // the Train chime sample (the three-note door chime), at the middle doors
      { id: 'h27_chime', at: [-0.95, 0, 0.45], r: 0.75, only: 'chase', sample: 'train', when: (s) => !s.flags.s27_seat },
      // Luka, dozing, the beard over his eyes: talk him awake (he moves to B4)
      { id: 'h27_luka', at: 'luka', r: 1.25, only: 'chase', verb: 'Talk', when: (s) => !s.flags.s27_luka_up && !s.flags.s27_rd_held, do: (c) => wakeLuka(c) },
      // the man taking the giant inflatable reindeer to his grandkids
      { id: 'h27_pax_b', at: 'reindeer_man', r: 1.25, only: 'chase', verb: 'Talk', when: (s) => !s.flags.s27_rd, do: (c) => borrowReindeer(c) },
      // stand it in the aisle (the middle vestibule, or B1)
      { id: 'h27_put', at: [0, 0, 0.0], r: 0.95, only: 'chase', verb: 'Put it down', when: (s) => !!s.flags.s27_rd_held, do: (c) => putReindeer(c, 'rdeer_aisle_M') },
      { id: 'h27_put_b1', at: [0, 0, 1.95], r: 0.6, only: 'chase', verb: 'Put it down', when: (s) => !!s.flags.s27_rd_held, do: (c) => putReindeer(c, 'rdeer_aisle_B1') },
      // two passengers in B4: swap seats (one gives Chase (2040) hers, one gives Chase his)
      { id: 'h27_pax_d', at: 'passenger_d', r: 1.2, only: 'chase', verb: 'Swap seats', when: (s) => !s.flags.s27_pax_d && !s.flags.s27_rd_held,
        do: async (c) => { F27().s27_pax_d = true; await swapSeat(c, 'passenger_d', [-0.08, 0, 7.75], 'B3Rfa', 'chase40'); } },
      { id: 'h27_pax_c', at: 'passenger_c', r: 1.2, only: 'chase', verb: 'Swap seats', when: (s) => !s.flags.s27_pax_c && !s.flags.s27_rd_held,
        do: async (c) => { F27().s27_pax_c = true; await swapSeat(c, 'passenger_c', [0.08, 0, 7.75], 'B3Lfa', 'chase'); } },
      // his new seat, and getting up again
      { id: 'h27_sit', at: [1.12, 0, 8.29], r: 1.2, only: 'chase', verb: 'Sit', when: (s) => !!s.flags.s27_pax_c && !s.flags.s27_seat && !s.flags.s27_rd_held && !paxIn('passenger_c', 8.29), do: (c) => sitDown(c) },
      { id: 'h27_stand', at: [1.12, 0, 8.29], r: 0.6, only: 'chase', verb: 'Stand up', when: (s) => !!s.flags.s27_seat && !s.flags.s27_gone, do: (c) => standUp(c) },
    ],
    steps: [
      ['cutscene', '2.7_board'],
      ['cutscene', '2.7_inspect'],
      ['control', 'chase'],
      ['objective', 'Ticket inspection.'],
      ['do', (c) => start27(c)],
      ['roam', {
        until: 's27_gone',
        async auto(c) {
          const T = (id) => c.hotspots.trigger(id), F = c.state.flags, gone = () => c.flow.sceneId !== '2.7';
          const at = (s) => { const a = act(c, 'chase'); testLog('2.7 auto ' + s + ' at ' + I.T.toFixed(1) + ' s' + (a ? ' · ' + a.pos.x.toFixed(2) + ',' + a.pos.z.toFixed(2) : '')); };
          for (let tries = 0; tries < 3 && !gone(); tries++) {
            const n0 = stealth.captures || 0, caught = () => (stealth.captures || 0) > n0 || stealth.busy;
            await until(() => !stealth.busy || gone());
            if (FAIL27 && tries === 0) {   // straight down the aisle at it
              const a = act(c, 'chase'); c.player.enabled = true;
              if (a) a.moveTo([0, 0, -6.6], { collide: true });
              await until(() => caught() || gone());
              at('caught (the fail test)');
              await until(() => (!stealth.busy && I.on && I.T > 0) || gone());
              at('the carriage restarted');
              continue;
            }
            await T('h27_luka'); at('woke Luka');
            await until(() => F.s27_luka || caught() || gone());
            if (!caught()) { await T('h27_pax_b'); at('reindeer'); }
            if (!caught()) { await T('h27_put'); at('reindeer down'); }
            if (!caught()) { await T('h27_chime'); at('chime'); }
            if (!caught()) { await T('h27_pax_d'); at('swap d'); }
            if (!caught()) { await T('h27_pax_c'); at('swap c'); }
            await until(() => !paxIn('passenger_c', 8.29) || caught() || gone());
            if (!caught()) { await T('h27_sit'); at('sat'); }
            if (!caught() && (!F.s27_luka || !F.s27_seat)) console.error('TWO 2.7: not everyone is out of its path (' + [F.s27_luka, F.s27_c40, F.s27_seat].join(',') + ')');
            await until(() => F.s27_gone || caught() || gone());
            if (F.s27_gone || gone()) break;
            console.error('TWO 2.7: autoplay was caught by the drone (try ' + (tries + 1) + ')');
          }
        },
      }],
      ['do', (c) => end27(c)],
      ['objective', null],
      ['cutscene', '2.7_leave'],
      ['cutscene', '2.7_talk'],
    ],
    grants: { flags: { santa: true, chip_off: true, s27_luka: true, s27_c40: true, s27_seat: true, s27_gone: true, s27_talk: true }, samples: ['train'], quiet: '19:28:00', noService: false },
  };
  // is `id` still sitting near z (a passenger who hasn't left the seat yet)?
  function paxIn(id, z) { const a = world.actor(id); return !!(a && Math.abs(a.pos.z - z) < 0.3 && Math.abs(a.pos.x) > 0.9); }

  // Cutscene — "2.7_board."
  CUTSCENES['2.7_board'] = [
    { do: (c) => {
      for (const f of S27_FLAGS) delete c.state.flags[f];
      GEN++;
      const S = SG(); if (S && S.dress && world.setId === 'sandgate') S.dress('gates27');
      const g = P(c, 'fare_gates'); if (g) { g.userData.reader(2, 'idle'); g.userData.open(2, false); }
      const c4 = act(c, 'chase40'), ch = act(c, 'chase'), l = act(c, 'luka');
      if (c4) { c4.place('s27_gate_c40'); c4.play('idle'); c4.setExpr('tired'); c4.hold(null); }
      if (ch) { ch.place('s27_gate_chase'); ch.play('idle'); ch.setExpr('neutral'); ch.hold(null); }
      if (l) { l.place('s27_gate_luka'); l.play('idle'); l.setExpr('tired'); l.rig.show('santa', true); }
      beardSet(c, 'on');
    } },
    { fade: 'out', dur: 0 },
    // [INSERT · the station gate] Chase (2040) taps Jordan's Christmas bonus card. Three fares. Balance: $4.
    { do: (c) => { if (!sk(c)) c.cam.shot(glideCam([2.45, 1.62, -15.1], [0.8, 1.38, -11.9], 44, [[2.25, 1.6, -14.75], null, 42], 7)); } },
    { fade: 'in', dur: 0.8 },
    { wait: 1.2 },
    { hold: 'chase40', prop: BONUS_CARD },
    { act: [['chase40', 'give', { dur: 1.6, loop: false }]] },
    { do: (c) => { if (!sk(c)) c.cam.shot(glideCam([0.55, 1.42, -12.45], [0.9, 1.05, -13.0], 30, [[0.58, 1.4, -12.52], null, 26], 4.5)); } },
    { wait: 0.7 },
    { sfx: 'tap_pay', vol: 0.7 },
    { do: (c) => { const g = P(c, 'fare_gates'); if (g) g.userData.reader(2, 'tap3'); } },
    { wait: 3.0 },
    { do: (c) => { const g = P(c, 'fare_gates'); if (g) { g.userData.reader(2, 'ok'); g.userData.open(2, true); } } },
    { sfx: 'accepted', vol: 0.5 },
    { hold: 'chase40', prop: null },
    { do: (c) => {
      route(c, 'chase40', [[1.8, 0, -12.6], [1.8, 0, -14.6], [1.6, 0, -15.6]]);
      later(c, 0.6, () => route(c, 'chase', [[1.8, 0, -12.4], [1.8, 0, -14.6], [1.2, 0, -15.5]]));
      later(c, 1.2, () => route(c, 'luka', [[1.8, 0, -12.2], [1.8, 0, -14.5], [2.2, 0, -15.5]]));
      if (!sk(c)) c.cam.shot(glideCam([3.8, 2.4, -10.6], [1.4, 1.2, -14.2], 46, [[3.4, 2.3, -11.0], [1.4, 1.1, -15.0], 46], 6));
    } },
    { wait: 2.6 },
    { fade: 'out', dur: 0.5 },
    // the carriage at Sandgate: the platform outside, the doors open
    { set: 'train', env: 'platform27', spawn: { chase40: 's27_c40', chase: 's27_chase', luka: 's27_luka_doze' } },
    { do: (c) => { dress27('board27'); const S = TR(); if (S) S.travel.stopNow('SANDGATE'); cast27(c, 'board27'); } },
    { do: (c) => { if (!sk(c)) c.cam.shot(glideCam([0.0, 2.05, 10.4], [0.0, 1.05, -2.0], 48, [[0.0, 1.95, 9.2], null, 46], 8)); } },
    { fade: 'in', dur: 0.6 },
    { wait: 0.8 },
    { do: (c) => { const p = P(c, 'pids'); if (p && p.userData.pulse) p.userData.pulse(); } },
    say('train', 'This train is running three minutes late, for your safety.', { tag: 'on the PA' }),
    // the Chases side by side, the passenger opposite
    aPush('train', 's27_board_three', 0.15, 9),
    { do: (c) => glanceAt(c, 'chase', 'chase40', 2.0) },
    { wait: 0.6 },
    say('chase', 'Is Cross River Rail finished?', { expr: 'talk' }),
    CLOSE('chase40', { dist: 0.85, yaw: 0.4, fov: 34, dy: -0.04 }),
    slow('chase40', 'Don’t.', { expr: 'tired' }),
    // (A passenger opposite leans in to Chase (2040), looking at Chase.)
    { do: (c) => { closeOn(c, 'passenger', { dist: 0.85, yaw: -0.3, fov: 38, dur: 5, push: 0.15 }); glanceAt(c, 'passenger', 'chase', 3.2); } },
    { wait: 0.6 },
    say('passenger', 'Is that your son?'),
    // "Nephew." "Brother." "Nephew." — over the passenger's shoulder, the two Chases side by side
    aPush('train', 's27_passenger_ots', 0.18, 8),
    say('chase40', 'Nephew.', { expr: 'tired' }),
    say('chase', 'Brother.', { expr: 'smug' }),
    { wait: 0.3 },
    slow('chase40', 'Nephew.', { expr: 'still' }),
    { wait: 0.5 },
    // the doors chime and close; the platform slides away
    aPush('train', 's27_platform_wide', 0.3, 7),
    { do: (c) => { const S = TR(); if (S) S.doors(false, 'L'); } },
    { wait: 1.8 },
    { do: (c) => { const S = TR(); if (S) S.travel.depart(); } },
    { wait: 2.6 },
    { fade: 'out', dur: 0.8 },
  ];

  // the PLAY's opening: two stations in (Deagon went by), stopped at Boondall; a Courtesy Drone boards at the far end
  CUTSCENES['2.7_inspect'] = [
    { do: (c) => { reset27(c); I.on = false; DRONES.spawn(DID, { at: [-3.2, 0, -9.5], face: H, hover: 1.9, cone: { len: 1.55, half: 0.62 }, ai: false, showPath: false }); } },
    { do: (c) => { if (!sk(c)) c.cam.shot(glideCam([1.05, 1.82, -8.8], [-1.9, 1.78, -9.65], 50, [[1.0, 1.8, -8.95], [-0.9, 1.8, -9.6], 48], 4)); } },
    { fade: 'in', dur: 0.7 },
    { do: (c) => DRONES.goTo(DID, [0, 0, -9.5], { speed: 1.2 }) },
    { do: (c) => DRONES.face(DID, [0, 0, 0]) },
    aPush('train', 's27_drone_boards', 0.4, 6),
    { wait: 1.6 },
    // Chase is up, watching it; Luka has dozed off with the beard over his eyes
    { do: (c) => closeOn(c, 'chase', { dist: 1.0, yaw: 0.3, fov: 34, dur: 4 }) },
    { expr: [['chase', 'worried']] },
    { wait: 1.6 },
    aPush('train', 's27_luka_doze', 0.08, 4),
    { wait: 1.7 },
    { do: (c) => { if (!sk(c)) c.cam.shot(glideCam([0.3, 1.9, 1.4], [-0.3, 1.4, -8.0], 44, [[0.3, 1.85, 0.6], null, 42], 4)); } },
    { do: (c) => DRONES.face(DID, [-1.12, 0, -7.65]) },
    { wait: 1.2 },
  ];

  // after the inspection: the train has stopped at Nudgee; the drone leaves by the nearest platform-side door
  CUTSCENES['2.7_leave'] = [
    { do: (c) => {
      const ch = act(c, 'chase');
      if (ch && c.state.flags.s27_seat) { const m = SEAT('B4Rbw'); seatA(ch, m); }
      const S = TR(); if (S && S.travel.state !== 'stopped') S.travel.stopNow('NUDGEE');
      if (S) S.doors(true, 'L');
      const z = droneZ(), dz = Math.abs(z) < Math.abs(z - 9.5) ? 0 : 9.5;
      I.exitZ = dz;
      if (!sk(c)) {
        if (dz > 0) c.cam.shot(glideCam([0.55, 1.9, 0.9], [-0.7, 1.4, 9.0], 46, [[0.5, 1.88, 1.4], null, 45], 6));
        else c.cam.shot(glideCam([0.55, 1.9, 6.4], [-0.7, 1.45, -1.0], 46, [[0.5, 1.88, 5.9], null, 45], 6));
      }
    } },
    { do: (c) => DRONES.goTo(DID, [0, 0, I.exitZ || 0], { speed: 1.6 }) },
    { do: (c) => DRONES.goTo(DID, [-3.4, 0, I.exitZ || 0], { speed: 1.3 }) },
    { do: (c) => DRONES.remove(DID) },
    { wait: 0.4 },
    { do: (c) => { const S = TR(); if (S) S.doors(false, 'L'); } },
    { wait: 1.6 },
    { do: (c) => { const S = TR(); if (S) S.travel.depart(); } },
    { wait: 1.2 },
    { fade: 'out', dur: 0.9 },
  ];

  // Cutscene — "2.7_talk." After the drone leaves. Chase has fallen asleep against the window with his earbud in. Luka and
  // Chase (2040) sit facing each other. One locked two-shot, side-on, the storm moving across the windows behind them.
  CUTSCENES['2.7_talk'] = [
    { do: (c) => {
      DRONES.clear();
      dress27('talk27');
      cast27(c, 'talk27');
      const r = c.world.prop('reindeer'); if (r && r.userData.state) r.userData.state('flop');
      c.state.flags.s27_talk = true;
    } },
    aPush('train', 's27_chase_asleep', 0.12, 6),
    { fade: 'in', dur: 1.2 },
    { wait: 2.8 },
    // [the locked two-shot]
    { do: (c) => { if (!sk(c)) { const an = TR().anchors.s27_talk_two; c.cam.shot({ shot: 'CAM', pos: an.from.slice(), look: an.at.slice(), fov: an.fov }); } } },
    { wait: 1.2 },
    say('chase40', 'Can I ask you something?', { expr: 'still' }),
    say('luka', 'Yeah.', { expr: 'neutral' }),
    say('chase40', 'Why’d you go back in?'),
    say('luka', 'I haven’t yet.', { expr: 'worried' }),
    slow('chase40', 'You will. ^ Why?'),
    { wait: 0.6 },
    slow('luka', '…Because someone was in there.', { expr: 'sad' }),
    say('chase40', 'There’s always someone in there.'),
    say('luka', 'Then I’ll always go back in.', { expr: 'determined' }),
    slow('chase40', 'Yeah. ^ That’s the problem.', { expr: 'tired' }),
    // (Thunder. The carriage lights flicker.)
    { do: (c) => { const S = TR(); if (S && S.lightning) S.lightning(1); } },
    { wait: 1.4 },
    slow('chase40', 'You left me. ^ You know that? You don’t get to be a hero AND leave.', { expr: 'tearful' }),
    say('luka', 'I didn’t leave. I died.', { expr: 'sad' }),
    slow('chase40', 'Same thing, from where I was standing.'),
    // (Long beat, 3 s.)
    { wait: 3 },
    slow('luka', 'Then tell me how not to.', { expr: 'sad' }),
    // CHASE (2040) (looking out of the window)
    { do: (c) => glanceAt(c, 'chase40', [-1.6, 0, 8.6], 7) },
    { wait: 1.1 },
    slow('chase40', '…Let someone else carry a box.', { expr: 'still' }),
    { wait: 1.2 },
    { do: (c) => { const p = P(c, 'pids'); if (p && p.userData.pulse) p.userData.pulse(); const S = TR(); if (S) S.travel.arrive('FORTITUDE VALLEY', 160); } },
    say('train', 'Next station: Fortitude Valley. ^ Quiet Hours are in effect. ^ Please whisper.', { tag: 'on the PA' }),
    { wait: 1.0 },
    { fade: 'out', dur: 1.2 },
    { do: (c) => c.world.prebuild('valley') },
  ];
})();
