// ============================================================ CONTENT: 3.1 ("Mandatory Fun") and 3.2 ("Spotless": L12, L21, L30, the roof)
// BUILD_PROMPT §8 3.1–3.2. Every line is final and word for word; '^' = a beat. Shot tags are quoted in the comments.
// Sets: hq_atrium (3.1: docs/sets/hq_atrium.md, src/19-set-hq-atrium.js), hq_floors (3.2: L12 / L21 / L30 side by side,
// one floor dressed at a time: docs/sets/hq_floors.md, src/20-set-hq-floors.js), hq_roof (the 3.2 roof cutscene, dress
// storm32). Every mark / anchor / prop API used here is the set's.
// 3.1: 3.1_tower (the crane up Optus Tower, the atrium, the Door Drone), a short roam to the lanyard desk (3.1_desk), the
//   Fun Monitor arrives (3.1_monitor), Blend In and Secret Santa (49-mg-blend-in.js: both run as roam + systems over the
//   live set; HR's lines, the four recipients' lines, "Are you having fun?" and Chase (2040)'s call-outs are said by
//   that file), 3.1_nadia (the fourth and last nephew; Nadia's lanyard), 3.1_lift (the hold-music muzak; nobody says
//   anything). Chase (2040)'s chip is off at the door and he turns it on for Secret Santa (flag chip_off cleared).
// 3.2 is one scene with three floors as sections (SCENE_ORDER keeps one entry): 3.2_l12 (the mirror floor, hint 5, the
//   PA), the L12 roam (the shelf pair "Hold this", the examines, the guitars, the headphones, the trampoline bin, the
//   stairs), 3.2_l21 (the PA), the L21 roam (stealth-light: the 'old' trail in Chip View, the jack, the kettle cord, the
//   Wiring and Hack mini-games (42 / 50), the cooling valves pair, the hatch), 3.2_climb (up the ladder; L30's hangar;
//   the PA), the L30 roam (stealth, the hard version: lures at S1 / P1 / P2, Luka pushes M1 to blind the sentinel, Chase
//   (2040)'s patrol paths), 3.2_lift30 (MANAGER ONLY; ROOF ACCESS — SANTA), then the roof (3.2_roof, storm, QUIET IN
//   00:17:00 under their feet; Luka drops the hat and beard on the sleigh: flag santa off).
// The Manager speaks only through the PA here (speaker 'manager', tagged 'on the PA'), one line per floor, his motif
//   under each. Hint 5 is Luka's one line at the L12 doors; nobody comments on it.
// Continue: 3.1 restarts from step 0 (the set's AUTO dress resets the atrium). 3.2 has one kettle (L21's tea point):
//   a save there resumes on L21 with the jack / cord / valves / hatch restored from the flags (setup32); everything
//   else re-dresses from the flags at step 0.
// Autoplay solves every roam on foot through the real hotspots (walk / until are per-tick: wait and waitUntil resolve
//   at once while a cutscene is being skipped).
(() => {
  const PI = Math.PI, H = PI / 2;
  const say = (id, text, o) => Object.assign({ say: id, text }, o);
  const sk = (c) => c.flow.skipping;
  const P = (c, n) => c.world.prop(n);
  const ud = (c, n) => { const o = c.world.prop(n); return o ? o.userData : null; };
  const act = (c, id) => c.world.actor(id);
  const V1 = new THREE.Vector3(), V2 = new THREE.Vector3();
  const put = (id, at) => ({ place: id, at });
  const log = (m) => { if (typeof testLog === 'function') testLog(m); };
  // one tick later (even while skipping)
  const nextTick = () => new Promise((res) => { const f = () => { removeUpdate(f); res(); }; addUpdate(f); });
  // autoplay's waits: checked every tick, even while a cutscene is being skipped (waitUntil resolves at once then)
  const until = (fn, cap = 60) => new Promise((res) => { let t = 0; const f = (dt) => { t += dt; if (fn() || t > cap) { removeUpdate(f); res(); } }; addUpdate(f); });
  // fn after `sec` of game time (at once while skipping); never into another scene
  function later(c, sec, fn) {
    const sid = c.flow.sceneId;
    if (c.flow.skipping || !(sec > 0)) { fn(); return; }
    let t = 0;
    const f = (dt) => { t += dt; if (flow.sceneId !== sid) { removeUpdate(f); return; } if (t >= sec || flow.skipping) { removeUpdate(f); fn(); } };
    addUpdate(f);
  }
  // a tween on the game clock, snapped at once while skipping or when the scene changes (no allocation per tick)
  function tween(c, dur, fn) {
    const sid = c.flow.sceneId;
    if (c.flow.skipping || !(dur > 0)) { fn(1); return; }
    let t = 0;
    const f = (dt) => { t = Math.min(1, t + dt / dur); if (flow.sceneId !== sid || flow.skipping) t = 1; fn(t * t * (3 - 2 * t)); if (t >= 1) removeUpdate(f); };
    addUpdate(f);
  }
  // a scene-scoped updater: runs while the scene is `id`, removes itself (and calls off) as soon as it isn't
  function scope(id, fn, off) {
    const f = (dt) => { if (flow.sceneId !== id) { removeUpdate(f); if (off) off(); return; } fn(dt); };
    addUpdate(f);
    return f;
  }
  // an anchor's lens drifting `push` m toward its subject (never quite still); `card` rides on it
  function lens(sid, n, o = {}) {
    const S = SETS[sid], a = S && S.anchors && S.anchors[n];
    if (!a) { console.warn('TWO 3.1-3.2: no anchor ' + sid + '.' + n); return { wait: 0 }; }
    const f = a.from, t = a.at, dx = t[0] - f[0], dy = t[1] - f[1], dz = t[2] - f[2], L = Math.hypot(dx, dy, dz) || 1, k = (o.push ?? 0.12) / L;
    const fov = o.fov ?? a.fov ?? 40;
    const ty = t[1] + (o.tilt || 0);
    const s = { shot: 'CAM', pos: f.slice(), look: [t[0], ty, t[2]], fov, to: { pos: [f[0] + dx * k, f[1] + dy * k + (o.rise || 0), f[2] + dz * k], look: [t[0], ty, t[2]], fov: o.fovTo ?? fov }, dur: o.dur ?? 6, ease: o.ease || 'linear' };
    if (o.card) s.card = o.card;
    return s;
  }
  const A31 = (n, o) => lens('hq_atrium', n, o), A32 = (n, o) => lens('hq_floors', n, o), AR32 = (n, o) => lens('hq_roof', n, o);
  // a move from one anchor's lens to another's
  function glide(sid, a, b, dur, ease, o = {}) {
    const S = SETS[sid].anchors, A = S[a], B = S[b];
    return { shot: 'CAM', pos: A.from.slice(), look: A.at.slice(), fov: o.fov ?? A.fov, to: { pos: B.from.slice(), look: B.at.slice(), fov: o.fovTo ?? B.fov }, dur, ease };
  }
  const cam = (pos, look, fov, to, dur, o) => Object.assign({ shot: 'CAM', pos, look, fov, to: to ? { pos: to[0] || pos, look: to[1] || look, fov: to[2] ?? fov } : undefined, dur: dur || 6, ease: 'linear' }, o);
  // a computed close-up: the lens `dist` m from his eyes, `yaw` rad off his facing (+ = toward his left), pushing in
  // `push` m over `dur` s. Read at step time (faces placed under the cut); nothing while skipping.
  function closeOn(c, id, o = {}) {
    if (sk(c)) return;
    const a = act(c, id);
    if (!a) return;
    c.ui.card(null);
    a.eyePos(V1);
    const ry = (o.ry ?? a.rotY) + (o.yaw || 0), d = o.dist || 0.95, pu = o.push ?? 0.1, ly = V1.y - 0.05 + (o.ly || 0);
    const sx = Math.sin(ry), sz = Math.cos(ry), y = V1.y + (o.dy ?? -0.02), f = o.fov || 36;
    c.cam.shot({ shot: 'CAM', pos: [V1.x + sx * d, y, V1.z + sz * d], look: [V1.x, ly, V1.z], fov: f,
      to: { pos: [V1.x + sx * (d - pu), y + (o.rise || 0), V1.z + sz * (d - pu)], look: [V1.x, ly, V1.z], fov: o.fovTo || f }, dur: o.dur || 7, ease: 'linear' });
  }
  const CLOSE = (id, o) => ({ do: (c) => { closeOn(c, id, o); } });
  // a close on `id` from whichever side of his face (±mag off his facing) keeps `from` furthest out of the frame
  function closeAway(c, id, from, o = {}) {
    const a = act(c, id), b = act(c, from);
    if (!a || !b) { closeOn(c, id, o); return; }
    const m = o.mag || 0.6, d = o.dist || 0.95;
    let best = m, bestA = -1;
    for (const y of [m, -m]) {
      const ry = a.rotY + y, cx = a.pos.x + Math.sin(ry) * d, cz = a.pos.z + Math.cos(ry) * d;
      const ux = a.pos.x - cx, uz = a.pos.z - cz, vx = b.pos.x - cx, vz = b.pos.z - cz;
      let ang = Math.acos(Math.max(-1, Math.min(1, (ux * vx + uz * vz) / (Math.hypot(ux, uz) * Math.hypot(vx, vz) || 1))));
      if (c.world.lineClear && !c.world.lineClear(a.pos.x, a.pos.z, cx, cz, 0.05)) ang -= 10;   // never a lens inside the furniture
      if (ang > bestA) { bestA = ang; best = y; }
    }
    closeOn(c, id, Object.assign({}, o, { yaw: best }));
  }
  const AWAY = (id, from, o) => ({ do: (c) => { closeAway(c, id, from, o); } });
  // over `over`'s shoulder onto `on`'s face (computed at step time; the lens stays clear of both heads)
  function ots(c, on, over, o = {}) {
    if (sk(c)) return;
    const a = act(c, on), b = act(c, over);
    if (!a || !b) return;
    a.eyePos(V1); b.eyePos(V2);
    const dx = V1.x - V2.x, dz = V1.z - V2.z, L = Math.hypot(dx, dz) || 1, ux = dx / L, uz = dz / L, sd = o.side ?? 1;
    const back = o.back ?? 0.75, off = o.off ?? 0.42;
    const px = V2.x - ux * back + uz * off * sd, pz = V2.z - uz * back - ux * off * sd, py = V2.y + (o.dy ?? 0.06);
    const f = o.fov || 40, pu = o.push ?? 0.08;
    c.cam.shot({ shot: 'CAM', pos: [px, py, pz], look: [V1.x, V1.y - 0.06, V1.z], fov: f,
      to: { pos: [px + ux * pu, py, pz + uz * pu], look: [V1.x, V1.y - 0.06, V1.z], fov: f }, dur: o.dur || 6, ease: 'linear' });
  }
  const OTS = (on, over, o) => ({ do: (c) => { ots(c, on, over, o); } });
  // Luka's habit: he glances at Chase before he speaks (a head turn; the feet stay)
  const glance = (from, to, dur = 1.0) => ({ do: (c) => {
    if (sk(c)) return;
    const a = act(c, from), b = act(c, to);
    if (!a || !b) return;
    let d = Math.atan2(b.pos.x - a.pos.x, b.pos.z - a.pos.z) - a.rotY; d = Math.atan2(Math.sin(d), Math.cos(d));
    a.play('glance', { yaw: Math.max(-1.3, Math.min(1.3, d)), dur });
  } });
  const turn = (id, to) => ({ face: id, to, dur: 0 });
  const me = (text) => ({ do: (c) => (sk(c) ? null : c.say(c.state.active, text)) });
  // the examiner steps to one side of the bin (out of its lens) and looks at it
  const aside = (at) => ({ do: (c) => { const a = act(c, c.state.active); if (a) a.place(at); } });
  const meFace = (to) => ({ do: (c) => { const a = act(c, c.state.active); if (a) a.face(to, sk(c) ? 0 : 0.25); } });
  // swap until `id` leads (three playables: SWAP cycles)
  function swapTo(c, id) { for (let i = 0; i < 3 && c.state.active !== id; i++) if (!c.flow.swapNext()) break; }
  // walk the active character through waypoints (autoplay solves the roams on foot, through the real hotspots)
  async function walk(c, pts, run = true) {
    const sid = c.flow.sceneId;
    c.player.enabled = true;   // the followers trail the leader only while the player is enabled
    for (const p of pts) {
      const a = act(c, c.state.active);
      if (!a || c.flow.sceneId !== sid) break;
      await a.moveTo(p, { run, collide: true });
    }
    await until(() => true, 0);
    c.player.enabled = false;
  }
  const settle = (c, s) => until(() => (!c.flow.busy && !c.flow.cutscene && !(typeof stealth !== 'undefined' && stealth.busy)) || c.flow.sceneId !== s, 120);
  const toast = (c, t) => { if (!sk(c)) c.ui.toast(t); };
  const tick = () => ({ sfx: 'pop', vol: 0.5 });
  // test hook (autoplay only): &mgskip=1 skips the next mini-game 1.2 s in (as the pause menu's "Skip this mini-game")
  function mgSkip(c, sec = 1.2) {
    if (!(TEST && TEST.auto) || !new URLSearchParams(location.search).get('mgskip')) return;
    later(c, sec, () => { if (flow.minigameId) { flow.skipOffer = true; flow.skipMinigame(); } });
  }

  // ---------------------------------------------------------- CARDS (the readable INSERTs this file owns)
  // Luke's invitation: card stock, the HQ's Yes (Are you sure?) and the morning tea. Chase (2040) holds it up.
  CARDS.s31_invite = (cx, w, h) => {
    const K = CARDS._kit;
    K.seedOf('s31-invite');
    cx.fillStyle = '#1d2733'; cx.fillRect(0, 0, w, h);
    cx.save(); cx.translate(w / 2, h / 2); cx.rotate(-0.025);
    const cw = w * 0.8, ch = h * 0.82;
    K.shadow(cx, 30, 12, 0.5); cx.fillStyle = '#f7f4ec'; cx.fillRect(-cw / 2, -ch / 2, cw, ch); K.noShadow(cx);
    cx.strokeStyle = '#ffd21f'; cx.lineWidth = 10; cx.strokeRect(-cw / 2 + 22, -ch / 2 + 22, cw - 44, ch - 44);
    cx.textAlign = 'center'; cx.textBaseline = 'middle';
    cx.fillStyle = '#141d3a'; cx.font = `bold 34px ${K.SANS}`; cx.fillText('Yes', 0, -ch * 0.36);
    cx.fillStyle = '#6d7d9c'; cx.font = `22px ${K.SANS}`; cx.fillText('(Are you sure?)', 0, -ch * 0.36 + 32);
    cx.fillStyle = '#c62828'; cx.font = `bold 78px ${K.SANS}`; cx.fillText('MANDATORY FUN', 0, -ch * 0.12);
    cx.fillStyle = '#141d3a'; cx.font = `34px ${K.SANS}`; cx.fillText('Christmas Eve Morning Tea', 0, ch * 0.03);
    cx.font = `28px ${K.SANS}`; cx.fillStyle = '#3a4560'; cx.fillText('Optus Tower · Ann Street · Monday 24 December · 10:00', 0, ch * 0.13);
    cx.fillStyle = '#141d3a'; cx.font = `bold 48px ${K.SANS}`; cx.fillText('Admits: LUKE + 2', 0, ch * 0.3);
    cx.restore();
  };
  CARDS.s31_invite.size = [1000, 620];
  // The acrylic desk sign by the lifts: the same words as the yellowed Redcliffe flyer, printed properly.
  CARDS.s31_sign = (cx, w, h) => {
    const K = CARDS._kit;
    const g = cx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#d8dee4'); g.addColorStop(1, '#aeb6be');
    cx.fillStyle = g; cx.fillRect(0, 0, w, h);
    cx.save(); cx.translate(w / 2, h / 2);
    const sw = w * 0.82, sh = h * 0.7;
    K.shadow(cx, 26, 12, 0.35);
    cx.fillStyle = 'rgba(255,255,255,0.92)'; K.rr(cx, -sw / 2, -sh / 2, sw, sh, 18); cx.fill(); K.noShadow(cx);
    cx.strokeStyle = 'rgba(160,190,215,0.9)'; cx.lineWidth = 6; K.rr(cx, -sw / 2 + 4, -sh / 2 + 4, sw - 8, sh - 8, 16); cx.stroke();
    cx.fillStyle = 'rgba(255,255,255,0.6)'; cx.fillRect(-sw / 2 + 30, -sh / 2 + 18, sw * 0.5, 8);
    cx.textAlign = 'center'; cx.textBaseline = 'middle';
    cx.fillStyle = '#141d3a'; cx.font = `bold 76px ${K.SANS}`; cx.fillText('LANYARD REQUESTS', 0, -sh * 0.14);
    cx.fillStyle = '#2f5f9a'; cx.font = `58px ${K.SANS}`; cx.fillText('please allow 6–8 weeks', 0, sh * 0.2);
    cx.restore();
  };
  CARDS.s31_sign.size = [1000, 480];
  // The oldest port: a beige 1987 wall socket on old brick, and above it the masking tape in biro.
  CARDS.s32_jack = (cx, w, h) => {
    const K = CARDS._kit;
    K.seedOf('s32-jack');
    cx.fillStyle = '#d8c8a0'; cx.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 46) for (let x = (y / 46) % 2 ? -60 : 0; x < w; x += 120) { cx.strokeStyle = 'rgba(150,130,90,.55)'; cx.lineWidth = 5; cx.strokeRect(x + 3, y + 3, 114, 40); }
    for (let i = 0; i < 400; i++) { cx.fillStyle = `rgba(120,100,60,${0.05 + K.rnd() * 0.08})`; cx.fillRect(K.rnd() * w, K.rnd() * h, 3, 3); }
    // the tape
    cx.save(); cx.translate(w * 0.5, h * 0.3); cx.rotate(-0.03);
    K.shadow(cx, 8, 3, 0.25); cx.fillStyle = '#efe2b8'; cx.fillRect(-w * 0.4, -46, w * 0.8, 92); K.noShadow(cx);
    cx.fillStyle = 'rgba(200,180,120,.35)'; for (let i = 0; i < 30; i++) cx.fillRect(-w * 0.4 + K.rnd() * w * 0.8, -46 + K.rnd() * 92, 2, 10);
    K.hand(cx, 'JARVIS — 1987 — DO NOT UNPLUG', 0, 16, 48, K.BIRO, { align: 'center', pen: true });
    cx.restore();
    // the socket
    cx.save(); cx.translate(w * 0.5, h * 0.7);
    K.shadow(cx, 14, 6, 0.35); cx.fillStyle = '#e8dcbc'; K.rr(cx, -90, -90, 180, 180, 10); cx.fill(); K.noShadow(cx);
    cx.strokeStyle = '#b8a880'; cx.lineWidth = 4; K.rr(cx, -90, -90, 180, 180, 10); cx.stroke();
    cx.fillStyle = '#3a3020'; K.rr(cx, -34, -26, 68, 46, 6); cx.fill();
    cx.fillStyle = '#c8a040'; for (let i = 0; i < 4; i++) cx.fillRect(-22 + i * 13, -18, 6, 14);
    cx.fillStyle = '#b8a880'; cx.beginPath(); cx.arc(-60, -60, 7, 0, 7); cx.arc(60, 60, 7, 0, 7); cx.fill();
    cx.restore();
    // the old copper line running away along the skirting
    cx.strokeStyle = '#cdbb94'; cx.lineWidth = 12; cx.beginPath(); cx.moveTo(w * 0.5, h * 0.7 + 90); cx.lineTo(w * 0.5, h - 30); cx.lineTo(w, h - 30); cx.stroke();
  };
  CARDS.s32_jack.size = [900, 620];
  // The private lift's side panel: SafeSense glass, the booking.
  CARDS.s32_panel = (cx, w, h) => {
    const K = CARDS._kit;
    cx.fillStyle = '#0d1118'; cx.fillRect(0, 0, w, h);
    cx.save(); cx.translate(w / 2, h / 2);
    const pw = w * 0.84, ph = h * 0.74;
    cx.shadowColor = 'rgba(111,208,255,.55)'; cx.shadowBlur = 40;
    cx.fillStyle = 'rgba(232,244,255,0.96)'; K.rr(cx, -pw / 2, -ph / 2, pw, ph, 28); cx.fill(); K.noShadow(cx);
    cx.textAlign = 'center'; cx.textBaseline = 'middle';
    cx.fillStyle = '#2f86e0'; cx.font = `bold 30px ${K.SANS}`; cx.fillText('SafeSense', 0, -ph * 0.36);
    cx.fillStyle = '#141d3a'; cx.font = `bold 86px ${K.SANS}`; cx.fillText('ROOF ACCESS', 0, -ph * 0.14);
    cx.fillStyle = '#3a4560'; cx.font = `54px ${K.SANS}`; cx.fillText('SANTA PHOTO 11:30', 0, ph * 0.06);
    cx.fillStyle = '#1d6a3a'; cx.font = `bold 62px ${K.SANS}`; cx.fillText('AUTHORISED: SANTA', 0, ph * 0.27);
    cx.restore();
  };
  CARDS.s32_panel.size = [1000, 560];

  // ---------------------------------------------------------- the invitation in Chase (2040)'s hand: hq_atrium's `invite` prop
  // (hold() parents it to his grip; it must go home before the set does, so a quit mid-scene sends it back too)
  let inviteOut = null;
  if (typeof on === 'function') on('flow:stop', () => { if (inviteOut) { inviteOut.home(); inviteOut = null; } });

  // ---------------------------------------------------------- custom poses (registered once; no allocation per tick)
  // pulling the Santa beard and hat off over his head, then holding them out in front (one-shot, ~1.6 s)
  if (!ANIMS.s32_unmask) {
    ANIMS.s32_unmask = (r, t, p) => {
      ANIMS.idle(r, t, p);
      const K = RIGKIT;
      if (!K) return;
      const d = r.d, u = K.once(t, p, 1.6);
      let x, y, z;
      if (u < 0.35) { const k = K.ez(u / 0.35); x = 0.14 - 0.05 * k; y = 0.12 + (d.headC - 0.26 - 0.12) * k; z = 0.2 + 0.04 * k; }
      else if (u < 0.7) { const k = K.ez((u - 0.35) / 0.35); x = 0.09 + 0.03 * k; y = d.headC - 0.26 + 0.62 * k; z = 0.24 - 0.08 * k; }
      else { const k = K.ez((u - 0.7) / 0.3); x = 0.12 + 0.06 * k; y = d.headC + 0.36 - (d.headC + 0.16) * k; z = 0.16 + 0.24 * k; }
      K.arm(r, 1, x, y, z, 1, -0.4, -0.4); K.arm(r, -1, x, y, z, 1, -0.4, -0.4);
      r.parts.head.rotation.x = u > 0.3 && u < 0.7 ? 0.12 : 0;
    };
  }

  // Nadia looping her lanyard over Santa's head: both hands up over his hat (p.h m), down to his neck (p.n m), p.z m in
  // front of her, and let go (one-shot, ~2.4 s)
  if (!ANIMS.s31_loop) {
    ANIMS.s31_loop = (r, t, p) => {
      ANIMS.idle(r, t, p);
      const K = RIGKIT;
      if (!K) return;
      const d = r.d, u = K.once(t, p, 2.4);
      const crown = K.hipsY(r, p.h ?? 2.0) - d.hipY, neck = K.hipsY(r, p.n ?? 1.42) - d.hipY, zf = K.hipsY(r, p.z ?? 0.75), rest = 0.15;
      let y, z, k;
      if (u < 0.35) { k = K.ez(u / 0.35); y = rest + (crown - rest) * k; z = 0.25 + (zf - 0.25) * k; }
      else if (u < 0.72) { k = K.ez((u - 0.35) / 0.37); y = crown + (neck - crown) * k; z = zf; }
      else { k = K.ez((u - 0.72) / 0.28); y = neck + (rest - neck) * k; z = zf + (0.25 - zf) * k; }
      K.arm(r, 1, 0.13, y, z, 1, -0.5, -0.5); K.arm(r, -1, 0.13, y, z, 1, -0.5, -0.5);
      r.parts.head.rotation.x = -0.12;
    };
  }

  // ---------------------------------------------------------- the PA (the Manager, filtered, his motif under it)
  function pa(fl, text, shotStep) {
    return [
      { do: (c) => { const u = ud(c, 'pa' + fl); if (u) u.talk(true); if (!sk(c)) c.sfx('manager_motif', { vol: 0.3 }); } },
      shotStep,
      { wait: 1.1 },
      say('manager', text, { tag: 'on the PA' }),
      { do: (c) => { const u = ud(c, 'pa' + fl); if (u) u.talk(false); } },
    ];
  }

  // =================================================================================================================
  // ==== 3.1 — "Mandatory Fun"
  // =================================================================================================================
  const ATR = () => SETS.hq_atrium;
  const atr = (fn) => ({ do: (c) => { const S = ATR(); if (S && c.world.setId === 'hq_atrium') fn(c, S); } });
  const RCPS = { priya: 'priya', gaz: 'staff_c', tom: 'staff_a', wen: 'staff_b', nadia: 'nadia' };
  // the party on Ann Street at the start of the crane (crossing at zebra E toward the canopy)
  const ST31 = { luka: [-0.9, 0, 4.4, PI], chase: [0.9, 0, 4.8, PI], chase40: [0.0, 0, 3.8, PI] };

  SCENES['3.1'] = {
    title: 'Mandatory Fun', set: 'hq_atrium', env: 'storm_ext', time: 'Monday 24 December 2040, 10:00', place: 'Optus Tower, Ann Street, Fortitude Valley',
    playable: ['luka', 'chase', 'chase40'], swap: false, music: null,
    hud: { noService: false, quiet: '01:58:00', samples: false, bars: null },
    spawn: {
      luka: ST31.luka, chase: ST31.chase, chase40: ST31.chase40,
      desk: 'desk_woman', hr: { at: 'hr', look: 'hr' },
      priya: { at: 'gift_priya', look: 'priya' }, gaz: { at: 'gift_gaz', look: 'staff_c' }, tom: { at: 'gift_tom', look: 'staff_a' },
      wen: { at: 'gift_wen', look: 'staff_b' }, nadia: { at: 'gift_nadia', look: 'nadia' },
    },
    hotspots: [
      // the lanyard desk (the CHASE / DESK exchange, whoever walks up to it: Chase steps up)
      { id: 'h31_desk', at: 'desk_chase', r: 1.3, verb: 'Talk', once: true, flag: 's31_desk', do: (c) => c.playCutscene('3.1_desk', { letterbox: true }) },
      // the morning-tea urn: the save point
      { id: 'h31_kettle', at: 'kettle', r: 1.1, verb: 'Use', kettle: true, do: (c) => { const u = ud(c, 'tea_table'); if (u && u.steam) u.steam(); } },
      // the service lift behind the tree: the reader stays red (no lanyard yet)
      { id: 'h31_svc', at: 's31_lift_luka', r: 1.1, when: (s) => !s.inventory.includes('nadia_lanyard'),
        steps: [meFace([-3.55, 0, -40.55]), A31('lift_reader', { push: 0.04, dur: 3 }), { wait: 0.5 },
          { prop: 'svc_reader', fn: (o) => { o.userData.set('red'); o.userData.beep(); } }, { sfx: 'sad_beep', vol: 0.4 }, { wait: 1.2 }] },
    ],
    steps: [
      ['cutscene', '3.1_tower'],
      ['control', 'chase'],
      ['follow', true],
      ['swap', true],
      ['objective', 'Get to the service lift.'],
      ['objective', [{ text: 'Get an HQ lanyard', done: false }, { text: 'Find the service lift', done: false }]],
      ['roam', {
        until: 's31_desk',
        hint: { after: 75, steps: [A31('lanyard_sign', { push: 0.05, dur: 3, card: ['s31_sign'] }), { wait: 2.2 }] },
        async auto(c) {
          const s = c.flow.sceneId;
          await c.hotspots.trigger('h31_svc');
          swapTo(c, 'chase');
          await walk(c, [[0.5, 0, -17.5], [7.0, 0, -22.0], [11.6, 0, -26.6], 'desk_chase']);
          await c.hotspots.trigger('h31_desk');
          await settle(c, s);
          await walk(c, [[12.0, 0, -18.0], [12.8, 0, -15.2]]);
          await c.hotspots.trigger('h31_kettle');
        },
      }],
      ['cutscene', '3.1_monitor'],
      ['do', (c) => { mgSkip(c); }],
      ['minigame', 'blend_in', { need: 3, cp: 's31_cp' }],
      ['do', (c) => chipBack(c)],
      ['do', (c) => { mgSkip(c, 9); }],
      ['minigame', 'secret_santa', { intro: true, chipOn: true }],
      ['swap', false],
      ['follow', null],
      ['cutscene', '3.1_nadia'],
      ['cutscene', '3.1_lift'],
    ],
    grants: {
      flags: { santa: true, chip_off: false, s31_desk: true, s31_blended: true, s31_santa: true, s31_nadia: true, s31_lift: true },
      items: ['santa', 'brick_phone', 'invite', 'nadia_lanyard'], quiet: '01:58:00', noService: false,
    },
  };

  // the opening dress: outside (crane31), his chip dark, Luka in the beard, the Door Drone under the canopy
  function dressTower(c) {
    const S = ATR();
    if (S && c.world.setId === 'hq_atrium') S.dress('crane31');
    // both countdowns a few seconds ahead, so the facade's reads 01:58:00 as the push lands on it, and the wall's as the
    // atrium opens
    const t = P(c, 'tower'), fc = t && t.userData.countdown, cw = ud(c, 'countdown_wall');
    if (fc) { fc.set(1, 58, 11); fc.run(1); }
    if (cw) { cw.set(1, 58, 12); cw.run(1); }
    const F = c.state.flags;
    F.santa = true; F.chip_off = true;
    if (typeof chip !== 'undefined') chip.forceOff(true, 'Chip off.');
    for (const id of ['luka', 'chase', 'chase40']) { const a = act(c, id); if (a) a.rig.dress(c.state); }
    const c4 = act(c, 'chase40'); if (c4) c4.rig.chip('off');
    const ed = ud(c, 'entrance_doors'); if (ed) ed.open(0);
    // the recipients and the desk face the room; HR at the gift table
    if (typeof DRONES !== 'undefined') {
      DRONES.spawn('door_drone', { kind: 'door', at: 'door_drone', face: 0, hover: 1.9, cone: false, ai: false, showPath: false });
      const d = DRONES.get('door_drone'); if (d && d.obj.userData.show) d.obj.userData.show('WELCOME!');
    }
  }
  function doorScreen(c, t) { if (typeof DRONES === 'undefined') return; const d = DRONES.get('door_drone'); if (d && d.obj.userData.show) d.obj.userData.show(t); }
  // the invitation in his right hand (and back in the pocket)
  function invite(c, on) {
    const u = ud(c, 'invite');
    if (!u) return;
    if (on && act(c, 'chase40')) { u.hold('chase40', true); inviteOut = u; } else { u.home(); inviteOut = null; }
  }
  // Secret Santa: Chase (2040) turns his chip on (the game switches Chip View back on; the light comes on)
  function chipBack(c) {
    delete c.state.flags.chip_off;
    if (typeof chip !== 'undefined') { chip.lightOn(null); }
    const a = act(c, 'chase40'); if (a) a.rig.chip('on');
  }

  // [CRANE · up the outside of Optus Tower] ... [WIDE · the atrium] ... [TRACK · the three of them at the entrance]
  CUTSCENES['3.1_tower'] = [
    { do: (c) => dressTower(c) },
    { env: 'storm_ext' },
    put('luka', ST31.luka), put('chase', ST31.chase), put('chase40', ST31.chase40),
    // [CRANE · up the outside of Optus Tower] A glass tower on Ann Street. The Yes sign at the top. Drones circling it
    // like gulls. The storm sits on the city: dark and heavy, but the rain has paused.
    glide('hq_atrium', 's31_crane_a', 's31_crane_b', 4.8, 'in'),
    { do: (c) => { if (sk(c)) return; for (const [id, x] of [['luka', -0.8], ['chase', 0.8], ['chase40', 0.0]]) { const a = act(c, id); if (a) a.moveTo([x, 0, -2.6]); } } },
    { sfx: 'thunder_far', vol: 0.4 },
    { wait: 4.8 },
    glide('hq_atrium', 's31_crane_b', 's31_crane_c', 4.0, 'out'),
    { wait: 4.0 },
    // On the facade, a huge countdown: QUIET IN 01:58:00.
    A31('facade_countdown', { push: 5, dur: 3.2 }),
    { wait: 2.6 },
    // [WIDE · the atrium] Corporate Christmas, the Manager's way. A three-storey Christmas tree wrapped entirely in
    // bubble wrap. Foam on every corner. A banner: MANDATORY FUN. Crackers, each with safety goggles. A Secret Santa
    // table of pre-screened socks. A staff choir humming at 40 dB under a SafeSense meter. Staff in reindeer-antler
    // headbands with chip lights, smiling politely. A giant countdown clock on the far wall.
    atr((c, S) => S.dress('party31')),
    { env: 'atrium' },
    { music: 'choir', fade: 1.4 },
    // (down from the banner to the floor: MANDATORY FUN, then the tree, the choir, the countdown)
    { shot: 'CAM', pos: [-2.6, 5.2, -12.2], look: [-0.6, 10.3, -22.5], fov: 56, to: { pos: [-2.54, 5.16, -14.4], look: [-2.0, 4.8, -34.0], fov: 60 }, dur: 4.6 },
    { wait: 4.2 },
    A31('choir_meter', { push: 0.35, dur: 3.2 }),
    { wait: 2.4 },
    cam([-13.4, 1.55, -17.6], [-12.0, 0.9, -20.6], 40, [[-13.3, 1.5, -17.9]], 3),
    { wait: 2.0 },
    // [TRACK · the three of them at the entrance] Chase (2040) holds Luke's invitation.
    put('luka', [-1.0, 0, -5.4, PI]), put('chase', [1.0, 0, -5.1, PI]), put('chase40', [0.0, 0, -5.8, PI]),
    { do: (c) => invite(c, true) },
    // (low, just ahead of them and to the east, backing off as they come: three faces side by side, the card in his hand;
    // side-on they hid each other; cut before the door so the drone's lens sees them arrive)
    cam([1.4, 1.22, -10.0], [0.0, 1.35, -5.6], 36, [[1.7, 1.28, -10.7], [-0.1, 1.45, -8.4], 42], 2.6),
    { move: 'luka', to: 's31_door_luka', nowait: true }, { move: 'chase', to: 's31_door_chase', nowait: true },
    { move: 'chase40', to: 's31_door_c40', nowait: true },
    { wait: 2.4 },
    // DOOR DRONE
    A31('door_drone', { push: 0.25, dur: 5 }),
    { sfx: 'drone_scan', vol: 0.5 },
    { wait: 0.3 },
    say('door_drone', 'Welcome! Please present your invitation.'),
    // (Chase (2040) holds it up. His chip is off.)
    A31('s31_invite', { push: 0.1, dur: 4 }),
    { act: [['chase40', 'give', { dur: 2.6, loop: false }]] },
    { wait: 0.9 },
    A31('s31_invite', { push: 0.05, dur: 3, card: ['s31_invite'] }),
    { do: (c) => doorScreen(c, 'SCANNING…') },
    { sfx: 'drone_scan', vol: 0.45 },
    { wait: 2.2 },
    { do: (c) => doorScreen(c, 'LUKE +2') },
    // the guest and the drone face to face, side on from the east (the drone's screen in the frame; a lens in front of
    // him sat under its light)
    cam([2.3, 1.72, -10.05], [-0.15, 1.72, -10.12], 38, [[2.05, 1.72, -10.06]], 6),
    say('door_drone', 'Guest: LUKE, plus two. ^ Welcome, Luke!'),
    { do: (c) => doorScreen(c, 'WELCOME, LUKE!') },
    { sfx: 'ss_chirp', vol: 0.4 },
    { expr: [['chase40', 'tired']] },
    { do: (c) => closeOn(c, 'chase40', { yaw: -1.0, dist: 0.95, fov: 36, push: 0.06, dur: 5 }) },
    say('chase40', '…Thanks.'),
    // the doors slide open; the Door Drone floats aside; they go in
    { do: (c) => { invite(c, false); const ed = ud(c, 'entrance_doors'); if (ed) ed.open(1); if (typeof DRONES !== 'undefined') DRONES.goTo('door_drone', [2.9, 0, -10.0], { speed: 1.2 }); } },
    { sfx: 'door_slide', vol: 0.5 },
    put('luka', [-1.0, 0, -11.9, PI]), put('chase', [1.0, 0, -11.7, PI]), put('chase40', [0.0, 0, -12.4, PI]),
    A31('s31_inside', { push: 0.3, dur: 6 }),
    { move: 'luka', to: 's31_in_luka', nowait: true }, { move: 'chase40', to: 's31_in_c40', nowait: true }, { move: 'chase', to: 's31_in_chase' },
    { face: 'chase', to: 'chase40', dur: 0.3 }, { face: 'chase40', to: 'chase', dur: 0.4 },
    { wait: 0.4 },
    { do: (c) => { ots(c, 'chase', 'chase40', { fov: 38, back: 0.7, off: 0.38, dur: 5 }); } },
    say('chase', "You're Luke now.", { tag: 'whispering' }),
    { expr: [['chase40', 'neutral']] },
    { do: (c) => { ots(c, 'chase40', 'chase', { fov: 38, back: 0.7, off: 0.38, dur: 5 }); } },
    say('chase40', "Don't."),
    { face: 'chase40', to: [0, 0, -24], dur: 0.5 }, { face: 'chase', to: [0, 0, -24], dur: 0.5 },
    { do: (c) => { const ed = ud(c, 'entrance_doors'); if (ed) ed.open(0); if (typeof DRONES !== 'undefined') DRONES.remove('door_drone'); } },
    A31('s31_wide', { push: 0.4, dur: 3 }),
    { wait: 0.3 },
  ];

  // The lanyard desk. A desk by the lifts: LANYARD REQUESTS · please allow 6–8 weeks.
  CUTSCENES['3.1_desk'] = [
    put('chase', 'desk_chase'), put('luka', [11.3, 0, -25.6, 2.2]), put('chase40', [11.0, 0, -28.2, 1.2]),
    { face: 'desk', to: 'chase', dur: 0 },
    A31('lanyard_sign', { push: 0.05, dur: 3, card: ['s31_sign'] }),
    { wait: 2.0 },
    cam([13.3, 1.55, -23.9], [13.3, 1.3, -27.2], 46, [[13.3, 1.55, -24.3]], 6),
    { wait: 0.3 },
    // CHASE (to the woman at the desk)
    say('chase', "How long's the wait for a lanyard?"),
    { do: (c) => closeOn(c, 'desk', { yaw: 0.5, dist: 1.0, fov: 36, push: 0.05, dur: 4 }) },
    say('desk', 'Six to eight weeks.'),
    { expr: [['chase', 'stunned']] },
    { do: (c) => closeOn(c, 'chase', { yaw: -0.5, dist: 1.0, fov: 38, push: 0.12, dur: 3 }) },
    say('chase', "IT'S BEEN FOURTEEN YEARS."),
    { do: (c) => closeOn(c, 'desk', { yaw: 0.5, dist: 1.0, fov: 36, push: 0.04, dur: 4 }) },
    { wait: 0.3 },
    say('desk', 'Still processing.'),
    { expr: [['chase', 'neutral']] },
    { flag: 's31_desk' },
  ];

  // The Fun Monitor: a drone with a beam patrols the atrium (Blend In, 9.11)
  CUTSCENES['3.1_monitor'] = [
    { do: (c) => {
      if (typeof DRONES === 'undefined') return;
      const S = ATR(), path = (S && S.paths && S.paths.fun_loop) || [[0, -17.5]];
      DRONES.spawn('fun_monitor', { kind: 'fun', path, loop: true, speed: 1.1, hover: 2.6, cone: { len: 5.0, half: 0.42 }, sweep: 34, sweepPeriod: 2.5, ai: false, showPath: false });
    } },
    cam([-4.6, 4.0, -12.8], [-10.6, 2.0, -17.4], 50, [[-4.6, 4.0, -13.4], [-10.6, 1.8, -20.4]], 4),
    { sfx: 'drone_scan', vol: 0.5 },
    { wait: 1.4 },
    { sfx: 'ss_chirp', vol: 0.45 },
    { wait: 1.6 },
  ];

  // The fifth gift. [MID] ... [CLOSE · Nadia] ... [CLOSE · Luka] ...
  CUTSCENES['3.1_nadia'] = [
    { do: (c) => { const fm = typeof MINIGAMES !== 'undefined' && MINIGAMES.blend_in; if (fm && fm.stopMonitor) fm.stopMonitor(); } },
    put('luka', 'give_nadia'), put('nadia', 'gift_nadia'), put('chase40', 's31_c40_nadia'), put('chase', 's31_chase_nadia'),
    { act: [['luka', 'idle'], ['chase', 'idle'], ['chase40', 'idle'], ['nadia', 'idle']] },
    { expr: [['luka', 'neutral'], ['chase', 'neutral'], ['chase40', 'neutral'], ['nadia', 'neutral']] },
    { face: 'luka', to: 'nadia', dur: 0 }, { face: 'nadia', to: 'luka', dur: 0 },
    { face: 'chase40', to: 'nadia', dur: 0 }, { face: 'chase', to: 'nadia', dur: 0 },
    { do: (c) => { const l = act(c, 'luka'), p = P(c, 'gift_parcel'); if (l && p && l.held !== p) { l.hold(p); p.visible = true; } } },
    { do: (c) => { const S = ATR(); if (S && S.lamp) S.lamp('tree'); } },
    // [MID] Luka hands a small parcel to NADIA (40s, antlers, tired eyes, Network Safety lanyard). She takes it. She
    // looks up at him over the beard.
    A31('s31_nadia_mid', { push: 0.45, dur: 7 }),   // (side-on: the parcel crosses between them; over his back it was hidden)
    { wait: 0.6 },
    { act: [['luka', 'give', { dur: 1.4, loop: false }]] },
    { wait: 0.7 },
    { do: (c) => { const l = act(c, 'luka'), n = act(c, 'nadia'), p = P(c, 'gift_parcel'); if (!l || !n || !p) return; if (l.held === p) l.hold(null); n.hold(p); p.visible = true; } },
    { sfx: 'cloth_swish', vol: 0.4 },
    { act: [['nadia', 'look_up']] },
    { wait: 1.0 },
    // [CLOSE · Nadia] Her face changes.
    AWAY('nadia', 'chase40', { dist: 0.9, fov: 34, push: 0.1, dur: 6, mag: 0.55 }),
    { act: [['nadia', 'idle']] },
    { wait: 0.6 },
    { expr: [['nadia', 'stunned']] },
    { wait: 0.9 },
    say('nadia', '…Luka?'),
    // [CLOSE · Luka] Frozen.
    { expr: [['luka', 'stunned']] },
    AWAY('luka', 'chase', { dist: 0.95, fov: 34, push: 0.05, dur: 5, mag: 0.55 }),
    { wait: 1.2 },
    say('luka', '…His nephew.'),
    // NADIA (after a beat, quiet)
    { expr: [['luka', 'still']] },
    { do: (c) => closeAway(c, 'nadia', 'chase40', { dist: 0.95, fov: 34, push: 0.14, dur: 14, mag: 0.55 }) },
    { expr: [['nadia', 'tired']] },
    { wait: 0.8 },
    say('nadia', "You've got his eyes. ^ He was the best boss I ever had. He never let us do anything dangerous. ^ He never let us do anything.", { tag: 'quietly' }),
    // (She looks at Chase (2040), recognises him, and understands they're up to something. She decides.)
    { expr: [['nadia', 'still']] },
    { face: 'nadia', to: 'chase40', dur: 0.6 },
    { do: (c) => { ots(c, 'chase40', 'nadia', { fov: 28, back: 0.6, off: 0.36, side: -1, dur: 6 }); } },
    { wait: 1.4 },
    { do: (c) => closeOn(c, 'chase40', { yaw: 0.35, dist: 1.0, fov: 34, push: 0.05, dur: 5 }) },
    { wait: 1.2 },
    { act: [['chase40', 'nod', { dur: 1.0, loop: false }]] },
    { wait: 0.9 },
    { face: 'nadia', to: 'luka', dur: 0.5 },
    { wait: 0.6 },
    { expr: [['nadia', 'still']] },
    { do: (c) => closeAway(c, 'nadia', 'chase40', { dist: 0.9, fov: 32, push: 0.06, dur: 8, mag: 0.55 }) },
    { wait: 0.7 },
    // NADIA (very quietly)
    say('nadia', "Service lift's behind the tree. It goes to thirty. After thirty it's his.", { tag: 'very quietly' }),
    // (She unclips her own HQ lanyard and loops it over Santa's head, as if it's a gift.)
    A31('s31_lanyard', { push: 0.12, dur: 6 }),
    { do: (c) => { const n = act(c, 'nadia'), p = P(c, 'gift_parcel'); if (n && p && n.held === p) { n.hold(null); p.visible = false; } } },
    { move: 'nadia', to: [7.45, 0, -30.53], speed: 0.6 }, { face: 'nadia', to: 'luka', dur: 0 },
    { act: [['nadia', 's31_loop', { dur: 2.4, loop: false, z: 0.72, h: 2.02, n: 1.42 }]] },
    { do: (c) => { const n = act(c, 'nadia'); if (n) n.rig.show('lanyard', false); } },
    { sfx: 'cloth_swish', vol: 0.45 },
    { wait: 1.4 },
    { item: 'nadia_lanyard' },
    { do: (c) => { const l = act(c, 'luka'); if (l) l.rig.show('lanyard2', true); } },
    { wait: 0.9 },
    { act: [['nadia', 'idle']] }, { expr: [['nadia', 'fond']] },
    // (she stands 0.7 m from him now: a closer lens, wider round her face, clear of his head)
    AWAY('nadia', 'chase40', { dist: 0.8, fov: 36, push: 0.05, dur: 6, mag: 0.9 }),
    say('nadia', 'Merry Christmas, Santa.'),
    // Ticks: ☑ Get an HQ lanyard · ☑ Find the service lift.
    { objective: [{ text: 'Get an HQ lanyard', done: true }, { text: 'Find the service lift', done: true }] },
    tick(),
    { flag: 's31_nadia' },
    { act: [['luka', 'look_down']] },
    A31('s31_lanyard', { push: 0.05, dur: 3 }),
    { wait: 1.4 },
    { act: [['luka', 'idle']] },
  ];

  // Behind the bubble-wrapped tree, a plain steel door. Nadia's lanyard against the reader. The doors open. The three
  // of them squeeze in. The doors close on the humming choir. Inside, lift music: a soft muzak version of the Optus
  // hold music, Pudding's 1987 song. Chase (2040) stares at the speaker in the ceiling. Nobody says anything.
  CUTSCENES['3.1_lift'] = [
    { do: (c) => { const n = act(c, 'nadia'), p = P(c, 'gift_parcel'); if (n && p && n.held === p) n.hold(null); if (p) p.visible = false; c.world.prebuild('hq_floors'); } },
    { do: (c) => { const l = act(c, 'luka'); if (l) l.rig.show('lanyard2', true); } },
    { objective: null },
    { act: [['luka', 'idle'], ['chase', 'idle'], ['chase40', 'idle']] },
    put('luka', [-1.3, 0, -38.7, -H]), put('chase', [-0.8, 0, -38.2, -H]), put('chase40', [-1.0, 0, -39.5, -H]),
    { expr: [['luka', 'neutral'], ['chase', 'neutral'], ['chase40', 'neutral']] },
    cam([0.4, 1.75, -37.2], [-4.8, 1.2, -40.3], 48, [[-0.2, 1.72, -37.5]], 6),
    { move: 'chase', to: 's31_lift_chase', nowait: true }, { move: 'chase40', to: 's31_lift_c40', nowait: true },
    { move: 'luka', to: 's31_lift_luka' },
    { face: 'luka', to: [-3.55, 0, -40.55], dur: 0.3 },
    { act: [['luka', 'give', { dur: 1.4, loop: false }]] },
    { wait: 0.8 },
    // the lanyard to the reader: his profile, the hand and the reader (the set's lens is all knuckle with his hand in it)
    cam([-2.25, 1.55, -38.85], [-3.7, 1.3, -40.3], 42, [[-2.4, 1.53, -39.0]], 3),
    { wait: 0.5 },
    { prop: 'svc_reader', fn: (o) => { o.userData.set('green'); o.userData.beep(); } },
    { sfx: 'key_beep', vol: 0.5 },
    { wait: 0.9 },
    A31('s31_lift_doors', { push: 0.3, dur: 5 }),
    { prop: 'svc_lift', fn: (o) => o.userData.open(1) },
    { sfx: 'door_slide', vol: 0.5, rate: 0.8 },
    { wait: 1.3 },
    { move: 'luka', to: 'lift_luka' },
    { move: 'chase40', to: 'lift_c40', nowait: true }, { move: 'chase', to: 'lift_chase' },
    { face: 'luka', to: 0, dur: 0.3 }, { face: 'chase', to: 0, dur: 0.3 }, { face: 'chase40', to: 0, dur: 0.3 },
    { wait: 0.4 },
    { prop: 'svc_lift', fn: (o) => o.userData.open(0) },
    { sfx: 'door_slide', vol: 0.5, rate: 0.8 },
    { music: null, fade: 1.3 },
    { wait: 1.5 },
    // inside the car: the muzak
    put('luka', [-5.0, 0, -42.5, 0]), put('chase', [-4.45, 0, -41.7, 0]), put('chase40', [-5.55, 0, -41.7, 0]),
    atr((c, S) => S.dress('lift31')),
    { env: 'lift' },
    atr((c, S) => S.lamp('car')),
    { prop: 'lift_car', fn: (o) => { o.userData.light(true); o.userData.panel(12); } },
    { music: 'lift', fade: 0.4 },
    A31('lift_inside', { push: 0.15, dur: 6 }),
    { wait: 2.6 },
    // Chase (2040) stares at the speaker in the ceiling.
    { act: [['chase40', 'look_up']] },
    cam([-5.1, 1.1, -40.86], [-5.42, 1.62, -41.75], 60, [[-5.12, 1.13, -40.95]], 5),   // (from under his chin: his face and the speaker over it)
    { wait: 3.4 },
    // Nobody says anything.
    cam([-5.0, 1.75, -40.9], [-5.0, 1.38, -42.5], 74, [[-5.0, 1.73, -40.98], null, 72], 5),
    { wait: 3.0 },
    { fade: 'out', dur: 1.4 },
  ];

  // =================================================================================================================
  // ==== 3.2 — "Spotless"
  // =================================================================================================================
  const FLR = () => SETS.hq_floors;
  const flr = (fn) => ({ do: (c) => { const S = FLR(); if (S && c.world.setId === 'hq_floors') fn(c, S); } });
  const S32 = { pair: null, valves: null, upd: null, lure: null, barked: false, floor: 'l12', l21Hint: 0 };
  const F = () => state.flags;
  // the floors' party marks
  const L21_CP = { luka: 's32_cp_l21', chase: [11.6, 0, -19.1, -H], chase40: [11.6, 0, -20.9, -H] };

  // put every prop where the flags say (Continue restarts at step 0; the set's prop state outlives scenes)
  function dress32(c) {
    const f = c.state.flags, u = (n) => ud(c, n);
    const l12 = u('l12_lift'); if (l12) { l12.doors(f.s32_l21 ? 1 : 0); l12.light(true); l12.panel(12); }
    const bank = u('bank'); if (bank) bank.open(f.s32_gap ? 1 : 0);
    const ctrlW = u('ctrl_w'), ctrlE = u('ctrl_e'); if (ctrlW) { ctrlW.held(false); ctrlW.progress(f.s32_gap ? 1 : 0); } if (ctrlE) ctrlE.held(false);
    const bin = u('tramp_bin'); if (bin) { bin.reset(); if (f.s32_bin) bin.push(1); }
    const hp = u('headphones_wall'); if (hp) { if (f.headphones) hp.take(); else hp.put(); }
    const sd = u('stair_door12'); if (sd) sd.open(f.s32_l12 ? 1 : 0);
    const land = u('landing21'); if (land) land.door(f.s32_l21 ? 1 : 0);
    const tea = u('tea_point'); if (tea && tea.kettle_cord) tea.kettle_cord.visible = !f.s32_cord;
    const jack = u('jack'); if (jack) { jack.state(f.s32_hacked ? 'phone' : f.s32_wired ? 'adapter' : 'bare'); jack.screen(f.s32_hacked ? 'white' : 'off'); }
    const v = u('valves'); if (v) { v.reset(); v.held(0, false); v.held(1, false); if (f.s32_valves) { v.turn(0, 1); v.turn(1, 1); } }
    const fog = u('fog21'); if (fog) fog.roll(f.s32_valves ? 1 : 0);
    const h21 = u('hatch21'); if (h21) { h21.lock(f.s32_valves ? 'green' : 'red'); h21.open(f.s32_valves ? 1 : 0); h21.ladder(f.s32_valves ? 1 : 0); }
    const m1 = u('m1'); if (m1) m1.reset();
    const h30 = u('hatch30'); if (h30) h30.open(0);
    for (const n of ['s1', 'p1', 'p2']) { const x = u(n); if (x) x.play(false); }
    const l30 = u('lift30'); if (l30) { l30.doors(0); l30.reader('red'); l30.panel('booking'); l30.car.light(true); l30.car.button(false); }
    const dk = u('docked'); if (dk && dk.tint) dk.tint('patrol', 0);
  }
  // step 0: the floor this run starts on (a save at L21's kettle resumes there), the props, the scene's updater
  function setup32(c) {
    const S = FLR(), f = c.state.flags;
    S32.pair = S32.valves = S32.lure = null; S32.barked = false; S32.l21Hint = 0;
    if (f.santa === undefined) f.santa = true;
    // test hook (autoplay only): &s32=l21 | l30 starts on that floor with everything before it done
    const jump = TEST && TEST.auto ? new URLSearchParams(location.search).get('s32') : null;
    if (jump === 'l21' || jump === 'l30') {
      Object.assign(f, { s32_l12: true, s32_gap: true, s32_bin: true, s32_guitars: true, headphones: true, s32_l21: true });
      if (!c.state.inventory.includes('headphones')) c.state.inventory.push('headphones');
      if (jump === 'l30') Object.assign(f, { s32_port: true, s32_cord: true, s32_wired: true, s32_hacked: true, s32_valves: true, s32_up: true, s32_l30: true });
    }
    for (const id of ['luka', 'chase', 'chase40']) { const a = act(c, id); if (a) a.rig.dress(c.state); }
    if (!S || c.world.setId !== 'hq_floors') return;
    if (f.s32_l30) {   // (the test hook only: no save point after L21)
      S32.floor = 'l30';
      S.dress('l30'); S.lamp('lift30');
      c.world.env('l30');
      c.music('stealth', { cut: true });
      const at = L30.cps[0].at;
      for (const id of ['luka', 'chase', 'chase40']) { const a = act(c, id); if (a) a.place(at[id]); }
    } else if (f.s32_l21) {
      S32.floor = 'l21';
      S.dress('l21');
      c.world.env(f.s32_valves ? 'l21_fog' : 'l21');
      c.music('hq', { cut: true });
      for (const id of ['luka', 'chase', 'chase40']) { const a = act(c, id); if (a) a.place(L21_CP[id]); }
    } else { S32.floor = 'l12'; S.dress('l12', { keepLamp: false }); S.lamp('lift12'); }
    dress32(c);
    if (S.reset) S.reset();   // (every eased prop at its end now: on Continue nothing slides on arrival)
    if (!S32.upd) S32.upd = scope('3.2', tick32, () => { S32.upd = null; });
  }
  // the scene's watcher (no allocation): the shelf / valve panels follow who's holding them, the L21 chip line
  function tick32() {
    if (flow.skipping) return;
    const P1 = S32.pair && typeof pairSwitch !== 'undefined' ? pairSwitch.get('shelves') : null;
    if (P1 && P1.ends && P1.ends.length === 2) {
      const w = world.prop('ctrl_w'), e = world.prop('ctrl_e');
      if (w) w.userData.held(!!P1.ends[0].arrived); if (e) e.userData.held(!!P1.ends[1].arrived);
      if (w && P1.need) w.userData.progress(Math.min(1, P1.both / P1.need));
    }
    const P2 = S32.valves && typeof pairSwitch !== 'undefined' ? pairSwitch.get('valves') : null;
    if (P2 && P2.ends && P2.ends.length === 2) {
      const v = world.prop('valves');
      if (v) for (let i = 0; i < 2; i++) { const on = !!P2.ends[i].arrived; v.userData.held(i, on); v.userData.turn(i, on ? 1 : 0); }
    }
    // L21: Chase (2040) with his chip on sees the trail
    if (S32.floor === 'l21' && !S32.barked && typeof chip !== 'undefined' && chip.on && state.active === 'chase40') {
      S32.barked = true;
      bark('chase40', "There's a cable on the map that's just labelled 'old'.", { hold: 2.5 });
    }
  }

  SCENES['3.2'] = {
    title: 'Spotless', set: 'hq_floors', env: 'lift', time: '10:40', place: 'Optus Tower, Level 12',
    playable: ['luka', 'chase', 'chase40'], swap: false, music: 'lift',
    hud: { noService: false, quiet: '01:18:00', samples: false, bars: null },
    spawn: { luka: 'l12_car_luka', chase: 'l12_car_chase', chase40: 'l12_car_c40' },
    hotspots: [
      // ---- L12 — "Confiscated for Your Safety"
      { id: 'h32_skate', at: 's32_skate', r: 1.1, steps: [aside([-60.2, 0, -35.3, PI - 0.35]), A32('skateboards', { push: 0.15, dur: 5 }), { wait: 0.4 }, me("That kid's board is in here somewhere.")] },
      { id: 'h32_knives', at: 's32_knives', r: 1.1, steps: [aside([-46.2, 0, -35.3, PI - 0.35]), A32('knives', { push: 0.15, dur: 5 }), { wait: 0.4 }, me('Every knife in Brisbane.')] },
      { id: 'h32_ladders', at: 's32_ladders', r: 1.1, steps: [{ do: (c) => ladders(c) }, cam([-42.6, 1.6, -34.3], [-40.6, 1.3, -36.3], 46, [[-42.5, 1.6, -34.45]], 5), { wait: 0.4 }, say('luka', '…He took the ladders.')] },
      { id: 'h32_guitars', at: 's32_guitars_c40', r: 1.5, once: true, flag: 's32_guitars', do: (c) => c.playCutscene('3.2_guitars', { letterbox: true }) },
      // the headphones: Chase takes a pair off the wall (required)
      { id: 'h32_headphones', at: 's32_headphones', r: 1.1, only: 'chase', verb: 'Take', when: (s) => !s.flags.headphones,
        ask: { q: 'Take them?', noDisabled: true, yes: (c) => c.playCutscene('3.2_headphones', { letterbox: true }) } },
      { id: 'h32_headphones_x', at: 's32_headphones', r: 1.1, when: (s) => !s.flags.headphones && s.active !== 'chase',
        steps: [A32('headphones_sign', { push: 0.1, dur: 4 }), { wait: 1.8 }, { do: (c) => toast(c, 'SWAP — Chase could use a pair.') }] },
      // the trampoline bin in the stair doorway: Luka pushes it out of the way
      { id: 'h32_bin', at: 's32_bin_luka', r: 1.0, only: 'luka', verb: 'Push', when: (s) => !!s.flags.s32_gap && !s.flags.s32_bin, do: (c) => pushBin(c) },
      { id: 'h32_bin_try', at: 's32_bin_luka', r: 1.0, verb: 'Push', when: (s) => !!s.flags.s32_gap && !s.flags.s32_bin && s.active !== 'luka', do: (c) => tryHeavy(c, PI, 'Too heavy. Luka can push it — SWAP.') },
      { id: 'h32_stairs', at: [-35.9, 0, -20.0], r: 0.95, verb: 'Open', when: (s) => !!s.flags.s32_bin && !s.flags.s32_l12, do: (c) => stairs(c) },
      // the gap opening (fired by the shelf pair)
      { id: 'h32_gap', at: [-50.0, 0, -35.2], r: 0.01, when: () => false, do: (c) => c.playCutscene('3.2_gap', { letterbox: false }) },
      // ---- L21 — "The Oldest Line"
      { id: 'h32_kettle', at: 'kettle', r: 1.0, verb: 'Use', kettle: true, do: (c) => { const u = ud(c, 'tea_point'); if (u) u.steam(); } },
      { id: 'h32_shutter', at: [15.6, 0, -20.3], r: 0.85, steps: [meFace([15.6, 0, -21.2]), A32('shutter', { push: 0.1, dur: 4 }), { prop: 'landing21', fn: (o) => o.userData.shutter.pulse() }, { wait: 1.8 }] },
      { id: 'h32_jack', at: 's32_jack_chase', r: 1.3, when: (s) => !s.flags.s32_port, flag: 's32_port', do: (c) => c.playCutscene('3.2_jack', { letterbox: true }) },
      { id: 'h32_cord', at: 's32_cord', r: 1.0, only: 'chase', verb: 'Take', when: (s) => !!s.flags.s32_port && !s.flags.s32_cord, flag: 's32_cord',
        steps: [{ move: 'chase', to: 's32_cord' }, { face: 'chase', to: H, dur: 0.2 }, A32('kettle_cord', { push: 0.05, dur: 3 }),
          { act: [['chase', 'give', { dur: 1.2, loop: false }]] }, { wait: 0.6 }, { do: (c) => { const u = ud(c, 'tea_point'); if (u && u.kettle_cord) u.kettle_cord.visible = false; } },
          { sfx: 'cloth_swish', vol: 0.4 }, { wait: 0.6 }] },
      { id: 'h32_cord_try', at: 's32_cord', r: 1.0, verb: 'Take', when: (s) => !!s.flags.s32_port && !s.flags.s32_cord && s.active !== 'chase', do: (c) => toast(c, 'SWAP — Chase can make it fit.') },
      { id: 'h32_wire', at: 's32_jack_chase', r: 1.3, only: 'chase', verb: 'Wire', when: (s) => !!s.flags.s32_cord && !s.flags.s32_wired, do: (c) => wire(c) },
      { id: 'h32_hack', at: 's32_jack_luka', r: 1.3, only: 'luka', verb: 'Plug in', when: (s) => !!s.flags.s32_wired && !s.flags.s32_hacked, do: (c) => hack(c) },
      { id: 'h32_hack_try', at: 's32_jack_luka', r: 1.3, verb: 'Plug in', when: (s) => !!s.flags.s32_wired && !s.flags.s32_hacked && s.active !== 'luka', do: (c) => toast(c, 'SWAP — Luka has the brick phone.') },
      { id: 'h32_fog', at: [-11.8, 0, -18.0], r: 0.01, when: () => false, do: (c) => c.playCutscene('3.2_fog', { letterbox: true }) },
      { id: 'h32_hatch', at: 's32_hatch', r: 1.1, verb: 'Climb', when: (s) => !!s.flags.s32_valves && !s.flags.s32_up, flag: 's32_up', do: () => {} },
      // ---- L30 — "The Hangar"
      { id: 'h32_s1', at: 's32_s1', r: 1.0, only: 'chase', verb: 'Play a sample', when: () => !S32.lure, do: (c) => lure(c, 's1') },
      { id: 'h32_p1', at: [45.4, 0, -15.6], r: 1.2, only: 'chase', verb: 'Play a sample', when: () => !S32.lure, do: (c) => lure(c, 'p1') },
      { id: 'h32_p2', at: [55.0, 0, -22.0], r: 1.2, only: 'chase', verb: 'Play a sample', when: () => !S32.lure, do: (c) => lure(c, 'p2') },
      { id: 'h32_m1', at: 'm1_push', r: 1.0, only: 'luka', verb: 'Push', when: (s) => !s.flags.s32_m1, do: (c) => pushM1(c) },
      { id: 'h32_m1_try', at: 'm1_push', r: 1.0, verb: 'Push', when: (s) => !s.flags.s32_m1 && s.active !== 'luka', do: (c) => tryHeavy(c, H, 'Too heavy. Luka can push it — SWAP.') },
      { id: 'h32_lift', at: 's32_reader_luka', r: 1.2, verb: 'Use lanyard', when: (s) => !!s.flags.s32_l30 && !s.flags.s32_reader, flag: 's32_reader', do: () => {} },
    ],
    steps: [
      ['do', (c) => setup32(c)],
      // ---- L12
      ['do', (c) => (F().s32_l21 ? null : c.playCutscene('3.2_l12', { letterbox: true }))],
      ['do', (c) => (F().s32_l21 ? null : l12Play(c))],
      ['roam', { until: (s) => !!s.flags.s32_l12 || !!s.flags.s32_l21, hint: { after: 150, steps: [{ do: (c) => l12Hint(c) }] }, auto: (c) => autoL12(c) }],
      // ---- L21
      ['do', (c) => (F().s32_l21 ? null : c.playCutscene('3.2_l21', { letterbox: true }))],
      ['do', (c) => (F().s32_up ? null : l21Play(c))],
      ['roam', { until: 's32_up', hint: { after: 60, steps: [{ do: (c) => l21Hint(c) }] }, auto: (c) => autoL21(c) }],
      // ---- L30
      ['do', (c) => { if (typeof stealth !== 'undefined') stealth.end(); }],
      ['do', (c) => (F().s32_l30 ? null : c.playCutscene('3.2_climb', { letterbox: true }))],
      ['do', (c) => l30Play(c)],
      ['roam', { until: 's32_reader', hint: { after: 90, steps: [{ do: (c) => l30Hint(c) }] }, auto: (c) => autoL30(c) }],
      ['objective', null],
      ['swap', false],
      ['follow', null],
      ['cutscene', '3.2_lift30'],
      // ---- the roof
      ['set', 'hq_roof', { env: 'storm_roof', spawn: { luka: 's32r_car_luka', chase: 's32r_car_chase', chase40: 's32r_car_c40' } }],
      ['cutscene', '3.2_roof'],
    ],
    grants: {
      flags: { santa: false, chip_off: false, headphones: true, s32_l12: true, s32_gap: true, s32_bin: true, s32_guitars: true, s32_l21: true, s32_port: true, s32_cord: true,
        s32_wired: true, s32_hacked: true, s32_valves: true, s32_up: true, s32_l30: true, s32_m1: true, s32_reader: true, s32_roof: true },
      items: ['headphones', 'brick_phone', 'nadia_lanyard'], removeItems: ['santa'], quiet: '00:17:00', noService: false,
    },
  };

  // ---------------------------------------------------------- L12
  // On arrival at L12, as the lift doors open on a floor so clean it reflects them.
  CUTSCENES['3.2_l12'] = [
    put('luka', 'l12_car_luka'), put('chase', 'l12_car_chase'), put('chase40', 'l12_car_c40'),
    { face: 'luka', to: 0, dur: 0 }, { face: 'chase', to: 0, dur: 0 }, { face: 'chase40', to: 0, dur: 0 },
    flr((c, S) => { S.dress('l12'); S.lamp('lift12'); }),
    { prop: 'l12_lift', fn: (o) => { o.userData.doors(0); o.userData.light(true); o.userData.panel(12); } },
    // inside the car, the muzak still playing; the doors
    cam([-53.75, 2.25, -42.85], [-52.9, 1.2, -40.0], 62, [[-53.65, 2.2, -42.75], [-52.85, 1.1, -39.6]], 6),
    { wait: 1.4 },
    { sfx: 'lift_ding', vol: 0.5 },
    { wait: 0.5 },
    { prop: 'l12_lift', fn: (o) => o.userData.doors(1) },
    { env: 'l12', dur: 0.9 },
    { music: 'hq', fade: 1.6 },
    { wait: 1.3 },
    // the three of them framed in the doorway, reflected in the white floor
    A32('s32_doors_open', { push: 0.6, dur: 7 }),
    { move: 'luka', to: [-53.0, 0, -40.3], nowait: true }, { move: 'chase', to: [-52.4, 0, -40.1], nowait: true }, { move: 'chase40', to: [-53.6, 0, -40.1] },
    { act: [['luka', 'look_down']] },
    { wait: 0.6 },
    // LUKA
    say('luka', '…Someone\'s got standards.'),
    { act: [['luka', 'idle']] },
    flr((c, S) => S.lamp('gap')),
    // The Manager on the PA. L12:
    ...pa(12, 'You shouldn\'t be here.', A32('pa12', { push: 0.1, dur: 5 })),
    { act: [['luka', 'look_up'], ['chase', 'look_up'], ['chase40', 'look_up']] },
    cam([-52.6, 0.85, -37.3], [-53.0, 1.85, -40.2], 50, [[-52.6, 0.85, -37.5]], 4),
    { wait: 1.6 },
    { act: [['luka', 'idle'], ['chase', 'idle'], ['chase40', 'idle']] },
    // the archive: confiscated for your safety (the robots behind the fence, cleaning discs on the mirror floor)
    put('luka', 's32_l12_out_luka'), put('chase', 's32_l12_out_chase'), put('chase40', 's32_l12_out_c40'),
    A32('l12_wide', { push: 1.2, dur: 5 }),
    { wait: 3.0 },
  ];
  function l12Play(c) {
    S32.floor = 'l12';
    swapTo(c, 'luka');
    if (typeof AR !== 'undefined') { AR.clear(); const S = FLR(); for (const a of (S && S.ar && S.ar.l12) || []) AR.add(a); }
    c.flow.swap = true; c.flow.setFollow(true);
    objective('Reach the stairwell to L21.');
    if (!c.state.flags.s32_gap && typeof pairSwitch !== 'undefined') {
      S32.pair = pairSwitch({
        id: 'shelves', label: 'Hold', hold: 1.5, auto: false,
        ends: [{ id: 'h32_ctrl_w', at: [-60.75, 0, -35.2], r: 1.0, stand: 's32_ctrl_w' }, { id: 'h32_ctrl_e', at: [-39.25, 0, -35.2], r: 1.0, stand: 's32_ctrl_e' }],
        onChange: (n) => { if (n === 1) { const b = ud(c, 'bank'); if (b) b.jiggle(); } },
        onDone: () => {
          c.state.flags.s32_gap = true;
          const b = ud(c, 'bank'); if (b) b.open(1);
          const w = ud(c, 'ctrl_w'), e = ud(c, 'ctrl_e'); if (w) w.progress(1);
          if (w) w.held(false); if (e) e.held(false);
          if (c.flow.sceneId === '3.2') c.hotspots.trigger('h32_gap');
        },
      });
    }
  }
  function l12Hint(c) {
    const f = c.state.flags;
    if (!f.s32_gap) toast(c, 'Two shelf controls, one at each end of the aisle. "Hold this" — and SWAP.');
    else if (!f.headphones) toast(c, 'The headphones wall. Chase could use a pair.');
    else if (!f.s32_bin) toast(c, 'The stair door is blocked. Luka can push the bin.');
  }
  // the shelves part: the bank slides on its rails, beacons blinking, the gap opens down the middle
  CUTSCENES['3.2_gap'] = [
    A32('gap', { push: 0.4, dur: 4 }),
    { sfx: 'door_slide', vol: 0.4, rate: 0.6 },
    { wait: 3.2 },
  ];
  // Luka: "…He took the ladders." (he steps up to the rack, wherever he was; seen side-on beside it)
  function ladders(c) {
    const l = act(c, 'luka'); if (!l) return;
    l.place([-40.4, 0, -35.1, PI + 0.5]);
    const a = act(c, c.state.active); if (a && a !== l) a.place([-43.4, 0, -35.0, H]);
  }

  // [the guitars] a battered acoustic in a bin labelled REDCLIFFE 2038 · NOISE
  CUTSCENES['3.2_guitars'] = [
    put('chase40', 's32_guitars_c40'), put('chase', 's32_guitars_chase'), put('luka', [-53.2, 0, -24.6, -0.4]),
    { face: 'chase40', to: [-55.3, 0, -21.6], dur: 0 }, { face: 'chase', to: [-55.6, 0, -21.6], dur: 0 },
    A32('guitars', { push: 0.25, dur: 6 }),
    { wait: 1.6 },
    { expr: [['chase40', 'still']] },
    { do: (c) => closeOn(c, 'chase40', { yaw: 0.55, dist: 1.0, fov: 36, push: 0.05, dur: 5 }) },
    say('chase40', "That's mine."),
    { face: 'chase', to: 'chase40', dur: 0.3 },
    cam([-55.4, 1.5, -20.5], [-55.6, 1.5, -23.1], 42, [[-55.4, 1.5, -20.8]], 9),
    say('chase', 'They took your guitar?'),
    say('chase40', 'Noise complaint.'),
    say('chase', "You didn't fight it?"),
    { expr: [['chase40', 'tired']] },
    { do: (c) => closeAway(c, 'chase40', 'chase', { dist: 0.95, fov: 34, push: 0.12, dur: 8 }) },
    { wait: 0.4 },
    say('chase40', "I wasn't using it."),
    { wait: 0.9 },
    { expr: [['chase40', 'neutral']] },
  ];
  // The headphones. Chase takes a pair of big over-ear headphones off the wall. "For later." He hangs them round his
  // neck, the way Chase (2040) wears his.
  CUTSCENES['3.2_headphones'] = [
    put('chase', 's32_headphones'), put('chase40', [-52.4, 0, -17.6, -0.9]),
    A32('s32_headphones_close', { push: 0.12, dur: 6 }),
    { act: [['chase', 'reach_up']] },
    { wait: 0.6 },
    { prop: 'headphones_wall', fn: (o) => o.userData.take() },
    { sfx: 'cloth_swish', vol: 0.4 },
    { act: [['chase', 'hold_headphones_up']] },
    { face: 'chase', to: 'chase40', dur: 0.4 },
    { wait: 0.8 },
    { do: (c) => closeOn(c, 'chase', { yaw: 0.4, dist: 1.05, fov: 38, push: 0.06, dur: 5 }) },
    say('chase', 'For later.'),
    { act: [['chase', 'idle']] },
    { flag: 'headphones' },
    { item: 'headphones' },
    { do: (c) => { const a = act(c, 'chase'); if (a) { a.rig.show('headphones_held', false); a.rig.show('headphones_neck', true); } } },
    { sfx: 'cloth_swish', vol: 0.35 },
    // the two of them side by side, a pair of headphones round each neck
    put('chase', [-54.1, 0, -16.5, PI + 0.15]), put('chase40', [-53.25, 0, -16.6, PI - 0.15]),
    cam([-53.65, 1.5, -18.7], [-53.65, 1.45, -16.5], 40, [[-53.65, 1.5, -18.5]], 4),
    { wait: 2.0 },
  ];
  async function pushBin(c) {
    await c.runSteps([{ move: 'luka', to: 's32_bin_luka' }, { face: 'luka', to: PI, dur: 0.2 }]);
    const bin = ud(c, 'tramp_bin');
    if (!sk(c)) c.cam.shot(A32('tramp_bin', { push: 0.1, dur: 6 }));
    const ok = await strengthHold({ who: 'luka', label: 'Push', dur: 2.5, at: [-35.5, 1.0, -20.0], anim: 'push',
      onProgress: (k) => { if (bin) bin.push(0.18 * k); } });
    if (c.flow.sceneId !== '3.2') return;
    if (!ok) { await c.cam.release(0.4); return; }
    if (bin) bin.push(1);
    await c.runSteps([{ act: [['luka', 'push']] }, { move: 'luka', to: 's32_bin_done', speed: 1.2, face: false }, { act: [['luka', 'idle']] }]);
    c.state.flags.s32_bin = true;
    await c.cam.release(0.5);
  }
  async function tryHeavy(c, face, msg) {
    const a = act(c, c.state.active);
    if (a) { a.face(face, 0.2); a.play('push'); }
    c.sfx('clunk', { vol: 0.5 });
    await c.wait(0.9);
    if (a) a.play('idle');
    toast(c, msg);
  }
  // the stair door (the headphones first: Chase looks back at the wall)
  async function stairs(c) {
    if (!c.state.flags.headphones) {
      await c.playCutscene([
        { do: (cc) => { const a = act(cc, 'chase'); if (a) a.face([-54.0, 0, -15.4], 0.4); } },
        A32('headphones_sign', { push: 0.15, dur: 4 }),
        { wait: 2.0 },
      ], { letterbox: false });
      toast(c, 'SWAP — Chase could use a pair.');
      return;
    }
    await c.runSteps([{ move: c.state.active, to: [-36.0, 0, -20.0] }, { face: c.state.active, to: H, dur: 0.2 }]);
    const d = ud(c, 'stair_door12'); if (d) d.open(1);
    if (!sk(c)) c.cam.shot(A32('stair_door12', { push: 0.3, dur: 4 }));
    await c.wait(1.0);
    c.state.flags.s32_l12 = true;
  }
  async function autoL12(c) {
    const s = c.flow.sceneId, gone = () => c.flow.sceneId !== s, T = (id) => c.hotspots.trigger(id);
    swapTo(c, 'luka');
    await walk(c, [[-53.0, 0, -37.2], [-53.0, 0, -35.2], [-58.8, 0, -35.3]]);
    await T('h32_skate'); await settle(c, s);
    await walk(c, [[-45.0, 0, -35.3]]);
    await T('h32_knives'); await settle(c, s);
    await walk(c, [[-41.4, 0, -35.3]]);
    await T('h32_ladders'); await settle(c, s);
    if (S32.pair && S32.pair.auto) S32.pair.auto();
    await until(() => !!c.state.flags.s32_gap || gone(), 20); await settle(c, s);
    await walk(c, [[-50.0, 0, -35.2], [-50.0, 0, -31.0], [-50.0, 0, -26.2], [-54.4, 0, -24.0]]);
    await T('h32_guitars'); await settle(c, s);
    swapTo(c, 'chase');
    await walk(c, [[-54.0, 0, -17.2], 's32_headphones']);
    await T('h32_headphones'); await settle(c, s);
    swapTo(c, 'luka');
    await walk(c, [[-44.0, 0, -18.6], [-37.4, 0, -18.4], 's32_bin_luka']);
    await T('h32_bin'); await settle(c, s);
    if (!c.state.flags.s32_bin) console.error('TWO 3.2: the bin did not move');
    await T('h32_stairs'); await settle(c, s);
    if (!c.state.flags.s32_l12) console.error('TWO 3.2: L12 not left');
  }

  // ---------------------------------------------------------- L21
  // The stair landing; the up-flight sealed; the PA; the server floor.
  CUTSCENES['3.2_l21'] = [
    { fade: 'out', dur: 0.6 },
    { do: (c) => { if (typeof AR !== 'undefined') AR.clear(); S32.floor = 'l21'; } },
    flr((c, S) => { S.dress('l21'); S.lamp('off'); }),
    { env: 'l21' },
    { prop: 'landing21', fn: (o) => o.userData.door(0) },
    put('luka', [15.3, 0, -17.6, -2.4]), put('chase', [16.2, 0, -17.4, -2.6]), put('chase40', [16.6, 0, -18.0, -2.3]),
    A32('l21_landing_wide', { push: 0.5, dur: 6 }),
    { fade: 'in', dur: 0.6 },
    { move: 'luka', to: 's32_l21_land_luka', nowait: true }, { move: 'chase40', to: 's32_l21_land_c40', nowait: true }, { move: 'chase', to: 's32_l21_land_chase' },
    // The stairwell up is sealed.
    { face: 'chase', to: [15.8, 0, -21.2], dur: 0.4 },
    A32('shutter', { push: 0.12, dur: 4 }),
    { prop: 'landing21', fn: (o) => o.userData.shutter.pulse() },
    { wait: 1.8 },
    // The Manager on the PA. L21:
    ...pa(21, 'Go home. ^ You\'re not safe here.', A32('pa21', { push: 0.1, dur: 6 })),
    { do: (c) => closeAway(c, 'chase40', 'luka', { dist: 1.0, fov: 38, push: 0.05, dur: 4 }) },
    { wait: 1.0 },
    // the door to the server floor: row after row of humming racks, cleaning drones polishing the glass
    { prop: 'landing21', fn: (o) => o.userData.door(1) },
    put('luka', [12.4, 0, -20.0, -H]), put('chase', [12.6, 0, -19.2, -1.9]), put('chase40', [12.7, 0, -20.8, -1.3]),
    A32('l21_reveal', { push: 1.6, dur: 6 }),
    { wait: 3.2 },
    { flag: 's32_l21' },
  ];
  function l21Play(c) {
    S32.floor = 'l21';
    const S = FLR(), f = c.state.flags;
    swapTo(c, 'chase40');
    c.flow.swap = true; c.flow.setFollow(true);
    if (typeof AR !== 'undefined') { AR.clear(); for (const a of (S && S.ar && S.ar.l21) || []) AR.add(a); }
    if (typeof DRONES !== 'undefined') { DRONES.clear(); if (S && S.spawnDrones) S.spawnDrones('l21'); }
    if (typeof stealth !== 'undefined') stealth.begin({
      escortAfter: 1.6, forgetAfter: 2,
      checkpoints: [
        { id: 'l21_e', box: [8.0, -37.0, 17.6, -15.4], at: L21_CP },
        { id: 'l21_w', box: [-14.0, -37.0, -10.0, -15.4], at: { luka: 's32_cp_l21_w', chase: [-12.8, 0, -28.4, PI], chase40: [-11.2, 0, -28.4, PI] } },
      ],
    });
    objective21(c);
    if (f.s32_hacked && !f.s32_valves) valvesPair(c);
  }
  function objective21(c) {
    const f = c.state.flags;
    objective(!f.s32_port ? 'Find the oldest port.' : !f.s32_wired ? 'Make it fit.' : !f.s32_hacked ? 'Hack the hatch.' : !f.s32_valves ? 'Turn both cooling valves.' : 'Up the hatch ladder to L30.');
  }
  function l21Hint(c) {
    const f = c.state.flags;
    if (!f.s32_port) toast(c, 'CHIP — Chase (2040) can see the old line.');
    else if (!f.s32_cord) toast(c, 'The tea point, by the stairs. Chase can make it fit.');
    else if (!f.s32_wired) toast(c, 'Chase, at the jack.');
    else if (!f.s32_hacked) toast(c, 'Luka, at the jack: plug in the brick phone.');
    else if (!f.s32_valves) toast(c, 'Two valves, one at each end of the floor. "Hold this" — and SWAP.');
  }
  // [the jack] a beige 1987 wall jack on an old copper line, hand-written label: JARVIS — 1987 — DO NOT UNPLUG.
  // The brick phone's 1987 plug doesn't fit the port's adapter.
  CUTSCENES['3.2_jack'] = [
    { do: () => { if (typeof DRONES !== 'undefined') DRONES.pause(true); } },
    put('chase', 's32_jack_chase'), put('luka', 's32_jack_luka'), put('chase40', [-11.7, 0, -22.4, -2.0]),
    { face: 'chase', to: [-14.0, 0, -23.4], dur: 0 }, { face: 'luka', to: [-14.0, 0, -23.4], dur: 0 }, { face: 'chase40', to: [-14.0, 0, -23.4], dur: 0 },
    flr((c, S) => S.lamp('jack')),
    A32('jack_wide', { push: 0.4, dur: 6 }),
    { wait: 1.6 },
    A32('jack', { push: 0.03, dur: 4, card: ['s32_jack'] }),
    { wait: 2.8 },
    // Luka tries the brick phone's plug: it doesn't fit
    put('chase', [-12.2, 0, -21.8, -2.4]),
    { move: 'luka', to: [-13.3, 0, -23.2], speed: 1.0 },
    { face: 'luka', to: [-14.0, 0, -23.4], dur: 0.2 },
    { do: (c) => { const a = act(c, 'luka'); if (a) { a.rig.show('brick', true); a.play('kneel'); } } },
    A32('jack_wide', { push: 0.2, dur: 4, fov: 38 }),
    { wait: 1.2 },
    { sfx: 'clunk', vol: 0.5, rate: 1.3 },
    { wait: 0.5 },
    { sfx: 'clunk', vol: 0.45, rate: 1.5 },
    { wait: 0.8 },
    { do: (c) => { const a = act(c, 'luka'); if (a) { a.rig.show('brick', false); a.play('idle'); } } },
    { expr: [['chase', 'neutral']] },
    // Chase: the idea (the kettle cord at the tea point)
    { face: 'chase', to: [-10.0, 0, -24.4], dur: 0 },
    { act: [['chase', 'think']] },
    { do: (c) => closeAway(c, 'chase', 'luka', { dist: 1.0, fov: 36, push: 0.06, dur: 4, mag: 0.4 }) },
    { wait: 1.4 },
    A32('kettle_cord', { push: 0.04, dur: 3 }),
    { wait: 1.8 },
    { act: [['chase', 'idle']] },
    { flag: 's32_port' },
    { do: (c) => { objective21(c); if (typeof DRONES !== 'undefined') DRONES.pause(false); } },
    tick(),
    flr((c, S) => S.lamp('off')),
  ];
  // Make it fit (Chase): the kettle cord adapter (Wiring, the kettle variant)
  async function wire(c) {
    if (typeof DRONES !== 'undefined') DRONES.pause(true);
    const S = FLR(); if (S) S.lamp('jack');
    await c.runSteps([{ move: 'chase', to: 's32_jack_chase' }, { face: 'chase', to: [-14.0, 0, -23.4], dur: 0.2 }, { act: [['chase', 'kneel']] }]);
    const LINE = [say('chase', "Kettle cord. ^ It's always the kettle cord.")];
    const r = await c.flow.minigame('wiring', { variant: 'kettle', shot: A32('jack_wide', { push: 0.1, dur: 8 }), lines: { kettle: LINE } });
    if (c.flow.sceneId !== '3.2') return;
    if (r && r.skipped) await c.runSteps(LINE);
    const j = ud(c, 'jack'); if (j) j.state('adapter');
    c.state.flags.s32_wired = true;
    await c.playCutscene([
      { act: [['chase', 'idle']] },
      { place: 'chase', at: [-12.6, 0, -24.3, -1.2] },
      A32('jack_wide', { push: 0.25, dur: 4 }),
      { wait: 1.4 },
      tick(),
    ], { letterbox: false });
    objective21(c);
    if (typeof DRONES !== 'undefined') DRONES.pause(false);
    await c.cam.release(0.5);
  }
  // Hack the hatch (Luka): plug in the brick phone; the green 1987 terminal; the Hack (9.12)
  async function hack(c) {
    if (typeof DRONES !== 'undefined') DRONES.pause(true);
    const S = FLR(); if (S) S.lamp('jack');
    await c.runSteps([{ move: 'luka', to: 's32_jack_luka' }, { face: 'luka', to: [-14.0, 0, -23.4], dur: 0.2 }, { act: [['luka', 'kneel']] }]);
    await c.playCutscene([
      A32('brick_phone_floor', { push: 0.04, dur: 4 }),
      { do: (cc) => { const j = ud(cc, 'jack'); if (j) { j.state('phone'); j.screen('green'); } } },
      { sfx: 'clunk', vol: 0.45, rate: 1.2 },
      { wait: 1.6 },
    ], { letterbox: false });
    const r = await c.flow.minigame('hack', { green1987: true, time: '10:52', shot: A32('brick_phone_floor', { push: 0.02, dur: 8 }) });
    if (c.flow.sceneId !== '3.2') return;
    if (r && r.skipped && !(r.intro === false)) { /* the hack card plays the line itself; a skipped game still has had it */ }
    const j = ud(c, 'jack'); if (j) j.screen('white');
    c.state.flags.s32_hacked = true;
    // ACCESS: the hatch answers, but it's interlocked with the cooling
    await c.playCutscene([
      { act: [['luka', 'idle']] },
      A32('hatch21', { push: 0.2, dur: 5 }),
      { prop: 'hatch21', fn: (o) => o.userData.lock('red') },
      { wait: 0.6 },
      { popup: { style: 'safesense', title: 'SafeSense', icon: 'none', msg: 'MAINT HATCH · INTERLOCK: COOLING W + E', buttons: [], at: { pos: [-11.8, 2.6, -16.6] }, w: 300, dur: 3.2, ding: false } },
      { sfx: 'ss_chirp', vol: 0.4 },
      { wait: 2.6 },
      tick(),
    ], { letterbox: false });
    objective21(c);
    if (typeof DRONES !== 'undefined') DRONES.pause(false);
    valvesPair(c);
    await c.cam.release(0.5);
  }
  // The cooling interlock (two-person): Luka on one, Chase on the other (the AI holds when told)
  function valvesPair(c) {
    if (typeof pairSwitch === 'undefined' || c.state.flags.s32_valves) return;
    S32.valves = pairSwitch({
      id: 'valves', label: 'Turn', hold: 0.9, who: ['luka', 'chase'], auto: false,
      ends: [{ id: 'h32_valve_w', at: [-13.5, 0, -32.4], r: 1.0, stand: 's32_valve_w' }, { id: 'h32_valve_e', at: [12.5, 0, -32.4], r: 1.0, stand: 's32_valve_e' }],
      onDone: () => {
        const v = ud(c, 'valves'); if (v) { v.turn(0, 1); v.turn(1, 1); }
        c.state.flags.s32_valves = true;
        if (c.flow.sceneId === '3.2') c.hotspots.trigger('h32_fog');
      },
    });
  }
  // Fog rolls out of the vents. The hatch unlocks; the ladder drops.
  CUTSCENES['3.2_fog'] = [
    { do: () => { if (typeof DRONES !== 'undefined') DRONES.pause(true); } },
    cam([-12.3, 1.55, -34.1], [-13.5, 1.2, -32.4], 44, [[-12.35, 1.55, -34.0]], 3),
    { wait: 1.0 },
    cam([11.3, 1.55, -34.1], [12.5, 1.2, -32.4], 44, [[11.35, 1.55, -34.0]], 3),
    { wait: 1.0 },
    { prop: 'valves', fn: (o) => { o.userData.held(0, false); o.userData.held(1, false); } },
    A32('fog_wide', { push: 0.8, dur: 6 }),
    { prop: 'fog21', fn: (o) => o.userData.roll(1) },
    { env: 'l21_fog', dur: 3 },
    { sfx: 'steam', vol: 0.5 },
    { wait: 3.0 },
    A32('hatch21', { push: 0.25, dur: 6 }),
    flr((c, S) => S.lamp('hatch21')),
    { wait: 0.5 },
    { prop: 'hatch21', fn: (o) => o.userData.lock('green') },
    { wait: 0.7 },
    { prop: 'hatch21', fn: (o) => o.userData.open(1) },
    { wait: 0.8 },
    { prop: 'hatch21', fn: (o) => o.userData.ladder(1) },
    { wait: 1.8 },
    { do: (c) => { objective21(c); if (typeof DRONES !== 'undefined') DRONES.pause(false); } },
    tick(),
  ];
  async function autoL21(c) {
    const s = c.flow.sceneId, gone = () => c.flow.sceneId !== s, T = (id) => c.hotspots.trigger(id), f = c.state.flags;
    const TRAIL = [[10.5, 0, -27.6], [-4.7, 0, -27.6], [-4.7, 0, -31.6], [-12.0, 0, -31.6], [-12.0, 0, -23.4]];
    await T('h32_shutter'); await settle(c, s);
    await walk(c, [[12.0, 0, -18.6], [12.0, 0, -17.4]]);
    await T('h32_kettle'); await settle(c, s);
    // Chase (2040): the 'old' line on the map
    swapTo(c, 'chase40');
    await walk(c, [[10.5, 0, -20.6]]);
    if (typeof chip !== 'undefined') { chip.peek(1.6); await until(() => S32.barked || gone(), 4); }
    await walk(c, TRAIL);
    await walk(c, ['s32_jack_c40']);
    if (!f.s32_port) await T('h32_jack');
    await settle(c, s);
    // Chase: back to the tea point for the kettle cord, and back to the jack
    swapTo(c, 'chase');
    await walk(c, [...TRAIL].reverse().concat([[10.5, 0, -20.6], [11.4, 0, -18.4]]));
    await T('h32_cord'); await settle(c, s);
    await walk(c, [[10.5, 0, -20.6], ...TRAIL, 's32_jack_chase']);
    await T('h32_wire'); await settle(c, s);
    if (!f.s32_wired) console.error('TWO 3.2: not wired');
    swapTo(c, 'luka');
    await T('h32_hack'); await settle(c, s);
    if (!f.s32_hacked) console.error('TWO 3.2: not hacked');
    // the valves: one each end
    if (S32.valves && S32.valves.auto) S32.valves.auto();
    await until(() => !!f.s32_valves || gone(), 20); await settle(c, s);
    swapTo(c, 'luka');
    const l = act(c, 'luka'); if (l && Math.hypot(l.pos.x + 12, l.pos.z + 23) > 12) l.place([-12.0, 0, -29.0, PI]);
    await walk(c, [[-12.0, 0, -23.4], [-12.0, 0, -18.6], 's32_hatch']);
    await T('h32_hatch'); await settle(c, s);
  }

  // ---------------------------------------------------------- L21 -> L30
  // Up the hatch ladder to L30. [The Hangar] hundreds of Courtesy Drones docked in charging racks, rows of blue
  // lights, a few awake and patrolling. At the far end, a private lift: MANAGER ONLY.
  CUTSCENES['3.2_climb'] = [
    { do: () => { if (typeof DRONES !== 'undefined') { DRONES.clear(); } if (typeof AR !== 'undefined') AR.clear(); } },
    put('luka', 's32_hatch'), put('chase', [-13.4, 0, -19.6, 0.4]), put('chase40', [-13.0, 0, -20.4, 0.3]),
    { face: 'luka', to: PI, dur: 0 },
    A32('ladder21', { push: 0.3, dur: 5 }),
    { act: [['luka', 'climb']] },
    { do: (c) => { const a = act(c, 'luka'); if (!a) return; const y0 = a.pos.y; tween(c, 2.4, (k) => { a.pos.y = y0 + 2.4 * k; }); } },
    { wait: 1.6 },
    { fade: 'out', dur: 0.8 },
    { do: (c) => { const a = act(c, 'luka'); if (a) { a.pos.y = 0; a.play('idle'); } } },
    // L30
    { do: (c) => { S32.floor = 'l30'; } },
    flr((c, S) => { S.dress('l30'); S.lamp('lift30'); }),
    { env: 'l30' },
    { music: 'stealth', fade: 2.0 },
    { prop: 'hatch30', fn: (o) => o.userData.open(0) },
    put('luka', [36.2, 0, -16.6, PI]), put('chase', [36.2, 0, -16.6, PI]), put('chase40', [36.2, 0, -16.6, PI]),
    { do: (c) => { for (const id of ['luka', 'chase', 'chase40']) { const a = act(c, id); if (a) { a.pos.y = -1.6; } } } },
    A32('l30_hatch_up', { push: 0.25, dur: 6 }),
    { fade: 'in', dur: 0.6 },
    { wait: 0.4 },
    { prop: 'hatch30', fn: (o) => o.userData.open(1) },
    { wait: 1.0 },
    { do: (c) => climbOut(c, 'luka', 's32_l30_luka', 0) },
    { wait: 1.1 },
    { do: (c) => climbOut(c, 'chase', 's32_l30_chase', 0) },
    { wait: 1.0 },
    { do: (c) => climbOut(c, 'chase40', 's32_l30_c40', 0) },
    { wait: 1.4 },
    // [WIDE · the hangar]
    put('luka', [38.2, 0, -21.4, PI - 0.2]), put('chase', [37.4, 0, -21.0, PI - 0.1]), put('chase40', [38.9, 0, -20.9, PI - 0.3]),
    { do: (c) => { for (const id of ['luka', 'chase', 'chase40']) { const a = act(c, id); if (a) { a.pos.y = 0; a.play('idle'); } } } },
    A32('hangar_reveal', { push: 2.4, dur: 7 }),
    { wait: 4.0 },
    // The Manager on the PA. L30:
    put('luka', 's32_l30_luka'), put('chase', 's32_l30_chase'), put('chase40', 's32_l30_c40'),
    { act: [['luka', 'look_up'], ['chase', 'look_up'], ['chase40', 'look_up']] },
    ...pa(30, 'Chase. ^ Go home. ^ Please.', cam([37.0, 0.75, -21.4], [36.7, 2.35, -18.0], 54, [[37.0, 0.78, -21.2]], 7)),
    { act: [['luka', 'idle'], ['chase', 'idle'], ['chase40', 'idle']] },
    { expr: [['chase40', 'still']] },
    { face: 'chase40', to: [37.0, 0, -18.0], dur: 0 },
    { do: (c) => closeAway(c, 'chase40', 'luka', { dist: 1.0, fov: 36, push: 0.08, dur: 5 }) },
    { wait: 1.8 },
    { do: (c) => closeAway(c, 'chase', 'luka', { dist: 1.0, fov: 36, push: 0.06, dur: 4 }) },
    { wait: 1.4 },
    { expr: [['chase40', 'neutral']] },
    { flag: 's32_l30' },
  ];
  // out of the floor hatch: up the rungs (y -1.6 -> 0) and a step onto the floor
  function climbOut(c, id, to, delay) {
    const a = act(c, id);
    if (!a) return;
    if (sk(c)) { a.pos.y = 0; a.place(to); return; }
    a.play('climb');
    tween(c, 0.9, (k) => { a.pos.y = -1.6 * (1 - k); if (k >= 1) { a.play('idle'); a.moveTo(to); } });
  }
  const L30 = {
    cps: [
      { id: 'l30_a', box: [33.0, -37.0, 40.4, -13.0], at: { luka: 's32_cp_a', chase: [35.5, 0, -18.9, PI], chase40: [36.9, 0, -18.9, PI] } },
      { id: 'l30_l1', box: [40.4, -37.0, 47.0, -13.0], at: { luka: 's32_cp_l1', chase: [42.0, 0, -33.2, H], chase40: [41.9, 0, -34.4, H] } },
      { id: 'l30_l2', box: [47.0, -37.0, 53.0, -13.0], at: { luka: [48.6, 0, -33.6, PI], chase: [48.2, 0, -32.6, PI], chase40: [49.2, 0, -32.6, PI] } },
      { id: 'l30_c', box: [53.0, -37.0, 60.4, -13.0], at: { luka: 's32_cp_c', chase: [54.6, 0, -33.4, H], chase40: [55.4, 0, -33.4, H] } },
    ],
  };
  function l30Play(c) {
    S32.floor = 'l30'; S32.lure = null;
    const S = FLR();
    swapTo(c, 'luka');
    c.flow.swap = true; c.flow.setFollow(true);
    if (typeof AR !== 'undefined') {
      AR.clear();
      // the area signs, the sentinel's line and the doorman's arc (the patrolling drones draw their own routes)
      for (const a of (S && S.ar && S.ar.l30) || []) if (!/^ar_p_d30[abd]$/.test(a.id)) AR.add(a);
    }
    if (typeof DRONES !== 'undefined') { DRONES.clear(); if (S && S.spawnDrones) S.spawnDrones('l30'); }
    if (typeof stealth !== 'undefined') stealth.begin({
      escortAfter: 1.4, forgetAfter: 1.8, checkpoints: L30.cps,
      onRetry: () => { for (const n of ['s1', 'p1', 'p2']) { const u = ud(c, n); if (u) u.play(false); } S32.lure = null; },
    });
    objective('Get to the private lift.');
    toast(c, 'CHIP — Chase (2040) can see their patrol routes.');
  }
  function l30Hint(c) {
    const f = c.state.flags;
    if (!f.s32_m1) toast(c, 'Chase can lure the drones with a sample (the speaker on the rack). Luka can push the mobile rack.');
    else toast(c, 'A dropped phone near the lift: Chase can lure the doorman away.');
  }
  // Lures (Chase): play a sample through the wall speaker S1 or a dropped phone (P1 / P2)
  const LURE_AT = { s1: [40.3, 1.5, -31.0], p1: [45.4, 0.01, -15.6], p2: [55.0, 0.01, -22.0] };
  const LURE_K = { s1: { mul: 2.5, min: 10, r: 4.5 }, p1: { mul: 1.8, min: 8, r: 3.5 }, p2: { mul: 1.8, min: 9, r: 4.5 } };
  async function lure(c, where) {
    const a = act(c, 'chase'), at = LURE_AT[where], K = LURE_K[where];
    if (a) { a.face([at[0], 0, at[2]], sk(c) ? 0 : 0.25); a.play(where === 's1' ? 'type_phone' : 'kneel'); }
    const have = c.state.samples.filter((k) => SAMPLES[k]);
    const list = have.length ? have.slice() : ['radio'];
    const labels = list.map((k) => SAMPLES[k].label).concat(['Cancel']);
    const pick = Math.max(0, list.indexOf('laugh') >= 0 ? list.indexOf('laugh') : list.indexOf('alarm'));
    const i = await c.choose(labels, { test: pick });
    if (a) a.play('idle');
    if (!(i >= 0 && i < list.length) || c.flow.sceneId !== '3.2') return;
    const k = list[i], L0 = (SAMPLES[k] && SAMPLES[k].lure) || { r: 4, dur: 4 };
    const dur = Math.max(K.min, L0.dur * K.mul), r = Math.max(K.r, L0.r);
    const u = ud(c, where); if (u) u.play(true);
    const L = DRONES.lure(at, k, { r, dur });
    S32.lure = L;
    log('3.2 lure ' + where + ' ' + k + ' ' + L.n);
    Promise.resolve(L.done).then(() => { if (S32.lure === L) S32.lure = null; const v = world.prop(where); if (v) v.userData.play(false); });
  }
  // Cover (Luka): push the charging rack M1 along its rail, into the sentinel's line of sight
  async function pushM1(c) {
    await c.runSteps([{ move: 'luka', to: 'm1_push' }, { face: 'luka', to: H, dur: 0.2 }]);
    const m1 = ud(c, 'm1');
    const ok = await strengthHold({ who: 'luka', label: 'Push', dur: 3.0, at: [46.2, 1.0, -34.6], anim: 'push',
      onProgress: (k) => { if (m1) m1.push(0.15 * k); } });
    if (c.flow.sceneId !== '3.2') return;
    if (!ok) return;
    if (m1) m1.push(1);
    c.state.flags.s32_m1 = true;
    await c.runSteps([{ act: [['luka', 'push']] }, { move: 'luka', to: 'm1_done', speed: 1.8, face: false }, { act: [['luka', 'idle']] }]);
    if (typeof stealth !== 'undefined' && stealth.active) stealth.checkpoint();
  }
  async function autoL30(c) {
    const s = c.flow.sceneId, gone = () => c.flow.sceneId !== s, T = (id) => c.hotspots.trigger(id), f = c.state.flags;
    swapTo(c, 'chase40');
    if (typeof chip !== 'undefined') { chip.peek(1.4); await until(() => gone(), 2); }
    // Chase: the speaker on R1 (both lane drones go and look)
    swapTo(c, 'chase');
    await walk(c, [[36.4, 0, -24.0], [37.6, 0, -29.6], 's32_s1']);
    await T('h32_s1'); await settle(c, s);
    // Luka: across R1's north crossing into lane L1, and the rack
    swapTo(c, 'luka');
    await walk(c, [[39.6, 0, -33.8], [42.6, 0, -33.8], 'm1_push']);
    await T('h32_m1'); await settle(c, s);
    if (!f.s32_m1) console.error('TWO 3.2: M1 not pushed');
    // down lane L2 behind the rack, through R3's crossing, along R3's east face
    await walk(c, [[48.6, 0, -30.0], [48.6, 0, -26.2], [53.4, 0, -26.2], [54.3, 0, -25.0], [54.3, 0, -22.6]]);
    swapTo(c, 'chase');
    await T('h32_p2'); await settle(c, s);
    swapTo(c, 'luka');
    await walk(c, [[57.6, 0, -20.6], 's32_reader_luka']);
    await T('h32_lift'); await settle(c, s);
  }

  // ---------------------------------------------------------- the private lift: MANAGER ONLY; ROOF ACCESS — SANTA
  CUTSCENES['3.2_lift30'] = [
    { do: () => { if (typeof stealth !== 'undefined') stealth.end(); if (typeof DRONES !== 'undefined') DRONES.clear(); } },
    put('luka', 's32_reader_luka'), put('chase', [58.6, 0, -22.0, 1.2]), put('chase40', [58.6, 0, -18.4, 2.3]),
    { face: 'luka', to: [60.4, 0, -19.35], dur: 0 }, { face: 'chase40', to: [60.4, 0, -20.7], dur: 0 },
    A32('lift30_doors', { push: 0.5, dur: 6 }),
    { wait: 1.6 },
    // The private lift won't open for Nadia's lanyard: MANAGER ONLY.
    A32('lift_reader', { push: 0.03, dur: 3 }),
    { act: [['luka', 'give', { dur: 1.2, loop: false }]] },
    { wait: 0.6 },
    { prop: 'lift30', fn: (o) => { o.userData.reader('red'); o.userData.beep(); } },
    { sfx: 'sad_beep', vol: 0.45 },
    { wait: 1.2 },
    // A side panel: ROOF ACCESS — SANTA PHOTO 11:30 — AUTHORISED: SANTA. HR booked Santa for the roof.
    { move: 'chase', to: 's32_panel_chase' }, { face: 'chase', to: H, dur: 0.3 },
    A32('side_panel', { push: 0.04, dur: 4, card: ['s32_panel'] }),
    { wait: 2.6 },
    put('chase40', [58.0, 0, -23.4, 0.6]),
    { face: 'chase', to: 'luka', dur: 0 }, { face: 'luka', to: 'chase', dur: 0 },
    cam([56.5, 1.6, -20.85], [59.6, 1.45, -20.85], 50, [[56.8, 1.6, -20.85]], 6),
    { wait: 0.4 },
    say('chase', "…Santa's got roof access."),
    { do: (c) => closeOn(c, 'luka', { yaw: -0.55, dist: 1.0, fov: 36, push: 0.05, dur: 5 }) },
    glance('luka', 'chase', 0.8),
    { wait: 0.6 },
    say('luka', "Santa's got roof access."),
    // Santa steps up to the panel; it knows him
    { move: 'luka', to: [59.6, 0, -21.6] }, { face: 'luka', to: H, dur: 0.3 },
    A32('side_panel', { push: 0.03, dur: 3 }),
    { prop: 'lift30', fn: (o) => { o.userData.panel('recognised'); o.userData.reader('green'); o.userData.beep(); } },
    { sfx: 'chime_ready', vol: 0.45 },
    { wait: 1.4 },
    // The lift takes Santa (and his elves) to the roof.
    { do: () => log('3.2 the lift takes Santa and his elves to the roof') },
    A32('lift30_doors', { push: 0.3, dur: 5 }),
    { prop: 'lift30', fn: (o) => o.userData.doors(1) },
    { wait: 1.2 },
    { move: 'luka', to: 'car30_luka' },
    { move: 'chase', to: 'car30_chase', nowait: true }, { move: 'chase40', to: 'car30_c40' },
    { face: 'luka', to: -H, dur: 0.3 }, { face: 'chase', to: -H, dur: 0.3 }, { face: 'chase40', to: -H, dur: 0.3 },
    put('luka', 'car30_luka'), put('chase', 'car30_chase'), put('chase40', 'car30_c40'),
    { env: 'car30', dur: 0.6 },
    flr((c, S) => S.lamp('car30')),
    { music: null, fade: 1.6 },
    A32('car30', { push: 0.1, dur: 6 }),
    { prop: 'lift30', fn: (o) => o.userData.car.button(true) },
    { sfx: 'button_press', vol: 0.4 },
    { popup: { style: 'safesense', title: 'SafeSense', icon: 'none', msg: 'ROOF · Are you sure?', buttons: ['YES'], at: [0.5, 0.42], w: 260, ding: false }, wait: true },
    { prop: 'lift30', fn: (o) => o.userData.doors(0) },
    { do: (c) => c.world.prebuild('hq_roof') },
    { wait: 1.4 },
    { fade: 'out', dur: 1.0 },
    { do: () => { if (typeof DRONES !== 'undefined') DRONES.clear(); } },
  ];

  // ---------------------------------------------------------- the roof: Cutscene — "3.2_roof"
  CUTSCENES['3.2_roof'] = [
    { do: (c) => { const S = SETS.hq_roof; if (S && c.world.setId === 'hq_roof') { S.dress('storm32'); S.lamp('sleigh'); } } },
    { do: (c) => { for (const id of ['luka', 'chase', 'chase40']) { const a = act(c, id); if (a) a.rig.dress(c.state); } } },
    { do: () => { if (typeof hud !== 'undefined' && hud.quiet) hud.quiet('00:17:00'); state.quiet = '00:17:00'; } },
    put('luka', 's32r_car_luka'), put('chase', 's32r_car_chase'), put('chase40', 's32r_car_c40'),
    { face: 'luka', to: -H, dur: 0 }, { face: 'chase', to: -H, dur: 0 }, { face: 'chase40', to: -H, dur: 0 },
    { shot: 'SET', cam: 'roof_car' },
    { fade: 'in', dur: 0.6 },
    { wait: 0.6 },
    { sfx: 'lift_ding', vol: 0.45 },
    { prop: 'lift_doors', fn: (o) => o.userData.open(1) },
    { sfx: 'whoosh', vol: 0.5, rate: 0.6 },
    { wait: 1.2 },
    AR32('s32r_lift_open', { push: 0.3, dur: 5 }),
    { move: 'luka', to: 's32r_doorway' }, { move: 'luka', to: 's32r_out_luka', nowait: true },
    { move: 'chase40', to: 's32r_doorway' }, { move: 'chase40', to: 's32r_out_c40', nowait: true },
    { move: 'chase', to: 's32r_doorway' }, { move: 'chase', to: 's32r_out_chase', nowait: true },
    { wait: 1.0 },
    // [WIDE · the roof] Wind. The storm right overhead, black and green. The whole of Brisbane spread out: the river,
    // the Story Bridge, the Valley's dimmed neon below. A Santa sleigh photo set: a cardboard sleigh, a ring light,
    // nobody there.
    put('luka', 's32r_out_luka'), put('chase', 's32r_out_chase'), put('chase40', 's32r_out_c40'),
    cam([-5.0, 13.4, -37.6], [3.0, 0.0, -22.0], 50, [[-6.0, 9.5, -31.0], [6.0, -6.0, 6.0], 54], 6.0, { ease: undefined }),
    { do: (c) => { if (sk(c)) return; for (const [id, to] of [['luka', 's32r_hatch_luka'], ['chase', 's32r_chase'], ['chase40', 's32r_c40']]) { const a = act(c, id); if (a) a.moveTo(to); } } },
    { sfx: 'thunder', vol: 0.4 },
    { wait: 6.0 },
    // The countdown on the facade glows under their feet: QUIET IN 00:17:00.
    put('luka', 's32r_hatch_luka'), put('chase', 's32r_chase'), put('chase40', 's32r_c40'),
    { do: (c) => { const t = P(c, 'tower'), fc = t && t.getObjectByName('facade_countdown'); if (fc && fc.userData.set) { fc.userData.set(0, 17, 0); if (fc.userData.run) fc.userData.run(1); } } },
    cam([4.0, -3.0, 24.0], [6.5, -8.5, -11.0], 50, [[4.0, -2.6, 21.6]], 5),
    { wait: 3.6 },
    // [CLOSE · the maintenance hatch] Luka hauls it open. Below: dark.
    put('luka', [7.25, 0, -13.75, 0.75]),
    cam([10.0, 1.45, -13.1], [7.7, 0.6, -13.35], 50, [[9.9, 1.42, -13.12]], 5),
    { act: [['luka', 'lift_strain']] },
    { wait: 0.9 },
    { prop: 'maint_hatch', fn: (o) => o.userData.open(1) },
    { sfx: 'clunk', vol: 0.55, rate: 0.8 },
    { wait: 1.6 },
    { act: [['luka', 'idle']] },
    // LUKA (pulling off the Santa beard and the hat, and dropping them on the cardboard sleigh)
    put('luka', 's32r_drop'),
    { face: 'luka', to: [10.4, 0, -12.6], dur: 0 },
    AR32('s32r_drop_shot', { push: 0.1, dur: 6, tilt: 0.3, fov: 52 }),
    { wait: 0.4 },
    { act: [['luka', 's32_unmask', { dur: 1.6, loop: false }]] },
    { wait: 0.8 },
    { do: (c) => { const a = act(c, 'luka'); if (a) a.rig.show('santa', false); } },
    { flag: 'santa', value: false },
    { item: 'santa', remove: true },
    { wait: 0.8 },
    { act: [['luka', 'give', { dur: 1.2, loop: false }]] },
    { wait: 0.5 },
    { prop: 'sleigh', fn: (o) => o.userData.drop() },
    { sfx: 'cloth_swish', vol: 0.5 },
    { wait: 0.6 },
    { act: [['luka', 'idle']] }, { expr: [['luka', 'determined']] },
    { face: 'luka', to: [8.0, 0, -12.9], dur: 0 },
    { do: (c) => closeOn(c, 'luka', { yaw: 0.35, dist: 1.0, fov: 36, push: 0.06, dur: 4 }) },
    say('luka', 'Right.'),
    // down into the dark
    { flag: 's32_roof' },
    put('luka', 's32r_hatch_luka'), { face: 'luka', to: PI, dur: 0 },
    AR32('roof_hatch', { push: 0.1, dur: 4 }),
    { act: [['luka', 'climb']] },
    { do: (c) => { const a = act(c, 'luka'); if (!a) return; tween(c, 1.6, (k) => { a.pos.z = -13.95 + 0.9 * k; a.pos.y = -1.4 * k; }); } },
    { wait: 1.6 },
    { fade: 'out', dur: 1.0 },
  ];
})();
